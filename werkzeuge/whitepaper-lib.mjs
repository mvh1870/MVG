// Zugriff auf die strukturierte Whitepaper-Quelle (quellen/whitepaper/<fassung>/whitepaper.json).
// Genutzt vom Inhaltsprüfer (Zitate wortgleich mit Absatz-ID), vom Re-Import (P10.3) und von Tests.
// Das Schema ist in werkzeuge/whitepaper-import.mjs dokumentiert; hier nur Lesen, Suchen, Vergleichen.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * @typedef {import('./whitepaper-import.mjs').Whitepaper} Whitepaper
 * @typedef {import('./whitepaper-import.mjs').Abschnitt} Abschnitt
 * @typedef {import('./whitepaper-import.mjs').Block} Block
 * @typedef {import('./whitepaper-import.mjs').BlockArt} BlockArt
 * @typedef {import('./whitepaper-import.mjs').GlossarEintrag} GlossarEintrag
 * @typedef {import('./whitepaper-import.mjs').Abbildung} Abbildung
 */

/**
 * Ein Block mit seiner Lage im Dokument (Ergebnis von alleBloecke).
 * `kapitel` ist die Nummer des Kapitels ("4"), `abschnitt` die des innersten Abschnitts ("4.2"; bei Blöcken
 * direkt unter der Kapitelüberschrift gleich `kapitel`).
 * @typedef {Block & { kapitel: string, abschnitt: string, abschnittTitel: string }} FlacherBlock
 */

/**
 * Ergebnis von vergleiche(): IDs (Blöcke `k…`, Abschnitte `k4.2`, Abbildungen `abb-…`, Glossar `g-…`).
 * @typedef {{ id: string, alt: string, neu: string }} Aenderung
 * @typedef {{ neu: string[], entfallen: string[], geaendert: Aenderung[] }} Vergleich
 */

/** Pfad der maßgeblichen Fassung (O-23: V1.2). */
export const STANDARD_PFAD = fileURLToPath(new URL('../quellen/whitepaper/v1.2/whitepaper.json', import.meta.url));

/**
 * Normalisierung für Wortgleichheit: nur Leerraum und Silbentrennung (ARCHITEKTUR „Zitate“).
 * Weiches Trennzeichen U+00AD und unsichtbare Nullbreiten-Zeichen fallen weg, jede Leerraumfolge
 * (auch geschütztes Leerzeichen, Tab, Zeilenumbruch) wird ein Leerzeichen, Ränder werden abgeschnitten.
 * Anführungszeichen, Striche und Groß-/Kleinschreibung bleiben unangetastet.
 * @param {string} text
 * @returns {string}
 */
