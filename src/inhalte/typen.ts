/*
 * Typen von `src/generiert/inhalte.json` (erzeugt von werkzeuge/inhalte.mjs, Format:
 * docs/INHALTSFORMAT.md): Themen der Theorie, Story (src/geschichte/typen.ts), Explore-Texte, Glossar.
 *
 * Alle Felder mit HTML-Inhalt sind zur Bauzeit aus Markdown erzeugt; rohes HTML der Autoren ist dort
 * bereits maskiert. Glossarbezüge: `<span class="mvg-glossar" data-glossar="g-…" data-begriff="…">`,
 * Zitate: `<blockquote|q class="mvg-zitat" data-absatz="k2.4-p2">`.
 */

import type { Geschichte, GeschichteRegie, WerkzeugVerweis } from '../geschichte/typen.ts';
import type { Ampel } from '../werkzeuge/gemeinsam.ts';
import type { Antwort, Gegenstand, MandatsGrund, MandatsRegel, Stelle, WegZustand } from '../werkzeuge/vorlagen-check.ts';
import type { Art, FrageId, Wahl, Zusatz } from '../werkzeuge/wegweiser.ts';
import type { GrenzFehler, Wert } from '../werkzeuge/risiko-grenzen.ts';
import type { AmpelId, Farbe } from '../werkzeuge/monatsbericht.ts';
export type { Geschichte, GeschichteRegie, WerkzeugVerweis };

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

export interface Ebene {
  /** 1 Kernaussage · 2 Warum relevant · 3 Vertiefung · 4 Nachweis */
  nr: number;
  titel: string;
  felder: Record<string, string>;
  bloecke: Block[];
}

export interface GlossarEintrag {
  id: string;
  begriff: string;
  definition: string;
  /** wo der Begriff markiert ist (P6.14): Kapitelnummern der Themen */
  vorkommen: { kapitel: number[] };
}

/** Teile der Themen (O-54): 1 Grundlagen · 2 Führungsmodell und Arbeitsweise · 3 Anwendung und Einführung · 4 Werkzeuge der Praxis. */
export type TheorieTeil = 1 | 2 | 3 | 4 | 'anhang';

export interface TheorieSeite {
  id: string;
  kapitel: number;
  /** Kennung in der Adresse (#theorie/<thema>, P16.3) */
  thema: string;
  /** Reihenfolge der Themen */
  reihe: number;
  titel: string;
  kurztitel: string;
  /** Nummer in Leserichtung (1 …, P17.8, O-54); vom Compiler aus `reihe` gesetzt */
  nr: number;
  /** Teil des Buchs: I–IV oder Anhang (O-54) */
  teil: TheorieTeil;
  /** ein Satz fürs Inhaltsverzeichnis (≤ 90 Zeichen) */
  kurzsatz: string;
  /** Name eines Symbols aus src/stil/symbole.ts */
  symbol: string;
  deckt: string[];
  /** Explore-Werkzeuge zum Thema (E-13, P18.5), am Seitenende leise verlinkt; leer = keine */
  werkzeuge: WerkzeugVerweis[];
  einleitung: string;
  bloecke: Block[];
  quelle: string;
}

/**
 * Begriffs-Kompass (P10.5, E7): ein Whitepaper-Begriff und die Wörter, die Kunden oft stattdessen
 * benutzen. `beleg` = Absatz-ID, in deren Text der Begriff steht; `glossar` = Glossar-ID oder null.
 */
export interface KompassEintrag {
  id: string;
  begriff: string;
  andere: string[];
  beleg: string;
  glossar: string | null;
  /** Inline-HTML oder null */
  hinweis: string | null;
}

export interface Abdeckung {
  /** Blöcke im Whitepaper */
  gesamt: number;
  /** davon einer Theorie-Seite zugeordnet */
  zugeordnet: number;
  /** 0 … 1 */
  anteil: number;
  ziele: Record<string, { theorie: string[] }>;
}

/** Regie-Material: Sprechernotiz (HTML) und Leitfragen (Inline-HTML). Nie auf der Leinwand. */
export interface RegieEintrag {
  notiz: string | null;
  leitfragen: string[];
}

