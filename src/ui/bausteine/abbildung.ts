/*
 * Abbildung im Fachtext (P14, O-32, L-77): auf der Lernseite beim passenden Abschnitt. Beschriftungen mit
 * verbotenen Begriffen sind im Bild schon durch die Begriffe der Lernseite ersetzt (werkzeuge/abbildungen.mjs).
 * Die Bildunterschrift trägt nur Marke und Titel (O-56); vergrößert wird mit der Browser-Lupe (O-55).
 *
 * Die Bilddaten (data:-URLs) kommen getrennt aus src/generiert/abbildungen.json: Nur src/main.ts lädt sie
 * und reicht sie mit `setzeAbbildungsBilder` herein – so bleiben Tests und Leinwand-Module klein.
 */

import { h } from '../h.ts';
import type { Abbildung } from '../../inhalte/typen.ts';
import { W } from '../woerter.ts';

let bilder: Readonly<Record<string, string>> = {};

export function setzeAbbildungsBilder(daten: Readonly<Record<string, string>>): void {
  bilder = daten;
}

export function abbildungsBild(id: string): string | null {
  return bilder[id] ?? null;
}

/** Figur mit Bild und Bildunterschrift; null, wenn die Abbildung keine Beschreibung hat. */
export function abbildung(a: Abbildung): HTMLElement | null {
  const bild = a.bild;
  if (bild === null) return null;
  const A = W.abbildung;
  const daten = abbildungsBild(a.id);
  const bildEl = daten !== null
    ? h('img', { class: 'abbildung-bild', src: daten, alt: bild.alt, width: bild.breite, height: bild.hoehe, decoding: 'async' })
    : h('div', { class: 'abbildung-fehlt', role: 'img', 'aria-label': bild.alt }, A.fehlt);

  return h('figure', { class: 'abbildung', 'data-pruef': 'abbildung', 'data-abbildung': a.id },
    h('div', { class: 'abbildung-rahmen' }, bildEl),
    h('figcaption', { class: 'abbildung-unterschrift' },
      h('span', { class: 't-label abbildung-marke' }, A.marke(a.nr)),
      h('span', { class: 'abbildung-titel' }, bild.titel)));
}
