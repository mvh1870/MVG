/*
 * P18.5 (O-59, E-9, E-13): Verknüpfung der vier neuen Werkzeuge – Verweise aus Story und Themen (Felder `werkzeuge`),
 * Regie (Schritte, Beispiele, Pfeiltasten, Notizen nur im Regie-Teil), Leinwand (nur Beispiel und Schritt, keine Bedienelemente,
 * kein Regie-Text) und der Satz im Datenschutz: Die Werkzeuge speichern nichts.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///mvg.html' });
const gl = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLParagraphElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) gl[k] = (dom.window as unknown as Record<string, unknown>)[k];
dom.window.scrollTo = (() => undefined) as typeof dom.window.scrollTo;
dom.window.scrollBy = (() => undefined) as typeof dom.window.scrollBy;
after(() => dom.window.close());

const { inhalte, regieGeschichte, regieKapitel, regieWerkzeug } = await import('../src/inhalte/index.ts');
const { WERKZEUGE, NEUE_WERKZEUGE, TEIL, beispielKennungen } = await import('../src/ui/werkzeug-kennungen.ts');
const { baueSchritt } = await import('../src/ui/flaechen/geschichte.ts');
const { baueTheorie, themaTitel, themen } = await import('../src/ui/flaechen/theorie.ts');
const { erzeugeAnzeige } = await import('../src/regie/leinwand.ts');
const { erzeugeRegie } = await import('../src/regie/regie.ts');
const { neueBuehne, pruefeBuehne } = await import('../src/regie/buehne.ts');
const stand = await import('../src/regie/werkzeug-stand.ts');
const { neuerStand, waehle } = await import('../src/geschichte/engine.ts');
const { leseRoute } = await import('../src/ui/route.ts');
const { WERKZEUG_TEIL, werkzeugKatalog, pruefeWerkzeugVerweise } = (await import(String('../werkzeuge/explore.mjs'))) as {
  WERKZEUG_TEIL: Record<string, string>;
  werkzeugKatalog: (w: unknown) => Record<string, string[]> | null;
  pruefeWerkzeugVerweise: (roh: unknown, ort: string, katalog: Record<string, string[]> | null, fehler: (ort: string, f: string) => void) => { id: string; beispiel: string | null }[];
};
import type { KanalNachricht } from '../src/regie/kanal.ts';

const g = inhalte.geschichte;
assert.ok(g);
const w = inhalte.werkzeuge;
assert.ok(w);

test('Kennungen: die Tabelle des Übersetzers und der Oberfläche stimmen überein', () => {
  assert.deepEqual(WERKZEUG_TEIL, TEIL);
  assert.deepEqual(Object.keys(WERKZEUG_TEIL), [...WERKZEUGE]);
  for (const id of NEUE_WERKZEUGE) assert.ok(beispielKennungen(w, id).length > 0, id);
});

test('Verweisfeld (E-13): Werkzeug und Beispiel müssen existieren, ein Eintrag je Werkzeug', () => {
  const katalog = werkzeugKatalog(w);
  assert.ok(katalog);
  const lauf = (roh: unknown): { aus: unknown; fehler: string[] } => {
    const fehler: string[] = [];
    const aus = pruefeWerkzeugVerweise(roh, 'x.yaml', katalog, (o, f) => fehler.push(`${o}: ${f}`));
    return { aus, fehler };
  };
  assert.deepEqual(lauf(undefined), { aus: [], fehler: [] });
  assert.deepEqual(lauf([{ id: 'wegweiser', beispiel: 'messe' }, { id: 'matrix' }]), { aus: [{ id: 'wegweiser', beispiel: 'messe' }, { id: 'matrix', beispiel: null }], fehler: [] });
  assert.match(lauf([{ id: 'nirgends' }]).fehler.join(), /Werkzeug „nirgends“ gibt es nicht/u);
  assert.match(lauf([{ id: 'wegweiser', beispiel: 'fehlt' }]).fehler.join(), /Beispiel „fehlt“ gibt es bei „wegweiser“ nicht/u);
  assert.match(lauf([{ id: 'matrix', beispiel: 'messe' }]).fehler.join(), /„matrix“ hat keine Beispiele/u);
  assert.match(lauf([{ id: 'wegweiser' }, { id: 'wegweiser' }]).fehler.join(), /doppelt/u);
  assert.match(lauf([{ id: 'wegweiser', thema: 'x' }]).fehler.join(), /unbekanntes Feld „thema“/u);
  assert.match(lauf('wegweiser').fehler.join(), /erwartet eine Liste/u);
  // ohne Katalog (keine Werkzeuge in den Inhalten) wird nur die Form geprüft
  assert.deepEqual(pruefeWerkzeugVerweise([{ id: 'wegweiser', beispiel: 'egal' }], 'x', null, () => assert.fail()), [{ id: 'wegweiser', beispiel: 'egal' }]);
});

test('Verweise aus Story und Themen nach Konzept E-13 (A ← 7, 4 · B ← 2, 6 · C ← 3, 5 · D ← 5)', () => {
  const je = (id: string): string[] => g.kapitel.filter((k) => k.werkzeuge.some((v) => v.id === id)).map((k) => k.id);
  assert.deepEqual(je('vorlagen-check'), ['k4', 'k7']);
  assert.deepEqual(je('wegweiser'), ['k2', 'k6']);
  assert.deepEqual(je('risiko-grenzen'), ['k3', 'k5']);
  assert.deepEqual(je('monatsbericht'), ['k5']);
  const k5 = g.kapitel.find((k) => k.id === 'k5');
  assert.deepEqual(k5?.werkzeuge, [{ id: 'risiko-grenzen', beispiel: 'ris-014' }, { id: 'monatsbericht', beispiel: 'oktober' }]);
  for (const k of g.kapitel) for (const v of k.werkzeuge) {
    assert.ok(beispielKennungen(w, v.id).includes(v.beispiel ?? ''), `${k.id}: Beispiel ${String(v.beispiel)}`);
  }
  const themaJe = (id: string): string[] => themen(inhalte).filter((t) => t.werkzeuge.some((v) => v.id === id)).map((t) => t.thema);
  assert.deepEqual(themaJe('vorlagen-check'), ['entscheidungsvorlage']);
  assert.deepEqual(themaJe('wegweiser'), ['vorgaenge']);
  assert.deepEqual(themaJe('risiko-grenzen'), ['vorgaenge']);
  assert.deepEqual(themaJe('monatsbericht'), ['takt']);
});

const weg = (kurz: boolean) => {
  let s = neuerStand(kurz);
  for (const k of g.kapitel) s = waehle(g, s, k.id, 0);
  return s;
};
const dahinter = (kapitel: string, kurz: boolean, bedienbar: boolean): HTMLElement => {
  const s = weg(kurz);
  const el = baueSchritt({
    g, stand: { ...s, schritt: { ort: 'kapitel', kapitel, teil: 'frage' } }, bedienbar, themaTitel: (id) => themaTitel(inhalte, id),
    werkzeugTitel: (id) => (id === 'vorlagen-check' ? 'Vorlagen-Check' : id === 'risiko-grenzen' ? 'Risiko-Bewerter' : id === 'monatsbericht' ? 'Monatsbericht' : 'Wegweiser'), tue: () => undefined,
  });
  document.body.replaceChildren(el);
  return el;
};

test('Story: leiser Verweis „… ausprobieren“ im Kasten „Das steckt dahinter“, öffnet mit dem Beispiel; nie auf der Leinwand', () => {
  const lang = dahinter('k7', false, true);
  const a = lang.querySelector<HTMLAnchorElement>('[data-pruef="gs-werkzeug-vorlagen-check"]');
  assert.ok(a);
  assert.equal(a.getAttribute('href'), '#explore/vorlagen-check/lueftung-voll');
  assert.equal(a.textContent, 'Vorlagen-Check ausprobieren');
  assert.ok(a.closest('[data-pruef="gs-dahinter"]'), 'im Kasten');
  // Kapitel 5 verweist auf zwei Werkzeuge
  const k5 = dahinter('k5', false, true);
  assert.deepEqual([...k5.querySelectorAll('[data-pruef^="gs-werkzeug-"]')].map((x) => x.getAttribute('href')), ['#explore/risiko-grenzen/ris-014', '#explore/monatsbericht/oktober']);
  // Kurzfassung: im Aufklapper, zugeklappt zählt er nicht zur Lesezeit (die Kurzfassung hat keinen Puffer)
  const kurz = dahinter('k7', true, true);
  const innen = kurz.querySelector('[data-pruef="gs-dahinter-auf"] [data-pruef="gs-werkzeug-vorlagen-check"]');
  assert.ok(innen, 'in der Kurzfassung im Aufklapper');
  assert.equal(kurz.querySelector<HTMLDetailsElement>('[data-pruef="gs-dahinter-auf"]')?.open, false);
  // Leinwand und Vorschau (nicht bedienbar): kein Verweis
  for (const k of ['k2', 'k3', 'k4', 'k5', 'k6', 'k7']) assert.equal(dahinter(k, false, false).querySelector('[data-pruef^="gs-werkzeug"], a[href]'), null, k);
  // ohne Titel-Funktion (Test, Druck): kein Verweis
  const ohne = baueSchritt({ g, stand: { ...weg(false), schritt: { ort: 'kapitel', kapitel: 'k7', teil: 'frage' } }, bedienbar: true, themaTitel: () => 'Thema', tue: () => undefined });
  assert.equal(ohne.querySelector('[data-pruef="gs-werkzeuge"]'), null);
});

test('Themen: „Zum Ausprobieren“ am Seitenende, nur auf der Seite (nicht auf Leinwand und Druck)', () => {
  for (const [thema, ids] of [['entscheidungsvorlage', ['vorlagen-check']], ['vorgaenge', ['wegweiser', 'risiko-grenzen']], ['takt', ['monatsbericht']]] as const) {
    const seite = baueTheorie({ inhalte, thema, version: 'Test', bedienbar: true });
    const links = [...seite.querySelectorAll<HTMLAnchorElement>('[data-pruef="thema-werkzeuge"] a')];
    assert.deepEqual(links.map((a) => a.getAttribute('href')), ids.map((i) => `#explore/${i}`), thema);
    const stumm = baueTheorie({ inhalte, thema, version: 'Test', bedienbar: false });
    assert.equal(stumm.querySelector('[data-pruef="thema-werkzeuge"]'), null, `${thema} ohne Bedienung`);
  }
  assert.equal(baueTheorie({ inhalte, thema: 'begriffe', version: 'Test', bedienbar: true }).querySelector('[data-pruef="thema-werkzeuge"]'), null);
});

test('Adresse: #explore/<werkzeug>/<beispiel> öffnet das Werkzeug mit dem Beispiel', async () => {
  const { baueExplore } = await import('../src/ui/flaechen/explore.ts');
  assert.deepEqual(leseRoute('#explore/wegweiser/mensa'), { flaeche: 'explore', werkzeug: 'wegweiser', beispiel: 'mensa' });
  const el = baueExplore({ inhalte, werkzeug: 'wegweiser', beispiel: 'mensa', bedienbar: true });
  assert.equal(el.querySelector<HTMLSelectElement>('[data-pruef="ww-beispiel"]')?.value, 'mensa');
  const unbekannt = baueExplore({ inhalte, werkzeug: 'wegweiser', beispiel: 'gibtsnicht', bedienbar: true });
  assert.equal(unbekannt.querySelector<HTMLSelectElement>('[data-pruef="ww-beispiel"]')?.value, 'messe', 'Unbekanntes ergibt das erste Beispiel');
});

test('Werkzeugstand der Bühne: nur Beispiel und Schritt, geprüft; Älteres und Unpassendes werden null', () => {
  const kennungen = (id: string) => beispielKennungen(w, id);
  const roh = (b: Record<string, unknown>) => ({ ...neueBuehne(), bereich: 'explore', ...b });
  assert.equal(neueBuehne().werkzeugStand, null);
  const gut = [['vorlagen-check', 'b:lueftung-kurz;s:3'], ['vorlagen-check', 'b:mensa;s:ergebnis'], ['wegweiser', 'b:messe;a:0'], ['wegweiser', 'b:messe;a:n,n,u'],
    ['risiko-grenzen', 'b:ris-009;t:71;w:1'], ['monatsbericht', 'b:oktober;w:1'], ['monatsbericht', 'b:oktober']] as const;
  for (const [werkzeug, s] of gut) assert.equal(pruefeBuehne(roh({ werkzeug, werkzeugStand: s }), g, kennungen)?.werkzeugStand, s, s);
  const schlecht: [string | null, unknown][] = [
    ['vorlagen-check', 'b:fremd;s:1'], ['vorlagen-check', 'b:lueftung-kurz;s:6'], ['vorlagen-check', 'B:mensa'], ['wegweiser', 'b:messe;a:'], ['wegweiser', 'b:messe;a:x'],
    ['risiko-grenzen', 'b:ris-009;t:70;t:71'], ['monatsbericht', 'b:oktober;w:2'], ['matrix', 'b:x'], ['glossar', 'b:x'], [null, 'b:oktober'],
    ['monatsbericht', 'b:oktober;w:1;' + 'x'.repeat(80)], ['monatsbericht', 'b:oktober; w:1'], ['monatsbericht', { b: 'oktober' }], ['monatsbericht', 42],
    ['monatsbericht', '<script>'], ['vorlagen-check', 'b:mensa;s:1\n'],
  ];
  for (const [werkzeug, s] of schlecht) assert.equal(pruefeBuehne(roh({ werkzeug, werkzeugStand: s }), g, kennungen)?.werkzeugStand, null, JSON.stringify(s));
  // ein Stand ohne das Feld (vor P18.5) gilt weiter
  const alt = { ...neueBuehne() } as Record<string, unknown>;
  delete alt['werkzeugStand'];
  assert.equal(pruefeBuehne(alt, g, kennungen)?.werkzeugStand, null);
  // fremde Eigenschaften erreichen die Zeichnung nicht
  assert.deepEqual(Object.keys(pruefeBuehne(roh({ werkzeug: 'wegweiser', werkzeugStand: 'b:messe', geheim: 'x' }), g, kennungen) ?? {}).sort(), ['bereich', 'story', 'thema', 'v', 'werkzeug', 'werkzeugStand']);
});

test('Regie-Zustand: Schritte (E-9), Schalter und Beispielstart', () => {
  const ST = (werkzeug: string, s: string | null, r: 1 | -1) => stand.schrittImWerkzeug(w, werkzeug, s, r);
  // A: fünf Prüfschritte, dann Ergebnis, dann Ende
  assert.deepEqual(stand.schrittFolge(w, 'vorlagen-check', 'mensa'), ['s:1', 's:2', 's:3', 's:4', 's:5', 's:ergebnis']);
  assert.equal(ST('vorlagen-check', 'b:mensa', 1), 'b:mensa;s:2', 'ohne Schritt steht A bei Schritt 1');
  assert.equal(ST('vorlagen-check', 'b:mensa;s:5', 1), 'b:mensa;s:ergebnis');
  assert.equal(ST('vorlagen-check', 'b:mensa;s:ergebnis', 1), null, 'am Ende: nächstes Werkzeug');
  assert.equal(ST('vorlagen-check', 'b:mensa;s:1', -1), null, 'am Anfang: voriges Werkzeug');
  assert.equal(ST('vorlagen-check', null, 1), 'b:lueftung-kurz;s:2', 'ohne Stand: erstes Beispiel');
  // B: a:0, dann je eine Antwort des Beispiels mehr; ohne Schritt ist das Beispiel vollständig beantwortet
  const folge = stand.schrittFolge(w, 'wegweiser', 'messe') ?? [];
  assert.equal(folge[0], 'a:0');
  assert.ok(folge.length > 2);
  assert.equal(ST('wegweiser', 'b:messe;a:0', 1), `b:messe;${folge[1]}`);
  assert.equal(ST('wegweiser', 'b:messe', 1), null);
  assert.equal(ST('wegweiser', 'b:messe', -1), `b:messe;${folge.at(-2)}`);
  for (const s of folge) assert.ok(pruefeBuehne({ ...neueBuehne(), bereich: 'explore', werkzeug: 'wegweiser', werkzeugStand: `b:messe;${s}` }, g, (id) => beispielKennungen(w, id))?.werkzeugStand, s);
  // C und D haben keine Schritte
  assert.equal(ST('risiko-grenzen', 'b:ris-009', 1), null);
  assert.equal(ST('monatsbericht', null, -1), null);
  assert.equal(ST('mcda', null, 1), null);
  // Eintritt: vorwärts am Anfang, rückwärts am Ende
  assert.equal(stand.eintrittsStand(w, 'vorlagen-check', 1), 'b:lueftung-kurz;s:1');
  assert.equal(stand.eintrittsStand(w, 'vorlagen-check', -1), 'b:lueftung-kurz;s:ergebnis');
  assert.equal(stand.eintrittsStand(w, 'wegweiser', 1), 'b:messe;a:0');
  assert.equal(stand.eintrittsStand(w, 'monatsbericht', 1), null);
  assert.equal(stand.beispielStart(w, 'risiko-grenzen', 'ris-014'), 'b:ris-014');
  // Schalter: kombinierbar, t:70 und t:71 schließen sich aus, feste Reihenfolge
  let s: string | null = null;
  s = stand.schalteUm('risiko-grenzen', 'ris-009', s, 'w:1');
  s = stand.schalteUm('risiko-grenzen', 'ris-009', stand.standTeile(w, 'risiko-grenzen', s)?.schritt ?? null, 't:70');
  assert.equal(s, 'b:ris-009;t:70;w:1');
  s = stand.schalteUm('risiko-grenzen', 'ris-009', 't:70;w:1', 't:71');
  assert.equal(s, 'b:ris-009;t:71;w:1');
  assert.equal(stand.schalteUm('risiko-grenzen', 'ris-009', 't:71;w:1', 'w:1'), 'b:ris-009;t:71');
  assert.equal(stand.schalteUm('risiko-grenzen', 'ris-009', 't:71', 't:71'), 'b:ris-009');
  assert.equal(stand.schalteUm('monatsbericht', 'oktober', null, 'w:1'), 'b:oktober;w:1');
  assert.equal(stand.schalteUm('monatsbericht', 'oktober', 'w:1', 'w:1'), 'b:oktober');
  assert.deepEqual(stand.schalterVon(w, 'risiko-grenzen', 'ris-009', '').map((x) => x.wert), ['t:70', 't:71', 'w:1', 'm:belegt']);
  assert.deepEqual(stand.schalterVon(w, 'risiko-grenzen', 'ris-021', ''), []);
  assert.deepEqual(stand.schalterVon(w, 'monatsbericht', 'oktober', 'Kosten-Ampel ohne Frage').map((x) => x.wert), ['w:1']);
  assert.deepEqual(stand.schalterVon(w, 'wegweiser', 'messe', ''), []);
});

function starteRegie(): { r: ReturnType<typeof erzeugeRegie>; gesendet: KanalNachricht[]; zustand: () => { werkzeug: string | null; werkzeugStand: string | null; bereich: string }; ende: () => void } {
  const gesendet: KanalNachricht[] = [];
  const kanal = { senden: (n: KanalNachricht) => { gesendet.push(n); }, abonnieren: () => () => undefined, schliessen: () => undefined };
  const daten = new Map<string, string>();
  const speicher = { getItem: (k: string) => daten.get(k) ?? null, setItem: (k: string, v: string) => { daten.set(k, v); }, removeItem: (k: string) => { daten.delete(k); } };
  const r = erzeugeRegie({ inhalte, kanal, version: 'Test', speicher, regieGeschichte, regieKapitel, regieWerkzeug, oeffneLeinwand: () => undefined, takt: 100000 });
  document.body.replaceChildren(r.element);
  const zustand = () => {
    const z = gesendet.filter((n) => n.art === 'zustand').at(-1);
    assert.ok(z && z.art === 'zustand');
    return z.zustand;
  };
  return { r, gesendet, zustand, ende: () => r.entferne() };
}
const klick = (r: ReturnType<typeof erzeugeRegie>, pruef: string): void => {
  const e = r.element.querySelector<HTMLElement>(`[data-pruef="${pruef}"]`);
  assert.ok(e, pruef);
  e.click();
};
const pfeil = (r: ReturnType<typeof erzeugeRegie>, key: string): void => { r.taste(new KeyboardEvent('keydown', { key })); };

test('Regie: Pfeiltasten gehen erst durch die Schritte, dann zum nächsten Werkzeug (E-9) – Notizen nur im Regie-Teil', () => {
  const { r, zustand, gesendet, ende } = starteRegie();
  try {
    klick(r, 'regie-bereich-explore');
    const sel = r.element.querySelector<HTMLSelectElement>('[data-pruef="regie-werkzeug"]');
    assert.ok(sel);
    assert.equal(r.element.querySelector<HTMLElement>('[data-pruef="regie-werkzeug-stand"]')?.hidden, true, 'beim MCDA-Rechner keine Schritte');
    pfeil(r, 'ArrowRight');
    assert.deepEqual([zustand().werkzeug, zustand().werkzeugStand], ['vorlagen-check', 'b:lueftung-kurz;s:1']);
    assert.equal(r.element.querySelector<HTMLElement>('[data-pruef="regie-werkzeug-stand"]')?.hidden, false);
    assert.match(r.element.querySelector('[data-pruef="regie-notiz"]')?.textContent ?? '', /kurze Fassung zeigen/u);
    assert.ok(r.element.querySelector('[data-pruef="regie-leitfragen"]'));
    for (let i = 2; i <= 5; i++) { pfeil(r, 'ArrowRight'); assert.equal(zustand().werkzeugStand, `b:lueftung-kurz;s:${i}`); }
    pfeil(r, 'ArrowRight');
    assert.equal(zustand().werkzeugStand, 'b:lueftung-kurz;s:ergebnis');
    assert.equal(r.element.querySelector('[data-pruef="regie-schritt-stelle"]')?.textContent, 'Ergebnis');
    pfeil(r, 'ArrowRight');
    assert.deepEqual([zustand().werkzeug, zustand().werkzeugStand], ['matrix', null], 'nach dem Ergebnis kommt das nächste Werkzeug');
    pfeil(r, 'ArrowRight');
    assert.equal(zustand().werkzeug, 'risiko-grenzen');
    // zurück ins Werkzeug davor: am Ende seiner Schritte
    pfeil(r, 'ArrowLeft');
    pfeil(r, 'ArrowLeft');
    assert.deepEqual([zustand().werkzeug, zustand().werkzeugStand], ['vorlagen-check', 'b:lueftung-kurz;s:ergebnis']);
    // Beispielwahl und Schritt-Knöpfe
    klick(r, 'regie-beispiel-mensa');
    assert.equal(zustand().werkzeugStand, 'b:mensa;s:1');
    klick(r, 'regie-schritt-weiter');
    assert.equal(zustand().werkzeugStand, 'b:mensa;s:2');
    klick(r, 'regie-schritt-zurueck');
    klick(r, 'regie-schritt-zurueck' );
    assert.equal(r.element.querySelector<HTMLButtonElement>('[data-pruef="regie-schritt-zurueck"]')?.disabled, true);
    // Werkzeugauswahl beginnt am Anfang des Werkzeugs; B mit „noch nichts beantwortet“
    sel.value = 'wegweiser';
    sel.dispatchEvent(new Event('change'));
    assert.equal(zustand().werkzeugStand, 'b:messe;a:0');
    klick(r, 'regie-schritt-weiter');
    assert.match(zustand().werkzeugStand ?? '', /^b:messe;a:[jnu]$/u);
    // C: Schalter kombinierbar; D: Kosten-Ampel
    sel.value = 'risiko-grenzen';
    sel.dispatchEvent(new Event('change'));
    assert.equal(zustand().werkzeugStand, null);
    klick(r, 'regie-beispiel-ris-009');
    klick(r, 'regie-schalter-t-71');
    klick(r, 'regie-schalter-w-1');
    assert.equal(zustand().werkzeugStand, 'b:ris-009;t:71;w:1');
    assert.equal(r.element.querySelector('[data-pruef="regie-schalter-t-71"]')?.getAttribute('aria-pressed'), 'true');
    klick(r, 'regie-schalter-t-70');
    assert.equal(zustand().werkzeugStand, 'b:ris-009;t:70;w:1');
    sel.value = 'monatsbericht';
    sel.dispatchEvent(new Event('change'));
    klick(r, 'regie-schalter-w-1');
    assert.equal(zustand().werkzeugStand, 'b:oktober;w:1');
    assert.match(r.element.querySelector('[data-pruef="regie-notiz"]')?.textContent ?? '', /Kosten-Ampel/u);
    // Kanal: nur Beispiel und Schritt, nie Regie-Text; jeder gesendete Stand besteht die Prüfung der Leinwand
    const zustaende = gesendet.filter((n) => n.art === 'zustand');
    assert.ok(zustaende.length > 10);
    for (const n of zustaende) {
      if (n.art !== 'zustand') continue;
      const b = pruefeBuehne(JSON.parse(JSON.stringify(n.zustand)), g, (id) => beispielKennungen(w, id));
      assert.ok(b, 'Bühnenstand gültig');
      assert.equal(b.werkzeugStand, n.zustand.werkzeugStand, `Stand ${String(n.zustand.werkzeugStand)} kommt unverändert an`);
    }
    const kanalText = JSON.stringify(gesendet);
    for (const id of NEUE_WERKZEUGE) {
      const e = regieWerkzeug(id);
      assert.ok(e?.notizHtml && e.leitfragen.length > 0, `Regie-Material zu ${id}`);
      assert.ok(!kanalText.includes(e.notizHtml.slice(3, 40)), `${id}: keine Notiz im Kanal`);
      for (const f of e.leitfragen) assert.ok(!kanalText.includes(f), f);
    }
  } finally {
    ende();
  }
});

test('Leinwand: die vier Werkzeuge in jedem Beispiel und Schritt – keine Bedienelemente, kein Regie-Text, kein Verweis', () => {
  const anzeige = erzeugeAnzeige(inhalte, 'Test', true);
  document.body.replaceChildren(anzeige.element);
  try {
    const regieTexte = NEUE_WERKZEUGE.flatMap((id) => { const e = regieWerkzeug(id); return e === null ? [] : [e.notizHtml.replace(/<[^>]*>/gu, '').trim().slice(0, 40), ...e.leitfragen]; });
    assert.ok(regieTexte.length >= 12);
    let gezeichnet = 0;
    const faelle: [string, string | null][] = [];
    for (const id of NEUE_WERKZEUGE) {
      for (const bsp of beispielKennungen(w, id)) {
        faelle.push([id, null], [id, `b:${bsp}`]);
        for (const sch of stand.schrittFolge(w, id, bsp) ?? []) faelle.push([id, `b:${bsp};${sch}`]);
        for (const x of stand.schalterVon(w, id, bsp, 'x')) faelle.push([id, `b:${bsp};${x.wert}`]);
      }
    }
    {
      for (const [id, s] of faelle) {
        const roh = { ...neueBuehne(), bereich: 'explore', werkzeug: id, werkzeugStand: s };
        const buehne = pruefeBuehne(roh, g, (k) => beispielKennungen(w, k));
        assert.ok(buehne);
        assert.equal(buehne.werkzeugStand, s);
        anzeige.setze(buehne);
        const wo = `${id} ${String(s)}`;
        assert.ok(anzeige.element.querySelector(`[data-werkzeug="${id}"]`), `${wo}: Werkzeug gezeichnet`);
        const bedienbar = [...anzeige.element.querySelectorAll('button, select, input, textarea, a[href], [contenteditable], [tabindex]:not([tabindex="-1"])')]
          .map((e) => `${e.tagName.toLowerCase()}[${e.getAttribute('data-pruef') ?? e.getAttribute('href') ?? ''}]`);
        // die Kacheln der Werkzeugleiste sind Text (kein Link), alles andere ebenso
        assert.deepEqual(bedienbar, [], `${wo}: Bedienelemente auf der Leinwand`);
        const text = anzeige.element.textContent ?? '';
        for (const t of regieTexte) assert.ok(!text.includes(t), `${wo}: Regie-Text „${t.slice(0, 20)}“ auf der Leinwand`);
        gezeichnet += 1;
      }
    }
    assert.ok(gezeichnet > 40, `gezeichnet: ${gezeichnet}`);
    // Gegenprobe: derselbe Stand mit einem fremden Beispiel zeichnet den Beispielanfang statt etwas Falsches
    anzeige.setze(pruefeBuehne({ ...neueBuehne(), bereich: 'explore', werkzeug: 'wegweiser', werkzeugStand: 'b:fremd;a:j' }, g, (k) => beispielKennungen(w, k))!);
    assert.ok(anzeige.element.querySelector('[data-werkzeug="wegweiser"]'));
  } finally {
    anzeige.entferne();
  }
});

test('Leinwand zeigt den Schritt des Werkzeugs: Prüfschritt, Antworten bis zur gesendeten Frage, Annahme', () => {
  const anzeige = erzeugeAnzeige(inhalte, 'Test', true);
  document.body.replaceChildren(anzeige.element);
  const zeige = (werkzeug: string, s: string): HTMLElement => {
    anzeige.setze(pruefeBuehne({ ...neueBuehne(), bereich: 'explore', werkzeug, werkzeugStand: s }, g, (k) => beispielKennungen(w, k))!);
    return anzeige.element;
  };
  try {
    const eins = zeige('vorlagen-check', 'b:mensa;s:1').textContent;
    const drei = zeige('vorlagen-check', 'b:mensa;s:3').textContent;
    assert.notEqual(eins, drei, 'der Prüfschritt wechselt mit dem Stand');
    const keine = zeige('wegweiser', 'b:messe;a:0').querySelectorAll('input:checked, [data-frage].ist-beantwortet').length;
    const alle = zeige('wegweiser', 'b:messe').querySelectorAll('[data-frage].ist-beantwortet').length;
    assert.equal(keine, 0);
    assert.ok(alle >= 3, `vollständig beantwortet: ${alle}`);
    const ohne = zeige('monatsbericht', 'b:oktober').textContent;
    const mit = zeige('monatsbericht', 'b:oktober;w:1').textContent;
    assert.notEqual(ohne, mit, 'die Kosten-Ampel ohne Frage zeigt die Warnung');
  } finally {
    anzeige.entferne();
  }
});

test('Datenschutz: die Werkzeuge speichern und senden nichts (Quelltext) – der Satz in der Erklärung stimmt', () => {
  const wurzel = new URL('..', import.meta.url).pathname;
  const dateien = [
    ...readdirSync(join(wurzel, 'src/ui/flaechen/explore')).map((f) => join(wurzel, 'src/ui/flaechen/explore', f)),
    ...readdirSync(join(wurzel, 'src/werkzeuge')).map((f) => join(wurzel, 'src/werkzeuge', f)),
    join(wurzel, 'src/regie/werkzeug-stand.ts'),
    join(wurzel, 'src/ui/werkzeug-kennungen.ts'),
    join(wurzel, 'src/ui/flaechen/explore.ts'),
  ];
  assert.ok(dateien.length >= 12);
  for (const d of dateien) {
    const text = readFileSync(d, 'utf8').replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');
    assert.doesNotMatch(text, /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|navigator\./u, d);
  }
  const datenschutz = readFileSync(join(wurzel, 'inhalte/rechtliches/datenschutz.md'), 'utf8');
  assert.match(datenschutz, /was Sie in den Werkzeugen einstellen, wird weder gespeichert noch gesendet/u);
  assert.match(datenschutz, /gezeigte Werkzeug mit Beispiel und Schritt/u, 'der Stand der Präsentation nennt das Werkzeug');
});

test('Übersetzer (R79): Beispiele der vier Werkzeuge mit unbekanntem Feld, schiefer oder doppelter Kennung werden abgewiesen', async () => {
  const { baueWerkzeuge } = (await import(String('../werkzeuge/explore.mjs'))) as { baueWerkzeuge: (c: unknown, rel: string, roh: string) => unknown };
  const YAML = (await import(String('yaml'))) as { parse: (t: string) => Record<string, { beispiele: Record<string, unknown>[] }>; stringify: (x: unknown) => string };
  const { readFileSync } = await import('node:fs');
  const roh = readFileSync(new URL('../inhalte/werkzeuge.yaml', import.meta.url), 'utf8');
  const lauf = (aendere: (y: Record<string, { beispiele: Record<string, unknown>[] }>) => void): string[] => {
    const fehler: string[] = [];
    const y = YAML.parse(roh);
    aendere(y);
    baueWerkzeuge({ fehler: (_r: string, f: string) => fehler.push(f), html: () => '', inline: () => '' }, 'w.yaml', YAML.stringify(y));
    return fehler;
  };
  assert.deepEqual(lauf(() => {}), []);
  for (const t of ['vorlagencheck', 'wegweiser', 'risikogrenzen', 'monatsbericht']) {
    assert.ok(lauf((y) => { (y[t]?.beispiele[0] ?? {}).reserv = true; }).some((f) => f.includes('unbekanntes Feld „reserv“')), `${t}: Tippfehler`);
    assert.ok(lauf((y) => { (y[t]?.beispiele[0] ?? {}).id = 'Gross'; }).some((f) => f.includes('Kleinschrift')), `${t}: Kennung`);
  }
  assert.ok(lauf((y) => { const b = y.wegweiser?.beispiele; if (b?.[1] && b[0]) b[1].id = b[0].id; }).some((f) => f.includes('doppelt')));
});
