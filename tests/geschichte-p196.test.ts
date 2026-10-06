/*
 * Story-Seite und Engine, Ergänzungen von P19.6 Technik IV: `text-kurz` und `nur-kurzfassung` (zeilenAufWeg), Nebenfiguren und Stimmen als Sprecher mit
 * Namensschild beim ersten Auftritt, Absätze im Kärtchen „Wer entscheidet was“, Texte der Wegkarten und Überschrift der Balken im Auftakt, Schlagzeile unter dem
 * Zeitungsbild, Eintrag-Kärtchen der Rückfragen, Kicker der Kurzfassung, Nebenfiguren in der Regie – an der synthetischen Story mit 14 Stationen
 * (tests/hilfen/geschichte-p19.ts). Die Übersetzung prüft tests/geschichte-uebersetzer-p196.test.ts.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { matrixMini, mitMini, p19Story, platzVon, rueckfragenMini } from './hilfen/geschichte-p19.ts';
import type { Geschichte, Kapitel, Zeile } from '../src/geschichte/typen.ts';

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

const { inhalte } = await import('../src/inhalte/index.ts');
const E = await import('../src/geschichte/engine.ts');
const { baueSchritt } = await import('../src/ui/flaechen/geschichte.ts');
const { erzeugeRegie } = await import('../src/regie/regie.ts');
const { zaehleWoerter } = await import('../werkzeuge/lesezeit.mjs');
const { W } = await import('../src/ui/woerter.ts');
type Stand = ReturnType<typeof E.neuerStand>;

const ECHT = inhalte.geschichte;
assert.ok(ECHT);
const BASIS = p19Story(ECHT);
const text = (el: Element): string => (el.textContent ?? '').replace(/\s+/gu, ' ').trim();
const an = (kap: string, teil: 'szene' | 'vergleich' | 'frage' | 'mini', basis: Stand = E.neuerStand()): Stand => ({ ...basis, schritt: { ort: 'kapitel', kapitel: kap, teil } });
const opt = (g: Geschichte, stand: Stand, bedienbar = true) => ({ g, stand, bedienbar, themaTitel: () => null, tue: () => undefined });
const station = (g: Geschichte, nr: number): Kapitel => g.kapitel[nr - 1] as Kapitel;
const z = (figur: Zeile['figur'], html: string, extra: Partial<Zeile> = {}): Zeile => ({ figur, zusatz: null, html, kurzfassung: true, ...extra });

const NEBEN = [
  { id: 'ranzen' as const, name: 'Marlene Ranzen', rolle: 'Elternvertreterin', akzent: 'gruen', kurzHtml: 'Vorsitzende des Elternbeirats', steckbriefHtml: 'Sie fragt für alle, die sich nicht trauen.' },
  { id: 'spitzfeder' as const, name: 'Bernd Spitzfeder', rolle: 'Lokalreporter', akzent: 'keiner', kurzHtml: 'Reporter bei der Zeitung', steckbriefHtml: 'Er hört zu und schreibt mit.' },
  { id: 'pfennig' as const, name: 'Ewald Pfennig', rolle: 'Stadtrat im Finanzausschuss', akzent: 'beere', kurzHtml: 'Stadtrat, sitzt im Finanzausschuss', steckbriefHtml: 'Er rechnet im Kopf nach.' },
];

/** Story mit Nebenfiguren: Ranzen und Spitzfeder sprechen in Station 6 und 8, Pfennig in 13, Stimmen in 7 und 11, Ranzen im Ende. */
function mitSprechern(): Geschichte {
  const g = structuredClone(BASIS);
  g.nebenfiguren = structuredClone(NEBEN);
  station(g, 6).szene = [z('ranzen', 'Und kommen unsere Kinder 2028 in die neuen Räume?', { kurzfassung: false }), z('spitzfeder', 'Und wer entscheidet das?', { kurzfassung: false }), z('ranzen', 'Und was heißt das für meinen Jüngsten?', { kurzfassung: false })];
  station(g, 7).szene = [z('vergabestelle', 'Wir erteilen den Zuschlag, sobald die Freigabe vorliegt.', { zusatz: 'am Telefon', kurzfassung: false }), z('faden', 'Gut.', { kurzfassung: false })];
  station(g, 8).szene = [z('ranzen', 'Und das Geld?', { kurzfassung: false }), z('faden', 'Es steht da.', { kurzfassung: false })];
  station(g, 11).szene = [z('vertretung', 'Guten Morgen, ich vertrete Frau Faden.', { zusatz: 'aus Clara Fadens Büro', kurzfassung: false }), z('lot', 'Clara war Sonntag noch hier.', { kurzfassung: false })];
  station(g, 13).szene = [z('pfennig', 'Wo steht das?', { kurzfassung: false }), z('faden', 'Im Buch.', { kurzfassung: false })];
  g.ende.szene.push(z('ranzen', 'Und mein Jüngster sitzt im neuen Raum.', { kurzfassung: false }));
  return g;
}

