/*
 * Grenze Basis plus Reserve und offene Neufestlegung (R70), über alle Wege der Story gerechnet:
 * Ein Bericht schreibt die Überschreitung nur dann „dem neuen Mehrbetrag“ zu, wenn die Prognose vor der Station noch darunter lag;
 * s6 warnt, wo die Auflage die Prognose über die Grenze höbe; Freigabe- und Rückzugszeilen stimmen mit dem Status;
 * das Ende nennt jede offene Entscheidung (offen ≥ 1) und jede Überschreitung.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { kompiliere } from '../werkzeuge/inhalte.mjs';
import { gilt, neuerStand, station, status, waehle, type Stand } from '../src/geschichte/engine.ts';
import type { Geschichte, Station } from '../src/geschichte/typen.ts';

const erg = await kompiliere({ pruefe: true, ziel: null });
const g = (erg.inhalte as { geschichte: Geschichte }).geschichte;
const st = (id: string): Station => {
  const s = station(g, id);
  assert.ok(s, id);
  return s;
};
const GRENZE = Math.round((g.status.kosten.basis ?? 58.4) * 100 + 290) / 100; // 61,3 Mio. €
const rund = (x: number): number => Math.round(x * 100) / 100;

/** Alle Wege der ganzen Geschichte (Station 1 mit den vorgeschlagenen Gewichten; sie ändert keinen Status). */
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

/** Alle Wege der Kurzfassung, je Variante der Gewichte aus Station 1 (die übersprungenen Stationen zählen mit ihrer Empfehlung). */
function alleKurzWege(): Stand[] {
  const s1 = g.stationen.find((x) => x.vorlage.art === 'gewichte');
  assert.ok(s1);
  const ids = g.stationen.filter((x) => x.kurzfassung && x.vorlage.art === 'optionen').map((x) => x.id);
  const aus: Stand[] = [];
  const geh = (i: number, s: Stand): void => {
    const id = ids[i];
    if (id === undefined) { aus.push(s); return; }
    for (const o of st(id).vorlage.optionen) geh(i + 1, waehle(g, s, id, o.id));
  };
  for (const v of s1.vorlage.optionen) geh(0, waehle(g, neuerStand(true), s1.id, v.id));
  return aus;
}

const lage = (stand: Stand, id: string) => status(g, stand, { ort: 'station', station: id, teil: 'lage' });
/** Status vor der Station: nach der Folge der vorigen Station des Wegs. */
function vorher(stand: Stand, id: string): number {
  const weg = g.stationen.filter((x) => !stand.kurz || x.kurzfassung);
  const i = weg.findIndex((x) => x.id === id);
  const vor = weg[i - 1];
  return vor === undefined ? g.status.kosten.start : status(g, stand, { ort: 'station', station: vor.id, teil: 'folge' }).kosten;
}
const bericht = (stand: Stand, id: string): string => st(id).bericht.zeilen.filter((z) => gilt(g, stand, z.wenn, st(id))).map((z) => z.html).join(' ');
const ende = (stand: Stand): string => g.ende.zeilen.filter((z) => gilt(g, stand, z.wenn, 'ende')).map((z) => z.html).join(' ');
const NENNT_OFFEN = /bleibt offen|steh(?:t|en) noch aus/u;

test('Kein Bericht schreibt die Überschreitung von Basis plus Reserve dem neuen Mehrbetrag zu, wenn die Prognose vorher schon darüber lag (R70)', () => {
  const MEHRBETRAG = /neuen Mehrbetrag liegt die Prognose über Basis plus Reserve/u;
  let schonVorher = 0;
  const pruefe = (stand: Stand, wo: string): void => {
    for (const x of g.stationen) {
      if (stand.kurz && !x.kurzfassung) continue;
      const text = bericht(stand, x.id);
      const vor = vorher(stand, x.id);
      if (MEHRBETRAG.test(text)) assert.ok(vor <= GRENZE, `${x.id}: vorher ${vor} – ${wo}`);
      if (x.id === 's7' && vor > GRENZE) {
        schonVorher++;
        // Ursache ist die Brandschutzentscheidung: Lage s6 noch darunter, Folge s6 darüber
        assert.ok(lage(stand, 's6').kosten <= GRENZE, wo);
        assert.match(text, /liegt über Basis plus Reserve \(61,3 Mio\. €\), schon seit der Brandschutzentscheidung/u, wo);
      }
    }
  };
  for (const { stand, w } of alleWege()) pruefe(stand, JSON.stringify(w));
  for (const stand of alleKurzWege()) pruefe(stand, `kurz ${JSON.stringify(stand.wahlen)}`);
  assert.equal(schonVorher, 6 * 3 * 3 * 2, '6 Vorsilben s3–s6 (s4 = A, s5 ≠ A; s3 = C oder s3 = A mit s6 = K), je 3 × s2, 3 × s7, 2 × s8');
});

