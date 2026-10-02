#!/usr/bin/env node
/**
 * Bau des Webseitenordners `dist/` (P0.4, P16.13; O-42, O-47; docs/ARCHITEKTUR.md):
 *   index.html (Hauptseite, alles eingebettet), impressum.html, datenschutz.html, robots.txt, sitemap.xml,
 *   .htaccess (HTTPS, Sicherheitsköpfe) und vorschau.png (Vorschaubild für geteilte Links).
 *
 *   node werkzeuge/bau.mjs                 baut und schreibt dist/
 *   node werkzeuge/bau.mjs --pruefe        baut zweimal nach tmp/bau-pruefe/, verlangt Byte-Gleichheit
 *                                          und vergleicht mit dist/ (schreibt dist/ NICHT)
 *   node werkzeuge/bau.mjs --ziel <pfad>   andere Hauptseite (relativ zum Arbeitsverzeichnis), nur sie
 *
 * Ablauf der Hauptseite: Inhalte kompilieren (werkzeuge/inhalte.mjs) → Schriften erzeugen (werkzeuge/schriften.mjs)
 * → esbuild (JS aus src/main.ts als IIFE, CSS aus src/stil/index.css) → Einsetzen in die Hülle
 * werkzeuge/huelle.html → CSP mit dem sha256 des Inline-Skripts → Größenbudget → schreiben. Die übrigen
 * Dateien entstehen aus inhalte/rechtliches/*.md, werkzeuge/rechtliches.html und quellen/marke/.
 *
 * Als Modul: `import { baue } from './bau.mjs'`. Alle Optionen außer `ziel`/`pruefe` sind für Tests
 * und Fixturen da (andere Wurzel, andere Hülle, Vorstufen aus, kleines Budget).
 *
 * Deterministisch: kein Zeitstempel, kein Git-Hash, keine Pfade im Ergebnis; Zeilenenden werden auf
 * LF gebracht, damit Windows und Linux dieselben Bytes erzeugen.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import * as esbuild from 'esbuild';
import { Marked } from 'marked';
import { istHauptmodul } from './haupt.mjs';

/** Wurzel des Repos (eine Ebene über werkzeuge/). */
export const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Größenbudget in Bytes. Dezimal gezählt (4 000 000), damit „< 4 MB“ in jeder Lesart hält. */
export const BUDGET = 4_000_000;

/** Die Anker der Hülle; jeder steht dort genau einmal (Muster aus bm-track: `ersetzeEinmal`). */
export const ANKER = Object.freeze({
  csp: '<!--mvg:csp-->',
  stil: '<!--mvg:stil-->',
  skript: '<!--mvg:skript-->',
});

/** Freiwilliger Anker der Hülle für das Favicon */
export const FAVICON_ANKER = '<!--mvg:favicon-->';

export class BauFehler extends Error {
  /** @param {string} nachricht */
  constructor(nachricht) {
    super(nachricht);
    this.name = 'BauFehler';
  }
}

/**
 * Zählt die Vorkommen von `nadel` in `text` (ohne Überlappung).
 * @param {string} text
 * @param {string} nadel
 */
function zaehle(text, nadel) {
  let n = 0;
  for (let i = text.indexOf(nadel); i >= 0; i = text.indexOf(nadel, i + nadel.length)) n += 1;
  return n;
}

/**
 * Ersetzt `anker` in `text` genau einmal; fehlt er oder steht er mehrfach, ist das ein Fehler.
 * Der Ersatz läuft über einen Funktions-Callback, damit `$&`, `$1` usw. im Ersatztext nicht
 * still als Ersetzungsmuster gelesen werden.
 * @param {string} text
 * @param {string} anker
 * @param {string} ersatz
 */
export function ersetzeEinmal(text, anker, ersatz) {
  const anzahl = zaehle(text, anker);
  if (anzahl === 0) throw new BauFehler(`Anker ${anker} fehlt in der Hülle`);
  if (anzahl > 1) throw new BauFehler(`Anker ${anker} steht ${anzahl}-mal in der Hülle (genau einmal verlangt)`);
  return text.replace(anker, () => ersatz);
}

