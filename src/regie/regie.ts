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
import type { Einwand, OeffentlicheInhalte, RegieEintrag } from '../inhalte/typen.ts';
import { oeffentlich } from '../engine/zustand.ts';
import type { Kanal } from './kanal.ts';
import type { Sitzung } from '../ui/sitzung.ts';
import { h, attr, text, ersetze } from '../ui/h.ts';
import { bildmarke } from '../ui/marke.ts';
import { sym } from '../ui/bausteine/bloecke.ts';
import * as B from '../ui/bausteine/bloecke.ts';
import { inhalt } from '../ui/bausteine/inhalt.ts';
import { aktuelleStation, eingriffe, kicker, sichtbareSchritte, stationsName, tafelTitel, weiterAktion, zurueckAktion } from '../ui/anzeige.ts';
import { erzeugeAnzeige } from './leinwand.ts';
import { kapitelListe } from '../ui/flaechen/theorie.ts';
import { findeEntscheidung } from '../engine/graph.ts';
import { W } from '../ui/woerter.ts';

export interface RegieOptionen {
  inhalte: OeffentlicheInhalte;
  sitzung: Sitzung;
  kanal: Kanal | null;
  version: string;
  /** Regie-Material je Station/Rolle (nur die Regie bekommt es) */
  regieFuer: (station: string, rolle: string | null) => { station: RegieEintrag | null; szene: RegieEintrag | null };
  /** Regie-Material einer Lernseite (P9.2) */
  regieKapitel?: (kapitel: number) => RegieEintrag | null;
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
  // Beamer-Schalter (E10): größere Schrift und höherer Kontrast auf der Leinwand (und in der Vorschau)
  let beamer = false;
  let anzeigeNr = 0;
  const sendeAnzeige = (): void => {
    anzeigeNr += 1;
    o.kanal?.senden({ art: 'anzeige', nr: anzeigeNr, beamer });
  };
  const beamerKnopf = h('button', {
    type: 'button', class: 'regie-chip', 'aria-pressed': 'false', 'data-pruef': 'regie-beamer',
    onclick: () => {
      beamer = !beamer;
      attr(beamerKnopf, 'aria-pressed', beamer ? 'true' : 'false');
      buehne.classList.toggle('ist-beamer', beamer);
      sendeAnzeige();
    },
  }, sym('diagramm'), w.beamer);
  const verbindung = h('span', { class: 'regie-verbindung', 'data-status': 'neutral', 'data-pruef': 'leinwand-status', role: 'status' }, w.nichtVerbunden);
  const kopf = h('header', { class: 'regie-kopf' },
    bildmarke('marke-logo'),
    h('h1', { class: 'regie-titel' }, w.titel, h('span', { class: 'nur-sr' }, ' – '), h('span', { class: 'regie-unterzeile' }, W.produkt)),
    verbindung,
    h('button', { type: 'button', class: 'regie-chip', 'data-pruef': 'regie-ein-fenster', onclick: () => einFenster(true) }, sym('diagramm'), w.einFenster),
    beamerKnopf,
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
  // Regie-Eingriffe (P9.4): zu jeder Station springen (Welt B erst nach der Freischaltung), Rolle umschalten
  const sprung = h('select', { class: 'regie-auswahl', id: 'regie-sprung', 'data-pruef': 'regie-sprung' },
    h('option', { value: '' }, w.sprungWaehlen),
    inhalte.stationsFolge.map((id) => h('option', { value: id, 'data-welt': inhalte.stationen[id]?.welt ?? '' }, stationsName(inhalte, id)))) as HTMLSelectElement;
  sprung.addEventListener('change', () => {
    if (sprung.value !== '') {
      if (sitzung.zustand().station === null) tue({ art: 'starteStory' });
      tue({ art: 'geheZu', station: sprung.value, schritt: 0 });
    }
    sprung.value = '';
  });
  const rollenWahl = h('select', { class: 'regie-auswahl', id: 'regie-rollenwahl', 'data-pruef': 'regie-rollenwahl' },
    inhalte.rollenFolge.filter((id) => inhalte.rollen[id]?.spielbar).map((id) => h('option', { value: id }, inhalte.rollen[id]?.kurztitel ?? id))) as HTMLSelectElement;
  rollenWahl.addEventListener('change', () => tue({ art: 'waehleRolle', rolle: rollenWahl.value }));
  const steuerung = h('section', { class: 'regie-karte regie-steuerung', 'aria-label': w.titel },
    h('div', { class: 'regie-blaettern' }, zurueckKnopf, weiterKnopf),
    h('div', { class: 'regie-zeile' }, h('span', { class: 't-label' }, w.bereich), bereiche, kapitelKnoepfe, neuKnopf),
    h('div', { class: 'regie-zeile' },
      h('label', { for: 'regie-sprung', class: 't-label' }, w.sprung), sprung,
      h('label', { for: 'regie-rollenwahl', class: 't-label' }, w.rolleUmschalten), rollenWahl));

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
    protokollListe,
    h('button', { type: 'button', class: 'knopf knopf-still', 'data-pruef': 'regie-drucken', onclick: () => drucke() }, w.protokollDrucken));

