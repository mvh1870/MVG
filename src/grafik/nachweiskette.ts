/*
 * Nachweiskette zum Anfassen (E2, P7.3): Die besuchten Stationen der Welt B stehen als Knöpfe; ein Klick
 * legt ihre Kette Glied für Glied aus – Mandat → Freigabe → Entscheidungs-ID → Datenstand → Nachweis →
 * Beschlusslage (Kap. 9). Die Texte der Glieder stehen je Station in `::: nachweis` (Welt B); die Grafik
 * ordnet sie nur an. Unter reduzierter Bewegung erscheinen die Glieder sofort (basis.css).
 */

import { h, attr, ersetze } from '../ui/h.ts';
import type { Nachweis } from '../inhalte/typen.ts';

export const GLIEDER = ['mandat', 'freigabe', 'kennung', 'datenstand', 'nachweis', 'beschlusslage'] as const;
export type Glied = (typeof GLIEDER)[number];

export interface NachweisStation {
  id: string;
  /** Beschriftung des Knopfs, z. B. „B3 · Kosten +8 %“ */
  name: string;
  nachweis: Nachweis;
}

export interface NachweisketteDaten {
  stationen: NachweisStation[];
  beschriftung: Record<Glied, string> & { waehlen: string; leer: string };
  /** HTML-Zusatz der Station (bereits geprüft vom Compiler) als Knoten */
  zusatz: (html: string) => Node | null;
}

export function nachweiskette(d: NachweisketteDaten): HTMLElement {
  if (d.stationen.length === 0) return h('p', { class: 'nachweis-leer', 'data-pruef': 'nachweiskette-leer' }, d.beschriftung.leer);
  const kette = h('div', { class: 'nachweis-auslage', 'aria-live': 'polite' });
  const knoepfe = d.stationen.map((st, i) => h('button', {
    type: 'button', class: 'nachweis-station', 'aria-pressed': 'false', 'data-pruef': `nachweis-${st.id}`,
    onclick: () => zeige(i),
  }, st.name));
  const zeige = (i: number): void => {
    knoepfe.forEach((b, j) => attr(b, 'aria-pressed', i === j ? 'true' : 'false'));
    const st = d.stationen[i];
    if (st === undefined) return;
    ersetze(kette,
      h('h4', { class: 'tafel-titel' }, st.name),
      h('ol', { class: 'nachweis-glieder', 'data-pruef': 'nachweis-glieder' }, GLIEDER.map((g, n) => h('li', { class: 'nachweis-glied', style: `--i:${n}`, 'data-glied': g },
        h('span', { class: 'nachweis-nr', 'aria-hidden': 'true' }, String(n + 1)),
        h('span', { class: 't-label' }, d.beschriftung[g]),
        h('span', { class: 'nachweis-text' }, st.nachweis[g])))),
      st.nachweis.text !== '' ? d.zusatz(st.nachweis.text) : null);
  };
  zeige(d.stationen.length - 1);
  return h('div', { class: 'nachweiskette', 'data-pruef': 'nachweiskette' },
    h('div', { class: 'nachweis-wahl', role: 'group', 'aria-label': d.beschriftung.waehlen }, knoepfe),
    kette);
}
