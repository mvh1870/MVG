// Themen als Buch (P17.8, O-54): Fortschrittslogik (src/ui/themen-fortschritt.ts) mit Gegenproben und das
// Inhaltsverzeichnis im DOM (jsdom): Teile I–IV und Anhang, Nummern in Leserichtung, Häkchen nach Beantworten,
// Seitenende bei Themen ohne Verständnisfragen, Zurücksetzen, ohne Speicher keine Störung.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AKZENT_ROLLEN } from '../src/stil/akzente.ts';
import type { Block, TheorieSeite, TheorieTeil } from '../src/inhalte/typen.ts';
import {
  FORTSCHRITT_SCHLUESSEL, istGeschafft, ladeFortschritt, leererFortschritt, leseFortschritt, loescheFortschritt, mitAntwort, mitGelesen,
  speichereFortschritt, verstaendnisfragen, zaehle, type SpeicherGriff,
} from '../src/ui/themen-fortschritt.ts';

/* ----------------------------------------------------------------- Logik -- */

const block = (art: string, id: string | null, kinder: Block[] = []): Block => ({ art, kennungen: id === null ? [] : [id], id, kopf: {}, felder: {}, liste: null, kinder });
const seite = (thema: string, teil: TheorieTeil, bloecke: Block[]): TheorieSeite => ({
  id: thema, kapitel: 1, thema, reihe: 1, titel: thema, kurztitel: thema, nr: 1, teil, kurzsatz: '', symbol: 'buch', deckt: [], werkzeuge: [], einleitung: '', bloecke, quelle: '',
});
const ZWEI = seite('zwei', 1, [block('kernaussage', null), block('abschnitt', 'k1.1', [block('wissenscheck', 'a')]), block('wissenscheck', 'b')]);
const OHNE = seite('ohne', 1, [block('kernaussage', null)]);
const EBENE = seite('ebene', 2, [{ ...block('ebenen', null), ebenen: [{ nr: 1, titel: 'E', felder: {}, bloecke: [block('wissenscheck', 'tief')] }] }]);
const ANHANG = seite('glossar', 'anhang', []);

function speicher(): SpeicherGriff & { daten: Map<string, string> } {
  const daten = new Map<string, string>();
  return { daten, getItem: (k) => daten.get(k) ?? null, setItem: (k, v) => { daten.set(k, v); }, removeItem: (k) => { daten.delete(k); } };
}
const gesperrt: SpeicherGriff = {
  getItem: () => { throw new Error('gesperrt'); },
  setItem: () => { throw new Error('gesperrt'); },
  removeItem: () => { throw new Error('gesperrt'); },
};

test('Fortschritt: geschafft erst, wenn alle Verständnisfragen beantwortet sind (Gegenprobe: eine fehlt → nicht geschafft)', () => {
  assert.deepEqual(verstaendnisfragen(ZWEI), ['a', 'b']);
  assert.deepEqual(verstaendnisfragen(EBENE), ['tief'], 'auch in Ebenen');
  let f = leererFortschritt();
  assert.equal(istGeschafft(ZWEI, f), false);
  f = mitAntwort(f, 'zwei', 'a');
  assert.equal(istGeschafft(ZWEI, f), false, 'Gegenprobe: eine von zwei Fragen genügt nicht');
  assert.equal(mitAntwort(f, 'zwei', 'a'), f, 'doppelte Antwort ändert nichts');
  f = mitAntwort(f, 'zwei', 'b');
  assert.equal(istGeschafft(ZWEI, f), true);
  assert.equal(istGeschafft(EBENE, f), false, 'Antworten gelten nur für ihr Thema');
  // das Seitenende zählt nicht für Themen mit Fragen
  assert.equal(istGeschafft(EBENE, mitGelesen(f, EBENE)), false);
  // r73: und speichert nichts (Datenschutz nennt nur Themen ohne Fragen)
  assert.equal(mitGelesen(f, EBENE), f, 'Thema mit Fragen: Stand unverändert');
  assert.equal(mitGelesen(f, ZWEI), f, 'Thema mit Fragen: Stand unverändert');
});

