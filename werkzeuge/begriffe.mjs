#!/usr/bin/env node
/**
 * Begriffsprüfung (docs/BEGRIFFE.md, Liste in werkzeuge/begriffe.json).
 *
 *   node werkzeuge/begriffe.mjs                      prüft alle Dateien laut `pfade` der Liste
 *   node werkzeuge/begriffe.mjs <datei> …            prüft nur diese Dateien (Ausnahmen gelten weiter)
 *   Optionen: --wurzel <verzeichnis>  --liste <json>
 *
 * Meldet `datei:zeile:spalte: „Fundstelle“ → Ersatz`, Exitcode 1 bei Funden oder Fehlern der Liste.
 *
 * Regeln:
 * - Muster sind RegExp-Quellen; Flag `u` ist Pflicht, `g` setzt das Werkzeug selbst.
 * - `ausnahmen` (Glob wie `pfade`) nennen Dateien, die alte Begriffe absichtlich zeigen.
 * - `grossKleinEgal` (Glob): dort gilt jedes Muster zusätzlich mit Flag `i` (Texte, nicht Code).
 * - Geprüft wird der ganze Text, nicht Zeile für Zeile: weiches Trennzeichen (U+00AD) fällt weg,
 *   Sonderleerzeichen werden zu ' ', Sonderstriche zu '-'. So fallen „Change Board“ mit U+00A0,
 *   „No‑Go“ mit U+2011 und „Minimal⏎Viable Governance“ über einen Zeilenumbruch auf. Zeile und Spalte
 *   zeigen in den Originaltext.
 * - Zeilenmarke je Dateiart und NUR am Zeilenende: .md/.html `<!-- begriffe-erlaubt: Grund -->`,
 *   .ts/.mjs/.js `// …` oder `/* … *\/`, .css `/* … *\/`, .yaml `# …`, .json keine. Der Grund braucht
 *   ein Wort mit mindestens vier Buchstaben. Eine Marke ohne Grund, in falscher Form oder an falscher
 *   Stelle ist selbst ein Fund, und die Zeile wird trotzdem geprüft (in Markdown wäre sie sichtbarer Text).
 * - base64-Nutzlast in data:-URIs wird übersprungen (keine Sprache, sonst Zufallstreffer wie „/G3“);
 *   in .json zählen die Maskierungen \n, \r, \t als Leerraum.
 *
 * Eigener kleiner Glob über node:fs (kein Paket): `**` = beliebig viele Verzeichnisse, `*` = Teil
 * eines Namens, `?` = ein Zeichen, `{a,b}` = Auswahl.
 */
