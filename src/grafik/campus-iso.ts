/*
 * Isometrischer Campus (O-53): der Schulcampus Lindenhall-Süd (fiktiv) als flache Illustration, die vom leeren
 * Grundstück bis zum fertigen Campus mit Kindern wächst. Rein (Zeichenketten), deterministisch (kein Zufall,
 * keine Uhr), ohne externe Ressourcen. Farben nur über Klassen; die Werte stehen in tokens.css (`--iso-*`,
 * `--akzent-*`), Jahreszeit und Licht schaltet src/stil/grafik.css über `data-jahreszeit` und `data-licht`.
 *
 *   campusIso(stufe, optionen) – Stufe 0 (Grundstück mit Bauzaun) bis 8 (fertig, mit Kindern und Schulbus); dazwischen die
 *   Zwischenstufen 1,5 · 2,5 · 3,5 · 4,5 · 5,5 (P19.3, Drehbuch-Gerüst Abschnitt 9)
 *
 * Geometrie: Grundriss (x nach rechts vorn, y nach links vorn) und Höhe z in Planeinheiten (ein Geschoss = 16),
 * isometrisch projiziert wie in bauplan.ts. Gezeichnet wird nach dem Malerprinzip: erst der Boden, dann die
 * Schatten, dann alle stehenden Dinge von hinten nach vorn, zuletzt Kranköpfe und Tönung.
 */
import { AKZENTE, type Akzent } from '../stil/akzente.ts';

export type Jahreszeit = 'fruehling' | 'sommer' | 'herbst' | 'winter';
export type Licht = 'morgen' | 'tag' | 'abend';
/**
 * Besonderes Wetter: „sturm“ (R72) – grauer Himmel ohne Sonne, Böen, abgerissene Planen, ein umgekipptes Zaunfeld; „regen“,
 * „schnee“, „nebel“ (P19.3) – Regenstriche, dichter Schneefall, Nebelbänder über dem Gelände.
 */
export type Wetter = 'sturm' | 'regen' | 'schnee' | 'nebel';

export interface CampusIsoOptionen {
  jahreszeit?: Jahreszeit;
  licht?: Licht;
  /** Himmel als Hintergrund (Vorgabe ja); ohne Himmel ist der Grund durchsichtig. */
  himmel?: boolean;
  /** Besonderes Wetter; ohne Angabe gilt das Wetter der Jahreszeit. */
  wetter?: Wetter;
  /** Zusätzliche Klasse am `<svg>`. */
  klasse?: string;
  /**
   * Bildausschnitt: Vorgabe ist der ganze Grund; „breit“ ist der Ausschnitt für den Story-Rahmen 2,2 : 1 (R75) – er
   * reicht oben über Kran und Dächer aller Stufen und unten bis zu den Containern, seitlich steht mehr Himmel.
   */
  ausschnitt?: 'breit';
  /**
   * Sporthalle noch nicht fertig (ab Stufe 5): Holztragwerk mit Gerüst statt der fertigen Halle – für den Ende-Campus
   * auf Wegen, auf denen die Halle erst nach den Herbstferien öffnet.
   */
  halleOffen?: boolean;
}

/** Ausschnitte (viewBox): ganzer Grund und breit (Seitenverhältnis 2,2 : 1, R75). */
export const CAMPUS_VB: Readonly<Record<'grund' | 'breit', readonly [number, number, number, number]>> = {
  grund: [-296, -52, 688, 466],
  breit: [-360, -36, 816, 371],
};

/** Höchste Stufe: der fertige Campus mit Kindern. */
export const CAMPUS_STUFE_MAX = 8;

/** Zwischenstufen (P19.3): 1,5 Bodenplatte in Schalung · 2,5 Erdgeschoss steht · 3,5 Holzbau unter Dach · 4,5 Grundschule beginnt · 5,5 alles außen fertig. */
export const CAMPUS_ZWISCHENSTUFEN: readonly number[] = [1.5, 2.5, 3.5, 4.5, 5.5];

/** Stufe, wie gezeichnet wird: auf 0–8 begrenzt; eine Zwischenstufe bleibt, alles andere wird auf eine ganze Stufe gerundet. */
export function campusStufe(stufe: number): number {
  const z = Math.max(0, Math.min(CAMPUS_STUFE_MAX, stufe));
  return CAMPUS_ZWISCHENSTUFEN.includes(z) ? z : Math.round(z);
}

const STUFEN_TEXT: readonly string[] = [
  'Das leere Grundstück, eingefasst von einem Bauzaun; am Zaun die Tafel „Hier baut die Stadt Lindenhall“, am Rand ein kleiner Baucontainer.',
  'Die Baugrube für die Gesamtschule ist ausgehoben; ein Bagger arbeitet, daneben stehen die Baucontainer.',
  'Die Bodenplatte der Gesamtschule ist gegossen, die ersten Wände des Erdgeschosses stehen; ein Turmdrehkran dreht sich, am Bauzaun hängt eine bunte Wimpelkette.',
  'Holzbau: Der Kran hebt Holzelemente an die Gesamtschule, die unteren Geschosse sind schon verkleidet.',
  'Die Gesamtschule steht fertig; daneben richten Zimmerleute die tragende Holzkonstruktion der Sporthalle (mit drei Spielfeldern) auf, rundum steht ein Gerüst.',
  'Die Sporthalle ist geschlossen; jetzt wächst die Grundschule im Winkel, eingerüstet und mit dem Kran.',
  'Alle drei Gebäude stehen; Wege, Schulhof, Rasen und junge Bäume werden angelegt.',
  'Der Campus ist fertig: Schulhof, Sportfeld, Bäume, Fahrradständer und Bushaltestelle, noch ohne Kinder.',
  'Schulstart: Kinder kommen zu Fuß, mit dem Rad und mit dem Schulbus auf den fertigen Campus; am Haupteingang hängen Luftballons.',
];
/** Beschreibung der Zwischenstufen (P19.3), Schlüssel = Stufe */
const ZWISCHEN_TEXT: Readonly<Record<number, string>> = {
  1.5: 'Die Bodenplatte der Gesamtschule ist vorbereitet: Holzform (Schalung) und Stahlgitter (Bewehrung) sind eingebaut, nasse Planen liegen darüber; Holzstapel gibt es noch keine.',
  2.5: 'Das Erdgeschoss der Gesamtschule steht; vorn stehen die Container der Schule mit erleuchteten Fenstern und Fahrrädern.',
  3.5: 'Der Holzbau der Gesamtschule ist unter Dach; auf der Sporthalle liegt erst die Bodenplatte, am Baucontainer hängt eine Lichterkette.',
  4.5: 'Die Gesamtschule ist außen fertig, das Dach der Sporthalle ist geschlossen, und für die Grundschule beginnt der Bau.',
  5.5: 'Alle drei Gebäude sind außen fertig, in den Fenstern brennt Licht; Handwerkercontainer stehen auf dem Gelände, die Flächen für die Außenanlagen sind abgesteckt.',
};
const JAHRESZEIT_TEXT: Record<Jahreszeit, string> = { fruehling: 'Frühling', sommer: 'Sommer', herbst: 'Herbst', winter: 'Winter mit Schnee' };
const LICHT_TEXT: Record<Licht, string> = { morgen: 'Morgenlicht', tag: 'Tageslicht', abend: 'Abendlicht' };
const WETTER_TEXT: Record<Wetter, string> = {
  sturm: 'Sturm unter grauem Himmel: Planen am Gerüst sind abgerissen, ein Bauzaunfeld ist umgekippt.',
  regen: 'Es regnet.',
  schnee: 'Es schneit.',
  nebel: 'Nebel liegt über dem Gelände.',
};

// ------------------------------------------------------------------------------------------- Projektion
type V3 = readonly [number, number, number];
const C = 0.866;
const r1 = (n: number): number => Math.round(n * 10) / 10;
const px = (x: number, y: number): number => r1((x - y) * C);
const py = (x: number, y: number, z: number): number => r1((x + y) * 0.5 - z);
const P = (x: number, y: number, z = 0): string => `${px(x, y)},${py(x, y, z)}`;
const zug = (pkte: readonly V3[]): string => `M${pkte.map((q) => P(q[0], q[1], q[2])).join('L')}Z`;
const pfad = (klasse: string, d: string): string => (d ? `<path class="${klasse}" d="${d}"/>` : '');
const flaeche = (klasse: string, pkte: readonly V3[]): string => pfad(klasse, zug(pkte));
const strich = (a: V3, b: V3): string => `M${P(a[0], a[1], a[2])}L${P(b[0], b[1], b[2])}`;
const g = (klasse: string, inhalt: string): string => `<g class="${klasse}">${inhalt}</g>`;

/** Quader: sichtbare Seiten links (y2), rechts (x2), oben – in der Material-Gruppe `m`. */
function quader(x1: number, y1: number, x2: number, y2: number, z1: number, z2: number, m: string): string {
  return g(m, flaeche('ci-l', [[x1, y2, z1], [x2, y2, z1], [x2, y2, z2], [x1, y2, z2]])
    + flaeche('ci-r', [[x2, y2, z1], [x2, y1, z1], [x2, y1, z2], [x2, y2, z2]])
    + flaeche('ci-o', [[x1, y1, z2], [x2, y1, z2], [x2, y2, z2], [x1, y2, z2]]));
}

/** Rechteck in der linken Wand (Ebene y), von u1 bis u2 entlang x, Höhe z1–z2. */
const wandL = (y: number, u1: number, u2: number, z1: number, z2: number): string => zug([[u1, y, z1], [u2, y, z1], [u2, y, z2], [u1, y, z2]]);
/** Rechteck in der rechten Wand (Ebene x), von v1 bis v2 entlang y. */
const wandR = (x: number, v1: number, v2: number, z1: number, z2: number): string => zug([[x, v1, z1], [x, v2, z1], [x, v2, z2], [x, v1, z2]]);

