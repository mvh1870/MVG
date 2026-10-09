// Register-Zusammenspiel (Werkzeug E, Owner im Chat 2026-10-09): Form des Graphen, Wege der Anlässe, Ausfall einer Station,
// Probefragen ohne Zufall und die Zuständigkeit je Station nach der Vorgabe des Owners.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { inhalte } from '../src/inhalte/index.ts';
import {
  ANLAESSE, KANTEN, KANTEN_IDS, KNOTEN, ORTE, ROLLEN, SCHWELLE, ausgehend, besucht, bewerteWahl, bisBlockade, blockiert, eingehend, kante,
  probefrage, pruefeWeg, zaehleFuehrung, type Ort, type Rolle, type Weg,
} from '../src/werkzeuge/register.ts';

const w = inhalte.werkzeuge?.register;
const weg = (id: string): Weg => {
  const a = w?.anlaesse.find((x) => x.id === id);
  assert.ok(a, id);
  return { start: a.start, schritte: a.schritte.map((s) => s.kante) };
};

test('Graph: 13 Pfeile mit eindeutiger Kennung, jede Station liegt an mindestens einem Pfeil', () => {
  assert.equal(KANTEN.length, 13);
  assert.equal(new Set(KANTEN_IDS).size, KANTEN.length);
  for (const k of KANTEN) {
    assert.ok(ORTE.includes(k.von) && ORTE.includes(k.nach), k.id);
    assert.equal(k.id, `${k.von}-${k.nach}`, 'Kennung = von-nach');
    assert.notEqual(k.von, k.nach);
  }
  for (const o of ORTE) assert.ok(ausgehend(o).length + eingehend(o).length > 0, `${o} ohne Pfeil`);
});

test('Graph: die zwei Pfeile, die der Standard ausschließt, gibt es nicht (keine Rückrichtung aus dem Risiko, keine Maßnahme aus der Vorlage)', () => {
  assert.equal(kante('risiko-fruehwarnung'), null);
  assert.equal(kante('vorlage-massnahme'), null);
  assert.equal(kante('prognose-fruehwarnung'), null, 'der Schwellenwert steht dazwischen');
  assert.deepEqual(eingehend('fruehwarnung').map((k) => k.von), [SCHWELLE]);
  assert.deepEqual(ausgehend('vorlage').map((k) => k.nach), ['freigabe']);
  assert.deepEqual(ausgehend('freigabe').map((k) => k.nach), ['massnahme', 'bericht']);
  assert.deepEqual(ausgehend('massnahme').map((k) => k.nach), ['risiko'], 'Regelkreis');
});

test('Wege: jeder Anlass ist ein gültiger Weg, vier Anlässe, alle Pfeile kommen in mindestens einem Fall vor', () => {
  assert.deepEqual(w?.anlaesse.map((a) => a.id), [...ANLAESSE]);
  const benutzt = new Set<string>();
  for (const a of ANLAESSE) {
    const wg = weg(a);
    assert.deepEqual(pruefeWeg(wg), [], a);
    for (const id of wg.schritte) benutzt.add(id);
  }
  assert.deepEqual(KANTEN_IDS.filter((id) => !benutzt.has(id)), [], 'Pfeil ohne Fall');
});

test('pruefeWeg: unbekannter Pfeil, nicht erreichte Quelle, doppelter Pfeil, leerer Weg', () => {
  assert.deepEqual(pruefeWeg({ start: 'risiko', schritte: [] }), [{ art: 'leer' }]);
  assert.deepEqual(pruefeWeg({ start: 'risiko', schritte: ['risiko-nirgends'] }), [{ art: 'unbekannter-pfeil', schritt: 0, kante: 'risiko-nirgends' }]);
  assert.deepEqual(pruefeWeg({ start: 'risiko', schritte: ['vorlage-freigabe'] }), [{ art: 'nicht-erreicht', schritt: 0, kante: 'vorlage-freigabe', von: 'vorlage' }]);
  assert.deepEqual(pruefeWeg({ start: 'risiko', schritte: ['risiko-register', 'risiko-register'] }), [{ art: 'doppelt', schritt: 1, kante: 'risiko-register' }]);
  // Abzweig: nach der Freigabe zurück zu einer früheren Station ist erlaubt
  assert.deepEqual(pruefeWeg({ start: 'register', schritte: ['register-vorlage', 'vorlage-freigabe', 'freigabe-massnahme', 'freigabe-bericht'] }), []);
});

test('besucht: Start, dann je Ziel einmal in der Reihenfolge des ersten Besuchs', () => {
  const wg = weg('hinweis');
  assert.deepEqual(besucht(wg, -1), ['fruehwarnung']);
  assert.deepEqual(besucht(wg, 1), ['fruehwarnung', 'risiko', 'register']);
  assert.equal(besucht(wg).filter((o) => o === 'risiko').length, 1, 'Regelkreis führt zurück zum Risiko, ohne die Station zu verdoppeln');
  assert.equal(besucht(wg).at(-1), 'bericht');
  assert.equal(new Set(besucht(wg)).size, besucht(wg).length);
});

