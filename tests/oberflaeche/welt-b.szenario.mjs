// Browser-Szenario Welt B (P5.9, P2-Befunde V3/V7/V9): in dist/mvg.html (seit P5.10) spielt jede Rolle
// B1–B6 – Einstieg, Vergleich, Werkzeuge, Entscheidung, Ebenen 1–4, am Ende „Ihre Spur“; Layout, axe
// und Quellen-Kontrast an jedem Werkzeug. Damit nicht jede Rolle Welt A erneut durchspielt, erzeugt
// die Engine selbst den Stand direkt vor B1 (Option A an jeder Station) und legt ihn in den Speicher
// der Seite – derselbe Weg, auf dem ein Leser nach einem Neuladen weiterliest.
// Größen: 1280×720 alle sechs Rollen – aufgeteilt auf dieses Szenario (gf, bauherr, pl) und
// „welt-b-2“ (ps, planung, controlling + Express-Pfad E8), damit der parallele Pool beide zugleich
// fährt; 1024×768 und 400×800 je drei Rollen, zusammen jede Rolle einmal außerhalb des Desktops.

import { inhalte as modell } from '../../src/inhalte/index.ts';
import { anfangszustand } from '../../src/engine/zustand.ts';
import { wende } from '../../src/engine/aktionen.ts';
import { aktuellerSchritt } from '../../src/engine/graph.ts';
import { speichere, SPEICHER_SCHLUESSEL } from '../../src/engine/speicher.ts';
import { pruefer, weltB } from './hilfen.mjs';

export const name = 'welt-b';
export const hash = '#story';

const ROLLEN_JE_GROESSE = {
  1280: ['gf', 'bauherr', 'pl'],
  1024: ['bauherr', 'ps', 'planung'],
  400: ['gf', 'pl', 'controlling'],
};
const EXPRESS = ['A3', 'A6', 'wendepunkt', 'rueckspulen', 'B3', 'B6', 'wirklichkeit'];

// Der Stand entsteht aus denselben kompilierten Inhalten, die in dist/mvg.html stecken (src/generiert/inhalte.json)
/** Die PL liest mit Interessen (Vertiefungen in Welt B, L-31); die anderen ohne. */
const INTERESSEN = { pl: ['kosten', 'risiko'] };
/** Kurzform der Option A einer Station für eine Rolle (für die Spur-Prüfung). */
const kurzA = (st, rolle) => modell.stationen[st]?.szenen[rolle]?.entscheidung?.optionen.find((o) => o.id === 'A')?.kurz ?? '';

/** Spielt mit dem Reducer bis zur Zielstation (Option A an jeder Entscheidung) und liefert den gespeicherten Stand. */
function standVor(rolle, ziel) {
  let z = anfangszustand();
  const tu = (a) => { z = wende(z, a, modell); };
  tu({ art: 'starteStory' });
  tu({ art: 'waehleRolle', rolle });
  if (INTERESSEN[rolle]) tu({ art: 'setzeInteressen', interessen: INTERESSEN[rolle] });
  for (let i = 0; i < 2000 && z.station !== ziel; i++) {
    const s = aktuellerSchritt(z, modell);
    const ent = z.station !== null ? modell.stationen[z.station]?.szenen[rolle]?.entscheidung : null;
    if (s?.art === 'entscheidung' && ent && z.entscheidungen[ent.id] === undefined) tu({ art: 'waehle', option: 'A' });
    const vorher = z;
    tu({ art: 'weiter' });
    if (z === vorher) break;
  }
  if (z.station !== ziel) throw new Error(`welt-b: ${rolle} erreicht ${ziel} nicht (steht in ${z.station})`);
  let text = '';
  speichere(z, { setItem: (_k, v) => { text = v; }, getItem: () => null, removeItem: () => {} });
  return text;
}

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  // schnell (vor jedem Commit, L-44): je Größe eine Rolle – die PL (mit Interessen), bei 1024 der Bauherr
  const schnell = h.viewport.breite === 1024 ? ['bauherr'] : ['pl'];
  await spiele(seite, h, h.voll ? ROLLEN_JE_GROESSE[h.viewport.breite] ?? ['pl'] : schnell, false);
  if (h.viewport.breite === 1280) await rollenfrageB3(seite, h);
}

