/*
 * Leinwand (O-9, P16.9): zeigt nur, was über den Kanal kommt – geprüft mit `pruefeBuehne` – und
 * zeichnet ohne Bedienung: Start, Story-Schritt, Thema oder Werkzeug. Regie-Material erreicht sie nie.
 * `erzeugeAnzeige` ist dieselbe Zeichnung für die Vorschau in der Regie.
 */

import type { OeffentlicheInhalte } from '../inhalte/typen.ts';
import type { Kanal } from './kanal.ts';
import { pruefeBuehne, type Buehne } from './buehne.ts';
import { h, ersetze } from '../ui/h.ts';
import { bildmarke } from '../ui/marke.ts';
import { baueStart } from '../ui/flaechen/start.ts';
import { baueTheorie, themaTitel, themen, zeigeAktuellenEintrag } from '../ui/flaechen/theorie.ts';
import { baueExplore, WERKZEUGE } from '../ui/flaechen/explore.ts';
import { baueSchritt, leisteOben } from '../ui/flaechen/geschichte.ts';
import { seitenRahmen } from '../ui/bausteine/seite.ts';
import { W } from '../ui/woerter.ts';

export interface Anzeige {
  element: HTMLElement;
  /** Um knapp eine Höhe rollen (−1 hoch, +1 runter); false, wenn nichts zu rollen ist. */
  rolle(schritt: -1 | 1): boolean;
  setze(b: Buehne): void;
  entferne(): void;
}

/** Story-Schritt ohne Bedienung (Leinwand, Vorschau). */
export function storyAnzeige(inhalte: OeffentlicheInhalte, b: Buehne): HTMLElement {
  const g = inhalte.geschichte;
  if (g === null) return h('div');
  const stand = b.story;
  return seitenRahmen({
    bereich: 'story',
    klasse: 'seite-story',
    bedienbar: false,
    inhalt: [
      h('div', { class: 'gs-leiste' }, ...leisteOben(g, stand, false, () => undefined)),
      h('div', { class: 'gs-buehne' }, baueSchritt({ g, stand, bedienbar: false, themaTitel: (id) => themaTitel(inhalte, id), tue: () => undefined })),
    ],
  });
}

/** Nicht bedienbare Zeichnung eines Bühnenstands (Leinwand, Regie-Vorschau). */
export function erzeugeAnzeige(inhalte: OeffentlicheInhalte, version: string, eingebettet: boolean): Anzeige {
  const element = h('div', { class: 'anzeige', inert: true });
  let schluessel = '';
  const nachOben = (): void => {
    if (eingebettet) element.scrollTop = 0;
    else if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };
  return {
    element,
    rolle(schritt) {
      if (eingebettet) {
        if (element.scrollHeight <= element.clientHeight + 1) return false;
        element.scrollTop += schritt * Math.round(element.clientHeight * 0.8);
        return true;
      }
      if (typeof window === 'undefined') return false;
      const d = document.scrollingElement ?? document.documentElement;
      if (d.scrollHeight <= window.innerHeight + 1) return false;
      window.scrollBy(0, schritt * Math.round(window.innerHeight * 0.8));
      return true;
    },
    setze(b) {
      const neu = JSON.stringify(b);
      if (neu === schluessel) return;
      const gleicherOrt = schluessel !== '' && (() => {
        const alt = JSON.parse(schluessel) as Buehne;
        return alt.bereich === b.bereich && alt.thema === b.thema && alt.werkzeug === b.werkzeug && JSON.stringify(alt.story.schritt) === JSON.stringify(b.story.schritt);
      })();
      schluessel = neu;
      let seite: HTMLElement;
      if (b.bereich === 'story') seite = storyAnzeige(inhalte, b);
      else if (b.bereich === 'theorie') seite = baueTheorie({ inhalte, thema: b.thema, version, bedienbar: false });
      else if (b.bereich === 'explore') seite = baueExplore({ inhalte, werkzeug: b.werkzeug, bedienbar: false });
      else {
        seite = baueStart({
          startseite: inhalte.startseite,
          themenAnzahl: themen(inhalte).length,
          stationenAnzahl: inhalte.geschichte?.kapitel.length ?? 0,
          werkzeugAnzahl: WERKZEUGE.length,
          weiterlesen: false,
          bedienbar: false,
        });
      }
      const oben = element.scrollTop;
      ersetze(element, seite);
      if (b.bereich === 'theorie') zeigeAktuellenEintrag(seite);
      // Eine Wahl im selben Schritt lässt die Leinwand stehen; ein neuer Ort beginnt oben
      if (gleicherOrt && eingebettet) element.scrollTop = oben;
      else if (!gleicherOrt) nachOben();
    },
    entferne() {
      element.remove();
    },
  };
}

export interface LeinwandOptionen {
  inhalte: OeffentlicheInhalte;
  kanal: Kanal;
  version: string;
  /** Takt der Lebenszeichen in ms */
  takt?: number;
}

/** Startet die Leinwand in `wurzel`; gibt eine Abmeldung zurück. */
export function starteLeinwand(wurzel: HTMLElement, o: LeinwandOptionen): () => void {
  const anzeige = erzeugeAnzeige(o.inhalte, o.version, false);
  const warten = h('main', { class: 'leinwand-warten', 'data-pruef': 'leinwand-warten', 'aria-label': W.leinwand.titel },
    bildmarke('marke-logo'),
    h('p', { class: 'leinwand-warten-name' }, W.name),
    h('h1', { class: 'leinwand-warten-titel' }, W.leinwand.warten),
    h('p', null, W.leinwand.wartenHinweis));
  const element = h('div', { class: 'leinwand', 'data-pruef': 'leinwand' }, warten);
  ersetze(wurzel, element);
  let empfangen = false;
  let nr = 0;

  const ab = o.kanal.abonnieren((n) => {
    if (n.art === 'anzeige') {
      element.classList.toggle('ist-beamer', n.beamer);
      return;
    }
    if (n.art === 'rollen') {
      anzeige.rolle(n.schritt);
      return;
    }
    if (n.art !== 'zustand') return;
    const b = pruefeBuehne(n.zustand, o.inhalte.geschichte);
    if (b === null) return;
    if (!empfangen) {
      empfangen = true;
      ersetze(element, anzeige.element);
    }
    anzeige.setze(b);
  });
  const taste = (e: KeyboardEvent): void => {
    const s = e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' ? 1 : e.key === 'ArrowUp' || e.key === 'PageUp' ? -1 : 0;
    if (s !== 0 && anzeige.rolle(s)) e.preventDefault();
  };
  if (typeof window !== 'undefined') window.addEventListener('keydown', taste);
  o.kanal.senden({ art: 'hallo' });
  const lebenszeichen = setInterval(() => {
    nr += 1;
    o.kanal.senden({ art: 'lebenszeichen', nr });
    if (!empfangen && nr % 3 === 0) o.kanal.senden({ art: 'hallo' });
  }, o.takt ?? 1000);

  return () => {
    if (typeof window !== 'undefined') window.removeEventListener('keydown', taste);
    clearInterval(lebenszeichen);
    ab();
    anzeige.entferne();
  };
}
