// Hash-Router (src/ui/route.ts): welche Fläche ein Anker meint; Unbekanntes führt zur Startseite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gleicheRoute, leseRoute, routeHash, START } from '../src/ui/route.ts';

test('die Anker der Flächen', () => {
  assert.deepEqual(leseRoute('#start'), { flaeche: 'start' });
  assert.deepEqual(leseRoute('#story'), { flaeche: 'story', station: null });
  assert.deepEqual(leseRoute('#theorie'), { flaeche: 'theorie', kapitel: null, abschnitt: null });
  assert.deepEqual(leseRoute('#theorie/k1'), { flaeche: 'theorie', kapitel: 1, abschnitt: null });
  assert.deepEqual(leseRoute('#explore'), { flaeche: 'explore' });
  assert.deepEqual(leseRoute('#regie'), { flaeche: 'regie' });
  assert.deepEqual(leseRoute('#leinwand'), { flaeche: 'leinwand' });
});

test('Permalinks (P2.4): Station und Abschnitt', () => {
  assert.deepEqual(leseRoute('#story/A3'), { flaeche: 'story', station: 'a3' });
  assert.deepEqual(leseRoute('#story/a3-b3-vergleich'), { flaeche: 'story', station: 'a3-b3-vergleich' });
  assert.deepEqual(leseRoute('#theorie/k2/2.4'), { flaeche: 'theorie', kapitel: 2, abschnitt: '2.4' });
  assert.deepEqual(leseRoute('#theorie/k6/k6.4.3'), { flaeche: 'theorie', kapitel: 6, abschnitt: '6.4.3' });
});

test('Kapitel mit führender Null, Großschreibung und Schrägstrich am Ende', () => {
  assert.deepEqual(leseRoute('#theorie/k01'), { flaeche: 'theorie', kapitel: 1, abschnitt: null });
  assert.deepEqual(leseRoute('#Theorie/K13'), { flaeche: 'theorie', kapitel: 13, abschnitt: null });
  assert.deepEqual(leseRoute('#story/'), { flaeche: 'story', station: null });
});

test('Unbekanntes, Leeres und Kaputtes führen zur Startseite', () => {
  for (const hash of ['', '#', '#irgendwas', '#theorie/k0', '#theorie/k14', '#theorie/kx', '#story/a3/x', '#story/-a', '#story/ä3', '#regie/x', '#explore/x',
    '#theorie/k1/extra', '#theorie/k2/3.1', '#theorie/k2/2', '#theorie/k1/1.2/x', '#%E0%A4%A']) {
    assert.deepEqual(leseRoute(hash), START, hash);
  }
});

test('routeHash ist die Umkehrung von leseRoute', () => {
  for (const hash of ['#start', '#story', '#story/a3', '#theorie', '#theorie/k1', '#theorie/k13', '#theorie/k2/2.4', '#explore', '#regie', '#leinwand']) {
    assert.equal(routeHash(leseRoute(hash)), hash);
  }
  assert.equal(routeHash({ flaeche: 'story', station: 'A3' }), '#story/A3');
  assert.ok(gleicheRoute(leseRoute('#theorie/k01'), leseRoute('#theorie/k1')));
  assert.ok(gleicheRoute({ flaeche: 'story', station: 'A3' }, leseRoute('#story/a3')));
  assert.ok(!gleicheRoute(leseRoute('#theorie'), leseRoute('#theorie/k1')));
});
