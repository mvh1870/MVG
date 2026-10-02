// Gemeinsame Hilfen der Browser-Szenarien (kein Szenario: Dateiname ohne .szenario.mjs).

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mitTrennstellen } from '../../src/ui/h.ts';
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
  // R62: das Datum im Protokollkopf („Do, 09.07.2026“) steht in einer Zeile (L-138)
  for (const k of document.querySelectorAll('.protokoll-kopf small')) {
    if (k.getClientRects().length === 0) continue;
    const r = document.createRange();
    r.selectNodeContents(k);
    if (new Set([...r.getClientRects()].map((q) => Math.round(q.top))).size > 1) funde.push(`Datum im Protokollkopf umbrochen: „${(k.textContent ?? '').trim()}“`);
    // R63: unter Chromium 141 bricht das Datum auch ohne die Regel selten – die Regel selbst muss gelten (Chrome 153 setzt breiter)
    if (getComputedStyle(k).whiteSpace !== 'nowrap') funde.push(`Datum im Protokollkopf ohne nowrap: „${(k.textContent ?? '').trim()}“`);
  }
  return funde;
}

/**
 * Läuft im Browser: Kontrast von Text gegen den ersten deckenden Hintergrund – Standard die Quellenzeilen
 * unter Zitaten; axe greift dort nicht (gepunkteter Grund, Anführungszeichen per ::before).
 * @param {string} [selektor]
 */
export function kontrastQuellen(selektor = '.zitat-block .quelle b') {
  const rgb = (s) => (s.match(/[\d.]+/gu) ?? []).map(Number);
  const lum = ([r, g, b]) => {
    const k = (c) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);
  };
  const funde = [];
  for (const el of document.querySelectorAll(selektor)) {
    if (!(el instanceof HTMLElement) || el.offsetParent === null) continue;
    let grund = null;
    for (let a = el; a !== null; a = a.parentElement) {
      const f = rgb(getComputedStyle(a).backgroundColor);
      if (f.length >= 3 && (f[3] ?? 1) > 0.9) { grund = f; break; }
    }
    if (grund === null) grund = [255, 255, 255];
    const [l1, l2] = [lum(rgb(getComputedStyle(el).color)), lum(grund)].sort((a, b) => b - a);
    const verh = (l1 + 0.05) / (l2 + 0.05);
    if (verh < 4.5) funde.push(`Text „${el.textContent?.slice(0, 30)}“ Kontrast ${verh.toFixed(2)}:1`);
  }
  return funde;
}

/**
 * Prüfung an einem Schritt: Quellen-Kontrast selbst messen (axe greift auf gepunktetem Grund nicht, P4.7),
 * ans Seitenende scrollen (dort überdeckt die klebende Fußleiste keinen Knopf halb), Layout, axe, Bild.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @returns {(name: string) => Promise<void>}
 */
export function pruefer(seite, h) {
  return async (name) => {
    for (const fund of await seite.evaluate(kontrastQuellen)) h.befund(`${name}: ${fund}`);
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

/** R48: Bauteile, die zwischen den Prüfgrößen (400/1024/1280) brechen oder überlaufen (Rückbezug-Karte, Radar, Lernkarten, Glieder) */
export const MITTEL_BAUTEILE = '.erinnerung, .radar-liste, .lernkarten, .glied, .tafel-karten';

/**
 * R48: Im breiten Lauf zusätzlich bei 500, 560, 720 und 768 px messen – nur wenn der Schritt eines der Bauteile zeigt, die
 * dort umbrechen (gemessen: Lernkarten 488–568, Rückbezug 704–744, Radar 761–780 px).
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} name
 */
export async function mittelbreit(seite, h, name) {
  const vp = seite.viewportSize();
  if (vp === null || vp.width < 1280) return;
  if (await seite.locator(MITTEL_BAUTEILE).filter({ visible: true }).count() === 0) return;
  // R49: dazu der schmale Leitstand (981/1000 px) – Rückbezug der Rolle Planung, Radar
  for (const breite of [500, 560, 720, 768, 981, 1000]) {
    await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150);
    for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${name} @${breite}: ${fund}`);
    const bruch = await wortbrueche(seite, BAUTEILE_UNGETEILT, { bildschirm: true });
    if (bruch.length > 0) h.befund(`${name} @${breite}: ${bruch.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 6))}`);
  }
  await seite.setViewportSize(vp); await h.warte(100);
}

/**
 * R49 (Stil): der schmalste Leitstand (981 und 1000 px, Story-Karte daneben) – Statuswörter der Instrumente („SEHR HOCH“)
 * blieben dort nicht im Instrument; keine Prüfgröße lag zwischen 981 und 1023 px.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} name
 */
export async function leitstandSchmal(seite, h, name) {
  const vp = seite.viewportSize();
  if (vp === null || vp.width < 1280) return;
  for (const breite of [981, 1000]) {
    await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150);
    for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${name} @${breite}: ${fund}`);
    const bruch = await wortbrueche(seite, BAUTEILE_UNGETEILT, { bildschirm: true });
    if (bruch.length > 0) h.befund(`${name} @${breite}: ${bruch.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 6))}`);
  }
  await seite.setViewportSize(vp); await h.warte(100);
}

