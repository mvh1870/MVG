/*
 * Modale Dialoge der Lese-Flächen (Abbildung vergrößern; P12.5 R11). Ein Klick neben den Dialog (auf den
 * Hintergrund) schließt ihn – nicht aber ein Klick auf seinen Innenrand. Rollen bleibt im offenen Dialog.
 */

/** Öffnet `dialog` modal (mit Radsperre, solange er offen ist). */
export function oeffneDialog(dialog: HTMLDialogElement, _anker: Element): void {
  zeigeModal(dialog);
}

const radSperre = new WeakMap<HTMLDialogElement, (e: WheelEvent) => boolean>();

/**
 * Öffnet modal und hängt die Radsperre (halteRollenImDialog) ans Fenster – bis zum Schließen oder bis der
 * Dialog nicht mehr offen im Dokument steht (ein Seitenwechsel nimmt ihn heraus, ohne dass 'close' feuert).
 */
function zeigeModal(dialog: HTMLDialogElement): void {
  dialog.showModal();
  const sperre = radSperre.get(dialog);
  if (sperre === undefined) return;
  const ende = new AbortController();
  window.addEventListener('wheel', (e) => {
    if (!dialog.open || !dialog.isConnected) { ende.abort(); return; }
    if (sperre(e)) e.preventDefault();
  }, { passive: false, capture: true, signal: ende.signal });
  dialog.addEventListener('close', () => ende.abort(), { once: true, signal: ende.signal });
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
 * Seite dahinter, auch wenn das Bild ganz hineinpasst. `overscroll-behavior`
 * allein greift nur, solange der Dialog selbst rollen kann.
 */
export function halteRollenImDialog(dialog: HTMLDialogElement): void {
  // am Fenster (Erfassung), nur solange der Dialog offen ist: ein Rad über dem Hintergrund (::backdrop)
  // erreicht den Dialog sonst nicht verlässlich; geschlossen bleibt das Rollen der Seite passiv
  // gibt zurück, ob das Rad gesperrt wird; Strg+Rad (Zoom) gehört dem Browser, Umschalt+Rad rollt waagrecht
  radSperre.set(dialog, (e: WheelEvent) => {
    if (e.ctrlKey) return false;
    const [dx, dy] = e.shiftKey && e.deltaX === 0 ? [e.deltaY, 0] : [e.deltaX, e.deltaY];
    const r = dialog.getBoundingClientRect();
    const drin = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    return !drin || !kannRollen(dialog, dx, dy);
  });
  let y0 = 0;
  let x0 = 0;
  dialog.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (t !== undefined) { y0 = t.clientY; x0 = t.clientX; }
  }, { passive: true });
  dialog.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) return; // Zwei-Finger-Zoom gehört dem Browser
    const t = e.touches[0];
    if (t !== undefined && !kannRollen(dialog, x0 - t.clientX, y0 - t.clientY)) e.preventDefault();
  }, { passive: false });
  dialog.addEventListener('keydown', (e) => {
    // Fokus bleibt im Dialog (R23)
    if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const rollt = dialog.scrollHeight > dialog.clientHeight + 1 || dialog.scrollWidth > dialog.clientWidth + 1;
      const ziele: HTMLElement[] = [
        ...(rollt ? [dialog] : []),
        ...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
      ].filter((el) => el === dialog || el.getClientRects().length > 0);
      const erstes = ziele[0];
      const letztes = ziele[ziele.length - 1];
      if (erstes === undefined || letztes === undefined) { e.preventDefault(); return; }
      // nach der Stelle in den Zielen entscheiden: der Fokus auf dem nicht rollenden Dialog selbst (Klick auf
      // Kopf oder Bild) steht nicht darin und gilt als Rand (R25)
      const i = ziele.indexOf(document.activeElement as HTMLElement);
      if (i === -1 || (e.shiftKey ? i === 0 : i === ziele.length - 1)) {
        e.preventDefault();
        (e.shiftKey ? letztes : erstes).focus({ preventScroll: true });
      }
      return;
    }
    if (!ROLLTASTEN.has(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
    // Leertaste auf einem Knopf oder Link löst ihn aus, rollt nicht (R19)
    if (e.key === ' ' && e.target instanceof Element && e.target.closest('button, a') !== null) return;
    e.preventDefault();
    const seite = Math.max(40, dialog.clientHeight - 60);
    const schritt: Record<string, [number, number]> = {
      ArrowUp: [0, -40], ArrowDown: [0, 40], ArrowLeft: [-40, 0], ArrowRight: [40, 0],
      PageUp: [0, -seite], PageDown: [0, seite], ' ': [0, e.shiftKey ? -seite : seite],
    };
    if (e.key === 'Home' || e.key === 'End') {
      dialog.scrollTo({ top: e.key === 'Home' ? 0 : dialog.scrollHeight });
    }
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
