/*
 * Bereich „Theorie“ (P16.3, O-38): Minimum Viable Governance in Themen – ohne Bezug auf eine Vorlage
 * (keine Vorlagennummern, kein Originaltext, keine Zitierangaben). Seit P17.8 (O-54) ein Buch: vier Teile
 * und ein Anhang, eigene Nummern 1 … in Leserichtung, Fortschritt mit Häkchen (src/ui/themen-fortschritt.ts).
 *
 *   #theorie            → Inhaltsverzeichnis (Teile, nummerierte Zeilen mit Symbol, Kurzsatz, Häkchen; Fortschritt)
 *   #theorie/<thema>    → ein Thema (Kopf, Kernaussage, Abschnitte, Grafiken, „In der Story erlebt“)
 *
 * Optik (P17.9, O-55): Bauplan nur im Kopf (Rasterpapier mit einem Motiv je Teil, src/grafik/themen-bilder.ts) und
 * je Thema eine eigene Illustration; darunter ruhige Fläche. Kernaussage groß mit Symbol, Abschnitte mit Symbol,
 * Karten, Aufklapper und Abbildungen in der Farbe des Teils (data-teil am Inhalt). Am Ende jedes Themas leise der
 * Kontakt über bauherr-mentoren.com (O-44).
 */

import { tafelnAufgeloest, type TitelStufe } from '../../grafik/tafel.ts';
import { kopfMotiv, themaBild } from '../../grafik/themen-bilder.ts';
import type { Block, Ebene, OeffentlicheInhalte, TheorieSeite, TheorieTeil } from '../../inhalte/typen.ts';
import { SYMBOLE, type SymbolName } from '../../stil/symbole.ts';
import {
  istGeschafft, ladeFortschritt, loescheFortschritt, mitAntwort, mitGelesen, speichereFortschritt, verstaendnisfragen, zaehle, zaehlt,
  type Fortschritt, type SpeicherGriff,
} from '../themen-fortschritt.ts';
import { h, ersetze, laengstesWort, mitTrennstellen, schuetzeEinheitenIn, umbruchNachSchraegstrich, vonHtml } from '../h.ts';
import { sym, symbolAusInhalt, tafel as tafelBlock, merksatz, hinweis } from '../bausteine/bloecke.ts';
import { inhalt } from '../bausteine/inhalt.ts';
import { etappen, regler, sortieren, umschalter } from '../bausteine/lernwerkzeuge.ts';
import { abbildung } from '../bausteine/abbildung.ts';
import { bmLink, istEigenstaendig, seitenRahmen } from '../bausteine/seite.ts';
import { kopfText, kopfZahl } from '../anzeige.ts';
import { W } from '../woerter.ts';
import { TEIL, werkzeugAus, werkzeugTitel } from '../werkzeug-kennungen.ts';
import { bogenFuerStrgP, bogenKopf, druckeBogen } from '../druck.ts';

const T = W.themen;

export interface TheorieOptionen {
  inhalte: OeffentlicheInhalte;
  /** null = Übersicht */
  thema: string | null;
  version: string;
  /** false = nur Anzeige (Leinwand, Druck) */
  bedienbar: boolean;
  /** Speicher für den Fortschritt (P17.8); fehlt er, gilt `localStorage`, wenn erreichbar. Nur bei `bedienbar`. */
  speicher?: SpeicherGriff | null;
}

/** `localStorage`, wenn erreichbar; sonst null (schon der Zugriff kann werfen). */
function standardSpeicher(): SpeicherGriff | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage ?? null : null;
  } catch {
    return null;
  }
}

/** Speicher des Fortschritts; auf Leinwand und im Druck keiner (dort kein Fortschritt). */
function speicherVon(o: TheorieOptionen): SpeicherGriff | null {
  if (!o.bedienbar) return null;
  return o.speicher === undefined ? standardSpeicher() : o.speicher;
}

/** Name eines Teils für Kicker und Verzeichnis: „Teil I · Grundlagen“ bzw. „Anhang“. */
export function teilText(teil: TheorieTeil): string {
  return teil === 'anhang' ? T.anhang : `${T.teil(teil)} · ${T.teilName[teil]}`;
}


/** Teile in Leserichtung mit ihren Themen; leere Teile entfallen. */
function nachTeilen(inhalte: OeffentlicheInhalte): { teil: TheorieTeil; themen: TheorieSeite[] }[] {
  const aus: { teil: TheorieTeil; themen: TheorieSeite[] }[] = [];
  for (const t of themen(inhalte)) {
    const letzter = aus[aus.length - 1];
    if (letzter !== undefined && letzter.teil === t.teil) letzter.themen.push(t);
    else aus.push({ teil: t.teil, themen: [t] });
  }
  return aus;
}

function symbolName(t: TheorieSeite): SymbolName {
  return t.symbol in SYMBOLE ? t.symbol as SymbolName : 'buch';
}

function themaSymbol(t: TheorieSeite): Element {
  return sym(symbolName(t));
}

/**
 * Symbol eines Abschnitts aus seinem Titel (P17.9, O-55): das Stichwort, das im Titel zuerst steht (bei gleicher Stelle
 * entscheidet die Reihenfolge der Liste), sonst das Symbol des Themas. Die Inhalte tragen kein eigenes Feld dafür.
 */
const ABSCHNITT_SYMBOLE: readonly (readonly [RegExp, SymbolName])[] = [
  [/glossar|begriff|kompass/iu, 'buch'],
  [/risik|frühwarn|warn|eskal|störung|krise/iu, 'warnung'],
  [/takt|bericht|monat|termin|rhythmus/iu, 'bericht'],
  [/freigabe|beschluss|stempel|abnahme/iu, 'stempel'],
  [/vorlage|option|vergleich|entscheid/iu, 'dokument'],
  [/nutzen|gewinn|wirkung|ergebnis|wert/iu, 'diagramm'],
  [/verantwort|schutz|haftung|legitim/iu, 'schild'],
  [/mandat|befugnis|grenze/iu, 'schloss'],
  [/rolle|wer |bauherr|team|person|gremi|organisation/iu, 'person'],
  [/leistung|baustein|modul|ebene|architektur|stufe/iu, 'ebenen'],
  [/schritt|phase|weg|ablauf|einführ|implement|start|übergabe/iu, 'pfeilRechts'],
  [/werkzeug|praxis|instrument|anwend/iu, 'werkzeug'],
  [/vorgang|zusammen|arbeitsweise|informationsstand|companion/iu, 'wechsel'],
  [/ziel|führung|modell|steuer/iu, 'flagge'],
  [/problem|frage|warum|ausgangslage|lücke/iu, 'frage'],
  [/these|kern|überblick|grundsatz|prinzip/iu, 'kompass'],
];