/**
 * R64 (Stil, L-178): der Rollentitel in der Rollen-Linse („Geschäftsführ|ung“) brach bei 990–1190 px ohne Trennstrich – die
 * Seitenleiste ist im Lauf meist zu, keine Probe sah den Chip. Öffnet die Leiste, misst bei 1000, 1100 und 1180 px, schließt sie.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} name
 */
export async function rollenChipSchmal(seite, h, name) {
  const vp = seite.viewportSize();
  if (vp === null || vp.width < 1280) return;
  const zu = await seite.locator('.rollen-chip').filter({ visible: true }).count() === 0;
  if (zu) { await h.klick('[data-pruef="seitenleiste-raum"]'); await h.warte(300); }
  if (await seite.locator('.rollen-chip b').filter({ visible: true }).count() === 0) h.befund(`${name}: Rollen-Linse ohne Rollentitel`);
  for (const breite of [1000, 1100, 1180]) {
    await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150);
    const bruch = await wortbrueche(seite, '.rollen-chip b', { bildschirm: true });
    if (bruch.length > 0) h.befund(`${name} @${breite}: Rollentitel ohne Trennstrich gebrochen ${JSON.stringify(bruch)}`);
  }
  await seite.setViewportSize(vp); await h.warte(100);
  if (zu) { await h.klick('[data-pruef="seitenleiste-zu"]'); await h.warte(200); }
}

/**
 * R64 (Stil): Tabellen der Ebenen im Reiter „Ebenen“ (Ebene 3) – die Klappe (overflow hidden) schnitt sie bei 320–480 px rechts
 * ab, ohne Rollbereich. Öffnet den Reiter mit allen Ebenen, misst bei 320, 400 und 480 px: keine Tabelle ragt über einen
 * Vorfahren mit verstecktem Überlauf hinaus, außer in einem Rollbereich; jeder Rollbereich ist per Tastatur erreichbar.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} name
 */
export async function ebenenTabellenSchmal(seite, h, name) {
  const vp = seite.viewportSize();
  if (vp === null || vp.width < 1280) return;
  await h.klick('[data-pruef="seitenleiste-ebenen"]'); await h.warte(250);
  await seite.evaluate(() => { for (const d of document.querySelectorAll('.seitenleiste details.klapp')) /** @type {HTMLDetailsElement} */ (d).open = true; });
  if (await seite.locator('.seitenleiste .klapp-inhalt table').count() === 0) h.befund(`${name}: keine Ebenen-Tabelle zu messen`);
  for (const breite of [320, 400, 480]) {
    await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150);
    const funde = await seite.evaluate(() => {
      const aus = [];
      for (const t of document.querySelectorAll('.seitenleiste .klapp-inhalt table')) {
        if (t.getClientRects().length === 0) continue;
        const r = t.getBoundingClientRect();
        for (let a = t.parentElement; a !== null && !a.classList.contains('seitenleiste'); a = a.parentElement) {
          const ox = getComputedStyle(a).overflowX;
          if (ox === 'auto' || ox === 'scroll') break;
          if (ox !== 'visible' && r.right > a.getBoundingClientRect().right + 1.5) { aus.push(`Tabelle ${Math.round(r.width)} px abgeschnitten von ${a.tagName.toLowerCase()}.${String(a.className).split(' ')[0]} (${Math.round(a.getBoundingClientRect().width)} px)`); break; }
        }
      }
      return aus;
    });
    for (const f of funde) h.befund(`${name} @${breite}: ${f}`);
    for (const f of await seite.evaluate(rollbarOhneTastatur)) h.befund(`${name} @${breite}: rollbar ohne Tastatur ${f}`);
  }
  await seite.setViewportSize(vp); await h.warte(100);
  await h.klick('[data-pruef="seitenleiste-zu"]'); await h.warte(200);
}

/** R47: Bauteile, deren Wörter am Bildschirm nie mitten im Wort brechen dürfen */
// R48: dazu der Kopf der Zeitmaschinen-Tabelle („MO|NAT“, „KOSTENUN|SICHERHEI|T“) und der Beamer-Status („SEHR HOC“)
// R50: dazu der Dateiname im Mail-Anhang und Kennungen in der Hilfe
export const BAUTEILE_UNGETEILT = '.anhang .mono, .morph-datei .mono, .hilfe-inhalt code, .datenstand-zahlen b, .tabellenstand-zahl, .instrument-label, .ablesung, .protokoll-kopf, .lw-korb, .kapitel-titel, .fortschritt, .zm-tabelle th, .instrument .wert';

