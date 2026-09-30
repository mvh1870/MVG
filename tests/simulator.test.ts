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

test('Nicht delegierbar (k3.2-t1): Projektbasis hebt auf den Bauherrn, Risikoreserve und Zielpriorität bleiben beim Bauherrn neben der Sachentscheidung (R40)', () => {
  const r = simuliere({ ...basis, deckung: 'reserve' });
  assert.equal(r.stufe, 'pl');
  assert.equal(r.wer, 'Bauherren-PL');
  assert.deepEqual(r.vorbehalte, ['die Freigabe des Einsatzes der Risikoreserve erteilt der Bauherr']);
  assert.ok(r.bauherr.some((h) => h.quelle === 'k3.2-t1' && /Risikoreserve/u.test(h.text)));
  const p = simuliere({ ...basis, deckung: 'ueber-basis' });
  assert.equal(p.wer, 'Bauherr im Lenkungskreis');
  assert.ok(p.bauherr.some((h) => h.quelle === 'k13-t1' && /außerhalb der regulären Freigabereihe/u.test(h.text)));
  assert.equal(simuliere({ ...basis, zielkonflikt: true }).stufe, 'pl');
  // R40 (Story B4 „Zwei Fragen, zwei Stufen“): 400 TEUR aus der Reserve – die Änderung beim Gremium, die Reserve-Freigabe beim Bauherrn
  const b4 = simuliere({ ...basis, betragTeur: 400, deckung: 'reserve', zielkonflikt: true, status: 'entscheidungsreif' });
  assert.equal(b4.wer, 'Änderungsgremium');
  assert.match(b4.naechsterSchritt[0]?.text ?? '', /hier Änderungsgremium; die Freigabe des Einsatzes der Risikoreserve erteilt der Bauherr; die Zielpriorität legt der Bauherr fest\.$/u);
  assert.ok(b4.freigabeweg.some((h) => h.quelle === 'k3.2-t1' && /Sachentscheidung; die Freigabe des Einsatzes der Risikoreserve und die Festlegung der Zielpriorität sind nicht delegierbar/u.test(h.text)));
  assert.ok(!b4.freigabeweg.some((h) => /Innerhalb des Mandats/u.test(h.text)));
  assert.ok(!simuliere({ ...basis, deckung: 'reserve' }).freigabeweg.some((h) => /Innerhalb des Mandats/u.test(h.text)), 'Reserve ist nicht „innerhalb des Mandats“');
  assert.equal(simuliere({ ...basis, risikoAnnahme: true }).bauherr[0]?.quelle, 'k4.4-p1');
  // Bauherr im Lenkungskreis bleibt, wenn zusätzlich die Reserve berührt ist – dann ohne getrennten Vorbehalt
  const lk = simuliere({ ...basis, betragTeur: 7000, deckung: 'reserve' });
  assert.equal(lk.wer, 'Bauherr im Lenkungskreis');
  assert.deepEqual(lk.vorbehalte, []);
  // überschrittene Schwelle: nicht mehr „innerhalb des Mandats“ (k6.4.5-p1)
  const s = simuliere({ ...basis, schwelleUeberschritten: true });
  assert.equal(s.wer, 'Die Stufe, die das projektspezifische Mandat bestimmt');
  assert.ok(!s.freigabeweg.some((h) => /Innerhalb des Mandats/u.test(h.text)));
  assert.equal(s.stufeOffen, true);
  const g = simuliere({ ...basis, betragTeur: 400, schwelleUeberschritten: true });
  assert.equal(g.wer, 'Die Stufe, die das projektspezifische Mandat bestimmt', 'auch auf Gremiumsstufe');
  assert.ok(g.eskalation.some((h) => h.quelle === 'k3.2-t1'));
  const sr = simuliere({ ...basis, schwelleUeberschritten: true, deckung: 'reserve' });
  assert.equal(sr.stufeOffen, true, 'R40: die Reserve bestimmt nicht die Stufe der Sachentscheidung');
  assert.ok(sr.freigabeweg.some((h) => /projektspezifische Mandat bestimmt, gilt für die Sachentscheidung; die Freigabe des Einsatzes der Risikoreserve ist nicht delegierbar und bleibt beim Bauherrn\./u.test(h.text)));
  // R41: auch die Annahme der Risikoexposition ist Vorbehalt des Bauherrn, keine Stufe der Sachentscheidung (k3.2-t1, k4.4-p1)
  assert.equal(simuliere({ ...basis, schwelleUeberschritten: true, risikoAnnahme: true }).stufeOffen, true);
  const ri = simuliere({ ...basis, betragTeur: 400, risikoAnnahme: true });
  assert.equal(ri.wer, 'Änderungsgremium');
  assert.deepEqual(ri.vorbehalte, ['die Annahme der Risikoexposition entscheidet der Bauherr']);
  assert.ok(ri.freigabeweg.some((h) => /die Annahme der Risikoexposition ist nicht delegierbar und bleibt beim Bauherrn/u.test(h.text)));
  // R41: nicht wesentlich – keine Entscheidungsvorlage, keine Kennung (k13-t1, k4.3-p2)
  const nw = simuliere({ ...basis, status: 'in-bearbeitung' });
  assert.equal(nw.wesentlich, false);
  assert.equal(nw.naechsterSchritt[0]?.quelle, 'k6.4.5-p1');
  assert.equal(simuliere(basis).naechsterSchritt[0]?.quelle, 'k6.4.5-p1');
  assert.equal(simuliere({ ...basis, substanziell: true, status: 'in-bearbeitung' }).naechsterSchritt[0]?.quelle, 'k9.4-l1');
  // R41: entschieden mit berührter Freigabe ohne Datenstand – der Freigabe fehlte ihre Grundlage (k4.5-p1)
  assert.ok(simuliere({ ...basis, freigabeBeruehrt: true, datenstandBenannt: false, status: 'entschieden' }).naechsterSchritt.some((h) => h.quelle === 'k4.5-p1'));
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
  assert.ok(simuliere({ ...basis, datenstandBenannt: false }).information.some((h) => h.quelle === 'k4.6-p2' && /^Zuerst/u.test(h.text)));
  // R40: nach der Entscheidung wird der Datenstand nachgetragen, nicht „zuerst“ geklärt
  const nach = simuliere({ ...basis, datenstandBenannt: false, status: 'entschieden' }).information.filter((h) => h.quelle === 'k4.6-p2');
  assert.equal(nach.length, 1);
  assert.match(nach[0]?.text ?? '', /^Den Datenstand nachtragen, auf dem entschieden wurde/u);
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
  // R35: 400 TEUR (Startwert) liegt beim Änderungsgremium, nicht im Mandat der Bauherren-PL (k4.2-p3, k6.4.5-p1)
  const g = simuliere({ ...basis, betragTeur: 400 });
  assert.equal(g.wer, 'Änderungsgremium');
  assert.ok(!g.freigabeweg.some((h) => /Innerhalb des Mandats/u.test(h.text)), 'Gremiumsstufe ist nicht „innerhalb des Mandats“');
  assert.ok(g.freigabeweg.some((h) => h.quelle === 'k4.2-p3' && /an das Änderungsgremium/u.test(h.text)));
  // R36: berührt die Lage eine Freigabe, sagt der Freigabeweg, dass die Stufe nur die Sachentscheidung meint
  assert.ok(simuliere({ ...basis, betragTeur: 400, freigabeBeruehrt: true }).freigabeweg.some((h) => h.quelle === 'k3.2-t1' && /Sachentscheidung/u.test(h.text)));
  assert.ok(!simuliere({ ...basis, betragTeur: 8000, freigabeBeruehrt: true }).freigabeweg.some((h) => /Sachentscheidung/u.test(h.text)));
  assert.ok(simuliere({ ...basis, betragTeur: 80 }).freigabeweg.some((h) => /Innerhalb des Mandats/u.test(h.text)), 'PL-Stufe ist innerhalb des Mandats');
  // R37: eine berührte Freigabe ist immer wesentlich (k9.3-p3, k3.2-t1, k4.3-p1), auch bei kleinem Betrag
  const r = simuliere({ ...basis, freigabeBeruehrt: true, status: 'entscheidungsreif' });
  assert.equal(r.wesentlich, true);
  assert.ok(!r.information.some((h) => h.quelle === 'k4.3-p1'), 'kein „nicht wesentlich“ neben der Freigabe');
  assert.match(r.naechsterSchritt[0]?.text ?? '', /hier Bauherren-PL; die Freigabe zum Abschluss der Leistungsphase erteilt der Bauherr selbst\.$/u);
  assert.equal(r.freigabeBeimBauherrn, true);
  assert.ok(r.bauherr.some((h) => h.quelle === 'k3.2-t1' && /Freigabe/u.test(h.text)), 'die Freigabe steht unter „Bleibt beim Bauherrn“');
  // R38: hebt allein der Betrag die Stufe zum Bauherrn, ist es eine wesentliche Bauherrenentscheidung (k4.2-p3)
  const b = simuliere({ ...basis, betragTeur: 6000 });
  assert.equal(b.wesentlich, true);
  assert.ok(b.information.some((h) => h.quelle === 'k4.3-p2') && !b.information.some((h) => h.quelle === 'k4.3-p1'));
  // R38: Schwelle überschritten (Stufe offen) – der nächste Schritt nennt eine Mandatsebene, keinen Vorgang
  const o = simuliere({ ...basis, schwelleUeberschritten: true, freigabeBeruehrt: true, status: 'entscheidungsreif' });
  assert.equal(o.stufeOffen, true);
  assert.match(o.naechsterSchritt[0]?.text ?? '', /hier die Stufe, die das projektspezifische Mandat bestimmt; die Freigabe zum Abschluss der Leistungsphase erteilt der Bauherr selbst\.$/u);
  assert.ok(!o.freigabeweg.some((h) => /unter „Wer entscheidet“/u.test(h.text)));
  // R39: auch auf der Stufe Bauherr (Betrag, Projektbasis) steht die Freigabe beim Bauherrn selbst, nicht im Lenkungskreis
  for (const v of [{ ...basis, betragTeur: 8000 }, { ...basis, deckung: 'ueber-basis' as const }]) {
    const x = simuliere({ ...v, freigabeBeruehrt: true, status: 'entscheidungsreif' });
    assert.equal(x.freigabeBeimBauherrn, true);
    assert.ok(x.bauherr.some((h) => h.quelle === 'k3.2-t1' && /Freigabe zum Abschluss/u.test(h.text)));
    assert.match(x.naechsterSchritt[0]?.text ?? '', /hier Bauherr im Lenkungskreis; die Freigabe zum Abschluss der Leistungsphase erteilt der Bauherr selbst\.$/u);
  }
});
