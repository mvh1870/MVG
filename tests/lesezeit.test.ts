/*
 * Lesezeit der Story (R73): Die Angaben auf der Seite – Knopf „Kurzfassung (etwa n Minuten)“ im Auftakt und die Zeile der
 * Startseite („etwa 25 Minuten, kurz etwa n“) – stimmen mit der Messung aus werkzeuge/lesezeit.mjs überein (Zählregel dort).
 * Kurzfassung: die Angabe ist die gemessene Lesezeit, auf ganze Minuten gerundet. Ganzer Weg: die gemessene Lesezeit
 * (Mini-Aufgaben und Vergleich als Text mitgezählt) plus Zeit zum Ausprobieren – die Angabe liegt höchstens 6 Minuten darüber.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';

const { messeLesezeit, zaehleWoerter } = (await import(String('../werkzeuge/lesezeit.mjs'))) as {
  messeLesezeit: () => Promise<{ lang: { woerter: number; minuten: number }; kurz: { woerter: number; minuten: number } }>;
  zaehleWoerter: (el: Element) => number;
};
const m = await messeLesezeit();
after(() => (globalThis as unknown as { window?: { close(): void } }).window?.close());
const { inhalte } = await import('../src/inhalte/index.ts');
const { W } = await import('../src/ui/woerter.ts');

const zahl = (text: string, muster: RegExp): number => {
  const t = muster.exec(text);
  assert.ok(t, `keine Minutenangabe in „${text}“`);
  return Number(t[1]);
};

test('Kurzfassung: die Angabe im Auftakt ist die gemessene Lesezeit, gerundet', () => {
  const g = inhalte.geschichte;
  assert.ok(g);
  const angabe = zahl(g.auftakt.kurz, /etwa (\d+) Minuten/u);
  assert.equal(angabe, Math.round(m.kurz.minuten), `gemessen ${m.kurz.woerter} Wörter ≈ ${m.kurz.minuten.toFixed(1)} Minuten`);
});

test('Startseite: dieselbe Angabe für die Kurzfassung; der ganze Weg liegt zwischen Lesezeit und Lesezeit plus Ausprobieren', () => {
  const meta = W.start.storyMeta(8);
  assert.equal(zahl(meta, /kurz etwa (\d+)/u), Math.round(m.kurz.minuten));
  const lang = zahl(meta, /etwa (\d+) Minuten/u);
  assert.ok(lang >= Math.round(m.lang.minuten) && lang <= Math.round(m.lang.minuten) + 6,
    `ganzer Weg: Angabe ${lang}, gemessen ${m.lang.woerter} Wörter ≈ ${m.lang.minuten.toFixed(1)} Minuten`);
});

test('Dokumente nennen dieselbe Dauer der Kurzfassung wie die Messung (Drehbuch, Inhaltsformat, Stil)', async () => {
  const { readFileSync } = await import('node:fs');
  const soll = Math.round(m.kurz.minuten);
  const stellen: [string, RegExp][] = [
    ['docs/DREHBUCH.md', /Kurzfassung \(etwa (\d+) Minuten\)/gu],
    ['docs/INHALTSFORMAT.md', /\*\*Kurzfassung \(P17\.5, etwa (\d+) Minuten/gu],
    ['docs/STIL.md', /kurz etwa (\d+)/gu],
  ];
  for (const [datei, muster] of stellen) {
    const treffer = [...readFileSync(new URL(`../${datei}`, import.meta.url), 'utf8').matchAll(muster)].map((x) => Number(x[1]));
    assert.ok(treffer.length > 0, `${datei}: keine Angabe gefunden`);
    for (const n of treffer) assert.equal(n, soll, `${datei}: „etwa ${n} Minuten“, gemessen ${m.kurz.minuten.toFixed(1)}`);
  }
});

test('Zählregel: ohne Screenreader-Text, Grafiken, Balkentafel und Kicker; zugeklappt nur die Titelzeile', () => {
  const el = document.createElement('article');
  el.innerHTML = '<p class="gs-kicker">Mai 2027</p><p>Drei Wörter hier – 450 Essen.</p><span class="nur-sr">versteckt bleibt</span>'
    + '<span aria-hidden="true">Bild</span><ul class="gs-stand"><li>Geld</li></ul><details><summary>Mehr dazu</summary><p>nicht gezählt</p></details>';
  assert.equal(zaehleWoerter(el), 7);
  // Blockgrenzen trennen, Auszeichnungen im Satz nicht
  const b = document.createElement('article');
  b.innerHTML = '<p>Theo Lot</p><p>Gerüst lose, <b>Ri</b><span>siko</span>.</p>';
  assert.equal(zaehleWoerter(b), 5);
});
