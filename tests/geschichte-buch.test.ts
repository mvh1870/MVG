/*
 * Entscheidungsbuch und Verlauf der Story (P19.4, O-62): welche Einträge das Buch zu welchem Stand zeigt (ganzer Weg, Kurzfassung, Sprung,
 * zurück), dass es für alle Wege gleich ist und nie die Antwort nennt, das Symbol mit dem Punkt „neu“, die Seite über der Station, die Leinwand
 * ohne Bedienung und ohne Wertung (mit dem Schalter der Regie) und der Druck. Dazu der Verlauf in Pause und Bilanz: Textfassung ohne Zahlen,
 * „noch offen“ mit abgerissener Linie, hohle Punkte der Kurzfassung. Synthetische Story mit 14 Stationen und Entscheidungsbuch.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';

import { WERTUNGEN, p19Story, platzVon } from './hilfen/geschichte-p19.ts';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///index.html' });
const gl = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLParagraphElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) gl[k] = (dom.window as unknown as Record<string, unknown>)[k];
dom.window.scrollTo = (() => undefined) as typeof dom.window.scrollTo;
dom.window.scrollBy = (() => undefined) as typeof dom.window.scrollBy;
dom.window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() { /* jsdom rollt nicht */ };
after(() => dom.window.close());

const { inhalte, regieGeschichte, regieKapitel, regieWerkzeug } = await import('../src/inhalte/index.ts');
const E = await import('../src/geschichte/engine.ts');
const { baueSchritt, erzeugeGeschichte, SPEICHER_SCHLUESSEL, storyDruck, leisteOben, verlauf } = await import('../src/ui/flaechen/geschichte.ts');
const { buchSeite, buchSymbol, buchDruck } = await import('../src/ui/flaechen/geschichte-buch.ts');
const { verlaufBand } = await import('../src/grafik/verlauf.ts');
const { erzeugeAnzeige } = await import('../src/regie/leinwand.ts');
const { erzeugeRegie } = await import('../src/regie/regie.ts');
const { neueBuehne, pruefeBuehne } = await import('../src/regie/buehne.ts');
const { W } = await import('../src/ui/woerter.ts');
type Stand = ReturnType<typeof E.neuerStand>;
type Wertung = (typeof WERTUNGEN)[number];

const ECHT = inhalte.geschichte;
assert.ok(ECHT);
const g = p19Story(ECHT);
const text = (el: Element): string => (el.textContent ?? '').replace(/\s+/gu, ' ').trim();
const nummern = (s: Stand): number[] => E.buchEintraege(g, s).map((x) => x.k.nr);
const an = (kap: string, teil: 'szene' | 'vergleich' | 'frage' | 'mini', basis: Stand = E.neuerStand()): Stand => ({ ...basis, schritt: { ort: 'kapitel', kapitel: kap, teil } });
/** Stand mit Antworten in den Stationen 1 … n (je die Wertung), den Rest offen. */
function bisStation(n: number, w: Wertung = 'gut', kurz = false): Stand {
  let s = E.neuerStand(kurz);
  for (const k of g.kapitel) if (k.nr <= n && (!kurz || k.kurzfassung)) s = E.waehle(g, s, k.id, platzVon(k, w));
  return s;
}

/* ------------------------------------------------------------------ Engine -- */

test('Buch: leer vor der ersten Antwort, danach ein Eintrag je Station in der Reihenfolge der Stationen', () => {
  assert.deepEqual(nummern(E.neuerStand()), []);
  assert.deepEqual(nummern(an('s1', 'szene')), []);
  assert.deepEqual(nummern(an('s1', 'frage')), [], 'ohne Antwort noch kein Eintrag');
  for (let n = 1; n <= 14; n += 1) {
    const s = { ...bisStation(n), schritt: { ort: 'kapitel', kapitel: `s${n}`, teil: 'frage' } as const };
    assert.deepEqual(nummern(s), Array.from({ length: n }, (_, i) => i + 1), `bis Station ${n}`);
  }
  // am Ende alle 14, jeder voll
  const ende = { ...bisStation(14), schritt: { ort: 'ende' } as const };
  assert.equal(E.buchEintraege(g, ende).length, 14);
  assert.ok(E.buchEintraege(g, ende).every((x) => x.voll));
});

test('Buch: für alle Wege gleich – derselbe Eintrag, ob die Antwort gut, vertretbar oder Falle war (über alle Stationen)', () => {
  for (const k of g.kapitel) {
    const sichten = WERTUNGEN.map((w) => {
      let s = E.waehle(g, E.neuerStand(), k.id, platzVon(k, w));
      s = { ...s, schritt: { ort: 'kapitel', kapitel: k.id, teil: 'frage' } };
      return JSON.stringify(E.buchEintraege(g, s).map((x) => [x.k.id, x.eintrag, x.voll]));
    });
    assert.equal(new Set(sichten).size, 1, `Station ${k.nr}`);
    assert.match(sichten[0] ?? '', /"s\d+"/u);
  }
  // und die Einträge selbst nennen nie die Antwort, eine Wertung oder Punkte
  for (const e of g.buch ?? []) assert.doesNotMatch(JSON.stringify(e), /Ihre Antwort|Ihre Wahl|Wertung|Falle|Punkte/u, e.station);
});

