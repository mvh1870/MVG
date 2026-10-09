/*
 * Register-Zusammenspiel: die Grundgrafik als SVG (Werkzeug E, Owner im Chat 2026-10-09). Aufbau und Anordnung der Vorlage
 * (Hinweiskasten oben, drei Reihen von Stationen, Legende unten), im Stil der Werkzeuge. Stationen und Pfeile kommen aus
 * dem Kern (src/werkzeuge/register.ts), die Texte aus den Inhalten; hier stehen nur Lage, Umbruch und Zeichen. Die Grafik
 * wird einmal gebaut und über `zeige` umgefärbt, damit der wandernde Impuls nicht abreißt.
 */
import type { RegisterTeil } from '../../../inhalte/typen.ts';
import { KANTEN, KNOTEN, SCHWELLE, type Ebene, type KnotenId, type Ort, type Rolle } from '../../../werkzeuge/register.ts';
import { h, s } from '../../h.ts';
import { W } from '../../woerter.ts';

const R = W.werkzeuge.register;

interface Rahmen { x: number; y: number; b: number; h: number }
type Punkt = readonly [number, number];

export const ANSICHT = { b: 1300, h: 756 } as const;

export const KACHEL: Record<KnotenId, Rahmen> = {
  fruehwarnung: { x: 24, y: 84, b: 236, h: 148 },
  problem: { x: 360, y: 84, b: 226, h: 148 },
  aenderung: { x: 660, y: 84, b: 236, h: 148 },
  prognose: { x: 1040, y: 84, b: 236, h: 148 },
  risiko: { x: 24, y: 312, b: 220, h: 148 },
  register: { x: 354, y: 312, b: 250, h: 148 },
  vorlage: { x: 710, y: 312, b: 240, h: 148 },
  freigabe: { x: 1040, y: 312, b: 236, h: 148 },
  massnahme: { x: 710, y: 540, b: 240, h: 148 },
  bericht: { x: 1040, y: 540, b: 236, h: 148 },
};
export const BANNER: Rahmen = { x: 410, y: 14, b: 470, h: 48 };

/** Zeichen der Stationen (24 × 24, Linie). */
const ICONS: Record<Ort, string> = {
  schwelle: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M8.5 12l2.5 2.5 4.5-5',
  fruehwarnung: 'M12 3L22 20H2z M12 9v5 M12 17.2v.2',
  problem: 'M4 5h16v11h-9l-4 4v-4H4z M12 8v4 M12 14v.2',
  aenderung: 'M6 3h8l4 4v14H6z M14 3v4h4 M9 17l1-3 5-5 2 2-5 5z',
  prognose: 'M4 19h16 M6 16v-4 M11 16V9 M16 16v-2 M5 8l5-3 4 3 5-4',
  risiko: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M12 8v5 M12 15.5v.2',
  register: 'M8 4h8v3H8z M6 5H5v16h14V5h-1 M8 12l2 2 3-3 M8 17h8',
  vorlage: 'M3 6h6l2 2h10v11H3z M9 14l2.5 2.5L16 12',
  freigabe: 'M4 20V6 M20 20V6 M4 8h16 M4 13h16 M9 13v7 M15 13v7',
  massnahme: 'M8 4h8v3H8z M6 5H5v16h14V5h-1 M12 11v4l3 1.5',
  bericht: 'M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h3',
};

/** Umbruch langer Wörter (Silbentrennung per Hand, damit sie nie an einer schlechten Stelle bricht). */
const TRENNUNG: Record<string, readonly string[]> = {
  Entscheidungsregister: ['Entscheidungs-', 'register'],
  Entscheidungsvorlage: ['Entscheidungs-', 'vorlage'],
  Managementbericht: ['Management-', 'bericht'],
};

