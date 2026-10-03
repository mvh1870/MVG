// Browser-Szenario Explore (P16.8, O-46): fünf Werkzeuge am Schulcampus – Rechner dreht die Rangfolge, Matrix ordnet
// ein, Vorgänge führen weiter, Takt, Glossar.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';

export const name = 'explore';
export const hash = '#explore';

/** Läuft im Browser: Rechteck des Beispiel-Punkts gegen das Rechteck des Zahlentexts (Range) je Zelle. */
function punktUeberZahl() {
  const funde = [];
  const zellen = [...document.querySelectorAll('.ex-zelle')].filter((z) => z.querySelector('.ex-zelle-punkt') !== null);
  if (zellen.length === 0) funde.push('keine Zelle mit Beispiel-Punkt gefunden');
  for (const z of zellen) {
    const punkt = z.querySelector('.ex-zelle-punkt')?.getBoundingClientRect();
    const zahl = [...z.children].find((k) => !k.classList.contains('ex-zelle-punkt'));
    if (punkt === undefined || zahl === undefined) continue;
    const rg = document.createRange();
    rg.selectNodeContents(zahl);
    for (const q of rg.getClientRects()) {
      const x = Math.min(punkt.right, q.right) - Math.max(punkt.left, q.left);
      const y = Math.min(punkt.bottom, q.bottom) - Math.max(punkt.top, q.top);
      if (x > 0 && y > 0) funde.push(`Beispiel-Punkt überdeckt die Zahl ${(zahl.textContent ?? '').trim()} (${x.toFixed(1)} × ${y.toFixed(1)} px)`);
    }
  }
  return funde;
}

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const pruefe = pruefer(seite, h);
  const verboten = async (wo) => { for (const f of sichtbarVerboten(await seite.locator('body').innerText())) h.befund(`${wo}: ${f}`); };
  await h.erwarte('[data-werkzeug="mcda"]');
  // Beispiel ist der Vergleich der Story (Lüftung): mit Geld 5 und Schulstart 3 liegt „Später einziehen“ vorn (C 51)
  await seite.locator('select[aria-label="Gewicht Geld"]').selectOption('5');
  await seite.locator('select[aria-label="Gewicht Schulstart"]').selectOption('3');
  await h.warte(100);
  if (!(await seite.locator('[data-pruef="ex-summe-C"]').evaluate((e) => e.classList.contains('ist-vorn')))) h.befund('Rechner: mit Geld 5, Schulstart 3 liegt „Später einziehen“ nicht vorn');
  await verboten('mcda');
  await pruefe('mcda');
  await h.klick('[data-pruef="ex-matrix"]');
  await h.erwarte('[data-werkzeug="matrix"]');
  await h.klick('.ex-zelle[data-w="1"][data-a="5"]');
  await h.erwarte('[data-pruef="ex-matrix-detail"]:has-text("Vorrangig")');
  await pruefe('matrix');
  // R67: der Beispiel-Punkt überdeckt nie die Zahl der Zelle – in der Laufgröße und schmal (400, 380, 320 px)
  const vp = seite.viewportSize();
  for (const breite of vp !== null && vp.width <= 400 ? [vp.width, 380, 320] : [vp?.width ?? 0]) {
    if (vp !== null && breite !== vp.width) { await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150); }
    for (const fund of await seite.evaluate(punktUeberZahl)) h.befund(`matrix @${breite}: ${fund}`);
  }
  if (vp !== null) { await seite.setViewportSize(vp); await h.warte(100); }
  await h.klick('[data-pruef="ex-vorgaenge"]');
  await h.klick('[data-pruef="ex-art-problem"]');
  await h.klick('.ex-weg[data-ziel="aenderung"]');
  await h.erwarte('.ex-art[data-art="aenderung"][aria-pressed="true"]');
  await pruefe('vorgaenge');
  await h.klick('[data-pruef="ex-takt"]');
  await h.erwarte('[data-pruef="ex-takt-monat"]');
  await verboten('takt');
  await pruefe('takt');
  await h.klick('[data-pruef="ex-glossar"]');
  await h.erwarte('[data-pruef="glossar-suche"]');
  await pruefe('glossar');
}
