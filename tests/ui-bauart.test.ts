// Bauart der Oberfläche (P0.6, P16): Schutz der Regie-Notizen durch Konstruktion, Bereiche im DOM (jsdom).
//
// 1. Statisch: Kein Modul unter src/ außer main.ts liest das Regie-Material oder die Inhalte-Datei selbst; der
//    transitive Importgraph der Leinwand (auch dynamische Importe) erreicht beides nicht; `inhalte` trägt auf
//    Datenebene kein Regie-Material (Positivliste).
// 2. DOM: Startseite (drei Wege, Links zu bauherr-mentoren.com, Impressum, Datenschutz), Theorie (Themen ohne
//    Nummern, Originaltext oder Zitierangaben), Story (Auftakt → Station → Vorlage → Folge → Schulstart, Speicher),
//    Explore (fünf Werkzeuge), Leinwand-Anzeige (nicht bedienbar, ohne Notiz), Regie (Notiz, Kanal sendet nur Öffentliches).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { anzeigeFassung } from '../werkzeuge/anzeige-fassung.mjs';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function dateien(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? dateien(p) : [p];
  });
}
const rel = (p: string): string => relative(WURZEL, p).split(sep).join('/');

/** Alle Modul-Angaben eines Quelltexts: statische Importe/Exporte, Seiteneffekt-Importe, dynamische Importe. */
function modulAngaben(text: string): { angaben: string[]; unaufloesbar: number } {
  const angaben: string[] = [];
  for (const m of text.matchAll(/(?:^|[;\s])(?:import|export)\s[^'"`;]*?\sfrom\s*['"]([^'"]+)['"]/g)) angaben.push(m[1] ?? '');
  for (const m of text.matchAll(/(?:^|[;\s])import\s*['"]([^'"]+)['"]/g)) angaben.push(m[1] ?? '');
  for (const m of text.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*[,)]/g)) angaben.push(m[1] ?? '');
  // Ein dynamischer Import ohne festen Text ließe sich nicht prüfen – er ist selbst ein Befund.
  const unaufloesbar = [...text.matchAll(/\bimport\s*\(\s*(?!['"])/g)].length;
  return { angaben, unaufloesbar };
}

/** Transitiver Importgraph ab einer Datei (nur relative Angaben, also nur eigene Module). */
function importGraph(start: string): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  const offen = [resolve(start)];
  while (offen.length > 0) {
    const datei = offen.pop() ?? '';
    if (graph.has(datei)) continue;
    if (!datei.endsWith('.ts')) {
      graph.set(datei, []);
      continue;
    }
    const { angaben, unaufloesbar } = modulAngaben(readFileSync(datei, 'utf8'));
    assert.equal(unaufloesbar, 0, `${rel(datei)}: dynamischer Import ohne festen Pfad`);
    const ziele = angaben.filter((a) => a.startsWith('.')).map((a) => resolve(dirname(datei), a));
    graph.set(datei, ziele);
    offen.push(...ziele);
  }
  return graph;
}

test('Regie-Material erreicht nur die Regie (Konstruktion, O-9): kein Modul außer main.ts greift darauf zu', () => {
  const module = dateien(join(WURZEL, 'src')).filter((p) => p.endsWith('.ts') && !rel(p).startsWith('src/generiert/'));
  assert.ok(module.length > 25);
  const ausnahmen = new Set(['src/main.ts', 'src/inhalte/index.ts', 'src/inhalte/typen.ts']);
  for (const p of module) {
    if (ausnahmen.has(rel(p))) continue;
    const text = readFileSync(p, 'utf8');
    const ziele = modulAngaben(text).angaben.filter((a) => a.startsWith('.')).map((a) => rel(resolve(dirname(p), a)));
    assert.ok(!ziele.includes('src/inhalte/index.ts'), `${rel(p)} importiert die Inhalte direkt`);
    assert.ok(!ziele.includes('src/generiert/inhalte.json'), `${rel(p)} importiert die Inhalte-Datei`);
    assert.ok(!ziele.includes('src/generiert/abbildungen.json'), `${rel(p)} importiert die Bilddaten der Abbildungen`);
    assert.doesNotMatch(text, /regieInhalte|geschichteRegie/, `${rel(p)} nennt das Regie-Material`);
    // Die Regie bekommt regieGeschichte/regieKapitel als Parameter von main.ts – nur dort und in der Regie steht der Name.
    if (rel(p) !== 'src/regie/regie.ts') assert.doesNotMatch(text, /regieFuer|regieKapitel|regieGeschichte/, `${rel(p)} nennt Regie-Zugriffe`);
  }
  const main = readFileSync(join(WURZEL, 'src/main.ts'), 'utf8');
  assert.match(main, /import \{ inhalte, regieGeschichte, regieKapitel \} from '\.\/inhalte\/index\.ts'/);
});

test('Leinwand: der ganze Importgraph (transitiv, auch dynamisch) enthält weder Inhalte-Datei noch Regie', () => {
  const graph = importGraph(join(WURZEL, 'src/regie/leinwand.ts'));
  const erreicht = [...graph.keys()].map(rel);
  for (const erwartet of ['src/ui/flaechen/geschichte.ts', 'src/geschichte/engine.ts', 'src/regie/kanal.ts', 'src/stil/symbole.ts', 'src/ui/flaechen/theorie.ts']) {
    assert.ok(erreicht.includes(erwartet), `Graph erreicht ${erwartet} nicht: ${erreicht.join(', ')}`);
  }
  for (const verboten of ['src/inhalte/index.ts', 'src/generiert/inhalte.json', 'src/generiert/abbildungen.json', 'src/regie/regie.ts', 'src/main.ts']) {
    assert.ok(!erreicht.includes(verboten), `die Leinwand erreicht ${verboten}`);
  }
  for (const datei of graph.keys()) {
    if (!datei.endsWith('.ts')) continue;
    assert.doesNotMatch(readFileSync(datei, 'utf8'), /regieFuer|regieInhalte|regieGeschichte|regieKapitel/, `${rel(datei)} (im Graph der Leinwand) nennt Regie-Zugriffe`);
  }
  const probe = modulAngaben(`import { a } from './x.ts';\nexport * from "./y.ts";\nimport './z.css';\nconst m = await import('../inhalte/index.ts');\nimport(\`./\${n}.ts\`);`);
  assert.deepEqual(probe.angaben, ['./x.ts', './y.ts', './z.css', '../inhalte/index.ts']);
  assert.equal(probe.unaufloesbar, 1);
});

test('Datenebene: `inhalte` enthält kein Regie-Material', async () => {
  const { inhalte, regieGeschichte, regieKapitel } = await import('../src/inhalte/index.ts');
  assert.equal('regie' in inhalte, false);
  assert.equal('geschichteRegie' in inhalte, false);
  const oeffentlichText = JSON.stringify(inhalte);
  const k7 = regieGeschichte('k7');
  assert.ok(k7?.notizHtml);
  assert.ok(!oeffentlichText.includes(k7.notizHtml.slice(3, 60)));
  for (const k of ['k1', 'k2', 'k7']) for (const f of regieGeschichte(k)?.leitfragen ?? []) assert.ok(!oeffentlichText.includes(f), f);
  for (let nr = 1; nr <= 13; nr++) {
    const e = regieKapitel(nr);
    if (e?.notiz) assert.ok(!oeffentlichText.includes(e.notiz.slice(3, 60)), `Notiz ${nr}`);
  }
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

const { inhalte, regieGeschichte, regieKapitel } = await import('../src/inhalte/index.ts');
const { baueStart } = await import('../src/ui/flaechen/start.ts');
const { baueTheorie, themen, themaFuerDruck, themaTitel } = await import('../src/ui/flaechen/theorie.ts');
const { baueExplore, WERKZEUGE } = await import('../src/ui/flaechen/explore.ts');
const { erzeugeGeschichte, SPEICHER_SCHLUESSEL } = await import('../src/ui/flaechen/geschichte.ts');
const { erzeugeAnzeige } = await import('../src/regie/leinwand.ts');
const { erzeugeRegie } = await import('../src/regie/regie.ts');
const { neueBuehne } = await import('../src/regie/buehne.ts');
const { W } = await import('../src/ui/woerter.ts');
type KanalNachricht = import('../src/regie/kanal.ts').KanalNachricht;

const VERSION = 'Fassung 0.2';
const G = inhalte.geschichte;
assert.ok(G);
const themaVon = (nr: number): string => Object.values(inhalte.theorie).find((t) => t.kapitel === nr)?.thema ?? '';

/** Ein Speicher wie localStorage, für die Story. */
function speicher(): { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void; daten: Map<string, string> } {
  const daten = new Map<string, string>();
  return { daten, getItem: (k) => daten.get(k) ?? null, setItem: (k, v) => { daten.set(k, v); }, removeItem: (k) => { daten.delete(k); } };
}

test('Startseite: drei Wege, leise Links zu bauherr-mentoren.com, Impressum und Datenschutz', () => {
  const el = baueStart({ startseite: inhalte.startseite, themenAnzahl: themen(inhalte).length, stationenAnzahl: 8, werkzeugAnzahl: WERKZEUGE.length, weiterlesen: false, bedienbar: true });
  assert.deepEqual([...el.querySelectorAll('[data-pruef^="weg-"]')].map((a) => a.getAttribute('href')), ['#story', '#theorie', '#explore']);
  const bm = [...el.querySelectorAll('a[href="https://www.bauherr-mentoren.com/"]')];
  assert.ok(bm.length >= 3, 'Kopf, „Wer steht dahinter“, Fuß');
  assert.ok(el.querySelector('[data-pruef="impressum"][href="impressum.html"]'));
  assert.ok(el.querySelector('[data-pruef="datenschutz"][href="datenschutz.html"]'));
  assert.ok(el.querySelector('[data-pruef="praesentieren"][href="#regie"]'));
  assert.match(el.textContent ?? '', /Internetseite/u);
  assert.match(el.textContent ?? '', /fiktiver Fall/u);
  const leinwand = baueStart({ startseite: inhalte.startseite, themenAnzahl: 1, stationenAnzahl: 1, werkzeugAnzahl: 1, weiterlesen: false, bedienbar: false });
  assert.equal(leinwand.querySelectorAll('a, button').length, 0, 'auf der Leinwand nichts Bedienbares');
});

test('Theorie (O-38, O-54): eigene Nummern statt Vorlagennummern, kein Originaltext, keine Zitierangaben; Kontakt am Ende', () => {
  const liste = baueTheorie({ inhalte, thema: null, version: VERSION, bedienbar: true });
  const karten = [...liste.querySelectorAll('[data-pruef^="thema-"]')];
  assert.equal(karten.length, themen(inhalte).length);
  assert.doesNotMatch(liste.textContent ?? '', /Kapitel|\bKap\./u);
  for (const t of themen(inhalte)) {
    const seite = baueTheorie({ inhalte, thema: t.thema, version: VERSION, bedienbar: true });
    assert.ok(seite.querySelector(`[data-thema="${t.thema}"]`), t.thema);
    for (const sel of ['.originaltext', '[data-pruef="zitieren"]', '.absatz-id', '.kapitel-nr', '.abschnitt-nr', '.tafel-quelle', '[data-pruef="impressum"] + .impressum']) {
      assert.equal(seite.querySelector(`.lern-inhalt ${sel}`), null, `${t.thema}: ${sel}`);
    }
    assert.ok(seite.querySelector('[data-pruef="lern-kontakt"] a[href="https://www.bauherr-mentoren.com/"]'), `${t.thema}: Kontakt`);
    assert.equal(seite.querySelector('.lern-inhalt figure.tafel figcaption'), null, `${t.thema}: Quellzeile unter einer Tafel`);
  }
  // Unbekanntes Thema → Übersicht mit Hinweis
  assert.match(baueTheorie({ inhalte, thema: 'gibt-es-nicht', version: VERSION, bedienbar: true }).textContent ?? '', new RegExp(W.themen.unbekannt.slice(0, 20), 'u'));
  // „In der Story erlebt“ verlinkt Stationen, deren Thema dieses ist
  const mitStory = G.kapitel.find((s) => themaTitel(inhalte, s.thema) !== null);
  if (mitStory) {
    const seite = baueTheorie({ inhalte, thema: mitStory.thema, version: VERSION, bedienbar: true });
    assert.ok(seite.querySelector(`[data-pruef="querverweis-${mitStory.id}"][href="#story/${mitStory.id}"]`));
  }
});

test('Story: Auftakt → Szene → Frage (ohne Wahl kein Weiter) → Folge; Speicher, Pfeiltasten, Permalink, Fortschritt löschen', () => {
  const sp = speicher();
  const f = erzeugeGeschichte({ g: G, speicher: sp, themaTitel: (id) => themaTitel(inhalte, id) });
  document.body.replaceChildren(f.element);
  const titel = (): string => f.element.querySelector('[data-pruef="gs-titel"]')?.textContent ?? '';
  const weiter = (): void => (f.element.querySelector('[data-pruef="weiter"]') as HTMLElement).click();
  assert.equal(titel(), G.titel);
  (f.element.querySelector('[data-pruef="fassung-kurz"]') as HTMLElement).click();
  assert.equal(f.stand().kurz, true);
  assert.match(titel(), new RegExp(G.kapitel[0]?.titel.replace('?', '\\?') ?? '', 'u'));
  weiter();
  weiter();
  assert.match(f.element.querySelector('.gs-navi-hinweis')?.textContent ?? '', /wählen/u);
  (f.element.querySelector('[data-pruef="antwort-2"]') as HTMLElement).click();
  assert.ok(f.element.querySelector('[data-pruef="gs-folge"]'));
  assert.ok(sp.daten.get(SPEICHER_SCHLUESSEL)?.includes('"k1":1'));
  // Pfeiltaste blättert: in der Kurzfassung folgt 3
  f.taste(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  assert.match(titel(), /Wie gefährlich ist das\?/u);
  // Permalink auf ein Kapitel außerhalb der Kurzfassung schaltet die ganze Geschichte ein
  f.zuKapitel('k6');
  assert.equal(f.stand().kurz, false);
  assert.match(titel(), /Ärger auf der Baustelle/u);
  (f.element.querySelector('[data-pruef="fortschritt-loeschen"]') as HTMLElement).click();
  assert.equal(titel(), G.titel);
  // R68: gelöscht bleibt gelöscht, bis die nächste Änderung wieder speichert
  assert.equal(sp.daten.get(SPEICHER_SCHLUESSEL), undefined);
  f.taste(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  assert.equal(sp.daten.get(SPEICHER_SCHLUESSEL), JSON.stringify(f.stand()));
});

test('Story: Schulstart zeigt Bilanz, Balken, die Wege weiter und den leisen Link', () => {
  const sp = speicher();
  const wahlen = Object.fromEntries(G.kapitel.map((k) => [k.id, k.antworten.findIndex((a) => a.wertung === 'gut')]));
  sp.setItem(SPEICHER_SCHLUESSEL, JSON.stringify({ v: 2, schritt: { ort: 'ende' }, wahlen, mini: {}, gewichte: null, kurz: false }));
  const f = erzeugeGeschichte({ g: G, speicher: sp, themaTitel: () => null });
  assert.equal(f.element.querySelector('[data-pruef="gs-bilanz-titel"]')?.textContent, G.bilanz.ruhig.titel);
  assert.equal(f.element.querySelectorAll('[data-pruef="gs-stand-ende"] .gs-stand-zeile').length, 3);
  assert.ok(f.element.querySelector('.gs-abbinder a[href="https://www.bauherr-mentoren.com/"]'));
  assert.ok(f.element.querySelector('[data-pruef="von-vorn"]'));
  assert.ok(f.element.querySelector('[data-pruef="ende-themen"][href="#theorie"]'));
});

test('Explore: fünf Werkzeuge; Rechner rechnet um, Matrix ordnet ein, Vorgänge führen weiter, Glossar sucht', () => {
  for (const id of WERKZEUGE) {
    const el = baueExplore({ inhalte, werkzeug: id, bedienbar: true });
    assert.equal(el.querySelector('.ex-werkzeuge [aria-current="page"]')?.getAttribute('data-pruef'), `ex-${id}`);
    assert.ok(el.querySelector(`[data-werkzeug="${id}"]`), id);
  }
  const mcda = baueExplore({ inhalte, werkzeug: 'mcda', bedienbar: true });
  document.body.replaceChildren(mcda);
  assert.match(mcda.querySelector('[data-pruef="ex-summe-A"]')?.textContent ?? '', /^49/u);
  for (const [kriterium, wert] of [['Geld', '5'], ['Schulstart', '3']] as const) {
    const wahl = mcda.querySelector<HTMLSelectElement>(`select[aria-label="Gewicht ${kriterium}"]`);
    assert.ok(wahl, kriterium);
    wahl.value = wert;
    wahl.dispatchEvent(new Event('change'));
  }
  assert.ok(mcda.querySelector('[data-pruef="ex-summe-C"]')?.classList.contains('ist-vorn'), 'Geld vor Schulstart dreht die Rangfolge');
  const matrix = baueExplore({ inhalte, werkzeug: 'matrix', bedienbar: true });
  (matrix.querySelector('.ex-zelle[data-w="1"][data-a="5"]') as HTMLElement).click();
  assert.match(matrix.querySelector('[data-pruef="ex-matrix-detail"]')?.textContent ?? '', /Vorrangig/u);
  (matrix.querySelector('.ex-zelle[data-w="2"][data-a="2"]') as HTMLElement).click();
  assert.match(matrix.querySelector('[data-pruef="ex-matrix-detail"]')?.textContent ?? '', /Beobachten/u);
  const vorg = baueExplore({ inhalte, werkzeug: 'vorgaenge', bedienbar: true });
  (vorg.querySelector('[data-pruef="ex-art-fruehwarnung"]') as HTMLElement).click();
  // R71: der Wege-Knopf verschwindet mit dem Detail – der Fokus geht an den Art-Knopf des Ziels, nicht auf body
  document.body.replaceChildren(vorg);
  const weg = vorg.querySelector<HTMLElement>('.ex-weg[data-ziel="risiko"]');
  assert.ok(weg);
  weg.focus();
  weg.click();
  assert.equal(vorg.querySelector('.ex-art[aria-pressed="true"]')?.getAttribute('data-art'), 'risiko');
  assert.notEqual(document.activeElement, document.body);
  assert.equal(document.activeElement, vorg.querySelector('[data-pruef="ex-art-risiko"]'), 'Fokus auf dem Art-Knopf des Ziels');
  const glossar = baueExplore({ inhalte, werkzeug: 'glossar', bedienbar: true });
  const feld = glossar.querySelector<HTMLInputElement>('[data-pruef="glossar-suche"]');
  assert.ok(feld);
  feld.value = 'freigabe';
  feld.dispatchEvent(new Event('input'));
  const sichtbar = [...glossar.querySelectorAll<HTMLElement>('[data-pruef="glossar-eintrag"]')].filter((e) => !e.hidden).length;
  assert.ok(sichtbar > 0 && sichtbar < Object.keys(inhalte.glossar).length);
  const leinwand = baueExplore({ inhalte, werkzeug: 'matrix', bedienbar: false });
  assert.equal(leinwand.querySelectorAll('a, button, select, input').length, 0);
});

test('Leinwand-Anzeige: nicht bedienbar, derselbe Stand, keine Regie-Notiz', () => {
  const a = erzeugeAnzeige(inhalte, VERSION, true);
  const b = { ...neueBuehne(), bereich: 'story' as const, story: { ...neueBuehne().story, schritt: { ort: 'kapitel' as const, kapitel: 'k7', teil: 'vergleich' as const } } };
  a.setze(b);
  assert.equal(a.element.getAttribute('inert'), '');
  assert.equal(a.element.querySelectorAll('button, a, input, select').length, 0);
  assert.match(a.element.textContent ?? '', /Ersatzgerät/u);
  const notiz = regieGeschichte('k7');
  assert.ok(notiz && !(a.element.innerHTML.includes(notiz.notizHtml.slice(3, 50))));
  a.setze({ ...b, bereich: 'theorie', thema: themaVon(4) });
  assert.ok(a.element.querySelector(`[data-thema="${themaVon(4)}"]`));
  a.setze({ ...b, bereich: 'explore', werkzeug: 'takt' });
  assert.ok(a.element.querySelector('[data-werkzeug="takt"]'));
});

test('Regie: Notiz und Leitfragen, Kundenwahl, „weiter“ sendet den öffentlichen Stand über den Kanal', () => {
  const gesendet: KanalNachricht[] = [];
  const kanal = { senden: (n: KanalNachricht) => { gesendet.push(n); }, abonnieren: () => () => undefined, schliessen: () => undefined };
  const sp = speicher();
  const r = erzeugeRegie({ inhalte, kanal, version: VERSION, speicher: sp, regieGeschichte, regieKapitel, oeffneLeinwand: () => undefined, takt: 100000 });
  document.body.replaceChildren(r.element);
  // R69: auch bei einem Fehlschlag abbauen – sonst hält der Takt der Regie den Testlauf offen
  try {
    (r.element.querySelector('[data-pruef="regie-bereich-story"]') as HTMLElement).click();
    const sprung = r.element.querySelector<HTMLSelectElement>('[data-pruef="regie-sprung"]');
    assert.ok(sprung);
    sprung.value = 'k7';
    sprung.dispatchEvent(new Event('change'));
    assert.match(r.element.querySelector('[data-pruef="regie-notiz"]')?.textContent ?? '', /Gewichte gemeinsam/u);
    assert.ok(r.element.querySelector('[data-pruef="regie-leitfragen"]'));
    // Vergleich: die Regie stellt die Stufen
    (r.element.querySelector('[data-pruef="regie-weiter"]') as HTMLElement).click();
    (r.element.querySelector('[data-pruef="regie-stufe-klima-3"]') as HTMLElement).click();
    const mitStufe = gesendet.filter((n) => n.art === 'zustand').at(-1);
    assert.ok(mitStufe && mitStufe.art === 'zustand');
    assert.equal(mitStufe.zustand.story.gewichte?.['klima'], 3);
    // Frage: die Regie wählt die Antwort (Platz 2)
    (r.element.querySelector('[data-pruef="regie-weiter"]') as HTMLElement).click();
    (r.element.querySelector('[data-pruef="regie-wahl-2"]') as HTMLElement).click();
    const letzte = gesendet.filter((n) => n.art === 'zustand').at(-1);
    assert.ok(letzte && letzte.art === 'zustand');
    assert.equal(letzte.zustand.story.wahlen['k7'], 1);
    // Taste 3 wählt Platz 3
    r.taste(new KeyboardEvent('keydown', { key: '3' }));
    const nachTaste = gesendet.filter((n) => n.art === 'zustand').at(-1);
    assert.ok(nachTaste && nachTaste.art === 'zustand');
    assert.equal(nachTaste.zustand.story.wahlen['k7'], 2);
    const text = JSON.stringify(gesendet);
    assert.ok(!text.includes(regieGeschichte('k7')?.notizHtml.slice(3, 40) ?? 'x'), 'keine Notiz im Kanal');
    // Protokoll bleibt in der Regie
    const feld = r.element.querySelector<HTMLTextAreaElement>('[data-pruef="regie-protokoll-feld"]');
    assert.ok(feld);
    feld.value = 'Frage zur Reserve';
    (r.element.querySelector('[data-pruef="regie-protokoll-sichern"]') as HTMLElement).click();
    assert.match(r.element.querySelector('.regie-protokoll-liste')?.textContent ?? '', /Frage zur Reserve/u);
    assert.ok(!JSON.stringify(gesendet).includes('Frage zur Reserve'));
    // R67: „Protokoll löschen“ leert die Liste und entfernt den gespeicherten Stand der Regie
    assert.ok((sp.getItem('gk.regie') ?? '').includes('Frage zur Reserve'));
    // R69: der Kanal oben ist ein Stub ohne Speicher – den zuletzt gesendeten Bühnenstand hier selbst ablegen
    sp.setItem('mvg.kanal.regie', '{"x":1}');
    assert.equal(sp.getItem('mvg.kanal.regie'), '{"x":1}');
    (r.element.querySelector('[data-pruef="regie-protokoll-loeschen"]') as HTMLElement).click();
    assert.equal(sp.getItem('gk.regie'), null);
    assert.equal(sp.getItem('mvg.kanal.regie'), null);
    assert.doesNotMatch(r.element.querySelector('.regie-protokoll-liste')?.textContent ?? '', /Frage zur Reserve/u);
    // Theorie: Thema wählen, Notiz des Themas (falls vorhanden)
    const thema = r.element.querySelector<HTMLSelectElement>('[data-pruef="regie-thema"]');
    assert.ok(thema);
    thema.value = themaVon(4);
    thema.dispatchEvent(new Event('change'));
    assert.equal(gesendet.filter((n) => n.art === 'zustand').at(-1)?.art === 'zustand' && (gesendet.filter((n) => n.art === 'zustand').at(-1) as { zustand: { thema: string } }).zustand.thema, themaVon(4));
  } finally {
    r.entferne();
  }
});

test('Tafeln (P4, L-32): Schwellen-Spiel prüft gegen die Spalte der Tabelle', async () => {
  const { tafel } = await import('../src/grafik/tafel.ts');
  const wp = JSON.parse(readFileSync(join(WURZEL, 'quellen/whitepaper/v1.2/whitepaper.json'), 'utf8')) as unknown;
  const finde = (o: unknown, id: string): { kopf: string[]; zeilen: string[][] } | null => {
    if (o === null || typeof o !== 'object') return null;
    if ((o as { id?: string }).id === id) return o as { kopf: string[]; zeilen: string[][] };
    for (const v of Object.values(o)) { const f = finde(v, id); if (f !== null) return f; }
    return null;
  };
  // Schwelle: Spalte 0 = delegierbar, Spalte 1 = nicht delegierbar
  const t = finde(wp, 'k3.2-t1');
  assert.ok(t);
  const spalte = new Map<string, number>();
  for (const z of t.zeilen) z.forEach((zelle, i) => { if (zelle !== '') spalte.set(zelle, i); });
  const el = tafel({ form: 'schwelle', absatz: 'k3.2-t1', quelle: 'Q', kopf: t.kopf, zeilen: t.zeilen });
  const karten = [...el.querySelectorAll<HTMLElement>('.schwelle-karte')];
  assert.equal(karten.length, spalte.size);
  const folge = karten.map((k) => spalte.get(k.querySelector('p')?.textContent ?? ''));
  assert.ok(folge.every((x) => x !== undefined), 'jede Karte ist eine Zelle der Tabelle');
  assert.ok(folge.some((x, i) => i > 0 && x === folge[i - 1]), 'gemischt, nicht streng abwechselnd');
  karten.forEach((k, i) => {
    const soll = folge[i] as number;
    (k.querySelectorAll<HTMLButtonElement>('.schwelle-knopf')[1 - soll] as HTMLButtonElement).click();
    assert.equal(k.getAttribute('data-ergebnis'), 'falsch');
    (k.querySelectorAll<HTMLButtonElement>('.schwelle-knopf')[soll] as HTMLButtonElement).click();
    assert.equal(k.getAttribute('data-ergebnis'), 'richtig');
  });
  assert.match(el.querySelector('[data-pruef="schwelle-stand"]')?.textContent ?? '', new RegExp(`^${spalte.size} von ${spalte.size} richtig`, 'u'));
});

test('Tafel-Formen (P5.1): Phase hervorgehoben und vorgewählt', async () => {
  const { tafel } = await import('../src/grafik/tafel.ts');
  const kopf = ['LPH', 'Leistungsphase', 'Freigabefrage'];
  const zeilen = [['LPH 4', 'Genehmigungsplanung', 'Frage 4?'], ['LPH 5', 'Ausführungsplanung', 'Frage 5?']];
  const ph = tafel({ form: 'phasen', absatz: 'k9.3-t1', quelle: 'Q', kopf, zeilen, hervor: [2] });
  assert.equal(ph.querySelector('[aria-pressed="true"]')?.getAttribute('data-pruef'), 'phase-2');
  assert.match(ph.querySelector('.tafel-auswahl')?.textContent ?? '', /Frage 5\?/u);
});

test('Tafeln (T9): Phasen-Wahl wandert, Screenreader-Hinweis am hervorgehobenen Knopf; Rhythmus, Zeitachse, Karten', async () => {
  const { tafel } = await import('../src/grafik/tafel.ts');
  const kopf = ['LPH', 'Leistungsphase', 'Freigabefrage'];
  const zeilen = [['LPH 4', 'Genehmigungsplanung', 'Frage 4?'], ['LPH 5', 'Ausführungsplanung', 'Frage 5?']];
  const ph = tafel({ form: 'phasen', absatz: 'k9.3-t1', quelle: 'Q', kopf, zeilen, hervor: [2] });
  assert.match(ph.querySelector('[data-pruef="phase-2"] .nur-sr')?.textContent ?? '', /hier steht der Fall/u);
  assert.equal(ph.querySelector('[data-pruef="phase-1"] .nur-sr'), null);
  ph.querySelector<HTMLElement>('[data-pruef="phase-1"]')?.click();
  assert.equal(ph.querySelector('[aria-pressed="true"]')?.getAttribute('data-pruef'), 'phase-1');
  assert.match(ph.querySelector('.tafel-auswahl')?.textContent ?? '', /Frage 4\?/u);
  const rh = tafel({ form: 'rhythmus', absatz: 'k6.4.5-t1', quelle: 'Q', kopf: ['Rhythmus', 'Beteiligte', 'Fokus'], zeilen: [['täglich', 'PMO', 'Fristen'], ['wöchentlich', 'PS', 'Risiken']], hervor: [2] });
  assert.equal(rh.querySelector('[aria-pressed="true"]')?.getAttribute('data-pruef'), 'rhythmus-2');
  assert.match(rh.querySelector('.tafel-auswahl')?.textContent ?? '', /Risiken/u);
  const za = tafel({ form: 'zeitachse', absatz: 'k8.2-t1', quelle: 'Q', kopf: ['Zeitraum', 'Fokus'], zeilen: [['0–30 Tage', 'Diagnose'], ['31–60 Tage', 'Konzeption'], ['61–90 Tage', 'Anwendung']] });
  const regler = za.querySelector<HTMLInputElement>('[data-pruef="zeitachse-regler"]');
  assert.equal(regler?.max, '90');
  assert.equal(za.querySelector('[aria-pressed="true"]')?.getAttribute('data-pruef'), 'zeitachse-1');
  if (regler) { regler.value = '45'; regler.dispatchEvent(new Event('input')); }
  assert.equal(za.querySelector('[aria-pressed="true"]')?.getAttribute('data-pruef'), 'zeitachse-2');
  assert.match(za.querySelector('.tafel-auswahl')?.textContent ?? '', /Tag 45 · 31–60 Tage.*Konzeption/u);
  assert.equal(regler?.getAttribute('aria-valuetext'), 'Tag 45 · 31–60 Tage');
  za.querySelector<HTMLElement>('[data-pruef="zeitachse-3"]')?.click();
  assert.equal(regler?.value, '61');
  const ka = tafel({ form: 'karten', absatz: 'k6.4.2-t1', quelle: 'Q', kopf: ['Gruppe', 'Rolle', 'Turnus'], zeilen: [['Register', 'PL', 'laufend']] });
  assert.equal(ka.querySelectorAll('.tafel-karte').length, 1);
  assert.match(ka.querySelector('.tafel-karte')?.textContent ?? '', /Rolle.*PL.*Turnus.*laufend/u);
});

const lw = await import('../src/ui/bausteine/lernwerkzeuge.ts');
interface ProbeBlock { art: string, kennungen: string[], id: string | null, kopf: Record<string, string>, felder: Record<string, string>, liste: null, kinder: ProbeBlock[] }
const blk = (art: string, id: string | null, kopf: Record<string, string>, felder: Record<string, string>, kinder: ProbeBlock[] = []): ProbeBlock =>
  ({ art, kennungen: id === null ? [] : [id], id, kopf, felder, liste: null, kinder });

test('Lernwerkzeuge (P12.3): Etappen blättern per Klick und Pfeiltaste, Anfang ohne Ansage', () => {
  const b = blk('etappen', null, { titel: 'Weg' }, {}, [1, 2, 3].map((i) => blk('etappe', String(i), { titel: `T${i}` }, { text: `<p>Text ${i}</p>` })));
  const el = lw.etappen(b as never);
  document.body.replaceChildren(el);
  const detail = el.querySelector('[data-pruef="etappe-detail"]');
  assert.match(detail?.textContent ?? '', /Etappe 1 von 3.*T1.*Text 1/su);
  assert.equal(el.querySelector('.nur-sr')?.textContent, '');
  assert.ok(el.querySelector<HTMLButtonElement>('[data-pruef="etappe-zurueck"]')?.disabled);
  el.querySelector<HTMLButtonElement>('[data-pruef="etappe-weiter"]')?.click();
  assert.match(detail?.textContent ?? '', /Text 2/u);
  const dritte = el.querySelector<HTMLButtonElement>('[data-pruef="etappe-2"]');
  dritte?.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  assert.match(detail?.textContent ?? '', /Text 3/u);
  assert.equal(el.querySelector('[data-pruef="etappe-3"]')?.getAttribute('aria-pressed'), 'true');
  assert.equal(el.querySelectorAll('.lw-etappe.ist-erreicht').length, 3);
  assert.ok(el.querySelector<HTMLButtonElement>('[data-pruef="etappe-weiter"]')?.disabled);
  assert.match(el.querySelector('.nur-sr')?.textContent ?? '', /Etappe 3 von 3: T3/u);
});

test('Lernwerkzeuge (R71): Weiter bis zum Ende und Zurück bis zum Anfang – der Fokus fällt nie auf body', () => {
  const b = blk('etappen', null, { titel: 'Weg' }, {}, [1, 2, 3].map((i) => blk('etappe', String(i), { titel: `T${i}` }, { text: `<p>Text ${i}</p>` })));
  const el = lw.etappen(b as never);
  document.body.replaceChildren(el);
  const zurueck = el.querySelector<HTMLButtonElement>('[data-pruef="etappe-zurueck"]');
  const weiter = el.querySelector<HTMLButtonElement>('[data-pruef="etappe-weiter"]');
  assert.ok(zurueck && weiter);
  weiter.focus();
  weiter.click();
  assert.equal(document.activeElement, weiter, 'mitten im Weg bleibt der Fokus auf Weiter');
  weiter.click();
  assert.ok(weiter.disabled);
  assert.notEqual(document.activeElement, document.body);
  assert.equal(document.activeElement, zurueck, 'am Ende wandert der Fokus auf Zurück');
  zurueck.click();
  zurueck.click();
  assert.ok(zurueck.disabled);
  assert.notEqual(document.activeElement, document.body);
  assert.equal(document.activeElement, weiter, 'am Anfang wandert der Fokus auf Weiter');
});

test('Lernwerkzeuge (P12.3): Umschalter wechselt die Ansicht, Sortieren gibt Rückmeldung ohne Punkte, Regler zeigt die Stufe', () => {
  const u = lw.umschalter(blk('umschalter', null, { links: 'Ohne MVG', rechts: 'Mit MVG' }, {}, [blk('ansicht', 'links', {}, { text: '<p>A</p>' }), blk('ansicht', 'rechts', {}, { text: '<p>B</p>' })]) as never);
  document.body.replaceChildren(u);
  assert.equal(u.querySelector('[data-pruef="umschalter-ansicht"]')?.textContent, 'A');
  u.querySelector<HTMLButtonElement>('[data-pruef="umschalter-rechts"]')?.click();
  assert.equal(u.querySelector('[data-pruef="umschalter-ansicht"]')?.textContent, 'B');
  assert.equal(u.querySelector('[data-pruef="umschalter-rechts"]')?.getAttribute('aria-pressed'), 'true');

  const s = lw.sortieren(blk('sortieren', null, { links: 'Delegierbar', rechts: 'Beim Bauherrn' }, {}, [
    blk('posten', '1', { seite: 'links' }, { text: '<p>Berichte</p>' }),
    blk('posten', '2', { seite: 'rechts' }, { text: '<p>Risikoannahme</p>', erklaerung: '<p>Weil.</p>' }),
  ]) as never);
  document.body.replaceChildren(s);
  s.querySelector<HTMLButtonElement>('[data-pruef="posten-2-links"]')?.click();
  assert.match(s.querySelector('[data-pruef="posten-rueck-2"]')?.textContent ?? '', /Gehört zu: Beim Bauherrn\. Weil\./u);
  assert.match(s.querySelector('[data-pruef="sortieren-stand"]')?.textContent ?? '', /1 von 2/u);
  s.querySelector<HTMLButtonElement>('[data-pruef="sortieren-aufloesen"]')?.click();
  assert.match(s.querySelector('[data-pruef="posten-rueck-1"]')?.textContent ?? '', /Passt\./u);
  assert.doesNotMatch(s.textContent ?? '', /Punkt|richtig von/u);

  const r = lw.regler(blk('regler', null, { titel: 'Wer entscheidet?' }, {}, [
    blk('stufe', '1', { titel: 'bis 100 TEUR', marke: 'Bauherren-PL' }, { text: '<p>eins</p>' }),
    blk('stufe', '2', { titel: 'bis 5 Mio. €', marke: 'Änderungsgremium' }, { text: '<p>zwei</p>' }),
  ]) as never);
  document.body.replaceChildren(r);
  const ein = r.querySelector<HTMLInputElement>('[data-pruef="regler"]');
  assert.match(r.querySelector('[data-pruef="regler-karte"]')?.textContent ?? '', /Bauherren-PL/u);
  if (ein) { ein.value = '2'; ein.dispatchEvent(new dom.window.Event('input')); }
  assert.match(r.querySelector('[data-pruef="regler-karte"]')?.textContent ?? '', /Änderungsgremium.*zwei/su);
  assert.equal(ein?.getAttribute('aria-valuetext'), 'bis 5 Mio. €');
});

test('Lernwerkzeuge aufgelöst (P12.5 R5): Leinwand und Druck zeigen den ganzen Inhalt ohne Bedienelemente', () => {
  const et = lw.etappen(blk('etappen', null, { titel: 'Weg' }, {}, [1, 2].map((i) => blk('etappe', String(i), { titel: `T${i}` }, { text: `<p>Text ${i}</p>` }))) as never, 'h3', false);
  const um = lw.umschalter(blk('umschalter', null, { links: 'Ohne', rechts: 'Mit' }, {}, [blk('ansicht', 'links', {}, { text: '<p>A</p>' }), blk('ansicht', 'rechts', {}, { text: '<p>B</p>' })]) as never, 'h3', false);
  const so = lw.sortieren(blk('sortieren', null, { links: 'L', rechts: 'R' }, {}, [blk('posten', '1', { seite: 'rechts' }, { text: '<p>X</p>' }), blk('posten', '2', { seite: 'links' }, { text: '<p>Y</p>' })]) as never, 'h3', false);
  const re = lw.regler(blk('regler', null, {}, {}, [blk('stufe', '1', { titel: 'S1' }, { text: '<p>eins</p>' }), blk('stufe', '2', { titel: 'S2' }, { text: '<p>zwei</p>' })]) as never, 'h3', false);
  for (const el of [et, um, so, re]) {
    assert.equal(el.querySelectorAll('button, input').length, 0, `${el.className}: Bedienelemente`);
    assert.ok(el.classList.contains('ist-aufgeloest'));
  }
  assert.match(et.textContent ?? '', /Text 1.*Text 2/su);
  assert.match(um.textContent ?? '', /A.*B/su);
  assert.match(so.querySelector('.lw-seite-rechts')?.textContent ?? '', /X/u);
  assert.match(so.querySelector('.lw-seite-links')?.textContent ?? '', /Y/u);
  assert.match(re.textContent ?? '', /eins.*zwei/su);
  // die Lernseite auf der Leinwand (nicht bedienbar) baut sie aufgelöst
  const k7 = baueTheorie({ inhalte, thema: themaVon(7), version: VERSION, bedienbar: false });
  assert.ok(k7.querySelectorAll('.lernwerkzeug').length > 0);
  assert.equal(k7.querySelectorAll('.lernwerkzeug:not(.ist-aufgeloest)').length, 0);
});

test('Wissenscheck: die passende Antwort steht nicht in jedem Check an derselben Stelle', () => {
  const stellen: number[] = [];
  for (const k of themen(inhalte).map((t) => ({ nr: t.kapitel }))) {
    const seite = baueTheorie({ inhalte, thema: themaVon(k.nr), version: VERSION, bedienbar: true });
    for (const wc of seite.querySelectorAll('.wissenscheck')) {
      const knoepfe = [...wc.querySelectorAll('.wc-antwort')].map((b) => b.getAttribute('data-pruef'));
      stellen.push(knoepfe.indexOf('wc-antwort-a'));
    }
  }
  assert.ok(stellen.length >= 7, `${stellen.length} Wissenschecks`); // P17.11: halbiert (O-55)
  assert.ok(!stellen.includes(-1));
  assert.ok(new Set(stellen).size >= 2, `alle an Stelle ${stellen[0]}`);
});

test('Wissenschecks (P11.6, P17.11): genau die verbliebenen Themen haben einen; Wahl zeigt Rückmeldung, Erklärung und Beleg – ohne Punkte', () => {
  for (const nr of [4, 5, 6, 9, 14, 15, 16]) {
    const seite = baueTheorie({ inhalte, thema: themaVon(nr), version: VERSION, bedienbar: true });
    assert.equal(seite.querySelectorAll('[data-pruef="wissenscheck"]').length, 1, `Kap. ${nr}`);
  }
  const seite = baueTheorie({ inhalte, thema: themaVon(4), version: VERSION, bedienbar: true });
  document.body.replaceChildren(seite);
  const wc = seite.querySelector('[data-pruef="wissenscheck"]');
  assert.ok(wc);
  const knoepfe = [...wc.querySelectorAll<HTMLButtonElement>('.wc-antwort')];
  assert.ok(knoepfe.length >= 2);
  assert.equal(wc.querySelector('[data-pruef="wc-ergebnis"]')?.textContent, '', 'vor der Wahl keine Rückmeldung');
  knoepfe[0]?.click();
  assert.equal(knoepfe[0]?.getAttribute('aria-pressed'), 'true');
  const ergebnis = wc.querySelector('[data-pruef="wc-ergebnis"]');
  assert.match(ergebnis?.textContent ?? '', /^(Genau:|Nicht ganz:)/u);
  assert.ok(ergebnis?.querySelector('[data-pruef="zitat"]'), 'Beleg sichtbar');
  assert.doesNotMatch(wc.textContent ?? '', /Punkt(e|zahl)|\d+\s*\/\s*\d+ richtig/u, 'keine Punkte');
  knoepfe[1]?.click();
  assert.equal(knoepfe[0]?.getAttribute('aria-pressed'), 'false');
});

test('Druck und Leinwand (R48): jede Tafel zeigt alle Zellen ihrer Tabelle – auch Formen mit Auswahl (aufgelöst)', () => {
  const norm = (t: string): string => t.replace(/[\u00ad\u200b\u2060]/gu, '').replace(/\s+/gu, ' ').trim();
  // gegen die Anzeigefassung (L-66, L-208: Satzfehler der Quelle berichtigt)
  const wp = anzeigeFassung(JSON.parse(readFileSync(join(WURZEL, 'quellen/whitepaper/v1.2/whitepaper.json'), 'utf8')) as unknown);
  const finde = (o: unknown, id: string): { zeilen: string[][] } | null => {
    if (o === null || typeof o !== 'object') return null;
    if ((o as { id?: string }).id === id && Array.isArray((o as { zeilen?: unknown }).zeilen)) return o as { zeilen: string[][] };
    for (const v of Object.values(o)) { const f = finde(v, id); if (f !== null) return f; }
    return null;
  };
  const fehlt: string[] = [];
  let tafeln = 0;
  for (const t of themen(inhalte)) {
    const seite = themaFuerDruck(inhalte, t.thema, VERSION);
    for (const fig of seite.querySelectorAll<HTMLElement>('figure.tafel[data-absatz]')) {
      const id = fig.getAttribute('data-absatz') ?? '';
      const tabelle = finde(wp, id);
      if (tabelle === null) continue;
      tafeln++;
      const text = norm(fig.textContent ?? '');
      for (const zelle of tabelle.zeilen.flat().map(norm)) if (zelle !== '' && !text.includes(zelle)) fehlt.push(`${t.thema} ${id} (${fig.getAttribute('data-form')}): „${zelle.slice(0, 40)}“`);
    }
  }
  assert.ok(tafeln >= 10, `Tafeln mit Tabelle: ${tafeln}`);
  assert.deepEqual(fehlt.slice(0, 8), [], `${fehlt.length} Zellen fehlen`);
  const k4 = baueTheorie({ inhalte, thema: themaVon(4), version: VERSION, bedienbar: true });
  assert.ok(k4.querySelector('[data-pruef="felder-ordnung"]') && !k4.querySelector('[data-pruef="tafel-aufgeloest"]'));
});
test('Tafeltitel (P12.5 R12/R13): nach „/“ darf umgebrochen werden (<wbr>), der Text bleibt wortgleich', () => {
  let gefunden = 0;
  for (const k of themen(inhalte).map((t) => ({ nr: t.kapitel }))) {
    const seite = baueTheorie({ inhalte, thema: themaVon(k.nr), version: VERSION, bedienbar: false });
    for (const t of seite.querySelectorAll('.tafel-titel')) {
      const text = t.textContent ?? '';
      const striche = (text.match(/\//gu) ?? []).length;
      if (striche === 0) continue;
      gefunden += 1;
      assert.equal(t.querySelectorAll('wbr').length, striche, `„${text}“: ein <wbr> je „/“`);
      assert.ok(!/\u200b/u.test(text), 'kein unsichtbares Zeichen im Text');
    }
  }
  assert.ok(gefunden > 0, 'mindestens ein Tafeltitel mit „/“ (Kap. 8: Risiko-/Änderungs-/Maßnahmenverknüpfung)');
});

test('Lernseite (P6.1): Tafel, Merksatz und Ebenen 1–4 werden auf Seiten- und Abschnittsebene gezeichnet', () => {
  const eintrag = Object.entries(inhalte.theorie).find(([, s]) => s.kapitel === 1);
  assert.ok(eintrag);
  const tafel = { art: 'tafel', kennungen: ['k2.5-t1'], id: 'k2.5-t1', kopf: { form: 'karten', tabelle: { kopf: ['Gruppe', 'Rolle'], zeilen: [['g', 'r']] }, hervor: [] }, felder: {}, liste: null, kinder: [] };
  const ebenen = { art: 'ebenen', kennungen: [], id: null, kopf: {}, felder: {}, liste: null, kinder: [], ebenen: [1, 2, 3, 4].map((nr) => ({ nr, titel: `E${nr}`, felder: { text: `<p>Text ${nr}</p>` }, bloecke: [] })) };
  const abschnitt = { art: 'abschnitt', kennungen: ['k1.1'], id: 'k1.1', kopf: { titel: 'Probe' }, felder: {}, liste: null, kinder: [{ art: 'merksatz', kennungen: [], id: null, kopf: {}, felder: { text: '<p>Merke</p>' }, liste: null, kinder: [] }] };
  const probe = { ...inhalte, theorie: { ...inhalte.theorie, [eintrag[0]]: { ...eintrag[1], bloecke: [tafel, abschnitt, ebenen] } } } as unknown as typeof inhalte;
  const el = baueTheorie({ inhalte: probe, thema: themaVon(1), version: VERSION, bedienbar: true });
  assert.ok(el.querySelector('[data-pruef="tafel-karten"]'), 'Tafel auf Seitenebene');
  assert.equal(el.querySelector('.tafel-titel')?.tagName, 'H2', 'Tafeltitel auf Seitenebene folgt der Gliederung (h1 → h2)');
  assert.match(el.querySelector('.lern-abschnitt .lehre')?.textContent ?? '', /Merke/u, 'Merksatz im Abschnitt');
  const e = [...el.querySelectorAll('[data-pruef^="lern-ebene-"]')];
  assert.equal(e.length, 4);
  assert.equal(e[0]?.hasAttribute('open'), true);
  assert.equal(e[3]?.hasAttribute('open'), false);
});

test('Leinwand (R69): Strg+P druckt den Ersatzbogen ohne Regie-Hinweis; die Seite behält ihn', async () => {
  const { ersatzBogenFuerLeinwand, ersatzDruck } = await import('../src/ui/druck.ts');
  const regieWeg = W.druck.ersatzWege.find((x) => x.startsWith('Präsentieren'));
  assert.ok(regieWeg, 'die Seite nennt den Druckweg der Regie');
  const text = (teile: Node[]): string => teile.map((t) => t.textContent ?? '').join(' ');
  assert.ok(text(ersatzDruck(VERSION).teile).includes(regieWeg), 'Seite: mit Regie-Weg');
  ersatzBogenFuerLeinwand(VERSION);
  document.body.replaceChildren();
  window.dispatchEvent(new Event('beforeprint'));
  const bogen = document.querySelector('.druck-bogen');
  assert.ok(bogen, 'Ersatzbogen angehängt');
  const inhalt = bogen.textContent ?? '';
  assert.ok(inhalt.includes(W.druck.ersatzTitel), inhalt);
  assert.ok(inhalt.includes(W.druck.ersatzWege[0] ?? 'x'), 'der Theorie-Weg bleibt');
  assert.doesNotMatch(inhalt, /Regie/u);
  window.dispatchEvent(new Event('afterprint'));
  assert.equal(document.querySelector('.druck-bogen'), null, 'nach dem Druck abgebaut');
});
