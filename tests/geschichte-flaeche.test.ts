/*
 * Story-Fläche (src/ui/flaechen/geschichte.ts, jsdom): Auftakt mit Figuren und Wahl des Wegs, Dialog, Antwort →
 * Folge-Szene mit Balken und Ansage, Fokusführung nach jedem Neuzeichnen (nie <body>), Mini-Aufgaben per Tastatur,
 * Vergleich mit Stufen und Statusmeldung, Brücken und Kürzungen der Kurzfassung (P17.5), Ende mit Bilanz und Varianten, Leinwand ohne
 * Bedienelemente, Speicher (alter Stand verworfen), Druckbogen.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';

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
const { baueSchritt, erzeugeGeschichte, SPEICHER_SCHLUESSEL, storyDruck, aenderungWort } = await import('../src/ui/flaechen/geschichte.ts');
const { neuerStand, waehle, kapitel, balkenBis, balken: balkenVon, stufe: stufeVon } = await import('../src/geschichte/engine.ts');
const { W } = await import('../src/ui/woerter.ts');
type Stand = ReturnType<typeof neuerStand>;

const G = inhalte.geschichte;
assert.ok(G);
const g = G;

function speicher(start: Record<string, string> = {}): { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void; daten: Map<string, string> } {
  const daten = new Map(Object.entries(start));
  return { daten, getItem: (k) => daten.get(k) ?? null, setItem: (k, v) => { daten.set(k, v); }, removeItem: (k) => { daten.delete(k); } };
}

function flaeche(stand: Stand | null = null): ReturnType<typeof erzeugeGeschichte> {
  const sp = speicher(stand !== null ? { [SPEICHER_SCHLUESSEL]: JSON.stringify(stand) } : {});
  const f = erzeugeGeschichte({ g, speicher: sp, themaTitel: (id) => (id === 'begriffe' ? 'Begriffsrahmen' : null) });
  document.body.replaceChildren(f.element);
  return f;
}
const $ = (f: { element: HTMLElement }, sel: string): HTMLElement => {
  const el = f.element.querySelector<HTMLElement>(sel);
  assert.ok(el, `nicht gefunden: ${sel}`);
  return el;
};
const aktiv = (): string => (document.activeElement === document.body ? 'BODY' : (document.activeElement as HTMLElement | null)?.dataset['pruef'] ?? document.activeElement?.tagName ?? '');
const an = (kap: string, teil: 'szene' | 'vergleich' | 'frage' | 'mini', basis: Stand = neuerStand()): Stand => ({ ...basis, schritt: { ort: 'kapitel', kapitel: kap, teil } });
/** Stand mit jeder Antwort dieser Wertung. */
function weg(wertung: string, kurz = false): Stand {
  let s = neuerStand(kurz);
  for (const k of g.kapitel) s = waehle(g, s, k.id, k.antworten.findIndex((a) => a.wertung === wertung));
  return s;
}

test('Auftakt: fünf Figuren und „Sie“ mit Porträt und Steckbrief, drei Balken; „Kurzfassung“ startet den kurzen Weg und setzt den Fokus auf den Titel', () => {
  const f = flaeche();
  assert.equal($(f, '[data-pruef="gs-titel"]').textContent, g.titel);
  for (const id of ['grundstein', 'faden', 'schwung', 'klingel', 'lot', 'sie']) assert.ok($(f, `[data-pruef="figur-${id}"]`).querySelector('svg[data-figur]'), id);
  assert.equal(f.element.querySelectorAll('[data-pruef="gs-stand-start"] .gs-stand-zeile').length, 3);
  $(f, '[data-pruef="fassung-kurz"]').click();
  assert.equal(f.stand().kurz, true);
  assert.deepEqual(f.stand().schritt, { ort: 'kapitel', kapitel: 'k1', teil: 'szene' });
  assert.equal(aktiv(), 'gs-titel');
  assert.match($(f, '[data-pruef="gs-ort"]').textContent ?? '', /^1 von 4 · /u);
});

test('Szene: Dialog mit einem Porträt je Sprecherwechsel und Sprechblase in der Farbe der Figur', () => {
  const f = flaeche(an('k1', 'szene'));
  const k1 = kapitel(g, 'k1');
  assert.ok(k1);
  const zeilen = [...f.element.querySelectorAll<HTMLElement>('.gs-dialog > li')];
  assert.equal(zeilen.length, k1.szene.length);
  assert.deepEqual(zeilen.map((z) => z.dataset['figur']), k1.szene.map((z) => z.figur));
  assert.equal(zeilen[0]?.dataset['akzent'], g.figuren.find((x) => x.id === k1.szene[0]?.figur)?.akzent);
  assert.ok(zeilen[0]?.querySelector('svg[data-figur]'), 'Porträt');
  assert.match($(f, '.gs-titel').textContent ?? '', /1 · Wer darf was entscheiden\?/u);
  assert.doesNotMatch(f.element.textContent ?? '', /Kapitel/u);
});

