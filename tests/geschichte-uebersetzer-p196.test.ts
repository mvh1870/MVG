/*
 * Story-Übersetzer, Formatergänzungen von P19.6 Technik IV (werkzeuge/geschichte.mjs, docs/INHALTSFORMAT.md „Format-Ergänzungen P19.6“): `text-kurz` und
 * `nur-kurzfassung` an Szenenzeilen, Nebenfiguren und Stimmen als Sprecher, `auftakt.balken-titel` und `auftakt.wegwahl`, `oberflaeche`, Absätze im Kärtchen
 * „Wer entscheidet was“, `schlagzeile` an einer Antwort, die Brückenzeile mit Akten und das Eintrag-Kärtchen der Rückfragen. Jeder Fall verfälscht genau eine
 * Stelle der gültigen Kunst-Geschichte (tests/hilfen/geschichte-roh.ts) und verlangt genau die erwartete Meldung; zu jeder Regel gibt es die Gegenprobe.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { K1, K2, K3, R, echos, lauf, zeile, type Roh } from './hilfen/geschichte-roh.ts';

const neben = (): Roh[] => [
  { id: 'ranzen', name: 'Marlene Ranzen', rolle: 'Elternvertreterin', akzent: 'gruen', kurz: 'Vorsitzende des Elternbeirats', steckbrief: 'Sie fragt für alle.' },
  { id: 'spitzfeder', name: 'Bernd Spitzfeder', rolle: 'Lokalreporter', akzent: 'keiner', kurz: 'Reporter bei der Zeitung', steckbrief: 'Er hört zu.' },
  { id: 'pfennig', name: 'Ewald Pfennig', rolle: 'Stadtrat', akzent: 'beere', kurz: 'Stadtrat im Finanzausschuss', steckbrief: 'Er rechnet nach.' },
];

/* ------------------------------------------------------------------ text-kurz -- */

test('text-kurz: die Zeile trägt einen Ersatz für die Kurzfassung; die Ausgabe hält beide Texte, ohne den Zusatz bleibt sie unverändert', () => {
  const { fehler, erg } = lauf((d) => { d.k1.szene[1] = { figur: 'lot', text: 'Moin, schön dass Sie da sind.', 'text-kurz': 'Moin.' }; });
  assert.deepEqual(fehler, []);
  const z = erg.geschichte.kapitel[0].szene[1];
  assert.equal(z.html, 'Moin, schön dass Sie da sind.');
  assert.equal(z.kurzHtml, 'Moin.');
  assert.equal(z.kurzfassung, true);
  assert.ok(!('nurKurz' in z));
  // Gegenprobe: ohne Zusatz keine neuen Felder
  assert.deepEqual(Object.keys(lauf().erg.geschichte.kapitel[0].szene[0]), ['figur', 'zusatz', 'html', 'kurzfassung']);
});

test('text-kurz: nur in Stationen der Kurzfassung, nicht mit „kurzfassung: nein“ oder „nur-kurzfassung“, kürzer als der Text', () => {
  assert.deepEqual(lauf((d) => { d.k2.szene[0] = { figur: 'lot', text: 'Holz kommt später als gedacht.', 'text-kurz': 'Holz.' }; }).fehler, [`${K2} szene: „text-kurz“ an einer Zeile nur in Kapiteln der Kurzfassung`]);
  assert.deepEqual(lauf((d) => { d.k1.szene[1] = { figur: 'lot', kurzfassung: false, text: 'Moin, schön dass Sie da sind.', 'text-kurz': 'Moin.' }; d.k1.szene.push(zeile('faden', 'Dritte')); }).fehler,
    [`${K1} szene Zeile 2: „text-kurz“ an einer Zeile mit „kurzfassung: nein“ – die Kurzfassung zeigt sie nicht`]);
  assert.deepEqual(lauf((d) => { d.k1.szene.push({ figur: 'lot', 'nur-kurzfassung': true, text: 'Nur kurz, aber zu lang.', 'text-kurz': 'Anders.' }); }).fehler,
    [`${K1} szene Zeile 3: „text-kurz“ an einer Zeile „nur-kurzfassung“ – der Text der Zeile ist schon der der Kurzfassung`]);
  assert.deepEqual(lauf((d) => { d.k1.szene[1] = { figur: 'lot', text: 'Moin.', 'text-kurz': 'Moin, schön dass Sie da sind.' }; }).fehler,
    [`${K1} szene Zeile 2: „text-kurz“ hat 6 Wörter, „text“ 1 – die Kurzfassung muss kürzer sein`]);
});

