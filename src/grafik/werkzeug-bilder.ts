/*
 * Kleine Grafiken der vier neuen Explore-Werkzeuge (P18.3/P18.4, Konzept WERKZEUGE-P18 Abschnitt 6): Ampel (A, D),
 * Messlatte mit vier Grenzen (C), Mini-Matrix 5 × 5 (C), Seitenmesser (D). Rein (Zeichenketten), deterministisch, ohne
 * fremde Ressourcen, ohne Farbwerte (nur Klassen `wb-*`, gestaltet in src/stil/grafik.css) und ohne Kennungen oder
 * url(#…): dieselbe Grafik darf mehrfach auf einer Seite stehen (Bildschirm und Druckbogen). Jede Grafik trägt
 * role="img" und eine Beschreibung aus den Werten; die Bedeutung steht zusätzlich als Wort daneben (Farbe nie allein).
 */
import type { Ampel } from '../werkzeuge/gemeinsam.ts';
import { matrixFeldKlasse } from './figuren.ts';

const r1 = (n: number): number => Math.round(n * 10) / 10;
const re = (k: string, x: number, y: number, b: number, h: number, rund = 0): string =>
  `<rect class="${k}" x="${r1(x)}" y="${r1(y)}" width="${r1(b)}" height="${r1(h)}"${rund > 0 ? ` rx="${rund}"` : ''}/>`;
const kr = (k: string, cx: number, cy: number, r: number): string => `<circle class="${k}" cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}"/>`;
const pf = (k: string, d: string): string => `<path class="${k}" d="${d}"/>`;
const tx = (k: string, x: number, y: number, t: string, anker: 'start' | 'middle' | 'end' = 'middle'): string =>
  `<text class="${k}" x="${r1(x)}" y="${r1(y)}" text-anchor="${anker}">${t.replace(/&/gu, '&amp;').replace(/</gu, '&lt;')}</text>`;
