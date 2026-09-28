/*
 * Inhaltswerkzeug (werkzeuge/inhalte.mjs, P0.5): Beispiel → erwartetes JSON, kaputtes Beispiel →
 * die richtigen Fehler, Mutanten-Probe (verfälschtes Zitat wird erkannt), echte Inhalte fehlerfrei.
 * Fixturen entstehen zur Laufzeit unter tmp/ und werden danach gelöscht.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { feldName, kompiliere, stabilesJson } from '../werkzeuge/inhalte.mjs';
import type { Inhalte } from '../src/inhalte/typen.ts';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = path.join(WURZEL, 'tmp');
mkdirSync(TMP, { recursive: true });
const ORDNER: string[] = [];
after(() => { for (const o of ORDNER) rmSync(o, { recursive: true, force: true }); });

function neueWurzel(dateien: Record<string, string>, whitepaper: unknown = WHITEPAPER): string {
  const w = mkdtempSync(path.join(TMP, 'test-inhalte-'));
  ORDNER.push(w);
  for (const [rel, text] of Object.entries(dateien)) {
    const voll = path.join(w, rel);
    mkdirSync(path.dirname(voll), { recursive: true });
    writeFileSync(voll, text, 'utf8');
  }
  if (whitepaper !== null) {
    const wp = path.join(w, 'quellen', 'whitepaper', 'v1.2', 'whitepaper.json');
    mkdirSync(path.dirname(wp), { recursive: true });
    writeFileSync(wp, JSON.stringify(whitepaper), 'utf8');
  }
  return w;
}

const WHITEPAPER = {
  fassung: 'V1.2',
  titel: 'Test',
  untertitel: '',
  kapitel: [{
    id: 'k2', nr: '2', titel: 'Ausgangslage',
    bloecke: [{ id: 'k2-p1', art: 'absatz', text: 'Einleitung zum Kapitel.' }],
    abschnitte: [{
      id: 'k2.4', nr: '2.4', titel: 'Warum Berichterstattung nicht reicht', abschnitte: [],
      bloecke: [
        { id: 'k2.4-p1', art: 'absatz', text: 'Mehr Berichte helfen manchmal.' },
        { id: 'k2.4-p2', art: 'absatz', text: 'Berichterstattung erzeugt Information. Führung entsteht erst, wenn Information mit Mandat verbunden wird. Ein Ampelbericht ohne Entscheidungsfrage bleibt Beobachtung.' },
        { id: 'k2.4-l1', art: 'liste', text: 'eins\nzwei', punkte: ['eins', 'zwei'] },
      ],
    }],
  }],
  glossar: [
    { id: 'g-mandat', begriff: 'Mandat', definition: 'Klar zugewiesene Entscheidungsbefugnis.' },
    { id: 'g-entscheidungsreife', begriff: 'Entscheidungs­reife', definition: 'Ausreichend vorbereitet.' },
    { id: 'g-mvg', begriff: 'Minimum Viable Governance (MVG)', definition: 'Kleinster Standard.' },
  ],
  abbildungen: [],
};

const ROLLE = (titel: string, farbe: string): string => `---\ntitel: ${titel}\nfarbe: "${farbe}"\n---\nText.\n\n### Linse\nWorauf die Rolle schaut.\n`;

/** Das Beispiel: vollständige Mini-Story (Prolog → X1 → Vergleich V → Y1). */
const BEISPIEL: Record<string, string> = {
  'inhalte/fall.md': `---
stadt: Musterstadt
bauherr: Stadt Musterstadt
vertretung: Muster GmbH
projekt: Musterschule
projektbasis: 10 Mio. €
projektbasis-mio: 10,5
hinweis: Fiktiver Fall.
---
Ein Beispiel.

::: figur brenner
---
name: Jonas Brenner
rolle: ps
funktion: Projektsteuerung
farbe: "#146878"
---
### Kurzbeschreibung
Gründlich.
:::
`,
  'inhalte/rollen/gf.md': ROLLE('Geschäftsführung', '#6A4CA5'),
  'inhalte/rollen/bauherr.md': ROLLE('Bauherr', '#1D3258'),
  'inhalte/rollen/pl.md': ROLLE('Bauherren-PL', '#3866A8'),
  'inhalte/rollen/ps.md': ROLLE('Projektsteuerung', '#146878'),
  'inhalte/rollen/planung.md': ROLLE('Planung', '#D9822B'),
  'inhalte/rollen/controlling.md': ROLLE('Controlling', '#A8823C'),
  'inhalte/story/prolog/station.md': `---
id: prolog
art: prolog
titel: Übernahme
weiter: X1
---
::: schritt rolle
---
art: rollenwahl
titel: Rolle?
folgt: [gf, bauherr, ps, planung, controlling]
---
:::

::: schritt interessen
---
art: interessenwahl
titel: Interessen?
---
::: interesse kosten
---
titel: Kosten
---
:::
:::
`,
  'inhalte/story/X1/station.md': `---
id: X1
welt: A
monat: 5
titel: Kosten +8 %
lph: 5
whitepaper-bezug: [k2.4-p2]
status-start:
  entscheidungsfaehigkeit: 2
  kostenunsicherheit: hoch
  offene-risiken: 7
  ungeklaerte-entscheidungen: 3
  terminrisiko: mittel
weiter:
  - ziel: V
    wenn: [wahl X1 = A|B, rolle = pl]
  - V
partner: Y1
---

::: schritt einstieg
---
titel: Montag, 08:30 Uhr.
kurz: Einstieg
---
::: mail
---
von: brenner
betreff: Kostenprognose
zeit: "08:12"
---
„+8 %, Ursache unklar.“ <b>fett?</b>
:::

::: notiz
---
farbe: gelb
---
v3 oder v4??
:::
:::

::: schritt lage
---
art: lage
titel: Was Sie wissen
---
::: bekannt
- Zwei [[Mandat|Mandate]].
:::

::: unbekannt
- Ursache {#ursache}
:::

::: zeitsprung info
---
knopf: Anfordern
status:
  terminrisiko: hoch
loest:
  ursache: jetzt bekannt
---
Zwei Wochen später.
:::
:::

::: schritt entscheidung
---
art: entscheidung
titel: Was tun Sie?
---
:::

::: schritt konsequenz
---
art: konsequenz
titel: Folgen
---
:::

::: ebenen
::: ebene 1
---
titel: Kernaussage
---
Kurz.
:::
::: ebene 4
---
titel: Nachweis
---
::: zitat k2.4-p2
Berichterstattung erzeugt Information. Führung entsteht erst, wenn Information mit Mandat verbunden wird.
:::
:::
:::
`,
  'inhalte/story/X1/pl.md': `---
station: X1
rolle: pl
frage: Was tun Sie?
---
::: option B
---
titel: Vorlage verlangen
kurz: Vorlage
status:
  terminrisiko: "+1"
---
### Konsequenz
Ein Bericht.
### Was fehlt
Ein Standard.
### Neues Risiko
Vertagung.
### Governance-Frage
[[Entscheidungsreife]]: Was gehört hinein?
:::

::: option A
---
titel: Weiterarbeiten
kurz: Weiterarbeiten
status: keine
---
### Konsequenz
Es läuft weiter.
### Was fehlt
Ein Mandat.
### Neues Risiko
Schleichend.
### Governance-Frage
[[MVG]]? [[zitat:k2.4-p1|Mehr Berichte helfen manchmal.]]
:::

::: nachsatz
Die Geschichte merkt sich Ihre Wahl.
:::

::: regie
### Notiz
Nicht bewerten.
### Leitfragen
- Welche Zahl gilt?
- Wer entscheidet?
:::
`,
  'inhalte/story/V/station.md': `---
id: V
art: vergleich
titel: A gegen B
vergleich: {a: X1, b: Y1}
schaltet-frei: [welt-b]
weiter: Y1
---
::: schritt regler
---
art: vergleich
titel: Regler
---
::: kennzahl
---
a: 2
b: 1
---
Datenstände
:::
:::
`,
  'inhalte/story/Y1/station.md': `---
id: Y1
welt: B
titel: Kosten +8 %
status-start:
  entscheidungsfaehigkeit: 4
  kostenunsicherheit: mittel
  offene-risiken: 7 (1 neu bewertet)
  ungeklaerte-entscheidungen: 1
  terminrisiko: mittel
partner: X1
ende: ja
---
::: schritt signal
---
titel: Signal
---
Das Signal hat eine Nummer.
:::

::: schritt rueckbezug
---
art: rueckbezug
titel: Rückbezug
---
:::
`,
  'inhalte/story/Y1/pl.md': `---
station: Y1
rolle: pl
rueckbezug-auf: X1
---
::: rueckbezug A
Damals: ‚Weiterarbeiten‘.
:::
::: rueckbezug B
Damals: ‚Vorlage‘.
:::
::: rueckbezug ohne
Ohne Wahl.
:::
`,
  'inhalte/theorie/k02-ausgangslage.md': `---
kapitel: 2
titel: Ausgangslage
story: [X1]
deckt: [k2-p1]
---
::: kernaussage
Berichte sind nicht Führung; ein [[Mandat]] ist mehr als ein [[Mandat|Auftrag]].
:::

::: original k2.4-p1..k2.4-p2
:::
`,
  'inhalte/einwaende.md': `::: einwand berichte
---
stationen: [X1]
---
### Einwand
Wir berichten doch schon.
### Antwort
Das reicht nicht.

::: zitat k2.4-p1
Mehr Berichte helfen manchmal.
:::
:::
`,
  'inhalte/abdeckung.yaml': 'k2.4-l1:\n  theorie: k02\n  story: X1\nk2.4-p2:\n  story: X1\n',
};

