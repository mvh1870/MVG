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
import type { Schritt } from '../src/geschichte/engine.ts';

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
const k1 = g.kapitel[0];
assert.ok(k1);
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
    const frage = { ...neuerStand(), schritt: { ort: 'kapitel' as const, kapitel: k1.id, teil: 'frage' as const } };
    kanal.bringe({ art: 'zustand', nr: 1, zustand: buehne({ bereich: 'story', story: frage }) });
    assert.deepEqual(nachOben, [[0, 0]]);
    // dieselbe Stelle, nur eine Wahl: bleibt stehen
    kanal.bringe({ art: 'zustand', nr: 2, zustand: buehne({ bereich: 'story', story: waehle(g, frage, k1.id, 1) }) });
    assert.deepEqual(nachOben, [[0, 0]]);
    // nächster Schritt: wieder oben
    kanal.bringe({ art: 'zustand', nr: 3, zustand: buehne({ bereich: 'story', story: { ...waehle(g, frage, k1.id, 1), schritt: { ort: 'kapitel', kapitel: 's2', teil: 'szene' } } }) });
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

test('Anzeige (R68): kein Bedienelement und kein Link – Start, Story (Szene, Vergleich, Frage mit Folge und Thema, Mini, Ende), jedes Thema, jedes Werkzeug', async () => {
  const { erzeugeAnzeige } = await import('../src/regie/leinwand.ts');
  const { themen } = await import('../src/ui/flaechen/theorie.ts');
  const { WERKZEUGE } = await import('../src/ui/flaechen/explore.ts');
  const { pruefeBuehne } = await import('../src/regie/buehne.ts');
  const anzeige = erzeugeAnzeige(inhalte, 'Test', true);
  document.body.replaceChildren(anzeige.element);
  let gewaehlt = neuerStand();
  for (const k of g.kapitel) gewaehlt = waehle(g, gewaehlt, k.id, 0);
  const an = (kapitel: string, teil: 'szene' | 'vergleich' | 'frage' | 'mini') => buehne({ bereich: 'story', story: { ...gewaehlt, schritt: { ort: 'kapitel', kapitel, teil } } });
  const faelle: Array<[string, ReturnType<typeof buehne>]> = [
    ['start', buehne({})],
    ['story Auftakt', buehne({ bereich: 'story' })],
    ['story k1 Szene', an('s1', 'szene')],
    ['story k1 Frage mit Folge', an('s1', 'frage')],
    ['story k2 Mini', an('s2', 'mini')],
    ['story k6 Mini', an('s10', 'mini')],
    ['story k7 Vergleich', an('s12', 'vergleich')],
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
    // die Folge ist gezeichnet, ihr Thema auf der Leinwand ohne Link
    anzeige.setze(pruefeBuehne(faelle[3]![1], g)!);
    assert.ok(anzeige.element.querySelector('[data-pruef="gs-folge"]'), 'Folge gezeichnet');
    assert.ok(anzeige.element.querySelector('[data-pruef="gs-dahinter"]'), 'Kasten „Das steckt dahinter“ ohne Link');
  } finally {
    anzeige.entferne();
  }
});

