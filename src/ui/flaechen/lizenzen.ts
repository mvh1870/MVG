/*
 * Drittanbieter & Lizenzen (Audit 2026-10-06, O-64): erreichbar über den Fuß jeder Seite (#lizenzen).
 * Je eingebetteter Schrift Name, Version, Copyright, Lizenz und Herkunft, dazu der Lizenztext der
 * SIL Open Font License 1.1 unverändert. Alle Angaben erzeugt werkzeuge/schriften.mjs beim Bau aus den
 * Schriften selbst (name-Tabelle) und den LICENSE-Dateien der Pakete – hier wird nichts von Hand gepflegt.
 * Texte laufen nur als Textknoten (h()), nie als HTML.
 */

import drittanbieter from '../../generiert/drittanbieter.json' with { type: 'json' };
import { bogenFuerStrgP, bogenKopf, druckeBogen } from '../druck.ts';
import { h } from '../h.ts';
import { seitenRahmen } from '../bausteine/seite.ts';
import { W } from '../woerter.ts';

type Komponente = { name: string; paket: string; paketVersion: string; schriftVersionen: string[]; copyright: string; lizenz: string; spdx: string; upstream: string; quelle: string };
const DATEN = drittanbieter as { komponenten: Komponente[]; oflText: string };

/** Inhalt der Ansicht (Bildschirm und Druck gleich). */
function lizenzInhalt(): HTMLElement[] {
  const L = W.lizenzen;
  const eintrag = (k: Komponente): HTMLElement => h('section', { class: 'lz-komponente', 'data-pruef': 'lz-komponente' },
    h('h3', null, k.name),
    h('dl', { class: 'lz-felder' },
      h('dt', null, L.felder.version), h('dd', null, k.schriftVersionen.map(L.schriftVersion).join(', ')),
      h('dt', null, L.felder.copyright), h('dd', { 'data-pruef': 'lz-copyright' }, k.copyright),
      h('dt', null, L.felder.lizenz), h('dd', null, `${k.lizenz} (${k.spdx})`),
      h('dt', null, L.felder.herkunft), h('dd', null, k.upstream),
      h('dt', null, L.felder.bezug), h('dd', null, L.bezug(k.paket, k.paketVersion, /\((https:[^)]+)\)/u.exec(k.quelle)?.[1] ?? k.quelle))));
  return [
    h('p', { class: 'lz-einleitung' }, L.einleitung),
    h('h2', null, L.komponenten),
    ...DATEN.komponenten.map(eintrag),
    h('h2', null, L.nutzungTitel),
    h('p', { 'data-pruef': 'lz-nutzung' }, L.nutzung),
    h('h2', null, L.oflTitel),
    h('p', { class: 'lz-leise' }, L.oflHinweis),
    h('pre', { class: 'lz-lizenztext', lang: 'en', 'data-pruef': 'lz-ofl', tabindex: 0 }, DATEN.oflText),
  ];
}

export function baueLizenzen(o: { version: string; bedienbar: boolean }): HTMLElement {
  const L = W.lizenzen;
  const bogen = (): { titel: string; teile: Node[] } => ({ titel: L.titel, teile: [bogenKopf(L.titel, o.version, false), h('section', { class: 'druck-teil lz-druck' }, lizenzInhalt())] });
  const drucken = o.bedienbar
    ? h('button', { type: 'button', class: 'knopf knopf-still druck-knopf', 'data-pruef': 'lizenzen-drucken', onclick: () => { const b = bogen(); druckeBogen(b.titel, b.teile); } }, L.drucken)
    : null;
  if (drucken !== null) bogenFuerStrgP(drucken, bogen);
  return seitenRahmen({
    bereich: 'start',
    klasse: 'lizenzen',
    bedienbar: o.bedienbar,
    inhalt: h('article', { class: 'lz-rahmen', 'data-pruef': 'lizenzen' },
      h('p', { class: 'lz-kicker' }, L.kicker),
      h('h1', { class: 'lz-titel', tabindex: -1 }, L.titel),
      ...lizenzInhalt(),
      drucken),
  });
}
