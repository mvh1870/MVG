// Stilreferenz (P0.3): zeigt Marke, Farben, erlaubte Paare, Typorollen, jeden Baustein des
// Leitstands, die Startseite und eine Theorie-Lernseite – mit dem echten, von esbuild gebündelten
// src/stil/index.css (inklusive eingebetteter Schriften). Beispielinhalte aus dem Prototyp
// (fiktiver Fall, L-5); das Zitat ist wortgleich aus Whitepaper V1.2, Kap. 2.4.
//
// Aufruf:  node werkzeuge/stilreferenz.mjs            – schreibt tmp/stilreferenz.html
//          node werkzeuge/stilreferenz.mjs --bilder   – zusätzlich Bildschirmfotos (Chrome, 1280×720 und 400 px)

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { erzeugeSchriften } from './schriften.mjs';
import { istHauptmodul } from './haupt.mjs';
import { kontrast, liesTokens, loese } from '../src/stil/farben.ts';
import { statusSymbol, symbol, trendPfeil } from '../src/stil/symbole.ts';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = resolve(WURZEL, 'tmp/stilreferenz.html');

/** Bündelt src/stil/index.css (Schriften müssen vorher erzeugt sein). */
export async function stilCss() {
  await erzeugeSchriften();
  const erg = await build({
    entryPoints: [resolve(WURZEL, 'src/stil/index.css')],
    bundle: true,
    write: false,
    minify: true,
    target: ['chrome100', 'edge100', 'firefox100', 'safari15.4'],
    logLevel: 'silent',
  });
  const datei = erg.outputFiles[0];
  if (!datei) throw new Error('esbuild lieferte kein CSS');
  return { css: datei.text, warnungen: erg.warnings.length };
}

// ---------------------------------------------------------------------------------------------
// Kleine Bausteine für die Beispiele
// ---------------------------------------------------------------------------------------------

const sym = (/** @type {Parameters<typeof symbol>[0]} */ n, k = '') => symbol(n, k);
const st = (/** @type {Parameters<typeof statusSymbol>[0]} */ s) => statusSymbol(s);

/** Figur nach dem Klassenvertrag in leitstand.css (Frisuren wie im Prototyp). */
function figur(/** @type {string} */ wer, /** @type {string} */ rolle, /** @type {string} */ frisur, groesse = 38) {
  const H = 'class="figur-haar"';
  /** @type {Record<string, [string, string, string]>} */
  const FRISUR = {
    kurz: ['', `<path ${H} d="M21 26.5C20.3 17 26 13 32.2 13 38.8 13 44 17.2 43 26.5 41.2 21.4 37.4 19.4 32 19.6 26.8 19.8 23.2 22 21 26.5Z"/>`, ''],
    bart: ['', `<path ${H} d="M21.2 25.5C21 16.5 26.5 13.2 32 13.2S43.2 16.5 42.8 25.5C41 21.5 37 20 32 20S23 21.5 21.2 25.5Z"/><path ${H} d="M21.6 28.5C22 36.5 26.5 40.6 32 40.6S42 36.5 42.4 28.5C41 32.5 38.4 34 36 34.2 34.6 33 29.4 33 28 34.2 25.6 34 23 32.5 21.6 28.5Z"/>`, ''],
    lang: [`<path ${H} d="M18.5 30C17.5 16 24.5 11.5 32 11.5S46.5 16 45.5 30L47 50H17Z"/>`, `<path ${H} d="M21.3 25.5C21.8 17.5 26.5 14.5 32 14.5S42.3 17.5 42.7 25.5C39.5 21.8 35.5 20.5 30.5 21 26.8 21.4 23.6 23 21.3 25.5Z"/>`, ''],
    dutt: ['', `<circle ${H} cx="32" cy="11.5" r="5.6"/><path ${H} d="M21.2 26C21 17.5 26 14 32 14S43 17.5 42.8 26C40.8 21 36 19 31 19.6 26.5 20.2 23 22.5 21.2 26Z"/>`, ''],
    bob: [`<path ${H} d="M19.5 33C18.5 17 25 12.5 32 12.5S45.5 17 44.5 33C44.5 36 42 37 40 37H24C22 37 19.5 36 19.5 33Z"/>`, `<path ${H} d="M21.3 24C23 17.5 27 15 32 15S41.5 17.5 42.7 24C38 22.5 33.5 20.5 30 18.8 27.5 21.3 24.5 23 21.3 24Z"/>`, '<g class="figur-brille"><circle cx="28" cy="28" r="3.3"/><circle cx="36" cy="28" r="3.3"/><path d="M31.3 28h1.4"/></g>'],
    seite: ['', `<path ${H} d="M21.2 29C20.4 22.5 21.6 18.6 24 17l.6 8.5Z M42.8 29C43.6 22.5 42.4 18.6 40 17l-.6 8.5Z"/>`, ''],
  };
  const [hinten, vorn, extra] = FRISUR[frisur] ?? FRISUR.kurz;
  const id = `fg-${wer}-${groesse}`;
  return `<svg class="figur" data-rolle="${rolle}" data-figur="${wer}" width="${groesse}" height="${groesse}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">`
    + `<defs><clipPath id="${id}"><circle cx="32" cy="32" r="32"/></clipPath></defs>`
    + '<circle class="figur-grund" cx="32" cy="32" r="32"/>'
    + `<g clip-path="url(#${id})">${hinten}`
    + '<path class="figur-kleid" d="M7 66C7 51 17 43.5 32 43.5S57 51 57 66Z"/>'
    + '<path class="figur-kragen" d="M26.5 43.8 32 50.5 37.5 43.8Z"/>'
    + '<rect class="figur-hals" x="28" y="35" width="8" height="10" rx="3"/>'
    + `<ellipse class="figur-haut" cx="32" cy="27" rx="10.6" ry="12"/>${vorn}`
    + '<circle class="figur-auge" cx="28" cy="28" r="1.35"/><circle class="figur-auge" cx="36" cy="28" r="1.35"/>'
    + `<path class="figur-mund" d="M28.6 33.2Q32 35.8 35.4 33.2"/>${extra}`
    + '<rect class="figur-schild" x="38.5" y="51" width="11" height="6.5" rx="1.3"/>'
    + '<rect class="figur-schild-linie" x="40.3" y="53.4" width="7.4" height="1.7" rx=".85"/>'
    + '</g></svg>';
}

const BESETZUNG = {
  pl: ['pl', 'kurz', 'Sie', 'Bauherren-PL'],
  brenner: ['ps', 'bart', 'Jonas Brenner', 'Projektsteuerung, extern'],
  kaya: ['ctl', 'lang', 'Aylin Kaya', 'Controlling der GML'],
  hoffmeister: ['plan', 'dutt', 'Lena Hoffmeister', 'Generalplanung'],
  olbers: ['bh', 'bob', 'Dr. Miriam Olbers', 'Dezernentin, Bauherr'],
  deppe: ['gf', 'seite', 'Frank Deppe', 'Geschäftsführung GML'],
};
const person = (/** @type {keyof typeof BESETZUNG} */ k, g = 38) => figur(k, BESETZUNG[k][0], BESETZUNG[k][1], g);

function bogen(/** @type {number} */ i) {
  const cx = 32, cy = 33, r = 26;
  const a0 = (180 + i * 36 + 2.5) * Math.PI / 180, a1 = (180 + (i + 1) * 36 - 2.5) * Math.PI / 180;
  return `M${(cx + r * Math.cos(a0)).toFixed(2)} ${(cy + r * Math.sin(a0)).toFixed(2)}A${r} ${r} 0 0 1 ${(cx + r * Math.cos(a1)).toFixed(2)} ${(cy + r * Math.sin(a1)).toFixed(2)}`;
}

