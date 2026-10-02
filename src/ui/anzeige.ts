/*
 * Lesehilfen ohne DOM für die Bausteine der Theorie: Kopfdaten der Inhalte.
 * Rein; geprüft in tests/ui-anzeige.test.ts.
 */

import type { KopfWert } from '../inhalte/typen.ts';

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
