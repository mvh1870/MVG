// Logo-Werkzeug (P0.3): vektorisiert das Original-PNG des BM-Logos mit potrace.
//
// Quelle: quellen/whitepaper/v1.2/bilder/image1.png (weißes Logo auf transparentem Grund, 698×937).
// Ergebnis in quellen/marke/:
//   logo-original.png        – unveränderte Kopie des Originals
//   logo-bm.svg              – Bildmarke + Wortmarke „BAUHERR MENTOREN“
//   logo-bm-bildmarke.svg    – nur Bildmarke (Türme über Brückenbogen)
//
// Warum ein eigener PNG-Decoder: potrace liest Bilder über Jimp und legt transparente Bereiche
// auf Weiß – ein weißes Logo auf transparentem Grund verschwände dabei vollständig. Wir lesen
// deshalb den Alphakanal selbst (node:zlib), machen daraus eine Graustufen-Maske (Logo schwarz
// auf Weiß) und geben sie potrace als PNG-Puffer.
//
// Warum in Originalgröße und ohne Vergrößerung: der Alphakanal des Originals ist praktisch
// binär (nur rund 50 Pixel mit Zwischenwerten), die schrägen Kanten sind Pixeltreppen. Eine
// Vergrößerung vor dem Nachzeichnen macht aus den Treppen Wellen; in Originalgröße behandelt
// potrace sie als Rauschen und legt gerade Kanten. alphaMax 0,8 hält die Ecken der Türme spitz,
// ohne die Bögen der Brücke und der Buchstaben zu brechen (visuell geprüft, tmp/logo-vergleich.png).
//
// Deterministisch: feste Schwelle, feste potrace-Parameter, feste Rundung. Zweimal ausgeführt
// entstehen byte-gleiche Dateien.
//
// Aufruf:  node werkzeuge/logo.mjs               – schreibt die drei Dateien
//          node werkzeuge/logo.mjs --vergleich   – zusätzlich tmp/logo-vergleich.png (Chrome nötig)

import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync, inflateSync } from 'node:zlib';
import { createRequire } from 'node:module';
import { istHauptmodul } from './haupt.mjs';

const require = createRequire(import.meta.url);
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const QUELLE = 'quellen/whitepaper/v1.2/bilder/image1.png';
export const ZIELORDNER = 'quellen/marke';

/** Alpha-Schwelle (0–255): halbe Deckung ist Kante. */
const SCHWELLE = 128;
/** Nachkommastellen im SVG-Pfad (Originalpixel). 1 Stelle = 0,1 px, weit unter Sichtbarkeit. */
const STELLEN = 1;
/** Rand um die Form im viewBox (Originalpixel), damit Kurven nicht am Rand kleben. */
const RAND = 2;

const POTRACE_PARAMETER = {
  turnPolicy: 'minority',
  turdSize: 8,
  alphaMax: 0.8,
  optCurve: true,
  optTolerance: 0.2,
  threshold: 128,
  blackOnWhite: true,
};

// ---------------------------------------------------------------------------------------------
// PNG lesen und schreiben (nur was hier gebraucht wird: 8 bit, ohne Interlacing)
// ---------------------------------------------------------------------------------------------

const PNG_SIGNATUR = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const KANAELE = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

/**
 * Dekodiert ein PNG (Bittiefe 8, Farbtypen 0/2/3/4/6, ohne Interlacing) nach RGBA.
 * @param {Buffer} puffer
 * @returns {{ breite: number, hoehe: number, rgba: Uint8Array }}
 */
