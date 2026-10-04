/*
 * Figuren und Gegenstände der Story (O-51, O-53, P17.3): die Porträts der fünf Figuren und der Spielfigur „Sie“
 * sowie kleine Gegenstands-Grafiken für die Szenen (docs/DREHBUCH.md, Abschnitte 2 und 7). Rein (Zeichenketten),
 * deterministisch (kein Zufall, keine Uhr), ohne externe Ressourcen und ohne Farbwerte: Farben nur über Klassen
 * aus src/stil/grafik.css, die Werte stehen in tokens.css (`--fig-*`, `--akzent-*`, Marke).
 *
 *   portraet(figur, { groesse, stimmung, dekorativ })  – Brustbild im Dreiviertelprofil auf rundem Farbfeld
 *   gimmick(name, { groesse, dekorativ })               – Gegenstand der Grafik-Liste, flach, ~64–120 px
 *
 * Porträt: Zeichenfläche 200 × 200, Rundbild Mitte (100, 100), Halbmesser 96. Alles, was unten aus dem Bild
 * ragt (Schultern, Ärmel, Schal), endet mit einem Bogen auf dem Rand – so braucht das Rundbild keinen Clip-Pfad
 * (der in ausgeblendeten SVGs versagt) und keine Kennungen. Das Gesicht schaut nach rechts (zur Sprechblase).
 */
import type { Akzent } from '../stil/akzente.ts';

export const FIGUREN = ['sie', 'grundstein', 'faden', 'schwung', 'klingel', 'lot'] as const;
export type Figur = (typeof FIGUREN)[number];
/**
 * Nebenfiguren (P19.6, O-62): eigene Liste, nicht in `FIGUREN` (sonst erscheinen sie in den Schleifen des Auftakts und der Startseite). Sie
 * haben ein Porträt wie die Hauptfiguren, nur etwas einfacher gezeichnet; die beiden Stimmen (Vergabestelle am Telefon, Vertretung der
 * Projektsteuerin) haben statt eines Gesichts einen Umriss mit Sprechlinien.
 */
export const NEBENFIGUREN = ['ranzen', 'spitzfeder', 'pfennig'] as const;
export type Nebenfigur = (typeof NEBENFIGUREN)[number];
export const STIMMEN = ['vergabestelle', 'vertretung'] as const;
export type Stimme = (typeof STIMMEN)[number];
/** Alle, die in einer Szene sprechen können (`Zeile.figur`): Hauptfiguren ohne „sie“, Nebenfiguren, Stimmen. */
export type Sprecher = Exclude<Figur, 'sie'> | Nebenfigur | Stimme;
export type Stimmung = 'neutral' | 'froh' | 'besorgt';

/** Figurenton (STIL.md, L-226): Kleidung und Farbfeld; „Sie“ trägt die Marke (Navy mit goldenem Helm). */
export const FIGUR_AKZENT: Record<Exclude<Figur, 'sie'>, Akzent> = {
  grundstein: 'violett',
  faden: 'lagune',
  schwung: 'blau',
  klingel: 'orange',
  lot: 'sonne',
};

/** Ton der Nebenfiguren: Ranzen grün, Pfennig beere; der Reporter hat keinen Akzent (Papierton, `fig-ton-keiner`), ebenso die Stimmen. */
export const NEBENFIGUR_AKZENT: Record<Nebenfigur, Akzent | 'keiner'> = { ranzen: 'gruen', spitzfeder: 'keiner', pfennig: 'beere' };

/** Sichtbarer Name und Rolle (Steckbrief, Bildbeschreibung). */
export const FIGUR_NAME: Record<Figur, { name: string; rolle: string }> = {
  sie: { name: 'Sie', rolle: 'Projektleitung des Bauherrn' },
  grundstein: { name: 'Gisela Grundstein', rolle: 'Bürgermeisterin' },
  faden: { name: 'Clara Faden', rolle: 'Projektsteuerin' },
  schwung: { name: 'Konrad Schwung', rolle: 'Architekt' },
  klingel: { name: 'Hanna Klingel', rolle: 'Schulleiterin' },
  lot: { name: 'Theo Lot', rolle: 'Bauleiter' },
};

/** Name und Rolle aller Sprecher: die Hauptfiguren, die Nebenfiguren (Namen und Rollen des Drehbuchs) und die beiden Stimmen. */
export const SPRECHER_NAME: Record<Sprecher, { name: string; rolle: string }> = {
  grundstein: FIGUR_NAME.grundstein, faden: FIGUR_NAME.faden, schwung: FIGUR_NAME.schwung, klingel: FIGUR_NAME.klingel, lot: FIGUR_NAME.lot,
  ranzen: { name: 'Marlene Ranzen', rolle: 'Elternvertreterin' },
  spitzfeder: { name: 'Bernd Spitzfeder', rolle: 'Lokalreporter' },
  pfennig: { name: 'Ewald Pfennig', rolle: 'Stadtrat im Finanzausschuss' },
  vergabestelle: { name: 'Vergabestelle', rolle: 'Vergabestelle der Stadt' },
  vertretung: { name: 'Vertretung', rolle: 'Vertretung der Projektsteuerin' },
};

const BILD_TEXT: Record<Figur | Nebenfigur | Stimme, string> = {
  sie: 'Sie, die Projektleitung des Bauherrn, von schräg hinten: dunkle Jacke, eine Mappe in der Hand, den goldenen Bauhelm unter dem Arm.',
  grundstein: 'Gisela Grundstein, Bürgermeisterin: silbergrauer Bob, große runde Brille mit goldenem Rand, Blazer mit einem kleinen Lindenblatt am Revers.',
  faden: 'Clara Faden, Projektsteuerin: dunkles Haar zum tiefen Zopf, Pullover, Notizbuch mit rotem Lesebändchen und Tablet im Arm.',
  schwung: 'Konrad Schwung, Architekt: graue Locken, runde schwarze Brille, schwarzer Rollkragen, langer orangefarbener Schal und ein Zeichenstift hinter dem Ohr.',
  klingel: 'Hanna Klingel, Schulleiterin: rotbraunes Haar hochgesteckt, Strickjacke, bunte Kette und eine kleine Handglocke aus Messing.',
  lot: 'Theo Lot, Bauleiter: grauer Schnurrbart, weißer Helm, Warnweste über kariertem Hemd und ein gelber Zollstock in der Brusttasche.',
  ranzen: 'Marlene Ranzen, Elternvertreterin: dunkle Locken im Dutt, grasgrüne Regenjacke, Schlüsselband mit bunten Anhängern und ein Klemmbrett mit Fragenliste.',
  spitzfeder: 'Bernd Spitzfeder, Lokalreporter: sandfarbener Trenchcoat, graublaue Schiebermütze mit Bleistift im Mützenband und ein Notizblock mit Gummiband.',
  pfennig: 'Ewald Pfennig, Stadtrat: schmal, grauer Nadelstreifenanzug, Lesebrille auf der Nase, blauer Ordner unter dem Arm und eine Taschenuhr mit Kette.',
  vergabestelle: 'Die Vergabestelle der Stadt am Telefon: kein Gesicht, nur ein Umriss mit dem Hörer am Ohr und drei Sprechlinien.',
  vertretung: 'Die Vertretung der Projektsteuerin: kein Gesicht, nur ein Umriss mit drei Sprechlinien.',
};
const STIMMUNG_TEXT: Record<Stimmung, string> = { neutral: '', froh: ' Sie lacht.', besorgt: ' Sie schaut besorgt.' };
const STIMMUNG_TEXT_ER: Record<Stimmung, string> = { neutral: '', froh: ' Er lacht.', besorgt: ' Er schaut besorgt.' };

export interface PortraetOptionen {
  /** Kantenlänge in px oder Stufe: klein 56 (Avatar), gross 200 (Steckbrief). Unter 100 px fallen feine Details weg. */
  groesse?: 'klein' | 'gross' | number;
  stimmung?: Stimmung;
  /** Nur Schmuck neben Name und Text: `aria-hidden`, ohne `<title>` (Drehbuch Abschnitt 7). */
  dekorativ?: boolean;
  /** Zusätzliche Klasse am `<svg>`. */
  klasse?: string;
}

// ------------------------------------------------------------------------------------------- Bausteine
const r1 = (n: number): number => Math.round(n * 10) / 10;
/** Rundbild in Bildkoordinaten: Mitte (100, 100), Halbmesser 96. */
const R_BILD = 96;
/** Die Figur wird vergrößert ins Rundbild gesetzt (Kopf groß genug für den Avatar). */
const FIG_S = 1.15;
const FIG_TX = -19.9;
const FIG_TY = -6.9;
/** Rundbild in Figurkoordinaten. */
const MX = (100 - FIG_TX) / FIG_S;
const MY = (100 - FIG_TY) / FIG_S;
const R = R_BILD / FIG_S;
/** Unterer Rand des Rundbilds bei x (Figurkoordinaten). */
const yk = (x: number): number => r1(MY + Math.sqrt(Math.max(0, R * R - (x - MX) ** 2)));
/** Linker Rand des Rundbilds bei y. */
const xl = (y: number): number => r1(MX - Math.sqrt(Math.max(0, R * R - (y - MY) ** 2)));
/** Rechter Rand des Rundbilds bei y. */
const xr = (y: number): number => r1(MX + Math.sqrt(Math.max(0, R * R - (y - MY) ** 2)));
/** Senkrechter Strich bei x von y1 bis knapp über den unteren Rand. */
const bisRand = (x: number, y1: number, abstand = 2): string => `M${x},${y1}L${x},${r1(yk(x) - abstand)}`;

const pf = (k: string, d: string): string => `<path class="${k}" d="${d}"/>`;
const kr = (k: string, cx: number, cy: number, r: number): string => `<circle class="${k}" cx="${cx}" cy="${cy}" r="${r}"/>`;
const el = (k: string, cx: number, cy: number, rx: number, ry: number, dreh = 0): string =>
  `<ellipse class="${k}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${dreh ? ` transform="rotate(${dreh} ${cx} ${cy})"` : ''}/>`;
const re = (k: string, x: number, y: number, b: number, h: number, rund = 0): string =>
  `<rect class="${k}" x="${x}" y="${y}" width="${b}" height="${h}"${rund ? ` rx="${rund}"` : ''}/>`;
const tr = (x: number, y: number, dreh: number, inhalt: string): string => `<g transform="translate(${x} ${y}) rotate(${dreh})">${inhalt}</g>`;
const gr = (inhalt: string, dreh: [number, number, number]): string => `<g transform="rotate(${dreh.join(' ')})">${inhalt}</g>`;

/**
 * Fläche, die unten im Rand endet: beginnt auf dem Rand bei x1, folgt `weg` (absolute Befehle) und kehrt bei x2
 * (x2 > x1) auf den Rand zurück; der Bogen schließt sie entlang des Rundbilds.
 */
const unten = (k: string, x1: number, weg: string, x2: number): string =>
  pf(k, `M${x1},${yk(x1)}${weg}L${x2},${yk(x2)}A${r1(R)},${r1(R)} 0 0 1 ${x1},${yk(x1)}Z`);

/** Schultern in Grundform: von Rand zu Rand, Halsansatz zwischen 90 und 118. */
const SCHULTERN = 'C42,138 50,136.5 62,135.5C74,134.5 84,133 91,131L117,131C124,133 134,134.5 146,135.5C158,136.5 166,138 172,141.7';
const SCH_X1 = 36;
const SCH_X2 = 172;

/** Armlöcher: zwei leise Nähte, die knapp über dem Rand enden. */
const naehte = (): string => pf('fig-naht', `M58,138C59,146 60,152 60,${r1(yk(60) - 2)}M150,138C149,146 148,152 148,${r1(yk(148) - 2)}`);

// ------------------------------------------------------------------------------------------- Gesicht
interface Kopf {
  /** Hautton 1–4 (hell bis dunkel). */
  haut: 1 | 2 | 3 | 4;
  haar: 'silber' | 'dunkel' | 'grau' | 'rot' | 'braun' | 'weiss';
}

const GESICHT = 'M80,80C80,60 93,49 107,49C122,49 132,61 132,79C132,92 130,103 125,111C120,119 113,124 107,124C97,124 88,118 84,108C81,100 80,90 80,80Z';
const HALS = 'M91,104L91,134C97,139 111,139 117,134L117,108Z';
const HALS_SCHATTEN = 'M91,112C97,122 108,126 117,120L117,129C108,133 97,131 91,126Z';

function hals(): string {
  return pf('fig-haut', HALS) + pf('fig-haut-s', HALS_SCHATTEN);
}

/** Ohr links, Gesichtsfläche, Wangenschatten. */
function gesichtsflaeche(ohr = true): string {
  return (ohr ? el('fig-haut', 81, 90, 6, 9) + pf('fig-haut-s fig-strich-fein', 'M81.5,85Q77.5,90 81.5,95') : '')
    + pf('fig-haut', GESICHT)
    // Schatten der abgewandten Seite (links, unter dem Ohr) für etwas Tiefe
    + pf('fig-haut-s fig-hauch', 'M84,96C85,108 92,118 102,122C93,121 86,114 83,104Z');
}

