// Gesamttextexport (Owner-Auftrag 2026-10-06): alle Texte der Seite, die aus `inhalte/` kommen, mit fester Kennung
// und genauer Fundstelle – zum Bearbeiten außerhalb (Excel/Word) und zur Rückübernahme (`werkzeuge/textimport.mjs`).
// Nicht enthalten (Auftrag): Bedienwörter (src/ui/woerter.ts), Impressum und Datenschutz; Moderationsnotizen gibt es
// seit O-65 nicht mehr. Die Tafeln stammen aus der Quelle V1.2 und laufen über die Anzeigefassung (Zellen).
//
// Aufruf: node werkzeuge/textexport.mjs   → docs/textexport/texte.json (Kennung → Fundstelle → Originaltext)

import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { anzeigeFassung } from './anzeige-fassung.mjs';
import { schreibeAtomar } from './atomar.mjs';
import { istHauptmodul } from './haupt.mjs';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lies = (/** @type {string} */ rel) => readFileSync(path.join(WURZEL, rel), 'utf8');

/** Felder in YAML, die nie Text der Seite sind (Kennungen, Auswahlwerte, Bildnamen, Belege). */
const NICHT_TEXT = new Set(['belege', 'beleg', 'id', 'figur', 'bild-szene', 'bild-frage', 'schrift', 'art', 'loesung', 'quelle', 'wertung',
  'farbe', 'ausrichtung', 'beispiel', 'wege', 'hintergrund', 'jahreszeit', 'licht', 'wetter', 'kennung', 'reihenfolge', 'stationen', 'station', 'thema',
  'form', 'zustand', 'dringlich', 'handlung', 'entscheidung', 'eingetreten', 'anpassen', 'moeglich', 'arbeit', 'echo', 'stelle', 'erwartet', 'akzent',
  'von', 'nach', 'gegenstand', 'reserve', 'risiko', 'freigabe', 'ziele', 'kosten', 'massnahme', 'termin', 'massnahmen', 'fruehwarnungen',
  'entscheidungen', 'blockiert', 'darueber', 'beraet', 'prognose', 'warn', 'begruendung', 'werkzeuge', 'campus', 'puffer', 'schwelle', 'prozent']);
/** Kurze Werte ohne Leerzeichen, die trotzdem sichtbar sind. */
const KURZ_SICHTBAR = new Set(['titel', 'name', 'rolle', 'zeit', 'zeitraum', 'begriff', 'kurz', 'knopf', 'los', 'monat', 'projekt', 'mehr', 'weniger', 'text']);
const MD_META_TEXT = new Set(['titel', 'kurztitel', 'kurzsatz', 'kicker', 'links', 'rechts', 'marke', 'praefix', 'begriff', 'andere']);

/**
 * @typedef {{ id: string, bereich: string, datei: string, stelle: string, art: 'md-zeile'|'md-meta'|'md-titel'|'yaml'|'tafel'|'glossar',
 *   zeile: number, pfad?: (string|number)[], praefix?: string, original: string, hinweis?: string, tafel?: string, zeilenNr?: number, spalte?: number }} Eintrag
 * Art 'glossar': Begriff oder Definition, die unverändert aus der Quelle kommen (nicht in glossar.yaml); `pfad` = [Kennung, Feld].
 */

