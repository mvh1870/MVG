/*
 * Gemeinsame Bausteine der vier neuen Explore-Werkzeuge (P18.3/P18.4, O-59; Konzept docs/WERKZEUGE-P18.md Abschnitt 0):
 * Beispielwahl mit „Leer beginnen“, Ampel mit Wort, Optionsfelder, Druckknopf mit eigenem Bogen (auch für Strg+P),
 * Fokus beim Neuzeichnen. Nichts wird gespeichert oder gesendet: der Stand lebt nur in der geöffneten Ansicht.
 */
import type { OeffentlicheInhalte, Werkzeuge } from '../../../inhalte/typen.ts';
import type { Ampel } from '../../../werkzeuge/gemeinsam.ts';
import { gimmick, type GimmickName } from '../../../grafik/figuren.ts';
import { ampelBild } from '../../../grafik/werkzeug-bilder.ts';
import { bogenFuerStrgP, bogenKopf, druckeBogen } from '../../druck.ts';
import { h, vonHtml, type Kind } from '../../h.ts';
import { W } from '../../woerter.ts';

export const E = W.werkzeuge;

/** Was ein Werkzeug zum Zeichnen braucht. `stand` ist der gelesene Werkzeugstand (Beispiel und Schritt, Konzept 0.3) oder null. */
export interface WerkzeugOptionen {
  inhalte: OeffentlicheInhalte;
  w: Werkzeuge;
  bedienbar: boolean;
  stand: { beispiel: string; schritt: string | null } | null;
}

/** Zahl im deutschen Format („1.500.000“). */
export const zahl = (n: number): string => n.toLocaleString('de-DE', { maximumFractionDigits: 2 });