/** Feste Streuung ohne Zufall: ganzzahliger Mischwert von (i, salz) → [0, 1). */
function streu(i: number, salz: number): number {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salz + 7, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

// ------------------------------------------------------------------------------------------- Szene
interface Ding { x1: number; y1: number; x2: number; y2: number; svg: string }

/** a liegt ganz hinter b (im Grundriss weiter weg vom Betrachter). */
const hinter = (a: Ding, b: Ding): boolean => a.x2 <= b.x1 || a.y2 <= b.y1;

/** Malerreihenfolge: immer das Ding, hinter dem nichts Offenes mehr liegt; bei Zirkeln das hinterste. */
function sortiere(dinge: Ding[]): Ding[] {
  const offen = [...dinge];
  const aus: Ding[] = [];
  while (offen.length > 0) {
    let i = offen.findIndex((a) => !offen.some((b) => b !== a && hinter(b, a)));
    if (i < 0) {
      i = 0;
      for (let j = 1; j < offen.length; j++) {
        const a = offen[j] as Ding;
        const b = offen[i] as Ding;
        if (a.x1 + a.y1 < b.x1 + b.y1) i = j;
      }
    }
    aus.push(...offen.splice(i, 1));
  }
  return aus;
}

/** Konvexe Hülle (Grundriss), für Schatten. */
function huelle(pkte: [number, number][]): [number, number][] {
  const p = [...pkte].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const kreuz = (o: [number, number], a: [number, number], b: [number, number]): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const unten: [number, number][] = [];
  for (const q of p) {
    while (unten.length >= 2 && kreuz(unten[unten.length - 2] as [number, number], unten[unten.length - 1] as [number, number], q) <= 0) unten.pop();
    unten.push(q);
  }
  const oben: [number, number][] = [];
  for (const q of [...p].reverse()) {
    while (oben.length >= 2 && kreuz(oben[oben.length - 2] as [number, number], oben[oben.length - 1] as [number, number], q) <= 0) oben.pop();
    oben.push(q);
  }
  return [...unten.slice(0, -1), ...oben.slice(0, -1)];
}

/** Vieleck im Grundriss auf das Rechteck [0, x2] × [0, y2] beschneiden (Sutherland–Hodgman). */
export function beschneide(poly: readonly [number, number][], x2: number, y2: number): [number, number][] {
  const kanten: [(q: [number, number]) => number][] = [[(q) => q[0]], [(q) => x2 - q[0]], [(q) => q[1]], [(q) => y2 - q[1]]];
  let aus: [number, number][] = [...poly];
  for (const [d] of kanten) {
    const ein = aus;
    aus = [];
    for (let i = 0; i < ein.length; i++) {
      const a = ein[i] as [number, number];
      const b = ein[(i + 1) % ein.length] as [number, number];
      const da = d(a), db = d(b);
      if (da >= 0) aus.push(a);
      if ((da >= 0) !== (db >= 0) && ein.length > 1) {
        const t = da / (da - db);
        aus.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
  }
  return aus;
}

/** Schattenrichtung im Grundriss je Einheit Höhe: morgens lang nach rechts, mittags kurz, abends lang nach links. */
const SCHATTEN: Record<Licht, [number, number]> = { morgen: [1.05, -0.55], tag: [0.42, -0.12], abend: [-0.95, 0.55] };

class Buehne {
  readonly boden: string[] = [];
  /** Schattenflächen im Grundriss (z = 0); beim Zeichnen auf die Insel beschnitten – ohne clipPath (R72). */
  readonly schatten: [number, number][][] = [];
  readonly dinge: Ding[] = [];
  readonly oben: string[] = [];
  readonly licht: Licht;
  readonly jahreszeit: Jahreszeit;
  readonly sturm: boolean;
  readonly wetter: Wetter | null;
  constructor(licht: Licht, jahreszeit: Jahreszeit, wetter: Wetter | null = null) {
    this.licht = licht;
    this.jahreszeit = jahreszeit;
    this.wetter = wetter;
    this.sturm = wetter === 'sturm';
  }

  ding(x1: number, y1: number, x2: number, y2: number, svg: string): void {
    this.dinge.push({ x1, y1, x2, y2, svg });
  }

  /** Schatten eines Quaders. */
  schattenQuader(x1: number, y1: number, x2: number, y2: number, h: number): void {
    const [sx, sy] = SCHATTEN[this.licht];
    const ecken: [number, number][] = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
    const alle = [...ecken, ...ecken.map(([x, y]): [number, number] => [x + sx * h, y + sy * h])];
    this.schatten.push(huelle(alle));
  }

  /** Runder Schatten (Baum, Figur) am Fuß, in Schattenrichtung versetzt. */
  schattenRund(x: number, y: number, h: number, r: number): void {
    const [sx, sy] = SCHATTEN[this.licht];
    const cx = x + sx * h * 0.6;
    const cy = y + sy * h * 0.6;
    // Kreis im Grundriss (Halbmesser r / 1,22 erscheint isometrisch als Ellipse r × 0,58 r), als Vieleck
    const rho = r / 1.2247;
    const kreis: [number, number][] = [];
    for (let i = 0; i < 16; i++) kreis.push([cx + rho * Math.cos((i * Math.PI) / 8), cy + rho * Math.sin((i * Math.PI) / 8)]);
    this.schatten.push(kreis);
  }
}

// ------------------------------------------------------------------------------------------- Bauten
interface Bau { x1: number; y1: number; x2: number; y2: number; geschosse: number }
const GH = 16;
const GESAMTSCHULE: Bau = { x1: 40, y1: 34, x2: 290, y2: 96, geschosse: 3 };
const GRUNDSCHULE_A: Bau = { x1: 30, y1: 148, x2: 158, y2: 192, geschosse: 2 };
const GRUNDSCHULE_B: Bau = { x1: 30, y1: 192, x2: 80, y2: 250, geschosse: 2 };
const SPORTHALLE: Bau = { x1: 270, y1: 152, x2: 390, y2: 246, geschosse: 1 };
const SH_HOEHE = 36;
const hoehe = (b: Bau): number => (b === SPORTHALLE ? SH_HOEHE : b.geschosse * GH);

const ZAUN = { x1: 12, y1: 12, x2: 420, y2: 274 };
const INSEL = { x2: 440, y2: 332, dicke: 16 };

/** Fenster-Reihen eines fertigen Baus auf beiden sichtbaren Seiten; jedes dritte bis fünfte leuchtet abends. */
function fenster(b: Bau, zVon: number, zBis: number, xBis = b.x2, farbig: readonly Akzent[] = []): string {
  let glas = '';
  let an = '';
  let rahmen = '';
  let tafeln = '';
  const tafelD: Map<Akzent, string> = new Map();
  let i = 0;
  for (let f = Math.floor(zVon / GH); f < Math.ceil(zBis / GH) && f < b.geschosse; f++) {
    const z1 = f * GH + 4.5;
    const z2 = f * GH + 12.5;
    for (let u = b.x1 + 5; u + 8 <= xBis - 3; u += 12) {
      const d = wandL(b.y2, u, u + 8, z1, z2);
      if ((i * 7 + f * 3) % 5 < 2) an += d; else glas += d;
      rahmen += strich([u, b.y2, z1 + 3], [u + 8, b.y2, z1 + 3]);
      if (farbig.length > 0 && i % 3 === 1) {
        const a = farbig[(i + f) % farbig.length] as Akzent;
        tafelD.set(a, (tafelD.get(a) ?? '') + wandL(b.y2, u + 8.6, u + 11.4, z1, z2));
      }
      i++;
    }
    if (xBis >= b.x2) {
      for (let v = b.y2 - 5; v - 8 >= b.y1 + 3; v -= 12) {
        const d = wandR(b.x2, v, v - 8, z1, z2);
        if ((i * 7 + f * 3) % 5 < 2) an += d; else glas += d;
        rahmen += strich([b.x2, v, z1 + 3], [b.x2, v - 8, z1 + 3]);
        i++;
      }
    }
  }
  for (const [a, d] of tafelD) tafeln += pfad(`ci-tafel ci-a-${a}`, d);
  return pfad('ci-glas', glas) + pfad('ci-glas ci-an', an) + pfad('ci-sprosse', rahmen) + tafeln;
}

/** Holzfassade (Lamellen, Geschossfugen, Sockel) auf den sichtbaren Seiten bis Höhe h; xBis begrenzt links. */
function holzFassade(b: Bau, z1: number, z2: number, xBis = b.x2): string {
  let lam = '';
  for (let u = b.x1 + 2.5; u < xBis; u += 3.5) lam += strich([u, b.y2, z1], [u, b.y2, z2]);
  if (xBis >= b.x2) for (let v = b.y2 - 2.5; v > b.y1; v -= 3.5) lam += strich([b.x2, v, z1], [b.x2, v, z2]);
  let fuge = '';
  for (let z = Math.ceil(z1 / GH) * GH; z < z2; z += GH) {
    if (z <= 0) continue;
    fuge += strich([b.x1, b.y2, z], [xBis, b.y2, z]);
    if (xBis >= b.x2) fuge += strich([b.x2, b.y2, z], [b.x2, b.y1, z]);
  }
  const wand = g('ci-holz', flaeche('ci-l', [[b.x1, b.y2, z1], [xBis, b.y2, z1], [xBis, b.y2, z2], [b.x1, b.y2, z2]])
    + (xBis >= b.x2 ? flaeche('ci-r', [[b.x2, b.y2, z1], [b.x2, b.y1, z1], [b.x2, b.y1, z2], [b.x2, b.y2, z2]]) : ''));
  return wand + pfad('ci-lamelle', lam) + pfad('ci-fuge', fuge);
}

/** Flachdach mit Attika und Gründach (Schnee im Winter). */
function dach(b: Bau, h: number): string {
  const { x1, y1, x2, y2 } = b;
  return quader(x1, y1, x2, y2, h, h + 2.2, 'ci-attika') + flaeche('ci-dach', [[x1 + 3, y1 + 3, h + 2.2], [x2 - 3, y1 + 3, h + 2.2], [x2 - 3, y2 - 3, h + 2.2], [x1 + 3, y2 - 3, h + 2.2]]);
}

function fertigerBau(b: Bau, farbig: readonly Akzent[] = []): string {
  const h = hoehe(b);
  const sockel = g('ci-beton', flaeche('ci-l', [[b.x1, b.y2, 0], [b.x2, b.y2, 0], [b.x2, b.y2, 2.5], [b.x1, b.y2, 2.5]])
    + flaeche('ci-r', [[b.x2, b.y2, 0], [b.x2, b.y1, 0], [b.x2, b.y1, 2.5], [b.x2, b.y2, 2.5]]));
  return holzFassade(b, 0, h) + sockel + fenster(b, 0, h, b.x2, farbig) + dach(b, h);
}

/** Solarmodule in Reihen auf dem Dach der Gesamtschule. */
function solar(b: Bau, h: number): string {
  let d = '';
  let l = '';
  for (let y = b.y1 + 14; y <= b.y2 - 6; y += 12) {
    for (let x = b.x1 + 10; x + 18 <= b.x2 - 8; x += 21) {
      d += zug([[x, y, h + 3], [x + 18, y, h + 3], [x + 18, y - 7, h + 6.5], [x, y - 7, h + 6.5]]);
      l += strich([x + 9, y, h + 3], [x + 9, y - 7, h + 6.5]);
    }
  }
  return pfad('ci-solar', d) + pfad('ci-solar-linie', l);
}

/** Eingang der Gesamtschule: hohe Verglasung und Vordach. */
function eingangGesamtschule(): string {
  const { y2 } = GESAMTSCHULE;
  return pfad('ci-glas ci-an', wandL(y2, 152, 178, 2.5, 28)) + pfad('ci-sprosse', strich([165, y2, 2.5], [165, y2, 28]) + strich([152, y2, 15], [178, y2, 15]))
    + quader(146, y2, 184, y2 + 10, 28, 30.5, 'ci-attika');
}

/** Sporthalle fertig: Holz unten, umlaufendes Oberlicht, großes Tor, Dach mit Lichtbändern. */
function sporthalleFertig(): string {
  const b = SPORTHALLE;
  const h = SH_HOEHE;
  let band = '';
  let sprossen = '';
  band += wandL(b.y2, b.x1 + 4, b.x2 - 4, 22, 32);
  band += wandR(b.x2, b.y2 - 4, b.y1 + 4, 22, 32);
  for (let u = b.x1 + 4; u <= b.x2 - 4; u += 8) sprossen += strich([u, b.y2, 22], [u, b.y2, 32]);
  for (let v = b.y2 - 4; v >= b.y1 + 4; v -= 8) sprossen += strich([b.x2, v, 22], [b.x2, v, 32]);
  let licht = '';
  for (let y = b.y1 + 16; y < b.y2 - 10; y += 22) licht += zug([[b.x1 + 12, y, h + 2.4], [b.x2 - 12, y, h + 2.4], [b.x2 - 12, y + 7, h + 2.4], [b.x1 + 12, y + 7, h + 2.4]]);
  const sockel = g('ci-beton', flaeche('ci-l', [[b.x1, b.y2, 0], [b.x2, b.y2, 0], [b.x2, b.y2, 2.5], [b.x1, b.y2, 2.5]])
    + flaeche('ci-r', [[b.x2, b.y2, 0], [b.x2, b.y1, 0], [b.x2, b.y1, 2.5], [b.x2, b.y2, 2.5]]));
  return holzFassade(b, 0, h) + sockel + pfad('ci-glas ci-an', band) + pfad('ci-sprosse', sprossen)
    + pfad('ci-glas', wandL(b.y2, 290, 314, 2.5, 16)) + pfad('ci-glas ci-an', wandL(b.y2, 340, 352, 2.5, 13))
    + dach(b, h) + pfad('ci-glas ci-oberlicht', licht);
}

/** Rohbau: Geschossdecken, Stützen, dunkles Inneres; `geschosse` fertig, dazu optional Stützen des nächsten. */
function rohbau(b: Bau, geschosse: number, naechstesBis = 0): string {
  const { x1, y1, x2, y2 } = b;
  let s = quader(x1, y1, x2, y2, 0, 1.5, 'ci-beton');
  for (let f = 0; f < geschosse; f++) {
    const z = f * GH;
    s += quader(x1 + 3, y1 + 3, x2 - 3, y2 - 3, z + 1.5, z + GH, 'ci-roh');
    s += stuetzenReihe(b, z + 1.5, z + GH, x2);
    s += quader(x1, y1, x2, y2, z + GH, z + GH + 1.5, 'ci-beton');
  }
  if (naechstesBis > x1) s += stuetzenReihe(b, geschosse * GH + 1.5, geschosse * GH + GH, naechstesBis);
  return s;
}

/**
 * Erste Wände (Stufe 2): Bodenplatte, das Erdgeschoss hinten und links schon gemauert, zwei Querwände, vorn die
 * Wand bis `xBis` mit Fensteröffnungen, dahinter nur Stützen – noch ohne Decke.
 */
function ersteWaende(b: Bau, xBis: number): string {
  const { x1, y1, x2, y2 } = b;
  const z1 = 1.5;
  const z2 = GH;
  let s = quader(x1, y1, x2, y2, 0, z1, 'ci-beton');
  s += quader(x1, y1, x2, y1 + 2, z1, z2, 'ci-beton');
  s += quader(x1, y1, x1 + 2, y2, z1, z2, 'ci-beton');
  for (const x of [100, 160]) if (x < xBis) s += quader(x, y1 + 2, x + 2, y2, z1, z2, 'ci-beton');
  s += quader(x1, y2 - 2, xBis, y2, z1, z2, 'ci-beton');
  let loch = '';
  for (let u = x1 + 7; u + 8 <= xBis - 4; u += 14) loch += wandL(y2, u, u + 8, z1 + 4, z1 + 11);
  s += pfad('ci-dunkel-voll', loch);
  for (let x = xBis + 16; x <= x2 - 2; x += 18) s += quader(x, y2 - 2, x + 2, y2, z1, z2, 'ci-beton');
  for (let y = y1 + 16; y <= y2 - 4; y += 18) s += quader(x2 - 2, y, x2, y + 2, z1, z2, 'ci-beton');
  return s;
}

function stuetzenReihe(b: Bau, z1: number, z2: number, xBis: number): string {
  let s = '';
  for (let x = b.x1; x <= Math.min(xBis, b.x2) - 2; x += 18) s += quader(x, b.y2 - 2, x + 2, b.y2, z1, z2, 'ci-beton');
  if (xBis >= b.x2) for (let y = b.y1; y <= b.y2 - 4; y += 18) s += quader(b.x2 - 2, y, b.x2, y + 2, z1, z2, 'ci-beton');
  return s;
}

/** Gerüst vor den sichtbaren Seiten, bis Höhe h; xVon/xBis begrenzen die linke Seite. */
function geruest(b: Bau, h: number, xVon = b.x1, rechts = true): string {
  const a = 4;
  let stangen = '';
  let belag = '';
  const y = b.y2 + a;
  for (let u = xVon; u <= b.x2 + (rechts ? a : 0); u += 12) stangen += strich([u, y, 0], [u, y, h + 4]);
  for (let z = 8; z <= h + 2; z += 8) {
    stangen += strich([xVon, y, z + 4], [b.x2 + (rechts ? a : 0), y, z + 4]);
    belag += zug([[xVon, b.y2, z], [b.x2 + (rechts ? a : 0), b.y2, z], [b.x2 + (rechts ? a : 0), y, z], [xVon, y, z]]);
  }
  if (rechts) {
    const x = b.x2 + a;
    for (let v = b.y2 + a; v >= b.y1; v -= 12) stangen += strich([x, v, 0], [x, v, h + 4]);
    for (let z = 8; z <= h + 2; z += 8) {
      stangen += strich([x, b.y2 + a, z + 4], [x, b.y1, z + 4]);
      belag += zug([[b.x2, b.y1, z], [x, b.y1, z], [x, b.y2, z], [b.x2, b.y2, z]]);
    }
  }
  // Diagonalen als Kreuz je zweites Feld
  for (let u = xVon; u + 12 <= b.x2; u += 24) stangen += strich([u, y, 4], [u + 12, y, Math.min(h, 28)]);
  return pfad('ci-belag', belag) + pfad('ci-geruest', stangen);
}

/**
 * Holztragwerk der Sporthalle im Bau: Bodenplatte, die beiden hinteren Wände schon geschlossen (Innenseiten
 * sichtbar), vorne Brettschichtholz-Stützen und Binder, das Dach zur Hälfte belegt.
 */
function sporthalleTragwerk(): string {
  const b = SPORTHALLE;
  const h = SH_HOEHE;
  let s = quader(b.x1, b.y1, b.x2, b.y2, 0, 1.5, 'ci-beton');
  // Innenseiten der hinteren Wände: Wand y1 zeigt nach vorn links, Wand x1 nach vorn rechts.
  s += g('ci-holz', flaeche('ci-l', [[b.x1, b.y1, 1.5], [b.x2, b.y1, 1.5], [b.x2, b.y1, h], [b.x1, b.y1, h]])
    + flaeche('ci-r', [[b.x1, b.y1, 1.5], [b.x1, b.y2, 1.5], [b.x1, b.y2, h], [b.x1, b.y1, h]]));
  let fugen = '';
  for (let x = b.x1 + 20; x < b.x2; x += 20) fugen += strich([x, b.y1, 1.5], [x, b.y1, h]);
  for (let y = b.y1 + 24; y < b.y2; y += 24) fugen += strich([b.x1, y, 1.5], [b.x1, y, h]);
  s += pfad('ci-fuge', fugen);
  // Binder quer über die Halle, auf Stützen vorn (y2) und rechts (x2)
  for (let x = b.x1; x <= b.x2 - 3; x += 20) s += quader(x, b.y1, x + 3, b.y2, h - 3, h, 'ci-holz');
  s += quader(b.x1, b.y1, b.x2, b.y1 + 40, h, h + 1.5, 'ci-holz');
  const stuetzen: [number, number][] = [];
  for (let x = b.x1 + 20; x <= b.x2 - 3; x += 20) stuetzen.push([x, b.y2 - 3]);
  for (let y = b.y1 + 24; y < b.y2 - 3; y += 24) stuetzen.push([b.x2 - 3, y]);
  stuetzen.push([b.x2 - 3, b.y2 - 3], [b.x1, b.y2 - 3]);
  stuetzen.sort((a, c) => a[0] + a[1] - (c[0] + c[1]));
  for (const [x, y] of stuetzen) s += quader(x, y, x + 3, y + 3, 1.5, h - 3, 'ci-holz');
  return s;
}

/** Abgerissene Planen am Gerüst der Sporthalle (nur bei Sturm): Fetzen, die vom Gerüst wegwehen. */
function planen(): string {
  const b = SPORTHALLE;
  const y = b.y2 + 4;
  let d = '';
  // vorn links: drei Fetzen, oben am Gerüst gehalten, unten im Wind nach rechts gezogen
  for (const [u, z, l] of [[b.x1 + 14, SH_HOEHE + 2, 15], [b.x1 + 50, SH_HOEHE - 6, 12], [b.x1 + 86, SH_HOEHE + 2, 17]] as const) {
    d += `M${P(u, y, z)}L${P(u + 10, y, z)}L${P(u + 14 + l * 0.5, y + 3, z - l * 0.55)}L${P(u + 6 + l * 0.7, y + 5, z - l)}Z`;
  }
  // rechts: ein Fetzen an der Seite
  const x = b.x2 + 4;
  d += `M${P(x, b.y1 + 30, SH_HOEHE)}L${P(x, b.y1 + 40, SH_HOEHE)}L${P(x + 4, b.y1 + 52, SH_HOEHE - 10)}L${P(x + 6, b.y1 + 44, SH_HOEHE - 16)}Z`;
  return pfad('ci-plane', d);
}

/** Turmdrehkran: Mast (als Ding sortiert) und Kopf mit Ausleger, Laufkatze, Seil und Last (oben). */
function kran(buehne: Buehne, mx: number, my: number, richtung: 'x' | 'y', bis: number, last: { a: number; z: number; holz: boolean } | null, H = 132): void {
  let mast = quader(mx - 3, my - 3, mx + 3, my + 3, 0, H, 'ci-gelb');
  let gitter = '';
  for (let z = 0; z < H; z += 8) {
    gitter += strich([mx - 3, my + 3, z], [mx + 3, my + 3, z + 8]) + strich([mx + 3, my + 3, z], [mx + 3, my - 3, z + 8]);
  }
  mast += pfad('ci-gitter', gitter) + quader(mx - 7, my - 7, mx + 7, my + 7, 0, 3, 'ci-beton');
  buehne.ding(mx - 7, my - 7, mx + 7, my + 7, mast);
  buehne.schatten.push([[mx, my], [mx + SCHATTEN[buehne.licht][0] * 70, my + SCHATTEN[buehne.licht][1] * 70]]);
  // Kopf
  const z1 = H;
  const z2 = H + 4;
  let kopf = '';
  const arm = (a1: number, a2: number): string => (richtung === 'x' ? quader(a1, my - 2, a2, my + 2, z1, z2, 'ci-gelb') : quader(mx - 2, a1, mx + 2, a2, z1, z2, 'ci-gelb'));
  const pt = (a: number, z: number): V3 => (richtung === 'x' ? [a, my, z] : [mx, a, z]);
  // Ausleger vom Mast bis `bis`, Gegenausleger mit Gewicht auf der Gegenseite
  const m = richtung === 'x' ? mx : my;
  const vz = Math.sign(bis - m) || 1;
  const gegenEnde = m - vz * 34;
  const gw = vz > 0 ? gegenEnde : gegenEnde - 10;
  kopf += arm(Math.min(m, gegenEnde), Math.max(m, gegenEnde));
  kopf += richtung === 'x' ? quader(gw, my - 4, gw + 10, my + 4, z1 - 6, z1, 'ci-beton') : quader(mx - 4, gw, mx + 4, gw + 10, z1 - 6, z1, 'ci-beton');
  kopf += arm(Math.min(m, bis), Math.max(m, bis));
  // Turmspitze mit Abspannung
  kopf += pfad('ci-seil', strich([mx, my, z2], [mx, my, z2 + 16]) + strich([mx, my, z2 + 16], pt(bis, z2)) + strich([mx, my, z2 + 16], pt(gegenEnde, z2)));
  // Führerhaus
  kopf += quader(mx + 3, my + 1, mx + 9, my + 7, z1 - 9, z1 - 1, 'ci-gelb') + pfad('ci-glas', wandL(my + 7, mx + 4, mx + 8, z1 - 7, z1 - 3));
  if (last) {
    kopf += quader(...(richtung === 'x' ? [last.a - 2, my - 3, last.a + 2, my + 3] as const : [mx - 3, last.a - 2, mx + 3, last.a + 2] as const), z1 - 2, z1, 'ci-dunkel');
    kopf += pfad('ci-seil', strich(pt(last.a, z1 - 2), pt(last.a, last.z + 10)));
    if (last.holz) {
      const [lx, ly] = richtung === 'x' ? [last.a, my] : [mx, last.a];
      kopf += pfad('ci-seil', strich([lx, ly, last.z + 10], [lx - 12, ly, last.z + 2]) + strich([lx, ly, last.z + 10], [lx + 12, ly, last.z + 2]));
      kopf += quader(lx - 14, ly - 1.5, lx + 14, ly + 1.5, last.z - 10, last.z + 2, 'ci-holz');
      kopf += pfad('ci-glas', wandL(ly + 1.5, lx - 9, lx - 2, last.z - 7, last.z - 1) + wandL(ly + 1.5, lx + 3, lx + 10, last.z - 7, last.z - 1));
    } else {
      const [lx, ly] = richtung === 'x' ? [last.a, my] : [mx, last.a];
      kopf += quader(lx - 5, ly - 5, lx + 5, ly + 5, last.z - 4, last.z + 2, 'ci-beton');
    }
  }
  buehne.oben.push(kopf);
}

// ------------------------------------------------------------------------------------------- Kleinzeug
function baum(buehne: Buehne, x: number, y: number, art: 'laub' | 'nadel' | 'jung', n: number, gross = 1): void {
  const k = `k${n % 3}`;
  if (art === 'nadel') {
    const h = 30 * gross;
    const [bx, by] = [px(x, y), py(x, y, 0)];
    buehne.schattenRund(x, y, h * 0.7, 7 * gross);
    let s = `<path class="ci-stamm" d="M${bx - 1.2},${by}h2.4v-6h-2.4Z"/>`;
    const lagen = [[6, 13, 9], [13, 20, 7.5], [20, 28, 5.5]] as const;
    let d = '';
    let schnee = '';
    for (const [u, o, b] of lagen) {
      d += `M${bx - b * gross},${by - u * gross}L${bx},${by - (o + 4) * gross}L${bx + b * gross},${by - u * gross}Z`;
      schnee += `M${bx - b * gross * 0.45},${by - (o + 4 - (o + 4 - u) * 0.45) * gross}L${bx},${by - (o + 4) * gross}L${bx + b * gross * 0.45},${by - (o + 4 - (o + 4 - u) * 0.45) * gross}Z`;
    }
    s += pfad('ci-nadel', d) + pfad('ci-nadel-licht', `M${bx},${by - 32 * gross}L${bx + 5.5 * gross},${by - 20 * gross}L${bx},${by - 20 * gross}Z`);
    if (buehne.jahreszeit === 'winter') s += pfad('ci-schneehaube', schnee);
    buehne.ding(x - 2, y - 2, x + 2, y + 2, s);
    return;
  }
  const jung = art === 'jung';
  const st = (jung ? 10 : 12) * gross;
  const r = (jung ? 5.5 : 10) * gross;
  const [bx, by] = [px(x, y), py(x, y, 0)];
  buehne.schattenRund(x, y, st + r, r * 0.9);
  let s = `<path class="ci-stamm" d="M${bx - 1.2},${by}h2.4v${-st - r * 0.4}h-2.4Z"/>`;
  if (jung) s += `<path class="ci-pfahl" d="M${bx + 3},${by + 0.5}v-12M${bx - 3},${by + 0.5}v-12M${bx - 3},${by - 7}H${bx + 3}"/>`;
  const cy = by - st - r * 0.6;
  s += `<circle class="ci-krone ${k}" cx="${bx}" cy="${r1(cy)}" r="${r1(r)}"/>`;
  s += `<circle class="ci-krone ${k}" cx="${r1(bx - r * 0.55)}" cy="${r1(cy + r * 0.35)}" r="${r1(r * 0.68)}"/>`;
  s += `<circle class="ci-krone ${k}" cx="${r1(bx + r * 0.6)}" cy="${r1(cy + r * 0.3)}" r="${r1(r * 0.62)}"/>`;
  s += `<circle class="ci-kronenlicht" cx="${r1(bx - r * 0.3)}" cy="${r1(cy - r * 0.3)}" r="${r1(r * 0.45)}"/>`;
  if (buehne.jahreszeit === 'fruehling' && n % 3 === 2) {
    let d = '';
    for (const [a, b2] of [[-0.5, -0.2], [0.2, -0.55], [0.55, 0.2], [-0.15, 0.4], [-0.7, 0.45], [0.3, 0.1]] as const) d += `M${r1(bx + a * r)},${r1(cy + b2 * r)}m-1.3,0a1.3,1.3 0 1 0 2.6,0a1.3,1.3 0 1 0 -2.6,0`;
    s += pfad('ci-bluete', d);
  }
  if (buehne.jahreszeit === 'winter') s += `<path class="ci-schneehaube" d="M${r1(bx - r * 0.8)},${r1(cy - r * 0.45)}Q${bx},${r1(cy - r * 1.25)} ${r1(bx + r * 0.8)},${r1(cy - r * 0.45)}Q${bx},${r1(cy - r * 0.75)} ${r1(bx - r * 0.8)},${r1(cy - r * 0.45)}Z"/>`;
  buehne.ding(x - 2, y - 2, x + 2, y + 2, s);
}

type FigurArt = 'arbeiter' | 'kind' | 'erwachsen';
/** Kleine Figur: Beine, Körper, Kopf; Arbeiter mit Helm und Warnweste, Kinder mit Ranzen. */
function figur(buehne: Buehne, x: number, y: number, art: FigurArt, farbe: Akzent, n: number): void {
  const k = art === 'kind' ? 0.95 : 1.3;
  const [bx, by] = [px(x, y), py(x, y, 0)];
  buehne.schattenRund(x, y, 6 * k, 2.6 * k);
  const haut = `ci-haut-${(n % 3) + 1}`;
  const koerper = art === 'arbeiter' ? 'ci-a-orange' : `ci-a-${farbe}`;
  const bein = art === 'kind' && n % 2 === 0 ? 'ci-a-blau-d' : 'ci-hose';
  let s = `<path class="${bein}" d="M${r1(bx - 1.9 * k)},${by}v${r1(-4.6 * k)}h${r1(3.8 * k)}v${r1(4.6 * k)}h${r1(-1.5 * k)}v${r1(-3 * k)}h${r1(-0.8 * k)}v${r1(3 * k)}Z"/>`;
  s += `<rect class="${koerper}" x="${r1(bx - 2.4 * k)}" y="${r1(by - 10.2 * k)}" width="${r1(4.8 * k)}" height="${r1(6 * k)}" rx="${r1(1.6 * k)}"/>`;
  if (art === 'arbeiter') s += `<path class="ci-reflex" d="M${r1(bx - 2.4 * k)},${r1(by - 6.4 * k)}h${r1(4.8 * k)}"/>`;
  if (art === 'kind') s += `<rect class="ci-a-${AKZENTE[(n + 3) % AKZENTE.length] as Akzent}-d" x="${r1(bx + (n % 2 === 0 ? 1.4 : -3.6) * k)}" y="${r1(by - 9.6 * k)}" width="${r1(2.2 * k)}" height="${r1(4 * k)}" rx=".6"/>`;
  s += `<circle class="${haut}" cx="${bx}" cy="${r1(by - 12.4 * k)}" r="${r1(2.1 * k)}"/>`;
  if (art === 'arbeiter') s += `<path class="ci-a-sonne" d="M${r1(bx - 2.6 * k)},${r1(by - 12.6 * k)}a${r1(2.6 * k)},${r1(2.6 * k)} 0 0 1 ${r1(5.2 * k)},0Z"/>`;
  else s += `<path class="ci-haar-${(n % 2) + 1}" d="M${r1(bx - 2.2 * k)},${r1(by - 12.4 * k)}a${r1(2.2 * k)},${r1(2.2 * k)} 0 0 1 ${r1(4.4 * k)},0q${r1(-2.2 * k)},${r1(-0.9 * k)} ${r1(-4.4 * k)},0Z"/>`;
  buehne.ding(x - 1, y - 1, x + 1, y + 1, s);
}

/**
 * Wimpelkette vom Schulfest (Stufe 2) am vorderen Zaun von u1 bis u2 (Ebene y): Schnur leicht durchhängend zwischen den
 * Pfosten, daran Dreiecke in fünf Akzenttönen.
 */
function wimpelkette(y: number, u1: number, u2: number, h: number): string {
  const toene: readonly Akzent[] = ['beere', 'sonne', 'lagune', 'gruen', 'blau'];
  const durchhang = (u: number): number => {
    const t = ((u - u1) % 28) / 28;
    return h + 2.5 - 3 * Math.sin(Math.PI * t);
  };
  let schnur = '';
  const d: Map<Akzent, string> = new Map();
  for (let u = u1, i = 0; u + 4.6 <= u2; u += 6, i++) {
    const a = toene[i % toene.length] as Akzent;
    const z = durchhang(u);
    const z2 = durchhang(u + 4.6);
    d.set(a, (d.get(a) ?? '') + zug([[u, y, z], [u + 4.6, y, z2], [u + 2.3, y, (z + z2) / 2 - 7]]));
  }
  for (let u = u1; u < u2; u += 1) schnur += `${u === u1 ? 'M' : 'L'}${P(u, y, durchhang(u))}`;
  let s = pfad('ci-wimpelschnur', schnur);
  for (const [a, dd] of d) s += pfad(`ci-a-${a}`, dd);
  return s;
}

/** Bauzaun als Gitterflächen; vorne mit Lücke für die Zufahrt; auf Wunsch mit Wimpelkette vorn. */
function bauzaun(buehne: Buehne, wimpel = false): void {
  const { x1, y1, x2, y2 } = ZAUN;
  const h = 11;
  const feld = (a: V3, b: V3): string => {
    const [ax, ay] = [a[0], a[1]];
    const [bx2, by2] = [b[0], b[1]];
    let s = flaeche('ci-zaun', [[ax, ay, 0.8], [bx2, by2, 0.8], [bx2, by2, h], [ax, ay, h]]);
    let r = strich([ax, ay, h], [bx2, by2, h]) + strich([ax, ay, 0.8], [bx2, by2, 0.8]);
    const n = Math.max(1, Math.round(Math.hypot(bx2 - ax, by2 - ay) / 14));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const q: V3 = [ax + (bx2 - ax) * t, ay + (by2 - ay) * t, 0];
      r += strich(q, [q[0], q[1], h]);
    }
    s += pfad('ci-zaunrahmen', r);
    return s;
  };
  if (buehne.jahreszeit === 'winter') { /* Zaun bleibt gleich; Schnee liegt am Boden */ }
  buehne.ding(x1, y1, x2, y1, feld([x1, y1, 0], [x2, y1, 0]));
  buehne.ding(x1, y1, x1, y2, feld([x1, y1, 0], [x1, y2, 0]));
  buehne.ding(x2, y1, x2, y2, feld([x2, y1, 0], [x2, y2, 0]));
  buehne.ding(x1, y2, 214, y2, feld([x1, y2, 0], [214, y2, 0]) + (wimpel ? wimpelkette(y2, x1 + 4, 112, h) : ''));
  if (buehne.sturm) {
    // ein Feld vorn rechts liegt umgekippt nach vorn im Gras
    buehne.ding(250, y2, 292, y2 + h, flaeche('ci-zaun', [[250, y2, 0.6], [292, y2, 0.6], [292, y2 + h, 0.3], [250, y2 + h, 0.3]])
      + pfad('ci-zaunrahmen', strich([250, y2, 0.6], [292, y2, 0.6]) + strich([250, y2 + h, 0.3], [292, y2 + h, 0.3]) + strich([250, y2, 0.6], [250, y2 + h, 0.3]) + strich([271, y2, 0.6], [271, y2 + h, 0.3]) + strich([292, y2, 0.6], [292, y2 + h, 0.3])));
    buehne.ding(292, y2, x2, y2, feld([292, y2, 0], [x2, y2, 0]));
  } else buehne.ding(250, y2, x2, y2, feld([250, y2, 0], [x2, y2, 0]) + (wimpel ? wimpelkette(y2, 252, x2 - 4, h) : ''));
}

/** Bauschild am Zaun: „Hier baut die Stadt Lindenhall“ (fiktiv). */
function bauschild(buehne: Buehne): void {
  const y = ZAUN.y2 + 2;
  const x1 = 120;
  const x2 = 190;
  const z1 = 9;
  const z2 = 35;
  let s = pfad('ci-pfosten', strich([x1 + 6, y, 0], [x1 + 6, y, z1]) + strich([x2 - 6, y, 0], [x2 - 6, y, z1]));
  s += flaeche('ci-schild', [[x1, y, z1], [x2, y, z1], [x2, y, z2], [x1, y, z2]]);
  s += flaeche('ci-schild-band', [[x1, y, z1], [x2, y, z1], [x2, y, z1 + 5], [x1, y, z1 + 5]]);
  s += flaeche('ci-schild-marke', [[x1 + 4, y, z2 - 4], [x1 + 12, y, z2 - 4], [x1 + 12, y, z2 - 12], [x1 + 4, y, z2 - 12]]);
  const m = `matrix(${C} 0.5 0 1 ${px(x1, y)} ${py(x1, y, 0)})`;
  s += `<g transform="${m}"><text class="ci-schrift" x="15" y="${-z2 + 9}">Hier baut die</text><text class="ci-schrift ci-schrift-gross" x="15" y="${-z2 + 18}">Stadt Lindenhall</text><text class="ci-schrift ci-schrift-klein" x="4" y="${-z1 - 1.4}">Schulcampus Lindenhall-Süd</text></g>`;
  buehne.ding(x1, y, x2, y, s);
}

function bagger(buehne: Buehne, x: number, y: number, z: number): void {
  let s = quader(x, y, x + 20, y + 12, z, z + 4, 'ci-dunkel');
  s += quader(x + 2, y + 1, x + 17, y + 11, z + 4, z + 10, 'ci-gelb');
  s += quader(x + 3, y + 6, x + 10, y + 11, z + 10, z + 18, 'ci-gelb') + pfad('ci-glas', wandL(y + 11, x + 4, x + 9, z + 12, z + 17) + wandR(x + 10, y + 10, y + 7, z + 12, z + 17));
  s += `<path class="ci-arm" d="M${P(x + 17, y + 4, z + 10)}L${P(x + 34, y + 4, z + 22)}L${P(x + 44, y + 4, z + 6)}"/>`;
  s += flaeche('ci-dunkel-voll', [[x + 41, y + 1, z + 9], [x + 48, y + 1, z + 4], [x + 46, y + 1, z + 0], [x + 41, y + 1, z + 3]]);
  buehne.schattenQuader(x, y, x + 20, y + 12, 12);
  buehne.ding(x, y, x + 48, y + 12, s);
}

/** Kipper (Stufe 1) oder Fahrmischer (Stufe 2) – Fahrerhaus vorn rechts. */
function lkw(buehne: Buehne, x: number, y: number, art: 'kipper' | 'mischer'): void {
  let s = quader(x, y, x + 34, y + 11, 3, 5, 'ci-dunkel');
  if (art === 'kipper') s += quader(x, y, x + 24, y + 11, 5, 14, 'ci-blau') + quader(x + 1.5, y + 1.5, x + 22.5, y + 9.5, 13.9, 13.9, 'ci-haufenkiste');
  else {
    s += quader(x + 1, y + 2, x + 23, y + 9, 5, 8, 'ci-beton');
    s += `<ellipse class="ci-trommel" cx="${px(x + 12, y + 5.5)}" cy="${py(x + 12, y + 5.5, 14)}" rx="13" ry="8"/><path class="ci-trommel-streifen" d="M${P(x + 4, y + 9, 10)}L${P(x + 18, y + 9, 20)}M${P(x + 10, y + 9, 9)}L${P(x + 22, y + 9, 18)}"/>`;
  }
  s += quader(x + 25, y, x + 34, y + 11, 5, 16, 'ci-gelb') + pfad('ci-glas', wandR(x + 34, y + 9.5, y + 1.5, 10, 15) + wandL(y + 11, x + 27, x + 32, 10, 15));
  for (const u of [x + 6, x + 18, x + 29]) s += `<ellipse class="ci-rad" cx="${px(u, y + 11)}" cy="${py(u, y + 11, 2.8)}" rx="3" ry="3.5"/>`;
  buehne.schattenQuader(x, y, x + 34, y + 11, 14);
  buehne.ding(x, y, x + 34, y + 11, s);
}

/** Klohäuschen der Baustelle. */
function toilette(buehne: Buehne, x: number, y: number): void {
  buehne.ding(x, y, x + 7, y + 7, quader(x, y, x + 7, y + 7, 0, 15, 'ci-lagune') + pfad('ci-tuer', wandL(y + 7, x + 1.5, x + 5.5, 1, 12)));
}

/** Stapel aus Schalungstafeln oder Stahl (Rohbau). */
function stapel(buehne: Buehne, x: number, y: number, m: 'ci-holz' | 'ci-beton'): void {
  let s = '';
  for (let z = 0; z < 7; z += 1.8) s += quader(x, y, x + 18, y + 9, z, z + 1.6, m);
  buehne.ding(x, y, x + 18, y + 9, s);
}

/** Baucontainer; `erleuchtet` (P19.3, Schulcontainer): das Fenster leuchtet abends. */
function container(buehne: Buehne, x: number, y: number, z = 0, erleuchtet = false): void {
  let s = quader(x, y, x + 30, y + 12, z, z + 12, 'ci-blau');
  let rippen = '';
  for (let u = x + 3; u < x + 30; u += 3) rippen += strich([u, y + 12, z + 1], [u, y + 12, z + 11]);
  s += pfad('ci-rippe', rippen) + pfad('ci-tuer', wandL(y + 12, x + 4, x + 9, z + 1, z + 10)) + pfad(erleuchtet ? 'ci-glas ci-an' : 'ci-glas', wandL(y + 12, x + 14, x + 26, z + 5, z + 10));
  if (z === 0) buehne.schattenQuader(x, y, x + 30, y + 12, 24);
  buehne.ding(x, y, x + 30, y + 12, s);
}

function erdhaufen(buehne: Buehne, x: number, y: number, r: number): void {
  const [bx, by] = [px(x, y), py(x, y, 0)];
  const s = `<path class="ci-haufen" d="M${r1(bx - r)},${by}Q${r1(bx - r * 0.5)},${r1(by - r * 0.9)} ${bx},${r1(by - r * 0.85)}Q${r1(bx + r * 0.6)},${r1(by - r * 0.8)} ${r1(bx + r)},${by}Q${bx},${r1(by + r * 0.35)} ${r1(bx - r)},${by}Z"/><path class="ci-haufen-licht" d="M${r1(bx - r * 0.7)},${r1(by - r * 0.2)}Q${r1(bx - r * 0.4)},${r1(by - r * 0.8)} ${bx},${r1(by - r * 0.85)}Q${r1(bx - r * 0.2)},${r1(by - r * 0.4)} ${r1(bx - r * 0.7)},${r1(by - r * 0.2)}Z"/>`;
  buehne.ding(x - r * 0.6, y - r * 0.6, x + r * 0.6, y + r * 0.6, s);
}

function walze(buehne: Buehne, x: number, y: number): void {
  let s = quader(x, y, x + 14, y + 8, 2, 8, 'ci-gelb');
  s += quader(x + 2, y + 1, x + 8, y + 7, 8, 14, 'ci-gelb') + pfad('ci-glas', wandL(y + 7, x + 3, x + 7, 9.5, 13));
  s += `<ellipse class="ci-dunkel-voll" cx="${px(x + 14, y + 4)}" cy="${py(x + 14, y + 4, 3)}" rx="3.5" ry="5"/>`;
  buehne.schattenQuader(x, y, x + 16, y + 8, 10);
  buehne.ding(x, y, x + 17, y + 8, s);
}

function palette(buehne: Buehne, x: number, y: number, ladung: 'holz' | 'pflaster'): void {
  let s = quader(x, y, x + 10, y + 10, 0, 1.5, 'ci-holz');
  if (ladung === 'pflaster') s += quader(x + 0.5, y + 0.5, x + 9.5, y + 9.5, 1.5, 7, 'ci-pflasterstapel');
  else for (let z = 1.5; z < 8; z += 2.2) s += quader(x - 6, y + 1, x + 16, y + 9, z, z + 2, 'ci-holz');
  buehne.ding(x - 6, y, x + 16, y + 10, s);
}

/**
 * Luftballons am Haupteingang (Stufe 8): zwei Trauben links und rechts vor dem Vordach der Gesamtschule, an Schnüren
 * vom Boden aus, in Akzenttönen mit Glanzpunkt.
 */
function luftballons(buehne: Buehne): void {
  const y = GESAMTSCHULE.y2 + 12;
  for (const [x, versatz] of [[144, 0], [186, 2]] as const) {
    const [bx, by] = [px(x, y), py(x, y, 0)];
    const trauben: readonly [number, number, Akzent][] = [[-4.2, -30, 'beere'], [3.6, -31.5, 'sonne'], [-0.4, -36, 'lagune'], [5.4, -37.5, 'violett'], [-5.6, -38.5, 'gruen']];
    let schnur = '';
    let ballons = '';
    trauben.forEach(([dx, dy], i) => {
      const ton = (trauben[(i + versatz) % trauben.length] as [number, number, Akzent])[2];
      const cx = r1(bx + dx);
      const cy = r1(by + dy);
      schnur += `M${bx},${by - 6}L${cx},${r1(cy + 3.6)}`;
      ballons += `<ellipse class="ci-a-${ton}" cx="${cx}" cy="${cy}" rx="3" ry="3.6"/><circle class="ci-ballonglanz" cx="${r1(cx - 1)}" cy="${r1(cy - 1.3)}" r=".8"/>`;
    });
    const s = `<path class="ci-ballonschnur" d="M${bx},${by}V${by - 6}${schnur}"/>${ballons}`;
    buehne.ding(x - 1, y, x + 1, y + 1, s);
  }
}

/** Schulbus an der Haltestelle (gelb, Fensterband, Räder). */
function schulbus(buehne: Buehne, x: number, y: number): void {
  const l = 62;
  const b = 13;
  let s = quader(x, y, x + l, y + b, 2.5, 17, 'ci-gelb');
  s += pfad('ci-glas', wandL(y + b, x + 4, x + l - 10, 9.5, 15) + wandR(x + l, y + b - 1.5, y + 1.5, 9, 15.5));
  s += pfad('ci-glas ci-tuer-glas', wandL(y + b, x + l - 8, x + l - 2, 3.5, 15));
  let sp = '';
  for (let u = x + 12; u < x + l - 10; u += 8) sp += strich([u, y + b, 9.5], [u, y + b, 15]);
  s += pfad('ci-busstreifen', strich([x, y + b, 7], [x + l, y + b, 7]) + strich([x + l, y + b, 7], [x + l, y, 7])) + pfad('ci-sprosse-hell', sp);
  for (const u of [x + 12, x + l - 14]) s += `<ellipse class="ci-rad" cx="${px(u, y + b)}" cy="${py(u, y + b, 2.6)}" rx="3.6" ry="4.2"/><ellipse class="ci-nabe" cx="${px(u, y + b)}" cy="${py(u, y + b, 2.6)}" rx="1.4" ry="1.6"/>`;
  s += `<circle class="ci-scheinwerfer" cx="${px(x + l, y + b - 3)}" cy="${py(x + l, y + b - 3, 5)}" r="1.3"/>`;
  buehne.schattenQuader(x, y, x + l, y + b, 14);
  buehne.ding(x, y, x + l, y + b, s);
}

function fahrradstaender(buehne: Buehne, x: number, y: number, raeder: number): void {
  let d = '';
  for (let i = 0; i < 6; i++) d += `M${P(x + i * 5, y, 0)}L${P(x + i * 5, y, 4)}L${P(x + i * 5, y + 4, 4)}L${P(x + i * 5, y + 4, 0)}`;
  let s = pfad('ci-buegel', d);
  for (let i = 0; i < raeder; i++) {
    const u = x + i * 5 + 2.5;
    const a = AKZENTE[(i * 2 + 1) % AKZENTE.length] as Akzent;
    s += `<g class="ci-rad-fahrrad"><ellipse cx="${px(u, y - 1)}" cy="${py(u, y - 1, 3)}" rx="2.2" ry="2.8"/><ellipse cx="${px(u, y + 9)}" cy="${py(u, y + 9, 3)}" rx="2.2" ry="2.8"/></g>`;
    s += `<path class="ci-rahmen-${a}" d="M${P(u, y - 1, 3)}L${P(u, y + 4, 6)}L${P(u, y + 9, 3)}M${P(u, y + 4, 6)}L${P(u, y + 7, 7)}"/>`;
  }
  buehne.ding(x - 1, y - 2, x + 28, y + 11, s);
}

function laterne(buehne: Buehne, x: number, y: number): void {
  const [bx, by] = [px(x, y), py(x, y, 0)];
  const s = `<path class="ci-mast" d="M${bx},${by}v-24"/><rect class="ci-leuchte" x="${bx - 3}" y="${by - 26}" width="6" height="2.4" rx="1"/><ellipse class="ci-lichtkegel" cx="${bx}" cy="${by - 22}" rx="7" ry="4"/>`;
  buehne.ding(x - 1, y - 1, x + 1, y + 1, s);
}

function bank(buehne: Buehne, x: number, y: number): void {
  buehne.ding(x, y, x + 12, y + 4, quader(x, y, x + 12, y + 4, 3, 4.5, 'ci-holz') + quader(x + 1, y + 1, x + 2, y + 3, 0, 3, 'ci-dunkel') + quader(x + 10, y + 1, x + 11, y + 3, 0, 3, 'ci-dunkel'));
}

function haltestelle(buehne: Buehne, x: number, y: number): void {
  let s = quader(x, y, x + 24, y + 1.5, 0, 14, 'ci-glaswand');
  s += quader(x - 1, y - 1, x + 25, y + 7, 14, 15.5, 'ci-dunkel');
  s += quader(x + 26, y, x + 27, y + 1, 0, 18, 'ci-dunkel') + `<circle class="ci-haltezeichen" cx="${px(x + 26.5, y + 0.5)}" cy="${py(x + 26.5, y + 0.5, 20)}" r="3"/>`;
  buehne.ding(x - 1, y - 1, x + 27, y + 7, s);
}

function spielgeraet(buehne: Buehne, x: number, y: number): void {
  let s = quader(x, y, x + 12, y + 12, 0, 1, 'ci-erdefest');
  s += quader(x + 1, y + 1, x + 3, y + 3, 1, 16, 'ci-holz') + quader(x + 9, y + 1, x + 11, y + 3, 1, 16, 'ci-holz');
  s += quader(x + 1, y + 1, x + 11, y + 11, 10, 11.5, 'ci-holz');
  s += quader(x + 1, y + 9, x + 3, y + 11, 1, 16, 'ci-holz') + quader(x + 9, y + 9, x + 11, y + 11, 1, 16, 'ci-holz');
  s += `<path class="ci-dach-spiel" d="M${P(x + 1, y + 1, 16)}L${P(x + 6, y + 6, 22)}L${P(x + 11, y + 11, 16)}L${P(x + 11, y + 1, 16)}Z"/><path class="ci-dach-spiel-hell" d="M${P(x + 1, y + 1, 16)}L${P(x + 6, y + 6, 22)}L${P(x + 1, y + 11, 16)}Z"/>`;
  s += `<path class="ci-rutsche" d="M${P(x + 11, y + 6, 10)}L${P(x + 24, y + 6, 1)}"/>`;
  buehne.ding(x, y, x + 24, y + 12, s);
}

function tor(buehne: Buehne, x: number, y: number): void {
  const s = pfad('ci-tor', strich([x, y, 0], [x, y, 7]) + strich([x, y, 7], [x, y + 14, 7]) + strich([x, y + 14, 7], [x, y + 14, 0]));
  buehne.ding(x - 1, y, x + 1, y + 14, s);
}


// ------------------------------------------------------------------------------------------- Zwischenbilder (P19.3)
/** Bewehrung auf der Bodenplatte: ein Netz aus Stahlstäben. */
function bewehrung(b: Bau, z: number): string {
  let d = '';
  for (let x = b.x1 + 6; x < b.x2 - 2; x += 8) d += strich([x, b.y1 + 2, z], [x, b.y2 - 2, z]);
  for (let y = b.y1 + 6; y < b.y2 - 2; y += 8) d += strich([b.x1 + 2, y, z], [b.x2 - 2, y, z]);
  return pfad('ci-bewehrung', d);
}

/** Schalung an den sichtbaren Rändern der Bodenplatte: Bretter, von außen abgestützt. */
function schalung(b: Bau): string {
  let s = quader(b.x1 - 1.5, b.y2, b.x2 + 1.5, b.y2 + 1.5, 0, 4.5, 'ci-holz') + quader(b.x2, b.y1 - 1.5, b.x2 + 1.5, b.y2 + 1.5, 0, 4.5, 'ci-holz');
  let stuetzen = '';
  for (let x = b.x1 + 10; x < b.x2; x += 30) stuetzen += strich([x, b.y2 + 1.5, 4], [x - 4, b.y2 + 7, 0]);
  s += pfad('ci-pfosten', stuetzen);
  return s;
}

/** Nasse Planen über einem Teil der Bodenplatte, davor eine Pfütze. */
function nassePlanen(b: Bau): string {
  const z = 2.4;
  const planen = flaeche('ci-plane', [[b.x1 + 150, b.y1 + 8, z], [b.x1 + 232, b.y1 + 8, z + 0.6], [b.x1 + 232, b.y2 - 8, z], [b.x1 + 150, b.y2 - 8, z + 0.8]]);
  const falten = pfad('ci-planenfalte', strich([b.x1 + 170, b.y1 + 8, z], [b.x1 + 176, b.y2 - 8, z]) + strich([b.x1 + 196, b.y1 + 8, z], [b.x1 + 200, b.y2 - 8, z]) + strich([b.x1 + 216, b.y1 + 8, z], [b.x1 + 218, b.y2 - 8, z]));
  const pfuetze = `<ellipse class="ci-pfuetze" cx="${px(b.x1 + 190, b.y2 + 12)}" cy="${py(b.x1 + 190, b.y2 + 12, 0)}" rx="18" ry="5"/>`;
  return planen + falten + pfuetze;
}

/** Lieferwagen (P19.3): weißer Kastenwagen mit blauem Fahrerhaus. */
function lieferwagen(buehne: Buehne, x: number, y: number): void {
  let s = quader(x, y, x + 20, y + 10, 3, 5, 'ci-dunkel') + quader(x, y, x + 20, y + 10, 5, 15, 'ci-beton');
  s += quader(x + 20, y, x + 29, y + 10, 5, 12, 'ci-blau') + pfad('ci-glas', wandR(x + 29, y + 8.5, y + 1.5, 8, 11.5) + wandL(y + 10, x + 22, x + 27, 8, 11.5));
  for (const u of [x + 5, x + 23]) s += `<ellipse class="ci-rad" cx="${px(u, y + 10)}" cy="${py(u, y + 10, 2.8)}" rx="3" ry="3.5"/>`;
  buehne.schattenQuader(x, y, x + 29, y + 10, 12);
  buehne.ding(x, y, x + 29, y + 10, s);
}

/** Lichterkette (P19.3): ein durchhängendes Kabel mit kleinen Lichtern zwischen zwei Punkten in Höhe z, oben auf dem Bild. */
function lichterkette(buehne: Buehne, x1: number, y: number, x2: number, z: number): void {
  const n = 9;
  let kabel = `M${P(x1, y, z)}`;
  let punkte = '';
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const x = x1 + (x2 - x1) * t;
    const h = z - Math.sin(t * Math.PI) * 4;
    kabel += `L${P(x, y, h)}`;
    if (i < n) punkte += `<circle class="ci-lichterpunkt" cx="${px(x, y)}" cy="${py(x, y, h)}" r="1.1"/>`;
  }
  buehne.oben.push(`<path class="ci-lichterkette" d="${kabel}"/>${punkte}`);
}

/** Ausgesteckte Außenanlagen (P19.3): Pflöcke an den Ecken und Mitten des Schulhofs, dazwischen eine gespannte Schnur am Boden. */
function absteckung(buehne: Buehne): void {
  const ecken: readonly (readonly [number, number])[] = [[100, 112], [258, 112], [258, 270], [100, 270]];
  buehne.boden.push(pfad('ci-schnur', zug(ecken.map(([x, y]): V3 => [x, y, 0.3]))));
  for (const [x, y, h] of [[100, 112, 7], [258, 112, 7], [258, 270, 7], [100, 270, 7], [100, 190, 5], [258, 190, 5], [179, 112, 5], [179, 270, 5]] as const) {
    buehne.ding(x, y, x + 1, y + 1, pfad('ci-messlatte', strich([x, y, 0], [x, y, h])));
  }
}

// ------------------------------------------------------------------------------------------- Boden
/** Grasbüschel als kleine Striche, deterministisch verteilt; auf dem Baufeld nur am Rand. */
function grasTupfer(s: number): string {
  let d = '';
  for (let i = 0; i < 140; i++) {
    const x = r1(4 + streu(i, 3) * 431);
    const y = r1(4 + streu(i, 4) * 270);
    const imFeld = x > ZAUN.x1 && x < ZAUN.x2 && y > ZAUN.y1 && y < ZAUN.y2;
    if (imFeld && s >= 1 && s <= 6) continue;
    if (imFeld && s >= 6 && ((x > 96 && x < 262 && y > 108) || (x > 300 && y < 140) || (x > 26 && x < 162 && y > 144 && y < 254) || (x > 266 && y > 148 && y < 250) || (x > 36 && x < 294 && y > 30 && y < 100))) continue;
    const [a, b] = [px(x, y), py(x, y, 0)];
    d += `M${a - 1.6},${b}l.6,-1.8M${a},${b}v-2.4M${a + 1.6},${b}l-.6,-1.8`;
  }
  return d;
}

function boden(buehne: Buehne, s: number): void {
  const { x2: X, y2: Y, dicke: D } = INSEL;
  const b = buehne.boden;
  b.push(flaeche('ci-sockel-l', [[0, Y, 0], [X, Y, 0], [X, Y, -D], [0, Y, -D]]));
  b.push(flaeche('ci-sockel-r', [[X, Y, 0], [X, 0, 0], [X, 0, -D], [X, Y, -D]]));
  b.push(flaeche('ci-rasen', [[0, 0, 0], [X, 0, 0], [X, Y, 0], [0, Y, 0]]));
  // Straße mit Gehweg und Mittellinie
  b.push(flaeche('ci-pflaster', [[0, 280, 0], [X, 280, 0], [X, 290, 0], [0, 290, 0]]));
  b.push(flaeche('ci-strasse', [[0, 291, 0], [X, 291, 0], [X, Y, 0], [0, Y, 0]]));
  let linie = '';
  for (let x = 6; x < X - 10; x += 22) linie += zug([[x, 311, 0], [x + 11, 311, 0], [x + 11, 312.2, 0], [x, 312.2, 0]]);
  b.push(pfad('ci-markierung', linie));
  b.push(flaeche('ci-strasse-kante', [[0, Y, 0], [X, Y, 0], [X, Y, -2.5], [0, Y, -2.5]]));
  const { x1, y1, x2, y2 } = ZAUN;
  if (s >= 1 && s <= 6) b.push(flaeche('ci-erde', [[x1, y1, 0], [x2, y1, 0], [x2, y2, 0], [x1, y2, 0]]));
  if (s >= 1 && s <= 5) b.push(flaeche('ci-erde', [[214, y2, 0], [250, y2, 0], [250, 290, 0], [214, 290, 0]]));
  if (s >= 1 && s <= 5) {
    let spur = '';
    for (const dx of [0, 9]) spur += `M${P(226 + dx, 290)}L${P(226 + dx, 200)}Q${P(226 + dx, 150)} ${P(180 + dx, 130)}`;
    b.push(pfad('ci-fahrspur', spur));
  }
  b.push(pfad('ci-tupfer', grasTupfer(s)));
  if (s === 1) {
    // Baugrube der Gesamtschule: Sohle und die beiden hinteren Böschungen
    const g0 = { x1: 30, y1: 24, x2: 300, y2: 106 };
    const t = -14;
    b.push(flaeche('ci-grube-sohle', [[g0.x1, g0.y1, t], [g0.x2, g0.y1, t], [g0.x2, g0.y2, t], [g0.x1, g0.y2, t]]));
    b.push(flaeche('ci-grube-wand-r', [[g0.x1, g0.y1, 0], [g0.x1, g0.y2, 0], [g0.x1, g0.y2, t], [g0.x1, g0.y1, t]]));
    b.push(flaeche('ci-grube-wand-l', [[g0.x1, g0.y1, 0], [g0.x2, g0.y1, 0], [g0.x2, g0.y1, t], [g0.x1, g0.y1, t]]));
    let spur = '';
    for (let x = 60; x < 290; x += 34) spur += strich([x, 40, t], [x + 18, 92, t]);
    b.push(pfad('ci-spur', spur));
  }
  if (s >= 6) {
    // Wege und Schulhof
    const hof: V3[] = [[96, 108, 0], [262, 108, 0], [262, 274, 0], [96, 274, 0]];
    const voll = s >= 7;
    b.push(flaeche('ci-pflaster', voll ? hof : [[96, 108, 0], [262, 108, 0], [262, 190, 0], [96, 190, 0]]));
    b.push(flaeche('ci-pflaster', [[214, 190, 0], [250, 190, 0], [250, 290, 0], [214, 290, 0]]));
    b.push(flaeche('ci-pflaster', [[290, 100, 0], [304, 100, 0], [304, 150, 0], [290, 150, 0]]));
    let fugen = '';
    for (let x = 110; x < 262; x += 14) fugen += strich([x, 108, 0], [x, voll ? 274 : 190, 0]);
    b.push(pfad('ci-pflasterfuge', fugen));
    if (!voll) {
      b.push(flaeche('ci-rasen', [[20, 256, 0], [90, 256, 0], [90, 272, 0], [20, 272, 0]]));
      b.push(flaeche('ci-rasen', [[300, 20, 0], [412, 20, 0], [412, 60, 0], [300, 60, 0]]));
    } else {
      // Sportfeld mit Laufbahn
      b.push(flaeche('ci-bahn', [[304, 18, 0], [412, 18, 0], [412, 138, 0], [304, 138, 0]]));
      b.push(flaeche('ci-feld', [[312, 26, 0], [404, 26, 0], [404, 130, 0], [312, 130, 0]]));
      b.push(pfad('ci-feldlinie', zug([[316, 30, 0], [400, 30, 0], [400, 126, 0], [316, 126, 0]]).replace('Z', 'Z') + strich([358, 30, 0], [358, 126, 0])));
      b.push(`<ellipse class="ci-feldlinie" cx="${px(358, 78)}" cy="${py(358, 78, 0)}" rx="${r1(14 * C * 1.414)}" ry="${r1(14 * 0.5 * 1.414)}"/>`);
      // Sandkasten am Spielgerät der Grundschule
      b.push(flaeche('ci-sand', [[100, 206, 0], [140, 206, 0], [140, 238, 0], [100, 238, 0]]));
    }
  }
}

// ------------------------------------------------------------------------------------------- Himmel
/** Wolke als Pfad (Mittelpunkt unten, Maßstab k). */
const wolke = (cx: number, cy: number, k: number, klasse = 'ci-wolke'): string => `<path class="${klasse}" d="M${cx - 30 * k},${cy}h${60 * k}a${9 * k},${9 * k} 0 0 0 -${8 * k},-${12 * k}a${13 * k},${13 * k} 0 0 0 -${22 * k},-${8 * k}a${10 * k},${10 * k} 0 0 0 -${18 * k},${2 * k}a${8 * k},${8 * k} 0 0 0 -${12 * k},${18 * k}Z"/>`;

/**
 * Himmelsverlauf ohne id und url() (R72, wie L-229 für figuren.ts): mehrere Campus-Bilder auf einer Ansicht teilten
 * sonst eine Definition, und eine ausgeblendete nahm den anderen den Himmel. 24 waagerechte Bänder, je Band der
 * obere Ton deckend und der untere mit dem Anteil als Deckkraft darüber; die Töne kommen aus den Klassen.
 */
function verlauf(ton: string, vb: [number, number, number, number]): string {
  const [x, y, w, h] = vb;
  const n = 24;
  let s = '';
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const [a, b, f] = t < 0.55 ? [1, 2, t / 0.55] : [2, 3, (t - 0.55) / 0.45];
    const by = r1(y + (h * i) / n);
    const bh = r1(h / n + 0.6);
    s += `<rect class="ci-h-${ton}-${a}" x="${x}" y="${by}" width="${w}" height="${bh}"/>`;
    if (f > 0.02) s += `<rect class="ci-h-${ton}-${b}" x="${x}" y="${by}" width="${w}" height="${bh}" opacity="${r1(f * 100) / 100}"/>`;
  }
  return `<g class="ci-himmel">${s}</g>`;
}

