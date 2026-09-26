// Import-Werkzeug (P0.2/P10.3): Determinismus, Aktualität der Repo-Dateien, Kommandozeile mit
// --ziel/--vergleich/--pruefe, Vergleich je ID und die kleinen Bausteine (ZIP, XML, Bereinigung).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync, crc32 } from 'node:zlib';
import {
  STANDARD_DOCX,
  bereinige,
  erzeuge,
  glossarId,
  leseZip,
  parseXml,
  vergleichsBericht,
} from '../werkzeuge/whitepaper-import.mjs';
import { findeBlock, ladeWhitepaper, vergleiche } from '../werkzeuge/whitepaper-lib.mjs';

const WERKZEUG = fileURLToPath(new URL('../werkzeuge/whitepaper-import.mjs', import.meta.url));
const ORDNER = path.dirname(STANDARD_DOCX);

/** Werkzeug als eigener Prozess; liefert Exit-Code und Ausgaben. */
function starte(argumente: string[]): Promise<{ code: number | null, aus: string, fehler: string }> {
  return new Promise((erfuellt, abgelehnt) => {
    const kind = spawn(process.execPath, [WERKZEUG, ...argumente]);
    let aus = '';
    let fehler = '';
    kind.stdout.setEncoding('utf8').on('data', (d: string) => { aus += d; });
    kind.stderr.setEncoding('utf8').on('data', (d: string) => { fehler += d; });
    kind.on('error', abgelehnt);
    kind.on('close', (code) => erfuellt({ code, aus, fehler }));
  });
}

const erster = erzeuge(STANDARD_DOCX);

test('Determinismus: zweimal importieren ergibt byte-gleiche Dateien', () => {
  const zweiter = erzeuge(STANDARD_DOCX);
  assert.equal(zweiter.json, erster.json);
  assert.equal(zweiter.markdown, erster.markdown);
  assert.ok(!/\d{4}-\d{2}-\d{2}T\d{2}:/.test(erster.json), 'Zeitstempel in der Ausgabe');
});

test('Repo-Dateien sind aktuell (gleich dem frischen Import der DOCX)', () => {
  assert.equal(readFileSync(path.join(ORDNER, 'whitepaper.json'), 'utf8'), erster.json);
  assert.equal(readFileSync(path.join(ORDNER, 'whitepaper.md'), 'utf8'), erster.markdown);
  assert.deepEqual(erster.ergebnis.hinweise, []);
});

test('Kommandozeile: --ziel schreibt byte-gleich, --vergleich meldet keine Änderung, --pruefe erkennt Veraltetes', async () => {
  const ziel = mkdtempSync(path.join(tmpdir(), 'mvg-whitepaper-'));
  try {
    const lauf = await starte(['--ziel', ziel, '--vergleich', path.join(ORDNER, 'whitepaper.json')]);
    assert.equal(lauf.code, 0, lauf.fehler);
    assert.match(lauf.aus, /V1\.2: 13 Kapitel, 55 Abschnitte, \d+ Blöcke, 32 Glossareinträge, 13 Abbildungen; Gegenprobe mammoth vollständig/);
    assert.match(lauf.aus, /neu 0 · entfallen 0 · geändert 0/);
    assert.equal(readFileSync(path.join(ziel, 'whitepaper.json'), 'utf8'), erster.json);
    assert.equal(readFileSync(path.join(ziel, 'whitepaper.md'), 'utf8'), erster.markdown);
    for (const abb of ladeWhitepaper(path.join(ziel, 'whitepaper.json')).abbildungen) {
      assert.ok(readFileSync(path.join(ziel, abb.datei)).equals(readFileSync(path.join(ORDNER, abb.datei))), abb.datei);
    }
    writeFileSync(path.join(ziel, 'whitepaper.md'), `${erster.markdown}\nvon Hand ergänzt\n`);
    const pruefung = await starte(['--pruefe', '--ziel', ziel]);
    assert.equal(pruefung.code, 1);
    assert.match(pruefung.fehler, /veraltet: .*whitepaper\.md/);
    assert.equal(readFileSync(path.join(ziel, 'whitepaper.md'), 'utf8'), `${erster.markdown}\nvon Hand ergänzt\n`, '--pruefe schreibt nicht');
  } finally {
    rmSync(ziel, { recursive: true, force: true });
  }
});

