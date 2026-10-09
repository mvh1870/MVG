// Browser-Szenario Explore (P16.8, O-46; P18.3/P18.4, O-59; Register-Zusammenspiel 2026-10-09): zehn Werkzeuge am Schulcampus – Rechner dreht die Rangfolge,
// Matrix ordnet ein, Vorgänge führen weiter, Takt, Glossar; dazu Vorlagen-Check, Wegweiser, Risiko-Bewerter und
// Monatsbericht mit Tastatur, Rückmeldung, axe und Druck auf genau einer Seite (PDF-Probe, D im Höchstfall).
import { pruefer, sichtbarVerboten } from './hilfen.mjs';
import { pdfSeiten } from './pdf.mjs';

export const name = 'explore';
export const hash = '#explore';

/** Läuft im Browser: Rechteck des Beispiel-Punkts gegen das Rechteck des Zahlentexts (Range) je Zelle. */
function punktUeberZahl() {
  const funde = [];
  const zellen = [...document.querySelectorAll('.ex-zelle')].filter((z) => z.querySelector('.ex-zelle-punkt') !== null);
  if (zellen.length === 0) funde.push('keine Zelle mit Beispiel-Punkt gefunden');
  for (const z of zellen) {
    const punkt = z.querySelector('.ex-zelle-punkt')?.getBoundingClientRect();
    const zahl = [...z.children].find((k) => !k.classList.contains('ex-zelle-punkt'));
    if (punkt === undefined || zahl === undefined) continue;
    const rg = document.createRange();
    rg.selectNodeContents(zahl);
    for (const q of rg.getClientRects()) {
      const x = Math.min(punkt.right, q.right) - Math.max(punkt.left, q.left);
      const y = Math.min(punkt.bottom, q.bottom) - Math.max(punkt.top, q.top);
      if (x > 0 && y > 0) funde.push(`Beispiel-Punkt überdeckt die Zahl ${(zahl.textContent ?? '').trim()} (${x.toFixed(1)} × ${y.toFixed(1)} px)`);
    }
  }
  return funde;
}

/** Läuft im Browser: sichtbare Textfelder, deren Inhalt abgeschnitten wird (R77: vorbelegte Sätze in einzeiligen Feldern). */
function abgeschnitteneFelder() {
  const funde = [];
  for (const f of document.querySelectorAll('input[type="text"], textarea')) {
    if (!(f instanceof HTMLInputElement || f instanceof HTMLTextAreaElement) || !f.checkVisibility()) continue;
    const zu = f instanceof HTMLTextAreaElement ? f.scrollHeight > f.clientHeight + 1 : f.scrollWidth > f.clientWidth + 1;
    if (zu) funde.push(`${f.getAttribute('data-pruef') ?? f.name}: „${f.value.slice(0, 30)}“`);
  }
  return funde;
}

