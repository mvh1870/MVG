// Abbildungs-Werkzeug (P14.1, O-32, L-77): die 13 Inhaltsabbildungen der DOCX V1.2 als WebP für
// Governance Kompass.
//
// Quelle: quellen/whitepaper/v1.2/bilder/imageN.* – unverändert, Prüfsumme aus whitepaper.json.
// Beschreibung je Abbildung: inhalte/abbildungen/abb-N.yaml (docs/INHALTSFORMAT.md 4.6):
//   id, quelle, titel, alt, angeglichen (Beschriftungen, die im Bild überdeckt werden).
// Ergebnis: inhalte/abbildungen/abb-N.webp und inhalte/abbildungen/stand.json (Prüfsumme der Eingabe
// je Bild – `inhalte --pruefe` meldet ein Bild als veraltet, wenn Quelle oder Überdeckungen sich ändern).
//
// Warum im Bild überdecken: Die Abbildungen tragen Beschriftungen aus einer älteren Begriffswelt
// („G0–G5“ und andere verbotene Begriffe, docs/BEGRIFFE.md). O-14 lässt sie nirgends zu. Jede
// Überdeckung füllt ein Rechteck (Koordinaten in Pixeln des Originals) mit der Hintergrundfarbe und
// schreibt den Begriff des Texts hinein; der Beleg (Absatz-ID) steht in der YAML-Datei.
//
// Gezeichnet wird in Chromium (Playwright, schon Entwicklungs-Abhängigkeit): Canvas in Originalgröße,
// Überdeckungen, dann auf höchstens BREITE Pixel verkleinert und als WebP (QUALITAET) kodiert. Schriften
// kommen aus @fontsource (IBM Plex Sans, Barlow Condensed) – keine Systemschrift, damit das Ergebnis
// auf jedem Rechner gleich aussieht. Zweimal ausgeführt entstehen byte-gleiche Dateien (gleiche
// Chromium-Version vorausgesetzt; der Bau selbst braucht keinen Browser, er nimmt die WebP-Dateien).
//
// Aufruf:  node werkzeuge/abbildungen.mjs                – alle Abbildungen
//          node werkzeuge/abbildungen.mjs abb-6 abb-10   – nur diese
//          node werkzeuge/abbildungen.mjs --pruefe        – nichts schreiben, nur Stand vergleichen
//          node werkzeuge/abbildungen.mjs --vorschau abb-6 – nur die Vorschau in tmp/ (kein WebP, kein Stand)
//          node werkzeuge/abbildungen.mjs --raster abb-6 x y b h [--nach] – Ausschnitt mit Koordinatenraster
//                                                   (--nach: aus der Vorschau nach der Überdeckung)
// Vorschau zur Sichtprüfung in tmp/abbildungen/: abb-N.png (ganzes Bild nach der Überdeckung) und
// abb-N-K.png je Überdeckung K (links Original, rechts Ergebnis, doppelt vergrößert).

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { istHauptmodul } from './haupt.mjs';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const ORDNER = 'inhalte/abbildungen';
export const QUELLORDNER = 'quellen/whitepaper/v1.2';
export const STAND = `${ORDNER}/stand.json`;
/** Ändert sich die Zeichnung (Schrift, Maße, Kodierung), steigt die Version: alle Bilder gelten als veraltet. */
export const WERKZEUG_VERSION = 1;
/** größte Breite der Ausgabe in Pixeln (Originale 1116–1448 px; Lesespalte ≈ 720 px; im Dialog bis 1200 px) */
const BREITE = 1200;
/** WebP-Qualität (0–1): Beschriftungen bleiben scharf, 13 Bilder zusammen ≈ 0,67 MB (Budget der Einzeldatei 4 MB; bei doppelter Vergrößerung geprüft) */
const QUALITAET = 0.62;
const SCHRIFTEN = {
  plex: { familie: 'IBM Plex Sans', paket: '@fontsource/ibm-plex-sans', datei: 'ibm-plex-sans-latin-{g}-normal.woff2' },
  barlow: { familie: 'Barlow Condensed', paket: '@fontsource/barlow-condensed', datei: 'barlow-condensed-latin-{g}-normal.woff2' },
};
const GEWICHTE = [400, 500, 600, 700];

