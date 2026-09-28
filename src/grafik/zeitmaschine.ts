/*
 * Zeitmaschine (P8.4, E4): wie sich Kostenunsicherheit und Entscheidungsstau in Welt A und Welt B über
 * die Monate entwickeln. Zwei kleine Liniendiagramme mit je einer Achse (kein Doppelachsen-Diagramm),
 * Welt A Koralle mit Kreisen, Welt B Türkis mit Quadraten (zweite Kodierung, nie Farbe allein), direkt
 * beschriftet; ein Regler (und Zeigen im Diagramm) setzt das Fadenkreuz auf einen Monat.
 *
 * Datenquelle: der Startstand (`status-start`) der Stationen im fiktiven Fall – die Grafik erfindet
 * keine Werte. Tabellenansicht für Screenreader und Druck.
 */

import { h, s, attr, ersetze } from '../ui/h.ts';

export type Welt = 'A' | 'B';

export interface ZeitPunkt {
  monat: number;
  welt: Welt;
  /** Station, z. B. „A3 · Kosten +8 %“ */
  station: string;
  /** Kostenunsicherheit als Stufe 1–4 (niedrig … sehr hoch) */
  kosten: number;
  /** ungeklärte Entscheidungen */
  offen: number;
}

export interface ZeitmaschineDaten {
  punkte: ZeitPunkt[];
  woerter: {
    kosten: string;
    offen: string;
    /** Einzahl zu `offen` */
    offenEins?: string;
    stufen: readonly string[];
    weltA: string;
    weltB: string;
    monat: (n: number) => string;
    regler: string;
    tabelle: string;
    achseMonat: string;
    quelle: string;
  };
}

const B = 320;
const H = 170;
const RAND = { l: 78, r: 76, o: 14, u: 40 };

