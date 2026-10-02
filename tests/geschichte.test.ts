/*
 * Story (P16.6): Übersetzer (inhalte/geschichte → inhalte.json), gewichteter Vergleich und Ablauf.
 * Die Zahlen sind die der Stationen; ändert sich ein Punktwert, muss dieser Test bewusst mitgehen.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { kompiliere } from '../werkzeuge/inhalte.mjs';
import { kipppunkte, rangfolge, spitze, summe } from '../src/geschichte/mcda.ts';
import {
  empfohlen, empfehlungstextGilt, geheZu, gewichte, gilt, leseStand, neuerStand, offeneStationen, pufferUrteil,
  schritte, setzeGewicht, setzeKurz, station, status, waehle, weiter, zurueck, type Stand,
} from '../src/geschichte/engine.ts';
import type { Geschichte, Station } from '../src/geschichte/typen.ts';

const erg = await kompiliere({ pruefe: true, ziel: null });
const g = (erg.inhalte as { geschichte: Geschichte }).geschichte;
const st = (id: string): Station => {
  const s = station(g, id);
  assert.ok(s, id);
  return s;
};
const STANDARD = { kosten: 3, termin: 5, qualitaet: 3, klima: 2 };

test('Übersetzer: keine Befunde, acht Stationen, Belege bleiben intern', () => {
  assert.deepEqual(erg.fehler, []);
  assert.equal(g.stationen.length, 8);
  assert.deepEqual(g.stationen.filter((s) => s.kurzfassung).map((s) => s.id), ['s1', 's3', 's5', 's8']);
  const json = JSON.stringify(g);
  assert.doesNotMatch(json, /v24:|"belege"/u);
  assert.doesNotMatch(json, /"regie"/u, 'Regie-Notizen gehören nicht in die öffentliche Story');
  assert.ok((erg.inhalte as { geschichteRegie: Record<string, unknown> }).geschichteRegie['s8']);
});

test('MCDA: Summen und Rangfolge wie in den Stationen', () => {
  const v = st('s3').vorlage;
  assert.deepEqual(rangfolge(v.optionen, g.kriterien, STANDARD).map((p) => [p.option.id, p.summe]), [['A', 54], ['C', 42], ['B', 40]]);
  const o = v.optionen.find((x) => x.id === 'A');
  assert.ok(o);
  assert.equal(summe(o, g.kriterien, STANDARD), 54);
});

const KOSTEN_ZUERST = { kosten: 5, termin: 3, qualitaet: 3, klima: 2 };
const AUSGEWOGEN = { kosten: 4, termin: 4, qualitaet: 3, klima: 3 };
const summen = (id: string, gew: Record<string, number>) => Object.fromEntries(rangfolge(st(id).vorlage.optionen, g.kriterien, gew).map((p) => [p.option.id, p.summe]));

test('MCDA: Skalen des Projektblatts – Kosten- und Terminpunkte folgen aus den Folgen jeder Option (s1)', () => {
  // Mehrkosten bis 20/50/150/500 TEUR → 5/4/3/2, sonst 1 (Einsparung = keine Mehrkosten); Verzug bis 7/14/21/28 Tage → 5/4/3/2, sonst 1
  const kosten = (mio: number) => { const t = Math.max(0, mio) * 1000; return t <= 20 ? 5 : t <= 50 ? 4 : t <= 150 ? 3 : t <= 500 ? 2 : 1; };
  const termin = (tage: number) => (tage <= 7 ? 5 : tage <= 14 ? 4 : tage <= 21 ? 3 : tage <= 28 ? 2 : 1);
  for (const x of g.stationen) {
    for (const o of x.vorlage.optionen) {
      if (o.punkte === null) continue;
      assert.equal(o.punkte['kosten']?.[0], kosten(o.folgen.kosten ?? 0), `${x.id} ${o.id} Kosten`);
      assert.equal(o.punkte['termin']?.[0], termin(-(o.folgen.puffer ?? 0)), `${x.id} ${o.id} Termin`);
    }
  }
});

test('MCDA: Summen und Gewichtungsaussagen der Empfehlungstexte', () => {
  assert.deepEqual(summen('s2', STANDARD), { B: 58, A: 55, C: 48 });
  assert.deepEqual(summen('s3', KOSTEN_ZUERST), { A: 50, B: 48, C: 36 }, 's3: „Kosten vor Termin“ – A knapp vorn, 50 zu 48');
  assert.deepEqual(summen('s4', STANDARD), { B: 52, C: 52, A: 44 }, 's4: B und C gleichauf');
  assert.deepEqual(spitze(st('s4').vorlage.optionen, g.kriterien, KOSTEN_ZUERST), ['C']);
  assert.deepEqual(spitze(st('s4').vorlage.optionen, g.kriterien, AUSGEWOGEN), ['C']);
  assert.deepEqual(spitze(st('s4').vorlage.optionen, g.kriterien, { ...STANDARD, kosten: 4 }), ['C'], 's4: ein Punkt mehr auf Kosten');
  for (const gew of [STANDARD, KOSTEN_ZUERST, AUSGEWOGEN]) {
    assert.deepEqual(spitze(st('s2').vorlage.optionen, g.kriterien, gew), ['B']);
    // s5: B und C in jeder Gewichtung punktgleich (C „Neufestlegung vorbereiten“ kostet weder Geld noch Zeit, R68)
    assert.deepEqual([...spitze(st('s5').vorlage.optionen, g.kriterien, gew)].sort(), ['B', 'C']);
    assert.deepEqual(spitze(st('s7').vorlage.optionen, g.kriterien, gew), ['A']);
  }
  assert.deepEqual(summen('s5', STANDARD), { B: 60, C: 60, A: 54 });
  assert.deepEqual(summen('s5', AUSGEWOGEN), { B: 64, C: 64, A: 58 });
  assert.deepEqual(summen('s8', STANDARD), { A: 57, B: 48 });
  assert.deepEqual(summen('s8', AUSGEWOGEN), { A: 59, B: 55 });
  assert.deepEqual(summen('s8', KOSTEN_ZUERST), { B: 54, A: 53 });
});

test('MCDA: Lüftungsgerät kippt bei „Kosten vor Termin“', () => {
  const v = st('s8').vorlage;
  assert.deepEqual(spitze(v.optionen, g.kriterien, STANDARD), ['A']);
  assert.deepEqual(spitze(v.optionen, g.kriterien, KOSTEN_ZUERST), ['B']);
  const k = kipppunkte(v.optionen, g.kriterien, STANDARD);
  assert.ok(k.some((x) => x.kriterium === 'kosten' || x.kriterium === 'termin'));
});

test('MCDA: Klärung geht nicht in den Vergleich', () => {
  const v = st('s6').vorlage;
  assert.ok(v.unvollstaendigHtml);
  assert.deepEqual(rangfolge(v.optionen, g.kriterien, STANDARD).map((p) => p.option.id), ['A']);
});

test('Empfehlungen passen zu den vorgeschlagenen Gewichten', () => {
  const s = neuerStand();
  for (const x of g.stationen) assert.equal(empfohlen(g, s, x), x.vorlage.empfehlung.option, x.id);
  const kostenZuerst = waehle(g, s, 's1', 'B');
  assert.equal(empfohlen(g, kostenZuerst, st('s8')), 'B');
  assert.equal(empfehlungstextGilt(g, kostenZuerst, st('s8')), false);
});

test('Ablauf: Schritte, weiter, zurück, Kurzfassung', () => {
  assert.equal(schritte(g, false).length, 2 + 8 * 3);
  assert.equal(schritte(g, true).length, 2 + 4 * 3);
  let s = neuerStand();
  s = weiter(g, s);
  assert.deepEqual(s.schritt, { ort: 'station', station: 's1', teil: 'lage' });
  s = zurueck(g, s);
  assert.deepEqual(s.schritt, { ort: 'prolog' });
  s = geheZu(g, s, { ort: 'station', station: 's2', teil: 'vorlage' });
  s = setzeKurz(g, s, true);
  assert.deepEqual(s.schritt, { ort: 'station', station: 's3', teil: 'lage' });
  assert.deepEqual(geheZu(g, s, { ort: 'station', station: 's2', teil: 'lage' }), s, 's2 liegt nicht auf dem kurzen Weg');
});

test('Status: Lage-Folgen, Entscheidungen erst ab der Folge, Kurzfassung mit Empfehlungen', () => {
  let s: Stand = neuerStand();
  assert.deepEqual(status(g, s), { kosten: 58.4, puffer: 42, offen: 0 });
  s = waehle(g, s, 's3', 'B');
  assert.equal(status(g, s, { ort: 'station', station: 's3', teil: 'vorlage' }).puffer, 42);
  assert.equal(status(g, s, { ort: 'station', station: 's3', teil: 'folge' }).puffer, 7);
  assert.equal(status(g, s, { ort: 'station', station: 's3', teil: 'folge' }).offen, 1);
  // s5 bringt eine Kostenänderung aus der Lage (nur das, was die Beschlüsse aus s3/s4 noch nicht gebucht haben)
  assert.equal(status(g, neuerStand(), { ort: 'station', station: 's5', teil: 'lage' }).kosten, 60.13);
  // Kurzfassung: übersprungene Stationen zählen mit ihrer Empfehlung
  const kurz = { ...neuerStand(true), schritt: { ort: 'ende' } as const };
  const lang = { ...neuerStand(), schritt: { ort: 'ende' } as const };
  let alleEmpfohlen: Stand = lang;
  for (const x of g.stationen) alleEmpfohlen = waehle(g, alleEmpfohlen, x.id, x.vorlage.empfehlung.option);
  const kurzEmpfohlen = ['s1', 's3', 's5', 's8'].reduce((a, id) => waehle(g, a, id, st(id).vorlage.empfehlung.option), kurz as Stand);
  assert.deepEqual(status(g, kurzEmpfohlen), status(g, alleEmpfohlen));
  assert.equal(pufferUrteil(status(g, alleEmpfohlen).puffer), 'gut');
});

test('Zahlen der Story: Status und Bericht passen auf dem empfohlenen Weg zusammen (inhalte/fall.md)', () => {
  let s: Stand = neuerStand();
  for (const x of g.stationen) s = waehle(g, s, x.id, x.vorlage.empfehlung.option);
  const bei = (id: string, teil: 'lage' | 'folge') => status(g, s, { ort: 'station', station: id, teil });
  // Monatsbericht Mai: Version 3 = 60,4 Mio. € (+2,0 Mio. € = 3,4 % über der Basis), unter Basis plus Reserve (61,3)
  assert.equal(bei('s5', 'lage').kosten, 60.4);
  assert.equal(Math.round(((60.4 - 58.4) / 58.4) * 1000) / 10, 3.4);
  // Vergabe: nur die neuen 0,3 Mio. € kommen dazu, die 0,6 Mio. € Marktpreise stehen seit Mai in der Prognose
  assert.equal(bei('s7', 'lage').kosten, 61.1);
  assert.equal(bei('s7', 'folge').kosten, 61.1, 'die Freigabe der Reserve ändert die Prognose nicht');
  const ende = status(g, { ...s, schritt: { ort: 'ende' } });
  assert.deepEqual(ende, { kosten: 61.18, puffer: 28, offen: 0 });
  assert.ok(ende.kosten <= 58.4 + 2.9, 'Basis plus Reserve hält auf dem empfohlenen Weg');
  // Auf jedem Weg liegt der Mai-Stand über der Basis und unter Basis plus Reserve; mit dem vollen Nachtrag (1,2) darüber
  const wege: Stand[] = [];
  for (const a of ['A', 'B', 'C']) for (const b of ['A', 'B', 'C']) wege.push(waehle(g, waehle(g, neuerStand(), 's3', a), 's4', b));
  for (const w of wege) {
    const k = status(g, w, { ort: 'station', station: 's5', teil: 'lage' }).kosten;
    assert.ok(k > 58.4 && k < 61.3 && k + 1.2 > 61.3, String(k));
  }
});

/** Alle Wege der ganzen Geschichte (Station 1 mit den vorgeschlagenen Gewichten). */
function alleWege(): { stand: Stand; w: Record<string, string> }[] {
  const ids = g.stationen.filter((x) => x.vorlage.art === 'optionen').map((x) => x.id);
  const aus: { stand: Stand; w: Record<string, string> }[] = [];
  const geh = (i: number, s: Stand, w: Record<string, string>): void => {
    const id = ids[i];
    if (id === undefined) { aus.push({ stand: s, w }); return; }
    for (const o of st(id).vorlage.optionen) geh(i + 1, waehle(g, s, id, o.id), { ...w, [id]: o.id });
  };
  geh(0, neuerStand(), {});
  return aus;
}