test('feldName: Überschriften und Schlüssel werden zu camelCase in ASCII-Umschrift', () => {
  assert.equal(feldName('Was fehlt'), 'wasFehlt');
  assert.equal(feldName('Governance-Frage'), 'governanceFrage');
  assert.equal(feldName('Rückmeldung'), 'rueckmeldung');
  assert.equal(feldName('status-start'), 'statusStart');
  assert.equal(feldName('Nicht delegierbar'), 'nichtDelegierbar');
});

test('Beispiel → erwartetes JSON (Auszüge exakt), fehlerfrei, deterministisch, Schlüssel sortiert', async () => {
  const w = neueWurzel(BEISPIEL);
  const ziel = path.join(w, 'aus', 'inhalte.json');
  const erg = await kompiliere({ pruefe: true, wurzel: w, ziel });
  assert.deepEqual(erg.fehler, []);
  assert.deepEqual(erg.warnungen, []);
  const i = erg.inhalte as Inhalte;

  assert.deepEqual(i.stationsFolge, ['prolog', 'X1', 'V', 'Y1']);
  assert.equal(i.start, 'prolog');
  assert.deepEqual(i.rollenFolge, ['gf', 'bauherr', 'pl', 'ps', 'planung', 'controlling']);
  assert.deepEqual(Object.values(i.rollen).filter((r) => r.spielbar).map((r) => r.id), ['pl']);
  assert.deepEqual(i.interessen, [{ id: 'kosten', titel: 'Kosten', html: '' }]);
  assert.equal(i.fall?.projektbasisMio, 10.5);

  const x1 = i.stationen['X1'];
  assert.ok(x1 !== undefined);
  assert.deepEqual(x1.weiter, [
    { ziel: 'V', wenn: { art: 'alle', nicht: false, bedingungen: [
      { art: 'wahl', entscheidung: 'X1', optionen: ['A', 'B'], nicht: false },
      { art: 'rolle', rollen: ['pl'], nicht: false },
    ] } },
    { ziel: 'V', wenn: null },
  ]);
  assert.deepEqual(x1.statusStart?.[2], { schluessel: 'offeneRisiken', art: 'setze', wert: 7, hinweis: null });
  assert.deepEqual(x1.schritte[0], {
    id: 'einstieg', art: 'text', titel: 'Montag, 08:30 Uhr.', kurz: 'Einstieg', gruppe: null, uhr: null, kopf: {}, felder: {},
    bloecke: [
      { art: 'mail', kennungen: [], id: null, kopf: { von: 'brenner', betreff: 'Kostenprognose', zeit: '08:12' }, liste: null, kinder: [],
        felder: { text: '<p>„+8 %, Ursache unklar.“ &lt;b&gt;fett?&lt;/b&gt;</p>' } },
      { art: 'notiz', kennungen: [], id: null, kopf: { farbe: 'gelb' }, liste: null, kinder: [], felder: { text: '<p>v3 oder v4??</p>' } },
    ],
  });
  assert.deepEqual(x1.schritte[1]?.bloecke[0]?.liste, [
    { id: null, stand: null, html: 'Zwei <span class="mvg-glossar" data-glossar="g-mandat" data-begriff="Mandat">Mandate</span>.' },
  ]);
  assert.deepEqual(x1.infos, [{ id: 'info', schritt: 'lage', wirkung: [{ schluessel: 'terminrisiko', art: 'setze', wert: 'hoch', hinweis: null }] }]);

  assert.deepEqual(x1.szenen['pl']?.entscheidung, {
    id: 'X1/pl',
    frage: 'Was tun Sie?',
    nachsatz: '<p>Die Geschichte merkt sich Ihre Wahl.</p>',
    optionen: [
      { id: 'A', titel: 'Weiterarbeiten', kurz: 'Weiterarbeiten', symbol: null, wirkung: [], felder: {
        konsequenz: '<p>Es läuft weiter.</p>', wasFehlt: '<p>Ein Mandat.</p>', neuesRisiko: '<p>Schleichend.</p>',
        governanceFrage: '<p><span class="mvg-glossar" data-glossar="g-mvg" data-begriff="Minimum Viable Governance (MVG)">MVG</span>? <q class="mvg-zitat" data-absatz="k2.4-p1">Mehr Berichte helfen manchmal.</q></p>',
      } },
      { id: 'B', titel: 'Vorlage verlangen', kurz: 'Vorlage', symbol: null, wirkung: [{ schluessel: 'terminrisiko', art: 'aendere', wert: 1, hinweis: null }], felder: {
        konsequenz: '<p>Ein Bericht.</p>', wasFehlt: '<p>Ein Standard.</p>', neuesRisiko: '<p>Vertagung.</p>',
        governanceFrage: '<p><span class="mvg-glossar" data-glossar="g-entscheidungsreife" data-begriff="Entscheidungs­reife">Entscheidungsreife</span>: Was gehört hinein?</p>',
      } },
    ],
  });
  const zitat = x1.ebenen?.[1]?.bloecke[0];
  assert.deepEqual(zitat?.kopf, { quelle: 'Whitepaper V1.2, Kap. 2.4', vollstaendig: false });
  assert.equal(zitat?.felder['text'], '<blockquote class="mvg-zitat" data-absatz="k2.4-p2"><p>Berichterstattung erzeugt Information. Führung entsteht erst, wenn Information mit Mandat verbunden wird.</p></blockquote>');

  assert.deepEqual(i.stationen['Y1']?.szenen['pl']?.rueckbezug, {
    auf: 'X1/pl', texte: { A: '<p>Damals: ‚Weiterarbeiten‘.</p>', B: '<p>Damals: ‚Vorlage‘.</p>' }, ohne: '<p>Ohne Wahl.</p>',
  });
  assert.deepEqual(i.stationen['Y1']?.statusStart?.[2], { schluessel: 'offeneRisiken', art: 'setze', wert: 7, hinweis: '1 neu bewertet' });
  assert.deepEqual(i.stationen['V']?.schaltetFrei, ['weltB']);

  // Regie-Material steht getrennt, nicht in der Station
  assert.deepEqual(i.regie, { 'X1/pl': { notiz: '<p>Nicht bewerten.</p>', leitfragen: ['Welche Zahl gilt?', 'Wer entscheidet?'] } });
  assert.equal(JSON.stringify(i.stationen).includes('Nicht bewerten'), false);

  const k02 = i.theorie['k02'];
  assert.equal(k02?.bloecke[1]?.felder['text'], '<p class="mvg-original" data-absatz="k2.4-p1">Mehr Berichte helfen manchmal.</p>\n'
    + '<p class="mvg-original" data-absatz="k2.4-p2">Berichterstattung erzeugt Information. Führung entsteht erst, wenn Information mit Mandat verbunden wird. Ein Ampelbericht ohne Entscheidungsfrage bleibt Beobachtung.</p>');
  assert.deepEqual(k02?.bloecke[1]?.kopf['absaetze'], ['k2.4-p1', 'k2.4-p2']);
  assert.deepEqual(k02?.deckt, ['k2-p1']);
  assert.deepEqual(i.abdeckung, {
    gesamt: 4, zugeordnet: 4, anteil: 1,
    ziele: {
      'k2-p1': { theorie: ['k02'], story: [] },
      'k2.4-l1': { theorie: ['k02'], story: ['X1'] },
      'k2.4-p1': { theorie: ['k02'], story: [] },
      'k2.4-p2': { theorie: ['k02'], story: ['X1'] },
    },
  });
  assert.deepEqual(i.glossar['g-mandat'], { id: 'g-mandat', begriff: 'Mandat', definition: 'Klar zugewiesene Entscheidungsbefugnis.', vorkommen: { stationen: ['X1'], kapitel: [2] } }, 'Kapitel-Vorkommen einmal, auch bei zwei Bezügen');
  assert.equal(i.einwaende[0]?.id, 'berichte');

  // Datei = stabiles JSON; zweiter Lauf byteweise gleich; Schlüssel sortiert
  const text1 = readFileSync(ziel, 'utf8');
  assert.equal(text1, stabilesJson(i));
  await kompiliere({ pruefe: true, wurzel: w, ziel });
  assert.equal(readFileSync(ziel, 'utf8'), text1);
  const oben = Object.keys(JSON.parse(text1) as Record<string, unknown>);
  assert.deepEqual(oben, [...oben].sort());
  assert.ok(text1.indexOf('"felder"') < text1.indexOf('"id": "X1/pl"'), 'auch verschachtelte Schlüssel sortiert');
});

