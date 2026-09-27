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
import { pruefer } from './hilfen.mjs';

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
      await pruefe(`${ende}-${st}-${i}`);
      if (st === 'epilog' && await seite.locator('[data-pruef="weiter"]').isDisabled()) break;
      if (await seite.locator('[data-pruef="szene-weiter"]').filter({ visible: true }).count() > 0) await h.klick('[data-pruef="szene-weiter"]');
      else if (!(await seite.locator('[data-pruef="weiter"]').isDisabled())) await h.klick('[data-pruef="weiter"]');
      else break;
      await h.warte(200);
    }
    if ((await station()) !== 'epilog') h.befund(`${ende}: endet in ${await station()} statt im Epilog`);
    for (const n of ['nachweis', 'diagnose']) if (!gesehen.has(n)) h.befund(`${ende}: ${n} nicht gesehen`);
    await seite.evaluate(() => localStorage.clear());
  }
}