/** Läuft im Browser: ragt etwas aus dem Bericht heraus (lange Wörter, R77)? */
function ausDemBericht() {
  const b = document.querySelector('[data-pruef="mb-bericht"]');
  if (b === null) return ['Bericht fehlt'];
  const r = b.getBoundingClientRect();
  const funde = [];
  if (b.scrollWidth > b.clientWidth + 1) funde.push(`Bericht läuft über (${b.scrollWidth} > ${b.clientWidth})`);
  for (const el of b.querySelectorAll('*')) {
    const q = el.getBoundingClientRect();
    if (q.width > 0 && q.right > r.right + 1) funde.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ragt ${Math.round(q.right - r.right)} px heraus`);
  }
  return funde.slice(0, 5);
}

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const pruefe = pruefer(seite, h);
  // O-63: der Tab-Titel nennt den Bereich als „Werkzeuge“, nie den alten Namen
  { const t = await seite.title(); if (!t.includes('Werkzeuge') || /\b(?:Story|Theorie|Explore)\b/u.test(t)) h.befund(`Tab-Titel „${t}“ statt mit „Werkzeuge“ (O-63)`); }
  const verboten = async (wo) => { for (const f of sichtbarVerboten(await seite.locator('body').innerText())) h.befund(`${wo}: ${f}`); };
  await h.erwarte('[data-werkzeug="mcda"]');
  // Beispiel ist der Vergleich der Story (Lüftung): mit Geld 5 und Schulstart 3 liegt „Später einziehen“ vorn (C 51)
  await seite.locator('select[aria-label="Gewicht Geld"]').selectOption('5');
  await seite.locator('select[aria-label="Gewicht Schulstart"]').selectOption('3');
  await h.warte(100);
  if (!(await seite.locator('[data-pruef="ex-summe-C"]').evaluate((e) => e.classList.contains('ist-vorn')))) h.befund('Rechner: mit Geld 5, Schulstart 3 liegt „Später einziehen“ nicht vorn');
  await verboten('mcda');
  await pruefe('mcda');
  await h.klick('[data-pruef="ex-matrix"]');
  await h.erwarte('[data-werkzeug="matrix"]');
  await h.klick('.ex-zelle[data-w="1"][data-a="5"]');
  await h.erwarte('[data-pruef="ex-matrix-detail"]:has-text("Vorrangig")');
  await pruefe('matrix');
  // R67: der Beispiel-Punkt überdeckt nie die Zahl der Zelle – in der Laufgröße und schmal (400, 380, 320 px)
  const vp = seite.viewportSize();
  for (const breite of vp !== null && vp.width <= 400 ? [vp.width, 380, 320] : [vp?.width ?? 0]) {
    if (vp !== null && breite !== vp.width) { await seite.setViewportSize({ width: breite, height: vp.height }); await h.warte(150); }
    for (const fund of await seite.evaluate(punktUeberZahl)) h.befund(`matrix @${breite}: ${fund}`);
  }
  if (vp !== null) { await seite.setViewportSize(vp); await h.warte(100); }
  // O-57, P17.7: Kacheln mit Gegenstand im Ton des Werkzeugs; bei 320 px läuft nichts quer
  const kacheln = await seite.locator('.ex-werkzeug-link .ex-kachel-bild svg').filter({ visible: true }).count();
  if (kacheln !== 10) h.befund(`Werkzeugleiste: erwartet zehn Gegenstände, gefunden ${kacheln}`);
  if (vp !== null && vp.width <= 400) {
    await seite.setViewportSize({ width: 320, height: vp.height });
    await h.warte(150);
    const quer = await seite.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (quer > 0) h.befund(`matrix @320: Seite ${quer} px breiter als das Fenster`);
    await seite.setViewportSize(vp);
    await h.warte(100);
  }
  await h.klick('[data-pruef="ex-vorgaenge"]');
  await h.klick('[data-pruef="ex-art-problem"]');
  await h.klick('.ex-weg[data-ziel="aenderung"]');
  await h.erwarte('.ex-art[data-art="aenderung"][aria-pressed="true"]');
  await pruefe('vorgaenge');
  await h.klick('[data-pruef="ex-takt"]');
  await h.erwarte('[data-pruef="ex-takt-monat"]');
  await verboten('takt');
  await pruefe('takt');
  await h.klick('[data-pruef="ex-glossar"]');
  await h.erwarte('[data-pruef="glossar-suche"]');
  await pruefe('glossar');
  await neueWerkzeuge(seite, h, pruefe, verboten);
  await registerZusammenspiel(seite, h, pruefe, verboten);
  // P18.5 (E-13): die Adresse #explore/<werkzeug>/<beispiel> öffnet das Werkzeug mit dem Beispiel (so verlinken Story und Themen)
  for (const [werkzeug, beispiel, auswahl] of [['vorlagen-check', 'lueftung-voll', 'vc-beispiel'], ['wegweiser', 'geruest', 'ww-beispiel'], ['risiko-grenzen', 'ris-014', 'rg-beispiel']]) {
    await seite.goto(h.url.replace(/#.*$/u, '') + `#explore/${werkzeug}/${beispiel}`);
    await h.erwarte(`[data-werkzeug="${werkzeug}"]`);
    const gewaehlt = await seite.locator(`[data-pruef="${auswahl}"]`).inputValue();
    if (gewaehlt !== beispiel) h.befund(`#explore/${werkzeug}/${beispiel}: geöffnet mit „${gewaehlt}“`);
  }
}

/**
 * Druck über den Knopf: der Bogen enthält kein Bedienelement, das echte PDF hat genau eine Seite (O-59 (2)).
 * Nur im breiten Lauf (das PDF hängt nicht von der Fenstergröße ab).
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} werkzeug
 * @param {string} name
 */
