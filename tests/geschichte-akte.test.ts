/*
 * Akte der Story (P19.3, O-62): Engine, Akt-Leiste, Pause mit Zwischenbilanz, Verlaufsband, Brücken, Ende der Kurzfassung, Druck je
 * Akt und Speicher – an einer synthetischen Story mit 14 Stationen (s1 … s14) in drei Akten (tests/hilfen/geschichte-akte.ts), dazu
 * die Gegenprobe „ohne Akte wie bisher“ an der echten Story. Die Lesezeit je Akt prüft tests/lesezeit.test.ts.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { synthetischeAkteStory, KURZ_NR } from './hilfen/geschichte-akte.ts';

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
const { baueSchritt, erzeugeGeschichte, fortschritt, leisteOben, ortText, storyDruck, SPEICHER_SCHLUESSEL } = await import('../src/ui/flaechen/geschichte.ts');
const { verlaufBand } = await import('../src/grafik/verlauf.ts');
const { wegSkizze } = await import('../src/grafik/weg-skizze.ts');
const { W } = await import('../src/ui/woerter.ts');
type Stand = ReturnType<typeof E.neuerStand>;

const ECHT_MIT_AKTEN = inhalte.geschichte;
assert.ok(ECHT_MIT_AKTEN);
// seit P19.6 trägt die echte Story drei Akte; die Gegenprobe „ohne Akte wie bisher“ nimmt eine Kopie ohne sie
const ECHT = Object.assign(structuredClone(ECHT_MIT_AKTEN), { akte: [] });
const g = synthetischeAkteStory(ECHT);
const ohne = synthetischeAkteStory(ECHT, { akte: false });
/** Lesezeit der synthetischen Story: 100 Wörter je Schritt (die Messung prüft tests/lesezeit.test.ts) */
const lz = { woerterJeMinute: 200, lang: Object.fromEntries(E.schritte(g, false).map((s) => [E.schrittKennung(s), 100])), kurz: Object.fromEntries(E.schritte(g, true).map((s) => [E.schrittKennung(s), 100])) };
const an = (kap: string, teil: 'szene' | 'vergleich' | 'frage' | 'mini', basis: Stand = E.neuerStand()): Stand => ({ ...basis, schritt: { ort: 'kapitel', kapitel: kap, teil } });
const gutWeg = (kurz = false): Stand => {
  let s = E.neuerStand(kurz);
  for (const k of g.kapitel) s = E.waehle(g, s, k.id, E.gutePlatz(k));
  return s;
};
const pause = (akt: string): Stand => ({ ...gutWeg(), schritt: { ort: 'pause', akt } });
const text = (el: Element): string => (el.textContent ?? '').replace(/\s+/gu, ' ').trim();

/* ------------------------------------------------------------------ Engine -- */

test('Synthetische Story: 14 Stationen s1 … s14 in drei Akten, Kurzfassung s1 · s3 · s5 · s12', () => {
  assert.deepEqual(g.kapitel.map((k) => k.id), Array.from({ length: 14 }, (_, i) => `s${i + 1}`));
  assert.deepEqual(g.kapitel.map((k) => k.nr), Array.from({ length: 14 }, (_, i) => i + 1));
  assert.deepEqual(E.wegKapitel(g, true).map((k) => k.id), ['s1', 's3', 's5', 's12']);
  assert.deepEqual(g.akte.map((a) => a.stationen.length), [5, 5, 4]);
  assert.deepEqual(g.akte.flatMap((a) => a.stationen), g.kapitel.map((k) => k.id));
  assert.deepEqual(KURZ_NR, [1, 3, 5, 12]);
});

test('Schritte: Pause am Ende von Akt I und II (nicht III), nur auf dem ganzen Weg, in Reihenfolge der Stationen', () => {
  const lang = E.schritte(g, false);
  const pausen = lang.flatMap((s, i) => (s.ort === 'pause' ? [{ i, s }] : []));
  assert.equal(pausen.length, 2);
  assert.deepEqual(pausen.map((p) => (p.s.ort === 'pause' ? p.s.akt : '')), ['a1', 'a2']);
  // die Pause steht unmittelbar hinter dem letzten Schritt der letzten Station des Akts, davor Frage oder Mini, danach die erste Szene des nächsten Akts
  for (const [p, letzte, naechste] of [[pausen[0], 's5', 's6'], [pausen[1], 's10', 's11']] as const) {
    assert.ok(p);
    const davor = lang[p.i - 1];
    assert.equal(davor?.ort === 'kapitel' ? davor.kapitel : null, letzte);
    const danach = lang[p.i + 1];
    assert.deepEqual(danach, { ort: 'kapitel', kapitel: naechste, teil: 'szene' });
  }
  assert.equal(E.schritte(g, true).filter((s) => s.ort === 'pause').length, 0, 'Kurzfassung ohne Pause');
  assert.deepEqual(E.schrittKennung({ ort: 'pause', akt: 'a1' }), 'pause:a1');
  // ohne Akte keine Pause – dieselbe Station liefert dieselben Schritte
  assert.equal(E.schritte(ohne, false).filter((s) => s.ort === 'pause').length, 0);
  assert.equal(E.schritte(ohne, false).length, lang.length - 2);
});