test('text-kurz bei einer Echo-Zeile: ersetzt Echo samt Fortsetzung – die Quelle darf in der Kurzfassung fehlen; der Ersatz muss kürzer sein als jede Fassung samt Fortsetzung', () => {
  const echoZeile = (kurz: string): Roh => ({ figur: 'lot', echo: 'E2', fortsetzung: 'Weiter geht es mit dem neuen Plan.', 'text-kurz': kurz });
  // E2 hat die Quelle k2 (die Kurzfassung überspringt sie): ohne text-kurz ist das ein Fehler, mit text-kurz nicht
  const ok = lauf((d) => { d.r.echos = [echos()[1]]; d.k3.szene.push(echoZeile('Gut.')); });
  assert.deepEqual(ok.fehler, []);
  const z = ok.erg.geschichte.kapitel[2].szene[2];
  assert.equal(z.echo, 'E2');
  assert.equal(z.kurzHtml, 'Gut.');
  assert.equal(z.html, 'Delta. Weiter geht es mit dem neuen Plan.');
  assert.deepEqual(lauf((d) => { d.r.echos = [echos()[1]]; d.k3.szene.push({ figur: 'lot', echo: 'E2' }); }).fehler,
    [`${K3} szene Zeile 3: Echo „E2“: seine Quelle (Station 2) fehlt in der Kurzfassung – die Zeile braucht „kurzfassung: nein“ oder „text-kurz“`]);
  // kürzeste Fassung 1 Wort + Fortsetzung 7 Wörter = 8; ein Ersatz mit 8 Wörtern ist nicht kürzer
  assert.deepEqual(lauf((d) => { d.r.echos = [echos()[1]]; d.k3.szene.push(echoZeile('Eins zwei drei vier fünf sechs sieben acht.')); }).fehler,
    [`${K3} szene Zeile 3: „text-kurz“ hat 8 Wörter, die kürzeste Fassung samt Fortsetzung 8 – die Kurzfassung muss kürzer sein`]);
});

test('text-kurz: nicht in den Ersatzzeilen des Endes und nicht in der Pause (dort gibt es keine Kurzfassung)', () => {
  assert.match(lauf((d) => { d.r.ende['nach-falle'][0]['text-kurz'] = 'Kurz.'; }).fehler.join('\n'), /nach-falle 1: unbekanntes Feld „text-kurz“/u);
});

/* ------------------------------------------------------------ nur-kurzfassung -- */

test('nur-kurzfassung: die Zeile steht nur in der Kurzfassung; die Ausgabe trägt nurKurz, im Ende ist sie erlaubt', () => {
  const { fehler, erg } = lauf((d) => { d.k1.szene.push({ figur: 'faden', 'nur-kurzfassung': true, text: 'Drei Wege liegen vor.' }); d.r.ende.szene.push({ figur: 'lot', 'nur-kurzfassung': true, text: 'Kurz.' }); });
  assert.deepEqual(fehler, []);
  assert.equal(erg.geschichte.kapitel[0].szene[2].nurKurz, true);
  assert.equal(erg.geschichte.kapitel[0].szene[2].kurzfassung, true);
  assert.equal(erg.geschichte.ende.szene[3].nurKurz, true);
});

