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
