// Rechenwerte im Theorie-Text (R75, Vorsorge; R76 geschärft): Im Beispiel „Wärmepumpe der Grundschule“ (k14.5) werden die
// Punkte aus Skalen und Optionen, die Tabellenzeilen aus Gewicht × Punkte, Summenzeile, Rechenzeile, Empfehlung, die
// Gewichte im Aufklapper sowie Marken und Text jeder Reglerstufe nachgerechnet. In k15.5 werden die Stufen des Reglers
// „Bearbeitungspriorität“ (Titel, Marke) und die Posten der Sortierung „Vorrangig oder nicht?“ (Seite, Produkt, Klasse in
// der Erklärung) aus der Matrixregel geprüft. Jede Prüfung liefert eine Fehlerliste; die Gegenproben bringen die sechs
// Mutationen aus R76 ein und verlangen, dass jede auffällt. Regeln: V2.4 HB 3.2 (Punkte und Gewichte, 41 : 35, 31 : 31)
// und HB 2 (Produkte 1 bis 4 beobachten, 5 bis 9 gezielt, 10 bis 25 vorrangig, Auswirkung 5 immer vorrangig).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (datei: string): string => readFileSync(join(WURZEL, 'inhalte', 'theorie', datei), 'utf8');

const zahl = (s: string): number => Number(s.replace(/\./gu, ''));

/** Teil zwischen einer Marke und dem nächsten Vorkommen einer Endmarke (oder Textende). */
function ausschnitt(md: string, start: string, ende: string): string {
  const a = md.indexOf(start);
  if (a < 0) return '';
  const e = md.indexOf(ende, a + start.length);
  return md.slice(a, e < 0 ? undefined : e);
}

type Kriterium = 'Kosten' | 'Zieltermin' | 'Funktion';
const KRITERIEN: Kriterium[] = ['Kosten', 'Zieltermin', 'Funktion'];

