/*
 * Lesehilfen ohne DOM für die Bausteine der Theorie: Kopfdaten der Inhalte und Rollenfarben.
 * Rein; geprüft in tests/ui-anzeige.test.ts.
 */

import type { KopfWert } from '../inhalte/typen.ts';

/* ------------------------------------------------------------------ Rollen -- */

/** Rollen-Kennungen der Inhalte → Attributwert `data-rolle` des Stils (docs/STIL.md). */
export type RollenAttr = 'gf' | 'bh' | 'pl' | 'ps' | 'plan' | 'ctl';

const ROLLEN_ATTR: Readonly<Record<string, RollenAttr>> = {
  gf: 'gf',
  bauherr: 'bh',
  pl: 'pl',
  ps: 'ps',
  planung: 'plan',
  controlling: 'ctl',
};

export function rollenAttr(rolle: string | null | undefined): RollenAttr | null {
  if (rolle === null || rolle === undefined) return null;
  return ROLLEN_ATTR[rolle] ?? null;
}

/* ------------------------------------------------------------ Kopfdaten -- */

export function kopfText(kopf: Readonly<Record<string, KopfWert>>, name: string): string | null {
  const w = kopf[name];
  if (typeof w === 'string') return w;
  if (typeof w === 'number') return String(w);
  return null;
}

export function kopfZahl(kopf: Readonly<Record<string, KopfWert>>, name: string): number | null {
  const w = kopf[name];
  if (typeof w === 'number' && Number.isFinite(w)) return w;
  if (typeof w === 'string' && /^-?\d+(?:[.,]\d+)?$/.test(w.trim())) return Number(w.replace(',', '.'));
  return null;
}

export function kopfListe(kopf: Readonly<Record<string, KopfWert>>, name: string): KopfWert[] {
  const w = kopf[name];
  return Array.isArray(w) ? w : [];
}

export function kopfKarte(kopf: Readonly<Record<string, KopfWert>>, name: string): Record<string, KopfWert> {
  const w = kopf[name];
  return w !== null && typeof w === 'object' && !Array.isArray(w) ? w : {};
}

export function istKarte(w: KopfWert | undefined): w is Record<string, KopfWert> {
  return w !== null && w !== undefined && typeof w === 'object' && !Array.isArray(w);
}
