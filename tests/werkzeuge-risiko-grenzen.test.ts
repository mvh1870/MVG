// Risiko-Bewerter mit eigenen Grenzen (P18.2, Konzept WERKZEUGE-P18 C.3/C.4 und Testplan 7): Grenzwert zur niedrigeren
// Stufe, Auswirkung 5 vorrangig (auch bei unbekannter Wahrscheinlichkeit), unbekannt ist nicht null, Spannen als Bereich,
// vier steigende Grenzen. Die Priorität wird gegen `matrix.stufen` im Inhalt nachgerechnet (keine zweite Quelle).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

import {
  aufGrenze, bewerteRisiko, leseStandRisiko, prioritaet, pruefeGrenzen, stufeAus, type Grenzen, type ProjektGrenzen, type RisikoEingabe,
  type Stufe,
} from '../src/werkzeuge/risiko-grenzen.ts';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');

const KOSTEN: Grenzen = [100_000, 500_000, 1_500_000, 3_000_000];
const TERMIN: Grenzen = [14, 28, 42, 70];
const G: ProjektGrenzen = { wahrscheinlichkeit: [10, 30, 50, 70], kosten: KOSTEN, termin: TERMIN };

function risiko(teil: Partial<RisikoEingabe> = {}): RisikoEingabe {
  return {
    w: { art: 'stufe', stufe: 3 }, kosten: { art: 'entfaellt' }, termin: { art: 'entfaellt' }, qualitaet: { art: 'entfaellt' },
    warn: [], massnahme: 'keine', schwelle: false, prognose: 'nein', puffer: null, ...teil,
  };
}
const stufe = (s: Stufe) => ({ art: 'stufe' as const, stufe: s });
const ids = (r: { hinweise: readonly { id: string }[] }): string[] => r.hinweise.map((h) => h.id);

/** Vorbelegungen (C.4) und die „Was wäre, wenn“-Annahmen bei ris-009 */
const RIS_009 = risiko({ w: stufe(4), kosten: { art: 'unbekannt' }, termin: { art: 'spanne', von: 0, bis: 70 }, qualitaet: stufe(4), massnahme: 'geplant', schwelle: true });
const RIS_014 = risiko({ w: stufe(3), kosten: { art: 'spanne', von: 1_000_000, bis: 1_200_000 }, schwelle: true });
const RIS_021 = risiko({ w: stufe(1), kosten: { art: 'unbekannt' }, termin: { art: 'unbekannt' }, qualitaet: stufe(5), warn: ['sicherheit'] });
const T70 = { termin: { art: 'wert' as const, wert: 70 } };
const T71 = { termin: { art: 'wert' as const, wert: 71 } };
const W1 = { w: stufe(1) };

test('stufeAus: ein Wert genau auf der Grenze gehört zur niedrigeren Stufe', () => {
  assert.equal(stufeAus(1_500_000, KOSTEN), 3);
  assert.equal(stufeAus(1_500_001, KOSTEN), 4);
  assert.equal(stufeAus(70, TERMIN), 4);
  assert.equal(stufeAus(71, TERMIN), 5);
  assert.equal(stufeAus(0, TERMIN), 1);
  assert.equal(stufeAus(14, TERMIN), 1);
  assert.equal(stufeAus(15, TERMIN), 2);
  assert.equal(stufeAus(28, TERMIN), 2);
  assert.equal(stufeAus(42, TERMIN), 3);
  assert.equal(stufeAus(43, TERMIN), 4);
  assert.equal(aufGrenze(70, TERMIN), 4);
  assert.equal(aufGrenze(71, TERMIN), null);
  assert.equal(aufGrenze(100_000, KOSTEN), 1);
});

test('prioritaet: Gegenproben des Testplans', () => {
  assert.equal(prioritaet(1, 5), 'vorrangig');
  assert.equal(prioritaet(2, 2), 'beobachten');
  assert.equal(prioritaet(1, 4), 'beobachten');
  assert.equal(prioritaet(3, 3), 'gezielt');
  assert.equal(prioritaet(2, 5), 'vorrangig');
  assert.equal(prioritaet(5, 2), 'vorrangig');
  assert.equal(prioritaet(5, 1), 'gezielt');
});