/** Berichtszeilen einer Station, die beim Stand gelten (Statusbedingungen bei ihrer Lage). */
const berichtBei = (stand: Stand, id: string): string => st(id).bericht.zeilen.filter((z) => gilt(g, stand, z.wenn, st(id))).map((z) => z.html).join(' ');

/** Alle Wege der Kurzfassung (Station 1 mit den vorgeschlagenen Gewichten). */
function alleKurzWege(): Stand[] {
  const ids = g.stationen.filter((x) => x.kurzfassung && x.vorlage.art === 'optionen').map((x) => x.id);
  const aus: Stand[] = [];
  const geh = (i: number, s: Stand): void => {
    const id = ids[i];
    if (id === undefined) { aus.push(s); return; }
    for (const o of st(id).vorlage.optionen) geh(i + 1, waehle(g, s, id, o.id));
  };
  geh(0, neuerStand(true));
  return aus;
}

test('Offene Entscheidungen: jede vertagte Entscheidung wird erledigt – am Ende offen bleibt nur die Neufestlegung der Projektbasis', () => {
  const wege = alleWege();
  assert.equal(wege.length, 3 * 3 * 3 * 3 * 2 * 3 * 2);
  let neufestlegungOhneC = 0;
  for (const { stand, w } of wege) {
    const ende = status(g, { ...stand, schritt: { ort: 'ende' } });
    // offen bleibt nur die Neufestlegung: vorbereitet (s5 = C) oder nötig geworden, weil die Prognose über Basis plus Reserve liegt (R69)
    const s8 = status(g, stand, { ort: 'station', station: 's8', teil: 'lage' }).kosten;
    const noetig = w['s5'] === 'B' && s8 > 58.4 + 2.9;
    if (noetig) neufestlegungOhneC++;
    assert.equal(ende.offen, w['s5'] === 'C' || noetig ? 1 : 0, JSON.stringify(w));
    for (const x of g.stationen) assert.ok(status(g, stand, { ort: 'station', station: x.id, teil: 'lage' }).offen >= 0, `${x.id} ${JSON.stringify(w)}`);
  }
  assert.ok(neufestlegungOhneC > 0);
});