export function dekodierePng(puffer) {
  if (!puffer.subarray(0, 8).equals(PNG_SIGNATUR)) throw new Error('Kein PNG');
  let breite = 0, hoehe = 0, tiefe = 0, farbtyp = 0, interlace = 0;
  /** @type {Buffer[]} */
  const idat = [];
  /** @type {Buffer | null} */
  let palette = null;
  /** @type {Buffer | null} */
  let trns = null;
  let o = 8;
  while (o < puffer.length) {
    const laenge = puffer.readUInt32BE(o);
    const typ = puffer.toString('ascii', o + 4, o + 8);
    const daten = puffer.subarray(o + 8, o + 8 + laenge);
    if (typ === 'IHDR') {
      breite = daten.readUInt32BE(0);
      hoehe = daten.readUInt32BE(4);
      tiefe = daten[8] ?? 0;
      farbtyp = daten[9] ?? 0;
      interlace = daten[12] ?? 0;
    } else if (typ === 'PLTE') palette = daten;
    else if (typ === 'tRNS') trns = daten;
    else if (typ === 'IDAT') idat.push(daten);
    else if (typ === 'IEND') break;
    o += 12 + laenge;
  }
  const kanaele = KANAELE[/** @type {0|2|3|4|6} */ (farbtyp)];
  if (tiefe !== 8 || !kanaele || interlace !== 0) {
    throw new Error(`PNG-Format nicht unterstützt (Tiefe ${tiefe}, Farbtyp ${farbtyp}, Interlace ${interlace})`);
  }
  const roh = inflateSync(Buffer.concat(idat));
  const zeile = breite * kanaele;
  const bild = new Uint8Array(hoehe * zeile);
  for (let y = 0; y < hoehe; y++) {
    const filter = roh[y * (zeile + 1)];
    const ein = y * (zeile + 1) + 1;
    const aus = y * zeile;
    for (let x = 0; x < zeile; x++) {
      const a = x >= kanaele ? bild[aus + x - kanaele] ?? 0 : 0;
      const b = y > 0 ? bild[aus - zeile + x] ?? 0 : 0;
      const c = x >= kanaele && y > 0 ? bild[aus - zeile + x - kanaele] ?? 0 : 0;
      const r = roh[ein + x] ?? 0;
      let v;
      switch (filter) {
        case 0: v = r; break;
        case 1: v = r + a; break;
        case 2: v = r + b; break;
        case 3: v = r + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = r + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error(`Unbekannter PNG-Filter ${filter} in Zeile ${y}`);
      }
      bild[aus + x] = v & 255;
    }
  }
  const rgba = new Uint8Array(breite * hoehe * 4);
  for (let i = 0; i < breite * hoehe; i++) {
    const q = i * kanaele, z = i * 4;
    if (farbtyp === 6) { rgba[z] = bild[q] ?? 0; rgba[z + 1] = bild[q + 1] ?? 0; rgba[z + 2] = bild[q + 2] ?? 0; rgba[z + 3] = bild[q + 3] ?? 0; }
    else if (farbtyp === 2) { rgba[z] = bild[q] ?? 0; rgba[z + 1] = bild[q + 1] ?? 0; rgba[z + 2] = bild[q + 2] ?? 0; rgba[z + 3] = 255; }
    else if (farbtyp === 0) { rgba[z] = rgba[z + 1] = rgba[z + 2] = bild[q] ?? 0; rgba[z + 3] = 255; }
    else if (farbtyp === 4) { rgba[z] = rgba[z + 1] = rgba[z + 2] = bild[q] ?? 0; rgba[z + 3] = bild[q + 1] ?? 0; }
    else {
      const idx = bild[q] ?? 0;
      rgba[z] = palette?.[idx * 3] ?? 0; rgba[z + 1] = palette?.[idx * 3 + 1] ?? 0; rgba[z + 2] = palette?.[idx * 3 + 2] ?? 0;
      rgba[z + 3] = trns && idx < trns.length ? trns[idx] ?? 255 : 255;
    }
  }
  return { breite, hoehe, rgba };
}

/**
 * Kodiert ein Graustufenbild (8 bit) als PNG – deterministisch (feste Kompressionsstufe, keine Zeitstempel).
 * @param {number} breite
 * @param {number} hoehe
 * @param {Uint8Array} grau
 */
