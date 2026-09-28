#!/usr/bin/env node
/**
 * Bau der Einzeldatei `dist/mvg.html` (P0.4; docs/ARCHITEKTUR.md „Einzeldatei und Sicherheit“).
 *
 *   node werkzeuge/bau.mjs                 baut und schreibt dist/mvg.html
 *   node werkzeuge/bau.mjs --pruefe        baut zweimal nach tmp/bau-pruefe/, verlangt Byte-Gleichheit
 *                                          und vergleicht mit dist/mvg.html (schreibt dist/ NICHT)
 *   node werkzeuge/bau.mjs --ziel <pfad>   anderer Zielpfad (relativ zum Arbeitsverzeichnis)
 *
 * Ablauf: Inhalte kompilieren (werkzeuge/inhalte.mjs) → Schriften erzeugen (werkzeuge/schriften.mjs)
 * → esbuild (JS aus src/main.ts als IIFE, CSS aus src/stil/index.css) → Einsetzen in die Hülle
 * werkzeuge/huelle.html → CSP mit dem sha256 des Inline-Skripts → Größenbudget → schreiben.
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
 */
export function setzeZusammen(huelle, cssRoh, jsRoh) {
  const text = huelle.replace(/\r\n?/g, () => '\n');
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
 * Vorstufen: Inhalte kompilieren (src/generiert/inhalte.json), Hilfe übernehmen (hilfe.json), Schriften erzeugen.
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

  const baueHilfe = await ladeVorstufe(wurzel, 'werkzeuge/hilfe.mjs', 'baueHilfe', 'P13');
  const hilfe = /** @type {{ fehler: string[] }} */ (/** @type {unknown} */ (baueHilfe({ wurzel })));
  if (hilfe.fehler.length > 0) throw new BauFehler(`hilfe meldet ${hilfe.fehler.length} Fehler:\n  ${hilfe.fehler.join('\n  ')}`);

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
 * @property {string} [ziel]      Zieldatei (relativ zu `wurzel`), Vorgabe dist/mvg.html
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
 * @property {boolean} [kundenfassung]  ohne Regie-Material (L-7, P10.8); Vorgabe-Ziel dist/mvg-kunde.html
 */

/**
 * @param {BauOptionen} optionen
 */
function vollOptionen(optionen) {
  const wurzel = path.resolve(optionen.wurzel ?? WURZEL);
  return {
    wurzel,
    ziel: path.resolve(wurzel, optionen.ziel ?? (optionen.kundenfassung ? KUNDE_ZIEL : 'dist/mvg.html')),
    eintrag: optionen.eintrag ?? 'src/main.ts',
    stil: optionen.stil ?? 'src/stil/index.css',
    huelle: path.resolve(wurzel, optionen.huelle ?? 'werkzeuge/huelle.html'),
    mitVorstufen: optionen.mitVorstufen ?? true,
    budget: optionen.budget ?? BUDGET,
    version: optionen.version,
    zwischen: path.resolve(wurzel, optionen.zwischen ?? path.join(WURZEL, 'tmp', 'bau-pruefe')),
    inhalte: optionen.inhalte !== undefined ? path.resolve(wurzel, optionen.inhalte) : null,
    kundenfassung: optionen.kundenfassung === true,
  };
}

/** Zieldatei der Kundenfassung (P10.8) */
export const KUNDE_ZIEL = 'dist/mvg-kunde.html';

/**
 * Inhalte der Kundenfassung (L-7): dieselben Inhalte ohne Regie-Material (Sprechernotizen,
 * Leitfragen). Einwand-Karten sind öffentlich (L-54) und bleiben.
 * @param {string} quelle  generierte inhalte.json
 * @param {string} zwischen  Arbeitsordner
 * @returns {Promise<string>} Pfad der bereinigten Datei
 */
async function kundenInhalte(quelle, zwischen) {
  const daten = JSON.parse(await readFile(quelle, 'utf8'));
  daten.regie = {};
  await mkdir(zwischen, { recursive: true });
  const ziel = path.join(zwischen, 'inhalte-kunde.json');
  await writeFile(ziel, `${JSON.stringify(daten)}\n`, 'utf8');
  return ziel;
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
  const inhalte = o.kundenfassung
    ? await kundenInhalte(o.inhalte ?? path.join(o.wurzel, 'src', 'generiert', 'inhalte.json'), path.join(o.zwischen, `kunde-${process.pid}`))
    : o.inhalte;
  const [skript, stil] = await Promise.all([baueSkript(o.wurzel, o.eintrag, version, inhalte), baueStil(o.wurzel, o.stil)]);
  warnungen.push(...skript.warnungen, ...stil.warnungen);
  const { html, skript: skriptText } = setzeZusammen(huelle, stil.text, skript.text);
  const bytes = Buffer.byteLength(html, 'utf8');
  // O-29: kein „Whitepaper“ im Text der Datei (Eigenschaftsnamen im Code sind klein geschrieben und unsichtbar)
  const wort = html.match(/.{0,40}(?:Whitepaper|WHITEPAPER|White[ -]Paper).{0,40}/u);
  if (wort !== null) throw new BauFehler(`„Whitepaper“ im Text der Datei (O-29): „${wort[0]}“`);
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
  if (!optionen.pruefe) {
    const erg = await baueText(optionen);
    await mkdir(path.dirname(o.ziel), { recursive: true });
    await writeFile(o.ziel, erg.html, 'utf8');
    return { ziel: o.ziel, bytes: erg.bytes, skriptHash: erg.skriptHash, sha256: erg.sha256, warnungen: erg.warnungen, geprueft: false };
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
  return { ziel: o.ziel, bytes: erster.bytes, skriptHash: erster.skriptHash, sha256: erster.sha256, warnungen: erster.warnungen, geprueft: true };
}

/**
 * @param {string[]} argv
 */
function leseArgumente(argv) {
  /** @type {{ pruefe: boolean, ziel?: string, kundenfassung: boolean }} */
  const a = { pruefe: false, kundenfassung: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--pruefe') a.pruefe = true;
    else if (arg === '--kundenfassung') a.kundenfassung = true;
    else if (arg === '--ziel') {
      const wert = argv[i + 1];
      if (!wert) throw new BauFehler('--ziel braucht einen Pfad');
      a.ziel = path.resolve(process.cwd(), wert);
      i += 1;
    } else if (arg?.startsWith('--ziel=')) a.ziel = path.resolve(process.cwd(), arg.slice('--ziel='.length));
    else throw new BauFehler(`Unbekannte Option ${arg} (erlaubt: --pruefe, --kundenfassung, --ziel <pfad>)`);
  }
  return a;
}

async function hauptprogramm() {
  try {
    const a = leseArgumente(process.argv.slice(2));
    /** @type {BauOptionen} */
    const optionen = { pruefe: a.pruefe, kundenfassung: a.kundenfassung };
    if (a.ziel) optionen.ziel = a.ziel;
    // Ohne --ziel und ohne --kundenfassung: beide Dateien (die Kundenfassung bleibt so immer aktuell)
    const auftraege = a.ziel === undefined && !a.kundenfassung ? [optionen, { ...optionen, kundenfassung: true, mitVorstufen: false }] : [optionen];
    for (const auftrag of auftraege) melde(await baue(auftrag));
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
    console.log(`bau --pruefe: zweimal gebaut, byte-gleich und identisch mit ${name} – ${formatiereGroesse(erg.bytes)} (${anteil} % des Budgets), sha256 ${erg.sha256.slice(0, 16)}`);
  } else {
    console.log(`bau: ${name} geschrieben – ${formatiereGroesse(erg.bytes)} (${anteil} % des Budgets), sha256 ${erg.sha256.slice(0, 16)}`);
  }
  if (anteil >= 90) console.log(`bau: Warnung – ${anteil} % des Größenbudgets belegt`);
}

/** Direkt aufgerufen (nicht importiert)? Auch über Links (werkzeuge/haupt.mjs). */
const istHaupt = istHauptmodul(import.meta.url);

if (istHaupt) await hauptprogramm();
