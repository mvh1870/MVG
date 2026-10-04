/*
 * Verlaufsband der Story (P19.3, Pause am Aktende): drei Linien (Geld, Zeit, Vertrauen) über die Stationen, ohne Zahlen auf den
 * Achsen; dahinter die Bänder „hoch / mittel / niedrig“ als Streifen. Rein (Zeichenketten), deterministisch, ohne Kennungen und
 * url(#…), ohne Farbwerte (Klassen `vb-*`, gestaltet in src/stil/geschichte.css). Die Punkte kommen unverändert aus der Engine
 * (`verlaufBis`); die Zeichnung erfindet nichts dazu. Linienart und Beschriftung am Ende der Linie unterscheiden die drei auch
 * ohne Farbe; die Wertetabelle als Text steht neben der Grafik (geschichte.ts, „Der Verlauf in Worten“).
 */
const r1 = (n: number): number => Math.round(n * 10) / 10;
const maske = (t: string): string => t.replace(/&/gu, '&amp;').replace(/"/gu, '&quot;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;');

const BREITE = 320;
const HOEHE = 150;
const LINKS = 8;
const RECHTS = 74;
const OBEN = 10;
const UNTEN = 10;

/** Eine Linie: Kennung der Klasse, Beschriftung am Ende, Werte 0–10 je Punkt */
export interface VerlaufReihe {
  klasse: string;
  name: string;
  werte: readonly number[];
}

/** Bänder der Balkenstufen (src/geschichte/engine.ts, `stufe`): niedrig 0–3, mittel 4–6, hoch 7–10. */
const BAENDER: readonly { klasse: string; von: number; bis: number }[] = [
  { klasse: 'vb-band-hoch', von: 6.5, bis: 10.5 },
  { klasse: 'vb-band-mittel', von: 3.5, bis: 6.5 },
  { klasse: 'vb-band-niedrig', von: -0.5, bis: 3.5 },
];

/**
 * @param reihen die Linien (jede mit gleich vielen Punkten, mindestens einem)
 * @param beschreibung Text für Screenreader
 */
export function verlaufBand(reihen: readonly VerlaufReihe[], beschreibung: string): string {
  const n = Math.max(1, ...reihen.map((r) => r.werte.length));
  const x = (i: number): number => r1(LINKS + (n <= 1 ? 0 : (i / (n - 1)) * (BREITE - LINKS - RECHTS)));
  const y = (wert: number): number => r1(OBEN + ((10.5 - wert) / 11) * (HOEHE - OBEN - UNTEN));
  const baender = BAENDER.map((b) => `<rect class="${b.klasse}" x="${LINKS}" y="${y(Math.min(10.5, b.bis))}" width="${BREITE - LINKS - RECHTS}" height="${r1(y(Math.max(-0.5, b.von)) - y(Math.min(10.5, b.bis)))}"/>`).join('');
  // die Linien liegen bei gleichen Werten nebeneinander statt übereinander: je Reihe ein kleiner fester Versatz
  const versatz = (k: number): number => (k - (reihen.length - 1) / 2) * 1.6;
  const linien = reihen.map((r, k) => {
    const pkt = r.werte.map((w, i) => `${x(i)},${r1(y(w) + versatz(k))}`);
    const letzte = r.werte.length - 1;
    const ende = letzte >= 0 ? `<text class="vb-name ${r.klasse}" x="${r1(x(letzte) + 6)}" y="${r1(y(r.werte[letzte] as number) + versatz(k) + 3.5)}">${maske(r.name)}</text>` : '';
    const punkte = r.werte.map((w, i) => `<circle class="vb-punkt ${r.klasse}" cx="${x(i)}" cy="${r1(y(w) + versatz(k))}" r="2.2"/>`).join('');
    return `<polyline class="vb-linie ${r.klasse}" points="${pkt.join(' ')}"/>${punkte}${ende}`;
  }).join('');
  return `<svg class="vb" viewBox="0 0 ${BREITE} ${HOEHE}" role="img" aria-label="${maske(beschreibung)}" focusable="false" xmlns="http://www.w3.org/2000/svg">${baender}${linien}</svg>`;
}
