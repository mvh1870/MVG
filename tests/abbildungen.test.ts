// Abbildungen der DOCX V1.2 (P14, O-32, L-77): Schema der Beschreibung, Prüfsumme der Eingabe, Stand der
// Bilder im Repo und ihr Platz im Originaltext. Das Zeichnen selbst braucht Chromium und läuft nur mit
// `node werkzeuge/abbildungen.mjs` (zweimal ausgeführt byte-gleich, siehe Abnahme P14.1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { eingabeSumme, erzeugeAbbildungen, ladeKontext, leseBeschreibungen, pruefeBeschreibung } from '../werkzeuge/abbildungen.mjs';
import { einzeilig } from '../werkzeuge/inhalte.mjs';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');

const KONTEXT = { ids: new Set(['k4-t1', 'k4-p1']), abbildungen: new Map([['abb-6', { id: 'abb-6', datei: 'bilder/image6.png', sha256: 'x' }]]) };
const GUT = {
  id: 'abb-6', quelle: 'bilder/image6.png', titel: 'Titel', alt: 'Alt',
  angeglichen: [{ x: 1, y: 2, b: 30, h: 12, text: 'LPH 0–2', beleg: 'k4-t1', schrift: 'barlow', gewicht: 600 }],
  abweichungen: [{ text: 'Satz.', beleg: 'k4-p1 k4-t1' }],
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
  assert.match(fehler({ ...GUT, abweichungen: [{ text: 'x', beleg: 'k4-p1 k0-p0' }] }), /abweichungen\[0\]: Beleg/u);
});

test('Prüfsumme der Eingabe: ändert sich mit Quelle und Überdeckung, nicht mit Titel, Alternativtext, Abweichungen', () => {
  const a = eingabeSumme(GUT, 'q1');
  assert.equal(eingabeSumme({ ...GUT, titel: 'anders', alt: 'anders', abweichungen: [] }, 'q1'), a);
  assert.equal(eingabeSumme({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], beleg: 'k4-p1' }] }, 'q1'), a, 'der Beleg ändert keine Pixel');
  assert.notEqual(eingabeSumme(GUT, 'q2'), a);
  assert.notEqual(eingabeSumme({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], text: 'LPH 0–3' }] }, 'q1'), a);
  assert.notEqual(eingabeSumme({ ...GUT, angeglichen: [{ ...GUT.angeglichen[0], x: 2 }] }, 'q1'), a);
});

test('Bildunterschrift: zweizeilige Überdeckungen werden zu einem Begriff (Prüfagent abb-2)', () => {
  assert.equal(einzeilig('Risiko- und\nÄnderungs-\nsteuerung'), 'Risiko- und Änderungssteuerung');
  assert.equal(einzeilig('Auswirkungs-\nbewertung'), 'Auswirkungsbewertung');
  assert.equal(einzeilig('MVG-\nNeuinitialisierung'), 'MVG-Neuinitialisierung');
  assert.equal(einzeilig('Komponenten mit\nlanger Lieferzeit'), 'Komponenten mit langer Lieferzeit');
});

test('Repo: jede Inhaltsabbildung hat eine gültige Beschreibung, und jedes Bild ist aktuell (stand.json)', async () => {
  const kontext = ladeKontext(WURZEL);
  const beschreibungen = leseBeschreibungen(WURZEL);
  assert.deepEqual(beschreibungen.map((b) => b.roh.id), [...kontext.abbildungen.keys()], 'abb-2 … abb-14 in der Reihenfolge des Texts');
  for (const { datei, roh } of beschreibungen) assert.deepEqual(pruefeBeschreibung(roh, datei, kontext), [], datei);
  const { fehler } = await erzeugeAbbildungen({ wurzel: WURZEL, pruefe: true });
  assert.deepEqual(fehler, []);
});

test('Originaltext: jede Abbildung steht an ihrer Stelle der DOCX (nach Überschrift bzw. Absatz), die Lernseite zeigt sie höchstens einmal', () => {
  const inhalte = JSON.parse(readFileSync(join(WURZEL, 'src', 'generiert', 'inhalte.json'), 'utf8'));
  const bilder = JSON.parse(readFileSync(join(WURZEL, 'src', 'generiert', 'abbildungen.json'), 'utf8')) as Record<string, string>;
  /** Kennungen (Absatz, Abschnitt, Abbildung) im Originaltext in Lesereihenfolge */
  const folge: string[] = [];
  for (const t of Object.values(inhalte.theorie) as { bloecke: { art: string; felder: Record<string, string> }[] }[]) {
    for (const b of t.bloecke) {
      if (b.art !== 'original') continue;
      for (const m of (b.felder['text'] ?? '').matchAll(/data-(absatz|abschnitt|abbildung)="([^"]+)"/gu)) folge.push(m[2] ?? '');
    }
  }
  for (const a of inhalte.whitepaper.abbildungen as { id: string; ort: string; bild: unknown }[]) {
    assert.ok(a.bild !== null, `${a.id} ohne Bild`);
    assert.match(bilder[a.id] ?? '', /^data:image\/webp;base64,/u, `${a.id}: Bilddaten`);
    const i = folge.indexOf(a.id);
    assert.ok(i > -1, `${a.id} fehlt im Originaltext`);
    // Kapitelanfang: vor dem ersten Absatz; sonst direkt nach der Überschrift bzw. dem Absatz des Orts
    if (/^k\d+$/u.test(a.ort)) assert.ok(i === 0 || !folge.slice(0, i).some((x) => x.startsWith(`${a.ort}-`) || x.startsWith(`${a.ort}.`)), `${a.id}: nicht am Kapitelanfang`);
    else assert.equal(folge[i - 1], a.ort, `${a.id} steht nicht nach ${a.ort}`);
  }
  // Lernseiten: jede Abbildung höchstens einmal
  const text = JSON.stringify(inhalte.theorie);
  for (const a of inhalte.whitepaper.abbildungen as { id: string }[]) {
    const n = [...text.matchAll(new RegExp(`"art":"abbildung"[^}]*?"id":"${a.id}"`, 'gu'))].length;
    assert.ok(n <= 1, `${a.id} ${n}× auf Lernseiten`);
  }
});
