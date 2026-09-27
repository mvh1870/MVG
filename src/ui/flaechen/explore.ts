/*
 * Fläche „Explore“ (P2.4, BAUPLAN Abschnitt 6): Rahmen für die Werkzeuge (Szenario-Simulator,
 * Vorher/Nachher, Sandbox, Zeitmaschine, Galerie, Figuren). Nicht auf der Startseite angeboten
 * (O-21), erreichbar aus Story und Theorie; freigeschaltet mit dem Ende der Geschichte. Jedes
 * Werkzeug rechnet nur mit Regeln aus dem Whitepaper (L-51).
 */

import { h } from '../h.ts';
import { bildmarke } from '../marke.ts';
import { sym } from '../bausteine/bloecke.ts';
import { W } from '../woerter.ts';
import type { OeffentlicheInhalte } from '../../inhalte/typen.ts';
import { MIMIKEN } from '../../figuren/figur.ts';
import { inhalt, personFigur } from '../bausteine/inhalt.ts';
import { simulator } from './explore-simulator.ts';
import { welten } from './explore-welten.ts';
import { sandbox } from './explore-sandbox.ts';
import { zeitmaschine } from './explore-zeitmaschine.ts';
import { galerie, stationsKarte } from './explore-galerie.ts';

export interface ExploreOptionen {
  inhalte: OeffentlicheInhalte;
  freigeschaltet: boolean;
  /** Welt B freigeschaltet (Story-Karte mit Sprung) */
  weltB: boolean;
  version: string;
}

/** Werkzeuge, die schon stehen (P8): Kennung → Anker der Fläche. */
const FERTIG: Record<string, string> = { simulator: 'werkzeug-simulator-flaeche', welten: 'werkzeug-welten-flaeche', sandbox: 'werkzeug-sandbox-flaeche', zeitmaschine: 'werkzeug-zeitmaschine-flaeche', galerie: 'werkzeug-galerie-flaeche', figuren: 'werkzeug-figuren-flaeche' };

function springe(id: string): void {
  const ziel = document.getElementById(FERTIG[id] ?? '');
  if (ziel === null) return;
  ziel.scrollIntoView({ block: 'start' });
  const titel = ziel.querySelector<HTMLElement>('h2');
  if (titel !== null) { titel.tabIndex = -1; titel.focus({ preventScroll: true }); }
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
        h('ul', { class: 'explore-karten', 'data-pruef': 'explore-werkzeuge' }, E.werkzeuge.map((w) => {
          const bereit = FERTIG[w.id] !== undefined;
          return h('li', { class: 'explore-karte', 'data-pruef': `werkzeug-${w.id}` },
            h('span', { class: `badge${bereit ? ' ist-bereit' : ' ist-folgt'}` }, bereit ? E.bereit : E.inVorbereitung),
            h('h2', { class: 'explore-karte-titel' }, w.titel),
            h('p', null, w.text),
            bereit ? h('button', { type: 'button', class: 'querverweis', 'data-pruef': `werkzeug-oeffnen-${w.id}`, onclick: () => springe(w.id) }, h('span', { class: 'querverweis-symbol' }, sym('pfeilRechts')), E.oeffnen) : null);
        })),
        simulator(o.inhalte),
        welten(o.inhalte),
        sandbox(),
        zeitmaschine(o.inhalte),
        galerie(o.inhalte, o.weltB),
        stationsKarte(o.inhalte, o.weltB),
        besetzung(o.inhalte),
        h('p', null,
          h('a', { class: 'querverweis', href: '#story', 'data-pruef': 'explore-zur-story' }, h('span', { class: 'querverweis-symbol' }, sym('pfeilRechts')), W.story),
          ' ',
          h('a', { class: 'querverweis', href: '#theorie', 'data-pruef': 'explore-zur-theorie' }, h('span', { class: 'querverweis-symbol' }, sym('pfeilRechts')), W.theorie.zurListe)),
        h('footer', { class: 'lern-fuss' },
          h('span', null, `${W.start.fuss} · `, h('span', { 'data-pruef': 'version' }, o.version)),
          h('span', { class: 'vermerk-hell', 'data-pruef': 'ungeprueft' }, sym('info'), W.ungeprueft)))));
}

/** Figurengalerie (P3.1): jede Figur der Fall-Bibel in drei Mimiken, mit Funktion und Stimme. */
function besetzung(inhalte: OeffentlicheInhalte): HTMLElement | null {
  const E = W.explore;
  const figuren = Object.values(inhalte.fall?.figuren ?? {});
  if (figuren.length === 0) return null;
  return h('section', { class: 'besetzung-galerie', 'aria-labelledby': 'explore-besetzung', 'data-pruef': 'besetzung' },
    h('h2', { class: 'lern-abschnitt-titel', id: 'explore-besetzung' }, E.besetzung),
    h('p', { class: 'kapitel-einstieg' }, E.besetzungText),
    h('ul', { class: 'besetzung-karten' }, figuren.map((f) => h('li', { class: 'besetzung-karte', 'data-pruef': `figur-${f.id}` },
      h('div', { class: 'besetzung-gesichter', role: 'group', 'aria-label': f.name },
        MIMIKEN.map((m) => h('figure', null, personFigur(f.id, 56, inhalte, m), h('figcaption', null, E.mimik[m])))),
      h('h3', null, f.name),
      h('p', { class: 'besetzung-funktion' }, f.funktion),
      f.felder['stimme'] ? h('div', { class: 'besetzung-stimme' }, h('span', { class: 't-label' }, E.stimme), inhalt(f.felder['stimme'])) : null))));
}
