/*
 * Story-Karte (docs/STIL.md „Story-Karte“): zwei Spuren – Welt A durchgezogen (Koralle), Welt B
 * gestrichelt (Türkis) –, die Stationen aus den Inhalten (Reihenfolge `stationsFolge`) und unter der
 * aktuellen Station ihre Schritte als Knöpfe.
 */

import type { OeffentlicherZustand } from '../../engine/typen.ts';
import type { OeffentlicheInhalte, Station } from '../../inhalte/typen.ts';
import { h, attr, ersetze, mitTrennstellen } from '../h.ts';
import { sym } from '../bausteine/bloecke.ts';
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

/** LPH-Stand für das Band: die aktuelle Station, sonst die zuletzt besuchte Station mit LPH. */
export function lphStand(z: Pick<OeffentlicherZustand, 'station' | 'verlauf'>, inhalte: Pick<OeffentlicheInhalte, 'stationen'>): number | null {
  const ids = [...z.verlauf];
  if (z.station !== null && ids[ids.length - 1] !== z.station) ids.push(z.station);
  for (let i = ids.length - 1; i >= 0; i--) {
    const lph = inhalte.stationen[ids[i] ?? '']?.lph ?? null;
    if (lph !== null) return lph;
  }
  return null;
}

/** Umschalter und Wege unter der Karte (P7.2, E8): Express-Pfad an/aus, Explore nach dem Ende. */
export interface KartenWege {
  /** null = nur Anzeige (Leinwand) */
  beiExpress: ((an: boolean) => void) | null;
  woerter: { express: string; expressHinweis: string; explore: string };
}

export function erzeugeKarte(inhalte: OeffentlicheInhalte, beiSchritt: ((index: number) => void) | null, woerter: { karte: string; station: string; monat: string; rolle: string; lphBand: string; lphJetzt: string; lphAbgeschlossen: string }, wege: KartenWege | null = null): Karte {
  const jetzt = h('div', { class: 'karte-jetzt' });
  const meta = h('div', { class: 'karte-meta' });
  const liste = h('ol', { class: 'zeitleiste' });
  const band = h('ol', { class: 'lph-band', 'aria-label': woerter.lphBand, 'data-pruef': 'lph-band' });
  const lphJetzt = h('p', { class: 'lph-jetzt', 'aria-hidden': 'true', 'data-pruef': 'lph-jetzt' });
  const expressKnopf = wege?.beiExpress != null ? h('button', {
    type: 'button', class: 'karte-express', 'aria-pressed': 'false', 'data-pruef': 'karte-express', title: wege.woerter.expressHinweis, 'aria-describedby': 'karte-express-hinweis',
    onclick: () => wege.beiExpress?.(expressKnopf?.getAttribute('aria-pressed') !== 'true'),
  }, h('span', { class: 'karte-express-schalter', 'aria-hidden': 'true' }), wege.woerter.express) : null;
  const expressHinweis = expressKnopf !== null && wege !== null ? h('span', { class: 'nur-sr', id: 'karte-express-hinweis' }, wege.woerter.expressHinweis) : null;
  const exploreWeg = wege?.beiExpress != null ? h('a', { class: 'karte-explore', href: '#explore', hidden: true, 'data-pruef': 'karte-explore' }, sym('pfeilRechts'), wege.woerter.explore) : null;
  const element = h('nav', { class: 'story-karte', 'aria-label': woerter.karte, 'data-pruef': 'story-karte' },
    h('div', { class: 'karte-kopf' }, h('div', { class: 'karte-kicker' }, woerter.karte), jetzt, meta, band, lphJetzt),
    liste,
    expressKnopf !== null || exploreWeg !== null ? h('div', { class: 'karte-wege' }, expressKnopf, expressHinweis, exploreWeg) : null);
  const folge = inhalte.stationsFolge.map((id) => inhalte.stationen[id]).filter((st): st is Station => st !== undefined);
  const lauf = spuren(folge);

  return {
    element,
    setze(z) {
      if (expressKnopf !== null) {
        expressKnopf.hidden = z.rolle === null;
        attr(expressKnopf, 'aria-pressed', z.interessen.includes('express') ? 'true' : 'false');
      }
      if (exploreWeg !== null) exploreWeg.hidden = !z.freigeschaltet.explore;
      const st = z.station !== null ? inhalte.stationen[z.station] ?? null : null;
      const welt = st?.vergleich !== null && st !== null ? (z.vergleich >= 0.5 ? 'b' : 'ab') : tafelWelt(st) ?? 'a';
      jetzt.setAttribute('data-welt', welt);
      element.setAttribute('data-welt', welt);
      ersetze(jetzt, h('span', { class: 'led schleife' }), h('span', null, h('b', null, welt === 'b' ? 'Welt B' : welt === 'ab' ? 'Welt A ⟷ B' : 'Welt A')));
      const rolle = z.rolle !== null ? inhalte.rollen[z.rolle]?.kurztitel ?? z.rolle : null;
      const nr = /(\d+)$/.exec(st?.id ?? '')?.[1];
      ersetze(meta,
        [nr !== undefined ? `${woerter.station} ${nr}` : st?.kurztitel ?? '', st?.monat !== null && st?.monat !== undefined ? ` · ${woerter.monat} ${st.monat}` : ''].join(''),
        rolle !== null ? [h('br'), `${woerter.rolle}: ${rolle}`] : null);

      // LPH-Band: Stand der aktuellen Station, sonst der letzten besuchten mit LPH (Wendepunkt, Enden)
      const lph = lphStand(z, inhalte);
      band.hidden = lph === null || inhalte.whitepaper.lph.length === 0;
      lphJetzt.hidden = band.hidden;
      const phase = inhalte.whitepaper.lph.find((p) => p.nr === lph);
      lphJetzt.textContent = phase !== undefined ? `LPH ${phase.nr} · ${phase.name}` : '';
      band.replaceChildren(...inhalte.whitepaper.lph.map((p) => {
        const zustand = lph === null ? '' : p.nr < lph ? ' ist-erledigt' : '';
        const jetztHier = p.nr === lph;
        return h('li', { class: `lph${zustand}`, 'aria-current': jetztHier ? 'step' : null, title: `LPH ${p.nr} · ${p.name}`, 'data-lph': String(p.nr) },
          h('b', { 'aria-hidden': 'true' }, String(p.nr)),
          h('span', { class: 'nur-sr' }, `LPH ${p.nr} ${p.name}${jetztHier ? ` (${woerter.lphJetzt})` : lph !== null && p.nr < lph ? ` (${woerter.lphAbgeschlossen})` : ''}`));
      }));

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
        // R49: weiche Trennstellen – „Wirkungsketten“ füllte die schmale Karte (981 px) zu 98 %
        h('span', { class: 'station-titel' }, mitTrennstellen(station.kurztitel || station.titel)),
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
            h('span', { class: 'station-titel' }, mitTrennstellen(g.kurz))));
          }))));
        }
      });
      liste.replaceChildren(...zeilen);
    },
  };
}