/** Augen, Brauen, Nase, Mund, Wangen in der gewählten Stimmung. */
function zuege(stimmung: Stimmung, fein: boolean, optionen: { brauenDick?: boolean; mund?: boolean } = {}): string {
  const teile: string[] = [];
  const braue = optionen.brauenDick ? 'fig-braue fig-braue-dick' : 'fig-braue';
  if (stimmung === 'besorgt') {
    teile.push(pf(braue, 'M94,80Q100,79 106,75'), pf(braue, 'M116,75Q121,77 126,80'));
  } else if (stimmung === 'froh') {
    teile.push(pf(braue, 'M94,78Q100,73 106,76'), pf(braue, 'M116,75Q121,72 126,75'));
  } else {
    teile.push(pf(braue, 'M94,79Q100,75 106,77'), pf(braue, 'M116,76Q121,74 126,76'));
  }
  if (stimmung === 'froh') {
    teile.push(pf('fig-lid', 'M96.5,89.5Q100.5,85 104.5,89.5'), pf('fig-lid', 'M117.5,88.5Q121,84.5 124.5,88.5'));
  } else {
    teile.push(el('fig-auge', 100.5, 89, 3.1, 3.7), el('fig-auge', 121, 88.2, 2.7, 3.5));
    if (fein) teile.push(kr('fig-glanz', 101.6, 87.6, 1), kr('fig-glanz', 121.9, 86.9, 0.9));
  }
  // Nase: weicher Bogen zur rechten Seite hin
  teile.push(pf('fig-nase', 'M121,92C124,97 127,100 124.5,102.5C123,103.5 121,103 119.5,102'));
  if (optionen.mund !== false) {
    if (stimmung === 'froh') {
      teile.push(pf('fig-mund', 'M104,108.5Q113,120 122.5,107.5Q113,111.5 104,108.5Z'));
      if (fein) teile.push(pf('fig-zahn', 'M106.5,109.6Q113,112 120.5,109Q119.8,111 118.5,111.6Q112.5,113 107.6,111.2Z'));
    } else if (stimmung === 'besorgt') {
      teile.push(pf('fig-mund-linie', 'M106,113Q110,109.5 114,110.5Q118,111.5 120,113'));
    } else {
      teile.push(pf('fig-mund-linie', 'M106,110Q113,114.5 120.5,109'));
    }
  }
  teile.push(kr('fig-wange', 98, 102, 6), kr('fig-wange', 124, 101, 3.6));
  return teile.join('');
}

// ------------------------------------------------------------------------------------------- Figuren
type Zeichner = (stimmung: Stimmung, fein: boolean) => { kopf: Kopf; svg: string };

/** Gisela Grundstein: silbergrauer Bob, große runde Brille mit Goldrand, Blazer, Lindenblatt am Revers. */
const grundstein: Zeichner = (stimmung, fein) => {
  const kopf: Kopf = { haut: 1, haar: 'silber' };
  const t: string[] = [];
  // Bob hinten (rahmt Gesicht und Hals)
  t.push(pf('fig-haar', 'M74,112C66,84 74,45 107,43C137,41 147,68 140,98C138,108 135,116 131,122L84,122C79,120 76,117 74,112Z'));
  t.push(pf('fig-haar-s', 'M88,122L122,122L120,112L90,112Z'));
  t.push(hals());
  // Blazer
  t.push(unten('fig-kleid', SCH_X1, SCHULTERN, SCH_X2));
  // Bluse im Ausschnitt mit kleinem Kragen
  t.push(unten('fig-creme', 92, 'L89,131L119,131', 116));
  t.push(pf('fig-creme-s', 'M89,131L104,147L119,131L116,130L104,141L92,130Z'));
  // Revers
  t.push(unten('fig-kleid-s', 76, 'L77,135L89,130L100,160L97,170', 97));
  t.push(unten('fig-kleid-s', 111, 'L108,160L119,130L132,134L133,150', 133));
  t.push(pf('fig-kleid', 'M77,135L89,130L98,155L86,151Z'), pf('fig-kleid', 'M119,130L132,134L125,149L111,155Z'));
  // Nähte, Knöpfe
  t.push(naehte());
  t.push(kr('fig-knopf', 104, 168, 2.4));
  if (fein) {
    // Stadtwappen-Anstecker: Lindenblatt mit Goldrand
    t.push(kr('fig-gold-flaeche', 84, 146, 4.6), pf('fig-linde', 'M84,142.4C86.8,143.6 87.6,146.4 86,148.6C85.2,149.6 84.4,150 84,150.8C83.6,150 82.8,149.6 82,148.6C80.4,146.4 81.2,143.6 84,142.4Z'));
  }
  t.push(gesichtsflaeche(false));
  t.push(zuege(stimmung, fein));
  // Bob vorn: Seitenscheitel, Strähnen über dem Ohr und an der rechten Wange
  t.push(pf('fig-haar', 'M79,86C76,60 92,46 111,47C127,48 137,61 136,78C128,64 114,59 102,62C93,65 86,73 84,88Z'));
  t.push(pf('fig-haar', 'M80,70C72,84 72,106 78,121C84,123 91,121 93,117C87,107 85,92 86,80Z'));
  t.push(pf('fig-haar', 'M121,52C134,57 140,70 138,88C137,99 134,110 130,119C128,108 130,95 128,84C126,71 122,62 116,56Z'));
  t.push(pf('fig-haar-s fig-strich', 'M90,64C98,58 110,56 120,58'), pf('fig-haar-s fig-strich', 'M80,86C79,98 80,108 84,116'));
  if (fein) t.push(pf('fig-haar-licht', 'M96,54C104,50 114,50 122,53C114,52 104,53 97,57Z'));
  // Brille mit Goldrand
  t.push(kr('fig-brille-gold', 100.5, 89, 8.6), kr('fig-brille-gold', 121.5, 88, 7.2));
  t.push(pf('fig-brille-gold', 'M109,88.6Q111.5,86 114.3,88'), pf('fig-brille-gold', 'M92,88L86,86.5'));
  t.push(kr('fig-brille-glas', 100.5, 89, 8.6), kr('fig-brille-glas', 121.5, 88, 7.2));
  return { kopf, svg: t.join('') };
};

/** Clara Faden: dunkles Haar zum tiefen Zopf, Pullover, Notizbuch mit rotem Lesebändchen, Tablet im Arm. */
const faden: Zeichner = (stimmung, fein) => {
  const kopf: Kopf = { haut: 3, haar: 'dunkel' };
  const t: string[] = [];
  t.push(pf('fig-haar', 'M77,94C72,68 84,45 106,44C128,43 140,60 137,84L132,90C130,72 120,60 106,60C92,60 84,72 84,92Z'));
  t.push(hals());
  t.push(unten('fig-kleid', SCH_X1, SCHULTERN, SCH_X2));
  // Rippbündchen am Halsausschnitt
  t.push(pf('fig-kleid-s', 'M87,131C93,143 115,143 121,131L118,130C113,139 95,139 90,130Z'));
  t.push(naehte());
  // Zopf über der linken Schulter
  t.push(pf('fig-haar', 'M78,100C69,108 65,122 66,136C67,146 66,152 62,158C70,156 75,148 77,138C79,126 82,114 86,106Z'));
  t.push(pf('fig-haar-s fig-strich', 'M73,118C70,128 70,138 68,148'));
  t.push(el('fig-kleid-s', 79.5, 104, 5, 3.4, -30));
  t.push(gesichtsflaeche());
  if (fein) t.push(kr('fig-gold-flaeche', 81, 99.5, 1.8));
  t.push(zuege(stimmung, fein));
  // Haar vorn: Mittelscheitel, glatt nach hinten
  t.push(pf('fig-haar', 'M79,90C75,62 91,46 108,46C125,46 137,59 135,80C128,66 118,58 108,58C104,62 99,68 92,70C87,74 84,82 84,92Z'));
  t.push(pf('fig-haar', 'M124,57C133,65 136,77 134,90L131,90C131,78 129,69 122,61Z'));
  t.push(pf('fig-haar-s fig-strich', 'M106,50C100,56 94,62 86,68'), pf('fig-haar-s fig-strich', 'M110,50C116,53 124,58 128,66'));
  if (fein) t.push(pf('fig-haar-licht', 'M112,50C120,51 127,55 131,62C125,57 119,54 112,53Z'));
  // Tablet und Notizbuch vor der Brust, Unterarm von unten, Hand am Buchrand
  t.push(unten('fig-kleid', 82, 'C92,164 100,156 107,148L118,154C114,162 112,168 111,172', 111));
  t.push(pf('fig-naht', 'M94,168C100,162 104,157 109,152'));
  t.push(gr(re('fig-tablet', 122, 124, 28, 36, 3) + re('fig-tablet-glas', 124.5, 126.5, 23, 31, 1.5), [7, 136, 142]));
  t.push(gr(re('fig-buch', 110, 132, 30, 32, 2.5) + re('fig-buch-schnitt', 137, 134, 2.6, 28, 1) + re('fig-buch-band', 110, 145, 30, 2.6), [-6, 125, 148]));
  // rotes Lesebändchen aus dem Buch (Erkennungszeichen)
  t.push(pf('fig-band', 'M118.6,162.4L122,162L122.6,173L120.3,171L118.4,174Z'));
  t.push(pf('fig-haut', 'M105,142C109,138 115,138 117,142L118,155C115,159 108,159 105,155Z'));
  t.push(pf('fig-haut-s fig-strich-fein', 'M107,146L116,145.6M107,150L116.5,149.6M107.4,154L116,153.6'));
  return { kopf, svg: t.join('') };
};

/** Konrad Schwung: graue Locken, runde schwarze Brille, Rollkragen, Sakko, langer orangefarbener Schal, Stift hinter dem Ohr. */
const schwung: Zeichner = (stimmung, fein) => {
  const kopf: Kopf = { haut: 4, haar: 'grau' };
  const t: string[] = [];
  // Locken: Kreise auf einem Bogen um den Oberkopf, hinten dunkler
  const locken = (k: string, dr: number, dy: number): string => {
    let s = el(k, 105, 64 + dy, 29, 18);
    for (let i = 0; i <= 13; i++) {
      const a = ((5 + i * 15.5) * Math.PI) / 180;
      const r = 8.5 + ((i * 7) % 3) * 0.9 + dr;
      s += kr(k, r1(105 + 30 * Math.cos(a)), r1(68 + dy - 25 * Math.sin(a)), r1(r));
    }
    return s;
  };
  t.push(locken('fig-haar-s', 1.2, 1.5), locken('fig-haar', 0, 0));
  // Zeichenstift hinter dem Ohr
  t.push(gr(re('fig-stift', 76, 60, 5, 30, 1) + re('fig-stift-kappe', 76, 60, 5, 6, 1) + pf('fig-stift-spitze', 'M76,90L81,90L78.5,96Z'), [-28, 78.5, 78]));
  t.push(hals());
  t.push(unten('fig-kleid', SCH_X1, SCHULTERN, SCH_X2));
  // Rollkragen und Pullover im Sakko
  t.push(unten('fig-rolli', 90, 'L87,131L121,131', 118));
  t.push(pf('fig-rolli', 'M88,114C94,122 114,122 120,114L122,131C112,137 96,137 86,131Z'), pf('fig-rolli-falte', 'M88,122C96,128 112,128 121,122'));
  // Revers des Sakkos
  t.push(unten('fig-kleid-s', 72, 'L73,136L87,131L94,160L92,170', 92));
  t.push(unten('fig-kleid-s', 116, 'L114,160L121,131L135,135L136,150', 136));
  t.push(pf('fig-kleid', 'M73,136L87,131L93,155L82,150Z'), pf('fig-kleid', 'M121,131L135,135L128,149L115,155Z'));
  t.push(naehte());
  // Schal: Schlinge um den Hals, ein langes Ende vorn, ein kurzes über der Brust
  t.push(unten('fig-schal', 86, 'L85,134L103,141', 103));
  t.push(pf('fig-schal-s', 'M85.6,150L102.6,154L102.6,159L85.6,155Z'), pf('fig-schal-s', 'M85.8,163L102.6,167L102.6,172L85.8,168Z'));
  t.push(pf('fig-schal', 'M82,123C94,138 116,138 128,123L131,134C118,149 92,149 79,134Z'));
  t.push(pf('fig-schal-s fig-strich', 'M84,131C96,142 114,142 128,130'));
  t.push(pf('fig-schal', 'M108,138L124,134L132,158L118,162Z'));
  t.push(pf('fig-schal-s', 'M111.6,148L127,144.4L128.4,149.2L113,153Z'));
  t.push(pf('fig-schal-fransen', 'M119.5,162L118.5,167.5M123.6,161L123,166.5M127.6,160L127.6,165.5M131.4,159L132,164.5'));
  t.push(gesichtsflaeche());
  t.push(zuege(stimmung, fein));
  // Locken vorn an der Stirn
  for (const [x, y, r] of [[88, 60, 7], [97, 54, 7.5], [108, 52, 7.5], [119, 55, 7], [128, 62, 6.5], [84, 70, 6]] as const) t.push(kr('fig-haar', x, y, r));
  if (fein) for (const [x, y] of [[95, 51], [107, 49], [118, 52], [86, 57]] as const) t.push(pf('fig-haar-s fig-strich-fein', `M${x - 3},${y + 3}Q${x},${y - 1} ${x + 3},${y + 3}`));
  // runde schwarze Brille
  t.push(kr('fig-brille-schwarz', 100.5, 89, 7.6), kr('fig-brille-schwarz', 121.5, 88, 6.6));
  t.push(pf('fig-brille-schwarz', 'M108,88.6Q111,86 115,88'), pf('fig-brille-schwarz', 'M93,88L86,86.5'));
  t.push(kr('fig-brille-glas', 100.5, 89, 7.6), kr('fig-brille-glas', 121.5, 88, 6.6));
  return { kopf, svg: t.join('') };
};