/** Abbildung der DOCX V1.2 (P8.5; Bild seit P14, O-32, L-77) */
export interface Abbildung {
  id: string;
  /** laufende Nummer in der Reihenfolge des Texts (1 = erste Inhaltsabbildung) */
  nr: number;
  kapitel: string;
  /** Absatz- oder Abschnitts-ID, bei der die Abbildung steht */
  ort: string;
  /** Bild mit Beschreibung (inhalte/abbildungen/abb-N.yaml); null = nur Verzeichniseintrag */
  bild: AbbildungsBild | null;
}

export interface AbbildungsBild {
  titel: string;
  alt: string;
  breite: number;
  hoehe: number;
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

export interface Inhalte {
  version: 1;
  /** Abbildungen mit Bildbeschreibung (Bilddaten getrennt in abbildungen.json) */
  abbildungen: Abbildung[];
  startseite: Startseite | null;
  glossar: Record<string, GlossarEintrag>;
  theorie: Record<string, TheorieSeite>;
  kompass: KompassEintrag[];
  abdeckung: Abdeckung;
  /** Regie-Material der Themen, Schlüssel `theorie/k3` bzw. `theorie/k3/k3.2` */
  regie: Record<string, RegieEintrag>;
  /** Story (P16.6, O-40) */
  geschichte: Geschichte | null;
  /** Regie-Notizen der Story je Kapitel */
  geschichteRegie: Record<string, GeschichteRegie>;
  /** Texte der Explore-Werkzeuge (P16.8) */
  werkzeuge: Werkzeuge | null;
  /** Regie-Notizen der vier neuen Werkzeuge je Adress-Kennung (`vorlagen-check` …, P18.5) */
  werkzeugeRegie: Record<string, GeschichteRegie>;
}

/** Dreiteiliger Vorspann je Werkzeug: wozu, was Sie eintragen, was das Ergebnis heißt (L-322) */
export interface WerkzeugVorspann { wozu: string; eingabe: string; ergebnis: string }

interface WerkzeugTeil { titel: string; kurz: string; vorspann: WerkzeugVorspann; html: string }

/** Explore-Werkzeuge (inhalte/werkzeuge.yaml, P16.8, O-46) */
export interface Werkzeuge {
  einleitungHtml: string;
  mcda: WerkzeugTeil & { hinweisHtml: string };
  matrix: WerkzeugTeil & {
    stufen: { id: string; titel: string; von: number; bis: number; html: string }[];
    regel: string;
    sonder: string;
    wahrscheinlichkeit: string[];
    qualitaet: string[];
    beispiele: { kennung: string; titel: string; w: number; a: number }[];
  };
  vorgaenge: WerkzeugTeil & {
    arten: { id: string; titel: string; html: string; beispiel: string; abschluss: string; wege: string[] }[];
    entscheidung: { titel: string; html: string };
  };
  takt: WerkzeugTeil & { stufen: { id: string; titel: string; wer: string; html: string; beispiel: string }[] };
  glossar: WerkzeugTeil;
  /** Vier neue Werkzeuge (P18.3/P18.4, O-59; Konzept docs/WERKZEUGE-P18.md, Rechenkerne src/werkzeuge/) */
  vorlagencheck: VorlagenCheckTeil;
  wegweiser: WegweiserTeil;
  risikogrenzen: RisikoGrenzenTeil;
  monatsbericht: MonatsberichtTeil;
}

/** A · Vorlagen-Check: Prüfpunkte je Schritt, Stellen, Wege, feste Zuordnung des Beispielprojekts (nur mit Beispiel, O-46). */
export interface VorlagenCheckTeil extends WerkzeugTeil {
  ampel: Record<Ampel, string>;
  schritte: {
    id: string;
    titel: string;
    punkte: { id: string; muss: boolean; art: 'zaehlung' | null; mindestens: number | null; kurz: string; frage: string; schliessen: string }[];
  }[];
  stellen: { id: Stelle; titel: string; ohneBeispiel: string | null; satz: string | null }[];
  wegzustaende: { id: WegZustand; titel: string; satz: string | null }[];
  dringlich: { frage: string; satz: string };
  gegenstaende: { id: Gegenstand; titel: string }[];
  mandat: MandatsRegel & {
    saetze: {
      falsch: string;
      gruende: Record<MandatsGrund, string>;
      beraet: Record<'buergermeisterin' | 'sie' | 'unbestimmt', string>;
      unbestimmt: string;
      selbst: string;
    };
  };
  beispiele: {
    id: string;
    titel: string;
    lage: string;
    gegenstand: Gegenstand;
    stelle: Stelle;
    betrag: number | null;
    reserve: boolean | null;
    wege: { titel: string; zustand: WegZustand }[];
    antworten: Record<string, Antwort>;
  }[];
}

/** B · Vorgangs-Wegweiser: Texte der Fragen, Ergebnisteile je Art, Zusätze, Verwechslungen, Sachverhalte. */
export interface WegweiserTeil extends WerkzeugTeil {
  fragen: { id: FrageId; frage: string }[];
  ergebnisse: { art: Art; schritt: string; festhalten: string }[];
  zusaetze: Record<Zusatz, { titel: string; text: string }>;
  verwechslungen: { id: string; art: Art; text: string }[];
  beispiele: { id: string; titel: string; text: string; antworten: Partial<Record<FrageId, Wahl>> }[];
}

/** Eingabe einer Zeile im Beispiel des Risiko-Bewerters (wie `Wert` im Kern). */
export type RisikoBeispielWert = Wert;

/** C · Risiko-Bewerter mit eigenen Grenzen. */
export interface RisikoGrenzenTeil extends WerkzeugTeil {
  grenzen: { wahrscheinlichkeit: number[]; kosten: number[]; termin: number[] };
  zustaende: Record<'fest' | 'vorlaeufig' | 'offen', string>;
  warnanlaesse: { id: string; titel: string }[];
  grenzfehler: Record<GrenzFehler, string>;
  saetze: Record<string, string>;
  beispiele: {
    id: string;
    kennung: string;
    titel: string;
    w: RisikoBeispielWert;
    kosten: RisikoBeispielWert;
    termin: RisikoBeispielWert;
    qualitaet: RisikoBeispielWert;
    warn: string[];
    massnahme: 'keine' | 'geplant' | 'belegt';
    schwelle: boolean;
    prognose: 'ja' | 'nein' | 'teilweise';
    puffer: boolean | null;
    waswaere: { id: string; titel: string; w: RisikoBeispielWert | null; termin: RisikoBeispielWert | null; massnahme: 'keine' | 'geplant' | 'belegt' | null }[];
  }[];
}

/** D · Monatsbericht-Baukasten. */
export interface MonatsberichtTeil extends WerkzeugTeil {
  ampel: Record<Ampel, string>;
  ampeln: { id: AmpelId; titel: string }[];
  farben: Record<Farbe, string>;
  abschnitte: { id: string; titel: string; max: number }[];
  entscheidungen: { titel: string; max: number };
  reaktion: string;
  /** Name des Beispielprojekts im Kopf des Berichts (nur mit Beispiel) */
  projekt: string;
  fuss: string;
  saetze: Record<string, string>;
  beispiele: {
    id: string;
    titel: string;
    monat: string;
    datenstand: string;
    lage: string;
    ampeln: Record<AmpelId, { farbe: Farbe; satz: string; reaktion: string | null }>;
    eintraege: Record<string, { text: string; kennung: string }[] | 'keine'>;
    entscheidungen: { frage: string; stelle: string; bis: string; kennung: string }[] | 'keine';
    reaktion: string;
  }[];
}

/**
 * Was jede Fläche (auch die Leinwand) sehen darf. `regie?: never` macht den Typ streng: Ein volles
 * `Inhalte` (mit Regie-Material) ist NICHT zuweisbar, strukturell wie als Objektliteral.
 */
export type OeffentlicheInhalte = Omit<Inhalte, 'regie' | 'geschichteRegie' | 'werkzeugeRegie'> & { regie?: never; geschichteRegie?: never; werkzeugeRegie?: never };
