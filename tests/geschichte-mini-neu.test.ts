/*
 * Neue Mini-Arten (P19.5, O-62, docs/drehbuch-v2/04-rahmen.md 7.8): matrix, mappe, pinnwand, bericht, rueckfragen – Kern (Zug, Auswertung,
 * Prüfung des gespeicherten Stands, Lösung, Änderung, „fertig“), Platz im Ablauf der Station, Zeichnung und Bedienung per Tastatur,
 * Rückmeldung „Stimmt.“ / „Nicht ganz.“ ohne Punkte, Schlusssatz, Regie, Leinwand, Lesezeit – dazu die Kürzungen der Kurzfassung (Folge, „So macht
 * man es gut“, „Das steckt dahinter“), die Vertiefung und die Spielarten von `zuordnen` (Muss-Filter, „Beschluss oder nicht?“).
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';

import { berichtMini, mappeMini, matrixMini, mitMini, p19Story, pinnwandMini, platzVon, rueckfragenMini } from './hilfen/geschichte-p19.ts';

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
const { MINI_ARTEN } = await import('../src/geschichte/mini-arten.ts');
const { MINI_BAUSTEINE, miniAnsage } = await import('../src/ui/flaechen/geschichte-mini.ts');
const { baueSchritt, erzeugeGeschichte, SPEICHER_SCHLUESSEL } = await import('../src/ui/flaechen/geschichte.ts');
const { loeseMini } = await import('../src/regie/eingriffe.ts');
const { geaenderterPosten, erzeugeAnzeige } = await import('../src/regie/leinwand.ts');
const { erzeugeRegie } = await import('../src/regie/regie.ts');
const { neueBuehne } = await import('../src/regie/buehne.ts');
const { sichtbarVerboten } = (await import(String('../werkzeuge/sichtbar.mjs'))) as { sichtbarVerboten: (t: string) => string[] };
const lib = (await import(String('../werkzeuge/lesezeit.mjs'))) as { zaehleWoerter: (el: Element) => number };
const { W } = await import('../src/ui/woerter.ts');
type Stand = ReturnType<typeof E.neuerStand>;

const ECHT = inhalte.geschichte;
assert.ok(ECHT);
const BASIS = p19Story(ECHT);
const text = (el: Element): string => (el.textContent ?? '').replace(/\s+/gu, ' ').trim();
const STATION = 4;
const KAP = `s${STATION}`;

/** Story mit der Mini-Aufgabe in Station 4 und der Stand, der an ihrem Mini-Schritt steht. */
const mit = (m: ReturnType<typeof matrixMini>, stelle?: 'nach-folge' | 'vor-frage' | 'vor-vergleich') => {
  const g = mitMini(BASIS, STATION, m, stelle);
  const stand = (liste?: number[], wahl = true): Stand => {
    let s = E.neuerStand();
    if (wahl) { const k = E.kapitel(g, KAP); if (k !== null) s = E.waehle(g, s, KAP, platzVon(k, 'gut')); }
    s = { ...s, schritt: { ort: 'kapitel', kapitel: KAP, teil: 'mini' } };
    return liste === undefined ? s : { ...s, mini: { [KAP]: liste } };
  };
  const seite = (s: Stand, bedienbar = true): HTMLElement => baueSchritt({ g, stand: s, bedienbar, themaTitel: () => null, tue: () => undefined });
  return { g, stand, seite };
};
const zug = (g: ReturnType<typeof mit>['g'], s: Stand, posten: number, wahl?: number): Stand => E.miniZug(g, s, KAP, posten, wahl);

/* ------------------------------------------------------------------- Kern -- */

test('Kern matrix, mappe, pinnwand: je Posten eine feste Wahl; richtig, falsch, offen; Lösung, Änderung, Prüfung der Zahlenliste', () => {
  for (const [art, m, wahlen] of [['matrix', matrixMini(), 2], ['mappe', mappeMini(), 2], ['pinnwand', pinnwandMini(), 3]] as const) {
    const def = MINI_ARTEN[art];
    assert.equal(m.wahlen.length, wahlen, art);
    // erster Zug: Posten 0 bekommt die Wahl 1, die anderen bleiben offen
    const s1 = def.zug(m, [], 0, 1);
    assert.deepEqual(s1, [1, ...Array.from({ length: m.posten.length - 1 }, () => -1)], art);
    assert.deepEqual(def.werte(m, s1 ?? []).slice(0, 2), [m.wahlen[1]?.id === m.posten[0]?.loesung ? 'richtig' : 'falsch', 'offen'], art);
    // ungültig: Posten oder Wahl außerhalb
    assert.equal(def.zug(m, [], -1, 0), null);
    assert.equal(def.zug(m, [], m.posten.length, 0), null);
    assert.equal(def.zug(m, [], 0, wahlen), null);
    assert.equal(def.zug(m, [], 0), null, 'ohne Wahl kein Zug');
    // Lösung: alles richtig, gültig, fertig
    const l = def.loese(m);
    assert.ok(def.gueltig(m, l), art);
    assert.deepEqual(def.werte(m, l), m.posten.map(() => 'richtig'), art);
    assert.equal(E.werteMiniAus(m, l).fertig, true, art);
    assert.equal(E.werteMiniAus(m, [1]).fertig, false, art);
    assert.equal(E.werteMiniAus(m, undefined).fertig, false, art);
    // Gegenprobe: eine falsche Wahl ist falsch
    const falsch = l.map((x, i) => (i === 0 ? (x + 1) % wahlen : x));
    assert.equal(def.werte(m, falsch)[0], 'falsch', art);
    // Änderung: der erste Posten mit anderer Wahl; nichts geändert → null
    assert.equal(def.aenderung([], s1 ?? []), 0);
    assert.equal(def.aenderung(l, falsch), 0);
    assert.equal(def.aenderung(l, l), null);
    // gespeicherte Liste: Länge und Plätze
    assert.equal(def.gueltig(m, [0]), false, art);
    assert.equal(def.gueltig(m, l.map(() => wahlen)), false, art);
    assert.equal(def.gueltig(m, l.map(() => -1)), true, art);
    assert.equal(def.lesezeitOhne.length, 0, art);
  }
});