/**
 * @typedef {object} Ueberdeckung
 * @property {number} x
 * @property {number} y
 * @property {number} b  Breite
 * @property {number} h  Höhe
 * @property {string} text  Begriff des Texts; „\n“ trennt Zeilen
 * @property {string} beleg  Absatz-ID
 * @property {string} [hintergrund]  #rrggbb, sonst Median des Randes
 * @property {string} [farbe]  #rrggbb, sonst die dunkelste/hellste deutliche Farbe im Rechteck
 * @property {'plex'|'barlow'} [schrift]
 * @property {number} [gewicht]
 * @property {number} [groesse]  Schriftgröße in Pixeln des Originals, sonst passend gerechnet
 * @property {'links'|'mitte'|'rechts'} [ausrichtung]
 */

/**
 * @typedef {object} Beschreibung
 * @property {string} id
 * @property {string} quelle
 * @property {string} titel
 * @property {string} alt
 * @property {Ueberdeckung[]} angeglichen
 */

/** @param {string | Buffer} x */
const sha256 = (x) => createHash('sha256').update(x).digest('hex');

/**
 * Liest alle Beschreibungen (sortiert nach Nummer). Wirft bei unlesbarem YAML.
 * @param {string} [wurzel]
 * @returns {{ datei: string, roh: any }[]}
 */
export function leseBeschreibungen(wurzel = WURZEL) {
  const ordner = path.join(wurzel, ORDNER);
  if (!existsSync(ordner)) return [];
  return readdirSync(ordner)
    .filter((n) => /^abb-\d+\.yaml$/u.test(n))
    .sort((a, b) => Number(/\d+/u.exec(a)?.[0]) - Number(/\d+/u.exec(b)?.[0]))
    .map((n) => ({ datei: `${ORDNER}/${n}`, roh: parseYaml(readFileSync(path.join(ordner, n), 'utf8')) }));
}

/**
 * Was die Pixel bestimmt: Werkzeugversion, Quelle (Prüfsumme) und die Überdeckungen in fester Ordnung.
 * Titel und Alternativtext ändern das Bild nicht.
 * @param {any} roh
 * @param {string} quellSha
 */
export function eingabeSumme(roh, quellSha) {
  const ueb = (Array.isArray(roh?.angeglichen) ? roh.angeglichen : []).map((/** @type {any} */ u) => {
    /** @type {Record<string, unknown>} */
    const aus = {};
    for (const k of ['x', 'y', 'b', 'h', 'text', 'hintergrund', 'farbe', 'schrift', 'gewicht', 'groesse', 'ausrichtung']) if (u?.[k] !== undefined) aus[k] = u[k];
    return aus;
  });
  return sha256(JSON.stringify({ v: WERKZEUG_VERSION, breite: BREITE, qualitaet: QUALITAET, quelle: quellSha, ueb }));
}

/**
 * Prüft eine Beschreibung gegen das Schema. Gibt Fehlertexte zurück (leer = gut).
 * @param {any} roh
 * @param {string} datei
 * @param {{ ids: Set<string>, abbildungen: Map<string, any> }} kontext  Absatz-IDs und Abbildungen aus whitepaper.json
 */