/** Hanna Klingel: rotbraunes Haar hochgesteckt, Strickjacke, bunte Kette, Handglocke aus Messing. */
const klingel: Zeichner = (stimmung, fein) => {
  const kopf: Kopf = { haut: 1, haar: 'rot' };
  const t: string[] = [];
  // Dutt hinten oben
  t.push(kr('fig-haar-s', 90, 45, 13.5), kr('fig-haar', 89, 44, 12));
  if (fein) t.push(pf('fig-haar-s fig-strich', 'M81,42C86,38 94,38 98,43M82,48C87,44 94,45 97,49'));
  t.push(hals());
  t.push(unten('fig-kleid', SCH_X1, SCHULTERN, SCH_X2));
  // Shirt im offenen Ausschnitt der Strickjacke
  t.push(unten('fig-creme', 94, 'L88,131L120,131', 114));
  t.push(pf('fig-creme-s', 'M88,131C94,139 114,139 120,131L118,130C112,136 96,136 90,130Z'));
  // Blenden der Strickjacke und Rippen
  t.push(unten('fig-kleid-s', 86, 'L83,133L90,131L96,170', 96));
  t.push(unten('fig-kleid-s', 112, 'L118,131L125,133L121,172', 121));
  t.push(kr('fig-knopf-hell', 92.4, 152, 2), kr('fig-knopf-hell', 94, 165, 2));
  t.push(naehte());
  // bunte Kette
  const perlen: readonly Akzent[] = ['violett', 'sonne', 'lagune', 'beere', 'blau', 'gruen', 'sonne', 'violett', 'lagune'];
  perlen.forEach((a, i) => {
    const w = (Math.PI * (i + 0.5)) / perlen.length;
    t.push(kr(`fig-perle gm-a-${a}`, r1(104 - 15 * Math.cos(w)), r1(131 + 14 * Math.sin(w)), fein ? 3.1 : 3.6));
  });
  t.push(gesichtsflaeche());
  t.push(zuege(stimmung, fein));
  if (fein) for (const [x, y] of [[94, 98], [97, 101], [100, 98.5], [92, 102], [125, 97.5], [127.5, 100]] as const) t.push(kr('fig-sprosse', x, y, 0.8));
  // Haar vorn: zurückgenommen, eine lose Strähne an der Schläfe
  t.push(pf('fig-haar', 'M79,90C76,62 90,46 108,46C126,46 137,60 135,80C130,66 120,58 106,58C96,60 88,68 84,90Z'));
  t.push(pf('fig-haar', 'M79,90C77,80 78,70 82,63L86,72C84,78 84,84 84,92Z'));
  t.push(pf('fig-haar-s fig-strich', 'M92,56C100,52 112,52 120,56M88,64C96,60 106,58 114,60'));
  t.push(pf('fig-straehne', 'M131,70C136,80 134,90 130,96C128,100 129,104 132,106'));
  if (fein) t.push(pf('fig-haar-licht', 'M100,50C108,47 118,48 126,53C118,51 108,51 101,53Z'));
  // Handglocke: Arm von unten, Glocke, Hand am Griff
  t.push(unten('fig-kleid-s', 138, 'C140,140 142,120 145,108L159,108C161,122 163,136 164,151.3', 164));
  t.push(pf('fig-naht', 'M148,140C150,148 151,156 152,162'));
  t.push(re('fig-holz', 149, 84, 6, 16, 2.5), kr('fig-holz', 152, 84, 4.4));
  t.push(pf('fig-messing', 'M152,108C145,108 142,113 141,120C140,129 139,135 135,139.5L169,139.5C165,135 164,129 163,120C162,113 159,108 152,108Z'));
  t.push(pf('fig-messing-s', 'M157,110C160.5,113 162,118 163,124C163.6,131 165,135 169,139.5L161,139.5C159.6,131 159.6,120 157,110Z'));
  t.push(re('fig-messing-s', 134, 138, 36, 4, 2), kr('fig-messing-s', 152, 144.6, 3.2));
  if (fein) t.push(pf('fig-glanz-flaeche', 'M146,115C144.5,121 144,128 142,134L145,134C146,127 147,121 149,114Z'));
  // Faust um den Griff, Daumen vorn
  t.push(pf('fig-haut', 'M144.5,99C144.5,96 147,95 152,95C157,95 159.5,96 159.5,99L159.5,108C159.5,111 157,112 152,112C147,112 144.5,111 144.5,108Z'));
  t.push(pf('fig-haut-s fig-strich-fein', 'M150,99.5L159,99.5M150,103.5L159,103.5M150,107.5L159,107.5'));
  t.push(pf('fig-haut', 'M146,98.5C142,98 139.6,101 141,104C142.4,106.6 146.4,106.4 148,103.6Z'));
  if (fein) t.push(pf('fig-schwingung', 'M172,110Q176,118 172,126M178,106Q184,118 178,130'));
  return { kopf, svg: t.join('') };
};

/** Theo Lot: grauer Schnurrbart, wettergegerbt, weißer Helm, Warnweste über kariertem Hemd, Zollstock in der Brusttasche. */
const lot: Zeichner = (stimmung, fein) => {
  const kopf: Kopf = { haut: 2, haar: 'grau' };
  const t: string[] = [];
  t.push(hals());
  // kariertes Hemd als Grund, Weste darüber
  t.push(unten('fig-hemd', SCH_X1, SCHULTERN, SCH_X2));
  // Karo nur im sichtbaren Mittelstück
  let karo = '';
  for (const x of [95, 103, 111]) karo += bisRand(x, 138, 1.5);
  for (const y of [146, 158, 170]) karo += `M88,${y}L121,${y}`;
  t.push(pf('fig-karo', karo));
  // Hemdkragen
  t.push(pf('fig-hemd-kragen', 'M90,127L104,139L96,149L86,134Z'), pf('fig-hemd-kragen', 'M118,127L104,139L112,149L122,134Z'));
  t.push(unten('fig-weste', 44, 'C48,146 54,140 62,136L90,132L89,170', 89));
  t.push(unten('fig-weste', 119, 'L118,132L146,136C154,140 160,146 164,151.3', 164));
  // Reflexstreifen
  for (const [y1, y2] of [[151, 157], [164, 170]] as const) {
    t.push(pf('fig-reflex', `M${Math.max(xl(y1), 45)},${y1}L89,${y1}L89,${y2}L${Math.max(xl(y2), 45)},${y2}Z`));
    t.push(pf('fig-reflex', `M119,${y1}L${Math.min(xr(y1), 163)},${y1}L${Math.min(xr(y2), 163)},${y2}L119,${y2}Z`));
  }
  t.push(pf('fig-weste-kante', `M90,132L89,${r1(yk(89) - 1.5)}M118,132L119,${r1(yk(119) - 1.5)}`));
  // Brusttasche mit Zollstock
  t.push(gr(re('fig-zollstock', 94, 136, 5, 22, 0.8) + re('fig-zollstock', 99.5, 138, 5, 20, 0.8)
    + pf('fig-zollstock-teilung', 'M94,140h2.4M94,144h3.6M94,148h2.4M94,152h3.6M99.5,142h2.4M99.5,146h3.6M99.5,150h2.4'), [-6, 99, 150]));
  t.push(re('fig-tasche', 91, 150, 16, 14, 1.5), pf('fig-tasche-klappe', 'M91,150L107,150L107,154L99,156L91,154Z'));
  t.push(gesichtsflaeche());
  // graue Koteletten unter dem Helm
  t.push(pf('fig-haar', 'M80,72C83,71 87,71 89,72L88,85C86,88 83,89 81,87Z'));
  t.push(zuege(stimmung, fein, { brauenDick: true, mund: false }));
  // wettergegerbt: Lachfältchen und Nasolabialfalte
  if (fein) t.push(pf('fig-falte', 'M127,91L131,92.5M127,94L130.5,96.5M117,100C116,104 117,108 120,110'));
  // Schnurrbart und Mund
  if (stimmung === 'froh') t.push(pf('fig-mund', 'M106,110Q114,121 123,109Q114,113 106,110Z'));
  else if (stimmung === 'besorgt') t.push(pf('fig-mund-linie', 'M108,115Q114,111 120,115'));
  else t.push(pf('fig-mund-linie', 'M108,113Q114,115.5 120,112.5'));
  t.push(pf('fig-haar', 'M101,108C104,101 111,100 117,103.5C121,100 128,101 130,106C128,111 122,111 117.5,108C112,111.5 105,112 101,108Z'));
  t.push(pf('fig-haar-s fig-strich-fein', 'M106,106.5L109,109M111,105.5L113,108.8M121,105.5L120,108.6M125,105.8L124.6,108.8'));
  // weißer Helm mit Mittelrippe und Krempe, etwas über den Brauen
  t.push('<g transform="translate(0 -4)">');
  t.push(pf('fig-helm', 'M76,76C75,50 91,36 108,36C127,36 141,51 140,74Z'));
  t.push(pf('fig-helm-s', 'M122,40C134,46 141,58 140,74L128,74C130,60 128,48 122,40Z'));
  t.push(pf('fig-helm-s', 'M104,37C102,48 102,62 104,74L112,74C110,62 110,48 112,37Z'));
  t.push(pf('fig-helm', 'M67,79C82,70 130,67 149,73C150,75 150,77 148,79C130,74 86,76 69,84C66,83 66,80 67,79Z'));
  t.push(pf('fig-helm-s', 'M68,82C86,75 130,72 149,77L148,79C130,74 86,76 69,84Z'));
  t.push('</g>');
  return { kopf, svg: t.join('') };
};

/** Sie: von schräg hinten, ohne Gesicht; Navy-Jacke, Mappe in der linken Hand, goldener Helm unter dem rechten Arm. */
const sie: Zeichner = (_stimmung, fein) => {
  const kopf: Kopf = { haut: 2, haar: 'braun' };
  const t: string[] = [];
  // Hals und Nacken
  t.push(pf('fig-haut', 'M92,100L92,134L120,134L120,100Z'), pf('fig-haut-s', 'M92,112L120,112L120,118L92,120Z'));
  // Jacke von hinten, Hemdkragen, Jackenkragen
  t.push(unten('fig-jacke', SCH_X1, SCHULTERN, SCH_X2));
  t.push(pf('fig-papier', 'M88,124C98,130 114,130 124,124L126,130C114,136 98,136 86,130Z'));
  t.push(pf('fig-jacke-s', 'M85,129C96,137 116,137 127,129L129,139C116,146 96,146 83,139Z'));
  t.push(pf('fig-jacke-naht', `${bisRand(106, 146)}M58,140C59,146 60,152 60,${r1(yk(60) - 2)}`));
  // Mappe unter dem linken Arm
  t.push(gr(re('fig-papier', 52, 128, 24, 30, 2) + re('fig-mappe', 49, 131, 26, 30, 2.5) + re('fig-mappe-s', 49, 131, 3.5, 30, 1.5), [-8, 62, 146]));
  t.push(unten('fig-jacke-s', 37, 'C40,140 46,138 52,137C55,143 58,152 61,160', 62));
  // goldener Helm unter dem rechten Arm
  t.push(pf('fig-gold-flaeche', 'M122,160C121,145 132,135 146,135C158,135 165,143 164,153Z'));
  t.push(pf('fig-gold-s', 'M141,136C147,142 151,150 152,157L158,155C157,147 153,140 147,135.4Z'));
  t.push(pf('fig-gold-flaeche', 'M117,163C129,157 146,152 160,151L160,155C146,156 131,160 119,166.5Z'));
  t.push(pf('fig-gold-s', 'M118,165C130,159 146,154.5 160,153.5L160,155C146,156 131,160 119,166.5Z'));
  if (fein) t.push(pf('fig-gold-licht', 'M128,152C129,145 134,140 140,138C135,142 132,147 131,153Z'));
  t.push(unten('fig-jacke-s', 146, 'C150,152 153,143 156,137C162,138 168,140 171,143.2', 171));
  // Ohr und Wangenkontur rechts (der Kopf ist leicht zur Seite gedreht)
  t.push(el('fig-haut', 133, 88, 5, 8.5), pf('fig-haut', 'M128,92C134,100 133,110 126,116L118,112Z'));
  if (fein) t.push(pf('fig-haut-s fig-strich-fein', 'M133.5,84Q136.5,88 133.5,92'));
  // Hinterkopf: kurzes Haar mit Wirbel
  t.push(pf('fig-haar', 'M76,84C74,58 90,43 106,43C124,43 136,57 135,80C135,94 131,106 124,114C114,118 98,118 88,114C80,106 77,96 76,84Z'));
  t.push(pf('fig-haar-s', 'M88,114C98,118 114,118 124,114L122,110C112,113 98,113 90,110Z'));
  t.push(pf('fig-haar-s fig-strich', 'M91,70C88,80 90,92 95,104M121,68C126,78 127,90 123,102M106,80C105,90 106,100 108,110'));
  if (fein) t.push(pf('fig-haar-licht', 'M92,52C100,46 112,46 120,50C112,49 101,50 94,55Z'));
  return { kopf, svg: t.join('') };
};


