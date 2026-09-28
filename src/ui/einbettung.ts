/*
 * Einbett-Schnittstelle (P10.6, E12): Läuft die Anwendung in einem iframe, spricht sie mit der
 * Hostseite über postMessage. Umschlag `{ mvg: 'einbettung', art, … }`.
 *
 *   an den Host:  bereit { version } · ort { hash, flaeche, titel }  (nach jedem Flächenwechsel)
 *                 hoehe { px }  (Inhaltshöhe, sobald sie sich ändert; null = feste Höhe, z. B. die Story)
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
  | { mvg: typeof EINBETTUNG; art: 'ort'; hash: string; flaeche: string; titel: string }
  | { mvg: typeof EINBETTUNG; art: 'hoehe'; px: number | null };

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

/** Hintergrund der Hostseite aus `?einbettung-hintergrund=ffffff` – nur helle Farben (Kontrast der Texte bleibt, O-11). */
export function leseHintergrund(suche: string): string | null {
  const wert = new URLSearchParams(suche).get('einbettung-hintergrund') ?? '';
  if (!/^[0-9a-f]{6}$/iu.test(wert)) return null;
  const kanal = (i: number): number => {
    const c = parseInt(wert.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const leuchtdichte = 0.2126 * kanal(0) + 0.7152 * kanal(2) + 0.0722 * kanal(4);
  return leuchtdichte >= 0.8 ? `#${wert.toLowerCase()}` : null;
}

export interface Einbettung {
  /** meldet den Ort; eine gleiche Meldung wie zuletzt nur mit `immer` (Antwort auf „frage“) */
  meldeOrt(immer?: boolean): void;
  entferne(): void;
}

export function starteEinbettung(o: {
  fenster: Window;
  version: string;
  /** Hash setzen (der Router übernimmt) */
  gehe: (hash: string) => void;
  ort: () => { hash: string; flaeche: string; titel: string };
  /** Inhaltshöhe in px (null = die Fläche braucht eine feste Höhe); ohne Angabe keine Höhenmeldung */
  hoehe?: () => number | null;
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
  // Abo und hashchange melden denselben Sprung sonst doppelt (P11.3 R5)
  let letzte = '';
  const meldeOrt = (immer = false): void => {
    const ort = o.ort();
    const schluessel = `${ort.hash}|${ort.flaeche}|${ort.titel}`;
    if (!immer && schluessel === letzte) return;
    letzte = schluessel;
    sende({ mvg: EINBETTUNG, art: 'ort', ...ort });
  };
  const bei = (e: MessageEvent): void => {
    if (e.source !== eltern) return;
    if (herkunft !== null && e.origin !== herkunft) return;
    const n = leseHostNachricht(e.data);
    if (n === null) return;
    if (n.art === 'gehe') o.gehe(n.ziel);
    else meldeOrt(true);
  };
  fenster.addEventListener('message', bei);
  sende({ mvg: EINBETTUNG, art: 'bereit', version: o.version });
  // Höhe (P12, Owner: Einbettung ohne Springen): nach jeder Größenänderung einmal je Bild melden, nur bei
  // echter Änderung – die Hostseite passt den Rahmen weich an, im Rahmen entsteht keine eigene Scrollleiste
  let letzteHoehe: number | null | undefined;
  let geplant = false;
  const meldeHoehe = (): void => {
    geplant = false;
    const px = o.hoehe?.() ?? null;
    const gerundet = px === null ? null : Math.ceil(px);
    if (gerundet === letzteHoehe || (gerundet !== null && typeof letzteHoehe === 'number' && Math.abs(gerundet - letzteHoehe) < 2)) return;
    letzteHoehe = gerundet;
    sende({ mvg: EINBETTUNG, art: 'hoehe', px: gerundet });
  };
  const plane = (): void => {
    if (geplant) return;
    geplant = true;
    fenster.requestAnimationFrame(meldeHoehe);
  };
  const Beobachter = (fenster as Window & { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
  const beobachter = o.hoehe !== undefined && Beobachter !== undefined ? new Beobachter(plane) : null;
  if (beobachter !== null) {
    beobachter.observe(fenster.document.documentElement);
    beobachter.observe(fenster.document.body);
  }
  if (o.hoehe !== undefined) plane();
  return {
    meldeOrt: (immer = false) => { meldeOrt(immer); if (o.hoehe !== undefined) plane(); },
    entferne: () => { fenster.removeEventListener('message', bei); beobachter?.disconnect(); },
  };
}
