// Browser-Szenario Einbettung (P10.6, E12): eine Hostseite bettet die Anwendung im iframe ein.
// Die Anwendung meldet „bereit“ und ihren Ort, folgt „gehe“, verweigert Regie/Leinwand und bleibt
// im Rahmen bedienbar (axe im Rahmen).
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const name = 'einbettung';
export const hash = '#start';
export const viewports = [{ breite: 1100, hoehe: 760 }];
/** Testherkunft für „gleiche Herkunft“ (reserviert nach RFC 6761), per seite.route aus dem Repo beantwortet (L-86) */
export const testHerkunft = 'http://mvg.test/';

const HOST = pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), 'einbettung-host.html')).href;

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  await seite.goto(HOST);
  const rahmen = seite.frameLocator('#mvg');
  await rahmen.locator('[data-pruef="start"], .startseite').first().waitFor({ timeout: 5000 });
  const warteAuf = async (/** @type {(n: any) => boolean} */ pruefe, /** @type {string} */ was) => {
    for (let i = 0; i < 40; i++) {
      const liste = await seite.evaluate(() => /** @type {any} */ (window).nachrichten);
      if (liste.some(pruefe)) return true;
      await h.warte(100);
    }
    h.befund(`Einbettung: keine Nachricht „${was}“`);
    return false;
  };
  await warteAuf((n) => n?.mvg === 'einbettung' && n.art === 'bereit' && typeof n.version === 'string', 'bereit');
  await warteAuf((n) => n?.art === 'ort' && n.hash === '#start', 'ort #start');
  const klasse = await seite.frames()[1]?.evaluate(() => document.body.classList.contains('ist-eingebettet'));
  if (klasse !== true) h.befund('Einbettung: body ohne Klasse ist-eingebettet');
  // gehe: Theorie Kapitel 4
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: '#theorie/k4' }));
  await rahmen.locator('[data-kapitel="4"] [data-pruef="lernseite"]').waitFor({ timeout: 5000 }).catch(() => h.befund('Einbettung: „gehe #theorie/k4“ nicht gefolgt'));
  await warteAuf((n) => n?.art === 'ort' && n.hash === '#theorie/k4' && n.flaeche === 'theorie', 'ort #theorie/k4');
  // Regie ist von außen nicht erreichbar
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: '#regie' }));
  await h.warte(400);
  if (await rahmen.locator('[data-pruef="regie"]').count() !== 0) h.befund('Einbettung: Host kann die Regie öffnen');
  // frage → ort
  const vorher = (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).length;
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'frage' }));
  await h.warte(300);
  const danach = await seite.evaluate(() => /** @type {any} */ (window).nachrichten);
  if (!danach.slice(vorher).some((/** @type {any} */ n) => n?.art === 'ort' && n.hash === '#theorie/k4')) h.befund('Einbettung: „frage“ bleibt ohne Antwort');
  // Sprung in die Story von einer anderen Fläche (P11.3 R4/R5): jede Ortsmeldung zur Station trägt die Fläche
  // „story“, und keine Meldung wiederholt die vorige
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: '#story' }));
  for (let i = 0; i < 5 && await rahmen.locator('[data-pruef="rolle-pl"]').filter({ visible: true }).count() === 0; i++) {
    const weiter = rahmen.locator('[data-pruef="weiter"]');
    if (await weiter.count() > 0 && await weiter.isEnabled()) await weiter.click();
    await h.warte(300);
  }
  await rahmen.locator('[data-pruef="rolle-pl"]').click().catch(() => h.befund('Einbettung: Rolle PL nicht wählbar'));
  await h.warte(300);
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: '#theorie/k4' }));
  await h.warte(400);
  const ab = (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).length;
  await seite.evaluate(() => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: '#story/a3' }));
  await warteAuf((n) => n?.art === 'ort' && n.hash === '#story/A3' && n.flaeche === 'story', 'ort #story/A3');
  const orte = (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).slice(ab).filter((/** @type {any} */ n) => n?.art === 'ort');
  if (orte.some((/** @type {any} */ n) => String(n.hash).startsWith('#story') && n.flaeche !== 'story')) h.befund(`Einbettung: Ortsmeldung mit falscher Fläche ${JSON.stringify(orte)}`);
  if (orte.some((/** @type {any} */ n, /** @type {number} */ i) => i > 0 && JSON.stringify(n) === JSON.stringify(orte[i - 1]))) h.befund(`Einbettung: doppelte Ortsmeldung ${JSON.stringify(orte)}`);
  // Höhe (P12, Owner: Einbettung ohne Springen): der Rahmen folgt dem Inhalt, innen keine Scrollleiste;
  // die Story meldet „feste Höhe“ (null); kürzere Seiten lassen den Rahmen wieder schrumpfen
  const rahmenHoehe = async () => seite.evaluate(() => document.getElementById('mvg')?.getBoundingClientRect().height ?? 0);
  const innenScroll = async () => seite.frames()[1]?.evaluate(() => document.documentElement.scrollHeight - document.documentElement.clientHeight) ?? 0;
  const letzteHoehe = async () => (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).filter((/** @type {any} */ n) => n?.art === 'hoehe').at(-1)?.px;
  const geheUndWarte = async (/** @type {string} */ ziel) => {
    await seite.evaluate((z) => /** @type {any} */ (window).schicke({ mvg: 'einbettung', art: 'gehe', ziel: z }), ziel);
    await h.warte(900);
  };
  await geheUndWarte('#theorie/k4');
  const k4 = await letzteHoehe();
  if (typeof k4 !== 'number' || k4 < 1500) h.befund(`Einbettung: Lernseite meldet keine Inhaltshöhe (${k4})`);
  if (Math.abs((await rahmenHoehe()) - (k4 ?? 0)) > 3) h.befund(`Einbettung: Rahmen ${await rahmenHoehe()} px folgt der gemeldeten Höhe ${k4} nicht`);
  if ((await innenScroll()) > 2) h.befund(`Einbettung: Lernseite scrollt im Rahmen (${await innenScroll()} px)`);
  await geheUndWarte('#start');
  const start = await letzteHoehe();
  if (typeof start !== 'number' || start >= (k4 ?? 0)) h.befund(`Einbettung: Rahmen schrumpft nach der Lernseite nicht (Start ${start}, Kap. 4 ${k4})`);
  if ((await innenScroll()) > 2) h.befund(`Einbettung: Startseite scrollt im Rahmen (${await innenScroll()} px)`);
  // Startseite: gleiche Höhe, egal von wo man kommt (keine Rückkopplung über vh, P12.5 R3)
  await geheUndWarte('#story');
  if ((await letzteHoehe()) !== null) h.befund(`Einbettung: Story meldet keine feste Höhe (${await letzteHoehe()})`);
  if ((await innenScroll()) > 2) h.befund(`Einbettung: Story scrollt im Rahmen (${await innenScroll()} px)`);
  await geheUndWarte('#start');
  if (Math.abs((await letzteHoehe()) - (start ?? 0)) > 3) h.befund(`Einbettung: Startseite ändert ihre Höhe je nach Herkunft (${start} → ${await letzteHoehe()})`);
  // Absatz-Link: die Hostseite rollt zum Absatz (Meldung „ziel“)
  const zieleVorher = (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).filter((/** @type {any} */ n) => n?.art === 'ziel').length;
  await geheUndWarte('#theorie/k4/k4.2-p3');
  // Lage des Absatzes im Fenster der Hostseite: Rahmenoberkante (Host) + Lage im Rahmen (Rahmen).
  // Die Hostseite rollt sanft (behavior: smooth): erst die Meldung „ziel“ abwarten, dann bis die Lage steht
  for (let i = 0; i < 30; i++) {
    const n = (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).filter((/** @type {any} */ x) => x?.art === 'ziel').length;
    if (n > zieleVorher) break;
    await h.warte(100);
  }
  const lageJetzt = async () => {
    const innenY = await seite.frames()[1]?.evaluate(() => document.querySelector('[data-absatz="k4.2-p3"]')?.getBoundingClientRect().top ?? null);
    const rahmenY = await seite.evaluate(() => document.getElementById('mvg')?.getBoundingClientRect().top ?? 0);
    return innenY === null || innenY === undefined ? null : rahmenY + innenY;
  };
  let lage = await lageJetzt();
  for (let i = 0; i < 30; i++) {
    await h.warte(100);
    const neu = await lageJetzt();
    if (neu === lage) break;
    lage = neu;
  }
  if (lage === null || lage < -20 || lage > 400) h.befund(`Einbettung: Absatz k4.2-p3 nicht im Bild (Lage ${lage})`);
  // Vergrößern eingebettet (P12.5 R11/R12): der Dialog öffnet an seiner Figur, die Hostseite rollt dorthin;
  // er passt ins Fenster der Hostseite, „Schließen“ bleibt sichtbar – für Abbildungen und die Grafiken der Hilfe
  const pruefeDialog = async (/** @type {string} */ ziel, /** @type {string} */ knopfSel, /** @type {string} */ dialogSel, /** @type {string} */ name) => {
    await geheUndWarte(ziel);
    const knopf = rahmen.locator(knopfSel).first();
    if (await knopf.count() === 0) { h.befund(`Einbettung: kein Knopf „Vergrößern“ (${name})`); return; }
    // R18: erst auf die neue Meldung „ziel“ warten, dann rollt die Hostseite – sonst misst die Prüfung zu früh
    const zieleZahl = async () => (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).filter((/** @type {any} */ n) => n?.art === 'ziel').length;
    const zieleVor = await zieleZahl();
    await knopf.click();
    for (let i = 0; i < 30 && (await zieleZahl()) <= zieleVor; i++) await h.warte(100);
    await rahmen.locator(`${dialogSel}[open]`).waitFor({ timeout: 3000 }).catch(() => h.befund(`Einbettung: ${name}-Dialog öffnet nicht`));
    const lageDialog = async () => {
      const innen = await seite.frames()[1]?.evaluate((sel) => {
        const d = document.querySelector(`${sel}[open]`);
        const k = d?.querySelector('button');
        if (!d || !k) return null;
        return { oben: d.getBoundingClientRect().top, unten: d.getBoundingClientRect().bottom, knopfOben: k.getBoundingClientRect().top, knopfUnten: k.getBoundingClientRect().bottom };
      }, dialogSel);
      const oben = await seite.evaluate(() => document.getElementById('mvg')?.getBoundingClientRect().top ?? 0);
      return innen === null || innen === undefined ? null
        : { oben: oben + innen.oben, unten: oben + innen.unten, knopfOben: oben + innen.knopfOben, knopfUnten: oben + innen.knopfUnten };
    };
    let lageD = await lageDialog();
    let gleich = 0;
    for (let i = 0; i < 40 && gleich < 2; i++) {
      await h.warte(100);
      const neu = await lageDialog();
      gleich = neu?.oben === lageD?.oben ? gleich + 1 : 0;
      lageD = neu;
    }
    const fensterH = await seite.evaluate(() => window.innerHeight);
    if (lageD === null || lageD.oben < -20 || lageD.oben > 400) h.befund(`Einbettung: ${name}-Dialog außerhalb des sichtbaren Bereichs (Lage ${lageD?.oben})`);
    else {
      if (lageD.unten > fensterH + 1) h.befund(`Einbettung: ${name}-Dialog ragt unter das Fenster der Hostseite (${Math.round(lageD.unten)} > ${fensterH})`);
      if (lageD.knopfOben < 0 || lageD.knopfUnten > fensterH) h.befund(`Einbettung: „Schließen“ im ${name}-Dialog nicht sichtbar`);
      // R14: das Mausrad über dem Dialog rollt nur ihn – auch am Ende nicht die Hostseite mit
      const breiteH = await seite.evaluate(() => window.innerWidth);
      await seite.mouse.move(breiteH / 2, (lageD.oben + Math.min(lageD.unten, fensterH)) / 2);
      for (let i = 0; i < 6; i++) { await seite.mouse.wheel(0, 150); await h.warte(60); }
      await h.warte(300);
      const nachRad = await lageDialog();
      if (nachRad === null || nachRad.knopfOben < 0) h.befund(`Einbettung: Mausrad über dem ${name}-Dialog rollt die Hostseite mit („Schließen“ bei ${nachRad?.knopfOben})`);
      // R15: Rolltasten ebenso
      await rahmen.locator(`${dialogSel}[open] button`).first().focus();
      for (const taste of ['PageDown', 'PageDown', 'End', 'ArrowDown']) { await seite.keyboard.press(taste); await h.warte(60); }
      await h.warte(300);
      const nachTasten = await lageDialog();
      if (nachTasten === null || nachTasten.knopfOben < 0) h.befund(`Einbettung: Rolltasten im ${name}-Dialog rollen die Hostseite mit („Schließen“ bei ${nachTasten?.knopfOben})`);
    }
    await rahmen.locator(`${dialogSel}[open] button`).first().click().catch(() => h.befund(`Einbettung: „Schließen“ nicht erreichbar (${name})`));
    await h.warte(100);
    if (await rahmen.locator(`${dialogSel}[open]`).count() !== 0) h.befund(`Einbettung: ${name}-Dialog schließt nicht`);
  };
  // k4 und k10 tragen die höchsten Abbildungen der Lernseiten (abb-6, abb-14)
  await pruefeDialog('#theorie/k4', '.lern-inhalt [data-pruef="abbildung-gross"]', 'dialog.abbildung-dialog', 'Abbildungs');
  await pruefeDialog('#theorie/k10', '.lern-inhalt [data-pruef="abbildung-gross"]', 'dialog.abbildung-dialog', 'Abbildungs');
  await pruefeDialog('#hilfe/mvg-vorgehensmodell', '[data-pruef="grafik-gross"]', 'dialog.hilfe-grafik-dialog', 'Hilfe-Grafik');
  await geheUndWarte('#story');
  const grund = await seite.frames()[1]?.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--grund').trim());
  if (grund !== '#ffffff') h.befund(`Einbettung: Hintergrund der Hostseite nicht übernommen (${grund})`);
  await h.axe('einbettung-hoehe');
  await h.bild('einbettung');
  // Auch über die Adresse des Rahmens gibt es keine Regie und keine Leinwand
  for (const ziel of ['#regie', '#leinwand']) {
    await seite.evaluate((z) => { /** @type {HTMLIFrameElement} */ (document.getElementById('mvg')).src = `../../dist/mvg.html${z}`; }, ziel);
    await h.warte(800);
    const im = await rahmen.locator('[data-pruef="regie"], [data-pruef="leinwand"]').count();
    const start = await rahmen.locator('.startseite').count();
    if (im !== 0 || start !== 1) h.befund(`Einbettung: Rahmen mit ${ziel} zeigt Regie/Leinwand (${im}) statt Startseite (${start})`);
  }
  // Fremde Herkunft ohne gemeldete Fensterhöhe, niedriges Hostfenster (R17): der Dialog (640 px) ragt unter das Fenster; das Mausrad
  // rollt am Ende des Dialogs die Hostseite weiter, bis seine Unterkante sichtbar ist
  const groesseAlt = seite.viewportSize();
  await seite.setViewportSize({ width: 1100, height: 560 });
  await seite.goto(`${HOST}?ohne-fenster`);
  await h.warte(1500);
  await geheUndWarte('#theorie/k4');
  await rahmen.locator('.lern-inhalt [data-pruef="abbildung-gross"]').first().click();
  await rahmen.locator('dialog.abbildung-dialog[open]').waitFor({ timeout: 3000 }).catch(() => h.befund('Einbettung (fremd, 560 px): Dialog öffnet nicht'));
  await h.warte(800);
  await seite.mouse.move(550, 300);
  for (let i = 0; i < 20; i++) { await seite.mouse.wheel(0, 150); await h.warte(50); }
  await h.warte(400);
  const unterkante = await seite.frames()[1]?.evaluate(() => document.querySelector('dialog.abbildung-dialog[open]')?.getBoundingClientRect().bottom ?? null);
  const rahmenOben = await seite.evaluate(() => document.getElementById('mvg')?.getBoundingClientRect().top ?? 0);
  if (unterkante === null || unterkante === undefined || rahmenOben + unterkante > 561) h.befund(`Einbettung (fremd, 560 px): Unterkante des Dialogs bleibt unerreichbar (${unterkante === null || unterkante === undefined ? '–' : Math.round(rahmenOben + unterkante)} px)`);
  // R19: … aber nicht darüber hinaus
  else if (rahmenOben + unterkante < 500) h.befund(`Einbettung (fremd, 560 px): Mausrad rollt die Hostseite über die Unterkante des Dialogs hinaus (${Math.round(rahmenOben + unterkante)} px)`);
  // R18: Rolltasten am Dialogende rollen die Hostseite nur bis zur Kante – Ende, dann Pos1 lassen „Schließen“ erreichbar
  const lageTasten = async () => {
    const k = await seite.frames()[1]?.evaluate(() => {
      const d = document.querySelector('dialog.abbildung-dialog[open]');
      const b = d?.querySelector('button');
      return d && b ? { unten: d.getBoundingClientRect().bottom, knopf: b.getBoundingClientRect().top } : null;
    });
    const o = await seite.evaluate(() => document.getElementById('mvg')?.getBoundingClientRect().top ?? 0);
    return k === null || k === undefined ? null : { unten: o + k.unten, knopf: o + k.knopf };
  };
  await rahmen.locator('dialog.abbildung-dialog[open] button').first().focus();
  // R20: ein einziger Druck auf Ende bzw. Pos1 genügt
  for (const taste of ['End']) { await seite.keyboard.press(taste); await h.warte(80); }
  await h.warte(300);
  const nachEnde = await lageTasten();
  if (nachEnde === null || nachEnde.unten < 500 || nachEnde.unten > 561) h.befund(`Einbettung (fremd, 560 px): Ende rollt die Hostseite nicht genau bis zur Unterkante des Dialogs (${nachEnde === null ? '–' : Math.round(nachEnde.unten)} px)`);
  for (const taste of ['Home']) { await seite.keyboard.press(taste); await h.warte(80); }
  await h.warte(300);
  const nachPos1 = await lageTasten();
  if (nachPos1 === null || nachPos1.knopf < -1 || nachPos1.knopf > 80) h.befund(`Einbettung (fremd, 560 px): Pos1 holt „Schließen“ nicht an den oberen Rand (${nachPos1 === null ? '–' : Math.round(nachPos1.knopf)} px)`);
  // R19: die Leertaste auf „Schließen“ schließt auch hier
  await rahmen.locator('dialog.abbildung-dialog[open] button').first().focus();
  await seite.keyboard.press('Space');
  await h.warte(200);
  if (await rahmen.locator('dialog.abbildung-dialog[open]').count() !== 0) { h.befund('Einbettung (fremd, 560 px): Leertaste auf „Schließen“ schließt nicht'); await seite.keyboard.press('Escape'); }
  // R19: mit gemeldeter Fensterhöhe (Testhost ohne Schalter) passt der Dialog bei 560 px ins Fenster – der Rückfall 640 px täte es nicht
  await seite.goto(HOST);
  await h.warte(1500);
  await pruefeDialog('#theorie/k4', '.lern-inhalt [data-pruef="abbildung-gross"]', 'dialog.abbildung-dialog', 'Abbildungs (Fenster gemeldet, 560 px)');
  const rollfreiMitMeldung = await seite.frames()[1]?.evaluate(() => document.querySelector('dialog.abbildung-dialog')?.getAttribute('data-rollfrei'));
  if (rollfreiMitMeldung !== 'nein') h.befund(`Einbettung: trotz gemeldeter Fensterhöhe data-rollfrei=„${rollfreiMitMeldung}“`);
  // R19: ohne Meldung, Dialog passt ganz (760 px, Hilfe-Grafik): ein Radschritt verschiebt ihn nicht, die Leertaste schließt
  await seite.setViewportSize({ width: 1100, height: 760 });
  await seite.goto(`${HOST}?ohne-fenster`);
  await h.warte(1500);
  await geheUndWarte('#hilfe/mvg-vorgehensmodell');
  const zieleH = (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).filter((/** @type {any} */ n) => n?.art === 'ziel').length;
  await rahmen.locator('[data-pruef="grafik-gross"]').first().click();
  for (let i = 0; i < 30 && (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).filter((/** @type {any} */ n) => n?.art === 'ziel').length <= zieleH; i++) await h.warte(100);
  await h.warte(1200);
  const obenH = async () => {
    const i = await seite.frames()[1]?.evaluate(() => document.querySelector('dialog.hilfe-grafik-dialog[open]')?.getBoundingClientRect().top ?? null);
    const o = await seite.evaluate(() => document.getElementById('mvg')?.getBoundingClientRect().top ?? 0);
    return i === null || i === undefined ? null : Math.round(o + i);
  };
  const vorRad = await obenH();
  await seite.mouse.move(550, (vorRad ?? 100) + 100);
  await seite.mouse.wheel(0, 120);
  await h.warte(400);
  const nachRadH = await obenH();
  if (vorRad === null || nachRadH === null || Math.abs(nachRadH - vorRad) > 1) h.befund(`Einbettung (ohne Meldung): ein Radschritt verschiebt den passenden Hilfe-Dialog (${vorRad} → ${nachRadH})`);
  await rahmen.locator('dialog.hilfe-grafik-dialog[open] button').first().focus();
  await seite.keyboard.press('Space');
  await h.warte(200);
  if (await rahmen.locator('dialog.hilfe-grafik-dialog[open]').count() !== 0) { h.befund('Einbettung (ohne Meldung): Leertaste auf „Schließen“ schließt den Hilfe-Dialog nicht'); await seite.keyboard.press('Escape'); }
  // R20: ohne Meldung rollt ein Rad neben dem Dialog die Hostseite höchstens bis zur Dialogkante (400×800, abb-6 rollt selbst)
  await seite.setViewportSize({ width: 400, height: 800 });
  await seite.goto(`${HOST}?ohne-fenster`);
  await h.warte(1500);
  await geheUndWarte('#theorie/k4');
  const zieleN = (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).filter((/** @type {any} */ n) => n?.art === 'ziel').length;
  await rahmen.locator('.lern-inhalt [data-pruef="abbildung-gross"]').first().click();
  for (let i = 0; i < 30 && (await seite.evaluate(() => /** @type {any} */ (window).nachrichten)).filter((/** @type {any} */ n) => n?.art === 'ziel').length <= zieleN; i++) await h.warte(100);
  await h.warte(1200);
  const lageN = async () => {
    const i = await seite.frames()[1]?.evaluate(() => { const d = document.querySelector('dialog.abbildung-dialog[open]'); if (!d) return null; const r = d.getBoundingClientRect(); return { oben: r.top, unten: r.bottom, links: r.left, rollt: d.scrollHeight > d.clientHeight }; });
    const o = await seite.evaluate(() => { const r = document.getElementById('mvg')?.getBoundingClientRect(); return { oben: r?.top ?? 0, links: r?.left ?? 0 }; });
    return i === null || i === undefined ? null : { oben: o.oben + i.oben, unten: o.oben + i.unten, links: o.links + i.links, rollt: i.rollt };
  };
  const vorN = await lageN();
  if (vorN === null || !vorN.rollt) h.befund('Einbettung (ohne Meldung, 400 px): Probe „Dialog rollt selbst“ nicht hergestellt');
  else {
    await seite.mouse.move(Math.max(1, vorN.links - 4), (vorN.oben + Math.min(vorN.unten, 800)) / 2);
    for (let i = 0; i < 6; i++) { await seite.mouse.wheel(0, 150); await h.warte(60); }
    await h.warte(400);
    const nachN = await lageN();
    if (nachN === null || nachN.oben < -1 || nachN.unten > 801) h.befund(`Einbettung (ohne Meldung): Mausrad neben dem Dialog rollt die Hostseite über die Dialogkante hinaus (oben ${nachN === null ? '–' : Math.round(nachN.oben)} px)`);
  }
  await seite.keyboard.press('Escape');
  if (groesseAlt !== null) await seite.setViewportSize(groesseAlt);
  // Gleiche Herkunft (R14): über http://mvg.test geladen misst der Rahmen das Hostfenster (L-83); bei 560 px
  // Höhe muss der Dialog darin bleiben – der Rückfall für fremde Herkunft (640 px) täte es nicht
  const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  await seite.route('http://mvg.test/**', (r) => r.fulfill({ path: path.join(wurzel, decodeURIComponent(new URL(r.request().url()).pathname)) }));
  const groesseVorher = seite.viewportSize();
  await seite.setViewportSize({ width: 1100, height: 560 });
  await seite.goto('http://mvg.test/tests/oberflaeche/einbettung-host.html');
  await h.warte(1500);
  await pruefeDialog('#theorie/k4', '.lern-inhalt [data-pruef="abbildung-gross"]', 'dialog.abbildung-dialog', 'Abbildungs (gleiche Herkunft)');
  if (groesseVorher !== null) await seite.setViewportSize(groesseVorher);
}