/** Marlene Ranzen: dunkle Locken im Dutt, grasgrüne Regenjacke mit hochgestelltem Kragen, Schlüsselband mit bunten Anhängern, Klemmbrett mit Fragenliste. */
const ranzen: Zeichner = (stimmung, fein) => {
  const kopf: Kopf = { haut: 2, haar: 'dunkel' };
  const t: string[] = [];
  // Locken um den Oberkopf (hinten dunkler) und der Dutt hinten oben
  const locken = (k: string, dy: number, dr: number): string => {
    let l = el(k, 105, 66 + dy, 28, 17);
    for (let i = 0; i <= 11; i++) {
      const a = ((10 + i * 15.5) * Math.PI) / 180;
      l += kr(k, r1(105 + 29 * Math.cos(a)), r1(70 + dy - 24 * Math.sin(a)), r1(6.8 + ((i * 5) % 3) * 0.8 + dr));
    }
    return l;
  };
  t.push(locken('fig-haar-s', 1.2, 1), locken('fig-haar', 0, 0));
  t.push(kr('fig-haar-s', 84, 40, 13.5), kr('fig-haar', 83, 39, 12), kr('fig-haar', 74, 44, 6.5), kr('fig-haar', 78, 31, 6.5), kr('fig-haar', 90, 30, 6.5));
  t.push(hals());
  // Regenjacke mit Reißverschluss
  t.push(unten('fig-regen', SCH_X1, SCHULTERN, SCH_X2));
  t.push(pf('fig-regen-naht', `${bisRand(104, 142)}M58,138C59,146 60,152 60,${r1(yk(60) - 2)}M150,138C149,146 148,152 148,${r1(yk(148) - 2)}`));
  // hochgestellter Kragen: zwei Flügel links und rechts vom Hals
  t.push(pf('fig-regen-s', 'M84,120C82,130 86,140 96,144L101,136L95,118Z'), pf('fig-regen', 'M85,119C84,128 88,137 96,141L99,135L94,119Z'));
  t.push(pf('fig-regen-s', 'M124,120C127,130 124,140 114,144L109,136L114,118Z'), pf('fig-regen', 'M123,119C125,128 121,137 114,141L111,135L115,119Z'));
  // Schlüsselband mit drei bunten Anhängern (Perlenfarben der Palette)
  t.push(pf('fig-band-linie', 'M96,136C97,150 101,158 104,162M112,136C111,150 107,158 104,162'));
  (['sonne', 'violett', 'lagune'] as const).forEach((a, i) => t.push(kr(`fig-perle gm-a-${a}`, [98.5, 104, 109.5][i] as number, [168, 171.5, 168][i] as number, fein ? 3.4 : 3.9)));
  t.push(gesichtsflaeche());
  t.push(zuege(stimmung, fein, { brauenDick: false }));
  if (fein) for (const [x, y] of [[96, 98], [99, 101], [102, 98.5], [125, 97.5]] as const) t.push(kr('fig-sprosse', x, y, 0.7));
  // Locken vorn an der Stirn, eine lose Locke an der Schläfe
  for (const [x, y, rr] of [[86, 62, 7], [95, 55, 7.5], [106, 52, 7.5], [117, 54, 7], [127, 60, 6.5], [83, 72, 6]] as const) t.push(kr('fig-haar', x, y, rr));
  t.push(pf('fig-straehne', 'M130,68C135,76 135,84 132,90'));
  if (fein) for (const [x, y] of [[95, 52], [107, 49], [118, 51]] as const) t.push(pf('fig-haar-s fig-strich-fein', `M${x - 3},${y + 3}Q${x},${y - 1} ${x + 3},${y + 3}`));
  // Klemmbrett im rechten Arm: Blatt mit drei Zeilen und Häkchen (Erkennungszeichen)
  t.push(unten('fig-regen-s', 138, 'C142,150 146,141 150,136C156,137 162,139 165,141.5', 165));
  t.push(gr(re('fig-holz', 118, 126, 36, 46, 3) + re('fig-papier', 121.5, 132, 29, 37, 1.5) + re('gm-stahl', 129, 122, 14, 9, 2)
    + pf('gm-haken-gruen', 'M124,141l2.4,2.4l4.6,-5.2M124,152l2.4,2.4l4.6,-5.2')
    + re('fig-linie', 134, 140, 13, 2.6, 1.3) + re('fig-linie', 134, 151, 11, 2.6, 1.3) + re('fig-linie', 134, 162, 13, 2.6, 1.3)
    + (fein ? '' : ''), [-5, 136, 150]));
  t.push(pf('fig-haut', 'M114,160C116,156 122,155 125,158L127,168C124,172 118,172 115,168Z'));
  return { kopf, svg: t.join('') };
};

/** Bernd Spitzfeder: kurzer grauer Vollbart, Schiebermütze mit Bleistift im Band, Trenchcoat mit hochgestelltem Kragen, Notizblock mit Gummiband. */
const spitzfeder: Zeichner = (stimmung, fein) => {
  const kopf: Kopf = { haut: 1, haar: 'grau' };
  const t: string[] = [];
  // graues Haar an Nacken und Schläfe unter der Mütze
  t.push(pf('fig-haar', 'M78,96C74,80 78,70 86,66L92,70C88,80 88,94 92,106C86,106 80,102 78,96Z'));
  t.push(hals());
  // Trenchcoat: Schulterklappe, Knopfleiste, Gürtel; hochgestellter Kragen
  t.push(unten('fig-trench', SCH_X1, SCHULTERN, SCH_X2));
  t.push(unten('fig-creme', 92, 'L89,131L119,131', 116));
  t.push(pf('fig-trench-s', 'M104,138L104,172'), pf('fig-trench-s', 'M101,160L101,172M107,160L107,172'));
  t.push(unten('fig-trench-s', 76, 'L77,134L90,131L101,158L96,172', 96));
  t.push(unten('fig-trench-s', 108, 'L109,158L120,131L134,134L136,160', 136));
  t.push(pf('fig-trench', 'M77,134L90,131L99,152L87,150Z'), pf('fig-trench', 'M120,131L134,134L127,150L110,152Z'));
  t.push(re('fig-trench-s', 58, 150, 90, 7, 2), re('fig-messing-s', 99, 149, 10, 9, 1.5), re('fig-trench', 101, 151, 6, 5, 1));
  t.push(kr('fig-knopf-trench', 99, 168, 2.3), kr('fig-knopf-trench', 109, 168, 2.3));
  t.push(pf('fig-trench-naht', `M58,140C59,146 60,152 60,${r1(yk(60) - 2)}M150,140C149,146 148,152 148,${r1(yk(148) - 2)}`));
  t.push(gesichtsflaeche());
  t.push(zuege(stimmung, fein, { mund: false }));
  // kurzer grauer Vollbart: um Kinn und Wangen, der Mund bleibt sichtbar
  t.push(pf('fig-haar', 'M84,98C84,112 92,125 107,126C120,126 128,117 131,104C127,108 122,110 118,110C114,106 109,106 105,108C100,106 94,106 90,100Z'));
  t.push(pf('fig-haar-s fig-strich-fein', 'M92,110C95,118 100,122 106,123M118,114C122,112 126,110 128,106'));
  t.push(pf(stimmung === 'froh' ? 'fig-mund' : 'fig-mund-linie', stimmung === 'froh' ? 'M106,112Q113,121 121,111Q113,114 106,112Z' : stimmung === 'besorgt' ? 'M107,115Q112,111 120,114' : 'M107,113Q113,116 120,112'));
  // Schiebermütze: Kappe, flacher Schirm nach rechts, Band mit Bleistift (nicht hinter dem Ohr)
  t.push(pf('fig-muetze', 'M77,76C77,58 92,48 112,48C130,48 141,58 141,72C128,69 100,70 77,79Z'));
  t.push(pf('fig-muetze-s', 'M120,50C132,54 141,62 141,72C136,70 130,69 124,69C127,62 125,56 120,50Z'));
  t.push(pf('fig-muetze-s fig-strich', 'M80,76C100,70 128,69 141,73'));
  t.push(pf('fig-muetze', 'M118,70C130,68 146,72 154,80C148,83 134,80 118,77Z'));
  t.push(gr(re('fig-stift', 96, 62, 4.6, 28, 1) + re('fig-stift-kappe', 96, 62, 4.6, 5, 1) + pf('fig-stift-spitze', 'M96,90L100.6,90L98.3,96Z'), [62, 98, 74]));
  if (fein) t.push(pf('fig-haar-licht', 'M96,52C104,49 114,49 122,52C114,51 104,52 97,55Z'));
  // Notizblock mit Gummiband in der linken Hand (Erkennungszeichen)
  t.push(gr(re('fig-papier', 52, 128, 28, 38, 2) + re('fig-block-kopf', 52, 128, 28, 7, 2) + pf('fig-block-linien', 'M57,142H75M57,148H75M57,154H71') + re('fig-gummi', 70, 126, 4.2, 42, 1.5), [-8, 66, 148]));
  t.push(pf('fig-haut', 'M76,150C79,146 85,146 87,150L88,162C84,166 78,166 75,162Z'));
  return { kopf, svg: t.join('') };
};

/** Ewald Pfennig: schmal, weißes Haar mit Geheimratsecken, Lesebrille tief auf der Nase, grauer Nadelstreifenanzug mit Weste, Taschenuhr, blauer Ordner. */
const pfennig: Zeichner = (stimmung, fein) => {
  const kopf: Kopf = { haut: 1, haar: 'weiss' };
  const t: string[] = [];
  // Haarkranz hinten und an den Schläfen; oben die Geheimratsecken
  t.push(pf('fig-haar', 'M79,92C76,74 80,60 92,54C88,66 87,78 90,96Z'));
  t.push(pf('fig-haar-s', 'M80,80C79,70 84,60 92,56C89,66 88,76 90,86Z'));
  t.push(hals());
  // Anzug mit Weste und Hemdkragen
  t.push(unten('fig-anzug', SCH_X1, SCHULTERN, SCH_X2));
  t.push(unten('fig-weste', 90, 'L88,131L120,131L119,150', 119));
  t.push(unten('fig-creme', 94, 'L89,131L119,131', 114));
  t.push(pf('fig-creme-s', 'M89,131L104,146L119,131L116,130L104,141L92,130Z'));
  // Revers, Krawatte im Ton der Figur
  t.push(unten('fig-anzug-s', 74, 'L76,135L89,130L99,156L96,172', 96));
  t.push(unten('fig-anzug-s', 111, 'L109,156L119,130L133,135L135,160', 135));
  t.push(pf('fig-anzug', 'M76,135L89,130L97,152L85,150Z'), pf('fig-anzug', 'M119,130L133,135L127,150L112,152Z'));
  t.push(pf('fig-kleid', 'M101,138L107,138L109,166L104,172L99,166Z'));
  // Nadelstreifen: feine helle Linien auf Jacke und Schulter
  let nadel = '';
  for (const x of [46, 54, 62, 70, 78]) nadel += `M${x},${x < 60 ? 146 : 138}L${x},${r1(yk(x) - 3)}`;
  for (const x of [130, 138, 146, 154, 162]) nadel += `M${x},${x > 150 ? 146 : 138}L${x},${r1(yk(x) - 3)}`;
  t.push(pf('fig-nadel', nadel));
  t.push(pf('fig-anzug-naht', `M58,140C59,146 60,152 60,${r1(yk(60) - 2)}M150,140C149,146 148,152 148,${r1(yk(148) - 2)}`));
  // Taschenuhr mit Kette an der Weste (Erkennungszeichen)
  t.push(pf('fig-kette', 'M117,141C122,150 120,158 112,160M117,141L113,143'));
  t.push(kr('fig-messing-s', 111, 164, 7.4), kr('fig-gold-flaeche', 111, 164, 6), kr('fig-papier', 111, 164, 4.4), pf('fig-uhrzeiger', 'M111,164V160.8M111,164L113.4,165.4'), re('fig-messing-s', 109.4, 154.8, 3.2, 3.4, 1));
  t.push(gesichtsflaeche());
  t.push(zuege(stimmung === 'besorgt' ? 'neutral' : stimmung, fein, { brauenDick: false }));
  // besorgt = eine Augenbraue hochgezogen
  if (stimmung === 'besorgt') t.push(pf('fig-braue', 'M116,72Q121,69 126,73'));
  // schmales Gesicht: Falten neben dem Mund, hohe Stirn
  if (fein) t.push(pf('fig-falte', 'M100,106C99,110 100,114 103,116M121,104C122,108 121,112 119,115'));
  // Haar vorn: ein schmaler Streifen über den Ohren, Geheimratsecken frei
  t.push(pf('fig-haar', 'M79,84C77,66 86,54 100,50C96,60 92,68 90,80Z'));
  t.push(pf('fig-haar', 'M118,48C128,52 134,60 134,72C130,64 124,58 116,54Z'));
  if (fein) t.push(pf('fig-haar-s fig-strich-fein', 'M84,62C87,58 91,55 95,53M122,50C127,53 131,58 132,64'));
  // halbmondförmige Lesebrille tief auf der Nase
  t.push(pf('fig-brille-glas', 'M93,94.5H108C108,101 103,104.5 100.5,104.5C97,104.5 93,101 93,94.5Z'), pf('fig-brille-glas', 'M115,93.5H128C128,99.5 124,103 121.5,103C118.5,103 115,99.5 115,93.5Z'));
  t.push(pf('fig-brille-schwarz fig-brille-fein', 'M93,94.5H108C108,101 103,104.5 100.5,104.5C97,104.5 93,101 93,94.5ZM115,93.5H128C128,99.5 124,103 121.5,103C118.5,103 115,99.5 115,93.5ZM108,94.5Q111.5,92.5 115,93.5M93,94.5L86,92.5'));
  // blauer Ordner mit Haftzetteln unter dem linken Arm
  t.push(gr(re('gm-a-blau', 50, 130, 30, 40, 2.5) + re('gm-d-blau', 50, 130, 4.6, 40, 1.5) + re('fig-papier', 56, 136, 20, 3.4, 1.2) + re('gm-a-sonne', 60, 126, 10, 6, 1.2) + re('gm-a-beere', 72, 127, 8, 5, 1.2), [-6, 65, 150]));
  t.push(pf('fig-haut', 'M76,152C79,148 85,148 87,152L88,164C84,168 78,168 75,164Z'));
  return { kopf, svg: t.join('') };
};

/**
 * Stimme ohne Gesicht (P19.6): Umriss von Kopf und Schultern mit drei Sprechlinien – die Vertretung nur so, die Vergabestelle mit dem Hörer am Ohr.
 * Es gibt keine Stimmung: Ein Umriss lacht nicht.
 */
const stimme = (hoerer: boolean): Zeichner => () => {
  const kopf: Kopf = { haut: 2, haar: 'braun' };
  const t: string[] = [];
  t.push(unten('fig-stimme', 54, 'C58,146 76,134 98,132L110,132C132,134 150,146 156,152', 156));
  t.push(pf('fig-stimme-s', 'M98,132L110,132L112,120C108,124 100,124 96,120Z'));
  t.push(kr('fig-stimme', 104, 94, 25));
  t.push(pf('fig-stimme-s fig-hauch', 'M82,96C82,112 92,122 104,122C96,118 90,108 90,96Z'));
  if (hoerer) t.push(pf('fig-hoerer', 'M126,84C136,82 140,90 140,100C140,110 136,116 126,114'), re('fig-hoerer-kapsel', 124, 79, 9, 12, 4), re('fig-hoerer-kapsel', 123, 107, 9, 12, 4));
  t.push(pf('fig-schwingung fig-schwingung-stark', hoerer ? 'M146,76Q154,94 146,112M154,66Q168,94 154,122M162,58Q182,94 162,130' : 'M134,76Q142,94 134,112M144,66Q158,94 144,122M154,58Q174,94 154,130'));
  return { kopf, svg: t.join('') };
};