/**
 * R49 (Stil): Kästen mit eigener Fläche (Hintergrund oder Schatten) ragen nicht über den Inhaltsbereich der Spalte `wurzel` –
 * pruefeLayout sieht das nicht, wenn der Text in seinem Kasten bleibt (Glossarkarten bei 320 px, Wissenscheck-Ergebnis).
 * Gedrehte, absolut gesetzte und in rollenden oder beschnittenen Bereichen liegende Kästen zählen nicht.
 * @param {string} wurzel
 */
export function kaestenUeberRand(wurzel) {
  const spalte = document.querySelector(wurzel);
  if (!(spalte instanceof HTMLElement)) return [];
  const sc = getComputedStyle(spalte);
  const rechts = spalte.getBoundingClientRect().right - parseFloat(sc.borderRightWidth) - parseFloat(sc.paddingRight);
  const funde = [];
  for (const el of spalte.querySelectorAll('*')) {
    if (!(el instanceof HTMLElement) || el.getClientRects().length === 0) continue;
    const cs = getComputedStyle(el);
    const flaeche = (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') || cs.boxShadow !== 'none';
    if (!flaeche || cs.position === 'absolute' || cs.position === 'fixed' || cs.transform !== 'none') continue;
    let beschnitten = false;
    for (let a = el.parentElement; a !== null && a !== spalte; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') { beschnitten = true; break; }
    if (beschnitten) continue;
    const ueber = el.getBoundingClientRect().right - rechts;
    if (ueber > 1.5) funde.push(`Kasten über die Spalte (+${Math.round(ueber)} px): ${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`);
  }
  return [...new Set(funde)].slice(0, 8);
}

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
  // R47: Wortbrüche in den Bauteilen auch bei 320 px; Schrittknöpfe mindestens 24 × 24 px (WCAG 2.5.8, axe läuft hier nicht)
  const bruch = await wortbrueche(seite, BAUTEILE_UNGETEILT, { bildschirm: true });
  if (bruch.length > 0) h.befund(`${name} @320: ${bruch.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 6))}`);
  // R60: die Einheit der Datenstand-Zahl („Mio. €“) steht in einer Zeile (wortbrueche misst Wörter erst ab vier Zeichen)
  const einheit = await seite.evaluate(() => [...document.querySelectorAll('.datenstand-zahlen b small')].filter((s) => s.getClientRects().length > 1).map((s) => (s.textContent ?? '').trim()));
  if (einheit.length > 0) h.befund(`${name} @320: Einheit der Datenstand-Zahl umbrochen ${JSON.stringify(einheit.slice(0, 3))}`);
  // R57: Glossarbegriffe brechen im Fließtext um (ein <button> wäre inline-block und stünde als Block über der Spalte)
  const block = await seite.evaluate(() => [...document.querySelectorAll('.begriff')].filter((b) => b.getClientRects().length > 0 && getComputedStyle(b).display !== 'inline').map((b) => (b.textContent ?? '').slice(0, 30)));
  if (block.length > 0) h.befund(`${name} @320: Glossarbegriffe nicht inline ${JSON.stringify(block.slice(0, 3))}`);
  // R54: Überschriften der Lernseiten und Optionstitel nach der 93-%-Regel (L-129)
  const knapp = await knappeWoerter(seite, '.abschnitt-titel, .lernkarte-titel, .option-text');
  if (knapp.length > 0) h.befund(`${name} @320: ungeteilte Wörter über 93 % der Zeile ${JSON.stringify(knapp.slice(0, 6))}`);
  // R48 (Architektur): auch an der Grenze des Rasters (unter 380 px, L-133) – bei 360 und 379 px
  // R54 (Architektur): das ganze Band bis zur Rastergrenze abtasten (alle 3 px und 379) – feste Stützstellen ließen
  // eine verschobene Grenze (379 → 369 px) mit 23 px kleinen Knöpfen bei 370–378 px durch
  const breiten = [...Array.from({ length: 21 }, (_, i) => 320 + i * 3), 379];
  const mitSchritten = await seite.locator('.fortschritt-schritt, .instrument-label').filter({ visible: true }).count() > 0;
  for (const b of mitSchritten ? breiten : [320]) {
    if (b !== 320) { await seite.setViewportSize({ width: b, height: vp.height }); await h.warte(60); }
    // R55: im selben Band das Instrument-Label – nie getrennt, nie über 93 % seiner Zeile (Grenze bei 363 px)
    if (await seite.locator('.instrument-label').filter({ visible: true }).count() > 0) {
      const lb = [...await wortbrueche(seite, '.instrument-label'), ...await knappeWoerter(seite, '.instrument-label')];
      if (lb.length > 0) h.befund(`${name} @${b}: Instrument-Label ${JSON.stringify(lb.slice(0, 3))}`);
    }
    const klein = await seite.evaluate(() => [...document.querySelectorAll('.fortschritt-schritt')].filter((el) => el.getClientRects().length > 0)
      .map((el) => el.getBoundingClientRect()).filter((r) => r.width < 23.9 || r.height < 23.9).map((r) => `${Math.round(r.width)}×${Math.round(r.height)}`));
    if (klein.length > 0) h.befund(`${name} @${b}: ${klein.length} Schrittknöpfe unter 24 px (${klein.slice(0, 3).join(', ')})`);
  }
  await seite.setViewportSize(vp); await h.warte(100);
}

/**
 * R48 (Architektur): Excel-Stand ohne Container-Einheiten (Safari 15.4–15.x) – die @supports-Regel mit cqi wird aus dem
 * Stilblatt genommen; bei 981 px, 1000 und 1024 px bricht keine Zahl mitten im Wort. Danach zurück.
 * R49: dazu 720, 744 (iPad mini hochkant, iPadOS 15) und 768 px – dort ist der Kasten am schmalsten (144 px Innenbreite).
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} name
 */
export async function rueckfallTabellenstand(seite, h, name) {
  const vp = seite.viewportSize();
  if (vp === null || vp.width < 1024) return;
  const entfernt = await seite.evaluate(() => {
    /** @type {{ blatt: number, i: number, text: string }[]} */
    const weg = [];
    [...document.styleSheets].forEach((blatt, b) => {
      let regeln;
      try { regeln = blatt.cssRules; } catch { return; }
      for (let i = regeln.length - 1; i >= 0; i--) {
        const r = regeln[i];
        if (r instanceof CSSSupportsRule && /cqi/u.test(r.conditionText) && /tabellenstand/u.test(r.cssText)) { weg.push({ blatt: b, i, text: r.cssText }); blatt.deleteRule(i); }
      }
    });
    return weg;
  });
  if (entfernt.length === 0) { h.befund(`${name}: Rückfall des Excel-Stands nicht prüfbar (keine @supports-Regel mit cqi)`); return; }
  for (const breite of [720, 744, 768, 981, 1000, 1024]) {
    await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150);
    const bruch = await wortbrueche(seite, '.tabellenstand-zahl', { bildschirm: true });
    if (bruch.length > 0) h.befund(`${name} @${breite} ohne cqi: ${bruch.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 4))}`);
  }
  await seite.evaluate((weg) => { for (const w of [...weg].sort((a, b) => a.i - b.i)) document.styleSheets[w.blatt]?.insertRule(w.text, w.i); }, entfernt);
  await seite.setViewportSize(vp); await h.warte(100);
}

