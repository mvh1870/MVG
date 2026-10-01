// Browser-Szenario Regie (P9.5): zwei Fenster – Regie und Leinwand. Springen, Rolle umschalten,
// Beamer-Schalter (E10), Regie-Notiz und Einwand-Spickzettel zu einem Theorie-Kapitel (nie auf der
// Leinwand), Ein-Fenster-Regie mit Esc, Druckfassung des Protokolls. Ein Viewport genügt: die Flächen
// selbst prüfen die anderen Szenarien in drei Größen.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BAUTEILE_UNGETEILT, pruefeLayout } from './hilfen.mjs';
import { pdfSeiten, seitenMitUeberschriftAmEnde, wortbrueche } from './pdf.mjs';

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
  // R27: die Warteansicht (Leinwand ohne Regie) ist die main der Leinwand und trägt eine h1
  const wartend = await h.zweitesFenster('#leinwand');
  await h.erwarte('[data-pruef="leinwand-warten"]', wartend);
  const warteLandmarken = await wartend.evaluate(() => {
    const w = document.querySelector('[data-pruef="leinwand-warten"]');
    const huelle = document.querySelector('[data-pruef="leinwand"]');
    return `${w?.tagName}:${w?.querySelectorAll('h1').length}:${document.querySelectorAll('main').length}:${huelle?.tagName}${huelle?.hasAttribute('aria-label') ? '+name' : ''}`;
  });
  if (warteLandmarken !== 'MAIN:1:1:DIV') h.befund(`Leinwand wartet ohne main/h1 (${warteLandmarken})`);
  await wartend.close();
  const regie = await h.zweitesFenster('#regie');
  await h.erwarte('[data-pruef="regie"]', regie);
  // R21: die Regie hat genau eine main-Landmarke; die Vorschau (aria-hidden) zeigt die Leinwand, deren Story-Tafel eine eigene main trägt
  const mains = await regie.evaluate(() => [...document.querySelectorAll('main')].filter((m) => m.closest('[aria-hidden="true"]') === null).length);
  if (mains !== 1) h.befund(`Regie: ${mains} sichtbare main-Landmarken statt 1`);
  // R34: die Regie-Auswahl bricht auch schmal nicht aus (L-106 (4)); Regie auf dem Telefon bei 360 px
  const regieGroesse = regie.viewportSize();
  await regie.setViewportSize({ width: 360, height: 740 }); await h.warte(150);
  for (const fund of await regie.evaluate(pruefeLayout)) h.befund(`Regie @360: ${fund}`);
  const regieSw = await regie.evaluate(() => document.documentElement.scrollWidth);
  if (regieSw > 361) h.befund(`Regie: rollt bei 360 px waagerecht (${regieSw} px)`);
  if (regieGroesse !== null) { await regie.setViewportSize(regieGroesse); await h.warte(100); }
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
  // R48: für den Beamer an eine Station mit Instrumenten und Statuswörtern („sehr hoch“): A6, drei Schritte weiter
  await regie.locator('[data-pruef="regie-sprung"]').selectOption('A6');
  await h.warte(300);
  for (let i = 0; i < 3; i++) { await h.klick('[data-pruef="regie-weiter"]', regie); await h.warte(200); }
  const storyOrt = await regie.locator('[data-pruef="regie-ort"]').innerText();

  // Beamer-Schalter: Leinwand bekommt die Klasse, Vorschau auch
  await h.klick('[data-pruef="regie-beamer"]', regie);
  await leinwand.locator('.leinwand.ist-beamer').waitFor({ timeout: 3000 }).catch(() => h.befund('Beamer-Schalter erreicht die Leinwand nicht'));
  // B1: der Zoom darf die Leinwand nicht über die Fensterhöhe schieben (Fuß mit „Weiter“ bleibt sichtbar)
  for (const [breite, hoehe] of [[1280, 720], [1180, 820], [1024, 768]]) {
    await leinwand.setViewportSize({ width: breite, height: hoehe });
    await h.warte(200);
    const m = await leinwand.evaluate(() => ({ doc: document.documentElement.scrollHeight, fenster: innerHeight }));
    if (m.doc > m.fenster + 1) h.befund(`Beamer bei ${breite}×${hoehe}: Leinwand ${m.doc} px hoch, Fenster ${m.fenster} px`);
    // R48: im Beamer-Zoom (XGA-Projektor 1024×768) weder abgeschnittene Werte („SEHR HOC“) noch gebrochene Beschriftungen
    for (const fund of await leinwand.evaluate(pruefeLayout)) h.befund(`Beamer bei ${breite}×${hoehe}: ${fund}`);
    const bruchB = await wortbrueche(leinwand, BAUTEILE_UNGETEILT, { bildschirm: true });
    if (bruchB.length > 0) h.befund(`Beamer bei ${breite}×${hoehe}: ${bruchB.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruchB.slice(0, 6))}`);
  }
  if (await leinwand.locator('.instrument-label').count() === 0) h.befund('Beamer: keine Instrumente auf der Leinwand gemessen');
  // R49 (Architektur, L-149): die Vorschau zeigt den Umbruch der Leinwand ab 1280 px – ihr Zoom hängt nicht an der Breite
  // des Regie-Fensters (Regie auf dem Notebook mit 1024 px, Beamer an)
  await leinwand.setViewportSize({ width: 1280, height: 720 });
  await h.warte(200);
  const zoomLeinwand = await leinwand.evaluate(() => getComputedStyle(document.querySelector('.leinwand.ist-beamer .anzeige') ?? document.body).zoom);
  const regieFenster = regie.viewportSize();
  for (const breite of [1024, 1280]) {
    await regie.setViewportSize({ width: breite, height: 768 });
    await h.warte(200);
    const zoomVorschau = await regie.evaluate(() => getComputedStyle(document.querySelector('.vorschau-buehne.ist-beamer .anzeige') ?? document.body).zoom);
    if (zoomVorschau !== zoomLeinwand || zoomLeinwand === '1') h.befund(`Beamer: Vorschau-Zoom ${zoomVorschau} bei Regie ${breite} px, Leinwand ${zoomLeinwand}`);
  }
  if (regieFenster !== null) await regie.setViewportSize(regieFenster);
  await h.klick('[data-pruef="regie-beamer"]', regie);
  await h.warte(300);
  if (await leinwand.locator('.leinwand.ist-beamer').count() !== 0) h.befund('Beamer-Schalter lässt sich nicht ausschalten');

  // Theorie-Kapitel: Regie-Notiz und Einwände nur in der Regie
  await h.klick('[data-pruef="regie-kapitel-5"]', regie);
  await h.erwarte('[data-kapitel="5"]', leinwand);
  // R22: Leinwand und Regie-Vorschau betten die Lernseite als article ein – nie als zweite main
  if (await leinwand.locator('main').count() !== 0 || await leinwand.locator('article.lern-inhalt').count() !== 1) h.befund('Leinwand: Lernseite nicht als article eingebettet');
  const vorschauMains = await regie.evaluate(() => [...document.querySelectorAll('.regie-vorschau main')].length);
  if (vorschauMains !== 0) h.befund(`Regie-Vorschau: ${vorschauMains} main in der eingebetteten Lernseite`);
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
  // R61: die Lernseite auf schmaler Leinwand – die Blätterkarten sind dort span[rel] (keine Links) und stehen untereinander
  await leinwand.setViewportSize({ width: 400, height: 720 }); await h.warte(200);
  for (const fund of await leinwand.evaluate(pruefeLayout)) h.befund(`Leinwand Kap. 5 @400: ${fund}`);
  const navBruch = await wortbrueche(leinwand, '.kapitel-nav', { bildschirm: true });
  if (navBruch.length > 0) h.befund(`Leinwand Kap. 5 @400: Blätterkarten brechen Wörter ${JSON.stringify(navBruch.slice(0, 4))}`);
  await leinwand.setViewportSize({ width: 1280, height: 720 }); await h.warte(200);

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
  // R47: das Protokoll ist ein Druckbogen – nichts ragt über den Satzspiegel, kein Wort bricht ohne Trennstrich, keine Überschrift am Seitenende
  await regie.emulateMedia({ media: 'print' });
  const vorherR = regie.viewportSize() ?? { width: 1280, height: 800 };
  await regie.setViewportSize({ width: 794, height: vorherR.height });
  await regie.evaluate(() => { document.documentElement.style.width = '688px'; });
  const ueberR = await regie.evaluate(() => {
    const bogen = document.querySelector('.druck-bogen');
    const rechts = bogen?.getBoundingClientRect().right ?? 0;
    return { bogen: bogen !== null, ueber: [...(bogen?.querySelectorAll('*') ?? [])].filter((el) => el.getBoundingClientRect().right > rechts + 0.5).length };
  });
  if (!ueberR.bogen || ueberR.ueber > 0) h.befund(`Druckfassung: Bogen ${ueberR.bogen ? 'da' : 'fehlt'}, ${ueberR.ueber} Elemente über dem Satzspiegel`);
  const bruchR = await wortbrueche(regie, '.druck-bogen');
  if (bruchR.length > 0) h.befund(`Druckfassung: ${bruchR.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruchR.slice(0, 6))}`);
  const koepfeR = await regie.evaluate(() => [...document.querySelectorAll('.druck-bogen :is(h1, h2, h3, h4, .original-abschnitt, summary, .lw-titel)')].map((x) => ({ text: x.textContent ?? '', pt: parseFloat(getComputedStyle(x).fontSize) * 0.75 })));
  await regie.evaluate(() => { document.documentElement.style.width = ''; });
  await regie.setViewportSize(vorherR);
  const pdf = await regie.pdf({ format: 'A4' });
  await regie.emulateMedia({ media: 'screen' });
  const seitenR = await pdfSeiten(pdf);
  const amEndeR = seitenMitUeberschriftAmEnde(seitenR, koepfeR);
  // B7: die ausgeblendete Regie erzeugt keine leeren Seiten (gemessen im PDF statt über die Höhe)
  const leerR = seitenR.map((x, i) => (x.zeilen.length === 0 ? i + 1 : 0)).filter((x) => x > 0);
  if (seitenR.length < 1 || leerR.length > 0) h.befund(`Druckfassung: ${seitenR.length} Seiten, leer: ${JSON.stringify(leerR)}`);
  if (amEndeR.length > 0) h.befund(`Druckfassung: Überschrift am Seitenende ${JSON.stringify(amEndeR)}`);
  await regie.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
  if ((await leinwand.locator('body').innerText()).includes('Kunde fragt nach der Mandatsleiter')) h.befund('Leinwand zeigt das Protokoll');
  // R48: Strg+P ohne Knopf (page.pdf meldet beforeprint) druckt das Protokoll mit Kopf, nicht die Bedienoberfläche
  await regie.emulateMedia({ media: 'print' });
  const strgPR = await pdfSeiten(await regie.pdf({ format: 'A4' }));
  await regie.emulateMedia({ media: 'screen' });
  const textStrgP = strgPR.map((x) => x.zeilen.join(' ')).join(' ');
  if (!textStrgP.includes('Gesprächsprotokoll') || !textStrgP.includes('Kunde fragt nach der Mandatsleiter') || /Ins Protokoll|Protokoll drucken|Notiz zum Gespräch/u.test(textStrgP)) {
    h.befund(`Regie: Strg+P druckt nicht das Protokoll (${strgPR.length} Seiten, Anfang „${textStrgP.slice(0, 80)}“)`);
  }
  if (await regie.locator('.druck-bogen').count() !== 0) h.befund('Regie: Strg+P-Bogen bleibt stehen');
  // R55: Strg+P auf der Leinwand druckt einen Bogen, nicht die Bildschirmseite (kein „ZURÜCK/WEITER“, keine Knöpfe)
  await leinwand.emulateMedia({ media: 'print' });
  const strgPL = await pdfSeiten(await leinwand.pdf({ format: 'A4' }));
  await leinwand.emulateMedia({ media: 'screen' });
  const textL = strgPL.map((x) => x.zeilen.join(' ')).join(' ');
  if (/ZURÜCK|WEITER/u.test(textL) || !textL.includes('Governance Kompass')) h.befund(`Leinwand: Strg+P druckt die Bildschirmseite (${strgPL.length} Seiten, Anfang „${textL.slice(0, 80)}“)`);
  await leinwand.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
  if (await leinwand.locator('.druck-bogen').count() !== 0) h.befund('Leinwand: Strg+P-Bogen bleibt stehen');
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