test('Buch: die Seite zeigt nur Einträge bis zur gezeigten Station – wer zurückgeht, sieht weniger; Sprung nach vorn ohne Antworten zeigt nichts', () => {
  const alle = bisStation(8);
  assert.deepEqual(nummern({ ...alle, schritt: { ort: 'kapitel', kapitel: 's8', teil: 'frage' } }), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(nummern({ ...alle, schritt: { ort: 'kapitel', kapitel: 's3', teil: 'szene' } }), [1, 2, 3], 'zurückgegangen: die Station ist gespielt, ihr Eintrag bleibt, die späteren nicht');
  assert.deepEqual(nummern({ ...bisStation(2), schritt: { ort: 'kapitel', kapitel: 's3', teil: 'szene' } }), [1, 2], 'in Station 3 vor ihrer Antwort: die Einträge davor');
  assert.deepEqual(nummern({ ...bisStation(2), schritt: { ort: 'kapitel', kapitel: 's3', teil: 'frage' } }), [1, 2], 'die Frage ohne Antwort: noch kein Eintrag 3');
  assert.deepEqual(nummern({ ...alle, schritt: { ort: 'auftakt' } }), []);
  assert.deepEqual(nummern({ ...E.neuerStand(), schritt: { ort: 'kapitel', kapitel: 's9', teil: 'szene' } }), [], 'gesprungen, ohne Antworten: nichts');
  // eine Pause zählt wie die letzte Station des Akts
  assert.deepEqual(nummern({ ...bisStation(5), schritt: { ort: 'pause', akt: 'a1' } }), [1, 2, 3, 4, 5]);
});

test('Buch, Kurzfassung: gespielte Stationen voll, für jede übersprungene eine Zeile – erst, wenn ihre Brückenkarte gezeigt wurde', () => {
  const kurz = bisStation(14, 'gut', true);
  // die Szene von Station n, mit den Antworten der gespielten Stationen davor
  const vor = (kap: string): Stand => ({ ...bisStation(Number(kap.slice(1)) - 1, 'gut', true), schritt: { ort: 'kapitel', kapitel: kap, teil: 'szene' } });
  assert.deepEqual(E.buchEintraege(g, vor('s1')).map((x) => x.k.nr), []);
  // Station 3 steht: die Brücke von Station 2 ist gezeigt, Station 1 ist voll, 2 eine Zeile
  const bei3 = E.buchEintraege(g, vor('s3'));
  assert.deepEqual(bei3.map((x) => [x.k.nr, x.voll]), [[1, true], [2, false]]);
  // ein Stand, der (nur über Umwege) an der übersprungenen Station selbst steht, hat ihre Brückenkarte noch nicht gesehen
  assert.deepEqual(E.buchEintraege(g, { ...bisStation(1, 'gut', true), schritt: { ort: 'kapitel', kapitel: 's2', teil: 'szene' } }).map((x) => x.k.nr), [1]);
  // Station 5: die Brücke von Station 4 kommt hinzu
  assert.deepEqual(E.buchEintraege(g, vor('s5')).map((x) => [x.k.nr, x.voll]), [[1, true], [2, false], [3, true], [4, false]]);
  // Station 12: Brücken der Stationen 6 bis 11 sind gezeigt
  const bei12 = E.buchEintraege(g, vor('s12'));
  assert.deepEqual(bei12.map((x) => x.k.nr), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.deepEqual(bei12.filter((x) => x.voll).map((x) => x.k.nr), [1, 3, 5]);
  // am Ende alle 14: gespielte voll, übersprungene als Zeile
  const ende = E.buchEintraege(g, { ...kurz, schritt: { ort: 'ende' } });
  // kurz zurück zur Brücke gezeigt? vor ihrer Karte steht die Zeile nicht
  assert.equal(E.buchEintraege(g, { ...bisStation(1, 'gut', true), schritt: { ort: 'kapitel', kapitel: 's1', teil: 'frage' } }).some((x) => x.k.nr === 2), false);
  assert.equal(ende.length, 14);
  assert.deepEqual(ende.filter((x) => x.voll).map((x) => x.k.nr), [1, 3, 5, 12]);
  // Gegenprobe: im ganzen Weg ist jeder Eintrag voll
  assert.ok(E.buchEintraege(g, { ...bisStation(14), schritt: { ort: 'ende' } }).every((x) => x.voll));
});

test('Buch: Zugang erst, wenn Station 1 abgeschlossen ist; ohne Buch nie', () => {
  assert.equal(E.buchZugang(g, E.neuerStand()), false);
  assert.equal(E.buchZugang(g, an('s1', 'szene')), false);
  assert.equal(E.buchZugang(g, an('s1', 'frage')), false, 'Frage ohne Antwort');
  assert.equal(E.buchZugang(g, an('s1', 'frage', bisStation(1))), true);
  assert.equal(E.buchZugang(g, an('s2', 'szene')), true, 'über die Fortschrittslinie weiter hinten: erreichbar, der Leerzustand erklärt');
  assert.equal(E.buchZugang(g, { ...E.neuerStand(), schritt: { ort: 'ende' } }), true);
  const ohne = structuredClone(g);
  delete ohne.buch;
  assert.equal(E.buchZugang(ohne, an('s5', 'frage', bisStation(5))), false);
  assert.deepEqual(E.buchEintraege(ohne, bisStation(5)), []);
});

/* ------------------------------------------------------------------- Seite -- */

test('Seite des Buchs: Titel, Einleitung, Legende, Einträge mit Kopf, Stempel (Wort und Zeichen) und vier Zeilen; Leerzustand ohne Einträge', () => {
  const s = { ...bisStation(4), schritt: { ort: 'kapitel', kapitel: 's4', teil: 'frage' } as const };
  const el = buchSeite(g, s, { gesehen: new Set<string>() });
  assert.equal(text(el.querySelector('h1') as Element), W.geschichte.buchTitel);
  assert.equal(el.querySelector('h1')?.getAttribute('tabindex'), '-1');
  assert.match(text(el), /Hier hält die Projektsteuerin fest/u);
  assert.equal(el.querySelectorAll('[data-pruef="gs-buch-legende"] > div').length, 3);
  const eintraege = [...el.querySelectorAll<HTMLElement>('.gs-buch-eintrag')];
  assert.deepEqual(eintraege.map((x) => x.dataset['station']), ['s1', 's2', 's3', 's4']);
  assert.equal(text(eintraege[3]?.querySelector('h2') as Element), '4 · Station 4 · Februar 2027'.replace('Februar 2027', g.kapitel[3]?.zeit ?? ''));
  const stempel = eintraege.map((x) => text(x.querySelector('.gs-buch-stempel') as Element));
  assert.deepEqual(stempel, ['Beschluss', 'Vermerk', 'Übergabe', 'Beschluss und Übergabe'], 'die Art steht als Wort');
  assert.ok(eintraege.every((x) => x.querySelector('.gs-buch-stempel svg.symbol') !== null), 'und als Zeichen');
  assert.deepEqual([...(eintraege[1] as HTMLElement).querySelectorAll('dt')].map(text), ['Anlass', 'Entschieden von', 'Grundlage', 'Ergebnis']);
  assert.match(text(eintraege[1] as HTMLElement), /niemand – es wurde nichts beschlossen/u);
  // jeder Eintrag erscheint: alle vier als „neu“, weil nichts gesehen ist
  assert.equal(el.querySelectorAll('[data-neu="true"]').length, 4);
  assert.equal(el.querySelector('[data-pruef="gs-buch-leer"]'), null);
  // ohne Einträge: der Leerzustand
  const leer = buchSeite(g, E.neuerStand());
  assert.equal(text(leer.querySelector('[data-pruef="gs-buch-leer"]') as Element), W.geschichte.buchLeer);
  assert.equal(leer.querySelector('.gs-buch-liste'), null);
});

test('Seite des Buchs: „neu“ nur für Einträge, die beim letzten Öffnen noch nicht da waren; Knopf „Zurück zur Geschichte“ nur bedienbar', () => {
  const s = { ...bisStation(3), schritt: { ort: 'kapitel', kapitel: 's3', teil: 'frage' } as const };
  const el = buchSeite(g, s, { gesehen: new Set(['s1', 's2']), schliessen: () => undefined });
  assert.deepEqual([...el.querySelectorAll<HTMLElement>('[data-neu="true"]')].map((x) => x.dataset['station']), ['s3']);
  assert.equal(text(el.querySelector('[data-neu="true"] .gs-buch-neu') as Element), 'neu');
  assert.equal(text(el.querySelector('[data-pruef="buch-schliessen"]') as Element), W.geschichte.buchSchliessen);
  // Leinwand: ohne Angabe nichts neu, kein Knopf
  const stumm = buchSeite(g, s);
  assert.equal(stumm.querySelectorAll('[data-neu="true"]').length, 0);
  assert.equal(stumm.querySelectorAll('button').length, 0);
});

test('Seite des Buchs, Kurzfassung: übersprungene Stationen als eine Zeile mit Art und Ergebnis, ohne Kopf und ohne Spalten', () => {
  const kurz = { ...bisStation(2, 'gut', true), schritt: { ort: 'kapitel', kapitel: 's3', teil: 'szene' } as const };
  const el = buchSeite(g, kurz);
  assert.equal(el.querySelectorAll('.gs-buch-eintrag').length, 1, 'Station 1 voll');
  const zeile = el.querySelector<HTMLElement>('.gs-buch-zeile');
  assert.ok(zeile);
  assert.equal(zeile.dataset['station'], 's2');
  assert.equal(zeile.querySelector('dt'), null);
  assert.equal(zeile.querySelector('h2'), null);
  assert.match(text(zeile), /Vermerk/u);
  assert.match(text(zeile), /Ergebnis der Station 2\./u);
  assert.match(text(zeile.querySelector('.nur-sr') as Element), /Station 2/u);
});

test('Buch ohne Wertung: weder auf der Seite noch auf der Leinwand steht eine Antwort, Wertung oder Punkte', () => {
  for (const w of WERTUNGEN) {
    const s = { ...bisStation(14, w), schritt: { ort: 'ende' } as const };
    const t = text(buchSeite(g, s));
    assert.doesNotMatch(t, /Ihre Antwort|Ihre Wahl|Wertung|\bFalle\b|vertretbar|Punkte|Geld|Zeit:|Vertrauen/u, w);
  }
});

/* -------------------------------------------------------- Symbol und Fläche -- */

function speicher(): { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void; daten: Map<string, string> } {
  const daten = new Map<string, string>();
  return { daten, getItem: (k) => daten.get(k) ?? null, setItem: (k, v) => { daten.set(k, v); }, removeItem: (k) => { daten.delete(k); } };
}
function flaeche(s: Stand | null = null, sp = speicher()): ReturnType<typeof erzeugeGeschichte> {
  if (s !== null) sp.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(s));
  const f = erzeugeGeschichte({ g, speicher: sp, themaTitel: () => null });
  document.body.replaceChildren(f.element);
  return f;
}
const finde = (f: { element: HTMLElement }, pruef: string): HTMLElement | null => f.element.querySelector<HTMLElement>(`[data-pruef="${pruef}"]`);
const aktiv = (): string => (document.activeElement === document.body ? 'BODY' : (document.activeElement as HTMLElement | null)?.dataset['pruef'] ?? document.activeElement?.tagName ?? '');

test('Symbol: erst nach Station 1; „neu“ als Punkt und als Wort für Screenreader; öffnet und schließt per Klick und Escape; Fokus kehrt zurück', () => {
  const f = flaeche(an('s1', 'szene'));
  assert.equal(finde(f, 'buch-symbol'), null, 'vor Station 1 kein Symbol');
  // Antwort in Station 1: das Symbol erscheint, neu
  f.stand();
  const frage = flaeche(an('s1', 'frage'));
  (finde(frage, 'antwort-2') as HTMLElement).click();
  const sym = finde(frage, 'buch-symbol');
  assert.ok(sym, 'nach der Antwort in Station 1');
  assert.equal(sym.dataset['neu'], 'true');
  assert.ok(sym.querySelector('.gs-buch-punkt'));
  assert.match(text(sym.querySelector('.nur-sr') as Element), /neu/u);
  assert.equal(sym.getAttribute('aria-pressed'), 'false');
  // öffnen
  sym.click();
  assert.ok(finde(frage, 'gs-buch'), 'Seite des Buchs über der Station');
  assert.equal(aktiv(), 'gs-titel');
  assert.equal(document.activeElement?.textContent, W.geschichte.buchTitel);
  assert.equal(finde(frage, 'buch-symbol')?.getAttribute('aria-pressed'), 'true');
  assert.equal(finde(frage, 'buch-symbol')?.dataset['neu'], undefined, 'geöffnet: kein Punkt mehr');
  assert.equal(frage.element.querySelectorAll('.gs-buch-eintrag').length, 1);
  assert.equal(frage.element.ownerDocument.body.dataset['teil'], 'buch');
  // Escape schließt, der Fokus liegt wieder auf dem Symbol
  assert.equal(frage.taste(new KeyboardEvent('keydown', { key: 'Escape' })), true);
  assert.equal(finde(frage, 'gs-buch'), null);
  assert.ok(finde(frage, 'gs-folge'), 'die Station ist wieder da');
  assert.equal(aktiv(), 'buch-symbol');
  assert.equal(finde(frage, 'buch-symbol')?.dataset['neu'], undefined, 'gesehen');
});

test('Symbol: ein neuer Eintrag setzt den Punkt wieder; „Zurück zur Geschichte“ und Weiter führen aus dem Buch heraus', () => {
  const f = flaeche(an('s1', 'frage'));
  (finde(f, 'antwort-1') as HTMLElement).click();
  (finde(f, 'buch-symbol') as HTMLElement).click();
  (finde(f, 'buch-schliessen') as HTMLElement).click();
  assert.equal(finde(f, 'gs-buch'), null);
  assert.equal(aktiv(), 'buch-symbol');
  // weiter zu Station 2, dort antworten: Eintrag 2 ist neu
  (finde(f, 'weiter') as HTMLElement).click();
  (finde(f, 'weiter') as HTMLElement).click();
  assert.equal(f.stand().schritt.ort, 'kapitel');
  assert.equal(finde(f, 'buch-symbol')?.dataset['neu'], undefined, 'Eintrag 1 ist gesehen, Eintrag 2 fehlt noch');
  (finde(f, 'antwort-1') as HTMLElement).click();
  assert.equal(finde(f, 'buch-symbol')?.dataset['neu'], 'true');
  (finde(f, 'buch-symbol') as HTMLElement).click();
  assert.deepEqual([...f.element.querySelectorAll<HTMLElement>('.gs-buch-eintrag[data-neu="true"]')].map((x) => x.dataset['station']), ['s2']);
  // Weiter schließt das Buch und geht weiter
  (finde(f, 'weiter') as HTMLElement).click();
  assert.equal(finde(f, 'gs-buch'), null);
  assert.equal(f.stand().schritt.ort, 'kapitel');
});

test('Symbol in der Leiste: nur bedienbar; ohne Buch in der Story bleibt die Leiste, wie sie war', () => {
  const s = an('s2', 'szene', bisStation(1));
  const mit = leisteOben(g, s, true, () => undefined, undefined, { offen: false, neu: false, umschalten: () => undefined });
  assert.ok(mit.some((n) => n instanceof HTMLElement && n.querySelector('[data-pruef="buch-symbol"]') !== null));
  const stumm = leisteOben(g, s, false, () => undefined, undefined, { offen: false, neu: false, umschalten: () => undefined });
  assert.ok(stumm.every((n) => !(n instanceof HTMLElement) || n.querySelector('[data-pruef="buch-symbol"]') === null), 'Leinwand: kein Symbol');
  const ohne = structuredClone(g);
  delete ohne.buch;
  const leiste = leisteOben(ohne, s, true, () => undefined, undefined, { offen: false, neu: false, umschalten: () => undefined });
  assert.ok(leiste.every((n) => !(n instanceof HTMLElement) || (n.querySelector('[data-pruef="buch-symbol"]') === null && !n.classList.contains('gs-ortzeile'))));
  assert.equal(buchSymbol(g, E.neuerStand(), { offen: false, neu: false, umschalten: () => undefined }), null);
});

/* ------------------------------------------------------ Leinwand und Regie -- */

test('Bühnenstand: „buch“ gilt nur als Schalter true im Bereich Story; alles andere fällt weg', () => {
  const b = neueBuehne();
  const story = { ...b, bereich: 'story' as const, story: bisStation(3), buch: true };
  assert.equal(pruefeBuehne(JSON.parse(JSON.stringify(story)), g)?.buch, true);
  assert.equal(pruefeBuehne({ ...story, buch: 'ja' }, g)?.buch, undefined);
  assert.equal(pruefeBuehne({ ...story, buch: false }, g)?.buch, undefined);
  assert.equal(pruefeBuehne({ ...story, bereich: 'theorie' }, g)?.buch, undefined);
  assert.equal('buch' in (pruefeBuehne({ ...story, buch: undefined }, g) ?? {}), false);
});

test('Leinwand: auf Wunsch der Regie das Buch statt des Schritts – ohne Bedienung, ohne „neu“, ohne Antwort; sonst wie bisher', () => {
  const inh = { ...inhalte, geschichte: g };
  const anzeige = erzeugeAnzeige(inh, 'Test', false);
  const s = { ...bisStation(3, 'falle'), schritt: { ort: 'kapitel', kapitel: 's3', teil: 'frage' } as const };
  anzeige.setze({ ...neueBuehne(), bereich: 'story', story: s, buch: true });
  const el = anzeige.element;
  assert.ok(el.querySelector('[data-pruef="gs-buch"]'));
  assert.equal(el.querySelectorAll('.gs-buch-eintrag').length, 3);
  assert.equal(el.querySelectorAll('button, [data-neu="true"]').length, 0);
  assert.doesNotMatch(text(el), /Ihre Antwort|Wertung|\bFalle\b|vertretbar|Punkte/u);
  assert.equal(el.querySelector('[data-pruef="buch-symbol"]'), null);
  // ohne den Schalter der normale Schritt
  anzeige.setze({ ...neueBuehne(), bereich: 'story', story: s });
  assert.equal(el.querySelector('[data-pruef="gs-buch"]'), null);
  assert.ok(el.querySelector('[data-pruef="gs-folge"]') ?? el.querySelector('.gs-frage'));
  // eine Story ohne Buch ignoriert den Schalter
  const anzeige2 = erzeugeAnzeige({ ...inhalte, geschichte: Object.assign(structuredClone(g), { buch: undefined }) }, 'Test', false);
  anzeige2.setze({ ...neueBuehne(), bereich: 'story', story: s, buch: true });
  assert.equal(anzeige2.element.querySelector('[data-pruef="gs-buch"]'), null);
});

test('Regie: der Knopf „Entscheidungsbuch zeigen“ schaltet die Leinwand um und gilt nur für den Schritt, an dem er gedrückt wurde', () => {
  const gesendet: { art: string; zustand?: { buch?: boolean } }[] = [];
  const kanal = { senden: (n: never) => { gesendet.push(n); }, abonnieren: () => () => undefined, schliessen: () => undefined };
  const sp = speicher();
  const r = erzeugeRegie({ inhalte: { ...inhalte, geschichte: g }, kanal, version: 'Test', speicher: sp, regieGeschichte, regieKapitel, regieWerkzeug, oeffneLeinwand: () => undefined, takt: 100000 });
  document.body.replaceChildren(r.element);
  const zustand = (): { buch?: boolean } | undefined => gesendet.filter((n) => n.art === 'zustand').at(-1)?.zustand;
  const knopf = (): HTMLButtonElement => r.element.querySelector<HTMLButtonElement>('[data-pruef="regie-buch"]') as HTMLButtonElement;
  try {
    assert.ok(knopf());
    assert.equal(text(knopf()), W.regie.buchZeigen);
    assert.equal(knopf().getAttribute('aria-pressed'), 'false');
    assert.equal(zustand()?.buch, undefined);
    knopf().click();
    assert.equal(zustand()?.buch, true);
    assert.equal(knopf().getAttribute('aria-pressed'), 'true');
    // der Schalter sitzt am Bühnenstand der Leinwand: ein weiterer Schritt schaltet das Buch wieder aus
    r.taste(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    assert.equal(zustand()?.buch, undefined);
    assert.equal(knopf().getAttribute('aria-pressed'), 'false');
    // zweiter Druck zeigt, dritter blendet aus
    knopf().click();
    assert.equal(zustand()?.buch, true);
    knopf().click();
    assert.equal(zustand()?.buch, undefined);
  } finally {
    r.entferne();
  }
  // Story ohne Buch: kein Knopf
  // (seit P19.6 trägt die echte Story ein Buch, deshalb eine Story ohne Buch aus der echten)
  const r2 = erzeugeRegie({ inhalte: { ...inhalte, geschichte: Object.assign(structuredClone(g), { buch: undefined }) }, kanal, version: 'Test', speicher: speicher(), regieGeschichte, regieKapitel, regieWerkzeug, oeffneLeinwand: () => undefined, takt: 100000 });
  assert.equal(r2.element.querySelector('[data-pruef="regie-buch"]'), null);
  r2.entferne();
});

/* ------------------------------------------------------------------- Druck -- */

test('Druck: das Buch auf einer eigenen Querformat-Seite als Tabelle, nur Zeilen bis zur aktuellen Station, Art als Wort, ohne „neu“', () => {
  const s = { ...bisStation(5), schritt: { ort: 'kapitel', kapitel: 's5', teil: 'frage' } as const };
  const { teile } = storyDruck(g, s, 'Test');
  const wurzel = document.createElement('div');
  wurzel.append(...teile.map((t) => t.cloneNode(true)));
  const buch = wurzel.querySelector<HTMLElement>('[data-pruef="druck-buch"]');
  assert.ok(buch);
  assert.equal(text(buch.querySelector('h2') as Element), W.geschichte.buchDruckTitel);
  assert.deepEqual([...buch.querySelectorAll('thead th')].map(text), ['Nr', 'Anlass', 'Art', 'Entschieden von', 'Grundlage', 'Ergebnis']);
  const zeilen = [...buch.querySelectorAll<HTMLElement>('tbody tr')];
  assert.deepEqual(zeilen.map((z) => z.dataset['station']), ['s1', 's2', 's3', 's4', 's5']);
  assert.deepEqual(zeilen.map((z) => text(z.querySelectorAll('td')[1] as Element)), ['Beschluss', 'Vermerk', 'Übergabe', 'Beschluss und Übergabe', 'Beschluss']);
  assert.doesNotMatch(text(buch), /\bneu\b|Ihre Antwort/u);
  // ohne Einträge (vor Station 1) keine Seite
  assert.equal(buchDruck(g, E.neuerStand()), null);
  // ohne Buch in der Story keine Seite
  const ohne = structuredClone(g);
  delete ohne.buch;
  assert.equal(buchDruck(ohne, s), null);
  // Kurzfassung: übersprungene Stationen mit Strich in den Spalten ohne Eintrag
  const kurz = { ...bisStation(2, 'gut', true), schritt: { ort: 'kapitel', kapitel: 's3', teil: 'szene' } as const };
  const k = buchDruck(g, kurz);
  assert.ok(k);
  const zweite = k.querySelectorAll<HTMLElement>('tbody tr')[1];
  assert.deepEqual([...(zweite as HTMLElement).querySelectorAll('td')].map(text).slice(2, 4), ['–', '–']);
});

/* ------------------------------------------------------------------ Verlauf -- */

test('Verlauf, Pause: Kopf „Ihr Weg bis hier“, Textfassung je Station mit Veränderung und Stand, ohne Zahlen; zugeklappt am Bildschirm, offen auf der Leinwand', () => {
  const s = { ...bisStation(5), schritt: { ort: 'pause', akt: 'a1' } as const };
  const el = baueSchritt({ g, stand: s, bedienbar: true, themaTitel: () => null, tue: () => undefined });
  const v = el.querySelector<HTMLElement>('[data-pruef="gs-verlauf"]') as HTMLElement;
  assert.equal(text(v.querySelector('.gs-verlauf-kopf') as Element), 'Ihr Weg bis hier');
  const details = v.querySelector<HTMLDetailsElement>('details.gs-verlauf-worte') as HTMLDetailsElement;
  assert.equal(details.open, false);
  assert.equal(text(details.querySelector('summary') as Element), 'Verlauf als Text');
  assert.equal(text(details.querySelector('.gs-verlauf-legende') as Element), W.geschichte.verlaufLegende);
  const zeilen = [...details.querySelectorAll<HTMLElement>('.gs-verlauf-liste > li')];
  assert.equal(zeilen.length, 5);
  assert.match(text(zeilen[3] as HTMLElement), /^4 · Station 4: Geld \S+( \S+)? .*, Zeit .*, Vertrauen .*\./u);
  assert.match(text(zeilen[0] as HTMLElement), /Geld (gut gefüllt|etwa halb voll|knapp) · Zeit (gut gefüllt|etwa halb voll|knapp) · Vertrauen (gut gefüllt|etwa halb voll|knapp)$/u);
  assert.doesNotMatch(text(v), /\d+ (Punkte|von 10)|(Geld|Zeit|Vertrauen):? \d/u, 'ohne Zahlen');
  assert.doesNotMatch(text(v), /\bFalle\b|\bgut gewählt\b|Wertung/u);
  // Leinwand: offen
  const stumm = baueSchritt({ g, stand: s, bedienbar: false, themaTitel: () => null, tue: () => undefined });
  assert.equal(stumm.querySelector<HTMLDetailsElement>('details.gs-verlauf-worte')?.open, true);
  assert.equal(stumm.querySelectorAll('button').length, 0);
});

test('Verlauf: die Wörter der Veränderung stammen aus den Balken (etwas · deutlich · unverändert) und stimmen mit den Ständen der Engine', () => {
  const s = { ...bisStation(14), schritt: { ort: 'ende' } as const };
  const v = verlauf(g, s, 14, 'Kopf', true);
  const zeilen = [...v.querySelectorAll<HTMLElement>('.gs-verlauf-liste > li')];
  assert.equal(zeilen.length, 14);
  const punkte = E.verlaufBis(g, s, 14);
  zeilen.forEach((z, i) => {
    const nach = (punkte[i + 1] as (typeof punkte)[number]).balken;
    const vor = (punkte[i] as (typeof punkte)[number]).balken;
    for (const [id, titel] of [['geld', 'Geld'], ['zeit', 'Zeit'], ['vertrauen', 'Vertrauen']] as const) {
      const d = nach[id] - vor[id];
      const re = d === 0 ? new RegExp(`${titel} (unverändert|bleibt ganz (oben|unten))`, 'u') : new RegExp(`${titel} ${Math.abs(d) >= 2 ? 'deutlich' : 'etwas'} `, 'u');
      assert.match(text(z), re, `Station ${i + 1} ${id}`);
    }
    assert.match(text(z.querySelector('.gs-verlauf-stand') as Element), new RegExp(`Geld ${W.geschichte.verlaufStreifen[E.stufe(nach.geld)]}`, 'u'));
  });
});

test('Verlauf, offene Stationen: „noch offen“, die Linie reißt ab, kein Stand und keine gestrichelte Verbindung', () => {
  let s = E.neuerStand();
  for (const k of g.kapitel) if (k.nr !== 2 && k.nr <= 4) s = E.waehle(g, s, k.id, platzVon(k, 'gut'));
  s = { ...s, schritt: { ort: 'kapitel', kapitel: 's4', teil: 'frage' } };
  const v = verlauf(g, s, 4, 'Kopf', true);
  const zeilen = [...v.querySelectorAll<HTMLElement>('.gs-verlauf-liste > li')];
  assert.equal(text(zeilen[1] as HTMLElement), '2 · Station 2: noch offen');
  assert.equal((zeilen[1] as HTMLElement).dataset['offen'], 'true');
  assert.equal((zeilen[1] as HTMLElement).querySelector('.gs-verlauf-stand'), null);
  // Grafik: Start und Stationen 1, 3, 4 – ohne Punkt für Station 2; die Linie reißt ab (zwei Strecken je Linie)
  const svg = v.querySelector('svg.vb') as SVGElement;
  assert.equal(svg.querySelectorAll('circle.vb-geld').length, 4, 'Start und drei beantwortete Stationen');
  assert.equal(svg.querySelectorAll('polyline.vb-geld').length, 2);
  assert.equal(svg.querySelectorAll('[stroke-dasharray]').length, 0, 'keine Verbindung über die Lücke');
});

test('Verlauf, Kurzfassung: übersprungene Stationen als hohle Punkte, Legende „Hohle Punkte: Diese Stationen wurden nur erzählt.“, keine gespielte Station hohl', () => {
  const s = { ...bisStation(14, 'gut', true), schritt: { ort: 'ende' } as const };
  const v = verlauf(g, s, 14, 'Kopf', true);
  const svg = v.querySelector('svg.vb') as SVGElement;
  assert.equal(svg.querySelectorAll('circle.vb-geld').length, 15);
  assert.equal(svg.querySelectorAll('circle.vb-geld.vb-punkt-hohl').length, 10, 'zehn übersprungene Stationen');
  assert.equal(text(v.querySelector('[data-pruef="gs-verlauf-hohl"]') as Element), 'Hohle Punkte: Diese Stationen wurden nur erzählt.');
  assert.equal(v.querySelectorAll('li[data-erzaehlt="true"]').length, 10);
  // Gegenprobe: ganzer Weg ohne hohle Punkte und ohne Legende
  const lang = verlauf(g, { ...bisStation(14), schritt: { ort: 'ende' } }, 14, 'Kopf', true);
  assert.equal(lang.querySelectorAll('.vb-punkt-hohl').length, 0);
  assert.equal(lang.querySelector('[data-pruef="gs-verlauf-hohl"]'), null);
});

test('Verlaufsband: Wert null reißt die Linie ab, hohle Punkte, Gegenprobe ohne beides unverändert', () => {
  const reihe = (werte: (number | null)[], hohl?: boolean[]) => [{ klasse: 'vb-geld', name: 'Geld', werte, ...(hohl !== undefined ? { hohl } : {}) }];
  const mitLuecke = verlaufBand(reihe([9, 8, null, 7, 7]), 'x');
  assert.equal((mitLuecke.match(/<polyline/gu) ?? []).length, 2);
  assert.equal((mitLuecke.match(/<circle/gu) ?? []).length, 4);
  assert.equal((verlaufBand(reihe([9, 8, 7]), 'x').match(/<polyline/gu) ?? []).length, 1);
  // die Beschriftung steht an der letzten vorhandenen Stelle
  assert.match(verlaufBand(reihe([9, 8, null]), 'x'), /<text class="vb-name vb-geld"/u);
  assert.equal((verlaufBand(reihe([null, null]), 'x').match(/<text/gu) ?? []).length, 0, 'ganz ohne Werte keine Beschriftung');
  const hohl = verlaufBand(reihe([9, 8, 7], [false, true, false]), 'x');
  assert.equal((hohl.match(/vb-punkt-hohl/gu) ?? []).length, 1);
  assert.doesNotMatch(verlaufBand(reihe([9, 8, 7], [false, false, false]), 'x'), /vb-punkt-hohl/u);
  assert.doesNotMatch(mitLuecke, /id="|url\(#/u);
});

test('Verlauf in der Bilanz (mit Akten): Kopf „Ihr Weg im Überblick“, auch in der Kurzfassung und bei offenen Stationen; ohne Akte keiner; nicht auf der Pause doppelt', () => {
  const lang = baueSchritt({ g, stand: { ...bisStation(14), schritt: { ort: 'ende' } }, bedienbar: true, themaTitel: () => null, tue: () => undefined });
  assert.equal(text(lang.querySelector('[data-pruef="gs-bilanz"] .gs-verlauf-kopf') as Element), 'Ihr Weg im Überblick');
  const kurz = baueSchritt({ g, stand: { ...bisStation(14, 'gut', true), schritt: { ort: 'ende' } }, bedienbar: true, themaTitel: () => null, tue: () => undefined });
  assert.ok(kurz.querySelector('[data-pruef="gs-bilanz"] [data-pruef="gs-verlauf"]'));
  const offen = baueSchritt({ g, stand: { ...bisStation(3), schritt: { ort: 'ende' } }, bedienbar: true, themaTitel: () => null, tue: () => undefined });
  assert.ok(offen.querySelector('[data-pruef="gs-bilanz"] [data-pruef="gs-verlauf"]'));
  assert.ok(offen.querySelectorAll('.gs-verlauf-liste li[data-offen="true"]').length > 0);
  // Gegenprobe: eine Story ohne Akte zeigt keinen Verlauf in der Bilanz (wie bisher)
  const ohneAkte = structuredClone(g);
  ohneAkte.akte = [];
  const el = baueSchritt({ g: ohneAkte, stand: { ...bisStation(14), schritt: { ort: 'ende' } }, bedienbar: true, themaTitel: () => null, tue: () => undefined });
  assert.equal(el.querySelector('[data-pruef="gs-verlauf"]'), null);
});

test('Verlauf, Druck: auf der Bilanzseite Vektor und Textfassung offen; die Pause steht nicht im Druck', () => {
  const s = { ...bisStation(14), schritt: { ort: 'ende' } as const };
  const wurzel = document.createElement('div');
  wurzel.append(...storyDruck(g, s, 'Test').teile.map((t) => t.cloneNode(true)));
  const v = wurzel.querySelector('[data-pruef="druck-bilanz"] [data-pruef="gs-verlauf"]');
  assert.ok(v);
  assert.ok(v.querySelector('svg.vb'));
  assert.equal(v.querySelector<HTMLDetailsElement>('details')?.open, true);
  assert.equal(wurzel.querySelector('.gs-pause'), null);
  // vor dem Ende keine Bilanz, kein Verlauf
  const mitten = document.createElement('div');
  mitten.append(...storyDruck(g, bisStation(3), 'Test').teile.map((t) => t.cloneNode(true)));
  assert.equal(mitten.querySelector('[data-pruef="gs-verlauf"]'), null);
});

test('Pause: die Zeile „gespeichert“ nur, wenn der Stand wirklich im Browser liegt, und nie auf der Leinwand; bei offenen Stationen statt „Das können Sie jetzt“ ein Satz', () => {
  const s = { ...bisStation(5), schritt: { ort: 'pause', akt: 'a1' } as const };
  const opt = (gespeichert: boolean | undefined, bedienbar = true) => ({ g, stand: s, bedienbar, themaTitel: () => null, tue: () => undefined, ...(gespeichert !== undefined ? { gespeichert } : {}) });
  assert.equal(text(baueSchritt(opt(true)).querySelector('[data-pruef="gs-gespeichert"]') as Element), W.geschichte.gespeichert);
  assert.equal(baueSchritt(opt(false)).querySelector('[data-pruef="gs-gespeichert"]'), null);
  assert.equal(baueSchritt(opt(undefined)).querySelector('[data-pruef="gs-gespeichert"]'), null);
  assert.equal(baueSchritt(opt(true, false)).querySelector('[data-pruef="gs-gespeichert"]'), null, 'Leinwand');
  // offene Station im Akt (Station 2 ohne Antwort)
  let o = E.neuerStand();
  for (const k of g.kapitel) if (k.nr <= 5 && k.nr !== 2) o = E.waehle(g, o, k.id, platzVon(k, 'gut'));
  const el = baueSchritt({ g, stand: { ...o, schritt: { ort: 'pause', akt: 'a1' } }, bedienbar: true, themaTitel: () => null, tue: () => undefined });
  assert.equal(el.querySelector('[data-pruef="gs-koennen-a1"]'), null);
  assert.equal(text(el.querySelector('[data-pruef="gs-pause-offen"]') as Element), W.geschichte.pauseOffen);
  const knopf = el.querySelector<HTMLElement>('[data-pruef="pause-zur-offenen"]');
  assert.ok(knopf);
  assert.match(text(knopf), /Zur ersten offenen Entscheidung: 2 · Station 2/u);
  assert.ok(el.querySelector('[data-pruef="pause-weiter"]'), 'der Knopf „Weiter“ bleibt');
});

test('Speicher: gespeichert wird sichtbar, sobald der Stand im Speicher liegt – ohne Speicher nie', () => {
  const sp = speicher();
  const f = flaeche(an('s5', 'szene', bisStation(4)), sp);
  // zur Pause springen: erst Antwort in Station 5, dann weiter bis zur Pause
  (finde(f, 'weiter') as HTMLElement).click();
  (finde(f, 'antwort-1') as HTMLElement).click();
  for (let i = 0; i < 4 && f.stand().schritt.ort !== 'pause'; i += 1) (finde(f, 'weiter') as HTMLElement).click();
  assert.equal(f.stand().schritt.ort, 'pause');
  assert.ok(finde(f, 'gs-gespeichert'), 'Stand liegt im Speicher');
  assert.ok(sp.daten.has(SPEICHER_SCHLUESSEL));
  // ohne Speicher (null): keine Zeile
  const f2 = erzeugeGeschichte({ g, speicher: null, themaTitel: () => null });
  document.body.replaceChildren(f2.element);
  f2.zuKapitel('s5');
  assert.equal(finde(f2, 'gs-gespeichert'), null);
});

test('Speicher (P19.7): „neu“ im Buch liegt nur im Speicher der Seite; „Gespeicherten Fortschritt löschen“ setzt es mit zurück', () => {
  const sp = speicher();
  const f = flaeche(an('s1', 'frage'), sp);
  (finde(f, 'antwort-1') as HTMLElement).click();
  (finde(f, 'buch-symbol') as HTMLElement).click();
  (finde(f, 'buch-schliessen') as HTMLElement).click();
  assert.equal(finde(f, 'buch-symbol')?.dataset['neu'], undefined, 'gesehen');
  // gespeichert wird der Stand der Geschichte, nichts vom Buch („gesehen“, „neu“)
  const roh = sp.daten.get(SPEICHER_SCHLUESSEL) ?? '';
  assert.deepEqual(Object.keys(JSON.parse(roh) as object).sort(), ['gewichte', 'kurz', 'mini', 'schritt', 'v', 'wahlen']);
  assert.ok(!/gesehen|neu|buch/iu.test(roh), roh);
  assert.deepEqual([...sp.daten.keys()], [SPEICHER_SCHLUESSEL], 'nur ein Schlüssel');
  // ein neuer Besuch (frische Fläche, derselbe Speicher) zeigt den Eintrag wieder als neu
  const neuer = flaeche(null, sp);
  assert.equal(finde(neuer, 'buch-symbol')?.dataset['neu'], 'true', 'neuer Besuch: Eintrag ist wieder neu');
  // löschen: der Speicher ist leer, und nach einer neuen Antwort ist der Eintrag wieder neu (nichts bleibt „gesehen“)
  (finde(neuer, 'buch-symbol') as HTMLElement).click();
  (finde(neuer, 'buch-schliessen') as HTMLElement).click();
  assert.equal(finde(neuer, 'buch-symbol')?.dataset['neu'], undefined, 'in diesem Besuch gesehen');
  (finde(neuer, 'fortschritt-loeschen') as HTMLElement).click();
  assert.equal(sp.daten.get(SPEICHER_SCHLUESSEL), undefined);
  neuer.zuKapitel('s1');
  (finde(neuer, 'weiter') as HTMLElement).click();
  (finde(neuer, 'antwort-1') as HTMLElement).click();
  assert.equal(finde(neuer, 'buch-symbol')?.dataset['neu'], 'true');
});

test('Datenschutz (P19.7): Abschnitt 5 nennt Pausen, Buch, Weg im Überblick und „neu“ wie die Seite sie hält; die Löschknöpfe stehen wortgleich dort', async () => {
  const { readFileSync } = await import('node:fs');
  const md = readFileSync('inhalte/rechtliches/datenschutz.md', 'utf8');
  const abschnitt = /## 5\. Speicherung in Ihrem Browser([\s\S]*?)\n## 6\./u.exec(md)?.[1] ?? '';
  assert.ok(abschnitt.length > 500);
  assert.match(abschnitt, /auch eine der Pausen zwischen den drei Teilen/u);
  assert.match(abschnitt, /das Entscheidungsbuch stellt die Seite bei jedem Aufruf aus diesen Angaben neu zusammen/u);
  assert.match(abschnitt, new RegExp(`„${W.geschichte.verlaufBilanz}“`, 'u'));
  assert.match(abschnitt, /„neu“ gekennzeichnet sind, merkt sich die Seite nur, solange Sie sie geöffnet haben, nicht im Browser-Speicher/u);
  // die Knopfwörter der Seite
  for (const knopf of [W.geschichte.fortschrittLoeschen, W.themen.zuruecksetzen, W.regie.protokollLoeschen]) assert.ok(abschnitt.includes(`„${knopf}“`), knopf);
  // Wörter, die die Seite benutzt (Buch, Pause), stehen auch dort so
  assert.ok(W.geschichte.buchTitel.length > 0 && /Entscheidungsbuch/u.test(`${W.regie.buchZeigen} ${W.geschichte.buchTitel}`));
  // Gegenprobe: ohne die Zusätze fällt der Test auf
  assert.doesNotMatch(abschnitt.replace(/auch eine der Pausen zwischen den drei Teilen/u, ''), /Pausen zwischen den drei Teilen/u);
});

test('Papier (P19.7, L-364): keine Mini-Art hat eine Papierfassung – der Druckbogen trägt weder Aufgabe noch Posten noch Stand der Mini-Aufgaben', async () => {
  const E0 = await import('../src/geschichte/engine.ts');
  const { loeseMini } = await import('../src/regie/eingriffe.ts');
  const { MINI_BAUSTEINE } = await import('../src/ui/flaechen/geschichte-mini.ts');
  const { storyDruck } = await import('../src/ui/flaechen/geschichte.ts');
  for (const art of ['zuordnen', 'reihenfolge', 'matrix', 'mappe', 'pinnwand', 'bericht', 'rueckfragen'] as const) assert.equal(MINI_BAUSTEINE[art].druck, undefined, `${art}: Papierfassung – dann INHALTSFORMAT und diesen Test anpassen`);
  // alles gelöst, ganzer Weg bis zum Ende: der Druck nennt keinen Aufgabentext (eine Zeile `aufgabe`, ein Posten)
  assert.ok(ECHT);
  let stand: Stand = { ...E0.neuerStand(), schritt: { ort: 'ende' as const } };
  for (const k of ECHT.kapitel) stand = loeseMini(ECHT, stand, k.id);
  const wurzel = document.createElement('div');
  wurzel.append(...storyDruck(ECHT, stand, 'Test').teile.map((t) => t.cloneNode(true)));
  const text = (wurzel.textContent ?? '').replace(/\s+/gu, ' ');
  assert.ok(text.length > 2000, 'Druckbogen gezeichnet');
  for (const k of ECHT.kapitel.filter((k) => k.mini !== null)) {
    const m = k.mini;
    assert.ok(m);
    const aufgabe = m.aufgabeHtml.replace(/<[^>]*>/gu, '').replace(/\s+/gu, ' ').trim();
    if (aufgabe.length > 20) assert.ok(!text.includes(aufgabe), `${k.id}: Aufgabentext im Druck`);
  }
  // Gegenprobe: die Frage der Station steht im Druck (der Test prüft also etwas)
  assert.ok(ECHT.kapitel.some((k) => text.includes(k.frageHtml.replace(/<[^>]*>/gu, '').replace(/\s+/gu, ' ').trim().slice(0, 30))));
});