/** Ersetzt in einer Beispieldatei genau eine Stelle (bricht laut, wenn sie fehlt). */
function veraendere(dateien: Record<string, string>, rel: string, alt: string, neu: string): Record<string, string> {
  const text = dateien[rel];
  if (text === undefined || !text.includes(alt)) throw new Error(`${rel}: „${alt}“ nicht gefunden`);
  return { ...dateien, [rel]: text.replace(alt, neu) };
}

test('Kaputtes Beispiel: jede Verletzung wird mit Ort gemeldet', async () => {
  let d = { ...BEISPIEL };
  d = veraendere(d, 'inhalte/story/X1/pl.md', '### Neues Risiko\nVertagung.\n', '');
  d = veraendere(d, 'inhalte/story/X1/pl.md', 'terminrisiko: "+1"', 'terminrisiko: kritisch');
  d = veraendere(d, 'inhalte/story/X1/station.md', 'von: brenner', 'von: niemand');
  d = veraendere(d, 'inhalte/story/X1/station.md', '::: notiz', '::: memo');
  d = veraendere(d, 'inhalte/story/X1/station.md', 'Zwei [[Mandat|Mandate]].', 'Zwei [[Gibtsnicht]].');
  d = veraendere(d, 'inhalte/story/Y1/pl.md', "::: rueckbezug B\nDamals: ‚Vorlage‘.\n:::\n", '');
  d = veraendere(d, 'inhalte/rollen/pl.md', 'farbe: "#3866A8"', 'farbe: #3866A8');
  d = veraendere(d, 'inhalte/story/V/station.md', 'schaltet-frei: [welt-b]\n', '');
  d = veraendere(d, 'inhalte/story/Y1/station.md', '  ungeklaerte-entscheidungen: 1\n', '');
  d['inhalte/story/Z9/station.md'] = '---\nid: Z9\ntitel: Insel\nende: ja\n---\n::: schritt a\n---\ntitel: A\n---\n:::\n';
  d['inhalte/story/Z8/station.md'] = '---\nid: Z8\ntitel: Sackgasse\n---\n::: schritt a\n---\ntitel: A\n---\n:::\n';
  const w = neueWurzel(d);
  const { fehler } = await kompiliere({ pruefe: true, wurzel: w, ziel: null });
  const erwartet: RegExp[] = [
    /^inhalte\/story\/X1\/pl\.md:\d+: „option B“: Feld „neuesRisiko“ fehlt/u,
    /^inhalte\/story\/X1\/pl\.md:\d+: „status“: terminrisiko: „kritisch“ ist keine Stufe/u,
    /^inhalte\/story\/X1\/station\.md:\d+: Figur „niemand“ steht nicht in inhalte\/fall\.md/u,
    /^inhalte\/story\/X1\/station\.md:\d+: unbekannter Container „memo“/u,
    /^inhalte\/story\/X1\/station\.md:\d+: Glossarbegriff „Gibtsnicht“ steht nicht im Glossar/u,
    /^graph: Station Y1\/pl: Rückbezug für Option B von X1\/pl fehlt/u,
    /^inhalte\/rollen\/pl\.md:1: „farbe“ ist leer – Farben in Anführungszeichen setzen/u,
    /^graph: Station Y1 \(Welt B\) ist erreichbar, bevor Welt B freigeschaltet wird/u,
    /^inhalte\/story\/Y1\/station\.md:1: „status-start“ muss alle fünf Werte setzen/u,
    /^graph: Station Z9 ist vom Start \(prolog\) nicht erreichbar/u,
    /^inhalte\/story\/Z8\/station\.md:1: weder „weiter“ noch „ende: ja“/u,
    /^graph: Station Z8 ist eine Sackgasse/u,
  ];
  for (const e of erwartet) assert.ok(fehler.some((f) => e.test(f)), `erwartet ${e}\nbekommen:\n${fehler.join('\n')}`);
});

