/*
 * Startseite (O-21, P16.11): ruhiger Einstieg mit drei Wegen – Story, Theorie, Explore – und leise
 * „Wer steht dahinter“ mit dem Link zu bauherr-mentoren.com (O-44). Hintergrund: der Schulcampus als
 * Linien-Axonometrie mit goldenen Maßlinien, deutlich sichtbar (O-45). Kicker, Leitsatz und These
 * kommen aus inhalte/start.md; hier stehen nur Bedienwörter.
 */

import type { Startseite } from '../../inhalte/typen.ts';
import { campus, STUFE_MAX } from '../../grafik/bauplan.ts';
import { h, vonHtml } from '../h.ts';
import { sym } from '../bausteine/bloecke.ts';
import { inhaltInline } from '../bausteine/inhalt.ts';
import { bmLink, seitenRahmen } from '../bausteine/seite.ts';
import { W } from '../woerter.ts';

export interface StartOptionen {
  startseite: Startseite | null;
  themenAnzahl: number;
  stationenAnzahl: number;
  werkzeugAnzahl: number;
  /** Stand der Story vorhanden → „Weiterlesen“ statt „Beginnen“ */
  weiterlesen: boolean;
  /** false = nur Anzeige (Leinwand) */
  bedienbar: boolean;
}

export function baueStart(o: StartOptionen): HTMLElement {
  const w = W.start;
  const tuer = (weg: 'story' | 'theorie' | 'explore', kicker: string, titel: string, text: string, meta: string, los: string): HTMLElement => {
    const inhalt = [
      h('h2', { class: 'tuer-titel' }, h('span', { class: 'tuer-kicker' }, kicker), titel),
      h('p', { class: 'tuer-text' }, text),
      h('span', { class: 'tuer-meta' }, h('span', null, meta), h('span', { class: 'tuer-los' }, los, sym('pfeilRechts'))),
    ];
    return o.bedienbar
      ? h('a', { class: 'tuer', 'data-weg': weg, 'data-pruef': `weg-${weg}`, href: `#${weg}` }, inhalt)
      : h('div', { class: 'tuer', 'data-weg': weg }, inhalt);
  };
  return seitenRahmen({
    bereich: 'start',
    klasse: 'seite-start',
    bedienbar: o.bedienbar,
    hintergrund: h('div', { class: 'start-hintergrund', 'aria-hidden': 'true' }, vonHtml(campus(STUFE_MAX, 'bauplan bauplan-start'))),
    inhalt: h('div', { class: 'startseite', 'data-pruef': 'startseite' },
      h('div', { class: 'start-haupt' },
        h('div', { class: 'start-einstieg' },
          o.startseite !== null ? h('p', { class: 'start-kicker' }, o.startseite.kicker) : null,
          h('h1', { class: 'start-titel', 'data-pruef': 'start-titel', tabindex: -1 }, o.startseite?.titel ?? W.name),
          h('p', { class: 'start-these' }, o.startseite !== null ? inhaltInline(o.startseite.these) : null),
          h('p', { class: 'start-internetseite' }, w.internetseite)),
        h('nav', { class: 'tueren', 'aria-label': w.wege },
          tuer('story', w.storyKicker, w.storyTitel, w.storyText, w.storyMeta(o.stationenAnzahl), o.weiterlesen ? w.storyWeiter : w.storyLos),
          tuer('theorie', w.theorieKicker, w.theorieTitel, w.theorieText, w.theorieMeta(o.themenAnzahl), w.theorieLos),
          tuer('explore', w.exploreKicker, w.exploreTitel, w.exploreText, w.exploreMeta(o.werkzeugAnzahl), w.exploreLos))),
      h('section', { class: 'start-dahinter', 'aria-labelledby': 'start-dahinter-titel', 'data-pruef': 'start-dahinter' },
        h('h2', { id: 'start-dahinter-titel', class: 't-label' }, w.dahinter),
        h('p', null, w.dahinterText, ' ', o.bedienbar ? bmLink() : W.rahmen.kontaktBm)),
      h('p', { class: 'start-fiktiv' }, w.fiktiv)),
  });
}