test('Ohne Akte wie bisher: die echte Story ohne ihre Akte hat keine Pause und je Station eine Brückenkarte; mit Akten hat sie drei und zwei Pausen', () => {
  assert.equal(ECHT_MIT_AKTEN.akte.length, 3);
  assert.equal(E.schritte(ECHT_MIT_AKTEN, false).filter((x) => x.ort === 'pause').length, 2);
  assert.deepEqual(ECHT.akte, []);
  assert.ok(E.schritte(ECHT, false).every((s) => s.ort !== 'pause'));
  for (const vor of [...ECHT.kapitel, null]) assert.ok(E.brueckenKarten(ECHT, vor).every((x) => x.length === 1), 'je Station eine Karte');
  assert.ok(E.brueckenKarten(ECHT, null).length >= 1);
});

test('Weiter und Zurück laufen durch die Pause; der Sprung auf die Pause und die Balken dort', () => {
  let s = an('s5', 'frage', gutWeg());
  s = E.weiter(g, s);
  // s5 hat (als Kopie von k4) eine Mini-Aufgabe: erst sie, dann die Pause
  if (s.schritt.ort === 'kapitel') s = E.weiter(g, s);
  assert.deepEqual(s.schritt, { ort: 'pause', akt: 'a1' });
  assert.deepEqual(E.balken(g, s), E.balkenBis(g, s, 5), 'in der Pause stehen die Balken nach der letzten Station des Akts');
  assert.deepEqual(E.weiter(g, s).schritt, { ort: 'kapitel', kapitel: 's6', teil: 'szene' });
  assert.deepEqual(E.geheZu(g, E.neuerStand(), { ort: 'pause', akt: 'a2' }).schritt, { ort: 'pause', akt: 'a2' });
  assert.deepEqual(E.geheZu(g, E.neuerStand(), { ort: 'pause', akt: 'a3' }).schritt, { ort: 'auftakt' }, 'nach dem letzten Akt gibt es keine Pause');
  assert.deepEqual(E.geheZu(g, E.neuerStand(true), { ort: 'pause', akt: 'a1' }).schritt, { ort: 'auftakt' }, 'die Kurzfassung hat keine Pause');
});

test('Wechsel in die Kurzfassung aus der Pause: weiter mit der nächsten gespielten Station', () => {
  assert.deepEqual(E.setzeKurz(g, pause('a1'), true).schritt, { ort: 'kapitel', kapitel: 's12', teil: 'szene' });
  assert.deepEqual(E.setzeKurz(g, pause('a2'), true).schritt, { ort: 'kapitel', kapitel: 's12', teil: 'szene' });
});

test('Brücken der Kurzfassung gebündelt: höchstens drei Stationen je Karte, in Folge', () => {
  const gruppen = (vor: string | null) => E.brueckenKarten(g, vor === null ? null : E.kapitel(g, vor)).map((x) => x.map((k) => k.id));
  assert.deepEqual(gruppen('s3'), [['s2']]);
  assert.deepEqual(gruppen('s5'), [['s4']]);
  assert.deepEqual(gruppen('s12'), [['s6', 's7', 's8'], ['s9', 's10', 's11']], 'sechs Stationen auf zwei Karten');
  assert.deepEqual(gruppen(null), [['s13', 's14']]);
  assert.deepEqual(gruppen('s1'), []);
});

test('Ende der Kurzfassung: „Weiter mit der ganzen Geschichte“ setzt an der ersten nicht gespielten Station ein, Antworten bleiben', () => {
  const kurz = { ...gutWeg(true), schritt: { ort: 'ende' } as const };
  const neu = E.weiterMitGanzer(g, kurz);
  assert.equal(neu.kurz, false);
  assert.deepEqual(neu.schritt, { ort: 'kapitel', kapitel: 's2', teil: 'szene' });
  assert.deepEqual(neu.wahlen, kurz.wahlen);
  // ist alles gespielt, bleibt nur der Wechsel des Wegs
  const alles = { ...g, kapitel: g.kapitel.map((k) => ({ ...k, kurzfassung: true })) };
  assert.deepEqual(E.weiterMitGanzer(alles, kurz).schritt, { ort: 'ende' });
});

test('Verlauf: Start und ein Punkt je Station bis zur gefragten, genau die Balken der Engine', () => {
  const s = gutWeg();
  const v = E.verlaufBis(g, s, 5);
  assert.deepEqual(v.map((p) => p.nr), [0, 1, 2, 3, 4, 5]);
  assert.equal(v[0]?.id, null);
  assert.deepEqual(v[0]?.balken, E.startBalken(g));
  for (const p of v.slice(1)) assert.deepEqual(p.balken, E.balkenBis(g, s, p.nr));
  assert.equal(E.verlaufBis(g, E.neuerStand(), 14).length, 15);
});

