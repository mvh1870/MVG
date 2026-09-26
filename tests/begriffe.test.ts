// Tests für werkzeuge/begriffe.mjs (P0.4, docs/BEGRIFFE.md).
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  STANDARD_LISTE,
  WURZEL,
  formatiereFund,
  globZuRegExp,
  pruefeBaum,
  pruefeText,
} from '../werkzeuge/begriffe.mjs';

type Eintrag = { muster: string; flags?: string; statt: string };
const LISTE = JSON.parse(readFileSync(STANDARD_LISTE, 'utf8')) as {
  pfade: string[];
  ausnahmen: string[];
  verboten: Eintrag[];
};
const FIXTUR = path.join(WURZEL, 'tests', 'fixtures', 'begriffe');

// Je Muster der Liste Beispiele, die es treffen müssen – auch Beugungs-, Plural- und Schreibvarianten.
// Ein neues Muster ohne Beispiel lässt den ersten Test rot werden – so bleibt jede Zeile belegt.
// Geprüft wird als Markdown unter inhalte/ (dort gilt gross/klein egal).
const BEISPIELE: Record<string, string[]> = {
  [LISTE.verboten[0]?.muster ?? '']: ['Freigabe am G3', 'G0–G5', 'G0 - G9', 'G3', 'G-3', 'G‑3', 'G03', 'G 0–5', 'G 1 bis G 5'],
  [LISTE.verboten[1]?.muster ?? '']: ['das Gate', 'alle gates', 'Qualitätsgate', 'Freigabegate', 'Projektgates', 'Quality-Gate', 'GATE'],
  [LISTE.verboten[2]?.muster ?? '']: ['ein No-Go', 'No Go', 'no‑go', 'No–Go', 'NOGO'],
  [LISTE.verboten[3]?.muster ?? '']: ['das Go des Bauherrn', 'Go-Entscheidung', 'Go mit Auflagen', 'Conditional Go', 'Go with Conditions', 'Go / No'],
  [LISTE.verboten[4]?.muster ?? '']: ['die Decision File', 'decision-file', 'Decision Files', 'DecisionFile'],
  [LISTE.verboten[5]?.muster ?? '']: ['die Entscheidungsakte', 'Entscheidungs-Akte', 'Entscheidungsakten'],
  [LISTE.verboten[6]?.muster ?? '']: ['das Change-Board', 'change board', 'Change Boards', 'Changeboard', 'Change Control Board'],
  [LISTE.verboten[7]?.muster ?? '']: ['Operating Model', 'Operating Models'],
  [LISTE.verboten[8]?.muster ?? '']: ['der Readout', 'Readouts', 'Read-out'],
  [LISTE.verboten[9]?.muster ?? '']: ['im Scope', 'Scopes', 'Projektscope', 'out of scope', 'SCOPE', 'Scopeänderung'],
  [LISTE.verboten[10]?.muster ?? '']: ['Evidence', 'Evidence-Liste'],
  [LISTE.verboten[11]?.muster ?? '']: ['Readiness-Check', 'readiness'],
  [LISTE.verboten[12]?.muster ?? '']: ['Governance-Reset', 'der Reset', 'Resets', 'Governancereset', 'reset', 'RESET'],
  [LISTE.verboten[13]?.muster ?? '']: ['Long-Lead-Komponente', 'Long Leads', 'Longlead'],
  [LISTE.verboten[14]?.muster ?? '']: ['der Impact', 'Impacts', 'Impactanalyse', 'impact'],
  [LISTE.verboten[15]?.muster ?? '']: ['Risk Register', 'Risks', 'Riskmanagement', 'risk', 'RISK'],
  [LISTE.verboten[16]?.muster ?? '']: ['Mitigation', 'Mitigations', 'Mitigationsmaßnahme'],
  [LISTE.verboten[17]?.muster ?? '']: ['Contingency', 'Contingencies'],
  [LISTE.verboten[18]?.muster ?? '']: ['die Heatmap', 'Heatmaps', 'Risikoheatmap', 'Heat Map', 'Heat-Map'],
  [LISTE.verboten[19]?.muster ?? '']: ['Stakeholdern', 'stakeholder', 'STAKEHOLDER'],
  [LISTE.verboten[20]?.muster ?? '']: ['MVG-Design', 'MVG-Designphase', 'MVG Design'],
  [LISTE.verboten[21]?.muster ?? '']: ['gerichtsfeste Nachweise'],
  [LISTE.verboten[22]?.muster ?? '']: ['Minimal Viable Governance', 'Minimal-Viable-Governance', 'Minimal\nViable Governance'],
};

