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
  ['src/geschichte/engine.ts', 'for (const b of BALKEN) s[b] = begrenze(s[b] + a.wirkung[b]);', 'for (const b of BALKEN) s[b] = s[b] + a.wirkung[b];', 'Balken nach jeder Antwort auf 0–10 begrenzt'],
  ['src/geschichte/engine.ts', '  if (stand.kurz && !k.kurzfassung) return gutePlatz(k);\n', '', 'Kurzfassung: übersprungene Kapitel zählen wie die gute Antwort'],
  ['src/geschichte/engine.ts', "  if (stufe(b.vertrauen) === 'niedrig') return 'nicht-getragen';\n", '', 'Bilanz: Vertrauen niedrig zuerst'],
  ['src/geschichte/engine.ts', "return wert <= 3 ? 'niedrig'", "return wert < 3 ? 'niedrig'", 'Stufe: 3 ist niedrig'],
  ['src/geschichte/engine.ts', " && stufe(b.geld) !== 'niedrig') return 'ruhig';", ") return 'ruhig';", 'Bilanz „ruhig“ verlangt Geld mindestens mittel'],
  ['src/geschichte/engine.ts', "return stelle === i ? 'richtig' : 'falsch';", "return 'richtig';", 'Reihenfolge: falsche Stelle ist falsch'],
  ['src/geschichte/engine.ts', 'kipppunkte(v.optionen, v.kriterien, gew, STUFEN_GEWICHT)', 'kipppunkte(v.optionen, v.kriterien, gew)', 'Kipppunkte nur über die drei Stufen'],
  ['src/geschichte/engine.ts', '  if (r[\'v\'] !== STAND_VERSION) return null;\n', '', 'Älterer Stand wird verworfen'],
  ['src/geschichte/engine.ts', ' || !STUFEN_GEWICHT.includes(wert)) return stand;', ') return stand;', 'Gewichte nur 5, 3 oder 1'],
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