test('prioritaet stimmt in allen 25 Feldern mit matrix.stufen im Inhalt überein (Auswirkung 5 immer vorrangig)', () => {
  const inhalt = YAML.parse(readFileSync(join(WURZEL, 'inhalte', 'werkzeuge.yaml'), 'utf8')) as { matrix: { stufen: { id: string; von: number; bis: number }[]; regel: string } };
  assert.match(inhalt.matrix.regel, /Auswirkung 5 ist immer vorrangig/u);
  for (const w of [1, 2, 3, 4, 5] as const) {
    for (const a of [1, 2, 3, 4, 5] as const) {
      const nachProdukt = inhalt.matrix.stufen.find((s) => w * a >= s.von && w * a <= s.bis)?.id;
      assert.equal(prioritaet(w, a), a === 5 ? 'vorrangig' : nachProdukt, `${w} × ${a}`);
    }
  }
});

test('pruefeGrenzen: vier, positiv, streng steigend, Prozent unter 100', () => {
  assert.deepEqual(pruefeGrenzen(TERMIN, false), []);
  assert.deepEqual(pruefeGrenzen([10, 30, 50, 70], true), []);
  assert.deepEqual(pruefeGrenzen([14, 14, 42, 70], false), ['nicht-steigend']);
  assert.deepEqual(pruefeGrenzen([0, 14, 42, 70], false), ['nicht-positiv']);
  assert.deepEqual(pruefeGrenzen([10, 30, 50, 100], true), ['ueber-100']);
  assert.deepEqual(pruefeGrenzen([10, 30, 50, 100], false), []);
  assert.deepEqual(pruefeGrenzen([10, 30, 50], false), ['anzahl']);
  assert.deepEqual(pruefeGrenzen([70, 42, 28, 14], false), ['nicht-steigend']);
});

test('Ungültige Grenzen: keine Stufe für die Reihe, Zeile zählt wie unbekannt (nie als null)', () => {
  const r = bewerteRisiko(risiko({ kosten: { art: 'wert', wert: 200_000 }, qualitaet: stufe(2) }), { ...G, kosten: [1, 1, 2, 3] });
  assert.equal(r.stufen.kosten, null);
  assert.equal(r.zustand, 'vorlaeufig');
  assert.equal(r.nachObenOffen, true);
  assert.deepEqual(r.hinweise[0], { id: 'fehler', schwere: 'rot', bezug: 'kosten' });
});

test('Unbekannte Kosten: vorläufig, nach oben offen, nie Stufe 1 und nie Stufe 5, kein „bis“', () => {
  const r = bewerteRisiko(risiko({ kosten: { art: 'unbekannt' }, qualitaet: stufe(3) }), G);
  assert.equal(r.zustand, 'vorlaeufig');
  assert.equal(r.nachObenOffen, true);
  assert.equal(r.stufen.kosten, null);
  assert.deepEqual(r.feld, { w: 3, a: 3, wert: 9 }, 'nicht als 5 gezählt');
  assert.equal(r.bis, null);
  assert.equal(r.prioritaet, 'gezielt');
  assert.ok(ids(r).includes('vorlaeufig'));
  // Gegenprobe: unbekannt ist auch nicht 1 – ohne andere belegte Auswirkung gibt es kein Feld
  const nur = bewerteRisiko(risiko({ kosten: { art: 'unbekannt' } }), G);
  assert.equal(nur.zustand, 'offen');
  assert.equal(nur.feld, null);
  assert.equal(nur.prioritaet, null);
});

test('„0“ ist ein belegter Wert (Stufe 1); „trifft nicht zu“ zählt nicht', () => {
  const null0 = bewerteRisiko(risiko({ kosten: { art: 'wert', wert: 0 } }), G);
  assert.equal(null0.stufen.kosten, 1);
  assert.equal(null0.zustand, 'fest');
  assert.deepEqual(null0.feld, { w: 3, a: 1, wert: 3 });
  const nichts = bewerteRisiko(risiko(), G);
  assert.equal(nichts.zustand, 'offen');
  assert.equal(nichts.nachObenOffen, false);
  assert.equal(nichts.feld, null);
});

test('Spanne 0–70 Tage: Stufen 1 und 4, vorläufig, „bis“ aus Stufe 4, kein Grenzwert-Treffer', () => {
  const r = bewerteRisiko(risiko({ termin: { art: 'spanne', von: 0, bis: 70 } }), G);
  assert.equal(r.stufen.termin, 1);
  assert.equal(r.stufenBis.termin, 4);
  assert.equal(r.zustand, 'vorlaeufig');
  assert.deepEqual(r.feld, { w: 3, a: 1, wert: 3 });
  assert.deepEqual(r.bis, { w: 3, a: 4, wert: 12 });
  assert.equal(r.prioritaet, 'beobachten');
  assert.equal(r.prioritaetBis, 'vorrangig');
  assert.deepEqual(r.aufGrenze, []);
  assert.ok(ids(r).includes('spanne'));
});

