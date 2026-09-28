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
  // Sprung in die Story von einer anderen Fläche (P11.3 R4/R5): jede Ortsmeldung zur Station trägt die Fläche
  // „story“, und keine Meldung wiederholt die vorige
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: '#story' }));
  for (let i = 0; i < 5 && await rahmen.locator('[data-pruef="rolle-pl"]').filter({ visible: true }).count() === 0; i++) {
    const weiter = rahmen.locator('[data-pruef="weiter"]');
    if (await weiter.count() > 0 && await weiter.isEnabled()) await weiter.click();
    await h.warte(300);
  }
  await rahmen.locator('[data-pruef="rolle-pl"]').click().catch(() => h.befund('Einbettung: Rolle PL nicht wählbar'));
  await h.warte(300);
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: '#theorie/k4' }));
  await h.warte(400);
  const ab = (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).length;
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: '#story/a3' }));
  await warteAuf((n) => n?.art === 'ort' && n.hash === '#story/A3' && n.flaeche === 'story', 'ort #story/A3');
  const orte = (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).slice(ab).filter((/** @type {any} */ n) => n?.art === 'ort');
  if (orte.some((/** @type {any} */ n) => String(n.hash).startsWith('#story') && n.flaeche !== 'story')) h.befund(`Einbettung: Ortsmeldung mit falscher Fläche ${JSON.stringify(orte)}`);
  if (orte.some((/** @type {any} */ n, /** @type {number} */ i) => i > 0 && JSON.stringify(n) === JSON.stringify(orte[i - 1]))) h.befund(`Einbettung: doppelte Ortsmeldung ${JSON.stringify(orte)}`);
  // Höhe (P12, Owner: Einbettung ohne Springen): der Rahmen folgt dem Inhalt, innen keine Scrollleiste;
  // die Story meldet „feste Höhe“ (null); kürzere Seiten lassen den Rahmen wieder schrumpfen
  const rahmenHoehe = async () => seite.evaluate(() => document.getElementById('mvg')?.getBoundingClientRect().height ?? 0);
  const innenScroll = async () => seite.frames()[1]?.evaluate(() => document.documentElement.scrollHeight - document.documentElement.clientHeight) ?? 0;
  const letzteHoehe = async () => (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).filter((/** @type {any} */ n) => n?.art === 'hoehe').at(-1)?.px;
  const geheUndWarte = async (/** @type {string} */ ziel) => {
    await seite.evaluate((z) => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: z }), ziel);
    await h.warte(900);
  };
  await geheUndWarte('#theorie/k4');
  const k4 = await letzteHoehe();
  if (typeof k4 !== 'number' || k4 < 1500) h.befund(`Einbettung: Lernseite meldet keine Inhaltshöhe (${k4})`);
  if (Math.abs((await rahmenHoehe()) - (k4 ?? 0)) > 3) h.befund(`Einbettung: Rahmen ${await rahmenHoehe()} px folgt der gemeldeten Höhe ${k4} nicht`);
  if ((await innenScroll()) > 2) h.befund(`Einbettung: Lernseite scrollt im Rahmen (${await innenScroll()} px)`);
  await geheUndWarte('#start');
  const start = await letzteHoehe();
  if (typeof start !== 'number' || start >= (k4 ?? 0)) h.befund(`Einbettung: Rahmen schrumpft nach der Lernseite nicht (Start ${start}, Kap. 4 ${k4})`);
  if ((await innenScroll()) > 2) h.befund(`Einbettung: Startseite scrollt im Rahmen (${await innenScroll()} px)`);
  // Startseite: gleiche Höhe, egal von wo man kommt (keine Rückkopplung über vh, P12.5 R3)
  const startHoehen = (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).filter((/** @type {any} */ n) => n?.art === 'hoehe' && typeof n.px === 'number').map((/** @type {any} */ n) => n.px);
  await geheUndWarte('#story');
  if ((await letzteHoehe()) !== null) h.befund(`Einbettung: Story meldet keine feste Höhe (${await letzteHoehe()})`);
  if ((await innenScroll()) > 2) h.befund(`Einbettung: Story scrollt im Rahmen (${await innenScroll()} px)`);
  await geheUndWarte('#start');
  if (Math.abs((await letzteHoehe()) - (start ?? 0)) > 3) h.befund(`Einbettung: Startseite ändert ihre Höhe je nach Herkunft (${start} → ${await letzteHoehe()})`);
  void startHoehen;
  // Absatz-Link: die Hostseite rollt zum Absatz (Meldung „ziel“)
  await geheUndWarte('#theorie/k4/k4.2-p3');
  // Lage des Absatzes im Fenster der Hostseite: Rahmenoberkante (Host) + Lage im Rahmen (Rahmen)
  const innenY = await seite.frames()[1]?.evaluate(() => document.querySelector('[data-absatz="k4.2-p3"]')?.getBoundingClientRect().top ?? null);
  const rahmenY = await seite.evaluate(() => document.getElementById('mvg')?.getBoundingClientRect().top ?? 0);
  const lage = innenY === null || innenY === undefined ? null : rahmenY + innenY;
  if (lage === null || lage < -20 || lage > 400) h.befund(`Einbettung: Absatz k4.2-p3 nicht im Bild (Lage ${lage})`);
  await geheUndWarte('#story');
  const grund = await seite.frames()[1]?.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--grund').trim());
  if (grund !== '#ffffff') h.befund(`Einbettung: Hintergrund der Hostseite nicht übernommen (${grund})`);
  await h.axe('einbettung-hoehe');
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
