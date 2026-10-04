/*
 * Wegskizze der Story-Wahl am Anfang (O-61): derselbe Weg durch die Kapitel, einmal ganz (jede Station besetzt), einmal als
 * Kurzfassung (nur die gespielten Kapitel besetzt, die übrigen als kleine Brücken, der Weg dazwischen gestrichelt). Rein,
 * deterministisch, ohne Kennungen und url(#…), ohne Farbwerte (Klassen `ws-*`, gestaltet in src/stil/geschichte.css).
 * Die Zahl der Stationen kommt aus den Daten; role="img" mit Beschreibung, die Bedeutung steht zusätzlich als Text daneben.
 */
const r1 = (n: number): number => Math.round(n * 10) / 10;
const maske = (t: string): string => t.replace(/&/gu, '&amp;').replace(/"/gu, '&quot;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;');

const BREITE = 280;
const RAND = 22;
/** Mit Akten bleibt unter dem Weg Platz für die Beschriftung „I · II · III“ (P19.7). */
const HOEHE = 72;
const HOEHE_AKTE = 84;
/** Zusätzlicher Abstand an einer Aktgrenze, in Stationsabständen */
const AKT_LUECKE = 0.5;
const ROEMISCH = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

/**
 * Lage der Stationen entlang des Wegs (0 bis 1): gleiche Abstände, an jeder Aktgrenze eine kleine Lücke, damit man die Akte sieht.
 * `akte` ist die Zahl der Stationen je Akt; passt die Summe nicht zu n, gelten gleiche Abstände.
 */
function lagen(n: number, akte: readonly number[] | undefined): number[] {
  const grenzen = new Set<number>();
  if (akte !== undefined && akte.length > 1 && akte.reduce((a, b) => a + b, 0) === n && akte.every((a) => a > 0)) {
    let summe = 0;
    for (const a of akte.slice(0, -1)) { summe += a; grenzen.add(summe); }
  }
  const stufen: number[] = [0];
  for (let i = 1; i < n; i += 1) stufen.push((stufen[i - 1] ?? 0) + 1 + (grenzen.has(i) ? AKT_LUECKE : 0));
  const ende = stufen[n - 1] ?? 0;
  return stufen.map((x) => (ende === 0 ? 0 : x / ende));
}

/** Punkt einer Station mit Lage t (0 bis 1) auf einer sanften Welle von links (Start) nach rechts (Ziel). */
function punkt(t: number, hoehe: number): [number, number] {
  return [r1(RAND + t * (BREITE - 2 * RAND)), r1(hoehe / 2 + Math.sin(t * Math.PI * 2.4) * 14)];
}

/**
 * @param inKurz je Kapitel, ob es auf diesem Weg gespielt wird (ganzer Weg: alle wahr)
 * @param beschreibung Text für Screenreader
 * @param akte Zahl der Stationen je Akt (optional): Lücke an den Aktgrenzen und die Zahlen I, II, III unter dem Weg
 */
export function wegSkizze(inKurz: readonly boolean[], beschreibung: string, kurz: boolean, akte?: readonly number[]): string {
  const n = inKurz.length;
  const t = lagen(n, akte);
  const mitAkten = akte !== undefined && akte.length > 1 && akte.reduce((a, b) => a + b, 0) === n && akte.every((a) => a > 0);
  const hoehe = mitAkten ? HOEHE_AKTE : HOEHE;
  const pt = Array.from({ length: n }, (_, i) => punkt(t[i] ?? 0, mitAkten ? HOEHE : hoehe));
  // Weg: von Station zu Station; Strecken an übersprungenen Stationen gestrichelt (Brücke)
  let weg = '';
  for (let i = 0; i < n - 1; i += 1) {
    const [x1, y1] = pt[i] as [number, number];
    const [x2, y2] = pt[i + 1] as [number, number];
    const gespielt = (inKurz[i] ?? false) && (inKurz[i + 1] ?? false);
    const mx = r1((x1 + x2) / 2);
    weg += `<path class="${gespielt ? 'ws-weg' : 'ws-weg ws-bruecke'}" d="M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}"/>`;
  }
  // Start (Fähnchen) und Ziel (Schulhaus) an den Enden
  const [sx, sy] = pt[0] as [number, number];
  const [zx, zy] = pt[n - 1] as [number, number];
  const start = `<path class="ws-fahne" d="M${r1(sx - 14)} ${r1(sy + 6)}V${r1(sy - 12)}L${r1(sx - 4)} ${r1(sy - 8)}L${r1(sx - 14)} ${r1(sy - 4)}"/>`;
  const ziel = `<path class="ws-haus" d="M${r1(zx + 8)} ${r1(zy + 8)}V${r1(zy - 4)}L${r1(zx + 17)} ${r1(zy - 11)}L${r1(zx + 26)} ${r1(zy - 4)}V${r1(zy + 8)}Z"/>`;
  let punkte = '';
  for (let i = 0; i < n; i += 1) {
    const [x, y] = pt[i] as [number, number];
    punkte += inKurz[i]
      ? `<circle class="ws-station" cx="${x}" cy="${y}" r="7.5"/><text class="ws-nr" x="${x}" y="${r1(y + 3.2)}" text-anchor="middle">${i + 1}</text>`
      : `<circle class="ws-uebersprungen" cx="${x}" cy="${y}" r="3.2"/>`;
  }
  // Aktzahlen: mittig unter den Stationen ihres Akts, gleiche Höhe
  let akteText = '';
  if (mitAkten && akte !== undefined) {
    let von = 0;
    akte.forEach((a, i) => {
      const xs = pt.slice(von, von + a).map((q) => q[0]);
      const mitte = r1(((xs[0] ?? 0) + (xs[xs.length - 1] ?? 0)) / 2);
      akteText += `<text class="ws-akt" x="${mitte}" y="${r1(hoehe - 5)}" text-anchor="middle">${ROEMISCH[i] ?? String(i + 1)}</text>`;
      von += a;
    });
  }
  return `<svg class="ws ${kurz ? 'ws-kurz' : 'ws-lang'}" viewBox="${-8} 0 ${BREITE + 16} ${hoehe}" role="img" aria-label="${maske(beschreibung)}" focusable="false" xmlns="http://www.w3.org/2000/svg">${weg}${start}${ziel}${punkte}${akteText}</svg>`;
}