export function pruefeBeschreibung(roh, datei, kontext) {
  /** @type {string[]} */
  const f = [];
  const erwartet = /abb-\d+/u.exec(datei)?.[0] ?? '';
  if (roh === null || typeof roh !== 'object') return [`${datei}: keine YAML-Zuordnung`];
  const erlaubt = new Set(['id', 'quelle', 'titel', 'alt', 'angeglichen']);
  for (const k of Object.keys(roh)) if (!erlaubt.has(k)) f.push(`${datei}: unbekanntes Feld „${k}“`);
  if (roh.id !== erwartet) f.push(`${datei}: id „${roh.id}“ passt nicht zum Dateinamen (${erwartet})`);
  const abb = kontext.abbildungen.get(String(roh.id));
  if (abb === undefined) f.push(`${datei}: Abbildung „${roh.id}“ steht nicht in whitepaper.json`);
  else if (roh.quelle !== abb.datei) f.push(`${datei}: quelle „${roh.quelle}“ ≠ ${abb.datei} (whitepaper.json)`);
  for (const k of ['titel', 'alt']) if (typeof roh[k] !== 'string' || roh[k].trim() === '') f.push(`${datei}: „${k}“ fehlt`);
  if (typeof roh.alt === 'string' && roh.alt.length > 600) f.push(`${datei}: „alt“ länger als 600 Zeichen – Einzelheiten gehören in die Bildunterschrift`);
  const ueb = roh.angeglichen ?? [];
  if (!Array.isArray(ueb)) f.push(`${datei}: „angeglichen“ ist keine Liste`);
  else {
    ueb.forEach((/** @type {any} */ u, i) => {
      const o = `${datei}: angeglichen[${i}]`;
      for (const k of ['x', 'y', 'b', 'h']) if (!Number.isInteger(u?.[k]) || u[k] < 0) f.push(`${o}: „${k}“ keine ganze Zahl ≥ 0`);
      if (Number.isInteger(u?.b) && u.b < 4) f.push(`${o}: zu schmal`);
      if (Number.isInteger(u?.h) && u.h < 6) f.push(`${o}: zu niedrig`);
      if (typeof u?.text !== 'string' || u.text.trim() === '') f.push(`${o}: „text“ fehlt`);
      if (typeof u?.beleg !== 'string' || !kontext.ids.has(u.beleg)) f.push(`${o}: Beleg „${u?.beleg}“ ist keine Absatz-ID`);
      for (const k of ['hintergrund', 'farbe']) if (u?.[k] !== undefined && !/^#[0-9a-f]{6}$/iu.test(String(u[k]))) f.push(`${o}: „${k}“ nicht #rrggbb`);
      if (u?.schrift !== undefined && !(u.schrift in SCHRIFTEN)) f.push(`${o}: schrift „${u.schrift}“ (erlaubt: ${Object.keys(SCHRIFTEN).join(', ')})`);
      if (u?.gewicht !== undefined && !GEWICHTE.includes(u.gewicht)) f.push(`${o}: gewicht ${u.gewicht} (erlaubt: ${GEWICHTE.join(', ')})`);
      if (u?.groesse !== undefined && !(typeof u.groesse === 'number' && u.groesse >= 6 && u.groesse <= 120)) f.push(`${o}: groesse 6–120`);
      if (u?.ausrichtung !== undefined && !['links', 'mitte', 'rechts'].includes(u.ausrichtung)) f.push(`${o}: ausrichtung links|mitte|rechts`);
      const erlaubtU = new Set(['x', 'y', 'b', 'h', 'text', 'beleg', 'hintergrund', 'farbe', 'schrift', 'gewicht', 'groesse', 'ausrichtung']);
      for (const k of Object.keys(u ?? {})) if (!erlaubtU.has(k)) f.push(`${o}: unbekanntes Feld „${k}“`);
    });
  }
  return f;
}

/** Absatz-IDs und Abbildungen aus whitepaper.json. @param {string} wurzel */
export function ladeKontext(wurzel = WURZEL) {
  const wp = JSON.parse(readFileSync(path.join(wurzel, QUELLORDNER, 'whitepaper.json'), 'utf8'));
  /** @type {Set<string>} */
  const ids = new Set();
  /** @param {any} x */
  const sammle = (x) => {
    if (Array.isArray(x)) { for (const y of x) sammle(y); return; }
    if (x === null || typeof x !== 'object') return;
    if (typeof x.id === 'string') ids.add(x.id);
    for (const v of Object.values(x)) if (typeof v === 'object') sammle(v);
  };
  sammle(wp.kapitel);
  return { ids, abbildungen: new Map((wp.abbildungen ?? []).map((/** @type {any} */ a) => [a.id, a])) };
}

/* ------------------------------------------------------------------ Zeichnen im Browser -- */

/**
 * Läuft im Browser: zeichnet, überdeckt, verkleinert, kodiert. Rückgabe als data:-URLs.
 * @param {{ url: string, ueb: Ueberdeckung[], breite: number, qualitaet: number, schriften: Record<string, string> }} a
 */
/* c8 ignore start */
async function zeichneImBrowser(a) {
  for (const [name, url] of Object.entries(a.schriften)) {
    const [familie, gewicht] = name.split('|');
    const ff = new FontFace(familie ?? '', `url(${url})`, { weight: gewicht ?? '400' });
    await ff.load();
    document.fonts.add(ff);
  }
  const img = new Image();
  img.src = a.url;
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = /** @type {CanvasRenderingContext2D} */ (c.getContext('2d'));
  x.drawImage(img, 0, 0);
  const vorher = x.getImageData(0, 0, W, H);
  /** @param {string} hex */
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  /** @param {number[]} p */
  const hex = (p) => `#${p.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
  /** @param {number[]} p */
  const hell = (p) => 0.2126 * (p[0] ?? 0) + 0.7152 * (p[1] ?? 0) + 0.0722 * (p[2] ?? 0);
  /** @param {number[]} werte */
  const median = (werte) => { const s = [...werte].sort((m, n) => m - n); return s[Math.floor(s.length / 2)] ?? 0; };
  /** @param {number} px @param {number} py */
  const pixel = (px, py) => { const i = (py * W + px) * 4; return [vorher.data[i] ?? 0, vorher.data[i + 1] ?? 0, vorher.data[i + 2] ?? 0]; };
  const berichte = [];
  for (const u of a.ueb) {
    // Hintergrund: Median der Randpixel des Rechtecks
    let hg = u.hintergrund ? rgb(u.hintergrund) : null;
    if (hg === null) {
      const rand = [];
      for (let px = u.x; px < u.x + u.b; px++) rand.push(pixel(px, u.y), pixel(px, u.y + u.h - 1));
      for (let py = u.y; py < u.y + u.h; py++) rand.push(pixel(u.x, py), pixel(u.x + u.b - 1, py));
      hg = [0, 1, 2].map((k) => median(rand.map((p) => p[k] ?? 0)));
    }
    // Schriftfarbe: die deutlich vom Hintergrund abweichenden Pixel, davon der Median
    let fg = u.farbe ? rgb(u.farbe) : null;
    if (fg === null) {
      const lh = hell(hg);
      const deutlich = [];
      for (let py = u.y; py < u.y + u.h; py++) for (let px = u.x; px < u.x + u.b; px++) {
        const p = pixel(px, py);
        if (Math.abs(hell(p) - lh) > 90) deutlich.push(p);
      }
      fg = deutlich.length > 0 ? [0, 1, 2].map((k) => median(deutlich.map((p) => p[k] ?? 0))) : (lh > 128 ? [20, 30, 45] : [255, 255, 255]);
    }
    x.fillStyle = hex(hg);
    x.fillRect(u.x, u.y, u.b, u.h);
    const familie = u.schrift === 'barlow' ? 'Barlow Condensed' : 'IBM Plex Sans';
    const gewicht = u.gewicht ?? 500;
    const zeilen = u.text.split('\n');
    const rand = Math.max(2, Math.round(u.h * 0.1));
    let g = u.groesse ?? Math.floor((u.h - 2 * rand) / (zeilen.length * 1.12));
    const breiteBei = (/** @type {number} */ gr) => { x.font = `${gewicht} ${gr}px "${familie}"`; return Math.max(...zeilen.map((z) => x.measureText(z).width)); };
    if (u.groesse === undefined) while (g > 6 && breiteBei(g) > u.b - 2 * rand) g -= 0.5;
    x.font = `${gewicht} ${g}px "${familie}"`;
    x.fillStyle = hex(fg);
    x.textBaseline = 'middle';
    const zh = g * 1.12;
    const mitte = u.y + u.h / 2;
    zeilen.forEach((z, i) => {
      const w = x.measureText(z).width;
      const ax = u.ausrichtung === 'mitte' ? u.x + (u.b - w) / 2 : u.ausrichtung === 'rechts' ? u.x + u.b - rand - w : u.x + rand;
      x.fillText(z, ax, mitte + (i - (zeilen.length - 1) / 2) * zh);
    });
    berichte.push({ hintergrund: hex(hg), farbe: hex(fg), groesse: Math.round(g * 10) / 10, passt: breiteBei(g) <= u.b - 2 * rand + 0.5 });
  }
  // Verkleinern und kodieren
  const bw = Math.min(a.breite, W), bh = Math.round(H * bw / W);
  const aus = document.createElement('canvas');
  aus.width = bw; aus.height = bh;
  const ax = /** @type {CanvasRenderingContext2D} */ (aus.getContext('2d'));
  ax.imageSmoothingEnabled = true;
  ax.imageSmoothingQuality = 'high';
  ax.drawImage(c, 0, 0, bw, bh);
  const webp = aus.toDataURL('image/webp', a.qualitaet);
  // Vorschau: ganzes Bild und je Überdeckung Original | Ergebnis (2×)
  const png = c.toDataURL('image/png');
  const ausschnitte = a.ueb.map((u) => {
    const m = 36;
    const sx = Math.max(0, u.x - m), sy = Math.max(0, u.y - m);
    const sw = Math.min(W - sx, u.b + 2 * m), sh = Math.min(H - sy, u.h + 2 * m);
    const v = document.createElement('canvas');
    v.width = sw * 4 + 12; v.height = sh * 2;
    const vx = /** @type {CanvasRenderingContext2D} */ (v.getContext('2d'));
    vx.fillStyle = '#ff00ff';
    vx.fillRect(0, 0, v.width, v.height);
    vx.imageSmoothingEnabled = false;
    vx.drawImage(img, sx, sy, sw, sh, 0, 0, sw * 2, sh * 2);
    vx.drawImage(c, sx, sy, sw, sh, sw * 2 + 12, 0, sw * 2, sh * 2);
    return v.toDataURL('image/png');
  });
  return { webp, png, ausschnitte, berichte, breite: bw, hoehe: bh, W, H };
}
/* c8 ignore stop */

/** Browser wie werkzeuge/oberflaeche.mjs: vorinstalliertes Chromium der Cloud, sonst Playwright. */
async function starteBrowser() {
  const { chromium } = await import('playwright');
  const vorhanden = process.env['PLAYWRIGHT_BROWSERS_PATH'] ? path.join(process.env['PLAYWRIGHT_BROWSERS_PATH'], 'chromium') : null;
  if (vorhanden !== null && existsSync(vorhanden)) {
    try {
      return await chromium.launch({ headless: true, executablePath: vorhanden });
    } catch { /* weiter mit Playwright-Chromium */ }
  }
  return chromium.launch({ headless: true });
}

/** @param {string} datei */
const alsDataUrl = (datei) => {
  const endung = path.extname(datei).toLowerCase();
  const mime = endung === '.png' ? 'image/png' : endung === '.woff2' ? 'font/woff2' : 'image/jpeg';
  return `data:${mime};base64,${readFileSync(datei).toString('base64')}`;
};

/**
 * Erzeugt die WebP-Dateien (oder prüft nur den Stand).
 * @param {{ wurzel?: string, nur?: string[], pruefe?: boolean, vorschau?: boolean }} [o]
 * @returns {Promise<{ fehler: string[], geschrieben: string[], berichte: Record<string, any[]> }>}
 */
export async function erzeugeAbbildungen(o = {}) {
  const wurzel = o.wurzel ?? WURZEL;
  const kontext = ladeKontext(wurzel);
  /** @type {string[]} */
  const fehler = [];
  const beschreibungen = leseBeschreibungen(wurzel);
  for (const { datei, roh } of beschreibungen) fehler.push(...pruefeBeschreibung(roh, datei, kontext));
  if (fehler.length > 0) return { fehler, geschrieben: [], berichte: {} };
  const standPfad = path.join(wurzel, STAND);
  /** @type {{ werkzeug: number, abbildungen: Record<string, { eingabe: string, webp: string, breite: number, hoehe: number }> }} */
  const stand = existsSync(standPfad) ? JSON.parse(readFileSync(standPfad, 'utf8')) : { werkzeug: WERKZEUG_VERSION, abbildungen: {} };
  const auswahl = beschreibungen.filter(({ roh }) => o.nur === undefined || o.nur.length === 0 || o.nur.includes(roh.id));
  if (o.pruefe) {
    for (const { roh } of beschreibungen) {
      const abb = kontext.abbildungen.get(roh.id);
      const soll = eingabeSumme(roh, abb.sha256);
      const ist = stand.abbildungen[roh.id];
      const webp = path.join(wurzel, ORDNER, `${roh.id}.webp`);
      if (ist === undefined || ist.eingabe !== soll) fehler.push(`${roh.id}: Bild veraltet – node werkzeuge/abbildungen.mjs ${roh.id}`);
      else if (!existsSync(webp) || sha256(readFileSync(webp)) !== ist.webp) fehler.push(`${roh.id}.webp passt nicht zu stand.json`);
    }
    return { fehler, geschrieben: [], berichte: {} };
  }
  /** @type {Record<string, string>} */
  const schriften = {};
  for (const [, s] of Object.entries(SCHRIFTEN)) {
    for (const g of GEWICHTE) schriften[`${s.familie}|${g}`] = alsDataUrl(path.join(wurzel, 'node_modules', s.paket, 'files', s.datei.replace('{g}', String(g))));
  }
  const vorschau = path.join(wurzel, 'tmp', 'abbildungen');
  mkdirSync(vorschau, { recursive: true });
  const browser = await starteBrowser();
  /** @type {string[]} */
  const geschrieben = [];
  /** @type {Record<string, any[]>} */
  const berichte = {};
  try {
    const seite = await browser.newPage();
    for (const { roh } of auswahl) {
      const abb = kontext.abbildungen.get(roh.id);
      const quelle = path.join(wurzel, QUELLORDNER, roh.quelle);
      const inhalt = readFileSync(quelle);
      if (sha256(inhalt) !== abb.sha256) {
        fehler.push(`${roh.id}: ${roh.quelle} hat eine andere Prüfsumme als in whitepaper.json`);
        continue;
      }
      const e = await seite.evaluate(zeichneImBrowser, { url: alsDataUrl(quelle), ueb: roh.angeglichen ?? [], breite: BREITE, qualitaet: QUALITAET, schriften });
      for (const [i, u] of (roh.angeglichen ?? []).entries()) {
        if (u.x + u.b > e.W || u.y + u.h > e.H) fehler.push(`${roh.id}: angeglichen[${i}] ragt über das Bild (${e.W}×${e.H})`);
        if (!e.berichte[i]?.passt) fehler.push(`${roh.id}: angeglichen[${i}] „${u.text}“ passt nicht ins Rechteck (Schrift ${e.berichte[i]?.groesse} px)`);
      }
      const webp = Buffer.from(e.webp.split(',')[1] ?? '', 'base64');
      if (!o.vorschau) writeFileSync(path.join(wurzel, ORDNER, `${roh.id}.webp`), webp);
      writeFileSync(path.join(vorschau, `${roh.id}.png`), Buffer.from(e.png.split(',')[1] ?? '', 'base64'));
      e.ausschnitte.forEach((/** @type {string} */ d, i) => writeFileSync(path.join(vorschau, `${roh.id}-${i + 1}.png`), Buffer.from(d.split(',')[1] ?? '', 'base64')));
      stand.abbildungen[roh.id] = { eingabe: eingabeSumme(roh, abb.sha256), webp: sha256(webp), breite: e.breite, hoehe: e.hoehe };
      berichte[roh.id] = e.berichte;
      geschrieben.push(`${o.vorschau ? 'Vorschau ' : ''}${ORDNER}/${roh.id}.webp (${e.breite}×${e.hoehe}, ${Math.round(webp.length / 1024)} KB, ${(roh.angeglichen ?? []).length} Überdeckungen)`);
    }
  } finally {
    await browser.close();
  }
  if (o.vorschau) return { fehler, geschrieben, berichte };
  stand.werkzeug = WERKZEUG_VERSION;
  const sortiert = Object.fromEntries(Object.entries(stand.abbildungen).sort(([a], [b]) => Number(a.slice(4)) - Number(b.slice(4))));
  writeFileSync(standPfad, `${JSON.stringify({ werkzeug: WERKZEUG_VERSION, abbildungen: sortiert }, null, 2)}\n`);
  return { fehler, geschrieben, berichte };
}

/**
 * Hilfe zum Vermessen: Ausschnitt des Originals, dreifach vergrößert, mit Raster (dünn alle 10 px,
 * kräftig und beschriftet alle 50 px, Koordinaten des Originals) → tmp/abbildungen/raster-<id>-<x>-<y>.png;
 * mit `nach` aus der Vorschau nach der Überdeckung (tmp/abbildungen/<id>.png) → raster-nach-….png
 * @param {string} id @param {number} x @param {number} y @param {number} b @param {number} h @param {boolean} [nach]
 */
export async function raster(id, x, y, b, h, nach = false, wurzel = WURZEL) {
  const abb = ladeKontext(wurzel).abbildungen.get(id);
  if (abb === undefined) throw new Error(`${id} unbekannt`);
  const browser = await starteBrowser();
  try {
    const seite = await browser.newPage();
    const d = await seite.evaluate(async (/** @type {{ url: string, x: number, y: number, b: number, h: number }} */ a) => {
      const img = new Image();
      img.src = a.url;
      await img.decode();
      const z = 3;
      const c = document.createElement('canvas');
      c.width = a.b * z; c.height = a.h * z;
      const k = /** @type {CanvasRenderingContext2D} */ (c.getContext('2d'));
      k.imageSmoothingEnabled = false;
      k.drawImage(img, a.x, a.y, a.b, a.h, 0, 0, a.b * z, a.h * z);
      k.font = '11px sans-serif';
      for (let v = Math.ceil(a.x / 10) * 10; v < a.x + a.b; v += 10) {
        const stark = v % 50 === 0;
        k.strokeStyle = stark ? 'rgba(255,0,0,0.8)' : 'rgba(255,0,0,0.25)';
        k.beginPath(); k.moveTo((v - a.x) * z + 0.5, 0); k.lineTo((v - a.x) * z + 0.5, a.h * z); k.stroke();
        if (stark) { k.fillStyle = 'red'; k.fillText(String(v), (v - a.x) * z + 2, 11); }
      }
      for (let v = Math.ceil(a.y / 10) * 10; v < a.y + a.h; v += 10) {
        const stark = v % 50 === 0;
        k.strokeStyle = stark ? 'rgba(0,0,255,0.8)' : 'rgba(0,0,255,0.25)';
        k.beginPath(); k.moveTo(0, (v - a.y) * z + 0.5); k.lineTo(a.b * z, (v - a.y) * z + 0.5); k.stroke();
        if (stark) { k.fillStyle = 'blue'; k.fillText(String(v), 2, (v - a.y) * z - 2); }
      }
      return c.toDataURL('image/png');
    }, { url: alsDataUrl(nach ? path.join(wurzel, 'tmp', 'abbildungen', `${id}.png`) : path.join(wurzel, QUELLORDNER, abb.datei)), x, y, b, h });
    const ziel = path.join(wurzel, 'tmp', 'abbildungen', `raster-${nach ? 'nach-' : ''}${id}-${x}-${y}.png`);
    mkdirSync(path.dirname(ziel), { recursive: true });
    writeFileSync(ziel, Buffer.from(d.split(',')[1] ?? '', 'base64'));
    return ziel;
  } finally {
    await browser.close();
  }
}

async function hauptprogramm() {
  const args = process.argv.slice(2);
  if (args[0] === '--raster') {
    const nach = args.includes('--nach');
    const [id, ...zahlen] = args.slice(1).filter((a) => a !== '--nach');
    const [x, y, b, h] = zahlen.map(Number);
    if (id === undefined || [x, y, b, h].some((n) => n === undefined || !Number.isInteger(n))) {
      console.error('Aufruf: node werkzeuge/abbildungen.mjs --raster abb-N x y breite höhe [--nach]');
      return 1;
    }
    console.log(await raster(id, /** @type {number} */ (x), /** @type {number} */ (y), /** @type {number} */ (b), /** @type {number} */ (h), nach));
    return 0;
  }
  const pruefe = args.includes('--pruefe');
  const vorschau = args.includes('--vorschau');
  const nur = args.filter((a) => /^abb-\d+$/u.test(a));
  const erg = await erzeugeAbbildungen({ nur, pruefe, vorschau });
  for (const g of erg.geschrieben) console.log(`abbildungen: ${g}`);
  for (const [id, b] of Object.entries(erg.berichte)) b.forEach((r, i) => console.log(`  ${id}-${i + 1}: Hintergrund ${r.hintergrund}, Schrift ${r.farbe}, ${r.groesse} px`));
  for (const f of erg.fehler) console.error(`abbildungen: FEHLER ${f}`);
  if (pruefe && erg.fehler.length === 0) console.log('abbildungen --pruefe: alle Bilder aktuell');
  return erg.fehler.length > 0 ? 1 : 0;
}

if (istHauptmodul(import.meta.url)) process.exitCode = await hauptprogramm();
