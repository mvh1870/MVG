// Browser-Szenario Explore (P16.8, O-46): fünf Werkzeuge am Schulcampus – Rechner dreht die Rangfolge, Matrix ordnet
// ein, Vorgänge führen weiter, Takt, Glossar.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';

export const name = 'explore';
export const hash = '#explore';

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const pruefe = pruefer(seite, h);
  const verboten = async (wo) => { for (const f of sichtbarVerboten(await seite.locator('body').innerText())) h.befund(`${wo}: ${f}`); };
  await h.erwarte('[data-werkzeug="mcda"]');
  await seite.locator('select[aria-label="Gewicht Kosten"]').selectOption('5');
  await h.warte(100);
  if (!(await seite.locator('[data-pruef="ex-summe-B"]').evaluate((e) => e.classList.contains('ist-vorn')))) h.befund('Rechner: mit Kosten 5 liegt Abwarten nicht vorn');
  await verboten('mcda');
  await pruefe('mcda');
  await h.klick('[data-pruef="ex-matrix"]');
  await h.erwarte('[data-werkzeug="matrix"]');
  await h.klick('.ex-zelle[data-w="1"][data-a="5"]');
  await h.erwarte('[data-pruef="ex-matrix-detail"]:has-text("Vorrangig")');
  await pruefe('matrix');
  await h.klick('[data-pruef="ex-vorgaenge"]');
  await h.klick('[data-pruef="ex-art-problem"]');
  await h.klick('.ex-weg[data-ziel="aenderung"]');
  await h.erwarte('.ex-art[data-art="aenderung"][aria-pressed="true"]');
  await pruefe('vorgaenge');
  await h.klick('[data-pruef="ex-takt"]');
  await h.erwarte('[data-pruef="ex-takt-monat"]');
  await verboten('takt');
  await pruefe('takt');
  await h.klick('[data-pruef="ex-glossar"]');
  await h.erwarte('[data-pruef="glossar-suche"]');
  await pruefe('glossar');
}
