/*
 * Mini-Registry, Teil Kern (P19.1, L-270): Jede Art der Mini-Aufgaben ist hier an EINER Stelle beschrieben – ohne DOM.
 * Die Engine (`engine.ts`: `miniZug`, `werteMiniAus`, `leseStand`), die Regie (`loeseMini`, `geaenderterPosten`), der
 * Übersetzer (`werkzeuge/geschichte.mjs`) und die Lesezeit-Zählung (`werkzeuge/lesezeit.mjs`) fragen nur diese Tabelle;
 * keine ihrer Schleifen kennt eine einzelne Art. Der gespeicherte Stand bleibt `mini[kapitel]: number[]` (gk.story v2) –
 * jede Art kodiert ihren Zustand in dieser Zahlenliste.
 *
 * Die Zeichnung gehört zur selben Art, liegt aber in der DOM-Schicht: `src/ui/flaechen/geschichte-mini.ts`
 * (`MINI_BAUSTEINE`: Schritt, Stand-Zeile, Regie-Eingriffe, Papierfassung). Beide Tabellen sind `Record<MiniArt, …>` –
 * eine neue Art in `MiniArt` (typen.ts) bricht die Typprüfung, bis beide Einträge da sind.
 */

import type { Mini, MiniArt, MiniWahl } from './typen.ts';

export type PostenLage = 'richtig' | 'falsch' | 'offen';

/** Meldet einen Fehler des Inhalts (Übersetzer: `c.fehler(ort, text)`). */
export type MeldeFehler = (ort: string, text: string) => void;

/** Was der Übersetzer je Art prüft (Haken des gemeinsamen Gerüsts in `werkzeuge/geschichte.mjs`, Funktion `mini`). */
export interface MiniUebersetzung {
  /** Pflichtfelder eines Postens in der YAML (frei ist immer `bild`) */
  postenFelder: readonly string[];
  /** Regeln für die Wahlen der Art (vorhanden? wie viele?); `wahlenGegeben`: das Feld `wahlen` steht in der YAML */
  pruefeWahlen(wahlen: readonly MiniWahl[], wahlenGegeben: boolean, ort: string, fehler: MeldeFehler): void;
  /** Ein Posten: liefert die Lösung für `MiniPosten.loesung` und prüft sie gegen die Wahlen */
  loesung(rohLoesung: unknown, wahlen: readonly MiniWahl[], ort: string, fehler: MeldeFehler): string;
  /** Regeln über alle Wahlen und Posten zusammen (nach der Mindestzahl der Posten) */
  pruefeGesamt(wahlen: readonly MiniWahl[], posten: readonly { loesung: string }[], ort: string, fehler: MeldeFehler): void;
}

export interface MiniArtDef {
  /** Kennung der Art, wie sie in `mini.art` der YAML und des Stands der Geschichte steht */
  art: MiniArt;
  /** Übersetzer-Prüfung der Felder */
  uebersetzung: MiniUebersetzung;
  /**
   * Ein Zug der Leserin oder des Lesers: aus der Zahlenliste `alt` die neue; null = Zug ungültig (Stand bleibt).
   * `posten` ist der Platz in der Liste der Aufgabe, `wahl` (nur wo die Art es braucht) der Platz der Wahl.
   */
  zug(m: Mini, alt: readonly number[], posten: number, wahl?: number): number[] | null;
  /** Lage je Posten in der Reihenfolge der Liste */
  werte(m: Mini, antworten: readonly number[]): PostenLage[];
  /** Ob eine gespeicherte Zahlenliste zu dieser Aufgabe passt (`leseStand` verwirft sonst die Liste) */
  gueltig(m: Mini, liste: readonly unknown[]): boolean;
  /** Regie „Auflösen“: die Zahlenliste der richtigen Lösung */
  loese(m: Mini): number[];
  /** Welcher Posten sich zwischen `alt` und `neu` geändert hat (Leinwand rollt dorthin); null = nichts geändert */
  aenderung(alt: readonly number[], neu: readonly number[]): number | null;
  /**
   * Lesezeit-Zählung (werkzeuge/lesezeit.mjs): zusätzliche CSS-Auswahl von Elementen im Schritt, die NICHT als Lesetext
   * zählen (neben den allgemeinen Ausnahmen der Zählregel); leer = alles zählt.
   */
  lesezeitOhne: readonly string[];
}

const istPlatz = (x: unknown, n: number): x is number => typeof x === 'number' && Number.isInteger(x) && x >= 0 && x < n;

/* ----------------------------------------------------------------- zuordnen -- */

