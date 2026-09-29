// Browser-Szenario Hilfe (P13, O-31): jede Hilfeseite (Teile und Unterseiten) – Layout (kein
// Seitwärtsscrollen), axe, kein „Whitepaper“, Verzeichnis mit derselben Aufteilung wie die Quelle,
// breite Tabellen per Tastatur erreichbar, Suche und Blättern. Schnell: 1280 und 400; voll zusätzlich 1024.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pruefeLayout } from './hilfen.mjs';

export const name = 'hilfe';
export const hash = '#start';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const breite = seite.viewportSize()?.width ?? 1280;
  if (!h.voll && breite > 400 && breite < 1280) return;
  /** @type {{ kapitel: { id: string, titel: string, unter: { id: string, titel: string }[] }[] }} */
  const hilfe = JSON.parse(readFileSync(path.join(WURZEL, 'src', 'generiert', 'hilfe.json'), 'utf8'));
  await seite.emulateMedia({ reducedMotion: 'reduce' });

  // Zugang: leiser Link auf der Startseite
  await h.erwarte('[data-pruef="zur-hilfe"]');
  await seite.click('[data-pruef="zur-hilfe"]');
  await h.erwarte('[data-pruef="hilfe-uebersicht"]');
  const karten = await seite.locator('[data-pruef="hilfe-liste"] > li').count();
  if (karten !== hilfe.kapitel.length) h.befund(`Übersicht: ${karten} Karten statt ${hilfe.kapitel.length}`);
  await h.axe('uebersicht');
  await h.bild('uebersicht');

  // Suche: findet eine Seite und verlinkt sie
  await seite.fill('[data-pruef="hilfe-suche"]', 'Kostengruppe');
  await h.warte(100);
  const treffer = await seite.locator('[data-pruef="hilfe-treffer"] li').count();
  if (treffer === 0) h.befund('Suche „Kostengruppe“ ohne Treffer');

  const alle = hilfe.kapitel.flatMap((k) => [k, ...k.unter]);
  for (const [i, s] of alle.entries()) {
    await seite.evaluate((id) => { location.hash = `#hilfe/${id}`; }, s.id);
    await h.erwarte(`[data-seite="${s.id}"] [data-pruef="hilfe-inhalt"]`);
    const titel = await seite.locator('.kapitel-titel').innerText();
    if (titel.trim() !== s.titel) h.befund(`${s.id}: Titel „${titel}“ statt „${s.titel}“`);
    const aktuell = await seite.locator('[data-pruef="hilfe-verzeichnis"] a[aria-current="page"]').count();
    if (aktuell !== 1) h.befund(`${s.id}: ${aktuell} aktuelle Einträge im Verzeichnis`);
    await seite.evaluate(() => { for (const d of document.querySelectorAll('.hilfe-inhalt details')) d.setAttribute('open', ''); });
    // aufgeklappte Tabellen misst der ResizeObserver im nächsten Bild
    await h.warte(150);
    for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${s.id}: ${fund}`);
    const wort = await seite.evaluate(() => /white\s*-?\s*paper/iu.test(document.body.innerText));
    if (wort) h.befund(`${s.id}: „Whitepaper“ im Text (O-29)`);
    const ohneFokus = await seite.evaluate(() => [...document.querySelectorAll('.hilfe-inhalt .h-table-wrap, .hilfe-inhalt .h-grafik-wrap')]
      .filter((el) => el.scrollWidth > el.clientWidth + 1 && el.getAttribute('tabindex') !== '0').length);
    if (ohneFokus > 0) h.befund(`${s.id}: ${ohneFokus} scrollbare Tabellen nicht per Tastatur erreichbar`);
    // Blättern: Weiter führt zur nächsten Seite der Lesereihenfolge
    const weiter = await seite.locator('.kapitel-nav a[rel="next"]').getAttribute('href').catch(() => null);
    const soll = alle[i + 1] !== undefined ? `#hilfe/${alle[i + 1].id}` : null;
    if (weiter !== soll) h.befund(`${s.id}: „Weiter“ führt zu ${weiter} statt ${soll}`);
    // Marken (Tags, Plaketten) einzeilig: keine fremde Regel bricht sie buchstabenweise um (Prüfagent Stil, Befund 1)
    const hoch = await seite.evaluate(() => [...document.querySelectorAll('.hilfe-inhalt :is(.h-tag, .h-badge, .h-pill)')]
      .filter((el) => el.getBoundingClientRect().height > 40).map((el) => (el.textContent ?? '').trim()).slice(0, 3));
    if (hoch.length > 0) h.befund(`${s.id}: Marken umbrochen (${hoch.join(', ')})`);
    await h.axe(s.id);
    if (s.id === 'mvg-vorgehensmodell' || s.id === 'standards') await h.bild(s.id);
  }

  // Grafik vergrößern (Prüfrunde 3): Dialog öffnet, Beschriftung lesbar, Esc schließt
  await seite.evaluate(() => { location.hash = '#hilfe/mvg-vorgehensmodell'; });
  await h.erwarte('[data-pruef="grafik-gross"]');
  await seite.locator('[data-pruef="grafik-gross"]').last().click();
  await h.erwarte('dialog[open]');
  const klein = await seite.evaluate(() => Math.min(...[...document.querySelectorAll('dialog[open] svg text')].map((t) => t.getBoundingClientRect().height)));
  if (klein < 11.5) h.befund(`Grafik vergrößert: Beschriftung nur ${klein.toFixed(1)} px hoch`);
  // R13: ab 1224 px passt die Grafik samt Rand in den Dialog (keine Inline-Breite aus der Quelle), der Kopf ist bündig
  const dlgMass = await seite.evaluate(() => {
    const d = document.querySelector('dialog[open]');
    const k = d?.querySelector('.hilfe-grafik-dialog-kopf');
    const knopf = k?.querySelector('button');
    if (!d || !k || !knopf) return null;
    const r = d.getBoundingClientRect();
    return { sw: d.scrollWidth, cw: d.clientWidth, kopf: Math.round(k.getBoundingClientRect().top - r.top), breit: window.innerWidth,
      oben: Math.round(r.top), unten: Math.round(window.innerHeight - r.bottom), knopfAbKopf: Math.round(knopf.getBoundingClientRect().top - k.getBoundingClientRect().top) };
  });
  if (dlgMass !== null && dlgMass.breit >= 1260 && dlgMass.sw > dlgMass.cw + 1) h.befund(`Grafik-Dialog: ${dlgMass.sw - dlgMass.cw} px breiter als sein Innenraum`);
  if (dlgMass !== null && dlgMass.kopf !== 0) h.befund(`Grafik-Dialog: Kopf ${dlgMass.kopf} px unter der Oberkante`);
  // R14: mittig (wie der Abbildungs-Dialog), „Schließen“ so dicht an der Kopfkante wie dort (8 px Innenabstand)
  if (dlgMass !== null && Math.abs(dlgMass.oben - dlgMass.unten) > 2) h.befund(`Grafik-Dialog nicht mittig (oben ${dlgMass.oben}, unten ${dlgMass.unten} px)`);
  if (dlgMass !== null && dlgMass.knopfAbKopf > 10) h.befund(`Grafik-Dialog: „Schließen“ ${dlgMass.knopfAbKopf} px unter der Kopfkante`);
  await h.axe('grafik-dialog');
  await seite.keyboard.press('Escape');
  await h.warte(100);
  if ((await seite.locator('dialog[open]').count()) !== 0) h.befund('Grafik-Dialog schließt nicht mit Esc');

  // Unterseiten des aktuellen Teils im Verzeichnis (gleiche Aufteilung wie die Quelle)
  const rollen = hilfe.kapitel.find((k) => k.unter.length > 0);
  if (rollen !== undefined) {
    await seite.evaluate((id) => { location.hash = `#hilfe/${id}`; }, rollen.unter[0].id);
    await seite.locator('.hilfe-unterliste').waitFor({ state: 'attached', timeout: 3000 });
    const n = await seite.locator('.hilfe-unterliste li').count();
    if (n !== rollen.unter.length) h.befund(`Verzeichnis: ${n} Unterseiten statt ${rollen.unter.length}`);
  }
  // R17: eine Rollenkarte ist als Ganzes Ziel ihres Links (Klick in die untere linke Ecke)
  await seite.evaluate(() => { location.hash = '#hilfe/rollen-anleitungen'; });
  const karte = seite.locator('.h-role-pick-card:has(> h2 > a)').nth(1);
  if (await karte.count() === 0) h.befund('Rollen-Anleitungen: keine Rollenkarte mit Link');
  else {
    await karte.scrollIntoViewIfNeeded();
    const kb = await karte.boundingBox();
    if (kb !== null) {
      await seite.mouse.click(kb.x + 6, kb.y + kb.height - 6);
      await h.warte(300);
      const ort = await seite.evaluate(() => location.hash);
      if (!ort.startsWith('#hilfe/rollen-anleitungen-')) h.befund(`Rollenkarte: Klick in die Karte führt nicht zur Anleitung (${ort})`);
    }
  }
}