test('Kern bericht: Mehrfachauswahl „nachfordern“, eine Prüfung für alle Zeilen, danach gesperrt; Zustand leer oder n + 1 Zahlen', () => {
  const m = berichtMini();
  const def = MINI_ARTEN.bericht;
  const n = m.posten.length;
  // Zeilen setzen und lösen
  let l = def.zug(m, [], 1) ?? [];
  assert.deepEqual(l, [0, 1, 0, 0, 0, 0, 0]);
  l = def.zug(m, l, 3) ?? [];
  assert.deepEqual(l, [0, 1, 0, 1, 0, 0, 0]);
  assert.deepEqual(def.zug(m, l, 1), [0, 0, 0, 1, 0, 0, 0], 'ein zweiter Zug löst die Zeile wieder');
  // vor der Prüfung gibt es keine Rückmeldung
  assert.deepEqual(def.werte(m, l), Array.from({ length: n }, () => 'offen'));
  assert.equal(E.werteMiniAus(m, l).fertig, false);
  // Prüfung: Posten n
  const gepr = def.zug(m, l, n) ?? [];
  assert.equal(gepr[n], 1);
  assert.equal(E.werteMiniAus(m, gepr).fertig, true);
  // Lösungen: nachfordern bei 2, 4, 5 → Zeile 2 und 4 gesetzt, 5 (Platz 4) nicht → 2 richtig, 4 richtig
  const werte = def.werte(m, gepr);
  // Lösung: Zeilen 2, 4 und 5 werden nachgefordert (Plätze 1, 3, 4); gesetzt sind 2 und 4 → die fünfte Zeile fehlt
  assert.deepEqual(werte, ['richtig', 'richtig', 'richtig', 'richtig', 'falsch', 'richtig']);
  // nach der Prüfung gesperrt (null = Zug ungültig)
  assert.equal(def.zug(m, gepr, 0), null);
  assert.equal(def.zug(m, gepr, n), null);
  // ungültige Posten
  assert.equal(def.zug(m, [], -1), null);
  assert.equal(def.zug(m, [], n + 1), null);
  assert.equal(def.zug(m, [], 1.5), null);
  // Lösung und Zustand
  const loes = def.loese(m);
  assert.deepEqual(loes, [0, 1, 0, 1, 1, 0, 1]);
  assert.deepEqual(def.werte(m, loes), m.posten.map(() => 'richtig'));
  assert.ok(def.gueltig(m, []) && def.gueltig(m, loes));
  assert.equal(def.gueltig(m, [0, 1]), false);
  assert.equal(def.gueltig(m, [0, 1, 0, 1, 1, 0, 2]), false);
  assert.equal(def.gueltig(m, [0, 1, 0, 1, 1, 0, -1]), false);
  // Änderung
  assert.equal(def.aenderung([], l), 1);
  assert.equal(def.aenderung(l, gepr), 0, 'nur die Prüfung geändert: die erste Zeile');
  assert.equal(def.aenderung(gepr, gepr), null);
});

test('Kern rueckfragen: zwei von vier Gesprächen, Reihenfolge der Wahl, gesperrt danach; „fertig“ mit dem Kontingent; Auflösung zeigt alle', () => {
  const m = rueckfragenMini();
  const def = MINI_ARTEN.rueckfragen;
  assert.equal(E.werteMiniAus(m, []).fertig, false);
  const a = def.zug(m, [], 2) ?? [];
  assert.deepEqual(a, [2]);
  assert.equal(E.werteMiniAus(m, a).fertig, false);
  assert.deepEqual(def.werte(m, a), ['offen', 'offen', 'gewaehlt', 'offen']);
  assert.equal(def.zug(m, a, 2), null, 'dasselbe Gespräch nicht noch einmal');
  const b = def.zug(m, a, 0) ?? [];
  assert.deepEqual(b, [2, 0], 'Reihenfolge der Wahl');
  assert.equal(E.werteMiniAus(m, b).fertig, true);
  assert.equal(E.werteMiniAus(m, b).richtig, 0, 'es gibt kein Richtig');
  assert.equal(def.zug(m, b, 1), null, 'das Kontingent ist genutzt');
  assert.equal(def.zug(m, [], -1), null);
  assert.equal(def.zug(m, [], 4), null);
  // gespeicherte Liste: bis zum Kontingent oder – nach der Auflösung – alle
  assert.ok(def.gueltig(m, []) && def.gueltig(m, [3]) && def.gueltig(m, [1, 0]) && def.gueltig(m, [0, 1, 2, 3]));
  assert.equal(def.gueltig(m, [0, 1, 2]), false, 'drei sind weder Kontingent noch alle');
  assert.equal(def.gueltig(m, [1, 1]), false);
  assert.equal(def.gueltig(m, [4]), false);
  assert.equal(def.gueltig(m, [-1]), false);
  assert.deepEqual(def.loese(m), [0, 1, 2, 3]);
  assert.equal(E.werteMiniAus(m, def.loese(m)).fertig, true);
  // Änderung: das zuletzt gewählte bzw. gelöste Gespräch
  assert.equal(def.aenderung([], a), 2);
  assert.equal(def.aenderung(a, b), 0);
  assert.equal(def.aenderung(b, [2]), 0, 'zurückgenommen: das gelöste');
  assert.equal(def.aenderung(b, b), null);
  assert.deepEqual(def.lesezeitOhne, ['.gs-gespraech', '.gs-eintrag']);
});

test('Stand laden: die Prüfung der Zahlenliste kommt aus der Registry jeder neuen Art; Unpassendes fällt weg, der Rest bleibt', () => {
  const lade = (m: ReturnType<typeof matrixMini>, liste: unknown): unknown => {
    const g = mitMini(BASIS, STATION, m);
    return E.leseStand(g, { v: 2, kurz: false, schritt: { ort: 'auftakt' }, wahlen: { s1: 0 }, mini: { [KAP]: liste } })?.mini[KAP];
  };
  assert.deepEqual(lade(matrixMini(), [0, 1, -1]), [0, 1, -1]);
  assert.equal(lade(matrixMini(), [0, 1]), undefined);
  assert.equal(lade(matrixMini(), [0, 2, -1]), undefined);
  assert.deepEqual(lade(mappeMini(), [0, 1, 1, 0]), [0, 1, 1, 0]);
  assert.deepEqual(lade(pinnwandMini(), [2, 1, 0]), [2, 1, 0]);
  assert.equal(lade(pinnwandMini(), [3, 1, 0]), undefined);
  assert.deepEqual(lade(berichtMini(), [0, 1, 0, 1, 1, 0, 1]), [0, 1, 0, 1, 1, 0, 1]);
  assert.deepEqual(lade(berichtMini(), []), []);
  assert.equal(lade(berichtMini(), [0, 1, 0, 1, 1, 0, 7]), undefined);
  assert.deepEqual(lade(rueckfragenMini(), [3, 1]), [3, 1]);
  assert.equal(lade(rueckfragenMini(), [3, 1, 2]), undefined);
  assert.equal(lade(rueckfragenMini(), 'x'), undefined);
});

/* ------------------------------------------------- Platz im Ablauf der Station -- */

test('Schritte: die Mini-Aufgabe steht nach der Folge (Vorgabe), vor der Frage oder vor dem Vergleich – nie in der Kurzfassung', () => {
  const teile = (nr: number, stelle?: 'nach-folge' | 'vor-frage' | 'vor-vergleich'): string[] => {
    const g = mitMini(BASIS, nr, matrixMini(), stelle);
    return E.teileVon(g.kapitel[nr - 1] as never, false);
  };
  assert.deepEqual(teile(4), ['szene', 'frage', 'mini']);
  assert.deepEqual(teile(4, 'nach-folge'), ['szene', 'frage', 'mini']);
  assert.deepEqual(teile(4, 'vor-frage'), ['szene', 'mini', 'frage']);
  // Station 1 hat in der Synthese den Vergleich? Der Vergleich liegt in der Station 7
  const mitVergleich = BASIS.kapitel.find((k) => k.vergleich !== null);
  assert.ok(mitVergleich);
  assert.deepEqual(teile(mitVergleich.nr, 'vor-vergleich'), ['szene', 'mini', 'vergleich', 'frage']);
  assert.deepEqual(teile(mitVergleich.nr, 'vor-frage'), ['szene', 'vergleich', 'mini', 'frage']);
  // Kurzfassung: ohne Mini-Aufgabe (in jeder Stelle)
  const g = mitMini(BASIS, 5, matrixMini(), 'vor-frage');
  assert.deepEqual(E.teileVon(g.kapitel[4] as never, true), ['szene', 'frage']);
  // der Weg: die Schritte folgen dieser Ordnung; die Kennung des Schritts bleibt „s4:mini“
  const alle = E.schritte(mitMini(BASIS, 4, matrixMini(), 'vor-frage'), false).map(E.schrittKennung);
  assert.deepEqual(alle.filter((x) => x.startsWith('s4:')), ['s4:szene', 's4:mini', 's4:frage']);
  // Station beenden: wo „Das steckt dahinter“ und die Vertiefung stehen
  const k = g.kapitel[4] as never;
  assert.equal(E.endetStation(k, false, 'frage'), true, 'Mini vor der Frage: die Frage beendet die Station');
  assert.equal(E.endetStation(k, false, 'mini'), false);
  assert.equal(E.endetStation(mitMini(BASIS, 5, matrixMini()).kapitel[4] as never, false, 'mini'), true, 'Vorgabe: die Mini beendet die Station');
  assert.equal(E.endetStation(g.kapitel[4] as never, true, 'frage'), true, 'Kurzfassung: immer die Frage');
});

