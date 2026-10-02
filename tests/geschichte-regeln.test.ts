/*
 * Regeln von Vergleich und Ablauf der Story (src/geschichte/mcda.ts, src/geschichte/engine.ts), wörtlich geprüft:
 * Gleichstand der Empfehlung, Kipppunkte je Kriterium und Richtung, Begrenzung der Gewichte, gelesener Stand.
 * Die Kipppunkte von s4 und s8 sind die Zahlen der Stationen; ändert sich ein Punktwert, muss dieser Test bewusst mitgehen.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { kompiliere } from '../werkzeuge/inhalte.mjs';
import { begrenzeGewicht, kipppunkte, spitze } from '../src/geschichte/mcda.ts';
import { empfohlen, empfehlungstextGilt, gewichte, leseStand, neuerStand } from '../src/geschichte/engine.ts';
import type { Geschichte, Option, Station } from '../src/geschichte/typen.ts';

const erg = await kompiliere({ pruefe: true, ziel: null });
const g = (erg.inhalte as { geschichte: Geschichte }).geschichte;
const st = (id: string): Station => {
  const s = g.stationen.find((x) => x.id === id);
  assert.ok(s, id);
  return s;
};
const STANDARD = { kosten: 3, termin: 5, qualitaet: 3, klima: 2 };

test('Kriterien und Standardgewichte (Vorschlag der Station 1)', () => {
  assert.deepEqual(g.kriterien.map((k) => k.id), ['kosten', 'termin', 'qualitaet', 'klima']);
  assert.deepEqual(gewichte(g, neuerStand()), STANDARD);
});

/** Eine Optionen-Station mit veränderten Punkten (alle gleich) und gewähltem Vorschlag. */
function gleichstand(vorschlag: string, ausser: Record<string, number> = {}): Station {
  const vorbild = g.stationen.find((x) => x.vorlage.art === 'optionen' && x.vorlage.unvollstaendigHtml === null && x.vorlage.optionen.filter((o) => !o.klaerung).length >= 3);
  assert.ok(vorbild, 'Optionen-Station mit drei zulässigen Optionen');
  const kopie = structuredClone(vorbild);
  kopie.vorlage.optionen = kopie.vorlage.optionen.filter((o) => !o.klaerung).map((o): Option => ({
    ...o,
    punkte: Object.fromEntries(g.kriterien.map((k) => [k.id, [ausser[o.id] ?? 3, 'gleich'] as [number, string]])),
  }));
  kopie.vorlage.empfehlung = { ...kopie.vorlage.empfehlung, option: vorschlag };
  return kopie;
}

test('empfohlen(): bei Gleichstand gilt die vorgeschlagene Option, auch wenn sie nicht alphabetisch vorn liegt', () => {
  const s = gleichstand('C');
  const ids = s.vorlage.optionen.map((o) => o.id);
  assert.deepEqual(ids.slice(0, 3), ['A', 'B', 'C']);
  assert.deepEqual(spitze(s.vorlage.optionen, g.kriterien, STANDARD), ids, 'alle gleichauf');
  assert.equal(empfohlen(g, neuerStand(), s), 'C');
  assert.equal(empfehlungstextGilt(g, neuerStand(), s), true);
  // B und C gleichauf vor A, Vorschlag C → C
  const bc = gleichstand('C', { A: 2 });
  assert.deepEqual(spitze(bc.vorlage.optionen, g.kriterien, STANDARD).slice(0, 2), ['B', 'C']);
  assert.equal(empfohlen(g, neuerStand(), bc), 'C');
  // Vorschlag nicht unter den Spitzen → die erste Spitze, der vorbereitete Text gilt nicht
  const ohne = gleichstand('A', { A: 2 });
  assert.equal(empfohlen(g, neuerStand(), ohne), 'B');
  assert.equal(empfehlungstextGilt(g, neuerStand(), ohne), false);
});

test('kipppunkte(): s4 mit Standardgewichten – je Kriterium erst weniger, dann mehr Gewicht, nur das nächstgelegene', () => {
  const v = st('s4').vorlage;
  assert.deepEqual(spitze(v.optionen, g.kriterien, STANDARD), ['B', 'C']);
  assert.deepEqual(kipppunkte(v.optionen, g.kriterien, STANDARD), [
    { kriterium: 'kosten', gewicht: 2, spitze: ['B'] },
    { kriterium: 'kosten', gewicht: 4, spitze: ['C'] },
    { kriterium: 'qualitaet', gewicht: 2, spitze: ['C'] },
    { kriterium: 'qualitaet', gewicht: 4, spitze: ['B'] },
  ]);
});

test('kipppunkte(): s8 mit Standardgewichten', () => {
  const v = st('s8').vorlage;
  assert.deepEqual(spitze(v.optionen, g.kriterien, STANDARD), ['A']);
  assert.deepEqual(kipppunkte(v.optionen, g.kriterien, STANDARD), [{ kriterium: 'termin', gewicht: 2, spitze: ['A', 'B'] }]);
});

test('begrenzeGewicht(): rundet und begrenzt auf 1–5', () => {
  assert.equal(begrenzeGewicht(2.5), 3);
  assert.equal(begrenzeGewicht(2.4), 2);
  assert.equal(begrenzeGewicht(0), 1);
  assert.equal(begrenzeGewicht(-3), 1);
  assert.equal(begrenzeGewicht(9), 5);
  assert.equal(begrenzeGewicht(4), 4);
});

test('leseStand(): gespeicherte Gewichte werden auf 1–5 begrenzt', () => {
  const s = leseStand(g, { v: 1, schritt: { ort: 'prolog' }, wahlen: {}, gewichte: { kosten: 99, termin: 0, qualitaet: 2.6, klima: 3 }, kurz: false });
  assert.ok(s);
  assert.deepEqual(s.gewichte, { kosten: 5, termin: 1, qualitaet: 3, klima: 3 });
  // ein fehlendes Kriterium verwirft die Gewichte ganz
  const ohne = leseStand(g, { v: 1, schritt: { ort: 'prolog' }, wahlen: {}, gewichte: { kosten: 3, termin: 3, qualitaet: 3 }, kurz: false });
  assert.equal(ohne?.gewichte, null);
});
