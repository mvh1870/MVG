/*
 * Bausteine der Lagetafel aus Inhaltsblöcken (docs/INHALTSFORMAT.md 3.3): Requisiten der Welt A
 * (Mail, Chat, Haftnotiz, Excel-Stand) und Bausteine der Welt B (Kette, Datenstand), dazu Hinweis,
 * Merksatz und Zitat. Jede Funktion zeichnet genau einen Block; Texte kommen aus dem Block.
 */

import { h, elementAus, laengstesWort } from '../h.ts';
import { symbol, type SymbolName } from '../../stil/symbole.ts';
import type { Block, Nachweis, OeffentlicheInhalte, Station } from '../../inhalte/typen.ts';
import { kopfListe, kopfText, istKarte } from '../anzeige.ts';
import { inhalt, inhaltInline, personFigur, personFunktion, personName } from './inhalt.ts';
import { idArt } from '../../grafik/checkliste.ts';
import { tafel as tafelGrafik, istTafelForm, type TitelStufe } from '../../grafik/tafel.ts';
import { nachweiskette as nachweisketteGrafik } from '../../grafik/nachweiskette.ts';
import { raci as raciGrafik, istRaciBuchstabe, RACI_BESCHRIFTUNG, type RaciBuchstabe, type RaciZeile } from '../../grafik/raci.ts';
import { W } from '../woerter.ts';

export function sym(name: SymbolName, klasse = ''): Element {
  return elementAus(symbol(name, klasse));
}

/** Symbolnamen der Inhalte (z. B. `symbol: anruf`) → Ikone des Stils. */
const SYMBOL_AUS_INHALT: Readonly<Record<string, SymbolName>> = {
  anruf: 'telefon',
  telefon: 'telefon',
  mail: 'mail',
  chat: 'chat',
  weiterarbeiten: 'weiterarbeiten',
  vorlage: 'dokument',
  dokument: 'dokument',
  eskalation: 'eskalieren',
  eskalieren: 'eskalieren',
  aktualisieren: 'aktualisieren',
  haken: 'haken',
  kreuz: 'kreuz',
  warnung: 'warnung',
  kompass: 'kompass',
  wechsel: 'wechsel',
  schild: 'schild',
  person: 'person',
  flagge: 'flagge',
  stempel: 'stempel',
  buch: 'buch',
  info: 'info',
};

export function symbolAusInhalt(name: string | null): Element | null {
  if (name === null) return null;
  const s = SYMBOL_AUS_INHALT[name];
  return s !== undefined ? sym(s) : null;
}

/** Notizfarbe der Inhalte → Attribut des Stils (limette heißt im Stil „gruen“). */
export function notizFarbe(farbe: string | null): string | null {
  if (farbe === 'limette') return 'gruen';
  if (farbe === 'rosa' || farbe === 'lila') return farbe;
  return null;
}

/**
 * Name des Absenders – oder „Sie“, wenn die Figur die der gespielten Rolle ist (H13: niemand liest
 * über sich in der dritten Person). `ich` = Figur der gespielten Rolle.
 */
function absenderName(von: string, inhalte: OeffentlicheInhalte, ich: string | null, sieWort: string): string {
  return ich !== null && von === ich ? sieWort : personName(von, inhalte);
}

export function mail(b: Block, inhalte: OeffentlicheInhalte, beschriftung: { eingang: string; neu: string; betreff: string; anhang: string; sie?: string; vonIhnen?: string }, ich: string | null = null): HTMLElement {
  const von = kopfText(b.kopf, 'von') ?? '';
  const anhang = kopfText(b.kopf, 'anhang');
  const name = absenderName(von, inhalte, ich, beschriftung.sie ?? 'Sie');
  return h('article', { class: 'mail', 'aria-label': ich !== null && von === ich ? (beschriftung.vonIhnen ?? 'E-Mail von Ihnen') : `E-Mail von ${name}` },
    h('div', { class: 'mail-leiste' }, sym('mail'), h('span', null, beschriftung.eingang), h('span', { class: 'mail-neu' }, beschriftung.neu),
      kopfText(b.kopf, 'zeit') !== null ? h('span', { class: 'mail-zeit' }, kopfText(b.kopf, 'zeit')) : null),
    h('div', { class: 'mail-inhalt' },
      h('div', { class: 'absender' }, personFigur(von, 46, inhalte), h('div', null, h('b', null, name), h('span', null, personFunktion(von, inhalte)))),
      h('h3', { class: 'mail-betreff' }, h('span', { class: 't-label' }, beschriftung.betreff), kopfText(b.kopf, 'betreff') ?? ''),
      h('div', { class: 'mail-text' }, inhalt(b.felder['text'] ?? '')),
      anhang !== null ? h('span', { class: 'anhang' }, sym('tabelle'), h('span', { class: 'nur-sr' }, `${beschriftung.anhang}: `), h('span', { class: 'mono' }, anhang)) : null));
}

