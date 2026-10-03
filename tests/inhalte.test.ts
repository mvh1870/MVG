/*
 * Inhaltswerkzeug (werkzeuge/inhalte.mjs, P0.5): Beispiel-Thema → erwartetes JSON, kaputtes Beispiel →
 * die richtigen Fehler, Mutanten-Probe (verfälschtes Zitat wird erkannt), echte Inhalte fehlerfrei.
 * Die Story (inhalte/geschichte/) prüft tests/geschichte.test.ts.
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

/** Das Beispiel: ein Thema der Theorie (Kapitel 2) mit allen Grundbausteinen, Startseite ohne, Abdeckungskarte. */
const BEISPIEL: Record<string, string> = {
  'inhalte/theorie/k02-ausgangslage.md': `---
kapitel: 2
titel: Ausgangslage
kurztitel: Lage
thema: ausgangslage
teil: 1
kurzsatz: Warum Berichte allein nicht führen.
symbol: frage
deckt: [k2-p1]
---
Zwei [[Mandat|Mandate]] und <b>fett?</b>

::: kernaussage
Berichte sind nicht Führung; ein [[Mandat]] ist mehr als ein [[Mandat|Auftrag]].
:::

::: abschnitt k2.4
---
titel: Warum Berichte nicht reichen
---
[[MVG]]? [[zitat:k2.4-p1|Mehr Berichte helfen manchmal.]]

::: merksatz
v3 oder v4??
:::
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

::: regie
### Notiz
Nicht bewerten.
### Leitfragen
- Welche Zahl gilt?
- Wer entscheidet?
:::
`,
  'inhalte/abdeckung.yaml': 'k2.4-l1:\n  theorie: k02\nk2.4-p1:\n  theorie: k02\nk2.4-p2:\n  theorie: k02\n',
};

const K02 = 'inhalte/theorie/k02-ausgangslage.md';
const ZITAT_P2 = 'Berichterstattung erzeugt Information. Führung entsteht erst, wenn Information mit Mandat verbunden wird.';

test('feldName: Überschriften und Schlüssel werden zu camelCase in ASCII-Umschrift', () => {
  assert.equal(feldName('Was fehlt'), 'wasFehlt');
  assert.equal(feldName('Governance-Frage'), 'governanceFrage');
  assert.equal(feldName('Rückmeldung'), 'rueckmeldung');
  assert.equal(feldName('titel-quelle'), 'titelQuelle');
  assert.equal(feldName('Nicht delegierbar'), 'nichtDelegierbar');
});

test('Beispiel → erwartetes JSON (Auszüge exakt), fehlerfrei, deterministisch, Schlüssel sortiert', async () => {
  const w = neueWurzel(BEISPIEL);
  const ziel = path.join(w, 'aus', 'inhalte.json');
  const erg = await kompiliere({ pruefe: true, wurzel: w, ziel });
  assert.deepEqual(erg.fehler, []);
  assert.deepEqual(erg.warnungen, []);
  const i = erg.inhalte as Inhalte;

  assert.deepEqual(Object.keys(i).sort(), ['abbildungen', 'abdeckung', 'geschichte', 'geschichteRegie', 'glossar', 'kompass', 'regie', 'startseite', 'theorie', 'version', 'werkzeuge']);
  assert.equal(i.startseite, null);
  assert.deepEqual(i.kompass, []);
  assert.deepEqual(i.abbildungen, []);

  const k02 = i.theorie['k02'];
  assert.ok(k02 !== undefined);
  assert.equal(k02.kapitel, 2);
  assert.equal(k02.thema, 'ausgangslage');
  assert.equal(k02.reihe, 2);
  assert.equal(k02.kurztitel, 'Lage');
  assert.equal(k02.nr, 1);
  assert.equal(k02.teil, 1);
  assert.equal(k02.kurzsatz, 'Warum Berichte allein nicht führen.');
  assert.equal(k02.symbol, 'frage');
  assert.equal(k02.quelle, K02);
  assert.equal(k02.einleitung, '<p>Zwei <span class="mvg-glossar" data-glossar="g-mandat" data-begriff="Mandat">Mandate</span> und &lt;b&gt;fett?&lt;/b&gt;</p>');
  assert.deepEqual(k02.bloecke.map((b) => b.art), ['kernaussage', 'abschnitt', 'ebenen']);
  assert.deepEqual(k02.bloecke[1], {
    art: 'abschnitt', kennungen: ['k2.4'], id: 'k2.4', kopf: { titel: 'Warum Berichte nicht reichen' }, liste: null,
    felder: { text: '<p><span class="mvg-glossar" data-glossar="g-mvg" data-begriff="Minimum Viable Governance (MVG)">MVG</span>? <q class="mvg-zitat" data-absatz="k2.4-p1">Mehr Berichte helfen manchmal.</q></p>' },
    kinder: [{ art: 'merksatz', kennungen: [], id: null, kopf: {}, liste: null, kinder: [], felder: { text: '<p>v3 oder v4??</p>' } }],
  });
  const ebenen = k02.bloecke[2]?.ebenen;
  assert.deepEqual(ebenen?.map((e) => [e.nr, e.titel]), [[1, 'Kernaussage'], [4, 'Nachweis']]);
  const zitat = ebenen?.[1]?.bloecke[0];
  assert.deepEqual(zitat?.kopf, { vollstaendig: false });
  assert.equal(zitat?.felder['text'], `<blockquote class="mvg-zitat" data-absatz="k2.4-p2"><p>${ZITAT_P2}</p></blockquote>`);
  assert.deepEqual(k02.deckt, ['k2-p1']);

  // Regie-Material steht getrennt, nicht im Thema
  assert.deepEqual(i.regie, { 'theorie/k2': { notiz: '<p>Nicht bewerten.</p>', leitfragen: ['Welche Zahl gilt?', 'Wer entscheidet?'] } });
  assert.equal(JSON.stringify(i.theorie).includes('Nicht bewerten'), false);

  assert.deepEqual(i.abdeckung, {
    gesamt: 4, zugeordnet: 4, anteil: 1,
    ziele: {
      'k2-p1': { theorie: ['k02'] },
      'k2.4-l1': { theorie: ['k02'] },
      'k2.4-p1': { theorie: ['k02'] },
      'k2.4-p2': { theorie: ['k02'] },
    },
  });
  assert.deepEqual(i.glossar['g-mandat'], { id: 'g-mandat', begriff: 'Mandat', definition: 'Klar zugewiesene Entscheidungsbefugnis.', vorkommen: { kapitel: [2] } }, 'Kapitel-Vorkommen einmal, auch bei mehreren Bezügen');
  assert.deepEqual(i.glossar['g-entscheidungsreife']?.vorkommen, { kapitel: [] });

  // Datei = stabiles JSON; zweiter Lauf byteweise gleich; Schlüssel sortiert
  const text1 = readFileSync(ziel, 'utf8');
  assert.equal(text1, stabilesJson(i));
  await kompiliere({ pruefe: true, wurzel: w, ziel });
  assert.equal(readFileSync(ziel, 'utf8'), text1);
  const oben = Object.keys(JSON.parse(text1) as Record<string, unknown>);
  assert.deepEqual(oben, [...oben].sort());
  assert.ok(text1.indexOf('"deckt"') < text1.indexOf('"einleitung"') && text1.indexOf('"einleitung"') < text1.indexOf('"thema"'), 'auch verschachtelte Schlüssel sortiert');
});

