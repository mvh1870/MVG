/*
 * Story (P16.6): Übersetzer (inhalte/geschichte → inhalte.json), gewichteter Vergleich und Ablauf.
 * Die Zahlen sind die der Stationen; ändert sich ein Punktwert, muss dieser Test bewusst mitgehen.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { kompiliere } from '../werkzeuge/inhalte.mjs';
import { kipppunkte, rangfolge, spitze, summe } from '../src/geschichte/mcda.ts';
import {
  empfohlen, empfehlungstextGilt, geheZu, gewichte, gilt, leseStand, neuerStand, offeneStationen, pufferUrteil,
  schritte, setzeGewicht, setzeKurz, station, status, waehle, weiter, zurueck, type Stand,
} from '../src/geschichte/engine.ts';
import type { Geschichte, Station } from '../src/geschichte/typen.ts';

const erg = await kompiliere({ pruefe: true, ziel: null });
const g = (erg.inhalte as { geschichte: Geschichte }).geschichte;
const st = (id: string): Station => {
  const s = station(g, id);
  assert.ok(s, id);
  return s;
};
const STANDARD = { kosten: 3, termin: 5, qualitaet: 3, klima: 2 };

test('Übersetzer: keine Befunde, acht Stationen, Belege bleiben intern', () => {
  assert.deepEqual(erg.fehler, []);
  assert.equal(g.stationen.length, 8);
  assert.deepEqual(g.stationen.filter((s) => s.kurzfassung).map((s) => s.id), ['s1', 's3', 's5', 's8']);
  const json = JSON.stringify(g);
  assert.doesNotMatch(json, /v24:|"belege"/u);
  assert.doesNotMatch(json, /"regie"/u, 'Regie-Notizen gehören nicht in die öffentliche Story');
  assert.ok((erg.inhalte as { geschichteRegie: Record<string, unknown> }).geschichteRegie['s8']);
});

test('MCDA: Summen und Rangfolge wie in den Stationen', () => {
  const v = st('s3').vorlage;
  assert.deepEqual(rangfolge(v.optionen, g.kriterien, STANDARD).map((p) => [p.option.id, p.summe]), [['A', 54], ['B', 40], ['C', 37]]);
  const o = v.optionen.find((x) => x.id === 'A');
  assert.ok(o);
  assert.equal(summe(o, g.kriterien, STANDARD), 54);
});

test('MCDA: Lüftungsgerät kippt bei „Kosten vor Termin“', () => {
  const v = st('s8').vorlage;
  assert.deepEqual(spitze(v.optionen, g.kriterien, STANDARD), ['A']);
  assert.deepEqual(spitze(v.optionen, g.kriterien, { kosten: 5, termin: 3, qualitaet: 3, klima: 2 }), ['B']);
  const k = kipppunkte(v.optionen, g.kriterien, STANDARD);
  assert.ok(k.some((x) => x.kriterium === 'kosten' || x.kriterium === 'termin'));
});

test('MCDA: Klärung geht nicht in den Vergleich', () => {
  const v = st('s6').vorlage;
  assert.ok(v.unvollstaendigHtml);
  assert.deepEqual(rangfolge(v.optionen, g.kriterien, STANDARD).map((p) => p.option.id), ['A']);
});

test('Empfehlungen passen zu den vorgeschlagenen Gewichten', () => {
  const s = neuerStand();
  for (const x of g.stationen) assert.equal(empfohlen(g, s, x), x.vorlage.empfehlung.option, x.id);
  const kostenZuerst = waehle(g, s, 's1', 'B');
  assert.equal(empfohlen(g, kostenZuerst, st('s8')), 'B');
  assert.equal(empfehlungstextGilt(g, kostenZuerst, st('s8')), false);
});

test('Ablauf: Schritte, weiter, zurück, Kurzfassung', () => {
  assert.equal(schritte(g, false).length, 2 + 8 * 3);
  assert.equal(schritte(g, true).length, 2 + 4 * 3);
  let s = neuerStand();
  s = weiter(g, s);
  assert.deepEqual(s.schritt, { ort: 'station', station: 's1', teil: 'lage' });
  s = zurueck(g, s);
  assert.deepEqual(s.schritt, { ort: 'prolog' });
  s = geheZu(g, s, { ort: 'station', station: 's2', teil: 'vorlage' });
  s = setzeKurz(g, s, true);
  assert.deepEqual(s.schritt, { ort: 'station', station: 's3', teil: 'lage' });
  assert.deepEqual(geheZu(g, s, { ort: 'station', station: 's2', teil: 'lage' }), s, 's2 liegt nicht auf dem kurzen Weg');
});

test('Status: Lage-Folgen, Entscheidungen erst ab der Folge, Kurzfassung mit Empfehlungen', () => {
  let s: Stand = neuerStand();
  assert.deepEqual(status(g, s), { kosten: 58.4, puffer: 42, offen: 0 });
  s = waehle(g, s, 's3', 'B');
  assert.equal(status(g, s, { ort: 'station', station: 's3', teil: 'vorlage' }).puffer, 42);
  assert.equal(status(g, s, { ort: 'station', station: 's3', teil: 'folge' }).puffer, 7);
  assert.equal(status(g, s, { ort: 'station', station: 's3', teil: 'folge' }).offen, 1);
  // s5 bringt eine Kostenänderung aus der Lage
  assert.equal(status(g, neuerStand(), { ort: 'station', station: 's5', teil: 'lage' }).kosten, 61.8);
  // Kurzfassung: übersprungene Stationen zählen mit ihrer Empfehlung
  const kurz = { ...neuerStand(true), schritt: { ort: 'ende' } as const };
  const lang = { ...neuerStand(), schritt: { ort: 'ende' } as const };
  let alleEmpfohlen: Stand = lang;
  for (const x of g.stationen) alleEmpfohlen = waehle(g, alleEmpfohlen, x.id, x.vorlage.empfehlung.option);
  const kurzEmpfohlen = ['s1', 's3', 's5', 's8'].reduce((a, id) => waehle(g, a, id, st(id).vorlage.empfehlung.option), kurz as Stand);
  assert.deepEqual(status(g, kurzEmpfohlen), status(g, alleEmpfohlen));
  assert.equal(pufferUrteil(status(g, alleEmpfohlen).puffer), 'gut');
});

test('Bedingungen und offene Stationen', () => {
  let s = neuerStand();
  assert.equal(gilt(g, s, 's3=A'), false);
  assert.equal(gilt(g, s, 's3!=A'), false);
  s = waehle(g, s, 's3', 'B');
  assert.equal(gilt(g, s, 's3=B'), true);
  assert.equal(gilt(g, s, 's3!=A'), true);
  assert.equal(gilt(g, s, null), true);
  assert.equal(offeneStationen(g, s).length, 7);
});

test('Gewichte: Variante wählen, fein einstellen, begrenzen', () => {
  let s = neuerStand();
  assert.deepEqual(gewichte(g, s), STANDARD);
  s = setzeGewicht(g, s, 'klima', 9);
  assert.equal(gewichte(g, s)['klima'], 5);
  s = waehle(g, s, 's1', 'C');
  assert.equal(s.gewichte, null);
  assert.equal(setzeGewicht(g, s, 'unbekannt', 2), s);
});

test('Speichern: gültiger Stand kommt zurück, Unpassendes fällt weg', () => {
  let s = waehle(g, neuerStand(), 's2', 'B');
  s = setzeGewicht(g, s, 'kosten', 4);
  s = geheZu(g, s, { ort: 'station', station: 's4', teil: 'folge' });
  assert.deepEqual(leseStand(g, JSON.parse(JSON.stringify(s))), s);
  const kaputt = leseStand(g, { v: 1, wahlen: { s2: 'Z', sX: 'A' }, schritt: { ort: 'station', station: 's9', teil: 'lage' } });
  assert.deepEqual(kaputt, neuerStand());
  assert.equal(leseStand(g, { v: 2 }), null);
  assert.equal(leseStand(g, 'x'), null);
});

test('Puffer-Urteil: über eine Woche gut, bis null knapp, darunter schlecht', () => {
  assert.equal(pufferUrteil(8), 'gut');
  assert.equal(pufferUrteil(7), 'knapp');
  assert.equal(pufferUrteil(1), 'knapp');
  assert.equal(pufferUrteil(0), 'knapp');
  assert.equal(pufferUrteil(-1), 'schlecht');
});