async function druckEineSeite(seite, h, werkzeug, name) {
  if ((seite.viewportSize()?.width ?? 0) < 1280) return;
  const pdf = await druckSeiten(seite, h, werkzeug, name);
  if (pdf.length !== 1) h.befund(`Druck ${name}: ${pdf.length} Seiten statt einer`);
}

/**
 * Druckbogen eines Werkzeugs als PDF-Seiten (mit den gemeinsamen Prüfungen: keine Bedienelemente, keine Hinweise, keine
 * verbotenen Wörter im Text).
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {string} werkzeug
 * @param {string} name
 */
async function druckSeiten(seite, h, werkzeug, name) {
  await seite.evaluate(() => { window.print = () => {}; });
  await h.klick(`[data-pruef="${werkzeug}-drucken"]`);
  await seite.emulateMedia({ media: 'print' });
  const bedien = await seite.evaluate(() => [...document.querySelectorAll('.druck-bogen :is(button, select, input, textarea, a[href])')].length);
  if (bedien > 0) h.befund(`Druck ${name}: ${bedien} Bedienelemente im Bogen`);
  const hinweise = await seite.evaluate(() => document.querySelectorAll('.druck-bogen [data-pruef="mb-hinweise"], .druck-bogen .wz-schritte').length);
  if (hinweise > 0) h.befund(`Druck ${name}: Hinweise oder Schritte im Bogen`);
  // R78: nummerierte Listen im Bogen tragen im Druck ihre Ziffern (ol[class] setzt sonst list-style: none)
  const ohneZiffern = await seite.evaluate(() => [...document.querySelectorAll('.druck-bogen ol')].filter((o) => getComputedStyle(o).listStyleType === 'none').map((o) => o.className));
  if (ohneZiffern.length > 0) h.befund(`Druck ${name}: nummerierte Liste ohne Ziffern ${JSON.stringify(ohneZiffern)}`);
  const pdf = await pdfSeiten(await seite.pdf({ format: 'A4' }));
  await seite.emulateMedia({ media: null });
  for (const f of sichtbarVerboten(pdf.flatMap((x) => x.zeilen).join('\n'))) h.befund(`Druck ${name}: ${f}`);
  return pdf;
}

/**
 * Die vier neuen Werkzeuge (P18.3/P18.4): Bedienung mit Tastatur und Maus, Rückmeldung, axe, schmal 320 px, Druck.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {(name: string) => Promise<void>} pruefe
 * @param {(wo: string) => Promise<void>} verboten
 */
