// Lesezeit (P11.5, O-5): spielt den Hauptpfad einer Rolle mit „Weiter“ und der ersten Option durch und
// zählt die sichtbaren Wörter (ohne Knöpfe, Tabellen, Grafiken, Screenreader-Texte, zugeklappte Teile)
// und die Klicks (Express ohne den optionalen Epilog, L-49). Lesezeit = Wörter / 200 je Minute + 2 s je Klick (L-61). Ergebnis nach
// tmp/lesezeit.json; über dem Ziel (Hauptpfad 35 min, Express 15 min) ist es ein Befund (seit P11.5c;
// MVG_LESEZEIT_PFLICHT=0 macht daraus nur einen Bericht).
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'lesezeit';
export const hash = '#start';
export const viewports = [{ breite: 1280, hoehe: 800 }];

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ZIEL = { haupt: 35, express: 15 };
const WPM = 200;
const SEK_JE_KLICK = 2;

/**
 * @param {import('playwright').Page} start
 * @param {string} rolle
 * @param {boolean} express
 */
async function spiele(start, rolle, express) {
  // je Lauf ein eigener Browser-Kontext: kein gespeicherter Stand aus dem vorigen Lauf (Weiterlesen, E9)
  const browser = start.context().browser();
  if (browser === null) throw new Error('kein Browser');
  const kontext = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'de-DE', reducedMotion: 'reduce' });
  const seite = await kontext.newPage();
  try {
    await seite.goto(start.url().replace(/#.*$/u, '#start'));
    return await spieleIn(seite, rolle, express);
  } finally {
    await kontext.close();
  }
}

/**
 * @param {import('playwright').Page} seite
 * @param {string} rolle
 * @param {boolean} express
 */
async function spieleIn(seite, rolle, express) {
  await seite.locator('[data-pruef="weg-story"]').click();
  const sichtbar = async (/** @type {string} */ s) => (await seite.locator(s).filter({ visible: true }).count()) > 0;
  const gesehen = new Set();
  /** @type {Record<string, number>} */
  const jeStation = {};
  let klicks = 0;
  let expressGewaehlt = false;
  let rolleGewaehlt = false;
  for (let i = 0; i < 900; i++) {
    // Rolle genau einmal wählen (eine erneute Wahl setzt die Interessen zurück)
    if (!rolleGewaehlt && await sichtbar(`[data-pruef="rolle-${rolle}"]`)) {
      await seite.locator(`[data-pruef="rolle-${rolle}"]`).click(); klicks++; rolleGewaehlt = true;
      // die Rollenwahl führt selbst weiter: erst den nächsten Schritt abwarten, sonst überspringt ein
      // sofortiges „Weiter“ die Interessenwahl (Express)
      await seite.waitForTimeout(400);
      continue;
    }
    // Express genau einmal wählen (im Prolog); der Zustand steht danach in der Sitzung
    if (express && !expressGewaehlt && await sichtbar('[data-pruef="interesse-express"]')) {
      const knopf = seite.locator('[data-pruef="interesse-express"]').filter({ visible: true }).first();
      for (let versuch = 0; versuch < 3 && (await knopf.getAttribute('aria-pressed')) !== 'true'; versuch++) {
        await knopf.click(); klicks++;
        await seite.waitForTimeout(150);
      }
      expressGewaehlt = (await knopf.getAttribute('aria-pressed')) === 'true';
      if (!expressGewaehlt) throw new Error(`Express für ${rolle} nicht wählbar`);
    }
    const station = (await seite.evaluate(() => location.hash)).replace('#story/', '') || 'start';
    // Express lässt den Epilog aus (L-49): gemessen wird bis zum Ende der Geschichte
    if (express && station === 'epilog') break;
    const teile = await seite.evaluate(() => {
      const wurzel = document.querySelector('main') ?? document.body;
      /** @type {string[]} */
      const aus = [];
      for (const el of wurzel.querySelectorAll('p,li,h1,h2,h3,h4,blockquote,figcaption')) {
        if (!(el instanceof HTMLElement) || el.offsetParent === null) continue;
        if (el.closest('aside,nav,.seitenleiste,[data-pruef=story-karte],[data-pruef=status],table,.instrumente,.fussleiste,button,details:not([open]),[role=img],svg,.nur-sr')) continue;
        if (el.querySelector('p,li,td')) continue;
        const t = el.innerText.trim();
        if (t) aus.push(t);
      }
      return aus;
    });
    for (const t of teile) {
      if (gesehen.has(t)) continue;
      gesehen.add(t);
      jeStation[station] = (jeStation[station] ?? 0) + t.split(/\s+/u).length;
    }
    const optionen = seite.locator('[data-pruef^="option-"]').filter({ visible: true });
    if (await optionen.count() > 0 && await seite.locator('[data-pruef^="option-"][aria-pressed="true"]').count() === 0) { await optionen.first().click(); klicks++; await seite.waitForTimeout(60); continue; }
    if (await sichtbar('[data-pruef="szene-weiter"]')) { await seite.locator('[data-pruef="szene-weiter"]').filter({ visible: true }).first().click(); klicks++; await seite.waitForTimeout(60); continue; }
    const weiter = seite.locator('[data-pruef="weiter"]');
    if (await weiter.count() > 0 && await weiter.isEnabled()) { await weiter.click(); klicks++; await seite.waitForTimeout(60); continue; }
    break;
  }
  const woerter = Object.values(jeStation).reduce((a, b) => a + b, 0);
  return { rolle, express, woerter, klicks, minuten: Math.round((woerter / WPM + (klicks * SEK_JE_KLICK) / 60) * 10) / 10, jeStation };
}

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  await seite.emulateMedia({ reducedMotion: 'reduce' });
  const rollen = process.env['MVG_LESEZEIT_ROLLEN']?.split(',') ?? (h.voll ? ['gf', 'bauherr', 'pl', 'ps', 'planung', 'controlling'] : ['pl']);
  const ergebnisse = [];
  for (const rolle of rollen) {
    ergebnisse.push(await spiele(seite, rolle, false));
    ergebnisse.push(await spiele(seite, rolle, true));
  }
  // MVG_LESEZEIT_DATEI: eigene Ausgabe (parallele Messungen); MVG_LESEZEIT_ROLLEN: nur diese Rollen (Komma)
  const datei = process.env['MVG_LESEZEIT_DATEI'] ?? path.join(WURZEL, 'tmp', 'lesezeit.json');
  mkdirSync(path.dirname(datei), { recursive: true });
  writeFileSync(datei, `${JSON.stringify(ergebnisse, null, 1)}\n`);
  const pflicht = process.env['MVG_LESEZEIT_PFLICHT'] !== '0';
  for (const e of ergebnisse) {
    const ziel = e.express ? ZIEL.express : ZIEL.haupt;
    const zeile = `Lesezeit ${e.rolle}${e.express ? ' Express' : ''}: ${e.minuten} min (${e.woerter} Wörter, ${e.klicks} Klicks; Ziel ≤ ${ziel} min)`;
    console.log(`      ${zeile}`);
    if (pflicht && e.minuten > ziel) h.befund(zeile);
  }
}
