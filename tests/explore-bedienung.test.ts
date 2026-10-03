/*
 * Explore bedienen (src/ui/flaechen/explore.ts, jsdom): MCDA-Rechner rechnet nach einer Punkte-Änderung um und
 * kehrt mit „Zurücksetzen“ zur Ausgangslage zurück; der Vorgang „Entscheidung“ zeigt sein Detail; die Legende der
 * Risikomatrix nennt die Ausnahme „Auswirkung 5“ (R67).
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///index.html' });
const gl = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLParagraphElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) gl[k] = (dom.window as unknown as Record<string, unknown>)[k];
after(() => dom.window.close());

const { inhalte } = await import('../src/inhalte/index.ts');
const { baueExplore } = await import('../src/ui/flaechen/explore.ts');
const { kipppunkte, rangfolge } = await import('../src/geschichte/mcda.ts');
const { W } = await import('../src/ui/woerter.ts');

const summeIm = (el: HTMLElement, id: string): number => {
  const td = el.querySelector(`[data-pruef="ex-summe-${id}"] b`);
  assert.ok(td, `Summe ${id}`);
  return Number(td.textContent);
};

/** Der Vergleich aus der Story – das Beispiel des Rechners. */
function vergleich() {
  const v = inhalte.geschichte?.kapitel.find((k) => k.vergleich !== null)?.vergleich;
  assert.ok(v, 'Vergleich in der Story');
  return v;
}
const abgestimmt = (v: ReturnType<typeof vergleich>): Record<string, number> => Object.fromEntries(v.kriterien.map((k) => [k.id, k.gewicht]));

test('MCDA-Rechner: Punkte ändern rechnet um, „Zurücksetzen“ stellt die Ausgangssumme wieder her', () => {
  const v = vergleich();
  const el = baueExplore({ inhalte, werkzeug: 'mcda', bedienbar: true });
  document.body.replaceChildren(el);
  const opt = v.optionen[0];
  const k = v.kriterien[0];
  assert.ok(opt && k);
  // Ausgangssumme wie der Vergleich der Story mit den abgestimmten Gewichten (A 49)
  const gew = abgestimmt(v);
  const vorher = rangfolge(v.optionen, v.kriterien, gew).find((p) => p.option.id === opt.id)?.summe;
  assert.equal(vorher, 49);
  assert.equal(summeIm(el, opt.id), vorher);

  const punkt = opt.punkte[k.id] ?? 3;
  const neu = punkt === 5 ? 1 : 5;
  const auswahl = el.querySelector<HTMLSelectElement>(`select[aria-label="${opt.titel}: ${k.titel}"]`);
  assert.ok(auswahl, 'Punkte-Auswahl');
  auswahl.value = String(neu);
  auswahl.dispatchEvent(new Event('change', { bubbles: true }));
  assert.equal(summeIm(el, opt.id), (vorher ?? 0) + (gew[k.id] ?? 0) * (neu - punkt));
  assert.equal(el.querySelector<HTMLSelectElement>(`select[aria-label="${opt.titel}: ${k.titel}"]`)?.value, String(neu));

  const zurueck = el.querySelector<HTMLButtonElement>('[data-pruef="ex-zuruecksetzen"]');
  assert.ok(zurueck);
  zurueck.click();
  assert.equal(summeIm(el, opt.id), vorher);
  assert.equal(el.querySelector<HTMLSelectElement>(`select[aria-label="${opt.titel}: ${k.titel}"]`)?.value, String(punkt));
});

test('Vorgangsarten: „Entscheidung“ zeigt Titel und Text im Detail', () => {
  const w = inhalte.werkzeuge;
  assert.ok(w);
  const el = baueExplore({ inhalte, werkzeug: 'vorgaenge', bedienbar: true });
  document.body.replaceChildren(el);
  const detail = el.querySelector('[data-pruef="ex-art-detail"]');
  assert.ok(detail);
  const knopf = el.querySelector<HTMLButtonElement>('[data-pruef="ex-art-entscheidung"]');
  assert.ok(knopf);
  assert.notEqual(detail.querySelector('h3')?.textContent, w.vorgaenge.entscheidung.titel, 'vorher ist eine andere Art gezeigt');
  knopf.click();
  assert.equal(detail.querySelector('h3')?.textContent, w.vorgaenge.entscheidung.titel);
  assert.ok((detail.querySelector('p')?.textContent ?? '').length > 0, 'Text der Entscheidung');
  assert.equal(knopf.getAttribute('aria-pressed'), 'true');
});

