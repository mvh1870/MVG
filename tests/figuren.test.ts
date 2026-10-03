// Figuren und Gegenstände der Story (O-51, O-53, P17.3): deterministisch, ohne fremde Ressourcen und Farbwerte,
// zugänglich beschrieben, jede Klasse im SVG ist in src/stil/grafik.css gestaltet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AKZENTE } from '../src/stil/akzente.ts';
import {
  FIGUREN, FIGUR_AKZENT, FIGUR_NAME, GIMMICKS, gimmick, gimmickText, portraet, portraetText,
  type Figur, type GimmickName, type Stimmung,
} from '../src/grafik/figuren.ts';

const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string) => { window: Window & typeof globalThis } };
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const grafikCss = readFileSync(resolve(WURZEL, 'src/stil/grafik.css'), 'utf8');
const STIMMUNGEN: Stimmung[] = ['neutral', 'froh', 'besorgt'];
const GROESSEN = ['klein', 'gross', 48, 120] as const;

function allePortraets(): { figur: Figur; stimmung: Stimmung; svg: string }[] {
  return FIGUREN.flatMap((figur) => STIMMUNGEN.flatMap((stimmung) => GROESSEN.map((groesse) => ({ figur, stimmung, svg: portraet(figur, { stimmung, groesse }) }))));
}
const alleGimmicks = (): { name: GimmickName; svg: string }[] => GIMMICKS.map((name) => ({ name, svg: gimmick(name) }));

test('Figuren: sechs Porträts (Sie und fünf Figuren), Töne aus der Akzentpalette und je verschieden', () => {
  assert.deepEqual([...FIGUREN], ['sie', 'grundstein', 'faden', 'schwung', 'klingel', 'lot']);
  assert.deepEqual(FIGUR_AKZENT, { grundstein: 'violett', faden: 'lagune', schwung: 'blau', klingel: 'orange', lot: 'sonne' });
  const toene = Object.values(FIGUR_AKZENT);
  assert.equal(new Set(toene).size, toene.length);
  for (const t of toene) assert.ok((AKZENTE as readonly string[]).includes(t));
  for (const f of FIGUREN) {
    assert.ok(FIGUR_NAME[f].name.length > 0 && FIGUR_NAME[f].rolle.length > 0);
    if (f !== 'sie') assert.match(portraet(f), new RegExp(`fig-ton-${FIGUR_AKZENT[f]}`));
  }
  assert.match(portraet('sie'), /fig-ton-marke/);
});

test('portraet: deterministisch, je Figur und Stimmung verschieden, Größen klein und groß', () => {
  const a = allePortraets();
  assert.deepEqual(a, allePortraets());
  const gross = FIGUREN.flatMap((f) => STIMMUNGEN.map((s) => portraet(f, { stimmung: s })));
  // „Sie“ hat kein Gesicht: eine Stimmung, die anderen drei
  assert.equal(new Set(gross).size, 1 + 5 * 3);
  assert.match(portraet('lot'), /width="200" height="200"/);
  assert.match(portraet('lot', { groesse: 'klein' }), /width="56" height="56"/);
  assert.match(portraet('lot', { groesse: 64 }), /width="64" height="64"/);
  assert.match(portraet('lot', { groesse: 'klein' }), /fig-klein/);
  assert.match(portraet('lot'), /fig-fein/);
  assert.ok(portraet('klingel', { groesse: 'klein' }).length < portraet('klingel').length, 'klein ohne feine Details');
  assert.equal(portraet('sie', { stimmung: 'froh' }), portraet('sie'));
});

