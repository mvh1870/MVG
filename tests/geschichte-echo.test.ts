/*
 * Gedächtnis der Story (P19.4, O-62): Echo-Zeilen und Echo-Platzhalter. Ein Echo ändert nur Ton und Wortlaut – nie eine Tatsache, nie einen
 * Balken, nie die Bilanz. Geprüft über alle Zustände der drei Quellen (je gut · vertretbar · Falle · offen, ganzer Weg und Kurzfassung:
 * 128 Stände): welche Fassung steht, dass ohne Antwort „gut“ gilt, dass die Kurzfassung ihre Fortsetzung nimmt und Zeilen mit „kurzfassung:
 * nein“ weglässt, und dass Balken, Bilanz und Schlusszeilen mit und ohne Echos dieselben sind (Gegenprobe). Dazu die Zeichnung auf Seite
 * und Leinwand und die obere Schranke der Lesezeit mit der längsten Fassung.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';

import { WERTUNGEN, echoText, p19Story, platzVon } from './hilfen/geschichte-p19.ts';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///index.html' });
const gl = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLParagraphElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) gl[k] = (dom.window as unknown as Record<string, unknown>)[k];
dom.window.scrollTo = (() => undefined) as typeof dom.window.scrollTo;
dom.window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() { /* jsdom rollt nicht */ };
after(() => dom.window.close());

const { inhalte } = await import('../src/inhalte/index.ts');
const E = await import('../src/geschichte/engine.ts');
const { baueSchritt } = await import('../src/ui/flaechen/geschichte.ts');
const lib = (await import(String('../werkzeuge/lesezeit.mjs'))) as { messeSchranke: (o?: { g?: unknown; lesezeit?: unknown }) => Promise<{ woerter: number }>; zaehleWoerter: (el: Element) => number };
type Stand = ReturnType<typeof E.neuerStand>;
type Wertung = (typeof WERTUNGEN)[number];

const ECHT = inhalte.geschichte;
assert.ok(ECHT);
const g = p19Story(ECHT);
const text = (el: Element): string => (el.textContent ?? '').replace(/\s+/gu, ' ').trim();
const k = (id: string) => E.kapitel(g, id) as NonNullable<ReturnType<typeof E.kapitel>>;

/** Stand mit den Antworten der drei Quellen (null = offen), alle anderen Stationen gut. */
function stand(s1: Wertung | null, s3: Wertung | null, s10: Wertung | null, kurz = false): Stand {
  let s = E.neuerStand(kurz);
  for (const kap of g.kapitel) {
    const w: Wertung | null = kap.id === 's1' ? s1 : kap.id === 's3' ? s3 : kap.id === 's10' ? s10 : 'gut';
    if (w !== null) s = E.waehle(g, s, kap.id, platzVon(kap, w));
  }
  return s;
}
const OPTIONEN: (Wertung | null)[] = [...WERTUNGEN, null];
const zeileMit = (id: string) => (g.kapitel.flatMap((x) => x.szene).concat(g.ende.szene)).find((z) => z.echo === id);

test('Echo: die Fassung folgt der gespielten Antwort der Quelle – über alle 128 Stände der drei Quellen, ganzer Weg und Kurzfassung', () => {
  let n = 0;
  for (const kurz of [false, true]) {
    for (const a of OPTIONEN) for (const b of OPTIONEN) for (const c of OPTIONEN) {
      const s = stand(a, b, c, kurz);
      // Kurzfassung: übersprungene Stationen zählen wie die gute Antwort (Station 10 gehört nicht dazu)
      const soll = (w: Wertung | null, gespielt: boolean): Wertung => (kurz && !gespielt ? 'gut' : w ?? 'gut');
      const erwartet = { E1: soll(a, true), E4: soll(b, true), E10: soll(c, false) };
      for (const [id, w] of Object.entries(erwartet)) {
        assert.equal(E.echoHtml(g, s, id), echoText(id, w), `${id}: kurz=${kurz} s1=${a} s3=${b} s10=${c}`);
        const e = E.echoDef(g, id);
        assert.ok(e);
        assert.equal(E.echoWertung(g, s, e), w);
      }
      n += 1;
    }
  }
  assert.equal(n, 128);
});

test('Echo: ein unbekanntes Echo gibt es nicht; die drei Fassungen unterscheiden sich', () => {
  const s = stand('gut', 'gut', 'gut');
  assert.equal(E.echoHtml(g, s, 'E7'), null);
  assert.equal(E.echoDef(g, 'E7'), null);
  for (const e of g.echos ?? []) assert.equal(new Set(Object.values(e.fassungen)).size, 3, e.id);
  assert.ok(E.ECHOS_MAX >= (g.echos ?? []).length && E.ECHOS_MAX === 11, 'elf Einträge: E8 hat zwei Sprecher (L-340)');
});

