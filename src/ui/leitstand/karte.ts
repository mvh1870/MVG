/*
 * Story-Karte (docs/STIL.md „Story-Karte“): zwei Spuren – Welt A durchgezogen (Koralle), Welt B
 * gestrichelt (Türkis) –, die Stationen aus den Inhalten (Reihenfolge `stationsFolge`) und unter der
 * aktuellen Station ihre Schritte als Knöpfe.
 */

import type { OeffentlicherZustand } from '../../engine/typen.ts';
import type { OeffentlicheInhalte, Station } from '../../inhalte/typen.ts';
import { h, ersetze } from '../h.ts';
import { gruppiere, schrittPosition, sichtbareSchritte, tafelWelt } from '../anzeige.ts';

export interface Karte {
  element: HTMLElement;
  setze(z: OeffentlicherZustand): void;
}

type Spur = 'start' | 'linie' | 'ende' | 'keine';

/** Spurverlauf je Station: wo Welt A und Welt B beginnen und enden. */
export function spuren(folge: readonly Station[]): { a: Spur; b: Spur }[] {
  const inA = folge.map((st, i) => i === 0 || st.welt === 'A' || st.vergleich !== null);
  const inB = folge.map((st) => st.welt === 'B' || st.vergleich !== null || (st.welt === 'A' && st.partner !== null));
  const lauf = (bits: boolean[]): Spur[] => {
    const erste = bits.indexOf(true);
    const letzte = bits.lastIndexOf(true);
    return bits.map((_, i) => {
      if (erste < 0 || i < erste || i > letzte) return 'keine';
      if (i === erste && i === letzte) return 'linie';
      if (i === erste) return 'start';
      if (i === letzte) return 'ende';
      return 'linie';
    });
  };
  const a = lauf(inA);
  const b = lauf(inB);
  return folge.map((_, i) => ({ a: a[i] ?? 'keine', b: b[i] ?? 'keine' }));
}

