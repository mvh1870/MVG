/*
 * Story-Übersetzer, Formatergänzungen von P19.4 und P19.5 (werkzeuge/geschichte.mjs): Echos und Echo-Zeilen, Entscheidungsbuch, Kürzungen der
 * Kurzfassung je Absatz und als `…-kurz`, Vertiefung, Platz der Mini-Aufgabe und die fünf neuen Mini-Arten. Jeder Fall verfälscht genau eine
 * Stelle der gültigen Kunst-Geschichte (tests/hilfen/geschichte-roh.ts) und verlangt genau die erwartete Meldung; zu jeder Regel gibt es
 * die Gegenprobe, dass die gültige Form fehlerfrei ist und die Ausgabe der bisherigen Form unverändert bleibt.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { K1, K2, K3, R, antwort, buch, echos, lauf, zeile, type Roh } from './hilfen/geschichte-roh.ts';

const echoZeile = (id: string, extra: Roh = {}): Roh => ({ figur: 'lot', echo: id, ...extra });

/** Rahmen mit einem Echo E1 (Quelle k1) und einer Echo-Zeile in Station 2. */
const mitEcho = (d: { r: Roh; k2: Roh }, extra: Roh = { fortsetzung: 'Weiter.', 'fortsetzung-kurz': 'Kurz.' }): void => {
  d.r.echos = [echos()[0]];
  d.k2.szene.push(echoZeile('E1', extra));
};

/* ------------------------------------------------------------------ Echos -- */

test('Echo: Grundlage mit einem Echo und einer Echo-Zeile ist fehlerfrei; Fassungen, Vorgabe „gut“ und Fortsetzungen stehen in der Ausgabe', () => {
  const { fehler, erg } = lauf((d) => mitEcho(d));
  assert.deepEqual(fehler, []);
  const g = erg.geschichte;
  assert.deepEqual(g.echos, [{ id: 'E1', quelle: 'k1', fassungen: { gut: 'Alpha.', vertretbar: 'Beta.', falle: 'Gamma.' } }]);
  const z = g.kapitel[1].szene[2];
  assert.equal(z.echo, 'E1');
  assert.equal(z.html, 'Alpha. Weiter.', 'Vorgabe: Fassung „gut“ samt Fortsetzung');
  assert.equal(z.fortsetzungHtml, 'Weiter.');
  assert.equal(z.fortsetzungKurzHtml, 'Kurz.');
});

test('Echo, Gegenprobe: ohne Echos bleibt die Ausgabe der Story unverändert (keine neuen Felder)', () => {
  const { fehler, erg } = lauf();
  assert.deepEqual(fehler, []);
  const json = JSON.stringify(erg.geschichte);
  assert.doesNotMatch(json, /echo|"buch"|vertiefung|folgeKurz|gutKurz|dahinterKurz|"stelle"|schlussHtml/u);
  assert.ok(!('echos' in erg.geschichte));
  assert.deepEqual(Object.keys(erg.geschichte.kapitel[0].szene[0]), ['figur', 'zusatz', 'html', 'kurzfassung']);
});

test('Echo: unbekanntes Echo, nirgends gesetzt, Quelle nicht vor der Stelle, Quelle keine Station: Fehler', () => {
  assert.deepEqual(lauf((d) => { mitEcho(d); d.k2.szene[2].echo = 'E9'; }).fehler, [
    `${K2} szene Zeile 3: Echo „E9“ gibt es nicht (rahmen.yaml, echos)`,
    `${R} echos E1: wird nirgends gesetzt (Echo-Zeile oder Platzhalter)`,
  ]);
  assert.deepEqual(lauf((d) => { d.r.echos = [echos()[0]]; }).fehler, [`${R} echos E1: wird nirgends gesetzt (Echo-Zeile oder Platzhalter)`]);
  // Quelle k2 in Station 2 selbst: ein Echo klingt erst nach der Antwort
  assert.deepEqual(lauf((d) => { mitEcho(d); d.r.echos[0].quelle = 'k2'; }).fehler, [`${K2} szene Zeile 3: Echo „E1“: die Quelle (Station 2) liegt nicht vor dieser Stelle – ein Echo klingt erst nach der Antwort`]);
  assert.deepEqual(lauf((d) => { mitEcho(d); d.r.echos[0].quelle = 'k7'; }).fehler, [`${R} echos E1: Quelle „k7“ ist keine Station`]);
});

test('Echo: die Zeile trägt entweder text oder echo; fortsetzung-kurz braucht fortsetzung; Echo-Zeile nur in der Szene', () => {
  assert.match(lauf((d) => { mitEcho(d); d.k2.szene[2].text = 'Zusätzlich.'; }).fehler.join('\n'), /Zeile 3: unbekanntes Feld „text“/u);
  assert.deepEqual(lauf((d) => mitEcho(d, { 'fortsetzung-kurz': 'Kurz.' })).fehler, [`${K2} szene Zeile 3: „fortsetzung-kurz“ ohne „fortsetzung“`]);
  // ohne text ohne echo: weiterhin „Feld text fehlt“
  assert.deepEqual(lauf((d) => { d.k2.szene.push({ figur: 'lot' }); }).fehler, [`${K2} szene Zeile 3: Feld „text“ fehlt`]);
  // in den Ersatzzeilen des Endes gibt es keine Echo-Zeilen
  assert.match(lauf((d) => { d.r.echos = [echos()[0]]; d.r.ende['nach-falle'][0].echo = 'E1'; delete d.r.ende['nach-falle'][0].text; }).fehler.join('\n'), /Echo-Zeile nur in der Szene einer Station oder des Endes/u);
  // ohne fortsetzung ist die Vorgabe nur die Fassung
  assert.equal(lauf((d) => mitEcho(d, {})).erg.geschichte.kapitel[1].szene[2].html, 'Alpha.');
});

