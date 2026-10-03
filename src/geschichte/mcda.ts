/*
 * Gewichteter Vergleich – rein, ohne DOM. Regeln aus dem Standard (V2.4 Handbuch 3.1): Punkte je Kriterium 1–5,
 * Gewicht mal Punkt, Summe je Option; die Projektsteuerung prüft, ob vertretbare andere Gewichte die Rangfolge
 * ändern – `kipppunkte` liefert genau diese Stellen. Genutzt vom Vergleich in der Story (Gewichte in drei Stufen
 * 1 · 3 · 5) und vom Rechner in Explore (Gewichte 1–5).
 */

export type Gewichte = Record<string, number>;

/** Was der Vergleich von einer Option braucht. */
export interface Bewertbar {
  id: string;
  punkte: Record<string, number>;
}

export const GEWICHT_MIN = 1;
export const GEWICHT_MAX = 5;
/** alle zulässigen Gewichte des Rechners in Explore */
export const GEWICHTE_FREI: readonly number[] = [1, 2, 3, 4, 5];

/** Gewichtete Summe einer Option. */
export function summe(o: Bewertbar, kriterien: readonly { id: string }[], g: Gewichte): number {
  let s = 0;
  for (const k of kriterien) s += (g[k.id] ?? 0) * (o.punkte[k.id] ?? 0);
  return s;
}

export interface Platz<O extends Bewertbar> {
  option: O;
  summe: number;
  rang: number;
}

/** Rangfolge (höchste Summe zuerst, bei Gleichstand nach Kennung); gleiche Summen teilen sich den Rang. */
export function rangfolge<O extends Bewertbar>(optionen: readonly O[], kriterien: readonly { id: string }[], g: Gewichte): Platz<O>[] {
  const p = optionen.map((option) => ({ option, summe: summe(option, kriterien, g), rang: 0 }));
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
export function spitze(optionen: readonly Bewertbar[], kriterien: readonly { id: string }[], g: Gewichte): string[] {
  return rangfolge(optionen, kriterien, g).filter((p) => p.rang === 1).map((p) => p.option.id);
}

export interface Kipppunkt {
  kriterium: string;
  gewicht: number;
  /** wer bei diesem Gewicht vorn liegt (mehrere = Gleichstand) */
  spitze: string[];
}

/**
 * Für jedes Kriterium je Richtung (weniger, dann mehr Gewicht) das nächstgelegene zulässige Gewicht, bei dem sich die
 * Spitze ändert – bei sonst gleichen Gewichten. Leer, wenn keine einzelne Verschiebung die Spitze ändert.
 */
export function kipppunkte(optionen: readonly Bewertbar[], kriterien: readonly { id: string }[], g: Gewichte, zulaessig: readonly number[] = GEWICHTE_FREI): Kipppunkt[] {
  const jetzt = spitze(optionen, kriterien, g).join(',');
  const werte = [...zulaessig].sort((a, b) => a - b);
  const aus: Kipppunkt[] = [];
  for (const k of kriterien) {
    const basis = g[k.id] ?? werte[0] ?? GEWICHT_MIN;
    const weniger = werte.filter((w) => w < basis).reverse();
    const mehr = werte.filter((w) => w > basis);
    for (const reihe of [weniger, mehr]) {
      for (const w of reihe) {
        const s = spitze(optionen, kriterien, { ...g, [k.id]: w });
        if (s.join(',') !== jetzt) {
          aus.push({ kriterium: k.id, gewicht: w, spitze: s });
          break;
        }
      }
    }
  }
  return aus;
}

