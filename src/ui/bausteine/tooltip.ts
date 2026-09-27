/*
 * Glossar-Hinweis (docs/STIL.md „Glossar-Begriff und Tooltip“): erscheint bei Maus UND Tastaturfokus,
 * Esc schließt, `aria-describedby` am Begriff. Touch: Antippen öffnet, Tipp daneben schließt. Die Definition kommt wörtlich aus dem Glossar des
 * Whitepapers (inhalte.json → glossar).
 *
 * WCAG 1.4.13: Der Hinweis bleibt offen, solange der Zeiger auf dem Begriff ODER auf dem Hinweis
 * selbst ist; er schließt erst nach kurzer Verzögerung, damit der Weg über den Spalt gelingt. Esc
 * schließt nur den Hinweis und wird dabei verbraucht (Fangphase) – die Seitenleiste bleibt offen.
 */

import { h } from '../h.ts';
import type { OeffentlicheInhalte } from '../../inhalte/typen.ts';

let zaehler = 0;

export interface Tooltips {
  schliesse(): void;
  entferne(): void;
}

export function installiereTooltips(wurzel: HTMLElement, inhalte: OeffentlicheInhalte, quelle: string): Tooltips {
  zaehler += 1;
  const id = `mvg-tipp-${zaehler}`;
  const tipp = h('div', { class: 'tipp', role: 'tooltip', id, hidden: true });
  document.body.appendChild(tipp);
  let fuer: HTMLElement | null = null;
  let spaeter: ReturnType<typeof setTimeout> | null = null;
  const abbrechen = (): void => {
    if (spaeter !== null) clearTimeout(spaeter);
    spaeter = null;
  };

  const platziere = (el: HTMLElement): void => {
    const r = el.getBoundingClientRect();
    const b = tipp.offsetWidth;
    const hoehe = tipp.offsetHeight;
    const breite = document.documentElement.clientWidth || window.innerWidth;
    const x = Math.min(Math.max(8, r.left + r.width / 2 - b / 2), Math.max(8, breite - b - 8));
    let y = r.top - hoehe - 10;
    if (y < 8) y = r.bottom + 10;
    tipp.style.left = `${Math.round(x)}px`;
    tipp.style.top = `${Math.round(y)}px`;
  };
  const schliesse = (): void => {
    abbrechen();
    if (fuer !== null) fuer.removeAttribute('aria-describedby');
    fuer = null;
    tipp.hidden = true;
  };
  const zeige = (el: HTMLElement): void => {
    const g = inhalte.glossar[el.getAttribute('data-glossar') ?? ''];
    if (g === undefined) return;
    if (fuer !== null && fuer !== el) fuer.removeAttribute('aria-describedby');
    tipp.replaceChildren(h('b', null, g.begriff), g.definition, h('small', null, quelle));
    tipp.hidden = false;
    fuer = el;
    el.setAttribute('aria-describedby', id);
    platziere(el);
  };
  const begriffVon = (t: EventTarget | null): HTMLElement | null =>
    t instanceof Element ? (t.closest('.begriff') as HTMLElement | null) : null;

  /** Schließt gleich – es sei denn, der Zeiger kommt auf Begriff oder Hinweis zurück. */
  const schliesseGleich = (): void => {
    abbrechen();
    spaeter = setTimeout(() => {
      spaeter = null;
      if (fuer !== null && document.activeElement !== fuer) schliesse();
    }, 300);
  };
  const beiMaus = (e: Event): void => {
    const b = begriffVon(e.target);
    if (b !== null) {
      abbrechen();
      if (b !== fuer) zeige(b);
    } else if (fuer !== null && document.activeElement !== fuer) schliesseGleich();
  };
  const beiFokus = (e: Event): void => {
    const b = begriffVon(e.target);
    if (b !== null) zeige(b);
    else if (fuer !== null) schliesse();
  };
  // Touch (P2.3): Antippen zeigt den Hinweis, erneutes Antippen desselben Begriffs oder ein Tipp
  // daneben schließt ihn. Ein Tipp in den Hinweis selbst lässt ihn offen.
  // Auf echten Geräten kommen vor dem click Ersatz-Ereignisse (mouseover, focusin), die den Hinweis
  // schon öffnen. Deshalb merkt sich pointerdown, ob er beim Antippen bereits für diesen Begriff offen war.
  let tippenBeiOffen: HTMLElement | null = null;
  let letzterZeiger = '';
  const beiDruck = (e: PointerEvent): void => {
    letzterZeiger = e.pointerType;
    tippenBeiOffen = !tipp.hidden ? fuer : null;
  };
  const beiKlick = (e: Event): void => {
    const b = begriffVon(e.target);
    const touch = letzterZeiger === 'touch' || (e as PointerEvent).pointerType === 'touch';
    if (b !== null) {
      if (touch && tippenBeiOffen === b) schliesse();
      else zeige(b);
    } else if (fuer !== null && !(e.target instanceof Node && tipp.contains(e.target))) schliesse();
    tippenBeiOffen = null;
  };
  const beiTaste = (e: KeyboardEvent): void => {
    if ((e.key === 'Escape' || e.key === 'Esc') && fuer !== null && !tipp.hidden) {
      schliesse();
      // Eine Esc-Taste schließt genau eine Ebene (STIL „Esc schließt“).
      e.preventDefault();
    }
  };
  const beiRollen = (): void => {
    if (fuer === null) return;
    if (document.contains(fuer)) platziere(fuer);
    else schliesse();
  };
  wurzel.addEventListener('mouseover', beiMaus);
  wurzel.addEventListener('mouseleave', schliesseGleich);
  wurzel.addEventListener('focusin', beiFokus);
  wurzel.addEventListener('pointerdown', beiDruck);
  wurzel.addEventListener('click', beiKlick);
  tipp.addEventListener('mouseenter', abbrechen);
  tipp.addEventListener('mouseleave', schliesseGleich);
  document.addEventListener('keydown', beiTaste, true);
  document.addEventListener('scroll', beiRollen, true);

  return {
    schliesse,
    entferne() {
      abbrechen();
      wurzel.removeEventListener('mouseover', beiMaus);
      wurzel.removeEventListener('mouseleave', schliesseGleich);
      wurzel.removeEventListener('focusin', beiFokus);
      wurzel.removeEventListener('pointerdown', beiDruck);
      wurzel.removeEventListener('click', beiKlick);
      document.removeEventListener('keydown', beiTaste, true);
      document.removeEventListener('scroll', beiRollen, true);
      tipp.remove();
    },
  };
}
