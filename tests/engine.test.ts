/*
 * Reducer, Zustand, Leinwand-Ausschnitt, Weiterlesen, Status (P0.5).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import type { Aktion, AktionsArt, Zustand } from '../src/engine/typen.ts';
import { binde } from '../src/engine/aktionen.ts';
import { ZUSTAND_VERSION, anfangszustand, oeffentlich, pruefeOeffentlich, pruefeZustand } from '../src/engine/zustand.ts';
import { SPEICHER_SCHLUESSEL, lade, speichere, vergiss, type SpeicherGriff } from '../src/engine/speicher.ts';
import {
  STATUS_NEUTRAL, beschreibeStatus, berechneStatus, leseWirkEintrag, statusAenderungen, wendeWirkung,
} from '../src/engine/status.ts';
import { friere, spiele, testModell } from './engine-modell.test.ts';

const modell = friere(testModell());
const w = binde(modell);

/** Bis zur Entscheidung in a1 (Rolle pl gewählt, Interessen gesetzt). */
const BIS_ENTSCHEIDUNG: Aktion[] = [
  { art: 'starteStory' },
  { art: 'waehleRolle', rolle: 'pl' },
  { art: 'weiter' },
  { art: 'setzeInteressen', interessen: ['kosten'] },
  { art: 'weiter' }, // → a1 einstieg
  { art: 'weiter' }, // → lage
  { art: 'weiter' }, // → entscheidung
];

test('Anfangszustand: Version, Startseite, nichts freigeschaltet, kein Status', () => {
  const z = anfangszustand();
  assert.equal(z.version, ZUSTAND_VERSION);
  assert.equal(z.bereich, 'start');
  assert.equal(z.station, null);
  assert.deepEqual(z.freigeschaltet, { weltB: false, explore: false });
  assert.deepEqual(z.status, { A: null, B: null });
  assert.deepEqual(z.regie, { protokoll: [] });
  assert.notEqual(anfangszustand(), anfangszustand(), 'jeder Aufruf liefert ein neues Objekt');
});

test('starteStory betritt den Start; weiter ohne Rolle bleibt stehen (dieselbe Referenz)', () => {
  const z1 = spiele(w, anfangszustand(), [{ art: 'starteStory' }]);
  assert.equal(z1.bereich, 'story');
  assert.equal(z1.station, 'p');
  assert.deepEqual(z1.verlauf, ['p']);
  assert.equal(w(z1, { art: 'weiter' }), z1, 'Rollenwahl verlangt eine Rolle');
  assert.equal(w(z1, { art: 'starteStory' }), z1, 'zweimal starten ändert nichts');
});

test('waehleRolle: nur spielbare, bekannte Rollen', () => {
  const z1 = spiele(w, anfangszustand(), [{ art: 'starteStory' }]);
  assert.equal(w(z1, { art: 'waehleRolle', rolle: 'gf' }), z1, 'gf „folgt“');
  assert.equal(w(z1, { art: 'waehleRolle', rolle: 'xx' }), z1);
  const z2 = w(z1, { art: 'waehleRolle', rolle: 'pl' });
  assert.equal(z2.rolle, 'pl');
  assert.equal(w(z2, { art: 'waehleRolle', rolle: 'pl' }), z2);
});

test('setzeInteressen: nur bekannte, ohne Doppel, in Modell-Reihenfolge', () => {
  const z = w(anfangszustand(), { art: 'setzeInteressen', interessen: ['risiko', 'unbekannt', 'kosten', 'kosten'] });
  assert.deepEqual(z.interessen, ['kosten', 'risiko']);
  assert.equal(w(z, { art: 'setzeInteressen', interessen: ['kosten', 'risiko'] }), z);
});

