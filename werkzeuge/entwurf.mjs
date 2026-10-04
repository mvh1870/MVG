#!/usr/bin/env node
/**
 * Inhalts-Entwurf (P1.4, L-20; seit r72 für die Story aus Kapiteln, L-232): prüft Entwürfe gegen den
 * veröffentlichten Stand, ohne `inhalte/` zu ändern.
 *
 * Baut unter tmp/entwurf-<pid>/ eine Wurzel aus `inhalte/` plus allen Dateien unter `entwurf/`
 * (gleicher Pfad = ersetzt, z. B. `entwurf/theorie/k03-begriffsrahmen.md` → `inhalte/theorie/k03-begriffsrahmen.md`
 * oder `entwurf/geschichte/s3-risiko.yaml` → `inhalte/geschichte/s3-risiko.yaml`), wendet die ANPASSUNGEN an
 * (derzeit keine) und kompiliert mit `--pruefe` (Story-Kapitel, Themen, Zitate, Begriffe, Abdeckung …).
 *
 *   node werkzeuge/entwurf.mjs         Exitcode 1 bei Fehlern
 *   node werkzeuge/entwurf.mjs --bau   zusätzlich die Vorschau tmp/mvg-entwurf.html
 *
 * Genutzt auch von werkzeuge/oberflaeche.mjs (Szenarien auf der Entwurfs-Vorschau, L-29). `entwurf/` ist leer bis
 * auf LIESMICH.md.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { istHauptmodul } from './haupt.mjs';
import { WURZEL, STANDARD_WHITEPAPER, kompiliere } from './inhalte.mjs';

/**
 * Anpassungen an `inhalte/` für einen Entwurf: [Datei relativ zu inhalte/, alt, neu]. Jede muss genau greifen.
 * Derzeit leer.
 * @type {Array<[string, string, string]>}
 */
export const ANPASSUNGEN = [];

/** @param {string} ordner @returns {string[]} */
function dateienUnter(ordner) {
  if (!existsSync(ordner)) return [];
  /** @type {string[]} */
  const aus = [];
  for (const n of readdirSync(ordner).sort()) {
    const voll = path.join(ordner, n);
    if (statSync(voll).isDirectory()) aus.push(...dateienUnter(voll).map((d) => path.join(n, d)));
    else aus.push(n);
  }
  return aus;
}

/**
 * @param {{ wurzel?: string, json?: string }} [optionen]  json: kompilierte Inhalte zusätzlich dorthin schreiben (absolut)
 * @returns {Promise<{ fehler: string[], warnungen: string[], inhalte: any, ueberlagert: string[] }>}
 */
export async function pruefeEntwurf(optionen = {}) {
  const wurzel = optionen.wurzel ?? WURZEL;
  // je Prozess ein eigener Ordner: parallele Läufe (mehrere Autoren) stören sich nicht
  const ziel = path.join(wurzel, 'tmp', `entwurf-${process.pid}`);
  rmSync(ziel, { recursive: true, force: true });
  mkdirSync(ziel, { recursive: true });
  cpSync(path.join(wurzel, 'inhalte'), path.join(ziel, 'inhalte'), { recursive: true });
  /** @type {string[]} */
  const fehler = [];
  for (const [datei, alt, neu] of ANPASSUNGEN) {
    const voll = path.join(ziel, 'inhalte', datei);
    const text = readFileSync(voll, 'utf8');
    if (!text.includes(alt)) { fehler.push(`entwurf: Anpassung greift nicht in inhalte/${datei}: „${alt.trim()}“`); continue; }
    writeFileSync(voll, text.replace(alt, neu), 'utf8');
  }
  // LIESMICH.md beschreibt nur den Ordner und wird nicht überlagert
  const ueberlagert = dateienUnter(path.join(wurzel, 'entwurf')).map((d) => d.replace(/\\/gu, '/')).filter((d) => d !== 'LIESMICH.md');
  for (const d of ueberlagert) {
    const nach = path.join(ziel, 'inhalte', d);
    mkdirSync(path.dirname(nach), { recursive: true });
    cpSync(path.join(wurzel, 'entwurf', d), nach);
  }
  const erg = await kompiliere({ pruefe: true, wurzel: ziel, whitepaperPfad: path.join(wurzel, STANDARD_WHITEPAPER), ziel: optionen.json ?? null });
  rmSync(ziel, { recursive: true, force: true });
  // Story-Bezüge der Abdeckungskarte prüft seit P5.10 der Kompilierer selbst (baueAbdeckung)
  return { fehler: [...fehler, ...erg.fehler], warnungen: erg.warnungen, inhalte: erg.inhalte, ueberlagert };
}

/** Pfad der Entwurfs-Vorschau (relativ zur Wurzel). */
export const VORSCHAU = 'tmp/mvg-entwurf.html';

/**
 * Baut die Vorschau aus dem überlagerten Stand (L-29). Die Schriften müssen schon erzeugt sein
 * (normaler Bau vorher). Wirft, wenn der Entwurf Fehler hat.
 */
export async function baueVorschau() {
  const json = path.join(WURZEL, 'tmp', 'entwurf-inhalte.json');
  const erg = await pruefeEntwurf({ json });
  if (erg.fehler.length > 0) throw new Error(`entwurf: ${erg.fehler.length} Fehler – keine Vorschau\n  ${erg.fehler.join('\n  ')}`);
  const { baue } = await import('./bau.mjs');
  await baue({ ziel: VORSCHAU, inhalte: json, mitVorstufen: false });
  return erg;
}

if (istHauptmodul(import.meta.url)) {
  // --bau: zusätzlich die Vorschau tmp/mvg-entwurf.html
  const bau = process.argv.includes('--bau');
  const { fehler, warnungen, inhalte, ueberlagert } = await pruefeEntwurf();
  if (bau && fehler.length === 0) {
    await baueVorschau();
    console.log(`entwurf: Vorschau ${VORSCHAU} gebaut`);
  }
  for (const w of warnungen) console.log(`Warnung  ${w}`);
  for (const f of fehler) console.log(`FEHLER   ${f}`);
  const th = Object.keys(inhalte?.theorie ?? {}).length;
  const ka = inhalte?.geschichte?.kapitel?.length ?? 0;
  console.log(`entwurf: ${ueberlagert.length} Dateien aus entwurf/, ${th} Themen, ${ka} Story-Kapitel – ${fehler.length} Fehler, ${warnungen.length} Warnungen`);
  process.exitCode = fehler.length > 0 ? 1 : 0;
}
