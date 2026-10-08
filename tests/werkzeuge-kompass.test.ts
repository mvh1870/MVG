/*
 * Exportpaket „Werkzeuge Kompass“ (L-431): eigenständige Werkzeugseite ohne Geschichte und Themen, Inhalte ohne interne
 * Belege, Quellcode ohne Kommentare bei gleicher Wirkung.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ohneKommentare, gleicheWirkung } from '../werkzeuge/ohne-kommentare.mjs';
import { alsText, datenExport, interneSpuren, reduziereInhalte } from '../werkzeuge/werkzeuge-kompass.mjs';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///Werkzeuge-Kompass.html' });
const g = globalThis as unknown as Record<string, unknown>;
for (const k of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'DocumentFragment', 'Event', 'getComputedStyle']) {
  g[k] = (dom.window as unknown as Record<string, unknown>)[k];
}
after(() => dom.window.close());

const WURZEL = resolve(import.meta.dirname, '..');
const { inhalte } = await import('../src/inhalte/index.ts');
const { setzeEigenstaendig } = await import('../src/ui/bausteine/seite.ts');
const { baueExplore, WERKZEUGE } = await import('../src/ui/flaechen/explore.ts');
const { W } = await import('../src/ui/woerter.ts');

const alle = JSON.parse(readFileSync(resolve(WURZEL, 'src/generiert/inhalte.json'), 'utf8'));

test('Kommentare: weg, aber // und /* in Zeichenketten, Vorlagen und regulären Ausdrücken bleiben', async () => {
  const q = [
    '/* Kopf */',
    "const a = 'http://x/*y*/'; // Rest",
    'const b = `${a}/* nicht */${`${"//"}`}`; /* mitten */ const c = 1;',
    'const d = /\\/\\*[^/]*\\//u.test(a) ? 4 / 2 : 0; // Teilen',
    '  // eigene Zeile',
    'export { b, c, d };',
  ].join('\n');
  const r = ohneKommentare(q, 'ts');
  assert.equal(r, [
    "const a = 'http://x/*y*/';",
    'const b = `${a}/* nicht */${`${"//"}`}`;   const c = 1;',
    'const d = /\\/\\*[^/]*\\//u.test(a) ? 4 / 2 : 0;',
    'export { b, c, d };',
    '',
  ].join('\n'));
  assert.ok(await gleicheWirkung(q, r, 'ts'));
  assert.equal(ohneKommentare('a { b: url("x/*y*/"); } /* weg */\n', 'css'), 'a { b: url("x/*y*/"); }\n');
});

test('Inhalte der eigenständigen Seite: keine Belege, keine Themen, keine Fundstellen; Vergleich mit Beispiel', () => {
  const r = reduziereInhalte(alle);
  const text = JSON.stringify(r);
  assert.deepEqual(r.theorie, {});
  assert.deepEqual(r.abbildungen, []);
  assert.ok(Object.values(r.glossar).every((e) => (e as { vorkommen: { kapitel: number[] } }).vorkommen.kapitel.length === 0));
  assert.ok(r.kompass.every((k: Record<string, unknown>) => !('beleg' in k)));
  assert.equal(r.geschichte.kapitel.length, 1);
  assert.notEqual(r.geschichte.kapitel[0].vergleich, null);
  assert.ok(!r.werkzeuge.glossar.vorspann.ergebnis.includes('Themen'));
  assert.deepEqual(interneSpuren(text), []);
  const d = datenExport(r, '2026-10-08');
  assert.equal(d.werkzeuge.length, WERKZEUGE.length);
  assert.deepEqual(d.werkzeuge.map((w: { kennung: string }) => w.kennung), [...WERKZEUGE]);
  assert.doesNotMatch(JSON.stringify(d), /<[a-z]+[ >]/u, 'Daten ohne HTML');
  assert.deepEqual(interneSpuren(JSON.stringify(d)), []);
});

test('Spurensuche: Kennungen gefunden, SVG-Pfade nicht', () => {
  assert.equal(interneSpuren('Entscheid L-12 gilt').length, 1);
  assert.equal(interneSpuren('Absatz k9.3-p1').length, 1);
  assert.deepEqual(interneSpuren('M-6,0.5L-2,4.5L6,-4.5 und M5,-5L-5,5'), []);
  assert.equal(alsText('<p>A &amp; B</p><ul><li>x</li></ul>'), 'A & B\n– x');
});

test('Eigenständige Seite: Kopf und Kicker „Werkzeuge Kompass“, keine Bereiche, kein Präsentieren, Glossar ohne Themen', () => {
  setzeEigenstaendig(true);
  try {
    const seite = baueExplore({ inhalte: { ...inhalte, theorie: {} }, werkzeug: 'glossar', bedienbar: true });
    assert.equal(seite.querySelector('.kopf-name')?.textContent, W.werkzeugeKompass.name);
    assert.equal(seite.querySelector('.gs-kicker')?.textContent, 'Werkzeuge Kompass');
    assert.equal(seite.querySelector('.kopf-bereiche'), null);
    assert.equal(seite.querySelector('[data-pruef="praesentieren"]'), null);
    assert.equal(seite.querySelectorAll('.glossar-ort').length, 0);
    const ziele = [...seite.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? '');
    assert.ok(ziele.every((h) => !/^#(story|theorie|regie|start)/u.test(h)), ziele.join(' '));
  } finally {
    setzeEigenstaendig(false);
  }
  const haupt = baueExplore({ inhalte, werkzeug: 'glossar', bedienbar: true });
  assert.equal(haupt.querySelector('.gs-kicker')?.textContent, W.werkzeuge.bereich, 'Hauptseite unverändert');
  assert.notEqual(haupt.querySelector('.kopf-bereiche'), null);
});
