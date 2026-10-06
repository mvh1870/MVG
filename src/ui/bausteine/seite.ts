/*
 * Gemeinsamer Rahmen aller Bereiche (P16.11, O-42, O-44): Kopf mit Bildmarke (führt leise zu
 * bauherr-mentoren.com), Name (zur Startseite) und den drei Bereichen; Fuß mit Absender, Impressum,
 * Datenschutz, „Drittanbieter & Lizenzen“ (#lizenzen) und „Präsentieren“. Impressum und Datenschutz sind eigene kleine Seiten (O-42).
 * Hintergrund im Stil „Bauplan“ (O-45) setzt der Bereich selbst.
 */

import { h, type Kind } from '../h.ts';
import { bildmarke } from '../marke.ts';
import { W } from '../woerter.ts';

export type Bereich = 'start' | 'story' | 'theorie' | 'explore';

export const BM_ADRESSE = 'https://www.bauherr-mentoren.com/';
export const IMPRESSUM_SEITE = 'impressum.html';
export const DATENSCHUTZ_SEITE = 'datenschutz.html';

/**
 * Adresse einer Rechtsseite. Im Webseitenordner liegt sie neben der Hauptseite; die Einzeldatei (Audit 2026-10-06)
 * hat keine Nachbarn und trägt dafür `<meta name="mvg-rechtsseiten" content="https://…/">` – dann führt der Link
 * zur veröffentlichten Seite. Nur https-Adressen gelten; alles andere bleibt beim relativen Verweis.
 */
export function rechtsSeite(seite: string): string {
  const basis = typeof document === 'undefined' ? '' : document.querySelector<HTMLMetaElement>('meta[name="mvg-rechtsseiten"]')?.content ?? '';
  return /^https:\/\/[a-z0-9.-]+\/$/u.test(basis) ? `${basis}${seite}` : seite;
}

/** Leiser Textlink zu bauherr-mentoren.com (O-44); öffnet im selben Fenster wie jeder andere Link. */
export function bmLink(text: string = W.rahmen.kontaktBm, klasse = 'bm-link'): HTMLAnchorElement {
  return h('a', { class: klasse, href: BM_ADRESSE, rel: 'noopener', 'data-pruef': 'bm-link' }, text);
}

export function seitenKopf(aktiv: Bereich | null, bedienbar = true): HTMLElement {
  const w = W.rahmen;
  const bereich = (b: Exclude<Bereich, 'start'>, text: string): HTMLElement => bedienbar
    ? h('a', { class: 'kopf-bereich', href: `#${b}`, 'data-pruef': `kopf-${b}`, 'aria-current': aktiv === b ? 'page' : null }, text)
    : h('span', { class: 'kopf-bereich', 'aria-current': aktiv === b ? 'page' : null }, text);
  return h('header', { class: 'seiten-kopf', 'data-pruef': 'seiten-kopf' },
    bedienbar
      ? h('a', { class: 'kopf-marke', href: BM_ADRESSE, rel: 'noopener', 'aria-label': w.bmMarke, title: w.bmMarke, 'data-pruef': 'kopf-bm' }, bildmarke('marke-logo'))
      : h('span', { class: 'kopf-marke' }, bildmarke('marke-logo')),
    bedienbar
      ? h('a', { class: 'kopf-name', href: '#start', 'data-pruef': 'kopf-start' }, W.name)
      : h('span', { class: 'kopf-name' }, W.name),
    h('nav', { class: 'kopf-bereiche', 'aria-label': w.bereiche },
      bereich('story', W.story),
      bereich('theorie', w.theorie),
      bereich('explore', w.explore)));
}

export function seitenFuss(bedienbar = true, zusatz: Kind = null): HTMLElement {
  const w = W.rahmen;
  return h('footer', { class: 'seiten-fuss', 'data-pruef': 'fuss' },
    h('p', { class: 'fuss-absender' },
      h('b', null, W.name), ' · ', W.adresse, ' · ', w.angebot, ' ',
      bedienbar ? bmLink(W.absender, 'bm-link') : W.absender),
    zusatz,
    bedienbar ? h('nav', { class: 'fuss-links', 'aria-label': w.rechtliches },
      h('a', { href: rechtsSeite(IMPRESSUM_SEITE), 'data-pruef': 'impressum' }, w.impressum),
      h('a', { href: rechtsSeite(DATENSCHUTZ_SEITE), 'data-pruef': 'datenschutz' }, w.datenschutz),
      h('a', { href: '#lizenzen', 'data-pruef': 'lizenzen' }, w.lizenzen),
      h('a', { href: '#regie', 'data-pruef': 'praesentieren' }, w.praesentieren)) : null);
}

/** Bereich mit Kopf, Inhalt und Fuß. */
export function seitenRahmen(o: { bereich: Bereich; klasse: string; inhalt: Kind; hintergrund?: Node | null; fussZusatz?: Kind; bedienbar?: boolean }): HTMLElement {
  const bedienbar = o.bedienbar ?? true;
  return h('div', { class: `seite ${o.klasse}`, 'data-bereich': o.bereich },
    o.hintergrund ?? null,
    bedienbar ? h('a', { class: 'sprung-inhalt', href: '#inhalt', onclick: (e: Event) => {
      e.preventDefault();
      const ziel = (e.currentTarget as HTMLElement).ownerDocument.getElementById('inhalt');
      ziel?.focus();
    } }, W.rahmen.zumInhalt) : null,
    seitenKopf(o.bereich === 'start' ? null : o.bereich, bedienbar),
    h(bedienbar ? 'main' : 'div', { class: 'seiten-haupt', id: bedienbar ? 'inhalt' : null, tabindex: bedienbar ? -1 : null }, o.inhalt),
    seitenFuss(bedienbar, o.fussZusatz ?? null));
}