async function neueWerkzeuge(seite, h, pruefe, verboten) {
  const wert = (sel, attr) => seite.locator(sel).first().getAttribute(attr);
  // A · Vorlagen-Check: startet rot; Tastatur durch die Antworten; „Lüftungsanlage – alle drei Wege“ ist grün
  await h.klick('[data-pruef="ex-vorlagen-check"]');
  await h.erwarte('[data-werkzeug="vorlagen-check"]');
  if (await wert('[data-pruef="vc-ampel"]', 'data-ampel') !== 'rot') h.befund('Vorlagen-Check: Startbeispiel nicht rot');
  await seite.locator('[data-pruef="vc-a4-nein"]').focus();
  await seite.keyboard.press('ArrowLeft');
  await h.warte(100);
  if (!(await seite.locator('[data-pruef="vc-a4-teilweise"]').isChecked())) h.befund('Vorlagen-Check: Pfeiltaste wählt die Nachbarantwort nicht');
  if (!(await seite.evaluate(() => document.activeElement?.getAttribute('data-pruef') === 'vc-a4-teilweise'))) h.befund('Vorlagen-Check: Fokus nach der Antwort verloren');
  for (const f of await seite.evaluate(abgeschnitteneFelder)) h.befund(`Vorlagen-Check: Feld abgeschnitten ${f}`);
  await h.klick('[data-pruef="vc-weiter"]');
  await h.erwarte('[data-pruef="vc-wege"]');
  for (const f of await seite.evaluate(abgeschnitteneFelder)) h.befund(`Vorlagen-Check, Wege: Feld abgeschnitten ${f}`);
  await verboten('vorlagen-check');
  await pruefe('vorlagen-check');
  await druckEineSeite(seite, h, 'vorlagen-check', 'Vorlagen-Check rot');
  if ((seite.viewportSize()?.width ?? 0) >= 1280) {
    // Höchstfall: jede Antwort „Teilweise“, falsch genannte Stelle, Wege in allen Zuständen, dringlich – alle Sätze auf einer Seite
    await seite.locator('[data-pruef="vc-schritt-1"]').click();
    await seite.locator('[data-pruef="vc-titel"]').fill('Vorlage mit einem sehr langen Titel '.repeat(3).slice(0, 80));
    await seite.locator('[data-pruef="vc-stelle"]').selectOption('sie');
    await seite.locator('[data-pruef="vc-dringlich-ja"]').check();
    for (let i = 1; i <= 5; i++) {
      await seite.locator(`[data-pruef="vc-schritt-${i}"]`).click();
      for (const r of await seite.locator('[data-pruef="vc-form"] input[type=radio][value=teilweise]').all()) await r.check();
      if (i === 2) {
        for (const z of ['unzulaessig', 'schein', 'offen']) {
          await seite.locator('[data-pruef="vc-weg-hinzu"]').click();
          await seite.locator(`[data-pruef="vc-weg-zustand-${(await seite.locator('.wz-weg').count()) - 1}"]`).selectOption(z);
        }
      }
    }
    await druckEineSeite(seite, h, 'vorlagen-check', 'Vorlagen-Check Höchstfall');
  }
  await seite.locator('[data-pruef="vc-beispiel"]').selectOption('lueftung-voll');
  await h.erwarte('[data-pruef="vc-ampel"][data-ampel="gruen"]');
  await pruefe('vorlagen-check-gruen');
  // B · Wegweiser: Frühwarnung; „Ja“ bei „könnte eintreten“ macht ein Risiko, die Entscheidungsfrage folgt
  await h.klick('[data-pruef="ex-wegweiser"]');
  await h.erwarte('[data-pruef="ww-art"]:has-text("Frühwarnung")');
  await h.klick('[data-pruef="ww-moeglich-ja"]');
  await h.erwarte('[data-pruef="ww-art"]:has-text("Risiko")');
  await h.klick('[data-pruef="ww-entscheidung-nein"]');
  await h.erwarte('[data-pruef="ww-zum-risiko"]');
  await verboten('wegweiser');
  await pruefe('wegweiser');
  await druckEineSeite(seite, h, 'wegweiser', 'Wegweiser');
  await seite.locator('[data-pruef="ww-beispiel"]').selectOption('geruest');
  await h.erwarte('[data-pruef="ww-kasten-sofort"]');
  await pruefe('wegweiser-sofort');
  // C · Risiko-Bewerter: 71 Tage und „sehr gering“ → vorrangig wegen Auswirkung 5
  await h.klick('[data-pruef="ex-risiko-grenzen"]');
  await h.erwarte('[data-pruef="rg-zustand"][data-zustand="vorlaeufig"]');
  await h.klick('[data-pruef="rg-annahme-t71"]');
  await h.klick('[data-pruef="rg-annahme-w1"]');
  await h.erwarte('[data-pruef="rg-a5"]');
  if (await wert('[data-pruef="rg-prioritaet"]', 'data-stufe') !== 'vorrangig') h.befund('Risiko-Bewerter: 1 × 5 nicht vorrangig');
  for (const f of await seite.evaluate(abgeschnitteneFelder)) h.befund(`Risiko-Bewerter: Feld abgeschnitten ${f}`);
  await seite.locator('[data-pruef="rg-grenzen"] summary').click();
  await verboten('risiko-grenzen');
  await pruefe('risiko-grenzen');
  await druckEineSeite(seite, h, 'risiko-grenzen', 'Risiko-Bewerter');
  // D · Monatsbericht: grün; Kosten-Ampel ohne Frage → gelb; Höchstfall passt auf eine Seite
  await h.klick('[data-pruef="ex-monatsbericht"]');
  await h.erwarte('[data-pruef="mb-ampel"][data-ampel="gruen"]');
  await seite.locator('[data-pruef="mb-gehoert-kosten"]').selectOption('nichts');
  await h.erwarte('[data-pruef="mb-hinweis-ampelOhneFrage"]');
  if (await wert('[data-pruef="mb-ampel"]', 'data-ampel') !== 'gelb') h.befund('Monatsbericht: Ampel ohne Frage nicht gelb');
  await verboten('monatsbericht');
  // R77: vorbelegte Sätze stehen vollständig in den Feldern; lange Wörter laufen nicht aus dem Bericht
  for (const f of await seite.evaluate(abgeschnitteneFelder)) h.befund(`Monatsbericht: Feld abgeschnitten ${f}`);
  const langesWort = 'Wasserschadensbeseitigungskoordinationsunterlagen';
  await seite.locator('[data-pruef="mb-lage"]').fill(langesWort);
  await seite.locator('[data-pruef="mb-satz-kosten"]').fill(langesWort);
  await seite.locator('[data-pruef="mb-monat"]').fill(langesWort.slice(0, 40));
  await h.warte(100);
  for (const f of await seite.evaluate(ausDemBericht)) h.befund(`Monatsbericht, langes Wort: ${f}`);
  await seite.locator('[data-pruef="mb-beispiel"]').selectOption('oktober').catch(() => undefined);
  await h.warte(100);
  await pruefe('monatsbericht');
  await druckEineSeite(seite, h, 'monatsbericht', 'Monatsbericht Oktober');
  if ((seite.viewportSize()?.width ?? 0) >= 1280) {
    await hoechstfall(seite);
    if (await wert('[data-pruef="mb-seitenmesser"]', 'data-passt') !== 'ja') h.befund('Monatsbericht: Höchstfall passt laut Seitenmesser nicht auf eine Seite');
    await druckEineSeite(seite, h, 'monatsbericht', 'Monatsbericht Höchstfall');
    // R78: Seitenmesser und PDF dürfen sich nicht widersprechen – auch nicht bei Text aus den breitesten Buchstaben (M, W) und aus
    // Großschrift: sagt der Messer „passt“, hat das PDF eine Seite; sagt er „passt nicht“, darf das PDF auch mehrere haben
    // R79: auch mit gewähltem Beispiel (die Projektzeile steht dann im Druck) darf der Messer nicht „passt“ sagen, wenn das PDF zwei Seiten hat
    await hoechstfall(seite, 'Langer Eintrag mit vielen Wörtern ', true);
    {
      const passt = await wert('[data-pruef="mb-seitenmesser"]', 'data-passt') === 'ja';
      const seiten = (await druckSeiten(seite, h, 'monatsbericht', 'Monatsbericht Höchstfall mit Beispiel')).length;
      if (passt && seiten !== 1) h.befund(`Monatsbericht: Höchstfall mit gewähltem Beispiel: Seitenmesser sagt „passt“, das PDF hat ${seiten} Seiten`);
    }
    for (const [art, text] of [['M und W', 'WMWMWMWMWMWMWM'], ['M und W mit Leerzeichen', 'MMMMMMM WWWWWWW '], ['Großschrift', 'KOSTEN STEIGEN WEGEN LANGER LIEFERZEITEN '],
      ['m und w klein', 'mm ww mm ww '], ['mmmmmmm wwwwwww', 'mmmmmmm wwwwwww '], ['langem Wort ohne Leerzeichen', 'Wasserschadensbeseitigungskoordinationsunterlagen'], ['Blockzeichen', '████████ ']]) {
      await hoechstfall(seite, text);
      const passt = await wert('[data-pruef="mb-seitenmesser"]', 'data-passt') === 'ja';
      const seiten = (await druckSeiten(seite, h, 'monatsbericht', `Monatsbericht Höchstfall ${art}`)).length;
      if (passt && seiten !== 1) h.befund(`Monatsbericht: Höchstfall aus ${art}: Seitenmesser sagt „passt“, das PDF hat ${seiten} Seiten`);
      if (art === 'Großschrift' && !passt) h.befund('Monatsbericht: Höchstfall aus Großschrift soll laut Seitenmesser noch auf eine Seite passen');
    }
  }
}

