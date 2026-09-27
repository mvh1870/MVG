// Browser-Szenario Welt A (P3.8-Abnahme, L-29): auf der Entwurfs-Vorschau (ganzer Entscheidungsgraph)
// spielt jede Rolle vom Prolog bis zum Wendepunkt; an jeder Station Layout-Prüfung und axe.
// Bei 1280×720 alle sechs Rollen, in den anderen Größen die Bauherren-PL (Laufzeit der Kette).
// Vertiefung je Interesse (P3.9): die PL wählt „Kosten“ und „Risiko“ und sieht an jedem Ebenen-Schritt
// genau diese beiden Karten; die anderen Rollen wählen nichts und sehen keine.

export const name = 'welt-a';
export const seite = 'tmp/mvg-entwurf.html';
export const hash = '#story';

const STATIONEN = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];

/** Läuft im Browser: horizontales Scrollen und abgeschnittener Text (wie im Durchstich-Szenario). */
function pruefeLayout() {
  const funde = [];
  const d = document.documentElement;
  if (d.scrollWidth > d.clientWidth) funde.push(`horizontales Scrollen: ${d.scrollWidth} > ${d.clientWidth}`);
  for (const el of document.body.querySelectorAll('*')) {
    if (!(el instanceof HTMLElement)) continue;
    const st = getComputedStyle(el);
    if (st.overflowX !== 'hidden' && st.overflowX !== 'clip') continue;
    if (st.display === 'none' || st.visibility !== 'visible') continue;
    if (el.closest('[data-pruef-erlaubt~="abschneiden"]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 2 || r.height <= 2) continue;
    const text = (el.textContent ?? '').trim();
    if (text === '') continue;
    const eigenerText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim() !== '');
    const nurInline = [...el.children].every((k) => getComputedStyle(k).display.startsWith('inline'));
    if (!eigenerText && !nurInline) continue;
    if (el.scrollWidth > el.clientWidth + 1) funde.push(`abgeschnitten: ${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')} „${text.slice(0, 40)}“`);
  }
  return funde;
}

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const rollen = h.viewport.breite === 1280 ? ['gf', 'bauherr', 'pl', 'ps', 'planung', 'controlling'] : ['pl'];
  const station = async () => (await seite.evaluate(() => location.hash)).replace(/^#story\//u, '');
  let erste = true;
  for (const rolle of rollen) {
    if (!erste) {
      await h.klick('[data-pruef="seitenleiste-raum"]');
      await h.klick('[data-pruef="neustart"]');
      await h.taste('Escape');
    }
    erste = false;
    await h.erwarte('[data-pruef="weiter"]');
    if (await seite.locator(`[data-pruef="rolle-${rolle}"]`).filter({ visible: true }).count() === 0) await h.klick('[data-pruef="weiter"]');
    await h.klick(`[data-pruef="rolle-${rolle}"]`);
    await h.erwarte('[data-pruef^="interesse-"]');
    const interessen = rolle === 'pl' ? ['kosten', 'risiko'] : [];
    for (const i of interessen) await h.klick(`[data-pruef="interesse-${i}"]`);
    await h.klick('[data-pruef="weiter"]');
    const gesehen = new Set();
    const vertieft = new Set();
    for (let i = 0; i < 120; i++) {
      const st = await station();
      if (st === 'wendepunkt') break;
      if (STATIONEN.includes(st) && !gesehen.has(st)) {
        gesehen.add(st);
        await h.warte(900);
        // Der erzählende Einstieg ist sichtbar (P3.8, D1) und knapp (≤ 80 Wörter, D8)
        const einstieg = seite.locator('[data-pruef="einstieg-text"]').filter({ visible: true });
        if (await einstieg.count() === 0) h.befund(`${rolle}/${st}: Einstiegstext nicht sichtbar`);
        else {
          const woerter = (await einstieg.first().innerText()).split(/\s+/u).filter(Boolean).length;
          if (woerter > 90) h.befund(`${rolle}/${st}: Einstiegstext ${woerter} Wörter (Richtwert ≤ 80)`);
        }
        for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${rolle}/${st}: ${fund}`);
        await h.axe(`${rolle}/${st}`);
        if (rolle === 'pl') await h.bild(`${st}-einstieg`);
      }
      if (STATIONEN.includes(st) && !vertieft.has(st) && await seite.locator('[data-pruef="ebene-1"]').filter({ visible: true }).count() > 0) {
        vertieft.add(st);
        const da = await seite.locator('[data-pruef^="vertiefung-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-pruef')));
        const soll = interessen.map((i) => `vertiefung-${i}`);
        if (da.join(',') !== soll.join(',')) h.befund(`${rolle}/${st}: Vertiefungen ${da.join(',') || 'keine'} statt ${soll.join(',') || 'keine'}`);
        if (interessen.length > 0) {
          for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${rolle}/${st} Vertiefung: ${fund}`);
          await h.axe(`${rolle}/${st}/vertiefung`);
          await h.bild(`${st}-vertiefung`);
        }
      }
      const optionA = seite.locator('[data-pruef="option-A"]').filter({ visible: true });
      if (await optionA.count() > 0 && (await optionA.first().getAttribute('aria-pressed')) !== 'true') {
        await optionA.first().click();
        await h.warte(700);
        await h.erwarte('[data-pruef="konsequenz"]');
        if (rolle === 'pl') await h.bild(`${st}-konsequenz`);
      }
      await h.klick('[data-pruef="weiter"]');
      await h.warte(120);
    }
    for (const st of STATIONEN) if (!vertieft.has(st)) h.befund(`${rolle}: Ebenen-Schritt in ${st} nicht gesehen`);
    for (const st of STATIONEN) if (!gesehen.has(st)) h.befund(`${rolle}: Station ${st} nicht erreicht (Weg bis ${await station()})`);
    if ((await station()) !== 'wendepunkt') h.befund(`${rolle}: Wendepunkt nicht erreicht (steht in ${await station()})`);
    if (rolle === 'pl') await wendepunkt(seite, h, station);
  }
}

