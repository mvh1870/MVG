/*
 * Inhalts-HTML aus src/generiert/inhalte.json in die Seite bringen.
 *
 * Das HTML ist zur Bauzeit aus Markdown entstanden und maskiert (werkzeuge/inhalte.mjs). Hier wird es
 * nur noch aufbereitet:
 * - Glossarbezüge `<span class="mvg-glossar" data-glossar=…>` werden zu `button.begriff` (Mouseover
 *   und Tastaturfokus zeigen die Definition, siehe tooltip.ts);
 * - `<code>` (so schreiben Autoren IDs wie `ENT-017`) wird zu `span.mono`.
 */

import { vonHtml } from '../h.ts';
import { figur, type Mimik } from '../../figuren/figur.ts';
import { rollenAttr } from '../anzeige.ts';
import type { OeffentlicheInhalte } from '../../inhalte/typen.ts';

/** Ersetzt Glossarbezüge durch Begriff-Knöpfe. */
export function aktiviereGlossar(wurzel: ParentNode): void {
  for (const span of [...wurzel.querySelectorAll('span.mvg-glossar')]) {
    const knopf = document.createElement('button');
    knopf.type = 'button';
    knopf.className = 'begriff';
    const id = span.getAttribute('data-glossar');
    if (id !== null) knopf.setAttribute('data-glossar', id);
    knopf.setAttribute('data-pruef', 'glossar-begriff');
    knopf.append(...span.childNodes);
    span.replaceWith(knopf);
  }
  for (const code of [...wurzel.querySelectorAll('code')]) {
    const m = document.createElement('span');
    m.className = 'mono';
    m.append(...code.childNodes);
    code.replaceWith(m);
  }
}

/** Inhalts-HTML als Fragment, aufbereitet. */
export function inhalt(html: string): DocumentFragment {
  const f = vonHtml(html);
  aktiviereGlossar(f);
  return f;
}

/** Inhalts-HTML ohne umschließendes `<p>` (für Zeilen in Knöpfen, Chips, Überschriften). */
export function inhaltInline(html: string): DocumentFragment {
  const f = inhalt(html);
  if (f.childNodes.length === 1 && f.firstChild instanceof HTMLParagraphElement) {
    const p = f.firstChild;
    const g = document.createDocumentFragment();
    g.append(...p.childNodes);
    return g;
  }
  return f;
}

/** Figur einer Kennung aus fall.md in ihrer Rollenfarbe. */
export function personFigur(id: string, groesse: number, inhalte: OeffentlicheInhalte, mimik: Mimik = 'neutral'): SVGSVGElement {
  const f = inhalte.fall?.figuren[id] ?? null;
  return figur(id, { rolle: rollenAttr(f?.rolle ?? null), groesse, mimik });
}

/** Name einer Figur (oder die Kennung, wenn es sie nicht gibt). */
export function personName(id: string, inhalte: OeffentlicheInhalte): string {
  return inhalte.fall?.figuren[id]?.name ?? id;
}

export function personFunktion(id: string, inhalte: OeffentlicheInhalte): string {
  return inhalte.fall?.figuren[id]?.funktion ?? '';
}
