/*
 * Wegskizze der Story-Wahl (O-61, src/grafik/weg-skizze.ts): rein, ohne Kennungen und url(#…); der ganze Weg besetzt jede
 * Station, die Kurzfassung nur die gespielten (die übrigen als kleine Brücken, Strecke gestrichelt).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wegSkizze } from '../src/grafik/weg-skizze.ts';

const zaehle = (svg: string, klasse: string): number => (svg.match(new RegExp(`class="${klasse}"`, 'gu')) ?? []).length;

test('Wegskizze, ganzer Weg: jede Station besetzt und nummeriert, keine Brücke', () => {
  const svg = wegSkizze([true, true, true, true, true, true, true, true], 'Beschreibung', false);
  assert.equal(zaehle(svg, 'ws-station'), 8);
  assert.equal(zaehle(svg, 'ws-uebersprungen'), 0);
  assert.equal(zaehle(svg, 'ws-weg'), 7);
  assert.equal(svg.match(/<text class="ws-nr"/gu)?.length, 8);
  assert.match(svg, /class="ws ws-lang"/u);
});

test('Wegskizze, Kurzfassung: nur die gespielten Stationen besetzt, dazwischen Brücken', () => {
  const svg = wegSkizze([true, false, true, true, false, false, true, false], 'Beschreibung', true);
  assert.equal(zaehle(svg, 'ws-station'), 4);
  assert.equal(zaehle(svg, 'ws-uebersprungen'), 4);
  // eine Strecke ist nur dann durchgezogen, wenn beide Enden gespielt werden (hier nur 3 → 4)
  assert.equal(zaehle(svg, 'ws-weg'), 1);
  assert.equal(zaehle(svg, 'ws-weg ws-bruecke'), 6);
  assert.match(svg, /class="ws ws-kurz"/u);
  // die Nummern bleiben die der Kapitel
  assert.deepEqual([...svg.matchAll(/class="ws-nr"[^>]*>(\d+)</gu)].map((m) => Number(m[1])), [1, 3, 4, 7]);
});

test('Wegskizze: ohne Kennungen, ohne url(#…), Beschreibung maskiert, wächst mit der Zahl der Stationen', () => {
  const svg = wegSkizze(Array.from({ length: 15 }, () => true), 'a "b" <c> & d', false);
  assert.ok(!/ id=/u.test(svg) && !/url\(/u.test(svg));
  assert.match(svg, /aria-label="a &quot;b&quot; &lt;c&gt; &amp; d"/u);
  assert.equal(zaehle(svg, 'ws-station'), 15);
  // deterministisch
  assert.equal(svg, wegSkizze(Array.from({ length: 15 }, () => true), 'a "b" <c> & d', false));
});

test('Wegskizze mit Akten (P19.7): Lücke an den Aktgrenzen, I · II · III unter dem Weg, Nummern bleiben, ohne passende Summe gleiche Abstände', () => {
  const alle = Array.from({ length: 14 }, () => true);
  const x = (svg: string): number[] => [...svg.matchAll(/<circle class="ws-station" cx="([\d.]+)"/gu)].map((m) => Number(m[1]));
  const ohne = x(wegSkizze(alle, 'B', false));
  const mit = wegSkizze(alle, 'B', false, [5, 5, 4]);
  const xs = x(mit);
  assert.equal(xs.length, 14);
  assert.deepEqual([...mit.matchAll(/class="ws-akt"[^>]*>([IV]+)</gu)].map((m) => m[1]), ['I', 'II', 'III']);
  // Abstand zwischen 5 und 6 (Aktgrenze) größer als innerhalb eines Akts
  const abstand = (a: number, b: number): number => (xs[b] ?? 0) - (xs[a] ?? 0);
  assert.ok(abstand(4, 5) > abstand(3, 4) * 1.3, 'Lücke an der Grenze');
  assert.ok(abstand(9, 10) > abstand(10, 11) * 1.3, 'Lücke an der zweiten Grenze');
  // Gegenprobe: ohne Akte gleiche Abstände und keine Zahlen; mit falscher Summe ebenso
  assert.ok(Math.abs((ohne[5] ?? 0) - (ohne[4] ?? 0) - ((ohne[4] ?? 0) - (ohne[3] ?? 0))) < 0.2);
  assert.equal(wegSkizze(alle, 'B', false, [5, 5, 3]), wegSkizze(alle, 'B', false));
  assert.equal(zaehle(wegSkizze(alle, 'B', false), 'ws-akt'), 0);
  // Weg, Ziel und alle Stationen bleiben im Bild (viewBox −8 … 288)
  assert.ok(xs.every((v) => v >= 14 && v <= 266));
  assert.deepEqual([...mit.matchAll(/class="ws-nr"[^>]*>(\d+)</gu)].map((m) => Number(m[1])), Array.from({ length: 14 }, (_, i) => i + 1));
  // die Kurzfassung trägt dieselben Akte
  assert.equal([...wegSkizze(alle.map((_, i) => [0, 2, 4, 11].includes(i)), 'B', true, [5, 5, 4]).matchAll(/class="ws-akt"/gu)].length, 3);
});
