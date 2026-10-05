/*
 * Entscheidungsbuch der Story (P19.4, O-62, docs/drehbuch-v2/04-rahmen.md 5): das Symbol mit dem Punkt „neu“, die Seite mit den
 * Einträgen, die Papierfassung. Die Einträge sind für alle Wege gleich – das Buch nennt den Beschluss der Stadt, nie die Antwort der
 * Leserin oder des Lesers, keine Punkte, keine Wertung. Welche Einträge es zeigt, entscheidet die Engine (`buchEintraege`); hier wird
 * nur gezeichnet. Die Leinwand zeigt dieselbe Seite ohne Bedienung und ohne „neu“.
 */

import type { BuchArt, Geschichte } from '../../geschichte/typen.ts';
import { buchEintraege, buchZugang, type BuchSicht, type Stand } from '../../geschichte/engine.ts';
import type { SymbolName } from '../../stil/symbole.ts';
import { h } from '../h.ts';
import { inhaltInline } from '../bausteine/inhalt.ts';
import { sym } from '../bausteine/bloecke.ts';
import { W } from '../woerter.ts';
import { gegenstand } from './geschichte-teile.ts';

const w = W.geschichte;

/** Symbol je Art – der Stempel trägt immer auch das Wort, nie nur Form oder Farbe. */
const STEMPEL_SYMBOL: Record<BuchArt, SymbolName> = { beschluss: 'haken', vermerk: 'ring', uebergabe: 'pfeilRechts', 'beschluss-uebergabe': 'haken' };

function stempel(art: BuchArt): HTMLElement {
  return h('span', { class: 'gs-buch-stempel', 'data-art': art }, sym(STEMPEL_SYMBOL[art]), w.buchArt[art] ?? art);
}

/** Ein voller Eintrag: Kopf „4 · Die Auflage · Mai 2026“, Stempel, vier Zeilen. */
function eintrag(s: BuchSicht, neu: boolean): HTMLElement {
  const { eintrag: e, k } = s;
  const f = (name: string, inhalt: Node | string): HTMLElement => h('div', null, h('dt', null, name), h('dd', null, inhalt));
  return h('li', { class: 'gs-buch-eintrag', 'data-station': k.id, 'data-art': e.art, 'data-neu': neu ? 'true' : null, 'data-pruef': `buch-${k.id}` },
    h('header', { class: 'gs-buch-eintrag-kopf' },
      h('h2', { class: 'gs-buch-kopf' }, `${k.nr} · ${k.titel} · ${k.zeit}`),
      stempel(e.art),
      neu ? h('span', { class: 'gs-buch-neu' }, w.buchNeu) : null),
    h('dl', { class: 'gs-buch-felder' },
      f(w.buchSpalten.anlass, k.zeit),
      f(w.buchSpalten.entschieden, inhaltInline(e.entschiedenHtml)),
      f(w.buchSpalten.grundlage, inhaltInline(e.grundlageHtml)),
      f(w.buchSpalten.ergebnis, inhaltInline(e.ergebnisHtml))));
}

/** Eine Zeile der Kurzfassung für eine übersprungene Station: nur Art und Ergebnis, ohne Kopf. */
function zeile(s: BuchSicht, neu: boolean): HTMLElement {
  return h('li', { class: 'gs-buch-zeile', 'data-station': s.k.id, 'data-art': s.eintrag.art, 'data-neu': neu ? 'true' : null, 'data-pruef': `buch-${s.k.id}` },
    h('span', { class: 'nur-sr' }, `${w.buchKurzZeile(s.k.nr)}: `),
    stempel(s.eintrag.art),
    h('span', { class: 'gs-buch-ergebnis' }, inhaltInline(s.eintrag.ergebnisHtml)),
    neu ? h('span', { class: 'gs-buch-neu' }, w.buchNeu) : null);
}

export interface BuchOptionen {
  /** Stationen, deren Eintrag beim letzten Öffnen schon da war; alles andere trägt „neu“ (Leinwand: leer lassen) */
  gesehen?: ReadonlySet<string>;
  /** mit Knopf „Zurück zur Geschichte“; ohne (Leinwand) keine Bedienung */
  schliessen?: () => void;
}

