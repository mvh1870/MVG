/*
 * Risiko-Bewerter mit eigenen Grenzen (Werkzeug C, P18.2) – rein, ohne DOM. Regeln (Konzept C.3): vier streng
 * steigende Grenzen je Reihe; ein Wert genau auf einer Grenze gehört zur niedrigeren Stufe; Matrixfeld =
 * Wahrscheinlichkeit × höchste belegte Auswirkung; 1–4 beobachten, 5–9 gezielt, 10–25 vorrangig, Auswirkung 5
 * immer vorrangig; unbekannt ist nicht null (vorläufig oder offen, nie als 1 oder 5 gezählt); eine Spanne wird nicht
 * gemittelt, sondern als Bereich „mindestens … bis“ gezeigt. Belege intern: V2.4 HB 2, HB 3, Projektblatt.
 */
import { leseWerkzeugStand, type Hinweis } from './gemeinsam.ts';

export type Stufe = 1 | 2 | 3 | 4 | 5;
export type Grenzen = readonly [number, number, number, number];
export type Wert =
  | { art: 'wert'; wert: number }
  | { art: 'spanne'; von: number; bis: number }
  /** Wahrscheinlichkeit direkt, Qualität oder Funktion */
  | { art: 'stufe'; stufe: Stufe }
  | { art: 'unbekannt' }
  | { art: 'entfaellt' };
export type GrenzFehler = 'anzahl' | 'nicht-steigend' | 'nicht-positiv' | 'ueber-100';
export type Prioritaet = 'beobachten' | 'gezielt' | 'vorrangig';
export type Reihe = 'wahrscheinlichkeit' | 'kosten' | 'termin';

/** Untergrenzen der Bearbeitungspriorität nach dem Produkt (wie `matrix.stufen` im Inhalt: 5–9 gezielt, 10–25 vorrangig). */
export const AB_GEZIELT = 5;
export const AB_VORRANGIG = 10;

/** C-R1: genau vier Grenzen, positiv, streng steigend; Prozentgrenzen unter 100. */
export function pruefeGrenzen(g: readonly number[], prozent: boolean): readonly GrenzFehler[] {
  const f: GrenzFehler[] = [];
  if (g.length !== 4) f.push('anzahl');
  if (g.some((x) => !Number.isFinite(x) || x <= 0)) f.push('nicht-positiv');
  if (g.some((x, i) => i > 0 && !(x > (g[i - 1] ?? Number.NaN)))) f.push('nicht-steigend');
  if (prozent && g.some((x) => x >= 100)) f.push('ueber-100');
  return f;
}

/** C-R2: Stufe aus den Grenzen; ein Wert genau auf einer Grenze gehört zur niedrigeren Stufe. */
export function stufeAus(wert: number, g: Grenzen): Stufe {
  if (wert <= g[0]) return 1;
  if (wert <= g[1]) return 2;
  if (wert <= g[2]) return 3;
  if (wert <= g[3]) return 4;
  return 5;
}

/** Stufe, wenn der Wert genau auf einer Grenze liegt (für den Satz „Genau auf der Grenze …“), sonst null. */
export function aufGrenze(wert: number, g: Grenzen): Stufe | null {
  const i = g.indexOf(wert);
  return i < 0 ? null : ((i + 1) as Stufe);
}

/** C-R5: Bearbeitungspriorität eines Matrixfelds; Auswirkung 5 ist immer vorrangig. */
export function prioritaet(w: Stufe, a: Stufe): Prioritaet {
  if (a === 5) return 'vorrangig';
  const wert = w * a;
  if (wert >= AB_VORRANGIG) return 'vorrangig';
  return wert >= AB_GEZIELT ? 'gezielt' : 'beobachten';
}

export interface RisikoEingabe {
  w: Wert;
  kosten: Wert;
  termin: Wert;
  qualitaet: Wert;
  warn: readonly string[];
  massnahme: 'keine' | 'geplant' | 'belegt';
  schwelle: boolean;
  prognose: 'ja' | 'nein' | 'teilweise';
  puffer: boolean | null;
}

export interface ProjektGrenzen {
  wahrscheinlichkeit: Grenzen;
  kosten: Grenzen;
  termin: Grenzen;
}

export interface Feld {
  w: Stufe;
  a: Stufe;
  wert: number;
}

type Stufen = { w: Stufe | null; kosten: Stufe | null; termin: Stufe | null; qualitaet: Stufe | null };

