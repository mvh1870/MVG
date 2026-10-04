/*
 * P19.8, Prüfrunde 2 (L-380 bis L-382): Wortlaut-Pins gegen Rückfälle – jede Regel hat eine Gegenprobe, die mit der alten Fassung rot wird.
 * Gelesen wird der Quelltext der Stationen (inhalte/geschichte/*.yaml), damit auch Zeilen geprüft sind, die nur auf einem Weg erscheinen.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const DIR = new URL('../inhalte/geschichte/', import.meta.url);
const DATEIEN = readdirSync(DIR).filter((n) => n.endsWith('.yaml'));
const QUELLE = new Map(DATEIEN.map((n) => [n, readFileSync(new URL(n, DIR), 'utf8')]));
/** Sichtbarer Text: ohne Kommentarzeilen. */
function sichtbar(n: string): string {
  return (QUELLE.get(n) ?? '').split('\n').filter((z) => !z.trimStart().startsWith('#')).join('\n');
}
const ALLE = DATEIEN.map(sichtbar).join('\n');

const keineAlleAnforderungen = (t: string) => !/alle Anforderungen/.test(t);
const einLeitwortRatsmitglied = (t: string) => !/Ausschussmitglied|Das Mitglied /.test(t);
const risikoOhneSicherheit = (t: string) => !/es steht fest: Etwas Nachteiliges/i.test(t);
const zuschlagErklaert = (t: string) => /vor einem Zuschlag, also der Auftragsvergabe/.test(t);
const keineGenitivkette = (t: string) => !/mit beiden Wegen der Bürgermeisterin|mit mindestens zwei Wegen der Person/.test(t);

test('V-01: „zulässig“ heißt, was erfüllt sein muss – nicht „alle Anforderungen“ (Gegenprobe: alte Fassung)', () => {
  assert.ok(keineAlleAnforderungen(ALLE));
  assert.ok(!keineAlleAnforderungen('Dann werden mindestens zwei Wege verglichen, die alle Anforderungen erfüllen'));
  assert.match(sichtbar('s12-entscheidung.yaml'), /die das erfüllen, mit vorab vereinbarten Gewichten/);
});

test('V-07: Risiko ist eine belegte Möglichkeit, keine Gewissheit; Legende und Erklärung wortgleich (Gegenprobe)', () => {
  const s2 = sichtbar('s2-warnsignal.yaml');
  assert.ok(risikoOhneSicherheit(s2));
  assert.ok(!risikoOhneSicherheit('Es steht fest: Etwas Nachteiliges kann eintreten'));
  assert.match(s2, /heisst: "die Möglichkeit ist belegt: Etwas Nachteiliges/);
  assert.match(s2, /erklaerung: "Die Möglichkeit ist belegt: Etwas Nachteiliges/);
});

test('V-10: dieselbe Person heißt überall „Ratsmitglied“ (Gegenprobe)', () => {
  assert.ok(einLeitwortRatsmitglied(ALLE));
  assert.ok(!einLeitwortRatsmitglied('Das Ausschussmitglied schreibt die Antwort auf'));
  assert.ok(!einLeitwortRatsmitglied('Das Mitglied verlangt eine Liste'));
});

test('Befund 1: „Zuschlag“ ist beim ersten Auftritt erklärt (Gegenprobe)', () => {
  assert.ok(zuschlagErklaert(sichtbar('rahmen.yaml')));
  assert.ok(!zuschlagErklaert('jede Freigabe (das förmliche Ja, etwa am Ende eines großen Abschnitts oder vor einem Zuschlag)'));
});

test('Befund 7: keine Genitivkette bei der Vorlage der Änderung (Gegenprobe)', () => {
  assert.ok(keineGenitivkette(ALLE));
  assert.ok(!keineGenitivkette('Er wird mit mindestens zwei Wegen der Person vorgelegt'));
});

test('V-03 und V-04: Der Monatsbericht kennt „Blockierte Aufgaben“, keine „Offene Entscheidungen“-Zeile für den Planstand; s13 lässt nicht „nachbessern“, was kein Beschluss ist', () => {
  const s9 = sichtbar('s9-monatstermin.yaml');
  assert.match(s9, /Blockierte Aufgaben: –/);
  assert.doesNotMatch(s9, /text: "Offene Entscheidungen: –"/);
  const s13 = sichtbar('s13-nachweis.yaml');
  assert.match(s13, /schluss: "Bei drei Zeilen fehlte der Beschluss\."/);
  assert.doesNotMatch(s13, /Drei Zeilen mussten nachgebessert werden/);
});

test('Befund 3: Lot spricht „hinten im Saal“, nicht „vor der Sitzung“ (die Zeit springt nicht zurück)', () => {
  const s13 = sichtbar('s13-nachweis.yaml');
  assert.match(s13, /hinten im Saal/);
  assert.doesNotMatch(s13, /vor der Sitzung/);
});
