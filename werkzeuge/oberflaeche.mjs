#!/usr/bin/env node
/**
 * Browser-Prüfung der Einzeldatei (P0.4; docs/ARCHITEKTUR.md „Prüfkette“).
 *
 *   node werkzeuge/oberflaeche.mjs [--szenario <name>] [--nur-desktop] [--datei <html>] [--szenarien <verzeichnis>]
 *
 * Lädt dist/mvg.html als file://-URL in Chromium (Playwright) und führt alle
 * tests/oberflaeche/*.szenario.mjs aus. Ein Szenario-Modul exportiert
 *   name: string, viewports?: Array<{ breite, hoehe }>, hash?: string (z. B. '#regie'),
 *   async lauf(seite, h)
 * (benannte Exporte oder ein Default-Objekt). `seite` ist eine Playwright-Page, `h` der Helfer unten.
 *
 * Je Szenario und Viewport (Vorgabe 1280×720, 1024×768, 400×800) prüft das Werkzeug außerdem:
 * keine console.error / pageerror, kein Netzzugriff, kein horizontales Scrollen, kein abgeschnittener
 * Text (sichtbares Element mit Text, overflow hidden/clip, scrollWidth > clientWidth + 1; Ausnahme nur
 * mit `data-pruef-erlaubt="abschneiden"` am Element oder einem Vorfahren) und legt Bildschirmfotos
 * unter tmp/oberflaeche/ ab.
 *
 * Beobachtet werden alle Fenster des Kontexts: das Hauptfenster, `h.zweitesFenster()` und jedes
 * Popup (z. B. die Leinwand über `window.open`), Etikett „[Fenster n]“.
 *
 * Browser: Playwright-Chromium → Chrome (channel) → Edge (channel) → in der Cloud
 * (CLAUDE_CODE_REMOTE=true) einmal `npx playwright install chromium` und erneut → sonst
 * „ÜBERSPRUNGEN: kein Browser – <Grund>“. Wo der Browser Pflicht ist (MVG_BROWSER_PFLICHT=1 oder
 * in der GitHub-Aktion, GITHUB_ACTIONS=true), ist „kein Browser“ ein Befund (Exitcode 1), kein Übersprung.
 *
 * Exitcodes: 0 = alles grün, 1 = Befunde, 3 = übersprungen (kein Browser).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { istHauptmodul } from './haupt.mjs';

export const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const STANDARD_VIEWPORTS = Object.freeze([
  { breite: 1280, hoehe: 720 },
  { breite: 1024, hoehe: 768 },
  { breite: 400, hoehe: 800 },
]);
export const BILDER = path.join(WURZEL, 'tmp', 'oberflaeche');
export const UEBERSPRUNGEN = 3;

/** Zeitlimit je Helfer-Schritt (Klick, Erwartung) in ms. */
const SCHRITT_MS = 5_000;
const LADEN_MS = 30_000;
const INSTALL_MS = 5 * 60_000;

/** @param {unknown} fehler */
function kurz(fehler) {
  const text = fehler instanceof Error ? fehler.message : String(fehler);
  return text.split('\n').filter((z) => z.trim() !== '').slice(0, 3).join(' | ');
}

/**
 * Einmal `npx playwright install chromium` (nur in der Cloud).
 * @returns {{ status: number | null, fehler: Error | null }}
 */
function installiereChromium() {
  const erg = spawnSync('npx playwright install chromium', { shell: true, stdio: 'inherit', timeout: INSTALL_MS, cwd: WURZEL });
  return { status: erg.status, fehler: erg.error ?? null };
}

/**
 * Ist der Browser hier Pflicht? Dann ist „kein Browser“ rot statt gelb.
 * @param {Record<string, string | undefined>} [umgebung]
 */
export function browserPflicht(umgebung = process.env) {
  return umgebung['MVG_BROWSER_PFLICHT'] === '1' || umgebung['GITHUB_ACTIONS'] === 'true';
}