test('Risikomatrix (R67): die Legende nennt bei der höchsten Stufe die Ausnahme „Auswirkung 5 ist immer vorrangig“', () => {
  const el = baueExplore({ inhalte, werkzeug: 'matrix', bedienbar: true });
  document.body.replaceChildren(el);
  const stufen = [...el.querySelectorAll<HTMLElement>('.ex-stufen > li')];
  assert.ok(stufen.length >= 2);
  const letzte = stufen.at(-1);
  assert.equal(letzte?.dataset['stufe'], 'vorrangig');
  assert.ok(letzte?.querySelector('b')?.textContent?.includes(W.werkzeuge.immerVorrangig), letzte?.textContent ?? '');
  for (const s of stufen.slice(0, -1)) assert.ok(!(s.textContent ?? '').includes(W.werkzeuge.immerVorrangig));
  // die Zelle W 1 / A 5 steht in dieser Stufe, die Zelle W 5 / A 1 nicht
  assert.equal(el.querySelector<HTMLElement>('.ex-zelle[data-w="1"][data-a="5"]')?.dataset['stufe'], 'vorrangig');
  assert.equal(el.querySelector<HTMLElement>('.ex-zelle[data-w="5"][data-a="1"]')?.dataset['stufe'], 'gezielt');
});

test('MCDA-Rechner (R68): der Fokus bleibt nach einer Änderung auf derselben Auswahl (Gewicht und Punkte)', () => {
  const v = vergleich();
  const el = baueExplore({ inhalte, werkzeug: 'mcda', bedienbar: true });
  document.body.replaceChildren(el);
  const k = v.kriterien[1];
  assert.ok(k);
  const gewicht = `${W.geschichte.gewicht} ${k.titel}`;
  const ersteOption = el.querySelector<HTMLSelectElement>('select.ex-punkt-wahl:not([aria-label^="Gewicht"])');
  assert.ok(ersteOption);
  const punkte = ersteOption.getAttribute('aria-label') ?? '';
  for (const name of [gewicht, punkte]) {
    const hole = (): HTMLSelectElement => {
      const s = el.querySelector<HTMLSelectElement>(`select[aria-label="${name}"]`);
      assert.ok(s, name);
      return s;
    };
    hole().focus();
    for (const wert of ['1', '4']) {
      const s = hole();
      s.value = wert;
      s.dispatchEvent(new Event('change', { bubbles: true }));
      assert.notEqual(hole(), s, 'die Tabelle ist neu gezeichnet');
      assert.equal(document.activeElement, hole(), `${name}: Fokus bleibt (nach ${wert})`);
      assert.equal(hole().value, wert);
    }
  }
});

test('MCDA-Rechner: Beispiel ist der Vergleich der Story – ohne Auswahl anderer Vorlagen', () => {
  const v = vergleich();
  const el = baueExplore({ inhalte, werkzeug: 'mcda', bedienbar: true });
  assert.equal(el.querySelector('[data-pruef="ex-beispiel"]'), null);
  assert.deepEqual([...el.querySelectorAll('thead th')].slice(2).map((th) => th.textContent), v.optionen.map((o) => `${o.id} · ${o.titel}`));
});

test('MCDA-Rechner (R69): ein Kipppunkt mit Gleichstand nennt alle an der Spitze („Gleichstand – … und …“)', () => {
  const v = vergleich();
  const el = baueExplore({ inhalte, werkzeug: 'mcda', bedienbar: true });
  document.body.replaceChildren(el);
  // abgestimmt: Klima und Betrieb auf 3 → Ersatzgerät und Später einziehen gleichauf
  const k = kipppunkte(v.optionen, v.kriterien, abgestimmt(v)).find((x) => x.spitze.length > 1);
  assert.ok(k, 'ein Kipppunkt mit Gleichstand');
  const titel = k.spitze.map((x) => v.optionen.find((o) => o.id === x)?.titel ?? x);
  const soll = `${v.kriterien.find((c) => c.id === k.kriterium)?.titel ?? ''} auf ${k.gewicht}: Gleichstand – ${titel.join(' und ')}`;
  assert.equal(soll, 'Klima und Betrieb auf 3: Gleichstand – Ersatzgerät und Später einziehen');
  const zeilen = [...el.querySelectorAll('.gs-kipp li')].map((li) => li.textContent ?? '');
  assert.ok(zeilen.includes(soll), `„${soll}“ fehlt in ${JSON.stringify(zeilen)}`);
});

