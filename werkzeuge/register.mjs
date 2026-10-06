// Komponenten- und Assetregister der Auslieferung (Audit 2026-10-06, O-64). Liest nur, was im Repo belegt ist:
// package.json und package-lock.json (Pakete, Versionen, Lizenzen), die Eingaben des esbuild-Bündels (was tatsächlich in
// die Seite gelangt), die Schriftdaten (src/generiert/drittanbieter.json) und die Dateien der Bilder (SHA-256).
// Nichts wird erfunden: Wo ein Beleg fehlt, steht „zu klären“. Ergebnis: docs/audit/Governance-Kompass_Komponenten.json
// und docs/audit/Governance-Kompass_Assets.json (deterministisch, ohne Zeitstempel).
//
// Aufruf: node werkzeuge/register.mjs   (nach `npm run bau`; liest dist/ und release/)

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';
import YAML from 'yaml';
import { istHauptmodul } from './haupt.mjs';
import { schreibeAtomar } from './atomar.mjs';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = 'docs/audit';
const OWNER_O64 = 'Owner-Bestätigung im Chat am 2026-10-06 (ENTSCHEIDE.md O-64, Punkt 5): alle Grafiken, Logo und Abbildungen sind BM-eigen';

/** @param {string} rel */
const lies = (rel) => readFileSync(path.join(WURZEL, rel));
/** @param {string} rel */
const sha = (rel) => createHash('sha256').update(lies(rel)).digest('hex');

