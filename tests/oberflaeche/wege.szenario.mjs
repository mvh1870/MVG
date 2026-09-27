// Browser-Szenario Wege (P2.4): Permalinks (#theorie/k1/1.2, #story/A3), Explore-Fläche aus der
// Theorie heraus, Querverweis Theorie → Station, Barrierefreiheit (axe) auf Explore.
// Ein Viewport genügt: die Flächen selbst prüfen die anderen Szenarien in drei Größen.

export const name = 'wege';
export const hash = '#theorie/k1/1.2';
export const viewports = [{ breite: 1280, hoehe: 720 }];

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  // Abschnitts-Permalink: Fokus liegt auf Abschnitt 1.2
  await h.erwarte('[data-pruef="theorie"]');
  await h.warte(300);
  const fokus = await seite.evaluate(() => document.activeElement?.getAttribute('data-abschnitt') ?? null);
  if (fokus !== 'k1.2') h.befund(`#theorie/k1/1.2: Fokus auf ${fokus ?? 'nichts'} statt Abschnitt k1.2`);

  // Querverweis führt auf den Permalink der Station
  const ziel = await seite.locator('[data-pruef="querverweis-A3"]').first().getAttribute('href');
  if (ziel !== '#story/A3') h.befund(`Querverweis A3 zeigt auf ${ziel}`);

  // Explore aus der Theorie heraus
  await h.klick('[data-pruef="zu-explore"]');
  await h.erwarte('[data-pruef="explore"]');
  await h.erwarte('[data-pruef="werkzeug-simulator"]');
  const titel = await seite.title();
  if (!titel.startsWith('Explore')) h.befund(`Dokumenttitel Explore: „${titel}“`);
  await h.warte(600);
  await h.bild('explore');
  await h.axe('explore');

  // Startseite bietet Explore nicht an (O-21)
  await h.klick('[data-pruef="zur-start"]');
  await h.erwarte('[data-pruef="weg-story"]');
  await h.erwarteNicht('a[href="#explore"]');

  // Stations-Permalink ohne gewählte Rolle: die Story beginnt beim Prolog
  await seite.evaluate(() => { location.hash = '#story/A3'; });
  await h.erwarte('[data-pruef="leitstand"]');
  await h.erwarte('[data-pruef^="rolle-"], [data-pruef="weiter"]');

  await jedeRolle(seite, h);

  // Adresszeile zeigt den Stations-Permalink (L-25); Welt B bleibt vor der Freischaltung gesperrt
  const hashJetzt = () => seite.evaluate(() => location.hash);
  if ((await hashJetzt()) !== '#story/A3') h.befund(`Adresszeile in A3: ${await hashJetzt()}`);
  await seite.evaluate(() => { location.hash = '#story/B3'; });
  await h.warte(400);
  if ((await hashJetzt()) !== '#story/A3') h.befund(`#story/B3 vor der Freischaltung: Adresse ${await hashJetzt()} statt #story/A3`);
  await h.erwarte('[data-pruef="konsequenz"]');

  // Weiterlesen (E9) nach Neuladen: dieselbe Station, derselbe Schritt
  await seite.reload({ waitUntil: 'load' });
  await h.erwarte('[data-pruef="konsequenz"]');
  if ((await hashJetzt()) !== '#story/A3') h.befund(`nach dem Neuladen: ${await hashJetzt()}`);

  // Permalink mit gewählter Rolle springt zur Station: über die Startseite zurück zur Story, dann #story/A3
  await seite.evaluate(() => { location.hash = '#theorie'; });
  await h.erwarte('[data-pruef="kapitel-liste"]');
  await seite.evaluate(() => { location.hash = '#story/A3'; });
  await h.erwarte('[data-pruef="leitstand"]');
  if ((await hashJetzt()) !== '#story/A3') h.befund(`Permalink #story/A3 mit Rolle: ${await hashJetzt()}`);
}

/** Jede der sechs Rollen ist startbar (P2.5): Prolog → Rolle → Express → A3 → Wahl A → Konsequenz. */
export async function jedeRolle(seite, h) {
  for (const rolle of ['gf', 'bauherr', 'pl', 'ps', 'planung', 'controlling']) {
    if (rolle === 'gf') {
      await seite.evaluate(() => { location.hash = '#start'; });
      await h.klick('[data-pruef="weg-story"]');
    } else {
      // Neu beginnen über die Seitenleiste (setzt Rolle und Verlauf zurück)
      await h.klick('[data-pruef="seitenleiste-raum"]');
      await h.klick('[data-pruef="neustart"]');
      await h.taste('Escape');
    }
    await h.erwarte('[data-pruef="weiter"]');
    if (await seite.locator(`[data-pruef="rolle-${rolle}"]`).filter({ visible: true }).count() === 0) await h.klick('[data-pruef="weiter"]');
    await h.klick(`[data-pruef="rolle-${rolle}"]`);
    await h.erwarte('[data-pruef^="interesse-"]');
    // Express-Pfad (E8, L-26): der Prolog führt direkt nach A3 (ohne Express nach A1)
    if ((await seite.locator('[data-pruef="interesse-express"]').getAttribute('aria-pressed')) !== 'true') await h.klick('[data-pruef="interesse-express"]');
    await h.klick('[data-pruef="weiter"]');
    await h.warte(200);
    const hier = (await seite.evaluate(() => location.hash)).replace(/^#story\//u, '');
    if (hier !== 'A3') h.befund(`Rolle ${rolle}: Express führt nach ${hier} statt A3`);
    for (let i = 0; i < 6; i++) {
      if (await seite.locator('[data-pruef="option-A"]').filter({ visible: true }).count() > 0) break;
      await h.klick('[data-pruef="weiter"]');
      await h.warte(150);
    }
    await h.klick('[data-pruef="option-A"]');
    await h.erwarte('[data-pruef="konsequenz"]');
    const titel = await seite.locator('.wahl b').first().innerText();
    if (titel.trim() === '') h.befund(`Rolle ${rolle}: Konsequenz ohne Titel der Wahl`);
  }
}