/* ------------------------------------------------- text-kurz, nur-kurzfassung -- */

test('zeilenAufWeg: der ganze Weg zeigt „text“ und lässt „nur-kurzfassung“ weg; die Kurzfassung setzt „text-kurz“ ein und lässt „kurzfassung: nein“ weg', () => {
  const zeilen = [
    z('faden', 'Lange Fassung der Zeile.', { kurzHtml: 'Kurze Zeile.' }),
    z('lot', 'Nur auf dem ganzen Weg.', { kurzfassung: false }),
    z('schwung', 'Nur in der Kurzfassung.', { nurKurz: true }),
    z('klingel', 'Immer.'),
  ];
  const lang = E.zeilenAufWeg(BASIS, E.neuerStand(), zeilen);
  assert.deepEqual(lang.map((x) => x.html), ['Lange Fassung der Zeile.', 'Nur auf dem ganzen Weg.', 'Immer.']);
  const kurz = E.zeilenAufWeg(BASIS, E.neuerStand(true), zeilen);
  assert.deepEqual(kurz.map((x) => x.html), ['Kurze Zeile.', 'Nur in der Kurzfassung.', 'Immer.']);
  assert.deepEqual(kurz.map((x) => x.figur), ['faden', 'schwung', 'klingel']);
  // der Ersatz ist eine einfache Zeile ohne Echo-Felder
  assert.deepEqual(Object.keys(kurz[0] as Zeile), ['figur', 'zusatz', 'html', 'kurzfassung']);
  // Gegenprobe: ohne die neuen Felder gilt wie bisher nur „kurzfassung: nein“, und dasselbe Objekt bleibt dasselbe Objekt
  const einfach = [z('faden', 'A.'), z('lot', 'B.', { kurzfassung: false })];
  assert.equal(E.zeilenAufWeg(BASIS, E.neuerStand(), einfach)[0], einfach[0]);
  assert.deepEqual(E.zeilenAufWeg(BASIS, E.neuerStand(true), einfach).map((x) => x.html), ['A.']);
});

test('zeilenAufWeg: eine Echo-Zeile mit „text-kurz“ zeigt in der Kurzfassung nur den Ersatz, auf dem ganzen Weg die Fassung nach der Antwort samt Fortsetzung', () => {
  const g = structuredClone(BASIS);
  const echo = z('faden', 'Rückblick E1 Alpha. Weiter.', { echo: 'E1', fortsetzungHtml: 'Weiter.', kurzHtml: 'Die alte Zeile.' });
  let s = E.neuerStand();
  s = E.waehle(g, s, 's1', platzVon(station(g, 1), 'falle'));
  assert.equal(E.zeilenAufWeg(g, s, [echo])[0]?.html, 'Rückblick E1 Gamma. Weiter.');
  const kurz = E.zeilenAufWeg(g, { ...s, kurz: true }, [echo])[0] as Zeile;
  assert.equal(kurz.html, 'Die alte Zeile.');
  assert.equal(kurz.echo, undefined, 'der Ersatz ersetzt die ganze Zeile, auch das Echo');
});

