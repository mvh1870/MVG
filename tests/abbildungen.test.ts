// Abbildungen der DOCX V1.2 (P14, O-32, L-77): Schema der Beschreibung, Prüfsumme der Eingabe, Stand der
// Bilder im Repo und ihr Platz im Originaltext. Das Zeichnen selbst braucht Chromium und läuft nur mit
// `node werkzeuge/abbildungen.mjs` (zweimal ausgeführt byte-gleich, siehe Abnahme P14.1).
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eingabeSumme, erzeugeAbbildungen, ladeKontext, leseBeschreibungen, pruefeBeschreibung } from '../werkzeuge/abbildungen.mjs';
import { baueAbbildungen, einzeilig } from '../werkzeuge/inhalte.mjs';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');

const KONTEXT = { ids: new Set(['k4-t1', 'k4-p1']), abbildungen: new Map([['abb-6', { id: 'abb-6', datei: 'bilder/image6.png', sha256: 'x' }]]) };
const GUT = {
  id: 'abb-6', quelle: 'bilder/image6.png', titel: 'Titel', alt: 'Alt',
  angeglichen: [{ x: 1, y: 2, b: 30, h: 12, text: 'LPH 0–2', beleg: 'k4-t1', schrift: 'barlow', gewicht: 600 }],
};

test('Beschreibung: gültige Datei ohne Fehler, jede Abweichung vom Schema wird gemeldet', () => {
  assert.deepEqual(pruefeBeschreibung(GUT, 'inhalte/abbildungen/abb-6.yaml', KONTEXT), []);
  const fehler = (roh: unknown): string => pruefeBeschreibung(roh, 'inhalte/abbildungen/abb-6.yaml', KONTEXT).join('\n');
  assert.match(fehler({ ...GUT, id: 'abb-7' }), /passt nicht zum Dateinamen/u);
  assert.match(fehler({ ...GUT, quelle: 'bilder/image7.png' }), /quelle/u);
  assert.match(fehler({ ...GUT, alt: '' }), /„alt“ fehlt/u);
  assert.match(fehler({ ...GUT, alt: 'x'.repeat(601) }), /länger als 600/u);
  assert.match(fehler({ ...GUT, extra: 1 }), /unbekanntes Feld „extra“/u);
  assert.match(fehler({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], beleg: 'k9-p9' }] }), /keine Absatz-ID/u);
  assert.match(fehler({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], x: -1 }] }), /„x“ keine ganze Zahl/u);
  assert.match(fehler({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], hintergrund: 'rot' }] }), /#rrggbb/u);
  assert.match(fehler({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], schrift: 'arial' }] }), /schrift „arial“/u);
  assert.match(fehler({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], grund: 'x' }] }), /unbekanntes Feld „grund“/u);
  // O-56: „abweichungen“ gibt es nicht mehr – ein Rest in einer Beschreibung fällt auf
  assert.match(fehler({ ...GUT, abweichungen: [{ text: 'x', beleg: 'k4-p1' }] }), /unbekanntes Feld „abweichungen“/u);
});

test('Reine Abdeckung (R72): text "" füllt nur die Fläche – mit Beleg, ohne Schriftangaben; Leerraum allein ist kein Text', () => {
  const fehler = (u: Record<string, unknown>): string => pruefeBeschreibung({ ...GUT, angeglichen: [{ x: 1, y: 2, b: 30, h: 12, beleg: 'k4-t1', ...u }] }, 'inhalte/abbildungen/abb-6.yaml', KONTEXT).join('\n');
  assert.equal(fehler({ text: '' }), '');
  assert.equal(fehler({ text: '', hintergrund: '#ffffff' }), '');
  assert.match(fehler({ text: '', beleg: 'k9-p9' }), /keine Absatz-ID/u, 'auch die Abdeckung braucht den Absatz, der das Entfernte ausschließt');
  assert.match(fehler({ text: '', groesse: 12 }), /„groesse“ bei einer reinen Abdeckung/u);
  assert.match(fehler({ text: '', farbe: '#000000' }), /„farbe“ bei einer reinen Abdeckung/u);
  assert.match(fehler({ text: '   ' }), /nur Leerraum/u);
  assert.match(fehler({}), /„text“ fehlt/u);
  // eine Abdeckung ändert die Pixel: andere Prüfsumme als dieselbe Fläche mit Text
  assert.notEqual(eingabeSumme({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], text: '' }] }, 'q1'), eingabeSumme(GUT, 'q1'));
});

