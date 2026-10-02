/*
 * Grafik-Baukasten: RACI mit Mandat (Kap. 9.2, P5.1).
 *
 * Die Kernfrage aus k9.2-p3 – wer bereitet vor, wer entscheidet, wer liefert belastbare Grundlagen,
 * wer wird konsultiert, wer informiert – als Matrix Entscheidung × Rolle, dazu je Zeile das Mandat
 * (Schwelle, Gremium). Die Zuordnungen kommen aus den Inhalten (`::: raci`, fiktiver Fall); die Grafik
 * ordnet nur an. Jeder Buchstabe steht mit Wort im Tooltip/aria-Label da, nie nur als Farbe.
 */

import { h, attr, ersetze, mitRollenfugen, mitTrennstellen } from '../ui/h.ts';

export const RACI_BUCHSTABEN = ['R', 'A', 'C', 'I'] as const;
export type RaciBuchstabe = (typeof RACI_BUCHSTABEN)[number];

/** Bedeutung je Buchstabe in den Worten von k4.2-p1 (R54: vorher „bereitet vor“/„entscheidet“ – A ist die letztverantwortliche Rolle). */
export const RACI_WORT: Readonly<Record<RaciBuchstabe, string>> = {
  R: 'ausführungsverantwortlich',
  A: 'letztverantwortlich',
  C: 'konsultiert',
  I: 'informiert',
};

/** Beschriftung der Matrix (Bedienwörter, keine Fachaussage). */
export const RACI_BESCHRIFTUNG = { entscheidung: 'Prozess', mandat: 'Mandat', legende: 'RACI mit Mandat', sie: 'Sie' } as const;

export interface RaciZeile {
  id: string;
  titel: string;
  /** Rolle → Buchstabe */
  zuordnung: Record<string, RaciBuchstabe>;
  mandat: string;
}

export interface RaciDaten {
  /** Spalten: Rollen-ID → Kurztitel, in Anzeige-Reihenfolge */
  rollen: { id: string; titel: string }[];
  zeilen: RaciZeile[];
  /** gespielte Rolle (Spalte hervorheben) */
  ich: string | null;
  beschriftung: { entscheidung: string; mandat: string; legende: string; sie: string };
  /** Überschriftenstufe des Detailtitels (Standard h4) */
  stufe?: 'h2' | 'h3' | 'h4';
}

export function istRaciBuchstabe(x: string): x is RaciBuchstabe {
  return (RACI_BUCHSTABEN as readonly string[]).includes(x);
}

/** Matrix mit Zeilenwahl: Klick auf eine Entscheidung zeigt sie ausgeschrieben (wer was tut, welches Mandat). */
export function raci(d0: RaciDaten): HTMLElement {
  // Die Spalte der gespielten Rolle steht direkt hinter der Entscheidung (auch bei 400 px ohne Seitwärtsscrollen sichtbar)
  const d: RaciDaten = { ...d0, rollen: [...d0.rollen.filter((r) => r.id === d0.ich), ...d0.rollen.filter((r) => r.id !== d0.ich)] };
  const detail = h('div', { class: 'raci-detail', 'aria-live': 'polite', 'data-pruef': 'raci-detail' });
  const knoepfe: HTMLButtonElement[] = [];
  const zeige = (i: number): void => {
    knoepfe.forEach((b, j) => attr(b, 'aria-pressed', i === j ? 'true' : 'false'));
    const z = d.zeilen[i];
    if (z === undefined) return;
    ersetze(detail, h(d.stufe ?? 'h4', { class: 'tafel-titel' }, z.titel),
      h('dl', { class: 'tafel-detail' },
        RACI_BUCHSTABEN.map((b) => {
          const wer = d.rollen.filter((r) => z.zuordnung[r.id] === b).map((r) => (r.id === d.ich ? `${r.titel} (${d.beschriftung.sie})` : r.titel));
          return wer.length > 0 ? h('div', null, h('dt', null, `${b} · ${mitTrennstellen(RACI_WORT[b])}`), h('dd', null, wer.join(', '))) : null;
        }),
        h('div', null, h('dt', null, d.beschriftung.mandat), h('dd', null, z.mandat))));
  };
  const kopf = h('tr', null,
    h('th', { scope: 'col' }, d.beschriftung.entscheidung),
    // R62: „Geschäfts|führung“, „Projekt|steuerung“ dürfen trennen – sonst ist die Matrix auf der Leinwand (1024 px, Beamer 1280 px) breiter als die Tafel
    d.rollen.map((r) => h('th', { scope: 'col', class: r.id === d.ich ? 'ist-ich' : null }, mitRollenfugen(r.titel))),
    h('th', { scope: 'col' }, d.beschriftung.mandat));
  const zeilen = d.zeilen.map((z, i) => {
    const knopf = h('button', { type: 'button', class: 'raci-zeile-knopf', 'aria-pressed': 'false', 'data-pruef': `raci-${z.id}`, onclick: () => zeige(i) }, z.titel);
    knoepfe.push(knopf);
    return h('tr', null,
      h('th', { scope: 'row' }, knopf),
      d.rollen.map((r) => {
        const b = z.zuordnung[r.id];
        return h('td', { class: r.id === d.ich ? 'ist-ich' : null },
          b !== undefined ? h('abbr', { class: 'raci-marke', 'data-raci': b, title: RACI_WORT[b], 'aria-label': `${r.titel}: ${RACI_WORT[b]}` }, b) : null);
      }),
      h('td', { class: 'raci-mandat' }, z.mandat));
  });
  zeige(0);
  return h('figure', { class: 'raci', 'data-pruef': 'raci' },
    h('div', { class: 'raci-rahmen', tabindex: 0, role: 'region', 'aria-label': d.beschriftung.legende },
      h('table', { class: 'raci-tabelle' }, h('thead', null, kopf), h('tbody', null, zeilen))),
    h('figcaption', { class: 'raci-legende' }, RACI_BUCHSTABEN.map((b) => h('span', null, h('b', { class: 'raci-marke', 'data-raci': b, 'aria-hidden': 'true' }, b), ` ${mitTrennstellen(RACI_WORT[b])}`))),
    detail);
}