/**
 * Macht den Skripttext sicher für ein Inline-`<script>`: `</script` beendete das Element,
 * `<!--` schaltete den HTML-Parser in den „escaped“-Zustand. `\/` und `\!` sind in JS-Zeichenketten
 * bedeutungsgleich zu `/` und `!`. Zeilenenden werden LF, weil der HTML-Parser CR/CRLF ohnehin zu LF
 * macht – sonst stimmte der CSP-Hash nicht mit dem überein, was der Browser hasht.
 * @param {string} js
 */
export function entschaerfeSkript(js) {
  return js
    .replace(/\r\n?/g, () => '\n')
    .replace(/<\/(script)/gi, (_treffer, wort) => '<\\/' + wort)
    .replace(/<!--/g, () => '<\\!--');
}

/**
 * Dasselbe für den Stiltext: nur `</style` beendete das Element (`\/` ist in CSS gleich `/`).
 * @param {string} css
 */
export function entschaerfeStil(css) {
  return css.replace(/\r\n?/g, () => '\n').replace(/<\/(style)/gi, (_treffer, wort) => '<\\/' + wort);
}

/**
 * CSP-Quelle für ein Inline-Skript: sha256 über die UTF-8-Bytes des Elementinhalts.
 * @param {string} skriptText
 */
export function skriptHash(skriptText) {
  return 'sha256-' + createHash('sha256').update(skriptText, 'utf8').digest('base64');
}

/**
 * Die CSP-Zeile nach docs/ARCHITEKTUR.md. `frame-ancestors` wirkt nur als HTTP-Kopf und fehlt daher.
 * @param {string} skriptText
 */
