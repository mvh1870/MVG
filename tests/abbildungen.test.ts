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
  // Lernseiten: jede Abbildung höchstens einmal (strukturell über die Blöcke gezählt)
  const zahl = new Map<string, number>();
  const gehe = (bloecke: { art: string; id: string | null; kinder?: unknown[] }[]): void => {
    for (const b of bloecke) {
      if (b.art === 'abbildung' && b.id !== null) zahl.set(b.id, (zahl.get(b.id) ?? 0) + 1);
      gehe((b.kinder ?? []) as typeof bloecke);
    }
  };
  for (const t of Object.values(inhalte.theorie) as { bloecke: { art: string; id: string | null; kinder?: unknown[] }[] }[]) gehe(t.bloecke);
  assert.equal(zahl.size, 10, 'zehn Abbildungen auf Lernseiten (abb-10, abb-12, abb-13 nur im Originaltext, L-77, L-82)');
  for (const [id, n] of zahl) assert.equal(n, 1, `${id} ${n}× auf Lernseiten`);
});

test('Compiler (baueAbbildungen): veraltetes Bild, fremdes WebP, fremdes Kapitel, doppelt, ohne Originaltext → Fehler (Prüfagent R11)', () => {
  const sha = (x: string | Buffer): string => createHash('sha256').update(x).digest('hex');
  const quelle = {
    abbildungen: [{ id: 'abb-6', kapitel: '4', ort: 'k4', datei: 'bilder/image6.png', sha256: 'q' }],
    nachId: new Map([['k4-t1', {}], ['k4-p1', {}]]),
  };
  /** Testwurzel mit Beschreibung, WebP und passendem stand.json; `aendere` verfälscht danach einen Teil */
  const wurzeln: string[] = [];
  after(() => { for (const w of wurzeln) rmSync(w, { recursive: true, force: true }); });
  const wurzel = (aendere: (w: string) => void = () => {}): string => {
    // im System-Temp (R12): läuft auch ohne tmp/ im Repo und räumt hinterher auf
    const w = mkdtempSync(join(tmpdir(), 'mvg-test-abb-'));
    wurzeln.push(w);
    mkdirSync(join(w, 'inhalte', 'abbildungen'), { recursive: true });
    writeFileSync(join(w, 'inhalte', 'abbildungen', 'abb-6.yaml'), 'id: abb-6\nquelle: bilder/image6.png\ntitel: T\nalt: A\nangeglichen:\n  - { x: 1, y: 2, b: 30, h: 12, text: LPH 0–2, beleg: k4-t1 }\nabweichungen:\n  - { text: Satz, beleg: k4-p1 }\n');
    const webp = Buffer.from('RIFF-probe');
    writeFileSync(join(w, 'inhalte', 'abbildungen', 'abb-6.webp'), webp);
    const roh = { id: 'abb-6', quelle: 'bilder/image6.png', angeglichen: [{ x: 1, y: 2, b: 30, h: 12, text: 'LPH 0–2', beleg: 'k4-t1' }] };
    writeFileSync(join(w, 'inhalte', 'abbildungen', 'stand.json'), JSON.stringify({ werkzeug: 1, abbildungen: { 'abb-6': { eingabe: eingabeSumme(roh, 'q'), webp: sha(webp), breite: 30, hoehe: 20 } } }));
    aendere(w);
    return w;
  };
  const lauf = (w: string, theorie: Record<string, unknown>, imOriginal = true): { fehler: string[]; erg: { liste: { bild: unknown }[]; daten: Record<string, string> } } => {
    const fehler: string[] = [];
    const c = {
      b: { fehler: (ort: string, text: string) => fehler.push(`${ort}: ${text}`) },
      fehler: (ort: string, text: string) => fehler.push(`${ort}: ${text}`),
      inline: (t: string) => t,
      abbImOriginal: new Set(imOriginal ? ['abb-6'] : []),
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
  assert.match(lauf(wurzel(), { k04: seite(4, 'k04.md') }, false).fehler.join('\n'), /steht in keinem Originaltext/u);
});
