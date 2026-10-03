/**
 * Sichtbar verbotene Wörter (P16.1, O-38, O-39, O-42, O-14): kein Bezug auf eine Vorlage (Whitepaper, Kapitel,
 * Absatz-IDs, Fassung „MVG V1.2“, Originaltext), kein Vermerk „ungeprüft“, die Seite heißt nie Datei, App, Programm,
 * HTML oder Kundenfassung, und Phasen heißen LPH 0–9, nie G0–G5; dazu nichts, was nach Arbeitsstand klingt (O-56,
 * SICHTBAR_ARBEITSSTAND). Genutzt von tests/sichtbar.test.ts (jede Fläche im
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
 * Arbeitsstand sichtbar (P17.10, O-56): was nach Werkstatt klingt, braucht der Endbenutzer nicht – Abweichungen der
 * Abbildungen vom Text, Meta-Sätze über Bild und Text, Bedienhinweise, Entscheidungs- und Postenkennungen (L-…, O-…,
 * R…, P17.10), Prüf- und Quellenvermerke, interne Notizen, Platzhalter. Die Muster sind eng genug, dass Fachtext
 * („geringe Abweichung“, „mit Quelle, Datum und Bedingungen“, „Prüfvermerke“ aus dem Standard) nicht anschlägt.
 * @type {[RegExp, string][]}
 */
export const SICHTBAR_ARBEITSSTAND = [
  [/\bAbweichung(?:en)? vom Text\b|\bvom Text ab(?:weicht|weichen)?\b/iu, 'Abweichung vom Text'],
  [/\b[Dd]er Text (?:nennt|kennt|spricht|beschreibt|sagt|ordnet|zählt)\b/u, 'Meta-Satz „der Text …“'],
  [/\b(?:[Dd]as|[Ii]m) Bild (?:zeigt|steht|heißt)\b/u, 'Meta-Satz „das Bild …“'],
  [/an die Begriffe des Texts? angeglichen/iu, 'Angleichung des Bilds'],
  [/\b[LO]-\d{1,3}\b/u, 'Entscheidungskennung L-/O-'],
  [/\bR\d{1,3}\b/u, 'Prüfrunde R…'],
  [/\bP\d{1,2}\.\d{1,2}\b/u, 'Posten P…'],
  [/Prüf-?[Aa]gent/u, 'Prüf-Agent'],
  [/\bBeleg(?:e|en|stelle|stellen)?\b/u, 'Beleg'],
  [/\bQuellen?\s*:/u, 'Quelle:'],
  [/\bV2\.4\b|\bHB\s?\d/u, 'Quellenhinweis auf den Standard'],
  [/\bintern\b|\bintern(?:e|er|es|en)?\s+(?:Notiz|Vermerk|Hinweis|Anmerkung|Kommentar)/iu, 'intern'],
  [/\b(?:TODO|FIXME|XXX)\b/u, 'TODO'],
  [/Platzhalter|Lorem ipsum/iu, 'Platzhalter'],
  [/Bedienhinweis|Hinweis zur Bedienung/iu, 'Bedienhinweis'],
  [/\bKlicken Sie\b|\b(?:Ziehen|Schieben) Sie den Regler\b|\bSchalten Sie um\b/u, 'Bedienungs-Anleitung'],
];

const ALLE = [...SICHTBAR_VERBOTEN, ...SICHTBAR_ARBEITSSTAND];

/**
 * @param {string} text
 * @returns {string[]} Befundtexte mit Umgebung
 */
export function sichtbarVerboten(text) {
  const aus = [];
  for (const [re, name] of ALLE) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
    for (const m of text.matchAll(g)) {
      const i = m.index ?? 0;
      aus.push(`verbotenes Wort sichtbar (${name}): „${text.slice(Math.max(0, i - 40), i + m[0].length + 40).replace(/\s+/gu, ' ')}“`);
    }
  }
  return aus;
}
