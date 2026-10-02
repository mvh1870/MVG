#!/usr/bin/env node
/**
 * Vorschaubild für geteilte Links (P16.13, O-47): 1200 × 630 px, Schulcampus als Linienzeichnung (O-45) mit Name
 * und Untertitel. Einmal erzeugt und als quellen/marke/vorschau.png eingecheckt; werkzeuge/bau.mjs kopiert die Datei
 * nach dist/ (so bleibt der Bau deterministisch, ohne Browser).
 *
 *   node werkzeuge/vorschaubild.mjs     erzeugt quellen/marke/vorschau.png neu (braucht Chromium)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { campus, STUFE_MAX } from '../src/grafik/bauplan.ts';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const marke = readFileSync(path.join(WURZEL, 'quellen', 'marke', 'logo-bm-bildmarke.svg'), 'utf8').replace(/<title>[^<]*<\/title>/u, '');

const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>
html,body{margin:0;width:1200px;height:630px;overflow:hidden}
body{background:#EEF1F5;background-image:linear-gradient(#E3E8EF 1px,transparent 1px),linear-gradient(90deg,#E3E8EF 1px,transparent 1px);background-size:24px 24px;font-family:"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#0C1C33;position:relative}
.bild{position:absolute;right:-30px;top:60px;width:620px;height:520px;opacity:.9}
.bild svg{width:100%;height:100%;fill:none;stroke-linecap:round;stroke-linejoin:round}
.bp-feld{stroke:#AEB9C8;stroke-dasharray:6 5}.bp-achse{stroke:#C3CDD9;stroke-width:.6}
.bp-plan,.bp-platte{stroke:#1D3258}.bp-bau{stroke:#0C1C33;stroke-width:1.4}.bp-bau.fein{stroke-width:.8}.bp-bau.fenster{stroke:#1D3258;stroke-width:2}
.bp-kran{stroke:#7A5C1E}.bp-baum{stroke:#349068}.bp-mass-linie{stroke:#A8823C;stroke-width:2}
.text{position:absolute;left:72px;top:96px;width:540px}
.marke{display:flex;align-items:center;gap:14px;font-size:22px;font-weight:700;color:#7A5C1E;letter-spacing:.12em;text-transform:uppercase}
.marke svg{width:56px;height:56px;color:#0C1C33}
h1{margin:36px 0 18px;font-size:76px;line-height:.95;font-weight:800;letter-spacing:.01em}
p{margin:0;font-size:28px;line-height:1.35;color:#34435A}
.leiste{position:absolute;left:0;right:0;bottom:0;height:12px;background:#A8823C}
</style></head><body>
<div class="bild">${campus(STUFE_MAX, 'bauplan')}</div>
<div class="text"><div class="marke">${marke}<span>Minimum Viable Governance</span></div>
<h1>Governance Kompass</h1>
<p>Wie Bauherren komplexe Bauprojekte entscheidungsfähig führen – als Geschichte, in Themen und mit Werkzeugen.</p></div>
<div class="leiste"></div>
</body></html>`;

const browser = await chromium.launch({ executablePath: process.env['PLAYWRIGHT_BROWSERS_PATH'] ? path.join(process.env['PLAYWRIGHT_BROWSERS_PATH'], 'chromium') : undefined }).catch(() => chromium.launch());
const seite = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await seite.setContent(html, { waitUntil: 'load' });
const bild = await seite.screenshot({ type: 'png' });
await browser.close();
writeFileSync(path.join(WURZEL, 'quellen', 'marke', 'vorschau.png'), bild);
console.log(`vorschaubild: quellen/marke/vorschau.png geschrieben (${bild.length} Bytes)`);