/**
 * Monatsbericht im Höchstfall: jedes Feld bis zur Feldgrenze, jeder Abschnitt mit der Höchstzahl an Einträgen; `fuellwort` ist
 * der Text, aus dem die Felder bestehen (Vorgabe: gemischter Text); `mitBeispiel` wählt das Beispiel „Oktober“ und füllt nur Kopf, Lage, Ampeln und Reaktion.
 * @param {import('playwright').Page} seite
 */
async function hoechstfall(seite, fuellwort = 'Langer Eintrag mit vielen Wörtern ', mitBeispiel = false) {
  const voll = (n) => fuellwort.repeat(Math.ceil(300 / fuellwort.length)).slice(0, n);
  const fuelle = async (pruef, n) => {
    const l = seite.locator(`[data-pruef="${pruef}"]`);
    await l.fill(voll(Number(await l.getAttribute('maxlength') ?? n)));
  };
  await seite.locator('[data-pruef="mb-beispiel"]').selectOption(mitBeispiel ? 'oktober' : '');
  for (const p of ['mb-monat', 'mb-datenstand', 'mb-lage', 'mb-reaktion']) await fuelle(p, 0);
  for (const a of ['kosten', 'termine', 'qualitaet']) {
    await seite.locator(`[data-pruef="mb-farbe-${a}-gelb"]`).check();
    await fuelle(`mb-satz-${a}`, 0);
    await seite.locator(`[data-pruef="mb-gehoert-${a}"]`).selectOption('reaktion');
    await fuelle(`mb-reaktion-${a}`, 0);
  }
  if (mitBeispiel) return; // mit Beispiel bleiben dessen Einträge stehen; es zählt die Projektzeile im Druck (R79)
  for (const [id, n] of [['veraenderungen', 4], ['blockiert', 3], ['massnahmen', 3], ['fruehwarnungen', 3], ['probleme', 4]]) {
    await seite.locator(`[data-abschnitt="${id}"] > summary`).click();
    await seite.locator(`[data-pruef="mb-${id}-keine"]`).uncheck();
    for (let i = 0; i < n; i++) {
      await seite.locator(`[data-pruef="mb-${id}-hinzu"]`).click();
      await fuelle(`mb-${id}-text-${i}`, 0);
      await fuelle(`mb-${id}-kennung-${i}`, 0);
    }
  }
  await seite.locator('[data-abschnitt="entscheidungen"] > summary').click();
  await seite.locator('[data-pruef="mb-entscheidungen-keine"]').uncheck();
  for (let i = 0; i < 3; i++) {
    await seite.locator('[data-pruef="mb-e-hinzu"]').click();
    for (const k of ['frage', 'stelle', 'bis', 'kennung']) await fuelle(`mb-e-${k}-${i}`, 0);
  }
}