test('MCDA (r72): über der Tabelle steht die Lage aus dem Kapitel des Vergleichs – wörtlich die erste Szenenzeile, mit Figur und Monat', () => {
  const el = baueExplore({ inhalte, werkzeug: 'mcda', bedienbar: true });
  const k = inhalte.geschichte?.kapitel.find((x) => x.vergleich !== null);
  assert.ok(k);
  const lage = el.querySelector('[data-pruef="ex-lage"]');
  assert.ok(lage, 'Lage fehlt');
  const satz = vonHtmlText(k.szene[0]?.html ?? '');
  assert.ok((lage.textContent ?? '').replace(/­/gu, '').includes(satz), lage.textContent ?? '');
  assert.match(lage.textContent ?? '', new RegExp(`${k.zeit}$`, 'u'));
  assert.ok(lage.compareDocumentPosition(el.querySelector('[data-pruef="ex-mcda-tabelle"]') as Node) & Node.DOCUMENT_POSITION_FOLLOWING, 'Lage steht über der Tabelle');
});

function vonHtmlText(html: string): string {
  const d = document.createElement('div');
  d.innerHTML = html;
  return (d.textContent ?? '').replace(/­/gu, '');
}

/*
 * R75 (explore-begriffe): Die fachlichen Kernsätze von Explore als feste Erwartung (O-57: der Inhalt bleibt; V2.4
 * Handbuch 1–4). Die Prüfung liefert die Abweichungen als Liste; die Gegenprobe zeigt, dass sie Mutationen erkennt.
 */
type Werkzeuge = NonNullable<typeof inhalte.werkzeuge>;
function kernAbweichungen(w: Werkzeuge): string[] {
  const fehler: string[] = [];
  const wege = (id: string): string[] => w.vorgaenge.arten.find((a) => a.id === id)?.wege ?? [];
  for (const z of ['risiko', 'problem', 'aufgabe']) if (!wege('fruehwarnung').includes(z)) fehler.push(`Frühwarnung ohne Weg ${z}`);
  if (!wege('risiko').includes('problem')) fehler.push('Risiko ohne Weg Problem');
  if (!/[Bb]eschlossen[^.]*befugten Stelle des Bauherrn/u.test(w.vorgaenge.entscheidung.html)) fehler.push('Beschluss nicht bei der befugten Stelle des Bauherrn');
  if (!/der Bauherr pflegt keine eigene Liste/u.test(w.vorgaenge.html)) fehler.push('„der Bauherr pflegt keine eigene Liste“ fehlt');
  const stufe = (id: string) => w.takt.stufen.find((s) => s.id === id);
  if (!/selben Arbeitstag/u.test(stufe('sofort')?.html ?? '')) fehler.push('Sofort: nicht „am selben Arbeitstag“');
  if (stufe('sofort')?.wer !== 'Projektsteuerung') fehler.push('Sofort: wer');
  if (!/bis 60 Minuten/u.test(stufe('monat')?.html ?? '')) fehler.push('Monat: nicht „bis 60 Minuten“');
  if (stufe('monat')?.wer !== 'Bauherr und Projektsteuerung') fehler.push('Monat: wer');
  if (!w.matrix.beispiele.some((b) => b.w === 1 && b.a === 5)) fehler.push('kein Matrix-Beispiel mit W 1 und A 5');
  // R76 (explore-begriffe): weitere Kernsätze aus V2.4 Handbuch 2–4 und 3.1, die Mutationen bisher überlebten
  if (!/keine Geldwerte und keine Freigabe/u.test(w.matrix.regel)) fehler.push('Matrix-Regel: nicht „keine Geldwerte und keine Freigabe“');
  if (!/Sicherheit[^.]*Genehmigung[^.]*Befugnis[^.]*unabhängig von der Matrix behandelt/u.test(w.matrix.sonder)) fehler.push('Sonderregel: nicht „unabhängig von der Matrix“');
  if (!/unterrichtet den Bauherrn/u.test(w.matrix.stufen.find((x) => x.id === 'vorrangig')?.html ?? '')) fehler.push('Vorrangig: „unterrichtet den Bauherrn“ fehlt');
  const qualitaet = [
    'Die Abweichung ist gering; die Nutzung bleibt unberührt.',
    'Es muss nachgearbeitet werden; genutzt werden kann wie vorgesehen.',
    'Die Nutzung ist für eine Zeit beschränkt.',
    'Eine wichtige Teilfunktion ist erheblich beeinträchtigt.',
    'Eine wesentliche Funktion oder die Hauptnutzung entfällt.',
  ];
  if (JSON.stringify(w.matrix.qualitaet) !== JSON.stringify(qualitaet)) fehler.push('Qualitätsstufen weichen von der Tabelle ab');
  if (!/Zusammenfassung auf höchstens einer Seite/u.test(stufe('monat')?.html ?? '')) fehler.push('Monat: nicht „höchstens einer Seite“');
  if (!/innerhalb von fünf Arbeitstagen/u.test(stufe('ruhe')?.html ?? '')) fehler.push('Ruhezeit: nicht „innerhalb von fünf Arbeitstagen“');
  if (!/Gewichte und Punkte liegen je zwischen 1 und 5/u.test(w.mcda.html)) fehler.push('MCDA: nicht „zwischen 1 und 5“');
  return fehler;
}

