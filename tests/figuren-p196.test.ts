// Nebenfiguren, Stimmen und die neuen Bilder von P19.6 (src/grafik/figuren.ts): Porträts von Marlene Ranzen, Bernd Spitzfeder und Ewald Pfennig in der Art der
// Hauptfiguren, zwei Stimmen ohne Gesicht, elf Gegenstände für die neuen Stationen – deterministisch, zugänglich beschrieben, ohne Farbwerte, jede Klasse gestaltet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AKZENTE } from '../src/stil/akzente.ts';
import {
  FIGUREN, FIGUR_NAME, GIMMICKS, NEBENFIGUREN, NEBENFIGUR_AKZENT, SPRECHER_NAME, STIMMEN, gimmick, gimmickText, portraet, portraetText,
  type GimmickName, type Nebenfigur, type Stimme, type Stimmung,
} from '../src/grafik/figuren.ts';
import { NEBENFIGUREN as GESCHICHTE_NEBEN, SPRECHER, STIMMEN as GESCHICHTE_STIMMEN, FIGUREN as GESCHICHTE_FIGUREN } from '../src/geschichte/typen.ts';

const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string) => { window: Window & typeof globalThis } };
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const grafikCss = readFileSync(resolve(WURZEL, 'src/stil/grafik.css'), 'utf8');
const tokens = readFileSync(resolve(WURZEL, 'src/stil/tokens.css'), 'utf8');
const STIMMUNGEN: Stimmung[] = ['neutral', 'froh', 'besorgt'];
const NEU: readonly GimmickName[] = ['stuhlreihen', 'schlagzeile', 'glocke-haken', 'angebotskalender', 'pinnwand', 'haftzettel', 'gespraechskarten', 'musskarten', 'genehmigung-auflage', 'hallenboden', 'tasse'];
const NEBEN_UND_STIMMEN = [...NEBENFIGUREN, ...STIMMEN] as const;

test('Sprecher: die Listen der Grafik und der Story stimmen überein; die Nebenfiguren stehen nicht in FIGUREN (sonst erschienen sie im Auftakt und auf der Startseite)', () => {
  assert.deepEqual([...NEBENFIGUREN], [...GESCHICHTE_NEBEN]);
  assert.deepEqual([...STIMMEN], [...GESCHICHTE_STIMMEN]);
  assert.deepEqual([...GESCHICHTE_FIGUREN], FIGUREN.filter((f) => f !== 'sie'));
  assert.deepEqual([...SPRECHER], [...GESCHICHTE_FIGUREN, ...NEBENFIGUREN, ...STIMMEN]);
  for (const f of NEBEN_UND_STIMMEN) assert.ok(!(FIGUREN as readonly string[]).includes(f), f);
  assert.deepEqual(Object.keys(SPRECHER_NAME).sort(), [...SPRECHER].sort());
  for (const f of GESCHICHTE_FIGUREN) assert.deepEqual(SPRECHER_NAME[f], FIGUR_NAME[f]);
  for (const f of SPRECHER) assert.ok(SPRECHER_NAME[f].name.length > 0 && SPRECHER_NAME[f].rolle.length > 0, f);
  assert.deepEqual(SPRECHER_NAME.ranzen, { name: 'Marlene Ranzen', rolle: 'Elternvertreterin' });
  assert.deepEqual(SPRECHER_NAME.spitzfeder, { name: 'Bernd Spitzfeder', rolle: 'Lokalreporter' });
  assert.equal(SPRECHER_NAME.pfennig.name, 'Ewald Pfennig');
});

test('Nebenfiguren: Ton nach dem Drehbuch (Ranzen grün, Pfennig beere, Spitzfeder ohne Akzent), die Stimmen ohne Akzent', () => {
  assert.deepEqual(NEBENFIGUR_AKZENT, { ranzen: 'gruen', spitzfeder: 'keiner', pfennig: 'beere' });
  for (const a of Object.values(NEBENFIGUR_AKZENT)) assert.ok(a === 'keiner' || (AKZENTE as readonly string[]).includes(a), a);
  assert.match(portraet('ranzen'), /fig-ton-gruen/u);
  assert.match(portraet('spitzfeder'), /fig-ton-keiner/u);
  assert.match(portraet('pfennig'), /fig-ton-beere/u);
  for (const s of STIMMEN) assert.match(portraet(s), /fig-ton-keiner/u, s);
  // Haut und Haar nach dem Drehbuch: Ranzen Hautton 2, dunkel · Spitzfeder 1, grau · Pfennig 1, weiß
  assert.match(portraet('ranzen'), /fig-haut-2 fig-haar-dunkel/u);
  assert.match(portraet('spitzfeder'), /fig-haut-1 fig-haar-grau/u);
  assert.match(portraet('pfennig'), /fig-haut-1 fig-haar-weiss/u);
});

