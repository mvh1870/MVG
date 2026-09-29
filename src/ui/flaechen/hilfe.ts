/*
 * Hilfe (P13, O-31): die Hilfe des MVG Companion in derselben Aufteilung wie in der Anwendung –
 * elf Teile, die Rollen-Anleitungen mit ihren Unterseiten. Gestaltet wie die Lernseiten: Kopfleiste,
 * Verzeichnis links, Lesespalte, Blättern, Fuß mit Vermerk.
 *
 * Der Inhalt kommt zur Bauzeit aus werkzeuge/hilfe.mjs (src/generiert/hilfe.json): bereinigtes HTML,
 * Begriffe nach MVG. Er wird nur über vonHtml() eingesetzt (vertrauenswürdig, siehe h.ts).
 */

import daten from '../../generiert/hilfe.json' with { type: 'json' };
import { h, textAus, vonHtml } from '../h.ts';
import { bildmarke } from '../marke.ts';
import { sym } from '../bausteine/bloecke.ts';
import { oeffneDialog, schliesseBeiKlickDaneben } from '../dialog.ts';
import { W } from '../woerter.ts';

export interface HilfeSeite {
  id: string;
  titel: string;
  html: string;
}
export interface HilfeKapitel extends HilfeSeite {
  unter: HilfeSeite[];
}
export interface HilfeDaten {
  titel: string;
  quelle: string;
  stand: string;
  kapitel: HilfeKapitel[];
}

export const HILFE: HilfeDaten = daten;

export interface HilfeOptionen {
  /** null = Übersicht */
  seite: string | null;
  version: string;
  hilfe?: HilfeDaten;
}

interface Eintrag {
  seite: HilfeSeite;
  /** Teil 1–11 */
  nr: number;
  /** Kapitel, zu dem eine Unterseite gehört (sonst null) */
  kapitel: HilfeKapitel | null;
}

/** Alle Seiten in Lesereihenfolge: Teil, dann seine Unterseiten. */
export function hilfeSeiten(hilfe: HilfeDaten = HILFE): Eintrag[] {
  return hilfe.kapitel.flatMap((k, i) => [
    { seite: k, nr: i + 1, kapitel: null },
    ...k.unter.map((u) => ({ seite: u, nr: i + 1, kapitel: k })),
  ]);
}

function kopfleiste(): HTMLElement {
  return h('header', { class: 'lern-kopf' },
    bildmarke('marke-logo'),
    h('p', { class: 'lern-bereich' }, `${W.hilfe.bereich} `, h('span', null, W.hilfe.bereichZusatz)),
    h('a', { class: 'lern-kopf-link', href: '#start', 'data-pruef': 'zur-start' }, sym('pfeilLinks'), W.theorie.start));
}

function sprunglink(): HTMLElement {
  const a = h('a', { class: 'sprunglink', href: '#lern-inhalt', 'data-pruef': 'sprunglink' }, W.theorie.zumInhalt);
  a.addEventListener('click', (e) => {
    e.preventDefault();
    (a.closest('.lernseite')?.querySelector('.kapitel-titel') as HTMLElement | null)?.focus();
  });
  return a;
}

function fuss(o: HilfeOptionen, hilfe: HilfeDaten): HTMLElement {
  return h('footer', { class: 'lern-fuss' },
    h('a', { class: 'lern-kopf-link', href: '#theorie', 'data-pruef': 'zur-theorie' }, sym('pfeilRechts'), `${W.theorie.bereich} ${W.theorie.bereichZusatz}`),
    h('span', null, `${W.start.fuss} · `, h('span', { 'data-pruef': 'version' }, o.version), ` · ${hilfe.quelle}, ${W.hilfe.stand(hilfe.stand)}`),
    h('span', { class: 'vermerk-hell', 'data-pruef': 'ungeprueft' }, sym('info'), W.ungeprueft));
}

