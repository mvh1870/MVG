// Browser-Szenario Story (P17.4, O-51/O-52): Hauptweg mit Szene, Frage, Folge und Balken, Mini-Aufgaben per Tastatur,
// Vergleich mit Stufen, Schulstart mit Bilanz; Kurzfassung mit Brücken und Aufklappern (P17.5); Fokus nie auf <body>, axe, Layout bei
// 320/400/1024/1280 px (pruefer misst schmal auch bei 320 px), keine verbotenen Wörter, Fortschritt löschen.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';
import { pdfSeiten, seitenMitUeberschriftAmEnde } from './pdf.mjs';

export const name = 'story';
export const hash = '#story';
export const viewports = [
  { breite: 1280, hoehe: 720 },
  { breite: 1024, hoehe: 768 },
  { breite: 400, hoehe: 800 },
];

/**
 * R67 (WCAG 2.4.11 Fokus nicht verdeckt): per Tab und Shift+Tab durch den Schritt; jedes fokussierte Element in der
 * Bühne ist zu mindestens 50 % frei sichtbar – nicht unter der klebenden Leiste oben und nicht unter der Navigation unten.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} wo
 */
async function fokusFrei(seite, h, wo) {
  for (const richtung of ['Tab', 'Shift+Tab']) {
    await seite.evaluate((vor) => {
      window.scrollTo(0, vor ? 0 : document.documentElement.scrollHeight);
      /** @type {HTMLElement | null} */ (document.querySelector(vor ? '.gs-titel' : '[data-pruef="fortschritt-loeschen"]'))?.focus({ preventScroll: true });
    }, richtung === 'Tab');
    const gesehen = new Set();
    let gemessen = 0;
    for (let i = 0; i < 80; i++) {
      await h.taste(richtung);
      await h.warte(30);
      const r = await seite.evaluate(() => {
        const e = document.activeElement;
        if (!(e instanceof HTMLElement) || e === document.body) return null;
        if (e.closest('.gs-buehne') === null) return { aussen: true, id: '' };
        const q = e.getBoundingClientRect();
        const oben = document.querySelector('.gs-leiste')?.getBoundingClientRect().bottom ?? 0;
        const unten = document.querySelector('.gs-unten')?.getBoundingClientRect().top ?? innerHeight;
        const band = Math.max(0, Math.min(innerHeight, unten) - Math.max(0, oben));
        const frei = Math.max(0, Math.min(q.bottom, unten, innerHeight) - Math.max(q.top, oben, 0));
        const id = `${[...document.querySelectorAll('*')].indexOf(e)} ${e.tagName.toLowerCase()}[${e.getAttribute('data-pruef') ?? ''}]`;
        return { aussen: false, id, frei: Math.round(frei), hoehe: Math.round(Math.min(q.height, band)) };
      });
      if (r === null) continue;
      if (r.aussen) { if (gemessen > 0) break; continue; }
      if (gesehen.has(r.id)) break;
      gesehen.add(r.id);
      gemessen += 1;
      if (r.frei < r.hoehe * 0.5) h.befund(`${wo} ${richtung}: Fokus verdeckt ${r.id} (frei ${r.frei}/${r.hoehe} px)`);
    }
    if (gemessen < 3) h.befund(`${wo} ${richtung}: nur ${gemessen} Elemente im Schritt per Tastatur erreicht`);
  }
}

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const pruefe = pruefer(seite, h);
  const verboten = async (wo) => { for (const f of sichtbarVerboten(await seite.locator('body').innerText())) h.befund(`${wo}: ${f}`); };
  const weiter = async () => { await h.klick('[data-pruef="weiter"]'); await h.warte(80); };
  const fokus = () => seite.evaluate(() => (document.activeElement === document.body ? 'BODY' : document.activeElement?.getAttribute('data-pruef') ?? document.activeElement?.tagName ?? ''));
  const teil = () => seite.evaluate(() => document.body.dataset['teil'] ?? '');
  const breit = seite.viewportSize()?.width === 1280;
  // O-53 (R72): auch der Schritt der Mini-Aufgabe zeigt eine Grafik – breit die große, schmal die kleinen auf den Karten
  const grafikDa = async (wo) => {
    const mass = await seite.evaluate(() => Math.max(0, ...[...document.querySelectorAll('article.gs-schritt .gs-gegenstand svg')].map((x) => x.getBoundingClientRect().width)));
    if (mass < (breit ? 60 : 32)) h.befund(`${wo}: keine Grafik (größte ${Math.round(mass)} px)`);
  };

  // Auftakt: Figuren und Balken
  await h.erwarte('[data-pruef="figur-faden"] svg');
  await verboten('Auftakt');
  await pruefe('auftakt');
  await h.klick('[data-pruef="fassung-lang"]');
  await h.erwarte('.gs-dialog .gs-zeile[data-figur="grundstein"]');
  if ((await fokus()) !== 'gs-titel') h.befund(`Kapitel 1: Fokus nach dem Start auf ${await fokus()}`);
  await verboten('1 Szene');
  await pruefe('k1-szene');
  await weiter();
  // ohne Wahl kein Weiter – Hinweis, Fokus auf der ersten Antwort
  await weiter();
  await h.erwarte('.gs-navi-hinweis:has-text("wählen")');
  if ((await fokus()) !== 'antwort-1') h.befund(`Frage ohne Wahl: Fokus auf ${await fokus()}`);
  // Wahl per Tastatur: die gute Antwort steht auf Platz 2
  await seite.locator('[data-pruef="antwort-2"]').focus();
  await h.taste('Enter');
  await h.erwarte('[data-pruef="gs-folge"]');
  if ((await fokus()) !== 'gs-folge-titel') h.befund(`nach der Wahl: Fokus auf ${await fokus()}, erwartet die Folge`);
  const wort = (await seite.locator('[data-pruef="wort-vertrauen"]').innerText()).trim();
  if (!/deutlich gestiegen/u.test(wort)) h.befund(`Folge 1: Vertrauen „${wort}“, erwartet „deutlich gestiegen“`);
  const ansage = await seite.locator('[data-pruef="gs-ansage"]').innerText();
  if (!/Vertrauen: deutlich gestiegen/u.test(ansage)) h.befund(`Ansage nach der Wahl: „${ansage}“`);
  await verboten('1 Folge');
  await pruefe('k1-folge');
  if (breit) await fokusFrei(seite, h, 'k1-folge');

  // Kapitel 2: Frage, dann Mini-Aufgabe per Tastatur
  await weiter();
  await weiter();
  await h.klick('[data-pruef="antwort-1"]');
  await weiter();
  if ((await teil()) !== 'mini') h.befund(`nach Kapitel 2 kein Schritt „Mini-Aufgabe“ (${await teil()})`);
  await seite.locator('[data-pruef="wahl-1-fruehwarnung"]').focus();
  await h.taste('Enter');
  await h.warte(60);
  if ((await fokus()) !== 'wahl-1-fruehwarnung') h.befund(`Mini zuordnen: Fokus nach Enter auf ${await fokus()}`);
  await h.taste('Tab');
  await h.taste('Enter');
  await h.warte(60);
  const lage2 = await seite.locator('[data-pruef="posten-1"]').getAttribute('data-lage');
  if (lage2 !== 'falsch') h.befund(`Mini zuordnen: nach Umentscheiden per Tastatur Lage „${lage2}“, erwartet falsch`);
  await h.erwarte('[data-pruef="rueck-1"]:has-text("Nicht ganz")');
  await verboten('2 Mini');
  await grafikDa('2 Mini');
  await pruefe('k2-mini');

  // Kapitel 6: Reihenfolge
  await seite.goto(h.url.replace(/#.*$/u, '') + '#story/k6');
  await h.erwarte('[data-pruef="gs-titel"]:has-text("Ärger auf der Baustelle")');
  await weiter();
  await h.klick('[data-pruef="antwort-1"]');
  await weiter();
  for (const n of [1, 2, 3, 4, 6, 5]) { await seite.locator(`[data-pruef="reihe-${n}"]`).focus(); await h.taste(' '); await h.warte(40); }
  const stand6 = (await seite.locator('[data-pruef="mini-stand"]').innerText()).trim();
  if (stand6 !== '4 von 6 richtig.') h.befund(`Mini Reihenfolge: „${stand6}“, erwartet „4 von 6 richtig.“`);
  if ((await fokus()) !== 'reihe-5') h.befund(`Mini Reihenfolge: Fokus auf ${await fokus()}`);
  await grafikDa('6 Mini');
  // gelöst: die Karten stehen in der richtigen Reihenfolge, als Pfad verbunden
  const folge6 = await seite.locator('[data-pruef="mini-reihe"] > li').evaluateAll((l) => l.map((x) => x.getAttribute('data-pruef')).join(','));
  if (folge6 !== 'posten-1,posten-2,posten-3,posten-4,posten-5,posten-6') h.befund(`Mini Reihenfolge gelöst: Karten in der Folge ${folge6}`);
  await pruefe('k6-mini');

  // Kapitel 7: Vergleich
  await seite.goto(h.url.replace(/#.*$/u, '') + '#story/k7');
  await weiter();
  if ((await teil()) !== 'vergleich') h.befund(`Kapitel 7: Schritt „${await teil()}“, erwartet der Vergleich`);
  const vorn = async () => (await seite.locator('[data-pruef="gs-vgl-vorn"]').innerText()).trim();
  if (!/„Ersatzgerät“ mit 49 Punkten/u.test(await vorn())) h.befund(`Vergleich abgestimmt: ${await vorn()}`);
  await seite.locator('[data-pruef="stufe-klima-3"]').focus();
  await h.taste('Enter');
  await h.warte(80);
  if (!/Gleichauf vorn/u.test(await vorn())) h.befund(`Vergleich Klima wichtig: ${await vorn()}`);
  if ((await fokus()) !== 'stufe-klima-3') h.befund(`Vergleich: Fokus nach der Stufe auf ${await fokus()}`);
  // die Karte „Später einziehen“ rückt sichtbar nach vorn
  const reihe = await seite.locator('.gs-vgl-karte').evaluateAll((k) => k.map((e) => ({ id: e.getAttribute('data-option'), x: Math.round(e.getBoundingClientRect().left + e.getBoundingClientRect().top * 10) })).sort((a, b) => a.x - b.x).map((e) => e.id).join(''));
  if (!reihe.startsWith('AC')) h.befund(`Vergleich: sichtbare Reihenfolge ${reihe}, erwartet A, C, B`);
  await verboten('7 Vergleich');
  await pruefe('k7-vergleich');
  await h.klick('[data-pruef="gewichte-abgestimmt"]');
  await h.warte(60);
  if ((await fokus()) === 'BODY') h.befund('Vergleich: Fokus nach „Abgestimmte Gewichte“ auf <body>');
  await weiter();
  await h.klick('[data-pruef="antwort-2"]');

  // per Tastatur bis zum Schulstart
  for (let i = 0; i < 6; i++) {
    if ((await teil()) === 'ende') break;
    if ((await teil()) === 'frage' && !(await seite.locator('.gs-antwort[aria-pressed="true"]').count())) await h.klick('[data-pruef="antwort-1"]');
    await seite.locator('.gs-titel').focus();
    await h.taste('ArrowRight');
    await h.warte(80);
  }
  await h.erwarte('[data-pruef="gs-bilanz-titel"]');
  await verboten('Schulstart');
  await pruefe('schulstart');
  // R73: Strg+P am Ende des langen Wegs als echtes PDF (page.pdf löst beforeprint aus) – kein Kopf allein am Seitenende,
  // keine fast leere Seite; „So macht man es gut“ steht nur bei Kapiteln mit Wahl
  if (breit) {
    const koepfe = await seite.evaluate(() => ['So macht man es gut', ...[...document.querySelectorAll('[data-pruef="gs-fortschritt"] [data-art="kapitel"]')].map((x) => (x.getAttribute('title') ?? '').replace(/^\d+ von \d+ · /u, ''))]);
    await seite.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
    const pdf = await pdfSeiten(await seite.pdf({ format: 'A4' }));
    await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
    const amEnde = seitenMitUeberschriftAmEnde(pdf, koepfe);
    if (amEnde.length > 0) h.befund(`Story-Druck: Überschrift am Seitenende ${JSON.stringify(amEnde.slice(0, 4))}`);
    const fastLeer = pdf.slice(0, -1).map((x, i) => ({ s: i + 1, f: x.fuellung ?? 1 })).filter((x) => x.f < 0.25);
    if (fastLeer.length > 0) h.befund(`Story-Druck: fast leere Seite ${JSON.stringify(fastLeer)}`);
    const text = pdf.flatMap((x) => x.zeilen).join(' ');
    if (!/Ihre Bilanz/u.test(text)) h.befund('Story-Druck am Ende ohne Bilanz');
    if (koepfe.length < 9) h.befund(`Story-Druck: nur ${koepfe.length - 1} Kapiteltitel gelesen`);
  }

  // Kurzfassung: Brücken und Bilanz
  await h.klick('[data-pruef="von-vorn"]');
  await h.erwarte('[data-pruef="fassung-kurz"]');
  await h.klick('[data-pruef="fassung-kurz"]');
  // Kurzfassung kürzer (P17.5): „Das steckt dahinter“ und Kipppunkte zugeklappt, per Tastatur aufklappbar
  const zu = (sel) => seite.evaluate((s) => { const d = document.querySelector(s); return d instanceof HTMLDetailsElement ? !d.open : null; }, sel);
  let folgeGeprueft = false;
  for (let i = 0; i < 14; i++) {
    const t = await teil();
    if (t === 'ende') break;
    if (t === 'frage') await h.klick('[data-pruef="antwort-1"]');
    if (t === 'frage' && !folgeGeprueft) {
      folgeGeprueft = true;
      if ((await zu('[data-pruef="gs-dahinter-auf"]')) !== true) h.befund('Kurzfassung: „Das steckt dahinter“ nicht zugeklappt');
      await seite.locator('[data-pruef="gs-dahinter-auf"] > summary').focus();
      await h.taste('Enter');
      await h.warte(60);
      if ((await zu('[data-pruef="gs-dahinter-auf"]')) !== false) h.befund('Kurzfassung: „Das steckt dahinter“ per Enter nicht aufgeklappt');
      await pruefe('kurz-folge');
    }
    if (t === 'vergleich') {
      if ((await zu('[data-pruef="gs-kipp"]')) !== true) h.befund('Kurzfassung: Kipppunkte nicht zugeklappt');
      await pruefe('kurz-vergleich');
    }
    await weiter();
  }
  await h.erwarte('[data-pruef="bruecke-k8"]');
  const ort = (await seite.locator('[data-pruef="gs-ort"]').textContent()) ?? '';
  if (!/Ende/u.test(ort)) h.befund(`Kurzfassung: Ort am Ende „${ort}“`);
  await pruefe('kurz-ende');

  // Fortschritt löschen → Auftakt, Fokus nicht auf <body>
  await h.klick('[data-pruef="fortschritt-loeschen"]');
  await h.erwarte('[data-pruef="fassung-lang"]');
  if ((await fokus()) === 'BODY') h.befund('nach „Fortschritt löschen“ Fokus auf <body>');
}
