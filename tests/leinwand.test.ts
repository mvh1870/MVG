/*
 * Leinwand (src/regie/leinwand.ts, jsdom) mit einem Testkanal: Beamer-Schalter setzt die Klasse, ein ungültiger
 * Zustand lässt die Anzeige stehen, ein neuer Ort beginnt oben, eine Wahl im selben Schritt nicht, „rollen“ rollt
 * das Fenster um knapp eine Höhe (nur wenn es etwas zu rollen gibt).
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///leinwand.html' });
const gl = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLParagraphElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) gl[k] = (dom.window as unknown as Record<string, unknown>)[k];
const nachOben: [number, number][] = [];
const gerollt: [number, number][] = [];
dom.window.scrollTo = ((x: number, y: number) => { nachOben.push([x, y]); }) as typeof dom.window.scrollTo;
dom.window.scrollBy = ((x: number, y: number) => { gerollt.push([x, y]); }) as typeof dom.window.scrollBy;
after(() => dom.window.close());

const { inhalte } = await import('../src/inhalte/index.ts');
const { starteLeinwand } = await import('../src/regie/leinwand.ts');
const { neuerStand, waehle } = await import('../src/geschichte/engine.ts');
import type { EingehendeNachricht, Kanal, KanalNachricht } from '../src/regie/kanal.ts';

/** Testkanal: `bringe` stellt eine Nachricht zu (ein Wurf des Empfängers bleibt sichtbar), `gesendet` hält, was die Leinwand sendet. */
function testkanal(): Kanal & { bringe(n: EingehendeNachricht): void; gesendet: KanalNachricht[] } {
  const empfaenger = new Set<(n: EingehendeNachricht) => void>();
  const gesendet: KanalNachricht[] = [];
  return {
    gesendet,
    senden: (n) => { gesendet.push(n); },
    abonnieren: (fn) => { empfaenger.add(fn); return () => { empfaenger.delete(fn); }; },
    schliessen: () => { empfaenger.clear(); },
    bringe: (n) => { for (const fn of [...empfaenger]) fn(n); },
  };
}

const g = inhalte.geschichte;
assert.ok(g);
const s1 = g.stationen[0];
assert.ok(s1);
const buehne = (b: Partial<{ bereich: string; thema: string | null; werkzeug: string | null; story: unknown }>) =>
  ({ v: 1, bereich: 'start', thema: null, werkzeug: null, story: neuerStand(), ...b });

function starte(): { wurzel: HTMLElement; kanal: ReturnType<typeof testkanal>; ende: () => void; leinwand: () => HTMLElement } {
  const wurzel = document.createElement('div');
  document.body.replaceChildren(wurzel);
  const kanal = testkanal();
  const ende = starteLeinwand(wurzel, { inhalte, kanal, version: 'Test', takt: 60_000 });
  const leinwand = (): HTMLElement => {
    const el = wurzel.querySelector<HTMLElement>('[data-pruef="leinwand"]');
    assert.ok(el);
    return el;
  };
  return { wurzel, kanal, ende, leinwand };
}

test('Beamer-Schalter: Klasse ist-beamer an und aus', () => {
  const { kanal, ende, leinwand } = starte();
  try {
    assert.deepEqual(kanal.gesendet, [{ art: 'hallo' }]);
    assert.equal(leinwand().classList.contains('ist-beamer'), false);
    kanal.bringe({ art: 'anzeige', nr: 1, beamer: true });
    assert.equal(leinwand().classList.contains('ist-beamer'), true);
    kanal.bringe({ art: 'anzeige', nr: 2, beamer: true });
    assert.equal(leinwand().classList.contains('ist-beamer'), true);
    kanal.bringe({ art: 'anzeige', nr: 3, beamer: false });
    assert.equal(leinwand().classList.contains('ist-beamer'), false);
  } finally {
    ende();
  }
});

test('Ungültiger Zustand: Warteseite bzw. Anzeige bleibt unverändert', () => {
  const { kanal, ende, leinwand } = starte();
  try {
    const warten = leinwand().innerHTML;
    assert.ok(leinwand().querySelector('[data-pruef="leinwand-warten"]'));
    kanal.bringe({ art: 'zustand', nr: 1, zustand: buehne({ bereich: 'unbekannt' }) });
    assert.equal(leinwand().innerHTML, warten, 'ein ungültiger erster Zustand verlässt die Warteseite nicht');
    kanal.bringe({ art: 'zustand', nr: 2, zustand: buehne({ bereich: 'explore', werkzeug: 'matrix' }) });
    const jetzt = leinwand().innerHTML;
    assert.notEqual(jetzt, warten);
    assert.ok(leinwand().querySelector('[data-werkzeug="matrix"]'));
    for (const [nr, kaputt] of [
      [3, null], [4, 'text'], [5, { ...buehne({ bereich: 'theorie' }), v: 2 }], [6, buehne({ bereich: 'theorie', thema: '../geheim' })], [7, buehne({ bereich: 'story', story: { v: 9 } })],
    ] as const) {
      kanal.bringe({ art: 'zustand', nr, zustand: kaputt });
      assert.equal(leinwand().innerHTML, jetzt, `Zustand ${nr}`);
    }
  } finally {
    ende();
  }
});

