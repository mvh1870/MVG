/*
 * Entfernt Kommentare aus TypeScript-, JavaScript- und CSS-Quelltext (Exportpaket „Werkzeuge Kompass“, L-431).
 * Ein kleiner Zerleger kennt Zeichenketten, Vorlagen mit `${…}` und reguläre Ausdrücke, damit ein `//` oder `/*`
 * darin stehen bleibt. Die Gegenprobe (`gleicheWirkung`) vergleicht die von esbuild verkleinerte Fassung vor und nach
 * dem Entfernen: Sie muss gleich sein, sonst gilt der Export als gescheitert.
 */

import * as esbuild from 'esbuild';

/** Wörter, nach denen ein `/` einen regulären Ausdruck beginnt (kein Teilen). */
const VOR_REGEX = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await']);

/**
 * @param {string} q  Quelltext
 * @param {'ts' | 'css'} art
 * @returns {string}
 */
export function ohneKommentare(q, art) {
  let aus = '';
  let i = 0;
  /** letztes bedeutsames Zeichen oder Wort im Code (für `/`) */
  let zuletzt = '';
  /** je offener Vorlage die Klammertiefe, bei der `}` in die Vorlage zurückführt */
  const vorlagen = [];
  let tiefe = 0;
  const n = q.length;

  /**
   * Stand der Kommentar allein auf seiner Zeile (davor und dahinter nur Leerraum), verschwindet die ganze Zeile.
   * Sonst bleibt zwischen zwei Wörtern ein Trenner stehen (Rückgabe false).
   */
  const eigeneZeile = () => {
    const davor = aus.slice(aus.lastIndexOf('\n') + 1);
    let j = i;
    while (j < n && (q[j] === ' ' || q[j] === '\t')) j += 1;
    if (davor.trim() !== '' || (j < n && q[j] !== '\n')) return false;
    aus = aus.slice(0, aus.length - davor.length);
    i = j < n ? j + 1 : j;
    return true;
  };

  const leseZeichenkette = (ende) => {
    const start = i;
    i += 1;
    while (i < n && q[i] !== ende) {
      if (q[i] === '\\') i += 1;
      else if (q[i] === '\n' && art === 'ts') throw new Error(`Zeichenkette ohne Ende ab Zeichen ${start}`);
      i += 1;
    }
    i += 1;
    aus += q.slice(start, i);
  };

  /** liest Vorlagentext bis zum Ende oder bis `${`; gibt true zurück, wenn ein `${` geöffnet wurde */
  const leseVorlage = () => {
    const start = i;
    while (i < n) {
      if (q[i] === '\\') { i += 2; continue; }
      if (q[i] === '`') { i += 1; aus += q.slice(start, i); return false; }
      if (q[i] === '$' && q[i + 1] === '{') { i += 2; aus += q.slice(start, i); return true; }
      i += 1;
    }
    throw new Error('Vorlage ohne Ende');
  };

  while (i < n) {
    const c = q[i];
    const d = q[i + 1];
    if (c === '/' && d === '*') {
      const ende = q.indexOf('*/', i + 2);
      if (ende < 0) throw new Error(`Kommentar ohne Ende ab Zeichen ${i}`);
      const text = q.slice(i, ende + 2);
      i = ende + 2;
      if (!eigeneZeile()) aus += text.includes('\n') ? '\n' : ' ';
      continue;
    }
    if (art === 'ts' && c === '/' && d === '/') {
      while (i < n && q[i] !== '\n') i += 1;
      eigeneZeile();
      continue;
    }
    if (c === '"' || c === "'") { leseZeichenkette(c); zuletzt = 'x'; continue; }
    if (art === 'ts' && c === '`') {
      aus += c;
      i += 1;
      if (leseVorlage()) { vorlagen.push(tiefe); tiefe += 1; zuletzt = '('; } else zuletzt = 'x';
      continue;
    }
    if (art === 'ts' && c === '/') {
      const regex = zuletzt === '' || /[(,=:[!&|?{};+\-*%<>~^]/u.test(zuletzt) || VOR_REGEX.has(zuletzt) || zuletzt === '=>';
      if (regex) {
        const start = i;
        i += 1;
        let klasse = false;
        while (i < n) {
          const z = q[i];
          if (z === '\\') { i += 2; continue; }
          if (z === '\n') throw new Error(`Regulärer Ausdruck ohne Ende ab Zeichen ${start}`);
          if (z === '[') klasse = true;
          else if (z === ']') klasse = false;
          else if (z === '/' && !klasse) break;
          i += 1;
        }
        i += 1;
        while (i < n && /[a-z]/u.test(q[i] ?? '')) i += 1;
        aus += q.slice(start, i);
        zuletzt = 'x';
        continue;
      }
    }
    if (art === 'ts' && c === '{') { tiefe += 1; aus += c; i += 1; zuletzt = '{'; continue; }
    if (art === 'ts' && c === '}') {
      tiefe -= 1;
      aus += c;
      i += 1;
      if (vorlagen.length > 0 && vorlagen[vorlagen.length - 1] === tiefe) {
        vorlagen.pop();
        if (leseVorlage()) { vorlagen.push(tiefe); tiefe += 1; zuletzt = '('; } else zuletzt = 'x';
      } else zuletzt = '}';
      continue;
    }
    if (/[A-Za-z0-9_$]/u.test(c ?? '')) {
      const start = i;
      while (i < n && /[A-Za-z0-9_$]/u.test(q[i] ?? '')) i += 1;
      const wort = q.slice(start, i);
      aus += wort;
      zuletzt = VOR_REGEX.has(wort) ? wort : 'x';
      continue;
    }
    if (c === '=' && d === '>') { aus += '=>'; i += 2; zuletzt = '=>'; continue; }
    aus += c;
    i += 1;
    if (!/\s/u.test(c ?? '')) zuletzt = c === ')' || c === ']' ? 'x' : c ?? '';
  }
  if (vorlagen.length > 0) throw new Error('Vorlage nicht geschlossen');
  return aufraeumen(aus);
}

/** Leerzeichen am Zeilenende weg, höchstens eine Leerzeile hintereinander, keine am Anfang. */
function aufraeumen(text) {
  const zeilen = text.split('\n').map((z) => z.replace(/[ \t]+$/u, ''));
  const aus = [];
  for (const z of zeilen) {
    if (z === '' && (aus.length === 0 || aus[aus.length - 1] === '')) continue;
    aus.push(z);
  }
  while (aus.length > 0 && aus[aus.length - 1] === '') aus.pop();
  return `${aus.join('\n')}\n`;
}

/**
 * Gegenprobe: verkleinerte Fassung vor und nach dem Entfernen gleich?
 * @param {string} vorher
 * @param {string} nachher
 * @param {'ts' | 'css'} art
 */
export async function gleicheWirkung(vorher, nachher, art) {
  const o = { loader: art, minify: true, legalComments: 'none', charset: 'utf8', logLevel: 'silent' };
  const [a, b] = await Promise.all([esbuild.transform(vorher, o), esbuild.transform(nachher, o)]);
  return a.code === b.code;
}