/** Markdown der Themen, Startseite und des Begriffs-Kompasses: zeilenweise. */
function ausMarkdown(rel, bereich, kurz) {
  /** @type {Eintrag[]} */ const aus = [];
  const zeilen = lies(rel).split('\n');
  let i = 0;
  /** @type {string[]} */ const stapel = [];
  let marke = '';
  const neu = (/** @type {Omit<Eintrag,'id'|'bereich'|'datei'>} */ e) => aus.push({ id: '', bereich, datei: rel, ...e });
  const meta = (/** @type {number} */ von, /** @type {number} */ bis, /** @type {string} */ ort) => {
    for (let j = von; j < bis; j++) {
      const m = /^(\s*)([a-zäöü-]+):\s+(.+)$/u.exec(zeilen[j] ?? '');
      if (!m || !MD_META_TEXT.has(m[2] ?? '')) continue;
      let wert = (m[3] ?? '').trim();
      const quote = /^".*"$/u.test(wert);
      if (quote) wert = JSON.parse(wert);
      neu({ stelle: `${ort} › ${m[2]}`, art: 'md-meta', zeile: j + 1, original: wert, hinweis: m[2] === 'andere' ? 'Liste in eckigen Klammern, Einträge mit Komma trennen' : undefined });
    }
  };
  // Dateikopf
  if (zeilen[0] === '---') {
    const ende = zeilen.indexOf('---', 1);
    meta(1, ende, 'Kopf');
    i = ende + 1;
  }
  for (; i < zeilen.length; i++) {
    const z = zeilen[i] ?? '';
    const d = /^:::\s*([a-z-]+)(?:\s+(.*))?$/u.exec(z);
    if (d) {
      const name = d[1] ?? '';
      stapel.push(`${name}${d[2] && name !== 'aufklapper' ? ` ${d[2]}` : ''}`);
      marke = '';
      if (name === 'aufklapper' && d[2]) neu({ stelle: `${stapel.join(' › ')} › Titel`, art: 'md-titel', zeile: i + 1, original: d[2] });
      if (zeilen[i + 1] === '---') {
        const ende = zeilen.indexOf('---', i + 2);
        meta(i + 2, ende, stapel.join(' › '));
        i = ende;
      }
      continue;
    }
    if (z.trim() === ':::') { stapel.pop(); marke = ''; continue; }
    const h = /^###\s+(.+)$/u.exec(z);
    if (h) { marke = h[1] ?? ''; continue; }
    if (z.trim() === '' || z.startsWith('#')) continue;
    const liste = /^(\s*(?:[-*]|\d+\.)\s+)(.*)$/u.exec(z);
    const ort = `${kurz}${stapel.length ? ` › ${stapel.join(' › ')}` : ''}${marke ? ` › ${marke}` : ''}`;
    neu({
      stelle: ort, art: 'md-zeile', zeile: i + 1, praefix: liste ? liste[1] : '', original: liste ? (liste[2] ?? '') : z,
      hinweis: stapel.some((s) => s.startsWith('zitat')) ? 'Zitat aus der Quelle – muss wortgleich bleiben' : undefined,
    });
  }
  return aus;
}

/** YAML: jede sichtbare Zeichenkette mit Pfad und Zeile. */
function ausYaml(rel, bereich, kurz, hinweisFuer = (/** @type {(string|number)[]} */ _p) => /** @type {string|undefined} */ (undefined)) {
  /** @type {Eintrag[]} */ const aus = [];
  const lc = new YAML.LineCounter();
  const doc = YAML.parseDocument(lies(rel), { lineCounter: lc });
  const gehe = (/** @type {any} */ n, /** @type {(string|number)[]} */ pfad) => {
    if (YAML.isMap(n)) { for (const p of n.items) gehe(p.value, [...pfad, String(YAML.isScalar(p.key) ? p.key.value : p.key)]); return; }
    if (YAML.isSeq(n)) { n.items.forEach((x, k) => gehe(x, [...pfad, k])); return; }
    if (!YAML.isScalar(n) || typeof n.value !== 'string') return;
    const schluessel = [...pfad].reverse().find((x) => typeof x === 'string') ?? '';
    if (NICHT_TEXT.has(String(schluessel))) return;
    const v = n.value;
    if (!/\p{L}/u.test(v)) return;
    if (!/\s/u.test(v.trim()) && !KURZ_SICHTBAR.has(String(schluessel))) return;
    aus.push({ id: '', bereich, datei: rel, stelle: `${kurz} › ${pfad.map((x) => (typeof x === 'number' ? `${x + 1}.` : x)).join(' › ')}`, art: 'yaml',
      zeile: lc.linePos(n.range?.[0] ?? 0).line, pfad, original: v, hinweis: hinweisFuer(pfad) });
  };
  gehe(doc.contents, []);
  return aus;
}

/** Tafeln aus der Quelle (Anzeigefassung): je Zelle. */
function ausTafeln(themen) {
  /** @type {Eintrag[]} */ const aus = [];
  const wp = anzeigeFassung(JSON.parse(lies('quellen/whitepaper/v1.2/whitepaper.json')));
  /** @type {Map<string, any>} */ const tabellen = new Map();
  const sammle = (/** @type {any} */ x) => { if (Array.isArray(x)) x.forEach(sammle); else if (x && typeof x === 'object') { if (x.art === 'tabelle' && typeof x.id === 'string') tabellen.set(x.id, x); Object.values(x).forEach(sammle); } };
  sammle(wp);
  for (const { rel, kurz } of themen) {
    for (const m of lies(rel).matchAll(/^:::\s*tafel\s+(\S+)/gmu)) {
      const t = tabellen.get(m[1] ?? '');
      if (!t) continue;
      const reihen = [t.kopf ?? [], ...(t.zeilen ?? [])];
      reihen.forEach((/** @type {string[]} */ r, zi) => r.forEach((zelle, si) => {
        if (!/\p{L}/u.test(zelle)) return;
        aus.push({ id: '', bereich: 'Themen (Tafeln)', datei: rel, stelle: `${kurz} › Tafel ${t.id} › ${zi === 0 ? 'Kopf' : `Zeile ${zi}`} › Spalte ${si + 1}`,
          art: 'tafel', zeile: 0, tafel: t.id, zeilenNr: zi, spalte: si, original: zelle, hinweis: 'Tafel aus der Quelle – Änderung läuft über die Anzeigefassung' });
      }));
    }
  }
  return aus;
}