/** Eine Berichtszeile nennt eine offene Entscheidung (R69: Status „offen“ und Text gehören zusammen). */
const NENNT_OFFEN = /bleibt offen|steh(?:t|en) noch aus/u;

test('Offene Entscheidungen (R69): Der Bericht nennt eine offene Entscheidung genau dann, wenn der Status sie zählt – an jeder Station und am Ende, auf allen Wegen', () => {
  const pruefe = (stand: Stand, ids: string[], wo: string): void => {
    for (const id of ids) {
      const offen = status(g, stand, { ort: 'station', station: id, teil: 'lage' }).offen;
      assert.equal(NENNT_OFFEN.test(berichtBei(stand, id)), offen >= 1, `${id} offen ${offen} ${wo}`);
    }
    // am Ende: offen genau dann, wenn der letzte Bericht eine offene Entscheidung nennt
    const ende = status(g, { ...stand, schritt: { ort: 'ende' } }).offen;
    assert.equal(ende >= 1, NENNT_OFFEN.test(berichtBei(stand, 's8')), `Ende offen ${ende} ${wo}`);
  };
  let mitOffen = 0;
  for (const { stand, w } of alleWege()) {
    pruefe(stand, ['s2', 's3', 's4', 's5', 's6', 's7', 's8'], JSON.stringify(w));
    if (status(g, { ...stand, schritt: { ort: 'ende' } }).offen >= 1) mitOffen++;
  }
  for (const stand of alleKurzWege()) pruefe(stand, ['s3', 's5', 's8'], `kurz ${JSON.stringify(stand.wahlen)}`);
  assert.ok(mitOffen > 0);
});