/**
 * Wendepunkt und Rückspulen (P4, L-32): jede Tafel bedienen, Layout + axe, Bilder.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {() => Promise<string>} station
 */
async function wendepunkt(seite, h, station) {
  const pruefe = async (name) => {
    // wie beim Betreten des Schritts: oben (sonst liegt der zuletzt geklickte Knopf halb unter der Fußleiste)
    await seite.evaluate(() => window.scrollTo(0, 0));
    for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${name}: ${fund}`);
    await h.axe(name);
    await h.bild(name);
  };
  const weiter = async () => { await h.klick('[data-pruef="weiter"]'); await h.warte(300); };
  await weiter();
  // Radar: die PL hat A1–A6 gespielt → alle acht Symptome erlebt
  await h.erwarte('[data-pruef="tafel-radar"]');
  const erlebt = await seite.locator('.radar-knopf.ist-erlebt').count();
  if (erlebt !== 8) h.befund(`Radar: ${erlebt} von 8 Symptomen als erlebt markiert (erwartet 8 nach A1–A6)`);
  await h.klick('[data-pruef="symptom-4"]');
  await h.erwarte('.tafel-auswahl .tafel-detail');
  await pruefe('wendepunkt-radar');
  await weiter();
  await h.erwarte('[data-pruef="tafel-ketten"]');
  await h.klick('[data-pruef="ausloeser-8"]');
  await h.warte(900);
  if ((await seite.locator('.wirkungskette li').count()) !== 3) h.befund('Wirkungskette: nicht drei Glieder');
  await pruefe('wendepunkt-ketten');
  await weiter();
  await h.erwarte('[data-pruef="tafel-schwelle"]');
  await seite.locator('[data-pruef="aufgabe-1"] .schwelle-knopf').first().click();
  await h.erwarte('[data-pruef="aufgabe-1"][data-ergebnis]');
  await h.klick('[data-pruef="schwelle-aufloesen"]');
  const stand = await seite.locator('[data-pruef="schwelle-stand"]').innerText();
  const [r, , g] = (stand.match(/\d+/gu) ?? []).map(Number);
  if (r === undefined || r !== g) h.befund(`Schwelle: nach „Alle zeigen“ nicht alles richtig („${stand}“)`);
  await pruefe('wendepunkt-schwelle');
  await weiter();
  await h.erwarte('[data-pruef="tafel-pyramide"]');
  await h.klick('[data-pruef="stufe-1"]');
  await pruefe('wendepunkt-pyramide');
  await weiter();
  await h.erwarte('[data-pruef="tafel-felder"]');
  await h.klick('[data-pruef="felder-ordnung"]');
  if ((await seite.locator('.feld-karte[data-zustand="ordnung"]').count()) !== 6) h.befund('Felder: nicht alle sechs auf „Ordnung“');
  await pruefe('wendepunkt-felder');
  await weiter();
  if ((await station()) !== 'rueckspulen') h.befund(`Rückspulen nicht erreicht (steht in ${await station()})`);
  await weiter();
  await h.erwarte('[data-pruef="tafel-bausteine"]');
  if ((await seite.locator('.baustein-karte').count()) !== 8) h.befund('Rückspulen: nicht acht Bausteine');
  await seite.locator('[data-pruef="baustein-1"] summary').click();
  await h.warte(2000);
  await pruefe('rueckspulen-bausteine');
  await weiter();
  await h.erwarte('[data-pruef="zitat"]');
  await pruefe('rueckspulen-lph0');
}
