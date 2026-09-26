#!/usr/bin/env node
/**
 * Kleiner Vorschau-Server für dist/ (nur 127.0.0.1): `node werkzeuge/vorschau.mjs [--port 8301]`.
 * `/` liefert dist/mvg.html. Kein Zwischenspeicher, damit ein neuer Bau sofort sichtbar ist.
 * Die Einzeldatei läuft auch direkt über file:// – der Server ist nur Bequemlichkeit (z. B. für
 * .claude/launch.json und zwei Fenster Regie/Leinwand im selben Ursprung).
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { istHauptmodul } from './haupt.mjs';

export const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(WURZEL, 'dist');
const ARTEN = /** @type {Record<string, string>} */ ({
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
});

/** @param {string[]} argv */
function lesePort(argv) {
  const i = argv.findIndex((a) => a === '--port' || a.startsWith('--port='));
  if (i < 0) return 8301;
  const roh = argv[i]?.includes('=') ? argv[i]?.split('=')[1] : argv[i + 1];
  const port = Number(roh);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`ungültiger Port: ${roh}`);
  return port;
}

/**
 * Löst einen URL-Pfad sicher in dist/ auf (kein Ausbruch über `..`).
 * @param {string} urlPfad
 */
export function aufloesen(urlPfad) {
  let pfad;
  try {
    pfad = decodeURIComponent(urlPfad.split('?')[0]?.split('#')[0] ?? '/');
  } catch {
    return null;
  }
  if (pfad === '/' || pfad === '') pfad = '/mvg.html';
  const voll = path.resolve(DIST, `.${pfad}`);
  if (voll !== DIST && !voll.startsWith(DIST + path.sep)) return null;
  return voll;
}

function starte() {
  const port = lesePort(process.argv.slice(2));
  const server = createServer(async (anfrage, antwort) => {
    const datei = aufloesen(anfrage.url ?? '/');
    const kopf = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    if (anfrage.method !== 'GET' && anfrage.method !== 'HEAD') {
      antwort.writeHead(405, { ...kopf, Allow: 'GET, HEAD' }).end();
      return;
    }
    try {
      if (!datei || !(await stat(datei)).isFile()) throw new Error('fehlt');
      antwort.writeHead(200, { ...kopf, 'Content-Type': ARTEN[path.extname(datei).toLowerCase()] ?? 'application/octet-stream' });
      if (anfrage.method === 'HEAD') antwort.end();
      else createReadStream(datei).pipe(antwort);
    } catch {
      const hinweis = datei?.endsWith('mvg.html') ? 'dist/mvg.html fehlt – bitte zuerst npm run bau' : 'nicht gefunden';
      antwort.writeHead(404, { ...kopf, 'Content-Type': 'text/plain; charset=utf-8' }).end(`${hinweis}\n`);
    }
  });
  server.on('error', (fehler) => {
    console.error(`vorschau: ${fehler.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(`vorschau: http://127.0.0.1:${port}/ (dist/mvg.html) – beenden mit Strg+C`);
  });
}

/** Direkt aufgerufen (nicht importiert)? Auch über Links (werkzeuge/haupt.mjs). */
const istHaupt = istHauptmodul(import.meta.url);

if (istHaupt) {
  try {
    starte();
  } catch (fehler) {
    console.error(`vorschau: ${fehler instanceof Error ? fehler.message : String(fehler)}`);
    process.exitCode = 1;
  }
}