test('Grenze Basis plus Reserve: Die Berichte in s7 und s8 sagen auf jedem Weg, ob die Prognose darüber liegt (R69: Statusbedingungen)', () => {
  const GRENZE = 58.4 + 2.9;
  const UEBER = /liegt (die Prognose )?über Basis plus Reserve|weil die Prognose über Basis plus Reserve/u;
  for (const { stand, w } of alleWege()) {
    const s7 = status(g, stand, { ort: 'station', station: 's7', teil: 'lage' }).kosten;
    assert.equal(s7 > GRENZE, gilt(g, stand, 's4=A & s5!=A'), `s7 ${s7} ${JSON.stringify(w)}`);
    assert.equal(UEBER.test(berichtBei(stand, 's7')), s7 > GRENZE, `s7 ${s7} ${JSON.stringify(w)}`);
    const s8 = status(g, stand, { ort: 'station', station: 's8', teil: 'lage' }).kosten;
    const zeilen = berichtBei(stand, 's8');
    assert.equal(UEBER.test(zeilen), s8 > GRENZE, `s8 ${s8} ${JSON.stringify(w)}`);
    // „wieder unter“ genau dort, wo s7 darüber lag und s8 nicht mehr
    assert.equal(/wieder unter Basis plus Reserve/u.test(zeilen), s7 > GRENZE && s8 <= GRENZE, `s8 ${s8} ${JSON.stringify(w)}`);
    if (w['s5'] === 'B') assert.equal(/nötig, weil die Prognose über/u.test(zeilen), s8 > GRENZE, `s8 ${s8} ${JSON.stringify(w)}`);
  }
});