test('Echo: höchstens elf, Kennung einmal und lesbar, jede Fassung vorhanden; die Wertung wird nie genannt', () => {
  const viele = (n: number): Roh[] => Array.from({ length: n }, (_, i) => ({ id: `E${i + 1}`, quelle: 'k1', fassungen: { gut: 'a.', vertretbar: 'b.', falle: 'c.' } }));
  assert.match(lauf((d) => { d.r.echos = viele(12); }).fehler.join('\n'), /höchstens 11 Echos, nicht 12/u);
  assert.doesNotMatch(lauf((d) => { d.r.echos = viele(11); d.k2.szene.push(...viele(11).map((e) => echoZeile(e.id))); }).fehler.join('\n'), /höchstens/u, 'genau elf sind erlaubt (E8 hat zwei Sprecher, L-340)');
  assert.match(lauf((d) => { d.r.echos = [echos()[0], echos()[0]]; d.k2.szene.push(echoZeile('E1')); }).fehler.join('\n'), /Echo „E1“ doppelt/u);
  assert.match(lauf((d) => { mitEcho(d); d.r.echos[0].id = '1E'; }).fehler.join('\n'), /Echo-Kennung „1E“/u);
  assert.match(lauf((d) => { mitEcho(d); delete d.r.echos[0].fassungen.falle; }).fehler.join('\n'), /fassungen: Feld „falle“ fehlt/u);
  // die Wertung wird nie genannt (Wörter der Wertung), und die Sichtbar-Probe gilt auch hier
  for (const wort of ['Falle', 'vertretbar', 'Wertung']) {
    assert.match(lauf((d) => { mitEcho(d); d.r.echos[0].fassungen.gut = `Das war eine ${wort} der Antwort.`; }).fehler.join('\n'), new RegExp(`fassungen.gut: „${wort}“ nennt die Wertung`, 'u'), wort);
  }
  assert.deepEqual(lauf((d) => { mitEcho(d); d.r.echos[0].fassungen.vertretbar = 'Gut, dass es diesmal nur einmal zu mir kommt.'; }).fehler, [], '„Gut“ als gewöhnliches Wort ist erlaubt');
  assert.match(lauf((d) => { mitEcho(d); d.r.echos[0].fassungen.gut = 'Im Kapitel 3 stand es.'; }).fehler.join('\n'), /Kapitel/u);
});

test('Echo-Platzhalter: nur in folge und einstieg einer Station, nur mit bekanntem Echo und früherer Quelle', () => {
  const ok = lauf((d) => { d.r.echos = [echos()[0]]; d.k2.antworten[0].folge = 'Davor. „{echo: E1}“ Danach.'; });
  assert.deepEqual(ok.fehler, []);
  assert.equal(ok.erg.geschichte.kapitel[1].antworten[0].folgeHtml, 'Davor. „{echo: E1}“ Danach.');
  assert.deepEqual(lauf((d) => { d.r.echos = [echos()[0]]; d.k2.einstieg = 'Früh: {echo: E1}'; }).fehler, []);
  assert.deepEqual(lauf((d) => { d.r.echos = [echos()[0]]; d.k2.antworten[0].folge = '{echo: E1}'; d.k2.gut = '{echo: E1}'; }).fehler, [`${K2} gut: Echo-Platzhalter „{echo: E1}“ nur in „folge“ und „einstieg“ einer Station`]);
  assert.match(lauf((d) => { d.r.echos = [echos()[0]]; d.k2.antworten[0].folge = '{echo: E7}'; }).fehler.join('\n'), /Echo „E7“ gibt es nicht/u);
  assert.match(lauf((d) => { d.r.echos = [echos()[0]]; d.k2.antworten[0].folge = '{echo E1}{echo:}'; }).fehler.join('\n'), /Echo-Platzhalter unlesbar/u);
  // Quelle k2 und Platzhalter in Station 2: zu früh
  assert.match(lauf((d) => { d.r.echos = [{ ...echos()[0], quelle: 'k2' }]; d.k2.antworten[0].folge = '{echo: E1}'; }).fehler.join('\n'), /liegt nicht vor dieser Stelle/u);
  // im Platzhalter-freien Text ändert sich nichts
  assert.equal(lauf().erg.geschichte.kapitel[1].antworten[0].folgeHtml, 'Folge gut');
});

