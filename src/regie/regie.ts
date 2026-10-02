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
import { empfohlen, geheZu, neuerStand, schritte, schrittIndex, setzeKurz, station, waehle, weiter, zurueck } from '../geschichte/engine.ts';
import type { Kanal } from './kanal.ts';
import { neueBuehne, pruefeBuehne, BUEHNEN_BEREICHE, type Buehne, type BuehnenBereich } from './buehne.ts';
import { h, attr, text, ersetze } from '../ui/h.ts';
import { bildmarke } from '../ui/marke.ts';
import { sym } from '../ui/bausteine/bloecke.ts';
import { inhalt } from '../ui/bausteine/inhalt.ts';
import { erzeugeAnzeige } from './leinwand.ts';
import { themen, themaSeite } from '../ui/flaechen/theorie.ts';
import { WERKZEUGE, werkzeugAus } from '../ui/flaechen/explore.ts';
import { bogenFuerStrgP, bogenKopf, druckeBogen } from '../ui/druck.ts';
import { W } from '../ui/woerter.ts';

export interface SpeicherGriff {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export interface RegieOptionen {
  inhalte: OeffentlicheInhalte;
  kanal: Kanal | null;
  version: string;
  speicher: SpeicherGriff | null;
  /** Regie-Material je Story-Station */
  regieGeschichte: (station: string) => GeschichteRegie | null;
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
  const sprung = h('select', { class: 'regie-auswahl', id: 'regie-sprung', 'data-pruef': 'regie-sprung' },
    h('option', { value: '' }, w.sprungWaehlen),
    (g?.stationen ?? []).map((st) => h('option', { value: st.id }, `${st.nr} · ${st.kurztitel}`))) as HTMLSelectElement;
  sprung.addEventListener('change', () => {
    if (g !== null && sprung.value !== '') {
      const st = station(g, sprung.value);
      let s = buehne.story;
      if (st !== null && s.kurz && !st.kurzfassung) s = setzeKurz(g, s, false);
      setze({ ...buehne, bereich: 'story', story: geheZu(g, s, { ort: 'station', station: sprung.value, teil: 'lage' }) });
    }
    sprung.value = '';
  });
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
    h('div', { class: 'regie-zeile' },
      h('label', { for: 'regie-thema', class: 't-label' }, W.rahmen.theorie), themaWahl,
      h('label', { for: 'regie-werkzeug', class: 't-label' }, W.rahmen.explore), werkzeugWahl));

  const eingriffListe = h('div', { class: 'regie-eingriffe', role: 'group', 'aria-label': w.kundenwahl, 'data-pruef': 'regie-eingriffe' });
  const eingriffKarte = h('section', { class: 'regie-karte regie-eingriff-karte' }, h('h2', { class: 'regie-h2' }, w.kundenwahl), eingriffListe);

  /* ----------------------------------------------------------------- Notiz -- */
  const notizInhalt = h('div', { class: 'regie-notiz-inhalt' });
  const einwandInhalt = h('div', { class: 'regie-einwand-teil' });
  const notiz = h('section', { class: 'regie-karte regie-notiz', 'data-pruef': 'regie-notiz', 'aria-label': w.notiz },
    h('h2', { class: 'regie-h2' }, sym('lesezeichen'), w.notiz), notizInhalt, h('p', { class: 'regie-leise' }, w.nurRegie), einwandInhalt);

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
    druckKnopf);
  const uhr = (zeit: number): string => new Date(zeit).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const zeichneProtokoll = (): void => {
    ersetze(protokollListe, protokoll.slice(-6).reverse().map((p) => h('li', null, h('span', { class: 'regie-zeit mono' }, uhr(p.zeit)), ' ', p.text)));
  };
  const druckBogen = (): { titel: string; teile: Node[] } => {
    const teil = (...kinder: (Node | null)[]): HTMLElement => h('section', { class: 'druck-teil' }, kinder);
    const entscheidungen = g === null ? [] : g.stationen.filter((st) => buehne.story.wahlen[st.id] !== undefined).map((st) => {
      const opt = st.vorlage.optionen.find((x) => x.id === buehne.story.wahlen[st.id]);
      return h('li', null, `${st.nr} · ${st.kurztitel}: ${opt?.titel ?? ''}`);
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
    h('footer', { class: 'regie-fuss' }, h('span', null, o.version)));

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
    ersetze(einwandInhalt);
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
    if (buehne.bereich !== 'story' || s.ort !== 'station' || g === null) {
      ersetze(notizInhalt, leer);
      return;
    }
    const r = o.regieGeschichte(s.station);
    const st = station(g, s.station);
    ersetze(notizInhalt, r !== null ? [h('div', { class: 'regie-notiz-text' }, inhalt(r.notizHtml)), ...leitfragen(r.leitfragen)] : leer);
    if (st !== null) {
      ersetze(einwandInhalt, h('h3', { class: 'regie-h3' }, W.geschichte.einwand),
        h('details', { class: 'regie-einwand', 'data-pruef': 'regie-einwand' }, h('summary', null, st.einwand.frage), h('div', { class: 'regie-einwand-antwort' }, inhalt(st.einwand.antwortHtml))));
    }
  };

  const ortText = (): string => {
    if (buehne.bereich === 'story' && g !== null) {
      const s = buehne.story.schritt;
      const i = schrittIndex(g, buehne.story) + 1;
      const n = schritte(g, buehne.story.kurz).length;
      if (s.ort === 'station') {
        const st = station(g, s.station);
        return `${W.story} · ${st?.nr ?? ''} ${st?.kurztitel ?? ''} · ${W.geschichte.teile[s.teil] ?? ''} · ${i}/${n}`;
      }
      return `${W.story} · ${s.ort === 'prolog' ? W.geschichte.prolog : W.geschichte.ende} · ${i}/${n}`;
    }
    if (buehne.bereich === 'theorie') return `${W.rahmen.theorie} · ${buehne.thema !== null ? themaSeite(inhalte, buehne.thema)?.kurztitel ?? '' : w.themenUebersicht}`;
    if (buehne.bereich === 'explore') return `${W.rahmen.explore} · ${inhalte.werkzeuge?.[werkzeugAus(buehne.werkzeug)].titel ?? ''}`;
    return w.start;
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
    // Kundenwahl: die Optionen der Vorlage am Schritt „Vorlage“
    const s = buehne.story.schritt;
    const st = g !== null && buehne.bereich === 'story' && s.ort === 'station' && s.teil === 'vorlage' ? station(g, s.station) : null;
    ersetze(eingriffListe, st !== null && g !== null
      ? st.vorlage.optionen.map((x) => h('button', {
        type: 'button', class: 'regie-chip', 'aria-pressed': buehne.story.wahlen[st.id] === x.id ? 'true' : 'false', 'data-pruef': `regie-wahl-${x.id}`,
        onclick: () => setze({ ...buehne, story: waehle(g, buehne.story, st.id, x.id) }),
      }, `${x.id} · ${x.titel}${x.id === empfohlen(g, buehne.story, st) ? ` (${W.geschichte.empfohlen})` : ''}`))
      : h('p', { class: 'regie-leise' }, w.keineEingriffe));
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
      if (g !== null && buehne.bereich === 'story' && s.ort === 'station' && s.teil === 'vorlage' && /^[a-zA-Z]$/.test(e.key) && !e.shiftKey) {
        const st = station(g, s.station);
        const opt = st?.vorlage.optionen.find((x) => x.id === e.key.toUpperCase());
        if (st !== null && opt !== undefined) {
          setze({ ...buehne, story: waehle(g, buehne.story, st.id, opt.id) });
          return true;
        }
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

