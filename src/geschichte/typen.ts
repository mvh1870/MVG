/*
 * Typen der Story (P17.2, O-51/O-52): eine lineare Geschichte in acht Kapiteln aus Sicht der Projektleitung des
 * Bauherrn – je Kapitel eine Szene mit Dialog, eine Frage mit drei Antworten (gut · vertretbar · Falle), Folge-Szene,
 * drei Balken Geld · Zeit · Vertrauen (intern 0–10), „So macht man es gut“, „Das steckt dahinter“; in Kapitel 2, 4, 6
 * und 8 eine Mini-Aufgabe, in Kapitel 7 der gewichtete Vergleich. Erzeugt von werkzeuge/geschichte.mjs aus
 * inhalte/geschichte/*.yaml (docs/INHALTSFORMAT.md, Abschnitt 3). Alle *Html-Felder sind geprüftes HTML.
 */

export type BalkenId = 'geld' | 'zeit' | 'vertrauen';
export const BALKEN: readonly BalkenId[] = ['geld', 'zeit', 'vertrauen'];

/** Stufe eines Balkens am Ende: niedrig 0–3, mittel 4–6, hoch 7–10 */
export type BalkenStufe = 'niedrig' | 'mittel' | 'hoch';

/** Wirkung einer Antwort je Balken, je −2 … +2 */
export type Wirkung = Record<BalkenId, number>;

export type Wertung = 'gut' | 'vertretbar' | 'falle';
export const WERTUNGEN: readonly Wertung[] = ['gut', 'vertretbar', 'falle'];

export type FigurId = 'grundstein' | 'faden' | 'schwung' | 'klingel' | 'lot';
export const FIGUREN: readonly FigurId[] = ['grundstein', 'faden', 'schwung', 'klingel', 'lot'];

export type Jahreszeit = 'fruehling' | 'sommer' | 'herbst' | 'winter';
export type Licht = 'morgen' | 'tag' | 'abend';

export interface CampusBild {
  stufe: number;
  jahreszeit: Jahreszeit;
  licht: Licht;
  /** Besonderes Wetter (R72): „sturm“ – grauer Himmel, Böen, abgerissene Planen */
  wetter?: 'sturm';
}

export interface Figur {
  id: FigurId;
  name: string;
  /** Rolle in einem Wort oder kurzer Zeile („Bürgermeisterin“) */
  rolle: string;
  /** Ton der Akzentpalette (O-57, docs/STIL.md) */
  akzent: string;
  steckbriefHtml: string;
}

export interface BalkenDef {
  id: BalkenId;
  titel: string;
  /** Kurztext beim ersten Auftritt */
  html: string;
  start: number;
  /** Wort für „mehr“ bzw. „weniger“ („mehr Luft“, „gesunken“) */
  mehr: string;
  weniger: string;
  /** je Stufe am Ende ein Satz für die Bilanz */
  bilanz: Record<BalkenStufe, string>;
}

/** Bilanz-Typen in fester Prüfreihenfolge (src/geschichte/engine.ts, `bilanzTyp`) */
export type BilanzTyp = 'nicht-getragen' | 'letzte-meter' | 'ruhig' | 'umwege';
/** Was die Bilanz am Ende zeigt: einen Bilanz-Typ – oder, solange auf dem Weg Entscheidungen offen sind, den neutralen Text „offen“ (R73) */
export type BilanzSicht = BilanzTyp | 'offen';

export interface Zeile {
  /** sprechende Figur; null = Erzählung (kursiv, ohne Porträt) */
  figur: FigurId | null;
  /** Regieanweisung in Klammern („läutet ihre Glocke“) */
  zusatz: string | null;
  html: string;
  /** false = die Kurzfassung lässt die Zeile weg (P17.5); auf dem ganzen Weg steht sie immer */
  kurzfassung: boolean;
}

export interface Antwort {
  wertung: Wertung;
  html: string;
  wirkung: Wirkung;
  folgeHtml: string;
  /** Name einer kleinen Szenen-Grafik (src/grafik/figuren.ts, `gimmick`) */
  bild: string | null;
}

export type MiniArt = 'zuordnen' | 'reihenfolge';

export interface MiniPosten {
  html: string;
  /** zuordnen: Kennung der richtigen Wahl; reihenfolge: leer (die Reihenfolge der Liste ist die richtige) */
  loesung: string;
  erklaerungHtml: string;
  /** kleine Grafik auf der Karte (Name für `gimmick`) */
  bild: string | null;
}

export interface MiniWahl {
  id: string;
  titel: string;
  /** Porträt auf dem Knopf (z. B. „Wer entscheidet das?“) */
  figur: FigurId | 'sie' | null;
  /** feste Rückmeldung, wenn diese Wahl falsch ist (bei jedem Posten gleich) */
  falschHtml: string | null;
  /** kurze Bedeutung der Wahl, oben als Legende gezeigt (R75: lösbar ohne Fachwissen) */
  heisstHtml: string | null;
  /** kleine Grafik der Ablage (Name für `gimmick`), z. B. „übergeben“ → Mappe */
  bild: string | null;
}