test('Neuer Ort beginnt oben, eine Wahl im selben Schritt nicht', () => {
  const { kanal, ende } = starte();
  try {
    nachOben.length = 0;
    const vorlage = { ...neuerStand(), schritt: { ort: 'station' as const, station: s1.id, teil: 'vorlage' as const } };
    kanal.bringe({ art: 'zustand', nr: 1, zustand: buehne({ bereich: 'story', story: vorlage }) });
    assert.deepEqual(nachOben, [[0, 0]]);
    // dieselbe Stelle, nur eine Wahl: bleibt stehen
    const opt = s1.vorlage.optionen[1] ?? s1.vorlage.optionen[0];
    assert.ok(opt);
    kanal.bringe({ art: 'zustand', nr: 2, zustand: buehne({ bereich: 'story', story: waehle(g, vorlage, s1.id, opt.id) }) });
    assert.deepEqual(nachOben, [[0, 0]]);
    // nächster Schritt: wieder oben
    kanal.bringe({ art: 'zustand', nr: 3, zustand: buehne({ bereich: 'story', story: { ...waehle(g, vorlage, s1.id, opt.id), schritt: { ort: 'station', station: s1.id, teil: 'folge' } } }) });
    assert.deepEqual(nachOben, [[0, 0], [0, 0]]);
    // anderer Bereich: wieder oben
    kanal.bringe({ art: 'zustand', nr: 4, zustand: buehne({ bereich: 'theorie' }) });
    assert.equal(nachOben.length, 3);
  } finally {
    ende();
  }
});

test('Rollen: um 80 % der Fensterhöhe, nur wenn der Inhalt höher ist als das Fenster', () => {
  const { kanal, ende } = starte();
  const d = document.scrollingElement ?? document.documentElement;
  let hoehe = 5000;
  Object.defineProperty(d, 'scrollHeight', { configurable: true, get: () => hoehe });
  try {
    gerollt.length = 0;
    kanal.bringe({ art: 'zustand', nr: 1, zustand: buehne({ bereich: 'theorie' }) });
    const schritt = Math.round(window.innerHeight * 0.8);
    assert.ok(schritt > 0);
    kanal.bringe({ art: 'rollen', nr: 1, schritt: 1 });
    kanal.bringe({ art: 'rollen', nr: 2, schritt: -1 });
    assert.deepEqual(gerollt, [[0, schritt], [0, -schritt]]);
    // Taste auf der Leinwand rollt ebenso
    const taste = new KeyboardEvent('keydown', { key: 'PageDown', cancelable: true });
    window.dispatchEvent(taste);
    assert.deepEqual(gerollt.at(-1), [0, schritt]);
    assert.equal(taste.defaultPrevented, true);
    // nichts zu rollen
    hoehe = window.innerHeight;
    gerollt.length = 0;
    kanal.bringe({ art: 'rollen', nr: 3, schritt: 1 });
    assert.deepEqual(gerollt, []);
  } finally {
    delete (d as unknown as Record<string, unknown>)['scrollHeight'];
    ende();
  }
});

