/*
 * Typisierter Laufzeitzugriff auf die generierte `src/generiert/inhalte.json`.
 *
 * Die Datei entsteht mit `node werkzeuge/inhalte.mjs` (auch als Vorstufe von `npm run bau`); ohne
 * sie lassen sich `tsc` und esbuild nicht ausführen.
 *
 * Moderationsnotizen und Leitfragen gibt es seit O-65 nicht mehr; `inhalte` enthält alles, was die Seite zeigt.
 */

import daten from '../generiert/inhalte.json' with { type: 'json' };
import type { GlossarEintrag, Inhalte, OeffentlicheInhalte } from './typen.ts';

export type * from './typen.ts';

const alle = daten as unknown as Inhalte;

/** Alle Inhalte (Felder aufgezählt). */
export const inhalte: OeffentlicheInhalte = {
  version: alle.version,
  abbildungen: alle.abbildungen,
  startseite: alle.startseite,
  glossar: alle.glossar,
  theorie: alle.theorie,
  kompass: alle.kompass ?? [],
  abdeckung: alle.abdeckung,
  geschichte: alle.geschichte ?? null,
  werkzeuge: alle.werkzeuge ?? null,
};

export function glossar(id: string): GlossarEintrag | null {
  return inhalte.glossar[id] ?? null;
}
