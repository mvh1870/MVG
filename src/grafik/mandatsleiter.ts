/*
 * Grafik-Baukasten: Mandatsleiter als „Aufzug“ (Kap. 4.2, Muster; Pflicht-Animation 4).
 *
 * Stockwerke von unten nach oben = Stufen der Leiter (aus den Inhalten: wer, Bereich, bis TEUR,
 * Hinweis). Die Kabine klettert zum Betrag; das Stockwerk, das zuständig ist, leuchtet. Hängt die
 * Zuständigkeit nicht am Betrag (z. B. nicht delegierbar), zeigt ein Pfeil über die Stufen hinweg nach
 * oben („Das Mandat hängt von der Option ab“).
 */

import { h, elementAus } from '../ui/h.ts';
import { symbol } from '../stil/symbole.ts';
import { dezimal, sanftBeide, type Takt } from '../ui/bewegung.ts';

export interface LeiterStufe {
  wer: string;
  bereich: string;
  /** Obergrenze in TEUR (einschließlich); null = nach oben offen */
  bisTeur: number | null;
  hinweis: string | null;
}

export interface LeiterOptionen {
  stufen: LeiterStufe[];
  betragTeur: number;
  /** Anzeige des Betrags, z. B. „4,7 Mio. €“ */
  betragText: string;
  /** zuständige Stufe (1 = unterste) */
  ziel: number;
  /** Beschriftung „Stufe“ (Bedienbeschriftung) */
  stufeWort: string;
  /** Name der Grafik, z. B. „Muster-Mandatsleiter (Kap. 4.2)“ – die Leiter ist ein Muster, keine Regel */
  titel: string;
}

export interface LeiterGrafik {
  element: HTMLElement;
  klettere(takt: Takt): void;
  setzeZiel(ziel: number): void;
}

/** Höhenanteile der Stockwerke in Prozent (drei Stufen wie im Prototyp, sonst gleichmäßig). */
export function stockwerkHoehen(n: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [100];
  if (n === 3) return [22, 52, 26];
  return Array.from({ length: n }, () => 100 / n);
}

/** Betrag in TEUR → Höhe in Prozent der Leiter. */
export function hoeheFuer(stufen: readonly LeiterStufe[], teur: number): number {
  const hoehen = stockwerkHoehen(stufen.length);
  let unten = 0;
  let boden = 0;
  for (let i = 0; i < stufen.length; i += 1) {
    const s = stufen[i] as LeiterStufe;
    const hoehe = hoehen[i] ?? 0;
    const oben = s.bisTeur ?? Math.max(unten * 2, unten + 1);
    if (teur <= oben || i === stufen.length - 1) {
      const anteil = Math.min(1, Math.max(0, (teur - unten) / Math.max(1, oben - unten)));
      return boden + anteil * hoehe;
    }
    unten = oben;
    boden += hoehe;
  }
  return 100;
}

/** Höhe in Prozent → Betrag in TEUR (für die mitlaufende Anzeige der Kabine). */
export function betragBei(stufen: readonly LeiterStufe[], prozent: number): number {
  const hoehen = stockwerkHoehen(stufen.length);
  let unten = 0;
  let boden = 0;
  for (let i = 0; i < stufen.length; i += 1) {
    const s = stufen[i] as LeiterStufe;
    const hoehe = hoehen[i] ?? 0;
    const oben = s.bisTeur ?? Math.max(unten * 2, unten + 1);
    if (prozent <= boden + hoehe || i === stufen.length - 1) return unten + ((prozent - boden) / Math.max(1e-9, hoehe)) * (oben - unten);
    unten = oben;
    boden += hoehe;
  }
  return unten;
}

/** Betrag in TEUR als Text: „100 TEUR“, „4,7 Mio. €“. */
export function formatiereTeur(teur: number): string {
  if (teur < 999.5) return `${Math.round(teur)} TEUR`;
  const mio = teur / 1000;
  return `${Number.isInteger(Math.round(mio * 10) / 10) ? String(Math.round(mio)) : dezimal(mio, 1)} Mio. €`;
}