test('Anzeige (R68): kein Bedienelement und kein Link – Start, Story (Vorlage, Folge mit Thema), jedes Thema, jedes Werkzeug', async () => {
  const { erzeugeAnzeige } = await import('../src/regie/leinwand.ts');
  const { themen } = await import('../src/ui/flaechen/theorie.ts');
  const { WERKZEUGE } = await import('../src/ui/flaechen/explore.ts');
  const { pruefeBuehne } = await import('../src/regie/buehne.ts');
  const anzeige = erzeugeAnzeige(inhalte, 'Test', true);
  document.body.replaceChildren(anzeige.element);
  const mitThema = g.stationen.find((s) => s.theorie !== null && s.vorlage.art === 'optionen');
  assert.ok(mitThema, 'eine Station mit Thema');
  const opt = mitThema.vorlage.optionen[0];
  assert.ok(opt);
  const gewaehlt = waehle(g, neuerStand(), mitThema.id, opt.id);
  const faelle: Array<[string, ReturnType<typeof buehne>]> = [
    ['start', buehne({})],
    ['story s1 Vorlage', buehne({ bereich: 'story', story: { ...neuerStand(), schritt: { ort: 'station', station: s1.id, teil: 'vorlage' } } })],
    [`story ${mitThema.id} Vorlage`, buehne({ bereich: 'story', story: { ...gewaehlt, schritt: { ort: 'station', station: mitThema.id, teil: 'vorlage' } } })],
    [`story ${mitThema.id} Folge`, buehne({ bereich: 'story', story: { ...gewaehlt, schritt: { ort: 'station', station: mitThema.id, teil: 'folge' } } })],
    ['story Ende', buehne({ bereich: 'story', story: { ...gewaehlt, schritt: { ort: 'ende' } } })],
    ['theorie', buehne({ bereich: 'theorie' })],
    ...themen(inhalte).map((t): [string, ReturnType<typeof buehne>] => [`theorie ${t.id}`, buehne({ bereich: 'theorie', thema: t.id })]),
    ...WERKZEUGE.map((w): [string, ReturnType<typeof buehne>] => [`explore ${w}`, buehne({ bereich: 'explore', werkzeug: w })]),
  ];
  try {
    for (const [wo, roh] of faelle) {
      const b = pruefeBuehne(roh, g);
      assert.ok(b, `${wo}: gültiger Bühnenstand`);
      anzeige.setze(b);
      const bedienbar = [...anzeige.element.querySelectorAll('button, select, input, textarea, a[href], [contenteditable], [data-pruef="gs-thema"]')]
        .map((e) => `${e.tagName.toLowerCase()}[${e.getAttribute('data-pruef') ?? e.getAttribute('href') ?? ''}]`);
      assert.deepEqual(bedienbar, [], `${wo}: Bedienelemente auf der Leinwand`);
    }
    // die Folge kennt ihr Thema – auf der Leinwand ohne Link
    anzeige.setze(pruefeBuehne(faelle[3]![1], g)!);
    assert.ok(anzeige.element.querySelector('[data-pruef="gs-entscheidung"]'), 'Folge gezeichnet');
  } finally {
    anzeige.entferne();
  }
});

test('Anzeige (R71): eine Vergleichsvorlage rechnet mit den geltenden Gewichten, die Gegenprobe bleibt zu', async () => {
  const { storyAnzeige } = await import('../src/regie/leinwand.ts');
  const { pruefeBuehne } = await import('../src/regie/buehne.ts');
  const { gewichte, setzeGewicht } = await import('../src/geschichte/engine.ts');
  const { summe, gewertete } = await import('../src/geschichte/mcda.ts');
  const st = g.stationen.find((s) => s.id === 's4') ?? g.stationen.find((s) => s.vorlage.art === 'optionen' && gewertete(s.vorlage.optionen).length > 1);
  assert.ok(st, 'eine Vergleichsvorlage');
  // Vorgabe-Gewichte und selbst eingestellte (ungleich, damit jede Abweichung die Summen ändert)
  let eigen = neuerStand();
  for (const [k, wert] of [['kosten', 1], ['termin', 4], ['qualitaet', 2], ['klima', 5]] as const) eigen = setzeGewicht(g, eigen, k, wert);
  for (const [wo, stand0] of [['Vorgabe', neuerStand()], ['eigene Gewichte', eigen]] as const) {
    const stand = { ...stand0, schritt: { ort: 'station' as const, station: st.id, teil: 'vorlage' as const } };
    const b = pruefeBuehne(buehne({ bereich: 'story', story: stand }), g);
    assert.ok(b, `${wo}: gültiger Bühnenstand`);
    const el = storyAnzeige(inhalte, b);
    const gew = gewichte(g, b.story);
    const optionen = gewertete(st.vorlage.optionen);
    assert.ok(optionen.length > 1, `${wo}: mehrere gewertete Optionen`);
    for (const opt of optionen) {
      const zelle = el.querySelector(`[data-pruef="summe-${opt.id}"] b`);
      assert.ok(zelle, `${wo}: Summe ${opt.id} gezeichnet`);
      assert.equal(zelle.textContent, String(summe(opt, g.kriterien, gew)), `${wo}: Summe ${opt.id}`);
    }
    const probe = el.querySelector<HTMLDetailsElement>('[data-pruef="gs-gegenprobe"]');
    assert.ok(probe, `${wo}: Gegenprobe gezeichnet`);
    assert.equal(probe.hasAttribute('open'), false, `${wo}: Gegenprobe zu`);
  }
});
