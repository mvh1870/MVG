// Browser-Szenario Startseite (O-21 „ruhiger Einstieg“, L-4). Ausgeführt von werkzeuge/oberflaeche.mjs.
// Test-Haken-Vertrag der UI: [data-pruef="weg-story"], [data-pruef="weg-theorie"]; der Leitstand
// ([data-pruef="status"]) ist auf der Startseite nicht sichtbar.

export const name = 'start';

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const titel = await seite.title();
  if (!titel.includes('Governance Kompass')) h.befund(`Dokumenttitel ohne „Governance Kompass“ (O-33): „${titel}“`);

  await h.erwarte('[data-pruef="weg-story"]');
  await h.erwarte('[data-pruef="weg-theorie"]');
  const text = await seite.locator('body').innerText();
  if (!text.includes('Minimum Viable Governance')) h.befund('Startseite nennt „Minimum Viable Governance“ nicht ausgeschrieben');

  // Die ganze Startseite samt Fuß im ersten Bild (P12.5 R6, L-71), nicht in der schmalen Ansicht
  const groesse = seite.viewportSize();
  if (groesse !== null && groesse.width >= 1024) {
    const m = await seite.evaluate(() => ({ doc: document.documentElement.scrollHeight, fenster: innerHeight }));
    if (m.doc > m.fenster + 1) h.befund(`Startseite ${m.doc} px hoch bei ${m.fenster} px Fenster – der Fuß liegt unter der Falz`);
  }

  // Genau zwei Wege, sonst nichts vom Leitstand.
  const wege = await seite.locator('[data-pruef^="weg-"]').filter({ visible: true }).count();
  if (wege !== 2) h.befund(`erwartet genau zwei sichtbare Wege, gefunden ${wege}`);
  await h.erwarteNicht('[data-pruef="status"]');

  // Beide Wege per Tastatur erreichbar (Tab-Reihenfolge, höchstens 15 Schritte).
  const erreicht = new Set();
  for (let i = 0; i < 15 && erreicht.size < 2; i += 1) {
    await h.taste('Tab');
    const weg = await seite.evaluate(() => document.activeElement?.closest('[data-pruef^="weg-"]')?.getAttribute('data-pruef') ?? null);
    if (weg) erreicht.add(weg);
  }
  for (const weg of ['weg-story', 'weg-theorie']) {
    if (!erreicht.has(weg)) h.befund(`${weg} ist per Tab nicht erreichbar`);
  }

  await h.warte(1200); // Einblendung abwarten, damit das Bild den Ruhezustand zeigt
  await h.bild('start');
  await h.axe('start');
}