function himmel(licht: Licht, jahreszeit: Jahreszeit, vb: [number, number, number, number], wetter: Wetter | null): string {
  if (wetter === 'sturm') {
    // grau, ohne Sonne, Vögel und Sterne; schwere Wolken ziehen tief
    let s = verlauf('sturm', vb);
    // tief genug, dass sie auch im beschnittenen Story-Rahmen (xMidYMid slice) zu sehen sind
    for (const [x, y, k] of [[170, -18, 1.1], [-60, -26, 0.9], [-210, 62, 0.85], [-130, 36, 0.6], [270, 40, 0.7], [345, 78, 0.8]] as const) s += wolke(x, y, k, 'ci-wolke ci-wolke-sturm');
    return s;
  }
  let s = verlauf(licht, vb);
  const sonne = { morgen: [-232, 34, 17], tag: [-196, -6, 16], abend: [292, 70, 21] }[licht] as [number, number, number];
  const [sx, sy, sr] = sonne;
  const sk = licht === 'abend' ? 'ci-sonne-abend' : 'ci-sonne';
  s += `<circle class="${sk} ci-hof" cx="${sx}" cy="${sy}" r="${sr * 2.6}"/><circle class="${sk} ci-hof" cx="${sx}" cy="${sy}" r="${sr * 1.6}"/><circle class="${sk}" cx="${sx}" cy="${sy}" r="${sr}"/>`;
  if (licht === 'tag') s += wolke(150, -22, 0.8) + wolke(-70, -14, 0.55) + wolke(318, 22, 0.5);
  if (licht === 'morgen') s += wolke(110, -20, 0.75) + wolke(282, 18, 0.5);
  if (licht === 'abend') {
    s += wolke(-150, 8, 0.65) + wolke(90, -24, 0.5);
    let sterne = '';
    for (const [a, b] of [[-262, -40], [-206, -20], [-120, -44], [-40, -30], [30, -46], [170, -38], [236, -14], [340, -40], [372, 4]] as const) sterne += `M${a},${b}m-.9,0a.9,.9 0 1 0 1.8,0a.9,.9 0 1 0 -1.8,0`;
    s += pfad('ci-stern', sterne);
  }
  if ((jahreszeit === 'fruehling' || jahreszeit === 'sommer') && licht !== 'abend') {
    let v = '';
    for (const [a, b, k] of [[-120, 20, 1], [-104, 12, 0.8], [-92, 24, 0.7]] as const) v += `M${a - 4 * k},${b - 2 * k}q${2 * k},${-2 * k} ${4 * k},0q${2 * k},${-2 * k} ${4 * k},0`;
    s += pfad('ci-vogel', v);
  }
  // P19.3: bei Regen und Schnee schieben sich dunkle Wolken ins Bild (die Sonne bleibt, wo sie steht: „Regen mit Sonne“)
  if (wetter === 'regen' || wetter === 'schnee') for (const [x, y, k] of [[-20, -8, 0.9], [210, -14, 1], [-190, 20, 0.75], [330, 40, 0.65]] as const) s += wolke(x, y, k, 'ci-wolke ci-wolke-regen');
  return s;
}

