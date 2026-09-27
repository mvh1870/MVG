#!/usr/bin/env node
/**
 * Prüfkette `npm run pruefe` (P0.4; docs/ARCHITEKTUR.md „Prüfkette“).
 *
 *   node werkzeuge/kette.mjs [--ohne-oberflaeche] [--voll] [--nur <schritt>[,<schritt>…]]
 *   (--voll: Browserprüfung mit allen Rollen und Größen; ohne: schneller Satz vor jedem Commit, L-44)
 *
 * Schritte in fester Reihenfolge: inhalte → typen → test → begriffe → bau → oberflaeche.
 * `inhalte` steht vorn, weil `typen` und `test` die erzeugte src/generiert/inhalte.json lesen und
 * src/generiert/ nicht im Repo liegt: Auf einem frischen Checkout (CI, Cloud) wären sie sonst rot,
 * auf einem alten Rechner prüften sie einen veralteten Stand. inhalte.mjs schreibt die Datei auch
 * dann, wenn die Prüfung Fehler meldet – `typen` und `test` laufen also trotzdem.
 * Die Kette bricht beim ersten Rot NICHT ab: jeder Schritt läuft, nur `oberflaeche` entfällt, wenn
 * `bau` rot ist (sie prüfte sonst eine veraltete oder fehlende Datei). Jede Ausgabe wird live
 * durchgereicht und unter tmp/kette/<schritt>.txt mitgeschnitten; am Ende steht eine Tabelle
 * (auch in tmp/kette/ergebnis.txt).
 *
 * Ergebnis je Schritt: ✓ grün · ✗ rot · ⚠ übersprungen (nur `oberflaeche` mit Exitcode 3: kein Browser)
 * · – nicht gelaufen. Exitcode 1, sobald ein Schritt rot ist; sonst 0 (auch wenn nur ⚠).
 *
 * Commit-Regel (CLAUDE.md): `npm run pruefe > tmp/kette.txt 2>&1`, nie in eine Rohrleitung.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { istHauptmodul } from './haupt.mjs';

export const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MITSCHNITT = path.join(WURZEL, 'tmp', 'kette');
/** Zeitlimit je Schritt; ein hängender Schritt ist ein Befund, kein Stillstand. */
export const ZEITLIMIT_MS = 20 * 60_000;

/**
 * @typedef {object} Schritt
 * @property {string} name
 * @property {string} anzeige      Befehl, wie er in der Ausgabe erscheint
 * @property {string} befehl       ausführbare Datei (oder ganze Zeile mit `shell: true`)
 * @property {string[]} argumente
 * @property {boolean} [shell]
 * @property {string} [braucht]    Name eines früheren Schritts; ist der rot, läuft dieser nicht
 * @property {number} [gelbBei]    Exitcode, der ⚠ statt ✗ bedeutet
 * @property {string} [datei]      Werkzeug-Datei (relativ zur Wurzel); fehlt sie, ist der Schritt rot
 * @typedef {{ name: string, zeichen: '✓' | '✗' | '⚠' | '–', dauerMs: number | null, hinweis: string }} Ergebnis
 * @typedef {{ ohneOberflaeche?: boolean, nur?: string[] | null, mitschnitt?: string, still?: boolean, zeitlimitMs?: number, wurzel?: string }} LaufOptionen
 */

/** Die Schritte der Kette in ihrer Reihenfolge. @returns {Schritt[]} */
export function schritte() {
  const node = process.execPath;
  const tsc = path.join(WURZEL, 'node_modules', 'typescript', 'bin', 'tsc');
  return [
    { name: 'inhalte', anzeige: 'node werkzeuge/inhalte.mjs --pruefe', befehl: node, argumente: ['werkzeuge/inhalte.mjs', '--pruefe'], datei: 'werkzeuge/inhalte.mjs' },
    existsSync(tsc)
      ? { name: 'typen', anzeige: 'tsc --noEmit -p tsconfig.json', befehl: node, argumente: [tsc, '--noEmit', '-p', 'tsconfig.json'] }
      : { name: 'typen', anzeige: 'npx tsc --noEmit -p tsconfig.json', befehl: 'npx tsc --noEmit -p tsconfig.json', argumente: [], shell: true },
    { name: 'test', anzeige: 'node --test --test-reporter=dot "tests/**/*.test.ts"', befehl: node, argumente: ['--test', '--test-reporter=dot', 'tests/**/*.test.ts'] },
    { name: 'begriffe', anzeige: 'node werkzeuge/begriffe.mjs', befehl: node, argumente: ['werkzeuge/begriffe.mjs'], datei: 'werkzeuge/begriffe.mjs' },
    { name: 'bau', anzeige: 'node werkzeuge/bau.mjs --pruefe', befehl: node, argumente: ['werkzeuge/bau.mjs', '--pruefe'], datei: 'werkzeuge/bau.mjs' },
    { name: 'oberflaeche', anzeige: 'node werkzeuge/oberflaeche.mjs', befehl: node, argumente: ['werkzeuge/oberflaeche.mjs'], datei: 'werkzeuge/oberflaeche.mjs', braucht: 'bau', gelbBei: 3 },
  ];
}

