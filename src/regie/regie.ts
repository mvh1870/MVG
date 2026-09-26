/*
 * Regie (O-9): die Moderation steuert, die Leinwand zeigt.
 *
 *   Kopf (Leinwand öffnen, Verbindung) · Vorschau der Leinwand · Zurück/Weiter · Fläche ·
 *   Kundenwahl und Eingriffe · Regie-Notiz und Leitfragen · Gesprächsprotokoll
 *
 * Die Regie hält den Zustand (eigene Sitzung) und schickt nach jeder Änderung den ÖFFENTLICHEN
 * Zustand (`oeffentlich()`, ohne Protokoll) über den Kanal. Notizen und Leitfragen kommen aus
 * `regieFuer()` und bleiben in diesem Fenster; die Vorschau zeichnet mit derselben Anzeige wie die
 * Leinwand (erzeugeAnzeige), also ebenfalls ohne Regie-Material.
 */

import type { Aktion, OeffentlicherZustand, Zustand } from '../engine/typen.ts';
import type { OeffentlicheInhalte, RegieEintrag } from '../inhalte/typen.ts';
import { oeffentlich } from '../engine/zustand.ts';
import type { Kanal } from './kanal.ts';
import type { Sitzung } from '../ui/sitzung.ts';
import { h, attr, text, ersetze } from '../ui/h.ts';
import { bildmarke } from '../ui/marke.ts';
import { sym } from '../ui/bausteine/bloecke.ts';
import { inhalt } from '../ui/bausteine/inhalt.ts';
import { aktuelleStation, eingriffe, kicker, sichtbareSchritte, tafelTitel, weiterAktion, zurueckAktion } from '../ui/anzeige.ts';
import { erzeugeAnzeige } from './leinwand.ts';
import { kapitelListe } from '../ui/flaechen/theorie.ts';
import { W } from '../ui/woerter.ts';

export interface RegieOptionen {
  inhalte: OeffentlicheInhalte;
  sitzung: Sitzung;
  kanal: Kanal | null;
  version: string;
  /** Regie-Material je Station/Rolle (nur die Regie bekommt es) */
  regieFuer: (station: string, rolle: string | null) => { station: RegieEintrag | null; szene: RegieEintrag | null };
  /** öffnet das Leinwand-Fenster */
  oeffneLeinwand: () => void;
  /** Takt der Verbindungsprüfung in ms */
  takt?: number;
}

export interface RegieFlaeche {
  element: HTMLElement;
  taste(e: KeyboardEvent): boolean;
  entferne(): void;
}

const BUEHNE = { breite: 1280, hoehe: 720 };

