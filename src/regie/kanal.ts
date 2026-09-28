/*
 * Der Regie-Kanal zwischen Regie und Leinwand (O-9, docs/ARCHITEKTUR.md „Regie und Leinwand“).
 * Vorbild: quellen/bm/buehnenkanal.ts (bm-training), dort unter `file://` in Chrome gemessen.
 *
 * ZWEI WEGE, EINE NACHRICHT. `BroadcastChannel` erreicht jedes Fenster desselben Ursprungs. Wo er
 * fehlt oder nicht öffnet, trägt der Rückfall: ein Schreibvorgang in `localStorage` löst in jedem
 * ANDEREN Fenster ein `storage`-Ereignis aus. Der Rückfall läuft immer mit (zwei Fenster können
 * verschieden ausgestattet sein); die doppelte Zustellung verwirft der Empfänger über die
 * Folgenummer im Umschlag.
 *
 * DIESELBE SERIALISIERUNG AUF BEIDEN WEGEN. Structured Clone und JSON sind nicht gleich
 * (`undefined`, `Date`, Zyklen). Deshalb geht durch beide Wege der JSON-Rundlauf – sonst stünden
 * zwei Fenster auf verschiedenen Ständen.
 *
 * DER KANAL PRÜFT KEINEN INHALT. Er liefert den Zustand als `unknown`; die Leinwand muss ihn durch
 * `pruefeOeffentlich()` schicken. Er entscheidet auch nicht, wer antwortet: auf ein „hallo“ sendet
 * die Regie ihren Zustand, nicht der Kanal.
 *
 * VERALTETES FÄLLT WEG. Je Nachrichtenart merkt sich der Empfänger die höchste Nummer; eine
 * kleinere oder gleiche wird verworfen. Ein „hallo“ (Fenster neu geöffnet oder neu geladen) setzt
 * diese Merker zurück, damit ein neu gestarteter Absender mit kleinen Nummern wieder durchkommt.
 *
 * EINE NACHRICHT, DIE NICHT ANKOMMT, IST KEIN FEHLER (die Leinwand kann zu sein). `senden` gibt
 * nichts zurück; jeder Wurf der Plattform geht an `warne`, damit ein kaputter Kanal nicht wie ein
 * leerer aussieht.
 */

import type { OeffentlicherZustand } from '../engine/typen.ts';

/** Was gesendet wird. */
export type KanalNachricht =
  | { art: 'zustand'; nr: number; zustand: OeffentlicherZustand }
  | { art: 'lebenszeichen'; nr: number }
  | { art: 'anzeige'; nr: number; beamer: boolean }
  | { art: 'hallo' };

/** Was ankommt: der Zustand ist ungeprüft (→ `pruefeOeffentlich`). */
export type EingehendeNachricht =
  | { art: 'zustand'; nr: number; zustand: unknown }
  | { art: 'lebenszeichen'; nr: number }
  /** Beamer-Schalter (E10): größere Schrift, höherer Kontrast auf der Leinwand */
  | { art: 'anzeige'; nr: number; beamer: boolean }
  | { art: 'hallo' };

export interface Kanal {
  senden(nachricht: KanalNachricht): void;
  /** Meldet einen Empfänger an; gibt die Abmeldung zurück. */
  abonnieren(empfaenger: (nachricht: EingehendeNachricht) => void): () => void;
  schliessen(): void;
}

/** Was ein `BroadcastChannel` können muss. */
export interface RundfunkGriff {
  postMessage(nachricht: unknown): void;
  addEventListener(art: 'message', auf: (e: { data: unknown }) => void): void;
  removeEventListener(art: 'message', auf: (e: { data: unknown }) => void): void;
  close(): void;
}

