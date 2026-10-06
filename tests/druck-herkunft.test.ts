/*
 * Druck der Werkzeuge (O-64): Der Bogen sagt, woher die Angaben stammen – Beispiel, verändertes Beispiel oder eigene
 * Angaben – und nennt die Aussagegrenze; eigener Freitext kommt nie in den Fenstertitel (PDF-Metadaten, Dateiname).
 * Der Monatsbericht nennt statt der allgemeinen Grenze den Stand seiner formalen Prüfung.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><head><title>Seite</title></head><body></body></html>', { pretendToBeVisual: true, url: 'file:///index.html' });
const gl = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLParagraphElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) gl[k] = (dom.window as unknown as Record<string, unknown>)[k];
// ohne window.print hängt druckeBogen den Bogen nur an; der Fenstertitel wird über einen Druckaufruf beobachtet
const titel: string[] = [];
(dom.window as unknown as { print: () => void }).print = () => { titel.push(dom.window.document.title); };
after(() => dom.window.close());

const { inhalte } = await import('../src/inhalte/index.ts');
const { baueExplore } = await import('../src/ui/flaechen/explore.ts');
const { W } = await import('../src/ui/woerter.ts');
const E = W.werkzeuge;

const ereignis = (el: Element, art: string): void => { el.dispatchEvent(new dom.window.Event(art, { bubbles: true })); };
function waehle(el: HTMLElement, pruef: string, wert: string): void {
  const s = el.querySelector<HTMLSelectElement>(`select[data-pruef="${pruef}"]`);
  assert.ok(s, pruef);
  s.value = wert;
  ereignis(s, 'change');
}
function drucke(el: HTMLElement, werkzeug: string): { herkunft: string; zeile: string } {
  for (const b of document.querySelectorAll('.druck-bogen, body > .bogen, [data-pruef="druck-bogen"]')) b.remove();
  const knopf = el.querySelector<HTMLButtonElement>(`[data-pruef="${werkzeug}-drucken"]`);
  assert.ok(knopf, `${werkzeug}-drucken`);
  knopf.click();
  const zeilen = [...document.querySelectorAll('[data-pruef="druck-aussagegrenze"]')];
  const zeile = zeilen.at(-1);
  assert.ok(zeile, 'Zeile mit Herkunft und Aussagegrenze im Bogen');
  return { herkunft: zeile.querySelector('[data-pruef="druck-herkunft"]')?.textContent ?? '', zeile: zeile.textContent ?? '' };
}

test('Vorlagen-Check: Beispiel, verändertes Beispiel, eigene Angaben; Freitext nie im Fenstertitel', () => {
  const v = inhalte.werkzeuge?.vorlagencheck;
  assert.ok(v && v.beispiele[0]);
  const el = baueExplore({ inhalte, werkzeug: 'vorlagen-check', bedienbar: true });
  document.body.replaceChildren(el);
  waehle(el, 'vc-beispiel', v.beispiele[0].id);
  let d = drucke(el, 'vorlagen-check');
  assert.equal(d.herkunft, E.herkunft.beispiel);
  assert.ok(d.zeile.includes(E.aussagegrenze));
  // eine eigene Eingabe macht aus dem Beispiel ein verändertes Beispiel
  const feld = el.querySelector<HTMLTextAreaElement | HTMLInputElement>('[data-pruef="vc-titel"]');
  assert.ok(feld);
  feld.value = 'Geheimes Projekt Nordflügel';
  ereignis(feld, 'input');
  d = drucke(el, 'vorlagen-check');
  assert.equal(d.herkunft, E.herkunft.gemischt);
  assert.ok(!titel.some((t) => t.includes('Geheimes Projekt')), 'kein Freitext im Fenstertitel');
  // ohne Beispiel: eigene Angaben
  waehle(el, 'vc-beispiel', '');
  const feld2 = el.querySelector<HTMLTextAreaElement | HTMLInputElement>('[data-pruef="vc-titel"]');
  assert.ok(feld2);
  feld2.value = 'Eigenes Vorhaben Südflügel';
  ereignis(feld2, 'input');
  d = drucke(el, 'vorlagen-check');
  assert.equal(d.herkunft, E.herkunft.eigen);
  assert.ok(!titel.some((t) => t.includes('Südflügel')), 'kein Freitext im Fenstertitel');
  assert.ok(titel.includes(`${E.druckTitelEigen} · ${W.name}`));
  // ein neu gewähltes Beispiel ist wieder unverändert
  waehle(el, 'vc-beispiel', v.beispiele[0].id);
  assert.equal(drucke(el, 'vorlagen-check').herkunft, E.herkunft.beispiel);
});

test('Monatsbericht: der Bogen nennt den Stand der formalen Prüfung; Risiko-Bewerter: Beispiel- oder eigene Grenzen', () => {
  const el = baueExplore({ inhalte, werkzeug: 'monatsbericht', bedienbar: true });
  document.body.replaceChildren(el);
  const d = drucke(el, 'monatsbericht');
  assert.match(d.zeile, /Bericht .+ – geprüft wurde nur die Form, nicht die Zahlen/u);
  assert.ok(!d.zeile.includes(E.aussagegrenze));

  const rg = baueExplore({ inhalte, werkzeug: 'risiko-grenzen', bedienbar: true });
  document.body.replaceChildren(rg);
  const v = inhalte.werkzeuge?.risikogrenzen;
  assert.ok(v && v.beispiele[0]);
  waehle(rg, 'rg-beispiel', v.beispiele[0].id);
  drucke(rg, 'risiko-grenzen');
  assert.ok([...document.querySelectorAll('.wz-druck h2')].some((x) => x.textContent === E.grenzenBeispiel));
  const grenze = rg.querySelector<HTMLInputElement>('input[data-pruef="rg-grenze-termin-4"]');
  assert.ok(grenze);
  grenze.value = '90';
  ereignis(grenze, 'input');
  drucke(rg, 'risiko-grenzen');
  assert.ok([...document.querySelectorAll('.wz-druck h2')].some((x) => x.textContent === E.grenzenEigen));
});
