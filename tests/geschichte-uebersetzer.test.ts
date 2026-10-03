/*
 * Story-Übersetzer (werkzeuge/geschichte.mjs, baueGeschichte): strenge Prüfungen an einer kleinen, gültigen
 * Kunst-Geschichte (zwei Kapitel) – unabhängig von den echten Inhalten. Jeder Fall verfälscht genau eine Stelle und
 * verlangt genau die erwartete Fehlermeldung; die Grundlage selbst ist fehlerfrei (Gegenprobe zu jedem Fall).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import YAML from 'yaml';

import { baueGeschichte } from '../werkzeuge/geschichte.mjs';

type Roh = Record<string, any>;

/** Kompilierer-Stub: sammelt Fehler als „ort: text“, Markdown bleibt Text, keine Quelle (Absatz-IDs nur nach Form). */
function stub(): { c: unknown; fehler: string[] } {
  const fehler: string[] = [];
  const c = {
    fehler: (ort: string, text: string) => { fehler.push(`${ort}: ${text}`); },
    warnung: () => undefined,
    html: (t: string) => t,
    inline: (t: string) => t,
    quelle: null,
  };
  return { c, fehler };
}

const zeile = (figur: string, text: string): Roh => ({ figur, text });
const antwort = (wertung: string, g = 0, z = 0, v = 0): Roh => ({ wertung, text: `Antwort ${wertung}`, balken: { geld: g, zeit: z, vertrauen: v }, folge: `Folge ${wertung}` });

function rahmen(): Roh {
  const balken = (start: number): Roh => ({ titel: 'B', text: 'Text', start, mehr: 'mehr', weniger: 'weniger', bilanz: { hoch: 'h', mittel: 'm', niedrig: 'n' } });
  return {
    titel: 'Kunst-Geschichte',
    auftakt: { campus: { stufe: 0, jahreszeit: 'winter', licht: 'morgen' }, text: 'Ein fiktiver Fall.', vorstellung: 'Diese begleiten Sie:', los: 'Los', kurz: 'Kurz' },
    sie: { steckbrief: 'Sie leiten.' },
    figuren: ['grundstein', 'faden', 'schwung', 'klingel', 'lot'].map((id) => ({ id, name: id, rolle: 'Rolle', akzent: 'blau', steckbrief: 'Text' })),
    balken: { geld: balken(9), zeit: balken(6), vertrauen: balken(4) },
    bilanz: Object.fromEntries(['nicht-getragen', 'letzte-meter', 'ruhig', 'umwege', 'offen'].map((k) => [k, { titel: k, text: 'Text' }])),
    mandat: { titel: 'Wer entscheidet was', zeilen: [{ wer: 'Sie', text: 'bis 100.000 Euro' }] },
    ende: {
      zeit: 'August', campus: { stufe: 8, jahreszeit: 'sommer', licht: 'morgen' }, einstieg: 'Morgens.',
      szene: [zeile('klingel', 'Guten Morgen!'), zeile('grundstein', 'Gut.')], 'zeit-niedrig': 'Halle zu.', 'vertrauen-niedrig': [zeile('grundstein', 'Früher reden.')], 'nach-falle': [zeile('grundstein', 'Nicht immer gut.')], offen: [zeile('grundstein', 'Noch offen.')],
    },
  };
}

function kapitel1(): Roh {
  return {
    nr: 1, titel: 'Erstes', zeit: 'Januar', campus: { stufe: 0, jahreszeit: 'winter', licht: 'morgen' }, kurzfassung: true, thema: 'begriffe',
    belege: ['k4.2-p3', 'v24:hb-3.1', 'v24:hb-projektblatt'], einstieg: 'Einstieg', szene: [zeile('faden', 'Hallo')], frage: 'Was tun?',
    antworten: [antwort('vertretbar', 0, -1, 1), antwort('gut', 0, 0, 2), antwort('falle', 0, 1, -2)], gut: 'So gut.', dahinter: 'Dahinter.',
    'mandat-nach-folge': true, 'bild-szene': 'bauzaun', regie: { leitfragen: ['Frage?'] },
    vergleich: {
      einleitung: 'Vergleich', kriterien: [{ id: 'geld', titel: 'Geld', gewicht: 3 }, { id: 'zeit', titel: 'Zeit', gewicht: 5 }],
      optionen: [
        { id: 'A', titel: 'Ah', punkte: { geld: 2, zeit: 5 }, worte: { geld: 'teuer', zeit: 'schnell' }, begruendung: 'geheim' },
        { id: 'B', titel: 'Be', punkte: { geld: 5, zeit: 2 }, worte: { geld: 'billig', zeit: 'langsam' } },
      ],
      saetze: { A: 'A vorn', B: 'B vorn', gleichauf: 'gleich' }, empfehlung: 'Empfehlung', wer: 'Wer',
    },
  };
}

