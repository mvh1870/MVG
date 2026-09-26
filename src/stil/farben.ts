// Farb-Hilfen für Prüfungen: Tokens aus tokens.css lesen und WCAG-Kontrast berechnen.
// Keine DOM-Abhängigkeit; genutzt von tests/stil-kontrast.test.ts und werkzeuge/stilreferenz.mjs.

/** Liest alle Custom Properties (`--name: wert;`) aus den `:root`-Blöcken ohne Media-Query. */
export function liesTokens(css: string): Map<string, string> {
  const ohneKommentare = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const tokens = new Map<string, string>();
  let tiefe = 0;
  let inRoot = false;
  let puffer = '';
  let kopf = '';
  for (const zeichen of ohneKommentare) {
    if (zeichen === '{') {
      tiefe++;
      inRoot = tiefe === 1 && kopf.trim() === ':root';
      kopf = '';
      puffer = '';
      continue;
    }
    if (zeichen === '}') {
      if (inRoot) sammle(puffer, tokens);
      tiefe = Math.max(0, tiefe - 1);
      inRoot = false;
      puffer = '';
      kopf = '';
      continue;
    }
    if (tiefe === 0) kopf += zeichen;
    else if (inRoot) puffer += zeichen;
  }
  return tokens;
}

function sammle(block: string, tokens: Map<string, string>): void {
  for (const teil of block.split(';')) {
    const m = /^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/.exec(teil);
    if (m?.[1] && m[2] !== undefined) tokens.set(m[1], m[2]);
  }
}

/** Löst `var(--x)`-Ketten auf; liefert den Endwert (z. B. `#0C1C33`) oder wirft. */
export function loese(tokens: ReadonlyMap<string, string>, name: string, tiefe = 0): string {
  if (tiefe > 20) throw new Error(`Zirkelbezug bei ${name}`);
  const wert = tokens.get(name);
  if (wert === undefined) throw new Error(`Token ${name} fehlt`);
  const bezug = /^var\(\s*(--[\w-]+)\s*\)$/.exec(wert);
  return bezug?.[1] ? loese(tokens, bezug[1], tiefe + 1) : wert;
}

/** `#RGB` oder `#RRGGBB` → [r, g, b] (0–255). */
export function hexZuRgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) throw new Error(`Kein Hex-Farbwert: ${hex}`);
  const h = m[1].length === 3 ? [...m[1]].map((z) => z + z).join('') : m[1];
  const n = Number.parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Relative Leuchtdichte nach WCAG 2.x. */
export function leuchtdichte(hex: string): number {
  const [r, g, b] = hexZuRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Kontrastverhältnis (1 … 21). */
export function kontrast(a: string, b: string): number {
  const la = leuchtdichte(a);
  const lb = leuchtdichte(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export interface Paar {
  text: string;
  grund: string;
  wo: string;
  gross?: boolean;
  grafik?: boolean;
}

/** Mindestkontrast eines Paars: 4,5:1 für Text, 3:1 für große Schrift oder Grafik (WCAG 1.4.3/1.4.11). */
export function mindestKontrast(paar: Paar): number {
  return paar.gross === true || paar.grafik === true ? 3 : 4.5;
}