/** Ausgebaute Stationen der Welt B (P5.2 ff.); weitere kommen mit ihren Posten dazu. */
export const WELT_B = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'];

/**
 * Welt B (P5.2 ff.): die ausgebauten Stationen einmal durchspielen – Einstieg, Vergleich, Werkzeuge,
 * Entscheidung, Ebenen; Layout, axe und Quellen-Kontrast an jedem Werkzeug.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {() => Promise<string>} station
 * @param {(name: string) => Promise<void>} pruefe
 * @param {{ vertiefungen?: string[], spur?: { a: string, b: string }, breitenProben?: boolean }} [optionen]  erwartete Vertiefungen je Station; Kurzformen A1/B1 in der Spur; breitenProben: Messungen über mehrere Fensterbreiten (CI 241/242: mit allen sechs Rollen über dem Zeitlimit) nur für die erste Rolle
 */
export async function weltB(seite, h, station, pruefe, optionen = {}) {
  if ((await station()) !== 'B1') h.befund(`Welt B beginnt nicht in B1 (steht in ${await station()})`);
  const sichtbar = async (sel) => (await seite.locator(sel).filter({ visible: true }).count()) > 0;
  /** Werkzeug → Selektor */
  const WERKZEUGE = Object.entries({
    raci: '[data-pruef="raci"]', rhythmus: '[data-pruef="tafel-rhythmus"]', karten: '[data-pruef="tafel-karten"]', register: '[data-pruef="tafel-register"]',
    phasen: '[data-pruef="tafel-phasen"]', kette: '.kette', mandatsleiter: '.mandat-raster', vorlage: '[data-pruef="vorlage"]', fluss: '[data-pruef="fluss"]', datenstand: '[data-pruef="datenstand"]',
    // R47: Excel-Stand (Anzeigezahl nach dem längsten Wort, L-132) – vorher nie an einer Prüfstelle sichtbar
    tabellenstand: '.tabellenstand',
  });
  for (const st of WELT_B) {
    // Stationen dazwischen (noch nicht ausgebaut oder anders gebaut, z. B. B3) nur durchklicken
    for (let i = 0; i < 40 && (await station()) !== st; i++) {
      const optionA = seite.locator('[data-pruef="option-A"]').filter({ visible: true });
      if (await optionA.count() > 0 && (await optionA.first().getAttribute('aria-pressed')) !== 'true') await optionA.first().click();
      if (await sichtbar('[data-pruef="szene-weiter"]')) await h.klick('[data-pruef="szene-weiter"]');
      else await h.klick('[data-pruef="weiter"]');
      await h.warte(250);
    }
    if ((await station()) !== st) h.befund(`${st} nicht erreicht (steht in ${await station()})`);
    const gesehen = new Set();
    for (let i = 0; i < 40 && (await station()) === st; i++) {
      await h.warte(700);
      if (await sichtbar('[data-pruef="einstieg-text"]') && !gesehen.has('einstieg')) {
        gesehen.add('einstieg');
        await pruefe(`${st}-einstieg`);
        if (h.viewport.breite === 1280 && optionen.breitenProben !== false) await schritttitelBreit(seite, h, st);
      }
      if (await sichtbar('[data-pruef="vergleich"]') && !gesehen.has('vergleich')) {
        gesehen.add('vergleich');
        if (h.viewport.breite === 1280 && optionen.breitenProben !== false) await vergleichFrei(seite, h, `${st}-vergleich`);
        await seite.locator('[data-pruef="vergleich"]').focus();
        await h.taste('End');
        await h.warte(600);
        await pruefe(`${st}-vergleich`);
        await h.klick('[data-pruef="szene-weiter"]');
        continue;
      }
      for (const [w, sel] of WERKZEUGE) {
        if (gesehen.has(w) || !(await sichtbar(sel))) continue;
        gesehen.add(w);
        gesehen.add('werkzeug');
        if (w === 'raci') await seite.locator('[data-pruef^="raci-"]:not([data-pruef="raci-detail"])').nth(1).click();
        await h.warte(1500);
        await pruefe(`${st}-${w}`);
        if (w === 'tabellenstand') await rueckfallTabellenstand(seite, h, `${st}-${w}`);
        // R55: die RACI-Matrix rollt schmal in ihrem Rahmen statt in Buchstabensäulen (table-layout fixed traf sie unter 400 px)
        if (w === 'raci' && optionen.breitenProben !== false) {
          const vpR = seite.viewportSize();
          for (const breite of [320, 400]) {
            if (vpR === null) break;
            await seite.setViewportSize({ width: breite, height: vpR.height }); await h.warte(150);
            const saeulen = await seite.evaluate(() => [...document.querySelectorAll('.raci-tabelle :is(th, td)')].filter((z) => z.getClientRects().length > 0 && (z.textContent ?? '').trim().length > 6 && z.getBoundingClientRect().width < 56).map((z) => `${(z.textContent ?? '').trim().slice(0, 20)} ${Math.round(z.getBoundingClientRect().width)} px`));
            if (saeulen.length > 0) h.befund(`${st}-raci @${breite}: Buchstabensäulen ${JSON.stringify(saeulen.slice(0, 3))}`);
            // R63: die Breitengrenze 40 px übersah Spalten von 42 px (jetzt 56 px; schmalste echte Spalte 64 px) – dazu der Wortbruch selbst
            const bruchR = await wortbrueche(seite, '.raci-tabelle', { bildschirm: true });
            if (bruchR.length > 0) h.befund(`${st}-raci @${breite}: ${bruchR.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruchR.slice(0, 4))}`);
          }
          if (vpR !== null) { await seite.setViewportSize(vpR); await h.warte(150); }
        }
      }
      const optionA = seite.locator('[data-pruef="option-A"]').filter({ visible: true });
      if (await optionA.count() > 0 && (await optionA.first().getAttribute('aria-pressed')) !== 'true') {
        await optionA.first().click();
        await h.erwarte('[data-pruef="konsequenz"]');
        gesehen.add('entscheidung');
      }
      if (await sichtbar('[data-pruef="ebene-1"]') && !gesehen.has('ebenen')) {
        gesehen.add('ebenen');
        // Ebenen 1–4 je Station (P2-Befund V9): jede öffnen, Ebene 4 trägt den Nachweis (Zitat)
        for (const n of [2, 3, 4]) {
          await h.klick(`[data-pruef="ebene-knopf-${n}"]`);
          await h.erwarte(`[data-pruef="ebene-${n}"]`);
        }
        await h.erwarte('[data-pruef="ebene-4"] [data-pruef="zitat"]');
        if (optionen.vertiefungen !== undefined) {
          const da = await seite.locator('[data-pruef^="vertiefung-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-pruef')));
          const soll = optionen.vertiefungen.map((i) => `vertiefung-${i}`);
          if (da.join(',') !== soll.join(',')) h.befund(`${st}: Vertiefungen ${da.join(',') || 'keine'} statt ${soll.join(',') || 'keine'}`);
        }
        await pruefe(`${st}-ebenen`);
      }
      await h.klick('[data-pruef="weiter"]');
      await h.warte(200);
    }
    // B3 ist anders gebaut (sechs Teile, kein eigener Einstieg, keine Entscheidung; seit dem Durchstich P0)
    const pflicht = st === 'B3' ? ['werkzeug', 'ebenen'] : ['einstieg', 'vergleich', 'werkzeug', 'entscheidung', 'ebenen'];
    // B2: die Register-Tafel steht neben der Kette (Signal-Szene zeigt weitere Blöcke, P5.6)
    if (st === 'B2') pflicht.push('register');
    for (const t of pflicht) if (!gesehen.has(t)) h.befund(`${st}: Teil „${t}“ nicht gesehen`);
  }
  // Ihre Spur (E1, P5.8): nach B6 stehen A1–A6 mit ihren Partnern in der Seitenleiste, A links, B rechts
  await h.klick('[data-pruef="seitenleiste-spur"]');
  await h.erwarte('[data-pruef="spur"]');
  await h.warte(900); // die Seitenleiste fährt herein (von rechts) – erst danach messen
  const zeilen = await seite.locator('[data-pruef="spur"] .spur-paar').count();
  const beide = await seite.locator('[data-pruef="spur"] .spur-paar:not(:has(.spur-offen))').count();
  if (zeilen < 6 || beide < 5) h.befund(`Spur: ${zeilen} Zeilen, ${beide} mit Wahl in beiden Welten (erwartet ≥ 6 bzw. ≥ 5)`);
  // A links, B rechts (T10): die erste Zeile zeigt A1 in Welt A und B1 in Welt B
  if (optionen.spur !== undefined) {
    const a = await seite.locator('[data-pruef="spur-A1"] [data-welt="a"]').innerText();
    const b = await seite.locator('[data-pruef="spur-A1"] [data-welt="b"]').innerText();
    if (!a.includes(optionen.spur.a) || !b.includes(optionen.spur.b)) h.befund(`Spur A1: „${a}“ | „${b}“ statt ${optionen.spur.a} | ${optionen.spur.b}`);
  }
  await pruefe('spur');
  await h.taste('Escape');
}

