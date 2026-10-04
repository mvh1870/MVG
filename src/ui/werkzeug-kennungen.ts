/*
 * Kennungen der neun Explore-Werkzeuge (Adresse `#explore/<werkzeug>`), ohne Oberfläche: Story, Themen und Regie kennen so
 * Reihenfolge, Titel und Kurzsatz eines Werkzeugs, ohne die Fläche „Explore“ (und mit ihr die Themen-Fläche) zu laden.
 * Muss zu `WERKZEUG_TEIL` in werkzeuge/explore.mjs passen (tests/explore-werkzeuge.test.ts).
 */
import type { Werkzeuge } from '../inhalte/typen.ts';

/** Reihenfolge der Kacheln (O-59, Konzept 0): jedes neue Werkzeug neben seinem Geschwister. */
export const WERKZEUGE = ['mcda', 'vorlagen-check', 'matrix', 'risiko-grenzen', 'vorgaenge', 'wegweiser', 'takt', 'monatsbericht', 'glossar'] as const;
export type Werkzeug = (typeof WERKZEUGE)[number];

/** Adress-Kennung → Teil in inhalte/werkzeuge.yaml (feste Tabelle, Konzept Abschnitt 5). */
export const TEIL: Record<Werkzeug, Exclude<keyof Werkzeuge, 'einleitungHtml'>> = {
  mcda: 'mcda', 'vorlagen-check': 'vorlagencheck', matrix: 'matrix', 'risiko-grenzen': 'risikogrenzen', vorgaenge: 'vorgaenge', wegweiser: 'wegweiser', takt: 'takt', monatsbericht: 'monatsbericht', glossar: 'glossar',
};

export function werkzeugAus(id: string | null): Werkzeug {
  return (WERKZEUGE as readonly string[]).includes(id ?? '') ? id as Werkzeug : 'mcda';
}

/** Titel eines Werkzeugs aus den Inhalten (Seitentitel, Regie, Verweise). */
export function werkzeugTitel(w: Werkzeuge | null, id: Werkzeug): string {
  return w?.[TEIL[id]].titel ?? id;
}

/** Die vier Werkzeuge mit Beispielen und Regie-Stand (P18, O-59). */
export const NEUE_WERKZEUGE = ['vorlagen-check', 'wegweiser', 'risiko-grenzen', 'monatsbericht'] as const;
export type NeuesWerkzeug = (typeof NEUE_WERKZEUGE)[number];
export const istNeuesWerkzeug = (id: string | null): id is NeuesWerkzeug => (NEUE_WERKZEUGE as readonly string[]).includes(id ?? '');

/** Kennungen der Beispiele eines der vier neuen Werkzeuge; sonst leer. */
export function beispielKennungen(w: Werkzeuge | null, id: string | null): string[] {
  if (w === null || !istNeuesWerkzeug(id)) return [];
  return w[TEIL[id] as 'vorlagencheck' | 'wegweiser' | 'risikogrenzen' | 'monatsbericht'].beispiele.map((b) => b.id);
}
