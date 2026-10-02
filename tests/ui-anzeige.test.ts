// Reine Lesehilfen der Oberfläche (src/ui/anzeige.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { istKarte, kopfKarte, kopfListe, kopfText, kopfZahl } from '../src/ui/anzeige.ts';

test('Kopfdaten lesen', () => {
  const kopf = { titel: 'A', zahl: 3, text: '4,5', liste: ['x'], karte: { a: 1 } };
  assert.equal(kopfText(kopf, 'titel'), 'A');
  assert.equal(kopfText(kopf, 'zahl'), '3');
  assert.equal(kopfText(kopf, 'fehlt'), null);
  assert.equal(kopfZahl(kopf, 'text'), 4.5);
  assert.deepEqual(kopfListe(kopf, 'liste'), ['x']);
  assert.deepEqual(kopfKarte(kopf, 'karte'), { a: 1 });
  assert.ok(istKarte(kopf.karte));
});
