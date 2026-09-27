// Gemeinsame Hilfen der Browser-Szenarien (kein Szenario: Dateiname ohne .szenario.mjs).

/** Läuft im Browser: horizontales Scrollen und abgeschnittener Text (wie im Durchstich-Szenario). */
export function pruefeLayout() {
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

/** Läuft im Browser: Kontrast der Quellenzeilen unter Zitaten gegen den ersten deckenden Hintergrund. */
export function kontrastQuellen() {
  const rgb = (s) => (s.match(/[\d.]+/gu) ?? []).map(Number);
  const lum = ([r, g, b]) => {
    const k = (c) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);
  };
  const funde = [];
  for (const el of document.querySelectorAll('.zitat-block .quelle b')) {
    if (!(el instanceof HTMLElement) || el.offsetParent === null) continue;
    let grund = null;
    for (let a = el; a !== null; a = a.parentElement) {
      const f = rgb(getComputedStyle(a).backgroundColor);
      if (f.length >= 3 && (f[3] ?? 1) > 0.9) { grund = f; break; }
    }
    if (grund === null) grund = [255, 255, 255];
    const [l1, l2] = [lum(rgb(getComputedStyle(el).color)), lum(grund)].sort((a, b) => b - a);
    const verh = (l1 + 0.05) / (l2 + 0.05);
    if (verh < 4.5) funde.push(`Quellenzeile „${el.textContent?.slice(0, 30)}“ Kontrast ${verh.toFixed(2)}:1`);
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
    await h.axe(name);
    await h.bild(name);
  };
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
 * @param {{ vertiefungen?: string[], spur?: { a: string, b: string } }} [optionen]  erwartete Vertiefungen je Station; Kurzformen A1/B1 in der Spur
 */
export async function weltB(seite, h, station, pruefe, optionen = {}) {
  if ((await station()) !== 'B1') h.befund(`Welt B beginnt nicht in B1 (steht in ${await station()})`);
  const sichtbar = async (sel) => (await seite.locator(sel).filter({ visible: true }).count()) > 0;
  /** Werkzeug → Selektor */
  const WERKZEUGE = Object.entries({
    raci: '[data-pruef="raci"]', rhythmus: '[data-pruef="tafel-rhythmus"]', karten: '[data-pruef="tafel-karten"]', register: '[data-pruef="tafel-register"]',
    phasen: '[data-pruef="tafel-phasen"]', kette: '.kette', mandatsleiter: '.mandat-raster', vorlage: '[data-pruef="vorlage"]', fluss: '[data-pruef="fluss"]', datenstand: '[data-pruef="datenstand"]',
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
      if (await sichtbar('[data-pruef="einstieg-text"]') && !gesehen.has('einstieg')) { gesehen.add('einstieg'); await pruefe(`${st}-einstieg`); }
      if (await sichtbar('[data-pruef="vergleich"]') && !gesehen.has('vergleich')) {
        gesehen.add('vergleich');
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
    // B3 ist anders gebaut (sechs Teile, kein eigener Einstieg, keine Entscheidung; Durchstich P0)
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
