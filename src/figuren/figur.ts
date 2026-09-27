/*
 * Figuren-Baukasten (O-6, docs/STIL.md „Figuren und Requisiten“): flache SVG-Figuren im 64er-Raster,
 * aus dem Prototyp (Variante B, `avatar()`) übernommen und parametrisiert.
 *
 * `figur(id, { rolle, groesse })` zeichnet die Figur einer Kennung aus `inhalte/fall.md`. Farben kommen
 * ausschließlich aus dem Stil: Kleidung über `data-rolle` (Rollenfarbe), Haut und Haar über
 * `data-haut`/`data-haar` (Token --figur-haut-1…6 / --figur-haar-1…6). Das Aussehen (Frisur, Haut,
 * Haar, Brille) ist Gestaltung, kein Inhalt, und steht deshalb hier.
 *
 * Figuren sind dekorativ (`aria-hidden`); Name und Rolle stehen immer als Text daneben.
 */

import { elementAus } from '../ui/h.ts';

export type Frisur = 'kurz' | 'bart' | 'lang' | 'dutt' | 'bob' | 'seite';

export interface Aussehen {
  frisur: Frisur;
  /** 1–6 → --figur-haut-n */
  haut: number;
  /** 1–6 → --figur-haar-n */
  haar: number;
  brille?: boolean;
  /** heller Mund (im Bart) */
  mundHell?: boolean;
}

/** Besetzung nach L-5 (Prototyp-Figuren); unbekannte Kennungen bekommen ein neutrales Aussehen. */
export const AUSSEHEN: Readonly<Record<string, Aussehen>> = {
  sie: { frisur: 'kurz', haut: 1, haar: 1 },
  brenner: { frisur: 'bart', haut: 2, haar: 2, mundHell: true },
  kaya: { frisur: 'lang', haut: 3, haar: 3 },
  hoffmeister: { frisur: 'dutt', haut: 4, haar: 4 },
  olbers: { frisur: 'bob', haut: 5, haar: 5, brille: true },
  deppe: { frisur: 'seite', haut: 6, haar: 6 },
  // weitere Figuren der Fall-Bibel (P1.2, L-17)
  stein: { frisur: 'kurz', haut: 4, haar: 6, brille: true },
  petersen: { frisur: 'lang', haut: 1, haar: 4 },
  roth: { frisur: 'dutt', haut: 6, haar: 3 },
  kowalski: { frisur: 'seite', haut: 2, haar: 5, brille: true },
};

const NEUTRAL: Aussehen = { frisur: 'kurz', haut: 1, haar: 6 };

const H = 'class="figur-haar"';

/** Frisur: [hinter dem Kopf, vor dem Kopf, Zusatz im Gesicht] */
const FRISUREN: Readonly<Record<Frisur, readonly [string, string, string]>> = {
  kurz: ['', `<path ${H} d="M21 26.5C20.3 17 26 13 32.2 13 38.8 13 44 17.2 43 26.5 41.2 21.4 37.4 19.4 32 19.6 26.8 19.8 23.2 22 21 26.5Z"/>`, ''],
  bart: ['', `<path ${H} d="M21.2 25.5C21 16.5 26.5 13.2 32 13.2S43.2 16.5 42.8 25.5C41 21.5 37 20 32 20S23 21.5 21.2 25.5Z"/><path ${H} d="M21.6 28.5C22 36.5 26.5 40.6 32 40.6S42 36.5 42.4 28.5C41 32.5 38.4 34 36 34.2 34.6 33 29.4 33 28 34.2 25.6 34 23 32.5 21.6 28.5Z"/>`, ''],
  lang: [`<path ${H} d="M18.5 30C17.5 16 24.5 11.5 32 11.5S46.5 16 45.5 30L47 50H17Z"/>`, `<path ${H} d="M21.3 25.5C21.8 17.5 26.5 14.5 32 14.5S42.3 17.5 42.7 25.5C39.5 21.8 35.5 20.5 30.5 21 26.8 21.4 23.6 23 21.3 25.5Z"/>`, ''],
  dutt: ['', `<circle ${H} cx="32" cy="11.5" r="5.6"/><path ${H} d="M21.2 26C21 17.5 26 14 32 14S43 17.5 42.8 26C40.8 21 36 19 31 19.6 26.5 20.2 23 22.5 21.2 26Z"/>`, ''],
  bob: [`<path ${H} d="M19.5 33C18.5 17 25 12.5 32 12.5S45.5 17 44.5 33C44.5 36 42 37 40 37H24C22 37 19.5 36 19.5 33Z"/>`, `<path ${H} d="M21.3 24C23 17.5 27 15 32 15S41.5 17.5 42.7 24C38 22.5 33.5 20.5 30 18.8 27.5 21.3 24.5 23 21.3 24Z"/>`, ''],
  seite: ['', `<path ${H} d="M21.2 29C20.4 22.5 21.6 18.6 24 17l.6 8.5Z M42.8 29C43.6 22.5 42.4 18.6 40 17l-.6 8.5Z"/>`, `<path class="figur-schnurrbart" d="M28.6 31.6C30.2 30.8 33.8 30.8 35.4 31.6"/>`],
};

