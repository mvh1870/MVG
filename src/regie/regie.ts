/*
 * Regie (O-9, O-46, P16.9): die Moderation steuert, die Leinwand zeigt.
 *
 *   Kopf (Leinwand öffnen, Verbindung, Beamer) · Vorschau der Leinwand · Zurück/Weiter · Bereich,
 *   Thema, Werkzeug, Station · Kundenwahl · Regie-Notiz und Leitfragen · Gesprächsprotokoll
 *
 * Die Regie hält den Bühnenstand (eigener Speicher) und schickt nach jeder Änderung den öffentlichen
 * Stand (`Buehne`) über den Kanal. Notizen und Leitfragen kommen aus `regieGeschichte()` bzw.
 * `regieKapitel()` und bleiben in diesem Fenster; die Vorschau zeichnet mit derselben Anzeige wie die
 * Leinwand (erzeugeAnzeige), also ebenfalls ohne Regie-Material.
 */

import type { GeschichteRegie, OeffentlicheInhalte, RegieEintrag } from '../inhalte/typen.ts';
import {
  abgestimmteGewichte, gemischt, gewichte, kapitel, klickeReihe, miniVonVorn, neuerStand, ordneZu, schritte, schrittIndex, setzeAbgestimmt,
  setzeGewicht, setzeKurz, STUFEN_GEWICHT, teileVon, vergleichLage, waehle, werteMiniAus, weiter, zurueck, type Schritt, type Stand,
} from '../geschichte/engine.ts';
import type { Kapitel, Mini } from '../geschichte/typen.ts';
import { ersteWorte, loeseMini, nurText, ohneWahl, schrittAus, schrittWert, springe, sprungZiele } from './eingriffe.ts';
import { ortText as storyOrt } from '../ui/flaechen/geschichte.ts';
import { kanalSchluessel, type Kanal } from './kanal.ts';
import { neueBuehne, pruefeBuehne, BUEHNEN_BEREICHE, type Buehne, type BuehnenBereich } from './buehne.ts';
import { h, attr, text, ersetze } from '../ui/h.ts';
import { bildmarke } from '../ui/marke.ts';
import { sym } from '../ui/bausteine/bloecke.ts';
import { inhalt, inhaltInline } from '../ui/bausteine/inhalt.ts';
import { erzeugeAnzeige } from './leinwand.ts';
import { themen, themaSeite } from '../ui/flaechen/theorie.ts';
import { WERKZEUGE, werkzeugAus } from '../ui/flaechen/explore.ts';
import { bogenFuerStrgP, bogenKopf, druckeBogen } from '../ui/druck.ts';
import { W } from '../ui/woerter.ts';
import { bmLink, DATENSCHUTZ_SEITE, IMPRESSUM_SEITE } from '../ui/bausteine/seite.ts';