export function abschnittSymbol(titel: string, ersatz: SymbolName): SymbolName {
  let bestes: { stelle: number; name: SymbolName } | null = null;
  for (const [muster, name] of ABSCHNITT_SYMBOLE) {
    const stelle = titel.search(muster);
    if (stelle >= 0 && (bestes === null || stelle < bestes.stelle)) bestes = { stelle, name };
  }
  return bestes?.name ?? ersatz;
}

/**
 * Kopf mit Bauplan (P17.9, O-55): Rasterpapier mit dem Motiv des Teils, Text links, Illustration rechts. Nur hier
 * liegt der Bauplan; der Lesetext darunter steht auf ruhiger Fläche.
 */
function kopfBand(teil: string, bild: string, ...text: (Node | null)[]): HTMLElement {
  return h('div', { class: 'kopf-band', 'data-pruef': 'kopf-band' },
    h('div', { class: 'kopf-band-motiv', 'aria-hidden': 'true' }, vonHtml(kopfMotiv(teil))),
    h('div', { class: 'kopf-band-text' }, text),
    h('div', { class: 'kopf-band-bild', 'aria-hidden': 'true' }, vonHtml(themaBild(bild))));
}

/** Häkchen eines Themas (Übersicht, Verzeichnis); `markiere` schaltet es um. */
function haken(t: TheorieSeite): HTMLElement | null {
  if (!zaehlt(t)) return null;
  return h('span', { class: 'thema-haken', 'data-haken': t.thema, 'data-pruef': `haken-${t.thema}`, hidden: true },
    sym('haken'), h('span', { class: 'nur-sr' }, ` (${T.geschafft})`));
}

/** Fortschrittsbalken (gesamt oder je Teil); `markiere` setzt Anteil und Zahl. */
function balken(schluessel: string, klein: boolean): HTMLElement {
  return h('div', { class: `fortschritt-balken${klein ? ' ist-klein' : ''}`, 'data-balken': schluessel, 'data-pruef': `balken-${schluessel}` },
    h('span', { class: 'fortschritt-spur', 'aria-hidden': 'true' }, h('span', { class: 'fortschritt-fuellung' })),
    h('span', { class: 'fortschritt-zahl' }));
}

/** Häkchen und Balken auf den Stand bringen (nach Antwort, Seitenende, Zurücksetzen). */
export function markiere(wurzel: ParentNode, inhalte: OeffentlicheInhalte, f: Fortschritt): void {
  const alle = themen(inhalte);
  for (const el of wurzel.querySelectorAll<HTMLElement>('[data-haken]')) {
    const t = alle.find((x) => x.thema === el.dataset['haken']);
    el.hidden = !(t !== undefined && istGeschafft(t, f));
  }
  const z = zaehle(alle, f);
  for (const el of wurzel.querySelectorAll<HTMLElement>('[data-balken]')) {
    const k = el.dataset['balken'] ?? '';
    const c = k === 'gesamt' ? z.gesamt : z.teile[Number(k) as 1 | 2 | 3 | 4];
    if (c === undefined) continue;
    el.style.setProperty('--anteil', String(c.gesamt === 0 ? 0 : c.geschafft / c.gesamt));
    const zahl = el.querySelector('.fortschritt-zahl');
    if (zahl !== null) zahl.textContent = T.geschafftZahl(c.geschafft, c.gesamt);
  }
}

/** Alle Themen in ihrer Reihenfolge. */
export function themen(inhalte: OeffentlicheInhalte): TheorieSeite[] {
  return Object.values(inhalte.theorie).sort((a, b) => a.reihe - b.reihe);
}

export function themaSeite(inhalte: OeffentlicheInhalte, thema: string): TheorieSeite | null {
  return Object.values(inhalte.theorie).find((t) => t.thema === thema.toLowerCase()) ?? null;
}

/** Titel eines Themas (für Links aus Story und Explore); null, wenn es das Thema nicht gibt. */
export function themaTitel(inhalte: OeffentlicheInhalte, thema: string): string | null {
  return themaSeite(inhalte, thema)?.titel ?? null;
}

function verweis(o: TheorieOptionen, href: string, attrs: Record<string, string>, ...kinder: (Node | string | null)[]): HTMLElement {
  return o.bedienbar ? h('a', { ...attrs, href }, kinder) : h('span', attrs, kinder);
}

function rahmen(o: TheorieOptionen, inhaltKnoten: Node[]): HTMLElement {
  return seitenRahmen({
    bereich: 'theorie',
    klasse: 'seite-theorie',
    bedienbar: o.bedienbar,
    inhalt: inhaltKnoten,
  });
}

function verzeichnis(o: TheorieOptionen, aktuell: string | null): HTMLElement {
  const breit = typeof matchMedia !== 'function' || matchMedia('(min-width: 1100px)').matches;
  return h('nav', { class: 'kapitel-verzeichnis-nav', 'aria-label': T.verzeichnis }, h('details', { class: 'kapitel-verzeichnis', open: breit },
    h('summary', { class: 't-label' }, T.verzeichnis),
    nachTeilen(o.inhalte).map(({ teil, themen: liste }) => h('div', { class: 'verzeichnis-teil', 'data-teil': String(teil) },
      h('p', { class: 'verzeichnis-teil-name' }, teilText(teil)),
      h('ol', { class: 'kapitel-liste themen-liste' }, liste.map((t) => h('li', null, verweis(o, `#theorie/${t.thema}`, {
        'data-pruef': `verzeichnis-${t.thema}`,
        ...(t.thema === aktuell ? { 'aria-current': 'page' } : {}),
      }, h('span', { class: 'verzeichnis-nr' }, String(t.nr)), h('span', { class: 'verzeichnis-titel' }, mitTrennstellen(t.kurztitel)), o.bedienbar ? haken(t) : null))))))));
}

