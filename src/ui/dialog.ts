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
 * Fenster der Hostseite (gleiche Herkunft gemessen, sonst von ihr gemeldet) und folgt ihm, solange der Dialog
 * offen ist (`deckeleHoehe`); ist es unbekannt, auf 640 px,
 * und am Ende des Dialogs rollt dann die Hostseite weiter (P12.5 R12, R17).
 */

let zielMelder: ((y: number) => void) | null = null;
let gemeldetesFenster: number | null = null;
/** Eingebettet offene Dialoge; ihre Höhe folgt jeder neuen Fenstermeldung bzw. Größenänderung der Hostseite. */
const offeneEingebettet = new Set<HTMLDialogElement>();

/** Eingebettet: Fensterhöhe, die die Hostseite meldet (Einbett-Nachricht „fenster“, auch bei fremder Herkunft). */
export function setzeHostFenster(hoehe: number | null): void {
  gemeldetesFenster = hoehe;
  // offene Dialoge folgen dem Fenster (Telefon drehen, Fenster verkleinern; P12.5 R21)
  for (const d of offeneEingebettet) {
    if (d.open && d.isConnected) deckeleHoehe(d);
    else offeneEingebettet.delete(d); // durch einen Seitenwechsel entfernt, ohne 'close' (R22)
  }
}

/** Höhendeckel und rollfrei nach dem aktuell bekannten Hostfenster setzen. */
function deckeleHoehe(dialog: HTMLDialogElement): void {
  const hoehe = hostHoehe();
  dialog.style.maxHeight = `${hoehe ?? 640}px`;
  // fremde Herkunft (Hostfenster nicht messbar, P12.5 R17): Am Ende des Dialogs geht das Rollen an die
  // Hostseite weiter – sonst bliebe auf niedrigen Fenstern der untere Teil des Bilds unerreichbar
  dialog.dataset['rollfrei'] = hoehe === null ? 'ja' : 'nein';
  dialog.style.overscrollBehavior = hoehe === null ? 'auto' : '';
}

/** Gleiche Herkunft: Größenänderung der Hostseite direkt beobachten, solange ein Dialog offen ist. */
function beobachteHostfenster(dialog: HTMLDialogElement): void {
  let eltern: Window | null = null;
  try {
    eltern = window.parent !== window ? window.parent : null;
    void eltern?.innerHeight;
  } catch {
    eltern = null;
  }
  const ende = (): void => {
    offeneEingebettet.delete(dialog);
    eltern?.removeEventListener('resize', neu);
  };
  // ein Seitenwechsel nimmt den Dialog heraus, ohne dass 'close' feuert: dann hier aufräumen (R22)
  const neu = (): void => {
    if (!dialog.open || !dialog.isConnected) { ende(); return; }
    deckeleHoehe(dialog);
  };
  eltern?.addEventListener('resize', neu);
  offeneEingebettet.add(dialog);
  dialog.addEventListener('close', ende, { once: true });
}

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
  dialog.style.margin = '0 auto';
  deckeleHoehe(dialog);
  zeigeModal(dialog);
  beobachteHostfenster(dialog);
  zielMelder?.(y);
}

/**
 * Nutzbare Höhe im Fenster der Hostseite: deren innerHeight abzüglich Rand – gemessen (gleiche Herkunft) oder
 * von der Hostseite gemeldet; null = unbekannt (fremde Herkunft ohne Meldung).
 */
