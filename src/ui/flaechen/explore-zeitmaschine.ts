/*
 * Explore · Zeitmaschine (P8.4, E4): die Daten kommen aus dem Startstand (`status-start`) der Stationen
 * A1–A6 und B1–B6 – Kostenunsicherheit (Stufe) und ungeklärte Entscheidungen je Monat und Welt.
 */

import { h } from '../h.ts';
import { zeitmaschine as grafik, type ZeitPunkt } from '../../grafik/zeitmaschine.ts';
import type { OeffentlicheInhalte } from '../../inhalte/typen.ts';
import { W } from '../woerter.ts';

const STUFEN = ['niedrig', 'mittel', 'hoch', 'sehr hoch'];

/** Punkte aus den Stationen mit Welt, Monat und Startstand. */
export function zeitPunkte(inhalte: OeffentlicheInhalte): ZeitPunkt[] {
  const aus: ZeitPunkt[] = [];
  for (const id of inhalte.stationsFolge) {
    const st = inhalte.stationen[id];
    if (st === undefined || (st.welt !== 'A' && st.welt !== 'B') || st.monat === null || st.statusStart === null) continue;
    const wert = (schluessel: string): string | number | undefined => st.statusStart?.find((e) => e.schluessel === schluessel)?.wert as string | number | undefined;
    const kosten = STUFEN.indexOf(String(wert('kostenunsicherheit') ?? '')) + 1;
    const offen = Number(wert('ungeklaerteEntscheidungen') ?? NaN);
    if (kosten < 1 || !Number.isFinite(offen)) continue;
    aus.push({ monat: st.monat, welt: st.welt, station: /^[AB]\d$/u.test(st.id) ? `${st.id} · ${st.kurztitel}` : st.kurztitel, kosten, offen });
  }
  return aus;
}

export function zeitmaschine(inhalte: OeffentlicheInhalte): HTMLElement | null {
  const Z = W.zeitmaschine;
  const punkte = zeitPunkte(inhalte);
  if (punkte.length === 0) return null;
  return h('section', { class: 'werkzeug', id: 'werkzeug-zeitmaschine-flaeche', 'aria-labelledby': 'zm-titel', 'data-pruef': 'werkzeug-zm' },
    h('h2', { class: 'lern-abschnitt-titel', id: 'zm-titel' }, Z.name),
    h('p', { class: 'kapitel-einstieg' }, Z.einstieg),
    grafik({ punkte, woerter: { kosten: Z.kosten, offen: Z.offen, stufen: STUFEN, weltA: Z.weltA, weltB: Z.weltB, monat: Z.monat, regler: Z.regler, tabelle: Z.tabelle, quelle: Z.quelle } }));
}
