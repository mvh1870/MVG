// Governance-Fluss-Sandbox (P8.3, E5): Register und Status nur nach Kap. 6.4.3/6.4.4.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anfang, bericht, erlaubt, schritt, wirf, REGISTER } from '../src/engine/sandbox.ts';
import { inhalte } from '../src/inhalte/index.ts';

test('Frühwarnung → bestätigt → Risiko → Entscheidungsbedarf → Vorlage → Entschieden → Maßnahme (k6.4.3)', () => {
  let z = wirf(anfang(), 'fruehwarnung');
  assert.deepEqual(z.eintraege.map((e) => [e.kennung, e.status]), [['FRW-001', 'unbewertet']]);
  z = schritt(z, 'FRW-001', 'bestaetigen');
  assert.deepEqual(z.eintraege.map((e) => [e.kennung, e.status, e.aus]), [['FRW-001', 'bestätigt', null], ['RIS-001', 'aktiv', 'aus FRW-001']]);
  assert.deepEqual(erlaubt(z.eintraege[0]!), [], 'eine bestätigte Frühwarnung ist erledigt – keine Rückrichtung');
  z = schritt(z, 'RIS-001', 'entscheidungsbedarf');
  z = schritt(z, 'ENT-001', 'bearbeiten');
  z = schritt(z, 'ENT-001', 'entscheiden');
  assert.equal(z.eintraege.find((e) => e.kennung === 'ENT-001')?.status, 'In Bearbeitung', 'entscheiden erst nach der Vorlage');
  z = schritt(z, 'ENT-001', 'vorlegen');
  z = schritt(z, 'ENT-001', 'entscheiden');
  assert.deepEqual(z.eintraege.slice(-2).map((e) => [e.kennung, e.status]), [['ENT-001', 'Entschieden'], ['MAS-001', 'nachverfolgt']]);
});

test('Schwellenwertverletzung erzeugt eine neue Frühwarnung, keine Rückrichtung aus dem Risiko (k6.4.3-p2)', () => {
  let z = wirf(wirf(anfang(), 'fruehwarnung'), 'schwelle');
  assert.deepEqual(z.eintraege.map((e) => [e.kennung, e.register, e.aus]), [['FRW-001', 'fruehwarnung', null], ['FRW-002', 'fruehwarnung', 'CTC- oder Schwellenwertverletzung']]);
  z = schritt(z, 'FRW-001', 'bestaetigen');
  assert.ok(!erlaubt(z.eintraege.find((e) => e.kennung === 'RIS-001')!).includes('bestaetigen'));
});

test('Änderung: Beantragt → In Prüfung → Beschlossen → Umgesetzt; Problem: Maßnahme oder Entscheidung', () => {
  let z = wirf(anfang(), 'aenderung');
  for (const s of ['pruefen', 'beschliessen', 'umsetzen'] as const) z = schritt(z, 'AEN-001', s);
  assert.equal(z.eintraege[0]?.status, 'Umgesetzt');
  z = wirf(z, 'problem');
  assert.deepEqual(erlaubt(z.eintraege[1]!), ['massnahme', 'entscheidungsbedarf']);
  z = schritt(z, 'PRB-001', 'massnahme');
  assert.equal(z.eintraege[2]?.kennung, 'MAS-001');
  assert.equal(schritt(z, 'AEN-001', 'pruefen'), z, 'nicht erlaubter Schritt ändert nichts');
});

test('Statusbegriffe stehen wortgleich in k6.4.4-p1, Register in k6.4.4-t1; Managementbericht aggregiert', () => {
  const p1 = (inhalte.quellen['k6.4.4-p1']?.html ?? '').replace(/<[^>]+>/g, '');
  for (const s of ['Offen', 'In Bearbeitung', 'Entscheidungsreif', 'Entschieden', 'Verworfen', 'aktiv', 'beobachtet', 'gemindert', 'geschlossen', 'Beantragt', 'In Prüfung', 'Beschlossen', 'Abgelehnt', 'Umgesetzt']) assert.ok(p1.includes(s), s);
  const t1 = (inhalte.quellen['k6.4.4-t1']?.html ?? '').replace(/<[^>]+>/g, ' ');
  for (const r of Object.values(REGISTER).filter((x) => x.quelle === 'k6.4.4-t1')) for (const teil of [r.name, r.bedeutung, r.weiter]) assert.ok(t1.includes(teil), teil);
  let z = wirf(wirf(anfang(), 'fruehwarnung'), 'fruehwarnung');
  z = schritt(z, 'FRW-001', 'bestaetigen');
  assert.deepEqual(bericht(z), [{ register: 'fruehwarnung', status: { bestätigt: 1, unbewertet: 1 } }, { register: 'risiko', status: { aktiv: 1 } }]);
});
