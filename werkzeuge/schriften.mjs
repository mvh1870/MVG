// Schriften-Werkzeug (P0.3, L-2): bettet die OFL-Schriften der Variante B als woff2-data-URIs ein.
//
// Quelle: node_modules/@fontsource/<paket>/files/*.woff2 und die unicode-range aus den CSS-Dateien
// desselben Pakets (latin-<gewicht>.css, latin-ext-<gewicht>.css). Ziel: src/generiert/schriften.css
// (gitignored, wird vor jedem Bau erzeugt).
//
// Nur die Schnitte, die Variante B tatsächlich benutzt (aus prototyp/variante-b-leitstand.html
// abgelesen; je Schnitt steht unten, wo er vorkommt). Nicht übernommen, obwohl der Prototyp sie über
// Google Fonts anforderte: Big Shoulders 700, Caveat 600 – im Prototyp nirgends gesetzt.
// Fließtext und Kennungen laufen in Systemschriften (src/stil/tokens.css, --schrift-text/--schrift-mono);
// eingebettet werden nur die beiden Auszeichnungsschriften.
//
// Deterministisch: feste Reihenfolge (Familie, Gewicht, Untermenge), keine Zeitstempel.
//
// Aufruf:  node werkzeuge/schriften.mjs [--ziel <pfad>]

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { istHauptmodul } from './haupt.mjs';
import { schreibeAtomar } from './atomar.mjs';
import { woff2Namen } from './woff2-name.mjs';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Die eingebetteten Schnitte. `familie` muss dem Namen in der @fontsource-CSS entsprechen,
 * damit die Stapel in src/stil/tokens.css (--schrift-*) greifen.
 * @type {ReadonlyArray<{ paket: string, familie: string, rolle: string, gewichte: ReadonlyArray<{ gewicht: number, wo: string }> }>}
 */
export const SCHRIFTEN = [
  {
    paket: 'big-shoulders-display', familie: 'Big Shoulders Display', rolle: 'Anzeige: Zahlen, Instrumente, Titel',
    gewichte: [{ gewicht: 800, wo: 'alle Anzeigen (Titel, Instrumentwerte, Tasten A–D, Uhr)' }],
  },
  {
    paket: 'barlow-condensed', familie: 'Barlow Condensed', rolle: 'Labels, Reiter, Kicker',
    gewichte: [
      { gewicht: 500, wo: 'schmale Schrift ohne eigenes Gewicht (Achsen, Zeitlineal)' },
      { gewicht: 600, wo: 'Labels, Instrument-Beschriftung, Kicker' },
      { gewicht: 700, wo: 'Badges, Reiter, Feldüberschriften' },
    ],
  },
];

export const UNTERMENGEN = /** @type {const} */ (['latin', 'latin-ext']);

/**
 * Liest `unicode-range`, `font-family` und Dateinamen einer Untermenge aus der @fontsource-CSS
 * `<gewicht>.css` (nur diese trägt die unicode-range; die Einzeldateien `latin-800.css` nicht).
 * Jeder Block dort ist mit `/* <paket>-<untermenge>-<gewicht>-normal *\/` überschrieben.
 * @param {string} paket @param {string} untermenge @param {number} gewicht
 */
async function liesFontsourceCss(paket, untermenge, gewicht) {
  const pfad = resolve(WURZEL, 'node_modules/@fontsource', paket, `${gewicht}.css`);
  const css = await readFile(pfad, 'utf8');
  const marke = `/* ${paket}-${untermenge}-${gewicht}-normal */`;
  const start = css.indexOf(marke);
  if (start < 0) throw new Error(`Block ${marke} fehlt in ${pfad}`);
  const block = css.slice(start, css.indexOf('}', start) + 1);
  const bereich = /unicode-range:\s*([^;]+);/.exec(block)?.[1]?.trim();
  const familie = /font-family:\s*'([^']+)'/.exec(block)?.[1];
  const datei = /url\(\.\/files\/([^)]+\.woff2)\)/.exec(block)?.[1];
  if (!bereich || !familie || !datei) throw new Error(`Unerwartetes Format in ${pfad} (${marke})`);
  if (!/font-style:\s*normal/.test(block) || !new RegExp(`font-weight:\\s*${gewicht}\\b`).test(block)) {
    throw new Error(`Stil/Gewicht passen nicht in ${pfad} (${marke})`);
  }
  return { bereich, familie, datei };
}

/**
 * Baut den Text der Schriften-CSS.
 * @typedef {{ name: string, paket: string, paketVersion: string, schriftVersionen: string[], copyright: string, lizenz: string, spdx: string, upstream: string, quelle: string }} Komponente
 * @returns {Promise<{ css: string, eintraege: Array<{ familie: string, gewicht: number, untermenge: string, datei: string, bytes: number }>, komponenten: Komponente[] }>}
 */