/** Ersetzt in einer Beispieldatei genau eine Stelle (bricht laut, wenn sie fehlt). */
function veraendere(dateien: Record<string, string>, rel: string, alt: string, neu: string): Record<string, string> {
  const text = dateien[rel];
  if (text === undefined || !text.includes(alt)) throw new Error(`${rel}: „${alt}“ nicht gefunden`);
  return { ...dateien, [rel]: text.replace(alt, neu) };
}

/** Hängt Bausteine an das Beispiel-Thema an. */
const mitBloecken = (bloecke: string, dateien: Record<string, string> = BEISPIEL): Record<string, string> => ({ ...dateien, [K02]: `${dateien[K02] ?? ''}\n${bloecke}` });

test('Kaputtes Beispiel: jede Verletzung wird mit Ort gemeldet', async () => {
  let d = { ...BEISPIEL };
  d = veraendere(d, K02, 'kurztitel: Lage\n', 'kurztitel: Lage\nstory: [X1]\n');
  d = veraendere(d, K02, '::: merksatz\nv3 oder v4??\n:::', '::: memo\nv3 oder v4??\n:::');
  d = veraendere(d, K02, 'Zwei [[Mandat|Mandate]]', 'Zwei [[Gibtsnicht]]');
  d = veraendere(d, K02, '::: kernaussage\nBerichte sind nicht Führung; ein [[Mandat]] ist mehr als ein [[Mandat|Auftrag]].\n:::', '::: kernaussage\n:::');
  d = veraendere(d, K02, '::: ebene 1\n', '::: ebene 5\n');
  d = mitBloecken('::: raci\n:::\n\n::: karten\n::: karte\n---\nsymbol: x\n---\nText.\n:::\n:::\n', d);
  d['inhalte/theorie/k03-test.md'] = '---\nkapitel: 4\ntitel: Falsch\n---\nText.\n';
  d['inhalte/theorie/k05-test.md'] = '---\ntitel: Ohne Kapitel\n---\nText.\n';
  d['inhalte/fremd.md'] = 'Irgendwas.\n';
  const w = neueWurzel(d);
  const { fehler, warnungen } = await kompiliere({ pruefe: true, wurzel: w, ziel: null });
  const erwartet: RegExp[] = [
    /^inhalte\/theorie\/k02-ausgangslage\.md:1: unbekannte Kopfdaten „story“/u,
    /^inhalte\/theorie\/k02-ausgangslage\.md:\d+: unbekannter Container „memo“/u,
    /^inhalte\/theorie\/k02-ausgangslage\.md:\d+: Glossarbegriff „Gibtsnicht“ steht nicht im Glossar/u,
    /^inhalte\/theorie\/k02-ausgangslage\.md:\d+: „kernaussage“: Feld „text“ fehlt oder ist leer/u,
    /^inhalte\/theorie\/k02-ausgangslage\.md:\d+: „ebene“: Kennung „5“ ist nicht erlaubt/u,
    /^inhalte\/theorie\/k02-ausgangslage\.md:\d+: unbekannter Container „raci“/u,
    /^inhalte\/theorie\/k02-ausgangslage\.md:\d+: Pflichtangabe „titel“ fehlt/u,
    /^inhalte\/theorie\/k03-test\.md:1: kapitel 4 passt nicht zum Dateinamen „k03“/u,
    /^inhalte\/theorie\/k05-test\.md:1: kapitel fehlt/u,
  ];
  for (const e of erwartet) assert.ok(fehler.some((f) => e.test(f)), `erwartet ${e}\nbekommen:\n${fehler.join('\n')}`);
  assert.ok(warnungen.some((x) => /^inhalte\/fremd\.md: Datei gehört zu keiner bekannten Art/u.test(x)), warnungen.join('\n'));
});