/** Läuft im Browser: ragt eine Beschriftung der Grafik aus ihrer Kachel oder ihrem Streifen, oder überdeckt der Untertitel den Streifen? */
function registerGrafikMasse() {
  const funde = [];
  const rand = 5;
  for (const k of document.querySelectorAll('.rz-kachel:not(.rz-banner)')) {
    const ort = k.getAttribute('data-ort') ?? '?';
    const box = k.querySelector('.rz-box')?.getBBox();
    const streifen = k.querySelector('.rz-streifen-flaeche')?.getBBox();
    if (box === undefined || streifen === undefined) { funde.push(`${ort}: Kachel unvollständig`); continue; }
    for (const t of k.querySelectorAll('.rz-titel, .rz-unter')) {
      const b = t.getBBox();
      if (b.x < box.x + rand || b.x + b.width > box.x + box.width - rand) funde.push(`${ort}: „${(t.textContent ?? '').trim().slice(0, 24)}“ ragt seitlich aus der Kachel (${Math.round(b.x + b.width - box.x - box.width)} px)`);
      if (b.y + b.height > streifen.y - 1) funde.push(`${ort}: „${(t.textContent ?? '').trim().slice(0, 24)}“ überdeckt den Streifen`);
    }
    const st = k.querySelector('.rz-streifen-text')?.getBBox();
    if (st !== undefined && (st.x < streifen.x + 3 || st.x + st.width > streifen.x + streifen.width - 3)) funde.push(`${ort}: Streifentext „${(k.querySelector('.rz-streifen-text')?.textContent ?? '').slice(0, 26)}“ ragt aus dem Streifen (${Math.round(st.x + st.width - streifen.x - streifen.width)} px)`);
  }
  for (const p of document.querySelectorAll('.rz-pfeil')) {
    const pille = p.querySelector('.rz-pille')?.getBBox();
    const t = p.querySelector('.rz-pille-text')?.getBBox();
    if (pille !== undefined && t !== undefined && (t.x < pille.x + 3 || t.x + t.width > pille.x + pille.width - 3)) funde.push(`Pfeil ${p.getAttribute('data-kante')}: Text ragt aus der Pille`);
  }
  const banner = document.querySelector('.rz-banner');
  const bb = banner?.querySelector('.rz-box')?.getBBox();
  const bt = banner?.querySelector('.rz-banner-text')?.getBBox();
  if (bb !== undefined && bt !== undefined && bt.x + bt.width > bb.x + bb.width - 8) funde.push('Hinweiskasten: Text ragt heraus');
  return funde;
}