test('s6 warnt genau dort, wo die Auflage (oder Auflage mit Gutachten) die Prognose über Basis plus Reserve höbe (R70)', () => {
  const opt = (id: string) => st('s6').vorlage.optionen.find((o) => o.id === id)?.folgen.kosten ?? 0;
  let warnungen = 0;
  for (const { stand, w } of alleWege()) {
    const l = lage(stand, 's6').kosten;
    const text = bericht(stand, 's6');
    const ueberA = rund(l + opt('A')) > GRENZE;
    const ueberK = rund(l + opt('K')) > GRENZE;
    assert.ok(l <= GRENZE, `Lage s6 ${l}`);
    assert.equal(/Achtung – mit der Auflage/u.test(text), ueberA || ueberK, `${l} ${JSON.stringify(w)}`);
    assert.equal(/Achtung – mit der Auflage \(\+0,4 Mio\. €\) läge die Prognose über/u.test(text), ueberA, `${l} ${JSON.stringify(w)}`);
    if (ueberA || ueberK) warnungen++;
    // die Folge zeigt die Überschreitung nur auf Wegen, die der Bericht vorher genannt hat
    if (status(g, stand, { ort: 'station', station: 's6', teil: 'folge' }).kosten > GRENZE) assert.match(text, /Achtung – mit der Auflage/u, JSON.stringify(w));
  }
  assert.ok(warnungen > 0);
  assert.match(st('s6').vorlage.grundHtml ?? '', /soweit sie reicht; darüber hinaus braucht es die Neufestlegung der Projektbasis/u);
});

test('Freigaben aus der Reserve: s7 und s8 melden nur, was die Reserve gedeckt hat und welche Beschlüsse es gab (R70)', () => {
  for (const { stand, w } of alleWege()) {
    const wo = JSON.stringify(w);
    const s7 = bericht(stand, 's7');
    // „Mehrkosten aus den Beschlüssen des Änderungsgremiums“ nur, wenn es einen Beschluss mit Mehrkosten gab
    const beschluss = w['s3'] !== 'B' || w['s4'] !== 'C' || w['s6'] === 'A';
    if (w['s5'] === 'B') assert.equal(/Mehrkosten aus den Beschlüssen des Änderungsgremiums/u.test(s7), beschluss, wo);
    const s8 = bericht(stand, 's8');
    const l7 = lage(stand, 's7').kosten;
    assert.equal(/0,9 Mio\. € für den Holzbau freigegeben/u.test(s8), w['s7'] === 'A' && l7 <= GRENZE, wo);
    if (w['s7'] === 'A' && l7 > GRENZE) assert.match(s8, /freigegeben, soweit sie reichte/u, wo);
    // „nicht mehr nötig, zurückgezogen“ nur, wo auch das Ersatzgerät die Prognose nicht über die Grenze hebt
    if (/die Vorlage zurückgezogen/u.test(s8)) {
      for (const o of st('s8').vorlage.optionen) assert.ok(rund(lage(stand, 's8').kosten + (o.folgen.kosten ?? 0)) <= GRENZE, `${o.id} ${wo}`);
    }
  }
});

test('Das Ende nennt die offene Entscheidung, wenn offen ≥ 1 – sie ist immer die Neufestlegung der Projektbasis (R70)', () => {
  let offenEnde = 0;
  let ueberOhneOffen = 0;
  const pruefe = (stand: Stand, wo: string): void => {
    const e = status(g, { ...stand, schritt: { ort: 'ende' } });
    const text = ende(stand);
    assert.ok(e.offen <= 1, `Ende offen ${e.offen} ${wo}`);
    assert.equal(NENNT_OFFEN.test(text), e.offen >= 1, `Ende offen ${e.offen} ${wo}`);
    if (e.offen >= 1) {
      offenEnde++;
      assert.match(text, /Neufestlegung der Projektbasis/u, wo);
      // offen ist am Ende nur die Neufestlegung: vorbereitet (s5 = C) oder nötig geworden (s4 = A, s5 = B)
      assert.ok(gilt(g, stand, 's5=C') || gilt(g, stand, 's4=A & s5=B'), wo);
    }
    assert.equal(/über Basis plus Reserve/u.test(text), e.kosten > GRENZE, `Ende ${e.kosten} ${wo}`);
    if (e.kosten > GRENZE && e.offen < 1) {
      ueberOhneOffen++;
      // erst das Ersatzgerät hebt die Prognose über die Grenze, und der s8-Bericht hat es angekündigt
      assert.ok(gilt(g, stand, 's8=A') && lage(stand, 's8').kosten <= GRENZE, wo);
      assert.match(bericht(stand, 's8'), /mit dem Ersatzgerät \(\+0,08 Mio\. €\) läge die Prognose über/u, wo);
    }
    // nie zweimal dieselbe Aussage: höchstens eine Endzeile
    assert.ok(g.ende.zeilen.filter((z) => gilt(g, stand, z.wenn, 'ende')).length <= 1, wo);
  };
  for (const { stand, w } of alleWege()) pruefe(stand, JSON.stringify(w));
  for (const stand of alleKurzWege()) pruefe(stand, `kurz ${JSON.stringify(stand.wahlen)}`);
  assert.ok(offenEnde > 0);
  assert.equal(ueberOhneOffen, 3, 'nur s3 = C, s4 = B, s5 = B, s6 = K, s7 = A, s8 = A (× 3 für s2)');
});