import { existsSync, readFileSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { istHauptmodul } from './haupt.mjs';

/** Wurzel des Repos (eine Ebene über werkzeuge/). */
export const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const STANDARD_LISTE = path.join(WURZEL, 'werkzeuge', 'begriffe.json');

/** Verzeichnisse, die der Glob nie betritt. */
const NIE = new Set(['node_modules', '.git']);

/**
 * @typedef {{ muster: string, flags?: string, statt: string }} VerbotRoh
 * @typedef {{ pfade: string[], ausnahmen?: string[], grossKleinEgal?: string[], verboten: VerbotRoh[] }} ListeRoh
 * @typedef {{ muster: string, statt: string, regex: RegExp, regexOhneGrossKlein: RegExp }} Verbot
 * @typedef {{ pfade: string[], ausnahmen: string[], ausnahmeTest: (datei: string) => boolean, grossKleinTest: (datei: string) => boolean, verboten: Verbot[] }} Liste
 * @typedef {{ datei: string, zeile: number, spalte: number, fundstelle: string, statt: string, muster: string, art: 'begriff' | 'marke' }} Fund
 */

/**
 * Übersetzt ein Glob-Muster in einen verankerten RegExp über `/`-getrennte relative Pfade.
 * @param {string} glob
 */
export function globZuRegExp(glob) {
  let quelle = '';
  let inAuswahl = false;
  for (let i = 0; i < glob.length; i += 1) {
    const z = glob[i];
    if (z === '*') {
      if (glob[i + 1] === '*') {
        const danach = glob[i + 2];
        if (danach === '/') {
          quelle += '(?:[^/]+/)*';
          i += 2;
        } else {
          quelle += '.*';
          i += 1;
        }
      } else {
        quelle += '[^/]*';
      }
    } else if (z === '?') quelle += '[^/]';
    else if (z === '{') {
      quelle += '(?:';
      inAuswahl = true;
    } else if (z === '}' && inAuswahl) {
      quelle += ')';
      inAuswahl = false;
    } else if (z === ',' && inAuswahl) quelle += '|';
    else quelle += String(z).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${quelle}$`, 'u');
}

/**
 * Der feste Anfang eines Globs (bis vor das erste Segment mit Platzhalter).
 * @param {string} glob
 */
function globBasis(glob) {
  const teile = glob.split('/');
  const fest = [];
  for (const teil of teile) {
    if (/[*?{]/.test(teil)) break;
    fest.push(teil);
  }
  return fest.join('/');
}

/**
 * Prüft und übersetzt eine Liste (Form von werkzeuge/begriffe.json).
 * @param {ListeRoh} roh
 * @returns {Liste}
 */
export function kompiliereListe(roh) {
  if (!roh || !Array.isArray(roh.pfade) || !Array.isArray(roh.verboten)) {
    throw new Error('Begriffsliste braucht die Felder "pfade" und "verboten" (Listen)');
  }
  const ausnahmen = Array.isArray(roh.ausnahmen) ? roh.ausnahmen : [];
  const ausnahmeMuster = ausnahmen.map(globZuRegExp);
  const grossKleinMuster = (Array.isArray(roh.grossKleinEgal) ? roh.grossKleinEgal : []).map(globZuRegExp);
  const verboten = roh.verboten.map((v, i) => {
    if (typeof v?.muster !== 'string' || typeof v.statt !== 'string') {
      throw new Error(`Begriffsliste, Eintrag ${i}: "muster" und "statt" sind Pflicht`);
    }
    const flags = v.flags ?? 'u';
    if (!flags.includes('u')) throw new Error(`Begriffsliste, Eintrag ${i} (${v.muster}): Flag "u" ist Pflicht`);
    let regex;
    let regexOhneGrossKlein;
    try {
      regex = new RegExp(v.muster, [...new Set(`${flags}g`)].join(''));
      regexOhneGrossKlein = new RegExp(v.muster, [...new Set(`${flags}gi`)].join(''));
    } catch (fehler) {
      throw new Error(`Begriffsliste, Eintrag ${i}: ungültiges Muster ${v.muster}: ${String(fehler)}`);
    }
    return { muster: v.muster, statt: v.statt, regex, regexOhneGrossKlein };
  });
  return {
    pfade: roh.pfade,
    ausnahmen,
    ausnahmeTest: (datei) => ausnahmeMuster.some((m) => m.test(normalisiere(datei))),
    grossKleinTest: (datei) => grossKleinMuster.some((m) => m.test(normalisiere(datei))),
    verboten,
  };
}

/** @param {string} datei */
function normalisiere(datei) {
  return datei.split(path.sep).join('/').replace(/^\.\//, '');
}

/** @type {Liste | undefined} */
let standard;
/** @type {WeakMap<object, Liste>} */
const uebersetzt = new WeakMap();

/**
 * @param {ListeRoh | Liste | undefined} liste
 * @returns {Liste}
 */
function alsListe(liste) {
  if (!liste) {
    standard ??= kompiliereListe(JSON.parse(readFileSync(STANDARD_LISTE, 'utf8')));
    return standard;
  }
  if ('ausnahmeTest' in liste) return liste;
  let fertig = uebersetzt.get(liste);
  if (!fertig) {
    fertig = kompiliereListe(liste);
    uebersetzt.set(liste, fertig);
  }
  return fertig;
}

/** Jede Erwähnung der Marke (auch in falscher Form). */
const MARKE_ROH = /begriffe-erlaubt/u;
/** Gültige Markenformen je Dateiart, jeweils am Zeilenende; die erste belegte Gruppe ist der Grund. */
const MARKE_FORMEN = {
  md: { form: '<!-- begriffe-erlaubt: Grund -->', regex: /<!--\s*begriffe-erlaubt\b(.*?)-->\s*$/u },
  code: { form: '// begriffe-erlaubt: Grund', regex: /(?:\/\/\s*begriffe-erlaubt\b(.*)|\/\*\s*begriffe-erlaubt\b(.*?)\*\/\s*)$/u },
  css: { form: '/* begriffe-erlaubt: Grund */', regex: /\/\*\s*begriffe-erlaubt\b(.*?)\*\/\s*$/u },
  yaml: { form: '# begriffe-erlaubt: Grund', regex: /#\s*begriffe-erlaubt\b(.*)$/u },
  json: { form: '(keine – JSON hat keine Kommentare)', regex: null },
  unbekannt: {
    form: '<!-- begriffe-erlaubt: Grund -->',
    regex: /(?:<!--\s*begriffe-erlaubt\b(.*?)-->|(?:\/\/|#)\s*begriffe-erlaubt\b(.*)|\/\*\s*begriffe-erlaubt\b(.*?)\*\/)\s*$/u,
  },
};
/** base64-Nutzlast in data:-URIs. */
const DATA_URI = /data:[\w.+/-]+(?:;[\w.+=-]+)*;base64,[A-Za-z0-9+/=]+/gu;
/** Sonderleerzeichen → ' ' (geschützt, schmal, Ziffernbreite, Geviert …). */
const SONDERLEER = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/u;
/** Sonderstriche → '-' (Viertelgeviert, geschützt, Ziffernstrich, Halb-/Geviert, Minus). */
const SONDERSTRICH = /[\u2010-\u2015\u2212\uFE63\uFF0D]/u;

/**
 * Dateiart für die Markenform.
 * @param {string} name
 * @returns {keyof typeof MARKE_FORMEN}
 */
function dateiArt(name) {
  const endung = path.extname(name).toLowerCase();
  if (endung === '.md' || endung === '.html' || endung === '.htm') return 'md';
  if (['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'].includes(endung)) return 'code';
  if (endung === '.css') return 'css';
  if (endung === '.yaml' || endung === '.yml') return 'yaml';
  if (endung === '.json') return 'json';
  return 'unbekannt';
}

/**
 * Prüftext mit Rückweg: Weiches Trennzeichen fällt weg, Sonderleerzeichen/-striche werden
 * vereinheitlicht, Leerraum-Folgen (auch Umbruch plus Einzug) zählen wie ein Zeichen.
 * `ort[i]` ist die Stelle im Original zu Zeichen i des Prüftexts.
 * @param {string} text
 */
function vereinheitliche(text) {
  const teile = [];
  /** @type {number[]} */
  const ort = [];
  let vorLeer = false;
  for (let i = 0; i < text.length; i += 1) {
    const z = text[i] ?? '';
    if (z === '\u00AD') continue;
    const n = SONDERLEER.test(z) ? ' ' : SONDERSTRICH.test(z) ? '-' : z;
    const leer = /\s/u.test(n);
    if (leer && vorLeer) continue;
    vorLeer = leer;
    teile.push(n);
    ort.push(i);
  }
  ort.push(text.length);
  return { pruef: teile.join(''), ort };
}

/**
 * Prüft einen Text. `datei` dient der Meldung, der Ausnahmeprüfung, der Markenform und der
 * gross/klein-Regel (relativ zur Wurzel, `/`).
 * @param {string} text
 * @param {string} [datei]
 * @param {ListeRoh | Liste} [liste]  Vorgabe: werkzeuge/begriffe.json
 * @returns {Fund[]}
 */
export function pruefeText(text, datei = '', liste) {
  const l = alsListe(liste);
  const name = normalisiere(datei);
  if (name && l.ausnahmeTest(name)) return [];
  const art = dateiArt(name);
  const ohneGrossKlein = name !== '' && l.grossKleinTest(name);
  /** @type {Fund[]} */
  const funde = [];

  // Zeilen: Anfänge (für Zeile/Spalte) und erlaubte Zeilen (gültige Marke mit Grund).
  /** @type {number[]} */
  const anfaenge = [0];
  for (let i = text.indexOf('\n'); i >= 0; i = text.indexOf('\n', i + 1)) anfaenge.push(i + 1);
  /** @type {Set<number>} */
  const erlaubt = new Set();
  const { form, regex: markenRegex } = MARKE_FORMEN[art];
  anfaenge.forEach((anfang, nr) => {
    const roh = text.slice(anfang, anfaenge[nr + 1] ?? text.length).replace(/\r?\n$/, '');
    const erwaehnt = MARKE_ROH.exec(roh);
    if (!erwaehnt) return;
    const marke = markenRegex ? markenRegex.exec(roh) : null;
    /** @param {number} spalte @param {string} fundstelle @param {string} statt */
    const melde = (spalte, fundstelle, statt) =>
      funde.push({ datei: name, zeile: nr + 1, spalte, fundstelle, statt, muster: 'begriffe-erlaubt', art: 'marke' });
    if (!marke) {
      melde(erwaehnt.index + 1, roh.slice(Math.max(0, erwaehnt.index - 4)).trim().slice(0, 60), `Zeilenmarke nur am Zeilenende und nur in der Form ${form}`);
      return;
    }
    const grund = (marke.slice(1).find((g) => g !== undefined) ?? '').replace(/^\s*:?/, '').trim();
    if (/\p{L}{4,}/u.test(grund)) erlaubt.add(nr + 1);
    else melde(marke.index + 1, marke[0].trim(), 'Zeilenmarke braucht einen Grund: <!-- begriffe-erlaubt: Grund -->');
  });
  /** Zeile (ab 0) zu einer Stelle im Original. @param {number} stelle */
  const zeileVon = (stelle) => {
    let lo = 0;
    let hi = anfaenge.length - 1;
    while (lo < hi) {
      const mitte = Math.ceil((lo + hi) / 2);
      if ((anfaenge[mitte] ?? 0) <= stelle) lo = mitte;
      else hi = mitte - 1;
    }
    return lo;
  };

  // Gleich lange Leerstellen statt der Nutzlast bzw. der JSON-Maskierungen: die Spalten bleiben richtig.
  let vorher = text.replace(DATA_URI, (t) => ' '.repeat(t.length));
  if (art === 'json') vorher = vorher.replace(/\\[nrt]/g, '  ');
  const { pruef, ort } = vereinheitliche(vorher);
  for (const v of l.verboten) {
    const regex = ohneGrossKlein ? v.regexOhneGrossKlein : v.regex;
    regex.lastIndex = 0;
    for (const m of pruef.matchAll(regex)) {
      if (m[0] === '') continue;
      const start = ort[m.index ?? 0] ?? 0;
      const ende = (ort[(m.index ?? 0) + m[0].length - 1] ?? start) + 1;
      const zeile = zeileVon(start);
      if (erlaubt.has(zeile + 1)) continue;
      funde.push({
        datei: name,
        zeile: zeile + 1,
        spalte: start - (anfaenge[zeile] ?? 0) + 1,
        fundstelle: text.slice(start, ende).replace(/\s*\r?\n\s*/g, ' '),
        statt: v.statt,
        muster: v.muster,
        art: 'begriff',
      });
    }
  }
  return funde.sort((a, b) => a.zeile - b.zeile || a.spalte - b.spalte);
}

/**
 * Läuft rekursiv durch `start` und liefert relative Pfade (`/`) unterhalb von `wurzel`.
 * @param {string} wurzel
 * @param {string} start  relativ zur Wurzel
 * @param {string[]} aus
 */
async function sammle(wurzel, start, aus) {
  const voll = path.join(wurzel, start);
  let eintraege;
  try {
    eintraege = await readdir(voll, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of eintraege) {
    const rel = start ? `${start}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (!NIE.has(e.name)) await sammle(wurzel, rel, aus);
    } else if (e.isFile()) aus.push(rel);
  }
}