/** Eingaben des Bündels (Skript und Stil) wie im Bau, relativ zur Wurzel. */
async function buendelEingaben() {
  const js = await esbuild.build({
    absWorkingDir: WURZEL, entryPoints: ['src/main.ts'], bundle: true, write: false, outfile: 'mvg.js', format: 'iife', platform: 'browser',
    target: 'es2020', metafile: true, loader: { '.svg': 'text' }, define: { __MVG_VERSION__: '""' }, logLevel: 'silent',
  });
  const css = await esbuild.build({
    absWorkingDir: WURZEL, entryPoints: ['src/stil/index.css'], bundle: true, write: false, outfile: 'mvg.css', metafile: true, logLevel: 'silent',
    loader: { '.woff2': 'dataurl', '.woff': 'dataurl', '.svg': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl', '.webp': 'dataurl' },
  });
  return { skript: Object.keys(js.metafile.inputs).sort(), stil: Object.keys(css.metafile.inputs).sort() };
}

export async function komponenten() {
  const pkg = JSON.parse(lies('package.json').toString('utf8'));
  const lock = JSON.parse(lies('package-lock.json').toString('utf8'));
  const direkt = new Set(Object.keys(pkg.devDependencies ?? {}));
  const eingaben = await buendelEingaben();
  const fremdImSkript = eingaben.skript.filter((e) => e.includes('node_modules'));
  if (fremdImSkript.length > 0) throw new Error(`Fremdcode im Skript-Bündel: ${fremdImSkript.join(', ')} – Register und Lizenzbereich ergänzen`);
  const drittanbieter = JSON.parse(lies('src/generiert/drittanbieter.json').toString('utf8'));
  /** @type {Map<string, any>} */
  const schriften = new Map(drittanbieter.komponenten.map((/** @type {any} */ k) => [k.paket, k]));
  const liste = [];
  for (const [schluessel, p] of Object.entries(lock.packages ?? {})) {
    if (schluessel === '') continue;
    const name = schluessel.replace(/^.*node_modules\//u, '');
    const schrift = schriften.get(name);
    const eingebettet = schrift !== undefined;
    liste.push({
      name,
      version: String(p.version ?? ''),
      type: eingebettet ? 'Schrift (woff2, eingebettet als data-URI)' : 'Entwicklungs- und Bauwerkzeug (npm)',
      usage: direkt.has(name) ? 'direkt (devDependencies)' : 'transitiv',
      source: String(p.resolved ?? ''),
      license: String(p.license ?? 'unbekannt – zu klären'),
      included_in_release: eingebettet,
      evidence: eingebettet
        ? `Schnitte in src/generiert/schriften.css (werkzeuge/schriften.mjs); Copyright aus der name-Tabelle der Schrift: ${schrift.copyright}; Schriftversion ${schrift.schriftVersionen.join(', ')}; Upstream ${schrift.upstream}; Lizenztext in der Ansicht #lizenzen`
        : 'nicht unter den Eingaben des Skript- oder Stil-Bündels (esbuild metafile); nur zur Bauzeit oder in Tests genutzt',
      status: eingebettet ? 'belegt lizenziert' : (p.license ? 'nicht ausgeliefert' : 'nicht ausgeliefert – Lizenzangabe fehlt im Lockfile'),
    });
  }
  liste.sort((a, b) => a.name.localeCompare(b.name));
  return {
    erzeugt_von: 'werkzeuge/register.mjs',
    grundlage: 'package.json, package-lock.json, esbuild metafile (Skript src/main.ts, Stil src/stil/index.css), src/generiert/drittanbieter.json',
    buendel: {
      skript_eingaben_aus_node_modules: fremdImSkript,
      stil_eingaben_aus_node_modules: eingaben.stil.filter((e) => e.includes('node_modules')),
      hinweis: 'Das Skript-Bündel enthält nur eigenen Code aus src/ (keine npm-Laufzeitbibliothek, keine esbuild-Hilfsfunktionen nachweisbar). Die Schriften gelangen über src/generiert/schriften.css als data-URIs in den Stil.',
    },
    komponenten: liste,
  };
}

/** @param {string} rel @param {object} r */
const eintrag = (rel, r) => ({ ...r, quelle: rel, sha256: sha(rel) });

export function assets() {
  const liste = [];
  // Inhaltsabbildungen (13 WebP)
  for (const datei of readdirSync(path.join(WURZEL, 'inhalte/abbildungen')).filter((d) => /^abb-\d+\.webp$/u.test(d)).sort((a, b) => Number(a.slice(4, -5)) - Number(b.slice(4, -5)))) {
    const id = datei.slice(0, -5);
    const beschreibung = YAML.parse(lies(`inhalte/abbildungen/${id}.yaml`).toString('utf8'));
    liste.push(eintrag(`inhalte/abbildungen/${datei}`, {
      id, typ: 'WebP (Abbildung)', verwendung: `Themen, Abbildung ${id} („${beschreibung.titel}“); eingebettet als data:image/webp`,
      herkunft: `Bild ${beschreibung.quelle} der DOCX-Fassung V1.2 von Bauherr Mentoren (quellen/whitepaper/v1.2/), Begriffe überdeckt mit werkzeuge/abbildungen.mjs (Beschriftung in Barlow Condensed, OFL-1.1)`,
      rechtebasis: OWNER_O64, status: 'BM-eigen',
    }));
  }
  // Marke und Icons
  /** @type {[string, string, string, string][]} */
  const marke = [
    ['logo-bm', 'quellen/marke/logo-bm.svg', 'SVG (Logo)', 'Kopf der Seite (Bildmarke), Druckköpfe; im Skript als Text eingebettet'],
    ['logo-bm-bildmarke', 'quellen/marke/logo-bm-bildmarke.svg', 'SVG (Bildmarke)', 'Kopf, Druck, eingebettetes Favicon (data:image/svg+xml in der Hülle und den Rechtsseiten)'],
    ['favicon-svg', 'dist/favicon.svg', 'SVG (Favicon)', 'Webseitenordner: <link rel="icon"> (nicht in der Einzeldatei)'],
    ['favicon-ico', 'dist/favicon.ico', 'ICO (Favicon)', 'Webseitenordner: <link rel="icon" sizes="48x48"> (nicht in der Einzeldatei)'],
    ['apple-touch-icon', 'dist/apple-touch-icon.png', 'PNG (Icon)', 'Webseitenordner: <link rel="apple-touch-icon"> (nicht in der Einzeldatei)'],
    ['vorschau', 'dist/vorschau.png', 'PNG (Vorschaubild)', 'Metadaten og:image/twitter der veröffentlichten Seite (wird von der Seite selbst nicht geladen)'],
  ];
  for (const [id, rel, typ, verwendung] of marke) {
    liste.push(eintrag(rel, {
      id, typ, verwendung,
      herkunft: id.startsWith('logo') ? 'Logo von Bauherr Mentoren (Vorlage quellen/marke/logo-original.png, als Vektor nachgezeichnet)'
        : id === 'vorschau' ? 'erzeugt mit werkzeuge/vorschaubild.mjs (Bildmarke, Schriftzug in einer Systemschrift des Bau-Rechners)'
          : 'erzeugt mit werkzeuge/favicon.mjs aus der Bildmarke',
      rechtebasis: OWNER_O64, status: 'BM-eigen',
    }));
  }
  // Im Code gezeichnete Grafiken und Symbole (kein fremdes Icon-Set)
  for (const rel of ['src/stil/symbole.ts', ...readdirSync(path.join(WURZEL, 'src/grafik')).filter((d) => d.endsWith('.ts')).sort().map((d) => `src/grafik/${d}`)]) {
    liste.push(eintrag(rel, {
      id: `grafik-${path.basename(rel, '.ts')}`, typ: 'SVG (im Code gezeichnet)', verwendung: rel === 'src/stil/symbole.ts' ? 'Symbole der Bedienung (Linien-Icons)' : 'Grafiken der Geschichte, Themen und Werkzeuge',
      herkunft: 'im Projekt für Bauherr Mentoren als Code geschrieben; kein fremdes Icon-Set eingebunden (keine npm-Eingabe im Bündel)',
      rechtebasis: OWNER_O64, status: 'BM-eigen',
    }));
  }
  // Schriften
  const drittanbieter = JSON.parse(lies('src/generiert/drittanbieter.json').toString('utf8'));
  for (const k of drittanbieter.komponenten) {
    const ordner = `node_modules/${k.paket}/files`;
    for (const datei of readdirSync(path.join(WURZEL, ordner)).filter((d) => readFileSync(path.join(WURZEL, 'src/generiert/schriften.css'), 'utf8').includes(`/* ${d} */`)).sort()) {
      liste.push(eintrag(`${ordner}/${datei}`, {
        id: `schrift-${datei.replace(/\.woff2$/u, '')}`, typ: 'woff2 (Schrift)', verwendung: 'Stil der Seite, eingebettet als data:font/woff2',
        herkunft: `${k.name} (${k.upstream}), bezogen über ${k.quelle}`, rechtebasis: `${k.copyright}; ${k.lizenz}`, status: 'belegt lizenziert',
      }));
    }
  }
  const release = existsSync(path.join(WURZEL, 'release/SHA256SUMS.txt')) ? lies('release/SHA256SUMS.txt').toString('utf8').trim().split('\n') : [];
  return { erzeugt_von: 'werkzeuge/register.mjs', auslieferung_sha256: release, assets: liste };
}

if (istHauptmodul(import.meta.url)) {
  const k = await komponenten();
  const a = assets();
  await schreibeAtomar(path.join(WURZEL, ZIEL, 'Governance-Kompass_Komponenten.json'), `${JSON.stringify(k, null, 2)}\n`);
  await schreibeAtomar(path.join(WURZEL, ZIEL, 'Governance-Kompass_Assets.json'), `${JSON.stringify(a, null, 2)}\n`);
  console.log(`register: ${k.komponenten.length} Komponenten (${k.komponenten.filter((x) => x.included_in_release).length} ausgeliefert), ${a.assets.length} Assets → ${ZIEL}/`);
}
