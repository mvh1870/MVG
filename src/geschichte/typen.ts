/*
 * Typen der Story (P16.6, O-40): eine durchgehende Geschichte aus Sicht des Bauherrn, Stationen mit
 * Vorlagen der Projektsteuerung (≥ 2 Optionen, MCDA). Erzeugt von werkzeuge/geschichte.mjs aus
 * inhalte/geschichte/*.yaml; Format: docs/INHALTSFORMAT.md. Alle *Html-Felder sind geprüftes HTML.
 */

export type StatusSchluessel = 'kosten' | 'puffer' | 'offen';
export const STATUS_SCHLUESSEL: readonly StatusSchluessel[] = ['kosten', 'puffer', 'offen'];

export interface StatusDef {
  start: number;
  einheit: string;
  titel: string;
  /** Bezugswert (Kosten: Projektbasis) */
  basis: number | null;
}

export type Folgen = Partial<Record<StatusSchluessel, number>>;

export interface Kriterium {
  id: string;
  titel: string;
}

/** Text mit Bedingung: `wenn` ist null oder „s3=A“ bzw. „s3!=A“ (eine frühere Wahl). */
export interface Bedingt {
  html: string;
  wenn: string | null;
}

export type Vorgangsart = 'aufgabe' | 'massnahme' | 'fruehwarnung' | 'risiko' | 'problem' | 'aenderung';
export const VORGANGSARTEN: readonly Vorgangsart[] = ['aufgabe', 'massnahme', 'fruehwarnung', 'risiko', 'problem', 'aenderung'];

export interface Vorgang {
  art: Vorgangsart;
  kennung: string;
  titel: string;
  html: string;
  verantwortlich: string;
  termin: string;
  stand: string;
  /** nur Risiko: Wahrscheinlichkeit und Auswirkung, je 1–5 */
  matrix: { w: number; a: number } | null;
  wenn: string | null;
}

/** Punktwert 1–5 und seine Begründung (Euro, Tage) – die Zahlen bleiben neben den Punkten sichtbar. */
export type Punkt = [number, string];

export interface Option {
  id: string;
  titel: string;
  html: string;
  /** null bei einer Klärung (keine Option in der Sache) und bei Gewichte-Vorlagen */
  punkte: Record<string, Punkt> | null;
  /** nur Gewichte-Vorlage: die Gewichte dieser Variante */
  gewichte: Record<string, number> | null;
  /** Klärung statt Entscheidung in der Sache (unvollständige Vorlage) */
  klaerung: boolean;
  folgen: Folgen;
  konsequenzHtml: string;
  naechsteHtml: string | null;
}

export interface Vorlage {
  art: 'gewichte' | 'optionen';
  frage: string;
  grundHtml: string;
  stelle: string;
  termin: string;
  verzugHtml: string;
  muss: string | null;
  /** gesetzt = die Vorlage ist unvollständig; Text nennt den Klärungsbedarf */
  unvollstaendigHtml: string | null;
  optionen: Option[];
  empfehlung: { option: string; html: string };
}

export interface Station {
  id: string;
  nr: number;
  titel: string;
  kurztitel: string;
  datum: string;
  monat: number;
  lph: number;
  kurzfassung: boolean;
  lageHtml: string;
  lageFolgen: Folgen;
  bericht: { titel: string; zeilen: Bedingt[]; reaktion: string };
  vorgaenge: Vorgang[];
  vorlage: Vorlage;
  folgeHtml: string;
  soLaeuftHtml: string;
  einwand: { frage: string; antwortHtml: string };
  /** Kennung des passenden Theorie-Themas */
  theorie: string | null;
}

/** Regie-Material je Station (nie auf der Leinwand) */
export interface GeschichteRegie {
  notizHtml: string;
  leitfragen: string[];
}

export interface Geschichte {
  titel: string;
  status: Record<StatusSchluessel, StatusDef>;
  kriterien: Kriterium[];
  prolog: { titel: string; html: string; taktHtml: string };
  ende: { titel: string; html: string; pufferGut: string; pufferKnapp: string; pufferSchlecht: string };
  stationen: Station[];
}