function kapitel2(): Roh {
  return {
    nr: 2, titel: 'Zweites', zeit: 'März', campus: { stufe: 1, jahreszeit: 'fruehling', licht: 'tag' }, bruecke: 'Inzwischen.', thema: 'takt',
    belege: ['v24:tlb-2'], einstieg: 'Einstieg', szene: [zeile('lot', 'Holz')], frage: 'Und?',
    antworten: [antwort('gut'), antwort('falle'), antwort('vertretbar')], gut: 'Gut.', dahinter: 'Dahinter.',
    mini: {
      art: 'zuordnen', titel: 'Wer?', aufgabe: 'Zuordnen.', bild: 'kaertchen',
      wahlen: [{ id: 'sie', titel: 'Sie', figur: 'sie' }, { id: 'bm', titel: 'Bürgermeisterin', figur: 'grundstein' }, { id: 'ps', titel: 'Projektsteuerin', falsch: 'Nie.' }],
      posten: [{ text: 'Eins', loesung: 'sie', erklaerung: 'E' }, { text: 'Zwei', loesung: 'bm', erklaerung: 'E' }, { text: 'Drei', loesung: 'bm', erklaerung: 'E' }],
    },
  };
}

const THEMEN = ['begriffe', 'takt'];

function lauf(aendere: (d: { r: Roh; k1: Roh; k2: Roh }) => void = () => undefined, extra: { rel: string; text: string }[] = []): { fehler: string[]; erg: any } {
  const d = { r: rahmen(), k1: kapitel1(), k2: kapitel2() };
  aendere(d);
  const { c, fehler } = stub();
  const erg = baueGeschichte(c, [
    { rel: 'inhalte/geschichte/rahmen.yaml', text: YAML.stringify(d.r) },
    { rel: 'inhalte/geschichte/k1-erstes.yaml', text: YAML.stringify(d.k1) },
    { rel: 'inhalte/geschichte/k2-zweites.yaml', text: YAML.stringify(d.k2) },
    ...extra,
  ], THEMEN);
  return { fehler, erg };
}

const K1 = 'inhalte/geschichte/k1-erstes.yaml';
const K2 = 'inhalte/geschichte/k2-zweites.yaml';
const R = 'inhalte/geschichte/rahmen.yaml';

test('Grundlage: fehlerfrei; Belege und Begründungen bleiben intern, die Regie getrennt', () => {
  const { fehler, erg } = lauf();
  assert.deepEqual(fehler, []);
  const g = erg.geschichte;
  assert.equal(g.kapitel.length, 2);
  assert.deepEqual(g.kapitel.map((k: Roh) => k.id), ['k1', 'k2']);
  assert.deepEqual(g.kapitel[0].antworten.map((a: Roh) => a.wirkung), [{ geld: 0, zeit: -1, vertrauen: 1 }, { geld: 0, zeit: 0, vertrauen: 2 }, { geld: 0, zeit: 1, vertrauen: -2 }]);
  const json = JSON.stringify(g);
  assert.doesNotMatch(json, /belege|begruendung|geheim|k4\.2-p3|v24:/u);
  assert.match(JSON.stringify(erg.regie), /Frage\?/u);
  assert.doesNotMatch(json, /Frage\?/u, 'Regie-Material nicht in der öffentlichen Geschichte');
  assert.equal(g.kapitel[1].brueckeHtml, 'Inzwischen.');
  assert.equal(g.kapitel[0].brueckeHtml, null);
});

