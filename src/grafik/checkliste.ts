/*
 * Grafik-Baukasten: Entscheidungsvorlage mit Prüfliste (Checkliste Kap. 9.4; Pflicht-Animation 5).
 *
 * Die Punkte kommen aus den Inhalten (`::: vorlage` → `liste` mit Stand erfüllt/fehlt/offen); die
 * Prüfliste tickt nacheinander ab. Jeder Stand steht als Symbol UND Wort da (nie nur Farbe).
 */

import { h, elementAus } from '../ui/h.ts';
import { symbol } from '../stil/symbole.ts';
import type { Takt } from '../ui/bewegung.ts';

export type PruefStand = 'erfuellt' | 'fehlt' | 'offen';

export interface Pruefpunkt {
  /** Inhalt als Knoten (HTML aus den Inhalten, Glossar schon aktiviert) */
  inhalt: Node;
  stand: PruefStand;
}

export interface VorlageOptionen {
  id: string;
  titel: string;
  meta: string | null;
  frage: Node;
  punkte: Pruefpunkt[];
}

export interface VorlageGrafik {
  element: HTMLElement;
  /** tickt nacheinander ab; `fertig` nach dem letzten Punkt */
  tickeAb(takt: Takt, fertig: () => void): void;
  zeigeAlle(): void;
  markiereFehlende(): void;
}

export const STAND_WORT: Readonly<Record<PruefStand, string>> = { erfuellt: 'erfüllt', fehlt: 'fehlt', offen: 'noch offen' };
const STAND_SYMBOL = { erfuellt: 'haken', fehlt: 'kreuz', offen: 'ring' } as const;

/** Präfix der ID-Marke → Art (Companion §3): ENT, RIS, FRW, AEN, MAS, NAC. */
export function idArt(id: string): string | null {
  const m = /^(ENT|RIS|FRW|AEN|MAS|NAC)-/i.exec(id);
  return m ? (m[1] ?? '').toLowerCase() : null;
}

export function vorlage(o: VorlageOptionen): VorlageGrafik {
  const punkte = o.punkte.map((p) => h('li', { class: 'pruefpunkt', 'data-stand': p.stand },
    h('span', { class: 'pruef-kaestchen', 'aria-hidden': 'true' }, elementAus(symbol(STAND_SYMBOL[p.stand]))),
    h('span', null, p.inhalt, h('span', { class: 'nur-sr' }, ` – ${STAND_WORT[p.stand]}`)),
    p.stand !== 'erfuellt' ? h('span', { class: 'pruef-status', 'aria-hidden': 'true' }, STAND_WORT[p.stand]) : null));
  const haelfte = Math.ceil(punkte.length / 2);
  const listen = [
    h('ol', { class: 'pruefliste' }, punkte.slice(0, haelfte)),
    h('ol', { class: 'pruefliste', start: haelfte + 1 }, punkte.slice(haelfte)),
  ];
  const element = h('article', { class: 'vorlage', 'aria-label': `${o.titel} ${o.id}`, 'data-pruef': 'vorlage' },
    h('header', { class: 'vorlage-kopf' },
      h('span', { class: 'id-marke', 'data-art': idArt(o.id) }, o.id),
      h('span', { class: 't-label' }, o.titel),
      o.meta !== null ? h('span', { class: 'vorlage-meta' }, o.meta) : null),
    h('div', { class: 'vorlage-frage' }, o.frage),
    h('div', { class: 'pruef-spalten' }, listen),
    h('p', { class: 'pruef-legende', 'aria-hidden': 'true' },
      (['erfuellt', 'fehlt', 'offen'] as const).map((s) => h('span', { 'data-stand': s },
        h('span', { class: 'pruef-kaestchen' }, elementAus(symbol(STAND_SYMBOL[s]))), STAND_WORT[s]))));

  return {
    element,
    tickeAb(takt, fertig) {
      punkte.forEach((li, i) => takt.spaeter(() => li.classList.add('ist-an'), 450 + i * 190));
      takt.spaeter(fertig, 450 + punkte.length * 190 + 150);
    },
    zeigeAlle() {
      for (const li of punkte) li.classList.add('ist-an');
    },
    markiereFehlende() {
      for (const l of listen) {
        l.classList.remove('ist-markiert');
        void l.offsetWidth;
        l.classList.add('ist-markiert');
      }
    },
  };
}
