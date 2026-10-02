/*
 * Gewichteter Kriterienvergleich (MCDA) einer Vorlage – rein, ohne DOM. Regeln aus dem Standard
 * (V2.4 Handbuch 3.1): Gewichte und Punkte je 1–5; Gewicht mal Punkt, Summe je Option; nur zulässige
 * Optionen werden gewertet (Klärungen nicht); die Projektsteuerung prüft, ob vertretbare andere Gewichte
 * die Rangfolge ändern – `kipppunkte` liefert genau diese Stellen.
 */
import type { Kriterium, Option } from './typen.ts';

export type Gewichte = Record<string, number>;

export const GEWICHT_MIN = 1;
export const GEWICHT_MAX = 5;

/** Optionen, die in den Vergleich gehen (mit Punkten, keine Klärung). */
export function gewertete(optionen: readonly Option[]): Option[] {
  return optionen.filter((o) => o.punkte !== null && !o.klaerung);
}

/** Gewichtete Summe einer Option. */
export function summe(o: Option, kriterien: readonly Kriterium[], g: Gewichte): number {
  if (o.punkte === null) return 0;
  let s = 0;
  for (const k of kriterien) s += (g[k.id] ?? 0) * (o.punkte[k.id]?.[0] ?? 0);
  return s;
}

export interface Platz {
  option: Option;
  summe: number;
  rang: number;
}

/** Rangfolge (höchste Summe zuerst); gleiche Summen teilen sich den Rang. */
export function rangfolge(optionen: readonly Option[], kriterien: readonly Kriterium[], g: Gewichte): Platz[] {
  const p = gewertete(optionen).map((option) => ({ option, summe: summe(option, kriterien, g), rang: 0 }));
  p.sort((a, b) => b.summe - a.summe || a.option.id.localeCompare(b.option.id));
  let rang = 0;
  let vorher = Number.NaN;
  p.forEach((x, i) => {
    if (x.summe !== vorher) rang = i + 1;
    x.rang = rang;
    vorher = x.summe;
  });
  return p;
}

/** Die vorn liegenden Optionen (bei Gleichstand mehrere). */
export function spitze(optionen: readonly Option[], kriterien: readonly Kriterium[], g: Gewichte): string[] {
  return rangfolge(optionen, kriterien, g).filter((p) => p.rang === 1).map((p) => p.option.id);
}

export interface Kipppunkt {
  kriterium: string;
  gewicht: number;
  /** wer bei diesem Gewicht vorn liegt (mehrere = Gleichstand) */
  spitze: string[];
}

/**
 * Für jedes Kriterium das nächstgelegene Gewicht (1–5), bei dem sich die Spitze ändert – bei sonst
 * gleichen Gewichten. Leer, wenn keine einzelne Verschiebung die Rangfolge an der Spitze kippt.
 */
export function kipppunkte(optionen: readonly Option[], kriterien: readonly Kriterium[], g: Gewichte): Kipppunkt[] {
  const jetzt = spitze(optionen, kriterien, g).join(',');
  const aus: Kipppunkt[] = [];
  for (const k of kriterien) {
    const basis = g[k.id] ?? GEWICHT_MIN;
    const kandidaten: number[] = [];
    for (let d = 1; d <= GEWICHT_MAX - GEWICHT_MIN; d++) {
      for (const w of [basis - d, basis + d]) if (w >= GEWICHT_MIN && w <= GEWICHT_MAX) kandidaten.push(w);
    }
    for (const w of kandidaten) {
      const s = spitze(optionen, kriterien, { ...g, [k.id]: w });
      if (s.join(',') !== jetzt) {
        aus.push({ kriterium: k.id, gewicht: w, spitze: s });
        break;
      }
    }
  }
  return aus;
}

/** Gewicht auf 1–5 begrenzen (ganzzahlig). */
export function begrenzeGewicht(w: number): number {
  return Math.min(GEWICHT_MAX, Math.max(GEWICHT_MIN, Math.round(w)));
}