test('Speicher: gk.story bleibt Fassung 2; die Pause wird gespeichert, ein alter Stand mit k-Kennungen ist ungültig', () => {
  assert.equal(E.STAND_VERSION, 2);
  const p = pause('a1');
  assert.deepEqual(E.leseStand(g, JSON.parse(JSON.stringify(p))), p);
  // alter Stand einer Story mit k1 … k8: keine Kennung passt → verworfen (die Geschichte beginnt von vorn)
  const alt = { v: 2, kurz: false, schritt: { ort: 'kapitel', kapitel: 'k3', teil: 'frage' }, wahlen: { k1: 1, k2: 0, k3: 2 }, mini: {}, gewichte: null };
  assert.equal(E.leseStand(g, alt), null);
  assert.equal(E.leseStand(g, { ...alt, schritt: { ort: 'auftakt' } }), null);
  // ein einzelner unbekannter Eintrag neben bekannten fällt dagegen einzeln weg
  assert.deepEqual(E.leseStand(g, { ...alt, wahlen: { s1: 1, k9: 0 }, schritt: { ort: 'auftakt' } })?.wahlen, { s1: 1 });
  // und ein leerer, frischer Stand bleibt gültig
  assert.ok(E.leseStand(g, JSON.parse(JSON.stringify(E.neuerStand()))));
  // Pause einer unbekannten Kennung → Auftakt
  assert.deepEqual(E.leseStand(g, { ...JSON.parse(JSON.stringify(E.neuerStand())), schritt: { ort: 'pause', akt: 'a9' } })?.schritt, { ort: 'auftakt' });
});

test('Restzeit: Wörter vom aktuellen Schritt bis zum Ende, fehlende Messung ergibt null', () => {
  const alle = E.schritte(g, false);
  assert.equal(E.restWoerter(g, E.neuerStand(), lz), alle.length * 100);
  assert.equal(E.restWoerter(g, an('s14', 'frage'), lz), 100 * (E.schritte(g, false).length - E.schrittIndex(g, an('s14', 'frage'))), 'Frage (und Mini-Aufgabe) von s14 und Ende');
  assert.equal(E.restWoerter(g, E.neuerStand(), { ...lz, lang: {} }), null);
  assert.equal(E.minutenAus(1800, 200), 9);
  assert.equal(E.minutenAus(10, 200), 1, 'mindestens eine Minute');
  assert.equal(E.minutenAus(300, 200), 2, 'gerundet, nicht abgeschnitten');
  assert.equal(E.aktWoerter(g, g.akte[0]!, lz), (E.schritte(g, false).filter((s) => (s.ort === 'kapitel' && g.akte[0]!.stationen.includes(s.kapitel)) || (s.ort === 'pause' && s.akt === 'a1')).length) * 100);
});

/* ------------------------------------------------------------------ Grafik -- */

test('Verlaufsband: drei Linien vor drei Bändern, ohne Zahlen, ohne id und url(), deterministisch', () => {
  const reihen = [
    { klasse: 'vb-geld', name: 'Geld', werte: [9, 9, 8, 7, 6, 6] },
    { klasse: 'vb-zeit', name: 'Zeit', werte: [6, 6, 7, 8, 8, 8] },
    { klasse: 'vb-vertrauen', name: 'Vertrauen', werte: [4, 6, 7, 9, 10, 10] },
  ];
  const svg = verlaufBand(reihen, 'a "b" <c> & d');
  assert.equal(svg, verlaufBand(reihen, 'a "b" <c> & d'));
  assert.equal((svg.match(/<polyline/gu) ?? []).length, 3);
  assert.equal((svg.match(/<circle/gu) ?? []).length, 18, 'ein Punkt je Wert');
  for (const b of ['hoch', 'mittel', 'niedrig']) assert.match(svg, new RegExp(`vb-band-${b}`, 'u'));
  assert.ok(!/ id=/u.test(svg) && !/url\(/u.test(svg) && !/#[0-9a-f]{3,8}\b|style=/iu.test(svg));
  assert.match(svg, /role="img"/u);
  assert.match(svg, /aria-label="a &quot;b&quot; &lt;c&gt; &amp; d"/u);
  // Beschriftung am Ende der Linie, aber keine Zahlen
  const beschriftung = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/gu)].map((m) => m[1]);
  assert.deepEqual(beschriftung, ['Geld', 'Zeit', 'Vertrauen']);
  // ein einzelner Punkt (Start) ist zeichenbar
  assert.match(verlaufBand([{ klasse: 'vb-geld', name: 'Geld', werte: [9] }], 'x'), /<polyline/u);
  // die drei Bänder schließen lückenlos aneinander (hoch oben, niedrig unten)
  const band = (b: string): { y: number; h: number } => { const m = new RegExp(`vb-band-${b}" x="[\\d.]+" y="([\\d.]+)" width="[\\d.]+" height="([\\d.]+)"`, 'u').exec(svg); return { y: Number(m?.[1]), h: Number(m?.[2]) }; };
  assert.ok(Math.abs(band('hoch').y + band('hoch').h - band('mittel').y) < 0.2 && Math.abs(band('mittel').y + band('mittel').h - band('niedrig').y) < 0.2, 'Bänder lückenlos');
  // je höher der Wert, desto kleiner y
  const y = (w: number) => Number(/points="[\d.]+,([\d.]+)"/u.exec(verlaufBand([{ klasse: 'vb-geld', name: 'Geld', werte: [w] }], 'x'))?.[1]);
  assert.ok(y(9) < y(5) && y(5) < y(1));
});

