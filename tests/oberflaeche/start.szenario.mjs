// Browser-Szenario Startseite (O-21, O-42, O-44, P16.11): drei Wege, „Wer steht dahinter“ mit dem leisen Link zu
// bauherr-mentoren.com, Impressum und Datenschutz im Fuß, Wortlaut „Internetseite“. Ausgeführt von werkzeuge/oberflaeche.mjs.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';

export const name = 'start';

/**
 * Kontrast des Leittexts gegen die Pixel des Hintergrunds darunter: Text unsichtbar, Bildschirmfoto der Zeilen,
 * je Pixel das Kontrastverhältnis zur Textfarbe; Befund, wenn das 5-%-Perzentil unter 4,5 : 1 liegt.
 * @param {import('playwright').Page} seite
 * @returns {Promise<string[]>}
 */
async function leittextKontrast(seite) {
  const zeilen = await seite.evaluate(() => [...document.querySelectorAll('.start-these, .start-internetseite')].map((el) => {
    const rg = document.createRange();
    rg.selectNodeContents(el);
    return { name: el.className, farbe: getComputedStyle(el).color, rects: [...rg.getClientRects()].filter((r) => r.width > 0).map((r) => ({ x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height })) };
  }));
  const stil = await seite.addStyleTag({ content: '.startseite * { color: transparent !important; text-shadow: none !important; }' });
  /** @type {string[]} */
  const funde = [];
  for (const z of zeilen) {
    if (z.rects.length === 0) { funde.push(`${z.name}: keine Zeilen gefunden`); continue; }
    const x = Math.max(0, Math.floor(Math.min(...z.rects.map((r) => r.x))));
    const y = Math.max(0, Math.floor(Math.min(...z.rects.map((r) => r.y))));
    const w = Math.ceil(Math.max(...z.rects.map((r) => r.x + r.w))) - x;
    const hh = Math.ceil(Math.max(...z.rects.map((r) => r.y + r.h))) - y;
    const bild = (await seite.screenshot({ clip: { x, y, width: w, height: hh }, fullPage: true })).toString('base64');
    const werte = await seite.evaluate(async ([b64, farbe, rects, ox, oy]) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const k = c.getContext('2d');
      if (k === null) return null;
      k.drawImage(img, 0, 0);
      const d = k.getImageData(0, 0, img.width, img.height).data;
      const sx = img.width / /** @type {number} */ (rects.reduce((m, r) => Math.max(m, r.x + r.w), 0) - ox);
      const lum = (/** @type {number[]} */ rgb) => { const f = (/** @type {number} */ v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(rgb[0] ?? 0) + 0.7152 * f(rgb[1] ?? 0) + 0.0722 * f(rgb[2] ?? 0); };
      const m = /rgba?\((\d+), (\d+), (\d+)/u.exec(farbe);
      if (m === null) return null;
      const lt = lum([Number(m[1]), Number(m[2]), Number(m[3])]);
      const ks = [];
      for (const r of rects) {
        for (let yy = Math.floor((r.y - oy) * sx); yy < (r.y - oy + r.h) * sx && yy < img.height; yy++) {
          for (let xx = Math.floor((r.x - ox) * sx); xx < (r.x - ox + r.w) * sx && xx < img.width; xx++) {
            const i = (yy * img.width + xx) * 4;
            const lb = lum([d[i] ?? 0, d[i + 1] ?? 0, d[i + 2] ?? 0]);
            ks.push((Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05));
          }
        }
      }
      ks.sort((a, b) => a - b);
      return { p05: ks[Math.floor(ks.length * 0.05)] ?? 0, min: ks[0] ?? 0, n: ks.length };
    }, /** @type {const} */ ([bild, z.farbe, z.rects, x, y]));
    if (werte === null || werte.n === 0) { funde.push(`${z.name}: Hintergrund nicht messbar`); continue; }
    if (werte.p05 < 4.5) funde.push(`${z.name}: Kontrast über der Zeichnung 5-%-Perzentil ${werte.p05.toFixed(2)} : 1 (min ${werte.min.toFixed(2)}) < 4,5`);
  }
  await stil.evaluate((e) => e.remove());
  return funde;
}

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const titel = await seite.title();
  if (!titel.includes('Governance Kompass')) h.befund(`Dokumenttitel ohne „Governance Kompass“: „${titel}“`);
  for (const weg of ['weg-story', 'weg-theorie', 'weg-explore']) await h.erwarte(`[data-pruef="${weg}"]`);
  const wege = await seite.locator('[data-pruef^="weg-"]').filter({ visible: true }).count();
  if (wege !== 3) h.befund(`erwartet drei sichtbare Wege, gefunden ${wege}`);
  const text = await seite.locator('body').innerText();
  if (!text.includes('Minimum Viable Governance')) h.befund('Startseite nennt „Minimum Viable Governance“ nicht ausgeschrieben');
  if (!/Internetseite/u.test(text)) h.befund('Startseite sagt nicht, dass der Governance Kompass eine Internetseite ist (O-42)');
  for (const f of sichtbarVerboten(text)) h.befund(`Startseite: ${f}`);
  // O-63: Kopf und Türen nennen die Bereiche Geschichte · Themen · Werkzeuge (nie Story, Theorie, Explore)
  const kopfNamen = await seite.locator('[data-pruef="seiten-kopf"] .kopf-bereich').evaluateAll((l) => l.map((e) => (e.textContent ?? '').trim()));
  if (kopfNamen.join(' · ') !== 'Geschichte · Themen · Werkzeuge') h.befund(`Kopf: Bereiche „${kopfNamen.join(' · ')}“ statt „Geschichte · Themen · Werkzeuge“ (O-63)`);
  if (/\b(?:Story|Theorie|Explore)\b/u.test(await seite.locator('body').textContent() ?? '')) h.befund('Startseite: alter Bereichsname im Text (O-63)');
  // O-44: Logo im Kopf, „Wer steht dahinter“ und Fuß führen leise zu bauherr-mentoren.com
  for (const sel of ['[data-pruef="kopf-bm"]', '[data-pruef="start-dahinter"] [data-pruef="bm-link"]', '[data-pruef="fuss"] [data-pruef="bm-link"]']) {
    const href = await (await h.erwarte(sel)).getAttribute('href');
    if (href !== 'https://www.bauherr-mentoren.com/') h.befund(`${sel}: Ziel ${href}`);
  }
  for (const [sel, ziel] of [['impressum', 'impressum.html'], ['datenschutz', 'datenschutz.html']]) {
    const href = await (await h.erwarte(`[data-pruef="fuss"] [data-pruef="${sel}"]`)).getAttribute('href');
    if (href !== ziel) h.befund(`Fuß: ${sel} führt nach ${href}`);
  }
  await h.erwarte('[data-pruef="praesentieren"]');
  // r72 (Erlebnis): „Beginnen“ der Story-Karte steht ab 1024 × 720 im ersten Bildschirm, ohne zu scrollen
  const los = await seite.evaluate(() => {
    const e = document.querySelector('[data-pruef="weg-story"] .tuer-los');
    return e === null ? null : { unten: e.getBoundingClientRect().bottom + scrollY, breite: innerWidth, hoehe: innerHeight };
  });
  if (los === null) h.befund('Story-Karte ohne „Beginnen“');
  else if (los.breite >= 1024 && los.hoehe >= 720 && los.unten > los.hoehe) h.befund(`„Beginnen“ erst unter dem ersten Bildschirm (unten ${Math.round(los.unten)} px bei ${los.hoehe} px)`);

  // P18.5: neun Gegenstände der Werkzeuge – ab 1024 px in einer Reihe oder sauberen Reihen (nie 7 + 2), im schmalen Lauf 3 × 3
  const reihen = await seite.evaluate(() => {
    const tops = [...document.querySelectorAll('.tuer-werkzeuge li')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => Math.round(e.getBoundingClientRect().top));
    return { n: tops.length, reihen: [...new Set(tops)].length, breite: innerWidth };
  });
  if (reihen.n !== 9) h.befund(`Werkzeug-Karte: erwartet neun Gegenstände, gefunden ${reihen.n}`);
  else if (reihen.breite >= 1024 ? reihen.reihen !== 1 : reihen.reihen !== 3) h.befund(`Werkzeug-Karte: ${reihen.reihen} Reihen bei ${reihen.breite} px (erwartet ${reihen.breite >= 1024 ? 1 : 3})`);
  if (!/Neun Werkzeuge/u.test(text)) h.befund('Werkzeug-Karte nennt „Neun Werkzeuge“ nicht');
  // Alle drei Wege per Tastatur erreichbar
  const erreicht = new Set();
  for (let i = 0; i < 20 && erreicht.size < 3; i += 1) {
    await h.taste('Tab');
    const weg = await seite.evaluate(() => document.activeElement?.closest('[data-pruef^="weg-"]')?.getAttribute('data-pruef') ?? null);
    if (weg) erreicht.add(weg);
  }
  for (const weg of ['weg-story', 'weg-theorie', 'weg-explore']) if (!erreicht.has(weg)) h.befund(`${weg} ist per Tab nicht erreichbar`);

  await h.warte(1000);
  // R67: Leittext über der Campus-Zeichnung – Kontrast je Pixel des Hintergrunds unter den Zeilen (Text ausgeblendet),
  // 5-%-Perzentil ≥ 4,5 : 1; in der Laufgröße, im schmalen Lauf dazu 360 × 740
  const vp = seite.viewportSize();
  for (const groesse of vp !== null && vp.width <= 400 ? [vp, { width: 360, height: 740 }] : vp !== null ? [vp] : []) {
    if (vp !== null && groesse.width !== vp.width) { await seite.setViewportSize(groesse); await h.warte(150); }
    for (const fund of await leittextKontrast(seite)) h.befund(`Start @${groesse.width}: ${fund}`);
  }
  if (vp !== null) { await seite.setViewportSize(vp); await h.warte(100); }
  await pruefer(seite, h)('start');
  // O-57, P17.7: die Story-Karte zeigt die Figuren mit Namen und Rolle; nichts läuft quer über den Rand (bis 320 px)
  const figuren = await seite.locator('[data-pruef="start-figuren"] li').filter({ visible: true }).count();
  if (figuren !== 6) h.befund(`Story-Karte: erwartet sechs sichtbare Figuren („Sie“ und fünf), gefunden ${figuren}`);
  for (const breite of vp !== null && vp.width <= 400 ? [vp.width, 320] : [vp?.width ?? 0]) {
    if (vp !== null && breite !== vp.width) { await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150); }
    const quer = await seite.evaluate(() => {
      const funde = [];
      if (document.documentElement.scrollWidth > innerWidth) funde.push(`Seite ${document.documentElement.scrollWidth - innerWidth} px breiter als das Fenster`);
      for (const el of document.querySelectorAll('.tuer, .tuer *')) {
        const r = el.getBoundingClientRect();
        const karte = el.closest('.tuer')?.getBoundingClientRect();
        if (karte && r.width > 0 && (r.right > karte.right + 1 || r.left < karte.left - 1) && !el.closest('.tuer-bild')) funde.push(`${el.className || el.tagName} ragt aus der Karte`);
      }
      return funde.slice(0, 5);
    });
    for (const f of quer) h.befund(`Start @${breite}: ${f}`);
  }
  if (vp !== null) { await seite.setViewportSize(vp); await h.warte(100); }
  // der Weg in die Story führt dorthin
  await h.klick('[data-pruef="weg-story"]');
  await h.erwarte('[data-pruef="gs-titel"]');
}
