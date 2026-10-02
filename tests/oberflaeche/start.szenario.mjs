// Browser-Szenario Startseite (O-21, O-42, O-44, P16.11): drei Wege, „Wer steht dahinter“ mit dem leisen Link zu
// bauherr-mentoren.com, Impressum und Datenschutz im Fuß, Wortlaut „Internetseite“. Ausgeführt von werkzeuge/oberflaeche.mjs.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';

export const name = 'start';

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const titel = await seite.title();
  if (!titel.includes('Governance Kompass')) h.befund(`Dokumenttitel ohne „Governance Kompass“: „${titel}“`);
  for (const weg of ['weg-story', 'weg-theorie', 'weg-explore']) await h.erwarte(`[data-pruef="${weg}"]`);
  const wege = await seite.locator('[data-pruef^="weg-"]').filter({ visible: true }).count();
  if (wege !== 3) h.befund(`erwartet drei sichtbare Wege, gefunden ${wege}`);
  const text = await seite.locator('body').innerText();
  if (!text.includes('Minimum Viable Governance')) h.befund('Startseite nennt „Minimum Viable Governance“ nicht ausgeschrieben');
  if (!/Internetseite/u.test(text)) h.befund('Startseite sagt nicht, dass der Governance Kompass eine Internetseite ist (O-42)');
  for (const f of sichtbarVerboten(text)) h.befund(`Startseite: ${f}`);
  // O-44: Logo im Kopf, „Wer steht dahinter“ und Fuß führen leise zu bauherr-mentoren.com
  for (const sel of ['[data-pruef="kopf-bm"]', '[data-pruef="start-dahinter"] [data-pruef="bm-link"]', '[data-pruef="fuss"] [data-pruef="bm-link"]']) {
    const href = await (await h.erwarte(sel)).getAttribute('href');
    if (href !== 'https://www.bauherr-mentoren.com/') h.befund(`${sel}: Ziel ${href}`);
  }
  for (const [sel, ziel] of [['impressum', 'impressum.html'], ['datenschutz', 'datenschutz.html']]) {
    const href = await (await h.erwarte(`[data-pruef="fuss"] [data-pruef="${sel}"]`)).getAttribute('href');
    if (href !== ziel) h.befund(`Fuß: ${sel} führt nach ${href}`);
  }
  await h.erwarte('[data-pruef="praesentieren"]');

  // Alle drei Wege per Tastatur erreichbar
  const erreicht = new Set();
  for (let i = 0; i < 20 && erreicht.size < 3; i += 1) {
    await h.taste('Tab');
    const weg = await seite.evaluate(() => document.activeElement?.closest('[data-pruef^="weg-"]')?.getAttribute('data-pruef') ?? null);
    if (weg) erreicht.add(weg);
  }
  for (const weg of ['weg-story', 'weg-theorie', 'weg-explore']) if (!erreicht.has(weg)) h.befund(`${weg} ist per Tab nicht erreichbar`);

  await h.warte(1000);
  await pruefer(seite, h)('start');
  // der Weg in die Story führt dorthin
  await h.klick('[data-pruef="weg-story"]');
  await h.erwarte('[data-pruef="gs-titel"]');
}