test('Prüfsumme der Eingabe: ändert sich mit Quelle und Überdeckung, nicht mit Titel und Alternativtext', () => {
  const a = eingabeSumme(GUT, 'q1');
  assert.equal(eingabeSumme({ ...GUT, titel: 'anders', alt: 'anders' }, 'q1'), a);
  assert.equal(eingabeSumme({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], beleg: 'k4-p1' }] }, 'q1'), a, 'der Beleg ändert keine Pixel');
  assert.notEqual(eingabeSumme(GUT, 'q2'), a);
  assert.notEqual(eingabeSumme({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], text: 'LPH 0–3' }] }, 'q1'), a);
  assert.notEqual(eingabeSumme({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], x: 2 }] }, 'q1'), a);
});

test('Überdeckung: zweizeilige Überdeckungen werden zu einem Begriff (Prüfagent abb-2)', () => {
  assert.equal(einzeilig('Risiko- und\nÄnderungs-\nsteuerung'), 'Risiko- und Änderungssteuerung');
  assert.equal(einzeilig('Auswirkungs-\nbewertung'), 'Auswirkungsbewertung');
  assert.equal(einzeilig('MVG-\nNeuinitialisierung'), 'MVG-Neuinitialisierung');
  assert.equal(einzeilig('Komponenten mit\nlanger Lieferzeit'), 'Komponenten mit langer Lieferzeit');
  assert.equal(einzeilig('Risiko-/Änderungs-/\nMaßnahmenverknüpfung'), 'Risiko-/Änderungs-/Maßnahmenverknüpfung');
});

test('Repo: jede Inhaltsabbildung hat eine gültige Beschreibung, und jedes Bild ist aktuell (stand.json)', async () => {
  const kontext = ladeKontext(WURZEL);
  const beschreibungen = leseBeschreibungen(WURZEL);
  assert.deepEqual(beschreibungen.map((b) => b.roh.id), [...kontext.abbildungen.keys()], 'abb-2 … abb-14 in der Reihenfolge des Texts');
  for (const { datei, roh } of beschreibungen) assert.deepEqual(pruefeBeschreibung(roh, datei, kontext), [], datei);
  const { fehler } = await erzeugeAbbildungen({ wurzel: WURZEL, pruefe: true });
  assert.deepEqual(fehler, []);
});

test('Themen (O-38): jede der 13 Abbildungen steht genau einmal auf dem Thema ihres Teils, mit Bilddaten', () => {
  const inhalte = JSON.parse(readFileSync(join(WURZEL, 'src', 'generiert', 'inhalte.json'), 'utf8'));
  const bilder = JSON.parse(readFileSync(join(WURZEL, 'src', 'generiert', 'abbildungen.json'), 'utf8')) as Record<string, string>;
  const zahl = new Map<string, number>();
  const gehe = (bloecke: { art: string; id: string | null; kinder?: unknown[] }[]): void => {
    for (const b of bloecke) {
      if (b.art === 'abbildung' && b.id !== null) zahl.set(b.id, (zahl.get(b.id) ?? 0) + 1);
      gehe((b.kinder ?? []) as typeof bloecke);
    }
  };
  for (const t of Object.values(inhalte.theorie) as { bloecke: { art: string; id: string | null; kinder?: unknown[] }[] }[]) gehe(t.bloecke);
  const alle = inhalte.abbildungen as { id: string; bild: unknown }[];
  assert.equal(alle.length, 13);
  for (const a of alle) {
    assert.ok(a.bild !== null, `${a.id} ohne Bild`);
    assert.match(bilder[a.id] ?? '', /^data:image\/webp;base64,/u, `${a.id}: Bilddaten`);
    assert.equal(zahl.get(a.id), 1, `${a.id} steht ${zahl.get(a.id) ?? 0}× auf den Themen`);
  }
});

