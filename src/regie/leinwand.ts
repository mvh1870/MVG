/*
 * Leinwand (O-9, P16.9): zeigt nur, was über den Kanal kommt – geprüft mit `pruefeBuehne` – und
 * zeichnet ohne Bedienung: Start, Story-Schritt, Thema oder Werkzeug. Regie-Material erreicht sie nie.
 * `erzeugeAnzeige` ist dieselbe Zeichnung für die Vorschau in der Regie.
 */

import type { OeffentlicheInhalte } from '../inhalte/typen.ts';
import type { MiniArt } from '../geschichte/typen.ts';
import { miniArt } from '../geschichte/mini-arten.ts';
import type { Kanal } from './kanal.ts';
import { pruefeBuehne, type Buehne } from './buehne.ts';
import { h, ersetze } from '../ui/h.ts';
import { bildmarke } from '../ui/marke.ts';
import { baueStart } from '../ui/flaechen/start.ts';
import { baueTheorie, themaTitel, themen, zeigeAktuellenEintrag } from '../ui/flaechen/theorie.ts';
import { baueExplore, WERKZEUGE } from '../ui/flaechen/explore.ts';
import { beispielKennungen } from '../ui/werkzeug-kennungen.ts';
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

/**
 * Welcher Posten einer Mini-Aufgabe sich geändert hat (Platz in der Liste der Aufgabe): bei der Zuordnung der erste
 * Posten mit anderer Wahl, bei der Reihenfolge der zuletzt angeklickte bzw. gelöste Posten; null = nichts geändert.
 */
export function geaenderterPosten(art: MiniArt, alt: readonly number[], neu: readonly number[]): number | null {
  return miniArt(art)?.aenderung(alt, neu) ?? null;
}

/** Nicht bedienbare Zeichnung eines Bühnenstands (Leinwand, Regie-Vorschau). */
export function erzeugeAnzeige(inhalte: OeffentlicheInhalte, version: string, eingebettet: boolean): Anzeige {
  const element = h('div', { class: 'anzeige', inert: true });
  let schluessel = '';
  const nachOben = (): void => {
    if (eingebettet) element.scrollTop = 0;
    else if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };
  /** Rollt ein Element unter die klebende Leiste (Vorschau: im eigenen Rahmen, maßstabsgerecht; Leinwand: das Fenster). */
  const zeigeUnterLeiste = (wahl: string, nurFallsVerdeckt = false): void => {
    const ziel = element.querySelector<HTMLElement>(wahl);
    if (ziel === null) return;
    const leiste = element.querySelector<HTMLElement>('.gs-leiste')?.getBoundingClientRect().height ?? 0;
    const q = ziel.getBoundingClientRect();
    if (nurFallsVerdeckt) {
      const r = eingebettet ? element.getBoundingClientRect() : { top: 0, bottom: typeof window !== 'undefined' ? window.innerHeight : 0 };
      if (q.top >= r.top + leiste && q.bottom <= r.bottom) return;
    }
    const um = q.top - leiste - 16;
    if (eingebettet) {
      const r = element.getBoundingClientRect();
      const massstab = element.offsetWidth > 0 && r.width > 0 ? r.width / element.offsetWidth : 1;
      element.scrollTop += (um - r.top) / massstab;
    } else if (typeof window !== 'undefined') window.scrollBy(0, Math.round(um));
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
      const alt = schluessel !== '' ? JSON.parse(schluessel) as Buehne : null;
      const gleicherOrt = alt !== null && alt.bereich === b.bereich && alt.thema === b.thema && alt.werkzeug === b.werkzeug && JSON.stringify(alt.story.schritt) === JSON.stringify(b.story.schritt);
      // P17.6: eine neue Wahl an der Frage – die Leinwand rollt zur Folge (wie die Fläche), damit die Runde sie sieht
      const s = b.story.schritt;
      const neueWahl = gleicherOrt && b.bereich === 'story' && s.ort === 'kapitel' && s.teil === 'frage'
        && b.story.wahlen[s.kapitel] !== undefined && alt.story.wahlen[s.kapitel] !== b.story.wahlen[s.kapitel];
      // neue Gewichte im Vergleich: die Karten mit Platz und Punkten rücken ins Bild – die Runde sieht die Umordnung
      const neueGewichte = gleicherOrt && b.bereich === 'story' && s.ort === 'kapitel' && s.teil === 'vergleich'
        && JSON.stringify(alt.story.gewichte) !== JSON.stringify(b.story.gewichte);
      // Mini-Aufgabe aus der Regie: der zuletzt gesetzte Posten rückt ins Bild, falls er außerhalb steht
      const miniPosten = gleicherOrt && b.bereich === 'story' && s.ort === 'kapitel' && s.teil === 'mini'
        ? geaenderterPosten(inhalte.geschichte?.kapitel.find((k) => k.id === s.kapitel)?.mini?.art ?? 'zuordnen', alt.story.mini[s.kapitel] ?? [], b.story.mini[s.kapitel] ?? []) : null;
      schluessel = neu;
      let seite: HTMLElement;
      if (b.bereich === 'story') seite = storyAnzeige(inhalte, b);
      else if (b.bereich === 'theorie') seite = baueTheorie({ inhalte, thema: b.thema, version, bedienbar: false });
      else if (b.bereich === 'explore') seite = baueExplore({ inhalte, werkzeug: b.werkzeug, werkzeugStand: b.werkzeugStand, bedienbar: false });
      else {
        seite = baueStart({
          startseite: inhalte.startseite,
          themenAnzahl: themen(inhalte).length,
          kapitelAnzahl: inhalte.geschichte?.kapitel.length ?? 0,
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
      // R77: ein Werkzeug rückt mit Schritt und Ergebnis ins Bild (Kopf und Einleitung bleiben oberhalb) – jeder neue Stand, auch Beispiel und Schritt
      if (b.bereich === 'explore') zeigeUnterLeiste(element.querySelector('.wz-raster') !== null ? '.wz-raster' : '.ex-buehne');
      if (neueWahl) zeigeUnterLeiste('[data-pruef="gs-folge"]');
      else if (neueGewichte) zeigeUnterLeiste('[data-pruef="gs-vgl-karten"]');
      else if (miniPosten !== null) zeigeUnterLeiste(`[data-pruef="posten-${miniPosten + 1}"]`, true);
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
    const b = pruefeBuehne(n.zustand, o.inhalte.geschichte, (id) => beispielKennungen(o.inhalte.werkzeuge, id));
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