const ZEICHNER: Record<Figur | Nebenfigur | Stimme, Zeichner> = { sie, grundstein, faden, schwung, klingel, lot, ranzen, spitzfeder, pfennig, vergabestelle: stimme(true), vertretung: stimme(false) };

/** Bildbeschreibung eines Porträts (deutsch, für `aria-label` und `<title>`). */
export function portraetText(figur: Figur | Nebenfigur | Stimme, stimmung: Stimmung = 'neutral'): string {
  const er = figur === 'schwung' || figur === 'lot' || figur === 'spitzfeder' || figur === 'pfennig';
  const ohneGesicht = figur === 'sie' || figur === 'vergabestelle' || figur === 'vertretung';
  return BILD_TEXT[figur] + (ohneGesicht ? '' : (er ? STIMMUNG_TEXT_ER : STIMMUNG_TEXT)[stimmung]);
}

function kantenlaenge(groesse: PortraetOptionen['groesse']): number {
  if (groesse === 'klein') return 56;
  if (typeof groesse === 'number' && Number.isFinite(groesse)) return Math.max(16, Math.min(640, Math.round(groesse)));
  return 200;
}

/**
 * Porträt einer Figur als SVG: Brustbild im Dreiviertelprofil auf rundem Farbfeld im Figurenton. Vorgabe groß
 * (200 px); `groesse: 'klein'` ergibt den Avatar (56 px) ohne feine Details.
 */
export function portraet(figur: Figur | Nebenfigur | Stimme, optionen: PortraetOptionen = {}): string {
  const px = kantenlaenge(optionen.groesse);
  const fein = px >= 100;
  const stimmung = figur === 'sie' || figur === 'vergabestelle' || figur === 'vertretung' ? 'neutral' : optionen.stimmung ?? 'neutral';
  const { kopf, svg } = ZEICHNER[figur](stimmung, fein);
  const ton = figur === 'sie' ? 'marke' : figur === 'vergabestelle' || figur === 'vertretung' ? 'keiner' : figur in NEBENFIGUR_AKZENT ? NEBENFIGUR_AKZENT[figur as Nebenfigur] : FIGUR_AKZENT[figur as Exclude<Figur, 'sie'>];
  const klasse = ['fig-portraet', `fig-ton-${ton}`, `fig-haut-${kopf.haut}`, `fig-haar-${kopf.haar}`, fein ? 'fig-fein' : 'fig-klein', optionen.klasse].filter(Boolean).join(' ');
  const text = portraetText(figur, stimmung);
  const zugang = optionen.dekorativ ? 'aria-hidden="true" focusable="false"' : `role="img" aria-label="${text}"`;
  const grund = kr('fig-grund', 100, 100, R_BILD) + kr('fig-hof', 104, 84, 60)
    + (fein ? pf('fig-bogen', 'M22,70A82,82 0 0 1 70,20') + kr('fig-punkt', 168, 50, 4) + kr('fig-punkt', 180, 70, 2.5) : '')
    + kr('fig-rand', 100, 100, R_BILD - 1);
  return `<svg class="${klasse}" viewBox="0 0 200 200" width="${px}" height="${px}" ${zugang} data-figur="${figur}" data-stimmung="${stimmung}" xmlns="http://www.w3.org/2000/svg">${optionen.dekorativ ? '' : `<title>${text}</title>`}${grund}<g transform="translate(${FIG_TX} ${FIG_TY}) scale(${FIG_S})">${svg}</g></svg>`;
}

// ------------------------------------------------------------------------------------------- Gegenstände
/** Klasse eines Felds der Risikomatrix 5 × 5 nach V2.4 (Handbuch Abschnitt 2): Produkt 1–4 beobachten, 5–9 gezielt
 *  bearbeiten, 10–25 vorrangig; Auswirkung 5 ist immer vorrangig – wie matrixStufe in der Explore-Matrix. */
export function matrixFeldKlasse(wahrscheinlichkeit: number, auswirkung: number): 'beobachten' | 'gezielt' | 'vorrangig' {
  const wert = wahrscheinlichkeit * auswirkung;
  if (auswirkung === 5 || wert >= 10) return 'vorrangig';
  return wert >= 5 ? 'gezielt' : 'beobachten';
}
/** Farben der drei Klassen in den Tönen der Explore-Matrix (grün · gelb · rot) */
export const MATRIX_FARBE = { beobachten: 'gm-a-gruen', gezielt: 'gm-a-sonne', vorrangig: 'gm-a-beere' } as const;

export const GIMMICKS = [
  'bauzaun', 'warnschild', 'kostenzettel', 'zahlenzettel', 'lieferwagen', 'holzstapel', 'lupe', 'waage',
  'mensateller', 'grundriss', 'geruest-sturm', 'lueftung', 'schulglocke', 'schulbus', 'kaertchen', 'pokal',
  'projektblatt', 'notizzettel', 'telefon', 'kalender', 'absperrband', 'stempel', 'rednerpult', 'schluessel',
  'buch', 'mappe', 'matrix', 'sonne', 'wegweiser', 'stoppuhr', 'bruecke', 'eintrag',
  // P18.3/P18.4 (Konzept WERKZEUGE-P18 Abschnitt 6): Kacheln der vier neuen Explore-Werkzeuge und das Ergebnis „Maßnahme“
  'klemmbrett', 'gabelung', 'messlatte', 'berichtsblatt', 'werkzeugkasten',
  // P19.6 (Drehbuch v2, Akte I bis III): Bilder der neuen Stationen und Mini-Aufgaben
  'stuhlreihen', 'schlagzeile', 'glocke-haken', 'angebotskalender', 'pinnwand', 'haftzettel', 'gespraechskarten', 'musskarten',
  'genehmigung-auflage', 'hallenboden', 'tasse',
] as const;
export type GimmickName = (typeof GIMMICKS)[number];

const GIMMICK_TEXT: Record<GimmickName, string> = {
  bauzaun: 'Ein Bauzaun mit Fußsteinen und einem gelben Banner.',
  warnschild: 'Ein Warnschild: gelbes Dreieck mit Ausrufezeichen.',
  kostenzettel: 'Ein Kostenzettel mit Eurozeichen und einer langen Liste.',
  zahlenzettel: 'Zwei Zettel nebeneinander mit verschieden langen Balken, ohne Zahlen.',
  lieferwagen: 'Ein Lastwagen, beladen mit Holzelementen.',
  holzstapel: 'Ein Stapel Holzelemente auf Kanthölzern.',
  lupe: 'Eine Lupe.',
  waage: 'Eine Waage mit drei Schalen.',
  mensateller: 'Ein Mensatablett mit Teller, Apfel und Besteck.',
  grundriss: 'Ein Grundriss der Mensa mit gestrichelter Erweiterung.',
  'geruest-sturm': 'Ein Gerüst im Sturm unter einer dunklen Wolke.',
  lueftung: 'Ein Lüftungsgerät, daneben ein Kalenderblatt mit Pfeil nach hinten.',
  schulglocke: 'Eine kleine Handglocke aus Messing, die läutet.',
  schulbus: 'Ein gelber Schulbus.',
  kaertchen: 'Das Kärtchen „Wer entscheidet was“ mit Büroklammer.',
  pokal: 'Ein Pokal mit Stern.',
  projektblatt: 'Ein Projektblatt mit Unterschrift und Siegel.',
  notizzettel: 'Ein Notizzettel mit Fragezeichen.',
  telefon: 'Ein klingelndes Telefon.',
  kalender: 'Ein Kalenderblatt, ein Tag ist markiert.',
  absperrband: 'Ein Absperrband zwischen zwei Pfosten.',
  stempel: 'Ein Stempel mit Häkchen auf dem Abdruck.',
  rednerpult: 'Das Rednerpult des Stadtrats mit Mikrofon.',
  schluessel: 'Ein Schlüsselbund mit Anhänger.',
  buch: 'Ein aufgeschlagenes Buch.',
  mappe: 'Eine Übergabemappe mit zwei Karteikarten.',
  matrix: 'Ein Raster aus fünf mal fünf Feldern, ein Feld ist markiert.',
  sonne: 'Die Sonne über dem Campus.',
  wegweiser: 'Ein Wegweiser mit Umweg.',
  stoppuhr: 'Eine Stoppuhr.',
  bruecke: 'Eine Brücke mit einem Riss.',
  eintrag: 'Ein ausgefüllter Eintrag mit Uhr, Kamera, Zeilen und Häkchen.',
  klemmbrett: 'Ein Klemmbrett mit einer Liste, zwei Punkte sind abgehakt.',
  gabelung: 'Ein Weg, der sich in zwei Pfeile teilt.',
  messlatte: 'Eine Messlatte mit vier Kerben und einer Marke.',
  berichtsblatt: 'Eine Seite mit drei Ampelpunkten und wenigen Zeilen.',
  werkzeugkasten: 'Ein offener Werkzeugkasten mit Hammer und Schraubenschlüssel.',
  stuhlreihen: 'Zwei Stuhlreihen in einem Raum, in der hinteren Reihe heben zwei Eltern die Hand.',
  schlagzeile: 'Eine Zeitungsseite „Lindenbote“ mit großer Schlagzeile, einem Bild und mehreren Spalten.',
  'glocke-haken': 'Eine kleine Messingglocke, die an einem Haken an der Wand hängt.',
  angebotskalender: 'Ein Kalenderblatt mit markiertem Freitag und daneben ein Preisschild mit Eurozeichen.',
  pinnwand: 'Eine Pinnwand mit vier Zetteln, drei davon sind mit roten Fäden verbunden, ein Faden endet lose.',
  haftzettel: 'Ein Eintrag mit wenigen Zeilen, darauf klebt ein gelber Haftzettel mit zwei kurzen Wörtern.',
  gespraechskarten: 'Vier Gesprächskarten mit je einem Porträt und zwei Zeilen, daneben ein kleiner Fristkalender.',
  musskarten: 'Ein Trichter und darunter zwei Karten: Eine trägt ein Häkchen und kommt durch, die andere ein Kreuz und scheidet aus.',
  'genehmigung-auflage': 'Ein Bescheid mit Stempel und ein angehefteter Zettel mit Warnzeichen: die Auflage.',
  hallenboden: 'Ein Hallenboden aus Holzdielen mit zwei rot markierten Fugen.',
  tasse: 'Eine Tasse Tee mit Dampf und einer Zitronenscheibe auf der Untertasse.',
};

export interface GimmickOptionen {
  /** Kantenlänge in px (Vorgabe 96, erlaubt 32–240). */
  groesse?: number;
  dekorativ?: boolean;
  klasse?: string;
}

/** Bodenschatten unter einem Gegenstand. */
const boden = (cx = 60, b = 40): string => el('gm-boden', cx, 106, b, 5);