test('Echo und Kurzfassung: eine Zeile, deren Quelle die Kurzfassung nicht spielt, braucht „kurzfassung: nein“', () => {
  const mitE2 = (d: { r: Roh; k3: Roh }, extra: Roh = {}): void => { d.r.echos = [echos()[1]]; d.k3.szene.push(echoZeile('E2', extra)); };
  assert.deepEqual(lauf((d) => mitE2(d)).fehler, [`${K3} szene Zeile 3: Echo „E2“: seine Quelle (Station 2) fehlt in der Kurzfassung – die Zeile braucht „kurzfassung: nein“ oder „text-kurz“`]);
  assert.deepEqual(lauf((d) => mitE2(d, { kurzfassung: false })).fehler, []);
  // Quelle in der Kurzfassung (k1): keine Auflage; Echo im Ende: Quelle k2 → braucht die Marke
  assert.deepEqual(lauf((d) => { d.r.echos = [echos()[0]]; d.k3.szene.push(echoZeile('E1')); }).fehler, []);
  assert.deepEqual(lauf((d) => { d.r.echos = [echos()[1]]; d.r.ende.szene.push(echoZeile('E2')); }).fehler, [`${R} ende.szene Zeile 4: Echo „E2“: seine Quelle (Station 2) fehlt in der Kurzfassung – die Zeile braucht „kurzfassung: nein“ oder „text-kurz“`]);
  assert.deepEqual(lauf((d) => { d.r.echos = [echos()[1]]; d.r.ende.szene.push(echoZeile('E2', { kurzfassung: false })); }).fehler, []);
});

/* --------------------------------------------------------- Entscheidungsbuch -- */

test('Buch: ein Eintrag je Station, in der Ausgabe ohne Zutat; fehlt das Feld, gibt es kein Buch', () => {
  const { fehler, erg } = lauf((d) => { d.r.buch = buch(); });
  assert.deepEqual(fehler, []);
  assert.deepEqual(erg.geschichte.buch.map((e: Roh) => [e.station, e.art]), [['k1', 'beschluss'], ['k2', 'vermerk'], ['k3', 'uebergabe']]);
  assert.deepEqual(Object.keys(erg.geschichte.buch[0]).sort(), ['art', 'entschiedenHtml', 'ergebnisHtml', 'grundlageHtml', 'station']);
  assert.ok(!('buch' in lauf().erg.geschichte));
});

test('Buch: Station fehlt, doppelt oder unbekannt; Art unbekannt; Reihenfolge der Stationen', () => {
  assert.deepEqual(lauf((d) => { d.r.buch = buch().slice(0, 2); }).fehler, [`${R} buch: Station „k3“ hat keinen Eintrag – ein Eintrag je Station`]);
  assert.match(lauf((d) => { d.r.buch = [...buch(), buch()[0]]; }).fehler.join('\n'), /Station „k1“ hat zwei Einträge/u);
  assert.match(lauf((d) => { d.r.buch = buch(); d.r.buch[2].station = 'k9'; }).fehler.join('\n'), /Station „k9“ gibt es nicht/u);
  assert.match(lauf((d) => { d.r.buch = buch(); d.r.buch[0].art = 'urteil'; }).fehler.join('\n'), /Art „urteil“ – erwartet beschluss, vermerk, uebergabe, beschluss-uebergabe/u);
  assert.match(lauf((d) => { d.r.buch = buch().reverse(); }).fehler.join('\n'), /die Einträge folgen der Reihenfolge der Stationen/u);
  assert.match(lauf((d) => { d.r.buch = buch(); delete d.r.buch[0].ergebnis; }).fehler.join('\n'), /Feld „ergebnis“ fehlt/u);
});

test('Buch: jede Zeile muss auf jedem Weg wahr sein – verbotene Wörter, Vermerk entscheidet niemand, Beschluss hat eine Stelle', () => {
  for (const wort of ['mitgeteilt', 'vollständig', 'am selben Tag', 'mit zwei Wegen', 'Punkte']) {
    const fehler = lauf((d) => { d.r.buch = buch(); d.r.buch[0].ergebnis = `Es wurde ${wort} vorgelegt.`; }).fehler.join('\n');
    assert.match(fehler, new RegExp(`${R} buch 1 ergebnis: „${wort}“ steht nicht im Buch`, 'u'), wort);
  }
  assert.match(lauf((d) => { d.r.buch = buch(); d.r.buch[1].entschieden = 'die Bürgermeisterin'; }).fehler.join('\n'), /ein Vermerk ist kein Beschluss/u);
  assert.match(lauf((d) => { d.r.buch = buch(); d.r.buch[0].entschieden = 'niemand'; }).fehler.join('\n'), /ein Beschluss hat eine entscheidende Stelle/u);
  // „Niemandem“ am Wortanfang ohne Wortgrenze zählt nicht als niemand
  assert.deepEqual(lauf((d) => { d.r.buch = buch(); d.r.buch[0].entschieden = 'Niemandsland-Gremium'; }).fehler, []);
});

/* ------------------------------------------- Kurzfassung je Absatz, …-kurz -- */