/** Greedy-Umbruch an Leerzeichen; ein Wort wird nie getrennt. */
export function umbrechen(text: string, max: number): string[] {
  const aus: string[] = [];
  let zeile = '';
  for (const wort of text.split(' ')) {
    if (zeile !== '' && [...zeile].length + 1 + [...wort].length > max) { aus.push(zeile); zeile = wort; } else zeile = zeile === '' ? wort : `${zeile} ${wort}`;
  }
  if (zeile !== '') aus.push(zeile);
  return aus;
}

export const titelZeilen = (titel: string): readonly string[] => TRENNUNG[titel] ?? umbrechen(titel, 15);
export const unterZeilen = (unter: string): readonly string[] => umbrechen(unter, 19);

interface Weg { punkte: readonly Punkt[]; label: Punkt }

/** Linienzüge der Pfeile; der letzte Punkt liegt am Rand der Zielstation, dort sitzt die Pfeilspitze. */
const WEGE: Record<string, Weg> = {
  'prognose-schwelle': { punkte: [[1158, 84], [1158, 38], [884, 38]], label: [1021, 38] },
  'schwelle-fruehwarnung': { punkte: [[410, 38], [142, 38], [142, 84]], label: [276, 38] },
  'fruehwarnung-risiko': { punkte: [[134, 232], [134, 312]], label: [134, 272] },
  'fruehwarnung-problem': { punkte: [[260, 158], [360, 158]], label: [310, 158] },
  'risiko-register': { punkte: [[244, 386], [354, 386]], label: [299, 386] },
  'problem-register': { punkte: [[473, 232], [473, 312]], label: [473, 272] },
  'aenderung-register': { punkte: [[700, 232], [700, 274], [560, 274], [560, 312]], label: [630, 274] },
  'aenderung-prognose': { punkte: [[896, 158], [1040, 158]], label: [968, 158] },
  'register-vorlage': { punkte: [[604, 386], [710, 386]], label: [657, 386] },
  'vorlage-freigabe': { punkte: [[950, 386], [1040, 386]], label: [995, 386] },
  'freigabe-massnahme': { punkte: [[1100, 460], [1100, 500], [830, 500], [830, 540]], label: [965, 500] },
  'freigabe-bericht': { punkte: [[1220, 460], [1220, 540]], label: [1220, 500] },
  'massnahme-risiko': { punkte: [[710, 614], [134, 614], [134, 460]], label: [422, 614] },
};

const pfad = (p: readonly Punkt[]): string => p.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');

/** Pfeilspitze als Dreieck am letzten Punkt, Richtung aus dem letzten Teilstück. */
function spitze(p: readonly Punkt[]): string {
  const [x, y] = p[p.length - 1] as Punkt;
  const [vx, vy] = p[p.length - 2] as Punkt;
  const dx = Math.sign(x - vx);
  const dy = Math.sign(y - vy);
  const [bx, by] = [x - dx * 12, y - dy * 12];
  const [qx, qy] = [-dy * 6.5, dx * 6.5];
  return `M${x} ${y} L${bx + qx} ${by + qy} L${bx - qx} ${by - qy} Z`;
}

export interface Zustand {
  ebene: Ebene;
  aktiv: Ort | null;
  besucht: ReadonlySet<Ort>;
  kanteAktiv: string | null;
  kantenDurch: ReadonlySet<string>;
  ausgefallen: ReadonlySet<Ort>;
  gewaehlt: Ort | null;
  gewaehlteKante: string | null;
  /** wandernden Impuls entlang des aktiven Pfeils zeigen (nie bei reduzierter Bewegung) */
  impuls: boolean;
}

export interface Grafik {
  wurzel: HTMLElement;
  zeige(z: Zustand): void;
}

export const OHNE_ZUSTAND: Zustand = { ebene: 'wer', aktiv: null, besucht: new Set(), kanteAktiv: null, kantenDurch: new Set(), ausgefallen: new Set(), gewaehlt: null, gewaehlteKante: null, impuls: false };

