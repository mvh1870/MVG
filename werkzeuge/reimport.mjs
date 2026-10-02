#!/usr/bin/env node
// Re-Import einer neuen Whitepaper-Fassung (P10.3): vergleicht die neue Quelle je Absatz-ID mit der
// maßgeblichen (V1.2) und meldet, welche Stellen in inhalte/ und src/ eine neue, entfallene oder
// geänderte ID nennen. Schreibt nichts in quellen/ – das macht whitepaper-import.mjs mit --ziel.
//
// Aufruf:
//   node werkzeuge/reimport.mjs --docx <neue.docx> [--fassung V1.3]     importiert im Speicher
//   node werkzeuge/reimport.mjs --neu <whitepaper.json>                  bereits importierte Fassung
//        [--alt <whitepaper.json>]   Vorgabe: quellen/whitepaper/v1.2/whitepaper.json
//        [--bericht <datei.md>]      Bericht als Markdown schreiben (sonst nur Ausgabe)
//        [--streng]                  Exitcode 1, wenn eine Stelle betroffen ist
//
// Ablauf für V1.3: 1. dieses Werkzeug mit --docx → Bericht lesen; 2. whitepaper-import.mjs --docx …
// --ziel quellen/whitepaper/v1.3 --fassung V1.3; 3. betroffene Stellen anpassen; 4. `npm run pruefe`
// (der Inhaltsprüfer meldet jedes Zitat, das nicht mehr wortgleich ist).

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { alleAbschnitte, ladeWhitepaper, normalisiere, STANDARD_PFAD, vergleiche } from './whitepaper-lib.mjs';
import { erzeuge } from './whitepaper-import.mjs';
import { istHauptmodul } from './haupt.mjs';

/** @typedef {import('./whitepaper-lib.mjs').Whitepaper} Whitepaper */
/** @typedef {import('./whitepaper-lib.mjs').Vergleich} Vergleich */
/** @typedef {{ datei: string, zeile: number, id: string, art: 'geaendert' | 'entfallen' }} Stelle */

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/** Wo Absatz-IDs genannt werden (Quellen der Inhalte und Regeln im Code) */
const ORTE = ['inhalte', 'src'];
const AUSSER = new Set(['src/generiert']);
/** Block-, Abschnitts-, Abbildungs- und Glossar-IDs als ganze Wörter */
const ID = /(?<![\w.-])(k\d{1,2}(?:\.\d{1,2}){0,3}(?:-[pltb]\d{1,3})?|abb-\d+|g-[a-z0-9-]+)(?![\w-]|\.\d)/gu;

/**
 * Textdateien unter den Orten (md, yaml, ts, mjs), relativ zur Wurzel, sortiert.
 * @param {string} wurzel
 * @returns {string[]}
 */
export function dateienMitIds(wurzel = WURZEL) {
  /** @type {string[]} */
  const aus = [];
  /** @param {string} rel */
  const gehe = (rel) => {
    if (AUSSER.has(rel)) return;
    const voll = path.join(wurzel, rel);
    if (statSync(voll).isDirectory()) {
      for (const n of readdirSync(voll).sort()) gehe(`${rel}/${n}`);
    } else if (/\.(md|ya?ml|ts|mjs)$/u.test(rel)) aus.push(rel);
  };
  for (const o of ORTE) gehe(o);
  return aus;
}

/**
 * Stellen, die eine geänderte oder entfallene ID nennen.
 * @param {Vergleich} v
 * @param {{ datei: string, text: string }[]} dateien
 * @returns {Stelle[]}
 */
export function betroffeneStellen(v, dateien) {
  const geaendert = new Set(v.geaendert.map((a) => a.id));
  const entfallen = new Set(v.entfallen);
  /** @type {Stelle[]} */
  const aus = [];
  for (const { datei, text } of dateien) {
    text.split('\n').forEach((zeile, i) => {
      for (const m of zeile.matchAll(ID)) {
        const id = m[1] ?? '';
        if (geaendert.has(id)) aus.push({ datei, zeile: i + 1, id, art: 'geaendert' });
        else if (entfallen.has(id)) aus.push({ datei, zeile: i + 1, id, art: 'entfallen' });
      }
    });
  }
  return aus;
}

/**
 * Bericht als Markdown: Zusammenfassung, Änderungen je ID (gekürzt) und die betroffenen Stellen.
 * @param {Whitepaper} alt
 * @param {Whitepaper} neu
 * @param {Vergleich} v
 * @param {Stelle[]} stellen
 * @returns {string}
 */