/**
 * B3 „mandat“ (P11.3 R2): die Rollenfrage ist ohne Vorlage sofort sichtbar, per Tastatur beantwortbar
 * und zeigt danach Rückmeldung und `aria-pressed`.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
async function rollenfrageB3(seite, h) {
  await seite.evaluate(([k, v]) => { localStorage.setItem(k, v); }, [SPEICHER_SCHLUESSEL, standVor('bauherr', 'B3')]);
  await seite.reload({ waitUntil: 'load' });
  await seite.evaluate(() => { location.hash = '#story/B3'; });
  await h.warte(600);
  // der Sprung per Adresse beginnt die Station vorn: bis zum Mandats-Schritt weiter
  for (let i = 0; i < 12 && await seite.locator('[data-pruef^="mandat-option-"]').filter({ visible: true }).count() === 0; i++) {
    await h.klick('[data-pruef="weiter"]');
    await h.warte(250);
  }
  await h.warte(500);
  const knoepfe = seite.locator('[data-pruef^="reife-"]').filter({ visible: true });
  if (await knoepfe.count() < 2) { h.befund(`B3 mandat (bauherr): ${await knoepfe.count()} sichtbare Antwortknöpfe der Rollenfrage (${await seite.locator('[data-pruef^="reife-"]').count()} im DOM)`); await seite.evaluate(() => localStorage.clear()); return; }
  await knoepfe.first().focus();
  await h.taste('Enter');
  await h.warte(300);
  if ((await knoepfe.first().getAttribute('aria-pressed')) !== 'true') h.befund('B3 mandat: Antwort per Enter nicht als gewählt markiert');
  if (await seite.locator('[data-pruef="rueckmeldung"] .rueckmeldung').filter({ visible: true }).count() === 0) h.befund('B3 mandat: Rückmeldung fehlt nach der Antwort');
  await seite.evaluate(() => localStorage.clear());
}

/**
 * Spielt die Rollen durch B1–B6 und auf Wunsch den Express-Pfad.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string[]} rollen
 * @param {boolean} express
 */