test('Ende der Station: bei der Mini-Aufgabe vor der Frage stehen „Das steckt dahinter“ und die Vertiefung in der Frage, nie doppelt', () => {
  const { g, stand, seite } = mit(berichtMini(), 'vor-frage');
  const geloest = { ...stand(undefined), wahlen: { s1: 0, [KAP]: 0 } };
  // Mini-Schritt: kein „Dahinter“
  assert.equal(seite({ ...geloest, schritt: { ort: 'kapitel', kapitel: KAP, teil: 'mini' } }).querySelector('[data-pruef="gs-dahinter"]'), null);
  // Frage nach der Antwort: Folge, „So macht man es gut“, „Dahinter“
  const frage = seite({ ...geloest, schritt: { ort: 'kapitel', kapitel: KAP, teil: 'frage' } });
  assert.ok(frage.querySelector('[data-pruef="gs-dahinter"]'));
  assert.equal(frage.querySelectorAll('[data-pruef="gs-dahinter"]').length, 1);
  // Gegenprobe: nach der Folge (Vorgabe) steht „Dahinter“ im Mini-Schritt und nicht in der Frage
  const alt = mit(berichtMini());
  const s2 = { ...alt.stand(undefined), wahlen: { s1: 0, [KAP]: 0 } };
  assert.ok(alt.seite(s2).querySelector('[data-pruef="gs-dahinter"]'));
  assert.equal(alt.seite({ ...s2, schritt: { ort: 'kapitel', kapitel: KAP, teil: 'frage' } }).querySelector('[data-pruef="gs-dahinter"]'), null);
  assert.ok(g.kapitel[STATION - 1]?.mini);
});

/* --------------------------------------------------------------- Zeichnung -- */

test('matrix: je Zettel das Matrixfeld als Bild (Beschreibung in Worten, ohne Zahl), zwei Knöpfe, Rückmeldung „Stimmt.“ oder „Nicht ganz.“ mit der Erklärung – ohne Punkte', () => {
  const { g, stand, seite } = mit(matrixMini());
  let s = stand();
  const el0 = seite(s);
  assert.equal(el0.dataset['art'], 'matrix');
  assert.equal(el0.querySelectorAll('.gs-mini-posten').length, 3);
  assert.equal(el0.querySelectorAll('svg.wb-matrix').length, 3);
  const beschreibung = text(el0.querySelector('[data-pruef="matrix-feld-1"] .nur-sr') as Element);
  assert.match(beschreibung, /Wahrscheinlichkeit gering, Auswirkung mittel/u);
  assert.doesNotMatch(beschreibung, /\d/u, 'das Feld steht in Worten, nie als Zahl');
  assert.equal(el0.querySelectorAll('.gs-mini-rueck').length, 0);
  assert.deepEqual([...el0.querySelectorAll('[data-pruef="posten-1"] button')].map(text), ['Stimmt', 'Nachbessern lassen']);
  // Zettel 1: „Stimmt“ (richtig), Zettel 2: „Stimmt“ (falsch: hier hätte die Projektsteuerin nachgefordert)
  s = zug(g, s, 0, 0);
  s = zug(g, s, 1, 0);
  const el = seite(s);
  assert.equal(text(el.querySelector('[data-pruef="rueck-1"] b') as Element), 'Stimmt.');
  assert.equal(text(el.querySelector('[data-pruef="rueck-2"] b') as Element), 'Nicht ganz.');
  assert.match(text(el.querySelector('[data-pruef="rueck-1"]') as Element), /Erklärung 1\./u);
  assert.equal((el.querySelector('[data-pruef="posten-1"]') as HTMLElement).dataset['lage'], 'richtig');
  assert.equal((el.querySelector('[data-pruef="posten-2"]') as HTMLElement).dataset['lage'], 'falsch');
  assert.equal(el.querySelector('[data-pruef="rueck-3"]'), null);
  // keine Punkte, kein „n von m“, kein „Richtig“, keine Ampel – und keine Stand-Zeile mit Zählwörtern
  assert.doesNotMatch(text(el), /\bRichtig\b|\d+ von \d+|Punkte|richtig\./u);
  assert.equal(text(el.querySelector('[data-pruef="mini-stand"]') as Element), '');
  // kein Schlusssatz (matrix hat keinen)
  s = zug(g, s, 2, 0);
  assert.equal(seite(s).querySelector('[data-pruef="mini-schluss"]'), null);
  // die Wahl lässt sich ändern: Zettel 2 auf „Nachfordern“ wird richtig
  s = zug(g, s, 1, 1);
  assert.equal((seite(s).querySelector('[data-pruef="posten-2"]') as HTMLElement).dataset['lage'], 'richtig');
  assert.equal(text(seite(s).querySelector('[data-pruef="rueck-2"] b') as Element), 'Stimmt.');
});

test('mappe: Haftzettel je Abschnitt, Rückmeldung je Abschnitt, der Schlusssatz erst nach dem letzten – und immer derselbe, ob die Wahl stimmt oder nicht', () => {
  const { g, stand, seite } = mit(mappeMini());
  let s = stand();
  assert.equal(seite(s).querySelectorAll('.gs-mini-haftzettel').length, 4);
  assert.deepEqual([...seite(s).querySelectorAll('[data-pruef="posten-1"] button')].map(text), ['So annehmen', 'Nachbessern lassen']);
  for (let i = 0; i < 3; i += 1) {
    s = zug(g, s, i, 0);
    assert.equal(seite(s).querySelector('[data-pruef="mini-schluss"]'), null, `nach ${i + 1} von 4`);
  }
  const richtig = zug(g, s, 3, 1);
  const falsch = zug(g, s, 3, 0);
  for (const fertig of [richtig, falsch]) {
    assert.equal(text(seite(fertig).querySelector('[data-pruef="mini-schluss"]') as Element), 'Zwei Abschnitte wurden nachgefordert.');
  }
  assert.equal(text(seite(richtig).querySelector('[data-pruef="mini-schluss"]') as Element), text(seite(falsch).querySelector('[data-pruef="mini-schluss"]') as Element));
  // beide Wahlen jedes Postens sind Knöpfe mit aria-pressed (Tastatur: Tab und Leertaste/Enter)
  const knoepfe = [...seite(richtig).querySelectorAll<HTMLButtonElement>('[data-pruef="posten-4"] button')];
  assert.deepEqual(knoepfe.map((b) => b.type), ['button', 'button']);
  assert.deepEqual(knoepfe.map((b) => b.getAttribute('aria-pressed')), ['false', 'true']);
});

test('legende: eine eigene Zeile unter dem Auftrag, nur wo der Inhalt sie angibt (Prüfrunde 3, Gegenprobe ohne)', () => {
  const ohne = mit(matrixMini()).seite(mit(matrixMini()).stand());
  assert.equal(ohne.querySelector('.gs-mini-begriffe'), null);
  assert.equal(ohne.querySelector('.gs-mini-wand-kopf'), null, 'ohne Pinnwand keine Wand-Überschrift');
  const m = { ...matrixMini(), legendeHtml: '<b>vorrangig:</b> zuerst' };
  const k = mit(m);
  const el = k.seite(k.stand());
  const zeile = el.querySelector('.gs-mini-auftrag .gs-mini-begriffe') as Element;
  assert.equal(text(zeile), 'vorrangig: zuerst');
  assert.ok(zeile.querySelector('b'), 'Auszeichnung bleibt');
});

