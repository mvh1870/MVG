// Rechenwerte im Theorie-Text (R75, Vorsorge): die Marken des Reglers „Termingewicht und Rangfolge“ (k14.5) und die
// Zuordnung der Sortierung „Vorrangig oder nicht?“ (k15.5) werden aus den Regeln nachgerechnet, damit eine
// Tippänderung nicht unbemerkt ausgeliefert wird. Regeln: V2.4 HB 3.2 (Punkte und Gewichte, 41 : 35, 31 : 31) und
// HB 2 (Produkte 10 bis 25 vorrangig, Auswirkung 5 immer vorrangig).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (datei: string): string => readFileSync(join(WURZEL, 'inhalte', 'theorie', datei), 'utf8');

/** Punkte nach den Skalen des Beispiels: A (80.000 €, 7 Tage) Kosten 2, Termin 5, Funktion 5; B (20.000 €, 28 Tage) Kosten 5, Termin 2, Funktion 5 */
const summeA = (w: number): number => 3 * 2 + w * 5 + 2 * 5;
const summeB = (w: number): number => 3 * 5 + w * 2 + 2 * 5;

function reglerMarken(md: string): { w: number; a: number; b: number }[] {
  const teil = md.slice(md.indexOf('titel: Termingewicht und Rangfolge'));
  return [...teil.matchAll(/titel: Termingewicht (\d)\nmarke: "A (\d+) : B (\d+)"/gu)].map((m) => ({ w: Number(m[1]), a: Number(m[2]), b: Number(m[3]) }));
}

function matrixPosten(md: string): { seite: string; w: number; a: number }[] {
  const start = md.indexOf('titel: Vorrangig oder nicht?');
  const teil = md.slice(start, md.indexOf('::: abschnitt', start));
  return [...teil.matchAll(/seite: (links|rechts)\n---\nW (\d) · A (\d)/gu)].map((m) => ({ seite: m[1] ?? '', w: Number(m[2]), a: Number(m[3]) }));
}

const vorrangig = (w: number, a: number): boolean => w * a >= 10 || a === 5;

test('k14.5: die Marken des Reglers folgen aus Gewichten und Punkten; Stufe 5 ist die Tabelle (41 : 35)', () => {
  const md = lies('k14-entscheidungsvorlage.md');
  const marken = reglerMarken(md);
  assert.deepEqual(marken.map((m) => m.w), [1, 2, 3, 4, 5], 'fünf Stufen Termingewicht 1 bis 5');
  for (const m of marken) assert.deepEqual([m.a, m.b], [summeA(m.w), summeB(m.w)], `Termingewicht ${m.w}`);
  assert.match(md, /\*\*Gewichtete Summe\*\* \| \| \*\*41\*\* \| \*\*35\*\*/u);
  // Gegenprobe: eine vertippte Marke fällt auf
  const falsch = reglerMarken(md.replace('marke: "A 31 : B 31"', 'marke: "A 31 : B 32"'));
  assert.ok(falsch.some((m) => m.b !== summeB(m.w)));
});

test('k15.5: die Posten der Sortierung „Vorrangig oder nicht?“ liegen nach der Matrixregel richtig', () => {
  const md = lies('k15-vorgaenge.md');
  const posten = matrixPosten(md);
  assert.ok(posten.length >= 4, `nur ${posten.length} Posten gefunden`);
  assert.ok(posten.some((p) => p.a === 5 && p.w * p.a < 10), 'ein Beispiel für die Regel „Auswirkung 5“');
  for (const p of posten) assert.equal(p.seite, vorrangig(p.w, p.a) ? 'links' : 'rechts', `W ${p.w} · A ${p.a}`);
  // Gegenprobe: W 1 · A 5 auf der falschen Seite fällt auf
  const falsch = matrixPosten(md.replace('seite: links\n---\nW 1 · A 5', 'seite: rechts\n---\nW 1 · A 5'));
  assert.ok(falsch.some((p) => p.seite !== (vorrangig(p.w, p.a) ? 'links' : 'rechts')));
});
