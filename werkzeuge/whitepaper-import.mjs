#!/usr/bin/env node
// Whitepaper-Import (P0.2, Re-Import P10.3): liest die DOCX des Whitepapers und schreibt die
// strukturierte Quelle whitepaper.json (stabile Absatz-IDs) und die lesbare Fassung whitepaper.md.
//
// Aufruf:
//   node werkzeuge/whitepaper-import.mjs                      V1.2 → quellen/whitepaper/v1.2/
//   node werkzeuge/whitepaper-import.mjs --docx <pfad>        Ziel ist der Ordner der DOCX
//        [--ziel <ordner>] [--fassung V1.3]
//        [--vergleich <alte whitepaper.json>]                 druckt einen Bericht je ID (Grundlage P10.3)
//        [--pruefe]                                           schreibt nichts; Fehler, wenn die Dateien veraltet sind
//
// Warum eigene Auswertung von word/document.xml: mammoth liefert Absätze, verliert aber Bildpositionen,
// verbundene Tabellenzellen, Kästen und die Verknüpfung Überschrift ↔ Inhaltsverzeichnis. mammoth dient
// hier als unabhängige Gegenprobe: jeder Absatz, den mammoth findet, muss im Ergebnis vorkommen.
// Die Ausgabe ist deterministisch (keine Zeitstempel, feste Reihenfolge, LF, UTF-8 ohne BOM).

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, inflateRawSync } from 'node:zlib';
import { alleAbschnitte, alleBloecke, ladeWhitepaper, normalisiere, vergleiche } from './whitepaper-lib.mjs';
import { istHauptmodul } from './haupt.mjs';

// ---------------------------------------------------------------------------------------------
// Schema von whitepaper.json
// ---------------------------------------------------------------------------------------------

/**
 * Art eines Blocks. ID-Buchstabe: p = absatz und fett (eine Zählreihe), l = liste, t = tabelle, b = kasten.
 * - absatz: normaler Absatz (fette Einleitungswörter gehören zum Text)
 * - fett:   Absatz, der vollständig fett gesetzt ist (hervorgehobene Kernaussage)
 * - liste:  zusammenhängende Aufzählung; `punkte` enthält die Punkte, `text` sie mit \n verbunden
 * - tabelle: `kopf` = erste Zeile, `zeilen` = übrige Zeilen; `text` = Kopf und Zeilen mit \n, Zellen
 *   mit " | " (mehrere Absätze in einer Zelle mit \n)
 * - kasten: Textfeld oder einzellige, abgesetzte Tabelle; `text` = seine Absätze mit \n verbunden
 * @typedef {'absatz' | 'liste' | 'tabelle' | 'kasten' | 'fett'} BlockArt
 */

/**
 * Ein inhaltlicher Block. ID = "k<nr>-<p|l|t|b><n>": <nr> ist die Nummer des innersten Abschnitts,
 * <n> zählt je Abschnitt und ID-Buchstabe ab 1 in Dokumentreihenfolge (z. B. "k4.2-p3", "k2.5-t1").
 * Text: wie in der DOCX (typografische Zeichen, geschützte Leerzeichen), nur U+00AD entfernt; ein
 * weiches Trennzeichen direkt vor einem manuellen Zeilenumbruch verbindet das Wort (Silbentrennung);
 * andere manuelle Zeilenumbrüche bleiben als \n im Text (z. B. k3.1-p2).
 * Tabellen: logische Spalten = Zellen je Zeile (Word-Hilfsspalten im Raster zählen nicht); überdeckt eine
 * verbundene Zelle (colspan) mehrere logische Spalten, steht ihr Text in der ersten, die übrigen sind "".
 * @typedef {{
 *   id: string,
 *   art: BlockArt,
 *   text: string,
 *   punkte?: string[],
 *   kopf?: string[],
 *   zeilen?: string[][],
 * }} Block
 */

/**
 * Kapitel (Ebene 1) oder Abschnitt (Ebene 2, 3). `id` = "k" + nr (z. B. "k6.4"); `abschnitte` ist bei
 * Blättern leer. Nummern wie im Inhaltsverzeichnis der DOCX (der Import prüft das).
 * @typedef {{
 *   id: string,
 *   nr: string,
 *   titel: string,
 *   bloecke: Block[],
 *   abschnitte: Abschnitt[],
 * }} Abschnitt
 */

/**
 * Glossareintrag aus der Tabelle im Glossar-Kapitel; id = "g-" + Begriff in ASCII-Umschrift.
 * @typedef {{ id: string, begriff: string, definition: string }} GlossarEintrag
 */

/**
 * Abbildung im Fließtext. id = "abb-<N>" nach der Mediendatei imageN; `datei` relativ zum Zielordner.
 * `ort` = ID des Blocks, nach dem das Bild steht, oder die Abschnitts-ID ("k6.4"), wenn es vor dem
 * ersten Block des Abschnitts steht. `kapitel` = Kapitelnummer, `abschnitt` = innerster Abschnitt.
 * Bilder auf dem Titelblatt (Logo) und in Kopf-/Fußzeilen sind keine Abbildungen.
 * @typedef {{
 *   id: string,
 *   datei: string,
 *   ort: string,
 *   kapitel: string,
 *   abschnitt: string,
 *   sha256: string,
 * }} Abbildung
 */

/**
 * @typedef {{
 *   fassung: string,
 *   quelle: { datei: string, sha256: string },
 *   titel: string,
 *   untertitel: string,
 *   kapitel: Abschnitt[],
 *   glossar: GlossarEintrag[],
 *   abbildungen: Abbildung[],
 * }} Whitepaper
 */

/**
 * Ergebnis eines Imports: das Whitepaper, die Bilddateien (Zielpfad relativ → Inhalt), Hinweise
 * und die Texte, die bewusst nicht in kapitel[] stehen (Titelblatt, Inhaltsverzeichnis).
 * @typedef {{
 *   whitepaper: Whitepaper,
 *   bilder: Map<string, Buffer>,
 *   hinweise: string[],
 *   ausgelassen: string[],
 * }} ImportErgebnis
 */

const HIER = path.dirname(fileURLToPath(import.meta.url));
export const WURZEL = path.resolve(HIER, '..');
export const STANDARD_DOCX = path.join(WURZEL, 'quellen', 'whitepaper', 'v1.2', 'Bauherr_Mentoren_Whitepaper_V1.2.docx');

// ---------------------------------------------------------------------------------------------
// ZIP (eine DOCX ist ein ZIP-Archiv): zentrales Verzeichnis lesen, deflate entpacken, CRC prüfen
// ---------------------------------------------------------------------------------------------

/**
 * @param {Buffer} daten
 * @returns {Map<string, Buffer>}
 */
