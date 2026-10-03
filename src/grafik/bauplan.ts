/*
 * Hintergründe im Stil „Bauplan“ (O-45): feine Linienzeichnung auf Rasterpapier, gezeichnet, keine realen
 * Szenen. Der Schulcampus Lindenhall-Süd (fiktiv): Gesamtschule (langer Riegel), Grundschule (Winkel),
 * Dreifeldsporthalle. Rein (Zeichenketten), damit Seite, Leinwand und Tests dieselbe Zeichnung nutzen.
 *
 *   campus(stufe)  – Axonometrie; Stufe 0 (Lageplan) bis 6 (fertig) – die Story wächst mit der LPH
 *   grundriss()    – heller Grundriss mit Achsraster (Theorie, sehr dezent)
 *
 * Brücke bis P17.4: Der farbige isometrische Campus (O-53) steht in campus-iso.ts und wird hier weitergereicht,
 * damit er von src/main.ts aus erreichbar ist (tests/aufgeraeumt.test.ts), bis die neue Story-Fläche ihn
 * direkt einbindet. esbuild lässt ihn bis dahin aus dem Bündel (nicht benutzt).
 */
export { campusIso } from './campus-iso.ts';

/** Isometrische Projektion: Grundriss (x, y) und Höhe z → Zeichenebene. */
function p(x: number, y: number, z = 0): [number, number] {
  const c = 0.866;
  return [Math.round((x - y) * c * 10) / 10, Math.round(((x + y) * 0.5 - z) * 10) / 10];
}

const pkt = (xy: [number, number]): string => `${xy[0]},${xy[1]}`;

function linie(punkte: [number, number][], klasse: string, zu = false): string {
  return `<path class="${klasse}" d="M${punkte.map(pkt).join(' L')}${zu ? ' Z' : ''}"/>`;
}

interface Bau { x: number; y: number; b: number; t: number; h: number; geschosse: number }

/** Gesamtschule, Grundschule (zwei Flügel), Sporthalle – Maße in Planeinheiten. */
const BAUTEN: Bau[] = [
  { x: 0, y: 0, b: 260, t: 70, h: 54, geschosse: 3 },
  { x: 0, y: 130, b: 140, t: 60, h: 36, geschosse: 2 },
  { x: 80, y: 190, b: 60, t: 110, h: 36, geschosse: 2 },
  { x: 200, y: 130, b: 120, t: 90, h: 44, geschosse: 1 },
];

function umriss(b: Bau, z: number, klasse: string): string {
  return linie([p(b.x, b.y, z), p(b.x + b.b, b.y, z), p(b.x + b.b, b.y + b.t, z), p(b.x, b.y + b.t, z)], klasse, true);
}

/** Achsraster eines Baus (Planungsstand). */
function achsen(b: Bau, klasse: string): string {
  const aus: string[] = [];
  for (let x = b.x; x <= b.x + b.b; x += 20) aus.push(linie([p(x, b.y - 8), p(x, b.y + b.t + 8)], klasse));
  for (let y = b.y; y <= b.y + b.t; y += 20) aus.push(linie([p(b.x - 8, y), p(b.x + b.b + 8, y)], klasse));
  return aus.join('');
}

/** Stützen an den Ecken und im Achsabstand an der Vorderkante, bis Höhe `z`. */
function stuetzen(b: Bau, z: number, klasse: string): string {
  const aus: string[] = [];
  for (let x = b.x; x <= b.x + b.b; x += 40) {
    aus.push(linie([p(x, b.y + b.t, 0), p(x, b.y + b.t, z)], klasse));
    aus.push(linie([p(x, b.y, 0), p(x, b.y, z)], klasse));
  }
  aus.push(linie([p(b.x + b.b, b.y, 0), p(b.x + b.b, b.y, z)], klasse));
  aus.push(linie([p(b.x + b.b, b.y + b.t, 0), p(b.x + b.b, b.y + b.t, z)], klasse));
  aus.push(linie([p(b.x, b.y + b.t, 0), p(b.x, b.y + b.t, z)], klasse));
  return aus.join('');
}

/** Ein fertiger Baukörper: sichtbare Flächen als Umriss, Geschossbänder und Fensterreihen. */
function koerper(b: Bau, klasse: string): string {
  const { x, y } = b;
  const x2 = x + b.b;
  const y2 = y + b.t;
  const aus = [
    linie([p(x, y2, 0), p(x2, y2, 0), p(x2, y, 0), p(x2, y, b.h), p(x, y, b.h), p(x, y2, b.h)], klasse, true),
    linie([p(x, y2, b.h), p(x2, y2, b.h), p(x2, y, b.h)], klasse),
    linie([p(x2, y2, 0), p(x2, y2, b.h)], klasse),
    linie([p(x, y2, 0), p(x, y2, b.h)], klasse),
  ];
  for (let g = 1; g < b.geschosse; g++) {
    const z = (b.h / b.geschosse) * g;
    aus.push(linie([p(x, y2, z), p(x2, y2, z), p(x2, y, z)], `${klasse} fein`));
  }
  // Fensterreihen an der Vorderseite
  for (let g = 0; g < b.geschosse; g++) {
    const z = (b.h / b.geschosse) * g + b.h / b.geschosse * 0.35;
    for (let fx = x + 10; fx < x2 - 10; fx += 20) aus.push(linie([p(fx, y2, z), p(fx + 10, y2, z)], `${klasse} fenster`));
  }
  return aus.join('');
}