const GIMMICK_SVG: Record<GimmickName, () => string> = {
  bauzaun: () => {
    let s = boden(60, 50);
    for (const x0 of [10, 60]) {
      s += re('gm-zaun-netz', x0 + 2, 34, 46, 58);
      let netz = '';
      for (let x = x0 + 8; x < x0 + 48; x += 7) netz += `M${x},34V92`;
      for (let y = 40; y < 92; y += 7) netz += `M${x0 + 2},${y}H${x0 + 48}`;
      s += pf('gm-zaun-gitter', netz) + re('gm-zaun-rahmen', x0 + 2, 34, 46, 58, 2);
      s += re('gm-beton', x0 - 2, 94, 14, 9, 2) + re('gm-beton', x0 + 38, 94, 14, 9, 2);
    }
    s += re('gm-a-sonne', 18, 50, 84, 18, 2) + pf('gm-d-sonne', 'M18,64h84v4h-84z');
    s += re('gm-papier', 46, 54, 28, 9, 1.5);
    return s;
  },
  warnschild: () => boden(60, 22) + re('gm-stahl', 57, 70, 6, 36, 2)
    + pf('gm-d-sonne', 'M60,10C63,10 65,12 66.5,14.5L99,72C101,76 99,80 94,80L26,80C21,80 19,76 21,72L53.5,14.5C55,12 57,10 60,10Z')
    + pf('gm-a-sonne', 'M60,20L91,74L29,74Z') + pf('gm-tinte', 'M56.5,36H63.5L62,58H58Z') + kr('gm-tinte', 60, 65, 3.6),
  kostenzettel: () => {
    let s = boden(60, 30);
    s += pf('gm-papier gm-kante', 'M30,12H90V100L84,95L78,100L72,95L66,100L60,95L54,100L48,95L42,100L36,95L30,100Z');
    s += kr('gm-a-sonne', 46, 30, 10) + pf('gm-euro', 'M50,25.5C46,23 41,25 40.8,30C41,35 46,37 50,34.5M38.6,28.4H46M38.6,31.6H46');
    s += re('gm-linie-flaeche', 62, 26, 20, 3, 1.5) + re('gm-linie-flaeche-hell', 62, 32, 14, 3, 1.5);
    for (const [y, b] of [[50, 44], [60, 36], [70, 40]] as const) s += re('gm-linie-flaeche-hell', 38, y, b, 3, 1.5);
    s += pf('gm-strich', 'M38,82H82');
    s += re('gm-d-beere', 60, 86, 22, 4, 2);
    return s;
  },
  zahlenzettel: () => {
    let s = boden(60, 46);
    s += gr(re('gm-papier gm-kante', 10, 18, 46, 64, 3) + re('gm-linie-flaeche-hell', 18, 28, 24, 3, 1.5) + re('gm-a-blau', 18, 44, 18, 8, 2) + re('gm-s-blau', 18, 58, 30, 8, 2) + re('gm-linie-flaeche-hell', 18, 72, 16, 3, 1.5), [-6, 33, 50]);
    s += gr(re('gm-papier gm-kante', 64, 22, 46, 64, 3) + re('gm-linie-flaeche-hell', 72, 32, 24, 3, 1.5) + re('gm-a-orange', 72, 48, 32, 8, 2) + re('gm-s-orange', 72, 62, 30, 8, 2) + re('gm-linie-flaeche-hell', 72, 76, 16, 3, 1.5), [5, 87, 54]);
    return s;
  },
  lieferwagen: () => {
    let s = boden(60, 52);
    // Ladefläche mit Holzelementen
    s += re('gm-holz-r', 12, 52, 66, 10, 1) + re('gm-holz', 12, 42, 66, 10, 1) + re('gm-holz-o', 14, 32, 62, 10, 1);
    s += pf('gm-holz-fuge', 'M12,47H78M12,57H78M14,37H76M30,32V62M54,32V62');
    s += pf('gm-gurt', 'M40,30V64');
    s += re('gm-tinte', 8, 64, 76, 8, 2);
    // Fahrerhaus
    s += pf('gm-a-blau', 'M84,40H100C104,40 107,42 109,46L114,58V72H84Z') + pf('gm-glas', 'M89,45H99C101,45 102.6,46 103.6,48L107,56H89Z');
    s += pf('gm-d-blau', 'M84,64H114V72H84Z') + re('gm-licht', 110, 60, 4, 4, 1);
    for (const x of [24, 66, 98]) s += kr('gm-rad', x, 76, 9) + kr('gm-nabe', x, 76, 3.5);
    return s;
  },
  holzstapel: () => {
    let s = boden(60, 46);
    s += re('gm-holz-r', 22, 88, 10, 10, 1) + re('gm-holz-r', 88, 88, 10, 10, 1);
    for (let i = 0; i < 4; i++) {
      const y = 76 - i * 14;
      const v = i % 2 === 0 ? 0 : 4;
      s += re('gm-holz', 14 + v, y, 92 - v, 12, 1.5) + re('gm-holz-o', 14 + v, y, 92 - v, 3, 1.5) + pf('gm-holz-fuge', `M${44 + v},${y + 3}V${y + 12}M${76 + v},${y + 3}V${y + 12}`);
    }
    return s;
  },
  lupe: () => boden(60, 26) + pf('gm-griff', 'M74,72L98,96') + kr('gm-glas-hell', 52, 50, 28) + pf('gm-glanz', 'M36,44C38,36 44,30 52,28L52,33C46,35 42,39 40,45Z') + kr('gm-ring', 52, 50, 28),
  waage: () => {
    let s = boden(60, 40);
    s += re('gm-tinte', 56, 26, 8, 70, 2) + re('gm-tinte', 36, 94, 48, 8, 3) + kr('gm-messing', 60, 24, 6);
    s += pf('gm-balken', 'M14,34L106,34');
    const schale = (x: number, y: number, a: Akzent): string => pf('gm-schnur', `M${x},34L${x - 12},${y}M${x},34L${x + 12},${y}`) + pf(`gm-a-${a}`, `M${x - 16},${y}H${x + 16}C${x + 14},${y + 10} ${x - 14},${y + 10} ${x - 16},${y}Z`);
    s += schale(20, 66, 'blau') + schale(100, 66, 'lagune');
    s += pf('gm-schnur', 'M60,34L48,76M60,34L72,76') + pf('gm-a-orange', 'M44,76H76C74,86 46,86 44,76Z');
    return s;
  },
  mensateller: () => boden(60, 48)
    + gr(re('gm-d-lagune', 10, 30, 100, 66, 10) + re('gm-a-lagune', 14, 33, 92, 60, 8), [0, 60, 63])
    + kr('gm-papier-s', 54, 62, 26) + kr('gm-papier', 54, 62, 22) + el('gm-a-gruen', 46, 60, 9, 6, -20) + el('gm-a-sonne', 60, 66, 8, 6) + el('gm-a-orange', 54, 54, 6, 4)
    + kr('gm-a-beere', 94, 46, 7) + pf('gm-stiel', 'M94,39Q95,35 98,34') + pf('gm-d-gruen', 'M96,37C99,33 103,34 104,36C101,38 98,38 96,37Z')
    + re('gm-stahl', 86, 58, 4, 30, 2) + re('gm-stahl', 96, 58, 4, 30, 2) + pf('gm-stahl', 'M94,56h8v10a4,4 0 0 1 -8,0z'),
  grundriss: () => {
    let s = re('gm-papier gm-kante', 8, 14, 104, 92, 4);
    s += pf('gm-wand', 'M18,26H66V94H18Z') + pf('gm-wand', 'M18,58H40');
    s += re('gm-s-orange', 20, 28, 44, 64);
    s += pf('gm-wand-neu', 'M66,26H102V94H66');
    s += pf('gm-pfeil-orange', 'M72,60H96M90,54L96,60L90,66');
    for (const [x, y] of [[28, 40], [44, 40], [28, 76], [44, 76]] as const) s += kr('gm-d-orange', x, y, 3);
    return s;
  },
  'geruest-sturm': () => {
    let s = boden(56, 40);
    s += gr((() => {
      let g = '';
      for (const x of [26, 52, 78]) g += `M${x},104V44`;
      for (const y of [56, 74, 92]) g += `M22,${y}H82`;
      g += 'M26,92L52,74M52,74L78,56M26,74L52,56';
      return pf('gm-geruest', g) + re('gm-holz', 22, 52, 60, 4, 1) + re('gm-holz', 22, 70, 60, 4, 1);
    })(), [7, 52, 104]);
    s += pf('gm-wolke', 'M44,30C44,20 54,14 62,18C66,8 82,8 86,18C96,16 104,24 100,32C106,36 102,44 94,44H52C44,44 40,36 44,30Z');
    s += pf('gm-a-sonne', 'M76,42L68,58H75L70,72L86,52H78L83,42Z');
    s += pf('gm-wind', 'M86,64C96,64 104,60 100,54C98,51 94,53 95,56M90,76C102,76 112,72 108,66M8,48C14,46 18,44 22,40');
    return s;
  },
  lueftung: () => {
    let s = boden(52, 40);
    s += re('gm-geraet-s', 14, 40, 70, 58, 5) + re('gm-geraet', 14, 36, 66, 58, 5);
    s += kr('gm-geraet-s', 47, 65, 20) + kr('gm-tinte', 47, 65, 16);
    for (let i = 0; i < 4; i++) s += pf('gm-fluegel', `M47,65L${r1(47 + 14 * Math.cos(i * Math.PI / 2))},${r1(65 + 14 * Math.sin(i * Math.PI / 2))}A14,14 0 0 1 ${r1(47 + 14 * Math.cos(i * Math.PI / 2 + 0.9))},${r1(65 + 14 * Math.sin(i * Math.PI / 2 + 0.9))}Z`);
    s += kr('gm-geraet', 47, 65, 4);
    s += re('gm-stahl', 30, 20, 34, 16, 2) + pf('gm-geraet-s', 'M30,30H64V36H30Z');
    // Kalenderblatt mit Pfeil nach hinten (Verzug, ohne Zahl)
    s += re('gm-papier gm-kante', 80, 12, 32, 34, 3) + re('gm-a-beere', 80, 12, 32, 9, 3) + pf('gm-pfeil-beere', 'M86,34H105M100,29L105,34L100,39');
    return s;
  },
  schulglocke: () => boden(58, 26)
    + re('gm-holz', 55, 10, 8, 26, 3) + kr('gm-holz', 59, 10, 6)
    + pf('gm-messing', 'M59,34C49,34 45,42 44,52C43,66 40,76 32,84L86,84C78,76 75,66 74,52C73,42 69,34 59,34Z')
    + pf('gm-messing-s', 'M66,36C71,41 73,48 74,56C75,68 78,77 86,84L74,84C71,70 71,50 66,36Z')
    + re('gm-messing-s', 30, 82, 58, 6, 3) + kr('gm-messing-s', 59, 94, 5)
    + pf('gm-glanz', 'M51,44C49,52 49,62 46,72L50,72C51,62 52,52 55,43Z')
    + pf('gm-schwingung', 'M92,40Q99,50 92,60M100,34Q110,50 100,66M26,40Q19,50 26,60M18,34Q8,50 18,66'),
  schulbus: () => {
    let s = boden(60, 52);
    s += pf('gm-a-sonne', 'M8,34C8,28 12,24 18,24H96C104,24 108,28 110,36L114,60V80H8Z');
    s += pf('gm-d-sonne', 'M8,70H114V80H8Z');
    for (const x of [14, 32, 50, 68]) s += re('gm-glas', x, 32, 14, 16, 2);
    s += pf('gm-glas', 'M88,32H98C101,32 103,34 104,37L108,52H88Z');
    s += pf('gm-streifen', 'M8,58H114');
    s += re('gm-papier', 18, 61, 24, 6, 1.5);
    for (const x of [26, 90]) s += kr('gm-rad', x, 82, 10) + kr('gm-nabe', x, 82, 4);
    s += re('gm-licht', 108, 64, 6, 5, 1.5) + re('gm-a-orange', 6, 64, 4, 5, 1.5);
    return s;
  },
  kaertchen: () => {
    let s = boden(60, 40);
    s += gr(re('gm-papier gm-kante', 14, 16, 92, 78, 6)
      + re('gm-tinte', 14, 16, 92, 16, 6) + pf('gm-tinte', 'M14,26H106V32H14Z') + re('gm-a-sonne', 22, 22, 26, 4, 2)
      + kr('gm-a-violett', 28, 46, 5) + re('gm-linie-flaeche', 38, 44, 50, 4, 2)
      + kr('gm-a-lagune', 28, 62, 5) + re('gm-linie-flaeche', 38, 60, 40, 4, 2)
      + kr('gm-a-sonne', 28, 78, 5) + re('gm-linie-flaeche', 38, 76, 46, 4, 2), [-4, 60, 55]);
    s += pf('gm-klammer', 'M84,8V26C84,30 90,30 90,26V12C90,8 96,8 96,12V30C96,36 86,36 86,30');
    return s;
  },
  pokal: () => boden(60, 26)
    + re('gm-tinte', 38, 90, 44, 12, 3) + re('gm-messing-s', 50, 72, 20, 20, 2)
    + pf('gm-henkel', 'M34,26C18,26 18,52 40,54M86,26C102,26 102,52 80,54')
    + pf('gm-messing', 'M30,16H90C90,46 80,70 60,72C40,70 30,46 30,16Z')
    + pf('gm-messing-s', 'M72,16H90C90,46 80,70 60,72C70,64 74,40 72,16Z')
    + pf('gm-papier', 'M60,26L64,35L74,36L66.5,42.5L69,52L60,47L51,52L53.5,42.5L46,36L56,35Z')
    + re('gm-messing', 46, 88, 28, 4, 1),
  projektblatt: () => boden(58, 34)
    + re('gm-papier gm-kante', 22, 10, 72, 92, 4) + re('gm-a-lagune', 22, 10, 72, 12, 4) + pf('gm-a-lagune', 'M22,16H94V22H22Z')
    + re('gm-linie-flaeche', 32, 32, 40, 4, 2) + re('gm-linie-flaeche-hell', 32, 42, 52, 3, 1.5) + re('gm-linie-flaeche-hell', 32, 50, 46, 3, 1.5) + re('gm-linie-flaeche-hell', 32, 58, 50, 3, 1.5)
    + pf('gm-unterschrift', 'M32,82C36,72 40,72 40,80C40,86 46,74 50,76C53,78 52,84 56,82C60,80 62,76 70,78')
    + pf('gm-strich', 'M32,88H72') + kr('gm-d-beere', 82, 84, 9) + kr('gm-siegel', 82, 84, 5.5),
  notizzettel: () => boden(60, 30)
    + gr(re('gm-s-sonne gm-kante-sonne', 22, 16, 76, 76, 3) + pf('gm-a-sonne', 'M22,16H98V26H22Z') + pf('gm-falz', 'M98,78L84,92H98Z'), [-5, 60, 54])
    + pf('gm-fragezeichen', 'M50,46C50,38 56,34 62,34C69,34 74,39 73,45C72,52 62,54 62,62V66') + kr('gm-d-sonne', 62, 76, 3.8),
  telefon: () => boden(58, 24)
    + re('gm-tinte', 40, 14, 38, 84, 8) + re('gm-glas', 44, 24, 30, 60, 3) + re('gm-geraet', 54, 18, 10, 2.4, 1.2) + kr('gm-geraet', 59, 91, 2.8)
    + kr('gm-a-gruen', 59, 46, 7) + kr('gm-a-beere', 59, 66, 7)
    + pf('gm-schwingung', 'M84,34Q90,42 84,50M92,28Q102,42 92,56M34,34Q28,42 34,50M26,28Q16,42 26,56'),
  kalender: () => {
    let s = boden(60, 40);
    s += re('gm-papier gm-kante', 16, 20, 88, 80, 6) + re('gm-a-blau', 16, 20, 88, 20, 6) + pf('gm-a-blau', 'M16,32H104V40H16Z');
    for (const x of [34, 86]) s += re('gm-tinte', x - 2, 12, 4, 14, 2);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) s += re(r === 2 && c === 3 ? 'gm-a-beere' : 'gm-papier-s', 24 + c * 13, 48 + r * 12, 9, 8, 1.5);
    return s;
  },
  absperrband: () => {
    let s = boden(60, 52);
    for (const x of [14, 104]) s += re('gm-stahl', x - 3, 30, 6, 74, 2) + re('gm-beton', x - 8, 98, 16, 8, 2) + kr('gm-d-beere', x, 30, 4);
    // Band in Streifen, leicht durchhängend
    for (const [y0, tiefe] of [[40, 6], [64, 8]] as const) {
      const n = 9;
      for (let i = 0; i < n; i++) {
        const xa = 14 + (90 * i) / n;
        const xb = 14 + (90 * (i + 1)) / n;
        const ya = r1(y0 + tiefe * Math.sin((Math.PI * i) / n));
        const yb = r1(y0 + tiefe * Math.sin((Math.PI * (i + 1)) / n));
        s += pf(i % 2 === 0 ? 'gm-a-beere' : 'gm-papier', `M${r1(xa)},${ya}L${r1(xb)},${yb}L${r1(xb)},${yb + 8}L${r1(xa)},${ya + 8}Z`);
      }
      s += pf('gm-band-kante', `M14,${y0}Q59,${y0 + tiefe * 2} 104,${y0}M14,${y0 + 8}Q59,${y0 + 8 + tiefe * 2} 104,${y0 + 8}`);
    }
    return s;
  },
  stempel: () => boden(60, 34)
    + el('gm-abdruck', 60, 92, 34, 8) + pf('gm-haken-beere', 'M46,92L56,98L74,86')
    + re('gm-holz', 50, 14, 20, 30, 8) + kr('gm-holz-o', 60, 16, 10) + re('gm-tinte', 36, 44, 48, 16, 3) + re('gm-a-beere', 32, 60, 56, 10, 2),
  rednerpult: () => boden(60, 34)
    + pf('gm-holz-r', 'M30,48H90L84,104H36Z') + pf('gm-holz', 'M26,40H94L90,52H30Z')
    + pf('gm-a-violett', 'M42,62H78V82H42Z') + pf('gm-linde-gross', 'M60,64C66,66 68,72 64,77C62,79 60.5,80 60,82C59.5,80 58,79 56,77C52,72 54,66 60,64Z')
    + pf('gm-mikro-arm', 'M68,40C68,26 74,20 82,16') + el('gm-tinte', 85, 13, 6, 8, 30),
  schluessel: () => boden(60, 30)
    + kr('gm-ring', 46, 30, 13)
    + tr(40, 46, -16, kr('gm-messing', 0, 0, 10) + kr('gm-loch', 0, 0, 3.5) + re('gm-messing', -3, 8, 6, 42, 2) + re('gm-messing', 3, 36, 8, 5, 1) + re('gm-messing', 3, 44, 6, 4, 1))
    + tr(56, 44, 14, kr('gm-stahl', 0, 0, 9) + kr('gm-loch', 0, 0, 3) + re('gm-stahl', -2.6, 7, 5.2, 36, 2) + re('gm-stahl', 2.6, 32, 7, 4, 1) + re('gm-stahl', 2.6, 38, 5, 3, 1))
    + pf('gm-schnur', 'M56,36L76,54') + tr(84, 64, 22, re('gm-a-lagune', -14, -10, 30, 20, 4) + kr('gm-papier', -8, 0, 3) + re('gm-papier', -1, -2, 11, 4, 2)),
  buch: () => boden(60, 46)
    + pf('gm-d-blau', 'M10,34C30,28 48,30 60,38C72,30 90,28 110,34V96C90,90 72,92 60,100C48,92 30,90 10,96Z')
    + pf('gm-papier', 'M14,32C32,26 48,28 58,36V94C48,88 32,86 14,92Z') + pf('gm-papier-s', 'M62,36C72,28 88,26 106,32V92C88,86 72,88 62,94Z')
    + pf('gm-strich-fein', 'M22,44C32,41 42,41 50,44M22,54C32,51 42,51 50,54M22,64C32,61 42,61 50,64M70,44C78,41 88,41 98,44M70,54C78,51 88,51 98,54')
    + pf('gm-a-sonne', 'M84,30L92,29V50L88,46L84,50Z'),
  mappe: () => boden(60, 44)
    + re('gm-papier gm-kante', 26, 16, 34, 44, 3) + re('gm-s-lagune gm-kante-lagune', 54, 12, 34, 44, 3) + re('gm-linie-flaeche', 60, 20, 18, 3, 1.5)
    + pf('gm-d-violett', 'M12,40H44L50,34H108V98H12Z') + pf('gm-a-violett', 'M12,48H108V98H12Z') + re('gm-papier', 46, 64, 28, 12, 2),
  matrix: () => {
    // R72: dieselben drei Klassen wie die Explore-Matrix (matrixFeldKlasse); oben Auswirkung 5, links Wahrscheinlichkeit 1
    let s = '';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) s += re(MATRIX_FARBE[matrixFeldKlasse(c + 1, 5 - r)], 14 + c * 19, 12 + r * 19, 16, 16, 3);
    s += re('gm-markierung', 69, 28, 22, 22, 5); // W 4 × A 4 = 16: vorrangig
    return s;
  },
  sonne: () => {
    let s = boden(60, 46);
    s += kr('gm-a-sonne', 60, 42, 18);
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5;
      s += pf('gm-strahl', `M${r1(60 + 24 * Math.cos(a))},${r1(42 + 24 * Math.sin(a))}L${r1(60 + 32 * Math.cos(a))},${r1(42 + 32 * Math.sin(a))}`);
    }
    s += pf('gm-a-gruen', 'M8,104C20,86 40,82 60,84C80,82 100,86 112,104Z');
    s += re('gm-holz', 30, 74, 34, 22, 1) + re('gm-holz-o', 30, 74, 34, 4, 1) + re('gm-glas', 36, 82, 6, 6) + re('gm-glas', 48, 82, 6, 6);
    s += re('gm-papier', 66, 80, 24, 16, 1) + re('gm-glas', 70, 85, 6, 5) + re('gm-glas', 80, 85, 6, 5);
    return s;
  },
  wegweiser: () => boden(60, 30)
    + re('gm-holz-r', 56, 18, 8, 88, 2)
    + pf('gm-a-lagune', 'M20,24H82L94,34L82,44H20Z') + pf('gm-a-orange', 'M100,52H40L28,62L40,72H100Z')
    + pf('gm-pfeil-weiss', 'M30,34H76M70,30L76,34L70,38') + pf('gm-umweg', 'M92,62C80,54 70,70 58,62C50,57 44,62 40,62'),
  stoppuhr: () => boden(60, 30)
    + re('gm-tinte', 54, 8, 12, 10, 2) + tr(89, 23, 40, re('gm-tinte', -5, -3, 10, 6, 2)) + kr('gm-d-beere', 60, 60, 38) + kr('gm-papier', 60, 60, 31)
    + pf('gm-teilung', 'M60,33V39M60,81V87M33,60H39M81,60H87')
    + pf('gm-a-beere', 'M60,60L60,33A27,27 0 0 1 83.4,46.5Z')
    + pf('gm-zeiger', 'M60,60L76,44') + kr('gm-tinte', 60, 60, 4),
  eintrag: () => boden(58, 34)
    // Blatt auf dem Klemmbrett, oben links die Uhr (Uhrzeit), rechts die Kamera (Fotos), darunter Zeilen mit Häkchen
    + re('gm-tinte', 18, 12, 80, 92, 6) + re('gm-papier gm-kante', 24, 20, 68, 78, 3) + re('gm-stahl', 44, 8, 28, 10, 3)
    + kr('gm-d-blau', 40, 38, 10) + kr('gm-papier', 40, 38, 7.4) + pf('gm-zeiger-fein', 'M40,38V33M40,38L44,40')
    + re('gm-a-lagune', 58, 30, 26, 17, 3) + re('gm-d-lagune', 62, 27, 8, 4, 1.5) + kr('gm-d-lagune', 71, 38.5, 6) + kr('gm-glas-hell', 71, 38.5, 3.6)
    + re('gm-linie-flaeche', 32, 58, 32, 3.4, 1.7) + re('gm-linie-flaeche-hell', 32, 68, 40, 3, 1.5) + re('gm-linie-flaeche-hell', 32, 78, 36, 3, 1.5)
    + pf('gm-haken-gruen', 'M72,82L77,87L86,74'),
  klemmbrett: () => {
    let s = boden(58, 34) + re('gm-holz-r', 20, 12, 78, 94, 6) + re('gm-papier gm-kante', 26, 22, 66, 78, 3) + re('gm-stahl', 43, 7, 32, 12, 3);
    for (const y of [38, 56, 74]) s += re('gm-papier-s gm-kante', 33, y - 6, 12, 12, 2) + re(y === 74 ? 'gm-linie-flaeche-hell' : 'gm-linie-flaeche', 51, y - 2, 32, 4, 2);
    return s + pf('gm-haken-gruen', 'M35,38L38.5,41.5L46,32') + pf('gm-haken-gruen', 'M35,56L38.5,59.5L46,50') + re('gm-s-violett', 51, 84, 26, 4, 2);
  },
  gabelung: () => boden(60, 32)
    + pf('gm-a-lagune', 'M50,106V70L30,48L22,56L18,22L52,26L44,34L60,52L76,34L68,26L102,22L98,56L90,48L70,70V106Z')
    + pf('gm-d-lagune', 'M50,94H70V106H50Z')
    + pf('gm-umweg', 'M60,100V62'),
  messlatte: () => {
    let s = boden(60, 50) + re('gm-papier gm-kante', 8, 50, 104, 26, 4);
    for (const [i, x] of [26, 46, 66, 86].entries()) s += pf('gm-teilung', `M${x},50V${i % 2 === 0 ? 64 : 60}`);
    s += re('gm-s-blau', 10, 66, 34, 8, 2) + re('gm-a-blau', 44, 66, 22, 8, 2) + re('gm-d-blau', 66, 66, 20, 8, 2);
    return s + pf('gm-d-sonne', 'M56,26H76L66,44Z') + re('gm-d-sonne', 64.5, 14, 3, 14, 1.5);
  },
  berichtsblatt: () => boden(58, 34)
    + re('gm-papier gm-kante', 26, 10, 66, 94, 4) + re('gm-linie-flaeche', 36, 20, 34, 4, 2)
    + kr('gm-a-gruen', 40, 38, 6) + kr('gm-a-sonne', 59, 38, 6) + kr('gm-a-gruen', 78, 38, 6)
    + re('gm-linie-flaeche-hell', 36, 54, 46, 3, 1.5) + re('gm-linie-flaeche-hell', 36, 62, 40, 3, 1.5) + re('gm-linie-flaeche-hell', 36, 70, 44, 3, 1.5)
    + re('gm-s-sonne gm-kante-sonne', 36, 80, 46, 14, 2) + re('gm-d-sonne', 40, 85, 22, 4, 2),
  werkzeugkasten: () => boden(60, 50)
    + pf('gm-stahl', 'M40,40V32C40,28 43,26 47,26H73C77,26 80,28 80,32V40H74V33H46V40Z')
    + tr(46, 50, -30, re('gm-holz', -3, -26, 6, 30, 2) + re('gm-tinte', -9, -32, 18, 9, 2))
    + tr(76, 46, 28, re('gm-stahl', -2.5, -22, 5, 28, 2) + kr('gm-stahl', 0, -24, 6) + kr('gm-loch', 0, -26, 3))
    + re('gm-d-orange', 14, 44, 92, 14, 3) + re('gm-a-orange', 14, 56, 92, 46, 4) + re('gm-d-orange', 52, 52, 16, 10, 2),
  // ------------------------------------------------------------------ P19.6
  stuhlreihen: () => {
    let s = boden(60, 52);
    const stuhl = (x: number, y: number, b: number, h: number, ton: 'blau' | 'lagune' | 'violett' | 'orange'): string =>
      re(`gm-d-${ton}`, x, y, b, h * 0.5, 3) + re(`gm-a-${ton}`, x + 2, y + 2, b - 4, h * 0.5 - 4, 2)
      + re(`gm-d-${ton}`, x - 2, y + h * 0.56, b + 4, 7, 3) + re('gm-tinte', x + 2, y + h * 0.56 + 6, 3.4, h * 0.44 - 5, 1) + re('gm-tinte', x + b - 5.4, y + h * 0.56 + 6, 3.4, h * 0.44 - 5, 1);
    // hintere Reihe mit zwei Menschen, die die Hand heben
    for (const [x, ton] of [[12, 'lagune'], [46, 'blau'], [80, 'violett']] as const) s += stuhl(x, 46, 28, 36, ton);
    for (const [cx, drehung] of [[26, -8], [94, 6]] as const) {
      s += pf('gm-arm', `M${cx},58L${cx + drehung},34`) + kr('gm-s-orange gm-kante', cx + drehung, 29, 5) + kr('gm-s-orange gm-kante', cx, 48, 7.6) + pf('gm-d-orange', `M${cx - 10},60C${cx - 10},52 ${cx - 4},52 ${cx},52C${cx + 4},52 ${cx + 10},52 ${cx + 10},60Z`);
    }
    // vordere Reihe, größer
    for (const [x, ton] of [[4, 'orange'], [44, 'lagune'], [84, 'blau']] as const) s += stuhl(x, 74, 32, 40, ton);
    return s;
  },
  schlagzeile: () => boden(58, 46)
    + gr(re('gm-papier gm-kante', 14, 12, 92, 96, 3) + re('gm-tinte', 20, 18, 80, 14, 2) + re('gm-papier', 28, 22, 64, 6, 2)
      + re('gm-linie-flaeche', 20, 38, 80, 6, 2) + re('gm-linie-flaeche', 20, 47, 66, 6, 2)
      + re('gm-glas-hell gm-kante', 20, 58, 36, 26, 2) + pf('gm-d-blau', 'M20,84L32,70L40,78L48,68L56,84Z')
      + re('gm-linie-flaeche-hell', 62, 60, 38, 3.4, 1.7) + re('gm-linie-flaeche-hell', 62, 67, 34, 3.4, 1.7) + re('gm-linie-flaeche-hell', 62, 74, 38, 3.4, 1.7) + re('gm-linie-flaeche-hell', 62, 81, 30, 3.4, 1.7)
      + re('gm-linie-flaeche-hell', 20, 91, 80, 3.4, 1.7) + re('gm-linie-flaeche-hell', 20, 98, 70, 3.4, 1.7), [-3, 60, 60]),
  'glocke-haken': () => boden(60, 30)
    + re('gm-holz-r', 30, 8, 60, 12, 3) + re('gm-papier gm-kante', 14, 16, 92, 92, 4)
    + pf('gm-haken', 'M60,24V34C60,40 70,40 70,34V28')
    + kr('gm-stahl', 60, 24, 3.4) + pf('gm-schnur', 'M70,28L62,44')
    + pf('gm-messing', 'M60,44C50,44 46,52 45,62C44,76 41,86 33,94L87,94C79,86 76,76 75,62C74,52 70,44 60,44Z')
    + pf('gm-messing-s', 'M67,46C72,51 74,58 75,66C76,78 79,87 87,94L75,94C72,80 72,60 67,46Z')
    + re('gm-messing-s', 31, 92, 58, 6, 3) + kr('gm-messing-s', 60, 104, 5)
    + pf('gm-glanz', 'M52,54C50,62 50,72 47,82L51,82C52,72 53,62 56,53Z'),
  angebotskalender: () => {
    let s = boden(60, 48);
    s += gr(re('gm-papier gm-kante', 10, 24, 62, 70, 5) + re('gm-a-blau', 10, 24, 62, 16, 5) + pf('gm-a-blau', 'M10,34H72V40H10Z'), [-4, 41, 59]);
    for (const x of [26, 56]) s += re('gm-tinte', x - 2, 18, 4, 12, 2);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) s += re(c === 3 && r === 1 ? 'gm-a-beere' : 'gm-papier-s', 17 + c * 13.4, 48 + r * 13, 10, 9, 1.6);
    // Preisschild mit Eurozeichen und Schnur
    s += pf('gm-schnur', 'M88,34L96,52') + gr(pf('gm-a-sonne gm-kante-sonne', 'M72,60H110L116,74L110,88H72Z') + kr('gm-papier', 80, 74, 3.4) + kr('gm-a-sonne', 100, 74, 9) + pf('gm-euro', 'M104,70C100,67 95,69 94.8,74C95,79 100,81 104,78.5M92.6,72.4H100M92.6,75.6H100'), [6, 92, 74]);
    return s;
  },
  pinnwand: () => {
    let s = boden(60, 48) + re('gm-holz-r', 8, 14, 104, 88, 5) + re('gm-kork', 13, 19, 94, 78, 3);
    // vier Zettel
    const zettel = (x: number, y: number, ton: 'sonne' | 'blau' | 'lagune' | 'orange', dreh: number): string => gr(re(`gm-s-${ton} gm-kante-${ton}`, x, y, 26, 22, 2) + re('gm-linie-flaeche', x + 4, y + 6, 14, 2.6, 1.3) + re('gm-linie-flaeche-hell', x + 4, y + 12, 18, 2.6, 1.3), [dreh, x + 13, y + 11]);
    s += zettel(18, 26, 'sonne', -4) + zettel(74, 24, 'blau', 5) + zettel(20, 64, 'lagune', 4) + zettel(72, 66, 'orange', -5);
    // Fäden: drei sind verbunden, einer endet lose
    s += pf('gm-faden', 'M31,37L87,36M87,36L85,77M31,37L33,75') + pf('gm-faden gm-faden-lose', 'M33,75C48,88 56,90 60,86');
    for (const [x, y] of [[31, 37], [87, 36], [85, 77], [33, 75]] as const) s += kr('gm-nadel', x, y, 3.2);
    return s;
  },
  haftzettel: () => boden(58, 34)
    + re('gm-papier gm-kante', 22, 12, 70, 92, 4) + re('gm-linie-flaeche', 32, 22, 38, 4, 2) + re('gm-linie-flaeche-hell', 32, 32, 50, 3, 1.5) + re('gm-linie-flaeche-hell', 32, 40, 44, 3, 1.5) + re('gm-linie-flaeche-hell', 32, 48, 48, 3, 1.5)
    + re('gm-linie-flaeche-hell', 32, 86, 40, 3, 1.5)
    + gr(re('gm-a-sonne', 44, 58, 54, 36, 2) + pf('gm-d-sonne', 'M44,64H98V58H46Z') + pf('gm-unterschrift gm-schrift-dunkel', 'M52,74C56,68 60,68 60,74C60,80 64,70 68,72C71,74 70,80 74,78M52,86C58,82 66,84 72,82C80,80 84,84 90,82'), [-4, 70, 76]),
  gespraechskarten: () => {
    let s = boden(58, 50);
    const karte = (x: number, y: number, ton: 'blau' | 'orange' | 'lagune' | 'sonne', dreh: number): string =>
      gr(re('gm-papier gm-kante', x, y, 40, 34, 3) + kr(`gm-a-${ton}`, x + 11, y + 12, 7) + kr('gm-s-orange', x + 11, y + 10, 3) + pf(`gm-d-${ton}`, `M${x + 5},${y + 22}C${x + 6},${y + 16} ${x + 16},${y + 16} ${x + 17},${y + 22}Z`)
        + re('gm-linie-flaeche', x + 22, y + 8, 14, 3, 1.5) + re('gm-linie-flaeche-hell', x + 22, y + 15, 14, 3, 1.5) + re('gm-linie-flaeche-hell', x + 5, y + 27, 30, 3, 1.5), [dreh, x + 20, y + 17]);
    s += karte(8, 10, 'blau', -4) + karte(56, 8, 'orange', 4) + karte(10, 52, 'lagune', 3) + karte(58, 50, 'sonne', -3);
    // kleiner Fristkalender vorn rechts unten
    s += re('gm-papier gm-kante', 90, 86, 24, 24, 3) + re('gm-a-beere', 90, 86, 24, 7, 3) + re('gm-papier-s', 94, 97, 6, 5, 1) + re('gm-papier-s', 103, 97, 6, 5, 1) + re('gm-a-beere', 94, 104, 6, 4, 1);
    return s;
  },
  musskarten: () => boden(60, 40)
    + pf('gm-trichter', 'M18,12H102L72,48V66H48V48Z') + pf('gm-trichter-s', 'M84,12H102L72,48V66H60C70,48 80,30 84,12Z') + re('gm-stahl', 48, 64, 24, 6, 2)
    + gr(re('gm-papier gm-kante', 12, 76, 44, 32, 4) + kr('gm-s-gruen', 26, 92, 9) + pf('gm-haken-gruen', 'M21,92L25,96L32,86') + re('gm-linie-flaeche', 38, 84, 14, 3, 1.5) + re('gm-linie-flaeche-hell', 38, 91, 14, 3, 1.5) + re('gm-linie-flaeche-hell', 38, 98, 12, 3, 1.5), [-3, 34, 92])
    + gr(re('gm-papier gm-kante', 64, 78, 44, 32, 4) + kr('gm-s-beere', 78, 94, 9) + pf('gm-kreuz-beere', 'M73,89L83,99M83,89L73,99') + re('gm-linie-flaeche', 90, 86, 14, 3, 1.5) + re('gm-linie-flaeche-hell', 90, 93, 14, 3, 1.5) + re('gm-linie-flaeche-hell', 90, 100, 12, 3, 1.5), [4, 86, 94])
    + pf('gm-pfeil-lagune', 'M46,70V74M44,72L46,75L48,72') + pf('gm-pfeil-beere', 'M76,70L84,76M80,74L84,76L83,71'),
  'genehmigung-auflage': () => boden(58, 38)
    + re('gm-papier gm-kante', 16, 10, 70, 96, 4) + re('gm-a-lagune', 16, 10, 70, 14, 4) + pf('gm-a-lagune', 'M16,18H86V24H16Z') + re('gm-papier', 26, 14, 30, 4, 2)
    + re('gm-linie-flaeche', 26, 34, 44, 4, 2) + re('gm-linie-flaeche-hell', 26, 44, 52, 3, 1.5) + re('gm-linie-flaeche-hell', 26, 52, 46, 3, 1.5) + re('gm-linie-flaeche-hell', 26, 60, 50, 3, 1.5)
    + kr('gm-d-beere', 36, 88, 11) + kr('gm-siegel', 36, 88, 7.4) + pf('gm-haken-weiss', 'M31,88L35,92L42,83')
    + pf('gm-unterschrift', 'M54,92C58,84 62,84 62,92C62,98 68,86 72,88C75,90 74,96 78,94')
    + gr(re('gm-s-sonne gm-kante-sonne', 62, 56, 46, 40, 3) + pf('gm-d-sonne', 'M85,62L99,86H71Z') + pf('gm-tinte', 'M84,70H86L85.4,80H84.6Z') + kr('gm-tinte', 85, 83, 1.4) + pf('gm-klammer', 'M66,52V62C66,66 72,66 72,62V54'), [5, 85, 76]),
  hallenboden: () => {
    let s = boden(60, 52);
    // Dielen in Reihen mit versetzten Stößen, leicht von oben links nach unten rechts verkürzt
    s += pf('gm-holz-r', 'M6,40L114,40L120,100L0,100Z');
    const reihen = [[40, 52], [52, 64], [64, 76], [76, 88], [88, 100]] as const;
    reihen.forEach(([y1, y2], i) => {
      const breite = (y: number): [number, number] => [6 - (6 * (y - 40)) / 60, 114 + (6 * (y - 40)) / 60];
      const [xa] = breite(y1), [, xb] = breite(y1);
      s += pf(i % 2 === 0 ? 'gm-holz' : 'gm-holz-o', `M${r1(xa)},${y1}L${r1(xb)},${y1}L${r1(breite(y2)[1])},${y2}L${r1(breite(y2)[0])},${y2}Z`);
      // Stöße
      const stoss = i % 2 === 0 ? [34, 78] : [20, 56, 92];
      for (const x of stoss) s += pf('gm-holz-fuge', `M${x + i},${y1}L${x + i + (x - 60) * 0.1},${y2}`);
    });
    s += pf('gm-holz-fuge', 'M6,40L114,40M3,52L117,52M2,64L118,64M1,76L119,76M0,88L120,88');
    // Spielfeldlinie
    s += pf('gm-feldlinie', 'M10,96L110,96M60,40L60,100');
    // zwei markierte Fugen: dunkle Spalte mit rotem Klebeband-Kreis und Pfeil
    s += pf('gm-spalt', 'M30,56L34,64M80,76L84,88') + kr('gm-markierung-beere', 32, 60, 8.4) + kr('gm-markierung-beere', 82, 82, 8.4) + pf('gm-pfeil-beere', 'M58,52L48,56M104,64L92,72');
    return s;
  },
  tasse: () => boden(58, 40)
    + el('gm-s-lagune gm-kante-lagune', 58, 92, 38, 9) + el('gm-d-lagune', 58, 90, 30, 6)
    + pf('gm-tasse', 'M30,48H88V70C88,84 78,92 59,92C40,92 30,84 30,70Z') + pf('gm-tasse-s', 'M72,50H88V70C88,82 80,90 66,92C72,84 74,66 72,50Z')
    + pf('gm-tasse-henkel', 'M88,56C102,54 104,74 86,76') + el('gm-a-orange', 59, 48, 29, 5) + el('gm-a-sonne', 59, 48, 26, 3.6)
    + pf('gm-teebeutel', 'M44,46L40,34M40,34L36,36') + re('gm-papier gm-kante', 30, 30, 10, 10, 1.5)
    + pf('gm-dampf', 'M50,38C44,30 54,26 48,16M64,38C58,30 68,26 62,16M78,38C72,30 82,26 76,16')
    + kr('gm-a-sonne gm-kante-sonne', 96, 88, 9) + kr('gm-s-sonne', 96, 88, 6.4) + pf('gm-zitrone', 'M96,88L96,80M96,88L103,88M96,88L91,94M96,88L90,86'),
  bruecke: () => {
    let boegen = 'M8,58H112V98H8Z';
    for (const x of [26, 60, 94]) boegen += `M${x - 12},98V82A12,12 0 0 1 ${x + 12},82V98Z`;
    return boden(60, 54)
      + `<path class="gm-a-blau" fill-rule="evenodd" d="${boegen}"/>`
      + re('gm-d-blau', 4, 50, 112, 10, 2)
      + pf('gm-a-lagune', 'M2,100C20,95 40,95 60,99C80,95 100,95 118,100V108H2Z')
      + pf('gm-riss', 'M43,50L46,57L41,63L46,70L42,78L45,86');
  },
};

/** Bildbeschreibung eines Gegenstands (deutsch). */
export function gimmickText(name: GimmickName): string {
  return GIMMICK_TEXT[name];
}

/** Gegenstand der Grafik-Liste als SVG (120 × 120 Einheiten, Vorgabe 96 px). */
export function gimmick(name: GimmickName, optionen: GimmickOptionen = {}): string {
  const px = typeof optionen.groesse === 'number' && Number.isFinite(optionen.groesse) ? Math.max(32, Math.min(240, Math.round(optionen.groesse))) : 96;
  const text = gimmickText(name);
  const zugang = optionen.dekorativ ? 'aria-hidden="true" focusable="false"' : `role="img" aria-label="${text}"`;
  const klasse = ['fig-gimmick', optionen.klasse].filter(Boolean).join(' ');
  return `<svg class="${klasse}" viewBox="0 0 120 120" width="${px}" height="${px}" ${zugang} data-gimmick="${name}" xmlns="http://www.w3.org/2000/svg">${optionen.dekorativ ? '' : `<title>${text}</title>`}${GIMMICK_SVG[name]()}</svg>`;
}
