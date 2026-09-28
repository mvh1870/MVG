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
    // reduzierte Bewegung: keine Animation und kein Übergang dauert länger als 1 ms (basis.css)
    const lang = await seite.evaluate(() => document.getAnimations()
      .filter((a) => Number(a.effect?.getComputedTiming().duration ?? 0) > 1)
      .map((a) => `${/** @type {any} */ (a).animationName ?? /** @type {any} */ (a).transitionProperty ?? ''}@${/** @type {any} */ (a.effect)?.target?.className ?? ''}`));
    if (lang.length > 0) h.befund(`k${nr}: ${lang.length} Animationen trotz reduzierter Bewegung länger als 1 ms (${lang.slice(0, 3).join(', ')})`);
    for (const fund of await seite.evaluate(kontrastQuellen, '.lern-zitat p, .lern-zitat-rahmen figcaption')) h.befund(`k${nr}: ${fund}`);
    for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`k${nr}: ${fund}`);
    // breite Tabellen im Originaltext: scrollbarer Bereich per Tastatur erreichbar
    const ohneFokus = await seite.evaluate(() => [...document.querySelectorAll('.absatz-block')]
      .filter((el) => el.scrollWidth > el.clientWidth + 1 && el.getAttribute('tabindex') !== '0').length);
    if (ohneFokus > 0) h.befund(`k${nr}: ${ohneFokus} scrollbare Tabellen nicht per Tastatur erreichbar`);
    await h.axe(`k${nr}`);
    if (nr === 4 || nr === 8) await h.bild(`k${nr}`);
  }

  // Zitierfunktion (P10.1): Absatz-Permalink springt zum Absatz, „Zitieren“ zeigt die Angabe
  await seite.evaluate(() => { location.hash = '#theorie/k4/k4.2-p3'; });
  const absatz = seite.locator('.originaltext .absatz[data-absatz="k4.2-p3"]');
  await absatz.waitFor({ timeout: 3000 });
  await h.warte(200);
  const lage = await absatz.boundingBox();
  const hoehe = seite.viewportSize()?.height ?? 800;
  if (lage === null || lage.y < -1 || lage.y > hoehe) h.befund(`Absatz-Permalink: k4.2-p3 nicht im Bild (${JSON.stringify(lage)})`);
  if (await absatz.evaluate((el) => el.classList.contains('ist-ziel')) !== true) h.befund('Absatz-Permalink: Ziel nicht hervorgehoben');
  await absatz.locator('[data-pruef="zitieren"]').click();
  const angabe = await absatz.locator('[data-pruef="zitierangabe"]').textContent();
  if (!/^Bauherr Mentoren, Whitepaper V1\.2, Kap\. 4\.2, Abs\. 3\. Link: .*#theorie\/k4\/k4\.2-p3$/u.test(angabe ?? '')) h.befund(`Zitierangabe: „${angabe}“`);
  await h.axe('zitieren');
  await h.bild('zitieren');
  // Druck (P10.2): im Druck ist nur der Bogen sichtbar, die Seite selbst nicht; eine PDF entsteht
  await seite.evaluate(() => { window.print = () => {}; });
  await seite.locator('[data-pruef="kapitel-drucken"]').click();
  await seite.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  const druck = await seite.evaluate(() => ({
    bogen: getComputedStyle(document.querySelector('.druck-bogen') ?? document.body).display,
    seite: getComputedStyle(document.querySelector('#app > *, body > :not(.druck-bogen)') ?? document.body).display,
    titel: document.querySelector('.druck-bogen .druck-kopf h1')?.textContent ?? '',
    zitieren: [...document.querySelectorAll('.druck-bogen .absatz-zitieren')].filter((x) => getComputedStyle(x).display !== 'none').length,
  }));
  if (druck.bogen === 'none' || druck.seite !== 'none' || !/^Kapitel 4 · /u.test(druck.titel) || druck.zitieren > 0) h.befund(`Druckbogen: ${JSON.stringify(druck)}`);
  const pdf = await seite.pdf({ format: 'A4' });
  const seiten = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/gu) ?? []).length;
  if (seiten < 2 || seiten > 40) h.befund(`Druck Kapitel 4: ${seiten} Seiten`);
  await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
  if (await seite.locator('.druck-bogen').count() !== 0) h.befund('Druckbogen bleibt nach dem Druck stehen');
  // Impressum
  await seite.evaluate(() => { location.hash = '#theorie/impressum'; });
  await h.erwarte('[data-pruef="impressum"]');
  await h.warte(200);
  const imp = await seite.locator('[data-pruef="impressum"]').boundingBox();
  if (imp === null || imp.y > hoehe) h.befund('Impressum-Permalink: Abschnitt nicht im Bild');
  await h.axe('impressum');
}