function wetterZeichen(jahreszeit: Jahreszeit, vb: [number, number, number, number], w: Wetter | null): string {
  if (w === 'sturm') {
    // Böen: schräge Striche (Schneeregen im Wind), deterministisch gestreut
    let d = '';
    for (let i = 0; i < 46; i++) {
      const x = vb[0] + ((i * 97) % 1000) / 1000 * vb[2];
      const y = vb[1] + ((i * 61 + 13) % 1000) / 1000 * vb[3] * 0.85;
      const l = 7 + (i % 4) * 2.5;
      d += `M${r1(x)},${r1(y)}l${r1(l)},${r1(l * 0.32)}`;
    }
    return pfad('ci-boe', d);
  }
  let dazu = '';
  if (w === 'regen') {
    // P19.3: Regenstriche, steil und kurz, deterministisch gestreut
    let d = '';
    for (let i = 0; i < 110; i++) {
      const x = vb[0] + ((i * 89) % 1000) / 1000 * vb[2];
      const y = vb[1] + ((i * 53 + 7) % 1000) / 1000 * vb[3] * 0.92;
      d += `M${r1(x)},${r1(y)}l-2.2,6.5`;
    }
    dazu += pfad('ci-regen', d);
  }
  if (w === 'nebel') {
    // P19.3: Nebelbänder über dem Gelände, unten dichter
    for (const [y, h, o] of [[0.4, 0.12, 0.12], [0.52, 0.14, 0.18], [0.66, 0.16, 0.24], [0.82, 0.2, 0.3]] as const) {
      dazu += `<rect class="ci-nebel" x="${vb[0]}" y="${r1(vb[1] + vb[3] * y)}" width="${vb[2]}" height="${r1(vb[3] * h)}" rx="${r1(vb[3] * h / 2)}" opacity="${o}"/>`;
    }
  }
  if (w === 'schnee') {
    let d = '';
    for (let i = 0; i < 120; i++) {
      const x = vb[0] + ((i * 83) % 1000) / 1000 * vb[2];
      const y = vb[1] + ((i * 47 + 11) % 1000) / 1000 * vb[3] * 0.92;
      const r = 0.8 + (i % 3) * 0.45;
      d += `M${r1(x)},${r1(y)}m-${r},0a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 -${2 * r},0`;
    }
    return pfad('ci-flocke', d);
  }
  if (jahreszeit === 'winter' && w === 'regen') return dazu;
  if (jahreszeit === 'winter') {
    let d = '';
    for (let i = 0; i < 70; i++) {
      const x = vb[0] + ((i * 97) % 1000) / 1000 * vb[2];
      const y = vb[1] + ((i * 61 + 13) % 1000) / 1000 * vb[3] * 0.9;
      const r = 0.8 + (i % 3) * 0.45;
      d += `M${r1(x)},${r1(y)}m-${r},0a${r},${r} 0 1 0 ${2 * r},0a${r},${r} 0 1 0 -${2 * r},0`;
    }
    return pfad('ci-flocke', d) + dazu;
  }
  if (jahreszeit === 'herbst') {
    let d = '';
    for (let i = 0; i < 16; i++) {
      const x = -180 + ((i * 137) % 520);
      const y = 40 + ((i * 53) % 190);
      d += `M${x},${y}q2,-2.4 4.4,0q-2.2,2.4 -4.4,0Z`;
    }
    return pfad('ci-blatt', d) + dazu;
  }
  return dazu;
}

