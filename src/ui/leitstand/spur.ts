/*
 * Ihre Spur (E1, P5.8): die Kette aller eigenen Entscheidungen über beide Welten.
 *
 * Je Stationspaar (A-Station und ihr Partner in Welt B) eine Zeile: links die Wahl in Welt A, rechts
 * die Wahl in Welt B – „A-Spur gegen B-Spur“. Stationen ohne Partner stehen allein. Die Daten kommen
 * nur aus dem Zustand (`spur`) und den Inhalten; die Anzeige wertet keine Wahl.
 */

import { h } from '../h.ts';
import type { OeffentlicherZustand, SpurEintrag } from '../../engine/typen.ts';
import type { OeffentlicheInhalte } from '../../inhalte/typen.ts';
import { findeEntscheidung, stationsFolge } from '../../engine/graph.ts';

export interface SpurWoerter {
  titel: string;
  hinweis: string;
  leer: string;
  weltA: string;
  weltB: string;
  offen: string;
  umentschieden: (n: number) => string;
  zusammen: (a: number, b: number) => string;
}

export interface SpurZeile {
  /** Station für die Beschriftung (A-Station, sonst die B-Station) */
  station: string;
  a: SpurEintrag | null;
  b: SpurEintrag | null;
}

/**
 * Ordnet die Spur nach der Story-Karte und fasst Partner zusammen (A1 ↔ B1 …). Nur Zeilen mit
 * mindestens einer Wahl; bei mehreren Einträgen einer Station gilt der letzte (die aktuelle Wahl).
 */
export function spurZeilen(spur: readonly SpurEintrag[], inhalte: OeffentlicheInhalte): SpurZeile[] {
  const letzte = new Map<string, SpurEintrag>();
  for (const e of spur) letzte.set(e.station, e);
  const zeilen: SpurZeile[] = [];
  const erledigt = new Set<string>();
  for (const id of stationsFolge(inhalte)) {
    if (erledigt.has(id)) continue;
    const st = inhalte.stationen[id];
    if (st === undefined) continue;
    const partner = st.partner;
    const aId = st.welt === 'B' && partner !== null ? partner : id;
    const bId = st.welt === 'B' ? id : partner;
    erledigt.add(aId);
    if (bId !== null) erledigt.add(bId);
    const a = st.welt === 'B' && partner === null ? null : letzte.get(aId) ?? null;
    const b = bId !== null ? letzte.get(bId) ?? null : st.welt === 'B' ? letzte.get(id) ?? null : null;
    if (a === null && b === null) continue;
    zeilen.push({ station: st.welt === 'B' && partner !== null ? partner : id, a, b });
  }
  return zeilen;
}

function wahl(e: SpurEintrag | null, inhalte: OeffentlicheInhalte, w: SpurWoerter, welt: 'a' | 'b'): HTMLElement {
  const name = welt === 'a' ? w.weltA : w.weltB;
  if (e === null) return h('div', { 'data-welt': welt, class: 'spur-zelle spur-offen' }, h('span', { class: 'nur-sr' }, `${name}: `), w.offen);
  const ent = findeEntscheidung(inhalte, e.entscheidung)?.entscheidung ?? null;
  const opt = ent?.optionen.find((o) => o.id === e.option) ?? null;
  return h('div', { 'data-welt': welt, class: 'spur-zelle' }, h('span', { class: 'nur-sr' }, `${name}: `),
    h('span', { class: 'spur-wahl' }, h('kbd', { class: 'option-taste', 'aria-hidden': 'true' }, e.option), h('span', null, opt?.kurz ?? e.option)),
    e.wechsel > 0 ? h('small', { class: 'spur-wechsel' }, w.umentschieden(e.wechsel)) : null);
}

/** Die Spur als schmales Raster (Seitenleiste, Reiter „Spur“): je Station eine Zeile, darunter A | B. */
export function spurTafel(z: Pick<OeffentlicherZustand, 'spur'>, inhalte: OeffentlicheInhalte, w: SpurWoerter): HTMLElement {
  const zeilen = spurZeilen(z.spur, inhalte);
  if (zeilen.length === 0) return h('p', { class: 'leiste-hinweis', 'data-pruef': 'spur-leer' }, w.leer);
  const inA = zeilen.filter((x) => x.a !== null).length;
  const inB = zeilen.filter((x) => x.b !== null).length;
  return h('section', { class: 'spur-kette', 'data-pruef': 'spur', 'aria-label': w.titel },
    h('p', { class: 'leiste-hinweis' }, w.hinweis),
    h('div', { class: 'spur-kopf', 'aria-hidden': 'true' }, h('span', { 'data-welt': 'a' }, w.weltA), h('span', { 'data-welt': 'b' }, w.weltB)),
    h('ol', { class: 'spur-liste' }, zeilen.map((x) => {
      const st = inhalte.stationen[x.station];
      return h('li', { class: 'spur-paar', 'data-pruef': `spur-${x.station}` },
        h('b', { class: 'spur-station' }, st?.kurztitel ?? x.station, st?.monat !== null && st?.monat !== undefined ? h('small', null, ` · M${st.monat}`) : null),
        h('div', { class: 'spur-seiten' }, wahl(x.a, inhalte, w, 'a'), wahl(x.b, inhalte, w, 'b')));
    })),
    h('p', { class: 'spur-summe' }, w.zusammen(inA, inB)));
}
