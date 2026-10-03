// Browser-Szenario Theorie (P16.3, O-38): Übersicht der Themen, ein Thema mit Grafiken, Glossar; nirgends Kapitel,
// Absatz-IDs, Originaltext oder Zitierangaben; am Ende leise der Kontakt über bauherr-mentoren.com.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';
import { pdfSeiten, seitenMitUeberschriftAmEnde, wortbrueche } from './pdf.mjs';

export const name = 'theorie';
export const hash = '#theorie';

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const pruefe = pruefer(seite, h);
  await h.erwarte('[data-pruef="themen-liste"]');
  // P17.8 (O-54): Buch mit vier Teilen und Anhang, Nummern 1 … in Leserichtung, Fortschritt 0
  await seite.evaluate(() => { try { localStorage.removeItem('gk.theorie'); } catch { /* ohne Speicher */ } });
  await seite.reload();
  await h.erwarte('[data-pruef="themen-liste"]');
  const teile = await seite.locator('.buch-teil').evaluateAll((els) => els.map((e) => e.getAttribute('data-teil')));
  if (teile.join(',') !== '1,2,3,4,anhang') h.befund(`uebersicht: Teile ${teile.join(',')}`);
  const nummern = await seite.locator('.buch-zeile .buch-nr').allTextContents();
  if (nummern.some((n, i) => n !== String(i + 1))) h.befund(`uebersicht: Nummern ${nummern.join(',')}`);
  if (await seite.locator('.buch-zeile [data-haken]:visible').count() !== 0) h.befund('uebersicht: Häkchen ohne Fortschritt');
  await pruefe('uebersicht');
  // Antwort auf jede Verständnisfrage eines Themas → Häkchen im Verzeichnis und in der Übersicht, Balken zählt 1
  const mitFrage = await seite.locator('.buch-teil[data-teil="2"] .buch-zeile').first().getAttribute('href') ?? '';
  await seite.goto(h.url.replace(/#.*$/u, '') + mitFrage);
  await h.erwarte('[data-pruef="lernseite"]');
  const thema = mitFrage.replace('#theorie/', '');
  for (const wc of await seite.locator('.wissenscheck').all()) await wc.locator('.wc-antwort').first().click();
  if (await seite.locator('.wissenscheck').count() === 0) h.befund(`${thema}: keine Verständnisfrage für die Fortschrittsprobe`);
  // das Verzeichnis ist unter 1100 px zugeklappt: gezählt wird das gesetzte Häkchen, nicht seine Sichtbarkeit
  if (await seite.locator(`.kapitel-verzeichnis [data-haken="${thema}"]`).evaluate((e) => e.hidden)) h.befund(`${thema}: kein Häkchen im Verzeichnis nach dem Beantworten`);
  await seite.goto(h.url.replace(/#.*$/u, '') + '#theorie');
  await h.erwarte('[data-pruef="themen-liste"]');
  if (!(await seite.locator(`.buch-zeile [data-haken="${thema}"]`).isVisible())) h.befund('uebersicht: kein Häkchen nach dem Beantworten');
  const zahl = await seite.locator('[data-balken="gesamt"] .fortschritt-zahl').textContent();
  if (!/^1 von \d+ geschafft$/u.test(zahl ?? '')) h.befund(`uebersicht: Fortschritt „${zahl}“`);
  await pruefe('uebersicht-fortschritt');
  await seite.locator('[data-pruef="fortschritt-zuruecksetzen"]').click();
  if (await seite.locator('.buch-zeile [data-haken]:visible').count() !== 0) h.befund('uebersicht: Häkchen nach dem Zurücksetzen');
  const themen = await seite.locator('[data-pruef^="thema-"]').evaluateAll((els) => els.map((e) => (e.getAttribute('href') ?? '').replace('#theorie/', '')));
  const auswahl = h.voll ? themen : themen.filter((t) => ['verantwortung', 'fuehrungsmodell', 'glossar', 'einfuehrung'].includes(t));
  for (const t of auswahl) {
    await seite.goto(h.url.replace(/#.*$/u, '') + `#theorie/${t}`);
    await h.erwarte(`[data-thema="${t}"]`);
    // P16.4 macht die Inhalte frei von Kapitel-Bezügen; die Bauart (Nummern, Originaltext, Zitieren) prüft schon jetzt
    for (const sel of ['.originaltext', '[data-pruef="zitieren"]', '.absatz-id', '.kapitel-nr', '.abschnitt-nr', '.tafel-quelle']) await h.erwarteNicht(sel);
    await h.erwarte('[data-pruef="lern-kontakt"] [data-pruef="bm-link"]');
    for (const f of sichtbarVerboten(await seite.locator('body').innerText())) h.befund(`${t}: ${f}`);
    await pruefe(t);
  }
  // R67: „Thema drucken“ im echten PDF – kein Kopf allein am Seitenende, keine leere Seite; R70: keine Trennstelle als Zeichen
  // sichtbar, kein Wortbruch ohne Trennstrich, erste Seite gefüllt
  const druckThemen = h.voll ? themen : themen.filter((t) => ['leistungen', 'takt', 'arbeitsweise', 'begriffe'].includes(t));
  for (const t of druckThemen) {
    await seite.goto(h.url.replace(/#.*$/u, '') + `#theorie/${t}`);
    await h.erwarte(`[data-thema="${t}"]`);
    await seite.evaluate(() => { window.print = () => {}; });
    await seite.locator('[data-pruef="thema-drucken"]').first().click();
    await seite.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
    // vor page.pdf lesen – page.pdf löst afterprint aus und räumt den Bogen ab
    const koepfe = await seite.evaluate(() => [...document.querySelectorAll('.druck-bogen :is(h1, h2, h3, h4, dt, .lw-titel, summary, .lw-etappe-titel, .querverweis-text), .druck-bogen .lw-aufgeloest-liste > li > b:first-child, .druck-bogen :is(.querverweis-block, .wissenscheck) > .t-label')]
      .map((x) => ({ text: x.textContent ?? '', pt: Math.max(...[x, ...x.querySelectorAll('*')].filter((e) => [...e.childNodes].some((k) => k.nodeType === 3 && (k.textContent ?? '').trim() !== ''))
        .map((e) => parseFloat(getComputedStyle(e).fontSize))) * 0.75 })));
    // R68: genau ein sichtbarer Titel im Bogen
    const titel = await seite.evaluate(() => [...document.querySelectorAll('.druck-bogen h1')].filter((x) => getComputedStyle(x).display !== 'none').length);
    if (titel !== 1) h.befund(`Druck ${t}: ${titel} sichtbare h1 im Bogen`);
    // R70: Wortbrüche ohne Trennstrich bei der Satzbreite des Drucks (A4, Ränder 14 mm: 688 px)
    await seite.evaluate(() => { const st = document.createElement('style'); st.id = 'pruef-satzbreite'; st.textContent = '.druck-bogen { width: 688px !important; }'; document.head.append(st); });
    const brueche = await wortbrueche(seite, '.druck-bogen');
    await seite.evaluate(() => document.getElementById('pruef-satzbreite')?.remove());
    if (brueche.length > 0) h.befund(`Druck ${t}: ${brueche.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(brueche.slice(0, 6))}`);
    // R70: weiche Trennstellen nur zwischen zwei Buchstaben – am Wortrand ergäbe ein Umbruch dort einen losen Strich
    const randTrenner = await seite.evaluate(() => {
      /** @type {string[]} */
      const aus = [];
      const gang = document.createTreeWalker(document.querySelector('.druck-bogen') ?? document.body, NodeFilter.SHOW_TEXT);
      for (let n = gang.nextNode(); n !== null; n = gang.nextNode()) {
        for (const m of (n.textContent ?? '').matchAll(/(?:^|[^\p{L}])\u00ad|\u00ad(?:[^\p{L}]|$)/gu)) aus.push((n.textContent ?? '').slice(Math.max(0, (m.index ?? 0) - 12), (m.index ?? 0) + 12).replace(/\u00ad/gu, '|'));
      }
      return aus;
    });
    if (randTrenner.length > 0) h.befund(`Druck ${t}: weiche Trennstelle am Wortrand ${JSON.stringify(randTrenner.slice(0, 4))}`);
    const pdf = await pdfSeiten(await seite.pdf({ format: 'A4' }));
    // R68: kein Kopf in den letzten drei Zeilen einer halbleeren Seite (außer der letzten)
    const flach = (/** @type {string} */ x) => x.replace(/[\s\u00ad\u2060-]+/gu, '').toLowerCase();
    const kopfFlach = koepfe.map((k) => flach(k.text)).filter((k) => k.length >= 6);
    const halb = pdf.slice(0, -1).map((x, i) => ({ s: i + 1, f: x.fuellung ?? 1, z: x.zeilen.slice(-3) }))
      .filter((x) => x.f < 0.6 && x.z.some((z) => kopfFlach.includes(flach(z))));
    if (halb.length > 0) h.befund(`Druck ${t}: Kopf am Ende einer halbleeren Seite ${JSON.stringify(halb.slice(0, 3))}`);
    if (koepfe.length < 3) h.befund(`Druck ${t}: nur ${koepfe.length} Köpfe gelesen`);
    const amEnde = seitenMitUeberschriftAmEnde(pdf, koepfe);
    if (amEnde.length > 0) h.befund(`Druck ${t}: Überschrift am Seitenende ${JSON.stringify(amEnde.slice(0, 4))}`);
    if (pdf.some((x) => x.zeilen.length === 0)) h.befund(`Druck ${t}: leere Seite`);
    // R70: Chromium schreibt U+00AD nie in den PDF-Text (die Probe darauf blieb immer grün) – sichtbar wird eine Trennstelle nur,
    // wenn sie als Zeichenfolge im Text steht (doppelt maskiert: „&shy;“, „&#173;“, „\u00ad“)
    const maskiert = pdf.flatMap((x, i) => x.zeilen.filter((z) => /&shy;|&#173;|&#x0*ad;|\\u00ad|\u00ad/iu.test(z)).map((z) => `S. ${i + 1}: ${z.slice(0, 60)}`));
    if (maskiert.length > 0) h.befund(`Druck ${t}: Trennstelle als Zeichen im PDF-Text ${JSON.stringify(maskiert.slice(0, 3))}`);
    // R70: die erste Seite trägt Kopf, Einleitung, Kernaussage und die erste Abbildung – nicht halb leer (vorher 52–62 %)
    // P17.10: endet der Text der ersten Seite mit dem Kopf einer Abbildung, füllt deren Bild den Rest (die Messung sieht nur
    // Text; früher stand unter dem Bild noch die Bildunterschrift mit den Abweichungen, O-56)
    const bildAmEnde = (pdf[0]?.zeilen ?? []).slice(-2).some((z) => /^abbildung\d+$/u.test(flach(z)));
    if (pdf.length > 1 && !bildAmEnde && (pdf[0]?.fuellung ?? 1) < 0.7) h.befund(`Druck ${t}: erste Seite nur zu ${Math.round((pdf[0]?.fuellung ?? 0) * 100)} % gefüllt`);
    await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  }
  // Glossar sucht
  await seite.goto(h.url.replace(/#.*$/u, '') + '#theorie/glossar');
  await (await h.erwarte('[data-pruef="glossar-suche"]')).fill('freigabe');
  await h.erwarte('[data-pruef="glossar-zahl"]:has-text("von")');
}