// Gegenproben: richtige Begriffe, naheliegende Hochbau-Bezeichnungen und englische Wörter mit
// denselben Buchstaben sind KEINE Funde (in Markdown, also ohne gross/klein).
const GEGENPROBEN = [
  'LPH 0–9', 'Freigabe LPH 3', 'LPH 0 … LPH 9', 'LPH 3', 'KG 300', 'BG3',
  'Achse G 3', 'Treppenhaus G 1', 'Gebäude G 2',
  'Minimum Viable Governance',
  'Freigabe / keine Freigabe / Freigabe mit Auflagen',
  'Entscheidungsvorlage und Änderungsgremium',
  'Projektumfang, Nachweis, Risiko, Risikominderung, Risikoreserve, Beteiligte',
  'riskant, riskieren, riskiert, Risikos',
  'MVG-Neuinitialisierung und Betriebshandbuch',
  'Gatekeeper, Gateway, API-Gateway und Governance',
  'navigate, delegate, aggregate, propagate, investigate, mitigate',
  'Teleskop und telescope, Mikroskop, Preset, Evidenz, Logo, Lego, Tango',
  'Reserve, Managementreserve, Datenstand, Leadership',
  'ENT-017, RIS-004, FRW-012',
];

describe('begriffe: Muster der Liste', () => {
  test('jedes Muster der Liste hat ein Beispiel und findet es', () => {
    assert.ok(LISTE.verboten.length > 0);
    for (const eintrag of LISTE.verboten) {
      const beispiele = BEISPIELE[eintrag.muster];
      assert.ok(beispiele, `kein Beispiel für Muster ${eintrag.muster} – bitte in tests/begriffe.test.ts ergänzen`);
      for (const text of beispiele) {
        const funde = pruefeText(text, 'inhalte/probe.md');
        assert.ok(
          funde.some((f) => f.muster === eintrag.muster && f.statt === eintrag.statt),
          `„${text}“ wird von ${eintrag.muster} nicht gefunden`,
        );
      }
    }
  });

  test('„LPH 3“ ist kein Fund, „G3“ schon', () => {
    assert.deepEqual(pruefeText('Die Freigabe LPH 3 steht an.', 'inhalte/x.md'), []);
    const funde = pruefeText('G3', 'inhalte/x.md');
    assert.equal(funde.length, 1);
    assert.equal(funde[0]?.fundstelle, 'G3');
  });

  test('richtige Begriffe und Gegenproben sind keine Funde', () => {
    for (const text of GEGENPROBEN) {
      assert.deepEqual(pruefeText(text, 'inhalte/x.md'), [], `Falscher Fund in „${text}“`);
      assert.deepEqual(pruefeText(text, 'src/x.ts'), [], `Falscher Fund in „${text}“ (Code)`);
    }
  });

  test('gross/klein: in Texten egal, in Code nur die festgelegte Schreibung (CSS counter-reset, :scope)', () => {
    assert.equal(pruefeText('out of scope', 'inhalte/x.md').length, 1);
    assert.equal(pruefeText('RISK', 'werkzeuge/huelle.html').length, 1);
    assert.deepEqual(pruefeText('.liste { counter-reset: n; } :scope > li {}', 'src/stil/x.css'), []);
    assert.equal(pruefeText('const Scope = 1;', 'src/x.ts').length, 1);
  });

  test('Schreibvarianten: weiches Trennzeichen, Sonderleerzeichen, Sonderstriche, Zeilenumbruch', () => {
    const faelle: Array<[string, string]> = [
      ['Change\u00A0Board', 'Change\u00A0Board'],
      ['No\u2011Go', 'No\u2011Go'],
      ['Heat\u00ADmap', 'Heat\u00ADmap'],
      ['Stake\u00ADholder', 'Stake\u00ADholder'],
      ['Change\nBoard', 'Change Board'],
      ['Minimal\u202FViable\u00A0Governance', 'Minimal\u202FViable\u00A0Governance'],
    ];
    for (const [text, fundstelle] of faelle) {
      const funde = pruefeText(`Vorher ${text} nachher`, 'inhalte/x.md');
      assert.equal(funde.length, 1, JSON.stringify(text));
      assert.equal(funde[0]?.fundstelle, fundstelle);
      assert.equal(funde[0]?.spalte, 8);
      assert.equal(funde[0]?.zeile, 1);
    }
    // Spalten zählen im Original, auch hinter einem weichen Trennzeichen.
    const hinten = pruefeText('Ab\u00ADschnitt mit Gate', 'inhalte/x.md');
    assert.equal(hinten[0]?.spalte, 'Ab\u00ADschnitt mit '.length + 1);
  });

  test('JSON: Maskierungen \\n trennen Wörter, Zeichen bleiben an ihrer Stelle', () => {
    const json = '{"t":"Change\\nBoard und Risk"}';
    const funde = pruefeText(json, 'src/generiert/probe.json', { pfade: [], grossKleinEgal: ['**/*.json'], verboten: LISTE.verboten });
    assert.deepEqual(funde.map((f) => f.fundstelle), ['Change\\nBoard', 'Risk']);
  });

  test('Bereich G0–G5 ist ein einziger Fund mit Zeile und Spalte', () => {
    const funde = pruefeText('Zeile eins\nFreigaben G0–G5 sind veraltet', 'inhalte/x.md');
    assert.equal(funde.length, 1);
    assert.deepEqual(
      { zeile: funde[0]?.zeile, spalte: funde[0]?.spalte, fundstelle: funde[0]?.fundstelle },
      { zeile: 2, spalte: 11, fundstelle: 'G0–G5' },
    );
  });

  test('base64-Nutzlast in data:-URIs ist kein Fund', () => {
    const css = '.logo{background:url(data:image/png;base64,AAAA/G3+Gate/Risk==)} .x{content:"Risk"}';
    const funde = pruefeText(css, 'src/stil/logo.css');
    assert.equal(funde.length, 1);
    assert.equal(funde[0]?.fundstelle, 'Risk');
    assert.equal(funde[0]?.spalte, css.lastIndexOf('Risk') + 1);
  });
});