test('Wegwahl-Karten wachsen mit: Skizze mit 14 Stationen, Kurzfassung mit s1 · s3 · s5 · s12 besetzt', () => {
  const inKurz = g.kapitel.map((k) => k.kurzfassung);
  const lang = wegSkizze(inKurz.map(() => true), 'Beschreibung', false);
  assert.equal((lang.match(/class="ws-station"/gu) ?? []).length, 14);
  const kurz = wegSkizze(inKurz, 'Beschreibung', true);
  assert.equal((kurz.match(/class="ws-station"/gu) ?? []).length, 4);
  assert.equal((kurz.match(/class="ws-uebersprungen"/gu) ?? []).length, 10);
  assert.deepEqual([...kurz.matchAll(/class="ws-nr"[^>]*>(\d+)</gu)].map((m) => Number(m[1])), [1, 3, 5, 12]);
  // die Wegkarten im Auftakt zeigen die 14
  const el = baueSchritt({ g, stand: E.neuerStand(), bedienbar: true, themaTitel: () => null, tue: () => undefined, lesezeit: lz });
  assert.equal(el.querySelectorAll('[data-pruef="weg-karte-lang"] .ws-station').length, 14);
  assert.equal(el.querySelectorAll('[data-pruef="weg-karte-kurz"] .ws-station').length, 4);
});

/* ------------------------------------------------------------- Akt-Leiste -- */

const felder = (el: Element): HTMLElement[] => [...el.querySelectorAll<HTMLElement>('.gs-felder .gs-feld')];

test('Akt-Leiste: nur der Akt der gezeigten Station ist aufgeklappt, die anderen je ein Feld; höchstens zehn Felder zugleich', () => {
  for (const [kap, akt, erwartet] of [['s1', 'a1', ['1', '2', '3', '4', '5', 'II', 'III']], ['s7', 'a2', ['I', '6', '7', '8', '9', '10', 'III']], ['s13', 'a3', ['I', 'II', '11', '12', '13', '14']]] as const) {
    const nav = fortschritt(g, an(kap, 'szene'), true, () => undefined);
    const f = felder(nav);
    // Auftakt (Symbol, ohne Text) und Ende (Symbol) umrahmen die Gruppen
    assert.deepEqual(f.filter((x) => x.dataset['art'] !== 'rand').map((x) => text(x)), erwartet, akt);
    assert.equal(f.length, erwartet.length + 2);
    assert.ok(f.length <= 10, `${f.length} Felder`);
    assert.equal(f.filter((x) => x.getAttribute('aria-current') === 'step').length, 1);
    assert.ok(nav.classList.contains('gs-fortschritt-akte'));
  }
  // Auftakt und Ende: kein Akt ist aufgeklappt
  assert.deepEqual(felder(fortschritt(g, E.neuerStand(), true, () => undefined)).filter((x) => x.dataset['art'] !== 'rand').map(text), ['I', 'II', 'III']);
  assert.deepEqual(felder(fortschritt(g, { ...E.neuerStand(), schritt: { ort: 'ende' } }, true, () => undefined)).filter((x) => x.dataset['art'] !== 'rand').map(text), ['I', 'II', 'III']);
});

test('Akt-Leiste in der Pause: der abgeschlossene Akt ist „jetzt“ (als Feld mit der römischen Zahl), nicht die letzte Station darin (L-390); Gegenprobe: in der letzten Station zeigt sie diese', () => {
  for (const [akt, erwartet, rest] of [['a1', 'I', ['II', 'III']], ['a2', 'II', ['I', 'III']]] as const) {
    const f = felder(fortschritt(g, pause(akt), true, () => undefined)).filter((x) => x.dataset['art'] !== 'rand');
    const jetzt = f.filter((x) => x.getAttribute('aria-current') === 'step');
    assert.deepEqual(jetzt.map(text), [erwartet], `Pause ${akt}`);
    assert.deepEqual(f.filter((x) => x.getAttribute('aria-current') !== 'step').map(text), rest, `Pause ${akt}: die anderen Akte als Felder`);
  }
  const letzte = felder(fortschritt(g, an('s5', 'szene'), true, () => undefined)).filter((x) => x.getAttribute('aria-current') === 'step');
  assert.deepEqual(letzte.map(text), ['5'], 'Gegenprobe: in Station 5 steht die Station selbst da');
});

