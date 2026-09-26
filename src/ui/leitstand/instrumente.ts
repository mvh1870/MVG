/*
 * Statusinstrumente des Leitstands (docs/STIL.md „Statusinstrumente“): Welt-Anzeige und fünf
 * Instrumente – Zeiger, Balken, Punkte, Stufen. Jeder Wert steht auch als Text (Wort, Zahl) und für
 * Screenreader als Satz; Änderungen blitzen einmal auf, der Trendpfeil zeigt gut/schlecht.
 */

import type { Status, StatusSchluessel } from '../../engine/typen.ts';
import { h, s, attr, text, elementAus } from '../h.ts';
import { statusSymbol, trendPfeil } from '../../stil/symbole.ts';
import { instrumentWerte, trend, statusWort, type InstrumentWert } from '../anzeige.ts';
import { neuAnstossen, zaehle } from '../bewegung.ts';
import { W } from '../woerter.ts';

interface InstrumentTeile {
  wurzel: HTMLElement;
  grafik: SVGSVGElement;
  trendEl: HTMLElement;
  wertEl: HTMLElement;
  zusatzEl: HTMLElement;
  srEl: HTMLElement;
}

function bogen(i: number): string {
  const cx = 32, cy = 33, r = 26;
  const a0 = ((180 + i * 36 + 2.5) * Math.PI) / 180;
  const a1 = ((180 + (i + 1) * 36 - 2.5) * Math.PI) / 180;
  return `M${(cx + r * Math.cos(a0)).toFixed(2)} ${(cy + r * Math.sin(a0)).toFixed(2)}A${r} ${r} 0 0 1 ${(cx + r * Math.cos(a1)).toFixed(2)} ${(cy + r * Math.sin(a1)).toFixed(2)}`;
}

function grafikFuer(w: InstrumentWert): SVGSVGElement {
  switch (w.grafik) {
    case 'zeiger':
      return s('svg', { class: 'instrument-grafik zeiger', width: 62, height: 38, viewBox: '0 0 64 38', 'aria-hidden': 'true' },
        [0, 1, 2, 3, 4].map((i) => s('path', { class: 'segment', d: bogen(i) })),
        s('g', { class: 'nadel', style: 'transform:rotate(-90deg)' }, s('line', { x1: 32, y1: 33, x2: 32, y2: 12 })),
        s('circle', { class: 'nabe', cx: 32, cy: 33, r: 3.6 }));
    case 'balken':
      return s('svg', { class: 'instrument-grafik balken', width: 40, height: 34, viewBox: '0 0 40 34', 'aria-hidden': 'true' },
        [10, 17, 24, 31].map((hoehe, i) => s('rect', { x: i * 10 + 1, y: 33 - hoehe, width: 7.5, height: hoehe, rx: 1.5, style: `transition-delay:${i * 70}ms` })));
    case 'punkte': {
      const n = w.punkte?.anzahl ?? 6;
      const sp = w.punkte?.spalten ?? 3;
      return s('svg', { class: 'instrument-grafik punkte', width: sp * 9 + 1, height: 20, viewBox: `0 0 ${sp * 9 + 1} 20`, 'aria-hidden': 'true' },
        Array.from({ length: n }, (_, j) => s('rect', { x: (j % sp) * 9 + 1, y: Math.floor(j / sp) * 10 + 1, width: 7, height: 7, rx: 1.5, style: `transition-delay:${j * 40}ms` })));
    }
    case 'stufen':
      return s('svg', { class: 'instrument-grafik stufen', width: 54, height: 30, viewBox: '0 0 54 30', 'aria-hidden': 'true' },
        s('rect', { class: 'stufe stufe-ok', x: 1, y: 14, width: 16, height: 10, rx: 2 }),
        s('rect', { class: 'stufe stufe-mittel', x: 19, y: 14, width: 16, height: 10, rx: 2 }),
        s('rect', { class: 'stufe stufe-kritisch', x: 37, y: 14, width: 16, height: 10, rx: 2 }),
        s('path', { class: 'marke-pfeil', d: 'M3.5 3h10L8.5 10z', style: 'transform:translateX(0px)' }));
  }
}

export interface Instrumente {
  element: HTMLElement;
  /** zeichnet den Stand; `vorher` (gleiche Welt) steuert Trendpfeil, Blitz und Zähler */
  setze(welt: 'A' | 'B', weltZusatz: string, stand: Status, vorher: Status | null, schrittGewechselt: boolean): string[];
}

