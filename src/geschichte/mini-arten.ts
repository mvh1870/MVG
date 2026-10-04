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

import type { Mini, MiniArt, MiniPosten, MiniWahl } from './typen.ts';

/** `gewaehlt` (P19.5): gesetzt ohne Richtig oder Falsch – bei `rueckfragen`, wo es keine Lösung gibt */
export type PostenLage = 'richtig' | 'falsch' | 'offen' | 'gewaehlt';

/** Meldet einen Fehler des Inhalts (Übersetzer: `c.fehler(ort, text)`). */
export type MeldeFehler = (ort: string, text: string) => void;

/** Hilfe des Übersetzers für Hooks, die sichtbaren Text brauchen: prüft ihn (Sichtbar-Probe) und macht Inline-HTML daraus. */
export interface MiniUebersetzerHilfe {
  inline(t: unknown, ort: string): string;
}

/** Was der Übersetzer je Art prüft (Haken des gemeinsamen Gerüsts in `werkzeuge/geschichte.mjs`, Funktion `mini`). */
export interface MiniUebersetzung {
  /** Pflichtfelder eines Postens in der YAML (frei ist immer `bild`) */
  postenFelder: readonly string[];
  /** weitere freie Felder eines Postens (P19.5: `feld`, `von`, `nach`, `gespraech` – je nach Art Pflicht über `postenZusatz`) */
  postenFrei?: readonly string[];
  /**
   * P19.5: Wahlen, die die Art selbst festlegt (matrix, mappe, pinnwand): Die YAML gibt dann keine `wahlen`; der Übersetzer setzt
   * diese ein. Fehlt der Eintrag, gibt die YAML die Wahlen an (zuordnen) bzw. keine (reihenfolge).
   */
  festeWahlen?: readonly MiniWahl[];
  /** P19.5: Schlusssatz der Aufgabe (`schluss`): `nie` (Zählwörter statt Satz) oder `pflicht` (aus den Lösungen, nie aus den Wahlen) */
  schluss: 'nie' | 'pflicht';
  /** P19.5: art-eigene Felder der Aufgabe, die die YAML angeben darf (`zettel`, `kontingent`) – jedes andere der beiden ist ein Fehler */
  zusatzFelder?: readonly string[];
  /** P19.5: art-eigene Felder eines Postens prüfen und ergänzen (Matrixfeld, Faden, Gespräch) */
  postenZusatz?(roh: Record<string, unknown>, ort: string, fehler: MeldeFehler, h: MiniUebersetzerHilfe): Partial<MiniPosten>;
  /** P19.5: art-eigene Felder der Aufgabe (Zettel, Kontingent), geprüft gegen die fertigen Posten */
  zusatz?(roh: Record<string, unknown>, posten: readonly MiniPosten[], ort: string, fehler: MeldeFehler, h: MiniUebersetzerHilfe): Partial<Mini>;
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
  /** Ob die Aufgabe abgeschlossen ist; fehlt: jeder Posten hat eine Lage außer `offen` (P19.5: `rueckfragen` ist fertig, wenn das Kontingent genutzt ist) */
  fertig?(m: Mini, antworten: readonly number[]): boolean;
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

/** Ob `x` ein Platz in einer Liste der Länge `n` ist (ganze Zahl, 0 ≤ x < n); auch von `leseStand` in der Engine benutzt. */
export const istPlatz = (x: unknown, n: number): x is number => typeof x === 'number' && Number.isInteger(x) && x >= 0 && x < n;

/* ----------------------------------------------------------------- zuordnen -- */

const ZUORDNEN: MiniArtDef = {
  art: 'zuordnen',
  uebersetzung: {
    schluss: 'nie',
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
    schluss: 'nie',
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


/* ------------------------------------------- Kartenwahl: matrix · mappe · pinnwand -- */

/**
 * Gemeinsamer Kern der drei Arten mit festen Wahlen (P19.5, `04-rahmen.md` 7.8): je Posten eine Wahl aus den Wahlen der Art,
 * sofortige Rückmeldung je Posten. Zug, Auswertung, Prüfung, Lösung und Änderung sind die der Zuordnung; die Arten unterscheiden sich
 * in Wahlen, Feldern der Posten, Zeichnung und Rückmeldung (Registry der Darstellung).
 */
const festWahl = (id: string, titel: string): MiniWahl => ({ id, titel, figur: null, falschHtml: null, heisstHtml: null, bild: null });

type ArtKern = Pick<MiniArtDef, 'zug' | 'werte' | 'gueltig' | 'loese' | 'aenderung' | 'lesezeitOhne'>;
const KARTENWAHL: ArtKern = {
  zug: ZUORDNEN.zug,
  werte: ZUORDNEN.werte,
  gueltig: ZUORDNEN.gueltig,
  loese: ZUORDNEN.loese,
  aenderung: ZUORDNEN.aenderung,
  lesezeitOhne: [],
};

/** Lösung eines Postens: eine der festen Wahlen der Art. */
const festeLoesung = (roh: unknown, wahlen: readonly MiniWahl[], ort: string, fehler: MeldeFehler): string => {
  const l = roh === undefined || roh === null ? '' : String(roh);
  if (!wahlen.some((w) => w.id === l)) fehler(ort, `Lösung „${l}“ ist keine der Wahlen dieser Art (${wahlen.map((w) => w.id).join(', ')})`);
  return l;
};
const keineWahlenAngeben = (_w: readonly MiniWahl[], gegeben: boolean, ort: string, fehler: MeldeFehler): void => {
  if (gegeben) fehler(ort, 'die Wahlen dieser Art sind fest – kein Feld „wahlen“');
};

const WAHLEN_MATRIX: readonly MiniWahl[] = [festWahl('stimmt', 'Stimmt'), festWahl('nachfordern', 'Nachbessern lassen')];
const WAHLEN_MAPPE: readonly MiniWahl[] = [festWahl('annehmen', 'So annehmen'), festWahl('nachfordern', 'Nachbessern lassen')];
const WAHLEN_PINNWAND: readonly MiniWahl[] = [festWahl('stimmt', 'Stimmt'), festWahl('doppelt', 'Zählt doppelt'), festWahl('nachfordern', 'Es fehlt eine Verbindung')];

const MATRIX: MiniArtDef = {
  art: 'matrix',
  uebersetzung: {
    schluss: 'nie',
    postenFelder: ['text', 'loesung', 'erklaerung', 'feld'],
    festeWahlen: WAHLEN_MATRIX,
    pruefeWahlen: keineWahlenAngeben,
    loesung: festeLoesung,
    pruefeGesamt() {},
    // Feld der Matrix: [Wahrscheinlichkeit, Auswirkung] je 1–5 – nur Zeichnung, nie als Zahl auf der Seite
    postenZusatz(roh, ort, fehler) {
      const f = roh['feld'];
      const ok = Array.isArray(f) && f.length === 2 && f.every((n) => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 5);
      if (!ok) fehler(ort, 'Feld: [Wahrscheinlichkeit, Auswirkung] je eine ganze Zahl von 1 bis 5 erwartet');
      return { feld: ok ? [f[0], f[1]] as [number, number] : [1, 1] };
    },
  },
  ...KARTENWAHL,
};

const MAPPE: MiniArtDef = {
  art: 'mappe',
  uebersetzung: {
    schluss: 'pflicht',
    postenFelder: ['text', 'loesung', 'erklaerung'],
    festeWahlen: WAHLEN_MAPPE,
    pruefeWahlen: keineWahlenAngeben,
    loesung: festeLoesung,
    pruefeGesamt(_w, posten, ort, fehler) {
      if (!posten.some((p) => p.loesung === 'nachfordern')) fehler(ort, 'mindestens ein Abschnitt der Mappe wird nachgefordert');
      if (!posten.some((p) => p.loesung === 'annehmen')) fehler(ort, 'mindestens ein Abschnitt der Mappe wird so angenommen');
    },
  },
  ...KARTENWAHL,
};

const PINNWAND: MiniArtDef = {
  art: 'pinnwand',
  uebersetzung: {
    schluss: 'pflicht',
    postenFelder: ['text', 'loesung', 'erklaerung', 'von', 'nach'],
    festeWahlen: WAHLEN_PINNWAND,
    zusatzFelder: ['zettel'],
    pruefeWahlen: keineWahlenAngeben,
    loesung: festeLoesung,
    pruefeGesamt() {},
    // Faden: von einem Zettel zu null, einem oder mehreren Zetteln (leer = loses Ende → nachfordern)
    postenZusatz(roh, ort, fehler) {
      const von = roh['von'] === undefined || roh['von'] === null ? '' : String(roh['von']);
      const nach = Array.isArray(roh['nach']) ? roh['nach'].map(String) : null;
      if (von === '') fehler(ort, 'Feld „von“: Kennung eines Zettels erwartet');
      if (nach === null) fehler(ort, 'Feld „nach“: Liste von Zettel-Kennungen erwartet (leer = loses Ende)');
      return { von, nach: nach ?? [] };
    },
    zusatz(roh, posten, ort, fehler, h) {
      const z = roh['zettel'];
      if (!Array.isArray(z) || z.length < 2) { fehler(ort, 'Zettel: Liste von mindestens zwei Zetteln { id, text } erwartet'); return {}; }
      const zettel = z.map((x: unknown, i: number) => {
        const o = (typeof x === 'object' && x !== null ? x : {}) as Record<string, unknown>;
        const zo = `${ort} zettel ${i + 1}`;
        for (const k of Object.keys(o)) if (k !== 'id' && k !== 'text') fehler(zo, `unbekanntes Feld „${k}“ (erlaubt: id, text)`);
        const id = typeof o['id'] === 'string' ? o['id'] : '';
        if (!/^[a-z0-9][a-z0-9-]*$/u.test(id)) fehler(zo, `Kennung „${id}“ ist keine Kennung (Kleinbuchstaben, Ziffern, Bindestrich)`);
        return { id, html: h.inline(o['text'], zo) };
      });
      const ids = zettel.map((x) => x.id);
      if (new Set(ids).size !== ids.length) fehler(ort, 'Zettel doppelt');
      posten.forEach((p, i) => {
        const po = `${ort} posten ${i + 1}`;
        for (const id of [p.von ?? '', ...(p.nach ?? [])]) if (!ids.includes(id)) fehler(po, `Zettel „${id}“ gibt es nicht`);
        if ((p.nach ?? []).includes(p.von ?? '')) fehler(po, 'ein Faden führt nicht zum selben Zettel zurück');
        // ein loses Ende kann nur nachgefordert werden; „stimmt“ braucht ein Ziel
        if ((p.nach ?? []).length === 0 && p.loesung !== 'nachfordern') fehler(po, 'ein loses Ende (nach: []) wird nachgefordert');
        if ((p.nach ?? []).length > 0 && p.loesung === 'nachfordern') fehler(po, 'ein Faden mit Ziel wird nicht nachgefordert – „stimmt“ oder „doppelt“');
      });
      return { zettel };
    },
  },
  ...KARTENWAHL,
};

/* --------------------------------------------------------------------- bericht -- */

/**
 * Bericht gegenlesen (P19.5): Mehrfachauswahl – gesetzt wird nur „nachfordern“, ungesetzt gilt „in Ordnung“; eine Prüfung für alle
 * Zeilen. Zustand `mini[kapitel]`: leer oder `n + 1` Zahlen – je Zeile 0/1 (nachfordern), zuletzt 1 = geprüft. Nach der Prüfung
 * ist die Liste gesperrt (bis „Noch einmal“).
 */
const BERICHT: MiniArtDef = {
  art: 'bericht',
  uebersetzung: {
    schluss: 'pflicht',
    postenFelder: ['text', 'loesung', 'erklaerung'],
    pruefeWahlen: keineWahlenAngeben,
    loesung(roh, _w, ort, fehler) {
      const l = roh === undefined || roh === null ? '' : String(roh);
      if (l !== 'ok' && l !== 'nachfordern') fehler(ort, `Lösung „${l}“ – erwartet ok oder nachfordern`);
      return l;
    },
    pruefeGesamt(_w, posten, ort, fehler) {
      if (!posten.some((p) => p.loesung === 'nachfordern')) fehler(ort, 'mindestens eine Zeile des Berichts wird nachgefordert');
      if (!posten.some((p) => p.loesung === 'ok')) fehler(ort, 'mindestens eine Zeile des Berichts ist in Ordnung');
    },
  },
  // `posten` ≤ n schaltet die Zeile um, `posten` = n ist die Prüfung
  zug(m, alt, posten) {
    const n = m.posten.length;
    if (!Number.isInteger(posten) || posten < 0 || posten > n) return null;
    const basis = alt.length === n + 1 ? [...alt] : Array.from({ length: n + 1 }, () => 0);
    if (basis[n] === 1) return null;
    if (posten === n) basis[n] = 1;
    else basis[posten] = basis[posten] === 1 ? 0 : 1;
    return basis;
  },
  werte(m, a) {
    const n = m.posten.length;
    return m.posten.map((p, i) => {
      if (a.length !== n + 1 || a[n] !== 1) return 'offen';
      return (a[i] === 1) === (p.loesung === 'nachfordern') ? 'richtig' : 'falsch';
    });
  },
  gueltig(m, liste) {
    const n = m.posten.length;
    return liste.length === 0 || (liste.length === n + 1 && liste.every((x) => x === 0 || x === 1));
  },
  loese(m) {
    return [...m.posten.map((p) => (p.loesung === 'nachfordern' ? 1 : 0)), 1];
  },
  // die erste Zeile mit anderer Markierung; nur die Prüfung geändert → die erste Zeile (dort stehen die Rückmeldungen)
  aenderung(alt, neu) {
    const n = Math.max(alt.length, neu.length) - 1;
    for (let i = 0; i < n; i += 1) if ((alt[i] ?? 0) !== (neu[i] ?? 0)) return i;
    return n >= 0 && (alt[n] ?? 0) !== (neu[n] ?? 0) ? 0 : null;
  },
  lesezeitOhne: [],
};

/* ----------------------------------------------------------------- rueckfragen -- */

/**
 * Eintrag-Kärtchen (P19.6): Beginnt die Erklärung eines Gesprächs mit `Zeile „Quelle“: Die Vertretung würde festhalten: „…“`, ist das die Zeile des
 * Kärtchens, die dieses Gespräch füllt, und der Satz, den die Vertretung dort festhält. Der Übersetzer entnimmt beides der Erklärung (sie bleibt
 * unverändert stehen); beginnen alle Erklärungen so, zeichnet die Seite das Kärtchen mit den Zeilen in der Reihenfolge der Gespräche.
 */
export const EINTRAG_ZEILE = /^Zeile „([^“]+)“: Die Vertretung würde festhalten: „([^“]+)“/u;

/**
 * Rückfragen im Entscheidungsfenster (P19.5, „Wer weiß was?“): zwei von vier Gesprächen (Kontingent) – das Gespräch erscheint nach der
 * Wahl; es gibt weder „Stimmt“ noch „Nicht ganz“, weil es kein Richtig oder Falsch gibt. Zustand `mini[kapitel]`: die Plätze der
 * gewählten Gespräche in der Reihenfolge der Wahl (höchstens das Kontingent; die Regie-Auflösung nennt alle).
 */
const RUECKFRAGEN: MiniArtDef = {
  art: 'rueckfragen',
  uebersetzung: {
    schluss: 'pflicht',
    postenFelder: ['text', 'erklaerung', 'gespraech'],
    zusatzFelder: ['kontingent', 'eintrag'],
    pruefeWahlen: keineWahlenAngeben,
    loesung() {
      return '';
    },
    pruefeGesamt(_w, posten, ort, fehler) {
      if (posten.length < 4) fehler(ort, 'Rückfragen: mindestens vier Gespräche');
    },
    postenZusatz(roh, ort, fehler, h) {
      const g = roh['gespraech'];
      if (!Array.isArray(g) || g.length === 0) { fehler(ort, 'Gespräch: Liste von Zeilen { wer, text } erwartet'); return { gespraech: [] }; }
      const eintrag = EINTRAG_ZEILE.exec(typeof roh['erklaerung'] === 'string' ? roh['erklaerung'].trim() : '');
      return {
        gespraech: g.map((z: unknown, i: number) => {
          const o = (typeof z === 'object' && z !== null ? z : {}) as Record<string, unknown>;
          const zo = `${ort} gespraech ${i + 1}`;
          for (const k of Object.keys(o)) if (k !== 'wer' && k !== 'text') fehler(zo, `unbekanntes Feld „${k}“ (erlaubt: wer, text)`);
          const wer = typeof o['wer'] === 'string' ? o['wer'].trim() : '';
          if (wer === '') fehler(zo, 'Feld „wer“ fehlt');
          return { wer, html: h.inline(o['text'], zo) };
        }),
        ...(eintrag !== null ? { eintragZeile: eintrag[1] as string, eintragTextHtml: h.inline(eintrag[2], `${ort} erklaerung`) } : {}),
      };
    },
    zusatz(roh, posten, ort, fehler, h) {
      const k = roh['kontingent'];
      const mit = posten.filter((p) => p.eintragZeile !== undefined);
      const kopf = roh['eintrag'];
      // das Kärtchen: alle Erklärungen nennen ihre Zeile (verschieden) – oder keine
      let eintrag: Partial<Mini> = {};
      if (mit.length > 0 && mit.length < posten.length) fehler(ort, `Eintrag-Kärtchen: ${mit.length} von ${posten.length} Erklärungen beginnen mit „Zeile „…“: Die Vertretung würde festhalten: „…““ – alle oder keine`);
      else if (mit.length > 0) {
        const zeilen = posten.map((p) => p.eintragZeile as string);
        if (new Set(zeilen).size !== zeilen.length) fehler(ort, 'Eintrag-Kärtchen: zwei Gespräche füllen dieselbe Zeile');
        eintrag = { eintrag: { titelHtml: kopf === undefined ? null : h.inline(kopf, `${ort} eintrag`), zeilen } };
      } else if (kopf !== undefined) fehler(ort, 'Feld „eintrag“ ohne Kärtchen – die Erklärungen der Gespräche beginnen nicht mit „Zeile „…“: Die Vertretung würde festhalten: „…““');
      if (typeof k !== 'number' || !Number.isInteger(k) || k < 1 || k >= posten.length) {
        fehler(ort, `Kontingent: ganze Zahl von 1 bis ${Math.max(1, posten.length - 1)} erwartet (weniger als Gespräche)`);
        return eintrag;
      }
      return { kontingent: k, ...eintrag };
    },
  },
  // ein Gespräch wählen, solange das Kontingent reicht; ein schon gewähltes oder gesperrtes bleibt
  zug(m, alt, posten) {
    if (!istPlatz(posten, m.posten.length) || alt.includes(posten) || alt.length >= (m.kontingent ?? 0)) return null;
    return [...alt, posten];
  },
  werte(m, a) {
    return m.posten.map((_, i) => (a.includes(i) ? 'gewaehlt' : 'offen'));
  },
  fertig(m, a) {
    return a.length >= (m.kontingent ?? m.posten.length);
  },
  // Kontingent oder – nach der Regie-Auflösung – alle Gespräche, bekannte Plätze ohne Doppel
  gueltig(m, liste) {
    const ok = liste.every((x) => istPlatz(x, m.posten.length)) && new Set(liste).size === liste.length;
    return ok && (liste.length <= (m.kontingent ?? 0) || liste.length === m.posten.length);
  },
  loese(m) {
    return m.posten.map((_, i) => i);
  },
  aenderung(alt, neu) {
    if (neu.length > alt.length) return neu.at(-1) ?? null;
    if (neu.length < alt.length) return alt[neu.length] ?? null;
    return null;
  },
  // die Zeilen der Gespräche (und ihre Erklärungen) und das Eintrag-Kärtchen zählen nicht zur Lesezeit (04-rahmen 7.8)
  lesezeitOhne: ['.gs-gespraech', '.gs-eintrag'],
};

/**
 * Die Tabelle aller Mini-Arten. Eine neue Art: Kennung in `MiniArt` (typen.ts) aufnehmen, hier einen Eintrag ergänzen,
 * dazu den Baustein in `src/ui/flaechen/geschichte-mini.ts` (docs/INHALTSFORMAT.md, Abschnitt „Neue Mini-Art“).
 */
export const MINI_ARTEN: Record<MiniArt, MiniArtDef> = {
  zuordnen: ZUORDNEN,
  reihenfolge: REIHENFOLGE,
  matrix: MATRIX,
  mappe: MAPPE,
  pinnwand: PINNWAND,
  bericht: BERICHT,
  rueckfragen: RUECKFRAGEN,
};

/** Kennungen aller Arten in fester Reihenfolge der Tabelle. */
export const MINI_ART_KENNUNGEN: readonly MiniArt[] = Object.keys(MINI_ARTEN) as MiniArt[];

/** Eintrag einer Art; null = unbekannte Kennung. */
export function miniArt(art: string): MiniArtDef | null {
  return Object.hasOwn(MINI_ARTEN, art) ? MINI_ARTEN[art as MiniArt] : null;
}