/* ------------------------------------------------------------- Übersicht -- */

/** Ein Teil im Inhaltsverzeichnis: Kopf in der Farbe des Teils (Marke I–IV, Name, Balken), darunter die Zeilen. */
function buchTeil(o: TheorieOptionen, teil: TheorieTeil, liste: readonly TheorieSeite[]): HTMLElement {
  const kennung = `buch-teil-${teil}`;
  return h('section', { class: 'buch-teil', 'data-teil': String(teil), 'data-pruef': kennung, 'aria-labelledby': kennung },
    h('header', { class: 'buch-teil-kopf' },
      h('span', { class: 'buch-teil-marke', 'aria-hidden': 'true' }, teil === 'anhang' ? 'A' : ['I', 'II', 'III', 'IV'][teil - 1] ?? ''),
      h('h2', { class: 'buch-teil-titel', id: kennung },
        h('span', { class: 'buch-teil-kicker' }, teil === 'anhang' ? T.anhang : T.teil(teil)),
        h('span', { class: 'nur-sr' }, ' · '),
        h('span', { class: 'buch-teil-name' }, teil === 'anhang' ? T.glossar : T.teilName[teil])),
      teil !== 'anhang' && o.bedienbar ? balken(String(teil), true) : null),
    h('ol', { class: 'buch-zeilen' }, liste.map((t) => h('li', null,
      verweis(o, `#theorie/${t.thema}`, { class: 'buch-zeile', 'data-pruef': `thema-${t.thema}` },
        h('span', { class: 'buch-nr' }, String(t.nr)),
        h('span', { class: 'buch-symbol' }, themaSymbol(t)),
        h('span', { class: 'buch-text' }, h('span', { class: 'buch-titel' }, mitTrennstellen(t.kurztitel)), h('span', { class: 'buch-satz' }, t.kurzsatz)),
        o.bedienbar ? h('span', { class: 'buch-marke' }, haken(t)) : null)))));
}

function uebersicht(o: TheorieOptionen, unbekannt: boolean): HTMLElement {
  const speicher = speicherVon(o);
  const inhaltEl = h(o.bedienbar ? 'div' : 'article', { class: 'lern-inhalt buch', 'data-pruef': 'theorie' },
    h('header', { class: 'kapitel-kopf thema-kopf buch-kopf' },
      kopfBand('alle', 'uebersicht',
        h('p', { class: 'kapitel-kicker' }, T.bereich),
        h('h1', { class: 'kapitel-titel', tabindex: -1 }, T.titel)),
      h('p', { class: 'kapitel-einstieg' }, unbekannt ? T.unbekannt : T.einleitung)),
    o.bedienbar ? h('section', { class: 'buch-fortschritt', 'aria-label': T.fortschritt, 'data-pruef': 'fortschritt' },
      h('span', { class: 't-label' }, T.fortschritt),
      balken('gesamt', false),
      h('button', { type: 'button', class: 'knopf knopf-still buch-zuruecksetzen', 'data-pruef': 'fortschritt-zuruecksetzen', onclick: () => {
        loescheFortschritt(speicher);
        markiere(inhaltEl, o.inhalte, ladeFortschritt(speicher));
      } }, sym('zurueckspulen'), T.zuruecksetzen)) : null,
    h('nav', { class: 'buch-verzeichnis', 'aria-label': T.inhaltsverzeichnis, 'data-pruef': 'themen-liste' },
      nachTeilen(o.inhalte).map(({ teil, themen: liste }) => buchTeil(o, teil, liste))),
    kontaktZeile(o));
  if (o.bedienbar) markiere(inhaltEl, o.inhalte, ladeFortschritt(speicher));
  return rahmen(o, [h('div', { class: 'lern-rahmen ist-einspaltig' }, inhaltEl)]);
}

/* ---------------------------------------------------------------- Thema -- */

/** Kartengruppe: Titel und Einleitung des Containers (wenn vorhanden) über den Karten. */
function karten(b: Block): HTMLElement {
  const titel = kopfText(b.kopf, 'titel');
  const text = b.felder['text'] ?? '';
  const raster = kartenRaster(b);
  if (titel === null && text === '') return raster;
  return h('div', { class: 'lernkarten-gruppe', 'data-pruef': 'kartengruppe' },
    titel !== null ? h('h3', { class: 'lernkarten-titel' }, mitTrennstellen(titel)) : null,
    text !== '' ? h('div', { class: 'lernkarten-einleitung lesetext' }, inhalt(text)) : null,
    raster);
}

function kartenRaster(b: Block): HTMLElement {
  return h('div', { class: 'lernkarten' }, b.kinder.filter((k) => k.art === 'karte').map((k) => {
    const titel = kopfText(k.kopf, 'titel');
    const nr = k.id !== null && /^\d+$/.test(k.id) ? k.id : null;
    const kopf = titel !== null ? h('span', { class: 'lernkarte-titel' }, symbolAusInhalt(kopfText(k.kopf, 'symbol')), nr !== null ? h('span', { class: 'lernkarte-zahl' }, nr) : null, mitTrennstellen(titel)) : null;
    const vorne = h('div', { class: 'lernkarte-text' }, inhalt(k.felder['text'] ?? ''));
    const rueck = k.felder['rueckseite'] ?? '';
    if (rueck === '') return h('div', { class: 'lernkarte', 'data-pruef': 'lernkarte' }, kopf, vorne);
    return wendekarte(kopf, vorne, h('div', { class: 'lernkarte-text' }, inhalt(rueck)), titel ?? '');
  }));
}

/**
 * Karte mit Rückseite (P17.9, O-55): ein Knopf dreht sie um (aria-pressed, Ansage der sichtbaren Seite); die Drehung ist
 * nur ohne prefers-reduced-motion zu sehen (CSS). Auf Leinwand und im Druck stehen beide Seiten untereinander.
 */
