/*
 * Lesezeit der Story (R73): Die Angaben auf der Seite – Knopf „Kurzfassung (etwa n Minuten)“ im Auftakt und die Zeile der
 * Startseite („etwa 25 Minuten, kurz etwa n“) – stimmen mit der Messung aus werkzeuge/lesezeit.mjs überein (Zählregel dort).
 * Kurzfassung: die Angabe ist die gemessene Lesezeit, auf ganze Minuten gerundet. Ganzer Weg: die gemessene Lesezeit
 * (Mini-Aufgaben und Vergleich als Text mitgezählt) plus Zeit zum Ausprobieren – die Angabe liegt höchstens 6 Minuten darüber.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';

type Messung = { lang: { woerter: number; minuten: number; schritte: [string, number][] }; kurz: { woerter: number; minuten: number; schritte: [string, number][] }; akte: { id: string; titel: string; woerter: number; minuten: number }[] };
type Schranke = { woerter: number; minuten: number; akte: { id: string; woerter: number; minuten: number }[] };
type Optionen = { g?: unknown; themaTitel?: (id: string) => string | null; lesezeit?: unknown };
const lib = (await import(String('../werkzeuge/lesezeit.mjs'))) as {
  messeLesezeit: (o?: Optionen) => Promise<Messung>;
  messeSchranke: (o?: Optionen) => Promise<Schranke>;
  zaehleWoerter: (el: Element) => number;
  lesezeitDaten: (m: Messung) => { woerterJeMinute: number; lang: Record<string, number>; kurz: Record<string, number> };
  formatiereDaten: (d: ReturnType<typeof lib.lesezeitDaten>) => string;
  DATEN_DATEI: string;
  AKT_MAX_MINUTEN: number;
  WEG_MAX_WOERTER: number;
};
const { messeLesezeit, messeSchranke, zaehleWoerter } = lib;
const m = await messeLesezeit();
after(() => (globalThis as unknown as { window?: { close(): void } }).window?.close());
const { inhalte } = await import('../src/inhalte/index.ts');
const { W } = await import('../src/ui/woerter.ts');

const zahl = (text: string, muster: RegExp): number => {
  const t = muster.exec(text);
  assert.ok(t, `keine Minutenangabe in „${text}“`);
  return Number(t[1]);
};

test('Kurzfassung: die Angabe im Auftakt ist die gemessene Lesezeit, gerundet', () => {
  const g = inhalte.geschichte;
  assert.ok(g);
  const angabe = zahl(g.auftakt.kurz, /etwa (\d+) Minuten/u);
  assert.equal(angabe, Math.round(m.kurz.minuten), `gemessen ${m.kurz.woerter} Wörter ≈ ${m.kurz.minuten.toFixed(1)} Minuten`);
});

test('Startseite: dieselbe Angabe für die Kurzfassung; der ganze Weg liegt zwischen Lesezeit und Lesezeit plus Ausprobieren', () => {
  const meta = W.start.storyMeta(8);
  assert.equal(zahl(meta, /Kurzfassung: etwa (\d+) Minuten/u), Math.round(m.kurz.minuten));
  const lang = zahl(meta, /etwa (\d+) Minuten/u);
  assert.ok(lang >= Math.round(m.lang.minuten) && lang <= Math.round(m.lang.minuten) + 6,
    `ganzer Weg: Angabe ${lang}, gemessen ${m.lang.woerter} Wörter ≈ ${m.lang.minuten.toFixed(1)} Minuten`);
});

test('Dokumente nennen dieselbe Dauer der Kurzfassung wie die Messung (Drehbuch, Inhaltsformat, Stil)', async () => {
  const { readFileSync } = await import('node:fs');
  const soll = Math.round(m.kurz.minuten);
  const stellen: [string, RegExp][] = [
    ['docs/DREHBUCH.md', /Kurzfassung \(etwa (\d+) Minuten\)/gu],
    ['docs/INHALTSFORMAT.md', /\*\*Kurzfassung \(P17\.5, etwa (\d+) Minuten/gu],
    ['docs/STIL.md', /Kurzfassung: etwa (\d+) Minuten/gu],
  ];
  for (const [datei, muster] of stellen) {
    const treffer = [...readFileSync(new URL(`../${datei}`, import.meta.url), 'utf8').matchAll(muster)].map((x) => Number(x[1]));
    assert.ok(treffer.length > 0, `${datei}: keine Angabe gefunden`);
    for (const n of treffer) assert.equal(n, soll, `${datei}: „etwa ${n} Minuten“, gemessen ${m.kurz.minuten.toFixed(1)}`);
  }
});

test('Zählregel: ohne Screenreader-Text, Grafiken, Balkentafel und Kicker; zugeklappt nur die Titelzeile', () => {
  const el = document.createElement('article');
  el.innerHTML = '<p class="gs-kicker">Mai 2027</p><p>Drei Wörter hier – 450 Essen.</p><span class="nur-sr">versteckt bleibt</span>'
    + '<span aria-hidden="true">Bild</span><ul class="gs-stand"><li>Geld</li></ul><details><summary>Mehr dazu</summary><p>nicht gezählt</p></details>';
  assert.equal(zaehleWoerter(el), 7);
  // Blockgrenzen trennen, Auszeichnungen im Satz nicht
  const b = document.createElement('article');
  b.innerHTML = '<p>Theo Lot</p><p>Gerüst lose, <b>Ri</b><span>siko</span>.</p>';
  assert.equal(zaehleWoerter(b), 5);
});

/* ------------------------------------------------------------------ P19.3: je Akt, Schranke, Restzeit -- */