test('Akt-Leiste: Sprung per Feld und per Sprungmenü, Beschriftungen nennen Akt und Station; Zustände erledigt · jetzt · offen', () => {
  let stand = an('s7', 'szene', gutWeg());
  const tue = (n: Stand): void => { stand = n; };
  const nav = fortschritt(g, stand, true, tue);
  const akt3 = felder(nav).find((x) => x.dataset['art'] === 'akt' && text(x) === 'III');
  assert.ok(akt3);
  assert.equal(akt3.getAttribute('aria-label'), `${W.geschichte.aktTitel('III', 'Entscheiden und Übergeben')}`);
  assert.equal(akt3.dataset['zustand'], 'offen');
  assert.equal(felder(nav).find((x) => text(x) === 'I')?.dataset['zustand'], 'erledigt');
  akt3.click();
  assert.deepEqual(stand.schritt, { ort: 'kapitel', kapitel: 's11', teil: 'szene' });
  // Station 8 im aufgeklappten Akt
  felder(nav).find((x) => text(x) === '8')?.click();
  assert.deepEqual(stand.schritt, { ort: 'kapitel', kapitel: 's8', teil: 'szene' });
  // Sprungmenü: alle 14 Stationen unter drei Akt-Überschriften, bedienbar nur an der Fläche
  const menue = nav.querySelector('details.gs-sprung');
  assert.ok(menue);
  assert.equal(menue.querySelectorAll('button.gs-sprung-station').length, 14);
  assert.equal(menue.querySelectorAll('.gs-sprung-akt-titel').length, 3);
  assert.match(text(menue.querySelector('summary') as Element), /Station wählen/u);
  menue.querySelector<HTMLElement>('[data-pruef="sprung-s13"]')?.click();
  assert.deepEqual(stand.schritt, { ort: 'kapitel', kapitel: 's13', teil: 'szene' });
  assert.equal(fortschritt(g, stand, false, tue).querySelector('details'), null, 'Leinwand: kein Menü');
  assert.equal(fortschritt(g, stand, false, tue).querySelectorAll('button').length, 0, 'Leinwand: keine Knöpfe');
});

test('Akt-Leiste in der Kurzfassung: nur die gespielten Stationen, Akte ohne gespielte Station fehlen', () => {
  const nav = fortschritt(g, { ...an('s3', 'szene'), kurz: true }, true, () => undefined);
  assert.deepEqual(felder(nav).filter((x) => x.dataset['art'] !== 'rand').map(text), ['1', '3', '5', 'III']);
  assert.equal(fortschritt(g, { ...an('s12', 'szene'), kurz: true }, true, () => undefined).querySelectorAll('.gs-sprung-station').length, 4);
});

test('Ortszeile: „Station 7 von 14 · Akt II · noch etwa 9 Minuten“ (Restzeit aus der Messung), Kurzfassung „von 4“, Pause, ohne Messung ohne Zeit', () => {
  // 100 Wörter je Schritt: ab s7:szene bleiben alle Schritte von s7 bis zum Ende
  const bis = E.schritte(g, false).length - E.schrittIndex(g, an('s7', 'szene'));
  const min = Math.max(1, Math.round((bis * 100) / 200));
  assert.equal(ortText(g, an('s7', 'szene'), lz), `Station 7 von 14 · Akt II · noch etwa ${min} Minuten`);
  assert.equal(ortText(g, an('s7', 'szene'), { ...lz, lang: {} }), 'Station 7 von 14 · Akt II');
  assert.match(ortText(g, { ...an('s12', 'frage'), kurz: true }, lz), /^Station 4 von 4 · Akt III · (noch etwa \d+ Minuten|gleich geschafft)$/u);
  assert.match(ortText(g, pause('a1'), lz), /^Pause nach Akt I · (noch etwa \d+ Minuten|gleich geschafft)$/u);
  assert.equal(ortText(g, E.neuerStand(), lz), W.geschichte.auftakt);
  assert.equal(ortText(g, { ...E.neuerStand(), schritt: { ort: 'ende' } }, lz), W.geschichte.endeOrt);
  // ohne Akte: wie bisher „3 von 8 · Titel“
  assert.match(ortText(ECHT, an('s3', 'szene')), /^3 von 14 · /u);
  // deterministisch: dieselbe Zeile, so oft man fragt
  assert.equal(ortText(g, an('s7', 'szene'), lz), ortText(g, an('s7', 'szene'), lz));
  const leiste = leisteOben(g, an('s7', 'szene'), true, () => undefined, lz);
  assert.match(text(leiste.find((n) => (n as HTMLElement).dataset?.['pruef'] === 'gs-ort') as Element), /^Station 7 von 14 · Akt II/u);
  // sichtbar „Station“, nie „Kapitel“
  assert.doesNotMatch(ortText(g, an('s7', 'szene'), lz), /Kapitel/u);
});

/* ------------------------------------------------------------------- Pause -- */

const opt = (stand: Stand, bedienbar = true, tue: (n: Stand) => void = () => undefined) => ({ g, stand, bedienbar, themaTitel: () => null, tue, lesezeit: lz });

