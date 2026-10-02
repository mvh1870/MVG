#!/usr/bin/env node
/**
 * Inhaltswerkzeug (P0.5): liest `inhalte/**`, prüft und schreibt `src/generiert/inhalte.json`.
 * Format: docs/INHALTSFORMAT.md. Typen der Ausgabe: src/inhalte/typen.ts.
 *
 *   node werkzeuge/inhalte.mjs            kompilieren (nur Formfehler, die das Kompilieren verhindern)
 *   node werkzeuge/inhalte.mjs --pruefe   kompilieren und alles prüfen; Exitcode 1 bei Fehlern
 *   … --wurzel <ordner>                   andere Wurzel (enthält inhalte/ und quellen/; schreibt dort src/generiert/)
 *
 * Als Modul: `const { fehler, warnungen, inhalte } = await kompiliere({ pruefe: true })`.
 * Weitere Optionen (für Tests): `wurzel`, `whitepaperPfad`, `ziel` (null = nicht schreiben).
 *
 * Deterministisch: Dateien sortiert, Schlüssel sortiert, keine Zeitstempel.
 */
import { baueGeschichte } from './geschichte.mjs';
import { baueWerkzeuge } from './explore.mjs';
import { anzeigeFassung } from './anzeige-fassung.mjs';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import YAML from 'yaml';
import { Marked } from 'marked';
import { istHauptmodul } from './haupt.mjs';
import { formatiereFund, pruefeText } from './begriffe.mjs';
import { ORDNER as ABB_ORDNER, STAND as ABB_STAND, WERKZEUG_VERSION as ABB_VERSION, eingabeSumme, leseBeschreibungen, pruefeBeschreibung } from './abbildungen.mjs';
import { createHash } from 'node:crypto';

export const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const STANDARD_ZIEL = path.join('src', 'generiert', 'inhalte.json');
export const STANDARD_WHITEPAPER = path.join('quellen', 'whitepaper', 'v1.2', 'whitepaper.json');

const KENNUNG = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/u;
/**
 * R50: Liegt die Stelle p (zwischen t[p-1] und t[p]) in einem Wort? Auch „Bauherren|-PL“, „LPH 0|–9“ und „Rollen|/Freigaben“:
 * ein Binde-, Strecken- oder Schrägstrich zwischen zwei Wortzeichen verbindet.
 * @param {string} t
 * @param {number} p
 */
export function imWort(t, p) {
  const w = (/** @type {string | undefined} */ z) => z !== undefined && /[\p{L}\p{N}]/u.test(z);
  const b = (/** @type {string | undefined} */ z) => z !== undefined && /[-–/]/u.test(z);
  return (w(t[p - 1]) && w(t[p])) || (b(t[p]) && w(t[p - 1]) && w(t[p + 1])) || (b(t[p - 1]) && w(t[p - 2]) && w(t[p]));
}

const BLOCK_ID = /^k\d+(?:\.\d+)*-[pltb]\d+$/u;
const ABSCHNITT_ID = /^k\d+(?:\.\d+)*$/u;
const FARBE = /^#[0-9A-Fa-f]{6}$/u;

const TAFEL_FORMEN = ['radar', 'ketten', 'schwelle', 'pyramide', 'felder', 'bausteine', 'phasen', 'register', 'rhythmus', 'karten', 'zeitachse', 'diagnose'];

/* ============================================================== Schema == */

/**
 * Kopfdaten-Typen: text, zahl (ganz), dezimal, bool, liste, karte (Text → Text), farbe, kennung,
 * wahl (werte), versionen, ids.
 * @typedef {{ typ: string, pflicht?: boolean, werte?: string[], min?: number, max?: number }} KopfDef
 * @typedef {{ in: string[], kennung: 'pflicht' | 'optional' | 'keine' | 'mehrere', muster?: RegExp,
 *   kopf?: Record<string, KopfDef>, felder?: string[], pflichtFelder?: string[] }} ArtDef
 */

const ZITAT_ORTE = ['ebene', '@theorie', 'abschnitt', 'karte', 'wissenscheck'];
const TEXT_ORTE = ['ebene', '@theorie', 'abschnitt'];

/** @type {Record<string, ArtDef>} */
const ARTEN = {
  // Ebenen 1–4 (Kurz bis Nachweis)
  ebenen: { in: ['@theorie', 'abschnitt'], kennung: 'keine', felder: [] },
  ebene: { in: ['ebenen'], kennung: 'pflicht', muster: /^[1-4]$/u, kopf: { titel: { typ: 'text' } }, felder: ['text'] },
  regie: { in: ['@theorie'], kennung: 'keine', felder: ['notiz', 'leitfragen'] },
  // Glossarseite (P6.14): alle Begriffe aus whitepaper.json, durchsuchbar, mit „Kommt vor in“
  glossar: { in: ['@theorie'], kennung: 'keine', felder: ['text'] },
  // Whitepaper-Tabelle als Grafik (P4, L-32): Zellen wörtlich aus whitepaper.json, Form aus src/grafik/tafel.ts
  tafel: { in: ['@theorie', 'abschnitt', 'ebene'], kennung: 'pflicht', muster: /^k\d+(?:\.\d+)*-t\d+$/u, kopf: { form: { typ: 'wahl', werte: TAFEL_FORMEN, pflicht: true }, hervor: { typ: 'liste' } }, felder: ['text'] },
  merksatz: { in: TEXT_ORTE, kennung: 'keine', felder: ['text'], pflichtFelder: ['text'] },
  hinweis: { in: TEXT_ORTE, kennung: 'keine', felder: ['text'], pflichtFelder: ['text'] },
  zitat: { in: ZITAT_ORTE, kennung: 'mehrere', felder: ['text'], pflichtFelder: ['text'] },
  // Wissenscheck auf einer Lernseite (P11.6): Frage mit Antworten und Erklärung statt Punkten, Beleg als zitat
  wissenscheck: { in: ['@theorie', 'abschnitt'], kennung: 'pflicht', felder: ['frage', 'erklaerung'], pflichtFelder: ['frage', 'erklaerung'] },
  antwort: { in: ['wissenscheck'], kennung: 'pflicht', kopf: { titel: { typ: 'text', pflicht: true }, praefix: { typ: 'text' }, symbol: { typ: 'text' } }, felder: ['text'] },
  // Theorie
  kernaussage: { in: ['@theorie'], kennung: 'keine', felder: ['text'], pflichtFelder: ['text'] },
  abschnitt: { in: ['@theorie'], kennung: 'pflicht', muster: ABSCHNITT_ID, kopf: { titel: { typ: 'text' } }, felder: ['text'] },
  karten: { in: ['@theorie', 'abschnitt'], kennung: 'keine', kopf: { titel: { typ: 'text' } }, felder: ['text'] },
  karte: { in: ['karten'], kennung: 'optional', kopf: { titel: { typ: 'text', pflicht: true }, symbol: { typ: 'text' } }, felder: ['text', 'rueckseite'] },
  // Kleine interaktive Grafiken der Lernseiten (P12.3, O-30; src/ui/bausteine/lernwerkzeuge.ts)
  etappen: { in: ['@theorie', 'abschnitt'], kennung: 'keine', kopf: { titel: { typ: 'text' } }, felder: ['text'] },
  etappe: { in: ['etappen'], kennung: 'pflicht', kopf: { titel: { typ: 'text', pflicht: true } }, felder: ['text'], pflichtFelder: ['text'] },
  umschalter: { in: ['@theorie', 'abschnitt'], kennung: 'keine', kopf: { titel: { typ: 'text' }, links: { typ: 'text', pflicht: true }, rechts: { typ: 'text', pflicht: true } }, felder: ['text'] },
  ansicht: { in: ['umschalter'], kennung: 'pflicht', muster: /^(?:links|rechts)$/u, felder: ['text'], pflichtFelder: ['text'] },
  sortieren: { in: ['@theorie', 'abschnitt'], kennung: 'keine', kopf: { titel: { typ: 'text' }, links: { typ: 'text', pflicht: true }, rechts: { typ: 'text', pflicht: true } }, felder: ['text'] },
  posten: { in: ['sortieren'], kennung: 'pflicht', kopf: { seite: { typ: 'wahl', werte: ['links', 'rechts'], pflicht: true } }, felder: ['text', 'erklaerung'], pflichtFelder: ['text'] },
  regler: { in: ['@theorie', 'abschnitt'], kennung: 'keine', kopf: { titel: { typ: 'text' } }, felder: ['text'] },
  stufe: { in: ['regler'], kennung: 'pflicht', kopf: { titel: { typ: 'text', pflicht: true }, marke: { typ: 'text' } }, felder: ['text'], pflichtFelder: ['text'] },
  // Abbildung aus der DOCX V1.2 auf der Lernseite (P14, O-32): Beschreibung in inhalte/abbildungen/abb-N.yaml
  abbildung: { in: ['@theorie', 'abschnitt'], kennung: 'pflicht', muster: /^abb-\d+$/u, felder: [] },
  // Begriffs-Kompass (P10.5, E7): Whitepaper-Begriff ↔ gängige andere Wörter, mit Beleg
  kompass: { in: ['@kompass'], kennung: 'pflicht', kopf: { begriff: { typ: 'text', pflicht: true }, andere: { typ: 'liste', pflicht: true }, beleg: { typ: 'text', pflicht: true } }, felder: ['hinweis'] },
};

/** Kopfdaten und Felder der Dateien selbst (oberste Ebene). */
const DATEI_ARTEN = {
  '@theorie': {
    kopf: {
      kapitel: { typ: 'zahl', pflicht: true, min: 1, max: 16 }, titel: { typ: 'text', pflicht: true }, kurztitel: { typ: 'text' },
      // P16.3 (O-38): Kennung des Themas in der Adresse (#theorie/<thema>) und Reihenfolge der Themen
      thema: { typ: 'kennung' }, reihe: { typ: 'zahl', min: 1, max: 30 },
      deckt: { typ: 'liste' },
    },
    felder: ['text'],
  },
  '@kompass': { kopf: {}, felder: ['text'] },
  '@start': {
    kopf: { kicker: { typ: 'text', pflicht: true }, titel: { typ: 'text', pflicht: true }, 'titel-quelle': { typ: 'text' } },
    felder: ['text'],
    pflichtFelder: ['text'],
  },
};

/* ========================================================== Hilfen == */

