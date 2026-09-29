/*
 * Modale Dialoge der Lese-Flächen (Abbildung vergrößern, Grafik der Hilfe; P12.5 R11).
 *
 * Eingebettet (P10.6, L-67) ist der Rahmen so hoch wie sein Inhalt: `showModal()` stellte den Dialog in
 * die Mitte dieses hohen Rahmens, weit weg vom sichtbaren Teil der Hostseite. Deshalb richtet
 * `oeffneDialog` ihn dort an seinem Anker (der Figur) aus und meldet der Hostseite das Ziel, damit sie
 * dorthin rollt. Ein Klick neben den Dialog (auf den Hintergrund) schließt ihn – nicht aber ein Klick
 * auf seinen Innenrand.
 *
 * Die Höhe (94vh) bezöge sich eingebettet auf den hohen Rahmen: dort deckelt `oeffneDialog` sie auf das
 * Fenster der Hostseite (gleiche Herkunft) bzw. auf 640 px, wenn die Hostseite fremd ist (P12.5 R12).
 */

let zielMelder: ((y: number) => void) | null = null;

/** Eingebettet: wie die Hostseite zu einer Stelle im Rahmen rollt (src/main.ts → einbettung.meldeZiel). */
export function setzeZielMelder(melder: ((y: number) => void) | null): void {
  zielMelder = melder;
}

const eingebettet = (): boolean => document.documentElement.classList.contains('ist-eingebettet');

/** Öffnet `dialog` modal; eingebettet oben an `anker` statt in der Mitte des Rahmens. */
export function oeffneDialog(dialog: HTMLDialogElement, anker: Element): void {
  if (!eingebettet()) {
    zeigeModal(dialog);
    return;
  }
  // der Rahmen rollt nicht selbst (er ist so hoch wie sein Inhalt): Fensterkoordinaten = Dokumentkoordinaten
  const y = Math.max(0, Math.round(anker.getBoundingClientRect().top + window.scrollY));
  dialog.style.inset = `${y}px 0 auto 0`;
  dialog.style.maxHeight = `${hostHoehe()}px`;
  dialog.style.margin = '0 auto';
  zeigeModal(dialog);
  zielMelder?.(y);
}

/** Nutzbare Höhe im Fenster der Hostseite: deren innerHeight abzüglich Rand, fremde Herkunft 640 px. */
function hostHoehe(): number {
  let fenster = 0;
  try {
    fenster = window.parent.innerHeight;
  } catch {
    fenster = 0;
  }
  return Number.isFinite(fenster) && fenster > 0 ? Math.max(320, Math.round(fenster * 0.94) - 16) : 640;
}

const radSperre = new WeakMap<HTMLDialogElement, (e: WheelEvent) => void>();

/** Öffnet modal und hängt die Radsperre (halteRollenImDialog) bis zum Schließen ans Fenster. */
function zeigeModal(dialog: HTMLDialogElement): void {
  dialog.showModal();
  const sperre = radSperre.get(dialog);
  if (sperre === undefined) return;
  window.addEventListener('wheel', sperre, { passive: false, capture: true });
  dialog.addEventListener('close', () => window.removeEventListener('wheel', sperre, { capture: true }), { once: true });
}

const ROLLTASTEN = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' ']);

/** Kann `el` in Richtung (dx, dy) noch rollen? */
function kannRollen(el: HTMLElement, dx: number, dy: number): boolean {
  if (dy > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
  if (dy < 0 && el.scrollTop > 0) return true;
  if (dx > 0 && el.scrollLeft + el.clientWidth < el.scrollWidth - 1) return true;
  if (dx < 0 && el.scrollLeft > 0) return true;
  return false;
}

/**
 * Rollen bleibt im offenen Dialog (P12.5 R15): Mausrad, Wischen und Rolltasten rollen nur ihn – nie die
 * Seite oder (eingebettet) die Hostseite dahinter, auch wenn das Bild ganz hineinpasst. `overscroll-behavior`
 * allein greift nur, solange der Dialog selbst rollen kann.
 */
export function halteRollenImDialog(dialog: HTMLDialogElement): void {
  // am Fenster (Erfassung), nur solange der Dialog offen ist: ein Rad über dem Hintergrund (::backdrop)
  // erreicht den Dialog sonst nicht verlässlich; geschlossen bleibt das Rollen der Seite passiv
  radSperre.set(dialog, (e: WheelEvent) => {
    const r = dialog.getBoundingClientRect();
    const drin = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!drin || !kannRollen(dialog, e.deltaX, e.deltaY)) e.preventDefault();
  });
  let y0 = 0;
  let x0 = 0;
  dialog.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (t !== undefined) { y0 = t.clientY; x0 = t.clientX; }
  }, { passive: true });
  dialog.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (t !== undefined && !kannRollen(dialog, x0 - t.clientX, y0 - t.clientY)) e.preventDefault();
  }, { passive: false });
  dialog.addEventListener('keydown', (e) => {
    if (!ROLLTASTEN.has(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
    // Leertaste auf einem Knopf oder Link löst ihn aus, rollt nicht
    if (e.key === ' ' && e.target instanceof Element && e.target.closest('button, a') !== null) return;
    e.preventDefault();
    const seite = Math.max(40, dialog.clientHeight - 60);
    const schritt: Record<string, [number, number]> = {
      ArrowUp: [0, -40], ArrowDown: [0, 40], ArrowLeft: [-40, 0], ArrowRight: [40, 0],
      PageUp: [0, -seite], PageDown: [0, seite], ' ': [0, e.shiftKey ? -seite : seite],
    };
    if (e.key === 'Home') dialog.scrollTo({ top: 0 });
    else if (e.key === 'End') dialog.scrollTo({ top: dialog.scrollHeight });
    else {
      const [dx, dy] = schritt[e.key] ?? [0, 0];
      dialog.scrollBy({ left: dx, top: dy });
    }
  });
}

/** Schließt den Dialog bei einem Klick außerhalb seines Rechtecks (Hintergrund), nicht auf dem Innenrand. */
export function schliesseBeiKlickDaneben(dialog: HTMLDialogElement): void {
  dialog.addEventListener('click', (e) => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    const drin = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!drin) dialog.close();
  });
}
