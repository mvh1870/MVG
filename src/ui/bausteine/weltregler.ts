/*
 * Schieberegler Welt A ⟷ Welt B (docs/STIL.md „Schieberegler“): Maus, Berührung und Tastatur.
 *
 * Der Regler hält keinen eigenen Stand: jede Bewegung meldet er über `beiWert` (→ Aktion
 * `setzeVergleich`), gezeichnet wird, was der Zustand zurückgibt (`setze`). Nach dem Loslassen gleitet
 * er in die nähere Welt. Ohne `beiWert` (Leinwand, Vorschau) ist er nur Anzeige.
 */

import { h } from '../h.ts';
import { reduziert, sanftBeide, naechsterFrame } from '../bewegung.ts';
import { sym } from './bloecke.ts';

export interface ReglerOptionen {
  /** meldet einen neuen Wert 0…1 */
  beiWert: ((wert: number) => void) | null;
  beschriftung: { a: string; aZusatz: string; b: string; bZusatz: string; regler: string };
}

export interface Regler {
  element: HTMLElement;
  setze(wert: number): void;
  /** wackelt einmal zur Einladung */
  lade(): void;
}

export function weltRegler(o: ReglerOptionen): Regler {
  let wert = 0;
  let gleitNr = 0;
  const griff = h('div', {
    class: 'regler-griff',
    role: 'slider',
    tabindex: 0,
    'aria-label': o.beschriftung.regler,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': 0,
    'aria-valuetext': o.beschriftung.a,
    'data-pruef': 'vergleich',
  }, sym('griff'));
  const bahn = h('div', { class: 'regler-bahn' }, h('div', { class: 'regler-schiene' }), griff);
  const melde = (v: number): void => {
    o.beiWert?.(Math.min(1, Math.max(0, v)));
  };
  const gleite = (ziel: number): void => {
    const nr = ++gleitNr;
    const von = wert;
    if (reduziert() || Math.abs(ziel - von) < 1e-3 || typeof requestAnimationFrame !== 'function') {
      melde(ziel);
      return;
    }
    const dauer = 300 + 1300 * Math.abs(ziel - von);
    const t0 = performance.now();
    const lauf = (t: number): void => {
      if (nr !== gleitNr) return;
      const p = Math.min(1, (t - t0) / dauer);
      melde(von + (ziel - von) * sanftBeide(p));
      if (p < 1) naechsterFrame(lauf);
    };
    naechsterFrame(lauf);
  };
  const ende = (welt: 'a' | 'b'): HTMLElement => h('button', {
    type: 'button',
    class: 'regler-ende',
    'data-welt': welt,
    'data-pruef': `vergleich-${welt}`,
    onclick: () => {
      griff.classList.remove('ist-hinweis');
      gleite(welt === 'a' ? 0 : 1);
    },
  }, h('b', null, welt === 'a' ? o.beschriftung.a : o.beschriftung.b), h('small', null, welt === 'a' ? o.beschriftung.aZusatz : o.beschriftung.bZusatz));

  if (o.beiWert !== null) {
    let zieht = false;
    const ausX = (x: number): number => {
      const r = bahn.getBoundingClientRect();
      return (x - r.left - 24) / Math.max(1, r.width - 48);
    };
    bahn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      zieht = true;
      gleitNr += 1;
      try {
        bahn.setPointerCapture(e.pointerId);
      } catch {
        /* ohne Zeigerfang geht es trotzdem */
      }
      griff.focus({ preventScroll: true });
      griff.classList.remove('ist-hinweis');
      melde(ausX(e.clientX));
      e.preventDefault();
    });
    bahn.addEventListener('pointermove', (e) => {
      if (!zieht) return;
      melde(ausX(e.clientX));
      e.preventDefault();
    });
    const los = (e: PointerEvent): void => {
      if (!zieht) return;
      zieht = false;
      try {
        bahn.releasePointerCapture(e.pointerId);
      } catch {
        /* s. o. */
      }
      gleite(wert >= 0.5 ? 1 : 0);
    };
    bahn.addEventListener('pointerup', los);
    bahn.addEventListener('pointercancel', los);
    griff.addEventListener('keydown', (e) => {
      let ziel: number | null = null;
      switch (e.key) {
        case 'ArrowRight': case 'ArrowUp': case 'PageUp': case 'End': ziel = 1; break;
        case 'ArrowLeft': case 'ArrowDown': case 'PageDown': case 'Home': ziel = 0; break;
        case 'Enter': case ' ': ziel = wert < 0.5 ? 1 : 0; break;
        default: break;
      }
      if (ziel === null) return;
      e.preventDefault();
      e.stopPropagation();
      griff.classList.remove('ist-hinweis');
      gleite(ziel);
    });
  }

  const element = h('div', { class: 'welt-regler' }, ende('a'), bahn, ende('b'));
  return {
    element,
    setze(v) {
      wert = Math.min(1, Math.max(0, v));
      const p = Math.round(wert * 100);
      griff.style.setProperty('--wert', String(wert * 100));
      griff.setAttribute('aria-valuenow', String(p));
      griff.setAttribute('aria-valuetext', p <= 0 ? `${o.beschriftung.a}, ${o.beschriftung.aZusatz}` : p >= 100 ? `${o.beschriftung.b}, ${o.beschriftung.bZusatz}` : `${p < 50 ? o.beschriftung.a : o.beschriftung.b}, ${p} %`);
    },
    lade() {
      if (!reduziert() && wert === 0) griff.classList.add('ist-hinweis');
    },
  };
}
