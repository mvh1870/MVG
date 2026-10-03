// Vorgangs-Wegweiser (P18.2, Konzept WERKZEUGE-P18 B.2/B.3 und Testplan 7): Reihenfolge der Fragen, „unklar“ →
// Frühwarnung, alles Nein → „vermutlich kein Vorgang“ mit Entscheidungsfrage, Zusätze und die acht Vorbelegungen (B.6).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { leseStandWegweiser, verwechslungen, wegweiser, zusaetze, type Art, type FrageId, type Wahl } from '../src/werkzeuge/wegweiser.ts';

type Antworten = Partial<Record<FrageId, Wahl>>;
const N = 'nein' as const;
const J = 'ja' as const;
const U = 'unklar' as const;

test('eingetreten „unklar“ → Frühwarnung aus Unklar; Gegenprobe „ja“ → Problem', () => {
  const w = wegweiser({ dringlich: N, handlung: N, eingetreten: U });
  assert.equal(w.art, 'fruehwarnung');
  assert.equal(w.ausUnklar, true);
  assert.equal(w.naechste, 'entscheidung');
  assert.deepEqual(w.pfad, ['dringlich', 'handlung', 'eingetreten']);
  const p = wegweiser({ dringlich: N, handlung: N, eingetreten: J });
  assert.equal(p.art, 'problem');
  assert.equal(p.ausUnklar, false);
});

test('möglich „unklar“ → Frühwarnung mit ausUnklar; „ja“ → Risiko', () => {
  const w = wegweiser({ dringlich: N, handlung: N, eingetreten: N, anpassen: N, moeglich: U });
  assert.equal(w.art, 'fruehwarnung');
  assert.equal(w.ausUnklar, true);
  assert.equal(wegweiser({ dringlich: N, handlung: N, eingetreten: N, anpassen: N, moeglich: J }).art, 'risiko');
});

test('handlung „ja“ → Maßnahme ohne weitere Fragen', () => {
  const w = wegweiser({ dringlich: N, handlung: J, eingetreten: J, anpassen: J });
  assert.equal(w.art, 'massnahme');
  assert.deepEqual(w.pfad, ['dringlich', 'handlung']);
  assert.equal(w.naechste, 'entscheidung');
});

test('Alles Nein (W1–W5) → kein Vorgang, W6 wird gestellt; mit Antwort fertig', () => {
  const alleNein: Antworten = { dringlich: N, handlung: N, eingetreten: N, anpassen: N, moeglich: N, arbeit: N };
  const w = wegweiser(alleNein);
  assert.equal(w.art, null);
  assert.equal(w.keinVorgang, true);
  assert.equal(w.ausUnklar, false);
  assert.equal(w.naechste, 'entscheidung');
  assert.deepEqual(zusaetze(w), ['keinVorgang', 'verknuepfen']);
  const fertig = wegweiser({ ...alleNein, entscheidung: N });
  assert.equal(fertig.naechste, null);
  const mitE = wegweiser({ ...alleNein, entscheidung: J });
  assert.equal(mitE.keinVorgang, true);
  assert.deepEqual(zusaetze(mitE), ['keinVorgang', 'entscheidung', 'verknuepfen']);
});

test('Die Fragen kommen einzeln: zuerst dringlich, dann der Baum, zuletzt die Entscheidung', () => {
  assert.equal(wegweiser({}).naechste, 'dringlich');
  assert.equal(wegweiser({}).art, null);
  assert.equal(wegweiser({}).keinVorgang, false);
  assert.equal(wegweiser({ dringlich: N }).naechste, 'handlung');
  assert.equal(wegweiser({ dringlich: N, handlung: N }).naechste, 'eingetreten');
  assert.equal(wegweiser({ dringlich: N, handlung: N, eingetreten: N, anpassen: N }).naechste, 'moeglich');
  assert.equal(wegweiser({ dringlich: N, handlung: N, eingetreten: N, anpassen: N, moeglich: N }).naechste, 'arbeit');
  // Antwort im Baum ohne Vorfrage: Art steht, aber die Vorfrage bleibt offen
  const ohneVorfrage = wegweiser({ handlung: J, entscheidung: N });
  assert.equal(ohneVorfrage.art, 'massnahme');
  assert.equal(ohneVorfrage.naechste, 'dringlich');
  // „unklar“ bei einer reinen Ja/Nein-Frage zählt nicht als Antwort
  assert.equal(wegweiser({ dringlich: N, handlung: U }).naechste, 'handlung');
});

