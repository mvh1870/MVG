/*
 * Typen der Story-Engine (docs/ARCHITEKTUR.md „Zustand und Aktionen“).
 *
 * Zwei Hälften:
 * - das STORY-MODELL: der Ausschnitt der Inhalte, den die Engine zum Rechnen braucht (Stationen,
 *   Schritte, Kanten, Optionen mit Statuswirkung). `src/inhalte/typen.ts` erweitert diese Typen, so
 *   dass die generierte `inhalte.json` direkt als Modell dient – ohne zweite Wahrheit.
 * - der ZUSTAND: ein einziges serialisierbares Objekt, geändert nur über `wende()`.
 *
 * Nur Typen, keine Werte: diese Datei darf von überall importiert werden, ohne Laufzeitkanten.
 */

export type Welt = 'A' | 'B';
export type Bereich = 'start' | 'story' | 'theorie' | 'explore';

/* ------------------------------------------------------------------ Status -- */

/** Stufen für Kostenunsicherheit und Terminrisiko (aufsteigend). */
export type Stufe = 'niedrig' | 'mittel' | 'hoch' | 'sehr hoch';

export type StatusSchluessel =
  | 'entscheidungsfaehigkeit'
  | 'kostenunsicherheit'
  | 'offeneRisiken'
  | 'ungeklaerteEntscheidungen'
  | 'terminrisiko';

/** Die fünf Instrumente des Statusbereichs (BAUPLAN Abschnitt 3). */
export interface Status {
  /** 0–5 */
  entscheidungsfaehigkeit: number;
  kostenunsicherheit: Stufe;
  /** ≥ 0 */
  offeneRisiken: number;
  /** ≥ 0 */
  ungeklaerteEntscheidungen: number;
  terminrisiko: Stufe;
  /** Zusatz je Wert, z. B. offeneRisiken: „1 neu bewertet“. */
  hinweise: Partial<Record<StatusSchluessel, string>>;
}

/**
 * Eine Statuswirkung auf einen Wert. `setze`: Zahl bzw. Stufe; `aendere`: Zahl (bei Stufen:
 * Anzahl Stufen). Der Hinweis ersetzt den bisherigen Hinweis dieses Werts (null = löschen).
 */
export interface WirkEintrag {
  schluessel: StatusSchluessel;
  art: 'setze' | 'aendere';
  wert: number | Stufe;
  hinweis: string | null;
}

/* -------------------------------------------------------------- Bedingungen -- */

export type Vergleich = '=' | '!=' | '<' | '<=' | '>' | '>=';
export type Freischaltung = 'weltB' | 'explore';

/** Bedingungen für Kanten (docs/INHALTSFORMAT.md 2.8), zur Bauzeit aus Text übersetzt. */
export type Bedingung =
  | { art: 'wahl'; entscheidung: string; optionen: string[]; nicht: boolean }
  | { art: 'antwort'; frage: string; antworten: string[]; nicht: boolean }
  | { art: 'rolle'; rollen: string[]; nicht: boolean }
  | { art: 'welt'; welt: Welt; nicht: boolean }
  | { art: 'interesse'; interesse: string; nicht: boolean }
  | { art: 'info'; info: string; nicht: boolean }
  | { art: 'besucht'; station: string; nicht: boolean }
  | { art: 'freigeschaltet'; was: Freischaltung; nicht: boolean }
  | { art: 'status'; welt: Welt; schluessel: StatusSchluessel; vergleich: Vergleich; wert: number | Stufe; nicht: boolean }
  | { art: 'alle'; bedingungen: Bedingung[]; nicht: boolean }
  | { art: 'eine'; bedingungen: Bedingung[]; nicht: boolean };

/* ------------------------------------------------------------ Story-Modell -- */

export type StationArt =
  | 'prolog'
  | 'station'
  | 'vergleich'
  | 'wendepunkt'
  | 'rueckspulen'
  | 'wirklichkeit'
  | 'ende'
  | 'epilog';

export type SchrittArt =
  | 'text'
  | 'lage'
  | 'entscheidung'
  | 'konsequenz'
  | 'rueckbezug'
  | 'vergleich'
  | 'rollenwahl'
  | 'interessenwahl'
  | 'ebenen';

export interface Kante {
  ziel: string;
  wenn: Bedingung | null;
}

export interface ModellSchritt {
  id: string;
  art: SchrittArt;
}

/** Eine anforderbare Information („Weitere Informationen anfordern“ → Zeitsprung). */
export interface ModellInfo {
  id: string;
  wirkung: WirkEintrag[];
}

export interface ModellOption {
  id: string;
  /** Kurzform für Spur und Rückbezug („Weiterarbeiten“). */
  kurz: string;
  wirkung: WirkEintrag[];
}

