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
    // Bilddaten der Abbildungen (P14): nur main.ts lädt sie und reicht sie mit setzeAbbildungsBilder herein
    assert.ok(!ziele.includes('src/generiert/abbildungen.json'), `${rel(p)} importiert die Bilddaten der Abbildungen`);
    assert.doesNotMatch(text, /regieInhalte/, `${rel(p)} nennt regieInhalte`);
    // Die Regie bekommt regieFuer als Parameter von main.ts – nur dort darf der Name stehen.
    if (rel(p) !== 'src/regie/regie.ts') assert.doesNotMatch(text, /regieFuer|regieKapitel/, `${rel(p)} nennt regieFuer/regieKapitel`);
  }
  const main = readFileSync(join(WURZEL, 'src/main.ts'), 'utf8');
  assert.match(main, /import \{ inhalte, regieFuer, regieKapitel \} from '\.\/inhalte\/index\.ts'/);
});

test('Leinwand: der ganze Importgraph (transitiv, auch dynamisch) enthält weder Inhalte-Datei noch Regie', () => {
  const graph = importGraph(join(WURZEL, 'src/regie/leinwand.ts'));
  const erreicht = [...graph.keys()].map(rel);
  // Gegenprobe, dass der Graph wirklich über die Zeichnung hinausreicht.
  for (const erwartet of ['src/ui/flaechen/story.ts', 'src/engine/zustand.ts', 'src/regie/kanal.ts', 'src/stil/symbole.ts']) {
    assert.ok(erreicht.includes(erwartet), `Graph erreicht ${erwartet} nicht: ${erreicht.join(', ')}`);
  }
  for (const verboten of ['src/inhalte/index.ts', 'src/generiert/inhalte.json', 'src/generiert/abbildungen.json', 'src/regie/regie.ts', 'src/main.ts']) {
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
    'abdeckung', 'einwaende', 'fall', 'glossar', 'interessen', 'kompass', 'quellen', 'rollen', 'rollenFolge', 'start', 'startseite', 'stationen', 'stationsFolge', 'theorie', 'version', 'welten', 'whitepaper',
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

const { inhalte, regieFuer, regieKapitel } = await import('../src/inhalte/index.ts');
const { anfangszustand, oeffentlich } = await import('../src/engine/zustand.ts');
const { wende } = await import('../src/engine/aktionen.ts');
const { erzeugeSitzung } = await import('../src/ui/sitzung.ts');
const { erzeugeStory } = await import('../src/ui/flaechen/story.ts');
const { baueStart } = await import('../src/ui/flaechen/start.ts');
const theorieModul = await import('../src/ui/flaechen/theorie.ts');
const { baueTheorie, kapitelListe } = theorieModul;
const { baueHilfe, hilfeSeiten, HILFE } = await import('../src/ui/flaechen/hilfe.ts');
const { erzeugeAnzeige } = await import('../src/regie/leinwand.ts');
const { erzeugeRegie } = await import('../src/regie/regie.ts');
const { W } = await import('../src/ui/woerter.ts');
const { leseRoute } = await import('../src/ui/route.ts');
type KanalNachricht = import('../src/regie/kanal.ts').KanalNachricht;

const VERSION = 'MVG V1.2 · Story 0.1';
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

test('Hilfe (P13, O-31): gleiche Aufteilung wie die Companion-Hilfe, leiser Zugang, Blättern, Vermerk', () => {
  const s = baueStart({ startseite: inhalte.startseite, kapitelAnzahl: 13, rollenAnzahl: 6, weiterlesen: false, fassung: 'V1.2', version: VERSION, bedienbar: true });
  assert.equal(s.querySelector('[data-pruef="zur-hilfe"]')?.getAttribute('href'), '#hilfe');
  assert.deepEqual(HILFE.kapitel.map((k) => k.titel), ['MVG-Vorgehensmodell', 'Hilfe-Hub', 'Handbuch', 'Standards', 'Registerdokument-Katalog', 'Rollen-Anleitungen',
    'Kollaboration', 'FAQ & Glossar', 'Kundenanpassung', 'Datenmanagement', 'IT-/Datenschutz-Dossier']);
  const rollen = HILFE.kapitel.find((k) => k.id === 'rollen-anleitungen');
  assert.equal(rollen?.unter.length, 13);
  assert.equal(rollen?.unter[0]?.titel, 'Bauherr / Auftraggeber');
  const uebersicht = baueHilfe({ seite: null, version: VERSION });
  assert.equal(uebersicht.querySelectorAll('[data-pruef="hilfe-liste"] > li').length, 11);
  assert.ok(uebersicht.querySelector('[data-pruef="hilfe-suche"]'));
  assert.equal(uebersicht.querySelector('[data-pruef="ungeprueft"]')?.textContent, 'fachlich ungeprüft');
  const alle = hilfeSeiten();
  assert.equal(alle.length, 24);
  const seite = baueHilfe({ seite: 'rollen-anleitungen-bauherr-auftraggeber', version: VERSION });
  assert.equal(seite.querySelector('.kapitel-titel')?.textContent, 'Bauherr / Auftraggeber');
  assert.equal(seite.querySelector('[data-pruef="hilfe-verzeichnis"] [aria-current="page"]')?.getAttribute('href'), '#hilfe/rollen-anleitungen-bauherr-auftraggeber');
  assert.equal(seite.querySelectorAll('.hilfe-unterliste li').length, 13);
  assert.equal(seite.querySelector('.kapitel-nav a[rel="prev"]')?.getAttribute('href'), '#hilfe/rollen-anleitungen');
  // Inhalt ohne Bedienteile der Anwendung, Begriffe nach MVG
  const text = alle.map((e) => e.seite.html).join(' ');
  assert.doesNotMatch(text, /<(?:button|input|select|textarea|script|form)\b|\son[a-z]+=|white\s*paper|Stage-Gate|(?<![-.\w])G[0-9]\b/iu);
  // Prüfagent Begriffe (P13.3): FAQ vollständig, Kennungen wörtlich, keine Bedienreste, Rollenkarten verlinkt
  assert.match(text, /Was ist der ROI von MVG\?/u);
  assert.match(text, /GATE-NETZNORD-G2/u);
  assert.doesNotMatch(text, /Ansicht öffnen|Schnell starten|Meine Rolle|LPH (\d)[^<(]{0,40}\(LPH \1\)|englisch: Nachweis|Audit-PaketeAudit-Pakete/u);
  assert.equal(rollen?.html.match(/href="#hilfe\/rollen-anleitungen-/gu)?.length, 13);
  // Prüfrunde 2: Fünf-Stufen-Modell der Anwendung nicht als LPH, Ausführungsplanung ist LPH 5, Grammatik der Ersetzungen
  assert.doesNotMatch(text, /LPH \d LPH\d|LPH 3 \(Ausführungsplanung\)|LPH 4<\/td><td>Pilot|Projektbasiss/u);
  assert.match(text, /Freigabestufe 0 LPH 0, Freigabestufe 1 LPH 1–2/u);
  // Prüfrunde 4: Termintypen im Fünf-Stufen-Modell, doppelte Maskierung, Kontrast der Grafikfarben
  assert.match(text, /Freigabebesprechung<\/b> – Freigabestufe 0 bis 4/u);
  assert.doesNotMatch(text, /&amp;amp;|finales Managementbericht|fill:var\(--gold\)/u);
  // Prüfrunde 5: keine MVG-Aussage über die Namen der Anwendung, Kennungen wörtlich, keine Umschrift im Fließtext
  assert.doesNotMatch(text, /Der MVG-Standard beschreibt den Companion|GCT-LPH 3|Zulaessige|Gedaechtnis|<span>1 - Über das Programm/u);
  assert.match(text, /GCT-LPH3/u);
  // Prüfrunde 6: gleichrangige Überschriften der Quelle bleiben gleichrangig (alle Rollenkarten auf einer Ebene)
  const ebenen = [...(rollen?.html.matchAll(/<div class="h-role-pick-card"><(h\d)>/gu) ?? [])].map((m) => m[1]);
  assert.equal(ebenen.length, 14, "13 Rollen mit Unterseite und die Rolle BM-Mentor");
  assert.equal(new Set(ebenen).size, 1, ebenen.join(' '));
  // Prüfrunde 7: Abschnitte des Handbuchs sind Überschriften; keine Momentaufnahmen des Browsers; Freigabestufen eindeutig
  const handbuch = HILFE.kapitel.find((k) => k.id === 'handbuch')?.html ?? '';
  assert.ok((handbuch.match(/<summary><h2 class="h-summary-titel">/gu) ?? []).length >= 6);
  assert.doesNotMatch(text, /Belegt gesamt|Speicher-Ebenen-Audit|Status noch nicht geprüft|Stufe 0 LPH/u);
  assert.match(text, /Freigabestufe 0 LPH 0/u);
  // Prüfrunde 8: alle Abschnitte der Reihe als Überschrift, ohne sichtbare Nummer; keine Angebotsaussage (O-1)
  assert.doesNotMatch(handbuch, /<summary>\d+ - /u);
  assert.equal((handbuch.match(/class="h-summary-titel"/gu) ?? []).length, 17, '16 Abschnitte des Inhaltsverzeichnisses und das Terminmodell');
  const standards = HILFE.kapitel.find((k) => k.id === 'standards')?.html ?? '';
  assert.equal((standards.match(/class="h-summary-titel"/gu) ?? []).length, 7, 'alle 7 Abschnitte der Standards');
  assert.doesNotMatch(text, /Lizenzentgelt|Lizenzmodell|Beratungspraxis|Sparringspartner|Re-Start|Freigabe-Adherence/u);
  // Prüfrunde 9: eingebettetes Dossier unter seinem Abschnitt (keine h2 im Aufklapper)
  const dm = HILFE.kapitel.find((k) => k.id === 'datenmanagement')?.html ?? '';
  // das Dossier steht in der Quelle auf Seitenebene (nach Abschnitt 6): Titel h2, Inhalt h3
  assert.match(dm, /<h2 class="h-summary-titel">IT-\/Datenschutz-Dossier<\/h2>/u);
  assert.match(dm, /<h3>Kurzfreigabe/u);
  // Prüfrunde 10: keine Selbstdarstellung/Akquise (O-1), keine Verweise ohne Ziel, keine Instanz-Momentaufnahme
  assert.doesNotMatch(text, /Über Bauherr Mentoren|Akquise|Print-Center →|Speicher-Modus dieser Instanz|Modul 1 oder 2|einen strukturierten MVG|Wie wir arbeiten|>→ Portfolio-Manager/u);
  assert.match(HILFE.kapitel.find((k) => k.id === 'registerdokument-katalog')?.html ?? '', /aria-label="Tabelle: Registerdokument-Katalog"/u);
  // Prüfrunde 12: Zeitpunkt „vor Freigabe LPH n“, kein Leitprinzip als MVG-Aussage, Genus
  assert.doesNotMatch(text, /vor LPH \d|nach LPH \d|MVG-Leitprinzip|Erstes Managementbericht|ins <b>Managementbericht/u);
  assert.match(text, /vor Freigabe LPH 0/u);
  // Prüfrunde 13: Freigabe-Zeitpunkte auch in Vorbereitung, Meilenstein und Zeitachse
  assert.doesNotMatch(text, /Vorbereitung LPH \d|LPH \d Freigabe|Freigabe-Zeitachse: LPH|fließen aus/u);
  assert.match(text, /Vorbereitung Freigabe LPH 2/u);
  assert.match(text, /Freigaben LPH 0–9 als Stationen/u);
  assert.doesNotMatch(text, /LPH-0-Vorlage/u);
  // Prüfrunde 15: Kundenbeispiel nicht tautologisch, Trenner als Überschrift, keine doppelten IDs im Dialog
  assert.match(text, /Freigabe → Qualitätstor/u);
  assert.match(HILFE.kapitel[0]?.html ?? '', /<h2 class="h-section-divider">Werkzeugübersicht<\/h2>/u);
  const vorgehen = baueHilfe({ seite: 'mvg-vorgehensmodell', version: VERSION });
  const idListe = [...vorgehen.querySelectorAll('[id]')].map((el) => el.id);
  assert.equal(new Set(idListe).size, idListe.length, idListe.join(' '));
  assert.equal(baueHilfe({ seite: 'gibt-es-nicht', version: VERSION }).querySelector('[data-pruef="hilfe-uebersicht"]') !== null, true);
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
  assert.ok(k1.querySelectorAll('[data-pruef="lernkarte"]').length >= 5, 'fünf Managementaussagen als Lernkarten (P12.3)');
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
    assert.match(quellen[0]?.querySelector('figcaption')?.textContent ?? '', /MVG V?1\.2.*Kap\. \d/);
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
    // … dazu den Stand des Beamer-Schalters (E10)
    assert.deepEqual(gesendet.slice(anzahl).map((n) => n.art), ['zustand', 'anzeige']);
  } finally {
    regie.entferne();
  }
});

test('Regie (P9.5): Start sendet den Beamer-Stand, Sprung erst mit Rolle, Einwände getrennt vom Nur-Regie-Teil, Druck, Ein-Fenster', () => {
  const gesendet: KanalNachricht[] = [];
  const kanal = {
    senden: (n: KanalNachricht) => { gesendet.push(JSON.parse(JSON.stringify(n)) as KanalNachricht); },
    abonnieren: () => () => undefined,
    schliessen: () => undefined,
  };
  const sitzung = erzeugeSitzung(anfangszustand(), inhalte, { speicher: null });
  // ohne Eintrag: Kapitel 99 gibt es nicht
  const regie = erzeugeRegie({ inhalte, sitzung, kanal, version: VERSION, regieFuer, regieKapitel: (k) => (k === 5 ? regieKapitel(k) : null), oeffneLeinwand: () => undefined, takt: 60_000 });
  document.body.replaceChildren(regie.element);
  const el = regie.element;
  const q = <T extends Element = HTMLElement>(sel: string): T => {
    const x = el.querySelector<T>(sel);
    assert.ok(x, `fehlt: ${sel}`);
    return x;
  };
  try {
    // B2: nach dem Laden bekommt die Leinwand den Stand des Beamer-Schalters (aus)
    assert.deepEqual(gesendet.map((n) => n.art), ['hallo', 'zustand', 'anzeige']);
    assert.equal((gesendet[2] as Extract<KanalNachricht, { art: 'anzeige' }>).beamer, false);
    // B6/L1: vor der Rollenwahl ist Springen gesperrt und das Rollenfeld zeigt „–“
    const sprung = q<HTMLSelectElement>('[data-pruef="regie-sprung"]');
    const rolle = q<HTMLSelectElement>('[data-pruef="regie-rollenwahl"]');
    assert.equal(sprung.disabled, true);
    assert.equal(rolle.value, '');
    q('[data-pruef="regie-bereich-story"]').click();
    q('[data-pruef="regie-weiter"]').click();
    q('[data-pruef="regie-rolle-pl"]').click();
    assert.equal(sprung.disabled, false);
    assert.equal(rolle.value, 'pl');
    // Als Nächstes (Bauplan 7): die Vorschau nennt, wo „Weiter“ hinführt – über mehrere Schritte verglichen
    let verglichen = 0;
    for (let i = 0; i < 12; i++) {
      const roh = q('[data-pruef="regie-naechstes"]').textContent ?? '';
      if (i === 0) assert.match(roh, /^Als Nächstes: \S/u);
      const vorschau = roh.replace(/^Als Nächstes: /u, '');
      if (vorschau === '') break;
      const [stationTitel, ...rest] = vorschau.split(' · ');
      q('[data-pruef="regie-weiter"]').click();
      const ortText = q('[data-pruef="regie-ort"]').textContent ?? '';
      assert.ok(ortText.startsWith(stationTitel ?? '') && (rest.length === 0 || ortText.endsWith(rest.join(' · '))), `Vorschau „${vorschau}“ ≠ Ort „${ortText}“`);
      verglichen++;
      const opt = el.querySelector<HTMLElement>('[data-pruef^="regie-option-"]');
      if (opt !== null && sitzung.zustand().station !== null) opt.click();
    }
    assert.ok(verglichen >= 2, `nur ${verglichen} Schritte verglichen`);
    // L2: Pfeiltaste im Auswahlfeld blättert nicht
    const schrittVorher = sitzung.zustand().schritt;
    const ereignis = new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight' });
    Object.defineProperty(ereignis, 'target', { value: rolle });
    assert.equal(regie.taste(ereignis), false);
    assert.equal(sitzung.zustand().schritt, schrittVorher);
    // Station mit Einwand: Spickzettel steht NACH dem Hinweis „nur in der Regie“ (Einwände sind öffentlich, L5)
    const mitEinwand = inhalte.einwaende.find((e) => e.stationen.some((s) => inhalte.stationen[s]?.welt === 'A'));
    assert.ok(mitEinwand);
    sitzung.tue({ art: 'geheZu', station: mitEinwand.stationen.find((s) => inhalte.stationen[s]?.welt === 'A') ?? '', schritt: 0 });
    const notiz = q('[data-pruef="regie-notiz"]');
    const hinweis = [...notiz.querySelectorAll('.regie-leise')].find((p) => p.textContent === W.regie.nurRegie);
    assert.ok(hinweis);
    const zettel = q(`[data-pruef="regie-einwand-${mitEinwand.id}"]`);
    assert.ok(hinweis.compareDocumentPosition(zettel) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.equal(q('.regie-notiz-inhalt').querySelector('[data-pruef^="regie-einwand"]'), null);
    // Kapitel mit und ohne Regie-Eintrag
    sitzung.tue({ art: 'oeffneKapitel', kapitel: 5 });
    assert.ok(q('[data-pruef="regie-leitfragen"]'));
    assert.ok(q('[data-pruef="regie-einwaende"]'));
    sitzung.tue({ art: 'oeffneKapitel', kapitel: 1 });
    assert.equal(q('.regie-notiz-inhalt').textContent, W.regie.keineNotiz);
    // Druckteil: Protokoll vollständig (nicht nur die letzten sechs), Weg, Vermerke; ohne print keine hängende Klasse (L9)
    for (let i = 1; i <= 8; i++) sitzung.tue({ art: 'notiere', text: `Eintrag ${i}`, zeit: Date.UTC(2026, 8, 28, 9, i) });
    const druckfn = dom.window.print;
    (dom.window as unknown as { print: unknown }).print = undefined;
    q('[data-pruef="regie-drucken"]').click();
    (dom.window as unknown as { print: unknown }).print = druckfn;
    const druck = q('[data-pruef="regie-druck"]');
    assert.equal(druck.querySelectorAll(':scope > ol > li').length, 8);
    // Dossier (E11): Kapitel zum Nachlesen als Text (höchstens zwei Lernseiten)
    const kapitelImDruck = druck.querySelectorAll('.druck-kapitel').length;
    assert.ok(kapitelImDruck >= 1 && kapitelImDruck <= 2, `Kapitel im Regie-Druck: ${kapitelImDruck}`);
    assert.match(druck.textContent ?? '', new RegExp(`${W.fiktiv}.*${W.ungeprueft}`, 'u'));
    assert.match(druck.textContent ?? '', /A3/u);
    assert.equal(document.body.classList.contains('druck-protokoll'), false);
    // B4: Ein-Fenster nimmt die verdeckten Teile aus der Tab-Folge, Esc gibt den Fokus zurück
    const knopf = q('[data-pruef="regie-ein-fenster"]');
    knopf.click();
    assert.ok(el.classList.contains('ist-ein-fenster'));
    assert.ok(q('.regie-kopf').hasAttribute('inert'));
    assert.ok(q('.regie-steuerung').hasAttribute('inert'));
    assert.equal(q('.regie-eingriff-karte').hasAttribute('inert'), false);
    assert.equal(document.activeElement, q('[data-pruef="regie-ein-fenster-aus"]'));
    assert.equal(regie.taste(new dom.window.KeyboardEvent('keydown', { key: 'Escape' })), true);
    assert.equal(el.classList.contains('ist-ein-fenster'), false);
    assert.equal(q('.regie-kopf').hasAttribute('inert'), false);
    assert.equal(document.activeElement, knopf);
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
  const za = tafel({ form: 'zeitachse', absatz: 'k8.2-t1', quelle: 'Q', kopf: ['Zeitraum', 'Fokus'], zeilen: [['0–30 Tage', 'Diagnose'], ['31–60 Tage', 'Konzeption'], ['61–90 Tage', 'Anwendung']], erlebt: {} });
  const regler = za.querySelector<HTMLInputElement>('[data-pruef="zeitachse-regler"]');
  assert.equal(regler?.max, '90');
  assert.equal(za.querySelector('[aria-pressed="true"]')?.getAttribute('data-pruef'), 'zeitachse-1');
  if (regler) { regler.value = '45'; regler.dispatchEvent(new Event('input')); }
  assert.equal(za.querySelector('[aria-pressed="true"]')?.getAttribute('data-pruef'), 'zeitachse-2');
  assert.match(za.querySelector('.tafel-auswahl')?.textContent ?? '', /Tag 45 · 31–60 Tage.*Konzeption/u);
  assert.equal(regler?.getAttribute('aria-valuetext'), 'Tag 45 · 31–60 Tage');
  za.querySelector<HTMLElement>('[data-pruef="zeitachse-3"]')?.click();
  assert.equal(regler?.value, '61');
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
  const raciB = { art: 'raci', kennungen: [], id: null, kopf: { zeilen: [{ id: 'r1', titel: 'Reserve', zuordnung: { bauherr: 'A', pl: 'R' }, mandat: 'Bauherr' }] }, felder: {}, liste: null, kinder: [] };
  const probe = { ...inhalte, theorie: { ...inhalte.theorie, [eintrag[0]]: { ...eintrag[1], bloecke: [tafel, abschnitt, ebenen, raciB] } } } as unknown as typeof inhalte;
  const el = baueTheorie({ inhalte: probe, kapitel: 1, version: VERSION, bedienbar: true });
  assert.ok(el.querySelector('[data-pruef="tafel-ketten"]'), 'Tafel auf Seitenebene');
  assert.ok(el.querySelector('[data-pruef="raci-detail"]'), 'RACI auf der Lernseite');
  assert.equal(el.querySelector('.tafel-titel')?.tagName, 'H2', 'Tafeltitel auf Seitenebene folgt der Gliederung (h1 → h2)');
  assert.match(el.querySelector('.lern-abschnitt .lehre')?.textContent ?? '', /Merke/u, 'Merksatz im Abschnitt');
  const e = [...el.querySelectorAll('[data-pruef^="lern-ebene-"]')];
  assert.equal(e.length, 4);
  assert.equal(e[0]?.hasAttribute('open'), true);
  assert.equal(e[3]?.hasAttribute('open'), false);
});

test('Begriffs-Kompass (P10.5, E7): im Glossar, Suche nach dem anderen Wort findet den Whitepaper-Begriff', () => {
  assert.ok(inhalte.kompass.length >= 10);
  const seite = baueTheorie({ inhalte, kapitel: 13, version: VERSION, bedienbar: true });
  document.body.replaceChildren(seite);
  const kompass = seite.querySelector('[data-pruef="kompass"]');
  assert.ok(kompass);
  const zeilen = [...kompass.querySelectorAll<HTMLElement>('[data-pruef="kompass-eintrag"]')];
  assert.equal(zeilen.length, inhalte.kompass.length);
  const feld = seite.querySelector<HTMLInputElement>('[data-pruef="glossar-suche"]');
  assert.ok(feld);
  feld.value = 'change-board';
  feld.dispatchEvent(new dom.window.Event('input'));
  const sichtbar = zeilen.filter((z) => !z.hidden);
  assert.equal(sichtbar.length, 1);
  assert.match(sichtbar[0]?.textContent ?? '', /Änderungsgremium/u);
  assert.equal(seite.querySelector<HTMLElement>('.glossar-leer')?.hidden, true, 'ein Kompass-Treffer ist kein leeres Ergebnis');
  // Beleg-Absatz als Permalink, Glossar-Begriff springt zum Eintrag (ohne den Anker des Routers)
  const freigabe = zeilen.find((z) => /Gate/u.test(z.textContent ?? ''));
  assert.equal(freigabe?.querySelector('a.absatz-id')?.getAttribute('href'), '#theorie/k4/k4.5-p1');
  const knopf = freigabe?.querySelector<HTMLButtonElement>('.kompass-begriff');
  assert.ok(knopf);
  feld.value = '';
  feld.dispatchEvent(new dom.window.Event('input'));
  knopf.click();
  assert.equal(document.activeElement?.id, 'g-freigabe');
  // Leinwand: keine Knöpfe, keine Links
  const leinwand = baueTheorie({ inhalte, kapitel: 13, version: VERSION, bedienbar: false });
  assert.equal(leinwand.querySelectorAll('[data-pruef="kompass"] button, [data-pruef="kompass"] a').length, 0);
});

test('Zitierfunktion und Impressum (P10.1): Absatz-Permalink, Zitierangabe, nicht auf der Leinwand', () => {
  const { zitierAngabe } = theorieModul;
  assert.equal(zitierAngabe('k4.2-p3', 'V1.2'), 'Bauherr Mentoren, MVG V1.2, Kap. 4.2, Abs. 3');
  assert.equal(zitierAngabe('k1-p2', 'V1.2'), 'Bauherr Mentoren, MVG V1.2, Kap. 1, Abs. 2');
  assert.equal(zitierAngabe('k6.4.2-t1', 'V1.2'), 'Bauherr Mentoren, MVG V1.2, Kap. 6.4.2, Tabelle 1');
  assert.equal(zitierAngabe('k5.3-l1', 'V1.2'), 'Bauherr Mentoren, MVG V1.2, Kap. 5.3, Aufzählung 1');
  assert.equal(zitierAngabe('k6.3-b1', 'V1.2'), 'Bauherr Mentoren, MVG V1.2, Kap. 6.3, Kasten 1');
  assert.equal(zitierAngabe('kaputt', 'V1.2'), null);
  const seite = baueTheorie({ inhalte, kapitel: 4, version: VERSION, bedienbar: true });
  document.body.replaceChildren(seite);
  const absatz = seite.querySelector<HTMLElement>('.originaltext .absatz[data-absatz="k4.2-p3"]');
  assert.ok(absatz);
  assert.equal(absatz.querySelector('a.absatz-id')?.getAttribute('href'), '#theorie/k4/k4.2-p3');
  const knopf = absatz.querySelector<HTMLButtonElement>('[data-pruef="zitieren"]');
  assert.ok(knopf);
  knopf.click();
  assert.equal(knopf.getAttribute('aria-expanded'), 'true');
  const angabe = absatz.querySelector('[data-pruef="zitierangabe"]')?.textContent ?? '';
  assert.ok(angabe.startsWith('Bauherr Mentoren, MVG V1.2, Kap. 4.2, Abs. 3. Link: '), angabe);
  assert.ok(angabe.endsWith('#theorie/k4/k4.2-p3'));
  knopf.click();
  assert.equal(absatz.querySelector('.zitierangabe'), null);
  // jeder Absatz des Originaltexts hat Permalink und Zitierknopf
  const alle = seite.querySelectorAll('.originaltext .absatz[data-absatz]');
  assert.ok(alle.length > 5);
  assert.equal(seite.querySelectorAll('.originaltext [data-pruef="zitieren"]').length, alle.length);
  // Leinwand (nicht bedienbar): keine Knöpfe, keine Links
  const leinwand = baueTheorie({ inhalte, kapitel: 4, version: VERSION, bedienbar: false });
  assert.equal(leinwand.querySelectorAll('[data-pruef="zitieren"], a.absatz-id').length, 0);
  // Impressum auf der Kapitelliste: Version, Vermerk, Abgrenzung 5.5 und Leistungsgrenzen 7.6
  const liste = baueTheorie({ inhalte, kapitel: null, version: VERSION, bedienbar: true });
  const imp = liste.querySelector('[data-pruef="impressum"]');
  assert.ok(imp);
  assert.equal(imp.getAttribute('data-abschnitt'), 'impressum');
  assert.equal(imp.querySelector('[data-pruef="impressum-version"]')?.textContent, VERSION);
  assert.ok((imp.textContent ?? '').includes('fachlich ungeprüft'));
  assert.equal(imp.querySelector('[data-pruef="impressum-grenze-5.5"]')?.getAttribute('href'), '#theorie/k5/5.5');
  assert.equal(imp.querySelector('[data-pruef="impressum-grenze-7.6"]')?.getAttribute('href'), '#theorie/k7/7.6');
  assert.ok(imp.querySelectorAll('.impressum-aenderungen li').length >= 1);
  assert.equal(seite.querySelector('[data-pruef="zum-impressum"]')?.getAttribute('href'), '#theorie/impressum');
});

test('Glossar (P6.14): alle Begriffe wortgleich, Suche filtert, „Kommt vor in“ verlinkt Stationen und Kapitel', () => {
  const el = baueTheorie({ inhalte, kapitel: 13, version: VERSION, bedienbar: true });
  const eintraege = [...el.querySelectorAll<HTMLElement>('[data-pruef="glossar-eintrag"]')];
  const alle = Object.values(inhalte.glossar);
  assert.equal(eintraege.length, alle.length);
  assert.ok(alle.length >= 30, 'Glossar des Whitepapers vollständig');
  for (const g of alle) {
    const z = el.querySelector(`#${g.id}`);
    assert.equal(z?.querySelector('dt')?.textContent, g.begriff);
    assert.equal(z?.querySelector('dd > p')?.textContent, g.definition, `Definition ${g.begriff} wortgleich`);
    const ziele = [...(z?.querySelectorAll('a.glossar-ort') ?? [])].map((a) => a.getAttribute('href'));
    assert.deepEqual(ziele, [...g.vorkommen.stationen.map((s) => `#story/${s}`), ...g.vorkommen.kapitel.map((k) => `#theorie/k${k}`)]);
  }
  assert.ok(alle.some((g) => g.vorkommen.stationen.length > 0 && g.vorkommen.kapitel.length > 0), 'Vorkommen gesammelt');
  const feld = el.querySelector<HTMLInputElement>('[data-pruef="glossar-suche"]');
  assert.ok(feld);
  feld.value = 'freigabe';
  feld.dispatchEvent(new Event('input'));
  const sichtbar = eintraege.filter((z) => !z.hidden);
  assert.ok(sichtbar.length > 0 && sichtbar.length < alle.length);
  assert.ok(sichtbar.every((z) => (z.textContent ?? '').toLowerCase().includes('freigabe')));
  assert.match(el.querySelector('[data-pruef="glossar-zahl"]')?.textContent ?? '', new RegExp(`^${sichtbar.length} von ${alle.length}`, 'u'));
  // Leinwand: keine Suche, keine Links – auf jeder Lernseite und in der Kapitelliste
  for (const kapitel of [null, ...Array.from({ length: 13 }, (_, i) => i + 1)]) {
    const anzeige = baueTheorie({ inhalte, kapitel, version: VERSION, bedienbar: false });
    assert.equal(anzeige.querySelector('a, .glossar-feld'), null, `Leinwand Kapitel ${kapitel ?? 'Liste'} ohne Links und Suche`);
  }
});

test('Story-Karte (P7.2, E8): Express-Umschalter setzt das Interesse, Explore erscheint erst nach der Freischaltung', async () => {
  document.body.replaceChildren();
  const sitzung = erzeugeSitzung(anfangszustand(), inhalte, { speicher: null });
  const story = erzeugeStory({ inhalte, tue: (a) => sitzung.tue(a) });
  sitzung.abonniere((neu, _alt, aktion) => story.setze(oeffentlich(neu), aktion));
  document.body.append(story.element);
  const el = story.element;
  try {
    for (const a of [{ art: 'starteStory' }, { art: 'weiter' }, { art: 'waehleRolle', rolle: 'pl' }] as const) sitzung.tue(a);
    await pause(20);
    const knopf = el.querySelector<HTMLElement>('[data-pruef="karte-express"]');
    assert.ok(knopf && !knopf.hidden, 'Umschalter sichtbar, sobald eine Rolle gewählt ist');
    assert.equal(knopf.getAttribute('aria-pressed'), 'false');
    knopf.click();
    await pause(20);
    assert.deepEqual(sitzung.zustand().interessen, ['express']);
    assert.equal(knopf.getAttribute('aria-pressed'), 'true');
    knopf.click();
    await pause(20);
    assert.deepEqual(sitzung.zustand().interessen, []);
    assert.equal(el.querySelector<HTMLElement>('[data-pruef="karte-explore"]')?.hidden, true, 'Explore vor dem Ende verborgen');
  } finally {
    story.entferne?.();
    document.body.replaceChildren();
  }
});

test('Nachweiskette (E2, P7.3): besuchte Welt-B-Stationen als Knöpfe, Klick legt sechs Glieder aus', async () => {
  const { nachweiskette } = await import('../src/ui/bausteine/bloecke.ts');
  const nw = (k: string) => ({ mandat: `M-${k}`, freigabe: `F-${k}`, kennung: `ENT-${k}`, datenstand: `D-${k}`, nachweis: `N-${k}`, beschlusslage: `B-${k}`, text: '' });
  const probe = { ...inhalte, stationen: { ...inhalte.stationen, B1: { ...inhalte.stationen['B1'], nachweis: nw('1') }, B3: { ...inhalte.stationen['B3'], nachweis: nw('3') } } } as unknown as typeof inhalte;
  const block = { art: 'nachweiskette', kennungen: [], id: null, kopf: {}, felder: {}, liste: null, kinder: [] } as never;
  const leer = nachweiskette(block, probe, ['A1']);
  assert.equal(leer.getAttribute('data-pruef'), 'nachweiskette-leer', 'ohne Welt B: Hinweis statt Kette');
  const el = nachweiskette(block, probe, ['B1', 'B3']);
  const knoepfe = [...el.querySelectorAll('.nachweis-station')].map((b) => b.getAttribute('data-pruef'));
  assert.deepEqual(knoepfe, ['nachweis-B1', 'nachweis-B3'], 'Reihenfolge der Geschichte');
  assert.match(el.querySelector('[data-pruef="nachweis-glieder"]')?.textContent ?? '', /M-3.*F-3.*ENT-3.*D-3.*N-3.*B-3/su, 'zuletzt besuchte vorgewählt');
  el.querySelector<HTMLElement>('[data-pruef="nachweis-B1"]')?.click();
  const glieder = [...el.querySelectorAll('.nachweis-glied')].map((g) => g.getAttribute('data-glied'));
  assert.deepEqual(glieder, ['mandat', 'freigabe', 'kennung', 'datenstand', 'nachweis', 'beschlusslage']);
  assert.match(el.querySelector('[data-pruef="nachweis-glieder"]')?.textContent ?? '', /Mandat.*M-1.*Beschlusslage.*B-1/su);
});

test('Selbstdiagnose (O-8): Profil in Worten aus der letzten Spalte, keine Punktzahl', async () => {
  const { tafel } = await import('../src/grafik/tafel.ts');
  const d = tafel({ form: 'diagnose', absatz: 'k2.5-t1', quelle: 'Q', kopf: ['Symptom', 'Muster', 'MVG-Reaktion'], zeilen: [['Unklare Ziele', 'm1', 'Zielsystem festlegen.'], ['Rollen ohne Mandat', 'm2', 'Mandate klären.']], erlebt: {} });
  assert.match(d.querySelector('[data-pruef="diagnose-profil"]')?.textContent ?? '', /keine Punkte/u);
  d.querySelector<HTMLElement>('[data-pruef="diagnose-1-0"]')?.click();
  d.querySelector<HTMLElement>('[data-pruef="diagnose-2-1"]')?.click();
  const profil = d.querySelector('[data-pruef="diagnose-profil"]')?.textContent ?? '';
  assert.match(profil, /Zeigt sich bei Ihnen.*Unklare Ziele.*Zielsystem festlegen\..*Zeigt sich teilweise.*Rollen ohne Mandat.*Mandate klären\./su);
  assert.doesNotMatch(profil, /\d+ ?(von|%|Punkte)/u, 'keine Zahl, keine Wertung');
  d.querySelector<HTMLElement>('[data-pruef="diagnose-1-0"]')?.click();
  assert.doesNotMatch(d.querySelector('[data-pruef="diagnose-profil"]')?.textContent ?? '', /Unklare Ziele/u, 'zweiter Klick nimmt die Wahl zurück');
});

test('Resümee (P7.6): Kapitel der Spur nach Häufigkeit', async () => {
  const { kapitelDerSpur } = await import('../src/ui/flaechen/story-szenen.ts');
  const probe = { ...inhalte, stationen: { X: { whitepaper: ['k4.2-p3', 'k4.5-p1', 'k9.3-p1'] }, Y: { whitepaper: ['k9.3-p2', 'k9.4-l1', 'k2.1-p1'] } } } as unknown as typeof inhalte;
  assert.deepEqual(kapitelDerSpur(['X', 'Y', 'X'], probe), [9, 4, 2]);
  assert.deepEqual(kapitelDerSpur([], probe), []);
});

test('Resümee (P7.7): Ende, Richtung und erste Vertiefung aus der Spur; Zwischenüberschriften; ohne Links auf der Leinwand', async () => {
  const { resuemee } = await import('../src/ui/flaechen/story-szenen.ts');
  const { wende } = await import('../src/engine/aktionen.ts');
  const { aktuellerSchritt } = await import('../src/engine/graph.ts');
  let z = anfangszustand();
  const tu = (a: Parameters<typeof wende>[1]): void => { z = wende(z, a, inhalte); };
  tu({ art: 'starteStory' });
  tu({ art: 'waehleRolle', rolle: 'pl' });
  tu({ art: 'setzeInteressen', interessen: ['kosten', 'express'] });
  for (let i = 0; i < 3000 && z.station !== 'epilog'; i++) {
    const ent = z.station !== null ? inhalte.stationen[z.station]?.szenen['pl']?.entscheidung : null;
    if (aktuellerSchritt(z, inhalte)?.art === 'entscheidung' && ent && z.entscheidungen[ent.id] === undefined) tu({ art: 'waehle', option: z.station === 'A6' ? 'C' : 'A' });
    const vorher = z;
    tu({ art: 'weiter' });
    if (z === vorher) break;
  }
  assert.equal(z.station, 'epilog');
  assert.ok(z.verlauf.includes('ende-steuerbar'));
  const station = inhalte.stationen['epilog'];
  assert.ok(station);
  const block = { art: 'resuemee', kennungen: [], id: null, kopf: {}, felder: {}, liste: null, kinder: [
    { art: 'hinweis', kennungen: [], id: null, kopf: {}, felder: { text: '<p>Drei Prinzipien</p>' }, liste: null, kinder: [] },
  ] } as never;
  const k = (tue: null | (() => void)) => ({ inhalte, station, schritte: station.schritte, index: 0, schritt: station.schritte[0], z: oeffentlich(z), tue, takt: null }) as never;
  const el = resuemee(block, k(() => undefined), null);
  const weg = el.querySelector('[data-pruef="resuemee-weg"]')?.textContent ?? '';
  assert.match(weg, /Ihr Ende.*Steuerbar übergeben/su);
  assert.match(weg, /Ihre Richtung im Dezember.*Neuinitialisierung/su);
  const links = [...el.querySelectorAll('[data-pruef="resuemee-vertiefungen"] a')].map((a) => a.getAttribute('href'));
  assert.equal(links[0], `#theorie/k${inhalte.stationen['ende-steuerbar']?.vertiefung}`, 'erste Vertiefung aus dem Ende');
  assert.equal(links.length, 2);
  assert.doesNotMatch(el.querySelector('[data-pruef="resuemee-themen"]')?.textContent ?? '', /Express/u, 'Express ist kein Thema');
  assert.equal(el.querySelector('.resuemee-titel')?.tagName, 'H3');
  assert.equal(resuemee(block, k(null), null).querySelector('a'), null, 'Leinwand: keine Links');
  // Dossier (P10.2, E11): Weg, Entscheidungen, Resümee und die zwei Vertiefungskapitel auf einem Bogen
  assert.equal(resuemee(block, k(null), null).querySelector('[data-pruef="dossier-drucken"]'), null, 'Leinwand: kein Druckknopf');
  document.body.replaceChildren(el);
  // jsdom kennt keinen Druckdialog: wie ein eingebettetes Fenster ohne print()
  const druckfn = dom.window.print;
  (dom.window as unknown as { print: unknown }).print = undefined;
  after(() => { (dom.window as unknown as { print: unknown }).print = druckfn; });
  el.querySelector<HTMLButtonElement>('[data-pruef="dossier-drucken"]')?.click();
  const bogen = document.querySelector('[data-pruef="druck-bogen"]');
  assert.ok(bogen);
  assert.match(bogen.querySelector('.druck-kopf')?.textContent ?? '', /Fiktiver Fall · fachlich ungeprüft/u);
  assert.equal(bogen.querySelectorAll('.druck-teil ol li').length, z.spur.length);
  assert.ok(bogen.querySelector('.resuemee [data-pruef="resuemee-weg"]'));
  assert.equal(bogen.querySelector('.resuemee [data-pruef="dossier-drucken"]'), null);
  const kapitel = [...bogen.querySelectorAll('.druck-kapitel')].map((x) => x.getAttribute('data-kapitel'));
  assert.deepEqual(kapitel, links.map((l) => l?.replace('#theorie/k', '') ?? ''));
  assert.equal(document.body.classList.contains('druckt-bogen'), false, 'ohne Druckdialog keine hängende Klasse');
});

test('Druck (P10.2): Kapitel und alle Kapitel als Bogen – ohne Kopfleiste, Verzeichnis, Zitierknöpfe', () => {
  const seite = baueTheorie({ inhalte, kapitel: 6, version: VERSION, bedienbar: true });
  document.body.replaceChildren(seite);
  seite.querySelector<HTMLButtonElement>('[data-pruef="kapitel-drucken"]')?.click();
  const bogen = document.querySelector('[data-pruef="druck-bogen"]');
  assert.ok(bogen);
  assert.match(bogen.querySelector('.druck-kopf h1')?.textContent ?? '', /^Kapitel 6 · /u);
  assert.match(bogen.querySelector('.druck-kopf')?.textContent ?? '', /fachlich ungeprüft/u);
  assert.equal(bogen.querySelectorAll('.druck-kapitel').length, 1);
  assert.equal(bogen.querySelectorAll('.lern-kopf, .kapitel-verzeichnis, .kapitel-nav, [data-pruef="zitieren"], [data-pruef="kapitel-drucken"]').length, 0);
  assert.ok(bogen.querySelector('.originaltext'));
  for (const d of bogen.querySelectorAll('details')) assert.ok(d.hasAttribute('open'), 'im Druck aufgeklappt');
  const liste = baueTheorie({ inhalte, kapitel: null, version: VERSION, bedienbar: true });
  document.body.replaceChildren(liste);
  liste.querySelector<HTMLButtonElement>('[data-pruef="alles-drucken"]')?.click();
  const alle = document.querySelectorAll('[data-pruef="druck-bogen"]');
  assert.equal(alle.length, 1, 'ein neuer Bogen ersetzt den alten');
  assert.deepEqual([...alle[0]?.querySelectorAll('.druck-kapitel') ?? []].map((x) => Number(x.getAttribute('data-kapitel'))), Array.from({ length: 13 }, (_, i) => i + 1));
  assert.equal(baueTheorie({ inhalte, kapitel: 6, version: VERSION, bedienbar: false }).querySelector('[data-pruef="kapitel-drucken"]'), null, 'Leinwand: kein Druckknopf');
  // Mit Druckdialog: Klasse und Titel während des Drucks, danach (afterprint) alles zurück; keine doppelten IDs
  const kap13 = baueTheorie({ inhalte, kapitel: 13, version: VERSION, bedienbar: true });
  document.body.replaceChildren(kap13);
  document.title = 'Vorher';
  const vorher = dom.window.print;
  (dom.window as unknown as { print: () => void }).print = () => undefined;
  try {
    kap13.querySelector<HTMLButtonElement>('[data-pruef="kapitel-drucken"]')?.click();
    assert.ok(document.body.classList.contains('druckt-bogen'));
    assert.match(document.title, /^Kapitel 13 · /u);
    const ids = [...document.querySelectorAll('[id]')].map((x) => x.id);
    assert.deepEqual(ids.filter((x, i) => ids.indexOf(x) !== i), [], 'doppelte IDs neben dem Bogen');
    const region = document.querySelector('.druck-bogen [data-pruef="kompass"] [role="region"]');
    assert.ok(region && document.getElementById(region.getAttribute('aria-labelledby') ?? '')?.closest('.druck-bogen'), 'Bezug zeigt in den Bogen');
    dom.window.dispatchEvent(new dom.window.Event('afterprint'));
    assert.equal(document.body.classList.contains('druckt-bogen'), false);
    assert.equal(document.title, 'Vorher');
    assert.equal(document.querySelector('.druck-bogen'), null);
  } finally {
    (dom.window as unknown as { print: unknown }).print = vorher;
  }
});

test('Permalink-Rundlauf (P10.1): jeder Absatz aller Lernseiten – Link führt zurück auf ihn, Zitierangabe vorhanden', () => {
  let zahl = 0;
  for (const k of kapitelListe(inhalte).filter((x) => x.seite)) {
    const seite = baueTheorie({ inhalte, kapitel: k.nr, version: VERSION, bedienbar: true });
    for (const absatz of seite.querySelectorAll<HTMLElement>('.originaltext .absatz[data-absatz]')) {
      const id = absatz.getAttribute('data-absatz') ?? '';
      if (id === '') continue;
      const href = absatz.querySelector('a.absatz-id')?.getAttribute('href') ?? '';
      assert.deepEqual(leseRoute(href), { flaeche: 'theorie', kapitel: k.nr, abschnitt: id }, href);
      assert.ok(theorieModul.zitierAngabe(id, 'V1.2'), id);
      zahl++;
    }
  }
  assert.ok(zahl > 100, `nur ${zahl} Absätze`);
});

test('Story-Karte auf der Leinwand (L-49): kein Express-Umschalter, kein Explore-Weg', () => {
  const story = erzeugeStory({ inhalte, tue: null });
  assert.equal(story.element.querySelector('[data-pruef="karte-express"]'), null);
  assert.equal(story.element.querySelector('[data-pruef="karte-explore"]'), null);
});

test('Zeitmaschine (P8.4, E4): Punkte aus dem Startstand der Stationen, Regler setzt Monat und Ablesung', async () => {
  const { zeitPunkte, zeitmaschine } = await import('../src/ui/flaechen/explore-zeitmaschine.ts');
  const p = zeitPunkte(inhalte);
  assert.deepEqual(p.filter((x) => x.welt === 'A').map((x) => x.monat), [1, 3, 5, 7, 9, 11]);
  assert.deepEqual(p.filter((x) => x.welt === 'B').map((x) => x.monat), [1, 3, 5, 7, 9, 11]);
  const a3 = p.find((x) => x.station.startsWith('A3'));
  const start = inhalte.stationen['A3']?.statusStart ?? [];
  assert.equal(a3?.offen, start.find((e) => e.schluessel === 'ungeklaerteEntscheidungen')?.wert);
  assert.equal(['niedrig', 'mittel', 'hoch', 'sehr hoch'][(a3?.kosten ?? 0) - 1], start.find((e) => e.schluessel === 'kostenunsicherheit')?.wert);
  const el = zeitmaschine(inhalte);
  assert.ok(el);
  const regler = el.querySelector<HTMLInputElement>('[data-pruef="zm-regler"]');
  assert.ok(regler);
  regler.value = '2';
  regler.dispatchEvent(new Event('input'));
  assert.match(el.querySelector('[data-pruef="zm-ablesen"]')?.textContent ?? '', /Monat 5.*A3.*B3/su);
  assert.equal(el.querySelectorAll('.zm-tabelle tbody tr').length, 6, 'Tabellenansicht');
});

test('Galerie (P8.5): jede Tafel der Lernseiten einmal; Abbildungsverzeichnis; Story-Karte sperrt Welt B', async () => {
  const { galerieTafeln, galerie, stationsKarte } = await import('../src/ui/flaechen/explore-galerie.ts');
  const t = galerieTafeln(inhalte);
  const ids = t.map((x) => x.block.id);
  assert.equal(new Set(ids).size, ids.length, 'jede Tabelle einmal');
  assert.ok(ids.includes('k2.5-t1') && ids.includes('k8.2-t1') && ids.includes('k12-t1'));
  assert.deepEqual(t.map((x) => x.kapitel), [...t.map((x) => x.kapitel)].sort((a, b) => a - b));
  const g = galerie(inhalte);
  assert.ok(g);
  assert.equal(g.querySelectorAll('[data-pruef="abbildungsverzeichnis"] tbody tr').length, inhalte.whitepaper.abbildungen.length);
  assert.ok(inhalte.whitepaper.abbildungen.length > 0);
  assert.equal(g.querySelector('img'), null, 'keine Rasterbilder (L-51)');
  const dia = [...g.querySelectorAll('[data-pruef="story-diagramme"] li')].map((li) => li.textContent ?? '');
  assert.ok(dia.some((t) => /Mandatsleiter: B2/u.test(t)) && dia.some((t) => /Nachweiskette/u.test(t)), dia.join(' | '));
  g.querySelector<HTMLElement>('[data-pruef="galerie-k8.2-t1"]')?.click();
  assert.ok(g.querySelector('[data-pruef="galerie-buehne"] [data-pruef="tafel-zeitachse"]'));
  const zu = stationsKarte(inhalte, false);
  assert.equal(zu.querySelector('[data-pruef="sprung-B1"]'), null);
  assert.ok(zu.querySelector('[data-pruef="sprung-A1"]'));
  assert.ok(stationsKarte(inhalte, true).querySelector('[data-pruef="sprung-B1"]'));
});

test('Explore: ein Werkzeug ohne Inhalte bietet kein „Werkzeug öffnen“ an', async () => {
  const { baueExplore } = await import('../src/ui/flaechen/explore.ts');
  const ohne = baueExplore({ inhalte: { ...inhalte, welten: [] }, freigeschaltet: true, weltB: true, version: VERSION });
  assert.equal(ohne.querySelector('[data-pruef="werkzeug-oeffnen-welten"]'), null);
  assert.match(ohne.querySelector('[data-pruef="werkzeug-welten"] .badge')?.textContent ?? '', /in Vorbereitung/u);
  const mit = baueExplore({ inhalte, freigeschaltet: true, weltB: true, version: VERSION });
  for (const w of ['simulator', 'welten', 'sandbox', 'zeitmaschine', 'galerie', 'figuren']) assert.ok(mit.querySelector(`[data-pruef="werkzeug-oeffnen-${w}"]`), w);
});

test('Lernseite 6 (P11.1, Befund 4): kanonischer Governance-Fluss als Übersicht in Abschnitt 6.4.3', () => {
  const seite = baueTheorie({ inhalte, kapitel: 6, version: VERSION, bedienbar: true });
  const fluss = seite.querySelector('[data-abschnitt="k6.4.3"] [data-pruef="fluss"]');
  assert.ok(fluss, 'Fluss fehlt in 6.4.3');
  assert.ok(fluss.classList.contains('ist-uebersicht'));
  assert.equal(fluss.querySelectorAll('.fluss-stationen li').length, 7);
  assert.match(fluss.getAttribute('aria-label') ?? '', /^Kanonischer Governance-Fluss: Frühwarnung → /u);
});

test('Wissenschecks (P11.6): je Lernseite 2–12 einer; Wahl zeigt Rückmeldung, Erklärung und Beleg – ohne Punkte', () => {
  for (let nr = 2; nr <= 12; nr++) {
    const seite = baueTheorie({ inhalte, kapitel: nr, version: VERSION, bedienbar: true });
    assert.equal(seite.querySelectorAll('[data-pruef="wissenscheck"]').length, 1, `Kap. ${nr}`);
  }
  const seite = baueTheorie({ inhalte, kapitel: 4, version: VERSION, bedienbar: true });
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

test('B4 Gremium (P11.5, Fund der Kürzung): die Vorlage AEN-031 steht unter der Mandatsleiter', () => {
  const b4 = inhalte.stationen['B4'];
  assert.ok(b4);
  const schritte = b4.schritte;
  const idx = schritte.findIndex((s) => s.id === 'gremium');
  assert.ok(idx >= 0);
  const a = anfangszustand();
  const z = { ...a, bereich: 'story' as const, station: 'B4', schritt: idx, rolle: 'pl', verlauf: ['prolog', 'B4'], freigeschaltet: { ...a.freigeschaltet, weltB: true } };
  const story = erzeugeStory({ inhalte, tue: null });
  document.body.replaceChildren(story.element);
  story.setze(oeffentlich(z), null);
  const vorlage = story.element.querySelector('[data-pruef="vorlage"]');
  assert.ok(vorlage, 'Vorlage fehlt im Gremium-Schritt');
  assert.match(vorlage.getAttribute('aria-label') ?? '', /AEN-031/u);
  assert.ok(story.element.querySelector('.mandat-raster'), 'Mandatsleiter bleibt');
  story.entferne();
});

test('B3 Mandat (P11.3): die Rollenfrage am Schritt „mandat“ wird gezeigt und beantwortet', () => {
  const b3 = inhalte.stationen['B3'];
  assert.ok(b3);
  const idx = b3.schritte.findIndex((s) => s.id === 'mandat');
  assert.ok(idx >= 0);
  const a = anfangszustand();
  const aktionen: unknown[] = [];
  const z = { ...a, bereich: 'story' as const, station: 'B3', schritt: idx, rolle: 'bauherr', verlauf: ['prolog', 'B3'], freigeschaltet: { ...a.freigeschaltet, weltB: true } };
  const story = erzeugeStory({ inhalte, tue: (x) => { aktionen.push(x); } });
  document.body.replaceChildren(story.element);
  story.setze(oeffentlich(z), null);
  const knoepfe = story.element.querySelectorAll<HTMLButtonElement>('[data-pruef^="reife-"]');
  assert.ok(knoepfe.length >= 2, 'Antwortknöpfe fehlen');
  // sichtbar ohne vorherige Antwort (R2: `.reife` ist ohne `ist-bereit` unsichtbar)
  assert.ok(knoepfe[0]?.closest('.reife')?.classList.contains('ist-bereit'), 'Rollenfrage bleibt verborgen');
  knoepfe[0]?.click();
  const aktion = aktionen.at(-1) as Parameters<typeof wende>[1];
  assert.equal(aktion.art, 'antworte');
  // durch den Reducer: UI- und Engine-Schlüssel müssen zusammenpassen (R3)
  story.setze(oeffentlich(wende(z, aktion, inhalte)), null);
  assert.equal(knoepfe[0]?.getAttribute('aria-pressed'), 'true');
  assert.ok(story.element.querySelector('[data-pruef="rueckmeldung"] .rueckmeldung'), 'Rückmeldung fehlt');
  story.entferne();
});

test('Ebenen (P11.3 R2/R3): knappe Ansage „Ebene n: Titel“ nur beim Wechsel, kein aria-live am Ort', () => {
  const b3 = inhalte.stationen['B3'];
  assert.ok(b3);
  const idx = b3.schritte.findIndex((s) => s.art === 'ebenen');
  assert.ok(idx >= 0);
  const a = anfangszustand();
  const z = { ...a, bereich: 'story' as const, station: 'B3', schritt: idx, rolle: 'pl', verlauf: ['prolog', 'B3'], freigeschaltet: { ...a.freigeschaltet, weltB: true } };
  const story = erzeugeStory({ inhalte, tue: null });
  document.body.replaceChildren(story.element);
  story.setze(oeffentlich(z), null);
  const ansage = story.element.querySelector('[data-pruef="ebene-ansage"]');
  assert.ok(ansage, 'Ansage fehlt');
  assert.equal(ansage.textContent, '', 'beim Aufbau keine Ansage');
  assert.equal(story.element.querySelector('.ebene-ort')?.getAttribute('aria-live') ?? null, null);
  story.setze(oeffentlich({ ...z, ebene: 2 }), null);
  const titel = b3.ebenen?.find((e) => e.nr === 2)?.titel ?? '';
  assert.equal(ansage.textContent, `${W.ebene} 2: ${titel}`);
  story.entferne();
});

test('Lernseiten (O-30): Originaltext am Seitenende, zugeklappt; ein Absatz-Permalink findet ihn', () => {
  for (const nr of [1, 4, 9, 12]) {
    const seite = baueTheorie({ inhalte, kapitel: nr, version: VERSION, bedienbar: true });
    const original = seite.querySelector<HTMLDetailsElement>('details.originaltext');
    assert.ok(original, `Kap. ${nr}: Originaltext fehlt`);
    assert.equal(original.open, false, `Kap. ${nr}: Originaltext ist aufgeklappt`);
    const inhaltEl = seite.querySelector('.lern-inhalt');
    const kinder = [...(inhaltEl?.children ?? [])];
    const pos = kinder.indexOf(original);
    const nachher = kinder.slice(pos + 1).map((k) => k.className);
    assert.ok(nachher.every((c) => /kapitel-nav|lern-fuss|originaltext/u.test(c)), `Kap. ${nr}: nach dem Originaltext steht noch ${nachher.join(', ')}`);
  }
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

test('Entscheidung (P12.5, O-28): die Frage an die gespielte Rolle steht über den Optionen', () => {
  const a3 = inhalte.stationen['A3'];
  assert.ok(a3);
  const idx = a3.schritte.findIndex((s) => s.art === 'entscheidung');
  assert.ok(idx >= 0);
  for (const rolle of ['ps', 'controlling', 'bauherr']) {
    const a = anfangszustand();
    const z = { ...a, bereich: 'story' as const, station: 'A3', schritt: idx, rolle, verlauf: ['prolog', 'A3'] };
    const story = erzeugeStory({ inhalte, tue: null });
    document.body.replaceChildren(story.element);
    story.setze(oeffentlich(z), null);
    const soll: string = a3.szenen[rolle]?.entscheidung?.frage ?? '';
    assert.ok(soll !== '', `${rolle}: Rollenfrage fehlt in A3`);
    assert.equal(story.element.querySelector('[data-pruef="entscheidungs-frage"]')?.textContent, soll, rolle);
    story.entferne();
  }
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
  const k7 = baueTheorie({ inhalte, kapitel: 7, version: VERSION, bedienbar: false });
  assert.ok(k7.querySelectorAll('.lernwerkzeug').length > 0);
  assert.equal(k7.querySelectorAll('.lernwerkzeug:not(.ist-aufgeloest)').length, 0);
});

test('Abbildungen (P14, O-32): Lernseite und Originaltext zeigen das Bild mit Vorrang des Texts; Leinwand ohne Bedienung; Verzeichnis mit Sprung', async () => {
  const { setzeAbbildungsBilder } = await import('../src/ui/bausteine/abbildung.ts');
  const { galerie } = await import('../src/ui/flaechen/explore-galerie.ts');
  // jsdom kennt <dialog>; nur für diesen Test als Global setzen (die Hilfe-Tests prüfen den Fall ohne)
  const vorher = g['HTMLDialogElement'];
  g['HTMLDialogElement'] = (dom.window as unknown as Record<string, unknown>)['HTMLDialogElement'];
  try {
    setzeAbbildungsBilder({ 'abb-2': 'data:image/webp;base64,UklGRg==' });
    const eintrag = Object.entries(inhalte.theorie).find(([, s]) => s.kapitel === 1);
    assert.ok(eintrag);
    const abb = { id: 'abb-2', nr: 1, kapitel: '1', ort: 'k1', bild: { titel: 'Probe-Titel', alt: 'Probe-Alternativtext', breite: 1200, hoehe: 800, angeglichen: [{ text: 'Neuer Begriff', beleg: 'k1-p2' }], abweichungen: [{ html: 'Probe-Abweichung', belege: ['k1-p1', 'k13-t1'] }] } };
    const block = { art: 'abbildung', kennungen: ['abb-2'], id: 'abb-2', kopf: {}, felder: {}, liste: null, kinder: [] };
    const original = { art: 'original', kennungen: ['k1'], id: null, kopf: { quelle: 'Q' }, felder: { text: '<figure class="mvg-abbildung" data-abbildung="abb-2"></figure>\n<p class="mvg-original" data-absatz="k1-p1">Absatz</p>' }, liste: null, kinder: [] };
    const probe = { ...inhalte, whitepaper: { ...inhalte.whitepaper, abbildungen: [abb] }, theorie: { ...inhalte.theorie, [eintrag[0]]: { ...eintrag[1], bloecke: [block, original] } } } as unknown as typeof inhalte;

    const el = baueTheorie({ inhalte: probe, kapitel: 1, version: VERSION, bedienbar: true });
    const figuren = [...el.querySelectorAll('figure.abbildung')];
    assert.equal(figuren.length, 2, 'einmal auf der Lernseite, einmal im Originaltext');
    const [lern, orig] = figuren;
    assert.equal(lern?.closest('details.originaltext'), null);
    assert.ok(orig?.closest('details.originaltext'), 'die zweite steht im zugeklappten Originaltext');
    const img = lern?.querySelector('img');
    assert.equal(img?.getAttribute('alt'), 'Probe-Alternativtext');
    assert.match(img?.getAttribute('src') ?? '', /^data:image\/webp;base64,/u);
    const unter = lern?.querySelector('figcaption')?.textContent ?? '';
    assert.match(unter, /Abbildung 1 · Kapitel 1/u);
    assert.match(unter, /Wo sie vom Text abweicht, gilt der Text\./u);
    assert.match(unter, /„Neuer Begriff“/u);
    assert.equal(lern?.querySelector('[data-pruef="abbildung-abweichungen"] summary')?.textContent, 'Abweichungen vom Text (1)');
    assert.equal(lern?.querySelector('a.abbildung-beleg')?.getAttribute('href'), '#theorie/k1/k1-p1');
    // Belege aus Kap. 13 (Glossar, kein Originaltext) bleiben Text (R11); Abweichungen am Bildschirm zugeklappt
    assert.deepEqual([...lern?.querySelectorAll('.abbildung-beleg') ?? []].map((x) => `${x.tagName}:${x.textContent ?? ''}`), ['A:k1-p1', 'SPAN:k13-t1']);
    assert.equal(lern?.querySelector('details[data-pruef="abbildung-abweichungen"]')?.hasAttribute('open'), false);
    const knopf = lern?.querySelector('[data-pruef="abbildung-gross"]');
    assert.equal(knopf?.getAttribute('aria-label'), 'Abbildung vergrößern: Probe-Titel');
    assert.ok(lern?.querySelector('dialog.abbildung-dialog img'), 'Dialog mit dem Bild in voller Größe');

    // Leinwand: dieselbe Zeichnung ohne Knopf, Dialog und Links
    const lw = baueTheorie({ inhalte: probe, kapitel: 1, version: VERSION, bedienbar: false });
    assert.equal(lw.querySelectorAll('figure.abbildung').length, 2);
    assert.equal(lw.querySelector('[data-pruef="abbildung-gross"], dialog'), null);
    assert.equal(lw.querySelector('a.abbildung-beleg'), null);
    // … und die Abweichungen offen: auf der Leinwand kann niemand aufklappen (R11)
    const lwAbw = [...lw.querySelectorAll('details[data-pruef="abbildung-abweichungen"]')];
    assert.ok(lwAbw.length === 2 && lwAbw.every((d) => d.hasAttribute('open')), 'Leinwand: Abweichungen offen');

    // Druck (R11/R12): der Dialog geht erst auf, wenn die Bilder dekodiert sind; ein zweiter Klick
    // solange bleibt ohne Wirkung, afterprint stellt Titel und Seite wieder her
    const Bild = (dom.window as unknown as { HTMLImageElement: { prototype: { decode?: unknown } } }).HTMLImageElement.prototype;
    const altDecode = Bild.decode;
    let freigeben = (): void => undefined;
    const dekodiert = new Promise<void>((r) => { freigeben = r; });
    Bild.decode = () => dekodiert;
    const altPrint = dom.window.print;
    let drucke = 0;
    (dom.window as unknown as { print: () => void }).print = () => { drucke += 1; };
    try {
      document.body.replaceChildren(el);
      document.title = 'Vorher';
      const druckKnopf = el.querySelector<HTMLButtonElement>('[data-pruef="kapitel-drucken"]');
      assert.ok(druckKnopf);
      druckKnopf.click();
      druckKnopf.click();
      assert.equal(document.querySelectorAll('.druck-bogen').length, 1, 'ein Bogen trotz Doppelklick');
      assert.ok((document.querySelector('.druck-bogen')?.querySelectorAll('img').length ?? 0) > 0, 'Bogen mit Bild');
      await Promise.resolve();
      assert.equal(drucke, 0, 'kein Druck vor dem Dekodieren');
      freigeben();
      await dekodiert;
      await new Promise((r) => setTimeout(r, 0));
      assert.equal(drucke, 1, 'genau ein Druck nach dem Dekodieren');
      dom.window.dispatchEvent(new dom.window.Event('afterprint'));
      assert.equal(document.title, 'Vorher');
      assert.equal(document.querySelector('.druck-bogen'), null);
      assert.equal(document.body.classList.contains('druckt-bogen'), false);
    } finally {
      Bild.decode = altDecode;
      (dom.window as unknown as { print: unknown }).print = altPrint;
      document.body.replaceChildren();
    }

    // Abbildungsverzeichnis: Vorschaubild (schmückend) und Titel mit Sprung zur Abbildung
    const gal = galerie(probe);
    const zeile = gal?.querySelector('[data-pruef="galerie-abbildung-abb-2"]');
    assert.equal(zeile?.getAttribute('href'), '#theorie/k1/abb-2');
    assert.equal(zeile?.querySelector('img')?.getAttribute('alt'), '');
    assert.match(zeile?.textContent ?? '', /Probe-Titel/u);
  } finally {
    g['HTMLDialogElement'] = vorher;
    setzeAbbildungsBilder({});
  }
});
