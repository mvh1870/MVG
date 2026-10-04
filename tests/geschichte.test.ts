/*
 * Story-Engine (src/geschichte/engine.ts, src/geschichte/mcda.ts) an den echten Inhalten und an kleinen Abwandlungen:
 * Balken je Weg wie im Drehbuch nachgerechnet, Begrenzung auf 0–10 nach jeder Antwort, Bilanz-Typen in fester
 * Reihenfolge, Kurzfassung (übersprungene Kapitel zählen wie die gute Antwort), Schritte und Brücken, Mini-Aufgaben,
 * Vergleich mit Kipppunkten, Laden und Verwerfen des Stands. Jede Regel hat eine Gegenprobe; `node werkzeuge/mutanten.mjs`
 * verfälscht die Engine und verlangt, dass diese Datei rot wird.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { inhalte } from '../src/inhalte/index.ts';
import {
  abgestimmteGewichte, balken, balkenBis, beginne, bilanzAmEnde, bilanzTyp, bruecken, endeFassung, falleGewaehlt, gemischt, geheZu, gewichte, gutePlatz, kapitel,
  klickeReihe, leseStand, miniVonVorn, neuerStand, offeneKapitel, ordneZu, schritte, setzeAbgestimmt, setzeGewicht,
  setzeKurz, stufe, vergleichKapitel, vergleichLage, waehle, wegKapitel, werteMiniAus, weiter, zurueck, type Stand,
} from '../src/geschichte/engine.ts';
import { kipppunkte, rangfolge, spitze } from '../src/geschichte/mcda.ts';
import type { Geschichte, Wertung } from '../src/geschichte/typen.ts';

const G0 = inhalte.geschichte;
assert.ok(G0, 'Story fehlt in den Inhalten');
const G: Geschichte = G0;

/** Stand: in jedem Kapitel die Antwort mit dieser Wertung. */
function weg(wertung: Wertung, kurz = false, g: Geschichte = G): Stand {
  let s = neuerStand(kurz);
  for (const k of g.kapitel) s = waehle(g, s, k.id, k.antworten.findIndex((a) => a.wertung === wertung));
  return { ...s, schritt: { ort: 'ende' } };
}

/* ------------------------------------------------------------------ Balken -- */

test('Balken: Start Geld 9, Zeit 6, Vertrauen 4 (Auftakt)', () => {
  assert.deepEqual(balken(G, neuerStand()), { geld: 9, zeit: 6, vertrauen: 4 });
});

/** Stand am Ende: Wertung je Station (Kennung s1 … s14) nach dieser Regel; `null` = übersprungen (Kurzfassung). */
function wegNach(wertungVon: (nr: number) => Wertung, kurz = false): Stand {
  let s = neuerStand(kurz);
  for (const k of G.kapitel) s = waehle(G, s, k.id, k.antworten.findIndex((a) => a.wertung === wertungVon(k.nr)));
  return { ...s, schritt: { ort: 'ende' } };
}

test('Nachgerechnete Wege (Drehbuch, 14 Stationen): gut 7/9/10 · vertretbar 4/0/4 · Falle 0/1/0 · Kurzfassung gut 7/9/10', () => {
  assert.deepEqual(balken(G, weg('gut')), { geld: 7, zeit: 9, vertrauen: 10 });
  assert.deepEqual(balken(G, weg('vertretbar')), { geld: 4, zeit: 0, vertrauen: 4 });
  assert.deepEqual(balken(G, weg('falle')), { geld: 0, zeit: 1, vertrauen: 0 });
  assert.deepEqual(balken(G, weg('gut', true)), { geld: 7, zeit: 9, vertrauen: 10 });
  assert.equal(bilanzAmEnde(G, weg('gut')), 'ruhig');
  assert.equal(bilanzAmEnde(G, weg('vertretbar')), 'letzte-meter');
  assert.equal(bilanzAmEnde(G, weg('falle')), 'nicht-getragen');
  assert.equal(bilanzAmEnde(G, weg('gut', true)), 'ruhig');
});