test('folge, gut, dahinter: Liste von Einträgen mit „kurzfassung: nein“ ergibt Lang- und Kurzfassung; ohne Marke gibt es keine Kurzfassung', () => {
  const { fehler, erg } = lauf((d) => {
    d.k1.antworten[1].folge = ['Erst.', { text: 'Nur lang.', kurzfassung: false }, 'Zuletzt.'];
    d.k1.gut = [{ text: 'Regel.' }, { text: 'Zusatz nur lang.', kurzfassung: false }];
    d.k1.dahinter = ['Satz eins.', { text: 'Satz zwei.', kurzfassung: false }];
  });
  assert.deepEqual(fehler, []);
  const k = erg.geschichte.kapitel[0];
  assert.equal(k.antworten[1].folgeHtml, 'Erst.Nur lang.Zuletzt.');
  assert.equal(k.antworten[1].folgeKurzHtml, 'Erst.Zuletzt.');
  assert.equal(k.gutHtml, 'Regel.Zusatz nur lang.');
  assert.equal(k.gutKurzHtml, 'Regel.');
  assert.equal(k.dahinterHtml, 'Satz eins. Satz zwei.', 'Sätze eines Absatzes mit Leerzeichen');
  assert.equal(k.dahinterKurzHtml, 'Satz eins.');
  // Gegenprobe: eine Liste ohne Marke bleibt ein langer Text ohne Kurzfassung
  const o = lauf((d) => { d.k1.gut = ['A.', 'B.']; }).erg.geschichte.kapitel[0];
  assert.equal(o.gutHtml, 'A.B.');
  assert.ok(!('gutKurzHtml' in o));
  assert.ok(!('folgeKurzHtml' in o.antworten[0]));
});

test('Kurzfassung je Absatz: Marke nur in Stationen der Kurzfassung, nicht alle Einträge, Liste nicht leer', () => {
  assert.deepEqual(lauf((d) => { d.k2.gut = ['A.', { text: 'B.', kurzfassung: false }]; }).fehler, [`${K2} gut: „kurzfassung: nein“ nur in Kapiteln der Kurzfassung`]);
  assert.deepEqual(lauf((d) => { d.k1.gut = [{ text: 'A.', kurzfassung: false }]; }).fehler, [`${K1} gut: in der Kurzfassung bliebe nichts stehen – mindestens ein Eintrag ohne „kurzfassung: nein“`]);
  assert.deepEqual(lauf((d) => { d.k1.gut = []; }).fehler.slice(0, 1), [`${K1} gut: leere Liste`]);
  assert.match(lauf((d) => { d.k1.gut = ['A.', { text: 'B.', kurzfassung: 'nein' }]; }).fehler.join('\n'), /„kurzfassung“ muss ja oder nein sein/u);
  assert.match(lauf((d) => { d.k1.gut = ['A.', { text: 'B.', farbe: 'rot' }]; }).fehler.join('\n'), /unbekanntes Feld „farbe“/u);
});

test('…-kurz: Ersatztext für die Kurzfassung, kürzer als der lange, nur in Stationen der Kurzfassung, nicht zugleich mit der Marke', () => {
  const lang = 'Ein langer Satz mit sehr vielen Wörtern in der langen Fassung.';
  const ok = lauf((d) => { d.k1.dahinter = lang; d.k1['dahinter-kurz'] = 'Kurz.'; d.k1.gut = 'Lange Regel mit mehreren Wörtern.'; d.k1['gut-kurz'] = 'Kurze Regel.'; d.k1.antworten[0]['folge-kurz'] = 'Knapp.'; d.k1.antworten[0].folge = 'Eine längere Folge mit mehr Wörtern.'; });
  assert.deepEqual(ok.fehler, []);
  const k = ok.erg.geschichte.kapitel[0];
  assert.equal(k.dahinterKurzHtml, 'Kurz.');
  assert.equal(k.gutKurzHtml, 'Kurze Regel.');
  assert.equal(k.antworten[0].folgeKurzHtml, 'Knapp.');
  assert.match(lauf((d) => { d.k1.dahinter = 'Kurz.'; d.k1['dahinter-kurz'] = 'Aber länger als der lange Text.'; }).fehler.join('\n'), /„dahinter-kurz“ hat 6 Wörter, „dahinter“ 1 – die Kurzfassung muss kürzer sein/u);
  assert.deepEqual(lauf((d) => { d.k2['gut-kurz'] = 'x'; }).fehler, [`${K2}: „gut-kurz“ nur in Kapiteln der Kurzfassung`]);
  assert.match(lauf((d) => { d.k1.gut = ['Eins zwei drei.', { text: 'Vier fünf.', kurzfassung: false }]; d.k1['gut-kurz'] = 'Eins.'; }).fehler.join('\n'), /„gut“ mit „kurzfassung: nein“ und „gut-kurz“ zugleich – entweder oder/u);
  assert.match(lauf((d) => { d.k1.antworten[0]['folge-kurz'] = 'Folge gut länger als der Rest dieser Folge'; }).fehler.join('\n'), /„folge-kurz“ hat \d+ Wörter/u);
});

/* ------------------------------------------------------------- Vertiefung -- */

const vertiefung = (form: string, extra: Roh = {}): Roh => ({ form, titel: 'Eine Frage?', text: ['Erster Absatz.', 'Zweiter Absatz.'], ...extra });

