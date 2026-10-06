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
  // O-63: die Sprünge der Regie heißen Start · Geschichte · Themen · Werkzeuge
  const chips = await seite.locator('[data-pruef^="regie-bereich-"]').evaluateAll((l) => l.map((e) => (e.textContent ?? '').trim()));
  if (chips.join(' · ') !== 'Start · Geschichte · Themen · Werkzeuge') h.befund(`Regie: Bereiche „${chips.join(' · ')}“ statt „Start · Geschichte · Themen · Werkzeuge“ (O-63)`);
  await h.klick('[data-pruef="regie-bereich-story"]');
  // P17.6: Sprung je Schritt – direkt in den Vergleich von Kapitel 7; O-65: keine Notizkarte mehr
  await seite.locator('[data-pruef="regie-sprung"]').selectOption('s12:vergleich');
  if ((await seite.locator('[data-pruef="regie-notiz"], [data-pruef="regie-leitfragen"]').count()) > 0) h.befund('Regie: Moderationsnotizen oder Leitfragen sichtbar (O-65)');
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
  if (/\b(vertretbar|Falle)\b/u.test(lwText) || (await leinwand.locator('[data-wertung], .regie-wertung').count()) > 0) h.befund('Wertung auf der Leinwand');
  // Mini-Aufgabe aus der Regie: Zuordnung setzen (Leinwand zeigt die Rückmeldung), auflösen, Reihenfolge anklicken
  await seite.locator('[data-pruef="regie-sprung"]').selectOption('s2:mini');
  await h.klick('[data-pruef="regie-mini-1-risiko"]');
  await h.erwarte('.anzeige [data-pruef="posten-1"][data-lage="falsch"]', leinwand);
  await h.klick('[data-pruef="regie-mini-aufloesen"]');
  await h.warte(200);
  const richtig = await leinwand.locator('.anzeige .gs-mini-posten[data-lage="richtig"]').count();
  const alle = await leinwand.locator('.anzeige .gs-mini-posten').count();
  if (alle === 0 || richtig !== alle) h.befund(`Mini-Aufgabe aufgelöst: ${richtig} von ${alle} richtig auf der Leinwand`);
  await seite.locator('[data-pruef="regie-sprung"]').selectOption('s10:mini');
  await h.klick('[data-pruef="regie-reihe-2"]');
  await h.erwarte('.anzeige [data-pruef="posten-2"] .gs-reihe-nr:has-text("1")', leinwand);
  if ((await leinwand.locator('.anzeige button, .anzeige a[href]').count()) > 0) h.befund('Bedienelemente auf der Leinwand');
  // P19.7: Sprung je Akt, Pause, neue Mini-Arten, Entscheidungsbuch – die Leinwand folgt, ohne Bedienelement und ohne Regie-Material
  await h.klick('[data-pruef="regie-akt-a2"]');
  await h.erwarte('.anzeige [data-pruef="akt-kopf-a2"]', leinwand);
  if ((await leinwand.locator('.anzeige [data-pruef="gs-titel"]:has-text("Der Elternabend")').count()) !== 1) h.befund('Leinwand: Sprung zu Akt II führt nicht zu Station 6');
  await h.klick('[data-pruef="regie-pause-a1"]');
  await h.erwarte('.anzeige [data-pruef="gs-verlauf"]', leinwand);
  await h.axe('regie-pause');
  await h.axe('leinwand-pause', leinwand);
  for (const [station, art] of [['s4', 'matrix'], ['s7', 'mappe'], ['s8', 'pinnwand'], ['s9', 'bericht'], ['s11', 'rueckfragen']]) {
    await seite.locator('[data-pruef="regie-sprung"]').selectOption(`${station}:mini`);
    await h.erwarte(`.anzeige [data-pruef="mini-${art}"]`, leinwand);
    if ((await leinwand.locator('.anzeige button, .anzeige a[href], .anzeige input, .anzeige select, .anzeige textarea').count()) > 0) h.befund(`Bedienelemente auf der Leinwand bei der Mini-Aufgabe von ${station} (${art})`);
  }
  await h.klick('[data-pruef="regie-buch"]');
  await h.erwarte('.anzeige [data-pruef="gs-buch"]', leinwand);
  if ((await leinwand.locator('.anzeige button, .anzeige a[href]').count()) > 0 || (await leinwand.locator('.anzeige .gs-buch-neu').count()) > 0) h.befund('Leinwand: das Buch zeigt Bedienelemente oder die Markierung „neu“');
  await h.klick('[data-pruef="regie-buch"]');
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
  // R78: bei einem Explore-Werkzeug mit Eingriffen sagt die Karte „Kundenwahl und Eingriffe“ nicht, es gebe nichts zu wählen
  if (/nichts zu wählen/u.test(await seite.locator('[data-pruef="regie-eingriffe"]').innerText())) h.befund('Regie: „nichts zu wählen“ bei einem Werkzeug mit Beispielen und Schaltern');
  if ((await seite.locator('[data-pruef="regie-eingriffe-werkzeug"]').count()) !== 1) h.befund('Regie: Karte „Kundenwahl und Eingriffe“ verweist nicht auf den Kasten des Werkzeugs');
  if ((await leinwand.locator('.anzeige :is(button, select, input, textarea, a[href])').count()) > 0) h.befund('Leinwand: Eingabefelder oder Bedienelemente in den neuen Werkzeugen');
  // R77: Leinwand 1920 × 1080 – das Werkzeug zeigt nur sich selbst (ohne Einleitung und Kachelreihe), Fließtext ≥ 24 px, und
  // Schritt und Ergebnis (Ampel) liegen ohne Rollen im Fenster; mit Beamer-Schalter ebenso, ohne waagerechtes Rollen
  const lwGroesse = leinwand.viewportSize();
  await leinwand.setViewportSize({ width: 1920, height: 1080 });
  for (const beamer of [false, true]) {
    if (beamer) await h.klick('[data-pruef="regie-beamer"]');
    for (const wz of ['vorlagen-check', 'risiko-grenzen', 'monatsbericht', 'wegweiser']) {
      await seite.locator('[data-pruef="regie-werkzeug"]').selectOption(wz);
      await h.erwarte(`.anzeige [data-werkzeug="${wz}"]`, leinwand);
      if (wz === 'vorlagen-check') { await seite.locator('body').press('ArrowRight'); await seite.locator('body').press('ArrowRight'); }
      if (wz === 'wegweiser') await h.klick('[data-pruef="regie-schritt-weiter"]');
      await h.warte(400);
      const m = await leinwand.evaluate(() => {
        const sichtbar = (/** @type {string} */ sel) => {
          const el = document.querySelector(`.anzeige ${sel}`);
          if (el === null) return null;
          const r = el.getBoundingClientRect();
          return { oben: Math.round(r.top), unten: Math.round(r.bottom) };
        };
        const w = document.querySelector('.anzeige [data-werkzeug]');
        let klein = 0;
        let gesamt = 0;
        const tw = document.createTreeWalker(w ?? document.body, NodeFilter.SHOW_TEXT);
        for (let n = tw.nextNode(); n; n = tw.nextNode()) {
          const el = n.parentElement;
          const l = (n.textContent ?? '').trim().length;
          if (el === null || l === 0 || !el.checkVisibility()) continue;
          const px = parseFloat(getComputedStyle(el).fontSize) * (el.offsetWidth > 0 ? el.getBoundingClientRect().width / el.offsetWidth : 1);
          gesamt += l;
          if (px < 24) klein += l;
        }
        const display = (/** @type {string} */ sel) => { const e = document.querySelector(`.anzeige ${sel}`); return e === null ? 'fehlt' : getComputedStyle(e).display; };
        return {
          kachel: display('.ex-werkzeuge'), einleitung: display('.ex-einleitung'),
          fiktiv: [...(document.querySelector('.anzeige .seite-explore')?.innerText ?? '').matchAll(/fiktiv/giu)].length,
          schritt: sichtbar('[data-pruef="vc-schritt-titel"]'), ampel: sichtbar('.wz-ergebnis .wz-ampel'), ergebnis: sichtbar('.wz-ergebnis'),
          anteilKlein: gesamt === 0 ? 0 : klein / gesamt, breit: document.documentElement.scrollWidth - document.documentElement.clientWidth, hoehe: innerHeight,
        };
      });
      const wo = `Leinwand 1920×1080${beamer ? ' (Beamer)' : ''}, ${wz}`;
      if (m.kachel !== 'none' || m.einleitung !== 'none') h.befund(`${wo}: Kachelreihe oder Einleitung des Explore-Bereichs sichtbar`);
      if (m.fiktiv !== 1) h.befund(`${wo}: „fiktiv“ steht ${m.fiktiv}-mal in der Ansicht (erwartet: einmal, O-45)`);
      if (m.ergebnis === null) h.befund(`${wo}: Ergebnisfläche fehlt`);
      else if (m.ergebnis.oben < 0 || m.ergebnis.oben > m.hoehe * 0.6) h.befund(`${wo}: Ergebnis beginnt bei ${m.ergebnis.oben} px (Fenster ${m.hoehe} px)`);
      if (m.ampel !== null && (m.ampel.oben < 0 || m.ampel.unten > m.hoehe)) h.befund(`${wo}: Ampel nicht ganz im Fenster (${m.ampel.oben}–${m.ampel.unten} px)`);
      if (wz === 'vorlagen-check' && (m.schritt === null || m.schritt.oben < 0 || m.schritt.unten > m.hoehe)) h.befund(`${wo}: Prüfschritt nicht im Fenster (${JSON.stringify(m.schritt)})`);
      if (m.anteilKlein > 0.3) h.befund(`${wo}: ${Math.round(m.anteilKlein * 100)} % der Zeichen kleiner als 24 px`);
      if (m.breit > 0) h.befund(`${wo}: waagerechtes Rollen (${m.breit} px)`);
    }
    if (beamer) await h.klick('[data-pruef="regie-beamer"]');
  }
  if (lwGroesse !== null) await leinwand.setViewportSize(lwGroesse);
  await seite.locator('[data-pruef="regie-werkzeug"]').selectOption('monatsbericht');
  await h.erwarte('.anzeige [data-werkzeug="monatsbericht"]', leinwand);
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
