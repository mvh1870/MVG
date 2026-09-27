/*
 * Graph, Bedingungen und Entscheidungsgedächtnis (P0.5) – am Testmodell und an den echten Inhalten
 * (Express-Pfad A3 → A6 → Wendepunkt → Rückspulen → B3, Rolle Bauherren-PL).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

import type { Aktion, Bedingung, StoryModell, Zustand } from '../src/engine/typen.ts';
import { binde, wende } from '../src/engine/aktionen.ts';
import { anfangszustand } from '../src/engine/zustand.ts';
import { entscheidungsSchluessel, leseBedingung, leseBedingungen, pruefeBedingung } from '../src/engine/bedingungen.ts';
import { erreichbar, naechsteStation, pruefeGraph, schritteFuer, stationsFolge } from '../src/engine/graph.ts';
import { fruehereWahl, rueckbezug } from '../src/engine/gedaechtnis.ts';
import { kompiliere } from '../werkzeuge/inhalte.mjs';
import type { Inhalte } from '../src/inhalte/typen.ts';
import { spiele, testModell } from './engine-modell.test.ts';

function lies(text: string): Bedingung {
  const e = leseBedingung(text);
  if (!e.ok) throw new Error(e.fehler);
  return e.wert;
}

const basis = (): Zustand => ({
  ...anfangszustand(),
  rolle: 'pl',
  welt: 'A',
  entscheidungen: { 'a1/pl': 'A' },
  antworten: { 'b1/pl/reife': 'nein' },
  interessen: ['kosten'],
  info: ['a1/info'],
  verlauf: ['p', 'a1'],
  freigeschaltet: { weltB: true, explore: false },
  status: {
    A: { entscheidungsfaehigkeit: 2, kostenunsicherheit: 'hoch', offeneRisiken: 7, ungeklaerteEntscheidungen: 3, terminrisiko: 'mittel', hinweise: {} },
    B: null,
  },
});

test('Bedingungen: Textform wird gelesen und gegen den Zustand ausgewertet', () => {
  const z = basis();
  const m = testModell();
  const wahr = [
    'wahl a1 = A', 'wahl a1 = B|A', 'wahl a1/pl = A', 'wahl a1 != C', 'antwort b1/reife = nein', 'antwort b1/pl/reife = nein',
    'rolle = pl', 'rolle != gf', 'welt = A', 'interesse kosten', 'info a1/info', 'besucht a1', 'freigeschaltet welt-b',
    'status A kostenunsicherheit >= hoch', 'status A kostenunsicherheit < sehr hoch', 'status A offene-risiken = 7',
    'status A entscheidungsfaehigkeit <= 2', 'nicht wahl a1 = B', 'nicht freigeschaltet explore', 'nicht besucht b1',
  ];
  for (const t of wahr) assert.equal(pruefeBedingung(lies(t), z, m), true, t);
  const falsch = ['wahl a1 = B', 'rolle = gf', 'welt = B', 'interesse risiko', 'status A terminrisiko > mittel', 'status B terminrisiko = mittel', 'nicht rolle = pl', 'wahl x9 = A'];
  for (const t of falsch) assert.equal(pruefeBedingung(lies(t), z, m), false, t);
  const alle = leseBedingungen(['rolle = pl', 'wahl a1 = A'], 'alle');
  const eine = leseBedingungen(['rolle = gf', 'wahl a1 = A'], 'eine');
  assert.ok(alle.ok && pruefeBedingung(alle.wert, z));
  assert.ok(eine.ok && pruefeBedingung(eine.wert, z));
  const keine = leseBedingungen(['rolle = gf', 'wahl a1 = A'], 'alle');
  assert.ok(keine.ok && !pruefeBedingung(keine.wert, z));
  for (const t of ['wetter = gut', 'status C terminrisiko = hoch', 'status A terminrisiko >= 3', 'status A laune = 1', 'wahl a1 =', 'rolle = ä']) {
    assert.equal(leseBedingung(t).ok, false, t);
  }
  assert.equal(entscheidungsSchluessel('A3', 'pl'), 'A3/pl');
  assert.equal(entscheidungsSchluessel('A3/ps', 'pl'), 'A3/ps');
});

test('Graph: Schrittfolge je Rolle, nächste Station mit Bedingung, Reihenfolge', () => {
  const m = testModell();
  const a1 = m.stationen['a1'];
  const b1 = m.stationen['b1'];
  assert.ok(a1 !== undefined && b1 !== undefined);
  assert.deepEqual(schritteFuer(a1, 'pl').map((s) => s.id), ['einstieg', 'lage', 'entscheidung', 'konsequenz']);
  assert.deepEqual(schritteFuer(a1, 'gf').map((s) => s.id), ['einstieg', 'lage']);
  assert.deepEqual(schritteFuer(a1, null).map((s) => s.id), ['einstieg', 'lage']);
  assert.deepEqual(schritteFuer(b1, 'pl').map((s) => s.id), ['signal', 'vorlage', 'rueckbezug']);
  assert.deepEqual(schritteFuer(b1, 'gf').map((s) => s.id), ['signal', 'vorlage']);
  a1.weiter = [{ ziel: 'b1', wenn: lies('wahl a1 = D') }, { ziel: 'v', wenn: null }];
  assert.equal(naechsteStation(a1, basis(), m), 'v');
  assert.equal(naechsteStation(a1, { ...basis(), entscheidungen: { 'a1/pl': 'D' } }, m), 'b1');
  assert.equal(naechsteStation(b1, basis(), m), null, 'Ende');
  b1.weiter = [{ ziel: 'a1', wenn: null }];
  assert.equal(naechsteStation(b1, basis(), m), null, 'ein Ende hält an, auch wenn es Kanten hat');
  assert.deepEqual(stationsFolge(testModell()), ['p', 'a1', 'v', 'b1']);
});

test('Graph-Prüfung: Testmodell ist sauber; jede Verletzung wird benannt', () => {
  assert.deepEqual(pruefeGraph(testModell()), { fehler: [], warnungen: [] });
  const faelle: [string, (m: StoryModell) => void, RegExp][] = [
    ['Sackgasse', (m) => { (m.stationen['a1'] as { weiter: unknown[] }).weiter = []; }, /a1 ist eine Sackgasse/u],
    ['unerreichbar', (m) => { m.stationen['x'] = { ...(m.stationen['b1'] as StoryModell['stationen'][string]), id: 'x', szenen: {} }; }, /Station x ist vom Start \(p\) nicht erreichbar/u],
    ['Folgestation fehlt', (m) => { (m.stationen['v'] as { weiter: unknown[] }).weiter = [{ ziel: 'nix', wenn: null }]; }, /Folgestation „nix“ existiert nicht/u],
    ['Welt B ohne Freischaltung', (m) => { (m.stationen['v'] as { schaltetFrei: string[] }).schaltetFrei = []; }, /b1 \(Welt B\) ist erreichbar, bevor Welt B freigeschaltet wird/u],
    ['Rolle ohne Szene', (m) => { m.rollen['gf'] = { id: 'gf', spielbar: true }; }, /spielbare Rolle gf hat keine Szene mit Entscheidung/u],
    ['Rückbezug fehlt', (m) => { delete (m.stationen['b1']?.szenen['pl']?.rueckbezug?.texte as Record<string, string>)['C']; }, /Rückbezug für Option C von a1\/pl fehlt/u],
    ['Rückbezug ins Leere', (m) => { (m.stationen['b1']?.szenen['pl']?.rueckbezug as { auf: string }).auf = 'zz/pl'; }, /Rückbezug auf unbekannte Entscheidung/u],
    ['kein Ende', (m) => { (m.stationen['b1'] as { ende: boolean; weiter: unknown[] }).ende = false; (m.stationen['b1'] as { weiter: unknown[] }).weiter = [{ ziel: 'p', wenn: null }]; }, /kein Ende/u],
    ['Partner in derselben Welt', (m) => { (m.stationen['a1'] as { partner: string }).partner = 'a1'; }, /Partner „a1“ liegt in derselben Welt/u],
  ];
  for (const [name, verderbe, erwartet] of faelle) {
    const m = testModell();
    verderbe(m);
    const g = pruefeGraph(m);
    assert.ok(g.fehler.some((f) => erwartet.test(f)), `${name}: ${JSON.stringify(g.fehler)}`);
  }
  const bedingt = testModell();
  (bedingt.stationen['a1'] as { weiter: unknown[] }).weiter = [{ ziel: 'v', wenn: lies('rolle = pl') }];
  assert.ok(pruefeGraph(bedingt).warnungen.some((x) => /alle Kanten haben Bedingungen/u.test(x)));
  assert.deepEqual(erreichbar(testModell(), 'p', (st) => st.id === 'a1'), ['p', 'a1']);
});

test('Gedächtnis (Testmodell): für jede Option A–D der passende Rückbezug, sonst „ohne“', () => {
  const m = testModell();
  const w = binde(m);
  const bisA1: Aktion[] = [{ art: 'starteStory' }, { art: 'waehleRolle', rolle: 'pl' }, { art: 'weiter' }, { art: 'weiter' }, { art: 'weiter' }, { art: 'weiter' }];
  for (const option of ['A', 'B', 'C', 'D']) {
    const z = spiele(w, anfangszustand(), [...bisA1, { art: 'waehle', option }, { art: 'weiter' }, { art: 'weiter' }, { art: 'weiter' }, { art: 'weiter' }, { art: 'weiter' }]);
    assert.equal(z.station, 'b1');
    const rb = rueckbezug(z, m);
    assert.deepEqual(rb, { html: `<p>zu ${option}</p>`, option, kurz: m.stationen['a1']?.szenen['pl']?.entscheidung?.optionen.find((o) => o.id === option)?.kurz ?? null, entscheidung: 'a1/pl' });
    assert.equal(fruehereWahl(z, m, 'a1')?.option.id, option);
  }
  const ohne = spiele(w, anfangszustand(), [{ art: 'schalteFrei', was: 'weltB' }, { art: 'waehleRolle', rolle: 'pl' }, { art: 'geheZu', station: 'b1' }]);
  assert.equal(rueckbezug(ohne, m)?.html, '<p>ohne Wahl</p>');
  assert.equal(rueckbezug(ohne, m)?.option, null);
  assert.equal(rueckbezug({ ...ohne, rolle: 'gf' }, m), null, 'keine Szene, kein Rückbezug');
  assert.equal(rueckbezug({ ...ohne, station: 'a1' }, m), null);
  assert.equal(fruehereWahl(ohne, m, 'a1'), null);
});

const WP = new URL('../quellen/whitepaper/v1.2/whitepaper.json', import.meta.url);

test('Gedächtnis (echte Inhalte A3 → B3, Bauherren-PL): jede Wahl A–D wird in Welt B passend zitiert', { skip: existsSync(WP) ? false : 'whitepaper.json fehlt' }, async () => {
  const { fehler, inhalte } = await kompiliere({ pruefe: true, ziel: null });
  assert.deepEqual(fehler, [], 'die Inhalte sind fehlerfrei');
  const m = inhalte as Inhalte;
  const a3 = m.stationen['A3'];
  assert.ok(a3 !== undefined);
  const optionen = a3.szenen['pl']?.entscheidung?.optionen ?? [];
  assert.deepEqual(optionen.map((o) => o.id), ['A', 'B', 'C', 'D']);
  for (const o of optionen) {
    let z = anfangszustand();
    const schritt = (a: Aktion): void => { z = wende(z, a, m); };
    schritt({ art: 'starteStory' });
    schritt({ art: 'waehleRolle', rolle: 'pl' });
    // Express-Pfad (E8, L-26): Prolog → A3 → A6 → Wendepunkt → Rückspulen → B3
    schritt({ art: 'setzeInteressen', interessen: ['express'] });
    for (let i = 0; i < 50 && z.station !== 'A3'; i++) schritt({ art: 'weiter' });
    assert.equal(z.station, 'A3', 'der Prolog führt im Express nach A3');
    for (let i = 0; i < 10 && m.stationen['A3']?.schritte[z.schritt]?.art !== 'entscheidung'; i++) schritt({ art: 'weiter' });
    schritt({ art: 'waehle', option: o.id });
    const ort = (): string | null => z.station; // z ändert sich im Abschluss – nicht verengen lassen
    for (let i = 0; i < 200 && !(ort() === 'B3' && m.stationen['B3']?.schritte[z.schritt]?.art === 'rueckbezug'); i++) {
      // an der nächsten Entscheidung (A6) wählt die PL „A“ – sie darf den Rückbezug in B3 nicht verändern
      const hier = ort();
      const ent = hier !== null && hier !== 'A3' && m.stationen[hier]?.schritte[z.schritt]?.art === 'entscheidung' ? m.stationen[hier]?.szenen['pl']?.entscheidung : undefined;
      if (ent && z.entscheidungen[ent.id] === undefined) schritt({ art: 'waehle', option: 'A' });
      schritt({ art: 'weiter' });
    }
    assert.equal(ort(), 'B3');
    const rb = rueckbezug(z, m);
    assert.equal(rb?.option, o.id);
    assert.equal(rb?.html, m.stationen['B3']?.szenen['pl']?.rueckbezug?.texte[o.id]);
    assert.ok(rb?.html.includes(`‚${o.kurz}‘`), `Rückbezug zu ${o.id} nennt die Wahl „${o.kurz}“`);
    const inA3 = z.spur.filter((e) => e.station === 'A3');
    assert.equal(inA3.length, 1, 'genau eine Wahl in A3 auf der Spur');
    assert.equal(inA3[0]?.option, o.id);
  }
});
