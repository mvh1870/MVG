// Bauart der Oberfläche (P0.6): Schutz der Regie-Notizen durch Konstruktion, Flächen im DOM (jsdom).
//
// 1. Statisch: Kein Modul unter src/ außer main.ts liest das Regie-Material (regieFuer/regieInhalte)
//    oder die Inhalte-Datei selbst; der transitive Importgraph der Leinwand (auch dynamische Importe)
//    erreicht beides nicht; `inhalte` trägt auf Datenebene kein Regie-Material (Positivliste).
// 2. DOM: Startseite (genau zwei Wege, keine Instrumente), Theorie (13 Kapitel, Kapitel 1 mit
//    Originaltext und Absatz-IDs), Story (Prolog → A3 über den Express-Pfad → Option B → Konsequenz, L-4-Attribute),
//    Leinwand-Anzeige (nicht bedienbar, ohne Notiz), Regie (Notiz, Kanal sendet nur Öffentliches).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
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
  // Alle Module unter src/ (auch engine, regie, stil, inhalte) – nicht nur die Zeichnung.
  const module = dateien(join(WURZEL, 'src')).filter((p) => p.endsWith('.ts') && !rel(p).startsWith('src/generiert/'));
  assert.ok(module.length > 30);
  const ausnahmen = new Set(['src/main.ts', 'src/inhalte/index.ts']);
  for (const p of module) {
    if (ausnahmen.has(rel(p))) continue;
    const text = readFileSync(p, 'utf8');
    const ziele = modulAngaben(text).angaben.filter((a) => a.startsWith('.')).map((a) => rel(resolve(dirname(p), a)));
    assert.ok(!ziele.includes('src/inhalte/index.ts'), `${rel(p)} importiert die Inhalte direkt`);
    assert.ok(!ziele.includes('src/generiert/inhalte.json'), `${rel(p)} importiert die Inhalte-Datei`);
    assert.doesNotMatch(text, /regieInhalte/, `${rel(p)} nennt regieInhalte`);
    // Die Regie bekommt regieFuer als Parameter von main.ts – nur dort darf der Name stehen.
    if (rel(p) !== 'src/regie/regie.ts') assert.doesNotMatch(text, /regieFuer/, `${rel(p)} nennt regieFuer`);
  }
  const main = readFileSync(join(WURZEL, 'src/main.ts'), 'utf8');
  assert.match(main, /import \{ inhalte, regieFuer \} from '\.\/inhalte\/index\.ts'/);
});

test('Leinwand: der ganze Importgraph (transitiv, auch dynamisch) enthält weder Inhalte-Datei noch Regie', () => {
  const graph = importGraph(join(WURZEL, 'src/regie/leinwand.ts'));
  const erreicht = [...graph.keys()].map(rel);
  // Gegenprobe, dass der Graph wirklich über die Zeichnung hinausreicht.
  for (const erwartet of ['src/ui/flaechen/story.ts', 'src/engine/zustand.ts', 'src/regie/kanal.ts', 'src/stil/symbole.ts']) {
    assert.ok(erreicht.includes(erwartet), `Graph erreicht ${erwartet} nicht: ${erreicht.join(', ')}`);
  }
  for (const verboten of ['src/inhalte/index.ts', 'src/generiert/inhalte.json', 'src/regie/regie.ts', 'src/main.ts']) {
    assert.ok(!erreicht.includes(verboten), `die Leinwand erreicht ${verboten}`);
  }
  for (const datei of graph.keys()) {
    if (!datei.endsWith('.ts')) continue;
    assert.doesNotMatch(readFileSync(datei, 'utf8'), /regieFuer|regieInhalte/, `${rel(datei)} (im Graph der Leinwand) nennt Regie-Zugriffe`);
  }
  // Selbstprobe der Erkennung: statisch, Re-Export, Seiteneffekt, dynamisch.
  const probe = modulAngaben(`import { a } from './x.ts';\nexport * from "./y.ts";\nimport './z.css';\nconst m = await import('../inhalte/index.ts');\nimport(\`./\${n}.ts\`);`);
  assert.deepEqual(probe.angaben, ['./x.ts', './y.ts', './z.css', '../inhalte/index.ts']);
  assert.equal(probe.unaufloesbar, 1);
});

