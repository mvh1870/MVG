/*
 * Typen von `src/generiert/inhalte.json` (erzeugt von werkzeuge/inhalte.mjs, Format:
 * docs/INHALTSFORMAT.md). Die Story-Typen erweitern das Engine-Modell (src/engine/typen.ts), damit
 * die Inhalte ohne Umbau als `StoryModell` in `wende()` gehen.
 *
 * Alle Felder mit HTML-Inhalt sind zur Bauzeit aus Markdown erzeugt; rohes HTML der Autoren ist dort
 * bereits maskiert. Glossarbezüge: `<span class="mvg-glossar" data-glossar="g-…" data-begriff="…">`,
 * Zitate: `<blockquote|q class="mvg-zitat" data-absatz="k2.4-p2">`.
 */

import type {
  Freischaltung, Kante, ModellEntscheidung, ModellFrage, ModellInfo, ModellOption, ModellRolle, ModellRueckbezug,
  ModellSchritt, ModellStation, ModellSzene, SchrittArt, StationArt, StoryModell, Welt, WirkEintrag,
} from '../engine/typen.ts';

/** Kopfdaten nach Umwandlung (Zahlen, Listen, ja/nein, verschachtelte Karten). Schlüssel in camelCase. */
export type KopfWert = string | number | boolean | null | KopfWert[] | { [schluessel: string]: KopfWert };

export interface ListenPunkt {
  /** Kennung `{#id}` oder null */
  id: string | null;
  /** nur in Checklisten: erfüllt `[x]`, fehlt `[-]`, noch offen `[ ]` */
  stand: 'erfuellt' | 'fehlt' | 'offen' | null;
  /** Inline-HTML */
  html: string;
}

/**
 * Ein Baustein (Container) – allgemein, damit neue Arten ohne Typänderung durchgehen.
 * Welche Kopfdaten und Felder eine Art hat, steht in docs/INHALTSFORMAT.md 3.3/3.4/4.x.
 */
export interface Block {
  art: string;
  kennungen: string[];
  /** erste Kennung oder null */
  id: string | null;
  kopf: Record<string, KopfWert>;
  /** Feldname → HTML (bei `zitat`/`original`: das fertige Zitat bzw. der Originaltext) */
  felder: Record<string, string>;
  /** `bekannt`, `unbekannt`, `vorlage` (Checkliste) */
  liste: ListenPunkt[] | null;
  kinder: Block[];
  /** nur bei `ebenen` innerhalb einer Theorie-Seite */
  ebenen?: Ebene[];
}

export interface Schritt extends ModellSchritt {
  art: SchrittArt;
  titel: string;
  kurz: string;
  gruppe: string | null;
  uhr: string | null;
  /** übrige Kopfdaten (z. B. `folgt` bei der Rollenwahl) */
  kopf: Record<string, KopfWert>;
  felder: Record<string, string>;
  bloecke: Block[];
}

export interface Info extends ModellInfo {
  /** Schritt, in dem der Zeitsprung steht */
  schritt: string;
}

export interface Option extends ModellOption {
  titel: string;
  symbol: string | null;
  felder: { konsequenz: string; wasFehlt: string; neuesRisiko: string; governanceFrage: string };
}

export interface Entscheidung extends ModellEntscheidung {
  /** Frage als Text („Was tun Sie?“) */
  frage: string;
  optionen: Option[];
  /** HTML unter jeder Konsequenz */
  nachsatz: string | null;
}

export interface Antwort {
  id: string;
  titel: string;
  praefix: string | null;
  symbol: string | null;
  html: string;
}

export interface Frage extends ModellFrage {
  schritt: string | null;
  felder: { frage: string; rueckmeldung?: string };
  antworten: Antwort[];
}

export interface Szene extends ModellSzene {
  station: string;
  entscheidung: Entscheidung | null;
  fragen: Frage[];
  rueckbezug: ModellRueckbezug | null;
  quelle: string;
}

export interface Ebene {
  /** 1 Kernaussage · 2 Warum relevant · 3 Vertiefung · 4 Nachweis */
  nr: number;
  titel: string;
  felder: Record<string, string>;
  bloecke: Block[];
}

export interface Standpunkt {
  rolle: string;
  figur: string;
  html: string;
}

export interface Station extends ModellStation {
  art: StationArt;
  welt: Welt | null;
  monat: number | null;
  titel: string;
  kurztitel: string;
  lph: number | null;
  uhr: string | null;
  /** Absatz-IDs */
  whitepaper: string[];
  statusStart: WirkEintrag[] | null;
  weiter: Kante[];
  schaltetFrei: Freischaltung[];
  einleitung: string;
  schritte: Schritt[];
  infos: Info[];
  ebenen: Ebene[] | null;
  standpunkte: Standpunkt[];
  szenen: Record<string, Szene>;
  quelle: string;
}

