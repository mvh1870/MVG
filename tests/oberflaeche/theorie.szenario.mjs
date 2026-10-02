// Browser-Szenario Theorie (P16.3, O-38): Übersicht der Themen, ein Thema mit Grafiken, Glossar; nirgends Kapitel,
// Absatz-IDs, Originaltext oder Zitierangaben; am Ende leise der Kontakt über bauherr-mentoren.com.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';
import { pdfSeiten, seitenMitUeberschriftAmEnde } from './pdf.mjs';

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
  // R67: „Thema drucken“ im echten PDF – kein Kopf allein am Seitenende, keine leere Seite, kein weiches Trennzeichen im Text
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
    if (pdf.some((x) => x.zeilen.some((z) => z.includes('\u00ad')))) h.befund(`Druck ${t}: weiches Trennzeichen im PDF-Text`);
    await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  }
  // Glossar sucht
  await seite.goto(h.url.replace(/#.*$/u, '') + '#theorie/glossar');
  await (await h.erwarte('[data-pruef="glossar-suche"]')).fill('freigabe');
  await h.erwarte('[data-pruef="glossar-zahl"]:has-text("von")');
}