export function erzeugeKarte(inhalte: OeffentlicheInhalte, beiSchritt: ((index: number) => void) | null, woerter: { karte: string; station: string; monat: string; rolle: string }): Karte {
  const jetzt = h('div', { class: 'karte-jetzt' });
  const meta = h('div', { class: 'karte-meta' });
  const liste = h('ol', { class: 'zeitleiste' });
  const element = h('nav', { class: 'story-karte', 'aria-label': woerter.karte, 'data-pruef': 'story-karte' },
    h('div', { class: 'karte-kopf' }, h('div', { class: 'karte-kicker' }, woerter.karte), jetzt, meta),
    liste);
  const folge = inhalte.stationsFolge.map((id) => inhalte.stationen[id]).filter((st): st is Station => st !== undefined);
  const lauf = spuren(folge);

  return {
    element,
    setze(z) {
      const st = z.station !== null ? inhalte.stationen[z.station] ?? null : null;
      const welt = st?.vergleich !== null && st !== null ? (z.vergleich >= 0.5 ? 'b' : 'ab') : tafelWelt(st) ?? 'a';
      jetzt.setAttribute('data-welt', welt);
      ersetze(jetzt, h('span', { class: 'led schleife' }), h('span', null, h('b', null, welt === 'b' ? 'Welt B' : welt === 'ab' ? 'Welt A ⟷ B' : 'Welt A')));
      const rolle = z.rolle !== null ? inhalte.rollen[z.rolle]?.kurztitel ?? z.rolle : null;
      const nr = /(\d+)$/.exec(st?.id ?? '')?.[1];
      ersetze(meta,
        [nr !== undefined ? `${woerter.station} ${nr}` : st?.kurztitel ?? '', st?.monat !== null && st?.monat !== undefined ? ` · ${woerter.monat} ${st.monat}` : ''].join(''),
        rolle !== null ? [h('br'), `${woerter.rolle}: ${rolle}`] : null);

      const besucht = new Set(z.verlauf);
      const zeilen: HTMLElement[] = [];
      folge.forEach((station, i) => {
        const aktuell = station.id === z.station;
        const zustand = aktuell ? 'ist-aktuell' : besucht.has(station.id) ? 'ist-erledigt' : 'ist-kuenftig';
        const sp = lauf[i] ?? { a: 'keine', b: 'keine' };
        const knoten: Node[] = [];
        if (station.vergleich !== null) {
          knoten.push(h('i', { class: `knoten knoten-klein${aktuell ? ' ist-aktuell' : ''}`, 'data-welt': 'ab' }));
        } else if (station.welt === 'B') {
          knoten.push(h('i', { class: `knoten knoten-b${besucht.has(station.id) ? ' ist-erleuchtet' : ''}${aktuell ? ' ist-aktuell' : ''}` }));
        } else {
          knoten.push(h('i', { class: `knoten knoten-a${aktuell ? ' ist-gross ist-aktuell' : ''}` }));
          if (station.partner !== null) knoten.push(h('i', { class: `knoten knoten-b${station.partner !== null && besucht.has(station.partner) ? ' ist-erleuchtet' : ''}` }));
        }
        const nummer = /(\d+)$/.exec(station.id)?.[1];
        zeilen.push(h('li', {
          class: `station ${zustand}${z.freigeschaltet.weltB ? ' ist-b-erleuchtet' : ''}`,
          'data-a': sp.a,
          'data-b': sp.b,
          'aria-current': aktuell ? 'location' : null,
        },
        h('span', { class: 'spur', 'aria-hidden': 'true' }, h('i', { class: 'spur-a' }), h('i', { class: 'spur-b' }), knoten),
        nummer !== undefined && station.vergleich === null ? h('span', { class: 'station-nr' }, nummer) : null,
        h('span', { class: 'station-titel' }, station.kurztitel || station.titel),
        station.monat !== null && station.art !== 'prolog' ? h('span', { class: 'station-meta' }, `M${station.monat}`, h('span', { class: 'nur-sr' }, ` (${woerter.monat} ${station.monat})`)) : null));
        if (aktuell) {
          const schritte = sichtbareSchritte(station, z.rolle);
          const gruppen = gruppiere(schritte);
          const pos = schrittPosition(schritte, z.schritt);
          const ent = z.rolle !== null ? station.szenen[z.rolle]?.entscheidung ?? null : null;
          const wahl = ent !== null ? z.entscheidungen[ent.id] ?? null : null;
          const w = tafelWelt(station) ?? 'a';
          zeilen.push(h('li', { class: 'station-schritte' }, h('ol', { class: 'schritte' }, gruppen.map((g, gi) => {
            const erster = g.indizes[0] ?? 0;
            const s0 = schritte[erster];
            const istAktuell = gi + 1 === pos.nr;
            const mitWahl = s0?.art === 'entscheidung' && wahl !== null;
            return h('li', null, h('button', {
              type: 'button',
              class: 'station',
              'data-a': 'linie',
              'data-b': 'linie',
              'aria-current': istAktuell ? 'step' : null,
              'aria-label': `${gi + 1}: ${g.kurz}${mitWahl ? `, ${wahl}` : ''}`,
              onclick: beiSchritt !== null ? () => beiSchritt(erster) : null,
            },
            h('span', { class: 'spur', 'aria-hidden': 'true' }, h('i', { class: 'spur-a' }), h('i', { class: 'spur-b' }),
              mitWahl ? h('i', { class: 'knoten knoten-klein knoten-wahl', 'data-welt': w }, wahl) : h('i', { class: `knoten knoten-klein${istAktuell ? ' ist-aktuell' : gi + 1 > pos.nr ? ' ist-offen' : ''}`, 'data-welt': w })),
            h('span', { class: 'schritt-nr' }, String(gi + 1)),
            h('span', { class: 'station-titel' }, g.kurz)));
          }))));
        }
      });
      liste.replaceChildren(...zeilen);
    },
  };
}
