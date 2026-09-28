// Story aus Bauherrensicht (L-70, L-72, P12.5 R8): Das Rückgrat einer Station (station.md) sieht jede der
// sechs Rollen. Keine spielbare Figur darf dort mit Namen vorkommen – sonst liest sie in ihrer eigenen
// Rolle über sich in der dritten Person (H13). Ausgenommen: Regie-Notizen, Standpunkte (Stimme der
// Figur) und Protokolle (Teilnehmerlisten); Absender (`von:`) zeigt die Oberfläche selbst als „Sie“.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const STORY = join(dirname(fileURLToPath(import.meta.url)), '..', 'inhalte', 'story');
const NAMEN = /\b(?:Olbers|Deppe|Brenner|Hoffmeister|Kaya)\b/u;
const AUS = new Set(['regie', 'standpunkt', 'protokoll']);

test('Rückgrat der Stationen nennt keine spielbare Figur mit Namen', () => {
  const funde: string[] = [];
  for (const st of readdirSync(STORY)) {
    let text: string;
    try {
      text = readFileSync(join(STORY, st, 'station.md'), 'utf8');
    } catch {
      continue;
    }
    const stapel: string[] = [];
    text.split('\n').forEach((z, i) => {
      const auf = /^:{3,}\s+([a-z-]+)/u.exec(z);
      if (auf) {
        stapel.push(auf[1] ?? '');
        return;
      }
      if (/^:{3,}\s*$/u.test(z)) {
        stapel.pop();
        return;
      }
      if (stapel.some((b) => AUS.has(b)) || /^\s*von:/u.test(z)) return;
      if (NAMEN.test(z)) funde.push(`${st}:${i + 1} ${z.trim().slice(0, 100)}`);
    });
  }
  assert.deepEqual(funde, []);
});
