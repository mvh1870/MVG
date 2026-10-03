// Echte PDF-Messung für die Druckwege (R41): Text je Seite mit Lage, damit ein Szenario prüfen kann, ob eine Seite
// mit einer Überschrift endet – der berechnete CSS-Wert allein sagt nicht, was Chromium im Druck daraus macht.
import { inflateSync } from 'node:zlib';
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
    let tiefste = Number(hoehe);
    /** @type {Map<number, { x: number, s: string, pt: number }[]>} */
    const nachY = new Map();
    for (const it of inhalt.items) {
      if (!('str' in it) || it.str.trim() === '') continue;
      const y = Math.round(it.transform[5]);
      tiefste = Math.min(tiefste, y);
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
      // Anteil der Seite bis zur tiefsten Textzeile (Rand oben eingerechnet) – für „fast leere Seite“
      fuellung: fuellung(Number(hoehe), tiefste),
    });
  }
  await aufgabe.destroy();
  return seiten;
}


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

/**
 * r72: Weiche Trennzeichen (U+00AD) im Textlayer des PDF. pdf.js sieht sie nicht: `getTextContent` überspringt jedes Zeichen
 * der Klasse Cf, und Chromium (Skia) schreibt eine Trennstelle, an der die Zeile nicht bricht, ohnehin als Leerzeichen-Glyphe
 * mit `/Span <</ActualText <FEFF00AD>>> BDC … EMC` – Kopieren und Suchen in einem PDF-Betrachter liefern dort U+00AD. Gelesen
 * werden deshalb die Inhaltsströme selbst (Seitenbaum, FlateDecode); den Wortlaut davor und danach liefert pdf.js an seinen
 * Markierungen (`includeMarkedContent`): die n-te Span-Markierung einer Seite ist der n-te Span-BDC ihres Inhaltsstroms.
 * @param {Uint8Array} daten
 * @returns {Promise<{ seite: number, vor: string, nach: string }[]>}
 */
export async function pdfWeicheTrenner(daten) {
  const roh = Buffer.from(daten);
  const text = roh.toString('latin1');
  /** @type {Map<number, number>} Objektnummer → Lage von „n 0 obj“ */
  const lage = new Map();
  for (const m of text.matchAll(/(?<![\d])(\d+) 0 obj\b/gu)) lage.set(Number(m[1]), m.index ?? 0);
  const objekt = (/** @type {number} */ n) => { const a = lage.get(n); return a === undefined ? '' : text.slice(a, text.indexOf('endobj', a)); };
  const strom = (/** @type {number} */ n) => {
    const a = lage.get(n);
    if (a === undefined) return '';
    const kopf = text.indexOf('stream', a);
    const start = kopf + (text[kopf + 6] === '\r' ? 8 : 7);
    const ende = text.indexOf('endstream', start);
    const daten = roh.subarray(start, ende);
    return /\/FlateDecode/u.test(text.slice(a, kopf)) ? inflateSync(daten, { finishFlush: 2 }).toString('latin1') : daten.toString('latin1');
  };
  const verweise = (/** @type {string} */ s) => [...s.matchAll(/(\d+) 0 R/gu)].map((m) => Number(m[1]));
  /** @type {number[]} Seitenobjekte in Leserichtung */
  const seiten = [];
  const besuche = (/** @type {number} */ n) => {
    const o = objekt(n);
    if (/\/Type\s*\/Pages\b/u.test(o)) for (const k of verweise(o.match(/\/Kids\s*\[([^\]]*)\]/u)?.[1] ?? '')) besuche(k);
    else if (/\/Type\s*\/Page\b/u.test(o)) seiten.push(n);
  };
  const katalog = [...lage.keys()].find((n) => /\/Type\s*\/Catalog\b/u.test(objekt(n)));
  const wurzel = katalog === undefined ? undefined : Number(objekt(katalog).match(/\/Pages\s+(\d+) 0 R/u)?.[1]);
  if (wurzel !== undefined) besuche(wurzel);
  const aufgabe = getDocument({ data: new Uint8Array(daten), useSystemFonts: false, isEvalSupported: false, disableFontFace: true, verbosity: 0 });
  const dok = await aufgabe.promise;
  /** @type {{ seite: number, vor: string, nach: string }[]} */
  const aus = [];
  for (const [i, n] of seiten.entries()) {
    const o = objekt(n);
    const inhalt = o.match(/\/Contents\s*(\[[^\]]*\]|\d+ 0 R)/u)?.[1] ?? '';
    const ops = verweise(inhalt).map(strom).join('\n');
    // Span-BDCs in Reihenfolge, je mit ihrem ActualText (UTF-16BE als Hex oder Literal)
    const spans = [...ops.matchAll(/\/Span\s*(<<[\s\S]*?>>|\/\w+)\s*BDC/gu)].map((m) => {
      const hex = m[1]?.match(/\/ActualText\s*<([0-9A-Fa-f\s]*)>/u)?.[1]?.replace(/\s/gu, '');
      if (hex !== undefined) return String.fromCharCode(...(hex.match(/..../gu) ?? []).map((x) => parseInt(x, 16))).replace(/^\ufeff/u, '');
      return m[1]?.match(/\/ActualText\s*\(((?:\\.|[^\\)])*)\)/u)?.[1] ?? '';
    });
    if (!spans.some((t) => t.includes('\u00ad'))) continue;
    const marken = (await (await dok.getPage(i + 1)).getTextContent({ includeMarkedContent: true })).items;
    let k = -1;
    marken.forEach((it, j) => {
      if (!('type' in it) || it.type !== 'beginMarkedContentProps' || it.tag !== 'Span') return;
      k += 1;
      if (!(spans[k] ?? '').includes('\u00ad')) return;
      // bricht die Zeile an der Trennstelle, steht im Span der sichtbare Strich – der Wortlaut geht in der nächsten Zeile weiter
      const ohne = /^[\s\-\u2010\u2011]*$/u;
      const str = (/** @type {number} */ d) => { for (let x = j + d; x >= 0 && x < marken.length; x += d) { const m = marken[x]; if (m !== undefined && 'str' in m && !ohne.test(m.str)) return m.str; } return ''; };
      aus.push({ seite: i + 1, vor: str(-1).match(/\p{L}*$/u)?.[0] ?? '', nach: str(1).match(/^[\s\-\u2010\u2011]*(\p{L}*)/u)?.[1] ?? '' });
    });
    // weniger Markierungen als Span-BDCs: die Stelle zählt trotzdem (ohne Wortlaut)
    const fehlend = spans.slice(k + 1).filter((t) => t.includes('\u00ad')).length;
    for (let f = 0; f < fehlend; f++) aus.push({ seite: i + 1, vor: '', nach: '' });
  }
  await aufgabe.destroy();
  return aus;
}