function wendekarte(kopf: HTMLElement | null, vorne: HTMLElement, hinten: HTMLElement, titel: string): HTMLElement {
  if (!lwBedienbar) {
    // aufgelöst (Leinwand, Druck; R73): eine Karte – Titel, Vorderseite, Rückseite; keine Bedienmarke, bei leerer
    // Vorderseite auch keine Trennlinie
    const leer = (vorne.textContent ?? '').trim() === '';
    return h('div', { class: 'lernkarte ist-wendekarte ist-aufgeloest', 'data-pruef': 'lernkarte' },
      h('div', { class: 'lernkarte-flaeche ist-vorne', 'data-pruef': 'karte-vorne' }, kopf, leer ? null : vorne),
      h('div', { class: leer ? 'lernkarte-flaeche ist-hinten ist-direkt' : 'lernkarte-flaeche ist-hinten', 'data-pruef': 'karte-hinten' }, hinten));
  }
  // Rückseite trägt den Titel der Vorderseite als Kicker (R73), damit klar bleibt, worauf sie antwortet; R75: mit „Rückseite“
  // dahinter, damit der Wechsel sichtbar ist (vorher stand „Typische Fehlstelle“ unverändert über der Antwort)
  const marke = h('span', { class: 't-label lernkarte-seite' }, titel !== '' ? `${titel} · ${T.karteRueckseite}` : T.karteRueckseite);
  const vorderseite = h('div', { class: 'lernkarte-flaeche ist-vorne', 'data-pruef': 'karte-vorne' }, kopf, vorne);
  const rueckseite = h('div', { class: 'lernkarte-flaeche ist-hinten', 'data-pruef': 'karte-hinten' }, marke, hinten);
  const ansage = h('span', { class: 'nur-sr', 'aria-live': 'polite' });
  const karte = h('div', { class: 'lernkarte ist-wendekarte', 'data-pruef': 'lernkarte', 'data-seite': 'vorne' });
  const knopf = h('button', { type: 'button', class: 'knopf knopf-still lernkarte-wenden', 'aria-pressed': 'false', 'data-pruef': 'karte-wenden', onclick: () => {
    const hinten = karte.dataset['seite'] !== 'hinten';
    karte.dataset['seite'] = hinten ? 'hinten' : 'vorne';
    knopf.setAttribute('aria-pressed', String(hinten));
    vorderseite.inert = hinten;
    rueckseite.inert = !hinten;
    ansage.textContent = T.karteZeigt(hinten ? T.karteRueckseite : T.karteVorderseite, titel);
  } }, sym('wechsel'), T.karteUmdrehen, titel !== '' ? h('span', { class: 'nur-sr' }, ` – ${titel}`) : null);
  rueckseite.inert = true;
  karte.append(h('div', { class: 'lernkarte-innen' }, vorderseite, rueckseite), h('div', { class: 'lernkarte-fuss' }, knopf), ansage);
  return karte;
}

/**
 * Feste Verschiebung der Antworten je Wissenscheck (0 … n−1). Mit `stelle` (Kopf, 1 … n; R73) rückt die erste, richtige
 * Antwort genau an diese Stelle – die Inhalte verteilen sie so über alle Fragen. Ohne `stelle` deterministisch aus der Kennung.
 */
export function wcVerschiebung(id: string, n: number, stelle: number | null = null): number {
  if (n < 2) return 0;
  if (stelle !== null && Number.isInteger(stelle) && stelle >= 1 && stelle <= n) return (n - (stelle - 1)) % n;
  let s = 0;
  for (const z of id) s = (s * 31 + (z.codePointAt(0) ?? 0)) % 9973;
  return s % n;
}

/** Wissenscheck (P11.6): eine Frage, zwei bis drei Antworten; die Wahl zeigt Rückmeldung, Erklärung und Kernsatz. */
function wissenscheck(b: Block): HTMLElement {
  const beantwortet = beiAntwort;
  const antworten = b.kinder.filter((k) => k.art === 'antwort');
  const ergebnis = h('div', { class: 'wc-ergebnis', 'aria-live': 'polite', 'data-pruef': 'wc-ergebnis' });
  const knoepfe = antworten.map((a) => h('button', {
    type: 'button', class: 'knopf knopf-still wc-antwort', 'aria-pressed': 'false', 'data-pruef': `wc-antwort-${a.id ?? ''}`,
    onclick: () => {
      for (const k of knoepfe) k.setAttribute('aria-pressed', k === knopf(a) ? 'true' : 'false');
      if (beantwortet !== null && b.id !== null) beantwortet(b.id);
      const praefix = kopfText(a.kopf, 'praefix');
      ersetze(ergebnis,
        h('div', { class: 'wc-rueckmeldung' }, praefix !== null ? h('b', null, `${praefix} `) : null, inhalt(a.felder['text'] ?? '')),
        h('div', { class: 'wc-erklaerung' }, inhalt(b.felder['erklaerung'] ?? '')));
    },
  }, kopfText(a.kopf, 'titel') ?? a.id ?? ''));
  const knopf = (a: Block): HTMLElement | undefined => knoepfe[antworten.indexOf(a)];
  const v = wcVerschiebung(b.id ?? '', knoepfe.length, kopfZahl(b.kopf, 'stelle'));
  const reihe = [...knoepfe.slice(v), ...knoepfe.slice(0, v)];
  return h('section', { class: 'wissenscheck', 'data-pruef': 'wissenscheck', 'aria-label': W.theorie.wissenscheck },
    h('span', { class: 't-label' }, W.theorie.wissenscheck),
    h('div', { class: 'wc-frage' }, inhalt(b.felder['frage'] ?? '')),
    h('div', { class: 'wc-antworten reihe', role: 'group', 'aria-label': W.theorie.wissenscheckAntworten }, reihe),
    ergebnis);
}

/** Symbol aus den Kopfdaten eines Bausteins, wenn es das Symbol gibt. */
function kopfSymbol(b: Block): SymbolName | null {
  const s = kopfText(b.kopf, 'symbol');
  return s !== null && s in SYMBOLE ? s as SymbolName : null;
}

/**
 * Aufklapper (P17.9, O-55): Titel mit Symbol in der Farbe des Teils, Inhalt aufgeklappt darunter. Auf der Leinwand und im
 * Druck offen (dort klappt niemand auf).
 */
