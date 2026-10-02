// Gemeinsame Hilfen der Browser-Szenarien (kein Szenario: Dateiname ohne .szenario.mjs).

import { wortbrueche } from './pdf.mjs';

/** Läuft im Browser: horizontales Scrollen und abgeschnittener Text (wie im Szenario „durchstich“). */
export function pruefeLayout() {
  const funde = [];
  const d = document.documentElement;
  if (d.scrollWidth > d.clientWidth) funde.push(`horizontales Scrollen: ${d.scrollWidth} > ${d.clientWidth}`);
  // R58: kein bedienbarer Glossarbegriff in einem Link, Knopf oder einer Aufklappzeile (verschachtelte Bedienelemente)
  for (const b of document.querySelectorAll(':is(a, button, summary, label) :is(.begriff[tabindex], .begriff[role="button"])')) funde.push(`Glossarbegriff „${(b.textContent ?? '').slice(0, 30)}“ bedienbar in ${b.closest('a, button, summary, label')?.tagName.toLowerCase()}`);
  for (const el of document.body.querySelectorAll('*')) {
    if (!(el instanceof HTMLElement)) continue;
    const st = getComputedStyle(el);
    if (st.overflowX !== 'hidden' && st.overflowX !== 'clip') continue;
    if (st.display === 'none' || st.visibility !== 'visible') continue;
    if (el.closest('[data-pruef-erlaubt~="abschneiden"]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width <= 2 || r.height <= 2) continue;
    if (st.clip && st.clip !== 'auto') continue;
    const text = (el.textContent ?? '').trim();
    if (text === '') continue;
    const eigenerText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim() !== '');
    const nurInline = [...el.children].every((k) => getComputedStyle(k).display.startsWith('inline'));
    if (!eigenerText && !nurInline) continue;
    if (el.scrollWidth > el.clientWidth + 1) funde.push(`abgeschnitten: ${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')} „${text.slice(0, 40)}“`);
  }
  // R33: Text, der sichtbar aus seiner Fläche läuft (nächster Vorfahr mit Hintergrund oder Rahmen) – ohne
  // overflow: hidden fängt das die Prüfung oben nicht (Mandatsleiter, Tafel-Karten, Leiter-Kabine).
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const gemeldet = new Set();
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if ((n.textContent ?? '').trim() === '') continue;
    const el = n.parentElement;
    if (el === null || !el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) continue;
    if (el.closest('svg, .nur-sr, [data-pruef-erlaubt~="abschneiden"]')) continue;
    // absichtlich unsichtbar gemacht (clip, clip-path) oder in einem rollenden Rahmen
    let versteckt = false;
    for (let q = el; q && q !== document.body; q = q.parentElement) {
      const s = getComputedStyle(q);
      if ((s.clip && s.clip !== 'auto') || (s.clipPath && s.clipPath !== 'none') || s.overflowX === 'auto' || s.overflowX === 'scroll') { versteckt = true; break; }
    }
    if (versteckt) continue;
    const rg = document.createRange();
    rg.selectNodeContents(n);
    const rects = [...rg.getClientRects()].filter((r) => r.width > 0);
    if (rects.length === 0) continue;
    // R48: Buchstabensäule – eine Textspalte schmaler als drei Zeichen (Glieder ohne ID-Marke brachen je Zeichen um)
    if (rects.length >= 3 && (n.textContent ?? '').replace(/\s/gu, '').length >= 12 && !gemeldet.has(el)) {
      // Maß ist die Zeilenhöhe im Bild (skalierte Vorschau, Zoom): drei Zeichen sind etwa 2,5 Zeilenhöhen breit
      const zeile = Math.min(...rects.map((r) => r.height));
      let gedreht = false;
      for (let q = el; q && q !== document.body; q = q.parentElement) {
        const s = getComputedStyle(q);
        const m = /^matrix\(([^,]+),\s*([^,]+)/u.exec(s.transform);
        if (s.writingMode !== 'horizontal-tb' || (m !== null && Math.abs(parseFloat(m[2] ?? '0')) > 0.5)) { gedreht = true; break; }
      }
      const spalte = Math.max(...rects.map((r) => r.width));
      // nur, wo Wörter selbst brechen: mehr Zeilen als Wörter (eine schmale Notiz, die an Wortgrenzen umbricht, zählt nicht);
      // bei Silbentrennung (hyphens: auto, Chrome 153 mit Wörterbuch: „Orga-nisa-tion“) erst unter drei Zeichen je Zeile
      const woerter = (n.textContent ?? '').trim().split(/\s+/u).length;
      const zeichenJeZeile = (n.textContent ?? '').replace(/\s/gu, '').length / rects.length;
      const silben = getComputedStyle(el).hyphens === 'auto';
      if (!gedreht && zeile > 0 && spalte < 2.5 * zeile && (silben ? zeichenJeZeile < 3 : rects.length > woerter + 1)) {
        gemeldet.add(el);
        funde.push(`Buchstabensäule (Spalte ${Math.round(spalte)} px): ${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')} „${(n.textContent ?? '').trim().slice(0, 40)}“`);
      }
    }
    const links = Math.min(...rects.map((r) => r.left));
    const rechts = Math.max(...rects.map((r) => r.right));
    let a = el;
    while (a && a !== document.body) {
      const c = getComputedStyle(a);
      if (c.backgroundColor !== 'rgba(0, 0, 0, 0)' || c.backgroundImage !== 'none' || parseFloat(c.borderLeftWidth) > 0 || parseFloat(c.borderRightWidth) > 0) break;
      a = a.parentElement;
    }
    if (!a || a === document.body || gemeldet.has(a)) continue;
    const ar = a.getBoundingClientRect();
    const ueber = Math.max(rechts - ar.right, ar.left - links);
    if (ueber > 1.5) {
      gemeldet.add(a);
      funde.push(`Text aus der Fläche (+${Math.round(ueber)} px): ${a.tagName.toLowerCase()}.${[...a.classList].slice(0, 2).join('.')} „${(n.textContent ?? '').trim().slice(0, 40)}“`);
    }
  }
  return funde;
}

/**
 * Prüfung an einem Schritt: ans Seitenende scrollen (dort überdeckt die klebende Fußleiste keinen Knopf halb), Layout, axe, Bild.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @returns {(name: string) => Promise<void>}
 */
export function pruefer(seite, h) {
  return async (name) => {
    // Einblendungen abwarten (endliche Animationen): axe misst sonst Kontrast im Übergang
    await seite.evaluate(() => Promise.race([
      Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished.catch(() => undefined))),
      new Promise((r) => setTimeout(r, 3000)),
    ]));
    await seite.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await h.warte(150);
    for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${name}: ${fund}`);
    // R47: Bauteile, deren Wörter nie mitten im Wort brechen dürfen (L-132, L-133, L-138) – am Bildschirm, ohne hyphens:auto-Text
    const bruch = await wortbrueche(seite, BAUTEILE_UNGETEILT, { bildschirm: true });
    if (bruch.length > 0) h.befund(`${name}: ${bruch.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 6))}`);
    await h.axe(name);
    await h.bild(name);
    await schmal(seite, h, name);
    await mittelbreit(seite, h, name);
  };
}

/** R48: Bauteile, die zwischen den Prüfgrößen (400/1024/1280) brechen oder überlaufen (Lernkarten, Tafelkarten) */
export const MITTEL_BAUTEILE = '.lernkarten, .tafel-karten';

/**
 * R48: Im breiten Lauf zusätzlich bei 500, 560, 720 und 768 px messen – nur wenn der Schritt eines der Bauteile zeigt, die
 * dort umbrechen (gemessen: Lernkarten 488–568 px).
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} name
 */
export async function mittelbreit(seite, h, name) {
  const vp = seite.viewportSize();
  if (vp === null || vp.width < 1280) return;
  if (await seite.locator(MITTEL_BAUTEILE).filter({ visible: true }).count() === 0) return;
  // R49: dazu 981 und 1000 px
  for (const breite of [500, 560, 720, 768, 981, 1000]) {
    await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150);
    for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${name} @${breite}: ${fund}`);
    const bruch = await wortbrueche(seite, BAUTEILE_UNGETEILT, { bildschirm: true });
    if (bruch.length > 0) h.befund(`${name} @${breite}: ${bruch.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 6))}`);
  }
  await seite.setViewportSize(vp); await h.warte(100);
}