function instrumente() {
  const zeiger = `<svg class="instrument-grafik zeiger" data-status="kritisch" width="62" height="38" viewBox="0 0 64 38" aria-hidden="true">${[0, 1, 2, 3, 4].map((i) => `<path class="segment${i < 2 ? ' ist-an' : ''}" d="${bogen(i)}"/>`).join('')}<g class="nadel" style="transform:rotate(-18deg)"><line x1="32" y1="33" x2="32" y2="12"/></g><circle class="nabe" cx="32" cy="33" r="3.6"/></svg>`;
  const balken = `<svg class="instrument-grafik balken" data-status="kritisch" width="40" height="34" viewBox="0 0 40 34" aria-hidden="true">${[10, 17, 24, 31].map((h, i) => `<rect class="${i <= 2 ? 'ist-an' : ''}" x="${i * 10 + 1}" y="${33 - h}" width="7.5" height="${h}" rx="1.5"/>`).join('')}</svg>`;
  const punkte = (/** @type {number} */ n, /** @type {number} */ sp, /** @type {number} */ an) => `<svg class="instrument-grafik punkte" width="${sp * 9 + 1}" height="20" viewBox="0 0 ${sp * 9 + 1} 20" aria-hidden="true">${Array.from({ length: n }, (_, j) => `<rect class="${j < an ? 'ist-an' : ''}" x="${(j % sp) * 9 + 1}" y="${Math.floor(j / sp) * 10 + 1}" width="7" height="7" rx="1.5"/>`).join('')}</svg>`;
  const stufen = '<svg class="instrument-grafik stufen" width="54" height="30" viewBox="0 0 54 30" aria-hidden="true"><rect class="stufe stufe-ok" x="1" y="14" width="16" height="10" rx="2"/><rect class="stufe stufe-mittel ist-an" x="19" y="14" width="16" height="10" rx="2"/><rect class="stufe stufe-kritisch" x="37" y="14" width="16" height="10" rx="2"/><path class="marke-pfeil" d="M3.5 3h10L8.5 10z" style="transform:translateX(18px)"/></svg>';
  const inst = (/** @type {string} */ lbl, /** @type {string} */ grafik, /** @type {string} */ wert, zusatz = '', trend = '', blitz = false) =>
    `<div class="instrument${blitz ? ' blitz' : ''}" role="group" aria-label="${lbl}"><div class="instrument-kopf"><span class="instrument-label" aria-hidden="true">${lbl}</span><span class="trend"${trend ? ` data-trend="${trend.split('-')[0]}"` : ''} aria-hidden="true">${trend ? trendPfeil(trend.endsWith('hoch') ? 'hoch' : 'runter') : ''}</span></div><div class="instrument-mitte">${grafik}<div class="instrument-wert">${wert}<div class="instrument-zusatz">${zusatz}</div></div></div><span class="nur-sr">${lbl}: ${wert.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}</span></div>`;
  return `<section class="instrumente" aria-label="Statusinstrumente">
    <div class="welt-anzeige" data-welt="a"><span class="welt-k">Status</span><span class="welt-name"><span class="led"></span>Welt A</span><span class="welt-zusatz">ohne MVG</span></div>
    ${inst('Entscheidungsfähigkeit', zeiger, '<span class="wert">2</span><span class="wert-einheit">von 5</span>', `${st('kritisch')}<span>niedrig</span>`, 'schlecht-runter', true)}
    ${inst('Kostenunsicherheit', balken, `<span class="wert wort">${st('kritisch')}hoch</span>`, '', 'schlecht-hoch')}
    ${inst('Offene Risiken', punkte(10, 5, 5), '<span class="wert">5</span><span class="wert-einheit">offen</span>')}
    ${inst('Ungeklärte Entscheidungen', punkte(6, 3, 3), '<span class="wert">3</span><span class="wert-einheit">offen</span>', '<span>1 neu</span>')}
    ${inst('Terminrisiko', stufen, `<span class="wert wort">${st('mittel')}mittel</span>`)}
  </section>`;
}

function storyKarte() {
  const zeile = (/** @type {string} */ a, /** @type {string} */ b, /** @type {string} */ knoten, /** @type {string} */ klasse, /** @type {string} */ inhalt, attr = '') =>
    `<li class="station ${klasse}" data-a="${a}" data-b="${b}"${attr}><span class="spur" aria-hidden="true"><i class="spur-a"></i><i class="spur-b"></i>${knoten}</span>${inhalt}</li>`;
  const ab = '<i class="knoten knoten-a"></i><i class="knoten knoten-b"></i>';
  const schritte = [['a', '1', 'Einstieg', ''], ['a', '2', 'Was Sie wissen', ''], ['a', '3', 'Entscheidung', 'aktuell'], ['a', '4', 'Konsequenz', 'offen'], ['ab', '5', 'Welt A ⟷ B', 'offen'], ['b', '6', 'Welt B', 'offen'], ['b', '7', 'Tiefer gehen', 'offen']]
    .map(([w, n, t, z]) => `<li><button type="button" class="station" data-a="linie" data-b="linie"${z === 'aktuell' ? ' aria-current="step"' : ''}><span class="spur" aria-hidden="true"><i class="spur-a"></i><i class="spur-b"></i><i class="knoten knoten-klein${z === 'aktuell' ? ' ist-aktuell' : z === 'offen' ? ' ist-offen' : ''}" data-welt="${w}"></i></span><span class="schritt-nr">${n}</span><span class="station-titel">${t}</span></button></li>`).join('');
  return `<nav class="story-karte" aria-label="Story-Karte">
    <div class="karte-kopf"><div class="karte-kicker">Story-Karte</div><div class="karte-jetzt" data-welt="a"><span class="led"></span><span><b>Welt A</b></span></div><div class="karte-meta">Station 3 · Monat 5<br>Rolle: Bauherren-PL</div></div>
    <ol class="zeitleiste">
      ${zeile('start', 'keine', '<i class="knoten knoten-a"></i>', 'ist-erledigt', '<span class="station-titel">Prolog</span>')}
      ${zeile('linie', 'start', ab, 'ist-erledigt', '<span class="station-nr">1</span><span class="station-titel">Übernahme</span><span class="station-meta">M1</span>')}
      ${zeile('linie', 'linie', ab, 'ist-erledigt', '<span class="station-nr">2</span><span class="station-titel">Erstes Signal</span><span class="station-meta">M3</span>')}
      ${zeile('linie', 'linie', '<i class="knoten knoten-a ist-gross ist-aktuell"></i><i class="knoten knoten-b"></i>', 'ist-aktuell', '<span class="station-nr">3</span><span class="station-titel">Kosten +8 %</span><span class="station-meta">M5</span>', ' aria-current="location"')}
      <li><ol class="schritte">${schritte}</ol></li>
      ${zeile('linie', 'linie', ab, 'ist-kuenftig', '<span class="station-nr">4</span><span class="station-titel">Ausschuss vertagt</span><span class="station-meta">M7</span>')}
      ${zeile('linie', 'linie', ab, 'ist-kuenftig', '<span class="station-nr">5</span><span class="station-titel">Folgekosten</span><span class="station-meta">M9</span>')}
      ${zeile('ende', 'linie', '<i class="knoten knoten-wende"></i><svg class="rueckspul-bogen" viewBox="0 0 22 30" preserveAspectRatio="none" aria-hidden="true"><path d="M2 0 C 2 16, 18 12, 18 30"/></svg>', 'ist-kuenftig ist-wendepunkt', '<span class="station-titel">Wendepunkt: Ursachenanalyse</span>')}
      ${zeile('keine', 'linie', `<i class="knoten knoten-rueck">${sym('zurueckspulen')}</i>`, 'ist-kuenftig', '<span class="station-titel">Welt B (dieselben Stationen)</span>')}
      ${zeile('keine', 'ende', '<i class="knoten knoten-ende"><i></i><i></i><i></i></i>', 'ist-kuenftig', '<span class="station-titel">3 Enden</span>')}
    </ol>
  </nav>`;
}