test('Vertiefung: drei Formen – Nachdenken und zweiter Fall mit Antwort, Warum so ohne; Ausgabe mit Absätzen', () => {
  const { fehler, erg } = lauf((d) => { d.k1.vertiefung = vertiefung('nachdenken', { antwort: ['Die Antwort.', 'Mehr dazu.'] }); d.k2.vertiefung = vertiefung('warum-so'); d.k3.vertiefung = vertiefung('zweiter-fall', { antwort: ['Anders.'], kurzfassung: false }); });
  assert.deepEqual(fehler, []);
  const [a, b, c] = erg.geschichte.kapitel.map((k: Roh) => k.vertiefung);
  assert.deepEqual(a, { form: 'nachdenken', titel: 'Eine Frage?', absaetzeHtml: ['Erster Absatz.', 'Zweiter Absatz.'], antwortHtml: ['Die Antwort.', 'Mehr dazu.'] });
  assert.deepEqual(b, { form: 'warum-so', titel: 'Eine Frage?', absaetzeHtml: ['Erster Absatz.', 'Zweiter Absatz.'] });
  assert.equal(c.form, 'zweiter-fall');
  assert.ok(!('vertiefung' in lauf().erg.geschichte.kapitel[0]), 'Gegenprobe: ohne Feld keine Vertiefung');
});

test('Vertiefung: unbekannte Form, fehlende oder überzählige Antwort, Absatz über 60 Wörter, nie in der Kurzfassung', () => {
  assert.match(lauf((d) => { d.k1.vertiefung = vertiefung('fallbeispiel', { antwort: ['x'] }); }).fehler.join('\n'), /Form „fallbeispiel“ – erwartet nachdenken, zweiter-fall, warum-so/u);
  assert.match(lauf((d) => { d.k1.vertiefung = vertiefung('nachdenken'); }).fehler.join('\n'), /Form „nachdenken“ braucht eine „antwort“/u);
  assert.match(lauf((d) => { d.k1.vertiefung = vertiefung('zweiter-fall', { antwort: [] }); }).fehler.join('\n'), /braucht eine „antwort“/u);
  assert.match(lauf((d) => { d.k1.vertiefung = vertiefung('warum-so', { antwort: ['x'] }); }).fehler.join('\n'), /Form „warum-so“ hat keine „antwort“/u);
  const sechzig = Array.from({ length: 60 }, () => 'wort').join(' ');
  assert.deepEqual(lauf((d) => { d.k1.vertiefung = { form: 'warum-so', titel: 'T', text: [sechzig] }; }).fehler, [], '60 Wörter sind erlaubt');
  assert.deepEqual(lauf((d) => { d.k1.vertiefung = { form: 'warum-so', titel: 'T', text: [`${sechzig} mehr`] }; }).fehler, [`${K1} vertiefung text 1: Absatz mit 61 Wörtern – höchstens 60`]);
  assert.match(lauf((d) => { d.k1.vertiefung = vertiefung('warum-so', { kurzfassung: true }); }).fehler.join('\n'), /die Vertiefung steht nie in der Kurzfassung/u);
  assert.match(lauf((d) => { d.k1.vertiefung = vertiefung('warum-so', { text: [] }); }).fehler.join('\n'), /text: Liste von Absätzen erwartet/u);
  assert.match(lauf((d) => { d.k1.vertiefung = vertiefung('warum-so', { farbe: 'rot' }); }).fehler.join('\n'), /unbekanntes Feld „farbe“/u);
});

/* ---------------------------------------------------- Platz der Mini-Aufgabe -- */

test('Mini-Aufgabe: Platz nach der Folge (Vorgabe), vor der Frage oder vor dem Vergleich; die Vorgabe steht nicht in der Ausgabe', () => {
  const stelle = (k: string, wert: string | undefined) => (d: { k1: Roh; k2: Roh }): void => {
    if (k === 'k1') d.k1.mini = { ...kapitel1Mini(), ...(wert !== undefined ? { stelle: wert } : {}) };
    else d.k2.mini = { ...d.k2.mini, ...(wert !== undefined ? { stelle: wert } : {}) };
  };
  assert.deepEqual(lauf(stelle('k2', 'vor-frage')).fehler, []);
  assert.equal(lauf(stelle('k2', 'vor-frage')).erg.geschichte.kapitel[1].mini.stelle, 'vor-frage');
  assert.ok(!('stelle' in lauf(stelle('k2', 'nach-folge')).erg.geschichte.kapitel[1].mini), 'Vorgabe wird nicht ausgegeben');
  assert.ok(!('stelle' in lauf(stelle('k2', undefined)).erg.geschichte.kapitel[1].mini));
  // vor dem Vergleich nur in der Station mit dem Vergleich (k1)
  assert.deepEqual(lauf(stelle('k1', 'vor-vergleich')).fehler, []);
  assert.deepEqual(lauf(stelle('k2', 'vor-vergleich')).fehler, [`${K2} mini: Stelle „vor-vergleich“ nur in der Station mit dem Vergleich`]);
  assert.match(lauf(stelle('k2', 'danach')).fehler.join('\n'), /Stelle „danach“ – erwartet nach-folge, vor-frage, vor-vergleich/u);
});

function kapitel1Mini(): Roh {
  return {
    art: 'zuordnen', titel: 'Wer?', aufgabe: 'Zuordnen.', bild: 'kaertchen',
    wahlen: [{ id: 'sie', titel: 'Sie' }, { id: 'bm', titel: 'Bürgermeisterin' }],
    posten: [{ text: 'Eins', loesung: 'sie', erklaerung: 'E' }, { text: 'Zwei', loesung: 'bm', erklaerung: 'E' }, { text: 'Drei', loesung: 'bm', erklaerung: 'E' }],
  };
}