test('Formfehler brechen auch ohne --pruefe (Bau), Prüffehler nur mit --pruefe', async () => {
  const offen = veraendere(BEISPIEL, 'inhalte/story/V/station.md', 'Datenstände\n:::\n:::\n', 'Datenstände\n:::\n');
  const w1 = neueWurzel(offen);
  const ohne = await kompiliere({ pruefe: false, wurzel: w1, ziel: null });
  assert.ok(ohne.fehler.some((f) => /V\/station\.md:\d+: Container „schritt“ wird nicht mit „:::“ geschlossen/u.test(f)), ohne.fehler.join('\n'));
  const yaml = veraendere(BEISPIEL, 'inhalte/story/X1/station.md', 'lph: 5', 'lph: [5');
  const w2 = neueWurzel(yaml);
  assert.ok((await kompiliere({ pruefe: false, wurzel: w2, ziel: null })).fehler.some((f) => /X1\/station\.md:\d+: Kopfdaten \(YAML\) unlesbar/u.test(f)));
  const pruef = veraendere(BEISPIEL, 'inhalte/story/X1/station.md', 'von: brenner', 'von: niemand');
  const w3 = neueWurzel(pruef);
  assert.deepEqual((await kompiliere({ pruefe: false, wurzel: w3, ziel: null })).fehler, []);
  assert.equal((await kompiliere({ pruefe: true, wurzel: w3, ziel: null })).fehler.length, 1);
});

test('Mutanten-Probe (Beispiel): ein verfälschtes Zitat, eine erfundene ID und ein Platzhalter werden erkannt', async () => {
  const faelle: [string, string, RegExp][] = [
    ['Berichterstattung erzeugt Information. Führung', 'Berichterstattung erzeugt Informationen. Führung', /Zitat nicht wortgleich mit k2\.4-p2: weicht nach 37 Zeichen ab/u],
    ['::: zitat k2.4-p2', '::: zitat k2.4-p9', /Zitat: Absatz-ID k2\.4-p9 gibt es im Whitepaper nicht/u],
    ['::: zitat k2.4-p2', '::: zitat k2.4-p?', /Zitat: „k2\.4-p\?“ ist keine Absatz-ID/u],
  ];
  for (const [alt, neu, erwartet] of faelle) {
    const w = neueWurzel(veraendere(BEISPIEL, 'inhalte/story/X1/station.md', alt, neu));
    const { fehler } = await kompiliere({ pruefe: true, wurzel: w, ziel: null });
    assert.ok(fehler.some((f) => erwartet.test(f)), `${neu}: ${fehler.join('\n')}`);
  }
  const inline = neueWurzel(veraendere(BEISPIEL, 'inhalte/story/X1/pl.md', '|Mehr Berichte helfen manchmal.]]', '|Mehr Berichte helfen immer.]]'));
  assert.ok((await kompiliere({ pruefe: true, wurzel: inline, ziel: null })).fehler.some((f) => /X1\/pl\.md:\d+: Zitat nicht wortgleich/u.test(f)));
  // Auslassung und geschütztes Leerzeichen sind erlaubt, vertauschte Reihenfolge nicht
  const auslassung = neueWurzel(veraendere(BEISPIEL, 'inhalte/story/X1/station.md',
    'Berichterstattung erzeugt Information. Führung entsteht erst, wenn Information mit Mandat verbunden wird.',
    'Berichterstattung erzeugt Information. […] Ein Ampelbericht ohne Entscheidungsfrage bleibt Beobachtung.'));
  assert.deepEqual((await kompiliere({ pruefe: true, wurzel: auslassung, ziel: null })).fehler, []);
  const vertauscht = neueWurzel(veraendere(BEISPIEL, 'inhalte/story/X1/station.md',
    'Berichterstattung erzeugt Information. Führung entsteht erst, wenn Information mit Mandat verbunden wird.',
    'Ein Ampelbericht ohne Entscheidungsfrage bleibt Beobachtung. […] Berichterstattung erzeugt Information.'));
  assert.ok((await kompiliere({ pruefe: true, wurzel: vertauscht, ziel: null })).fehler.some((f) => /nicht wortgleich/u.test(f)));
});

