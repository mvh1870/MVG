/*
 * Fortschritt in den Themen (P17.8, O-54): Ein Thema gilt als geschafft, wenn alle seine Verständnisfragen
 * beantwortet sind – richtig oder nicht. Ein Thema ohne Verständnisfragen gilt als geschafft, sobald das Ende
 * der Seite erreicht ist. Der Anhang (Glossar) zählt nicht. Keine Punkte.
 *
 * Gespeichert wird nur im Browser (`localStorage`, Schlüssel `gk.theorie`, Datenschutz Abschnitt 5): welche
 * Verständnisfragen je Thema beantwortet sind und welche Themen ohne Fragen zu Ende gelesen wurden – nicht,
 * welche Antwort gewählt wurde. Jeder Zugriff steckt in try/catch; ohne Speicher funktioniert alles, nur
 * ohne Erinnerung.
 */

import type { Block, TheorieSeite } from '../inhalte/typen.ts';

export interface SpeicherGriff {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

export const FORTSCHRITT_SCHLUESSEL = 'gk.theorie';
export const FORTSCHRITT_VERSION = 1;

export interface Fortschritt {
  /** Thema → Kennungen der beantworteten Verständnisfragen */
  antworten: Record<string, string[]>;
  /** Themen ohne Verständnisfragen, deren Seitenende erreicht wurde */
  gelesen: string[];
}

export function leererFortschritt(): Fortschritt {
  return { antworten: {}, gelesen: [] };
}

const KENNUNG = /^[a-z0-9][a-z0-9-]{0,63}$/u;
const textListe = (x: unknown): string[] => Array.isArray(x) ? [...new Set(x.filter((e): e is string => typeof e === 'string' && KENNUNG.test(e)))] : [];

/** Liest einen gespeicherten Stand; Fremdes, Kaputtes oder eine andere Fassung → leer. */
export function leseFortschritt(roh: unknown): Fortschritt {
  if (roh === null || typeof roh !== 'object') return leererFortschritt();
  const r = roh as { v?: unknown; antworten?: unknown; gelesen?: unknown };
  if (r.v !== FORTSCHRITT_VERSION) return leererFortschritt();
  const antworten: Record<string, string[]> = {};
  if (r.antworten !== null && typeof r.antworten === 'object' && !Array.isArray(r.antworten)) {
    for (const [thema, ids] of Object.entries(r.antworten as Record<string, unknown>)) {
      const liste = textListe(ids);
      if (KENNUNG.test(thema) && liste.length > 0) antworten[thema] = liste;
    }
  }
  return { antworten, gelesen: textListe(r.gelesen) };
}

export function ladeFortschritt(speicher: SpeicherGriff | null): Fortschritt {
  try {
    const roh = speicher?.getItem(FORTSCHRITT_SCHLUESSEL) ?? null;
    return roh === null ? leererFortschritt() : leseFortschritt(JSON.parse(roh));
  } catch {
    return leererFortschritt();
  }
}

export function speichereFortschritt(speicher: SpeicherGriff | null, f: Fortschritt): void {
  try {
    speicher?.setItem(FORTSCHRITT_SCHLUESSEL, JSON.stringify({ v: FORTSCHRITT_VERSION, antworten: f.antworten, gelesen: f.gelesen }));
  } catch { /* Speicher voll oder gesperrt: der Stand gilt bis zum Neuladen */ }
}

export function loescheFortschritt(speicher: SpeicherGriff | null): void {
  try {
    speicher?.removeItem(FORTSCHRITT_SCHLUESSEL);
  } catch { /* Speicher gesperrt: nichts zu löschen */ }
}

/** Kennungen aller Verständnisfragen eines Themas (in jeder Tiefe, auch in Ebenen). */
export function verstaendnisfragen(seite: TheorieSeite): string[] {
  const aus: string[] = [];
  const gehe = (bloecke: readonly Block[]): void => {
    for (const b of bloecke) {
      if (b.art === 'wissenscheck' && b.id !== null) aus.push(b.id);
      gehe(b.kinder);
      for (const e of b.ebenen ?? []) gehe(e.bloecke);
    }
  };
  gehe(seite.bloecke);
  return [...new Set(aus)];
}

/** Zählt das Thema für den Fortschritt? (Der Anhang nicht.) */
export function zaehlt(seite: TheorieSeite): boolean {
  return seite.teil !== 'anhang';
}

export function istGeschafft(seite: TheorieSeite, f: Fortschritt): boolean {
  if (!zaehlt(seite)) return false;
  const fragen = verstaendnisfragen(seite);
  if (fragen.length === 0) return f.gelesen.includes(seite.thema);
  const beantwortet = f.antworten[seite.thema] ?? [];
  return fragen.every((id) => beantwortet.includes(id));
}

/** Neuer Stand mit einer beantworteten Frage (unverändert, wenn schon vermerkt). */
export function mitAntwort(f: Fortschritt, thema: string, frage: string): Fortschritt {
  const bisher = f.antworten[thema] ?? [];
  if (bisher.includes(frage)) return f;
  return { ...f, antworten: { ...f.antworten, [thema]: [...bisher, frage] } };
}

/** Neuer Stand mit erreichtem Seitenende; zählt nur bei Themen ohne Verständnisfragen. */
export function mitGelesen(f: Fortschritt, seite: TheorieSeite): Fortschritt {
  if (!zaehlt(seite) || verstaendnisfragen(seite).length > 0 || f.gelesen.includes(seite.thema)) return f;
  return { ...f, gelesen: [...f.gelesen, seite.thema] };
}

export interface Zaehlung { geschafft: number; gesamt: number }

/** Stand über alle zählenden Themen und je Teil (1–4). */
export function zaehle(themen: readonly TheorieSeite[], f: Fortschritt): { gesamt: Zaehlung; teile: Record<1 | 2 | 3 | 4, Zaehlung> } {
  const teile: Record<1 | 2 | 3 | 4, Zaehlung> = { 1: { geschafft: 0, gesamt: 0 }, 2: { geschafft: 0, gesamt: 0 }, 3: { geschafft: 0, gesamt: 0 }, 4: { geschafft: 0, gesamt: 0 } };
  const gesamt: Zaehlung = { geschafft: 0, gesamt: 0 };
  for (const t of themen) {
    if (t.teil === 'anhang') continue;
    const ok = istGeschafft(t, f);
    teile[t.teil].gesamt++;
    gesamt.gesamt++;
    if (ok) {
      teile[t.teil].geschafft++;
      gesamt.geschafft++;
    }
  }
  return { gesamt, teile };
}