test('weiter führt durch Schritte und Stationen; Station setzt Welt, Verlauf und Status', () => {
  const z = spiele(w, anfangszustand(), BIS_ENTSCHEIDUNG.slice(0, 5));
  assert.equal(z.station, 'a1');
  assert.equal(z.schritt, 0);
  assert.equal(z.welt, 'A');
  assert.deepEqual(z.verlauf, ['p', 'a1']);
  assert.deepEqual(z.status.A, {
    entscheidungsfaehigkeit: 2, kostenunsicherheit: 'hoch', offeneRisiken: 7, ungeklaerteEntscheidungen: 3, terminrisiko: 'mittel', hinweise: {},
  });
  assert.equal(z.status.B, null);
});

test('fordereInfo: Zeitsprung wirkt auf den Status, einmal je Information', () => {
  const z1 = spiele(w, anfangszustand(), BIS_ENTSCHEIDUNG.slice(0, 6));
  const z2 = w(z1, { art: 'fordereInfo', info: 'info' });
  assert.deepEqual(z2.info, ['a1/info']);
  assert.equal(z2.status.A?.terminrisiko, 'hoch');
  assert.equal(w(z2, { art: 'fordereInfo', info: 'info' }), z2);
  assert.equal(w(z2, { art: 'fordereInfo', info: 'gibtsnicht' }), z2);
});

test('Entscheidung: ohne Wahl kein weiter; Wahl landet in entscheidungen und spur, Status folgt', () => {
  const z1 = spiele(w, anfangszustand(), [...BIS_ENTSCHEIDUNG.slice(0, 6), { art: 'fordereInfo', info: 'info' }, { art: 'weiter' }]);
  assert.equal(z1.schritt, 2);
  assert.equal(w(z1, { art: 'weiter' }), z1, 'ohne Wahl geht es nicht weiter');
  assert.equal(w(z1, { art: 'waehle', option: 'Z' }), z1, 'unbekannte Option');
  const z2 = w(z1, { art: 'waehle', option: 'A', zeit: 1234 });
  assert.deepEqual(z2.entscheidungen, { 'a1/pl': 'A' });
  assert.deepEqual(z2.spur, [{ nr: 1, entscheidung: 'a1/pl', station: 'a1', welt: 'A', rolle: 'pl', option: 'A', wechsel: 0, zeit: 1234 }]);
  assert.equal(z2.status.A?.ungeklaerteEntscheidungen, 4);
  assert.equal(z2.status.A?.kostenunsicherheit, 'sehr hoch');
  assert.equal(z2.status.A?.terminrisiko, 'hoch', 'die angeforderte Information wirkt weiter');
  assert.equal(w(z2, { art: 'waehle', option: 'A' }), z2, 'dieselbe Wahl ändert nichts');
});

test('Umentscheiden in der Konsequenz: Spur-Eintrag bleibt einer, Status wird neu gerechnet', () => {
  const z1 = spiele(w, anfangszustand(), [...BIS_ENTSCHEIDUNG, { art: 'waehle', option: 'A' }, { art: 'weiter' }]);
  assert.equal(z1.schritt, 3);
  const z2 = w(z1, { art: 'waehle', option: 'D', zeit: 99 });
  assert.equal(z2.spur.length, 1);
  assert.equal(z2.spur[0]?.option, 'D');
  assert.equal(z2.spur[0]?.wechsel, 1);
  assert.equal(z2.status.A?.ungeklaerteEntscheidungen, 3, 'Wirkung von A ist weg');
  assert.equal(z2.status.A?.kostenunsicherheit, 'sehr hoch', 'D: hoch + 1 Stufe');
  const z3 = w(z2, { art: 'waehle', option: 'C' });
  assert.equal(z3.status.A?.entscheidungsfaehigkeit, 1);
  assert.equal(z3.status.A?.kostenunsicherheit, 'hoch');
});

test('waehle nur im Entscheidungs- oder Konsequenzschritt', () => {
  const z = spiele(w, anfangszustand(), BIS_ENTSCHEIDUNG.slice(0, 5));
  assert.equal(w(z, { art: 'waehle', option: 'A' }), z);
});

