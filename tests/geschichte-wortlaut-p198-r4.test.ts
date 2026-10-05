/*
 * P19.8, Prüfrunde 4 (L-410 bis L-414): Wortlaut-Pins gegen Rückfälle – jede Regel hat eine Gegenprobe, die mit der alten Fassung rot wird.
 * Gelesen wird der Quelltext der Stationen (ohne Kommentarzeilen).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const lies = (pfad: string): string => readFileSync(new URL(`../${pfad}`, import.meta.url), 'utf8').split('\n').filter((z) => !z.trimStart().startsWith('#')).join('\n');
const s = (n: string): string => lies(`inhalte/geschichte/${n}.yaml`);

test('X-01: die Risiko-Karte der Station 2 belegt nur die Möglichkeit und bestätigt kein Ereignis (Gegenprobe)', () => {
  const t = s('s2-warnsignal');
  const mini = t.slice(t.indexOf('\nmini:'));
  assert.match(mini, /Ein Gutachten belegt: Bei längerem Dauerfrost kann sich das Betonieren der Decken verzögern/);
  assert.doesNotMatch(mini, /bestätigt schriftlich, dass die Brüstungen später kommen/);
});

test('X-02, X-03, X-05: Satz C ohne Umkehrschluss, Angebot bis Freitag, kein „zuerst … als Erstes“ (Gegenprobe)', () => {
  const v = s('s12-entscheidung');
  assert.match(v, /Hier zählen Geld oder Strombedarf mindestens so viel wie der Schulstart/);
  assert.doesNotMatch(v, /lohnt sich das Warten/);
  const z = s('s7-zuschlag');
  assert.match(z, /entscheidet bis Donnerstag, das Angebot gilt bis Freitag/);
  assert.doesNotMatch(z, /bis Donnerstag, danach läuft das Angebot ab/);
  assert.doesNotMatch(s('s10-sturm'), /zuerst, was als Erstes/);
});

test('X-04, X-06, X-07: Oktober-Bericht im Thema ohne „wenn es so weit ist“, Fall-Schlüssel eindeutig, Rollenbeschreibung nennt die Schranke (Gegenprobe)', () => {
  const k = lies('inhalte/theorie/k16-takt.md');
  assert.match(k, /über jeden weiteren Einsatz der Reserve entscheidet der Bauherr/);
  assert.doesNotMatch(k, /wenn es so weit ist/);
  assert.doesNotMatch(lies('inhalte/fall.md'), /^vertretung:/m);
  assert.match(lies('docs/PRUEFAGENTEN.md'), /obere Schranke ≈ 46/);
});

test('N1, L-C, L-D, L-E: vollständige Sätze, keine Folge, die das Ende vorwegnimmt (Gegenprobe)', () => {
  const n = s('s13-nachweis');
  assert.match(n, /Clara Fadens Woche geht für das Zusammensuchen drauf; für andere Arbeit fehlt die Zeit/);
  assert.doesNotMatch(n, /Diese Woche fehlt für andere Arbeit/);
  const r = s('rahmen');
  assert.match(r, /Es blieb kein Spielraum für weitere Verzögerungen/);
  assert.doesNotMatch(r, /Die Sporthalle öffnet erst nach den Herbstferien\./);
  assert.match(r, /Jetzt, wo die Zahlen da sind, kann ich es bewerten/);
  assert.doesNotMatch(r, /bewerte ich es richtig/);
  assert.match(s('s6-elternabend'), /entscheidet erst, wenn ein neuer Antrag vorliegt/);
  assert.doesNotMatch(s('s6-elternabend'), /entschiede erst/);
});

test('L-F, L-G, L-I: Pinnwand und Matrix begründen auch die falsche Wahl, die Folge der Station 12 nennt den Hinweis (Gegenprobe)', () => {
  assert.match(s('s8-zahlen'), /Hier hängt nur ein Eintrag am anderen; nichts steht zweimal in der Rechnung/);
  assert.match(s('s4-auflage'), /Darum bleibt die Einstufung vorläufig, bis die Folge geklärt ist/);
  assert.doesNotMatch(s('s4-auflage'), /gehört nachgebessert, sobald/);
  assert.doesNotMatch(s('s4-auflage'), /Die Einstufung bleibt vorläufig, bis sie geklärt ist/);
  assert.match(s('s12-entscheidung'), /Was im April nur ein Hinweis war, ist jetzt ein Problem/);
  const w = readFileSync(new URL('../src/ui/woerter.ts', import.meta.url), 'utf8');
  assert.match(w, /keinZiel: 'noch keine Verbindung'/);
  assert.doesNotMatch(w, /kein Zettel am Ende/);
});

test('L-H: im Entscheidungsbuch der Kurzfassung nennen die Beschluss-Zeilen 4 und 7 die zuständige Stelle (Gegenprobe)', () => {
  const r = s('rahmen');
  assert.match(r, /Die Bürgermeisterin lässt die Holzbauteile in den Fluren kapseln/);
  assert.match(r, /Die Bürgermeisterin hat den Zuschlag für das Holz der Grundschule freigegeben/);
  assert.doesNotMatch(r, /ergebnis: Der Zuschlag für das Holz der Grundschule ist freigegeben/);
});
