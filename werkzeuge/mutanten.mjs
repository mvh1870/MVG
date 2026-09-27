#!/usr/bin/env node
/**
 * Mutanten-Probe der Engine (P2.1/P2.6): verfälscht je eine Stelle in src/engine, lässt die
 * Engine-Tests laufen und erwartet ROT. Ein Mutant, der grün bleibt, ist ein Befund: die Tests
 * prüfen diese Regel nicht wirklich. Die Datei wird danach immer wiederhergestellt.
 *
 *   node werkzeuge/mutanten.mjs      → „n/n Mutanten rot“; Exitcode 1, wenn einer grün bleibt
 *
 * Läuft außerhalb der Kette (dauert je Mutant einige Sekunden).
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { istHauptmodul } from './haupt.mjs';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TESTS = ['tests/engine.test.ts', 'tests/engine-graph.test.ts', 'tests/engine-spur.test.ts', 'tests/story-graph.test.ts'];

/** [Datei, alt, neu, was] – `alt` muss genau einmal vorkommen. */
export const MUTANTEN = [
  ['src/engine/status.ts', 'export const SPUR_GRENZE = 1;', 'export const SPUR_GRENZE = 2;', 'Kappung des Spur-Deltas'],
  ['src/engine/status.ts', 'basis = mitDelta(wendeWirkung(null, st.statusStart), delta);', 'basis = wendeWirkung(null, st.statusStart);', 'Nachwirkung früherer Wahlen'],
  ['src/engine/status.ts', 'return jetzt === undefined ? weg : weg.slice(0, weg.indexOf(jetzt) + 1);', 'return [...verlauf];', 'Sprünge zählen einmal'],
  ['src/engine/status.ts', '  let s = vorher;\n  let basis', '  let s: Status | null = null;\n  let basis', 'Station ohne Startstand übernimmt den Stand (L-19)'],
  ['src/engine/bedingungen.ts', 'case \'interesse\': return z.interessen.includes(b.interesse);', 'case \'interesse\': return !z.interessen.includes(b.interesse);', 'Bedingung „interesse“'],
  ['src/engine/bedingungen.ts', 'return wahl !== undefined && b.optionen.includes(wahl);', 'return wahl !== undefined;', 'Bedingung „wahl“'],
  ['src/engine/graph.ts', '  if (st.ende) return null;\n', '', 'Ende hält die Geschichte an'],
  ['src/engine/aktionen.ts', "return z.freigeschaltet.weltB || st.schaltetFrei.includes('weltB');", 'return true;', 'Sperre für Welt B'],
  ['src/engine/speicher.ts', '(roh as { version?: unknown }).version !== ZUSTAND_VERSION', 'false', 'Versionsprüfung beim Weiterlesen'],
  ['src/engine/gedaechtnis.ts', 'const html = rb.texte[wahl.option.id];', "const html = rb.texte['A'];", 'Rückbezug passt zur früheren Wahl'],
];

function testsRot() {
  const erg = spawnSync(process.execPath, ['--test', '--test-reporter=dot', ...TESTS], { cwd: WURZEL, encoding: 'utf8' });
  return erg.status !== 0;
}

export function probe() {
  /** @type {{ was: string, datei: string, rot: boolean, fehler?: string }[]} */
  const ergebnisse = [];
  for (const [datei, alt, neu, was] of MUTANTEN) {
    const voll = path.join(WURZEL, datei);
    const original = readFileSync(voll, 'utf8');
    if (original.split(alt).length !== 2) {
      ergebnisse.push({ was, datei, rot: false, fehler: 'Stelle nicht (genau einmal) gefunden' });
      continue;
    }
    try {
      writeFileSync(voll, original.replace(alt, neu), 'utf8');
      ergebnisse.push({ was, datei, rot: testsRot() });
    } finally {
      writeFileSync(voll, original, 'utf8');
    }
  }
  return ergebnisse;
}

if (istHauptmodul(import.meta.url)) {
  const vorher = spawnSync(process.execPath, ['--test', '--test-reporter=dot', ...TESTS], { cwd: WURZEL, encoding: 'utf8' });
  if (vorher.status !== 0) {
    console.log('mutanten: Die Engine-Tests sind schon ohne Mutation rot – erst reparieren.');
    process.exitCode = 1;
  } else {
    const erg = probe();
    for (const e of erg) console.log(`  ${e.rot ? '✓ rot ' : '✗ GRÜN'}  ${e.was} (${e.datei})${e.fehler ? ` – ${e.fehler}` : ''}`);
    const rot = erg.filter((e) => e.rot).length;
    console.log(`mutanten: ${rot}/${erg.length} Mutanten rot`);
    process.exitCode = rot === erg.length ? 0 : 1;
  }
}
