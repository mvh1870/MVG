// Stil-Regeln, die sich messen lassen (P0.3, docs/STIL.md): Farben nur in tokens.css,
// jede var() aufgelöst, Import-Reihenfolge, Ikonen ohne Farbe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { liesTokens } from '../src/stil/farben.ts';
import { SYMBOLE, statusSymbol, symbol, type StatusStufe, type SymbolName } from '../src/stil/symbole.ts';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (datei: string) => readFileSync(resolve(WURZEL, 'src/stil', datei), 'utf8');
const ohneKommentare = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const KOMPONENTEN = ['basis.css', 'leitstand.css', 'start.css', 'theorie.css'] as const;
const tokensCss = lies('tokens.css');
const tokens = liesTokens(tokensCss);

test('Komponenten-CSS enthält keine Farbwerte (nur var(--…) aus tokens.css)', () => {
  const funde: string[] = [];
  for (const datei of [...KOMPONENTEN, 'index.css']) {
    const css = ohneKommentare(lies(datei));
    for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/g)) {
      funde.push(`${datei}: ${m[0]} bei „${css.slice(Math.max(0, (m.index ?? 0) - 40), (m.index ?? 0) + 20).replace(/\s+/g, ' ')}“`);
    }
    for (const m of css.matchAll(/:\s*[^;{}]*(?<![-\w])(white|black|red|green|blue|gray|grey|orange|yellow|purple|pink|navy|gold|teal)(?![-\w])[^;{}]*;/gi)) {
      funde.push(`${datei}: benannte Farbe ${m[1]}`);
    }
  }
  assert.deepEqual(funde, []);
});

test('jede var(--x) ist in tokens.css oder in den Stildateien deklariert oder hat einen Rückfallwert', () => {
  const deklariert = new Set<string>(tokens.keys());
  const alle = [tokensCss, ...KOMPONENTEN.map(lies)].map(ohneKommentare);
  for (const css of alle) for (const m of css.matchAll(/(--[\w-]+)\s*:/g)) if (m[1]) deklariert.add(m[1]);
  const offen: string[] = [];
  for (const [i, css] of alle.entries()) {
    for (const m of css.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) {
      if (m[1] && !m[2] && !deklariert.has(m[1])) offen.push(`${i === 0 ? 'tokens.css' : KOMPONENTEN[i - 1]}: ${m[1]}`);
    }
  }
  assert.deepEqual([...new Set(offen)], []);
});

test('index.css bindet Schriften zuerst und dann in fester Reihenfolge ein', () => {
  const importe = [...ohneKommentare(lies('index.css')).matchAll(/@import\s+"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(importe, ['../generiert/schriften.css', './tokens.css', './basis.css', './leitstand.css', './start.css', './theorie.css']);
});

test('tokens.css: Farbtoken sind Hex- oder rgba-Werte bzw. Verweise, Schriftstapel nennen die eingebetteten Familien', () => {
  for (const [name, wert] of tokens) {
    if (/^--(rolle|status|koralle|tuerkis|gold|navy|notiz|id|figur|tinte|linie|flaeche|welt-a)-?/.test(name) && !/^--(gold-hell-a|koralle-a|koralle-text-a|tuerkis-a|navy-a)\d/.test(name)) {
      assert.match(wert, /^(#[0-9A-Fa-f]{6}|var\(--[\w-]+\))$/, `${name}: ${wert}`);
    }
  }
  for (const [token, familie] of [['--schrift-text', 'IBM Plex Sans'], ['--schrift-anzeige', 'Big Shoulders Display'], ['--schrift-label', 'Barlow Condensed'], ['--schrift-mono', 'IBM Plex Mono'], ['--schrift-hand', 'Caveat']] as const) {
    assert.ok(tokens.get(token)?.startsWith(`"${familie}"`), token);
  }
});

test('Schriftgewichte in den Stildateien sind nur eingebettete Schnitte (400–800)', () => {
  const gewichte = new Set<string>();
  for (const datei of KOMPONENTEN) {
    const css = ohneKommentare(lies(datei));
    for (const m of css.matchAll(/font-weight:\s*(\d+)/g)) if (m[1]) gewichte.add(m[1]);
    for (const m of css.matchAll(/\bfont:\s*(\d{3})\s/g)) if (m[1]) gewichte.add(m[1]);
  }
  for (const g of gewichte) assert.ok(['400', '500', '600', '700', '800'].includes(g), `Gewicht ${g}`);
});

test('Ikonen: 24er-Raster, dekorativ, ohne eigene Farbe', () => {
  const namen = Object.keys(SYMBOLE) as SymbolName[];
  assert.ok(namen.length >= 30);
  for (const n of namen) {
    const svg = symbol(n);
    assert.match(svg, /^<svg class="symbol[^"]*" viewBox="0 0 24 24" aria-hidden="true" focusable="false">/);
    assert.doesNotMatch(svg, /fill="#|stroke="#|style=/, n);
  }
  assert.match(symbol('vorspulen'), /class="symbol gefuellt"/);
  for (const s of ['ok', 'mittel', 'kritisch', 'neutral'] as StatusStufe[]) {
    const svg = statusSymbol(s);
    assert.match(svg, new RegExp(`data-status="${s}"`));
    assert.match(svg, /class="form"/);
  }
});
