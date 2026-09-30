// Browser-Szenario Theorie (P6.15): jede Lernseite Kap. 1–13 mit allen aufgeklappten Ebenen und Tafeln –
// Layout (kein Seitwärtsscrollen), axe, Kontrast der Zitate (axe greift wegen ::before nicht) und
// Tastatur-Erreichbarkeit breiter Tabellen. Läuft mit reduzierter Bewegung (prefers-reduced-motion):
// die Tafeln erscheinen sofort, und die Seite beendet ihre Animationen (STIL, P2-Befund V6).
// Schnell: alle Seiten bei 1280 und 400; voll zusätzlich 1024.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kaestenUeberRand, kontrastQuellen, mittelbreit, pruefeLayout, rollbarOhneTastatur } from './hilfen.mjs';
import { pdfSeiten, seitenMitUeberschriftAmEnde, wortbrueche } from './pdf.mjs';

export const name = 'theorie';
export const hash = '#theorie';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const breite = seite.viewportSize()?.width ?? 1280;
  if (!h.voll && breite > 400 && breite < 1280) return;
  const inhalte = JSON.parse(readFileSync(path.join(WURZEL, 'src', 'generiert', 'inhalte.json'), 'utf8'));
  const kapitel = Object.values(inhalte.theorie).map((t) => t.kapitel).sort((a, b) => a - b);
  if (kapitel.length !== 13) h.befund(`${kapitel.length} Lernseiten statt 13`);

  await seite.emulateMedia({ reducedMotion: 'reduce' });
  await h.erwarte('[data-pruef="kapitel-liste"]');
  for (const nr of kapitel) {
    await seite.evaluate((n) => { location.hash = `#theorie/k${n}`; }, nr);
    await h.erwarte(`[data-kapitel="${nr}"] [data-pruef="lernseite"]`);
    // alle Ebenen und aufklappbaren Tafeln öffnen
    await seite.evaluate(() => { for (const d of document.querySelectorAll('.lernseite details')) d.setAttribute('open', ''); });
    await h.warte(100);
    // reduzierte Bewegung: keine Animation und kein Übergang dauert länger als 1 ms (basis.css)
    const lang = await seite.evaluate(() => document.getAnimations()
      .filter((a) => Number(a.effect?.getComputedTiming().duration ?? 0) > 1)
      .map((a) => `${/** @type {any} */ (a).animationName ?? /** @type {any} */ (a).transitionProperty ?? ''}@${/** @type {any} */ (a.effect)?.target?.className ?? ''}`));
    if (lang.length > 0) h.befund(`k${nr}: ${lang.length} Animationen trotz reduzierter Bewegung länger als 1 ms (${lang.slice(0, 3).join(', ')})`);
    for (const fund of await seite.evaluate(kontrastQuellen, '.lern-zitat p, .lern-zitat-rahmen figcaption')) h.befund(`k${nr}: ${fund}`);
    for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`k${nr}: ${fund}`);
    // R48: Lernkarten und Tafel-Karten auch zwischen den Prüfgrößen (Titel liefen bei 488–568 px aus der Karte)
    await mittelbreit(seite, h, `k${nr}`);
    // R28: im schmalen Lauf auch bei 320 px (WCAG 1.4.10, 400 % Zoom) kein waagerechtes Rollen der Seite
    const vp = seite.viewportSize();
    if (vp !== null && vp.width <= 400) {
      await seite.setViewportSize({ width: 320, height: vp.height }); await h.warte(150);
      const sw = await seite.evaluate(() => document.documentElement.scrollWidth);
      if (sw > 321) h.befund(`k${nr}: rollt bei 320 px waagerecht (${sw} px)`);
      // R49: Kästen bleiben in ihrer Spalte – erst unbeantwortet, dann mit beantworteten Wissenschecks (Ergebnis mit Zitat)
      for (const fund of await seite.evaluate(kaestenUeberRand, '.lern-inhalt')) h.befund(`k${nr} @320: ${fund}`);
      await seite.evaluate(() => { for (const wc of document.querySelectorAll('.wissenscheck')) wc.querySelector('.wc-antwort')?.click(); });
      await h.warte(150);
      for (const fund of await seite.evaluate(kaestenUeberRand, '.lern-inhalt')) h.befund(`k${nr} @320 beantwortet: ${fund}`);
      for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`k${nr} @320: ${fund}`);
      for (const fund of await seite.evaluate(rollbarOhneTastatur)) h.befund(`k${nr} @320: ${fund}`);
      // R47: kein Wort bricht mitten im Wort ohne Trennstrich (Titel, Körbe, Tabellenköpfe, Originaltext) – außer in Text mit hyphens:auto
      const bruch320 = await wortbrueche(seite, '.lernseite', { bildschirm: true });
      if (bruch320.length > 0) h.befund(`k${nr} @320: ${bruch320.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruch320.slice(0, 6))}`);
      await seite.setViewportSize(vp); await h.warte(100);
      const bruch = await wortbrueche(seite, '.lernseite', { bildschirm: true });
      if (bruch.length > 0) h.befund(`k${nr} @${vp.width}: ${bruch.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 6))}`);
    }
    // breite Tabellen im Originaltext: scrollbarer Bereich per Tastatur erreichbar
    const ohneFokus = await seite.evaluate(() => [...document.querySelectorAll('.absatz-block')]
      .filter((el) => el.scrollWidth > el.clientWidth + 1 && el.getAttribute('tabindex') !== '0').length);
    if (ohneFokus > 0) h.befund(`k${nr}: ${ohneFokus} scrollbare Tabellen nicht per Tastatur erreichbar`);
    // Abbildungen (P14, O-32): jede im Originaltext ihres Kapitels, jedes Bild dekodiert
    const abb = await seite.evaluate(() => [...document.querySelectorAll('figure.abbildung')].map((f) => ({
      id: f.getAttribute('data-abbildung') ?? '', original: f.closest('.originaltext') !== null,
      ok: (f.querySelector('img')?.naturalWidth ?? 0) > 0, alt: f.querySelector('img')?.getAttribute('alt') ?? '' })));
    const soll = inhalte.whitepaper.abbildungen.filter((/** @type {any} */ a) => Number(a.kapitel) === nr && a.bild !== null).map((/** @type {any} */ a) => a.id);
    for (const id of soll) if (!abb.some((a) => a.id === id && a.original)) h.befund(`k${nr}: ${id} fehlt im Originaltext`);
    for (const a of abb) {
      if (!a.ok) h.befund(`k${nr}: ${a.id} – Bild nicht geladen`);
      if (a.alt.trim() === '') h.befund(`k${nr}: ${a.id} ohne Alternativtext`);
    }
    await h.axe(`k${nr}`);
    if (nr === 4 || nr === 8) await h.bild(`k${nr}`);
    // Lernwerkzeuge (P12.3, O-30): Kap. 1–12 erklären mit kleinen interaktiven Grafiken; jede Art per Tastatur bedienen
    if (nr <= 12) await lernwerkzeuge(seite, h, nr);
  }

  // Abbildung (P14): Permalink springt zur Abbildung der Lernseite, „Vergrößern“ öffnet den Dialog, Esc schließt
  const mitBild = inhalte.whitepaper.abbildungen.find((/** @type {any} */ a) => a.bild !== null
    && JSON.stringify(Object.values(inhalte.theorie).find((/** @type {any} */ t) => t.kapitel === Number(a.kapitel))?.bloecke ?? []).includes(`"id":"${a.id}"`));
  if (mitBild === undefined) h.befund('keine Abbildung auf einer Lernseite');
  else {
    await seite.evaluate((a) => { location.hash = `#theorie/k${a.kapitel}/${a.id}`; }, mitBild);
    const fig = seite.locator(`.lern-inhalt figure.abbildung[data-abbildung="${mitBild.id}"]`).first();
    await fig.waitFor({ timeout: 3000 });
    await h.warte(300);
    const oben = await fig.boundingBox();
    const kopfA = await seite.evaluate(() => document.querySelector('.lern-kopf')?.getBoundingClientRect().bottom ?? 0);
    if (oben === null || oben.y < kopfA - 1 || oben.y > (seite.viewportSize()?.height ?? 800)) h.befund(`Abbildungs-Permalink ${mitBild.id}: nicht frei sichtbar (${JSON.stringify(oben)})`);
    if (await fig.evaluate((el) => el.closest('.originaltext') !== null)) h.befund(`Abbildungs-Permalink ${mitBild.id}: springt in den Originaltext statt auf die Lernseite`);
    const gross = fig.locator('[data-pruef="abbildung-gross"]');
    await gross.focus();
    await seite.keyboard.press('Enter');
    await h.erwarte('dialog.abbildung-dialog[open]');
    const dlg = await seite.evaluate(() => {
      const d = document.querySelector('dialog.abbildung-dialog[open]');
      const img = d?.querySelector('img');
      return { breite: img?.getBoundingClientRect().width ?? 0, fenster: innerWidth, fokusDrin: d?.contains(document.activeElement) ?? false };
    });
    if (dlg.breite < Math.min(900, dlg.fenster * 0.85)) h.befund(`Abbildung vergrößert nur ${Math.round(dlg.breite)} px breit`);
    if (!dlg.fokusDrin) h.befund('Abbildungs-Dialog: Fokus nicht im Dialog');
    await h.axe('abbildung-dialog');
    await h.bild('abbildung-dialog');
    await seite.keyboard.press('Escape');
    await h.warte(100);
    if ((await seite.locator('dialog[open]').count()) !== 0) h.befund('Abbildungs-Dialog schließt nicht mit Esc');
    if (!(await gross.evaluate((el) => el === document.activeElement))) h.befund('Abbildungs-Dialog: Fokus kehrt nicht zum Knopf zurück');
    // „Schließen“, Klick auf den Innenrand (bleibt offen) und auf den Hintergrund (schließt) – P12.5 R11
    await gross.click();
    await h.erwarte('dialog.abbildung-dialog[open]');
    await seite.locator('dialog.abbildung-dialog[open] [data-pruef="abbildung-schliessen"]').click();
    await h.warte(100);
    if ((await seite.locator('dialog[open]').count()) !== 0) h.befund('Abbildungs-Dialog: „Schließen“ schließt nicht');
    await gross.click();
    await h.erwarte('dialog.abbildung-dialog[open]');
    const rahmenD = await seite.locator('dialog.abbildung-dialog[open]').boundingBox();
    if (rahmenD !== null) {
      // R12: ein Punkt, an dem wirklich der Dialog selbst liegt (Rand neben dem Bild), nicht der Kopf
      const innen = await seite.evaluate(() => {
        const d = document.querySelector('dialog.abbildung-dialog[open]');
        if (d === null) return null;
        const r = d.getBoundingClientRect();
        const unten = Math.min(r.bottom, window.innerHeight) - 4;
        for (let y = unten; y > r.top; y -= 6) if (document.elementFromPoint(r.left + 4, y) === d) return { x: r.left + 4, y };
        return null;
      });
      if (innen === null) h.befund('Abbildungs-Dialog: kein Innenrand zum Anklicken gefunden');
      else {
        await seite.mouse.click(innen.x, innen.y);
        await h.warte(100);
        if ((await seite.locator('dialog[open]').count()) !== 1) h.befund('Abbildungs-Dialog: Klick auf den Innenrand schließt');
      }
      // R14: das Mausrad über dem Dialog rollt die Seite dahinter nicht mit (auch nicht am Ende des Bilds)
      const yVor = await seite.evaluate(() => window.scrollY);
      const mitte = await seite.locator('dialog.abbildung-dialog[open]').boundingBox();
      if (mitte !== null) {
        await seite.mouse.move(mitte.x + mitte.width / 2, mitte.y + Math.min(mitte.height, 300) / 2);
        for (let i = 0; i < 8; i++) { await seite.mouse.wheel(0, 150); await h.warte(60); }
        await h.warte(300);
        const yNach = await seite.evaluate(() => window.scrollY);
        if (Math.abs(yNach - yVor) > 1) h.befund(`Abbildungs-Dialog: Mausrad rollt die Seite dahinter mit (${yVor} → ${yNach})`);
        // R15: Rolltasten (Fokus auf „Schließen“) rollen nur den Dialog
        await seite.locator('dialog.abbildung-dialog[open] [data-pruef="abbildung-schliessen"]').focus();
        for (const taste of ['PageDown', 'PageDown', 'ArrowDown', 'End', 'Home', 'End']) { await seite.keyboard.press(taste); await h.warte(40); }
        await h.warte(200);
        const yTasten = await seite.evaluate(() => window.scrollY);
        if (Math.abs(yTasten - yVor) > 1) h.befund(`Abbildungs-Dialog: Rolltasten rollen die Seite dahinter mit (${yVor} → ${yTasten})`);
        // R15: auch ein Dialog, der nichts zu rollen hat, gibt das Mausrad nicht an die Seite weiter
        await seite.evaluate(() => { const b = document.querySelector('dialog.abbildung-dialog[open] img'); if (b) b.setAttribute('style', 'width:120px;min-width:0'); });
        // R41: unter Last (drei Läufe parallel) reichten feste 100 ms nicht – warten, bis die Probe tatsächlich steht (höchstens 3 s)
        const kurz = await seite.waitForFunction(() => { const d = document.querySelector('dialog.abbildung-dialog[open]'); return d ? d.scrollHeight <= d.clientHeight && d.scrollWidth <= d.clientWidth : false; }, null, { timeout: 3000 }).then(() => true, () => false);
        for (let i = 0; i < 6; i++) { await seite.mouse.wheel(0, 150); await h.warte(60); }
        await h.warte(300);
        const yKurz = await seite.evaluate(() => window.scrollY);
        if (!kurz) h.befund('Abbildungs-Dialog: Probe „nicht rollbar“ nicht hergestellt');
        else if (Math.abs(yKurz - yVor) > 1) h.befund(`Abbildungs-Dialog ohne Rollbereich: Mausrad rollt die Seite (${yVor} → ${yKurz})`);
        await seite.evaluate(() => document.querySelector('dialog.abbildung-dialog[open] img')?.removeAttribute('style'));
      }
      const fenster = seite.viewportSize() ?? { width: 1280, height: 720 };
      const aussen = rahmenD.y > 6 ? { x: fenster.width / 2, y: 3 } : { x: 3, y: fenster.height / 2 };
      await seite.mouse.click(aussen.x, aussen.y);
      await h.warte(100);
      if ((await seite.locator('dialog[open]').count()) !== 0) h.befund('Abbildungs-Dialog: Klick auf den Hintergrund schließt nicht');
      // R16: nach dem Schließen rollt das Mausrad die Seite wieder
      const radRolltSeite = async (/** @type {string} */ wann) => {
        const fb = seite.viewportSize() ?? { width: 1280, height: 720 };
        await seite.mouse.move(fb.width / 2, fb.height / 2);
        const y1 = await seite.evaluate(() => window.scrollY);
        for (let i = 0; i < 3; i++) { await seite.mouse.wheel(0, 200); await h.warte(60); }
        await h.warte(300);
        const y2 = await seite.evaluate(() => window.scrollY);
        if (y2 <= y1) h.befund(`Abbildungs-Dialog: ${wann} rollt das Mausrad die Seite nicht mehr (${y1} → ${y2})`);
      };
      await radRolltSeite('nach dem Schließen');
      // R17: Strg+Rad (Zoom) und Zwei-Finger-Gesten bleiben dem Browser; die Leertaste auf „Schließen“ schließt
      await gross.click();
      await h.erwarte('dialog.abbildung-dialog[open]');
      const frei = await seite.evaluate(() => {
        const d = /** @type {HTMLDialogElement} */ (document.querySelector('dialog.abbildung-dialog[open]'));
        const r = d.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + Math.min(r.height, 200) / 2;
        const zoom = new WheelEvent('wheel', { cancelable: true, bubbles: true, ctrlKey: true, deltaY: -100, clientX: x, clientY: y });
        d.dispatchEvent(zoom);
        const f = (/** @type {number} */ i, /** @type {number} */ yy) => new Touch({ identifier: i, target: d, clientX: x + i * 40, clientY: yy });
        d.dispatchEvent(new TouchEvent('touchstart', { cancelable: true, bubbles: true, touches: [f(0, y), f(1, y)] }));
        const wisch = new TouchEvent('touchmove', { cancelable: true, bubbles: true, touches: [f(0, y + 30), f(1, y - 30)] });
        d.dispatchEvent(wisch);
        return { zoom: !zoom.defaultPrevented, zweiFinger: !wisch.defaultPrevented };
      });
      if (!frei.zoom) h.befund('Abbildungs-Dialog: Strg+Mausrad (Zoom) wird gesperrt');
      if (!frei.zweiFinger) h.befund('Abbildungs-Dialog: Zwei-Finger-Geste wird gesperrt');
      await seite.locator('dialog.abbildung-dialog[open] [data-pruef="abbildung-schliessen"]').focus();
      await seite.keyboard.press('Space');
      await h.warte(150);
      if ((await seite.locator('dialog[open]').count()) !== 0) h.befund('Abbildungs-Dialog: Leertaste auf „Schließen“ schließt nicht');
      // R16: Umschalt+Rad rollt einen breiten Dialog waagrecht (bei 400 px ist das Bild breiter als das Fenster)
      if (fenster.width < 600) {
        await gross.click();
        await h.erwarte('dialog.abbildung-dialog[open]');
        const bx = await seite.locator('dialog.abbildung-dialog[open]').boundingBox();
        if (bx !== null) {
          await seite.mouse.move(bx.x + bx.width / 2, bx.y + Math.min(bx.height, 300) / 2);
          await seite.keyboard.down('Shift');
          for (let i = 0; i < 3; i++) { await seite.mouse.wheel(0, 150); await h.warte(60); }
          await seite.keyboard.up('Shift');
          await h.warte(300);
          const links = await seite.evaluate(() => document.querySelector('dialog.abbildung-dialog[open]')?.scrollLeft ?? 0);
          if (links <= 0) h.befund('Abbildungs-Dialog: Umschalt+Mausrad rollt nicht waagrecht');
        }
        await seite.keyboard.press('Escape');
        await h.warte(100);
      }
      // R16: wird der offene Dialog durch einen Seitenwechsel entfernt, bleibt keine Radsperre zurück
      await gross.click();
      await h.erwarte('dialog.abbildung-dialog[open]');
      const hashVorher = await seite.evaluate(() => location.hash);
      await seite.evaluate(() => { /** @type {any} */ (window).offenerDialog = document.querySelector('dialog[open]'); location.hash = '#theorie/k5'; });
      await h.warte(600);
      // R23: der Seitenwechsel schließt den offenen Dialog (Beobachter räumen über 'close' auf)
      if (await seite.locator('dialog[open]').count() !== 0 || await seite.evaluate(() => /** @type {any} */ (window).offenerDialog?.open === true)) h.befund('Seitenwechsel schließt den offenen Dialog nicht');
      await radRolltSeite('nach einem Seitenwechsel bei offenem Dialog');
      // R17: jede Kapitelseite trägt ihren Titel im Dokumenttitel
      const titelK5 = await seite.title();
      if (!/^Kapitel 5 · .+ · Erklärt · /u.test(titelK5)) h.befund(`Kapitel 5: Dokumenttitel „${titelK5}“ nennt das Kapitel nicht`);
      await seite.evaluate((x) => { location.hash = x; }, hashVorher);
      await h.warte(600);
    }
    // Beleg einer Abweichung: springt zum Absatz im aufgeklappten Originaltext
    const abw = fig.locator('[data-pruef="abbildung-abweichungen"]');
    if (await abw.count() > 0) {
      await abw.locator('summary').click();
      const link = abw.locator('a.abbildung-beleg').first();
      const ziel = await link.textContent();
      await link.click();
      await h.warte(400);
      const offen = await seite.evaluate((id) => {
        const a = document.querySelector(`.originaltext .absatz[data-absatz="${id}"]`);
        return { offen: a?.closest('details')?.open ?? false, ziel: a?.classList.contains('ist-ziel') ?? false };
      }, ziel ?? '');
      if (!offen.offen || !offen.ziel) h.befund(`Beleg-Link ${ziel}: Originaltext nicht aufgeklappt oder Absatz nicht markiert (${JSON.stringify(offen)})`);
    }
  }
  // Abbildung nur im Originaltext (abb-10, abb-12, abb-13; L-77, L-82): Permalink klappt ihn auf
  const nurOriginal = inhalte.whitepaper.abbildungen.filter((/** @type {any} */ a) => a.bild !== null
    && !JSON.stringify(Object.values(inhalte.theorie).find((/** @type {any} */ t) => t.kapitel === Number(a.kapitel))?.bloecke ?? []).includes(`"id":"${a.id}"`));
  if (nurOriginal.length !== 3) h.befund(`${nurOriginal.length} Abbildungen nur im Originaltext statt 3 (L-82)`);
  for (const a of nurOriginal) {
    await seite.evaluate((x) => { location.hash = `#theorie/k${x.kapitel}/${x.id}`; }, a);
    const f = seite.locator(`.originaltext figure.abbildung[data-abbildung="${a.id}"]`);
    await f.waitFor({ timeout: 3000 });
    await h.warte(300);
    const lage = await f.boundingBox();
    const offen = await f.evaluate((el) => el.closest('details')?.open ?? false);
    if (!offen || lage === null || lage.y > (seite.viewportSize()?.height ?? 800)) h.befund(`Permalink ${a.id}: Originaltext zu oder Abbildung nicht sichtbar (${JSON.stringify(lage)})`);
  }

  // R20: genau eine main-Landmarke je Lernseite
  if (await seite.locator('main').count() !== 1) h.befund(`Theorie: ${await seite.locator('main').count()} main-Landmarken statt 1`);
  // R21: das Kapitelverzeichnis ist eine eigene Navigation
  if (await seite.locator('nav[aria-label="Kapitel"] details.kapitel-verzeichnis').count() !== 1) h.befund('Theorie: Kapitelverzeichnis ohne Navigation-Landmarke');
  // R26: Fokusfalle ohne Einbettung – vom (nicht rollenden) Dialog selbst aus bleiben Tab und Umschalt+Tab im Dialog
  if ((seite.viewportSize()?.width ?? 0) >= 1200) {
    await seite.evaluate(() => { location.hash = '#theorie/k6'; });
    await h.warte(600);
    const knopf9 = seite.locator('.lern-inhalt [data-pruef="abbildung-gross"]').first();
    await knopf9.click();
    await h.erwarte('dialog.abbildung-dialog[open]');
    for (const taste of ['Shift+Tab', 'Tab']) {
      await seite.locator('dialog.abbildung-dialog[open] .t-label').first().click();
      await seite.keyboard.press(taste);
      await h.warte(80);
      const drin = await seite.evaluate(() => { const d = document.querySelector('dialog.abbildung-dialog[open]'); return d !== null && d.contains(document.activeElement); });
      if (!drin) h.befund(`Abbildungs-Dialog: ${taste} vom Dialog selbst aus verlässt ihn`);
    }
    await seite.keyboard.press('Escape');
    await h.warte(100);
    await seite.evaluate(() => { location.hash = '#theorie/k4'; });
    await h.warte(600);
  }
  // R22: Landmarken tragen verschiedene Namen
  const navNamen = await seite.evaluate(() => [...document.querySelectorAll('nav, [role="navigation"], [role="region"], section[aria-label], section[aria-labelledby]')].map((n) => `${n.tagName}:${n.getAttribute('aria-label') ?? document.getElementById(n.getAttribute('aria-labelledby') ?? '')?.textContent ?? ''}`));
  const doppelt = navNamen.filter((n, i) => navNamen.indexOf(n) !== i);
  if (doppelt.length > 0) h.befund(`Theorie: gleichnamige Landmarken (${[...new Set(doppelt)].join(', ')})`);
  // Zitierfunktion (P10.1): Absatz-Permalink springt zum Absatz, „Zitieren“ zeigt die Angabe
  await seite.evaluate(() => { location.hash = '#theorie/k4/k4.2-p3'; });
  const absatz = seite.locator('.originaltext .absatz[data-absatz="k4.2-p3"]');
  await absatz.waitFor({ timeout: 3000 });
  await h.warte(200);
  const lage = await absatz.boundingBox();
  const hoehe = seite.viewportSize()?.height ?? 800;
  const kopfUnten = await seite.evaluate(() => document.querySelector('.lern-kopf')?.getBoundingClientRect().bottom ?? 0);
  if (lage === null || lage.y < kopfUnten - 1 || lage.y > hoehe) h.befund(`Absatz-Permalink: k4.2-p3 nicht frei sichtbar (${JSON.stringify(lage)}, Kopfleiste bis ${kopfUnten})`);
  // frisch geladen (geteilter Link): ebenfalls unter der Kopfleiste
  await seite.reload();
  await absatz.waitFor({ timeout: 3000 });
  await h.warte(400);
  const frisch = await absatz.boundingBox();
  const kopf2 = await seite.evaluate(() => document.querySelector('.lern-kopf')?.getBoundingClientRect().bottom ?? 0);
  if (frisch === null || frisch.y < kopf2 - 1 || frisch.y > hoehe) h.befund(`Absatz-Permalink nach Neuladen: ${JSON.stringify(frisch)}, Kopfleiste bis ${kopf2}`);
  if (await absatz.evaluate((el) => el.classList.contains('ist-ziel')) !== true) h.befund('Absatz-Permalink: Ziel nicht hervorgehoben');
  await absatz.locator('[data-pruef="zitieren"]').click();
  const angabe = await absatz.locator('[data-pruef="zitierangabe"]').textContent();
  if (!/^Bauherr Mentoren, MVG V1\.2, Kap\. 4\.2, Abs\. 3\. Link: .*#theorie\/k4\/k4\.2-p3$/u.test(angabe ?? '')) h.befund(`Zitierangabe: „${angabe}“`);
  await h.axe('zitieren');
  await h.bild('zitieren');
  // Druck (P10.2): im Druck ist nur der Bogen sichtbar, die Seite selbst nicht; eine PDF entsteht
  // Kapitel 8: breite Karten-Tafel (k8.4-t1) – im Druck darf nichts über den Satzspiegel ragen
  await seite.evaluate(() => { location.hash = '#theorie/k8'; });
  await h.erwarte('[data-kapitel="8"] [data-pruef="lernseite"]');
  // Fokus nicht verdeckt (WCAG 2.4.11, P11.3 R2): 60 Tabulatorschritte vor und zurück (rückwärts rollt
  // die Seite den Fokus an die Oberkante), kein Fokus unter der klebenden Kopfleiste
  await seite.evaluate(() => { window.scrollTo(0, 0); });
  let verdeckt = 0;
  for (let i = 0; i < 120; i++) {
    await seite.keyboard.press(i < 60 ? 'Tab' : 'Shift+Tab');
    verdeckt += await seite.evaluate(() => {
      const f = document.activeElement;
      const kopf = document.querySelector('.lern-kopf');
      if (!(f instanceof HTMLElement) || kopf === null || kopf.contains(f) || f.closest('.sprunglink, [class*="sprung"]') !== null) return 0;
      const r = f.getBoundingClientRect();
      return r.height > 0 && r.height < 400 && r.top < kopf.getBoundingClientRect().bottom - 1 ? 1 : 0;
    });
  }
  if (verdeckt > 0) h.befund(`Kapitel 8: ${verdeckt} von 120 Fokusstopps unter der Kopfleiste`);
  await seite.evaluate(() => { window.print = () => {}; });
  await seite.locator('[data-pruef="kapitel-drucken"]').click();
  await seite.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  const druck = await seite.evaluate(() => ({
    bogen: getComputedStyle(document.querySelector('.druck-bogen') ?? document.body).display,
    seite: getComputedStyle(document.querySelector('#app > *, body > :not(.druck-bogen)') ?? document.body).display,
    titel: document.querySelector('.druck-bogen .druck-kopf h1')?.textContent ?? '',
    zitieren: [...document.querySelectorAll('.druck-bogen .absatz-zitieren')].filter((x) => getComputedStyle(x).display !== 'none').length,
    // R28: aufgelöst statt scheinbar bedienbar – keine Knöpfe außer Glossarbegriffen, der Wissenscheck mit Erklärung
    // R31: aus Knöpfen gewordene Spans ohne ARIA, Rolle und Tabulatorstopp; der gewählte Stand trägt seinen Rahmen
    aria: document.querySelectorAll('.druck-bogen span:is([role], [tabindex], [aria-pressed], [aria-controls], [aria-selected], [aria-expanded], [aria-current], [aria-describedby])').length,
    // R48: Tafeln mit Auswahl stehen im Druck aufgelöst (alle Zeilen) – ein gewählter Stand bleibt nur bei Lernwerkzeugen
    aufgeloest: document.querySelectorAll('.druck-bogen .tafel-aufgeloest').length,
    gewaehlt: [...document.querySelectorAll('.druck-bogen [data-gewaehlt]')].map((x) => { const c = getComputedStyle(x); return c.outlineStyle === 'solid' && parseFloat(c.outlineWidth) >= 2; }),
    knoepfe: [...document.querySelectorAll('.druck-bogen :is(button:not(.begriff), input, select, textarea, [role="button"])')].filter((x) => getComputedStyle(x).display !== 'none').length,
    // jede Antwort des Wissenschecks mit Rückmeldung (R29)
    antworten: document.querySelectorAll('.lernseite:not(.druck-kapitel) .wc-antwort').length,
    druckAntworten: [...document.querySelectorAll('.druck-bogen .wc-druck-antworten li')].filter((li) => (li.textContent ?? '').split('→')[1]?.trim()).length,
    erklaerung: document.querySelectorAll('.druck-bogen .wissenscheck .wc-erklaerung').length,
    wc: document.querySelectorAll('.druck-bogen .wissenscheck').length,
  }));
  if (druck.bogen === 'none' || druck.seite !== 'none' || !/^Kapitel 8 · /u.test(druck.titel) || druck.zitieren > 0
    || druck.knoepfe > 0 || druck.aria > 0 || (druck.gewaehlt.length < 1 && druck.aufgeloest < 1) || druck.gewaehlt.includes(false) || druck.wc < 1 || druck.erklaerung !== druck.wc || druck.antworten < 2 || druck.druckAntworten !== druck.antworten) h.befund(`Druckbogen: ${JSON.stringify(druck)}`);
  // nichts im Bogen ragt über den Satzspiegel hinaus (A4 mit 14 mm Rand ≈ 688 px breit). R42: Chromium wertet im Druck die
  // Media Queries bei der Blattbreite (≈ 794 px) aus, setzt aber 688 px – gemessen wird genauso, sonst greift eine schmale
  // Form (≤ 700 px), die im Druck nie greift
  const vorher = seite.viewportSize() ?? { width: 1280, height: 720 };
  await seite.setViewportSize({ width: 794, height: vorher.height });
  await seite.evaluate(() => { document.documentElement.style.width = '688px'; });
  await h.warte(150);
  const ueber = await seite.evaluate(() => {
    const bogen = document.querySelector('.druck-bogen');
    const rechts = bogen?.getBoundingClientRect().right ?? 0;
    return [...(bogen?.querySelectorAll('*') ?? [])].filter((el) => el.getBoundingClientRect().right > rechts + 0.5).length;
  });
  if (ueber > 0) h.befund(`Druckbogen: ${ueber} Elemente ragen über den Satzspiegel`);
  await seite.evaluate(() => { document.documentElement.style.width = ''; });
  await seite.setViewportSize(vorher);
  // R47: ohne Hintergrundgrafiken dunkelt Chrome helle Schrift nur auf Grau ab – helle Schrift im Bogen druckt ihre Fläche mit
  const blass = await seite.evaluate(() => {
    const lum = (/** @type {string} */ c) => { const m = c.match(/[\d.]+/gu)?.map(Number) ?? [0, 0, 0]; const f = (/** @type {number} */ v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(m[0] ?? 0) + 0.7152 * f(m[1] ?? 0) + 0.0722 * f(m[2] ?? 0); };
    return [...document.querySelectorAll('.druck-bogen *')].filter((el) => [...el.childNodes].some((k) => k.nodeType === 3 && (k.textContent ?? '').trim() !== '') && el.getClientRects().length > 0)
      .filter((el) => { const cs = getComputedStyle(el); return 1.05 / (lum(cs.color) + 0.05) < 4.5 && cs.printColorAdjust !== 'exact'; })
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`).slice(0, 5);
  });
  if (blass.length > 0) h.befund(`Druck Kapitel 8: helle Schrift ohne gedruckte Fläche ${JSON.stringify(blass)}`);
  // R47: vor page.pdf lesen – page.pdf löst afterprint aus und räumt den Bogen ab (vorher blieb die Kopfliste leer)
  // R41: im echten PDF – keine Seite endet mit einer Überschrift, keine leere Seite, kein Bedienhinweis („Ziehen Sie den Regler“)
  // R42: auch die Kapitälchen-Labels über Querverweis und Wissenscheck; je Kopf seine Druckgröße in pt (Listenpunkte gleichen Wortlauts zählen nicht)
  // R49: dazu die Quellzeile einer Kartentafel – sie steht im Druck über den Karten und bleibt bei ihnen
  const koepfe = await seite.evaluate(() => [...document.querySelectorAll('.druck-bogen :is(h1, h2, h3, h4, dt, .lw-titel, .original-abschnitt, summary, .lw-etappe-titel, .felder-ansicht, .querverweis-text, .absatz-id), .druck-bogen .lw-aufgeloest-liste > li > b:first-child, .druck-bogen :is(.querverweis-block, .wissenscheck) > .t-label, .druck-bogen figure.tafel > figcaption')]
    .filter((x) => (x.tagName !== 'FIGCAPTION' || Number.parseInt(getComputedStyle(x).order, 10) < 0) && x.closest('.impressum') === null)
    // R43: die Größe des sichtbaren Texts (größte Schrift eines Elements mit eigenem Text), nicht die des Kopfelements selbst
    .map((x) => ({ text: x.textContent ?? '', pt: Math.max(...[x, ...x.querySelectorAll('*')].filter((e) => [...e.childNodes].some((k) => k.nodeType === 3 && (k.textContent ?? '').trim() !== ''))
      .map((e) => parseFloat(getComputedStyle(e).fontSize))) * 0.75 })));
  // R49: Quellzeilen, die im Druck unter ihrer Tafel stehen (nach dem Layout, nicht nach der Tafelform) – nie allein oben
  // auf der Folgeseite; die über den Karten stehen in der Kopfliste (nie allein am Seitenende)
  const quellenUnten = () => seite.evaluate(() => [...document.querySelectorAll('.druck-bogen figure.tafel > figcaption')]
    .filter((x) => Number.parseInt(getComputedStyle(x).order, 10) >= 0).map((x) => (x.textContent ?? '').replace(/\s+/gu, '')));
  const unten8 = await quellenUnten();
  const pdf = await seite.pdf({ format: 'A4' });
  const seiten = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/gu) ?? []).length;
  if (seiten < 2 || seiten > 40) h.befund(`Druck Kapitel 8: ${seiten} Seiten`);
  const pdfText = await pdfSeiten(pdf);
  if (koepfe.length < 10) h.befund(`Druck Kapitel 8: nur ${koepfe.length} Köpfe gelesen`);
  const amEnde = seitenMitUeberschriftAmEnde(pdfText, koepfe);
  if (amEnde.length > 0) h.befund(`Druck Kapitel 8: Überschrift am Seitenende ${JSON.stringify(amEnde)}`);
  if (pdfText.some((x) => x.zeilen.length === 0)) h.befund('Druck Kapitel 8: leere Seite');
  // R49: die Quellzeile einer Tafel steht nie allein oben auf der Folgeseite (wirkte wie der Kopf des nächsten Blocks)
  const quelleOben = (/** @type {{ zeilen: string[] }[]} */ p, /** @type {string[]} */ unten) => p.map((x, i) => ({ seite: i + 1, z: x.zeilen[0] ?? '' }))
    .filter((x) => /^Quelle: MVG V?1\.2/u.test(x.z) && unten.some((u) => u.startsWith(x.z.replace(/\s+/gu, ''))));
  if (quelleOben(pdfText, unten8).length > 0) h.befund(`Druck Kapitel 8: Quellzeile am Seitenanfang ${JSON.stringify(quelleOben(pdfText, unten8))}`);
  if (pdfText.some((x) => x.zeilen.some((z) => /Ziehen Sie|Klicken Sie/u.test(z)))) h.befund('Druck Kapitel 8: Bedienhinweis im Druck');
  await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
  if (await seite.locator('.druck-bogen').count() !== 0) h.befund('Druckbogen bleibt nach dem Druck stehen');
  // R38: Strg+P ohne den Knopf – der Browser meldet beforeprint, gedruckt wird derselbe Bogen (Abweichungen offen, keine Knöpfe)
  await seite.evaluate(() => { window.dispatchEvent(new Event('beforeprint')); });
  await seite.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  const strgP = await seite.evaluate(() => ({
    klasse: document.body.classList.contains('druckt-bogen'),
    titel: document.querySelector('.druck-bogen .druck-kopf h1')?.textContent ?? '',
    seite: getComputedStyle(document.querySelector('body > :not(.druck-bogen)') ?? document.body).display,
    zu: document.querySelectorAll('.druck-bogen details:not([open])').length,
    knoepfe: [...document.querySelectorAll('.druck-bogen :is(button:not(.begriff), input, select, textarea, [role="button"])')].filter((x) => getComputedStyle(x).display !== 'none').length,
  }));
  // R39: Überschriften bleiben beim Folgenden, Absätze mit Tabelle dürfen umbrechen (sonst Überschrift allein auf der Seite)
  const umbruch = await seite.evaluate(() => ({
    kopf: [...document.querySelectorAll('.druck-bogen :is(h2, h3)')].filter((x) => getComputedStyle(x).breakAfter !== 'avoid').length,
    // R40: Überschriften reißen nicht über zwei Seiten; Abbildungen sind im Druck höchstens 170 mm hoch (passen samt Überschrift auf die Seite)
    zerreisst: [...document.querySelectorAll('.druck-bogen :is(h2, h3, .original-abschnitt)')].filter((x) => getComputedStyle(x).breakInside !== 'avoid').length,
    bildHoch: [...document.querySelectorAll('.druck-bogen .abbildung-bild')].filter((x) => getComputedStyle(x).maxHeight === 'none').length,
    tabelle: [...document.querySelectorAll('.druck-bogen .absatz')].filter((x) => x.querySelector('table') !== null && getComputedStyle(x).breakInside !== 'auto').length,
  }));
  // R40: ein echtes window.print() löst beforeprint synchron aus – der Knopf-Bogen („alle Kapitel“) darf dabei nicht abgeräumt werden
  await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
  await seite.evaluate(() => { location.hash = '#theorie'; });
  await h.erwarte('[data-pruef="alles-drucken"]');
  await seite.evaluate(() => { window.print = () => { window.dispatchEvent(new Event('beforeprint')); }; });
  await seite.locator('[data-pruef="alles-drucken"]').click();
  await h.warte(300);
  const alles = await seite.evaluate(() => ({ boegen: document.querySelectorAll('.druck-bogen').length, klasse: document.body.classList.contains('druckt-bogen'), kapitel: document.querySelectorAll('.druck-bogen .druck-kapitel').length }));
  if (alles.boegen !== 1 || !alles.klasse || alles.kapitel < 13) h.befund(`Alles drucken nach Kapitelbesuch: ${JSON.stringify(alles)}`);
  // R42: in keinem Kapitel steht im Druck ein Bedienhinweis („Ziehen Sie den Regler“, „Schalten Sie um“ …); R47: auch „Ordnen/Prüfen/Probieren/Öffnen Sie“ und das Suchfeld
  await seite.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  const bedienung = await seite.evaluate(() => (document.querySelector('.druck-bogen') instanceof HTMLElement ? /** @type {HTMLElement} */ (document.querySelector('.druck-bogen')).innerText : '')
    .match(/[^.!?\n]*(?<!\p{L})(?:(?:Ziehen|Klicken|Schalten|Schieben|Wählen|Tippen|Ordnen|Prüfen|Probieren|Öffnen|Blättern|Drücken|klicken|schalten|ziehen|schieben|wählen|ordnen|prüfen|probieren|öffnen) Sie(?!\p{L})|Suchfeld|(?:Der|der|den|dem) (?:Umschalter|Regler)(?!\p{L}))[^.!?\n]*/gu) ?? []);
  if (bedienung.length > 0) h.befund(`Alles drucken: Bedienhinweise im Druck ${JSON.stringify(bedienung.slice(0, 5))}`);
  // R43: im Drucklayout (794 px Medienbreite, 688 px Satz) bricht kein Wort mitten im Wort ohne Trennstrich – nur an einer
  // weichen Trennstelle (U+00AD); gemessen je Zeichen über die Zeilenlage
  const vorAlles = seite.viewportSize() ?? { width: 1280, height: 720 };
  await seite.setViewportSize({ width: 794, height: vorAlles.height });
  await seite.evaluate(() => { document.documentElement.style.width = '688px'; });
  await h.warte(200);
  const wortbruch = await wortbrueche(seite, '.druck-bogen');
  await seite.evaluate(() => { document.documentElement.style.width = ''; });
  await seite.setViewportSize(vorAlles);
  if (wortbruch.length > 0) h.befund(`Alles drucken: ${wortbruch.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(wortbruch.slice(0, 6))}`);
  // R47: im echten PDF aller Kapitel – kein Kopf, kein Feld-Schalter, kein Querverweis-Titel allein am Seitenende
  // (die Druckbefunde der Runde 47 lagen alle hier); Köpfe vor page.pdf lesen, das den Bogen abräumt
  const koepfeAlle = await seite.evaluate(() => [...document.querySelectorAll('.druck-bogen :is(h1, h2, h3, h4, dt, .lw-titel, .original-abschnitt, summary, .lw-etappe-titel, .felder-ansicht, .querverweis-text, .absatz-id), .druck-bogen .lw-aufgeloest-liste > li > b:first-child, .druck-bogen :is(.querverweis-block, .wissenscheck) > .t-label, .druck-bogen figure.tafel > figcaption')]
    .filter((x) => (x.tagName !== 'FIGCAPTION' || Number.parseInt(getComputedStyle(x).order, 10) < 0) && x.closest('.impressum') === null)
    .map((x) => ({ text: x.textContent ?? '', pt: Math.max(...[x, ...x.querySelectorAll('*')].filter((e) => [...e.childNodes].some((k) => k.nodeType === 3 && (k.textContent ?? '').trim() !== ''))
      .map((e) => parseFloat(getComputedStyle(e).fontSize))) * 0.75 })));
  // R48: keine Auslöser-Wahl im Druck – Tafeln stehen dort aufgelöst (L-140), eine Wahl ohne Kette riss am Seitenende ab
  const wahlImDruck = await seite.evaluate(() => document.querySelectorAll('.druck-bogen .ausloeser-wahl').length);
  if (wahlImDruck > 0) h.befund(`Alles drucken: ${wahlImDruck} Auslöser-Wahlen im Druck (Tafel nicht aufgelöst)`);
  // R48: keine Aufklappzeichen (Dreieck) im Druck
  const marker = await seite.evaluate(() => [...document.querySelectorAll('.druck-bogen summary')].filter((x) => getComputedStyle(x).display === 'list-item' && getComputedStyle(x).listStyleType !== 'none').length);
  if (marker > 0) h.befund(`Alles drucken: ${marker} Aufklappzeichen im Druck`);
  if (!koepfeAlle.some((x) => /^k\d+(?:\.\d+)*-t\d+$/u.test(x.text.trim()))) h.befund('Alles drucken: Absatz-IDs fehlen in der Kopfliste');
  const untenAlle = await quellenUnten();
  if (!koepfeAlle.some((x) => /^Quelle: MVG/u.test(x.text))) h.befund('Alles drucken: Quellzeilen der Kartentafeln fehlen in der Kopfliste');
  const allesPdf = await pdfSeiten(await seite.pdf({ format: 'A4' }));
  const allesEnde = seitenMitUeberschriftAmEnde(allesPdf, koepfeAlle);
  if (allesEnde.length > 0) h.befund(`Alles drucken: Überschrift am Seitenende ${JSON.stringify(allesEnde.slice(0, 6))}`);
  if (quelleOben(allesPdf, untenAlle).length > 0) h.befund(`Alles drucken: Quellzeile am Seitenanfang ${JSON.stringify(quelleOben(allesPdf, untenAlle).slice(0, 6))}`);
  // R49: keine fast leere Seite in allen Kapiteln – außer der letzten und der vor einem Kapitelbeginn oder dem Impressum (erzwungener Umbruch)
  const vorKapitelAlles = (/** @type {number} */ i) => /^(?:KAPITEL\d|FassungundImpressum)/u.test((allesPdf[i + 1]?.zeilen.slice(0, 2).join('') ?? '').replace(/\s+/gu, ''));
  if (!allesPdf.some((x) => x.zeilen.join(' ').includes('Herausgeber Bauherr Mentoren'))) h.befund('Alles drucken: Impressum fehlt im PDF');
  const leerAlles = allesPdf.slice(0, -1).map((x, i) => ({ seite: i + 1, fuellung: Math.round((x.fuellung ?? 0) * 100), vor: vorKapitelAlles(i) }))
    .filter((x) => x.fuellung < 35 && !x.vor);
  if (leerAlles.length > 0) h.befund(`Alles drucken: fast leere Seiten ${JSON.stringify(leerAlles.slice(0, 6))}`);
  await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await seite.evaluate(() => { window.print = () => {}; window.dispatchEvent(new Event('afterprint')); history.back(); });
  await h.erwarte('[data-pruef="kapitel-drucken"]');
  await seite.evaluate(() => { window.dispatchEvent(new Event('beforeprint')); });
  await seite.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  if (umbruch.kopf > 0 || umbruch.tabelle > 0 || umbruch.zerreisst > 0 || umbruch.bildHoch > 0) h.befund(`Druckbogen Umbruch: ${JSON.stringify(umbruch)}`);
  if (!strgP.klasse || !/^Kapitel 8 · /u.test(strgP.titel) || strgP.seite !== 'none' || strgP.zu > 0 || strgP.knoepfe > 0) h.befund(`Strg+P: ${JSON.stringify(strgP)}`);
  await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
  if (await seite.locator('.druck-bogen').count() !== 0 || await seite.evaluate(() => document.body.classList.contains('druckt-bogen'))) h.befund('Strg+P: Bogen bleibt nach dem Druck stehen');
  // R43: Kap. 7 im echten PDF – keine fast leere Seite vor einer Abbildung (die ganze Abbildung ließ 10 % Füllung zurück)
  await seite.evaluate(() => { location.hash = '#theorie/k7'; });
  await h.erwarte('[data-kapitel="7"] [data-pruef="kapitel-drucken"]');
  await seite.locator('[data-pruef="kapitel-drucken"]').click();
  await seite.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  const k7 = await pdfSeiten(await seite.pdf({ format: 'A4' }));
  const leer7 = k7.slice(0, -1).map((x, i) => ({ seite: i + 1, fuellung: Math.round((x.fuellung ?? 0) * 100) })).filter((x) => x.fuellung < 35);
  if (leer7.length > 0) h.befund(`Druck Kapitel 7: fast leere Seiten ${JSON.stringify(leer7)}`);
  await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
  // R49: Strg+P auf „Fassung und Impressum“ druckt das Impressum (aufgeklappt), auf der übrigen Kapitelliste den Ersatzbogen
  await seite.evaluate(() => { location.hash = '#theorie/impressum'; });
  await h.erwarte('[data-pruef="impressum"]');
  const impDruck = await seite.evaluate(() => {
    window.dispatchEvent(new Event('beforeprint'));
    const bog = document.querySelector('.druck-bogen');
    const r = { titel: document.title, imp: bog?.querySelector('[data-pruef="impressum"]') !== null && bog !== null, zu: bog?.querySelectorAll('details:not([open])').length ?? -1 };
    window.dispatchEvent(new Event('afterprint'));
    return r;
  });
  if (!impDruck.imp || impDruck.zu !== 0 || !/^Fassung und Impressum · Governance Kompass$/u.test(impDruck.titel)) h.befund(`Strg+P Impressum: ${JSON.stringify(impDruck)}`);
  // R29: Kap. 3 – das Schwellen-Spiel steht im Druck aufgelöst (je Aufgabe die Seite, ohne Hinweis und „Auflösen“)
  await seite.evaluate(() => { location.hash = '#theorie/k3'; });
  await h.erwarte('[data-kapitel="3"] .schwelle-karte');
  await seite.locator('[data-pruef="kapitel-drucken"]').click();
  const schw = await seite.evaluate(() => ({
    aufgaben: document.querySelectorAll('.lernseite:not(.druck-kapitel) .schwelle-karte').length,
    seiten: [...document.querySelectorAll('.druck-bogen .schwelle-druck-seite')].filter((x) => /^→ \S/u.test(x.textContent ?? '')).length,
    rest: document.querySelectorAll('.druck-bogen :is(.tafel-schwelle .tafel-hinweis, [data-pruef="schwelle-aufloesen"], .schwelle-rueck, .schwelle-stand)').length,
  }));
  if (schw.aufgaben < 2 || schw.seiten !== schw.aufgaben || schw.rest > 0) h.befund(`Druck Kap. 3: Schwellen-Spiel nicht aufgelöst (${JSON.stringify(schw)})`);
  await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
  // R28: Hochkontrastmodus – Knöpfe behalten eine Grenze, der gewählte Zustand ist ohne Hintergrundfarbe der Seite erkennbar
  await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce', forcedColors: 'active' });
  await seite.evaluate(() => { location.hash = '#theorie/k3'; });
  await h.erwarte('[data-kapitel="3"] .schwelle-knopf');
  await seite.locator('.schwelle-knopf').first().click();
  const hk = await seite.evaluate(() => [...document.querySelectorAll('.schwelle-knopf')].slice(0, 2).map((b) => {
    const c = getComputedStyle(b); return { an: b.getAttribute('aria-pressed'), rand: parseFloat(c.borderTopWidth), bg: c.backgroundColor };
  }));
  if (hk.length < 2 || hk.some((x) => x.rand < 1) || hk[0]?.an !== 'true' || hk[0]?.bg === hk[1]?.bg) h.befund(`Hochkontrast: Schwellen-Knöpfe ohne Grenze oder ohne sichtbare Wahl (${JSON.stringify(hk)})`);
  // R30: Unterelemente gewählter Knöpfe tragen keine eigene Fläche (sonst HighlightText auf Autorfarbe)
  await seite.evaluate(() => { location.hash = '#theorie/k1'; });
  await h.erwarte('[data-kapitel="1"] [data-pruef="etappe-1"]');
  const flaechen = await seite.evaluate(() => [...document.querySelectorAll('button[aria-pressed="true"] *')]
    .filter((e) => !(e instanceof SVGElement)).map((e) => getComputedStyle(e).backgroundColor)
    .filter((c) => c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent').length);
  if (flaechen > 0) h.befund(`Hochkontrast: ${flaechen} Unterelemente gewählter Knöpfe mit eigener Fläche`);
  // R31: der aktuelle Verzeichniseintrag (Link, kein Knopf) trägt einen Rahmen in Systemfarbe (auch eingeklappt bei 400 px berechnet)
  const verz = await seite.evaluate(() => [...document.querySelectorAll('a[aria-current]:not([aria-current="false"])')]
    .map((a) => { const c = getComputedStyle(a); return c.outlineStyle === 'solid' && parseFloat(c.outlineWidth) >= 2; }));
  if (verz.length < 1 || verz.includes(false)) h.befund(`Hochkontrast: aktueller Verzeichniseintrag ohne Rahmen (${JSON.stringify(verz)})`);
  await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce', forcedColors: 'none' });
  // Impressum
  await seite.evaluate(() => { location.hash = '#theorie/impressum'; });
  await h.erwarte('[data-pruef="impressum"]');
  await h.warte(200);
  const imp = await seite.locator('[data-pruef="impressum"] h2').boundingBox();
  const kopf3 = await seite.evaluate(() => document.querySelector('.lern-kopf')?.getBoundingClientRect().bottom ?? 0);
  if (imp === null || imp.y > hoehe || imp.y < kopf3 - 1) h.befund(`Impressum-Permalink: Überschrift nicht frei sichtbar (${JSON.stringify(imp)}, Kopfleiste bis ${kopf3})`);
  await h.axe('impressum');
}

/**
 * Je Art die erste Grafik der Seite per Tastatur bedienen und die Wirkung prüfen (P12.3).
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {number} nr
 */
async function lernwerkzeuge(seite, h, nr) {
  const zahl = await seite.locator('.lernwerkzeug').count();
  if (zahl < 2) h.befund(`k${nr}: nur ${zahl} interaktive Grafik(en) (O-30 verlangt Erklärung mit kleinen Grafiken)`);
  const etappen = seite.locator('[data-pruef="etappen"]').first();
  if (await etappen.count() > 0) {
    await etappen.locator('[data-pruef="etappe-1"]').focus();
    await seite.keyboard.press('ArrowRight');
    if ((await etappen.locator('[data-pruef="etappe-2"]').getAttribute('aria-pressed')) !== 'true') h.befund(`k${nr}: Etappen folgen der Pfeiltaste nicht`);
  }
  const um = seite.locator('[data-pruef="umschalter"]').first();
  if (await um.count() > 0) {
    const vorher = await um.locator('[data-pruef="umschalter-ansicht"]').innerText();
    await um.locator('[data-pruef="umschalter-rechts"]').focus();
    await seite.keyboard.press('Enter');
    if ((await um.locator('[data-pruef="umschalter-ansicht"]').innerText()) === vorher) h.befund(`k${nr}: Umschalter wechselt die Ansicht nicht`);
  }
  const so = seite.locator('[data-pruef="sortieren"]').first();
  if (await so.count() > 0) {
    await so.locator('[data-pruef="posten-1-links"]').focus();
    await seite.keyboard.press('Enter');
    if ((await so.locator('[data-pruef="posten-rueck-1"]').innerText()).trim() === '') h.befund(`k${nr}: Sortieren gibt keine Rückmeldung`);
  }
  const re = seite.locator('[data-pruef="regler-block"]').first();
  if (await re.count() > 0) {
    const vorher = await re.locator('[data-pruef="regler-karte"]').innerText();
    await re.locator('[data-pruef="regler"]').focus();
    await seite.keyboard.press('ArrowRight');
    if ((await re.locator('[data-pruef="regler-karte"]').innerText()) === vorher) h.befund(`k${nr}: Regler reagiert nicht auf die Pfeiltaste`);
  }
}