/** Merkt sich das fokussierte Element unter `ort` (über `data-pruef`) und setzt den Fokus nach dem Neuzeichnen zurück (R68). */
export function mitFokus(ort: HTMLElement, zeichne: () => void): void {
  const aktiv = typeof document !== 'undefined' ? document.activeElement : null;
  const schluessel = aktiv instanceof HTMLElement && ort.contains(aktiv) ? aktiv.dataset['pruef'] ?? null : null;
  zeichne();
  if (schluessel !== null) (ort.querySelector(`[data-pruef="${schluessel}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
}

/** Beispielwahl (Auswahlliste) mit „Leer beginnen“; nicht bedienbar nur der Name des Beispiels. */
export function beispielWahl(o: { bedienbar: boolean; pruef: string; titel?: string; beispiele: readonly { id: string; titel: string }[]; aktiv: string | null; leer: boolean; leerTitel?: string; beiWahl: (id: string | null) => void }): HTMLElement {
  const leer = o.leerTitel ?? E.leerBeginnen;
  const titel = o.beispiele.find((b) => b.id === o.aktiv)?.titel ?? leer;
  if (!o.bedienbar) return h('p', { class: 'ex-beispiel wz-beispiel-text' }, h('span', { class: 't-label' }, o.titel ?? E.beispielWahl), h('b', null, titel));
  const optionen = o.beispiele.map((b) => h('option', { value: b.id, selected: b.id === o.aktiv }, b.titel));
  if (o.leer) optionen.push(h('option', { value: '', selected: o.aktiv === null }, leer));
  return h('label', { class: 'ex-beispiel' },
    h('span', { class: 't-label' }, o.titel ?? E.beispielWahl),
    h('select', { 'data-pruef': o.pruef, onchange: (e: Event) => { const v = (e.target as HTMLSelectElement).value; o.beiWahl(v === '' ? null : v); } }, optionen));
}

/** Ampel mit Wort daneben (Farbe nie allein). */
export function ampelAnzeige(ampel: Ampel | null, wort: string, pruef: string): HTMLElement {
  return h('div', { class: 'wz-ampel', 'data-ampel': ampel ?? 'offen', 'data-pruef': pruef },
    vonHtml(ampelBild(ampel, wort, 32)),
    h('strong', { class: 'wz-ampel-wort' }, wort));
}

/** Gegenstand je Ergebnis (Schmuck neben dem Wort). */
export function ergebnisBild(name: GimmickName, groesse = 72): HTMLElement {
  return h('span', { class: 'wz-bild', 'aria-hidden': 'true', 'data-bild': name }, vonHtml(gimmick(name, { groesse, dekorativ: true })));
}

/** Optionsfelder als Gruppe; nicht bedienbar nur die gewählte Antwort als Text. */
export function optionen<T extends string>(o: {
  bedienbar: boolean;
  name: string;
  legende: Kind;
  wahl: readonly { wert: T; titel: string }[];
  gewaehlt: T | null | undefined;
  beiWahl: (wert: T) => void;
  klasse?: string;
}): HTMLElement {
  const klasse = `wz-frage${o.klasse !== undefined ? ` ${o.klasse}` : ''}`;
  if (!o.bedienbar) {
    const t = o.wahl.find((x) => x.wert === o.gewaehlt)?.titel ?? '–';
    return h('div', { class: klasse, 'data-frage': o.name }, h('p', { class: 'wz-legende' }, o.legende), h('p', { class: 'wz-gewaehlt' }, h('b', null, t)));
  }
  return h('fieldset', { class: klasse, 'data-frage': o.name },
    h('legend', { class: 'wz-legende' }, o.legende),
    h('div', { class: 'wz-wahlen' }, o.wahl.map((x) => h('label', { class: 'wz-wahl' },
      h('input', {
        type: 'radio', name: o.name, value: x.wert, checked: x.wert === o.gewaehlt, 'data-pruef': `${o.name}-${x.wert}`,
        onchange: (e: Event) => { if ((e.target as HTMLInputElement).checked) o.beiWahl(x.wert); },
      }),
      h('span', null, x.titel)))));
}

/** Auswahlliste mit Beschriftung. */
export function auswahl<T extends string>(o: { name: string; titel: string; wahl: readonly { wert: T; titel: string }[]; gewaehlt: T; beiWahl: (wert: T) => void; versteckt?: boolean }): HTMLElement {
  return h('label', { class: 'wz-feld' },
    h('span', { class: o.versteckt === true ? 'nur-sr' : 't-label' }, o.titel),
    h('select', { 'data-pruef': o.name, onchange: (e: Event) => o.beiWahl((e.target as HTMLSelectElement).value as T) },
      o.wahl.map((x) => h('option', { value: x.wert, selected: x.wert === o.gewaehlt }, x.titel))));
}

/** Textfeld mit Beschriftung und Höchstlänge (Feldgrenze, Konzept D.2). */
export function textFeld(o: { name: string; titel: string; wert: string; max: number; beiEingabe: (t: string) => void; mehrzeilig?: boolean; versteckt?: boolean }): HTMLElement {
  const attr = { 'data-pruef': o.name, maxlength: o.max, oninput: (e: Event) => o.beiEingabe((e.target as HTMLInputElement | HTMLTextAreaElement).value) };
  const feld = o.mehrzeilig === true ? h('textarea', { ...attr, rows: 2 }) : h('input', { ...attr, type: 'text', value: o.wert });
  if (o.mehrzeilig === true) (feld as HTMLTextAreaElement).value = o.wert;
  return h('label', { class: 'wz-feld' }, h('span', { class: o.versteckt === true ? 'nur-sr' : 't-label' }, o.titel), feld);
}

/** Zahlenfeld; leer = null (unbekannt). */
export function zahlFeld(o: { name: string; titel: string; wert: number | null; beiEingabe: (n: number | null) => void; platzhalter?: string; versteckt?: boolean; min?: number; ganz?: boolean }): HTMLElement {
  return h('label', { class: 'wz-feld wz-zahl' },
    h('span', { class: o.versteckt === true ? 'nur-sr' : 't-label' }, o.titel),
    h('input', {
      type: 'number', inputmode: o.ganz === true ? 'numeric' : 'decimal', step: o.ganz === true ? 1 : 'any', min: o.min ?? 0, 'data-pruef': o.name,
      value: o.wert === null ? '' : String(o.wert), placeholder: o.platzhalter ?? null,
      oninput: (e: Event) => {
        const t = (e.target as HTMLInputElement).value.trim();
        const n = t === '' ? null : Number(t);
        o.beiEingabe(n === null || Number.isFinite(n) ? n : null);
      },
    }));
}

/** Knopf. */
export function knopf(o: { pruef: string; text: Kind; beiKlick: () => void; leise?: boolean; label?: string; gedrueckt?: boolean }): HTMLElement {
  return h('button', {
    type: 'button', class: o.leise === true ? 'gs-leiser-knopf' : 'wz-knopf', 'data-pruef': o.pruef, 'aria-label': o.label ?? null,
    'aria-pressed': o.gedrueckt === undefined ? null : o.gedrueckt ? 'true' : 'false', onclick: () => o.beiKlick(),
  }, o.text);
}

/**
 * Druckknopf: öffnet den Druckbefehl des Browsers mit einem eigenen Bogen (A4 hoch, eine Seite, ohne Bedienelemente);
 * derselbe Bogen gilt für Strg+P, solange der Knopf im Dokument steht (R38). `titel` und `teile` werden erst beim Drucken gebaut.
 */
export function druckKnopf(werkzeug: string, bauer: () => { titel: string; fiktiv: boolean; teile: Node[] }): HTMLElement {
  const bogen = (): { titel: string; teile: Node[] } => {
    const b = bauer();
    return { titel: b.titel, teile: [h('div', { class: 'wz-druck', 'data-werkzeug': werkzeug }, bogenKopf(b.titel, '', b.fiktiv), b.teile)] };
  };
  const k = h('button', { type: 'button', class: 'gs-knopf wz-drucken', 'data-pruef': `${werkzeug}-drucken`, onclick: () => { const b = bogen(); druckeBogen(b.titel, b.teile); } }, E.drucken);
  bogenFuerStrgP(k, bogen);
  return k;
}

/** Hinweis- oder Lückenkarte: kurzer Titel, Satz, Schwere als Wort. */
export function karte(o: { titel: string | null; satz: string; schwere: 'rot' | 'gelb' | 'info'; wort?: string | null; pruef?: string }): HTMLElement {
  return h('li', { class: 'wz-karte', 'data-schwere': o.schwere, 'data-pruef': o.pruef ?? null },
    o.titel !== null || (o.wort ?? null) !== null ? h('p', { class: 'wz-karte-kopf' },
      o.titel !== null ? h('b', null, o.titel) : null,
      (o.wort ?? null) !== null ? h('span', { class: 'wz-schwere' }, o.wort) : null) : null,
    h('p', null, o.satz));
}