test('nur-kurzfassung: nur ja, nicht mit „kurzfassung: nein“, nur in Stationen der Kurzfassung, auf dem ganzen Weg bleiben mindestens zwei Zeilen', () => {
  assert.deepEqual(lauf((d) => { d.k1.szene.push({ figur: 'faden', 'nur-kurzfassung': false, text: 'Anders.' }); }).fehler,
    [`${K1} szene Zeile 3: „nur-kurzfassung“ gibt es nur als ja (die Zeile steht dann nur in der Kurzfassung) – sonst weglassen`]);
  assert.deepEqual(lauf((d) => { d.k1.szene.push({ figur: 'faden', 'nur-kurzfassung': true, kurzfassung: false, text: 'Beides.' }); }).fehler,
    [`${K1} szene Zeile 3: „nur-kurzfassung“ und „kurzfassung: nein“ zugleich – entweder oder`]);
  assert.deepEqual(lauf((d) => { d.k2.szene.push({ figur: 'faden', 'nur-kurzfassung': true, text: 'Kurz.' }); }).fehler, [`${K2} szene: „nur-kurzfassung“ an einer Zeile nur in Kapiteln der Kurzfassung`]);
  assert.deepEqual(lauf((d) => { d.k1.szene = [zeile('faden', 'Eins'), { figur: 'lot', 'nur-kurzfassung': true, text: 'Zwei.' }, { figur: 'lot', 'nur-kurzfassung': true, text: 'Drei.' }]; }).fehler,
    [`${K1} szene: auf dem ganzen Weg blieben 1 Zeilen – mindestens zwei`]);
  // auf jedem Weg bleiben mindestens zwei Zeilen
  assert.deepEqual(lauf((d) => { d.k1.szene = [zeile('faden', 'Eins'), { figur: 'lot', kurzfassung: false, text: 'Zwei.' }, { figur: 'lot', 'nur-kurzfassung': true, text: 'Drei.' }]; }).fehler, [], 'zwei Zeilen auf jedem Weg reichen');
  // in den Ersatzzeilen des Endes gibt es das Feld nicht
  assert.match(lauf((d) => { d.r.ende['nach-falle'][0]['nur-kurzfassung'] = true; }).fehler.join('\n'), /nach-falle 1: unbekanntes Feld „nur-kurzfassung“/u);
});

test('Echos: elf Einträge sind erlaubt (E8 und E8b), zwölf nicht (L-340)', () => {
  const viele = (n: number): Roh[] => Array.from({ length: n }, (_, i) => ({ id: `E${i + 1}`, quelle: 'k1', fassungen: { gut: 'a.', vertretbar: 'b.', falle: 'c.' } }));
  const mit = (n: number) => (d: { r: Roh; k2: Roh }): void => { d.r.echos = viele(n); d.k2.szene.push(...viele(n).map((e) => ({ figur: 'lot', echo: e.id }))); };
  assert.deepEqual(lauf(mit(11)).fehler, []);
  assert.match(lauf(mit(12)).fehler.join('\n'), /höchstens 11 Echos, nicht 12/u);
});

/* ------------------------------------------------- Nebenfiguren und Stimmen -- */

test('Nebenfiguren: id, name, rolle, akzent (auch „keiner“), kurz (Namensschild) und steckbrief; sie sprechen, sobald rahmen.yaml sie führt', () => {
  const { fehler, erg } = lauf((d) => { d.r.nebenfiguren = neben(); d.k2.szene[0].figur = 'ranzen'; d.k2.szene[1].figur = 'spitzfeder'; d.r.ende.szene.push(zeile('pfennig', 'Wo steht das?')); });
  assert.deepEqual(fehler, []);
  const n = erg.geschichte.nebenfiguren;
  assert.deepEqual(n.map((f: Roh) => f.id), ['ranzen', 'spitzfeder', 'pfennig']);
  assert.deepEqual(Object.keys(n[1]), ['id', 'name', 'rolle', 'akzent', 'kurzHtml', 'steckbriefHtml']);
  assert.equal(n[1].akzent, 'keiner');
  assert.equal(n[0].kurzHtml, 'Vorsitzende des Elternbeirats');
  assert.equal(erg.geschichte.kapitel[1].szene[0].figur, 'ranzen');
  // Gegenprobe: ohne Nebenfiguren fehlt das Feld in der Ausgabe
  assert.ok(!('nebenfiguren' in lauf().erg.geschichte));
});

