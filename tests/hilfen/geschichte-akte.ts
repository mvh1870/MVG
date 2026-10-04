/*
 * Synthetische Story mit 14 Stationen (s1 … s14) in drei Akten (P19.3, O-62) – nur für Tests, keine Auslieferung. Seit P19.6 hat die
 * echte Story selbst 14 Stationen; die Synthese nimmt ihre Stationen (Texte, Antworten, Mini-Aufgaben, Vergleich in s12) und setzt
 * eigene Brücken, Kopfkarten und Pausen: Akt I = s1–s5, Akt II = s6–s10, Akt III = s11–s14; die Kurzfassung spielt s1, s3, s5, s12.
 */
import type { Akt, Geschichte, Kapitel, Zeile } from '../../src/geschichte/typen.ts';

export const KURZ_NR: readonly number[] = [1, 3, 5, 12];
export const AKT_GRENZEN: readonly (readonly [string, number, number])[] = [['a1', 1, 5], ['a2', 6, 10], ['a3', 11, 14]];

const zeile = (figur: Zeile['figur'], text: string): Zeile => ({ figur, zusatz: null, html: text, kurzfassung: true });

export function synthetischeAkteStory(g: Geschichte, o: { akte?: boolean } = {}): Geschichte {
  const aus = structuredClone(g);
  const grund = g.kapitel;
  // Zwischenbilder und Wetter wandern mit: die Stufen der Gerüst-Tabelle in grober Folge
  const stufen = [0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8];
  const wetter = [undefined, undefined, 'regen', undefined, 'nebel', undefined, 'schnee', 'sturm', 'regen', undefined, 'nebel', undefined, undefined, undefined] as const;
  aus.kapitel = Array.from({ length: 14 }, (_, i) => {
    const k = structuredClone(grund[i % grund.length] as Kapitel);
    k.id = `s${i + 1}`;
    k.nr = i + 1;
    k.kurzfassung = KURZ_NR.includes(i + 1);
    k.brueckeHtml = k.kurzfassung ? null : `Brücke der Station ${i + 1}.`;
    k.einstiegKurzHtml = k.kurzfassung ? k.einstiegKurzHtml : null;
    if (!k.kurzfassung) for (const z of k.szene) z.kurzfassung = true;
    k.titel = `Station ${i + 1}`;
    k.campus = { ...k.campus, stufe: stufen[i] as number, ...(wetter[i] !== undefined ? { wetter: wetter[i] } : {}) };
    return k;
  });
  if (o.akte !== false) {
    aus.akte = AKT_GRENZEN.map(([id, von, bis], j): Akt => ({
      id,
      titel: ['Ordnung schaffen', 'Takt und Zahlen', 'Entscheiden und Übergeben'][j] as string,
      zeitraum: ['Januar bis Juni 2026', 'August 2026 bis Februar 2027', 'April 2027 bis August 2028'][j] as string,
      stationen: Array.from({ length: bis - von + 1 }, (_, n) => `s${von + n}`),
      kopfHtml: `Kopfkarte von Akt ${j + 1}.`,
      pause: {
        zeile: j < 2 ? zeile('grundstein', `Pause nach Akt ${j + 1}.`) : null,
        koennenHtml: [`Sie können Eins von Akt ${j + 1}.`, `Sie können Zwei von Akt ${j + 1}.`, `Sie können Drei von Akt ${j + 1}.`],
      },
    }));
  } else aus.akte = [];
  return aus;
}