test('Fortschritt: Themen ohne Verständnisfragen gelten mit dem Seitenende als geschafft; der Anhang zählt nie', () => {
  const f = leererFortschritt();
  assert.equal(istGeschafft(OHNE, f), false);
  assert.equal(istGeschafft(OHNE, mitGelesen(f, OHNE)), true);
  assert.equal(istGeschafft(ANHANG, mitGelesen(f, ANHANG)), false);
  const z = zaehle([ZWEI, OHNE, EBENE, ANHANG], mitGelesen(mitAntwort(f, 'ebene', 'tief'), OHNE));
  assert.deepEqual(z.gesamt, { geschafft: 2, gesamt: 3 });
  assert.deepEqual(z.teile[1], { geschafft: 1, gesamt: 2 });
  assert.deepEqual(z.teile[2], { geschafft: 1, gesamt: 1 });
  assert.deepEqual(z.teile[3], { geschafft: 0, gesamt: 0 });
});

test('Fortschritt im Speicher: eigener Schlüssel, versioniert, Fremdes und Kaputtes → leer; gesperrter Speicher stört nicht', () => {
  const sp = speicher();
  const f = mitGelesen(mitAntwort(leererFortschritt(), 'zwei', 'a'), OHNE);
  speichereFortschritt(sp, f);
  assert.deepEqual([...sp.daten.keys()], [FORTSCHRITT_SCHLUESSEL]);
  assert.equal(FORTSCHRITT_SCHLUESSEL, 'gk.theorie');
  assert.deepEqual(JSON.parse(sp.daten.get(FORTSCHRITT_SCHLUESSEL) ?? ''), { v: 1, antworten: { zwei: ['a'] }, gelesen: ['ohne'] });
  assert.deepEqual(ladeFortschritt(sp), f);
  // Gegenproben: andere Fassung, kaputtes JSON, falsche Formen
  assert.deepEqual(leseFortschritt({ v: 2, antworten: { zwei: ['a'] }, gelesen: [] }), leererFortschritt());
  sp.daten.set(FORTSCHRITT_SCHLUESSEL, '{kaputt');
  assert.deepEqual(ladeFortschritt(sp), leererFortschritt());
  assert.deepEqual(leseFortschritt({ v: 1, antworten: { zwei: 'a', 'X Y': ['a'], drei: [1, 'b', 'b'] }, gelesen: [null, 'ohne'] }), { antworten: { drei: ['b'] }, gelesen: ['ohne'] });
  loescheFortschritt(sp);
  assert.equal(sp.daten.size, 0);
  // ohne Speicher oder gesperrt: kein Wurf, leerer Stand
  assert.deepEqual(ladeFortschritt(null), leererFortschritt());
  assert.deepEqual(ladeFortschritt(gesperrt), leererFortschritt());
  assert.doesNotThrow(() => { speichereFortschritt(gesperrt, f); loescheFortschritt(gesperrt); speichereFortschritt(null, f); });
});

/* ------------------------------------------------------------------ jsdom -- */

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///mvg.html' });
const g = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLParagraphElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) g[k] = (dom.window as unknown as Record<string, unknown>)[k];
after(() => dom.window.close());

const { inhalte } = await import('../src/inhalte/index.ts');
const { baueTheorie, themen } = await import('../src/ui/flaechen/theorie.ts');
const { W } = await import('../src/ui/woerter.ts');
const T = W.themen;
const VERSION = 'Fassung 0.2';

