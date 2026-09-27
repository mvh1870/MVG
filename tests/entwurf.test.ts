// Entscheidungsgraph (P1.4, L-20): der Entwurf unter entwurf/ ist mit dem vollen Graph-Prüfer fehlerfrei,
// jede Rolle kann an jeder Entscheidungsstation wählen, und jedes der drei Enden ist über eine Wahl in der
// Wirklichkeit erreichbar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pruefeEntwurf } from '../werkzeuge/entwurf.mjs';
import { wendeWirkung } from '../src/engine/status.ts';
import type { Aktion, Status, StoryModell } from '../src/engine/typen.ts';
import { wende } from '../src/engine/aktionen.ts';
import { anfangszustand } from '../src/engine/zustand.ts';
import { aktuellerSchritt } from '../src/engine/graph.ts';
import { rueckbezug } from '../src/engine/gedaechtnis.ts';

const ROLLEN = ['gf', 'bauherr', 'pl', 'ps', 'planung', 'controlling'];
const erg = await pruefeEntwurf();

test('Entwurf: Graph, Form, Zitate, Begriffe und Abdeckung ohne Fehler', () => {
  assert.deepEqual(erg.fehler, []);
});

test('Entwurf: alle sechs Rollen spielbar, drei Enden, Epilog als Schluss', () => {
  const st = erg.inhalte.stationen;
  assert.deepEqual(Object.values(erg.inhalte.rollen).filter((r: any) => r.spielbar).map((r: any) => r.id).sort(), [...ROLLEN].sort());
  for (const e of ['ende-steuerbar', 'ende-auflagen', 'ende-neufestlegung']) {
    assert.equal(st[e]?.art, 'ende', e);
    assert.deepEqual(st[e]?.weiter.map((k: any) => k.ziel), ['epilog'], e);
  }
  assert.equal(st.epilog?.ende, true);
  assert.deepEqual(st.wirklichkeit?.weiter.map((k: any) => k.ziel), ['ende-steuerbar', 'ende-neufestlegung', 'ende-auflagen']);
});

test('Entwurf: jede Rolle erreicht über die Wirklichkeit jedes Ende (A → steuerbar, B → Auflagen, C → Neufestlegung)', () => {
  const szenen = erg.inhalte.stationen.wirklichkeit.szenen;
  // Kanten der Wirklichkeit (L-20): EF ≥ 3 → steuerbar; Kostenunsicherheit sehr hoch → Neufestlegung; sonst Auflagen
  const ende = (s: Status): string => (s.entscheidungsfaehigkeit >= 3 ? 'ende-steuerbar' : s.kostenunsicherheit === 'sehr hoch' ? 'ende-neufestlegung' : 'ende-auflagen');
  const a6 = wendeWirkung(null, erg.inhalte.stationen.A6.statusStart);
  const soll: Record<string, string> = { A: 'ende-steuerbar', B: 'ende-auflagen', C: 'ende-neufestlegung' };
  for (const r of ROLLEN) {
    const opt = szenen[r]?.entscheidung?.optionen ?? [];
    assert.deepEqual(opt.map((o: any) => o.id), ['A', 'B', 'C'], r);
    for (const o of opt) {
      for (const vorher of [a6, wendeWirkung(null, [])]) assert.equal(ende(wendeWirkung(vorher, o.wirkung)), soll[o.id], `${r}/${o.id}`);
    }
  }
});

test('Entwurf mit dem Reducer durchgespielt: jede Rolle vom Prolog bis zum Epilog, jedes Ende, Rückbezüge in Welt B', () => {
  const m = erg.inhalte as StoryModell;
  const soll: Record<string, string> = { A: 'ende-steuerbar', B: 'ende-auflagen', C: 'ende-neufestlegung' };
  for (const r of ROLLEN) {
    for (const [wahl, ende] of Object.entries(soll)) {
      let z = anfangszustand();
      const tu = (a: Aktion): void => { z = wende(z, a, m); };
      tu({ art: 'starteStory' });
      tu({ art: 'waehleRolle', rolle: r });
      const besucht: string[] = [];
      let rueckbezuege = 0;
      for (let i = 0; i < 2000; i++) {
        const st = z.station;
        if (st !== null && besucht[besucht.length - 1] !== st) besucht.push(st);
        const s = aktuellerSchritt(z, m);
        if (s?.art === 'entscheidung' && st !== null) {
          const ent = m.stationen[st]?.szenen[r]?.entscheidung;
          if (ent !== undefined && ent !== null && z.entscheidungen[ent.id] === undefined) tu({ art: 'waehle', option: st === 'wirklichkeit' ? wahl : 'A' });
        }
        if (s?.art === 'rueckbezug' && rueckbezug(z, m)?.option !== undefined) rueckbezuege += 1;
        const vorher = z;
        tu({ art: 'weiter' });
        if (z === vorher) break; // Ende erreicht (oder festgefahren – die Prüfung unten sagt, welches)
      }
      assert.equal(besucht[besucht.length - 1], 'epilog', `${r}/${wahl}: endet im Epilog, nicht in ${besucht[besucht.length - 1]}`);
      assert.ok(besucht.includes(ende), `${r}/${wahl}: Ende ${ende} (Weg: ${besucht.join(' → ')})`);
      for (const n of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'wendepunkt', 'rueckspulen', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'wirklichkeit']) assert.ok(besucht.includes(n), `${r}/${wahl}: ${n} besucht`);
      assert.ok(rueckbezuege >= 6, `${r}/${wahl}: Rückbezüge in Welt B greifen (${rueckbezuege})`);
      assert.ok(z.status.A !== null && z.status.B !== null);
    }
  }
});

test('Express-Pfad (E8, L-26): Interesse „express“ führt über A3, A6, Wendepunkt, B3, B6 zur Wirklichkeit – für jede Rolle', () => {
  const m = erg.inhalte as StoryModell;
  for (const r of ROLLEN) {
    let z = anfangszustand();
    const tu = (a: Aktion): void => { z = wende(z, a, m); };
    tu({ art: 'starteStory' });
    tu({ art: 'waehleRolle', rolle: r });
    tu({ art: 'setzeInteressen', interessen: ['express'] });
    const besucht: string[] = [];
    for (let i = 0; i < 1000; i++) {
      const st = z.station;
      if (st !== null && besucht[besucht.length - 1] !== st) besucht.push(st);
      const s = aktuellerSchritt(z, m);
      if (s?.art === 'entscheidung' && st !== null) {
        const ent = m.stationen[st]?.szenen[r]?.entscheidung;
        if (ent !== undefined && ent !== null && z.entscheidungen[ent.id] === undefined) tu({ art: 'waehle', option: 'A' });
      }
      const vorher = z;
      tu({ art: 'weiter' });
      if (z === vorher) break;
    }
    assert.deepEqual(besucht, ['prolog', 'A3', 'A6', 'wendepunkt', 'rueckspulen', 'B3', 'B6', 'wirklichkeit', 'ende-steuerbar', 'epilog'], r);
  }
});

test('Story-Karte (stationsFolge): Hauptweg in Reihenfolge, Enden hinter der Wirklichkeit, Epilog zuletzt', () => {
  assert.deepEqual(erg.inhalte.stationsFolge, ['prolog', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'wendepunkt', 'rueckspulen',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'wirklichkeit', 'ende-steuerbar', 'ende-neufestlegung', 'ende-auflagen', 'epilog']);
});