export interface ModellEntscheidung {
  /** Entscheidungs-Kennung, Vorgabe `<station>/<rolle>`. */
  id: string;
  optionen: ModellOption[];
}

export interface ModellFrage {
  id: string;
  antworten: { id: string }[];
}

export interface ModellRueckbezug {
  /** Entscheidung, auf deren Wahl sich die Texte beziehen (aufgelöste Kennung, z. B. `A3/pl`). */
  auf: string;
  /** Option → HTML */
  texte: Record<string, string>;
  /** HTML, wenn keine Wahl vorliegt */
  ohne: string | null;
}

export interface ModellSzene {
  rolle: string;
  entscheidung: ModellEntscheidung | null;
  fragen: ModellFrage[];
  rueckbezug: ModellRueckbezug | null;
}

export interface ModellStation {
  id: string;
  art: StationArt;
  welt: Welt | null;
  schritte: ModellSchritt[];
  weiter: Kante[];
  ende: boolean;
  schaltetFrei: Freischaltung[];
  statusStart: WirkEintrag[] | null;
  vergleich: { a: string; b: string } | null;
  partner: string | null;
  infos: ModellInfo[];
  szenen: Record<string, ModellSzene>;
}

export interface ModellRolle {
  id: string;
  spielbar: boolean;
}

export interface StoryModell {
  start: string;
  stationen: Record<string, ModellStation>;
  rollen: Record<string, ModellRolle>;
  interessen: { id: string }[];
}

/* ------------------------------------------------------------------ Zustand -- */

export interface SpurEintrag {
  /** laufende Nummer ab 1 (Reihenfolge der ersten Wahl) */
  nr: number;
  entscheidung: string;
  station: string;
  welt: Welt | null;
  rolle: string;
  option: string;
  /** wie oft innerhalb der Szene umentschieden wurde */
  wechsel: number;
  /** Zeitstempel aus der Aktion (die Engine liest keine Uhr) */
  zeit: number | null;
}

export interface ProtokollEintrag {
  nr: number;
  station: string | null;
  schritt: number;
  text: string;
  zeit: number;
}

export interface Zustand {
  version: 1;
  bereich: Bereich;
  rolle: string | null;
  interessen: string[];
  welt: Welt;
  station: string | null;
  /** Index in `schritteFuer(station, rolle)` */
  schritt: number;
  /** Schieberegler 0 (Welt A) … 1 (Welt B) */
  vergleich: number;
  /** Entscheidungs-Kennung → Option */
  entscheidungen: Record<string, string>;
  /** `<station>/<rolle>/<frage>` → Antwort */
  antworten: Record<string, string>;
  spur: SpurEintrag[];
  /** Weg durch die Stationen (Stapel; `zurueck` nimmt den letzten weg) */
  verlauf: string[];
  /** je Welt; null, solange keine Station dieser Welt einen Stand gesetzt hat */
  status: { A: Status | null; B: Status | null };
  /** angeforderte Informationen `<station>/<info>` */
  info: string[];
  /** geöffnete Ebene 0 (zu) bis 4 */
  ebene: number;
  /** Anzeige-Wahl ohne Entscheidungscharakter (z. B. Mandatsleiter Option 1/2), damit die Leinwand sie spiegelt */
  ansicht: Record<string, string>;
  freigeschaltet: { weltB: boolean; explore: boolean };
  theorie: { kapitel: number | null };
  /** Regie-Eigenes: erreicht die Leinwand nie (oeffentlich() lässt es weg) */
  regie: { protokoll: ProtokollEintrag[] };
}

/** Was über den Kanal an die Leinwand geht. */
export type OeffentlicherZustand = Omit<Zustand, 'regie'>;

/* ----------------------------------------------------------------- Aktionen -- */

export type Aktion =
  | { art: 'wechsleBereich'; bereich: Bereich }
  | { art: 'starteStory' }
  | { art: 'waehleRolle'; rolle: string }
  | { art: 'setzeInteressen'; interessen: string[] }
  | { art: 'weiter' }
  | { art: 'zurueck' }
  | { art: 'geheZu'; station: string; schritt?: number }
  | { art: 'waehle'; option: string; zeit?: number }
  | { art: 'antworte'; frage: string; antwort: string }
  | { art: 'fordereInfo'; info: string }
  | { art: 'setzeVergleich'; wert: number }
  | { art: 'setzeEbene'; ebene: number }
  | { art: 'zeige'; schluessel: string; wert: string }
  | { art: 'schalteFrei'; was: Freischaltung }
  | { art: 'oeffneKapitel'; kapitel: number }
  | { art: 'notiere'; text: string; zeit: number }
  | { art: 'neustart' };

export type AktionsArt = Aktion['art'];

/** Ergebnis mit Begründung (für Parser, die im Werkzeug und in der Engine laufen). */
export type Ergebnis<T> = { ok: true; wert: T } | { ok: false; fehler: string };