test('Nebenfiguren: ohne Eintrag in rahmen.yaml spricht keine; Kennungen und Reihenfolge fest; Akzent aus der Palette oder „keiner“; alle Felder Pflicht', () => {
  assert.deepEqual(lauf((d) => { d.k2.szene[0].figur = 'ranzen'; }).fehler, [`${K2} szene Zeile 1: Nebenfigur „ranzen“ steht nicht in „nebenfiguren“ (rahmen.yaml)`]);
  assert.deepEqual(lauf((d) => { d.r.nebenfiguren = neben(); d.k2.szene[0].figur = 'pfennig'; d.r.nebenfiguren.pop(); }).fehler.slice(-1),
    [`${K2} szene Zeile 1: Nebenfigur „pfennig“ steht nicht in „nebenfiguren“ (rahmen.yaml)`]);
  assert.match(lauf((d) => { d.r.nebenfiguren = neben().reverse(); }).fehler.join('\n'), /nebenfiguren: erwartet die drei Nebenfiguren in dieser Reihenfolge: ranzen, spitzfeder, pfennig/u);
  assert.match(lauf((d) => { d.r.nebenfiguren = neben(); d.r.nebenfiguren[0].akzent = 'pink'; }).fehler.join('\n'), /nebenfiguren 1: Akzent „pink“ unbekannt \(sonne, orange, beere, violett, blau, lagune, gruen, keiner\)/u);
  assert.match(lauf((d) => { d.r.nebenfiguren = neben(); delete d.r.nebenfiguren[2].kurz; }).fehler.join('\n'), /nebenfiguren 3: Feld „kurz“ fehlt/u);
  assert.match(lauf((d) => { d.r.nebenfiguren = neben(); d.r.nebenfiguren[1].alter = 52; }).fehler.join('\n'), /nebenfiguren 2: unbekanntes Feld „alter“/u);
  assert.match(lauf((d) => { d.r.nebenfiguren = []; }).fehler.join('\n'), /nebenfiguren: Liste der Nebenfiguren erwartet/u);
  assert.match(lauf((d) => { d.r.nebenfiguren = neben(); d.r.nebenfiguren[0].kurz = 'Siehe Kapitel 4.'; }).fehler.join('\n'), /Kapitel/u, 'die Sichtbar-Probe gilt auch hier');
});

test('Stimmen: „vergabestelle“ und „vertretung“ sprechen ohne Eintrag; auch in den Ersatzzeilen des Endes und in den Wahlen einer Mini-Aufgabe gilt die Liste der Sprecher', () => {
  const { fehler, erg } = lauf((d) => { d.k2.szene[0].figur = 'vertretung'; d.k2.szene[1].figur = 'vergabestelle'; });
  assert.deepEqual(fehler, []);
  assert.deepEqual(erg.geschichte.kapitel[1].szene.map((z: Roh) => z.figur), ['vertretung', 'vergabestelle']);
  assert.deepEqual(lauf((d) => { d.k2.szene[0].figur = 'finanzabteilung'; }).fehler, [`${K2} szene Zeile 1: Figur „finanzabteilung“ unbekannt (grundstein, faden, schwung, klingel, lot, ranzen, spitzfeder, pfennig, vergabestelle, vertretung)`]);
  // Ersatzzeile des Endes durch eine Nebenfigur, die dort spricht
  const ende = lauf((d) => { d.r.nebenfiguren = neben(); d.r.ende.szene.push(zeile('pfennig', 'Wo steht das?')); d.r.ende['nach-falle'].push(zeile('pfennig', 'Das Buch lese ich gern.')); });
  assert.deepEqual(ende.fehler, []);
  // Wahlen der Mini-Aufgabe zeigen weiter nur „sie“ und die fünf Figuren
  assert.match(lauf((d) => { d.k2.mini.wahlen[0].figur = 'ranzen'; }).fehler.join('\n'), /Figur „ranzen“ unbekannt/u);
});