test('Anzeige (P19.7): jeder Schritt der 14 Stationen – alle Mini-Arten, Pausen, Ende, Buch, Verlauf – ohne Bedienelement, ohne „neu“, auf beiden Wegen', async () => {
  const { erzeugeAnzeige } = await import('../src/regie/leinwand.ts');
  const { pruefeBuehne } = await import('../src/regie/buehne.ts');
  const { schritte } = await import('../src/geschichte/engine.ts');
  const { loeseMini } = await import('../src/regie/eingriffe.ts');
  const anzeige = erzeugeAnzeige(inhalte, 'Test', true);
  document.body.replaceChildren(anzeige.element);
  const bedienbar = '.anzeige button, .anzeige select, .anzeige input, .anzeige textarea, .anzeige a[href], .anzeige [contenteditable], .anzeige [tabindex]:not([tabindex="-1"])';
  const arten = new Set<string>();
  try {
    for (const kurz of [false, true]) {
      for (const geloest of [false, true]) {
        let stand: ReturnType<typeof neuerStand> = neuerStand(kurz);
        for (const k of g.kapitel) {
          stand = waehle(g, stand, k.id, 1);
          if (geloest) stand = loeseMini(g, stand, k.id);
        }
        const alleSchritte: Schritt[] = schritte(g, kurz);
        for (const schritt of alleSchritte) {
          for (const buch of [false, true]) {
            const roh = buehne({ bereich: 'story', story: { ...stand, schritt }, ...(buch ? { buch: true } : {}) });
            const b = pruefeBuehne(roh, g);
            assert.ok(b, `${JSON.stringify(schritt)}: gültiger Bühnenstand`);
            anzeige.setze(b);
            const wo = `${kurz ? 'kurz' : 'lang'} ${geloest ? 'gelöst' : 'offen'} ${JSON.stringify(schritt)}${buch ? ' mit Buch' : ''}`;
            assert.deepEqual([...anzeige.element.querySelectorAll(bedienbar)].map((e) => `${e.tagName.toLowerCase()}[${e.getAttribute('data-pruef') ?? ''}]`), [], `${wo}: Bedienelemente`);
            assert.equal(anzeige.element.querySelectorAll('.gs-buch-neu').length, 0, `${wo}: Markierung „neu“`);
            assert.equal(anzeige.element.getAttribute('inert'), '', `${wo}: die Leinwand ist inert (Aufklapper nicht bedienbar)`);
            if (schritt.ort === 'kapitel' && schritt.teil === 'mini') {
              const kennung: string = schritt.kapitel;
              arten.add(g.kapitel.find((k) => k.id === kennung)?.mini?.art ?? '');
            }
          }
        }
      }
    }
  } finally {
    anzeige.entferne();
  }
  // die echte Story führt alle fünf neuen Arten und die beiden alten
  for (const neu of ['matrix', 'mappe', 'bericht', 'pinnwand', 'rueckfragen']) assert.ok(arten.has(neu), `Mini-Art ${neu} in der Story`);
});

test('Anzeige (R71): der Vergleich rechnet mit den Gewichten aus der Regie – ohne Bedienelemente', async () => {
  const { storyAnzeige } = await import('../src/regie/leinwand.ts');
  const { pruefeBuehne } = await import('../src/regie/buehne.ts');
  const { setzeGewicht } = await import('../src/geschichte/engine.ts');
  for (const [wo, stand0, a, c] of [['abgestimmt', neuerStand(), '49', '45'], ['Klima wichtig', setzeGewicht(g, neuerStand(), 'klima', 3), '55', '55']] as const) {
    const b = pruefeBuehne(buehne({ bereich: 'story', story: { ...stand0, schritt: { ort: 'kapitel', kapitel: 's12', teil: 'vergleich' } } }), g);
    assert.ok(b, `${wo}: gültiger Bühnenstand`);
    const el = storyAnzeige(inhalte, b);
    assert.equal(el.querySelector('[data-pruef="summe-A"]')?.textContent, `${a} Punkte`, wo);
    assert.equal(el.querySelector('[data-pruef="summe-C"]')?.textContent, `${c} Punkte`, wo);
    assert.equal(el.querySelectorAll('button').length, 0, wo);
  }
});