export function leseZip(daten) {
  let eocd = -1;
  for (let i = daten.length - 22; i >= Math.max(0, daten.length - 22 - 0xffff); i--) {
    if (daten.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('ZIP: Ende des zentralen Verzeichnisses nicht gefunden (keine DOCX?)');
  const anzahl = daten.readUInt16LE(eocd + 10);
  let pos = daten.readUInt32LE(eocd + 16);
  /** @type {Map<string, Buffer>} */
  const dateien = new Map();
  for (let n = 0; n < anzahl; n++) {
    if (daten.readUInt32LE(pos) !== 0x02014b50) throw new Error(`ZIP: Verzeichniseintrag ${n} beschädigt`);
    const methode = daten.readUInt16LE(pos + 10);
    const crc = daten.readUInt32LE(pos + 16);
    const gepackt = daten.readUInt32LE(pos + 20);
    const roh = daten.readUInt32LE(pos + 24);
    const nameLaenge = daten.readUInt16LE(pos + 28);
    const extraLaenge = daten.readUInt16LE(pos + 30);
    const kommentarLaenge = daten.readUInt16LE(pos + 32);
    const lokal = daten.readUInt32LE(pos + 42);
    const name = daten.toString('utf8', pos + 46, pos + 46 + nameLaenge);
    pos += 46 + nameLaenge + extraLaenge + kommentarLaenge;
    if (gepackt === 0xffffffff || roh === 0xffffffff || lokal === 0xffffffff) {
      throw new Error(`ZIP: ${name} braucht ZIP64 (nicht unterstützt)`);
    }
    if (daten.readUInt32LE(lokal) !== 0x04034b50) throw new Error(`ZIP: lokaler Kopf von ${name} beschädigt`);
    const start = lokal + 30 + daten.readUInt16LE(lokal + 26) + daten.readUInt16LE(lokal + 28);
    const block = daten.subarray(start, start + gepackt);
    /** @type {Buffer} */
    let inhalt;
    if (methode === 0) inhalt = Buffer.from(block);
    else if (methode === 8) inhalt = inflateRawSync(block);
    else throw new Error(`ZIP: ${name} nutzt Kompressionsmethode ${methode} (nicht unterstützt)`);
    if (inhalt.length !== roh || crc32(inhalt) !== crc) throw new Error(`ZIP: ${name} fehlerhaft (Länge/CRC)`);
    if (!name.endsWith('/')) dateien.set(name, inhalt);
  }
  return dateien;
}

// ---------------------------------------------------------------------------------------------
// XML: kleiner, strenger Parser (Elemente, Attribute, Text, Entitäten, CDATA)
// ---------------------------------------------------------------------------------------------

/**
 * @typedef {{ name: string, attrs: Record<string, string>, kinder: XmlKnoten[] }} XmlElement
 * @typedef {XmlElement | string} XmlKnoten
 */

/** @type {Record<string, string>} */
const ENTITAETEN = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };

/** @param {string} s */
function entschluessele(s) {
  if (!s.includes('&')) return s;
  return s.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[A-Za-z]+);/g, (ganz, e) => {
    if (e[0] === '#') {
      const zahl = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return String.fromCodePoint(zahl);
    }
    return ENTITAETEN[e] ?? ganz;
  });
}

const TAG = /<(\/?)([^\s/>]+)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/y;
const ATTRIBUT = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

/**
 * @param {string} quelle
 * @returns {XmlElement} Wurzelknoten "#dokument"
 */
export function parseXml(quelle) {
  /** @type {XmlElement} */
  const wurzel = { name: '#dokument', attrs: {}, kinder: [] };
  /** @type {XmlElement[]} */
  const stapel = [wurzel];
  const oben = () => /** @type {XmlElement} */ (stapel[stapel.length - 1]);
  let i = 0;
  while (i < quelle.length) {
    const lt = quelle.indexOf('<', i);
    const textEnde = lt < 0 ? quelle.length : lt;
    if (textEnde > i) oben().kinder.push(entschluessele(quelle.slice(i, textEnde)));
    if (lt < 0) break;
    if (quelle.startsWith('<?', lt)) {
      i = quelle.indexOf('?>', lt) + 2;
    } else if (quelle.startsWith('<!--', lt)) {
      i = quelle.indexOf('-->', lt) + 3;
    } else if (quelle.startsWith('<![CDATA[', lt)) {
      const ende = quelle.indexOf(']]>', lt);
      oben().kinder.push(quelle.slice(lt + 9, ende));
      i = ende + 3;
    } else if (quelle.startsWith('<!', lt)) {
      i = quelle.indexOf('>', lt) + 1;
    } else {
      TAG.lastIndex = lt;
      const m = TAG.exec(quelle);
      if (!m) throw new Error(`XML: ungültiges Tag bei Zeichen ${lt}`);
      const [, schliessend, name = '', attrText = '', leer] = m;
      if (schliessend) {
        const offen = stapel.pop();
        if (!offen || offen.name !== name) throw new Error(`XML: </${name}> schließt <${offen?.name}>`);
      } else {
        /** @type {Record<string, string>} */
        const attrs = {};
        for (const a of attrText.matchAll(ATTRIBUT)) attrs[a[1] ?? ''] = entschluessele(a[2] ?? a[3] ?? '');
        /** @type {XmlElement} */
        const el = { name, attrs, kinder: [] };
        oben().kinder.push(el);
        if (!leer) stapel.push(el);
      }
      i = TAG.lastIndex;
    }
    if (i <= lt) throw new Error(`XML: unvollständiges Konstrukt bei Zeichen ${lt}`);
  }
  if (stapel.length !== 1) throw new Error(`XML: <${oben().name}> nicht geschlossen`);
  return wurzel;
}

/** @param {XmlElement} el @returns {XmlElement[]} */
const elementKinder = (el) => /** @type {XmlElement[]} */ (el.kinder.filter((k) => typeof k !== 'string'));
/** @param {XmlElement | undefined} el @param {string} name */
const kind = (el, name) => (el ? elementKinder(el).find((k) => k.name === name) : undefined);
/** @param {XmlElement | undefined} el @param {...string} namen */
const pfadKind = (el, ...namen) => namen.reduce((e, n) => kind(e, n), el);

/**
 * Alle Nachfahren mit Namen `name` (ohne in Treffer hinabzusteigen).
 * @param {XmlElement} el @param {string} name @returns {XmlElement[]}
 */
function nachfahren(el, name) {
  /** @type {XmlElement[]} */
  const aus = [];
  /** @param {XmlElement} e */
  const gehe = (e) => {
    for (const k of elementKinder(e)) {
      if (k.name === name) aus.push(k);
      else gehe(k);
    }
  };
  gehe(el);
  return aus;
}

/** @param {XmlElement} el */
const reinerText = (el) => el.kinder.filter((k) => typeof k === 'string').join('');

// ---------------------------------------------------------------------------------------------
// DOCX-Grundlagen: Beziehungen, Formatvorlagen, Nummerierung
// ---------------------------------------------------------------------------------------------

/**
 * @typedef {{ name: string, basis: string | undefined, ebene: number | undefined,
 *   fett: boolean | undefined, liste: boolean | undefined }} Stil
 * @typedef {{ stile: Map<string, Stil>, standardAbsatz: string, standardZeichen: string }} Stile
 */

