/*
 * Marke (docs/STIL.md, Grundsatz 8): Logo und Bildmarke als Inline-SVG mit `currentColor`.
 *
 * Die SVG-Texte setzt src/main.ts beim Start (esbuild bettet sie ein). Ohne sie – etwa im Test unter
 * Node – liefern die Funktionen leere Knoten; die Flächen zeichnen trotzdem.
 * Unter 96 px Höhe nur die Bildmarke (die Wortmarke wäre unlesbar), das Gesamtlogo ab 96 px.
 */

import { vonHtml } from './h.ts';

let logoText = '';
let bildmarkeText = '';

export function setzeMarke(logo: string, bildmarke: string): void {
  logoText = logo;
  bildmarkeText = bildmarke;
}

function alsElement(text: string, klasse: string): Node {
  if (text === '') return document.createTextNode('');
  const svg = vonHtml(text.trim()).firstElementChild;
  if (svg === null) return document.createTextNode('');
  // dekorativ: der Name „Bauherr Mentoren“ steht als Text daneben
  svg.querySelector('title')?.remove();
  svg.removeAttribute('role');
  svg.removeAttribute('aria-label');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', klasse);
  return svg;
}

/** Bildmarke (Türme über dem Bogen), für Höhen unter 96 px. */
export function bildmarke(klasse = 'marke-logo'): Node {
  return alsElement(bildmarkeText, klasse);
}

/** Gesamtlogo mit Wortmarke, nur ab 96 px Höhe. */
export function logo(klasse = 'marke-logo'): Node {
  return alsElement(logoText, klasse);
}