/* ------------------------------------------------------- neue Mini-Arten -- */

const kartenPosten = (loesungen: string[], extra: (i: number) => Roh = () => ({})): Roh[] => loesungen.map((l, i) => ({ text: `Posten ${i + 1}`, loesung: l, erklaerung: `Erklärung ${i + 1}`, ...extra(i) }));
const mini = (art: string, rest: Roh): Roh => ({ art, titel: 'Frage?', aufgabe: 'Aufgabe.', bild: 'mappe', ...rest });
const mitMini = (m: Roh) => (d: { k2: Roh }): void => { d.k2.mini = m; };
const feld = (i: number): Roh => ({ feld: [(i % 5) + 1, ((i * 2) % 5) + 1] });

test('matrix: feste Wahlen stimmt und nachfordern, Matrixfeld je Posten, kein Schlusssatz', () => {
  const m = mini('matrix', { posten: kartenPosten(['stimmt', 'nachfordern', 'stimmt'], feld) });
  const { fehler, erg } = lauf(mitMini(m));
  assert.deepEqual(fehler, []);
  const k = erg.geschichte.kapitel[1].mini;
  assert.deepEqual(k.wahlen.map((w: Roh) => w.id), ['stimmt', 'nachfordern']);
  assert.deepEqual(k.posten.map((p: Roh) => p.feld), [[1, 1], [2, 3], [3, 5]]);
  assert.ok(!('schlussHtml' in k));
  // Gegenproben
  assert.match(lauf(mitMini({ ...m, wahlen: [{ id: 'stimmt', titel: 'x' }] })).fehler.join('\n'), /die Wahlen dieser Art sind fest/u);
  assert.match(lauf(mitMini({ ...m, schluss: 'Schluss.' })).fehler.join('\n'), /Art „matrix“ hat keinen Schlusssatz/u);
  for (const feldWert of [[0, 3], [3, 0], [1, 6], [6, 1], [1.5, 2], [1], [1, 2, 3], 'a1']) {
    assert.match(lauf(mitMini(mini('matrix', { posten: kartenPosten(['stimmt', 'nachfordern', 'stimmt'], () => ({ feld: feldWert })) }))).fehler.join('\n'), /Feld: \[Wahrscheinlichkeit, Auswirkung\] je eine ganze Zahl von 1 bis 5/u, JSON.stringify(feldWert));
  }
  assert.deepEqual(lauf(mitMini(mini('matrix', { posten: kartenPosten(['stimmt', 'nachfordern', 'stimmt'], () => ({ feld: [1, 5] })) }))).fehler, [], 'die Grenzen 1 und 5 sind erlaubt');
  assert.match(lauf(mitMini(mini('matrix', { posten: kartenPosten(['stimmt', 'nachfordern', 'stimmt']) }))).fehler.join('\n'), /Feld „feld“ fehlt/u);
  assert.match(lauf(mitMini(mini('matrix', { posten: kartenPosten(['stimmt', 'ja', 'stimmt'], feld) }))).fehler.join('\n'), /Lösung „ja“ ist keine der Wahlen dieser Art \(stimmt, nachfordern\)/u);
});

test('mappe: annehmen oder nachfordern je Abschnitt, Schlusssatz Pflicht, beide Lösungen kommen vor', () => {
  const m = mini('mappe', { posten: kartenPosten(['annehmen', 'nachfordern', 'nachfordern']), schluss: 'Zwei Abschnitte wurden nachgefordert.' });
  const { fehler, erg } = lauf(mitMini(m));
  assert.deepEqual(fehler, []);
  assert.equal(erg.geschichte.kapitel[1].mini.schlussHtml, 'Zwei Abschnitte wurden nachgefordert.');
  assert.deepEqual(erg.geschichte.kapitel[1].mini.wahlen.map((w: Roh) => w.id), ['annehmen', 'nachfordern']);
  const ohneSchluss = { ...m }; delete ohneSchluss.schluss;
  assert.match(lauf(mitMini(ohneSchluss)).fehler.join('\n'), /Schlusssatz fehlt \(Feld „schluss“, aus den Lösungen, nie aus den Wahlen\)/u);
  assert.match(lauf(mitMini({ ...m, posten: kartenPosten(['annehmen', 'annehmen', 'annehmen']) })).fehler.join('\n'), /mindestens ein Abschnitt der Mappe wird nachgefordert/u);
  assert.match(lauf(mitMini({ ...m, posten: kartenPosten(['nachfordern', 'nachfordern', 'nachfordern']) })).fehler.join('\n'), /mindestens ein Abschnitt der Mappe wird so angenommen/u);
});

const zettel = (): Roh[] => [{ id: 'z1', text: 'Risiko A' }, { id: 'z2', text: 'Prüfung B' }, { id: 'z3', text: 'Prognose C' }, { id: 'z4', text: 'Änderung D' }];
const faeden = (): Roh[] => [
  { text: 'Faden eins', loesung: 'stimmt', erklaerung: 'E1', von: 'z1', nach: ['z2'] },
  { text: 'Faden zwei', loesung: 'doppelt', erklaerung: 'E2', von: 'z1', nach: ['z3'] },
  { text: 'Faden drei', loesung: 'nachfordern', erklaerung: 'E3', von: 'z4', nach: [] },
];
const pinnwand = (extra: Roh = {}): Roh => mini('pinnwand', { zettel: zettel(), posten: faeden(), schluss: 'Eine Verbindung hätte doppelt gezählt.', ...extra });