export interface RisikoBefund {
  /** null = unbekannt oder entfällt; bei einer Spanne die untere Stufe */
  stufen: Stufen;
  /** bei einer Spanne die obere Stufe, sonst wie `stufen` */
  stufenBis: Stufen;
  zustand: 'fest' | 'vorlaeufig' | 'offen';
  /** „mindestens“ */
  feld: Feld | null;
  /** nur aus Spannen (C-R7); null, wenn nichts darüber liegt oder eine unbekannte Zeile nach oben offen lässt */
  bis: Feld | null;
  /** eine Auswirkung unbekannt und höchste erreichte Stufe < 5 (C-R6): keine Stufe, kein Zielfeld */
  nachObenOffen: boolean;
  /** aus „mindestens“; bei offen ohne Feld nur 'vorrangig' (belegte Auswirkung 5) oder null */
  prioritaet: Prioritaet | null;
  /** aus „bis“; einziger Ort für den Vorrang „Auswirkung 5“ aus einer Spanne */
  prioritaetBis: Prioritaet | null;
  /** „mindestens“ vorrangig nur wegen fest belegter Auswirkung 5 (nicht aus Spannen) */
  vorrangWegenA5: boolean;
  wesentlich: boolean;
  aufGrenze: readonly Reihe[];
  hinweise: readonly Hinweis[];
}

/** Eine Zeile nach dem Lesen: Stufenbereich, unbekannt (auch bei Fehler) oder entfällt. */
type Zeile = { von: Stufe; bis: Stufe; grenze: boolean } | 'unbekannt' | 'entfaellt' | 'fehler';

const istStufe = (x: number): x is Stufe => x === 1 || x === 2 || x === 3 || x === 4 || x === 5;

/** Liest eine Zeile mit Grenzen (Wahrscheinlichkeit in Prozent, Kosten, Termin). */
function zeileMitGrenzen(v: Wert, g: Grenzen, reihe: Reihe): Zeile {
  if (v.art === 'unbekannt') return 'unbekannt';
  if (v.art === 'entfaellt') return reihe === 'wahrscheinlichkeit' ? 'unbekannt' : 'entfaellt';
  if (v.art === 'stufe') return istStufe(v.stufe) ? { von: v.stufe, bis: v.stufe, grenze: false } : 'fehler';
  if (pruefeGrenzen(g, reihe === 'wahrscheinlichkeit').length > 0) return 'fehler';
  const gueltig = (x: number): boolean =>
    Number.isFinite(x) && (reihe === 'wahrscheinlichkeit' ? x > 0 && x < 100 : x >= 0) && (reihe !== 'termin' || Number.isInteger(x));
  if (v.art === 'wert') {
    if (!gueltig(v.wert)) return 'fehler';
    const s = stufeAus(v.wert, g);
    return { von: s, bis: s, grenze: aufGrenze(v.wert, g) !== null };
  }
  if (!gueltig(v.von) || !gueltig(v.bis) || v.von > v.bis) return 'fehler';
  // Eine Spanne zeigt keinen Grenzwert-Treffer: die Vorführung „genau auf der Grenze“ gehört zum Einzelwert (Konzept C.4)
  return { von: stufeAus(v.von, g), bis: stufeAus(v.bis, g), grenze: false };
}

/** Qualität oder Funktion: nur eine Stufe 1–5. */
function zeileQualitaet(v: Wert): Zeile {
  if (v.art === 'unbekannt' || v.art === 'entfaellt') return v.art;
  if (v.art === 'stufe' && istStufe(v.stufe)) return { von: v.stufe, bis: v.stufe, grenze: false };
  return 'fehler';
}

const belegt = (z: Zeile): z is { von: Stufe; bis: Stufe; grenze: boolean } => typeof z === 'object';
const unten = (z: Zeile): Stufe | null => (belegt(z) ? z.von : null);
const oben = (z: Zeile): Stufe | null => (belegt(z) ? z.bis : null);
const hoechste = (xs: readonly Stufe[]): Stufe | null => (xs.length === 0 ? null : (Math.max(...xs) as Stufe));