/**
 * Sucht einen startbaren Browser. Liefert `{ browser, name }` oder `{ browser: null, grund }`.
 * `umgebung` und `installiere` sind nur für Tests austauschbar.
 * @param {{ umgebung?: Record<string, string | undefined>, installiere?: () => { status: number | null, fehler: Error | null } }} [optionen]
 * @returns {Promise<{ browser: import('playwright').Browser, name: string } | { browser: null, grund: string }>}
 */
export async function starteBrowser(optionen = {}) {
  const umgebung = optionen.umgebung ?? process.env;
  const installiere = optionen.installiere ?? installiereChromium;
  /** @type {Array<{ name: string, optionen: import('playwright').LaunchOptions }>} */
  const versuche = [
    { name: 'Playwright-Chromium', optionen: {} },
    { name: 'Chrome', optionen: { channel: 'chrome' } },
    { name: 'Edge', optionen: { channel: 'msedge' } },
  ];
  /** @type {string[]} */
  const gruende = [];
  for (const v of versuche) {
    try {
      return { browser: await chromium.launch({ headless: true, timeout: LADEN_MS, ...v.optionen }), name: v.name };
    } catch (fehler) {
      gruende.push(`${v.name}: ${kurz(fehler).slice(0, 200)}`);
    }
  }
  if (umgebung['CLAUDE_CODE_REMOTE'] === 'true') {
    console.log('oberflaeche: kein Browser gefunden – Cloud: einmal „npx playwright install chromium“');
    const install = installiere();
    if (install.status === 0 && install.fehler === null) {
      try {
        return { browser: await chromium.launch({ headless: true, timeout: LADEN_MS }), name: 'Playwright-Chromium (frisch installiert)' };
      } catch (fehler) {
        gruende.push(`nach Installation: ${kurz(fehler).slice(0, 200)}`);
      }
    } else {
      gruende.push(`Installation gescheitert (${install.fehler ? kurz(install.fehler) : `Exitcode ${install.status}`})`);
    }
  }
  return { browser: null, grund: gruende.join('; ') };
}

/**
 * @typedef {{ breite: number, hoehe: number }} Viewport
 * @typedef {{ name: string, datei: string, viewports: Viewport[], hash: string, lauf: (seite: import('playwright').Page, h: Helfer) => Promise<void> }} Szenario
 * @typedef {object} Helfer
 * @property {import('playwright').Page} seite
 * @property {string} url
 * @property {Viewport} viewport
 * @property {(selektor: string, fenster?: import('playwright').Page) => Promise<void>} klick
 * @property {(selektor: string, fenster?: import('playwright').Page) => Promise<import('playwright').Locator>} erwarte
 * @property {(selektor: string, fenster?: import('playwright').Page) => Promise<void>} erwarteNicht
 * @property {(taste: string, fenster?: import('playwright').Page) => Promise<void>} taste
 * @property {(name: string, fenster?: import('playwright').Page) => Promise<string>} bild
 * @property {(ms: number) => Promise<void>} warte
 * @property {(hash?: string) => Promise<import('playwright').Page>} zweitesFenster
 * @property {(text: string) => void} befund
 */

/**
 * Lädt alle Szenarien eines Verzeichnisses (sortiert nach Dateiname).
 * @param {string} verzeichnis
 * @returns {Promise<Szenario[]>}
 */
