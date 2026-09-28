/*
 * Hash-Router (rein, ohne DOM): welche Fläche ein Adress-Anker meint.
 *
 *   #start · #story · #story/A3 (Permalink auf eine Station) · #theorie · #theorie/k1 (auch k01)
 *   · #theorie/k2/2.4 (Abschnitt) · #theorie/k4/k4.2-p3 (Absatz, P10.1) · #theorie/impressum
 *   · #explore · #regie · #leinwand · #hilfe · #hilfe/<seite> (P13, O-31: Kapitel oder Unterkapitel der Hilfe)
 *
 * Alles andere – auch ein leerer Anker oder ein Kapitel außerhalb 1–13 – führt zur Startseite
 * (ruhiger Einstieg, O-21). Groß-/Kleinschreibung zählt nicht; die Station kommt klein zurück und
 * wird von der Oberfläche gegen die Stationen aufgelöst.
 */

export type Route =
  | { flaeche: 'start' }
  | { flaeche: 'story'; station: string | null }
  | { flaeche: 'theorie'; kapitel: number | null; abschnitt: string | null }
  | { flaeche: 'explore' }
  | { flaeche: 'hilfe'; seite: string | null }
  | { flaeche: 'regie' }
  | { flaeche: 'leinwand' };

export const START: Route = { flaeche: 'start' };

/** Abschnitt-Kennung des Impressums auf der Kapitelliste */
export const IMPRESSUM = 'impressum';

/** Ist die Abschnitt-Angabe einer Theorie-Route eine Absatz-ID (k4.2-p3)? */
export const istAbsatzId = (a: string): boolean => /^k\d{1,2}(?:\.\d{1,2}){0,3}-[pltb]\d{1,3}$/u.test(a);

const STATION = /^[a-z0-9][a-z0-9-]*$/u;

export function leseRoute(hash: string): Route {
  let roh = hash.startsWith('#') ? hash.slice(1) : hash;
  try {
    roh = decodeURIComponent(roh);
  } catch {
    return START;
  }
  const teile = roh.trim().toLowerCase().split('/').filter((t) => t !== '');
  const [kopf, zweites, drittes, ...rest] = teile;
  if (rest.length > 0) return START;
  switch (kopf) {
    case 'story':
      if (drittes !== undefined) return START;
      if (zweites === undefined) return { flaeche: 'story', station: null };
      return STATION.test(zweites) ? { flaeche: 'story', station: zweites } : START;
    case 'hilfe':
      if (drittes !== undefined) return START;
      if (zweites === undefined) return { flaeche: 'hilfe', seite: null };
      return STATION.test(zweites) ? { flaeche: 'hilfe', seite: zweites } : START;
    case 'explore':
    case 'regie':
    case 'leinwand':
      return zweites === undefined ? { flaeche: kopf } : START;
    case 'theorie': {
      if (zweites === undefined) return { flaeche: 'theorie', kapitel: null, abschnitt: null };
      // Impressum mit Fassung und Änderungsstand (P10.1) auf der Kapitelliste
      if (zweites === IMPRESSUM) return drittes === undefined ? { flaeche: 'theorie', kapitel: null, abschnitt: IMPRESSUM } : START;
      const m = /^k(\d{1,2})$/u.exec(zweites);
      const nr = m ? Number(m[1]) : NaN;
      if (!(Number.isInteger(nr) && nr >= 1 && nr <= 13)) return START;
      if (drittes === undefined) return { flaeche: 'theorie', kapitel: nr, abschnitt: null };
      // Absatz „k4.2-p3“ (Permalink der Zitierfunktion) muss zum Kapitel gehören
      if (new RegExp(`^k${nr}(?:\\.\\d{1,2}){0,3}-[pltb]\\d{1,3}$`, 'u').test(drittes)) return { flaeche: 'theorie', kapitel: nr, abschnitt: drittes };
      // Abschnitt „2.4“ (auch „k2.4“) muss zum Kapitel gehören
      const a = drittes.replace(/^k/u, '');
      return new RegExp(`^${nr}(?:\\.\\d{1,2}){1,3}$`, 'u').test(a) ? { flaeche: 'theorie', kapitel: nr, abschnitt: a } : START;
    }
    default:
      return START;
  }
}

export function routeHash(r: Route): string {
  switch (r.flaeche) {
    case 'story':
      return r.station === null ? '#story' : `#story/${r.station}`;
    case 'hilfe':
      return r.seite === null ? '#hilfe' : `#hilfe/${r.seite}`;
    case 'theorie':
      if (r.kapitel === null) return r.abschnitt === IMPRESSUM ? `#theorie/${IMPRESSUM}` : '#theorie';
      return r.abschnitt === null ? `#theorie/k${r.kapitel}` : `#theorie/k${r.kapitel}/${r.abschnitt}`;
    default:
      return `#${r.flaeche}`;
  }
}

export function gleicheRoute(a: Route, b: Route): boolean {
  return routeHash(a).toLowerCase() === routeHash(b).toLowerCase();
}
