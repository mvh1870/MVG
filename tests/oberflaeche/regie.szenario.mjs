// Browser-Szenario Regie und Leinwand (O-9, P16.9): die Regie steuert, die Leinwand zeigt denselben Stand – ohne
// Regie-Notiz. Nur in der breiten Ansicht (die Regie ist ein Pult am Laptop).
import { pruefeLayout } from './hilfen.mjs';

export const name = 'regie';
export const hash = '#regie';
export const viewports = [{ breite: 1280, hoehe: 720 }];

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  await h.erwarte('[data-pruef="regie"]');
  const leinwand = await h.zweitesFenster('#leinwand');
  await h.erwarte('[data-pruef="leinwand-warten"], .anzeige', leinwand);
  await h.klick('[data-pruef="regie-bereich-story"]');
  // Sprung zu Kapitel 7: Notiz nur in der Regie; im Vergleich stellt die Regie eine Stufe, an der Frage wählt sie
  await seite.locator('[data-pruef="regie-sprung"]').selectOption('k7');
  await h.erwarte('[data-pruef="regie-notiz"] .regie-notiz-text');
  await h.klick('[data-pruef="regie-weiter"]');
  await h.klick('[data-pruef="regie-stufe-klima-3"]');
  await h.warte(300);
  await h.erwarte('.anzeige [data-pruef="gs-vgl-vorn"]:has-text("Gleichauf")', leinwand);
  await h.klick('[data-pruef="regie-weiter"]');
  await h.klick('[data-pruef="regie-wahl-2"]');
  await h.warte(400);
  await h.erwarte('.anzeige [data-pruef="gs-titel"]:has-text("Die große Entscheidung")', leinwand);
  const gewaehlt = await leinwand.locator('.anzeige .gs-antwort[data-platz="1"][aria-pressed="true"]').count();
  if (gewaehlt !== 1) h.befund('Leinwand zeigt die Kundenwahl 2 nicht');
  if ((await leinwand.locator('.anzeige [data-pruef="gs-folge"]').count()) !== 1) h.befund('Leinwand zeigt die Folge der Wahl nicht');
  const notiz = (await seite.locator('[data-pruef="regie-notiz"] .regie-notiz-text').innerText()).slice(0, 40);
  if ((await leinwand.locator('body').innerText()).includes(notiz)) h.befund('Regie-Notiz auf der Leinwand');
  await h.erwarte('[data-pruef="leinwand-status"][data-status="ok"]');
  // Theorie und Explore auf der Leinwand
  await seite.locator('[data-pruef="regie-thema"]').selectOption('verantwortung');
  await h.erwarte('.anzeige [data-thema="verantwortung"]', leinwand);
  // R69: ein spätes Thema – der aktuelle Eintrag des Themenverzeichnisses rollt auf der Leinwand in den sichtbaren Teil
  const spaet = await seite.locator('[data-pruef="regie-thema"] option').evaluateAll((o) => o.map((x) => /** @type {HTMLOptionElement} */ (x).value).filter((v) => v !== '').at(-1) ?? '');
  // niedriges Fenster (Beamer mit wenig Höhe), damit das Verzeichnis überläuft; danach wieder die volle Größe
  const groesse = leinwand.viewportSize();
  await leinwand.setViewportSize({ width: groesse?.width ?? 1280, height: 420 });
  await seite.locator('[data-pruef="regie-thema"]').selectOption(spaet);
  await h.erwarte(`.anzeige [data-thema="${spaet}"]`, leinwand);
  await h.warte(200);
  const verzeichnis = await leinwand.evaluate(() => {
    const v = document.querySelector('.anzeige .kapitel-verzeichnis');
    const a = v?.querySelector('[aria-current="page"]');
    if (!v || !a) return 'fehlt';
    if (v.scrollHeight <= v.clientHeight + 1) return `passt (${v.scrollHeight}/${v.clientHeight}, ${v.tagName}, open=${v.hasAttribute('open')}, ${innerWidth}×${innerHeight})`;
    const vr = v.getBoundingClientRect();
    const ar = a.getBoundingClientRect();
    return ar.top >= vr.top - 1 && ar.bottom <= vr.bottom + 1 ? 'sichtbar' : `außerhalb (${Math.round(ar.top - vr.top)} px, Höhe ${Math.round(vr.height)})`;
  });
  if (groesse !== null) await leinwand.setViewportSize(groesse);
  // „passt“ ist ebenfalls ein Befund: ohne Überlauf prüfte die Probe nichts
  if (verzeichnis !== 'sichtbar') h.befund(`Leinwand: aktueller Eintrag „${spaet}“ im Themenverzeichnis: ${verzeichnis}`);
  await seite.locator('[data-pruef="regie-werkzeug"]').selectOption('matrix');
  await h.erwarte('.anzeige [data-werkzeug="matrix"]', leinwand);
  // R68: die Vorschau zeigt die Leinwand mit deren Schrift – axe misst sie nicht (aria-hidden); Text gegen Weiß ≥ 4,5:1
  const blass = await seite.evaluate(() => {
    const lum = (/** @type {string} */ c) => { const m = c.match(/[\d.]+/gu)?.map(Number) ?? [0, 0, 0]; const f = (/** @type {number} */ v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(m[0] ?? 0) + 0.7152 * f(m[1] ?? 0) + 0.0722 * f(m[2] ?? 0); };
    return [...document.querySelectorAll('.vorschau-buehne p, .vorschau-buehne li')].filter((el) => (el.textContent ?? '').trim() !== '')
      .filter((el) => 1.05 / (lum(getComputedStyle(el).color) + 0.05) < 4.5).length;
  });
  if (blass > 0) h.befund(`regie: ${blass} Absätze der Vorschau mit heller Schrift`);
  for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`regie: ${fund}`);
  await h.axe('regie');
  await h.axe('leinwand', leinwand);
  await h.bild('regie');
  await h.bild('leinwand', leinwand);
}
