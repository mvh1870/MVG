/**
 * Sichtbar verbotene Wörter (P16.1, O-38, O-39, O-42, O-14): kein Bezug auf eine Vorlage (Whitepaper, Kapitel,
 * Absatz-IDs, Fassung „MVG V1.2“, Originaltext), kein Vermerk „ungeprüft“, die Seite heißt nie Datei, App, Programm,
 * HTML oder Kundenfassung, und Phasen heißen LPH 0–9, nie G0–G5. Genutzt von tests/sichtbar.test.ts (jede Fläche im
 * DOM) und den Browser-Szenarien. Liste und Ausnahmen: docs/BEGRIFFE.md.
 */

/** @type {[RegExp, string][]} */
export const SICHTBAR_VERBOTEN = [
  [/white\s*-?\s*paper/iu, 'Whitepaper'],
  [/\bKapitel\w*/u, 'Kapitel'],
  [/\bKap\.\s*\d/u, 'Kap. <Nr>'],
  [/\bk\d{1,2}(?:\.\d{1,2}){0,3}-[pltb]\d{1,3}\b/u, 'Absatz-ID'],
  [/\bMVG\s+V\d/u, 'MVG V<Fassung>'],
  [/\bV1\.2\b/u, 'V1.2'],
  [/Originaltext/iu, 'Originaltext'],
  [/ungeprüft/iu, 'ungeprüft'],
  [/\b(?:Einzel)?[Dd]atei\b/u, 'Datei'],
  [/\bApp\b/u, 'App'],
  [/\bProgramm\b/u, 'Programm'],
  [/\bHTML\b/u, 'HTML'],
  [/Kundenfassung/iu, 'Kundenfassung'],
  [/\bG[0-5]\b/u, 'G0–G5'],
];

/**
 * @param {string} text
 * @returns {string[]} Befundtexte mit Umgebung
 */
export function sichtbarVerboten(text) {
  const aus = [];
  for (const [re, name] of SICHTBAR_VERBOTEN) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    for (const m of text.matchAll(g)) {
      const i = m.index ?? 0;
      aus.push(`verbotenes Wort sichtbar (${name}): „${text.slice(Math.max(0, i - 40), i + m[0].length + 40).replace(/\s+/gu, ' ')}“`);
    }
  }
  return aus;
}
