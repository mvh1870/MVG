// Browser-Szenario Durchstich P0.6: Start → Story (Prolog, A3 ganz, Option B, Konsequenz, Vergleich
// auf Welt B, B3 bis zum Rückbezug, Ebene 4 mit Zitat) → Theorie Kapitel 1 mit Originaltext →
// zweites Fenster Regie + Leinwand (Regie „weiter“ → Leinwand folgt; keine Regie-Notiz auf der
// Leinwand). Ausgeführt von werkzeuge/oberflaeche.mjs in allen Standard-Viewports.
//
// Test-Haken-Vertrag: data-pruef = weg-story, weg-theorie, leitstand, fiktiv, status, story-karte,
// weiter, zurueck, rolle-<id>, interesse-<id>, info-anfordern, option-A…D, konsequenz, feld-<art>,
// vergleich, vergleich-a/b, teil-<n>, rueckbezug, ebene-<n>, zitat, kapitel-liste, kapitel-<n>,
// originaltext, querverweis-<station>, regie, regie-notiz, regie-weiter, regie-rolle-<id>,
// leinwand-oeffnen, leinwand-status, leinwand, version, ungeprueft.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const name = 'durchstich';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
/** Erst im Lauf gelesen: Das Laden der Szenarien (auch „kein Browser“) braucht src/generiert nicht. */
const ladeInhalte = () => JSON.parse(readFileSync(path.join(WURZEL, 'src', 'generiert', 'inhalte.json'), 'utf8'));

