/*
 * Weiterlesen (E9): Stand und Spur nur lokal im Browser.
 *
 * Jeder Zugriff steht in try/catch: privates Fenster, gesperrte Website-Daten, volle Quota oder
 * `file://` mit Sonderrichtlinie dürfen das Produkt nicht anhalten – ohne Speicher läuft alles
 * weiter, nur ohne Weiterlesen. Ein Stand mit anderer Version oder kaputter Form wird verworfen.
 *
 * Die Engine greift selbst auf keine Plattform-API zu: Den Speicher (`localStorage`) reicht der
 * Einstieg herein (src/main.ts, `standardSpeicher()`); hier gibt es nur den schmalen `SpeicherGriff`.
 */

import type { StoryModell, Zustand } from './typen.ts';
import { ZUSTAND_VERSION, pruefeZustand } from './zustand.ts';

export const SPEICHER_SCHLUESSEL = 'mvg.stand.v1';

/** Der schmale Ausschnitt von `Storage`, den das Weiterlesen braucht. */
export interface SpeicherGriff {
  getItem(schluessel: string): string | null;
  setItem(schluessel: string, wert: string): void;
  removeItem(schluessel: string): void;
}

/** Speichert den Zustand. true, wenn es geklappt hat. */
export function speichere(z: Zustand, speicher: SpeicherGriff | null): boolean {
  if (speicher === null) return false;
  try {
    speicher.setItem(SPEICHER_SCHLUESSEL, JSON.stringify({ version: ZUSTAND_VERSION, zustand: z }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Lädt den gespeicherten Zustand. null bei: kein Speicher, nichts gespeichert, andere Version,
 * kaputte Form oder (mit Modell) Station/Rolle, die es in den Inhalten nicht mehr gibt.
 */
export function lade(speicher: SpeicherGriff | null, modell?: StoryModell): Zustand | null {
  if (speicher === null) return null;
  let text: string | null;
  try {
    text = speicher.getItem(SPEICHER_SCHLUESSEL);
  } catch {
    return null;
  }
  if (text === null) return null;
  let roh: unknown;
  try {
    roh = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof roh !== 'object' || roh === null || (roh as { version?: unknown }).version !== ZUSTAND_VERSION) return null;
  const z = pruefeZustand((roh as { zustand?: unknown }).zustand);
  if (z === null) return null;
  if (modell !== undefined) {
    if (z.station !== null && modell.stationen[z.station] === undefined) return null;
    if (z.rolle !== null && modell.rollen[z.rolle] === undefined) return null;
    if (z.verlauf.some((id) => modell.stationen[id] === undefined)) return null;
  }
  return z;
}

/** Löscht den gespeicherten Stand. */
export function vergiss(speicher: SpeicherGriff | null): boolean {
  if (speicher === null) return false;
  try {
    speicher.removeItem(SPEICHER_SCHLUESSEL);
    return true;
  } catch {
    return false;
  }
}
