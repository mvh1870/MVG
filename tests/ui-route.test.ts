// Hash-Router (src/ui/route.ts): welche Fläche ein Anker meint; Unbekanntes führt zur Startseite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gleicheRoute, leseRoute, routeHash, START } from '../src/ui/route.ts';

test('die sechs Anker des Durchstichs', () => {
  assert.deepEqual(leseRoute('#start'), { flaeche: 'start' });
  assert.deepEqual(leseRoute('#story'), { flaeche: 'story' });
  assert.deepEqual(leseRoute('#theorie'), { flaeche: 'theorie', kapitel: null });
  assert.deepEqual(leseRoute('#theorie/k1'), { flaeche: 'theorie', kapitel: 1 });
  assert.deepEqual(leseRoute('#regie'), { flaeche: 'regie' });
  assert.deepEqual(leseRoute('#leinwand'), { flaeche: 'leinwand' });
});

test('Kapitel mit führender Null, Großschreibung und Schrägstrich am Ende', () => {
  assert.deepEqual(leseRoute('#theorie/k01'), { flaeche: 'theorie', kapitel: 1 });
  assert.deepEqual(leseRoute('#Theorie/K13'), { flaeche: 'theorie', kapitel: 13 });
  assert.deepEqual(leseRoute('#story/'), { flaeche: 'story' });
});

test('Unbekanntes, Leeres und Kaputtes führen zur Startseite', () => {
  for (const hash of ['', '#', '#irgendwas', '#theorie/k0', '#theorie/k14', '#theorie/kx', '#story/a3', '#regie/x', '#theorie/k1/extra', '#%E0%A4%A']) {
    assert.deepEqual(leseRoute(hash), START, hash);
  }
});

test('routeHash ist die Umkehrung von leseRoute', () => {
  for (const hash of ['#start', '#story', '#theorie', '#theorie/k1', '#theorie/k13', '#regie', '#leinwand']) {
    assert.equal(routeHash(leseRoute(hash)), hash);
  }
  assert.ok(gleicheRoute(leseRoute('#theorie/k01'), leseRoute('#theorie/k1')));
  assert.ok(!gleicheRoute(leseRoute('#theorie'), leseRoute('#theorie/k1')));
});
