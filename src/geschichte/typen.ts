/*
 * Typen der Story (P17.2, O-51/O-52): eine lineare Geschichte (seit P19: 14 Stationen in drei Akten) aus Sicht der Projektleitung des
 * Bauherrn – je Kapitel eine Szene mit Dialog, eine Frage mit drei Antworten (gut · vertretbar · Falle), Folge-Szene,
 * drei Balken Geld · Zeit · Vertrauen (intern 0–10), „So macht man es gut“, „Das steckt dahinter“; in elf Stationen
 * eine Mini-Aufgabe, in Station 12 der gewichtete Vergleich. Erzeugt von werkzeuge/geschichte.mjs aus
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

/** Die drei Nebenfiguren (P19.6, O-62): Namensschild und Porträt, kein Steckbrief im Auftakt; sie sprechen nur im Ton, nie Tatsachen, die vom Weg abhängen. */
export type NebenfigurId = 'ranzen' | 'spitzfeder' | 'pfennig';
export const NEBENFIGUREN: readonly NebenfigurId[] = ['ranzen', 'spitzfeder', 'pfennig'];
/** Stimmen ohne Porträt (P19.6): die Vergabestelle am Telefon und die Vertretung der Projektsteuerin – ein Sprecher mit Sprechsymbol statt Gesicht. */
export type StimmeId = 'vergabestelle' | 'vertretung';
export const STIMMEN: readonly StimmeId[] = ['vergabestelle', 'vertretung'];
/** Wer in einer Szenenzeile sprechen darf (`Zeile.figur`). */
export type SprecherId = FigurId | NebenfigurId | StimmeId;
export const SPRECHER: readonly SprecherId[] = [...FIGUREN, ...NEBENFIGUREN, ...STIMMEN];

export type Jahreszeit = 'fruehling' | 'sommer' | 'herbst' | 'winter';
export type Licht = 'morgen' | 'tag' | 'abend';

/** Besonderes Wetter (R72, P19.3): sturm · regen · schnee · nebel – ohne Angabe gilt die Jahreszeit */
export type Wetter = 'sturm' | 'regen' | 'schnee' | 'nebel';

export interface CampusBild {
  /** 0–8 und die Zwischenstufen 1,5 · 2,5 · 3,5 · 4,5 · 5,5 (P19.3) */
  stufe: number;
  jahreszeit: Jahreszeit;
  licht: Licht;
  /** Besonderes Wetter (R72, P19.3): „sturm“ – grauer Himmel, Böen, abgerissene Planen; „regen“, „schnee“, „nebel“ */
  wetter?: Wetter;
}

/** Nebenfigur (P19.6): Name und Rolle stehen beim Sprechen am Porträt; `kurzHtml` ist das Namensschild beim ersten Auftritt, `steckbriefHtml` zeigt nur die Regie. */
export interface Nebenfigur {
  id: NebenfigurId;
  name: string;
  rolle: string;
  /** Ton der Akzentpalette – oder „keiner“ (der Reporter: Papierton, kein Akzent) */
  akzent: string;
  kurzHtml: string;
  steckbriefHtml: string;
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
  /** sprechende Figur, Nebenfigur oder Stimme; null = Erzählung (kursiv, ohne Porträt) */
  figur: SprecherId | null;
  /** Regieanweisung in Klammern („läutet ihre Glocke“) */
  zusatz: string | null;
  html: string;
  /** false = die Kurzfassung lässt die Zeile weg (P17.5); auf dem ganzen Weg steht sie immer */
  kurzfassung: boolean;
  /** P19.6 `text-kurz`: Ersatz für die Kurzfassung – ersetzt die ganze Zeile (bei einer Echo-Zeile samt Echo und Fortsetzung); auf dem ganzen Weg gilt `html` */
  kurzHtml?: string;
  /** P19.6 `nur-kurzfassung: ja`: die Zeile steht nur in der Kurzfassung (`kurzfassung` ist dann wahr) */
  nurKurz?: true;
  /**
   * Echo-Zeile (P19.4, O-62): Kennung eines Echos aus `Geschichte.echos`. Die Engine setzt die Fassung nach der gespielten
   * Antwort der Quelle ein (`loeseZeile`); `html` hält die Fassung „gut“ samt Fortsetzung als Vorgabe für alles, was keinen Stand kennt.
   */
  echo?: string;
  /** feste Fortsetzung hinter dem Echo (ganzer Weg) und – wo sie abweicht – in der Kurzfassung */
  fortsetzungHtml?: string;
  fortsetzungKurzHtml?: string;
}

/** Echo (P19.4): eine Zeile in drei Fassungen, je nach Antwort in der Quelle; ändert nur Ton und Wortlaut, nie eine Tatsache oder einen Balken. */
export interface EchoDef {
  id: string;
  /** Station, deren gespielte Antwort die Fassung wählt; fehlt die Antwort (Sprung, Kurzfassung ohne die Station), gilt „gut“ */
  quelle: string;
  /** Inline-HTML je Fassung; die Wertung wird nie genannt */
  fassungen: Record<Wertung, string>;
}

