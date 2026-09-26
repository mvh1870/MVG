// Kontrast der erlaubten Text/Grund-Paare (P0.3): gemessen gegen src/stil/tokens.css,
// Liste aus src/stil/paare.json, gespiegelt als Tabelle in docs/STIL.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kontrast, liesTokens, loese, mindestKontrast, type Paar } from '../src/stil/farben.ts';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = liesTokens(readFileSync(resolve(WURZEL, 'src/stil/tokens.css'), 'utf8'));
const { paare } = JSON.parse(readFileSync(resolve(WURZEL, 'src/stil/paare.json'), 'utf8')) as { paare: Paar[] };
const stilDoku = readFileSync(resolve(WURZEL, 'docs/STIL.md'), 'utf8');

const schluessel = (p: Pick<Paar, 'text' | 'grund'>) => `${p.text} auf ${p.grund}`;
const verhaeltnis = (p: Paar) => kontrast(loese(tokens, p.text), loese(tokens, p.grund));

test('Kontrastrechnung stimmt mit WCAG-Referenzwerten überein', () => {
  assert.equal(Number(kontrast('#000000', '#FFFFFF').toFixed(2)), 21);
  assert.equal(kontrast('#0C1C33', '#0C1C33'), 1);
  // #767676 auf Weiß ist der bekannte Grenzwert knapp über 4,5:1
  assert.ok(kontrast('#767676', '#FFFFFF') >= 4.5);
  assert.ok(kontrast('#777777', '#FFFFFF') < 4.5);
  assert.equal(mindestKontrast({ text: '--a', grund: '--b', wo: 'x' }), 4.5);
  assert.equal(mindestKontrast({ text: '--a', grund: '--b', wo: 'x', gross: true }), 3);
  assert.equal(mindestKontrast({ text: '--a', grund: '--b', wo: 'x', grafik: true }), 3);
});

test('tokens.css enthält die Markenfarben aus O-11 unverändert', () => {
  const soll: Record<string, string> = {
    '--navy': '#0C1C33', '--gold': '#A8823C', '--petrol': '#146878', '--gruen': '#349068',
    '--koralle': '#E4572E', '--tuerkis': '#12A4A0', '--frischgruen': '#3FB57A',
  };
  for (const [name, wert] of Object.entries(soll)) assert.equal(loese(tokens, name).toUpperCase(), wert, name);
});

test('paare.json: jedes Paar ist eindeutig, begründet und löst auf Hex-Farben auf', () => {
  assert.ok(paare.length >= 50, `nur ${paare.length} Paare`);
  const gesehen = new Set<string>();
  for (const p of paare) {
    assert.ok(!gesehen.has(schluessel(p)), `doppelt: ${schluessel(p)}`);
    gesehen.add(schluessel(p));
    assert.ok(p.wo.trim().length > 3, `ohne Begründung: ${schluessel(p)}`);
    assert.match(loese(tokens, p.text), /^#[0-9a-f]{6}$/i, p.text);
    assert.match(loese(tokens, p.grund), /^#[0-9a-f]{6}$/i, p.grund);
  }
});

test('jedes erlaubte Paar erreicht seinen Mindestkontrast (4,5:1, groß/Grafik 3:1)', () => {
  const zuSchwach = paare
    .map((p) => ({ p, k: verhaeltnis(p), min: mindestKontrast(p) }))
    .filter(({ k, min }) => k < min)
    .map(({ p, k, min }) => `${schluessel(p)}: ${k.toFixed(2)} < ${min}`);
  assert.deepEqual(zuSchwach, []);
});

test('docs/STIL.md führt genau die Paare aus paare.json mit dem gemessenen Wert', () => {
  const anfang = stilDoku.indexOf('<!-- paare:anfang -->');
  const ende = stilDoku.indexOf('<!-- paare:ende -->');
  assert.ok(anfang >= 0 && ende > anfang, 'Marken <!-- paare:anfang/ende --> fehlen in docs/STIL.md');
  const zeilen = stilDoku.slice(anfang, ende).split('\n').filter((z) => /^\|\s*`--/.test(z));
  const inDoku = new Map<string, { wert: number, art: string }>();
  for (const z of zeilen) {
    const zellen = z.split('|').map((c) => c.trim());
    const text = /`(--[\w-]+)`/.exec(zellen[1] ?? '')?.[1];
    const grund = /`(--[\w-]+)`/.exec(zellen[2] ?? '')?.[1];
    const wert = Number((zellen[3] ?? '').replace(/:1$/, '').replace(',', '.'));
    assert.ok(text && grund && Number.isFinite(wert), `unlesbare Zeile: ${z}`);
    inDoku.set(`${text} auf ${grund}`, { wert, art: zellen[4] ?? '' });
  }
  const fehlen = paare.filter((p) => !inDoku.has(schluessel(p))).map(schluessel);
  const zuviel = [...inDoku.keys()].filter((k) => !paare.some((p) => schluessel(p) === k));
  assert.deepEqual(fehlen, [], 'in docs/STIL.md fehlen Paare');
  assert.deepEqual(zuviel, [], 'docs/STIL.md nennt Paare, die paare.json nicht erlaubt');
  for (const p of paare) {
    const eintrag = inDoku.get(schluessel(p));
    assert.ok(eintrag);
    assert.ok(Math.abs(eintrag.wert - verhaeltnis(p)) < 0.051, `${schluessel(p)}: Doku ${eintrag.wert}, gemessen ${verhaeltnis(p).toFixed(2)}`);
    const erwarteteArt = p.grafik ? 'Grafik' : p.gross ? 'groß' : 'Text';
    assert.equal(eintrag.art, erwarteteArt, `${schluessel(p)}: Art`);
  }
});

test('CSS setzt Text nur in Farben, die als Textfarbe eines erlaubten Paars geführt sind', async () => {
  const { readdirSync } = await import('node:fs');
  const erlaubt = new Set(paare.map((p) => p.text));
  // Kontext-Aliase: lösen je Ort auf eine Farbe aus der Paarliste auf (Welt, Rolle, Status, ID-Marke, Leiterstufe);
  // --tabelle-symbol färbt nur Symbole im Excel-Stand.
  const aliase = new Set(['--welt-text', '--welt-farbe', '--rollen-text', '--status-text', '--leiter-farbe', '--id-text', '--tabelle-symbol']);
  const funde: string[] = [];
  for (const datei of readdirSync(resolve(WURZEL, 'src/stil')).filter((n) => n.endsWith('.css'))) {
    const zeilen = readFileSync(resolve(WURZEL, 'src/stil', datei), 'utf8').split('\n');
    zeilen.forEach((z, i) => {
      for (const m of z.matchAll(/(?<![-\w])color:\s*var\((--[\w-]+)[,)]/g)) {
        const token = m[1] ?? '';
        if (!erlaubt.has(token) && !aliase.has(token)) funde.push(`${datei}:${i + 1} ${token}`);
      }
    });
  }
  // Linienfarben (--linie*) tragen nie Text (1,7–1,9:1 auf hellen Flächen).
  assert.deepEqual(funde, []);
});
