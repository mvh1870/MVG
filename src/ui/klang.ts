/*
 * Dezente Klänge (P10.6, E14): standardmäßig AUS. Kurze, leise Sinustöne über Web Audio (keine
 * Tondateien): eine Wahl, ein Stationswechsel, eine Freischaltung. Der Schalter merkt sich die Wahl
 * im Browser (Komfort, L-12); ohne Web Audio oder Speicher bleibt es still.
 */

export type KlangArt = 'wahl' | 'station' | 'frei';

export interface Klang {
  an(): boolean;
  setze(an: boolean): void;
  spiele(art: KlangArt): void;
}

/** Töne je Art: Frequenzen in Hz, nacheinander, je 90 ms */
export const TOENE: Readonly<Record<KlangArt, readonly number[]>> = {
  wahl: [660],
  station: [440, 554],
  frei: [523, 659, 784],
};

const SCHLUESSEL = 'mvg.klang';

interface TonGeber {
  currentTime: number;
  state?: string;
  resume?: () => Promise<void>;
  destination: AudioNode;
  createOscillator(): OscillatorNode;
  createGain(): GainNode;
}

export function erzeugeKlang(
  speicher: { getItem(k: string): string | null; setItem(k: string, v: string): void } | null,
  fabrik: (() => TonGeber) | null = typeof AudioContext === 'function' ? () => new AudioContext() : null,
): Klang {
  let an = false;
  try {
    an = speicher?.getItem(SCHLUESSEL) === 'an';
  } catch {
    an = false;
  }
  let geber: TonGeber | null = null;
  return {
    an: () => an,
    setze(neu) {
      an = neu;
      try {
        speicher?.setItem(SCHLUESSEL, neu ? 'an' : 'aus');
      } catch {
        // Speicher gesperrt: gilt nur bis zum Neuladen
      }
      if (neu) this.spiele('wahl');
    },
    spiele(art) {
      if (!an || fabrik === null) return;
      try {
        geber ??= fabrik();
        // Autoplay-Sperre: ohne Nutzergeste entstanden, bleibt der Kontext angehalten – beim nächsten Ton wecken
        if (geber.state === 'suspended') void geber.resume?.().catch(() => undefined);
        const t0 = geber.currentTime;
        TOENE[art].forEach((f, i) => {
          const g = geber?.createGain();
          const osz = geber?.createOscillator();
          if (g === undefined || osz === undefined || geber === null) return;
          const t = t0 + i * 0.09;
          osz.type = 'sine';
          osz.frequency.value = f;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.04, t + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
          osz.connect(g).connect(geber.destination);
          osz.start(t);
          osz.stop(t + 0.2);
        });
      } catch {
        // kein Ton möglich: still bleiben
      }
    },
  };
}
