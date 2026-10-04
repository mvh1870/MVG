/*
 * R79: zwei kleine Wächter ohne DOM – die Kennungsprüfung des Werkzeugstands auf dem Kanal (Namen wie „constructor“ sind
 * keine Werkzeuge) und der Gleichstand im gewichteten Vergleich (nach Kennung, unabhängig von der Eingabereihenfolge).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pruefeBuehne, pruefeWerkzeugStand, neueBuehne } from '../src/regie/buehne.ts';
import { rangfolge } from '../src/geschichte/mcda.ts';

test('Werkzeugstand: Namen aus der Objekt-Kette („constructor“, „toString“, „__proto__“) sind keine Werkzeuge', () => {
  const roh = 'b:x;<img src=x onerror=alert(1)>';
  for (const name of ['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf']) {
    assert.equal(pruefeWerkzeugStand(roh, name), null, name);
    assert.equal(pruefeWerkzeugStand('b:oktober', name), null, name);
  }
  assert.equal(pruefeWerkzeugStand('b:oktober', 'monatsbericht'), 'b:oktober', 'ein echtes Werkzeug bleibt möglich');
  const b = { ...neueBuehne(), bereich: 'explore', werkzeug: 'constructor', werkzeugStand: 'b:oktober' };
  const r = pruefeBuehne(b, null);
  assert.ok(r === null || r.werkzeugStand === null, 'ein Stand für „constructor“ kommt nicht durch');
});

test('Gleichstand im gewichteten Vergleich: nach Kennung, auch bei umgekehrter Eingabereihenfolge; gleiche Summen teilen den Rang', () => {
  const kriterien = [{ id: 'k' }];
  const g = { k: 3 };
  const o = (id: string, p: number) => ({ id, punkte: { k: p } });
  const p = rangfolge([o('C', 3), o('A', 3), o('B', 4)], kriterien, g);
  assert.deepEqual(p.map((x) => [x.option.id, x.rang]), [['B', 1], ['A', 2], ['C', 2]]);
  assert.deepEqual(rangfolge([o('B', 3), o('A', 3)], kriterien, g).map((x) => x.option.id), ['A', 'B']);
});
