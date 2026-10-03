// Isometrischer Campus (O-53, P17.3): deterministisch, ohne fremde Ressourcen, zugänglich beschrieben,
// jede Klasse im SVG ist in src/stil/grafik.css gestaltet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAMPUS_STUFE_MAX, campusIso, campusIsoText, type Jahreszeit, type Licht } from '../src/grafik/campus-iso.ts';

const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string) => { window: Window & typeof globalThis } };
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const grafikCss = readFileSync(resolve(WURZEL, 'src/stil/grafik.css'), 'utf8');
const JAHRESZEITEN: Jahreszeit[] = ['fruehling', 'sommer', 'herbst', 'winter'];
const LICHTER: Licht[] = ['morgen', 'tag', 'abend'];
const STUFEN = Array.from({ length: CAMPUS_STUFE_MAX + 1 }, (_, s) => s);

test('campusIso: neun Stufen, deterministisch und je Stufe verschieden', () => {
  assert.equal(CAMPUS_STUFE_MAX, 8);
  const bilder = STUFEN.map((s) => campusIso(s, { jahreszeit: 'herbst', licht: 'abend' }));
  assert.deepEqual(bilder, STUFEN.map((s) => campusIso(s, { jahreszeit: 'herbst', licht: 'abend' })));
  assert.equal(new Set(bilder).size, bilder.length);
  // Stufen außerhalb werden begrenzt und gerundet
  assert.equal(campusIso(-3), campusIso(0));
  assert.equal(campusIso(12), campusIso(8));
  assert.equal(campusIso(2.4), campusIso(2));
});

test('campusIso: wohlgeformtes SVG mit role="img", deutschem aria-label und <title>', () => {
  const { window } = new JSDOM('');
  for (const s of STUFEN) for (const j of JAHRESZEITEN) for (const l of LICHTER) {
    const svg = campusIso(s, { jahreszeit: j, licht: l });
    const doc = new window.DOMParser().parseFromString(svg, 'image/svg+xml');
    assert.equal(doc.getElementsByTagName('parsererror').length, 0, `Stufe ${s} ${j} ${l} nicht wohlgeformt`);
    const wurzel = doc.documentElement;
    assert.equal(wurzel.getAttribute('role'), 'img');
    const text = campusIsoText(s, j, l);
    assert.equal(wurzel.getAttribute('aria-label'), text);
    assert.equal(wurzel.querySelector('title')?.textContent, text);
    assert.match(text, /fiktiv/);
    assert.equal(wurzel.getAttribute('data-stufe'), String(s));
    assert.equal(wurzel.getAttribute('data-jahreszeit'), j);
    assert.equal(wurzel.getAttribute('data-licht'), l);
  }
  assert.match(campusIsoText(0), /Bauzaun/);
  assert.match(campusIsoText(8), /Kinder/);
  assert.match(campusIsoText(8), /Schulbus/);
});

test('campusIso: keine fremden Ressourcen, keine Farbwerte, keine Bewegung', () => {
  for (const s of STUFEN) {
    const svg = campusIso(s, { jahreszeit: 'winter', licht: 'morgen' });
    assert.doesNotMatch(svg, /<image|<script|<foreignObject|https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
    assert.doesNotMatch(svg, /#[0-9a-f]{3,8}\b|rgba?\(|\bstyle=/i, 'Farben nur über Klassen (tokens.css)');
    assert.doesNotMatch(svg, /<animate|@keyframes/);
    for (const m of svg.matchAll(/url\(([^)]*)\)/g)) assert.match(m[1] ?? '', /^#ci-[\w-]+$/);
  }
});

test('campusIso: Bauschild nur während des Baus, Kinder und Schulbus erst am Schluss', () => {
  assert.match(campusIso(0), /Hier baut die/);
  assert.match(campusIso(0), /Stadt Lindenhall/);
  assert.doesNotMatch(campusIso(7), /Hier baut die/);
  assert.match(campusIso(8), /ci-tuer-glas/);
  assert.doesNotMatch(campusIso(7), /ci-tuer-glas/);
  assert.match(campusIso(3, { jahreszeit: 'winter' }), /ci-schneehaube/);
  assert.doesNotMatch(campusIso(3, { jahreszeit: 'sommer' }), /ci-schneehaube/);
  assert.doesNotMatch(campusIso(4, { himmel: false }), /linearGradient/);
});

test('campusIso: jede verwendete Klasse ist in grafik.css gestaltet', () => {
  const klassen = new Set<string>();
  for (const s of STUFEN) for (const j of JAHRESZEITEN) for (const l of LICHTER) {
    for (const m of campusIso(s, { jahreszeit: j, licht: l }).matchAll(/class="([^"]+)"/g)) for (const k of (m[1] ?? '').split(/\s+/)) klassen.add(k);
  }
  const fehlen = [...klassen].filter((k) => !new RegExp(`\\.${k}(?![\\w-])`).test(grafikCss) && !/^k[0-2]$/.test(k));
  assert.deepEqual(fehlen, []);
  for (const k of ['k0', 'k1', 'k2']) assert.match(grafikCss, new RegExp(`\\.ci-krone\\.${k}\\b`));
});