export interface Figur {
  id: string;
  name: string;
  /** Rollen-ID oder null */
  rolle: string | null;
  funktion: string;
  farbe: string;
  spieler: boolean;
  felder: { kurzbeschreibung?: string; stimme?: string };
}

export interface Fall {
  hinweis: string;
  stadt: string;
  bauherr: string;
  vertretung: string;
  vertretungKurz: string | null;
  projekt: string;
  bauteile: string[];
  bauweise: string | null;
  projektbasis: string;
  projektbasisMio: number | null;
  gremien: string[];
  /** Kalendermonat von Monat 0, z. B. „2025-12“. */
  monat0: string | null;
  /** Zeitachse: Monat (0–12) → LPH-Stand. */
  lphStand: Record<string, number>;
  einleitung: string;
  figuren: Record<string, Figur>;
}

export interface Rolle extends ModellRolle {
  titel: string;
  kurztitel: string;
  farbe: string;
  textfarbe: string | null;
  figur: string | null;
  whitepaper: string[];
  /** Kap. 3.2: delegierbar = Arbeit, die diese Rolle trägt oder weitergibt; nichtDelegierbar = was beim Bauherrn bzw. außerhalb ihres Mandats bleibt */
  felder: { text?: string; linse?: string; delegierbar?: string; nichtDelegierbar?: string };
  quelle: string;
}

export interface Interesse {
  id: string;
  titel: string;
  html: string;
}

export interface GlossarEintrag {
  id: string;
  begriff: string;
  definition: string;
}

export interface TheorieSeite {
  id: string;
  kapitel: number;
  titel: string;
  kurztitel: string;
  grafik: string | null;
  story: string[];
  deckt: string[];
  einleitung: string;
  bloecke: Block[];
  quelle: string;
}

export interface Einwand {
  id: string;
  stationen: string[];
  kapitel: string[];
  felder: { einwand?: string; antwort?: string };
  bloecke: Block[];
}

export interface Abdeckung {
  /** Blöcke im Whitepaper */
  gesamt: number;
  /** davon einer Theorie-Seite zugeordnet */
  zugeordnet: number;
  /** 0 … 1 */
  anteil: number;
  ziele: Record<string, { theorie: string[]; story: string[] }>;
}

/** Regie-Material: Sprechernotiz (HTML) und Leitfragen (Inline-HTML). Nie auf der Leinwand. */
export interface RegieEintrag {
  notiz: string | null;
  leitfragen: string[];
}

/** Gliederung des Whitepapers (Kapitel mit Abschnitten), für die Kapitelliste der Theorie. */
export interface WhitepaperKapitel {
  /** `k1` … `k13` */
  id: string;
  nr: string;
  titel: string;
  abschnitte: { id: string; nr: string; titel: string }[];
}

/** Eine Leistungsphase aus dem Freigabemodell (Tabelle k9.3-t1, wörtlich), für das LPH-Band. */
export interface LphPhase {
  nr: number;
  name: string;
  freigabefrage: string;
}

/** Startseite (inhalte/start.md, O-21) */
export interface Startseite {
  kicker: string;
  /** Leitsatz, wörtlich aus dem Whitepaper, wenn `titelQuelle` gesetzt ist */
  titel: string;
  titelQuelle: string | null;
  /** Inline-HTML */
  these: string;
}

export interface Inhalte extends StoryModell {
  version: 1;
  whitepaper: { fassung: string | null; titel: string | null; kapitel: WhitepaperKapitel[]; lph: LphPhase[] };
  fall: Fall | null;
  startseite: Startseite | null;
  rollen: Record<string, Rolle>;
  rollenFolge: string[];
  interessen: Interesse[];
  start: string;
  stationen: Record<string, Station>;
  stationsFolge: string[];
  glossar: Record<string, GlossarEintrag>;
  theorie: Record<string, TheorieSeite>;
  einwaende: Einwand[];
  abdeckung: Abdeckung;
  /** Schlüssel `A3` (Station) oder `A3/pl` (Rollenszene) */
  regie: Record<string, RegieEintrag>;
}

/**
 * Was jede Fläche (auch die Leinwand) sehen darf. `regie?: never` macht den Typ streng: Ein volles
 * `Inhalte` (mit Regie-Material) ist NICHT zuweisbar, strukturell wie als Objektliteral.
 */
export type OeffentlicheInhalte = Omit<Inhalte, 'regie'> & { regie?: never };