  // Druckfassung (P9.3): Datum, alle Protokolleinträge, besuchte Stationen und die eigenen Entscheidungen
  const druck = h('section', { class: 'regie-druck', 'aria-hidden': 'true', 'data-pruef': 'regie-druck' });
  const drucke = (): void => {
    const z = sitzung.zustand();
    const oz = oeffentlich(z);
    const datum = new Date().toLocaleString('de-DE', { dateStyle: 'long', timeStyle: 'short' });
    ersetze(druck,
      h('h1', null, w.druckTitel),
      h('p', null, `${W.produkt} · ${o.version} · ${datum}`),
      h('p', null, `${W.fiktiv} · ${W.ungeprueft}`),
      h('h2', null, w.protokoll),
      z.regie.protokoll.length > 0
        ? h('ol', null, z.regie.protokoll.map((p) => h('li', null, h('span', { class: 'mono' }, new Date(p.zeit).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })), ' ', p.text)))
        : h('p', null, w.druckLeer),
      h('h2', null, w.druckWeg),
      h('p', null, [...new Set(oz.verlauf)].map((id) => stationsName(inhalte, id)).join(' → ') || '–'),
      h('h2', null, w.druckEntscheidungen),
      oz.spur.length > 0 ? h('ul', null, oz.spur.map((e) => {
        const opt = findeEntscheidung(inhalte, e.entscheidung)?.entscheidung.optionen.find((x) => x.id === e.option);
        return h('li', null, `${stationsName(inhalte, e.station)}: ${e.option} · ${opt?.kurz ?? ''}`);
      })) : h('p', null, '–'));
    document.body.classList.add('druck-protokoll');
    const ende = (): void => { document.body.classList.remove('druck-protokoll'); window.removeEventListener('afterprint', ende); };
    window.addEventListener('afterprint', ende);
    if (typeof window.print === 'function') window.print();
  };

  // Ein-Fenster-Regie (P9.1): die Vorschau füllt das Fenster, Pfeiltasten steuern weiter, Esc kehrt zurück
  const zurueckAusVollbild = h('button', { type: 'button', class: 'regie-chip regie-vollbild-zurueck', 'data-pruef': 'regie-ein-fenster-aus', onclick: () => einFenster(false) }, w.einFensterAus);
  let vollbild = false;
  function einFenster(an: boolean): void {
    vollbild = an;
    element.classList.toggle('ist-ein-fenster', an);
    if (an) zurueckAusVollbild.focus();
    massstab();
  }

  const element = h('div', { class: 'regie', 'data-pruef': 'regie' },
    kopf,
    h('div', { class: 'regie-raster' },
      h('div', { class: 'regie-links' },
        h('section', { class: 'regie-vorschau', 'aria-label': w.vorschau }, h('span', { class: 't-label' }, w.vorschau), ort, rahmen, zurueckAusVollbild),
        steuerung),
      h('div', { class: 'regie-rechts' }, notiz, eingriffKarte, protokoll)),
    h('footer', { class: 'regie-fuss' }, h('span', null, o.version), h('span', { class: 'start-vermerk' }, W.ungeprueft)),
    druck);

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

  /** Einwand-Karten (E6) als Spickzettel: zur Station oder zum Kapitel passend. */
  const einwaendeFuer = (z: OeffentlicherZustand): Einwand[] => inhalte.einwaende.filter((e) =>
    (z.bereich === 'story' && z.station !== null && e.stationen.includes(z.station))
    || (z.bereich === 'theorie' && z.theorie.kapitel !== null && e.kapitel.some((k) => k.split('.')[0] === String(z.theorie.kapitel))));
  const spickzettel = (liste: Einwand[]): Node[] => liste.length === 0 ? [] : [
    h('h3', { class: 'regie-h3' }, w.einwaende),
    h('div', { class: 'regie-einwaende', 'data-pruef': 'regie-einwaende' }, liste.map((e) => h('details', { class: 'regie-einwand', 'data-pruef': `regie-einwand-${e.id}` },
      h('summary', null, inhalt(e.felder.einwand ?? '')),
      h('div', { class: 'regie-einwand-antwort' }, inhalt(e.felder.antwort ?? ''), e.bloecke.map((b) => B.block(b, inhalte, W.originalWoertlich)))))),
  ];

  const zeichneNotiz = (z: OeffentlicherZustand): void => {
    if (z.bereich === 'theorie' && z.theorie.kapitel !== null) {
      const e = o.regieKapitel?.(z.theorie.kapitel) ?? null;
      const teile: Node[] = [];
      if (e?.notiz) teile.push(h('div', { class: 'regie-notiz-text' }, inhalt(e.notiz)));
      if (e !== null && e.leitfragen.length > 0) teile.push(h('h3', { class: 'regie-h3' }, w.leitfragen), h('ol', { class: 'regie-leitfragen', 'data-pruef': 'regie-leitfragen' }, e.leitfragen.map((f) => h('li', null, f))));
      teile.push(...spickzettel(einwaendeFuer(z)));
      ersetze(notizInhalt, teile.length > 0 ? teile : h('p', { class: 'regie-leise' }, w.keineNotiz));
      return;
    }
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
    teile.push(...spickzettel(einwaendeFuer(z)));
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
    for (const opt of sprung.querySelectorAll('option')) if (opt.dataset['welt'] === 'B') attr(opt, 'disabled', !oz.freigeschaltet.weltB);
    attr(rollenWahl, 'disabled', oz.rolle === null);
    if (oz.rolle !== null) rollenWahl.value = oz.rolle;
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
    if (n.art === 'hallo') {
      sende(sitzung.zustand());
      sendeAnzeige();
    }
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
      if (e.key === 'Escape' && vollbild) {
        einFenster(false);
        return true;
      }
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
