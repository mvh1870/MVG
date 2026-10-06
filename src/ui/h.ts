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
 *
 * VERTRAUENSGRENZE (Audit 2026-10-06, O-64) – wer `vonHtml()`/`elementAus()` aufruft, gehört zu genau einer Klasse:
 *   1. Bauzeit-Inhalt: HTML aus src/generiert/inhalte.json (werkzeuge/inhalte.mjs, marked, Begriffsprüfung) –
 *      src/ui/bausteine/inhalt.ts (inhaltHtml, inhaltInline).
 *   2. Intern erzeugtes Markup: SVG-Zeichenketten aus src/stil/symbole.ts, src/grafik/*, src/ui/marke.ts (Logo
 *      aus quellen/marke). Text darin nur über deren Maskierung (`tx`, `maske` in src/grafik/werkzeug-bilder.ts).
 *   3. Benutzerbeeinflusst, nur als Zahl: Risiko-Bewerter und Monatsbericht geben Zahlen aus Eingabefeldern
 *      (geparst mit Number, gerundet) an src/grafik/werkzeug-bilder.ts; Beschriftungen kommen aus den Inhalten.
 *   Benutzertext (Freitext, Titel, Notizen, Protokoll) geht NIE hierher, sondern als Textknoten über h()/text().
 *   URL-, Import- oder nachgeladene Inhalte gibt es nicht (CSP: connect-src 'none'). Wer eine neue Quelle anschließt,
 *   muss sie einer Klasse zuordnen; zusätzlich räumt `vonHtml()` jedes Fragment nach einer Positivliste auf
 *   (`bereinige`): Skript- und Einbettungselemente fliegen raus, ebenso Ereignis-Attribute (on…) und Adressen, die
 *   nicht mit #, https:, mailto: oder data:image/ beginnen oder relativ sind. Tests: tests/sicherheit-html.test.ts.
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

/**
 * R60: Zahl und Einheit bleiben in einer Zeile („100 TEUR“, „5 Mio. €“, „6 Wochen“, „LPH 0“, „Kap. 6.4.3“) –
 * geschützte Leerzeichen nur in der Anzeige; die Quellen (und damit die Zitatprüfung) bleiben unverändert.
 */
export function schuetzeEinheiten(text: string): string {
  return text
    .replace(/(\d) (?=(?:TEUR|EUR|€|Mio\.|Wochen|Tage|Monate)(?![\p{L}]))/gu, '$1\u00a0')
    .replace(/Mio\. (?=€|EUR)/gu, 'Mio.\u00a0')
    .replace(/\b(LPH|Kap\.) (?=\d)/gu, '$1\u00a0')
    // R68: Zahlenbereiche („LPH 0–9“, „31–60 Tage“) nicht am Strich trennen
    .replace(/(\d)–(?=\d)/gu, '$1\u2060–\u2060');
}

/** Weiche Trennstellen an Kompositum-Fugen, ohne den Umbruch nach „/“ (kein unsichtbares Zeichen im Text, R12/R13). */
export function nurFugen(text: string): string {
  return mitTrennstellen(text).replace(/\u200b/gu, '');
}