test('pinnwand: die Zettel der Wand, je Karte der Faden von Zettel zu Zettel; nach der Wahl zeigt der Faden die Lösung – als Wort und als Linienart', () => {
  const { g, stand, seite } = mit(pinnwandMini());
  let s = stand();
  const el = seite(s);
  assert.deepEqual([...el.querySelectorAll('[data-pruef="zettel-wand"] li')].map(text), ['Risiko A', 'Prüfung B', 'Prognose C', 'Änderung D']);
  assert.equal(text(el.querySelector('.gs-mini-wand-kopf') as Element), 'Das hängt an der Pinnwand:', 'die Wand trägt eine sichtbare Überschrift (Prüfrunde 3)');
  assert.equal(text(seite(stand(undefined)).querySelector('.gs-mini-wand-kopf') as Element), 'Das hängt an der Pinnwand:');
  assert.equal((el.querySelector('[data-pruef="faden-1"]') as HTMLElement).dataset['faden'], 'offen', 'vor der Wahl neutral');
  assert.match(text(el.querySelector('[data-pruef="faden-1"]') as Element), /Risiko A.*Prüfung B/u);
  assert.match(text(el.querySelector('[data-pruef="faden-3"]') as Element), /Änderung D.*noch keine Verbindung/u, 'loses Ende in Worten');
  assert.deepEqual([...el.querySelectorAll('[data-pruef="posten-1"] button')].map(text), ['Stimmt', 'Zählt doppelt', 'Es fehlt eine Verbindung']);
  s = zug(g, s, 0, 2);
  s = zug(g, s, 1, 1);
  s = zug(g, s, 2, 2);
  const nach = seite(s);
  // der Faden zeigt die Lösung, nicht die Wahl: Faden 1 ist „stimmt“, Faden 2 „doppelt“, Faden 3 „nachfordern“
  assert.deepEqual(['faden-1', 'faden-2', 'faden-3'].map((p) => (nach.querySelector(`[data-pruef="${p}"]`) as HTMLElement).dataset['faden']), ['stimmt', 'doppelt', 'nachfordern']);
  assert.match(text(nach.querySelector('[data-pruef="faden-2"] .gs-faden-wort') as Element), /Hier würde doppelt gezählt\./u);
  assert.match(text(nach.querySelector('[data-pruef="faden-1"] .gs-faden-wort') as Element), /Die Verbindung stimmt\./u);
  assert.equal(text(nach.querySelector('[data-pruef="mini-schluss"]') as Element), 'Eine Verbindung hätte doppelt gezählt.');
  // Zettel und Fäden stehen auch für Screenreader als Text (die Linie selbst ist stumm)
  assert.equal(nach.querySelector('.gs-faden-linie')?.getAttribute('aria-hidden'), 'true');
});

test('bericht: Zeilen mit dem Knopf „nachfordern“, eine Prüfung, danach je Zeile ein Satz und der Schlusssatz; die Auswahl ist danach gesperrt', () => {
  const { g, stand, seite } = mit(berichtMini());
  let s = stand();
  const el0 = seite(s);
  assert.equal(el0.querySelectorAll('.gs-mini-posten').length, 6);
  assert.equal(el0.querySelectorAll('[data-pruef^="wahl-"]').length, 6, 'je Zeile ein Knopf');
  assert.equal(text(el0.querySelector('[data-pruef="mini-pruefen"]') as Element), 'Prüfen');
  // zwei Zeilen setzen, sofort keine Rückmeldung
  s = zug(g, s, 1);
  s = zug(g, s, 3);
  const el1 = seite(s);
  assert.equal(el1.querySelectorAll('.gs-mini-rueck').length, 0, 'erst die Prüfung meldet');
  assert.equal(el1.querySelector('[data-pruef="wahl-2-nachfordern"]')?.getAttribute('aria-pressed'), 'true');
  assert.equal(el1.querySelector('[data-pruef="wahl-1-nachfordern"]')?.getAttribute('aria-pressed'), 'false');
  // Prüfen: je Zeile ein Satz (richtig: 2, 4; falsch: 5 fehlt), der Schlusssatz
  s = zug(g, s, 6);
  const el2 = seite(s);
  assert.equal(el2.querySelectorAll('.gs-mini-rueck').length, 6);
  assert.equal(text(el2.querySelector('[data-pruef="rueck-2"] b') as Element), 'Stimmt.');
  assert.equal(text(el2.querySelector('[data-pruef="rueck-5"] b') as Element), 'Nicht ganz.');
  assert.equal(text(el2.querySelector('[data-pruef="mini-schluss"]') as Element), 'Drei Zeilen wurden nachgefordert.');
  assert.equal(el2.querySelector('[data-pruef="mini-pruefen"]'), null, 'die Prüfung ist erledigt');
  assert.ok([...el2.querySelectorAll<HTMLButtonElement>('[data-pruef^="wahl-"]')].every((b) => b.disabled), 'gesperrt');
  assert.match(text(el2.querySelector('[data-pruef="posten-1"]') as Element), /in Ordnung/u);
  // ein Zug nach der Prüfung ändert nichts
  assert.equal(zug(g, s, 0), s);
});

test('rueckfragen: vier Gespräche als Knöpfe, zwei dürfen gewählt werden; das Gespräch erscheint nach der Wahl, kein „Stimmt“, kein „Nicht ganz“; die übrigen sind gesperrt', () => {
  const { g, stand, seite } = mit(rueckfragenMini());
  let s = stand();
  const el0 = seite(s);
  assert.equal(el0.querySelectorAll('.gs-gespraech').length, 0, 'ohne Wahl kein Gespräch');
  assert.equal(text(el0.querySelector('[data-pruef="mini-stand"]') as Element), 'Zwei Gespräche sind möglich.');
  assert.deepEqual([...el0.querySelectorAll('[data-pruef^="wahl-"]')].map(text), ['Gespräch 1', 'Gespräch 2', 'Gespräch 3', 'Gespräch 4']);
  s = zug(g, s, 2);
  const el1 = seite(s);
  assert.equal(text(el1.querySelector('[data-pruef="mini-stand"]') as Element), 'Ein Gespräch ist noch möglich.');
  assert.match(text(el1.querySelector('[data-pruef="gespraech-3"]') as Element), /Lot: Frage 3Partner 3: Antwort 3Die Vertretung hält Punkt 3 fest\./u);
  assert.equal(el1.querySelector('[data-pruef="mini-schluss"]'), null);
  s = zug(g, s, 0);
  const el2 = seite(s);
  assert.equal(el2.querySelectorAll('.gs-gespraech').length, 2);
  assert.equal(text(el2.querySelector('[data-pruef="mini-stand"]') as Element), 'Mehr Gespräche gibt es nicht.');
  assert.equal(text(el2.querySelector('[data-pruef="mini-schluss"]') as Element), 'Die übrigen fragt die Vertretung nach.');
  // die übrigen zwei sind gesperrt (Knöpfe ausgeschaltet), die gewählten gedrückt
  assert.deepEqual([...el2.querySelectorAll<HTMLButtonElement>('[data-pruef^="wahl-"]')].map((b) => [b.disabled, b.getAttribute('aria-pressed')]), [[false, 'true'], [true, 'false'], [false, 'true'], [true, 'false']]);
  assert.deepEqual([...el2.querySelectorAll<HTMLElement>('.gs-mini-posten')].map((p) => p.dataset['gesperrt']), ['false', 'true', 'false', 'true']);
  // kein Richtig oder Falsch
  assert.doesNotMatch(text(el2), /Stimmt\.|Nicht ganz\.|\bRichtig\b|Punkte|\d+ von \d+/u);
  assert.equal(el2.querySelectorAll('.gs-mini-rueck').length, 0);
  // Wiederöffnen: genau diese Gespräche stehen, über den gespeicherten Stand
  const geladen = E.leseStand(g, JSON.parse(JSON.stringify(s)));
  assert.deepEqual(geladen?.mini[KAP], [2, 0]);
  assert.equal(seite(geladen as Stand).querySelectorAll('.gs-gespraech').length, 2);
  // ein weiterer Zug ändert nichts
  assert.equal(zug(g, s, 1), s);
  // Regie-Auflösung: alle vier Gespräche mit ihren Zeilen
  const aufgeloest = loeseMini(g, E.neuerStand(), KAP);
  const el3 = seite({ ...stand(), mini: aufgeloest.mini });
  assert.equal(el3.querySelectorAll('.gs-gespraech').length, 4);
  assert.ok([...el3.querySelectorAll<HTMLButtonElement>('[data-pruef^="wahl-"]')].every((b) => b.getAttribute('aria-pressed') === 'true'));
});

