// Druckbogen (R43): weiche Trennstellen an den Fugen langer Wörter – Papier hat kein Trennwörterbuch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mitTrennstellen } from '../src/ui/druck.ts';

const sicht = (s: string) => mitTrennstellen(s).replace(/­/gu, '|').replace(/​/gu, '^');

test('Trennstellen an den Fugen, Wortlaut unverändert', () => {
  assert.equal(sicht('Entscheidungsgrundlagen'), 'Entscheidungs|grundlagen');
  assert.equal(sicht('Maßnahmenverknüpfung'), 'Maßnahmen|verknüpfung');
  assert.equal(sicht('Datenstandsbereinigung'), 'Datenstands|bereinigung');
  assert.equal(sicht('Managementbericht'), 'Management|bericht');
  assert.equal(sicht('Betriebshandbuchs'), 'Betriebs|handbuchs');
  assert.equal(sicht('Nutzenbewertung'), 'Nutzen|bewertung');
  assert.equal(sicht('Risiko-/Änderungs-/Maßnahmenverknüpfung'), 'Risiko-/^Änderungs-/^Maßnahmen|verknüpfung');
  const satz = 'Die Entscheidungsvorlage und das Änderungsregister im Managementbericht.';
  assert.equal(mitTrennstellen(satz).replace(/[­​]/gu, ''), satz);
});

test('kurze Wörter und Wortenden bleiben ungeteilt', () => {
  for (const w of ['Leistung', 'Bauherr', 'Entscheidungs', 'Freigabe', 'Wirkungen']) assert.equal(sicht(w), w);
  // nach der Fuge mindestens vier Buchstaben: „Entscheidungsrat“ ja, „Leitungs-ID“ nein
  assert.equal(sicht('Leitungs-ID'), 'Leitungs-ID');
  // nach „/“ zwischen Wörtern ein Umbruch ohne Breite, nicht in Zahlen (1/2) oder am Wortanfang
  assert.equal(sicht('Rollen/Freigaben/Nachweise'), 'Rollen/^Freigaben/^Nachweise');
  assert.equal(sicht('LPH 1/2 und /pfad'), 'LPH 1/2 und /pfad');
  // zweimal angewandt ändert nichts (verschachtelte Elemente)
  const einmal = mitTrennstellen('Risiko-/Änderungs-/Maßnahmenverknüpfung und Rollen/Freigaben');
  assert.equal(mitTrennstellen(einmal), einmal);
});

test('jede Fuge einzeln (R44)', () => {
  for (const [w, soll] of [
    ['Sicherheitskonzept', 'Sicherheits|konzept'], ['Zuständigkeitsmatrix', 'Zuständigkeits|matrix'],
    ['Gesellschaftsvertrag', 'Gesellschafts|vertrag'], ['Eskalationslogik', 'Eskalations|logik'],
    ['Qualitätssicherung', 'Qualitäts|sicherung'], ['Datenstandsprüfung', 'Datenstands|prüfung'],
    ['Maßnahmenregister', 'Maßnahmen|register'], ['Dokumentenprüfung', 'Dokumenten|prüfung'],
    ['Betriebshandbuch', 'Betriebs|handbuch'], ['Nutzenbewertung', 'Nutzen|bewertung'], ['Managementbericht', 'Management|bericht'],
  ] as [string, string][]) assert.equal(sicht(w), soll, w);
});

test('keine Trennstelle vor einem Fugen-s oder in fremden Wortteilen (R44)', () => {
  for (const w of ['Managementsystem', 'Risikomanagementsystem', 'Projektmanagementsoftware', 'Investmentsicherung', 'Übernahmenachweis']) assert.equal(sicht(w), w);
});