test('Nachgerechnete Mischwege (Drehbuch, Tabelle „Nachrechnung“): jede Zeile mit Balken und Bilanz', () => {
  const in_ = (...nr: number[]) => (n: number): boolean => nr.includes(n);
  const zeilen: [string, (n: number) => Wertung, [number, number, number], string][] = [
    ['abwechselnd gut, vertretbar', (n) => (n % 2 === 1 ? 'gut' : 'vertretbar'), [4, 6, 10], 'umwege'],
    ['abwechselnd vertretbar, gut', (n) => (n % 2 === 1 ? 'vertretbar' : 'gut'), [7, 0, 10], 'letzte-meter'],
    ['Muster gut, vertretbar, Falle', (n) => (['gut', 'vertretbar', 'falle'] as const)[(n - 1) % 3] as Wertung, [0, 1, 2], 'nicht-getragen'],
    ['lauter gut, zwei Fallen (4 und 13)', (n) => (in_(4, 13)(n) ? 'falle' : 'gut'), [5, 8, 9], 'umwege'],
    ['lauter gut, drei Fallen (3, 8, 12)', (n) => (in_(3, 8, 12)(n) ? 'falle' : 'gut'), [2, 5, 10], 'umwege'],
    ['lauter gut, drei vertretbar (3, 7, 11)', (n) => (in_(3, 7, 11)(n) ? 'vertretbar' : 'gut'), [7, 3, 10], 'letzte-meter'],
    ['gut bis 9, ab 10 lauter Fallen', (n) => (n >= 10 ? 'falle' : 'gut'), [3, 7, 0], 'nicht-getragen'],
    ['lauter vertretbar, nur 14 Falle', (n) => (n === 14 ? 'falle' : 'vertretbar'), [4, 0, 2], 'nicht-getragen'],
  ];
  for (const [name, regel, [geld, zeit, vertrauen], bilanz] of zeilen) {
    const s = wegNach(regel);
    assert.deepEqual(balken(G, s), { geld, zeit, vertrauen }, name);
    assert.equal(bilanzAmEnde(G, s), bilanz, name);
  }
  // Kurzfassung (Stationen 1, 3, 5, 12; übrige zählen wie die gute Antwort)
  for (const [w, erwartet, bilanz] of [['gut', [7, 9, 10], 'ruhig'], ['vertretbar', [7, 2, 10], 'letzte-meter'], ['falle', [4, 5, 7], 'umwege']] as const) {
    const s = wegNach(() => w, true);
    assert.deepEqual(balken(G, s), { geld: erwartet[0], zeit: erwartet[1], vertrauen: erwartet[2] }, `Kurzfassung ${w}`);
    assert.equal(bilanzAmEnde(G, s), bilanz, `Kurzfassung ${w}`);
  }
});

test('Begrenzung nach JEDER Antwort: voll bleibt voll, und die nächste Senkung wirkt sofort (Gegenprobe: erst am Ende begrenzt wäre anders)', () => {
  // gut: Vertrauen 4 → 6 → 7 → 8 → 9 → 10 (Station 5), danach bleibt es bei 10 (ohne Begrenzung 21)
  assert.equal(balkenBis(G, weg('gut'), 5).vertrauen, 10);
  assert.equal(balkenBis(G, weg('gut'), 14).vertrauen, 10);
  // eigens gebaut: Vertrauen 4, dann −2, −2, −2 (begrenzt 0), dann +2, +2 → 4; erst am Ende begrenzt ergäbe es 2
  const g = structuredClone(G);
  const wirkung = [-2, -2, -2, 2, 2];
  g.kapitel.slice(0, 5).forEach((k, i) => { for (const a of k.antworten) a.wirkung = { geld: 0, zeit: 0, vertrauen: wirkung[i] ?? 0 }; });
  g.kapitel.slice(5).forEach((k) => { for (const a of k.antworten) a.wirkung = { geld: 0, zeit: 0, vertrauen: 0 }; });
  assert.equal(balken(g, weg('gut', false, g)).vertrauen, 4);
  // nach oben genauso: 9 + 2 = 10, dann −1 = 9 (nicht 10)
  const h2 = structuredClone(G);
  h2.kapitel.forEach((k, i) => { for (const a of k.antworten) a.wirkung = { geld: i === 0 ? 2 : i === 1 ? -1 : 0, zeit: 0, vertrauen: 0 }; });
  assert.equal(balken(h2, weg('gut', false, h2)).geld, 9);
});

test('Balken am Schritt: ein Kapitel zählt mit seiner eigenen Wahl; spätere Kapitel noch nicht', () => {
  const s = weg('falle');
  const k3 = kapitel(G, 's3');
  assert.ok(k3);
  assert.deepEqual(balken(G, { ...s, schritt: { ort: 'kapitel', kapitel: 's3', teil: 'frage' } }), balkenBis(G, s, 3));
  assert.notDeepEqual(balkenBis(G, s, 3), balkenBis(G, s, 2));
  // ohne Wahl im Kapitel zählt es nicht
  const ohne = { ...neuerStand(), schritt: { ort: 'kapitel' as const, kapitel: 's3', teil: 'frage' as const } };
  assert.deepEqual(balken(G, ohne), { geld: 9, zeit: 6, vertrauen: 4 });
});

test('Stufen: niedrig 0–3, mittel 4–6, hoch 7–10 (Grenzen)', () => {
  assert.deepEqual([0, 3, 4, 6, 7, 10].map(stufe), ['niedrig', 'niedrig', 'mittel', 'mittel', 'hoch', 'hoch']);
});

test('Bilanz-Typ: erste zutreffende Regel gilt – Vertrauen niedrig vor Zeit niedrig vor „ruhig“, sonst „Umwege“', () => {
  assert.equal(bilanzTyp({ geld: 9, zeit: 1, vertrauen: 3 }, false), 'nicht-getragen');
  assert.equal(bilanzTyp({ geld: 9, zeit: 3, vertrauen: 4 }, false), 'letzte-meter');
  assert.equal(bilanzTyp({ geld: 4, zeit: 7, vertrauen: 7 }, false), 'ruhig');
  assert.equal(bilanzTyp({ geld: 3, zeit: 7, vertrauen: 7 }, false), 'umwege');
  assert.equal(bilanzTyp({ geld: 9, zeit: 6, vertrauen: 10 }, false), 'umwege');
  assert.equal(bilanzTyp({ geld: 9, zeit: 10, vertrauen: 6 }, false), 'umwege');
  assert.equal(bilanzTyp({ geld: 9, zeit: 4, vertrauen: 4 }, false), 'umwege');
  // L-239: nach einer Falle nie „ruhig“, auch bei vollen Balken
  assert.equal(bilanzTyp({ geld: 9, zeit: 10, vertrauen: 10 }, true), 'umwege');
  assert.equal(bilanzTyp({ geld: 9, zeit: 1, vertrauen: 3 }, true), 'nicht-getragen');
});