/** Art eines Eintrags im Entscheidungsbuch (P19.4): Beschluss · Vermerk (kein Beschluss) · Übergabe · beides am Ende */
export type BuchArt = 'beschluss' | 'vermerk' | 'uebergabe' | 'beschluss-uebergabe';
export const BUCH_ARTEN: readonly BuchArt[] = ['beschluss', 'vermerk', 'uebergabe', 'beschluss-uebergabe'];

/**
 * Eintrag im Entscheidungsbuch (P19.4): für alle Wege gleich – er nennt den Beschluss der Stadt, nie die Antwort der Leserin oder
 * des Lesers. Der Anlass ist der Monat der Station (`Kapitel.zeit`), kein Beschlussdatum.
 */
export interface BuchEintrag {
  station: string;
  art: BuchArt;
  entschiedenHtml: string;
  grundlageHtml: string;
  ergebnisHtml: string;
}

export interface Antwort {
  wertung: Wertung;
  html: string;
  /** P19.6: Schlagzeile der Zeitung „Lindenbote“ unter dem Bild `schlagzeile` dieser Antwort (Inline-HTML); fehlt = keine Unterschrift */
  schlagzeileHtml?: string;
  wirkung: Wirkung;
  folgeHtml: string;
  /** Folge der Kurzfassung (P19.5): ohne die Absätze mit `kurzfassung: nein` bzw. der Ersatz `folge-kurz`; fehlt = überall `folgeHtml` */
  folgeKurzHtml?: string;
  /** Name einer kleinen Szenen-Grafik (src/grafik/figuren.ts, `gimmick`) */
  bild: string | null;
}

/**
 * Arten der Mini-Aufgaben (Mini-Registry, `mini-arten.ts`). P19.5: `matrix` (Stimmt die Einstufung?), `mappe` (Fehlt etwas in der
 * Mappe?), `pinnwand` (Stimmen die Verknüpfungen?), `bericht` (Was fehlt im Bericht?), `rueckfragen` (Wer weiß was?). Der Muss-Filter
 * und „Beschluss oder nicht?“ sind Spielarten von `zuordnen`.
 */
export type MiniArt = 'zuordnen' | 'reihenfolge' | 'matrix' | 'mappe' | 'pinnwand' | 'bericht' | 'rueckfragen';

/** Wo die Mini-Aufgabe im Ablauf einer Station steht (P19.5): nach der Folge (Vorgabe), vor der Frage oder vor dem Vergleich */
export type MiniStelle = 'nach-folge' | 'vor-frage' | 'vor-vergleich';
export const MINI_STELLEN: readonly MiniStelle[] = ['nach-folge', 'vor-frage', 'vor-vergleich'];

/** Eine Zeile eines Gesprächs (`rueckfragen`): wer spricht (Name oder Rolle, frei) und was */
export interface GespraechsZeile {
  wer: string;
  html: string;
}

export interface MiniPosten {
  html: string;
  /** zuordnen: Kennung der richtigen Wahl; reihenfolge: leer (die Reihenfolge der Liste ist die richtige) */
  loesung: string;
  erklaerungHtml: string;
  /** kleine Grafik auf der Karte (Name für `gimmick`) */
  bild: string | null;
  /** matrix: Feld der Matrix – Wahrscheinlichkeit und Auswirkung je 1–5; nur für die Zeichnung, nie als Zahl sichtbar */
  feld?: [number, number];
  /** pinnwand: Zettel, von dem der Faden ausgeht, und Zettel, zu denen er führt (leer = loses Ende) */
  von?: string;
  nach?: string[];
  /** rueckfragen: das Gespräch, das nach der Wahl erscheint */
  gespraech?: GespraechsZeile[];
  /** rueckfragen (P19.6): die Zeile des Eintrag-Kärtchens, die dieses Gespräch füllt, und was die Vertretung dort festhält (Inline-HTML); `erklaerungHtml` ist dann der Rest */
  eintragZeile?: string;
  eintragTextHtml?: string;
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
  /** Platz im Ablauf der Station (P19.5); fehlt = nach der Folge, wie bisher */
  stelle?: MiniStelle;
  /** Schlusssatz nach der Aufgabe (P19.5), aus den Lösungen, nie aus den Wahlen; fehlt = keiner */
  schlussHtml?: string;
  /** pinnwand: die Zettel der Wand */
  zettel?: { id: string; html: string }[];
  /** rueckfragen: wie viele Gespräche die Leserin oder der Leser führen darf */
  kontingent?: number;
  /** rueckfragen (P19.6): das Eintrag-Kärtchen – Zeilen, die sich mit den Gesprächen füllen; fehlt = kein Kärtchen */
  eintrag?: MiniEintrag;
}

/** Eintrag-Kärtchen der Rückfragen (P19.6): vier Zeilen („Quelle“, „Offene Frage“, „Antwort bis“, „Gebraucht für“), anfangs leer. */
export interface MiniEintrag {
  /** Kopf des Eintrags („Lüftung · Hersteller · frag Theo“), Inline-HTML; null = ohne Kopf */
  titelHtml: string | null;
  /** die Zeilen in der Reihenfolge der Gespräche: Name der Zeile */
  zeilen: string[];
}