export function erzeugeRegie(o: RegieOptionen): RegieFlaeche {
  const { inhalte, sitzung } = o;
  const w = W.regie;
  const tue = (a: Aktion): void => {
    sitzung.tue(a);
  };

  /* ------------------------------------------------------------------ Kopf -- */
  const verbindung = h('span', { class: 'regie-verbindung', 'data-status': 'neutral', 'data-pruef': 'leinwand-status', role: 'status' }, w.nichtVerbunden);
  const kopf = h('header', { class: 'regie-kopf' },
    bildmarke('marke-logo'),
    h('h1', { class: 'regie-titel' }, w.titel, h('span', { class: 'nur-sr' }, ' – '), h('span', { class: 'regie-unterzeile' }, W.produkt)),
    verbindung,
    h('button', { type: 'button', class: 'knopf knopf-gold regie-oeffnen', 'data-pruef': 'leinwand-oeffnen', onclick: () => o.oeffneLeinwand() },
      sym('diagramm'), h('span', null, h('b', null, w.leinwandOeffnen))));

  /* -------------------------------------------------------------- Vorschau -- */
  const anzeige = erzeugeAnzeige(inhalte, o.version, true);
  const buehne = h('div', { class: 'vorschau-buehne', style: `width:${BUEHNE.breite}px;height:${BUEHNE.hoehe}px` }, anzeige.element);
  const rahmen = h('div', { class: 'vorschau-rahmen', 'aria-hidden': 'true' }, buehne);
  const massstab = (): void => {
    const b = rahmen.clientWidth;
    if (b > 0) buehne.style.transform = `scale(${(b / BUEHNE.breite).toFixed(4)})`;
  };
  const beobachter = typeof ResizeObserver === 'function' ? new ResizeObserver(massstab) : null;
  beobachter?.observe(rahmen);
  const ort = h('p', { class: 'regie-ort', 'data-pruef': 'regie-ort' });

  /* ------------------------------------------------------------- Steuerung -- */
  const zurueckKnopf = h('button', { type: 'button', class: 'knopf knopf-still', 'data-pruef': 'regie-zurueck', onclick: () => schritt(-1) }, sym('pfeilLinks'), W.zurueck);
  const weiterKnopf = h('button', { type: 'button', class: 'knopf knopf-navy', 'data-pruef': 'regie-weiter', onclick: () => schritt(1) }, h('span', null, h('b', null, W.weiter)), sym('pfeilRechts'));
  const bereichKnopf = (bereich: 'start' | 'story' | 'theorie', beschriftung: string): HTMLButtonElement => h('button', {
    type: 'button', class: 'regie-chip', 'data-bereich': bereich, 'data-pruef': `regie-bereich-${bereich}`, 'aria-pressed': 'false',
    onclick: () => {
      const z = sitzung.zustand();
      if (bereich === 'story' && z.station === null) tue({ art: 'starteStory' });
      else tue({ art: 'wechsleBereich', bereich });
    },
  }, beschriftung);
  const bereiche = [bereichKnopf('start', w.start), bereichKnopf('story', w.story), bereichKnopf('theorie', w.theorie)];
  const kapitelKnoepfe = kapitelListe(inhalte).filter((k) => k.seite).map((k) => h('button', {
    type: 'button', class: 'regie-chip', 'data-kapitel': k.nr, 'data-pruef': `regie-kapitel-${k.nr}`, 'aria-pressed': 'false',
    onclick: () => tue({ art: 'oeffneKapitel', kapitel: k.nr }),
  }, `${W.theorie.kapitel} ${k.nr}`));
  const neuKnopf = h('button', { type: 'button', class: 'regie-chip', 'data-pruef': 'regie-neustart', onclick: () => tue({ art: 'neustart' }) }, sym('zurueckspulen'), W.seite.neu);
  const steuerung = h('section', { class: 'regie-karte regie-steuerung', 'aria-label': w.titel },
    h('div', { class: 'regie-blaettern' }, zurueckKnopf, weiterKnopf),
    h('div', { class: 'regie-zeile' }, h('span', { class: 't-label' }, w.bereich), bereiche, kapitelKnoepfe, neuKnopf));

  const eingriffListe = h('div', { class: 'regie-eingriffe', role: 'group', 'aria-label': w.kundenwahl, 'data-pruef': 'regie-eingriffe' });
  const eingriffKarte = h('section', { class: 'regie-karte' }, h('h2', { class: 'regie-h2' }, w.kundenwahl), eingriffListe);

  /* ----------------------------------------------------------------- Notiz -- */
  const notizInhalt = h('div', { class: 'regie-notiz-inhalt' });
  const notiz = h('section', { class: 'regie-karte regie-notiz', 'data-pruef': 'regie-notiz', 'aria-label': w.notiz },
    h('h2', { class: 'regie-h2' }, sym('lesezeichen'), w.notiz), notizInhalt, h('p', { class: 'regie-leise' }, w.nurRegie));

  /* ------------------------------------------------------------- Protokoll -- */
  const feld = h('textarea', { class: 'regie-feld', rows: 2, 'aria-label': w.protokollFeld, placeholder: w.protokollFeld, 'data-pruef': 'regie-protokoll-feld' });
  const protokollListe = h('ol', { class: 'regie-protokoll-liste' });
  const protokoll = h('section', { class: 'regie-karte regie-protokoll', 'aria-label': w.protokoll },
    h('h2', { class: 'regie-h2' }, w.protokoll),
    h('div', { class: 'regie-protokoll-eingabe' }, feld,
      h('button', { type: 'button', class: 'knopf knopf-still', onclick: () => {
        const t = feld.value.trim();
        if (t === '') return;
        tue({ art: 'notiere', text: t, zeit: Date.now() });
        feld.value = '';
      } }, w.protokollSichern)),
    protokollListe);

  const element = h('div', { class: 'regie', 'data-pruef': 'regie' },
    kopf,
    h('div', { class: 'regie-raster' },
      h('div', { class: 'regie-links' },
        h('section', { class: 'regie-vorschau', 'aria-label': w.vorschau }, h('span', { class: 't-label' }, w.vorschau), ort, rahmen),
        steuerung),
      h('div', { class: 'regie-rechts' }, notiz, eingriffKarte, protokoll)),
    h('footer', { class: 'regie-fuss' }, h('span', null, o.version), h('span', { class: 'start-vermerk' }, W.ungeprueft)));

  /* -------------------------------------------------------------- Handeln -- */
  function schritt(richtung: 1 | -1): void {
    const z = oeffentlich(sitzung.zustand());
    const a = richtung === 1 ? weiterAktion(z, inhalte) : zurueckAktion(z, inhalte);
    if (a !== null) tue(a);
  }

  /* -------------------------------------------------------------- Zeichnen -- */
  let nr = 0;
  const sende = (z: Zustand): void => {
    nr += 1;
    o.kanal?.senden({ art: 'zustand', nr, zustand: oeffentlich(z) });
  };

  const zeichneNotiz = (z: OeffentlicherZustand): void => {
    if (z.station === null || z.bereich !== 'story') {
      ersetze(notizInhalt, h('p', { class: 'regie-leise' }, w.keineNotiz));
      return;
    }
    const r = o.regieFuer(z.station, z.rolle);
    const teile: Node[] = [];
    for (const e of [r.szene, r.station]) {
      if (e === null) continue;
      if (e.notiz !== null) teile.push(h('div', { class: 'regie-notiz-text' }, inhalt(e.notiz)));
      if (e.leitfragen.length > 0) {
        teile.push(h('h3', { class: 'regie-h3' }, w.leitfragen), h('ol', { class: 'regie-leitfragen', 'data-pruef': 'regie-leitfragen' }, e.leitfragen.map((f) => h('li', null, f))));
      }
    }
    ersetze(notizInhalt, teile.length > 0 ? teile : h('p', { class: 'regie-leise' }, w.keineNotiz));
  };

  const zeichne = (z: Zustand, aktion: Aktion | null): void => {
    const oz = oeffentlich(z);
    anzeige.setze(oz, aktion);
    massstab();
    // Ort
    const st = aktuelleStation(oz, inhalte);
    if (oz.bereich === 'story' && st !== null) {
      const schritte = sichtbareSchritte(st, oz.rolle);
      text(ort, `${st.kurztitel || st.titel} · ${kicker(schritte, oz.schritt)} · ${tafelTitel(schritte, oz.schritt)}`);
    } else if (oz.bereich === 'theorie') {
      text(ort, oz.theorie.kapitel !== null ? `${w.theorie} · ${W.theorie.kapitelVon(String(oz.theorie.kapitel))}` : w.theorie);
    } else {
      text(ort, w.start);
    }
    attr(weiterKnopf, 'disabled', weiterAktion(oz, inhalte) === null);
    attr(zurueckKnopf, 'disabled', zurueckAktion(oz, inhalte) === null);
    const aktiv = oz.bereich === 'story' && oz.station !== null ? 'story' : oz.bereich === 'theorie' ? 'theorie' : 'start';
    for (const b of bereiche) attr(b, 'aria-pressed', b.dataset['bereich'] === aktiv ? 'true' : 'false');
    for (const b of kapitelKnoepfe) attr(b, 'aria-pressed', aktiv === 'theorie' && Number(b.dataset['kapitel']) === oz.theorie.kapitel ? 'true' : 'false');
    // Eingriffe
    const liste = eingriffe(oz, inhalte);
    ersetze(eingriffListe, liste.length > 0
      ? liste.map((e) => h('button', {
        type: 'button', class: 'regie-chip', 'aria-pressed': e.gedrueckt ? 'true' : 'false', 'data-pruef': e.pruef,
        onclick: () => tue(e.aktion.art === 'waehle' ? { ...e.aktion, zeit: Date.now() } : e.aktion),
      }, e.beschriftung))
      : h('p', { class: 'regie-leise' }, w.keineEingriffe));
    zeichneNotiz(oz);
    // Protokoll
    ersetze(protokollListe, z.regie.protokoll.slice(-6).reverse().map((p) => h('li', null,
      h('span', { class: 'regie-zeit mono' }, new Date(p.zeit).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })), ' ', p.text)));
  };

  const abSitzung = sitzung.abonniere((neu, _alt, aktion) => {
    zeichne(neu, aktion);
    sende(neu);
  });
  zeichne(sitzung.zustand(), null);

  /* ------------------------------------------------------------- Verbindung -- */
  let letztesZeichen = 0;
  const setzeVerbindung = (an: boolean): void => {
    attr(verbindung, 'data-status', an ? 'ok' : 'neutral');
    text(verbindung, an ? w.verbunden : w.nichtVerbunden);
  };
  const abKanal = o.kanal?.abonnieren((n) => {
    if (n.art === 'hallo') sende(sitzung.zustand());
    if (n.art === 'lebenszeichen' || n.art === 'hallo') {
      letztesZeichen = Date.now();
      setzeVerbindung(true);
    }
  }) ?? null;
  const pruefer = setInterval(() => {
    if (letztesZeichen > 0 && Date.now() - letztesZeichen > 3500) setzeVerbindung(false);
  }, o.takt ?? 1000);
  o.kanal?.senden({ art: 'hallo' });
  sende(sitzung.zustand());

  return {
    element,
    taste(e) {
      const ziel = e.target instanceof HTMLElement ? e.target : null;
      if (ziel !== null && (ziel instanceof HTMLTextAreaElement || ziel instanceof HTMLInputElement)) return false;
      if (e.altKey || e.ctrlKey || e.metaKey) return false;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        schritt(1);
        return true;
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        schritt(-1);
        return true;
      }
      if (/^[a-dA-D]$/.test(e.key) && !e.shiftKey) {
        const z = oeffentlich(sitzung.zustand());
        const e0 = eingriffe(z, inhalte).find((x) => x.aktion.art === 'waehle' && x.aktion.option === e.key.toUpperCase());
        if (e0 !== undefined) {
          tue({ art: 'waehle', option: e.key.toUpperCase(), zeit: Date.now() });
          return true;
        }
      }
      return false;
    },
    entferne() {
      clearInterval(pruefer);
      abSitzung();
      abKanal?.();
      beobachter?.disconnect();
      anzeige.entferne();
      element.remove();
    },
  };
}