/** @param {XmlElement | undefined} el @returns {boolean | undefined} */
function schalter(el) {
  if (!el) return undefined;
  const v = el.attrs['w:val'];
  return v === undefined || !['0', 'false', 'off', 'none'].includes(v);
}

/** @param {XmlElement | undefined} wurzel @returns {Stile} */
function leseStile(wurzel) {
  /** @type {Map<string, Stil>} */
  const stile = new Map();
  let standardAbsatz = '';
  let standardZeichen = '';
  const styles = pfadKind(wurzel, 'w:styles');
  for (const s of styles ? elementKinder(styles) : []) {
    if (s.name !== 'w:style') continue;
    const id = s.attrs['w:styleId'] ?? '';
    const typ = s.attrs['w:type'];
    if (['1', 'true', 'on'].includes(s.attrs['w:default'] ?? '')) {
      if (typ === 'paragraph') standardAbsatz = id;
      if (typ === 'character') standardZeichen = id;
    }
    const name = kind(s, 'w:name')?.attrs['w:val'] ?? id;
    const ppr = kind(s, 'w:pPr');
    /** @type {number | undefined} */
    let ebene;
    const ueberschrift = /^heading (\d)$/i.exec(name);
    if (ueberschrift) ebene = Number(ueberschrift[1]);
    else if (/^toc heading$/i.test(name) || /^title$/i.test(name)) ebene = 0;
    else {
      const ol = kind(ppr, 'w:outlineLvl')?.attrs['w:val'];
      if (ol !== undefined) ebene = Number(ol) < 9 ? Number(ol) + 1 : 0;
    }
    const numId = pfadKind(ppr, 'w:numPr', 'w:numId')?.attrs['w:val'];
    stile.set(id, {
      name,
      basis: kind(s, 'w:basedOn')?.attrs['w:val'],
      ebene,
      fett: schalter(pfadKind(s, 'w:rPr', 'w:b')),
      liste: numId === undefined ? undefined : numId !== '0',
    });
  }
  return { stile, standardAbsatz, standardZeichen };
}

/**
 * Eigenschaft einer Formatvorlage entlang der basedOn-Kette.
 * @template {'ebene' | 'fett' | 'liste'} K
 * @param {Stile} stile @param {string | undefined} id @param {K} feld
 * @returns {Stil[K] | undefined}
 */
function stilWert(stile, id, feld) {
  const gesehen = new Set();
  let aktuell = id;
  while (aktuell !== undefined && !gesehen.has(aktuell)) {
    gesehen.add(aktuell);
    const s = stile.stile.get(aktuell);
    if (!s) return undefined;
    if (s[feld] !== undefined) return s[feld];
    aktuell = s.basis;
  }
  return undefined;
}

/** @param {XmlElement | undefined} wurzel @returns {Map<string, string>} rId → Pfad im ZIP */
function leseBeziehungen(wurzel) {
  /** @type {Map<string, string>} */
  const m = new Map();
  for (const r of elementKinder(pfadKind(wurzel, 'Relationships') ?? { name: '', attrs: {}, kinder: [] })) {
    if (r.attrs.TargetMode === 'External') continue;
    const ziel = r.attrs.Target ?? '';
    m.set(r.attrs.Id ?? '', ziel.startsWith('/') ? ziel.slice(1) : path.posix.normalize(`word/${ziel}`));
  }
  return m;
}

// ---------------------------------------------------------------------------------------------
// Absätze und Tabellen auslesen
// ---------------------------------------------------------------------------------------------

/**
 * Teil eines Absatzes in Lesereihenfolge.
 * @typedef {{ art: 'text', text: string, fett: boolean }
 *   | { art: 'bild', rId: string }
 *   | { art: 'kasten', inhalt: XmlElement }} Teil
 * @typedef {{ teile: Teil[], lesezeichen: string[], anker: string[], fussnoten: number }} AbsatzRoh
 */

/**
 * Silbentrennung auflösen: U+00AD vor einem manuellen Umbruch verbindet das Wort, sonst entfällt es.
 * @param {string} s
 */
export function bereinige(s) {
  return s.replace(/­[^\S\n]*\n\s*/g, '').replace(/­/g, '').trim();
}

/**
 * @param {Stile} stile
 * @param {string} absatzStil
 */
function absatzLeser(stile, absatzStil) {
  /** @type {AbsatzRoh} */
  const roh = { teile: [], lesezeichen: [], anker: [], fussnoten: 0 };
  /** @param {string} text @param {boolean} fett */
  const text = (text, fett) => roh.teile.push({ art: 'text', text, fett });

  /** @param {XmlElement} r */
  const istFett = (r) => {
    const rpr = kind(r, 'w:rPr');
    const direkt = schalter(kind(rpr, 'w:b'));
    if (direkt !== undefined) return direkt;
    const zeichenStil = kind(rpr, 'w:rStyle')?.attrs['w:val'];
    const ausZeichen = zeichenStil ? stilWert(stile, zeichenStil, 'fett') : undefined;
    if (ausZeichen !== undefined) return ausZeichen;
    return stilWert(stile, absatzStil, 'fett') ?? false;
  };

  /** @param {XmlElement} zeichnung */
  const zeichnung = (zeichnung) => {
    const kaesten = nachfahren(zeichnung, 'w:txbxContent');
    if (kaesten.length > 0) {
      // Textfeld: bei mc:AlternateContent kommt es doppelt vor (Choice/Fallback) – nur das erste zählt.
      roh.teile.push({ art: 'kasten', inhalt: /** @type {XmlElement} */ (kaesten[0]) });
      return;
    }
    for (const blip of nachfahren(zeichnung, 'a:blip')) {
      const rId = blip.attrs['r:embed'] ?? blip.attrs['r:link'];
      if (rId) roh.teile.push({ art: 'bild', rId });
    }
    for (const bild of nachfahren(zeichnung, 'v:imagedata')) {
      const rId = bild.attrs['r:id'];
      if (rId) roh.teile.push({ art: 'bild', rId });
    }
  };

  /** @param {XmlElement} r @param {boolean} fett */
  const lauf = (r, fett) => {
    for (const k of elementKinder(r)) {
      switch (k.name) {
        case 'w:t':
          text(reinerText(k), fett);
          break;
        case 'w:tab':
        case 'w:ptab':
          text('\t', fett);
          break;
        case 'w:br': // auch Spalten-/Seitenumbruch: trennt Wörter; an Rändern fällt er beim Trimmen weg
        case 'w:cr':
          text('\n', fett);
          break;
        case 'w:noBreakHyphen':
          text('‑', fett);
          break;
        case 'w:softHyphen':
          text('­', fett);
          break;
        case 'w:sym': {
          const code = parseInt(k.attrs['w:char'] ?? '', 16);
          if (Number.isFinite(code)) text(String.fromCodePoint(code >= 0xf000 ? code - 0xf000 : code), fett);
          break;
        }
        case 'w:drawing':
        case 'w:pict':
        case 'w:object':
          zeichnung(k);
          break;
        case 'mc:AlternateContent': {
          const wahl = kind(k, 'mc:Choice') ?? kind(k, 'mc:Fallback');
          if (wahl) lauf(wahl, fett);
          break;
        }
        case 'w:footnoteReference':
        case 'w:endnoteReference':
          roh.fussnoten++;
          break;
        default:
          break; // rPr, fldChar, instrText, delText, lastRenderedPageBreak …
      }
    }
  };

  /** @param {XmlElement} el */
  const inhalt = (el) => {
    for (const k of elementKinder(el)) {
      switch (k.name) {
        case 'w:r':
          lauf(k, istFett(k));
          break;
        case 'w:hyperlink':
          if (k.attrs['w:anchor']) roh.anker.push(k.attrs['w:anchor']);
          inhalt(k);
          break;
        case 'w:smartTag':
        case 'w:customXml':
        case 'w:ins':
        case 'w:moveTo':
        case 'w:fldSimple':
        case 'w:sdtContent':
        case 'w:dir':
        case 'w:bdo':
          inhalt(k);
          break;
        case 'w:sdt': {
          const c = kind(k, 'w:sdtContent');
          if (c) inhalt(c);
          break;
        }
        case 'mc:AlternateContent': {
          const wahl = kind(k, 'mc:Choice') ?? kind(k, 'mc:Fallback');
          if (wahl) inhalt(wahl);
          break;
        }
        case 'w:bookmarkStart':
          roh.lesezeichen.push(k.attrs['w:name'] ?? '');
          break;
        default:
          break; // pPr, w:del, w:moveFrom, bookmarkEnd, proofErr, Kommentarmarken …
      }
    }
  };
  return { roh, inhalt };
}

