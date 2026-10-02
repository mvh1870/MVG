/*
 * Was die Regie an die Leinwand sendet (P16.9, O-46): der öffentliche Stand der Bühne – Bereich, Thema,
 * Werkzeug und der Stand der Story. Regie-Notizen gehören nie hinein. `pruefeBuehne` prüft einen
 * empfangenen Stand, bevor die Leinwand ihn zeichnet (der Kanal prüft keinen Inhalt).
 */

import type { Geschichte } from '../geschichte/typen.ts';
import { leseStand, neuerStand, type Stand } from '../geschichte/engine.ts';

export type BuehnenBereich = 'start' | 'story' | 'theorie' | 'explore';
export const BUEHNEN_BEREICHE: readonly BuehnenBereich[] = ['start', 'story', 'theorie', 'explore'];

export interface Buehne {
  v: 1;
  bereich: BuehnenBereich;
  /** Thema der Theorie (null = Übersicht) */
  thema: string | null;
  /** Explore-Werkzeug (null = erstes) */
  werkzeug: string | null;
  story: Stand;
}

export function neueBuehne(): Buehne {
  return { v: 1, bereich: 'start', thema: null, werkzeug: null, story: neuerStand() };
}

const KENNUNG = /^[a-z0-9][a-z0-9-]{0,40}$/u;

/** Prüft einen empfangenen Stand; Unpassendes ergibt null (die Leinwand zeichnet dann nichts Neues). */
export function pruefeBuehne(roh: unknown, g: Geschichte | null): Buehne | null {
  if (typeof roh !== 'object' || roh === null) return null;
  const r = roh as Record<string, unknown>;
  if (r['v'] !== 1 || !BUEHNEN_BEREICHE.includes(r['bereich'] as BuehnenBereich)) return null;
  const kennung = (x: unknown): string | null | undefined => (x === null ? null : typeof x === 'string' && KENNUNG.test(x) ? x : undefined);
  const thema = kennung(r['thema']);
  const werkzeug = kennung(r['werkzeug']);
  if (thema === undefined || werkzeug === undefined) return null;
  const story = g !== null ? leseStand(g, r['story']) : neuerStand();
  if (story === null) return null;
  // Nur bekannte Felder gehen weiter (eine fremde Eigenschaft im Umschlag erreicht die Zeichnung nicht)
  return { v: 1, bereich: r['bereich'] as BuehnenBereich, thema, werkzeug, story };
}