test('portraet und gimmick: wohlgeformtes SVG mit role="img", deutschem aria-label und <title>', () => {
  const { window } = new JSDOM('');
  const pruefe = (svg: string, text: string, wo: string): void => {
    const doc = new window.DOMParser().parseFromString(svg, 'image/svg+xml');
    assert.equal(doc.getElementsByTagName('parsererror').length, 0, `${wo} nicht wohlgeformt`);
    const wurzel = doc.documentElement;
    assert.equal(wurzel.tagName, 'svg');
    assert.equal(wurzel.getAttribute('role'), 'img', wo);
    assert.equal(wurzel.getAttribute('aria-label'), text, wo);
    assert.equal(wurzel.querySelector('title')?.textContent, text, wo);
    assert.match(text, /[äöüß]|\b(der|die|das|mit|und|ein|eine)\b/i, `${wo}: deutsch`);
  };
  for (const { figur, stimmung, svg } of allePortraets()) pruefe(svg, portraetText(figur, stimmung), `${figur} ${stimmung}`);
  for (const { name, svg } of alleGimmicks()) pruefe(svg, gimmickText(name), name);
  assert.match(portraetText('grundstein'), /Gisela Grundstein/);
  assert.match(portraetText('faden'), /rotem Lesebändchen/);
  assert.match(portraetText('klingel'), /Handglocke/);
  assert.match(portraetText('lot'), /Zollstock/);
  assert.match(portraetText('schwung'), /Schal/);
  assert.match(portraetText('sie'), /goldenen Bauhelm/);
  assert.match(portraetText('lot', 'besorgt'), /Er schaut besorgt/);
  assert.match(portraetText('faden', 'froh'), /Sie lacht/);
  assert.match(gimmickText('kaertchen'), /Wer entscheidet was/);
});

test('dekorativ: aria-hidden, ohne <title>', () => {
  for (const svg of [portraet('faden', { dekorativ: true }), gimmick('lupe', { dekorativ: true })]) {
    assert.match(svg, /aria-hidden="true" focusable="false"/);
    assert.doesNotMatch(svg, /<title>|role="img"/);
  }
});

test('keine fremden Ressourcen, keine Farbwerte, keine Kennungen, keine Bewegung', () => {
  for (const svg of [...allePortraets().map((p) => p.svg), ...alleGimmicks().map((g) => g.svg)]) {
    assert.doesNotMatch(svg, /<image|<script|<foreignObject|<use|https?:\/\/(?!www\.w3\.org\/2000\/svg)/);
    assert.doesNotMatch(svg, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\bstyle=|\b(?:fill|stroke)="(?!none)/i, 'Farben nur über Klassen (tokens.css)');
    assert.doesNotMatch(svg, /<animate|@keyframes/);
    // keine id/url(#…): ein Rundbild braucht keinen Clip-Pfad, der in ausgeblendeten SVGs versagt
    assert.doesNotMatch(svg, /\sid="|url\(/);
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
  }
});

test('gimmick: alle Gegenstände der Grafik-Liste, deterministisch, Größe begrenzt', () => {
  for (const n of ['bauzaun', 'warnschild', 'kostenzettel', 'zahlenzettel', 'lieferwagen', 'lupe', 'waage', 'mensateller', 'geruest-sturm', 'lueftung', 'schulglocke', 'schulbus', 'kaertchen', 'pokal'] as const) {
    assert.ok((GIMMICKS as readonly string[]).includes(n), n);
  }
  assert.deepEqual(alleGimmicks(), alleGimmicks());
  const bilder = alleGimmicks().map((g) => g.svg);
  assert.equal(new Set(bilder).size, bilder.length);
  assert.match(gimmick('pokal'), /width="96" height="96"/);
  assert.match(gimmick('pokal', { groesse: 64 }), /width="64"/);
  assert.match(gimmick('pokal', { groesse: 4 }), /width="32"/);
  assert.match(gimmick('pokal', { groesse: 999 }), /width="240"/);
});

test('jede verwendete Klasse ist in grafik.css gestaltet', () => {
  const klassen = new Set<string>();
  for (const svg of [...allePortraets().map((p) => p.svg), ...alleGimmicks().map((g) => g.svg), portraet('lot', { klasse: 'x-test' })]) {
    for (const m of svg.matchAll(/class="([^"]*)"/g)) for (const k of (m[1] ?? '').split(/\s+/)) if (k) klassen.add(k);
  }
  klassen.delete('x-test');
  const fehlen = [...klassen].filter((k) => !new RegExp(`\\.${k}(?![\\w-])`).test(grafikCss));
  assert.deepEqual(fehlen, []);
  assert.ok(klassen.has('fig-portraet') && klassen.has('fig-gimmick'));
});
