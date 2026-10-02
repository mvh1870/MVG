// Browser-Szenario Story (P16.6, O-40): Kurzfassung vom Auftakt bis zum Schulstart – Vorlage mit Vergleich und
// Gegenprobe, Kundenwahl, Status, Vertiefungen, Fortschritt löschen; Permalink auf eine Station.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';

export const name = 'story';
export const hash = '#story';

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const pruefe = pruefer(seite, h);
  const titel = async () => (await seite.locator('[data-pruef="gs-titel"]').first().innerText()).trim();
  const verboten = async (wo) => { for (const f of sichtbarVerboten(await seite.locator('body').innerText())) h.befund(`${wo}: ${f}`); };
  const weiter = async () => { await h.klick('[data-pruef="weiter"]'); await h.warte(120); };

  await h.erwarte('[data-pruef="gs-titel"]');
  await verboten('Auftakt');
  await h.klick('[data-pruef="fassung-kurz"]');
  await pruefe('auftakt');
  await weiter();
  // Station 1: Lage mit Bericht und Bestand
  await h.erwarte('[data-pruef="gs-bericht"]');
  await h.klick('[data-pruef="gs-bestand"] summary');
  await h.erwarte('[data-pruef^="vorgang-"]');
  await verboten('S1 Lage');
  if (!h.voll && h.viewport.breite !== 1280) {
    // schmaler Lauf: nur Auftakt und Lage messen, dann die Fortsetzung über den Permalink
  }
  await pruefe('s1-lage');
  await weiter();
  // Vorlage ohne Wahl: kein Weiter
  await weiter();
  await h.erwarte('.gs-navi-hinweis:has-text("wählen")');
  await h.klick('[data-pruef="option-A"]');
  await pruefe('s1-vorlage');
  await weiter();
  await h.erwarte('[data-pruef="gs-entscheidung"]');
  await h.klick('[data-pruef="gs-so-laeuft"] summary');
  await h.klick('[data-pruef="gs-einwand"] summary');
  await pruefe('s1-folge');
  await weiter();
  await weiter();
  // Station 3: Vergleich 54/42/40, Gegenprobe dreht die Spitze
  const a = (await seite.locator('[data-pruef="summe-A"]').innerText()).trim();
  if (!a.startsWith('54')) h.befund(`S3: Summe A ${a}, erwartet 54`);
  await h.klick('[data-pruef="gs-gegenprobe"] summary');
  await seite.locator('[data-pruef="gegenprobe"] input[data-kriterium="termin"]').fill('1');
  await h.warte(100);
  const vorn = await seite.locator('.gs-tabelle .ist-vorn').first().getAttribute('data-pruef');
  if (vorn !== 'summe-B') h.befund(`S3 Gegenprobe Termin 1: vorn ${vorn}, erwartet summe-B`);
  await pruefe('s3-vorlage');
  await h.klick('[data-pruef="option-B"]');
  await weiter();
  const puffer = await seite.locator('[data-pruef="gs-status"] [data-status="puffer"] dd').innerText();
  if (!/7\sTage/u.test(puffer)) h.befund(`S3 Folge: Puffer „${puffer}“, erwartet 7 Tage`);
  // per Tastatur weiter bis zum Ende (Vorlagen mit der Empfehlung)
  for (let i = 0; i < 12; i++) {
    const s = await seite.evaluate(() => document.body.dataset['teil']);
    if (s === 'ende') break;
    if (s === 'vorlage') await h.klick('.gs-option .gs-marke:has-text("empfohlen")');
    await h.taste('ArrowRight');
    await h.warte(120);
  }
  await h.erwarte('[data-pruef="gs-urteil"]');
  const bilanz = await seite.locator('[data-pruef="gs-bilanz"] li').count();
  if (bilanz !== 8) h.befund(`Bilanz mit ${bilanz} Stationen, erwartet 8`);
  await verboten('Schulstart');
  await pruefe('schulstart');
  // Fortschritt löschen → Auftakt
  await h.klick('[data-pruef="fortschritt-loeschen"]');
  if ((await titel()) !== 'Sie vertreten den Bauherrn') h.befund(`nach „Fortschritt löschen“: ${await titel()}`);
  // Permalink auf eine Station der ganzen Geschichte
  await seite.goto(h.url.replace(/#.*$/u, '') + '#story/s6');
  await h.erwarte('[data-pruef="gs-titel"]:has-text("Brandschutz")');
  await weiter();
  await h.erwarte('[data-pruef="gs-unvollstaendig"]');
  await pruefe('s6-vorlage');
}