test('Pause: Zwischenbilanz mit Balken und Verlaufsband, „Das können Sie jetzt“ in drei Sätzen, Weiter mit dem nächsten Akt', () => {
  let stand = pause('a1');
  const el = baueSchritt(opt(stand, true, (n) => { stand = n; }));
  assert.equal(el.dataset['teil'], 'pause');
  assert.equal(el.querySelector('h1.gs-titel')?.getAttribute('tabindex'), '-1');
  assert.match(text(el.querySelector('h1') as Element), /Akt I · Ordnung schaffen/u);
  assert.ok(el.querySelector('[data-pruef="gs-zwischenbilanz"] .gs-stand'), 'Balken der Zwischenbilanz');
  const svg = el.querySelector('[data-pruef="gs-verlauf"] svg.vb');
  assert.ok(svg);
  assert.equal(svg.querySelectorAll('polyline').length, 3);
  assert.equal(svg.querySelectorAll('circle.vb-geld').length, 6, 'Start und fünf Stationen');
  assert.equal(text(el.querySelector('[data-pruef="gs-verlauf"] .gs-verlauf-kopf') as Element), 'Ihr Weg bis hier');
  assert.deepEqual([...el.querySelectorAll('[data-pruef="gs-koennen-a1"] li')].map(text), ['Sie können Eins von Akt 1.', 'Sie können Zwei von Akt 1.', 'Sie können Drei von Akt 1.']);
  assert.equal(text(el.querySelector('[data-pruef="gs-koennen-a1"] h2') as Element), 'Das können Sie jetzt');
  assert.match(text(el), /Pause nach Akt 1\./u, 'Zeile der Bürgermeisterin');
  // Textfassung des Verlaufs (P19.4): je Station eine Zeile in den Wörtern der Folge, mit dem Stand in Streifen-Wörtern
  const zeilen = el.querySelectorAll('[data-pruef="gs-verlauf-worte"] .gs-verlauf-liste > li');
  assert.equal(zeilen.length, 5, 'je Station eine Zeile');
  assert.match(text(zeilen[0] as Element), /^1 · Station 1: Geld .*Zeit .*Vertrauen .*\. Geld (gut gefüllt|etwa halb voll|knapp) · Zeit /u);
  assert.doesNotMatch(text(el.querySelector('[data-pruef="gs-verlauf"]') as Element), /(Geld|Zeit|Vertrauen):? \d/u, 'Verlauf ohne Zahlen');
  const weiter = el.querySelector<HTMLElement>('[data-pruef="pause-weiter"]');
  assert.ok(weiter);
  assert.equal(text(weiter), 'Weiter mit Akt II');
  weiter.click();
  assert.deepEqual(stand.schritt, { ort: 'kapitel', kapitel: 's6', teil: 'szene' });
  // Akt II: nächster ist Akt III
  assert.equal(text(baueSchritt(opt(pause('a2'))).querySelector('[data-pruef="pause-weiter"]') as Element), 'Weiter mit Akt III');
  // Leinwand: keine Knöpfe
  assert.equal(baueSchritt(opt(pause('a1'), false)).querySelectorAll('button').length, 0);
});

test('Pause: keine Wertung und keine Regie-Wörter sichtbar; Verlauf bis zur letzten Station des Akts, nicht weiter', () => {
  const el = baueSchritt(opt(pause('a2')));
  assert.equal(el.querySelectorAll('[data-pruef="gs-verlauf"] circle.vb-zeit').length, 11, 'Start und zehn Stationen');
  assert.doesNotMatch(text(el), /\bFalle\b|\bgut gewählt\b|Wertung|Punkte/u);
});

test('Ende: nach dem letzten Akt steht „Das können Sie jetzt“ vor der Bilanz – auf dem ganzen Weg, nicht in der Kurzfassung', () => {
  const lang = baueSchritt(opt({ ...gutWeg(), schritt: { ort: 'ende' } }));
  const k = lang.querySelector('[data-pruef="gs-koennen-ende"]');
  assert.ok(k);
  assert.equal(k.querySelectorAll('li').length, 3);
  assert.ok(k.compareDocumentPosition(lang.querySelector('[data-pruef="gs-bilanz"]') as Element) & 4, 'vor der Bilanz');
  const kurz = baueSchritt(opt({ ...gutWeg(true), schritt: { ort: 'ende' } }));
  assert.equal(kurz.querySelector('[data-pruef="gs-koennen-ende"]'), null);
});

test('Kopfkarte: über der ersten Station jedes Akts, mit Akt, Zeitraum, Dauer; nicht in der Kurzfassung und nicht an anderen Stationen', () => {
  for (const [kap, id] of [['s1', 'a1'], ['s6', 'a2'], ['s11', 'a3']] as const) {
    const el = baueSchritt(opt(an(kap, 'szene')));
    const kopf = el.querySelector(`[data-pruef="akt-kopf-${id}"]`);
    assert.ok(kopf, kap);
    assert.match(text(kopf), /Akt (I|II|III) · .* · (Januar bis Juni 2026|August 2026 bis Februar 2027|April 2027 bis August 2028) · etwa (\d+ Minuten|eine Minute)/u);
    assert.match(text(kopf), /Kopfkarte von Akt/u);
  }
  assert.equal(baueSchritt(opt(an('s2', 'szene'))).querySelector('[data-pruef^="akt-kopf"]'), null);
  assert.equal(baueSchritt(opt({ ...an('s1', 'szene'), kurz: true })).querySelector('[data-pruef^="akt-kopf"]'), null);
  assert.equal(baueSchritt({ ...opt(an('s1', 'szene')), g: ohne }).querySelector('[data-pruef^="akt-kopf"]'), null);
});

/* ------------------------------------------------------------ Brückenkarten -- */