test('Unbekanntes Feld – im Kapitel, in einer Antwort, im Rahmen: Fehler', () => {
  assert.deepEqual(lauf(({ k1 }) => { k1.lph = 3; }).fehler, [`${K1}: unbekanntes Feld „lph“ (erlaubt: nr, titel, zeit, campus, thema, belege, einstieg, szene, frage, antworten, gut, dahinter, kurzfassung, bruecke, einstieg-kurz, campus-nachher, zusatz, bild-szene, bild-frage, mandat-nach-folge, mini, vergleich, regie)`]);
  assert.deepEqual(lauf(({ k1 }) => { k1.antworten[0].punkte = 3; }).fehler, [`${K1} Antwort 1: unbekanntes Feld „punkte“ (erlaubt: wertung, text, balken, folge, bild)`]);
  assert.deepEqual(lauf(({ r }) => { r.prolog = {}; }).fehler, [`${R}: unbekanntes Feld „prolog“ (erlaubt: titel, auftakt, sie, figuren, balken, bilanz, mandat, ende)`]);
});

test('Unbekannte Datei im Ordner (etwa eine alte Station): Fehler statt stillem Übergehen', () => {
  assert.deepEqual(lauf(() => undefined, [{ rel: 'inhalte/geschichte/s1-alt.yaml', text: 'id: s1' }]).fehler,
    ['inhalte/geschichte/s1-alt.yaml: unbekannte Datei im Ordner der Story – erwartet rahmen.yaml oder k<n>-<name>.yaml']);
});

test('Thema, das es nicht gibt: Fehler', () => {
  assert.deepEqual(lauf(({ k2 }) => { k2.thema = 'gibt-es-nicht'; }).fehler, [`${K2}: Thema „gibt-es-nicht“ gibt es nicht (#theorie/<thema>)`]);
});

test('Genau drei Antworten mit je einer Wertung', () => {
  assert.deepEqual(lauf(({ k2 }) => { k2.antworten.pop(); }).fehler, [`${K2}: genau drei Antworten erwartet, nicht 2`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.antworten.push(antwort('gut')); }).fehler, [`${K2}: genau drei Antworten erwartet, nicht 4`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.antworten[1].wertung = 'gut'; }).fehler, [`${K2}: Wertung „gut“ 2-mal – jede Wertung genau einmal`, `${K2}: Wertung „falle“ 0-mal – jede Wertung genau einmal`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.antworten[1].wertung = 'mies'; }).fehler, [`${K2} Antwort 2: Wertung „mies“ – erwartet gut, vertretbar, falle`, `${K2}: Wertung „falle“ 0-mal – jede Wertung genau einmal`]);
});

test('Balkenwirkung nur ganze Zahlen von −2 bis +2, alle drei Balken', () => {
  assert.deepEqual(lauf(({ k2 }) => { k2.antworten[0].balken.zeit = 3; }).fehler, [`${K2} Antwort 1 balken: zeit = 3 – erwartet eine ganze Zahl von −2 bis +2`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.antworten[0].balken.geld = -3; }).fehler, [`${K2} Antwort 1 balken: geld = -3 – erwartet eine ganze Zahl von −2 bis +2`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.antworten[0].balken.vertrauen = 1.5; }).fehler, [`${K2} Antwort 1 balken: vertrauen = 1.5 – erwartet eine ganze Zahl von −2 bis +2`]);
  assert.deepEqual(lauf(({ k2 }) => { delete k2.antworten[0].balken.vertrauen; }).fehler, [`${K2} Antwort 1 balken: Feld „vertrauen“ fehlt`, `${K2} Antwort 1 balken: vertrauen =  – erwartet eine ganze Zahl von −2 bis +2`]);
  // Grenzen sind erlaubt
  assert.deepEqual(lauf(({ k2 }) => { k2.antworten[0].balken = { geld: -2, zeit: 2, vertrauen: 0 }; }).fehler, []);
});

test('Belege: Pflicht, intern, nur Absatz-ID oder Stelle aus V2.4', () => {
  assert.deepEqual(lauf(({ k2 }) => { delete k2.belege; }).fehler, [`${K2}: Feld „belege“ fehlt`, `${K2}: interne Belege fehlen (Feld „belege“)`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.belege = ['Handbuch 3.1']; }).fehler, [`${K2}: Beleg „Handbuch 3.1“ – erwartet eine Absatz-ID (k4.2-p3) oder eine Stelle aus V2.4 (v24:hb-3.1)`]);
});

