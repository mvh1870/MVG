// Stationsgerüst (P1.3): liest die Übersichtstabelle in docs/DREHBUCH.md und prüft die Abnahme –
// Hauptpfad 25–35 Min, Express ~12 Min, alle 13 Kapitel berührt, Monat/LPH gegen die Fall-Bibel,
// Statuswerte im Format von docs/INHALTSFORMAT.md 2.7, Kapitelübersicht (Abschnitt 5) passend zur Tabelle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { WURZEL } from '../werkzeuge/kette.mjs';

const text = readFileSync(path.join(WURZEL, 'docs', 'DREHBUCH.md'), 'utf8');
const tabelle = text.slice(text.indexOf('<!-- stationen:anfang -->'), text.indexOf('<!-- stationen:ende -->'));
const zeilen = tabelle.split('\n').filter((z) => z.startsWith('| ') && !z.startsWith('| ID') && !z.startsWith('|---'));
const zellen = (z: string): string[] => z.slice(1, -1).split('|').map((s) => s.trim());
const zahl = (s: string): number => Number(s.replace(',', '.'));

interface Station { id: string, art: string, monat: string, lph: string, kapitel: string[], statusA: string, statusB: string, min: number, express: number }
const stationen: Station[] = zeilen.map((z) => {
  const [id = '', art = '', monat = '', lph = '', , kapitel = '', statusA = '', statusB = '', min = '', express = ''] = zellen(z);
  return { id, art, monat, lph, kapitel: kapitel.split(',').map((k) => k.trim()), statusA, statusB, min: zahl(min), express: zahl(express) };
});

test('Drehbuch: alle Stationen des Hauptpfads in der Tabelle', () => {
  const ids = stationen.map((s) => s.id);
  assert.deepEqual(ids, ['prolog', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'wendepunkt', 'rueckspulen',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'wirklichkeit', 'ausgang', 'epilog']);
  for (const s of stationen) assert.ok(!Number.isNaN(s.min) && !Number.isNaN(s.express), `${s.id}: Minuten lesbar`);
});

test('Drehbuch: Hauptpfad 25–35 Min, Express ~12 Min', () => {
  const haupt = stationen.reduce((a, s) => a + s.min, 0);
  const express = stationen.reduce((a, s) => a + s.express, 0);
  assert.ok(haupt >= 25 && haupt <= 35, `Hauptpfad ${haupt} Min`);
  assert.ok(express >= 11 && express <= 13, `Express ${express} Min`);
  assert.match(text, new RegExp(`Summe Hauptpfad ${String(haupt).replace('.', ',')} Min.*Express ${String(express).replace('.', ',')} Min`, 'u'));
});

test('Drehbuch: alle 13 Kapitel berührt; Abschnitt 5 passt zur Tabelle', () => {
  const kap = new Map<number, Set<string>>();
  for (const s of stationen) for (const k of s.kapitel) {
    const n = Number(k.split('.')[0]);
    assert.ok(n >= 1 && n <= 13, `${s.id}: Kapitel „${k}“`);
    if (!kap.has(n)) kap.set(n, new Set());
    kap.get(n)?.add(s.id);
  }
  assert.deepEqual([...kap.keys()].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  const abschnitt5 = text.slice(text.indexOf('## 5 Kapitel ↔ Stationen'));
  for (const z of abschnitt5.split('\n').filter((x) => /^\| \d+ /u.test(x))) {
    const [k = '', st = ''] = zellen(z);
    const n = Number(k.split(' ')[0]);
    const liste = st.replace(/\s*\(.*\)$/u, '').split(',').map((x) => x.trim());
    assert.deepEqual(liste.sort(), [...(kap.get(n) ?? [])].sort(), `Kapitel ${n}`);
  }
});

test('Drehbuch: Monat und LPH passen zur Zeitachse der Fall-Bibel', () => {
  const fall = readFileSync(path.join(WURZEL, 'inhalte', 'fall.md'), 'utf8');
  const kopf = parse(fall.split('---')[1] ?? '') as { 'lph-stand': Record<string, string> };
  for (const s of stationen) {
    if (s.monat === '–') { assert.equal(s.lph, '–', `${s.id}: LPH ohne Monat`); continue; }
    assert.equal(kopf['lph-stand'][s.monat], s.lph, `${s.id}: Monat ${s.monat}, LPH ${s.lph}`);
  }
});

test('Drehbuch: Statuswerte vollständig und im Wertebereich; Startstand jeder Station A1–A6/B1–B6 wie in inhalte/', () => {
  const stufe = ['niedrig', 'mittel', 'hoch', 'sehr hoch'];
  const pruefe = (id: string, s: string): void => {
    if (s === '–') return;
    const [ef = '', ku = '', or = '', ue = '', tr = ''] = s.split('·').map((x) => x.trim());
    assert.ok(Number(ef) >= 0 && Number(ef) <= 5, `${id}: Entscheidungsfähigkeit ${ef}`);
    assert.ok(stufe.includes(ku) && stufe.includes(tr), `${id}: Stufen ${ku}/${tr}`);
    assert.ok(Number(or) >= 0 && Number(ue) >= 0, `${id}: Zählwerte ${or}/${ue}`);
  };
  for (const s of stationen) {
    pruefe(`${s.id} A`, s.statusA);
    pruefe(`${s.id} B`, s.statusB);
    if (s.id.startsWith('A')) assert.notEqual(s.statusA, '–', `${s.id}: Status A fehlt`);
    if (s.id.startsWith('B')) assert.notEqual(s.statusB, '–', `${s.id}: Status B fehlt`);
  }
  const start = (datei: string): string => {
    const k = (parse(datei.split('---')[1] ?? '') as { 'status-start': Record<string, string | number> })['status-start'];
    return ['entscheidungsfaehigkeit', 'kostenunsicherheit', 'offene-risiken', 'ungeklaerte-entscheidungen', 'terminrisiko']
      .map((x) => String(k[x]).replace(/\s*\(.*\)$/u, '')).join(' · ');
  };
  // seit P5.10 liegen alle Stationen in inhalte/ (vorher nur A3/B3 des Durchstichs)
  for (const w of ['A', 'B'] as const) {
    for (let nr = 1; nr <= 6; nr += 1) {
      const id = `${w}${nr}`;
      const datei = readFileSync(path.join(WURZEL, 'inhalte', 'story', id, 'station.md'), 'utf8');
      const s = stationen.find((x) => x.id === id);
      assert.equal(w === 'A' ? s?.statusA : s?.statusB, start(datei), id);
    }
  }
});

// R56: mit der Legende nach k4.2-p1 (R ausführungs-, A letztverantwortlich) nennt jede RACI-Zeile in B1 zwei Handlungen –
// sonst führt R die Handlung von A aus (L-168: „Vorlage und Freigabe“ statt „freigeben“)
test('RACI B1: jede Zeile als Prozess mit zwei Handlungen („…: X und Y“)', () => {
  const datei = readFileSync(path.join(WURZEL, 'inhalte', 'story', 'B1', 'station.md'), 'utf8');
  const kopf = datei.match(/::: raci\n---\n([\s\S]*?)\n---/u)?.[1] ?? '';
  const zeilen = (parse(kopf) as { zeilen: { titel: string }[] }).zeilen;
  assert.ok(zeilen.length >= 5);
  for (const z of zeilen) assert.match(z.titel, /^[^:]+: \S.* und \S/u, z.titel);
});