test('Abdeckung (P1.1): Lücke, fremdes Kapitel und unbekannte Seite sind Fehler; geplante Kapitelseite gilt', async () => {
  const pruefe = async (yaml: string) => (await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/abdeckung.yaml': yaml }), ziel: null })).fehler;
  assert.ok((await pruefe('k2.4-l1:\n  story: X1\n')).some((f) => /abdeckung\.yaml: Theorie-Abdeckung 3 von 4 Absätzen \(75,0 %\) – Pflicht 100 % \(P1\.1\); ohne Seite: k2\.4-l1$/u.test(f)));
  // k03 ist keine Lernseite, aber als Kapitel des Beispiels auch nicht geplant (das Beispiel hat nur Kapitel 2)
  assert.ok((await pruefe('k2.4-l1:\n  theorie: k03\n')).some((f) => /k2\.4-l1: Theorie-Seite „k03“ gibt es nicht/u.test(f)));
  const fremd = neueWurzel({ ...BEISPIEL, 'inhalte/theorie/k05-test.md': '---\nkapitel: 5\ntitel: Test\n---\nText.\n', 'inhalte/abdeckung.yaml': 'k2.4-l1:\n  theorie: k05\n' });
  assert.ok((await kompiliere({ pruefe: true, wurzel: fremd, ziel: null })).fehler.some((f) => /k2\.4-l1: steht nicht auf der Seite seines Kapitels \(k02\)/u.test(f)));
  // geplante Kapitelseite: k02 ohne Lernseite
  const ohneSeite: Record<string, string> = { ...BEISPIEL, 'inhalte/abdeckung.yaml': 'k2-p1:\n  theorie: k02\nk2.4-p1:\n  theorie: k02\nk2.4-p2:\n  theorie: k02\n  story: X1\nk2.4-l1:\n  theorie: k02\n' };
  for (const k of Object.keys(ohneSeite)) if (k.startsWith('inhalte/theorie/')) delete ohneSeite[k];
  const geplant = await kompiliere({ pruefe: true, wurzel: neueWurzel(ohneSeite), ziel: null });
  assert.deepEqual(geplant.fehler.filter((f) => /abdeckung/u.test(f)), []);
  assert.equal((geplant.inhalte as Inhalte).abdeckung.anteil, 1);
  // jeder „whitepaper-bezug“ einer Station steht als Story-Bezug in der Karte (L-20; bis P5.10 im Entwurfswerkzeug geprüft)
  const ohneBezug = await pruefe('k2.4-l1:\n  theorie: k02\n  story: X1\n');
  assert.ok(ohneBezug.some((f) => /^inhalte\/abdeckung\.yaml: k2\.4-p2 ohne Story-Bezug auf X1 \(steht in dessen whitepaper-bezug\)$/u.test(f)), ohneBezug.join('\n'));
});

test('Fall-Bibel (P1.2): Zeitachse Monat → LPH wird gegen die Stationen geprüft', async () => {
  const mitAchse = (achse: string) => veraendere(BEISPIEL, 'inhalte/fall.md', 'hinweis: Fiktiver Fall.\n', `hinweis: Fiktiver Fall.\nmonat-0: 2025-12\nlph-stand:\n${achse}`);
  const gut = await kompiliere({ pruefe: true, wurzel: neueWurzel(mitAchse('  "5": "5"\n')), ziel: null });
  assert.deepEqual(gut.fehler, []);
  assert.deepEqual((gut.inhalte as Inhalte).fall?.lphStand, { '5': 5 });
  assert.equal((gut.inhalte as Inhalte).fall?.monat0, '2025-12');
  const falsch = await kompiliere({ pruefe: true, wurzel: neueWurzel(mitAchse('  "5": "4"\n')), ziel: null });
  assert.ok(falsch.fehler.some((f) => /X1\/station\.md: LPH 5 passt nicht zu Monat 5 – laut Fall-Bibel LPH 4/u.test(f)), falsch.fehler.join('\n'));
  const luecke = await kompiliere({ pruefe: true, wurzel: neueWurzel(mitAchse('  "4": "5"\n')), ziel: null });
  assert.ok(luecke.fehler.some((f) => /X1\/station\.md: Monat 5 fehlt in der Zeitachse/u.test(f)), luecke.fehler.join('\n'));
  const kaputt = await kompiliere({ pruefe: true, wurzel: neueWurzel(mitAchse('  "13": "5"\n')), ziel: null });
  assert.ok(kaputt.fehler.some((f) => /„lph-stand“: „13: 5“ – erwartet Monat 0–12 und LPH 0–9/u.test(f)), kaputt.fehler.join('\n'));
});

test('Requisiten Protokoll und Aktenstapel (P3.1): Form, Pflichtfelder, Figurverweis', async () => {
  const mit = (bloecke: string) => veraendere(BEISPIEL, 'inhalte/story/X1/station.md', '„+8 %, Ursache unklar.“ <b>fett?</b>\n:::\n', `„+8 %, Ursache unklar.“ <b>fett?</b>\n:::\n${bloecke}`);
  const gut = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit('::: protokoll\n---\ntitel: Protokoll Jour fixe\ndatum: Di, 12.05.\nvon: brenner\n---\n- Kosten: wird geklärt\n:::\n::: akten\n---\nbeschriftung: Statusberichte\nanzahl: 7\n---\n:::\n')), ziel: null });
  assert.deepEqual(gut.fehler, []);
  const bl = (gut.inhalte as Inhalte).stationen['X1']?.schritte[0]?.bloecke ?? [];
  assert.deepEqual(bl.map((b) => b.art).slice(0, 3), ['mail', 'protokoll', 'akten']);
  const ohneTitel = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit('::: protokoll\n---\ndatum: Di\n---\n- x\n:::\n')), ziel: null });
  assert.ok(ohneTitel.fehler.some((f) => /titel/u.test(f)), ohneTitel.fehler.join('\n'));
  const zuViele = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit('::: akten\n---\nbeschriftung: A\nanzahl: 13\n---\n:::\n')), ziel: null });
  assert.ok(zuViele.fehler.some((f) => /anzahl/u.test(f)), zuViele.fehler.join('\n'));
  const fremd = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit('::: protokoll\n---\ntitel: P\nvon: niemand\n---\n- x\n:::\n')), ziel: null });
  assert.ok(fremd.fehler.some((f) => /Figur „niemand“/u.test(f)), fremd.fehler.join('\n'));
});