test('Sichtbare Texte durch die Sichtbar-Probe: „Kapitel“, „Beleg“, Kennungen sind Fehler', () => {
  const f = lauf(({ k2 }) => { k2.antworten[0].folge = 'Wie in Kapitel 3 gesehen.'; }).fehler;
  assert.equal(f.length, 1);
  assert.match(f[0] ?? '', /^inhalte\/geschichte\/k2-zweites\.yaml Antwort 1 folge: verbotenes Wort sichtbar \(Kapitel\)/u);
  assert.match(lauf(({ r }) => { r.bilanz.ruhig.text = 'Beleg k4.2-p3'; }).fehler.join('\n'), /Absatz-ID/u);
  assert.match(lauf(({ k1 }) => { k1.szene[0].text = 'nach L-121'; }).fehler.join('\n'), /Entscheidungskennung/u);
});

test('Nummern lückenlos ab 1 und passend zum Dateinamen', () => {
  assert.deepEqual(lauf(({ k2 }) => { k2.nr = 3; }).fehler, [`${K2}: Nummer 3 – erwartet 2 (lückenlos ab 1)`, `${K2}: Nummer 3 passt nicht zum Dateinamen (k2-…)`]);
});

test('Kurzfassung: ein Kapitel darin hat keine Brücke, eines außerhalb braucht eine; das erste gehört dazu', () => {
  assert.deepEqual(lauf(({ k1 }) => { k1.bruecke = 'x'; }).fehler, [`${K1}: ein Kapitel der Kurzfassung hat keinen Brückensatz`]);
  assert.deepEqual(lauf(({ k2 }) => { delete k2.bruecke; }).fehler, [`${K2}: ein Kapitel außerhalb der Kurzfassung braucht einen Brückensatz (Feld „bruecke“)`]);
  assert.deepEqual(lauf(({ k1, k2 }) => { delete k1.kurzfassung; k1.bruecke = 'x'; k2.kurzfassung = true; delete k2.bruecke; }).fehler, [`${R}: das erste Kapitel gehört zur Kurzfassung`]);
});

test('Vergleich: genau einer; Gewichte nur 5/3/1; Punkte 1–5; zu jeder Option und zum Gleichstand ein Satz', () => {
  assert.deepEqual(lauf(({ k1 }) => { delete k1.vergleich; }).fehler, [`${R}: genau ein Kapitel mit Vergleich erwartet, nicht 0`]);
  assert.deepEqual(lauf(({ k1, k2 }) => { k2.vergleich = structuredClone(k1.vergleich); }).fehler, [`${R}: genau ein Kapitel mit Vergleich erwartet, nicht 2`]);
  assert.deepEqual(lauf(({ k1 }) => { k1.vergleich.kriterien[0].gewicht = 4; }).fehler, [`${K1} vergleich kriterien 1: Gewicht „4“ – erwartet 5 (sehr wichtig), 3 (wichtig) oder 1 (weniger wichtig)`]);
  // Gegenprobe Kriterium doppelt (R73); die Folgefehler bei Punkten und Worten zeigen, was sonst still überschrieben würde
  assert.deepEqual(lauf(({ k1 }) => { k1.vergleich.kriterien[1].id = 'geld'; }).fehler[0], `${K1} vergleich: Kriterium doppelt`);
  assert.ok(!lauf().fehler.some((f) => f.includes('Kriterium doppelt')));
  assert.deepEqual(lauf(({ k1 }) => { k1.vergleich.optionen[1].punkte.zeit = 6; }).fehler, [`${K1} vergleich optionen 2 punkte: zeit = 6 – erwartet 1–5`]);
  assert.deepEqual(lauf(({ k1 }) => { delete k1.vergleich.saetze.gleichauf; }).fehler, [`${K1} vergleich saetze: Feld „gleichauf“ fehlt`]);
  assert.deepEqual(lauf(({ k1 }) => { k1.vergleich.optionen.pop(); }).fehler, [`${K1} vergleich: mindestens zwei zulässige Optionen`, `${K1} vergleich saetze: unbekanntes Feld „B“ (erlaubt: A, gleichauf)`]);
});

test('Mini-Aufgabe: Lösung ist eine der Wahlen; eine Reihenfolge hat keine Wahlen; feste Rückmeldung nur für falsche Wahlen', () => {
  assert.deepEqual(lauf(({ k2 }) => { k2.mini.posten[0].loesung = 'stadtrat'; }).fehler, [`${K2} mini posten 1: Lösung „stadtrat“ ist keine der Wahlen`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.mini.art = 'reihenfolge'; for (const p of k2.mini.posten) delete p.loesung; }).fehler, [`${K2} mini: eine Reihenfolge hat keine Wahlen`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.mini.wahlen[0].falsch = 'nein'; }).fehler, [`${K2} mini: Wahl „sie“ hat eine feste Rückmeldung „falsch“, ist aber bei einem Posten richtig`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.mini.posten.pop(); }).fehler, [`${K2} mini: mindestens drei Posten`]);
});

