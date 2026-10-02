// Echte PDF-Messung für die Druckwege (R41): Text je Seite mit Lage, damit ein Szenario prüfen kann, ob eine Seite
// mit einer Überschrift endet – der berechnete CSS-Wert allein sagt nicht, was Chromium im Druck daraus macht.
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

/** @typedef {{ breite: number, hoehe: number, zeilen: string[], groessen?: number[], fuellung?: number }} Seite */

/**
 * Anteil einer Seite bis zu ihrer tiefsten Textzeile (PDF-y wächst nach oben; ohne Text 0).
 * @param {number} hoehe
 * @param {number} tiefsteY
 */
export function fuellung(hoehe, tiefsteY) {
  if (!(hoehe > 0) || tiefsteY >= hoehe) return 0;
  return Math.min(1, Math.max(0, (hoehe - tiefsteY) / hoehe));
}
/** @typedef {{ text: string, pt?: number }} Kopf */

/**
 * Vergleichsform: ohne Leerraum, weiche Trennzeichen und Groß-/Kleinschreibung (Kapitälchen-Sperrung im PDF); R48: auch ohne
 * Bindestriche – eine weiche Trennstelle erscheint im PDF als sichtbarer Strich („Wissens-abhängigkeit“)
 */
export const flach = (/** @type {string} */ s) => s.replace(/[\s\u00ad\-\u2010\u2011]+/gu, '').toLowerCase();

/**
 * Seiten, deren letzte Zeile eine Überschrift ist – ganz, als Anfang oder als Ende einer umbrochenen –, außer der letzten Seite.
 * Überschriften mit Schriftgröße (pt, aus dem DOM) zählen nur bei passender Größe der PDF-Zeile: ein gleichlautender
 * Listenpunkt in Grundschrift ist keine Überschrift (R42, Fehlalarm „alles drucken“).
 * @param {{ zeilen: string[], groessen?: number[] }[]} seiten
 * @param {(string | Kopf)[]} ueberschriften
 */
export function seitenMitUeberschriftAmEnde(seiten, ueberschriften) {
  const koepfe = ueberschriften.map((u) => (typeof u === 'string' ? { text: u } : u))
    // R49: kurze Köpfe (Absatz-ID „k4-t1“, „CTC“) nur mit Schriftgröße und nur bei ganzer Gleichheit (sonst Fehlalarme)
    .map((u) => ({ k: flach(u.text), pt: u.pt })).filter((u) => u.k.length >= 6 || (u.pt !== undefined && u.k.length >= 3));
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
      if (u.k.length < 6) return pt !== undefined && u.k === f;
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

/**
 * R43/R44: Wörter, die im aktuellen Layout mitten im Wort ohne Trennstrich umbrechen – nur an einer weichen Trennstelle
 * (U+00AD) ist ein Umbruch erlaubt. Gemessen je Zeichen über die Zeilenlage; der Trennstrich kann dem ersten Zeichen danach
 * zugeschlagen werden. Aufruf im Drucklayout (Fenster 794 px, Seite 688 px).
 * @param {import('playwright').Page} seite
 * @param {string} wurzel CSS-Selektor der geprüften Bereiche
 * @param {{ bildschirm?: boolean }} [o] R47: am Bildschirm zählt nur Text ohne `hyphens: auto` (dort trennt ein Browser mit
 *   Wörterbuch mit Strich; der vorinstallierte Chromium hat keins und bräche dort immer)
 * @returns {Promise<string[]>}
 */
export async function wortbrueche(seite, wurzel, o = {}) {
  return seite.evaluate(([sel, bildschirm]) => {
    /** @type {string[]} */
    const aus = [];
    // CI (Chrome 153) trennt mit Wörterbuch und sichtbarem Strich, der vorinstallierte Chromium hat keins: gemessen wird
    // ohne automatische Trennung, damit beide dasselbe prüfen – Brüche außerhalb der eigenen Trennstellen
    /** @type {Set<Element>} */
    const mitAuto = new Set();
    if (bildschirm) for (const w of document.querySelectorAll(sel)) for (const el of [w, ...w.querySelectorAll('*')]) if (getComputedStyle(el).hyphens === 'auto') mitAuto.add(el);
    const ohneAuto = document.createElement('style');
    ohneAuto.textContent = '* { hyphens: manual !important; -webkit-hyphens: manual !important; }';
    document.head.append(ohneAuto);
    const rg = document.createRange();
    for (const w of document.querySelectorAll(sel)) {
      const gang = document.createTreeWalker(w, NodeFilter.SHOW_TEXT);
      for (let n = gang.nextNode(); n !== null; n = gang.nextNode()) {
        if (n.parentElement === null || n.parentElement.getClientRects().length === 0 || mitAuto.has(n.parentElement)) continue;
        for (const m of (n.textContent ?? '').matchAll(/[\p{L}\p{N}\u00ad]{4,}/gu)) {
          const wort = m[0];
          const start = m.index ?? 0;
          let vorY = /** @type {number | null} */ (null);
          for (let i = 0; i < wort.length; i++) {
            rg.setStart(n, start + i); rg.setEnd(n, start + i + 1);
            const r = [...rg.getClientRects()].find((x) => x.width > 0);
            if (r === undefined) continue;
            if (vorY !== null && r.top > vorY + 2 && !wort.slice(Math.max(0, i - 2), i).includes('\u00ad')) { aus.push(wort.replace(/\u00ad/gu, '')); break; }
            vorY = r.top;
          }
        }
      }
    }
    ohneAuto.remove();
    return aus;
  }, /** @type {[string, boolean]} */ ([wurzel, o.bildschirm === true]));
}