test('Compiler (baueAbbildungen): veraltetes Bild, fremdes WebP, fremdes Kapitel, doppelt, auf keinem Thema → Fehler (Prüfagent R11)', () => {
  const sha = (x: string | Buffer): string => createHash('sha256').update(x).digest('hex');
  const quelle = {
    abbildungen: [{ id: 'abb-6', kapitel: '4', ort: 'k4', datei: 'bilder/image6.png', sha256: 'q' }],
    nachId: new Map([['k4-t1', { zeilen: [['LPH 0–2', 'Vorbereitung']] }], ['k4-p1', { text: 'Satz.' }]]),
  };
  /** Testwurzel mit Beschreibung, WebP und passendem stand.json; `aendere` verfälscht danach einen Teil */
  const wurzeln: string[] = [];
  after(() => { for (const w of wurzeln) rmSync(w, { recursive: true, force: true }); });
  const wurzel = (aendere: (w: string) => void = () => {}): string => {
    // im System-Temp (R12): läuft auch ohne tmp/ im Repo und räumt hinterher auf
    const w = mkdtempSync(join(tmpdir(), 'mvg-test-abb-'));
    wurzeln.push(w);
    mkdirSync(join(w, 'inhalte', 'abbildungen'), { recursive: true });
    writeFileSync(join(w, 'inhalte', 'abbildungen', 'abb-6.yaml'), 'id: abb-6\nquelle: bilder/image6.png\ntitel: T\nalt: A\nangeglichen:\n  - { x: 1, y: 2, b: 30, h: 12, text: LPH 0–2, beleg: k4-t1 }\n');
    const webp = Buffer.from('RIFF-probe');
    writeFileSync(join(w, 'inhalte', 'abbildungen', 'abb-6.webp'), webp);
    const roh = { id: 'abb-6', quelle: 'bilder/image6.png', angeglichen: [{ x: 1, y: 2, b: 30, h: 12, text: 'LPH 0–2', beleg: 'k4-t1' }] };
    writeFileSync(join(w, 'inhalte', 'abbildungen', 'stand.json'), JSON.stringify({ werkzeug: 1, abbildungen: { 'abb-6': { eingabe: eingabeSumme(roh, 'q'), webp: sha(webp), breite: 30, hoehe: 20 } } }));
    aendere(w);
    return w;
  };
  const lauf = (w: string, theorie: Record<string, unknown>): { fehler: string[]; erg: { liste: { bild: unknown }[]; daten: Record<string, string> } } => {
    const fehler: string[] = [];
    const c = {
      b: { fehler: (ort: string, text: string) => fehler.push(`${ort}: ${text}`) },
      fehler: (ort: string, text: string) => fehler.push(`${ort}: ${text}`),
      inline: (t: string) => t,
    };
    return { fehler, erg: baueAbbildungen(c, quelle, w, theorie, true) };
  };
  const seite = (kapitel: number, quelleName: string) => ({ kapitel, quelle: quelleName, bloecke: [{ art: 'abbildung', id: 'abb-6', kinder: [] }] });
  const gut = lauf(wurzel(), { k04: seite(4, 'k04.md') });
  assert.deepEqual(gut.fehler, []);
  assert.ok(gut.erg.liste[0]?.bild !== null);
  assert.match(gut.erg.daten['abb-6'] ?? '', /^data:image\/webp;base64,/u);
  const alt = (w: string): void => writeFileSync(join(w, 'inhalte', 'abbildungen', 'abb-6.yaml'), readFileSync(join(w, 'inhalte', 'abbildungen', 'abb-6.yaml'), 'utf8').replace('x: 1', 'x: 2'));
  assert.match(lauf(wurzel(alt), { k04: seite(4, 'k04.md') }).fehler.join('\n'), /Bild veraltet/u);
  const fremd = (w: string): void => writeFileSync(join(w, 'inhalte', 'abbildungen', 'abb-6.webp'), 'anders');
  assert.match(lauf(wurzel(fremd), { k04: seite(4, 'k04.md') }).fehler.join('\n'), /passt nicht zu stand\.json/u);
  assert.match(lauf(wurzel(), { k05: seite(5, 'k05.md') }).fehler.join('\n'), /gehört zu Kapitel 4, nicht 5/u);
  assert.match(lauf(wurzel(), { k04: seite(4, 'k04.md'), k04b: seite(4, 'k04b.md') }).fehler.join('\n'), /steht schon auf k04\.md/u);
  assert.match(lauf(wurzel(), {}).fehler.join('\n'), /steht auf keinem Thema/u);
});