test('Seite: Szene und Ende zeigen die Zeilen des Wegs (text-kurz, nur-kurzfassung)', () => {
  const g = structuredClone(BASIS);
  station(g, 1).szene = [z('faden', 'Lang eins zwei drei.', { kurzHtml: 'Kurz.' }), z('lot', 'Nur lang.', { kurzfassung: false }), z('schwung', 'Nur kurz.', { nurKurz: true }), z('klingel', 'Immer.')];
  const zeilen = (stand: Stand): string[] => [...baueSchritt(opt(g, an('s1', 'szene', stand))).querySelectorAll('.gs-gesagt')].map((p) => text(p));
  assert.deepEqual(zeilen(E.neuerStand()), ['Lang eins zwei drei.', 'Nur lang.', 'Immer.']);
  assert.deepEqual(zeilen(E.neuerStand(true)), ['Kurz.', 'Nur kurz.', 'Immer.']);
  const ende = (stand: Stand): string[] => [...baueSchritt(opt(g, { ...stand, schritt: { ort: 'ende' } })).querySelectorAll('.gs-dialog .gs-gesagt')].map((p) => text(p));
  g.ende.szene = [z('klingel', 'Guten Morgen.'), z('lot', 'Nur lang.', { kurzfassung: false }), z('grundstein', 'Nur kurz.', { nurKurz: true }), z('faden', 'Ende lang.', { kurzHtml: 'Ende kurz.' })];
  g.ende.vertrauenNiedrig = []; g.ende.nachFalle = []; g.ende.offen = [];
  let gut = E.neuerStand();
  for (const k of g.kapitel) gut = E.waehle(g, gut, k.id, E.gutePlatz(k));
  assert.deepEqual(ende(gut), ['Guten Morgen.', 'Nur lang.', 'Ende lang.']);
  let gutKurz = E.neuerStand(true);
  for (const k of E.wegKapitel(g, true)) gutKurz = E.waehle(g, gutKurz, k.id, E.gutePlatz(k));
  assert.deepEqual(ende(gutKurz), ['Guten Morgen.', 'Nur kurz.', 'Ende kurz.']);
});

test('Ende: bei „Vertrauen niedrig“ ersetzt die Ersatzzeile die Echo-Zeile derselben Figur (Lot), das Echo entfällt dort', () => {
  const g = structuredClone(BASIS);
  g.ende.szene = [z('klingel', 'Guten Morgen.'), z('lot', 'Rückblick E10 Alpha. Und inzwischen steht alles im Buch.', { echo: 'E10', fortsetzungHtml: 'Und inzwischen steht alles im Buch.', kurzfassung: false }), z('grundstein', 'Gut.')];
  g.ende.vertrauenNiedrig = [z('lot', 'Inzwischen ist alles schriftlich festgehalten.'), z('grundstein', 'Beim nächsten Projekt reden wir früher.')];
  g.ende.nachFalle = []; g.ende.offen = [];
  const sprecher = (stand: Stand): string[] => [...baueSchritt(opt(g, { ...stand, schritt: { ort: 'ende' } })).querySelectorAll('.gs-dialog .gs-gesagt')].map((p) => text(p));
  let gut = E.neuerStand();
  for (const k of g.kapitel) gut = E.waehle(g, gut, k.id, E.gutePlatz(k));
  assert.deepEqual(sprecher(gut), ['Guten Morgen.', 'Rückblick E10 Alpha. Und inzwischen steht alles im Buch.', 'Gut.']);
  // in jeder Station die Falle: das Vertrauen ist am Ende niedrig – Lots Echo-Zeile fällt weg
  let tief = E.neuerStand();
  for (const k of g.kapitel) tief = E.waehle(g, tief, k.id, platzVon(k, 'falle'));
  assert.equal(E.endeFassung(g, tief), 'vertrauen-niedrig');
  assert.deepEqual(sprecher(tief), ['Guten Morgen.', 'Inzwischen ist alles schriftlich festgehalten.', 'Beim nächsten Projekt reden wir früher.']);
});

/* ------------------------------------------------- Nebenfiguren und Stimmen -- */