export async function ladeSzenarien(verzeichnis) {
  if (!existsSync(verzeichnis)) return [];
  const namen = (await readdir(verzeichnis)).filter((n) => n.endsWith('.szenario.mjs')).sort();
  /** @type {Szenario[]} */
  const liste = [];
  for (const datei of namen) {
    const modul = await import(pathToFileURL(path.join(verzeichnis, datei)).href);
    const s = modul.default && typeof modul.default === 'object' ? modul.default : modul;
    if (typeof s.lauf !== 'function') throw new Error(`${datei}: exportiert keine Funktion lauf(seite, h)`);
    const viewports = Array.isArray(s.viewports) && s.viewports.length > 0 ? s.viewports : [...STANDARD_VIEWPORTS];
    for (const v of viewports) {
      if (!Number.isInteger(v?.breite) || !Number.isInteger(v?.hoehe)) throw new Error(`${datei}: viewports braucht { breite, hoehe } als ganze Zahlen`);
    }
    liste.push({
      name: typeof s.name === 'string' && s.name ? s.name : datei.replace(/\.szenario\.mjs$/, ''),
      datei,
      viewports,
      hash: typeof s.hash === 'string' ? s.hash : '',
      lauf: s.lauf,
    });
  }
  return liste;
}

/**
 * Hängt die Beobachter für Konsole, Seitenfehler und Netz an eine Seite.
 * @param {import('playwright').Page} seite
 * @param {string[]} befunde
 * @param {string} etikett
 */
function beobachte(seite, befunde, etikett) {
  seite.on('console', (m) => {
    if (m.type() === 'error') befunde.push(`${etikett}console.error: ${m.text()}`);
  });
  seite.on('pageerror', (e) => befunde.push(`${etikett}pageerror: ${kurz(e)}`));
  seite.on('request', (r) => {
    const u = r.url();
    if (!/^(file|data|blob|about):/.test(u)) befunde.push(`${etikett}Netzzugriff: ${u}`);
  });
}

/** Läuft im Browser: sichtbare Elemente mit Text, deren Inhalt waagrecht abgeschnitten wird. */
function findeAbgeschnittenes() {
  /** @param {Element} el */
  const beschreibe = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += `#${el.id}`;
    const pruef = el.getAttribute('data-pruef');
    if (pruef) s += `[data-pruef="${pruef}"]`;
    else if (el.classList.length > 0) s += `.${[...el.classList].slice(0, 3).join('.')}`;
    return s;
  };
  /** @type {string[]} */
  const funde = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (!(el instanceof HTMLElement)) continue;
    const st = getComputedStyle(el);
    if (st.overflowX !== 'hidden' && st.overflowX !== 'clip') continue;
    if (st.display === 'none' || st.visibility !== 'visible') continue;
    if (el.closest('[data-pruef-erlaubt~="abschneiden"]')) continue;
    const r = el.getBoundingClientRect();
    // Nur-für-Screenreader-Muster (1 px, clip) sind absichtlich unsichtbar.
    if (r.width <= 2 || r.height <= 2) continue;
    if (st.clip && st.clip !== 'auto') continue;
    const text = (el.textContent ?? '').trim();
    if (text === '') continue;
    const eigenerText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim() !== '');
    const nurInline = [...el.children].every((k) => getComputedStyle(k).display.startsWith('inline'));
    if (!eigenerText && !nurInline) continue;
    if (el.scrollWidth > el.clientWidth + 1) {
      funde.push(`${beschreibe(el)} „${text.slice(0, 40)}${text.length > 40 ? '…' : ''}“ (scrollWidth ${el.scrollWidth} > clientWidth ${el.clientWidth})`);
    }
  }
  return funde;
}

/** @param {string} name */
function dateiname(name) {
  return name.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'bild';
}

/**
 * Führt ein Szenario in einem Viewport aus und liefert die Befunde.
 * @param {import('playwright').Browser} browser
 * @param {Szenario} szenario
 * @param {Viewport} viewport
 * @param {string} url
 * @param {string} [bilder]  Ordner für die Bildschirmfotos (Vorgabe BILDER)
 */