test('RACI mit Mandat (P5.1): Zuordnung je Rolle, unbekannte Rolle und doppelte Buchstaben sind Fehler', async () => {
  const mit = (bloecke: string) => veraendere(BEISPIEL, 'inhalte/story/X1/station.md', '„+8 %, Ursache unklar.“ <b>fett?</b>\n:::\n', `„+8 %, Ursache unklar.“ <b>fett?</b>\n:::\n${bloecke}`);
  const zeile = (r: string) => `::: raci\n---\nzeilen:\n  - id: mensa\n    titel: Mensa\n    A: bauherr\n    R: [${r}]\n    C: [planung]\n    mandat: Änderungsgremium\n---\n:::\n`;
  const gut = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit(zeile('pl, controlling'))), ziel: null });
  assert.deepEqual(gut.fehler, []);
  const b = (gut.inhalte as Inhalte).stationen['X1']?.schritte[0]?.bloecke.find((x) => x.art === 'raci');
  assert.deepEqual(b?.kopf['zeilen'], [{ id: 'mensa', titel: 'Mensa', zuordnung: { bauherr: 'A', pl: 'R', controlling: 'R', planung: 'C' }, mandat: 'Änderungsgremium' }]);
  const fremd = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit(zeile('pmo'))), ziel: null });
  assert.ok(fremd.fehler.some((f) => /Rolle „pmo“ gibt es nicht/u.test(f)), fremd.fehler.join('\n'));
  const doppelt = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit(zeile('bauherr'))), ziel: null });
  assert.ok(doppelt.fehler.some((f) => /zwei Buchstaben/u.test(f)), doppelt.fehler.join('\n'));
});

test('P5.9 (T9): Tafel „hervor“ außerhalb der Zeilen ist ein Fehler; Vorlage ohne Kennung und Gliedart „problem“ sind erlaubt', async () => {
  const mit = (bloecke: string) => veraendere(BEISPIEL, 'inhalte/story/X1/station.md', '„+8 %, Ursache unklar.“ <b>fett?</b>\n:::\n', `„+8 %, Ursache unklar.“ <b>fett?</b>\n:::\n${bloecke}`);
  // eigene Whitepaper-Kopie mit einer Tabelle (die Vorgabe hat keine)
  const wp = JSON.parse(JSON.stringify(WHITEPAPER));
  wp.kapitel[0].abschnitte[0].bloecke.push({ id: 'k2.4-t1', art: 'tabelle', text: 'A | B\nx | y', kopf: ['A', 'B'], zeilen: [['x', 'y'], ['u', 'v']] });
  const tafel = (hervor: string) => mit(`::: tafel k2.4-t1\n---\nform: karten\nhervor: [${hervor}]\n---\n:::\n`);
  const gut = await kompiliere({ pruefe: false, wurzel: neueWurzel(tafel('2'), wp), ziel: null });
  assert.deepEqual(gut.fehler, []);
  assert.deepEqual((gut.inhalte as Inhalte).stationen['X1']?.schritte[0]?.bloecke.find((b) => b.art === 'tafel')?.kopf['hervor'], [2]);
  const daneben = await kompiliere({ pruefe: true, wurzel: neueWurzel(tafel('3'), wp), ziel: null });
  assert.ok(daneben.fehler.some((f) => /hervor: 3/u.test(f)), daneben.fehler.join('\n'));
  const vorlage = await kompiliere({ pruefe: false, wurzel: neueWurzel(mit('::: vorlage\n---\ntitel: Vorlage zur Freigabe\n---\n### Frage\nFreigeben?\n\n### Checkliste\n- [ ] Punkt\n:::\n')), ziel: null });
  assert.deepEqual(vorlage.fehler, [], 'Vorlage ohne Kennung (L-40)');
  const problem = await kompiliere({ pruefe: false, wurzel: neueWurzel(mit('::: kette\n::: glied PRB-004\n---\nart: problem\n---\n### Titel\nProblem\n:::\n:::\n')), ziel: null });
  assert.deepEqual(problem.fehler, [], 'Gliedart problem (L-38)');
});

test('Startseite (inhalte/start.md): Leitsatz wörtlich mit Absatz-ID geprüft, These als Inline-HTML', async () => {
  const start = (titel: string) => `---\nkicker: Minimum Viable Governance\ntitel: ${titel}\ntitel-quelle: k2.4-p2\n---\n\nEine **These**.\n`;
  const gut = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/start.md': start('Berichterstattung erzeugt Information.') }), ziel: null });
  assert.deepEqual(gut.fehler, []);
  assert.deepEqual((gut.inhalte as Inhalte).startseite, { kicker: 'Minimum Viable Governance', titel: 'Berichterstattung erzeugt Information.', titelQuelle: 'k2.4-p2', these: 'Eine <strong>These</strong>.' });
  const falsch = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/start.md': start('Berichte erzeugen Information.') }), ziel: null });
  assert.ok(falsch.fehler.some((f) => /^inhalte\/start\.md:1: Zitat nicht wortgleich/u.test(f)), falsch.fehler.join('\n'));
  assert.equal(((await kompiliere({ pruefe: true, wurzel: neueWurzel(BEISPIEL), ziel: null })).inhalte as Inhalte).startseite, null);
});

