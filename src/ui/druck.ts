/*
 * Druckansicht (P10.2, E11): ein eigener Druckbogen statt der Bildschirmseite. Der Bogen wird an
 * `body` gehängt; im Druck ist nur er sichtbar (theorie.css, `body.druckt-bogen`). Auf dem Bildschirm
 * bleibt er unsichtbar. Details (Ebenen, Tabellen) sind im Bogen aufgeklappt.
 */

import { h, mitTrennstellen } from './h.ts';
import { bildmarke } from './marke.ts';
import { W } from './woerter.ts';

// R49: die Trennstellen gelten auch am Bildschirm (Story-Karte, Radar) – die Funktion steht in h.ts
export { mitTrennstellen };

/**
 * Kopf jedes Bogens: Titel, Absender, Druckdatum und die Vermerke (die Fassung nur, wenn nicht leer). r72: `kicker` ist eine kleine Zeile über dem Titel
 * (Themendruck: „Teil IV · 14“, „Anhang · 16“), damit sich ein Blatt im Buch einordnen lässt; `teil` färbt sie wie am Bildschirm.
 */
export function bogenKopf(titel: string, version: string, mitFiktiv: boolean, kicker?: { text: string; teil: string }): HTMLElement {
  const datum = new Date().toLocaleDateString('de-DE', { dateStyle: 'long' });
  return h('header', { class: 'druck-kopf' },
    // R49: die Bildmarke auch im Druck (O-33), klein und neben dem Namen (O-34)
    h('p', { class: 'druck-absender' }, bildmarke('marke-logo'), h('span', null, W.produkt)),
    kicker !== undefined ? h('p', { class: 'druck-kicker', 'data-teil': kicker.teil, 'data-pruef': 'druck-kicker' }, kicker.text) : null,
    h('h1', null, titel),
    // r72: eine leere Fassungsangabe entfällt (O-56)
    h('p', { class: 'druck-meta' }, [version, W.druck.stand(datum), W.adresse, W.herausgeber].filter((t) => t !== '').join(' · ')),
    mitFiktiv ? h('p', { class: 'druck-meta' }, W.fiktiv) : null);
}

/** R49: Dokumenttitel im Druck (PDF-Metadaten, vorgeschlagener Dateiname) mit dem Namen des Programms (O-33) */
export function druckTitel(titel: string): string {
  return titel.includes(W.name) ? titel : `${titel} · ${W.name}`;
}

/** Der laufende Druck: bis der Dialog aufgeht (Bilder dekodieren), bleiben weitere Klicks ohne Wirkung. */
let laufend: { bogen: HTMLElement; gedruckt: boolean; ende: () => void } | null = null;

/**
 * Hängt den Bogen an und öffnet den Druckdialog; danach (afterprint) verschwindet er wieder. Ohne
 * Druckdialog (Test, eingebettet) bleibt keine Druckklasse stehen; der Bogen bleibt unsichtbar bis zum
 * nächsten Druck. Gibt den Bogen zurück.
 */
export function druckeBogen(titel: string, teile: Node[]): HTMLElement {
  // Doppelklick (P12.5 R12): ein zweiter Auftrag, solange der erste noch auf die Bilder wartet, wird
  // verworfen; blieb nach einem Druck `afterprint` aus, räumt der neue Auftrag den alten erst auf
  if (laufend !== null) {
    if (!laufend.gedruckt) return laufend.bogen;
    laufend.ende();
  }
  const bogen = haengeBogenAn(teile);
  if (typeof window.print !== 'function') return bogen;
  druckeAngehaengt(titel, bogen);
  return bogen;
}

/**
 * Strg+P (P12.5 R38): Wer auf einer Seite mit Druckbogen den Druckdialog des Browsers öffnet, bekommt
 * denselben Bogen wie über den Knopf. `anker` ist der Druckknopf der Seite: nur solange er im Dokument
 * steht, gilt `bauer`. Der Bogen wird bei `beforeprint` angehängt und bei `afterprint` abgebaut.
 */
