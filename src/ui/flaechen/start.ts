/*
 * Fläche „Start“ (O-21): ruhiger Einstieg mit genau zwei Wegen – Erklärt (Theorie) und Erlebt
 * (Story). Keine Instrumente, keine Statusfläche; „Präsentieren“ (Regie) nur leise im Fuß.
 * Aufbau nach der Stilreferenz (werkzeuge/stilreferenz.mjs → startseite): im Kopf die Bildmarke mit
 * dem Absender als Text (STIL Grundsatz 8), damit beide Türen samt „Öffnen/Beginnen“ auch bei
 * 1280×720 (Beamer) auf den ersten Blick sichtbar sind. Kicker, Leitsatz und These kommen aus
 * inhalte/start.md (O-18); hier stehen nur Bedienwörter.
 */

import type { Startseite } from '../../inhalte/typen.ts';
import { h, s } from '../h.ts';
import { bildmarke } from '../marke.ts';
import { sym } from '../bausteine/bloecke.ts';
import { inhaltInline } from '../bausteine/inhalt.ts';
import { W } from '../woerter.ts';

export interface StartOptionen {
  /** Kicker, Leitsatz und These (inhalte/start.md); null = nur die zwei Wege */
  startseite: Startseite | null;
  kapitelAnzahl: number;
  rollenAnzahl: number;
  /** Stand der Story vorhanden → „Weiterlesen“ statt „Beginnen“ */
  weiterlesen: boolean;
  /** Fassung des Whitepapers, z. B. „V1.2“ */
  fassung: string;
  /** „Whitepaper V1.2 · Story 0.1“ */
  version: string;
  /** false = nur Anzeige (Leinwand) */
  bedienbar: boolean;
}

function theorieBild(): SVGSVGElement {
  const hoehen = [16, 8, 20, 4, 12, 0, 14, 6, 18, 10, 22, 8, 26];
  return s('svg', { class: 'tuer-bild kapitel-striche', viewBox: '0 0 320 92', 'aria-hidden': 'true' },
    s('g', { transform: 'translate(0,20)' }, hoehen.map((y, i) => s('rect', {
      x: i * 24, y, width: 16, height: 52 - y, rx: 4, class: i === 0 ? 'ist-an' : null, style: `--verzug:${i * 50}ms`,
    }))));
}

function storyBild(): SVGSVGElement {
  return s('svg', { class: 'tuer-bild', viewBox: '0 0 320 92', 'aria-hidden': 'true' },
    s('circle', { class: 'weg-start', cx: 14, cy: 46, r: 7 }),
    s('path', { class: 'weg-a', d: 'M22 46 C 60 46, 70 14, 110 22 S 150 70, 185 50 S 230 8, 262 30 S 290 74, 306 64' }),
    s('path', { class: 'weg-b', d: 'M22 46 C 90 46, 200 46, 306 46' }),
    s('text', { class: 'weg-text', 'data-welt': 'b', x: 306, y: 84, 'text-anchor': 'end' }, W.start.weltB),
    s('text', { class: 'weg-text', 'data-welt': 'a', x: 306, y: 14, 'text-anchor': 'end' }, W.start.weltA));
}

export function baueStart(o: StartOptionen): HTMLElement {
  const w = W.start;
  const tuer = (weg: 'theorie' | 'story', inhalt: Node[]): HTMLElement => o.bedienbar
    ? h('a', { class: 'tuer', 'data-weg': weg, 'data-pruef': `weg-${weg}`, href: `#${weg}` }, inhalt)
    : h('div', { class: 'tuer', 'data-weg': weg }, inhalt);
  const seite = h('div', { class: 'startseite', 'data-pruef': 'startseite' },
    h('header', { class: 'start-kopf' },
      bildmarke('marke-logo'),
      h('div', { class: 'start-absender' }, h('b', null, W.absender), h('span', null, `${W.whitepaper} ${o.fassung} · ${w.interaktiv}`))),
    h('main', { class: 'start-haupt' },
      h('div', null,
        o.startseite !== null ? h('p', { class: 'start-kicker' }, o.startseite.kicker) : null,
        h('h1', { class: 'start-titel', 'data-pruef': 'start-titel' }, o.startseite?.titel ?? W.absender),
        h('p', { class: 'start-these' }, o.startseite !== null ? inhaltInline(o.startseite.these) : null, o.startseite !== null ? ' ' : null, w.wegWaehlen)),
      h('nav', { class: 'tueren', 'aria-label': w.wege },
        tuer('theorie', [
          theorieBild(),
          h('h2', { class: 'tuer-titel' }, h('span', { class: 'tuer-kicker' }, w.theorieKicker), w.theorieTitel),
          h('p', { class: 'tuer-text' }, w.theorieText),
          h('span', { class: 'tuer-meta' }, h('span', null, w.theorieMeta(o.kapitelAnzahl)), h('span', { class: 'tuer-los' }, w.theorieLos, sym('pfeilRechts'))),
        ]),
        tuer('story', [
          storyBild(),
          h('h2', { class: 'tuer-titel' }, h('span', { class: 'tuer-kicker' }, w.storyKicker), w.storyTitel),
          h('p', { class: 'tuer-text' }, w.storyText),
          h('span', { class: 'tuer-meta' }, h('span', null, w.storyMeta(o.rollenAnzahl)), h('span', { class: 'tuer-los' }, o.weiterlesen ? w.storyWeiter : w.storyLos, sym('pfeilRechts'))),
        ]))),
    h('footer', { class: 'start-fuss', 'data-pruef': 'fuss' },
      h('span', null, `${W.produkt} · ${W.fiktiv} · `, h('span', { 'data-pruef': 'version' }, o.version), ' ', h('span', { class: 'start-vermerk', 'data-pruef': 'ungeprueft' }, W.ungeprueft)),
      o.bedienbar ? h('span', { class: 'leise-links' }, h('a', { class: 'leise-link', href: '#hilfe', 'data-pruef': 'zur-hilfe' }, W.hilfe.link), h('a', { class: 'leise-link', href: '#regie', 'data-pruef': 'praesentieren' }, w.praesentieren)) : null));
  return seite;
}