test('Frage: ohne Wahl kein Weiter (Hinweis, Fokus auf die erste Antwort); mit Wahl Folge, Balken, Ansage, Fokus auf die Folge', () => {
  const f = flaeche(an('k1', 'frage'));
  assert.equal(f.element.querySelector('[data-pruef="gs-folge"]'), null);
  $(f, '[data-pruef="weiter"]').click();
  assert.deepEqual(f.stand().schritt, { ort: 'kapitel', kapitel: 'k1', teil: 'frage' });
  assert.equal($(f, '.gs-navi-hinweis').textContent, W.geschichte.nochKeineWahl);
  assert.equal(aktiv(), 'antwort-1');
  // Pfeil rechts ebenso
  f.taste(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  assert.deepEqual(f.stand().schritt, { ort: 'kapitel', kapitel: 'k1', teil: 'frage' });
  // Wahl der guten Antwort (Platz 2): Vertrauen +2
  $(f, '[data-pruef="antwort-2"]').click();
  assert.equal(f.stand().wahlen['k1'], 1);
  assert.equal($(f, '[data-pruef="antwort-2"]').getAttribute('aria-pressed'), 'true');
  assert.ok($(f, '[data-pruef="gs-folge"]'));
  assert.equal(aktiv(), 'gs-folge-titel');
  assert.equal($(f, '[data-pruef="wort-vertrauen"]').textContent, '▲deutlich gestiegen');
  assert.equal($(f, '[data-pruef="wort-geld"]').textContent, '●unverändert');
  assert.equal($(f, '[data-pruef="gs-ansage"]').textContent, 'Ihre Wahl: 2. Geld: unverändert. Zeit: unverändert. Vertrauen: deutlich gestiegen.');
  // Kapitel 1 zeigt das Kärtchen, „So macht man es gut“ und „Das steckt dahinter“ mit Link zum Thema
  assert.ok($(f, '[data-pruef="gs-mandat"]'));
  assert.ok($(f, '[data-pruef="gs-gut"]'));
  assert.equal($(f, '[data-pruef="gs-thema"]').getAttribute('href'), '#theorie/begriffe');
  // die Wertung erscheint nie
  assert.doesNotMatch(f.element.textContent ?? '', /vertretbar|Falle/u);
  assert.equal(f.element.querySelector('[data-wertung]'), null);
  // Umentscheiden: neue Folge, Fokus wieder auf der Folge
  $(f, '[data-pruef="antwort-3"]').click();
  assert.equal($(f, '[data-pruef="wort-vertrauen"]').textContent, '▼deutlich gesunken');
  assert.equal($(f, '[data-pruef="wort-zeit"]').textContent, '▲etwas mehr Luft');
  assert.equal(aktiv(), 'gs-folge-titel');
  // jetzt geht es weiter (Gegenprobe zu „ohne Wahl kein Weiter“)
  $(f, '[data-pruef="weiter"]').click();
  assert.deepEqual(f.stand().schritt, { ort: 'kapitel', kapitel: 'k2', teil: 'szene' });
  assert.equal(aktiv(), 'gs-titel');
});

test('Balken-Wort: am oberen Rand „bleibt ganz oben“, am unteren „bleibt ganz unten“, sonst „unverändert“', () => {
  assert.equal(aenderungWort(g, 'vertrauen', 10, 10, 2), 'Vertrauen: bleibt ganz oben');
  assert.equal(aenderungWort(g, 'vertrauen', 0, 0, -1), 'Vertrauen: bleibt ganz unten');
  assert.equal(aenderungWort(g, 'zeit', 5, 5, 0), 'Zeit: unverändert');
  assert.equal(aenderungWort(g, 'geld', 9, 8, -1), 'Geld: etwas weniger übrig');
});

test('Mini-Aufgabe zuordnen per Tastatur: Rückmeldung je Posten, der Fokus bleibt auf dem gedrückten Knopf', () => {
  const f = flaeche(an('k4', 'mini'));
  const knopf = $(f, '[data-pruef="wahl-2-projektsteuerin"]');
  knopf.focus();
  knopf.click();
  assert.equal(aktiv(), 'wahl-2-projektsteuerin');
  assert.equal($(f, '[data-pruef="wahl-2-projektsteuerin"]').getAttribute('aria-pressed'), 'true');
  assert.equal($(f, '[data-pruef="posten-2"]').dataset['lage'], 'falsch');
  assert.match($(f, '[data-pruef="rueck-2"]').textContent ?? '', /^Nicht ganz – richtig ist: Bürgermeisterin\. Die Projektsteuerin bereitet das vor und empfiehlt – entscheiden darf sie es nicht\./u);
  $(f, '[data-pruef="wahl-1-sie"]').focus();
  $(f, '[data-pruef="wahl-1-sie"]').click();
  assert.equal(aktiv(), 'wahl-1-sie');
  assert.match($(f, '[data-pruef="rueck-1"]').textContent ?? '', /^Richtig/u);
  assert.equal($(f, '[data-pruef="mini-stand"]').textContent, '1 von 2 richtig. Noch 4 offen.');
  $(f, '[data-pruef="mini-nochmal"]').click();
  assert.equal(f.stand().mini['k4'], undefined);
  assert.notEqual(aktiv(), 'BODY');
});

test('Mini-Aufgabe Reihenfolge: Nummern beim Anklicken, Auswertung erst am Schluss, richtige Stelle genannt', () => {
  const f = flaeche(an('k6', 'mini'));
  for (const n of [1, 2, 4, 3, 5]) $(f, `[data-pruef="reihe-${n}"]`).click();
  assert.equal($(f, '[data-pruef="reihe-4"] .gs-reihe-nr').textContent, '3');
  assert.equal(f.element.querySelector('[data-pruef="rueck-1"]'), null, 'noch keine Auswertung');
  $(f, '[data-pruef="reihe-6"]').focus();
  $(f, '[data-pruef="reihe-6"]').click();
  assert.equal(aktiv(), 'reihe-6');
  assert.match($(f, '[data-pruef="rueck-3"]').textContent ?? '', /^gehört an Stelle 3/u);
  assert.match($(f, '[data-pruef="rueck-1"]').textContent ?? '', /^Richtig/u);
  assert.equal($(f, '[data-pruef="mini-stand"]').textContent, '4 von 6 richtig.');
});

test('Vergleich: Stufe ändern ordnet die Karten neu, meldet die Spitze und behält den Fokus; „Abgestimmte Gewichte“ stellt zurück', () => {
  const f = flaeche(an('k7', 'vergleich'));
  assert.equal($(f, '[data-pruef="gs-vgl-vorn"]').textContent, 'Vorn liegt „Ersatzgerät“ mit 49 Punkten.');
  assert.equal($(f, '[data-pruef="platz-A"]').textContent, 'Platz 1');
  assert.ok($(f, '[data-pruef="gewichte-abgestimmt"]').hasAttribute('disabled'));
  $(f, '[data-pruef="stufe-klima-3"]').focus();
  $(f, '[data-pruef="stufe-klima-3"]').click();
  assert.equal(aktiv(), 'stufe-klima-3');
  assert.equal($(f, '[data-pruef="gs-vgl-vorn"]').textContent, 'Gleichauf vorn: „Ersatzgerät“ und „Später einziehen“ mit je 55 Punkten.');
  assert.equal($(f, '[data-pruef="platz-C"]').textContent, 'Platz 1');
  assert.equal($(f, '[data-pruef="gs-vgl-satz"]').textContent, 'Gleichauf – jetzt entscheidet das fachliche Urteil der Bürgermeisterin, nicht die Punktzahl.');
  assert.match($(f, '[data-pruef="vgl-C"]').getAttribute('style') ?? '', /order:12/u);
  $(f, '[data-pruef="stufe-luft-1"]').click();
  assert.equal($(f, '[data-pruef="summe-B"]').textContent, '45 Punkte');
  $(f, '[data-pruef="gewichte-abgestimmt"]').click();
  assert.equal(f.stand().gewichte, null);
  assert.equal($(f, '[data-pruef="summe-A"]').textContent, '49 Punkte');
  assert.notEqual(aktiv(), 'BODY');
  // Kipppunkte mit Artikel, klein, Herabstufung als „nur … statt …“, Mehrzahl bei „Strombedarf und Betrieb“ (R72)
  const kipp = $(f, '[data-pruef="gs-kipp"]').textContent ?? '';
  assert.match(kipp, /Wären Strombedarf und Betrieb „wichtig“ statt „weniger wichtig“, lägen „Ersatzgerät“ und „Später einziehen“ gleichauf\./u);
  assert.match(kipp, /Wäre der Schulstart nur „wichtig“ statt „sehr wichtig“, läge „Später einziehen“ vorn\./u);
  assert.match(kipp, /Wäre gute Luft im Unterricht nur „weniger wichtig“ statt „wichtig“, läge „Leihgeräte“ vorn\./u);
});

test('Aufzählung: drei im Gleichstand mit Komma und „und“ vor dem letzten (Story und Explore)', () => {
  assert.equal(W.geschichte.gleichauf(['A', 'B', 'C'], 9), 'Gleichauf vorn: „A“, „B“ und „C“ mit je 9 Punkten.');
  assert.equal(W.geschichte.gleichauf(['A', 'B'], 9), 'Gleichauf vorn: „A“ und „B“ mit je 9 Punkten.');
  assert.equal(W.geschichte.kipp('das Geld', 5, 3, ['A', 'B', 'C']), 'Wäre das Geld „sehr wichtig“ statt „wichtig“, lägen „A“, „B“ und „C“ gleichauf.');
  assert.equal(W.geschichte.kipppunkt('Geld', 2, ['A', 'B', 'C']), 'Gewicht von Geld auf 2: Dann lägen A, B und C gleichauf');
  // Gegenprobe: kein „A und B und C“
  assert.doesNotMatch(W.geschichte.kipppunkt('Geld', 2, ['A', 'B', 'C']), / und .* und /u);
});

test('Folge eines späteren Kapitels: jede Balkenfüllung läuft vom Stand vor dem Kapitel zum Stand danach, das Wort passt', () => {
  // k4 nach k1–k3 mit Fallen: vorher ≠ Start, so fällt ein falscher Ausgangspunkt auf
  let s = weg('falle');
  s = an('k4', 'frage', s);
  const f = flaeche(s);
  const vorher = balkenBis(g, s, 3);
  const nachher = balkenBis(g, s, 4);
  assert.notDeepEqual(vorher, balkenBis(g, s, 0), 'Gegenprobe: vor Kapitel 4 ist nicht der Start');
  for (const id of ['geld', 'zeit', 'vertrauen'] as const) {
    const fuellung = $(f, `[data-pruef="gs-stand-folge"] [data-balken="${id}"] .gs-stand-fuellung`).getAttribute('style') ?? '';
    assert.match(fuellung, new RegExp(`--von:${vorher[id] * 10}%;--nach:${nachher[id] * 10}%`, 'u'), id);
    const k4 = kapitel(g, 'k4');
    const wirkung = k4?.antworten[s.wahlen['k4'] ?? 0]?.wirkung[id] ?? 0;
    const wort = aenderungWort(g, id, vorher[id], nachher[id], wirkung);
    assert.equal($(f, `[data-pruef="wort-${id}"]`).textContent?.slice(1), wort.slice(wort.indexOf(':') + 2), id);
  }
});

test('Mini-Aufgaben: Grafik auf dem Schritt, kleine Gegenstände auf den Karten; k8 mit zwei Ablagen; k6 gelöst als Pfad in richtiger Reihenfolge', () => {
  for (const id of ['k2', 'k4', 'k6', 'k8']) assert.ok($(flaeche(an(id, 'mini')), '.gs-mini-bild svg'), id);
  const f8 = flaeche(an('k8', 'mini'));
  assert.equal(f8.element.querySelectorAll('[data-pruef="mini-ablagen"] .gs-mini-ablage').length, 2);
  assert.ok(f8.element.querySelectorAll('.gs-mini-posten-bild svg').length >= 5);
  $(f8, '[data-pruef="wahl-1-uebergeben"]').click();
  assert.match($(f8, '[data-pruef="ablage-uebergeben"]').textContent ?? '', /1 Karte/u);
  // k2 hat keine Ablagen (Wahlen ohne Bild) – Gegenprobe
  assert.equal(flaeche(an('k2', 'mini')).element.querySelector('[data-pruef="mini-ablagen"]'), null);
  const f6 = flaeche(an('k6', 'mini'));
  const reihe = (): string[] => [...f6.element.querySelectorAll<HTMLElement>('[data-pruef="mini-reihe"] > li')].map((x) => x.dataset['pruef'] ?? '');
  const gemischt = reihe();
  assert.notDeepEqual(gemischt, ['posten-1', 'posten-2', 'posten-3', 'posten-4', 'posten-5', 'posten-6'], 'vor dem Lösen gemischt');
  for (const n of [1, 2, 3, 4, 6, 5]) $(f6, `[data-pruef="reihe-${n}"]`).click();
  assert.deepEqual(reihe(), ['posten-1', 'posten-2', 'posten-3', 'posten-4', 'posten-5', 'posten-6']);
  assert.ok($(f6, '[data-pruef="mini-reihe"]').classList.contains('ist-pfad'));
});

test('Kurzfassung: Brücken vor 3, vor 7 und vor dem Schulstart; übersprungene Kapitel zählen wie die gute Antwort', () => {
  const f3 = flaeche(an('k3', 'szene', neuerStand(true)));
  assert.ok($(f3, '[data-pruef="bruecke-k2"]'));
  // R74: Überschrift für Screenreader mit derselben Stelle wie die Ortszeile („2 von 4“), nicht der Nummer des langen Wegs
  const ort3 = $(f3, '[data-pruef="gs-ort"]').textContent ?? '';
  assert.match(ort3, /^2 von 4 · /u);
  assert.equal($(f3, '[data-pruef="gs-titel"] .nur-sr').textContent, `${ort3.split(' · ')[0] ?? ''} · `);
  const f7 = flaeche(an('k7', 'szene', neuerStand(true)));
  assert.ok($(f7, '[data-pruef="bruecke-k5"]') && $(f7, '[data-pruef="bruecke-k6"]'));
  const fe = flaeche({ ...weg('gut', true), schritt: { ort: 'ende' } });
  assert.ok($(fe, '[data-pruef="bruecke-k8"]'));
  // R74: das Ende heißt in Ortszeile und Fortschrittslinie anders als Kapitel 8 „Schulstart“
  const namen = [...fe.element.querySelectorAll('[data-pruef="gs-fortschritt"] [aria-label]')].map((x) => x.getAttribute('aria-label') ?? '');
  assert.equal(new Set(namen.map((n) => n.replace(/^\d+ von \d+ · /u, ''))).size, namen.length, 'Feldnamen eindeutig');
  assert.notEqual($(fe, '[data-pruef="gs-ort"]').textContent, 'Schulstart');
  assert.equal($(fe, '[data-pruef="gs-bilanz-titel"]').textContent, 'Ruhig ins Ziel');
  // ohne Kurzfassung keine Brücken
  const fl = flaeche(an('k3', 'szene'));
  assert.equal(fl.element.querySelector('[data-pruef^="bruecke-"]'), null);
});

test('Kurzfassung kürzer (P17.5): kurzer Einstieg, Zeilen weggelassen, „Das steckt dahinter“ und Kipppunkte aufklappbar – der ganze Weg unverändert', () => {
  const k1 = kapitel(g, 'k1');
  const k7 = kapitel(g, 'k7');
  assert.ok(k1 && k7 && k1.einstiegKurzHtml !== null && g.ende.einstiegKurzHtml !== null);
  const zeilenKurz = k1.szene.filter((z) => z.kurzfassung).length;
  assert.ok(zeilenKurz < k1.szene.length && zeilenKurz >= 2);
  // Szene: Kurzfassung mit kurzem Einstieg und weniger Zeilen, ganzer Weg mit allem
  const kurz = flaeche(an('k1', 'szene', neuerStand(true)));
  assert.equal($(kurz, '[data-pruef="gs-einstieg"]').querySelector('p')?.outerHTML, k1.einstiegKurzHtml.trim());
  assert.equal(kurz.element.querySelectorAll('.gs-dialog > li').length, zeilenKurz);
  const lang = flaeche(an('k1', 'szene'));
  assert.equal([...$(lang, '[data-pruef="gs-einstieg"]').querySelectorAll('p')].map((p) => p.outerHTML).join('\n'), k1.einstiegHtml.trim());
  assert.equal(lang.element.querySelectorAll('.gs-dialog > li').length, k1.szene.length);
  // Folge: in der Kurzfassung „Das steckt dahinter“ zugeklappt, der Link zum Thema bleibt sichtbar
  const fk = flaeche(an('k1', 'frage', waehle(g, neuerStand(true), 'k1', 1)));
  const auf = $(fk, '[data-pruef="gs-dahinter-auf"]');
  assert.equal(auf.tagName, 'DETAILS');
  assert.equal(auf.hasAttribute('open'), false);
  assert.equal(auf.querySelector('summary')?.textContent, W.geschichte.dahinterTitel);
  assert.equal(auf.querySelector('[data-pruef="gs-thema"]'), null);
  assert.equal($(fk, '[data-pruef="gs-thema"]').getAttribute('href'), '#theorie/begriffe');
  const fl = flaeche(an('k1', 'frage', waehle(g, neuerStand(), 'k1', 1)));
  assert.equal(fl.element.querySelector('[data-pruef="gs-dahinter-auf"]'), null);
  assert.ok($(fl, '[data-pruef="gs-dahinter"]').textContent?.includes(W.geschichte.dahinterTitel));
  // Vergleich: Kipppunkte in der Kurzfassung zugeklappt, auf dem ganzen Weg offen
  const vk = $(flaeche(an('k7', 'vergleich', neuerStand(true))), '[data-pruef="gs-kipp"]');
  assert.equal(vk.tagName, 'DETAILS');
  assert.equal(vk.hasAttribute('open'), false);
  assert.equal(vk.querySelector('summary')?.textContent, W.geschichte.kippTitel);
  assert.ok(vk.querySelector('li'));
  assert.equal($(flaeche(an('k7', 'vergleich')), '[data-pruef="gs-kipp"]').tagName, 'SECTION');
  // Ende: kurzer Einstieg, weniger Zeilen; die Variante „Vertrauen niedrig“ greift auch in der Kurzfassung
  const ek = flaeche({ ...weg('gut', true), schritt: { ort: 'ende' } });
  assert.equal($(ek, '[data-pruef="gs-einstieg"]').querySelector('p')?.outerHTML, g.ende.einstiegKurzHtml.trim());
  assert.equal(ek.element.querySelectorAll('.gs-dialog > li').length, g.ende.szene.filter((z) => z.kurzfassung).length);
  const ef = flaeche({ ...weg('falle', true), schritt: { ort: 'ende' } });
  assert.match(ef.element.textContent ?? '', /Beim nächsten Projekt reden wir früher miteinander\./u);
  // Leinwand: nichts zugeklappt, auch in der Kurzfassung
  for (const [kap, teil] of [['k1', 'frage'], ['k7', 'vergleich']] as const) {
    const el = baueSchritt({ g, stand: an(kap, teil, weg('gut', true)), bedienbar: false, themaTitel: () => 'Thema', tue: () => undefined });
    assert.equal(el.querySelector('details:not([open])'), null, `${kap} ${teil}`);
  }
});

test('Auftakt: Steckbriefe zugeklappt unter Porträt, Name und Rolle; auf der Leinwand offen', () => {
  const f = flaeche();
  for (const id of ['grundstein', 'faden', 'schwung', 'klingel', 'lot', 'sie']) {
    const karte = $(f, `[data-pruef="figur-${id}"]`);
    const auf = karte.querySelector('details.gs-steckbrief-auf');
    assert.ok(auf && !auf.hasAttribute('open'), id);
    assert.match(auf.querySelector('summary')?.textContent ?? '', new RegExp(`^${W.geschichte.steckbrief}: `, 'u'));
    assert.ok(auf.querySelector('.gs-steckbrief-text')?.textContent, id);
    assert.ok(karte.querySelector('.gs-steckbrief-name')?.textContent && karte.querySelector('.gs-steckbrief-rolle')?.textContent, id);
  }
  const el = baueSchritt({ g, stand: neuerStand(), bedienbar: false, themaTitel: () => 'Thema', tue: () => undefined });
  assert.equal(el.querySelectorAll('details.gs-steckbrief-auf[open]').length, 6);
});

test('Ende: Bilanz je Weg, Varianten bei niedriger Zeit und niedrigem Vertrauen, leiser Link, „Noch einmal von vorn“', () => {
  const gut = flaeche({ ...weg('gut'), schritt: { ort: 'ende' } });
  assert.equal($(gut, '[data-pruef="gs-bilanz-titel"]').textContent, 'Ruhig ins Ziel');
  assert.equal(gut.element.querySelector('[data-pruef="gs-zeit-niedrig"]'), null);
  assert.match(gut.element.textContent ?? '', /Ich wusste jedes Mal, worüber ich entscheide\./u);
  assert.equal(gut.element.querySelector('.gs-ende')?.getAttribute('data-fassung'), 'grund');
  // L-239: eine Falle in 8, sonst gut – Balken hoch, aber „mit Umwegen“ und die Zeile nach einer Falle
  const k8 = kapitel(g, 'k8');
  assert.ok(k8);
  const einmal = flaeche({ ...waehle(g, weg('gut'), 'k8', k8.antworten.findIndex((a) => a.wertung === 'falle')), schritt: { ort: 'ende' } });
  assert.equal($(einmal, '[data-pruef="gs-bilanz-titel"]').textContent, 'Geschafft – mit Umwegen');
  assert.doesNotMatch(einmal.element.textContent ?? '', /Ich wusste jedes Mal/u);
  assert.match(einmal.element.textContent ?? '', /nicht jede Entscheidung ist so sauber vorbereitet worden, wie sie hätte sein sollen/u);
  assert.ok(gut.element.querySelector('.gs-abbinder a[href="https://www.bauherr-mentoren.com/"]'));
  const falle = flaeche({ ...weg('falle'), schritt: { ort: 'ende' } });
  assert.equal($(falle, '[data-pruef="gs-bilanz-titel"]').textContent, 'Gebaut, aber ohne Rückhalt');
  assert.ok($(falle, '[data-pruef="gs-zeit-niedrig"]'));
  assert.match(falle.element.textContent ?? '', /Beim nächsten Projekt reden wir früher miteinander\./u);
  assert.doesNotMatch(falle.element.textContent ?? '', /Ich wusste jedes Mal/u);
  // Vertrauen niedrig: auch der Bauleiter spricht anders
  assert.match(falle.element.textContent ?? '', /Hätten wir damit mal früher angefangen\./u);
  assert.doesNotMatch(falle.element.textContent ?? '', /dass ich das mal gut finde/u);
  const vertretbar = flaeche({ ...weg('vertretbar'), schritt: { ort: 'ende' } });
  assert.equal($(vertretbar, '[data-pruef="gs-bilanz-titel"]').textContent, 'Auf den letzten Metern');
  // ohne Entscheidungen: Hinweis, dass sie nicht mitzählen
  const leer = flaeche({ ...neuerStand(), schritt: { ort: 'ende' } });
  assert.match($(leer, '[data-pruef="gs-offen"]').textContent ?? '', /^Acht Entscheidungen/u);
  $(leer, '[data-pruef="von-vorn"]').click();
  assert.deepEqual(leer.stand().schritt, { ort: 'auftakt' });
  assert.equal(aktiv(), 'gs-titel');
});

test('Leinwand (nicht bedienbar): kein Knopf, kein Link, keine Wertung – an jedem Schritt mit Wahl', () => {
  const s = weg('vertretbar');
  for (const schritt of [{ ort: 'auftakt' as const }, ...g.kapitel.flatMap((k) => (['szene', 'vergleich', 'frage', 'mini'] as const).map((teil) => ({ ort: 'kapitel' as const, kapitel: k.id, teil }))), { ort: 'ende' as const }]) {
    const el = baueSchritt({ g, stand: { ...s, schritt }, bedienbar: false, themaTitel: () => 'Thema', tue: () => undefined });
    assert.equal(el.querySelectorAll('a, button, input, select').length, 0, JSON.stringify(schritt));
    assert.doesNotMatch(el.textContent ?? '', /vertretbar/u);
  }
});

test('Speicher: ein alter Stand (Stationen, v 1) wird verworfen; jede Änderung wird gespeichert; „Fortschritt löschen“ löscht', () => {
  const sp = speicher({ [SPEICHER_SCHLUESSEL]: JSON.stringify({ v: 1, schritt: { ort: 'station', station: 's3', teil: 'lage' }, wahlen: { s1: 'A' }, gewichte: null, kurz: false }) });
  const f = erzeugeGeschichte({ g, speicher: sp, themaTitel: () => null });
  document.body.replaceChildren(f.element);
  assert.deepEqual(f.stand(), neuerStand());
  f.zuKapitel('K3');
  assert.deepEqual(f.stand().schritt, { ort: 'kapitel', kapitel: 'k3', teil: 'szene' });
  assert.equal(sp.daten.get(SPEICHER_SCHLUESSEL), JSON.stringify(f.stand()));
  $(f, '[data-pruef="fortschritt-loeschen"]').click();
  assert.equal(sp.daten.get(SPEICHER_SCHLUESSEL), undefined);
  assert.deepEqual(f.stand(), neuerStand());
  // Permalink auf ein Kapitel außerhalb der Kurzfassung schaltet die ganze Geschichte ein
  const k = flaeche(neuerStand(true));
  k.zuKapitel('k5');
  assert.equal(k.stand().kurz, false);
});

test('Druckbogen (Strg+P): je Kapitel Ihre Antwort und „So macht man es gut“, dazu die Bilanz', () => {
  const druck = (st: Stand): string => {
    const el = document.createElement('div');
    el.append(...storyDruck(g, st, 'Fassung').teile);
    return el.textContent ?? '';
  };
  const s = waehle(g, neuerStand(), 'k1', 1);
  const text = druck(s);
  for (const k of g.kapitel) assert.match(text, new RegExp(`${k.nr} · ${k.titel.replace('?', '\\?')}`, 'u'));
  assert.match(text, /Ihre Antwort: Die Projektsteuerin entwirft eine Seite/u);
  assert.match(text, /Ihre Antwort: noch offen/u);
  // vor dem Ende keine Bilanz (R72): nur der Hinweis, wo sie steht
  assert.doesNotMatch(text, /Ihre Bilanz: /u);
  assert.match(text, /Die Bilanz steht am Ende der Geschichte\./u);
  // am Ende die Bilanz – mit dem Hinweis auf offene Entscheidungen wie am Bildschirm
  const ende = druck({ ...s, schritt: { ort: 'ende' } });
  assert.match(ende, /Ihre Bilanz: /u);
  assert.match(ende, /Sieben Entscheidungen haben Sie noch nicht getroffen/u);
  // R74: der Druck hat keine Balken – ihr Stand steht dort in Worten
  for (const x of g.balken) assert.match(ende, new RegExp(`${x.titel}: (gut gefüllt|etwa halb voll|knapp)`, 'u'), x.id);
  assert.match(druck({ ...weg('gut'), schritt: { ort: 'ende' } }), /Ihre Bilanz: Ruhig ins Ziel/u);
  // Kurzfassung: ein übersprungenes Kapitel ist erst „erzählt“, wenn seine Brücke erreicht ist
  const kurzVorn = druck(an('k3', 'szene', neuerStand(true)));
  // R76: statt „Ihre Antwort: …“ steht der Brückensatz des Kapitels auf dem Papier
  assert.match(kurzVorn, /2 · Ein erstes Warnsignal · März 2026In der Kurzfassung nur erzählt: Im März erwähnt der Architekt/u);
  assert.doesNotMatch(kurzVorn, /Warnsignal · März 2026Ihre Antwort/u);
  assert.match(kurzVorn, /5 · Zwei Zahlen, zwei Wahrheiten · Oktober 2026Ihre Antwort: noch offen/u);
  // R73: „So macht man es gut“ nur für Kapitel mit eigener Wahl – vor der Frage stünde sonst die Lösung auf dem Papier
  const bogen = (st: Stand): HTMLElement => { const el = document.createElement('div'); el.append(...storyDruck(g, st, 'Fassung').teile); return el; };
  const mitte = bogen(s);
  assert.match(mitte.querySelector('[data-pruef="druck-k1"]')?.textContent ?? '', /So macht man es gut/u);
  for (const k of g.kapitel.slice(1)) assert.doesNotMatch(mitte.querySelector(`[data-pruef="druck-${k.id}"]`)?.textContent ?? '', /So macht man es gut/u, k.id);
  assert.equal(bogen(neuerStand()).querySelectorAll('.druck-gut').length, 0, 'am Auftakt keine Lösung im Druck');
  assert.equal(bogen({ ...weg('gut'), schritt: { ort: 'ende' } }).querySelectorAll('.druck-gut').length, g.kapitel.length);
  // offene Entscheidungen am Ende: neutrale Bilanz, keine Sätze je Balken
  const lueckeEnde = druck({ ...s, schritt: { ort: 'ende' } });
  assert.match(lueckeEnde, new RegExp(`Ihre Bilanz: ${g.bilanz.offen.titel}`, 'u'));
  assert.doesNotMatch(lueckeEnde, /Geschafft – mit Umwegen/u);
  // R74: keine Sätze je Balken, stattdessen der Stand in Worten
  const bEnde = balkenVon(g, { ...s, schritt: { ort: 'ende' } });
  for (const x of g.balken) {
    for (const satz of Object.values(x.bilanz)) assert.ok(!lueckeEnde.includes(satz.replace(/<[^>]*>/gu, '').slice(0, 30)), `${x.id}: Satz je Balken gedruckt`);
    assert.ok(lueckeEnde.includes(W.geschichte.fuellstand[stufeVon(bEnde[x.id])] ?? '§'), `${x.id}: Stand in Worten`);
  }
});

test('Ende mit offenen Entscheidungen (R73): neutrale Bilanz statt Urteil, keine Sätze je Balken, Schlusszeile „offen“', () => {
  // nur Kapitel 1 gut gewählt, dann über die Fortschrittslinie ans Ende
  const gutK1 = g.kapitel[0]!.antworten.findIndex((a) => a.wertung === 'gut');
  const f = flaeche({ ...waehle(g, neuerStand(), 'k1', gutK1), schritt: { ort: 'ende' } });
  const ende = $(f, 'article.gs-ende');
  assert.equal(ende.dataset['bilanz'], 'offen');
  assert.equal(ende.dataset['fassung'], 'offen');
  assert.equal($(f, '[data-pruef="gs-bilanz-titel"]').textContent, g.bilanz.offen.titel);
  assert.equal(ende.querySelector('.gs-bilanz-saetze'), null);
  assert.match($(f, '[data-pruef="gs-offen"]').textContent ?? '', /Sieben Entscheidungen/u);
  const dialogText = ende.querySelector('.gs-dialog')?.textContent ?? '';
  // R74: nur die Zeilen der Kurzfassung – die übrigen setzen eine gespielte Geschichte voraus
  assert.deepEqual([...ende.querySelectorAll<HTMLElement>('.gs-dialog > li')].map((z) => z.dataset['figur']), g.ende.szene.filter((z) => z.kurzfassung).map((z) => z.figur));
  assert.doesNotMatch(dialogText, /Ich wusste jedes Mal/u);
  assert.match(dialogText, /Was Sie unterwegs noch nicht entschieden haben/u);
});

test('r73: „Nur die Sporthalle bleibt noch zu“ genau bei Zeit „niedrig“ am Ende, mit Gegenprobe „mittel“', async () => {
  const { balken: balkenVon, stufe: stufeVon } = await import('../src/geschichte/engine.ts');
  const gesehen = new Set<string>();
  const wege: Stand[] = [weg('gut'), weg('vertretbar'), weg('falle')];
  for (const k of g.kapitel) for (let p = 0; p < k.antworten.length; p++) {
    wege.push(waehle(g, weg('gut'), k.id, p), waehle(g, weg('vertretbar'), k.id, p), waehle(g, weg('falle'), k.id, p));
  }
  for (const s of wege) {
    const st = { ...s, schritt: { ort: 'ende' } } as Stand;
    const z = stufeVon(balkenVon(g, st).zeit);
    gesehen.add(z);
    const el = baueSchritt({ g, stand: st, bedienbar: true, themaTitel: () => 'Thema', tue: () => undefined });
    assert.equal(el.querySelector('[data-pruef="gs-zeit-niedrig"]') !== null, z === 'niedrig', `Zeit ${z}`);
    // Bild und Text stimmen überein: „Die Sporthalle bleibt noch zu“ ⇒ der Ende-Campus zeigt die Halle unfertig (R79)
    assert.equal(el.querySelector('.gs-campus-ende svg')?.getAttribute('data-halle') === 'offen', z === 'niedrig', `Campus am Ende, Zeit ${z}`);
  }
  assert.ok(gesehen.has('mittel') && gesehen.has('niedrig') && gesehen.has('hoch'), [...gesehen].join(','));
});

test('r73: Kurzfassung – Kapitel mit Mini-Aufgabe tragen „Das steckt dahinter“ am Frageschritt, der ganze Weg nicht', () => {
  const mitMini = g.kapitel.filter((k) => k.mini !== null && k.kurzfassung);
  assert.ok(mitMini.length > 0);
  for (const k of mitMini) {
    const kurz = flaeche(an(k.id, 'frage', waehle(g, neuerStand(true), k.id, 0)));
    assert.ok(kurz.element.querySelector('[data-pruef="gs-dahinter-auf"]'), `${k.id} kurz`);
    const lang = flaeche(an(k.id, 'frage', waehle(g, neuerStand(), k.id, 0)));
    assert.equal(lang.element.querySelector('[data-pruef="gs-dahinter-auf"], [data-pruef="gs-dahinter"]'), null, `${k.id} lang`);
  }
});

/* ------------------------------------------------------------------ R75 -- */

const nurText = (html: string): string => { const el = document.createElement('span'); el.innerHTML = html; return (el.textContent ?? '').replace(/\u00ad/gu, ''); };

/** Text jeder Antwortkarte: genau Nummer, Antworttext und – nur bei der eigenen Wahl – die Marke; sonst nichts (keine Wertung). */
function kartenFunde(el: HTMLElement, k: (typeof g.kapitel)[number], stand: Stand): string[] {
  const aus: string[] = [];
  for (const karte of el.querySelectorAll<HTMLElement>('[data-pruef^="antwort-"]')) {
    const platz = Number(karte.dataset['platz']);
    const a = k.antworten[platz];
    const soll = `${platz + 1}${nurText(a?.html ?? '')}${stand.wahlen[k.id] === platz ? W.geschichte.gewaehlt : ''}`;
    if ((karte.textContent ?? '').replace(/\u00ad/gu, '') !== soll) aus.push(`${k.id} Platz ${platz + 1}: „${karte.textContent}“`);
    for (const x of [karte, ...karte.querySelectorAll('*')]) for (const at of [...x.attributes]) {
      if ((at.name === 'title' || at.name === 'alt' || at.name.startsWith('aria-')) && !['aria-pressed', 'aria-hidden'].includes(at.name)) aus.push(`${k.id} Platz ${platz + 1}: ${at.name}="${at.value}"`);
    }
  }
  return aus;
}

test('R75: jede Antwortkarte trägt genau ihren Text (und „Ihre Wahl“) – auch kein „gut“ als Text oder Vorlesetext; Story und Leinwand', () => {
  for (const k of g.kapitel) for (const platz of [undefined, 0, 1, 2]) for (const bedienbar of [true, false]) {
    const stand = an(k.id, 'frage', platz === undefined ? neuerStand() : waehle(g, neuerStand(), k.id, platz));
    const el = baueSchritt({ g, stand, bedienbar, themaTitel: () => 'Thema', tue: () => undefined });
    assert.equal(el.querySelectorAll('[data-pruef^="antwort-"]').length, 3, k.id);
    assert.deepEqual(kartenFunde(el, k, stand), [], `${k.id} Wahl ${platz} ${bedienbar ? 'Story' : 'Leinwand'}`);
  }
  // Gegenprobe (Mutation F1 aus R75): ein eingeschleustes „(gut)“ – sichtbar oder nur vorgelesen – wird gefunden
  const k = g.kapitel[0]!;
  const stand = an(k.id, 'frage', waehle(g, neuerStand(), k.id, 0));
  const gutPlatz = k.antworten.findIndex((a) => a.wertung === 'gut');
  for (const zusatz of ['<span class="nur-sr"> (gut)</span>', '<span aria-label="gut"></span>']) {
    const el = baueSchritt({ g, stand, bedienbar: true, themaTitel: () => 'Thema', tue: () => undefined });
    el.querySelector(`[data-pruef="antwort-${gutPlatz + 1}"] .gs-antwort-text`)?.insertAdjacentHTML('beforeend', zusatz);
    assert.equal(kartenFunde(el, k, stand).length, 1, zusatz);
  }
});

test('R75: bei offenen Entscheidungen keine Zeile „Nur die Sporthalle bleibt noch zu“ – auch wenn Zeit schon niedrig steht', () => {
  const k1 = g.kapitel[0]!;
  const k3 = g.kapitel[2]!;
  let s = waehle(g, neuerStand(), k1.id, k1.antworten.findIndex((a) => a.wertung === 'vertretbar'));
  s = waehle(g, s, k3.id, k3.antworten.findIndex((a) => a.wertung === 'falle'));
  const st: Stand = { ...s, schritt: { ort: 'ende' } };
  assert.equal(stufeVon(balkenVon(g, st).zeit), 'niedrig', 'Gegenprobe: Zeit steht niedrig');
  const el = baueSchritt({ g, stand: st, bedienbar: true, themaTitel: () => 'Thema', tue: () => undefined });
  assert.equal(el.dataset['bilanz'], 'offen');
  assert.equal(el.querySelector('[data-pruef="gs-zeit-niedrig"]'), null);
  // alle Wege mit genau einem offenen Kapitel: nie die Zeile
  for (const offen of g.kapitel) for (const wertung of ['vertretbar', 'falle']) {
    let t = neuerStand();
    for (const k of g.kapitel) if (k !== offen) t = waehle(g, t, k.id, k.antworten.findIndex((a) => a.wertung === wertung));
    const e = baueSchritt({ g, stand: { ...t, schritt: { ort: 'ende' } }, bedienbar: true, themaTitel: () => 'Thema', tue: () => undefined });
    assert.equal(e.querySelector('[data-pruef="gs-zeit-niedrig"]'), null, `${offen.id} offen, sonst ${wertung}`);
  }
});

test('R75: Ende mit offenen Entscheidungen führt per Knopf zur ersten offenen Frage', () => {
  const k1 = g.kapitel[0]!;
  const f = flaeche({ ...waehle(g, neuerStand(), k1.id, 1), schritt: { ort: 'ende' } });
  const knopf = $(f, '[data-pruef="zur-offenen"]');
  assert.match(knopf.textContent ?? '', /Zur ersten offenen Entscheidung: 2 · Ein erstes Warnsignal/u);
  assert.doesNotMatch(knopf.textContent ?? '', /Kapitel/u);
  knopf.click();
  assert.deepEqual(f.stand().schritt, { ort: 'kapitel', kapitel: 'k2', teil: 'frage' });
  assert.equal(aktiv(), 'gs-titel');
  // ohne offene Entscheidung kein Knopf
  const voll = flaeche({ ...weg('gut'), schritt: { ort: 'ende' } });
  assert.equal(voll.element.querySelector('[data-pruef="zur-offenen"]'), null);
});

test('R75: Reihenfolge meldet nach jedem Klick den Stand („2 von 6 gesetzt.“); Zuordnen zeigt eine Legende der Wahlen', () => {
  const f = flaeche(an('k6', 'mini'));
  $(f, '[data-pruef="reihe-1"]').click();
  assert.equal($(f, '[data-pruef="mini-stand"]').textContent, '1 von 6 gesetzt.');
  $(f, '[data-pruef="reihe-2"]').click();
  assert.equal($(f, '[data-pruef="mini-stand"]').textContent, '2 von 6 gesetzt.');
  const k2 = flaeche(an('k2', 'mini'));
  const legende = $(k2, '[data-pruef="mini-legende"]');
  const k2m = kapitel(g, 'k2')!.mini!;
  assert.deepEqual([...legende.querySelectorAll('dt')].map((x) => x.textContent), k2m.wahlen.map((x) => x.titel));
  // die Legende erklärt nur Begriffe – sie steht wortgleich in den Rückmeldungen (keine neue Aussage)
  const erklaert = k2m.posten.map((p) => nurText(p.erklaerungHtml).toLowerCase()).join(' ');
  for (const x of k2m.wahlen) for (const wort of nurText(x.heisstHtml ?? '').toLowerCase().split(/[\s,]+/u).filter((w) => w.length > 4)) assert.ok(erklaert.includes(wort), `${x.id}: „${wort}“`);
  // k4 (mit Porträts) und k8 (mit Ablagen) haben keine Legende
  assert.equal(flaeche(an('k4', 'mini')).element.querySelector('[data-pruef="mini-legende"]'), null);
});

test('R75: Balken am Rand zeigen die Richtung der Wirkung („▲ bleibt ganz oben“)', () => {
  const s = weg('gut');
  const k6 = kapitel(g, 'k6')!;
  assert.equal(balkenBis(g, s, k6.nr - 1).vertrauen, 10, 'Voraussetzung: Vertrauen voll vor Kapitel 6');
  const el = baueSchritt({ g, stand: an('k6', 'frage', s), bedienbar: true, themaTitel: () => 'Thema', tue: () => undefined });
  const wort = el.querySelector('[data-pruef="wort-vertrauen"]')?.textContent ?? '';
  assert.equal(wort, `▲${W.geschichte.bleibtOben}`);
});

test('R75: Druckbogen nennt vor „Ihre Antwort“ die Frage – nicht bei Kapiteln, die die Kurzfassung nur erzählt', () => {
  const el = document.createElement('div');
  el.append(...storyDruck(g, { ...weg('gut'), schritt: { ort: 'ende' } }, 'Fassung').teile);
  for (const k of g.kapitel) assert.equal(el.querySelector(`[data-pruef="druck-${k.id}"] .druck-frage`)?.textContent, nurText(k.frageHtml), k.id);
  const kurz = document.createElement('div');
  kurz.append(...storyDruck(g, { ...weg('gut', true), schritt: { ort: 'ende' } }, 'Fassung').teile);
  assert.equal(kurz.querySelector('[data-pruef="druck-k2"] .druck-frage'), null);
  assert.ok(kurz.querySelector('[data-pruef="druck-k1"] .druck-frage'));
});

test('O-61: Wahl am Anfang als zwei Wegkarten – ganze Geschichte (alle Stationen) und Kurzfassung (nur die gespielten)', () => {
  const f = flaeche();
  const lang = $(f, '[data-pruef="weg-karte-lang"]');
  const kurz = $(f, '[data-pruef="weg-karte-kurz"]');
  const alle = g.kapitel.length;
  const nKurz = g.kapitel.filter((k) => k.kurzfassung).length;
  assert.equal(lang.querySelectorAll('.ws-station').length, alle);
  assert.equal(kurz.querySelectorAll('.ws-station').length, nKurz);
  assert.equal(kurz.querySelectorAll('.ws-uebersprungen').length, alle - nKurz);
  // Dauer wie auf dem Knopf bzw. der Startseite, Zahl der Entscheidungen in Worten
  assert.match(lang.textContent ?? '', new RegExp(`${W.geschichte.wegEntscheidungen(alle)} · etwa \\d+ Minuten`, 'u'));
  assert.match(kurz.textContent ?? '', new RegExp(`${W.geschichte.wegEntscheidungen(nKurz)} · ${/etwa \d+ Minuten/u.exec(g.auftakt.kurz)?.[0]}`, 'u'));
  // jede Karte trägt ihren Knopf; beide Wege starten (die Kurzfassung setzt das Kennzeichen kurz)
  assert.ok(lang.querySelector('[data-pruef="fassung-lang"]') && kurz.querySelector('[data-pruef="fassung-kurz"]'));
  assert.equal($(f, '[data-pruef="fassung-kurz"]').textContent, W.geschichte.wegKurzKnopf);
  // auf der Leinwand stehen beide Karten ohne Knöpfe
  const el = baueSchritt({ g, stand: neuerStand(), bedienbar: false, themaTitel: () => 'Thema', tue: () => undefined });
  assert.ok(el.querySelector('[data-pruef="weg-karte-lang"]') && el.querySelector('[data-pruef="weg-karte-kurz"]'));
  assert.equal(el.querySelectorAll('.gs-wegkarte button').length, 0);
});
