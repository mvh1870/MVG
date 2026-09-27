// Browser-Szenario Welt B, zweiter Teil (P5.9): bei 1280×720 die Rollen ps, planung, controlling und
// der Express-Pfad (E8). Aufgeteilt, damit der parallele Pool beide Teile zugleich fährt (siehe welt-b).

import { spiele } from './welt-b.szenario.mjs';

export const name = 'welt-b-2';
export const seite = 'tmp/mvg-entwurf.html';
export const hash = '#story';
export const viewports = [{ breite: 1280, hoehe: 720 }];

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  // schnell (L-44): nur der Express-Pfad
  await spiele(seite, h, h.voll ? ['ps', 'planung', 'controlling'] : [], true);
}