const maske = (t: string): string => t.replace(/&/gu, '&amp;').replace(/"/gu, '&quot;').replace(/</gu, '&lt;');

function svg(klasse: string, breite: number, hoehe: number, px: number, beschreibung: string, inhalt: string): string {
  const b = maske(beschreibung);
  const h = Math.round((px * hoehe) / breite);
  return `<svg class="wb ${klasse}" viewBox="0 0 ${breite} ${hoehe}" width="${px}" height="${h}" role="img" aria-label="${b}" focusable="false" xmlns="http://www.w3.org/2000/svg"><title>${b}</title>${inhalt}</svg>`;
}

/** Ampel: senkrecht, die aktive Lampe leuchtet und trägt ein Zeichen (Kreuz, Strich, Häkchen); null = alle aus. */
export function ampelBild(stufe: Ampel | null, beschreibung: string, px = 40): string {
  const lampen: [Ampel, number, string][] = [
    ['rot', 18, 'M-5,-5L5,5M5,-5L-5,5'],
    ['gelb', 48, 'M-6,0H6'],
    ['gruen', 78, 'M-6,0.5L-2,4.5L6,-4.5'],
  ];
  let s = re('wb-gehaeuse', 2, 2, 36, 92, 10);
  for (const [farbe, y, zeichen] of lampen) {
    const an = farbe === stufe;
    s += kr(an ? `wb-lampe-${farbe}` : 'wb-lampe-aus', 20, y, 12);
    if (an) s += `<g transform="translate(20 ${y})">${pf('wb-zeichen', zeichen)}</g>`;
  }
  return svg('wb-ampel', 40, 96, px, beschreibung, s);
}

/** Lage eines Werts auf der Messlatte: fünf gleich breite Stufen; innerhalb einer Stufe linear, Stufe 5 bis zum Anderthalbfachen der vierten Grenze. */
function lage(wert: number, g: readonly number[], x0: number, breite: number): number {
  const grenzen = [0, ...g.slice(0, 4)];
  const ende = (g[3] ?? 1) * 1.5;
  let stufe = grenzen.findIndex((_, i) => i > 0 && wert <= (grenzen[i] ?? 0));
  if (stufe < 0) stufe = 5;
  const von = grenzen[stufe - 1] ?? 0;
  const bis = stufe === 5 ? ende : grenzen[stufe] ?? ende;
  const anteil = bis > von ? Math.min(1, Math.max(0, (wert - von) / (bis - von))) : 0;
  return x0 + breite * (stufe - 1 + anteil);
}

export interface MesslatteDaten {
  /** vier Grenzen (gültig) */
  grenzen: readonly number[];
  /** kurze Beschriftung je Grenze (z. B. „1,5 Mio.“) */
  beschriftung: readonly string[];
  /** Wert oder Spanne; null = kein Wert (unbekannt, trifft nicht zu) */
  wert: { von: number; bis: number } | null;
  /** Stufenbereich des Werts (für die Färbung) */
  stufen: { von: number; bis: number } | null;
  /** genau auf einer Grenze (Klammer an der Kerbe) */
  aufGrenze: boolean;
}

/** Messlatte: waagerecht, fünf Stufen mit vier Kerben; Wert als Marke, Spanne als Balken, Grenzwert-Treffer mit Klammer. */
export function messlatteBild(d: MesslatteDaten, beschreibung: string, px = 300): string {
  const x0 = 10;
  const seg = 56;
  let s = re('wb-latte', x0, 18, seg * 5, 16, 3);
  for (let i = 1; i <= 5; i++) {
    const an = d.stufen !== null && i >= d.stufen.von && i <= d.stufen.bis;
    s += re(an ? 'wb-stufe-an' : 'wb-stufe', x0 + seg * (i - 1) + 1, 19, seg - 2, 14, 2);
    s += tx(an ? 'wb-ziffer-an' : 'wb-ziffer', x0 + seg * (i - 0.5), 30, String(i));
  }
  for (let i = 1; i <= 4; i++) {
    const x = x0 + seg * i;
    s += pf('wb-kerbe', `M${x},14V38`) + tx('wb-beschriftung', x, 50, d.beschriftung[i - 1] ?? '');
  }
  if (d.wert !== null) {
    const a = lage(d.wert.von, d.grenzen, x0, seg);
    const b = lage(d.wert.bis, d.grenzen, x0, seg);
    if (b - a > 1) s += re('wb-spanne', a, 35, b - a, 4, 2);
    for (const x of b - a > 1 ? [a, b] : [a]) s += pf('wb-marke', `M${r1(x - 6)},4H${r1(x + 6)}L${r1(x)},15Z`);
    if (d.aufGrenze) s += pf('wb-grenze', `M${r1(a - 9)},12V40M${r1(a + 9)},12V40M${r1(a - 9)},40H${r1(a + 9)}`);
  }
  return svg('wb-messlatte', 300, 56, px, beschreibung, s);
}

export interface MatrixDaten {
  feld: { w: number; a: number } | null;
  bis: { w: number; a: number } | null;
  nachObenOffen: boolean;
}

/** Mini-Matrix 5 × 5 (oben Auswirkung 5, links Wahrscheinlichkeit 1): Feld markiert, Bereich gestrichelt, „nach oben offen“ als Pfeil, offen als Fragezeichen. */
export function miniMatrixBild(d: MatrixDaten, beschreibung: string, px = 150): string {
  const x0 = 16;
  const y0 = 4;
  const z = 22;
  const lx = (w: number): number => x0 + (w - 1) * (z + 2);
  const ly = (a: number): number => y0 + (5 - a) * (z + 2);
  let s = '';
  for (let a = 5; a >= 1; a--) for (let w = 1; w <= 5; w++) s += re(`wb-m-${matrixFeldKlasse(w, a)}`, lx(w), ly(a), z, z, 3);
  s += tx('wb-achse', 6, ly(3) + 15, 'A') + tx('wb-achse', lx(3) + z / 2, 136, 'W');
  if (d.feld === null) return svg('wb-matrix', 140, 140, px, beschreibung, s + tx('wb-frage', lx(3) + z / 2, ly(3) + 17, '?'));
  if (d.bis !== null) {
    const wl = Math.min(d.feld.w, d.bis.w), wr = Math.max(d.feld.w, d.bis.w), ao = Math.max(d.feld.a, d.bis.a), au = Math.min(d.feld.a, d.bis.a);
    s += re('wb-bereich', lx(wl) - 2, ly(ao) - 2, (wr - wl) * (z + 2) + z + 4, (ao - au) * (z + 2) + z + 4, 4);
  }
  const fx = lx(d.feld.w);
  const fy = ly(d.feld.a);
  s += re('wb-feld', fx, fy, z, z, 3) + kr('wb-punkt', fx + z / 2, fy + z / 2, 4);
  if (d.nachObenOffen && d.feld.a < 5) {
    const x = fx + z / 2;
    s += pf('wb-pfeil', `M${x},${fy - 2}V${y0 + 6}`) + pf('wb-pfeil-spitze', `M${x - 5},${y0 + 8}L${x},${y0 - 1}L${x + 5},${y0 + 8}Z`);
  }
  return svg('wb-matrix', 140, 140, px, beschreibung, s);
}

/** Seitenmesser: Umriss einer Seite, der sich mit dem geschätzten Platzbedarf füllt; über eine Seite läuft er sichtbar über. */
export function seitenmesserBild(anteil: number, beschreibung: string, px = 60): string {
  const a = Number.isFinite(anteil) ? Math.max(0, anteil) : 0;
  const x = 8, y = 16, b = 44, h = 64;
  const voll = Math.min(1, a);
  let s = re('wb-seite', x, y, b, h, 3);
  s += re(a > 1 ? 'wb-fuellung-zu' : 'wb-fuellung', x + 2, y + h - 2 - (h - 4) * voll, b - 4, (h - 4) * voll, 2);
  for (let i = 0; i < 6; i++) s += re('wb-zeile', x + 7, y + 8 + i * 9, b - 14 - (i % 2) * 8, 2.4, 1.2);
  if (a > 1) {
    const ueber = Math.min(14, (a - 1) * h);
    s += re('wb-ueber', x + 4, y - ueber - 1, b - 8, ueber, 2);
  }
  return svg('wb-seitenmesser', 60, 84, px, beschreibung, s);
}
