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
  // nach der Fuge mindestens vier Kleinbuchstaben – keine Trennstelle vor einer Endung (R47: Mutation {1} überlebte)
  assert.equal(sicht('Leitungs-ID'), 'Leitungs-ID');
  for (const w of ['Risikoregisters', 'Phasenfreigaben', 'Standardfreigaben', 'Entscheidungsrat', 'Aufgabenstellung']) assert.equal(sicht(w), w, w);
  assert.equal(sicht('Entscheidungsregisters'), 'Entscheidungs|registers');
  assert.equal(sicht('Freigabenummer'), 'Freigabe|nummer');
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
    // R45: Tafelkarten (196 px) und schmale Zellen – unter Chrome 153 etwas breiter gesetzt als lokal
    ['Lieferkettenunsicherheit', 'Lieferketten|unsicherheit'], ['Unterlagenzugang', 'Unterlagen|zugang'], ['Grundlagenermittlung', 'Grundlagen|ermittlung'],
    ['Freigabeentscheidungen', 'Freigabe|entscheidungen'], ['Brandschutzgutachten', 'Brandschutz|gutachten'], ['Rohbauausschreibung', 'Rohbau|ausschreibung'],
    // R55: die übrigen Fugen je einmal (vorher nur von Browser-Proben am heutigen Inhalt gesichert)
    ['Registerführung', 'Register|führung'], ['Eintrittswahrscheinlichkeit', 'Eintritts|wahrscheinlichkeit'], ['Infrastrukturträger', 'Infrastruktur|träger'],
    ['Baupreissteigerungen', 'Baupreis|steigerungen'], ['Kostenabweichungen', 'Kosten|abweichungen'], ['Datenanforderung', 'Daten|anforderung'], ['Statusbericht', 'Status|bericht'], ['Folgekosten', 'Folge|kosten'], ['Gesamtkosten', 'Gesamt|kosten'],
  ] as [string, string][]) assert.equal(sicht(w), soll, w);
});

test('keine Trennstelle vor einem Fugen-s oder in fremden Wortteilen (R44)', () => {
  for (const w of ['Managementsystem', 'Risikomanagementsystem', 'Projektmanagementsoftware', 'Investmentsicherung', 'Übernahmenachweis']) assert.equal(sicht(w), w);
});

// R61: Zahl und Einheit bleiben in der Anzeige zusammen (L-174) – Fälle und Gegenfälle
test('schuetzeEinheiten: geschützte Leerzeichen zwischen Zahl und Einheit, LPH und Kap.', async () => {
  const { schuetzeEinheiten } = await import('../src/ui/h.ts');
  const n = ' ';
  assert.equal(schuetzeEinheiten('bis 100 TEUR frei'), `bis 100${n}TEUR frei`);
  assert.equal(schuetzeEinheiten('über 5 Mio. €'), `über 5${n}Mio.${n}€`);
  assert.equal(schuetzeEinheiten('5 Mio. EUR'), `5${n}Mio.${n}EUR`);
  assert.equal(schuetzeEinheiten('31–60 Tage'), `31–60${n}Tage`);
  assert.equal(schuetzeEinheiten('LPH 0 und Kap. 6.4.3'), `LPH${n}0 und Kap.${n}6.4.3`);
  assert.equal(schuetzeEinheiten('3 Tagessätze, 2 Wochenenden'), '3 Tagessätze, 2 Wochenenden');
});