let strgP: { gilt: () => boolean; bauer: () => { titel: string; teile: Node[] } } | null = null;
/** R47: Flächen ohne eigenen Bogen (Start, Story vor dem Epilog, Explore, Theorie-Übersicht) – ein kurzer Bogen mit den Druckwegen */
let ersatz: { aktiv: () => boolean; bauer: () => { titel: string; teile: Node[] } } | null = null;
let strgPBereit = false;
/** R48: `gilt` ersetzt die Ankerregel, wo der Bogen auch ohne sichtbaren Knopf gilt (Ende: jeder Schritt des Kapitels) */
export function bogenFuerStrgP(anker: HTMLElement, bauer: () => { titel: string; teile: Node[] }, gilt: () => boolean = () => anker.isConnected): void {
  strgP = { gilt, bauer };
  bereiteStrgP();
}

/**
 * R47: Strg+P auf einer Fläche ohne Druckbogen druckte die Bildschirmseite mit Knöpfen, Reglern und Bedienhinweisen.
 * Gilt `aktiv()` und steht kein Druckknopf eines Bogens im Dokument, kommt stattdessen der Bogen aus `bauer`.
 */
export function ersatzBogenFuerStrgP(aktiv: () => boolean, bauer: () => { titel: string; teile: Node[] }): void {
  ersatz = { aktiv, bauer };
  bereiteStrgP();
}

/** Ersatzbogen für Strg+P ohne eigenen Druckweg; auf der Leinwand nur der Theorie-Weg – ohne Story (r72); einen Regie-Weg nennt er nirgends mehr (R76, O-56) */
export function ersatzDruck(version: string, mitStory = true): { titel: string; teile: HTMLElement[] } {
  const wege = mitStory ? W.druck.ersatzWege : W.druck.ersatzWege.slice(0, 1);
  return {
    titel: W.druck.ersatzTitel,
    teile: [
      bogenKopf(W.druck.ersatzTitel, version, false),
      h('section', { class: 'druck-teil' }, h('p', null, W.druck.ersatzText), h('ul', null, wege.map((x) => h('li', null, x)))),
    ],
  };
}

/** Leinwand (R69: aus main.ts, damit prüfbar): jeder Strg+P bekommt den Ersatzbogen nur mit dem Theorie-Weg */
export function ersatzBogenFuerLeinwand(version: string): void {
  ersatzBogenFuerStrgP(() => true, () => ersatzDruck(version, false));
}

function bereiteStrgP(): void {
  if (strgPBereit) return;
  strgPBereit = true;
  window.addEventListener('beforeprint', () => {
    // der Knopf druckt schon einen Bogen (window.print() löst beforeprint synchron aus – R40: nie abräumen), oder die Seite hat keinen;
    // R48: ein Auftrag, dessen Bogen nicht mehr im Dokument steht (afterprint blieb aus), ist vorbei
    if (laufend !== null) {
      if (laufend.bogen.isConnected) return;
      laufend.ende();
    }
    const quelle = strgP !== null && strgP.gilt() ? strgP.bauer : ersatz !== null && ersatz.aktiv() ? ersatz.bauer : null;
    if (quelle === null) return;
    const { titel: bogenTitel, teile } = quelle();
    const titel = druckTitel(bogenTitel);
    const bogen = haengeBogenAn(teile);
    const alterTitel = document.title;
    document.title = titel;
    document.body.classList.add('druckt-bogen');
    const ende = (): void => {
      document.body.classList.remove('druckt-bogen');
      if (document.title === titel) document.title = alterTitel;
      bogen.remove();
      window.removeEventListener('afterprint', ende);
    };
    window.addEventListener('afterprint', ende);
  });
}


/** Setzt in den Textknoten unter `el` die Trennstellen; gibt zurück, wie der alte Text wiederherzustellen ist. */
function setzeTrennstellen(el: Element): () => void {
  const alt: [Node, string][] = [];
  const gang = el.ownerDocument.createTreeWalker(el, 4);
  for (let t = gang.nextNode(); t !== null; t = gang.nextNode()) {
    const vorher = t.textContent ?? '';
    const neu = mitTrennstellen(vorher);
    if (neu !== vorher) { alt.push([t, vorher]); t.textContent = neu; }
  }
  return () => { for (const [t, vorher] of alt) t.textContent = vorher; };
}

/**
 * r72: Wo der Bogen weiche Trennstellen behält – schmale Spalten: Tabellenzellen, Kartentafeln (R45) und Kartentitel.
 * Chromium schreibt jede U+00AD, an der die Zeile nicht bricht, als /ActualText in den PDF-Text: wer aus dem PDF kopiert oder
 * darin sucht, bekäme „Beschluss\u00adlage“. Fließtext auf voller Satzbreite braucht keine – ein langes Wort rückt dort in die
 * nächste Zeile. Das Theorie-Szenario prüft beides im echten PDF.
 */
