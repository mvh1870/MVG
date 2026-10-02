#!/usr/bin/env node
/**
 * Mutanten-Probe der Story-Engine (P2.1/P2.6, seit P16.14 src/geschichte): verfälscht je eine Stelle, lässt die
 * Story-Tests laufen und erwartet ROT. Ein Mutant, der grün bleibt, ist ein Befund: die Tests
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
const TESTS = ['tests/geschichte.test.ts'];

/** [Datei, alt, neu, was] – `alt` muss genau einmal vorkommen. */
export const MUTANTEN = [
  ['src/geschichte/engine.ts', '    addiere(s, st.lageFolgen);\n', '', 'Lage-Folgen zählen im Status'],
  ['src/geschichte/engine.ts', "    if (st.nr === bisNr && schritt.ort === 'station' && schritt.teil !== 'folge') continue;\n", '', 'Eigene Entscheidung zählt erst ab der Folge'],
  ['src/geschichte/engine.ts', "return m[2] === '=' ? w === m[3] : w !== m[3];", 'return w === m[3];', 'Bedingung „s3!=A“'],
  ['src/geschichte/engine.ts', '  if (stand.kurz && !st.kurzfassung) return empfohlen(g, stand, st);\n', '', 'Kurzfassung: übersprungene Stationen zählen mit der Empfehlung'],
  ['src/geschichte/engine.ts', "  if (st.vorlage.art === 'gewichte') neu.gewichte = null;\n", '', 'Neue Gewichte-Variante verwirft die Feineinstellung'],
  ['src/geschichte/engine.ts', "return puffer > 7 ? 'gut'", "return puffer > 0 ? 'gut'", 'Puffer-Urteil „knapp“'],
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