test('pinnwand: Zettel und Fäden – drei feste Wahlen, Fäden verweisen auf bekannte Zettel', () => {
  const { fehler, erg } = lauf(mitMini(pinnwand()));
  assert.deepEqual(fehler, []);
  const k = erg.geschichte.kapitel[1].mini;
  assert.deepEqual(k.wahlen.map((w: Roh) => w.id), ['stimmt', 'doppelt', 'nachfordern']);
  assert.deepEqual(k.zettel.map((z: Roh) => z.id), ['z1', 'z2', 'z3', 'z4']);
  assert.deepEqual(k.posten.map((p: Roh) => [p.von, p.nach]), [['z1', ['z2']], ['z1', ['z3']], ['z4', []]]);
  const mitFaden = (i: number, aendere: (p: Roh) => void) => { const p = faeden(); aendere(p[i] as Roh); return mitMini(pinnwand({ posten: p })); };
  assert.match(lauf(mitFaden(0, (p) => { p.nach = ['z9']; })).fehler.join('\n'), /Zettel „z9“ gibt es nicht/u);
  assert.match(lauf(mitFaden(0, (p) => { p.von = 'z8'; })).fehler.join('\n'), /Zettel „z8“ gibt es nicht/u);
  assert.match(lauf(mitFaden(0, (p) => { p.nach = ['z1']; })).fehler.join('\n'), /ein Faden führt nicht zum selben Zettel zurück/u);
  assert.match(lauf(mitFaden(2, (p) => { p.loesung = 'stimmt'; })).fehler.join('\n'), /ein loses Ende \(nach: \[\]\) wird nachgefordert/u);
  assert.match(lauf(mitFaden(0, (p) => { p.loesung = 'nachfordern'; })).fehler.join('\n'), /ein Faden mit Ziel wird nicht nachgefordert/u);
  assert.match(lauf(mitFaden(0, (p) => { delete p.nach; })).fehler.join('\n'), /Feld „nach“ fehlt/u);
  assert.match(lauf(mitMini(pinnwand({ zettel: [...zettel(), { id: 'z1', text: 'Doppelt' }] }))).fehler.join('\n'), /Zettel doppelt/u);
  assert.match(lauf(mitMini(pinnwand({ zettel: [{ id: 'z1', text: 'Allein' }] }))).fehler.join('\n'), /mindestens zwei Zetteln/u);
  assert.match(lauf(mitMini(pinnwand({ kontingent: 2 }))).fehler.join('\n'), /Feld „kontingent“ gibt es bei der Art „pinnwand“ nicht/u);
  assert.match(lauf(mitMini(mini('matrix', { zettel: zettel(), posten: kartenPosten(['stimmt', 'nachfordern', 'stimmt'], feld) }))).fehler.join('\n'), /Feld „zettel“ gibt es bei der Art „matrix“ nicht/u);
});

test('bericht: Zeilen ok oder nachfordern, Schlusssatz Pflicht, beide Lösungen kommen vor; Platz vor der Frage', () => {
  const m = mini('bericht', { stelle: 'vor-frage', posten: kartenPosten(['ok', 'nachfordern', 'ok']), schluss: 'Eine Zeile wurde nachgefordert.' });
  const { fehler, erg } = lauf(mitMini(m));
  assert.deepEqual(fehler, []);
  assert.deepEqual(erg.geschichte.kapitel[1].mini.wahlen, []);
  assert.equal(erg.geschichte.kapitel[1].mini.stelle, 'vor-frage');
  assert.match(lauf(mitMini({ ...m, posten: kartenPosten(['ok', 'falsch', 'ok']) })).fehler.join('\n'), /Lösung „falsch“ – erwartet ok oder nachfordern/u);
  assert.match(lauf(mitMini({ ...m, posten: kartenPosten(['ok', 'ok', 'ok']) })).fehler.join('\n'), /mindestens eine Zeile des Berichts wird nachgefordert/u);
  assert.match(lauf(mitMini({ ...m, posten: kartenPosten(['nachfordern', 'nachfordern', 'nachfordern']) })).fehler.join('\n'), /mindestens eine Zeile des Berichts ist in Ordnung/u);
  assert.match(lauf(mitMini({ ...m, wahlen: [] })).fehler.join('\n'), /die Wahlen dieser Art sind fest/u);
});

test('legende (Prüfrunde 3): optionales Feld jeder Mini-Aufgabe, der Text kommt unverändert durch den Inline-Übersetzer, ohne Feld keine legendeHtml; Leerabsatz ist ein Fehler', () => {
  const m = mini('bericht', { posten: kartenPosten(['ok', 'nachfordern', 'ok']), schluss: 'Eine Zeile wurde nachgefordert.' });
  const mit = lauf(mitMini({ ...m, legende: '**rot:** dringend · **gelb:** bald' }));
  assert.deepEqual(mit.fehler, []);
  assert.equal(mit.erg.geschichte.kapitel[1].mini.legendeHtml, '**rot:** dringend · **gelb:** bald');
  assert.equal(lauf(mitMini(m)).erg.geschichte.kapitel[1].mini.legendeHtml, undefined);
  assert.match(lauf(mitMini({ ...m, legende: 'Eins.\n\nZwei.' })).fehler.join('\n'), /ein Absatz erwartet/u);
});

