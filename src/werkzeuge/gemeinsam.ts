/*
 * Gemeinsame Bausteine der vier Rechenkerne in Explore (P18.2, O-59) – rein, ohne DOM, ohne Uhr, ohne Zufall.
 * Ein Kern liefert nur Kennungen (Hinweis-`id`); die sichtbaren Sätze stehen in `inhalte/werkzeuge.yaml`.
 */

/** Ampel eines Werkzeugs: Ergebnis in Worten und Farbe, nie als Punktzahl (O-8). */
export type Ampel = 'gruen' | 'gelb' | 'rot';

/** Ein Befund des Kerns; `id` wählt den Satz aus dem Inhalt, `bezug` nennt Prüfpunkt, Zeile oder Abschnitt. */
export interface Hinweis {
  id: string;
  schwere: 'rot' | 'gelb' | 'info';
  bezug?: string;
}

/** Höchstlänge und Zeichenvorrat eines Werkzeugstands auf dem Kanal Regie → Leinwand (Konzept 0.3, kein Freitext). */
export const STAND_MAX = 80;
const STAND_MUSTER = /^[a-z0-9:;,.-]*$/u;
const BEISPIEL_TEIL = /^b:([a-z0-9][a-z0-9-]{0,40})$/u;

/**
 * Liest einen empfangenen Werkzeugstand `b:<beispiel>[;<schritt>]`. Das Beispiel muss bekannt sein, der Schritt (alles
 * nach dem ersten `;`) zum Muster des Werkzeugs passen. Unpassendes ergibt null: Die Leinwand bleibt beim Beispielanfang.
 */
export function leseWerkzeugStand(roh: unknown, beispiele: readonly string[], schrittMuster?: RegExp): { beispiel: string; schritt: string | null } | null {
  if (typeof roh !== 'string' || roh.length > STAND_MAX || !STAND_MUSTER.test(roh)) return null;
  const trenner = roh.indexOf(';');
  const kopf = trenner < 0 ? roh : roh.slice(0, trenner);
  const schritt = trenner < 0 ? null : roh.slice(trenner + 1);
  const b = BEISPIEL_TEIL.exec(kopf);
  if (!b || !beispiele.includes(b[1] ?? '')) return null;
  if (schritt !== null && (schrittMuster === undefined || !schrittMuster.test(schritt))) return null;
  return { beispiel: b[1] ?? '', schritt };
}