test('Grenze Basis plus Reserve am Ende: Liegt die Prognose darüber, sagt es der Bericht in Station 8 – auch wenn erst das Ersatzgerät sie hebt', () => {
  const GRENZE = 58.4 + 2.9;
  const ersatz = st('s8').vorlage.optionen.find((o) => o.id === 'A')?.folgen.kosten ?? 0;
  let ueber = 0;
  for (const { stand, w } of alleWege()) {
    const s8 = status(g, stand, { ort: 'station', station: 's8', teil: 'lage' }).kosten;
    const ende = status(g, { ...stand, schritt: { ort: 'ende' } }).kosten;
    const zeilen = berichtBei(stand, 's8');
    const warnung = /mit dem Ersatzgerät \(\+0,08 Mio\. €\) läge die Prognose über/u.test(zeilen);
    // die Warnung steht genau dort, wo die Lage noch darunter liegt und das Ersatzgerät die Grenze überschreiten würde
    assert.equal(warnung, s8 <= GRENZE && Math.round((s8 + ersatz) * 100) / 100 > GRENZE, `s8 ${s8} ${JSON.stringify(w)}`);
    if (ende > GRENZE) {
      ueber++;
      assert.match(zeilen, /nötig, weil die Prognose über|Die Prognose liegt über Basis plus Reserve|mit dem Ersatzgerät \(\+0,08 Mio\. €\) läge die Prognose über/u, `Ende ${ende} ${JSON.stringify(w)}`);
    }
  }
  assert.ok(ueber > 0);
});

test('Kurzfassung: der Bericht in Station 8 erklärt den Sprung seit Mai 2026', () => {
  let s: Stand = neuerStand(true);
  for (const id of ['s1', 's3', 's5', 's8']) s = waehle(g, s, id, st(id).vorlage.empfehlung.option);
  const vorher = status(g, s, { ort: 'station', station: 's5', teil: 'folge' });
  const nachher = status(g, s, { ort: 'station', station: 's8', teil: 'lage' });
  // Brandschutzauflage 0,4 Mio. € / 7 Tage, Vergabe Holzbau +0,3 Mio. €
  assert.equal(Math.round((nachher.kosten - vorher.kosten) * 100) / 100, 0.7);
  assert.equal(vorher.puffer - nachher.puffer, 7);
  assert.ok(st('s8').bericht.zeilen.some((z) => z.wenn === 'kurz' && gilt(g, s, z.wenn)));
});

