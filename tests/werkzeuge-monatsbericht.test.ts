// Monatsbericht-Baukasten (P18.2, Konzept WERKZEUGE-P18 D.3/D.4/D.6 und Testplan 7): Ampel ohne Entscheidungsfrage
// warnt gelb (nicht rot), offene Entscheidung ohne wer/bis wann ist eine Lücke, „keine“ ist nicht leer, Seitenmesser.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  FELDGRENZEN, leseStandBericht, pruefeBericht, schaetzeUmfang, type Bericht, type BerichtEintrag, type OffeneEntscheidung,
} from '../src/werkzeuge/monatsbericht.ts';

const MAX = { veraenderungen: 4, blockiert: 3, massnahmen: 3, fruehwarnungen: 3, probleme: 4 };

/** Vorbelegung „oktober“ (D.4) */
function oktober(): Bericht {
  return {
    monat: 'Oktober 2026',
    datenstand: 'Stand der Software zum Monatstermin',
    lage: 'Die Prognose liegt bei rund 59,4 Millionen Euro, rund eine Million über dem Budget und innerhalb der Reserve; die angekündigten Mehrkosten der Haustechnikfirma stehen als Risiko daneben.',
    ampeln: {
      kosten: { farbe: 'gelb', satz: 'Rund eine Million über dem Budget, innerhalb der Reserve.', gehoertZu: { reaktion: 'Die Bürgermeisterin nennt dem Stadtrat diese Zahl mit Begründung, die angekündigten Mehrkosten als Risiko daneben.' } },
      termine: { farbe: 'gruen', satz: 'Die ersten Holzelemente werden montiert.', gehoertZu: null },
      qualitaet: { farbe: 'gruen', satz: 'Keine Einschränkung bekannt.', gehoertZu: null },
    },
    abschnitte: {
      veraenderungen: [{ text: 'Kostenrechnungen abgeglichen: Unterschied sind die Mehrkosten.', kennung: 'RIS-014' }, { text: 'Erste Holzelemente montiert.', kennung: 'MAS-007' }],
      blockiert: 'keine',
      massnahmen: 'keine',
      fruehwarnungen: 'keine',
      probleme: [{ text: 'Mensa, die später wachsen kann: Umsetzung läuft.', kennung: 'AEN-012' }],
    },
    entscheidungen: 'keine',
    reaktion: 'Kenntnis; Zahl für den Stadtrat wie oben. Die Vergabestelle prüft die Mehrkosten, Ergebnis in rund vier Wochen.',
  };
}
const ids = (h: readonly { id: string }[]): string[] => h.map((x) => x.id);
const ENTSCHEIDUNG: OffeneEntscheidung = { id: 'e1', frage: 'Welche Lüftung?', stelle: 'Bürgermeisterin', bis: 'Ende Mai', kennung: 'AEN-020' };

test('oktober: grün, kein Hinweis, passt auf eine Seite', () => {
  const p = pruefeBericht(oktober(), MAX);
  assert.equal(p.ampel, 'gruen');
  assert.deepEqual(p.hinweise, []);
  assert.equal(p.umfang.passt, true);
  assert.ok(p.umfang.anteil > 0.3 && p.umfang.anteil < 0.8, String(p.umfang.anteil));
});

test('D-R1: gelbe Ampel ohne „gehört zu“ → Warnung gelb, Werkzeug-Ampel gelb (nicht rot); mit Reaktion → kein D-R1', () => {
  const b = oktober();
  b.ampeln.kosten = { ...b.ampeln.kosten, gehoertZu: null };
  const p = pruefeBericht(b, MAX);
  assert.deepEqual(p.hinweise, [{ id: 'ampelOhneFrage', schwere: 'gelb', bezug: 'kosten' }]);
  assert.equal(p.ampel, 'gelb');
  // rote Ampel ebenso
  b.ampeln.termine = { farbe: 'rot', satz: 'x', gehoertZu: null };
  assert.deepEqual(ids(pruefeBericht(b, MAX).hinweise), ['ampelOhneFrage', 'ampelOhneFrage']);
  assert.equal(pruefeBericht(b, MAX).ampel, 'gelb');
  // leere Reaktion zählt nicht
  b.ampeln.kosten = { ...b.ampeln.kosten, gehoertZu: { reaktion: '  ' } };
  assert.ok(pruefeBericht(b, MAX).hinweise.some((h) => h.bezug === 'kosten'));
});

test('D-R1: Verknüpfung mit einer offenen Entscheidung zählt nur, wenn es sie gibt', () => {
  const b = oktober();
  b.ampeln.kosten = { ...b.ampeln.kosten, gehoertZu: { entscheidung: 'e1' } };
  assert.ok(ids(pruefeBericht(b, MAX).hinweise).includes('ampelOhneFrage'), 'Entscheidungen „keine“');
  b.entscheidungen = [ENTSCHEIDUNG];
  const p = pruefeBericht(b, MAX);
  assert.deepEqual(p.hinweise, []);
  assert.equal(p.ampel, 'gruen');
});

test('D-R2: offene Entscheidung ohne Stelle oder Termin → rot', () => {
  const b = oktober();
  b.entscheidungen = [{ ...ENTSCHEIDUNG, bis: '' }];
  const p = pruefeBericht(b, MAX);
  assert.deepEqual(p.hinweise, [{ id: 'entscheidungOhneWerBisWann', schwere: 'rot', bezug: 'e1' }]);
  assert.equal(p.ampel, 'rot');
  b.entscheidungen = [{ ...ENTSCHEIDUNG, stelle: ' ' }];
  assert.equal(pruefeBericht(b, MAX).ampel, 'rot');
});