test('Datenebene: `inhalte` enthält kein Regie-Material, die Schlüssel stehen auf einer Positivliste', async () => {
  // Eigener Import: dieser Test läuft vor der jsdom-Einrichtung weiter unten.
  const { inhalte, regieFuer } = await import('../src/inhalte/index.ts');
  assert.equal('regie' in inhalte, false);
  assert.deepEqual(Object.keys(inhalte).sort(), [
    'abdeckung', 'einwaende', 'fall', 'glossar', 'interessen', 'quellen', 'rollen', 'rollenFolge', 'start', 'startseite', 'stationen', 'stationsFolge', 'theorie', 'version', 'whitepaper',
  ]);
  // Kein Regie-Text steckt irgendwo sonst in den öffentlichen Inhalten.
  const oeffentlichText = JSON.stringify(inhalte);
  const a3 = regieFuer('A3', 'pl');
  assert.ok(a3.szene?.notiz);
  assert.ok(!oeffentlichText.includes(a3.szene.notiz.slice(0, 60)));
  for (const f of a3.szene.leitfragen) assert.ok(!oeffentlichText.includes(f), f);
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

const { inhalte, regieFuer } = await import('../src/inhalte/index.ts');
const { anfangszustand, oeffentlich } = await import('../src/engine/zustand.ts');
const { erzeugeSitzung } = await import('../src/ui/sitzung.ts');
const { erzeugeStory } = await import('../src/ui/flaechen/story.ts');
const { baueStart } = await import('../src/ui/flaechen/start.ts');
const { baueTheorie, kapitelListe } = await import('../src/ui/flaechen/theorie.ts');
const { erzeugeAnzeige } = await import('../src/regie/leinwand.ts');
const { erzeugeRegie } = await import('../src/regie/regie.ts');
type KanalNachricht = import('../src/regie/kanal.ts').KanalNachricht;

const VERSION = 'Whitepaper V1.2 · Story 0.1';
const pause = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const klartext = (html: string): string => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

test('Startseite: genau zwei Wege, leiser Fuß mit Version und Vermerk, keine Instrumente', () => {
  const s = baueStart({ startseite: inhalte.startseite, kapitelAnzahl: 13, rollenAnzahl: 6, weiterlesen: false, fassung: 'V1.2', version: VERSION, bedienbar: true });
  const wege = [...s.querySelectorAll('[data-pruef^="weg-"]')].map((a) => [a.getAttribute('data-pruef'), a.getAttribute('href')]);
  assert.deepEqual(wege, [['weg-theorie', '#theorie'], ['weg-story', '#story']]);
  assert.equal(s.querySelector('[data-pruef="status"]'), null);
  assert.equal(s.querySelector('[data-pruef="praesentieren"]')?.getAttribute('href'), '#regie');
  assert.equal(s.querySelector('[data-pruef="version"]')?.textContent, VERSION);
  assert.equal(s.querySelector('[data-pruef="ungeprueft"]')?.textContent, 'fachlich ungeprüft');
  // Leitsatz aus inhalte/start.md, wörtlich nach k1-p1 (kein Fachtext im Code, O-17/O-18)
  assert.equal(inhalte.startseite?.titelQuelle, 'k1-p1');
  assert.equal(s.querySelector('[data-pruef="start-titel"]')?.textContent, inhalte.startseite?.titel);
  assert.match(inhalte.startseite?.titel ?? '', /bauherrenseitige Legitimation nicht/);
  const weiter = baueStart({ startseite: inhalte.startseite, kapitelAnzahl: 13, rollenAnzahl: 6, weiterlesen: true, fassung: 'V1.2', version: VERSION, bedienbar: true });
  assert.match(weiter.querySelector('[data-pruef="weg-story"]')?.textContent ?? '', /Weiterlesen/);
  const anzeige = baueStart({ startseite: inhalte.startseite, kapitelAnzahl: 13, rollenAnzahl: 6, weiterlesen: false, fassung: 'V1.2', version: VERSION, bedienbar: false });
  assert.equal(anzeige.querySelectorAll('a').length, 0, 'auf der Leinwand keine Verweise');
});

test('Theorie: 13 Kapitel mit Titeln; Kapitel 1 mit Kernaussage, Karten, Originaltext, Querverweis (Kap. 2: A3, B3)', () => {
  const kap = kapitelListe(inhalte);
  assert.equal(kap.length, 13);
  assert.ok(kap.every((k) => k.titel.length > 0));
  const liste = baueTheorie({ inhalte, kapitel: null, version: VERSION, bedienbar: true });
  assert.equal(liste.querySelectorAll('[data-pruef="kapitel-liste"] > li').length, 13);
  assert.equal(liste.querySelector('[data-pruef="kapitel-1"]')?.getAttribute('href'), '#theorie/k1');
  assert.equal(liste.querySelector('[data-pruef="leitstand"]'), null);

  const k1 = baueTheorie({ inhalte, kapitel: 1, version: VERSION, bedienbar: true });
  assert.ok(k1.querySelector('[data-pruef="kernaussage"]'));
  assert.ok(k1.querySelectorAll('[data-pruef="lernkarte"]').length >= 5 + 6);
  const original = inhalte.theorie['k01']?.bloecke.find((b) => b.art === 'original');
  assert.ok(original);
  const ids = [...k1.querySelectorAll('[data-pruef="originaltext"] .absatz')].map((a) => a.getAttribute('data-absatz'));
  assert.deepEqual(ids, original.kopf['absaetze']);
  // wörtlich: jeder Absatz steht mit seinem Text im Originaltext
  const text = k1.querySelector('[data-pruef="originaltext"]')?.textContent?.replace(/\s+/g, ' ') ?? '';
  for (const absatz of (original.felder['text'] ?? '').split(/(?=<(?:p|ul|table|h4) class="mvg-original)/)) {
    const soll = klartext(absatz);
    if (soll !== '') assert.ok(text.includes(soll.slice(0, 80)), soll.slice(0, 40));
  }
  // Gliederung des Whitepapers (O-20): die Unterabschnitte 1.1–1.3 stehen als Überschrift vor ihren Absätzen.
  const titel = [...k1.querySelectorAll('[data-pruef="originaltext"] .original-abschnitt')].map((x) => x.textContent);
  const soll = (inhalte.whitepaper.kapitel.find((k) => k.nr === '1')?.abschnitte ?? []).map((a) => `${a.nr} ${a.titel}`);
  assert.ok(soll.length >= 3);
  assert.deepEqual(titel, soll);
  const reihe = [...k1.querySelectorAll('[data-pruef="originaltext"] > .original-abschnitt, [data-pruef="originaltext"] > .absatz')]
    .map((x) => x.getAttribute('data-abschnitt') ?? x.getAttribute('data-absatz'));
  assert.equal(reihe[reihe.indexOf('k1.1') + 1], 'k1.1-p1', 'Überschrift direkt vor ihrem ersten Absatz');
  // Kap. 1 verweist auf den Prolog (DREHBUCH §5); A3/B3 stehen bei Kap. 2
  assert.ok(k1.querySelector('[data-pruef="querverweis-prolog"]'));
  const k2 = baueTheorie({ inhalte, kapitel: 2, version: VERSION, bedienbar: true });
  assert.ok(k2.querySelector('[data-pruef="querverweis-A3"]'));
  assert.ok(k2.querySelector('[data-pruef="querverweis-B3"]'));
  // Ein Kapitel ohne Lernseite zeigt „folgt“ – geprüft an einer Kopie ohne die Seite von Kapitel 5
  const ohneK5 = { ...inhalte, theorie: Object.fromEntries(Object.entries(inhalte.theorie).filter(([, t]) => t.kapitel !== 5)) } as typeof inhalte;
  const k5 = baueTheorie({ inhalte: ohneK5, kapitel: 5, version: VERSION, bedienbar: true });
  assert.ok(k5.querySelector('[data-pruef="folgt"]'));
});

test('Story: Prolog → A3 → Option B → Konsequenz, schrittweiser Aufbau am Rahmen', async () => {
  const sitzung = erzeugeSitzung(anfangszustand(), inhalte, { speicher: null });
  const story = erzeugeStory({ inhalte, tue: (a) => sitzung.tue(a) });
  sitzung.abonniere((neu, _alt, aktion) => story.setze(oeffentlich(neu), aktion));
  document.body.replaceChildren(story.element);
  const el = story.element;
  const klick = (sel: string): void => {
    const b = el.querySelector<HTMLElement>(sel);
    assert.ok(b, `fehlt: ${sel}`);
    b.click();
  };
  try {
    sitzung.tue({ art: 'starteStory' });
    assert.ok(el.querySelector('.prolog'));
    assert.match(el.querySelector('[data-pruef="fiktiv"]')?.textContent ?? '', /Fiktiver Fall/);
    assert.equal(el.hasAttribute('data-instrumente'), false);
    assert.equal(el.hasAttribute('data-karte'), false);
    assert.equal(el.getAttribute('data-seitenleiste'), 'zu');
    klick('[data-pruef="weiter"]');
    assert.equal(el.querySelectorAll('.rollen-karte').length, 6);
    assert.equal(el.querySelectorAll('.rollen-karte:disabled').length, 0, 'alle sechs Rollen spielbar (P2.5)');
    klick('[data-pruef="rolle-pl"]');
    await pause(600);
    assert.ok(el.querySelector('[data-pruef^="interesse-"]'), 'nach der Rollenwahl die Interessen');
    // Express-Pfad (E8, L-26): Prolog → A3
    klick('[data-pruef="interesse-express"]');
    klick('[data-pruef="weiter"]');
    assert.equal(sitzung.zustand().station, 'A3');
    assert.ok(el.querySelector('.mail'));
    assert.equal(el.hasAttribute('data-karte'), false, 'Einstieg ohne Karte');
    klick('[data-pruef="weiter"]');
    assert.equal(el.hasAttribute('data-karte'), true, 'nach dem Einstieg mit Karte');
    // LPH-Band (O-14, P2.2): zehn Phasen aus k9.3-t1, A3 steht in LPH 5, davor abgeschlossen
    const band = el.querySelector('[data-pruef="lph-band"]');
    assert.ok(band !== null && !(band as HTMLElement).hidden, 'LPH-Band sichtbar');
    assert.equal(band.querySelectorAll('.lph').length, 10);
    assert.equal(band.querySelector('[aria-current="step"]')?.getAttribute('data-lph'), '5');
    assert.equal(band.querySelectorAll('.lph.ist-erledigt').length, 5);
    assert.match(band.querySelector('[data-lph="5"]')?.textContent ?? '', /LPH 5 Ausführungsplanung \(aktuell\)/);
    assert.doesNotMatch(band.textContent ?? '', /G\d/, 'nie G0–G5');
    klick('[data-pruef="info-anfordern"]');
    assert.ok(el.querySelector('.ungeklaert .ist-geloest'));
    klick('[data-pruef="weiter"]');
    assert.equal(el.hasAttribute('data-instrumente'), true, 'Instrumente ab der Entscheidung');
    // Taste B wählt; ohne Wahl ging es nicht weiter
    klick('[data-pruef="weiter"]');
    assert.ok(el.querySelector('[data-pruef="option-B"]'), 'ohne Wahl kein Weiter');
    const taste = new dom.window.KeyboardEvent('keydown', { key: 'b', bubbles: true });
    assert.equal(story.taste(taste), true);
    assert.equal(el.querySelector('[data-pruef="option-B"]')?.getAttribute('aria-pressed'), 'true');
    await pause(700);
    assert.ok(el.querySelector('[data-pruef="konsequenz"]'), 'nach der Wahl die Konsequenz');
    for (const f of ['konsequenz', 'fehlt', 'risiko', 'governance']) assert.ok(el.querySelector(`[data-pruef="feld-${f}"]`), f);
    // ← zurück, → wieder vor
    assert.equal(story.taste(new dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft' })), true);
    assert.ok(el.querySelector('[data-pruef="option-B"]'));
    assert.equal(story.taste(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight' })), true);
    assert.ok(el.querySelector('[data-pruef="konsequenz"]'));
  } finally {
    story.entferne();
  }
});

test('Leitstand: Sprunglink, Reiter nach dem Tabs-Muster, modale Rollen-Linse, Glossar-Hinweis (Maus, Esc)', async () => {
  // Der Hinweis hängt an body (wie in der App): erst leeren, dann den Leitstand anhängen.
  document.body.replaceChildren();
  const sitzung = erzeugeSitzung(anfangszustand(), inhalte, { speicher: null });
  const story = erzeugeStory({ inhalte, tue: (a) => sitzung.tue(a) });
  sitzung.abonniere((neu, _alt, aktion) => story.setze(oeffentlich(neu), aktion));
  document.body.append(story.element);
  const el = story.element;
  try {
    for (const a of [{ art: 'starteStory' }, { art: 'weiter' }, { art: 'waehleRolle', rolle: 'pl' }, { art: 'setzeInteressen', interessen: ['express'] as string[] }, { art: 'weiter' }, { art: 'weiter' }, { art: 'weiter' }] as const) sitzung.tue(a);
    assert.equal(sitzung.zustand().station, 'A3');

    // Sprunglink: erstes Element, setzt den Fokus auf den Tafeltitel, ohne den Hash (Router) zu ändern
    const sprung = el.firstElementChild as HTMLElement | null;
    assert.equal(sprung?.getAttribute('data-pruef'), 'sprunglink');
    const hashVorher = dom.window.location.hash;
    sprung?.click();
    assert.equal(document.activeElement, el.querySelector('.tafel-titel'));
    assert.equal(dom.window.location.hash, hashVorher);

    // Reiter (WAI-ARIA „Tabs“): aria-controls, aria-labelledby, wandernder tabindex, ← → wechseln
    el.querySelector<HTMLElement>('[data-pruef="seitenleiste-raum"]')?.click();
    const reiter = [...el.querySelectorAll<HTMLElement>('[role="tab"]')];
    const panel = el.querySelector('[role="tabpanel"]');
    assert.equal(reiter.length, 5, 'Raum, Ebenen, Glossar, Quellen, Spur (L-41)');
    assert.ok(panel?.id);
    for (const r of reiter) assert.equal(r.getAttribute('aria-controls'), panel.id);
    assert.deepEqual(reiter.map((r) => r.tabIndex), [0, -1, -1, -1, -1]);
    assert.equal(panel.getAttribute('aria-labelledby'), reiter[0]?.id);
    const schritt = sitzung.zustand().schritt;
    const rechts = new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    reiter[0]?.dispatchEvent(rechts);
    assert.equal(rechts.defaultPrevented, true, 'der Pfeil gehört dem Reiter, nicht der Story');
    assert.deepEqual(reiter.map((r) => r.getAttribute('aria-selected')), ['false', 'true', 'false', 'false', 'false']);
    assert.deepEqual(reiter.map((r) => r.tabIndex), [-1, 0, -1, -1, -1]);
    assert.equal(panel.getAttribute('aria-labelledby'), reiter[1]?.id);
    assert.equal(sitzung.zustand().schritt, schritt);

    // Glossar-Hinweis: bleibt offen, wenn der Zeiger vom Begriff über den Spalt in den Hinweis fährt
    await pause(300);
    const begriff = el.querySelector<HTMLElement>('.lagetafel [data-pruef="glossar-begriff"]');
    assert.ok(begriff, 'Lagebild ohne Glossar-Begriff');
    const tipp = document.querySelector<HTMLElement>('.tipp[role="tooltip"]');
    assert.ok(tipp);
    const maus = (ziel: EventTarget, art: string): void => {
      ziel.dispatchEvent(new dom.window.MouseEvent(art, { bubbles: art === 'mouseover' }));
    };
    maus(begriff, 'mouseover');
    assert.equal(tipp.hidden, false);
    maus(begriff.parentElement ?? el, 'mouseover');
    maus(tipp, 'mouseenter');
    await pause(400);
    assert.equal(tipp.hidden, false, 'Hinweis schließt, obwohl der Zeiger darauf steht');
    maus(tipp, 'mouseleave');
    await pause(400);
    assert.equal(tipp.hidden, true);
    // Esc schließt genau eine Ebene: erst den Hinweis (und verbraucht die Taste), die Seitenleiste bleibt
    maus(begriff, 'mouseover');
    const esc = new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    begriff.dispatchEvent(esc);
    assert.equal(tipp.hidden, true);
    assert.equal(esc.defaultPrevented, true, 'main.ts reicht eine verbrauchte Taste nicht an die Story weiter');
    assert.equal(el.getAttribute('data-seitenleiste'), 'offen');

    // Touch (P2.3): Antippen öffnet, erneutes Antippen schließt; ein Tipp daneben schließt auch
    // Echte Ereignisfolge beim Antippen: pointerdown (touch) → mouseover → focusin → click
    const tippe = (ziel: Element): void => {
      const druck = new dom.window.MouseEvent('pointerdown', { bubbles: true });
      Object.defineProperty(druck, 'pointerType', { value: 'touch' });
      ziel.dispatchEvent(druck);
      ziel.dispatchEvent(new dom.window.MouseEvent('mouseover', { bubbles: true }));
      if (ziel instanceof dom.window.HTMLElement && ziel.matches('[data-pruef="glossar-begriff"]')) ziel.dispatchEvent(new dom.window.FocusEvent('focusin', { bubbles: true }));
      ziel.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
    };
    tippe(begriff);
    assert.equal(tipp.hidden, false, 'Antippen öffnet');
    tippe(tipp);
    assert.equal(tipp.hidden, false, 'Tipp in den Hinweis lässt ihn offen');
    tippe(begriff);
    assert.equal(tipp.hidden, true, 'erneutes Antippen schließt');
    tippe(begriff);
    tippe(el.querySelector('.tafel-kopf') ?? el);
    assert.equal(tipp.hidden, true, 'Tipp daneben schließt');

    // Tastatur: Fokus öffnet; die Definition ist wörtlich die des Glossars (V1.2)
    begriff.dispatchEvent(new dom.window.FocusEvent('focusin', { bubbles: true }));
    assert.equal(tipp.hidden, false, 'Fokus öffnet den Hinweis');
    const { inhalte: alle } = await import('../src/inhalte/index.ts');
    const g = alle.glossar[begriff.getAttribute('data-glossar') ?? ''];
    assert.ok(g !== undefined);
    assert.ok((tipp.textContent ?? '').includes(g.definition), 'Definition wörtlich aus dem Glossar');
    const wp = JSON.parse(readFileSync(join(WURZEL, 'quellen/whitepaper/v1.2/whitepaper.json'), 'utf8')) as { glossar: { id: string; definition: string }[] };
    assert.equal(wp.glossar.find((x) => x.id === g.id)?.definition, g.definition, 'Glossar in inhalte.json = whitepaper.json');
    tipp.hidden = true;

    // Quellenfenster (P2.3): Reiter „Quellen“ zeigt die Absätze der Station wörtlich, mit Kapitel und Absatz-ID
    reiter[3]?.click();
    const quellen = [...el.querySelectorAll<HTMLElement>('[role="tabpanel"] .quell-absatz')];
    const st = sitzung.zustand().station ?? '';
    const bezug = (await import('../src/inhalte/index.ts')).inhalte.stationen[st]?.whitepaper ?? [];
    assert.ok(bezug.length > 0);
    assert.deepEqual(quellen.map((q) => q.getAttribute('data-absatz')), bezug);
    assert.match(quellen[0]?.querySelector('figcaption')?.textContent ?? '', /Whitepaper V?1\.2.*Kap\. \d/);
    assert.ok(quellen[0]?.querySelector('.mvg-original'), 'Originaltext eingebettet');

    // Rollen-Linse: modal (übriger Leitstand inert), schließt beim Szenenwechsel
    reiter[0]?.click();
    el.querySelector<HTMLElement>('[data-pruef="standpunkt"]')?.click();
    const linse = el.querySelector('[data-pruef="linse"]');
    assert.equal(linse?.hasAttribute('hidden'), false);
    for (const sel of ['.fussleiste', '.seitenleiste', '.kopf', '.tafel-inhalt']) assert.ok(el.querySelector(sel)?.hasAttribute('inert'), `${sel} nicht inert`);
    assert.ok(!linse?.closest('[inert]'), 'die Linse selbst bleibt bedienbar');
    sitzung.tue({ art: 'weiter' });
    assert.equal(linse?.hasAttribute('hidden'), true, 'Linse bleibt nach dem Szenenwechsel offen');
    assert.equal(el.querySelectorAll('[inert]').length, 0);
  } finally {
    story.entferne();
  }
});

test('H13: Absender ist die Figur der gespielten Rolle → „Sie“ statt Name in der dritten Person', async () => {
  const B = await import('../src/ui/bausteine/bloecke.ts');
  const mailBlock = inhalte.stationen['A3']?.schritte[0]?.bloecke.find((b) => b.art === 'mail');
  const chatBlock = inhalte.stationen['A3']?.schritte[0]?.bloecke.find((b) => b.art === 'chat');
  assert.ok(mailBlock !== undefined && chatBlock !== undefined);
  const woerter = { eingang: 'Posteingang', neu: 'neu', betreff: 'Betreff', anhang: 'Anhang', sie: 'Sie' };
  const fremd = B.mail(mailBlock, inhalte, woerter, 'kaya');
  assert.match(fremd.querySelector('.absender b')?.textContent ?? '', /Jonas Brenner/);
  const selbst = B.mail(mailBlock, inhalte, woerter, 'brenner');
  assert.equal(selbst.querySelector('.absender b')?.textContent, 'Sie');
  assert.equal(selbst.getAttribute('aria-label'), 'E-Mail von Ihnen');
  assert.equal(B.chat(chatBlock, inhalte, 0, 'kaya', 'Sie').querySelector('.blase-kopf b')?.textContent, 'Sie');
});

test('Leinwand-Anzeige: nicht bedienbar, derselbe Stand, keine Regie-Notiz', () => {
  let z = anfangszustand();
  const sitzung = erzeugeSitzung(z, inhalte, { speicher: null });
  for (const a of [{ art: 'starteStory' }, { art: 'weiter' }, { art: 'waehleRolle', rolle: 'pl' }, { art: 'setzeInteressen', interessen: ['express'] as string[] }, { art: 'weiter' }, { art: 'weiter' }] as const) sitzung.tue(a);
  z = sitzung.zustand();
  assert.equal(z.station, 'A3');
  const anzeige = erzeugeAnzeige(inhalte, VERSION, false);
  document.body.replaceChildren(anzeige.element);
  try {
    anzeige.setze(oeffentlich(z), null);
    assert.ok(anzeige.element.hasAttribute('inert'));
    assert.ok(anzeige.element.querySelector('[data-pruef="leitstand"][inert]'));
    assert.ok(anzeige.element.querySelector('.mail'));
    assert.equal(anzeige.element.querySelector('[data-pruef="regie-notiz"]'), null);
    const notiz = regieFuer('A3', 'pl').szene?.notiz;
    assert.ok(notiz);
    assert.ok(!(anzeige.element.textContent ?? '').includes(klartext(notiz).slice(0, 40)));
    // Bereichswechsel: Theorie, Start
    anzeige.setze(oeffentlich({ ...z, bereich: 'theorie', theorie: { kapitel: 1 } }), null);
    assert.ok(anzeige.element.querySelector('[data-pruef="originaltext"]'));
    anzeige.setze(oeffentlich({ ...z, bereich: 'start' }), null);
    assert.ok(anzeige.element.querySelector('[data-pruef="startseite"]'));
  } finally {
    anzeige.entferne();
  }
});

test('Regie: Notiz und Leitfragen; „weiter“ sendet den öffentlichen Zustand über den Kanal', () => {
  const gesendet: KanalNachricht[] = [];
  const empfaenger = new Set<(n: import('../src/regie/kanal.ts').EingehendeNachricht) => void>();
  const kanal = {
    senden: (n: KanalNachricht) => {
      gesendet.push(JSON.parse(JSON.stringify(n)) as KanalNachricht);
    },
    abonnieren: (fn: (n: import('../src/regie/kanal.ts').EingehendeNachricht) => void) => {
      empfaenger.add(fn);
      return () => empfaenger.delete(fn);
    },
    schliessen: () => undefined,
  };
  const sitzung = erzeugeSitzung(anfangszustand(), inhalte, { speicher: null });
  let geoeffnet = 0;
  const regie = erzeugeRegie({ inhalte, sitzung, kanal, version: VERSION, regieFuer, oeffneLeinwand: () => { geoeffnet += 1; }, takt: 60_000 });
  document.body.replaceChildren(regie.element);
  const el = regie.element;
  const klick = (sel: string): void => {
    const b = el.querySelector<HTMLElement>(sel);
    assert.ok(b, `fehlt: ${sel}`);
    b.click();
  };
  try {
    assert.equal(gesendet[0]?.art, 'hallo');
    assert.equal(gesendet[1]?.art, 'zustand');
    klick('[data-pruef="leinwand-oeffnen"]');
    assert.equal(geoeffnet, 1);
    assert.equal(el.querySelector('[data-pruef="leinwand-status"]')?.getAttribute('data-status'), 'neutral');
    for (const fn of empfaenger) fn({ art: 'lebenszeichen', nr: 1 });
    assert.equal(el.querySelector('[data-pruef="leinwand-status"]')?.getAttribute('data-status'), 'ok');
    const vorher = gesendet.length;
    klick('[data-pruef="regie-weiter"]');
    klick('[data-pruef="regie-weiter"]');
    klick('[data-pruef="regie-rolle-pl"]');
    klick('[data-pruef="regie-weiter"]');
    klick('[data-pruef="regie-interesse-express"]'); // Express-Pfad: Prolog → A3
    klick('[data-pruef="regie-weiter"]');
    assert.equal(sitzung.zustand().station, 'A3');
    const zustaende = gesendet.slice(vorher).filter((n): n is Extract<KanalNachricht, { art: 'zustand' }> => n.art === 'zustand');
    assert.equal(zustaende.length, 6);
    for (const n of zustaende) assert.equal('regie' in n.zustand, false, 'das Protokoll geht nie über den Kanal');
    assert.equal(zustaende.at(-1)?.zustand.station, 'A3');
    const notiz = el.querySelector('[data-pruef="regie-notiz"]')?.textContent ?? '';
    const soll = regieFuer('A3', 'pl').szene;
    assert.ok(soll?.notiz);
    assert.ok(notiz.includes(klartext(soll.notiz).slice(0, 40)));
    assert.equal(el.querySelectorAll('[data-pruef="regie-leitfragen"] li').length, soll.leitfragen.length);
    // Vorschau zeigt denselben Stand, aber ohne Notiz
    const vorschau = el.querySelector('.vorschau-buehne');
    assert.ok(vorschau?.querySelector('.mail'));
    assert.equal(vorschau?.querySelector('[data-pruef="regie-notiz"]'), null);
    // Kundenwahl per Taste erst an der Entscheidung
    assert.equal(regie.taste(new dom.window.KeyboardEvent('keydown', { key: 'b' })), false);
    // Protokoll bleibt in der Regie
    const feld = el.querySelector<HTMLTextAreaElement>('[data-pruef="regie-protokoll-feld"]');
    assert.ok(feld);
    feld.value = 'Kunde fragt nach Schwellen';
    klick('.regie-protokoll .knopf');
    assert.equal(sitzung.zustand().regie.protokoll.length, 1);
    const letzte = gesendet.filter((n) => n.art === 'zustand').at(-1);
    assert.ok(letzte && letzte.art === 'zustand' && !JSON.stringify(letzte).includes('Kunde fragt'));
    // Ein „hallo“ der Leinwand beantwortet die Regie mit dem Stand
    const anzahl = gesendet.length;
    for (const fn of empfaenger) fn({ art: 'hallo' });
    assert.equal(gesendet.at(-1)?.art, 'zustand');
    assert.equal(gesendet.length, anzahl + 1);
  } finally {
    regie.entferne();
  }
});

test('Tafeln (P4, L-32): Radar schneidet „erlebt“ mit der eigenen Spur; Schwellen-Spiel prüft gegen die Spalte der Tabelle', async () => {
  const { tafel } = await import('../src/grafik/tafel.ts');
  const wp = JSON.parse(readFileSync(join(WURZEL, 'quellen/whitepaper/v1.2/whitepaper.json'), 'utf8')) as unknown;
  const finde = (o: unknown, id: string): { kopf: string[]; zeilen: string[][] } | null => {
    if (o === null || typeof o !== 'object') return null;
    if ((o as { id?: string }).id === id) return o as { kopf: string[]; zeilen: string[][] };
    for (const v of Object.values(o)) { const f = finde(v, id); if (f !== null) return f; }
    return null;
  };
  const sym = finde(wp, 'k2.5-t1');
  assert.ok(sym);
  // Express-Spur A3, A6: nur Symptome dieser beiden Stationen gelten als erlebt
  const radar = tafel({ form: 'radar', absatz: 'k2.5-t1', quelle: 'Q', kopf: sym.kopf, zeilen: sym.zeilen, erlebt: { 1: ['A1', 'A2'], 4: ['A3', 'A4'], 7: ['A6'] } }, ['prolog', 'A3', 'A6']);
  assert.deepEqual([...radar.querySelectorAll('.radar-knopf.ist-erlebt')].map((b) => b.getAttribute('data-pruef')), ['symptom-4', 'symptom-7']);
  // Schwelle: Spalte 0 = delegierbar, Spalte 1 = nicht delegierbar
  const t = finde(wp, 'k3.2-t1');
  assert.ok(t);
  const spalte = new Map<string, number>();
  for (const z of t.zeilen) z.forEach((zelle, i) => { if (zelle !== '') spalte.set(zelle, i); });
  const el = tafel({ form: 'schwelle', absatz: 'k3.2-t1', quelle: 'Q', kopf: t.kopf, zeilen: t.zeilen, erlebt: {} });
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

test('Tafel-Formen Welt B und RACI (P5.1): Phase hervorgehoben und vorgewählt, Register als Karten, RACI mit eigener Spalte', async () => {
  const { tafel } = await import('../src/grafik/tafel.ts');
  const { raci } = await import('../src/grafik/raci.ts');
  const kopf = ['LPH', 'Leistungsphase', 'Freigabefrage'];
  const zeilen = [['LPH 4', 'Genehmigungsplanung', 'Frage 4?'], ['LPH 5', 'Ausführungsplanung', 'Frage 5?']];
  const ph = tafel({ form: 'phasen', absatz: 'k9.3-t1', quelle: 'Q', kopf, zeilen, erlebt: {}, hervor: [2] });
  assert.equal(ph.querySelector('[aria-pressed="true"]')?.getAttribute('data-pruef'), 'phase-2');
  assert.match(ph.querySelector('.tafel-auswahl')?.textContent ?? '', /Frage 5\?/u);
  const rg = tafel({ form: 'register', absatz: 'k6.4.4-t1', quelle: 'Q', kopf: ['Register', 'Bedeutung', 'Nächster Schritt'], zeilen: [['Frühwarnung', 'unbewertetes Signal', 'bestätigen']], erlebt: {} });
  assert.equal(rg.querySelectorAll('.register-karte').length, 1);
  const rh = tafel({ form: 'register', absatz: 'k6.4.4-t1', quelle: 'Q', kopf: ['Register', 'Bedeutung', 'Nächster Schritt'], zeilen: [['A', 'a', 'x'], ['B', 'b', 'y']], erlebt: {}, hervor: [2] });
  assert.deepEqual([...rh.querySelectorAll('.register-karte.ist-hervor')].map((k) => k.getAttribute('data-pruef')), ['register-2']);
  const m = raci({ rollen: [{ id: 'bauherr', titel: 'Bauherr' }, { id: 'pl', titel: 'Bauherren-PL' }], zeilen: [{ id: 'x', titel: 'Reserve', zuordnung: { bauherr: 'A', pl: 'R' }, mandat: 'Bauherr' }], ich: 'pl', beschriftung: { entscheidung: 'E', mandat: 'M', legende: 'L', sie: 'Sie' } });
  assert.equal(m.querySelectorAll('td.ist-ich').length, 1);
  assert.equal(m.querySelector('td.ist-ich .raci-marke')?.textContent, 'R');
  assert.match(m.querySelector('[data-pruef="raci-detail"]')?.textContent ?? '', /Bauherren-PL \(Sie\)/u);
});

test('Ihre Spur (L-41): der Reiter „Spur“ zeichnet neu, wenn sich die Wahl ändert', async () => {
  document.body.replaceChildren();
  const sitzung = erzeugeSitzung(anfangszustand(), inhalte, { speicher: null });
  const story = erzeugeStory({ inhalte, tue: (a) => sitzung.tue(a) });
  sitzung.abonniere((neu, _alt, aktion) => story.setze(oeffentlich(neu), aktion));
  document.body.append(story.element);
  const el = story.element;
  try {
    for (const a of [{ art: 'starteStory' }, { art: 'weiter' }, { art: 'waehleRolle', rolle: 'pl' }, { art: 'setzeInteressen', interessen: ['express'] as string[] }, { art: 'weiter' }, { art: 'weiter' }, { art: 'weiter' }] as const) sitzung.tue(a);
    assert.equal(sitzung.zustand().station, 'A3');
    el.querySelector<HTMLElement>('[data-pruef="seitenleiste-spur"]')?.click();
    assert.ok(el.querySelector('[data-pruef="spur-leer"]'), 'vor der ersten Wahl: leer');
    for (let i = 0; i < 5 && el.querySelector('[data-pruef="option-B"]') === null; i++) sitzung.tue({ art: 'weiter' });
    sitzung.tue({ art: 'waehle', option: 'B' });
    await pause(20);
    assert.match(el.querySelector('[data-pruef="spur-A3"] [data-welt="a"]')?.textContent ?? '', /B/u);
    sitzung.tue({ art: 'waehle', option: 'C' });
    await pause(20);
    const zelle = el.querySelector('[data-pruef="spur-A3"] [data-welt="a"]')?.textContent ?? '';
    assert.match(zelle, /C/u, 'die neue Wahl erscheint ohne Neuladen');
    assert.match(zelle, /umentschieden/u);
  } finally {
    story.entferne?.();
    document.body.replaceChildren();
  }
});

test('Tafeln Welt B (T9): Phasen-Wahl wandert, Screenreader-Hinweis am hervorgehobenen Knopf; Rhythmus, Karten; RACI-Zeilenwahl und eigene Spalte zuerst', async () => {
  const { tafel } = await import('../src/grafik/tafel.ts');
  const { raci } = await import('../src/grafik/raci.ts');
  const kopf = ['LPH', 'Leistungsphase', 'Freigabefrage'];
  const zeilen = [['LPH 4', 'Genehmigungsplanung', 'Frage 4?'], ['LPH 5', 'Ausführungsplanung', 'Frage 5?']];
  const ph = tafel({ form: 'phasen', absatz: 'k9.3-t1', quelle: 'Q', kopf, zeilen, erlebt: {}, hervor: [2] });
  assert.match(ph.querySelector('[data-pruef="phase-2"] .nur-sr')?.textContent ?? '', /hier steht der Fall/u);
  assert.equal(ph.querySelector('[data-pruef="phase-1"] .nur-sr'), null);
  ph.querySelector<HTMLElement>('[data-pruef="phase-1"]')?.click();
  assert.equal(ph.querySelector('[aria-pressed="true"]')?.getAttribute('data-pruef'), 'phase-1');
  assert.match(ph.querySelector('.tafel-auswahl')?.textContent ?? '', /Frage 4\?/u);
  const rh = tafel({ form: 'rhythmus', absatz: 'k6.4.5-t1', quelle: 'Q', kopf: ['Rhythmus', 'Beteiligte', 'Fokus'], zeilen: [['täglich', 'PMO', 'Fristen'], ['wöchentlich', 'PS', 'Risiken']], erlebt: {}, hervor: [2] });
  assert.equal(rh.querySelector('[aria-pressed="true"]')?.getAttribute('data-pruef'), 'rhythmus-2');
  assert.match(rh.querySelector('.tafel-auswahl')?.textContent ?? '', /Risiken/u);
  const ka = tafel({ form: 'karten', absatz: 'k6.4.2-t1', quelle: 'Q', kopf: ['Gruppe', 'Rolle', 'Turnus'], zeilen: [['Register', 'PL', 'laufend']], erlebt: {} });
  assert.equal(ka.querySelectorAll('.tafel-karte').length, 1);
  assert.match(ka.querySelector('.tafel-karte')?.textContent ?? '', /Rolle.*PL.*Turnus.*laufend/u);
  const m = raci({ rollen: [{ id: 'bauherr', titel: 'Bauherr' }, { id: 'pl', titel: 'Bauherren-PL' }], zeilen: [{ id: 'x', titel: 'Reserve', zuordnung: { bauherr: 'A', pl: 'R' }, mandat: 'Bauherr' }, { id: 'y', titel: 'Zweite', zuordnung: { bauherr: 'I', pl: 'A' }, mandat: 'PL' }], ich: 'pl', beschriftung: { entscheidung: 'E', mandat: 'M', legende: 'L', sie: 'Sie' } });
  const kopfzellen = [...m.querySelectorAll('thead th')];
  assert.equal(kopfzellen.findIndex((t) => t.classList.contains('ist-ich')), 1, 'eigene Spalte direkt hinter der Entscheidung');
  m.querySelector<HTMLElement>('[data-pruef="raci-y"]')?.click();
  assert.match(m.querySelector('[data-pruef="raci-detail"]')?.textContent ?? '', /Zweite.*A · entscheidet.*Bauherren-PL \(Sie\)/su);
});

test('Lernseite (P6.1): Tafel, RACI, Merksatz und Ebenen 1–4 werden auf Seiten- und Abschnittsebene gezeichnet', () => {
  const eintrag = Object.entries(inhalte.theorie).find(([, s]) => s.kapitel === 1);
  assert.ok(eintrag);
  const tafel = { art: 'tafel', kennungen: ['k2.5-t1'], id: 'k2.5-t1', kopf: { form: 'ketten', quelle: 'Q', tabelle: { kopf: ['S', 'M', 'K', 'R'], zeilen: [['s', 'm', 'k', 'r']] }, erlebt: {}, hervor: [] }, felder: {}, liste: null, kinder: [] };
  const ebenen = { art: 'ebenen', kennungen: [], id: null, kopf: {}, felder: {}, liste: null, kinder: [], ebenen: [1, 2, 3, 4].map((nr) => ({ nr, titel: `E${nr}`, felder: { text: `<p>Text ${nr}</p>` }, bloecke: [] })) };
  const abschnitt = { art: 'abschnitt', kennungen: ['k1.1'], id: 'k1.1', kopf: { titel: 'Probe' }, felder: {}, liste: null, kinder: [{ art: 'merksatz', kennungen: [], id: null, kopf: {}, felder: { text: '<p>Merke</p>' }, liste: null, kinder: [] }] };
  const probe = { ...inhalte, theorie: { ...inhalte.theorie, [eintrag[0]]: { ...eintrag[1], bloecke: [tafel, abschnitt, ebenen] } } } as unknown as typeof inhalte;
  const el = baueTheorie({ inhalte: probe, kapitel: 1, version: VERSION, bedienbar: true });
  assert.ok(el.querySelector('[data-pruef="tafel-ketten"]'), 'Tafel auf Seitenebene');
  assert.match(el.querySelector('.lern-abschnitt .lehre')?.textContent ?? '', /Merke/u, 'Merksatz im Abschnitt');
  const e = [...el.querySelectorAll('[data-pruef^="lern-ebene-"]')];
  assert.equal(e.length, 4);
  assert.equal(e[0]?.hasAttribute('open'), true);
  assert.equal(e[3]?.hasAttribute('open'), false);
});
