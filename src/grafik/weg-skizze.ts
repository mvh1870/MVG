/*
 * Wegskizze der Story-Wahl am Anfang (O-61): derselbe Weg durch die Kapitel, einmal ganz (jede Station besetzt), einmal als
 * Kurzfassung (nur die gespielten Kapitel besetzt, die übrigen als kleine Brücken, der Weg dazwischen gestrichelt). Rein,
 * deterministisch, ohne Kennungen und url(#…), ohne Farbwerte (Klassen `ws-*`, gestaltet in src/stil/geschichte.css).
 * Die Zahl der Stationen kommt aus den Daten; role="img" mit Beschreibung, die Bedeutung steht zusätzlich als Text daneben.
 */
const r1 = (n: number): number => Math.round(n * 10) / 10;
const maske = (t: string): string => t.replace(/&/gu, '&amp;').replace(/"/gu, '&quot;').replace(/</gu, '&lt;').replace(/>/gu, '&gt;');

const BREITE = 280;
const HOEHE = 72;
const RAND = 22;

/** Punkt der Station i von n auf einer sanften Welle von links (Start) nach rechts (Ziel). */
function punkt(i: number, n: number): [number, number] {
  const t = n <= 1 ? 0 : i / (n - 1);
  return [r1(RAND + t * (BREITE - 2 * RAND)), r1(HOEHE / 2 + Math.sin(t * Math.PI * 2.4) * 14)];
}

/**
 * @param inKurz je Kapitel, ob es auf diesem Weg gespielt wird (ganzer Weg: alle wahr)
 * @param beschreibung Text für Screenreader
 */
export function wegSkizze(inKurz: readonly boolean[], beschreibung: string, kurz: boolean): string {
  const n = inKurz.length;
  const pt = Array.from({ length: n }, (_, i) => punkt(i, n));
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
  return `<svg class="ws ${kurz ? 'ws-kurz' : 'ws-lang'}" viewBox="${-8} 0 ${BREITE + 16} ${HOEHE}" role="img" aria-label="${maske(beschreibung)}" focusable="false" xmlns="http://www.w3.org/2000/svg">${weg}${start}${ziel}${punkte}</svg>`;
}