export function kodierePngGrau(breite, hoehe, grau) {
  const roh = Buffer.alloc(hoehe * (breite + 1));
  for (let y = 0; y < hoehe; y++) {
    roh[y * (breite + 1)] = 0;
    Buffer.from(grau.buffer, grau.byteOffset + y * breite, breite).copy(roh, y * (breite + 1) + 1);
  }
  /** @param {string} typ @param {Buffer} daten */
  const block = (typ, daten) => {
    const kopf = Buffer.alloc(8);
    kopf.writeUInt32BE(daten.length, 0);
    kopf.write(typ, 4, 'ascii');
    const pruef = Buffer.alloc(4);
    pruef.writeUInt32BE(crc32(Buffer.concat([kopf.subarray(4), daten])) >>> 0, 0);
    return Buffer.concat([kopf, daten, pruef]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(breite, 0);
  ihdr.writeUInt32BE(hoehe, 4);
  ihdr[8] = 8; ihdr[9] = 0; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([PNG_SIGNATUR, block('IHDR', ihdr), block('IDAT', deflateSync(roh, { level: 9 })), block('IEND', Buffer.alloc(0))]);
}

// ---------------------------------------------------------------------------------------------
// Maske, Zuschnitt, Trennung
// ---------------------------------------------------------------------------------------------

/** @param {{ breite: number, hoehe: number, rgba: Uint8Array }} bild */
export function alphaKanal(bild) {
  const a = new Uint8Array(bild.breite * bild.hoehe);
  for (let i = 0; i < a.length; i++) a[i] = bild.rgba[i * 4 + 3] ?? 0;
  return a;
}

/**
 * Zeilen mit sichtbarer Deckung (Alpha ≥ Schwelle) zählen; liefert je Zeile die Anzahl.
 * @param {Uint8Array} alpha @param {number} breite @param {number} hoehe
 */
function zeilenBelegung(alpha, breite, hoehe) {
  const n = new Array(hoehe).fill(0);
  for (let y = 0; y < hoehe; y++) for (let x = 0; x < breite; x++) if ((alpha[y * breite + x] ?? 0) >= SCHWELLE) n[y]++;
  return n;
}

/**
 * Begrenzungsrahmen der Deckung innerhalb eines Zeilenbereichs.
 * @param {Uint8Array} alpha @param {number} breite @param {number} y0 @param {number} y1 (exklusiv)
 */
function rahmen(alpha, breite, y0, y1) {
  let x0 = breite, x1 = -1, ya = -1, yb = -1;
  for (let y = y0; y < y1; y++) for (let x = 0; x < breite; x++) {
    if ((alpha[y * breite + x] ?? 0) >= 16) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (ya < 0) ya = y;
      yb = y;
    }
  }
  if (x1 < 0) throw new Error('Leerer Bereich');
  return { x: x0, y: ya, b: x1 - x0 + 1, h: yb - ya + 1 };
}

/**
 * Sucht die breiteste leere Zeilenlücke zwischen Bildmarke und Wortmarke (untere Hälfte).
 * @returns {{ von: number, bis: number } | null} leere Zeilen [von, bis)
 */
export function findeTrennfuge(alpha, breite, hoehe) {
  const n = zeilenBelegung(alpha, breite, hoehe);
  let beste = null, start = -1;
  for (let y = Math.floor(hoehe / 2); y <= hoehe; y++) {
    const leer = y < hoehe && n[y] === 0;
    if (leer && start < 0) start = y;
    if (!leer && start >= 0) {
      if (y < hoehe && (!beste || y - start > beste.bis - beste.von)) beste = { von: start, bis: y };
      start = -1;
    }
  }
  return beste;
}

/**
 * Schneidet einen Bereich (mit Rand) aus dem Alphakanal und erzeugt die Maske
 * (Logo schwarz = 0, Grund weiß = 255).
 */
function maske(alpha, breite, hoehe, bereich) {
  const B = bereich.b + 2 * RAND, H = bereich.h + 2 * RAND;
  const grau = new Uint8Array(B * H).fill(255);
  for (let Y = 0; Y < H; Y++) {
    const qy = Y + bereich.y - RAND;
    if (qy < 0 || qy >= hoehe) continue;
    for (let X = 0; X < B; X++) {
      const qx = X + bereich.x - RAND;
      if (qx >= 0 && qx < breite) grau[Y * B + X] = 255 - (alpha[qy * breite + qx] ?? 0);
    }
  }
  return { B, H, grau };
}

// ---------------------------------------------------------------------------------------------
// Nachzeichnen
// ---------------------------------------------------------------------------------------------

/**
 * @param {Buffer} png
 * @returns {Promise<string>} Pfaddaten (d) in Pixeln des Ausschnitts
 */
function zeichneNach(png) {
  const { Potrace } = require('potrace');
  const p = new Potrace(POTRACE_PARAMETER);
  return new Promise((ok, fehler) => {
    p.loadImage(png, (/** @type {Error | null} */ err) => {
      if (err) { fehler(err); return; }
      const tag = p.getPathTag('#000');
      const d = /d="([^"]*)"/.exec(tag)?.[1];
      if (!d) { fehler(new Error('potrace lieferte keinen Pfad')); return; }
      ok(d);
    });
  });
}

/** Rundet alle Zahlen im Pfad und entfernt überflüssige Zeichen. */
export function verdichtePfad(d) {
  const f = 10 ** STELLEN;
  return d
    .replace(/-?\d+(?:\.\d+)?/g, (z) => {
      const v = Math.round(Number(z) * f) / f;
      return String(Object.is(v, -0) ? 0 : v);
    })
    .replace(/,\s*/g, ' ')
    .replace(/\s*([MCLZ])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .replace(/ -/g, '-')
    .trim();
}

/**
 * @param {string} d @param {number} b @param {number} h @param {string} titel
 */
function svgDatei(d, b, h, titel) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${b} ${h}" width="${b}" height="${h}" fill="currentColor" role="img" aria-label="${titel}">`
    + `<title>${titel}</title>`
    + `<path fill-rule="evenodd" d="${d}"/>`
    + '</svg>\n';
}

/**
 * Erzeugt die Logo-Dateien.
 * @param {{ quelle?: string, ziel?: string }} [optionen]
 * @returns {Promise<{ dateien: string[], trennfuge: { von: number, bis: number } | null, masse: Record<string, { b: number, h: number, bytes: number, x: number, y: number }> }>}
 */