test('Bilder nur aus dem Bestand von src/grafik/figuren.ts; Figuren nur die fünf', () => {
  assert.deepEqual(lauf(({ k1 }) => { k1['bild-szene'] = 'einhorn'; }).fehler, [`${K1}: Bild „einhorn“ gibt es nicht (src/grafik/figuren.ts, GIMMICKS)`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.szene[0].figur = 'stadtrat'; }).fehler, [`${K2} szene Zeile 1: Figur „stadtrat“ unbekannt (grundstein, faden, schwung, klingel, lot)`]);
});

test('Ende: die Ersatzzeilen „Vertrauen niedrig“ und „nach einer Falle“ ersetzen Zeilen von Figuren, die dort sprechen (L-239)', () => {
  assert.deepEqual(lauf(({ r }) => { r.ende['vertrauen-niedrig'][0].figur = 'lot'; }).fehler, [`${R} ende.vertrauen-niedrig: ersetzt die Zeile einer Figur, die in der Szene des Endes spricht – „lot“ spricht dort nicht`]);
  assert.deepEqual(lauf(({ r }) => { r.ende['nach-falle'].push(zeile('grundstein', 'Noch einmal.')); }).fehler, [`${R} ende.nach-falle: eine Figur hat zwei Ersatzzeilen`]);
  assert.deepEqual(lauf(({ r }) => { delete r.ende['nach-falle']; }).fehler, [`${R} ende: Feld „nach-falle“ fehlt`]);
  assert.deepEqual(lauf(({ r }) => { r.ende['nach-falle'] = zeile('grundstein', 'Einzeln.'); }).fehler, [`${R} ende.nach-falle: Liste von Ersatzzeilen { figur, text } erwartet`]);
});

test('Mini-Aufgabe: Pflichtbild für den Schritt (O-53), Bilder an Karten und Ablagen nur aus dem Bestand', () => {
  assert.deepEqual(lauf(({ k2 }) => { delete k2.mini.bild; }).fehler, [`${K2} mini: Feld „bild“ fehlt`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.mini.posten[0].bild = 'einhorn'; }).fehler, [`${K2} mini posten 1: Bild „einhorn“ gibt es nicht (src/grafik/figuren.ts, GIMMICKS)`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.mini.wahlen[0].bild = 'einhorn'; }).fehler, [`${K2} mini wahlen 1: Bild „einhorn“ gibt es nicht (src/grafik/figuren.ts, GIMMICKS)`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.mini.posten[0].bild = 'mappe'; k2.mini.wahlen[0].bild = 'stempel'; }).fehler, []);
});

test('Kurze sichtbare Felder (Titel, Kriterien, Namen) laufen durch die Sichtbar-Probe', () => {
  const titel = lauf(({ k1 }) => { k1.titel = 'Kapitel 1'; }).fehler;
  assert.ok(titel.length > 0 && titel.every((f) => f.startsWith(`${K1}:`) && /Kapitel/u.test(f)), titel.join('\n'));
  const krit = lauf(({ k1 }) => { k1.vergleich.kriterien[0]['im-satz'] = 'das Whitepaper'; }).fehler;
  assert.ok(krit.length > 0 && krit.every((f) => /kriterien 1/u.test(f)), krit.join('\n'));
  // Gegenprobe: ein harmloser Titel ist fehlerfrei
  assert.deepEqual(lauf(({ k1 }) => { k1.titel = 'Der erste Schritt'; }).fehler, []);
});

test('Campus: Wetter optional und nur „sturm“', () => {
  assert.deepEqual(lauf(({ k2 }) => { k2.campus.wetter = 'regen'; }).fehler, [`${K2} campus: Wetter „regen“ – erwartet sturm`]);
  // Gegenprobe: „sturm“ ist erlaubt und kommt im Ergebnis an
  const ok = lauf(({ k2 }) => { k2.campus.wetter = 'sturm'; });
  assert.deepEqual(ok.fehler, []);
  assert.equal(ok.erg.geschichte.kapitel[1].campus.wetter, 'sturm');
});