test('Zusätze: sofort melden, Problem ohne Wahrscheinlichkeit, Änderung mit bisheriger Grundlage, Risiko bewerten', () => {
  assert.deepEqual(zusaetze(wegweiser({ dringlich: J, handlung: N, eingetreten: J, entscheidung: N })), ['sofort', 'nichtSchaetzen', 'verknuepfen']);
  assert.deepEqual(zusaetze(wegweiser({ dringlich: N, handlung: N, eingetreten: N, anpassen: J, entscheidung: J })), ['bisherGilt', 'entscheidung', 'verknuepfen']);
  assert.deepEqual(zusaetze(wegweiser({ dringlich: N, handlung: N, eingetreten: N, anpassen: N, moeglich: J, entscheidung: N })), ['bewerten', 'verknuepfen']);
  // B-R6: Aufgabe ohne Entscheidung → kein Hinweis
  assert.deepEqual(zusaetze(wegweiser({ dringlich: N, handlung: N, eingetreten: N, anpassen: N, moeglich: N, arbeit: J, entscheidung: N })), ['verknuepfen']);
  // Unklar → Frühwarnung mit Zusatz „unklar“
  assert.deepEqual(zusaetze(wegweiser({ dringlich: N, handlung: N, eingetreten: U, entscheidung: N })), ['unklar', 'verknuepfen']);
  // dringlich gilt sofort, noch bevor ein Ergebnis da ist
  assert.deepEqual(zusaetze(wegweiser({ dringlich: J })), ['sofort']);
});

test('Verwechslungen: höchstens zwei je Art, Reihenfolge des Inhalts', () => {
  const alle: { id: string; art: Art }[] = [
    { id: 'zu-frueh-risiko', art: 'fruehwarnung' }, { id: 'bis-zum-termin', art: 'fruehwarnung' }, { id: 'dritte', art: 'fruehwarnung' },
    { id: 'geplant-senkt', art: 'risiko' },
  ];
  assert.deepEqual(verwechslungen('fruehwarnung', alle), ['zu-frueh-risiko', 'bis-zum-termin']);
  assert.deepEqual(verwechslungen('risiko', alle), ['geplant-senkt']);
  assert.deepEqual(verwechslungen('aufgabe', alle), []);
});

test('Vorbelegungen (B.6) ergeben die erwarteten Arten', () => {
  const faelle: [string, Antworten, Art | null, string[]][] = [
    ['messe', { dringlich: N, handlung: N, eingetreten: N, anpassen: N, moeglich: U, entscheidung: N }, 'fruehwarnung', ['unklar', 'verknuepfen']],
    ['hersteller', { dringlich: N, handlung: N, eingetreten: N, anpassen: N, moeglich: J, entscheidung: J }, 'risiko', ['entscheidung', 'verknuepfen']],
    ['ausschreiben', { dringlich: N, handlung: J, entscheidung: N }, 'massnahme', ['verknuepfen']],
    ['mensa', { dringlich: N, handlung: N, eingetreten: N, anpassen: J, entscheidung: J }, 'aenderung', ['bisherGilt', 'entscheidung', 'verknuepfen']],
    ['mehrkosten', { dringlich: N, handlung: N, eingetreten: N, anpassen: N, moeglich: J, entscheidung: N }, 'risiko', ['bewerten', 'verknuepfen']],
    ['geruest', { dringlich: J, handlung: N, eingetreten: J, entscheidung: N }, 'problem', ['sofort', 'nichtSchaetzen', 'verknuepfen']],
    ['lueftung', { dringlich: N, handlung: N, eingetreten: J, entscheidung: J }, 'problem', ['nichtSchaetzen', 'entscheidung', 'verknuepfen']],
    ['haushalt', { dringlich: N, handlung: N, eingetreten: N, anpassen: N, moeglich: N, arbeit: J, entscheidung: N }, 'aufgabe', ['verknuepfen']],
  ];
  for (const [id, a, art, z] of faelle) {
    const w = wegweiser(a);
    assert.equal(w.art, art, id);
    assert.equal(w.naechste, null, id);
    assert.deepEqual(zusaetze(w), z, id);
  }
});

test('Werkzeugstand für die Leinwand', () => {
  const bsp = ['messe', 'geruest'];
  assert.deepEqual(leseStandWegweiser('b:messe;a:n,n,u', bsp), { beispiel: 'messe', schritt: 'a:n,n,u' });
  assert.deepEqual(leseStandWegweiser('b:geruest', bsp), { beispiel: 'geruest', schritt: null });
  for (const roh of ['b:messe;a:', 'b:messe;a:x', 'b:messe;a:n,n,n,n,n,n,n,n', 'b:fremd;a:n', 'B:messe']) assert.equal(leseStandWegweiser(roh, bsp), null, roh);
});