/** Die Seite des Buchs: Titel, Einleitung, Legende, die Einträge in der Reihenfolge der Stationen – oder der Leerzustand. */
export function buchSeite(g: Geschichte, stand: Stand, o: BuchOptionen = {}): HTMLElement {
  const sicht = buchEintraege(g, stand);
  const neu = (s: BuchSicht): boolean => o.gesehen !== undefined && !o.gesehen.has(s.k.id);
  return h('article', { class: 'gs-schritt gs-buch', 'data-teil': 'buch', 'data-pruef': 'gs-buch', 'aria-labelledby': 'gs-buch-titel' },
    h('header', { class: 'gs-kopf' },
      h('span', { class: 'gs-nummer', 'aria-hidden': 'true' }, gegenstand('buch', 56, 'gs-nummer-bild')),
      h('div', { class: 'gs-kopf-text' }, h('h1', { id: 'gs-buch-titel', class: 'gs-titel', tabindex: -1, 'data-pruef': 'gs-titel' }, w.buchTitel))),
    h('p', { class: 'gs-buch-intro' }, w.buchIntro),
    h('dl', { class: 'gs-buch-legende', 'data-pruef': 'gs-buch-legende' }, w.buchLegende.map((x) => h('div', { 'data-art': x.art }, h('dt', null, x.wort), h('dd', null, x.text)))),
    sicht.length === 0
      ? h('p', { class: 'gs-buch-leer', 'data-pruef': 'gs-buch-leer' }, w.buchLeer)
      : h('ol', { class: 'gs-buch-liste', 'aria-label': w.buchListe, 'data-pruef': 'gs-buch-liste' }, sicht.map((s) => (s.voll ? eintrag(s, neu(s)) : zeile(s, neu(s))))),
    o.schliessen !== undefined
      ? h('p', { class: 'gs-buch-fuss' }, h('button', { type: 'button', class: 'gs-knopf', 'data-pruef': 'buch-schliessen', onclick: o.schliessen }, sym('pfeilLinks'), w.buchSchliessen))
      : null);
}

/**
 * Das Symbol des Buchs (Buch mit Lesebändchen) mit dem Punkt für einen neuen Eintrag, für Screenreader das Wort „neu“. Es steht erst,
 * wenn Station 1 abgeschlossen ist (`buchZugang`); davor null.
 */
export function buchSymbol(g: Geschichte, stand: Stand, o: { offen: boolean; neu: boolean; umschalten: () => void }): HTMLElement | null {
  if (!buchZugang(g, stand)) return null;
  return h('button', { type: 'button', class: 'gs-buch-symbol', 'aria-pressed': o.offen ? 'true' : 'false', 'data-neu': o.neu ? 'true' : null, 'data-pruef': 'buch-symbol', onclick: o.umschalten },
    gegenstand('buch', 28, 'gs-gegenstand gs-buch-symbol-bild'),
    h('span', { class: 'gs-buch-symbol-text' }, w.buch),
    o.neu ? h('span', { class: 'gs-buch-punkt', 'aria-hidden': 'true' }) : null,
    o.neu ? h('span', { class: 'nur-sr' }, ` – ${w.buchNeu}`) : null);
}

/**
 * Papierfassung (Querformat, eine Seite): Titel und Tabelle Nr · Anlass · Art · Entschieden von · Grundlage · Ergebnis, nur Zeilen bis zur
 * aktuellen Station, ohne „neu“, die Art als Wort. Übersprungene Stationen der Kurzfassung tragen Art und Ergebnis; die Felder „Entschieden von“ und „Grundlage“ sind dort zu einer Zelle „nur erzählt“ verbunden (L-410).
 */
export function buchDruck(g: Geschichte, stand: Stand): HTMLElement | null {
  const sicht = buchEintraege(g, stand);
  if (sicht.length === 0) return null;
  return h('section', { class: 'druck-teil druck-buch', 'data-pruef': 'druck-buch' },
    h('h2', null, w.buchDruckTitel),
    h('table', { class: 'druck-buch-tabelle' },
      h('thead', null, h('tr', null,
        h('th', { scope: 'col' }, w.buchSpalten.nr), h('th', { scope: 'col' }, w.buchSpalten.anlass), h('th', { scope: 'col' }, w.buchSpalten.art),
        h('th', { scope: 'col' }, w.buchSpalten.entschieden), h('th', { scope: 'col' }, w.buchSpalten.grundlage), h('th', { scope: 'col' }, w.buchSpalten.ergebnis))),
      h('tbody', null, sicht.map((s) => h('tr', { 'data-station': s.k.id },
        h('th', { scope: 'row' }, String(s.k.nr)),
        h('td', null, s.k.zeit),
        h('td', null, w.buchArt[s.eintrag.art] ?? s.eintrag.art),
        ...(s.voll
          ? [h('td', null, inhaltInline(s.eintrag.entschiedenHtml)), h('td', null, inhaltInline(s.eintrag.grundlageHtml))]
          : [h('td', { colspan: '2' }, w.buchDruckErzaehlt)]),
        h('td', null, inhaltInline(s.eintrag.ergebnisHtml)))))));
}