test('Falle auf dem Weg (L-239): ein einziger Falle-Klick macht aus „ruhig“ „Umwege“ und tauscht die Schlusszeile', () => {
  const gut = weg('gut');
  assert.equal(falleGewaehlt(G, gut), false);
  assert.equal(endeFassung(G, gut), 'grund');
  const k8 = kapitel(G, 's14');
  assert.ok(k8);
  const mitFalle = waehle(G, gut, 's14', k8.antworten.findIndex((a) => a.wertung === 'falle'));
  assert.equal(falleGewaehlt(G, mitFalle), true);
  assert.equal(bilanzAmEnde(G, mitFalle), 'umwege');
  assert.equal(endeFassung(G, mitFalle), 'nach-falle');
  assert.equal(endeFassung(G, weg('falle')), 'vertrauen-niedrig');
  // Kurzfassung: eine gespeicherte Falle in einem übersprungenen Kapitel zählt nicht
  assert.equal(falleGewaehlt(G, { ...mitFalle, kurz: true }), false);
});

/* ------------------------------------------------------------- Kurzfassung -- */

test('Kurzfassung: übersprungene Kapitel zählen wie die gute Antwort – auch wenn dort eine andere Wahl gespeichert ist', () => {
  // in der Kurzfassung überall die Falle, in den übersprungenen Kapiteln zählt trotzdem „gut“
  const falle = weg('falle', true);
  const erwartet = structuredClone(falle);
  erwartet.kurz = false;
  for (const k of G.kapitel) if (!k.kurzfassung) erwartet.wahlen[k.id] = gutePlatz(k);
  assert.deepEqual(balken(G, falle), balken(G, erwartet));
  // Gegenprobe: ohne Kurzfassung zählt die gespeicherte Falle
  assert.notDeepEqual(balken(G, { ...falle, kurz: false }), balken(G, falle));
  // in der Kurzfassung gibt es keine offenen übersprungenen Kapitel
  assert.deepEqual(offeneKapitel(G, neuerStand(true)).map((k) => k.id), ['s1', 's3', 's5', 's12']);
});

