// Hash-Router (src/ui/route.ts): welcher Bereich ein Anker meint; Unbekanntes führt zur Startseite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gleicheRoute, leseRoute, routeHash, START } from '../src/ui/route.ts';

test('die Anker der Bereiche', () => {
  assert.deepEqual(leseRoute('#start'), { flaeche: 'start' });
  assert.deepEqual(leseRoute('#story'), { flaeche: 'story', kapitel: null });
  assert.deepEqual(leseRoute('#theorie'), { flaeche: 'theorie', thema: null, abschnitt: null });
  assert.deepEqual(leseRoute('#theorie/verantwortung'), { flaeche: 'theorie', thema: 'verantwortung', abschnitt: null });
  assert.deepEqual(leseRoute('#explore'), { flaeche: 'explore', werkzeug: null, beispiel: null });
  assert.deepEqual(leseRoute('#explore/matrix'), { flaeche: 'explore', werkzeug: 'matrix', beispiel: null });
  // E-13 (P18.5): ein Werkzeug öffnet mit einem Beispiel
  assert.deepEqual(leseRoute('#explore/vorlagen-check/lueftung-voll'), { flaeche: 'explore', werkzeug: 'vorlagen-check', beispiel: 'lueftung-voll' });
  assert.deepEqual(leseRoute('#regie'), { flaeche: 'regie' });
  assert.deepEqual(leseRoute('#leinwand'), { flaeche: 'leinwand' });
});

test('Kapitel, Thema und Abbildung; Großschreibung zählt nicht', () => {
  assert.deepEqual(leseRoute('#story/K3'), { flaeche: 'story', kapitel: 'k3' });
  assert.deepEqual(leseRoute('#Theorie/Verantwortung/ABB-6'), { flaeche: 'theorie', thema: 'verantwortung', abschnitt: 'abb-6' });
  assert.deepEqual(leseRoute('#story/'), { flaeche: 'story', kapitel: null });
});

test('Unbekanntes, Leeres und Kaputtes führen zur Startseite', () => {
  for (const hash of ['', '#', '#irgendwas', '#story/k3/x', '#story/-a', '#story/ä3', '#regie/x', '#leinwand/x', '#explore/a/b/c', '#explore/a/-b', '#explore/a/ä', '#theorie/a/b/c', '#%E0%A4%A']) {
    assert.deepEqual(leseRoute(hash), START, hash);
  }
});

test('routeHash ist die Umkehrung von leseRoute', () => {
  for (const hash of ['#start', '#story', '#story/k3', '#theorie', '#theorie/takt', '#theorie/verantwortung/abb-6', '#explore', '#explore/glossar', '#explore/wegweiser/messe', '#regie', '#leinwand']) {
    assert.equal(routeHash(leseRoute(hash)), hash);
  }
  assert.ok(gleicheRoute({ flaeche: 'story', kapitel: 'K3' }, leseRoute('#story/k3')));
  assert.ok(!gleicheRoute(leseRoute('#theorie'), leseRoute('#theorie/takt')));
});