/** Alle Abweichungen im Beispiel k14.5; leer heißt: alles nachgerechnet. */
function fehlerK14(md: string): string[] {
  const f: string[] = [];
  const beispiel = ausschnitt(md, '::: abschnitt k14.5', '::: abschnitt k14.6');
  if (!beispiel) return ['Abschnitt k14.5 fehlt'];

  // Skalen und Gewichte aus dem Aufklapper
  const skala = /Kosten bis ([\d.]+), ([\d.]+), ([\d.]+) oder ([\d.]+) € geben 5, 4, 3 oder 2 Punkte, mehr gibt 1\. Terminfolgen bis (\d+), (\d+), (\d+) oder (\d+) Kalendertage ebenso\. Volle Funktion gibt 5 Punkte\./u.exec(beispiel);
  const gew = /Die Gewichte: Kosten (\d), Zieltermin (\d), Funktion (\d)\./u.exec(beispiel);
  if (!skala || !gew) return ['Skalen oder Gewichte im Aufklapper nicht lesbar'];
  const kostenGrenzen = skala.slice(1, 5).map(zahl);
  const terminGrenzen = skala.slice(5, 9).map(Number);
  const punkte = (wert: number, grenzen: number[]): number => {
    const i = grenzen.findIndex((g) => wert <= g);
    return i < 0 ? 1 : 5 - i;
  };
  const gewicht: Record<Kriterium, number> = { Kosten: Number(gew[1]), Zieltermin: Number(gew[2]), Funktion: Number(gew[3]) };

  // Optionen und ihre Punkte
  const optionen: Record<'A' | 'B', Record<Kriterium, number>> = { A: { Kosten: 0, Zieltermin: 0, Funktion: 0 }, B: { Kosten: 0, Zieltermin: 0, Funktion: 0 } };
  for (const o of ['A', 'B'] as const) {
    const m = new RegExp(`\\*\\*${o} · [^:*]+:\\*\\* ([\\d.]+) € Zusatzkosten, Zieltermin (\\d+) Kalendertage später, volle Funktion\\.`, 'u').exec(beispiel);
    if (!m) { f.push(`Option ${o} nicht lesbar`); continue; }
    optionen[o] = { Kosten: punkte(zahl(m[1] ?? ''), kostenGrenzen), Zieltermin: punkte(Number(m[2]), terminGrenzen), Funktion: 5 };
  }
  const summe = (o: 'A' | 'B', w: Record<Kriterium, number>): number => KRITERIEN.reduce((s, k) => s + w[k] * optionen[o][k], 0);

  // Tabellenzeilen: Gewicht wie im Aufklapper, Punkte wie aus den Skalen
  for (const k of KRITERIEN) {
    const m = new RegExp(`^\\| ${k} \\| (\\d) \\| (\\d) \\| (\\d) \\|$`, 'mu').exec(beispiel);
    if (!m) { f.push(`Tabellenzeile ${k} fehlt`); continue; }
    if (Number(m[1]) !== gewicht[k]) f.push(`Tabelle ${k}: Gewicht ${m[1]} statt ${gewicht[k]} (Aufklapper)`);
    if (Number(m[2]) !== optionen.A[k]) f.push(`Tabelle ${k}: A ${m[2]} statt ${optionen.A[k]} Punkte`);
    if (Number(m[3]) !== optionen.B[k]) f.push(`Tabelle ${k}: B ${m[3]} statt ${optionen.B[k]} Punkte`);
  }
  const sA = summe('A', gewicht);
  const sB = summe('B', gewicht);
  const sz = /^\| \*\*Gewichtete Summe\*\* \| \| \*\*(\d+)\*\* \| \*\*(\d+)\*\* \|$/mu.exec(beispiel);
  if (!sz) f.push('Summenzeile fehlt');
  else if (Number(sz[1]) !== sA || Number(sz[2]) !== sB) f.push(`Summenzeile ${sz[1]} : ${sz[2]} statt ${sA} : ${sB}`);

  // Rechenzeile „A erreicht g × p + … = n Punkte, B … = m“
  const rz = /A erreicht ((?:\d × \d \+ ){2}\d × \d) = (\d+) Punkte, B ((?:\d × \d \+ ){2}\d × \d) = (\d+)\./u.exec(beispiel);
  if (!rz) f.push('Rechenzeile fehlt');
  else {
    for (const [o, ausdruck, ergebnis] of [['A', rz[1], rz[2]], ['B', rz[3], rz[4]]] as const) {
      const glieder = (ausdruck ?? '').split(' + ').map((g) => g.split(' × ').map(Number));
      KRITERIEN.forEach((k, i) => {
        const [g, p] = glieder[i] ?? [];
        if (g !== gewicht[k] || p !== optionen[o][k]) f.push(`Rechenzeile ${o}, ${k}: ${g} × ${p} statt ${gewicht[k]} × ${optionen[o][k]}`);
      });
      const soll = summe(o, gewicht);
      if (Number(ergebnis) !== soll) f.push(`Rechenzeile ${o}: ${ergebnis} statt ${soll}`);
    }
  }
  const empf = /Unter dieser Terminpriorität empfiehlt die Projektsteuerung ([AB])\./u.exec(beispiel);
  if (!empf || empf[1] !== (sA > sB ? 'A' : 'B')) f.push('Empfehlung nennt nicht die Option mit der höheren Summe');

  // Reglerstufen: Marke aus Gewichten, Text nennt den Führenden
  const regler = ausschnitt(beispiel, 'titel: Termingewicht und Rangfolge', '\n:::\n:::');
  const stufen = [...regler.matchAll(/titel: Termingewicht (\d)\nmarke: "A (\d+) : B (\d+)"\n---\n([^\n]+)/gu)];
  if (stufen.map((s) => Number(s[1])).join() !== '1,2,3,4,5') f.push('Regler: nicht die Stufen 1 bis 5');
  for (const s of stufen) {
    const w = Number(s[1]);
    const g = { ...gewicht, Zieltermin: w };
    const a = summe('A', g);
    const b = summe('B', g);
    if (Number(s[2]) !== a || Number(s[3]) !== b) f.push(`Stufe ${w}: Marke A ${s[2]} : B ${s[3]} statt A ${a} : B ${b}`);
    const text = s[4] ?? '';
    const nenntA = /\bA liegt|Ersatzgerät/u.test(text);
    const nenntB = /\bB liegt|Abwarten/u.test(text);
    const gleich = /Gleichstand/u.test(text);
    const passt = a > b ? nenntA && !nenntB && !gleich : a < b ? nenntB && !nenntA && !gleich : gleich && !nenntA && !nenntB;
    if (!passt) f.push(`Stufe ${w}: Text nennt nicht ${a > b ? 'A' : a < b ? 'B' : 'den Gleichstand'} als führend`);
    if (w === gewicht.Zieltermin && (a !== sA || b !== sB)) f.push(`Stufe ${w} ist nicht die Tabelle`);
  }
  return f;
}

type Klasse = 'beobachten' | 'gezielt bearbeiten' | 'vorrangig bearbeiten';
const klasse = (w: number, a: number): Klasse => (w * a >= 10 || a === 5 ? 'vorrangig bearbeiten' : w * a >= 5 ? 'gezielt bearbeiten' : 'beobachten');