export function cspZeile(skriptText) {
  return [
    "default-src 'none'",
    `script-src '${skriptHash(skriptText)}'`,
    "style-src 'unsafe-inline'",
    'img-src data: blob:',
    'font-src data:',
    "connect-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');
}

/**
 * Setzt Stil und Skript in die Hülle und ergänzt die CSP. Rein, ohne Plattenzugriff.
 * Alle drei Anker werden VOR dem Einsetzen gezählt und dann in einem Durchgang ersetzt: so kann ein
 * Anker-Text, der zufällig im eingesetzten CSS/JS steht, nichts mehr verwechseln.
 * @param {string} huelle
 * @param {string} cssRoh
 * @param {string} jsRoh
 * @param {string} [favicon]  data:-URL des Favicons (leer: kein Favicon)
 */
export function setzeZusammen(huelle, cssRoh, jsRoh, favicon = '') {
  let text = huelle.replace(/\r\n?/g, () => '\n');
  // Favicon (P16.13): freiwilliger Anker, höchstens einmal
  if (text.includes(FAVICON_ANKER)) text = ersetzeEinmal(text, FAVICON_ANKER, favicon === '' ? '' : `<link rel="icon" href="${favicon}">`);
  if (/<script\b/i.test(text)) {
    throw new BauFehler('Die Hülle enthält ein eigenes <script> – die CSP erlaubt nur das eine eingesetzte Skript');
  }
  for (const anker of Object.values(ANKER)) ersetzeEinmal(text, anker, '');
  const unbekannt = text.match(/<!--mvg:[^>]*-->/g)?.filter((a) => !Object.values(ANKER).includes(a)) ?? [];
  if (unbekannt.length > 0) throw new BauFehler(`Unbekannte Anker in der Hülle: ${unbekannt.join(', ')}`);

  const skript = entschaerfeSkript(jsRoh);
  const stil = entschaerfeStil(cssRoh);
  try {
    // Nur übersetzen, nicht ausführen: fängt eine Entschärfung, die die Syntax zerbrochen hätte.
    new vm.Script(skript, { filename: 'mvg.js' });
  } catch (fehler) {
    throw new BauFehler(`Das Skript ist nach dem Entschärfen kein gültiges JavaScript mehr: ${String(fehler)}`);
  }
  if (skript.includes('\u0000')) throw new BauFehler('Das Skript enthält ein NUL-Zeichen – der HTML-Parser ersetzte es');

  /** @type {Record<string, string>} */
  const ersatz = {
    [ANKER.csp]: `<meta http-equiv="Content-Security-Policy" content="${cspZeile(skript)}">`,
    [ANKER.stil]: `<style>${stil}</style>`,
    [ANKER.skript]: `<script>${skript}</script>`,
  };
  const muster = new RegExp(Object.values(ANKER).map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return { html: text.replace(muster, (treffer) => ersatz[treffer] ?? treffer), skript, stil };
}

/**
 * @param {unknown} fehler
 * @param {string} was
 */
function esbuildFehler(fehler, was) {
  const liste = /** @type {{ errors?: Array<{ text: string, location: { file: string, line: number, column: number } | null }> }} */ (fehler).errors;
  if (Array.isArray(liste) && liste.length > 0) {
    const zeilen = liste.map((f) => (f.location ? `${f.location.file}:${f.location.line}:${f.location.column + 1}: ${f.text}` : f.text));
    return new BauFehler(`esbuild (${was}) meldet ${liste.length} Fehler:\n  ${zeilen.join('\n  ')}`);
  }
  return new BauFehler(`esbuild (${was}): ${String(fehler)}`);
}

/**
 * @param {Array<{ text: string, location: { file: string, line: number } | null }>} liste
 * @param {string} was
 */
function esbuildWarnungen(liste, was) {
  return liste.map((w) => `esbuild (${was}): ${w.location ? `${w.location.file}:${w.location.line}: ` : ''}${w.text}`);
}

/**
 * @param {string} wurzel
 * @param {string} eintrag
 * @param {string} version
 */
async function baueSkript(wurzel, eintrag, version, inhalte = null) {
  if (!existsSync(path.resolve(wurzel, eintrag))) throw new BauFehler(`Einstieg ${eintrag} fehlt`);
  try {
    const erg = await esbuild.build({
      absWorkingDir: wurzel,
      entryPoints: [eintrag],
      bundle: true,
      write: false,
      outfile: 'mvg.js',
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      minify: true,
      charset: 'utf8',
      legalComments: 'none',
      sourcemap: false,
      loader: { '.svg': 'text' },
      define: { __MVG_VERSION__: JSON.stringify(version) },
      // Andere Inhalte (Entwurfs-Vorschau, L-29): die generierte inhalte.json wird umgeleitet
      plugins: inhalte === null ? [] : [{
        name: 'mvg-inhalte',
        setup(b) {
          b.onResolve({ filter: /generiert\/inhalte\.json$/ }, () => ({ path: inhalte }));
        },
      }],
      logLevel: 'silent',
    });
    return { text: erg.outputFiles[0]?.text ?? '', warnungen: esbuildWarnungen(erg.warnings, 'Skript') };
  } catch (fehler) {
    throw esbuildFehler(fehler, 'Skript');
  }
}

/**
 * @param {string} wurzel
 * @param {string} stil
 */
async function baueStil(wurzel, stil) {
  if (!existsSync(path.resolve(wurzel, stil))) throw new BauFehler(`Stil-Einstieg ${stil} fehlt`);
  try {
    const erg = await esbuild.build({
      absWorkingDir: wurzel,
      entryPoints: [stil],
      bundle: true,
      write: false,
      outfile: 'mvg.css',
      minify: true,
      charset: 'utf8',
      // Nur ausdrückliche Rechtshinweise (/*! … */, @license) bleiben stehen, z. B. ein OFL-Hinweis.
      legalComments: 'inline',
      sourcemap: false,
      target: ['chrome100', 'edge100', 'firefox100', 'safari15.4'],
      loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.svg': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl', '.webp': 'dataurl' },
      logLevel: 'silent',
    });
    return { text: erg.outputFiles[0]?.text ?? '', warnungen: esbuildWarnungen(erg.warnings, 'Stil') };
  } catch (fehler) {
    throw esbuildFehler(fehler, 'Stil');
  }
}

/**
 * Lädt ein Werkzeug-Modul der Wurzel und gibt die verlangte Funktion zurück.
 * @param {string} wurzel
 * @param {string} datei
 * @param {string} funktion
 * @param {string} posten
 */
async function ladeVorstufe(wurzel, datei, funktion, posten) {
  const voll = path.join(wurzel, datei);
  if (!existsSync(voll)) throw new BauFehler(`${datei} fehlt – ohne diese Vorstufe kein Bau (${posten})`);
  const modul = await import(pathToFileURL(voll).href);
  const fn = modul[funktion];
  if (typeof fn !== 'function') throw new BauFehler(`${datei} exportiert keine Funktion ${funktion}()`);
  return /** @type {(...args: unknown[]) => Promise<unknown>} */ (fn);
}

/**
 * Vorstufen: Inhalte kompilieren (src/generiert/inhalte.json), Schriften erzeugen.
 * @param {string} wurzel
 */
async function vorstufen(wurzel) {
  /** @type {string[]} */
  const warnungen = [];
  const kompiliere = await ladeVorstufe(wurzel, 'werkzeuge/inhalte.mjs', 'kompiliere', 'P0.5');
  const inhalte = /** @type {{ fehler?: unknown, warnungen?: unknown } | undefined} */ (await kompiliere({ pruefe: false }));
  const fehler = Array.isArray(inhalte?.fehler) ? inhalte.fehler.map(String) : [];
  if (Array.isArray(inhalte?.warnungen)) warnungen.push(...inhalte.warnungen.map((w) => `inhalte: ${String(w)}`));
  if (fehler.length > 0) throw new BauFehler(`inhalte meldet ${fehler.length} Fehler:\n  ${fehler.join('\n  ')}`);

  const erzeugeSchriften = await ladeVorstufe(wurzel, 'werkzeuge/schriften.mjs', 'erzeugeSchriften', 'P0.3');
  await erzeugeSchriften({});
  return warnungen;
}

/**
 * @param {number} bytes
 */
export function formatiereGroesse(bytes) {
  if (bytes < 10_000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1).replace('.', ',')} kB`;
  return `${(bytes / 1_000_000).toFixed(2).replace('.', ',')} MB`;
}

/**
 * @typedef {object} BauOptionen
 * @property {string} [ziel]      Hauptseite (relativ zu `wurzel`), Vorgabe dist/index.html
 * @property {boolean} [pruefe]   zweimal bauen, Byte-Gleichheit verlangen, mit `ziel` vergleichen; schreibt `ziel` nicht
 * @property {string} [wurzel]    Basis für alle relativen Pfade, Vorgabe die Repo-Wurzel
 * @property {string} [eintrag]   JS-Einstieg, Vorgabe src/main.ts
 * @property {string} [stil]      CSS-Einstieg, Vorgabe src/stil/index.css
 * @property {string} [huelle]    HTML-Hülle, Vorgabe werkzeuge/huelle.html
 * @property {boolean} [mitVorstufen]  Inhalte und Schriften vorher erzeugen (Vorgabe true)
 * @property {number} [budget]    Größenbudget in Bytes, Vorgabe BUDGET
 * @property {string} [version]   Wert für __MVG_VERSION__, Vorgabe aus package.json
 * @property {string} [zwischen]  Arbeitsverzeichnis für --pruefe, Vorgabe tmp/bau-pruefe
 * @property {string} [inhalte]   andere inhalte.json statt src/generiert/inhalte.json (Entwurfs-Vorschau)
 */

/**
 * @param {BauOptionen} optionen
 */
function vollOptionen(optionen) {
  const wurzel = path.resolve(optionen.wurzel ?? WURZEL);
  return {
    wurzel,
    ziel: path.resolve(wurzel, optionen.ziel ?? HAUPTSEITE),
    eintrag: optionen.eintrag ?? 'src/main.ts',
    stil: optionen.stil ?? 'src/stil/index.css',
    huelle: path.resolve(wurzel, optionen.huelle ?? 'werkzeuge/huelle.html'),
    mitVorstufen: optionen.mitVorstufen ?? true,
    budget: optionen.budget ?? BUDGET,
    version: optionen.version,
    zwischen: path.resolve(wurzel, optionen.zwischen ?? path.join(WURZEL, 'tmp', 'bau-pruefe')),
    inhalte: optionen.inhalte !== undefined ? path.resolve(wurzel, optionen.inhalte) : null,
  };
}

/** Hauptseite im Webseitenordner (O-42) */
export const HAUPTSEITE = 'dist/index.html';

/** Adresse der Internetseite (O-47); kanonisch klein geschrieben. */
export const ADRESSE = 'https://www.governancekompass.de/';

/** Die Beigaben des Webseitenordners neben der Hauptseite (O-42, O-47). */
export const BEIGABEN = Object.freeze(['impressum.html', 'datenschutz.html', 'robots.txt', 'sitemap.xml', '.htaccess', 'vorschau.png']);

/** Bildmarke als data:-URL (Favicon der Rechtsseiten; die Hauptseite trägt dieselbe in der Hülle). */
export function faviconUrl(svg) {
  const rein = svg.replace(/<title>[^<]*<\/title>/u, '').replace(/\s+(role|aria-label)="[^"]*"/gu, '').replace(/fill="currentColor"/u, 'fill="#0C1C33"').replace(/\r?\n/gu, '').trim();
  return `data:image/svg+xml,${encodeURIComponent(rein)}`;
}

/**
 * Impressum und Datenschutz (O-43) aus inhalte/rechtliches/*.md in die Vorlage werkzeuge/rechtliches.html; dazu
 * robots.txt, sitemap.xml, .htaccess und das Vorschaubild. Rein bis auf das Lesen der Quellen; deterministisch.
 * @param {string} wurzel
 * @returns {Promise<Map<string, Buffer>>}
 */
export async function baueBeigaben(wurzel) {
  /** @type {Map<string, Buffer>} */
  const aus = new Map();
  const vorlage = (await readFile(path.join(wurzel, 'werkzeuge', 'rechtliches.html'), 'utf8')).replace(/\r\n?/g, '\n');
  const bildmarke = await readFile(path.join(wurzel, 'quellen', 'marke', 'logo-bm-bildmarke.svg'), 'utf8');
  const svgInline = bildmarke.replace(/<title>[^<]*<\/title>/u, '').replace(/\s+(role|aria-label|width|height)="[^"]*"/gu, '').replace('<svg ', '<svg aria-hidden="true" focusable="false" ').replace(/\r?\n/gu, '').trim();
  const marked = new Marked({ gfm: true, breaks: false, async: false });
  for (const name of ['impressum', 'datenschutz']) {
    const md = (await readFile(path.join(wurzel, 'inhalte', 'rechtliches', `${name}.md`), 'utf8')).replace(/<!--[\s\S]*?-->/gu, '').trim();
    if (/<(?!br>)[a-z]/iu.test(md)) throw new BauFehler(`inhalte/rechtliches/${name}.md enthält HTML – nur Markdown`);
    const titel = /^# (.+)$/mu.exec(md)?.[1] ?? name;
    // GFM verlinkt nackte „www.…“ mit http:// – auf der Seite nur verschlüsselt (R67)
    const html = String(marked.parse(md)).trim().replaceAll('href="http://', 'href="https://');
    let seite = vorlage;
    for (const [anker, wert] of [['<!--mvg:titel-->', titel], ['<!--mvg:inhalt-->', html], ['<!--mvg:bildmarke-->', svgInline], ['<!--mvg:favicon-->', faviconUrl(bildmarke)]]) {
      seite = ersetzeEinmal(seite, anker, wert);
    }
    if (/<!--mvg:/u.test(seite)) throw new BauFehler(`Unbekannter Anker in werkzeuge/rechtliches.html`);
    aus.set(`${name}.html`, Buffer.from(seite, 'utf8'));
  }
  aus.set('robots.txt', Buffer.from(`User-agent: *\nAllow: /\n\nSitemap: ${ADRESSE}sitemap.xml\n`, 'utf8'));
  aus.set('sitemap.xml', Buffer.from([
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...['', 'impressum.html', 'datenschutz.html'].map((s) => `  <url><loc>${ADRESSE}${s}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n'), 'utf8'));
  aus.set('.htaccess', Buffer.from((await readFile(path.join(wurzel, 'werkzeuge', 'htaccess.txt'), 'utf8')).replace(/\r\n?/g, '\n'), 'utf8'));
  const bild = path.join(wurzel, 'quellen', 'marke', 'vorschau.png');
  if (!existsSync(bild)) throw new BauFehler('quellen/marke/vorschau.png fehlt – node werkzeuge/vorschaubild.mjs');
  aus.set('vorschau.png', await readFile(bild));
  return aus;
}