function kran(klasse: string): string {
  const fuss = p(150, 105, 0);
  const kopf = p(150, 105, 120);
  const ausleger = p(250, 105, 120);
  const gegen = p(110, 105, 120);
  return linie([fuss, kopf], klasse) + linie([gegen, ausleger], klasse) + linie([kopf, p(150, 105, 132), ausleger], `${klasse} fein`)
    + linie([p(230, 105, 120), p(230, 105, 80)], `${klasse} fein`);
}

function baum(x: number, y: number, klasse: string): string {
  const [a, b] = p(x, y, 0);
  const [, k] = p(x, y, 18);
  return `<path class="${klasse}" d="M${a},${b} L${a},${k}"/><circle class="${klasse}" cx="${a}" cy="${k - 6}" r="8"/>`;
}

/** Maßlinie in Gold (nur Startseite und fertige Stufe). */
function masslinie(): string {
  const a = p(0, -24);
  const b = p(260, -24);
  return `<g class="bp-mass">${linie([a, b], 'bp-mass-linie')}${linie([p(0, -30), p(0, -18)], 'bp-mass-linie')}${linie([p(260, -30), p(260, -18)], 'bp-mass-linie')}</g>`;
}

/** Höchste Stufe der Campus-Zeichnung. */
export const STUFE_MAX = 6;

/**
 * Stufe der Zeichnung aus der Leistungsphase (O-45): Planung zeichnet sich dichter (LPH 4–5), ab der
 * Vergabe wächst der Bau (LPH 7–8), am Ende steht er fertig (9).
 */
export function stufeAusLph(lph: number | null): number {
  if (lph === null) return 0;
  if (lph <= 3) return 0;
  if (lph === 4) return 1;
  if (lph <= 6) return 2;
  if (lph === 7) return 3;
  if (lph === 8) return 5;
  return STUFE_MAX;
}

/**
 * Campus als Axonometrie. 0 Lageplan (Baufeld) · 1 Umrisse und Achsen · 2 Ausführungsplanung (dichtere
 * Achsen, Geschosslinien gestrichelt) · 3 Bodenplatten · 4 Stützen und Kran · 5 Baukörper mit Kran · 6 fertig.
 */
export function campus(stufe: number, klasse = 'bauplan'): string {
  const s = Math.max(0, Math.min(STUFE_MAX, Math.round(stufe)));
  const teile: string[] = [];
  // Baufeld
  teile.push(linie([p(-40, -40), p(360, -40), p(360, 340), p(-40, 340)], 'bp-feld', true));
  if (s >= 1) for (const b of BAUTEN) teile.push(umriss(b, 0, s >= 3 ? 'bp-platte' : 'bp-plan'));
  if (s >= 1 && s <= 4) for (const b of BAUTEN) teile.push(achsen(b, 'bp-achse'));
  if (s === 2) for (const b of BAUTEN) for (let g = 1; g <= b.geschosse; g++) teile.push(umriss(b, (b.h / b.geschosse) * g, 'bp-plan gestrichelt'));
  if (s === 4) for (const b of BAUTEN) teile.push(stuetzen(b, b.h, 'bp-bau'));
  if (s === 4) for (const b of BAUTEN) teile.push(umriss(b, b.h / b.geschosse, 'bp-bau'));
  if (s >= 5) for (const b of BAUTEN) teile.push(koerper(b, 'bp-bau'));
  if (s === 4 || s === 5) teile.push(kran('bp-kran'));
  if (s === STUFE_MAX) {
    for (const [x, y] of [[-20, 120], [-20, 160], [340, 40], [340, 80], [150, 320], [190, 320], [-20, 260]] as const) teile.push(baum(x, y, 'bp-baum'));
  }
  if (s === 0 || s === STUFE_MAX) teile.push(masslinie());
  const [x0] = p(-40, 340);
  const [x1] = p(360, -40);
  const [, y0] = p(-40, -40, 140);
  const [, y1] = p(360, 340);
  return `<svg class="${klasse}" data-stufe="${s}" viewBox="${x0 - 10} ${y0 - 10} ${x1 - x0 + 20} ${y1 - y0 + 20}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">${teile.join('')}</svg>`;
}

/** Grundriss mit Achsraster (Theorie, sehr dezent). */
export function grundriss(klasse = 'bauplan bauplan-grundriss'): string {
  const teile: string[] = [];
  for (let x = 0; x <= 600; x += 40) teile.push(`<path class="bp-achse" d="M${x},-20 V420"/>`);
  for (let y = 0; y <= 400; y += 40) teile.push(`<path class="bp-achse" d="M-20,${y} H620"/>`);
  // Riegel mit Flur und Klassenräumen
  teile.push('<path class="bp-plan" d="M40,40 H560 V160 H40 Z"/>');
  teile.push('<path class="bp-plan fein" d="M40,92 H560 M40,108 H560"/>');
  for (let x = 120; x < 560; x += 80) teile.push(`<path class="bp-plan fein" d="M${x},40 V92 M${x},108 V160"/>`);
  // Türbögen
  for (let x = 60; x < 560; x += 80) teile.push(`<path class="bp-plan fein" d="M${x},92 a14,14 0 0 1 14,-14"/>`);
  // Halle
  teile.push('<path class="bp-plan" d="M320,220 H560 V380 H320 Z"/><path class="bp-plan fein" d="M400,220 V380 M480,220 V380"/>');
  // Grundschule im Winkel
  teile.push('<path class="bp-plan" d="M40,220 H240 V300 H140 V380 H40 Z"/>');
  return `<svg class="${klasse}" viewBox="-20 -20 640 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${teile.join('')}</svg>`;
}