function aufklapper(b: Block): HTMLElement {
  const titel = kopfText(b.kopf, 'titel') ?? '';
  return h('details', { class: 'aufklapper', 'data-pruef': 'aufklapper', open: !lwBedienbar },
    h('summary', { class: 'aufklapper-kopf' },
      h('span', { class: 'aufklapper-symbol' }, sym(kopfSymbol(b) ?? abschnittSymbol(titel, symbolAktuell))),
      h('span', { class: 'aufklapper-titel' }, mitTrennstellen(titel)),
      h('span', { class: 'aufklapper-zeichen', 'aria-hidden': 'true' }, sym('pfeilUnten'))),
    h('div', { class: 'aufklapper-inhalt lesetext' }, inhalt(b.felder['text'] ?? '')));
}

/** Ebenen 1–4 (P6.1): aufklappbar, Ebene 1 offen. */
function ebenenBlock(ebenen: readonly Ebene[], inhalte: OeffentlicheInhalte, stufe: TitelStufe): HTMLElement {
  return h('div', { class: 'lern-ebenen', 'data-pruef': 'lern-ebenen' }, ebenen.map((e) => h('details', { class: 'lern-ebene', 'data-ebene': e.nr, 'data-pruef': `lern-ebene-${e.nr}`, open: e.nr === 1 },
    h('summary', null, h('span', { class: 'lern-ebene-nr' }, String(e.nr)), h('span', null, h('small', null, `${W.ebene} ${e.nr}`), e.titel)),
    e.felder['text'] ? h('div', { class: 'lesetext' }, inhalt(e.felder['text'])) : null,
    bloeckeIn(e.bloecke, inhalte, stufe))));
}

/** Lernwerkzeuge bedienbar (Hauptfenster) oder aufgelöst (Leinwand, Druck); gesetzt beim Bau eines Themas. */
let lwBedienbar = true;
/** Symbol des Themas, das gerade gebaut wird (Ersatz für Aufklapper ohne passendes Stichwort). */
let symbolAktuell: SymbolName = 'buch';
/** Rückmeldung einer beantworteten Verständnisfrage an den Fortschritt (nur beim Bau eines bedienbaren Themas). */
let beiAntwort: ((frage: string) => void) | null = null;

/** Blöcke eines Themas; `stufe` = Überschriftenstufe für Tafeltitel. */
function bloeckeIn(bloecke: readonly Block[], inhalte: OeffentlicheInhalte, stufe: TitelStufe = 'h3'): Node[] {
  const aus: Node[] = [];
  for (const b of bloecke) {
    switch (b.art) {
      case 'zitat': // L-290 (O-38): wortgleiche Zitate sind interne Belege und stehen nie sichtbar auf der Seite
      case 'original':
      case 'querverweis':
        break;
      case 'karten':
        aus.push(karten(b));
        break;
      case 'etappen':
        aus.push(etappen(b, stufe, lwBedienbar));
        break;
      case 'umschalter':
        aus.push(umschalter(b, stufe, lwBedienbar));
        break;
      case 'sortieren':
        aus.push(sortieren(b, stufe, lwBedienbar));
        break;
      case 'regler':
        aus.push(regler(b, stufe, lwBedienbar));
        break;
      case 'tafel': {
        const t = tafelBlock(b, stufe);
        if (t !== null) aus.push(t);
        break;
      }
      case 'merksatz':
        aus.push(merksatz(b));
        break;
      case 'wissenscheck':
        aus.push(wissenscheck(b));
        break;
      case 'hinweis':
        aus.push(hinweis(b));
        break;
      case 'aufklapper':
        aus.push(aufklapper(b));
        break;
      case 'abbildung': {
        const a = inhalte.abbildungen.find((x) => x.id === b.id);
        const f = a !== undefined ? abbildung(a) : null;
        if (f !== null) aus.push(f);
        break;
      }
      case 'ebenen':
        if (b.ebenen !== undefined && b.ebenen.length > 0) aus.push(ebenenBlock(b.ebenen, inhalte, 'h3'));
        break;
      default:
        if (b.felder['text']) aus.push(h('div', { class: 'lesetext' }, inhalt(b.felder['text'])));
        aus.push(...bloeckeIn(b.kinder, inhalte, stufe));
    }
  }
  return aus;
}

/**
 * „In der Story erlebt“: Kapitel der Story, die auf dieses Thema verweisen. Die Marke „Fiktiver Fall“ steht nur,
 * wenn die Seite „fiktiv“ nicht schon im Text nennt (L-227: einmal je Seite, eine natürliche Nennung zählt; r72).
 */
function inDerStory(o: TheorieOptionen, thema: string, mitMarke: boolean): HTMLElement | null {
  // Schnittstelle der neuen Story (P17.4): Liste `kapitel`, je Eintrag `id`, `nr`, `titel`, `thema`, `zeit`
  const st = (o.inhalte.geschichte?.kapitel ?? []).filter((s) => s.thema === thema);
  if (st.length === 0) return null;
  return h('section', { class: 'querverweis-block', 'aria-label': T.inDerStory },
    h('span', { class: 't-label' }, T.inDerStory, mitMarke ? h('span', { class: 'querverweis-fiktiv' }, ` · ${W.fiktiv}`) : null),
    h('div', { class: 'querverweise' }, st.map((s) => verweis(o, `#story/${s.id}`, { class: 'querverweis', 'data-pruef': `querverweis-${s.id}` },
      h('span', { class: 'querverweis-symbol' }, sym('pfeilRechts')),
      h('span', { class: 'querverweis-text' }, T.nummer(s.nr, s.titel), h('small', null, s.zeit))))));
}

/**
 * „Zum Ausprobieren“ (E-13, P18.5): die Werkzeuge in Explore, die zum Thema passen. Nur auf der Seite, nie auf Leinwand und
 * Druck (dort wäre der Verweis ein Bedienelement ohne Wirkung); öffnet mit dem Beispiel, falls das Thema eines nennt.
 */
