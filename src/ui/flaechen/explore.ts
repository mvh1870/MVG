/*
 * Fläche „Explore“ (P2.4, BAUPLAN Abschnitt 6): Rahmen für die Werkzeuge (Szenario-Simulator,
 * Vorher/Nachher, Sandbox, Zeitmaschine, Galerie, Figuren). Nicht auf der Startseite angeboten
 * (O-21), erreichbar aus Story und Theorie; freigeschaltet mit dem Ende der Geschichte. Die
 * Werkzeuge selbst entstehen in P8 – bis dahin stehen sie als „in Vorbereitung“.
 */

import { h } from '../h.ts';
import { bildmarke } from '../marke.ts';
import { sym } from '../bausteine/bloecke.ts';
import { W } from '../woerter.ts';

export interface ExploreOptionen {
  freigeschaltet: boolean;
  version: string;
}

export function baueExplore(o: ExploreOptionen): HTMLElement {
  const E = W.explore;
  return h('div', { class: 'lernseite', 'data-pruef': 'explore' },
    h('header', { class: 'lern-kopf' },
      bildmarke('marke-logo'),
      h('p', { class: 'lern-bereich' }, `${E.bereich} `, h('span', null, E.bereichZusatz)),
      h('a', { class: 'lern-kopf-link', href: '#start', 'data-pruef': 'zur-start' }, sym('pfeilLinks'), W.theorie.start)),
    h('div', { class: 'lern-rahmen ist-einspaltig' },
      h('article', { class: 'lern-inhalt', id: 'lern-inhalt' },
        h('header', { class: 'explore-kopf' },
          h('p', { class: 'kapitel-kicker' }, o.freigeschaltet ? E.freigeschaltet : E.gesperrt),
          h('h1', { class: 'kapitel-titel', tabindex: -1 }, E.titel),
          h('p', { class: 'kapitel-einstieg' }, E.einstieg)),
        h('ul', { class: 'explore-karten', 'data-pruef': 'explore-werkzeuge' }, E.werkzeuge.map((w) => h('li', { class: 'explore-karte', 'data-pruef': `werkzeug-${w.id}` },
          h('span', { class: 'badge ist-folgt' }, E.inVorbereitung),
          h('h2', { class: 'explore-karte-titel' }, w.titel),
          h('p', null, w.text)))),
        h('p', null,
          h('a', { class: 'querverweis', href: '#story', 'data-pruef': 'explore-zur-story' }, h('span', { class: 'querverweis-symbol' }, sym('pfeilRechts')), W.story),
          ' ',
          h('a', { class: 'querverweis', href: '#theorie', 'data-pruef': 'explore-zur-theorie' }, h('span', { class: 'querverweis-symbol' }, sym('pfeilRechts')), W.theorie.zurListe)),
        h('footer', { class: 'lern-fuss' },
          h('span', null, `${W.start.fuss} · `, h('span', { 'data-pruef': 'version' }, o.version)),
          h('span', { class: 'vermerk-hell', 'data-pruef': 'ungeprueft' }, sym('info'), W.ungeprueft)))));
}
