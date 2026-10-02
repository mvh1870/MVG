/*
 * Hash-Router (rein, ohne DOM): welcher Bereich ein Adress-Anker meint.
 *
 *   #start · #story · #story/s3 (Station) · #theorie · #theorie/<thema> · #theorie/<thema>/<abschnitt>
 *   · #explore · #explore/<werkzeug> · #regie · #leinwand
 *
 * Alles andere – auch ein leerer Anker – führt zur Startseite (ruhiger Einstieg, O-21). Groß- und
 * Kleinschreibung zählt nicht; Thema, Abschnitt und Station kommen klein zurück und werden von der
 * Oberfläche gegen die Inhalte aufgelöst (Unbekanntes → Übersicht des Bereichs).
 */

export type Route =
  | { flaeche: 'start' }
  | { flaeche: 'story'; station: string | null }
  | { flaeche: 'theorie'; thema: string | null; abschnitt: string | null }
  | { flaeche: 'explore'; werkzeug: string | null }
  | { flaeche: 'regie' }
  | { flaeche: 'leinwand' };

export const START: Route = { flaeche: 'start' };

/** Kennungen in Adressen: Kleinbuchstaben, Ziffern, Bindestrich, Punkt (Abschnitt „4.2“). */
const KENNUNG = /^[a-z0-9][a-z0-9.-]*$/u;

/** Ist die Abschnitt-Angabe einer Theorie-Route eine Abbildung (abb-6, P14)? */
export const istAbbildungsId = (a: string): boolean => /^abb-\d{1,2}$/u.test(a);

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
  if ([zweites, drittes].some((t) => t !== undefined && !KENNUNG.test(t))) return START;
  switch (kopf) {
    case 'story':
      return drittes === undefined ? { flaeche: 'story', station: zweites ?? null } : START;
    case 'explore':
      return drittes === undefined ? { flaeche: 'explore', werkzeug: zweites ?? null } : START;
    case 'regie':
    case 'leinwand':
      return zweites === undefined ? { flaeche: kopf } : START;
    case 'theorie':
      return { flaeche: 'theorie', thema: zweites ?? null, abschnitt: zweites !== undefined ? drittes ?? null : null };
    default:
      return START;
  }
}

export function routeHash(r: Route): string {
  switch (r.flaeche) {
    case 'story':
      return r.station === null ? '#story' : `#story/${r.station}`;
    case 'explore':
      return r.werkzeug === null ? '#explore' : `#explore/${r.werkzeug}`;
    case 'theorie':
      if (r.thema === null) return '#theorie';
      return r.abschnitt === null ? `#theorie/${r.thema}` : `#theorie/${r.thema}/${r.abschnitt}`;
    default:
      return `#${r.flaeche}`;
  }
}

export function gleicheRoute(a: Route, b: Route): boolean {
  return routeHash(a).toLowerCase() === routeHash(b).toLowerCase();
}
