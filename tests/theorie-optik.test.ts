// Optik der Themen (P17.9, O-55) im DOM (jsdom): Bauplan nur im Kopf (Motiv je Teil, Illustration je Thema), Farbe des
// Teils am Inhalt, Symbole an Kernaussage und Abschnitten, Aufklapper, Kartengruppe mit Titel, Karten mit Rückseite,
// Text eines Abschnitts in der Reihenfolge der Quelle; Leinwand und Druck zeigen alles aufgelöst.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Block, OeffentlicheInhalte, TheorieSeite } from '../src/inhalte/typen.ts';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///mvg.html' });
const g = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLParagraphElement', 'HTMLDetailsElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) g[k] = (dom.window as unknown as Record<string, unknown>)[k];
after(() => dom.window.close());

const { inhalte } = await import('../src/inhalte/index.ts');
const { abschnittSymbol, baueTheorie, themaFuerDruck, themen } = await import('../src/ui/flaechen/theorie.ts');
const { symbol } = await import('../src/stil/symbole.ts');
const { W } = await import('../src/ui/woerter.ts');
const T = W.themen;
const VERSION = 'Fassung 0.2';
/** Symbol als DOM-Text (der Parser schreibt leere Pfade als <path …></path>). */
const sv = (n: Parameters<typeof symbol>[0]): string => { const t = dom.window.document.createElement('template'); t.innerHTML = symbol(n); return t.innerHTML; };

const block = (art: string, felder: Record<string, string> = {}, kopf: Record<string, string> = {}, kinder: Block[] = [], id: string | null = null): Block =>
  ({ art, kennungen: id === null ? [] : [id], id, kopf, felder, liste: null, kinder });

/** Ein künstliches Thema in Teil 3 mit allen neuen Bausteinen, neben den echten Inhalten. */
const PROBE: TheorieSeite = {
  ...(themen(inhalte)[0] as TheorieSeite),
  id: 'k99', thema: 'probe', teil: 3, symbol: 'werkzeug', titel: 'Probe', kurztitel: 'Probe', einleitung: '',
  bloecke: [
    block('kernaussage', { text: '<p>Kern.</p>' }, { symbol: 'schild' }),
    block('abschnitt', { text: '<p>Erster Text.</p>' }, { titel: 'Risiken im Blick' }, [
      block('merksatz', { text: '<p>Merke eins.</p>' }),
      block('lesetext', { text: '<p>Zweiter Text.</p>' }),
      block('aufklapper', { text: '<p>Innen.</p>' }, { titel: 'Wer entscheidet?' }),
      block('lesetext', { text: '<p>Dritter Text.</p>' }),
      block('karten', { text: '<p>Einleitung der Karten.</p>' }, { titel: 'Zwei Seiten' }, [
        block('karte', { text: '<p>Vorn.</p>', rueckseite: '<p>Hinten.</p>' }, { titel: 'Frage' }),
        block('karte', { text: '<p>Nur vorn.</p>' }, { titel: 'Schlicht' }),
      ]),
    ], 'k99.1'),
  ],
};
const MIT: OeffentlicheInhalte = { ...inhalte, theorie: { ...inhalte.theorie, k99: PROBE } };
const seite = (bedienbar = true): HTMLElement => baueTheorie({ inhalte: MIT, thema: 'probe', version: VERSION, bedienbar });

test('Bauplan nur im Kopf: Motiv des Teils und Illustration des Themas, kein Hintergrund hinter dem Lesetext', () => {
  for (const t of themen(inhalte)) {
    const el = baueTheorie({ inhalte, thema: t.thema, version: VERSION, bedienbar: true });
    assert.equal(el.querySelector('.lern-hintergrund, .bauplan'), null, `${t.thema}: Hintergrund`);
    const band = el.querySelector('.thema-kopf .kopf-band');
    assert.ok(band, t.thema);
    assert.equal(band.querySelector('.kopf-motiv')?.getAttribute('data-motiv'), String(t.teil));
    assert.equal(band.querySelector('.themen-bild')?.getAttribute('data-bild'), t.thema);
    assert.ok(band.querySelector('h1.kapitel-titel'));
    assert.equal(el.querySelector('.lern-inhalt')?.getAttribute('data-teil'), String(t.teil), `${t.thema}: Farbe des Teils am Inhalt`);
    assert.equal(band.querySelectorAll('[aria-hidden="true"] svg').length, 2, 'Bilder sind Schmuck');
  }
  const liste = baueTheorie({ inhalte, thema: null, version: VERSION, bedienbar: true });
  assert.equal(liste.querySelector('.buch-kopf .kopf-motiv')?.getAttribute('data-motiv'), 'alle');
  assert.equal(liste.querySelector('.buch-kopf .themen-bild')?.getAttribute('data-bild'), 'uebersicht');
  assert.equal(liste.querySelector('.lern-hintergrund'), null);
});