/* ------------------------------------------------- Auftakt: Balken, Wegwahl -- */

const karte = (art: 'lang' | 'kurz', bild: string): Roh => ({ titel: art === 'lang' ? 'Die ganze Geschichte' : 'Die Kurzfassung', text: 'Text der Karte.', knopf: art === 'lang' ? 'Los' : 'Kurzfassung starten', bild });
const wegwahl = (): Roh => ({
  ueberschrift: 'So erleben Sie es:',
  lang: karte('lang', 'Der Weg mit allen drei Stationen, keine ausgelassen'),
  kurz: karte('kurz', 'Derselbe Weg, aber nur zwei von drei Stationen werden gespielt, die übrigen sind kurz überbrückt'),
});

test('auftakt.balken-titel und auftakt.wegwahl: Texte der Wegkarten, die Bildbeschreibung zählt die Stationen der Geschichte nach', () => {
  const { fehler, erg } = lauf((d) => { d.r.auftakt['balken-titel'] = 'Drei Balken'; d.r.auftakt.wegwahl = wegwahl(); });
  assert.deepEqual(fehler, []);
  const a = erg.geschichte.auftakt;
  assert.equal(a.balkenTitel, 'Drei Balken');
  assert.equal(a.wegwahl.ueberschrift, 'So erleben Sie es:');
  assert.deepEqual(Object.keys(a.wegwahl.kurz), ['titel', 'text', 'knopf', 'bild']);
  assert.equal(a.wegwahl.kurz.knopf, 'Kurzfassung starten');
  // Gegenprobe: ohne beide Felder bleibt der Auftakt unverändert
  assert.deepEqual(Object.keys(lauf().erg.geschichte.auftakt), ['campus', 'textHtml', 'vorstellung', 'los', 'kurz']);
});

test('auftakt.wegwahl: die Bildbeschreibung muss zu den Stationen passen; alle vier Texte je Karte sind Pflicht', () => {
  assert.deepEqual(lauf((d) => { d.r.auftakt.wegwahl = wegwahl(); d.r.auftakt.wegwahl.lang.bild = 'Der Weg mit allen vierzehn Stationen, keine ausgelassen'; }).fehler,
    [`${R} auftakt.wegwahl.lang bild: erwartet „Der Weg mit allen drei Stationen, keine ausgelassen“ (die Seite zählt 3 Stationen, davon 2 in der Kurzfassung)`]);
  assert.match(lauf((d) => { d.r.auftakt.wegwahl = wegwahl(); d.r.auftakt.wegwahl.kurz.bild = 'Derselbe Weg, aber nur vier von drei Stationen'; }).fehler.join('\n'), /auftakt.wegwahl.kurz bild: erwartet „Derselbe Weg, aber nur zwei von drei Stationen/u);
  assert.match(lauf((d) => { d.r.auftakt.wegwahl = wegwahl(); delete d.r.auftakt.wegwahl.kurz.knopf; }).fehler.join('\n'), /auftakt.wegwahl.kurz: Feld „knopf“ fehlt/u);
  assert.match(lauf((d) => { d.r.auftakt.wegwahl = wegwahl(); delete d.r.auftakt.wegwahl.ueberschrift; }).fehler.join('\n'), /auftakt.wegwahl: Feld „ueberschrift“ fehlt/u);
  assert.match(lauf((d) => { d.r.auftakt.wegwahl = wegwahl(); d.r.auftakt.wegwahl.lang.dauer = 'etwa 40 Minuten'; }).fehler.join('\n'), /auftakt.wegwahl.lang: unbekanntes Feld „dauer“/u, 'die Minuten rechnet die Seite aus der Messung');
});

/* ---------------------------------------------------------------- oberflaeche -- */