test('Welt B erst nach Freischaltung: geheZu, setzeVergleich und weiter sind gesperrt', () => {
  const z = spiele(w, anfangszustand(), BIS_ENTSCHEIDUNG);
  assert.equal(w(z, { art: 'geheZu', station: 'b1' }), z, 'b1 ist Welt B');
  assert.equal(w(z, { art: 'setzeVergleich', wert: 1 }), z, 'Regler an a1 (Partner b1) noch gesperrt');
  const frei = w(z, { art: 'schalteFrei', was: 'weltB' });
  const inB = w(frei, { art: 'geheZu', station: 'b1' });
  assert.equal(inB.station, 'b1');
  assert.equal(inB.welt, 'B');
  assert.equal(inB.vergleich, 1);
});

test('Vergleichsstation schaltet Welt B frei; Regler setzt Welt und bleibt in 0…1', () => {
  const z1 = spiele(w, anfangszustand(), [...BIS_ENTSCHEIDUNG, { art: 'waehle', option: 'B' }, { art: 'weiter' }, { art: 'weiter' }]);
  assert.equal(z1.station, 'v');
  assert.equal(z1.freigeschaltet.weltB, true);
  assert.equal(z1.welt, 'A');
  assert.equal(z1.vergleich, 0);
  assert.equal(z1.status.B?.entscheidungsfaehigkeit, 4, 'Vorschau auf den Stand von b1');
  const z2 = w(z1, { art: 'setzeVergleich', wert: 0.7 });
  assert.equal(z2.vergleich, 0.7);
  assert.equal(z2.welt, 'B');
  assert.equal(w(z2, { art: 'setzeVergleich', wert: 3 }).vergleich, 1);
  assert.equal(w(z2, { art: 'setzeVergleich', wert: Number.NaN }), z2);
  assert.equal(w(z2, { art: 'setzeVergleich', wert: 0.2 }).welt, 'A');
});

test('Welt B: Station, Frage beantworten, zurück zur Vergleichsstation', () => {
  const z1 = spiele(w, anfangszustand(), [...BIS_ENTSCHEIDUNG, { art: 'waehle', option: 'C' }, { art: 'weiter' }, { art: 'weiter' }, { art: 'weiter' }]);
  assert.equal(z1.station, 'b1');
  assert.deepEqual(z1.verlauf, ['p', 'a1', 'v', 'b1']);
  assert.equal(z1.status.B?.hinweise.offeneRisiken, '1 neu bewertet');
  const z2 = w(z1, { art: 'antworte', frage: 'reife', antwort: 'nein' });
  assert.deepEqual(z2.antworten, { 'b1/pl/reife': 'nein' });
  assert.equal(w(z2, { art: 'antworte', frage: 'reife', antwort: 'vielleicht' }), z2);
  assert.equal(w(z2, { art: 'antworte', frage: 'gibtsnicht', antwort: 'ja' }), z2);
  const z3 = w(z2, { art: 'zurueck' });
  assert.equal(z3.station, 'v');
  assert.equal(z3.schritt, 0, 'letzter Schritt der Vergleichsstation');
  assert.deepEqual(z3.verlauf, ['p', 'a1', 'v']);
  assert.deepEqual(z3.entscheidungen, { 'a1/pl': 'C' }, 'zurück vergisst keine Wahl');
  const z4 = spiele(w, z1, [{ art: 'weiter' }, { art: 'weiter' }]);
  assert.equal(z4.schritt, 2);
  assert.equal(w(z4, { art: 'weiter' }), z4, 'Ende: weiter bleibt stehen');
  assert.equal(w(z4, { art: 'zurueck' }).schritt, 1);
});

test('geheZu: unbekannte Station ändert nichts; gleiche Station setzt nur den Schritt', () => {
  const z = spiele(w, anfangszustand(), BIS_ENTSCHEIDUNG);
  assert.equal(w(z, { art: 'geheZu', station: 'nirgends' }), z);
  const z2 = w(z, { art: 'geheZu', station: 'a1', schritt: 1 });
  assert.equal(z2.schritt, 1);
  assert.deepEqual(z2.verlauf, z.verlauf);
  assert.equal(w(z, { art: 'geheZu', station: 'a1', schritt: 99 }).schritt, 3, 'Schritt wird begrenzt');
});

