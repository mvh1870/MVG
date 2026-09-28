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

  // Tafel rollen (P12.5 R8, L-75; R9 Befund 8): Leinwand bewusst niedrig, damit A2 sicher überlang ist;
  // mit ↓ bis ans Ende, mit ↑ zurück an den Anfang – die Vorschau rollt mit
  await leinwand.setViewportSize({ width: 1280, height: 520 });
  await regie.locator('[data-pruef="regie-sprung"]').selectOption('A2');
  await h.warte(500);
  const tafel = (/** @type {import('playwright').Page} */ fenster, /** @type {string} */ sel) => fenster.evaluate((s) => { const t = document.querySelector(s); return t === null ? null : { oben: t.scrollTop, hoch: t.scrollHeight, sicht: t.clientHeight }; }, sel);
  const vor = await tafel(leinwand, '.tafel-inhalt');
  if (vor === null || vor.hoch <= vor.sicht + 1) h.befund(`Tafel rollen: A2 bei 1280×520 nicht überlang (${JSON.stringify(vor)}) – Prüfung ohne Wirkung`);
  else {
    const schritte = Math.ceil(vor.hoch / (vor.sicht * 0.8)) + 1;
    await h.klick('[data-pruef="regie-tafel-runter"]', regie);
    for (let i = 1; i < schritte; i++) await regie.keyboard.press('ArrowDown');
    await h.warte(300);
    const unten = await tafel(leinwand, '.tafel-inhalt');
    if (unten === null || unten.oben + unten.sicht < unten.hoch - 1) h.befund(`Tafel ↓: Ende nicht erreicht (${JSON.stringify(unten)})`);
    const vorschau = await tafel(regie, '.vorschau-buehne .tafel-inhalt');
    if (vorschau === null || vorschau.oben <= 0) h.befund(`Tafel ↓: Vorschau rollt nicht mit (${JSON.stringify(vorschau)})`);
    for (let i = 0; i < schritte; i++) await regie.keyboard.press('ArrowUp');
    await h.warte(300);
    const oben = await tafel(leinwand, '.tafel-inhalt');
    if (oben === null || oben.oben > 0) h.befund(`Tafel ↑: nicht zurück am Anfang (${JSON.stringify(oben)})`);
  }
  await leinwand.setViewportSize({ width: 1280, height: 720 });
  const storyOrt = await regie.locator('[data-pruef="regie-ort"]').innerText();

  // Beamer-Schalter: Leinwand bekommt die Klasse, Vorschau auch
  await h.klick('[data-pruef="regie-beamer"]', regie);
  await leinwand.locator('.leinwand.ist-beamer').waitFor({ timeout: 3000 }).catch(() => h.befund('Beamer-Schalter erreicht die Leinwand nicht'));
  // B1: der Zoom darf die Leinwand nicht über die Fensterhöhe schieben (Fuß mit „Weiter“ bleibt sichtbar)
  for (const [breite, hoehe] of [[1280, 720], [1180, 820]]) {
    await leinwand.setViewportSize({ width: breite, height: hoehe });
    await h.warte(200);
    const m = await leinwand.evaluate(() => ({ doc: document.documentElement.scrollHeight, fenster: innerHeight }));
    if (m.doc > m.fenster + 1) h.befund(`Beamer bei ${breite}×${hoehe}: Leinwand ${m.doc} px hoch, Fenster ${m.fenster} px`);
  }
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

  // Lernseite rollen (P12.5 R9 Befund 1): ↓ rollt die Seite auf der Leinwand und in der Vorschau
  await regie.locator('body').focus().catch(() => {});
  await regie.keyboard.press('ArrowDown');
  await regie.keyboard.press('ArrowDown');
  await h.warte(300);
  const lwY = await leinwand.evaluate(() => scrollY);
  if (lwY <= 0) h.befund('Lernseite: ↓ in der Regie rollt die Leinwand nicht');
  const vsY = await regie.evaluate(() => document.querySelector('.vorschau-buehne .lernseite')?.scrollTop ?? 0);
  if (vsY <= 0) h.befund('Lernseite: die Vorschau rollt nicht mit');
  // Kapitel blättern (R9 Befund 2): Weiter → Kap. 6, Zurück → Kap. 5, die Story bleibt, wo sie war
  const naechst = await regie.locator('[data-pruef="regie-naechstes"]').innerText();
  if (!/Kapitel 6/u.test(naechst)) h.befund(`Theorie: „Als Nächstes“ nennt „${naechst}“ statt Kapitel 6`);
  await h.klick('[data-pruef="regie-weiter"]', regie);
  await h.erwarte('[data-kapitel="6"]', leinwand);
  await h.klick('[data-pruef="regie-zurueck"]', regie);
  await h.erwarte('[data-kapitel="5"]', leinwand);
  await h.klick('[data-pruef="regie-bereich-story"]', regie);
  await h.warte(300);
  const storyDanach = await regie.locator('[data-pruef="regie-ort"]').innerText();
  if (storyDanach !== storyOrt) h.befund(`Kapitel blättern hat die Story verändert: „${storyOrt}“ → „${storyDanach}“`);
  await h.klick('[data-pruef="regie-kapitel-5"]', regie);
  await h.erwarte('[data-kapitel="5"]', leinwand);

  // Ein-Fenster-Regie: Vorschau groß, Pfeiltaste blättert, Esc kehrt zurück
  await h.klick('[data-pruef="regie-ein-fenster"]', regie);
  if (await regie.locator('.regie.ist-ein-fenster').count() !== 1) h.befund('Ein-Fenster-Modus schaltet nicht ein');
  await h.bild('ein-fenster', regie);
  // B3: breites, niedriges Fenster – der Rahmen passt auch in der Höhe
  await regie.setViewportSize({ width: 1920, height: 1000 });
  await h.warte(300);
  const rahmen = await regie.locator('.vorschau-rahmen').boundingBox();
  const leiste = await regie.locator('.regie-eingriff-karte').boundingBox();
  if (rahmen === null || rahmen.y < 0 || rahmen.y + rahmen.height > 1000) h.befund(`Ein-Fenster 1920×1000: Rahmen ${JSON.stringify(rahmen)}`);
  else if (leiste !== null && leiste.y < rahmen.y + rahmen.height - 1) h.befund('Ein-Fenster: Eingriffsleiste verdeckt die Vorschau');
  await h.axe('regie-ein-fenster', regie);
  await regie.setViewportSize({ width: 1280, height: 800 });
  await regie.keyboard.press('Escape');
  if (await regie.locator('.regie.ist-ein-fenster').count() !== 0) h.befund('Esc beendet den Ein-Fenster-Modus nicht');
  if (await regie.evaluate(() => document.activeElement?.getAttribute('data-pruef')) !== 'regie-ein-fenster') h.befund('Nach Esc steht der Fokus nicht auf „Ein Fenster“');

  // Protokoll und Druckfassung
  await regie.locator('[data-pruef="regie-protokoll-feld"]').fill('Kunde fragt nach der Mandatsleiter.');
  await regie.getByRole('button', { name: 'Ins Protokoll' }).click();
  await regie.evaluate(() => { window.print = () => {}; });
  await h.klick('[data-pruef="regie-drucken"]', regie);
  const druck = await regie.locator('[data-pruef="regie-druck"]').textContent();
  if (!/Kunde fragt nach der Mandatsleiter/u.test(druck ?? '') || !/Besuchte Stationen/u.test(druck ?? '')) h.befund('Druckfassung ohne Protokoll oder Weg');
  // B7: die ausgeblendete Regie erzeugt keine leeren Folgeseiten – Seitenzahl passt zur Höhe des Druckteils
  await regie.emulateMedia({ media: 'print' });
  const druckHoehe = await regie.locator('[data-pruef="regie-druck"]').evaluate((el) => el.scrollHeight);
  await regie.emulateMedia({ media: 'screen' });
  const pdf = await regie.pdf({ format: 'A4' });
  const seiten = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/gu) ?? []).length;
  const hoechstens = Math.ceil(druckHoehe / 900) + 2;
  if (seiten < 1 || seiten > hoechstens) h.befund(`Druckfassung: ${seiten} Seiten bei ${druckHoehe} px Druckteil (höchstens ${hoechstens})`);
  await regie.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
  if ((await leinwand.locator('body').innerText()).includes('Kunde fragt nach der Mandatsleiter')) h.befund('Leinwand zeigt das Protokoll');
  await h.bild('regie', regie);
  // B2: Regie mit Beamer an neu laden – Leinwand und Knopf stimmen danach überein (aus)
  await h.klick('[data-pruef="regie-beamer"]', regie);
  await leinwand.locator('.leinwand.ist-beamer').waitFor({ timeout: 3000 }).catch(() => undefined);
  await regie.reload();
  await h.erwarte('[data-pruef="regie"]', regie);
  await h.warte(600);
  if (await leinwand.locator('.leinwand.ist-beamer').count() !== 0) h.befund('Nach Neuladen der Regie steht die Leinwand noch auf Beamer');
  await leinwand.close();
  await regie.close();
}