// ------------------------------------------------------------------------------------------- Stufen
const jahreszeitBlueht = (j: Jahreszeit): boolean => j === 'fruehling' || j === 'sommer';

/** Wiesenblumen auf dem leeren Grundstück (Stufe 0), deterministisch gestreut, in drei Akzenttönen. */
function wiesenblumen(): string {
  const d: string[] = ['', '', ''];
  for (let i = 0; i < 90; i++) {
    const x = r1(ZAUN.x1 + 8 + streu(i, 1) * (ZAUN.x2 - ZAUN.x1 - 16));
    const y = r1(ZAUN.y1 + 8 + streu(i, 2) * (ZAUN.y2 - ZAUN.y1 - 16));
    d[i % 3] += `M${px(x, y)},${py(x, y, 0)}m-1.1,0a1.1,.8 0 1 0 2.2,0a1.1,.8 0 1 0 -2.2,0`;
  }
  return pfad('ci-blume ci-a-sonne', d[0] ?? '') + pfad('ci-blume ci-a-beere', d[1] ?? '') + pfad('ci-blume ci-blume-weiss', d[2] ?? '');
}

const BESTAND: readonly [number, number, 'laub' | 'nadel'][] = [
  [430, 30, 'nadel'], [431, 92, 'laub'], [430, 158, 'laub'], [432, 220, 'nadel'], [430, 262, 'laub'],
  [4, 30, 'laub'], [5, 120, 'nadel'], [70, 4, 'laub'], [200, 4, 'nadel'], [330, 4, 'laub'],
];
const NEUE_BAEUME: readonly [number, number][] = [
  [30, 284], [80, 284], [130, 284], [270, 284], [320, 284], [370, 284],
  [110, 122], [200, 122], [246, 168], [176, 254], [296, 262], [404, 150], [404, 250],
];

