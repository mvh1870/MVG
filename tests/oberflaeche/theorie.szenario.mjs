// Browser-Szenario Theorie (P16.3, O-38): Übersicht der Themen, ein Thema mit Grafiken, Glossar; nirgends Kapitel,
// Absatz-IDs, Originaltext oder Zitierangaben; am Ende leise der Kontakt über bauherr-mentoren.com.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';

export const name = 'theorie';
export const hash = '#theorie';

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const pruefe = pruefer(seite, h);
  await h.erwarte('[data-pruef="themen-liste"]');
  await pruefe('uebersicht');
  const themen = await seite.locator('[data-pruef^="thema-"]').evaluateAll((els) => els.map((e) => (e.getAttribute('href') ?? '').replace('#theorie/', '')));
  const auswahl = h.voll ? themen : themen.filter((t) => ['verantwortung', 'fuehrungsmodell', 'glossar'].includes(t));
  for (const t of auswahl) {
    await seite.goto(h.url.replace(/#.*$/u, '') + `#theorie/${t}`);
    await h.erwarte(`[data-thema="${t}"]`);
    // P16.4 macht die Inhalte frei von Kapitel-Bezügen; die Bauart (Nummern, Originaltext, Zitieren) prüft schon jetzt
    for (const sel of ['.originaltext', '[data-pruef="zitieren"]', '.absatz-id', '.kapitel-nr', '.abschnitt-nr', '.tafel-quelle']) await h.erwarteNicht(sel);
    await h.erwarte('[data-pruef="lern-kontakt"] [data-pruef="bm-link"]');
    if (process.env['MVG_THEMEN_WORTE'] === '1') for (const f of sichtbarVerboten(await seite.locator('body').innerText())) h.befund(`${t}: ${f}`);
    await pruefe(t);
  }
  // Glossar sucht
  await seite.goto(h.url.replace(/#.*$/u, '') + '#theorie/glossar');
  await (await h.erwarte('[data-pruef="glossar-suche"]')).fill('freigabe');
  await h.erwarte('[data-pruef="glossar-zahl"]:has-text("von")');
}