test('Begriffe im fertigen Ergebnis: auch Whitepaper-Texte (Glossar) werden geprüft, nur mit --pruefe', async () => {
  const alt = structuredClone(WHITEPAPER);
  alt.glossar.push({ id: 'g-alt', begriff: 'Quality Gate', definition: 'Ein Change Board entscheidet über den Scope.' });
  const w = neueWurzel(BEISPIEL, alt);
  const { fehler } = await kompiliere({ pruefe: true, wurzel: w, ziel: null });
  const begriffe = fehler.filter((f) => f.startsWith('begriffe: src/generiert/inhalte.json:'));
  assert.deepEqual(begriffe.map((f) => /„([^“]+)“/u.exec(f)?.[1]).sort(), ['Change Board', 'Gate', 'Scope']);
  assert.deepEqual((await kompiliere({ pruefe: false, wurzel: w, ziel: null })).fehler, [], 'der Bau bricht daran nicht');
});

test('Ohne whitepaper.json: Zitate und Glossar nur Warnung, kein Fehler', async () => {
  const w = neueWurzel(BEISPIEL, null);
  const { fehler, warnungen, inhalte } = await kompiliere({ pruefe: true, wurzel: w, ziel: null });
  assert.deepEqual(fehler, []);
  assert.ok(warnungen.some((x) => /whitepaper\.json fehlt – Zitate nicht auf Wortgleichheit geprüft/u.test(x)));
  assert.ok(warnungen.some((x) => /Glossarbezüge \(\[\[…\]\]\) ungeprüft/u.test(x)));
  assert.equal((inhalte as Inhalte).whitepaper.fassung, null);
  const platzhalter = neueWurzel(veraendere(BEISPIEL, 'inhalte/story/X1/station.md', '::: zitat k2.4-p2', '::: zitat k2.4-p?'), null);
  assert.ok((await kompiliere({ pruefe: true, wurzel: platzhalter, ziel: null })).fehler.some((f) => /keine Absatz-ID/u.test(f)), 'ein Platzhalter fällt auch ohne Quelle auf');
});

const ECHT_WP = path.join(WURZEL, 'quellen', 'whitepaper', 'v1.2', 'whitepaper.json');

test('Echte Inhalte: fehlerfrei; Mutanten-Probe am Zitat in B3 (Ebene 4, Kap. 2.4)', { skip: existsSync(ECHT_WP) ? false : 'whitepaper.json fehlt' }, async () => {
  const echt = await kompiliere({ pruefe: true, ziel: null });
  assert.deepEqual(echt.fehler, []);
  const w = mkdtempSync(path.join(TMP, 'test-inhalte-echt-'));
  ORDNER.push(w);
  cpSync(path.join(WURZEL, 'inhalte'), path.join(w, 'inhalte'), { recursive: true });
  const b3 = path.join(w, 'inhalte', 'story', 'B3', 'station.md');
  const text = readFileSync(b3, 'utf8');
  assert.ok(text.includes('bleibt Beobachtung.'));
  writeFileSync(b3, text.replace('bleibt Beobachtung.', 'bleibt reine Beobachtung.'), 'utf8');
  const { fehler } = await kompiliere({ pruefe: true, wurzel: w, whitepaperPfad: ECHT_WP, ziel: null });
  assert.ok(fehler.some((f) => /^inhalte\/story\/B3\/station\.md:\d+: Zitat nicht wortgleich mit k2\.4-p2/u.test(f)), fehler.join('\n'));
});

test('Nachweis (E2, P7.3): nur an Stationen der Welt B, höchstens einmal je Station', async () => {
  const nw = '::: nachweis\n---\nmandat: M\nfreigabe: F\nkennung: ENT-001\ndatenstand: D\nnachweis: N\nbeschlusslage: B\n---\n:::\n';
  const mit = (welt: string, bloecke: string) => {
    const d = veraendere(BEISPIEL, 'inhalte/story/X1/station.md', 'welt: A\n', `welt: ${welt}\n`);
    return { ...d, 'inhalte/story/X1/station.md': `${d['inhalte/story/X1/station.md'] ?? ''}\n${bloecke}` };
  };
  const inA = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit('A', nw)), ziel: null });
  assert.ok(inA.fehler.some((f) => /„nachweis“ nur an Stationen der Welt B/u.test(f)), inA.fehler.join('\n'));
  const doppelt = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit('A', nw + nw)), ziel: null });
  assert.ok(doppelt.fehler.some((f) => /„nachweis“ doppelt/u.test(f)), doppelt.fehler.join('\n'));
});

test('Vorher/Nachher-Welten (P8.2): Beleg Pflicht, Welt A und Welt B Pflicht', async () => {
  const mit = (text: string) => ({ ...BEISPIEL, 'inhalte/welten.md': text });
  const gut = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit('::: welt rollen\n---\ntitel: Rollen\nstationen: [X1]\n---\n### Welt A\nOhne Mandat.\n\n### Welt B\nMit Mandat.\n\n::: zitat k2.4-p1\nMehr Berichte helfen manchmal.\n:::\n:::\n')), ziel: null });
  assert.deepEqual(gut.fehler, []);
  assert.deepEqual((gut.inhalte as Inhalte).welten.map((w) => [w.id, w.titel, w.stationen]), [['rollen', 'Rollen', ['X1']]]);
  const ohne = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit('::: welt rollen\n---\ntitel: Rollen\n---\n### Welt A\nA.\n\n### Welt B\nB.\n:::\n')), ziel: null });
  assert.ok(ohne.fehler.some((f) => /Welt rollen: Beleg fehlt/u.test(f)), ohne.fehler.join('\n'));
});

