/*
 * Mini-Registry (P19.1, L-270): jede Mini-Art ist an einer Stelle beschrieben (src/geschichte/mini-arten.ts, Darstellung in
 * src/ui/flaechen/geschichte-mini.ts). Geprüft: Vollständigkeit der Tabellen, die Kernschleifen kennen keine einzelne Art,
 * ein alter Stand (gk.story v2, Wortlaut vor dem Umbau) lädt unverändert, Zug · Auswertung · Lösung · Änderung je Art.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { inhalte } from '../src/inhalte/index.ts';
import { STAND_VERSION, klickeReihe, leseStand, miniZug, neuerStand, ordneZu, werteMiniAus } from '../src/geschichte/engine.ts';
import { MINI_ARTEN, MINI_ART_KENNUNGEN, miniArt } from '../src/geschichte/mini-arten.ts';
import { loeseMini } from '../src/regie/eingriffe.ts';
import { geaenderterPosten } from '../src/regie/leinwand.ts';
import type { Geschichte } from '../src/geschichte/typen.ts';

const G0 = inhalte.geschichte;
assert.ok(G0, 'Story fehlt in den Inhalten');
const G: Geschichte = G0;
const mitMini = G.kapitel.filter((k) => k.mini !== null);

test('Registry: Kennung = Schlüssel, die zwei bisherigen und die fünf neuen Arten (P19.5), unbekannte Kennung ergibt null', () => {
  assert.deepEqual([...MINI_ART_KENNUNGEN], ['zuordnen', 'reihenfolge', 'matrix', 'mappe', 'pinnwand', 'bericht', 'rueckfragen']);
  for (const [schluessel, def] of Object.entries(MINI_ARTEN)) assert.equal(def.art, schluessel);
  assert.equal(miniArt('blatt'), null);
  assert.equal(miniArt('toString'), null);
  // Gegenprobe: jede Art der Inhalte ist in der Registry
  for (const k of mitMini) assert.ok(miniArt(k.mini?.art ?? ''), k.id);
});

test('alter Stand (gk.story v2, Wortlaut vor dem Umbau) lädt unverändert; das Format bleibt v 2', () => {
  assert.equal(STAND_VERSION, 2);
  const alt = {
    v: 2, schritt: { ort: 'kapitel', kapitel: 'k6', teil: 'mini' }, wahlen: { k1: 0, k2: 2 },
    mini: { k2: [0, -1, 1, -1, -1, -1], k6: [1, 0, 2] }, gewichte: null, kurz: false,
  };
  const s = leseStand(G, JSON.parse(JSON.stringify(alt)));
  assert.deepEqual(s, alt);
  // Gegenprobe: ein Stand mit anderer Fassung wird verworfen
  assert.equal(leseStand(G, { ...alt, v: 3 }), null);
});

test('Laden: die Prüfung der Zahlenliste kommt aus der Registry (zuordnen: Länge und Plätze; reihenfolge: Plätze ohne Doppel)', () => {
  const lade = (kapitel: string, liste: unknown): unknown => leseStand(G, { v: 2, kurz: false, schritt: { ort: 'auftakt' }, mini: { [kapitel]: liste } })?.mini[kapitel];
  assert.deepEqual(lade('k4', [0, 1, -1, -1, -1, -1]), [0, 1, -1, -1, -1, -1]);
  assert.equal(lade('k4', [0, 1]), undefined);
  assert.equal(lade('k4', [0, 1, -1, -1, -1, 9]), undefined);
  assert.deepEqual(lade('k6', [2, 0]), [2, 0]);
  assert.equal(lade('k6', [2, 2]), undefined);
  assert.equal(lade('k6', [9]), undefined);
  assert.equal(lade('k6', 'x'), undefined);
});

test('Zug, Auswertung, Lösung und Änderung je Art; ordneZu/klickeReihe sind nur der Zug der jeweiligen Art', () => {
  for (const k of mitMini) {
    const m = k.mini!;
    const def = MINI_ARTEN[m.art];
    // Regie „Auflösen“: alles richtig, die Zahlenliste passt zur Registry-Prüfung
    const geloest = loeseMini(G, neuerStand(), k.id);
    const liste = geloest.mini[k.id] ?? [];
    assert.ok(def.gueltig(m, liste), k.id);
    const aus = werteMiniAus(m, liste);
    assert.ok(aus.fertig && aus.richtig === m.posten.length, k.id);
    // leer: alles offen, nichts fertig (Gegenprobe)
    assert.ok(werteMiniAus(m, undefined).je.every((x) => x === 'offen'), k.id);
    // erster Zug: der Posten 0 ändert sich, sonst nichts
    const s1 = m.art === 'zuordnen' ? ordneZu(G, neuerStand(), k.id, 0, 0) : klickeReihe(G, neuerStand(), k.id, 0);
    assert.notEqual(s1, neuerStand(), k.id);
    assert.equal(geaenderterPosten(m.art, [], s1.mini[k.id] ?? []), 0, k.id);
    assert.equal(geaenderterPosten(m.art, s1.mini[k.id] ?? [], s1.mini[k.id] ?? []), null, k.id);
    // der allgemeine Zug liefert dasselbe wie der Zug der Art
    const allgemein = miniZug(G, neuerStand(), k.id, 0, m.art === 'zuordnen' ? 0 : undefined);
    assert.deepEqual(allgemein.mini, s1.mini, k.id);
    // ungültiger Posten: der Stand bleibt dasselbe Objekt
    const leer = neuerStand();
    assert.equal(miniZug(G, leer, k.id, -1, 0), leer, k.id);
    assert.equal(miniZug(G, leer, k.id, m.posten.length, 0), leer, k.id);
  }
  // die Funktion der anderen Art greift nicht
  const zu = mitMini.find((k) => k.mini?.art === 'zuordnen')!;
  const re = mitMini.find((k) => k.mini?.art === 'reihenfolge')!;
  const leer = neuerStand();
  assert.equal(klickeReihe(G, leer, zu.id, 0), leer);
  assert.equal(ordneZu(G, leer, re.id, 0, 0), leer);
  assert.equal(ordneZu(G, leer, 'k99', 0, 0), leer);
});

test('Lesezeit und Druck: die bisherigen Arten nehmen nichts aus der Zählung aus; von den neuen nur die Gespräche der Rückfragen', () => {
  for (const [art, def] of Object.entries(MINI_ARTEN)) assert.deepEqual([...def.lesezeitOhne], art === 'rueckfragen' ? ['.gs-gespraech'] : [], art);
});