test('oberflaeche: nur bekannte Schlüssel in der erwarteten Form; der Block wird geprüft, aber nicht gebaut', () => {
  const { fehler, erg } = lauf((d) => {
    d.r.oberflaeche = { 'kann-jetzt': 'Das können Sie jetzt', 'buch-spalten': ['Anlass', 'Entschieden von'], 'buch-art': { beschluss: 'Beschluss', vermerk: 'Vermerk', uebergabe: 'Übergabe', 'beschluss-uebergabe': 'Beschluss und Übergabe' }, 'vertiefung-formen': { nachdenken: 'Zum Nachdenken', 'zweiter-fall': 'Ein zweiter Fall', 'warum-so': 'Warum so?' } };
  });
  assert.deepEqual(fehler, []);
  assert.ok(!('oberflaeche' in erg.geschichte), 'die Wörter stehen in src/ui/woerter.ts');
  assert.match(lauf((d) => { d.r.oberflaeche = { 'kann-sie-jetzt': 'x' }; }).fehler.join('\n'), /oberflaeche: unbekanntes Feld „kann-sie-jetzt“/u);
  assert.match(lauf((d) => { d.r.oberflaeche = { 'kann-jetzt': ['Liste'] }; }).fehler.join('\n'), /oberflaeche kann-jetzt: Text erwartet/u);
  assert.match(lauf((d) => { d.r.oberflaeche = { 'buch-spalten': 'Anlass' }; }).fehler.join('\n'), /oberflaeche buch-spalten: Liste erwartet/u);
  assert.match(lauf((d) => { d.r.oberflaeche = { 'buch-art': { beschluss: 'B', unbekannt: 'U' } }; }).fehler.join('\n'), /oberflaeche buch-art: unbekanntes Feld „unbekannt“/u);
  assert.match(lauf((d) => { d.r.oberflaeche = { 'vertiefung-formen': { nachdenken: 'N' } }; }).fehler.join('\n'), /oberflaeche vertiefung-formen: Feld „zweiter-fall“ fehlt/u, 'ein Block mit Unterschlüsseln ist vollständig');
  assert.match(lauf((d) => { d.r.oberflaeche = { buch: 'Siehe Kapitel 3' }; }).fehler.join('\n'), /Kapitel/u, 'die Sichtbar-Probe gilt auch hier');
});

/* -------------------------------------------------------------------- Mandat -- */

test('mandat: der Text einer Zeile darf eine Liste von Absätzen sein, einzelne mit „kurzfassung: nein“; mindestens einer bleibt in der Kurzfassung', () => {
  const liste = [{ wer: 'Sie', text: 'bis 100.000 Euro' }, { wer: 'Bürgermeisterin', text: ['alles darüber', { text: 'Wenn sie fehlt, vertritt sie die Finanzabteilung.', kurzfassung: false }] }];
  const { fehler, erg } = lauf((d) => { d.r.mandat.zeilen = liste; });
  assert.deepEqual(fehler, []);
  const z = erg.geschichte.mandat.zeilen;
  assert.deepEqual(Object.keys(z[0]), ['wer', 'html'], 'eine Zeile mit Text bleibt, wie sie war');
  assert.deepEqual(z[1].absaetze, [{ html: 'alles darüber', kurzfassung: true }, { html: 'Wenn sie fehlt, vertritt sie die Finanzabteilung.', kurzfassung: false }]);
  assert.equal(z[1].html, 'alles darüber Wenn sie fehlt, vertritt sie die Finanzabteilung.');
  assert.match(lauf((d) => { d.r.mandat.zeilen = [{ wer: 'X', text: [{ text: 'a', kurzfassung: false }] }]; }).fehler.join('\n'), /mandat 1: in der Kurzfassung bliebe nichts stehen – mindestens ein Absatz ohne „kurzfassung: nein“/u);
  assert.match(lauf((d) => { d.r.mandat.zeilen = [{ wer: 'X', text: [] }]; }).fehler.join('\n'), /mandat 1: leere Liste/u);
  assert.match(lauf((d) => { d.r.mandat.zeilen = [{ wer: 'X', text: [{ text: 'a', kurzfassung: 'nein' }] }]; }).fehler.join('\n'), /Absatz 1: „kurzfassung“ muss ja oder nein sein/u);
  assert.match(lauf((d) => { d.r.mandat.zeilen = [{ wer: 'X', text: [{ satz: 'a' }] }]; }).fehler.join('\n'), /Absatz 1: unbekanntes Feld „satz“/u);
});