/**
 * Baut die Einzeldatei in den Speicher. Schreibt nur, was die Vorstufen schreiben (src/generiert/).
 * @param {BauOptionen} [optionen]
 */
export async function baueText(optionen = {}) {
  const o = vollOptionen(optionen);
  const warnungen = o.mitVorstufen ? await vorstufen(o.wurzel) : [];
  const version = o.version ?? String(JSON.parse(await readFile(path.join(WURZEL, 'package.json'), 'utf8')).version);
  if (!existsSync(o.huelle)) throw new BauFehler(`Hülle ${path.relative(o.wurzel, o.huelle).split(path.sep).join('/')} fehlt`);
  const huelle = await readFile(o.huelle, 'utf8');
  const [skript, stil] = await Promise.all([baueSkript(o.wurzel, o.eintrag, version, o.inhalte), baueStil(o.wurzel, o.stil)]);
  warnungen.push(...skript.warnungen, ...stil.warnungen);
  const marke = path.join(o.wurzel, 'quellen', 'marke', 'logo-bm-bildmarke.svg');
  const favicon = existsSync(marke) ? faviconUrl(await readFile(marke, 'utf8')) : '';
  const { html, skript: skriptText } = setzeZusammen(huelle, stil.text, skript.text, favicon);
  const bytes = Buffer.byteLength(html, 'utf8');
  // O-29: kein „Whitepaper“ im Text der Datei (Eigenschaftsnamen im Code sind klein geschrieben und unsichtbar)
  const wort = html.match(/.{0,40}(?:Whitepaper|WHITEPAPER|White[ -]Paper).{0,40}/u);
  if (wort !== null) throw new BauFehler(`„Whitepaper“ im Text der Datei (O-29): „${wort[0]}“`);
  // O-33 (R49): der alte Arbeitstitel kommt nicht zurück
  const alt = html.match(/.{0,40}MVG interaktiv.{0,40}/u);
  if (alt !== null) throw new BauFehler(`alter Name „MVG interaktiv“ im Text der Datei (O-33): „${alt[0]}“`);
  if (bytes > o.budget) {
    throw new BauFehler(`Größenbudget überschritten: ${formatiereGroesse(bytes)} (${bytes} Bytes) > ${formatiereGroesse(o.budget)} (${o.budget} Bytes)`);
  }
  return {
    html,
    bytes,
    skriptHash: skriptHash(skriptText),
    sha256: createHash('sha256').update(html, 'utf8').digest('hex'),
    warnungen,
  };
}

