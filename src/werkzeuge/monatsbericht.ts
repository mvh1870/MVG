/*
 * Monatsbericht-Baukasten (Werkzeug D, P18.2) – rein, ohne DOM. Prüft einen Bericht (Konzept D.3): eine gelbe oder
 * rote Ampel ohne verknüpfte offene Entscheidung und ohne benötigte Reaktion bleibt Beobachtung (D-R1, Warnung gelb);
 * zu jeder offenen Entscheidung gehören Stelle und Termin (D-R2, rot); dazu Kennung, „keine“ statt leer, Dringliches,
 * Wirkung von Maßnahmen und die Seitenschätzung (D-R3 bis D-R7). Belege intern: V2.4 HB 4, 5, 1.6; V1.2 k2.4-p2.
 * Die Seitenschätzung ist eine Bedienregel (Konzept D.6); die Druckprobe in P18.4 misst die echte Seite.
 */
import { leseWerkzeugStand, type Ampel, type Hinweis } from './gemeinsam.ts';

export type Farbe = 'gruen' | 'gelb' | 'rot';
export type AmpelId = 'kosten' | 'termine' | 'qualitaet';
export const AMPELN: readonly AmpelId[] = ['kosten', 'termine', 'qualitaet'];

export interface BerichtEintrag {
  text: string;
  kennung: string;
  dringlich?: boolean;
  stand?: 'umgesetzt' | 'wirksam';
}

export interface OffeneEntscheidung {
  id: string;
  frage: string;
  stelle: string;
  bis: string;
  kennung: string;
}

export interface Bericht {
  monat: string;
  datenstand: string;
  lage: string;
  ampeln: Record<AmpelId, { farbe: Farbe; satz: string; gehoertZu: { entscheidung: string } | { reaktion: string } | null }>;
  /** null = noch nicht ausgefüllt (weder „keine“ noch Einträge) */
  abschnitte: Record<string, readonly BerichtEintrag[] | 'keine' | null>;
  entscheidungen: readonly OffeneEntscheidung[] | 'keine' | null;
  reaktion: string;
}

/** anteil 1 = eine Seite */
export interface Umfang {
  zeilen: number;
  anteil: number;
  passt: boolean;
}

/**
 * Feldgrenzen der Oberfläche (Bedienregel, Konzept D.2; Einträge, Fragen, Stellen, Termine und Kennungen ergänzt), so
 * gewählt, dass der Höchstfall nach `schaetzeUmfang` höchstens eine Seite füllt – mit der vorsichtigen Zeilenbreite unten,
 * die Reserve für Großschrift und lange Wörter lässt.
 */
export const FELDGRENZEN = {
  monat: 40, datenstand: 40, lage: 280, ampelSatz: 136, ampelReaktion: 140, eintrag: 60, kennung: 10,
  frage: 80, stelle: 30, bis: 20, reaktion: 200,
} as const;

/** vorsichtig gerechnet (R77): Reserve gegenüber den rund 92 Zeichen des Fließtexts; Zeilen aus breiten Großbuchstaben fassen deutlich weniger */
export const ZEICHEN_JE_ZEILE = 78;
export const ZEILEN_JE_SEITE = 50;
/** sichtbares Wort einer Ampelfarbe im Bericht (für die Längenschätzung; der Bericht nennt Farbe mit Wort) */
const FARBWORT: Record<Farbe, string> = { gruen: 'grün', gelb: 'gelb', rot: 'rot' };
const AMPELWORT: Record<AmpelId, string> = { kosten: 'Kosten', termine: 'Termine', qualitaet: 'Qualität' };
/** Fußsatz D-R8, nur für die Länge */
const FUSS_LAENGE = 'Die vollständigen Einträge stehen in der Software.'.length;

const zeilenFuer = (laenge: number, breite: number): number => Math.max(1, Math.ceil(laenge / breite));

/**
 * Geschätzter Platzbedarf (Bedienregel, Konzept D.6): Lage, je Ampel ihr Satz und ggf. die Reaktion, die Abschnitte in
 * zwei Spalten (halbe Breite), offene Entscheidungen, benötigte Reaktion, Fuß. Jede Überschrift eine Zeile.
 */