const ZUORDNEN: MiniArtDef = {
  art: 'zuordnen',
  uebersetzung: {
    postenFelder: ['text', 'loesung', 'erklaerung'],
    pruefeWahlen(wahlen, _gegeben, ort, fehler) {
      if (wahlen.length < 2) fehler(ort, 'zuordnen braucht mindestens zwei Wahlen');
    },
    loesung(roh, wahlen, ort, fehler) {
      const l = roh === undefined || roh === null ? '' : String(roh);
      if (!wahlen.some((w) => w.id === l)) fehler(ort, `Lösung „${l}“ ist keine der Wahlen`);
      return l;
    },
    pruefeGesamt(wahlen, posten, ort, fehler) {
      for (const w of wahlen) {
        if (w.falschHtml !== null && posten.some((p) => p.loesung === w.id)) fehler(ort, `Wahl „${w.id}“ hat eine feste Rückmeldung „falsch“, ist aber bei einem Posten richtig`);
      }
    },
  },
  // Posten `posten` bekommt die Wahl `wahl` (Platz in `mini.wahlen`); je Posten ein Platz, −1 = offen
  zug(m, alt, posten, wahl) {
    if (wahl === undefined || posten < 0 || posten >= m.posten.length || wahl < 0 || wahl >= m.wahlen.length) return null;
    return m.posten.map((_, i) => (i === posten ? wahl : (alt[i] ?? -1)));
  },
  werte(m, a) {
    return m.posten.map((p, i) => {
      const w = a[i] ?? -1;
      if (w < 0) return 'offen';
      return m.wahlen[w]?.id === p.loesung ? 'richtig' : 'falsch';
    });
  },
  gueltig(m, liste) {
    return liste.length === m.posten.length && liste.every((x) => x === -1 || istPlatz(x, m.wahlen.length));
  },
  loese(m) {
    return m.posten.map((p) => m.wahlen.findIndex((w) => w.id === p.loesung));
  },
  // der erste Posten mit anderer Wahl
  aenderung(alt, neu) {
    const n = Math.max(alt.length, neu.length);
    for (let i = 0; i < n; i += 1) if ((alt[i] ?? -1) !== (neu[i] ?? -1)) return i;
    return null;
  },
  lesezeitOhne: [],
};

/* ---------------------------------------------------------------- reihenfolge -- */

const REIHENFOLGE: MiniArtDef = {
  art: 'reihenfolge',
  uebersetzung: {
    postenFelder: ['text', 'erklaerung'],
    pruefeWahlen(_wahlen, gegeben, ort, fehler) {
      if (gegeben) fehler(ort, 'eine Reihenfolge hat keine Wahlen');
    },
    loesung() {
      return '';
    },
    pruefeGesamt() {},
  },
  // einen Posten als nächsten anklicken – oder, ist er schon dran, ihn und alles danach wieder lösen
  zug(m, alt, posten) {
    if (posten < 0 || posten >= m.posten.length) return null;
    const da = alt.indexOf(posten);
    return da >= 0 ? alt.slice(0, da) : [...alt, posten];
  },
  // der Posten an Stelle i der Liste gehört an Stelle i; offen, solange er nicht angeklickt ist
  werte(m, a) {
    return m.posten.map((_, i) => {
      const stelle = a.indexOf(i);
      if (stelle < 0) return 'offen';
      return stelle === i ? 'richtig' : 'falsch';
    });
  },
  gueltig(m, liste) {
    return liste.every((x) => istPlatz(x, m.posten.length)) && new Set(liste).size === liste.length;
  },
  loese(m) {
    return m.posten.map((_, i) => i);
  },
  // der zuletzt angeklickte bzw. gelöste Posten
  aenderung(alt, neu) {
    if (neu.length > alt.length) return neu.at(-1) ?? null;
    if (neu.length < alt.length) return alt[neu.length] ?? null;
    return null;
  },
  lesezeitOhne: [],
};

/**
 * Die Tabelle aller Mini-Arten. Eine neue Art: Kennung in `MiniArt` (typen.ts) aufnehmen, hier einen Eintrag ergänzen,
 * dazu den Baustein in `src/ui/flaechen/geschichte-mini.ts` (docs/INHALTSFORMAT.md, Abschnitt „Neue Mini-Art“).
 */
export const MINI_ARTEN: Record<MiniArt, MiniArtDef> = {
  zuordnen: ZUORDNEN,
  reihenfolge: REIHENFOLGE,
};

/** Kennungen aller Arten in fester Reihenfolge der Tabelle. */
export const MINI_ART_KENNUNGEN: readonly MiniArt[] = Object.keys(MINI_ARTEN) as MiniArt[];

/** Eintrag einer Art; null = unbekannte Kennung. */
export function miniArt(art: string): MiniArtDef | null {
  return Object.hasOwn(MINI_ARTEN, art) ? MINI_ARTEN[art as MiniArt] : null;
}
