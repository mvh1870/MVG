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
  }
});

test('campusIso (R72): kein id= und kein url(# – mehrere Campus-Bilder auf einer Ansicht stören sich nicht', () => {
  for (const s of STUFEN) for (const j of JAHRESZEITEN) for (const l of LICHTER) {
    const svg = campusIso(s, { jahreszeit: j, licht: l });
    assert.doesNotMatch(svg, /\sid="|url\(#|<clipPath|<linearGradient|<defs/, `Stufe ${s} ${j} ${l}`);
  }
  assert.doesNotMatch(campusIso(4, { jahreszeit: 'winter', wetter: 'sturm' }), /\sid="|url\(#/);
  // der Himmel ist da, auch ohne Verweis: Bänder in den Tönen des Lichts
  assert.match(campusIso(3, { licht: 'abend' }), /class="ci-h-abend-1"/);
  assert.match(campusIso(3, { licht: 'abend' }), /class="ci-h-abend-3"/);
});

test('campusIso (R72): Schatten im Grundriss auf die Insel beschnitten', async () => {
  const { beschneide } = await import('../src/grafik/campus-iso.ts');
  assert.deepEqual(beschneide([[10, 10], [20, 10], [20, 20], [10, 20]], 100, 100), [[10, 10], [20, 10], [20, 20], [10, 20]]);
  const halb = beschneide([[90, 10], [110, 10], [110, 20], [90, 20]], 100, 100);
  assert.ok(halb.every(([x]) => x <= 100), JSON.stringify(halb));
  assert.ok(halb.some(([x]) => x === 100));
  assert.deepEqual(beschneide([[120, 10], [130, 10], [130, 20]], 100, 100), []);
});

test('campusIso (R72): Sturm – grauer Himmel ohne Sonne, Gerüst an der Sporthalle, Planen, umgekipptes Zaunfeld', () => {
  const sturm = campusIso(4, { jahreszeit: 'winter', licht: 'tag', wetter: 'sturm' });
  const ruhig = campusIso(4, { jahreszeit: 'winter', licht: 'tag' });
  assert.match(sturm, /data-wetter="sturm"/);
  assert.doesNotMatch(ruhig, /data-wetter/);
  assert.match(sturm, /class="ci-h-sturm-1"/);
  assert.doesNotMatch(sturm, /ci-sonne|ci-h-tag-/);
  assert.match(ruhig, /ci-sonne/);
  assert.match(sturm, /ci-wolke-sturm/);
  assert.match(sturm, /ci-boe/);
  assert.doesNotMatch(sturm, /ci-flocke/);
  assert.match(sturm, /ci-plane/);
  assert.doesNotMatch(ruhig, /ci-plane/);
  // das Gerüst steht in Stufe 4 an der Sporthalle (auch ohne Sturm): mehr Gerüststangen als nur am Kran
  assert.ok((ruhig.match(/class="ci-geruest"/g) ?? []).length >= 1);
  assert.doesNotMatch(campusIso(5, { jahreszeit: 'winter' }), /ci-plane/);
  assert.match(campusIsoText(4, 'winter', 'tag', 'sturm'), /Sturm unter grauem Himmel/);
  assert.match(campusIsoText(4, 'winter', 'tag', 'sturm'), /Bauzaunfeld ist umgekippt/);
  assert.match(campusIsoText(4), /Gerüst/);
  // jede Klasse des Sturmbilds ist gestaltet
  for (const m of sturm.matchAll(/class="([^"]+)"/g)) for (const k of (m[1] ?? '').split(/\s+/)) if (!/^k[0-2]$/.test(k)) assert.match(grafikCss, new RegExp(`\\.${k}(?![\\w-])`), k);

});

test('campusIso: Bauschild nur während des Baus, Kinder und Schulbus erst am Schluss', () => {
  assert.match(campusIso(0), /Hier baut die/);
  assert.match(campusIso(0), /Stadt Lindenhall/);
  assert.doesNotMatch(campusIso(7), /Hier baut die/);
  assert.match(campusIso(8), /ci-tuer-glas/);
  assert.doesNotMatch(campusIso(7), /ci-tuer-glas/);
  assert.match(campusIso(3, { jahreszeit: 'winter' }), /ci-schneehaube/);
  assert.doesNotMatch(campusIso(3, { jahreszeit: 'sommer' }), /ci-schneehaube/);
  assert.doesNotMatch(campusIso(4, { himmel: false }), /ci-h-|ci-sonne/);
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

test('campusIso: Wimpelkette nur in Stufe 2, Luftballons nur in Stufe 8, Stufe 2 ohne Decke und Gerüst (R73)', () => {
  for (let s = 0; s <= CAMPUS_STUFE_MAX; s++) {
    const svg = campusIso(s);
    if (s === 2) assert.match(svg, /ci-wimpelschnur/); else assert.doesNotMatch(svg, /ci-wimpelschnur/, `Stufe ${s}`);
    if (s === 8) assert.match(svg, /ci-ballonschnur/); else assert.doesNotMatch(svg, /ci-ballonschnur/, `Stufe ${s}`);
  }
  // „Die Bodenplatte ist gegossen, die ersten Wände stehen“: kein Rohbau-Inneres (Decke), kein Gerüst
  assert.doesNotMatch(campusIso(2), /class="ci-roh"|class="ci-geruest"/);
  assert.match(campusIsoText(2), /Bodenplatte/);
  assert.match(campusIsoText(2), /Wimpelkette/);
  assert.match(campusIsoText(8), /Luftballons/);
  for (const svg of [campusIso(2), campusIso(8)]) {
    for (const m of svg.matchAll(/class="([^"]+)"/g)) for (const k of (m[1] ?? '').split(/\s+/)) if (!/^k[0-2]$/.test(k)) assert.match(grafikCss, new RegExp(`\\.${k}(?![\\w-])`), k);
    assert.doesNotMatch(svg, /\sid="|url\(/);
  }
});

/** Oberste Kante der Szene (ohne Himmel und Wetter) in Bildeinheiten: absolute Punkte der Pfade, Kreise, Ellipsen, Rechtecke, Texte. */
function szeneOben(svg: string): number {
  // Bauschild-Schrift: schräg gestellte Gruppe (transform) tief im Bild – sie zählt nicht zur Oberkante
  const sz = svg.slice(svg.indexOf('<g class="ci-szene">'), svg.lastIndexOf('</g>')).replace(/<g transform="[^"]*">.*?<\/g>/gu, '');
  let oben = Number.POSITIVE_INFINITY;
  for (const m of sz.matchAll(/ d="([^"]*)"/gu)) {
    for (const p of m[1]!.matchAll(/[ML](-?[\d.]+),(-?[\d.]+)/gu)) oben = Math.min(oben, Number(p[2]));
  }
  for (const m of sz.matchAll(/<circle[^>]*\bcy="(-?[\d.]+)"[^>]*\br="([\d.]+)"/gu)) oben = Math.min(oben, Number(m[1]) - Number(m[2]));
  for (const m of sz.matchAll(/<ellipse[^>]*\bcy="(-?[\d.]+)"[^>]*\bry="([\d.]+)"/gu)) oben = Math.min(oben, Number(m[1]) - Number(m[2]));
  for (const m of sz.matchAll(/<(?:rect|text)[^>]*\by="(-?[\d.]+)"/gu)) oben = Math.min(oben, Number(m[1]) - 8);
  return oben;
}

test('campusIso (R75): der breite Ausschnitt (2,2 : 1) zeigt jede Stufe oben ganz – Kran, Dächer, Kronen, Bauschild', async () => {
  const { CAMPUS_VB } = await import('../src/grafik/campus-iso.ts');
  const [, y, b, h] = CAMPUS_VB.breit;
  assert.ok(Math.abs(b / h - 2.2) < 0.01, `Seitenverhältnis ${b / h}`);
  for (const s of STUFEN) for (const wetter of [undefined, 'sturm'] as const) {
    const svg = campusIso(s, { ausschnitt: 'breit', ...(wetter ? { wetter } : {}) });
    assert.match(svg, new RegExp(`viewBox="${CAMPUS_VB.breit.join(' ')}"`, 'u'));
    const oben = szeneOben(svg);
    assert.ok(oben >= y + 2, `Stufe ${s}${wetter ? ' Sturm' : ''}: Szene beginnt bei ${oben.toFixed(1)}, Ausschnitt bei ${y}`);
  }
  // Gegenprobe: der alte Story-Rahmen (ganzer Grund, 2,2 : 1 mittig beschnitten) sah erst ab y ≈ 24,6 – Stufe 5 (Kran) läge darüber
  const [, gy, gb, gh] = CAMPUS_VB.grund;
  const sichtbarAb = gy + (gh - gb / 2.2) / 2;
  assert.ok(szeneOben(campusIso(5)) < sichtbarAb, 'Gegenprobe: im alten Rahmen ist der Kran oben abgeschnitten');
});