export function erzeugeInstrumente(): Instrumente {
  const weltName = h('span', null, 'Welt A');
  const weltZusatz = h('span', { class: 'welt-zusatz' }, '');
  const weltAnzeige = h('div', { class: 'welt-anzeige', 'data-welt': 'a' },
    h('span', { class: 'welt-k' }, 'Status'),
    h('span', { class: 'welt-name' }, h('span', { class: 'led schleife' }), weltName),
    weltZusatz);
  const teile = new Map<StatusSchluessel, InstrumentTeile>();
  const element = h('section', { class: 'instrumente', 'aria-label': 'Statusinstrumente', 'data-pruef': 'status' }, weltAnzeige);
  let aufgebaut = false;

  const baue = (werte: InstrumentWert[]): void => {
    for (const w of werte) {
      const grafik = grafikFuer(w);
      const trendEl = h('span', { class: 'trend', 'aria-hidden': 'true' });
      const wertEl = h('span', { class: 'instrument-wertzeile' });
      const zusatzEl = h('div', { class: 'instrument-zusatz' });
      const srEl = h('span', { class: 'nur-sr' });
      const wurzel = h('div', { class: 'instrument', role: 'group', 'aria-label': w.label, 'data-schluessel': w.schluessel },
        h('div', { class: 'instrument-kopf' }, h('span', { class: 'instrument-label', 'aria-hidden': 'true' }, w.label), trendEl),
        h('div', { class: 'instrument-mitte' }, grafik, h('div', { class: 'instrument-wert' }, wertEl, zusatzEl)),
        srEl);
      teile.set(w.schluessel, { wurzel, grafik, trendEl, wertEl, zusatzEl, srEl });
      element.append(wurzel);
    }
    aufgebaut = true;
  };

  return {
    element,
    setze(welt, zusatz, stand, vorher, schrittGewechselt) {
      const werte = instrumentWerte(stand);
      if (!aufgebaut) baue(werte);
      attr(weltAnzeige, 'data-welt', welt === 'B' ? 'b' : 'a');
      text(weltName, `Welt ${welt}`);
      text(weltZusatz, zusatz);
      const ansagen: string[] = [];
      for (const w of werte) {
        const t = teile.get(w.schluessel);
        if (t === undefined) continue;
        const tr = trend(w.schluessel, vorher, stand);
        if (tr !== null && vorher !== null) {
          t.trendEl.replaceChildren(elementAus(trendPfeil(tr === 'gut' ? (w.schluessel === 'entscheidungsfaehigkeit' ? 'hoch' : 'runter') : (w.schluessel === 'entscheidungsfaehigkeit' ? 'runter' : 'hoch'))));
          t.trendEl.setAttribute('data-trend', tr);
          neuAnstossen(t.wurzel, 'blitz');
          ansagen.push(`${w.label}: ${statusWort(vorher, w.schluessel)} → ${statusWort(stand, w.schluessel)}`);
        } else if (vorher === null || schrittGewechselt) {
          t.trendEl.replaceChildren();
          t.trendEl.removeAttribute('data-trend');
        }
        attr(t.grafik, 'data-status', w.stufe);
        // Grafik
        if (w.grafik === 'zeiger') {
          t.grafik.querySelectorAll('.segment').forEach((sg, i) => sg.classList.toggle('ist-an', i < w.zahl));
          const nadel = t.grafik.querySelector('.nadel') as SVGGElement | null;
          if (nadel !== null) nadel.style.transform = `rotate(${-90 + w.zahl * 36}deg)`;
        } else if (w.grafik === 'balken') {
          t.grafik.querySelectorAll('rect').forEach((r, i) => r.classList.toggle('ist-an', i <= w.zahl));
        } else if (w.grafik === 'punkte') {
          const letzterNeu = w.schluessel === 'offeneRisiken' && w.hinweis !== null;
          t.grafik.querySelectorAll('rect').forEach((r, i) => {
            r.classList.toggle('ist-an', i < w.zahl);
            r.classList.toggle('ist-neu-bewertet', letzterNeu && i === w.zahl - 1);
          });
        } else {
          const stufe = Math.min(2, w.zahl);
          t.grafik.querySelectorAll('.stufe').forEach((r, i) => r.classList.toggle('ist-an', i === stufe));
          const pfeil = t.grafik.querySelector('.marke-pfeil') as SVGPathElement | null;
          if (pfeil !== null) pfeil.style.transform = `translateX(${stufe * 18}px)`;
        }
        // Wert
        if (w.grafik === 'zeiger' || w.grafik === 'punkte') {
          let zahl = t.wertEl.querySelector('.wert') as HTMLElement | null;
          if (zahl === null) {
            zahl = h('span', { class: 'wert' }, w.wort);
            t.wertEl.replaceChildren(zahl, h('span', { class: 'wert-einheit' }, w.grafik === 'zeiger' ? W.einheit.vonFuenf : w.schluessel === 'offeneRisiken' ? W.einheit.aktiv : W.einheit.offen));
          }
          const alt = vorher !== null ? (w.schluessel === 'entscheidungsfaehigkeit' ? vorher.entscheidungsfaehigkeit : vorher[w.schluessel as 'offeneRisiken']) : w.zahl;
          if (alt !== w.zahl) zaehle(zahl, alt, w.zahl, 700);
          else text(zahl, w.wort);
          const z: Node[] = [];
          if (w.zusatz !== null) z.push(elementAus(statusSymbol(w.stufe)), h('span', null, w.zusatz));
          if (w.hinweis !== null) z.push(h('span', null, w.hinweis));
          t.zusatzEl.replaceChildren(...z);
        } else {
          t.wertEl.replaceChildren(h('span', { class: 'wert wort' }, elementAus(statusSymbol(w.stufe)), w.wort));
          t.zusatzEl.replaceChildren(...(w.hinweis !== null ? [h('span', null, w.hinweis)] : []));
        }
        text(t.srEl, `${w.label}: ${statusWort(stand, w.schluessel)}${w.hinweis !== null ? ` (${w.hinweis})` : ''}`);
      }
      return ansagen;
    },
  };
}