/* ----------------------------------------------------------------- Schlagzeile -- */

test('schlagzeile: die Unterschrift unter dem Bild „schlagzeile“ einer Antwort; ohne dieses Bild gibt es sie nicht', () => {
  const { fehler, erg } = lauf((d) => { d.k2.antworten[1].bild = 'schlagzeile'; d.k2.antworten[1].schlagzeile = 'Stadt verspricht: 2028 ist alles fertig'; });
  assert.deepEqual(fehler, []);
  assert.equal(erg.geschichte.kapitel[1].antworten[1].schlagzeileHtml, 'Stadt verspricht: 2028 ist alles fertig');
  assert.ok(!('schlagzeileHtml' in erg.geschichte.kapitel[1].antworten[0]));
  assert.deepEqual(lauf((d) => { d.k2.antworten[1].schlagzeile = 'Ohne Bild'; }).fehler, [`${K2} Antwort 2: „schlagzeile“ braucht das Bild „schlagzeile“ an derselben Antwort`]);
  assert.deepEqual(lauf((d) => { d.k2.antworten[1].bild = 'mappe'; d.k2.antworten[1].schlagzeile = 'Falsches Bild'; }).fehler, [`${K2} Antwort 2: „schlagzeile“ braucht das Bild „schlagzeile“ an derselben Antwort`]);
  // das Bild allein ist erlaubt (die Entwürfe zeigen es ohne Unterschrift)
  assert.deepEqual(lauf((d) => { d.k2.antworten[1].bild = 'schlagzeile'; }).fehler, []);
});

/* ------------------------------------------------------------------- Brücken -- */

const mitAkten = (d: { r: Roh }): void => {
  d.r.akte = [{ id: 'a1', titel: 'Ordnung schaffen', zeitraum: 'Januar bis Juni 2026', stationen: ['k1', 'k2', 'k3'], kopf: 'Kopf.', pause: { koennen: ['Eins.', 'Zwei.', 'Drei.'] } }];
};

test('Brückenzeile mit Akten: „Monat: Satz“ – die Nummer vor dem Satz entfällt, fehlt der Monat, kommt er aus der Zeit der Station', () => {
  const bruecke = (t: string, zeit = 'März') => lauf((d) => { mitAkten(d); d.k2.bruecke = t; d.k2.zeit = zeit; });
  assert.equal(bruecke('Ein Sturm kommt.').erg.geschichte.kapitel[1].brueckeHtml, 'März: Ein Sturm kommt.');
  assert.equal(bruecke('Mai: Ein Sturm kommt.').erg.geschichte.kapitel[1].brueckeHtml, 'Mai: Ein Sturm kommt.');
  assert.equal(bruecke('**2** · Mai: Ein Sturm kommt.').erg.geschichte.kapitel[1].brueckeHtml, 'Mai: Ein Sturm kommt.');
  assert.equal(bruecke('**2** · Ein Sturm kommt.', 'August 2026').erg.geschichte.kapitel[1].brueckeHtml, 'August: Ein Sturm kommt.');
  assert.deepEqual(bruecke('Mai: Ein Sturm kommt.').fehler, []);
  assert.deepEqual(bruecke('**3** · Mai: Ein Sturm kommt.').fehler, [`${K2} bruecke: die Nummer „3“ vor dem Satz ist nicht die der Station (2) – die Seite setzt sie selbst, sie kann entfallen`]);
  assert.deepEqual(bruecke('Ein Sturm kommt.', 'Ende August').fehler, [`${K2} bruecke: die Brückenzeile beginnt mit „Monat:“ – oder die Zeit der Station nennt den Monat zuerst`]);
  // Gegenprobe: ohne Akte bleibt der Brückensatz, wie er war (Markdown-Block, keine Ergänzung)
  assert.equal(lauf((d) => { d.k2.bruecke = 'Ein Sturm kommt.'; }).erg.geschichte.kapitel[1].brueckeHtml, 'Ein Sturm kommt.');
});