test('Kommandozeile: unbekanntes Argument ist ein Fehler', async () => {
  const lauf = await starte(['--unbekannt']);
  assert.equal(lauf.code, 1);
  assert.match(lauf.fehler, /unbekanntes Argument --unbekannt/);
});

test('vergleiche/vergleichsBericht: neu, entfallen, geändert je ID (Grundlage Re-Import)', () => {
  const alt = ladeWhitepaper();
  assert.deepEqual(vergleiche(alt, alt), { neu: [], entfallen: [], geaendert: [] });

  const neu = ladeWhitepaper();
  neu.fassung = 'V1.3';
  const k42 = neu.kapitel[3]?.abschnitte[1];
  assert.equal(k42?.nr, '4.2');
  const p3 = findeBlock(neu, 'k4.2-p3');
  assert.ok(p3);
  p3.text = p3.text.replace('100 TEUR eigenständig', '150 TEUR eigenständig');
  // Nur Leerraum geändert: zählt nicht als Änderung.
  const p1 = findeBlock(neu, 'k4.2-p1');
  assert.ok(p1);
  p1.text = p1.text.replace(' ', '  ');
  // Absatz in 4.1 entfällt, ein neuer Absatz in 4.6 kommt hinzu, Abschnittstitel 4.3 ändert sich.
  const k41 = neu.kapitel[3]?.abschnitte[0];
  k41?.bloecke.splice(1, 1);
  neu.kapitel[3]?.abschnitte[5]?.bloecke.push({ id: 'k4.6-p3', art: 'absatz', text: 'Neuer Absatz.' });
  const k43 = neu.kapitel[3]?.abschnitte[2];
  if (k43) k43.titel = 'Wesentliche Entscheidungen';

  const v = vergleiche(alt, neu);
  assert.deepEqual(v.neu, ['k4.6-p3']);
  assert.deepEqual(v.entfallen, ['k4.1-p2']);
  assert.deepEqual(v.geaendert.map((g) => g.id), ['k4.2-p3', 'k4.3']);
  assert.equal(v.geaendert[0]?.neu, p3.text);

  const bericht = vergleichsBericht(alt, neu);
  assert.match(bericht, /^Vergleich V1\.2 \(\w{12}\) → V1\.3/);
  assert.match(bericht, /neu 1 · entfallen 1 · geändert 2/);
  assert.match(bericht, /~ k4\.2-p3\n\s+….*\[100 → 150\]/);
  assert.match(bericht, /\+ k4\.6-p3 {2}Neuer Absatz\./);
});

test('vergleichsBericht erkennt verschobene Absätze', () => {
  const alt = ladeWhitepaper();
  const neu = ladeWhitepaper();
  const k41 = neu.kapitel[3]?.abschnitte[0];
  assert.ok(k41);
  // Neuer erster Absatz: der alte k4.1-p1 steht jetzt unter k4.1-p2, der alte k4.1-p2 unter k4.1-p3.
  const texte = k41.bloecke.map((b) => b.text);
  k41.bloecke = ['Eingeschobener Absatz.', ...texte].map((text, i) => ({ id: `k4.1-p${i + 1}`, art: 'absatz' as const, text }));
  const bericht = vergleichsBericht(alt, neu);
  assert.match(bericht, /~ k4\.1-p1 {2}\(alter Text jetzt unter k4\.1-p2\)/);
  assert.match(bericht, /\+ k4\.1-p3/);
});

test('bereinige: weiches Trennzeichen entfällt, vor manuellem Umbruch verbindet es das Wort', () => {
  assert.equal(bereinige('Entscheidungs­\nreife'), 'Entscheidungsreife');
  assert.equal(bereinige('  Verantwortungs­modell  '), 'Verantwortungsmodell');
  assert.equal(bereinige('werden. \nZugleich'), 'werden. \nZugleich');
  assert.equal(bereinige('\n„Zitat“ – Ende\n'), '„Zitat“ – Ende');
});

