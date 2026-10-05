/*
 * Was die Regie an die Leinwand sendet (P16.9, O-46): der öffentliche Stand der Bühne – Bereich, Thema,
 * Werkzeug, der Stand des Werkzeugs (P18.5) und der Stand der Story. Regie-Notizen gehören nie hinein. `pruefeBuehne`
 * prüft einen empfangenen Stand, bevor die Leinwand ihn zeichnet (der Kanal prüft keinen Inhalt).
 */

import type { Geschichte } from '../geschichte/typen.ts';
import { leseStand, neuerStand, type Stand } from '../geschichte/engine.ts';
import { leseStandVorlage } from '../werkzeuge/vorlagen-check.ts';
import { leseStandWegweiser } from '../werkzeuge/wegweiser.ts';
import { leseStandRisiko } from '../werkzeuge/risiko-grenzen.ts';
import { leseStandBericht } from '../werkzeuge/monatsbericht.ts';

export type BuehnenBereich = 'start' | 'story' | 'theorie' | 'explore';
export const BUEHNEN_BEREICHE: readonly BuehnenBereich[] = ['start', 'story', 'theorie', 'explore'];

export interface Buehne {
  v: 1;
  bereich: BuehnenBereich;
  /** Thema der Theorie (null = Übersicht) */
  thema: string | null;
  /** Explore-Werkzeug (null = erstes) */
  werkzeug: string | null;
  /**
   * Stand des Werkzeugs (P18.5, Konzept 0.3): `b:<beispiel>[;<schritt>]` – nur die Kennung des Beispiels und der Schritt,
   * nie Freitext, höchstens 80 Zeichen aus `a-z 0-9 : ; , . -`. null = Beispielanfang. Gelesen über `leseWerkzeugStand`.
   */
  werkzeugStand: string | null;
  story: Stand;
  /**
   * Die Leinwand zeigt das Entscheidungsbuch statt des Schritts (P19.4): nur ein Schalter, kein Inhalt – das Buch zeichnet die Leinwand aus
   * dem Stand der Story, ohne Bedienung, ohne „neu“ und ohne die Antwort. Fehlt das Feld, ist es aus.
   */
  buch?: boolean;
}

export function neueBuehne(): Buehne {
  return { v: 1, bereich: 'start', thema: null, werkzeug: null, werkzeugStand: null, story: neuerStand() };
}

/** Leser je Werkzeug mit Stand auf dem Kanal: die Kerne in src/werkzeuge/ (sie nutzen `leseWerkzeugStand` aus gemeinsam.ts und kennen die Schritte ihres Werkzeugs). */
const LESER: Readonly<Record<string, (roh: unknown, beispiele: readonly string[]) => { beispiel: string; schritt: string | null } | null>> = {
  'vorlagen-check': leseStandVorlage,
  wegweiser: leseStandWegweiser,
  'risiko-grenzen': leseStandRisiko,
  monatsbericht: leseStandBericht,
};

/**
 * Prüft einen Werkzeugstand: nur für eines der vier Werkzeuge, nur Beispiel und Schritt in der Form des Werkzeugs; ist
 * `beispiele` gegeben, muss das Beispiel dort stehen. Alles andere ergibt null (die Leinwand zeigt den Beispielanfang).
 */
export function pruefeWerkzeugStand(roh: unknown, werkzeug: string | null, beispiele?: (werkzeug: string) => readonly string[]): string | null {
  if (typeof roh !== 'string' || werkzeug === null) return null;
  if (!Object.hasOwn(LESER, werkzeug)) return null; // „constructor“, „toString“ u. ä. sind keine Werkzeuge (R79)
  const lese = LESER[werkzeug];
  if (lese === undefined) return null;
  const kennung = /^b:([a-z0-9][a-z0-9-]{0,40})(?:;|$)/u.exec(roh)?.[1];
  if (kennung === undefined) return null;
  const erlaubt = beispiele !== undefined ? beispiele(werkzeug) : [kennung];
  return lese(roh, erlaubt) !== null ? roh : null;
}

const KENNUNG = /^[a-z0-9][a-z0-9-]{0,40}$/u;

/** Prüft einen empfangenen Stand; Unpassendes ergibt null (die Leinwand zeichnet dann nichts Neues). */
export function pruefeBuehne(roh: unknown, g: Geschichte | null, beispiele?: (werkzeug: string) => readonly string[]): Buehne | null {
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
  // Ein älterer Stand ohne `werkzeugStand` gilt weiter (Beispielanfang); Unpassendes wird still zu null
  const werkzeugStand = pruefeWerkzeugStand(r['werkzeugStand'], werkzeug, beispiele);
  return { v: 1, bereich: r['bereich'] as BuehnenBereich, thema, werkzeug, werkzeugStand, story, ...(r['buch'] === true && r['bereich'] === 'story' ? { buch: true } : {}) };
}