test('ris-009: Feld 16, vorläufig, nach oben offen, wesentlich, Satz „geplant“', () => {
  const r = bewerteRisiko(RIS_009, G);
  assert.deepEqual(r.feld, { w: 4, a: 4, wert: 16 });
  assert.equal(r.zustand, 'vorlaeufig');
  assert.equal(r.nachObenOffen, true);
  assert.equal(r.bis, null);
  assert.equal(r.prioritaet, 'vorrangig');
  assert.equal(r.vorrangWegenA5, false);
  assert.equal(r.wesentlich, true);
  assert.deepEqual(r.stufen, { w: 4, kosten: null, termin: 1, qualitaet: 4 });
  for (const id of ['vorlaeufig', 'spanne', 'wesentlich', 'annahme', 'geplant']) assert.ok(ids(r).includes(id), id);
  assert.ok(!ids(r).includes('selten'));
});

test('ris-014 (1,0–1,2 Mio. €): Kosten fest Stufe 3, Feld 9, gezielt, kein Grenzwert-Treffer, wesentlich über die Schwelle', () => {
  const r = bewerteRisiko(RIS_014, G);
  assert.equal(r.stufen.kosten, 3);
  assert.equal(r.stufenBis.kosten, 3);
  assert.equal(r.zustand, 'fest');
  assert.deepEqual(r.feld, { w: 3, a: 3, wert: 9 });
  assert.equal(r.bis, null);
  assert.equal(r.prioritaet, 'gezielt');
  assert.deepEqual(r.aufGrenze, []);
  assert.equal(r.nachObenOffen, false);
  assert.equal(r.wesentlich, true);
});

test('Annahme t70: genau auf der Grenze, noch Stufe 4, Feld 16; t71: Feld 20, vorrangig', () => {
  const t70 = bewerteRisiko({ ...RIS_009, ...T70 }, G);
  assert.deepEqual(t70.aufGrenze, ['termin']);
  assert.equal(t70.stufen.termin, 4);
  assert.equal(t70.feld?.wert, 16);
  assert.deepEqual(t70.hinweise.find((h) => h.id === 'grenze'), { id: 'grenze', schwere: 'info', bezug: 'termin' });
  const t71 = bewerteRisiko({ ...RIS_009, ...T71 }, G);
  assert.deepEqual(t71.feld, { w: 4, a: 5, wert: 20 });
  assert.equal(t71.prioritaet, 'vorrangig');
  assert.equal(t71.vorrangWegenA5, false, 'nach dem Produkt schon vorrangig');
  assert.equal(t71.nachObenOffen, false, 'mit Stufe 5 geht es nicht höher');
  assert.deepEqual(t71.aufGrenze, []);
});

test('Annahmen t71 + w1: Feld 1 × 5 = 5, vorrangig allein wegen Auswirkung 5, Satz „selten“', () => {
  const r = bewerteRisiko({ ...RIS_009, ...T71, ...W1 }, G);
  assert.deepEqual(r.feld, { w: 1, a: 5, wert: 5 });
  assert.equal(r.prioritaet, 'vorrangig');
  assert.equal(r.vorrangWegenA5, true);
  assert.ok(ids(r).includes('selten'));
  assert.ok(ids(r).includes('schwereFolge'), 'Auswirkung 5 belegt, Kosten unbekannt');
});

test('Annahme w1 allein: mindestens 1 × 4 = 4, beobachten, nach oben offen, Satz „selten“', () => {
  const r = bewerteRisiko({ ...RIS_009, ...W1 }, G);
  assert.deepEqual(r.feld, { w: 1, a: 4, wert: 4 });
  assert.equal(r.prioritaet, 'beobachten');
  assert.equal(r.nachObenOffen, true);
  assert.ok(ids(r).includes('selten'));
  // wesentlich bleibt wegen der Entscheidungsschwelle
  assert.equal(r.wesentlich, true);
});