/** R47: Bauteile, deren Wörter am Bildschirm nie mitten im Wort brechen dürfen */
export const BAUTEILE_UNGETEILT = '.lw-korb, .kapitel-titel, .lw-etappe-name, .lw-schalter-seite, .baustein-karte b';

/** Sichtbare, waagerecht rollende Bereiche ohne Tabulatorstopp (weder selbst noch ein Kind fokussierbar). */
export function rollbarOhneTastatur() {
  const fokussierbar = 'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
  return [...document.querySelectorAll('body *')].filter((el) => {
    if (!(el instanceof HTMLElement) || el.clientWidth === 0 || el.scrollWidth <= el.clientWidth + 1) return false;
    const ox = getComputedStyle(el).overflowX;
    if (ox !== 'auto' && ox !== 'scroll') return false;
    // nur Sichtbares zählt: der Inhalt geschlossener details hat in Chromium Maße, ist aber nicht zu sehen
    const zu = (k) => { const d = k.closest('details:not([open])'); return d !== null && k.closest('summary')?.parentElement !== d; };
    const sichtbar = (k) => k instanceof HTMLElement && k.getClientRects().length > 0 && getComputedStyle(k).visibility === 'visible' && !zu(k);
    if (!sichtbar(el)) return false;
    // Zugang nur über bedienbare Elemente (nicht disabled, nicht inert)
    const bedienbar = (k) => sichtbar(k) && !k.matches(':disabled') && k.closest('[inert]') === null;
    return !(el.matches(fokussierbar) && bedienbar(el)) && ![...el.querySelectorAll(fokussierbar)].some(bedienbar);
  }).map((el) => `rollt waagerecht ohne Tastaturzugang: ${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
}

/**
 * R34: im schmalen Lauf (≤ 400 px) dieselbe Stelle auch bei 320 px (WCAG 1.4.10, 400 % Zoom): Layout ohne
 * Text aus seiner Fläche und kein waagerechtes Rollen der Seite; danach zurück auf die Laufgröße.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} name
 */
export async function schmal(seite, h, name) {
  const vp = seite.viewportSize();
  if (vp === null || vp.width > 400 || vp.width <= 320) return;
  await seite.setViewportSize({ width: 320, height: vp.height }); await h.warte(150);
  for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${name} @320: ${fund}`);
  const sw = await seite.evaluate(() => document.documentElement.scrollWidth);
  if (sw > 321) h.befund(`${name}: rollt bei 320 px waagerecht (${sw} px)`);
  // R35: was bei 320 px waagerecht rollt, ist per Tastatur erreichbar (axe scrollable-region-focusable läuft hier nicht)
  for (const fund of await seite.evaluate(rollbarOhneTastatur)) h.befund(`${name} @320: ${fund}`);
  // R47: Wortbrüche in den Bauteilen auch bei 320 px
  const bruch = await wortbrueche(seite, BAUTEILE_UNGETEILT, { bildschirm: true });
  if (bruch.length > 0) h.befund(`${name} @320: ${bruch.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 6))}`);
  // R57: Glossarbegriffe brechen im Fließtext um (ein <button> wäre inline-block und stünde als Block über der Spalte)
  const block = await seite.evaluate(() => [...document.querySelectorAll('.begriff')].filter((b) => b.getClientRects().length > 0 && getComputedStyle(b).display !== 'inline').map((b) => (b.textContent ?? '').slice(0, 30)));
  if (block.length > 0) h.befund(`${name} @320: Glossarbegriffe nicht inline ${JSON.stringify(block.slice(0, 3))}`);
  // R54: Überschriften der Lernseiten nach der 93-%-Regel (L-129)
  const knapp = await knappeWoerter(seite, '.abschnitt-titel, .lernkarte-titel');
  if (knapp.length > 0) h.befund(`${name} @320: ungeteilte Wörter über 93 % der Zeile ${JSON.stringify(knapp.slice(0, 6))}`);
  await seite.setViewportSize(vp); await h.warte(100);
}