test('P17.6: die Leinwand zeigt nie die Wertung der Antworten – an keinem Schritt, bei keiner Wahl', async () => {
  const { erzeugeAnzeige } = await import('../src/regie/leinwand.ts');
  const { pruefeBuehne } = await import('../src/regie/buehne.ts');
  const { schritte } = await import('../src/geschichte/engine.ts');
  const { loeseMini } = await import('../src/regie/eingriffe.ts');
  const { W } = await import('../src/ui/woerter.ts');
  const anzeige = erzeugeAnzeige(inhalte, 'Test', true);
  document.body.replaceChildren(anzeige.element);
  const wertungWorte = Object.values(W.regie.wertung).filter((x) => x !== 'gut');
  // R73: auch Attribute, die man sieht oder hört (Tooltip, Vorlesetext, Bildtext) – „gut“ zählt dort als ganzer Attributwert;
  // data-* bleibt intern (z. B. data-fassung="nach-falle")
  const attributFunde = (wurzel: Element, wo: string): string[] => {
    const aus: string[] = [];
    for (const el of [wurzel, ...wurzel.querySelectorAll('*')]) {
      for (const at of [...el.attributes]) {
        if (!(at.name === 'title' || at.name === 'alt' || at.name.startsWith('aria-'))) continue;
        const v = at.value.trim();
        if (Object.values(W.regie.wertung).some((x) => v.toLowerCase() === x.toLowerCase()) || wertungWorte.some((x) => new RegExp(`\\b${x}\\b`, 'iu').test(v))) aus.push(`${wo}: ${el.tagName.toLowerCase()}[${at.name}="${v.slice(0, 40)}"]`);
      }
    }
    return aus;
  };
  const { baueSchritt } = await import('../src/ui/flaechen/geschichte.ts');
  try {
    for (const platz of [0, 1, 2]) {
      let stand = neuerStand();
      for (const k of g.kapitel) stand = loeseMini(g, waehle(g, stand, k.id, platz), k.id);
      const alle: ReturnType<typeof schritte> = schritte(g, false);
      for (const schritt of alle) {
        const b = pruefeBuehne(buehne({ bereich: 'story', story: { ...stand, schritt } }), g);
        assert.ok(b);
        anzeige.setze(b);
        const wo: string = `${JSON.stringify(schritt)} Platz ${platz + 1}`;
        const textInhalt = anzeige.element.textContent ?? '';
        assert.equal(anzeige.element.querySelectorAll('[data-wertung], .regie-wertung').length, 0, `${wo}: Wertung im DOM`);
        for (const wort of wertungWorte) assert.ok(!new RegExp(`\\b${wort}\\b`, 'u').test(textInhalt), `${wo}: „${wort}“ auf der Leinwand`);
        assert.deepEqual(attributFunde(anzeige.element, `Leinwand ${wo}`), []);
        // die bedienbare Story-Fläche desselben Schritts: Wertung weder als Text noch in Attributen
        const flaeche = baueSchritt({ g, stand: { ...stand, schritt }, bedienbar: true, themaTitel: () => 'Thema', tue: () => undefined });
        assert.deepEqual(attributFunde(flaeche, `Story ${wo}`), []);
        for (const wort of wertungWorte) assert.ok(!new RegExp(`\\b${wort}\\b`, 'u').test(flaeche.textContent ?? ''), `${wo}: „${wort}“ auf der Story-Fläche`);
      }
    }
    // Gegenprobe (Regie zeigt Wertung und Leitfragen): tests/ui-bauart.test.ts, „Regie: … Mini-Aufgabe, Wertung“
    // Gegenprobe Attribute: ein Tooltip mit der Wertung wird gefunden
    const probe = document.createElement('div');
    probe.innerHTML = '<button title="Falle">1</button><span aria-label="gut"></span><span aria-label="So macht man es gut"></span>';
    assert.equal(attributFunde(probe, 'Probe').length, 2);
  } finally {
    anzeige.entferne();
  }
});

test('P17.6: die Leinwand rollt zur Folge einer neuen Wahl und zu den Karten bei neuen Gewichten – sonst nicht', async () => {
  const { setzeGewicht } = await import('../src/geschichte/engine.ts');
  const { kanal, ende } = starte();
  try {
    const frage = { ...neuerStand(), schritt: { ort: 'kapitel' as const, kapitel: k1.id, teil: 'frage' as const } };
    kanal.bringe({ art: 'zustand', nr: 1, zustand: buehne({ bereich: 'story', story: frage }) });
    gerollt.length = 0;
    // Gegenprobe: derselbe Stand noch einmal – kein Rollen
    kanal.bringe({ art: 'zustand', nr: 2, zustand: buehne({ bereich: 'story', story: frage }) });
    assert.equal(gerollt.length, 0);
    kanal.bringe({ art: 'zustand', nr: 3, zustand: buehne({ bereich: 'story', story: waehle(g, frage, k1.id, 1) }) });
    assert.equal(gerollt.length, 1, 'neue Wahl: zur Folge');
    // Gegenprobe: dieselbe Wahl erneut gesendet – kein zweites Rollen
    kanal.bringe({ art: 'zustand', nr: 4, zustand: buehne({ bereich: 'story', story: { ...waehle(g, frage, k1.id, 1), kurz: false } }) });
    assert.equal(gerollt.length, 1);
    const vgl = { ...neuerStand(), schritt: { ort: 'kapitel' as const, kapitel: 's12', teil: 'vergleich' as const } };
    kanal.bringe({ art: 'zustand', nr: 5, zustand: buehne({ bereich: 'story', story: vgl }) });
    assert.equal(gerollt.length, 1, 'neuer Ort: oben, kein Rollen zum Ziel');
    kanal.bringe({ art: 'zustand', nr: 6, zustand: buehne({ bereich: 'story', story: setzeGewicht(g, vgl, 'klima', 3) }) });
    assert.equal(gerollt.length, 2, 'neue Gewichte: zu den Karten');
  } finally {
    ende();
  }
});
