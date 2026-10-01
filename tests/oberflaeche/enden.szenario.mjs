// Browser-Szenario Enden (P7.7): Die drei Enden und der Epilog in schmalen Größen. Der Stand vor dem Ende
// kommt von der Engine (Reducer, L-43): Bauherren-PL, überall A, in A6 C, in der Wirklichkeit A, B oder C
// (L-48: A → steuerbar, B → Auflagen, C → Neufestlegung). Je Schritt Layout, axe, Quellen-Kontrast;
// Nachweiskette per Tastatur, Selbstdiagnose ganz markiert, Explore-Weg an der Story-Karte.
// Schnell: ende-steuerbar bei 400; voll (L-44): alle drei Enden bei 400 und 1024. Bei 1280 läuft der
// Express-Pfad in welt-b-2 bis in den Epilog.
import { inhalte as modell } from '../../src/inhalte/index.ts';
import { anfangszustand } from '../../src/engine/zustand.ts';
import { wende } from '../../src/engine/aktionen.ts';
import { aktuellerSchritt } from '../../src/engine/graph.ts';
import { speichere, SPEICHER_SCHLUESSEL } from '../../src/engine/speicher.ts';
import { pruefeLayout, pruefer, rollbarOhneTastatur } from './hilfen.mjs';
import { pdfSeiten, seitenMitUeberschriftAmEnde, wortbrueche } from './pdf.mjs';

export const name = 'enden';
export const hash = '#story';

const FAELLE = [['A', 'ende-steuerbar'], ['B', 'ende-auflagen'], ['C', 'ende-neufestlegung']];

