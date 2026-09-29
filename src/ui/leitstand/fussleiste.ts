/*
 * Fußleiste des Leitstands (docs/STIL.md „Fußleiste“): Zurück · Fortschritt der Station · Weiter.
 * Gruppen (z. B. die sechs Teile von B3) erscheinen als ein Schritt mit Takten.
 */

import type { OeffentlicherZustand } from '../../engine/typen.ts';
import type { OeffentlicheInhalte } from '../../inhalte/typen.ts';
import { h, attr, text } from '../h.ts';
import { aktuelleStation, gruppiere, schrittPosition, sichtbareSchritte, tafelWelt, weiterAktion, zurueckAktion } from '../anzeige.ts';
import { sym } from '../bausteine/bloecke.ts';

export interface Fussleiste {
  element: HTMLElement;
  setze(z: OeffentlicherZustand): void;
}

export interface FussOptionen {
  inhalte: OeffentlicheInhalte;
  zurueck: (() => void) | null;
  weiter: (() => void) | null;
  zuSchritt: ((index: number) => void) | null;
  woerter: { zurueck: string; weiter: string; ende: string; schritte: string; blaettern: string };
}

export function erzeugeFussleiste(o: FussOptionen): Fussleiste {
  const zurueckKnopf = h('button', { type: 'button', class: 'nav-knopf', 'aria-label': o.woerter.zurueck, 'data-pruef': 'zurueck', onclick: () => o.zurueck?.() },
    sym('pfeilLinks'), h('span', { class: 'nav-knopf-text' }, o.woerter.zurueck));
  const weiterText = h('span', { class: 'nav-knopf-text' }, o.woerter.weiter);
  const weiterKnopf = h('button', { type: 'button', class: 'nav-knopf weiter', 'aria-label': o.woerter.weiter, 'data-pruef': 'weiter', onclick: () => o.weiter?.() },
    weiterText, sym('pfeilRechts'));
  const fortschritt = h('div', { class: 'fortschritt', role: 'group', 'aria-label': o.woerter.schritte });
  // R27: benannte Landmarke – sonst liegt die Leiste außerhalb aller Landmarken (axe „region“)
  const element = h('nav', { class: 'fussleiste', 'aria-label': o.woerter.blaettern }, zurueckKnopf, fortschritt, weiterKnopf);
  let schluessel = '';

  return {
    element,
    setze(z) {
      const st = aktuelleStation(z, o.inhalte);
      const weiterMoeglich = weiterAktion(z, o.inhalte) !== null;
      const zurueckMoeglich = zurueckAktion(z, o.inhalte) !== null;
      attr(zurueckKnopf, 'disabled', !zurueckMoeglich);
      attr(weiterKnopf, 'disabled', !weiterMoeglich);
      const amEnde = st !== null && st.ende && !weiterMoeglich && z.schritt >= sichtbareSchritte(st, z.rolle).length - 1;
      text(weiterText, amEnde ? o.woerter.ende : o.woerter.weiter);
      attr(weiterKnopf, 'aria-label', amEnde ? o.woerter.ende : o.woerter.weiter);
      if (st === null) {
        fortschritt.replaceChildren();
        return;
      }
      const schritte = sichtbareSchritte(st, z.rolle);
      const gruppen = gruppiere(schritte);
      const pos = schrittPosition(schritte, z.schritt);
      const neu = `${st.id}|${z.rolle}|${z.schritt}|${z.ebene}`;
      if (neu === schluessel) return;
      schluessel = neu;
      const welt = tafelWelt(st) ?? 'ab';
      fortschritt.replaceChildren(...gruppen.map((g, gi) => {
        const erster = g.indizes[0] ?? 0;
        const nr = gi + 1;
        const s0 = schritte[erster];
        const ebenen = s0?.art === 'ebenen' ? 4 : 0;
        const takte = g.indizes.length > 1 ? g.indizes.length : ebenen;
        return h('button', {
          type: 'button',
          class: `fortschritt-schritt${nr < pos.nr ? ' ist-erledigt' : ''}`,
          'data-welt': welt,
          'aria-current': nr === pos.nr ? 'step' : null,
          'aria-label': `${nr}: ${g.kurz}`,
          title: g.kurz,
          onclick: o.zuSchritt !== null ? () => o.zuSchritt?.(erster) : null,
        },
        h('span', { class: 'fs-zeile' }, h('span', { class: 'fs-nr' }, String(nr)), h('span', { class: 'fs-titel' }, g.kurz)),
        takte > 1 ? h('span', { class: 'fs-takte', 'aria-hidden': 'true' }, Array.from({ length: takte }, (_, t) => {
          const an = nr < pos.nr || (nr === pos.nr && (ebenen > 0 ? t < Math.max(1, z.ebene) : t < pos.takt));
          return h('i', { class: an ? 'ist-an' : null });
        })) : null);
      }));
    },
  };
}
