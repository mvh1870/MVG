/*
 * Gerüst der 14 Stationen (P19.6, L-330, Integration): alle vierzehn Stationen sind eingesetzt (docs/drehbuch-v2/00-geruest.md).
 * Dieser Test hält Kennungen, Dateinamen, die lückenlose Nummer und die Reihenfolge im Rahmen fest.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { inhalte } from '../src/inhalte/index.ts';

/** Kennung, Datei – in der Reihenfolge der Geschichte */
const STATIONEN: readonly [string, string][] = [
  ['s1', 's1-mandat.yaml'], ['s2', 's2-warnsignal.yaml'], ['s3', 's3-risiko.yaml'], ['s4', 's4-auflage.yaml'], ['s5', 's5-mensa.yaml'],
  ['s6', 's6-elternabend.yaml'], ['s7', 's7-zuschlag.yaml'], ['s8', 's8-zahlen.yaml'], ['s9', 's9-monatstermin.yaml'], ['s10', 's10-sturm.yaml'],
  ['s11', 's11-wissen.yaml'], ['s12', 's12-entscheidung.yaml'], ['s13', 's13-nachweis.yaml'], ['s14', 's14-schulstart.yaml'],
];

test('Gerüst: alle vierzehn Stationen sind eingesetzt, die Reihenfolge steht im Rahmen, die Nummer zählt die Stelle', () => {
  const g = inhalte.geschichte;
  assert.ok(g);
  assert.deepEqual(g.kapitel.map((k) => k.id), STATIONEN.map((z) => z[0]));
  assert.deepEqual(g.kapitel.map((k) => k.nr), Array.from({ length: 14 }, (_, i) => i + 1), 'die sichtbare Nummer zählt die Stelle in der Reihenfolge');
  const dateien = readdirSync('inhalte/geschichte').filter((d) => d !== 'rahmen.yaml').sort();
  assert.deepEqual(dateien, STATIONEN.map((z) => z[1]).sort(), 'keine Reste der alten Dateien');
  const rahmen = readFileSync('inhalte/geschichte/rahmen.yaml', 'utf8');
  assert.match(rahmen, new RegExp(`^reihenfolge: \\[${STATIONEN.map((z) => z[0]).join(', ')}\\]$`, 'mu'));
});

test('Gerüst: die drei Akte teilen die vierzehn Stationen lückenlos (s1–s5, s6–s10, s11–s14)', () => {
  const g = inhalte.geschichte;
  assert.ok(g);
  const akte = (g as unknown as { akte?: { id: string; stationen: string[] }[] }).akte ?? [];
  assert.equal(akte.length, 3);
  assert.deepEqual(akte.flatMap((a) => a.stationen), STATIONEN.map((z) => z[0]));
  assert.deepEqual(akte.map((a) => a.stationen.length), [5, 5, 4]);
});