// R74 (schwer): abb-12 zeigte fünf erfundene, nummerierte Domänen, der Text sagt „10 MVG-Domänen mit 49 Fragen“
// (k7.1-p2). Bildbereiche mit einer Gliederung, die der Text ausschließt, müssen vollständig überdeckt bleiben –
// geprüft auf einem Raster von Punkten (10 px), jeder Punkt liegt in mindestens einer Überdeckung.
const SPERRFLAECHEN: Record<string, { x: number; y: number; b: number; h: number; grund: string }[]> = {
  'abb-12': [{ x: 26, y: 188, b: 1326, h: 314, grund: 'fünf nummerierte Domänen mit Nachweislisten statt 10 Domänen (k7.1-p2)' }],
  // R75: der einzige Weg „wird zu“ Frühwarnung → Risiko widerspricht V2.4 HB 1.2 (Risiko, Problem, Aufgabe oder geschlossen)
  'abb-10': [
    { x: 132, y: 195, b: 20, h: 105, grund: 'Pfeil Frühwarnung → Risiko (V2.4 HB 1.2: vier Ausgänge)' },
    { x: 172, y: 195, b: 98, h: 76, grund: 'Etikett „wird zu (bestätigt)“ (V2.4 HB 1.2)' },
    // R76: Pfeil Schwellenwert → CTC / Prognose zeigte verkehrt herum (k6.4.3-p2: CTC-Verletzungen erzeugen Frühwarnungen)
    { x: 940, y: 25, b: 310, h: 55, grund: 'rechter Ast des Banners „Schwellenwert löst Frühwarnung aus“ in CTC / Prognose (k6.4.3-p2)' },
    // R76: Pfeil „erzeugt“ Vorlage → Maßnahme ohne Beschluss (V2.4 HB 3.1, k6.4.3-p2)
    { x: 832, y: 425, b: 80, h: 80, grund: 'Pfeil „erzeugt“ von der Vorlage zur Maßnahme (V2.4 HB 3.1)' },
  ],
  // R76: zwei Rollen „A“ in derselben Spalte – je Prozess eine letztverantwortliche Rolle (k6.4.1-p2)
  'abb-8': [{ x: 795, y: 172, b: 20, h: 20, grund: 'zweiter Punkt in Spalte A der RACI-Matrix (k6.4.1-p2)' }],
};

test('Sperrflächen (R74): eine erfundene Gliederung im Bild bleibt ganz überdeckt; Alternativtext ohne fremde Domänenzahl', () => {
  const nachId = new Map(leseBeschreibungen(WURZEL).map((b) => [b.roh.id as string, b.roh]));
  for (const [id, flaechen] of Object.entries(SPERRFLAECHEN)) {
    const ueb = (nachId.get(id)?.angeglichen ?? []) as { x: number; y: number; b: number; h: number }[];
    for (const f of flaechen) {
      const offen: string[] = [];
      for (let px = f.x; px <= f.x + f.b; px += 10) for (let py = f.y; py <= f.y + f.h; py += 10) {
        if (!ueb.some((u) => px >= u.x && px <= u.x + u.b && py >= u.y && py <= u.y + u.h)) offen.push(`${px},${py}`);
      }
      assert.deepEqual(offen.slice(0, 5), [], `${id}: ${f.grund} – nicht überdeckt bei ${offen.length} Punkten`);
    }
  }
  // Alternativtext und Titel: eine Zahl an „Domänen“ ist nur 10 (k7.1-p2), nummerierte Kästen gibt es nicht mehr
  for (const { datei, roh } of leseBeschreibungen(WURZEL)) {
    const text = `${roh.titel} ${roh.alt}`;
    for (const m of text.matchAll(/([\p{L}\p{N}]+)\s+(?:nummerierte[nr]?\s+)?(?:[\p{L}\p{N}]+-)?Domänen/gu)) assert.match(m[1] ?? '', /^(10|zehn|die|der|den)$/iu, `${datei}: „${m[0]}“`);
    assert.doesNotMatch(text, /nummerierte[nr]? Kästen/u, `${datei}: nummerierte Kästen im Alternativtext`);
    assert.doesNotMatch(text, /Frühwarnung \([^)]*wird zu/u, `${datei}: Frühwarnung „wird zu“ Risiko im Alternativtext (V2.4 HB 1.2)`);
    // R76: keine Maßnahme direkt aus der Vorlage, kein Pfeil vom Schwellenwert in CTC; Begriffe wie im Text (O-14)
    assert.doesNotMatch(text, /\(erzeugt\)/u, `${datei}: Vorlage „erzeugt“ Maßnahme im Alternativtext (V2.4 HB 3.1)`);
    assert.doesNotMatch(text, /Frühwarnung \([^)]*\), CTC/u, `${datei}: Schwellenwert → CTC im Alternativtext (k6.4.3-p2)`);
    assert.doesNotMatch(text, /Freigabe-Set|30\/60\/90 Plan|Reifegrad,/u, `${datei}: Bildbegriff statt Begriff des Texts im Alternativtext`);
  }
});