/** @param {string} t */
function esc(t) {
  return String(t).replace(/&/gu, '&amp;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;').replace(/"/gu, '&quot;');
}

/** `Was fehlt` → `wasFehlt`, `Rückmeldung` → `rueckmeldung`, `betrag-teur` → `betragTeur`. @param {string} t */
export function feldName(t) {
  const umschrift = t.trim().replace(/ä/gu, 'ae').replace(/ö/gu, 'oe').replace(/ü/gu, 'ue').replace(/Ä/gu, 'Ae')
    .replace(/Ö/gu, 'Oe').replace(/Ü/gu, 'Ue').replace(/ß/gu, 'ss');
  const woerter = umschrift.split(/[^A-Za-z0-9]+/u).filter((w) => w !== '');
  return woerter.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');
}

/** Deterministisches JSON: Schlüssel sortiert, Listen in Reihenfolge. @param {unknown} wert */
export function stabilesJson(wert) {
  /** @param {unknown} x @returns {unknown} */
  const ordne = (x) => {
    if (Array.isArray(x)) return x.map(ordne);
    if (x !== null && typeof x === 'object') {
      /** @type {Record<string, unknown>} */
      const aus = {};
      for (const k of Object.keys(x).sort()) aus[k] = ordne(/** @type {Record<string, unknown>} */ (x)[k]);
      return aus;
    }
    return x;
  };
  return `${JSON.stringify(ordne(wert), null, 2)}\n`;
}

/** Eigene Normalisierung, falls whitepaper-lib.mjs fehlt (gleiche Regel: Leerraum + Silbentrennung). @param {string} t */
function normalisiereSelbst(t) {
  return String(t).replace(/[­​⁠﻿]/gu, '').replace(/\s+/gu, ' ').trim();
}

/* ================================================= Befunde (Kontext) == */

class Befunde {
  constructor() {
    /** @type {{ text: string, hart: boolean }[]} */ this.fehlerListe = [];
    /** @type {{ text: string, hart: boolean }[]} */ this.warnListe = [];
  }
  /** @param {string} ort @param {string} text @param {boolean} [hart] */
  fehler(ort, text, hart = false) { this.fehlerListe.push({ text: `${ort}: ${text}`, hart }); }
  /** @param {string} ort @param {string} text @param {boolean} [hart] */
  warnung(ort, text, hart = false) { this.warnListe.push({ text: `${ort}: ${text}`, hart }); }
}

/* ============================================================ Parser == */

/**
 * @typedef {{ art: string, kennungen: string[], zeile: number, zeilen: { nr: number, text: string }[], kinder: Knoten[] }} Knoten
 */

/**
 * Zerlegt eine Datei in Kopfdaten und Containerbaum.
 * @param {string} text
 * @param {string} rel
 * @param {Befunde} b
 */
export function zerlege(text, rel, b) {
  const zeilen = text.replace(/^﻿/u, '').replace(/\r\n?/gu, '\n').split('\n');
  /** @type {Record<string, unknown>} */
  let kopf = {};
  let start = 0;
  if (zeilen[0]?.trim() === '---') {
    const ende = zeilen.findIndex((z, i) => i > 0 && z.trim() === '---');
    if (ende < 0) {
      b.fehler(`${rel}:1`, 'Kopfdaten ohne schließende Zeile „---“', true);
    } else {
      kopf = leseYaml(zeilen.slice(1, ende).join('\n'), `${rel}`, 2, b);
      start = ende + 1;
    }
  }
  /** @type {Knoten} */
  const wurzel = { art: '#datei', kennungen: [], zeile: 1, zeilen: [], kinder: [] };
  /** @type {Knoten[]} */
  const stapel = [wurzel];
  let imCode = false;
  for (let i = start; i < zeilen.length; i++) {
    const z = zeilen[i] ?? '';
    const nr = i + 1;
    const oben = /** @type {Knoten} */ (stapel[stapel.length - 1]);
    if (/^\s*(```|~~~)/u.test(z)) {
      imCode = !imCode;
      oben.zeilen.push({ nr, text: z });
      continue;
    }
    if (!imCode) {
      if (/^\s*:{3,}\s*$/u.test(z)) {
        if (stapel.length === 1) b.fehler(`${rel}:${nr}`, '„:::“ schließt keinen offenen Container', true);
        else stapel.pop();
        continue;
      }
      const m = /^\s*:{3,}\s*([A-Za-z][A-Za-z-]*)\s*(.*?)\s*$/u.exec(z);
      if (m) {
        /** @type {Knoten} */
        const k = { art: m[1] ?? '', kennungen: (m[2] ?? '').split(/\s+/u).filter((x) => x !== ''), zeile: nr, zeilen: [], kinder: [] };
        oben.kinder.push(k);
        stapel.push(k);
        continue;
      }
    }
    oben.zeilen.push({ nr, text: z });
  }
  for (const offen of stapel.slice(1)) b.fehler(`${rel}:${offen.zeile}`, `Container „${offen.art}“ wird nicht mit „:::“ geschlossen`, true);
  return { kopf, wurzel };
}

/**
 * @param {string} text
 * @param {string} ort
 * @param {number} ersteZeile
 * @param {Befunde} b
 * @returns {Record<string, unknown>}
 */
function leseYaml(text, ort, ersteZeile, b) {
  if (text.trim() === '') return {};
  try {
    const wert = YAML.parse(text, { schema: 'failsafe' });
    if (wert === null || wert === undefined) return {};
    if (typeof wert !== 'object' || Array.isArray(wert)) {
      b.fehler(`${ort}:${ersteZeile}`, 'Kopfdaten müssen „schlüssel: wert“-Zeilen sein', true);
      return {};
    }
    return /** @type {Record<string, unknown>} */ (wert);
  } catch (e) {
    const fe = /** @type {{ message?: string, linePos?: { line: number }[] }} */ (e);
    const zeile = ersteZeile + (fe.linePos?.[0]?.line ?? 1) - 1;
    b.fehler(`${ort}:${zeile}`, `Kopfdaten (YAML) unlesbar: ${String(fe.message ?? e).split('\n')[0]}`, true);
    return {};
  }
}

/**
 * Teilt den Text eines Knotens in Kopfdaten (optional, `---` … `---` am Anfang) und Felder (`###`).
 * @param {Knoten} k
 * @param {string} rel
 * @param {Befunde} b
 */
function teileKnoten(k, rel, b) {
  let zeilen = k.zeilen;
  /** @type {Record<string, unknown>} */
  let kopf = {};
  const erste = zeilen.findIndex((z) => z.text.trim() !== '');
  if (k.art !== '#datei' && erste >= 0 && zeilen[erste]?.text.trim() === '---') {
    const ende = zeilen.findIndex((z, i) => i > erste && z.text.trim() === '---');
    if (ende < 0) {
      b.fehler(`${rel}:${zeilen[erste]?.nr ?? k.zeile}`, `Kopfdaten im Container „${k.art}“ ohne schließende Zeile „---“`, true);
    } else {
      kopf = leseYaml(zeilen.slice(erste + 1, ende).map((z) => z.text).join('\n'), rel, (zeilen[erste]?.nr ?? k.zeile) + 1, b);
      zeilen = zeilen.slice(ende + 1);
    }
  }
  /** @type {Record<string, { text: string, zeile: number, ueberschrift: string }>} */
  const felder = {};
  let name = 'text';
  let ueberschrift = '';
  let zeile = k.zeile;
  /** @type {string[]} */
  let puffer = [];
  let imCode = false;
  const schliesse = () => {
    const t = puffer.join('\n').trim();
    if (t !== '' || name !== 'text') {
      if (felder[name] !== undefined) b.fehler(`${rel}:${zeile}`, `Feld „${ueberschrift || name}“ kommt doppelt vor`);
      felder[name] = { text: t, zeile, ueberschrift };
    }
  };
  for (const z of zeilen) {
    if (/^\s*(```|~~~)/u.test(z.text)) imCode = !imCode;
    const m = imCode ? null : /^###\s+(.+?)\s*#*\s*$/u.exec(z.text);
    if (m) {
      schliesse();
      ueberschrift = m[1] ?? '';
      name = feldName(ueberschrift);
      zeile = z.nr;
      puffer = [];
    } else {
      puffer.push(z.text);
    }
  }
  schliesse();
  return { kopf, felder };
}

/* ======================================================= Whitepaper == */

/**
 * @typedef {{ id: string, art: string, text: string, punkte?: string[], kopf?: string[], zeilen?: string[][],
 *   kapitel: string, abschnitt: string, abschnittTitel: string }} FlacherBlock
 * @typedef {{ id: string, nr: string, titel: string, abschnitte: { id: string, nr: string, titel: string }[] }} GliederungsKapitel
 * @typedef {{ fassung: string, titel: string | null, bloecke: FlacherBlock[], nachId: Map<string, FlacherBlock>,
 *   glossar: { id: string, begriff: string, definition: string }[], abschnitte: Set<string>,
 *   gliederung: GliederungsKapitel[], normalisiere: (t: string) => string }} Quelle
 */

/**
 * Lädt whitepaper.json über werkzeuge/whitepaper-lib.mjs (Rückfall: eigene Minimal-Lesart).
 * @param {string} pfad
 * @returns {Promise<Quelle | null>}
 */
async function ladeQuelle(pfad) {
  if (!existsSync(pfad)) return null;
  /** @type {any} */
  let lib = null;
  try {
    lib = await import(pathToFileURL(path.join(WURZEL, 'werkzeuge', 'whitepaper-lib.mjs')).href);
  } catch {
    lib = null;
  }
  /** @type {any} */
  // Anzeigefassung (O-29, L-66): ohne das Wort „Whitepaper“; Zitate werden gegen sie geprüft
  const wp = anzeigeFassung(lib?.ladeWhitepaper ? lib.ladeWhitepaper(pfad) : JSON.parse(readFileSync(pfad, 'utf8')));
  /** @type {FlacherBlock[]} */
  let bloecke;
  if (lib?.alleBloecke) {
    bloecke = lib.alleBloecke(wp);
  } else {
    bloecke = [];
    /** @param {any} a @param {string} kap */
    const gehe = (a, kap) => {
      for (const bl of a.bloecke ?? []) bloecke.push({ ...bl, kapitel: kap, abschnitt: a.nr, abschnittTitel: a.titel });
      for (const u of a.abschnitte ?? []) gehe(u, kap);
    };
    for (const k of wp.kapitel ?? []) gehe(k, k.nr);
  }
  /** @type {Set<string>} */
  const abschnitte = new Set();
  /** @param {any} a */
  const sammle = (a) => {
    abschnitte.add(`k${a.nr}`);
    for (const u of a.abschnitte ?? []) sammle(u);
  };
  for (const k of wp.kapitel ?? []) sammle(k);
  /** @param {any[]} liste @returns {{ id: string, nr: string, titel: string }[]} */
  const flacheAbschnitte = (liste) => liste.flatMap((/** @type {any} */ a) => [
    { id: typeof a.id === 'string' ? a.id : `k${a.nr}`, nr: String(a.nr), titel: String(a.titel ?? '') },
    ...flacheAbschnitte(a.abschnitte ?? []),
  ]);
  // Gliederung (Kapitel und Abschnitte mit Titel) für die Kapitelliste der Theorie (P0.6).
  /** @type {GliederungsKapitel[]} */
  const gliederung = (wp.kapitel ?? []).map((/** @type {any} */ k) => ({
    id: typeof k.id === 'string' ? k.id : `k${k.nr}`,
    nr: String(k.nr),
    titel: String(k.titel ?? ''),
    // alle Abschnittsebenen (6.4 und 6.4.1 …), in Lesereihenfolge; die Kapitelliste zählt nur die erste Ebene
    abschnitte: flacheAbschnitte(k.abschnitte ?? []),
  }));
  return {
    fassung: typeof wp.fassung === 'string' ? wp.fassung : 'V1.2',
    titel: typeof wp.titel === 'string' ? wp.titel : null,
    gliederung,
    // Abbildungen (P8.5, P14): Kennung, Kapitel, Ort; Datei und Prüfsumme nur für werkzeuge/abbildungen.mjs (O-32, L-77)
    abbildungen: (Array.isArray(wp.abbildungen) ? wp.abbildungen : []).map((/** @type {any} */ a) => ({ id: String(a.id), kapitel: String(a.kapitel ?? ''), ort: String(a.ort ?? ''), datei: String(a.datei ?? ''), sha256: String(a.sha256 ?? '') })),
    bloecke,
    nachId: new Map(bloecke.map((bl) => [bl.id, bl])),
    glossar: Array.isArray(wp.glossar) ? wp.glossar : [],
    abschnitte,
    normalisiere: typeof lib?.normalisiere === 'function' ? lib.normalisiere : normalisiereSelbst,
  };
}

/* ====================================================== Kompilierer == */

/**
 * @typedef {{ pruefe?: boolean, wurzel?: string, whitepaperPfad?: string, ziel?: string | null }} Optionen
 */

class Kompilierer {
  /**
   * @param {Befunde} b
   * @param {Quelle | null} quelle
   * @param {boolean} pruefe
   */
  constructor(b, quelle, pruefe) {
    this.b = b;
    this.quelle = quelle;
    this.pruefe = pruefe;
    this.marked = new Marked({ gfm: true, breaks: false, async: false });
    this.marked.use({ renderer: { html: (/** @type {{ text: string }} */ t) => esc(t.text) } });
    /** Platzhalter für Glossar/Zitat-Spannen */
    /** @type {string[]} */ this.spannen = [];
    /** Verweise, die nach dem Einlesen gegen alles geprüft werden */
    /** Absatz-IDs, die Theorie-Seiten abdecken */
    /** @type {Map<string, Set<string>>} */ this.theorieDeckt = new Map();
    this.glossarFehltGemeldet = false;
    this.zitatUngeprueftGemeldet = false;
    /** @type {Map<string, { id: string, begriff: string, definition: string }>} */
    this.glossarNachBegriff = new Map();
    for (const g of quelle?.glossar ?? []) {
      const n = (/** @type {string} */ t) => (quelle ? quelle.normalisiere(t) : normalisiereSelbst(t)).toLowerCase();
      this.glossarNachBegriff.set(n(g.begriff), g);
      const klammer = /^(.*?)\s*\(([^()]+)\)\s*$/u.exec(g.begriff);
      if (klammer) {
        this.glossarNachBegriff.set(n(klammer[1] ?? ''), g);
        this.glossarNachBegriff.set(n(klammer[2] ?? ''), g);
      }
    }
  }

  /** @param {string} ort @param {string} text */
  fehler(ort, text) { this.b.fehler(ort, text); }
  /** @param {string} ort @param {string} text */
  warnung(ort, text) { this.b.warnung(ort, text); }

  /* ---------------------------------------------------- Markdown -- */

  /**
   * Markdown → HTML; `[[Begriff]]`, `[[Begriff|Text]]`, `[[zitat:ID|Text]]`, `[[bedienung:Text]]` werden markierte Spannen.
   * @param {string} text
   * @param {string} ort
   */
  html(text, ort) {
    if (text.trim() === '') return '';
    const vorher = this.ersetzeSpannen(text, ort);
    const roh = /** @type {string} */ (this.marked.parse(vorher));
    return this.setzeSpannen(roh.trim());
  }

  /** @param {string} text @param {string} ort */
  inline(text, ort) {
    if (text.trim() === '') return '';
    const vorher = this.ersetzeSpannen(text, ort);
    return this.setzeSpannen(/** @type {string} */ (this.marked.parseInline(vorher)).trim());
  }

  /** @param {string} text @param {string} ort */
  ersetzeSpannen(text, ort) {
    return text.replace(/\[\[([^\[\]\n]+?)\]\]/gu, (_, innen, stelle, ganz) => {
      // R48: ein Bedienhinweis ist ein ganzer Satz, getrennt vom Text davor – im Druck und auf der Leinwand fällt er
      // weg, und übrig bliebe sonst ein Satzrest („was im Standard-Rollenmodell …“) oder „Wortlaut.Das Suchfeld …“
      if (String(innen).startsWith('bedienung:')) {
        const satz = String(innen).slice(10);
        const davor = stelle > 0 ? String(ganz)[stelle - 1] ?? '' : '';
        if (/^\s/u.test(satz) || (davor !== '' && !/[\s(]/u.test(davor))) this.fehler(ort, `Bedienhinweis ohne Leerraum davor – das Leerzeichen gehört vor die Spanne: „[[${String(innen).slice(0, 40)}“`);
        if (!/[.!?]$/u.test(satz.trim())) this.fehler(ort, `Bedienhinweis ist kein ganzer Satz (endet nicht auf . ! ?): „${satz.trim().slice(0, 40)}“`);
      }
      const i = this.spannen.length;
      this.spannen.push(this.spanne(String(innen), ort));
      return `${i}`;
    });
  }

  /** @param {string} html */
  setzeSpannen(html) {
    return html.replace(/(\d+)/gu, (_, i) => this.spannen[Number(i)] ?? '');
  }

  /** @param {string} innen @param {string} ort */
  spanne(innen, ort) {
    const [ziel = '', anzeige] = innen.split('|');
    if (ziel.startsWith('zitat:')) {
      const id = ziel.slice(6).trim();
      const text = (anzeige ?? '').trim();
      if (text === '') this.fehler(ort, `Inline-Zitat ${id} ohne Text ([[zitat:${id}|Text]])`);
      this.pruefeZitat([id], text, ort);
      return `<q class="mvg-zitat" data-absatz="${esc(id)}">${esc(text)}</q>`;
    }
    // R41: Bedienhinweis („Ziehen Sie den Regler“) – im Druck und auf der Leinwand, wo die Werkzeuge aufgelöst sind, ausgeblendet
    if (ziel.startsWith('bedienung:')) {
      const text = innen.slice(10).trim();
      if (text === '') this.fehler(ort, 'Bedienhinweis ohne Text ([[bedienung:Text]])');
      return `<span class="bedienhinweis">${esc(text)}</span>`;
    }
    const begriff = ziel.trim();
    const zeige = (anzeige ?? begriff).trim();
    const g = this.findeGlossar(begriff, ort);
    return `<span class="mvg-glossar" data-glossar="${esc(g?.id ?? '')}" data-begriff="${esc(g?.begriff ?? begriff)}">${esc(zeige)}</span>`;
  }

  /** @param {string} begriff @param {string} ort */
  findeGlossar(begriff, ort) {
    if (this.quelle === null) {
      if (!this.glossarFehltGemeldet) {
        this.glossarFehltGemeldet = true;
        this.warnung('glossar', 'whitepaper.json fehlt – Glossarbezüge ([[…]]) ungeprüft');
      }
      return null;
    }
    const n = this.quelle.normalisiere(begriff).toLowerCase();
    const g = this.glossarNachBegriff.get(n) ?? null;
    if (g === null) this.fehler(ort, `Glossarbegriff „${begriff}“ steht nicht im Glossar des Whitepapers`);
    return g;
  }

  /* ------------------------------------------------------ Zitate -- */

  /** Löst `k2.4`, `k2.4-p1..k2.4-p3`, `k2.4-p2` zu Block-IDs auf. @param {string} ref @param {string} ort @returns {string[]} */
  expandiere(ref, ort) {
    const bereich = /^(k[\d.]+-[pltb]\d+)\.\.(k[\d.]+-[pltb]\d+)$/u.exec(ref);
    if (bereich) {
      const [, von = '', bis = ''] = bereich;
      if (this.quelle === null) return [von, bis];
      const bl = this.quelle.bloecke;
      const a = bl.findIndex((x) => x.id === von);
      const e = bl.findIndex((x) => x.id === bis);
      if (a < 0 || e < 0 || e < a) {
        this.fehler(ort, `Bereich „${ref}“ ungültig (unbekannte ID oder falsche Reihenfolge)`);
        return [];
      }
      return bl.slice(a, e + 1).map((x) => x.id);
    }
    if (ABSCHNITT_ID.test(ref)) {
      if (this.quelle === null) return [];
      const nr = ref.slice(1);
      if (!this.quelle.abschnitte.has(ref)) {
        this.fehler(ort, `Abschnitt „${ref}“ gibt es im Whitepaper nicht`);
        return [];
      }
      return this.quelle.bloecke.filter((x) => x.abschnitt === nr || x.abschnitt.startsWith(`${nr}.`)).map((x) => x.id);
    }
    if (!BLOCK_ID.test(ref)) {
      this.fehler(ort, `„${ref}“ ist keine Absatz-ID (Form k2.4-p2, k3.2-t1)`);
      return [];
    }
    if (this.quelle !== null && !this.quelle.nachId.has(ref)) {
      this.fehler(ort, `Absatz-ID „${ref}“ gibt es im Whitepaper nicht`);
      return [];
    }
    return [ref];
  }

  /**
   * Wortgleichheit (O-17). Auslassungen „[…]“ teilen das Zitat in Stücke, die in Reihenfolge stehen müssen.
   * @param {string[]} ids
   * @param {string} text
   * @param {string} ort
   * @returns {{ ok: boolean | null, vollstaendig: boolean }}
   */
  pruefeZitat(ids, text, ort) {
    if (ids.length === 0) {
      this.fehler(ort, 'Zitat ohne Absatz-ID');
      return { ok: false, vollstaendig: false };
    }
    for (const id of ids) {
      if (!BLOCK_ID.test(id)) {
        this.fehler(ort, `Zitat: „${id}“ ist keine Absatz-ID (Form k2.4-p2)`);
        return { ok: false, vollstaendig: false };
      }
    }
    if (this.quelle === null) {
      if (!this.zitatUngeprueftGemeldet) {
        this.zitatUngeprueftGemeldet = true;
        this.warnung('zitate', 'whitepaper.json fehlt – Zitate nicht auf Wortgleichheit geprüft');
      }
      return { ok: null, vollstaendig: false };
    }
    const q = this.quelle;
    const fehlend = ids.filter((id) => !q.nachId.has(id));
    if (fehlend.length > 0) {
      this.fehler(ort, `Zitat: Absatz-ID ${fehlend.join(', ')} gibt es im Whitepaper nicht`);
      return { ok: false, vollstaendig: false };
    }
    const original = q.normalisiere(ids.map((id) => q.nachId.get(id)?.text ?? '').join(' '));
    const stuecke = q.normalisiere(text).split(/\s*\[(?:…|\.\.\.)\]\s*/u).map((s) => s.trim()).filter((s) => s !== '');
    if (stuecke.length === 0) {
      this.fehler(ort, 'Zitat ist leer');
      return { ok: false, vollstaendig: false };
    }
    // R49: ein Stück beginnt und endet an einer Wortgrenze (sonst gälte „verantwortlich“ aus „letztverantwortlich“ als
    // wortgleich); zwischen „[…]“ trägt jedes Stück mindestens zwei Wörter (ein einzelnes „nicht“ verschöbe den Sinn).
    // R50: auch Binde-, Strecken- und Schrägstrich zwischen zwei Wortzeichen verbinden („Bauherren-PL“, „LPH 0–9“); als Wort
    // zählt nur, was Buchstaben oder Ziffern trägt (ein Gedankenstrich ist keins)
    const anGrenze = (/** @type {number} */ i, /** @type {string} */ s) => !imWort(original, i) && !imWort(original, i + s.length);
    if (stuecke.length > 1) {
      const kurz = stuecke.find((s) => s.split(/\s+/u).filter((t) => /[\p{L}\p{N}]/u.test(t)).length < 2);
      if (kurz !== undefined) {
        this.fehler(ort, `Zitat mit Auslassung: das Stück „${kurz}“ ist zu kurz (mindestens zwei Wörter zwischen „[…]“)`);
        return { ok: false, vollstaendig: false };
      }
    }
    let pos = 0;
    for (const s of stuecke) {
      let i = original.indexOf(s, pos);
      while (i >= 0 && !anGrenze(i, s)) i = original.indexOf(s, i + 1);
      if (i < 0 && original.includes(s)) {
        this.fehler(ort, `Zitat nicht wortgleich mit ${ids.join(' ')}: „${s.slice(0, 40)}“ beginnt oder endet mitten im Wort`);
        return { ok: false, vollstaendig: false };
      }
      if (i < 0) {
        let gut = 0;
        let unten = 1;
        let oben = s.length;
        while (unten <= oben) {
          const mitte = (unten + oben) >> 1;
          if (original.includes(s.slice(0, mitte))) { gut = mitte; unten = mitte + 1; } else { oben = mitte - 1; }
        }
        const stelle = s.slice(gut, gut + 40);
        this.fehler(ort, gut === 0
          ? `Zitat nicht wortgleich: kommt in ${ids.join(' ')} nicht vor („${s.slice(0, 40)}…“)`
          : `Zitat nicht wortgleich mit ${ids.join(' ')}: weicht nach ${gut} Zeichen ab bei „${stelle}“`);
        return { ok: false, vollstaendig: false };
      }
      pos = i + s.length;
    }
    return { ok: true, vollstaendig: stuecke.length === 1 && stuecke[0] === original };
  }

  /* ------------------------------------------------ Kopfdaten -- */

  /**
   * Wandelt Kopfdaten nach Schema um; meldet Unbekanntes, Fehlendes und Ungültiges.
   * @param {Record<string, unknown>} roh
   * @param {Record<string, KopfDef>} defs
   * @param {string} ort
   * @returns {Record<string, any>}
   */
  kopf(roh, defs, ort) {
    /** @type {Record<string, any>} */
    const aus = {};
    for (const k of Object.keys(roh)) {
      if (defs[k] === undefined) this.fehler(ort, `unbekannte Kopfdaten „${k}“ (erlaubt: ${Object.keys(defs).join(', ') || 'keine'})`);
    }
    for (const [k, def] of Object.entries(defs)) {
      const wert = roh[k];
      const leer = wert === undefined || wert === '' || (Array.isArray(wert) && wert.length === 0);
      if (leer) {
        if (def.pflicht) {
          this.fehler(ort, def.typ === 'farbe' && wert === ''
            ? `„${k}“ ist leer – Farben in Anführungszeichen setzen ("#RRGGBB"), sonst liest YAML „#“ als Kommentar`
            : `Pflichtangabe „${k}“ fehlt`);
        }
        continue;
      }
      const w = this.wandle(k, wert, def, ort);
      if (w !== undefined) aus[feldName(k)] = w;
    }
    return aus;
  }

  /**
   * @param {string} k
   * @param {unknown} wert
   * @param {KopfDef} def
   * @param {string} ort
   * @returns {any}
   */
  wandle(k, wert, def, ort) {
    const text = (/** @type {unknown} */ x) => (typeof x === 'string' ? x.trim() : null);
    const t = text(wert);
    switch (def.typ) {
      case 'text':
        if (t === null) { this.fehler(ort, `„${k}“ muss ein Text sein`); return undefined; }
        return t;
      case 'kennung':
        if (t === null || !KENNUNG.test(t)) { this.fehler(ort, `„${k}“: „${String(wert)}“ ist keine Kennung (Buchstaben, Ziffern, Bindestrich)`); return undefined; }
        return t;
      case 'zahl': {
        if (t === null || !/^-?\d+$/u.test(t)) { this.fehler(ort, `„${k}“ muss eine ganze Zahl sein, nicht „${String(wert)}“`); return undefined; }
        const n = Number(t);
        if ((def.min !== undefined && n < def.min) || (def.max !== undefined && n > def.max)) {
          this.fehler(ort, `„${k}“ = ${n} liegt außerhalb ${def.min ?? '…'}–${def.max ?? '…'}`);
          return undefined;
        }
        return n;
      }
      case 'dezimal': {
        if (t === null || !/^-?\d+(?:[.,]\d+)?$/u.test(t)) { this.fehler(ort, `„${k}“ muss eine Zahl sein (z. B. 58,4)`); return undefined; }
        return Number(t.replace(',', '.'));
      }
      case 'bool':
        if (t === 'ja' || t === 'true') return true;
        if (t === 'nein' || t === 'false') return false;
        this.fehler(ort, `„${k}“ muss ja oder nein sein`);
        return undefined;
      case 'farbe':
        if (t === null || !FARBE.test(t)) { this.fehler(ort, `„${k}“: „${String(wert)}“ ist keine Farbe "#RRGGBB"`); return undefined; }
        return t.toUpperCase();
      case 'wahl':
        if (t === null || !(def.werte ?? []).includes(t)) { this.fehler(ort, `„${k}“: „${String(wert)}“ ist nicht erlaubt (${(def.werte ?? []).join(', ')})`); return undefined; }
        return t;
      case 'liste': {
        const liste = Array.isArray(wert) ? wert : [wert];
        if (!liste.every((x) => typeof x === 'string')) { this.fehler(ort, `„${k}“ muss eine Liste von Texten sein`); return undefined; }
        return liste.map((x) => String(x).trim()).filter((x) => x !== '');
      }
      case 'ids': {
        const liste = Array.isArray(wert) ? wert : [wert];
        /** @type {string[]} */
        const aus = [];
        for (const x of liste) {
          const id = typeof x === 'string' ? x.trim() : '';
          if (!BLOCK_ID.test(id)) this.fehler(ort, `„${k}“: „${String(x)}“ ist keine Absatz-ID (Form k2.4-p2)`);
          else {
            if (this.quelle !== null && !this.quelle.nachId.has(id)) this.fehler(ort, `„${k}“: Absatz-ID „${id}“ gibt es im Whitepaper nicht`);
            aus.push(id);
          }
        }
        return aus;
      }
      case 'karte': {
        if (typeof wert !== 'object' || wert === null || Array.isArray(wert)) { this.fehler(ort, `„${k}“ muss „schlüssel: text“-Zeilen enthalten`); return undefined; }
        /** @type {Record<string, string>} */
        const aus = {};
        for (const [a, v] of Object.entries(wert)) {
          if (typeof v !== 'string') this.fehler(ort, `„${k}.${a}“ muss ein Text sein`);
          else aus[a] = v.trim();
        }
        return aus;
      }
      case 'versionen': {
        const liste = Array.isArray(wert) ? wert : [wert];
        const aus = [];
        for (const x of liste) {
          // „- Version 1: ersetzt“ ohne Anführungszeichen liest YAML als Karte mit einem Schlüssel
          const einzeln = typeof x === 'object' && x !== null && !Array.isArray(x) && Object.keys(x).length === 1;
          const s = typeof x === 'string' ? x : einzeln ? `${Object.keys(x)[0]}: ${String(Object.values(x)[0])}` : '';
          const m = /^(.+?):\s*(.+)$/u.exec(s.trim());
          if (!m) { this.fehler(ort, `„${k}“: „${String(x)}“ – Form „Version 3: gilt“`); continue; }
          aus.push({ name: (m[1] ?? '').trim(), stand: (m[2] ?? '').trim() });
        }
        return aus;
      }
      default:
        return wert;
    }
  }

  /* ------------------------------------------------ Knoten → Block -- */

  /**
   * Prüft Art, Ort, Kennung und wandelt Kopfdaten und Felder. Liefert das Rohmaterial für Bauer.
   * @param {Knoten} k
   * @param {string} eltern  Art des Eltern-Containers oder Dateiart (@station …)
   * @param {string} rel
   */
  lies(k, eltern, rel) {
    const ort = `${rel}:${k.zeile}`;
    const def = ARTEN[k.art];
    if (def === undefined) {
      this.fehler(ort, `unbekannter Container „${k.art}“`);
      return null;
    }
    if (!def.in.includes(eltern)) this.fehler(ort, `„${k.art}“ ist hier nicht erlaubt (erlaubt in: ${def.in.join(', ')})`);
    if (def.kennung === 'keine' && k.kennungen.length > 0) this.fehler(ort, `„${k.art}“ hat keine Kennung`);
    if (def.kennung === 'pflicht' && k.kennungen.length !== 1) this.fehler(ort, `„${k.art}“ braucht genau eine Kennung`);
    if (def.kennung === 'optional' && k.kennungen.length > 1) this.fehler(ort, `„${k.art}“ hat höchstens eine Kennung`);
    if (def.kennung === 'mehrere' && k.kennungen.length === 0) this.fehler(ort, `„${k.art}“ braucht mindestens eine Absatz-ID`);
    for (const id of k.kennungen) {
      if (def.muster !== undefined && !def.muster.test(id)) this.fehler(ort, `„${k.art}“: Kennung „${id}“ ist nicht erlaubt`);
      else if (def.muster === undefined && def.kennung !== 'mehrere' && !KENNUNG.test(id)) this.fehler(ort, `„${k.art}“: „${id}“ ist keine Kennung (Buchstaben, Ziffern, Bindestrich)`);
    }
    const { kopf: rohKopf, felder: rohFelder } = teileKnoten(k, rel, this.b);
    const kopf = this.kopf(rohKopf, def.kopf ?? {}, ort);
    const erlaubt = def.felder ?? ['text'];
    for (const [name, f] of Object.entries(rohFelder)) {
      if (!erlaubt.includes(name)) {
        this.fehler(`${rel}:${f.zeile}`, name === 'text'
          ? `„${k.art}“ hat keinen freien Text – Text gehört in ein Feld (${erlaubt.join(', ') || 'keins'})`
          : `„${k.art}“ kennt das Feld „${f.ueberschrift}“ nicht (erlaubt: ${erlaubt.join(', ') || 'keins'})`);
      }
    }
    for (const p of def.pflichtFelder ?? []) {
      if ((rohFelder[p]?.text ?? '') === '') this.fehler(ort, `„${k.art}${k.kennungen[0] ? ` ${k.kennungen[0]}` : ''}“: Feld „${p}“ fehlt oder ist leer`);
    }
    return { art: k.art, kennungen: k.kennungen, id: k.kennungen[0] ?? null, kopf, rohFelder, ort, knoten: k };
  }

  /**
   * Allgemeiner Baustein (docs/INHALTSFORMAT.md: Block).
   * @param {Knoten} k
   * @param {string} eltern
   * @param {string} rel
   * @returns {any}
   */
  block(k, eltern, rel) {
    const r = this.lies(k, eltern, rel);
    if (r === null) return null;
    /** @type {Record<string, string>} */
    const felder = {};
    /** @type {any[] | null} */
    let liste = null;
    const kopf = { ...r.kopf };
    for (const [name, f] of Object.entries(r.rohFelder)) {
      const ortF = `${rel}:${f.zeile}`;
      felder[name] = this.html(f.text, ortF);
    }
    if (r.art === 'zitat') {
      const text = r.rohFelder['text']?.text ?? '';
      // R50: ein Zitat aus einer Liste darf als Liste stehen („- Welche Ziele gelten?“) – geprüft wird der Wortlaut ohne die Marken
      const zeilen = text.split('\n').filter((z) => z.trim() !== '');
      const alsListe = zeilen.length > 1 && zeilen.every((z) => /^\s*- \S/u.test(z));
      const erg = this.pruefeZitat(r.kennungen, alsListe ? zeilen.map((z) => z.replace(/^\s*- /u, '')).join(' ') : text, r.ort);
      // R51: als Liste nur, was in der Quelle eine Liste ist – jeder Punkt ist ein ganzer Punkt der Quelle, in ihrer Reihenfolge
      const q = this.quelle;
      if (alsListe && q !== null) {
        const bl = r.kennungen.length === 1 ? q.nachId.get(r.kennungen[0] ?? '') : undefined;
        if (bl === undefined || bl.art !== 'liste' || !Array.isArray(bl.punkte)) {
          this.fehler(r.ort, `Zitat als Liste nur aus einer Liste des Whitepapers – ${r.kennungen.join(' ')} ist keine`);
        } else {
          const punkte = bl.punkte.map((p) => q.normalisiere(p));
          let j = 0;
          for (const z of zeilen.map((x) => q.normalisiere(x.replace(/^\s*- /u, '')))) {
            while (j < punkte.length && punkte[j] !== z) j++;
            if (j >= punkte.length) {
              this.fehler(r.ort, `Zitat als Liste: „${z.slice(0, 40)}“ ist kein ganzer Punkt von ${bl.id} (in der Reihenfolge der Quelle)`);
              break;
            }
            j++;
          }
        }
      }
      kopf['vollstaendig'] = erg.vollstaendig;
      const absaetze = r.kennungen.join(' ');
      const innen = this.html(text, r.ort);
      felder['text'] = `<blockquote class="mvg-zitat" data-absatz="${esc(absaetze)}">${innen}</blockquote>`;
      this.merkeDeckung(eltern, r.kennungen, rel);
    }
    if (r.art === 'tafel' && r.id !== null) {
      const t = this.quelle?.nachId.get(r.id);
      if (this.quelle !== null && (t === undefined || t.art !== 'tabelle')) this.fehler(r.ort, `Tafel: „${r.id}“ ist keine Tabelle im Whitepaper`);
      kopf['tabelle'] = { kopf: t?.kopf ?? [], zeilen: t?.zeilen ?? [] };
      const hervor = (kopf['hervor'] ?? []).map(Number);
      for (const n of hervor) if (!Number.isInteger(n) || n < 1 || n > (t?.zeilen?.length ?? 0)) this.fehler(r.ort, `Tafel ${r.id}: „hervor: ${n}“ – die Tabelle hat ${t?.zeilen?.length ?? 0} Zeilen`);
      kopf['hervor'] = hervor;
      if (kopf['form'] === 'schwelle' && (t?.kopf?.length ?? 0) !== 2) this.fehler(r.ort, `Tafel ${r.id}: Form „schwelle“ braucht eine Tabelle mit zwei Spalten`);
      if (kopf['form'] === 'felder' && (t?.kopf?.length ?? 0) < 5) this.fehler(r.ort, `Tafel ${r.id}: Form „felder“ braucht fünf Spalten (Feld, Kern, Vorbereitung, Fehlstelle, Antwort)`);
      if (kopf['form'] === 'ketten' && (t?.kopf?.length ?? 0) < 4) this.fehler(r.ort, `Tafel ${r.id}: Form „ketten“ braucht vier Spalten`);
      this.merkeDeckung(eltern, [r.id], rel);
    }
    const kinder = k.kinder.map((kind) => this.block(kind, r.art, rel)).filter((x) => x !== null);
    return { art: r.art, kennungen: r.kennungen, id: r.id, kopf, felder, liste, kinder };
  }

  /** Theorie-Seiten: welche Absätze sie abdecken (für die Abdeckung). @param {string} eltern @param {string[]} ids @param {string} rel */
  merkeDeckung(eltern, ids, rel) {
    const seite = /^inhalte\/theorie\/(k\d\d)-/u.exec(rel)?.[1];
    if (seite === undefined) return;
    void eltern;
    for (const id of ids) {
      const s = this.theorieDeckt.get(id) ?? new Set();
      s.add(seite);
      this.theorieDeckt.set(id, s);
    }
  }

  /**
   * Markdown-Liste mit Kennungen `{#id}` bzw. Haken `[x] [-] [ ]`.
   * @param {string} text
   * @param {string} ort
   * @param {{ ids: boolean, haken: boolean }} art
   */
  liste(text, ort, art) {
    /** @type {string[]} */
    const punkte = [];
    for (const z of text.split('\n')) {
      const m = /^\s*[-*]\s+(.*)$/u.exec(z);
      if (m) punkte.push(m[1] ?? '');
      else if (z.trim() !== '' && punkte.length > 0) punkte[punkte.length - 1] += ` ${z.trim()}`;
      else if (z.trim() !== '') this.fehler(ort, `Text außerhalb der Liste: „${z.trim().slice(0, 40)}“ (jeder Punkt beginnt mit „- “)`);
    }
    if (punkte.length === 0) this.fehler(ort, 'Liste ohne Punkte');
    /** @type {Set<string>} */
    const gesehen = new Set();
    return punkte.map((p) => {
      let rest = p.trim();
      /** @type {string | null} */
      let id = null;
      /** @type {string | null} */
      let stand = null;
      if (art.haken) {
        const h = /^\[( |x|X|-)\]\s+(.*)$/u.exec(rest);
        if (!h) this.fehler(ort, `Checklisten-Punkt ohne [x], [-] oder [ ]: „${rest.slice(0, 40)}“`);
        else {
          stand = h[1] === ' ' ? 'offen' : h[1] === '-' ? 'fehlt' : 'erfuellt';
          rest = h[2] ?? '';
        }
      }
      const i = /\s*\{#([A-Za-z0-9-]+)\}\s*$/u.exec(rest);
      if (i) {
        id = i[1] ?? null;
        rest = rest.slice(0, i.index);
      }
      if (art.ids && id === null) this.fehler(ort, `Listenpunkt ohne Kennung {#…}: „${rest.slice(0, 40)}“`);
      if (id !== null) {
        if (gesehen.has(id)) this.fehler(ort, `Kennung {#${id}} doppelt`);
        gesehen.add(id);
      }
      return { id, stand, html: this.inline(rest, ort) };
    });
  }

  /** Feld als Liste (Leitfragen): Punkte → Inline-HTML. @param {string} text @param {string} ort */
  punkte(text, ort) {
    return this.liste(text, ort, { ids: false, haken: false }).map((p) => p.html);
  }
}

/* ====================================================== Dateiarten == */

/**
 * @param {Kompilierer} c
 * @param {string} rel
 * @param {string} art
 * @param {string} text
 */
function leseDateiKopf(c, rel, art, text) {
  const { kopf: roh, wurzel } = zerlege(text, rel, c.b);
  const def = /** @type {any} */ (DATEI_ARTEN)[art];
  const kopf = c.kopf(roh, def.kopf, `${rel}:1`);
  const { felder: rohFelder } = teileKnoten(wurzel, rel, c.b);
  for (const [name, f] of Object.entries(rohFelder)) {
    if (!def.felder.includes(name)) c.fehler(`${rel}:${f.zeile}`, `Feld „${f.ueberschrift}“ ist hier nicht erlaubt (erlaubt: ${def.felder.join(', ')})`);
  }
  for (const p of def.pflichtFelder ?? []) if ((rohFelder[p]?.text ?? '') === '') c.fehler(`${rel}:1`, `Feld „${p}“ fehlt`);
  return { kopf, wurzel, rohFelder };
}

/**
 * @param {Kompilierer} c
 * @param {string} rel
 * @param {string} text
 */

/**
 * Startseite (O-21): Kicker, Leitsatz, These. Steht beim Leitsatz eine Absatz-ID (`titel-quelle`),
 * muss er dort wörtlich vorkommen (O-17).
 * @param {Kompilierer} c
 * @param {string} rel
 * @param {string} text
 */
function baueStartseite(c, rel, text) {
  const { kopf, rohFelder } = leseDateiKopf(c, rel, '@start', text);
  const quelle = typeof kopf.titelQuelle === 'string' ? kopf.titelQuelle : null;
  if (quelle !== null) c.pruefeZitat([quelle], kopf.titel ?? '', `${rel}:1`);
  return {
    kicker: kopf.kicker ?? '',
    titel: kopf.titel ?? '',
    titelQuelle: quelle,
    these: c.inline(rohFelder['text']?.text ?? '', `${rel}:1`),
  };
}

/**
 * @param {Kompilierer} c
 * @param {Knoten} k
 * @param {string} eltern
 * @param {string} rel
 */
function baueEbenen(c, k, eltern, rel) {
  const r = c.lies(k, eltern, rel);
  if (r === null) return null;
  const aus = [];
  for (const kind of k.kinder) {
    const bl = c.block(kind, 'ebenen', rel);
    if (bl === null || bl.art !== 'ebene') continue;
    const nr = Number(bl.id);
    if (aus.some((e) => e.nr === nr)) c.fehler(`${rel}:${kind.zeile}`, `Ebene ${nr} doppelt`);
    if (nr === 4 && !bl.kinder.some((/** @type {any} */ x) => x.art === 'zitat')) {
      c.fehler(`${rel}:${kind.zeile}`, 'Ebene 4 (Nachweis) braucht ein „zitat“ mit Absatz-ID');
    }
    aus.push({ nr, titel: bl.kopf.titel ?? '', felder: bl.felder, bloecke: bl.kinder });
  }
  aus.sort((a, b) => a.nr - b.nr);
  return aus;
}

/**
 * @param {Kompilierer} c
 * @param {Record<string, { text: string, zeile: number }>} rohFelder
 * @param {string} rel
 */
function baueRegie(c, rohFelder, rel) {
  const n = rohFelder['notiz'];
  const l = rohFelder['leitfragen'];
  return {
    notiz: n ? c.html(n.text, `${rel}:${n.zeile}`) : null,
    leitfragen: l ? c.punkte(l.text, `${rel}:${l.zeile}`) : [],
  };
}

/**
 * @param {Kompilierer} c
 * @param {string} rel
 * @param {string} id
 * @param {string} text
 * @param {Record<string, any>} regie Regie-Material (P9.2): Schlüssel `theorie/k5`
 */
function baueTheorie(c, rel, id, text, regie) {
  const { kopf, wurzel, rohFelder } = leseDateiKopf(c, rel, '@theorie', text);
  const ort = `${rel}:1`;
  if (kopf.kapitel !== undefined && `k${String(kopf.kapitel).padStart(2, '0')}` !== id) c.fehler(ort, `kapitel ${kopf.kapitel} passt nicht zum Dateinamen „${id}“`);
  const bloecke = [];
  for (const k of wurzel.kinder) {
    if (k.art === 'regie') {
      const r = c.lies(k, '@theorie', rel);
      if (r !== null) {
        const schluessel = `theorie/k${kopf.kapitel}`;
        if (kopf.kapitel === undefined) c.fehler(`${rel}:${k.zeile}`, 'Regie-Block ohne „kapitel:“ im Dateikopf');
        else if (regie[schluessel] !== undefined) c.fehler(`${rel}:${k.zeile}`, `zweiter Regie-Block zu Kapitel ${kopf.kapitel}`);
        else regie[schluessel] = baueRegie(c, r.rohFelder, rel);
      }
      continue;
    }
    if (k.art === 'ebenen') {
      const e = baueEbenen(c, k, '@theorie', rel);
      if (e !== null) bloecke.push({ art: 'ebenen', kennungen: [], id: null, kopf: {}, felder: {}, liste: null, kinder: [], ebenen: e });
      continue;
    }
    const bl = c.block(k, '@theorie', rel);
    if (bl !== null) bloecke.push(bl);
  }
  // Wissenschecks (P11.6): mindestens zwei Antworten und ein wortgleicher Beleg
  const pruefeCheck = (/** @type {any[]} */ liste) => {
    for (const b of liste) {
      if (b.art === 'wissenscheck') {
        const antworten = b.kinder.filter((/** @type {any} */ x) => x.art === 'antwort').length;
        if (antworten < 2) c.fehler(rel, `Wissenscheck ${b.id}: mindestens zwei Antworten`);
        if (!b.kinder.some((/** @type {any} */ x) => x.art === 'zitat')) c.fehler(rel, `Wissenscheck ${b.id}: Beleg fehlt (zitat)`);
      }
      pruefeCheck(b.kinder ?? []);
    }
  };
  pruefeCheck(bloecke);
  const deckt = [];
  for (const ref of kopf.deckt ?? []) {
    const ids = c.expandiere(ref, ort);
    deckt.push(...ids);
    c.merkeDeckung('@theorie', ids, rel);
  }
  if (kopf.kapitel === undefined) c.fehler(ort, 'kapitel fehlt (Lernseite wäre unerreichbar)');
  return {
    id,
    kapitel: kopf.kapitel ?? 0,
    thema: kopf.thema ?? id,
    reihe: kopf.reihe ?? kopf.kapitel ?? 0,
    titel: kopf.titel ?? '',
    kurztitel: kopf.kurztitel ?? kopf.titel ?? '',
    deckt,
    einleitung: c.html(rohFelder['text']?.text ?? '', ort),
    bloecke,
    quelle: rel,
  };
}

/**
 * Begriffs-Kompass (P10.5, E7): Der Begriff muss im Beleg-Absatz stehen (so bleibt jede Zuordnung am
 * Whitepaper prüfbar); steht er im Glossar, verweist der Eintrag dorthin.
 * @param {Kompilierer} c
 * @param {string} rel
 * @param {string} text
 */
function baueKompass(c, rel, text) {
  const { wurzel } = leseDateiKopf(c, rel, '@kompass', text);
  const aus = [];
  for (const k of wurzel.kinder) {
    const bl = c.block(k, '@kompass', rel);
    if (bl === null || bl.art !== 'kompass') continue;
    const ort = `${rel}:${k.zeile}`;
    if (aus.some((e) => e.id === bl.id)) c.fehler(ort, `Kompass-Eintrag ${bl.id} doppelt`);
    const begriff = String(bl.kopf.begriff ?? '');
    const beleg = String(bl.kopf.beleg ?? '');
    // P16.4: Begriffe aus V2.4 belegt ein interner V2.4-Verweis (v24:hb-3.1); die Wortprüfung gilt nur für V1.2-Absätze
    const v24 = /^v24:[a-z]+(?:-[\w.]+)?$/u.test(beleg);
    if (beleg.startsWith('v24:') && !v24) c.fehler(ort, `Kompass ${bl.id}: Beleg „${beleg}“ unlesbar (v24:hb-3.1)`);
    const ids = v24 ? [] : c.expandiere(beleg, ort);
    if (ids.length > 1) c.fehler(ort, `Kompass ${bl.id}: genau eine Absatz-ID als Beleg`);
    const block = c.quelle?.nachId.get(ids[0] ?? '');
    // als eigenes Wort (Wortanfang und -ende, Plural-/Fugen-s und -n zugelassen), nicht nur als Teilstring
    const wort = new RegExp(`(?<![\\p{L}\\p{N}])${c.quelle?.normalisiere(begriff).replace(/[.*+?^${}()|[\]\\]/gu, '\\$&') ?? ''}(?:e?n|e?s)?(?![\\p{L}\\p{N}])`, 'iu');
    if (block !== undefined && c.quelle !== null && !wort.test(c.quelle.normalisiere(block.text))) {
      c.fehler(ort, `Kompass ${bl.id}: „${begriff}“ steht nicht in ${beleg}`);
    }
    const andere = /** @type {string[]} */ (bl.kopf.andere ?? []);
    if (andere.length === 0) c.fehler(ort, `Kompass ${bl.id}: „andere“ ist leer`);
    const g = c.quelle !== null ? c.glossarNachBegriff.get(c.quelle.normalisiere(begriff).toLowerCase()) ?? null : null;
    aus.push({ id: bl.id ?? '', begriff, andere, beleg, glossar: g?.id ?? null, hinweis: bl.felder.hinweis ?? null });
  }
  return aus;
}

/* ====================================================== Hauptlauf == */

/** @param {string} ordner @returns {string[]} relative Pfade (mit /), sortiert */
function alleDateien(ordner) {
  /** @type {string[]} */
  const aus = [];
  /** @param {string} d @param {string} rel */
  const gehe = (d, rel) => {
    for (const name of readdirSync(d).sort()) {
      if (name.startsWith('_') || name.startsWith('.')) continue;
      const voll = path.join(d, name);
      const r = rel === '' ? name : `${rel}/${name}`;
      if (statSync(voll).isDirectory()) gehe(voll, r);
      else aus.push(r);
    }
  };
  if (existsSync(ordner)) gehe(ordner, '');
  return aus;
}

/**
 * Kompiliert alle Inhalte.
 * @param {Optionen} [optionen]
 * @returns {Promise<{ fehler: string[], warnungen: string[], inhalte: any }>}
 */
export async function kompiliere(optionen = {}) {
  const pruefe = optionen.pruefe === true;
  const wurzel = path.resolve(optionen.wurzel ?? WURZEL);
  const wpPfad = path.resolve(wurzel, optionen.whitepaperPfad ?? STANDARD_WHITEPAPER);
  const ziel = optionen.ziel === null ? null : path.resolve(wurzel, optionen.ziel ?? STANDARD_ZIEL);
  const b = new Befunde();

  /** @type {Quelle | null} */
  let quelle = null;
  try {
    quelle = await ladeQuelle(wpPfad);
  } catch (e) {
    b.fehler(path.relative(wurzel, wpPfad).replace(/\\/gu, '/'), `whitepaper.json unlesbar: ${String(e)}`, true);
  }
  // Eigene Glossarquelle (P16.4, O-36): ändert, entfernt und ergänzt Einträge; Belege bleiben intern
  const glossarPfad = path.join(wurzel, 'inhalte', 'glossar.yaml');
  if (quelle !== null && existsSync(glossarPfad)) quelle = { ...quelle, glossar: wendeGlossarAn(quelle.glossar, readFileSync(glossarPfad, 'utf8'), b) };
  if (quelle === null) b.warnung('whitepaper', `${path.relative(wurzel, wpPfad).replace(/\\/gu, '/')} fehlt – Zitate, Glossar und Abdeckung nur eingeschränkt geprüft`, true);

  const c = new Kompilierer(b, quelle, pruefe);
  const inhaltOrdner = path.join(wurzel, 'inhalte');
  const dateien = alleDateien(inhaltOrdner);
  const lies = (/** @type {string} */ r) => readFileSync(path.join(inhaltOrdner, r), 'utf8');

  /** @type {any} */
  let startseite = null;
  /** @type {Record<string, any>} */
  const theorie = {};
  /** @type {any[]} */
  let kompass = [];
  /** @type {Record<string, any>} */
  const regie = {};
  /** @type {Record<string, unknown> | null} */
  let abdeckungRoh = null;
  /** @type {{ rel: string, text: string }[]} */
  const geschichteDateien = [];
  /** @type {any} */
  let werkzeuge = null;

  for (const r of dateien) {
    const rel = `inhalte/${r}`;
    let m;
    if (r === 'start.md') startseite = baueStartseite(c, rel, lies(r));
    else if ((m = /^theorie\/(k\d\d)-[^/]+\.md$/u.exec(r))) {
      const id = m[1] ?? '';
      if (theorie[id] !== undefined) c.fehler(rel, `zweite Lernseite für ${id}`);
      theorie[id] = baueTheorie(c, rel, id, lies(r), regie);
    } else if (r === 'begriffs-kompass.md') kompass = baueKompass(c, rel, lies(r));
    else if (r === 'abdeckung.yaml') abdeckungRoh = leseYaml(lies(r), rel, 1, b);
    else if (/^abbildungen\/abb-\d+\.yaml$/u.test(r)) { /* baueAbbildungen (P14) */ }
    else if (/^geschichte\/[^/]+\.yaml$/u.test(r)) geschichteDateien.push({ rel, text: lies(r) });
    else if (r === 'werkzeuge.yaml') werkzeuge = baueWerkzeuge(c, rel, lies(r));
    else if (r === 'glossar.yaml') { /* vor dem Kompilierer angewandt (wendeGlossarAn) */ }
    else if (r === 'fall.md') { /* Fall-Bibel: Nachschlagewerk der Autoren, nicht auf der Seite (P16.14) */ }
    else if (/^rechtliches\/[^/]+\.md$/u.test(r)) { /* Impressum und Datenschutz: werkzeuge/bau.mjs (baueBeigaben) */ }
    else if (r.endsWith('.md') || r.endsWith('.yaml')) c.warnung(rel, 'Datei gehört zu keiner bekannten Art (docs/INHALTSFORMAT.md Abschnitt 1) – ignoriert');
  }

  // Themen (P16.3): Kennung und Reihenfolge eindeutig
  for (const [i, a] of Object.values(theorie).entries()) {
    for (const b of Object.values(theorie).slice(i + 1)) {
      if (a.thema === b.thema) c.fehler(b.quelle, `Thema „${b.thema}“ doppelt (auch ${a.quelle})`);
      if (a.reihe === b.reihe) c.fehler(b.quelle, `Reihe ${b.reihe} doppelt (auch ${a.quelle})`);
    }
  }

  // Glossar (alle Einträge, für Mouseover)
  /** @type {Record<string, any>} */
  const glossar = {};
  for (const g of quelle?.glossar ?? []) glossar[g.id] = { id: g.id, begriff: g.begriff, definition: g.definition, vorkommen: { kapitel: [] } };
  // Wo ein Begriff vorkommt (P6.14, Glossar „Kommt vor in“): Kapitel aufsteigend
  const inText = (/** @type {unknown} */ x) => new Set([...JSON.stringify(x).matchAll(/data-glossar=\\"([^"\\]+)\\"/gu)].map((m) => m[1]));
  for (const t of Object.values(theorie).sort((a, b) => /** @type {any} */ (a).kapitel - /** @type {any} */ (b).kapitel)) {
    for (const g of inText(t)) if (glossar[g] !== undefined && !glossar[g].vorkommen.kapitel.includes(/** @type {any} */ (t).kapitel)) glossar[g].vorkommen.kapitel.push(/** @type {any} */ (t).kapitel);
  }

  const abdeckung = baueAbdeckung(c, quelle, abdeckungRoh, theorie, pruefe);
  const abb = baueAbbildungen(c, quelle, wurzel, theorie, pruefe);
  const gesch = baueGeschichte(c, geschichteDateien);
  const inhalte = {
    version: 1,
    // von der Quelle nur die Abbildungen; Titel, Fassung und Gliederung bleiben intern (O-38)
    abbildungen: abb.liste,
    startseite,
    glossar,
    theorie,
    kompass,
    abdeckung,
    regie,
    geschichte: gesch.geschichte,
    geschichteRegie: gesch.regie,
    werkzeuge,
  };

  const json = stabilesJson(inhalte);
  // Begriffe im FERTIGEN Ergebnis (docs/BEGRIFFE.md): Hier landen auch Texte, die nicht aus
  // inhalte/ stammen – Whitepaper-Originaltext, Glossar, Kapiteltitel. Ein Re-Import mit alten
  // Begriffen fiele sonst niemandem auf.
  if (pruefe) {
    // Der Begriffs-Kompass nennt die anderen Wörter absichtlich (Ausnahme in werkzeuge/begriffe.json)
    const ohneKompass = stabilesJson({ ...inhalte, kompass: inhalte.kompass.map((/** @type {any} */ e) => ({ ...e, andere: [] })) });
    for (const fund of pruefeText(ohneKompass, STANDARD_ZIEL.replace(/\\/gu, '/'))) b.fehler('begriffe', formatiereFund(fund));
  }

  if (ziel !== null) {
    mkdirSync(path.dirname(ziel), { recursive: true });
    writeFileSync(ziel, json, 'utf8');
    // Bilddaten getrennt (nur src/main.ts lädt sie; Tests und Werkzeuge bleiben klein)
    writeFileSync(path.join(path.dirname(ziel), 'abbildungen.json'), stabilesJson(abb.daten), 'utf8');
  }

  const fehler = b.fehlerListe.filter((f) => pruefe || f.hart).map((f) => f.text);
  const warnungen = b.warnListe.filter((w) => pruefe || w.hart).map((w) => w.text);
  return { fehler, warnungen, inhalte };
}

/**
 * Glossar der Seite (P16.4): Einträge aus whitepaper.json, geändert, entfernt und ergänzt nach inhalte/glossar.yaml
 * (`aendern: { id: { begriff?, definition, belege } }`, `entfernen: [id]`, `neu: [{ id, begriff, definition, belege }]`).
 * Jede Änderung und jeder neue Eintrag braucht interne Belege (V1.2-Absatz-ID oder `v24:…`).
 * @param {{ id: string, begriff: string, definition: string }[]} glossar
 * @param {string} text
 * @param {Befunde} b
 */
export function wendeGlossarAn(glossar, text, b) {
  const ort = 'inhalte/glossar.yaml';
  /** @type {any} */
  let y = {};
  try {
    y = YAML.parse(text) ?? {};
  } catch (e) {
    b.fehler(ort, `YAML unlesbar: ${String(/** @type {Error} */ (e).message ?? e).split('\n')[0]}`, true);
    return glossar;
  }
  const belegt = (/** @type {any} */ x, /** @type {string} */ id) => {
    if (!Array.isArray(x?.belege) || x.belege.length === 0) b.fehler(ort, `${id}: interne Belege fehlen`);
  };
  const entfernen = new Set((y.entfernen ?? []).map(String));
  for (const id of entfernen) if (!glossar.some((g) => g.id === id)) b.fehler(ort, `entfernen: ${id} gibt es nicht`);
  const aus = glossar.filter((g) => !entfernen.has(g.id)).map((g) => {
    const a = y.aendern?.[g.id];
    if (a === undefined) return g;
    belegt(a, g.id);
    return { ...g, begriff: a.begriff !== undefined ? String(a.begriff) : g.begriff, definition: a.definition !== undefined ? String(a.definition).trim() : g.definition };
  });
  for (const id of Object.keys(y.aendern ?? {})) if (!glossar.some((g) => g.id === id)) b.fehler(ort, `aendern: ${id} gibt es nicht`);
  for (const n of y.neu ?? []) {
    const id = String(n.id ?? '');
    if (!/^g-[a-z0-9-]+$/u.test(id)) b.fehler(ort, `neu: Kennung „${id}“ (g-…)`);
    if (aus.some((g) => g.id === id)) b.fehler(ort, `neu: ${id} doppelt`);
    if (!n.begriff || !n.definition) b.fehler(ort, `neu: ${id} ohne Begriff oder Definition`);
    belegt(n, id);
    aus.push({ id, begriff: String(n.begriff ?? ''), definition: String(n.definition ?? '').trim() });
  }
  return aus;
}

/**
 * Abbildungen der DOCX V1.2 (P14, O-32, L-77): Beschreibung aus inhalte/abbildungen/abb-N.yaml, Bild als WebP
 * (erzeugt von werkzeuge/abbildungen.mjs, Stand in stand.json). Eine Abbildung ohne Beschreibung bleibt reiner
 * Verzeichniseintrag (`bild: null`). Veraltete oder fehlende Bilder sind harte Fehler – der Bau hielte sonst an
 * einem alten Bild fest. Rückgabe: Verzeichnis für inhalte.json und die Bilder als data:-URL (abbildungen.json).
 * @param {Kompilierer} c @param {any} quelle @param {string} wurzel @param {Record<string, any>} theorie @param {boolean} pruefe
 */
/**
 * Zeilenumbrüche einer Überdeckung für die Bildunterschrift: „Änderungs-⏎steuerung“ → „Änderungssteuerung“
 * (Trennstrich vor Kleinbuchstabe fällt weg), „MVG-⏎Neuinitialisierung“ → „MVG-Neuinitialisierung“,
 * „Änderungs-/⏎Maßnahmen…“ → „Änderungs-/Maßnahmen…“ (nach Schrägstrich kein Leerzeichen), sonst Leerzeichen.
 * @param {string} text
 */
export function einzeilig(text) {
  return text
    .replace(/-\s*\n\s*(?=\p{Ll})/gu, '')
    .replace(/-\s*\n\s*/gu, '-')
    .replace(/\/\s*\n\s*/gu, '/')
    .replace(/\s*\n\s*/gu, ' ');
}

export function baueAbbildungen(c, quelle, wurzel, theorie, pruefe) {
  /** @type {any[]} */
  const liste = quelle?.abbildungen ?? [];
  const kontext = { ids: new Set(/** @type {Map<string, any>} */ (quelle?.nachId ?? new Map()).keys()), abbildungen: new Map(liste.map((a) => [a.id, a])) };
  /** @type {{ datei: string, roh: any }[]} */
  let beschreibungen = [];
  try {
    beschreibungen = leseBeschreibungen(wurzel);
  } catch (e) {
    c.b.fehler(ABB_ORDNER, `Beschreibung unlesbar: ${String(e)}`, true);
  }
  /** @type {Map<string, { datei: string, roh: any }>} */
  const nachId = new Map();
  for (const e of beschreibungen) {
    const f = quelle === null ? [] : pruefeBeschreibung(e.roh, e.datei, kontext);
    // R48: der neue Text einer Überdeckung ist ein Begriff des Texts – wortgleich im Absatz `beleg` (INHALTSFORMAT 4.6)
    if (quelle !== null && f.length === 0) {
      (e.roh.angeglichen ?? []).forEach((/** @type {any} */ u, /** @type {number} */ i) => {
        const norm = typeof quelle.normalisiere === 'function' ? quelle.normalisiere : (/** @type {string} */ t) => t.replace(/\s+/gu, ' ').trim();
        const bl = quelle.nachId?.get(String(u.beleg));
        if (bl === undefined) return;
        const volltext = norm([bl?.text ?? '', ...(bl?.punkte ?? []), ...(bl?.kopf ?? []), ...(bl?.zeilen ?? []).flat()].join(' '));
        const neu = norm(einzeilig(String(u.text)));
        // R49: als ganzer Begriff – ein Wortbruchstück („Freigabeentscheidun“) ist nicht wortgleich
        const ganz = new RegExp(`(?<![\\p{L}\\p{N}])${neu.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}(?![\\p{L}\\p{N}])`, 'u');
        if (!ganz.test(volltext)) f.push(`${e.datei}: angeglichen[${i}]: „${neu}“ steht nicht wortgleich im Absatz ${u.beleg}`);
      });
    }
    for (const x of f) c.b.fehler(e.datei, x.slice(e.datei.length + 2), true);
    if (f.length === 0) nachId.set(e.roh.id, e);
  }
  const standPfad = path.join(wurzel, ABB_STAND);
  /** @type {any} */
  let stand = { werkzeug: null, abbildungen: {} };
  if (existsSync(standPfad)) stand = JSON.parse(readFileSync(standPfad, 'utf8'));
  /** @type {Record<string, string>} */
  const daten = {};
  const aus = liste.map((a, i) => {
    const basis = { id: a.id, nr: i + 1, kapitel: a.kapitel, ort: a.ort };
    const e = nachId.get(a.id);
    if (e === undefined) return { ...basis, bild: null };
    const st = stand.abbildungen?.[a.id];
    const webpPfad = path.join(wurzel, ABB_ORDNER, `${a.id}.webp`);
    if (stand.werkzeug !== ABB_VERSION || st === undefined || st.eingabe !== eingabeSumme(e.roh, a.sha256)) {
      c.b.fehler(e.datei, `Bild veraltet – node werkzeuge/abbildungen.mjs ${a.id}`, true);
      return { ...basis, bild: null };
    }
    const webp = existsSync(webpPfad) ? readFileSync(webpPfad) : null;
    if (webp === null || createHash('sha256').update(webp).digest('hex') !== st.webp) {
      c.b.fehler(e.datei, `${a.id}.webp fehlt oder passt nicht zu stand.json – node werkzeuge/abbildungen.mjs ${a.id}`, true);
      return { ...basis, bild: null };
    }
    daten[a.id] = `data:image/webp;base64,${webp.toString('base64')}`;
    const ort = `${e.datei}:1`;
    return {
      ...basis,
      bild: {
        titel: String(e.roh.titel).trim(),
        alt: String(e.roh.alt).trim(),
        breite: st.breite,
        hoehe: st.hoehe,
        angeglichen: (e.roh.angeglichen ?? []).map((/** @type {any} */ u) => ({ text: einzeilig(String(u.text)), beleg: u.beleg })),
        abweichungen: (e.roh.abweichungen ?? []).map((/** @type {any} */ x) => ({ html: c.inline(String(x.text), ort), belege: String(x.beleg).split(/\s+/u) })),
      },
    };
  });
  // Lernseiten: `::: abbildung abb-N` nur mit Beschreibung, im eigenen Kapitel, je Abbildung höchstens einmal
  /** @type {Map<string, string>} */
  const benutzt = new Map();
  /** @param {any[]} bloecke @param {any} seite */
  const gehe = (bloecke, seite) => {
    for (const b of bloecke) {
      if (b.art === 'abbildung' && b.id !== null) {
        const a = aus.find((x) => x.id === b.id);
        if (a === undefined) c.fehler(seite.quelle, `Abbildung „${b.id}“ gibt es nicht (whitepaper.json)`);
        else if (a.bild === null) c.fehler(seite.quelle, `Abbildung „${b.id}“ hat keine Beschreibung in ${ABB_ORDNER}/${b.id}.yaml`);
        else if (Number(a.kapitel) !== seite.kapitel) c.fehler(seite.quelle, `Abbildung „${b.id}“ gehört zu Kapitel ${a.kapitel}, nicht ${seite.kapitel}`);
        if (benutzt.has(b.id)) c.fehler(seite.quelle, `Abbildung „${b.id}“ steht schon auf ${benutzt.get(b.id)}`);
        else benutzt.set(b.id, seite.quelle);
      }
      gehe(b.kinder ?? [], seite);
    }
  };
  for (const t of Object.values(theorie)) gehe(t.bloecke ?? [], t);
  // P16.3 (O-38): der Originaltext entfällt – jede Abbildung mit Bild steht auf dem Thema ihres Teils (alle 13 bleiben)
  if (pruefe) for (const a of aus) if (a.bild !== null && !benutzt.has(a.id)) c.fehler(ABB_ORDNER, `${a.id} steht auf keinem Thema (::: abbildung ${a.id})`);
  return { liste: aus, daten };
}

/**
 * @param {Kompilierer} c
 * @param {Quelle | null} quelle
 * @param {Record<string, unknown> | null} roh
 * @param {Record<string, any>} theorie
 * @param {boolean} pruefe
 */
function baueAbdeckung(c, quelle, roh, theorie, pruefe) {
  const rel = 'inhalte/abdeckung.yaml';
  /** @type {Record<string, { theorie: string[] }>} */
  const ziele = {};
  const ziel = (/** @type {string} */ id) => (ziele[id] ??= { theorie: [] });
  // Je Kapitel gibt es eine Lernseite kNN (O-20); bis sie gebaut ist (P6), gilt sie als geplant.
  const kapitelSeite = (/** @type {string} */ nr) => `k${nr.padStart(2, '0')}`;
  const kapitelSeiten = new Set((quelle?.bloecke ?? []).map((bl) => kapitelSeite(bl.kapitel)));
  for (const [id, wert] of Object.entries(roh ?? {})) {
    if (!BLOCK_ID.test(id)) { c.fehler(rel, `„${id}“ ist keine Absatz-ID`); continue; }
    if (quelle !== null && !quelle.nachId.has(id)) c.fehler(rel, `Absatz-ID „${id}“ gibt es im Whitepaper nicht`);
    if (typeof wert !== 'object' || wert === null || Array.isArray(wert)) { c.fehler(rel, `${id}: erwartet „theorie:“`); continue; }
    const o = /** @type {Record<string, unknown>} */ (wert);
    for (const k of Object.keys(o)) if (k !== 'theorie') c.fehler(rel, `${id}: unbekannter Schlüssel „${k}“`);
    const liste = (/** @type {unknown} */ x) => (Array.isArray(x) ? x : x === undefined || x === '' ? [] : [x]).map(String);
    for (const t of liste(o['theorie'])) {
      if (theorie[t] === undefined && !kapitelSeiten.has(t)) c.fehler(rel, `${id}: Theorie-Seite „${t}“ gibt es nicht (weder Lernseite noch Kapitel des Whitepapers)`);
      ziel(id).theorie.push(t);
    }
  }
  for (const [id, seiten] of c.theorieDeckt) for (const s of seiten) if (!ziel(id).theorie.includes(s)) ziel(id).theorie.push(s);
  for (const z of Object.values(ziele)) z.theorie.sort();
  const gesamt = quelle?.bloecke.length ?? 0;
  const zugeordnet = quelle === null ? 0 : quelle.bloecke.filter((bl) => (ziele[bl.id]?.theorie.length ?? 0) > 0).length;
  const anteil = gesamt === 0 ? 0 : Math.round((zugeordnet / gesamt) * 10000) / 10000;
  if (pruefe && quelle !== null && zugeordnet < gesamt) {
    const fehlen = quelle.bloecke.filter((bl) => (ziele[bl.id]?.theorie.length ?? 0) === 0).map((bl) => bl.id);
    c.fehler(rel, `Theorie-Abdeckung ${zugeordnet} von ${gesamt} Absätzen (${(anteil * 100).toFixed(1).replace('.', ',')} %) – Pflicht 100 % (P1.1); ohne Seite: ${fehlen.slice(0, 8).join(', ')}${fehlen.length > 8 ? ' …' : ''}`);
  }
  if (pruefe && quelle !== null) {
    for (const bl of quelle.bloecke) {
      const eigene = kapitelSeite(bl.kapitel);
      const z = ziele[bl.id];
      if (z !== undefined && z.theorie.length > 0 && !z.theorie.includes(eigene)) c.fehler(rel, `${bl.id}: steht nicht auf der Seite seines Kapitels (${eigene})`);
    }
  }
  return { gesamt, zugeordnet, anteil, ziele };
}

/* ============================================================ CLI == */

/** Direkt aufgerufen (nicht importiert)? Auch über Links (werkzeuge/haupt.mjs). */
const istHaupt = istHauptmodul(import.meta.url);

if (istHaupt) {
  const pruefe = process.argv.includes('--pruefe');
  const w = process.argv.indexOf('--wurzel');
  /** @type {Optionen} */
  const optionen = { pruefe };
  if (w > 0 && process.argv[w + 1] !== undefined) optionen.wurzel = path.resolve(/** @type {string} */ (process.argv[w + 1]));
  const { fehler, warnungen, inhalte } = await kompiliere(optionen);
  const th = Object.keys(inhalte.theorie).length;
  for (const w of warnungen) console.log(`Warnung  ${w}`);
  for (const f of fehler) console.log(`FEHLER   ${f}`);
  console.log(`inhalte: ${th} Themen, ${inhalte.geschichte?.stationen.length ?? 0} Story-Stationen, ${inhalte.kompass.length} Kompass-Einträge → ${STANDARD_ZIEL.replace(/\\/gu, '/')}`);
  console.log(`${pruefe ? 'Prüfung' : 'Kompilieren'}: ${fehler.length} Fehler, ${warnungen.length} Warnungen`);
  process.exitCode = fehler.length > 0 ? 1 : 0;
}
