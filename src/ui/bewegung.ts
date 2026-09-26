/*
 * Bewegung: reduzierte Bewegung abfragen, Zeitgeber bündeln, Zähler hochzählen.
 *
 * Zustände hängen nie an einer Animation (docs/STIL.md → Bewegung): jede Funktion hier setzt am Ende
 * den Endzustand, und bei `prefers-reduced-motion: reduce` sofort. Ohne `matchMedia` oder
 * `requestAnimationFrame` (z. B. im Test mit jsdom) läuft alles ohne Bewegung.
 */

export function reduziert(): boolean {
  try {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function schmal(): boolean {
  try {
    return typeof matchMedia === 'function' && matchMedia('(max-width: 640px)').matches;
  } catch {
    return false;
  }
}

function jetzt(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

/** Nächster Bildaufbau (Rückfall: Zeitgeber). */
export function naechsterFrame(fn: (t: number) => void): void {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fn);
  else setTimeout(() => fn(jetzt()), 16);
}

/**
 * Sammelt Zeitgeber und Bildschleifen einer Szene, damit ein Szenenwechsel alles Laufende beendet
 * (sonst tickte die Prüfliste einer verlassenen Szene weiter).
 */
export class Takt {
  private zeitgeber: ReturnType<typeof setTimeout>[] = [];
  private generation = 0;

  /** Führt `fn` nach `ms` aus – bei reduzierter Bewegung sofort (im nächsten Umlauf). */
  spaeter(fn: () => void, ms: number): void {
    const gen = this.generation;
    this.zeitgeber.push(setTimeout(() => {
      if (gen === this.generation) fn();
    }, reduziert() ? 0 : ms));
  }

  /** Bildschleife über `dauer` ms: `schritt(p)` mit p von 0 bis 1; endet immer mit p = 1. */
  schleife(dauer: number, schritt: (p: number) => void, fertig?: () => void): void {
    const gen = this.generation;
    if (reduziert() || dauer <= 0 || typeof requestAnimationFrame !== 'function') {
      schritt(1);
      fertig?.();
      return;
    }
    const t0 = jetzt();
    const lauf = (t: number): void => {
      if (gen !== this.generation) return;
      const p = Math.min(1, Math.max(0, (t - t0) / dauer));
      schritt(p);
      if (p < 1) requestAnimationFrame(lauf);
      else fertig?.();
    };
    requestAnimationFrame(lauf);
  }

  /** Beendet alles Laufende. */
  halt(): void {
    this.generation += 1;
    for (const z of this.zeitgeber) clearTimeout(z);
    this.zeitgeber = [];
  }
}

export function sanftAus(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function sanftBeide(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Zählt die Zahl in `el` von `von` bis `bis` hoch (Instrumentwerte, Datenstand). */
export function zaehle(el: Element, von: number, bis: number, ms: number, format: (v: number) => string = (v) => String(Math.round(v))): void {
  const marke = String(Number(el.getAttribute('data-zaehler') ?? '0') + 1);
  el.setAttribute('data-zaehler', marke);
  if (reduziert() || von === bis || typeof requestAnimationFrame !== 'function') {
    el.textContent = format(bis);
    return;
  }
  const t0 = jetzt();
  el.textContent = format(von);
  const lauf = (t: number): void => {
    if (el.getAttribute('data-zaehler') !== marke) return;
    const p = Math.min(1, Math.max(0, (t - t0) / ms));
    el.textContent = format(von + (bis - von) * sanftAus(p));
    if (p < 1) requestAnimationFrame(lauf);
  };
  requestAnimationFrame(lauf);
}

/** Lässt eine einmalige CSS-Animation (Klasse) neu starten. */
export function neuAnstossen(el: Element, klasse: string): void {
  el.classList.remove(klasse);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(klasse);
}

/** Zahl deutsch mit Komma. */
export function dezimal(v: number, stellen: number): string {
  return v.toFixed(stellen).replace('.', ',');
}