test('Inhaltsverzeichnis: vier Teile in Farbe und der Anhang, Nummern 1 … in Leserichtung, Symbol, Kurzsatz; kein „Kapitel“', () => {
  const el = baueTheorie({ inhalte, thema: null, version: VERSION, bedienbar: true, speicher: speicher() });
  const teile = [...el.querySelectorAll<HTMLElement>('.buch-teil')];
  assert.deepEqual(teile.map((t) => t.dataset['teil']), ['1', '2', '3', '4', 'anhang']);
  assert.deepEqual(teile.map((t) => t.querySelector('.buch-teil-name')?.textContent), [T.teilName[1], T.teilName[2], T.teilName[3], T.teilName[4], T.glossar]);
  // Farben je Teil aus theorie.css, gleich den festen Rollen (L-226: I Grün, II Lagune, III Orange, IV Violett)
  const css = readFileSync(new URL('../src/stil/theorie.css', import.meta.url), 'utf8');
  for (const n of [1, 2, 3, 4] as const) {
    const ton = AKZENT_ROLLEN[`teil${n}`];
    assert.ok(css.includes(`:is(.seite-theorie, .druck-bogen) [data-teil="${n}"] { --teil: var(--akzent-${ton}); --teil-soft: var(--akzent-${ton}-soft); --teil-text: var(--akzent-${ton}-text); }`), `Teil ${n}: ${ton}`);
  }
  assert.deepEqual([AKZENT_ROLLEN.teil1, AKZENT_ROLLEN.teil2, AKZENT_ROLLEN.teil3, AKZENT_ROLLEN.teil4], ['gruen', 'lagune', 'orange', 'violett']);
  const zeilen = [...el.querySelectorAll<HTMLElement>('.buch-zeile')];
  const alle = themen(inhalte);
  assert.equal(zeilen.length, alle.length);
  assert.deepEqual(zeilen.map((z) => z.querySelector('.buch-nr')?.textContent), alle.map((_, i) => String(i + 1)));
  assert.deepEqual(zeilen.map((z) => z.getAttribute('href')), alle.map((t) => `#theorie/${t.thema}`));
  for (const z of zeilen) {
    assert.ok(z.querySelector('.buch-symbol svg'), 'Symbol');
    assert.ok((z.querySelector('.buch-satz')?.textContent ?? '').length > 10, 'Kurzsatz');
  }
  assert.equal(alle.at(-1)?.thema, 'glossar', 'Glossar als Anhang am Ende');
  assert.equal(el.querySelector('[data-haken="glossar"]'), null, 'der Anhang hat kein Häkchen');
  assert.doesNotMatch(el.textContent ?? '', /Kapitel/u);
  assert.equal(el.querySelector('[data-balken="gesamt"] .fortschritt-zahl')?.textContent, T.geschafftZahl(0, alle.length - 1));
  // Leinwand: dieselbe Gliederung, ohne Fortschritt und ohne Bedienbares
  const lw = baueTheorie({ inhalte, thema: null, version: VERSION, bedienbar: false });
  assert.equal(lw.querySelectorAll('.buch-teil').length, 5);
  assert.equal(lw.querySelectorAll('[data-balken], [data-haken], a, button').length, 0);
});

test('Fortschritt im DOM: Antwort → Häkchen in Verzeichnis und Übersicht, Balken je Teil; Zurücksetzen löscht', () => {
  const sp = speicher();
  const mitFrage = themen(inhalte).find((t) => t.teil === 2 && verstaendnisfragen(t).length > 0);
  assert.ok(mitFrage);
  const s = baueTheorie({ inhalte, thema: mitFrage.thema, version: VERSION, bedienbar: true, speicher: sp });
  document.body.replaceChildren(s);
  // Kopf und Blättern tragen die Nummer, der Kicker den Teil
  assert.equal(s.querySelector('[data-pruef="thema-nr"]')?.textContent, `${mitFrage.nr} · `);
  assert.equal(s.querySelector('[data-pruef="thema-teil"]')?.textContent, `${T.teil(2)} · ${T.teilName[2]}`);
  assert.match(s.querySelector('.kapitel-nav [rel="next"] b')?.textContent ?? '', new RegExp(`^${mitFrage.nr + 1} · `, 'u'));
  const marke = s.querySelector<HTMLElement>(`.kapitel-verzeichnis [data-haken="${mitFrage.thema}"]`);
  assert.ok(marke);
  assert.equal(marke.hidden, true);
  const fragen = [...s.querySelectorAll('.wissenscheck')];
  assert.equal(fragen.length, verstaendnisfragen(mitFrage).length);
  for (const [i, wc] of fragen.entries()) {
    // Gegenprobe: vor der letzten Antwort noch kein Häkchen
    assert.equal(marke.hidden, true, `vor Antwort ${i + 1}`);
    wc.querySelector<HTMLButtonElement>('.wc-antwort')?.click();
  }
  assert.equal(marke.hidden, false, 'nach der letzten Antwort');
  assert.ok(sp.daten.has('gk.theorie'));
  const ueb = baueTheorie({ inhalte, thema: null, version: VERSION, bedienbar: true, speicher: sp });
  document.body.replaceChildren(ueb);
  assert.equal(ueb.querySelector<HTMLElement>(`.buch-zeile [data-haken="${mitFrage.thema}"]`)?.hidden, false);
  assert.equal([...ueb.querySelectorAll<HTMLElement>('.buch-zeile [data-haken]')].filter((x) => !x.hidden).length, 1);
  const zaehl = zaehle(themen(inhalte), ladeFortschritt(sp));
  assert.equal(ueb.querySelector('[data-balken="gesamt"] .fortschritt-zahl')?.textContent, T.geschafftZahl(1, zaehl.gesamt.gesamt));
  assert.equal(ueb.querySelector('[data-balken="2"] .fortschritt-zahl')?.textContent, T.geschafftZahl(1, zaehl.teile[2].gesamt));
  assert.equal(ueb.querySelector('[data-balken="1"] .fortschritt-zahl')?.textContent, T.geschafftZahl(0, zaehl.teile[1].gesamt));
  assert.equal(ueb.querySelector<HTMLElement>('[data-balken="2"]')?.style.getPropertyValue('--anteil'), String(1 / zaehl.teile[2].gesamt));
  ueb.querySelector<HTMLButtonElement>('[data-pruef="fortschritt-zuruecksetzen"]')?.click();
  assert.equal(sp.daten.has('gk.theorie'), false);
  assert.equal([...ueb.querySelectorAll<HTMLElement>('[data-haken]')].filter((x) => !x.hidden).length, 0);
  assert.equal(ueb.querySelector('[data-balken="gesamt"] .fortschritt-zahl')?.textContent, T.geschafftZahl(0, zaehl.gesamt.gesamt));
});

