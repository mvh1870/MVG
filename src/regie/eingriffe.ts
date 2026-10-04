/*
 * Eingriffe der Regie in die Story (P17.6, O-9, O-53): rein, ohne DOM. Die Regie springt je Schritt, nimmt eine
 * Wahl zurück und löst eine Mini-Aufgabe auf; alles andere (Wahl, Zuordnung, Reihenfolge, Gewichte) läuft über die
 * Engine. Was hier entsteht, ist immer ein gewöhnlicher Stand der Story – die Leinwand zeichnet ihn wie jeden anderen.
 */

import type { Geschichte } from '../geschichte/typen.ts';
import { miniArt } from '../geschichte/mini-arten.ts';
import { geheZu, gleicherSchritt, kapitel, schritte, schrittKennung, type Schritt, type Stand } from '../geschichte/engine.ts';

/** Ein Sprungziel der Regie: Wert für die Auswahl und der Schritt dazu. */
export interface SprungZiel {
  wert: string;
  schritt: Schritt;
}

/** Wert eines Schritts in der Auswahl: „auftakt“, „ende“, „s3:frage“ oder „pause:a1“ (P19.6: die Pausen der Akte sind eigene Ziele). */
export function schrittWert(s: Schritt): string {
  return schrittKennung(s);
}

/** Alle Schritte der ganzen Geschichte (mit Mini-Aufgaben) in Reihenfolge – auch die, die die Kurzfassung überspringt. */
export function sprungZiele(g: Geschichte): SprungZiel[] {
  return schritte(g, false).map((schritt) => ({ wert: schrittWert(schritt), schritt }));
}

/** Liest einen Wert der Auswahl; Unbekanntes ergibt null. */
export function schrittAus(g: Geschichte, wert: string): Schritt | null {
  return sprungZiele(g).find((z) => z.wert === wert)?.schritt ?? null;
}

/**
 * Springt zu einem Schritt. Liegt er nicht auf dem laufenden Weg (Kurzfassung: übersprungenes Kapitel oder
 * Mini-Aufgabe), schaltet die Regie auf die ganze Geschichte um – sonst stünde die Leinwand nicht dort, wo die
 * Moderation hinwollte.
 */
export function springe(g: Geschichte, stand: Stand, ziel: Schritt): Stand {
  const aufWeg = schritte(g, stand.kurz).some((s) => gleicherSchritt(s, ziel));
  const basis = aufWeg ? stand : { ...stand, kurz: false };
  return geheZu(g, basis, ziel);
}

/** Nimmt die Wahl eines Kapitels zurück (die Frage steht wieder offen). */
export function ohneWahl(stand: Stand, kapitelId: string): Stand {
  if (stand.wahlen[kapitelId] === undefined) return stand;
  const wahlen = { ...stand.wahlen };
  delete wahlen[kapitelId];
  return { ...stand, wahlen };
}

/** Löst eine Mini-Aufgabe auf: je Art ihre richtige Lösung (Mini-Registry, `loese`). */
export function loeseMini(g: Geschichte, stand: Stand, kapitelId: string): Stand {
  const m = kapitel(g, kapitelId)?.mini ?? null;
  const def = m === null ? null : miniArt(m.art);
  if (m === null || def === null) return stand;
  const loesung = def.loese(m);
  return { ...stand, mini: { ...stand.mini, [kapitelId]: loesung } };
}

const ENTITAETEN: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', shy: '' };

/** Reiner Text aus geprüftem Inline-HTML (für kurze Knopfbeschriftungen der Regie). */
export function nurText(html: string): string {
  return html
    .replace(/<[^>]*>/gu, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/giu, (ganz, e: string) => {
      if (e.startsWith('#x') || e.startsWith('#X')) return String.fromCodePoint(Number.parseInt(e.slice(2), 16));
      if (e.startsWith('#')) return String.fromCodePoint(Number(e.slice(1)));
      return ENTITAETEN[e.toLowerCase()] ?? ganz;
    })
    .replace(/[­​]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

/** Die ersten Wörter eines Texts mit „…“, wenn er länger ist (Antwort- und Postenknöpfe der Regie). */
export function ersteWorte(html: string, anzahl = 6): string {
  const worte = nurText(html).split(' ').filter((x) => x !== '');
  if (worte.length <= anzahl) return worte.join(' ');
  return `${worte.slice(0, anzahl).join(' ').replace(/[,;:.–-]+$/u, '')} …`;
}