test('Zeile: eine Echo-Zeile bekommt Fassung plus Fortsetzung (Kurzfassung: ihre eigene), jede andere Zeile bleibt dasselbe Objekt', () => {
  const z = zeileMit('E1');
  assert.ok(z);
  for (const w of WERTUNGEN) {
    assert.equal(E.loeseZeile(g, stand(w, 'gut', 'gut'), z).html, `${echoText('E1', w)} Dann weiter.`, w);
    assert.equal(E.loeseZeile(g, stand(w, 'gut', 'gut', true), z).html, `${echoText('E1', w)} Kurz weiter.`, `Kurzfassung ${w}`);
  }
  // ohne Fortsetzung für die Kurzfassung gilt die lange (E10 hat nur `fortsetzungHtml`)
  const z10 = zeileMit('E10');
  assert.ok(z10);
  assert.equal(E.loeseZeile(g, stand('gut', 'gut', 'falle', true), z10).html, `${echoText('E10', 'gut')} Und inzwischen steht alles im Buch – hätte ich nie gedacht, dass ich das mal gut finde.`, 'Kurzfassung ohne Station 10: gut');
  // ohne Fortsetzung nur die Fassung
  const z4 = zeileMit('E4');
  assert.ok(z4);
  assert.equal(E.loeseZeile(g, stand('gut', 'vertretbar', 'gut'), z4).html, echoText('E4', 'vertretbar'));
  // Gegenprobe: eine Zeile ohne Echo ist unverändert dasselbe Objekt
  const gewoehnlich = k('s1').szene[0];
  assert.ok(gewoehnlich);
  assert.equal(E.loeseZeile(g, stand('falle', 'falle', 'falle'), gewoehnlich), gewoehnlich);
  // ein unbekanntes Echo lässt die Zeile unverändert stehen
  const fremd = { ...z, echo: 'E7' };
  assert.equal(E.loeseZeile(g, stand('gut', 'gut', 'gut'), fremd), fremd);
});

test('Platzhalter: loeseEchos setzt die Fassung in den Fließtext; unbekannte Echos fallen weg; Text ohne Platzhalter bleibt gleich', () => {
  const s = stand('vertretbar', 'gut', 'gut');
  assert.equal(E.loeseEchos(g, s, 'Davor. „{echo: E1}“ Danach.'), `Davor. „${echoText('E1', 'vertretbar')}“ Danach.`);
  assert.equal(E.loeseEchos(g, s, '{echo:E1}{echo:   E4 }'), `${echoText('E1', 'vertretbar')}${echoText('E4', 'gut')}`);
  assert.equal(E.loeseEchos(g, s, 'Kein Platzhalter {echo} hier.'), 'Kein Platzhalter {echo} hier.');
  assert.equal(E.loeseEchos(g, s, 'Fremd: {echo: E7}.'), 'Fremd: .');
  assert.equal(E.loeseEchos(g, s, 'Nur Text.'), 'Nur Text.');
});

test('Echo ändert nichts an Balken, Bilanz und Schlusszeilen: mit und ohne Echos dieselben Werte in allen 64 Ständen', () => {
  const ohne = structuredClone(g);
  delete ohne.echos;
  ohne.kapitel.forEach((kap) => { kap.szene = kap.szene.filter((z) => z.echo === undefined); });
  ohne.ende.szene = ohne.ende.szene.filter((z) => z.echo === undefined);
  for (const a of OPTIONEN) for (const b of OPTIONEN) for (const c of OPTIONEN) {
    const s = stand(a, b, c);
    assert.deepEqual(E.balken(g, s, { ort: 'ende' }), E.balken(ohne, s, { ort: 'ende' }), `${a} ${b} ${c}`);
    assert.equal(E.bilanzAmEnde(g, s), E.bilanzAmEnde(ohne, s));
    assert.equal(E.endeFassung(g, s), E.endeFassung(ohne, s));
    assert.deepEqual(E.verlaufBis(g, s, 14), E.verlaufBis(ohne, s, 14));
  }
});

/* ------------------------------------------------------------------ Seite -- */

const an = (kap: string, teil: 'szene' | 'frage', basis: Stand): Stand => ({ ...basis, schritt: { ort: 'kapitel', kapitel: kap, teil } });
const seite = (s: Stand, bedienbar = true): HTMLElement => baueSchritt({ g, stand: s, bedienbar, themaTitel: () => null, tue: () => undefined });