/**
 * Baut und schreibt `ziel` – oder prüft mit `pruefe: true` (zweimal bauen, byte-gleich, `ziel` aktuell).
 * Wirft `BauFehler` bei jedem Befund.
 * @param {BauOptionen} [optionen]
 */
export async function baue(optionen = {}) {
  const o = vollOptionen(optionen);
  // Mit der Hauptseite im Ordner dist/ entstehen auch die Beigaben (nicht bei einem anderen Ziel oder einer anderen Wurzel)
  const mitBeigaben = optionen.ziel === undefined && optionen.wurzel === undefined;
  const ordner = path.dirname(o.ziel);
  if (!optionen.pruefe) {
    const erg = await baueText(optionen);
    await mkdir(ordner, { recursive: true });
    await writeFile(o.ziel, erg.html, 'utf8');
    if (mitBeigaben) for (const [name, inhalt] of await baueBeigaben(o.wurzel)) await writeFile(path.join(ordner, name), inhalt);
    return { ziel: o.ziel, bytes: erg.bytes, skriptHash: erg.skriptHash, sha256: erg.sha256, warnungen: erg.warnungen, geprueft: false, beigaben: mitBeigaben ? BEIGABEN.length : 0 };
  }

  const erster = await baueText(optionen);
  const zweiter = await baueText(optionen);
  await mkdir(o.zwischen, { recursive: true });
  await writeFile(path.join(o.zwischen, 'lauf-1.html'), erster.html, 'utf8');
  await writeFile(path.join(o.zwischen, 'lauf-2.html'), zweiter.html, 'utf8');
  if (erster.html !== zweiter.html) {
    let i = 0;
    while (i < erster.html.length && erster.html[i] === zweiter.html[i]) i += 1;
    throw new BauFehler(`Bau nicht deterministisch: zwei Läufe unterscheiden sich ab Zeichen ${i} (siehe ${path.relative(WURZEL, o.zwischen).split(path.sep).join('/')}/lauf-1.html und lauf-2.html)`);
  }
  const zielName = path.relative(WURZEL, o.ziel).split(path.sep).join('/');
  if (!existsSync(o.ziel)) throw new BauFehler(`${zielName} fehlt – bitte 'npm run bau' ausführen und das Ergebnis committen`);
  const vorhanden = await readFile(o.ziel);
  if (!vorhanden.equals(Buffer.from(erster.html, 'utf8'))) {
    throw new BauFehler(`${zielName} ist veraltet (weicht vom frischen Bau ab) – bitte 'npm run bau' ausführen und das Ergebnis committen`);
  }
  if (mitBeigaben) {
    const a = await baueBeigaben(o.wurzel);
    const b = await baueBeigaben(o.wurzel);
    for (const [name, inhalt] of a) {
      if (!inhalt.equals(b.get(name) ?? Buffer.alloc(0))) throw new BauFehler(`Beigabe ${name} nicht deterministisch`);
      const datei = path.join(ordner, name);
      if (!existsSync(datei) || !(await readFile(datei)).equals(inhalt)) throw new BauFehler(`dist/${name} fehlt oder ist veraltet – bitte 'npm run bau' ausführen und das Ergebnis committen`);
    }
  }
  return { ziel: o.ziel, bytes: erster.bytes, skriptHash: erster.skriptHash, sha256: erster.sha256, warnungen: erster.warnungen, geprueft: true, beigaben: mitBeigaben ? BEIGABEN.length : 0 };
}