test('Rolle ohne Szene sieht Entscheidungsschritte nicht', () => {
  const m = testModell();
  m.rollen['gf'] = { id: 'gf', spielbar: true };
  const z = spiele(binde(m), anfangszustand(), [{ art: 'starteStory' }, { art: 'waehleRolle', rolle: 'gf' }, { art: 'weiter' }, { art: 'weiter' }, { art: 'weiter' }, { art: 'weiter' }]);
  assert.equal(z.station, 'v', 'a1 hat für gf nur zwei Schritte');
});

test('Ebene, Ansicht, Freischaltung, Kapitel, Bereich', () => {
  const z = anfangszustand();
  assert.equal(w(z, { art: 'setzeEbene', ebene: 3 }).ebene, 3);
  assert.equal(w(z, { art: 'setzeEbene', ebene: 5 }), z);
  assert.equal(w(z, { art: 'setzeEbene', ebene: 1.5 }), z);
  assert.deepEqual(w(z, { art: 'zeige', schluessel: 'b1/mandat', wert: '2' }).ansicht, { 'b1/mandat': '2' });
  assert.equal(w(z, { art: 'zeige', schluessel: '', wert: '2' }), z);
  assert.equal(w(z, { art: 'schalteFrei', was: 'explore' }).freigeschaltet.explore, true);
  const t = w(z, { art: 'oeffneKapitel', kapitel: 4 });
  assert.equal(t.bereich, 'theorie');
  assert.deepEqual(t.theorie, { kapitel: 4 });
  assert.equal(w(z, { art: 'oeffneKapitel', kapitel: 14 }), z);
  assert.equal(w(z, { art: 'wechsleBereich', bereich: 'explore' }).bereich, 'explore');
  assert.equal(w(z, { art: 'wechsleBereich', bereich: 'start' }), z);
});

test('notiere schreibt ins Regie-Protokoll; neustart behält Protokoll und Explore', () => {
  const z1 = spiele(w, anfangszustand(), [...BIS_ENTSCHEIDUNG, { art: 'schalteFrei', was: 'explore' }]);
  const z2 = w(z1, { art: 'notiere', text: '  Kunde fragt nach der Risikoreserve  ', zeit: 1000 });
  assert.deepEqual(z2.regie.protokoll, [{ nr: 1, station: 'a1', schritt: 2, text: 'Kunde fragt nach der Risikoreserve', zeit: 1000 }]);
  assert.equal(w(z2, { art: 'notiere', text: '   ', zeit: 1 }), z2);
  const z3 = w(z2, { art: 'neustart' });
  assert.equal(z3.station, null);
  assert.deepEqual(z3.spur, []);
  assert.equal(z3.freigeschaltet.explore, true);
  assert.equal(z3.regie.protokoll.length, 1);
});

/** Je Aktionsart ein Beispiel – der Typ erzwingt, dass keine Art fehlt. */
const BEISPIELE: Record<AktionsArt, Aktion> = {
  wechsleBereich: { art: 'wechsleBereich', bereich: 'theorie' },
  starteStory: { art: 'starteStory' },
  waehleRolle: { art: 'waehleRolle', rolle: 'pl' },
  setzeInteressen: { art: 'setzeInteressen', interessen: ['risiko'] },
  weiter: { art: 'weiter' },
  zurueck: { art: 'zurueck' },
  geheZu: { art: 'geheZu', station: 'a1', schritt: 1 },
  waehle: { art: 'waehle', option: 'B', zeit: 5 },
  antworte: { art: 'antworte', frage: 'reife', antwort: 'ja' },
  fordereInfo: { art: 'fordereInfo', info: 'info' },
  setzeVergleich: { art: 'setzeVergleich', wert: 0.5 },
  setzeEbene: { art: 'setzeEbene', ebene: 2 },
  zeige: { art: 'zeige', schluessel: 'x', wert: 'y' },
  schalteFrei: { art: 'schalteFrei', was: 'weltB' },
  oeffneKapitel: { art: 'oeffneKapitel', kapitel: 2 },
  notiere: { art: 'notiere', text: 'Notiz', zeit: 7 },
  neustart: { art: 'neustart' },
};

