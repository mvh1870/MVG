// Echte PDF-Messung für die Druckwege (R41): Text je Seite mit Lage, damit ein Szenario prüfen kann, ob eine Seite
// mit einer Überschrift endet – der berechnete CSS-Wert allein sagt nicht, was Chromium im Druck daraus macht.
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * Zeilen je Seite, von oben nach unten (Textstücke gleicher Grundlinie zusammengefasst).
 * @param {Uint8Array} daten
 * @returns {Promise<{ breite: number, hoehe: number, zeilen: string[] }[]>}
 */
export async function pdfSeiten(daten) {
  const aufgabe = getDocument({ data: new Uint8Array(daten), useSystemFonts: false, isEvalSupported: false, disableFontFace: true, verbosity: 0 });
  const dok = await aufgabe.promise;
  /** @type {{ breite: number, hoehe: number, zeilen: string[] }[]} */
  const seiten = [];
  for (let n = 1; n <= dok.numPages; n++) {
    const seite = await dok.getPage(n);
    const [, , breite, hoehe] = seite.view;
    const inhalt = await seite.getTextContent();
    /** @type {Map<number, { x: number, s: string }[]>} */
    const nachY = new Map();
    for (const it of inhalt.items) {
      if (!('str' in it) || it.str.trim() === '') continue;
      const y = Math.round(it.transform[5]);
      const schon = [...nachY.keys()].find((k) => Math.abs(k - y) <= 2);
      const liste = nachY.get(schon ?? y) ?? [];
      liste.push({ x: it.transform[4], s: it.str });
      nachY.set(schon ?? y, liste);
    }
    const zeilen = [...nachY.entries()].sort((a, b) => b[0] - a[0])
      .map(([, teile]) => teile.sort((a, b) => a.x - b.x).map((t) => t.s).join(' ').replace(/\s+/gu, ' ').trim());
    seiten.push({ breite: Number(breite), hoehe: Number(hoehe), zeilen });
  }
  await aufgabe.destroy();
  return seiten;
}

/** Vergleichsform: ohne Leerraum, weiche Trennzeichen und Groß-/Kleinschreibung (Kapitälchen-Sperrung im PDF) */
export const flach = (/** @type {string} */ s) => s.replace(/[\s­]+/gu, '').toLowerCase();

/**
 * Seiten, deren letzte Zeile eine der Überschriften ist (oder deren Anfang), außer der letzten Seite.
 * @param {{ zeilen: string[] }[]} seiten
 * @param {string[]} ueberschriften
 */
export function seitenMitUeberschriftAmEnde(seiten, ueberschriften) {
  const koepfe = ueberschriften.map(flach).filter((k) => k.length >= 6);
  /** @type {{ seite: number, zeile: string }[]} */
  const treffer = [];
  seiten.forEach((s, i) => {
    if (i === seiten.length - 1) return;
    // Fußzeilen und Seitenzahlen erzeugt Chromium nicht (kein displayHeaderFooter) – die letzte Zeile ist Inhalt
    const letzte = s.zeilen[s.zeilen.length - 1] ?? '';
    const f = flach(letzte);
    // ganze Überschrift, oder erste Zeile einer umbrochenen (mindestens 60 % ihrer Länge); ein Satzende ist keine Überschrift
    const istKopf = (/** @type {string} */ k) => k === f || (k.startsWith(f) && f.length >= 0.6 * k.length);
    if (f.length >= 6 && !/[.:;!?]$/u.test(letzte.trim()) && koepfe.some(istKopf)) treffer.push({ seite: i + 1, zeile: letzte });
  });
  return treffer;
}