/**
 * @param {string[]} argv
 */
function leseArgumente(argv) {
  /** @type {{ pruefe: boolean, ziel?: string }} */
  const a = { pruefe: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--pruefe') a.pruefe = true;
    else if (arg === '--ziel') {
      const wert = argv[i + 1];
      if (!wert) throw new BauFehler('--ziel braucht einen Pfad');
      a.ziel = path.resolve(process.cwd(), wert);
      i += 1;
    } else if (arg?.startsWith('--ziel=')) a.ziel = path.resolve(process.cwd(), arg.slice('--ziel='.length));
    else throw new BauFehler(`Unbekannte Option ${arg} (erlaubt: --pruefe, --ziel <pfad>)`);
  }
  return a;
}

async function hauptprogramm() {
  try {
    const a = leseArgumente(process.argv.slice(2));
    /** @type {BauOptionen} */
    const optionen = { pruefe: a.pruefe };
    if (a.ziel) optionen.ziel = a.ziel;
    melde(await baue(optionen));
  } catch (fehler) {
    const text = fehler instanceof BauFehler ? fehler.message : fehler instanceof Error ? (fehler.stack ?? fehler.message) : String(fehler);
    console.error(`bau: FEHLER – ${text}`);
    process.exitCode = 1;
  }
}

/** @param {Awaited<ReturnType<typeof baue>>} erg */
function melde(erg) {
  for (const w of erg.warnungen) console.log(`bau: Warnung – ${w}`);
  const name = path.relative(process.cwd(), erg.ziel).split(path.sep).join('/');
  const anteil = Math.round((erg.bytes / BUDGET) * 100);
  if (erg.geprueft) {
    console.log(`bau --pruefe: zweimal gebaut, byte-gleich und identisch mit ${name}${erg.beigaben > 0 ? ` und ${erg.beigaben} Beigaben` : ''} – ${formatiereGroesse(erg.bytes)} (${anteil} % des Budgets), sha256 ${erg.sha256.slice(0, 16)}`);
  } else {
    console.log(`bau: ${name}${erg.beigaben > 0 ? ` und ${erg.beigaben} Beigaben` : ''} geschrieben – ${formatiereGroesse(erg.bytes)} (${anteil} % des Budgets), sha256 ${erg.sha256.slice(0, 16)}`);
  }
  if (anteil >= 90) console.log(`bau: Warnung – ${anteil} % des Größenbudgets belegt`);
}

/** Direkt aufgerufen (nicht importiert)? Auch über Links (werkzeuge/haupt.mjs). */
const istHaupt = istHauptmodul(import.meta.url);

if (istHaupt) await hauptprogramm();
