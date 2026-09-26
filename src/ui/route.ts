/*
 * Hash-Router (rein, ohne DOM): welche Fläche ein Adress-Anker meint.
 *
 *   #start · #story · #theorie · #theorie/k1 (auch k01) · #regie · #leinwand
 *
 * Alles andere – auch ein leerer Anker oder ein Kapitel außerhalb 1–13 – führt zur Startseite
 * (ruhiger Einstieg, O-21).
 */

export type Route =
  | { flaeche: 'start' }
  | { flaeche: 'story' }
  | { flaeche: 'theorie'; kapitel: number | null }
  | { flaeche: 'regie' }
  | { flaeche: 'leinwand' };

export const START: Route = { flaeche: 'start' };

export function leseRoute(hash: string): Route {
  let roh = hash.startsWith('#') ? hash.slice(1) : hash;
  try {
    roh = decodeURIComponent(roh);
  } catch {
    return START;
  }
  const teile = roh.trim().toLowerCase().split('/').filter((t) => t !== '');
  const [kopf, zweites, ...rest] = teile;
  if (rest.length > 0) return START;
  switch (kopf) {
    case 'story':
    case 'regie':
    case 'leinwand':
      return zweites === undefined ? { flaeche: kopf } : START;
    case 'theorie': {
      if (zweites === undefined) return { flaeche: 'theorie', kapitel: null };
      const m = /^k(\d{1,2})$/.exec(zweites);
      const nr = m ? Number(m[1]) : NaN;
      return Number.isInteger(nr) && nr >= 1 && nr <= 13 ? { flaeche: 'theorie', kapitel: nr } : START;
    }
    default:
      return START;
  }
}

export function routeHash(r: Route): string {
  switch (r.flaeche) {
    case 'theorie':
      return r.kapitel === null ? '#theorie' : `#theorie/k${r.kapitel}`;
    default:
      return `#${r.flaeche}`;
  }
}

export function gleicheRoute(a: Route, b: Route): boolean {
  return routeHash(a) === routeHash(b);
}