const BRILLE = '<g class="figur-brille"><circle cx="28" cy="28" r="3.3"/><circle cx="36" cy="28" r="3.3"/><path d="M31.3 28h1.4"/></g>';

let zaehler = 0;

/** Mimik (P3.1, docs/STIL.md): Mund und Brauen im selben Klassenvertrag. */
export type Mimik = 'neutral' | 'besorgt' | 'erleichtert';

export const MIMIKEN: readonly Mimik[] = ['neutral', 'besorgt', 'erleichtert'];

/** Mund-Pfad und Brauen je Mimik (Brauen nur, wo sie etwas sagen). */
const GESICHT: Readonly<Record<Mimik, { mund: string; brauen: string }>> = {
  neutral: { mund: 'M28.6 33.2Q32 35.8 35.4 33.2', brauen: '' },
  besorgt: { mund: 'M28.8 34.8Q32 32.6 35.2 34.8', brauen: '<path class="figur-braue" d="M25.6 24.6 29.6 23.4"/><path class="figur-braue" d="M38.4 24.6 34.4 23.4"/>' },
  erleichtert: { mund: 'M28 32.6Q32 37.2 36 32.6', brauen: '<path class="figur-braue" d="M25.8 23.2Q27.8 22 29.8 23.2"/><path class="figur-braue" d="M34.2 23.2Q36.2 22 38.2 23.2"/>' },
};

export interface FigurOptionen {
  /** Rollen-Attribut des Stils (gf, bh, pl, ps, plan, ctl) oder null (neutral) */
  rolle: string | null;
  groesse: number;
  /** Vorgabe: neutral */
  mimik?: Mimik;
}

/** Figur als SVG-Zeichenkette (für Vorlagen, die als HTML entstehen). */
export function figurSvg(id: string, o: FigurOptionen): string {
  const a = AUSSEHEN[id] ?? NEUTRAL;
  const g = GESICHT[o.mimik ?? 'neutral'];
  const [hinten, vorn, zusatz] = FRISUREN[a.frisur];
  zaehler += 1;
  const clip = `figur-clip-${zaehler}`;
  const attr = [
    'class="figur"',
    o.rolle !== null ? `data-rolle="${o.rolle}"` : '',
    `data-figur="${id.replace(/[^a-z0-9-]/gi, '')}"`,
    `data-haut="${a.haut}"`,
    `data-haar="${a.haar}"`,
    `data-mimik="${o.mimik ?? 'neutral'}"`,
    a.mundHell ? 'data-mund="hell"' : '',
    `width="${o.groesse}"`,
    `height="${o.groesse}"`,
    'viewBox="0 0 64 64"',
    'aria-hidden="true"',
    'focusable="false"',
  ].filter(Boolean).join(' ');
  return `<svg ${attr}><defs><clipPath id="${clip}"><circle cx="32" cy="32" r="32"/></clipPath></defs>`
    + '<circle class="figur-grund" cx="32" cy="32" r="32"/>'
    + `<g clip-path="url(#${clip})">${hinten}`
    + '<path class="figur-kleid" d="M7 66C7 51 17 43.5 32 43.5S57 51 57 66Z"/>'
    + '<path class="figur-kragen" d="M26.5 43.8 32 50.5 37.5 43.8Z"/>'
    + '<rect class="figur-hals" x="28" y="35" width="8" height="10" rx="3"/>'
    + `<ellipse class="figur-haut" cx="32" cy="27" rx="10.6" ry="12"/>${vorn}`
    + '<circle class="figur-auge" cx="28" cy="28" r="1.35"/><circle class="figur-auge" cx="36" cy="28" r="1.35"/>'
    + `<path class="figur-mund" d="${g.mund}"/>${g.brauen}${zusatz}${a.brille ? BRILLE : ''}`
    + '<rect class="figur-schild" x="38.5" y="51" width="11" height="6.5" rx="1.3"/>'
    + '<rect class="figur-schild-linie" x="40.3" y="53.4" width="7.4" height="1.7" rx=".85"/>'
    + '</g></svg>';
}

/** Figur als Element. */
export function figur(id: string, o: FigurOptionen): SVGSVGElement {
  return elementAus(figurSvg(id, o)) as SVGSVGElement;
}
