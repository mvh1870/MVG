// Browser-Szenario Story (P16.6, O-40): Kurzfassung vom Auftakt bis zum Schulstart – Vorlage mit Vergleich und
// Gegenprobe, Kundenwahl, Status, Vertiefungen, Fortschritt löschen; Permalink auf eine Station.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';

export const name = 'story';
export const hash = '#story';

/**
 * R67 (WCAG 2.4.11 Fokus nicht verdeckt): von oben per Tab und von unten per Shift+Tab durch den Schritt; jedes
 * fokussierte Element außerhalb der Leisten ist zu mindestens 50 % frei sichtbar – nicht unter .gs-leiste und nicht
 * unter dem deckenden Teil von .gs-unten (ab dem Hinweis bzw. 55 % des Verlaufs, was höher liegt).
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} wo
 */
async function fokusFrei(seite, h, wo) {
  for (const richtung of ['Tab', 'Shift+Tab']) {
    // Tab beginnt am Titel des Schritts (oben), Shift+Tab hinter dem Schritt in der Fußzeile
    await seite.evaluate((vor) => {
      window.scrollTo(0, vor ? 0 : document.documentElement.scrollHeight);
      /** @type {HTMLElement | null} */ (document.querySelector(vor ? '.gs-titel' : '[data-pruef="fortschritt-loeschen"]'))?.focus({ preventScroll: true });
    }, richtung === 'Tab');
    const gesehen = new Set();
    let gemessen = 0;
    for (let i = 0; i < 80; i++) {
      await h.taste(richtung);
      await h.warte(40);
      const r = await seite.evaluate(() => {
        const e = document.activeElement;
        if (!(e instanceof HTMLElement) || e === document.body) return null;
        if (e.closest('.gs-leiste, .gs-unten, .seiten-kopf, .seiten-fuss, footer')) return { aussen: true, id: '' };
        if (e.closest('.gs-buehne') === null) return { aussen: true, id: '' };
        const q = e.getBoundingClientRect();
        const oben = document.querySelector('.gs-leiste')?.getBoundingClientRect();
        const unten = document.querySelector('.gs-unten')?.getBoundingClientRect();
        const hinweis = document.querySelector('.gs-navi-hinweis')?.getBoundingClientRect();
        const deckOben = oben ? oben.bottom : 0;
        const deckUnten = unten && hinweis ? Math.min(hinweis.top, unten.top + unten.height * 0.55) : innerHeight;
        const band = Math.max(0, Math.min(innerHeight, deckUnten) - Math.max(0, deckOben));
        const frei = Math.max(0, Math.min(q.bottom, deckUnten, innerHeight) - Math.max(q.top, deckOben, 0));
        const name = (e.getAttribute('aria-label') ?? e.textContent ?? '').trim().slice(0, 30) || (e.closest('label, .gs-regler-zeile')?.textContent ?? '').trim().slice(0, 30);
        const id = `${[...document.querySelectorAll('*')].indexOf(e)} ${e.tagName.toLowerCase()}[${e.getAttribute('data-pruef') ?? ''}] „${name}“`;
        return { aussen: false, id, frei: Math.round(frei), hoehe: Math.round(Math.min(q.height, band)) };
      });
      if (r === null) continue;
      if (r.aussen) { if (gemessen > 0) break; continue; }
      if (gesehen.has(r.id)) break;
      gesehen.add(r.id);
      gemessen += 1;
      if (r.frei < r.hoehe * 0.5) h.befund(`${wo} ${richtung}: Fokus verdeckt ${r.id} (frei ${r.frei}/${r.hoehe} px)`);
    }
    if (gemessen < 5) h.befund(`${wo} ${richtung}: nur ${gemessen} Elemente im Schritt per Tastatur erreicht`);
  }
}

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
  // R68 (WCAG 2.1.1, 3.2.2): Pfeiltasten am Gewichte-Regler ändern das Gewicht – der Fokus bleibt, die Story blättert nicht
  {
    const regler = '.gs-gewichte input[data-kriterium="termin"]';
    await seite.locator(regler).focus();
    const vorher = Number(await seite.locator(regler).inputValue());
    await h.taste('ArrowLeft');
    await h.warte(60);
    await h.taste('ArrowLeft');
    await h.warte(60);
    const r = await seite.evaluate((sel) => ({
      fokus: document.activeElement?.getAttribute('data-pruef') ?? document.activeElement?.tagName ?? '',
      teil: document.body.dataset['teil'] ?? '',
      wert: /** @type {HTMLInputElement | null} */ (document.querySelector(sel))?.value ?? null,
    }), regler);
    const nachher = Number(r.wert);
    if (r.fokus !== 'gewichte-termin') h.befund(`S1 Gewichte: Fokus nach zwei Pfeiltasten auf ${r.fokus}, erwartet der Regler`);
    if (r.teil !== 'vorlage') h.befund(`S1 Gewichte: Pfeiltaste am Regler hat geblättert (Teil ${r.teil})`);
    if (nachher !== vorher - 2) h.befund(`S1 Gewichte: Termin ${nachher}, erwartet ${vorher - 2}`);
  }
  // die Wahl setzt die Gewichte auf die gewählte Variante zurück
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
  // R67 (WCAG 2.4.11): Tab und Shift+Tab durch die Vorlage mit offener Gegenprobe – kein Fokus unter den klebenden Leisten
  await fokusFrei(seite, h, 's3-vorlage');
  const vp = seite.viewportSize();
  if (vp !== null && vp.width <= 400) {
    await seite.setViewportSize({ width: 320, height: 640 }); await h.warte(150);
    await fokusFrei(seite, h, 's3-vorlage @320×640');
    await seite.setViewportSize(vp); await h.warte(100);
  }
  await h.klick('[data-pruef="option-B"]');
  // R70 (WCAG 2.4.3): „zurücksetzen“ per Tastatur – Vergleich wieder mit den geltenden Gewichten, der Fokus bleibt auf
  // dem Knopf (nicht <body>), die Gegenprobe bleibt offen, Pfeil rechts blättert dort nicht
  {
    if (!(await seite.locator('[data-pruef="gs-gegenprobe"]').evaluate((d) => /** @type {HTMLDetailsElement} */ (d).open))) await h.klick('[data-pruef="gs-gegenprobe"] summary');
    await seite.locator('[data-pruef="gegenprobe"] input[data-kriterium="termin"]').fill('1');
    await h.warte(100);
    await seite.locator('[data-pruef="gegenprobe-zurueck"]').focus();
    await h.taste('Enter');
    await h.warte(100);
    const r = await seite.evaluate(() => ({
      fokus: document.activeElement === document.body ? 'BODY' : document.activeElement?.getAttribute('data-pruef') ?? document.activeElement?.tagName ?? '',
      offen: /** @type {HTMLDetailsElement | null} */ (document.querySelector('[data-pruef="gs-gegenprobe"]'))?.open ?? false,
      a: document.querySelector('[data-pruef="summe-A"]')?.textContent?.trim() ?? '',
    }));
    if (r.fokus !== 'gegenprobe-zurueck') h.befund(`S3 Gegenprobe zurücksetzen: Fokus auf ${r.fokus}, erwartet der Knopf`);
    if (!r.offen) h.befund('S3 Gegenprobe zurücksetzen: Gegenprobe zugeklappt');
    if (!r.a.startsWith('54')) h.befund(`S3 Gegenprobe zurücksetzen: Summe A ${r.a}, erwartet wieder 54`);
    await h.taste('ArrowRight');
    await h.warte(150);
    const teil = await seite.evaluate(() => document.body.dataset['teil'] ?? '');
    if (teil !== 'vorlage') h.befund(`S3 Gegenprobe zurücksetzen: Pfeil rechts am Knopf hat geblättert (Teil ${teil})`);
  }
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