export async function erzeugeLogo({ quelle = QUELLE, ziel = ZIELORDNER } = {}) {
  const quellPfad = resolve(WURZEL, quelle);
  const zielPfad = resolve(WURZEL, ziel);
  await mkdir(zielPfad, { recursive: true });
  const puffer = await readFile(quellPfad);
  const bild = dekodierePng(puffer);
  const alpha = alphaKanal(bild);
  const fuge = findeTrennfuge(alpha, bild.breite, bild.hoehe);

  /** @type {Record<string, { b: number, h: number, bytes: number, x: number, y: number }>} */
  const masse = {};
  /** @type {string[]} */
  const dateien = [];

  /** @param {string} name @param {number} y0 @param {number} y1 @param {string} titel */
  const erzeuge = async (name, y0, y1, titel) => {
    const bereich = rahmen(alpha, bild.breite, y0, y1);
    const m = maske(alpha, bild.breite, bild.hoehe, bereich);
    const d = verdichtePfad(await zeichneNach(kodierePngGrau(m.B, m.H, m.grau)));
    const text = svgDatei(d, m.B, m.H, titel);
    const pfad = join(zielPfad, name);
    await writeFile(pfad, text, 'utf8');
    masse[name] = { b: m.B, h: m.H, bytes: Buffer.byteLength(text), x: bereich.x - RAND, y: bereich.y - RAND };
    dateien.push(pfad);
  };

  await erzeuge('logo-bm.svg', 0, bild.hoehe, 'Bauherr Mentoren');
  if (fuge) await erzeuge('logo-bm-bildmarke.svg', 0, fuge.von, 'Bauherr Mentoren (Bildmarke)');

  const original = join(zielPfad, 'logo-original.png');
  await copyFile(quellPfad, original);
  dateien.push(original);
  return { dateien, trennfuge: fuge, masse };
}

/**
 * Rendert Original (auf Navy) und SVG (weiß auf Navy, und navy auf Weiß) nebeneinander.
 * Braucht Playwright und einen lokalen Chrome.
 * @param {string} bildPfad Ziel-PNG
 */
export async function vergleichsbild(bildPfad = resolve(WURZEL, 'tmp/logo-vergleich.png')) {
  const { starteBrowser } = await import('./oberflaeche.mjs');
  const original = (await readFile(resolve(WURZEL, ZIELORDNER, 'logo-original.png'))).toString('base64');
  const svg = await readFile(resolve(WURZEL, ZIELORDNER, 'logo-bm.svg'), 'utf8');
  const marke = await readFile(resolve(WURZEL, ZIELORDNER, 'logo-bm-bildmarke.svg'), 'utf8').catch(() => '');
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;display:flex;gap:16px;padding:16px;background:#888;font:14px sans-serif}
    figure{margin:0;padding:12px;background:#0C1C33;color:#fff}
    figure.hell{background:#fff;color:#0C1C33}
    img,svg{height:420px;width:auto;display:block}
    figcaption{margin-top:6px}
  </style>
  <figure><img src="data:image/png;base64,${original}"><figcaption>Original (PNG)</figcaption></figure>
  <figure>${svg}<figcaption>SVG, currentColor weiß</figcaption></figure>
  <figure class="hell">${svg}<figcaption>SVG, currentColor navy</figcaption></figure>
  <figure class="hell">${marke}<figcaption>Bildmarke</figcaption></figure>`;
  // Dieselbe Suchreihenfolge wie die Oberflächenprüfung (Playwright-Chromium → Chrome → Edge → Cloud-Installation).
  const start = await starteBrowser();
  if (!start.browser) throw new Error(`kein Browser – ${start.grund}`);
  const browser = start.browser;
  try {
    const seite = await browser.newPage({ viewport: { width: 1500, height: 500 } });
    await seite.setContent(html);
    await mkdir(dirname(bildPfad), { recursive: true });
    await seite.screenshot({ path: bildPfad, fullPage: true });
  } finally {
    await browser.close();
  }
  return bildPfad;
}

if (istHauptmodul(import.meta.url)) {
  const erg = await erzeugeLogo();
  for (const [name, m] of Object.entries(erg.masse)) console.log(`${name}: viewBox ${m.b}×${m.h} (Ausschnitt ab ${m.x}/${m.y} im Original), ${m.bytes} Bytes`);
  console.log(erg.trennfuge ? `Trennfuge Bild-/Wortmarke: Zeilen ${erg.trennfuge.von}–${erg.trennfuge.bis - 1}` : 'Keine Trennfuge gefunden – nur Gesamtlogo erzeugt');
  if (process.argv.includes('--vergleich')) console.log('Vergleichsbild:', await vergleichsbild());
}
