/*
 * Story-Übersetzer (werkzeuge/geschichte.mjs, baueGeschichte): Prüfregeln mit je einer fehlerhaften Station.
 * Grundlage ist eine kleine, gültige Kunst-Geschichte (drei Stationen) – unabhängig von den echten Inhalten;
 * jeder Fall verfälscht genau eine Stelle und verlangt die erwartete Fehlermeldung (wörtlich).
 * Die echten Inhalte prüft tests/geschichte.test.ts.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import YAML from 'yaml';

import { baueGeschichte } from '../werkzeuge/geschichte.mjs';

type Roh = Record<string, any>;

/** Kompilierer-Stub: sammelt Fehler als „ort: text“, Markdown bleibt Text. */
function stub(): { c: unknown; fehler: string[] } {
  const fehler: string[] = [];
  const c = {
    fehler: (ort: string, text: string) => { fehler.push(`${ort}: ${text}`); },
    warnung: () => undefined,
    html: (t: string) => t,
    inline: (t: string) => t,
  };
  return { c, fehler };
}

const RAHMEN: Roh = {
  titel: 'Kunst-Geschichte',
  status: {
    kosten: { start: 10, einheit: 'Mio. €', titel: 'Kosten', basis: 10 },
    puffer: { start: 20, einheit: 'Tage', titel: 'Puffer' },
    offen: { start: 0, einheit: '', titel: 'Offen' },
  },
  kriterien: [{ id: 'kosten', titel: 'Kosten' }, { id: 'termin', titel: 'Termin' }],
  prolog: { titel: 'Auftakt', text: 'Text', takt: 'Takt' },
  ende: { titel: 'Ende', text: 'Text', 'puffer-gut': 'gut', 'puffer-knapp': 'knapp', 'puffer-schlecht': 'schlecht' },
};

function grund(nr: number, monat: number): Roh {
  return {
    id: `s${nr}`, nr, titel: `Station ${nr}`, kurztitel: `S${nr}`, datum: `Monat ${monat}`, monat, lph: 2,
    lage: 'Lage', bericht: { titel: 'Bericht', zeilen: ['Zeile'], reaktion: 'Reaktion' },
    folge: 'Folge', 'so-laeuft-es-oft': 'Oft', einwand: { frage: 'F', antwort: 'A' },
    regie: { notiz: 'Notiz', leitfragen: ['L'] }, belege: ['v24:hb-3.1'],
  };
}

const option = (id: string, k: number, t: number): Roh => ({
  id, titel: `Option ${id}`, text: 'Text', konsequenz: 'Konsequenz', punkte: { kosten: [k, 'b'], termin: [t, 'b'] },
});

function stationen(): Roh[] {
  const s1 = {
    ...grund(1, 1), kurzfassung: true,
    vorlage: {
      art: 'gewichte', frage: 'Gewichte?', stelle: 'PL', empfehlung: { option: 'A', text: 'E' },
      optionen: [
        { id: 'A', titel: 'Ausgewogen', text: 'T', konsequenz: 'K', gewichte: { kosten: 3, termin: 3 } },
        { id: 'B', titel: 'Termin zuerst', text: 'T', konsequenz: 'K', gewichte: { kosten: 2, termin: 5 } },
      ],
    },
  };
  const s2 = {
    ...grund(2, 3),
    vorgaenge: [
      { art: 'aufgabe', kennung: 'A-1', titel: 'Aufgabe', text: 'T', verantwortlich: 'PS', wenn: 's1=A' },
      { art: 'risiko', kennung: 'R-1', titel: 'Risiko', text: 'T', verantwortlich: 'PS', stand: 'offen', matrix: { w: 3, a: 4 } },
      { art: 'risiko', kennung: 'R-2', titel: 'Risiko zu', text: 'T', verantwortlich: 'PS', stand: 'geschlossen am 3.', wenn: 'kurz & s1=A' },
    ],
    'lage-folgen-bedingt': [{ wenn: 's1!=B', folgen: { offen: -1 } }],
    vorlage: { art: 'optionen', frage: 'Was tun?', stelle: 'PL', empfehlung: { option: 'A', text: 'E' }, optionen: [option('A', 4, 3), option('B', 2, 5)] },
  };
  const s3 = {
    ...grund(3, 3),
    bericht: { titel: 'Bericht', zeilen: ['Zeile', { text: 'Nur nach A', wenn: 's2=A & lang' }], reaktion: 'R' },
    vorlage: { art: 'optionen', frage: 'Und nun?', stelle: 'PL', empfehlung: { option: 'B', text: 'E' }, optionen: [option('A', 3, 3), option('B', 4, 4)] },
  };
  return [s1, s2, s3];
}

