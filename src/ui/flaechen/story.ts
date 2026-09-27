/*
 * Fläche „Story“: der Leitstand (Variante B) mit schrittweisem Aufbau (L-4).
 *
 *   Kopf · Statusinstrumente · Story-Karte · Lagetafel (Szene) · Fußleiste · Seitenleiste
 *
 * Die Fläche hält keinen eigenen Stand: `setze(z)` zeichnet den (öffentlichen) Zustand, Eingaben gehen
 * als Aktionen an `tue`. Ohne `tue` (Leinwand, Regie-Vorschau) ist sie reine Anzeige desselben Zustands –
 * dieselbe Zeichnung, nur nicht bedienbar (O-9).
 *
 * Sichtbarkeit nach L-4: Instrumente ab dem ersten Entscheidungsschritt, Story-Karte nach dem Einstieg
 * der ersten Station, Seitenleiste eingeklappt (öffnet auf Klick). Wer mit gespeichertem Stand
 * zurückkommt, sieht die Teile sofort, ohne Einblendung.
 */

import type { Aktion, OeffentlicherZustand, Status } from '../../engine/typen.ts';
import type { OeffentlicheInhalte } from '../../inhalte/typen.ts';
import { h, attr, text, ersetze } from '../h.ts';
import {
  aktuelleStation, anzeigeStatus, instrumenteSichtbar, karteSichtbar, kicker, sichtbareSchritte, tafelTitel, tafelWelt,
  tageAus, uhrAnzeige, weiterAktion, zurueckAktion,
} from '../anzeige.ts';
import { baueSzene, szenenSchluessel, type Szene } from './story-szenen.ts';
import { erzeugeInstrumente } from '../leitstand/instrumente.ts';
import { erzeugeKarte } from '../leitstand/karte.ts';
import { erzeugeFussleiste } from '../leitstand/fussleiste.ts';
import { erzeugeLinse, erzeugeSeitenleiste } from '../leitstand/seitenleiste.ts';
import { installiereTooltips, type Tooltips } from '../bausteine/tooltip.ts';
import { sym } from '../bausteine/bloecke.ts';
import { bildmarke } from '../marke.ts';
import { reduziert, schmal, Takt, zaehle } from '../bewegung.ts';
import { W } from '../woerter.ts';

export interface StoryOptionen {
  inhalte: OeffentlicheInhalte;
  /** null = nur Anzeige (Leinwand, Regie-Vorschau) */
  tue: ((a: Aktion) => void) | null;
  /** Regie-Vorschau: im Rahmen statt bildschirmfüllend */
  eingebettet?: boolean;
  /** Klick auf die Marke im Kopf */
  zurStart?: (() => void) | null;
}

export interface StoryFlaeche {
  element: HTMLElement;
  setze(z: OeffentlicherZustand, aktion: Aktion | null): void;
  /** Tastatur (← → blättern, A–D wählen, Esc); true, wenn behandelt */
  taste(e: KeyboardEvent): boolean;
  entferne(): void;
}

let zaehler = 0;

function istEingabe(el: Element | null): boolean {
  if (el === null) return false;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true;
  return el instanceof HTMLElement && (el.isContentEditable || el.getAttribute('role') === 'slider');
}

