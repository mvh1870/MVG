/*
 * Gerüst der 14 Stationen (P19.6 Schritt 1, L-330): die acht vorhandenen Stationen tragen schon die künftigen Kennungen
 * (docs/drehbuch-v2/00-geruest.md, Zuordnung alt → neu). Dieser Test hält die Zuordnung fest; beim Einsetzen einer neuen Station
 * (s4, s6, s7, s9, s11, s13) wird nur `NEU_VORHANDEN` erweitert.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { inhalte } from '../src/inhalte/index.ts';

/** alt → neu (Kennung, Datei) */
const ZUORDNUNG: readonly [string, string, string][] = [
  ['k1', 's1', 's1-mandat.yaml'], ['k2', 's2', 's2-warnsignal.yaml'], ['k3', 's3', 's3-risiko.yaml'], ['k4', 's5', 's5-mensa.yaml'],
  ['k5', 's8', 's8-zahlen.yaml'], ['k6', 's10', 's10-sturm.yaml'], ['k7', 's12', 's12-entscheidung.yaml'], ['k8', 's14', 's14-schulstart.yaml'],
];
/** Stationen des Gerüsts, die noch keine Datei haben (werden beim Einsetzen aus dieser Liste gestrichen) */
const NOCH_OFFEN = ['s4', 's6', 's7', 's9', 's11', 's13'];

test('Gerüst: die acht Stationen tragen die Kennungen der 14-Stationen-Struktur, die Reihenfolge steht im Rahmen', () => {
  const g = inhalte.geschichte;
  assert.ok(g);
  assert.deepEqual(g.kapitel.map((k) => k.id), ZUORDNUNG.map((z) => z[1]));
  assert.deepEqual(g.kapitel.map((k) => k.nr), [1, 2, 3, 4, 5, 6, 7, 8], 'die sichtbare Nummer zählt die Stelle in der Reihenfolge');
  const dateien = readdirSync('inhalte/geschichte').filter((d) => d !== 'rahmen.yaml').sort();
  assert.deepEqual(dateien, ZUORDNUNG.map((z) => z[2]).sort());
  const rahmen = readFileSync('inhalte/geschichte/rahmen.yaml', 'utf8');
  assert.match(rahmen, new RegExp(`^reihenfolge: \\[${ZUORDNUNG.map((z) => z[1]).join(', ')}\\]$`, 'mu'));
});

test('Gerüst: die sechs neuen Stationen sind noch offen und kollidieren nicht mit vorhandenen Kennungen', () => {
  const ids = new Set(inhalte.geschichte?.kapitel.map((k) => k.id));
  for (const n of NOCH_OFFEN) assert.ok(!ids.has(n), `${n} hat schon eine Datei – aus NOCH_OFFEN streichen`);
  assert.equal(ids.size + NOCH_OFFEN.length, 14);
});
