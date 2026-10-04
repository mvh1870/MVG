#!/usr/bin/env node
/**
 * Favicon-Satz (Lesezeichen, Browser-Tab, Startbildschirm): Bildmarke weiß auf Navy mit gerundeten Ecken.
 * Einmal erzeugt und in quellen/marke/ eingecheckt; werkzeuge/bau.mjs kopiert die Dateien nach dist/
 * (so bleibt der Bau deterministisch, ohne Browser).
 *
 *   node werkzeuge/favicon.mjs     erzeugt favicon.svg, favicon.ico, apple-touch-icon.png neu (braucht Chromium)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARKE = path.join(WURZEL, 'quellen', 'marke');
const pfad = /<path[^>]* d="([^"]+)"/u.exec(readFileSync(path.join(MARKE, 'logo-bm-bildmarke.svg'), 'utf8'))?.[1];
if (pfad === undefined) throw new Error('Bildmarke ohne Pfad');

/** Quadrat 64 × 64; Marke 659 × 649 auf etwa 44 px verkleinert und mittig gesetzt. */
function svg(rand) {
  const k = 0.066;
  const x = (64 - 659 * k) / 2;
  const y = (64 - 649 * k) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rand}" fill="#0C1C33"/><path fill="#FFFFFF" fill-rule="evenodd" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${k})" d="${pfad}"/></svg>\n`;
}

const browser = await chromium.launch({ executablePath: process.env['PLAYWRIGHT_BROWSERS_PATH'] ? path.join(process.env['PLAYWRIGHT_BROWSERS_PATH'], 'chromium') : undefined }).catch(() => chromium.launch());
/** PNG in Kantenlänge px; mit Rand-Radius (rund) oder randlos (Apple rundet selbst). */
async function png(px, rand) {
  const seite = await browser.newPage({ viewport: { width: px, height: px }, deviceScaleFactor: 1 });
  await seite.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${px}px;height:${px}px}</style>${svg(rand)}`);
  const b = await seite.screenshot({ type: 'png', omitBackground: true });
  await seite.close();
  return b;
}
const klein = await png(32, 14);
const mittel = await png(48, 14);
const apple = await png(180, 0);
await browser.close();

/** ICO mit eingebetteten PNG (32 und 48 px). */
function ico(bilder) {
  const kopf = Buffer.alloc(6 + 16 * bilder.length);
  kopf.writeUInt16LE(1, 2);
  kopf.writeUInt16LE(bilder.length, 4);
  let offset = kopf.length;
  bilder.forEach(([px, b], i) => {
    const e = 6 + 16 * i;
    kopf[e] = px; kopf[e + 1] = px; kopf.writeUInt16LE(1, e + 4); kopf.writeUInt16LE(32, e + 6);
    kopf.writeUInt32LE(b.length, e + 8); kopf.writeUInt32LE(offset, e + 12);
    offset += b.length;
  });
  return Buffer.concat([kopf, ...bilder.map(([, b]) => b)]);
}

writeFileSync(path.join(MARKE, 'favicon.svg'), svg(14));
writeFileSync(path.join(MARKE, 'favicon.ico'), ico([[32, klein], [48, mittel]]));
writeFileSync(path.join(MARKE, 'apple-touch-icon.png'), apple);
console.log('favicon: favicon.svg, favicon.ico, apple-touch-icon.png in quellen/marke/ geschrieben');