/* ----------------------------------------------- Bedienung, Fokus, Tastatur -- */

function speicher(): { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void } {
  const daten = new Map<string, string>();
  return { getItem: (k) => daten.get(k) ?? null, setItem: (k, v) => { daten.set(k, v); }, removeItem: (k) => { daten.delete(k); } };
}
const aktiv = (): string => (document.activeElement === document.body ? 'BODY' : (document.activeElement as HTMLElement | null)?.dataset['pruef'] ?? document.activeElement?.tagName ?? '');

test('Fläche: jede neue Art ist mit der Tastatur bedienbar (Knöpfe), der Fokus bleibt nach jedem Zug auf demselben Knopf, nie auf <body>; „Noch einmal“ setzt zurück', () => {
  for (const [name, m, ersterKnopf, zweiterKnopf] of [
    ['matrix', matrixMini(), 'wahl-1-stimmt', 'wahl-2-nachfordern'], ['mappe', mappeMini(), 'wahl-1-annehmen', 'wahl-2-nachfordern'],
    ['pinnwand', pinnwandMini(), 'wahl-1-stimmt', 'wahl-2-doppelt'], ['bericht', berichtMini(), 'wahl-2-nachfordern', 'mini-pruefen'], ['rueckfragen', rueckfragenMini(), 'wahl-3', 'wahl-1'],
  ] as const) {
    const g = mitMini(BASIS, STATION, m);
    const start: Stand = { ...E.neuerStand(), wahlen: { s1: 0, [KAP]: 0 }, schritt: { ort: 'kapitel', kapitel: KAP, teil: 'mini' } };
    const sp = speicher();
    sp.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(start));
    const flaeche = erzeugeGeschichte({ g, speicher: sp, themaTitel: () => null });
    document.body.replaceChildren(flaeche.element);
    const k1 = flaeche.element.querySelector<HTMLButtonElement>(`[data-pruef="${ersterKnopf}"]`);
    assert.ok(k1, `${name}: ${ersterKnopf}`);
    assert.equal(k1.tagName, 'BUTTON');
    k1.focus();
    k1.click();
    assert.equal(aktiv(), ersterKnopf, `${name}: Fokus bleibt auf dem Knopf`);
    assert.equal(flaeche.element.querySelector(`[data-pruef="${ersterKnopf}"]`)?.getAttribute('aria-pressed'), 'true', `${name}: der Knopf ist gedrückt`);
    const k2 = flaeche.element.querySelector<HTMLButtonElement>(`[data-pruef="${zweiterKnopf}"]`);
    assert.ok(k2, `${name}: ${zweiterKnopf}`);
    k2.focus();
    k2.click();
    assert.notEqual(aktiv(), 'BODY', name);
    if (name === 'bericht') assert.equal(aktiv(), 'mini-schluss', 'nach der Prüfung geht der Fokus zum Schlusssatz');
    // „Noch einmal“ setzt die Aufgabe zurück
    const nochmal = flaeche.element.querySelector<HTMLButtonElement>('[data-pruef="mini-nochmal"]');
    assert.ok(nochmal, `${name}: Noch einmal`);
    nochmal.click();
    assert.equal(flaeche.stand().mini[KAP], undefined, name);
    assert.notEqual(aktiv(), 'BODY', name);
  }
});