const DATEI = (nr: number): string => `inhalte/geschichte/s${nr}-station.yaml`;

/** Baut die Geschichte; `aendere` verfälscht Rahmen oder Stationen vorher. */
function baue(aendere: (r: Roh, s: Roh[]) => void = () => undefined): { fehler: string[]; erg: any } {
  const r = structuredClone(RAHMEN);
  const s = stationen();
  aendere(r, s);
  const dateien = [
    { rel: 'inhalte/geschichte/rahmen.yaml', text: YAML.stringify(r) },
    ...s.map((x, i) => ({ rel: DATEI(i + 1), text: YAML.stringify(x) })),
  ];
  const { c, fehler } = stub();
  const erg = baueGeschichte(c, dateien);
  return { fehler, erg };
}

const s = (roh: Roh[], nr: number): Roh => roh[nr - 1] as Roh;

test('Grundlage: die Kunst-Geschichte ist fehlerfrei, Bedingungen und Matrix kommen an, Belege bleiben intern', () => {
  const { fehler, erg } = baue();
  assert.deepEqual(fehler, []);
  const g = erg.geschichte;
  assert.equal(g.stationen.length, 3);
  assert.deepEqual(g.stationen[1].vorgaenge.map((v: Roh) => v.wenn), ['s1=A', null, 'kurz & s1=A']);
  assert.deepEqual(g.stationen[1].vorgaenge[1].matrix, { w: 3, a: 4 });
  assert.deepEqual(g.stationen[1].lageFolgenBedingt, [{ wenn: 's1!=B', folgen: { offen: -1 } }]);
  assert.deepEqual(g.stationen[2].bericht.zeilen[1], { html: 'Nur nach A', wenn: 's2=A & lang' });
  assert.doesNotMatch(JSON.stringify(g), /belege|v24:/u);
});

test('Bedingung auf dieselbe Station: Fehler', () => {
  const { fehler } = baue((_r, st) => { s(st, 2)['vorgaenge'][0].wenn = 's2=A'; });
  assert.deepEqual(fehler, [`${DATEI(2)} A-1: Bedingung „s2=A“ zeigt nicht auf eine frühere Station`]);
});

test('Bedingung auf eine spätere Station: Fehler (auch in Berichtszeilen)', () => {
  const { fehler } = baue((_r, st) => { s(st, 2)['bericht'].zeilen = [{ text: 'Vorgriff', wenn: 's3=B' }]; });
  assert.deepEqual(fehler, [`${DATEI(2)}: Bedingung „s3=B“ zeigt nicht auf eine frühere Station`]);
});

test('Bedingung mit unbekannter Option: Fehler', () => {
  const { fehler } = baue((_r, st) => { s(st, 3)['bericht'].zeilen[1].wenn = 's2=Z & lang'; });
  assert.deepEqual(fehler, [`${DATEI(3)}: Bedingung „s2=Z & lang“: Option Z fehlt`]);
});

test('Bedingung auf eine fehlende Station und unlesbare Bedingung: Fehler', () => {
  assert.deepEqual(baue((_r, st) => { s(st, 3)['bericht'].zeilen[1].wenn = 's9=A'; }).fehler, [`${DATEI(3)}: Bedingung „s9=A“: Station s9 fehlt`]);
  assert.deepEqual(baue((_r, st) => { s(st, 3)['bericht'].zeilen[1].wenn = 'kurz | s2=A'; }).fehler,
    [`${DATEI(3)}: Bedingung „kurz | s2=A“ unlesbar (Form s3=A, s3!=A, kurz, lang; verknüpft mit &)`]);
});

test('Teile „kurz & s1=A“ und „lang&s1!=B“ sind gültig', () => {
  const { fehler, erg } = baue((_r, st) => {
    s(st, 2)['vorgaenge'][0].wenn = 'kurz & s1=A';
    s(st, 3)['bericht'].zeilen[1].wenn = 'lang&s1!=B';
  });
  assert.deepEqual(fehler, []);
  assert.equal(erg.geschichte.stationen[1].vorgaenge[0].wenn, 'kurz & s1=A');
  assert.equal(erg.geschichte.stationen[2].bericht.zeilen[1].wenn, 'lang&s1!=B');
});