test('Formfehler brechen auch ohne --pruefe (Bau), Prüffehler nur mit --pruefe', async () => {
  const offen = veraendere(BEISPIEL, K02, 'v3 oder v4??\n:::\n:::\n', 'v3 oder v4??\n:::\n');
  const ohne = await kompiliere({ pruefe: false, wurzel: neueWurzel(offen), ziel: null });
  assert.ok(ohne.fehler.some((f) => /k02-ausgangslage\.md:\d+: Container „abschnitt“ wird nicht mit „:::“ geschlossen/u.test(f)), ohne.fehler.join('\n'));
  const yaml = veraendere(BEISPIEL, K02, 'deckt: [k2-p1]', 'deckt: [k2-p1');
  assert.ok((await kompiliere({ pruefe: false, wurzel: neueWurzel(yaml), ziel: null })).fehler.some((f) => /k02-ausgangslage\.md:\d+: Kopfdaten \(YAML\) unlesbar/u.test(f)));
  const pruef = veraendere(BEISPIEL, K02, 'Zwei [[Mandat|Mandate]]', 'Zwei [[Gibtsnicht]]');
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
    const w = neueWurzel(veraendere(BEISPIEL, K02, alt, neu));
    const { fehler } = await kompiliere({ pruefe: true, wurzel: w, ziel: null });
    assert.ok(fehler.some((f) => erwartet.test(f)), `${neu}: ${fehler.join('\n')}`);
  }
  const zitat = (text: string, wp: unknown = WHITEPAPER) => neueWurzel(veraendere(BEISPIEL, K02, ZITAT_P2, text), wp);
  const fehlerVon = async (w: string) => (await kompiliere({ pruefe: true, wurzel: w, ziel: null })).fehler;
  const inline = neueWurzel(veraendere(BEISPIEL, K02, '|Mehr Berichte helfen manchmal.]]', '|Mehr Berichte helfen immer.]]'));
  assert.ok((await fehlerVon(inline)).some((f) => /k02-ausgangslage\.md:\d+: Zitat nicht wortgleich/u.test(f)));
  // Auslassung und geschütztes Leerzeichen sind erlaubt, vertauschte Reihenfolge nicht
  assert.deepEqual(await fehlerVon(zitat('Berichterstattung erzeugt Information. […] Ein Ampelbericht ohne Entscheidungsfrage bleibt Beobachtung.')), []);
  assert.ok((await fehlerVon(zitat('Ein Ampelbericht ohne Entscheidungsfrage bleibt Beobachtung. […] Berichterstattung erzeugt Information.'))).some((f) => /nicht wortgleich/u.test(f)));
  // R49: ein Zitat, das mitten im Wort beginnt oder endet, ist nicht wortgleich („erzeugt Informati“ aus „Information“)
  assert.ok((await fehlerVon(zitat('erstattung erzeugt Information. Führung entsteht erst, wenn Information mit Mandat verbunden wird.'))).some((f) => /beginnt oder endet mitten im Wort/u.test(f)));
  assert.ok((await fehlerVon(zitat('Berichterstattung erzeugt Informati'))).some((f) => /beginnt oder endet mitten im Wort/u.test(f)));
  // R49: zwischen „[…]“ mindestens zwei Wörter – ein einzelnes Wort verschöbe den Sinn
  assert.ok((await fehlerVon(zitat('Berichterstattung erzeugt Information. […] Beobachtung.'))).some((f) => /ist zu kurz/u.test(f)));
  // R50: ein Gedankenstrich ist kein Wort („[…] – Beobachtung.“ ist zu kurz)
  assert.ok((await fehlerVon(zitat('Berichterstattung erzeugt Information. […] – Beobachtung.'))).some((f) => /ist zu kurz/u.test(f)));
  // R50: Binde- und Streckenstrich zwischen zwei Wortzeichen verbinden – „Bauherren“ aus „Bauherren-PL“, „LPH 0“ aus „LPH 0–9“
  const mitBinder = structuredClone(WHITEPAPER);
  const block = mitBinder.kapitel[0]?.abschnitte[0]?.bloecke[1];
  assert.ok(block);
  block.text += ' Die Vorlage kommt von der Bauherren-PL für LPH 0–9.';
  assert.deepEqual(await fehlerVon(zitat('Die Vorlage kommt von der Bauherren-PL für LPH 0–9.', mitBinder)), []);
  for (const z of ['Die Vorlage kommt von der Bauherren', 'Die Vorlage kommt von der Bauherren-PL für LPH 0', 'PL für LPH 0–9.']) {
    const f = await fehlerVon(zitat(z, mitBinder));
    assert.ok(f.some((x) => /beginnt oder endet mitten im Wort/u.test(x)), `${z}: ${f.join('\n')}`);
  }
});

