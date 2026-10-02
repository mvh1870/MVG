/*
 * Abbildung aus der DOCX V1.2 im Fachtext (P14, O-32, L-77): auf der Lernseite beim passenden Abschnitt und
 * im Originaltext an ihrer Stelle. Beschriftungen mit verbotenen Begriffen sind im Bild schon durch die
 * Begriffe des Texts ersetzt (werkzeuge/abbildungen.mjs); die Bildunterschrift sagt, dass der Text Vorrang
 * hat, nennt die Angleichungen und – zum Aufklappen – was noch vom Text abweicht. „Vergrößern“ öffnet das
 * Bild in einem Dialog über die ganze Fensterbreite.
 *
 * Die Bilddaten (data:-URLs) kommen getrennt aus src/generiert/abbildungen.json: Nur src/main.ts lädt sie
 * und reicht sie mit `setzeAbbildungsBilder` herein – so bleiben Tests und Leinwand-Module klein.
 */

import { h } from '../h.ts';
import type { Abbildung } from '../../inhalte/typen.ts';
import { inhaltInline } from './inhalt.ts';
import { sym } from './bloecke.ts';
import { halteRollenImDialog, oeffneDialog, schliesseBeiKlickDaneben } from '../dialog.ts';
import { W } from '../woerter.ts';

let bilder: Readonly<Record<string, string>> = {};

export function setzeAbbildungsBilder(daten: Readonly<Record<string, string>>): void {
  bilder = daten;
}

export function abbildungsBild(id: string): string | null {
  return bilder[id] ?? null;
}

export interface AbbildungsOptionen {
  /** false auf der Leinwand und im Druck: kein Knopf, kein Dialog */
  bedienbar: boolean;
}

/** Figur mit Bild und Bildunterschrift; null, wenn die Abbildung keine Beschreibung hat. */
export function abbildung(a: Abbildung, o: AbbildungsOptionen): HTMLElement | null {
  const bild = a.bild;
  if (bild === null) return null;
  const A = W.abbildung;
  const daten = abbildungsBild(a.id);
  const img = (): HTMLElement => (daten !== null
    ? h('img', { class: 'abbildung-bild', src: daten, alt: bild.alt, width: bild.breite, height: bild.hoehe, decoding: 'async' })
    : h('div', { class: 'abbildung-fehlt', role: 'img', 'aria-label': bild.alt }, A.fehlt));

  let dialog: HTMLDialogElement | null = null;
  let figur: HTMLElement | null = null;
  const oeffne = (): void => {
    if (dialog !== null && figur !== null) oeffneDialog(dialog, figur);
  };
  const bildEl = img();
  if (o.bedienbar && daten !== null && typeof HTMLDialogElement === 'function') {
    dialog = h('dialog', { class: 'abbildung-dialog', 'aria-label': bild.titel, 'data-pruef': 'abbildung-dialog' },
      h('div', { class: 'abbildung-dialog-kopf' },
        h('p', { class: 't-label' }, bild.titel),
        h('button', { type: 'button', class: 'knopf knopf-still', 'data-pruef': 'abbildung-schliessen', onclick: () => dialog?.close() }, A.schliessen)),
      img()) as HTMLDialogElement;
    // Klick neben den Dialog (auf den Hintergrund) schließt ebenfalls, der Innenrand nicht
    schliesseBeiKlickDaneben(dialog);
    halteRollenImDialog(dialog);
    bildEl.addEventListener('click', oeffne);
    bildEl.classList.add('ist-vergroesserbar');
  }

  const unterschrift = h('figcaption', { class: 'abbildung-unterschrift' },
    h('span', { class: 't-label abbildung-marke' }, A.marke(a.nr)),
    h('span', { class: 'abbildung-titel' }, bild.titel),
    h('span', { class: 'abbildung-vorrang' }, A.vorrang),
    bild.angeglichen.length > 0
      // jeder Begriff einmal, auch wenn er im Bild mehrfach steht (abb-7)
      ? h('span', { class: 'abbildung-angeglichen' }, `${A.angeglichen} `, [...new Set(bild.angeglichen.map((x) => x.text))].map((t, i) => [i > 0 ? ', ' : null, `„${t}“`]).flat())
      : null,
    bild.abweichungen.length > 0
      // auf Leinwand und im Druck offen: dort kann niemand aufklappen (P12.5 R11, wie L-68)
      ? h('details', { class: 'abbildung-abweichungen', 'data-pruef': 'abbildung-abweichungen', open: !o.bedienbar },
        h('summary', null, A.abweichungen(bild.abweichungen.length)),
        h('ul', null, bild.abweichungen.map((x) => h('li', null, inhaltInline(x.html)))))
      : null,
    dialog !== null
      ? h('button', { type: 'button', class: 'knopf knopf-still abbildung-gross', 'data-pruef': 'abbildung-gross', 'aria-label': A.grossName(bild.titel), onclick: oeffne }, sym('pfeilRechts'), A.gross)
      : null);

  figur = h('figure', { class: 'abbildung', 'data-pruef': 'abbildung', 'data-abbildung': a.id },
    h('div', { class: 'abbildung-rahmen' }, bildEl),
    unterschrift,
    dialog);
  return figur;
}