test('Bedingungen und offene Stationen', () => {
  let s = neuerStand();
  assert.equal(gilt(g, s, 's3=A'), false);
  assert.equal(gilt(g, s, 's3!=A'), false);
  s = waehle(g, s, 's3', 'B');
  assert.equal(gilt(g, s, 's3=B'), true);
  assert.equal(gilt(g, s, 's3!=A'), true);
  assert.equal(gilt(g, s, null), true);
  assert.equal(offeneStationen(g, s).length, 7);
});

test('Gewichte: Variante wählen, fein einstellen, begrenzen', () => {
  let s = neuerStand();
  assert.deepEqual(gewichte(g, s), STANDARD);
  s = setzeGewicht(g, s, 'klima', 9);
  assert.equal(gewichte(g, s)['klima'], 5);
  s = waehle(g, s, 's1', 'C');
  assert.equal(s.gewichte, null);
  assert.equal(setzeGewicht(g, s, 'unbekannt', 2), s);
});

test('Speichern: gültiger Stand kommt zurück, Unpassendes fällt weg', () => {
  let s = waehle(g, neuerStand(), 's2', 'B');
  s = setzeGewicht(g, s, 'kosten', 4);
  s = geheZu(g, s, { ort: 'station', station: 's4', teil: 'folge' });
  assert.deepEqual(leseStand(g, JSON.parse(JSON.stringify(s))), s);
  const kaputt = leseStand(g, { v: 1, wahlen: { s2: 'Z', sX: 'A' }, schritt: { ort: 'station', station: 's9', teil: 'lage' } });
  assert.deepEqual(kaputt, neuerStand());
  assert.equal(leseStand(g, { v: 2 }), null);
  assert.equal(leseStand(g, 'x'), null);
});

test('Speichern (R68): die Kurzfassung bleibt nach dem Neuladen Kurzfassung – samt Weg und Status', () => {
  let s = waehle(g, neuerStand(true), 's1', 'A');
  s = geheZu(g, s, { ort: 'station', station: 's3', teil: 'vorlage' });
  const zurueck = leseStand(g, JSON.parse(JSON.stringify(s)));
  assert.ok(zurueck);
  assert.equal(zurueck.kurz, true);
  assert.deepEqual(zurueck, s);
  assert.equal(schritte(g, zurueck.kurz).length, schritte(g, true).length);
  // übersprungene Stationen gelten mit der Empfehlung – der Status ist der der Kurzfassung
  assert.deepEqual(status(g, zurueck, { ort: 'ende' }), status(g, s, { ort: 'ende' }));
  assert.equal(leseStand(g, { ...JSON.parse(JSON.stringify(s)), kurz: 'ja' })?.kurz, false, 'nur true zählt');
});

test('Puffer-Urteil: über eine Woche gut, bis null knapp, darunter schlecht', () => {
  assert.equal(pufferUrteil(8), 'gut');
  assert.equal(pufferUrteil(7), 'knapp');
  assert.equal(pufferUrteil(1), 'knapp');
  assert.equal(pufferUrteil(0), 'knapp');
  assert.equal(pufferUrteil(-1), 'schlecht');
});