test('Annahme „Maßnahme umgesetzt und wirksam“: Satz „belegt“, das Feld rechnet nichts herunter', () => {
  const r = bewerteRisiko({ ...RIS_009, massnahme: 'belegt' }, G);
  assert.ok(ids(r).includes('belegt') && !ids(r).includes('geplant'));
  assert.equal(r.feld?.wert, 16);
});

test('ris-021: Feld 5, vorläufig, nicht nach oben offen, vorrangig wegen Auswirkung 5, Warnanlass, selten', () => {
  const r = bewerteRisiko(RIS_021, G);
  assert.deepEqual(r.feld, { w: 1, a: 5, wert: 5 });
  assert.equal(r.zustand, 'vorlaeufig');
  assert.equal(r.nachObenOffen, false);
  assert.equal(r.bis, null);
  assert.equal(r.prioritaet, 'vorrangig');
  assert.equal(r.vorrangWegenA5, true);
  assert.equal(r.wesentlich, true);
  for (const id of ['warnanlass', 'schwereFolge', 'selten', 'wesentlich']) assert.ok(ids(r).includes(id), id);
});

test('Gegenprobe M-a: Qualität 4 belegt, Kosten unbekannt → nach oben offen; Qualität 5 → vorläufig, nicht offen, kein „bis“', () => {
  const vier = bewerteRisiko(risiko({ qualitaet: stufe(4), kosten: { art: 'unbekannt' } }), G);
  assert.equal(vier.nachObenOffen, true);
  const fuenf = bewerteRisiko(risiko({ qualitaet: stufe(5), kosten: { art: 'unbekannt' } }), G);
  assert.equal(fuenf.zustand, 'vorlaeufig');
  assert.equal(fuenf.nachObenOffen, false);
  assert.equal(fuenf.bis, null);
});

test('Gegenprobe L-d: W 1, Termin 60–90 Tage → Feld 4 beobachten, „bis“ 1 × 5 vorrangig, kein Vorrang auf „mindestens“', () => {
  const r = bewerteRisiko(risiko({ w: stufe(1), termin: { art: 'spanne', von: 60, bis: 90 } }), G);
  assert.deepEqual(r.feld, { w: 1, a: 4, wert: 4 });
  assert.equal(r.prioritaet, 'beobachten');
  assert.deepEqual(r.bis, { w: 1, a: 5, wert: 5 });
  assert.equal(r.prioritaetBis, 'vorrangig');
  assert.equal(r.vorrangWegenA5, false);
  assert.equal(r.wesentlich, false);
});

test('W unbekannt + t71 → offen, kein Feld, vorrangig wegen Auswirkung 5; W unbekannt, höchste Auswirkung 4 → offen, keine Priorität', () => {
  const a5 = bewerteRisiko({ ...RIS_009, ...T71, w: { art: 'unbekannt' } }, G);
  assert.equal(a5.zustand, 'offen');
  assert.equal(a5.feld, null);
  assert.equal(a5.prioritaet, 'vorrangig');
  assert.equal(a5.vorrangWegenA5, true);
  assert.equal(a5.wesentlich, true);
  const a4 = bewerteRisiko(risiko({ w: { art: 'unbekannt' }, qualitaet: stufe(4) }), G);
  assert.equal(a4.zustand, 'offen');
  assert.equal(a4.prioritaet, null);
  assert.equal(a4.vorrangWegenA5, false);
  assert.ok(ids(a4).includes('offen'));
});

test('Wahrscheinlichkeit als Prozent: Stufe aus den Grenzen, 30 % genau auf der Grenze → Stufe 2', () => {
  const r = bewerteRisiko(risiko({ w: { art: 'wert', wert: 30 }, qualitaet: stufe(3) }), G);
  assert.equal(r.stufen.w, 2);
  assert.deepEqual(r.aufGrenze, ['wahrscheinlichkeit']);
  assert.equal(bewerteRisiko(risiko({ w: { art: 'wert', wert: 100 }, qualitaet: stufe(3) }), G).zustand, 'offen', '100 % ist kein Wert');
});

test('Ungültige Werte zählen nicht als null: negativ, von > bis, halbe Tage', () => {
  for (const kosten of [{ art: 'wert' as const, wert: -1 }, { art: 'spanne' as const, von: 5, bis: 4 }]) {
    const r = bewerteRisiko(risiko({ kosten, qualitaet: stufe(2) }), G);
    assert.equal(r.stufen.kosten, null);
    assert.equal(r.zustand, 'vorlaeufig');
  }
  assert.equal(bewerteRisiko(risiko({ termin: { art: 'wert', wert: 2.5 } }), G).stufen.termin, null);
});