test('glossarId: ASCII-Umschrift', () => {
  assert.equal(glossarId('Frühwarnung'), 'g-fruehwarnung');
  assert.equal(glossarId('Leistungsphasen- und Freigabemodell LPH 0–9'), 'g-leistungsphasen-und-freigabemodell-lph-0-9');
  assert.equal(glossarId('Maßnahme'), 'g-massnahme');
});

test('parseXml: Entitäten, Attribute, leere Elemente, Wohlgeformtheit', () => {
  const doc = parseXml('<?xml version="1.0"?><a x="1 &amp; 2" y=\'&quot;\'><b/><t xml:space="preserve"> &lt;&#228;&#x2013;&gt; </t><!-- k --></a>');
  const a = doc.kinder[0];
  assert.ok(a && typeof a !== 'string');
  assert.equal(a.name, 'a');
  assert.deepEqual(a.attrs, { x: '1 & 2', y: '"' });
  const [b, t] = a.kinder;
  assert.ok(b && typeof b !== 'string' && b.name === 'b' && b.kinder.length === 0);
  assert.ok(t && typeof t !== 'string');
  assert.deepEqual(t.kinder, [' <ä–> ']);
  assert.throws(() => parseXml('<a><b></a>'), /schließt/);
  assert.throws(() => parseXml('<a>'), /nicht geschlossen/);
});

test('leseZip: gespeicherte und komprimierte Einträge, CRC-Prüfung', () => {
  const eintraege: { name: string, daten: Buffer, methode: number }[] = [
    { name: 'a.txt', daten: Buffer.from('gespeichert'), methode: 0 },
    { name: 'word/b.xml', daten: Buffer.from('<x>komprimiert komprimiert komprimiert</x>'), methode: 8 },
  ];
  const lokal: Buffer[] = [];
  const zentral: Buffer[] = [];
  let versatz = 0;
  for (const e of eintraege) {
    const name = Buffer.from(e.name);
    const nutzlast = e.methode === 8 ? deflateRawSync(e.daten) : e.daten;
    const kopf = Buffer.alloc(30);
    kopf.writeUInt32LE(0x04034b50, 0);
    kopf.writeUInt16LE(e.methode, 8);
    kopf.writeUInt32LE(crc32(e.daten), 14);
    kopf.writeUInt32LE(nutzlast.length, 18);
    kopf.writeUInt32LE(e.daten.length, 22);
    kopf.writeUInt16LE(name.length, 26);
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(e.methode, 10);
    cd.writeUInt32LE(crc32(e.daten), 16);
    cd.writeUInt32LE(nutzlast.length, 20);
    cd.writeUInt32LE(e.daten.length, 24);
    cd.writeUInt16LE(name.length, 28);
    cd.writeUInt32LE(versatz, 42);
    lokal.push(kopf, name, nutzlast);
    zentral.push(cd, name);
    versatz += kopf.length + name.length + nutzlast.length;
  }
  const cdGroesse = zentral.reduce((s, b) => s + b.length, 0);
  const ende = Buffer.alloc(22);
  ende.writeUInt32LE(0x06054b50, 0);
  ende.writeUInt16LE(eintraege.length, 8);
  ende.writeUInt16LE(eintraege.length, 10);
  ende.writeUInt32LE(cdGroesse, 12);
  ende.writeUInt32LE(versatz, 16);
  const zip = Buffer.concat([...lokal, ...zentral, ende]);
  const dateien = leseZip(zip);
  assert.deepEqual([...dateien.keys()], ['a.txt', 'word/b.xml']);
  assert.equal(dateien.get('word/b.xml')?.toString(), '<x>komprimiert komprimiert komprimiert</x>');
  const kaputt = Buffer.from(zip);
  kaputt[30 + 5] = 0x58; // ein Byte im gespeicherten Inhalt von a.txt verfälschen
  assert.throws(() => leseZip(kaputt), /CRC/);
  assert.throws(() => leseZip(Buffer.from('keine docx')), /Ende des zentralen Verzeichnisses/);
});