/**
 * @typedef {{
 *   stil: string, stilName: string, ebene: number, liste: boolean, text: string, fett: boolean,
 *   teile: Teil[], lesezeichen: string[], anker: string[], fussnoten: number,
 * }} Absatz
 */

/**
 * @param {XmlElement} p
 * @param {Stile} stile
 * @returns {Absatz}
 */
function leseAbsatz(p, stile) {
  const ppr = kind(p, 'w:pPr');
  const stil = kind(ppr, 'w:pStyle')?.attrs['w:val'] ?? stile.standardAbsatz;
  const { roh, inhalt } = absatzLeser(stile, stil);
  inhalt(p);
  const olDirekt = kind(ppr, 'w:outlineLvl')?.attrs['w:val'];
  const ebene = olDirekt !== undefined ? (Number(olDirekt) < 9 ? Number(olDirekt) + 1 : 0) : (stilWert(stile, stil, 'ebene') ?? 0);
  const numId = pfadKind(ppr, 'w:numPr', 'w:numId')?.attrs['w:val'];
  const liste = numId !== undefined ? numId !== '0' : (stilWert(stile, stil, 'liste') ?? false);
  const textTeile = /** @type {{ art: 'text', text: string, fett: boolean }[]} */ (roh.teile.filter((t) => t.art === 'text'));
  const text = bereinige(textTeile.map((t) => t.text).join(''));
  const sichtbar = textTeile.filter((t) => bereinige(t.text) !== '');
  return {
    stil,
    stilName: stile.stile.get(stil)?.name ?? stil,
    ebene,
    liste,
    text,
    fett: sichtbar.length > 0 && sichtbar.every((t) => t.fett),
    teile: roh.teile,
    lesezeichen: roh.lesezeichen,
    anker: roh.anker,
    fussnoten: roh.fussnoten,
  };
}

/**
 * Absätze eines Containers (Zelle, Textfeld) in Reihenfolge, verschachtelte Tabellen flach.
 * @param {XmlElement} el @returns {XmlElement[]}
 */
function absaetzeIn(el) {
  /** @type {XmlElement[]} */
  const aus = [];
  for (const k of elementKinder(el)) {
    if (k.name === 'w:p') aus.push(k);
    else if (k.name === 'w:tbl' || k.name === 'w:tr' || k.name === 'w:tc' || k.name === 'w:sdt' || k.name === 'w:sdtContent' || k.name === 'w:customXml') {
      aus.push(...absaetzeIn(k));
    }
  }
  return aus;
}

/**
 * Text eines Containers: Absätze mit \n verbunden, leere Absätze entfallen.
 * @param {XmlElement} el @param {Stile} stile
 */
function containerText(el, stile) {
  return absaetzeIn(el)
    .map((p) => leseAbsatz(p, stile).text)
    .filter((t) => t !== '')
    .join('\n');
}

/**
 * Tabelle als Zeilen × logische Spalten.
 * Word-Raster enthalten oft Hilfsspalten (in V1.2 Kap. 4: eine 145-twip-Spalte, die je Zeile von einer
 * anderen Zelle mit gridSpan überdeckt wird). Logische Spalten sind deshalb die Zellen je Zeile, nicht
 * das Raster. Nur Zeilen mit weniger Zellen als die breiteste werden über ihre Rasterposition an einer
 * Bezugszeile ausgerichtet: eine verbundene Zelle steht in ihrer ersten Spalte, überdeckte Spalten sind "".
 * Senkrecht verbundene Fortsetzungszellen (vMerge) sind "".
 * @param {XmlElement} tbl @param {Stile} stile
 * @returns {{ zeilen: string[][], spalten: number, bilder: string[] }}
 */
function leseTabelle(tbl, stile) {
  /** @type {{ text: string, start: number }[][]} */
  const roheZeilen = [];
  /** @type {string[]} */
  const bilder = [];
  /** @param {XmlElement} el @returns {XmlElement[]} */
  const auspacken = (el) => elementKinder(el).flatMap((k) => (k.name === 'w:sdt' || k.name === 'w:customXml'
    ? auspacken(kind(k, 'w:sdtContent') ?? k)
    : [k]));
  for (const tr of auspacken(tbl).filter((k) => k.name === 'w:tr')) {
    /** @type {{ text: string, start: number }[]} */
    const zellen = [];
    let raster = Number(kind(kind(tr, 'w:trPr'), 'w:gridBefore')?.attrs['w:val'] ?? 0);
    for (const tc of auspacken(tr).filter((k) => k.name === 'w:tc')) {
      const tcpr = kind(tc, 'w:tcPr');
      const vMerge = kind(tcpr, 'w:vMerge');
      const fortsetzung = vMerge !== undefined && vMerge.attrs['w:val'] !== 'restart';
      zellen.push({ text: fortsetzung ? '' : containerText(tc, stile), start: raster });
      raster += Number(kind(tcpr, 'w:gridSpan')?.attrs['w:val'] ?? 1);
      for (const p of absaetzeIn(tc)) {
        for (const t of leseAbsatz(p, stile).teile) if (t.art === 'bild') bilder.push(t.rId);
      }
    }
    roheZeilen.push(zellen);
  }
  const spalten = Math.max(0, ...roheZeilen.map((z) => z.length));
  const bezug = (roheZeilen.find((z) => z.length === spalten) ?? []).map((z) => z.start);
  const zeilen = roheZeilen.map((zellen) => {
    if (zellen.length === spalten) return zellen.map((z) => z.text);
    /** @type {string[]} */
    const zeile = [];
    for (const zelle of zellen) {
      let spalte = 0;
      for (let i = 0; i < bezug.length; i++) if ((bezug[i] ?? 0) <= zelle.start) spalte = i;
      while (zeile.length < spalte) zeile.push('');
      zeile.push(zelle.text);
    }
    while (zeile.length < spalten) zeile.push('');
    return zeile;
  });
  return { zeilen, spalten, bilder };
}

