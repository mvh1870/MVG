// Monatsbericht-Baukasten (P18.2, Konzept WERKZEUGE-P18 D.3/D.4/D.6 und Testplan 7): Ampel ohne Entscheidungsfrage
// warnt gelb (nicht rot), offene Entscheidung ohne wer/bis wann ist eine Lücke, „keine“ ist nicht leer, Seitenmesser.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  FELDGRENZEN, leseStandBericht, pruefeBericht, schaetzeUmfang, textBreite, zeilenFuer, ZEICHEN_JE_ZEILE, ZEILEN_JE_SEITE, type Bericht, type BerichtEintrag, type OffeneEntscheidung,
} from '../src/werkzeuge/monatsbericht.ts';

const MAX = { veraenderungen: 4, blockiert: 3, massnahmen: 3, fruehwarnungen: 3, probleme: 4 };

/** Vorbelegung „oktober“ (D.4) */
function oktober(): Bericht {
  return {
    monat: 'Oktober 2026',
    datenstand: 'Einträge vom 30. September 2026',
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

test('Höchstzahl an der Kante (R78): genau so viele Einträge wie erlaubt → kein Hinweis, einer mehr → zuViele (jeder Abschnitt)', () => {
  for (const [abschnitt, max] of Object.entries(MAX)) {
    const mit = (n: number): Bericht => {
      const b = oktober();
      b.abschnitte[abschnitt] = Array.from({ length: n }, (_, i) => ({ text: 't', kennung: `AUF-00${i}` }));
      return b;
    };
    assert.ok(!ids(pruefeBericht(mit(max), MAX).hinweise).includes('zuViele'), `${abschnitt}: ${max} Einträge sind erlaubt`);
    assert.deepEqual(pruefeBericht(mit(max + 1), MAX).hinweise.filter((h) => h.id === 'zuViele'), [{ id: 'zuViele', schwere: 'gelb', bezug: abschnitt }], `${abschnitt}: ${max + 1} sind zu viele`);
  }
});

test('Kopf (R78): fehlt genau eines von Monat, Datenstand und Lage → berichtUnvollstaendig (gelb, bezug kopf); alle drei da → kein Hinweis', () => {
  for (const feld of ['monat', 'datenstand', 'lage'] as const) {
    const b = oktober();
    b[feld] = '  ';
    assert.deepEqual(pruefeBericht(b, MAX).hinweise, [{ id: 'berichtUnvollstaendig', schwere: 'gelb', bezug: 'kopf' }], feld);
  }
  assert.deepEqual(pruefeBericht(oktober(), MAX).hinweise, []);
});

/** Höchstfall: jedes Feld bis zur Feldgrenze, jeder Abschnitt bis zur Höchstzahl, jede Ampel mit Reaktion. */
function hoechstfall(plus = 0, zeichen = 'Langer Eintrag mit vielen Wörtern '): Bericht {
  const t = (n: number): string => zeichen.repeat(Math.ceil((n + plus) / zeichen.length)).slice(0, n + plus);
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

test('Seitenmesser an der Kante: 50 Zeilen passen, 51 nicht (D-R7); Vorgabe 50 Zeilen je Seite, 86 Zeichen je Zeile', () => {
  assert.equal(ZEILEN_JE_SEITE, 50);
  assert.equal(ZEICHEN_JE_ZEILE, 86);
  const hoechst = schaetzeUmfang(hoechstfall());
  assert.equal(hoechst.zeilen, 50, 'der Höchstfall füllt die Seite genau');
  assert.equal(hoechst.passt, true);
  // eine Zeile mehr: die Reaktion um eine Zeilenbreite verlängern
  const einsMehr = hoechstfall();
  einsMehr.reaktion += ' ' + 'x'.repeat(ZEICHEN_JE_ZEILE - 1);
  const u = schaetzeUmfang(einsMehr);
  assert.equal(u.zeilen, 51);
  assert.equal(u.passt, false);
  assert.ok(u.anteil > 1);
  const p = pruefeBericht(einsMehr, MAX);
  assert.ok(p.hinweise.some((h) => h.id === 'zuLang' && h.schwere === 'rot'));
  assert.equal(p.ampel, 'rot');
  assert.ok(!pruefeBericht(hoechstfall(), MAX).hinweise.some((h) => h.id === 'zuLang'));
});

test('Seitenmesser (R78): die Spalten der Abschnitte rechnen mit der halben Zeilenbreite, nicht breiter', () => {
  // fünf Abschnitte mit je einem Eintrag von 199 Zeichen: in der Spalte (41 Zeichen) 5 Zeilen je Eintrag, in der vollen Breite nur 3
  const leer = oktober();
  for (const k of Object.keys(MAX)) leer.abschnitte[k] = 'keine';
  const voll = oktober();
  for (const k of Object.keys(MAX)) voll.abschnitte[k] = [{ text: 'a'.repeat(197), kennung: 'A' }];
  // Spaltenzeilen: leer 5 + 5 = 10 → 5 Zeilen; voll 5 + 5 · 5 = 30 → 15 Zeilen
  assert.equal(schaetzeUmfang(voll).zeilen - schaetzeUmfang(leer).zeilen, 10);
});

test('Seitenmesser (R78): breite Buchstaben (M, W) zählen mehr – ein Bericht aus M und W im Höchstfall passt nicht, Großschrift ohne M und W schon', () => {
  assert.equal(textBreite('xxxx'), 4);
  assert.equal(textBreite('MWMW'), 4 * 1.35);
  assert.equal(schaetzeUmfang(hoechstfall()).passt, true);
  assert.equal(schaetzeUmfang(hoechstfall(0, 'KOSTEN STEIGEN ')).passt, true, 'Großschrift ohne M und W bleibt in der Reserve');
  const breit = schaetzeUmfang(hoechstfall(0, 'WM'));
  assert.equal(breit.passt, false, `${breit.zeilen} Zeilen`);
  assert.ok(breit.zeilen > 60);
});

test('Seitenmesser (R79): Kleinbuchstaben m und w, Blockzeichen und ein langes Wort ohne Leerzeichen passen im Höchstfall nicht – wie im PDF', () => {
  assert.equal(textBreite('mw'), 2 * 1.35);
  assert.equal(textBreite('██'), 2 * 1.6, 'fremde Schriftzeichen sind breiter');
  for (const [art, text] of [['m und w', 'mm ww mm ww '], ['m und w mit Leerzeichen', 'mmmmmmm wwwwwww '], ['Blockzeichen', '████████ '], ['langes Wort', 'Wasserschadensbeseitigungskoordinationsunterlagen']] as const) {
    const u = schaetzeUmfang(hoechstfall(0, text));
    assert.equal(u.passt, false, `${art}: ${u.zeilen} Zeilen`);
  }
  assert.equal(schaetzeUmfang(hoechstfall(0, 'Haustechnikfirma Mehrkostenanmeldung ')).passt, true, 'gewöhnlicher Text bleibt auf einer Seite');
});

test('Seitenmesser (R79): ein Wort länger als die Zeile beginnt eine neue Zeile und bricht dann nach der Breite um', () => {
  assert.equal(zeilenFuer('', 10), 1);
  assert.equal(zeilenFuer('aaaa bbbb', 10), 1);
  assert.equal(zeilenFuer('aaaaa bbbbb', 10), 2, 'Wortumbruch statt Zeichenzahl');
  assert.equal(zeilenFuer('ab ' + 'c'.repeat(25), 10), 4, 'langes Wort: neue Zeile, dann 25 Zeichen in drei Zeilen');
  assert.equal(zeilenFuer('c'.repeat(10), 10), 1);
  assert.equal(zeilenFuer('c'.repeat(11), 10), 2);
});

test('Seitenmesser (R79): Projektzeile (nur bei gewähltem Beispiel) und Datenstand-Zeile werden mitgezählt', () => {
  const ohne = oktober();
  assert.equal(schaetzeUmfang({ ...ohne, projekt: 'Schulcampus Lindenhall-Süd' }).zeilen - schaetzeUmfang({ ...ohne, projekt: null }).zeilen, 1, 'Projektzeile');
  assert.equal(schaetzeUmfang({ ...ohne, projekt: null }).zeilen, schaetzeUmfang(ohne).zeilen, 'ohne Projekt wie fehlend');
  const hoechst = schaetzeUmfang(hoechstfall());
  const mitProjekt = schaetzeUmfang({ ...hoechstfall(), projekt: 'Schulcampus Lindenhall-Süd' });
  assert.equal(hoechst.passt, true);
  assert.equal(mitProjekt.zeilen, hoechst.zeilen + 1);
  assert.equal(mitProjekt.passt, false, 'der Höchstfall mit gewähltem Beispiel passt nicht mehr (PDF: 2 Seiten)');
  const kurz = oktober();
  kurz.datenstand = 'x';
  const lang = oktober();
  lang.datenstand = ('Wort ').repeat(40);
  assert.ok(schaetzeUmfang(lang).zeilen > schaetzeUmfang(kurz).zeilen, 'Datenstand-Zeile zählt nach ihrer Länge');
  // die Datenstand-Zeile selbst: 2 Zeilen, wenn „Datenstand: “ plus Text die Zeile übersteigt
  const gerade = oktober();
  gerade.datenstand = 'x'.repeat(ZEICHEN_JE_ZEILE - 'Datenstand: '.length);
  const eins = oktober();
  eins.datenstand = 'x'.repeat(ZEICHEN_JE_ZEILE - 'Datenstand: '.length + 1);
  assert.equal(schaetzeUmfang(eins).zeilen - schaetzeUmfang(gerade).zeilen, 1);
});

test('Werkzeugstand für die Leinwand: nur der Schalter „Kosten-Ampel ohne Frage“', () => {
  assert.deepEqual(leseStandBericht('b:oktober;w:1', ['oktober']), { beispiel: 'oktober', schritt: 'w:1' });
  assert.deepEqual(leseStandBericht('b:oktober', ['oktober']), { beispiel: 'oktober', schritt: null });
  assert.equal(leseStandBericht('b:oktober;w:2', ['oktober']), null);
});
