// Abbildungen der DOCX V1.2 (P14, O-32, L-77): Schema der Beschreibung, Prüfsumme der Eingabe, Stand der
// Bilder im Repo und ihr Platz im Originaltext. Das Zeichnen selbst braucht Chromium und läuft nur mit
// `node werkzeuge/abbildungen.mjs` (zweimal ausgeführt byte-gleich, siehe Abnahme P14.1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eingabeSumme, pruefeBeschreibung } from '../werkzeuge/abbildungen.mjs';

const KONTEXT = { ids: new Set(['k4-t1', 'k4-p1']), abbildungen: new Map([['abb-6', { id: 'abb-6', datei: 'bilder/image6.png', sha256: 'x' }]]) };
const GUT = {
  id: 'abb-6', quelle: 'bilder/image6.png', titel: 'Titel', alt: 'Alt',
  angeglichen: [{ x: 1, y: 2, b: 30, h: 12, text: 'LPH 0–2', beleg: 'k4-t1', schrift: 'barlow', gewicht: 600 }],
  abweichungen: [{ text: 'Satz.', beleg: 'k4-p1 k4-t1' }],
};

test('Beschreibung: gültige Datei ohne Fehler, jede Abweichung vom Schema wird gemeldet', () => {
  assert.deepEqual(pruefeBeschreibung(GUT, 'inhalte/abbildungen/abb-6.yaml', KONTEXT), []);
  const fehler = (roh: unknown): string => pruefeBeschreibung(roh, 'inhalte/abbildungen/abb-6.yaml', KONTEXT).join('\n');
  assert.match(fehler({ ...GUT, id: 'abb-7' }), /passt nicht zum Dateinamen/u);
  assert.match(fehler({ ...GUT, quelle: 'bilder/image7.png' }), /quelle/u);
  assert.match(fehler({ ...GUT, alt: '' }), /„alt“ fehlt/u);
  assert.match(fehler({ ...GUT, alt: 'x'.repeat(601) }), /länger als 600/u);
  assert.match(fehler({ ...GUT, extra: 1 }), /unbekanntes Feld „extra“/u);
  assert.match(fehler({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], beleg: 'k9-p9' }] }), /keine Absatz-ID/u);
  assert.match(fehler({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], x: -1 }] }), /„x“ keine ganze Zahl/u);
  assert.match(fehler({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], hintergrund: 'rot' }] }), /#rrggbb/u);
  assert.match(fehler({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], schrift: 'arial' }] }), /schrift „arial“/u);
  assert.match(fehler({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], grund: 'x' }] }), /unbekanntes Feld „grund“/u);
  assert.match(fehler({ ...GUT, abweichungen: [{ text: 'x', beleg: 'k4-p1 k0-p0' }] }), /abweichungen\[0\]: Beleg/u);
});

test('Prüfsumme der Eingabe: ändert sich mit Quelle und Überdeckung, nicht mit Titel, Alternativtext, Abweichungen', () => {
  const a = eingabeSumme(GUT, 'q1');
  assert.equal(eingabeSumme({ ...GUT, titel: 'anders', alt: 'anders', abweichungen: [] }, 'q1'), a);
  assert.equal(eingabeSumme({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], beleg: 'k4-p1' }] }, 'q1'), a, 'der Beleg ändert keine Pixel');
  assert.notEqual(eingabeSumme(GUT, 'q2'), a);
  assert.notEqual(eingabeSumme({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], text: 'LPH 0–3' }] }, 'q1'), a);
  assert.notEqual(eingabeSumme({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], x: 2 }] }, 'q1'), a);
});
