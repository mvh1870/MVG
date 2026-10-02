/*
 * Tafeln über den Weg der Seite (src/ui/bausteine/bloecke.ts, R69): Die Zellen kommen dort geschützt an
 * (schuetzeEinheiten, mitTrennstellen) – die Zeitachse muss ihre Zeiträume trotzdem lesen.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///index.html' });
const gl = globalThis as unknown as Record<string, unknown>;
for (const k of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'SVGElement', 'DocumentFragment', 'Event', 'getComputedStyle', 'requestAnimationFrame']) gl[k] = (dom.window as unknown as Record<string, unknown>)[k];
after(() => dom.window.close());

const { tafel } = await import('../src/ui/bausteine/bloecke.ts');
const { zeitraum } = await import('../src/grafik/tafel.ts');

test('Zeitachse über bloecke.tafel: Zeiträume gelesen, Regler bis 90, Klick wählt den dritten Abschnitt (R69)', () => {
  const b = {
    art: 'tafel', kennungen: ['k8.2-t1'], id: 'k8.2-t1', felder: {}, liste: null, kinder: [],
    kopf: { form: 'zeitachse', hervor: [], tabelle: { kopf: ['Zeitraum', 'Fokus'], zeilen: [['0–30 Tage', 'Diagnose'], ['31–60 Tage', 'Konzeption'], ['61–90 Tage', 'Anwendung']] } },
  };
  const el = tafel(b as never);
  assert.ok(el);
  const regler = el.querySelector<HTMLInputElement>('[data-pruef="zeitachse-regler"]');
  assert.equal(regler?.max, '90');
  el.querySelector<HTMLElement>('[data-pruef="zeitachse-3"]')?.click();
  assert.equal(el.querySelector('[data-pruef="zeitachse-3"]')?.getAttribute('aria-pressed'), 'true');
  assert.equal(regler?.value, '61');
  assert.deepEqual(zeitraum('31⁠–⁠60 Tage'), [31, 60]);
});