/**
 * Alle zu prüfenden Dateien laut Liste, sortiert, ohne Ausnahmen.
 * @param {string} wurzel
 * @param {ListeRoh | Liste} [liste]
 */
export async function sammleDateien(wurzel, liste) {
  const l = alsListe(liste);
  const gefunden = new Set();
  for (const glob of l.pfade) {
    const regex = globZuRegExp(glob);
    const basis = globBasis(glob);
    if (basis === glob) {
      if (existsSync(path.join(wurzel, glob))) gefunden.add(glob);
      continue;
    }
    /** @type {string[]} */
    const kandidaten = [];
    await sammle(wurzel, basis, kandidaten);
    for (const k of kandidaten) if (regex.test(k)) gefunden.add(k);
  }
  return [...gefunden].filter((d) => !l.ausnahmeTest(d)).sort();
}

/**
 * Prüft alle Dateien laut Liste (oder die übergebenen).
 * @param {{ wurzel?: string, liste?: ListeRoh | Liste, dateien?: string[] }} [optionen]
 */
export async function pruefeBaum(optionen = {}) {
  const wurzel = path.resolve(optionen.wurzel ?? WURZEL);
  const l = alsListe(optionen.liste);
  const dateien = optionen.dateien
    ? optionen.dateien.map((d) => normalisiere(path.relative(wurzel, path.resolve(wurzel, d)))).filter((d) => !l.ausnahmeTest(d))
    : await sammleDateien(wurzel, l);
  /** @type {Fund[]} */
  const funde = [];
  for (const datei of dateien) {
    const text = await readFile(path.join(wurzel, datei), 'utf8');
    funde.push(...pruefeText(text, datei, l));
  }
  return { dateien, funde };
}