function szene(buehne: Buehne, s: number, halleOffen = false): void {
  boden(buehne, s);
  BESTAND.forEach(([x, y, art], i) => baum(buehne, x, y, art, i, art === 'nadel' ? 1 : 1.05));
  if (s <= 6) bauzaun(buehne, s === 2);
  if (s <= 5) bauschild(buehne);
  // R75: der kleine Baucontainer aus Kapitel 1 steht schon auf dem leeren Grundstück
  if (s === 0) container(buehne, 370, 252);
  if (s >= 1 && s <= 5) { container(buehne, 334, 252); container(buehne, 334, 252, 12); container(buehne, 370, 252); toilette(buehne, 318, 258); }

  const gs = GESAMTSCHULE;
  const gsH = hoehe(gs);
  if (s >= 2) buehne.schattenQuader(gs.x1, gs.y1, gs.x2, gs.y2, s < 3 ? GH : gsH);
  if (s >= 4) buehne.schattenQuader(SPORTHALLE.x1, SPORTHALLE.y1, SPORTHALLE.x2, SPORTHALLE.y2, SH_HOEHE);
  if (s >= 5) { buehne.schattenQuader(GRUNDSCHULE_A.x1, GRUNDSCHULE_A.y1, GRUNDSCHULE_A.x2, GRUNDSCHULE_A.y2, 32); buehne.schattenQuader(GRUNDSCHULE_B.x1, GRUNDSCHULE_B.y1, GRUNDSCHULE_B.x2, GRUNDSCHULE_B.y2, 32); }

  // Stufe 0: Vermessung
  if (s === 0) {
    let d = '';
    for (const [x, y] of [[40, 34], [290, 34], [290, 96], [40, 96]] as const) d += strich([x, y, 0], [x, y, 9]);
    buehne.ding(40, 34, 290, 96, pfad('ci-messlatte', d) + pfad('ci-schnur', zug([[40, 34, 1], [290, 34, 1], [290, 96, 1], [40, 96, 1]])));
    figur(buehne, 200, 140, 'erwachsen', 'lagune', 1);
    // Messgerät auf dem Dreibein
    buehne.ding(206, 136, 210, 140, pfad('ci-pfosten', strich([208, 138, 0], [208, 138, 10]) + strich([205, 136, 0], [208, 138, 10]) + strich([211, 139, 0], [208, 138, 10])) + quader(206.5, 136.5, 209.5, 139.5, 10, 13, 'ci-gelb'));
  }
  if (s === 0 && jahreszeitBlueht(buehne.jahreszeit)) buehne.boden.push(wiesenblumen());
  if (s === 1) {
    bagger(buehne, 120, 60, -14);
    erdhaufen(buehne, 330, 70, 22);
    erdhaufen(buehne, 352, 104, 15);
    lkw(buehne, 270, 132, 'kipper');
    figur(buehne, 90, 112, 'arbeiter', 'orange', 0);
    figur(buehne, 236, 118, 'arbeiter', 'orange', 2);
  }
  if (s === 2) {
    buehne.ding(gs.x1, gs.y1, gs.x2, gs.y2, ersteWaende(gs, 170));
    // R74: niedriger und mit kürzerem Ausleger, damit der Kran auch im breiten Story-Rahmen (xMidYMid slice) ganz im Bild ist
    kran(buehne, 186, 124, 'y', 74, { a: 84, z: 34, holz: false }, 96);
    erdhaufen(buehne, 340, 74, 16);
    lkw(buehne, 120, 120, 'mischer');
    stapel(buehne, 300, 120, 'ci-holz');
    stapel(buehne, 320, 160, 'ci-beton');
    figur(buehne, 120, 112, 'arbeiter', 'orange', 1);
    figur(buehne, 230, 128, 'arbeiter', 'orange', 0);
    figur(buehne, 250, 116, 'arbeiter', 'orange', 2);
  }
  if (s === 3) {
    const roh = rohbau(gs, 3);
    buehne.ding(gs.x1, gs.y1, gs.x2 + 4, gs.y2 + 4, roh + holzFassade(gs, 0, 2 * GH) + fenster(gs, 0, 2 * GH) + holzFassade(gs, 2 * GH, gsH, 160) + fenster(gs, 2 * GH, gsH, 160) + geruest(gs, gsH, 168, true));
    kran(buehne, 186, 124, 'y', 74, { a: 84, z: 62, holz: true }, 96);
    palette(buehne, 306, 112, 'holz');
    palette(buehne, 330, 140, 'holz');
    stapel(buehne, 80, 140, 'ci-beton');
    figur(buehne, 150, 118, 'arbeiter', 'orange', 0);
    figur(buehne, 262, 132, 'arbeiter', 'orange', 1);
  }
  // ---- Zwischenbilder (P19.3)
  if (s === 1.5) {
    // Bodenplatte in Schalung und Bewehrung unter nassen Planen; ein Kran, noch keine Holzstapel
    buehne.ding(gs.x1, gs.y1, gs.x2 + 2, gs.y2 + 2, quader(gs.x1, gs.y1, gs.x2, gs.y2, 0, 1.5, 'ci-beton') + bewehrung(gs, 1.7) + schalung(gs) + nassePlanen(gs));
    kran(buehne, 186, 124, 'y', 74, { a: 84, z: 30, holz: false }, 96);
    stapel(buehne, 320, 160, 'ci-beton');
    lkw(buehne, 120, 120, 'mischer');
    figur(buehne, 120, 112, 'arbeiter', 'orange', 1);
    figur(buehne, 236, 128, 'arbeiter', 'orange', 0);
  }
  if (s === 2.5) {
    // Erdgeschoss steht (mit Decke); vorn die Container der Schule mit erleuchteten Fenstern und Fahrrädern
    buehne.ding(gs.x1, gs.y1, gs.x2, gs.y2, rohbau(gs, 1, 120));
    kran(buehne, 186, 124, 'y', 74, { a: 84, z: 40, holz: false }, 96);
    container(buehne, 44, 208, 0, true);
    container(buehne, 80, 208, 0, true);
    fahrradstaender(buehne, 50, 226, 4);
    figur(buehne, 124, 232, 'kind', 'beere', 1);
    figur(buehne, 130, 238, 'kind', 'lagune', 2);
    figur(buehne, 150, 116, 'arbeiter', 'orange', 0);
    // tagsüber liefert ein Wagen am Tor (Einfahrt im Zaun)
    if (buehne.licht !== 'abend') lieferwagen(buehne, 216, 258);
  }
  if (s === 3.5) {
    // Holzbau unter Dach, die Sporthalle erst als Bodenplatte, Lichterkette am Baucontainer
    buehne.ding(gs.x1, gs.y1, gs.x2 + 4, gs.y2 + 4, fertigerBau(gs) + geruest(gs, gsH, 200, true));
    buehne.ding(SPORTHALLE.x1, SPORTHALLE.y1, SPORTHALLE.x2, SPORTHALLE.y2, quader(SPORTHALLE.x1, SPORTHALLE.y1, SPORTHALLE.x2, SPORTHALLE.y2, 0, 1.5, 'ci-beton'));
    lichterkette(buehne, 330, 270, 366, 16);
    palette(buehne, 232, 236, 'holz');
    figur(buehne, 300, 258, 'arbeiter', 'orange', 1);
  }
  if (s === 4.5) {
    // Gesamtschule außen fertig, Dach der Sporthalle geschlossen (noch Gerüst), Grundschule beginnt
    buehne.ding(SPORTHALLE.x1, SPORTHALLE.y1, SPORTHALLE.x2 + 4, SPORTHALLE.y2 + 4, sporthalleFertig() + geruest(SPORTHALLE, SH_HOEHE, SPORTHALLE.x1, true));
    buehne.ding(GRUNDSCHULE_A.x1, GRUNDSCHULE_A.y1, GRUNDSCHULE_A.x2, GRUNDSCHULE_A.y2, ersteWaende(GRUNDSCHULE_A, 90));
    buehne.ding(GRUNDSCHULE_B.x1, GRUNDSCHULE_B.y1, GRUNDSCHULE_B.x2, GRUNDSCHULE_B.y2, quader(GRUNDSCHULE_B.x1, GRUNDSCHULE_B.y1, GRUNDSCHULE_B.x2, GRUNDSCHULE_B.y2, 0, 1.5, 'ci-beton'));
    kran(buehne, 122, 222, 'y', 130, { a: 168, z: 30, holz: false }, 146);
    figur(buehne, 170, 214, 'arbeiter', 'orange', 0);
    figur(buehne, 100, 258, 'arbeiter', 'orange', 2);
  }
  if (s === 5.5) {
    // alle drei Gebäude außen fertig, Handwerkercontainer, Außenanlagen abgesteckt
    const bunt: readonly Akzent[] = ['sonne', 'beere', 'lagune', 'blau', 'gruen'];
    buehne.ding(GRUNDSCHULE_A.x1, GRUNDSCHULE_A.y1, GRUNDSCHULE_A.x2, GRUNDSCHULE_A.y2, fertigerBau(GRUNDSCHULE_A, bunt));
    buehne.ding(GRUNDSCHULE_B.x1, GRUNDSCHULE_B.y1, GRUNDSCHULE_B.x2, GRUNDSCHULE_B.y2, fertigerBau(GRUNDSCHULE_B, bunt));
    container(buehne, 334, 252);
    container(buehne, 334, 252, 12);
    container(buehne, 370, 252);
    absteckung(buehne);
    figur(buehne, 196, 196, 'arbeiter', 'orange', 0);
  }
  if (s >= 4) buehne.ding(gs.x1, gs.y1, gs.x2, gs.y2 + 10, fertigerBau(gs) + eingangGesamtschule() + solar(gs, gsH));
  if (s === 4) {
    buehne.ding(SPORTHALLE.x1, SPORTHALLE.y1, SPORTHALLE.x2 + 4, SPORTHALLE.y2 + 4, sporthalleTragwerk() + geruest(SPORTHALLE, SH_HOEHE, SPORTHALLE.x1, true) + (buehne.sturm ? planen() : ''));
    kran(buehne, 252, 214, 'x', 392, { a: 336, z: 50, holz: true }, 150);
    figur(buehne, 300, 258, 'arbeiter', 'orange', 1);
    figur(buehne, 262, 160, 'arbeiter', 'orange', 2);
    palette(buehne, 232, 236, 'holz');
  }
  if (s >= 5 && halleOffen) buehne.ding(SPORTHALLE.x1, SPORTHALLE.y1, SPORTHALLE.x2 + 4, SPORTHALLE.y2 + 4, sporthalleTragwerk() + geruest(SPORTHALLE, SH_HOEHE, SPORTHALLE.x1, true));
  else if (s >= 5) buehne.ding(SPORTHALLE.x1, SPORTHALLE.y1, SPORTHALLE.x2, SPORTHALLE.y2, sporthalleFertig());
  if (s === 5) {
    buehne.ding(GRUNDSCHULE_A.x1, GRUNDSCHULE_A.y1, GRUNDSCHULE_A.x2 + 4, GRUNDSCHULE_A.y2, rohbau(GRUNDSCHULE_A, 2) + geruest(GRUNDSCHULE_A, 32, 80, true));
    buehne.ding(GRUNDSCHULE_B.x1, GRUNDSCHULE_B.y1, GRUNDSCHULE_B.x2 + 4, GRUNDSCHULE_B.y2 + 4, rohbau(GRUNDSCHULE_B, 1, 80) + geruest(GRUNDSCHULE_B, 16, 30, true));
    kran(buehne, 122, 222, 'y', 130, { a: 168, z: 46, holz: false }, 146);
    figur(buehne, 170, 214, 'arbeiter', 'orange', 0);
    figur(buehne, 100, 258, 'arbeiter', 'orange', 2);
  }
  const farbig: readonly Akzent[] = ['sonne', 'beere', 'lagune', 'blau', 'gruen'];
  if (s >= 6) {
    buehne.ding(GRUNDSCHULE_A.x1, GRUNDSCHULE_A.y1, GRUNDSCHULE_A.x2, GRUNDSCHULE_A.y2, fertigerBau(GRUNDSCHULE_A, farbig));
    buehne.ding(GRUNDSCHULE_B.x1, GRUNDSCHULE_B.y1, GRUNDSCHULE_B.x2, GRUNDSCHULE_B.y2, fertigerBau(GRUNDSCHULE_B, farbig));
  }
  if (s === 6) {
    walze(buehne, 150, 220);
    palette(buehne, 226, 214, 'pflaster');
    palette(buehne, 240, 228, 'pflaster');
    NEUE_BAEUME.slice(0, 9).forEach(([x, y], i) => baum(buehne, x, y, 'jung', i));
    figur(buehne, 120, 150 - 40, 'arbeiter', 'orange', 1);
    figur(buehne, 196, 196, 'arbeiter', 'orange', 0);
    figur(buehne, 256, 120, 'arbeiter', 'orange', 2);
  }
  if (s >= 7) {
    NEUE_BAEUME.forEach(([x, y], i) => baum(buehne, x, y, i % 5 === 3 ? 'nadel' : 'laub', i + 1, i < 6 ? 0.8 : 0.9));
    fahrradstaender(buehne, 176, 226, s === 8 ? 5 : 0);
    fahrradstaender(buehne, 176, 240, s === 8 ? 3 : 0);
    spielgeraet(buehne, 108, 214);
    bank(buehne, 168, 140);
    bank(buehne, 228, 148);
    for (const [x, y] of [[100, 270], [200, 270], [262, 200], [262, 120]] as const) laterne(buehne, x, y);
    tor(buehne, 314, 71);
    tor(buehne, 402, 71);
    haltestelle(buehne, 150, 282);
  }
  if (s === 8) {
    schulbus(buehne, 64, 294);
    const kinder: readonly [number, number][] = [
      [140, 278], [146, 284], [156, 276], [118, 270], [226, 262], [234, 270], [222, 240], [196, 170], [204, 176],
      [186, 140], [150, 132], [158, 138], [244, 210], [120, 196], [128, 200], [228, 128], [340, 60], [350, 92],
      [372, 76], [330, 104], [168, 112], [176, 110], [240, 284],
    ];
    kinder.forEach(([x, y], i) => figur(buehne, x, y, 'kind', AKZENTE[i % AKZENTE.length] as Akzent, i));
    figur(buehne, 162, 102, 'erwachsen', 'violett', 4);
    figur(buehne, 210, 252, 'erwachsen', 'lagune', 5);
    figur(buehne, 132, 288, 'erwachsen', 'blau', 3);
    luftballons(buehne);
  }
  if (s === 7) figur(buehne, 166, 104, 'erwachsen', 'lagune', 2);
}

