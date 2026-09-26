/*
 * Kleines Story-Modell für die Engine-Tests (keine eigenen Tests hier; die Datei wird von
 * tests/engine.test.ts und tests/engine-graph.test.ts importiert). Unabhängig von den echten
 * Inhalten, damit Inhaltsänderungen die Engine-Tests nicht brechen.
 *
 *   p (Prolog: Rollenwahl, Interessen) → a1 (Welt A, Entscheidung A–D, Zeitsprung „info“)
 *     → v (Vergleich a1/b1, schaltet Welt B frei) → b1 (Welt B, Frage „reife“, Rückbezug auf a1, Ende)
 */

import type { ModellStation, StoryModell, WirkEintrag, Zustand } from '../src/engine/typen.ts';

const setze = (schluessel: WirkEintrag['schluessel'], wert: WirkEintrag['wert'], hinweis: string | null = null): WirkEintrag =>
  ({ schluessel, art: 'setze', wert, hinweis });
const aendere = (schluessel: WirkEintrag['schluessel'], wert: number): WirkEintrag =>
  ({ schluessel, art: 'aendere', wert, hinweis: null });

export const START_A: WirkEintrag[] = [
  setze('entscheidungsfaehigkeit', 2),
  setze('kostenunsicherheit', 'hoch'),
  setze('offeneRisiken', 7),
  setze('ungeklaerteEntscheidungen', 3),
  setze('terminrisiko', 'mittel'),
];

export const START_B: WirkEintrag[] = [
  setze('entscheidungsfaehigkeit', 4),
  setze('kostenunsicherheit', 'mittel'),
  setze('offeneRisiken', 7, '1 neu bewertet'),
  setze('ungeklaerteEntscheidungen', 1, 'ENT-017, mit Frist'),
  setze('terminrisiko', 'mittel'),
];

function station(teil: Partial<ModellStation> & Pick<ModellStation, 'id'>): ModellStation {
  return {
    art: 'station', welt: null, schritte: [], weiter: [], ende: false, schaltetFrei: [], statusStart: null,
    vergleich: null, partner: null, infos: [], szenen: {},
    ...teil,
  };
}

export function testModell(): StoryModell {
  return {
    start: 'p',
    rollen: {
      pl: { id: 'pl', spielbar: true },
      gf: { id: 'gf', spielbar: false },
    },
    interessen: [{ id: 'kosten' }, { id: 'risiko' }],
    stationen: {
      p: station({
        id: 'p', art: 'prolog',
        schritte: [{ id: 'rolle', art: 'rollenwahl' }, { id: 'int', art: 'interessenwahl' }],
        weiter: [{ ziel: 'a1', wenn: null }],
      }),
      a1: station({
        id: 'a1', welt: 'A', partner: 'b1', statusStart: START_A,
        schritte: [
          { id: 'einstieg', art: 'text' },
          { id: 'lage', art: 'lage' },
          { id: 'entscheidung', art: 'entscheidung' },
          { id: 'konsequenz', art: 'konsequenz' },
        ],
        infos: [{ id: 'info', wirkung: [setze('terminrisiko', 'hoch')] }],
        weiter: [{ ziel: 'v', wenn: null }],
        szenen: {
          pl: {
            rolle: 'pl',
            entscheidung: {
              id: 'a1/pl',
              optionen: [
                { id: 'A', kurz: 'Weiterarbeiten', wirkung: [setze('ungeklaerteEntscheidungen', 4), setze('kostenunsicherheit', 'sehr hoch')] },
                { id: 'B', kurz: 'Vorlage verlangen', wirkung: [setze('terminrisiko', 'hoch')] },
                { id: 'C', kurz: 'Eskalieren', wirkung: [aendere('entscheidungsfaehigkeit', -1)] },
                { id: 'D', kurz: 'Prognose aktualisieren', wirkung: [aendere('kostenunsicherheit', 1)] },
              ],
            },
            fragen: [],
            rueckbezug: null,
          },
        },
      }),
      v: station({
        id: 'v', art: 'vergleich', vergleich: { a: 'a1', b: 'b1' }, schaltetFrei: ['weltB'],
        schritte: [{ id: 'regler', art: 'vergleich' }],
        weiter: [{ ziel: 'b1', wenn: null }],
      }),
      b1: station({
        id: 'b1', welt: 'B', partner: 'a1', statusStart: START_B, ende: true,
        schritte: [
          { id: 'signal', art: 'text' },
          { id: 'vorlage', art: 'text' },
          { id: 'rueckbezug', art: 'rueckbezug' },
        ],
        szenen: {
          pl: {
            rolle: 'pl',
            entscheidung: null,
            fragen: [{ id: 'reife', antworten: [{ id: 'ja' }, { id: 'nein' }] }],
            rueckbezug: {
              auf: 'a1/pl',
              texte: { A: '<p>zu A</p>', B: '<p>zu B</p>', C: '<p>zu C</p>', D: '<p>zu D</p>' },
              ohne: '<p>ohne Wahl</p>',
            },
          },
        },
      }),
    },
  };
}

/** Friert einen Wert tief ein: jede Veränderung durch den Reducer würfe dann (strikter Modus). */
export function friere<T>(x: T): T {
  if (x !== null && typeof x === 'object' && !Object.isFrozen(x)) {
    Object.freeze(x);
    for (const v of Object.values(x as Record<string, unknown>)) friere(v);
  }
  return x;
}

/** Wendet eine Folge von Aktionen an und friert jeden Zwischenstand ein. */
export function spiele(
  wende: (z: Zustand, a: import('../src/engine/typen.ts').Aktion) => Zustand,
  z: Zustand,
  aktionen: import('../src/engine/typen.ts').Aktion[],
): Zustand {
  let jetzt = friere(z);
  for (const a of aktionen) jetzt = friere(wende(jetzt, a));
  return jetzt;
}