/* ------------------------------------------------------- Eintrag-Kärtchen -- */

const ZEILEN = ['Quelle', 'Offene Frage', 'Antwort bis', 'Gebraucht für'];
const eintragPosten = (zeilen: (string | null)[] = ZEILEN): Roh[] => zeilen.map((z, i) => ({
  text: `Gespräch ${i + 1}`, gespraech: [{ wer: 'Lot', text: `Frage ${i + 1}` }, { wer: 'Lot', text: `Antwort ${i + 1}` }],
  erklaerung: z === null ? `Die Vertretung hält Punkt ${i + 1} fest.` : `Zeile „${z}“: Die Vertretung würde festhalten: „Eintrag ${i + 1}“. Das wäre Punkt ${i + 1}.`,
}));
const rueck = (posten: Roh[], extra: Roh = {}) => (d: { k2: Roh }): void => {
  d.k2.mini = { art: 'rueckfragen', titel: 'Wer weiß was?', aufgabe: 'Aufgabe.', bild: 'mappe', kontingent: 2, schluss: 'Die übrigen fragt die Vertretung nach.', posten, ...extra };
};

test('rueckfragen: beginnen alle Erklärungen mit „Zeile „…“: Die Vertretung würde festhalten: „…““, zeichnet die Seite das Eintrag-Kärtchen; die Erklärung bleibt unverändert', () => {
  const { fehler, erg } = lauf(rueck(eintragPosten(), { eintrag: 'Lüftung · Hersteller · frag Theo' }));
  assert.deepEqual(fehler, []);
  const m = erg.geschichte.kapitel[1].mini;
  assert.deepEqual(m.eintrag, { titelHtml: 'Lüftung · Hersteller · frag Theo', zeilen: ZEILEN });
  assert.deepEqual(m.posten.map((p: Roh) => [p.eintragZeile, p.eintragTextHtml]), ZEILEN.map((z, i) => [z, `Eintrag ${i + 1}`]));
  assert.match(m.posten[0].erklaerungHtml, /^Zeile „Quelle“: Die Vertretung würde festhalten: „Eintrag 1“\. Das wäre Punkt 1\.$/u);
  // ohne Kopf: das Kärtchen hat keinen Titel
  assert.equal(lauf(rueck(eintragPosten())).erg.geschichte.kapitel[1].mini.eintrag.titelHtml, null);
  // Gegenprobe: ohne diese Form der Erklärung gibt es kein Kärtchen und keine neuen Felder
  const ohne = lauf(rueck(eintragPosten([null, null, null, null]))).erg.geschichte.kapitel[1].mini;
  assert.ok(!('eintrag' in ohne));
  assert.ok(!('eintragZeile' in ohne.posten[0]));
});

test('rueckfragen: alle oder keine Erklärung nennt ihre Zeile, jede Zeile nur einmal; „eintrag“ ohne Kärtchen und bei anderen Arten ist ein Fehler', () => {
  assert.match(lauf(rueck(eintragPosten(['Quelle', 'Offene Frage', null, null]))).fehler.join('\n'), /Eintrag-Kärtchen: 2 von 4 Erklärungen beginnen mit/u);
  assert.match(lauf(rueck(eintragPosten(['Quelle', 'Quelle', 'Antwort bis', 'Gebraucht für']))).fehler.join('\n'), /Eintrag-Kärtchen: zwei Gespräche füllen dieselbe Zeile/u);
  assert.match(lauf(rueck(eintragPosten([null, null, null, null]), { eintrag: 'Lüftung' })).fehler.join('\n'), /Feld „eintrag“ ohne Kärtchen/u);
  assert.match(lauf((d) => { d.k2.mini.eintrag = 'Lüftung'; }).fehler.join('\n'), /Feld „eintrag“ gibt es bei der Art „zuordnen“ nicht/u);
});