test('Campus: Stufe 0–8, bekannte Jahreszeit und bekanntes Licht', () => {
  assert.deepEqual(lauf(({ k2 }) => { k2.campus = { stufe: 9, jahreszeit: 'regen', licht: 'nacht' }; }).fehler, [
    `${K2} campus: Campus-Stufe „9“ – erwartet 0–8`,
    `${K2} campus: Jahreszeit „regen“ – erwartet fruehling, sommer, herbst, winter`,
    `${K2} campus: Licht „nacht“ – erwartet morgen, tag, abend`,
  ]);
});

test('Kurzfassung kürzer (P17.5): „einstieg-kurz“ nur in Kapiteln der Kurzfassung und kürzer; Zeilen mit „kurzfassung: nein“ nur dort, mindestens zwei bleiben', () => {
  // gültig: kürzerer Einstieg und eine weggelassene Zeile; die Ausgabe trägt beides, die Grundlage hat keines
  const grund = lauf().erg.geschichte;
  assert.equal(grund.kapitel[0].einstiegKurzHtml, null);
  assert.equal(grund.ende.einstiegKurzHtml, null);
  assert.deepEqual(grund.kapitel[0].szene.map((z: Roh) => z.kurzfassung), [true]);
  const gut = lauf(({ r, k1 }) => {
    k1.einstieg = 'Ein langer Einstieg mit vielen Wörtern.';
    k1['einstieg-kurz'] = 'Kurz und knapp.';
    k1.szene = [zeile('faden', 'Eins'), { ...zeile('lot', 'Zwei'), kurzfassung: false }, zeile('grundstein', 'Drei')];
    r.ende.einstieg = 'Morgens am ersten Schultag.';
    r.ende['einstieg-kurz'] = 'Morgens.';
  });
  assert.deepEqual(gut.fehler, []);
  assert.equal(gut.erg.geschichte.kapitel[0].einstiegKurzHtml, 'Kurz und knapp.');
  assert.deepEqual(gut.erg.geschichte.kapitel[0].szene.map((z: Roh) => z.kurzfassung), [true, false, true]);
  assert.equal(gut.erg.geschichte.ende.einstiegKurzHtml, 'Morgens.');
  // nicht kürzer
  assert.deepEqual(lauf(({ k1 }) => { k1['einstieg-kurz'] = 'Ein anderer Einstieg'; }).fehler, [`${K1}: „einstieg-kurz“ hat 3 Wörter, „einstieg“ 1 – die Kurzfassung muss kürzer sein`]);
  // außerhalb der Kurzfassung
  assert.deepEqual(lauf(({ k2 }) => { k2.einstieg = 'Ein langer Einstieg'; k2['einstieg-kurz'] = 'Kurz'; }).fehler, [`${K2}: „einstieg-kurz“ nur in Kapiteln der Kurzfassung`]);
  assert.deepEqual(lauf(({ k2 }) => { k2.szene = [zeile('lot', 'Holz'), { ...zeile('faden', 'Ja'), kurzfassung: false }, zeile('lot', 'Gut')]; }).fehler,
    [`${K2} szene: „kurzfassung: nein“ an einer Zeile nur in Kapiteln der Kurzfassung`]);
  // zu wenig bleibt stehen; kein Wahrheitswert
  assert.deepEqual(lauf(({ k1 }) => { k1.szene = [zeile('faden', 'Eins'), { ...zeile('lot', 'Zwei'), kurzfassung: false }]; }).fehler, [`${K1} szene: in der Kurzfassung blieben 1 Zeilen – mindestens zwei`]);
  assert.deepEqual(lauf(({ k1 }) => { k1.szene[0].kurzfassung = 'nein bitte'; }).fehler, [`${K1} szene Zeile 1: „kurzfassung“ muss ja oder nein sein`]);
  // eine Ersatzzeile übernimmt den Weg der ersetzten Zeile und kennt das Feld deshalb nicht
  assert.deepEqual(lauf(({ r }) => { r.ende['vertrauen-niedrig'][0].kurzfassung = false; }).fehler, [`${R} ende.vertrauen-niedrig 1: unbekanntes Feld „kurzfassung“ (erlaubt: text, figur, zusatz)`]);
});