export interface KanalUmgebung {
  /** `BroadcastChannel`-Konstruktor; null erzwingt den Rückfall. Vorgabe: globalThis.BroadcastChannel */
  rundfunk?: (new (name: string) => RundfunkGriff) | null;
  /** Speicher für den Rückfall; null schaltet ihn ab. Vorgabe: globalThis.localStorage */
  speicher?: { setItem(schluessel: string, wert: string): void } | null;
  /** Meldet einen Zuhörer auf fremde Schreibvorgänge an (`storage`-Ereignis); gibt die Abmeldung zurück. */
  beiSpeicherEreignis?: ((auf: (schluessel: string | null, wert: string | null) => void) => () => void) | null;
  /** Kennung dieses Fensters im Umschlag. Vorgabe: zufällig. */
  kennung?: string;
  /** Bekommt jeden Fehlschlag der Plattform. Vorgabe: console.warn */
  warne?: (grund: string) => void;
}

/** Schlüssel des Rückfalls im Speicher. */
export function kanalSchluessel(name: string): string {
  return `mvg.kanal.${name}`;
}

interface Umschlag {
  mvg: 'kanal';
  von: string;
  folge: number;
  nachricht: EingehendeNachricht;
}

function istNachricht(x: unknown): x is EingehendeNachricht {
  if (typeof x !== 'object' || x === null) return false;
  const n = x as Record<string, unknown>;
  if (n['art'] === 'hallo') return true;
  if (n['art'] === 'lebenszeichen') return typeof n['nr'] === 'number' && Number.isFinite(n['nr']);
  if (n['art'] === 'zustand') return typeof n['nr'] === 'number' && Number.isFinite(n['nr']) && 'zustand' in n;
  if (n['art'] === 'anzeige') return typeof n['nr'] === 'number' && Number.isFinite(n['nr']) && typeof n['beamer'] === 'boolean';
  return false;
}

function istUmschlag(x: unknown): x is Umschlag {
  if (typeof x !== 'object' || x === null) return false;
  const u = x as Record<string, unknown>;
  return u['mvg'] === 'kanal' && typeof u['von'] === 'string' && typeof u['folge'] === 'number' && istNachricht(u['nachricht']);
}

function standardWarne(grund: string): void {
  try {
    console.warn(`[mvg-kanal] ${grund}`);
  } catch {
    /* ohne Konsole bleibt nur Schweigen */
  }
}