/**
 * Führt einen Schritt aus, reicht die Ausgabe (außer `still`) live durch und schneidet sie mit.
 * @param {Schritt} s
 * @param {{ wurzel: string, still: boolean, zeitlimitMs: number }} o
 * @returns {Promise<{ code: number | null, ausgabe: string, zeitlimit: boolean }>}
 */
function fuehreAus(s, o) {
  return new Promise((erledigt) => {
    /** @type {Buffer[]} */
    const teile = [];
    let zeitlimit = false;
    const kind = spawn(s.befehl, s.argumente, {
      cwd: o.wurzel,
      shell: s.shell ?? false,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const uhr = setTimeout(() => {
      zeitlimit = true;
      kind.kill();
    }, o.zeitlimitMs);
    kind.stdout.on('data', (/** @type {Buffer} */ d) => {
      teile.push(d);
      if (!o.still) process.stdout.write(d);
    });
    kind.stderr.on('data', (/** @type {Buffer} */ d) => {
      teile.push(d);
      if (!o.still) process.stderr.write(d);
    });
    kind.on('error', (fehler) => {
      teile.push(Buffer.from(`\nStart gescheitert: ${fehler.message}\n`));
    });
    kind.on('close', (code) => {
      clearTimeout(uhr);
      erledigt({ code, ausgabe: Buffer.concat(teile).toString('utf8'), zeitlimit });
    });
  });
}

/** @param {number} ms */
function dauer(ms) {
  return `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
}

/** Letzte aussagekräftige Zeile einer Ausgabe (für die Tabelle). @param {string} text */
function letzteZeile(text) {
  const zeilen = text.split(/\r?\n/).map((z) => z.trim()).filter((z) => z !== '');
  // Beim Testläufer sagt die erste ✖-Zeile (die Datei) mehr als das abschließende „test failed“.
  const zeile = zeilen.find((z) => z.startsWith('✖')) ?? zeilen.at(-1) ?? '';
  return zeile.length > 110 ? `${zeile.slice(0, 107)}…` : zeile;
}

/**
 * @param {Ergebnis[]} ergebnisse
 * @param {number} gesamtMs
 */
export function tabelle(ergebnisse, gesamtMs) {
  const breite = Math.max(8, ...ergebnisse.map((e) => e.name.length));
  const zeilen = [
    'Kette – Ergebnis',
    `  ${'Schritt'.padEnd(breite)}  Erg.  ${'Dauer'.padStart(8)}  Hinweis`,
    ...ergebnisse.map(
      (e) => `  ${e.name.padEnd(breite)}  ${e.zeichen}     ${(e.dauerMs === null ? '–' : dauer(e.dauerMs)).padStart(8)}  ${e.hinweis}`.trimEnd(),
    ),
  ];
  const rot = ergebnisse.filter((e) => e.zeichen === '✗').length;
  const gelb = ergebnisse.filter((e) => e.zeichen === '⚠').length;
  const stand = rot > 0 ? `✗ rot (${rot} Schritt${rot === 1 ? '' : 'e'} rot)` : gelb > 0 ? `✓ grün mit ${gelb} ⚠ (Grund in die Übergabe)` : '✓ grün';
  zeilen.push(`Gesamt: ${stand} · ${dauer(gesamtMs)}`);
  return zeilen.join('\n');
}

/**
 * Lässt eine Liste von Schritten laufen (nie Abbruch beim ersten Rot) und liefert Ergebnisse,
 * Tabelle und Exitcode.
 * @param {Schritt[]} liste
 * @param {LaufOptionen} [optionen]
 */
export async function laufe(liste, optionen = {}) {
  const o = {
    wurzel: optionen.wurzel ?? WURZEL,
    still: optionen.still ?? false,
    zeitlimitMs: optionen.zeitlimitMs ?? ZEITLIMIT_MS,
  };
  const mitschnitt = optionen.mitschnitt ?? MITSCHNITT;
  const nur = optionen.nur ?? null;
  /** @param {string} text */
  const sage = (text) => {
    if (!o.still) console.log(text);
  };
  await mkdir(mitschnitt, { recursive: true });
  const beginn = performance.now();
  /** @type {Ergebnis[]} */
  const ergebnisse = [];
  for (const s of liste) {
    if (nur && !nur.includes(s.name)) continue;
    if (s.name === 'oberflaeche' && optionen.ohneOberflaeche) {
      ergebnisse.push({ name: s.name, zeichen: '–', dauerMs: null, hinweis: 'ausgelassen (--ohne-oberflaeche)' });
      continue;
    }
    const vorher = s.braucht ? ergebnisse.find((e) => e.name === s.braucht) : undefined;
    if (vorher && vorher.zeichen === '✗') {
      ergebnisse.push({ name: s.name, zeichen: '–', dauerMs: null, hinweis: `nicht gelaufen (${s.braucht} rot)` });
      continue;
    }
    sage(`\n── ${s.name}: ${s.anzeige}`);
    if (s.datei && !existsSync(path.join(o.wurzel, s.datei))) {
      const hinweis = `${s.datei} fehlt`;
      sage(hinweis);
      await writeFile(path.join(mitschnitt, `${s.name}.txt`), `${hinweis}\n`, 'utf8');
      ergebnisse.push({ name: s.name, zeichen: '✗', dauerMs: 0, hinweis });
      continue;
    }
    const t0 = performance.now();
    const { code, ausgabe, zeitlimit } = await fuehreAus(s, o);
    const ms = performance.now() - t0;
    await writeFile(path.join(mitschnitt, `${s.name}.txt`), ausgabe, 'utf8');
    /** @type {Ergebnis['zeichen']} */
    let zeichen = code === 0 && !zeitlimit ? '✓' : '✗';
    if (!zeitlimit && s.gelbBei !== undefined && code === s.gelbBei) zeichen = '⚠';
    const hinweis = zeitlimit
      ? `Zeitlimit ${dauer(o.zeitlimitMs)} überschritten`
      : zeichen === '✓'
        ? ''
        : `${code === null ? 'abgebrochen' : `Exitcode ${code}`}: ${letzteZeile(ausgabe)}`;
    ergebnisse.push({ name: s.name, zeichen, dauerMs: ms, hinweis });
    sage(`── ${s.name} ${zeichen} ${dauer(ms)}`);
  }
  const text = tabelle(ergebnisse, performance.now() - beginn);
  await writeFile(path.join(mitschnitt, 'ergebnis.txt'), `${text}\n`, 'utf8');
  return { ergebnisse, text, code: ergebnisse.some((e) => e.zeichen === '✗') ? 1 : 0 };
}

/**
 * @param {string[]} argv
 * @param {string[]} bekannt
 */
function leseArgumente(argv, bekannt) {
  /** @type {{ ohneOberflaeche: boolean, nur: string[] | null }} */
  const a = { ohneOberflaeche: false, nur: null };
  // --voll: Browserprüfung mit allen Rollen und Größen (Phasenende, GitHub-Aktion; L-44) – über die Umgebung an oberflaeche
  if (argv.includes('--voll')) process.env['MVG_VOLL'] = '1';
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i] ?? '';
    if (arg === '--ohne-oberflaeche') a.ohneOberflaeche = true;
    else if (arg === '--voll') continue;
    else if (arg === '--nur' || arg.startsWith('--nur=')) {
      const wert = arg === '--nur' ? argv[(i += 1)] : arg.slice('--nur='.length);
      if (!wert) throw new Error('--nur braucht einen Schritt');
      const namen = wert.split(',').map((n) => n.trim()).filter((n) => n !== '');
      const falsch = namen.filter((n) => !bekannt.includes(n));
      if (falsch.length > 0) throw new Error(`unbekannter Schritt ${falsch.join(', ')} (bekannt: ${bekannt.join(', ')})`);
      a.nur = [...(a.nur ?? []), ...namen];
    } else throw new Error(`unbekannte Option ${arg} (erlaubt: --ohne-oberflaeche, --voll, --nur <schritt>)`);
  }
  return a;
}

async function hauptprogramm() {
  const alle = schritte();
  let a;
  try {
    a = leseArgumente(process.argv.slice(2), alle.map((s) => s.name));
  } catch (fehler) {
    console.error(`kette: ${fehler instanceof Error ? fehler.message : String(fehler)}`);
    return 1;
  }
  const { text, code } = await laufe(alle, { ohneOberflaeche: a.ohneOberflaeche, nur: a.nur });
  console.log(`\n${text}`);
  return code;
}

/** Direkt aufgerufen (nicht importiert)? Auch über Links (werkzeuge/haupt.mjs). */
const istHaupt = istHauptmodul(import.meta.url);

if (istHaupt) process.exitCode = await hauptprogramm();
