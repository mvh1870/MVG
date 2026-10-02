// Reine Lesehilfen der Oberfläche (src/ui/anzeige.ts) und Grafik-Helfer der Theorie.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inhalte } from '../src/inhalte/index.ts';
import { istKarte, kopfKarte, kopfListe, kopfText, kopfZahl, rollenAttr } from '../src/ui/anzeige.ts';
import { idArt } from '../src/grafik/checkliste.ts';
import { FLUSS_POSITIONEN, istFlussPosition } from '../src/grafik/governance-fluss.ts';

test('Kopfdaten lesen und Rollenfarben', () => {
  const kopf = { titel: 'A', zahl: 3, text: '4,5', liste: ['x'], karte: { a: 1 } };
  assert.equal(kopfText(kopf, 'titel'), 'A');
  assert.equal(kopfText(kopf, 'zahl'), '3');
  assert.equal(kopfText(kopf, 'fehlt'), null);
  assert.equal(kopfZahl(kopf, 'text'), 4.5);
  assert.deepEqual(kopfListe(kopf, 'liste'), ['x']);
  assert.deepEqual(kopfKarte(kopf, 'karte'), { a: 1 });
  assert.ok(istKarte(kopf.karte));
  assert.equal(rollenAttr('planung'), 'plan');
  assert.equal(rollenAttr(null), null);
});

test('Prüfliste und Fluss: Kennungen', () => {
  assert.equal(idArt('ENT-017'), 'ent');
  assert.equal(idArt('RIS-014'), 'ris');
  assert.equal(idArt('PRB-004'), 'prb');
  assert.equal(idArt('X-1'), null);
});

test('Vorlage (L-40): ohne Kürzel keine ID-Marke, aria-label nur der Titel; mit Kürzel die Marke', async () => {
  const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string) => { window: Window & typeof globalThis } };
  const w = new JSDOM('<!doctype html><body></body>').window;
  const g = globalThis as unknown as Record<string, unknown>;
  const alt = { document: g['document'], Node: g['Node'] };
  g['document'] = w.document; g['Node'] = w.Node;
  try {
    const { vorlage } = await import('../src/grafik/checkliste.ts');
    const ohne = vorlage({ id: '', titel: 'Vorlage zur Freigabe zum Abschluss von LPH 5', meta: null, frage: w.document.createTextNode('?'), punkte: [] });
    assert.equal(ohne.element.querySelector('.id-marke'), null);
    assert.equal(ohne.element.getAttribute('aria-label'), 'Vorlage zur Freigabe zum Abschluss von LPH 5');
    const mit = vorlage({ id: 'AEN-031', titel: 'Vorlage', meta: null, frage: w.document.createTextNode('?'), punkte: [] });
    assert.equal(mit.element.querySelector('.id-marke')?.getAttribute('data-art'), 'aen');
  } finally {
    g['document'] = alt.document; g['Node'] = alt.Node;
    w.close();
  }
  assert.equal(FLUSS_POSITIONEN.length, 7);
  assert.ok(istFlussPosition('entscheidung'));
  assert.ok(!istFlussPosition('irgendwo'));
});

test('R64: jeder lange Rollentitel trennt nur an einer Fuge (Rollen-Linse, RACI-Kopf)', async () => {
  const { mitRollenfugen } = await import('../src/ui/h.ts');
  const titel = Object.values(inhalte.rollen).flatMap((r) => [r.titel, r.kurztitel]);
  assert.ok(titel.length >= 12);
  // ein Wort ab 13 Buchstaben bräche in der schmalen Rollen-Linse (Chip 100 px) mitten im Wort
  const ohneFuge = titel.flatMap((t) => mitRollenfugen(t).split(/[^\p{L}­]+/u)).filter((w) => w.length >= 13 && !w.includes('­'));
  assert.deepEqual(ohneFuge, []);
  assert.equal(mitRollenfugen('Geschäftsführung (GML)'), 'Geschäfts­führung (GML)');
  assert.equal(mitRollenfugen('Bauherren-Projektleitung'), 'Bauherren-Projekt­leitung');
  for (const t of titel) assert.equal(mitRollenfugen(t).replace(/­/gu, ''), t);
});