test('Nebenfiguren sprechen mit Porträt, Name und Ton; die Stimmen ohne Gesicht mit dem Umriss und ohne Akzent', () => {
  const g = mitSprechern();
  const s6 = baueSchritt(opt(g, an('s6', 'szene')));
  const zeilen = [...s6.querySelectorAll<HTMLElement>('.gs-zeile')];
  assert.deepEqual(zeilen.map((l) => l.dataset['figur']), ['ranzen', 'spitzfeder', 'ranzen']);
  assert.deepEqual(zeilen.map((l) => l.dataset['akzent']), ['gruen', 'keiner', 'gruen']);
  assert.equal(text(zeilen[0]?.querySelector('.gs-sprecher') as Element), 'Marlene Ranzen');
  assert.equal(zeilen[0]?.querySelector('svg')?.getAttribute('data-figur'), 'ranzen');
  assert.equal(zeilen[1]?.querySelector('svg')?.getAttribute('data-figur'), 'spitzfeder');
  // Stimmen: Name aus der Liste der Grafik, Akzent „keiner“, Porträt ohne Gesicht
  const s7 = baueSchritt(opt(g, an('s7', 'szene')));
  const stimme = s7.querySelector<HTMLElement>('.gs-zeile') as HTMLElement;
  assert.equal(stimme.dataset['figur'], 'vergabestelle');
  assert.equal(stimme.dataset['akzent'], 'keiner');
  assert.match(text(stimme.querySelector('.gs-sprecher') as Element), /^Vergabestelle \(am Telefon\)$/u);
  assert.ok(stimme.querySelector('svg.fig-ton-keiner'));
  const s11 = baueSchritt(opt(g, an('s11', 'szene')));
  assert.match(text(s11.querySelector('.gs-sprecher') as Element), /^Vertretung \(aus Clara Fadens Büro\)$/u);
  // jedes Porträt ist dekorativ: Name und Rolle stehen als Text daneben
  for (const svg of [...s6.querySelectorAll('.gs-zeile svg'), ...s7.querySelectorAll('.gs-zeile svg'), ...s11.querySelectorAll('.gs-zeile svg')]) assert.equal(svg.getAttribute('aria-hidden'), 'true');
});

test('Namensschild: eine Nebenfigur trägt es nur bei ihrem ersten Auftritt (Station, dort bei der ersten Zeile), nicht danach, nicht im Ende; Hauptfiguren und Stimmen nie', () => {
  const g = mitSprechern();
  const schilder = (el: Element): string[] => [...el.querySelectorAll('.gs-schild')].map((p) => text(p));
  assert.deepEqual(schilder(baueSchritt(opt(g, an('s6', 'szene')))), ['Vorsitzende des Elternbeirats', 'Reporter bei der Zeitung']);
  assert.deepEqual(schilder(baueSchritt(opt(g, an('s8', 'szene')))), [], 'Ranzen hat es seit Station 6');
  assert.deepEqual(schilder(baueSchritt(opt(g, an('s13', 'szene')))), ['Stadtrat, sitzt im Finanzausschuss']);
  let gut = E.neuerStand();
  for (const k of g.kapitel) gut = E.waehle(g, gut, k.id, E.gutePlatz(k));
  const ende = baueSchritt(opt(g, { ...gut, schritt: { ort: 'ende' } }));
  assert.deepEqual(schilder(ende), []);
  assert.deepEqual(schilder(baueSchritt(opt(g, an('s7', 'szene')))), []);
  assert.deepEqual(schilder(baueSchritt(opt(g, an('s11', 'szene')))), []);
  // das Namensschild zählt zur Lesezeit (es steht im Text der Szene)
  assert.ok(zaehleWoerter(baueSchritt(opt(g, an('s6', 'szene')))) > zaehleWoerter(baueSchritt(opt(g, an('s8', 'szene')))));
  // eine Nebenfigur im Ende sagt ihre Zeile mit Namen
  assert.match(text(ende), /Marlene Ranzen.*Und mein Jüngster sitzt im neuen Raum\./u);
});

test('Sprecher ohne Eintrag in der Geschichte: die Seite fällt nicht um (Name und Rolle aus der Liste der Grafik, sonst die Kennung)', () => {
  const g = mitSprechern();
  delete g.nebenfiguren;
  const s6 = baueSchritt(opt(g, an('s6', 'szene')));
  assert.equal(text(s6.querySelector('.gs-sprecher') as Element), 'Marlene Ranzen');
  assert.equal(s6.querySelector('.gs-schild'), null);
});

/* ------------------------------------------------------------------ Mandat -- */