test('Zitat aus einer Liste (R50): als Liste gesetzt, geprüft ohne die Marken', async () => {
  const liste = (text: string) => neueWurzel(veraendere(BEISPIEL, K02, `::: zitat k2.4-p2\n${ZITAT_P2}`, `::: zitat k2.4-l1\n${text}`));
  const gut = await kompiliere({ pruefe: true, wurzel: liste('- eins\n- zwei'), ziel: null });
  assert.deepEqual(gut.fehler, []);
  assert.match(JSON.stringify(gut.inhalte), /<ul>\\n<li>eins<\/li>\\n<li>zwei<\/li>/u);
  const falsch = await kompiliere({ pruefe: true, wurzel: liste('- eins\n- drei'), ziel: null });
  assert.ok(falsch.fehler.some((x) => /nicht wortgleich/u.test(x)), falsch.fehler.join('\n'));
  // R51: nur ganze Punkte der Quelle in ihrer Reihenfolge – und nur aus einer Liste
  const quer = await kompiliere({ pruefe: true, wurzel: liste('- eins zwei\n- zwei'), ziel: null });
  assert.ok(quer.fehler.some((x) => /kein ganzer Punkt von k2\.4-l1/u.test(x)), quer.fehler.join('\n'));
  const fliess = neueWurzel(veraendere(BEISPIEL, K02, ZITAT_P2,
    '- Berichterstattung erzeugt Information.\n- Führung entsteht erst, wenn Information mit Mandat verbunden wird.'));
  const f2 = await kompiliere({ pruefe: true, wurzel: fliess, ziel: null });
  assert.ok(f2.fehler.some((x) => /nur aus einer Liste des Whitepapers – k2\.4-p2 ist keine/u.test(x)), f2.fehler.join('\n'));
});

test('Abdeckung (P1.1): Lücke, fremdes Kapitel, unbekannte Seite und Schlüssel sind Fehler; geplante Kapitelseite gilt', async () => {
  const pruefe = async (yaml: string, extra: Record<string, string> = {}) => (await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, ...extra, 'inhalte/abdeckung.yaml': yaml }), ziel: null })).fehler;
  const luecke = await pruefe('k2.4-p1:\n  theorie: k02\n');
  assert.ok(luecke.some((f) => /^inhalte\/abdeckung\.yaml: Theorie-Abdeckung 3 von 4 Absätzen \(75,0 %\) – Pflicht 100 % \(P1\.1\); ohne Seite: k2\.4-l1$/u.test(f)), luecke.join('\n'));
  // k03 ist keine Lernseite, aber als Kapitel des Beispiels auch nicht geplant (das Beispiel hat nur Kapitel 2)
  assert.ok((await pruefe('k2.4-l1:\n  theorie: k03\n')).some((f) => /k2\.4-l1: Theorie-Seite „k03“ gibt es nicht/u.test(f)));
  const fremd = await pruefe('k2.4-l1:\n  theorie: k05\n', { 'inhalte/theorie/k05-test.md': '---\nkapitel: 5\ntitel: Test\n---\nText.\n' });
  assert.ok(fremd.some((f) => /k2\.4-l1: steht nicht auf der Seite seines Kapitels \(k02\)/u.test(f)), fremd.join('\n'));
  // Story-Bezüge gehören nicht mehr in die Abdeckungskarte
  const story = await pruefe('k2.4-l1:\n  theorie: k02\n  story: X1\n');
  assert.ok(story.some((f) => /^inhalte\/abdeckung\.yaml: k2\.4-l1: unbekannter Schlüssel „story“$/u.test(f)), story.join('\n'));
  const keineId = await pruefe('k2.4-l1:\n  theorie: k02\nk2.4-p9:\n  theorie: k02\nquatsch:\n  theorie: k02\n');
  assert.ok(keineId.some((f) => /Absatz-ID „k2\.4-p9“ gibt es im Whitepaper nicht/u.test(f)), keineId.join('\n'));
  assert.ok(keineId.some((f) => /„quatsch“ ist keine Absatz-ID/u.test(f)), keineId.join('\n'));
  // geplante Kapitelseite: k02 ohne Lernseite
  const ohneSeite: Record<string, string> = { 'inhalte/abdeckung.yaml': 'k2-p1:\n  theorie: k02\nk2.4-p1:\n  theorie: k02\nk2.4-p2:\n  theorie: k02\nk2.4-l1:\n  theorie: k02\n' };
  const geplant = await kompiliere({ pruefe: true, wurzel: neueWurzel(ohneSeite), ziel: null });
  assert.deepEqual(geplant.fehler, []);
  assert.equal((geplant.inhalte as Inhalte).abdeckung.anteil, 1);
});

test('P5.9 (T9): Tafel „hervor“ außerhalb der Zeilen ist ein Fehler; Tafel nur auf einer Tabelle', async () => {
  // eigene Whitepaper-Kopie mit einer Tabelle (die Vorgabe hat keine)
  const wp = structuredClone(WHITEPAPER) as typeof WHITEPAPER & { kapitel: { abschnitte: { bloecke: unknown[] }[] }[] };
  wp.kapitel[0]?.abschnitte[0]?.bloecke.push({ id: 'k2.4-t1', art: 'tabelle', text: 'A | B\nx | y', kopf: ['A', 'B'], zeilen: [['x', 'y'], ['u', 'v']] });
  const tafel = (id: string, hervor: string) => mitBloecken(`::: tafel ${id}\n---\nform: karten\nhervor: [${hervor}]\n---\n:::\n`);
  const gut = await kompiliere({ pruefe: false, wurzel: neueWurzel(tafel('k2.4-t1', '2'), wp), ziel: null });
  assert.deepEqual(gut.fehler, []);
  const t = (gut.inhalte as Inhalte).theorie['k02']?.bloecke.find((b) => b.art === 'tafel');
  assert.deepEqual(t?.kopf['hervor'], [2]);
  assert.deepEqual(t?.kopf['tabelle'], { kopf: ['A', 'B'], zeilen: [['x', 'y'], ['u', 'v']] });
  const daneben = await kompiliere({ pruefe: true, wurzel: neueWurzel(tafel('k2.4-t1', '3'), wp), ziel: null });
  assert.ok(daneben.fehler.some((f) => /Tafel k2\.4-t1: „hervor: 3“ – die Tabelle hat 2 Zeilen/u.test(f)), daneben.fehler.join('\n'));
  const keineTabelle = await kompiliere({ pruefe: true, wurzel: neueWurzel(veraendere(tafel('k2.4-t1', '1'), K02, '::: tafel k2.4-t1', '::: tafel k2.4-t9'), wp), ziel: null });
  assert.ok(keineTabelle.fehler.some((f) => /Tafel: „k2\.4-t9“ ist keine Tabelle im Whitepaper/u.test(f)), keineTabelle.fehler.join('\n'));
});

