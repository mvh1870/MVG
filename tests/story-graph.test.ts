// Entscheidungsgraph (P1.4, L-20; seit P5.10 in inhalte/, L-45): die Inhalte sind mit dem vollen Graph-Prüfer
// fehlerfrei, jede Rolle kann an jeder Entscheidungsstation wählen, und jedes der drei Enden ist über eine Wahl
// in der Wirklichkeit erreichbar. Bis P5.10 prüfte diese Datei (damals entwurf.test.ts) den Entwurf unter entwurf/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { kompiliere } from '../werkzeuge/inhalte.mjs';
import { ANPASSUNGEN, pruefeEntwurf } from '../werkzeuge/entwurf.mjs';
import { wendeWirkung } from '../src/engine/status.ts';
import type { Aktion, Status, StoryModell } from '../src/engine/typen.ts';
import { wende } from '../src/engine/aktionen.ts';
import { anfangszustand } from '../src/engine/zustand.ts';
import { aktuellerSchritt } from '../src/engine/graph.ts';
import { rueckbezug } from '../src/engine/gedaechtnis.ts';

const ROLLEN = ['gf', 'bauherr', 'pl', 'ps', 'planung', 'controlling'];
const erg = await kompiliere({ pruefe: true, ziel: null });

test('Inhalte: Graph, Form, Zitate, Begriffe und Abdeckung ohne Fehler und ohne Warnung', () => {
  assert.deepEqual(erg.fehler, []);
  assert.deepEqual(erg.warnungen, []);
});

test('Entwurfswerkzeug (L-45): ohne Entwürfe keine Anpassung, nichts überlagert, dasselbe Ergebnis wie inhalte/', async () => {
  assert.deepEqual(ANPASSUNGEN, [], 'die Express-Kanten stehen seit P5.10 fest in inhalte/');
  const e = await pruefeEntwurf();
  assert.deepEqual(e.fehler, []);
  assert.deepEqual(e.ueberlagert, [], 'entwurf/ enthält nur LIESMICH.md, die nicht überlagert wird');
  assert.deepEqual(Object.keys(e.inhalte.stationen).sort(), Object.keys(erg.inhalte.stationen).sort());
  assert.deepEqual(e.inhalte.stationsFolge, erg.inhalte.stationsFolge);
});

test('Graph: alle sechs Rollen spielbar, drei Enden, Epilog als Schluss, keine Vergleichsstation mehr', () => {
  const st = erg.inhalte.stationen;
  assert.deepEqual(Object.values(erg.inhalte.rollen).filter((r: any) => r.spielbar).map((r: any) => r.id).sort(), [...ROLLEN].sort());
  for (const e of ['ende-steuerbar', 'ende-auflagen', 'ende-neufestlegung']) {
    assert.equal(st[e]?.art, 'ende', e);
    assert.deepEqual(st[e]?.weiter.map((k: any) => k.ziel), ['epilog'], e);
  }
  assert.equal(st.epilog?.ende, true);
  assert.deepEqual(st.wirklichkeit?.weiter.map((k: any) => k.ziel), ['ende-steuerbar', 'ende-neufestlegung', 'ende-auflagen']);
  assert.equal(st['A3-B3-vergleich'], undefined, 'die Durchstich-Station ist entfallen (L-45)');
  assert.deepEqual(Object.values(st).filter((s: any) => s.art === 'vergleich'), []);
  // Welt B öffnet sich am Wendepunkt/Rückspulen (nicht mehr am Vergleich)
  const frei = Object.values(st).filter((s: any) => (s.schaltetFrei ?? []).includes('weltB')).map((s: any) => s.id).sort();
  assert.ok(frei.length > 0 && frei.every((id: string) => id === 'wendepunkt' || id === 'rueckspulen'), `schaltet frei: ${frei.join(', ')}`);
});

test('Graph: jede Rolle erreicht über die Wirklichkeit jedes Ende (A → steuerbar, B → Auflagen, C → Neufestlegung)', () => {
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

test('Graph mit dem Reducer durchgespielt: jede Rolle vom Prolog bis zum Epilog, jedes Ende, Rückbezüge in Welt B', () => {
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

test('Vertiefung je Interesse (P3.9): A1–A6 haben je eine Karte für Kosten, Mandate, Risiko und Freigaben, jede mit Zitat', () => {
  for (const id of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']) {
    const v = erg.inhalte.stationen[id]?.vertiefungen ?? [];
    assert.deepEqual(v.map((x: any) => x.interesse).sort(), ['freigaben', 'kosten', 'organisation', 'risiko'], id);
    for (const x of v) assert.match(x.html, /class="mvg-zitat" data-absatz="k/u, `${id}/${x.interesse}: ohne Zitat`);
  }
});

test('Wendepunkt-Radar (P4.7): jedes Symptom, das eine Station A1–A6 in ihrer Tabelle nennt, ist dort als erlebt eingetragen', async () => {
  const schritt = erg.inhalte.stationen.wendepunkt?.schritte.find((s: any) => s.id === 'symptome');
  const tafel = schritt?.bloecke.find((b: any) => b.art === 'tafel');
  assert.ok(tafel, 'Tafel im Schritt „symptome“');
  const zeilen: string[][] = tafel.kopf.tabelle.zeilen;
  const glatt = (t: string): string => t.replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/gu, '$1').replace(/-(?=[a-zäöü])/gu, '').toLowerCase();
  for (const id of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']) {
    const pfad = `inhalte/story/${id}/station.md`;
    const text = glatt(readFileSync(pfad, 'utf8'));
    zeilen.forEach((z, i) => {
      if (text.includes(`| ${glatt(z[0] ?? '')} |`)) assert.ok((tafel.kopf.erlebt[String(i + 1)] ?? []).includes(id), `${id} nennt „${z[0]}“, fehlt in erlebt.${i + 1}`);
    });
  }
});

test('Wendepunkt und Rückspulen zeigen keine Statusinstrumente (DREHBUCH: kein Status)', async () => {
  const { instrumenteSichtbar } = await import('../src/ui/anzeige.ts');
  const { oeffentlich } = await import('../src/engine/zustand.ts');
  for (const station of ['wendepunkt', 'rueckspulen']) {
    const z = { ...anfangszustand(), bereich: 'story' as const, rolle: 'pl', station, schritt: 1, spur: [{ station: 'A6', schritt: 0, text: 'x', zeit: 0 }] };
    assert.equal(instrumenteSichtbar(oeffentlich(z as any), erg.inhalte), false, station);
  }
});

test('Ihre Spur (E1, P5.8): Partner werden zu einer Zeile zusammengefasst, A links, B rechts, in Story-Reihenfolge', async () => {
  const { spurZeilen } = await import('../src/ui/leitstand/spur.ts');
  const e = (station: string, welt: 'A' | 'B', option: string, nr: number) => ({ nr, entscheidung: `${station}/pl`, station, welt, rolle: 'pl', option, wechsel: 0, zeit: null });
  const spur = [e('A1', 'A', 'A', 1), e('A3', 'A', 'B', 2), e('A3', 'A', 'C', 3), e('B1', 'B', 'B', 4), e('B4', 'B', 'A', 5)];
  const zeilen = spurZeilen(spur, erg.inhalte);
  assert.deepEqual(zeilen.map((z: any) => [z.station, z.a?.option ?? null, z.b?.option ?? null]), [['A1', 'A', 'B'], ['A3', 'C', null], ['A4', null, 'A']]);
});
