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
 * Die Engine-Regeln (Statuswerte, Bedingungen, Graph) kommen aus src/engine/*.ts – eine Lesart für
 * Bauzeit und Laufzeit. Deterministisch: Dateien sortiert, Schlüssel sortiert, keine Zeitstempel.
 */
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
import { istVollstaendigerStart, leseWirkEintrag } from '../src/engine/status.ts';
import { leseBedingungen, verweiseIn } from '../src/engine/bedingungen.ts';
import { findeEntscheidung, loeseEntscheidung, pruefeGraph, stationsFolge } from '../src/engine/graph.ts';

export const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const STANDARD_ZIEL = path.join('src', 'generiert', 'inhalte.json');
export const STANDARD_WHITEPAPER = path.join('quellen', 'whitepaper', 'v1.2', 'whitepaper.json');

/** Die sechs spielbaren Rollen (O-4), in Anzeige-Reihenfolge. */
export const ROLLEN = ['gf', 'bauherr', 'pl', 'ps', 'planung', 'controlling'];

const KENNUNG = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/u;
const BLOCK_ID = /^k\d+(?:\.\d+)*-[pltb]\d+$/u;
const ABSCHNITT_ID = /^k\d+(?:\.\d+)*$/u;
const FARBE = /^#[0-9A-Fa-f]{6}$/u;

const SCHRITT_ARTEN = ['text', 'lage', 'entscheidung', 'konsequenz', 'rueckbezug', 'vergleich', 'rollenwahl', 'interessenwahl', 'ebenen'];
const STATION_ARTEN = ['prolog', 'station', 'vergleich', 'wendepunkt', 'rueckspulen', 'wirklichkeit', 'ende', 'epilog'];
const FLUSS = ['fruehwarnung', 'bestaetigt', 'risiko', 'entscheidung', 'freigabe', 'massnahme', 'managementbericht'];
const TAFEL_FORMEN = ['radar', 'ketten', 'schwelle', 'pyramide', 'felder', 'bausteine', 'phasen', 'register', 'rhythmus', 'karten', 'zeitachse', 'diagnose'];
const GLIED_ARTEN = ['fruehwarnung', 'bestaetigung', 'risiko', 'aenderung', 'entscheidung', 'freigabe', 'massnahme', 'problem', 'bericht'];

/* ============================================================== Schema == */

/**
 * Kopfdaten-Typen: text, zahl (ganz), dezimal, bool, liste, karte (Text → Text), farbe, kennung,
 * wahl (werte), raci (RACI-Zeilen), status (Statuswirkung), kanten (weiter), paar ({a, b}), stufen, versionen, ids.
 * @typedef {{ typ: string, pflicht?: boolean, werte?: string[], min?: number, max?: number }} KopfDef
 * @typedef {{ in: string[], kennung: 'pflicht' | 'optional' | 'keine' | 'mehrere', muster?: RegExp,
 *   kopf?: Record<string, KopfDef>, felder?: string[], pflichtFelder?: string[] }} ArtDef
 */

const ZITAT_ORTE = ['schritt', 'ebene', '@theorie', 'abschnitt', 'karte', 'einwand', '@station', 'resuemee', 'welt', 'wissenscheck'];
const TEXT_ORTE = ['schritt', 'ebene', '@theorie', 'abschnitt', 'resuemee'];

