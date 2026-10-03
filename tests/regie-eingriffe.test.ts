/*
 * Eingriffe der Regie (src/regie/eingriffe.ts, P17.6): Sprung je Schritt, Wahl zurücknehmen, Mini-Aufgabe auflösen,
 * kurze Knopftexte; dazu `geaenderterPosten` der Leinwand. Jede Prüfung mit Gegenprobe.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inhalte } from '../src/inhalte/index.ts';
import { neuerStand, ordneZu, schritte, waehle, werteMiniAus } from '../src/geschichte/engine.ts';
import { ersteWorte, loeseMini, nurText, ohneWahl, schrittAus, schrittWert, springe, sprungZiele } from '../src/regie/eingriffe.ts';

const g = inhalte.geschichte;
assert.ok(g);

test('Sprungziele: jeder Schritt der ganzen Geschichte, Werte eindeutig und lesbar', () => {
  const ziele = sprungZiele(g);
  assert.equal(ziele.length, schritte(g, false).length);
  assert.equal(new Set(ziele.map((z) => z.wert)).size, ziele.length);
  assert.equal(ziele[0]?.wert, 'auftakt');
  assert.equal(ziele.at(-1)?.wert, 'ende');
  for (const k of g.kapitel) {
    assert.ok(ziele.some((z) => z.wert === `${k.id}:szene`), `${k.id}: Szene`);
    assert.ok(ziele.some((z) => z.wert === `${k.id}:frage`), `${k.id}: Frage`);
    assert.equal(ziele.some((z) => z.wert === `${k.id}:mini`), k.mini !== null, `${k.id}: Mini-Aufgabe genau dann, wenn es eine gibt`);
    assert.equal(ziele.some((z) => z.wert === `${k.id}:vergleich`), k.vergleich !== null, `${k.id}: Vergleich genau dann, wenn es einen gibt`);
  }
  for (const z of ziele) assert.deepEqual(schrittAus(g, schrittWert(z.schritt)), z.schritt);
  // Gegenprobe: Unbekanntes ergibt null
  for (const falsch of ['', 'k9:szene', 'k1:mini', 'k1', 'k1:frage:2']) assert.equal(schrittAus(g, falsch), null, falsch);
});

test('Springen: auf dem Weg bleibt die Fassung, ein Schritt außerhalb der Kurzfassung schaltet auf die ganze Geschichte', () => {
  const ausserhalb = g.kapitel.find((k) => !k.kurzfassung);
  const innen = g.kapitel.find((k) => k.kurzfassung && k.mini !== null);
  assert.ok(ausserhalb && innen);
  const kurz = neuerStand(true);
  // Gegenprobe zuerst: die Szene eines Kapitels der Kurzfassung erreicht die Kurzfassung selbst
  const a = springe(g, kurz, { ort: 'kapitel', kapitel: innen.id, teil: 'szene' });
  assert.equal(a.kurz, true);
  assert.deepEqual(a.schritt, { ort: 'kapitel', kapitel: innen.id, teil: 'szene' });
  // übersprungenes Kapitel und Mini-Aufgabe (die Kurzfassung hat keine): ganze Geschichte
  const b = springe(g, kurz, { ort: 'kapitel', kapitel: ausserhalb.id, teil: 'frage' });
  assert.equal(b.kurz, false);
  assert.deepEqual(b.schritt, { ort: 'kapitel', kapitel: ausserhalb.id, teil: 'frage' });
  const c = springe(g, kurz, { ort: 'kapitel', kapitel: innen.id, teil: 'mini' });
  assert.equal(c.kurz, false);
  assert.equal(c.schritt.ort === 'kapitel' && c.schritt.teil, 'mini');
  // Wahlen bleiben beim Springen erhalten
  const mitWahl = waehle(g, kurz, innen.id, 2);
  assert.equal(springe(g, mitWahl, { ort: 'ende' }).wahlen[innen.id], 2);
});

test('Wahl zurücknehmen: nur dieses Kapitel, ohne Wahl unverändert', () => {
  let s = waehle(g, neuerStand(), 'k1', 1);
  s = waehle(g, s, 'k2', 0);
  const ohne = ohneWahl(s, 'k1');
  assert.equal(ohne.wahlen['k1'], undefined);
  assert.equal(ohne.wahlen['k2'], 0);
  assert.equal(s.wahlen['k1'], 1, 'der alte Stand bleibt unberührt');
  // Gegenprobe: ohne Wahl kommt derselbe Stand zurück
  assert.equal(ohneWahl(ohne, 'k1'), ohne);
});

test('Mini-Aufgabe auflösen: jede Aufgabe danach ganz richtig, vorher nicht', () => {
  const mitMini = g.kapitel.filter((k) => k.mini !== null);
  assert.ok(mitMini.some((k) => k.mini?.art === 'zuordnen') && mitMini.some((k) => k.mini?.art === 'reihenfolge'));
  for (const k of mitMini) {
    const m = k.mini!;
    const geloest = loeseMini(g, neuerStand(), k.id);
    const aus = werteMiniAus(m, geloest.mini[k.id]);
    assert.equal(aus.richtig, m.posten.length, `${k.id}: alles richtig`);
    assert.equal(aus.fertig, true);
    // Gegenprobe: ohne Auflösen nichts richtig, eine falsche Zuordnung wird überschrieben
    assert.equal(werteMiniAus(m, neuerStand().mini[k.id]).richtig, 0, `${k.id}: vorher nichts richtig`);
    if (m.art === 'zuordnen') {
      const falsch = m.wahlen.findIndex((w) => w.id !== m.posten[0]?.loesung);
      const s = ordneZu(g, neuerStand(), k.id, 0, falsch);
      assert.equal(werteMiniAus(m, s.mini[k.id]).je[0], 'falsch');
      assert.equal(werteMiniAus(m, loeseMini(g, s, k.id).mini[k.id]).je[0], 'richtig');
    }
  }
  // Gegenprobe: ein Kapitel ohne Mini-Aufgabe bleibt unverändert
  const ohne = g.kapitel.find((k) => k.mini === null);
  assert.ok(ohne);
  const s = neuerStand();
  assert.equal(loeseMini(g, s, ohne.id), s);
});

test('Kurze Knopftexte: reiner Text, erste Wörter mit „…“, kurze Texte ganz', () => {
  assert.equal(nurText('<em>Erst</em> &amp; dann&nbsp;das &#8211; fertig'), 'Erst & dann das – fertig');
  assert.equal(nurText('Bau­herr <b>A</b>'), 'Bauherr A');
  assert.equal(ersteWorte('Eins zwei drei vier, fünf sechs sieben acht', 4), 'Eins zwei drei vier …');
  assert.equal(ersteWorte('Eins zwei drei', 4), 'Eins zwei drei');
  // Gegenprobe an echten Antworten: jede längere wird gekürzt, keine ist leer, kein Tag bleibt stehen
  for (const k of g.kapitel) for (const a of k.antworten) {
    const kurz = ersteWorte(a.html, 7);
    assert.ok(kurz.length > 0 && !/[<>]/u.test(kurz), kurz);
    assert.ok(kurz.length <= nurText(a.html).length + 2, kurz);
    if (nurText(a.html).split(' ').length > 7) assert.match(kurz, / …$/u);
  }
});

test('Leinwand: welcher Posten sich geändert hat (Zuordnung, Reihenfolge)', async () => {
  const { geaenderterPosten } = await import('../src/regie/leinwand.ts');
  assert.equal(geaenderterPosten('zuordnen', [], [-1, -1, 2, -1]), 2);
  assert.equal(geaenderterPosten('zuordnen', [0, -1, 2], [0, 1, 2]), 1);
  assert.equal(geaenderterPosten('reihenfolge', [3, 1], [3, 1, 4]), 4);
  assert.equal(geaenderterPosten('reihenfolge', [3, 1, 4, 0], [3]), 1);
  // Gegenprobe: nichts geändert
  assert.equal(geaenderterPosten('zuordnen', [0, 1], [0, 1]), null);
  assert.equal(geaenderterPosten('reihenfolge', [2, 0], [2, 0]), null);
});