export function erzeugeStory(o: StoryOptionen): StoryFlaeche {
  const { inhalte } = o;
  const bedienbar = o.tue !== null;
  const tue = (a: Aktion): void => o.tue?.(a);
  zaehler += 1;
  const titelId = `tafel-titel-${zaehler}`;

  let z: OeffentlicherZustand | null = null;
  let szene: Szene | null = null;
  let schluessel = '';
  let takt = new Takt();
  let ersteZeichnung = true;
  const statusVorher: { A: Status | null; B: Status | null } = { A: null, B: null };
  let sprungNr = 0;

  /* ------------------------------------------------------------- Sprunglink -- */
  const sprungLink = h('a', {
    class: 'sprunglink',
    href: `#${titelId}`,
    'data-pruef': 'sprunglink',
    onclick: (e: Event) => {
      e.preventDefault();
      titelEl.focus();
    },
  }, W.zurTafel);

  /* ------------------------------------------------------------------ Kopf -- */
  const fall = inhalte.fall;
  const marke = h('button', { type: 'button', class: 'marke-knopf', 'aria-label': W.zurStart, onclick: () => o.zurStart?.(), disabled: !bedienbar || !o.zurStart },
    bildmarke('marke-logo'));
  const kopf = h('header', { class: 'kopf' },
    h('div', { class: 'marke' }, marke,
      h('div', { class: 'marke-titel' },
        h('h1', { class: 'kopf-titel' }, fall?.projekt ?? W.kopfTitelFallback),
        h('p', { class: 'kopf-unter' }, W.produkt))),
    h('p', { class: 'vermerk', 'data-pruef': 'fiktiv' }, `${W.fiktiv} · ${W.ungeprueft}`));

  /* ------------------------------------------------------------ Bausteine -- */
  const instrumente = erzeugeInstrumente();
  const karte = erzeugeKarte(inhalte, bedienbar ? (i) => {
    if (z?.station) tue({ art: 'geheZu', station: z.station, schritt: i });
  } : null, { karte: W.karte, station: W.station, monat: W.monat, rolle: W.rolle, lphBand: W.lphBand, lphJetzt: W.lphJetzt, lphAbgeschlossen: W.lphAbgeschlossen });
  const fuss = erzeugeFussleiste({
    inhalte,
    zurueck: bedienbar ? () => schritt(-1) : null,
    weiter: bedienbar ? () => schritt(1) : null,
    zuSchritt: bedienbar ? (i) => {
      if (z?.station) tue({ art: 'geheZu', station: z.station, schritt: i });
    } : null,
    woerter: { zurueck: W.zurueck, weiter: W.weiter, ende: W.ende, schritte: W.schritte },
  });

  const leitstand = h('div', {
    class: `leitstand${o.eingebettet ? ' ist-eingebettet' : ''}`,
    'data-seitenleiste': 'zu',
    'data-pruef': 'leitstand',
  });
  const seite = erzeugeSeitenleiste({
    inhalte,
    bedienbar,
    beiUmschalten: () => attr(leitstand, 'data-seitenleiste', seite.istOffen() ? 'offen' : 'zu'),
    oeffneLinse: bedienbar ? () => {
      if (z !== null) linse.oeffne(z);
    } : null,
    neustart: bedienbar ? () => {
      tue({ art: 'neustart' });
      tue({ art: 'starteStory' });
    } : null,
    woerter: W.seite,
  });
  /** Alles außer der Linse selbst – während sie offen ist, nicht bedienbar (aria-modal ernst genommen). */
  const hintergrund = (): HTMLElement[] => [sprungLink, kopf, instrumente.element, karte.element, tafelKopf, tafelInhalt, fuss.element, seite.element];
  const linse = erzeugeLinse(inhalte, W.linse, {
    beiOeffnen: () => {
      for (const el of hintergrund()) el.setAttribute('inert', '');
    },
    beiSchliessen: () => {
      for (const el of hintergrund()) el.removeAttribute('inert');
    },
  });

  /* ------------------------------------------------------------- Lagetafel -- */
  const kickerEl = h('p', { class: 'tafel-kicker' });
  const titelEl = h('h2', { class: 'tafel-titel', id: titelId, tabindex: -1 });
  const uhrTag = h('span', { class: 'uhr-tag' });
  const uhrZeit = h('span', { class: 'uhr-zeit' });
  const uhr = h('div', { class: 'uhr', 'aria-hidden': 'true' }, uhrTag, uhrZeit);
  const badge = h('span', { class: 'welt-badge', 'data-pruef': 'welt-badge' });
  // Scrollbereich: per Tastatur erreichbar und benannt (WCAG 2.1.1, axe „scrollable-region-focusable“)
  const tafelInhalt = h('div', { class: 'tafel-inhalt', tabindex: 0, role: 'region', 'aria-labelledby': titelId });
  const sprungZahl = h('span', null, '0');
  const sprungStreifen = h('div', { class: 'lineal-streifen' },
    Array.from({ length: 36 }, (_, i) => h('div', { class: `tag${i % 7 === 0 ? ' ist-montag' : ''}` }, h('i'), h('span', null, ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][i % 7] ?? ''))));
  const sprungTitel = h('div', { class: 'zeitsprung-titel' });
  const sprungLineal = h('div', { class: 'lineal' }, sprungStreifen, h('div', { class: 'lineal-kopf' }));
  const sprung = h('div', { class: 'zeitsprung', hidden: true, 'aria-hidden': 'true' },
    h('div', { class: 'zeitsprung-innen' },
      h('div', { class: 'zeitsprung-k' }, sym('vorspulen'), W.zeitsprung),
      h('div', { class: 'zeitsprung-zahl' }, sprungZahl, h('small', null, W.tage)),
      sprungLineal,
      sprungTitel));
  const tafelKopf = h('div', { class: 'tafel-kopf' }, h('div', { class: 'tafel-text' }, kickerEl, titelEl), uhr, badge);
  const tafel = h('main', { class: 'lagetafel', 'aria-labelledby': titelId },
    tafelKopf,
    tafelInhalt,
    sprung);
  tafel.append(linse.element);
  const ansage = h('p', { class: 'nur-sr', 'aria-live': 'polite', 'data-pruef': 'ansage' });

  leitstand.append(...(bedienbar ? [sprungLink] : []), kopf, instrumente.element, karte.element, tafel, fuss.element, seite.element, ansage);
  if (!bedienbar) leitstand.setAttribute('inert', '');

  const tipps: Tooltips | null = bedienbar
    ? installiereTooltips(leitstand, inhalte, W.glossarQuelle(inhalte.whitepaper.fassung ?? ''))
    : null;

  /* --------------------------------------------------------------- Handeln -- */
  function schritt(richtung: 1 | -1): void {
    if (z === null) return;
    const a = richtung === 1 ? weiterAktion(z, inhalte) : zurueckAktion(z, inhalte);
    if (a !== null) {
      tue(a);
      return;
    }
    if (richtung === 1) {
      // Entscheidung fehlt: die Optionen schubsen einmal (Hinweis ohne Text)
      const opt = tafelInhalt.querySelector('.optionen');
      if (opt !== null) {
        opt.classList.remove('ist-schubsen');
        void (opt as HTMLElement).offsetWidth;
        opt.classList.add('ist-schubsen');
      }
    }
  }

  /* ------------------------------------------------------------- Zeitsprung -- */
  function zeigeSprung(dauer: string): void {
    const nr = ++sprungNr;
    const tage = tageAus(dauer) ?? 14;
    text(sprungTitel, dauer);
    sprungLineal.style.setProperty('--tage', String(tage));
    if (reduziert()) return;
    sprung.hidden = false;
    sprung.classList.remove('laeuft');
    void sprung.offsetWidth;
    sprung.classList.add('laeuft');
    sprungZahl.textContent = '0';
    setTimeout(() => {
      if (nr === sprungNr) zaehle(sprungZahl, 0, tage, 1600);
    }, 200);
    setTimeout(() => {
      if (nr !== sprungNr) return;
      sprung.hidden = true;
      sprung.classList.remove('laeuft');
    }, 2300);
  }

  /* ------------------------------------------------------------- Zeichnen -- */
  let instrumenteZuvor = false;
  let karteZuvor = false;
  const sichtbarkeit = (el: HTMLElement, name: string, an: boolean, zuvor: boolean): void => {
    attr(leitstand, name, an);
    // Beim ersten Zeichnen (Weiterlesen, Leinwand) ohne Einblendung; nach dem Verschwinden wieder mit.
    if (an && ersteZeichnung) el.style.animation = 'none';
    else if (!an && zuvor) el.style.removeProperty('animation');
  };

  function setze(neu: OeffentlicherZustand, aktion: Aktion | null): void {
    const alt = z;
    z = neu;
    const st = aktuelleStation(neu, inhalte);
    if (st === null) {
      ersetze(tafelInhalt);
      schluessel = '';
      return;
    }
    const schritte = sichtbareSchritte(st, neu.rolle);
    const index = Math.min(neu.schritt, Math.max(0, schritte.length - 1));
    const aktuell = schritte[index];
    if (aktuell === undefined) return;

    // L-4
    const mitInstrumenten = instrumenteSichtbar(neu, inhalte) && anzeigeStatus(neu) !== null;
    const mitKarte = karteSichtbar(neu, inhalte);
    sichtbarkeit(instrumente.element, 'data-instrumente', mitInstrumenten, instrumenteZuvor);
    sichtbarkeit(karte.element, 'data-karte', mitKarte, karteZuvor);
    instrumenteZuvor = mitInstrumenten;
    karteZuvor = mitKarte;

    const neuerSchluessel = szenenSchluessel(neu, inhalte);
    const schrittGewechselt = neuerSchluessel.split('|').slice(0, 3).join('|') !== schluessel.split('|').slice(0, 3).join('|');

    // Instrumente
    const stand = anzeigeStatus(neu);
    if (mitInstrumenten && stand !== null) {
      const welt = neu.status[neu.welt] !== null ? neu.welt : neu.welt === 'A' ? 'B' : 'A';
      const vorher = alt !== null && !ersteZeichnung ? statusVorher[welt] : null;
      const saetze = instrumente.setze(welt, welt === 'A' ? W.ohneMvg : W.mitMvg, stand, vorher, schrittGewechselt);
      if (saetze.length > 0 && aktion !== null) text(ansage, saetze.join('. '));
    }
    statusVorher.A = neu.status.A;
    statusVorher.B = neu.status.B;

    karte.setze(neu);
    fuss.setze(neu);
    seite.setze(neu);

    // Tafelkopf
    const welt = tafelWelt(st);
    attr(tafel, 'data-welt', welt);
    text(kickerEl, kicker(schritte, index));
    text(titelEl, tafelTitel(schritte, index));
    const u = uhrAnzeige(st, neu, inhalte);
    uhr.hidden = u === null;
    if (u !== null) {
      text(uhrTag, u.tag);
      text(uhrZeit, u.zeit ?? '');
      uhr.classList.toggle('ist-gesprungen', u.gesprungen);
    }
    badge.hidden = welt === null;
    if (welt !== null) {
      attr(badge, 'data-welt', welt);
      text(badge, welt === 'a' ? `${W.weltA} · ${W.ohneMvg}` : welt === 'b' ? `${W.weltB} · ${W.mitMvg}` : W.weltVergleich);
    }

    // Zeitsprung: eine neu angeforderte Information dieser Station
    if (alt !== null && !ersteZeichnung && neu.info.length > alt.info.length) {
      const neuInfo = neu.info.find((i) => !alt.info.includes(i));
      if (neuInfo !== undefined && neuInfo.startsWith(`${st.id}/`) && u !== null && u.gesprungen) zeigeSprung(u.tag);
    }

    // Szene
    if (neuerSchluessel !== schluessel) {
      if (linse.istOffen()) linse.schliesse();
      schluessel = neuerSchluessel;
      takt.halt();
      takt = new Takt();
      const aktiv = document.activeElement;
      const fokusInTafel = aktiv !== null && tafel.contains(aktiv);
      szene = baueSzene({ inhalte, station: st, schritte, index, schritt: aktuell, z: neu, tue: bedienbar ? tue : null, takt });
      ersetze(tafelInhalt, szene.element);
      tafelInhalt.scrollTop = 0;
      szene.beimEintritt();
      if (!ersteZeichnung) {
        text(ansage, `${kicker(schritte, index)}: ${tafelTitel(schritte, index)}`);
        if (schmal() || getComputedStyle(leitstand).display === 'block') {
          const oben = tafel.getBoundingClientRect().top;
          if (oben < 0 && typeof tafel.scrollIntoView === 'function') tafel.scrollIntoView({ block: 'start' });
        }
        if (bedienbar && (fokusInTafel || aktiv === document.body || (aktiv !== null && !document.contains(aktiv)))) {
          titelEl.focus({ preventScroll: true });
        }
      }
    } else {
      szene?.aktualisiere(neu);
    }
    ersteZeichnung = false;
  }

  return {
    element: leitstand,
    setze,
    taste(e) {
      if (!bedienbar || z === null) return false;
      if (linse.istOffen()) {
        if (e.key === 'Escape') {
          linse.schliesse();
          return true;
        }
        linse.halteFokus(e);
        return false;
      }
      if (e.key === 'Escape' && seite.istOffen()) {
        seite.schliesse();
        return true;
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return false;
      const ziel = e.target instanceof Element ? e.target : null;
      if (istEingabe(ziel)) return false;
      if (e.key === 'ArrowRight') {
        schritt(1);
        return true;
      }
      if (e.key === 'ArrowLeft') {
        schritt(-1);
        return true;
      }
      if (/^[a-dA-D]$/.test(e.key) && !e.shiftKey) {
        const knopf = tafelInhalt.querySelector<HTMLButtonElement>(`.option[data-option="${e.key.toUpperCase()}"], .nochmal-knopf[data-pruef="nochmal-${e.key.toUpperCase()}"]`);
        if (knopf !== null && !knopf.disabled) {
          knopf.click();
          return true;
        }
      }
      return false;
    },
    entferne() {
      takt.halt();
      tipps?.entferne();
      leitstand.remove();
    },
  };
}