// ---------------------------------------------------------------------------------------------
// Aufbau des Whitepapers
// ---------------------------------------------------------------------------------------------

/** @param {string} begriff */
export function glossarId(begriff) {
  const slug = begriff
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `g-${slug}`;
}

/** @param {string[]} zeile */
const zeilenText = (zeile) => zeile.join(' | ');

/**
 * @param {string} dateiName
 * @returns {string | undefined}
 */
function fassungAusName(dateiName) {
  const m = /V(\d+(?:\.\d+)*)/i.exec(dateiName);
  return m ? `V${m[1]}` : undefined;
}

/**
 * Liest die DOCX und baut das Whitepaper.
 * @param {Buffer} docx
 * @param {{ datei: string, fassung?: string }} optionen
 * @returns {ImportErgebnis}
 */
export function importiereDocx(docx, optionen) {
  const zip = leseZip(docx);
  /** @param {string} name */
  const xml = (name) => {
    const b = zip.get(name);
    return b ? parseXml(b.toString('utf8')) : undefined;
  };
  const dokument = xml('word/document.xml');
  const koerper = pfadKind(dokument, 'w:document', 'w:body');
  if (!koerper) throw new Error('DOCX: word/document.xml ohne w:body');
  const stile = leseStile(xml('word/styles.xml'));
  const beziehungen = leseBeziehungen(xml('word/_rels/document.xml.rels'));
  const fassung = optionen.fassung ?? fassungAusName(optionen.datei);
  if (!fassung) throw new Error(`Fassung nicht aus „${optionen.datei}“ ableitbar – bitte --fassung angeben`);

  /** @type {string[]} */
  const hinweise = [];
  /** @type {string[]} */
  const ausgelassen = [];

  // Körper flach: Absätze und Tabellen in Lesereihenfolge; Inhaltssteuerelemente (z. B. das
  // Inhaltsverzeichnis) werden ausgepackt und als Verzeichnis markiert.
  /** @type {{ el: XmlElement, verzeichnis: boolean }[]} */
  const elemente = [];
  /** @param {XmlElement} el @param {boolean} verzeichnis */
  const sammle = (el, verzeichnis) => {
    for (const k of elementKinder(el)) {
      if (k.name === 'w:p' || k.name === 'w:tbl') elemente.push({ el: k, verzeichnis });
      else if (k.name === 'w:sdt') {
        const galerie = pfadKind(k, 'w:sdtPr', 'w:docPartObj', 'w:docPartGallery')?.attrs['w:val'] ?? '';
        sammle(kind(k, 'w:sdtContent') ?? k, verzeichnis || /table of contents/i.test(galerie));
      } else if (k.name === 'w:customXml') sammle(k, verzeichnis);
    }
  };
  sammle(koerper, false);

  // Titelblatt und Inhaltsverzeichnis: alles vor der ersten Überschrift der Ebene 1.
  const start = elemente.findIndex(({ el, verzeichnis }) => {
    if (el.name !== 'w:p' || verzeichnis) return false;
    const a = leseAbsatz(el, stile);
    return a.ebene === 1 && a.text !== '';
  });
  if (start < 0) throw new Error('DOCX: keine Kapitelüberschrift (Ebene 1) gefunden');

  /** @type {Map<string, { nr: string, titel: string }>} */
  const verzeichnis = new Map();
  /** @type {Absatz[]} */
  const titelblatt = [];
  for (const { el, verzeichnis: imVerzeichnis } of elemente.slice(0, start)) {
    if (el.name !== 'w:p') continue;
    const a = leseAbsatz(el, stile);
    if (a.text === '') continue;
    ausgelassen.push(a.text);
    const tocEintrag = /^toc \d+$/i.test(a.stilName);
    if (tocEintrag) {
      const felder = a.text.split('\t').map((f) => f.trim()).filter((f) => f !== '');
      const [nr, titel] = felder;
      if (nr && titel && /^\d+(\.\d+)*$/.test(nr) && a.anker[0]) verzeichnis.set(a.anker[0], { nr, titel });
    } else if (!imVerzeichnis && !/^toc heading$/i.test(a.stilName)) {
      titelblatt.push(a);
    }
  }
  const titelIndex = titelblatt.findIndex((a) => a.fett);
  const titelAbsatz = titelblatt[titelIndex];
  const untertitelAbsatz = titelblatt[titelIndex + 1];
  if (!titelAbsatz || !untertitelAbsatz) throw new Error('DOCX: Titel (fetter Absatz) und Untertitel auf dem Titelblatt nicht gefunden');

  /** @type {Whitepaper} */
  const wp = {
    fassung,
    quelle: { datei: optionen.datei, sha256: createHash('sha256').update(docx).digest('hex') },
    titel: titelAbsatz.text,
    untertitel: untertitelAbsatz.text,
    kapitel: [],
    glossar: [],
    abbildungen: [],
  };
  /** @type {Map<string, Buffer>} */
  const bilder = new Map();

  /** @type {Abschnitt[]} */
  const pfad = [];
  /** @type {number[]} */
  const zaehler = [];
  /** @type {Map<string, number>} */
  const artZaehler = new Map();
  /** @type {Block | undefined} */
  let offeneListe;
  /** @type {{ abschnitt: Abschnitt, lesezeichen: string[] }[]} */
  const ueberschriften = [];

  const aktuell = () => {
    const a = pfad[pfad.length - 1];
    if (!a) throw new Error('interner Fehler: Inhalt vor dem ersten Kapitel');
    return a;
  };
  const letzterOrt = () => {
    const a = aktuell();
    return a.bloecke[a.bloecke.length - 1]?.id ?? a.id;
  };
  /** @type {Record<BlockArt, string>} */
  const BUCHSTABE = { absatz: 'p', fett: 'p', liste: 'l', tabelle: 't', kasten: 'b' };
  /**
   * @param {BlockArt} art @param {string} text
   * @param {{ punkte?: string[], kopf?: string[], zeilen?: string[][] }} [felder]
   * @returns {Block}
   */
  const neuerBlock = (art, text, felder = {}) => {
    const a = aktuell();
    const schluessel = `${a.nr}:${BUCHSTABE[art]}`;
    const n = (artZaehler.get(schluessel) ?? 0) + 1;
    artZaehler.set(schluessel, n);
    /** @type {Block} */
    const block = { id: `k${a.nr}-${BUCHSTABE[art]}${n}`, art, text, ...felder };
    a.bloecke.push(block);
    return block;
  };
  /** @param {string} rId @param {string} ort */
  const bild = (rId, ort) => {
    const ziel = beziehungen.get(rId);
    const inhalt = ziel ? zip.get(ziel) : undefined;
    if (!ziel || !inhalt) {
      hinweise.push(`Bild ${rId} ohne Datei im Archiv – übergangen`);
      return;
    }
    const name = path.posix.basename(ziel);
    const nummer = /(\d+)/.exec(name)?.[1] ?? String(wp.abbildungen.length + 1);
    let id = `abb-${nummer}`;
    for (let n = 2; wp.abbildungen.some((b) => b.id === id); n++) id = `abb-${nummer}-${n}`;
    wp.abbildungen.push({
      id,
      datei: `bilder/${name}`,
      ort,
      kapitel: /** @type {Abschnitt} */ (pfad[0]).nr,
      abschnitt: aktuell().nr,
      sha256: createHash('sha256').update(inhalt).digest('hex'),
    });
    bilder.set(`bilder/${name}`, inhalt);
  };
  /** @param {XmlElement} inhalt */
  const kasten = (inhalt) => {
    const text = containerText(inhalt, stile);
    if (text === '') return;
    const block = neuerBlock('kasten', text);
    for (const p of absaetzeIn(inhalt)) {
      for (const t of leseAbsatz(p, stile).teile) if (t.art === 'bild') bild(t.rId, block.id);
    }
  };

  for (const { el, verzeichnis: imVerzeichnis } of elemente.slice(start)) {
    if (imVerzeichnis) continue;
    if (el.name === 'w:tbl') {
      offeneListe = undefined;
      const { zeilen, spalten, bilder: tabellenBilder } = leseTabelle(el, stile);
      if (zeilen.length === 0) continue;
      /** @type {Block} */
      let block;
      if (zeilen.length === 1 && spalten === 1) {
        // Einzellige Tabelle = abgesetzter Kasten (z. B. „Rahmenbedingungen“ in 6.3).
        block = neuerBlock('kasten', /** @type {string} */ ((/** @type {string[]} */ (zeilen[0]))[0]));
      } else if (zeilen.length === 1) {
        block = neuerBlock('tabelle', zeilenText(/** @type {string[]} */ (zeilen[0])), { kopf: [], zeilen });
      } else {
        const [kopf = [], ...rest] = zeilen;
        block = neuerBlock('tabelle', zeilen.map(zeilenText).join('\n'), { kopf, zeilen: rest });
      }
      for (const rId of tabellenBilder) bild(rId, block.id);
      continue;
    }

    const a = leseAbsatz(el, stile);
    if (a.ebene > 0 && a.text !== '') {
      offeneListe = undefined;
      const ebene = a.ebene;
      if (ebene > pfad.length + 1) {
        throw new Error(`Überschrift „${a.text}“ (Ebene ${ebene}) folgt ohne Ebene ${pfad.length + 1}`);
      }
      zaehler.length = ebene;
      zaehler[ebene - 1] = (zaehler[ebene - 1] ?? 0) + 1;
      const nr = zaehler.join('.');
      /** @type {Abschnitt} */
      const abschnitt = { id: `k${nr}`, nr, titel: a.text, bloecke: [], abschnitte: [] };
      if (ebene === 1) wp.kapitel.push(abschnitt);
      else /** @type {Abschnitt} */ (pfad[ebene - 2]).abschnitte.push(abschnitt);
      pfad.length = ebene - 1;
      pfad.push(abschnitt);
      ueberschriften.push({ abschnitt, lesezeichen: a.lesezeichen });
      for (const t of a.teile) if (t.art === 'bild') bild(t.rId, abschnitt.id);
      continue;
    }

    // Inhaltsabsatz: Bilder vor dem Text stehen nach dem vorigen Block, Bilder nach Text nach diesem.
    let textGesehen = false;
    /** @type {string[]} */
    const bilderDavor = [];
    /** @type {string[]} */
    const bilderDanach = [];
    /** @type {XmlElement[]} */
    const kaesten = [];
    for (const t of a.teile) {
      if (t.art === 'text') textGesehen ||= bereinige(t.text) !== '';
      else if (t.art === 'bild') (textGesehen ? bilderDanach : bilderDavor).push(t.rId);
      else kaesten.push(t.inhalt);
    }
    for (const rId of bilderDavor) bild(rId, letzterOrt());

    if (a.text === '') {
      if (kaesten.length === 0 && bilderDavor.length === 0) offeneListe = undefined;
    } else if (a.liste) {
      if (offeneListe && aktuell().bloecke[aktuell().bloecke.length - 1] === offeneListe) {
        (offeneListe.punkte ??= []).push(a.text);
        offeneListe.text = offeneListe.punkte.join('\n');
      } else {
        offeneListe = neuerBlock('liste', a.text, { punkte: [a.text] });
      }
    } else {
      offeneListe = undefined;
      neuerBlock(a.fett ? 'fett' : 'absatz', a.text);
    }
    if (a.fussnoten > 0) hinweise.push(`Fußnote nach ${letzterOrt()} nicht übernommen (Schema ohne Fußnoten)`);
    for (const rId of bilderDanach) bild(rId, letzterOrt());
    for (const inhalt of kaesten) {
      offeneListe = undefined;
      kasten(inhalt);
    }
  }

  // Nummern gegen das Inhaltsverzeichnis der DOCX prüfen (Verknüpfung über die _Toc-Lesezeichen).
  if (verzeichnis.size === 0) {
    hinweise.push('kein Inhaltsverzeichnis gefunden – Kapitelnummern ungeprüft');
  } else {
    /** @type {string[]} */
    const fehler = [];
    const gefunden = new Set();
    for (const { abschnitt, lesezeichen } of ueberschriften) {
      const marke = lesezeichen.find((l) => verzeichnis.has(l));
      const eintrag = marke ? verzeichnis.get(marke) : undefined;
      if (!marke || !eintrag) {
        if (!abschnitt.nr.includes('.')) fehler.push(`Kapitel ${abschnitt.nr} „${abschnitt.titel}“ fehlt im Inhaltsverzeichnis`);
        continue;
      }
      gefunden.add(marke);
      if (eintrag.nr !== abschnitt.nr || normalisiere(eintrag.titel) !== normalisiere(abschnitt.titel)) {
        fehler.push(`Überschrift ${abschnitt.nr} „${abschnitt.titel}“ ≠ Verzeichnis ${eintrag.nr} „${eintrag.titel}“`);
      }
    }
    for (const [marke, eintrag] of verzeichnis) {
      if (!gefunden.has(marke)) fehler.push(`Verzeichniseintrag ${eintrag.nr} „${eintrag.titel}“ ohne Überschrift`);
    }
    if (fehler.length > 0) throw new Error(`Inhaltsverzeichnis und Überschriften passen nicht:\n  ${fehler.join('\n  ')}`);
  }

  // Glossar: erste Tabelle im Kapitel, dessen Titel „Glossar“ enthält.
  const glossarKapitel = wp.kapitel.find((k) => /glossar/i.test(k.titel));
  const glossarTabelle = glossarKapitel ? alleBloeckeVon(glossarKapitel).find((b) => b.art === 'tabelle') : undefined;
  if (!glossarTabelle) hinweise.push('kein Glossar gefunden');
  for (const zeile of glossarTabelle?.zeilen ?? []) {
    const [begriff = '', definition = ''] = zeile;
    if (begriff === '') continue;
    let id = glossarId(begriff);
    for (let n = 2; wp.glossar.some((g) => g.id === id); n++) id = `${glossarId(begriff)}-${n}`;
    wp.glossar.push({ id, begriff, definition });
  }

  return { whitepaper: wp, bilder, hinweise, ausgelassen };
}