const OPTIONEN = [
  ['A', 'Weiterarbeiten und Ursachenanalyse parallel', 'weiterarbeiten'],
  ['B', 'Entscheidungsvorlage verlangen', 'dokument'],
  ['C', 'Eskalation auslösen (an die Geschäftsführung)', 'eskalieren'],
  ['D', 'Prognose aktualisieren lassen', 'aktualisieren'],
];
function entscheidung(gewaehlt = '') {
  return `<div class="stapel">
    <div class="kurzlage"><span class="t-label">Lage</span><span class="chip ist-warnung">Kosten +8 % <small>Projektsteuerung</small></span><span class="chip">+5,9 % <small>Controlling</small></span><span class="chip">LPH 5 <small>Ausführungsplanung</small></span></div>
    <div class="optionen">${OPTIONEN.map(([k, t, i], n) => `<button type="button" class="option" style="--verzug:${n * 80}ms"${gewaehlt === k ? ' aria-pressed="true"' : ''}><kbd class="option-taste">${k}</kbd><span class="option-text">${t}</span><span class="option-symbol">${sym(/** @type {any} */ (i))}</span></button>`).join('')}</div>
    <p class="options-hinweis">Tasten <kbd>A</kbd>–<kbd>D</kbd> wählen · <kbd>←</kbd> <kbd>→</kbd> blättern</p>
  </div>`;
}

function seitenleiste(offen = true) {
  return `<aside class="seitenleiste" aria-label="Kontext">
    <div class="seitenleiste-schiene">
      <button type="button" class="schienen-knopf" aria-label="Rollen-Linse öffnen" aria-expanded="${offen}">${sym('person')}</button>
      <button type="button" class="schienen-knopf" aria-label="Ebenen öffnen" aria-expanded="${offen}">${sym('ebenen')}</button>
      <button type="button" class="schienen-knopf" aria-label="Glossar öffnen" aria-expanded="${offen}">${sym('buch')}</button>
    </div>
    <div class="seitenleiste-karte">
      <section class="rollen-box" aria-label="Rollen-Linse"><span class="t-label">Rollen-Linse</span>
        <div class="rollen-box-zeile">${person('pl', 50)}<span class="rollen-chip" data-rolle="pl">Sie spielen: <b>Bauherren-Projektleitung</b></span></div>
        <button type="button" class="knopf-linse">${sym('wechsel')}Standpunkt wechseln</button>
      </section>
      <div class="reiter-leiste" role="tablist" aria-label="Kontext wählen">
        <button type="button" class="reiter" role="tab" aria-selected="true">Im Raum</button>
        <button type="button" class="reiter" role="tab" aria-selected="false">Ebenen</button>
        <button type="button" class="reiter" role="tab" aria-selected="false">Glossar</button>
      </div>
      <div class="seitenleiste-inhalt" role="tabpanel">
        <h3 class="leiste-titel">Im Raum · Monat 5</h3>
        <ul class="besetzung">
          <li>${person('brenner')}<div><b>Jonas Brenner</b><span>Projektsteuerung, extern</span></div></li>
          <li>${person('kaya')}<div><b>Aylin Kaya</b><span>Controlling der GML</span></div></li>
          <li class="ist-entfernt">${person('hoffmeister')}<div><b>Lena Hoffmeister</b><span>Generalplanung · nur Notiz und Anruf</span></div></li>
        </ul>
        <h3 class="leiste-titel">Der Fall</h3>
        <dl class="fall-daten"><div><dt>Projekt</dt><dd>Schulcampus Lindenhall-Süd (fiktiv)</dd></div><div><dt>Projektbasis</dt><dd>58,4 Mio. € brutto</dd></div><div><dt>Stand</dt><dd>LPH 5 Ausführungsplanung</dd></div></dl>
      </div>
      <footer class="seitenleiste-fuss"><span>Tasten: ← → blättern · A–D wählen · Esc schließt</span><button type="button" class="knopf-neustart">${sym('zurueckspulen')}Neu</button></footer>
    </div>
  </aside>`;
}

function leitstand({ instrumente: mitInstrumenten = true, karte = true, seite = 'offen', inhalt = entscheidung(), titel = 'Was tun Sie?' } = {}) {
  return `<div class="leitstand ohne-aufbau"${mitInstrumenten ? ' data-instrumente' : ''}${karte ? ' data-karte' : ''} data-seitenleiste="${seite}">
    <header class="kopf"><div class="marke">${LOGO_WEISS.replace('<svg ', '<svg class="marke-logo" ')}<div class="marke-titel"><h1 class="kopf-titel">Zwei Welten. Ein Schulcampus.</h1><p class="kopf-unter">Minimum Viable Governance – ein interaktives Whitepaper von Bauherr Mentoren</p></div></div><p class="vermerk">Fall fiktiv · fachlich ungeprüft</p></header>
    ${instrumente()}
    ${storyKarte()}
    <main class="lagetafel" data-welt="a" aria-labelledby="tafel-titel">
      <div class="tafel-kopf"><div class="tafel-text"><p class="tafel-kicker">Schritt 3 · Entscheidung</p><h2 class="tafel-titel" id="tafel-titel">${titel}</h2></div><div class="uhr" aria-hidden="true"><span class="uhr-tag">Mo · Monat 5</span><span class="uhr-zeit">08:30</span></div><span class="welt-badge" data-welt="a">Welt A · ohne MVG</span></div>
      <div class="tafel-inhalt"><div class="szene">${inhalt}</div></div>
    </main>
    <div class="fussleiste">
      <button type="button" class="nav-knopf" aria-label="Zurück">${sym('pfeilLinks')}<span class="nav-knopf-text">Zurück</span></button>
      <div class="fortschritt" role="group" aria-label="Schritte der Szene">${['Einstieg', 'Was Sie wissen', 'Entscheidung', 'Konsequenz', 'Welt A ⟷ B', 'Welt B', 'Tiefer gehen'].map((t, i) => `<button type="button" class="fortschritt-schritt${i < 2 ? ' ist-erledigt' : ''}" data-welt="${i < 4 ? 'a' : i === 4 ? 'ab' : 'b'}"${i === 2 ? ' aria-current="step"' : ''}><span class="fs-zeile"><span class="fs-nr">${i + 1}</span><span class="fs-titel">${t}</span></span>${i === 5 ? '<span class="fs-takte"><i></i><i></i><i></i><i></i><i></i><i></i></span>' : ''}</button>`).join('')}</div>
      <button type="button" class="nav-knopf weiter"><span class="nav-knopf-text">Weiter</span>${sym('pfeilRechts')}</button>
    </div>
    ${seitenleiste(seite === 'offen')}
  </div>`;
}

// ---------------------------------------------------------------------------------------------
// Seite
// ---------------------------------------------------------------------------------------------

/** @type {string} */
let LOGO_WEISS = '';

const ZITAT_2_4 = [
  'Die naheliegende Reaktion auf Projektprobleme lautet oft: mehr Berichterstattung, mehr Abstimmung, mehr Gremienvorlagen, mehr Eskalationsrunden. Das kann in einzelnen Situationen helfen. Es löst aber nicht automatisch die Frage, wer was auf welcher Grundlage entscheiden darf und muss.',
  'Berichterstattung erzeugt Information. Führung entsteht erst, wenn Information mit Mandat, Entscheidung, Schwelle, Risikoannahme, Datenstand, Freigabe und Nachweis verbunden wird. Ein Ampelbericht ohne Entscheidungsfrage bleibt Beobachtung. Ein Änderungsregister ohne Schwellenlogik bleibt Verwaltung. Eine Risikoübersicht ohne Risikoannahme bleibt Warnsignal. Eine Gremienvorlage ohne klare Entscheidungssituation bleibt Beschlussformalismus.',
];

