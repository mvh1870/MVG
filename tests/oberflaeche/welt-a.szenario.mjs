// Browser-Szenario Welt A (P3.8-Abnahme, L-29): auf der Entwurfs-Vorschau (ganzer Entscheidungsgraph)
// spielt jede Rolle vom Prolog bis zum Wendepunkt; an jeder Station Layout-Prüfung und axe.
// Bei 1280×720 alle sechs Rollen, in den anderen Größen die Bauherren-PL (Laufzeit der Kette).

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
    await h.klick('[data-pruef="weiter"]');
    const gesehen = new Set();
    for (let i = 0; i < 120; i++) {
      const st = await station();
      if (st === 'wendepunkt') break;
      if (STATIONEN.includes(st) && !gesehen.has(st)) {
        gesehen.add(st);
        await h.warte(900);
        for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${rolle}/${st}: ${fund}`);
        await h.axe(`${rolle}/${st}`);
        if (rolle === 'pl') await h.bild(`${st}-einstieg`);
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
    for (const st of STATIONEN) if (!gesehen.has(st)) h.befund(`${rolle}: Station ${st} nicht erreicht (Weg bis ${await station()})`);
    if ((await station()) !== 'wendepunkt') h.befund(`${rolle}: Wendepunkt nicht erreicht (steht in ${await station()})`);
  }
}