/** Text ohne Tags, Leerraum zusammengezogen. @param {string} html */
function klartext(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

/** Läuft im Browser: horizontales Scrollen und waagrecht abgeschnittener Text (wie oberflaeche.mjs). */
function pruefeLayout() {
  /** @type {string[]} */
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
    if (st.clip && st.clip !== 'auto') continue;
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
  const inhalte = ladeInhalte();
  /**
   * Stand prüfen und Bild ablegen, nachdem die Auftritte der Szene gelaufen sind.
   * @param {string} name @param {import('playwright').Page} [f] @param {number} [ms]
   */
  const stand = async (name, f = seite, ms = 1500) => {
    await h.warte(ms);
    for (const fund of await f.evaluate(pruefeLayout)) h.befund(`${name}: ${fund}`);
    await h.bild(name, f);
    await h.axe(name, f);
  };
  /** @param {string} selektor @param {import('playwright').Page} [f] */
  const text = async (selektor, f = seite) => (await f.locator(selektor).first().innerText()).replace(/\s+/g, ' ').trim();
  const weiter = async () => {
    await h.klick('[data-pruef="weiter"]');
    await h.warte(150);
  };

  /* ------------------------------------------------------------ Start → Story -- */
  await h.erwarte('[data-pruef="weg-story"]');
  const fuss = await text('[data-pruef="fuss"]');
  if (!fuss.toLowerCase().includes('fachlich ungeprüft')) h.befund('Startseite: Fuß ohne „fachlich ungeprüft“');
  if (!/Whitepaper V\d+\.\d+ · Story \d+\.\d+/.test(fuss)) h.befund(`Startseite: Version fehlt im Fuß („${fuss}“)`);
  await h.erwarte('[data-pruef="praesentieren"]');
  await h.klick('[data-pruef="weg-story"]');
  await h.erwarte('[data-pruef="leitstand"]');
  if (!(await text('[data-pruef="fiktiv"]')).toLowerCase().includes('fiktiver fall')) h.befund('Story: Vermerk „Fiktiver Fall“ fehlt');
  // L-4: im Prolog weder Instrumente noch Karte, Seitenleiste eingeklappt
  await h.erwarteNicht('[data-pruef="status"]');
  await h.erwarteNicht('[data-pruef="story-karte"]');
  if ((await seite.locator('[data-pruef="leitstand"]').getAttribute('data-seitenleiste')) !== 'zu') h.befund('Seitenleiste nicht eingeklappt');
  await stand('prolog');

  /* -------------------------------------------------------------- Rollenwahl -- */
  await weiter();
  await h.erwarte('[data-pruef="rolle-pl"]');
  const rollen = await seite.locator('.rollen-karte').count();
  const folgt = await seite.locator('.rollen-karte:disabled').count();
  if (rollen !== 6 || folgt !== 0) h.befund(`Rollenwahl: erwartet 6 spielbare Rollen (P2.5) – gefunden ${rollen}, davon ${folgt} gesperrt`);
  await stand('rollenwahl');
  await h.klick('[data-pruef="rolle-pl"]');
  await h.erwarte('[data-pruef^="interesse-"]');
  await weiter();

  /* ---------------------------------------------------------- A3 · Einstieg -- */
  await h.erwarte('.mail');
  await h.erwarteNicht('[data-pruef="status"]');
  await h.erwarteNicht('[data-pruef="story-karte"]');
  await stand('a3-einstieg', seite, 3800);
  await weiter();

  /* ----------------------------------------------------------- A3 · Lagebild -- */
  await h.erwarte('[data-pruef="info-anfordern"]');
  if (h.viewport.breite >= 981) {
    await h.erwarte('[data-pruef="story-karte"]');
    // LPH-Band (P2.2): A3 steht in LPH 5
    await h.erwarte('[data-pruef="lph-band"] [aria-current="step"][data-lph="5"]');
  }
  await h.klick('[data-pruef="info-anfordern"]');
  await h.warte(2600);
  if ((await seite.locator('.ungeklaert li.ist-geloest').count()) === 0) h.befund('Zeitsprung: kein Punkt als geklärt markiert');
  // Glossar: Mausberührung zeigt die Definition (Tooltip), Esc schließt
  const begriff = seite.locator('[data-pruef="glossar-begriff"]').first();
  if ((await begriff.count()) > 0) {
    await begriff.hover();
    await h.erwarte('.tipp[role="tooltip"]');
    await h.taste('Escape');
    await h.erwarteNicht('.tipp[role="tooltip"]');
    await seite.mouse.move(0, 0);
  } else h.befund('Lagebild: kein Glossar-Begriff');
  await stand('a3-lage');
  await weiter();

  /* ------------------------------------------------------- A3 · Entscheidung -- */
  await h.erwarte('[data-pruef="option-B"]');
  await h.erwarte('[data-pruef="status"]');
  for (const o of ['A', 'C', 'D']) await h.erwarte(`[data-pruef="option-${o}"]`);
  await stand('a3-entscheidung');
  await h.klick('[data-pruef="option-B"]');

  /* --------------------------------------------------------- A3 · Konsequenz -- */
  await h.erwarte('[data-pruef="konsequenz"]');
  for (const f of ['konsequenz', 'governance']) await h.erwarte(`[data-pruef="feld-${f}"]`);
  // „Was fehlt“ und „Neues Risiko“ zum Aufklappen (H15)
  await h.erwarteNicht('[data-pruef="feld-fehlt"]');
  await h.klick('[data-pruef="felder-mehr"] > summary');
  for (const f of ['fehlt', 'risiko']) await h.erwarte(`[data-pruef="feld-${f}"]`);
  await stand('a3-konsequenz');
  // Standpunkt wechseln: Seitenleiste öffnen, Rollen-Linse zeigt andere Blickwinkel, Esc schließt
  await h.klick('[data-pruef="seitenleiste-raum"]');
  await h.klick('[data-pruef="standpunkt"]');
  await h.erwarte('[data-pruef="linse"] .blickwinkel');
  await stand('a3-linse', seite, 900);
  await h.taste('Escape');
  await h.erwarteNicht('[data-pruef="linse"]');
  // Quellenfenster (P2.3): Reiter „Quellen“ zeigt die Absätze der Station wörtlich
  await h.klick('[data-pruef="reiter-quellen"]');
  await h.erwarte('[data-pruef="quelle-k2.4-p2"] .mvg-original');
  await stand('a3-quellen', seite, 400);
  await h.taste('Escape');
  if ((await seite.locator('[data-pruef="leitstand"]').getAttribute('data-seitenleiste')) !== 'zu') h.befund('Seitenleiste schließt nicht mit Esc');
  await weiter();

  /* --------------------------------------------------- Vergleich Welt A ⟷ B -- */
  const regler = await h.erwarte('[data-pruef="vergleich"]');
  await regler.focus();
  await h.taste('End');
  try {
    await seite.locator('[data-pruef="vergleich"][aria-valuenow="100"]').waitFor({ timeout: 5000 });
  } catch {
    h.befund('Vergleich: Regler erreicht Welt B nicht');
  }
  await h.warte(400);
  await stand('vergleich-b');
  await weiter();

  /* ------------------------------------------------ B3 · sechs Teile → Rückbezug -- */
  await h.erwarte('[data-pruef="teil-1"]');
  await stand('b3-signal', seite, 3500);
  const teilBilder = [['[data-pruef="datenstand"]', 'b3-datenstand', 2000], ['.mandat-raster', 'b3-mandat', 3400], ['[data-pruef="vorlage"]', 'b3-vorlage', 3500], ['[data-pruef="fluss"]', 'b3-fluss', 4600]];
  for (let i = 0; i < 6 && (await seite.locator('[data-pruef="rueckbezug"]').count()) === 0; i += 1) {
    await weiter();
    for (const [sel, bild, ms] of teilBilder) if ((await seite.locator(String(sel)).count()) > 0) await stand(String(bild), seite, Number(ms));
  }
  await h.erwarte('[data-pruef="rueckbezug"]');
  const soll = klartext(inhalte.stationen.B3.szenen.pl.rueckbezug.texte.B);
  const ist = await text('[data-pruef="rueckbezug"]');
  if (!ist.includes(soll.slice(0, 60))) h.befund(`Rückbezug ohne den Satz zu Option B: „${ist.slice(0, 120)}“`);
  await stand('b3-rueckbezug');

  /* ---------------------------------------------------------- Ebenen 1 → 4 -- */
  await weiter();
  await h.erwarte('[data-pruef="ebene-1"]');
  for (let i = 0; i < 3; i += 1) {
    await h.taste('ArrowRight');
    await h.warte(150);
  }
  await h.erwarte('[data-pruef="ebene-4"] [data-pruef="zitat"]');
  await stand('b3-ebene4');

  /* ------------------------------------------------------ Theorie · Kapitel 1 -- */
  await h.klick('.marke-knopf');
  await h.erwarte('[data-pruef="weg-theorie"]');
  const tuer = await text('[data-pruef="weg-story"]');
  if (!tuer.toLowerCase().includes('weiterlesen')) h.befund('Startseite: Story-Weg bietet nach dem Lesen kein „Weiterlesen“');
  await h.klick('[data-pruef="weg-theorie"]');
  await h.erwarte('[data-pruef="kapitel-liste"]');
  const kapitel = await seite.locator('[data-pruef="kapitel-liste"] > li').count();
  if (kapitel !== 13) h.befund(`Theorie: erwartet 13 Kapitel, gefunden ${kapitel}`);
  if ((await seite.locator('[data-pruef="kapitel-liste"] .badge.ist-folgt').count()) !== 12) h.befund('Theorie: unfertige Kapitel nicht als „folgt“ markiert');
  await stand('theorie-liste');
  await h.klick('[data-pruef="kapitel-1"]');
  await h.erwarte('[data-pruef="originaltext"]');
  await h.erwarte('[data-pruef="kernaussage"]');
  if ((await seite.locator('[data-pruef="lernkarte"]').count()) < 5) h.befund('Kapitel 1: weniger als fünf Karten');
  if ((await seite.locator('[data-pruef="originaltext"] [data-absatz="k1-p1"]').count()) !== 1) h.befund('Kapitel 1: Absatz k1-p1 fehlt im Originaltext');
  await h.erwarte('[data-pruef="querverweis-A3"]');
  await h.erwarte('[data-pruef="querverweis-B3"]');
  await h.erwarteNicht('[data-pruef="leitstand"]');
  await stand('theorie-k1');

  /* --------------------------------------------------------- Regie + Leinwand -- */
  const regie = await h.zweitesFenster('#regie');
  await h.erwarte('[data-pruef="regie"]', regie);
  await h.erwarte('[data-pruef="regie-notiz"]', regie);
  const [leinwand] = await Promise.all([
    regie.waitForEvent('popup', { timeout: 5000 }),
    h.klick('[data-pruef="leinwand-oeffnen"]', regie),
  ]);
  await leinwand.waitForLoadState('load');
  await h.erwarte('[data-pruef="leinwand"]', leinwand);
  try {
    await regie.locator('[data-pruef="leinwand-status"][data-status="ok"]').waitFor({ timeout: 5000 });
  } catch {
    h.befund('Regie zeigt nicht „Leinwand verbunden“');
  }
  // Regie „weiter“ startet die Story; die Leinwand folgt Schritt für Schritt.
  await h.klick('[data-pruef="regie-weiter"]', regie);
  await h.erwarte('[data-pruef="leitstand"]', leinwand);
  const kicker1 = await text('.tafel-kicker', leinwand);
  await h.klick('[data-pruef="regie-weiter"]', regie);
  await h.erwarte('[data-pruef="rolle-pl"]', leinwand);
  const kicker2 = await text('.tafel-kicker', leinwand);
  if (kicker1 === kicker2) h.befund(`Leinwand folgt der Regie nicht („${kicker1}“)`);
  await h.klick('[data-pruef="regie-rolle-pl"]', regie);
  await h.klick('[data-pruef="regie-weiter"]', regie);
  await h.klick('[data-pruef="regie-weiter"]', regie);
  await h.erwarte('.mail', leinwand);
  const notiz = await text('[data-pruef="regie-notiz"]', regie);
  if (!notiz.includes(klartext(inhalte.regie['A3/pl'].notiz).slice(0, 30))) h.befund('Regie-Notiz zu A3 fehlt in der Regie');
  if ((await leinwand.locator('[data-pruef="regie-notiz"]').count()) !== 0) h.befund('Leinwand enthält [data-pruef="regie-notiz"]');
  const leinwandText = await leinwand.locator('body').innerText();
  if (leinwandText.includes(klartext(inhalte.regie['A3/pl'].notiz).slice(0, 30))) h.befund('Leinwand zeigt Text der Regie-Notiz');
  for (const f of inhalte.regie['A3/pl'].leitfragen) if (leinwandText.includes(f)) h.befund('Leinwand zeigt eine Leitfrage');
  if ((await leinwand.locator('[data-pruef="weiter"]:not([disabled])').count()) > 0) {
    const bedienbar = await leinwand.evaluate(() => !document.querySelector('[data-pruef="leitstand"]')?.closest('[inert]'));
    if (bedienbar) h.befund('Leinwand ist bedienbar (kein inert)');
  }
  await stand('regie', regie, 2500);
  await stand('leinwand', leinwand, 0);

  // Aufräumen: Nebenfenster schließen, Hauptfenster nach vorn (Chromium zeichnet Hintergrund-Tabs
  // gedrosselt – das Schlussbild des Werkzeugs wartete sonst auf einen Frame).
  await leinwand.close();
  await regie.close();
  await seite.bringToFront();
}
