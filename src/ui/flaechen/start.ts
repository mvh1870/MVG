/*
 * Startseite (O-21, O-57, P17.7): ruhiger Einstieg mit drei Wegen – Story, Theorie, Explore – und leise
 * „Wer steht dahinter“ mit dem Link zu bauherr-mentoren.com (O-44). Die Story-Karte zeigt den fertigen Campus
 * und die Figuren der Story mit Namen und Rolle, die Theorie-Karte die vier Teile des Buchs in ihren Farben,
 * die Explore-Karte die Gegenstände der Werkzeuge. Hintergrund: der Schulcampus als Linien-Axonometrie mit
 * goldenen Maßlinien (O-45), die Baukörper in den Akzenttönen. Kicker, Leitsatz und These kommen aus
 * inhalte/start.md; hier stehen nur Bedienwörter.
 */

import type { Startseite } from '../../inhalte/typen.ts';
import { campus, STUFE_MAX } from '../../grafik/bauplan.ts';
import { campusIso, CAMPUS_STUFE_MAX } from '../../grafik/campus-iso.ts';
import { FIGUR_NAME, FIGUREN, gimmick, portraet } from '../../grafik/figuren.ts';
import { h, vonHtml } from '../h.ts';
import { sym } from '../bausteine/bloecke.ts';
import { inhaltInline } from '../bausteine/inhalt.ts';
import { bmLink, seitenRahmen } from '../bausteine/seite.ts';
import { WERKZEUG_BILD, WERKZEUGE } from './explore.ts';
import { W } from '../woerter.ts';

export interface StartOptionen {
  startseite: Startseite | null;
  themenAnzahl: number;
  /** Anzahl der Kapitel der Story (sichtbar als Entscheidungen, nie „Kapitel“) */
  stationenAnzahl: number;
  werkzeugAnzahl: number;
  /** Stand der Story vorhanden → „Weiterlesen“ statt „Beginnen“ */
  weiterlesen: boolean;
  /** false = nur Anzeige (Leinwand) */
  bedienbar: boolean;
}

type Weg = 'story' | 'theorie' | 'explore';

/** Die Figuren der Story: kleines Porträt (Schmuck), Name und Rolle als Text. */
function figurenListe(): HTMLElement {
  return h('div', { class: 'tuer-figuren', 'data-pruef': 'start-figuren' },
    h('p', { class: 'tuer-figuren-titel' }, W.start.figuren),
    h('ul', null, FIGUREN.map((f) => h('li', { 'data-figur': f },
      vonHtml(portraet(f, { groesse: 44, dekorativ: true })),
      h('span', null, h('b', null, FIGUR_NAME[f].name), h('small', null, FIGUR_NAME[f].rolle))))));
}

/** Die vier Teile des Buchs in ihren Farben (O-54). */
function teileListe(): HTMLElement {
  const T = W.themen;
  return h('ol', { class: 'tuer-teile' }, ([1, 2, 3, 4] as const).map((n) => h('li', { 'data-teil': String(n) },
    h('span', { class: 'tuer-teil-marke', 'aria-hidden': 'true' }, ['I', 'II', 'III', 'IV'][n - 1] ?? ''),
    h('span', { class: 'nur-sr' }, `${T.teil(n)}: `),
    T.teilName[n])));
}

/** Gegenstände der fünf Werkzeuge, je auf einer Scheibe im Werkzeugton (Schmuck). */
function werkzeugBilder(): HTMLElement {
  return h('ul', { class: 'tuer-werkzeuge', 'aria-hidden': 'true' }, WERKZEUGE.map((id) => h('li', { 'data-ton': WERKZEUG_BILD[id].ton },
    vonHtml(gimmick(WERKZEUG_BILD[id].bild, { groesse: 44, dekorativ: true })))));
}

export function baueStart(o: StartOptionen): HTMLElement {
  const w = W.start;
  const tuer = (weg: Weg, kicker: string, titel: string, text: string, meta: string, los: string, zusatz: HTMLElement | null, bild: HTMLElement | null = null): HTMLElement => {
    // Bedienbar: der Name des Wegs ist Titel und Aufforderung, der Rest beschreibt (sonst läse sich die ganze Karte vor)
    const id = (teil: string): string | null => o.bedienbar ? `tuer-${weg}-${teil}` : null;
    const inhalt = [
      bild,
      h('div', { class: 'tuer-inhalt' },
        h('h2', { class: 'tuer-titel', id: id('titel') }, h('span', { class: 'tuer-kicker' }, kicker), titel),
        h('p', { class: 'tuer-text', id: id('text') }, text),
        zusatz,
        h('span', { class: 'tuer-meta' }, h('span', { id: id('meta') }, meta), h('span', { class: 'tuer-los', id: id('los') }, los, sym('pfeilRechts')))),
    ];
    return o.bedienbar
      ? h('a', { class: 'tuer', 'data-weg': weg, 'data-pruef': `weg-${weg}`, href: `#${weg}`, 'aria-labelledby': `tuer-${weg}-titel tuer-${weg}-los`, 'aria-describedby': `tuer-${weg}-text tuer-${weg}-meta` }, inhalt)
      : h('div', { class: 'tuer', 'data-weg': weg }, inhalt);
  };
  // Der Campus füllt sein Feld (Himmel und Wiese dürfen am Rand abgeschnitten werden)
  const campusBild = h('div', { class: 'tuer-bild', 'aria-hidden': 'true' },
    vonHtml(campusIso(CAMPUS_STUFE_MAX, { jahreszeit: 'sommer', licht: 'tag', klasse: 'tuer-campus' }).replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" ')));
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
          tuer('story', w.storyKicker, w.storyTitel, w.storyText, w.storyMeta(o.stationenAnzahl), o.weiterlesen ? w.storyWeiter : w.storyLos, figurenListe(), campusBild),
          tuer('theorie', w.theorieKicker, w.theorieTitel, w.theorieText, w.theorieMeta(o.themenAnzahl), w.theorieLos, teileListe()),
          tuer('explore', w.exploreKicker, w.exploreTitel, w.exploreText, w.exploreMeta(o.werkzeugAnzahl), w.exploreLos, werkzeugBilder()))),
      h('section', { class: 'start-dahinter', 'aria-labelledby': 'start-dahinter-titel', 'data-pruef': 'start-dahinter' },
        h('h2', { id: 'start-dahinter-titel', class: 't-label' }, w.dahinter),
        h('p', null, w.dahinterText, ' ', o.bedienbar ? bmLink() : W.rahmen.kontaktBm)),
      h('p', { class: 'start-fiktiv' }, w.fiktiv)),
  });
}