export interface Mini {
  art: MiniArt;
  titel: string;
  aufgabeHtml: string;
  /** Grafik des Schritts (Name für `gimmick`, O-53) */
  bild: string;
  /** nur zuordnen: die Möglichkeiten je Posten */
  wahlen: MiniWahl[];
  posten: MiniPosten[];
}

export interface VergleichKriterium {
  id: string;
  titel: string;
  /** wie der Gesichtspunkt mitten im Satz heißt, mit Artikel („der Schulstart“, „Klima und Betrieb“) */
  imSatz: string;
  /** abgestimmte Stufe: 5 sehr wichtig · 3 wichtig · 1 weniger wichtig */
  gewicht: number;
}

export interface VergleichOption {
  id: string;
  titel: string;
  /** je Kriterium: Punkte 1–5 */
  punkte: Record<string, number>;
  /** je Kriterium: was der Weg in Worten bedeutet */
  worte: Record<string, string>;
}

export interface Vergleich {
  einleitungHtml: string;
  kriterien: VergleichKriterium[];
  optionen: VergleichOption[];
  /** Satz der Projektsteuerin je Lage: Kennung der vorn liegenden Option oder „gleichauf“ */
  saetze: Record<string, string>;
  empfehlungHtml: string;
  werHtml: string;
}

/** Verweis auf ein Explore-Werkzeug (E-13, P18.5): Adress-Kennung (#explore/<id>) und optional die Kennung eines Beispiels. */
export interface WerkzeugVerweis {
  id: string;
  beispiel: string | null;
}

export interface Kapitel {
  /** „k1“ … „k8“ (Adresse #story/k3) */
  id: string;
  nr: number;
  titel: string;
  /** Monat und Jahr („Januar 2026“) */
  zeit: string;
  campus: CampusBild;
  /** Campus nach der Folge (nur wo sich das Bild ändert, Kapitel 8) */
  campusNachher: CampusBild | null;
  /** Zusatz der Szenen-Grafik über dem Campus (Wimpel, Sturm …), Name für `gimmick` */
  zusatz: string | null;
  /** gehört zur Kurzfassung; sonst steht dort `brueckeHtml` */
  kurzfassung: boolean;
  brueckeHtml: string | null;
  /** Kennung des passenden Themas (#theorie/<thema>) */
  thema: string;
  /** Explore-Werkzeuge, die zum Kapitel passen (leise im Kasten „Das steckt dahinter“); leer = keine */
  werkzeuge: WerkzeugVerweis[];
  einstiegHtml: string;
  /** kürzerer Einstieg nur für die Kurzfassung (P17.5); null = dort steht `einstiegHtml` */
  einstiegKurzHtml: string | null;
  szene: Zeile[];
  /** kleine Grafik zur Szene bzw. zur Frage (Name für `gimmick`) */
  bildSzene: string | null;
  bildFrage: string | null;
  frageHtml: string;
  /** Antworten in der Reihenfolge der Seite; genau drei, je eine Wertung */
  antworten: Antwort[];
  gutHtml: string;
  dahinterHtml: string;
  /** nach der Folge das Kärtchen „Wer entscheidet was“ zeigen (Kapitel 1) */
  mandatNachFolge: boolean;
  mini: Mini | null;
  vergleich: Vergleich | null;
}

export interface Ende {
  zeit: string;
  campus: CampusBild;
  einstiegHtml: string;
  /** kürzerer Einstieg nur für die Kurzfassung (P17.5); null = dort steht `einstiegHtml` */
  einstiegKurzHtml: string | null;
  szene: Zeile[];
  /** zusätzlich nach dem Einstieg, wenn Zeit niedrig */
  zeitNiedrigHtml: string;
  /** Ersatzzeilen (je Figur), wenn Vertrauen niedrig – geht „nach einer Falle“ vor (src/geschichte/engine.ts, endeFassung) */
  vertrauenNiedrig: Zeile[];
  /** Ersatzzeilen (je Figur), wenn eine Falle gewählt ist und Vertrauen nicht niedrig (L-239) */
  nachFalle: Zeile[];
  /** Ersatzzeilen (je Figur), wenn auf dem Weg Entscheidungen offen sind, keine Falle gewählt und Vertrauen nicht niedrig (R73) */
  offen: Zeile[];
}

export interface Geschichte {
  titel: string;
  auftakt: { campus: CampusBild; textHtml: string; vorstellung: string; los: string; kurz: string };
  /** Steckbrief der Spielfigur „Sie“ */
  sieHtml: string;
  figuren: Figur[];
  balken: BalkenDef[];
  bilanz: Record<BilanzSicht, { titel: string; html: string }>;
  mandat: { titel: string; zeilen: { wer: string; html: string }[] };
  kapitel: Kapitel[];
  ende: Ende;
}

/** Regie-Material je Kapitel (nie auf der Leinwand) */
export interface GeschichteRegie {
  notizHtml: string;
  leitfragen: string[];
}