function ausprobieren(o: TheorieOptionen, seite: TheorieSeite): HTMLElement | null {
  const w = o.inhalte.werkzeuge;
  if (!o.bedienbar || w === null || seite.werkzeuge.length === 0) return null;
  return h('section', { class: 'querverweis-block', 'aria-label': T.ausprobieren, 'data-pruef': 'thema-werkzeuge' },
    h('span', { class: 't-label' }, T.ausprobieren),
    h('div', { class: 'querverweise' }, seite.werkzeuge.map((v) => verweis(o, `#explore/${v.id}${v.beispiel !== null ? `/${v.beispiel}` : ''}`, { class: 'querverweis', 'data-pruef': `werkzeug-${v.id}` },
      h('span', { class: 'querverweis-symbol' }, sym('pfeilRechts')),
      h('span', { class: 'querverweis-text' }, werkzeugTitel(w, werkzeugAus(v.id)), h('small', null, w[TEIL[werkzeugAus(v.id)]].kurz))))));
}

/** Glossar: alle Begriffe alphabetisch, mit Suchfeld, „Mehr dazu in“ und Begriffs-Kompass. */
export function glossarListe(o: { inhalte: OeffentlicheInhalte; bedienbar: boolean }): HTMLElement {
  const eintraege = Object.values(o.inhalte.glossar).sort((a, b) => a.begriff.localeCompare(b.begriff, 'de'));
  const gesamt = eintraege.length;
  const nachKapitel = new Map(Object.values(o.inhalte.theorie).map((t) => [t.kapitel, t]));
  const zahl = h('p', { class: 'glossar-zahl', role: 'status', 'aria-live': 'polite', 'data-pruef': 'glossar-zahl' }, T.glossarZahl(gesamt, gesamt));
  const leer = h('p', { class: 'glossar-leer', hidden: true }, T.glossarLeer);
  const link = (href: string, attrs: Record<string, string>, text: string): HTMLElement => o.bedienbar ? h('a', { ...attrs, href }, text) : h('span', attrs, text);
  const zeilen = eintraege.map((g) => {
    // eigenständige Werkzeugseite (L-431): dort gibt es keine Themen, also auch kein „Mehr dazu in“
    const orte = (istEigenstaendig() ? [] : g.vorkommen.kapitel).map((k) => nachKapitel.get(k)).filter((t) => t !== undefined && t.thema !== 'glossar')
      .map((t) => link(`#theorie/${t?.thema ?? ''}`, { class: 'glossar-ort' }, t?.kurztitel ?? ''));
    return h('div', { class: 'glossar-eintrag', id: g.id, 'data-pruef': 'glossar-eintrag', 'data-suche': `${g.begriff} ${g.definition}`.toLocaleLowerCase('de') },
      h('dt', null, g.begriff),
      h('dd', null, (() => { const p = h('p', null, g.definition); umbruchNachSchraegstrich(p); schuetzeEinheitenIn(p); return p; })(),
        orte.length > 0 ? h('p', { class: 'glossar-orte' }, h('span', { class: 't-label' }, T.kommtVor), ...orte) : null));
  });
  const feld = h('input', { type: 'search', class: 'glossar-feld', id: 'glossar-suche', 'data-pruef': 'glossar-suche', autocomplete: 'off', spellcheck: 'false' }) as HTMLInputElement;
  const kompassZeilen = o.inhalte.kompass.map((k) => h('tr', { 'data-pruef': 'kompass-eintrag', 'data-suche': `${k.begriff} ${k.andere.join(' ')}`.toLocaleLowerCase('de') },
    h('td', null, k.andere.join(' · ')),
    h('td', null, o.bedienbar && k.glossar !== null
      ? h('button', { type: 'button', class: 'kompass-begriff', 'data-glossar-ziel': k.glossar, onclick: () => {
        const ziel = document.getElementById(k.glossar ?? '');
        if (ziel === null) return;
        if (feld.value !== '') {
          feld.value = '';
          feld.dispatchEvent(new Event('input'));
        }
        ziel.tabIndex = -1;
        if (typeof ziel.scrollIntoView === 'function') ziel.scrollIntoView({ block: 'center' });
        ziel.focus({ preventScroll: true });
      } }, k.begriff)
      : h('b', null, k.begriff),
      k.hinweis !== null ? h('div', { class: 'kompass-hinweis' }, inhalt(k.hinweis)) : null)));
  const kompass = kompassZeilen.length === 0 ? null : h('section', { class: 'kompass', 'data-pruef': 'kompass', 'aria-labelledby': 'kompass-titel' },
    h('h2', { class: 'abschnitt-titel', id: 'kompass-titel' }, h('span', { class: 'abschnitt-symbol' }, sym('kompass')), h('span', { class: 'abschnitt-text' }, T.kompass)),
    h('p', { class: 'lesetext' }, T.kompassText),
    h('div', { class: 'absatz-block', tabindex: 0, role: 'region', 'aria-label': T.tabelle(T.kompass) },
      h('table', { class: 'register-tabelle kompass-tabelle' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, T.kompassAndere), h('th', { scope: 'col' }, T.kompassBegriff))),
        h('tbody', null, kompassZeilen))));
  feld.addEventListener('input', () => {
    const q = feld.value.trim().toLocaleLowerCase('de');
    let sichtbar = 0;
    for (const z of zeilen) {
      const treffer = q === '' || (z.getAttribute('data-suche') ?? '').includes(q);
      z.hidden = !treffer;
      if (treffer) sichtbar++;
    }
    for (const z of kompassZeilen) z.hidden = !(q === '' || (z.getAttribute('data-suche') ?? '').includes(q));
    zahl.textContent = T.glossarZahl(sichtbar, gesamt);
    leer.hidden = sichtbar > 0 || kompassZeilen.some((z) => !z.hidden);
  });
  return h('section', { class: 'glossar', 'aria-label': T.glossar, 'data-pruef': 'glossar' },
    o.bedienbar ? h('div', { class: 'glossar-suche' }, h('label', { for: 'glossar-suche', class: 't-label' }, T.glossarSuche), feld, zahl) : null,
    h('dl', { class: 'glossar-eintraege' }, zeilen), leer,
    kompass);
}