test('Schritte: ganze Geschichte 44, Kurzfassung 11; Vergleich nur in 12, Mini-Aufgaben nur auf dem langen Weg', () => {
  const lang = schritte(G, false);
  const kurz = schritte(G, true);
  const minis = G.kapitel.filter((k) => k.mini !== null).map((k) => k.id);
  assert.deepEqual(minis, ['s2', 's4', 's5', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14'], 'elf Mini-Aufgaben');
  // Auftakt, je Station Szene und Frage, 11 Mini-Aufgaben, der Vergleich in 12, zwei Pausen (nach Akt I und II), Ende
  assert.equal(lang.length, 1 + 14 * 2 + 11 + 1 + 2 + 1);
  assert.equal(lang.filter((x) => x.ort === 'pause').length, 2);
  assert.equal(kurz.length, 1 + 4 * 2 + 1 + 1);
  assert.ok(kurz.every((x) => x.ort !== 'pause'), 'die Kurzfassung hat keine Pause');
  const teile = (k: string, ss = lang): string[] => ss.flatMap((s) => (s.ort === 'kapitel' && s.kapitel === k ? [s.teil] : []));
  assert.deepEqual(G.kapitel.filter((k) => k.vergleich !== null).map((k) => k.id), ['s12'], 'Vergleich nur in Station 12');
  assert.deepEqual(teile('s12'), ['szene', 'mini', 'vergleich', 'frage'], 'Mini vor dem Vergleich');
  assert.deepEqual(teile('s2'), ['szene', 'frage', 'mini']);
  assert.deepEqual(teile('s11'), ['szene', 'mini', 'frage']);
  assert.deepEqual(teile('s6'), ['szene', 'frage'], 'Station ohne Mini-Aufgabe');
  assert.deepEqual(teile('s5', kurz), ['szene', 'frage']);
  assert.deepEqual(teile('s12', kurz), ['szene', 'vergleich', 'frage'], 'Kurzfassung: ohne Mini');
  assert.deepEqual(wegKapitel(G, true).map((k) => k.nr), [1, 3, 5, 12]);
});

test('Brücken der Kurzfassung: vor 3 die 2, vor 5 die 4, vor 12 die 6 bis 11, vor dem Ende die 13 und 14', () => {
  const k = (id: string) => kapitel(G, id);
  assert.deepEqual(bruecken(G, k('s1')).map((x) => x.id), []);
  assert.deepEqual(bruecken(G, k('s3')).map((x) => x.id), ['s2']);
  assert.deepEqual(bruecken(G, k('s5')).map((x) => x.id), ['s4']);
  assert.deepEqual(bruecken(G, k('s12')).map((x) => x.id), ['s6', 's7', 's8', 's9', 's10', 's11']);
  assert.deepEqual(bruecken(G, null).map((x) => x.id), ['s13', 's14']);
});

test('Ablauf: weiter und zurück bleiben an den Rändern stehen; beginne springt in die erste Szene', () => {
  const a = neuerStand();
  assert.deepEqual(zurueck(G, a).schritt, { ort: 'auftakt' });
  assert.deepEqual(weiter(G, a).schritt, { ort: 'kapitel', kapitel: 's1', teil: 'szene' });
  const e = { ...a, schritt: { ort: 'ende' as const } };
  assert.deepEqual(weiter(G, e).schritt, { ort: 'ende' });
  assert.deepEqual(beginne(G, a, true), { ...a, kurz: true, schritt: { ort: 'kapitel', kapitel: 's1', teil: 'szene' } });
  // ein Schritt, den es auf dem Weg nicht gibt, wird nicht angesprungen
  assert.equal(geheZu(G, neuerStand(true), { ort: 'kapitel', kapitel: 's2', teil: 'szene' }).schritt.ort, 'auftakt');
});

test('Wechsel in die Kurzfassung: aus einer Mini-Aufgabe oder einem übersprungenen Kapitel zum nächsten Kapitel des Wegs', () => {
  const mini = { ...neuerStand(), schritt: { ort: 'kapitel' as const, kapitel: 's5', teil: 'mini' as const } };
  assert.deepEqual(setzeKurz(G, mini, true).schritt, { ort: 'kapitel', kapitel: 's12', teil: 'szene' });
  const k2 = { ...neuerStand(), schritt: { ort: 'kapitel' as const, kapitel: 's2', teil: 'frage' as const } };
  assert.deepEqual(setzeKurz(G, k2, true).schritt, { ort: 'kapitel', kapitel: 's3', teil: 'szene' });
  const k8 = { ...neuerStand(), schritt: { ort: 'kapitel' as const, kapitel: 's14', teil: 'szene' as const } };
  assert.deepEqual(setzeKurz(G, k8, true).schritt, { ort: 'ende' });
  // was auf beiden Wegen liegt, bleibt stehen
  const k3 = { ...neuerStand(), schritt: { ort: 'kapitel' as const, kapitel: 's3', teil: 'frage' as const } };
  assert.deepEqual(setzeKurz(G, k3, true).schritt, k3.schritt);
});

test('Wahl: nur Plätze 0–2 eines bekannten Kapitels', () => {
  const s = neuerStand();
  assert.equal(waehle(G, s, 's1', 3), s);
  assert.equal(waehle(G, s, 's1', -1), s);
  assert.equal(waehle(G, s, 'k9', 0), s);
  assert.deepEqual(waehle(G, s, 's1', 2).wahlen, { s1: 2 });
});

/* ----------------------------------------------------------- Mini-Aufgaben -- */

test('Mini zuordnen: richtig, falsch, offen; „noch einmal“ setzt zurück', () => {
  const k2 = kapitel(G, 's2');
  assert.ok(k2?.mini);
  const m = k2.mini;
  const i = (id: string): number => m.wahlen.findIndex((w) => w.id === id);
  // die Sätze stehen gemischt (R73) – gesucht wird der Posten über seine Lösung
  const p = (id: string): number => m.posten.findIndex((x) => x.loesung === id);
  const fw = p('fruehwarnung');
  const ri = p('risiko');
  const dritter = m.posten.findIndex((_, n) => n !== fw && n !== ri);
  let s = ordneZu(G, neuerStand(), 's2', fw, i('fruehwarnung'));
  s = ordneZu(G, s, 's2', ri, i('problem'));
  const a = werteMiniAus(m, s.mini['s2']);
  assert.deepEqual([a.je[fw], a.je[ri], a.je[dritter]], ['richtig', 'falsch', 'offen']);
  assert.equal(a.richtig, 1);
  assert.equal(a.fertig, false);
  // Umentscheiden zählt
  s = ordneZu(G, s, 's2', ri, i('risiko'));
  assert.equal(werteMiniAus(m, s.mini['s2']).je[ri], 'richtig');
  // alle richtig → fertig
  m.posten.forEach((p, n) => { s = ordneZu(G, s, 's2', n, i(p.loesung)); });
  assert.deepEqual(werteMiniAus(m, s.mini['s2']), { je: m.posten.map(() => 'richtig'), richtig: m.posten.length, fertig: true });
  assert.equal(miniVonVorn(s, 's2').mini['s2'], undefined);
  // ungültige Eingaben ändern nichts
  assert.equal(ordneZu(G, s, 's2', 99, 0), s);
  assert.equal(ordneZu(G, s, 's10', 0, 0), s, 'k6 ist eine Reihenfolge');
});

test('Mini Reihenfolge: anklicken reiht an, erneutes Anklicken löst ab dieser Stelle; ausgewertet erst, wenn alle dran sind', () => {
  const m = kapitel(G, 's10')?.mini;
  assert.ok(m && m.art === 'reihenfolge');
  let s = neuerStand();
  for (const n of [0, 1, 3, 2]) s = klickeReihe(G, s, 's10', n);
  assert.deepEqual(s.mini['s10'], [0, 1, 3, 2]);
  assert.deepEqual(klickeReihe(G, s, 's10', 1).mini['s10'], [0], 'löst den Posten und alles danach');
  for (const n of [4, 5]) s = klickeReihe(G, s, 's10', n);
  const a = werteMiniAus(m, s.mini['s10']);
  assert.equal(a.fertig, true);
  assert.deepEqual(a.je, ['richtig', 'richtig', 'falsch', 'falsch', 'richtig', 'richtig']);
});

test('Mini Reihenfolge: fest gemischt – deterministisch, eine echte Umstellung, jede Stelle genau einmal', () => {
  assert.deepEqual(gemischt(6), gemischt(6));
  assert.notDeepEqual(gemischt(6), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual([...gemischt(6)].sort(), [0, 1, 2, 3, 4, 5]);
});

/* --------------------------------------------------------------- Vergleich -- */

const K7 = vergleichKapitel(G);
assert.ok(K7?.vergleich);
const V = K7.vergleich;

test('Vergleich: abgestimmte Gewichte (Schulstart sehr wichtig, Geld und Luft wichtig, Klima weniger) → A 49 · B 45 · C 45', () => {
  assert.deepEqual(abgestimmteGewichte(V), { geld: 3, schulstart: 5, luft: 3, klima: 1 });
  const p = rangfolge(V.optionen, V.kriterien, abgestimmteGewichte(V));
  assert.deepEqual(p.map((x) => [x.option.id, x.summe, x.rang]), [['A', 49, 1], ['B', 45, 2], ['C', 45, 2]]);
  assert.equal(vergleichLage(V, abgestimmteGewichte(V)).satz, 'A');
});

test('Vergleich: Gegenproben des Drehbuchs – je eine Stufe anders', () => {
  const mit = (k: string, w: number): Record<string, number> => ({ ...abgestimmteGewichte(V), [k]: w });
  const summen = (g: Record<string, number>): number[] => ['A', 'B', 'C'].map((id) => rangfolge(V.optionen, V.kriterien, g).find((x) => x.option.id === id)?.summe ?? 0);
  assert.deepEqual(summen(mit('klima', 3)), [55, 49, 55]);
  assert.deepEqual(summen(mit('schulstart', 3)), [39, 35, 41]);
  assert.deepEqual(summen(mit('klima', 5)), [61, 53, 65]);
  assert.deepEqual(summen(mit('geld', 5)), [53, 53, 55]);
  assert.deepEqual(summen(mit('luft', 1)), [39, 41, 35]);
  assert.equal(vergleichLage(V, mit('klima', 3)).satz, 'gleichauf');
  assert.equal(vergleichLage(V, mit('luft', 1)).satz, 'B');
  assert.equal(vergleichLage(V, mit('schulstart', 3)).satz, 'C');
});

test('Wirkung je Antwort ist festgehalten (Drehbuch Abschnitt 4: Geld, Zeit, Vertrauen je −2 … +2) – auch dort, wo die Begrenzung auf 0–10 eine Änderung auf den Wegen verschluckt (R79)', () => {
  // Tabelle des Drehbuchs (Geld,Zeit,Vertrauen) je Station: gut · vertretbar · Falle – seit P19.6 alle 14 Stationen
  const soll: Record<string, [string, string, string]> = {
    s1: ['0,0,2', '0,-1,1', '0,1,-2'], s2: ['0,1,1', '0,1,0', '0,-1,-1'], s3: ['-1,2,1', '-1,-1,-1', '-2,-2,-2'],
    s4: ['-1,-1,1', '-1,-1,0', '-2,-2,-1'], s5: ['-1,0,2', '-1,-1,0', '-2,-1,-2'], s6: ['0,0,1', '0,0,0', '-1,0,-2'],
    s7: ['0,1,1', '0,-1,0', '-1,-2,-1'], s8: ['2,0,2', '-1,-1,0', '-1,0,-2'], s9: ['0,1,1', '0,0,0', '-1,-1,-2'],
    s10: ['0,-1,1', '0,-1,0', '-1,-2,-2'], s11: ['0,-1,1', '0,-2,0', '-1,-2,-2'], s12: ['-1,1,1', '-1,-1,0', '-2,1,-2'],
    s13: ['0,0,1', '0,-1,0', '-1,0,-2'], s14: ['0,0,1', '0,0,0', '0,0,-2'],
  };
  assert.deepEqual(G.kapitel.map((k) => k.id), Object.keys(soll));
  for (const k of G.kapitel) {
    const ist = (w: Wertung): string => { const a = k.antworten.find((x) => x.wertung === w); return `${a?.wirkung.geld},${a?.wirkung.zeit},${a?.wirkung.vertrauen}`; };
    assert.deepEqual([ist('gut'), ist('vertretbar'), ist('falle')], soll[k.id], k.id);
  }
});

test('Vergleich: Satz der Projektsteuerin über alle 81 Gewichtsstellungen – A nie ohne Schulstart ≥ „wichtig“, B nur bei Luft „weniger wichtig“, C nur wenn Geld oder Klima mindestens so viel zählen wie der Schulstart (R79)', () => {
  const stufen = [1, 3, 5];
  const gesehen = new Set<string>();
  let n = 0;
  for (const geld of stufen) for (const schulstart of stufen) for (const luft of stufen) for (const klima of stufen) {
    n += 1;
    const gew = { geld, schulstart, luft, klima };
    const lage = vergleichLage(V, gew);
    gesehen.add(lage.satz);
    const wo = JSON.stringify(gew);
    if (lage.satz === 'A') { assert.ok(schulstart >= 3, `A ohne Schulstart ≥ wichtig bei ${wo}`); assert.deepEqual(lage.vorn, ['A']); }
    else if (lage.satz === 'B') { assert.equal(luft, 1, `B bei ${wo}`); assert.deepEqual(lage.vorn, ['B']); }
    else if (lage.satz === 'C') { assert.ok(Math.max(geld, klima) >= schulstart, `C bei ${wo}`); assert.deepEqual(lage.vorn, ['C']); }
    else { assert.equal(lage.satz, 'gleichauf'); assert.ok(lage.vorn.length > 1, `gleichauf bei ${wo}`); }
  }
  assert.equal(n, 81);
  assert.deepEqual([...gesehen].sort(), ['A', 'B', 'C', 'gleichauf'], 'jeder Satz kommt auf mindestens einer Stellung vor');
  // Wortlaut der Sätze, die diese Bedingungen tragen: wer ihn ändert, rechnet die Stellungen neu nach
  assert.ok(V.saetze['A']?.startsWith('Das Ersatzgerät liegt vorn – mit diesen Gewichten zählt, dass alle Kinder pünktlich einziehen'));
  assert.ok(V.saetze['B']?.startsWith('Die Leihgeräte liegen vorn – aber nur, weil gute Luft im Unterricht hier kaum zählt'));
  assert.ok(V.saetze['C']?.startsWith('Der spätere Einzug liegt vorn: Wenn Geld oder Strombedarf so viel zählen wie der Schulstart'));
  assert.ok(V.saetze['gleichauf']?.startsWith('Gleichauf – jetzt entscheidet das Urteil'));
});

test('Vergleich: B liegt nie vorn, solange Gute Luft mindestens „wichtig“ ist (alle 3^4 Stellungen)', () => {
  const stufen = [1, 3, 5];
  for (const geld of stufen) for (const schulstart of stufen) for (const luft of [3, 5]) for (const klima of stufen) {
    assert.ok(!spitze(V.optionen, V.kriterien, { geld, schulstart, luft, klima }).includes('B') || (2 * geld - 3 * luft - klima === 0), `${geld}/${schulstart}/${luft}/${klima}`);
  }
});

test('Kipppunkte (drei Stufen): Geld sehr wichtig → C, Schulstart wichtig → C, Luft weniger wichtig → B, Klima wichtig → A und C', () => {
  const k = vergleichLage(V, abgestimmteGewichte(V)).kipp;
  assert.deepEqual(k, [
    { kriterium: 'geld', gewicht: 5, spitze: ['C'] },
    { kriterium: 'schulstart', gewicht: 3, spitze: ['C'] },
    { kriterium: 'luft', gewicht: 1, spitze: ['B'] },
    { kriterium: 'klima', gewicht: 3, spitze: ['A', 'C'] },
  ]);
  // Gegenprobe: nur die zulässigen Stufen zählen – aus „weniger wichtig“ (1) geht es für Klima mit 1–5 schon bei 2
  // nicht weiter, bei {1, 3, 5} springt es direkt auf 3; bei Geld 1 und Stufen {1, 3, 5} kippt nach oben erst 5
  const ab = { geld: 1, schulstart: 3, luft: 3, klima: 3 };
  assert.deepEqual(kipppunkte(V.optionen, V.kriterien, ab, [1, 3, 5]).filter((x) => x.kriterium === 'geld'), kipppunkte(V.optionen, V.kriterien, ab, [1, 3, 5]).filter((x) => x.kriterium === 'geld' && [3, 5].includes(x.gewicht)));
  assert.ok(kipppunkte(V.optionen, V.kriterien, ab, [1, 3, 5]).every((x) => [1, 3, 5].includes(x.gewicht)));
});

test('Kipppunkte der Story springen nur auf zulässige Stufen (Gegenprobe zum Rechner mit 1–5)', () => {
  // X liegt vorn; schon bei Gewicht 2 läge Y vorn – die Story kennt aber nur 1, 3, 5 und nennt deshalb 3
  const v = { ...V, kriterien: [{ id: 'a', titel: 'A', imSatz: 'A', gewicht: 1 }, { id: 'b', titel: 'B', imSatz: 'B', gewicht: 5 }],
    optionen: [{ id: 'X', titel: 'X', punkte: { a: 1, b: 4 }, worte: {} }, { id: 'Y', titel: 'Y', punkte: { a: 4, b: 3 }, worte: {} }] };
  assert.deepEqual(vergleichLage(v, { a: 1, b: 5 }).kipp.find((x) => x.kriterium === 'a'), { kriterium: 'a', gewicht: 3, spitze: ['Y'] });
  assert.deepEqual(kipppunkte(v.optionen, v.kriterien, { a: 1, b: 5 }).find((x) => x.kriterium === 'a'), { kriterium: 'a', gewicht: 2, spitze: ['Y'] });
});

test('Gewichte setzen: nur 5, 3 oder 1; zurück auf die abgestimmte Stellung heißt „abgestimmt“ (null)', () => {
  const s = neuerStand();
  assert.equal(setzeGewicht(G, s, 'geld', 4), s);
  assert.equal(setzeGewicht(G, s, 'unbekannt', 5), s);
  const neu = setzeGewicht(G, s, 'geld', 5);
  assert.deepEqual(gewichte(G, neu), { geld: 5, schulstart: 5, luft: 3, klima: 1 });
  assert.equal(setzeGewicht(G, neu, 'geld', 3).gewichte, null);
  assert.equal(setzeAbgestimmt(neu).gewichte, null);
});

/* ---------------------------------------------------------------- Speichern -- */

test('Laden: ein älterer Stand (v 1, Stationen) wird verworfen; Unpassendes fällt einzeln weg', () => {
  assert.equal(leseStand(G, { v: 1, schritt: { ort: 'station', station: 's3', teil: 'lage' }, wahlen: { s1: 'A' } }), null);
  // eine andere Fassung wird auch dann verworfen, wenn die Kennungen passen (P19.3: gk.story bleibt Fassung 2)
  for (const v of [1, 3]) assert.equal(leseStand(G, { v, kurz: false, schritt: { ort: 'auftakt' }, wahlen: { s1: 1 }, mini: {}, gewichte: null }), null, `Fassung ${v}`);
  assert.equal(leseStand(G, null), null);
  assert.equal(leseStand(G, 'text'), null);
  const s = leseStand(G, {
    v: 2, kurz: false, schritt: { ort: 'kapitel', kapitel: 's3', teil: 'frage' },
    wahlen: { s1: 1, s2: 7, k9: 0, s3: '1' },
    mini: { s2: [0, -1, -1, -1, -1, -1], s10: [0, 0], s5: [1] },
    gewichte: { geld: 5, klima: 4 },
  });
  assert.ok(s);
  assert.deepEqual(s.wahlen, { s1: 1 });
  assert.deepEqual(s.mini, { s2: [0, -1, -1, -1, -1, -1] });
  assert.deepEqual(s.gewichte, { geld: 5, schulstart: 5, luft: 3, klima: 1 });
  assert.deepEqual(s.schritt, { ort: 'kapitel', kapitel: 's3', teil: 'frage' });
  // ein Schritt, den es auf dem Weg nicht gibt, ergibt den Auftakt
  assert.deepEqual(leseStand(G, { v: 2, kurz: true, schritt: { ort: 'kapitel', kapitel: 's2', teil: 'mini' } })?.schritt, { ort: 'auftakt' });
  // was gespeichert wurde, kommt gleich zurück
  const voll = { ...weg('vertretbar'), mini: { s10: [1, 0] }, gewichte: { geld: 1, schulstart: 5, luft: 3, klima: 1 } };
  assert.deepEqual(leseStand(G, JSON.parse(JSON.stringify(voll))), voll);
});

/* ------------------------------------------------------------------ R75 -- */

test('R75: Lösungen der Mini-Aufgaben stehen fest (Wer eine Lösung ändert, prüft sie gegen V2.4 und hier)', () => {
  const loesung = (id: string): string[] => (kapitel(G, id)?.mini?.posten ?? []).map((p) => p.loesung);
  assert.deepEqual(loesung('s2'), ['massnahme', 'aenderung', 'fruehwarnung', 'aufgabe', 'problem', 'risiko']);
  assert.deepEqual(loesung('s5'), ['sie', 'buergermeisterin', 'buergermeisterin', 'buergermeisterin', 'buergermeisterin', 'sie']);
  assert.deepEqual(loesung('s14'), ['uebergeben', 'geschlossen', 'uebergeben', 'geschlossen', 'geschlossen']);
  // P19.6: die Lösungen der neuen Mini-Aufgaben (Drehbuch; Fachprüfung P19.8)
  assert.deepEqual(loesung('s4'), ['stimmt', 'nachfordern', 'nachfordern', 'nachfordern'], 'Matrix-Probe');
  assert.deepEqual(loesung('s7'), ['annehmen', 'nachfordern', 'annehmen', 'nachfordern', 'nachfordern'], 'Mappe nachfordern');
  assert.deepEqual(loesung('s8'), ['stimmt', 'doppelt', 'stimmt', 'nachfordern', 'doppelt'], 'Pinnwand');
  assert.deepEqual(loesung('s9'), ['ok', 'nachfordern', 'ok', 'nachfordern', 'nachfordern', 'ok'], 'Bericht gegenlesen');
  assert.deepEqual(loesung('s12'), ['vergleich', 'aus', 'vergleich', 'vergleich'], 'Muss oder nicht?');
  assert.deepEqual(loesung('s13'), ['nachfordern', 'ok', 'nachfordern', 'ok', 'nachfordern'], 'Beschluss oder nicht? als Bericht gegenlesen (P19.8, Rhythmus der Mini-Arten)');
  assert.equal(kapitel(G, 's11')?.mini?.art, 'rueckfragen', 'Rückfragen haben keine Lösung, nur ein Kontingent');
  assert.equal(kapitel(G, 's11')?.mini?.kontingent, 2);
  // Reihenfolge: die Liste ist die Lösung – Schutz, Meldung, Eintrag, Ursache, Lösung, Abschluss
  assert.deepEqual((kapitel(G, 's10')?.mini?.posten ?? []).map((p) => p.html.split(' ').slice(0, 2).join(' ')), ['Der Bauleiter', 'Sicherheitskoordination und', 'Noch am', 'Die Fachleute', 'Die Lösung', 'Erst wenn']);
});

/**
 * Prüft einen Satz, der einen Kipppunkt nennt („Wären Strombedarf und Betrieb ‚wichtig‘, läge der spätere Einzug gleichauf“):
 * Stufe und Wort (gleichauf/vorn) müssen zum gerechneten Kipppunkt passen. Leer = in Ordnung.
 */
function kippSatzFunde(text: string, v: NonNullable<ReturnType<typeof vergleichKapitel>>['vergleich'] & object, kriterium: string, option: string): string[] {
  const lage = vergleichLage(v, abgestimmteGewichte(v));
  const x = lage.kipp.find((k) => k.kriterium === kriterium);
  if (x === undefined) return [`kein Kipppunkt für ${kriterium}`];
  const aus: string[] = [];
  if (!x.spitze.includes(option)) aus.push(`${option} nicht an der Spitze (${x.spitze.join(',')})`);
  const stufe = ({ 5: 'sehr wichtig', 3: 'wichtig', 1: 'weniger wichtig' } as Record<number, string>)[x.gewicht] ?? '';
  if (!new RegExp(`[„‚]${stufe}[“‘]`, 'u').test(text)) aus.push(`Stufe „${stufe}“ fehlt`);
  const wort = x.spitze.length > 1 ? 'gleichauf' : 'vorn';
  if (!new RegExp(`\\b${wort}\\b`, 'u').test(text)) aus.push(`Wort „${wort}“ fehlt`);
  if (new RegExp(`\\b${wort === 'vorn' ? 'gleichauf' : 'vorn'}\\b`, 'u').test(text)) aus.push('falsches Wort');
  return aus;
}

test('R75: Empfehlung und gute Folge in Station 12 nennen den Kipppunkt so, wie er gerechnet ist (Klima „wichtig“ → gleichauf)', () => {
  const k = kapitel(G, 's12');
  assert.ok(k?.vergleich);
  const v = k.vergleich;
  // gerechnet: Klima von „weniger wichtig“ (1) auf „wichtig“ (3) – dann liegen A und C gleichauf an der Spitze (A 55 · B 49 · C 55)
  const kipp = vergleichLage(v, abgestimmteGewichte(v)).kipp.find((x) => x.kriterium === 'klima');
  assert.ok(kipp);
  assert.equal(kipp.gewicht, 3);
  assert.deepEqual([...kipp.spitze].sort(), ['A', 'C']);
  // P19.6: Die Sätze der Station nennen keine Stufe mehr in Anführungszeichen, sondern „wichtiger“ und „mehr“. Die Empfehlung sagt nur,
  // dass sich die Rangfolge ändert; die gute Folge nennt „gleichauf“ für den späteren Einzug (C) – beides stimmt für den ersten Schritt
  const empfehlung = v.empfehlungHtml.replace(/<[^>]*>/gu, '');
  assert.match(empfehlung, /Zählen Strombedarf und Betrieb mehr, ändert sich die Rangfolge\./u);
  const gut = k.antworten.find((a) => a.wertung === 'gut');
  assert.ok(gut);
  const folge = gut.folgeHtml.replace(/<[^>]*>/gu, '');
  assert.match(folge, /wenn mir Strombedarf und Betrieb wichtig wären\?.*Dann läge der spätere Einzug gleichauf/u);
  // P19.8 (U-03): die Frage nennt die Stufe, für die „gleichauf“ gerechnet ist – „wichtig“ (3); bei „sehr wichtig“ (5) läge der spätere Einzug vorn
  assert.doesNotMatch(folge, /wichtiger|sehr wichtig/u, 'die Frage bindet „gleichauf“ an die Stufe „wichtig“');
  assert.equal(vergleichLage(V, { ...abgestimmteGewichte(V), klima: 3 }).satz, 'gleichauf');
  assert.equal(vergleichLage(V, { ...abgestimmteGewichte(V), klima: 5 }).satz, 'C', 'bei „sehr wichtig“ liegt der spätere Einzug vorn');
  assert.doesNotMatch(folge, /\bvorn\b/u, 'nicht „vorn“ statt „gleichauf“');
  // der Satz der Seite für diese Stellung ist „gleichauf“ (nicht vorn)
  assert.equal(vergleichLage(v, { ...abgestimmteGewichte(v), klima: 3 }).satz, 'gleichauf');
  // Gegenproben für den Prüfer (Mutationen M7/M12 aus R75): „vorn“ statt „gleichauf“ und eine falsche Stufe werden gefunden
  const bsp = 'Wären Strombedarf und Betrieb „wichtig“, läge der spätere Einzug gleichauf.';
  assert.deepEqual(kippSatzFunde(bsp, v, 'klima', 'C'), []);
  assert.ok(kippSatzFunde(bsp.replace('gleichauf', 'vorn'), v, 'klima', 'C').length > 0);
  assert.ok(kippSatzFunde(bsp.replace('„wichtig“', '„sehr wichtig“'), v, 'klima', 'C').length > 0);
});
