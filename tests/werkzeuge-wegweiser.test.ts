// Vorgangs-Wegweiser (P18.2, Konzept WERKZEUGE-P18 B.2/B.3 und Testplan 7): Reihenfolge der Fragen, „unklar“ →
// Frühwarnung, alles Nein → „vermutlich kein Vorgang“ mit Entscheidungsfrage, Zusätze und die acht Vorbelegungen (B.6).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { leseWerkzeugStand, STAND_MAX } from '../src/werkzeuge/gemeinsam.ts';
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
  assert.equal(w.nurEntscheidung, false);
  // R78: bei „kein Vorgang“ entsteht kein Eintrag – also auch nichts zu verknüpfen
  assert.deepEqual(zusaetze(w), ['keinVorgang']);
  const fertig = wegweiser({ ...alleNein, entscheidung: N });
  assert.equal(fertig.naechste, null);
  assert.equal(fertig.keinVorgang, true);
  assert.deepEqual(zusaetze(fertig), ['keinVorgang']);
  // R78: alles Nein, aber eine Entscheidung nötig → das Ergebnis ist „Entscheidung vorbereiten“, nie zugleich „kein Vorgang“
  const mitE = wegweiser({ ...alleNein, entscheidung: J });
  assert.equal(mitE.keinVorgang, false);
  assert.equal(mitE.nurEntscheidung, true);
  assert.equal(mitE.art, null);
  assert.equal(mitE.naechste, null);
  assert.deepEqual(zusaetze(mitE), ['entscheidung']);
});

test('Dringlich und alles Nein → Frühwarnung mit „Sofort melden“, nie „kein Vorgang“ (R79)', () => {
  const dringlichNein: Antworten = { dringlich: J, handlung: N, eingetreten: N, anpassen: N, moeglich: N, arbeit: N };
  for (const e of [N, J]) {
    const w = wegweiser({ ...dringlichNein, entscheidung: e });
    assert.equal(w.art, 'fruehwarnung');
    assert.equal(w.keinVorgang, false);
    assert.equal(w.nurEntscheidung, false);
    assert.ok(zusaetze(w).includes('sofort'));
    assert.ok(!zusaetze(w).includes('keinVorgang'));
  }
});

test('Die Fragen kommen einzeln: zuerst dringlich, dann der Baum, zuletzt die Entscheidung', () => {
  assert.equal(wegweiser({}).naechste, 'dringlich');
  assert.equal(wegweiser({}).art, null);
  assert.equal(wegweiser({}).keinVorgang, false);
  assert.equal(wegweiser({}).nurEntscheidung, false);
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
  // P18.5: `a:0` = noch keine Antwort gesetzt (die Runde rät zuerst); ein leeres `a:` bleibt ungültig
  assert.deepEqual(leseStandWegweiser('b:messe;a:0', bsp), { beispiel: 'messe', schritt: 'a:0' });
  for (const roh of ['b:messe;a:', 'b:messe;a:x', 'b:messe;a:n,n,n,n,n,n,n,n', 'b:fremd;a:n', 'B:messe']) assert.equal(leseStandWegweiser(roh, bsp), null, roh);
});

test('Werkzeugstand auf dem Kanal: höchstens 80 Zeichen (81 → null), nur der Zeichenvorrat', () => {
  assert.equal(STAND_MAX, 80);
  const muster = /^a+$/u;
  const stand = (n: number): string => `b:x;${'a'.repeat(n)}`;
  assert.equal(stand(76).length, 80);
  assert.deepEqual(leseWerkzeugStand(stand(76), ['x'], muster), { beispiel: 'x', schritt: 'a'.repeat(76) });
  assert.equal(stand(77).length, 81);
  assert.equal(leseWerkzeugStand(stand(77), ['x'], muster), null);
  assert.equal(leseWerkzeugStand(stand(300), ['x'], muster), null);
  assert.equal(leseWerkzeugStand('b:X', ['x']), null, 'Großbuchstaben sind kein erlaubtes Zeichen');
});
