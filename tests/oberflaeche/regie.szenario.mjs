// Browser-Szenario Regie und Leinwand (O-9, P16.9, P17.6): die Regie steuert – Sprung je Schritt, Wahl, Gewichte,
// Mini-Aufgabe –, die Leinwand zeigt denselben Stand, ohne Regie-Notiz, Leitfragen und Wertung. Nur in der breiten
// Ansicht (die Regie ist ein Pult am Laptop).
import { pruefeLayout } from './hilfen.mjs';

export const name = 'regie';
export const hash = '#regie';
export const viewports = [{ breite: 1280, hoehe: 720 }];

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  await h.erwarte('[data-pruef="regie"]');
  const leinwand = await h.zweitesFenster('#leinwand');
  await h.erwarte('[data-pruef="leinwand-warten"], .anzeige', leinwand);
  await h.klick('[data-pruef="regie-bereich-story"]');
  // P17.6: Sprung je Schritt – direkt in den Vergleich von Kapitel 7; Notiz und Leitfragen nur in der Regie
  await seite.locator('[data-pruef="regie-sprung"]').selectOption('k7:vergleich');
  await h.erwarte('[data-pruef="regie-notiz"] .regie-notiz-text');
  await h.erwarte('[data-pruef="regie-leitfragen"]');
  await h.erwarte('.anzeige [data-pruef="gs-vgl-karten"]', leinwand);
  // Gewichte aus der Regie: die Leinwand ordnet die Karten um (C rückt vor B)
  const reihe = async () => leinwand.evaluate(() => [...document.querySelectorAll('.anzeige .gs-vgl-karte')]
    .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left).map((k) => k.getAttribute('data-option')).join(''));
  const vorher = await reihe();
  await h.klick('[data-pruef="regie-stufe-klima-3"]');
  await h.erwarte('.anzeige [data-pruef="gs-vgl-vorn"]:has-text("Gleichauf")', leinwand);
  await h.warte(200);
  const nachher = await reihe();
  if (vorher !== 'ABC' || nachher !== 'ACB') h.befund(`Leinwand ordnet die Wege nicht um (vorher ${vorher}, nachher ${nachher})`);
  await h.klick('[data-pruef="regie-abgestimmt"]');
  // Frage: Antwort aus der Regie, Wertung nur in der Regie
  await h.klick('[data-pruef="regie-teil-frage"]');
  await h.erwarte('[data-pruef="regie-wertung-1"]');
  await h.klick('[data-pruef="regie-wahl-2"]');
  await h.warte(400);
  await h.erwarte('.anzeige [data-pruef="gs-titel"]:has-text("Die große Entscheidung")', leinwand);
  const gewaehlt = await leinwand.locator('.anzeige .gs-antwort[data-platz="1"][aria-pressed="true"]').count();
  if (gewaehlt !== 1) h.befund('Leinwand zeigt die Kundenwahl 2 nicht');
  if ((await leinwand.locator('.anzeige [data-pruef="gs-folge"]').count()) !== 1) h.befund('Leinwand zeigt die Folge der Wahl nicht');
  const folgeOben = await leinwand.evaluate(() => document.querySelector('.anzeige [data-pruef="gs-folge"]')?.getBoundingClientRect().top ?? -1);
  if (folgeOben < 0 || folgeOben > 300) h.befund(`Leinwand rollt nicht zur Folge (oben bei ${Math.round(folgeOben)} px)`);
  const lwText = await leinwand.locator('body').innerText();
  const notiz = (await seite.locator('[data-pruef="regie-notiz"] .regie-notiz-text').innerText()).slice(0, 40);
  if (lwText.includes(notiz)) h.befund('Regie-Notiz auf der Leinwand');
  for (const frage of await seite.locator('[data-pruef="regie-leitfragen"] li').allInnerTexts()) if (lwText.includes(frage)) h.befund(`Leitfrage auf der Leinwand: ${frage}`);
  if (/\b(vertretbar|Falle)\b/u.test(lwText) || (await leinwand.locator('[data-wertung], .regie-wertung').count()) > 0) h.befund('Wertung auf der Leinwand');
  // Mini-Aufgabe aus der Regie: Zuordnung setzen (Leinwand zeigt die Rückmeldung), auflösen, Reihenfolge anklicken
  await seite.locator('[data-pruef="regie-sprung"]').selectOption('k2:mini');
  await h.klick('[data-pruef="regie-mini-1-risiko"]');
  await h.erwarte('.anzeige [data-pruef="posten-1"][data-lage="falsch"]', leinwand);
  await h.klick('[data-pruef="regie-mini-aufloesen"]');
  await h.warte(200);
  const richtig = await leinwand.locator('.anzeige .gs-mini-posten[data-lage="richtig"]').count();
  const alle = await leinwand.locator('.anzeige .gs-mini-posten').count();
  if (alle === 0 || richtig !== alle) h.befund(`Mini-Aufgabe aufgelöst: ${richtig} von ${alle} richtig auf der Leinwand`);
  await seite.locator('[data-pruef="regie-sprung"]').selectOption('k6:mini');
  await h.klick('[data-pruef="regie-reihe-2"]');
  await h.erwarte('.anzeige [data-pruef="posten-2"] .gs-reihe-nr:has-text("1")', leinwand);
  if ((await leinwand.locator('.anzeige button, .anzeige a[href]').count()) > 0) h.befund('Bedienelemente auf der Leinwand');
  await h.erwarte('[data-pruef="leinwand-status"][data-status="ok"]');
  // Theorie und Explore auf der Leinwand
  await seite.locator('[data-pruef="regie-thema"]').selectOption('verantwortung');
  await h.erwarte('.anzeige [data-thema="verantwortung"]', leinwand);
  // R69: ein spätes Thema – der aktuelle Eintrag des Themenverzeichnisses rollt auf der Leinwand in den sichtbaren Teil
  const spaet = await seite.locator('[data-pruef="regie-thema"] option').evaluateAll((o) => o.map((x) => /** @type {HTMLOptionElement} */ (x).value).filter((v) => v !== '').at(-1) ?? '');
  // niedriges Fenster (Beamer mit wenig Höhe), damit das Verzeichnis überläuft; danach wieder die volle Größe
  const groesse = leinwand.viewportSize();
  await leinwand.setViewportSize({ width: groesse?.width ?? 1280, height: 420 });
  await seite.locator('[data-pruef="regie-thema"]').selectOption(spaet);
  await h.erwarte(`.anzeige [data-thema="${spaet}"]`, leinwand);
  await h.warte(200);
  const verzeichnis = await leinwand.evaluate(() => {
    const v = document.querySelector('.anzeige .kapitel-verzeichnis');
    const a = v?.querySelector('[aria-current="page"]');
    if (!v || !a) return 'fehlt';
    if (v.scrollHeight <= v.clientHeight + 1) return `passt (${v.scrollHeight}/${v.clientHeight}, ${v.tagName}, open=${v.hasAttribute('open')}, ${innerWidth}×${innerHeight})`;
    const vr = v.getBoundingClientRect();
    const ar = a.getBoundingClientRect();
    return ar.top >= vr.top - 1 && ar.bottom <= vr.bottom + 1 ? 'sichtbar' : `außerhalb (${Math.round(ar.top - vr.top)} px, Höhe ${Math.round(vr.height)})`;
  });
  if (groesse !== null) await leinwand.setViewportSize(groesse);
  // „passt“ ist ebenfalls ein Befund: ohne Überlauf prüfte die Probe nichts
  if (verzeichnis !== 'sichtbar') h.befund(`Leinwand: aktueller Eintrag „${spaet}“ im Themenverzeichnis: ${verzeichnis}`);
  await seite.locator('[data-pruef="regie-werkzeug"]').selectOption('matrix');
  await h.erwarte('.anzeige [data-werkzeug="matrix"]', leinwand);
  // P18.5 (E-9): die vier neuen Werkzeuge – Pfeiltasten gehen erst durch die Schritte, dann zum nächsten Werkzeug; Beispiel und Schritt
  // erreichen die Leinwand ohne Bedienelemente und ohne Regie-Text
  await seite.locator('[data-pruef="regie-werkzeug"]').selectOption('vorlagen-check');
  await h.erwarte('.anzeige [data-werkzeug="vorlagen-check"]', leinwand);
  await h.erwarte('[data-pruef="regie-werkzeug-stand"]');
  const schritt = () => seite.locator('[data-pruef="regie-schritt-stelle"]').innerText();
  if ((await schritt()) !== 'Schritt 1 von 6') h.befund(`Regie: Vorlagen-Check beginnt bei „${await schritt()}“`);
  const lwVorher = await leinwand.locator('.anzeige [data-werkzeug="vorlagen-check"]').innerText();
  await seite.locator('body').press('ArrowRight');
  await seite.locator('body').press('ArrowRight');
  if ((await schritt()) !== 'Schritt 3 von 6') h.befund(`Regie: Pfeiltaste geht nicht durch die Schritte („${await schritt()}“)`);
  await h.warte(300);
  if ((await leinwand.locator('.anzeige [data-werkzeug="vorlagen-check"]').innerText()) === lwVorher) h.befund('Leinwand zeigt den Schritt des Vorlagen-Checks nicht');
  await h.klick('[data-pruef="regie-beispiel-mensa"]');
  await h.warte(300);
  for (let i = 0; i < 5; i += 1) await seite.locator('body').press('ArrowRight');
  await h.erwarte('[data-pruef="regie-schritt-stelle"]:has-text("Ergebnis")');
  await seite.locator('body').press('ArrowRight');
  await h.erwarte('.anzeige [data-werkzeug="matrix"]', leinwand);
  await seite.locator('[data-pruef="regie-werkzeug"]').selectOption('risiko-grenzen');
  await h.klick('[data-pruef="regie-schalter-t-71"]');
  await h.klick('[data-pruef="regie-schalter-w-1"]');
  await h.erwarte('.anzeige [data-werkzeug="risiko-grenzen"]', leinwand);
  await seite.locator('[data-pruef="regie-werkzeug"]').selectOption('wegweiser');
  await h.klick('[data-pruef="regie-schritt-weiter"]');
  await h.erwarte('.anzeige [data-werkzeug="wegweiser"] .ist-beantwortet', leinwand);
  await seite.locator('[data-pruef="regie-werkzeug"]').selectOption('monatsbericht');
  await h.klick('[data-pruef="regie-schalter-w-1"]');
  await h.erwarte('.anzeige [data-werkzeug="monatsbericht"]', leinwand);
  await h.erwarte('[data-pruef="regie-notiz"] .regie-notiz-text:has-text("Kosten-Ampel")');
  const lwNeu = await leinwand.locator('body').innerText();
  for (const frage of await seite.locator('[data-pruef="regie-leitfragen"] li').allInnerTexts()) if (lwNeu.includes(frage)) h.befund(`Leitfrage des Monatsberichts auf der Leinwand: ${frage}`);
  if (lwNeu.includes((await seite.locator('[data-pruef="regie-notiz"] .regie-notiz-text').innerText()).slice(0, 40))) h.befund('Regie-Notiz des Monatsberichts auf der Leinwand');
  if ((await leinwand.locator('.anzeige :is(button, select, input, textarea, a[href])').count()) > 0) h.befund('Leinwand: Eingabefelder oder Bedienelemente in den neuen Werkzeugen');
  // R68: die Vorschau zeigt die Leinwand mit deren Schrift – axe misst sie nicht (aria-hidden); Text gegen Weiß ≥ 4,5:1
  const blass = await seite.evaluate(() => {
    const lum = (/** @type {string} */ c) => { const m = c.match(/[\d.]+/gu)?.map(Number) ?? [0, 0, 0]; const f = (/** @type {number} */ v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(m[0] ?? 0) + 0.7152 * f(m[1] ?? 0) + 0.0722 * f(m[2] ?? 0); };
    return [...document.querySelectorAll('.vorschau-buehne p, .vorschau-buehne li')].filter((el) => (el.textContent ?? '').trim() !== '')
      .filter((el) => 1.05 / (lum(getComputedStyle(el).color) + 0.05) < 4.5).length;
  });
  if (blass > 0) h.befund(`regie: ${blass} Absätze der Vorschau mit heller Schrift`);
  for (const fund of await seite.evaluate(pruefeLayout)) h.befund(`regie: ${fund}`);
  await h.axe('regie');
  await h.axe('leinwand', leinwand);
  await h.bild('regie');
  await h.bild('leinwand', leinwand);
}
