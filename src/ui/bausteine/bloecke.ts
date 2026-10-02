/*
 * Bausteine der Themen aus Inhaltsblöcken (docs/INHALTSFORMAT.md): Hinweis, Merksatz und Tafel (Tabelle als Grafik),
 * dazu die Ikonen. Jede Funktion zeichnet genau einen Block; Texte kommen aus dem Block.
 */

import { h, elementAus } from '../h.ts';
import { symbol, type SymbolName } from '../../stil/symbole.ts';
import type { Block } from '../../inhalte/typen.ts';
import { kopfText, istKarte } from '../anzeige.ts';
import { inhalt } from './inhalt.ts';
import { tafel as tafelGrafik, istTafelForm, type TitelStufe } from '../../grafik/tafel.ts';

export function sym(name: SymbolName, klasse = ''): Element {
  return elementAus(symbol(name, klasse));
}

/** Symbolnamen der Inhalte (z. B. `symbol: anruf`) → Ikone des Stils. */
const SYMBOL_AUS_INHALT: Readonly<Record<string, SymbolName>> = {
  anruf: 'telefon',
  telefon: 'telefon',
  mail: 'mail',
  chat: 'chat',
  weiterarbeiten: 'weiterarbeiten',
  vorlage: 'dokument',
  dokument: 'dokument',
  eskalation: 'eskalieren',
  eskalieren: 'eskalieren',
  aktualisieren: 'aktualisieren',
  haken: 'haken',
  kreuz: 'kreuz',
  warnung: 'warnung',
  kompass: 'kompass',
  wechsel: 'wechsel',
  schild: 'schild',
  person: 'person',
  flagge: 'flagge',
  stempel: 'stempel',
  buch: 'buch',
  info: 'info',
};

export function symbolAusInhalt(name: string | null): Element | null {
  if (name === null) return null;
  const s = SYMBOL_AUS_INHALT[name];
  return s !== undefined ? sym(s) : null;
}

export function hinweis(b: Block): HTMLElement {
  return h('div', { class: 'hinweis-zeile' }, sym('info'), h('div', null, inhalt(b.felder['text'] ?? '')));
}

export function merksatz(b: Block, verzug = 0): HTMLElement {
  return h('div', { class: 'lehre anim-einblenden', style: `--verzug:${verzug}ms` }, sym('lesezeichen'), h('div', null, inhalt(b.felder['text'] ?? '')));
}

/** Tabelle als Grafik (P4, L-32). */
export function tafel(b: Block, stufe: TitelStufe = 'h4'): HTMLElement | null {
  const form = kopfText(b.kopf, 'form') ?? '';
  const t = b.kopf['tabelle'];
  if (!istTafelForm(form) || b.id === null || !istKarte(t)) return null;
  const zeilen = Array.isArray(t['zeilen']) ? t['zeilen'].map((z) => (Array.isArray(z) ? z.map(String) : [])) : [];
  const kopf = Array.isArray(t['kopf']) ? t['kopf'].map(String) : [];
  const h0 = b.kopf['hervor'];
  const hervor = Array.isArray(h0) ? h0.map(Number) : [];
  return mitEinleitung(b, tafelGrafik({ form, absatz: b.id, quelle: '', kopf, zeilen, erlebt: {}, namen: {}, hervor, stufe }, []));
}

/** Einleitungstext eines Blocks (falls vorhanden) über seiner Grafik. */
export function mitEinleitung(b: Block, el: HTMLElement): HTMLElement {
  const text = b.felder['text'] ?? '';
  return text !== '' ? h('div', { class: 'stapel' }, h('div', { class: 'tafel-einleitung' }, inhalt(text)), el) : el;
}