test('Hinweise ohne Rechnung: Prognose, Puffer, Warnanlass unabhängig vom Feld', () => {
  assert.ok(ids(bewerteRisiko(risiko({ prognose: 'teilweise' }), G)).includes('prognose'));
  assert.ok(!ids(bewerteRisiko(risiko({ prognose: 'nein' }), G)).includes('prognose'));
  assert.ok(ids(bewerteRisiko(risiko({ puffer: false }), G)).includes('puffer'));
  assert.ok(!ids(bewerteRisiko(risiko({ puffer: null }), G)).includes('puffer'));
  const warn = bewerteRisiko(risiko({ w: stufe(1), qualitaet: stufe(1), warn: ['genehmigung'] }), G);
  assert.equal(warn.prioritaet, 'beobachten');
  assert.equal(warn.wesentlich, true);
  assert.ok(ids(warn).includes('warnanlass'));
});

test('Werkzeugstand für die Leinwand: Annahmen kombinierbar, jede Art höchstens einmal', () => {
  const bsp = ['ris-009', 'ris-014', 'ris-021'];
  assert.deepEqual(leseStandRisiko('b:ris-009;t:71;w:1', bsp), { beispiel: 'ris-009', schritt: 't:71;w:1' });
  assert.deepEqual(leseStandRisiko('b:ris-014', bsp), { beispiel: 'ris-014', schritt: null });
  assert.deepEqual(leseStandRisiko('b:ris-009;m:belegt;t:70', bsp), { beispiel: 'ris-009', schritt: 'm:belegt;t:70' });
  for (const roh of ['b:ris-009;t:70;t:71', 'b:ris-009;t:72', 'b:ris-009;w:2', 'b:ris-999;w:1']) assert.equal(leseStandRisiko(roh, bsp), null, roh);
});

test('Hinweis „selten“ (C-R13): Wahrscheinlichkeit Stufe 1 und 2 mit Auswirkung ab 4, nicht ab Stufe 3 und nicht bei Auswirkung 3', () => {
  const hat = (w: Stufe, a: Stufe): boolean => ids(bewerteRisiko(risiko({ w: stufe(w), qualitaet: stufe(a) }), G)).includes('selten');
  assert.equal(hat(1, 4), true);
  assert.equal(hat(2, 4), true, 'Stufe 2 „gering“ gehört dazu');
  assert.equal(hat(2, 5), true);
  assert.equal(hat(3, 4), false, 'ab Stufe 3 kein „selten“');
  assert.equal(hat(5, 5), false);
  assert.equal(hat(2, 3), false, 'Auswirkung 3 ist keine schwere Folge');
  assert.equal(hat(1, 3), false);
});

test('Satz „Vorrang wegen Auswirkung 5“ behauptet keinen Produktvergleich (R77): Inhalt', () => {
  const y = YAML.parse(readFileSync(join(WURZEL, 'inhalte', 'werkzeuge.yaml'), 'utf8')) as { risikogrenzen: { saetze: { vorrangA5: { text: string } } } };
  assert.doesNotMatch(y.risikogrenzen.saetze.vorrangA5.text, /weniger|allein/u);
});

test('Spanne (R79): beginnt sie genau auf einer Grenze, gibt es keinen Grenzwert-Treffer; nur der Einzelwert zeigt ihn', () => {
  const spanne = bewerteRisiko(risiko({ kosten: { art: 'spanne', von: 1_500_000, bis: 2_000_000 } }), G);
  assert.deepEqual(spanne.aufGrenze, []);
  const wert = bewerteRisiko(risiko({ kosten: { art: 'wert', wert: 1_500_000 } }), G);
  assert.deepEqual(wert.aufGrenze, ['kosten']);
});

test('Spanne und unbekannte Auswirkung (R79): nach oben offen, darum keine obere Ecke „bis“', () => {
  const r = bewerteRisiko(risiko({ kosten: { art: 'spanne', von: 200_000, bis: 2_000_000 }, termin: { art: 'unbekannt' } }), G);
  assert.equal(r.nachObenOffen, true);
  assert.equal(r.bis, null);
  assert.equal(r.prioritaetBis, null);
  assert.notEqual(r.feld, null);
});