function hostHoehe(): number | null {
  let fenster = 0;
  try {
    fenster = window.parent.innerHeight;
  } catch {
    fenster = gemeldetesFenster ?? 0;
  }
  return Number.isFinite(fenster) && fenster > 0 ? Math.max(320, Math.round(fenster * 0.94) - 16) : null;
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

/**
 * Holt die obere bzw. untere Kante des Dialogs ins Bild – eingebettet rollt dabei die Hostseite, nur so weit
 * wie nötig. Der Dialog selbst liegt fest in der obersten Ebene; `scrollIntoView` auf ihm rollt keine
 * Vorfahren. Deshalb eine unsichtbare Marke im Dokument an seiner Kante.
 */
function zeigeKante(dialog: HTMLDialogElement, oben: boolean): void {
  const r = dialog.getBoundingClientRect();
  const marke = document.createElement('div');
  marke.setAttribute('aria-hidden', 'true');
  marke.style.cssText = `position:absolute;left:0;width:1px;height:1px;pointer-events:none;top:${Math.round((oben ? r.top : r.bottom - 1) + window.scrollY)}px`;
  document.body.append(marke);
  // 'nearest': liegt die Kante schon im Bild, rollt nichts; sonst nur bis zu ihr (R19)
  marke.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
  marke.remove();
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
  // gibt zurück, ob das Rad gesperrt wird; Strg+Rad (Zoom) gehört dem Browser, Umschalt+Rad rollt waagrecht
  const rollfrei = (): boolean => dialog.dataset['rollfrei'] === 'ja';
  radSperre.set(dialog, (e: WheelEvent) => {
    if (e.ctrlKey) return false;
    const [dx, dy] = e.shiftKey && e.deltaX === 0 ? [e.deltaY, 0] : [e.deltaX, e.deltaY];
    const r = dialog.getBoundingClientRect();
    const drin = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    // rollfrei: am Ende (oder neben dem Dialog) nur bis zur Dialogkante weiter – die Hostseite rollt mit,
    // nie darüber hinaus und nie entgegen der Drehrichtung (R18, R19)
    if (rollfrei()) {
      if (dy === 0 || (drin && kannRollen(dialog, dx, dy))) return false;
      zeigeKante(dialog, dy < 0);
      return true;
    }
    return !drin || !kannRollen(dialog, dx, dy);
  });
  let y0 = 0;
  let x0 = 0;
  dialog.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (t !== undefined) { y0 = t.clientY; x0 = t.clientX; }
  }, { passive: true });
  dialog.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1 || rollfrei()) return; // Zwei-Finger-Zoom gehört dem Browser; rollfrei wischt die Hostseite mit
    const t = e.touches[0];
    if (t !== undefined && !kannRollen(dialog, x0 - t.clientX, y0 - t.clientY)) e.preventDefault();
  }, { passive: false });
  dialog.addEventListener('keydown', (e) => {
    if (!ROLLTASTEN.has(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
    // Leertaste auf einem Knopf oder Link löst ihn aus, rollt nicht (auch rollfrei, R19)
    if (e.key === ' ' && e.target instanceof Element && e.target.closest('button, a') !== null) return;
    // rollfrei: am Ende rollt die Hostseite nur bis zur Dialogkante mit (R18), vorher der Dialog selbst
    const hoch = ['ArrowUp', 'PageUp', 'Home'].includes(e.key) || (e.key === ' ' && e.shiftKey);
    if (rollfrei() && !['ArrowLeft', 'ArrowRight'].includes(e.key) && !kannRollen(dialog, 0, hoch ? -1 : 1)) {
      e.preventDefault();
      zeigeKante(dialog, hoch);
      return;
    }
    e.preventDefault();
    const seite = Math.max(40, dialog.clientHeight - 60);
    const schritt: Record<string, [number, number]> = {
      ArrowUp: [0, -40], ArrowDown: [0, 40], ArrowLeft: [-40, 0], ArrowRight: [40, 0],
      PageUp: [0, -seite], PageDown: [0, seite], ' ': [0, e.shiftKey ? -seite : seite],
    };
    if (e.key === 'Home' || e.key === 'End') {
      dialog.scrollTo({ top: e.key === 'Home' ? 0 : dialog.scrollHeight });
      // rollfrei: ein Druck holt auch die Kante des Dialogs ins Bild (R20)
      if (rollfrei()) zeigeKante(dialog, e.key === 'Home');
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
