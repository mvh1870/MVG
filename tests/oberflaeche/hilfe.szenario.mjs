// Browser-Szenario Hilfe (P13, O-31): jede Hilfeseite (Teile und Unterseiten) – Layout (kein
// Seitwärtsscrollen), axe, kein „Whitepaper“, Verzeichnis mit derselben Aufteilung wie die Quelle,
// breite Tabellen per Tastatur erreichbar, Suche und Blättern. Schnell: 1280 und 400; voll zusätzlich 1024.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pruefeLayout, schmal } from './hilfen.mjs';
import { pdfSeiten, seitenMitUeberschriftAmEnde, wortbrueche } from './pdf.mjs';

export const name = 'hilfe';
export const hash = '#start';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const breite = seite.viewportSize()?.width ?? 1280;
  if (!h.voll && breite > 400 && breite < 1280) return;
  /** @type {{ kapitel: { id: string, titel: string, unter: { id: string, titel: string }[] }[] }} */
  const hilfe = JSON.parse(readFileSync(path.join(WURZEL, 'src', 'generiert', 'hilfe.json'), 'utf8'));
  await seite.emulateMedia({ reducedMotion: 'reduce' });

  // Zugang: leiser Link auf der Startseite
  await h.erwarte('[data-pruef="zur-hilfe"]');
  await seite.click('[data-pruef="zur-hilfe"]');
  await h.erwarte('[data-pruef="hilfe-uebersicht"]');
  const karten = await seite.locator('[data-pruef="hilfe-liste"] > li').count();
  if (karten !== hilfe.kapitel.length) h.befund(`Übersicht: ${karten} Karten statt ${hilfe.kapitel.length}`);
  await h.axe('uebersicht');
  await h.bild('uebersicht');

  // Suche: findet eine Seite und verlinkt sie
  await seite.fill('[data-pruef="hilfe-suche"]', 'Kostengruppe');
  await h.warte(100);
  const treffer = await seite.locator('[data-pruef="hilfe-treffer"] li').count();
  if (treffer === 0) h.befund('Suche „Kostengruppe“ ohne Treffer');

  const alle = hilfe.kapitel.flatMap((k) => [k, ...k.unter]);
  for (const [i, s] of alle.entries()) {
    await seite.evaluate((id) => { location.hash = `#hilfe/${id}`; }, s.id);
    await h.erwarte(`[data-seite="${s.id}"] [data-pruef="hilfe-inhalt"]`);
    const titel = await seite.locator('.kapitel-titel').innerText();
    if (titel.trim() !== s.titel) h.befund(`${s.id}: Titel „${titel}“ statt „${s.titel}“`);
    const aktuell = await seite.locator('[data-pruef="hilfe-verzeichnis"] a[aria-current="page"]').count();
    if (aktuell !== 1) h.befund(`${s.id}: ${aktuell} aktuelle Einträge im Verzeichnis`);
    await seite.evaluate(() => { for (const d of document.querySelectorAll('.hilfe-inhalt details')) d.setAttribute('open', ''); });
    // aufgeklappte Tabellen misst der ResizeObserver im nächsten Bild
    await h.warte(150);
    for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`${s.id}: ${fund}`);
    const wort = await seite.evaluate(() => /white\s*-?\s*paper/iu.test(document.body.innerText));
    if (wort) h.befund(`${s.id}: „Whitepaper“ im Text (O-29)`);
    const ohneFokus = await seite.evaluate(() => [...document.querySelectorAll('.hilfe-inhalt .h-table-wrap, .hilfe-inhalt .h-grafik-wrap')]
      .filter((el) => el.scrollWidth > el.clientWidth + 1 && el.getAttribute('tabindex') !== '0').length);
    if (ohneFokus > 0) h.befund(`${s.id}: ${ohneFokus} scrollbare Tabellen nicht per Tastatur erreichbar`);
    await schmal(seite, h, s.id);
    // Blättern: Weiter führt zur nächsten Seite der Lesereihenfolge
    const weiter = await seite.locator('.kapitel-nav a[rel="next"]').getAttribute('href').catch(() => null);
    const soll = alle[i + 1] !== undefined ? `#hilfe/${alle[i + 1].id}` : null;
    if (weiter !== soll) h.befund(`${s.id}: „Weiter“ führt zu ${weiter} statt ${soll}`);
    // Marken (Tags, Plaketten) einzeilig: keine fremde Regel bricht sie buchstabenweise um (Prüfagent Stil, Befund 1)
    const hoch = await seite.evaluate(() => [...document.querySelectorAll('.hilfe-inhalt :is(.h-tag, .h-badge, .h-pill)')]
      .filter((el) => el.getBoundingClientRect().height > 40).map((el) => (el.textContent ?? '').trim()).slice(0, 3));
    if (hoch.length > 0) h.befund(`${s.id}: Marken umbrochen (${hoch.join(', ')})`);
    await h.axe(s.id);
    if (s.id === 'mvg-vorgehensmodell' || s.id === 'standards') await h.bild(s.id);
  }

  // R37: im Browserdruck (A4, Satzspiegel ≈ 688 px) wird keine breite Tabelle oder Grafik abgeschnitten
  if (breite >= 1280) {
    const vorher = seite.viewportSize() ?? { width: 1280, height: 720 };
    await seite.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
    // R44: wie im Druck – Media Queries bei der Blattbreite (≈ 794 px), Satz 688 px (L-124)
    await seite.setViewportSize({ width: 794, height: vorher.height });
    await seite.evaluate(() => { document.documentElement.style.width = '688px'; });
    // R47: dazu das Handbuch (Zwischenzeilen vor Listen) und eine Rollenseite (Kopfzeile der Cheat-Sheets)
    // R48: voll alle Seiten samt Übersicht (''), schnell eine Auswahl mit den bekannten Druckfällen
    const druckSeiten = h.voll ? ['', ...alle.map((x) => x.id)]
      : ['', 'mvg-vorgehensmodell', 'registerdokument-katalog', 'kollaboration', 'datenmanagement', 'faq-glossar', 'kundenanpassung', 'handbuch', 'rollen-anleitungen', 'rollen-anleitungen-bauherr-auftraggeber', 'rollen-anleitungen-controlling-finance'];
    for (const id of druckSeiten) {
      await seite.evaluate((x) => { location.hash = x === '' ? '#hilfe' : `#hilfe/${x}`; }, id);
      await h.erwarte(id === '' ? '[data-pruef="hilfe-uebersicht"]' : `[data-seite="${id}"] [data-pruef="hilfe-inhalt"]`);
      await seite.evaluate(() => { document.documentElement.style.width = '688px'; });
      await h.warte(150);
      // R44: Druckzustand wie beim echten Druck (beforeprint setzt Trennstellen); Wörter brechen nur an Trennstellen
      const textVorher = await seite.evaluate(() => document.querySelector('.hilfe-inhalt')?.textContent ?? '');
      await seite.evaluate(() => { window.dispatchEvent(new Event('beforeprint')); });
      const bruch = await wortbrueche(seite, '.hilfe-inhalt');
      if (bruch.length > 0) h.befund(`Druck ${id}: ${bruch.length} Wörter ohne Trennstrich gebrochen ${JSON.stringify(bruch.slice(0, 6))}`);
      // Tabellen bleiben hochkant im Satzspiegel; breite Grafiken stehen auf der Querseite (R39, unten geprüft)
      const gekappt = await seite.evaluate(() => [...document.querySelectorAll('.hilfe-inhalt .h-table-wrap')]
        .filter((el) => el.scrollWidth > el.clientWidth + 1 || el.getBoundingClientRect().right > (document.querySelector('.hilfe-inhalt')?.getBoundingClientRect().right ?? 0) + 1).length);
      if (gekappt > 0) h.befund(`Druck ${id}: ${gekappt} Tabellen abgeschnitten`);
      // R38: breite Grafiken stehen auf einer Querseite (A4 quer, Rand 10 mm, Satzspiegel 277 mm; Grafik ausdrücklich 262 mm breit)
      const hochkant = await seite.evaluate(() => [...document.querySelectorAll('.hilfe-inhalt .h-grafik-wrap')].filter((el) => getComputedStyle(el).page !== 'hilfe-quer').length);
      if (hochkant > 0) h.befund(`Druck ${id}: ${hochkant} breite Grafiken nicht auf der Querseite`);
      // R40: die Überschrift der Grafik steht mit ihr auf der Querseite, nicht allein am Ende der Hochkantseite
      const ohneKopf = await seite.evaluate(() => [...document.querySelectorAll('.hilfe-inhalt .h-card:has(.h-grafik-wrap)')].filter((karte) => {
        const vor = karte.previousElementSibling;
        const kopf = vor?.matches('h2, h3') ? vor : vor?.matches('p') && vor.previousElementSibling?.matches('h2, h3') ? vor.previousElementSibling : null;
        return kopf !== null && getComputedStyle(kopf).page !== 'hilfe-quer';
      }).length);
      if (ohneKopf > 0) h.befund(`Druck ${id}: ${ohneKopf} Grafik-Überschriften nicht auf der Querseite`);
      // R41: im echten PDF – keine Seite endet mit einer Überschrift, keine leere Seite (Abstand unter der Seite)
      // R48 (Architektur): auch eine Kopfzeile, die (ohne thead) als erste Zeile im tbody steht
      const koepfe = await seite.evaluate(() => [...document.querySelectorAll('.hilfe-inhalt :is(h1, h2, h3, h4, summary), .hilfe-inhalt .h-help-content-inline > b:first-child, .hilfe-inhalt .h-help-content-inline > b:has(+ :is(ol, ul)), .hilfe-inhalt thead tr, .hilfe-inhalt tbody > tr:first-child:not(:has(> td))')]
        .map((x) => ({ text: x.textContent ?? '', pt: parseFloat(getComputedStyle(x).fontSize) * 0.75 })));
      // R48 (Architektur): helle Schrift druckt ihre Fläche mit (Nummernmarken „01“–„05“ weiß auf Navy, L-137) – wie die Theorie
      const blass = await seite.evaluate(() => {
        const lum = (/** @type {string} */ c) => { const m = c.match(/[\d.]+/gu)?.map(Number) ?? [0, 0, 0]; const f = (/** @type {number} */ v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(m[0] ?? 0) + 0.7152 * f(m[1] ?? 0) + 0.0722 * f(m[2] ?? 0); };
        return [...document.querySelectorAll('.hilfe-inhalt *')].filter((el) => [...el.childNodes].some((k) => k.nodeType === 3 && (k.textContent ?? '').trim() !== '') && el.getClientRects().length > 0)
          .filter((el) => { const cs = getComputedStyle(el); return 1.05 / (lum(cs.color) + 0.05) < 4.5 && cs.printColorAdjust !== 'exact'; })
          .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`).slice(0, 5);
      });
      if (blass.length > 0) h.befund(`Druck ${id}: helle Schrift ohne gedruckte Fläche ${JSON.stringify(blass)}`);
      // R48: keine Aufklappzeichen („+“/„–“) im Druck
      const zeichen = await seite.evaluate(() => [...document.querySelectorAll('.hilfe-inhalt summary')].filter((x) => !['none', 'normal'].includes(getComputedStyle(x, '::after').content)).length);
      if (zeichen > 0) h.befund(`Druck ${id}: ${zeichen} Aufklappzeichen im Druck`);
      // R48: Karten unter einer Seitenhöhe reißen nicht über die Seitengrenze – je Karte eine Marke oben und unten (absolut
      // gesetzt, ohne Einfluss auf den Fluss); im PDF stehen beide auf derselben Seite. Die Marken sind 8 pt und schwarz:
      // Chrome 153 übernahm weiße 2-px-Marken nicht in den Text des PDF (CI 223); das PDF dient nur der Messung
      const kartenMarken = await seite.evaluate(() => {
        let n = 0;
        for (const k of document.querySelectorAll('.hilfe-inhalt :is(.h-card, .h-feature-card, .h-role-pick-card):not(:has(.h-grafik-wrap, table)), .lernseite.hilfe .kapitel-karten > li')) {
          if (!(k instanceof HTMLElement) || k.getBoundingClientRect().height > 800 || k.getBoundingClientRect().height === 0) continue;
          n += 1;
          if (getComputedStyle(k).position === 'static') k.style.position = 'relative';
          for (const [ort, lage] of [['A', 'top:0'], ['E', 'bottom:0']]) {
            const m = document.createElement('span');
            m.className = 'pruef-marke';
            m.textContent = `QK${ort}${n}Q`;
            m.style.cssText = `position:absolute;${lage};left:0;font-size:8px;line-height:1;color:#000;white-space:nowrap`;
            k.append(m);
          }
        }
        // R49: der Fuß bleibt beisammen und beim Inhalt – Marken an seinem Anfang und Ende (Fall: letztes Blatt nur „fachlich ungeprüft“)
        const fuss = document.querySelector('.lernseite.hilfe .lern-fuss');
        if (fuss instanceof HTMLElement) {
          if (getComputedStyle(fuss).position === 'static') fuss.style.position = 'relative';
          for (const [ort, lage] of [['A', 'top:0'], ['E', 'bottom:0']]) {
            const m = document.createElement('span');
            m.className = 'pruef-marke';
            m.textContent = `QF${ort}Q`;
            m.style.cssText = `position:absolute;${lage};left:0;font-size:8px;line-height:1;color:#000;white-space:nowrap`;
            fuss.append(m);
          }
        }
        return n;
      });
      // R48: page.pdf auf A4 (ohne `format` setzt Playwright US-Letter) und ohne die Mess-Breite des Satzspiegels
      await seite.evaluate(() => { document.documentElement.style.width = ''; });
      await seite.setViewportSize(vorher);
      const pdfRoh = await pdfSeiten(await seite.pdf({ format: 'A4', preferCSSPageSize: true }));
      // die Marken selbst zählen für die übrigen Proben nicht (sonst wäre eine Marke die letzte Zeile einer Seite)
      const pdfText = pdfRoh.map((x) => {
        const behalten = x.zeilen.map((z, i) => ({ z: z.replace(/\s*Q(?:K[AE]\d+|F[AE])Q\s*/gu, ' ').trim(), g: x.groessen?.[i] })).filter((y) => y.z !== '');
        return { ...x, zeilen: behalten.map((y) => y.z), groessen: behalten.map((y) => y.g ?? 0) };
      });
      await seite.setViewportSize({ width: 794, height: vorher.height });
      await seite.evaluate(() => { for (const m of document.querySelectorAll('.pruef-marke')) m.remove(); });
      // A4 hochkant 595 × 842 pt, quer 842 × 595 pt (US-Letter wäre 612 × 792)
      if (pdfText.some((x) => !(Math.abs(x.breite - 595.3) < 2 || Math.abs(x.breite - 841.9) < 2))) h.befund(`Druck ${id}: Seitenformat nicht A4 (${pdfText.map((x) => Math.round(x.breite)).join('/')} pt breit)`);
      const seiteVon = (/** @type {string} */ marke) => pdfRoh.findIndex((x) => x.zeilen.some((z) => z.includes(marke)));
      /** @type {{ karte: number, von: number, bis: number }[]} */
      const gerissen = [];
      let gefunden = 0;
      for (let i = 1; i <= kartenMarken; i++) {
        const a = seiteVon(`QKA${i}Q`);
        const e = seiteVon(`QKE${i}Q`);
        if (a >= 0 && e >= 0) gefunden += 1;
        if (a >= 0 && e >= 0 && a !== e) gerissen.push({ karte: i, von: a + 1, bis: e + 1 });
      }
      if (kartenMarken > 0 && gefunden < kartenMarken) h.befund(`Druck ${id}: nur ${gefunden} von ${kartenMarken} Kartenmarken im PDF gefunden`);
      if (gerissen.length > 0) h.befund(`Druck ${id}: Karten über die Seitengrenze ${JSON.stringify(gerissen.slice(0, 5))}`);
      const fussA = seiteVon('QFAQ');
      const fussE = seiteVon('QFEQ');
      // vor dem Fuß steht auf seiner Seite noch Inhalt (die Zeile mit der Anfangsmarke ist nicht die erste der Seite)
      const vorFuss = fussA < 0 ? 0 : (pdfRoh[fussA]?.zeilen.findIndex((z) => z.includes('QFAQ')) ?? 0);
      // R50: der Fuß steht im Druck oben auf der ersten Seite (L-159; unter Chrome 153 blieb er unten allein zurück)
      if (fussA !== 0 || fussE !== 0 || vorFuss === 0) h.befund(`Druck ${id}: Fuß nicht oben auf S. 1 (Anfang S. ${fussA + 1}, Ende S. ${fussE + 1}, Zeilen davor ${vorFuss})`);
      // R51: „fachlich ungeprüft“ steht auf S. 1 genau einmal (Kopf), der Fuß wiederholt ihn im Druck nicht
      // pdf.js liefert Wortteile getrennt (Unterschneidung) – ohne Leerraum zählen
      const vermerke = ((pdfText[0]?.zeilen.join('') ?? '').replace(/\s+/gu, '').normalize('NFC').match(/ungeprüft/giu) ?? []).length;
      if (vermerke !== 1) h.befund(`Druck ${id}: „ungeprüft“ ${vermerke}-mal auf S. 1 (erwartet einmal)`);
      const amEnde = seitenMitUeberschriftAmEnde(pdfText, koepfe);
      if (amEnde.length > 0) h.befund(`Druck ${id}: Überschrift am Seitenende ${JSON.stringify(amEnde)}`);
      if (pdfText.some((x) => x.zeilen.length === 0)) h.befund(`Druck ${id}: leere Seite`);
      // R48: keine fast leere Seite – außer vor einer Querseite (L-144: die breite Grafik erzwingt dort den Seitenwechsel)
      const fastLeer = pdfText.slice(0, -1).map((x, i) => ({ seite: i + 1, fuellung: Math.round((x.fuellung ?? 0) * 100), vorQuer: (pdfText[i + 1]?.breite ?? 0) > (pdfText[i + 1]?.hoehe ?? 0) }))
        .filter((x) => x.fuellung < 35 && !x.vorQuer && (pdfText[x.seite - 1]?.breite ?? 0) < (pdfText[x.seite - 1]?.hoehe ?? 0));
      if (fastLeer.length > 0) h.befund(`Druck ${id}: fast leere Seiten ${JSON.stringify(fastLeer)}`);
      // R42: Papier hat keine Links – kein Kopf-Link, kein Zurück/Weiter, kein „Öffnen“
      const bedien = await seite.evaluate(() => [...document.querySelectorAll('.hilfe :is(.lern-kopf-link, .kapitel-nav, .kapitel-karte-los)')].filter((x) => getComputedStyle(x).display !== 'none').length);
      if (bedien > 0) h.befund(`Druck ${id}: ${bedien} Bedienelemente im Druck`);
      // der Druckzustand endet mit afterprint: danach steht wieder der Originaltext (Suche, Kopieren)
      await seite.evaluate(() => { window.dispatchEvent(new Event('afterprint')); });
      if (await seite.evaluate(() => document.querySelector('.hilfe-inhalt')?.textContent ?? '') !== textVorher) h.befund(`Druck ${id}: Text nach dem Druck verändert`);
    }
    // auf der Querseite erreichen die kleinsten Beschriftungen 7 pt (9,33 px)
    await seite.evaluate(() => { location.hash = '#hilfe/kollaboration'; });
    await h.erwarte('[data-seite="kollaboration"] .h-grafik-wrap svg text');
    // R39: Chromium setzt die Querseite in der Spaltenbreite der Hochkantseite – gemessen wird daher bei 688 px
    await seite.setViewportSize({ width: 688, height: vorher.height });
    await h.warte(150);
    const klein = await seite.evaluate(() => Math.min(...[...document.querySelectorAll('.hilfe-inhalt .h-grafik-wrap svg text')]
      .map((t) => parseFloat(getComputedStyle(t).fontSize) * (t.getScreenCTM()?.a ?? 1))));
    if (!(klein >= 9.33)) h.befund(`Druck: kleinste Grafikbeschriftung auf der Querseite ${klein.toFixed(1)} px (< 7 pt)`);
    await seite.evaluate(() => { document.documentElement.style.width = ''; });
    await seite.setViewportSize(vorher);
    await seite.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  }

  // Grafik vergrößern (Prüfrunde 3): Dialog öffnet, Beschriftung lesbar, Esc schließt
  await seite.evaluate(() => { location.hash = '#hilfe/mvg-vorgehensmodell'; });
  await h.erwarte('[data-pruef="grafik-gross"]');
  await seite.locator('[data-pruef="grafik-gross"]').last().click();
  await h.erwarte('dialog[open]');
  const klein = await seite.evaluate(() => Math.min(...[...document.querySelectorAll('dialog[open] svg text')].map((t) => t.getBoundingClientRect().height)));
  if (klein < 11.5) h.befund(`Grafik vergrößert: Beschriftung nur ${klein.toFixed(1)} px hoch`);
  // R13: ab 1224 px passt die Grafik samt Rand in den Dialog (keine Inline-Breite aus der Quelle), der Kopf ist bündig
  const dlgMass = await seite.evaluate(() => {
    const d = document.querySelector('dialog[open]');
    const k = d?.querySelector('.hilfe-grafik-dialog-kopf');
    const knopf = k?.querySelector('button');
    if (!d || !k || !knopf) return null;
    const r = d.getBoundingClientRect();
    return { sw: d.scrollWidth, cw: d.clientWidth, kopf: Math.round(k.getBoundingClientRect().top - r.top), breit: window.innerWidth,
      oben: Math.round(r.top), unten: Math.round(window.innerHeight - r.bottom), knopfAbKopf: Math.round(knopf.getBoundingClientRect().top - k.getBoundingClientRect().top) };
  });
  if (dlgMass !== null && dlgMass.breit >= 1260 && dlgMass.sw > dlgMass.cw + 1) h.befund(`Grafik-Dialog: ${dlgMass.sw - dlgMass.cw} px breiter als sein Innenraum`);
  if (dlgMass !== null && dlgMass.kopf !== 0) h.befund(`Grafik-Dialog: Kopf ${dlgMass.kopf} px unter der Oberkante`);
  // R14: mittig (wie der Abbildungs-Dialog), „Schließen“ so dicht an der Kopfkante wie dort (8 px Innenabstand)
  if (dlgMass !== null && Math.abs(dlgMass.oben - dlgMass.unten) > 2) h.befund(`Grafik-Dialog nicht mittig (oben ${dlgMass.oben}, unten ${dlgMass.unten} px)`);
  if (dlgMass !== null && dlgMass.knopfAbKopf > 10) h.befund(`Grafik-Dialog: „Schließen“ ${dlgMass.knopfAbKopf} px unter der Kopfkante`);
  await h.axe('grafik-dialog');
  await seite.keyboard.press('Escape');
  await h.warte(100);
  if ((await seite.locator('dialog[open]').count()) !== 0) h.befund('Grafik-Dialog schließt nicht mit Esc');

  // Unterseiten des aktuellen Teils im Verzeichnis (gleiche Aufteilung wie die Quelle)
  const rollen = hilfe.kapitel.find((k) => k.unter.length > 0);
  if (rollen !== undefined) {
    await seite.evaluate((id) => { location.hash = `#hilfe/${id}`; }, rollen.unter[0].id);
    await seite.locator('.hilfe-unterliste').waitFor({ state: 'attached', timeout: 3000 });
    const n = await seite.locator('.hilfe-unterliste li').count();
    if (n !== rollen.unter.length) h.befund(`Verzeichnis: ${n} Unterseiten statt ${rollen.unter.length}`);
  }
  // R17: eine Rollenkarte ist als Ganzes Ziel ihres Links (Klick in die untere linke Ecke)
  await seite.evaluate(() => { location.hash = '#hilfe/rollen-anleitungen'; });
  const karte = seite.locator('.h-role-pick-card:has(> h2 > a)').nth(1);
  if (await karte.count() === 0) h.befund('Rollen-Anleitungen: keine Rollenkarte mit Link');
  else {
    await karte.scrollIntoViewIfNeeded();
    const kb = await karte.boundingBox();
    if (kb !== null) {
      await seite.mouse.click(kb.x + 6, kb.y + kb.height - 6);
      await h.warte(300);
      const ort = await seite.evaluate(() => location.hash);
      if (!ort.startsWith('#hilfe/rollen-anleitungen-')) h.befund(`Rollenkarte: Klick in die Karte führt nicht zur Anleitung (${ort})`);
    }
  }
  // R20: der Tastaturfokus auf einem Kartenlink umrandet die Karte sichtbar
  await seite.evaluate(() => { location.hash = '#hilfe/rollen-anleitungen'; });
  await h.warte(300);
  const erster = seite.locator('.h-role-pick-card > h2 > a').first();
  await erster.focus();
  await seite.keyboard.press('Shift+Tab');
  await seite.keyboard.press('Tab');
  await h.warte(400); // Fokusrahmen blendet weich ein
  const ring = await seite.evaluate(() => {
    const a = document.activeElement;
    const k = a?.closest('.h-role-pick-card');
    if (!k) return null;
    const s = getComputedStyle(k);
    return { stil: s.outlineStyle, breite: parseFloat(s.outlineWidth), linkHof: a ? getComputedStyle(a).boxShadow : '' };
  });
  if (ring === null || ring.stil === 'none' || ring.breite < 2) h.befund(`Rollenkarte: Tastaturfokus ohne sichtbaren Rahmen (${JSON.stringify(ring)})`);
  // R26: nur eine Fokusanzeige – der Titel-Link trägt keinen eigenen Hof
  else if (ring.linkHof !== 'none') h.befund(`Rollenkarte: doppelte Fokusanzeige (Link-Hof ${ring.linkHof})`);
  // R20: die Hilfe hat genau eine main-Landmarke
  if (await seite.locator('main').count() !== 1) h.befund(`Hilfe: ${await seite.locator('main').count()} main-Landmarken statt 1`);
  if (await seite.locator('nav[aria-label="Hilfe-Kapitel"] details.kapitel-verzeichnis').count() !== 1) h.befund('Hilfe: Verzeichnis ohne Navigation-Landmarke');
  const hilfeNav = await seite.evaluate(() => [...document.querySelectorAll('nav')].map((n) => n.getAttribute('aria-label') ?? ''));
  if (new Set(hilfeNav).size !== hilfeNav.length) h.befund(`Hilfe: gleichnamige Navigationen (${hilfeNav.join(', ')})`);
  // R23: jede Navigation der Hilfe hat einen Namen und mindestens einen Link (auch Handbuch und Standards)
  for (const id of ['handbuch', 'standards']) {
    await seite.evaluate((x) => { location.hash = `#hilfe/${x}`; }, id);
    await h.warte(400);
    const leer = await seite.evaluate(() => [...document.querySelectorAll('nav')].filter((n) => !n.getAttribute('aria-label') || n.querySelector('a[href]') === null).length);
    if (leer > 0) h.befund(`Hilfe ${id}: ${leer} Navigation(en) ohne Namen oder ohne Link`);
  }
}