test('Startseite (inhalte/start.md): Leitsatz wörtlich mit Absatz-ID geprüft, These als Inline-HTML', async () => {
  const start = (titel: string) => `---\nkicker: Minimum Viable Governance\ntitel: ${titel}\ntitel-quelle: k2.4-p2\n---\n\nEine **These**.\n`;
  const gut = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/start.md': start('Berichterstattung erzeugt Information.') }), ziel: null });
  assert.deepEqual(gut.fehler, []);
  assert.deepEqual((gut.inhalte as Inhalte).startseite, { kicker: 'Minimum Viable Governance', titel: 'Berichterstattung erzeugt Information.', titelQuelle: 'k2.4-p2', these: 'Eine <strong>These</strong>.' });
  const falsch = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/start.md': start('Berichte erzeugen Information.') }), ziel: null });
  assert.ok(falsch.fehler.some((f) => /^inhalte\/start\.md:1: Zitat nicht wortgleich/u.test(f)), falsch.fehler.join('\n'));
  const ohneThese = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/start.md': '---\nkicker: K\ntitel: T\n---\n' }), ziel: null });
  assert.ok(ohneThese.fehler.some((f) => /^inhalte\/start\.md:1: Feld „text“ fehlt/u.test(f)), ohneThese.fehler.join('\n'));
  assert.equal(((await kompiliere({ pruefe: true, wurzel: neueWurzel(BEISPIEL), ziel: null })).inhalte as Inhalte).startseite, null);
});

test('Begriffe im fertigen Ergebnis: auch Whitepaper-Texte (Glossar) werden geprüft, nur mit --pruefe', async () => {
  const alt = structuredClone(WHITEPAPER);
  alt.glossar.push({ id: 'g-alt', begriff: 'Quality Gate', definition: 'Ein Change Board entscheidet über den Scope.' });
  const w = neueWurzel(BEISPIEL, alt);
  const { fehler } = await kompiliere({ pruefe: true, wurzel: w, ziel: null });
  const begriffe = fehler.filter((f) => f.startsWith('begriffe: src/generiert/inhalte.json:'));
  assert.deepEqual(begriffe.map((f) => /„([^“]+)“/u.exec(f)?.[1]).sort(), ['Change Board', 'Gate', 'Scope']);
  assert.deepEqual((await kompiliere({ pruefe: false, wurzel: w, ziel: null })).fehler, [], 'der Bau bricht daran nicht');
});

test('Ohne whitepaper.json: Zitate und Glossar nur Warnung, kein Fehler', async () => {
  const w = neueWurzel(BEISPIEL, null);
  const { fehler, warnungen, inhalte } = await kompiliere({ pruefe: true, wurzel: w, ziel: null });
  assert.deepEqual(fehler, []);
  assert.ok(warnungen.some((x) => /whitepaper\.json fehlt – Zitate nicht auf Wortgleichheit geprüft/u.test(x)));
  assert.ok(warnungen.some((x) => /Glossarbezüge \(\[\[…\]\]\) ungeprüft/u.test(x)));
  assert.deepEqual((inhalte as Inhalte).abbildungen, []);
  const platzhalter = neueWurzel(veraendere(BEISPIEL, K02, '::: zitat k2.4-p2', '::: zitat k2.4-p?'), null);
  assert.ok((await kompiliere({ pruefe: true, wurzel: platzhalter, ziel: null })).fehler.some((f) => /keine Absatz-ID/u.test(f)), 'ein Platzhalter fällt auch ohne Quelle auf');
});

const ECHT_WP = path.join(WURZEL, 'quellen', 'whitepaper', 'v1.2', 'whitepaper.json');