test('Bedingungen mit „&“, „kurz“, „lang“ und bedingte Lage-Folgen', async () => {
  const { inhalte: i } = await kompiliere({ ziel: null });
  const g0 = i.geschichte as Geschichte;
  const g: Geschichte = { ...g0, stationen: g0.stationen.map((s) => (s.nr === 3 ? { ...s, lageFolgenBedingt: [{ wenn: 's1=A & s2=B', folgen: { offen: 5 } }] } : s)) };
  let st = neuerStand();
  st = waehle(g, st, 's1', 'A');
  st = waehle(g, st, 's2', 'B');
  assert.equal(gilt(g, st, 's1=A & s2=B'), true);
  assert.equal(gilt(g, st, 's1=A & s2!=B'), false);
  assert.equal(gilt(g, st, 'lang'), true);
  assert.equal(gilt(g, { ...st, kurz: true }, 'kurz & s1=A'), true);
  const s3 = g.stationen.find((s) => s.nr === 3) as Station;
  const ohne = status(g0, { ...st, schritt: { ort: 'station', station: s3.id, teil: 'lage' } }).offen;
  const mit = status(g, { ...st, schritt: { ort: 'station', station: s3.id, teil: 'lage' } }).offen;
  assert.equal(mit - ohne, 5);
  st = waehle(g, st, 's2', 'A');
  assert.equal(status(g, { ...st, schritt: { ort: 'station', station: s3.id, teil: 'lage' } }).offen, status(g0, { ...st, schritt: { ort: 'station', station: s3.id, teil: 'lage' } }).offen);
});

test('Kipppunkte: je Kriterium beide Richtungen, Gleichstand als mehrere an der Spitze', () => {
  const v = st('s4').vorlage;
  const k = kipppunkte(v.optionen, g.kriterien, STANDARD);
  const kosten = k.filter((x) => x.kriterium === 'kosten');
  assert.ok(kosten.some((x) => x.gewicht < (STANDARD['kosten'] ?? 0)) || kosten.some((x) => x.gewicht > (STANDARD['kosten'] ?? 0)));
  for (const x of k) assert.notDeepEqual(x.spitze, spitze(v.optionen, g.kriterien, STANDARD));
});

test('MCDA: gleiche Begründung heißt gleicher Punkt – innerhalb jeder Vorlage (R68)', () => {
  for (const x of g.stationen) {
    const je = new Map<string, number>();
    for (const o of x.vorlage.optionen) {
      if (o.punkte === null) continue;
      for (const [k, p] of Object.entries(o.punkte)) {
        if (p === undefined) continue;
        const schl = `${k}|${p[1]}`;
        const vorher = je.get(schl);
        if (vorher !== undefined) assert.equal(p[0], vorher, `${x.id} ${o.id} ${k} „${p[1]}“`);
        je.set(schl, p[0]);
      }
    }
  }
});

test('Empfehlungstexte nennen die Gewichtung beim Namen – s4 bleibt mit verschobenen Gewichten richtig (R68)', () => {
  const t = st('s4').vorlage.empfehlung.html;
  assert.match(t, /mit „Termin vor Kosten“ liegen B und C gleichauf \(52 zu 52\)/u);
  assert.doesNotMatch(t, /mit den festgelegten Gewichten/u);
  // „ein Punkt mehr auf Kosten“ gilt von „Termin vor Kosten“ aus
  assert.deepEqual(spitze(st('s4').vorlage.optionen, g.kriterien, { ...STANDARD, kosten: 4 }), ['C']);
});

test('Station 1: die Gewichte legt der Bauherr fest, die Bauherren-PL empfiehlt (R68)', () => {
  const s1 = st('s1');
  assert.match(s1.vorlage.stelle, /^Bauherr – Dr\. Miriam Olbers/u);
  assert.match(s1.bericht.reaktion, /Ihre Empfehlung geht an Dr\. Olbers/u);
});

test('Station 8: die Mehrkosten kommen aus der Reserve – Freigabe des Bauherrn als Vorbehalt (R68)', () => {
  const s8 = st('s8');
  assert.match(s8.vorlage.stelle, /im Mandat bis 100 TEUR.*Reserve.*Bauherr/u);
  for (const { stand } of alleWege()) assert.ok(status(g, stand, { ort: 'station', station: 's8', teil: 'lage' }).kosten > 58.4);
  const a = s8.vorlage.optionen.find((o) => o.id === 'A');
  assert.match(a?.konsequenzHtml ?? '', /Freigabe der 0,08 Mio\. €/u);
  // R69: wegneutral – die Prognose liegt auf manchen Wegen schon über Basis plus Reserve
  assert.match(s8.vorlage.grundHtml, /soweit sie reicht; darüber hinaus braucht es die Neufestlegung der Projektbasis/u);
  for (const o of s8.vorlage.optionen) assert.doesNotMatch(`${o.html} ${o.konsequenzHtml}`, /aus der Reserve/u, `s8 ${o.id}`);
});