function verzeichnis(hilfe: HilfeDaten, aktuell: string | null): HTMLElement {
  const breit = typeof matchMedia !== 'function' || matchMedia('(min-width: 1100px)').matches;
  const aktiv = (id: string): Record<string, string> => (id === aktuell ? { 'aria-current': 'page' } : {});
  return h('details', { class: 'kapitel-verzeichnis hilfe-verzeichnis', open: breit },
    h('summary', { class: 't-label' }, W.hilfe.inhalt),
    h('ol', { class: 'kapitel-liste', 'data-pruef': 'hilfe-verzeichnis' },
      h('li', null, h('a', { href: '#hilfe', class: 'ist-gelesen', ...(aktuell === null ? { 'aria-current': 'page' } : {}) }, h('b', null, sym('info')), h('span', null, W.hilfe.ueberblick))),
      hilfe.kapitel.map((k, i) => {
        // Unterseiten nur beim aktuellen Teil aufgeklappt: das Verzeichnis bleibt kurz
        const offen = k.unter.length > 0 && (k.id === aktuell || k.unter.some((u) => u.id === aktuell));
        return h('li', null,
          h('a', { href: `#hilfe/${k.id}`, class: 'ist-gelesen', ...aktiv(k.id) }, h('b', null, String(i + 1)), h('span', null, k.titel)),
          offen ? h('ol', { class: 'hilfe-unterliste' }, k.unter.map((u) => h('li', null, h('a', { href: `#hilfe/${u.id}`, ...aktiv(u.id) }, h('span', null, u.titel))))) : null);
      })));
}

function blaettern(vor: Eintrag | null, nach: Eintrag | null): HTMLElement {
  return h('nav', { class: 'kapitel-nav', 'aria-label': W.hilfe.bereich },
    vor !== null ? h('a', { href: `#hilfe/${vor.seite.id}`, rel: 'prev' }, h('span', { class: 't-label' }, W.hilfe.zurueck), h('b', null, vor.seite.titel)) : null,
    nach !== null ? h('a', { href: `#hilfe/${nach.seite.id}`, rel: 'next' }, h('span', { class: 't-label' }, W.hilfe.weiter), h('b', null, nach.seite.titel)) : null);
}

function karten(eintraege: { id: string; nr: string; titel: string; zusatz: string | null }[], pruef: string): HTMLElement {
  return h('ol', { class: 'kapitel-karten', 'data-pruef': pruef }, eintraege.map((e) => h('li', null,
    h('a', { class: 'kapitel-karte', href: `#hilfe/${e.id}`, 'data-pruef': `hilfe-${e.id}` },
      h('b', { class: 'kapitel-karte-nr' }, e.nr),
      h('span', { class: 'kapitel-karte-titel' }, e.titel, e.zusatz !== null ? h('small', { class: 'hilfe-zusatz' }, ` · ${e.zusatz}`) : null),
      h('span', { class: 'kapitel-karte-los' }, W.hilfe.oeffnen, sym('pfeilRechts'))))));
}

/** Kurzer Auszug um die erste Fundstelle, der Suchbegriff hervorgehoben */
function auszug(text: string, i: number, laenge: number): HTMLElement {
  // Anfang auf eine Wortgrenze, nicht mitten im Wort
  let von = Math.max(0, i - 60);
  if (von > 0) {
    const leer = text.indexOf(' ', von);
    von = leer >= 0 && leer < i ? leer + 1 : von;
  }
  const bis = Math.min(text.length, i + laenge + 90);
  return h('p', null, `${von > 0 ? '… ' : ''}${text.slice(von, i).trimStart()}`, h('mark', null, text.slice(i, i + laenge)), `${text.slice(i + laenge, bis).trimEnd()}${bis < text.length ? ' …' : ''}`);
}

/** Lesetext einer Seite: an Blockgrenzen ein Leerzeichen, damit Wörter nicht zusammenkleben */
function lesetext(html: string): string {
  return textAus(html.replace(/<\/(?:p|li|td|th|h\d|div|summary|dt|dd|tr|span|b|strong)>|<br\s*\/?>/gu, '$& ').replace(/\s+([.,;:!?)])/gu, '$1'));
}

/** Scrollbare Tabellen und Grafiken per Tastatur erreichbar – nur wenn sie wirklich überlaufen */
function rollbereiche(wurzel: ParentNode): void {
  for (const el of wurzel.querySelectorAll<HTMLElement>('.h-table-wrap, .h-grafik-wrap')) {
    if (el.scrollWidth > el.clientWidth + 1) el.tabIndex = 0;
    else el.removeAttribute('tabindex');
  }
}

