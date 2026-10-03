// Akzentpalette (O-57, P17.3): jeder Ton hat Grundton, helle Fläche und Textton; die Pflicht-Paare stehen in
// paare.json und erreichen ihren Mindestkontrast, gerechnet gegen tokens.css.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kontrast, liesTokens, loese, type Paar } from '../src/stil/farben.ts';
import { AKZENTE, AKZENT_ROLLEN } from '../src/stil/akzente.ts';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = liesTokens(readFileSync(resolve(WURZEL, 'src/stil/tokens.css'), 'utf8'));
const { paare } = JSON.parse(readFileSync(resolve(WURZEL, 'src/stil/paare.json'), 'utf8')) as { paare: Paar[] };
const k = (a: string, b: string): number => kontrast(loese(tokens, a), loese(tokens, b));

test('Akzentpalette: sieben Töne, je Grundton, -soft und -text als Hex in tokens.css', () => {
  assert.equal(AKZENTE.length, 7);
  for (const a of AKZENTE) {
    for (const n of [`--akzent-${a}`, `--akzent-${a}-soft`, `--akzent-${a}-text`]) assert.match(loese(tokens, n), /^#[0-9A-F]{6}$/, n);
  }
  const werte = AKZENTE.map((a) => loese(tokens, `--akzent-${a}`));
  assert.equal(new Set(werte).size, werte.length, 'Grundtöne doppelt');
});

test('Akzentpalette: Textton ≥ 4,5:1 auf Weiß, Grund und eigener Fläche; Tinte auf Fläche; Weiß auf Textton', () => {
  const zuSchwach: string[] = [];
  for (const a of AKZENTE) {
    const t = `--akzent-${a}-text`;
    const s = `--akzent-${a}-soft`;
    for (const [x, y] of [[t, '--weiss'], [t, '--grund'], [t, s], ['--tinte', s], ['--weiss', t]] as const) {
      if (k(x, y) < 4.5) zuSchwach.push(`${x} auf ${y}: ${k(x, y).toFixed(2)}`);
      assert.ok(paare.some((p) => p.text === x && p.grund === y && !p.gross && !p.grafik), `${x} auf ${y} fehlt in paare.json`);
    }
    // Grundton als Grafik auf Navy (Leinwand) ≥ 3:1; auf Weiß ≥ 3:1 außer Sonne (dort nur mit Textton als Kante).
    if (k(`--akzent-${a}`, '--navy') < 3) zuSchwach.push(`--akzent-${a} auf --navy`);
    if (a !== 'sonne' && k(`--akzent-${a}`, '--weiss') < 3) zuSchwach.push(`--akzent-${a} auf --weiss`);
  }
  assert.deepEqual(zuSchwach, []);
});

test('Akzentpalette: Rollen der Teile und Balken sind verschieden und nutzen nur Töne der Palette', () => {
  const rollen = Object.values(AKZENT_ROLLEN);
  assert.equal(new Set(rollen).size, rollen.length);
  for (const r of rollen) assert.ok((AKZENTE as readonly string[]).includes(r), r);
});