test('Reserve-Vorbehalt als allgemeine Regel (R69): s1 nennt sie, jede Vorlage mit Mehrkosten außerhalb des Bauherrn nennt den Vorbehalt', () => {
  assert.match(st('s1').lageHtml, /Mehrkosten über der Projektbasis gehen zulasten der Risikoreserve; ihren Einsatz gibt der Bauherr frei/u);
  for (const id of ['s3', 's4', 's6', 's8']) assert.match(st(id).vorlage.stelle, /Mehrkosten aus der Reserve gibt der Bauherr frei$/u, id);
  // wo das Änderungsgremium entscheidet, fragt die Reaktion nach Ihrer Empfehlung
  for (const id of ['s3', 's4', 's6']) assert.match(st(id).bericht.reaktion, /^Was empfehlen Sie dem Änderungsgremium/u, id);
  assert.doesNotMatch(st('s2').lageHtml, /die Sie verantworten/u);
  assert.doesNotMatch(berichtBei(waehle(g, waehle(g, neuerStand(), 's3', 'B'), 's5', 'B'), 's7'), /freigegeben ist noch nichts/u);
});

test('Negativer Terminpuffer: Die Berichte in s4–s8 nennen ihn auf jedem Weg genau dann, wenn der Status negativ ist (R68)', () => {
  const MELDUNG = /Terminpuffer überschritten – die Inbetriebnahme zum Schuljahr 2028\/29/u;
  let negativ = 0;
  const pruefe = (stand: Stand, ids: string[], wo: string): void => {
    for (const id of ids) {
      const puffer = status(g, stand, { ort: 'station', station: id, teil: 'lage' }).puffer;
      if (puffer < 0) negativ++;
      assert.equal(MELDUNG.test(berichtBei(stand, id)), puffer < 0, `${id} Puffer ${puffer} ${wo}`);
    }
  };
  for (const { stand, w } of alleWege()) pruefe(stand, ['s4', 's5', 's6', 's7', 's8'], JSON.stringify(w));
  for (const stand of alleKurzWege()) pruefe(stand, ['s5', 's8'], `kurz ${JSON.stringify(stand.wahlen)}`);
  assert.ok(negativ > 0);
});

test('Vertagte Entscheidungen stehen im nächsten Bericht: s3 = B in s4, s5 = C in s6 (R68)', () => {
  for (const { stand, w } of alleWege()) {
    if (w['s3'] === 'B') assert.match(berichtBei(stand, 's4'), /RIS-009.*Entscheidung im März vertagt/u, JSON.stringify(w));
    if (w['s5'] === 'C') assert.match(berichtBei(stand, 's6'), /Neufestlegung der Projektbasis.*zurückgestellt.*Entscheidung bleibt offen/u, JSON.stringify(w));
  }
});

test('Ende nennt die Überschreitung von Basis plus Reserve genau dann, wenn der Endstand darüber liegt (R69)', () => {
  const zeile = g.ende.zeilen.find((z) => z.wenn === 'kosten>61.3');
  assert.ok(zeile, 'Endzeile mit Statusbedingung');
  let teuer = neuerStand();
  for (const [s, o] of [['s3', 'C'], ['s4', 'A'], ['s6', 'K']] as const) teuer = waehle(g, teuer, s, o);
  for (const st of g.stationen) if (teuer.wahlen[st.id] === undefined) teuer = waehle(g, teuer, st.id, st.vorlage.empfehlung.option);
  assert.ok(status(g, { ...teuer, schritt: { ort: 'ende' } }).kosten > 61.3);
  assert.equal(gilt(g, teuer, zeile.wenn, 'ende'), true);
  let empf = neuerStand();
  for (const st of g.stationen) empf = waehle(g, empf, st.id, st.vorlage.empfehlung.option);
  assert.equal(gilt(g, empf, zeile.wenn, 'ende'), status(g, { ...empf, schritt: { ort: 'ende' } }).kosten > 61.3);
});
