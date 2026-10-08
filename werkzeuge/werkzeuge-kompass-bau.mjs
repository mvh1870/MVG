/*
 * Bau des Quellcode-Moduls im Exportpaket „Werkzeuge Kompass“ (L-431); wird als quellcode/bau.mjs mitgeliefert und läuft
 * dort aus dem Modulordner. Gleiche Regeln wie werkzeuge/bau.mjs: Skript und Stil inline, CSP mit Hash über das Skript.
 *
 *   node bau.mjs   →  ausgabe/Werkzeuge-Kompass.html
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as esbuild from 'esbuild';

const js = await esbuild.build({
  entryPoints: ['src/werkzeuge-kompass.ts'], bundle: true, write: false, outfile: 'w.js', format: 'iife', platform: 'browser',
  target: 'es2020', minify: true, charset: 'utf8', legalComments: 'none', loader: { '.svg': 'text' },
  define: { __MVG_VERSION__: JSON.stringify('') },
});
const css = await esbuild.build({
  entryPoints: ['src/stil/index.css'], bundle: true, write: false, outfile: 'w.css', minify: true, charset: 'utf8',
  legalComments: 'none', target: ['chrome100', 'edge100', 'firefox100', 'safari15.4'],
  loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.svg': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl', '.webp': 'dataurl' },
});
const skript = (js.outputFiles[0]?.text ?? '')
  .replace(/\r\n?/g, () => '\n')
  .replace(/<\/(script)/gi, (_t, wort) => `<\\/${wort}`)
  .replace(/<!--/g, () => '<\\!--');
const stil = (css.outputFiles[0]?.text ?? '').replace(/\r\n?/g, () => '\n').replace(/<\/(style)/gi, (_t, wort) => `<\\/${wort}`);
const hash = createHash('sha256').update(skript, 'utf8').digest('base64');
const csp = [
  "default-src 'none'",
  `script-src 'sha256-${hash}'`,
  "style-src 'unsafe-inline'",
  "img-src 'self' data:",
  'font-src data:',
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');
const huelle = (await readFile('huelle.html', 'utf8')).replace(/\r\n?/g, () => '\n');
const ersatz = {
  '<!--mvg:csp-->': `<meta http-equiv="Content-Security-Policy" content="${csp}">`,
  '<!--mvg:stil-->': `<style>${stil}</style>`,
  '<!--mvg:skript-->': `<script>${skript}</script>`,
};
for (const anker of Object.keys(ersatz)) {
  if (huelle.split(anker).length !== 2) throw new Error(`huelle.html: ${anker} muss genau einmal vorkommen`);
}
const html = huelle.replace(/<!--mvg:(?:csp|stil|skript)-->/g, (t) => ersatz[t] ?? t);
await mkdir('ausgabe', { recursive: true });
await writeFile('ausgabe/Werkzeuge-Kompass.html', html, 'utf8');
console.log(`ausgabe/Werkzeuge-Kompass.html: ${Buffer.byteLength(html, 'utf8')} Bytes`);