export function normalisiere(text) {
  return String(text)
    .replace(/[­​⁠﻿]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Lädt whitepaper.json (Vorgabe: V1.2 im Repo) und prüft die Grundform.
 * @param {string} [pfad]
 * @returns {Whitepaper}
 */
export function ladeWhitepaper(pfad = STANDARD_PFAD) {
  /** @type {unknown} */
  const daten = JSON.parse(readFileSync(pfad, 'utf8'));
  if (
    typeof daten !== 'object' || daten === null ||
    !('fassung' in daten) || typeof daten.fassung !== 'string' ||
    !('kapitel' in daten) || !Array.isArray(daten.kapitel)
  ) {
    throw new Error(`${pfad}: keine Whitepaper-Quelle (fassung/kapitel fehlen)`);
  }
  return /** @type {Whitepaper} */ (daten);
}

/**
 * Alle Blöcke in Dokumentreihenfolge, flach, mit Kapitel- und Abschnittsangabe.
 * @param {Whitepaper} wp
 * @returns {FlacherBlock[]}
 */
export function alleBloecke(wp) {
  /** @type {FlacherBlock[]} */
  const aus = [];
  /** @param {Abschnitt} abschnitt @param {string} kapitel */
  const gehe = (abschnitt, kapitel) => {
    for (const block of abschnitt.bloecke) {
      aus.push({ ...block, kapitel, abschnitt: abschnitt.nr, abschnittTitel: abschnitt.titel });
    }
    for (const unter of abschnitt.abschnitte) gehe(unter, kapitel);
  };
  for (const kapitel of wp.kapitel) gehe(kapitel, kapitel.nr);
  return aus;
}

/**
 * Alle Abschnitte (Kapitel eingeschlossen) in Dokumentreihenfolge.
 * @param {Whitepaper} wp
 * @returns {Abschnitt[]}
 */
export function alleAbschnitte(wp) {
  /** @type {Abschnitt[]} */
  const aus = [];
  /** @param {Abschnitt} abschnitt */
  const gehe = (abschnitt) => {
    aus.push(abschnitt);
    for (const unter of abschnitt.abschnitte) gehe(unter);
  };
  for (const kapitel of wp.kapitel) gehe(kapitel);
  return aus;
}

/**
 * Sucht einen Block nach ID (z. B. "k4.2-p3"); liefert den Block aus wp selbst oder undefined.
 * @param {Whitepaper} wp
 * @param {string} id
 * @returns {Block | undefined}
 */
export function findeBlock(wp, id) {
  for (const abschnitt of alleAbschnitte(wp)) {
    for (const block of abschnitt.bloecke) if (block.id === id) return block;
  }
  return undefined;
}

/**
 * R50: Liegt die Stelle p (zwischen t[p-1] und t[p]) in einem Wort? Binde-, Strecken- und Schrägstrich zwischen zwei
 * Wortzeichen verbinden („Bauherren-PL“, „LPH 0–9“). Gleiche Regel wie der Compiler (werkzeuge/inhalte.mjs).
 * @param {string} t
 * @param {number} p
 */
function imWort(t, p) {
  const w = (/** @type {string | undefined} */ z) => z !== undefined && /[\p{L}\p{N}]/u.test(z);
  const b = (/** @type {string | undefined} */ z) => z !== undefined && /[-–/]/u.test(z);
  return (w(t[p - 1]) && w(t[p])) || (b(t[p]) && w(t[p - 1]) && w(t[p + 1])) || (b(t[p - 1]) && w(t[p - 2]) && w(t[p]));
}

/**
 * Prüft ein Zitat mit Begründung: es muss nach normalisiere() als zusammenhängender Teilstring
 * im Block vorkommen. `grund` nennt bei Misserfolg die Stelle, ab der das Zitat abweicht.
 * @param {Whitepaper} wp
 * @param {string} id
 * @param {string} zitat
 * @returns {{ ok: boolean, grund: string }}
 */
export function pruefeZitat(wp, id, zitat) {
  const block = findeBlock(wp, id);
  if (!block) return { ok: false, grund: `unbekannte Absatz-ID ${id}` };
  const z = normalisiere(zitat);
  if (z === '') return { ok: false, grund: 'leeres Zitat' };
  const t = normalisiere(block.text);
  // R49: nur an Wortgrenzen (nicht „verantwortlich“ aus „letztverantwortlich“); R50: auch nicht „Bauherren“ aus „Bauherren-PL“
  for (let i = t.indexOf(z); i >= 0; i = t.indexOf(z, i + 1)) {
    if (!imWort(t, i) && !imWort(t, i + z.length)) return { ok: true, grund: '' };
  }
  if (t.includes(z)) return { ok: false, grund: `Zitat beginnt oder endet in ${id} mitten im Wort` };
  // Längsten passenden Anfang suchen, damit der Befund zeigt, wo das Zitat abweicht.
  let gut = 0;
  let unten = 1;
  let oben = z.length;
  while (unten <= oben) {
    const mitte = (unten + oben) >> 1;
    if (t.includes(z.slice(0, mitte))) {
      gut = mitte;
      unten = mitte + 1;
    } else {
      oben = mitte - 1;
    }
  }
  const stelle = z.slice(gut, gut + 40);
  return {
    ok: false,
    grund: gut === 0
      ? `Zitat kommt in ${id} nicht vor`
      : `Zitat weicht in ${id} nach ${gut} Zeichen ab bei „${stelle}“`,
  };
}

/**
 * Wortgleichheit eines Zitats mit dem Block `id` (Normalisierung nur von Leerraum und Silbentrennung).
 * @param {Whitepaper} wp
 * @param {string} id
 * @param {string} zitat
 * @returns {boolean}
 */
export function istWortgleich(wp, id, zitat) {
  return pruefeZitat(wp, id, zitat).ok;
}

/**
 * Vergleichbare Einträge einer Fassung: ID → Klartext (für den Diff je ID).
 * @param {Whitepaper} wp
 * @returns {Map<string, string>}
 */
function eintraege(wp) {
  /** @type {Map<string, string>} */
  const m = new Map();
  for (const abschnitt of alleAbschnitte(wp)) {
    m.set(abschnitt.id, abschnitt.titel);
    for (const block of abschnitt.bloecke) m.set(block.id, block.text);
  }
  for (const abb of wp.abbildungen ?? []) {
    m.set(abb.id, `${abb.datei} nach ${abb.ort}${abb.sha256 ? ` (sha256 ${abb.sha256.slice(0, 12)})` : ''}`);
  }
  for (const g of wp.glossar ?? []) m.set(g.id, `${g.begriff}: ${g.definition}`);
  return m;
}

/**
 * Diff zweier Fassungen je ID. Geändert heißt: Klartext nach normalisiere() verschieden.
 * `neu`/`geaendert` in der Reihenfolge der neuen Fassung, `entfallen` in der der alten.
 * @param {Whitepaper} altWp
 * @param {Whitepaper} neuWp
 * @returns {Vergleich}
 */
export function vergleiche(altWp, neuWp) {
  const alt = eintraege(altWp);
  const neu = eintraege(neuWp);
  /** @type {Vergleich} */
  const ergebnis = { neu: [], entfallen: [], geaendert: [] };
  for (const [id, text] of neu) {
    const vorher = alt.get(id);
    if (vorher === undefined) ergebnis.neu.push(id);
    else if (normalisiere(vorher) !== normalisiere(text)) ergebnis.geaendert.push({ id, alt: vorher, neu: text });
  }
  for (const id of alt.keys()) if (!neu.has(id)) ergebnis.entfallen.push(id);
  return ergebnis;
}