test('Ansage (M2, L-390): nach einem Zug in Matrix, Mappe, Pinnwand und Rückfragen steht die Rückmeldung in der Live-Region; Gegenproben', () => {
  const live = (el: Element) => text(el.querySelector('[data-pruef="gs-ansage"]') as Element);
  for (const [name, m, knopf, erwartet] of [
    ['matrix', matrixMini(), 'wahl-1-stimmt', /^Stimmt\. /u], ['matrix falsch', matrixMini(), 'wahl-2-stimmt', /^Nicht ganz\. /u],
    ['mappe', mappeMini(), 'wahl-1-annehmen', /^Stimmt\. /u], ['pinnwand', pinnwandMini(), 'wahl-1-stimmt', /^Stimmt\. /u],
    ['rueckfragen', rueckfragenMini(), 'wahl-3', /\S+: \S/u],
  ] as const) {
    const g = mitMini(BASIS, STATION, m);
    const start: Stand = { ...E.neuerStand(), wahlen: { s1: 0, [KAP]: 0 }, schritt: { ort: 'kapitel', kapitel: KAP, teil: 'mini' } };
    const sp = speicher();
    sp.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(start));
    const flaeche = erzeugeGeschichte({ g, speicher: sp, themaTitel: () => null });
    document.body.replaceChildren(flaeche.element);
    assert.equal(live(flaeche.element), '', `${name}: vor dem Zug nichts angesagt`);
    const region = flaeche.element.querySelector('[data-pruef="gs-ansage"]') as HTMLElement;
    assert.equal(region.getAttribute('aria-live'), 'polite', name);
    flaeche.element.querySelector<HTMLButtonElement>(`[data-pruef="${knopf}"]`)?.click();
    assert.match(live(flaeche.element), erwartet, `${name}: Ansage nach dem Zug`);
    assert.doesNotMatch(live(flaeche.element), /\bRichtig\b|\d+ von \d+|Punkte/u, `${name}: keine Zählwörter`);
    // dieselbe Ansage steht nicht doppelt im Stand: die Ansage ist außerhalb der neu gezeichneten Fläche
    assert.ok(region.isConnected && !flaeche.element.querySelector('[data-pruef="gs-buehne"], .gs-buehne')?.contains(region), `${name}: Region bleibt bestehen`);
  }
  // Gegenprobe: Schritt wechseln leert die Ansage; der Bericht sagt vor der Prüfung nichts an
  const g = mitMini(BASIS, STATION, berichtMini());
  const start: Stand = { ...E.neuerStand(), wahlen: { s1: 0, [KAP]: 0 }, schritt: { ort: 'kapitel', kapitel: KAP, teil: 'mini' } };
  const sp = speicher();
  sp.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(start));
  const f = erzeugeGeschichte({ g, speicher: sp, themaTitel: () => null });
  document.body.replaceChildren(f.element);
  f.element.querySelector<HTMLButtonElement>('[data-pruef="wahl-2-nachfordern"]')?.click();
  assert.equal(live(f.element), '', 'Bericht: vor der Prüfung keine Ansage');
  // reine Funktion: nur die vier Arten, nur bei Änderung
  const alt = start;
  assert.equal(miniAnsage(g, alt, alt, KAP), null, 'nichts geändert');
  assert.equal(miniAnsage(g, alt, { ...alt, mini: { [KAP]: [0, 1] } }, KAP), null, 'Bericht: keine Ansage');
  const gm = mitMini(BASIS, STATION, matrixMini());
  assert.match(miniAnsage(gm, alt, { ...alt, mini: { [KAP]: [0] } }, KAP) ?? '', /^(Stimmt|Nicht ganz)\./u);
  assert.equal(miniAnsage(gm, alt, alt, 'gibt-es-nicht'), null);
  // Rückfragen: ein zurückgenommenes Gespräch (Regie) sagt nichts an; ein neues sagt Gespräch und Erklärung an
  const gr = mitMini(BASIS, STATION, rueckfragenMini());
  assert.equal(miniAnsage(gr, { ...alt, mini: { [KAP]: [0, 2] } }, { ...alt, mini: { [KAP]: [0] } }, KAP), null, 'Rückfragen: zurückgenommen');
  const neuesGespraech = miniAnsage(gr, { ...alt, mini: { [KAP]: [0] } }, { ...alt, mini: { [KAP]: [0, 2] } }, KAP) ?? '';
  assert.match(neuesGespraech, /Lot: Frage 3 Partner 3: Antwort 3 Die Vertretung hält Punkt 3 fest\./u);
  assert.match(neuesGespraech, /übrigen fragt die Vertretung nach\.$/u, 'Rückfragen: mit dem zweiten Gespräch ist das Kontingent erschöpft, der Schlusssatz folgt');
  assert.doesNotMatch(miniAnsage(gr, alt, { ...alt, mini: { [KAP]: [2] } }, KAP) ?? '', /übrigen fragt/u, 'Rückfragen: nach dem ersten Gespräch noch kein Schlusssatz');
  // Matrix: eine Karte, deren Wahl zurückgesetzt wurde, hat keine Wertung und sagt nichts an
  assert.equal(miniAnsage(gm, { ...alt, mini: { [KAP]: [0, 0, 0] } }, { ...alt, mini: { [KAP]: [-1, 0, 0] } }, KAP), null, 'Matrix: Karte ohne Wahl');
  // Bericht: auch die Prüfung sagt nichts an (der Fokus geht zum Schlusssatz)
  assert.equal(miniAnsage(g, { ...alt, mini: { [KAP]: [0, 0, 0, 0, 0, 0] } }, { ...alt, mini: { [KAP]: [0, 0, 0, 0, 0, 0, 1] } }, KAP), null, 'Bericht: Prüfung');
  // Schlusssatz: erst mit der letzten Karte (Mappe: vier Abschnitte)
  const gmp = mitMini(BASIS, STATION, mappeMini());
  const loesung = MINI_ARTEN.mappe.loese(mappeMini());
  const fast = loesung.map((x, i) => (i === 3 ? -1 : x));
  const fertig = miniAnsage(gmp, { ...alt, mini: { [KAP]: fast } }, { ...alt, mini: { [KAP]: loesung } }, KAP) ?? '';
  assert.match(fertig, /^Stimmt\. Erklärung 4\. Zwei Abschnitte wurden nachgefordert\.$/u);
  const nochNicht = miniAnsage(gmp, { ...alt, mini: { [KAP]: [-1, -1, -1, -1] } }, { ...alt, mini: { [KAP]: [loesung[0] as number, -1, -1, -1] } }, KAP) ?? '';
  assert.doesNotMatch(nochNicht, /nachgefordert/u, 'Mappe: vor dem Abschluss kein Schlusssatz');
});

test('Leinwand: jede neue Art ohne Bedienelemente, ohne Wertung der Antworten der Runde; der Zustand ist derselbe wie auf der Seite', () => {
  for (const [name, m, liste] of [['matrix', matrixMini(), [0, 0, 0]], ['mappe', mappeMini(), [0, 1, 0, 0]], ['pinnwand', pinnwandMini(), [0, 1, 2]], ['bericht', berichtMini(), [0, 1, 0, 1, 1, 0, 1]], ['rueckfragen', rueckfragenMini(), [1, 3]]] as const) {
    const { g, stand } = mit(m);
    const el = baueSchritt({ g, stand: stand([...liste]), bedienbar: false, themaTitel: () => null, tue: () => undefined });
    assert.equal(el.querySelectorAll('button').length, 0, `${name}: Leinwand ohne Knöpfe`);
    // der Zustand steht trotzdem da – aber nicht als `aria-pressed` auf einem `span` (kein erlaubtes ARIA, L-390)
    assert.ok(el.querySelectorAll('[data-gedrueckt="true"]').length > 0, `${name}: der Zustand steht trotzdem da`);
    assert.equal(el.querySelectorAll('span[aria-pressed], div[aria-pressed]').length, 0, `${name}: kein aria-pressed auf Nicht-Knöpfen`);
    assert.doesNotMatch(text(el), /Wertung|\bFalle\b|vertretbar|Punkte|\d+ von \d+/u, name);
  }
});

/* -------------------------------------------------------------------- Regie -- */

test('Regie: Auflösen löst jede neue Art vollständig, die Leinwand rollt zum geänderten Posten; die Regie-Zeile je Art kennt alle Posten', () => {
  for (const [art, m] of [['matrix', matrixMini()], ['mappe', mappeMini()], ['pinnwand', pinnwandMini()], ['bericht', berichtMini()], ['rueckfragen', rueckfragenMini()]] as const) {
    const g = mitMini(BASIS, STATION, m);
    const geloest = loeseMini(g, E.neuerStand(), KAP);
    const liste = geloest.mini[KAP] ?? [];
    assert.ok(MINI_ARTEN[art].gueltig(m, liste), art);
    assert.equal(E.werteMiniAus(m, liste).fertig, true, art);
    assert.equal(geaenderterPosten(art, [], liste) !== null, true, art);
    assert.equal(geaenderterPosten(art, liste, liste), null, art);
    assert.ok(MINI_BAUSTEINE[art].regie, art);
  }
  // Regie-Zeile: Körper je Art aus dem Baustein, Knöpfe tragen data-pruef
  const gesendet: { art: string; zustand?: { story: Stand } }[] = [];
  const kanal = { senden: (n: never) => { gesendet.push(n); }, abonnieren: () => () => undefined, schliessen: () => undefined };
  for (const [art, m, knopf] of [['matrix', matrixMini(), 'regie-mini-1-stimmt'], ['bericht', berichtMini(), 'regie-mini-2-nachfordern'], ['rueckfragen', rueckfragenMini(), 'regie-mini-1']] as const) {
    const g = mitMini(BASIS, STATION, m);
    const r = erzeugeRegie({ inhalte: { ...inhalte, geschichte: g }, kanal, version: 'Test', speicher: speicher(), regieGeschichte, regieKapitel, regieWerkzeug, oeffneLeinwand: () => undefined, takt: 100000 });
    try {
      document.body.replaceChildren(r.element);
      const sprung = r.element.querySelector<HTMLSelectElement>('[data-pruef="regie-sprung"]') as HTMLSelectElement;
      sprung.value = `${KAP}:mini`;
      sprung.dispatchEvent(new Event('change'));
      const k = r.element.querySelector<HTMLButtonElement>(`[data-pruef="${knopf}"]`);
      assert.ok(k, `${art}: ${knopf}`);
      k.click();
      const z = gesendet.filter((n) => n.art === 'zustand').at(-1)?.zustand;
      assert.ok((z?.story.mini[KAP]?.length ?? 0) > 0, art);
      (r.element.querySelector('[data-pruef="regie-mini-aufloesen"]') as HTMLElement).click();
      const z2 = gesendet.filter((n) => n.art === 'zustand').at(-1)?.zustand;
      assert.deepEqual(z2?.story.mini[KAP], MINI_ARTEN[art].loese(m), art);
      if (art === 'rueckfragen') assert.equal(r.element.querySelectorAll('[data-pruef^="regie-gespraech-"]').length, 4, 'die Regie sieht alle vier Gespräche');
    } finally {
      r.entferne();
    }
  }
});

