/*
 * Wahlleiste: eine Gruppe von Umschaltknöpfen (aria-pressed), von denen einer gewählt ist. Statt die
 * ganze Bühne als Live-Region vorzulesen, meldet eine kurze Zeile für Screenreader, was gezeigt wird
 * (Explore: Vorher/Nachher-Welten, Grafik-Galerie).
 */

import { h, attr } from '../h.ts';

export interface Wahlleiste {
  /** Knopfgruppe */
  leiste: HTMLElement;
  /** kurze Statusmeldung (nur für Screenreader) */
  meldung: HTMLElement;
  waehle(i: number): void;
}

export function wahlleiste(o: {
  beschriftungen: readonly string[];
  pruef: (i: number) => string;
  gruppe: string;
  meldung: (beschriftung: string) => string;
  bei: (i: number) => void;
}): Wahlleiste {
  const meldung = h('p', { class: 'nur-sr', role: 'status' });
  const knoepfe = o.beschriftungen.map((b, i) => h('button', { type: 'button', class: 'wahl-knopf', 'aria-pressed': 'false', 'data-pruef': o.pruef(i), onclick: () => waehle(i, true) }, b));
  const waehle = (i: number, melden = false): void => {
    knoepfe.forEach((k, j) => attr(k, 'aria-pressed', i === j ? 'true' : 'false'));
    o.bei(i);
    if (melden) meldung.textContent = o.meldung(o.beschriftungen[i] ?? '');
  };
  return { leiste: h('div', { class: 'wahl-leiste', role: 'group', 'aria-label': o.gruppe }, knoepfe), meldung, waehle: (i) => waehle(i) };
}
