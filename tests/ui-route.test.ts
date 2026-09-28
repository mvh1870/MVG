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
  assert.deepEqual(leseRoute('#hilfe'), { flaeche: 'hilfe', seite: null });
});

test('Hilfe (P13): Kapitel und Unterkapitel als Seite', () => {
  assert.deepEqual(leseRoute('#hilfe/handbuch'), { flaeche: 'hilfe', seite: 'handbuch' });
  assert.deepEqual(leseRoute('#Hilfe/Rollen-Anleitungen-Bauherr-Auftraggeber'), { flaeche: 'hilfe', seite: 'rollen-anleitungen-bauherr-auftraggeber' });
  for (const hash of ['#hilfe/handbuch/x', '#hilfe/-a', '#hilfe/ä']) assert.deepEqual(leseRoute(hash), START, hash);
});

test('Permalinks (P2.4): Station und Abschnitt', () => {
  assert.deepEqual(leseRoute('#story/A3'), { flaeche: 'story', station: 'a3' });
  assert.deepEqual(leseRoute('#story/a3-b3-vergleich'), { flaeche: 'story', station: 'a3-b3-vergleich' });
  assert.deepEqual(leseRoute('#theorie/k2/2.4'), { flaeche: 'theorie', kapitel: 2, abschnitt: '2.4' });
  assert.deepEqual(leseRoute('#theorie/k6/k6.4.3'), { flaeche: 'theorie', kapitel: 6, abschnitt: '6.4.3' });
});

test('Permalinks (P10.1): Absatz und Impressum', () => {
  assert.deepEqual(leseRoute('#theorie/k4/k4.2-p3'), { flaeche: 'theorie', kapitel: 4, abschnitt: 'k4.2-p3' });
  assert.deepEqual(leseRoute('#theorie/k1/K1-P2'), { flaeche: 'theorie', kapitel: 1, abschnitt: 'k1-p2' });
  assert.deepEqual(leseRoute('#theorie/k6/k6.4.2-t1'), { flaeche: 'theorie', kapitel: 6, abschnitt: 'k6.4.2-t1' });
  assert.deepEqual(leseRoute('#theorie/k6/k6.3-b1'), { flaeche: 'theorie', kapitel: 6, abschnitt: 'k6.3-b1' });
  assert.deepEqual(leseRoute('#theorie/impressum'), { flaeche: 'theorie', kapitel: null, abschnitt: 'impressum' });
  for (const hash of ['#theorie/k4/k5.1-p1', '#theorie/k4/k4.2-x1', '#theorie/k4/k4.2-p', '#theorie/impressum/x']) assert.deepEqual(leseRoute(hash), START, hash);
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
  for (const hash of ['#start', '#story', '#story/a3', '#theorie', '#theorie/k1', '#theorie/k13', '#theorie/k2/2.4', '#theorie/k4/k4.2-p3', '#theorie/impressum', '#explore', '#regie', '#leinwand', '#hilfe', '#hilfe/faq-glossar']) {
    assert.equal(routeHash(leseRoute(hash)), hash);
  }
  assert.equal(routeHash({ flaeche: 'story', station: 'A3' }), '#story/A3');
  assert.ok(gleicheRoute(leseRoute('#theorie/k01'), leseRoute('#theorie/k1')));
  assert.ok(gleicheRoute({ flaeche: 'story', station: 'A3' }, leseRoute('#story/a3')));
  assert.ok(!gleicheRoute(leseRoute('#theorie'), leseRoute('#theorie/k1')));
});
