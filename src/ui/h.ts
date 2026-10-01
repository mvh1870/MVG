/*
 * Mini-DOM-Helfer (docs/ARCHITEKTUR.md → src/ui/h.ts): Elemente bauen, ohne Bibliothek.
 *
 * `h('button', { class: 'knopf', 'data-pruef': 'weiter', onclick: fn }, 'Weiter')`
 *
 * Werte: `true` setzt ein leeres Attribut, `false`/`null`/`undefined` lassen es weg, Funktionen unter
 * Schlüsseln `on…` werden zu Ereignis-Zuhörern. Kinder: Knoten, Text (wird Textknoten, nie HTML),
 * Zahlen, Listen; `null`/`false` fallen weg.
 *
 * HTML als Text gibt es nur über `vonHtml()` – und nur für Inhalte, die zur Bauzeit erzeugt und
 * maskiert wurden (src/generiert/inhalte.json) oder für eigene SVG-Zeichenketten (src/stil/symbole.ts,
 * src/figuren, src/grafik). Nie für Eingaben zur Laufzeit.
 */

export type Kind = Node | string | number | null | undefined | false | readonly Kind[];

export type AttributWert = string | number | boolean | null | undefined;
export type Attribute = Record<string, AttributWert | ((e: Event) => void)>;

const SVG_NS = 'http://www.w3.org/2000/svg';

function setzeAttribute(el: Element, attr: Attribute | null | undefined): void {
  if (!attr) return;
  for (const [name, wert] of Object.entries(attr)) {
    if (typeof wert === 'function') {
      if (name.startsWith('on')) el.addEventListener(name.slice(2), wert as EventListener);
      continue;
    }
    if (wert === false || wert === null || wert === undefined) continue;
    el.setAttribute(name, wert === true ? '' : String(wert));
  }
}

function haengeAn(el: Node, kinder: readonly Kind[]): void {
  for (const k of kinder) {
    if (k === null || k === undefined || k === false) continue;
    if (Array.isArray(k)) {
      haengeAn(el, k as readonly Kind[]);
      continue;
    }
    if (typeof k === 'string' || typeof k === 'number') {
      el.appendChild(document.createTextNode(String(k)));
      continue;
    }
    el.appendChild(k as Node);
  }
}

/** Baut ein HTML-Element. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attr?: Attribute | null, ...kinder: Kind[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  setzeAttribute(el, attr);
  haengeAn(el, kinder);
  return el;
}

/** Baut ein SVG-Element im SVG-Namensraum. */
export function s<K extends keyof SVGElementTagNameMap>(tag: K, attr?: Attribute | null, ...kinder: Kind[]): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  setzeAttribute(el, attr);
  haengeAn(el, kinder);
  return el;
}

/** Dokumentfragment aus vertrauenswürdigem HTML (siehe Kopfkommentar). */
export function vonHtml(html: string): DocumentFragment {
  const t = document.createElement('template');
  t.innerHTML = html;
  return t.content;
}

/** Erstes Element aus vertrauenswürdigem HTML (z. B. ein SVG-Symbol). */
export function elementAus(html: string): Element {
  const el = vonHtml(html).firstElementChild;
  if (el === null) throw new Error('vonHtml: kein Element');
  return el;
}

/** Ersetzt alle Kinder. */
/**
 * R47: Umbruchstelle ohne Zeichen (<wbr>) nach „/“ zwischen Wörtern („Risiko-/Änderungs-/Maßnahmenverknüpfung“,
 * „Rollen/Freigaben/Entscheidungen“) – sonst ist die Kette ein einziges Wort und bricht mitten im Wort. Text,
 * Suche und Kopieren bleiben unverändert (anders als U+200B im Druck).
 */
export function umbruchNachSchraegstrich(el: Element): void {
  const dok = el.ownerDocument;
  const gang = dok.createTreeWalker(el, 4);
  const knoten: Text[] = [];
  for (let n = gang.nextNode(); n !== null; n = gang.nextNode()) if (/[\p{L}-]\/\p{L}/u.test(n.textContent ?? '') && n.parentElement?.closest('code, svg, script, style') === null) knoten.push(n as Text);
  for (const t of knoten) {
    const teile = (t.textContent ?? '').split(/(?<=[\p{L}-]\/)(?=\p{L})/u);
    const frag = dok.createDocumentFragment();
    teile.forEach((teil, i) => { if (i > 0) frag.append(dok.createElement('wbr')); frag.append(dok.createTextNode(teil)); });
    t.replaceWith(frag);
  }
}

/**
 * R47: Zeichenzahl des längsten Worts – für Schriftgrößen, die ein Wort nie mitten im Wort brechen lassen (CSS `--zeichen`).
 * R48: geteilt wird nur, wo der Browser umbricht – an Leerraum und nach einem Bindestrich vor einem Buchstaben (der Strich
 * zählt mit); „/“ ist in Titeln keine Umbruchstelle („IT-/Datenschutz-“ ist eine Einheit mit 16 Zeichen).
 */
export function laengstesWort(text: string): number {
  return Math.max(1, ...text.split(/\s+|(?<=-)(?=\p{L})/u).map((w) => [...w].length));
}

export function ersetze(el: Element, ...kinder: Kind[]): void {
  el.replaceChildren();
  haengeAn(el, kinder);
}

/** Text ohne Tags aus vertrauenswürdigem HTML (für aria-Beschriftungen). */
export function textAus(html: string): string {
  return (vonHtml(html).textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Setzt oder entfernt ein Attribut, nur wenn es sich ändert (spart Stil-Neuberechnungen). */
export function attr(el: Element, name: string, wert: AttributWert): void {
  if (wert === false || wert === null || wert === undefined) {
    if (el.hasAttribute(name)) el.removeAttribute(name);
    return;
  }
  const w = wert === true ? '' : String(wert);
  if (el.getAttribute(name) !== w) el.setAttribute(name, w);
}

/** Setzt Text nur, wenn er sich ändert. */
export function text(el: Node, wert: string): void {
  if (el.textContent !== wert) el.textContent = wert;
}

/**
 * Weiche Trennstellen (U+00AD) in langen Wörtern nach einer Fuge („Entscheidungs|grundlagen“, „Maßnahmen|verknüpfung“).
 * Sichtbar wird der Strich nur, wo die Zeile tatsächlich dort umbricht; der Wortlaut bleibt gleich (dazu ein
 * Umbruch ohne Breite nach „/“ zwischen Wörtern).
 */
export function mitTrennstellen(text: string): string {
  // „Risiko-/Änderungs-/Maßnahmen…“, „Rollen/Freigaben/…“: nach „/“ darf die Zeile umbrechen (sonst ein unteilbarer Block)
  return text.replace(/(?<=[\p{L}-])\/(?=\p{L})/gu, '/\u200b').replace(/\p{L}{12,}/gu, (wort) => wort.replace(/(?<=\p{L}(?:ungs|heits|keits|schafts|tions|täts|stands|ßnahmen|agement|umenten|triebs|utzen|ister|tritts|ketten|lagen|gabe|schutz|ohbau|struktur|upreis|osten))(?!(?<=agement)s)(?!(?<=gabe)n[^aeiouäöü])(?=\p{Ll}{4})/gu, '\u00ad'));
}
