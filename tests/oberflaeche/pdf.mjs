// Echte PDF-Messung für die Druckwege (R41): Text je Seite mit Lage, damit ein Szenario prüfen kann, ob eine Seite
// mit einer Überschrift endet – der berechnete CSS-Wert allein sagt nicht, was Chromium im Druck daraus macht.
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * Zeilen je Seite, von oben nach unten (Textstücke gleicher Grundlinie zusammengefasst), je Zeile mit der größten
 * Schriftgröße in pt (R42: Überschriften werden auch an ihrer Größe erkannt, nicht nur am Wortlaut).
 * @param {Uint8Array} daten
 * @returns {Promise<Seite[]>}
 */
export async function pdfSeiten(daten) {
  const aufgabe = getDocument({ data: new Uint8Array(daten), useSystemFonts: false, isEvalSupported: false, disableFontFace: true, verbosity: 0 });
  const dok = await aufgabe.promise;
  /** @type {Seite[]} */
  const seiten = [];
  for (let n = 1; n <= dok.numPages; n++) {
    const seite = await dok.getPage(n);
    const [, , breite, hoehe] = seite.view;
    const inhalt = await seite.getTextContent();
    /** @type {Map<number, { x: number, s: string, pt: number }[]>} */
    const nachY = new Map();
    for (const it of inhalt.items) {
      if (!('str' in it) || it.str.trim() === '') continue;
      const y = Math.round(it.transform[5]);
      const schon = [...nachY.keys()].find((k) => Math.abs(k - y) <= 2);
      const liste = nachY.get(schon ?? y) ?? [];
      liste.push({ x: it.transform[4], s: it.str, pt: Math.hypot(it.transform[2], it.transform[3]) });
      nachY.set(schon ?? y, liste);
    }
    const sortiert = [...nachY.entries()].sort((a, b) => b[0] - a[0]).map(([, teile]) => teile.sort((a, b) => a.x - b.x));
    seiten.push({
      breite: Number(breite), hoehe: Number(hoehe),
      zeilen: sortiert.map((teile) => teile.map((t) => t.s).join(' ').replace(/\s+/gu, ' ').trim()),
      groessen: sortiert.map((teile) => Math.max(...teile.map((t) => t.pt))),
    });
  }
  await aufgabe.destroy();
  return seiten;
}

/** @typedef {{ breite: number, hoehe: number, zeilen: string[], groessen?: number[] }} Seite */
/** @typedef {{ text: string, pt?: number }} Kopf */

/** Vergleichsform: ohne Leerraum, weiche Trennzeichen und Groß-/Kleinschreibung (Kapitälchen-Sperrung im PDF) */
export const flach = (/** @type {string} */ s) => s.replace(/[\s\u00ad]+/gu, '').toLowerCase();

/**
 * Seiten, deren letzte Zeile eine Überschrift ist – ganz, als Anfang oder als Ende einer umbrochenen –, außer der letzten Seite.
 * Überschriften mit Schriftgröße (pt, aus dem DOM) zählen nur bei passender Größe der PDF-Zeile: ein gleichlautender
 * Listenpunkt in Grundschrift ist keine Überschrift (R42, Fehlalarm „alles drucken“).
 * @param {{ zeilen: string[], groessen?: number[] }[]} seiten
 * @param {(string | Kopf)[]} ueberschriften
 */
export function seitenMitUeberschriftAmEnde(seiten, ueberschriften) {
  const koepfe = ueberschriften.map((u) => (typeof u === 'string' ? { text: u } : u))
    .map((u) => ({ k: flach(u.text), pt: u.pt })).filter((u) => u.k.length >= 6);
  /** @type {{ seite: number, zeile: string }[]} */
  const treffer = [];
  seiten.forEach((s, i) => {
    if (i === seiten.length - 1) return;
    // Fußzeilen und Seitenzahlen erzeugt Chromium nicht (kein displayHeaderFooter) – die letzte Zeile ist Inhalt
    const n = s.zeilen.length;
    const letzte = s.zeilen[n - 1] ?? '';
    const f = flach(letzte);
    const vor = flach(s.zeilen[n - 2] ?? '');
    const pt = s.groessen?.[n - 1];
    if (f.length < 3) return;
    const satzende = /[.:;!]$/u.test(letzte.trim());
    const passt = (/** @type {{ k: string, pt?: number }} */ u) => {
      if (u.pt !== undefined && pt !== undefined && Math.abs(u.pt - pt) > 0.6) return false;
      // die ganze Überschrift (auch mit „?“ am Ende: „Wer pflegt dieses Register?“)
      if (u.k === f) return true;
      if (satzende) return false;
      // erste Zeile einer umbrochenen (mindestens 60 % ihrer Länge)
      if (f.length >= 6 && u.k.startsWith(f) && f.length >= 0.6 * u.k.length) return true;
      // Ende einer umbrochenen: vorletzte und letzte Zeile bilden zusammen ihr Ende
      return vor.length > 0 && u.k.endsWith(vor + f);
    };
    if (koepfe.some(passt)) treffer.push({ seite: i + 1, zeile: letzte });
  });
  return treffer;
}
