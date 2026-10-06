// Werkzeuge von P0.3: Logo-Vektorisierung, PNG-Lesen/Schreiben, Schriften-Einbettung.
// Deterministisch und gegen die Quellen geprüft (Logo neu gezeichnet und mit quellen/marke verglichen).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { alphaKanal, dekodierePng, erzeugeLogo, findeTrennfuge, kodierePngGrau, QUELLE } from '../werkzeuge/logo.mjs';
import { erzeugeSchriften, SCHRIFTEN, schriftenCss, UNTERMENGEN } from '../werkzeuge/schriften.mjs';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pfad = (p: string) => resolve(WURZEL, p);

test('PNG: Original lesen (698 × 937, RGBA) und Graustufen-PNG verlustfrei zurücklesen', () => {
  const bild = dekodierePng(readFileSync(pfad(QUELLE)));
  assert.equal(bild.breite, 698);
  assert.equal(bild.hoehe, 937);
  assert.equal(bild.rgba.length, 698 * 937 * 4);
  const grau = new Uint8Array(7 * 5).map((_, i) => (i * 37) % 256);
  const zurueck = dekodierePng(kodierePngGrau(7, 5, grau));
  assert.equal(zurueck.breite, 7);
  assert.deepEqual([...alphaKanal(zurueck)], new Array(35).fill(255));
  assert.deepEqual([...zurueck.rgba].filter((_, i) => i % 4 === 0), [...grau]);
});

test('Logo: Trennfuge zwischen Bildmarke und Wortmarke liegt unter dem Brückenbogen', () => {
  const bild = dekodierePng(readFileSync(pfad(QUELLE)));
  const fuge = findeTrennfuge(alphaKanal(bild), bild.breite, bild.hoehe);
  assert.ok(fuge);
  assert.ok(fuge.von > 600 && fuge.bis < 760 && fuge.bis - fuge.von >= 20, JSON.stringify(fuge));
});

test('Logo: quellen/marke ist aktuell – neu gezeichnet byte-gleich, currentColor, ein Pfad', async () => {
  const ziel = 'tmp/test-stil-logo';
  try {
    const erg = await erzeugeLogo({ ziel });
    assert.equal(erg.dateien.length, 3);
    for (const name of ['logo-bm.svg', 'logo-bm-bildmarke.svg']) {
      const neu = readFileSync(pfad(`${ziel}/${name}`), 'utf8');
      const alt = readFileSync(pfad(`quellen/marke/${name}`), 'utf8');
      assert.equal(neu, alt, `${name} weicht ab – node werkzeuge/logo.mjs ausführen`);
      assert.match(alt, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 \d+ \d+" width="\d+" height="\d+" fill="currentColor" role="img" aria-label="[^"]+"><title>/);
      assert.equal(alt.match(/<path /g)?.length, 1);
      assert.doesNotMatch(alt, /#[0-9a-f]{3,6}|rgb\(|stroke=/i);
    }
    assert.deepEqual(readFileSync(pfad(`${ziel}/logo-original.png`)), readFileSync(pfad(QUELLE)));
    assert.deepEqual(readFileSync(pfad('quellen/marke/logo-original.png')), readFileSync(pfad(QUELLE)));
  } finally {
    rmSync(pfad(ziel), { recursive: true, force: true });
  }
});

test('Schriften: nur die Schnitte der Variante B, latin + latin-ext, unicode-range aus @fontsource', async () => {
  const { css, eintraege } = await schriftenCss();
  const erwartet = SCHRIFTEN.reduce((n, s) => n + s.gewichte.length, 0) * UNTERMENGEN.length;
  assert.equal(eintraege.length, erwartet);
  assert.equal(css.match(/@font-face/g)?.length, erwartet);
  assert.deepEqual(
    SCHRIFTEN.map((s) => `${s.familie}:${s.gewichte.map((g) => g.gewicht).join(',')}`),
    ['Big Shoulders Display:800', 'Barlow Condensed:500,600,700'],
  );
  assert.doesNotMatch(css, /url\((?!data:font\/woff2;base64,)/);
  assert.doesNotMatch(css, /font-style:\s*italic/);
  assert.equal(css.match(/font-display: swap;/g)?.length, erwartet);
  for (const s of SCHRIFTEN) {
    const bereiche = JSON.parse(readFileSync(pfad(`node_modules/@fontsource/${s.paket}/unicode.json`), 'utf8')) as Record<string, string>;
    for (const { gewicht } of s.gewichte) {
      for (const u of UNTERMENGEN) {
        const block = css.split('@font-face').find((b) => b.includes(`font-family: '${s.familie}'`) && b.includes(`font-weight: ${gewicht};`) && b.includes(`unicode-range: ${bereiche[u]};`));
        assert.ok(block, `${s.familie} ${gewicht} ${u}`);
      }
    }
  }
});

test('Schriften: deterministisch und in das angegebene Ziel geschrieben', async () => {
  const ziel = 'tmp/test-stil-schriften/schriften.css';
  try {
    const a = await erzeugeSchriften({ ziel });
    const inhaltA = readFileSync(a.ziel, 'utf8');
    const b = await erzeugeSchriften({ ziel });
    assert.equal(readFileSync(b.ziel, 'utf8'), inhaltA);
    assert.equal(a.bytes, Buffer.byteLength(inhaltA));
    assert.ok(a.bytes < 800 * 1024, `Schriften ${a.bytes} Bytes – Budget 4 MB für die ganze Datei`);
  } finally {
    rmSync(pfad('tmp/test-stil-schriften'), { recursive: true, force: true });
  }
});
