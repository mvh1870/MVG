/*
 * Leinwand (O-9): zeigt nur, was die Regie über den Kanal schickt – den öffentlichen Zustand.
 *
 * SCHUTZ DURCH KONSTRUKTION. Dieses Modul importiert nur die öffentlichen Inhalte (`inhalte`, ohne
 * Regie-Material) und bekommt nur `OeffentlicherZustand` (ohne Protokoll). Notizen und Leitfragen
 * kann die Leinwand deshalb nicht zeichnen, auch nicht aus Versehen. Sie ist nicht bedienbar
 * (`inert`), zeichnet dieselben Flächen wie das Hauptfenster und sendet Lebenszeichen, damit die Regie
 * „Leinwand verbunden“ anzeigen kann.
 *
 * `erzeugeAnzeige` ist dieselbe Zeichnung für die Vorschau in der Regie.
 */

import type { Aktion, OeffentlicherZustand } from '../engine/typen.ts';
import type { OeffentlicheInhalte } from '../inhalte/typen.ts';
import { pruefeOeffentlich } from '../engine/zustand.ts';
import type { Kanal } from './kanal.ts';
import { h, ersetze } from '../ui/h.ts';
import { bildmarke } from '../ui/marke.ts';
import { erzeugeStory, type StoryFlaeche } from '../ui/flaechen/story.ts';
import { baueStart } from '../ui/flaechen/start.ts';
import { baueTheorie, kapitelListe, zeigeAktuellenEintrag } from '../ui/flaechen/theorie.ts';
import { W } from '../ui/woerter.ts';

export interface Anzeige {
  element: HTMLElement;
  setze(z: OeffentlicherZustand, aktion: Aktion | null): void;
  entferne(): void;
}

/** Nicht bedienbare Zeichnung eines öffentlichen Zustands (Leinwand, Regie-Vorschau). */
export function erzeugeAnzeige(inhalte: OeffentlicheInhalte, version: string, eingebettet: boolean): Anzeige {
  const element = h('div', { class: 'anzeige', inert: true });
  let story: StoryFlaeche | null = null;
  let bereichJetzt = '';
  let theorieJetzt: number | null | undefined;

  return {
    element,
    setze(z, aktion) {
      const bereich = z.bereich === 'story' && z.station !== null ? 'story' : z.bereich === 'theorie' ? 'theorie' : 'start';
      if (bereich === 'story') {
        if (story === null || bereichJetzt !== 'story') {
          story?.entferne();
          story = erzeugeStory({ inhalte, tue: null, eingebettet });
          ersetze(element, story.element);
        }
        story.setze(z, bereichJetzt === 'story' ? aktion : null);
      } else if (bereich === 'theorie') {
        if (bereichJetzt !== 'theorie' || theorieJetzt !== z.theorie.kapitel) {
          story?.entferne();
          story = null;
          const seite = baueTheorie({ inhalte, kapitel: z.theorie.kapitel, version, bedienbar: false });
          ersetze(element, seite);
          // die Leinwand ist inert: niemand kann das Verzeichnis rollen – der aktuelle Eintrag muss von selbst sichtbar sein
          zeigeAktuellenEintrag(seite);
          theorieJetzt = z.theorie.kapitel;
        }
      } else if (bereichJetzt !== 'start') {
        story?.entferne();
        story = null;
        ersetze(element, baueStart({
          startseite: inhalte.startseite,
          kapitelAnzahl: kapitelListe(inhalte).length,
          rollenAnzahl: inhalte.rollenFolge.length,
          weiterlesen: false,
          fassung: inhalte.whitepaper.fassung ?? '',
          version,
          bedienbar: false,
        }));
      }
      if (bereich !== 'theorie') theorieJetzt = undefined;
      bereichJetzt = bereich;
    },
    entferne() {
      story?.entferne();
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
  const warten = h('div', { class: 'leinwand-warten', 'data-pruef': 'leinwand-warten' },
    bildmarke('marke-logo'),
    h('p', { class: 'leinwand-warten-titel' }, W.leinwand.warten),
    h('p', null, W.leinwand.wartenHinweis));
  const element = h('section', { class: 'leinwand', 'data-pruef': 'leinwand', 'aria-label': W.leinwand.titel }, warten);
  ersetze(wurzel, element);
  let empfangen = false;
  let nr = 0;

  const ab = o.kanal.abonnieren((n) => {
    if (n.art === 'anzeige') {
      element.classList.toggle('ist-beamer', n.beamer);
      return;
    }
    if (n.art !== 'zustand') return;
    const z = pruefeOeffentlich(n.zustand);
    if (z === null) return;
    if (!empfangen) {
      empfangen = true;
      ersetze(element, anzeige.element);
    }
    anzeige.setze(z, null);
  });
  o.kanal.senden({ art: 'hallo' });
  const lebenszeichen = setInterval(() => {
    nr += 1;
    o.kanal.senden({ art: 'lebenszeichen', nr });
    // Solange nichts kam, erneut grüßen (die Regie kann später geöffnet worden sein).
    if (!empfangen && nr % 3 === 0) o.kanal.senden({ art: 'hallo' });
  }, o.takt ?? 1000);

  return () => {
    clearInterval(lebenszeichen);
    ab();
    anzeige.entferne();
  };
}