test('Ausfall: der Fall läuft bis zur ausgefallenen Station; Start, Ziel und Quelle blockieren', () => {
  const wg = weg('hinweis');
  assert.equal(blockiert(wg, new Set()), null);
  assert.equal(bisBlockade(wg, new Set()), wg.schritte.length);
  assert.deepEqual(blockiert(wg, new Set<Ort>(['vorlage'])), { schritt: 2, station: 'vorlage' }, 'Vorlage als Ziel von register-vorlage');
  assert.deepEqual(blockiert(wg, new Set<Ort>(['freigabe'])), { schritt: 3, station: 'freigabe' });
  assert.deepEqual(blockiert(wg, new Set<Ort>(['bericht'])), { schritt: 5, station: 'bericht' });
  assert.deepEqual(blockiert(wg, new Set<Ort>(['fruehwarnung'])), { schritt: 0, station: 'fruehwarnung' });
  assert.equal(bisBlockade(wg, new Set<Ort>(['massnahme'])), 4);
});

test('Probefragen: 3 bis 4 verschiedene Antworten, die richtige genau einmal, ohne Zufall; falsche Antworten sind echte Nicht-Ziele oder andere Pfeile', () => {
  for (const a of ANLAESSE) {
    const wg = weg(a);
    wg.schritte.forEach((id, i) => {
      const f = probefrage(wg, i);
      assert.ok(f, `${a} ${i}`);
      assert.deepEqual(probefrage(wg, i), f, 'deterministisch');
      assert.ok(f.wahl.length >= 3 && f.wahl.length <= 4, `${a} ${i}: ${f.wahl.join(',')}`);
      assert.equal(new Set(f.wahl).size, f.wahl.length);
      assert.equal(f.wahl.filter((o) => o === f.richtig).length, 1);
      assert.equal(f.richtig, kante(id)?.nach);
      assert.equal(f.von, kante(id)?.von);
      assert.ok(!f.wahl.includes(f.von), 'nie die Station selbst');
      for (const o of f.wahl) {
        const b = bewerteWahl(f, o);
        assert.equal(b === 'richtig', o === f.richtig);
        assert.equal(b === 'anderer-pfeil', o !== f.richtig && ausgehend(f.von).some((k) => k.nach === o));
      }
    });
  }
  // die richtige Antwort steht nicht immer am selben Platz
  const plaetze = new Set(weg('hinweis').schritte.map((_, i) => { const f = probefrage(weg('hinweis'), i); return f?.wahl.indexOf(f.richtig); }));
  assert.ok(plaetze.size > 1, 'Platz der richtigen Antwort wechselt');
});

test('Zuständigkeit nach Vorgabe des Owners: Entscheidungsregister und Freigabe beim Bauherrn, alles andere bei der Projektsteuerung; der Lenkungskreis führt nichts', () => {
  assert.ok(w);
  const fuehrt = Object.fromEntries(KNOTEN.map((id) => [id, w.knoten[id].wer.fuehrt])) as Record<string, Rolle>;
  assert.deepEqual(Object.entries(fuehrt).filter(([, r]) => r === 'bauherr').map(([id]) => id), ['register', 'freigabe']);
  assert.deepEqual(zaehleFuehrung(fuehrt), { bauherr: 2, lenkungskreis: 0, projektsteuerung: 8 });
  assert.equal(w.schwelle.wer.fuehrt, 'bauherr', 'die Schwellen legt der Bauherr fest');
  assert.ok(w.knoten.freigabe.wer.beteiligt.some((b) => b.rolle === 'lenkungskreis'), 'Freigabe: der Lenkungskreis berät');
  assert.deepEqual(w.rollen.map((r) => r.id), [...ROLLEN]);
  for (const id of KNOTEN) assert.ok(!w.knoten[id].wer.beteiligt.some((b) => b.rolle === w.knoten[id].wer.fuehrt), id);
});

test('Inhalte: neutrale Rollen, keine Figuren der Geschichte, Freigabe mit LPH 0–9, nie G0–G5', () => {
  assert.ok(w);
  const alles = JSON.stringify(w);
  for (const figur of ['Bürgermeisterin', 'Bauleiter', 'Projektleitung']) assert.ok(!alles.includes(figur), figur);
  assert.ok(!/\bG[0-5]\b/u.test(alles));
  assert.match(w.knoten.freigabe.text, /LPH 0–9/u);
  assert.ok(!/Indicator|\(P-A\)|akutes Problem/u.test(alles));
});
