/*
 * Der Zustandsautomat der Wegtests ist selbst geprüft (P19.1, O-62, L-270): Differentialtest gegen die Wegaufzählung
 * (echte Story: die Kurzfassung ganz, der lange Weg mit den ersten 8 der 14 Stationen – die Aufzählung aller 3^14 bzw. 4^14 Wege
 * wäre keine Probe mehr; synthetische Stories mit 3 bis 6 Kapiteln, auch mit extremen Wirkungen, die die Balken an beide Grenzen
 * stoßen) und Skalierungsprobe mit 16 synthetischen Kapiteln. Den langen Weg der ganzen Story rechnet allein der Automat (tests/geschichte-wege.test.ts).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { inhalte } from '../src/inhalte/index.ts';
import { bilanzTyp, stufe } from '../src/geschichte/engine.ts';
import { BALKEN, type Geschichte } from '../src/geschichte/typen.ts';
import {
  endeSchluessel, endZustaende, endZustaendeBruteForce, synthetischeStory, zustandsautomat, type Ende,
} from './hilfen/geschichte-zustaende.ts';

const G0 = inhalte.geschichte;
assert.ok(G0, 'Story fehlt in den Inhalten');
const G: Geschichte = G0;

/** Automat und Wegaufzählung liefern dieselbe Endzustandsmenge – und auf jedem Zustand dieselben Texte (Sicht, Fassung). */
function vergleiche(g: Geschichte, kurz: boolean, mitOffen: boolean, wo: string): number {
  const brute = endZustaendeBruteForce(g, kurz, mitOffen);
  const automat = endZustaende(g, kurz, mitOffen);
  const aSchluessel = new Set(automat.map(endeSchluessel));
  assert.equal(aSchluessel.size, automat.length, `${wo}: doppelte Endzustände im Automaten`);
  const nurBrute = [...brute.keys()].filter((k) => !aSchluessel.has(k));
  const nurAutomat = [...aSchluessel].filter((k) => !brute.has(k));
  assert.deepEqual({ nurBrute: nurBrute.slice(0, 3), nurAutomat: nurAutomat.slice(0, 3) }, { nurBrute: [], nurAutomat: [] }, `${wo}: Endzustandsmengen verschieden (${brute.size} vs ${automat.length})`);
  for (const e of automat) {
    const b = brute.get(endeSchluessel(e)) as Ende;
    assert.equal(e.sicht, b.sicht, `${wo}: Bilanz-Sicht von ${e.weg}`);
    assert.equal(e.fassung, b.fassung, `${wo}: Fassung von ${e.weg}`);
  }
  return automat.length;
}

/** Die ersten n Stationen der echten Story (nur für die Wegaufzählung; Kennungen und Wirkungen unverändert). */
const ersteStationen = (g: Geschichte, n: number): Geschichte => ({ ...structuredClone(g), kapitel: structuredClone(g.kapitel.slice(0, n)) });

test('Differentialtest: echte Story – Kurzfassung ganz, langer Weg mit den ersten 8 von 14 Stationen, ohne und mit offenen Stationen', () => {
  const vorn = ersteStationen(G, 8);
  assert.equal(vorn.kapitel.length, 8);
  for (const mitOffen of [false, true]) {
    assert.ok(vergleiche(G, true, mitOffen, `echt kurz${mitOffen ? ' mit offen' : ''}`) > 10);
    assert.ok(vergleiche(vorn, false, mitOffen, `echt lang (erste 8)${mitOffen ? ' mit offen' : ''}`) > 10);
  }
});

test('Differentialtest: synthetische Stories mit 3 bis 6 Kapiteln (gewöhnliche und scharfe Wirkungen, wechselnde Kurzfassung)', () => {
  const kurzMuster: [string, (nr: number) => boolean][] = [['ungerade', (nr) => nr % 2 === 1], ['alle', () => true], ['zweites', (nr) => nr === 2]];
  let verglichen = 0;
  for (let n = 3; n <= 6; n++) for (const scharf of [false, true]) for (const [muster, kurzfassung] of kurzMuster) {
    const g = synthetischeStory(G, { n, scharf, kurzfassung });
    for (const kurz of [false, true]) for (const mitOffen of [false, true]) {
      vergleiche(g, kurz, mitOffen, `synthetisch n=${n}${scharf ? ' scharf' : ''} kurz:${muster} ${kurz ? 'kurz' : 'lang'}${mitOffen ? ' offen' : ''}`);
      verglichen += 1;
    }
  }
  assert.equal(verglichen, 4 * 2 * 3 * 4);
});

test('Skalierungsprobe: 16 synthetische Kapitel (4^16 ≈ 4,3 Milliarden Wege) in unter 2 Sekunden', () => {
  const g = synthetischeStory(G, { n: 16, kurzfassung: (nr) => nr % 4 === 0 });
  const t0 = performance.now();
  const lang = zustandsautomat(g, false, true);
  const kurz = zustandsautomat(g, true, true);
  const ohne = zustandsautomat(g, false, false);
  const ms = performance.now() - t0;
  assert.ok(ms < 2000, `${Math.round(ms)} ms`);
  assert.equal(lang.schichten.length, 16);
  assert.ok(lang.ende.length > 100 && kurz.ende.length > 10 && ohne.ende.length > 100);
  // Balken allein: höchstens 11^3 Stände
  assert.ok(new Set(lang.ende.map((z) => BALKEN.map((b) => z.b[b]).join())).size <= 1331);
  // die Eigenschaften der Wegtests gelten auch hier (allgemeine Fassung, ohne Textbezug)
  for (const kurzFassung of [false, true]) for (const e of endZustaende(g, kurzFassung, true)) {
    for (const b of BALKEN) assert.ok(e.b[b] >= 0 && e.b[b] <= 10);
    if (e.offen) { assert.equal(e.sicht, 'offen'); assert.notEqual(e.fassung, 'grund'); } else assert.equal(e.sicht, bilanzTyp(e.b, e.falle));
    if (e.sicht === 'ruhig') assert.ok(!e.falle, 'ruhig nach Falle');
    if (stufe(e.b.vertrauen) === 'niedrig') assert.equal(e.fassung, 'vertrauen-niedrig');
    if (!e.offen && e.falle && stufe(e.b.vertrauen) !== 'niedrig') assert.equal(e.fassung, 'nach-falle');
  }
});
