// Lesezeit (P11.5, O-5): spielt den Hauptpfad einer Rolle mit „Weiter“ und der ersten Option durch und
// zählt die sichtbaren Wörter (ohne Knöpfe, Tabellen, Grafiken, Screenreader-Texte, zugeklappte Teile)
// und die Klicks. Lesezeit = Wörter / 200 je Minute + 2 s je Klick (L-61). Ergebnis nach
// tmp/lesezeit.json; über dem Ziel (Hauptpfad 35 min, Express 15 min) ist es ein Befund, sobald
// MVG_LESEZEIT_PFLICHT=1 gesetzt ist (bis P11.5c abgeschlossen ist, nur Bericht).
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
 * @param {import('playwright').Page} seite
 * @param {string} rolle
 * @param {boolean} express
 */
async function spiele(seite, rolle, express) {
  // frischer Stand: Hash auf Start, laden, Speicher leeren (die App speichert beim Wechsel), erneut laden
  await seite.evaluate(() => { location.hash = '#start'; });
  await seite.reload();
  await seite.evaluate(() => { localStorage.clear(); });
  await seite.reload();
  await seite.locator('[data-pruef="weg-story"]').click();
  const sichtbar = async (/** @type {string} */ s) => (await seite.locator(s).filter({ visible: true }).count()) > 0;
  const gesehen = new Set();
  /** @type {Record<string, number>} */
  const jeStation = {};
  let klicks = 0;
  for (let i = 0; i < 900; i++) {
    if (await sichtbar(`[data-pruef="rolle-${rolle}"]`)) { await seite.locator(`[data-pruef="rolle-${rolle}"]`).click(); klicks++; }
    if (express && await sichtbar('[data-pruef="interesse-express"]') && (await seite.locator('[data-pruef="interesse-express"]').getAttribute('aria-pressed')) !== 'true') {
      await seite.locator('[data-pruef="interesse-express"]').click(); klicks++;
    }
    const station = (await seite.evaluate(() => location.hash)).replace('#story/', '') || 'start';
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
  const rollen = h.voll ? ['gf', 'bauherr', 'pl', 'ps', 'planung', 'controlling'] : ['pl'];
  const ergebnisse = [];
  for (const rolle of rollen) {
    ergebnisse.push(await spiele(seite, rolle, false));
    ergebnisse.push(await spiele(seite, rolle, true));
  }
  mkdirSync(path.join(WURZEL, 'tmp'), { recursive: true });
  writeFileSync(path.join(WURZEL, 'tmp', 'lesezeit.json'), `${JSON.stringify(ergebnisse, null, 1)}\n`);
  const pflicht = process.env['MVG_LESEZEIT_PFLICHT'] === '1';
  for (const e of ergebnisse) {
    const ziel = e.express ? ZIEL.express : ZIEL.haupt;
    const zeile = `Lesezeit ${e.rolle}${e.express ? ' Express' : ''}: ${e.minuten} min (${e.woerter} Wörter, ${e.klicks} Klicks; Ziel ≤ ${ziel} min)`;
    console.log(`      ${zeile}`);
    if (pflicht && e.minuten > ziel) h.befund(zeile);
  }
}
