// Überschrift am Seitenende im echten PDF (R41/R42): die Erkennung selbst, ohne Browser – ganze Überschrift auch mit „?“,
// Anfang und Ende einer umbrochenen, Satzenden und gleichlautende Listenpunkte in Grundschrift zählen nicht.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fuellung, seitenMitUeberschriftAmEnde } from './oberflaeche/pdf.mjs';

const seite = (zeilen: string[], groessen?: number[]) => (groessen === undefined ? { zeilen } : { zeilen, groessen });
const schluss = seite(['Ende']);

test('ganze Überschrift am Seitenende, auch mit Fragezeichen', () => {
  const t = seitenMitUeberschriftAmEnde([seite(['Text.', 'Wer pflegt dieses Register?']), schluss], ['Wer pflegt dieses Register?']);
  assert.deepEqual(t, [{ seite: 1, zeile: 'Wer pflegt dieses Register?' }]);
});

test('Anfang und Ende einer umbrochenen Überschrift', () => {
  const kopf = 'Freigabelogik und Entscheidungsreife im Regelbetrieb';
  assert.equal(seitenMitUeberschriftAmEnde([seite(['Text.', 'Freigabelogik und Entscheidungsreife']), schluss], [kopf]).length, 1);
  assert.equal(seitenMitUeberschriftAmEnde([seite(['Freigabelogik und', 'Entscheidungsreife im Regelbetrieb']), schluss], [kopf]).length, 1);
  // ein Satz, der zufällig mit denselben Wörtern endet, ist keine Überschrift
  assert.equal(seitenMitUeberschriftAmEnde([seite(['Es fehlt die', 'Entscheidungsreife im Regelbetrieb.']), schluss], [kopf]).length, 0);
});

test('Satzende und letzte Seite zählen nicht', () => {
  assert.equal(seitenMitUeberschriftAmEnde([seite(['Governance-Fluss im Alltag.']), schluss], ['Governance-Fluss im Alltag und im Gremium']).length, 0);
  assert.equal(seitenMitUeberschriftAmEnde([schluss, seite(['Governance-Fluss'])], ['Governance-Fluss']).length, 0);
});

test('gleichlautender Listenpunkt in Grundschrift ist keine Überschrift', () => {
  const koepfe = [{ text: 'Rollen und Mandate', pt: 12 }];
  assert.equal(seitenMitUeberschriftAmEnde([seite(['Text.', 'Rollen und Mandate'], [7.9, 7.9]), schluss], koepfe).length, 0);
  assert.equal(seitenMitUeberschriftAmEnde([seite(['Text.', 'Rollen und Mandate'], [7.9, 12]), schluss], koepfe).length, 1);
});

test('kurzer Anfang und Anfang mit Satzzeichen zählen nicht (R43)', () => {
  const kopf = 'Freigabelogik und Entscheidungsreife im Regelbetrieb';
  // unter 60 % der Überschrift: ein Wort am Seitenende ist noch keine Überschrift
  assert.equal(seitenMitUeberschriftAmEnde([seite(['Text.', 'Freigabelogik und']), schluss], [kopf]).length, 0);
  // mit Satzzeichen am Ende ist es ein Satz, auch wenn er wie der Anfang der Überschrift lautet
  assert.equal(seitenMitUeberschriftAmEnde([seite(['Text.', 'Regel 1: Vorrang der Ziele. Regel 2:']), schluss], ['Regel 1: Vorrang der Ziele. Regel 2: Mandat']).length, 0);
  assert.equal(seitenMitUeberschriftAmEnde([seite(['Text.', 'Freigabelogik und Entscheidungsreife']), schluss], [kopf]).length, 1);
});

test('ganze Überschrift auch mit Punkt; Rest unter drei Zeichen zählt nicht (R44)', () => {
  assert.equal(seitenMitUeberschriftAmEnde([seite(['Text.', 'Schritt eins: Mandat.']), schluss], ['Schritt eins: Mandat.']).length, 1);
  assert.equal(seitenMitUeberschriftAmEnde([seite(['Projektsteuerun', 'g']), schluss], ['Projektsteuerung']).length, 0);
});

test('Füllung einer Seite bis zur tiefsten Textzeile (R44)', () => {
  assert.equal(fuellung(800, 400), 0.5);
  assert.equal(fuellung(800, 80), 0.9);
  assert.equal(fuellung(800, 800), 0);
  assert.equal(fuellung(0, 10), 0);
});