function themaNav(o: TheorieOptionen, seite: TheorieSeite): HTMLElement {
  const alle = themen(o.inhalte);
  const i = alle.indexOf(seite);
  const vor = alle[i - 1] ?? null;
  const nach = alle[i + 1] ?? null;
  return h('nav', { class: 'kapitel-nav', 'aria-label': T.blaettern },
    vor !== null ? verweis(o, `#theorie/${vor.thema}`, { rel: 'prev' }, h('span', { class: 't-label' }, T.zurueck), h('b', null, T.nummer(vor.nr, vor.titel))) : null,
    nach !== null ? verweis(o, `#theorie/${nach.thema}`, { rel: 'next' }, h('span', { class: 't-label' }, T.weiter), h('b', null, T.nummer(nach.nr, nach.titel))) : null);
}

function kontaktZeile(o: TheorieOptionen): HTMLElement {
  return h('p', { class: 'lern-kontakt', 'data-pruef': 'lern-kontakt' }, `${T.kontakt} `, o.bedienbar ? bmLink() : W.rahmen.kontaktBm);
}

/**
 * Titel eines Themas mit Nummer. R75: Nummer und erstes Wort bleiben auf einer Zeile („10 ·“ stand bei 1280 px allein
 * über „Anwendungssituationen“); die Einheit zählt darum für `--zeichen` (R47) mit.
 */
function themaKopfTitel(nr: number, titel: string): HTMLElement {
  const [erstes = '', ...rest] = titel.split(' ');
  const anfang = `${nr} · ${erstes}`;
  return h('h1', { class: 'kapitel-titel', tabindex: -1, style: `--zeichen:${Math.max(laengstesWort(titel), [...anfang].length)}` },
    h('span', { class: 'thema-anfang' }, h('span', { class: 'thema-nr', 'data-pruef': 'thema-nr' }, `${nr} · `), erstes),
    rest.length > 0 ? ` ${rest.join(' ')}` : null);
}

/** Inhalt eines Themas (Kopf bis „In der Story“), ohne Rahmen – für Seite, Leinwand und Druck. */
function themaInhalt(o: TheorieOptionen, seite: TheorieSeite): Node[] {
  lwBedienbar = o.bedienbar;
  const titel = seite.titel;
  const teile: Node[] = [h('header', { class: 'kapitel-kopf thema-kopf', 'data-teil': String(seite.teil) },
    kopfBand(String(seite.teil), seite.thema,
      h('p', { class: 'kapitel-kicker thema-kicker', 'data-pruef': 'thema-teil' }, teilText(seite.teil)),
      themaKopfTitel(seite.nr, titel)),
    seite.einleitung !== '' ? h('div', { class: 'kapitel-einstieg' }, inhalt(seite.einleitung)) : null)];
  const eigenes = symbolName(seite);
  symbolAktuell = eigenes;
  for (const b of seite.bloecke) {
    if (b.art === 'kernaussage') {
      teile.push(h('section', { class: 'kernaussage', 'data-pruef': 'kernaussage' },
        h('span', { class: 'kernaussage-symbol' }, sym(kopfSymbol(b) ?? eigenes)),
        h('div', { class: 'kernaussage-text' }, h('span', { class: 't-label' }, T.kernaussage), inhalt(b.felder['text'] ?? ''))));
    } else if (b.art === 'abschnitt') {
      const t = kopfText(b.kopf, 'titel') ?? '';
      teile.push(h('section', { class: 'lern-abschnitt' },
        t !== '' ? h('h2', { class: 'abschnitt-titel' }, h('span', { class: 'abschnitt-symbol' }, sym(abschnittSymbol(t, eigenes))), h('span', { class: 'abschnitt-text' }, mitTrennstellen(t))) : null,
        b.felder['text'] ? h('div', { class: 'lesetext' }, inhalt(b.felder['text'])) : null,
        bloeckeIn(b.kinder, o.inhalte)));
    } else if (b.art === 'glossar') {
      teile.push(glossarListe(o));
    } else if (b.art !== 'querverweis' && b.art !== 'original') {
      teile.push(...bloeckeIn([b], o.inhalte, 'h2'));
    }
  }
  const qv = inDerStory(o, seite.thema, !teile.some((t) => /fiktiv/iu.test(t.textContent ?? '')));
  if (qv !== null) teile.push(qv);
  const probieren = ausprobieren(o, seite);
  if (probieren !== null) teile.push(probieren);
  return teile;
}

/** r72: Druckkopf eines Themas mit Teil und Nummer als kleiner Zeile über dem Titel („Teil IV · 14“, „Anhang · 16“). */
function druckKopf(o: TheorieOptionen, seite: TheorieSeite): HTMLElement {
  const teil = seite.teil === 'anhang' ? T.anhang : T.teil(seite.teil);
  return bogenKopf(seite.titel, o.version, false, { text: `${teil} · ${seite.nr}`, teil: String(seite.teil) });
}

function themaSeiteBauen(o: TheorieOptionen, seite: TheorieSeite): HTMLElement {
  const drucken = o.bedienbar
    ? h('button', { type: 'button', class: 'knopf knopf-still druck-knopf', 'data-pruef': 'thema-drucken', onclick: () => {
      druckeBogen(seite.titel, [druckKopf(o, seite), themaFuerDruck(o.inhalte, seite.thema, o.version)]);
    } }, sym('dokument'), T.drucken)
    : null;
  if (drucken !== null) bogenFuerStrgP(drucken, () => ({ titel: seite.titel, teile: [druckKopf(o, seite), themaFuerDruck(o.inhalte, seite.thema, o.version)] }));
  // Fortschritt (P17.8): jede Antwort wird vermerkt; ohne Verständnisfragen zählt das erreichte Seitenende
  const speicher = speicherVon(o);
  let wurzel: HTMLElement | null = null;
  const vermerke = (neu: (f: Fortschritt) => Fortschritt): void => {
    const f = neu(ladeFortschritt(speicher));
    speichereFortschritt(speicher, f);
    if (wurzel !== null) markiere(wurzel, o.inhalte, f);
  };
  beiAntwort = o.bedienbar && zaehlt(seite) ? (frage) => vermerke((f) => mitAntwort(f, seite.thema, frage)) : null;
  let teile: Node[];
  try {
    teile = themaInhalt(o, seite);
  } finally {
    beiAntwort = null;
  }
  teile.splice(1, 0, h('p', { class: 'kapitel-vermerk' }, drucken));
  const kontakt = kontaktZeile(o);
  teile.push(themaNav(o, seite), kontakt);
  wurzel = rahmen(o, [h('div', { class: 'lern-rahmen' },
    verzeichnis(o, seite.thema),
    h(o.bedienbar ? 'div' : 'article', { class: 'lern-inhalt', 'data-pruef': 'lernseite', 'data-thema': seite.thema, 'data-teil': String(seite.teil) }, teile))]);
  if (o.bedienbar) {
    markiere(wurzel, o.inhalte, ladeFortschritt(speicher));
    if (zaehlt(seite) && verstaendnisfragen(seite).length === 0) beobachteSeitenende(kontakt, () => vermerke((f) => mitGelesen(f, seite)));
  }
  return wurzel;
}