/** Bewertet ein Risiko nach den Grenzen des Projekts (C-R1 bis C-R13). */
export function bewerteRisiko(e: RisikoEingabe, g: ProjektGrenzen): RisikoBefund {
  const zw = zeileMitGrenzen(e.w, g.wahrscheinlichkeit, 'wahrscheinlichkeit');
  const zk = zeileMitGrenzen(e.kosten, g.kosten, 'kosten');
  const zt = zeileMitGrenzen(e.termin, g.termin, 'termin');
  const zq = zeileQualitaet(e.qualitaet);
  const auswirkungen = [zk, zt, zq];
  const belegteA = auswirkungen.filter(belegt);

  const stufen: Stufen = { w: unten(zw), kosten: unten(zk), termin: unten(zt), qualitaet: unten(zq) };
  const stufenBis: Stufen = { w: oben(zw), kosten: oben(zk), termin: oben(zt), qualitaet: oben(zq) };

  // „Unbekannt ist nicht null“ (C-R6): eine unbekannte Zeile zählt weder als 1 noch als 5
  const unbekannteA = auswirkungen.some((z) => z === 'unbekannt' || z === 'fehler');
  const aMin = hoechste(belegteA.map((z) => z.von));
  const aMax = hoechste(belegteA.map((z) => z.bis));
  const spanne = [zw, ...auswirkungen].some((z) => belegt(z) && z.von !== z.bis);
  const nachObenOffen = unbekannteA && (aMax === null || aMax < 5);

  let feld: Feld | null = null;
  let bis: Feld | null = null;
  let zustand: RisikoBefund['zustand'] = 'offen';
  if (belegt(zw) && aMin !== null && aMax !== null) {
    feld = { w: zw.von, a: aMin, wert: zw.von * aMin };
    zustand = unbekannteA || spanne ? 'vorlaeufig' : 'fest';
    const obenFeld: Feld = { w: zw.bis, a: aMax, wert: zw.bis * aMax };
    if (!nachObenOffen && (obenFeld.w !== feld.w || obenFeld.a !== feld.a)) bis = obenFeld;
  }

  const a5Fest = aMin === 5;
  const prio: Prioritaet | null = feld !== null ? prioritaet(feld.w, feld.a) : a5Fest ? 'vorrangig' : null;
  const prioBis: Prioritaet | null = bis !== null ? prioritaet(bis.w, bis.a) : null;
  const vorrangWegenA5 = a5Fest && (feld === null || feld.wert < AB_VORRANGIG);
  const wesentlich = prio === 'vorrangig' || e.schwelle || e.warn.length > 0;

  const treffer: Reihe[] = [];
  if (belegt(zw) && zw.grenze) treffer.push('wahrscheinlichkeit');
  if (belegt(zk) && zk.grenze) treffer.push('kosten');
  if (belegt(zt) && zt.grenze) treffer.push('termin');

  const h: Hinweis[] = [];
  const zeilen: readonly [string, Zeile][] = [['wahrscheinlichkeit', zw], ['kosten', zk], ['termin', zt], ['qualitaet', zq]];
  for (const [name, z] of zeilen) if (z === 'fehler') h.push({ id: 'fehler', schwere: 'rot', bezug: name });
  for (const r of treffer) h.push({ id: 'grenze', schwere: 'info', bezug: r });
  if (zustand === 'offen') h.push({ id: 'offen', schwere: 'gelb' });
  if (unbekannteA && zustand !== 'offen') h.push({ id: 'vorlaeufig', schwere: 'gelb' });
  if (unbekannteA && a5Fest) h.push({ id: 'schwereFolge', schwere: 'gelb' });
  if (spanne) h.push({ id: 'spanne', schwere: 'info' });
  if (e.warn.length > 0) h.push({ id: 'warnanlass', schwere: 'rot' });
  if (wesentlich) h.push({ id: 'wesentlich', schwere: 'gelb' }, { id: 'annahme', schwere: 'info' });
  if (stufen.w !== null && stufen.w <= 2 && aMin !== null && aMin >= 4) h.push({ id: 'selten', schwere: 'gelb' });
  if (e.massnahme === 'geplant') h.push({ id: 'geplant', schwere: 'info' });
  if (e.massnahme === 'belegt') h.push({ id: 'belegt', schwere: 'info' });
  if (e.prognose !== 'nein') h.push({ id: 'prognose', schwere: 'info' });
  if (e.puffer === false) h.push({ id: 'puffer', schwere: 'info' });

  return { stufen, stufenBis, zustand, feld, bis, nachObenOffen, prioritaet: prio, prioritaetBis: prioBis, vorrangWegenA5, wesentlich, aufGrenze: treffer, hinweise: h };
}

/** Schritt auf dem Kanal Regie → Leinwand: „Was wäre, wenn“-Annahmen, kombinierbar (Konzept C.8). */
export const SCHRITT_RISIKO = /^(?:t:7[01]|w:1|m:belegt)(?:;(?:t:7[01]|w:1|m:belegt)){0,2}$/u;

/** Werkzeugstand des Risiko-Bewerters; jede Annahme-Art höchstens einmal. */
export function leseStandRisiko(roh: unknown, beispiele: readonly string[]): { beispiel: string; schritt: string | null } | null {
  const s = leseWerkzeugStand(roh, beispiele, SCHRITT_RISIKO);
  if (s === null || s.schritt === null) return s;
  const arten = s.schritt.split(';').map((t) => t.slice(0, 1));
  return new Set(arten).size === arten.length ? s : null;
}