test('Risiko ohne Matrix (offen) und mit Matrix außerhalb 1–5: Fehler; geschlossen ohne Matrix: zulässig', () => {
  const ohne = baue((_r, st) => { delete s(st, 2)['vorgaenge'][1].matrix; });
  assert.deepEqual(ohne.fehler, [`${DATEI(2)} R-1: Risiko ohne Matrix (w, a je 1–5)`]);
  const zuHoch = baue((_r, st) => { s(st, 2)['vorgaenge'][1].matrix = { w: 6, a: 2 }; });
  assert.deepEqual(zuHoch.fehler, [`${DATEI(2)} R-1: Risiko ohne Matrix (w, a je 1–5)`]);
  const zuNiedrig = baue((_r, st) => { s(st, 2)['vorgaenge'][1].matrix = { w: 2, a: 0 }; });
  assert.deepEqual(zuNiedrig.fehler, [`${DATEI(2)} R-1: Risiko ohne Matrix (w, a je 1–5)`]);
  // R-2 ist geschlossen und hat keine Matrix – das ist in der Grundlage schon enthalten und fehlerfrei
  assert.equal(baue().erg.geschichte.stationen[1].vorgaenge[2].matrix, null);
});

test('Punkte außerhalb 1–5 oder ohne Begründung: Fehler', () => {
  const sechs = baue((_r, st) => { s(st, 2)['vorlage'].optionen[1].punkte.kosten = [6, 'zu viel']; });
  assert.deepEqual(sechs.fehler, [`${DATEI(2)} Option B: Punkte „kosten“ fehlen oder nicht 1–5 mit Begründung`]);
  const null_ = baue((_r, st) => { s(st, 3)['vorlage'].optionen[0].punkte.termin = [0, 'zu wenig']; });
  assert.deepEqual(null_.fehler, [`${DATEI(3)} Option A: Punkte „termin“ fehlen oder nicht 1–5 mit Begründung`]);
  const ohneGrund = baue((_r, st) => { s(st, 3)['vorlage'].optionen[0].punkte.termin = [3]; });
  assert.deepEqual(ohneGrund.fehler, [`${DATEI(3)} Option A: Punkte „termin“ fehlen oder nicht 1–5 mit Begründung`]);
  const halb = baue((_r, st) => { s(st, 3)['vorlage'].optionen[0].punkte.termin = [2.5, 'halb']; });
  assert.deepEqual(halb.fehler, [`${DATEI(3)} Option A: Punkte „termin“ fehlen oder nicht 1–5 mit Begründung`]);
});

test('Feld „belege“ fehlt oder ist leer: Fehler', () => {
  assert.deepEqual(baue((_r, st) => { delete s(st, 2)['belege']; }).fehler, [`${DATEI(2)}: interne Belege fehlen (Feld „belege“)`]);
  assert.deepEqual(baue((_r, st) => { s(st, 3)['belege'] = []; }).fehler, [`${DATEI(3)}: interne Belege fehlen (Feld „belege“)`]);
});

test('Zeitliche Reihenfolge: eine Station mit früherem Monat als die vorige ist ein Fehler, gleicher Monat nicht', () => {
  const { fehler } = baue((_r, st) => { s(st, 3)['monat'] = 2; });
  assert.deepEqual(fehler, ['inhalte/geschichte/rahmen.yaml: Station 3 liegt zeitlich vor Station 2']);
  // Grundlage: s2 und s3 beide Monat 3 – fehlerfrei (oben geprüft)
});

test('Nummernlücke: Fehler', () => {
  const { fehler } = baue((_r, st) => { s(st, 3)['nr'] = 4; });
  assert.deepEqual(fehler, [`${DATEI(3)}: Nummer 4 – erwartet 3`]);
});

test('Bedingte Lage-Folge ohne „wenn“: Fehler', () => {
  const { fehler } = baue((_r, st) => { delete s(st, 2)['lage-folgen-bedingt'][0].wenn; });
  assert.deepEqual(fehler, [`${DATEI(2)}: Feld „wenn“ fehlt`]);
});