test('Vorher/Nachher-Welten: doppelte Kennung und fehlende Welt B sind Fehler; ohne Datei leer', async () => {
  const eins = '::: welt rollen\n---\ntitel: Rollen\n---\n### Welt A\nA.\n\n### Welt B\nB.\n\n::: zitat k2.4-p1\nMehr Berichte helfen manchmal.\n:::\n:::\n';
  const doppelt = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/welten.md': eins + '\n' + eins }), ziel: null });
  assert.ok(doppelt.fehler.some((f) => /Welt rollen doppelt/u.test(f)), doppelt.fehler.join('\n'));
  const ohneB = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/welten.md': eins.replace('### Welt B\nB.\n\n', '') }), ziel: null });
  assert.ok(ohneB.fehler.some((f) => /weltB/u.test(f) || /Welt B/u.test(f)), ohneB.fehler.join('\n'));
  const ohne = await kompiliere({ pruefe: true, wurzel: neueWurzel(BEISPIEL), ziel: null });
  assert.deepEqual((ohne.inhalte as Inhalte).welten, []);
});

test('Begriffs-Kompass (P10.5): Begriff muss im Beleg stehen, Glossar-Bezug, alte Wörter nur hier erlaubt', async () => {
  const kompass = (id: string, begriff: string, beleg: string, andere = '[Change-Board]'): string => `::: kompass ${id}\n---\nbegriff: ${begriff}\nandere: ${andere}\nbeleg: ${beleg}\n---\n:::\n\n`;
  const gut = neueWurzel({ ...BEISPIEL, 'inhalte/begriffs-kompass.md': kompass('mandat', 'Mandat', 'k2.4-p2') });
  const ok = await kompiliere({ pruefe: true, wurzel: gut, ziel: null });
  assert.deepEqual(ok.fehler, [], 'das alte Wort im Kompass ist kein Begriffe-Fund');
  assert.deepEqual(ok.inhalte.kompass, [{ id: 'mandat', begriff: 'Mandat', andere: ['Change-Board'], beleg: 'k2.4-p2', glossar: 'g-mandat', hinweis: null }]);
  const schlecht = neueWurzel({ ...BEISPIEL, 'inhalte/begriffs-kompass.md': kompass('a', 'Freigabe', 'k2.4-p2') + kompass('b', 'Mandat', 'k9.9-p9') + kompass('a', 'Mandat', 'k2.4-p2') + kompass('c', 'Mandat', 'k2.4-p2', '[]') + kompass('d', 'Bericht', 'k2.4-p2') });
  const { fehler } = await kompiliere({ pruefe: true, wurzel: schlecht, ziel: null });
  for (const e of [/Kompass a: „Freigabe“ steht nicht in k2\.4-p2/u, /Absatz-ID „k9\.9-p9“ gibt es im Whitepaper nicht/u, /Kompass-Eintrag a doppelt/u, /Kompass c: „andere“ ist leer|„andere“/u, /Kompass d: „Bericht“ steht nicht in k2\.4-p2/u]) {
    assert.ok(fehler.some((f) => e.test(f)), `erwartet ${e}\nbekommen:\n${fehler.join('\n')}`);
  }
});

test('Regie auf Lernseiten und Einwand-Kapitel (P9.5, L7): ohne kapitel, doppelt, unbekanntes Kapitel', async () => {
  const seite = (kopf: string): string => `---\n${kopf}titel: Ausgangslage\n---\n::: kernaussage\nText.\n:::\n\n::: regie\n### Notiz\nEins.\n:::\n\n::: regie\n### Notiz\nZwei.\n:::\n`;
  const d = {
    ...BEISPIEL,
    'inhalte/theorie/k02-ausgangslage.md': seite('kapitel: 2\n'),
    'inhalte/einwaende.md': (BEISPIEL['inhalte/einwaende.md'] ?? '').replace('stationen: [X1]', 'stationen: [X1]\nkapitel: ["2.4", "7.7"]'),
  };
  const { fehler } = await kompiliere({ pruefe: true, wurzel: neueWurzel(d), ziel: null });
  assert.ok(fehler.some((f) => /k02-ausgangslage\.md:\d+: zweiter Regie-Block zu Kapitel 2/u.test(f)), fehler.join('\n'));
  assert.ok(fehler.some((f) => /einwaende\.md:\d+: Einwand berichte: Kapitel „7\.7“ gibt es im Whitepaper nicht/u.test(f)), fehler.join('\n'));
  assert.ok(!fehler.some((f) => /Kapitel „2\.4“/u.test(f)));
  const ohne = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/theorie/k02-ausgangslage.md': seite('') }), ziel: null });
  assert.ok(ohne.fehler.some((f) => /Regie-Block ohne „kapitel:“ im Dateikopf/u.test(f)), ohne.fehler.join('\n'));
});

test('Wissenscheck (P11.6): mindestens zwei Antworten und ein wortgleicher Beleg', async () => {
  const seite = (inhalt: string): string => `---\nkapitel: 2\ntitel: Ausgangslage\n---\n::: kernaussage\nText.\n:::\n\n${inhalt}`;
  const gut = `::: wissenscheck berichte
### Frage
Reicht ein Ampelbericht?

### Erklärung
Berichterstattung erzeugt Information.

::: antwort a
---
titel: Nein
praefix: "Genau:"
---
Führung braucht mehr.
:::

::: antwort b
---
titel: Ja
praefix: "Nicht ganz:"
---
Er bleibt Beobachtung.
:::

::: zitat k2.4-p2
Berichterstattung erzeugt Information.
:::
:::
`;
  const ok = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/theorie/k02-ausgangslage.md': seite(gut) }), ziel: null });
  assert.deepEqual(ok.fehler.filter((f) => /Wissenscheck/u.test(f)), []);
  const wc = ok.inhalte.theorie['k02'].bloecke.find((b: { art: string }) => b.art === 'wissenscheck');
  assert.equal(wc?.kinder.filter((k: { art: string }) => k.art === 'antwort').length, 2);
  const eineAntwort = gut.replace(/::: antwort b[\s\S]*?:::\n\n/u, '');
  const ohneBeleg = gut.replace(/::: zitat k2\.4-p2\nBerichterstattung erzeugt Information\.\n:::\n/u, '');
  const f1 = (await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/theorie/k02-ausgangslage.md': seite(eineAntwort) }), ziel: null })).fehler;
  assert.ok(f1.some((f) => /Wissenscheck berichte: mindestens zwei Antworten/u.test(f)), f1.join('\n'));
  const f2 = (await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/theorie/k02-ausgangslage.md': seite(ohneBeleg) }), ziel: null })).fehler;
  assert.ok(f2.some((f) => /Wissenscheck berichte: Beleg fehlt/u.test(f)), f2.join('\n'));
});
