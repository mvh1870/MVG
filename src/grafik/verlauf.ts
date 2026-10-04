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
/** Mindestabstand der Beschriftungen am Linienende (Schrift 11 px) */
const NAMEN_ABSTAND = 12;
/** Breite, ab der zwei Beschriftungen nebeneinander statt übereinander stehen (Hälfte der längsten Beschriftung ist mehr als nötig) */
const NAMEN_BREITE = 56;

/**
 * Legt die Beschriftungen am Linienende so, dass keine die andere überdeckt (P19.8, L-390): enden zwei Linien auf gleicher Höhe, stehen
 * „Geld“ und „Zeit“ sonst übereinander. Rein: sortiert nach Höhe, schiebt jede, die der vorigen zu nahe kommt, nach unten, zentriert
 * die Gruppe wieder um ihren Schwerpunkt und hält sie im Bild. Der Reihenfolge nach oben und unten bleibt es bei der Höhe der Linien.
 * @param ziele Ende der Linien: x und y des letzten Punkts
 * @returns Höhe der Beschriftung je Eintrag (gleiche Reihenfolge)
 */
export function legeNamen(ziele: readonly { x: number; y: number }[], oben: number, unten: number): number[] {
  const ordnung = ziele.map((z, i) => ({ i, ...z })).sort((a, b) => a.y - b.y || a.i - b.i);
  const ergebnis = ziele.map((z) => z.y);
  // Gruppen: nach Höhe benachbarte Beschriftungen, die sich waagrecht überschneiden und weniger als den Mindestabstand trennt
  let gruppe: typeof ordnung = [];
  const schliesse = (): void => {
    if (gruppe.length === 0) return;
    const ys = gruppe.map((g) => g.y);
    for (let k = 1; k < ys.length; k++) ys[k] = Math.max(ys[k] as number, (ys[k - 1] as number) + NAMEN_ABSTAND);
    const mitte = gruppe.reduce((sum, g) => sum + g.y, 0) / gruppe.length;
    const neueMitte = ys.reduce((sum, v) => sum + v, 0) / ys.length;
    let schub = mitte - neueMitte;
    const ersteY = (ys[0] as number) + schub;
    const letzteY = (ys[ys.length - 1] as number) + schub;
    if (ersteY < oben) schub += oben - ersteY;
    else if (letzteY > unten) schub -= letzteY - unten;
    gruppe.forEach((g, k) => { ergebnis[g.i] = r1((ys[k] as number) + schub); });
    gruppe = [];
  };
  for (const z of ordnung) {
    const letzte = gruppe[gruppe.length - 1];
    const stosst = letzte !== undefined && Math.abs(letzte.x - z.x) < NAMEN_BREITE && z.y - letzte.y < NAMEN_ABSTAND;
    if (letzte !== undefined && !stosst) schliesse();
    gruppe.push(z);
  }
  schliesse();
  return ergebnis;
}

/**
 * Eine Linie: Kennung der Klasse, Beschriftung am Ende, Werte 0–10 je Punkt. P19.4: `null` = kein Wert (Station ohne Antwort) – die
 * Linie reißt dort ab, es wird nichts dazwischen gezeichnet; `hohl` markiert Punkte, die nur erzählt sind (Kurzfassung).
 */
export interface VerlaufReihe {
  klasse: string;
  name: string;
  werte: readonly (number | null)[];
  hohl?: readonly boolean[];
}

/** Bänder der Balkenstufen (src/geschichte/engine.ts, `stufe`): niedrig 0–3, mittel 4–6, hoch 7–10. */
const BAENDER: readonly { klasse: string; von: number; bis: number }[] = [
  { klasse: 'vb-band-hoch', von: 6.5, bis: 10.5 },
  { klasse: 'vb-band-mittel', von: 3.5, bis: 6.5 },
  { klasse: 'vb-band-niedrig', von: -0.5, bis: 3.5 },
];

/**
 * @param reihen die Linien (jede mit gleich vielen Punkten, mindestens einem; `null` = kein Wert)
 * @param beschreibung Text für Screenreader
 */
export function verlaufBand(reihen: readonly VerlaufReihe[], beschreibung: string): string {
  const n = Math.max(1, ...reihen.map((r) => r.werte.length));
  const x = (i: number): number => r1(LINKS + (n <= 1 ? 0 : (i / (n - 1)) * (BREITE - LINKS - RECHTS)));
  const y = (wert: number): number => r1(OBEN + ((10.5 - wert) / 11) * (HOEHE - OBEN - UNTEN));
  const baender = BAENDER.map((b) => `<rect class="${b.klasse}" x="${LINKS}" y="${y(Math.min(10.5, b.bis))}" width="${BREITE - LINKS - RECHTS}" height="${r1(y(Math.max(-0.5, b.von)) - y(Math.min(10.5, b.bis)))}"/>`).join('');
  // die Linien liegen bei gleichen Werten nebeneinander statt übereinander: je Reihe ein kleiner fester Versatz
  const versatz = (k: number): number => (k - (reihen.length - 1) / 2) * 1.6;
  // Enden der Linien: die Beschriftungen werden gemeinsam gelegt (L-390), damit sie sich nicht überdecken
  const enden = reihen.map((r, k) => {
    const letzte = r.werte.reduce<number>((l, w, i) => (w === null ? l : i), -1);
    return letzte >= 0 ? { x: x(letzte), y: r1(y(r.werte[letzte] as number) + versatz(k)) } : null;
  });
  const gelegt = legeNamen(enden.filter((e): e is { x: number; y: number } => e !== null), OBEN, HOEHE - UNTEN);
  let naechste = 0;
  const linien = reihen.map((r, k) => {
    const py = (w: number): number => r1(y(w) + versatz(k));
    // zusammenhängende Strecken: bei einem fehlenden Wert reißt die Linie ab (keine gestrichelte Verbindung, die einen Weg andeutet)
    const strecken: string[][] = [];
    let aktuell: string[] | null = null;
    r.werte.forEach((w, i) => {
      if (w === null) { aktuell = null; return; }
      if (aktuell === null) { aktuell = []; strecken.push(aktuell); }
      aktuell.push(`${x(i)},${py(w)}`);
    });
    const endpunkt = enden[k];
    let ende = '';
    if (endpunkt !== null && endpunkt !== undefined) {
      const ly = gelegt[naechste++] as number;
      // eine kurze Leitlinie vom Punkt zur Beschriftung, wenn diese versetzt steht
      const leit = Math.abs(ly - endpunkt.y) > 1 ? `<line class="vb-leit ${r.klasse}" x1="${r1(endpunkt.x + 2.6)}" y1="${endpunkt.y}" x2="${r1(endpunkt.x + 5)}" y2="${ly}"/>` : '';
      ende = `${leit}<text class="vb-name ${r.klasse}" x="${r1(endpunkt.x + 6)}" y="${r1(ly + 3.5)}">${maske(r.name)}</text>`;
    }
    const punkte = r.werte.map((w, i) => (w === null ? '' : `<circle class="vb-punkt ${r.klasse}${r.hohl?.[i] === true ? ' vb-punkt-hohl' : ''}" cx="${x(i)}" cy="${py(w)}" r="2.2"/>`)).join('');
    const strich = strecken.map((st) => `<polyline class="vb-linie ${r.klasse}" points="${st.join(' ')}"/>`).join('');
    return `${strich}${punkte}${ende}`;
  }).join('');
  return `<svg class="vb" viewBox="0 0 ${BREITE} ${HOEHE}" role="img" aria-label="${maske(beschreibung)}" focusable="false" xmlns="http://www.w3.org/2000/svg">${baender}${linien}</svg>`;
}