async function seite() {
  const { css, warnungen } = await stilCss();
  const tokensCss = await readFile(resolve(WURZEL, 'src/stil/tokens.css'), 'utf8');
  const tokens = liesTokens(tokensCss);
  const { paare } = JSON.parse(await readFile(resolve(WURZEL, 'src/stil/paare.json'), 'utf8'));
  const logo = (await readFile(resolve(WURZEL, 'quellen/marke/logo-bm.svg'), 'utf8')).trim();
  const bildmarke = (await readFile(resolve(WURZEL, 'quellen/marke/logo-bm-bildmarke.svg'), 'utf8')).trim();
  LOGO_WEISS = bildmarke.replace(/<title>.*?<\/title>/, '').replace('role="img" aria-label="Bauherr Mentoren (Bildmarke)"', 'aria-hidden="true" focusable="false"');
  const logoKlein = (/** @type {string} */ k) => LOGO_WEISS.replace('<svg ', `<svg class="${k}" `);

  // Farbgruppen in der Reihenfolge von tokens.css (Abschnittskommentare als Überschriften)
  /** @type {Array<{ titel: string, namen: string[] }>} */
  const gruppen = [];
  for (const zeile of tokensCss.split('\n')) {
    const kopf = /\/\*\s*-{6,}\s*(.+?)\s*\*\//.exec(zeile);
    if (kopf?.[1]) { gruppen.push({ titel: kopf[1], namen: [] }); continue; }
    for (const m of zeile.matchAll(/(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{3,6}|var\(--[\w-]+\))\s*;/g)) {
      const name = m[1];
      if (!name || !gruppen.length) continue;
      try { if (/^#/.test(loese(tokens, name))) gruppen.at(-1)?.namen.push(name); } catch { /* kein Farbwert */ }
    }
  }
  const farben = gruppen.filter((g) => g.namen.length).map((g) => `<h3 class="ref-h3">${g.titel}</h3><div class="ref-farben">${g.namen.map((n) => {
    const hex = loese(tokens, n).toUpperCase();
    const kW = kontrast(hex, '#FFFFFF'), kN = kontrast(hex, loese(tokens, '--navy'));
    return `<div class="ref-farbe"><span class="ref-feld" style="background:var(${n})"></span><code>${n}</code><span>${hex}</span><small>Weiß ${kW.toFixed(1)} · Navy ${kN.toFixed(1)}</small></div>`;
  }).join('')}</div>`).join('');

  const paarListe = paare.map((/** @type {any} */ p) => {
    const k = kontrast(loese(tokens, p.text), loese(tokens, p.grund));
    const art = p.grafik ? 'Grafik' : p.gross ? 'groß' : 'Text';
    return `<div class="ref-paar" style="color:var(${p.text});background:var(${p.grund})"><b>${k.toFixed(1).replace('.', ',')}:1</b> ${art === 'Grafik' ? '■ ● ◆' : 'Aa Beispiel'}<small>${p.text} auf ${p.grund} · ${art}</small></div>`;
  }).join('');

  const typo = [
    ['Titel (Kopf) · Big Shoulders 800', '<span class="t-titel">Zwei Welten. Ein Schulcampus.</span>'],
    ['Anzeige / Kennzahl · Big Shoulders 800', '<span class="t-anzeige">58,4 MIO. €</span> <span class="wert">31</span>'],
    ['Tafeltitel · IBM Plex Sans 700', '<span style="font:var(--typo-tafeltitel)">Montag, 08:30 Uhr. Monat 5 nach Ihrer Übernahme.</span>'],
    ['Fließtext · IBM Plex Sans 400/15', '<span style="font:var(--typo-text)">Die Projektsteuerung meldet eine Kostenabweichung. Das Controlling rechnet anders.</span>'],
    ['Lesetext Theorie · IBM Plex Sans 400/17', '<span style="font:var(--typo-lese)">Berichterstattung erzeugt Information. Führung entsteht erst, wenn Information mit Mandat, Entscheidung, Schwelle, Risikoannahme, Datenstand, Freigabe und Nachweis verbunden wird.</span>'],
    ['Label · Barlow Condensed 600', '<span class="t-label">Statusinstrumente · Ebene 3</span>'],
    ['Kicker · Barlow Condensed 600', '<span class="t-kicker">Schritt 3 · Entscheidung</span>'],
    ['Reiter · Barlow Condensed 700', '<span style="font:var(--typo-reiter);letter-spacing:.06em;text-transform:uppercase">Im Raum · Ebenen · Glossar</span>'],
    ['Mono · IBM Plex Mono 500/600', '<span class="mono">ENT-017 · Kostenprognose_2026-05_v3.xlsx</span>'],
    ['Hand · Caveat 700 (nur Haftnotizen)', '<span class="t-hand">Wer hat das freigegeben?</span>'],
  ].map(([k, v]) => `<div class="ref-typo"><span class="t-label">${k}</span><div>${v}</div></div>`).join('');

  const konsequenz = `<div class="stapel">
    <div class="wahl-kopf"><div class="wahl"><kbd class="option-taste">A</kbd><div><span class="t-label">Ihre Wahl</span><b>Weiterarbeiten und Ursachenanalyse parallel</b></div></div>
      <div class="status-leiste"><span class="t-label">Status</span>${st('kritisch')}<span>Entscheidungsfähigkeit niedrig</span>${st('mittel')}<span>Terminrisiko mittel</span></div></div>
    <div class="felder">
      <section class="feld" data-art="konsequenz" style="--verzug:0ms"><h3>${sym('blitz')}Konsequenz</h3><p>Die Arbeit läuft weiter. Zwei Wochen später hat die Generalplanung eine günstigere Fassade „schon mal durchgerechnet“ – ohne Auftrag und ohne Freigabe.</p></section>
      <section class="feld" data-art="fehlt" style="--verzug:100ms"><h3>${sym('puzzle')}Was fehlte</h3><p>Wer entscheidet über Änderungen am Projektumfang – und ab welcher Summe?</p></section>
      <section class="feld" data-art="risiko" style="--verzug:200ms"><h3>${sym('warnung')}Risiko</h3><p>Schleichende Änderung des Projektumfangs; der Bauausschuss erfährt es zuletzt.</p></section>
      <section class="feld" data-art="governance" style="--verzug:300ms"><h3>${sym('kompass')}Governance-Frage</h3><p><button type="button" class="begriff">Mandat</button>: Welche Schwelle löst eine Entscheidung des Bauherrn aus?</p></section>
    </div>
    <div class="feld-fuss"><p class="kernsatz-kurz">Keine dieser Entscheidungen ist falsch. In Welt A fehlt die Struktur, in der sie wirken könnten.</p><p class="gedaechtnis">${sym('lesezeichen')}Ihre Wahl wird in Welt B wieder aufgegriffen.</p>
      <div class="nochmal"><span class="t-label">Andere Wahl</span>${['A', 'B', 'C', 'D'].map((k) => `<button type="button" class="nochmal-knopf" aria-pressed="${k === 'A'}">${k}</button>`).join('')}</div></div>
  </div>`;

  const bausteine = `
  <section class="ref-abschnitt" id="knoepfe"><h2 class="ref-h2">Knöpfe</h2><div class="ref-tafel reihe" style="--luecke:16px">
    <button type="button" class="knopf knopf-navy">${sym('vorspulen')}<span><b>Zwei Wochen vorspulen</b><small>Zeitsprung</small></span></button>
    <button type="button" class="knopf knopf-navy" disabled>${sym('vorspulen')}<span><b>Gesperrt</b><small>erst nach Lagebild</small></span></button>
    <button type="button" class="knopf knopf-gold">${sym('pfeilRechts')}<span><b>Zur Entscheidung</b></span></button>
    <button type="button" class="knopf knopf-still" aria-pressed="false">${sym('haken')}Ja, entscheidungsreif</button>
    <button type="button" class="knopf knopf-still" aria-pressed="true">${sym('kreuz')}Nein, noch nicht</button>
  </div></section>

  <section class="ref-abschnitt"><h2 class="ref-h2">Entscheidungsknöpfe A–D (gewählt: B)</h2><div class="ref-tafel">${entscheidung('B')}</div></section>
  <section class="ref-abschnitt"><h2 class="ref-h2">Konsequenz-Felder</h2><div class="ref-tafel">${konsequenz}</div></section>

  <section class="ref-abschnitt"><h2 class="ref-h2">Karten, Kacheln, Hinweise</h2><div class="ref-tafel ref-raster">
    <div class="karte"><h3 class="karte-titel">${sym('info')}Was Sie wissen</h3><p>Die Projektsteuerung meldet +8 %, das Controlling +5,9 %.</p>
      <div class="neu-hinweis"><span class="neu-marke">neu</span><p>Die Generalplanung rechnet eine günstigere Fassade.</p></div></div>
    <div class="karte ist-leise"><h3 class="karte-titel">${sym('frage')}Was Sie nicht wissen</h3>
      <ul class="ungeklaert"><li><span class="fragezeichen">?</span><span class="ungeklaert-text">Welche Zahl gilt?</span></li><li class="ist-geloest"><span class="fragezeichen">${sym('haken')}</span><span class="ungeklaert-text">Wer bereitet vor?</span><span class="ungeklaert-tag">geklärt</span></li><li class="ist-offen"><span class="fragezeichen">?</span><span class="ungeklaert-text">Wer entscheidet?</span><span class="ungeklaert-tag ist-offen">weiter offen</span></li></ul></div>
    <div class="stapel">
      <div class="spaeter">${sym('vorspulen')}<b>Zwei Wochen später</b><span>Monat 5 · Woche 3</span></div>
      <p class="lehre">${sym('lesezeichen')}Eine Kostenabweichung ist erst führbar, wenn klar ist, wer auf welchem Datenstand entscheidet.</p>
      <div class="urteil"><span class="t-label">Urteil</span><b>Änderungsgremium</b><p>Über 100 TEUR bis einschließlich 5 Mio. € (Mandatsleiter, Muster).</p></div>
      <div class="kacheln" data-welt="a"><div class="kachel"><b>2</b><span>Zahlen im Umlauf</span></div><div class="kachel"><b>0</b><span>benannte Datenstände</span></div><div class="kachel ist-jetzt"><b>3</b><span>offene Fragen</span></div></div>
    </div>
    <div class="kette">
      <div class="glied"><span class="id-marke" data-art="frw">FRW-031</span><b>Frühwarnung</b><span>unbewertetes Signal: Prognose +8 %</span></div>
      <div class="glied-link"><span class="stempel" data-rolle="ps">${person('brenner', 26)}<span>bestätigt<small>Projektsteuerung</small></span></span></div>
      <div class="glied" data-welt="b"><span class="id-marke" data-art="ris">RIS-012</span><b>Risiko</b><span>bewertet, Risikoannahme offen</span></div>
    </div>
  </div></section>

  <section class="ref-abschnitt"><h2 class="ref-h2">Chips, Badges, ID-Marken, Siegel, Versionen</h2><div class="ref-tafel stapel">
    <div class="reihe"><span class="badge" data-status="ok">${st('ok')}freigegeben</span><span class="badge" data-status="mittel">${st('mittel')}in Prüfung</span><span class="badge" data-status="kritisch">${st('kritisch')}keine Freigabe</span><span class="badge" data-status="neutral">${st('neutral')}offen</span><span class="badge" data-welt="a">Welt A</span><span class="badge" data-welt="b">Welt B</span>${['gf', 'bh', 'pl', 'ps', 'plan', 'ctl'].map((r) => `<span class="badge" data-rolle="${r}">${{ gf: 'Geschäftsführung', bh: 'Bauherr', pl: 'Bauherren-PL', ps: 'Projektsteuerung', plan: 'Planung', ctl: 'Controlling' }[r]}</span>`).join('')}</div>
    <div class="reihe">${[['ent', 'ENT-017'], ['ris', 'RIS-012'], ['frw', 'FRW-031'], ['aen', 'AEN-022'], ['mas', 'MAS-008'], ['nac', 'NAC-004']].map(([a, t]) => `<span class="id-marke" data-art="${a}">${t}</span>`).join('')}<span class="chip">+5,9 % <small>Controlling</small></span><span class="chip ist-warnung">+8 % <small>Projektsteuerung</small></span><span class="siegel">${sym('stempel')}Datenstand</span><span class="welt-badge" data-welt="a">Welt A · ohne MVG</span><span class="welt-badge" data-welt="b">Welt B · mit MVG</span><span class="welt-badge" data-welt="ab">Welt A ⟷ B</span></div>
    <ol class="versionen"><li class="ist-alt"><b>v1</b>Januar</li><li class="ist-alt"><b>v2</b>März</li><li class="ist-aktuell"><b>v3</b>gilt seit Mai</li><li class="ist-naechste"><b>v4</b>in Vorbereitung</li></ol>
  </div></section>

  <section class="ref-abschnitt"><h2 class="ref-h2">Requisiten: Haftnotiz, Mail, Chat, Excel-Stand</h2><div class="ref-tafel ref-raster">
    <div class="pinnwand"><span class="pinnwand-label t-label">Pinnwand · Welt A</span>
      <svg class="faeden" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path style="--verzug:.4s" d="M28 30 C 50 40, 55 60, 72 70"/></svg>
      <p class="haftnotiz" style="--dreh:-3deg">${sym('warnung')}Kosten +8 %?</p><p class="haftnotiz" data-farbe="rosa" style="--dreh:2deg;--verzug:120ms">Wer entscheidet?</p><p class="haftnotiz" data-farbe="lila" style="--dreh:-1.5deg;--verzug:240ms">Fassade billiger?</p><p class="haftnotiz" data-farbe="gruen" style="--dreh:3deg;--verzug:360ms">Förderfrist!</p></div>
    <div class="stapel">
      <article class="mail"><div class="mail-leiste">${sym('mail')}Posteingang<span class="mail-neu">neu</span><span class="mail-zeit">08:12</span></div>
        <div class="mail-inhalt"><div class="absender">${person('brenner')}<div><b>Jonas Brenner</b><span>Projektsteuerung, extern</span></div></div>
          <p class="mail-betreff"><span class="t-label">Betreff</span>Kostenprognose LPH 5 – Abweichung</p><p class="mail-text">Die Prognose liegt bei +8 %. Details im Anhang.</p>
          <span class="anhang">${sym('tabelle')}<span class="mono">Kostenprognose_2026-05_v3.xlsx</span></span></div></article>
      <div class="chat">${person('hoffmeister', 34)}<div class="sprechblase"><div class="blase-kopf"><b>Lena Hoffmeister</b><span>Generalplanung</span><span class="blase-zeit">08:24</span></div><p class="nachricht">Soll ich die Fassade schon mal günstiger umplanen?</p></div></div>
      <div class="reihe"><div class="tabellenstand" style="--dreh:-1deg"><span class="tabellenstand-quelle">${sym('tabelle')}Controlling</span><span class="tabellenstand-zahl">+5,9 %</span><span class="tabellenstand-datei mono">KP_Controlling_final2.xlsx</span></div><span class="ungleich">≠</span><div class="tabellenstand" style="--dreh:1.2deg"><span class="tabellenstand-quelle">${sym('tabelle')}Projektsteuerung</span><span class="tabellenstand-zahl">+8,0 %</span><span class="tabellenstand-datei mono">Prognose_PS_Mai.xlsx</span></div></div>
    </div>
  </div></section>

  <section class="ref-abschnitt"><h2 class="ref-h2">Figuren (Rollenfarbe, Namensschild)</h2><div class="ref-tafel reihe" style="--luecke:24px">${Object.entries(BESETZUNG).map(([k, [, , n, r]]) => `<div class="absender">${person(/** @type {any} */ (k), 64)}<div><b>${n}</b><span>${r}</span></div></div>`).join('')}</div></section>

  <section class="ref-abschnitt"><h2 class="ref-h2">Schieberegler Welt A ⟷ Welt B und Vergleichsszene</h2><div class="ref-tafel stapel">
    <div class="vergleich" style="--t:.35;height:200px"><div class="vergleich-a"></div><div class="vergleich-b"></div><span class="vergleich-marke" data-welt="a">Welt A · ohne MVG</span><span class="vergleich-marke" data-welt="b">Welt B · mit MVG</span></div>
    <div class="welt-regler"><button type="button" class="regler-ende" data-welt="a"><b>Welt A</b><small>ohne MVG</small></button>
      <div class="regler-bahn"><div class="regler-schiene"></div><div class="regler-griff" role="slider" tabindex="0" aria-label="Welt A bis Welt B" aria-valuemin="0" aria-valuemax="100" aria-valuenow="35" aria-valuetext="35 % Welt B" style="--wert:35">${sym('griff')}</div></div>
      <button type="button" class="regler-ende" data-welt="b"><b>Welt B</b><small>mit MVG</small></button></div>
    <div class="ablesung" data-welt="a"><div class="kachel"><b>2</b><span>Zahlen im Umlauf</span></div><div class="kachel"><b>0</b><span>Datenstände</span></div><div class="kachel"><b>3</b><span>offene Fragen</span></div><div class="kachel"><b>?</b><span>Mandat</span></div></div>
  </div></section>

  <section class="ref-abschnitt"><h2 class="ref-h2">Glossar-Begriff und Tooltip</h2><div class="ref-tafel">
    <p>Ein <button type="button" class="begriff">Datenstand</button> ist die benannte Grundlage einer Entscheidung.</p>
    <div class="tipp" role="tooltip" style="position:relative;margin-top:12px"><b>Datenstand</b>Benannte und versionierte Grundlage, auf der eine Entscheidung getroffen wird.<small>Glossar · Whitepaper V1.2</small></div>
  </div></section>

  <section class="ref-abschnitt"><h2 class="ref-h2">Ebenen 1–4 (Ebene 4 aktiv)</h2><div class="ref-tafel"><div class="ebenen">
    <nav class="ebenen-wahl" aria-label="Ebenen"><div class="ebenen-linie"></div><span class="ebenen-lot" style="transform:translateY(222px)"></span>${['Kernaussage', 'Warum relevant', 'Vertiefung', 'Nachweis'].map((t, i) => `<button type="button" class="ebene-knopf" aria-current="${i === 3}"><i>${i + 1}</i><span><small>Ebene ${i + 1}</small>${t}</span></button>`).join('')}</nav>
    <div class="stapel"><section class="ebene" data-ebene="4" aria-label="Ebene 4: Nachweis"><span class="t-label">Ebene 4 · Nachweis</span><blockquote class="zitat">${ZITAT_2_4[1]}“</blockquote><p class="quelle">${logoKlein('marke-logo')}<span>Originaltext, wörtlich · Quelle: <b>Whitepaper V1.2, Kap. 2.4</b></span></p></section>
      <section class="ebene" data-ebene="1"><span class="t-label">Ebene 1 · Kernaussage</span><p class="kernsatz">„Berichte erzeugen Information. Führung entsteht erst, wenn Information mit <em>Mandat</em>, <em>Entscheidung</em> und <em>Datenstand</em> verbunden wird.“</p></section></div>
  </div></div></section>

  <section class="ref-abschnitt"><h2 class="ref-h2">Entscheidungsvorlage mit Prüfliste</h2><div class="ref-tafel"><article class="vorlage">
    <header class="vorlage-kopf"><span class="id-marke">ENT-017</span><span class="t-label">Entscheidungsvorlage</span><span class="vorlage-meta">Frist: Änderungsgremium, Monat 5</span></header>
    <p class="vorlage-frage">Wie wird die Kostenabweichung aufgefangen?</p>
    <div class="pruef-spalten"><ul class="pruefliste">${[['erfuellt', 'Entscheidungsfrage'], ['erfuellt', 'Datenstand und zentrale Annahmen'], ['erfuellt', 'Optionen und Konsequenzen'], ['fehlt', 'Wirkung auf Termin']].map(([s, t]) => `<li class="pruefpunkt ist-an" data-stand="${s}"><span class="pruef-kaestchen">${sym(s === 'erfuellt' ? 'haken' : 'kreuz')}</span><span>${t}</span><span class="pruef-status">${s === 'fehlt' ? 'fehlt' : ''}</span></li>`).join('')}</ul>
      <ul class="pruefliste">${[['fehlt', 'Empfehlung', true], ['offen', 'Freigabe- oder Eskalationsweg', true], ['offen', 'Beschlusslage', false], ['offen', 'Nachverfolgung', false]].map(([s, t, an]) => `<li class="pruefpunkt${an ? ' ist-an' : ''}" data-stand="${s}"><span class="pruef-kaestchen">${sym(s === 'fehlt' ? 'kreuz' : 'ring')}</span><span>${t}</span><span class="pruef-status">${s === 'fehlt' ? 'fehlt' : 'noch offen'}</span></li>`).join('')}</ul></div>
  </article></div></section>

  <section class="ref-abschnitt"><h2 class="ref-h2">Vergleichstabelle, LPH-Band 0–9</h2><div class="ref-tafel stapel">
    <div class="vergleichstabelle"><table><thead><tr><th scope="col">Merkmal</th><th scope="col" data-welt="a">Welt A</th><th scope="col" data-welt="b">Welt B</th></tr></thead><tbody>
      <tr><td>Datenstand</td><td><span class="v">${st('kritisch')}zwei Zahlen</span></td><td><span class="v">${st('ok')}Version 3 gilt</span></td></tr>
      <tr><td>Entscheidung</td><td><span class="v">${st('mittel')}vertagt</span> <small>ohne Frage</small></td><td><span class="v">${st('ok')}ENT-017 mit Frist</span></td></tr></tbody></table></div>
    <ol class="lph-band" aria-label="Leistungsphasen">${['Bedarf', 'Grundlagen', 'Vorplanung', 'Entwurf', 'Genehmigung', 'Ausführung', 'Vergabe', 'Mitwirkung', 'Bauüberw.', 'Betreuung'].map((t, i) => `<li class="lph${i < 5 ? ' ist-erledigt' : ''}"${i === 5 ? ' aria-current="step"' : ''}>${i < 5 ? `<span class="lph-freigabe" title="Freigabe erteilt">${sym('haken')}</span>` : ''}<b>${i}</b><span>${t}</span></li>`).join('')}</ol>
    <div class="auf-navy" style="background:var(--navy);padding:12px;border-radius:10px"><ol class="lph-band" aria-label="Leistungsphasen auf Navy">${Array.from({ length: 10 }, (_, i) => `<li class="lph${i < 5 ? ' ist-erledigt' : ''}"${i === 5 ? ' aria-current="step"' : ''}><b>${i}</b><span>LPH ${i}</span></li>`).join('')}</ol></div>
  </div></section>

  <section class="ref-abschnitt"><h2 class="ref-h2">Zeitsprung (Standbild) und Rollen-Linse</h2><div class="ref-raster">
    <div style="position:relative;height:320px;border-radius:10px;overflow:hidden"><div class="zeitsprung"><div class="zeitsprung-innen"><div class="zeitsprung-k">${sym('vorspulen')}Zeitsprung</div><div class="zeitsprung-zahl">14<small>Tage</small></div><div class="lineal"><div class="lineal-streifen">${Array.from({ length: 20 }, (_, i) => `<span class="tag${i % 7 === 0 ? ' ist-montag' : ''}"><i></i>${i % 7 === 0 ? 'Mo' : ''}</span>`).join('')}</div><div class="lineal-kopf"></div></div><div class="zeitsprung-titel" style="opacity:1">Zwei Wochen später</div></div></div></div>
    <div style="position:relative;height:420px;border-radius:10px;overflow:hidden;background:var(--grund)"><div class="linse-grund"></div><section class="linse" role="dialog" aria-label="Standpunkt wechseln"><header class="linse-kopf"><div><span class="t-label">Rollen-Linse</span><h2 class="linse-titel">Standpunkt wechseln</h2></div><button type="button" class="knopf-schliessen" aria-label="Schließen">${sym('kreuz')}</button></header>
      <div class="linse-inhalt"><p class="linse-unter">Derselbe Montag, 08:30 Uhr – zwei andere Blickwinkel:</p>
        <div class="blickwinkel" data-rolle="ctl">${person('kaya', 58)}<div><span class="blickwinkel-rolle">Controlling</span><b>Aylin Kaya</b><blockquote>„Welche Prognose gilt – meine +5,9 % oder die +8 % der Projektsteuerung?“</blockquote></div></div>
        <div class="blickwinkel" data-rolle="plan">${person('hoffmeister', 58)}<div><span class="blickwinkel-rolle">Planung</span><b>Lena Hoffmeister</b><blockquote>„Soll ich die Fassade schon mal günstiger umplanen?“</blockquote></div></div></div></section></div>
  </div></section>`;

  const startseite = `<div class="startseite">
    <header class="start-kopf">${logoKlein('marke-logo')}<div class="start-absender"><b>Bauherr Mentoren</b><span>Whitepaper V1.2 · interaktiv</span></div></header>
    <main class="start-haupt">
      <div><p class="start-kicker">Minimum Viable Governance</p><h1 class="start-titel">Arbeit kann delegiert werden; bauherrenseitige Legitimation nicht.</h1><p class="start-these">Wie Bauherren komplexe Projekte <strong>entscheidungsfähig, mandatiert und nachweisbar</strong> führen. Wählen Sie Ihren Weg.</p></div>
      <div class="tueren">
        <a class="tuer" data-weg="theorie" href="#theorie"><svg class="tuer-bild kapitel-striche" viewBox="0 0 320 92" aria-hidden="true"><g transform="translate(0,20)">${[16, 8, 20, 4, 12, 0, 14, 6, 18, 10, 22, 8, 26].map((y, i) => `<rect x="${i * 24}" y="${y}" width="16" height="${52 - y}" rx="4" class="${i === 0 ? 'ist-an' : ''}" style="--verzug:${i * 50}ms"/>`).join('')}</g></svg>
          <h2 class="tuer-titel"><span class="tuer-kicker">Erklärt</span>Kapitel für Kapitel</h2><p class="tuer-text">Die gesamte MVG-Theorie in den 13 Kapiteln des Whitepapers, mit Grafiken zum Anklicken und dem Originaltext zum Nachlesen.</p>
          <span class="tuer-meta"><span>13 Kapitel · in Etappen lesbar</span><span class="tuer-los">Öffnen${sym('pfeilRechts')}</span></span></a>
        <a class="tuer" data-weg="story" href="#story"><svg class="tuer-bild" viewBox="0 0 320 92" aria-hidden="true"><circle class="weg-start" cx="14" cy="46" r="7"/><path class="weg-a" d="M22 46 C 60 46, 70 14, 110 22 S 150 70, 185 50 S 230 8, 262 30 S 290 74, 306 64"/><path class="weg-b" d="M22 46 C 90 46, 200 46, 306 46"/><text class="weg-text" data-welt="b" x="306" y="84" text-anchor="end">Welt B · mit MVG</text><text class="weg-text" data-welt="a" x="306" y="14" text-anchor="end">Welt A · ohne MVG</text></svg>
          <h2 class="tuer-titel"><span class="tuer-kicker">Erlebt</span>Als Geschichte</h2><p class="tuer-text">Zwei Welten, ein Schulcampus. Sie übernehmen eine Rolle und treffen die Entscheidungen, einmal ohne und einmal mit MVG.</p>
          <span class="tuer-meta"><span>ca. 30 Minuten · 6 Rollen</span><span class="tuer-los">Beginnen${sym('pfeilRechts')}</span></span></a>
      </div>
    </main>
    <footer class="start-fuss"><span>Ein interaktives Whitepaper von Bauherr Mentoren · Fall fiktiv · Stand V1.2 <span class="start-vermerk">fachlich ungeprüft</span></span><span class="leise-links"><button type="button" class="leise-link">Präsentieren</button><button type="button" class="leise-link">Glossar</button></span></footer>
  </div>`;

  const theorie = `<div class="lernseite">
    <header class="lern-kopf">${logoKlein('marke-logo')}<p class="lern-bereich">Erklärt <span>· Kapitel für Kapitel</span></p><a class="lern-kopf-link" href="#start">${sym('pfeilLinks')}Start</a></header>
    <div class="lern-rahmen">
      <details class="kapitel-verzeichnis" open><summary class="t-label">Kapitel</summary><ol class="kapitel-liste">${['Kurzfassung', 'Ausgangslage und Kernproblem', 'Verantwortungsfelder des Bauherrn', 'Minimum Viable Governance als Bauherren-Führungsmodell', 'MVG Companion als Umsetzungsbeschleuniger'].map((t, i) => `<li><a href="#k${i + 1}"${i === 1 ? ' aria-current="page"' : ''}${i === 0 ? ' class="ist-gelesen"' : ''}><b>${i + 1}</b><span>${t}</span></a></li>`).join('')}</ol></details>
      <article class="lern-inhalt">
        <header class="kapitel-kopf"><span class="kapitel-nr">2</span><p class="kapitel-kicker">Kapitel 2 · Abschnitt 2.4</p><h1 class="kapitel-titel">Warum Berichterstattung das Kernproblem nicht löst</h1><p class="kapitel-einstieg">Beispielinhalt der Stilreferenz – die Lernseiten entstehen in P5 aus inhalte/theorie/.</p></header>
        <p><span class="vermerk-hell">${sym('info')}fachlich ungeprüft</span></p>
        <section class="kernaussage"><span class="t-label">Kernaussage</span><p>Berichte erzeugen Information. Führung entsteht erst, wenn Information mit <em>Mandat</em>, <em>Entscheidung</em> und <em>Datenstand</em> verbunden wird.</p></section>
        <div class="lesetext"><h2>Worum es geht</h2><p>Die Lernseite ist ruhig: eine Lesespalte, viel Weißraum, dieselben Schriften wie der Leitstand, aber kein Rahmen und keine Instrumente.</p><ul><li>Kernaussage zuerst</li><li>Karten zum Aufklappen</li><li>Originaltext mit Absatz-ID</li></ul></div>
        <div class="lernkarten"><button type="button" class="lernkarte" aria-expanded="false"><span class="lernkarte-titel">${sym('flagge')}Mandat</span><p>Wer darf entscheiden – und bis zu welcher Schwelle?</p></button><button type="button" class="lernkarte" aria-expanded="true"><span class="lernkarte-titel">${sym('stempel')}Datenstand</span><p>Welche Zahl gilt, und wer hat sie festgelegt?</p></button><div class="lernkarte" data-welt="b"><span class="lernkarte-nr">6</span><p>Verantwortungsfelder</p></div></div>
        <section class="originaltext" aria-label="Originaltext"><header class="originaltext-kopf"><span class="t-label">Originaltext V1.2 · wörtlich</span><span class="originaltext-quelle">Whitepaper V1.2, Kap. 2.4 · Absatz-IDs als Beispiel</span></header>
          ${ZITAT_2_4.map((t, i) => `<p class="absatz" id="abs-2-4-0${i + 1}"><a class="absatz-id" href="#abs-2-4-0${i + 1}">2.4-0${i + 1}</a><span>${t}</span></p>`).join('')}</section>
        <div class="querverweise"><a class="querverweis" data-welt="a" href="#story-a3"><span class="querverweis-symbol">${sym('pfeilRechts')}</span>In der Story: Station 3 <small>Welt A</small></a><a class="querverweis" data-welt="b" href="#story-b3"><span class="querverweis-symbol">${sym('pfeilRechts')}</span>Derselbe Montag <small>Welt B</small></a><a class="querverweis" href="#glossar"><span class="querverweis-symbol">${sym('buch')}</span>Glossar: Datenstand</a></div>
        <nav class="kapitel-nav" aria-label="Kapitel blättern"><a href="#k1" rel="prev"><span class="t-label">Zurück · Kapitel 1</span><b>Kurzfassung</b></a><a href="#k3" rel="next"><span class="t-label">Weiter · Kapitel 3</span><b>Verantwortungsfelder</b></a></nav>
      </article>
    </div>
  </div>`;

  const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MVG Stilreferenz</title>
<style>${css}</style>
<style>
/* Nur für die Referenzseite (nicht Teil von src/stil) */
.ref { max-width: 1280px; margin: 0 auto; padding: 24px 16px 64px; }
.ref-kopf { display:flex; align-items:center; gap:16px; padding:20px; border-radius:10px; background:var(--navy); color:var(--weiss); }
.ref-kopf svg { height:56px; width:auto; color:var(--weiss); }
.ref-kopf h1 { font:var(--typo-titel); font-size:30px; text-transform:uppercase; }
.ref-kopf p { color:var(--auf-navy-2); font-size:13px; margin-top:4px; }
.ref-h2 { margin:40px 0 12px; font:700 20px/1.2 var(--schrift-label); letter-spacing:.1em; text-transform:uppercase; color:var(--navy); border-bottom:2px solid var(--gold-hell); padding-bottom:6px; }
.ref-h3 { margin:18px 0 8px; font:var(--typo-label); letter-spacing:.1em; text-transform:uppercase; color:var(--tinte-2); }
.ref-tafel { position:relative; padding:20px; border-radius:10px; background:var(--grund); box-shadow:var(--schatten-rahmen); }
.ref-raster { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap:16px; }
.ref-farben { display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:8px; }
.ref-farbe { display:flex; flex-direction:column; gap:2px; font-size:12px; }
.ref-feld { height:40px; border-radius:6px; box-shadow:inset 0 0 0 1px var(--linie); }
.ref-farbe code { font:600 11.5px var(--schrift-mono); }
.ref-farbe small { color:var(--tinte-2); }
.ref-paare { display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:6px; }
.ref-paar { padding:8px 10px; border-radius:6px; box-shadow:inset 0 0 0 1px var(--linie); font-size:15px; }
.ref-paar small { display:block; font-size:11.5px; opacity:1; }
.ref-typo { display:grid; grid-template-columns:260px 1fr; gap:12px; align-items:baseline; padding:10px 0; border-bottom:1px solid var(--linie); }
.ref-marken { display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end; }
.ref-marken > div { padding:16px; border-radius:10px; }
.ref-marken svg { height:160px; width:auto; }
.ref-buehne { height:720px; overflow:hidden; border-radius:10px; box-shadow:var(--schatten-schwebend); }
.ref-buehne .leitstand { height:100%; min-height:0; }
.ref-buehne.ist-klein { height:520px; }
.ref-buehne-start .startseite, .ref-buehne-start .lernseite { min-height:0; }
.ref-buehne-start { border-radius:10px; overflow:hidden; box-shadow:var(--schatten-schwebend); }
@media (max-width:980px) { .ref-buehne, .ref-buehne.ist-klein { height:auto; } .ref-typo { grid-template-columns:1fr; } }
</style>
</head>
<body>
<div class="ref">
  <header class="ref-kopf">${logoKlein('')}<div><h1>MVG · Stilreferenz</h1><p>Variante B „Leitstand“ · erzeugt von werkzeuge/stilreferenz.mjs aus src/stil/index.css · Beispielinhalte, Fall fiktiv · CSS ${(css.length / 1024).toFixed(0)} KiB · esbuild-Warnungen: ${warnungen}</p></div></header>

  <section class="ref-abschnitt" id="leitstand"><h2 class="ref-h2">Leitstand komplett (alle Teile eingeblendet)</h2><div class="ref-buehne" id="buehne-leitstand">${leitstand()}</div></section>
  <section class="ref-abschnitt"><h2 class="ref-h2">Leitstand beim Einstieg (L-4: ohne Instrumente und Karte, Seitenleiste eingeklappt)</h2><div class="ref-buehne ist-klein" id="buehne-einstieg">${leitstand({ instrumente: false, karte: false, seite: 'zu', titel: 'Montag, 08:30 Uhr. Monat 5 nach Ihrer Übernahme.', inhalt: konsequenz })}</div></section>

  <section class="ref-abschnitt" id="start"><h2 class="ref-h2">Startseite (O-21)</h2><div class="ref-buehne-start" id="buehne-start">${startseite}</div></section>
  <section class="ref-abschnitt" id="theorie"><h2 class="ref-h2">Theorie-Lernseite</h2><div class="ref-buehne-start" id="buehne-theorie">${theorie}</div></section>

  <section class="ref-abschnitt" id="bausteine"><h2 class="ref-h2">Bausteine</h2></section>
  ${bausteine}

  <section class="ref-abschnitt" id="marke"><h2 class="ref-h2">Marke</h2><div class="ref-marken">
    <div style="background:var(--navy);color:var(--weiss)">${logo}</div><div style="background:var(--weiss);color:var(--navy);box-shadow:var(--schatten-rahmen)">${logo}</div><div style="background:var(--weiss);color:var(--navy);box-shadow:var(--schatten-rahmen)">${bildmarke}</div><div style="background:var(--navy);color:var(--gold-hell)">${bildmarke}</div></div></section>
  <section class="ref-abschnitt" id="typo"><h2 class="ref-h2">Typorollen</h2><div class="ref-tafel" style="background:var(--weiss)">${typo}</div></section>
  <section class="ref-abschnitt" id="farben"><h2 class="ref-h2">Farben (tokens.css)</h2>${farben}</section>
  <section class="ref-abschnitt" id="paare"><h2 class="ref-h2">Erlaubte Text/Grund-Paare (paare.json, gemessen)</h2><div class="ref-paare">${paarListe}</div></section>
</div>
</body>
</html>
`;
  return html;
}

/** Schreibt tmp/stilreferenz.html. */
export async function erzeugeStilreferenz(ziel = ZIEL) {
  const html = await seite();
  await mkdir(dirname(ziel), { recursive: true });
  await writeFile(ziel, html, 'utf8');
  return { ziel, bytes: Buffer.byteLength(html) };
}

/** Bildschirmfotos mit Chrome: 1280×720 und 400 px Breite, je Abschnitt ein Bild (tmp/stilreferenz/). */
export async function bilder(quelle = ZIEL) {
  const { starteBrowser } = await import('./oberflaeche.mjs');
  // Dieselbe Suchreihenfolge wie die Oberflächenprüfung (Playwright-Chromium → Chrome → Edge → Cloud-Installation).
  const start = await starteBrowser();
  if (!start.browser) throw new Error(`kein Browser – ${start.grund}`);
  const browser = start.browser;
  /** @type {string[]} */
  const dateien = [];
  /** @type {string[]} */
  const befunde = [];
  try {
    for (const [breite, hoehe] of /** @type {const} */ ([[1280, 720], [400, 800]])) {
      const tab = await browser.newPage({ viewport: { width: breite, height: hoehe } });
      tab.on('pageerror', (e) => befunde.push(`${breite}: ${e.message}`));
      tab.on('console', (m) => { if (m.type() === 'error') befunde.push(`${breite}: ${m.text()}`); });
      await tab.goto(pathToFileURL(quelle).href);
      await tab.evaluate(() => document.fonts.ready);
      await tab.waitForTimeout(3000);
      const breiteDok = await tab.evaluate(() => document.documentElement.scrollWidth);
      if (breiteDok > breite) befunde.push(`${breite}: waagerechter Überlauf (${breiteDok} px > ${breite} px)`);
      const abschnitte = tab.locator('section.ref-abschnitt');
      const anzahl = await abschnitte.count();
      for (let i = 0; i < anzahl; i++) {
        const el = abschnitte.nth(i);
        const titel = ((await el.locator('.ref-h2').first().textContent()) ?? String(i)).toLowerCase()
          .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
        if (titel === 'bausteine') continue;
        const pfad = resolve(WURZEL, `tmp/stilreferenz/${breite}-${String(i).padStart(2, '0')}-${titel}.png`);
        await mkdir(dirname(pfad), { recursive: true });
        await el.screenshot({ path: pfad });
        dateien.push(pfad);
      }
      if (breite === 1280) {
        const geladen = await tab.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family.replace(/"/g, '')} ${f.weight}`));
        console.log('Geladene Schriften:', [...new Set(geladen)].sort().join(', '));
      }
      await tab.close();
    }
  } finally {
    await browser.close();
  }
  return { dateien, befunde };
}

if (istHauptmodul(import.meta.url)) {
  const erg = await erzeugeStilreferenz();
  console.log(`Stilreferenz: ${erg.ziel} (${(erg.bytes / 1024).toFixed(0)} KiB)`);
  if (process.argv.includes('--bilder')) {
    const b = await bilder();
    for (const d of b.dateien) console.log('Bild:', d);
    if (b.befunde.length) { console.error('Befunde:\n' + b.befunde.join('\n')); process.exitCode = 1; }
  }
}