test('jede Aktion liefert aus jedem Zwischenstand einen formgültigen Zustand, ohne die Eingabe zu verändern', () => {
  const staende: Zustand[] = [];
  let z = friere(anfangszustand());
  staende.push(z);
  for (const a of [...BIS_ENTSCHEIDUNG, { art: 'waehle', option: 'A' } as Aktion, { art: 'weiter' } as Aktion, { art: 'weiter' } as Aktion, { art: 'weiter' } as Aktion]) {
    z = friere(w(z, a));
    staende.push(z);
  }
  for (const s of staende) {
    for (const a of Object.values(BEISPIELE)) {
      const vorher = JSON.stringify(s);
      const nach = w(s, a); // s ist eingefroren: jede Veränderung würfe
      assert.equal(JSON.stringify(s), vorher);
      assert.notEqual(pruefeZustand(JSON.parse(JSON.stringify(nach))), null, `${a.art} aus ${s.station ?? 'Start'}/${s.schritt}`);
    }
  }
});

test('Determinismus: dieselbe Aktionsfolge ergibt denselben Zustand', () => {
  const folge: Aktion[] = [...BIS_ENTSCHEIDUNG, { art: 'waehle', option: 'D', zeit: 1 }, { art: 'weiter' }, { art: 'weiter' },
    { art: 'setzeVergleich', wert: 0.6 }, { art: 'weiter' }, { art: 'antworte', frage: 'reife', antwort: 'ja' }, { art: 'notiere', text: 'x', zeit: 2 }];
  const a = spiele(w, anfangszustand(), folge);
  const b = spiele(binde(testModell()), anfangszustand(), folge);
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

test('oeffentlich(): kein Regie-Material, nur die aufgezählten Felder, Kopie statt Verweis', () => {
  const z = spiele(w, anfangszustand(), [...BIS_ENTSCHEIDUNG, { art: 'notiere', text: 'GEHEIME REGIE-NOTIZ', zeit: 1 }]);
  const oe = oeffentlich(z);
  assert.equal('regie' in oe, false);
  assert.equal(JSON.stringify(oe).includes('GEHEIME REGIE-NOTIZ'), false);
  assert.deepEqual(Object.keys(oe).sort(), [
    'ansicht', 'antworten', 'bereich', 'ebene', 'entscheidungen', 'freigeschaltet', 'info', 'interessen', 'rolle', 'schritt',
    'spur', 'station', 'status', 'theorie', 'verlauf', 'version', 'welt', 'vergleich',
  ].sort());
  assert.notEqual(oe.spur, z.spur);
  assert.deepEqual(pruefeOeffentlich(JSON.parse(JSON.stringify(oe))), oe);
  const mitRegie = pruefeOeffentlich({ ...JSON.parse(JSON.stringify(z)), extra: 1 });
  assert.equal(mitRegie !== null && 'regie' in mitRegie, false, 'Prüfung wirft Regie-Material und Fremdes weg');
  assert.equal(mitRegie !== null && 'extra' in mitRegie, false);
  assert.equal(pruefeOeffentlich(null), null);
  assert.equal(pruefeOeffentlich({ ...oe, version: 2 }), null);
  assert.equal(pruefeOeffentlich({ ...oe, welt: 'C' }), null);
});

test('oeffentlich()/pruefeOeffentlich(): auch verschachtelte Teile nur mit aufgezählten Feldern', () => {
  const z = spiele(w, anfangszustand(), [...BIS_ENTSCHEIDUNG, { art: 'waehle', option: 'B' }]);
  const roh = JSON.parse(JSON.stringify(oeffentlich(z))) as Record<string, unknown> & {
    spur: Record<string, unknown>[];
    status: { A: Record<string, unknown> & { hinweise: Record<string, unknown> } | null };
    theorie: Record<string, unknown>;
    freigeschaltet: Record<string, unknown>;
  };
  assert.ok(roh.spur.length > 0 && roh.status.A !== null);
  roh.spur[0] = { ...roh.spur[0], notiz: 'GEHEIM-SPUR' };
  roh.status.A = { ...roh.status.A, leitfrage: 'GEHEIM-STATUS', hinweise: { ...roh.status.A.hinweise, fremd: 'GEHEIM-HINWEIS' } };
  roh.theorie = { ...roh.theorie, notiz: 'GEHEIM-THEORIE' };
  roh.freigeschaltet = { ...roh.freigeschaltet, notiz: 'GEHEIM-FREI' };
  const geprueft = pruefeOeffentlich(roh);
  // Fremde Hinweis-Schlüssel machen den Status ungültig; ohne sie wird der Rest bereinigt.
  assert.equal(geprueft, null);
  roh.status.A.hinweise = { ...(z.status.A?.hinweise ?? {}) };
  const sauber = pruefeOeffentlich(roh);
  assert.ok(sauber);
  assert.equal(JSON.stringify(sauber).includes('GEHEIM'), false, JSON.stringify(sauber));
  assert.deepEqual(Object.keys(sauber.spur[0] ?? {}).sort(), ['entscheidung', 'nr', 'option', 'rolle', 'station', 'wechsel', 'welt', 'zeit']);
  assert.deepEqual(Object.keys(sauber.status.A ?? {}).sort(), ['entscheidungsfaehigkeit', 'hinweise', 'kostenunsicherheit', 'offeneRisiken', 'terminrisiko', 'ungeklaerteEntscheidungen']);
  assert.deepEqual(Object.keys(sauber.theorie), ['kapitel']);
  assert.deepEqual(Object.keys(sauber.freigeschaltet).sort(), ['explore', 'weltB']);
  // Auch aus einem vollständigen Zustand mit Zusätzen gelangt nichts Fremdes in den Leinwand-Ausschnitt.
  const zMitZusatz = { ...z, spur: z.spur.map((e) => ({ ...e, notiz: 'GEHEIM' })) };
  assert.equal(JSON.stringify(oeffentlich(zMitZusatz)).includes('GEHEIM'), false);
});

function fakeSpeicher(): SpeicherGriff & { daten: Map<string, string> } {
  const daten = new Map<string, string>();
  return {
    daten,
    getItem: (k) => daten.get(k) ?? null,
    setItem: (k, v) => { daten.set(k, v); },
    removeItem: (k) => { daten.delete(k); },
  };
}

test('Weiterlesen: speichern und laden, Version und Form werden geprüft, Fehler werfen nie', () => {
  const s = fakeSpeicher();
  const z = spiele(w, anfangszustand(), [...BIS_ENTSCHEIDUNG, { art: 'waehle', option: 'B' }]);
  assert.equal(speichere(z, s), true);
  assert.deepEqual(lade(s), z);
  assert.deepEqual(lade(s, modell), z);
  s.daten.set(SPEICHER_SCHLUESSEL, JSON.stringify({ version: 2, zustand: z }));
  assert.equal(lade(s), null, 'andere Version');
  s.daten.set(SPEICHER_SCHLUESSEL, '{kaputt');
  assert.equal(lade(s), null, 'kaputtes JSON');
  s.daten.set(SPEICHER_SCHLUESSEL, JSON.stringify({ version: 1, zustand: { ...z, station: 'weg' } }));
  assert.equal(lade(s, modell), null, 'Station gibt es nicht mehr');
  assert.equal(vergiss(s), true);
  assert.equal(lade(s), null);
  const wirft: SpeicherGriff = {
    getItem: () => { throw new Error('gesperrt'); },
    setItem: () => { throw new Error('voll'); },
    removeItem: () => { throw new Error('gesperrt'); },
  };
  assert.equal(speichere(z, wirft), false);
  assert.equal(lade(wirft), null);
  assert.equal(vergiss(wirft), false);
  assert.equal(speichere(z, null), false);
  assert.equal(lade(null), null);
});

test('Status: Lesen, Anwenden, Begrenzen, Beschreiben', () => {
  assert.deepEqual(leseWirkEintrag('offene-risiken', '7 (1 neu bewertet)'), { ok: true, wert: { schluessel: 'offeneRisiken', art: 'setze', wert: 7, hinweis: '1 neu bewertet' } });
  assert.deepEqual(leseWirkEintrag('kostenunsicherheit', '+1'), { ok: true, wert: { schluessel: 'kostenunsicherheit', art: 'aendere', wert: 1, hinweis: null } });
  assert.deepEqual(leseWirkEintrag('terminrisiko', 'sehr hoch'), { ok: true, wert: { schluessel: 'terminrisiko', art: 'setze', wert: 'sehr hoch', hinweis: null } });
  assert.equal(leseWirkEintrag('terminrisiko', 'kritisch').ok, false);
  assert.equal(leseWirkEintrag('terminrisiko', '3').ok, false, 'Stufe verlangt');
  assert.equal(leseWirkEintrag('entscheidungsfaehigkeit', '6').ok, false);
  assert.equal(leseWirkEintrag('laune', '3').ok, false);
  const s = wendeWirkung(null, [
    { schluessel: 'entscheidungsfaehigkeit', art: 'aendere', wert: 9, hinweis: null },
    { schluessel: 'terminrisiko', art: 'aendere', wert: -5, hinweis: 'x' },
    { schluessel: 'offeneRisiken', art: 'aendere', wert: -3, hinweis: null },
  ]);
  assert.equal(s.entscheidungsfaehigkeit, 5);
  assert.equal(s.terminrisiko, 'niedrig');
  assert.equal(s.offeneRisiken, 0);
  assert.equal(s.hinweise.terminrisiko, 'x');
  assert.equal(STATUS_NEUTRAL.entscheidungsfaehigkeit, 3, 'Ausgangswert unverändert');
  const s2 = wendeWirkung(s, [{ schluessel: 'terminrisiko', art: 'setze', wert: 'hoch', hinweis: null }]);
  assert.equal(s2.hinweise.terminrisiko, undefined, 'neuer Wert ohne Hinweis löscht den alten');
  assert.deepEqual(statusAenderungen(s, s2), [{ schluessel: 'terminrisiko', von: 'niedrig', nach: 'hoch' }]);
  assert.equal(beschreibeStatus(s2)[0], 'Entscheidungsfähigkeit hoch (5 von 5)');
  assert.deepEqual(berechneStatus({ verlauf: [], rolle: null, entscheidungen: {}, info: [] }, modell), { A: null, B: null });
});

test('src/engine ist reine Logik: keine Plattform-API, keine Uhr, kein Zufall (docs/ARCHITEKTUR.md)', async () => {
  const { readdirSync, readFileSync } = await import('node:fs');
  const ordner = new URL('../src/engine/', import.meta.url);
  const dateien = readdirSync(ordner).filter((n) => n.endsWith('.ts'));
  assert.ok(dateien.length >= 6);
  for (const name of dateien) {
    // Kommentare zählen nicht (sie dürfen die Plattform erwähnen).
    const code = readFileSync(new URL(name, ordner), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
    assert.doesNotMatch(
      code,
      /\b(?:localStorage|sessionStorage|indexedDB|window|document|navigator|globalThis|location|fetch|Date\.now|new Date|performance\.now|Math\.random|setTimeout|requestAnimationFrame)\b/,
      `src/engine/${name} greift auf Plattform, Uhr oder Zufall zu`,
    );
  }
});