function reduzierteBewegung(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const T = (x: number, y: number, klasse: string, text: string, anker?: string): SVGTextElement =>
  s('text', { x, y, class: klasse, 'text-anchor': anker ?? null }, text);

/** Zeilen als Text mit Zeilenabstand `dy`; erste Zeile bei `y`. */
function zeilen(x: number, y: number, klasse: string, texte: readonly string[], dy: number): SVGTextElement {
  const t = s('text', { x, y, class: klasse });
  texte.forEach((z, i) => t.append(s('tspan', { x, dy: i === 0 ? 0 : dy }, z)));
  return t;
}

export function baueGrafik(w: RegisterTeil, o: { bedienbar: boolean; beiWahl: (ort: Ort) => void; beiWahlKante: (kante: string) => void }): Grafik {
  const rolleVon = (ort: Ort): Rolle => (ort === SCHWELLE ? w.schwelle.wer.fuehrt : w.knoten[ort].wer.fuehrt);
  const rollenTitel = (r: Rolle): string => w.rollen.find((x) => x.id === r)?.titel ?? r;
  const ortTitel = (ort: Ort): string => (ort === SCHWELLE ? w.schwelle.titel : w.knoten[ort].titel);

  const svg = s('svg', {
    class: 'rz-svg', viewBox: `0 0 ${ANSICHT.b} ${ANSICHT.h}`, width: ANSICHT.b, height: ANSICHT.h, role: 'group', 'aria-label': w.titel,
    'data-pruef': 'register-grafik', xmlns: 'http://www.w3.org/2000/svg', focusable: 'false',
  });
  const kanten = s('g', { class: 'rz-kanten' });
  const kacheln = s('g', { class: 'rz-kacheln' });
  const impuls = s('circle', { class: 'rz-impuls', r: 8, cx: 0, cy: 0, 'aria-hidden': 'true' });
  const bewegung = s('animateMotion', { dur: '1.3s', fill: 'freeze', begin: 'indefinite', calcMode: 'spline', keyTimes: '0;1', keySplines: '.4 0 .2 1' });
  impuls.append(bewegung);

  // Rollenfigur: ein Rundstempel mit dem Anfangsbuchstaben der führenden Rolle erscheint an der Station, die gerade bearbeitet wird
  const akteur = s('g', { class: 'rz-akteur', 'aria-hidden': 'true' });
  let akteurOrt: Ort | null = null;
  const setzeAkteur = (ort: Ort | null): void => {
    if (ort === akteurOrt) return;
    akteurOrt = ort;
    akteur.replaceChildren();
    if (ort === null) return;
    const r = ort === SCHWELLE ? BANNER : KACHEL[ort];
    const rolle = rolleVon(ort);
    const wrap = s('g', { class: 'rz-akteur-figur', 'data-rolle': rolle, transform: `translate(${r.x + r.b - 24} ${r.y + (ort === SCHWELLE ? 0 : -2)})` });
    wrap.append(s('circle', { class: 'rz-akteur-kreis', r: 16 }), T(0, 6.5, 'rz-akteur-buchstabe', rollenTitel(rolle).slice(0, 1), 'middle'));
    akteur.append(wrap);
  };

  const streifen = new Map<Ort, { text: SVGTextElement; flaeche: SVGRectElement }>();
  const kachelEl = new Map<Ort, SVGGElement>();
  const kanteEl = new Map<string, SVGGElement>();

  const interaktiv = (el: SVGGElement, label: string, beiKlick: () => void): void => {
    if (!o.bedienbar) return;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', label);
    el.addEventListener('click', beiKlick);
    el.addEventListener('keydown', (e) => {
      const k = (e as KeyboardEvent).key;
      if (k === 'Enter' || k === ' ') { e.preventDefault(); beiKlick(); }
    });
  };

  // ----------------------------------------------------------------- Hinweiskasten
  {
    const b = BANNER;
    const g = s('g', { class: 'rz-kachel rz-banner', 'data-ort': SCHWELLE, 'data-rolle': rolleVon(SCHWELLE) });
    g.append(
      s('rect', { class: 'rz-box', x: b.x, y: b.y, width: b.b, height: b.h, rx: 14 }),
      s('circle', { class: 'rz-scheibe', cx: b.x + 34, cy: b.y + b.h / 2, r: 18 }),
      s('path', { class: 'rz-icon', d: ICONS.schwelle, transform: `translate(${b.x + 34 - 11} ${b.y + b.h / 2 - 11}) scale(.92)` }),
      T(b.x + 62, b.y + 31, 'rz-banner-text', w.schwelle.titel),
    );
    interaktiv(g, `${w.schwelle.titel}`, () => o.beiWahl(SCHWELLE));
    kachelEl.set(SCHWELLE, g);
    kacheln.append(g);
  }

  // ----------------------------------------------------------------- Stationen
  for (const id of KNOTEN) {
    const k = w.knoten[id];
    const r = KACHEL[id];
    const g = s('g', { class: 'rz-kachel', 'data-ort': id, 'data-rolle': k.wer.fuehrt, 'data-pruef': `rz-kachel-${id}` });
    const cx = r.x + 40;
    const cy = r.y + 44;
    const tz = titelZeilen(k.titel);
    const uz = unterZeilen(k.unter);
    const ty = r.y + 32;
    const uy = ty + 24 * (tz.length - 1) + 26;
    const flaeche = s('rect', { class: 'rz-streifen-flaeche', x: r.x + 10, y: r.y + r.h - 38, width: r.b - 20, height: 30, rx: 9 });
    const text = T(r.x + 22, r.y + r.h - 18, 'rz-streifen-text', '');
    g.append(
      s('rect', { class: 'rz-box', x: r.x, y: r.y, width: r.b, height: r.h, rx: 16 }),
      s('circle', { class: 'rz-scheibe', cx, cy, r: 27 }),
      s('path', { class: 'rz-icon', d: ICONS[id], transform: `translate(${cx - 16} ${cy - 16}) scale(1.34)` }),
      zeilen(r.x + 80, ty, 'rz-titel', tz, 24),
      zeilen(r.x + 80, uy, 'rz-unter', uz, 18),
      flaeche,
      text,
      s('text', { class: 'rz-marke', x: r.x + r.b - 14, y: r.y + 24, 'text-anchor': 'end', 'aria-hidden': 'true' }, ''),
    );
    streifen.set(id, { text, flaeche });
    interaktiv(g, `${k.titel}, ${k.unter}. ${R.fuehrt(rollenTitel(k.wer.fuehrt))}`, () => o.beiWahl(id));
    kachelEl.set(id, g);
    kacheln.append(g);
  }

  // ----------------------------------------------------------------- Pfeile
  for (const k of KANTEN) {
    const weg = WEGE[k.id];
    if (weg === undefined) throw new Error(`Kein Linienzug für den Pfeil ${k.id}`);
    const text = w.kanten[k.id]?.text ?? k.id;
    const breite = [...text].length * 8.4 + 24;
    const g = s('g', { class: 'rz-pfeil', 'data-kante': k.id, 'data-art': k.art, 'data-pruef': `rz-pfeil-${k.id}` });
    g.append(
      s('path', { class: 'rz-treffer', d: pfad(weg.punkte) }),
      s('path', { class: 'rz-linie', d: pfad(weg.punkte) }),
      s('path', { class: 'rz-spitze', d: spitze(weg.punkte) }),
      s('rect', { class: 'rz-pille', x: weg.label[0] - breite / 2, y: weg.label[1] - 14, width: breite, height: 28, rx: 14 }),
      T(weg.label[0], weg.label[1] + 5.5, 'rz-pille-text', text, 'middle'),
    );
    interaktiv(g, `${ortTitel(k.von)} nach ${ortTitel(k.nach)}: ${text}`, () => o.beiWahlKante(k.id));
    kanteEl.set(k.id, g);
    kanten.append(g);
  }

  // ----------------------------------------------------------------- Legende
  const legende = s('g', { class: 'rz-legende', 'aria-hidden': 'true' });
  {
    const y = 716;
    legende.append(s('rect', { class: 'rz-legende-rahmen', x: 140, y: y - 26, width: 1020, height: 48, rx: 14 }));
    const eintraege: readonly (readonly [number, string, string])[] = [
      [170, 'wird-zu', R.legende.wirdZu], [520, 'ueberwachung', R.legende.ueberwachung], [850, 'bericht', R.legende.bericht],
    ];
    for (const [x, art, titel] of eintraege) {
      legende.append(
        s('path', { class: `rz-linie rz-legende-linie`, 'data-art': art, d: `M${x} ${y} H${x + 64}` }),
        s('path', { class: 'rz-spitze rz-legende-spitze', 'data-art': art, d: spitze([[x + 40, y], [x + 64, y]]) }),
        T(x + 80, y + 5.5, 'rz-legende-text', titel),
      );
    }
  }

  svg.append(kanten, kacheln, akteur, legende, impuls);

  // schmal rollt die Grafik waagerecht: dann braucht der Rahmen Tastaturzugang (nur in der bedienbaren Ansicht)
  const rahmen = h('div', { class: 'rz-grafik-rahmen', tabindex: o.bedienbar ? 0 : null, role: o.bedienbar ? 'region' : null, 'aria-label': o.bedienbar ? R.grafikName : null }, svg);

  function zeige(z: Zustand): void {
    rahmen.dataset['ebene'] = z.ebene;
    for (const id of [SCHWELLE, ...KNOTEN] as Ort[]) {
      const g = kachelEl.get(id);
      if (g === undefined) continue;
      g.classList.toggle('ist-aktiv', z.aktiv === id);
      g.classList.toggle('ist-besucht', z.besucht.has(id) && z.aktiv !== id);
      g.classList.toggle('ist-ausgefallen', z.ausgefallen.has(id));
      g.classList.toggle('ist-gewaehlt', z.gewaehlt === id);
      if (o.bedienbar) g.setAttribute('aria-pressed', z.gewaehlt === id || z.ausgefallen.has(id) ? 'true' : 'false');
      if (id === SCHWELLE) continue;
      const st = streifen.get(id);
      if (st === undefined) continue;
      const k = w.knoten[id];
      const aus = z.ausgefallen.has(id);
      const text = aus ? R.faelltAus
        : z.ebene === 'wer' ? rollenTitel(k.wer.fuehrt)
        : z.ebene === 'stoerung' ? R.inBetrieb
        : k[z.ebene].kurz;
      st.text.textContent = text;
      const marke = g.querySelector('.rz-marke');
      if (marke !== null) marke.textContent = aus ? '×' : z.besucht.has(id) ? '✓' : '';
    }
    for (const k of KANTEN) {
      const g = kanteEl.get(k.id);
      if (g === undefined) continue;
      g.classList.toggle('ist-aktiv', z.kanteAktiv === k.id);
      g.classList.toggle('ist-durchlaufen', z.kantenDurch.has(k.id));
      g.classList.toggle('ist-gewaehlt', z.gewaehlteKante === k.id);
      g.classList.toggle('ist-gesperrt', z.ausgefallen.has(k.von) || z.ausgefallen.has(k.nach));
    }
    setzeAkteur(z.aktiv);
    const weg = z.kanteAktiv === null ? undefined : WEGE[z.kanteAktiv];
    const laeuft = z.impuls && weg !== undefined && !reduzierteBewegung();
    impuls.classList.toggle('ist-sichtbar', laeuft);
    if (laeuft && weg !== undefined) {
      bewegung.setAttribute('path', pfad(weg.punkte));
      (bewegung as unknown as { beginElement?: () => void }).beginElement?.();
    }
  }

  zeige(OHNE_ZUSTAND);
  return { wurzel: rahmen, zeige };
}