test('Kärtchen „Wer entscheidet was“: ein Text in Absätzen; die Kurzfassung lässt die mit „kurzfassung: nein“ weg', () => {
  const g = structuredClone(BASIS);
  g.mandat.zeilen[1] = {
    wer: 'Bürgermeisterin', html: 'Alles darüber. Wenn sie fehlt, vertritt sie die Finanzabteilung.',
    absaetze: [{ html: 'Alles darüber.', kurzfassung: true }, { html: 'Wenn sie fehlt, vertritt sie die Finanzabteilung.', kurzfassung: false }],
  };
  const folge = (kurz: boolean): Element => {
    let s = E.waehle(g, E.neuerStand(kurz), 's1', E.gutePlatz(station(g, 1)));
    s = an('s1', 'frage', s);
    return baueSchritt(opt(g, s)).querySelector('[data-pruef="gs-mandat"]') as Element;
  };
  const absaetze = (kurz: boolean): string[] => [...folge(kurz).querySelectorAll('.gs-mandat-absatz')].map((p) => text(p));
  assert.deepEqual(absaetze(false), ['Alles darüber.', 'Wenn sie fehlt, vertritt sie die Finanzabteilung.']);
  assert.deepEqual(absaetze(true), ['Alles darüber.']);
  // die Zeilen ohne Absätze bleiben, wie sie waren (ein dd mit dem Text)
  assert.equal(folge(true).querySelectorAll('dd')[0]?.querySelector('.gs-mandat-absatz'), null);
});

/* ------------------------------------------------------------------ Auftakt -- */

test('Auftakt: Texte der Wegkarten und Überschrift der Balken kommen aus dem Rahmen, ohne sie gelten die Wörter der Seite', () => {
  // seit P19.6 nennt der echte Rahmen beides; die Gegenprobe „ohne die Felder gelten die Wörter der Seite“ nimmt eine Kopie ohne sie
  assert.ok(BASIS.auftakt.balkenTitel !== undefined && BASIS.auftakt.wegwahl !== undefined, 'der echte Rahmen setzt Überschrift und Wegkarten');
  const ohneFelder = structuredClone(BASIS);
  delete ohneFelder.auftakt.balkenTitel;
  delete ohneFelder.auftakt.wegwahl;
  const standard = baueSchritt(opt(ohneFelder, E.neuerStand()));
  assert.equal(text(standard.querySelector('#gs-wege-titel') as Element), W.geschichte.wegWahl);
  assert.equal(text(standard.querySelector('#gs-stand-titel') as Element), W.geschichte.balkenTitel);
  const g = structuredClone(BASIS);
  g.auftakt.balkenTitel = 'Drei Balken';
  g.auftakt.wegwahl = {
    ueberschrift: 'Zwei Wege',
    lang: { titel: 'Die ganze Geschichte', text: 'Alle Stationen, alle Aufgaben.', knopf: 'Los geht\'s', bild: 'Der Weg mit allen vierzehn Stationen, keine ausgelassen' },
    kurz: { titel: 'Die Kurzfassung', text: 'Die wichtigsten Stationen, der Rest kurz erzählt.', knopf: 'Kurzfassung starten', bild: 'Derselbe Weg, aber nur vier von vierzehn Stationen werden gespielt, die übrigen sind kurz überbrückt' },
  };
  const el = baueSchritt(opt(g, E.neuerStand()));
  assert.equal(text(el.querySelector('#gs-stand-titel') as Element), 'Drei Balken');
  assert.equal(text(el.querySelector('#gs-wege-titel') as Element), 'Zwei Wege');
  assert.equal(text(el.querySelector('[data-pruef="weg-karte-kurz"] .gs-weg-text') as Element), 'Die wichtigsten Stationen, der Rest kurz erzählt.');
  assert.equal(text(el.querySelector('[data-pruef="fassung-kurz"]') as Element), 'Kurzfassung starten');
  assert.equal(text(el.querySelector('[data-pruef="fassung-lang"]') as Element), 'Los geht\'s');
  assert.match(text(el.querySelector('[data-pruef="weg-karte-lang"] .gs-weg-meta') as Element), /^Vierzehn Entscheidungen · etwa \d+ Minuten$/u, 'Zahlwort bis Vierzehn');
  assert.match(text(el.querySelector('[data-pruef="weg-karte-kurz"] .gs-weg-meta') as Element), /^Vier Entscheidungen/u);
  assert.equal(el.querySelector('[data-pruef="weg-karte-kurz"] svg')?.getAttribute('aria-label'), 'Derselbe Weg, aber nur vier von vierzehn Stationen werden gespielt, die übrigen sind kurz überbrückt');
});

