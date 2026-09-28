// Browser-Szenario Einbettung (P10.6, E12): eine Hostseite bettet die Anwendung im iframe ein.
// Die Anwendung meldet „bereit“ und ihren Ort, folgt „gehe“, verweigert Regie/Leinwand und bleibt
// im Rahmen bedienbar (axe im Rahmen).
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const name = 'einbettung';
export const hash = '#start';
export const viewports = [{ breite: 1100, hoehe: 760 }];

const HOST = pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), 'einbettung-host.html')).href;

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  await seite.goto(HOST);
  const rahmen = seite.frameLocator('#mvg');
  await rahmen.locator('[data-pruef="start"], .startseite').first().waitFor({ timeout: 5000 });
  const warteAuf = async (/** @type {(n: any) => boolean} */ pruefe, /** @type {string} */ was) => {
    for (let i = 0; i < 40; i++) {
      const liste = await seite.evaluate(() => /** @type {any} */ (window).nachrichten);
      if (liste.some(pruefe)) return true;
      await h.warte(100);
    }
    h.befund(`Einbettung: keine Nachricht „${was}“`);
    return false;
  };
  await warteAuf((n) => n?.mvg === 'einbettung' && n.art === 'bereit' && typeof n.version === 'string', 'bereit');
  await warteAuf((n) => n?.art === 'ort' && n.hash === '#start', 'ort #start');
  const klasse = await seite.frames()[1]?.evaluate(() => document.body.classList.contains('ist-eingebettet'));
  if (klasse !== true) h.befund('Einbettung: body ohne Klasse ist-eingebettet');
  // gehe: Theorie Kapitel 4
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: '#theorie/k4' }));
  await rahmen.locator('[data-kapitel="4"] [data-pruef="lernseite"]').waitFor({ timeout: 5000 }).catch(() => h.befund('Einbettung: „gehe #theorie/k4“ nicht gefolgt'));
  await warteAuf((n) => n?.art === 'ort' && n.hash === '#theorie/k4' && n.flaeche === 'theorie', 'ort #theorie/k4');
  // Regie ist von außen nicht erreichbar
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: '#regie' }));
  await h.warte(400);
  if (await rahmen.locator('[data-pruef="regie"]').count() !== 0) h.befund('Einbettung: Host kann die Regie öffnen');
  // frage → ort
  const vorher = (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).length;
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'frage' }));
  await h.warte(300);
  const danach = await seite.evaluate(() => /** @type {any} */ (window).nachrichten);
  if (!danach.slice(vorher).some((/** @type {any} */ n) => n?.art === 'ort' && n.hash === '#theorie/k4')) h.befund('Einbettung: „frage“ bleibt ohne Antwort');
  await h.bild('einbettung');
  // Auch über die Adresse des Rahmens gibt es keine Regie und keine Leinwand
  for (const ziel of ['#regie', '#leinwand']) {
    await seite.evaluate((z) => { /** @type {HTMLIFrameElement} */ (document.getElementById('mvg')).src = `../../dist/mvg.html${z}`; }, ziel);
    await h.warte(800);
    const im = await rahmen.locator('[data-pruef="regie"], [data-pruef="leinwand"]').count();
    const start = await rahmen.locator('.startseite').count();
    if (im !== 0 || start !== 1) h.befund(`Einbettung: Rahmen mit ${ziel} zeigt Regie/Leinwand (${im}) statt Startseite (${start})`);
  }
}