export function bericht(alt, neu, v, stellen) {
  const kurz = (/** @type {string} */ t) => {
    const n = normalisiere(t);
    return n.length > 140 ? `${n.slice(0, 139)}…` : n;
  };
  const titel = (/** @type {Whitepaper} */ wp) => new Map(alleAbschnitte(wp).map((a) => [a.nr, a.titel]));
  const tAlt = titel(alt);
  const tNeu = titel(neu);
  const umbenannt = [...tNeu].filter(([nr, t]) => tAlt.has(nr) && tAlt.get(nr) !== t);
  const z = [
    `# Re-Import ${alt.fassung} → ${neu.fassung}`,
    '',
    `- Quelle alt: ${alt.quelle.datei} (${alt.quelle.sha256.slice(0, 12)}) · neu: ${neu.quelle.datei} (${neu.quelle.sha256.slice(0, 12)})`,
    `- IDs: neu ${v.neu.length} · entfallen ${v.entfallen.length} · geändert ${v.geaendert.length}`,
    `- Betroffene Stellen in inhalte/ und src/: ${stellen.length}`,
  ];
  if (umbenannt.length > 0) {
    z.push('', '## Abschnittstitel geändert', '');
    for (const [nr, t] of umbenannt) z.push(`- ${nr}: „${tAlt.get(nr) ?? ''}“ → „${t}“`);
  }
  if (stellen.length > 0) {
    z.push('', '## Betroffene Stellen', '', '| Datei | Zeile | ID | Art |', '| --- | --- | --- | --- |');
    for (const s of stellen) z.push(`| ${s.datei} | ${s.zeile} | ${s.id} | ${s.art === 'geaendert' ? 'Text geändert' : 'entfallen'} |`);
  }
  if (v.geaendert.length > 0) {
    z.push('', '## Geändert', '');
    for (const a of v.geaendert) z.push(`- **${a.id}**`, `  - alt: ${kurz(a.alt)}`, `  - neu: ${kurz(a.neu)}`);
  }
  if (v.entfallen.length > 0) z.push('', '## Entfallen', '', ...v.entfallen.map((id) => `- ${id}`));
  if (v.neu.length > 0) z.push('', '## Neu', '', ...v.neu.map((id) => `- ${id}`));
  return `${z.join('\n')}\n`;
}

/** @param {string[]} argv */
function leseArgumente(argv) {
  /** @type {{ docx?: string, neu?: string, alt?: string, fassung?: string, bericht?: string, streng: boolean }} */
  const o = { streng: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const wert = () => {
      const w = argv[++i];
      if (w === undefined) throw new Error(`${a} braucht einen Wert`);
      return w;
    };
    if (a === '--docx') o.docx = wert();
    else if (a === '--neu') o.neu = wert();
    else if (a === '--alt') o.alt = wert();
    else if (a === '--fassung') o.fassung = wert();
    else if (a === '--bericht') o.bericht = wert();
    else if (a === '--streng') o.streng = true;
    else throw new Error(`unbekanntes Argument: ${a}`);
  }
  if ((o.docx === undefined) === (o.neu === undefined)) throw new Error('genau eines von --docx oder --neu angeben');
  return o;
}

/**
 * @param {string[]} argv
 * @returns {number} Exitcode
 */
export function haupt(argv) {
  const o = leseArgumente(argv);
  const alt = ladeWhitepaper(o.alt ?? STANDARD_PFAD);
  const neu = o.neu !== undefined
    ? ladeWhitepaper(path.resolve(o.neu))
    : erzeuge(path.resolve(o.docx ?? ''), o.fassung ? { fassung: o.fassung } : {}).ergebnis.whitepaper;
  const v = vergleiche(alt, neu);
  const dateien = dateienMitIds().map((datei) => ({ datei, text: readFileSync(path.join(WURZEL, datei), 'utf8') }));
  const stellen = betroffeneStellen(v, dateien);
  const text = bericht(alt, neu, v, stellen);
  if (o.bericht !== undefined) {
    writeFileSync(path.resolve(o.bericht), text);
    console.log(`reimport: Bericht → ${o.bericht}`);
  }
  console.log(`reimport: ${alt.fassung} → ${neu.fassung} · neu ${v.neu.length} · entfallen ${v.entfallen.length} · geändert ${v.geaendert.length} · betroffene Stellen ${stellen.length}`);
  for (const s of stellen.slice(0, 40)) console.log(`  ${s.datei}:${s.zeile}  ${s.id}  ${s.art}`);
  if (stellen.length > 40) console.log(`  … ${stellen.length - 40} weitere (siehe --bericht)`);
  return o.streng && stellen.length > 0 ? 1 : 0;
}

if (istHauptmodul(import.meta.url)) {
  try {
    process.exitCode = haupt(process.argv.slice(2));
  } catch (e) {
    console.error(`reimport: ${e instanceof Error ? e.message : String(e)}`);
    process.exitCode = 2;
  }
}
