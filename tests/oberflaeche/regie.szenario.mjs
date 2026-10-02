// Browser-Szenario Regie und Leinwand (O-9, P16.9): die Regie steuert, die Leinwand zeigt denselben Stand – ohne
// Regie-Notiz. Nur in der breiten Ansicht (die Regie ist ein Pult am Laptop).
import { pruefeLayout } from './hilfen.mjs';

export const name = 'regie';
export const hash = '#regie';
export const viewports = [{ breite: 1280, hoehe: 720 }];

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  await h.erwarte('[data-pruef="regie"]');
  const leinwand = await h.zweitesFenster('#leinwand');
  await h.erwarte('[data-pruef="leinwand-warten"], .anzeige', leinwand);
  await h.klick('[data-pruef="regie-bereich-story"]');
  await seite.locator('[data-pruef="regie-sprung"]').selectOption('s8');
  await h.erwarte('[data-pruef="regie-notiz"] .regie-notiz-text');
  await h.klick('[data-pruef="regie-weiter"]');
  await h.klick('[data-pruef="regie-wahl-B"]');
  await h.warte(400);
  await h.erwarte('.anzeige [data-pruef="gs-titel"]:has-text("Lüftungsgerät")', leinwand);
  const gewaehlt = await leinwand.locator('.anzeige [data-option="B"][aria-pressed="true"]').count();
  if (gewaehlt !== 1) h.befund('Leinwand zeigt die Kundenwahl B nicht');
  const notiz = (await seite.locator('[data-pruef="regie-notiz"] .regie-notiz-text').innerText()).slice(0, 40);
  if ((await leinwand.locator('body').innerText()).includes(notiz)) h.befund('Regie-Notiz auf der Leinwand');
  await h.erwarte('[data-pruef="leinwand-status"][data-status="ok"]');
  // Theorie und Explore auf der Leinwand
  await seite.locator('[data-pruef="regie-thema"]').selectOption('verantwortung');
  await h.erwarte('.anzeige [data-thema="verantwortung"]', leinwand);
  await seite.locator('[data-pruef="regie-werkzeug"]').selectOption('matrix');
  await h.erwarte('.anzeige [data-werkzeug="matrix"]', leinwand);
  for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`regie: ${fund}`);
  await h.axe('regie');
  await h.axe('leinwand', leinwand);
  await h.bild('regie');
  await h.bild('leinwand', leinwand);
}