export function mandatsleiter(o: LeiterOptionen): LeiterGrafik {
  const hoehen = stockwerkHoehen(o.stufen.length);
  let boden = 0;
  const stockwerke: HTMLElement[] = [];
  const grenzen: HTMLElement[] = [];
  o.stufen.forEach((s, i) => {
    const hoehe = hoehen[i] ?? 0;
    const w = h('div', { class: 'leiter-stock', 'data-stufe': i + 1, style: `bottom:${boden}%;height:${hoehe}%` },
      h('span', { class: 'leiter-wer' }, h('i', { 'aria-hidden': 'true' }), `${o.stufeWort} ${i + 1}`),
      h('b', null, s.wer),
      h('small', null, s.bereich),
      s.hinweis !== null ? h('span', { class: 'leiter-hinweis' }, elementAus(symbol('schloss')), s.hinweis) : null);
    stockwerke.push(w);
    boden += hoehe;
    if (s.bisTeur !== null && i < o.stufen.length - 1) {
      grenzen.push(h('span', { class: 'leiter-grenze', style: `bottom:${boden}%` }, formatiereTeur(s.bisTeur)));
    }
  });
  const betragAnzeige = h('span', null, formatiereTeur(0));
  const kabine = h('div', { class: 'leiter-kabine' }, betragAnzeige);
  const markierung = h('div', { class: 'leiter-markierung' });
  const express = h('div', { class: 'leiter-express' });
  const zielHoehe = hoeheFuer(o.stufen, o.betragTeur);
  const element = h('div', {
    class: 'leiter',
    role: 'img',
    'aria-label': `${o.titel}: ${o.stufen.map((s) => `${s.wer} ${s.bereich}${s.hinweis !== null ? ` (${s.hinweis})` : ''}`).join(', ')}. Markierung bei ${o.betragText}.`,
  },
  [...stockwerke].reverse(),
  grenzen,
  markierung,
  h('div', { class: 'leiter-schacht', 'aria-hidden': 'true' }, express, kabine));

  let ziel = o.ziel;
  let angekommen = false;

  const stufeBei = (prozent: number): number => {
    let b = 0;
    for (let i = 0; i < hoehen.length; i += 1) {
      b += hoehen[i] ?? 0;
      if (prozent <= b + 1e-9) return i + 1;
    }
    return hoehen.length;
  };
  const leuchte = (stufe: number): void => {
    stockwerke.forEach((w, i) => {
      w.classList.toggle('ist-an', i + 1 === stufe);
      w.classList.toggle('zeigt-hinweis', angekommen && i + 1 === ziel);
    });
  };
  const platziere = (prozent: number): void => {
    kabine.style.bottom = `max(22px, ${prozent}%)`;
    markierung.style.bottom = `max(22px, ${prozent}%)`;
    betragAnzeige.textContent = formatiereTeur(betragBei(o.stufen, prozent));
  };
  const betragsStufe = stufeBei(zielHoehe);
  const ankommen = (): void => {
    angekommen = true;
    platziere(zielHoehe);
    betragAnzeige.textContent = o.betragText;
    // Der Pfeil reicht von der Kabine bis ins oberste zuständige Stockwerk.
    let oben = 0;
    for (let i = 0; i < ziel - 1; i += 1) oben += hoehen[i] ?? 0;
    oben += (hoehen[ziel - 1] ?? 0) * 0.62;
    express.style.bottom = `calc(${zielHoehe}% + 20px)`;
    express.style.height = `calc(${Math.max(0, oben - zielHoehe)}% - 20px)`;
    element.classList.add('ist-angekommen');
    element.classList.toggle('ist-darueber', ziel > betragsStufe);
    leuchte(ziel);
  };

  return {
    element,
    klettere(takt) {
      platziere(0);
      leuchte(1);
      takt.spaeter(() => {
        takt.schleife(2400, (p) => {
          const pos = zielHoehe * sanftBeide(p);
          platziere(pos);
          leuchte(stufeBei(pos));
        }, ankommen);
      }, 350);
    },
    setzeZiel(neu) {
      ziel = neu;
      if (angekommen) ankommen();
    },
  };
}