test('Leinwand der Regie: eine aufgelöste Art erscheint ohne Bedienung und ohne Regie-Zeilen', () => {
  const g = mitMini(BASIS, STATION, rueckfragenMini());
  const anzeige = erzeugeAnzeige({ ...inhalte, geschichte: g }, 'Test', false);
  const aufgeloest = loeseMini(g, { ...E.neuerStand(), schritt: { ort: 'kapitel', kapitel: KAP, teil: 'mini' } }, KAP);
  anzeige.setze({ ...neueBuehne(), bereich: 'story', story: aufgeloest });
  assert.equal(anzeige.element.querySelectorAll('.gs-gespraech').length, 4);
  assert.equal(anzeige.element.querySelectorAll('button').length, 0);
  assert.doesNotMatch(text(anzeige.element), /regie|Leitfrage|Wertung/iu);
});

/* ---------------------------------------------------------------- Lesezeit -- */

test('Lesezeit: die Gespräche der Rückfragen zählen nicht (gewählt oder nicht, dieselbe Wortzahl); Etiketten und Aufgabe zählen', () => {
  const { stand, seite } = mit(rueckfragenMini());
  const leer = lib.zaehleWoerter(seite(stand()));
  assert.ok(leer >= 4 * 2, 'die vier Etiketten zählen (je „Gespräch n“)');
  // dieselbe Wahl, aber Gespräche von sehr verschiedener Länge: die Wortzahl bleibt gleich (die Zeilen und Erklärungen zählen nicht)
  const lang = rueckfragenMini();
  for (const p of lang.posten) { p.gespraech = [{ wer: 'Lot', html: Array.from({ length: 80 }, () => 'sehr').join(' ') }]; p.erklaerungHtml = Array.from({ length: 40 }, () => 'viel').join(' '); }
  const gl2 = mit(lang);
  assert.equal(lib.zaehleWoerter(gl2.seite(gl2.stand([0, 1]))), lib.zaehleWoerter(seite(stand([0, 1]))), 'Länge der Gespräche ohne Einfluss');
  assert.equal(lib.zaehleWoerter(gl2.seite(gl2.stand([0, 1, 2, 3]))), lib.zaehleWoerter(seite(stand([0, 1, 2, 3]))));
  // Gegenprobe: ohne die Ausnahme würden die Zeilen zählen – das Element ist `.gs-gespraech` und kommt im DOM vor
  assert.ok(gl2.seite(gl2.stand([0, 1])).querySelectorAll('.gs-gespraech').length === 2);
  // Gegenprobe: bei der Matrix zählt die Rückmeldung nach der Wahl mit (sie steht im Schritt)
  const m = mit(matrixMini());
  assert.ok(lib.zaehleWoerter(m.seite(m.stand([0, 0, 0]))) > lib.zaehleWoerter(m.seite(m.stand())));
});

/* ------------------------------------------------ Spielarten von zuordnen -- */

test('Muss-Filter und „Beschluss oder nicht?“ laufen als zuordnen: eigene Wahlen, Zählwörter wie bisher, kein Schlusssatz', () => {
  const postenMuss = [['Mindestens zwei Wege', 'muss'], ['Gute Lage', 'punkt'], ['Zulässig', 'muss']] as const;
  for (const [titel, wahlen, posten] of [
    ['Muss oder nicht?', [['muss', 'Muss'], ['punkt', 'Punkt']], postenMuss],
    ['Beschluss oder nicht?', [['beschluss', 'Beschluss'], ['vermerk', 'Vermerk']], [['Die Bürgermeisterin gibt frei', 'beschluss'], ['Die Projektsteuerin empfiehlt', 'vermerk'], ['Es wurde nichts entschieden', 'vermerk']]],
  ] as const) {
    const m = {
      art: 'zuordnen' as const, titel, aufgabeHtml: 'Aufgabe', bild: 'mappe',
      wahlen: wahlen.map(([id, t]) => ({ id, titel: t, figur: null, falschHtml: null, heisstHtml: null, bild: null })),
      posten: posten.map(([t, l]) => ({ html: t, loesung: l, erklaerungHtml: `Weil ${t}.`, bild: null })),
    };
    const { g, stand, seite } = mit(m);
    let s = stand();
    s = zug(g, s, 0, 0);
    s = zug(g, s, 1, 0);
    const el = seite(s);
    assert.equal(el.dataset['art'], 'zuordnen');
    // Zählwörter der Zuordnung: „Richtig“ / „Nicht ganz – richtig ist: …“ und „n von m richtig.“
    assert.match(text(el.querySelector('[data-pruef="rueck-1"] b') as Element), /^(Richtig|Nicht ganz – richtig ist: )/u);
    assert.match(text(el.querySelector('[data-pruef="mini-stand"]') as Element), /^\d von 2 richtig\. Noch 1 offen\.$/u);
    assert.equal(el.querySelector('[data-pruef="mini-schluss"]'), null);
    s = zug(g, s, 2, 1);
    assert.match(text(seite(s).querySelector('[data-pruef="mini-stand"]') as Element), /^\d von 3 richtig\.$/u);
  }
});

/* --------------------------------------- Kurzfassung je Absatz, Vertiefung -- */

const an = (kap: string, teil: 'szene' | 'frage', basis: Stand): Stand => ({ ...basis, schritt: { ort: 'kapitel', kapitel: kap, teil } });
const seite = (g: typeof BASIS, s: Stand, bedienbar = true): HTMLElement => baueSchritt({ g, stand: s, bedienbar, themaTitel: () => null, tue: () => undefined });
const gespielt = (g: typeof BASIS, kurz: boolean): Stand => {
  let s = E.neuerStand(kurz);
  for (const k of E.wegKapitel(g, kurz)) s = E.waehle(g, s, k.id, E.gutePlatz(k));
  return s;
};