const gespraeche = (n = 4): Roh[] => Array.from({ length: n }, (_, i) => ({
  text: `Gespräch ${i + 1}`, erklaerung: `Die Vertretung hält Punkt ${i + 1} fest.`, gespraech: [{ wer: 'Lot', text: `Frage ${i + 1}` }, { wer: `Partner ${i + 1}`, text: `Antwort ${i + 1}` }],
}));
const rueckfragen = (extra: Roh = {}): Roh => mini('rueckfragen', { posten: gespraeche(), kontingent: 2, schluss: 'Die übrigen fragt die Vertretung nach.', ...extra });

test('rueckfragen: vier Gespräche, Kontingent kleiner als die Zahl der Gespräche, Zeilen mit wer und text', () => {
  const { fehler, erg } = lauf(mitMini(rueckfragen()));
  assert.deepEqual(fehler, []);
  const k = erg.geschichte.kapitel[1].mini;
  assert.equal(k.kontingent, 2);
  assert.deepEqual(k.posten[0].gespraech, [{ wer: 'Lot', html: 'Frage 1' }, { wer: 'Partner 1', html: 'Antwort 1' }]);
  assert.deepEqual(k.posten.map((p: Roh) => p.loesung), ['', '', '', '']);
  assert.match(lauf(mitMini(rueckfragen({ kontingent: 4 }))).fehler.join('\n'), /Kontingent: ganze Zahl von 1 bis 3 erwartet/u);
  assert.match(lauf(mitMini(rueckfragen({ kontingent: 0 }))).fehler.join('\n'), /Kontingent: ganze Zahl von 1 bis 3 erwartet/u);
  assert.match(lauf(mitMini((() => { const m = rueckfragen(); delete m.kontingent; return m; })())).fehler.join('\n'), /Kontingent: ganze Zahl/u);
  assert.match(lauf(mitMini(rueckfragen({ posten: gespraeche(3) }))).fehler.join('\n'), /Rückfragen: mindestens vier Gespräche/u);
  const ohne = gespraeche(); delete ohne[1]?.gespraech;
  assert.match(lauf(mitMini(rueckfragen({ posten: ohne }))).fehler.join('\n'), /Feld „gespraech“ fehlt/u);
  const leer = gespraeche(); (leer[0] as Roh).gespraech = [{ text: 'Ohne Namen' }];
  assert.match(lauf(mitMini(rueckfragen({ posten: leer }))).fehler.join('\n'), /Feld „wer“ fehlt/u);
  assert.match(lauf(mitMini(rueckfragen({ kontingent: 2, zettel: zettel() }))).fehler.join('\n'), /Feld „zettel“ gibt es bei der Art „rueckfragen“ nicht/u);
});

test('Muss-Filter und „Beschluss oder nicht?“ sind Spielarten von zuordnen: eigene Wahlen, Wahl-Rückmeldung, kein Schlusssatz', () => {
  const muss = mini('zuordnen', {
    wahlen: [{ id: 'muss', titel: 'Muss' }, { id: 'punkt', titel: 'Punkt' }],
    posten: [{ text: 'Mindestens zwei Wege', loesung: 'muss', erklaerung: 'E' }, { text: 'Gute Lage', loesung: 'punkt', erklaerung: 'E' }, { text: 'Zulässig', loesung: 'muss', erklaerung: 'E' }],
  });
  assert.deepEqual(lauf(mitMini(muss)).fehler, []);
  const beschluss = mini('zuordnen', {
    wahlen: [{ id: 'beschluss', titel: 'Beschluss' }, { id: 'vermerk', titel: 'Vermerk' }],
    posten: [{ text: 'Die Bürgermeisterin gibt frei', loesung: 'beschluss', erklaerung: 'E' }, { text: 'Die Projektsteuerin empfiehlt', loesung: 'vermerk', erklaerung: 'E' }, { text: 'Es wurde nichts entschieden', loesung: 'vermerk', erklaerung: 'E' }],
  });
  assert.deepEqual(lauf(mitMini(beschluss)).fehler, []);
  assert.match(lauf(mitMini({ ...muss, schluss: 'Nein.' })).fehler.join('\n'), /Art „zuordnen“ hat keinen Schlusssatz/u);
  assert.match(lauf(mitMini({ ...muss, kontingent: 1 })).fehler.join('\n'), /Feld „kontingent“ gibt es bei der Art „zuordnen“ nicht/u);
});

test('unbekannte Mini-Art: Fehlermeldung nennt alle sieben Arten', () => {
  assert.match(lauf(mitMini(mini('quiz', { posten: kartenPosten(['a', 'b', 'c']) }))).fehler.join('\n'), /Art „quiz“ – erwartet zuordnen, reihenfolge, matrix, mappe, pinnwand, bericht, rueckfragen/u);
  // unveränderte Station ohne Mini bleibt fehlerfrei
  assert.deepEqual(lauf().fehler, []);
  assert.equal(zeile('lot', 'x').figur, 'lot');
  assert.equal(antwort('gut').wertung, 'gut');
});