test('Kurzfassung: gebündelte Brückenkarte vor s12 (zwei Karten), Ende mit „Weiter mit der ganzen Geschichte“', () => {
  const el = baueSchritt(opt({ ...an('s12', 'szene'), kurz: true }));
  const karten = el.querySelectorAll('.gs-bruecken > ul > li');
  assert.equal(karten.length, 2);
  assert.deepEqual([...karten].map((li) => li.getAttribute('data-stationen')), ['s6 s7 s8', 's9 s10 s11']);
  // P19.6: Kicker „Inzwischen“ (zählt nicht), je Zeile die fette Nummer, dann der Satz – kein „Station“, kein Jahr, der Titel nur für Screenreader
  assert.equal(text(el.querySelector('.gs-bruecken-titel') as Element), 'Inzwischen');
  assert.ok(el.querySelector('.gs-bruecken-titel.gs-kicker'));
  assert.deepEqual([...(karten[0] as Element).querySelectorAll('.gs-bruecke-zeile b')].map((b) => text(b)), ['6', '7', '8']);
  assert.match(text(karten[0] as Element), /6 · .*Brücke der Station 6\..*7 · .*Brücke der Station 7\..*8 · .*Brücke der Station 8\./u);
  const sichtbar = [...(karten[0] as Element).querySelectorAll('.gs-bruecke-zeile')].map((z) => { const c = z.cloneNode(true) as Element; c.querySelectorAll('.nur-sr').forEach((x) => x.remove()); return text(c); });
  assert.deepEqual(sichtbar, ['6 · Brücke der Station 6.', '7 · Brücke der Station 7.', '8 · Brücke der Station 8.'], 'je Zeile Nummer und Satz, kein Titel, kein Jahr');
  for (const z of karten[0]?.querySelectorAll('.gs-bruecke-zeile') ?? []) assert.ok(z.querySelector('.nur-sr'), 'der Titel der Station steht für Screenreader da');
  // einzelne Brücke ohne Bündel
  assert.equal(baueSchritt(opt({ ...an('s3', 'szene'), kurz: true })).querySelectorAll('.gs-bruecken > ul > li').length, 1);
  assert.equal(baueSchritt(opt({ ...an('s3', 'szene'), kurz: true })).querySelector('.gs-bruecke-gruppe'), null);
  let stand: Stand = { ...gutWeg(true), schritt: { ort: 'ende' } };
  const ende = baueSchritt(opt(stand, true, (n) => { stand = n; }));
  const knopf = ende.querySelector<HTMLElement>('[data-pruef="weiter-ganz"]');
  assert.ok(knopf);
  assert.equal(text(knopf), 'Weiter mit der ganzen Geschichte');
  knopf.click();
  assert.equal(stand.kurz, false);
  assert.deepEqual(stand.schritt, { ort: 'kapitel', kapitel: 's2', teil: 'szene' });
  // der ganze Weg bietet ihn nicht an; die Leinwand auch nicht
  assert.equal(baueSchritt(opt({ ...gutWeg(), schritt: { ort: 'ende' } })).querySelector('[data-pruef="weiter-ganz"]'), null);
  assert.equal(baueSchritt(opt({ ...gutWeg(true), schritt: { ort: 'ende' } }, false)).querySelector('[data-pruef="weiter-ganz"]'), null);
});

/* ----------------------------------------------------------- Fläche (Fluss) -- */

function speicher(): { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void; daten: Map<string, string> } {
  const daten = new Map<string, string>();
  return { daten, getItem: (k) => daten.get(k) ?? null, setItem: (k, v) => { daten.set(k, v); }, removeItem: (k) => { daten.delete(k); } };
}

test('Fläche: durch die Pause mit Weiter und mit dem Knopf der Pause, Fokus auf den Titel, Stand wird gespeichert', () => {
  const sp = speicher();
  sp.daten.set(SPEICHER_SCHLUESSEL, JSON.stringify(an('s5', 'frage', gutWeg())));
  const f = erzeugeGeschichte({ g, speicher: sp, themaTitel: () => null, lesezeit: lz });
  document.body.replaceChildren(f.element);
  const klick = (pruef: string): void => { (f.element.querySelector(`[data-pruef="${pruef}"]`) as HTMLElement).click(); };
  klick('weiter'); // s5 trägt seit P19.6 eine Mini-Aufgabe (nach der Folge): erst sie, dann die Pause
  assert.deepEqual(f.stand().schritt, { ort: 'kapitel', kapitel: 's5', teil: 'mini' });
  klick('weiter');
  assert.equal(f.stand().schritt.ort, 'pause');
  assert.equal((document.activeElement as HTMLElement).dataset['pruef'], 'gs-titel');
  assert.match(text(f.element.querySelector('[data-pruef="gs-ort"]') as Element), /^Pause nach Akt I/u);
  assert.equal(JSON.parse(sp.daten.get(SPEICHER_SCHLUESSEL) as string).schritt.ort, 'pause');
  assert.equal(document.body.dataset['teil'], 'pause');
  klick('pause-weiter');
  assert.deepEqual(f.stand().schritt, { ort: 'kapitel', kapitel: 's6', teil: 'szene' });
  assert.match(text(f.element.querySelector('[data-pruef="gs-ort"]') as Element), /^Station 6 von 14 · Akt II/u);
  // Zurück führt wieder in die Pause
  klick('zurueck');
  assert.equal(f.stand().schritt.ort, 'pause');
});

