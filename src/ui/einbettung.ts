/*
 * Einbett-Schnittstelle (P10.6, E12): Läuft die Anwendung in einem iframe, spricht sie mit der
 * Hostseite über postMessage. Umschlag `{ mvg: 'einbettung', art, … }`.
 *
 *   an den Host:  bereit { version } · ort { hash, flaeche, titel }  (nach jedem Flächenwechsel)
 *   vom Host:     gehe { ziel: '#theorie/k4' } · frage  (antwortet mit „ort“)
 *
 * Sicher: angenommen wird nur, was vom direkten Elternfenster kommt und – wenn die Hostseite ihre
 * Herkunft per `?einbettung-herkunft=https://…` nennt – nur von dieser Herkunft; dorthin geht dann auch
 * die Antwort (sonst an „*“: die Nachrichten tragen nur öffentliche Orte, nie Regie-Material). Ziele
 * laufen durch den Router; Regie und Leinwand sind von außen nicht erreichbar.
 */

import { leseRoute, routeHash } from './route.ts';

export const EINBETTUNG = 'einbettung';

export type AnHost =
  | { mvg: typeof EINBETTUNG; art: 'bereit'; version: string }
  | { mvg: typeof EINBETTUNG; art: 'ort'; hash: string; flaeche: string; titel: string };

export type VomHost =
  | { art: 'gehe'; ziel: string }
  | { art: 'frage' };

/** Läuft das Fenster in einem Rahmen? (Zugriff auf `top` kann fremdherkünftig werfen → ja) */
export function istEingebettet(fenster: Window): boolean {
  try {
    return fenster.self !== fenster.top;
  } catch {
    return true;
  }
}

/** Prüft eine Nachricht des Hosts; das Ziel wird normalisiert (Router), Regie/Leinwand fallen weg. */
export function leseHostNachricht(daten: unknown): VomHost | null {
  if (typeof daten !== 'object' || daten === null) return null;
  const d = daten as Record<string, unknown>;
  if (d['mvg'] !== EINBETTUNG) return null;
  if (d['art'] === 'frage') return { art: 'frage' };
  if (d['art'] === 'gehe' && typeof d['ziel'] === 'string' && d['ziel'].length <= 200) {
    const r = leseRoute(d['ziel']);
    if (r.flaeche === 'regie' || r.flaeche === 'leinwand') return null;
    return { art: 'gehe', ziel: routeHash(r) };
  }
  return null;
}

export interface Einbettung {
  meldeOrt(): void;
  entferne(): void;
}

export function starteEinbettung(o: {
  fenster: Window;
  version: string;
  /** Hash setzen (der Router übernimmt) */
  gehe: (hash: string) => void;
  ort: () => { hash: string; flaeche: string; titel: string };
}): Einbettung {
  const { fenster } = o;
  let herkunft: string | null = null;
  try {
    herkunft = new URLSearchParams(fenster.location.search).get('einbettung-herkunft');
  } catch {
    herkunft = null;
  }
  const eltern = fenster.parent;
  const sende = (n: AnHost): void => {
    try {
      eltern.postMessage(n, herkunft ?? '*');
    } catch {
      // Host weg oder Herkunft passt nicht: nichts zu tun
    }
  };
  const meldeOrt = (): void => sende({ mvg: EINBETTUNG, art: 'ort', ...o.ort() });
  const bei = (e: MessageEvent): void => {
    if (e.source !== eltern) return;
    if (herkunft !== null && e.origin !== herkunft) return;
    const n = leseHostNachricht(e.data);
    if (n === null) return;
    if (n.art === 'gehe') o.gehe(n.ziel);
    else meldeOrt();
  };
  fenster.addEventListener('message', bei);
  sende({ mvg: EINBETTUNG, art: 'bereit', version: o.version });
  return {
    meldeOrt,
    entferne: () => fenster.removeEventListener('message', bei),
  };
}
