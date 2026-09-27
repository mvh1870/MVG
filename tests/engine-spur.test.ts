/*
 * Status über mehrere Stationen einer Welt (P2.1): Nachwirkung früherer Wahlen (Spur-Delta, L-21)
 * und Station ohne `status-start` (L-19). Eigenes Kleinmodell: a1 → a2 → w (ohne Startstand).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { ModellStation, StoryModell, WirkEintrag } from '../src/engine/typen.ts';
import { SPUR_GRENZE, berechneStatus } from '../src/engine/status.ts';

const setze = (schluessel: WirkEintrag['schluessel'], wert: WirkEintrag['wert']): WirkEintrag => ({ schluessel, art: 'setze', wert, hinweis: null });
const aendere = (schluessel: WirkEintrag['schluessel'], wert: number): WirkEintrag => ({ schluessel, art: 'aendere', wert, hinweis: null });
const start = (ef: number, ku: WirkEintrag['wert'], or: number, ue: number, tr: WirkEintrag['wert']): WirkEintrag[] => [
  setze('entscheidungsfaehigkeit', ef), setze('kostenunsicherheit', ku), setze('offeneRisiken', or),
  setze('ungeklaerteEntscheidungen', ue), setze('terminrisiko', tr),
];

function station(id: string, statusStart: WirkEintrag[] | null, optionen: Record<string, WirkEintrag[]>): ModellStation {
  return {
    id, art: 'station', welt: 'A', schritte: [{ id: 'e', art: 'entscheidung' }], weiter: [], ende: false, schaltetFrei: [],
    statusStart, vergleich: null, partner: null, infos: [],
    szenen: { pl: { rolle: 'pl', fragen: [], rueckbezug: null, entscheidung: { id: `${id}/pl`, optionen: Object.entries(optionen).map(([o, wirkung]) => ({ id: o, kurz: o, wirkung })) } } },
  };
}

const modell: StoryModell = {
  start: 'a1',
  rollen: { pl: { id: 'pl', spielbar: true } },
  interessen: [],
  stationen: {
    a1: station('a1', start(2, 'hoch', 5, 2, 'mittel'), {
      gut: [aendere('entscheidungsfaehigkeit', 2), aendere('kostenunsicherheit', -1)],
      schlecht: [aendere('offeneRisiken', 3), aendere('terminrisiko', 1)],
      neutral: [],
    }),
    a2: station('a2', start(1, 'hoch', 6, 3, 'hoch'), { x: [], mehr: [aendere('ungeklaerteEntscheidungen', 1)] }),
    w: station('w', null, { a: [setze('entscheidungsfaehigkeit', 3)], b: [aendere('offeneRisiken', -2)] }),
  },
};

const lauf = (entscheidungen: Record<string, string>, verlauf = ['a1', 'a2']) =>
  berechneStatus({ verlauf, rolle: 'pl', entscheidungen, info: [] }, modell).A;

test('Spur-Delta: ohne Wahl gilt der Startstand der nächsten Station unverändert', () => {
  const s = lauf({ 'a1/pl': 'neutral' });
  assert.deepEqual({ ...s, hinweise: undefined }, { entscheidungsfaehigkeit: 1, kostenunsicherheit: 'hoch', offeneRisiken: 6, ungeklaerteEntscheidungen: 3, terminrisiko: 'hoch', hinweise: undefined });
  assert.deepEqual(lauf({}), lauf({ 'a1/pl': 'neutral' }));
});

test('Spur-Delta: eine gute Wahl wirkt gekappt (±1) in der nächsten Station nach', () => {
  assert.equal(SPUR_GRENZE, 1);
  const s = lauf({ 'a1/pl': 'gut' });
  assert.equal(s?.entscheidungsfaehigkeit, 2, 'Start 1, Wahl in a1 war +2 → gekappt +1');
  assert.equal(s?.kostenunsicherheit, 'mittel', 'Start hoch, eine Stufe besser');
  assert.equal(s?.offeneRisiken, 6);
});

test('Spur-Delta: eine schlechte Wahl wirkt ebenso nach; Stufen bleiben im Bereich', () => {
  const s = lauf({ 'a1/pl': 'schlecht' });
  assert.equal(s?.offeneRisiken, 7, 'Start 6, +3 in a1 → gekappt +1');
  assert.equal(s?.terminrisiko, 'sehr hoch');
  assert.equal(s?.entscheidungsfaehigkeit, 1);
});

test('Spur-Delta: Nachwirkungen addieren sich über Stationen nicht über die Grenze hinaus', () => {
  const s = lauf({ 'a1/pl': 'schlecht', 'a2/pl': 'mehr' }, ['a1', 'a2', 'w']);
  // a2: Start 6 → +1 = 7 Risiken; Wahl mehr: +1 ungeklärte (3+0+1 = 4). w übernimmt (L-19).
  assert.equal(s?.offeneRisiken, 7);
  assert.equal(s?.ungeklaerteEntscheidungen, 4);
});

test('L-19: eine Station ohne status-start rechnet mit dem Stand ihrer Welt weiter, inklusive Wahl davor', () => {
  const ohne = lauf({ 'a1/pl': 'neutral', 'a2/pl': 'x' }, ['a1', 'a2', 'w']);
  const mit = lauf({ 'a1/pl': 'neutral', 'a2/pl': 'mehr' }, ['a1', 'a2', 'w']);
  assert.equal(ohne?.ungeklaerteEntscheidungen, 3);
  assert.equal(mit?.ungeklaerteEntscheidungen, 4, 'die Wahl in a2 bleibt in w stehen');
  const b = lauf({ 'a1/pl': 'neutral', 'a2/pl': 'x', 'w/pl': 'b' }, ['a1', 'a2', 'w']);
  assert.equal(b?.offeneRisiken, 4, 'w setzt nicht zurück, sondern ändert den laufenden Stand (6 − 2)');
});

test('Mutanten-Probe: ohne Kappung, ohne Nachwirkung oder mit Rücksetzen in w fiele ein Test', () => {
  // Die erwarteten Zahlen oben unterscheiden alle drei Mutanten:
  //  – ohne Kappung: EF nach „gut“ wäre 3 statt 2, Risiken nach „schlecht“ 9 statt 7;
  //  – ohne Nachwirkung: EF nach „gut“ wäre 1 (= Start);
  //  – Rücksetzen in w: ohne Startstand gäbe es keinen Stand oder den neutralen (EF 3, Risiken 0).
  const gut = lauf({ 'a1/pl': 'gut' });
  assert.notEqual(gut?.entscheidungsfaehigkeit, 3);
  assert.notEqual(gut?.entscheidungsfaehigkeit, 1);
  assert.notEqual(lauf({ 'a1/pl': 'neutral' }, ['a1', 'a2', 'w'])?.offeneRisiken, 0);
});