test('D-R3: Eintrag ohne Kennung → Hinweis gelb', () => {
  const b = oktober();
  b.abschnitte['probleme'] = [{ text: 'Mensa', kennung: '' }];
  assert.deepEqual(pruefeBericht(b, MAX).hinweise, [{ id: 'ohneKennung', schwere: 'gelb', bezug: 'probleme' }]);
  b.entscheidungen = [{ ...ENTSCHEIDUNG, kennung: '' }];
  assert.ok(pruefeBericht(b, MAX).hinweise.some((h) => h.id === 'ohneKennung' && h.bezug === 'e1'));
});

test('D-R4: „keine“ in allen Abschnitten → kein Hinweis; ein Abschnitt null oder leer → Hinweis', () => {
  const b = oktober();
  for (const k of Object.keys(MAX)) b.abschnitte[k] = 'keine';
  assert.deepEqual(pruefeBericht(b, MAX).hinweise, []);
  b.abschnitte['blockiert'] = null;
  assert.deepEqual(pruefeBericht(b, MAX).hinweise, [{ id: 'leerStattKeine', schwere: 'gelb', bezug: 'blockiert' }]);
  b.abschnitte['blockiert'] = [];
  assert.equal(pruefeBericht(b, MAX).ampel, 'gelb');
  // fehlender Abschnitt gilt als nicht ausgefüllt
  delete b.abschnitte['blockiert'];
  assert.ok(pruefeBericht(b, MAX).hinweise.some((h) => h.bezug === 'blockiert'));
  const c = oktober();
  c.entscheidungen = null;
  assert.deepEqual(pruefeBericht(c, MAX).hinweise, [{ id: 'leerStattKeine', schwere: 'gelb', bezug: 'entscheidungen' }]);
});

test('D-R5 und D-R6: dringlicher Eintrag, Maßnahme umgesetzt ohne belegte Wirkung', () => {
  const b = oktober();
  b.abschnitte['massnahmen'] = [{ text: 'Sperrung', kennung: 'MAS-010', stand: 'umgesetzt', dringlich: true }];
  assert.deepEqual(ids(pruefeBericht(b, MAX).hinweise), ['dringlich', 'umgesetztNichtWirksam']);
  b.abschnitte['massnahmen'] = [{ text: 'Sperrung', kennung: 'MAS-010', stand: 'wirksam' }];
  assert.deepEqual(pruefeBericht(b, MAX).hinweise, []);
});

test('Höchstzahl je Abschnitt überschritten → Hinweis', () => {
  const b = oktober();
  b.abschnitte['blockiert'] = Array.from({ length: 4 }, (_, i) => ({ text: 't', kennung: `AUF-00${i}` }));
  assert.deepEqual(ids(pruefeBericht(b, MAX).hinweise), ['zuViele']);
});

/** Höchstfall: jedes Feld bis zur Feldgrenze, jeder Abschnitt bis zur Höchstzahl, jede Ampel mit Reaktion. */
function hoechstfall(plus = 0): Bericht {
  const t = (n: number): string => 'x'.repeat(n + plus);
  const eintrag = (): BerichtEintrag => ({ text: t(FELDGRENZEN.eintrag), kennung: t(FELDGRENZEN.kennung) });
  const ampel = { farbe: 'rot' as const, satz: t(FELDGRENZEN.ampelSatz), gehoertZu: { reaktion: t(FELDGRENZEN.ampelReaktion) } };
  return {
    monat: t(FELDGRENZEN.monat), datenstand: t(FELDGRENZEN.datenstand), lage: t(FELDGRENZEN.lage),
    ampeln: { kosten: ampel, termine: ampel, qualitaet: ampel },
    abschnitte: Object.fromEntries(Object.entries(MAX).map(([k, n]) => [k, Array.from({ length: n }, eintrag)])),
    entscheidungen: Array.from({ length: 3 }, (_, i) => ({ id: `e${i}`, frage: t(FELDGRENZEN.frage), stelle: t(FELDGRENZEN.stelle), bis: t(FELDGRENZEN.bis), kennung: t(FELDGRENZEN.kennung) })),
    reaktion: t(FELDGRENZEN.reaktion),
  };
}

test('Seitenmesser: Höchstfall aller Felder passt auf eine Seite; deutlich darüber → D-R7 rot', () => {
  const u = schaetzeUmfang(hoechstfall());
  assert.equal(u.passt, true, `${u.zeilen} Zeilen`);
  assert.ok(u.anteil <= 1);
  const lang = pruefeBericht(hoechstfall(60), MAX);
  assert.equal(lang.umfang.passt, false);
  assert.ok(lang.hinweise.some((h) => h.id === 'zuLang' && h.schwere === 'rot'));
  assert.equal(lang.ampel, 'rot');
  // eigene Seitengröße
  assert.equal(schaetzeUmfang(oktober(), 92, 10).passt, false);
});

test('Werkzeugstand für die Leinwand: nur der Schalter „Kosten-Ampel ohne Frage“', () => {
  assert.deepEqual(leseStandBericht('b:oktober;w:1', ['oktober']), { beispiel: 'oktober', schritt: 'w:1' });
  assert.deepEqual(leseStandBericht('b:oktober', ['oktober']), { beispiel: 'oktober', schritt: null });
  assert.equal(leseStandBericht('b:oktober;w:2', ['oktober']), null);
});
