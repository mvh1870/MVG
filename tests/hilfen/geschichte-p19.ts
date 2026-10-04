/*
 * Synthetische Story für die Proben von P19.4 und P19.5 (nur Tests): die 14 Stationen mit Akten aus `geschichte-akte.ts`, dazu Echos
 * (E1: Station 1 → 5, E4: Station 3 → 12 in der Kurzfassung, E10: Station 10 → Ende nur im ganzen Weg), ein Entscheidungsbuch mit einem
 * Eintrag je Station, Vertiefungen und die Kürzungen der Kurzfassung. Alle Texte tragen eigene Marken, damit jede Probe sieht, welcher
 * Text auf der Seite steht.
 */
import type { BuchArt, Geschichte, Kapitel, Wertung } from '../../src/geschichte/typen.ts';
import { synthetischeAkteStory } from './geschichte-akte.ts';

export const WERTUNGEN: readonly Wertung[] = ['gut', 'vertretbar', 'falle'];

/** Die Marke eines Echos in einer Fassung: so erkennt eine Probe, welche Fassung auf der Seite steht. */
export const echoText = (id: string, w: Wertung): string => `Rückblick ${id} ${{ gut: 'Alpha', vertretbar: 'Beta', falle: 'Gamma' }[w]}.`;

export function platzVon(k: Kapitel, w: Wertung): number {
  return k.antworten.findIndex((a) => a.wertung === w);
}

export function p19Story(echt: Geschichte): Geschichte {
  const g = synthetischeAkteStory(echt);
  const k = (nr: number): Kapitel => g.kapitel[nr - 1] as Kapitel;
  g.echos = [['E1', 's1'], ['E4', 's3'], ['E10', 's10']].map(([id, quelle]) => ({
    id: id as string, quelle: quelle as string, fassungen: { gut: echoText(id as string, 'gut'), vertretbar: echoText(id as string, 'vertretbar'), falle: echoText(id as string, 'falle') },
  }));
  // E1: Zeile in Station 5 (Kurzfassung spielt sie) mit Fortsetzung für beide Wege; Platzhalter in der Folge der ersten Antwort
  k(5).szene.push({ figur: 'grundstein', zusatz: null, html: `${echoText('E1', 'gut')} Dann weiter.`, kurzfassung: true, echo: 'E1', fortsetzungHtml: 'Dann weiter.', fortsetzungKurzHtml: 'Kurz weiter.' });
  (k(5).antworten[0] as { folgeHtml: string }).folgeHtml = 'Die Folge. „{echo: E1}“ Ende der Folge.';
  // E4: Zeile in Station 12 ohne Fortsetzung (Station 3 wird in der Kurzfassung gespielt)
  k(12).szene.push({ figur: 'faden', zusatz: null, html: echoText('E4', 'gut'), kurzfassung: true, echo: 'E4' });
  // E10: im Ende, nur auf dem ganzen Weg (Station 10 fehlt in der Kurzfassung)
  g.ende.szene.push({ figur: 'lot', zusatz: null, html: `${echoText('E10', 'gut')} Und inzwischen steht alles drin.`, kurzfassung: false, echo: 'E10', fortsetzungHtml: 'Und inzwischen steht alles drin.' });
  g.ende.szene.push({ figur: 'schwung', zusatz: null, html: 'Immer da.', kurzfassung: true });
  // Entscheidungsbuch: ein Eintrag je Station, für alle Wege gleich
  const arten: BuchArt[] = ['beschluss', 'vermerk', 'uebergabe', 'beschluss-uebergabe'];
  g.buch = g.kapitel.map((kap, i) => {
    const art = arten[i % 4] as BuchArt;
    return {
      station: kap.id, art,
      entschiedenHtml: art === 'vermerk' ? 'niemand – es wurde nichts beschlossen' : `die Bürgermeisterin (${kap.nr})`,
      grundlageHtml: `Grundlage der Station ${kap.nr}`,
      ergebnisHtml: `Ergebnis der Station ${kap.nr}.`,
    };
  });
  // Vertiefungen in drei Formen
  k(2).vertiefung = { form: 'nachdenken', titel: 'Wann wird aus einem Hinweis ein Risiko?', absaetzeHtml: ['Die Frage der Vertiefung.'], antwortHtml: ['Die Antwort der Vertiefung.'] };
  k(5).vertiefung = { form: 'zweiter-fall', titel: 'Ein zweiter Wunsch', absaetzeHtml: ['Der zweite Fall.'], antwortHtml: ['Die Antwort zum Fall.'] };
  k(7).vertiefung = { form: 'warum-so', titel: 'Warum so?', absaetzeHtml: ['Erster Absatz.', 'Zweiter Absatz.'] };
  // Kürzungen der Kurzfassung in Station 3 (Kurzfassung): Folge, „So macht man es gut“, „Das steckt dahinter“
  for (const a of k(3).antworten) { a.folgeHtml = `Folge Eins. Folge Zwei nur lang für ${a.wertung}.`; a.folgeKurzHtml = `Folge Eins ${a.wertung}.`; }
  k(3).gutHtml = '<p>Regel eins.</p><p>Regel zwei nur lang.</p>';
  k(3).gutKurzHtml = '<p>Regel eins.</p>';
  k(3).dahinterHtml = 'Satz eins. Satz zwei nur lang.';
  k(3).dahinterKurzHtml = 'Satz eins.';
  return g;
}

