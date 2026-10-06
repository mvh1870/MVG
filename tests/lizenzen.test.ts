/*
 * Drittanbieter & Lizenzen (Audit 2026-10-06, O-64): die Angaben stammen aus den ausgelieferten Schriften
 * selbst, der OFL-Text steht unverändert, die Ansicht ist über den Fuß erreichbar und sichtbar sauber.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sichtbarVerboten } from '../werkzeuge/sichtbar.mjs';
import { SCHRIFTEN, schriftenCss, drittanbieter } from '../werkzeuge/schriften.mjs';
import { woff2Namen } from '../werkzeuge/woff2-name.mjs';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///index.html' });
const g = globalThis as unknown as Record<string, unknown>;
for (const k of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'DocumentFragment', 'Event', 'getComputedStyle']) {
  g[k] = (dom.window as unknown as Record<string, unknown>)[k];
}
after(() => dom.window.close());

const WURZEL = resolve(import.meta.dirname, '..');
const { leseRoute } = await import('../src/ui/route.ts');
const { baueLizenzen } = await import('../src/ui/flaechen/lizenzen.ts');
const { seitenFuss } = await import('../src/ui/bausteine/seite.ts');
const { W } = await import('../src/ui/woerter.ts');

test('Angaben: je eingebettete Familie genau ein Eintrag, Copyright wie in der Schrift, Lizenz OFL-1.1', async () => {
  const { komponenten } = await schriftenCss();
  assert.deepEqual(komponenten.map((k) => k.name), SCHRIFTEN.map((s) => s.familie));
  assert.deepEqual(komponenten.map((k) => k.name), ['Big Shoulders Display', 'Barlow Condensed'], 'nur die beiden eingebetteten Schriften');
  for (const k of komponenten) {
    const s = SCHRIFTEN.find((x) => x.familie === k.name);
    assert.ok(s);
    const datei = resolve(WURZEL, 'node_modules/@fontsource', s.paket, 'files', `${s.paket}-latin-${s.gewichte[0]?.gewicht}-normal.woff2`);
    assert.equal(k.copyright, (await woff2Namen(datei)).copyright, k.name);
    assert.match(k.copyright, /^Copyright 20\d\d The .+ Project Authors \(https:\/\/github\.com\//u, k.name);
    assert.equal(k.spdx, 'OFL-1.1');
    assert.match(k.upstream, /^https:\/\/github\.com\//u);
    assert.equal(k.paketVersion, '5.3.0');
  }
});

test('OFL-Text unverändert aus der LICENSE-Datei des Pakets, vollständig bis zum Haftungsausschluss', async () => {
  const { komponenten } = await schriftenCss();
  const { oflText } = await drittanbieter(komponenten);
  const lizenz = readFileSync(resolve(WURZEL, 'node_modules/@fontsource/barlow-condensed/LICENSE'), 'utf8');
  assert.ok(lizenz.includes(oflText), 'wortgleich im Original enthalten');
  assert.match(oflText, /^-+\nSIL OPEN FONT LICENSE Version 1\.1 - 26 February 2007\n/u);
  for (const teil of ['PREAMBLE', 'DEFINITIONS', 'PERMISSION & CONDITIONS', 'TERMINATION', 'DISCLAIMER']) assert.ok(oflText.includes(teil), teil);
  assert.match(oflText, /OTHER DEALINGS IN THE FONT SOFTWARE\.$/u);
});

test('Ansicht: Einträge, Copyright, Nutzung, OFL-Text, Druckknopf; sichtbar ohne verbotene Wörter', async () => {
  const el = baueLizenzen({ version: '', bedienbar: true });
  const { komponenten, oflText } = await drittanbieter((await schriftenCss()).komponenten);
  assert.equal(el.querySelectorAll('[data-pruef="lz-komponente"]').length, 2);
  assert.deepEqual([...el.querySelectorAll('[data-pruef="lz-copyright"]')].map((d) => d.textContent), komponenten.map((k) => k.copyright));
  assert.equal(el.querySelector('[data-pruef="lz-ofl"]')?.textContent, oflText);
  assert.equal(el.querySelector('[data-pruef="lz-ofl"]')?.getAttribute('lang'), 'en');
  assert.ok(el.querySelector('[data-pruef="lizenzen-drucken"]'));
  assert.ok(el.querySelector('[data-pruef="lz-nutzung"]')?.textContent?.includes('interne Schulung'));
  assert.deepEqual(sichtbarVerboten(el.textContent ?? ''), []);
  // Leinwand-Fassung ohne Knöpfe
  assert.equal(baueLizenzen({ version: '', bedienbar: false }).querySelector('button'), null);
});

test('Erreichbar: Route #lizenzen und Link im Fuß jeder Seite', () => {
  assert.deepEqual(leseRoute('#lizenzen'), { flaeche: 'lizenzen' });
  assert.deepEqual(leseRoute('#LIZENZEN'), { flaeche: 'lizenzen' });
  assert.deepEqual(leseRoute('#lizenzen/x'), { flaeche: 'start' });
  const link = seitenFuss(true).querySelector('a[data-pruef="lizenzen"]');
  assert.equal(link?.getAttribute('href'), '#lizenzen');
  assert.equal(link?.textContent, W.rahmen.lizenzen);
  assert.equal(seitenFuss(false).querySelector('a[data-pruef="lizenzen"]'), null);
});

test('Einzeldatei: Rechtsseiten zeigen nur mit gültiger Meta-Angabe auf die veröffentlichte Seite', async () => {
  const { rechtsSeite } = await import('../src/ui/bausteine/seite.ts');
  assert.equal(rechtsSeite('impressum.html'), 'impressum.html');
  const meta = document.createElement('meta');
  meta.name = 'mvg-rechtsseiten';
  document.head.append(meta);
  for (const [wert, erwartet] of [
    ['https://www.governancekompass.de/', 'https://www.governancekompass.de/impressum.html'],
    ['javascript:alert(1)//', 'impressum.html'],
    ['http://www.governancekompass.de/', 'impressum.html'],
    ['https://www.governancekompass.de/x/', 'impressum.html'],
  ] as const) {
    meta.content = wert;
    assert.equal(rechtsSeite('impressum.html'), erwartet, wert);
  }
  meta.remove();
});