test('Daten der Restzeit (src/geschichte/lesezeit-daten.json) stimmen mit der Messung überein – sonst: node werkzeuge/lesezeit.mjs --schreibe', async () => {
  const { readFileSync } = await import('node:fs');
  const datei = readFileSync(new URL(`../${lib.DATEN_DATEI}`, import.meta.url), 'utf8');
  assert.equal(datei, lib.formatiereDaten(lib.lesezeitDaten(m)), 'die Lesezeit-Daten sind veraltet: node werkzeuge/lesezeit.mjs --schreibe');
});

/** Prüft eine Geschichte mit Akten gegen Messung und Schranke; `angekuendigt` = Minuten, die die Seite für den ganzen Weg nennt (null = keine Angabe). */
async function pruefeAkte(g: import('../src/geschichte/typen.ts').Geschichte, opt: Optionen, angekuendigt: number | null): Promise<void> {
  const E = await import('../src/geschichte/engine.ts');
  const { baueSchritt, ortText } = await import('../src/ui/flaechen/geschichte.ts');
  const messung = await messeLesezeit(opt);
  const daten = lib.lesezeitDaten(messung);
  const schranke = await messeSchranke({ ...opt, lesezeit: daten });
  // Messung je Akt: Summe seiner Schritte; die Akte decken alles außer Auftakt und Ende ab
  assert.equal(messung.akte.length, g.akte.length);
  const mitte = messung.lang.schritte.filter(([k]) => k !== 'auftakt' && k !== 'ende').reduce((x, [, n]) => x + n, 0);
  assert.equal(messung.akte.reduce((x, a) => x + a.woerter, 0), mitte, 'Akte + Auftakt + Ende = ganzer Weg');
  // Schranke: nie unter der Messung, je Akt höchstens AKT_MAX_MINUTEN, ganzer Weg höchstens WEG_MAX_WOERTER
  // Auftakt zählt zum ersten, das Ende zum letzten Akt
  const wo = (k: string): number => messung.lang.schritte.find(([x]) => x === k)?.[1] ?? 0;
  assert.ok((schranke.akte[0]?.woerter ?? 0) >= (messung.akte[0]?.woerter ?? 0) + wo('auftakt'), 'Schranke des ersten Akts enthält den Auftakt');
  assert.ok((schranke.akte.at(-1)?.woerter ?? 0) >= (messung.akte.at(-1)?.woerter ?? 0) + wo('ende'), 'Schranke des letzten Akts enthält das Ende');
  assert.equal(schranke.akte.reduce((x, a) => x + a.woerter, 0), schranke.woerter, 'die Akte zusammen sind der ganze Weg (Auftakt beim ersten, Ende beim letzten Akt)');
  assert.ok(schranke.woerter >= messung.lang.woerter, `Schranke ${schranke.woerter} < Messung ${messung.lang.woerter}`);
  for (const [i, a] of schranke.akte.entries()) {
    assert.ok(a.woerter >= (messung.akte[i]?.woerter ?? 0), `Akt ${a.id}: Schranke unter der Messung`);
    assert.ok(a.minuten <= lib.AKT_MAX_MINUTEN, `Akt ${a.id}: obere Schranke ${a.minuten.toFixed(1)} Minuten (höchstens ${lib.AKT_MAX_MINUTEN})`);
  }
  assert.ok(schranke.woerter <= lib.WEG_MAX_WOERTER, `ganzer Weg: obere Schranke ${schranke.woerter} Wörter (höchstens ${lib.WEG_MAX_WOERTER})`);
  if (angekuendigt !== null) assert.ok(schranke.minuten <= angekuendigt + 6, `ganzer Weg: obere Schranke ${schranke.minuten.toFixed(1)} Minuten, angekündigt ${angekuendigt}`);
  // die Seite nennt je Akt die gemessene Dauer (Kopfkarte, gerundet, mindestens eine Minute) – mit den Daten der Messung
  const gerundet = (n: number): number => Math.max(1, Math.round(n));
  for (const [i, a] of g.akte.entries()) {
    const erste = a.stationen[0] as string;
    const el = baueSchritt({ g, stand: { ...E.neuerStand(), schritt: { ort: 'kapitel', kapitel: erste, teil: 'szene' } }, bedienbar: true, themaTitel: () => null, tue: () => undefined, lesezeit: daten });
    const kicker = el.querySelector(`[data-pruef="akt-kopf-${a.id}"] .gs-kicker`)?.textContent ?? '';
    const n = /etwa (\d+) Minuten|etwa (eine) Minute/u.exec(kicker);
    assert.ok(n, `Akt ${a.id}: keine Dauer in „${kicker}“`);
    assert.equal(n[2] === 'eine' ? 1 : Number(n[1]), gerundet(messung.akte[i]?.minuten ?? 0), `Akt ${a.id}: Angabe der Seite ≠ Messung (${messung.akte[i]?.minuten.toFixed(1)} Minuten)`);
  }
  // die Restzeit der Ortszeile: Wörter ab dem ersten Schritt der Geschichte (nach dem Auftakt) bis zum Ende
  const ersteStation = g.kapitel[0]?.id as string;
  const rest = messung.lang.schritte.filter(([k]) => k !== 'auftakt').reduce((x, [, w]) => x + w, 0);
  const zeile = ortText(g, { ...E.neuerStand(), schritt: { ort: 'kapitel', kapitel: ersteStation, teil: 'szene' } }, daten);
  assert.match(zeile, new RegExp(`^Station 1 von ${g.kapitel.length} · Akt I · noch etwa ${Math.max(1, Math.round(rest / lib.lesezeitDaten(messung).woerterJeMinute))} Minuten$`, 'u'), zeile);
  // Kurzfassung: eigene Tabelle, die Zeile am Anfang nennt die Minuten der Kurzfassung ohne Auftakt
  const kurzRest = messung.kurz.schritte.filter(([k]) => k !== 'auftakt').reduce((x, [, w]) => x + w, 0);
  assert.match(ortText(g, { ...E.neuerStand(true), schritt: { ort: 'kapitel', kapitel: ersteStation, teil: 'szene' } }, daten), new RegExp(`noch etwa ${Math.max(1, Math.round(kurzRest / 200))} Minuten?$`, 'u'));
}

