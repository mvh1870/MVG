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
    h('p', { class: 'druck-meta' }, `${version} · ${W.druck.stand(datum)}`),
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
let strgP: { anker: HTMLElement; bauer: () => { titel: string; teile: Node[] } } | null = null;
let strgPBereit = false;
export function bogenFuerStrgP(anker: HTMLElement, bauer: () => { titel: string; teile: Node[] }): void {
  strgP = { anker, bauer };
  if (strgPBereit) return;
  strgPBereit = true;
  window.addEventListener('beforeprint', () => {
    // der Knopf druckt schon einen Bogen (window.print() löst beforeprint synchron aus – R40: nie abräumen), oder die Seite hat keinen
    if (laufend !== null || strgP === null || !strgP.anker.isConnected) return;
    const { titel, teile } = strgP.bauer();
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

/** Baut den Bogen (Details offen, IDs eindeutig) und hängt ihn unsichtbar an `body`. */
function haengeBogenAn(teile: Node[]): HTMLElement {
  for (const alt of document.querySelectorAll('.druck-bogen')) alt.remove();
  const bogen = h('div', { class: 'druck-bogen', 'data-pruef': 'druck-bogen' }, teile);
  for (const d of bogen.querySelectorAll('details')) d.setAttribute('open', '');
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
