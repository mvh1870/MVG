// Einbett-Schnittstelle und Klänge (P10.6, E12/E14): Nachrichten des Hosts prüfen, Herkunft,
// Antworten; Klänge standardmäßig aus, Schalter gemerkt, Töne nur wenn an.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EINBETTUNG, istEingebettet, leseHostNachricht, starteEinbettung } from '../src/ui/einbettung.ts';
import { erzeugeKlang, TOENE } from '../src/ui/klang.ts';

test('Host-Nachrichten: gehe (normalisiert), frage; Regie, Leinwand und Fremdes fallen weg', () => {
  assert.deepEqual(leseHostNachricht({ mvg: EINBETTUNG, art: 'gehe', ziel: '#Theorie/K04' }), { art: 'gehe', ziel: '#theorie/k4' });
  assert.deepEqual(leseHostNachricht({ mvg: EINBETTUNG, art: 'gehe', ziel: 'unfug' }), { art: 'gehe', ziel: '#start' });
  assert.deepEqual(leseHostNachricht({ mvg: EINBETTUNG, art: 'frage' }), { art: 'frage' });
  for (const n of [null, 'gehe', { art: 'gehe', ziel: '#story' }, { mvg: EINBETTUNG, art: 'gehe', ziel: '#regie' }, { mvg: EINBETTUNG, art: 'gehe', ziel: '#leinwand' },
    { mvg: EINBETTUNG, art: 'gehe', ziel: 42 }, { mvg: EINBETTUNG, art: 'gehe', ziel: `#${'x'.repeat(300)}` }, { mvg: EINBETTUNG, art: 'loesche' }]) {
    assert.equal(leseHostNachricht(n), null, JSON.stringify(n));
  }
});

/** Schein-Fenster mit Elternfenster, das Nachrichten sammelt. */
function fenster(suche = '') {
  const gesendet: { n: unknown; ziel: string }[] = [];
  const eltern = { postMessage: (n: unknown, ziel: string) => { gesendet.push({ n, ziel }); } };
  const lauscher = new Set<(e: MessageEvent) => void>();
  const f = {
    self: {} as unknown, top: {} as unknown, parent: eltern,
    location: { search: suche },
    addEventListener: (_: string, fn: (e: MessageEvent) => void) => { lauscher.add(fn); },
    removeEventListener: (_: string, fn: (e: MessageEvent) => void) => { lauscher.delete(fn); },
  };
  const schicke = (data: unknown, source: unknown = eltern, origin = 'https://host.example'): void => {
    for (const fn of lauscher) fn({ data, source, origin } as MessageEvent);
  };
  return { f: f as unknown as Window, eltern, gesendet, schicke, lauscher };
}

test('Einbettung: bereit, ort auf frage, gehe; nur vom Elternfenster', () => {
  const w = fenster();
  const ziele: string[] = [];
  const e = starteEinbettung({ fenster: w.f, version: 'V', gehe: (h) => ziele.push(h), ort: () => ({ hash: '#theorie', flaeche: 'theorie', titel: 'T' }) });
  assert.deepEqual(w.gesendet, [{ n: { mvg: EINBETTUNG, art: 'bereit', version: 'V' }, ziel: '*' }]);
  w.schicke({ mvg: EINBETTUNG, art: 'frage' });
  assert.deepEqual(w.gesendet[1], { n: { mvg: EINBETTUNG, art: 'ort', hash: '#theorie', flaeche: 'theorie', titel: 'T' }, ziel: '*' });
  w.schicke({ mvg: EINBETTUNG, art: 'gehe', ziel: '#story/a3' });
  w.schicke({ mvg: EINBETTUNG, art: 'gehe', ziel: '#explore' }, {} /* fremdes Fenster */);
  assert.deepEqual(ziele, ['#story/a3']);
  e.entferne();
  assert.equal(w.lauscher.size, 0);
  assert.equal(istEingebettet(w.f), true);
  const oben = { self: 1, top: 1 } as unknown as Window;
  assert.equal(istEingebettet(oben), false);
  assert.equal(istEingebettet({ self: 1, get top(): never { throw new Error('fremd'); } } as unknown as Window), true);
});

test('Einbettung mit genannter Herkunft: nur diese wird gehört und beantwortet', () => {
  const w = fenster('?einbettung-herkunft=https%3A%2F%2Fhost.example');
  const ziele: string[] = [];
  starteEinbettung({ fenster: w.f, version: 'V', gehe: (h) => ziele.push(h), ort: () => ({ hash: '#start', flaeche: 'start', titel: 'T' }) });
  assert.equal(w.gesendet[0]?.ziel, 'https://host.example');
  w.schicke({ mvg: EINBETTUNG, art: 'gehe', ziel: '#theorie' }, w.eltern, 'https://boese.example');
  w.schicke({ mvg: EINBETTUNG, art: 'gehe', ziel: '#theorie' }, w.eltern, 'https://host.example');
  assert.deepEqual(ziele, ['#theorie']);
});

test('Klänge: standardmäßig aus, Schalter gemerkt, Töne nur wenn an', () => {
  const daten = new Map<string, string>();
  const speicher = { getItem: (k: string) => daten.get(k) ?? null, setItem: (k: string, v: string) => { daten.set(k, v); } };
  let toene = 0;
  const param = { value: 0, setValueAtTime: () => param, linearRampToValueAtTime: () => param, exponentialRampToValueAtTime: () => param };
  const knoten = () => ({ connect: (x: unknown) => x });
  const fabrik = () => ({
    currentTime: 0,
    destination: {} as AudioNode,
    createGain: () => ({ ...knoten(), gain: param }) as unknown as GainNode,
    createOscillator: () => { toene++; return { ...knoten(), type: '', frequency: param, start: () => undefined, stop: () => undefined, connect: () => ({ connect: () => undefined }) } as unknown as OscillatorNode; },
  });
  const k = erzeugeKlang(speicher, fabrik);
  assert.equal(k.an(), false);
  k.spiele('frei');
  assert.equal(toene, 0, 'aus: kein Ton');
  k.setze(true);
  assert.equal(daten.get('mvg.klang'), 'an');
  const nachAn = toene;
  assert.equal(nachAn, TOENE.wahl.length, 'Einschalten spielt einen leisen Probeton');
  k.spiele('frei');
  assert.equal(toene, nachAn + TOENE.frei.length);
  assert.equal(erzeugeKlang(speicher, fabrik).an(), true, 'gemerkt');
  k.setze(false);
  assert.equal(erzeugeKlang(speicher, fabrik).an(), false);
  // ohne Speicher und ohne Web Audio: still, kein Fehler
  const still = erzeugeKlang(null, null);
  still.setze(true);
  still.spiele('station');
  const kaputt = erzeugeKlang({ getItem: () => { throw new Error('gesperrt'); }, setItem: () => { throw new Error('gesperrt'); } }, () => { throw new Error('kein Audio'); });
  kaputt.setze(true);
  kaputt.spiele('wahl');
  assert.equal(kaputt.an(), true);
});