test('Echte Inhalte: fehlerfrei; Mutanten-Probe am Zitat k2.4-p2 im Thema Ausgangslage', { skip: existsSync(ECHT_WP) ? false : 'whitepaper.json fehlt' }, async () => {
  const echt = await kompiliere({ pruefe: true, ziel: null });
  assert.deepEqual(echt.fehler, []);
  const w = mkdtempSync(path.join(TMP, 'test-inhalte-echt-'));
  ORDNER.push(w);
  cpSync(path.join(WURZEL, 'inhalte'), path.join(w, 'inhalte'), { recursive: true });
  const k02 = path.join(w, 'inhalte', 'theorie', 'k16-takt.md'); // P17.11: das Zitat k2.4-p2 steht nur noch in k16
  const text = readFileSync(k02, 'utf8');
  const stelle = 'Ein Ampelbericht ohne Entscheidungsfrage bleibt Beobachtung.\n:::';
  assert.equal(text.split(stelle).length, 2, 'die Stelle steht genau einmal im Thema');
  writeFileSync(k02, text.replace(stelle, stelle.replace('bleibt Beobachtung.', 'bleibt reine Beobachtung.')), 'utf8');
  const { fehler } = await kompiliere({ pruefe: true, wurzel: w, whitepaperPfad: ECHT_WP, ziel: null });
  assert.ok(fehler.some((f) => /^inhalte\/theorie\/k16-takt\.md:\d+: Zitat nicht wortgleich mit k2\.4-p2/u.test(f)), fehler.join('\n'));
  writeFileSync(k02, text, 'utf8');
  // R48: eine Bildüberdeckung, deren Text nicht wortgleich im Beleg steht, fällt auf (INHALTSFORMAT 4.6)
  const abb10 = path.join(w, 'inhalte', 'abbildungen', 'abb-10.yaml');
  const yaml = readFileSync(abb10, 'utf8');
  assert.ok(yaml.includes('text: Freigabeentscheidung,'));
  writeFileSync(abb10, yaml.replace('text: Freigabeentscheidung,', 'text: Freigabesitzung,'), 'utf8');
  const abb = await kompiliere({ pruefe: true, wurzel: w, whitepaperPfad: ECHT_WP, ziel: null });
  assert.ok(abb.fehler.some((f) => /abb-10\.yaml.*„Freigabesitzung“ steht nicht wortgleich im Absatz k6\.4\.4-t1/u.test(f)), abb.fehler.join('\n'));
  // R49: ein Wortbruchstück ist kein Begriff des Texts
  writeFileSync(abb10, yaml.replace('text: Freigabeentscheidung,', 'text: Freigabeentscheidun,'), 'utf8');
  const bruch = await kompiliere({ pruefe: true, wurzel: w, whitepaperPfad: ECHT_WP, ziel: null });
  assert.ok(bruch.fehler.some((f) => /abb-10\.yaml.*„Freigabeentscheidun“ steht nicht wortgleich/u.test(f)), bruch.fehler.join('\n'));
  // R50: auch am Wortanfang – „entscheidung“ aus „Freigabeentscheidung“ ist kein Begriff des Texts
  writeFileSync(abb10, yaml.replace('text: Freigabeentscheidung,', 'text: entscheidung,'), 'utf8');
  const anfang = await kompiliere({ pruefe: true, wurzel: w, whitepaperPfad: ECHT_WP, ziel: null });
  assert.ok(anfang.fehler.some((f) => /abb-10\.yaml.*„entscheidung“ steht nicht wortgleich/u.test(f)), anfang.fehler.join('\n'));
});

test('Bedienhinweis (O-56): [[bedienung:…]] gibt es nicht mehr – jeder Rest ist ein Fehler', async () => {
  const mit = (satz: string) => veraendere(BEISPIEL, K02, 'v3 oder v4??', satz);
  const gut = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit('v3 oder v4?')), ziel: null });
  assert.deepEqual(gut.fehler, []);
  const r = await kompiliere({ pruefe: true, wurzel: neueWurzel(mit('v3 oder v4? [[bedienung:Wählen Sie eine Version.]]')), ziel: null });
  assert.ok(r.fehler.some((f) => /Bedienhinweise gibt es nicht mehr/u.test(f)), r.fehler.join('\n'));
});

test('Begriffs-Kompass (P10.5): Begriff muss im Beleg stehen, Glossar-Bezug, alte Wörter nur hier erlaubt', async () => {
  const kompass = (id: string, begriff: string, beleg: string, andere = '[Change-Board]'): string => `::: kompass ${id}\n---\nbegriff: ${begriff}\nandere: ${andere}\nbeleg: ${beleg}\n---\n:::\n\n`;
  const gut = neueWurzel({ ...BEISPIEL, 'inhalte/begriffs-kompass.md': kompass('mandat', 'Mandat', 'k2.4-p2') + kompass('v24', 'Vorgang', 'v24:hb-3.1') });
  const ok = await kompiliere({ pruefe: true, wurzel: gut, ziel: null });
  assert.deepEqual(ok.fehler, [], 'das alte Wort im Kompass ist kein Begriffe-Fund');
  assert.deepEqual(ok.inhalte.kompass, [
    { id: 'mandat', begriff: 'Mandat', andere: ['Change-Board'], beleg: 'k2.4-p2', glossar: 'g-mandat', hinweis: null },
    { id: 'v24', begriff: 'Vorgang', andere: ['Change-Board'], beleg: 'v24:hb-3.1', glossar: null, hinweis: null },
  ]);
  const schlecht = neueWurzel({ ...BEISPIEL, 'inhalte/begriffs-kompass.md': kompass('a', 'Freigabe', 'k2.4-p2') + kompass('b', 'Mandat', 'k9.9-p9') + kompass('a', 'Mandat', 'k2.4-p2') + kompass('c', 'Mandat', 'k2.4-p2', '[]') + kompass('d', 'Bericht', 'k2.4-p2') + kompass('e', 'Mandat', 'v24:3.1') });
  const { fehler } = await kompiliere({ pruefe: true, wurzel: schlecht, ziel: null });
  for (const e of [/Kompass a: „Freigabe“ steht nicht in k2\.4-p2/u, /Absatz-ID „k9\.9-p9“ gibt es im Whitepaper nicht/u, /Kompass-Eintrag a doppelt/u, /Kompass c: „andere“ ist leer|„andere“/u, /Kompass d: „Bericht“ steht nicht in k2\.4-p2/u, /Kompass e: Beleg „v24:3\.1“ unlesbar/u]) {
    assert.ok(fehler.some((f) => e.test(f)), `erwartet ${e}\nbekommen:\n${fehler.join('\n')}`);
  }
});

