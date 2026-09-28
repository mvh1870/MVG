// Szenario-Simulator (P8.1): Regeln aus dem Whitepaper – Mandatsleiter, nicht delegierbare Entscheidungen,
// Informationsbedarf, Freigabeweg; jede Aussage mit Absatz-ID aus dem Quellenfenster.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simuliere, stufeNachBetrag, SIM_QUELLEN, type SimEingabe } from '../src/engine/simulator.ts';
import { inhalte } from '../src/inhalte/index.ts';

const basis: SimEingabe = { betragTeur: 50, deckung: 'budget', terminWochen: 0, schwelleUeberschritten: false, zielkonflikt: false, risikoAnnahme: false, substanziell: false, freigabeBeruehrt: false, datenstandBenannt: true, status: 'offen' };
const alle = (e: ReturnType<typeof simuliere>) => [...e.eskalation, ...e.bauherr, ...e.information, ...e.freigabeweg, ...e.naechsterSchritt];

test('Mandatsleiter (k4.2-p3): Grenzen einschließlich 100 TEUR und 5 Mio. EUR', () => {
  assert.equal(stufeNachBetrag(0), 'pl');
  assert.equal(stufeNachBetrag(100), 'pl');
  assert.equal(stufeNachBetrag(100.5), 'gremium');
  assert.equal(stufeNachBetrag(5000), 'gremium');
  assert.equal(stufeNachBetrag(5001), 'bauherr');
  assert.equal(simuliere({ ...basis, betragTeur: 400 }).wer, 'Änderungsgremium');
  assert.equal(simuliere({ ...basis, betragTeur: 6000 }).wer, 'Bauherr im Lenkungskreis');
});

test('Nicht delegierbar (k3.2-t1): Risikoreserve, Projektbasis, Zielpriorität heben auf den Bauherrn – auch bei kleinem Betrag', () => {
  const r = simuliere({ ...basis, deckung: 'reserve' });
  assert.equal(r.stufe, 'bauherr');
  assert.equal(r.wer, 'Bauherr');
  assert.ok(r.bauherr.some((h) => h.quelle === 'k3.2-t1' && /Risikoreserve/u.test(h.text)));
  const p = simuliere({ ...basis, deckung: 'ueber-basis' });
  assert.equal(p.wer, 'Bauherr im Lenkungskreis');
  assert.ok(p.bauherr.some((h) => h.quelle === 'k13-t1' && /außerhalb der regulären Freigabereihe/u.test(h.text)));
  assert.equal(simuliere({ ...basis, zielkonflikt: true }).stufe, 'bauherr');
  assert.equal(simuliere({ ...basis, risikoAnnahme: true }).bauherr[0]?.quelle, 'k4.4-p1');
  // Bauherr im Lenkungskreis bleibt, wenn zusätzlich die Reserve berührt ist
  assert.equal(simuliere({ ...basis, betragTeur: 7000, deckung: 'reserve' }).wer, 'Bauherr im Lenkungskreis');
  // überschrittene Schwelle: nicht mehr „innerhalb des Mandats“ (k6.4.5-p1)
  const s = simuliere({ ...basis, schwelleUeberschritten: true });
  assert.equal(s.wer, 'Eskalation nach dem projektspezifischen Mandat');
  assert.ok(!s.freigabeweg.some((h) => /Innerhalb des Mandats/u.test(h.text)));
  assert.equal(s.stufeOffen, true);
  const g = simuliere({ ...basis, betragTeur: 400, schwelleUeberschritten: true });
  assert.equal(g.wer, 'Eskalation nach dem projektspezifischen Mandat', 'auch auf Gremiumsstufe');
  assert.ok(g.eskalation.some((h) => h.quelle === 'k3.2-t1'));
  assert.equal(simuliere({ ...basis, schwelleUeberschritten: true, deckung: 'reserve' }).stufeOffen, false, 'nicht delegierbar entscheidet der Bauherr');
});

test('Wesentlich (k4.3): Kennung und Vorlage, sonst der Hinweis, dass nicht jede Entscheidung wesentlich ist', () => {
  assert.equal(simuliere(basis).wesentlich, false);
  assert.equal(simuliere(basis).information[0]?.quelle, 'k4.3-p1');
  const w = simuliere({ ...basis, substanziell: true });
  assert.equal(w.wesentlich, true);
  assert.equal(w.information[0]?.quelle, 'k4.3-p2');
  assert.equal(simuliere({ ...basis, deckung: 'reserve' }).wesentlich, true, 'nicht delegierbar heißt wesentlich');
});

test('Datenstand, Freigabeweg, Termin ohne erfundene Schwelle', () => {
  assert.ok(simuliere({ ...basis, datenstandBenannt: false }).information.some((h) => h.quelle === 'k4.6-p2'));
  const f = simuliere({ ...basis, freigabeBeruehrt: true });
  assert.ok(f.freigabeweg.some((h) => h.quelle === 'k9.3-p3' && /erteilt der Bauherr selbst/u.test(h.text)));
  const t = simuliere({ ...basis, terminWochen: 6 });
  assert.equal(t.stufe, 'pl', 'Terminwirkung allein hebt die Stufe nicht');
  assert.ok(t.eskalation.some((h) => h.quelle === 'k6.4.5-p1' && /keine allgemeine Schwelle/u.test(h.text)));
  assert.equal(simuliere({ ...basis, status: 'entscheidungsreif', betragTeur: 300 }).naechsterSchritt[0]?.text, 'Status „Entscheidungsreif“: ausreichend vorbereitet, um auf der zuständigen Mandatsebene getroffen zu werden – hier Änderungsgremium.');
});

test('Jede Regel zitiert einen Absatz aus dem Quellenfenster', () => {
  for (const id of SIM_QUELLEN) assert.ok(inhalte.quellen[id] !== undefined, `${id} fehlt in inhalte.quellen`);
  const varianten: SimEingabe[] = [basis, { ...basis, deckung: 'reserve', zielkonflikt: true, risikoAnnahme: true, freigabeBeruehrt: true, datenstandBenannt: false, schwelleUeberschritten: true, status: 'entscheidungsreif' }, { ...basis, deckung: 'ueber-basis', terminWochen: 3, status: 'entschieden' }, { ...basis, status: 'in-bearbeitung' }];
  for (const v of varianten) for (const h of alle(simuliere(v))) assert.ok((SIM_QUELLEN as readonly string[]).includes(h.quelle), h.quelle);
});

test('Grenzfälle: kein Betrag, Freigabe bei Bauherrenstufe', () => {
  assert.equal(stufeNachBetrag(Number.NaN), 'pl');
  assert.equal(simuliere({ ...basis, betragTeur: Number.NaN }).wer, 'Bauherren-PL');
  const f = simuliere({ ...basis, betragTeur: 8000, freigabeBeruehrt: true });
  assert.equal(f.wer, 'Bauherr im Lenkungskreis');
  assert.ok(f.freigabeweg.some((h) => h.quelle === 'k9.3-p3'));
  assert.ok(!simuliere({ ...basis, betragTeur: 8000 }).freigabeweg.some((h) => /Innerhalb des Mandats/u.test(h.text)), 'Bauherrenstufe ist nicht „innerhalb des Mandats“');
});
