/*
 * Druckansicht (P10.2, E11): ein eigener Druckbogen statt der Bildschirmseite. Der Bogen wird an
 * `body` gehängt; im Druck ist nur er sichtbar (theorie.css, `body.druckt-bogen`). Auf dem Bildschirm
 * bleibt er unsichtbar. Details (Ebenen, Tabellen) sind im Bogen aufgeklappt.
 */

import { h } from './h.ts';
import { W } from './woerter.ts';

/** Kopf jedes Bogens: Titel, Absender, Fassung, Druckdatum und die Vermerke. */
export function bogenKopf(titel: string, version: string, mitFiktiv: boolean): HTMLElement {
  const datum = new Date().toLocaleDateString('de-DE', { dateStyle: 'long' });
  return h('header', { class: 'druck-kopf' },
    h('p', { class: 'druck-absender' }, W.produkt),
    h('h1', null, titel),
    h('p', { class: 'druck-meta' }, `${version} · ${W.druck.stand(datum)} · ${W.adresse} · ${W.herausgeber}`),
    h('p', { class: 'druck-meta' }, [mitFiktiv ? `${W.fiktiv} · ` : '', W.ungeprueft].join('')));
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
/** R48: `gilt` ersetzt die Ankerregel, wo der Bogen auch ohne sichtbaren Knopf gilt (Epilog: jeder Schritt der Station) */
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
    const { titel, teile } = quelle();
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

/**
 * Weiche Trennstellen (U+00AD) in langen Wörtern nach einer Fuge („Entscheidungs|grundlagen“, „Maßnahmen|verknüpfung“).
 * Sichtbar wird der Strich nur, wo die Zeile tatsächlich dort umbricht; der Wortlaut bleibt gleich (dazu ein
 * Umbruch ohne Breite nach „/“ zwischen Wörtern).
 */
export function mitTrennstellen(text: string): string {
  // „Risiko-/Änderungs-/Maßnahmen…“, „Rollen/Freigaben/…“: nach „/“ darf die Zeile umbrechen (sonst ein unteilbarer Block)
  return text.replace(/(?<=[\p{L}-])\/(?=\p{L})/gu, '/\u200b').replace(/\p{L}{12,}/gu, (wort) => wort.replace(/(?<=\p{L}(?:ungs|heits|keits|schafts|tions|täts|stands|ßnahmen|agement|umenten|triebs|utzen|ister|tritts|ketten|lagen|gabe|schutz|ohbau))(?!(?<=agement)s)(?!(?<=gabe)n[^aeiouäöü])(?=\p{Ll}{4})/gu, '\u00ad'));
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
 * R44: Seiten ohne Druckbogen (Hilfe) – beim Drucken bekommen die Elemente unter `selektor` Trennstellen,
 * danach steht wieder der Originaltext (Suche, Kopieren am Bildschirm unverändert).
 */
let druckTrennung: string[] | null = null;
export function trennstellenImDruck(selektor: string): void {
  if (druckTrennung !== null) { if (!druckTrennung.includes(selektor)) druckTrennung.push(selektor); return; }
  druckTrennung = [selektor];
  let zurueck: (() => void)[] = [];
  window.addEventListener('beforeprint', () => {
    for (const z of zurueck.reverse()) z();
    zurueck = [...document.querySelectorAll((druckTrennung ?? []).join(', '))].map(setzeTrennstellen);
  });
  // verschachtelte Elemente (li > p): in umgekehrter Reihenfolge zurück, sonst bliebe ein Zwischenstand stehen
  window.addEventListener('afterprint', () => { for (const z of zurueck.reverse()) z(); zurueck = []; });
}

/** Baut den Bogen (Details offen, IDs eindeutig) und hängt ihn unsichtbar an `body`. */
function haengeBogenAn(teile: Node[]): HTMLElement {
  for (const alt of document.querySelectorAll('.druck-bogen')) alt.remove();
  const bogen = h('div', { class: 'druck-bogen', 'data-pruef': 'druck-bogen' }, teile);
  for (const d of bogen.querySelectorAll('details')) d.setAttribute('open', '');
  // R43: Papier hat kein Trennwörterbuch – lange Wörter in Tabellenzellen und Tafeltiteln bekommen weiche Trennstellen an ihren Fugen
  // R45: ganze Tafeln – ihre Karten sind 196 px breit (CI 204: „Entscheidungsvorbereitung“ passte unter Chrome 153 nicht mehr)
  for (const el of bogen.querySelectorAll('th, td, .tafel')) setzeTrennstellen(el);
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
function druckeAngehaengt(titel: string, bogen: HTMLElement): void {
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