export function schaetzeUmfang(b: Bericht, zeichenJeZeile: number = ZEICHEN_JE_ZEILE, zeilenJeSeite: number = ZEILEN_JE_SEITE): Umfang {
  const voll = (t: string): number => zeilenFuer(t.length, zeichenJeZeile);
  const spalte = Math.floor(zeichenJeZeile / 2) - 2;
  let z = 1 + voll(b.lage);
  for (const id of AMPELN) {
    const a = b.ampeln[id];
    z += voll(`${AMPELWORT[id]}: ${FARBWORT[a.farbe]} – ${a.satz}`);
    if (a.gehoertZu !== null && 'reaktion' in a.gehoertZu) z += voll(`→ ${a.gehoertZu.reaktion}`);
  }
  let spalten = 0;
  for (const inhalt of Object.values(b.abschnitte)) {
    spalten += 1;
    if (Array.isArray(inhalt) && inhalt.length > 0) {
      for (const e of inhalt as readonly BerichtEintrag[]) spalten += zeilenFuer(`${e.text} ${e.kennung}`.length, spalte);
    } else {
      spalten += 1;
    }
  }
  z += Math.ceil(spalten / 2);
  z += 1;
  if (Array.isArray(b.entscheidungen) && b.entscheidungen.length > 0) {
    for (const e of b.entscheidungen as readonly OffeneEntscheidung[]) z += voll(`${e.frage} · ${e.stelle} · bis ${e.bis} · ${e.kennung}`);
  } else {
    z += 1;
  }
  z += 1 + voll(b.reaktion);
  z += zeilenFuer(`Datenstand: ${b.datenstand}`.length, zeichenJeZeile) + zeilenFuer(FUSS_LAENGE, zeichenJeZeile);
  return { zeilen: z, anteil: z / zeilenJeSeite, passt: z <= zeilenJeSeite };
}

const leer = (t: string): boolean => t.trim() === '';

/** Prüft einen Bericht (D-R1 bis D-R7). Die Abschnitte sind die Schlüssel von `maxJeAbschnitt`. */
export function pruefeBericht(b: Bericht, maxJeAbschnitt: Readonly<Record<string, number>>): { ampel: Ampel; hinweise: readonly Hinweis[]; umfang: Umfang } {
  const h: Hinweis[] = [];
  const entscheidungen = Array.isArray(b.entscheidungen) ? (b.entscheidungen as readonly OffeneEntscheidung[]) : [];

  // R77: ohne Monat, Datenstand und Lage ist der Bericht noch leer – nicht „vollständig“
  if (leer(b.monat) || leer(b.datenstand) || leer(b.lage)) h.push({ id: 'berichtUnvollstaendig', schwere: 'gelb', bezug: 'kopf' });

  // D-R1: Ampel gelb oder rot ohne offene Entscheidung und ohne benötigte Reaktion
  for (const id of AMPELN) {
    const a = b.ampeln[id];
    if (a.farbe === 'gruen') continue;
    const g = a.gehoertZu;
    const verknuepft =
      g !== null && ('entscheidung' in g ? entscheidungen.some((e) => e.id === g.entscheidung) : !leer(g.reaktion));
    if (!verknuepft) h.push({ id: 'ampelOhneFrage', schwere: 'gelb', bezug: id });
  }

  // D-R2, D-R3 für offene Entscheidungen
  for (const e of entscheidungen) {
    if (leer(e.stelle) || leer(e.bis)) h.push({ id: 'entscheidungOhneWerBisWann', schwere: 'rot', bezug: e.id });
    if (leer(e.kennung)) h.push({ id: 'ohneKennung', schwere: 'gelb', bezug: e.id });
  }
  if (b.entscheidungen === null || (Array.isArray(b.entscheidungen) && b.entscheidungen.length === 0)) {
    h.push({ id: 'leerStattKeine', schwere: 'gelb', bezug: 'entscheidungen' });
  }

  // D-R3 bis D-R6 je Abschnitt
  for (const [abschnitt, max] of Object.entries(maxJeAbschnitt)) {
    const inhalt = b.abschnitte[abschnitt] ?? null;
    if (inhalt === 'keine') continue;
    if (inhalt === null || inhalt.length === 0) {
      h.push({ id: 'leerStattKeine', schwere: 'gelb', bezug: abschnitt });
      continue;
    }
    if (inhalt.length > max) h.push({ id: 'zuViele', schwere: 'gelb', bezug: abschnitt });
    if (inhalt.some((e) => leer(e.kennung))) h.push({ id: 'ohneKennung', schwere: 'gelb', bezug: abschnitt });
    if (inhalt.some((e) => e.dringlich === true)) h.push({ id: 'dringlich', schwere: 'gelb', bezug: abschnitt });
    if (inhalt.some((e) => e.stand === 'umgesetzt')) h.push({ id: 'umgesetztNichtWirksam', schwere: 'gelb', bezug: abschnitt });
  }

  // D-R7: Seitenmesser
  const umfang = schaetzeUmfang(b);
  if (!umfang.passt) h.push({ id: 'zuLang', schwere: 'rot' });

  const ampel: Ampel = h.some((x) => x.schwere === 'rot') ? 'rot' : h.length > 0 ? 'gelb' : 'gruen';
  return { ampel, hinweise: h, umfang };
}

/** Schritt auf dem Kanal Regie → Leinwand: Schalter „Kosten-Ampel ohne Frage“ (Konzept D.8). */
export const SCHRITT_BERICHT = /^w:1$/u;

/** Werkzeugstand des Monatsberichts für die Leinwand. */
export function leseStandBericht(roh: unknown, beispiele: readonly string[]): { beispiel: string; schritt: string | null } | null {
  return leseWerkzeugStand(roh, beispiele, SCHRITT_BERICHT);
}