/** Alle Abweichungen in k15.5 (Regler und Sortierung); leer heißt: alles nach der Matrixregel. */
function fehlerK15(md: string): string[] {
  const f: string[] = [];
  const teil = ausschnitt(md, '::: abschnitt k15.5', '::: abschnitt k15.6');
  if (!teil) return ['Abschnitt k15.5 fehlt'];

  const regler = ausschnitt(teil, 'titel: Bearbeitungspriorität eines Risikos', '\n:::\n:::');
  const stufen = [...regler.matchAll(/titel: ([^\n]+)\nmarke: ([^\n]+)/gu)].map((m) => [m[1], m[2]]);
  const soll = [
    ['Produkt 1 bis 4', 'Beobachten'],
    ['Produkt 5 bis 9', 'Gezielt bearbeiten'],
    ['Produkt 10 bis 25 – oder Auswirkung 5', 'Vorrangig bearbeiten'],
  ];
  if (JSON.stringify(stufen) !== JSON.stringify(soll)) f.push(`Regler-Stufen ${JSON.stringify(stufen)} statt ${JSON.stringify(soll)}`);

  const sortierung = ausschnitt(teil, 'titel: Vorrangig oder nicht?', '\n:::\n:::');
  const posten = [...sortierung.matchAll(/seite: (links|rechts)\n---\nW (\d) · A (\d)[^\n]*\n\n### Erklärung\n([^\n]+)/gu)];
  if (posten.length < 4) f.push(`nur ${posten.length} Posten gefunden`);
  if (!posten.some((p) => Number(p[3]) === 5 && Number(p[2]) * Number(p[3]) < 10)) f.push('kein Beispiel für die Regel „Auswirkung 5“');
  for (const p of posten) {
    const w = Number(p[2]);
    const a = Number(p[3]);
    const k = klasse(w, a);
    const name = `W ${w} · A ${a}`;
    if (p[1] !== (k === 'vorrangig bearbeiten' ? 'links' : 'rechts')) f.push(`${name}: falsche Seite`);
    const erkl = p[4] ?? '';
    const prod = /Produkt (?:nur )?(\d+)/u.exec(erkl);
    if (!prod || Number(prod[1]) !== w * a) f.push(`${name}: Erklärung nennt nicht Produkt ${w * a}`);
    const gesagt = /vorrangig/iu.test(erkl) ? 'vorrangig bearbeiten' : /gezielt bearbeiten/iu.test(erkl) ? 'gezielt bearbeiten' : /beobachten/iu.test(erkl) ? 'beobachten' : '';
    if (gesagt !== k) f.push(`${name}: Erklärung sagt „${gesagt || 'nichts'}“ statt „${k}“`);
  }
  return f;
}

const K14 = lies('k14-entscheidungsvorlage.md');
const K15 = lies('k15-vorgaenge.md');

/** Ersetzt genau ein Vorkommen und stellt sicher, dass es das gab (sonst prüfte die Gegenprobe nichts). */
function mutiere(md: string, alt: string, neu: string): string {
  assert.ok(md.includes(alt), `Gegenprobe: „${alt}“ steht nicht im Text`);
  return md.replace(alt, neu);
}

test('k14.5: Punkte, Tabelle, Summen, Rechenzeile, Gewichte und Reglerstufen stimmen', () => {
  assert.deepEqual(fehlerK14(K14), []);
});

test('k14.5: Gegenproben – jede Rechen- oder Textmutation fällt auf', () => {
  const mutationen: [string, string][] = [
    ['| Kosten | 3 | 2 | 5 |', '| Kosten | 3 | 3 | 5 |'],
    ['= 41 Punkte', '= 43 Punkte'],
    ['A liegt vorn: Sieben', 'B liegt vorn: Sieben'],
    ['Die Gewichte: Kosten 3, Zieltermin 5, Funktion 2.', 'Die Gewichte: Kosten 2, Zieltermin 5, Funktion 3.'],
    ['marke: "A 31 : B 31"', 'marke: "A 31 : B 32"'],
    ['| **Gewichtete Summe** | | **41** | **35** |', '| **Gewichtete Summe** | | **41** | **36** |'],
    ['80.000 € Zusatzkosten', '60.000 € Zusatzkosten'],
    ['empfiehlt die Projektsteuerung A.', 'empfiehlt die Projektsteuerung B.'],
  ];
  for (const [alt, neu] of mutationen) assert.ok(fehlerK14(mutiere(K14, alt, neu)).length > 0, `überlebt: „${alt}“ → „${neu}“`);
});

test('k15.5: Reglerstufen und Posten der Sortierung „Vorrangig oder nicht?“ folgen der Matrixregel', () => {
  assert.deepEqual(fehlerK15(K15), []);
});

test('k15.5: Gegenproben – jede Mutation an Stufen, Seiten und Erklärungen fällt auf', () => {
  const mutationen: [string, string][] = [
    ['Produkt 9: gezielt bearbeiten.', 'Produkt 9: vorrangig bearbeiten.'],
    ['titel: Produkt 5 bis 9', 'titel: Produkt 5 bis 12'],
    ['seite: links\n---\nW 1 · A 5', 'seite: rechts\n---\nW 1 · A 5'],
    ['Produkt 3: beobachten.', 'Produkt 4: beobachten.'],
    ['marke: Gezielt bearbeiten', 'marke: Beobachten'],
    ['Produkt 16, also vorrangig.', 'Produkt 16, also gezielt bearbeiten.'],
  ];
  for (const [alt, neu] of mutationen) assert.ok(fehlerK15(mutiere(K15, alt, neu)).length > 0, `überlebt: „${alt}“ → „${neu}“`);
});