/**
 * R54 (Stil, L-129): ungeteilte Wortstücke über 93 % ihrer Zeilenbreite – lokal (Chromium 141) passen sie noch, unter
 * Chrome 153 (breiterer Satz) brechen sie ohne Strich oder ragen aus Flex-Überschriften. Gemessen wird jedes Stück
 * zwischen weichen Trennstellen gegen die Breite vom Beginn des Textknotens bis zum rechten Inhaltsrand des Elements.
 * @param {import('playwright').Page} seite
 * @param {string} selektor
 * @returns {Promise<string[]>}
 */
export function knappeWoerter(seite, selektor) {
  return seite.evaluate((sel) => {
    /** @type {string[]} */
    const funde = [];
    for (const el of document.querySelectorAll(sel)) {
      if (el.getClientRects().length === 0) continue;
      const st = getComputedStyle(el);
      if (st.hyphens === 'auto') continue;
      const r = el.getBoundingClientRect();
      const rechts = r.right - parseFloat(st.paddingRight) - parseFloat(st.borderRightWidth);
      const gang = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = gang.nextNode(); n !== null; n = gang.nextNode()) {
        if (n.parentElement === null || n.parentElement.closest('.nur-sr') !== null) continue;
        const text = n.textContent ?? '';
        const ganz = document.createRange();
        ganz.selectNodeContents(n);
        const rects = [...ganz.getClientRects()];
        if (rects.length === 0) continue;
        const links = Math.min(...rects.map((q) => q.left));
        for (const m of text.matchAll(/[^\s­​/-]{8,}/gu)) {
          const w = document.createRange();
          w.setStart(n, m.index ?? 0);
          w.setEnd(n, (m.index ?? 0) + m[0].length);
          // breitestes Einzelrechteck: ein Stück am Zeilenanfang nach einer Trennstelle trägt sonst das leere Rechteck am Ende der Vorzeile mit
          const breite = Math.max(0, ...[...w.getClientRects()].map((q) => q.width));
          const platz = rechts - links;
          if (platz > 0 && breite / platz > 0.93) funde.push(`„${m[0]}“ ${Math.round((breite / platz) * 1000) / 10} %`);
        }
      }
    }
    return funde;
  }, selektor);
}


export { sichtbarVerboten } from '../../werkzeuge/sichtbar.mjs';