/** Ruft `fertig` einmal, sobald `ende` sichtbar wird (ohne IntersectionObserver: nie). */
function beobachteSeitenende(ende: HTMLElement, fertig: () => void): void {
  if (typeof IntersectionObserver !== 'function') return;
  const b = new IntersectionObserver((eintraege) => {
    if (!eintraege.some((e) => e.isIntersecting)) return;
    b.disconnect();
    fertig();
  });
  b.observe(ende);
}

/** Thema für den Druckbogen: dieselbe Zeichnung wie die Leinwand, ohne Rahmen. */
export function themaFuerDruck(inhalte: OeffentlicheInhalte, thema: string, version: string): HTMLElement {
  const seite = themaSeite(inhalte, thema);
  const o: TheorieOptionen = { inhalte, thema, version, bedienbar: false };
  tafelnAufgeloest(true);
  try {
    const el = h('div', { class: 'lern-inhalt druck-kapitel', 'data-teil': seite !== null ? String(seite.teil) : null }, seite !== null ? themaInhalt(o, seite) : null);
    loeseFuerDruckAuf(el);
    return el;
  } finally {
    tafelnAufgeloest(false);
  }
}

/** Druck: Wissenscheck und Schwellen-Spiel aufgelöst, Eingaben entfallen, Knöpfe werden Text. */
function loeseFuerDruckAuf(seite: HTMLElement): void {
  for (const f of seite.querySelectorAll<HTMLElement>('figure.abbildung')) {
    const marke = f.querySelector('.abbildung-unterschrift > .abbildung-marke');
    const titel = f.querySelector('.abbildung-unterschrift > .abbildung-titel');
    const rahmenEl = f.querySelector('.abbildung-rahmen');
    if (marke !== null && titel !== null && rahmenEl !== null) rahmenEl.prepend(h('p', { class: 'abbildung-druckkopf' }, marke, titel));
  }
  for (const d of seite.querySelectorAll<HTMLDetailsElement>('details')) d.open = true;
  for (const wc of seite.querySelectorAll<HTMLElement>('.wissenscheck')) {
    const ergebnis = wc.querySelector('.wc-ergebnis');
    const knoepfe = [...wc.querySelectorAll<HTMLButtonElement>('.wc-antwort')];
    if (ergebnis === null || knoepfe.length === 0) continue;
    const liste = h('ul', { class: 'wc-druck-antworten' });
    for (const k of knoepfe) {
      k.click();
      const r = ergebnis.querySelector('.wc-rueckmeldung');
      liste.append(h('li', null, h('b', null, k.textContent ?? ''), ' → ', ...(r !== null ? [...r.childNodes] : [])));
    }
    ergebnis.querySelector('.wc-rueckmeldung')?.remove();
    ergebnis.prepend(liste);
    ergebnis.removeAttribute('aria-live');
    wc.querySelector('.wc-antworten')?.remove();
  }
  for (const s of seite.querySelectorAll<HTMLElement>('.tafel-schwelle')) {
    s.querySelector<HTMLButtonElement>('[data-pruef="schwelle-aufloesen"]')?.click();
    for (const karte of s.querySelectorAll<HTMLElement>('.schwelle-karte')) {
      const gewaehlt = karte.querySelector('.schwelle-knopf[aria-pressed="true"]')?.textContent ?? '';
      karte.querySelector('.schwelle-knoepfe')?.replaceWith(h('p', { class: 'schwelle-druck-seite' }, h('b', null, `→ ${gewaehlt}`)));
      karte.querySelector('.schwelle-rueck')?.remove();
    }
    for (const weg of s.querySelectorAll('.tafel-hinweis, .schwelle-stand, [data-pruef="schwelle-aufloesen"]')) weg.remove();
  }
  for (const e of seite.querySelectorAll('input, select, textarea')) e.remove();
  for (const k of seite.querySelectorAll<HTMLButtonElement>('button:not(.begriff)')) {
    const text = h('span', null, ...k.childNodes);
    for (const a of k.getAttributeNames()) if (!['type', 'disabled', 'role', 'tabindex'].includes(a) && !a.startsWith('aria-')) text.setAttribute(a, k.getAttribute(a) ?? '');
    if (k.getAttribute('aria-pressed') === 'true') text.setAttribute('data-gewaehlt', '');
    k.replaceWith(text);
  }
}

/** Themenverzeichnis (klebend, rollt in sich): den aktuellen Eintrag sichtbar machen, ohne die Seite zu rollen */
export function zeigeAktuellenEintrag(seite: HTMLElement): void {
  requestAnimationFrame(() => {
    const v = seite.querySelector<HTMLElement>('.kapitel-verzeichnis');
    const a = v?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!v || !a || v.scrollHeight <= v.clientHeight + 1) return;
    const vr = v.getBoundingClientRect();
    const massstab = v.offsetHeight > 0 ? vr.height / v.offsetHeight : 1;
    const oben = (a.getBoundingClientRect().top - vr.top) / (massstab || 1) + v.scrollTop;
    v.scrollTop = Math.max(0, oben - v.clientHeight / 2);
  });
}

export function baueTheorie(o: TheorieOptionen): HTMLElement {
  if (o.thema === null) return uebersicht(o, false);
  const seite = themaSeite(o.inhalte, o.thema);
  if (seite === null) return uebersicht(o, true);
  tafelnAufgeloest(!o.bedienbar);
  try {
    return themaSeiteBauen(o, seite);
  } finally {
    tafelnAufgeloest(false);
  }
}