test('Porträts der Nebenfiguren: deterministisch, je Figur und Stimmung verschieden, klein ohne feine Details, die Stimmen ohne Stimmung', () => {
  for (const f of NEBENFIGUREN) {
    assert.equal(portraet(f), portraet(f));
    assert.equal(new Set(STIMMUNGEN.map((s) => portraet(f, { stimmung: s }))).size, 3, `${f}: drei Stimmungen`);
    assert.ok(portraet(f, { groesse: 'klein' }).length < portraet(f).length, `${f}: klein ohne feine Details`);
    assert.match(portraet(f, { groesse: 'klein' }), /width="56" height="56"/u);
  }
  const gross = [...NEBENFIGUREN, ...STIMMEN].map((f) => portraet(f));
  assert.equal(new Set(gross).size, 5, 'alle fünf Bilder sind verschieden');
  for (const f of STIMMEN) {
    assert.equal(portraet(f, { stimmung: 'froh' }), portraet(f), `${f}: ein Umriss lacht nicht`);
    assert.doesNotMatch(portraet(f), /fig-auge|fig-braue|fig-mund/u, `${f}: kein Gesicht`);
  }
  for (const f of NEBENFIGUREN) assert.match(portraet(f), /fig-auge/u, `${f}: mit Gesicht`);
});

test('Porträts: wohlgeformtes SVG, role="img", deutsche Bildbeschreibung als aria-label und <title>; dekorativ ohne beides', () => {
  const { window } = new JSDOM('');
  for (const f of NEBEN_UND_STIMMEN) for (const s of STIMMUNGEN) {
    const doc = new window.DOMParser().parseFromString(portraet(f, { stimmung: s }), 'image/svg+xml');
    assert.equal(doc.getElementsByTagName('parsererror').length, 0, `${f} ${s}`);
    const w = doc.documentElement;
    assert.equal(w.getAttribute('role'), 'img');
    assert.equal(w.getAttribute('aria-label'), portraetText(f, s));
    assert.equal(w.querySelector('title')?.textContent, portraetText(f, s));
    assert.equal(w.getAttribute('data-figur'), f);
  }
  assert.match(portraetText('ranzen'), /^Marlene Ranzen, Elternvertreterin: dunkle Locken im Dutt, grasgrüne Regenjacke, Schlüsselband mit bunten Anhängern und ein Klemmbrett mit Fragenliste\.$/u);
  assert.match(portraetText('spitzfeder'), /Trenchcoat.*Schiebermütze mit Bleistift im Mützenband.*Notizblock mit Gummiband/u);
  assert.match(portraetText('pfennig'), /Nadelstreifenanzug.*Lesebrille.*blauer Ordner.*Taschenuhr mit Kette/u);
  assert.match(portraetText('vertretung'), /kein Gesicht/u);
  assert.match(portraetText('vergabestelle'), /Hörer am Ohr/u);
  // Stimmung im Text: Ranzen „Sie“, Spitzfeder und Pfennig „Er“, die Stimmen keine
  assert.match(portraetText('ranzen', 'froh'), /Sie lacht\.$/u);
  assert.match(portraetText('spitzfeder', 'besorgt'), /Er schaut besorgt\.$/u);
  assert.match(portraetText('pfennig', 'froh'), /Er lacht\.$/u);
  assert.equal(portraetText('vertretung', 'besorgt'), portraetText('vertretung'));
  for (const f of NEBEN_UND_STIMMEN) assert.match(portraet(f, { dekorativ: true }), /aria-hidden="true" focusable="false"/u);
  assert.doesNotMatch(portraet('ranzen', { dekorativ: true }), /<title>|role="img"/u);
});

