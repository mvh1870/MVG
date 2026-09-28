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

/**
 * Hängt den Bogen an und öffnet den Druckdialog; danach (afterprint) verschwindet er wieder. Ohne
 * Druckdialog (Test, eingebettet) bleibt keine Druckklasse stehen; der Bogen bleibt unsichtbar bis zum
 * nächsten Druck. Gibt den Bogen zurück.
 */
export function druckeBogen(titel: string, teile: Node[]): HTMLElement {
  for (const alt of document.querySelectorAll('.druck-bogen')) alt.remove();
  const bogen = h('div', { class: 'druck-bogen', 'data-pruef': 'druck-bogen' }, teile);
  for (const d of bogen.querySelectorAll('details')) d.setAttribute('open', '');
  document.body.append(bogen);
  if (typeof window.print !== 'function') return bogen;
  const alterTitel = document.title;
  document.title = titel;
  document.body.classList.add('druckt-bogen');
  const ende = (): void => {
    document.body.classList.remove('druckt-bogen');
    document.title = alterTitel;
    bogen.remove();
    window.removeEventListener('afterprint', ende);
  };
  window.addEventListener('afterprint', ende);
  window.print();
  return bogen;
}