export async function spiele(seite, h, rollen, express) {
  const station = async () => (await seite.evaluate(() => location.hash)).replace(/^#story\//u, '');
  const pruefe = pruefer(seite, h);
  for (const rolle of rollen) {
    const stand = standVor(rolle, 'B1');
    await seite.evaluate(([k, v]) => { localStorage.setItem(k, v); }, [SPEICHER_SCHLUESSEL, stand]);
    await seite.reload({ waitUntil: 'load' });
    await seite.evaluate(() => { location.hash = '#story/B1'; });
    await h.warte(600);
    if ((await station()) !== 'B1') { h.befund(`${rolle}: geladener Stand steht nicht in B1 (${await station()})`); continue; }
    await weltB(seite, h, station, async (n) => pruefe(`${rolle}-${n}`), { vertiefungen: INTERESSEN[rolle] ?? [], spur: { a: kurzA('A1', rolle), b: kurzA('B1', rolle) } });
    await seite.evaluate(() => localStorage.clear());
  }
  if (!express) return;

  // Express (E8, P2-Befund V3): Interesse „express“ im Prolog → nur die Schlüsselmomente
  await seite.evaluate(() => localStorage.clear());
  await seite.reload({ waitUntil: 'load' });
  await seite.evaluate(() => { location.hash = '#story'; });
  await h.erwarte('[data-pruef="weiter"]');
  if (await seite.locator('[data-pruef="rolle-bauherr"]').filter({ visible: true }).count() === 0) await h.klick('[data-pruef="weiter"]');
  await h.klick('[data-pruef="rolle-bauherr"]');
  await h.klick('[data-pruef="interesse-express"]');
  await h.klick('[data-pruef="weiter"]');
  const weg = [];
  for (let i = 0; i < 200 && (await station()) !== 'wirklichkeit'; i++) {
    const st = await station();
    if (weg[weg.length - 1] !== st) {
      weg.push(st);
      // Express (T6): an jeder Station einmal prüfen; vor B3 und B6 steht die Karte „Was dazwischen geschah“ (L-43)
      if (st !== '' && st !== 'prolog') {
        await h.warte(700);
        if ((st === 'B3' || st === 'B6') && await seite.locator('[data-pruef="express-karte"]').filter({ visible: true }).count() === 0) h.befund(`Express ${st}: Karte „Was dazwischen geschah“ fehlt`);
        await pruefe(`express-${st}`);
      }
    }
    const optionA = seite.locator('[data-pruef="option-A"]').filter({ visible: true });
    if (await optionA.count() > 0 && (await optionA.first().getAttribute('aria-pressed')) !== 'true') await optionA.first().click();
    if (await seite.locator('[data-pruef="szene-weiter"]').filter({ visible: true }).count() > 0) await h.klick('[data-pruef="szene-weiter"]');
    else await h.klick('[data-pruef="weiter"]');
    await h.warte(120);
  }
  weg.push(await station());
  const stationen = weg.filter((x) => x !== '' && x !== 'prolog');
  if (stationen.join(' → ') !== EXPRESS.join(' → ')) h.befund(`Express: Weg ${stationen.join(' → ')} statt ${EXPRESS.join(' → ')}`);
  await pruefe('express-wirklichkeit');

  // Wirklichkeit (P7.1) Schritt für Schritt: Tafeln (Zeitachse), Ebenen 1–4 mit den Tafeln in Ebene 3,
  // Wahl A → ein Ende; Explore ist danach freigeschaltet (L-49)
  let ebene3 = false;
  for (let i = 0; i < 30 && (await station()) === 'wirklichkeit'; i++) {
    const schritt = await seite.evaluate(() => document.querySelector('[aria-current="step"] .fs-titel')?.textContent ?? '');
    if (await seite.locator('[data-pruef="zeitachse-regler"]').filter({ visible: true }).count() > 0) {
      await seite.locator('[data-pruef="zeitachse-regler"]').first().fill('45');
      const tag = await seite.locator('[data-pruef="zeitachse-tag"]').first().innerText();
      if (tag !== 'Tag 45') h.befund(`Wirklichkeit: Zeitachse zeigt „${tag}“ statt „Tag 45“`);
    }
    if (!ebene3 && await seite.locator('[data-pruef="ebene-knopf-3"]').filter({ visible: true }).count() > 0) {
      ebene3 = true;
      await h.klick('[data-pruef="ebene-knopf-3"]');
      await h.warte(300);
      if (await seite.locator('[data-pruef="ebene-3"] .tafel').count() < 2) h.befund('Wirklichkeit: Ebene 3 zeigt die Tafeln k8.1-t1 und k8.4-t1 nicht');
      await pruefe('wirklichkeit-ebene3');
    } else if (!ebene3) await pruefe(`wirklichkeit-${schritt.toLowerCase().replace(/[^a-z0-9]+/gu, '-')}`);
    const optionA = seite.locator('[data-pruef="option-A"]').filter({ visible: true });
    if (await optionA.count() > 0 && (await optionA.first().getAttribute('aria-pressed')) !== 'true') await optionA.first().click();
    if (await seite.locator('[data-pruef="szene-weiter"]').filter({ visible: true }).count() > 0) await h.klick('[data-pruef="szene-weiter"]');
    else await h.klick('[data-pruef="weiter"]');
    await h.warte(200);
  }
  const ende = await station();
  if (!ende.startsWith('ende-')) h.befund(`nach der Wirklichkeit: ${ende} statt eines Endes`);
  await h.warte(500);
  await pruefe(`express-${ende}`);
  if ((await seite.locator('[data-pruef="karte-explore"]').getAttribute('hidden')) !== null) h.befund('nach dem Ende: Weg „Selbst ausprobieren · Explore“ fehlt an der Story-Karte');

  // Ende und Epilog (P7.2–P7.6): Nachweiskette (E2), Selbstdiagnose ohne Punktzahl, Spurvergleich, Resümee
  const gesehen = new Set();
  for (let i = 0; i < 40; i++) {
    const st = await station();
    for (const [haken, name] of [['nachweiskette', 'nachweiskette'], ['tafel-diagnose', 'diagnose'], ['spurvergleich', 'spurvergleich'], ['resuemee', 'resuemee']]) {
      if (gesehen.has(name) || await seite.locator(`[data-pruef="${haken}"]`).filter({ visible: true }).count() === 0) continue;
      gesehen.add(name);
      if (name === 'nachweiskette') {
        const knoepfe = seite.locator('.nachweis-station').filter({ visible: true });
        if (await knoepfe.count() < 2) h.befund(`${st}: Nachweiskette zeigt ${await knoepfe.count()} Stationen`);
        await knoepfe.first().click();
        await h.warte(1200);
        if (await seite.locator('.nachweis-glied').count() !== 6) h.befund(`${st}: Nachweiskette ohne sechs Glieder`);
      }
      if (name === 'diagnose') {
        await h.klick('[data-pruef="diagnose-1-0"]');
        if (!/Zeigt sich bei Ihnen/u.test(await seite.locator('[data-pruef="diagnose-profil"]').innerText())) h.befund('Epilog: Profil der Selbstdiagnose leer');
      }
      if (name === 'resuemee' && await seite.locator('[data-pruef="resuemee-vertiefungen"] a').count() !== 2) h.befund('Epilog: Resümee ohne zwei Vertiefungen');
      await h.warte(300);
      await pruefe(`${st}-${name}`);
    }
    if (st === 'epilog' && await seite.locator('[data-pruef="weiter"]').isDisabled()) break;
    if (await seite.locator('[data-pruef="szene-weiter"]').filter({ visible: true }).count() > 0) await h.klick('[data-pruef="szene-weiter"]');
    else if (!(await seite.locator('[data-pruef="weiter"]').isDisabled())) await h.klick('[data-pruef="weiter"]');
    else break;
    await h.warte(200);
  }
  for (const name of ['nachweiskette', 'diagnose', 'spurvergleich', 'resuemee']) if (!gesehen.has(name)) h.befund(`Ende/Epilog: Baustein ${name} nicht gesehen`);
}
