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
const { rangfolge } = await import('../src/geschichte/mcda.ts');
const { W } = await import('../src/ui/woerter.ts');

const summeIm = (el: HTMLElement, id: string): number => {
  const td = el.querySelector(`[data-pruef="ex-summe-${id}"] b`);
  assert.ok(td, `Summe ${id}`);
  return Number(td.textContent);
};

test('MCDA-Rechner: Punkte ändern rechnet um, „Zurücksetzen“ stellt die Ausgangssumme wieder her', () => {
  const g = inhalte.geschichte;
  assert.ok(g);
  const el = baueExplore({ inhalte, werkzeug: 'mcda', bedienbar: true });
  document.body.replaceChildren(el);
  // Beispiel des Rechners: die zuletzt angebotene Vorlage
  const wahl = el.querySelector<HTMLSelectElement>('[data-pruef="ex-beispiel"]');
  assert.ok(wahl);
  const st = g.stationen.find((x) => x.id === wahl.value);
  assert.ok(st);
  const opt = st.vorlage.optionen.find((o) => !o.klaerung);
  assert.ok(opt);
  const k = g.kriterien[0];
  assert.ok(k);
  // Ausgangssumme wie der Vergleich mit den vorgeschlagenen Gewichten (Station 1)
  const s1 = g.stationen.find((x) => x.vorlage.art === 'gewichte');
  const gew = s1?.vorlage.optionen.find((o) => o.id === s1.vorlage.empfehlung.option)?.gewichte ?? {};
  const vorher = rangfolge(st.vorlage.optionen, g.kriterien, gew).find((p) => p.option.id === opt.id)?.summe;
  assert.equal(summeIm(el, opt.id), vorher);

  const punkt = opt.punkte?.[k.id]?.[0] ?? 3;
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