export async function fuehreAus(browser, szenario, viewport, url, bilder = BILDER) {
  /** @type {string[]} */
  const befunde = [];
  const vpName = `${viewport.breite}x${viewport.hoehe}`;
  const kontext = await browser.newContext({
    viewport: { width: viewport.breite, height: viewport.hoehe },
    deviceScaleFactor: 1,
    locale: 'de-DE',
    colorScheme: 'light',
  });
  // Jedes Fenster des Kontexts wird beobachtet – auch Popups aus window.open (Leinwand), die der
  // Helfer nicht selbst öffnet. Das erste Fenster ist das Hauptfenster (ohne Etikett).
  let fenster = 0;
  kontext.on('page', (p) => {
    fenster += 1;
    beobachte(p, befunde, fenster === 1 ? '' : `[Fenster ${fenster}] `);
  });
  try {
    const seite = await kontext.newPage();
    /** @param {import('playwright').Page | undefined} f */
    const auf = (f) => f ?? seite;
    /** @type {Helfer} */
    const h = {
      seite,
      url,
      viewport,
      async klick(selektor, f) {
        await auf(f).locator(selektor).first().click({ timeout: SCHRITT_MS });
      },
      async erwarte(selektor, f) {
        const l = auf(f).locator(selektor).first();
        try {
          await l.waitFor({ state: 'visible', timeout: SCHRITT_MS });
        } catch {
          throw new Error(`erwartet sichtbar: ${selektor}`);
        }
        return l;
      },
      async erwarteNicht(selektor, f) {
        const sichtbar = await auf(f).locator(selektor).filter({ visible: true }).count();
        if (sichtbar > 0) befunde.push(`darf nicht sichtbar sein: ${selektor} (${sichtbar}×)`);
      },
      async taste(taste, f) {
        await auf(f).keyboard.press(taste);
      },
      async bild(name, f) {
        const ziel = path.join(bilder, `${dateiname(szenario.name)}-${vpName}-${dateiname(name)}.png`);
        await auf(f).screenshot({ path: ziel, fullPage: true });
        return ziel;
      },
      async warte(ms) {
        await seite.waitForTimeout(ms);
      },
      async zweitesFenster(hash = '') {
        const zweite = await kontext.newPage();
        await zweite.goto(url.replace(/#.*$/, '') + hash, { waitUntil: 'load', timeout: LADEN_MS });
        return zweite;
      },
      befund(text) {
        befunde.push(text);
      },
    };

    await seite.goto(url + szenario.hash, { waitUntil: 'load', timeout: LADEN_MS });
    try {
      await szenario.lauf(seite, h);
    } catch (fehler) {
      befunde.push(`Szenario abgebrochen: ${kurz(fehler)}`);
    }
    // Späte Fehler (requestAnimationFrame, Zeitgeber) noch einsammeln.
    await seite.waitForTimeout(100);

    const breite = await seite.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    if (breite.sw > breite.cw) befunde.push(`horizontales Scrollen: scrollWidth ${breite.sw} > clientWidth ${breite.cw}`);
    for (const f of await seite.evaluate(findeAbgeschnittenes)) befunde.push(`abgeschnittener Text: ${f}`);
    await seite.screenshot({ path: path.join(bilder, `${dateiname(szenario.name)}-${vpName}.png`), fullPage: true });
  } catch (fehler) {
    befunde.push(`Lauf gescheitert: ${kurz(fehler)}`);
  } finally {
    await kontext.close();
  }
  return befunde;
}

/**
 * @param {string[]} argv
 */
function leseArgumente(argv) {
  /** @type {{ szenario?: string, nurDesktop: boolean, datei: string, szenarien: string }} */
  const a = {
    nurDesktop: false,
    datei: path.join(WURZEL, 'dist', 'mvg.html'),
    szenarien: path.join(WURZEL, 'tests', 'oberflaeche'),
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i] ?? '';
    const wert = () => {
      const w = argv[i + 1];
      if (!w) throw new Error(`${arg} braucht einen Wert`);
      i += 1;
      return w;
    };
    if (arg === '--nur-desktop') a.nurDesktop = true;
    else if (arg === '--szenario') a.szenario = wert();
    else if (arg === '--datei') a.datei = path.resolve(wert());
    else if (arg === '--szenarien') a.szenarien = path.resolve(wert());
    else throw new Error(`unbekannte Option ${arg} (erlaubt: --szenario <name>, --nur-desktop, --datei <html>, --szenarien <verzeichnis>)`);
  }
  return a;
}

/**
 * „Nur Desktop“: die Viewports ab 1280 px Breite, sonst der breiteste.
 * @param {Viewport[]} viewports
 */
function nurDesktop(viewports) {
  const breit = viewports.filter((v) => v.breite >= 1280);
  if (breit.length > 0) return breit;
  const breitester = [...viewports].sort((x, y) => y.breite - x.breite)[0];
  return breitester ? [breitester] : [];
}

async function hauptprogramm() {
  let a;
  try {
    a = leseArgumente(process.argv.slice(2));
  } catch (fehler) {
    console.error(`oberflaeche: ${kurz(fehler)}`);
    return 1;
  }
  const anzeige = path.relative(WURZEL, a.datei).split(path.sep).join('/');
  if (!existsSync(a.datei)) {
    console.error(`oberflaeche: ${anzeige} fehlt – bitte zuerst 'npm run bau'`);
    return 1;
  }
  let szenarien = await ladeSzenarien(a.szenarien);
  if (a.szenario) {
    const gesucht = a.szenario;
    szenarien = szenarien.filter((s) => s.name === gesucht || s.datei === gesucht || s.datei === `${gesucht}.szenario.mjs`);
    if (szenarien.length === 0) {
      console.error(`oberflaeche: kein Szenario „${gesucht}“ in ${path.relative(WURZEL, a.szenarien)}`);
      return 1;
    }
  }
  if (szenarien.length === 0) {
    console.error(`oberflaeche: keine Szenarien (*.szenario.mjs) in ${path.relative(WURZEL, a.szenarien)}`);
    return 1;
  }

  const start = await starteBrowser();
  if (!start.browser) {
    if (browserPflicht()) {
      console.log(`FEHLER: kein Browser, hier aber Pflicht (MVG_BROWSER_PFLICHT=1 bzw. GitHub-Aktion) – ${start.grund}`);
      return 1;
    }
    console.log(`ÜBERSPRUNGEN: kein Browser – ${start.grund}`);
    return UEBERSPRUNGEN;
  }
  const { browser } = start;
  await rm(BILDER, { recursive: true, force: true });
  await mkdir(BILDER, { recursive: true });
  const url = pathToFileURL(a.datei).href;
  console.log(`oberflaeche: ${start.name} ${browser.version()} · ${anzeige} · ${szenarien.length} Szenario${szenarien.length === 1 ? '' : 's'}`);

  let laeufe = 0;
  let roteLaeufe = 0;
  let befundZahl = 0;
  try {
    for (const s of szenarien) {
      for (const v of a.nurDesktop ? nurDesktop(s.viewports) : s.viewports) {
        laeufe += 1;
        const befunde = await fuehreAus(browser, s, v, url);
        const etikett = `${s.name} @ ${v.breite}×${v.hoehe}`;
        if (befunde.length === 0) console.log(`  ✓ ${etikett}`);
        else {
          roteLaeufe += 1;
          befundZahl += befunde.length;
          console.log(`  ✗ ${etikett}`);
          for (const b of befunde) console.log(`      - ${b}`);
        }
      }
    }
  } finally {
    await browser.close();
  }
  const bilder = path.relative(WURZEL, BILDER).split(path.sep).join('/');
  if (befundZahl > 0) {
    console.log(`oberflaeche: ${befundZahl} Befund${befundZahl === 1 ? '' : 'e'} in ${roteLaeufe} von ${laeufe} Läufen · Bilder in ${bilder}/`);
    return 1;
  }
  console.log(`oberflaeche: ${laeufe} Läufe grün · Bilder in ${bilder}/`);
  return 0;
}

/** Direkt aufgerufen (nicht importiert)? Auch über Links (werkzeuge/haupt.mjs). */
const istHaupt = istHauptmodul(import.meta.url);

if (istHaupt) process.exitCode = await hauptprogramm();