/** IDs im Klon eindeutig machen (Pfeilspitzen, Verläufe) und ihre url(#…)-Bezüge mitziehen. */
function eindeutig(svg: SVGSVGElement, anhang: string): SVGSVGElement {
  const ids = new Set([...svg.querySelectorAll('[id]')].map((el) => el.id));
  if (ids.size === 0) return svg;
  for (const el of svg.querySelectorAll('[id]')) el.id += anhang;
  for (const el of [svg, ...svg.querySelectorAll('*')]) {
    for (const at of [...el.attributes]) {
      const neu = at.value.replace(/url\(#([^)]+)\)/gu, (m, id: string) => (ids.has(id) ? `url(#${id}${anhang})` : m));
      if (neu !== at.value) el.setAttribute(at.name, neu);
    }
  }
  return svg;
}

/** Klon für den Dialog: ohne die Inline-Breite der Quelle (width:100 %), sonst gilt der Rand aus hilfe.css nicht (R13). */
function grosseGrafik(svg: SVGSVGElement): SVGSVGElement {
  const klon = eindeutig(svg.cloneNode(true) as SVGSVGElement, '-gross');
  klon.style.removeProperty('width');
  return klon;
}

/**
 * Breite Grafiken der Anwendung (viewBox ab 900) sind in der Lesespalte klein beschriftet: ein Knopf
 * zeigt sie in einem Dialog über die ganze Fensterbreite (Esc oder „Schließen“ kehrt zurück).
 */
function grafikenVergroesserbar(wurzel: HTMLElement): void {
  if (typeof HTMLDialogElement !== 'function') return;
  for (const huelle of wurzel.querySelectorAll<HTMLElement>('.h-grafik-wrap')) {
    const svg = huelle.querySelector('svg');
    if (svg === null) continue;
    const name = (huelle.getAttribute('aria-label') ?? '').replace(/^Grafik: /u, '');
    const dialog = h('dialog', { class: 'hilfe-grafik-dialog', 'aria-label': name },
      h('div', { class: 'hilfe-grafik-dialog-kopf' },
        h('p', { class: 't-label' }, name),
        h('button', { type: 'button', class: 'knopf knopf-still', onclick: () => dialog.close() }, W.hilfe.schliessen)),
      grosseGrafik(svg));
    schliesseBeiKlickDaneben(dialog);
    const knopf = h('button', { type: 'button', class: 'knopf knopf-still hilfe-grafik-knopf', 'data-pruef': 'grafik-gross', 'aria-label': `${W.hilfe.grafikGross}: ${name}`, onclick: () => oeffneDialog(dialog, huelle) }, sym('pfeilRechts'), W.hilfe.grafikGross);
    huelle.after(knopf, dialog);
  }
}

/** Volltextsuche über alle Hilfeseiten (ersetzt die Suchkarte der Anwendung). */
function suche(hilfe: HilfeDaten): HTMLElement {
  const feld = h('input', { type: 'search', class: 'glossar-feld', id: 'hilfe-suche', 'data-pruef': 'hilfe-suche', autocomplete: 'off', spellcheck: 'false' }) as HTMLInputElement;
  const zahl = h('p', { class: 'glossar-zahl', 'aria-live': 'polite' });
  const treffer = h('ol', { class: 'hilfe-treffer', 'data-pruef': 'hilfe-treffer' });
  let index: { e: Eintrag; titel: string; text: string; klein: string }[] | null = null;
  const zeige = (): void => {
    const q = feld.value.trim().toLocaleLowerCase('de');
    treffer.replaceChildren();
    if (q.length < 2) {
      zahl.textContent = '';
      return;
    }
    index ??= hilfeSeiten(hilfe).map((e) => {
      const text = lesetext(e.seite.html);
      return { e, titel: e.kapitel !== null ? `${e.kapitel.titel} · ${e.seite.titel}` : e.seite.titel, text, klein: `${e.seite.titel} ${text}`.toLocaleLowerCase('de') };
    });
    // Treffer im Titel zuerst, sonst Lesereihenfolge
    const passend = index.filter((x) => x.klein.includes(q)).sort((a, b) => Number(b.titel.toLocaleLowerCase('de').includes(q)) - Number(a.titel.toLocaleLowerCase('de').includes(q)));
    zahl.textContent = passend.length === 0 ? W.hilfe.sucheLeer : W.hilfe.sucheZahl(passend.length);
    for (const x of passend.slice(0, 30)) {
      const i = x.text.toLocaleLowerCase('de').indexOf(q);
      treffer.append(h('li', null,
        h('a', { href: `#hilfe/${x.e.seite.id}` }, x.titel),
        i >= 0 ? auszug(x.text, i, q.length) : null));
    }
  };
  feld.addEventListener('input', zeige);
  return h('div', { class: 'glossar-suche hilfe-suche', role: 'search' },
    h('label', { for: 'hilfe-suche', class: 't-label' }, W.hilfe.suche), feld, zahl, treffer);
}

function uebersicht(o: HilfeOptionen, hilfe: HilfeDaten): HTMLElement[] {
  return [
    h('header', { class: 'kapitel-kopf' },
      h('span', { class: 'kapitel-nr hilfe-kopf-symbol', 'aria-hidden': 'true' }, sym('info')),
      h('p', { class: 'kapitel-kicker' }, `${hilfe.quelle} · ${W.hilfe.stand(hilfe.stand)}`),
      h('h1', { class: 'kapitel-titel', tabindex: -1 }, W.hilfe.ueberblick),
      h('p', { class: 'kapitel-einstieg' }, W.hilfe.ueberblickText)),
    h('p', { class: 'kapitel-vermerk' }, h('span', { class: 'vermerk-hell' }, sym('info'), W.ungeprueft)),
    suche(hilfe),
    karten(hilfe.kapitel.map((k, i) => ({ id: k.id, nr: String(i + 1), titel: k.titel, zusatz: k.unter.length > 0 ? W.hilfe.unterseiten(k.unter.length) : null })), 'hilfe-liste'),
    h('p', { class: 'hilfe-hinweis' }, W.hilfe.hinweis),
    fuss(o, hilfe),
  ];
}

function seite(o: HilfeOptionen, hilfe: HilfeDaten, e: Eintrag, vor: Eintrag | null, nach: Eintrag | null): HTMLElement[] {
  const unter = e.kapitel === null ? (e.seite as HilfeKapitel).unter : [];
  return [
    h('header', { class: 'kapitel-kopf' },
      h('span', { class: 'kapitel-nr' }, String(e.nr)),
      h('p', { class: 'kapitel-kicker' }, e.kapitel !== null ? `${W.hilfe.kapitelVon(e.nr)} · ${e.kapitel.titel}` : W.hilfe.kapitelVon(e.nr)),
      h('h1', { class: 'kapitel-titel', tabindex: -1 }, e.seite.titel)),
    h('p', { class: 'kapitel-vermerk' }, h('span', { class: 'vermerk-hell' }, sym('info'), W.ungeprueft)),
    h('p', { class: 'hilfe-hinweis', 'data-pruef': 'hilfe-hinweis' }, W.hilfe.hinweis),
    h('div', { class: 'hilfe-inhalt', 'data-pruef': 'hilfe-inhalt' }, vonHtml(e.seite.html)),
    unter.length > 0 ? karten(unter.map((u, i) => ({ id: u.id, nr: `${e.nr}.${i + 1}`, titel: u.titel, zusatz: null })), 'hilfe-unterseiten') : null,
    blaettern(vor, nach),
    fuss(o, hilfe),
  ].filter((x): x is HTMLElement => x !== null);
}

export function baueHilfe(o: HilfeOptionen): HTMLElement {
  const hilfe = o.hilfe ?? HILFE;
  const alle = hilfeSeiten(hilfe);
  const i = o.seite === null ? -1 : alle.findIndex((e) => e.seite.id === o.seite);
  const e = i >= 0 ? alle[i] : undefined;
  const teile = e === undefined
    ? uebersicht(o, hilfe)
    : seite(o, hilfe, e, alle[i - 1] ?? null, alle[i + 1] ?? null);
  const aussen = h('div', { class: 'lernseite hilfe', 'data-pruef': 'hilfe', 'data-seite': e?.seite.id ?? '' },
    sprunglink(),
    kopfleiste(),
    h('div', { class: 'lern-rahmen' },
      verzeichnis(hilfe, e?.seite.id ?? null),
      h('article', { class: 'lern-inhalt', id: 'lern-inhalt', 'data-pruef': e !== undefined ? 'hilfe-seite' : 'hilfe-uebersicht' }, teile)));
  grafikenVergroesserbar(aussen);
  // gemessen, sobald gezeichnet, und neu bei jeder Größenänderung (Schriften, Fenster)
  if (typeof ResizeObserver === 'function') {
    const beobachter = new ResizeObserver(() => rollbereiche(aussen));
    // Hülle und Inhalt: lädt eine Schrift nach, wächst nur die Tabelle, nicht ihre Hülle
    for (const el of aussen.querySelectorAll('.h-table-wrap, .h-grafik-wrap')) {
      beobachter.observe(el);
      if (el.firstElementChild !== null) beobachter.observe(el.firstElementChild);
    }
  }
  return aussen;
}

/** Titel einer Hilfeseite (für den Dokumenttitel), null wenn unbekannt */
export function hilfeTitel(id: string | null, hilfe: HilfeDaten = HILFE): string | null {
  if (id === null) return null;
  return hilfeSeiten(hilfe).find((e) => e.seite.id === id)?.seite.titel ?? null;
}
