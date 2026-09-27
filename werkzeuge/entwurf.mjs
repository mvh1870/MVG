#!/usr/bin/env node
/**
 * Story-Entwurf (P1.4, L-20): prüft den vollständigen Entscheidungsgraph, ohne den spielbaren
 * Durchstich in `inhalte/` umzubauen.
 *
 * Baut unter tmp/entwurf-<pid>/ eine Wurzel aus `inhalte/` plus allen Dateien unter `entwurf/`
 * (gleicher Pfad = ersetzt, z. B. `entwurf/story/A1/pl.md` → `inhalte/story/A1/pl.md`), stellt
 * den Hauptpfad her (Prolog → A1, A3 → A4, B3 → B4, dazu der Express-Pfad; ohne die
 * Vergleichsstation des Durchstichs) und kompiliert mit `--pruefe` (Graph, Zitate, Begriffe …).
 *
 *   node werkzeuge/entwurf.mjs     Exitcode 1 bei Fehlern
 *
 * Mit P3/P5 wandern die Dateien aus `entwurf/` nach `inhalte/`; dann entfallen die Anpassungen.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { istHauptmodul } from './haupt.mjs';
import { WURZEL, STANDARD_WHITEPAPER, kompiliere } from './inhalte.mjs';

/** Anpassungen am Durchstich: [Datei relativ zu inhalte/, alt, neu]. Jede muss genau greifen. */
export const ANPASSUNGEN = [
  // Express-Pfad (E8, L-26): Interesse „express“ überspringt A1, A2, A4, A5, B1, B2, B4, B5
  ['story/prolog/station.md', 'weiter: A3   # Durchstich P0; ab P1: A1', 'weiter:\n  - ziel: A3\n    wenn: [interesse express]\n  - ziel: A1'],
  ['story/A3/station.md', 'weiter: A3-B3-vergleich   # Durchstich P0; ab P3: A4', 'weiter:\n  - ziel: A6\n    wenn: [interesse express]\n  - ziel: A4'],
  ['story/B3/station.md', 'ende: ja   # Durchstich P0: vorläufiges Ende; ab P5: weiter: B4', 'weiter:\n  - ziel: B6\n    wenn: [interesse express]\n  - ziel: B4'],
];

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
 * @param {{ wurzel?: string }} [optionen]
 * @returns {Promise<{ fehler: string[], warnungen: string[], inhalte: any, ueberlagert: string[] }>}
 */
export async function pruefeEntwurf(optionen = {}) {
  const wurzel = optionen.wurzel ?? WURZEL;
  // je Prozess ein eigener Ordner: parallele Läufe (mehrere Autoren) stören sich nicht
  const ziel = path.join(wurzel, 'tmp', `entwurf-${process.pid}`);
  rmSync(ziel, { recursive: true, force: true });
  mkdirSync(ziel, { recursive: true });
  cpSync(path.join(wurzel, 'inhalte'), path.join(ziel, 'inhalte'), { recursive: true });
  rmSync(path.join(ziel, 'inhalte', 'story', 'A3-B3-vergleich'), { recursive: true, force: true });
  /** @type {string[]} */
  const fehler = [];
  for (const [datei, alt, neu] of ANPASSUNGEN) {
    const voll = path.join(ziel, 'inhalte', datei);
    const text = readFileSync(voll, 'utf8');
    if (!text.includes(alt)) { fehler.push(`entwurf: Anpassung greift nicht in inhalte/${datei}: „${alt.trim()}“`); continue; }
    writeFileSync(voll, text.replace(alt, neu), 'utf8');
  }
  const ueberlagert = dateienUnter(path.join(wurzel, 'entwurf')).map((d) => d.replace(/\\/gu, '/'));
  for (const d of ueberlagert) {
    const nach = path.join(ziel, 'inhalte', d);
    mkdirSync(path.dirname(nach), { recursive: true });
    cpSync(path.join(wurzel, 'entwurf', d), nach);
  }
  const erg = await kompiliere({ pruefe: true, wurzel: ziel, whitepaperPfad: path.join(wurzel, STANDARD_WHITEPAPER), ziel: null });
  rmSync(ziel, { recursive: true, force: true });
  // Abdeckungskarte (entwurf/abdeckung.yaml) trägt jeden „whitepaper-bezug“ einer Station als Story-Bezug
  const ziele = erg.inhalte?.abdeckung?.ziele ?? {};
  for (const st of Object.values(erg.inhalte?.stationen ?? {})) {
    for (const id of /** @type {any} */ (st).whitepaper ?? []) {
      if (!(ziele[id]?.story ?? []).includes(/** @type {any} */ (st).id)) fehler.push(`entwurf: abdeckung.yaml – ${id} ohne Story-Bezug auf ${/** @type {any} */ (st).id} (steht in dessen whitepaper-bezug)`);
    }
  }
  return { fehler: [...fehler, ...erg.fehler], warnungen: erg.warnungen, inhalte: erg.inhalte, ueberlagert };
}

if (istHauptmodul(import.meta.url)) {
  const { fehler, warnungen, inhalte, ueberlagert } = await pruefeEntwurf();
  for (const w of warnungen) console.log(`Warnung  ${w}`);
  for (const f of fehler) console.log(`FEHLER   ${f}`);
  const st = Object.keys(inhalte?.stationen ?? {}).length;
  const sz = Object.values(inhalte?.stationen ?? {}).reduce((n, s) => n + Object.keys(/** @type {any} */ (s).szenen).length, 0);
  console.log(`entwurf: ${ueberlagert.length} Dateien aus entwurf/, ${st} Stationen, ${sz} Rollenszenen – ${fehler.length} Fehler, ${warnungen.length} Warnungen`);
  process.exitCode = fehler.length > 0 ? 1 : 0;
}