/**
 * Register-Zusammenspiel: alle vier Ansichten, alle fünf Fragen, Beschriftungen bleiben in ihren Kacheln, die Seite läuft nicht quer
 * (nur die Grafik rollt), axe in jeder Ansicht.
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 * @param {(wo: string) => Promise<void>} pruefe
 * @param {(wo: string) => Promise<void>} verboten
 */
async function registerZusammenspiel(seite, h, pruefe, verboten) {
  await h.klick('[data-pruef="ex-register"]');
  await h.erwarte('[data-werkzeug="register"] [data-pruef="register-grafik"]');
  await verboten('register');
  await pruefe('register');
  // Beschriftungen in jeder Frage (der Streifen wechselt den Text) innerhalb ihrer Kacheln
  for (const e of ['wer', 'wann', 'schwelle', 'ergebnis', 'stoerung']) {
    await h.klick(`[data-pruef="register-ebene-${e}"]`);
    await h.warte(60);
    for (const fund of await seite.evaluate(registerGrafikMasse)) h.befund(`register ${e}: ${fund}`);
  }
  await h.klick('[data-pruef="register-ebene-wer"]');
  // Zuschauen: ein Schritt, der Pfeil ist markiert; Starten und Anhalten
  await h.klick('[data-pruef="register-vor"]');
  await h.erwarte('.rz-pfeil.ist-aktiv');
  await h.klick('[data-pruef="register-start"]');
  await h.warte(120);
  await h.klick('[data-pruef="register-start"]');
  // Ausfall: Fall bleibt stehen, die Folge wird genannt
  await h.klick('[data-pruef="register-neu"]');
  await h.klick('[data-pruef="register-ebene-stoerung"]');
  await h.klick('[data-pruef="rz-kachel-vorlage"]');
  await h.klick('[data-pruef="register-vor"]');
  await h.klick('[data-pruef="register-vor"]');
  await h.erwarte('[data-pruef="register-blockade"]');
  await pruefe('register-stoerung');
  for (const fund of await seite.evaluate(registerGrafikMasse)) h.befund(`register Ausfall: ${fund}`);
  await h.klick('[data-pruef="register-ebene-wer"]');
  // Geschichte und Durchprobieren
  await h.klick('[data-pruef="register-modus-geschichte"]');
  await h.klick('[data-pruef="register-vor"]');
  await h.erwarte('[data-pruef="register-schritt"] .rz-schritt-titel');
  await verboten('register geschichte');
  await pruefe('register-geschichte');
  await h.klick('[data-pruef="register-modus-probieren"]');
  await h.erwarte('[data-pruef="register-probe"] input[type="radio"]');
  await seite.locator('input[name="register-weiter"]').first().check();
  await h.erwarte('[data-pruef="register-rueckmeldung"]');
  await verboten('register probieren');
  await pruefe('register-probieren');
  // Erkunden: Station wählen
  await h.klick('[data-pruef="register-modus-erkunden"]');
  await seite.locator('[data-pruef="rz-kachel-freigabe"]').click();
  await h.erwarte('[data-pruef="register-station"]');
  await verboten('register erkunden');
  await pruefe('register-erkunden');
  // die Seite läuft nicht quer: nur die Grafik rollt
  const quer = await seite.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (quer > 0) h.befund(`register: Seite ${quer} px breiter als das Fenster`);
}
