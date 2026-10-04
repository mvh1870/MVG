/*
 * Die vier neuen Explore-Werkzeuge bedienen (P18.3/P18.4, O-59; jsdom): Vorlagen-Check, Vorgangs-Wegweiser,
 * Risiko-Bewerter, Monatsbericht – Rückmeldung bei jeder Eingabe, Beispiel und „Leer beginnen“, Zuordnung des
 * Beispielprojekts nur mit Beispiel (O-46), Werkzeugstand für die Leinwand, nichts bedienbar ohne `bedienbar`,
 * sichtbare Wörter in jedem Zustand, Kleingrafiken ohne Kennungen.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sichtbarVerboten } from '../werkzeuge/sichtbar.mjs';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///index.html' });
const gl = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLDetailsElement', 'HTMLParagraphElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) gl[k] = (dom.window as unknown as Record<string, unknown>)[k];
after(() => dom.window.close());

const { inhalte } = await import('../src/inhalte/index.ts');
const { baueExplore } = await import('../src/ui/flaechen/explore.ts');
const { ampelBild, messlatteBild, miniMatrixBild, seitenmesserBild } = await import('../src/grafik/werkzeug-bilder.ts');

const NEU = ['vorlagen-check', 'wegweiser', 'risiko-grenzen', 'monatsbericht'] as const;
const zeige = (werkzeug: string, werkzeugStand?: string): HTMLElement => {
  const el = baueExplore({ inhalte, werkzeug, bedienbar: true, werkzeugStand: werkzeugStand ?? null });
  document.body.replaceChildren(el);
  return el;
};
const q = <T extends Element = HTMLElement>(el: Element, pruef: string): T => {
  const x = el.querySelector<T>(`[data-pruef="${pruef}"]`);
  assert.ok(x, `[data-pruef="${pruef}"] fehlt`);
  return x;
};
const waehle = (el: Element, pruef: string, wert: string): void => {
  const s = q<HTMLSelectElement>(el, pruef);
  s.value = wert;
  s.dispatchEvent(new Event('change'));
};
const tippe = (el: Element, pruef: string, wert: string): void => {
  const s = q<HTMLInputElement>(el, pruef);
  s.value = wert;
  s.dispatchEvent(new Event('input'));
};
const klicke = (el: Element, pruef: string): void => q(el, pruef).click();
const ampel = (el: Element, pruef: string): string | null => q(el, pruef).getAttribute('data-ampel');
const lesbar = (el: Element): string => {
  const teile: string[] = [];
  const tw = document.createTreeWalker(el, 4);
  for (let n = tw.nextNode(); n !== null; n = tw.nextNode()) teile.push(n.textContent ?? '');
  for (const x of el.querySelectorAll('[aria-label],[title],[placeholder]')) for (const a of ['aria-label', 'title', 'placeholder']) teile.push(x.getAttribute(a) ?? '');
  return teile.join('\n');
};
const funde: string[] = [];
const pruefeSichtbar = (wo: string, el: Element): void => {
  for (const f of sichtbarVerboten(lesbar(el))) funde.push(`${wo}: ${f}`);
  if (/Projektblatt/u.test(lesbar(el))) funde.push(`${wo}: „Projektblatt“ sichtbar (L-253, E-10)`);
};

test('Vorlagen-Check: rot mit dem Startbeispiel, Lücken mit Satz, Beispiele grün und gelb, „Leer beginnen“ ohne Fall-Namen', () => {
  const el = zeige('vorlagen-check');
  assert.equal(ampel(el, 'vc-ampel'), 'rot');
  assert.match(q(el, 'vc-luecke-b1').textContent ?? '', /So schließen Sie die Lücke: Fordern Sie weitere Wege an/u);
  assert.match(q(el, 'vc-luecke-a4').textContent ?? '', /fehlt – Vorlage nicht vollständig/u);
  pruefeSichtbar('vorlagen-check rot', el);
  // eine Antwort ändert die Ampel sofort nicht, solange Muss-Lücken bleiben – aber die Lücke verschwindet
  const a4 = q<HTMLInputElement>(el, 'vc-a4-ja');
  a4.checked = true;
  a4.dispatchEvent(new Event('change'));
  assert.equal(el.querySelector('[data-pruef="vc-luecke-a4"]'), null);
  waehle(el, 'vc-beispiel', 'lueftung-voll');
  assert.equal(ampel(el, 'vc-ampel'), 'gruen');
  // R79: die Schrittleiste folgt jeder Eingabe – die Projektsteuerung als Stelle nimmt Schritt 1 sofort den Haken
  const fertig1 = (): string | null => el.querySelector('.wz-schritte li, [data-fertig]')?.getAttribute('data-fertig') ?? null;
  assert.equal(fertig1(), 'ja');
  waehle(el, 'vc-stelle', 'projektsteuerung');
  assert.equal(fertig1(), 'nein');
  waehle(el, 'vc-beispiel', 'lueftung-voll');
  pruefeSichtbar('vorlagen-check grün', el);
  waehle(el, 'vc-beispiel', 'mensa');
  assert.equal(ampel(el, 'vc-ampel'), 'gelb');
  // die Projektsteuerung entscheidet nicht (A-R4)
  waehle(el, 'vc-stelle', 'projektsteuerung');
  assert.equal(ampel(el, 'vc-ampel'), 'rot');
  assert.match(q(el, 'vc-luecke-a3').textContent ?? '', /bereitet vor und empfiehlt; entscheiden darf sie nicht/u);
  // Zuordnung des Beispielprojekts: genannt „Sie“, befugt die Bürgermeisterin (mehr als 100.000 Euro) → A3 Nein
  waehle(el, 'vc-stelle', 'sie');
  assert.match(q(el, 'vc-luecke-a3').textContent ?? '', /Im Beispielprojekt entscheidet sie darüber, weil es um mehr als 100\.000 Euro geht/u);
  // ein geänderter Betrag beendet „Beispiel geladen“: die Stellen heißen neutral, die Fall-Zuordnung schweigt
  tippe(el, 'vc-betrag', '50000');
  const namen = [...q<HTMLSelectElement>(el, 'vc-stelle').options].map((o) => o.textContent);
  assert.ok(namen.includes('andere befugte Stelle des Bauherrn') && !namen.includes('Bürgermeisterin'), namen.join(', '));
  assert.equal(el.querySelector('[data-pruef="vc-luecke-a3"]'), null);
  waehle(el, 'vc-beispiel', '');
  assert.equal(ampel(el, 'vc-ampel'), 'rot');
  assert.doesNotMatch(lesbar(q(el, 'vc-form')), /Bürgermeisterin|Lenkungskreis/u);
  pruefeSichtbar('vorlagen-check leer', el);
  // Schritte: weiter, Wege hinzufügen zählt zulässige Wege
  klicke(el, 'vc-weiter');
  assert.equal(q(el, 'vc-schritt-2').getAttribute('aria-current'), 'step');
  klicke(el, 'vc-weg-hinzu');
  klicke(el, 'vc-weg-hinzu');
  for (const i of [0, 1]) waehle(el, `vc-weg-zustand-${i}`, 'zulaessig');
  assert.equal(q(el, 'vc-zaehlung').getAttribute('data-ok'), 'ja');
  for (const i of [3, 4, 5]) { klicke(el, `vc-schritt-${i}`); pruefeSichtbar(`vorlagen-check Schritt ${i}`, el); }
});

test('Wegweiser: Startbeispiel führt zur Frühwarnung; eine geänderte Antwort stellt die nächste Frage; jedes Beispiel', () => {
  const el = zeige('wegweiser');
  assert.equal(q(el, 'ww-art').textContent, 'Frühwarnung');
  assert.ok(q(el, 'ww-verwechslung'));
  const ja = q<HTMLInputElement>(el, 'ww-moeglich-ja');
  ja.checked = true;
  ja.dispatchEvent(new Event('change'));
  assert.equal(q(el, 'ww-art').textContent, 'Risiko');
  // die Entscheidungsfrage ist nach der Änderung offen
  assert.equal(el.querySelector('[data-pruef="ww-entscheidung-ja"]')?.closest('fieldset')?.querySelector('input:checked'), null);
  for (const b of inhalte.werkzeuge?.wegweiser.beispiele ?? []) {
    waehle(el, 'ww-beispiel', b.id);
    assert.ok(el.querySelector('[data-pruef="ww-art"]'), b.id);
    pruefeSichtbar(`wegweiser ${b.id}`, el);
  }
  waehle(el, 'ww-beispiel', 'geruest');
  assert.ok(q(el, 'ww-kasten-sofort'));
  waehle(el, 'ww-beispiel', 'lueftung');
  assert.ok(q(el, 'ww-kasten-entscheidung'));
  klicke(el, 'ww-von-vorn');
  assert.equal(el.querySelector('[data-pruef="ww-art"]'), null);
  assert.equal(el.querySelectorAll('[data-pruef="ww-fragen"] fieldset').length, 1, 'nur die erste Frage');
  waehle(el, 'ww-beispiel', '');
  assert.ok(q(el, 'ww-eigener-text'));
});

test('Wegweiser (R78): alles „Nein“ und Entscheidung „Ja“ zeigt „Entscheidung vorbereiten“ – nicht zugleich „Vermutlich kein Vorgang“; mit „Nein“ bleibt es „kein Vorgang“', () => {
  const el = zeige('wegweiser');
  waehle(el, 'ww-beispiel', '');
  const wahl = (frage: string, antwort: string): void => {
    const r = q<HTMLInputElement>(el, `ww-${frage}-${antwort}`);
    r.checked = true;
    r.dispatchEvent(new Event('change'));
  };
  for (const f of ['dringlich', 'handlung', 'eingetreten', 'anpassen', 'moeglich', 'arbeit']) wahl(f, 'nein');
  wahl('entscheidung', 'ja');
  assert.equal(q(el, 'ww-art').textContent, 'Entscheidung vorbereiten');
  assert.ok(q(el, 'ww-kasten-entscheidung'));
  assert.ok(q(el, 'ww-zum-vorlagen-check'));
  assert.doesNotMatch(q(el, 'ww-status').textContent ?? '', /·/u, 'kein Kasten neben „Entscheidung vorbereiten“');
  wahl('dringlich', 'ja');
  // R79: die Ansage nennt den dazukommenden Kasten „Sofort melden“
  assert.match(q(el, 'ww-status').textContent ?? '', /· Sofort melden/u);
  wahl('dringlich', 'nein');
  // R79: der Titel steht nur einmal
  assert.equal((q(el, 'ww-ergebnis').textContent ?? '').split('Entscheidung vorbereiten').length - 1, 1);
  assert.doesNotMatch(q(el, 'ww-ergebnis').textContent ?? '', /kein Vorgang|verknüpft/u);
  wahl('entscheidung', 'nein');
  assert.equal(q(el, 'ww-art').textContent, 'Vermutlich kein Vorgang');
  assert.equal(el.querySelector('[data-pruef="ww-kasten-entscheidung"]'), null);
  assert.doesNotMatch(q(el, 'ww-ergebnis').textContent ?? '', /verknüpft/u);
});

test('Risiko-Bewerter: RIS-009 vorläufig 16 nach oben offen; 71 Tage und „sehr gering“: vorrangig wegen Auswirkung 5; 70 Tage auf der Grenze', () => {
  const el = zeige('risiko-grenzen');
  assert.equal(q(el, 'rg-zustand').getAttribute('data-zustand'), 'vorlaeufig');
  assert.match(q(el, 'rg-feld').textContent ?? '', /4 × 4 = 16.*nach oben offen/u);
  klicke(el, 'rg-annahme-t70');
  assert.match(q(el, 'rg-grenze-termin').textContent ?? '', /Genau auf der Grenze – das ist noch Stufe 4/u);
  klicke(el, 'rg-annahme-t71');
  assert.equal(q(el, 'rg-annahme-t70').getAttribute('aria-pressed'), 'false', 't70 und t71 schließen sich aus');
  klicke(el, 'rg-annahme-w1');
  assert.match(q(el, 'rg-feld').textContent ?? '', /1 × 5 = 5/u);
  assert.equal(q(el, 'rg-prioritaet').getAttribute('data-stufe'), 'vorrangig');
  assert.ok(q(el, 'rg-a5'));
  pruefeSichtbar('risiko-grenzen annahmen', el);
  klicke(el, 'rg-annahmen-zurueck');
  assert.match(q(el, 'rg-feld').textContent ?? '', /4 × 4 = 16/u);
  waehle(el, 'rg-beispiel', 'ris-014');
  assert.equal(q(el, 'rg-zustand').getAttribute('data-zustand'), 'fest');
  assert.equal(q(el, 'rg-prioritaet').getAttribute('data-stufe'), 'gezielt');
  waehle(el, 'rg-beispiel', 'ris-021');
  assert.ok(q(el, 'rg-hinweis-warnanlass'));
  assert.ok(q(el, 'rg-a5'));
  // Grenzen, die nicht steigen, melden sich am Feld
  tippe(el, 'rg-grenze-termin-2', '10');
  assert.match(q(el, 'rg-grenzfehler-termin').textContent ?? '', /von links nach rechts größer werden/u);
  waehle(el, 'rg-beispiel', '');
  assert.equal(q(el, 'rg-zustand').getAttribute('data-zustand'), 'offen');
  pruefeSichtbar('risiko-grenzen leer', el);
});

test('Monatsbericht: Oktober grün und passt; Kosten-Ampel ohne Frage warnt gelb; leer gelassener Abschnitt; offene Entscheidung ohne Stelle', () => {
  const el = zeige('monatsbericht');
  assert.equal(ampel(el, 'mb-ampel'), 'gruen');
  assert.equal(q(el, 'mb-seitenmesser').getAttribute('data-passt'), 'ja');
  waehle(el, 'mb-gehoert-kosten', 'nichts');
  assert.equal(ampel(el, 'mb-ampel'), 'gelb');
  assert.ok(q(el, 'mb-hinweis-ampelOhneFrage'));
  assert.match(q(el, 'mb-hinweise-offen').textContent ?? '', /Noch ein Hinweis offen/u);
  pruefeSichtbar('monatsbericht warnung', el);
  const keine = q<HTMLInputElement>(el, 'mb-blockiert-keine');
  keine.checked = false;
  keine.dispatchEvent(new Event('change'));
  assert.ok(q(el, 'mb-hinweis-leerStattKeine'));
  // Regie-Schalter über den Werkzeugstand (Konzept D.8)
  const regie = zeige('monatsbericht', 'b:oktober;w:1');
  assert.equal(ampel(regie, 'mb-ampel'), 'gelb');
  // offene Entscheidung ohne wer und bis wann → rot
  const e = zeige('monatsbericht');
  const ek = q<HTMLInputElement>(e, 'mb-entscheidungen-keine');
  ek.checked = false;
  ek.dispatchEvent(new Event('change'));
  klicke(e, 'mb-e-hinzu');
  tippe(e, 'mb-e-frage-0', 'Ersatzgerät bestellen?');
  assert.equal(ampel(e, 'mb-ampel'), 'rot');
  waehle(e, 'mb-beispiel', '');
  // R77: ein leerer Bericht ist nicht „vollständig“ – gelb mit dem Hinweis auf Monat, Datenstand und Lage; erst mit ihnen grün
  assert.equal(ampel(e, 'mb-ampel'), 'gelb');
  assert.ok(e.querySelector('[data-pruef="mb-hinweis-berichtUnvollstaendig"]'), 'Hinweis „Bericht unvollständig“');
  tippe(e, 'mb-monat', 'November 2026');
  tippe(e, 'mb-datenstand', '30. November 2026');
  tippe(e, 'mb-lage', 'Alles im Plan.');
  // R79: ebenso die Sätze der drei Ampeln und die benötigte Reaktion
  assert.equal(ampel(e, 'mb-ampel'), 'gelb');
  for (const id of ['kosten', 'termine', 'qualitaet']) tippe(e, `mb-satz-${id}`, 'Im Plan.');
  assert.equal(ampel(e, 'mb-ampel'), 'gelb');
  tippe(e, 'mb-reaktion', 'Kenntnis.');
  assert.equal(ampel(e, 'mb-ampel'), 'gruen');
  assert.doesNotMatch(lesbar(q(e, 'mb-bericht')), /Lindenhall/u, 'ohne Beispiel kein Projektname');
  pruefeSichtbar('monatsbericht leer', e);
});

test('Leinwand (bedienbar: false): keine Bedienelemente; der Werkzeugstand wählt Beispiel und Schritt', () => {
  for (const [w, stand] of [['vorlagen-check', 'b:mensa;s:3'], ['vorlagen-check', 'b:lueftung-kurz;s:ergebnis'], ['wegweiser', 'b:messe;a:n,n,n'], ['risiko-grenzen', 'b:ris-009;t:71;w:1'], ['monatsbericht', 'b:oktober;w:1'], ...NEU.map((x) => [x, null])] as const) {
    const el = baueExplore({ inhalte, werkzeug: w, bedienbar: false, werkzeugStand: stand });
    assert.deepEqual([...el.querySelectorAll('a, button, select, input, textarea')].map((x) => x.outerHTML.slice(0, 60)), [], `${w} ${stand}`);
    pruefeSichtbar(`leinwand ${w} ${stand}`, el);
  }
  // R79: im Schritt „Ergebnis“ zeigt die Leinwand nur das Ergebnis, keinen Prüfschritt daneben
  const vcErg = baueExplore({ inhalte, werkzeug: 'vorlagen-check', bedienbar: false, werkzeugStand: 'b:lueftung-kurz;s:ergebnis' });
  assert.equal(vcErg.querySelector('[data-pruef="vc-form"]')?.childElementCount, 0);
  const vc3 = baueExplore({ inhalte, werkzeug: 'vorlagen-check', bedienbar: false, werkzeugStand: 'b:lueftung-kurz;s:3' });
  assert.ok((vc3.querySelector('[data-pruef="vc-form"]')?.childElementCount ?? 0) > 0);
  const wv = baueExplore({ inhalte, werkzeug: 'wegweiser', bedienbar: false, werkzeugStand: 'b:messe;a:n,n,n' });
  assert.equal(wv.querySelectorAll('[data-pruef="ww-fragen"] .wz-frage').length, 4, 'drei Antworten, vierte Frage offen');
  const rg = baueExplore({ inhalte, werkzeug: 'risiko-grenzen', bedienbar: false, werkzeugStand: 'b:ris-009;t:71;w:1' });
  assert.match(rg.querySelector('[data-pruef="rg-feld"]')?.textContent ?? '', /1 × 5 = 5/u);
  // Unpassendes (fremdes Beispiel, Freitext) ergibt den Beispielanfang
  const fremd = baueExplore({ inhalte, werkzeug: 'risiko-grenzen', bedienbar: false, werkzeugStand: 'b:gibt-es-nicht;t:71' });
  assert.match(fremd.querySelector('[data-pruef="rg-feld"]')?.textContent ?? '', /4 × 4 = 16/u);
});

test('Sichtbare Wörter in allen geprüften Zuständen (O-38, O-42, O-56; kein „Projektblatt“)', () => {
  for (const w of NEU) pruefeSichtbar(w, zeige(w));
  assert.deepEqual(funde.slice(0, 20), [], `${funde.length} Funde`);
});

test('Kleingrafiken: role="img" mit Beschreibung, ohne Kennungen und url(), ohne Farbwerte, deterministisch, Klassen gestaltet', () => {
  const css = readFileSync(resolve(import.meta.dirname, '../src/stil/grafik.css'), 'utf8');
  const bilder = [
    ampelBild('rot', 'nicht vollständig'), ampelBild('gelb', 'x'), ampelBild('gruen', 'x'), ampelBild(null, 'x'),
    messlatteBild({ grenzen: [14, 28, 42, 70], beschriftung: ['14', '28', '42', '70'], wert: { von: 0, bis: 70 }, stufen: { von: 1, bis: 4 }, aufGrenze: false }, 'Termin'),
    messlatteBild({ grenzen: [14, 28, 42, 70], beschriftung: ['14', '28', '42', '70'], wert: { von: 70, bis: 70 }, stufen: { von: 4, bis: 4 }, aufGrenze: true }, 'Termin'),
    messlatteBild({ grenzen: [14, 28, 42, 70], beschriftung: ['a', 'b', 'c', 'd'], wert: { von: 900, bis: 900 }, stufen: { von: 5, bis: 5 }, aufGrenze: false }, 'Termin'),
    miniMatrixBild({ feld: { w: 4, a: 4 }, bis: null, nachObenOffen: true }, 'Matrix'), miniMatrixBild({ feld: { w: 1, a: 1 }, bis: { w: 1, a: 4 }, nachObenOffen: false }, 'Matrix'),
    miniMatrixBild({ feld: null, bis: null, nachObenOffen: false }, 'offen'),
    seitenmesserBild(0.46, 'Seite'), seitenmesserBild(1.3, 'zu lang'), seitenmesserBild(Number.NaN, 'leer'),
  ];
  const klassen = new Set<string>();
  for (const svg of bilder) {
    assert.match(svg, /role="img" aria-label="[^"]+"/u);
    assert.match(svg, /<title>[^<]+<\/title>/u);
    assert.doesNotMatch(svg, /\sid="|url\(|#[0-9a-f]{3,8}\b|\bstyle=|NaN|undefined|Infinity/iu);
    for (const m of svg.matchAll(/class="([^"]*)"/gu)) for (const k of (m[1] ?? '').split(/\s+/u)) if (k !== '') klassen.add(k);
  }
  assert.equal(ampelBild('rot', 'x'), ampelBild('rot', 'x'));
  assert.deepEqual([...klassen].filter((k) => !new RegExp(`\\.${k}(?![\\w-])`, 'u').test(css)), []);
  // die Ampel zeigt die Bedeutung zusätzlich als Zeichen (Farbe nie allein)
  assert.match(ampelBild('rot', 'x'), /wb-zeichen/u);
  assert.doesNotMatch(ampelBild(null, 'x'), /wb-zeichen/u);
});

test('Druckbogen (R79): „Fiktiver Fall“ genau einmal mit Beispiel, keinmal nach „Leer beginnen“', () => {
  const bogenText = (w: string): string => {
    window.dispatchEvent(new Event('beforeprint'));
    const b = document.querySelector('[data-pruef="druck-bogen"]');
    assert.ok(b, `${w}: Bogen fehlt`);
    const t = b.textContent ?? '';
    window.dispatchEvent(new Event('afterprint'));
    return t;
  };
  const wahl: Record<(typeof NEU)[number], string> = { 'vorlagen-check': 'vc-beispiel', wegweiser: 'ww-beispiel', 'risiko-grenzen': 'rg-beispiel', monatsbericht: 'mb-beispiel' };
  for (const w of NEU) {
    const el = zeige(w);
    assert.equal(bogenText(w).split('Fiktiver Fall').length - 1, 1, `${w} mit Beispiel`);
    waehle(el, wahl[w], '');
    // der Wegweiser druckt erst mit einem Ergebnis
    if (w === 'wegweiser') for (const f of ['dringlich', 'handlung', 'eingetreten', 'anpassen', 'moeglich', 'arbeit', 'entscheidung']) {
      const r = q<HTMLInputElement>(el, `ww-${f}-nein`);
      r.checked = true;
      r.dispatchEvent(new Event('change'));
    }
    assert.equal(bogenText(`${w} leer`).split('Fiktiver Fall').length - 1, 0, `${w} leer`);
  }
});

test('Vorlagen-Check (R79): Lücken des aktuellen Schritts und rote zuerst, drei sofort, der Rest eingeklappt und offen bleibend', () => {
  const el = zeige('vorlagen-check', 'b:lueftung-kurz;s:1');
  const sofort = [...el.querySelectorAll('[data-pruef="vc-luecken"] > ul > li')];
  const weitere = el.querySelectorAll('[data-pruef="vc-weitere"] li').length;
  const alle = sofort.length + weitere;
  assert.ok(alle > 4, `genug Lücken für die Probe: ${alle}`);
  assert.equal(sofort.length, 3);
  assert.match(q(el, 'vc-weitere').querySelector('summary')?.textContent ?? '', new RegExp(String(weitere), 'u'));
  // Reihenfolge: zuerst die des aktuellen Schritts, darin rot vor gelb
  const schwere = sofort.map((x) => x.getAttribute('data-schwere'));
  assert.deepEqual([...schwere].sort((a, b) => (a === 'rot' ? 0 : 1) - (b === 'rot' ? 0 : 1)), schwere);
  // im Schritt 4 stehen dessen gelbe Lücken vor einer roten aus Schritt 1
  const s4 = zeige('vorlagen-check', 'b:lueftung-kurz;s:4');
  assert.deepEqual([...s4.querySelectorAll('[data-pruef="vc-luecken"] > ul > li')].map((x) => x.getAttribute('data-pruef')), ['vc-luecke-d1', 'vc-luecke-d2', 'vc-luecke-a4']);
  // genau vier Lücken: alle sofort, kein Aufklapper für eine einzelne
  const vier = zeige('vorlagen-check', 'b:lueftung-voll;s:1');
  const neinen = [...vier.querySelectorAll<HTMLInputElement>('[data-pruef="vc-form"] input[type="radio"][value="nein"]')];
  assert.ok(neinen.length >= 4, `Nein-Felder in Schritt 1: ${neinen.length}`);
  for (const n of neinen.slice(0, 4)) {
    n.checked = true;
    n.dispatchEvent(new Event('change'));
  }
  assert.equal(vier.querySelectorAll('[data-pruef="vc-luecken"] > ul > li').length, 4);
  assert.equal(vier.querySelector('[data-pruef="vc-weitere"]'), null);
  // aufgeklappt bleibt aufgeklappt, auch wenn eine Antwort neu zeichnet
  const d = q<HTMLDetailsElement>(el, 'vc-weitere');
  d.open = true;
  d.dispatchEvent(new Event('toggle'));
  const r = el.querySelector<HTMLInputElement>('[data-pruef="vc-form"] input[type="radio"]:not(:checked)');
  assert.ok(r);
  r.checked = true;
  r.dispatchEvent(new Event('change'));
  assert.equal(q<HTMLDetailsElement>(el, 'vc-weitere').open, true);
});

test('Ansage (R79): Risiko-Bewerter nennt die Zahl der Hinweise, Vorlagen-Check den Hinweis „dringlich“', () => {
  const rg = zeige('risiko-grenzen', 'b:ris-021');
  assert.match(q(rg, 'rg-status').textContent ?? '', /· Hinweise: \d+/u);
  const vc = zeige('vorlagen-check', 'b:mensa;s:1');
  assert.doesNotMatch(q(vc, 'vc-status').textContent ?? '', /·/u);
  const ja = q<HTMLInputElement>(vc, 'vc-dringlich-ja');
  ja.checked = true;
  ja.dispatchEvent(new Event('change'));
  assert.match(q(vc, 'vc-status').textContent ?? '', /· Dringliches wird gemeldet/u);
});

test('Vorspann (L-322): jedes der neun Werkzeuge nennt Wozu · Was Sie eintragen · Was das Ergebnis heißt – ohne Bedienanleitung', async () => {
  const { WERKZEUGE } = await import('../src/ui/flaechen/explore.ts');
  const { W } = await import('../src/ui/woerter.ts');
  assert.equal(WERKZEUGE.length, 9);
  for (const id of WERKZEUGE) {
    const el = zeige(id);
    const teile = [...el.querySelectorAll('[data-pruef="ex-vorspann"] > div')];
    assert.deepEqual(teile.map((t) => t.querySelector('dt')?.textContent), [W.werkzeuge.vorspannWozu, W.werkzeuge.vorspannEingabe, W.werkzeuge.vorspannErgebnis], `${id}: drei Teile`);
    for (const t of teile) {
      const text = t.querySelector('dd')?.textContent ?? '';
      assert.ok(text.length >= 40, `${id}: Teil zu kurz („${text}“)`);
      assert.deepEqual(sichtbarVerboten(text), [], `${id}: Vorspann sichtbar verboten`);
    }
  }
  // Wegweiser: der freie Text wird nicht ausgewertet und erscheint nur im Ausdruck – im Vorspann und am Feld
  assert.match(zeige('wegweiser').querySelector('[data-vorspann="eingabe"]')?.textContent ?? '', /nur im Ausdruck/u);
  const ww = zeige('wegweiser');
  waehle(ww, 'ww-beispiel', '');
  assert.match(q(ww, 'ww-eigener-text').closest('label, div')?.textContent ?? '', /nur im Ausdruck/u);
  // Gegenprobe: eine Bedienanleitung im Vorspann würde erkannt
  assert.ok(sichtbarVerboten('Klicken Sie auf die Zeile und ziehen Sie den Regler.').length > 0);
});
