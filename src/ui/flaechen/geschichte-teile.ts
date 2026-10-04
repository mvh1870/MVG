/*
 * Kleine Zeichenhelfer der Story, gemeinsam für `geschichte.ts` und die Mini-Bausteine (`geschichte-mini.ts`): damit
 * importieren sich die beiden Dateien nicht gegenseitig (P19.1).
 */

import { gimmick, portraet, type Figur, type GimmickName } from '../../grafik/figuren.ts';
import { h, vonHtml } from '../h.ts';

/* -------------------------------------------------------------- Bilder -- */

export function bildAus(svg: string, klasse: string): HTMLElement {
  return h('span', { class: klasse, 'aria-hidden': 'true' }, vonHtml(svg));
}

/** Porträt (dekorativ: Name und Rolle stehen daneben als Text). */
export function bildnis(figur: Figur, groesse: 'klein' | 'gross' | number = 'klein'): HTMLElement {
  return bildAus(portraet(figur, { groesse, dekorativ: true }), `gs-bildnis gs-bildnis-${typeof groesse === 'number' ? 'mass' : groesse}`);
}

export function gegenstand(name: string | null, groesse = 96, klasse = 'gs-gegenstand'): HTMLElement | null {
  if (name === null) return null;
  return bildAus(gimmick(name as GimmickName, { groesse, dekorativ: true }), klasse);
}