test('Explore (R75): die fachlichen Kernsätze stehen unverändert – mit Gegenprobe', () => {
  const w = inhalte.werkzeuge;
  assert.ok(w);
  assert.deepEqual(kernAbweichungen(w), []);
  const mutationen: Array<(k: Werkzeuge) => void> = [
    (k) => { const a = k.vorgaenge.arten.find((x) => x.id === 'fruehwarnung'); if (a) a.wege = a.wege.filter((x) => x !== 'problem'); },
    (k) => { const a = k.vorgaenge.arten.find((x) => x.id === 'risiko'); if (a) a.wege = a.wege.filter((x) => x !== 'problem'); },
    (k) => { k.vorgaenge.entscheidung.html = k.vorgaenge.entscheidung.html.replace('befugten Stelle des Bauherrn', 'Projektsteuerung'); },
    (k) => { k.vorgaenge.html = k.vorgaenge.html.replace('pflegt keine eigene Liste', 'pflegt die Liste'); },
    (k) => { const s = k.takt.stufen.find((x) => x.id === 'sofort'); if (s) s.html = s.html.replace('am selben Arbeitstag', 'binnen einer Woche'); },
    (k) => { const s = k.takt.stufen.find((x) => x.id === 'monat'); if (s) s.html = s.html.replace('60 Minuten', '90 Minuten'); },
    (k) => { const s = k.takt.stufen.find((x) => x.id === 'monat'); if (s) s.wer = 'Bauherr'; },
    (k) => { for (const b of k.matrix.beispiele) if (b.a === 5) b.a = 4; },
    // R76: Gegenproben zu den neuen Kernsätzen (die Mutationen M8, M10–M14 der Prüfrunde)
    (k) => { k.matrix.regel = k.matrix.regel.replace('keine Geldwerte und keine Freigabe', 'Geldwerte'); },
    (k) => { k.matrix.sonder = k.matrix.sonder.replace('unabhängig von der Matrix', 'nach der Matrix'); },
    (k) => { const s = k.matrix.stufen.find((x) => x.id === 'vorrangig'); if (s) s.html = s.html.replace('unterrichtet den Bauherrn und ', ''); },
    (k) => { k.matrix.qualitaet[2] = 'Die Nutzung ist dauerhaft beschränkt.'; },
    (k) => { const s = k.takt.stufen.find((x) => x.id === 'monat'); if (s) s.html = s.html.replace('höchstens einer Seite', 'höchstens drei Seiten'); },
    (k) => { const s = k.takt.stufen.find((x) => x.id === 'ruhe'); if (s) s.html = s.html.replace('fünf Arbeitstagen', 'zehn Arbeitstagen'); },
    (k) => { k.mcda.html = k.mcda.html.replace('zwischen 1 und 5', 'zwischen 1 und 10'); },
  ];
  for (const [i, m] of mutationen.entries()) {
    const kopie = structuredClone(w);
    m(kopie);
    assert.notDeepEqual(kernAbweichungen(kopie), [], `Mutation ${i + 1} bleibt unbemerkt`);
  }
});