/** @param {Abschnitt} a @returns {Block[]} */
function alleBloeckeVon(a) {
  return [...a.bloecke, ...a.abschnitte.flatMap(alleBloeckeVon)];
}

// ---------------------------------------------------------------------------------------------
// Ausgabe: JSON und Markdown
// ---------------------------------------------------------------------------------------------

/** @param {Whitepaper} wp */
export function alsJson(wp) {
  return `${JSON.stringify(wp, null, 2)}\n`;
}

/** Markdown-Sonderzeichen maskieren, damit der Wortlaut beim Rendern erhalten bleibt. @param {string} s */
function md(s) {
  return s
    .replace(/([\\`*_[\]<>])/g, '\\$1')
    .replace(/^(\s*)([#+=-])(?=\s|$)/gm, '$1\\$2')
    .replace(/^(\s*\d+)([.)])(?=\s|$)/gm, '$1\\$2');
}

/** @param {string} s */
const mdZelle = (s) => md(s).replace(/\|/g, '\\|').replace(/\n/g, '<br>');

/** @param {Block} block @returns {string[]} */
function blockAlsMarkdown(block) {
  switch (block.art) {
    case 'absatz':
      return [md(block.text).replace(/\n/g, '<br>\n')];
    case 'fett':
      return [`**${md(block.text).replace(/\n/g, '<br>\n')}**`];
    case 'liste':
      return (block.punkte ?? []).map((p) => `- ${md(p).replace(/\n/g, '<br>')}`);
    case 'kasten':
      return block.text.split('\n').flatMap((z, i) => (i === 0 ? [`> ${md(z)}`] : ['>', `> ${md(z)}`]));
    case 'tabelle': {
      const zeilen = block.zeilen ?? [];
      const kopf = block.kopf && block.kopf.length > 0 ? block.kopf : (zeilen[0] ?? []).map(() => '');
      /** @param {string[]} z */
      const zeile = (z) => `| ${z.map(mdZelle).join(' | ')} |`;
      return [zeile(kopf), `|${kopf.map(() => '---').join('|')}|`, ...zeilen.map(zeile)];
    }
    default:
      return [md(block.text)];
  }
}

/** @param {Whitepaper} wp */
export function alsMarkdown(wp) {
  /** @type {Map<string, Abbildung[]>} */
  const abbNach = new Map();
  for (const abb of wp.abbildungen) abbNach.set(abb.ort, [...(abbNach.get(abb.ort) ?? []), abb]);
  /** @type {string[]} */
  const z = [
    `<!-- Erzeugt von werkzeuge/whitepaper-import.mjs aus ${wp.quelle.datei} (sha256 ${wp.quelle.sha256}). Nicht von Hand bearbeiten; maßgeblich ist whitepaper.json. -->`,
    '',
    `# ${md(wp.titel)}`,
    '',
    md(wp.untertitel),
    '',
    `Fassung ${wp.fassung}`,
    '',
  ];
  /** @param {string} ort */
  const abbildungen = (ort) => {
    for (const abb of abbNach.get(ort) ?? []) z.push(`![Abbildung ${abb.id}](${abb.datei})`, '');
  };
  /** @param {Abschnitt} a @param {number} tiefe */
  const gehe = (a, tiefe) => {
    z.push(`${'#'.repeat(tiefe + 1)} ${a.nr} ${md(a.titel)}`, '');
    abbildungen(a.id);
    for (const block of a.bloecke) {
      z.push(`<!-- id: ${block.id} -->`, ...blockAlsMarkdown(block), '');
      abbildungen(block.id);
    }
    for (const u of a.abschnitte) gehe(u, tiefe + 1);
  };
  for (const k of wp.kapitel) gehe(k, 1);
  while (z[z.length - 1] === '') z.pop();
  return `${z.join('\n')}\n`;
}

// ---------------------------------------------------------------------------------------------
// Gegenprobe mit mammoth und Vergleichsbericht
// ---------------------------------------------------------------------------------------------

/**
 * Unabhängige Vollständigkeitsprobe: jeder Absatz, den mammoth aus der DOCX liest, muss (normalisiert)
 * in einem Block, einer Überschrift oder den bewusst ausgelassenen Texten (Titelblatt, Verzeichnis) stehen.
 * @param {Buffer} docx @param {ImportErgebnis} ergebnis
 * @returns {Promise<string[]>} fehlende Absätze (leer = vollständig)
 */
export async function gegenprobeMammoth(docx, ergebnis) {
  const { default: mammoth } = await import('mammoth');
  const { value } = await mammoth.extractRawText({ buffer: docx });
  const wp = ergebnis.whitepaper;
  const heuhaufen = [
    wp.titel,
    wp.untertitel,
    ...ergebnis.ausgelassen,
    ...alleAbschnitte(wp).map((a) => a.titel),
    ...alleBloecke(wp).map((b) => b.text),
  ].map(normalisiere).join('\n');
  return value
    .split(/\n{2,}/)
    .map((absatz) => normalisiere(bereinige(absatz)))
    .filter((absatz) => absatz !== '' && !heuhaufen.includes(absatz));
}

/** @param {string} s @param {number} n */
const kuerze = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/**
 * Lesbarer Bericht zu vergleiche(): Stelle der Änderung mit etwas Umfeld, Hinweis auf verschobene Texte.
 * @param {Whitepaper} altWp @param {Whitepaper} neuWp
 */
export function vergleichsBericht(altWp, neuWp) {
  const v = vergleiche(altWp, neuWp);
  /** @type {Map<string, string>} */
  const neuNachText = new Map();
  for (const b of alleBloecke(neuWp)) if (!neuNachText.has(normalisiere(b.text))) neuNachText.set(normalisiere(b.text), b.id);
  /** @type {Map<string, string>} */
  const altText = new Map(alleBloecke(altWp).map((b) => [b.id, b.text]));
  /** @type {Map<string, string>} */
  const neuText = new Map(alleBloecke(neuWp).map((b) => [b.id, b.text]));
  /** @type {string[]} */
  const z = [
    `Vergleich ${altWp.fassung} (${altWp.quelle.sha256.slice(0, 12)}) → ${neuWp.fassung} (${neuWp.quelle.sha256.slice(0, 12)})`,
    `neu ${v.neu.length} · entfallen ${v.entfallen.length} · geändert ${v.geaendert.length}`,
  ];
  if (v.neu.length > 0) {
    z.push('', 'Neu:');
    for (const id of v.neu) z.push(`  + ${id}  ${kuerze(normalisiere(neuText.get(id) ?? ''), 100)}`);
  }
  if (v.entfallen.length > 0) {
    z.push('', 'Entfallen:');
    for (const id of v.entfallen) {
      const t = normalisiere(altText.get(id) ?? '');
      const jetzt = t ? neuNachText.get(t) : undefined;
      z.push(`  - ${id}  ${kuerze(t, 100)}${jetzt ? `  (Text jetzt unter ${jetzt})` : ''}`);
    }
  }
  if (v.geaendert.length > 0) {
    z.push('', 'Geändert:');
    for (const { id, alt, neu } of v.geaendert) {
      const a = normalisiere(alt);
      const n = normalisiere(neu);
      let vorn = 0;
      while (vorn < a.length && vorn < n.length && a[vorn] === n[vorn]) vorn++;
      let hinten = 0;
      while (hinten < a.length - vorn && hinten < n.length - vorn && a[a.length - 1 - hinten] === n[n.length - 1 - hinten]) hinten++;
      // Auf Wortgrenzen erweitern, damit der Bericht „[100 → 150]“ statt „[0 → 5]“ zeigt.
      while (vorn > 0 && !/\s/.test(a[vorn - 1] ?? '')) vorn--;
      while (hinten > 0 && !/\s/.test(a[a.length - hinten] ?? '')) hinten--;
      const umfeld = a.slice(Math.max(0, vorn - 30), vorn);
      const jetzt = neuNachText.get(a);
      z.push(`  ~ ${id}${jetzt && jetzt !== id ? `  (alter Text jetzt unter ${jetzt})` : ''}`);
      z.push(`      …${umfeld}[${kuerze(a.slice(vorn, a.length - hinten), 160)} → ${kuerze(n.slice(vorn, n.length - hinten), 160)}]`);
    }
  }
  return `${z.join('\n')}\n`;
}

// ---------------------------------------------------------------------------------------------
// Kommandozeile
// ---------------------------------------------------------------------------------------------

/**
 * Importiert eine DOCX-Datei und liefert die Ausgabedateien (ohne zu schreiben).
 * @param {string} docxPfad
 * @param {{ fassung?: string }} [optionen]
 */
export function erzeuge(docxPfad, optionen = {}) {
  const docx = readFileSync(docxPfad);
  const ergebnis = importiereDocx(docx, { datei: path.basename(docxPfad), ...optionen });
  return { docx, ergebnis, json: alsJson(ergebnis.whitepaper), markdown: alsMarkdown(ergebnis.whitepaper) };
}

/** @param {string[]} argv */
function leseArgumente(argv) {
  /** @type {{ docx?: string, ziel?: string, vergleich?: string, fassung?: string, pruefe: boolean }} */
  const o = { pruefe: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const wert = () => {
      const w = argv[++i];
      if (w === undefined) throw new Error(`${a} braucht einen Wert`);
      return w;
    };
    if (a === '--docx') o.docx = wert();
    else if (a === '--ziel') o.ziel = wert();
    else if (a === '--vergleich') o.vergleich = wert();
    else if (a === '--fassung') o.fassung = wert();
    else if (a === '--pruefe') o.pruefe = true;
    else throw new Error(`unbekanntes Argument ${a}\nAufruf: node werkzeuge/whitepaper-import.mjs [--docx <pfad>] [--ziel <ordner>] [--vergleich <alte whitepaper.json>] [--fassung V1.3] [--pruefe]`);
  }
  return o;
}

/** @param {string[]} argv @returns {Promise<number>} Exit-Code */
export async function haupt(argv) {
  const o = leseArgumente(argv);
  const docxPfad = path.resolve(o.docx ?? STANDARD_DOCX);
  const ziel = path.resolve(o.ziel ?? path.dirname(docxPfad));
  // Alte Fassung zuerst lesen: --vergleich darf auf die Datei zeigen, die gleich überschrieben wird.
  const alt = o.vergleich ? ladeWhitepaper(o.vergleich) : undefined;
  const { docx, ergebnis, json, markdown } = erzeuge(docxPfad, o.fassung ? { fassung: o.fassung } : {});
  for (const h of ergebnis.hinweise) console.warn(`Hinweis: ${h}`);

  const fehlend = await gegenprobeMammoth(docx, ergebnis);
  if (fehlend.length > 0) {
    console.error(`Gegenprobe mammoth: ${fehlend.length} Absatz/Absätze fehlen im Import:`);
    for (const f of fehlend) console.error(`  ${kuerze(f, 120)}`);
    return 1;
  }

  /** @type {[string, string | Buffer][]} */
  const dateien = [
    ['whitepaper.json', json],
    ['whitepaper.md', markdown],
    ...[...ergebnis.bilder].map(([name, inhalt]) => /** @type {[string, Buffer]} */ ([name, inhalt])),
  ];
  let veraltet = 0;
  /** @param {string} p */
  const anzeige = (p) => path.relative(WURZEL, p).split(path.sep).join('/');
  for (const [name, inhalt] of dateien) {
    const ort = path.join(ziel, name);
    const soll = typeof inhalt === 'string' ? Buffer.from(inhalt, 'utf8') : inhalt;
    const ist = existsSync(ort) ? readFileSync(ort) : undefined;
    if (ist && ist.equals(soll)) continue;
    if (o.pruefe) {
      console.error(`veraltet: ${anzeige(ort)}`);
      veraltet++;
    } else if (ist && name.startsWith('bilder/')) {
      // Bilder sind Archiv (O-13): nie still überschreiben.
      console.warn(`Hinweis: ${anzeige(ort)} weicht von der DOCX ab – nicht überschrieben`);
    } else {
      mkdirSync(path.dirname(ort), { recursive: true });
      writeFileSync(ort, soll);
      console.log(`geschrieben: ${anzeige(ort)}`);
    }
  }

  const wp = ergebnis.whitepaper;
  const bloecke = alleBloecke(wp);
  console.log(
    `${wp.fassung}: ${wp.kapitel.length} Kapitel, ${alleAbschnitte(wp).length - wp.kapitel.length} Abschnitte, ` +
    `${bloecke.length} Blöcke, ${wp.glossar.length} Glossareinträge, ${wp.abbildungen.length} Abbildungen; Gegenprobe mammoth vollständig`,
  );
  if (alt) process.stdout.write(`\n${vergleichsBericht(alt, wp)}`);
  if (o.pruefe && veraltet > 0) {
    console.error('Whitepaper-Quelle veraltet: node werkzeuge/whitepaper-import.mjs ausführen');
    return 1;
  }
  return 0;
}

/** Direkt aufgerufen (nicht importiert)? Auch über Links (werkzeuge/haupt.mjs). */
if (istHauptmodul(import.meta.url)) {
  haupt(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (fehler) => {
      console.error(fehler instanceof Error ? fehler.message : fehler);
      process.exitCode = 1;
    },
  );
}
