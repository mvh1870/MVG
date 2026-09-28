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
import type {
  Figur, GlossarEintrag, Inhalte, OeffentlicheInhalte, RegieEintrag, Rolle, Station, Szene, TheorieSeite,
} from './typen.ts';

export type * from './typen.ts';

const alle = daten as unknown as Inhalte;

/** Alle Inhalte ohne Regie-Material (Felder aufgezählt, nicht weggelassen). */
export const inhalte: OeffentlicheInhalte = {
  version: alle.version,
  whitepaper: alle.whitepaper,
  fall: alle.fall,
  startseite: alle.startseite,
  rollen: alle.rollen,
  rollenFolge: alle.rollenFolge,
  interessen: alle.interessen,
  start: alle.start,
  stationen: alle.stationen,
  stationsFolge: alle.stationsFolge,
  glossar: alle.glossar,
  theorie: alle.theorie,
  einwaende: alle.einwaende,
  welten: alle.welten,
  abdeckung: alle.abdeckung,
  quellen: alle.quellen,
};

/** Nur für die Regie: Notiz und Leitfragen je Station (`A3`) bzw. Rollenszene (`A3/pl`). */
export function regieInhalte(): Readonly<Record<string, RegieEintrag>> {
  return alle.regie;
}

/** Regie-Material einer Lernseite (P9.2): Notiz und Leitfragen zu Kapitel `nr`. */
export function regieKapitel(nr: number): RegieEintrag | null {
  return alle.regie[`theorie/k${nr}`] ?? null;
}

/** Regie-Material für Station und Rolle: erst die Szene, dann die Station. */
export function regieFuer(station: string, rolle: string | null): { station: RegieEintrag | null; szene: RegieEintrag | null } {
  return {
    station: alle.regie[station] ?? null,
    szene: rolle !== null ? alle.regie[`${station}/${rolle}`] ?? null : null,
  };
}

export function station(id: string): Station | null {
  return inhalte.stationen[id] ?? null;
}

export function szene(stationId: string, rolle: string | null): Szene | null {
  if (rolle === null) return null;
  return inhalte.stationen[stationId]?.szenen[rolle] ?? null;
}

export function rolle(id: string): Rolle | null {
  return inhalte.rollen[id] ?? null;
}

export function figur(id: string): Figur | null {
  return inhalte.fall?.figuren[id] ?? null;
}

export function glossar(id: string): GlossarEintrag | null {
  return inhalte.glossar[id] ?? null;
}

export function theorieSeite(kapitel: number): TheorieSeite | null {
  return inhalte.theorie[`k${String(kapitel).padStart(2, '0')}`] ?? null;
}