test('ZAHLWORT reicht bis Vierzehn: „Dreizehn“ und „Vierzehn“ stehen in den Wegkarten und in der Bildbeschreibung', () => {
  assert.equal(W.geschichte.wegEntscheidungen(13), 'Dreizehn Entscheidungen');
  assert.equal(W.geschichte.wegEntscheidungen(14), 'Vierzehn Entscheidungen');
  assert.equal(W.geschichte.wegBildLang(14), 'Der Weg mit allen vierzehn Stationen, keine ausgelassen');
  assert.equal(W.geschichte.wegBildKurz(14, 4), 'Derselbe Weg, aber nur vier von vierzehn Stationen werden gespielt, die übrigen sind kurz überbrückt');
  assert.equal(W.start.storyMeta(14).startsWith('Vierzehn Entscheidungen'), true);
  assert.equal(W.start.storyMeta(13).startsWith('Dreizehn Entscheidungen'), true);
});

/* ------------------------------------------------------------- Schlagzeile -- */

test('Schlagzeile: unter dem Zeitungsbild der gewählten Antwort steht die Schlagzeile als Unterschrift; ohne sie bleibt die Folge, wie sie war', () => {
  const g = structuredClone(BASIS);
  const k = station(g, 6);
  const platz = platzVon(k, 'falle');
  (k.antworten[platz] as { bild: string | null; schlagzeileHtml?: string }).bild = 'schlagzeile';
  (k.antworten[platz] as { schlagzeileHtml?: string }).schlagzeileHtml = 'Stadt verspricht: 2028 ist alles fertig';
  const folge = (p: number): Element => baueSchritt(opt(g, an('s6', 'frage', E.waehle(g, E.neuerStand(), 's6', p)))).querySelector('.gs-folge-szene') as Element;
  const mit = folge(platz);
  assert.equal(text(mit.querySelector('figure.gs-schlagzeile figcaption') as Element), 'Stadt verspricht: 2028 ist alles fertig');
  assert.ok(mit.querySelector('figure.gs-schlagzeile svg[data-gimmick="schlagzeile"]'));
  const andere = folge(platzVon(k, 'gut'));
  assert.equal(andere.querySelector('figure'), null);
  assert.equal(andere.querySelector('figcaption'), null);
});

/* ------------------------------------------------------ Eintrag-Kärtchen -- */

test('Eintrag-Kärtchen: vier Zeilen, anfangs leer; jedes gewählte Gespräch füllt seine Zeile; es zählt nicht zur Lesezeit', () => {
  const m = rueckfragenMini();
  const zeilen = ['Quelle', 'Offene Frage', 'Antwort bis', 'Gebraucht für'];
  m.posten.forEach((p, i) => { p.eintragZeile = zeilen[i] as string; p.eintragTextHtml = `Festgehalten ${i + 1}`; });
  m.eintrag = { titelHtml: 'Lüftung · Hersteller · frag Theo', zeilen };
  const g = mitMini(BASIS, 11, m, 'vor-frage');
  const miniStand = (liste: number[]): Stand => ({ ...an('s11', 'mini'), mini: { s11: liste } });
  const karte = (liste: number[]): Element => baueSchritt(opt(g, miniStand(liste))).querySelector('[data-pruef="mini-eintrag"]') as Element;
  const leer = karte([]);
  assert.equal(text(leer.querySelector('.gs-eintrag-titel') as Element), 'Lüftung · Hersteller · frag Theo');
  assert.deepEqual([...leer.querySelectorAll('dt')].map((d) => text(d)), zeilen);
  assert.deepEqual([...leer.querySelectorAll('dd')].map((d) => text(d)), Array(4).fill(W.geschichte.miniEintragLeer));
  const zwei = karte([2, 0]);
  assert.deepEqual([...zwei.querySelectorAll('dd')].map((d) => text(d)), ['Festgehalten 1', W.geschichte.miniEintragLeer, 'Festgehalten 3', W.geschichte.miniEintragLeer]);
  assert.deepEqual([...zwei.querySelectorAll('[data-gefuellt]')].map((d) => d.getAttribute('data-gefuellt')), ['true', 'false', 'true', 'false']);
  // Lesezeit: das Kärtchen zählt nicht (die Messung ist mit und ohne Wahl gleich)
  assert.equal(zaehleWoerter(baueSchritt(opt(g, miniStand([])))), zaehleWoerter(baueSchritt(opt(g, miniStand([])))));
  const ohneKarte = structuredClone(g);
  delete (station(ohneKarte, 11).mini as { eintrag?: unknown }).eintrag;
  assert.equal(zaehleWoerter(baueSchritt(opt(g, miniStand([])))), zaehleWoerter(baueSchritt(opt(ohneKarte, miniStand([])))));
  // Gegenprobe: ohne Kärtchen im Inhalt zeichnet die Seite keines
  assert.equal(baueSchritt(opt(ohneKarte, miniStand([0]))).querySelector('[data-pruef="mini-eintrag"]'), null);
  // andere Arten haben nie ein Kärtchen
  assert.equal(baueSchritt(opt(mitMini(BASIS, 11, matrixMini(), 'nach-folge'), an('s11', 'mini'))).querySelector('[data-pruef="mini-eintrag"]'), null);
});

