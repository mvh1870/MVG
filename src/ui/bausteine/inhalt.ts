/*
 * Inhalts-HTML aus src/generiert/inhalte.json in die Seite bringen.
 *
 * Das HTML ist zur Bauzeit aus Markdown entstanden und maskiert (werkzeuge/inhalte.mjs). Hier wird es
 * nur noch aufbereitet:
 * - Glossarbezüge `<span class="mvg-glossar" data-glossar=…>` werden zu `span.begriff[role=button]` (Mouseover
 *   und Tastaturfokus zeigen die Definition, siehe tooltip.ts) – kein `<button>`: Chromium setzt Knöpfe immer
 *   als inline-block, ein Begriff aus mehreren Wörtern bräche dann nicht im Fließtext um (R57);
 * - `<code>` (so schreiben Autoren IDs wie `ENT-017`) wird zu `span.mono`.
 */

import { schuetzeEinheitenIn, vonHtml } from '../h.ts';

/** Ersetzt Glossarbezüge durch Begriff-Knöpfe. */
export function aktiviereGlossar(wurzel: ParentNode): void {
  for (const span of [...wurzel.querySelectorAll('span.mvg-glossar')]) {
    const knopf = document.createElement('span');
    knopf.setAttribute('role', 'button');
    knopf.tabIndex = 0;
    knopf.className = 'begriff';
    // wie ein Knopf: Eingabe und Leertaste lösen aus (der Hinweis zeigt sich schon beim Fokus)
    knopf.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); knopf.click(); }
    });
    const id = span.getAttribute('data-glossar');
    if (id !== null) knopf.setAttribute('data-glossar', id);
    knopf.setAttribute('data-pruef', 'glossar-begriff');
    knopf.append(...span.childNodes);
    span.replaceWith(knopf);
  }
  // R60: Zahl und Einheit nicht am Zeilenende trennen (nur Anzeige)
  schuetzeEinheitenIn(wurzel as Node);
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