export function exportiere() {
  /** @type {Eintrag[]} */ const alle = [];
  const kenne = (/** @type {Eintrag[]} */ liste, /** @type {string} */ vorsatz) => liste.forEach((e, n) => { e.id = `${vorsatz}-${String(n + 1).padStart(4, '0')}`; alle.push(e); });
  kenne(ausMarkdown('inhalte/start.md', 'Startseite', 'Startseite'), 'ST');
  const themen = readdirSync(path.join(WURZEL, 'inhalte/theorie')).filter((d) => d.endsWith('.md')).sort().map((d) => ({ rel: `inhalte/theorie/${d}`, kurz: d.slice(0, 3) }));
  for (const t of themen) kenne(ausMarkdown(t.rel, 'Themen', t.kurz), `TH-${t.kurz}`);
  kenne(ausTafeln(themen), 'TF');
  kenne(ausMarkdown('inhalte/begriffs-kompass.md', 'Begriffs-Kompass', 'Kompass'), 'BK');
  const gl = ausYaml('inhalte/glossar.yaml', 'Glossar', 'Glossar');
  // Begriffe und Definitionen, die das Glossar unverändert aus der Quelle übernimmt (nicht in glossar.yaml)
  const schon = new Set(gl.map((e) => e.original.replace(/\s+/gu, ' ').trim()));
  const glossar = JSON.parse(lies('src/generiert/inhalte.json')).glossar ?? {};
  for (const [kennung, g] of Object.entries(/** @type {Record<string, { begriff: string, definition: string }>} */ (glossar))) {
    for (const feld of /** @type {const} */ (['begriff', 'definition'])) {
      const wert = String(g[feld] ?? '').replace(/<[^>]+>/gu, '').trim();
      if (wert === '' || schon.has(wert.replace(/\s+/gu, ' '))) continue;
      gl.push({ id: '', bereich: 'Glossar', datei: 'inhalte/glossar.yaml', stelle: `Glossar › ${kennung} › ${feld} (aus der Quelle)`, art: 'glossar', zeile: 0,
        pfad: [kennung, feld], original: wert, hinweis: 'kommt aus der Quelle – eine Änderung wird als Eintrag in glossar.yaml angelegt' });
    }
  }
  kenne(gl, 'GL');
  for (const d of readdirSync(path.join(WURZEL, 'inhalte/geschichte')).filter((x) => x.endsWith('.yaml')).sort((a, b) => (a === 'rahmen.yaml' ? -1 : b === 'rahmen.yaml' ? 1 : Number(/^s(\d+)/u.exec(a)?.[1]) - Number(/^s(\d+)/u.exec(b)?.[1])))) {
    const kurz = d.replace(/\.yaml$/u, '');
    kenne(ausYaml(`inhalte/geschichte/${d}`, 'Geschichte', kurz), `GE-${kurz.split('-')[0]}`);
  }
  kenne(ausYaml('inhalte/werkzeuge.yaml', 'Werkzeuge', 'Werkzeuge'), 'WZ');
  for (const d of readdirSync(path.join(WURZEL, 'inhalte/abbildungen')).filter((x) => x.endsWith('.yaml')).sort((a, b) => Number(/\d+/u.exec(a)?.[0]) - Number(/\d+/u.exec(b)?.[0]))) {
    kenne(ausYaml(`inhalte/abbildungen/${d}`, 'Abbildungen', d.replace(/\.yaml$/u, ''), (p) => (p[0] === 'ueb' ? 'Text im Bild – Änderung braucht ein neues Rendern der Abbildung' : undefined)), `AB-${d.replace(/\.yaml$/u, '')}`);
  }
  return alle;
}

if (istHauptmodul(import.meta.url)) {
  const alle = exportiere();
  const ziel = path.join(WURZEL, 'docs/textexport/texte.json');
  await schreibeAtomar(ziel, `${JSON.stringify({ erzeugt_von: 'werkzeuge/textexport.mjs', anzahl: alle.length, texte: alle }, null, 1)}\n`);
  const je = alle.reduce((/** @type {Record<string, number>} */ m, e) => { m[e.bereich] = (m[e.bereich] ?? 0) + 1; return m; }, {});
  console.log(`textexport: ${alle.length} Texte → docs/textexport/texte.json`, je);
}