test('Lesezeit je Akt: Messung, Kopfkarte, Restzeit und obere Schranke an einer synthetischen Story mit 14 Stationen in drei Akten', async () => {
  const { synthetischeAkteStory } = await import('./hilfen/geschichte-akte.ts');
  const g = synthetischeAkteStory(inhalte.geschichte as never);
  await pruefeAkte(g, { g, themaTitel: () => null }, null);
});

test('Lesezeit je Akt: hat die echte Story Akte, gelten dieselben Prüfungen mit der angekündigten Zeit', async () => {
  const g = inhalte.geschichte;
  assert.ok(g);
  if (g.akte.length === 0) return; // vor P19.6: keine Akte – die Gegenprobe „ohne Akte wie bisher“ steht in tests/geschichte-akte.test.ts
  await pruefeAkte(g, {}, zahl(W.start.storyMeta(g.kapitel.length), /etwa (\d+) Minuten/u));
});

test('Obere Schranke der echten Story liegt nicht unter der Messung und im Rahmen der Angabe der Startseite', async () => {
  const sc = await messeSchranke();
  assert.ok(sc.woerter >= m.lang.woerter, `Schranke ${sc.woerter} < Messung ${m.lang.woerter}`);
  const angabe = zahl(W.start.storyMeta(8), /etwa (\d+) Minuten/u);
  assert.ok(sc.minuten <= angabe + 6, `Schranke ${sc.minuten.toFixed(1)} Minuten, angekündigt ${angabe}`);
});
