/*
 * Entscheidungsgedächtnis: Welt B zitiert die Wahl aus Welt A („Damals haben Sie …“, O-2).
 */

import type { ModellOption, StoryModell, Zustand } from './typen.ts';
import { findeEntscheidung, loeseEntscheidung } from './graph.ts';

export interface FruehereWahl {
  entscheidung: string;
  station: string;
  option: ModellOption;
}

/** Die frühere Wahl zu einer Entscheidung (Kennung oder Station, dann mit der gespielten Rolle). */
export function fruehereWahl(
  z: Pick<Zustand, 'entscheidungen' | 'rolle'>,
  modell: StoryModell,
  ref: string,
  rolle: string | null = z.rolle,
): FruehereWahl | null {
  const id = loeseEntscheidung(modell, ref, rolle);
  if (id === null) return null;
  const gefunden = findeEntscheidung(modell, id);
  const wahl = z.entscheidungen[id];
  if (gefunden === null || wahl === undefined) return null;
  const option = gefunden.entscheidung.optionen.find((o) => o.id === wahl);
  if (option === undefined) return null;
  return { entscheidung: id, station: gefunden.station, option };
}

export interface Rueckbezug {
  /** HTML des passenden Rückbezugs */
  html: string;
  /** gewählte Option oder null (dann ist `html` der Text für „ohne Wahl“) */
  option: string | null;
  /** Kurzform der gewählten Option („Weiterarbeiten“) */
  kurz: string | null;
  entscheidung: string;
}

/**
 * Der Rückbezug-Text der Szene (Station × Rolle) passend zur früheren Wahl. null, wenn die Szene
 * keinen Rückbezug hat oder weder eine Wahl noch ein Text „ohne“ vorliegt.
 */
export function rueckbezug(
  z: Pick<Zustand, 'entscheidungen' | 'rolle' | 'station'>,
  modell: StoryModell,
  station: string | null = z.station,
  rolle: string | null = z.rolle,
): Rueckbezug | null {
  if (station === null || rolle === null) return null;
  const rb = modell.stationen[station]?.szenen[rolle]?.rueckbezug ?? null;
  if (rb === null) return null;
  const wahl = fruehereWahl(z, modell, rb.auf, rolle);
  if (wahl !== null) {
    const html = rb.texte[wahl.option.id];
    if (html !== undefined) return { html, option: wahl.option.id, kurz: wahl.option.kurz, entscheidung: wahl.entscheidung };
  }
  if (rb.ohne !== null) return { html: rb.ohne, option: null, kurz: null, entscheidung: rb.auf };
  return null;
}
