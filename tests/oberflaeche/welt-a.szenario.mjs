// Browser-Szenario Welt A (P3.8-Abnahme, L-29): in dist/mvg.html (seit P5.10 der ganze Entscheidungsgraph)
// spielt jede Rolle vom Prolog bis zum Wendepunkt; an jeder Station Layout-Prüfung und axe.
// Bei 1280×720 alle sechs Rollen, in den anderen Größen die Bauherren-PL (Laufzeit der Kette).
// Vertiefung je Interesse (P3.9): die PL wählt „Kosten“ und „Risiko“ und sieht an jedem Ebenen-Schritt
// genau diese beiden Karten; die anderen Rollen wählen nichts und sehen keine.

import { mittelbreit, pruefeLayout, pruefer, rueckfallTabellenstand, schmal } from './hilfen.mjs';

export const name = 'welt-a';
export const hash = '#story';

const STATIONEN = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  // voll: bei 1280 alle sechs Rollen; schnell (vor jedem Commit, L-44): überall die Bauherren-PL
  const rollen = h.voll && h.viewport.breite === 1280 ? ['gf', 'bauherr', 'pl', 'ps', 'planung', 'controlling'] : ['pl'];
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
        await schmal(seite, h, `${rolle}/${st}`);
        await mittelbreit(seite, h, `${rolle}/${st}`);
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
      // R49 (Architektur): Excel-Stand im Lagebild von Welt A (A1) auch ohne Container-Einheiten
      if (rolle === 'pl' && !gesehen.has(`${st}-tabellenstand`) && await seite.locator('.tabellenstand').filter({ visible: true }).count() > 0) {
        gesehen.add(`${st}-tabellenstand`);
        await rueckfallTabellenstand(seite, h, `${st}-tabellenstand`);
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
  const pruefe = pruefer(seite, h);
  const weiter = async () => { await h.klick('[data-pruef="weiter"]'); await h.warte(300); };
  await weiter();
  // Radar: die PL hat A1–A6 gespielt → alle acht Symptome erlebt
  await h.erwarte('[data-pruef="tafel-radar"]');
  if (await seite.locator('[data-pruef="status"]').filter({ visible: true }).count() > 0) h.befund('Wendepunkt zeigt Statusinstrumente (DREHBUCH: kein Status)');
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
  // Mandatsleiter als Muster (k4.2-p3), Beträge aus Welt A
  await h.erwarte('[data-pruef="zitat"]');
  await pruefe('wendepunkt-mandat');
  await weiter();
  // Pyramide und Felder liegen seit P11.3 in den Ebenen 2 und 3 des Schritts „Tiefer gehen“ (DREHBUCH: Wendepunkt kurz)
  await h.erwarte('[data-pruef="ebene-1"]');
  await h.klick('[data-pruef="ebene-knopf-2"]');
  await h.erwarte('[data-pruef="tafel-pyramide"]');
  await h.klick('[data-pruef="stufe-1"]');
  await pruefe('wendepunkt-pyramide');
  await h.klick('[data-pruef="ebene-knopf-3"]');
  await h.erwarte('[data-pruef="tafel-felder"]');
  await h.klick('[data-pruef="felder-ordnung"]');
  if ((await seite.locator('.feld-karte[data-zustand="ordnung"]').count()) !== 6) h.befund('Felder: nicht alle sechs auf „Ordnung“');
  await pruefe('wendepunkt-felder');
  await weiter();
  if ((await station()) !== 'rueckspulen') h.befund(`Rückspulen nicht erreicht (steht in ${await station()})`);
  // Zeitleiste läuft zurück auf Monat 0 (P4.6)
  await h.erwarte('.spule.ist-zurueck');
  await h.warte(3200);
  const monat = (await seite.locator('.spule-monat').innerText()).trim();
  if (monat !== 'Monat 0') h.befund(`Rückspulen: Zähler steht auf „${monat}“ statt „Monat 0“`);
  await pruefe('rueckspulen-zeitleiste');
  await weiter();
  await h.erwarte('[data-pruef="tafel-bausteine"]');
  if ((await seite.locator('.baustein-karte').count()) !== 8) h.befund('Rückspulen: nicht acht Bausteine');
  await seite.locator('[data-pruef="baustein-1"] summary').click();
  await h.warte(2000);
  await pruefe('rueckspulen-bausteine');
  await weiter();
  await h.erwarte('[data-pruef="zitat"]');
  await pruefe('rueckspulen-lph0');
  await weiter();
  // Welt B spielt das Szenario „welt-b“ (alle Rollen, ab einem gespeicherten Stand vor B1)
  if ((await station()) !== 'B1') h.befund(`nach dem Rückspulen nicht in B1 (steht in ${await station()})`);
}