/** @type {Record<string, ArtDef>} */
const ARTEN = {
  // Story: Rückgrat
  schritt: {
    in: ['@station'], kennung: 'pflicht',
    kopf: {
      art: { typ: 'wahl', werte: SCHRITT_ARTEN }, titel: { typ: 'text', pflicht: true }, kurz: { typ: 'text' },
      gruppe: { typ: 'text' }, uhr: { typ: 'text' }, knopf: { typ: 'text' }, folgt: { typ: 'liste' },
    },
    felder: ['text', 'weltA', 'weltB'],
  },
  ebenen: { in: ['@station', '@theorie', 'abschnitt'], kennung: 'keine', felder: [] },
  ebene: { in: ['ebenen'], kennung: 'pflicht', muster: /^[1-4]$/u, kopf: { titel: { typ: 'text' } }, felder: ['text'] },
  standpunkt: { in: ['@station'], kennung: 'pflicht', kopf: { figur: { typ: 'kennung', pflicht: true } }, felder: ['text'], pflichtFelder: ['text'] },
  // Express-Karte „Was dazwischen geschah“ (P5.9, L-43): nur für Leser auf dem Express-Pfad, über dem ersten Schritt
  express: { in: ['@station'], kennung: 'keine', felder: ['text'], pflichtFelder: ['text'] },
  // Nachweis einer Welt-B-Station (P7.3, E2): die Kette Mandat → Freigabe → Entscheidungs-ID → Datenstand → Nachweis → Beschlusslage (Kap. 9)
  nachweis: {
    in: ['@station'], kennung: 'keine',
    kopf: {
      mandat: { typ: 'text', pflicht: true }, freigabe: { typ: 'text', pflicht: true }, kennung: { typ: 'text', pflicht: true },
      datenstand: { typ: 'text', pflicht: true }, nachweis: { typ: 'text', pflicht: true }, beschlusslage: { typ: 'text', pflicht: true },
    },
    felder: ['text'],
  },
  // Nachweiskette zum Anfassen (E2): zeigt die Nachweise der besuchten Welt-B-Stationen, Klick legt die Kette aus
  nachweiskette: { in: ['schritt'], kennung: 'keine', felder: ['text'] },
  // Epilog (P7.6): A-Spur gegen B-Spur; persönliches Resümee (Themen und Vertiefungen aus der Spur, Prinzipien und Checkliste als Kinder)
  spurvergleich: { in: ['schritt'], kennung: 'keine', felder: ['text'] },
  resuemee: { in: ['schritt'], kennung: 'keine', felder: ['text'] },
  // Vertiefung je Interesse (P3.9, O-19): Zusatzkarte im Ebenen-Schritt, nur für Leser mit diesem Interesse
  vertiefung: { in: ['@station'], kennung: 'pflicht', kopf: { titel: { typ: 'text', pflicht: true } }, felder: ['text'], pflichtFelder: ['text'] },
  regie: { in: ['@station', '@szene', '@theorie'], kennung: 'keine', felder: ['notiz', 'leitfragen'] },
  // Bausteine in Schritten
  mail: { in: ['schritt'], kennung: 'keine', kopf: { von: { typ: 'kennung', pflicht: true }, betreff: { typ: 'text', pflicht: true }, zeit: { typ: 'text' }, anhang: { typ: 'text' } }, felder: ['text'], pflichtFelder: ['text'] },
  chat: { in: ['schritt'], kennung: 'keine', kopf: { von: { typ: 'kennung', pflicht: true }, zeit: { typ: 'text' } }, felder: ['text'], pflichtFelder: ['text'] },
  anruf: { in: ['schritt'], kennung: 'keine', kopf: { von: { typ: 'kennung', pflicht: true }, zeit: { typ: 'text' } }, felder: ['text'] },
  notiz: { in: ['schritt'], kennung: 'keine', kopf: { farbe: { typ: 'wahl', werte: ['gelb', 'rosa', 'lila', 'limette'] }, symbol: { typ: 'text' } }, felder: ['text'], pflichtFelder: ['text'] },
  // Requisiten der Welt A (P3.1): Protokoll (Blatt mit Punkten) und Aktenstapel (Ordner mit Beschriftung)
  protokoll: { in: ['schritt'], kennung: 'keine', kopf: { titel: { typ: 'text', pflicht: true }, datum: { typ: 'text' }, von: { typ: 'kennung' } }, felder: ['text'], pflichtFelder: ['text'] },
  akten: { in: ['schritt'], kennung: 'keine', kopf: { beschriftung: { typ: 'text', pflicht: true }, anzahl: { typ: 'zahl', min: 1, max: 12 } }, felder: ['text'] },
  datei: { in: ['schritt'], kennung: 'keine', kopf: { name: { typ: 'text', pflicht: true }, quelle: { typ: 'text' }, wert: { typ: 'text' } }, felder: ['text'] },
  bekannt: { in: ['schritt'], kennung: 'keine', felder: ['text'], pflichtFelder: ['text'] },
  unbekannt: { in: ['schritt'], kennung: 'keine', felder: ['text'], pflichtFelder: ['text'] },
  zeitsprung: {
    in: ['schritt'], kennung: 'pflicht',
    kopf: { knopf: { typ: 'text', pflicht: true }, kosten: { typ: 'text' }, dauer: { typ: 'text' }, status: { typ: 'status' }, loest: { typ: 'karte' }, bleibt: { typ: 'karte' } },
    felder: ['text', 'neuBekannt'],
  },
  grafik: { in: ['schritt'], kennung: 'pflicht', kopf: { titel: { typ: 'text' }, untertitel: { typ: 'text' } }, felder: ['text'] },
  kette: { in: ['schritt'], kennung: 'keine', felder: [] },
  // Glossarseite (P6.14): alle Begriffe aus whitepaper.json, durchsuchbar, mit „Kommt vor in“
  glossar: { in: ['@theorie'], kennung: 'keine', felder: ['text'] },
  // RACI mit Mandat (P5.1, Kap. 9.2), Zuordnungen des fiktiven Falls
  raci: { in: ['schritt', '@theorie', 'abschnitt', 'ebene'], kennung: 'keine', kopf: { zeilen: { typ: 'raci', pflicht: true } }, felder: ['text'] },
  // Whitepaper-Tabelle als Grafik (P4, L-32): Zellen wörtlich aus whitepaper.json, Form aus src/grafik/tafel.ts
  tafel: { in: ['schritt', '@theorie', 'abschnitt', 'ebene', 'resuemee'], kennung: 'pflicht', muster: /^k\d+(?:\.\d+)*-t\d+$/u, kopf: { form: { typ: 'wahl', werte: TAFEL_FORMEN, pflicht: true }, erlebt: { typ: 'karte' }, hervor: { typ: 'liste' } }, felder: ['text'] },
  glied: { in: ['kette'], kennung: 'optional', kopf: { art: { typ: 'wahl', werte: GLIED_ARTEN, pflicht: true }, von: { typ: 'kennung' } }, felder: ['titel', 'text'] },
  datenstand: {
    in: ['schritt'], kennung: 'keine',
    kopf: { name: { typ: 'text', pflicht: true }, abweichung: { typ: 'text' }, betrag: { typ: 'text' }, basis: { typ: 'text' }, versionen: { typ: 'versionen' } },
    felder: ['text', 'vergleich'],
  },
  mandatsleiter: { in: ['schritt'], kennung: 'keine', kopf: { betrag: { typ: 'text' }, 'betrag-teur': { typ: 'zahl', min: 0 }, stufen: { typ: 'stufen', pflicht: true } }, felder: ['text'] },
  mandatsoption: { in: ['schritt'], kennung: 'pflicht', muster: /^\d+$/u, kopf: { titel: { typ: 'text', pflicht: true }, detail: { typ: 'text' }, zustaendig: { typ: 'text', pflicht: true }, stufe: { typ: 'zahl', min: 1 } }, felder: ['text'], pflichtFelder: ['text'] },
  // Kennung optional (L-40): Freigaben führen kein Kürzel („Freigabe LPH 5“)
  vorlage: { in: ['schritt'], kennung: 'optional', kopf: { titel: { typ: 'text' }, datenstand: { typ: 'text' } }, felder: ['frage', 'checkliste'], pflichtFelder: ['frage', 'checkliste'] },
  // Governance-Fluss als Übersicht auf einer Lernseite (P11, Kap. 6.4.3): alle Stationen, ohne Markierung
  governancefluss: { in: ['@theorie', 'abschnitt'], kennung: 'keine', felder: ['text'] },
  fluss: { in: ['schritt'], kennung: 'keine', kopf: { position: { typ: 'wahl', werte: FLUSS, pflicht: true } }, felder: ['text'] },
  paar: {
    in: ['schritt'], kennung: 'keine',
    kopf: { a: { typ: 'wahl', werte: ['mail', 'chat', 'notiz', 'datei'], pflicht: true }, von: { typ: 'kennung' }, farbe: { typ: 'wahl', werte: ['gelb', 'rosa', 'lila', 'limette'] }, b: { typ: 'text' }, kennung: { typ: 'text' }, fluss: { typ: 'wahl', werte: FLUSS } },
    felder: ['weltA', 'weltB'], pflichtFelder: ['weltA'],
  },
  kennzahl: { in: ['schritt'], kennung: 'keine', kopf: { a: { typ: 'zahl', pflicht: true, min: 0 }, b: { typ: 'zahl', pflicht: true, min: 0 } }, felder: ['text'], pflichtFelder: ['text'] },
  interesse: { in: ['schritt'], kennung: 'pflicht', kopf: { titel: { typ: 'text', pflicht: true } }, felder: ['text'] },
  merksatz: { in: TEXT_ORTE, kennung: 'keine', felder: ['text'], pflichtFelder: ['text'] },
  hinweis: { in: TEXT_ORTE, kennung: 'keine', felder: ['text'], pflichtFelder: ['text'] },
  zitat: { in: ZITAT_ORTE, kennung: 'mehrere', felder: ['text'], pflichtFelder: ['text'] },
  original: { in: ZITAT_ORTE, kennung: 'mehrere', felder: [] },
  // Rollenszene
  option: {
    in: ['@szene'], kennung: 'pflicht', muster: /^[A-F]$/u,
    kopf: { titel: { typ: 'text', pflicht: true }, kurz: { typ: 'text', pflicht: true }, symbol: { typ: 'text' }, status: { typ: 'status', pflicht: true } },
    felder: ['konsequenz', 'wasFehlt', 'neuesRisiko', 'governanceFrage'],
    pflichtFelder: ['konsequenz', 'wasFehlt', 'neuesRisiko', 'governanceFrage'],
  },
  nachsatz: { in: ['@szene'], kennung: 'keine', felder: ['text'], pflichtFelder: ['text'] },
  frage: { in: ['@szene'], kennung: 'pflicht', kopf: { schritt: { typ: 'kennung' } }, felder: ['frage', 'rueckmeldung'], pflichtFelder: ['frage'] },
  // Wissenscheck auf einer Lernseite (P11.6): Frage mit Antworten und Erklärung statt Punkten, Beleg als zitat
  wissenscheck: { in: ['@theorie', 'abschnitt'], kennung: 'pflicht', felder: ['frage', 'erklaerung'], pflichtFelder: ['frage', 'erklaerung'] },
  antwort: { in: ['frage', 'wissenscheck'], kennung: 'pflicht', kopf: { titel: { typ: 'text', pflicht: true }, praefix: { typ: 'text' }, symbol: { typ: 'text' } }, felder: ['text'] },
  rueckbezug: { in: ['@szene'], kennung: 'pflicht', muster: /^(?:[A-F]|ohne)$/u, felder: ['text'], pflichtFelder: ['text'] },
  // Fall
  figur: {
    in: ['@fall'], kennung: 'pflicht',
    kopf: { name: { typ: 'text', pflicht: true }, rolle: { typ: 'kennung' }, funktion: { typ: 'text', pflicht: true }, farbe: { typ: 'farbe', pflicht: true }, spieler: { typ: 'bool' } },
    felder: ['kurzbeschreibung', 'stimme'], pflichtFelder: ['kurzbeschreibung'],
  },
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
  querverweis: { in: ['@theorie', 'abschnitt', 'ebene'], kennung: 'pflicht', kopf: { text: { typ: 'text' } }, felder: ['text'] },
  // Abbildung aus der DOCX V1.2 auf der Lernseite (P14, O-32): Beschreibung in inhalte/abbildungen/abb-N.yaml
  abbildung: { in: ['@theorie', 'abschnitt'], kennung: 'pflicht', muster: /^abb-\d+$/u, felder: [] },
  // Einwände
  // Vorher/Nachher-Welten (P8.2): je Aspekt Welt A und Welt B nebeneinander, mit Beleg aus dem Whitepaper
  welt: { in: ['@welten'], kennung: 'pflicht', kopf: { titel: { typ: 'text', pflicht: true }, stationen: { typ: 'liste' } }, felder: ['weltA', 'weltB'], pflichtFelder: ['weltA', 'weltB'] },
  // Begriffs-Kompass (P10.5, E7): Whitepaper-Begriff ↔ gängige andere Wörter, mit Beleg
  kompass: { in: ['@kompass'], kennung: 'pflicht', kopf: { begriff: { typ: 'text', pflicht: true }, andere: { typ: 'liste', pflicht: true }, beleg: { typ: 'text', pflicht: true } }, felder: ['hinweis'] },
  einwand: { in: ['@einwaende'], kennung: 'pflicht', kopf: { stationen: { typ: 'liste' }, kapitel: { typ: 'liste' } }, felder: ['einwand', 'antwort'], pflichtFelder: ['einwand', 'antwort'] },
};

