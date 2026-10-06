// Browser-Szenario Theorie (P16.3, O-38): Übersicht der Themen, ein Thema mit Grafiken, Glossar; nirgends Kapitel,
// Absatz-IDs, Originaltext oder Zitierangaben; am Ende leise der Kontakt über bauherr-mentoren.com.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';
import { pdfSeiten, pdfWeicheTrenner, seitenMitUeberschriftAmEnde, wortbrueche } from './pdf.mjs';

export const name = 'theorie';
export const hash = '#theorie';

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const pruefe = pruefer(seite, h);
  // O-63: der Tab-Titel nennt den Bereich als „Themen“, nie den alten Namen
  { const t = await seite.title(); if (!t.includes('Themen') || /\b(?:Story|Theorie|Explore)\b/u.test(t)) h.befund(`Tab-Titel „${t}“ statt mit „Themen“ (O-63)`); }
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
  // r72: Teil III trägt mit „Anwendungssituationen“ (Frage zur FID) seit der Kopplungsfrage-Streichung eine Frage
  const mitFrage = await seite.locator('.buch-teil[data-teil="3"] .buch-zeile[href$="/anwendung"]').first().getAttribute('href') ?? '';
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
    // P18.5 (E-13): „Zum Ausprobieren“ nur bei den Themen, zu denen es ein Werkzeug gibt; der Verweis führt nach Explore
    const probieren = { entscheidungsvorlage: ['vorlagen-check'], vorgaenge: ['wegweiser', 'risiko-grenzen'], takt: ['monatsbericht'] }[t] ?? [];
    const links = await seite.locator('[data-pruef="thema-werkzeuge"] a').evaluateAll((l) => l.map((a) => a.getAttribute('href')));
    if (links.join(',') !== probieren.map((x) => `#explore/${x}`).join(',')) h.befund(`${t}: Verweise auf Werkzeuge ${links.join(',') || 'keine'}`);
    for (const f of sichtbarVerboten(await seite.locator('body').innerText())) h.befund(`${t}: ${f}`);
    await pruefe(t);
    // R75: unter 1100 px ist das Themenverzeichnis zugeklappt; geöffnet bleibt jeder Eintrag klickbar (vorher lief die Liste
    // aus ihrer Box und lag unter der Kopfgrafik – die letzten Einträge fingen keinen Klick mehr)
    const verzeichnis = seite.locator('details.kapitel-verzeichnis').first();
    if (await verzeichnis.count() > 0 && !(await verzeichnis.evaluate((e) => /** @type {HTMLDetailsElement} */ (e).open))) {
      await verzeichnis.locator('summary').click();
      const letzter = verzeichnis.locator('.kapitel-liste a').last();
      await letzter.scrollIntoViewIfNeeded();
      try { await letzter.click({ trial: true, timeout: 2000 }); } catch { h.befund(`${t}: letzter Eintrag des geöffneten Themenverzeichnisses nicht klickbar (${h.viewport.breite}×${h.viewport.hoehe})`); }
      const ueber = await verzeichnis.evaluate((e) => e.scrollHeight - e.clientHeight);
      if (ueber > 1) h.befund(`${t}: geöffnetes Themenverzeichnis läuft ${ueber} px aus seiner Box`);
      await verzeichnis.locator('summary').click();
    }
  }
  // R67: „Thema drucken“ im echten PDF – kein Kopf allein am Seitenende, keine leere Seite; R70: keine Trennstelle als Zeichen
  // sichtbar, kein Wortbruch ohne Trennstrich, erste Seite gefüllt
  const druckThemen = h.voll ? themen : themen.filter((t) => ['leistungen', 'takt', 'arbeitsweise', 'begriffe'].includes(t));
  // r72: weiche Trennstellen im Bogen nur in schmalen Spalten (wie TRENNSTELLEN_IM_DRUCK in src/ui/druck.ts); gezählt über alle
  // Themen, damit eine blinde PDF-Probe auffällt
  const schmal = 'th, td, .tafel, .lernkarte-titel, .lw-etappe-name';
  let trennerImDom = 0;
  let trennerImPdf = 0;
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
    const abschnittTitel = await seite.evaluate(() => [...document.querySelectorAll('.druck-bogen .abschnitt-titel')].map((x) => x.textContent ?? ''));
    // R68: genau ein sichtbarer Titel im Bogen
    const titel = await seite.evaluate(() => [...document.querySelectorAll('.druck-bogen h1')].filter((x) => getComputedStyle(x).display !== 'none').length);
    if (titel !== 1) h.befund(`Druck ${t}: ${titel} sichtbare h1 im Bogen`);
    // R75 (Vorsorge, L-231): das Kopfband des Themas steht nicht im Bogen
    const band = await seite.evaluate(() => [...document.querySelectorAll('.druck-bogen .kopf-band')].filter((x) => x.getClientRects().length > 0).length);
    if (band > 0) h.befund(`Druck ${t}: ${band} Kopfband sichtbar im Bogen`);
    // r72: Teil und Nummer als kleine Zeile im Druckkopf – das Blatt lässt sich im Buch einordnen
    const kicker = await seite.evaluate(() => { const k = document.querySelector('.druck-bogen .druck-kopf [data-pruef="druck-kicker"]'); return k !== null && getComputedStyle(k).display !== 'none' ? k.textContent : null; });
    if (!/^(?:Teil (?:I|II|III|IV)|Anhang) · \d+$/u.test(kicker ?? '')) h.befund(`Druck ${t}: Druckkopf ohne Teil und Nummer („${kicker}“)`);
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
    // r72: Fließtext ohne weiche Trennstellen; die Wörter mit Trennstelle in schmalen Spalten für den Abgleich mit dem PDF
    const trenner = await seite.evaluate((sel) => {
      /** @type {string[]} */
      const fliess = [];
      /** @type {string[]} */
      const erlaubt = [];
      const gang = document.createTreeWalker(document.querySelector('.druck-bogen') ?? document.body, NodeFilter.SHOW_TEXT);
      for (let n = gang.nextNode(); n !== null; n = gang.nextNode()) {
        const woerter = [...(n.textContent ?? '').matchAll(/[\p{L}\u00ad]*\u00ad[\p{L}\u00ad]*/gu)].map((m) => m[0]);
        if (woerter.length === 0) continue;
        if (n.parentElement?.closest(sel) === null) fliess.push(...woerter.map((w) => w.replace(/\u00ad/gu, '|')));
        else erlaubt.push(...woerter.map((w) => w.replace(/\u00ad/gu, '').toLowerCase()));
      }
      return { fliess, erlaubt };
    }, schmal);
    if (trenner.fliess.length > 0) h.befund(`Druck ${t}: ${trenner.fliess.length} weiche Trennstellen im Fließtext ${JSON.stringify(trenner.fliess.slice(0, 4))}`);
    trennerImDom += trenner.erlaubt.length;
    const roh = await seite.pdf({ format: 'A4' });
    const pdf = await pdfSeiten(roh);
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
    // R70/r72: sichtbar wird eine Trennstelle, wenn sie als Zeichenfolge im Text steht (doppelt maskiert: „&shy;“, „&#173;“,
    // „\u00ad“). U+00AD selbst sieht pdf.js nicht (getTextContent überspringt Zeichen der Klasse Cf) – die alte Annahme
    // „Chromium schreibt U+00AD nie in den PDF-Text“ war falsch: Skia schreibt jede Trennstelle mitten in der Zeile als
    // /ActualText <FEFF00AD>; Kopieren und Suchen liefern sie. Das prüft pdfWeicheTrenner auf den Inhaltsströmen (unten).
    const maskiert = pdf.flatMap((x, i) => x.zeilen.filter((z) => /&shy;|&#173;|&#x0*ad;|\\u00ad|\u00ad/iu.test(z)).map((z) => `S. ${i + 1}: ${z.slice(0, 60)}`));
    if (maskiert.length > 0) h.befund(`Druck ${t}: Trennstelle als Zeichen im PDF-Text ${JSON.stringify(maskiert.slice(0, 3))}`);
    // r72: U+00AD im PDF-Text nur in Wörtern aus schmalen Spalten (Tabellenzelle, Kartentafel, Kartentitel)
    const imPdf = await pdfWeicheTrenner(roh);
    trennerImPdf += imPdf.length;
    const fremd = imPdf.filter((x) => x.vor === '' || x.nach === '' || !trenner.erlaubt.some((w) => w.includes((x.vor + x.nach).toLowerCase())));
    if (fremd.length > 0) h.befund(`Druck ${t}: ${fremd.length} weiche Trennzeichen im PDF-Text außerhalb schmaler Spalten ${JSON.stringify(fremd.slice(0, 4).map((x) => `S. ${x.seite}: ${x.vor}|${x.nach}`))}`);
    // r72: keine fast leere Seite mitten im Bogen (Überblick S. 5 stand bei 12 %, weil der Abschnitt eine Flex-Spalte war) –
    // außer die Seite endet mit dem Kopf einer Abbildung, deren Bild den Rest füllt (die Messung sieht nur Text)
    const fastLeer = pdf.slice(0, -1).map((x, i) => ({ s: i + 1, f: x.fuellung ?? 1, bild: x.zeilen.slice(-2).some((z) => /^abbildung\d+$/u.test(flach(z))) }))
      .filter((x) => x.f < 0.25 && !x.bild);
    if (fastLeer.length > 0) h.befund(`Druck ${t}: fast leere Seite ${JSON.stringify(fastLeer.map((x) => `S. ${x.s}: ${Math.round(x.f * 100)} %`))}`);
    // R70: die erste Seite trägt Kopf, Einleitung, Kernaussage und die erste Abbildung – nicht halb leer (vorher 52–62 %)
    // P17.10: endet der Text der ersten Seite mit dem Kopf einer Abbildung, füllt deren Bild den Rest (die Messung sieht nur
    // Text; früher stand unter dem Bild noch die Bildunterschrift mit den Abweichungen, O-56)
    const bildAmEnde = (pdf[0]?.zeilen ?? []).slice(-2).some((z) => /^abbildung\d+$/u.test(flach(z)));
    // L-420: rückt die ganze Abbildung (ungeteilt, break-inside: avoid) auf die zweite Seite, weil sie unter dem Text nicht
    // mehr passt, steht ihre Kopfzeile ganz oben auf Seite 2 – dann ist die Lücke unten Folge der Abbildung, kein Layoutfehler
    const bildRuecktWeiter = (pdf[1]?.zeilen ?? []).slice(0, 2).some((z) => /^abbildung\d+$/u.test(flach(z))) && (pdf[0]?.fuellung ?? 1) >= 0.55;
    // L-429: ebenso, wenn Seite 2 mit einem Abschnittskopf beginnt – Kopf, Einleitung und das erste ungeteilte Stück des
    // Abschnitts (Lernkarte, Tafel) hängen per break-after: avoid zusammen; in breiteren Systemschriften (DejaVu Sans, seit
    // O-64 ohne eingebettete Textschrift) passt diese Kette nicht mehr unter die Kernaussage und rückt geschlossen weiter
    const abschnittFlach = abschnittTitel.map(flach);
    const abschnittRuecktWeiter = (pdf[1]?.zeilen ?? []).slice(0, 1).some((z) => abschnittFlach.includes(flach(z))) && (pdf[0]?.fuellung ?? 1) >= 0.4;
    if (pdf.length > 1 && !bildAmEnde && !bildRuecktWeiter && !abschnittRuecktWeiter && (pdf[0]?.fuellung ?? 1) < 0.7) h.befund(`Druck ${t}: erste Seite nur zu ${Math.round((pdf[0]?.fuellung ?? 0) * 100)} % gefüllt`);
    await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  }
  // r72: Trennstellen in schmalen Spalten stehen mitten in der Zeile auch im PDF-Text – sieht die Probe keine, ist sie blind
  if (trennerImDom > 0 && trennerImPdf === 0) h.befund(`Druck: ${trennerImDom} Trennstellen in schmalen Spalten, aber keine im PDF-Text gelesen (Probe blind?)`);
  // Glossar sucht
  await seite.goto(h.url.replace(/#.*$/u, '') + '#theorie/glossar');
  await (await h.erwarte('[data-pruef="glossar-suche"]')).fill('freigabe');
  await h.erwarte('[data-pruef="glossar-zahl"]:has-text("von")');
}
