// Browser-Szenario Theorie (P6.15): jede Lernseite Kap. 1–13 mit allen aufgeklappten Ebenen und Tafeln –
// Layout (kein Seitwärtsscrollen), axe, Kontrast der Zitate (axe greift wegen ::before nicht) und
// Tastatur-Erreichbarkeit breiter Tabellen. Läuft mit reduzierter Bewegung (prefers-reduced-motion):
// die Tafeln erscheinen sofort, und die Seite beendet ihre Animationen (STIL, P2-Befund V6).
// Schnell: alle Seiten bei 1280 und 400; voll zusätzlich 1024.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kontrastQuellen, pruefeLayout } from './hilfen.mjs';

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
        await h.warte(100);
        const kurz = await seite.evaluate(() => { const d = document.querySelector('dialog.abbildung-dialog[open]'); return d ? d.scrollHeight <= d.clientHeight && d.scrollWidth <= d.clientWidth : false; });
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
  }));
  if (druck.bogen === 'none' || druck.seite !== 'none' || !/^Kapitel 8 · /u.test(druck.titel) || druck.zitieren > 0) h.befund(`Druckbogen: ${JSON.stringify(druck)}`);
  // nichts im Bogen ragt über den Satzspiegel hinaus (A4 mit 14 mm Rand ≈ 688 px breit)
  const vorher = seite.viewportSize() ?? { width: 1280, height: 720 };
  await seite.setViewportSize({ width: 688, height: vorher.height });
  await h.warte(150);
  const ueber = await seite.evaluate(() => {
    const bogen = document.querySelector('.druck-bogen');
    const rechts = bogen?.getBoundingClientRect().right ?? 0;
    return [...(bogen?.querySelectorAll('*') ?? [])].filter((el) => el.getBoundingClientRect().right > rechts + 2).length;
  });
  if (ueber > 0) h.befund(`Druckbogen: ${ueber} Elemente ragen über den Satzspiegel`);
  await seite.setViewportSize(vorher);
  const pdf = await seite.pdf({ format: 'A4' });
  const seiten = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/gu) ?? []).length;
  if (seiten < 2 || seiten > 40) h.befund(`Druck Kapitel 8: ${seiten} Seiten`);
  await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
  if (await seite.locator('.druck-bogen').count() !== 0) h.befund('Druckbogen bleibt nach dem Druck stehen');
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