export const TRENNSTELLEN_IM_DRUCK = 'th, td, .tafel, .lernkarte-titel, .lw-etappe-name';

/** r72: entfernt außerhalb von {@link TRENNSTELLEN_IM_DRUCK} die weichen Trennstellen aus dem Bogen (der Bogen ist eine Kopie). */
function nurInSchmalenSpalten(bogen: Element): void {
  const gang = bogen.ownerDocument.createTreeWalker(bogen, 4);
  for (let t = gang.nextNode(); t !== null; t = gang.nextNode()) {
    const text = t.nodeValue ?? '';
    if (text.includes('\u00ad') && t.parentElement?.closest(TRENNSTELLEN_IM_DRUCK) === null) t.nodeValue = text.replace(/\u00ad/gu, '');
  }
}

/** Baut den Bogen (Details offen, IDs eindeutig) und hängt ihn unsichtbar an `body`. */
function haengeBogenAn(teile: Node[]): HTMLElement {
  for (const alt of document.querySelectorAll('.druck-bogen')) alt.remove();
  const bogen = h('div', { class: 'druck-bogen', 'data-pruef': 'druck-bogen' }, teile);
  for (const d of bogen.querySelectorAll('details')) d.setAttribute('open', '');
  // R57: Glossarbegriffe sind auf Papier Text, keine Bedienelemente (role/tabindex aus inhalt.ts)
  for (const b of bogen.querySelectorAll('.begriff')) { b.removeAttribute('role'); b.removeAttribute('tabindex'); }
  // R43: Papier hat kein Trennwörterbuch – lange Wörter in Tabellenzellen und Tafeltiteln bekommen weiche Trennstellen an ihren Fugen
  // R45: ganze Tafeln – ihre Karten sind 196 px breit (CI 204: „Entscheidungsvorbereitung“ passte unter Chrome 153 nicht mehr)
  for (const el of bogen.querySelectorAll('th, td, .tafel')) setzeTrennstellen(el);
  nurInSchmalenSpalten(bogen);
  // keine doppelten IDs neben der Seite: umbenennen, Bezüge (aria-labelledby, for) mitziehen
  let n = 0;
  const neu = new Map<string, string>();
  for (const el of bogen.querySelectorAll('[id]')) {
    const alt = el.id;
    el.id = `druck-${++n}-${alt}`;
    neu.set(alt, el.id);
  }
  for (const el of bogen.querySelectorAll('[aria-labelledby], [aria-controls], [aria-describedby], label[for]')) {
    for (const a of ['aria-labelledby', 'aria-controls', 'aria-describedby', 'for']) {
      const w = el.getAttribute(a);
      if (w !== null) el.setAttribute(a, w.split(/\s+/u).map((x) => neu.get(x) ?? x).join(' '));
    }
  }
  document.body.append(bogen);
  return bogen;
}

/** Titel, Druckklasse, Auftrag und Druckdialog für einen angehängten Bogen. */
function druckeAngehaengt(bogenTitel: string, bogen: HTMLElement): void {
  const titel = druckTitel(bogenTitel);
  const alterTitel = document.title;
  document.title = titel;
  document.body.classList.add('druckt-bogen');
  const auftrag = {
    bogen,
    gedruckt: false,
    ende: (): void => {
      document.body.classList.remove('druckt-bogen');
      // nur zurückstellen, was der Druck gesetzt hat (hat die Seite den Titel inzwischen neu gesetzt, gilt ihrer)
      if (document.title === titel) document.title = alterTitel;
      bogen.remove();
      window.removeEventListener('afterprint', auftrag.ende);
      if (laufend === auftrag) laufend = null;
    },
  };
  laufend = auftrag;
  window.addEventListener('afterprint', auftrag.ende);
  const drucke = (): void => {
    auftrag.gedruckt = true;
    window.print();
  };
  // Abbildungen (P14) erst dekodieren lassen, sonst kann der Dialog leere Bildflächen drucken (P12.5 R11)
  const bilder = [...bogen.querySelectorAll('img')];
  if (bilder.length === 0) drucke();
  else void Promise.all(bilder.map((b) => (typeof b.decode === 'function' ? b.decode().catch(() => undefined) : undefined))).then(drucke);
}