/**
 * R51 (Stil): die Optionstitel ALLER Rollen bei 320 px – `.option-text` ist dort 168 px breit, und lange Komposita
 * („Verantwortungsmodell“) brachen ohne Strich, obwohl die Szenarien bei 320 px nur die Rolle pl spielen. Gemessen
 * werden Klone der sichtbaren Option mit jedem Titel aus inhalte.json; vorher muss der echte Titel so stehen, wie die
 * Story ihn setzt (mitTrennstellen), sonst mäße die Probe etwas anderes als die Anwendung.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} name
 * @returns {Promise<boolean>} gemessen (false: keine Option mit Trennstelle sichtbar)
 */
export async function optionstitelSchmal(seite, h, name) {
  const vp = seite.viewportSize();
  if (vp === null) return false;
  const datei = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'generiert', 'inhalte.json');
  /** @type {{ stationen: Record<string, { szenen?: Record<string, { entscheidung?: { optionen?: { titel: string }[] } | null }> }> }} */
  const inhalte = JSON.parse(readFileSync(datei, 'utf8'));
  const titel = new Set();
  for (const st of Object.values(inhalte.stationen)) for (const sz of Object.values(st.szenen ?? {})) for (const o of sz.entscheidung?.optionen ?? []) titel.add(o.titel);
  if (titel.size < 100) { h.befund(`${name}: nur ${titel.size} Optionstitel in inhalte.json gefunden`); return true; }
  const gesetzt = [...titel].map((t) => mitTrennstellen(t));
  await seite.setViewportSize({ width: 320, height: vp.height }); await h.warte(150);
  const echt = await seite.evaluate(() => [...document.querySelectorAll('.option .option-text')].filter((x) => x.getClientRects().length > 0).map((el) => {
    const k = /** @type {HTMLElement} */ (el.cloneNode(true));
    for (const sr of k.querySelectorAll('.nur-sr')) sr.remove();
    return k.textContent ?? '';
  }));
  // erst an einer Entscheidung messen, deren Titel eine Trennstelle bekommt – sonst sähe die Probe nicht, ob die Story sie setzt
  if (!echt.some((t) => mitTrennstellen(t.replaceAll('\u00ad', '')).includes('\u00ad'))) { await seite.setViewportSize(vp); await h.warte(100); return false; }
  const anders = echt.filter((t) => !gesetzt.includes(t));
  if (anders.length > 0) h.befund(`${name}: Optionstitel ${JSON.stringify(anders)} stehen nicht so, wie mitTrennstellen sie setzt`);
  else {
    await seite.evaluate((liste) => {
      const vorbild = [...document.querySelectorAll('.option')].find((x) => x.getClientRects().length > 0);
      if (vorbild === undefined || vorbild.parentElement === null) return;
      for (const t of liste) {
        const k = /** @type {HTMLElement} */ (vorbild.cloneNode(true));
        k.classList.add('pruef-klon');
        k.removeAttribute('data-pruef');
        const text = k.querySelector('.option-text');
        if (text !== null) text.textContent = t;
        vorbild.parentElement.append(k);
      }
    }, gesetzt);
    const bruch = await wortbrueche(seite, '.pruef-klon .option-text', { bildschirm: true });
    if (bruch.length > 0) h.befund(`${name} @320: ${bruch.length} Wörter in Optionstiteln ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 6))}`);
    const knapp = await knappeWoerter(seite, '.pruef-klon .option-text');
    if (knapp.length > 0) h.befund(`${name} @320: ungeteilte Wörter in Optionstiteln über 93 % der Zeile ${JSON.stringify(knapp.slice(0, 6))}`);
    await seite.evaluate(() => { for (const k of document.querySelectorAll('.pruef-klon')) k.remove(); });
  }
  await seite.setViewportSize(vp); await h.warte(100);
  return true;
}

