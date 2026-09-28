// Browser-Szenario Regie (P9.5): zwei Fenster – Regie und Leinwand. Springen, Rolle umschalten,
// Beamer-Schalter (E10), Regie-Notiz und Einwand-Spickzettel zu einem Theorie-Kapitel (nie auf der
// Leinwand), Ein-Fenster-Regie mit Esc, Druckfassung des Protokolls. Ein Viewport genügt: die Flächen
// selbst prüfen die anderen Szenarien in drei Größen.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'regie';
export const hash = '#start';
export const viewports = [{ breite: 1280, hoehe: 800 }];

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const klartext = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/**
 * @param {import('playwright').Page} _seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(_seite, h) {
  const inhalte = JSON.parse(readFileSync(path.join(WURZEL, 'src', 'generiert', 'inhalte.json'), 'utf8'));
  const regie = await h.zweitesFenster('#regie');
  await h.erwarte('[data-pruef="regie"]', regie);
  const [leinwand] = await Promise.all([regie.waitForEvent('popup', { timeout: 5000 }), h.klick('[data-pruef="leinwand-oeffnen"]', regie)]);
  await leinwand.waitForLoadState('load');
  await h.erwarte('[data-pruef="leinwand"]', leinwand);
  await regie.locator('[data-pruef="leinwand-status"][data-status="ok"]').waitFor({ timeout: 5000 });

  // Rolle wählen über die Kundenwahl, dann Springen nach A3 und Rolle umschalten
  await h.klick('[data-pruef="regie-bereich-story"]', regie);
  await h.klick('[data-pruef="regie-weiter"]', regie);
  await h.klick('[data-pruef="regie-rolle-pl"]', regie);
  await regie.locator('[data-pruef="regie-sprung"]').selectOption('A3');
  await h.erwarte('[data-pruef="leitstand"]', leinwand);
  await h.warte(400);
  const ort = await leinwand.evaluate(() => location.hash);
  const kicker = await regie.locator('[data-pruef="regie-ort"]').innerText();
  if (!/Kosten \+8\s%/u.test(kicker)) h.befund(`Springen nach A3: Regie-Ort „${kicker}“ (Leinwand ${ort})`);
  if (await regie.locator('[data-pruef="regie-sprung"] option[value="B3"]').isDisabled() !== true) h.befund('Springen: Welt B vor der Freischaltung wählbar');
  await regie.locator('[data-pruef="regie-rollenwahl"]').selectOption('bauherr');
  await h.warte(300);
  const rolleLeinwand = await leinwand.locator('.karte-meta').innerText().catch(() => '');
  if (!/Bauherr/u.test(rolleLeinwand)) h.befund(`Rolle umschalten: Leinwand zeigt „${rolleLeinwand}“`);

  // Beamer-Schalter: Leinwand bekommt die Klasse, Vorschau auch
  await h.klick('[data-pruef="regie-beamer"]', regie);
  await leinwand.locator('.leinwand.ist-beamer').waitFor({ timeout: 3000 }).catch(() => h.befund('Beamer-Schalter erreicht die Leinwand nicht'));
  await h.klick('[data-pruef="regie-beamer"]', regie);
  await h.warte(300);
  if (await leinwand.locator('.leinwand.ist-beamer').count() !== 0) h.befund('Beamer-Schalter lässt sich nicht ausschalten');

  // Theorie-Kapitel: Regie-Notiz und Einwände nur in der Regie
  await h.klick('[data-pruef="regie-kapitel-5"]', regie);
  await h.erwarte('[data-kapitel="5"]', leinwand);
  const e = inhalte.regie['theorie/k5'];
  if (e === undefined) h.befund('Regie-Material zu Kap. 5 fehlt');
  else {
    const notiz = await regie.locator('[data-pruef="regie-notiz"]').innerText();
    if (!notiz.includes(klartext(e.notiz).slice(0, 30))) h.befund('Regie-Notiz zu Kap. 5 fehlt in der Regie');
    const leinwandText = await leinwand.locator('body').innerText();
    if (leinwandText.includes(klartext(e.notiz).slice(0, 30))) h.befund('Leinwand zeigt die Regie-Notiz zu Kap. 5');
    for (const f of e.leitfragen) if (leinwandText.includes(f)) h.befund('Leinwand zeigt eine Leitfrage zu Kap. 5');
  }
  if (await regie.locator('[data-pruef="regie-einwaende"] details').count() < 1) h.befund('Kap. 5: kein Einwand-Spickzettel');
  await h.axe('regie-theorie', regie);

  // Ein-Fenster-Regie: Vorschau groß, Pfeiltaste blättert, Esc kehrt zurück
  await h.klick('[data-pruef="regie-ein-fenster"]', regie);
  if (await regie.locator('.regie.ist-ein-fenster').count() !== 1) h.befund('Ein-Fenster-Modus schaltet nicht ein');
  await h.bild('ein-fenster', regie);
  await regie.keyboard.press('Escape');
  if (await regie.locator('.regie.ist-ein-fenster').count() !== 0) h.befund('Esc beendet den Ein-Fenster-Modus nicht');

  // Protokoll und Druckfassung
  await regie.locator('[data-pruef="regie-protokoll-feld"]').fill('Kunde fragt nach der Mandatsleiter.');
  await regie.getByRole('button', { name: 'Ins Protokoll' }).click();
  await regie.evaluate(() => { window.print = () => {}; });
  await h.klick('[data-pruef="regie-drucken"]', regie);
  const druck = await regie.locator('[data-pruef="regie-druck"]').textContent();
  if (!/Kunde fragt nach der Mandatsleiter/u.test(druck ?? '') || !/Besuchte Stationen/u.test(druck ?? '')) h.befund('Druckfassung ohne Protokoll oder Weg');
  if ((await leinwand.locator('body').innerText()).includes('Kunde fragt nach der Mandatsleiter')) h.befund('Leinwand zeigt das Protokoll');
  await h.bild('regie', regie);
  await leinwand.close();
  await regie.close();
}