function zufallsKennung(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function standardRundfunk(): (new (name: string) => RundfunkGriff) | null {
  const bc = (globalThis as { BroadcastChannel?: unknown }).BroadcastChannel;
  return typeof bc === 'function' ? (bc as new (name: string) => RundfunkGriff) : null;
}

function standardSpeicher(): { setItem(schluessel: string, wert: string): void } | null {
  try {
    return (globalThis as { localStorage?: { setItem(k: string, v: string): void } }).localStorage ?? null;
  } catch {
    return null;
  }
}

function standardSpeicherEreignis(): ((auf: (schluessel: string | null, wert: string | null) => void) => () => void) | null {
  const g = globalThis as { addEventListener?: unknown; removeEventListener?: unknown };
  if (typeof g.addEventListener !== 'function' || typeof g.removeEventListener !== 'function') return null;
  const an = g.addEventListener as (art: string, fn: (e: unknown) => void) => void;
  const ab = g.removeEventListener as (art: string, fn: (e: unknown) => void) => void;
  return (auf) => {
    const fn = (e: unknown): void => {
      const ev = e as { key?: unknown; newValue?: unknown };
      auf(typeof ev.key === 'string' ? ev.key : null, typeof ev.newValue === 'string' ? ev.newValue : null);
    };
    an.call(globalThis, 'storage', fn);
    return () => ab.call(globalThis, 'storage', fn);
  };
}

/** Baut einen Kanal. `name` trennt mehrere Kanäle (z. B. „regie“). */
export function erzeugeKanal(name: string, umgebung: KanalUmgebung = {}): Kanal {
  const warne = umgebung.warne ?? standardWarne;
  const kennung = umgebung.kennung ?? zufallsKennung();
  const Rundfunk = umgebung.rundfunk === undefined ? standardRundfunk() : umgebung.rundfunk;
  const speicher = umgebung.speicher === undefined ? standardSpeicher() : umgebung.speicher;
  const beiSpeicher = umgebung.beiSpeicherEreignis === undefined ? standardSpeicherEreignis() : umgebung.beiSpeicherEreignis;
  const schluessel = kanalSchluessel(name);

  let offen = true;
  let folge = 0;
  const empfaenger = new Set<(n: EingehendeNachricht) => void>();
  /** höchste Folgenummer je Absender (verwirft die zweite Zustellung) */
  const letzteFolge = new Map<string, number>();
  /** höchste Nummer je Nachrichtenart (verwirft Veraltetes) */
  const letzteNr = new Map<'zustand' | 'lebenszeichen' | 'anzeige', number>();

  const verteile = (roh: unknown): void => {
    if (!offen || !istUmschlag(roh) || roh.von === kennung) return;
    const vorher = letzteFolge.get(roh.von);
    if (vorher !== undefined && roh.folge <= vorher) return;
    letzteFolge.set(roh.von, roh.folge);
    const n = roh.nachricht;
    if (n.art === 'hallo') {
      letzteNr.clear();
    } else {
      const bisher = letzteNr.get(n.art);
      if (bisher !== undefined && n.nr <= bisher) return;
      letzteNr.set(n.art, n.nr);
    }
    for (const fn of [...empfaenger]) {
      try {
        fn(n);
      } catch (e) {
        warne(`Ein Empfänger des Kanals ist gescheitert: ${String(e)}`);
      }
    }
  };

  let griff: RundfunkGriff | null = null;
  const ausRundfunk = (e: { data: unknown }): void => verteile(e.data);
  if (Rundfunk !== null) {
    try {
      griff = new Rundfunk(`mvg-${name}`);
      griff.addEventListener('message', ausRundfunk);
    } catch (e) {
      warne(`BroadcastChannel ließ sich nicht öffnen, nur Rückfall: ${String(e)}`);
      griff = null;
    }
  }

  let abSpeicher: (() => void) | null = null;
  if (beiSpeicher !== null) {
    try {
      abSpeicher = beiSpeicher((k, wert) => {
        if (k !== schluessel || wert === null) return;
        let roh: unknown;
        try {
          roh = JSON.parse(wert);
        } catch {
          return; // fremder Inhalt unter unserem Schlüssel
        }
        verteile(roh);
      });
    } catch (e) {
      warne(`Das storage-Ereignis ließ sich nicht anmelden: ${String(e)}`);
    }
  }

  return {
    senden(nachricht: KanalNachricht): void {
      if (!offen) return;
      folge += 1;
      const text = JSON.stringify({ mvg: 'kanal', von: kennung, folge, nachricht });
      if (griff !== null) {
        try {
          griff.postMessage(JSON.parse(text) as unknown);
        } catch (e) {
          warne(`BroadcastChannel hat nicht gesendet: ${String(e)}`);
        }
      }
      if (speicher !== null) {
        try {
          speicher.setItem(schluessel, text);
        } catch (e) {
          warne(`Der Rückfall über den Speicher hat nicht geschrieben: ${String(e)}`);
        }
      }
    },

    abonnieren(fn: (n: EingehendeNachricht) => void): () => void {
      empfaenger.add(fn);
      return () => {
        empfaenger.delete(fn);
      };
    },

    schliessen(): void {
      if (!offen) return;
      offen = false;
      empfaenger.clear();
      if (griff !== null) {
        try {
          griff.removeEventListener('message', ausRundfunk);
          griff.close();
        } catch (e) {
          warne(`BroadcastChannel ließ sich nicht schließen: ${String(e)}`);
        }
        griff = null;
      }
      if (abSpeicher !== null) {
        abSpeicher();
        abSpeicher = null;
      }
    },
  };
}