/**
 * R51 (Stil): im Vergleich Welt A ⟷ B verdeckt nichts den Text der Karten – die Marke „Welt A · …“ (Regler auf A)
 * keine Textzeile einer Welt-A-Karte, ein Stationslabel des Governance-Flusses (Regler auf B) keine Karte. pruefeLayout
 * sieht das nicht, weil der Text in seiner eigenen Fläche bleibt. Bei 320, 360, 400, 1024 und 1280 px; danach zurück.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} name
 */
export async function vergleichFrei(seite, h, name) {
  const vp = seite.viewportSize();
  if (vp === null) return;
  const regler = seite.locator('[data-pruef="vergleich"]');
  const messe = (/** @type {'a' | 'b'} */ welt) => seite.evaluate((w) => {
    const deck = (/** @type {Element} */ el) => { let d = 1; for (let x = /** @type {Element | null} */ (el); x !== null; x = x.parentElement) d *= Number(getComputedStyle(x).opacity); return d; };
    const schnitt = (/** @type {DOMRect} */ p, /** @type {DOMRect} */ q) => [Math.min(p.right, q.right) - Math.max(p.left, q.left), Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top)];
    /** @type {string[]} */
    const funde = [];
    for (const v of document.querySelectorAll('.vergleich')) {
      if (v.getClientRects().length === 0) continue;
      if (w === 'a') {
        const marke = v.querySelector('.vergleich-marke[data-welt="a"]');
        if (marke === null || deck(marke) < 0.5) {
          const kette = [];
          for (let x = /** @type {Element | null} */ (marke); x !== null; x = x.parentElement) if (Number(getComputedStyle(x).opacity) < 1) kette.push(`${x.className}:${getComputedStyle(x).opacity}`);
          funde.push(`Marke Welt A nicht sichtbar (${kette.join(', ')}; ${v.getAttribute('style')})`);
          continue;
        }
        // R61: die Zahl der Datei-Karte („58,4 Mio. €“) steht in einer Zeile (Dateinamen dürfen nach „_“ brechen) und ragt nicht über ihre Karte
        for (const z of v.querySelectorAll('.morph-a .morph-datei b')) {
          const r = document.createRange();
          r.selectNodeContents(z);
          const zeilen = new Set([...r.getClientRects()].map((q) => Math.round(q.top))).size;
          if ((zeilen > 1 && !(z.textContent ?? '').includes('_')) || z.scrollWidth > z.clientWidth + 1) funde.push(`Zahl der Datei-Karte „${(z.textContent ?? '').trim()}“ in ${zeilen} Zeilen, ${z.scrollWidth} > ${z.clientWidth} px`);
        }
        const m = marke.getBoundingClientRect();
        const gang = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
        for (let n = gang.nextNode(); n !== null; n = gang.nextNode()) {
          const el = n.parentElement;
          if (el === null || el.closest('.morph-a') === null || (n.textContent ?? '').trim() === '' || deck(el) < 0.5) continue;
          const r = document.createRange();
          r.selectNodeContents(n);
          for (const q of r.getClientRects()) {
            const [b, hh] = schnitt(m, q);
            if (b > 1 && hh > 1) funde.push(`Marke über „${(n.textContent ?? '').trim().slice(0, 24)}“ ${Math.round(b)}×${Math.round(hh)} px`);
          }
        }
      } else {
        const karten = [...v.querySelectorAll('.morph-b')].filter((k) => k.getClientRects().length > 0 && deck(k) >= 0.5).map((k) => k.getBoundingClientRect());
        for (const l of v.querySelectorAll('.morph-station span')) {
          if (l.getClientRects().length === 0 || deck(l) < 0.5) continue;
          const r = l.getBoundingClientRect();
          for (const k of karten) {
            const [b, hh] = schnitt(r, k);
            if (b > 1 && hh > 1) funde.push(`Label „${(l.textContent ?? '').replaceAll('\u00ad', '')}“ unter einer Karte ${Math.round(b)}×${Math.round(hh)} px`);
          }
        }
      }
    }
    return funde;
  }, welt);
  // der Regler läuft beim Ankommen von selbst nach B – so lange drücken, bis --t am Ziel steht
  const stelle = async (/** @type {string} */ taste, /** @type {number} */ ziel) => {
    for (let i = 0; i < 30; i++) {
      await regler.focus(); await h.taste(taste); await h.warte(200);
      const t = await seite.evaluate(() => Number(getComputedStyle(/** @type {Element} */ (document.querySelector('.vergleich'))).getPropertyValue('--t')));
      if (Math.abs(t - ziel) < 0.001) { await h.warte(150); return; }
    }
    h.befund(`${name}: Regler erreicht ${ziel === 0 ? 'Welt A' : 'Welt B'} nicht`);
  };
  for (const breite of [320, 360, 400, 1024, 1280]) {
    await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150);
    await stelle('Home', 0);
    for (const f of await messe('a')) h.befund(`${name} @${breite} Welt A: ${f}`);
    // R61: der Dateiname der Welt-A-Karte bricht nur an „_“ und vor der Endung
    const bruch = await wortbrueche(seite, '.morph-a .morph-datei .mono', { bildschirm: true });
    if (bruch.length > 0) h.befund(`${name} @${breite} Welt A: Dateiname ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 3))}`);
    await stelle('End', 1);
    for (const f of await messe('b')) h.befund(`${name} @${breite} Welt B: ${f}`);
  }
  await seite.setViewportSize(vp); await h.warte(150);
  await stelle('Home', 0);
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