test('Porträts der Nebenfiguren: keine fremden Ressourcen, keine Farbwerte, keine Kennungen, keine Bewegung; jede Klasse ist in grafik.css gestaltet', () => {
  const alle = NEBEN_UND_STIMMEN.flatMap((f) => [portraet(f), portraet(f, { groesse: 'klein' }), ...STIMMUNGEN.map((s) => portraet(f, { stimmung: s }))]);
  const klassen = new Set<string>();
  for (const svg of alle) {
    assert.doesNotMatch(svg, /<image|<script|<foreignObject|<use|https?:\/\/(?!www\.w3\.org\/2000\/svg)/u);
    assert.doesNotMatch(svg, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\bstyle=|\b(?:fill|stroke)="(?!none)/iu, 'Farben nur über Klassen (tokens.css)');
    assert.doesNotMatch(svg, /<animate|@keyframes|\sid="|url\(|NaN|undefined|Infinity/u);
    for (const m of svg.matchAll(/class="([^"]*)"/gu)) for (const k of (m[1] ?? '').split(/\s+/u)) if (k) klassen.add(k);
  }
  assert.deepEqual([...klassen].filter((k) => !new RegExp(`\\.${k}(?![\\w-])`, 'u').test(grafikCss)), []);
  // die neuen Farben der Kleidung stehen als Token in tokens.css, nicht im Komponenten-CSS
  for (const t of ['--fig-regen', '--fig-trench', '--fig-muetze', '--fig-anzug', '--fig-nadel', '--fig-haar-weiss']) assert.match(tokens, new RegExp(`${t}:`, 'u'), t);
  assert.doesNotMatch(grafikCss, /#[0-9a-f]{3,8}\b/iu);
});

test('Nebenfiguren: das Erkennungszeichen steckt im Bild (Klemmbrett, Notizblock und Bleistift, Taschenuhr)', () => {
  assert.match(portraet('ranzen'), /fig-holz/u);
  assert.match(portraet('ranzen'), /gm-haken-gruen/u);
  assert.match(portraet('spitzfeder'), /fig-gummi/u);
  assert.match(portraet('spitzfeder'), /fig-stift/u);
  assert.match(portraet('pfennig'), /fig-kette/u);
  assert.match(portraet('pfennig'), /fig-uhrzeiger/u);
  assert.match(portraet('vergabestelle'), /fig-hoerer/u);
  assert.doesNotMatch(portraet('vertretung'), /fig-hoerer/u);
});

test('Neue Gegenstände: elf Bilder in GIMMICKS, je mit deutscher Bildbeschreibung, verschieden voneinander und von allen früheren', () => {
  for (const n of NEU) assert.ok((GIMMICKS as readonly string[]).includes(n), n);
  const svgs = GIMMICKS.map((n) => gimmick(n));
  assert.equal(new Set(svgs).size, GIMMICKS.length);
  const texte = GIMMICKS.map((n) => gimmickText(n));
  assert.equal(new Set(texte).size, GIMMICKS.length, 'jede Beschreibung nur einmal');
  assert.match(gimmickText('stuhlreihen'), /Stuhlreihen.*Hand/u);
  assert.match(gimmickText('schlagzeile'), /„Lindenbote“/u);
  assert.match(gimmickText('glocke-haken'), /Messingglocke.*Haken/u);
  assert.match(gimmickText('angebotskalender'), /Freitag.*Preisschild/u);
  assert.match(gimmickText('pinnwand'), /Fäden/u);
  assert.match(gimmickText('haftzettel'), /Haftzettel/u);
  assert.match(gimmickText('gespraechskarten'), /Gesprächskarten/u);
  assert.match(gimmickText('musskarten'), /Trichter.*Häkchen.*Kreuz/u);
  assert.match(gimmickText('genehmigung-auflage'), /Bescheid.*Auflage/u);
  assert.match(gimmickText('hallenboden'), /Holzdielen.*Fugen/u);
  assert.match(gimmickText('tasse'), /Tasse Tee/u);
  // Linienzeichnung wie die vorhandenen: nur gm-Klassen, nichts Farbiges im Markup
  for (const n of NEU) {
    const svg = gimmick(n);
    assert.match(svg, /data-gimmick="/u);
    for (const m of svg.matchAll(/class="([^"]*)"/gu)) for (const k of (m[1] ?? '').split(/\s+/u)) assert.match(k, /^(gm-|fig-gimmick)/u, `${n}: ${k}`);
  }
});

test('Stimmen sind vom Typ Stimme, Nebenfiguren vom Typ Nebenfigur (Typprobe)', () => {
  const n: Nebenfigur[] = [...NEBENFIGUREN];
  const s: Stimme[] = [...STIMMEN];
  assert.equal(n.length + s.length, 5);
});