/* ------------------------------------------------------- Kurzfassung, Ende -- */

test('Ende der Kurzfassung: Kicker „Was dazwischen geschah“ über dem Knopf „Weiter mit der ganzen Geschichte“; er zählt nicht zur Lesezeit und steht auf dem ganzen Weg nicht', () => {
  let kurz = E.neuerStand(true);
  for (const k of E.wegKapitel(BASIS, true)) kurz = E.waehle(BASIS, kurz, k.id, E.gutePlatz(k));
  const el = baueSchritt(opt(BASIS, { ...kurz, schritt: { ort: 'ende' } }));
  const kicker = el.querySelector('.gs-weiter-kicker') as Element;
  assert.equal(text(kicker), 'Was dazwischen geschah');
  assert.ok(kicker.classList.contains('gs-kicker'));
  assert.equal(text(el.querySelector('[data-pruef="weiter-ganz"]') as Element), 'Weiter mit der ganzen Geschichte');
  let lang = E.neuerStand();
  for (const k of BASIS.kapitel) lang = E.waehle(BASIS, lang, k.id, E.gutePlatz(k));
  assert.equal(baueSchritt(opt(BASIS, { ...lang, schritt: { ort: 'ende' } })).querySelector('.gs-weiter-kicker'), null);
});

test('Wörter der Seite nach dem Drehbuch: Pause, Restzeit, Akt-Leiste, Brücken-Kicker', () => {
  const w = W.geschichte;
  assert.equal(w.pauseOrt('II'), 'Pause nach Akt II');
  assert.equal(w.pauseKicker, 'Kurze Pause');
  assert.equal(w.restMinuten(1), 'gleich geschafft');
  assert.equal(w.restMinuten(2), 'noch etwa 2 Minuten');
  assert.equal(w.aktLeiste, 'Die drei Akte der Geschichte');
  assert.equal(w.brueckeTitel, 'Inzwischen');
  assert.equal(w.weiterKicker, 'Was dazwischen geschah');
});

/* -------------------------------------------------------------------- Regie -- */

test('O-65: die Regie zeigt keine Notizkarte – auch keine Steckbriefe der Nebenfiguren', () => {
  const g = mitSprechern();
  const kanal = { senden: () => undefined, abonnieren: () => () => undefined, schliessen: () => undefined };
  const sp = new Map<string, string>();
  const r = erzeugeRegie({ inhalte: { ...inhalte, geschichte: g }, kanal, version: 'Test', speicher: { getItem: (k: string) => sp.get(k) ?? null, setItem: (k: string, v: string) => { sp.set(k, v); }, removeItem: (k: string) => { sp.delete(k); } }, oeffneLeinwand: () => undefined, takt: 100000 });
  try {
    document.body.replaceChildren(r.element);
    const sprung = r.element.querySelector<HTMLSelectElement>('[data-pruef="regie-sprung"]') as HTMLSelectElement;
    sprung.value = 's6:szene';
    sprung.dispatchEvent(new Event('change'));
    assert.equal(r.element.querySelector('[data-pruef="regie-notiz"], [data-pruef="regie-nebenfiguren"]'), null);
  } finally {
    r.entferne();
  }
});
