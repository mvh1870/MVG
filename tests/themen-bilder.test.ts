// Bilder der Themen (O-55, P17.9): je Thema eine Illustration, je Teil ein Bauplan-Motiv – deterministisch, ohne fremde
// Ressourcen und Farbwerte, dekorativ (aria-hidden), jede Klasse in src/stil/theorie.css gestaltet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMEN_BILDER, kopfMotiv, themaBild } from '../src/grafik/themen-bilder.ts';

const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string) => { window: Window & typeof globalThis } };
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const theorieCss = readFileSync(resolve(WURZEL, 'src/stil/theorie.css'), 'utf8');
const MOTIVE = ['1', '2', '3', '4', 'anhang', 'alle'];
const alle = (): string[] => [...THEMEN_BILDER.map((t) => themaBild(t)), ...MOTIVE.map((m) => kopfMotiv(m))];

/** Kennungen der Themen aus den Kopfdaten der Inhalte. */
function themenDerInhalte(): string[] {
  const ordner = resolve(WURZEL, 'inhalte/theorie');
  return readdirSync(ordner).filter((n) => n.endsWith('.md')).map((n) => /^thema:\s*(\S+)/mu.exec(readFileSync(resolve(ordner, n), 'utf8'))?.[1] ?? n);
}

test('themaBild: jedes Thema der Inhalte hat eine eigene Illustration, dazu das Inhaltsverzeichnis', () => {
  const themen = themenDerInhalte();
  assert.equal(themen.length, 16);
  for (const t of themen) assert.ok(THEMEN_BILDER.includes(t), `ohne Bild: ${t}`);
  assert.ok(THEMEN_BILDER.includes('uebersicht'));
  const bilder = THEMEN_BILDER.map((t) => themaBild(t));
  assert.equal(new Set(bilder.map((b) => b.replace(/data-bild="[^"]+"/u, ''))).size, bilder.length, 'zwei Themen mit gleichem Bild');
  assert.match(themaBild('gibt-es-nicht'), /data-bild="uebersicht"/u);
});

test('kopfMotiv: vier Teile, Anhang und Fries sind verschieden; Unbekanntes fällt auf Teil I', () => {
  const motive = MOTIVE.map((m) => kopfMotiv(m));
  assert.equal(new Set(motive).size, motive.length);
  assert.match(kopfMotiv('9'), /data-motiv="1"/u);
  for (const t of ['1', '2', '3', '4']) assert.match(kopfMotiv('alle'), new RegExp(`km-t${t}`, 'u'));
});

test('Bilder der Themen: deterministisch, wohlgeformt, dekorativ', () => {
  assert.deepEqual(alle(), alle());
  const { window } = new JSDOM('');
  for (const svg of alle()) {
    const doc = new window.DOMParser().parseFromString(svg, 'image/svg+xml');
    assert.equal(doc.getElementsByTagName('parsererror').length, 0, svg.slice(0, 80));
    const wurzel = doc.documentElement;
    assert.equal(wurzel.getAttribute('aria-hidden'), 'true');
    assert.equal(wurzel.getAttribute('focusable'), 'false');
    assert.equal(wurzel.getAttribute('role'), null, 'Schmuck neben der Überschrift: keine eigene Rolle');
    assert.equal(doc.getElementsByTagName('text').length, 0, 'keine Schrift im Bild');
    assert.doesNotMatch(svg, /NaN|undefined|Infinity/u);
  }
});

test('Bilder der Themen: keine fremden Ressourcen, keine Farbwerte, keine Bewegung, keine Kennungen', () => {
  for (const svg of alle()) {
    assert.doesNotMatch(svg, /<image|<script|<foreignObject|https?:\/\//u);
    assert.doesNotMatch(svg, /#[0-9a-f]{3,8}\b|rgba?\(|\bstyle=|\bfill="|\bstroke="/iu, 'Farben nur über Klassen (theorie.css)');
    assert.doesNotMatch(svg, /<animate|@keyframes/u);
    assert.doesNotMatch(svg, /\bid="|url\(/u, 'keine Kennungen: das Bild darf mehrfach auf einer Seite stehen');
  }
});

test('Bilder der Themen: jede verwendete Klasse ist in theorie.css gestaltet', () => {
  const klassen = new Set<string>();
  for (const svg of alle()) for (const m of svg.matchAll(/class="([^"]*)"/gu)) for (const k of (m[1] ?? '').split(/\s+/u)) if (k !== '') klassen.add(k);
  const fehlen = [...klassen].filter((k) => !new RegExp(`\\.${k}(?![\\w-])`, 'u').test(theorieCss));
  assert.deepEqual(fehlen, []);
});
