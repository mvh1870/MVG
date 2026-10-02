/*
 * Typisierter Laufzeitzugriff auf die generierte `src/generiert/inhalte.json`.
 *
 * Die Datei entsteht mit `node werkzeuge/inhalte.mjs` (auch als Vorstufe von `npm run bau`); ohne
 * sie lassen sich `tsc` und esbuild nicht ausführen.
 *
 * ZWEI AUSGÄNGE, MIT ABSICHT: `inhalte` enthält alles außer dem Regie-Material, `regieInhalte()`
 * nur das Regie-Material. Die Leinwand-Zeichnung importiert ausschließlich `inhalte` – sie kann
 * Notizen und Leitfragen nicht einmal versehentlich anfassen (docs/ARCHITEKTUR.md).
 */

import daten from '../generiert/inhalte.json' with { type: 'json' };
import type { GeschichteRegie, GlossarEintrag, Inhalte, OeffentlicheInhalte, RegieEintrag } from './typen.ts';

export type * from './typen.ts';

const alle = daten as unknown as Inhalte;

/** Alle Inhalte ohne Regie-Material (Felder aufgezählt, nicht weggelassen). */
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

/** Nur für die Regie: Notiz und Leitfragen je Story-Station (`s3`). */
export function regieGeschichte(id: string): GeschichteRegie | null {
  return alle.geschichteRegie?.[id] ?? null;
}

/** Nur für die Regie: das ganze Regie-Material der Themen. */
export function regieInhalte(): Readonly<Record<string, RegieEintrag>> {
  return alle.regie;
}

/** Regie-Material eines Themas (P9.2): Notiz und Leitfragen zu Kapitel `nr`. */
export function regieKapitel(nr: number): RegieEintrag | null {
  return alle.regie[`theorie/k${nr}`] ?? null;
}

export function glossar(id: string): GlossarEintrag | null {
  return inhalte.glossar[id] ?? null;
}