/** Gespeicherter Stand, der im Ende `ziel` steht (Wahl `wahl` in der Wirklichkeit). */
function standVor(rolle, ziel, wahl) {
  let z = anfangszustand();
  const tu = (a) => { z = wende(z, a, modell); };
  tu({ art: 'starteStory' });
  tu({ art: 'waehleRolle', rolle });
  for (let i = 0; i < 3000 && z.station !== ziel; i++) {
    const s = aktuellerSchritt(z, modell);
    const ent = z.station !== null ? modell.stationen[z.station]?.szenen[rolle]?.entscheidung : null;
    if (s?.art === 'entscheidung' && ent && z.entscheidungen[ent.id] === undefined) tu({ art: 'waehle', option: z.station === 'wirklichkeit' ? wahl : z.station === 'A6' ? 'C' : 'A' });
    const vorher = z;
    tu({ art: 'weiter' });
    if (z === vorher) break;
  }
  if (z.station !== ziel) throw new Error(`${rolle} erreicht ${ziel} nicht (steht in ${z.station})`);
  let text = '';
  speichere(z, { setItem: (_k, v) => { text = v; }, getItem: () => null, removeItem: () => {} });
  return text;
}

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const breite = h.viewport.breite;
  if (breite >= 1280 || (!h.voll && breite !== 400)) return;
  const faelle = h.voll ? FAELLE : FAELLE.slice(0, 1);
  const station = async () => (await seite.evaluate(() => location.hash)).replace(/^#story\//u, '');
  const pruefe = pruefer(seite, h);
  for (const [wahl, ende] of faelle) {
    await seite.evaluate(([k, v]) => { localStorage.setItem(k, v); }, [SPEICHER_SCHLUESSEL, standVor('pl', ende, wahl)]);
    await seite.reload({ waitUntil: 'load' });
    await seite.evaluate((e) => { location.hash = `#story/${e}`; }, ende);
    await h.warte(700);
    if ((await station()) !== ende) { h.befund(`steht in ${await station()} statt ${ende}`); continue; }
    if ((await seite.locator('[data-pruef="karte-explore"]').getAttribute('hidden')) !== null) h.befund(`${ende}: Explore-Weg an der Story-Karte fehlt`);
    const gesehen = new Set();
    for (let i = 0; i < 40; i++) {
      const st = await station();
      const knoepfe = seite.locator('.nachweis-station').filter({ visible: true });
      if (!gesehen.has('nachweis') && await knoepfe.count() > 0) {
        gesehen.add('nachweis');
        await knoepfe.first().focus();
        await seite.keyboard.press('Enter');
        await h.warte(300);
        if ((await knoepfe.first().getAttribute('aria-pressed')) !== 'true') h.befund(`${ende}: Nachweis-Knopf reagiert nicht auf die Tastatur`);
        if (await seite.locator('.nachweis-glied').count() !== 6) h.befund(`${ende}: Nachweiskette ohne sechs Glieder`);
      }
      if (!gesehen.has('diagnose') && await seite.locator('[data-pruef="diagnose-1-0"]').filter({ visible: true }).count() > 0) {
        gesehen.add('diagnose');
        const zeilen = await seite.locator('.diagnose-zeile').count();
        for (let n = 1; n <= zeilen; n++) await seite.locator(`[data-pruef="diagnose-${n}-${n % 3}"]`).click();
      }
      await h.warte(200);
      // R48: schon auf dem ersten Epilog-Schritt (Resümee noch nie gezeigt) druckt Strg+P das Dossier
      if (st === 'epilog' && !gesehen.has('epilog-strgp') && await seite.locator('[data-pruef="dossier-drucken"]').count() === 0) {
        gesehen.add('epilog-strgp');
        await seite.evaluate(() => { window.dispatchEvent(new Event('beforeprint')); });
        const weg = await seite.evaluate(() => document.querySelector('.druck-bogen')?.textContent?.includes('Ihr Weg durch die Story') ?? false);
        await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
        if (!weg) h.befund(`${ende}: Strg+P auf dem ersten Epilog-Schritt druckt kein Dossier`);
        // R50 (Stil): Quellen-Reiter der Seitenleiste – breite Originaltabellen (k2.5-t1, k13-t1) bleiben in der Fläche und
        // sind per Tastatur erreichbar, auch bei 320 px
        const knopf = seite.locator('[data-pruef="seitenleiste-quellen"]').filter({ visible: true });
        if (await knopf.count() === 0) await h.klick('[data-pruef="seitenleiste-raum"]');
        if (await seite.locator('[data-pruef="reiter-quellen"]').filter({ visible: true }).count() > 0) await h.klick('[data-pruef="reiter-quellen"]');
        else await knopf.first().click();
        await h.warte(300);
        if (await seite.locator('.seitenleiste-inhalt .quell-absatz table').count() === 0) h.befund(`${ende}: Quellen-Reiter zeigt keine Tabelle`);
        const vp = seite.viewportSize();
        for (const b of [vp?.width ?? 400, 320]) {
          if (vp !== null) await seite.setViewportSize({ width: b, height: vp.height });
          await h.warte(150);
          for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${ende} Quellen @${b}: ${fund}`);
          for (const fund of await seite.evaluate(rollbarOhneTastatur)) h.befund(`${ende} Quellen @${b}: ${fund}`);
        }
        if (vp !== null) await seite.setViewportSize(vp);
        await h.taste('Escape');
        await h.warte(200);
      }
      await pruefe(`${ende}-${st}-${i}`);
      if (st === 'epilog' && await seite.locator('[data-pruef="weiter"]').isDisabled()) break;
      if (await seite.locator('[data-pruef="szene-weiter"]').filter({ visible: true }).count() > 0) await h.klick('[data-pruef="szene-weiter"]');
      else if (!(await seite.locator('[data-pruef="weiter"]').isDisabled())) await h.klick('[data-pruef="weiter"]');
      else break;
      await h.warte(200);
    }
    if ((await station()) !== 'epilog') h.befund(`${ende}: endet in ${await station()} statt im Epilog`);
    for (const n of ['nachweis', 'diagnose', 'epilog-strgp']) if (!gesehen.has(n)) h.befund(`${ende}: ${n} nicht gesehen`);
    // R45: das Dossier im Epilog als echtes PDF (wie Theorie und Hilfe) – keine Überschrift am Seitenende, keine leere oder
    // fast leere Seite, kein Wort ohne Trennstrich gebrochen; einmal je Lauf (erster Fall)
    // schmal zeigt der Epilog nur den aktuellen Schritt: zurück zum Resümee
    const schritte = seite.locator('.fortschritt-schritt');
    for (let n = (await schritte.count()) - 1; n >= 0 && await seite.locator('[data-pruef="dossier-drucken"]').filter({ visible: true }).count() === 0; n--) { await schritte.nth(n).click(); await h.warte(300); }
    if (ende === faelle[0]?.[1] && await seite.locator('[data-pruef="dossier-drucken"]').filter({ visible: true }).count() > 0) {
      await seite.evaluate(() => { window.print = () => { window.dispatchEvent(new Event('beforeprint')); }; });
      await seite.locator('[data-pruef="dossier-drucken"]').click();
      await h.warte(300);
      // R46: der Bogen entsteht wirklich (genau einer, mit Köpfen und dem Weg) – sonst prüfte das PDF die Bildschirmseite
      const bogen = await seite.evaluate(() => ({ n: document.querySelectorAll('.druck-bogen').length, koepfe: document.querySelectorAll('.druck-bogen :is(h1, h2)').length, text: document.querySelector('.druck-bogen')?.textContent ?? '' }));
      if (bogen.n !== 1 || bogen.koepfe < 3 || !bogen.text.includes('Ihr Weg durch die Story')) h.befund(`Dossier: kein vollständiger Bogen ${JSON.stringify({ n: bogen.n, koepfe: bogen.koepfe })}`);
      await seite.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
      const vorher = seite.viewportSize() ?? { width: breite, height: 768 };
      await seite.setViewportSize({ width: 794, height: vorher.height });
      await seite.evaluate(() => { document.documentElement.style.width = '688px'; });
      await h.warte(200);
      // R61: im Druck steht nur der Bogen – die Bildschirmseite (Epilog, Kopf, Fußleiste) ist verborgen
      const sichtbar = await seite.evaluate(() => [...document.body.children].filter((k) => !k.classList.contains('druck-bogen') && getComputedStyle(k).display !== 'none' && k.getClientRects().length > 0).map((k) => `${k.tagName.toLowerCase()}.${k.className}`));
      if (sichtbar.length > 0) h.befund(`Dossier: im Druck neben dem Bogen sichtbar ${JSON.stringify(sichtbar.slice(0, 3))}`);
      const bruch = await wortbrueche(seite, '.druck-bogen');
      if (bruch.length > 0) h.befund(`Dossier: ${bruch.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 6))}`);
      // R48: auch die Absatz-ID einer wortgleichen Tabelle steht nie allein am Seitenende
      const koepfe = await seite.evaluate(() => [...document.querySelectorAll('.druck-bogen :is(h1, h2, h3, h4, dt, summary, .absatz-id)')]
        .map((x) => ({ text: x.textContent ?? '', pt: parseFloat(getComputedStyle(x).fontSize) * 0.75 })));
      await seite.evaluate(() => { document.documentElement.style.width = ''; });
      await seite.setViewportSize(vorher);
      const pdf = await pdfSeiten(await seite.pdf({ format: 'A4' }));
      const erster = koepfe[0]?.text.replace(/\s+/gu, '') ?? '';
      if (erster === '' || !pdf.some((x) => x.zeilen.join('').replace(/\s+/gu, '').includes(erster.slice(0, 30)))) h.befund(`Dossier: Kopf „${koepfe[0]?.text ?? ''}“ nicht im PDF`);
      const amEnde = seitenMitUeberschriftAmEnde(pdf, koepfe);
      if (amEnde.length > 0) h.befund(`Dossier: Überschrift am Seitenende ${JSON.stringify(amEnde)}`);
      if (pdf.length < 2 || pdf.some((x) => x.zeilen.length === 0)) h.befund(`Dossier: ${pdf.length} Seiten, davon leer ${pdf.filter((x) => x.zeilen.length === 0).length}`);
      // Jedes Kapitel der Vertiefung beginnt auf einer neuen Seite: die Seite davor darf kurz sein (CI 209: S. 17 = Ende von Kap. 8)
      const vorKapitel = (i) => /^(?:ZumNachlesen.*?)?KAPITEL\d/u.test((pdf[i + 1]?.zeilen.slice(0, 2).join('') ?? '').replace(/\s+/gu, ''));
      // R50: die Quellzeile eines Zitats steht nie allein oben auf der Folgeseite (Resümee „Sechs Kernfragen“)
      // R54 (Architektur): auch nach nur einer Zeile des Zitats (eine Kernfrage und die Quelle, L-164) – nicht nur ganz oben
      const quelleOben = pdf.map((x, i) => ({ seite: i + 1, zeile: x.zeilen.slice(0, 2).findIndex((z) => /^Originaltext, wörtlich · Quelle:/u.test(z)) })).filter((x) => x.zeile >= 0);
      if (quelleOben.length > 0) h.befund(`Dossier: Quellzeile am Seitenanfang ${JSON.stringify(quelleOben)}`);
      const leer = pdf.slice(0, -1).map((x, i) => ({ seite: i + 1, fuellung: Math.round((x.fuellung ?? 0) * 100), vorKapitel: vorKapitel(i) }))
        .filter((x) => x.fuellung < 35 && !x.vorKapitel);
      if (leer.length > 0) h.befund(`Dossier: fast leere Seiten ${JSON.stringify(leer)}`);
      await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
      await seite.evaluate(() => { window.print = () => {}; window.dispatchEvent(new Event('afterprint')); });
      if (await seite.locator('.druck-bogen').count() !== 0) h.befund('Dossier: Bogen bleibt nach dem Druck stehen');
      // R47: Strg+P ohne Knopf (der Browser meldet nur beforeprint) druckt dasselbe Dossier, nicht die Bildschirmseite
      await seite.evaluate(() => { window.dispatchEvent(new Event('beforeprint')); });
      const strgP = await seite.evaluate(() => ({ klasse: document.body.classList.contains('druckt-bogen'), weg: document.querySelector('.druck-bogen')?.textContent?.includes('Ihr Weg durch die Story') ?? false }));
      await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
      if (!strgP.klasse || !strgP.weg) h.befund(`Dossier: Strg+P ohne Bogen ${JSON.stringify(strgP)}`);
      if (await seite.locator('.druck-bogen').count() !== 0) h.befund('Dossier: Strg+P-Bogen bleibt stehen');
      // R48: auch auf einem anderen Schritt des Epilogs (ohne Resümee und Knopf) druckt Strg+P das Dossier
      await seite.locator('.fortschritt-schritt').first().click();
      await h.warte(300);
      const ohneKnopf = await seite.locator('[data-pruef="dossier-drucken"]').count();
      await seite.evaluate(() => { window.dispatchEvent(new Event('beforeprint')); });
      const strgP2 = await seite.evaluate(() => ({ station: location.hash, weg: document.querySelector('.druck-bogen')?.textContent?.includes('Ihr Weg durch die Story') ?? false }));
      await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
      if (ohneKnopf !== 0 || !strgP2.weg) h.befund(`Dossier: Strg+P auf einem anderen Epilog-Schritt ${JSON.stringify({ ohneKnopf, ...strgP2 })}`);
    } else if (ende === faelle[0]?.[1]) h.befund(`${ende}: Dossier-Knopf im Epilog fehlt`);
    await seite.evaluate(() => localStorage.clear());
  }
}