/** @param {Fund} f */
export function formatiereFund(f) {
  return `${f.datei}:${f.zeile}:${f.spalte}: „${f.fundstelle}“ → ${f.statt}`;
}

async function hauptprogramm() {
  const argv = process.argv.slice(2);
  /** @type {string | undefined} */
  let wurzel;
  /** @type {string | undefined} */
  let listeDatei;
  /** @type {string[]} */
  const dateien = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i] ?? '';
    if (a === '--wurzel' || a === '--liste') {
      const wert = argv[i + 1];
      if (!wert) {
        console.error(`begriffe: ${a} braucht einen Wert`);
        process.exitCode = 1;
        return;
      }
      if (a === '--wurzel') wurzel = path.resolve(wert);
      else listeDatei = path.resolve(wert);
      i += 1;
    } else if (a.startsWith('--')) {
      console.error(`begriffe: unbekannte Option ${a} (erlaubt: --wurzel, --liste)`);
      process.exitCode = 1;
      return;
    } else dateien.push(a);
  }
  try {
    const liste = listeDatei ? kompiliereListe(JSON.parse(await readFile(listeDatei, 'utf8'))) : undefined;
    /** @type {{ wurzel?: string, liste?: Liste, dateien?: string[] }} */
    const optionen = {};
    if (wurzel) optionen.wurzel = wurzel;
    if (liste) optionen.liste = liste;
    if (dateien.length > 0) optionen.dateien = dateien.map((d) => path.resolve(d));
    const { dateien: geprueft, funde } = await pruefeBaum(optionen);
    for (const f of funde) console.log(formatiereFund(f));
    if (funde.length > 0) {
      const betroffen = new Set(funde.map((f) => f.datei)).size;
      console.log(`begriffe: ${funde.length} Fund${funde.length === 1 ? '' : 'e'} in ${betroffen} Datei${betroffen === 1 ? '' : 'en'} (${geprueft.length} geprüft) – siehe docs/BEGRIFFE.md`);
      process.exitCode = 1;
    } else {
      console.log(`begriffe: ${geprueft.length} Datei${geprueft.length === 1 ? '' : 'en'} geprüft, keine Funde`);
    }
  } catch (fehler) {
    console.error(`begriffe: FEHLER – ${fehler instanceof Error ? fehler.message : String(fehler)}`);
    process.exitCode = 1;
  }
}

/** Direkt aufgerufen (nicht importiert)? Auch über Links (werkzeuge/haupt.mjs). */
const istHaupt = istHauptmodul(import.meta.url);

if (istHaupt) await hauptprogramm();
