/*
 * Typen von `src/generiert/inhalte.json` (erzeugt von werkzeuge/inhalte.mjs, Format:
 * docs/INHALTSFORMAT.md): Themen der Theorie, Story (src/geschichte/typen.ts), Explore-Texte, Glossar.
 *
 * Alle Felder mit HTML-Inhalt sind zur Bauzeit aus Markdown erzeugt; rohes HTML der Autoren ist dort
 * bereits maskiert. Glossarbezüge: `<span class="mvg-glossar" data-glossar="g-…" data-begriff="…">`,
 * Zitate: `<blockquote|q class="mvg-zitat" data-absatz="k2.4-p2">`.
 */

import type { Geschichte, GeschichteRegie } from '../geschichte/typen.ts';
export type { Geschichte, GeschichteRegie };

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

export interface TheorieSeite {
  id: string;
  kapitel: number;
  /** Kennung in der Adresse (#theorie/<thema>, P16.3) */
  thema: string;
  /** Reihenfolge der Themen */
  reihe: number;
  titel: string;
  kurztitel: string;
  deckt: string[];
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
  /** im Bild überdeckte Beschriftungen: neuer Text (Begriff des Texts) und Beleg */
  angeglichen: { text: string; beleg: string }[];
  /** was nach der Angleichung noch vom Text abweicht (HTML inline) mit Belegen */
  abweichungen: { html: string; belege: string[] }[];
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
  /** Regie-Notizen der Story je Station */
  geschichteRegie: Record<string, GeschichteRegie>;
  /** Texte der Explore-Werkzeuge (P16.8) */
  werkzeuge: Werkzeuge | null;
}

interface WerkzeugTeil { titel: string; kurz: string; html: string }

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
}

/**
 * Was jede Fläche (auch die Leinwand) sehen darf. `regie?: never` macht den Typ streng: Ein volles
 * `Inhalte` (mit Regie-Material) ist NICHT zuweisbar, strukturell wie als Objektliteral.
 */
export type OeffentlicheInhalte = Omit<Inhalte, 'regie' | 'geschichteRegie'> & { regie?: never; geschichteRegie?: never };
