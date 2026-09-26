/*
 * Grafik-Baukasten: kanonischer Governance-Fluss (Kap. 6.4.3) als Kette mit wanderndem Marker.
 *
 *   Frühwarnung → bestätigt → Risiko → Entscheidung → Freigabe → Maßnahme → Managementbericht
 *
 * Die sieben Stationen sind die Definition dieser Grafik (Kennungen wie im Inhaltsformat, `fluss`
 * `position`); was an einer Station konkret steht (FRW-003, RIS-014 …), gibt der Aufrufer als
 * `marken` aus den Inhalten mit. Story (B3) und Theorie nutzen denselben Baustein.
 */

import { h, elementAus } from '../ui/h.ts';
import { symbol, type SymbolName } from '../stil/symbole.ts';
import type { Takt } from '../ui/bewegung.ts';

export const FLUSS_POSITIONEN = ['fruehwarnung', 'bestaetigt', 'risiko', 'entscheidung', 'freigabe', 'massnahme', 'managementbericht'] as const;
export type FlussPosition = (typeof FLUSS_POSITIONEN)[number];

/** Beschriftung der Stationen (Kap. 6.4.3; „Managementbericht“ mit weicher Trennung). */
export const FLUSS_BESCHRIFTUNG: Readonly<Record<FlussPosition, string>> = {
  fruehwarnung: 'Frühwarnung',
  bestaetigt: 'bestätigt',
  risiko: 'Risiko',
  entscheidung: 'Entscheidung',
  freigabe: 'Freigabe',
  massnahme: 'Maßnahme',
  managementbericht: 'Management­bericht',
};

const SYMBOL: Readonly<Record<FlussPosition, SymbolName>> = {
  fruehwarnung: 'warnung',
  bestaetigt: 'haken',
  risiko: 'schild',
  entscheidung: 'hammer',
  freigabe: 'stempel',
  massnahme: 'werkzeug',
  managementbericht: 'bericht',
};

export function istFlussPosition(x: unknown): x is FlussPosition {
  return typeof x === 'string' && (FLUSS_POSITIONEN as readonly string[]).includes(x);
}

export interface FlussMarke {
  text: string;
  /** als Kennung in Monospace (FRW-003) */
  mono: boolean;
}

export interface FlussOptionen {
  position: FlussPosition;
  marken: Partial<Record<FlussPosition, FlussMarke>>;
  /** Beschriftung der Markierung, z. B. „Sie sind hier“ */
  hier: string;
}

export interface FlussGrafik {
  element: HTMLElement;
  /** Marker wandert von der ersten Station bis zur Position (Pflicht-Animation 3). */
  laufe(takt: Takt): void;
  /** Endzustand sofort */
  setze(): void;
}

export function governanceFluss(o: FlussOptionen): FlussGrafik {
  const ziel = FLUSS_POSITIONEN.indexOf(o.position);
  const text = FLUSS_POSITIONEN.map((p) => FLUSS_BESCHRIFTUNG[p].replace('­', '')).join(', ');
  const stationen = FLUSS_POSITIONEN.map((p, i) => {
    const m = o.marken[p];
    return h('li', { 'data-i': i, class: i > ziel ? 'ist-kuenftig' : null },
      h('span', { class: 'fluss-knoten' }, elementAus(symbol(SYMBOL[p]))),
      h('span', { class: 'fluss-text' },
        h('b', null, FLUSS_BESCHRIFTUNG[p]),
        m !== undefined ? h('small', { class: m.mono ? 'mono' : null }, m.text) : null),
      h('span', { class: 'fluss-hier-marke' }, o.hier));
  });
  const element = h('div', {
    class: 'fluss',
    role: 'img',
    'aria-label': `Governance-Fluss: ${text}. Aktuelle Position: ${FLUSS_BESCHRIFTUNG[o.position].replace('­', '')}.`,
    'data-pruef': 'fluss',
    style: '--fuellung:0%;--bei:0',
  },
  h('div', { class: 'fluss-bahn', 'aria-hidden': 'true' }, h('div', { class: 'fluss-fuellung' }, h('div', { class: 'fluss-puls' }))),
  h('span', { class: 'fluss-marke', 'aria-hidden': 'true' }, o.hier),
  h('ol', { class: 'fluss-stationen' }, stationen));

  const gehe = (k: number): void => {
    stationen.forEach((li, j) => {
      li.classList.toggle('ist-passiert', j < k);
      li.classList.toggle('ist-hier', j === k);
    });
    element.style.setProperty('--fuellung', `${((k / (FLUSS_POSITIONEN.length - 1)) * 100).toFixed(3)}%`);
    element.style.setProperty('--bei', String(k));
  };

  return {
    element,
    setze() {
      gehe(ziel);
      element.classList.add('ist-lebendig');
    },
    laufe(takt) {
      gehe(0);
      for (let k = 1; k <= ziel; k += 1) takt.spaeter(() => gehe(k), 400 + k * 620);
      takt.spaeter(() => {
        gehe(ziel);
        element.classList.add('ist-lebendig');
      }, 400 + ziel * 620 + 500);
    },
  };
}