export async function schriftenCss() {
  const versionen = [];
  const bloecke = [];
  const eintraege = [];
  /** @type {Komponente[]} */
  const komponenten = [];
  for (const s of SCHRIFTEN) {
    const pkg = JSON.parse(await readFile(resolve(WURZEL, 'node_modules/@fontsource', s.paket, 'package.json'), 'utf8'));
    versionen.push(`@fontsource/${s.paket} ${pkg.version} (${pkg.license})`);
    /** @type {Set<string>} */ const copyrights = new Set();
    /** @type {Set<string>} */ const schriftVersionen = new Set();
    for (const { gewicht } of s.gewichte) {
      for (const untermenge of UNTERMENGEN) {
        const { bereich, familie, datei } = await liesFontsourceCss(s.paket, untermenge, gewicht);
        if (familie !== s.familie) throw new Error(`Familienname weicht ab: ${familie} ≠ ${s.familie}`);
        const pfad = resolve(WURZEL, 'node_modules/@fontsource', s.paket, 'files', datei);
        const daten = await readFile(pfad);
        const namen = await woff2Namen(pfad);
        copyrights.add(namen.copyright);
        schriftVersionen.add(namen.version);
        eintraege.push({ familie, gewicht, untermenge, datei, bytes: daten.length });
        bloecke.push(
          `/* ${datei} */\n`
          + '@font-face {\n'
          + `  font-family: '${familie}';\n`
          + '  font-style: normal;\n'
          + '  font-display: swap;\n'
          + `  font-weight: ${gewicht};\n`
          + `  src: url(data:font/woff2;base64,${daten.toString('base64')}) format('woff2');\n`
          + `  unicode-range: ${bereich};\n`
          + '}\n',
        );
      }
    }
    // Copyright genau so, wie es in den ausgelieferten Schnitten steht; alle Schnitte einer Familie müssen übereinstimmen
    if (copyrights.size !== 1 || [...copyrights][0] === '') throw new Error(`${s.familie}: Copyright uneinheitlich oder leer (${[...copyrights].join(' | ')})`);
    const copyright = [...copyrights][0] ?? '';
    if (pkg.license !== 'OFL-1.1') throw new Error(`${s.paket}: Lizenz ${pkg.license}, erwartet OFL-1.1`);
    komponenten.push({
      name: s.familie,
      paket: `@fontsource/${s.paket}`,
      paketVersion: pkg.version,
      schriftVersionen: [...schriftVersionen].sort(),
      copyright,
      lizenz: 'SIL Open Font License 1.1',
      spdx: pkg.license,
      upstream: /\((https:\/\/[^)\s]+)\)/u.exec(copyright)?.[1] ?? '',
      quelle: `npm: @fontsource/${s.paket} ${pkg.version} (${String(pkg.repository?.url ?? '').replace(/^git\+/u, '').replace(/\.git$/u, '')})`,
    });
  }
  // „/*! … */“ bleibt beim Minifizieren stehen (bau.mjs: legalComments 'inline') – der OFL-Hinweis reist mit.
  const kopf = '/*! Schriften unter SIL Open Font License 1.1 (openfontlicense.org), eingebettet aus:\n'
    + versionen.map((v) => `   · ${v}\n`).join('')
    + komponenten.map((k) => `   ${k.name}: ${k.copyright}\n`).join('')
    + '   Untermengen latin, latin-ext (L-2). Erzeugt von werkzeuge/schriften.mjs – nicht von Hand ändern. */\n\n';
  return { css: kopf + bloecke.join('\n'), eintraege, komponenten };
}

/**
 * Angaben für den Bereich „Drittanbieter & Lizenzen“ (Audit 2026-10-06): je eingebetteter Schrift Name,
 * Versionen, Copyright, Lizenz und Herkunft, dazu der Lizenztext der OFL 1.1 unverändert aus der
 * LICENSE-Datei der Pakete (ab der Überschrift; alle Pakete müssen denselben Text tragen).
 * @param {Komponente[]} komponenten
 * @returns {Promise<{ komponenten: Komponente[], oflText: string }>}
 */
export async function drittanbieter(komponenten) {
  /** @type {Set<string>} */
  const texte = new Set();
  for (const s of SCHRIFTEN) {
    const lizenz = (await readFile(resolve(WURZEL, 'node_modules/@fontsource', s.paket, 'LICENSE'), 'utf8')).replace(/\r\n/gu, '\n');
    const ab = lizenz.indexOf('-----------------------------------------------------------\nSIL OPEN FONT LICENSE Version 1.1');
    if (ab < 0) throw new Error(`${s.paket}: OFL-1.1-Text nicht gefunden`);
    texte.add(lizenz.slice(ab).trimEnd());
  }
  if (texte.size !== 1) throw new Error('OFL-Text der Pakete weicht voneinander ab');
  return { komponenten, oflText: [...texte][0] ?? '' };
}

/**
 * Schreibt die Schriften-CSS.
 * @param {{ ziel?: string }} [optionen] Ziel relativ zur Repo-Wurzel oder absolut
 * @returns {Promise<{ ziel: string, bytes: number, eintraege: Array<{ familie: string, gewicht: number, untermenge: string, datei: string, bytes: number }> }>}
 */
export async function erzeugeSchriften({ ziel = 'src/generiert/schriften.css' } = {}) {
  const pfad = resolve(WURZEL, ziel);
  const { css, eintraege, komponenten } = await schriftenCss();
  await schreibeAtomar(pfad, css); // atomar (L-390)
  await schreibeAtomar(resolve(dirname(pfad), 'drittanbieter.json'), `${JSON.stringify(await drittanbieter(komponenten), null, 2)}\n`);
  return { ziel: pfad, bytes: Buffer.byteLength(css), eintraege };
}

if (istHauptmodul(import.meta.url)) {
  const i = process.argv.indexOf('--ziel');
  const ziel = i > 0 ? process.argv[i + 1] : undefined;
  const erg = await erzeugeSchriften(ziel ? { ziel } : {});
  const woff = erg.eintraege.reduce((s, e) => s + e.bytes, 0);
  console.log(`${erg.eintraege.length} @font-face-Regeln → ${erg.ziel}`);
  console.log(`woff2 roh: ${(woff / 1024).toFixed(1)} KiB · CSS gesamt: ${(erg.bytes / 1024).toFixed(1)} KiB (${erg.bytes} Bytes)`);
}
