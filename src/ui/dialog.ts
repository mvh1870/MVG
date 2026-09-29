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
    dialog.showModal();
    return;
  }
  // der Rahmen rollt nicht selbst (er ist so hoch wie sein Inhalt): Fensterkoordinaten = Dokumentkoordinaten
  const y = Math.max(0, Math.round(anker.getBoundingClientRect().top + window.scrollY));
  dialog.style.inset = `${y}px 0 auto 0`;
  dialog.style.maxHeight = `${hostHoehe()}px`;
  dialog.style.margin = '0 auto';
  dialog.showModal();
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

/** Schließt den Dialog bei einem Klick außerhalb seines Rechtecks (Hintergrund), nicht auf dem Innenrand. */
export function schliesseBeiKlickDaneben(dialog: HTMLDialogElement): void {
  dialog.addEventListener('click', (e) => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    const drin = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!drin) dialog.close();
  });
}
