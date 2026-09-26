/*
 * Sitzung: der eine Zustand eines Fensters, geändert nur über `wende()` (docs/ARCHITEKTUR.md).
 *
 * `tue(aktion)` wendet die Aktion an, speichert den Stand fürs Weiterlesen (wenn gewünscht) und
 * meldet die Änderung allen Zuhörern. Eine unzulässige Aktion liefert von `wende()` dieselbe
 * Referenz zurück – dann passiert nichts, auch kein Neuzeichnen.
 */

import type { Aktion, StoryModell, Zustand } from '../engine/typen.ts';
import { wende } from '../engine/aktionen.ts';
import { speichere, type SpeicherGriff } from '../engine/speicher.ts';

export type Zuhoerer = (neu: Zustand, alt: Zustand, aktion: Aktion | null) => void;

export interface Sitzung {
  zustand(): Zustand;
  /** Wendet eine Aktion an; true, wenn sich etwas geändert hat. */
  tue(aktion: Aktion): boolean;
  abonniere(fn: Zuhoerer): () => void;
}

export interface SitzungsOptionen {
  /** Speicher fürs Weiterlesen; null = nicht speichern */
  speicher: SpeicherGriff | null;
}

export function erzeugeSitzung(start: Zustand, modell: StoryModell, optionen: SitzungsOptionen): Sitzung {
  let z = start;
  const zuhoerer = new Set<Zuhoerer>();
  return {
    zustand: () => z,
    tue(aktion) {
      const alt = z;
      const neu = wende(z, aktion, modell);
      if (neu === alt) return false;
      z = neu;
      if (optionen.speicher !== null) speichere(z, optionen.speicher);
      for (const fn of [...zuhoerer]) fn(neu, alt, aktion);
      return true;
    },
    abonniere(fn) {
      zuhoerer.add(fn);
      return () => {
        zuhoerer.delete(fn);
      };
    },
  };
}