/** Beschreibung je Stufe, Jahreszeit und Licht (deutsch, für `aria-label` und `<title>`). */
export function campusIsoText(stufe: number, jahreszeit: Jahreszeit = 'sommer', licht: Licht = 'tag', wetter?: Wetter, halleOffen = false): string {
  const s = campusStufe(stufe);
  const halle = halleOffen && s >= 5 ? ' Nur die Sporthalle ist noch nicht fertig und steht eingerüstet.' : '';
  const stufenText = s % 1 === 0 ? STUFEN_TEXT[s] ?? '' : `${ZWISCHEN_TEXT[s] ?? ''}${s === 2.5 && licht !== 'abend' ? ' Ein Lieferwagen steht am Tor.' : ''}`;
  return `Schulcampus Lindenhall-Süd (fiktiver Fall): ${stufenText}${halle} ${JAHRESZEIT_TEXT[jahreszeit]}, ${LICHT_TEXT[licht]}.${wetter ? ` ${WETTER_TEXT[wetter]}` : ''}`;
}

/**
 * Der Campus als isometrische Illustration. Stufe 0 Grundstück mit Bauzaun · 1 Baugrube · 2 Bodenplatte und erste Wände ·
 * 3 Holzbau · 4 Sporthalle im Bau · 5 Grundschule im Bau · 6 Außenanlagen · 7 fertig · 8 fertig mit Kindern; dazu die
 * Zwischenstufen 1,5 · 2,5 · 3,5 · 4,5 · 5,5 (P19.3) und das Wetter (`sturm`, `regen`, `schnee`, `nebel`).
 */