test('Seite: die Echo-Zeile in Station 5 und ihre Folge zeigen die Fassung nach der Antwort in Station 1, ohne Wertung und ohne Platzhalter', () => {
  for (const w of WERTUNGEN) {
    const basis = stand(w, 'gut', 'gut');
    const el = seite(an('s5', 'szene', basis));
    assert.match(text(el), new RegExp(`${echoText('E1', w)} Dann weiter\\.`, 'u'), w);
    for (const ander of WERTUNGEN.filter((x) => x !== w)) assert.doesNotMatch(text(el), new RegExp(echoText('E1', ander), 'u'), `${w}: nicht die Fassung ${ander}`);
    // Folge der ersten Antwort in Station 5: Platzhalter ersetzt
    const f = seite(an('s5', 'frage', E.waehle(g, basis, 's5', 0)));
    const folge = text(f.querySelector('[data-pruef="gs-folge"]') as Element);
    assert.match(folge, new RegExp(`Die Folge\\. „${echoText('E1', w)}“ Ende der Folge\\.`, 'u'), w);
    assert.doesNotMatch(text(el) + folge, /\{echo|Wertung|Falle|vertretbar/u);
  }
  // Quelle offen (Sprung): Fassung „gut“
  const offen = seite(an('s5', 'szene', stand(null, 'gut', 'gut')));
  assert.match(text(offen), new RegExp(echoText('E1', 'gut'), 'u'));
});

test('Seite, Kurzfassung: die Fortsetzung der Kurzfassung; Zeilen mit „kurzfassung: nein“ (E10 im Ende) fehlen, E4 mit gespielter Quelle steht', () => {
  const s = stand('falle', 'vertretbar', 'falle', true);
  assert.match(text(seite(an('s5', 'szene', s))), new RegExp(`${echoText('E1', 'falle')} Kurz weiter\\.`, 'u'));
  assert.match(text(seite(an('s12', 'szene', s))), new RegExp(echoText('E4', 'vertretbar'), 'u'));
  const ende = seite({ ...s, schritt: { ort: 'ende' } });
  assert.doesNotMatch(text(ende), /Rückblick E10/u, 'E10 gehört nur zum ganzen Weg');
  assert.match(text(ende), /Immer da\./u);
  // ganzer Weg: E10 mit der Fassung nach Station 10
  const lang = stand('gut', 'gut', 'vertretbar');
  const ende2 = seite({ ...lang, schritt: { ort: 'ende' } });
  assert.match(text(ende2), new RegExp(`${echoText('E10', 'vertretbar')} Und inzwischen steht alles im Buch – hätte ich nie gedacht, dass ich das mal gut finde\\.`, 'u'));
});

test('Seite, Ende: bei niedrigem Vertrauen ersetzt die Zeile der Figur die Echo-Zeile (E10 entfällt)', () => {
  // alle Antworten Falle: Vertrauen sinkt auf niedrig
  let s = E.neuerStand(false);
  for (const kap of g.kapitel) s = E.waehle(g, s, kap.id, platzVon(kap, 'falle'));
  assert.equal(E.endeFassung(g, s), 'vertrauen-niedrig');
  const ende = text(seite({ ...s, schritt: { ort: 'ende' } }));
  assert.doesNotMatch(ende, /Rückblick E10/u);
  assert.match(ende, /Früher|Hätten wir/u);
});

test('Leinwand: dieselbe Echo-Zeile ohne Bedienelemente, ohne Wertung', () => {
  const el = seite(an('s5', 'szene', stand('vertretbar', 'gut', 'gut')), false);
  assert.match(text(el), new RegExp(echoText('E1', 'vertretbar'), 'u'));
  assert.equal(el.querySelectorAll('button').length, 0);
});

/* ----------------------------------------------------------- obere Schranke -- */

test('Obere Schranke der Lesezeit: sie zählt die längste Echo-Fassung (je Fassung ein eigenes Wortzahlgewicht)', async () => {
  const lang = structuredClone(g);
  const kurzFassung = 'Kurz.';
  const langFassung = Array.from({ length: 40 }, () => 'sehr').join(' ');
  for (const e of lang.echos ?? []) e.fassungen = { gut: kurzFassung, vertretbar: kurzFassung, falle: kurzFassung };
  const lz = (gg: typeof g): unknown => ({ woerterJeMinute: 200, lang: Object.fromEntries(E.schritte(gg, false).map((x) => [E.schrittKennung(x), 100])), kurz: Object.fromEntries(E.schritte(gg, true).map((x) => [E.schrittKennung(x), 100])) });
  const basis = await lib.messeSchranke({ g: lang, lesezeit: lz(lang) });
  // eine einzige lange Fassung („falle“ von E4, genutzt in Station 12): die Schranke wächst um deren Wörter, auch wenn der gute Weg sie nie zeigt
  const e4 = lang.echos?.find((e) => e.id === 'E4');
  assert.ok(e4);
  e4.fassungen.falle = langFassung;
  const mit = await lib.messeSchranke({ g: lang, lesezeit: lz(lang) });
  assert.ok(mit.woerter >= basis.woerter + 39, `Schranke ${basis.woerter} → ${mit.woerter}: die längste Fassung zählt`);
  // Gegenprobe: die Messung des guten Wegs bleibt von der Fassung „falle“ unberührt
  const gut = await (await import(String('../werkzeuge/lesezeit.mjs')) as { messeLesezeit: (o?: { g?: unknown; lesezeit?: unknown }) => Promise<{ lang: { woerter: number } }> }).messeLesezeit({ g: lang, lesezeit: lz(lang) });
  e4.fassungen.falle = kurzFassung;
  const gut2 = await (await import(String('../werkzeuge/lesezeit.mjs')) as { messeLesezeit: (o?: { g?: unknown; lesezeit?: unknown }) => Promise<{ lang: { woerter: number } }> }).messeLesezeit({ g: lang, lesezeit: lz(lang) });
  assert.equal(gut.lang.woerter, gut2.lang.woerter);
});