/** Kopfdaten und Felder der Dateien selbst (oberste Ebene). */
const DATEI_ARTEN = {
  '@fall': {
    kopf: {
      stadt: { typ: 'text', pflicht: true }, bauherr: { typ: 'text', pflicht: true }, vertretung: { typ: 'text', pflicht: true },
      'vertretung-kurz': { typ: 'text' }, projekt: { typ: 'text', pflicht: true }, bauteile: { typ: 'liste' }, bauweise: { typ: 'text' },
      projektbasis: { typ: 'text', pflicht: true }, 'projektbasis-mio': { typ: 'dezimal' }, gremien: { typ: 'liste' }, hinweis: { typ: 'text', pflicht: true },
      'monat-0': { typ: 'text' }, 'lph-stand': { typ: 'karte' },
    },
    felder: ['text'],
  },
  '@rolle': {
    kopf: {
      id: { typ: 'kennung' }, titel: { typ: 'text', pflicht: true }, kurztitel: { typ: 'text' }, farbe: { typ: 'farbe', pflicht: true },
      textfarbe: { typ: 'farbe' }, figur: { typ: 'kennung' }, 'whitepaper-bezug': { typ: 'ids' },
    },
    felder: ['text', 'linse', 'delegierbar', 'nichtDelegierbar'],
    pflichtFelder: ['linse'],
  },
  '@station': {
    kopf: {
      id: { typ: 'kennung', pflicht: true }, art: { typ: 'wahl', werte: STATION_ARTEN }, welt: { typ: 'wahl', werte: ['A', 'B'] },
      monat: { typ: 'zahl', min: 0, max: 12 }, titel: { typ: 'text', pflicht: true }, kurztitel: { typ: 'text' }, lph: { typ: 'zahl', min: 0, max: 9 },
      uhr: { typ: 'text' }, 'whitepaper-bezug': { typ: 'ids' }, 'status-start': { typ: 'status' }, weiter: { typ: 'kanten' },
      ende: { typ: 'bool' }, 'schaltet-frei': { typ: 'liste' }, partner: { typ: 'kennung' }, vergleich: { typ: 'paar' },
      // Enden (P7.7): Kapitel, das das Resümee als erste Vertiefung nennt
      vertiefung: { typ: 'zahl', min: 1, max: 13 },
    },
    felder: ['text'],
  },
  '@szene': {
    kopf: { station: { typ: 'kennung', pflicht: true }, rolle: { typ: 'kennung', pflicht: true }, frage: { typ: 'text' }, entscheidung: { typ: 'text' }, 'rueckbezug-auf': { typ: 'text' } },
    felder: ['text'],
  },
  '@theorie': {
    kopf: {
      kapitel: { typ: 'zahl', pflicht: true, min: 1, max: 13 }, titel: { typ: 'text', pflicht: true }, kurztitel: { typ: 'text' },
      story: { typ: 'liste' }, deckt: { typ: 'liste' },
    },
    felder: ['text'],
  },
  '@einwaende': { kopf: {}, felder: ['text'] },
  '@welten': { kopf: {}, felder: ['text'] },
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

/** Abschnittsnummer aus einer Absatz-ID („k2.4-p2“ → „2.4“). @param {string} id */
function abschnittAusId(id) {
  const m = /^k(\d+(?:\.\d+)*)/u.exec(id);
  return m?.[1] ?? '?';
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
    /** @type {{ art: string, wert: string, ort: string }[]} */ this.verweise = [];
    /** Absatz-IDs, die Theorie-Seiten abdecken */
    /** @type {Map<string, Set<string>>} */ this.theorieDeckt = new Map();
    this.glossarFehltGemeldet = false;
    /** Abbildungen, die ein Originaltext einer Lernseite schon einsetzt (P14) @type {Set<string>} */ this.abbImOriginal = new Set();
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
   * Markdown → HTML; `[[Begriff]]`, `[[Begriff|Text]]`, `[[zitat:ID|Text]]` werden markierte Spannen.
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
    return text.replace(/\[\[([^\[\]\n]+?)\]\]/gu, (_, innen) => {
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

  /** Quellenangabe „Whitepaper V1.2, Kap. 2.4“. @param {string[]} ids */
  quellenangabe(ids) {
    const fassung = this.quelle?.fassung ?? 'V1.2';
    const abschnitte = [...new Set(ids.map((id) => this.quelle?.nachId.get(id)?.abschnitt ?? abschnittAusId(id)))];
    return `MVG ${fassung}, Kap. ${abschnitte.join(', ')}`;
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
    let pos = 0;
    for (const s of stuecke) {
      const i = original.indexOf(s, pos);
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

  /** Originaltext eines Blocks als HTML. @param {FlacherBlock} bl */
  /**
   * Originaltext in der Gliederung des Whitepapers (O-20): vor den ersten Absatz eines Unterabschnitts
   * kommt dessen Überschrift „1.1 Leitthese“ (die Kapitelüberschrift trägt die Seite selbst).
   * @param {string[]} ids
   */
  originalMitGliederung(ids, mitAbbildungen = false) {
    /** @type {string[]} */
    const teile = [];
    let abschnitt = '';
    // Nur wenn der Auszug mehrere Abschnitte umfasst; sonst nennt die Quellenangabe den Abschnitt schon.
    const mehrere = new Set(ids.map((id) => this.quelle?.nachId.get(id)?.abschnitt)).size > 1;
    // Abbildungen (P14, O-32) stehen, wo sie in der DOCX stehen: nach der Kapitel- oder Abschnittsüberschrift
    // (Ort „k3“, „k3.3“) bzw. nach einem Absatz (Ort „k7.1-p1“). Die Oberfläche setzt das Bild ein.
    /** @type {Map<string, string[]>} */
    const abbNach = new Map();
    if (mitAbbildungen) for (const a of this.quelle?.abbildungen ?? []) abbNach.set(a.ort, [...(abbNach.get(a.ort) ?? []), a.id]);
    /** @type {Set<string>} */
    const betreten = new Set();
    const abbildungen = (/** @type {string} */ ort) => {
      for (const id of abbNach.get(ort) ?? []) {
        teile.push(`<figure class="mvg-abbildung" data-abbildung="${esc(id)}"></figure>`);
        this.abbImOriginal.add(id);
      }
    };
    for (const id of ids) {
      const bl = /** @type {FlacherBlock} */ (this.quelle?.nachId.get(id));
      if (bl.abschnitt !== abschnitt) {
        abschnitt = bl.abschnitt;
        // übergeordnete Anfänge (Kapitel „6“, Abschnitt „6.4“ vor „6.4.1“) zuerst
        const stufen = abschnitt.split('.').map((_, i, a) => a.slice(0, i + 1).join('.'));
        for (const p of stufen.slice(0, -1)) if (!betreten.has(p)) { betreten.add(p); abbildungen(`k${p}`); }
        if (mehrere && abschnitt.includes('.')) teile.push(`<h4 class="mvg-original-titel" data-abschnitt="k${esc(abschnitt)}">${esc(`${abschnitt} ${bl.abschnittTitel}`)}</h4>`);
        if (!betreten.has(abschnitt)) { betreten.add(abschnitt); abbildungen(`k${abschnitt}`); }
      }
      teile.push(this.originalHtml(bl));
      abbildungen(bl.id);
    }
    return teile.join('\n');
  }

  originalHtml(bl) {
    const a = `data-absatz="${esc(bl.id)}"`;
    switch (bl.art) {
      case 'fett': return `<p class="mvg-original fett" ${a}><strong>${esc(bl.text)}</strong></p>`;
      case 'liste': return `<ul class="mvg-original" ${a}>${(bl.punkte ?? bl.text.split('\n')).map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`;
      case 'tabelle': {
        const kopf = (bl.kopf ?? []).map((z) => `<th>${esc(z)}</th>`).join('');
        const zeilen = (bl.zeilen ?? []).map((r) => `<tr>${r.map((z) => `<td>${esc(z)}</td>`).join('')}</tr>`).join('');
        return `<table class="mvg-original" ${a}>${kopf ? `<thead><tr>${kopf}</tr></thead>` : ''}<tbody>${zeilen}</tbody></table>`;
      }
      case 'kasten': return `<div class="mvg-original kasten" ${a}>${bl.text.split('\n').map((p) => `<p>${esc(p)}</p>`).join('')}</div>`;
      default: return `<p class="mvg-original" ${a}>${esc(bl.text)}</p>`;
    }
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
      case 'status': {
        if (t === 'keine') return [];
        if (typeof wert !== 'object' || wert === null || Array.isArray(wert)) { this.fehler(ort, `„${k}“ muss Statuswerte enthalten (oder „keine“)`); return undefined; }
        const aus = [];
        for (const [a, v] of Object.entries(wert)) {
          if (typeof v !== 'string') { this.fehler(ort, `„${k}.${a}“ muss ein Wert sein`); continue; }
          const e = leseWirkEintrag(a, v);
          if (e.ok) aus.push(e.wert); else this.fehler(ort, `„${k}“: ${e.fehler}`);
        }
        return aus;
      }
      case 'kanten': {
        const liste = Array.isArray(wert) ? wert : [wert];
        const aus = [];
        for (const x of liste) {
          if (typeof x === 'string') { aus.push({ ziel: x.trim(), wenn: null }); continue; }
          if (typeof x !== 'object' || x === null || Array.isArray(x)) { this.fehler(ort, `„${k}“: Kante unlesbar`); continue; }
          const o = /** @type {Record<string, unknown>} */ (x);
          for (const s of Object.keys(o)) if (!['ziel', 'wenn', 'wenn-eine'].includes(s)) this.fehler(ort, `„${k}“: unbekannter Schlüssel „${s}“ (ziel, wenn, wenn-eine)`);
          const ziel = text(o['ziel']);
          if (ziel === null || !KENNUNG.test(ziel)) { this.fehler(ort, `„${k}“: Kante ohne gültiges „ziel“`); continue; }
          /** @type {any} */
          let wenn = null;
          for (const [schluessel, art] of /** @type {const} */ ([['wenn', 'alle'], ['wenn-eine', 'eine']])) {
            const w = o[schluessel];
            if (w === undefined || w === '') continue;
            const texte = (Array.isArray(w) ? w : [w]).map(String);
            const e = leseBedingungen(texte, art);
            if (!e.ok) { this.fehler(ort, e.fehler); continue; }
            wenn = wenn === null ? e.wert : { art: 'alle', bedingungen: [wenn, e.wert], nicht: false };
          }
          if (wenn !== null) {
            const v = verweiseIn(wenn);
            for (const s of v.stationen) this.verweise.push({ art: 'station', wert: s, ort });
            for (const s of v.entscheidungen) this.verweise.push({ art: 'entscheidung', wert: s, ort });
            for (const s of v.rollen) this.verweise.push({ art: 'rolle', wert: s, ort });
            for (const s of v.interessen) this.verweise.push({ art: 'interesse', wert: s, ort });
            for (const s of v.infos) this.verweise.push({ art: 'info', wert: s, ort });
            for (const s of v.fragen) this.verweise.push({ art: 'frage', wert: s, ort });
          }
          aus.push({ ziel, wenn });
        }
        return aus;
      }
      case 'paar': {
        if (typeof wert !== 'object' || wert === null || Array.isArray(wert)) { this.fehler(ort, `„${k}“ muss {a: …, b: …} sein`); return undefined; }
        const o = /** @type {Record<string, unknown>} */ (wert);
        const a = text(o['a']);
        const bb = text(o['b']);
        if (a === null || bb === null || !KENNUNG.test(a) || !KENNUNG.test(bb)) { this.fehler(ort, `„${k}“ braucht a und b (Station-IDs)`); return undefined; }
        return { a, b: bb };
      }
      case 'stufen': {
        if (!Array.isArray(wert)) { this.fehler(ort, `„${k}“ muss eine Liste sein`); return undefined; }
        const aus = [];
        for (const x of wert) {
          if (typeof x !== 'object' || x === null || Array.isArray(x)) { this.fehler(ort, `„${k}“: Stufe unlesbar`); continue; }
          aus.push(this.kopf(/** @type {Record<string, unknown>} */ (x), {
            wer: { typ: 'text', pflicht: true }, bereich: { typ: 'text', pflicht: true }, 'bis-teur': { typ: 'zahl', min: 0 }, hinweis: { typ: 'text' },
          }, `${ort} (${k})`));
        }
        return aus;
      }
      case 'raci': {
        // RACI mit Mandat (P5.1, Kap. 9.2): je Zeile genau eine Rolle „A“, jede Rolle höchstens ein Buchstabe
        if (!Array.isArray(wert)) { this.fehler(ort, `„${k}“ muss eine Liste sein`); return undefined; }
        const aus = [];
        for (const x of wert) {
          if (typeof x !== 'object' || x === null || Array.isArray(x)) { this.fehler(ort, `„${k}“: Zeile unlesbar`); continue; }
          const z = this.kopf(/** @type {Record<string, unknown>} */ (x), {
            id: { typ: 'kennung', pflicht: true }, titel: { typ: 'text', pflicht: true }, R: { typ: 'liste' }, A: { typ: 'kennung', pflicht: true }, C: { typ: 'liste' }, I: { typ: 'liste' }, mandat: { typ: 'text', pflicht: true },
          }, `${ort} (${k})`);
          /** @type {Record<string, string>} */
          const zuordnung = {};
          for (const b of ['A', 'R', 'C', 'I']) {
            // this.kopf() legt Schlüssel in camelCase ab („A“ → „a“)
            const w = z[b.toLowerCase()];
            const rollen = b === 'A' ? (w ? [w] : []) : (w ?? []);
            for (const r of rollen) {
              if (!ROLLEN.includes(r)) this.fehler(`${ort} (${k})`, `RACI „${z.id}“: Rolle „${r}“ gibt es nicht`);
              if (zuordnung[r] !== undefined) this.fehler(`${ort} (${k})`, `RACI „${z.id}“: Rolle „${r}“ hat zwei Buchstaben`);
              zuordnung[r] = b;
            }
          }
          aus.push({ id: z.id ?? '', titel: z.titel ?? '', zuordnung, mandat: z.mandat ?? '' });
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
      if ((r.art === 'bekannt' || r.art === 'unbekannt') && name === 'text') {
        liste = this.liste(f.text, ortF, { ids: r.art === 'unbekannt', haken: false });
        continue;
      }
      if (r.art === 'vorlage' && name === 'checkliste') {
        liste = this.liste(f.text, ortF, { ids: false, haken: true });
        continue;
      }
      if (r.art === 'glied' && name === 'titel') { felder[name] = this.inline(f.text, ortF); continue; }
      felder[name] = this.html(f.text, ortF);
    }
    if (r.art === 'zitat') {
      const text = r.rohFelder['text']?.text ?? '';
      const erg = this.pruefeZitat(r.kennungen, text, r.ort);
      kopf['quelle'] = this.quellenangabe(r.kennungen);
      kopf['vollstaendig'] = erg.vollstaendig;
      const absaetze = r.kennungen.join(' ');
      const innen = this.html(text, r.ort);
      felder['text'] = `<blockquote class="mvg-zitat" data-absatz="${esc(absaetze)}">${innen}</blockquote>`;
      this.merkeDeckung(eltern, r.kennungen, rel);
    }
    if (r.art === 'original') {
      const ids = r.kennungen.flatMap((ref) => this.expandiere(ref, r.ort));
      kopf['absaetze'] = ids;
      kopf['quelle'] = this.quellenangabe(ids.length > 0 ? ids : r.kennungen);
      if (this.quelle === null) {
        felder['text'] = '';
        this.warnung(r.ort, 'Originaltext nicht eingesetzt: whitepaper.json fehlt');
      } else {
        // Abbildungen nur im Originaltext einer Lernseite (ganzes Kapitel), an ihrer Stelle in der DOCX
        felder['text'] = this.originalMitGliederung(ids, eltern === '@theorie');
      }
      this.merkeDeckung(eltern, ids, rel);
    }
    if (r.art === 'tafel' && r.id !== null) {
      const t = this.quelle?.nachId.get(r.id);
      if (this.quelle !== null && (t === undefined || t.art !== 'tabelle')) this.fehler(r.ort, `Tafel: „${r.id}“ ist keine Tabelle im Whitepaper`);
      kopf['quelle'] = this.quellenangabe([r.id]);
      kopf['tabelle'] = { kopf: t?.kopf ?? [], zeilen: t?.zeilen ?? [] };
      /** @type {Record<string, string[]>} */
      const erlebt = {};
      for (const [nr, liste] of Object.entries(kopf['erlebt'] ?? {})) {
        const n = Number(nr);
        if (!Number.isInteger(n) || n < 1 || n > (t?.zeilen?.length ?? 0)) this.fehler(r.ort, `Tafel ${r.id}: „erlebt.${nr}“ – die Tabelle hat ${t?.zeilen?.length ?? 0} Zeilen`);
        erlebt[nr] = String(liste).split(',').map((x) => x.trim()).filter(Boolean);
        for (const st of erlebt[nr]) this.verweise.push({ art: 'station', wert: st, ort: r.ort });
      }
      kopf['erlebt'] = erlebt;
      const hervor = (kopf['hervor'] ?? []).map(Number);
      for (const n of hervor) if (!Number.isInteger(n) || n < 1 || n > (t?.zeilen?.length ?? 0)) this.fehler(r.ort, `Tafel ${r.id}: „hervor: ${n}“ – die Tabelle hat ${t?.zeilen?.length ?? 0} Zeilen`);
      kopf['hervor'] = hervor;
      if (kopf['form'] === 'schwelle' && (t?.kopf?.length ?? 0) !== 2) this.fehler(r.ort, `Tafel ${r.id}: Form „schwelle“ braucht eine Tabelle mit zwei Spalten`);
      if (kopf['form'] === 'felder' && (t?.kopf?.length ?? 0) < 5) this.fehler(r.ort, `Tafel ${r.id}: Form „felder“ braucht fünf Spalten (Feld, Kern, Vorbereitung, Fehlstelle, Antwort)`);
      if (kopf['form'] === 'ketten' && (t?.kopf?.length ?? 0) < 4) this.fehler(r.ort, `Tafel ${r.id}: Form „ketten“ braucht vier Spalten`);
      this.merkeDeckung(eltern, [r.id], rel);
    }
    const kinder = k.kinder.map((kind) => this.block(kind, r.art, rel)).filter((x) => x !== null);
    // Verweise für die spätere Prüfung
    for (const s of ['von', 'figur']) if (typeof kopf[s] === 'string') this.verweise.push({ art: 'figur', wert: kopf[s], ort: r.ort });
    if (r.art === 'querverweis' && r.id !== null) this.verweise.push({ art: 'station', wert: r.id, ort: r.ort });
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
 * Zeitachse der Fall-Bibel: Monat (0–12) → LPH (0–9).
 * @param {Kompilierer} c @param {string} rel @param {Record<string, string> | undefined} roh
 * @returns {Record<string, number>}
 */
function lphStand(c, rel, roh) {
  /** @type {Record<string, number>} */
  const aus = {};
  for (const [m, l] of Object.entries(roh ?? {})) {
    if (!/^(?:\d|1[0-2])$/u.test(m) || !/^\d$/u.test(l)) { c.fehler(`${rel}:1`, `„lph-stand“: „${m}: ${l}“ – erwartet Monat 0–12 und LPH 0–9`); continue; }
    aus[m] = Number(l);
  }
  return aus;
}

function baueFall(c, rel, text) {
  const { kopf, wurzel, rohFelder } = leseDateiKopf(c, rel, '@fall', text);
  /** @type {Record<string, any>} */
  const figuren = {};
  for (const k of wurzel.kinder) {
    const bl = c.block(k, '@fall', rel);
    if (bl === null || bl.art !== 'figur') continue;
    if (bl.id === null) continue;
    if (figuren[bl.id] !== undefined) c.fehler(`${rel}:${k.zeile}`, `Figur „${bl.id}“ doppelt`);
    figuren[bl.id] = {
      id: bl.id,
      name: bl.kopf.name ?? '',
      rolle: bl.kopf.rolle ?? null,
      funktion: bl.kopf.funktion ?? '',
      farbe: bl.kopf.farbe ?? '#000000',
      spieler: bl.kopf.spieler ?? false,
      felder: bl.felder,
    };
    if (bl.kopf.rolle) c.verweise.push({ art: 'rolle', wert: bl.kopf.rolle, ort: `${rel}:${k.zeile}` });
  }
  return {
    hinweis: kopf.hinweis ?? '',
    stadt: kopf.stadt ?? '',
    bauherr: kopf.bauherr ?? '',
    vertretung: kopf.vertretung ?? '',
    vertretungKurz: kopf.vertretungKurz ?? null,
    projekt: kopf.projekt ?? '',
    bauteile: kopf.bauteile ?? [],
    bauweise: kopf.bauweise ?? null,
    projektbasis: kopf.projektbasis ?? '',
    projektbasisMio: kopf.projektbasisMio ?? null,
    gremien: kopf.gremien ?? [],
    monat0: kopf.monat0 ?? null,
    lphStand: lphStand(c, rel, kopf.lphStand),
    einleitung: c.html(rohFelder['text']?.text ?? '', `${rel}:1`),
    figuren,
  };
}

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
 * @param {string} rel
 * @param {string} id
 * @param {string} text
 */
function baueRolle(c, rel, id, text) {
  const { kopf, wurzel, rohFelder } = leseDateiKopf(c, rel, '@rolle', text);
  if (kopf.id !== undefined && kopf.id !== id) c.fehler(`${rel}:1`, `id „${kopf.id}“ passt nicht zum Dateinamen „${id}“`);
  for (const k of wurzel.kinder) c.fehler(`${rel}:${k.zeile}`, `Container „${k.art}“ ist in Rollendateien nicht erlaubt`);
  if (kopf.figur) c.verweise.push({ art: 'figur', wert: kopf.figur, ort: `${rel}:1` });
  /** @type {Record<string, string>} */
  const felder = {};
  for (const [name, f] of Object.entries(rohFelder)) felder[name] = c.html(f.text, `${rel}:${f.zeile}`);
  return {
    id,
    spielbar: true,
    titel: kopf.titel ?? id,
    kurztitel: kopf.kurztitel ?? kopf.titel ?? id,
    farbe: kopf.farbe ?? '#000000',
    textfarbe: kopf.textfarbe ?? null,
    figur: kopf.figur ?? null,
    whitepaper: kopf.whitepaperBezug ?? [],
    felder,
    quelle: rel,
  };
}

/**
 * @param {Kompilierer} c
 * @param {string} rel
 * @param {string} ordner
 * @param {string} text
 * @param {Record<string, any>} regie
 */
function baueStation(c, rel, ordner, text, regie) {
  const { kopf, wurzel, rohFelder } = leseDateiKopf(c, rel, '@station', text);
  const ort = `${rel}:1`;
  if (kopf.id !== undefined && kopf.id !== ordner) c.fehler(ort, `id „${kopf.id}“ passt nicht zum Ordner „${ordner}“`);
  const art = kopf.art ?? 'station';
  if (kopf.statusStart !== undefined && !istVollstaendigerStart(kopf.statusStart)) {
    c.fehler(ort, '„status-start“ muss alle fünf Werte setzen (entscheidungsfaehigkeit, kostenunsicherheit, offene-risiken, ungeklaerte-entscheidungen, terminrisiko)');
  }
  if (art === 'vergleich' && kopf.vergleich === undefined) c.fehler(ort, 'Vergleichsstation ohne „vergleich: {a: …, b: …}“');
  if (!kopf.ende && (kopf.weiter ?? []).length === 0) c.fehler(ort, 'weder „weiter“ noch „ende: ja“');
  /** @type {('weltB' | 'explore')[]} */
  const schaltetFrei = [];
  for (const s of kopf.schaltetFrei ?? []) {
    if (s === 'welt-b' || s === 'weltB') schaltetFrei.push('weltB');
    else if (s === 'explore') schaltetFrei.push('explore');
    else c.fehler(ort, `„schaltet-frei“: „${s}“ unbekannt (welt-b, explore)`);
  }

  const schritte = [];
  const infos = [];
  /** @type {any[] | null} */
  let ebenen = null;
  const standpunkte = [];
  const vertiefungen = [];
  /** @type {string | null} */
  let express = null;
  /** @type {Record<string, string> | null} */
  let nachweis = null;
  /** @type {Set<string>} */
  const schrittIds = new Set();
  for (const k of wurzel.kinder) {
    if (k.art === 'regie') {
      const r = c.lies(k, '@station', rel);
      if (r !== null) regie[ordner] = baueRegie(c, r.rohFelder, rel);
      continue;
    }
    if (k.art === 'ebenen') {
      if (ebenen !== null) c.fehler(`${rel}:${k.zeile}`, '„ebenen“ doppelt');
      ebenen = baueEbenen(c, k, '@station', rel);
      continue;
    }
    const bl = c.block(k, '@station', rel);
    if (bl === null) continue;
    if (bl.art === 'standpunkt') {
      standpunkte.push({ rolle: bl.id ?? '', figur: bl.kopf.figur ?? '', html: bl.felder.text ?? '' });
      if (bl.id) c.verweise.push({ art: 'rolle', wert: bl.id, ort: `${rel}:${k.zeile}` });
      continue;
    }
    if (bl.art === 'express') {
      if (express !== null) c.fehler(`${rel}:${k.zeile}`, '„express“ doppelt');
      express = bl.felder.text ?? '';
      continue;
    }
    if (bl.art === 'nachweis') {
      if (nachweis !== null) c.fehler(`${rel}:${k.zeile}`, '„nachweis“ doppelt');
      if (kopf.welt !== 'B') c.fehler(`${rel}:${k.zeile}`, '„nachweis“ nur an Stationen der Welt B (E2)');
      nachweis = {
        mandat: String(bl.kopf.mandat ?? ''), freigabe: String(bl.kopf.freigabe ?? ''), kennung: String(bl.kopf.kennung ?? ''),
        datenstand: String(bl.kopf.datenstand ?? ''), nachweis: String(bl.kopf.nachweis ?? ''), beschlusslage: String(bl.kopf.beschlusslage ?? ''),
        text: bl.felder.text ?? '',
      };
      continue;
    }
    if (bl.art === 'vertiefung') {
      if (vertiefungen.some((v) => v.interesse === bl.id)) c.fehler(`${rel}:${k.zeile}`, `Vertiefung „${bl.id}“ doppelt`);
      if (bl.id === 'express') c.fehler(`${rel}:${k.zeile}`, 'Vertiefung „express“ gibt es nicht (Express ist ein Weg, kein Thema, L-26)');
      const zitate = (bl.felder.text ?? '').split('class="mvg-zitat"').length - 1;
      if (zitate !== 1) c.fehler(`${rel}:${k.zeile}`, `Vertiefung „${bl.id}“: genau ein wortgleiches Zitat erwartet, gefunden ${zitate} (L-31)`);
      vertiefungen.push({ interesse: bl.id ?? '', titel: bl.kopf.titel ?? '', html: bl.felder.text ?? '' });
      if (bl.id) c.verweise.push({ art: 'interesse', wert: bl.id, ort: `${rel}:${k.zeile}` });
      continue;
    }
    if (bl.art !== 'schritt' || bl.id === null) continue;
    if (schrittIds.has(bl.id)) c.fehler(`${rel}:${k.zeile}`, `Schritt „${bl.id}“ doppelt`);
    schrittIds.add(bl.id);
    const schrittArt = bl.kopf.art ?? 'text';
    const { art: _a, titel, kurz, gruppe, uhr, ...restKopf } = bl.kopf;
    void _a;
    schritte.push({
      id: bl.id,
      art: schrittArt,
      titel: titel ?? '',
      kurz: kurz ?? titel ?? '',
      gruppe: gruppe ?? null,
      uhr: uhr ?? null,
      kopf: restKopf,
      felder: bl.felder,
      bloecke: bl.kinder,
    });
    if (schrittArt === 'rollenwahl' && restKopf.folgt === undefined) restKopf.folgt = [];
    if (schrittArt !== 'rollenwahl' && bl.kopf.folgt !== undefined) c.fehler(`${rel}:${k.zeile}`, '„folgt“ gibt es nur im Schritt „rollenwahl“');
    // Zeitsprünge → anforderbare Informationen; Unbekanntes → Kennungen für loest/bleibt
    /** @type {Set<string>} */
    const unbekannt = new Set();
    for (const kind of bl.kinder) if (kind.art === 'unbekannt') for (const p of kind.liste ?? []) if (p.id) unbekannt.add(p.id);
    for (const kind of bl.kinder) {
      if (kind.art !== 'zeitsprung' || kind.id === null) continue;
      if (infos.some((i) => i.id === kind.id)) c.fehler(`${rel}:${k.zeile}`, `Zeitsprung „${kind.id}“ doppelt`);
      infos.push({ id: kind.id, schritt: bl.id, wirkung: kind.kopf.status ?? [] });
      for (const feld of ['loest', 'bleibt']) {
        for (const u of Object.keys(kind.kopf[feld] ?? {})) {
          if (!unbekannt.has(u)) c.fehler(`${rel}:${k.zeile}`, `Zeitsprung ${kind.id}: „${feld}.${u}“ steht nicht in der Liste „unbekannt“ dieses Schritts`);
        }
      }
    }
  }
  for (const s of schritte) {
    if (!SCHRITT_ARTEN.includes(s.art)) continue;
    if (s.art === 'ebenen' && ebenen === null) c.fehler(ort, `Schritt „${s.id}“ zeigt Ebenen, aber die Station hat keine „ebenen“`);
  }
  if (schritte.length === 0) c.fehler(ort, 'Station ohne Schritte');
  if (vertiefungen.length > 0 && !schritte.some((s) => s.art === 'ebenen')) c.fehler(ort, 'Vertiefungen brauchen einen Schritt „ebenen“ (dort erscheinen sie)');

  return {
    id: ordner,
    art,
    welt: kopf.welt ?? null,
    monat: kopf.monat ?? null,
    titel: kopf.titel ?? ordner,
    kurztitel: kopf.kurztitel ?? kopf.titel ?? ordner,
    lph: kopf.lph ?? null,
    uhr: kopf.uhr ?? null,
    whitepaper: kopf.whitepaperBezug ?? [],
    statusStart: kopf.statusStart ?? null,
    weiter: kopf.weiter ?? [],
    ende: kopf.ende ?? false,
    schaltetFrei,
    vergleich: kopf.vergleich ?? null,
    partner: kopf.partner ?? null,
    einleitung: c.html(rohFelder['text']?.text ?? '', ort),
    schritte,
    infos,
    ebenen,
    standpunkte,
    vertiefungen,
    express,
    nachweis,
    vertiefung: kopf.vertiefung ?? null,
    szenen: {},
    quelle: rel,
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
    if (nr === 4 && !bl.kinder.some((/** @type {any} */ x) => x.art === 'zitat' || x.art === 'original')) {
      c.fehler(`${rel}:${kind.zeile}`, 'Ebene 4 (Nachweis) braucht ein „zitat“ oder „original“ mit Absatz-ID');
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
 * @param {string} ordner
 * @param {string} rolle
 * @param {string} text
 * @param {Record<string, any>} regie
 */
function baueSzene(c, rel, ordner, rolle, text, regie) {
  const { kopf, wurzel } = leseDateiKopf(c, rel, '@szene', text);
  const ort = `${rel}:1`;
  if (kopf.station !== undefined && kopf.station !== ordner) c.fehler(ort, `station „${kopf.station}“ passt nicht zum Ordner „${ordner}“`);
  if (kopf.rolle !== undefined && kopf.rolle !== rolle) c.fehler(ort, `rolle „${kopf.rolle}“ passt nicht zum Dateinamen „${rolle}“`);
  const optionen = [];
  const fragen = [];
  /** @type {Record<string, string>} */
  const texte = {};
  /** @type {string | null} */
  let ohne = null;
  /** @type {string | null} */
  let nachsatz = null;
  for (const k of wurzel.kinder) {
    if (k.art === 'regie') {
      const r = c.lies(k, '@szene', rel);
      if (r !== null) regie[`${ordner}/${rolle}`] = baueRegie(c, r.rohFelder, rel);
      continue;
    }
    const bl = c.block(k, '@szene', rel);
    if (bl === null) continue;
    const kOrt = `${rel}:${k.zeile}`;
    if (bl.art === 'option' && bl.id !== null) {
      if (optionen.some((o) => o.id === bl.id)) c.fehler(kOrt, `Option ${bl.id} doppelt`);
      optionen.push({
        id: bl.id,
        titel: bl.kopf.titel ?? '',
        kurz: bl.kopf.kurz ?? '',
        symbol: bl.kopf.symbol ?? null,
        wirkung: bl.kopf.status ?? [],
        felder: bl.felder,
      });
    } else if (bl.art === 'nachsatz') {
      nachsatz = bl.felder.text ?? '';
    } else if (bl.art === 'frage' && bl.id !== null) {
      const antworten = bl.kinder.filter((/** @type {any} */ x) => x.art === 'antwort').map((/** @type {any} */ x) => ({
        id: x.id ?? '', titel: x.kopf.titel ?? '', praefix: x.kopf.praefix ?? null, symbol: x.kopf.symbol ?? null, html: x.felder.text ?? '',
      }));
      if (antworten.length < 2) c.fehler(kOrt, `Frage ${bl.id} braucht mindestens zwei Antworten`);
      fragen.push({ id: bl.id, schritt: bl.kopf.schritt ?? null, felder: bl.felder, antworten });
    } else if (bl.art === 'rueckbezug' && bl.id !== null) {
      if (bl.id === 'ohne') ohne = bl.felder.text ?? '';
      else {
        if (texte[bl.id] !== undefined) c.fehler(kOrt, `Rückbezug ${bl.id} doppelt`);
        texte[bl.id] = bl.felder.text ?? '';
      }
    }
  }
  if (optionen.length > 0 && !kopf.frage) c.fehler(ort, 'Kopfdaten „frage“ fehlen (Pflicht, sobald es Optionen gibt)');
  optionen.sort((a, b) => a.id.localeCompare(b.id));
  const hatRueckbezug = Object.keys(texte).length > 0 || ohne !== null;
  if (hatRueckbezug && !kopf.rueckbezugAuf) c.fehler(ort, 'Rückbezüge ohne „rueckbezug-auf“');
  return {
    station: ordner,
    rolle,
    entscheidung: optionen.length > 0 ? {
      id: kopf.entscheidung ?? `${ordner}/${rolle}`,
      frage: kopf.frage ?? '',
      optionen,
      nachsatz,
    } : null,
    fragen,
    rueckbezug: hatRueckbezug ? { auf: kopf.rueckbezugAuf ?? '', texte, ohne } : null,
    quelle: rel,
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
        if (!b.kinder.some((/** @type {any} */ x) => x.art === 'zitat' || x.art === 'original')) c.fehler(rel, `Wissenscheck ${b.id}: Beleg fehlt (zitat oder original)`);
      }
      pruefeCheck(b.kinder ?? []);
    }
  };
  pruefeCheck(bloecke);
  for (const s of kopf.story ?? []) c.verweise.push({ art: 'station', wert: s, ort });
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
    titel: kopf.titel ?? '',
    kurztitel: kopf.kurztitel ?? kopf.titel ?? '',
    story: kopf.story ?? [],
    deckt,
    einleitung: c.html(rohFelder['text']?.text ?? '', ort),
    bloecke,
    quelle: rel,
  };
}

/**
 * @param {Kompilierer} c
 * @param {string} rel
 * @param {string} text
 */
function baueEinwaende(c, rel, text) {
  const { wurzel } = leseDateiKopf(c, rel, '@einwaende', text);
  const aus = [];
  for (const k of wurzel.kinder) {
    const bl = c.block(k, '@einwaende', rel);
    if (bl === null || bl.art !== 'einwand') continue;
    if (!bl.kinder.some((/** @type {any} */ x) => x.art === 'zitat' || x.art === 'original')) {
      c.fehler(`${rel}:${k.zeile}`, `Einwand ${bl.id}: Beleg fehlt (ein „zitat“ oder „original“ aus dem Whitepaper)`);
    }
    if (aus.some((e) => e.id === bl.id)) c.fehler(`${rel}:${k.zeile}`, `Einwand ${bl.id} doppelt`);
    for (const s of bl.kopf.stationen ?? []) c.verweise.push({ art: 'station', wert: s, ort: `${rel}:${k.zeile}` });
    const gl = c.quelle?.gliederung ?? [];
    for (const nr of bl.kopf.kapitel ?? []) {
      if (gl.length > 0 && !gl.some((/** @type {GliederungsKapitel} */ g) => g.nr === String(nr) || g.abschnitte.some((a) => a.nr === String(nr)))) {
        c.fehler(`${rel}:${k.zeile}`, `Einwand ${bl.id}: Kapitel „${nr}“ gibt es im Whitepaper nicht`);
      }
    }
    aus.push({ id: bl.id ?? '', stationen: bl.kopf.stationen ?? [], kapitel: bl.kopf.kapitel ?? [], felder: bl.felder, bloecke: bl.kinder });
  }
  return aus;
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
    const ids = c.expandiere(beleg, ort);
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

/**
 * Vorher/Nachher-Welten (P8.2).
 * @param {Kompilierer} c
 * @param {string} rel
 * @param {string} text
 */
function baueWelten(c, rel, text) {
  const { wurzel } = leseDateiKopf(c, rel, '@welten', text);
  const aus = [];
  for (const k of wurzel.kinder) {
    const bl = c.block(k, '@welten', rel);
    if (bl === null || bl.art !== 'welt') continue;
    if (!bl.kinder.some((/** @type {any} */ x) => x.art === 'zitat' || x.art === 'original')) {
      c.fehler(`${rel}:${k.zeile}`, `Welt ${bl.id}: Beleg fehlt (ein „zitat“ oder „original“ aus dem Whitepaper)`);
    }
    if (aus.some((e) => e.id === bl.id)) c.fehler(`${rel}:${k.zeile}`, `Welt ${bl.id} doppelt`);
    for (const s of bl.kopf.stationen ?? []) c.verweise.push({ art: 'station', wert: s, ort: `${rel}:${k.zeile}` });
    aus.push({ id: bl.id ?? '', titel: bl.kopf.titel ?? '', stationen: bl.kopf.stationen ?? [], weltA: bl.felder.weltA ?? '', weltB: bl.felder.weltB ?? '', bloecke: bl.kinder });
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
  if (quelle === null) b.warnung('whitepaper', `${path.relative(wurzel, wpPfad).replace(/\\/gu, '/')} fehlt – Zitate, Glossar und Abdeckung nur eingeschränkt geprüft`, true);

  const c = new Kompilierer(b, quelle, pruefe);
  const inhaltOrdner = path.join(wurzel, 'inhalte');
  const dateien = alleDateien(inhaltOrdner);
  const lies = (/** @type {string} */ r) => readFileSync(path.join(inhaltOrdner, r), 'utf8');

  /** @type {any} */
  let fall = null;
  /** @type {any} */
  let startseite = null;
  /** @type {Record<string, any>} */
  const rollen = {};
  /** @type {Record<string, any>} */
  const stationen = {};
  /** @type {any[]} */
  const szenen = [];
  /** @type {Record<string, any>} */
  const theorie = {};
  /** @type {any[]} */
  let einwaende = [];
  /** @type {any[]} */
  let welten = [];
  /** @type {any[]} */
  let kompass = [];
  /** @type {Record<string, any>} */
  const regie = {};
  /** @type {Record<string, unknown> | null} */
  let abdeckungRoh = null;

  for (const r of dateien) {
    const rel = `inhalte/${r}`;
    let m;
    if (r === 'fall.md') fall = baueFall(c, rel, lies(r));
    else if (r === 'start.md') startseite = baueStartseite(c, rel, lies(r));
    else if ((m = /^rollen\/([^/]+)\.md$/u.exec(r))) rollen[m[1] ?? ''] = baueRolle(c, rel, m[1] ?? '', lies(r));
    else if ((m = /^story\/([^/]+)\/station\.md$/u.exec(r))) stationen[m[1] ?? ''] = baueStation(c, rel, m[1] ?? '', lies(r), regie);
    else if ((m = /^story\/([^/]+)\/([^/]+)\.md$/u.exec(r))) szenen.push({ ordner: m[1] ?? '', rolle: m[2] ?? '', rel, text: lies(r) });
    else if ((m = /^theorie\/(k\d\d)-[^/]+\.md$/u.exec(r))) {
      const id = m[1] ?? '';
      if (theorie[id] !== undefined) c.fehler(rel, `zweite Lernseite für ${id}`);
      theorie[id] = baueTheorie(c, rel, id, lies(r), regie);
    } else if (r === 'einwaende.md') einwaende = baueEinwaende(c, rel, lies(r));
    else if (r === 'welten.md') welten = baueWelten(c, rel, lies(r));
    else if (r === 'begriffs-kompass.md') kompass = baueKompass(c, rel, lies(r));
    else if (r === 'abdeckung.yaml') abdeckungRoh = leseYaml(lies(r), rel, 1, b);
    else if (/^abbildungen\/abb-\d+\.yaml$/u.test(r)) { /* baueAbbildungen (P14) */ }
    else if (r.endsWith('.md') || r.endsWith('.yaml')) c.warnung(rel, 'Datei gehört zu keiner bekannten Art (docs/INHALTSFORMAT.md Abschnitt 1) – ignoriert');
  }

  // Szenen in ihre Stationen
  for (const s of szenen) {
    const st = stationen[s.ordner];
    const szene = baueSzene(c, s.rel, s.ordner, s.rolle, s.text, regie);
    if (st === undefined) {
      c.fehler(s.rel, `Rollenszene ohne station.md im Ordner „${s.ordner}“`);
      continue;
    }
    if (!ROLLEN.includes(s.rolle)) c.fehler(s.rel, `„${s.rolle}“ ist keine Rolle (${ROLLEN.join(', ')})`);
    st.szenen[s.rolle] = szene;
  }

  // Prolog: spielbare Rollen und Interessen
  const start = stationen['prolog'] !== undefined ? 'prolog' : (Object.values(stationen).find((st) => st.art === 'prolog')?.id ?? 'prolog');
  /** @type {any[]} */
  const interessen = [];
  /** @type {string[]} */
  let folgt = [];
  for (const st of Object.values(stationen)) {
    for (const s of st.schritte) {
      if (s.art === 'rollenwahl') folgt = [...folgt, ...(s.kopf.folgt ?? [])];
      for (const bl of s.bloecke) {
        if (bl.art === 'interesse' && bl.id !== null) {
          if (s.art !== 'interessenwahl') c.fehler(st.quelle, `Interesse „${bl.id}“ steht nicht in einem Schritt „interessenwahl“`);
          if (interessen.some((i) => i.id === bl.id)) c.fehler(st.quelle, `Interesse „${bl.id}“ doppelt`);
          interessen.push({ id: bl.id, titel: bl.kopf.titel ?? bl.id, html: bl.felder.text ?? '' });
        }
      }
    }
  }
  for (const f of folgt) if (!ROLLEN.includes(f)) c.fehler(`inhalte/story/${start}/station.md`, `„folgt“: „${f}“ ist keine Rolle`);
  for (const id of Object.keys(rollen)) rollen[id].spielbar = !folgt.includes(id);

  // Rückbezüge auflösen (braucht alle Szenen)
  const modell = { start, stationen, rollen, interessen };
  for (const st of Object.values(stationen)) {
    for (const szene of Object.values(st.szenen)) {
      const rb = /** @type {any} */ (szene).rueckbezug;
      if (rb === null) continue;
      const id = loeseEntscheidung(/** @type {any} */ (modell), rb.auf, /** @type {any} */ (szene).rolle);
      if (id === null) c.fehler(/** @type {any} */ (szene).quelle, `„rueckbezug-auf“: Entscheidung „${rb.auf}“ nicht gefunden`);
      else rb.auf = id;
    }
  }

  // Glossar (alle Einträge, für Mouseover)
  /** @type {Record<string, any>} */
  const glossar = {};
  for (const g of quelle?.glossar ?? []) glossar[g.id] = { id: g.id, begriff: g.begriff, definition: g.definition, vorkommen: { stationen: [], kapitel: [] } };
  // Wo ein Begriff vorkommt (P6.14, Glossarseite „Kommt vor in“): Stationen in Story-Reihenfolge, Kapitel aufsteigend
  const inText = (/** @type {unknown} */ x) => new Set([...JSON.stringify(x).matchAll(/data-glossar=\\"([^"\\]+)\\"/gu)].map((m) => m[1]));
  for (const id of stationsFolge(/** @type {any} */ (modell))) {
    const st = stationen[id];
    if (st === undefined) continue;
    for (const g of inText(st)) if (glossar[g] !== undefined) glossar[g].vorkommen.stationen.push(id);
  }
  for (const t of Object.values(theorie).sort((a, b) => /** @type {any} */ (a).kapitel - /** @type {any} */ (b).kapitel)) {
    for (const g of inText(t)) if (glossar[g] !== undefined && !glossar[g].vorkommen.kapitel.includes(/** @type {any} */ (t).kapitel)) glossar[g].vorkommen.kapitel.push(/** @type {any} */ (t).kapitel);
  }

  // Abdeckung
  const abdeckung = baueAbdeckung(c, quelle, abdeckungRoh, stationen, theorie, pruefe);

  if (pruefe) pruefeAlles(c, { fall, rollen, stationen, theorie, interessen, modell });

  const abb = baueAbbildungen(c, quelle, wurzel, theorie, pruefe);

  const inhalte = {
    version: 1,
    whitepaper: { fassung: quelle?.fassung ?? null, titel: quelle?.titel ?? null, kapitel: quelle?.gliederung ?? [], lph: lphPhasen(quelle), abbildungen: abb.liste },
    fall,
    startseite,
    rollen,
    rollenFolge: ROLLEN.filter((r) => rollen[r] !== undefined),
    interessen,
    start,
    stationen,
    stationsFolge: stationsFolge(/** @type {any} */ (modell)),
    glossar,
    theorie,
    einwaende,
    welten,
    kompass,
    abdeckung,
    quellen: baueQuellen(c, quelle, stationen),
    regie,
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
 * Abbildungen der DOCX V1.2 (P14, O-32, L-77): Beschreibung aus inhalte/abbildungen/abb-N.yaml, Bild als WebP
 * (erzeugt von werkzeuge/abbildungen.mjs, Stand in stand.json). Eine Abbildung ohne Beschreibung bleibt reiner
 * Verzeichniseintrag (`bild: null`). Veraltete oder fehlende Bilder sind harte Fehler – der Bau hielte sonst an
 * einem alten Bild fest. Rückgabe: Verzeichnis für inhalte.json und die Bilder als data:-URL (abbildungen.json).
 * @param {Kompilierer} c @param {any} quelle @param {string} wurzel @param {Record<string, any>} theorie @param {boolean} pruefe
 */
function baueAbbildungen(c, quelle, wurzel, theorie, pruefe) {
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
        angeglichen: (e.roh.angeglichen ?? []).map((/** @type {any} */ u) => ({ text: String(u.text).replace(/\s*\n\s*/gu, ' '), beleg: u.beleg })),
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
  // Jede Abbildung mit Bild steht im Originaltext ihres Kapitels (an ihrer DOCX-Stelle)
  if (pruefe) for (const a of aus) if (a.bild !== null && !c.abbImOriginal.has(a.id)) c.fehler(ABB_ORDNER, `${a.id} (Ort ${a.ort}) steht in keinem Originaltext einer Lernseite`);
  return { liste: aus, daten };
}

/**
 * Quellenfenster (P2.3): der Originaltext jedes Absatzes, auf den eine Station verweist
 * („whitepaper-bezug“), wörtlich aus whitepaper.json, mit Abschnitt für die Zitierangabe.
 * @param {Kompilierer} c @param {any} quelle @param {Record<string, any>} stationen
 * @returns {Record<string, { id: string, abschnitt: string, abschnittTitel: string, html: string }>}
 */
function baueQuellen(c, quelle, stationen) {
  /** @type {Record<string, { id: string, abschnitt: string, abschnittTitel: string, html: string }>} */
  const aus = {};
  if (quelle === null) return aus;
  const ids = [...new Set(Object.values(stationen).flatMap((st) => st.whitepaper ?? []))].sort();
  for (const id of ids) {
    const bl = quelle.nachId.get(id);
    if (bl === undefined) continue;
    aus[id] = { id, abschnitt: bl.abschnitt, abschnittTitel: bl.abschnittTitel, html: c.originalHtml(bl) };
  }
  return aus;
}

/**
 * Leistungsphasen LPH 0–9 aus der Tabelle k9.3-t1 (wörtlich: Name und Freigabefrage) für das LPH-Band.
 * @param {any} quelle
 * @returns {{ nr: number, name: string, freigabefrage: string }[]}
 */
function lphPhasen(quelle) {
  const t = quelle?.nachId.get('k9.3-t1');
  if (t === undefined) return [];
  /** @type {{ nr: number, name: string, freigabefrage: string }[]} */
  const aus = [];
  for (const zeile of String(t.text).split('\n').slice(1)) {
    const [lph = '', name = '', frage = ''] = zeile.split('|').map((x) => x.trim());
    const m = /^LPH (\d)$/u.exec(lph);
    if (m !== null) aus.push({ nr: Number(m[1]), name, freigabefrage: frage });
  }
  return aus;
}

/**
 * @param {Kompilierer} c
 * @param {Quelle | null} quelle
 * @param {Record<string, unknown> | null} roh
 * @param {Record<string, any>} stationen
 * @param {Record<string, any>} theorie
 * @param {boolean} pruefe
 */
function baueAbdeckung(c, quelle, roh, stationen, theorie, pruefe) {
  const rel = 'inhalte/abdeckung.yaml';
  /** @type {Record<string, { theorie: string[], story: string[] }>} */
  const ziele = {};
  const ziel = (/** @type {string} */ id) => (ziele[id] ??= { theorie: [], story: [] });
  // Je Kapitel gibt es eine Lernseite kNN (O-20); bis sie gebaut ist (P6), gilt sie als geplant.
  const kapitelSeite = (/** @type {string} */ nr) => `k${nr.padStart(2, '0')}`;
  const kapitelSeiten = new Set((quelle?.bloecke ?? []).map((bl) => kapitelSeite(bl.kapitel)));
  for (const [id, wert] of Object.entries(roh ?? {})) {
    if (!BLOCK_ID.test(id)) { c.fehler(rel, `„${id}“ ist keine Absatz-ID`); continue; }
    if (quelle !== null && !quelle.nachId.has(id)) c.fehler(rel, `Absatz-ID „${id}“ gibt es im Whitepaper nicht`);
    if (typeof wert !== 'object' || wert === null || Array.isArray(wert)) { c.fehler(rel, `${id}: erwartet „theorie:“ und/oder „story:“`); continue; }
    const o = /** @type {Record<string, unknown>} */ (wert);
    for (const k of Object.keys(o)) if (k !== 'theorie' && k !== 'story') c.fehler(rel, `${id}: unbekannter Schlüssel „${k}“`);
    const liste = (/** @type {unknown} */ x) => (Array.isArray(x) ? x : x === undefined || x === '' ? [] : [x]).map(String);
    for (const t of liste(o['theorie'])) {
      if (theorie[t] === undefined && !kapitelSeiten.has(t)) c.fehler(rel, `${id}: Theorie-Seite „${t}“ gibt es nicht (weder Lernseite noch Kapitel des Whitepapers)`);
      ziel(id).theorie.push(t);
    }
    for (const s of liste(o['story'])) {
      if (stationen[s] === undefined) c.fehler(rel, `${id}: Station „${s}“ gibt es nicht`);
      ziel(id).story.push(s);
    }
  }
  for (const [id, seiten] of c.theorieDeckt) for (const s of seiten) if (!ziel(id).theorie.includes(s)) ziel(id).theorie.push(s);
  // Die Karte trägt jeden „whitepaper-bezug“ einer Station als Story-Bezug (L-20; seit P5.10 im Prüfer statt im Entwurfswerkzeug)
  if (pruefe && roh !== null) {
    for (const st of Object.values(stationen)) {
      for (const id of st.whitepaper ?? []) {
        if (!(ziele[id]?.story ?? []).includes(st.id)) c.fehler(rel, `${id} ohne Story-Bezug auf ${st.id} (steht in dessen whitepaper-bezug)`);
      }
    }
  }
  for (const z of Object.values(ziele)) { z.theorie.sort(); z.story.sort(); }
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

/**
 * Verweise und Graph (nur mit --pruefe).
 * @param {Kompilierer} c
 * @param {{ fall: any, rollen: Record<string, any>, stationen: Record<string, any>, theorie: Record<string, any>, interessen: any[], modell: any }} x
 */
function pruefeAlles(c, x) {
  if (x.fall === null) c.fehler('inhalte/fall.md', 'fehlt');
  for (const r of ROLLEN) if (x.rollen[r] === undefined) c.fehler(`inhalte/rollen/${r}.md`, 'fehlt (sechs Rollen, O-4)');
  for (const r of Object.keys(x.rollen)) if (!ROLLEN.includes(r)) c.fehler(`inhalte/rollen/${r}.md`, `„${r}“ ist keine der sechs Rollen (${ROLLEN.join(', ')})`);
  const figuren = x.fall?.figuren ?? {};
  for (const v of c.verweise) {
    switch (v.art) {
      case 'figur': if (figuren[v.wert] === undefined) c.fehler(v.ort, `Figur „${v.wert}“ steht nicht in inhalte/fall.md`); break;
      case 'rolle': if (!ROLLEN.includes(v.wert)) c.fehler(v.ort, `Rolle „${v.wert}“ gibt es nicht`); break;
      case 'station': if (x.stationen[v.wert] === undefined) c.fehler(v.ort, `Station „${v.wert}“ gibt es nicht`); break;
      case 'interesse': if (!x.interessen.some((i) => i.id === v.wert)) c.fehler(v.ort, `Interesse „${v.wert}“ gibt es nicht`); break;
      case 'entscheidung': {
        const teile = v.wert.split('/');
        const gefunden = findeEntscheidung(x.modell, v.wert) !== null
          || (teile.length === 1 && Object.values(x.stationen[v.wert]?.szenen ?? {}).some((s) => /** @type {any} */ (s).entscheidung !== null));
        if (!gefunden) c.fehler(v.ort, `Entscheidung „${v.wert}“ gibt es nicht`);
        break;
      }
      case 'info': {
        const [st = '', info = ''] = v.wert.split('/');
        if (!(x.stationen[st]?.infos ?? []).some((/** @type {any} */ i) => i.id === info)) c.fehler(v.ort, `Information „${v.wert}“ gibt es nicht`);
        break;
      }
      case 'frage': {
        const teile = v.wert.split('/');
        const st = x.stationen[teile[0] ?? ''];
        const fid = teile[teile.length - 1] ?? '';
        const szenen = teile.length === 3 ? [st?.szenen[teile[1] ?? '']] : Object.values(st?.szenen ?? {});
        if (!szenen.some((s) => (s?.fragen ?? []).some((/** @type {any} */ f) => f.id === fid))) c.fehler(v.ort, `Frage „${v.wert}“ gibt es nicht`);
        break;
      }
      default: break;
    }
  }
  // Stationen ↔ Zeitachse der Fall-Bibel (P1.2): Monat und LPH müssen zusammenpassen
  const stand = x.fall?.lphStand ?? {};
  for (const st of Object.values(x.stationen)) {
    if (st.monat === null || st.lph === null || Object.keys(stand).length === 0) continue;
    const soll = stand[String(st.monat)];
    if (soll === undefined) c.fehler(st.quelle ?? `inhalte/story/${st.id}/station.md`, `Monat ${st.monat} fehlt in der Zeitachse (inhalte/fall.md, lph-stand)`);
    else if (soll !== st.lph) c.fehler(st.quelle ?? `inhalte/story/${st.id}/station.md`, `LPH ${st.lph} passt nicht zu Monat ${st.monat} – laut Fall-Bibel LPH ${soll}`);
  }
  // Rollen ↔ Figuren
  for (const r of Object.values(x.rollen)) if (r.figur !== null && figuren[r.figur] === undefined) c.fehler(r.quelle, `Figur „${r.figur}“ steht nicht in inhalte/fall.md`);
  // Stationen: Frage-Schritte, Standpunkt-Figuren
  for (const st of Object.values(x.stationen)) {
    for (const szene of Object.values(st.szenen)) {
      for (const f of /** @type {any} */ (szene).fragen) {
        if (f.schritt !== null && !st.schritte.some((/** @type {any} */ s) => s.id === f.schritt)) c.fehler(/** @type {any} */ (szene).quelle, `Frage ${f.id}: Schritt „${f.schritt}“ gibt es in ${st.id} nicht`);
      }
    }
  }
  // Graph
  const g = pruefeGraph(x.modell);
  for (const f of g.fehler) c.fehler('graph', f);
  for (const w of g.warnungen) c.warnung('graph', w);
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
  // Hilfe (P13, O-31) gehört zu den generierten Inhalten: vor typen und test erzeugt, Begriffe geprüft
  const { baueHilfe } = await import('./hilfe.mjs');
  const hilfe = baueHilfe({ wurzel: optionen.wurzel ?? WURZEL });
  fehler.push(...hilfe.fehler.map((f) => `hilfe: ${f}`));
  const st = Object.keys(inhalte.stationen).length;
  const sz = Object.values(inhalte.stationen).reduce((n, s) => n + Object.keys(/** @type {any} */ (s).szenen).length, 0);
  const th = Object.keys(inhalte.theorie).length;
  for (const w of warnungen) console.log(`Warnung  ${w}`);
  for (const f of fehler) console.log(`FEHLER   ${f}`);
  console.log(`inhalte: ${st} Stationen, ${sz} Rollenszenen, ${Object.keys(inhalte.rollen).length} Rollen, ${th} Theorie-Seiten, ${inhalte.einwaende.length} Einwände, ${inhalte.welten.length} Welten-Aspekte → ${STANDARD_ZIEL.replace(/\\/gu, '/')}`);
  console.log(`${pruefe ? 'Prüfung' : 'Kompilieren'}: ${fehler.length} Fehler, ${warnungen.length} Warnungen`);
  process.exitCode = fehler.length > 0 ? 1 : 0;
}