export interface SpeicherGriff {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

export interface RegieOptionen {
  inhalte: OeffentlicheInhalte;
  kanal: Kanal | null;
  version: string;
  speicher: SpeicherGriff | null;
  /** Regie-Material je Kapitel der Story */
  regieGeschichte: (kapitel: string) => GeschichteRegie | null;
  /** Regie-Material eines Themas (über seine interne Nummer) */
  regieKapitel: (kapitel: number) => RegieEintrag | null;
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
export const REGIE_SCHLUESSEL = 'gk.regie';

interface Protokoll { zeit: number; text: string }

export function erzeugeRegie(o: RegieOptionen): RegieFlaeche {
  const { inhalte } = o;
  const g = inhalte.geschichte;
  const w = W.regie;
  const lade = (): { buehne: Buehne; protokoll: Protokoll[] } => {
    try {
      const roh = JSON.parse(o.speicher?.getItem(REGIE_SCHLUESSEL) ?? 'null') as { buehne?: unknown; protokoll?: unknown } | null;
      const b = pruefeBuehne(roh?.buehne, g);
      const p = Array.isArray(roh?.protokoll) ? (roh.protokoll as Protokoll[]).filter((x) => typeof x?.text === 'string' && typeof x?.zeit === 'number') : [];
      return { buehne: b ?? neueBuehne(), protokoll: p };
    } catch {
      return { buehne: neueBuehne(), protokoll: [] };
    }
  };
  let { buehne, protokoll } = lade();
  const speichere = (): void => {
    try { o.speicher?.setItem(REGIE_SCHLUESSEL, JSON.stringify({ buehne, protokoll })); } catch { /* Speicher gesperrt */ }
  };

  /* ------------------------------------------------------------------ Kopf -- */
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
      buehneEl.classList.toggle('ist-beamer', beamer);
      sendeAnzeige();
    },
  }, sym('beamer'), w.beamer);
  const verbindung = h('span', { class: 'regie-verbindung', 'data-status': 'neutral', 'data-pruef': 'leinwand-status', role: 'status' }, w.nichtVerbunden);
  const kopf = h('header', { class: 'regie-kopf' },
    bildmarke('marke-logo'),
    h('h1', { class: 'regie-titel' }, w.titel, h('span', { class: 'nur-sr' }, ' – '), h('span', { class: 'regie-unterzeile' }, W.name)),
    verbindung,
    beamerKnopf,
    h('button', { type: 'button', class: 'knopf knopf-gold regie-oeffnen', 'data-pruef': 'leinwand-oeffnen', onclick: () => o.oeffneLeinwand() },
      sym('diagramm'), h('span', null, h('b', null, w.leinwandOeffnen))));

  /* -------------------------------------------------------------- Vorschau -- */
  const anzeige = erzeugeAnzeige(inhalte, o.version, true);
  const buehneEl = h('div', { class: 'vorschau-buehne', style: `width:${BUEHNE.breite}px;height:${BUEHNE.hoehe}px` }, anzeige.element);
  const rahmen = h('div', { class: 'vorschau-rahmen', 'aria-hidden': 'true' }, buehneEl);
  const massstab = (): void => {
    const b = rahmen.clientWidth;
    if (b > 0) buehneEl.style.transform = `scale(${(b / BUEHNE.breite).toFixed(4)})`;
  };
  const beobachter = typeof ResizeObserver === 'function' ? new ResizeObserver(massstab) : null;
  beobachter?.observe(rahmen);
  const ort = h('p', { class: 'regie-ort', 'data-pruef': 'regie-ort' });

  /* ------------------------------------------------------------- Steuerung -- */
  const zurueckKnopf = h('button', { type: 'button', class: 'knopf knopf-still', 'data-pruef': 'regie-zurueck', onclick: () => schritt(-1) }, sym('pfeilLinks'), w.zurueck);
  const weiterKnopf = h('button', { type: 'button', class: 'knopf knopf-navy', 'data-pruef': 'regie-weiter', onclick: () => schritt(1) }, h('span', null, h('b', null, w.weiter)), sym('pfeilRechts'));
  const bereichsName: Record<BuehnenBereich, string> = { start: w.start, story: W.story, theorie: W.rahmen.theorie, explore: W.rahmen.explore };
  const bereiche = BUEHNEN_BEREICHE.map((b) => h('button', {
    type: 'button', class: 'regie-chip', 'data-bereich': b, 'data-pruef': `regie-bereich-${b}`, 'aria-pressed': 'false',
    onclick: () => setze({ ...buehne, bereich: b }),
  }, bereichsName[b]));
  const themaWahl = h('select', { class: 'regie-auswahl', id: 'regie-thema', 'data-pruef': 'regie-thema' },
    h('option', { value: '' }, w.themenUebersicht),
    themen(inhalte).map((t) => h('option', { value: t.thema }, t.kurztitel))) as HTMLSelectElement;
  themaWahl.addEventListener('change', () => setze({ ...buehne, bereich: 'theorie', thema: themaWahl.value === '' ? null : themaWahl.value }));
  const werkzeugWahl = h('select', { class: 'regie-auswahl', id: 'regie-werkzeug', 'data-pruef': 'regie-werkzeug' },
    WERKZEUGE.map((id) => h('option', { value: id }, inhalte.werkzeuge?.[id].titel ?? id))) as HTMLSelectElement;
  werkzeugWahl.addEventListener('change', () => setze({ ...buehne, bereich: 'explore', werkzeug: werkzeugWahl.value }));
  // Sprung je Schritt (P17.6): Auftakt, je Kapitel Szene · Vergleich · Frage · Mini-Aufgabe, Schulstart
  const teilName = (s: Schritt): string => s.ort === 'kapitel' ? W.geschichte.teile[s.teil] ?? s.teil : s.ort === 'auftakt' ? W.geschichte.auftakt : W.geschichte.ende;
  const sprung = h('select', { class: 'regie-auswahl regie-sprung', id: 'regie-sprung', 'data-pruef': 'regie-sprung' },
    h('option', { value: '' }, w.sprungWaehlen),
    g === null ? null : [
      h('option', { value: 'auftakt' }, W.geschichte.auftakt),
      g.kapitel.map((k) => h('optgroup', { label: `${k.nr} · ${k.titel}` },
        sprungZiele(g).filter((z) => z.schritt.ort === 'kapitel' && z.schritt.kapitel === k.id)
          .map((z) => h('option', { value: z.wert }, `${k.nr} · ${teilName(z.schritt)}`)))),
      h('option', { value: 'ende' }, W.geschichte.ende),
    ]) as HTMLSelectElement;
  const springeZu = (ziel: Schritt): void => {
    if (g !== null) setze({ ...buehne, bereich: 'story', story: springe(g, buehne.story, ziel) });
  };
  sprung.addEventListener('change', () => {
    const ziel = g !== null ? schrittAus(g, sprung.value) : null;
    if (ziel !== null) springeZu(ziel);
    else zeichne();
  });
  // Schnellsprung: Auftakt, 1–8, Schulstart; darunter die Schritte des Kapitels, in dem die Leinwand steht
  const kapitelKnoepfe = h('div', { class: 'regie-kapitel', role: 'group', 'aria-label': w.sprung, 'data-pruef': 'regie-kapitel' });
  const teilKnoepfe = h('div', { class: 'regie-teile', role: 'group', 'aria-label': w.schritteHier, 'data-pruef': 'regie-teile' });
  const kurzKnopf = h('button', { type: 'button', class: 'regie-chip', 'aria-pressed': 'false', 'data-pruef': 'regie-kurz', onclick: () => {
    if (g !== null) setze({ ...buehne, story: setzeKurz(g, buehne.story, !buehne.story.kurz) });
  } }, W.geschichte.kurzfassung);
  const neuKnopf = h('button', { type: 'button', class: 'regie-chip', 'data-pruef': 'regie-neustart', onclick: () => setze({ ...buehne, bereich: 'story', story: neuerStand(buehne.story.kurz) }) }, sym('zurueckspulen'), W.geschichte.vonVorn);
  let rollNr = 0;
  const rolleTafel = (s: -1 | 1): void => {
    anzeige.rolle(s);
    rollNr += 1;
    o.kanal?.senden({ art: 'rollen', nr: rollNr, schritt: s });
  };
  const tafelZeile = h('div', { class: 'regie-zeile', 'data-pruef': 'regie-tafel' },
    h('span', { class: 't-label' }, w.tafel),
    h('button', { type: 'button', class: 'regie-chip', 'data-pruef': 'regie-tafel-hoch', 'aria-label': w.tafelHoch, onclick: () => rolleTafel(-1) }, '↑'),
    h('button', { type: 'button', class: 'regie-chip', 'data-pruef': 'regie-tafel-runter', 'aria-label': w.tafelRunter, onclick: () => rolleTafel(1) }, '↓'),
    h('span', { class: 'regie-leise' }, w.tafelHinweis));
  const steuerung = h('section', { class: 'regie-karte regie-steuerung', 'aria-label': w.titel },
    h('div', { class: 'regie-blaettern' }, zurueckKnopf, weiterKnopf),
    tafelZeile,
    h('div', { class: 'regie-zeile' }, h('span', { class: 't-label' }, w.bereich), bereiche),
    h('div', { class: 'regie-zeile' },
      h('label', { for: 'regie-sprung', class: 't-label' }, w.sprung), sprung, kurzKnopf, neuKnopf),
    kapitelKnoepfe,
    teilKnoepfe,
    h('div', { class: 'regie-zeile' },
      h('label', { for: 'regie-thema', class: 't-label' }, W.rahmen.theorie), themaWahl,
      h('label', { for: 'regie-werkzeug', class: 't-label' }, W.rahmen.explore), werkzeugWahl));

  const eingriffListe = h('div', { class: 'regie-eingriffe', role: 'group', 'aria-label': w.kundenwahl, 'data-pruef': 'regie-eingriffe' });
  const eingriffKarte = h('section', { class: 'regie-karte regie-eingriff-karte' }, h('h2', { class: 'regie-h2' }, w.kundenwahl), eingriffListe);

  /* ----------------------------------------------------------------- Notiz -- */
  const notizInhalt = h('div', { class: 'regie-notiz-inhalt' });
  const notiz = h('section', { class: 'regie-karte regie-notiz', 'data-pruef': 'regie-notiz', 'aria-label': w.notiz },
    h('h2', { class: 'regie-h2' }, sym('lesezeichen'), w.notiz), notizInhalt, h('p', { class: 'regie-leise' }, w.nurRegie));

  /* ------------------------------------------------------------- Protokoll -- */
  const feld = h('textarea', { class: 'regie-feld', rows: 2, 'aria-label': w.protokollFeld, placeholder: w.protokollFeld, 'data-pruef': 'regie-protokoll-feld' });
  const protokollListe = h('ol', { class: 'regie-protokoll-liste' });
  const druckKnopf = h('button', { type: 'button', class: 'knopf knopf-still', 'data-pruef': 'regie-drucken', onclick: () => drucke() }, w.protokollDrucken);
  const protokollKarte = h('section', { class: 'regie-karte regie-protokoll', 'aria-label': w.protokoll },
    h('h2', { class: 'regie-h2' }, w.protokoll),
    h('div', { class: 'regie-protokoll-eingabe' }, feld,
      h('button', { type: 'button', class: 'knopf knopf-still', 'data-pruef': 'regie-protokoll-sichern', onclick: () => {
        const t = feld.value.trim();
        if (t === '') return;
        protokoll = [...protokoll, { zeit: Date.now(), text: t }];
        feld.value = '';
        speichere();
        zeichneProtokoll();
      } }, w.protokollSichern)),
    protokollListe,
    h('div', { class: 'regie-zeile' }, druckKnopf,
      // R67: Notizen bleiben nicht ungefragt im Browser – löscht Protokoll und gespeicherten Stand der Präsentation
      h('button', { type: 'button', class: 'knopf knopf-still', 'data-pruef': 'regie-protokoll-loeschen', onclick: () => {
        protokoll = [];
        try { o.speicher?.removeItem(REGIE_SCHLUESSEL); o.speicher?.removeItem(kanalSchluessel('regie')); } catch { /* Speicher gesperrt */ }
        zeichneProtokoll();
      } }, w.protokollLoeschen)));
  const uhr = (zeit: number): string => new Date(zeit).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const zeichneProtokoll = (): void => {
    ersetze(protokollListe, protokoll.slice(-6).reverse().map((p) => h('li', null, h('span', { class: 'regie-zeit mono' }, uhr(p.zeit)), ' ', p.text)));
  };
  const druckBogen = (): { titel: string; teile: Node[] } => {
    const teil = (...kinder: (Node | null)[]): HTMLElement => h('section', { class: 'druck-teil' }, kinder);
    const entscheidungen = g === null ? [] : g.kapitel.filter((k) => buehne.story.wahlen[k.id] !== undefined).map((k) => {
      const a = k.antworten[buehne.story.wahlen[k.id] ?? 0];
      return h('li', null, `${k.nr} · ${k.titel}: `, inhaltInline(a?.html ?? ''));
    });
    return {
      titel: w.druckTitel,
      teile: [bogenKopf(w.druckTitel, o.version, true), h('div', { class: 'regie-druck-inhalt', 'data-pruef': 'regie-druck' },
        teil(h('h2', null, w.druckEintraege), protokoll.length > 0 ? h('ol', null, protokoll.map((p) => h('li', null, h('span', { class: 'mono' }, uhr(p.zeit)), ' ', p.text))) : h('p', null, w.druckLeer)),
        teil(h('h2', null, w.druckEntscheidungen), entscheidungen.length > 0 ? h('ul', null, entscheidungen) : h('p', null, '–')))],
    };
  };
  const drucke = (): void => {
    const { titel, teile } = druckBogen();
    druckeBogen(titel, teile);
  };
  bogenFuerStrgP(druckKnopf, druckBogen);

  const element = h('div', { class: 'regie', 'data-pruef': 'regie' },
    kopf,
    h('main', { class: 'regie-raster' },
      h('div', { class: 'regie-links' },
        h('section', { class: 'regie-vorschau', 'aria-label': w.vorschau }, h('span', { class: 't-label' }, w.vorschau), ort, rahmen),
        steuerung),
      h('div', { class: 'regie-rechts' }, eingriffKarte, notiz, protokollKarte)),
    // R68: Impressum, Datenschutz und der leise Link auch hier (P16.12 „aus jeder Fläche erreichbar“)
    h('footer', { class: 'regie-fuss' }, h('span', null, o.version),
      h('a', { href: IMPRESSUM_SEITE, 'data-pruef': 'impressum' }, W.rahmen.impressum),
      h('a', { href: DATENSCHUTZ_SEITE, 'data-pruef': 'datenschutz' }, W.rahmen.datenschutz),
      bmLink()));

  /* -------------------------------------------------------------- Handeln -- */
  const themenListe = themen(inhalte).map((t) => t.thema);
  function naechste(b: Buehne, richtung: 1 | -1): Buehne | null {
    if (b.bereich === 'story' && g !== null) {
      const s = richtung === 1 ? weiter(g, b.story) : zurueck(g, b.story);
      return s.schritt === b.story.schritt || JSON.stringify(s.schritt) === JSON.stringify(b.story.schritt) ? null : { ...b, story: s };
    }
    if (b.bereich === 'theorie') {
      const i = b.thema === null ? -1 : themenListe.indexOf(b.thema);
      const ziel = i + richtung;
      if (ziel < -1 || ziel >= themenListe.length) return null;
      return { ...b, thema: ziel === -1 ? null : themenListe[ziel] ?? null };
    }
    if (b.bereich === 'explore') {
      const i = WERKZEUGE.indexOf(werkzeugAus(b.werkzeug));
      const ziel = WERKZEUGE[i + richtung];
      return ziel === undefined ? null : { ...b, werkzeug: ziel };
    }
    return richtung === 1 ? { ...b, bereich: 'story' } : null;
  }
  function schritt(richtung: 1 | -1): void {
    const n = naechste(buehne, richtung);
    if (n !== null) setze(n);
  }

  /* -------------------------------------------------------------- Zeichnen -- */
  let nr = 0;
  const sende = (): void => {
    nr += 1;
    o.kanal?.senden({ art: 'zustand', nr, zustand: buehne });
  };

  const leitfragen = (fragen: readonly string[]): Node[] => fragen.length === 0 ? [] : [h('h3', { class: 'regie-h3' }, w.leitfragen), h('ol', { class: 'regie-leitfragen', 'data-pruef': 'regie-leitfragen' }, fragen.map((f) => h('li', null, f)))];
  const zeichneNotiz = (): void => {
    const leer = h('p', { class: 'regie-leise' }, w.keineNotiz);
    if (buehne.bereich === 'theorie' && buehne.thema !== null) {
      const seite = themaSeite(inhalte, buehne.thema);
      const e = seite !== null ? o.regieKapitel(seite.kapitel) : null;
      const teile: Node[] = [];
      if (e?.notiz) teile.push(h('div', { class: 'regie-notiz-text' }, inhalt(e.notiz)));
      if (e !== null) teile.push(...leitfragen(e.leitfragen));
      ersetze(notizInhalt, teile.length > 0 ? teile : leer);
      return;
    }
    const s = buehne.story.schritt;
    if (buehne.bereich !== 'story' || s.ort !== 'kapitel' || g === null) {
      ersetze(notizInhalt, leer);
      return;
    }
    const r = o.regieGeschichte(s.kapitel);
    const teile: Node[] = [];
    if (r?.notizHtml) teile.push(h('div', { class: 'regie-notiz-text' }, inhalt(r.notizHtml)));
    if (r !== null) teile.push(...leitfragen(r.leitfragen));
    ersetze(notizInhalt, teile.length > 0 ? teile : leer);
  };

  const ortText = (): string => {
    if (buehne.bereich === 'story' && g !== null) {
      const s = buehne.story.schritt;
      const i = schrittIndex(g, buehne.story) + 1;
      const n = schritte(g, buehne.story.kurz).length;
      const teil = s.ort === 'kapitel' ? ` · ${W.geschichte.teile[s.teil] ?? ''}` : '';
      return `${W.story} · ${storyOrt(g, buehne.story)}${teil} · ${i}/${n}`;
    }
    if (buehne.bereich === 'theorie') return `${W.rahmen.theorie} · ${buehne.thema !== null ? themaSeite(inhalte, buehne.thema)?.kurztitel ?? '' : w.themenUebersicht}`;
    if (buehne.bereich === 'explore') return `${W.rahmen.explore} · ${inhalte.werkzeuge?.[werkzeugAus(buehne.werkzeug)].titel ?? ''}`;
    return w.start;
  };

  /** Schnellsprung: Auftakt, Kapitel 1–8, Schulstart; dazu die Schritte des aktuellen Kapitels. */
  const zeichneSprung = (): void => {
    if (g === null) return;
    const s = buehne.story.schritt;
    const inStory = buehne.bereich === 'story';
    const hier = (ziel: Schritt): boolean => inStory && (ziel.ort === 'kapitel' && s.ort === 'kapitel' ? ziel.kapitel === s.kapitel : ziel.ort === s.ort);
    const knopf = (ziel: Schritt, inhaltText: string, name: string, pruef: string, aus = false): HTMLElement => h('button', {
      type: 'button', class: `regie-chip regie-chip-klein${aus ? ' ist-aus' : ''}`, 'aria-pressed': hier(ziel) ? 'true' : 'false', 'aria-label': name, title: name, 'data-pruef': pruef,
      onclick: () => springeZu(ziel),
    }, inhaltText);
    ersetze(kapitelKnoepfe,
      knopf({ ort: 'auftakt' }, W.geschichte.auftakt, W.geschichte.auftakt, 'regie-kapitel-auftakt'),
      g.kapitel.map((k) => knopf({ ort: 'kapitel', kapitel: k.id, teil: 'szene' }, String(k.nr), `${k.nr} · ${k.titel}`, `regie-kapitel-${k.id}`, buehne.story.kurz && !k.kurzfassung)),
      knopf({ ort: 'ende' }, W.geschichte.ende, W.geschichte.ende, 'regie-kapitel-ende'));
    const k = inStory && s.ort === 'kapitel' ? kapitel(g, s.kapitel) : null;
    if (k === null) {
      ersetze(teilKnoepfe);
      teilKnoepfe.hidden = true;
      return;
    }
    teilKnoepfe.hidden = false;
    const weg = schritte(g, buehne.story.kurz);
    ersetze(teilKnoepfe, h('span', { class: 't-label' }, `${k.nr} · ${w.schritteHier}`),
      teileVon(k, false).map((teil) => {
        const ziel: Schritt = { ort: 'kapitel', kapitel: k.id, teil };
        const aufWeg = weg.some((x) => x.ort === 'kapitel' && x.kapitel === k.id && x.teil === teil);
        return h('button', {
          type: 'button', class: `regie-chip regie-chip-klein${aufWeg ? '' : ' ist-aus'}`, 'aria-pressed': s.ort === 'kapitel' && s.teil === teil ? 'true' : 'false',
          'data-pruef': `regie-teil-${teil}`, onclick: () => springeZu(ziel),
        }, W.geschichte.teile[teil] ?? teil);
      }));
  };

  /** Kundenwahl und Eingriffe je Schritt: Antworten (mit Wertung, nur hier), Gewichte im Vergleich, Mini-Aufgabe. */
  const zeichneEingriffe = (): void => {
    const s = buehne.story.schritt;
    const k = g !== null && buehne.bereich === 'story' && s.ort === 'kapitel' ? kapitel(g, s.kapitel) : null;
    if (g === null || k === null || s.ort !== 'kapitel') {
      ersetze(eingriffListe, h('p', { class: 'regie-leise' }, w.keineEingriffe));
      return;
    }
    if (s.teil === 'frage') ersetze(eingriffListe, antwortEingriffe(k));
    else if (s.teil === 'vergleich' && k.vergleich !== null) ersetze(eingriffListe, vergleichEingriffe(k));
    else if (s.teil === 'mini' && k.mini !== null) ersetze(eingriffListe, miniEingriffe(k, k.mini));
    else ersetze(eingriffListe, h('p', { class: 'regie-leise' }, w.keineEingriffe));
  };

  const neueStory = (story: Stand): void => setze({ ...buehne, story });

  const antwortEingriffe = (k: Kapitel): Node[] => {
    const gewaehlt = buehne.story.wahlen[k.id];
    return [
      h('ol', { class: 'regie-antworten' }, k.antworten.map((a, i) => h('li', null, h('button', {
        type: 'button', class: 'regie-antwort', 'aria-pressed': gewaehlt === i ? 'true' : 'false', 'data-pruef': `regie-wahl-${i + 1}`,
        title: nurText(a.html), onclick: () => neueStory(waehle(g!, buehne.story, k.id, i)),
      },
      h('span', { class: 'regie-antwort-nr', 'aria-hidden': 'true' }, String(i + 1)),
      h('span', { class: 'regie-antwort-text' }, h('b', null, w.antwortNr(i + 1)), h('span', { class: 'regie-antwort-anfang' }, ersteWorte(a.html, 7))),
      h('span', { class: 'regie-wertung', 'data-wertung': a.wertung, 'data-pruef': `regie-wertung-${i + 1}`, title: w.wertungTitel }, w.wertung[a.wertung] ?? a.wertung))))),
      h('div', { class: 'regie-zeile' },
        h('button', { type: 'button', class: 'regie-chip regie-chip-klein', 'data-pruef': 'regie-wahl-weg', disabled: gewaehlt === undefined, onclick: () => neueStory(ohneWahl(buehne.story, k.id)) },
          sym('zurueckspulen'), w.wahlZurueck)),
    ];
  };

  const vergleichEingriffe = (k: Kapitel): Node[] => {
    const v = k.vergleich!;
    const gew = gewichte(g!, buehne.story);
    const ab = abgestimmteGewichte(v);
    const lage = vergleichLage(v, gew);
    const titel = (id: string): string => v.optionen.find((x) => x.id === id)?.titel ?? id;
    const summe = lage.plaetze[0]?.summe ?? 0;
    return [
      h('div', { class: 'regie-gewichte' }, v.kriterien.map((c) => h('div', { class: 'regie-gewicht', role: 'group', 'aria-label': c.titel },
        h('span', { class: 'regie-gewicht-name' }, c.titel),
        h('span', { class: 'regie-stufen' }, STUFEN_GEWICHT.map((st) => h('button', {
          type: 'button', class: 'regie-chip regie-chip-klein', 'aria-pressed': gew[c.id] === st ? 'true' : 'false', 'data-pruef': `regie-stufe-${c.id}-${st}`,
          onclick: () => neueStory(setzeGewicht(g!, buehne.story, c.id, st)),
        }, W.geschichte.stufen[st] ?? String(st), ab[c.id] === st ? h('span', { class: 'regie-abgestimmt', title: W.geschichte.abgestimmt }, ' ●', h('span', { class: 'nur-sr' }, ` (${W.geschichte.abgestimmt})`)) : null)))))),
      h('ol', { class: 'regie-rang', 'data-pruef': 'regie-rang' }, lage.plaetze.map((p) => h('li', null, h('b', null, `${W.geschichte.platz(p.rang)}: `), `${p.option.id} · ${p.option.titel} – ${W.geschichte.punkte(p.summe)}`))),
      h('p', { class: 'regie-leise', role: 'status' }, lage.vorn.length > 1 ? W.geschichte.gleichauf(lage.vorn.map(titel), summe) : W.geschichte.vorn(titel(lage.vorn[0] ?? ''), summe)),
      h('div', { class: 'regie-zeile' },
        h('button', { type: 'button', class: 'regie-chip regie-chip-klein', 'data-pruef': 'regie-abgestimmt', disabled: buehne.story.gewichte === null, onclick: () => neueStory(setzeAbgestimmt(buehne.story)) },
          sym('zurueckspulen'), W.geschichte.abgestimmteGewichte)),
    ];
  };

  const miniEingriffe = (k: Kapitel, m: Mini): Node[] => {
    const antworten = buehne.story.mini[k.id];
    const aus = werteMiniAus(m, antworten);
    const kopfzeile = h('p', { class: 'regie-mini-titel' }, h('b', null, m.titel), ` · ${aus.je.filter((x) => x !== 'offen').length}/${m.posten.length}`);
    const fuss = h('div', { class: 'regie-zeile' },
      h('button', { type: 'button', class: 'regie-chip regie-chip-klein', 'data-pruef': 'regie-mini-aufloesen', onclick: () => neueStory(loeseMini(g!, buehne.story, k.id)) }, sym('haken'), w.miniAufloesen),
      h('button', { type: 'button', class: 'regie-chip regie-chip-klein', 'data-pruef': 'regie-mini-leeren', disabled: antworten === undefined, onclick: () => neueStory(miniVonVorn(buehne.story, k.id)) }, sym('zurueckspulen'), w.miniLeeren));
    if (m.art === 'zuordnen') {
      return [kopfzeile, h('ol', { class: 'regie-mini' }, m.posten.map((p, i) => {
        const gewaehlt = antworten?.[i] ?? -1;
        return h('li', { class: 'regie-mini-posten', 'data-lage': aus.je[i] ?? 'offen' },
          h('span', { class: 'regie-mini-text', id: `regie-posten-${i}`, title: nurText(p.html) }, `${i + 1} · ${ersteWorte(p.html, 8)}`),
          h('span', { class: 'regie-stufen', role: 'group', 'aria-labelledby': `regie-posten-${i}` }, m.wahlen.map((x, j) => h('button', {
            type: 'button', class: `regie-chip regie-chip-klein${x.id === p.loesung ? ' ist-loesung' : ''}`, 'aria-pressed': gewaehlt === j ? 'true' : 'false',
            'data-pruef': `regie-mini-${i + 1}-${x.id}`, onclick: () => neueStory(ordneZu(g!, buehne.story, k.id, i, j)),
          }, x.titel, x.id === p.loesung ? h('span', { class: 'regie-loesung', 'aria-hidden': 'true' }, ' ✓') : null, x.id === p.loesung ? h('span', { class: 'nur-sr' }, ` (${w.miniLoesung})`) : null))));
      })), fuss];
    }
    const folge = antworten ?? [];
    return [kopfzeile, h('p', { class: 'regie-leise' }, w.miniReiheHinweis),
      h('ol', { class: 'regie-mini regie-mini-reihe' }, gemischt(m.posten.length).map((i) => {
        const p = m.posten[i];
        const stelle = folge.indexOf(i);
        return h('li', { class: 'regie-mini-posten', 'data-lage': aus.fertig ? aus.je[i] ?? 'offen' : 'offen' }, h('button', {
          type: 'button', class: 'regie-chip regie-chip-klein regie-reihe', 'aria-pressed': stelle >= 0 ? 'true' : 'false', 'data-pruef': `regie-reihe-${i + 1}`,
          title: nurText(p?.html ?? ''), onclick: () => neueStory(klickeReihe(g!, buehne.story, k.id, i)),
        }, h('span', { class: 'regie-reihe-nr', 'aria-hidden': stelle < 0 ? 'true' : null }, stelle < 0 ? '·' : String(stelle + 1)),
        h('span', null, ersteWorte(p?.html ?? '', 8)),
        h('span', { class: 'regie-loesung' }, ` (${w.miniLoesung}: ${i + 1})`)));
      })), fuss];
  };

  const zeichne = (): void => {
    anzeige.setze(buehne);
    massstab();
    text(ort, ortText());
    attr(weiterKnopf, 'disabled', naechste(buehne, 1) === null);
    attr(zurueckKnopf, 'disabled', naechste(buehne, -1) === null);
    for (const b of bereiche) attr(b, 'aria-pressed', b.dataset['bereich'] === buehne.bereich ? 'true' : 'false');
    attr(kurzKnopf, 'aria-pressed', buehne.story.kurz ? 'true' : 'false');
    themaWahl.value = buehne.thema ?? '';
    werkzeugWahl.value = werkzeugAus(buehne.werkzeug);
    sprung.value = buehne.bereich === 'story' && g !== null ? schrittWert(buehne.story.schritt) : '';
    zeichneSprung();
    zeichneEingriffe();
    zeichneNotiz();
  };

  function setze(neu: Buehne): void {
    buehne = neu;
    speichere();
    zeichne();
    sende();
  }

  zeichne();
  zeichneProtokoll();

  /* ------------------------------------------------------------- Verbindung -- */
  let letztesZeichen = 0;
  const setzeVerbindung = (an: boolean): void => {
    attr(verbindung, 'data-status', an ? 'ok' : 'neutral');
    text(verbindung, an ? w.verbunden : w.nichtVerbunden);
  };
  const abKanal = o.kanal?.abonnieren((n) => {
    if (n.art === 'hallo') {
      sende();
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
  sende();
  sendeAnzeige();

  return {
    element,
    taste(e) {
      const ziel = e.target instanceof HTMLElement ? e.target : null;
      if (ziel !== null && (ziel instanceof HTMLTextAreaElement || ziel instanceof HTMLInputElement || ziel instanceof HTMLSelectElement)) return false;
      if (e.altKey || e.ctrlKey || e.metaKey) return false;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { schritt(1); return true; }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { schritt(-1); return true; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (buehne.bereich === 'start') return false;
        rolleTafel(e.key === 'ArrowDown' ? 1 : -1);
        return true;
      }
      const s = buehne.story.schritt;
      if (g !== null && buehne.bereich === 'story' && s.ort === 'kapitel' && s.teil === 'frage' && /^[1-3]$/.test(e.key)) {
        setze({ ...buehne, story: waehle(g, buehne.story, s.kapitel, Number(e.key) - 1) });
        return true;
      }
      return false;
    },
    entferne() {
      clearInterval(pruefer);
      abKanal?.();
      beobachter?.disconnect();
      anzeige.entferne();
      element.remove();
    },
  };
}

