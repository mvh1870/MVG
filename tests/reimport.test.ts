// Re-Import (P10.3, werkzeuge/reimport.mjs): Vergleich je ID, betroffene Stellen in inhalte/ und src/,
// Bericht, Kommandozeile (--neu, --bericht, --streng).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { betroffeneStellen, bericht, dateienMitIds, haupt } from '../werkzeuge/reimport.mjs';
import { ladeWhitepaper, vergleiche } from '../werkzeuge/whitepaper-lib.mjs';

type Wp = ReturnType<typeof ladeWhitepaper>;
type Abschnitt = Wp['kapitel'][number];

/** V1.2 mit drei Eingriffen: ein Text geändert, ein Block entfernt, ein Abschnittstitel neu. */
function veraendert(): Wp {
  const wp = JSON.parse(JSON.stringify(ladeWhitepaper())) as Wp;
  wp.fassung = 'V1.3';
  const alle = (a: Abschnitt): Abschnitt[] => [a, ...a.abschnitte.flatMap(alle)];
  const abschnitte = wp.kapitel.flatMap(alle);
  const k42 = abschnitte.find((a) => a.nr === '4.2');
  const p3 = k42?.bloecke.find((b) => b.id === 'k4.2-p3');
  assert.ok(k42 && p3);
  p3.text = p3.text.replace('100 TEUR', '150 TEUR');
  k42.titel = `${k42.titel} (neu)`;
  const k53 = abschnitte.find((a) => a.nr === '5.3');
  assert.ok(k53);
  k53.bloecke = k53.bloecke.filter((b) => b.id !== 'k5.3-l1');
  return wp;
}

test('gleiche Fassung: nichts neu, nichts entfallen, nichts geändert', () => {
  const wp = ladeWhitepaper();
  const v = vergleiche(wp, wp);
  assert.deepEqual([v.neu.length, v.entfallen.length, v.geaendert.length], [0, 0, 0]);
});

test('IDs als ganze Wörter; nur geänderte und entfallene zählen', () => {
  const v = { neu: ['k9.9-p1'], entfallen: ['k5.3-l1'], geaendert: [{ id: 'k4.2', alt: 'a', neu: 'b' }, { id: 'k4.2-p3', alt: 'a', neu: 'b' }] };
  const stellen = betroffeneStellen(v, [{ datei: 'x.md', text: 'Zeile eins\n::: zitat k4.2-p3\nsiehe k5.3-l1 und Kap. k4.2.\nk4.21-p3 k14.2-p3 xk4.2-p3 k9.9-p1' }]);
  assert.deepEqual(stellen.map((s) => `${s.zeile}:${s.id}:${s.art}`), ['2:k4.2-p3:geaendert', '3:k5.3-l1:entfallen', '3:k4.2:geaendert']);
});

test('veränderte Fassung: Themen und Zitate werden als betroffen gemeldet; Bericht', () => {
  const alt = ladeWhitepaper();
  const neu = veraendert();
  const v = vergleiche(alt, neu);
  assert.ok(v.geaendert.some((a) => a.id === 'k4.2-p3'));
  assert.ok(v.entfallen.includes('k5.3-l1'));
  const dateien = dateienMitIds();
  assert.ok(dateien.includes('inhalte/theorie/k05-fuehrungsmodell.md'));
  assert.ok(!dateien.some((d) => d.startsWith('src/generiert/')), 'die erzeugte Datei zählt nicht');
  const text = (d: string): string => readFileSync(path.join(import.meta.dirname, '..', d), 'utf8');
  const stellen = betroffeneStellen(v, dateien.map((datei) => ({ datei, text: text(datei) })));
  assert.ok(stellen.some((s) => s.datei === 'inhalte/theorie/k05-fuehrungsmodell.md' && s.id === 'k5.3-l1' && s.art === 'entfallen'));
  assert.ok(stellen.some((s) => s.id === 'k4.2-p3' && s.art === 'geaendert'));
  const b = bericht(alt, neu, v, stellen);
  assert.match(b, /^# Re-Import V1\.2 → V1\.3$/mu);
  assert.match(b, /## Abschnittstitel geändert\n\n- 4\.2: „Mandat“ → „Mandat \(neu\)“/u);
  assert.match(b, /\| inhalte\/theorie\/k05-fuehrungsmodell\.md \| \d+ \| k5\.3-l1 \| entfallen \|/u);
  assert.match(b, /150 TEUR/u);
});

test('Kommandozeile: --neu, --bericht, --streng', () => {
  const ordner = mkdtempSync(path.join(tmpdir(), 'mvg-reimport-'));
  try {
    const neuPfad = path.join(ordner, 'whitepaper.json');
    writeFileSync(neuPfad, JSON.stringify(veraendert()));
    const berichtPfad = path.join(ordner, 'bericht.md');
    const log = console.log;
    console.log = () => {};
    try {
      assert.equal(haupt(['--neu', neuPfad, '--bericht', berichtPfad]), 0);
      assert.equal(haupt(['--neu', neuPfad, '--streng']), 1);
    } finally {
      console.log = log;
    }
    assert.match(readFileSync(berichtPfad, 'utf8'), /Betroffene Stellen in inhalte\/ und src\/: [1-9]/u);
    assert.throws(() => haupt([]), /genau eines/u);
    assert.throws(() => haupt(['--neu', neuPfad, '--docx', 'x']), /genau eines/u);
  } finally {
    rmSync(ordner, { recursive: true, force: true });
  }
});
