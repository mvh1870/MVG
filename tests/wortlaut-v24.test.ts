// Eigene Worte (O-37, R78): Die Texte der Werkzeuge und des Glossars geben den Standard V2.4 inhaltlich wieder, nicht im
// Wortlaut. Probe: kein wortgleicher Lauf von neun oder mehr Wörtern aus quellen/v2.4 (Groß-/Kleinschreibung und
// Satzzeichen unbeachtet). Die Themen (inhalte/theorie) zitieren den Standard nicht, tragen aber eigene Zitat-Pflichten und
// liegen außerhalb dieser Probe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const WURZEL = resolve(import.meta.dirname, '..');
const N = 9;
const woerter = (t: string): string[] => t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/u).filter((w) => w !== '');

const quelle = new Set<string>();
for (const f of readdirSync(resolve(WURZEL, 'quellen/v2.4'))) {
  const w = woerter(readFileSync(resolve(WURZEL, 'quellen/v2.4', f), 'utf8'));
  for (let i = 0; i + N <= w.length; i++) quelle.add(w.slice(i, i + N).join(' '));
}

/** Länge des längsten wortgleichen Laufs (in Wörtern) mit der Quelle, höchstens ab N Wörtern; sonst 0 */
export function laengsterLauf(text: string): number {
  const w = woerter(text);
  let best = 0;
  let start = -1;
  for (let i = 0; i + N <= w.length; i++) {
    if (quelle.has(w.slice(i, i + N).join(' '))) {
      if (start < 0) start = i;
      best = Math.max(best, i + N - start);
    } else start = -1;
  }
  return best;
}

const strings = (x: unknown, pfad: string, aus: [string, string][] = []): [string, string][] => {
  if (typeof x === 'string') aus.push([pfad, x]);
  else if (Array.isArray(x)) x.forEach((v, i) => strings(v, `${pfad}[${i}]`, aus));
  else if (x !== null && typeof x === 'object') for (const [k, v] of Object.entries(x)) strings(v, `${pfad}.${k}`, aus);
  return aus;
};

test('die Probe erkennt einen übernommenen Satz und lässt eigene Worte durch', () => {
  assert.ok(laengsterLauf('Die Projektsteuerung holt die passende fachliche Einschätzung ein, informiert den Auftraggeber und bereitet notwendige Handlungen oder Entscheidungen rechtzeitig vor.') >= N);
  assert.equal(laengsterLauf('Die Projektsteuerung holt fachlichen Rat ein, unterrichtet den Bauherrn und bereitet erforderliche Handlungen oder Entscheidungen früh genug vor.'), 0);
});

test('Werkzeuge und Glossar: kein Satz des Standards wortgleich (neun Wörter und mehr)', async () => {
  const { parse } = (await import(String('yaml'))) as { parse: (t: string) => unknown };
  const funde: string[] = [];
  for (const datei of ['inhalte/werkzeuge.yaml', 'inhalte/glossar.yaml']) {
    for (const [pfad, text] of strings(parse(readFileSync(resolve(WURZEL, datei), 'utf8')), datei.split('/').pop() ?? datei)) {
      if (/^v24:|^k\d/u.test(text)) continue; // Belege
      const n = laengsterLauf(text);
      if (n >= N) funde.push(`${pfad}: ${n} Wörter wortgleich – „${text.slice(0, 70)}…“`);
    }
  }
  assert.deepEqual(funde, []);
});

/** Text eines Themas ohne Kopfdaten, Zitate (wortgleich aus V1.2, Pflicht), Tafeln (Anzeigefassung von V1.2-Tabellen) und Tabellenzeilen (Zahlen des Beispiels) */
export function themenText(md: string): string {
  const zeilen = md.replace(/\r\n?/gu, '\n').replace(/^---\n[\s\S]*?\n---\n/u, '').split('\n');
  const aus: string[] = [];
  const stapel: boolean[] = []; // je offener Container: ausgenommen?
  let kopf = false; // innerhalb der Kopfdaten eines Containers
  let davor = false; // die vorige Zeile hat einen Container geöffnet
  for (const z of zeilen) {
    const eroeffnet = davor;
    davor = false;
    if (kopf) {
      if (z === '---') kopf = false;
      continue;
    }
    if (eroeffnet && z === '---') {
      kopf = true;
      continue;
    }
    const auf = /^:{3,}\s*(\S+)/u.exec(z);
    if (auf !== null) {
      stapel.push(auf[1] === 'zitat' || auf[1] === 'tafel');
      davor = true;
      continue;
    }
    if (/^:{3,}\s*$/u.test(z)) {
      stapel.pop();
      continue;
    }
    if (/^\s*\|/u.test(z)) continue; // Tabellenzeilen: Zahlenbeispiel, kein Satz
    if (!stapel.includes(true)) aus.push(z.replace(/\[\[zitat:[^\]]*\]\]/gu, ' '));
  }
  return aus.join('\n');
}

test('Gegenprobe: Zitate und Tafeln sind ausgenommen, übernommener Text im Thema würde gemeldet', () => {
  const satz = 'Die Projektsteuerung holt die passende fachliche Einschätzung ein, informiert den Auftraggeber und bereitet notwendige Handlungen oder Entscheidungen rechtzeitig vor.';
  const kopf = '---\ntitel: x\n---\n';
  assert.ok(laengsterLauf(themenText(`${kopf}${satz}\n`)) >= N);
  assert.equal(laengsterLauf(themenText(`${kopf}::: zitat k1-p1\n${satz}\n:::\n::: tafel t\n${satz}\n:::\n`)), 0);
  assert.ok(laengsterLauf(themenText(`${kopf}::: abschnitt a\n::: zitat k1-p1\nx\n:::\n${satz}\n:::\n`)) >= N);
});

test('Themen: kein Satz des Standards wortgleich (neun Wörter und mehr), Zitate und Tafeln ausgenommen', () => {
  const funde: string[] = [];
  const dir = resolve(WURZEL, 'inhalte/theorie');
  for (const f of readdirSync(dir).filter((d) => d.endsWith('.md') && !/^[_.]/u.test(d))) {
    const text = themenText(readFileSync(resolve(dir, f), 'utf8'));
    // je Absatz prüfen, damit der Lauf nicht über Absatzgrenzen springt
    for (const absatz of text.split(/\n\s*\n/u)) {
      const n = laengsterLauf(absatz);
      if (n >= N) funde.push(`${f}: ${n} Wörter wortgleich – „${absatz.trim().slice(0, 110)}…“`);
    }
  }
  assert.deepEqual(funde, []);
});
