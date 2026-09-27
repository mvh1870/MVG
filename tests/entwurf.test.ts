// Entscheidungsgraph (P1.4, L-20): der Entwurf unter entwurf/ ist mit dem vollen Graph-Prüfer fehlerfrei,
// jede Rolle kann an jeder Entscheidungsstation wählen, und jedes der drei Enden ist über eine Wahl in der
// Wirklichkeit erreichbar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pruefeEntwurf } from '../werkzeuge/entwurf.mjs';
import { wendeWirkung } from '../src/engine/status.ts';
import type { Status } from '../src/engine/typen.ts';

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
