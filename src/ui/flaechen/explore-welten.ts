/*
 * Explore · Vorher/Nachher-Welten (P8.2): sieben Aspekte (Informationswege, Rollen, Entscheidungen,
 * Eskalationen, Register, Reporting, Gremien) in Welt A und Welt B nebeneinander – aus inhalte/welten.md,
 * je mit wortgleichem Beleg und den Stationen, in denen der Unterschied zu sehen ist. Die Aspekte sind
 * Knöpfe (einer offen); „Alle nebeneinander“ zeigt die ganze Gegenüberstellung.
 */

import { h, attr, ersetze } from '../h.ts';
import type { OeffentlicheInhalte, WeltAspekt } from '../../inhalte/typen.ts';
import { inhalt } from '../bausteine/inhalt.ts';
import * as B from '../bausteine/bloecke.ts';
import { W } from '../woerter.ts';

export function welten(inhalte: OeffentlicheInhalte): HTMLElement | null {
  const V = W.welten;
  const aspekte = inhalte.welten;
  if (aspekte.length === 0) return null;
  const name = (id: string): string => {
    const st = inhalte.stationen[id];
    return st === undefined ? id : /^[AB]\d$/u.test(id) ? `${id} · ${st.kurztitel}` : st.kurztitel;
  };
  const zeile = (a: WeltAspekt): HTMLElement => h('article', { class: 'welten-aspekt', 'data-pruef': `welt-${a.id}` },
    h('h3', { class: 'welten-titel' }, a.titel),
    h('div', { class: 'welten-paar' },
      h('div', { class: 'welten-seite', 'data-welt': 'a' }, h('span', { class: 't-label' }, V.weltA), inhalt(a.weltA)),
      h('div', { class: 'welten-seite', 'data-welt': 'b' }, h('span', { class: 't-label' }, V.weltB), inhalt(a.weltB))),
    a.bloecke.map((b) => B.block(b, inhalte, W.originalWoertlich, [], null, 'h4')),
    a.stationen.length > 0 ? h('p', { class: 'welten-stationen' }, h('span', { class: 't-label' }, `${V.inDerStory}: `), a.stationen.map(name).join(' · ')) : null);

  const buehne = h('div', { class: 'welten-buehne', 'aria-live': 'polite', 'data-pruef': 'welten-buehne' });
  const knoepfe = [...aspekte.map((a, i) => h('button', { type: 'button', class: 'welten-knopf', 'aria-pressed': 'false', 'data-pruef': `welten-knopf-${a.id}`, onclick: () => zeige(i) }, a.titel)),
    h('button', { type: 'button', class: 'welten-knopf', 'aria-pressed': 'false', 'data-pruef': 'welten-knopf-alle', onclick: () => zeige(-1) }, V.alle)];
  const zeige = (i: number): void => {
    knoepfe.forEach((k, j) => attr(k, 'aria-pressed', (i === -1 ? j === knoepfe.length - 1 : j === i) ? 'true' : 'false'));
    ersetze(buehne, ...(i === -1 ? aspekte : [aspekte[i]]).filter((a): a is WeltAspekt => a !== undefined).map(zeile));
  };
  zeige(0);

  return h('section', { class: 'werkzeug welten', id: 'werkzeug-welten-flaeche', 'aria-labelledby': 'welten-titel', 'data-pruef': 'welten' },
    h('h2', { class: 'lern-abschnitt-titel', id: 'welten-titel' }, V.name),
    h('p', { class: 'kapitel-einstieg' }, V.einstieg),
    h('div', { class: 'welten-wahl', role: 'group', 'aria-label': V.wahl }, knoepfe),
    buehne);
}
