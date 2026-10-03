#!/usr/bin/env node
/**
 * Vorschau der Grafik-Bausteine (P17.3): rendert den isometrischen Campus (src/grafik/campus-iso.ts) als PNG
 * nach tmp/grafik/ – zum Anschauen, nicht Teil der Kette.
 *
 *   node werkzeuge/grafik-vorschau.mjs            Übersichten (Stufen, Jahreszeiten, Licht) + Einzelbilder
 *   node werkzeuge/grafik-vorschau.mjs --alle     zusätzlich jede Stufe × Jahreszeit × Licht einzeln
 *
 * Farben kommen aus src/stil/tokens.css und src/stil/grafik.css, Schriften aus src/generiert/schriften.css
 * (fehlt sie, zuerst `npm run bau`). Browser wie `npm run oberflaeche` (starteBrowser).
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { starteBrowser } from './oberflaeche.mjs';
import { campusIso, CAMPUS_STUFE_MAX } from '../src/grafik/campus-iso.ts';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = path.join(WURZEL, 'tmp', 'grafik');
const JAHRESZEITEN = /** @type {const} */ (['fruehling', 'sommer', 'herbst', 'winter']);
const LICHTER = /** @type {const} */ (['morgen', 'tag', 'abend']);

function css() {
  const lies = (/** @type {string} */ p) => (existsSync(path.join(WURZEL, p)) ? readFileSync(path.join(WURZEL, p), 'utf8') : '');
  return lies('src/generiert/schriften.css') + lies('src/stil/tokens.css') + lies('src/stil/grafik.css');
}

/**
 * @param {{ titel: string, svg: string }[]} kacheln
 * @param {number} spalten
 */
function seite(kacheln, spalten) {
  const zellen = kacheln.map((k) => `<figure>${k.svg}<figcaption>${k.titel}</figcaption></figure>`).join('');
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>${css()}
body{margin:0;padding:16px;background:var(--grund);font-family:var(--schrift-text)}
.raster{display:grid;grid-template-columns:repeat(${spalten},1fr);gap:16px}
figure{margin:0;background:var(--weiss);border-radius:12px;overflow:hidden;box-shadow:var(--schatten-karte)}
figcaption{font:var(--typo-label);letter-spacing:var(--sperrung-label);text-transform:uppercase;color:var(--tinte-2);padding:8px 12px}
</style></head><body><div class="raster">${zellen}</div></body></html>`;
}

async function main() {
  const alle = process.argv.includes('--alle');
  mkdirSync(ZIEL, { recursive: true });
  const start = await starteBrowser();
  if (start.browser === null) {
    console.log(`grafik-vorschau: kein Browser – ${start.grund}`);
    process.exitCode = 3;
    return;
  }
  const browser = start.browser;
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const bild = async (/** @type {string} */ name, /** @type {string} */ html, /** @type {number} */ breite) => {
    await page.setViewportSize({ width: breite, height: 900 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(ZIEL, name), fullPage: true });
    console.log(`grafik-vorschau: tmp/grafik/${name}`);
  };
  const stufen = Array.from({ length: CAMPUS_STUFE_MAX + 1 }, (_, s) => s);
  await bild('campus-stufen.png', seite(stufen.map((s) => ({ titel: `Stufe ${s} · Sommer · Tag`, svg: campusIso(s) })), 3), 1800);
  await bild('campus-jahreszeiten.png', seite([3, 8].flatMap((s) => JAHRESZEITEN.map((j) => ({ titel: `Stufe ${s} · ${j}`, svg: campusIso(s, { jahreszeit: j }) }))), 4), 2000);
  await bild('campus-licht.png', seite([2, 8].flatMap((s) => LICHTER.map((l) => ({ titel: `Stufe ${s} · ${l}`, svg: campusIso(s, { licht: l, jahreszeit: s === 2 ? 'herbst' : 'sommer' }) }))), 3), 1800);
  // Einzelbilder in voller Breite: jede Stufe mit wechselnder Jahreszeit und wechselndem Licht wie in der Story
  for (const s of stufen) {
    const j = JAHRESZEITEN[s % 4] ?? 'sommer';
    const l = LICHTER[s % 3] ?? 'tag';
    await bild(`campus-${s}-${j}-${l}.png`, seite([{ titel: `Stufe ${s} · ${j} · ${l}`, svg: campusIso(s, { jahreszeit: j, licht: l }) }], 1), 1100);
  }
  if (alle) {
    for (const s of stufen) for (const j of JAHRESZEITEN) for (const l of LICHTER) {
      await bild(`alle/campus-${s}-${j}-${l}.png`, seite([{ titel: `Stufe ${s} · ${j} · ${l}`, svg: campusIso(s, { jahreszeit: j, licht: l }) }], 1), 900);
    }
  }
  await browser.close();
}

await main();