/** R60/R68: schützt Zahl und Einheit in allen Textknoten unter `wurzel` (nur Anzeige). */
export function schuetzeEinheitenIn(wurzel: Node): void {
  const doc = wurzel.ownerDocument ?? document;
  const gang = doc.createTreeWalker(wurzel, 4);
  for (let n = gang.nextNode(); n !== null; n = gang.nextNode()) {
    const alt = n.nodeValue ?? '';
    // R69: dazu weiche Trennstellen an den Fugen langer Komposita (Browser ohne deutsches Trennwörterbuch)
    const neu = nurFugen(schuetzeEinheiten(alt));
    if (neu !== alt) n.nodeValue = neu;
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
  // R58: in Links, Knöpfen und Aufklappzeilen ist ein Glossarbegriff nur Text – ein bedienbarer Begriff darin wäre ein
  // verschachteltes Bedienelement (Eingabe auf dem Begriff folgte dem Link). Er behält Klasse und Hinweis bei Mouseover.
  const e = el as Element;
  if (typeof e.matches === 'function' && e.matches('a, button, summary, label')) {
    for (const b of e.querySelectorAll('.begriff[tabindex]')) { b.removeAttribute('tabindex'); b.removeAttribute('role'); }
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

/** Elemente, die nie aus einer Zeichenkette entstehen dürfen (auch nicht im SVG-Namensraum). */
const VERBOTENE_ELEMENTE = new Set(['script', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'base', 'link', 'meta', 'form', 'foreignobject', 'animate', 'set', 'animatemotion', 'animatetransform', 'handler', 'listener']);
/** Attribute mit Adressen: erlaubt sind Sprungziele, https, mailto, eingebettete Bilder und relative Adressen ohne Schema. */
const ADRESS_ATTRIBUTE = new Set(['href', 'src', 'xlink:href', 'action', 'formaction', 'poster', 'srcset', 'background']);
const SICHERE_ADRESSE = /^(?:#|https:\/\/|mailto:|data:image\/(?:png|jpeg|webp|gif|svg\+xml)[;,]|(?![a-z][a-z0-9+.-]*:)[^\s])/iu;

/**
 * Räumt ein geparstes Fragment nach der Positivliste auf (Audit 2026-10-06, O-64): Verbotene Elemente werden
 * entfernt, Ereignis-Attribute (on…) und `style` mit `url(` gestrichen, Adressen außerhalb von SICHERE_ADRESSE
 * entfernt. Für die heutigen Quellen (Klassen 1–3 im Kopfkommentar) ändert sich nichts; die Prüfung ist das Netz
 * für eine künftige Quelle, die versehentlich ungeprüft hier landet.
 */
export function bereinige(wurzel: DocumentFragment | Element): void {
  for (const el of [...wurzel.querySelectorAll('*')]) {
    if (VERBOTENE_ELEMENTE.has(el.localName.toLowerCase())) { el.remove(); continue; }
    for (const a of [...el.attributes]) {
      const name = a.name.toLowerCase();
      const wert = a.value.replace(/[\u0000-\u0020]/gu, '');
      if (name.startsWith('on') || (name === 'style' && /url\s*\(|expression\s*\(/iu.test(a.value)) || (ADRESS_ATTRIBUTE.has(name) && !SICHERE_ADRESSE.test(wert))) {
        el.removeAttribute(a.name);
      }
    }
  }
}

/** Dokumentfragment aus vertrauenswürdigem HTML (siehe Kopfkommentar: Vertrauensgrenze), zusätzlich bereinigt. */
export function vonHtml(html: string): DocumentFragment {
  const t = document.createElement('template');
  t.innerHTML = html; // Vertrauensgrenze: nur Klassen 1–3 (Kopfkommentar); das Template führt nichts aus
  bereinige(t.content);
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
  return text.replace(/(?<=[\p{L}-])\/(?=\p{L})/gu, '/\u200b').replace(/\p{L}{12,}/gu, (wort) => wort.replace(/(?<=\p{L}(?:ungs|heits|keits|schafts|tions|täts|stands|ßnahmen|agement|umenten|triebs|utzen|ister|tritts|ketten|lagen|gabe|schutz|ohbau|struktur|upreis|osten))(?!(?<=agement)s)(?!(?<=gabe)n[^aeiouäöü])(?=\p{Ll}{4})/gu, '\u00ad'))
    // R56: „Daten|anforderung“ (Tabelle k8.1-t1 im Druck) – die Fuge liegt vor dem Grundwort, nicht hinter einer Endung der Liste; R61: „Status|bericht“ (Datei-Karte B4)
    // R64: „Folge|kosten“ (Stationstitel A5 stand bei 1008–1088 px über 93 % seiner Zeile); L-429: „Letzt|verantwortung“ (Lernkarte bei 320 px in DejaVu Sans 95 %)
    .replace(/(?<=\p{L}{4})(?=anforderung|bericht|kosten|verknüpfung|bewertung|verantwortung)/gu, '\u00ad')
    // R68: Fugen, die die Liste oben nicht kennt (Etappen, Umschalter, Bausteine in schmalen Spalten)
    .replace(/(?<=Mandats|Beschluss)(?=\p{Ll}{4})/gu, '\u00ad')
    .replace(/Entscheidungs-/gu, 'Entschei\u00addungs-');
}
