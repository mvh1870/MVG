// Browser-Szenario Explore (P8): Werkzeuge in drei Größen – Layout, axe, Tastatur.
// P8.1 Szenario-Simulator: Regler per Tastatur, Deckung und Status umstellen; die Stufe der
// Mandatsleiter und die Bauherrenentscheidungen folgen den Regeln aus src/engine/simulator.ts.
import { pruefer } from './hilfen.mjs';

export const name = 'explore';
export const hash = '#explore';

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const pruefe = pruefer(seite, h);
  await h.erwarte('[data-pruef="explore"]');
  await h.klick('[data-pruef="werkzeug-oeffnen-simulator"]');
  const fokus = await seite.evaluate(() => document.activeElement?.id ?? '');
  if (fokus !== 'sim-titel') h.befund(`„Werkzeug öffnen“ setzt den Fokus auf ${fokus || 'nichts'} statt auf den Titel des Simulators`);

  const wer = () => seite.locator('[data-pruef="sim-wer"] .sim-wer-name').innerText();
  if ((await wer()) !== 'Änderungsgremium') h.befund(`Simulator Start (400 TEUR): ${await wer()}`);
  // Regler per Tastatur: Pos1 → 0 TEUR → Bauherren-PL; Ende → 10 Mio. € → Bauherr im Lenkungskreis
  await seite.locator('[data-pruef="sim-betragTeur"]').focus();
  await seite.keyboard.press('Home');
  if ((await wer()) !== 'Bauherren-PL') h.befund(`Simulator 0 TEUR: ${await wer()}`);
  await seite.keyboard.press('End');
  if ((await wer()) !== 'Bauherr im Lenkungskreis') h.befund(`Simulator 10 Mio. €: ${await wer()}`);
  await seite.keyboard.press('Home');
  // Risikoreserve: auch bei 0 TEUR beim Bauherrn (k3.2-t1)
  await h.klick('[data-pruef="sim-deckung-reserve"]');
  if ((await wer()) !== 'Bauherr') h.befund(`Simulator Reserve: ${await wer()}`);
  if (!/Risikoreserve/u.test(await seite.locator('[data-pruef="sim-bauherr"]').innerText())) h.befund('Simulator: „Bleibt beim Bauherrn“ ohne Risikoreserve');
  await seite.locator('[data-pruef="sim-status"]').selectOption('entscheidungsreif');
  if (!/hier Bauherr/u.test(await seite.locator('[data-pruef="sim-naechster"]').innerText())) h.befund('Simulator: nächster Schritt nennt die zuständige Stelle nicht');
  // Quelle aufklappen: Wortlaut aus dem Whitepaper
  await seite.locator('[data-pruef="sim-bauherr"] .sim-quelle summary').first().click();
  if ((await seite.locator('[data-pruef="sim-bauherr"] .sim-zitat').first().innerText()).trim() === '') h.befund('Simulator: Quelle ohne Wortlaut');
  await h.warte(200);
  await pruefe('simulator');

  // P8.2 Vorher/Nachher-Welten: ein Aspekt, dann alle nebeneinander
  await h.klick('[data-pruef="werkzeug-oeffnen-welten"]');
  if (await seite.locator('.welten-aspekt').count() !== 1) h.befund('Welten: zu Beginn nicht genau ein Aspekt');
  await h.klick('[data-pruef="welten-knopf-alle"]');
  if (await seite.locator('.welten-aspekt').count() !== 7) h.befund(`Welten: ${await seite.locator('.welten-aspekt').count()} Aspekte statt 7`);
  await h.warte(200);
  await pruefe('welten');

  // P8.3 Sandbox: Frühwarnung einwerfen und per Tastatur bis zur Maßnahme führen (Fokus bleibt am Eintrag)
  await h.klick('[data-pruef="werkzeug-oeffnen-sandbox"]');
  await h.klick('[data-pruef="einwurf-fruehwarnung"]');
  await h.klick('[data-pruef="schritt-FRW-001-bestaetigen"]');
  await h.klick('[data-pruef="schritt-RIS-001-entscheidungsbedarf"]');
  for (const s of ['bearbeiten', 'vorlegen']) {
    await seite.locator(`[data-pruef="schritt-ENT-001-${s}"]`).focus();
    await seite.keyboard.press('Enter');
  }
  const fokusNach = await seite.evaluate(() => document.activeElement?.getAttribute('data-pruef') ?? '');
  if (!fokusNach.startsWith('schritt-ENT-001-')) h.befund(`Sandbox: Fokus nach „Vorlage fertig“ auf ${fokusNach || 'nichts'}`);
  await h.klick('[data-pruef="schritt-ENT-001-entscheiden"]');
  if (await seite.locator('[data-pruef="eintrag-MAS-001"]').count() !== 1) h.befund('Sandbox: nach „entscheiden“ keine Maßnahme MAS-001');
  const summe = await seite.locator('[data-pruef="sandbox-bericht"]').innerText();
  if (!/Entscheidungsregister[\s\S]*1 Entschieden/u.test(summe)) h.befund(`Sandbox: Managementbericht ohne Entscheidung („${summe.slice(0, 80)}“)`);
  if (!/ENT-001: Entschieden/u.test(await seite.locator('[data-pruef="sandbox-meldung"]').innerText())) h.befund('Sandbox: Meldung für Screenreader fehlt');
  await h.warte(400);
  await pruefe('sandbox');
}