test('Fläche: ein alter Stand mit k-Kennungen wird verworfen, die Story beginnt am Auftakt', () => {
  const sp = speicher();
  sp.daten.set(SPEICHER_SCHLUESSEL, JSON.stringify({ v: 2, kurz: true, schritt: { ort: 'kapitel', kapitel: 'k4', teil: 'szene' }, wahlen: { k1: 0, k4: 1 }, mini: {}, gewichte: null }));
  const f = erzeugeGeschichte({ g, speicher: sp, themaTitel: () => null, lesezeit: lz });
  assert.deepEqual(f.stand(), E.neuerStand());
});

test('Fläche: Tastatur (Pfeil rechts und links) läuft durch die Pause', () => {
  const f = erzeugeGeschichte({ g, speicher: null, themaTitel: () => null, lesezeit: lz });
  document.body.replaceChildren(f.element);
  f.zuKapitel('s5');
  const taste = (key: string): void => { f.taste(new dom.window.KeyboardEvent('keydown', { key }) as unknown as KeyboardEvent); };
  // ohne Wahl geht es von der Frage nicht weiter; mit Wahl von der Frage in die Pause
  taste('ArrowRight');
  const jetzt = f.stand().schritt;
  assert.equal(jetzt.ort === 'kapitel' ? jetzt.teil : '', 'frage');
  (f.element.querySelector('[data-pruef="antwort-1"]') as HTMLElement).click();
  taste('ArrowRight');
  // s5 trägt seit P19.6 eine Mini-Aufgabe (nach der Folge): erst sie, dann die Pause
  assert.deepEqual(f.stand().schritt, { ort: 'kapitel', kapitel: 's5', teil: 'mini' });
  taste('ArrowRight');
  assert.equal(f.stand().schritt.ort, 'pause');
  taste('ArrowRight');
  assert.deepEqual(f.stand().schritt, { ort: 'kapitel', kapitel: 's6', teil: 'szene' });
  taste('ArrowLeft');
  assert.equal(f.stand().schritt.ort, 'pause');
});

/* ------------------------------------------------------------------- Druck -- */

test('Druck: je Akt ein Abschnitt mit Akt-Überschrift (Seitenumbruch per CSS), Stationen darunter, Bilanz am Ende', () => {
  const el = document.createElement('div');
  el.append(...storyDruck(g, { ...gutWeg(), schritt: { ort: 'ende' } }, 'Fassung').teile);
  const akte = [...el.querySelectorAll('.druck-story > .druck-akt')];
  assert.equal(akte.length, 3);
  assert.deepEqual(akte.map((a) => text(a.querySelector('.druck-akt-titel') as Element)), ['Akt I · Ordnung schaffen · Januar bis Juni 2026', 'Akt II · Takt und Zahlen · August 2026 bis Februar 2027', 'Akt III · Entscheiden und Übergeben · April 2027 bis August 2028']);
  assert.deepEqual(akte.map((a) => a.querySelectorAll(':scope > .druck-teil').length), [5, 5, 4]);
  assert.equal(akte[0]?.querySelector('.druck-akt-titel')?.tagName, 'H2');
  assert.equal(akte[0]?.querySelector('.druck-teil h3')?.tagName, 'H3', 'Stationen eine Ebene tiefer');
  assert.ok(el.querySelector('[data-pruef="druck-bilanz"]'));
  // die Überschrift steht vor ihren Stationen
  const erste = akte[0]?.firstElementChild;
  assert.ok(erste?.classList.contains('druck-akt-titel'));
  // das Stylesheet bricht zwischen den Akten um und hält Überschriften beim Text
  const css = readFileSync(new URL('../src/stil/geschichte.css', import.meta.url), 'utf8');
  assert.match(css, /\.druck-story \.druck-akt \+ \.druck-akt \{ break-before: page; \}/u);
  assert.match(css, /\.druck-akt-titel \{[^}]*break-after: avoid/u);
  // ohne Akte: wie bisher, flach
  const flach = document.createElement('div');
  flach.append(...storyDruck(ohne, E.neuerStand(), 'Fassung').teile);
  assert.equal(flach.querySelectorAll('.druck-akt').length, 0);
  assert.equal(flach.querySelectorAll('.druck-story > .druck-teil').length, 15, '14 Stationen und die Bilanz');
});

import { readFileSync } from 'node:fs';

test('Akt-Leiste: Zielgröße im Stylesheet – Felder und Menüknopf mindestens 24 px, Umbruch statt Schrumpfen unter 24 px', () => {
  const css = readFileSync(new URL('../src/stil/geschichte.css', import.meta.url), 'utf8');
  assert.match(css, /\.gs-fortschritt-akte \.gs-felder li \{ min-width: 24px; \}/u);
  assert.match(css, /\.gs-fortschritt-akte \.gs-felder \{ flex-wrap: wrap; \}/u);
  assert.match(css, /\.gs-sprung-knopf \{[^}]*min-height: 28px; min-width: 24px/u);
});
