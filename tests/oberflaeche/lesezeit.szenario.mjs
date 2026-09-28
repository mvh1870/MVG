// Lesezeit (P11.5, O-5): spielt den Hauptpfad einer Rolle mit „Weiter“ und der ersten Option durch und
// zählt die sichtbaren Wörter aller Textknoten (ohne Knöpfe, Tabellen, Grafiken, Screenreader-Texte, zugeklappte Teile)
// und die Klicks (Express ohne den optionalen Epilog, L-49); sichtbarer Text unter aria-hidden zählt mit. Lesezeit = Wörter / 200 je Minute + 2 s je Klick (L-61). Ergebnis nach
// tmp/lesezeit.json; über dem Ziel (Hauptpfad 35 min, Express 15 min) ist es ein Befund (seit P11.5c;
// MVG_LESEZEIT_PFLICHT=0 macht daraus nur einen Bericht).
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'lesezeit';
export const hash = '#start';
export const viewports = [{ breite: 1280, hoehe: 800 }];

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ZIEL = { haupt: 35, express: 15 };
const WPM = 200;
const SEK_JE_KLICK = 2;

/**
 * @param {import('playwright').Page} start
 * @param {string} rolle
 * @param {boolean} express
 */
async function spiele(start, rolle, express) {
  // je Lauf ein eigener Browser-Kontext: kein gespeicherter Stand aus dem vorigen Lauf (Weiterlesen, E9)
  const browser = start.context().browser();
  if (browser === null) throw new Error('kein Browser');
  const kontext = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'de-DE', reducedMotion: 'reduce' });
  const seite = await kontext.newPage();
  try {
    await seite.goto(start.url().replace(/#.*$/u, '#start'));
    return await spieleIn(seite, rolle, express);
  } finally {
    await kontext.close();
  }
}

/**
 * @param {import('playwright').Page} seite
 * @param {string} rolle
 * @param {boolean} express
 */
async function spieleIn(seite, rolle, express) {
  await seite.locator('[data-pruef="weg-story"]').click();
  const sichtbar = async (/** @type {string} */ s) => (await seite.locator(s).filter({ visible: true }).count()) > 0;
  const gesehen = new Set();
  /** @type {Record<string, number>} */
  const jeStation = {};
  let klicks = 0;
  let expressGewaehlt = false;
  let rolleGewaehlt = false;
  /** @type {{ station: string, n: number, t: string }[]} */
  const dump = [];
  /** wie die Schleife endet: am Epilog (Express), an gesperrtem „Weiter“ oder an der Rundengrenze */
  let schluss = 'grenze';
  let station = 'start';
  let vorEpilog = '';
  let leer = 0;
  for (let i = 0; i < 900; i++) {
    // Rolle genau einmal wählen (eine erneute Wahl setzt die Interessen zurück)
    if (!rolleGewaehlt && await sichtbar(`[data-pruef="rolle-${rolle}"]`)) {
      await seite.locator(`[data-pruef="rolle-${rolle}"]`).click(); klicks++; rolleGewaehlt = true; leer = 0;
      // die Rollenwahl führt selbst weiter: erst den nächsten Schritt abwarten, sonst überspringt ein
      // sofortiges „Weiter“ die Interessenwahl (Express)
      await seite.waitForTimeout(400);
      continue;
    }
    // Express genau einmal wählen (im Prolog); der Zustand steht danach in der Sitzung
    if (express && !expressGewaehlt && await sichtbar('[data-pruef="interesse-express"]')) {
      const knopf = seite.locator('[data-pruef="interesse-express"]').filter({ visible: true }).first();
      for (let versuch = 0; versuch < 3 && (await knopf.getAttribute('aria-pressed')) !== 'true'; versuch++) {
        await knopf.click(); klicks++;
        await seite.waitForTimeout(150);
      }
      expressGewaehlt = (await knopf.getAttribute('aria-pressed')) === 'true';
      if (!expressGewaehlt) throw new Error(`Express für ${rolle} nicht wählbar`);
    }
    const jetzt = (await seite.evaluate(() => location.hash)).replace('#story/', '') || 'start';
    if (jetzt !== station && jetzt === 'epilog') vorEpilog = station;
    station = jetzt;
    // Express lässt den Epilog aus (L-49): gemessen wird bis zum Ende der Geschichte
    if (express && station === 'epilog') { schluss = 'epilog'; break; }
    // Textknoten statt Elementliste (P11.3): jeder sichtbare Text zählt, gebündelt je Block (nächster
    // nicht-inline Vorfahr); ausgenommen wie in L-61: Knöpfe, Tabellen, Grafiken, Screenreader-Texte,
    // zugeklappte Teile, Rahmen (Seitenleiste, Karte, Instrumente, Fußleiste)
    // erst zählen, wenn Ein- und Ausblendungen fertig sind (die Deckkraft entscheidet mit, R3); endlose
    // Animationen (Puls) ausgenommen, höchstens 1,5 s
    await seite.evaluate(() => Promise.race([
      Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished.catch(() => null))),
      new Promise((r) => { setTimeout(r, 1500); }),
    ]));
    const teile = await seite.evaluate(() => {
      const wurzel = document.querySelector('main') ?? document.body;
      const aus = new Map();
      // sichtbarer Text unter aria-hidden (Vergleichskarten Welt A/B, Tagesmarken) zählt mit (P11.3 R2)
      // dekorative Zeichen unter aria-hidden (Tastenkürzel, Marken, Nummern) zählen nicht
      const ohne = 'aside,nav,.seitenleiste,[data-pruef=story-karte],[data-pruef=status],table,.instrumente,.fussleiste,button,details:not([open]) > :not(summary),[role=img],svg,.nur-sr,.kopf,.option-taste,.fragezeichen,.pruef-status,.nachweis-nr,.raci-marke';
      // unsichtbar über die Deckkraft (z. B. die ausgeblendete Welt A im Vergleich, R3): Produkt entlang der Vorfahren
      const deckkraft = (/** @type {Element} */ e) => {
        let d = 1;
        for (let x = /** @type {Element | null} */ (e); x !== null && d >= 0.05; x = x.parentElement) d *= Number(getComputedStyle(x).opacity);
        return d;
      };
      const gang = document.createTreeWalker(wurzel, NodeFilter.SHOW_TEXT);
      for (let n = gang.nextNode(); n !== null; n = gang.nextNode()) {
        const text = (n.textContent ?? '').replace(/\s+/gu, ' ').trim();
        const el = n.parentElement;
        if (text === '' || el === null || el.closest(ohne) !== null) continue;
        const stil = getComputedStyle(el);
        if (el.offsetParent === null && stil.position !== 'fixed') continue;
        if (stil.visibility === 'hidden' || stil.display === 'none' || deckkraft(el) < 0.05) continue;
        let block = el;
        while (block !== wurzel && block.parentElement !== null && getComputedStyle(block).display.startsWith('inline')) block = block.parentElement;
        if (!aus.has(block)) aus.set(block, []);
        aus.get(block).push(text);
      }
      return [...aus.values()].map((x) => x.join(' '));
    });
    for (const t of teile) {
      if (gesehen.has(t)) continue;
      gesehen.add(t);
      if (process.env['MVG_LESEZEIT_DUMP']) dump.push({ station, n: t.split(/\s+/u).length, t });
      jeStation[station] = (jeStation[station] ?? 0) + t.split(/\s+/u).length;
    }
    const optionen = seite.locator('[data-pruef^="option-"]').filter({ visible: true });
    if (await optionen.count() > 0 && await seite.locator('[data-pruef^="option-"][aria-pressed="true"]').count() === 0) { await optionen.first().click(); klicks++; leer = 0; await seite.waitForTimeout(60); continue; }
    if (await sichtbar('[data-pruef="szene-weiter"]')) { await seite.locator('[data-pruef="szene-weiter"]').filter({ visible: true }).first().click(); klicks++; leer = 0; await seite.waitForTimeout(60); continue; }
    const weiter = seite.locator('[data-pruef="weiter"]');
    if (await weiter.count() > 0 && await weiter.isEnabled()) { await weiter.click(); klicks++; leer = 0; await seite.waitForTimeout(60); continue; }
    // nichts bedienbar: unter Last (CI) ist die nächste Szene evtl. noch nicht bereit – bis 5 s warten,
    // erst dann gilt „Weiter“ als gesperrt (sonst endete der Pfad schon bei „#story“)
    if (++leer < 20) { await seite.waitForTimeout(250); continue; }
    schluss = 'gesperrt';
    break;
  }
  // der Pfad muss wirklich am Ende angekommen sein (sonst wäre eine hängende Story „kurz“): Express am
  // Übergang von einem Ende in den Epilog, der Hauptpfad im Epilog mit gesperrtem „Weiter“
  const letzte = express ? vorEpilog : station;
  // Hauptpfad: zusätzlich der letzte Schritt des Epilogs (nicht ein Hängen mitten darin)
  const letzterSchritt = await seite.evaluate(() => {
    const s = document.querySelector('.fortschritt-schritt[aria-current="step"]');
    return s !== null && s.nextElementSibling === null;
  });
  const amEnde = express ? schluss === 'epilog' && vorEpilog.startsWith('ende-') : schluss === 'gesperrt' && station === 'epilog' && letzterSchritt;
  const woerter = Object.values(jeStation).reduce((a, b) => a + b, 0);
  if (process.env['MVG_LESEZEIT_DUMP']) writeFileSync(`${process.env['MVG_LESEZEIT_DUMP']}-${rolle}${express ? '-express' : ''}.json`, JSON.stringify(dump));
  return { rolle, express, amEnde, letzte, schluss, woerter, klicks, minuten: Math.round((woerter / WPM + (klicks * SEK_JE_KLICK) / 60) * 10) / 10, jeStation };
}

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  await seite.emulateMedia({ reducedMotion: 'reduce' });
  const rollen = process.env['MVG_LESEZEIT_ROLLEN']?.split(',') ?? (h.voll ? ['gf', 'bauherr', 'pl', 'ps', 'planung', 'controlling'] : ['pl']);
  const ergebnisse = [];
  for (const rolle of rollen) {
    ergebnisse.push(await spiele(seite, rolle, false));
    ergebnisse.push(await spiele(seite, rolle, true));
  }
  // MVG_LESEZEIT_DATEI: eigene Ausgabe (parallele Messungen); MVG_LESEZEIT_ROLLEN: nur diese Rollen (Komma)
  const datei = process.env['MVG_LESEZEIT_DATEI'] ?? path.join(WURZEL, 'tmp', 'lesezeit.json');
  mkdirSync(path.dirname(datei), { recursive: true });
  writeFileSync(datei, `${JSON.stringify(ergebnisse, null, 1)}\n`);
  const pflicht = process.env['MVG_LESEZEIT_PFLICHT'] !== '0';
  for (const e of ergebnisse) {
    const ziel = e.express ? ZIEL.express : ZIEL.haupt;
    const zeile = `Lesezeit ${e.rolle}${e.express ? ' Express' : ''}: ${e.minuten} min (${e.woerter} Wörter, ${e.klicks} Klicks; Ziel ≤ ${ziel} min)`;
    console.log(`      ${zeile}`);
    if (pflicht && e.minuten > ziel) h.befund(zeile);
    if (!e.amEnde) h.befund(`Lesezeit ${e.rolle}${e.express ? ' Express' : ''}: Pfad endet bei „${e.letzte}“ (${e.schluss}) statt am Ende der Geschichte`);
  }
}
