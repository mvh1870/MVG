// Vorlagen-Check (P18.2, Konzept WERKZEUGE-P18 A.4 und Testplan 7): Ampel aus Muss-Punkten, zulässige Wege (B1),
// genannte Stelle (A-R3, A-R4) und die Fall-Zuordnung „Wer entscheidet was“ nur bei geladenem Beispiel (A-R5, O-46).
// Die Prüfpunkte stehen später in inhalte/werkzeuge.yaml; hier als feste Vorlage mit den neun Muss-Punkten (E-4).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  beispielNochGeladen, befugteStelleImBeispiel, leseStandVorlage, mandatsGrund, MINDEST_WEGE, pruefeVorlage, type Antwort, type MandatsRegel,
  type Pruefpunkt, type VorlageEingabe,
} from '../src/werkzeuge/vorlagen-check.ts';

const MUSS = new Set(['a1', 'a3', 'a4', 'b1', 'c1', 'c2', 'd1', 'd3', 'e1']);
const IDS = ['a1', 'a2', 'a3', 'a4', 'a5', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3', 'c4', 'd1', 'd2', 'd3', 'e1', 'e2', 'e3'];
const PUNKTE: Pruefpunkt[] = IDS.map((id) => (id === 'b1' ? { id, muss: true, art: 'zaehlung', mindestens: 2 } : { id, muss: MUSS.has(id) }));

const MANDAT: MandatsRegel = {
  bis: 100_000, darueber: 'buergermeisterin', reserve: 'buergermeisterin',
  immer: { risiko: 'buergermeisterin', freigabe: 'buergermeisterin', ziele: 'buergermeisterin' }, beraet: ['lenkungskreis'],
};

const alleJa = (): Record<string, Antwort> => Object.fromEntries(IDS.filter((id) => id !== 'b1').map((id) => [id, 'ja' as Antwort]));
const ZWEI_WEGE = [{ titel: 'A', zustand: 'zulaessig' as const }, { titel: 'B', zustand: 'zulaessig' as const }];

function eingabe(teil: Partial<VorlageEingabe> = {}): VorlageEingabe {
  return { antworten: alleJa(), wege: ZWEI_WEGE, gegenstand: 'geld', stelle: 'sie', betrag: 50_000, reserve: false, dringlich: false, ...teil };
}

/** die drei Vorbelegungen aus A.5 */
const LUEFTUNG_KURZ = eingabe({
  gegenstand: 'geld', stelle: 'buergermeisterin', betrag: 400_000, reserve: true, wege: [{ titel: 'Ersatzgerät', zustand: 'zulaessig' }],
  antworten: { a1: 'teilweise', a2: 'teilweise', a3: 'ja', a4: 'nein', a5: 'nein', b2: 'teilweise', b3: 'ja', c1: 'nein', c2: 'nein', c3: 'nein', c4: 'nein', d1: 'teilweise', d2: 'nein', d3: 'ja', e1: 'teilweise', e2: 'nein', e3: 'ja' },
});
const LUEFTUNG_VOLL = eingabe({
  gegenstand: 'geld', stelle: 'buergermeisterin', betrag: 400_000, reserve: true,
  wege: [{ titel: 'Ersatzgerät', zustand: 'zulaessig' }, { titel: 'Leihgeräte', zustand: 'zulaessig' }, { titel: 'später einziehen', zustand: 'zulaessig' }],
});
const MENSA = eingabe({ gegenstand: 'geld', stelle: 'buergermeisterin', betrag: 600_000, reserve: true, antworten: { ...alleJa(), a4: 'teilweise' } });

const ids = (xs: readonly { id: string }[]): string[] => xs.map((x) => x.id);

test('Vorbelegungen: lueftung-kurz rot, lueftung-voll grün, mensa gelb', () => {
  const kurz = pruefeVorlage(PUNKTE, LUEFTUNG_KURZ, MANDAT);
  assert.equal(kurz.ampel, 'rot');
  assert.equal(kurz.zulaessigeWege, 1);
  for (const p of ['b1', 'a4', 'c1', 'c2']) assert.ok(kurz.luecken.some((l) => l.bezug === p && l.schwere === 'rot'), p);
  assert.equal(pruefeVorlage(PUNKTE, LUEFTUNG_VOLL, MANDAT).ampel, 'gruen');
  const mensa = pruefeVorlage(PUNKTE, MENSA, MANDAT);
  assert.equal(mensa.ampel, 'gelb');
  assert.deepEqual(mensa.luecken, [{ id: 'a4', schwere: 'gelb', bezug: 'a4' }]);
});

test('Alle „ja“ und zwei zulässige Wege → grün; Gegenprobe ein Muss-Punkt „nein“ → rot, „teilweise“ → gelb', () => {
  const g = pruefeVorlage(PUNKTE, eingabe(), null);
  assert.equal(g.ampel, 'gruen');
  assert.deepEqual(g.luecken, []);
  assert.equal(g.erfuellt.length, 18);
  assert.equal(pruefeVorlage(PUNKTE, eingabe({ antworten: { ...alleJa(), c1: 'nein' } }), null).ampel, 'rot');
  assert.equal(pruefeVorlage(PUNKTE, eingabe({ antworten: { ...alleJa(), c1: 'teilweise' } }), null).ampel, 'gelb');
  // Punkt ohne M: auch „nein“ nur gelb (A-R2)
  assert.equal(pruefeVorlage(PUNKTE, eingabe({ antworten: { ...alleJa(), c4: 'nein' } }), null).ampel, 'gelb');
});

test('Unbeantwortet = noch offen → gelb, steht in „offen“', () => {
  const ant = alleJa();
  delete ant['e3'];
  const b = pruefeVorlage(PUNKTE, eingabe({ antworten: ant }), null);
  assert.equal(b.ampel, 'gelb');
  assert.deepEqual(b.offen, ['e3']);
});

test('Muss-Lücken stehen vor den übrigen, sonst Reihenfolge der Punkte', () => {
  const b = pruefeVorlage(PUNKTE, eingabe({ antworten: { ...alleJa(), a2: 'nein', c4: 'teilweise', e1: 'teilweise', a1: 'nein' } }), null);
  assert.deepEqual(b.luecken.map((l) => l.bezug), ['a1', 'e1', 'a2', 'c4']);
  assert.deepEqual(b.luecken.map((l) => l.schwere), ['rot', 'gelb', 'gelb', 'gelb']);
});

test('B1: genau ein zulässiger und ein Schein-Weg → rot; unzulässig und offen zählen nicht (A-R6), je ein Satz', () => {
  const b = pruefeVorlage(PUNKTE, eingabe({ wege: [{ titel: 'A', zustand: 'zulaessig' }, { titel: 'B', zustand: 'schein' }] }), null);
  assert.equal(b.ampel, 'rot');
  assert.equal(b.zulaessigeWege, 1);
  assert.deepEqual(b.luecken, [{ id: 'b1', schwere: 'rot', bezug: 'b1' }]);
  assert.ok(ids(b.hinweise).includes('weg-schein'));
  const c = pruefeVorlage(PUNKTE, eingabe({ wege: [...ZWEI_WEGE, { titel: 'C', zustand: 'unzulaessig' }, { titel: 'D', zustand: 'offen' }] }), null);
  assert.equal(c.ampel, 'gruen', 'zwei zulässige genügen, die anderen schaden nicht');
  assert.deepEqual(ids(c.hinweise), ['weg-unzulaessig', 'weg-offen']);
  // A-R7: „bisheriges Vorgehen beibehalten“ zählt wie jeder andere zulässige Weg
  assert.equal(pruefeVorlage(PUNKTE, eingabe({ wege: [{ titel: 'bisheriges Vorgehen beibehalten', zustand: 'zulaessig' }, { titel: 'B', zustand: 'zulaessig' }] }), null).zulaessigeWege, 2);
  // eine Antwort zu b1 wird nicht angeklickt, sondern errechnet
  assert.equal(pruefeVorlage(PUNKTE, eingabe({ wege: [ZWEI_WEGE[0]!], antworten: { ...alleJa(), b1: 'ja' } }), null).ampel, 'rot');
});

test('Stelle Projektsteuerung → rot, auch wenn alles „ja“ (A-R4); Stelle offen → A3 „nein“ (A-R3)', () => {
  const ps = pruefeVorlage(PUNKTE, eingabe({ stelle: 'projektsteuerung' }), null);
  assert.equal(ps.ampel, 'rot');
  assert.deepEqual(ps.luecken, [{ id: 'stelle-projektsteuerung', schwere: 'rot', bezug: 'a3' }]);
  assert.equal(pruefeVorlage(PUNKTE, eingabe({ stelle: 'projektsteuerung' }), MANDAT).ampel, 'rot');
  const offen = pruefeVorlage(PUNKTE, eingabe({ stelle: 'offen' }), null);
  assert.equal(offen.ampel, 'rot');
  assert.deepEqual(offen.luecken, [{ id: 'a3', schwere: 'rot', bezug: 'a3' }]);
});

test('Ohne Beispiel: neutrale Stellen, kein Mandatshinweis; beratendes Gremium → A3 „nein“', () => {
  const b = pruefeVorlage(PUNKTE, eingabe({ stelle: 'sie', betrag: 5_000_000, reserve: true }), null);
  assert.equal(b.ampel, 'gruen');
  assert.ok(!b.luecken.some((l) => l.id.startsWith('mandat')) && !b.hinweise.some((l) => l.id.startsWith('mandat')));
  const g = pruefeVorlage(PUNKTE, eingabe({ stelle: 'lenkungskreis' }), null);
  assert.equal(g.ampel, 'rot');
  assert.deepEqual(g.luecken, [{ id: 'stelle-beraet', schwere: 'rot', bezug: 'a3' }]);
});

test('Beispiel-Mandat: befugte Stelle (A-R5) mit den Gegenproben des Testplans', () => {
  assert.equal(befugteStelleImBeispiel('geld', null, true, MANDAT), 'buergermeisterin', 'Reserve ja, Betrag unbekannt');
  assert.equal(befugteStelleImBeispiel('geld', null, false, MANDAT), null, 'Betrag unbekannt, Reserve nein');
  assert.equal(befugteStelleImBeispiel('geld', 50_000, null, MANDAT), null, 'Reserve unbekannt, Betrag klein');
  assert.equal(befugteStelleImBeispiel('geld', 200_000, null, MANDAT), 'buergermeisterin', 'Betrag groß, Reserve unbekannt');
  assert.equal(befugteStelleImBeispiel('geld', 100_000, false, MANDAT), 'sie');
  assert.equal(befugteStelleImBeispiel('geld', 100_001, false, MANDAT), 'buergermeisterin');
  assert.equal(befugteStelleImBeispiel('freigabe', 0, false, MANDAT), 'buergermeisterin');
  assert.equal(befugteStelleImBeispiel('risiko', null, null, MANDAT), 'buergermeisterin');
  assert.equal(mandatsGrund('geld', 100_001, true, MANDAT), 'betrag');
  assert.equal(mandatsGrund('geld', 10, true, MANDAT), 'reserve');
  assert.equal(mandatsGrund('ziele', 10, false, MANDAT), 'ziele');
  assert.equal(mandatsGrund('geld', 10, false, MANDAT), null);
});

test('Mandat: Reserve ja, Betrag unbekannt → kein Unbestimmt-Hinweis; Betrag unbekannt, Reserve nein → A3 höchstens „teilweise“', () => {
  const bm = pruefeVorlage(PUNKTE, eingabe({ stelle: 'buergermeisterin', betrag: null, reserve: true }), MANDAT);
  assert.equal(bm.ampel, 'gruen');
  assert.ok(!ids(bm.luecken).includes('mandat-unbestimmt'));
  const unb = pruefeVorlage(PUNKTE, eingabe({ stelle: 'sie', betrag: null, reserve: false }), MANDAT);
  assert.equal(unb.ampel, 'gelb');
  assert.deepEqual(unb.luecken, [{ id: 'mandat-unbestimmt', schwere: 'gelb', bezug: 'a3' }]);
  // „nein“ bleibt „nein“ (höchstens, nicht mindestens „teilweise“)
  assert.equal(pruefeVorlage(PUNKTE, eingabe({ stelle: 'sie', betrag: null, reserve: false, antworten: { ...alleJa(), a3: 'nein' } }), MANDAT).ampel, 'rot');
});

test('Mandat: genannt „Sie“, befugt die Bürgermeisterin → A3 „nein“, rot, mit Grund', () => {
  const b = pruefeVorlage(PUNKTE, eingabe({ stelle: 'sie', betrag: 400_000, reserve: true }), MANDAT);
  assert.equal(b.ampel, 'rot');
  assert.deepEqual(b.luecken, [{ id: 'mandat-falsch:betrag', schwere: 'rot', bezug: 'a3' }]);
  assert.equal(pruefeVorlage(PUNKTE, eingabe({ stelle: 'sie', betrag: 50_000, reserve: true }), MANDAT).luecken[0]?.id, 'mandat-falsch:reserve');
  assert.equal(pruefeVorlage(PUNKTE, eingabe({ stelle: 'sie', gegenstand: 'freigabe' }), MANDAT).luecken[0]?.id, 'mandat-falsch:freigabe');
  // Gegenprobe: 100.000 € ohne Reserve → Sie dürfen, grün
  assert.equal(pruefeVorlage(PUNKTE, eingabe({ stelle: 'sie', betrag: 100_000, reserve: false }), MANDAT).ampel, 'gruen');
});

test('Mandat: genannt Lenkungskreis → A3 „nein“, rot, Satz je befugter Stelle', () => {
  const satz = (teil: Partial<VorlageEingabe>): string | undefined => pruefeVorlage(PUNKTE, eingabe({ stelle: 'lenkungskreis', ...teil }), MANDAT).luecken[0]?.id;
  assert.equal(satz({ betrag: 400_000, reserve: true }), 'mandat-beraet:buergermeisterin');
  assert.equal(satz({ betrag: 50_000, reserve: false }), 'mandat-beraet:sie');
  assert.equal(satz({ betrag: null, reserve: false }), 'mandat-beraet:unbestimmt');
  assert.equal(pruefeVorlage(PUNKTE, eingabe({ stelle: 'lenkungskreis' }), MANDAT).ampel, 'rot');
});

test('Mandat: genannt Bürgermeisterin, befugt Sie → Ampel unverändert, Hinweis info', () => {
  const b = pruefeVorlage(PUNKTE, eingabe({ stelle: 'buergermeisterin', betrag: 50_000, reserve: false }), MANDAT);
  assert.equal(b.ampel, 'gruen');
  assert.deepEqual(b.hinweise, [{ id: 'mandat-selbst', schwere: 'info', bezug: 'a3' }]);
});

test('Betrag geändert → Zustand „Beispiel geladen“ endet, A-R5 schweigt', () => {
  const beispiel = { gegenstand: 'geld' as const, betrag: 400_000, reserve: true };
  const e = eingabe({ stelle: 'sie', betrag: 400_000, reserve: true });
  assert.equal(beispielNochGeladen(beispiel, e), true);
  const geaendert = { ...e, betrag: 400_001 };
  assert.equal(beispielNochGeladen(beispiel, geaendert), false);
  assert.equal(beispielNochGeladen(beispiel, { ...e, reserve: null }), false);
  assert.equal(beispielNochGeladen(beispiel, { ...e, gegenstand: 'ziele' }), false);
  const b = pruefeVorlage(PUNKTE, geaendert, beispielNochGeladen(beispiel, geaendert) ? MANDAT : null);
  assert.equal(b.ampel, 'gruen');
  assert.ok(!b.luecken.some((l) => l.id.startsWith('mandat')));
});

test('Dringlich → Hinweis ohne Ampelgrund (A-R8)', () => {
  const b = pruefeVorlage(PUNKTE, eingabe({ dringlich: true }), null);
  assert.equal(b.ampel, 'gruen');
  assert.deepEqual(b.hinweise, [{ id: 'dringlich', schwere: 'info' }]);
});

test('Werkzeugstand für die Leinwand: nur Beispiel und Schritt', () => {
  const bsp = ['lueftung-kurz', 'lueftung-voll', 'mensa'];
  assert.deepEqual(leseStandVorlage('b:lueftung-kurz;s:3', bsp), { beispiel: 'lueftung-kurz', schritt: 's:3' });
  assert.deepEqual(leseStandVorlage('b:mensa', bsp), { beispiel: 'mensa', schritt: null });
  assert.deepEqual(leseStandVorlage('b:mensa;s:ergebnis', bsp), { beispiel: 'mensa', schritt: 's:ergebnis' });
  for (const roh of ['b:fremd;s:1', 'b:mensa;s:6', 'b:mensa;Hallo', 'b:mensa;s:1;s:2', 's:1', 42, null, `b:mensa;${'s'.repeat(80)}`]) {
    assert.equal(leseStandVorlage(roh, bsp), null, String(roh));
  }
});

test('Mindestzahl zulässiger Wege: Vorgabe 2; ohne eigene Angabe am Punkt gilt sie (ein Weg → nein, zwei → ja)', () => {
  assert.equal(MINDEST_WEGE, 2);
  const ohneAngabe: Pruefpunkt[] = PUNKTE.map((p) => (p.id === 'b1' ? { id: 'b1', muss: true, art: 'zaehlung' } : p));
  const ein = pruefeVorlage(ohneAngabe, eingabe({ wege: [ZWEI_WEGE[0] ?? { titel: 'A', zustand: 'zulaessig' }] }), null);
  assert.equal(ein.ampel, 'rot');
  assert.ok(ein.luecken.some((l) => l.bezug === 'b1' && l.schwere === 'rot'));
  assert.equal(pruefeVorlage(ohneAngabe, eingabe(), null).ampel, 'gruen');
});