test('Fortschritt im DOM: ohne Verständnisfragen zählt das Seitenende; gesperrter Speicher stört nicht', () => {
  const ohne = themen(inhalte).find((t) => t.teil !== 'anhang' && verstaendnisfragen(t).length === 0);
  assert.ok(ohne, 'mindestens ein Thema ohne Verständnisfragen');
  const beobachtet: Element[] = [];
  let melde: ((e: { isIntersecting: boolean }[]) => void) | null = null;
  g['IntersectionObserver'] = class {
    constructor(fn: (e: { isIntersecting: boolean }[]) => void) { melde = fn; }
    observe(el: Element): void { beobachtet.push(el); }
    disconnect(): void { melde = null; }
  };
  try {
    const sp = speicher();
    const s = baueTheorie({ inhalte, thema: ohne.thema, version: VERSION, bedienbar: true, speicher: sp });
    assert.equal(beobachtet.length, 1);
    assert.ok(beobachtet[0]?.matches('[data-pruef="lern-kontakt"]'), 'beobachtet wird das Seitenende');
    const marke = s.querySelector<HTMLElement>(`[data-haken="${ohne.thema}"]`);
    (melde as ((e: { isIntersecting: boolean }[]) => void) | null)?.([{ isIntersecting: false }]);
    assert.equal(marke?.hidden, true, 'Gegenprobe: nicht sichtbar → nicht geschafft');
    (melde as ((e: { isIntersecting: boolean }[]) => void) | null)?.([{ isIntersecting: true }]);
    assert.equal(marke?.hidden, false);
    assert.deepEqual(ladeFortschritt(sp).gelesen, [ohne.thema]);
    // Themen mit Fragen beobachten das Seitenende nicht
    beobachtet.length = 0;
    const mit = themen(inhalte).find((t) => verstaendnisfragen(t).length > 0);
    baueTheorie({ inhalte, thema: mit?.thema ?? '', version: VERSION, bedienbar: true, speicher: sp });
    assert.equal(beobachtet.length, 0);
    // gesperrter Speicher: Seite baut, Antworten werfen nicht
    const s2 = baueTheorie({ inhalte, thema: mit?.thema ?? '', version: VERSION, bedienbar: true, speicher: gesperrt });
    assert.doesNotThrow(() => s2.querySelector<HTMLButtonElement>('.wc-antwort')?.click());
    assert.doesNotThrow(() => baueTheorie({ inhalte, thema: null, version: VERSION, bedienbar: true, speicher: null }));
  } finally {
    delete g['IntersectionObserver'];
  }
});

test('Verständnisfragen (r72, L-230 fortgeschrieben): sieben Fragen, jeder der vier Teile trägt mindestens eine', () => {
  const alle = themen(inhalte).filter((t) => t.teil !== 'anhang');
  assert.equal(alle.reduce((n, t) => n + verstaendnisfragen(t).length, 0), 7);
  for (const teil of [1, 2, 3, 4]) {
    assert.ok(alle.some((t) => t.teil === teil && verstaendnisfragen(t).length > 0), `Teil ${teil} ohne Frage`);
  }
});
