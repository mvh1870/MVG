/*
 * P19.8, Prüfrunde 3 (L-400 bis L-403): Wortlaut-Pins gegen Rückfälle – jede Regel hat eine Gegenprobe, die mit der alten Fassung rot wird.
 * Gelesen wird der Quelltext der Stationen und der Werkzeug-Beispiele (ohne Kommentarzeilen).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const lies = (pfad: string): string => readFileSync(new URL(`../${pfad}`, import.meta.url), 'utf8').split('\n').filter((z) => !z.trimStart().startsWith('#')).join('\n');
const s = (n: string): string => lies(`inhalte/geschichte/${n}.yaml`);

test('W-01 und W-02: Kennung PRB-, und die Kapselung fehlt in keinem Monatsbericht (Gegenprobe)', () => {
  const w = lies('inhalte/werkzeuge.yaml');
  const ok = (t: string) => !/PRO-\d/.test(t);
  assert.ok(ok(w));
  assert.ok(!ok('kennung: PRO-013'));
  const berichte = w.match(/kennung: PRB-002/g) ?? [];
  assert.equal(berichte.length, 2, 'PRB-002 in beiden Monatsberichten (Oktober, Dezember)');
  assert.match(w, /Kapselung \(Auflage\): Wirkung noch nicht bestätigt/);
  assert.match(w, /Kapselung \(Auflage\): eingebaut, Wirkung nicht bestätigt/);
});

test('W-03 und W-04: kein „Zwingende“ im Lernsatz, keine Antwort, die „vorn“ verspricht, wo die Folge „gleichauf“ zeigt (Gegenprobe)', () => {
  const t = s('s12-entscheidung');
  assert.doesNotMatch(t, /alles Zwingende/);
  assert.doesNotMatch(t, /wann der spätere Einzug vorn läge/);
  assert.match(t, /mit dem Hinweis, wann sich die Rangfolge ändert/);
  assert.doesNotMatch(t, /Muss-Filter/);
});

test('W-05: keine Arbeitswörter in den Regie-Notizen (Gegenprobe)', () => {
  assert.doesNotMatch(s('s8-zahlen'), /nicht gemittelt/);
  assert.match(s('s8-zahlen'), /ohne Mittelwert/);
});

test('W-06: die Mini-Aufgabe der Station 2 nimmt weder die Holz-Enthüllung noch die Mensa vorweg (Gegenprobe)', () => {
  const t = s('s2-warnsignal');
  const mini = t.slice(t.indexOf('\nmini:'));
  assert.doesNotMatch(mini, /Drei Hersteller|größere Mensa|ein halbes Jahr Lieferzeit/);
  assert.match(mini, /Schlüsselkasten/);
});

test('W-08, W-09, W-10, W-11: Wörter der Balken, Pausen, Stelle und Buchzeile (Gegenprobe)', () => {
  assert.match(s('rahmen'), /beginnt es unter der Hälfte/);
  assert.doesNotMatch(s('rahmen'), /beginnt es niedrig/);
  assert.doesNotMatch(s('s7-zuschlag'), /entscheidende Stelle/);
  assert.match(s('rahmen'), /es steht als Chance für sich und wird nicht mit Risiken verrechnet/);
  assert.doesNotMatch(s('rahmen'), /nicht in die erwarteten Gesamtkosten eingerechnet/);
  assert.match(lies('inhalte/rechtliches/datenschutz.md'), /Pausen zwischen den drei Akten/);
});

test('M4 bis M7: Reihenfolge-Aufgabe nennt den Zug, Pinnwand und Matrix erklären sich, Rückmeldungen sind ausgeschrieben (Gegenprobe)', () => {
  assert.match(s('s10-sturm'), /Wählen Sie den ersten Schritt, dann den nächsten/);
  const p = s('s8-zahlen');
  assert.match(p, /Was sagen Sie zu jeder Verbindung\?/);
  assert.match(p, /So bleibt sichtbar, woher er kam/);
  const m = s('s4-auflage');
  assert.match(m, /Die Matrix ordnet Risiken nach Wahrscheinlichkeit und Auswirkung/);
  assert.match(m, /legende: "\*\*vorrangig:\*\*/);
  assert.match(m, /Mittlere Wahrscheinlichkeit, kleine Auswirkung/);
  assert.match(m, /Eingestuft: keine Folge, beobachten/);
  assert.doesNotMatch(m, /Folge null/);
  assert.match(m, /also ist „keine Folge“ nicht belegt/);
  const b = s('s9-monatstermin');
  assert.match(b, /Der Kostenstand steht einmal da/);
  assert.match(b, /Sie nennt das Problem, die Zwischenlösung und die Folge für den Schulstart/);
});

test('L5: der Bericht der Station 9 steht nach der Folge, nicht vor der Frage (Gegenprobe)', () => {
  assert.doesNotMatch(s('s9-monatstermin'), /stelle: vor-frage/);
  assert.match(s('s9-monatstermin'), /hätten Sie nachbessern lassen/);
});

test('L6, L7, L9: eine Falle weicher, die Vorsitzende nicht viermal voll, die Ergebnisse mit ausgeschriebenem Namen (Gegenprobe)', () => {
  assert.doesNotMatch(s('s12-entscheidung'), /je kürzer die Vorlage/);
  assert.doesNotMatch(s('s7-zuschlag'), /so gut wie bestellt/);
  assert.equal((s('s6-elternabend').match(/Vorsitzende des Elternbeirats/g) ?? []).length, 2, 'voll nur im Einstieg und in der ersten Szenenzeile');
  const k09 = lies('inhalte/theorie/k09-ergebnisbild.md');
  assert.match(k09, /titel: "Was am Ende vorliegt: die Ergebnisse der Einführung von Minimum Viable Governance"/);
  assert.match(s('s1-mandat'), /Dann schreibe ich das als Ihre Festlegung ins Entscheidungsbuch\. Was noch fehlt/);
});
