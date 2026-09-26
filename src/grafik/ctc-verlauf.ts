/*
 * Grafik-Baukasten: Verlauf der Restkostenprognose (CTC) mit Schwellenwert (Story B3, „Signal“).
 *
 * Eine schematische Kurve (kein Zahlenwerk des Falls): die Prognose steigt und überschreitet in
 * Monat 5 den Schwellenwert – die Stelle, an der eine neue Frühwarnung entsteht (Kap. 6.4.3,
 * Glossar „Frühwarnung“). Titel, Untertitel und die Beschreibung für Screenreader kommen aus den
 * Inhalten (`::: grafik ctc-verlauf`).
 */

import { h, s } from '../ui/h.ts';

export interface VerlaufOptionen {
  titel: string | null;
  untertitel: string | null;
  /** Beschreibung (Text) für Screenreader */
  beschreibung: string;
  /** Achsenbeschriftung der Monate */
  monate: string[];
  /** Beschriftung der Schwelle */
  schwelle: string;
}

export function ctcVerlauf(o: VerlaufOptionen): HTMLElement {
  const xs = [34, 100, 166, 232, 296];
  const ys = [160, 152, 137, 110, 55];
  const linie = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x} ${ys[i] ?? 0}`).join(' ');
  const flaeche = `${linie} L296 175 L34 175Z`;
  const svg = s('svg', { viewBox: '0 0 320 200', role: 'img', 'aria-label': o.beschreibung },
    s('g', { class: 'verlauf-gitter' }, [25, 75, 125, 175].map((y) => s('line', { x1: 24, y1: y, x2: 310, y2: y }))),
    s('g', { class: 'verlauf-achse' }, o.monate.slice(0, xs.length).map((m, i) => s('text', { x: (xs[i] ?? 0) - 4, y: 196 }, m))),
    s('path', { class: 'verlauf-flaeche', d: flaeche }),
    s('line', { class: 'verlauf-schwelle', x1: 24, y1: 78, x2: 310, y2: 78 }),
    s('text', { class: 'verlauf-schwelle-text', x: 28, y: 70 }, o.schwelle),
    s('path', { class: 'verlauf-linie', d: linie }),
    s('circle', { class: 'verlauf-treffer-ring', cx: 269, cy: 78, r: 7 }),
    s('circle', { class: 'verlauf-treffer', cx: 269, cy: 78, r: 5 }));
  return h('figure', { class: 'verlauf' },
    h('figcaption', null,
      o.titel !== null ? h('span', { class: 't-label' }, o.titel) : null,
      o.untertitel !== null ? h('span', null, o.untertitel) : null),
    svg);
}