export function chat(b: Block, inhalte: OeffentlicheInhalte, verzug: number, ich: string | null = null, sieWort = 'Sie'): HTMLElement {
  const von = kopfText(b.kopf, 'von') ?? '';
  const f = inhalte.fall?.figuren[von];
  const kurz = f !== undefined ? (inhalte.rollen[f.rolle ?? '']?.kurztitel ?? f.funktion) : '';
  return h('div', { class: 'chat anim-auftauchen', style: `--verzug:${verzug}ms` },
    personFigur(von, 42, inhalte),
    h('div', { class: 'sprechblase' },
      h('div', { class: 'blase-kopf' }, h('b', null, absenderName(von, inhalte, ich, sieWort)), h('span', null, kurz),
        kopfText(b.kopf, 'zeit') !== null ? h('span', { class: 'blase-zeit' }, kopfText(b.kopf, 'zeit')) : null),
      h('div', { class: 'blase-text', style: `--verzug:${verzug}ms` },
        h('div', { class: 'tippt', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
        h('div', { class: 'nachricht' }, inhalt(b.felder['text'] ?? '')))));
}

const DREHUNG = [-3, 4, -5, 3, 2, -4];

export function haftnotiz(b: Block, i: number, verzug: number): HTMLElement {
  return h('div', {
    class: 'haftnotiz',
    'data-farbe': notizFarbe(kopfText(b.kopf, 'farbe')),
    style: `--dreh:${DREHUNG[i % DREHUNG.length] ?? 0}deg;--verzug:${verzug}ms`,
  }, symbolAusInhalt(kopfText(b.kopf, 'symbol')), inhaltInline(b.felder['text'] ?? ''));
}

/** Protokoll (P3.1): ein Blatt mit Kopf (Titel, Datum) und Punkten; Welt A. */
export function protokoll(b: Block, verzug = 0): HTMLElement {
  const datum = kopfText(b.kopf, 'datum');
  return h('figure', { class: 'protokoll anim-auftauchen', style: `--verzug:${verzug}ms`, 'data-pruef': 'protokoll' },
    h('figcaption', { class: 'protokoll-kopf' }, sym('dokument'), h('b', null, kopfText(b.kopf, 'titel') ?? ''), datum !== null ? h('small', null, datum) : null),
    h('div', { class: 'protokoll-text' }, inhalt(b.felder['text'] ?? '')));
}

/** Aktenstapel (P3.1): n Ordnerrücken mit Beschriftung; dekorativ bis auf die Beschriftung. */
export function akten(b: Block, verzug = 0): HTMLElement {
  const n = Math.max(1, Math.min(12, Number(kopfText(b.kopf, 'anzahl') ?? '4') || 4));
  const text = b.felder['text'] ?? '';
  return h('figure', { class: 'akten anim-auftauchen', style: `--verzug:${verzug}ms`, 'data-pruef': 'akten' },
    h('div', { class: 'akten-stapel', 'aria-hidden': 'true' }, Array.from({ length: n }, (_, i) => h('i', { style: `--i:${i}` }))),
    h('figcaption', null, h('b', null, kopfText(b.kopf, 'beschriftung') ?? ''), text !== '' ? inhaltInline(text) : null));
}

export function tabellenstand(b: Block, i: number): HTMLElement {
  const wert = kopfText(b.kopf, 'wert') ?? '';
  // R45: die Anzeigeschrift wird nie getrennt – das längste Wort bestimmt, wie groß sie im Kasten sein darf (CSS)
  const zeichen = laengstesWort(wert);
  return h('div', { class: 'tabellenstand', style: `--dreh:${i % 2 === 0 ? -1 : 1.2}deg; --zeichen:${zeichen}` },
    h('span', { class: 'tabellenstand-quelle' }, sym('tabelle'), kopfText(b.kopf, 'quelle') ?? ''),
    h('b', { class: 'tabellenstand-zahl' }, wert),
    h('span', { class: 'tabellenstand-datei mono' }, dateinameMitUmbruch(kopfText(b.kopf, 'name') ?? '')));
}

/** Lange Dateinamen brechen nach „_“ und vor „.“ um, nicht mitten im Wort (Schönheitsfehler aus P0.6). */
export function dateinameMitUmbruch(name: string): Node[] {
  const teile = name.split(/(?<=_)|(?=\.)/u);
  return teile.flatMap((t, i) => (i === 0 ? [document.createTextNode(t)] : [document.createElement('wbr'), document.createTextNode(t)]));
}

export function hinweis(b: Block): HTMLElement {
  return h('div', { class: 'hinweis-zeile' }, sym('info'), h('div', null, inhalt(b.felder['text'] ?? '')));
}

export function merksatz(b: Block, verzug = 0): HTMLElement {
  return h('div', { class: 'lehre anim-einblenden', style: `--verzug:${verzug}ms` }, sym('lesezeichen'), h('div', null, inhalt(b.felder['text'] ?? '')));
}

/** Zitat mit Quelle (Ebene 4, Theorie): wortgleich aus dem Whitepaper, Quelle aus dem Block. */
export function zitat(b: Block, klasse: string, quelleWort: string): HTMLElement {
  const f = inhalt(b.felder['text'] ?? '');
  const bq = f.querySelector('blockquote');
  if (bq !== null) bq.classList.add(klasse);
  return h('div', { class: 'zitat-block', 'data-pruef': 'zitat' }, f,
    // R49 (O-34): die Quelle trägt ein neutrales Zeichen – die Bildmarke steht nur neben dem Namen
    h('p', { class: 'quelle' }, sym('buch'), h('span', null, `${quelleWort} · Quelle: `, h('b', null, kopfText(b.kopf, 'quelle') ?? ''))));
}

const GLIED_ART: Readonly<Record<string, string>> = {
  fruehwarnung: 'frw',
  risiko: 'ris',
  aenderung: 'aen',
  entscheidung: 'ent',
  massnahme: 'mas',
  problem: 'prb',
};

/** Verknüpfungskette FRW → bestätigt → RIS (Welt B). */
export function kette(b: Block, inhalte: OeffentlicheInhalte, startVerzug: number): HTMLElement {
  const teile: HTMLElement[] = [];
  b.kinder.filter((k) => k.art === 'glied').forEach((g, i) => {
    const art = kopfText(g.kopf, 'art') ?? '';
    const verzug = startVerzug + i * 500;
    if (art === 'bestaetigung') {
      const von = kopfText(g.kopf, 'von');
      const rolle = von !== null ? inhalte.fall?.figuren[von]?.rolle ?? null : null;
      teile.push(h('div', { class: 'glied-link', style: `--verzug:${verzug}ms` },
        h('span', { class: 'stempel', 'data-rolle': rolle !== null ? ({ ps: 'ps', pl: 'pl', gf: 'gf', bauherr: 'bh', planung: 'plan', controlling: 'ctl' } as Record<string, string>)[rolle] ?? null : null },
          von !== null ? personFigur(von, 30, inhalte) : null,
          h('span', null, inhaltInline(g.felder['titel'] ?? ''), h('small', null, inhaltInline(g.felder['text'] ?? ''))))));
      return;
    }
    teile.push(h('div', { class: 'glied', 'data-welt': art === 'risiko' ? 'b' : null, style: `--verzug:${verzug}ms` },
      g.id !== null ? h('span', { class: 'id-marke', 'data-art': GLIED_ART[art] ?? idArt(g.id) }, g.id) : null,
      h('b', null, inhaltInline(g.felder['titel'] ?? '')),
      h('span', null, inhaltInline(g.felder['text'] ?? ''))));
  });
  return h('div', { class: 'kette' }, teile);
}

/** Verbindlicher Datenstand mit Siegel und Versionen (Welt B). */
export function datenstand(b: Block, beschriftung: { titel: string; siegel: string; vergleich: string }): { element: HTMLElement; zahlen: HTMLElement[] } {
  const versionen = kopfListe(b.kopf, 'versionen').filter(istKarte).map((v) => ({ name: String(v['name'] ?? ''), stand: String(v['stand'] ?? '') }));
  const zahlen: HTMLElement[] = [];
  const zahl = (wert: string | null, zusatz: string | null): HTMLElement | null => {
    if (wert === null) return null;
    const m = /^([+-]?[\d.,]+)\s*(.*)$/.exec(wert);
    const z = h('span', { class: 'datenstand-zahl', 'data-wert': m?.[1] ?? wert }, m?.[1] ?? wert);
    zahlen.push(z);
    // Schmales geschütztes Leerzeichen als Text: vorgelesen und kopiert „+4,7 Mio. €“, nicht „+4,7Mio. €“.
    return h('div', null, h('b', null, z, m?.[2] ? '\u202F' : null, m?.[2] ? h('small', null, m[2]) : null), zusatz !== null ? h('span', null, zusatz) : null);
  };
  const vergleichHtml = b.felder['vergleich'] ?? '';
  const element = h('div', { class: 'datenstand-raster' },
    h('div', { class: 'datenstand-karte anim-auftauchen', 'data-pruef': 'datenstand' },
      h('div', { class: 'datenstand-kopf' }, h('span', { class: 't-label' }, beschriftung.titel), h('span', { class: 'siegel' }, sym('haken'), beschriftung.siegel)),
      h('span', { class: 'mono datenstand-name' }, kopfText(b.kopf, 'name') ?? ''),
      h('div', { class: 'datenstand-zahlen' }, zahl(kopfText(b.kopf, 'abweichung'), null), zahl(kopfText(b.kopf, 'betrag'), kopfText(b.kopf, 'basis'))),
      versionen.length > 0 ? h('ol', { class: 'versionen', 'aria-label': 'Versionen' }, versionen.map((v) => h('li', {
        class: v.stand === 'gilt' ? 'ist-aktuell' : v.stand === 'ersetzt' ? 'ist-alt' : 'ist-naechste',
      }, h('b', null, v.name), v.stand))) : null,
      b.felder['text'] ? h('div', { class: 'datenstand-notiz' }, inhalt(b.felder['text'])) : null),
    vergleichHtml !== '' ? h('aside', { class: 'welt-a-kasten anim-auftauchen', style: '--verzug:400ms' }, h('span', { class: 't-label' }, beschriftung.vergleich), h('div', { class: 'welt-a-vergleich' }, inhalt(vergleichHtml))) : null);
  return { element, zahlen };
}

/** Whitepaper-Tabelle als Grafik (P4, L-32); `besucht` = Stationen der eigenen Spur. */
export function tafel(b: Block, besucht: readonly string[] = [], inhalte: OeffentlicheInhalte | null = null, stufe: TitelStufe = 'h4'): HTMLElement | null {
  const form = kopfText(b.kopf, 'form') ?? '';
  const t = b.kopf['tabelle'];
  if (!istTafelForm(form) || b.id === null || !istKarte(t)) return null;
  const zeilen = Array.isArray(t['zeilen']) ? t['zeilen'].map((z) => (Array.isArray(z) ? z.map(String) : [])) : [];
  const kopf = Array.isArray(t['kopf']) ? t['kopf'].map(String) : [];
  const roh = b.kopf['erlebt'];
  const erlebt: Record<string, string[]> = {};
  if (istKarte(roh)) for (const [nr, liste] of Object.entries(roh)) erlebt[nr] = Array.isArray(liste) ? liste.map(String) : [];
  const namen: Record<string, string> = {};
  for (const st of Object.values(inhalte?.stationen ?? {})) namen[st.id] = st.kurztitel;
  const h0 = b.kopf['hervor'];
  const hervor = Array.isArray(h0) ? h0.map(Number) : [];
  return mitEinleitung(b, tafelGrafik({ form, absatz: b.id, quelle: kopfText(b.kopf, 'quelle') ?? '', kopf, zeilen, erlebt, namen, hervor, stufe }, besucht));
}

/** RACI mit Mandat (P5.1, Kap. 9.2); `ich` = gespielte Rolle (Spalte hervorgehoben). */
export function raci(b: Block, inhalte: OeffentlicheInhalte, ich: string | null = null, stufe: TitelStufe = 'h4'): HTMLElement | null {
  const roh = b.kopf['zeilen'];
  if (!Array.isArray(roh)) return null;
  const zeilen: RaciZeile[] = roh.filter(istKarte).map((z) => {
    const zuordnung: Record<string, RaciBuchstabe> = {};
    const zu = z['zuordnung'];
    if (istKarte(zu)) for (const [r, bu] of Object.entries(zu)) if (typeof bu === 'string' && istRaciBuchstabe(bu)) zuordnung[r] = bu;
    return { id: String(z['id'] ?? ''), titel: String(z['titel'] ?? ''), zuordnung, mandat: String(z['mandat'] ?? '') };
  });
  const rollen = inhalte.rollenFolge.map((id) => ({ id, titel: inhalte.rollen[id]?.kurztitel ?? id }));
  return mitEinleitung(b, raciGrafik({ rollen, zeilen, ich, beschriftung: RACI_BESCHRIFTUNG, stufe }));
}

/** Nachweiskette zum Anfassen (E2): die besuchten Welt-B-Stationen mit `nachweis`, in der Reihenfolge der Geschichte. */
export function nachweiskette(b: Block, inhalte: OeffentlicheInhalte, besucht: readonly string[], stufe: TitelStufe = 'h3'): HTMLElement {
  const stationen = inhalte.stationsFolge.map((id) => inhalte.stationen[id])
    .filter((st): st is Station & { nachweis: Nachweis } => st !== undefined && st.nachweis !== null && besucht.includes(st.id))
    .map((st) => ({ id: st.id, name: `${st.id} · ${st.kurztitel}`, nachweis: st.nachweis }));
  return mitEinleitung(b, nachweisketteGrafik({ stationen, stufe, beschriftung: W.nachweiskette, zusatz: (html) => h('div', { class: 'nachweis-zusatz' }, inhalt(html)) }));
}

/** Einleitungstext eines Blocks (falls vorhanden) über seiner Grafik. */
export function mitEinleitung(b: Block, el: HTMLElement): HTMLElement {
  const text = b.felder['text'] ?? '';
  return text !== '' ? h('div', { class: 'stapel' }, h('div', { class: 'tafel-einleitung' }, inhalt(text)), el) : el;
}

/** Generischer Block (Rückfall für Arten ohne eigene Szene). */
/** `stufe`: Überschriftenstufe für Tafeltitel (Story: h3 unter dem Schritttitel h2). */
export function block(b: Block, inhalte: OeffentlicheInhalte, zitatWort: string, besucht: readonly string[] = [], ich: string | null = null, stufe: TitelStufe = 'h3'): Node | null {
  switch (b.art) {
    case 'raci':
      return raci(b, inhalte, ich, stufe);
    case 'tafel':
      return tafel(b, besucht, inhalte, stufe);
    case 'nachweiskette':
      return nachweiskette(b, inhalte, besucht, stufe);
    case 'hinweis':
      return hinweis(b);
    case 'merksatz':
      return merksatz(b);
    case 'zitat':
    case 'original':
      return zitat(b, 'zitat', zitatWort);
    case 'kette':
      return kette(b, inhalte, 0);
    case 'protokoll':
      return protokoll(b);
    case 'akten':
      return akten(b);
    default: {
      const texte = Object.values(b.felder).filter((t) => t !== '');
      return texte.length > 0 ? h('div', { class: 'karte' }, texte.map((t) => inhalt(t))) : null;
    }
  }
}