describe('begriffe: Zeilenmarken und Ausnahmen', () => {
  test('Zeilenmarke mit Grund erlaubt die Zeile – in der Form ihrer Dateiart, am Zeilenende', () => {
    for (const [zeile, datei] of [
      ['Früher hieß das Gate. <!-- begriffe-erlaubt: Zitat der alten Companion-Fassung -->', 'inhalte/x.md'],
      ['<p>Gate</p> <!-- begriffe-erlaubt: Beispiel -->', 'werkzeuge/huelle.html'],
      ["const alt = 'Gate'; // begriffe-erlaubt: Vergleich im Begriffs-Kompass", 'src/x.ts'],
      ["const alt = 'Gate'; /* begriffe-erlaubt: Vergleich */", 'src/x.ts'],
      ['.gate::after { content: "Gate"; } /* begriffe-erlaubt: Beispiel */', 'src/stil/x.css'],
      ['alt: Gate # begriffe-erlaubt: Vergleich', 'inhalte/x.yaml'],
    ]) {
      assert.deepEqual(pruefeText(zeile ?? '', datei), [], zeile);
    }
  });

  test('Zeilenmarke in falscher Form oder mitten in der Zeile erlaubt nichts und ist selbst ein Fund', () => {
    for (const [zeile, datei] of [
      ['Das Gate ist zu. // begriffe-erlaubt: Beispiel', 'inhalte/x.md'],
      ['Der Scope wächst. # begriffe-erlaubt: Beispiel', 'inhalte/x.md'],
      ['[Link](#begriffe-erlaubt:anker) – Risk steigt', 'inhalte/x.md'],
      ['<!-- begriffe-erlaubt: Beispiel --> und danach Gate', 'inhalte/x.md'],
      ["x = 'Gate'; <!-- begriffe-erlaubt: Beispiel -->", 'src/x.ts'],
      ['.x { content: "Gate"; } // begriffe-erlaubt: Beispiel', 'src/stil/x.css'],
      ['{"a": "Gate"} // begriffe-erlaubt: Beispiel', 'daten/x.json'],
    ]) {
      const funde = pruefeText(zeile ?? '', datei);
      assert.ok(funde.some((f) => f.art === 'begriff'), `Begriff nicht gemeldet: ${zeile}`);
      assert.ok(funde.some((f) => f.art === 'marke' && /Zeilenende/.test(f.statt)), `falsche Marke nicht gemeldet: ${zeile}`);
    }
  });

  test('Zeilenmarke ohne Grund erlaubt nichts und ist selbst ein Fund', () => {
    for (const [zeile, datei] of [
      ['Das Gate <!-- begriffe-erlaubt -->', 'inhalte/x.md'],
      ['Das Gate <!-- begriffe-erlaubt: -->', 'inhalte/x.md'],
      ['Das Gate <!-- begriffe-erlaubt: ok -->', 'inhalte/x.md'],
      ["x = 'Gate'; // begriffe-erlaubt: .", 'src/x.ts'],
    ]) {
      const funde = pruefeText(zeile ?? '', datei);
      assert.ok(funde.some((f) => f.art === 'begriff' && f.fundstelle === 'Gate'), `Gate nicht gemeldet: ${zeile}`);
      assert.ok(funde.some((f) => f.art === 'marke'), `Marke ohne Grund nicht gemeldet: ${zeile}`);
    }
  });

  test('Zeilenmarke gilt nur für ihre eigene Zeile', () => {
    const funde = pruefeText('Gate <!-- begriffe-erlaubt: Zitat -->\nGate', 'inhalte/x.md');
    assert.equal(funde.length, 1);
    assert.equal(funde[0]?.zeile, 2);
  });

  test('Mehrzeiliger Fund: die Marke der Zeile, in der er beginnt, zählt', () => {
    assert.deepEqual(pruefeText('Minimal <!-- begriffe-erlaubt: Zitat alter Fassung -->\nViable Governance', 'inhalte/x.md').filter((f) => f.art === 'begriff'), []);
    const funde = pruefeText('Minimal\nViable Governance <!-- begriffe-erlaubt: Zitat alter Fassung -->', 'inhalte/x.md');
    assert.equal(funde.length, 1);
    assert.equal(funde[0]?.zeile, 1);
  });

  test('Ausnahmedatei wird ignoriert', () => {
    assert.ok(LISTE.ausnahmen.includes('inhalte/begriffs-kompass.md'));
    assert.deepEqual(pruefeText('Gate, G0–G5, Scope', 'inhalte/begriffs-kompass.md'), []);
    assert.deepEqual(pruefeText('Gate', 'src/generiert/schriften.css'), []);
    // Die kompilierten Inhalte sind KEINE Ausnahme: inhalte.mjs --pruefe prüft sie mit dieser Liste.
    assert.equal(pruefeText('Gate', 'src/generiert/inhalte.json').length, 1);
    assert.equal(pruefeText('Gate', 'inhalte/andere.md').length, 1);
  });

  test('Baum der Fixtur: pfade, Ausnahmen und Funde mit Datei:Zeile:Spalte', async () => {
    const liste = JSON.parse(readFileSync(path.join(FIXTUR, 'liste.json'), 'utf8')) as typeof LISTE;
    const { dateien, funde } = await pruefeBaum({ wurzel: FIXTUR, liste });
    assert.deepEqual(dateien, ['inhalte/station.md', 'inhalte/unter/tief.md', 'src/modul.ts']);
    assert.deepEqual(funde.map(formatiereFund), [
      'inhalte/station.md:4:4: „Gate“ → Freigabe',
      'inhalte/station.md:4:9: „G3“ → Freigabe LPH n / LPH 0–9',
      'inhalte/station.md:6:13: „Gate“ → Freigabe',
      'inhalte/station.md:6:18: „<!-- begriffe-erlaubt: -->“ → Zeilenmarke braucht einen Grund: <!-- begriffe-erlaubt: Grund -->',
      'inhalte/unter/tief.md:1:5: „Scope“ → Projektumfang',
      "src/modul.ts:2:25: „Risk“ → Risiko",
    ]);
  });

  test('Kommandozeile: Exitcode 1 bei Funden, 0 ohne', () => {
    const skript = path.join(WURZEL, 'werkzeuge', 'begriffe.mjs');
    const mitFunden = spawnSync(process.execPath, [skript, '--wurzel', FIXTUR, '--liste', path.join(FIXTUR, 'liste.json')], { encoding: 'utf8' });
    assert.equal(mitFunden.status, 1, mitFunden.stderr);
    assert.match(mitFunden.stdout, /^inhalte\/station\.md:4:4: „Gate“ → Freigabe$/m);
    assert.match(mitFunden.stdout, /6 Funde in 3 Dateien \(3 geprüft\)/);

    const ohne = spawnSync(
      process.execPath,
      [skript, '--wurzel', FIXTUR, '--liste', path.join(FIXTUR, 'liste.json'), path.join(FIXTUR, 'inhalte', 'kompass.md')],
      { encoding: 'utf8' },
    );
    assert.equal(ohne.status, 0, ohne.stdout + ohne.stderr);
    assert.match(ohne.stdout, /keine Funde/);
  });
});

describe('begriffe: Glob', () => {
  test('** und * wie erwartet', () => {
    const md = globZuRegExp('inhalte/**/*.md');
    assert.ok(md.test('inhalte/a.md'));
    assert.ok(md.test('inhalte/x/y/a.md'));
    assert.ok(!md.test('inhalte/a.mdx'));
    assert.ok(!md.test('andere/inhalte/a.md'));
    assert.ok(!md.test('inhalte/x/a.yaml'));
    const alles = globZuRegExp('src/generiert/**');
    assert.ok(alles.test('src/generiert/inhalte.json'));
    assert.ok(alles.test('src/generiert/a/b.css'));
    assert.ok(!alles.test('src/stil/a.css'));
    const auswahl = globZuRegExp('src/*.{ts,css}');
    assert.ok(auswahl.test('src/a.ts') && auswahl.test('src/a.css') && !auswahl.test('src/a.md'));
    assert.ok(globZuRegExp('werkzeuge/huelle.html').test('werkzeuge/huelle.html'));
    assert.ok(!globZuRegExp('werkzeuge/huelle.html').test('werkzeuge/huelleXhtml'));
  });
});