test('Regie auf Themen (P9.5): ohne kapitel und doppelt sind Fehler', async () => {
  const seite = (kopf: string): string => `---\n${kopf}titel: Ausgangslage\n---\n::: kernaussage\nText.\n:::\n\n::: regie\n### Notiz\nEins.\n:::\n\n::: regie\n### Notiz\nZwei.\n:::\n`;
  const doppelt = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, [K02]: seite('kapitel: 2\n') }), ziel: null });
  assert.ok(doppelt.fehler.some((f) => /k02-ausgangslage\.md:\d+: zweiter Regie-Block zu Kapitel 2/u.test(f)), doppelt.fehler.join('\n'));
  assert.deepEqual((doppelt.inhalte as Inhalte).regie['theorie/k2'], { notiz: '<p>Eins.</p>', leitfragen: [] });
  const ohne = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, [K02]: seite('') }), ziel: null });
  assert.ok(ohne.fehler.some((f) => /Regie-Block ohne „kapitel:“ im Dateikopf/u.test(f)), ohne.fehler.join('\n'));
  const tief = await kompiliere({ pruefe: true, wurzel: neueWurzel(veraendere(BEISPIEL, K02, '::: merksatz\n', '::: regie\n### Notiz\nX.\n:::\n\n::: merksatz\n')), ziel: null });
  assert.ok(tief.fehler.some((f) => /„regie“ ist hier nicht erlaubt/u.test(f)), tief.fehler.join('\n'));
});

test('Themen als Buch (P17.8, O-54): teil, kurzsatz und symbol Pflicht und geprüft; Nummern und Teile in Leserichtung', async () => {
  const k03 = (kopf: string): string => `---\nkapitel: 3\ntitel: Begriffe\nthema: begriffe\nreihe: 3\n${kopf}---\nText.\n`;
  const gut = 'teil: 2\nkurzsatz: Ein kurzer Satz.\nsymbol: buch\n';
  // Gegenprobe: gültig → fehlerfrei, Nummern nach reihe (k02 = 1, k03 = 2)
  const ok = await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/theorie/k03-begriffe.md': k03(gut) }), ziel: null });
  assert.deepEqual(ok.fehler, []);
  const th = (ok.inhalte as Inhalte).theorie;
  assert.deepEqual([th['k02']?.nr, th['k03']?.nr, th['k03']?.teil], [1, 2, 2]);
  const fehler = async (kopf: string): Promise<string[]> => (await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...BEISPIEL, 'inhalte/theorie/k03-begriffe.md': k03(kopf) }), ziel: null })).fehler;
  const ohne = await fehler('');
  for (const k of ['teil', 'kurzsatz', 'symbol']) assert.ok(ohne.some((f) => f.includes(`Pflichtangabe „${k}“ fehlt`)), `${k}: ${ohne.join('\n')}`);
  assert.ok((await fehler('teil: 5\nkurzsatz: Satz.\nsymbol: buch\n')).some((f) => /„teil“: „5“ ist nicht erlaubt/u.test(f)));
  assert.ok((await fehler(`teil: 2\nkurzsatz: ${'x'.repeat(91)}\nsymbol: buch\n`)).some((f) => /kurzsatz hat 91 Zeichen \(höchstens 90\)/u.test(f)));
  assert.equal((await fehler(`teil: 2\nkurzsatz: ${'x'.repeat(90)}\nsymbol: buch\n`)).length, 0, '90 Zeichen gehen');
  assert.ok((await fehler('teil: 2\nkurzsatz: Satz.\nsymbol: gibtsnicht\n')).some((f) => /symbol „gibtsnicht“ gibt es nicht/u.test(f)));
  // Leserichtung: ein früherer Teil hinter einem späteren, der Anhang vor einem Teil
  const zurueck = veraendere(BEISPIEL, K02, 'teil: 1\n', 'teil: 3\n');
  const rueck = (await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...zurueck, 'inhalte/theorie/k03-begriffe.md': k03(gut) }), ziel: null })).fehler;
  assert.ok(rueck.some((f) => /k03-begriffe\.md: teil 2 steht in der Reihenfolge hinter einem späteren Teil/u.test(f)), rueck.join('\n'));
  const anhang = veraendere(BEISPIEL, K02, 'teil: 1\n', 'teil: anhang\n');
  assert.ok((await kompiliere({ pruefe: true, wurzel: neueWurzel({ ...anhang, 'inhalte/theorie/k03-begriffe.md': k03(gut) }), ziel: null })).fehler.some((f) => /teil 2 steht in der Reihenfolge/u.test(f)));
});

test('Wissenscheck (P11.6): mindestens zwei Antworten und ein wortgleicher Beleg', async () => {
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
  const ok = await kompiliere({ pruefe: true, wurzel: neueWurzel(mitBloecken(gut)), ziel: null });
  assert.deepEqual(ok.fehler, []);
  const wc = (ok.inhalte as Inhalte).theorie['k02']?.bloecke.find((b) => b.art === 'wissenscheck');
  assert.equal(wc?.kinder.filter((k) => k.art === 'antwort').length, 2);
  assert.deepEqual(wc?.kinder[0]?.kopf, { titel: 'Nein', praefix: 'Genau:' });
  const eineAntwort = gut.replace(/::: antwort b[\s\S]*?:::\n\n/u, '');
  const ohneBeleg = gut.replace(/::: zitat k2\.4-p2\nBerichterstattung erzeugt Information\.\n:::\n/u, '');
  const falscherBeleg = gut.replace('Berichterstattung erzeugt Information.\n:::\n:::', 'Berichte erzeugen Information.\n:::\n:::');
  const f1 = (await kompiliere({ pruefe: true, wurzel: neueWurzel(mitBloecken(eineAntwort)), ziel: null })).fehler;
  assert.ok(f1.some((f) => /Wissenscheck berichte: mindestens zwei Antworten/u.test(f)), f1.join('\n'));
  const f2 = (await kompiliere({ pruefe: true, wurzel: neueWurzel(mitBloecken(ohneBeleg)), ziel: null })).fehler;
  assert.ok(f2.some((f) => /Wissenscheck berichte: Beleg fehlt/u.test(f)), f2.join('\n'));
  const f3 = (await kompiliere({ pruefe: true, wurzel: neueWurzel(mitBloecken(falscherBeleg)), ziel: null })).fehler;
  assert.ok(f3.some((f) => /Zitat nicht wortgleich/u.test(f)), f3.join('\n'));
});

