/*
 * Aufgeräumt (P16.14, O-41): keine Quelldatei, die die Seite nicht lädt, und kein Export, den niemand benutzt.
 * Zählt Importe über relative Pfade ab src/main.ts; ein Export gilt als benutzt, wenn sein Name außer in der
 * Deklaration noch irgendwo in src/, tests/ oder werkzeuge/ vorkommt (auch in der eigenen Datei).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const WURZEL = path.resolve(import.meta.dirname, '..');
const rel = (p: string): string => path.relative(WURZEL, p).replace(/\\/gu, '/');
function dateien(ordner: string): string[] {
  return readdirSync(ordner).flatMap((n) => {
    const p = path.join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p) : [p];
  });
}
const quellen = dateien(path.join(WURZEL, 'src')).filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'));
const lies = (f: string): string => readFileSync(f, 'utf8');

/** Nur von Tests benutzt, mit Absicht (Kontrastrechnung der Stilprüfung). */
const NUR_TESTS = new Set([
  'src/stil/farben.ts',
]);

test('Jede Quelldatei unter src/ wird von src/main.ts aus geladen', () => {
  const gesehen = new Set<string>();
  const offen = [path.join(WURZEL, 'src', 'main.ts')];
  while (offen.length > 0) {
    const f = offen.pop() as string;
    if (gesehen.has(f) || !existsSync(f)) continue;
    gesehen.add(f);
    if (!f.endsWith('.ts')) continue;
    for (const m of lies(f).matchAll(/(?:import|export)[^'"]*?from\s+['"](\.[^'"]+)['"]|import\s*\(?\s*['"](\.[^'"]+)['"]/gu)) {
      offen.push(path.resolve(path.dirname(f), m[1] ?? m[2] ?? ''));
    }
  }
  const tot = quellen.filter((f) => !gesehen.has(f) && !NUR_TESTS.has(rel(f))).map(rel);
  assert.deepEqual(tot, [], 'Dateien, die die Seite nicht lädt');
});

test('Kein toter Export in src/', () => {
  const alle = [...quellen, ...dateien(path.join(WURZEL, 'tests')), ...dateien(path.join(WURZEL, 'werkzeuge'))].filter((f) => /\.(ts|mjs)$/u.test(f));
  const texte = new Map(alle.map((f) => [f, lies(f)]));
  const tot: string[] = [];
  for (const f of quellen) {
    const t = texte.get(f) ?? '';
    for (const m of t.matchAll(/^export (?:async )?(?:function|const|let|class|type|interface)\s+(\w+)/gmu)) {
      const name = m[1] ?? '';
      const wort = new RegExp(`\\b${name}\\b`, 'gu');
      const benutzt = (t.match(wort) ?? []).length > 1 || alle.some((g) => g !== f && new RegExp(`\\b${name}\\b`, 'u').test(texte.get(g) ?? ''));
      if (!benutzt) tot.push(`${rel(f)}: ${name}`);
    }
  }
  assert.deepEqual(tot, []);
});

test('Jedes Bedienwort in src/ui/woerter.ts wird benutzt', async () => {
  const { W } = await import('../src/ui/woerter.ts');
  const text = quellen.filter((f) => !f.endsWith(path.join('ui', 'woerter.ts'))).map(lies).join('\n');
  const tot: string[] = [];
  const lauf = (o: Record<string, unknown>, pfad: string[]): void => {
    for (const [k, v] of Object.entries(o)) {
      const p = [...pfad, k];
      if (!new RegExp(`\\b${k}\\b`, 'u').test(text)) tot.push(p.join('.'));
      else if (v !== null && typeof v === 'object' && !Array.isArray(v)) lauf(v as Record<string, unknown>, p);
    }
  };
  lauf(W as unknown as Record<string, unknown>, ['W']);
  assert.deepEqual(tot, []);
});
