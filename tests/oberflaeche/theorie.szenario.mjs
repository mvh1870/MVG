// Browser-Szenario Theorie (P6.15): jede Lernseite Kap. 1–13 mit allen aufgeklappten Ebenen und Tafeln –
// Layout (kein Seitwärtsscrollen), axe, Kontrast der Zitate (axe greift wegen ::before nicht) und
// Tastatur-Erreichbarkeit breiter Tabellen. Läuft mit reduzierter Bewegung (prefers-reduced-motion):
// die Tafeln erscheinen sofort, und die Seite beendet ihre Animationen (STIL, P2-Befund V6).
// Schnell: alle Seiten bei 1280 und 400; voll zusätzlich 1024.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kontrastQuellen, pruefeLayout } from './hilfen.mjs';

export const name = 'theorie';
export const hash = '#theorie';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const breite = seite.viewportSize()?.width ?? 1280;
  if (!h.voll && breite > 400 && breite < 1280) return;
  const inhalte = JSON.parse(readFileSync(path.join(WURZEL, 'src', 'generiert', 'inhalte.json'), 'utf8'));
  const kapitel = Object.values(inhalte.theorie).map((t) => t.kapitel).sort((a, b) => a - b);
  if (kapitel.length !== 13) h.befund(`${kapitel.length} Lernseiten statt 13`);

  await seite.emulateMedia({ reducedMotion: 'reduce' });
  await h.erwarte('[data-pruef="kapitel-liste"]');
  for (const nr of kapitel) {
    await seite.evaluate((n) => { location.hash = `#theorie/k${n}`; }, nr);
    await h.erwarte(`[data-kapitel="${nr}"] [data-pruef="lernseite"]`);
    // alle Ebenen und aufklappbaren Tafeln öffnen
    await seite.evaluate(() => { for (const d of document.querySelectorAll('.lernseite details')) d.setAttribute('open', ''); });
    await h.warte(100);
    const laufend = await seite.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    if (laufend > 0) h.befund(`k${nr}: ${laufend} Animationen laufen trotz reduzierter Bewegung`);
    for (const fund of await seite.evaluate(kontrastQuellen, '.lern-zitat p, .lern-zitat-rahmen figcaption')) h.befund(`k${nr}: ${fund}`);
    for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`k${nr}: ${fund}`);
    // breite Tabellen im Originaltext: scrollbarer Bereich per Tastatur erreichbar
    const ohneFokus = await seite.evaluate(() => [...document.querySelectorAll('.absatz-block')]
      .filter((el) => el.scrollWidth > el.clientWidth + 1 && el.getAttribute('tabindex') !== '0').length);
    if (ohneFokus > 0) h.befund(`k${nr}: ${ohneFokus} scrollbare Tabellen nicht per Tastatur erreichbar`);
    await h.axe(`k${nr}`);
    if (nr === 4 || nr === 8) await h.bild(`k${nr}`);
  }
}