/* ------------------------------------------------------------ neue Mini-Arten -- */
import type { Mini, MiniPosten } from '../../src/geschichte/typen.ts';
import { MINI_ARTEN } from '../../src/geschichte/mini-arten.ts';

const posten = (n: number, f: (i: number) => Partial<MiniPosten>): MiniPosten[] =>
  Array.from({ length: n }, (_, i) => ({ html: `Posten ${i + 1}`, loesung: '', erklaerungHtml: `Erklärung ${i + 1}.`, bild: null, ...f(i) }));
const feste = (art: 'matrix' | 'mappe' | 'pinnwand') => (MINI_ARTEN[art].uebersetzung.festeWahlen ?? []).map((w) => ({ ...w }));
const kopf = (art: Mini['art'], titel: string) => ({ art, titel, aufgabeHtml: `Aufgabe ${titel}`, bild: 'mappe' });

/** Matrix: drei Zettel, Lösungen stimmt · nachfordern · stimmt, Feld je Zettel */
export const matrixMini = (): Mini => ({
  ...kopf('matrix', 'Stimmt die Einstufung?'), wahlen: feste('matrix'),
  posten: posten(3, (i) => ({ loesung: ['stimmt', 'nachfordern', 'stimmt'][i] as string, feld: [[2, 3], [5, 5], [1, 2]][i] as [number, number] })),
});
/** Mappe: vier Abschnitte, zwei werden nachgefordert; Schlusssatz */
export const mappeMini = (): Mini => ({
  ...kopf('mappe', 'Fehlt etwas in der Mappe?'), wahlen: feste('mappe'), schlussHtml: 'Zwei Abschnitte wurden nachgefordert.',
  posten: posten(4, (i) => ({ loesung: ['annehmen', 'nachfordern', 'annehmen', 'nachfordern'][i] as string })),
});
/** Pinnwand: vier Zettel, drei Fäden (stimmt · doppelt · loses Ende) */
export const pinnwandMini = (): Mini => ({
  ...kopf('pinnwand', 'Stimmen die Verknüpfungen?'), wahlen: feste('pinnwand'), schlussHtml: 'Eine Verbindung hätte doppelt gezählt.',
  zettel: [{ id: 'z1', html: 'Risiko A' }, { id: 'z2', html: 'Prüfung B' }, { id: 'z3', html: 'Prognose C' }, { id: 'z4', html: 'Änderung D' }],
  posten: [
    { html: 'Faden eins', loesung: 'stimmt', erklaerungHtml: 'Erklärung 1.', bild: null, von: 'z1', nach: ['z2'] },
    { html: 'Faden zwei', loesung: 'doppelt', erklaerungHtml: 'Erklärung 2.', bild: null, von: 'z1', nach: ['z3'] },
    { html: 'Faden drei', loesung: 'nachfordern', erklaerungHtml: 'Erklärung 3.', bild: null, von: 'z4', nach: [] },
  ],
});
/** Bericht: sechs Zeilen, drei werden nachgefordert (Zeilen 2, 4, 5); Schlusssatz */
export const berichtMini = (): Mini => ({
  ...kopf('bericht', 'Was fehlt im Bericht?'), wahlen: [], schlussHtml: 'Drei Zeilen wurden nachgefordert.',
  posten: posten(6, (i) => ({ loesung: [1, 3, 4].includes(i) ? 'nachfordern' : 'ok' })),
});
/** Rückfragen: vier Gespräche, zwei dürfen geführt werden; Schlusssatz */
export const rueckfragenMini = (): Mini => ({
  ...kopf('rueckfragen', 'Wer weiß was?'), wahlen: [], kontingent: 2, schlussHtml: 'Die übrigen fragt die Vertretung nach.',
  posten: posten(4, (i) => ({ html: `Gespräch ${i + 1}`, erklaerungHtml: `Die Vertretung hält Punkt ${i + 1} fest.`, gespraech: [{ wer: 'Lot', html: `Frage ${i + 1}` }, { wer: `Partner ${i + 1}`, html: `Antwort ${i + 1}` }] })),
});

/** Eine Kopie der Story mit dieser Mini-Aufgabe an der Station (Platz im Ablauf wie angegeben). */
export function mitMini(g: Geschichte, nr: number, m: Mini, stelle?: Mini['stelle']): Geschichte {
  const aus = structuredClone(g);
  const k = aus.kapitel[nr - 1] as Kapitel;
  k.mini = { ...m, ...(stelle !== undefined ? { stelle } : {}) };
  return aus;
}