function diagramm(d: ZeitmaschineDaten, feld: 'kosten' | 'offen', titel: string, max: number, achse: (v: number) => string, schritte: number[]): { svg: SVGSVGElement; setze: (monat: number) => void } {
  const monate = [...new Set(d.punkte.map((p) => p.monat))].sort((a, b) => a - b);
  const m0 = monate[0] ?? 0;
  const m1 = monate[monate.length - 1] ?? 12;
  const x = (m: number): number => RAND.l + ((m - m0) / Math.max(1, m1 - m0)) * (B - RAND.l - RAND.r);
  const y = (v: number): number => H - RAND.u - ((v - (feld === 'kosten' ? 1 : 0)) / Math.max(1, max - (feld === 'kosten' ? 1 : 0))) * (H - RAND.u - RAND.o);
  const linie = (welt: Welt): string => d.punkte.filter((p) => p.welt === welt).sort((a, b) => a.monat - b.monat).map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.monat).toFixed(1)},${y(p[feld]).toFixed(1)}`).join(' ');
  const letzte = (welt: Welt): ZeitPunkt | undefined => d.punkte.filter((p) => p.welt === welt).sort((a, b) => b.monat - a.monat)[0];
  const faden = s('line', { class: 'zm-faden', y1: RAND.o, y2: H - RAND.u });
  const svg = s('svg', { viewBox: `0 0 ${B} ${H}`, class: 'zm-diagramm', role: 'img', 'aria-label': titel },
    // Raster und Achse: zurückhaltend
    schritte.map((v) => s('g', null,
      s('line', { class: 'zm-raster', x1: RAND.l, x2: B - RAND.r, y1: y(v), y2: y(v) }),
      s('text', { class: 'zm-achse', x: RAND.l - 6, y: y(v) + 3.5, 'text-anchor': 'end' }, achse(v)))),
    monate.map((m) => s('text', { class: 'zm-achse', x: x(m), y: H - RAND.u + 16, 'text-anchor': 'middle' }, String(m))),
    s('text', { class: 'zm-achse', x: (RAND.l + B - RAND.r) / 2, y: H - 4, 'text-anchor': 'middle' }, d.woerter.achseMonat),
    faden,
    // Welt B zuerst (gefülltes Quadrat), Welt A darüber als Ring: bei gleichen Werten bleiben beide sichtbar
    (['B', 'A'] as Welt[]).map((welt) => s('g', { class: 'zm-reihe', 'data-welt': welt.toLowerCase() },
      s('path', { class: 'zm-linie', d: linie(welt) }),
      d.punkte.filter((p) => p.welt === welt).map((p) => welt === 'A'
        ? s('circle', { class: 'zm-punkt ist-ring', cx: x(p.monat), cy: y(p[feld]), r: 6 })
        : s('rect', { class: 'zm-punkt', x: x(p.monat) - 4, y: y(p[feld]) - 4, width: 8, height: 8, rx: 1.5 })),
      // direkte Beschriftung am Linienende
      (() => { const p = letzte(welt); return p === undefined ? null : s('text', { class: 'zm-name', x: x(p.monat) + 8, y: y(p[feld]) + 4 }, welt === 'A' ? d.woerter.weltA : d.woerter.weltB); })())));
  return {
    svg: svg as SVGSVGElement,
    setze: (monat) => { attr(faden, 'x1', String(x(monat))); attr(faden, 'x2', String(x(monat))); },
  };
}

export function zeitmaschine(d: ZeitmaschineDaten): HTMLElement {
  const W = d.woerter;
  const monate = [...new Set(d.punkte.map((p) => p.monat))].sort((a, b) => a - b);
  const maxOffen = Math.max(1, ...d.punkte.map((p) => p.offen));
  const kosten = diagramm(d, 'kosten', W.kosten, 4, (v) => W.stufen[v - 1] ?? '', [1, 2, 3, 4]);
  const offen = diagramm(d, 'offen', W.offen, maxOffen, (v) => String(v), [0, Math.ceil(maxOffen / 2), maxOffen]);
  const ablesen = h('div', { class: 'zm-ablesen', 'aria-live': 'polite', 'data-pruef': 'zm-ablesen' });
  const regler = h('input', { type: 'range', class: 'zm-regler', id: 'zm-regler', min: 0, max: monate.length - 1, step: 1, value: 0, 'data-pruef': 'zm-regler' }) as HTMLInputElement;

  let jetzt = -1;
  const zeige = (i: number): void => {
    // nur bei einem Monatswechsel neu zeichnen (Live-Region nicht bei jeder Zeigerbewegung)
    if (i === jetzt) return;
    jetzt = i;
    const monat = monate[i] ?? 0;
    kosten.setze(monat);
    offen.setze(monat);
    regler.value = String(i);
    attr(regler, 'aria-valuetext', W.monat(monat));
    ersetze(ablesen, h('b', null, W.monat(monat)), ...(['A', 'B'] as Welt[]).map((welt) => {
      const p = d.punkte.find((q) => q.monat === monat && q.welt === welt);
      return p === undefined ? null : h('p', { 'data-welt': welt.toLowerCase() }, h('span', { class: 'zm-marke', 'aria-hidden': 'true' }), h('span', null, `${p.station}: ${W.kosten} ${W.stufen[p.kosten - 1] ?? ''} · ${p.offen} ${p.offen === 1 ? (W.offenEins ?? W.offen) : W.offen}`));
    }));
  };
  regler.addEventListener('input', () => zeige(Number(regler.value)));
  // Zeigen im Diagramm setzt das Fadenkreuz auf den nächsten Monat
  for (const g of [kosten.svg, offen.svg]) {
    g.addEventListener('pointermove', (ev: PointerEvent) => {
      const r = g.getBoundingClientRect();
      const xv = ((ev.clientX - r.left) / Math.max(1, r.width)) * B;
      const a = monate[0] ?? 0;
      const e = monate[monate.length - 1] ?? 12;
      const m = a + ((xv - RAND.l) / (B - RAND.l - RAND.r)) * (e - a);
      let best = 0;
      monate.forEach((mm, i) => { if (Math.abs(mm - m) < Math.abs((monate[best] ?? 0) - m)) best = i; });
      zeige(best);
    });
  }
  zeige(0);

  const tabelle = h('details', { class: 'zm-tabelle' }, h('summary', null, W.tabelle),
    h('table', { class: 'register-tabelle' },
      h('thead', null, h('tr', null, h('th', null, W.achseMonat), h('th', null, `${W.weltA} · ${W.kosten}`), h('th', null, `${W.weltA} · ${W.offen}`), h('th', null, `${W.weltB} · ${W.kosten}`), h('th', null, `${W.weltB} · ${W.offen}`))),
      h('tbody', null, monate.map((m) => {
        const a = d.punkte.find((p) => p.monat === m && p.welt === 'A');
        const b = d.punkte.find((p) => p.monat === m && p.welt === 'B');
        return h('tr', null, h('td', null, String(m)), h('td', null, a ? W.stufen[a.kosten - 1] ?? '' : '–'), h('td', null, a ? String(a.offen) : '–'), h('td', null, b ? W.stufen[b.kosten - 1] ?? '' : '–'), h('td', null, b ? String(b.offen) : '–'));
      }))));

  return h('div', { class: 'zeitmaschine', 'data-pruef': 'zeitmaschine' },
    h('div', { class: 'zm-legende', 'aria-hidden': 'true' },
      h('span', { 'data-welt': 'a' }, h('span', { class: 'zm-marke' }), W.weltA), h('span', { 'data-welt': 'b' }, h('span', { class: 'zm-marke ist-quadrat' }), W.weltB)),
    h('div', { class: 'zm-diagramme' },
      h('figure', null, h('figcaption', { class: 't-label' }, W.kosten), kosten.svg),
      h('figure', null, h('figcaption', { class: 't-label' }, W.offen), offen.svg)),
    h('div', { class: 'zm-steuer' }, h('label', { for: 'zm-regler', class: 't-label' }, W.regler), regler),
    ablesen, tabelle, h('p', { class: 'sim-hinweis' }, W.quelle));
}