/** Vertiefung am Ende einer Station (P19.5): zugeklappt, nur auf dem ganzen Weg, nicht im Druck, nicht auf der Leinwand */
export type VertiefungForm = 'nachdenken' | 'zweiter-fall' | 'warum-so';
export const VERTIEFUNG_FORMEN: readonly VertiefungForm[] = ['nachdenken', 'zweiter-fall', 'warum-so'];
export interface Vertiefung {
  form: VertiefungForm;
  titel: string;
  /** Absätze (Inline-HTML); bei „Zum Nachdenken“ und „Ein zweiter Fall“ stehen hier die Frage bzw. der Fall */
  absaetzeHtml: string[];
  /** nur „Zum Nachdenken“ und „Ein zweiter Fall“: Absätze hinter dem Aufklapper „Antwort“ */
  antwortHtml?: string[];
}

export interface VergleichKriterium {
  id: string;
  titel: string;
  /** wie der Gesichtspunkt mitten im Satz heißt, mit Artikel („der Schulstart“, „Strombedarf und Betrieb“) */
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
  /** Kennung der Station („k1“ … „k8“, später „s1“ … „s14“; Adresse #story/k3) */
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
  /** „So macht man es gut“ bzw. „Das steckt dahinter“ in der Kurzfassung (P19.5): ohne Absätze mit `kurzfassung: nein` bzw. der Ersatz `…-kurz` */
  gutKurzHtml?: string;
  dahinterKurzHtml?: string;
  /** Vertiefung am Ende der Station (P19.5), nur auf dem ganzen Weg */
  vertiefung?: Vertiefung;
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

/** Pause am Ende eines Akts (P19.3): eine Zeile einer Figur und „Das können Sie jetzt“ in drei Sätzen */
export interface AktPause {
  zeile: Zeile | null;
  koennenHtml: string[];
}

/**
 * Akt (P19.3, optional – `Geschichte.akte` darf leer sein): eine Gruppe aufeinanderfolgender Stationen mit Kopfkarte (Text über
 * der ersten Station) und Pause am Ende (der letzte Akt zeigt „Das können Sie jetzt“ im Ende, vor der Bilanz).
 */
export interface Akt {
  id: string;
  titel: string;
  /** „Januar bis Juni 2026“ */
  zeitraum: string;
  /** Kennungen der Stationen in Reihenfolge */
  stationen: string[];
  kopfHtml: string;
  pause: AktPause;
}

/**
 * Zeile des Kärtchens „Wer entscheidet was“. P19.6: der Text darf eine Liste von Absätzen sein (`absaetze`), einzelne nur auf dem ganzen
 * Weg (`kurzfassung: false`); `html` ist dann alle Absätze hintereinander (Vorgabe für alles, was die Absätze nicht kennt).
 */
export interface MandatZeile {
  wer: string;
  html: string;
  absaetze?: { html: string; kurzfassung: boolean }[];
}

/** Texte einer Wegkarte im Auftakt (P19.6, `auftakt.wegwahl`); die Zeile mit Zahlen und Minuten rechnet die Seite aus der Messung. */
export interface WegKarteText {
  titel: string;
  text: string;
  knopf: string;
  bild: string;
}

export interface Geschichte {
  titel: string;
  auftakt: {
    campus: CampusBild; textHtml: string; vorstellung: string; los: string; kurz: string;
    /** P19.6: Überschrift über den drei Balken; fehlt = das Wort der Seite */
    balkenTitel?: string;
    /** P19.6: Texte der beiden Wegkarten; fehlt = die Wörter der Seite */
    wegwahl?: { ueberschrift: string; lang: WegKarteText; kurz: WegKarteText };
  };
  /** Steckbrief der Spielfigur „Sie“ */
  sieHtml: string;
  figuren: Figur[];
  balken: BalkenDef[];
  bilanz: Record<BilanzSicht, { titel: string; html: string }>;
  mandat: { titel: string; zeilen: MandatZeile[] };
  /** Nebenfiguren (P19.6); fehlt = die Story hat keine */
  nebenfiguren?: Nebenfigur[];
  /** die Stationen in der Reihenfolge der Geschichte (Kennung beliebig: k1 … k8 heute, s1 … s14 später) */
  kapitel: Kapitel[];
  /** Akte; leer = die Story hat keine Akte und verhält sich wie bisher */
  akte: Akt[];
  /** Echos (P19.4); fehlt = keine Zeile der Story hängt an einer früheren Antwort */
  echos?: EchoDef[];
  /** Entscheidungsbuch (P19.4): ein Eintrag je Station; fehlt = die Story hat kein Buch */
  buch?: BuchEintrag[];
  ende: Ende;
}

/** Regie-Material je Kapitel (nie auf der Leinwand) */
export interface GeschichteRegie {
  notizHtml: string;
  leitfragen: string[];
}
