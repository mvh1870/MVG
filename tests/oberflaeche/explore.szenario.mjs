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
  // R47: Strg+P auf Explore druckt die Druckwege, nicht die Bildschirmseite mit Knöpfen und Reglern
  await seite.evaluate(() => { window.dispatchEvent(new Event('beforeprint')); });
  const ersatz = await seite.evaluate(() => ({ klasse: document.body.classList.contains('druckt-bogen'), text: document.querySelector('.druck-bogen')?.textContent ?? '' }));
  await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
  if (!ersatz.klasse || !/Dossier drucken/u.test(ersatz.text) || !/fachlich ungeprüft/u.test(ersatz.text)) h.befund(`Strg+P auf Explore: ${JSON.stringify({ klasse: ersatz.klasse, text: ersatz.text.slice(0, 80) })}`);
  if (await seite.locator('.druck-bogen').count() !== 0) h.befund('Strg+P auf Explore: Bogen bleibt stehen');
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
  // Risikoreserve (R40): die Sachentscheidung bleibt auf ihrer Stufe, die Freigabe des Reserve-Einsatzes beim Bauherrn (k3.2-t1)
  await h.klick('[data-pruef="sim-deckung-reserve"]');
  if ((await wer()) !== 'Bauherren-PL') h.befund(`Simulator Reserve: ${await wer()}`);
  if (!/Risikoreserve/u.test(await seite.locator('[data-pruef="sim-bauherr"]').innerText())) h.befund('Simulator: „Bleibt beim Bauherrn“ ohne Risikoreserve');
  await seite.locator('[data-pruef="sim-status"]').selectOption('entscheidungsreif');
  if (!/hier Bauherren-PL; die Freigabe des Einsatzes der Risikoreserve erteilt der Bauherr/u.test(await seite.locator('[data-pruef="sim-naechster"]').innerText())) h.befund('Simulator: nächster Schritt nennt die zuständige Stelle oder den Vorbehalt des Bauherrn nicht');
  // Quelle aufklappen: Wortlaut aus dem Whitepaper
  await seite.locator('[data-pruef="sim-bauherr"] .sim-quelle summary').first().click();
  if ((await seite.locator('[data-pruef="sim-bauherr"] .sim-zitat').first().innerText()).trim() === '') h.befund('Simulator: Quelle ohne Wortlaut');
  await h.warte(200);
  // R37 (Zusage L-111 (4)): oberhalb von 400 px rollt die Quelle k3.2-t1 nicht waagerecht
  const fensterBreite = seite.viewportSize()?.width ?? 1280;
  if (fensterBreite > 400) {
    const zitat = await seite.locator('[data-pruef="sim-bauherr"] .sim-zitat').first().evaluate((el) => [el.scrollWidth, el.clientWidth]);
    if (zitat[0] > zitat[1] + 1) h.befund(`Simulator: Quelle k3.2-t1 rollt bei ${fensterBreite} px (${zitat[0]}/${zitat[1]})`);
  }
  // R32: die Stufen der Mandatsleiter passen in ihre Pille, auch ohne Trennwörterbuch des Browsers
  const ueberlauf = await seite.evaluate(() => [...document.querySelectorAll('.sim-stufe')].filter((s) => s.scrollWidth > s.clientWidth + 1).map((s) => s.textContent));
  if (ueberlauf.length > 0) h.befund(`Mandatsleiter: Stufe läuft aus ihrer Pille (${ueberlauf.join(', ')})`);
  // R33: im Hochkontrast trägt die aktuelle Stufe einen Rahmen in Systemfarbe (Flächen entfallen dort)
  await seite.emulateMedia({ forcedColors: 'active' });
  const stufeHk = await seite.evaluate(() => [...document.querySelectorAll('.sim-stufe[aria-current="true"]')].map((s) => { const c = getComputedStyle(s); return c.outlineStyle === 'solid' && parseFloat(c.outlineWidth) >= 2; }));
  await seite.emulateMedia({ forcedColors: 'none' });
  if (stufeHk.length !== 1 || !stufeHk[0]) h.befund(`Hochkontrast: aktuelle Stufe der Mandatsleiter ohne Rahmen (${JSON.stringify(stufeHk)})`);
  await pruefe('simulator');

  // P8.2 Vorher/Nachher-Welten: ein Aspekt, dann alle nebeneinander
  await h.klick('[data-pruef="werkzeug-oeffnen-welten"]');
  if (await seite.locator('.welten-aspekt').count() !== 1) h.befund('Welten: zu Beginn nicht genau ein Aspekt');
  await h.klick('[data-pruef="welten-knopf-alle"]');
  if (await seite.locator('.welten-aspekt').count() !== 7) h.befund(`Welten: ${await seite.locator('.welten-aspekt').count()} Aspekte statt 7`);
  await h.warte(200);
  await pruefe('welten');

  // P8.4 Zeitmaschine: Regler per Tastatur, Ablesung folgt
  await h.klick('[data-pruef="werkzeug-oeffnen-zeitmaschine"]');
  await seite.locator('[data-pruef="zm-regler"]').focus();
  await seite.keyboard.press('End');
  if (!/Monat 11/u.test(await seite.locator('[data-pruef="zm-ablesen"]').innerText())) h.befund('Zeitmaschine: Ablesung folgt dem Regler nicht');
  await h.warte(200);
  await pruefe('zeitmaschine');

  // P8.5 Galerie: jede Tafel wählbar; Abbildungsverzeichnis; Story-Karte mit Sprung
  await h.klick('[data-pruef="werkzeug-oeffnen-galerie"]');
  const tafeln = seite.locator('[data-pruef^="galerie-k"]');
  const n = await tafeln.count();
  if (n < 20) h.befund(`Galerie: nur ${n} Tafeln`);
  for (let i = 0; i < n; i++) {
    await tafeln.nth(i).click();
    if (await seite.locator('[data-pruef="galerie-buehne"] .tafel').count() !== 1) h.befund(`Galerie: Tafel ${i + 1} zeichnet nicht`);
  }
  await h.warte(300);
  await pruefe('galerie');
  // R20: genau eine main-Landmarke
  if (await seite.locator('main').count() !== 1) h.befund(`Explore: ${await seite.locator('main').count()} main-Landmarken statt 1`);
  // R23: freistehende Querverweise (Pillen) erreichen die Zielgröße 36 px
  const pillen = await seite.evaluate(() => [...document.querySelectorAll('a.querverweis')].map((a) => Math.round(a.getBoundingClientRect().height)).filter((x) => x > 0));
  if (pillen.some((x) => x < 36)) h.befund(`Explore: Querverweise kleiner als 36 px (${pillen.join(', ')})`);
  if (await seite.locator('[data-pruef="abbildungsverzeichnis"] tbody tr').count() < 1) h.befund('Galerie: Abbildungsverzeichnis leer');
  // Abbildungen (P14): Vorschaubild geladen und schmückend, Titel springt zur Abbildung; Zellen nicht buchstabenweise gebrochen (R11)
  const vz = await seite.evaluate(() => [...document.querySelectorAll('[data-pruef^="galerie-abbildung-"]')].map((a) => ({
    href: a.getAttribute('href') ?? '', ok: (a.querySelector('img')?.naturalWidth ?? 0) > 0, alt: a.querySelector('img')?.getAttribute('alt'),
    id: (a.getAttribute('data-pruef') ?? '').replace('galerie-abbildung-', '') })));
  if (vz.length < 13) h.befund(`Galerie: ${vz.length} Abbildungen mit Bild statt 13`);
  for (const v of vz) {
    if (!/^#theorie\/k\d{1,2}\/abb-\d+$/u.test(v.href) || !v.href.endsWith(v.id)) h.befund(`Galerie: ${v.id} verlinkt „${v.href}“`);
    if (!v.ok || v.alt !== '') h.befund(`Galerie: ${v.id} Vorschaubild nicht geladen oder nicht schmückend`);
  }
  const eng = await seite.evaluate(() => [...document.querySelectorAll('[data-pruef="abbildungsverzeichnis"] th, [data-pruef="abbildungsverzeichnis"] td')]
    .filter((z) => !z.classList.contains('galerie-nr') && z.getBoundingClientRect().width < 44).length);
  if (eng > 0) h.befund(`Galerie: ${eng} Zellen des Abbildungsverzeichnisses schmaler als 44 px`);
  // R12/R13: kein Wort des Verzeichnisses (alle Spalten) läuft über zwei Zeilen – erlaubt ist nur der Umbruch
  // nach „-“, „/“ oder einer weichen Trennstelle; geprüft in der Laufgröße und zusätzlich bei 360 und 320 px (L-83, R18)
  const wortbrueche = () => seite.evaluate(() => {
    const funde = [];
    for (const z of document.querySelectorAll('[data-pruef="abbildungsverzeichnis"] th, [data-pruef="abbildungsverzeichnis"] td')) {
      const lauf = document.createTreeWalker(z, NodeFilter.SHOW_TEXT);
      for (let t = lauf.nextNode(); t !== null; t = lauf.nextNode()) {
        for (const m of (t.textContent ?? '').matchAll(/[^\s/\u00AD-]+[/\u00AD-]?/gu)) {
          const r = document.createRange();
          r.setStart(t, m.index); r.setEnd(t, m.index + m[0].length);
          // nach einer weichen Trennstelle rechnet Chromium den gezeichneten Trennstrich (≈ 6 px) dem Folgewort zu
          const nachTrennstelle = m.index > 0 && (t.textContent ?? '')[m.index - 1] === '\u00AD';
          const rechtecke = [...r.getClientRects()].filter((q) => q.width > 0 && !(nachTrennstelle && q.width < 9));
          if (new Set(rechtecke.map((q) => Math.round(q.top))).size > 1) funde.push(m[0]);
        }
      }
    }
    return funde;
  });
  const fenster = seite.viewportSize();
  for (const breite of [null, 360, 320]) {
    if (breite !== null && fenster !== null) { await seite.setViewportSize({ width: breite, height: fenster.height }); await h.warte(200); }
    const gebrochen = await wortbrueche();
    if (gebrochen.length > 0) h.befund(`Galerie${breite !== null ? ` bei ${breite} px` : ''}: ${gebrochen.length} Wörter im Abbildungsverzeichnis mitten im Wort gebrochen (${gebrochen.slice(0, 3).join(', ')})`);
    // L-98: ohne Bruch im Wort darf das Verzeichnis trotzdem nicht über die Seite hinauslaufen
    const ueber = await seite.evaluate(() => { const v = document.querySelector('[data-pruef="abbildungsverzeichnis"]'); return v === null ? 0 : Math.max(v.scrollWidth - v.clientWidth, Math.round(v.getBoundingClientRect().right - document.documentElement.clientWidth)); });
    if (ueber > 1) h.befund(`Galerie${breite !== null ? ` bei ${breite} px` : ''}: Abbildungsverzeichnis läuft ${ueber} px über`);
  }
  if (fenster !== null) { await seite.setViewportSize(fenster); await h.warte(200); }
  await h.klick('[data-pruef="werkzeug-oeffnen-figuren"]');
  if (await seite.locator('[data-pruef="sprung-A3"]').count() !== 1) h.befund('Story-Karte: kein Sprung nach A3');

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
  // S1: nach einem Schritt ohne Folgeschritt bleibt der Fokus im Werkzeug (neuer Eintrag MAS-001 oder ENT-001)
  const fokusEnde = await seite.evaluate(() => document.activeElement?.getAttribute('data-pruef') ?? document.activeElement?.tagName ?? '');
  if (!/eintrag-(MAS|ENT)-001/u.test(fokusEnde)) h.befund(`Sandbox: Fokus nach „entscheiden“ auf ${fokusEnde}`);
  if (await seite.locator('[data-pruef="eintrag-MAS-001"]').count() !== 1) h.befund('Sandbox: nach „entscheiden“ keine Maßnahme MAS-001');
  const summe = await seite.locator('[data-pruef="sandbox-bericht"]').innerText();
  if (!/Entscheidungsregister[\s\S]*1 Entschieden/u.test(summe)) h.befund(`Sandbox: Managementbericht ohne Entscheidung („${summe.slice(0, 80)}“)`);
  if (!/ENT-001: Entschieden/u.test(await seite.locator('[data-pruef="sandbox-meldung"]').innerText())) h.befund('Sandbox: Meldung für Screenreader fehlt');
  await h.warte(400);
  await pruefe('sandbox');
}