test('Symbole: Kernaussage aus „symbol:“ (sonst Symbol des Themas), Abschnitte nach dem ersten Stichwort im Titel', () => {
  const el = seite();
  assert.equal(el.querySelector('.kernaussage-symbol svg')?.outerHTML, sv('schild'));
  const ohne = baueTheorie({ inhalte: { ...MIT, theorie: { ...MIT.theorie, k99: { ...PROBE, bloecke: [block('kernaussage', { text: '<p>K.</p>' })] } } }, thema: 'probe', version: VERSION, bedienbar: true });
  assert.equal(ohne.querySelector('.kernaussage-symbol svg')?.outerHTML, sv('werkzeug'));
  assert.equal(el.querySelector('.lern-abschnitt > .abschnitt-titel .abschnitt-symbol svg')?.outerHTML, sv('warnung'));
  assert.equal(el.querySelector('.lern-abschnitt > .abschnitt-titel .abschnitt-text')?.textContent?.replace(/­/gu, ''), 'Risiken im Blick');
  assert.equal(abschnittSymbol('Zusammenarbeit – Vorgänge, Zuständigkeiten, Takt', 'buch'), 'wechsel', 'das früheste Stichwort zählt');
  assert.equal(abschnittSymbol('Ganz ohne Treffer', 'kompass'), 'kompass');
});

test('Abschnitt: freier Text bleibt zwischen den Bausteinen an seiner Stelle', () => {
  const text = (seite().querySelector('.lern-abschnitt')?.textContent ?? '').replace(/­/gu, '');
  const stellen = ['Erster Text.', 'Merke eins.', 'Zweiter Text.', 'Wer entscheidet?', 'Dritter Text.', 'Zwei Seiten'].map((s) => text.indexOf(s));
  assert.ok(stellen.every((s) => s >= 0), JSON.stringify(stellen));
  assert.deepEqual([...stellen].sort((a, b) => a - b), stellen);
});

test('Aufklapper: zu auf der Seite, Titel mit Symbol; auf Leinwand und im Druck offen', () => {
  const d = seite().querySelector<HTMLDetailsElement>('details.aufklapper');
  assert.ok(d);
  assert.equal(d.open, false);
  assert.equal(d.querySelector('summary .aufklapper-titel')?.textContent?.replace(/­/gu, ''), 'Wer entscheidet?');
  assert.ok(d.querySelector('summary .aufklapper-symbol svg'));
  assert.match(d.querySelector('.aufklapper-inhalt')?.textContent ?? '', /Innen\./u);
  assert.equal(seite(false).querySelector<HTMLDetailsElement>('details.aufklapper')?.open, true);
  assert.equal(themaFuerDruck(MIT, 'probe', VERSION).querySelector<HTMLDetailsElement>('details.aufklapper')?.open, true);
});

test('Kartengruppe zeigt Titel und Einleitung über den Karten', () => {
  const gr = seite().querySelector('[data-pruef="kartengruppe"]');
  assert.ok(gr);
  assert.equal(gr.querySelector('h3.lernkarten-titel')?.textContent?.replace(/­/gu, ''), 'Zwei Seiten');
  assert.match(gr.querySelector('.lernkarten-einleitung')?.textContent ?? '', /Einleitung der Karten/u);
  assert.equal(gr.querySelectorAll('.lernkarten > .lernkarte').length, 2);
});

test('Karte mit Rückseite: Knopf dreht um (aria-pressed, Ansage), ohne Rückseite kein Knopf; aufgelöst beide Seiten', () => {
  const el = seite();
  dom.window.document.body.replaceChildren(el);
  const karten = [...el.querySelectorAll<HTMLElement>('.lernkarte')];
  const wende = karten.find((k) => k.classList.contains('ist-wendekarte'));
  assert.ok(wende);
  assert.equal(karten.filter((k) => k.querySelector('[data-pruef="karte-wenden"]') !== null).length, 1, 'nur die Karte mit Rückseite');
  const knopf = wende.querySelector<HTMLButtonElement>('[data-pruef="karte-wenden"]');
  const ansage = wende.querySelector('[aria-live="polite"]');
  assert.ok(knopf && ansage);
  assert.equal(knopf.getAttribute('aria-pressed'), 'false');
  assert.equal(wende.dataset['seite'], 'vorne');
  assert.equal(wende.querySelector<HTMLElement>('.ist-hinten')?.inert, true, 'Rückseite nicht im Tabulatorweg');
  knopf.click();
  assert.equal(knopf.getAttribute('aria-pressed'), 'true');
  assert.equal(wende.dataset['seite'], 'hinten');
  assert.equal(ansage.textContent, T.karteZeigt(T.karteRueckseite, 'Frage'));
  assert.equal(wende.querySelector<HTMLElement>('.ist-vorne')?.inert, true);
  knopf.click();
  assert.equal(knopf.getAttribute('aria-pressed'), 'false');
  assert.equal(ansage.textContent, T.karteZeigt(T.karteVorderseite, 'Frage'));
  for (const aufgeloest of [seite(false), themaFuerDruck(MIT, 'probe', VERSION)]) {
    const k = aufgeloest.querySelector('.lernkarte.ist-wendekarte');
    assert.ok(k?.classList.contains('ist-aufgeloest'));
    assert.equal(k?.querySelector('button'), null);
    assert.match(k?.textContent ?? '', /Vorn\..*Rückseite.*Hinten\./su);
  }
  dom.window.document.body.replaceChildren();
});