/**
 * R54 (Stil): die Titel der Schrittleiste (sichtbar ab 1440 px, eine Zeile, ohne Auslassung) passen bei gängigen
 * Laptop- und Beamerbreiten ganz in ihren Platz – „Rhythmus und Register“ war zwischen 1440 und 1900 px gekappt.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} name
 */
export async function schritttitelBreit(seite, h, name) {
  const vp = seite.viewportSize();
  if (vp === null) return;
  let gemessen = 0;
  for (const breite of [1440, 1536, 1680, 1920]) {
    await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150);
    const funde = await seite.evaluate(() => [...document.querySelectorAll('.fs-titel')].filter((el) => el.getClientRects().length > 0).map((el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      const text = r.getBoundingClientRect().width;
      return { t: (el.textContent ?? '').replaceAll('\u00ad', ''), text, platz: el.clientWidth };
    }));
    gemessen += funde.length;
    // der Titel schrumpft auf seinen Text, wo Platz ist – gekappt ist er, wo der Text breiter ist als sein Kasten
    for (const f of funde) if (f.text > f.platz + 0.5) h.befund(`${name} @${breite}: Schritttitel „${f.t}“ ${Math.round(f.text)} px auf ${f.platz} px`);
  }
  if (gemessen === 0) h.befund(`${name}: keine Schritttitel ab 1440 px sichtbar`);
  // R64 (Stil): mit offener Seitenleiste ist die Schrittleiste schmaler – dort kappten die Titel bei 1440–1680 px mitten im Wort
  const zu = await seite.locator('.leitstand[data-seitenleiste="offen"]').count() === 0;
  if (zu && await seite.locator('[data-pruef="seitenleiste-raum"]').filter({ visible: true }).count() > 0) {
    await h.klick('[data-pruef="seitenleiste-raum"]'); await h.warte(250);
    for (const breite of [1440, 1680, 1800, 1920]) {
      await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150);
      const funde = await seite.evaluate(() => [...document.querySelectorAll('.fs-titel')].filter((el) => el.getClientRects().length > 0).map((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return { t: (el.textContent ?? '').replaceAll('\u00ad', ''), text: r.getBoundingClientRect().width, platz: el.clientWidth };
      }));
      for (const f of funde) if (f.text > f.platz + 0.5) h.befund(`${name} @${breite} (Seitenleiste offen): Schritttitel „${f.t}“ ${Math.round(f.text)} px auf ${f.platz} px`);
    }
    await h.klick('[data-pruef="seitenleiste-zu"]'); await h.warte(200);
  }
  await seite.setViewportSize(vp); await h.warte(150);
}