test('Kurzfassung: Folge, „So macht man es gut“ und „Das steckt dahinter“ nehmen die gekürzten Texte, der ganze Weg die langen; ohne Kürzung überall derselbe Text', () => {
  const lang = seite(BASIS, an('s3', 'frage', gespielt(BASIS, false)));
  const kurz = seite(BASIS, an('s3', 'frage', gespielt(BASIS, true)));
  assert.match(text(lang.querySelector('[data-pruef="gs-folge"]') as Element), /Folge Zwei nur lang für gut/u);
  assert.doesNotMatch(text(kurz.querySelector('[data-pruef="gs-folge"]') as Element), /nur lang/u);
  assert.match(text(kurz.querySelector('[data-pruef="gs-folge"]') as Element), /Folge Eins gut\./u);
  assert.match(text(lang.querySelector('[data-pruef="gs-gut"]') as Element), /Regel zwei nur lang/u);
  assert.doesNotMatch(text(kurz.querySelector('[data-pruef="gs-gut"]') as Element), /Regel zwei/u);
  assert.match(text(lang.querySelector('[data-pruef="gs-dahinter"]') as Element), /Satz zwei nur lang/u);
  assert.doesNotMatch(text(kurz.querySelector('[data-pruef="gs-dahinter"]') as Element), /Satz zwei/u);
  assert.match(text(kurz.querySelector('[data-pruef="gs-dahinter"]') as Element), /Satz eins\./u, 'der erste Satz bleibt');
  // Hilfsfunktionen: Rückfall auf den langen Text
  const k = E.kapitel(BASIS, 's3');
  assert.ok(k);
  const a = k.antworten[0];
  assert.ok(a);
  assert.equal(E.folgeHtmlFuer(E.neuerStand(false), a), a.folgeHtml);
  assert.equal(E.folgeHtmlFuer(E.neuerStand(true), a), a.folgeKurzHtml);
  const k1 = E.kapitel(BASIS, 's2');
  assert.ok(k1);
  assert.equal(E.gutHtmlFuer(E.neuerStand(true), k1), k1.gutHtml, 'ohne gutKurzHtml gilt der lange Text');
  assert.equal(E.dahinterHtmlFuer(E.neuerStand(true), k1), k1.dahinterHtml);
  assert.equal(E.folgeHtmlFuer(E.neuerStand(true), k1.antworten[0] as never), k1.antworten[0]?.folgeHtml);
});

test('Vertiefung: zugeklappt am Ende der Station, nur ganzer Weg, nur bedienbar; Kicker mit der Form, Titel als Frage, „Antwort“ als zweiter Aufklapper', () => {
  // Station 2 hat die Mini-Aufgabe nach der Folge: dort, am Ende der Station, steht die Vertiefung
  const s2 = { ...E.waehle(BASIS, E.neuerStand(), 's2', 0), schritt: { ort: 'kapitel', kapitel: 's2', teil: 'mini' } as const };
  const el = seite(BASIS, s2);
  const v = el.querySelector<HTMLDetailsElement>('[data-pruef="gs-vertiefung-s2"]');
  assert.ok(v);
  assert.equal(v.open, false);
  assert.equal(text(v.querySelector('.gs-vertiefung-form') as Element), 'Zum Nachdenken');
  assert.equal(text(v.querySelector('.gs-vertiefung-titel') as Element), 'Wann wird aus einem Hinweis ein Risiko?');
  const antwort = v.querySelector<HTMLDetailsElement>('[data-pruef="gs-vertiefung-antwort"]');
  assert.ok(antwort);
  assert.equal(antwort.open, false);
  assert.equal(text(antwort.querySelector('summary') as Element), 'Antwort');
  assert.match(text(antwort), /Die Antwort der Vertiefung\./u);
  assert.doesNotMatch(text(v.querySelector('summary') as Element), /aufklappen|Klicken/iu, 'kein Bedienhinweis');
  // „Ein zweiter Fall“ und „Warum so?“ (ohne Antwort-Aufklapper)
  const s5 = seite(BASIS, an('s5', 'frage', E.waehle(BASIS, E.neuerStand(), 's5', 1)));
  assert.equal(text(s5.querySelector('[data-pruef="gs-vertiefung-s5"] .gs-vertiefung-form') as Element), 'Ein zweiter Fall');
  const s7 = seite(BASIS, an('s7', 'frage', E.waehle(BASIS, E.neuerStand(), 's7', 1)));
  assert.equal(text(s7.querySelector('[data-pruef="gs-vertiefung-s7"] .gs-vertiefung-form') as Element), 'Warum so?');
  assert.equal(s7.querySelector('[data-pruef="gs-vertiefung-antwort"]'), null);
  assert.equal(s7.querySelectorAll('[data-pruef="gs-vertiefung-s7"] .gs-vertiefung-text > p').length, 2);
  // nicht in der Kurzfassung, nicht auf der Leinwand, nicht ohne Antwort (Folge fehlt), nicht in anderen Stationen
  assert.equal(seite(BASIS, an('s5', 'frage', E.waehle(BASIS, E.neuerStand(true), 's5', 1))).querySelector('[data-pruef="gs-vertiefung-s5"]'), null);
  assert.equal(seite(BASIS, s2, false).querySelector('.gs-vertiefung'), null);
  assert.equal(seite(BASIS, an('s2', 'frage', E.waehle(BASIS, E.neuerStand(), 's2', 0))).querySelector('.gs-vertiefung'), null, 'Station 2: die Mini-Aufgabe folgt noch');
  assert.equal(seite(BASIS, an('s5', 'frage', E.neuerStand())).querySelector('.gs-vertiefung'), null, 'ohne Antwort noch keine Folge');
  assert.equal(seite(BASIS, an('s6', 'frage', E.waehle(BASIS, E.neuerStand(), 's6', 0))).querySelector('.gs-vertiefung'), null);
});

test('Vertiefung im Druck und in der Lesezeit: nicht im Druckbogen; zugeklappt zählt nur die Titelzeile', async () => {
  const { storyDruck } = await import('../src/ui/flaechen/geschichte.ts');
  const s = { ...gespielt(BASIS, false), schritt: { ort: 'ende' } as const };
  const wurzel = document.createElement('div');
  wurzel.append(...storyDruck(BASIS, s, 'Test').teile.map((t) => t.cloneNode(true)));
  assert.equal(wurzel.querySelector('.gs-vertiefung'), null);
  assert.doesNotMatch(text(wurzel), /Die Frage der Vertiefung|Die Antwort der Vertiefung|Wann wird aus einem Hinweis/u);
  const ohne = structuredClone(BASIS);
  for (const k of ohne.kapitel) delete k.vertiefung;
  const st = (g: typeof BASIS) => ({ ...gespielt(g, false), schritt: { ort: 'kapitel', kapitel: 's5', teil: 'frage' } as const });
  const mitV = lib.zaehleWoerter(seite(BASIS, st(BASIS)));
  const ohneV = lib.zaehleWoerter(seite(ohne, st(ohne)));
  // zugeklappt zählt nur die Titelzeile: der Titel („Ein zweiter Wunsch“); die Form steht als Kicker und zählt nicht
  assert.equal(mitV - ohneV, 'Ein zweiter Wunsch'.split(' ').length);
});

test('Sichtbar-Probe: die neuen Wörter der Oberfläche enthalten keine verbotenen Begriffe und keine Bedienanweisungen', () => {
  const alle = [
    W.geschichte.miniStimmt, W.geschichte.miniNichtGanz, W.geschichte.miniPruefen, W.geschichte.miniNachfordern, W.geschichte.miniInOrdnung, W.geschichte.miniZettel,
    ...Object.values(W.geschichte.miniFaden), W.geschichte.miniGespraeche(2), W.geschichte.miniGespraecheRest(1), W.geschichte.miniGespraecheRest(0), W.geschichte.miniGespraecheRest(3),
    W.geschichte.buchTitel, W.geschichte.buchIntro, W.geschichte.buchLeer, W.geschichte.buchDruckTitel, W.geschichte.buchSchliessen,
    ...W.geschichte.buchLegende.flatMap((x) => [x.wort, x.text]), ...Object.values(W.geschichte.buchArt), ...Object.values(W.geschichte.vertiefungForm), W.geschichte.vertiefungAntwort,
    W.geschichte.verlaufPause, W.geschichte.verlaufBilanz, W.geschichte.verlaufText, W.geschichte.verlaufLegende, W.geschichte.verlaufHohl, W.geschichte.verlaufOffen, W.geschichte.gespeichert,
  ];
  for (const t of alle) assert.deepEqual(sichtbarVerboten(t), [], t);
});