test('Eigentext (R49): „EW“ und „Mio. EUR“ nur im wortgleichen Zitat; Schwellen der Mandatsleiter überall 100 TEUR bzw. 100.000 € / 5 Mio.', async () => {
  const { readdirSync, statSync } = await import('node:fs');
  const dateien: string[] = [];
  const sammle = (d: string): void => {
    for (const n of readdirSync(d)) {
      const p = path.join(d, n);
      if (statSync(p).isDirectory()) sammle(p);
      else if (/\.(md|yaml)$/u.test(n)) dateien.push(p);
    }
  };
  sammle(path.join(WURZEL, 'inhalte'));
  assert.ok(dateien.length > 40);
  const funde: string[] = [];
  let schwellen = 0;
  for (const p of dateien) {
    const roh = readFileSync(p, 'utf8');
    // Zitate: Container „::: zitat …“, eingebettete [[zitat:…|…]] und in Anführung „…“ wiedergegebener Quelltext
    const eigen = roh.replace(/^::: zitat [^\n]*\n[\s\S]*?\n:::$/gmu, ' ').replace(/\[\[zitat:[^|\]]+\|[^\]]*\]\]/gu, ' ').replace(/„[^“]*“/gu, ' ');
    for (const m of eigen.matchAll(/\bEW\b|Mio\. EUR/gu)) funde.push(`${path.relative(WURZEL, p)}: „${m[0]}“`);
    // r72: in Eigentext ausgeschrieben („100.000 €“), im wortgleichen Zitat „100 TEUR“
    for (const m of roh.matchAll(/einschließlich ([\d.,]+) (TEUR|Mio\.|€)/gu)) {
      schwellen += 1;
      const soll = m[2] === 'TEUR' ? '100' : m[2] === '€' ? '100.000' : '5';
      if (m[1] !== soll) funde.push(`${path.relative(WURZEL, p)}: Schwelle „einschließlich ${m[1]} ${m[2]}“`);
    }
  }
  assert.deepEqual(funde, []);
  assert.ok(schwellen >= 3, `nur ${schwellen} Schwellen gefunden`); // P17: fall.md trägt keine Schwellen mehr, die Themen schon
});

test('Aufklapper und Symbol der Kernaussage (P17.9, O-55): Titel in der Öffnungszeile, Symbole geprüft', async () => {
  const kern = (kopf: string): Record<string, string> => veraendere(BEISPIEL, K02, '::: kernaussage\n', `::: kernaussage\n---\n${kopf}---\n`);
  const auf = '::: aufklapper Wer entscheidet am Ende?\n---\nsymbol: person\n---\nDas [[Mandat]] entscheidet.\n:::\n';
  const ok = await kompiliere({ pruefe: true, wurzel: neueWurzel(mitBloecken(auf, kern('symbol: schild\n'))), ziel: null });
  assert.deepEqual(ok.fehler, []);
  const bl = (ok.inhalte as Inhalte).theorie['k02']?.bloecke ?? [];
  assert.equal(bl.find((b) => b.art === 'kernaussage')?.kopf['symbol'], 'schild');
  const a = bl.find((b) => b.art === 'aufklapper');
  assert.deepEqual([a?.kopf['titel'], a?.kopf['symbol'], a?.id, a?.kennungen], ['Wer entscheidet am Ende?', 'person', null, []]);
  assert.match(a?.felder['text'] ?? '', /data-glossar="g-mandat"/u, 'Inhalt mit den üblichen Inline-Bausteinen');
  // ohne Symbol gültig (die Seite nimmt dann ein passendes bzw. das Symbol des Themas)
  assert.deepEqual((await kompiliere({ pruefe: true, wurzel: neueWurzel(mitBloecken('::: aufklapper Kurz\nText.\n:::\n')), ziel: null })).fehler, []);
  const fehler = async (d: Record<string, string>): Promise<string[]> => (await kompiliere({ pruefe: true, wurzel: neueWurzel(d), ziel: null })).fehler;
  assert.ok((await fehler(kern('symbol: gibtsnicht\n'))).some((f) => /symbol „gibtsnicht“ gibt es nicht/u.test(f)));
  assert.ok((await fehler(mitBloecken('::: aufklapper\nText.\n:::\n'))).some((f) => /„aufklapper“ braucht einen Titel in der Öffnungszeile/u.test(f)));
  assert.ok((await fehler(mitBloecken('::: aufklapper Leer\n:::\n'))).some((f) => /„aufklapper Leer“: Feld „text“ fehlt oder ist leer/u.test(f)));
  assert.ok((await fehler(mitBloecken('::: aufklapper Der [[Mandat]]\nText.\n:::\n'))).some((f) => /der Titel ist schlichter Text/u.test(f)));
  assert.ok((await fehler(mitBloecken('::: aufklapper Probe\n---\nsymbol: nix\n---\nText.\n:::\n'))).some((f) => /symbol „nix“ gibt es nicht/u.test(f)));
});
