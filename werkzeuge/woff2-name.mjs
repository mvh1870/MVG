// Liest die name-Tabelle einer woff2-Schrift (Copyright, Familie, Version, Lizenz-Adresse), ohne
// Abhängigkeit: woff2-Kopf und Tabellenverzeichnis nach W3C WOFF2 §5, Daten mit Brotli aus node:zlib.
// Gebraucht für den Bereich „Drittanbieter & Lizenzen“ (werkzeuge/schriften.mjs): die Copyright-Zeile
// steht dort so, wie sie in der ausgelieferten Schrift selbst steht.

import { readFile } from 'node:fs/promises';
import { brotliDecompressSync } from 'node:zlib';

/** Bekannte Tabellen-Kennungen in der Reihenfolge von WOFF2 §5.2 (Index = Flag-Bits 0–5). */
const KENNUNGEN = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH', 'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar', 'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill'];

/** @param {Buffer} b @param {{ p: number }} o */
function uintBase128(b, o) {
  let wert = 0;
  for (let i = 0; i < 5; i++) {
    const byte = b[o.p++] ?? 0;
    wert = wert * 128 + (byte & 0x7f);
    if ((byte & 0x80) === 0) return wert;
  }
  throw new Error('woff2: UIntBase128 zu lang');
}

/**
 * Einträge der name-Tabelle (Plattform 3, Windows/Unicode) nach Name-ID.
 * @param {string} pfad
 * @returns {Promise<{ copyright: string, familie: string, version: string, lizenzAdresse: string }>}
 */
export async function woff2Namen(pfad) {
  const b = await readFile(pfad);
  if (b.toString('latin1', 0, 4) !== 'wOF2') throw new Error(`${pfad}: kein woff2`);
  const anzahl = b.readUInt16BE(12);
  const komprimiert = b.readUInt32BE(20);
  const o = { p: 48 };
  /** @type {Array<{ kennung: string, laenge: number }>} */
  const tabellen = [];
  for (let i = 0; i < anzahl; i++) {
    const flags = b[o.p++] ?? 0;
    let kennung = KENNUNGEN[flags & 0x3f] ?? '';
    if ((flags & 0x3f) === 0x3f) { kennung = b.toString('latin1', o.p, o.p + 4); o.p += 4; }
    const original = uintBase128(b, o);
    const umform = (flags >> 6) & 3;
    const umgeformt = ((kennung === 'glyf' || kennung === 'loca') && umform === 0) || (kennung === 'hmtx' && umform === 1);
    tabellen.push({ kennung, laenge: umgeformt ? uintBase128(b, o) : original });
  }
  const daten = brotliDecompressSync(b.subarray(o.p, o.p + komprimiert));
  let start = 0;
  let name = null;
  for (const t of tabellen) {
    if (t.kennung === 'name') name = daten.subarray(start, start + t.laenge);
    start += t.laenge;
  }
  if (name === null) throw new Error(`${pfad}: keine name-Tabelle`);
  const zahl = name.readUInt16BE(2);
  const speicher = name.readUInt16BE(4);
  /** @type {Record<number, string>} */
  const nach = {};
  for (let i = 0; i < zahl; i++) {
    const r = 6 + i * 12;
    if (name.readUInt16BE(r) !== 3) continue;
    const id = name.readUInt16BE(r + 6);
    const roh = name.subarray(speicher + name.readUInt16BE(r + 10), speicher + name.readUInt16BE(r + 10) + name.readUInt16BE(r + 8));
    let text = '';
    for (let k = 0; k + 1 < roh.length; k += 2) text += String.fromCharCode(roh.readUInt16BE(k));
    nach[id] ??= text;
  }
  return { copyright: nach[0] ?? '', familie: nach[1] ?? '', version: nach[5] ?? '', lizenzAdresse: nach[14] ?? '' };
}