export function campusIso(stufe: number, optionen: CampusIsoOptionen = {}): string {
  const s = campusStufe(stufe);
  const jahreszeit = optionen.jahreszeit ?? 'sommer';
  const licht = optionen.licht ?? 'tag';
  const wetter = optionen.wetter ?? null;
  const buehne = new Buehne(licht, jahreszeit, wetter);
  const halleOffen = optionen.halleOffen === true && s >= 5;
  szene(buehne, s, halleOffen);
  const vb: [number, number, number, number] = [...CAMPUS_VB[optionen.ausschnitt ?? 'grund']];
  const text = campusIsoText(s, jahreszeit, licht, optionen.wetter, halleOffen);
  const teile: string[] = [];
  if (optionen.himmel !== false) teile.push(himmel(licht, jahreszeit, vb, wetter));
  teile.push('<g class="ci-szene">', ...buehne.boden);
  // Schatten nur auf der Insel (sonst schwebten sie am Rand im Himmel) – beschnitten im Grundriss, ohne clipPath
  let schatten = '';
  for (const poly of buehne.schatten) {
    const innen = beschneide(poly, INSEL.x2, INSEL.y2);
    if (innen.length >= 2) schatten += `M${innen.map(([x, y]) => P(x, y)).join('L')}Z`;
  }
  teile.push(pfad('ci-schatten', schatten));
  for (const d of sortiere(buehne.dinge)) teile.push(d.svg);
  teile.push(...buehne.oben, '</g>', wetterZeichen(jahreszeit, vb, wetter));
  const klasse = ['campus-iso', optionen.klasse].filter(Boolean).join(' ');
  const wetterAttr = wetter !== null ? ` data-wetter="${wetter}"` : '';
  return `<svg class="${klasse}" viewBox="${vb.join(' ')}" role="img" aria-label="${text}" data-stufe="${s}" data-jahreszeit="${jahreszeit}" data-licht="${licht}"${wetterAttr}${halleOffen ? ' data-halle="offen"' : ''} xmlns="http://www.w3.org/2000/svg"><title>${text}</title>${teile.join('')}</svg>`;
}
