// Hash-Router (src/ui/route.ts): welcher Bereich ein Anker meint; Unbekanntes führt zur Startseite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gleicheRoute, leseRoute, routeHash, START } from '../src/ui/route.ts';

test('die Anker der Bereiche', () => {
  assert.deepEqual(leseRoute('#start'), { flaeche: 'start' });
  assert.deepEqual(leseRoute('#story'), { flaeche: 'story', station: null });
  assert.deepEqual(leseRoute('#theorie'), { flaeche: 'theorie', thema: null, abschnitt: null });
  assert.deepEqual(leseRoute('#theorie/verantwortung'), { flaeche: 'theorie', thema: 'verantwortung', abschnitt: null });
  assert.deepEqual(leseRoute('#explore'), { flaeche: 'explore', werkzeug: null });
  assert.deepEqual(leseRoute('#explore/matrix'), { flaeche: 'explore', werkzeug: 'matrix' });
  assert.deepEqual(leseRoute('#regie'), { flaeche: 'regie' });
  assert.deepEqual(leseRoute('#leinwand'), { flaeche: 'leinwand' });
});

test('Station, Thema und Abbildung; Großschreibung zählt nicht', () => {
  assert.deepEqual(leseRoute('#story/S3'), { flaeche: 'story', station: 's3' });
  assert.deepEqual(leseRoute('#Theorie/Verantwortung/ABB-6'), { flaeche: 'theorie', thema: 'verantwortung', abschnitt: 'abb-6' });
  assert.deepEqual(leseRoute('#story/'), { flaeche: 'story', station: null });
});

test('Unbekanntes, Leeres und Kaputtes führen zur Startseite', () => {
  for (const hash of ['', '#', '#irgendwas', '#story/s3/x', '#story/-a', '#story/ä3', '#regie/x', '#leinwand/x', '#explore/a/b', '#theorie/a/b/c', '#%E0%A4%A']) {
    assert.deepEqual(leseRoute(hash), START, hash);
  }
});

test('routeHash ist die Umkehrung von leseRoute', () => {
  for (const hash of ['#start', '#story', '#story/s3', '#theorie', '#theorie/takt', '#theorie/verantwortung/abb-6', '#explore', '#explore/glossar', '#regie', '#leinwand']) {
    assert.equal(routeHash(leseRoute(hash)), hash);
  }
  assert.ok(gleicheRoute({ flaeche: 'story', station: 'S3' }, leseRoute('#story/s3')));
  assert.ok(!gleicheRoute(leseRoute('#theorie'), leseRoute('#theorie/takt')));
});
