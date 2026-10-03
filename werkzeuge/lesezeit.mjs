/*
 * Lesezeit der Story (R73): misst den Lesetext des ganzen Wegs und der Kurzfassung reproduzierbar, ohne Browser. Jeder
 * Schritt wird mit `baueSchritt` (src/ui/flaechen/geschichte.ts) so gebaut, wie die Seite ihn zeigt (bedienbar), und
 * nach EINER festen Zählregel gezählt. Aufruf: `node werkzeuge/lesezeit.mjs` (Ausgabe: Wörter und Minuten je Weg).
 * tests/lesezeit.test.ts gleicht die Angaben auf der Seite (Auftakt-Knopf, Startseite) mit dieser Messung ab.
 *
 * Zählregel (gilt seit R73, ersetzt die Zahlen in L-234/L-240, die sich nicht nachbilden ließen):
 *  1. Weg: guter Weg (in jedem Kapitel die gute Antwort gewählt), jeder Schritt des Wegs vom Auftakt bis zum Ende;
 *     Mini-Aufgaben ungelöst, Vergleich mit den abgestimmten Gewichten.
 *  2. Text: Textinhalt des Schritts (`article.gs-schritt`) – alle drei Antworten zählen mit (man liest sie, bevor man
 *     wählt), dazu die Folge der gewählten Antwort.
 *  3. Nicht gezählt: Text nur für Screenreader (`.nur-sr`), Grafiken (`svg`, `[aria-hidden="true"]`), die Balkentafel
 *     (`.gs-stand`) und die kleinen Kicker (`.gs-kicker`); ein zugeklappter Aufklapper zählt nur mit seiner Titelzeile.
 *  4. Wort: jede durch Leerraum oder eine Blockgrenze (jedes Element außer Auszeichnungen im Satz wie span, a, b, em)
 *     getrennte Folge mit mindestens einem Buchstaben oder einer Ziffer; weiche Trennstellen entfernt. Blockgrenze, weil die
 *     Seite Elemente ohne Leerraum aneinandersetzt – ohne sie klebten etwa Sprechername und Satz zu einem Wort zusammen.
 *  5. Minuten: Wörter / 200, angegeben auf ganze Minuten gerundet („etwa n Minuten“).
 * Warum diese Regel: Sie ist die in L-234 festgehaltene Zählweise (die einzige dokumentierte), ergänzt um Punkt 4 und am
 * selben DOM gemessen, den die Seite zeichnet – damit liefert jeder Lauf dieselbe Zahl, und der Test kann die Angabe prüfen.
 * Die Messung R73 ohne Punkt 4 (reiner textContent, 9,8 Minuten) zählte zu wenig: Sprechername und Satz, Antwortnummer und
 * Antwort, Titel und Text verschmolzen jeweils zu einem Wort.
 */

export const WOERTER_JE_MINUTE = 200;

/** Elemente im Satz: Sie trennen keine Wörter (alle anderen Elemente gelten als Blockgrenze). */
const IM_SATZ = new Set(['a', 'abbr', 'b', 'em', 'i', 'mark', 'q', 'small', 'span', 'strong', 'sub', 'sup', 'u']);

/** Zählt die Wörter eines Story-Schritts nach der Zählregel oben. @param {Element} artikel */
export function zaehleWoerter(artikel) {
  const a = /** @type {Element} */ (artikel.cloneNode(true));
  for (const x of a.querySelectorAll('.nur-sr, svg, [aria-hidden="true"], .gs-stand, .gs-kicker')) x.remove();
  for (const d of a.querySelectorAll('details:not([open])')) {
    const s = d.querySelector(':scope > summary');
    d.replaceChildren(...(s ? [s] : []));
  }
  // Blockgrenzen trennen Wörter: die Seite setzt Elemente ohne Leerraum aneinander („Theo Lot“ als Absatz, dann „Gerüst …“),
  // textContent klebte sie zusammen; Auszeichnungen im Satz (Glossar-Spanne, fett, Link) trennen nicht
  for (const el of [...a.querySelectorAll('*')]) if (!IM_SATZ.has(el.tagName.toLowerCase())) el.after(' ');
  const text = (a.textContent ?? '').replace(/\u00ad/gu, '');
  return text.split(/\s+/u).filter((x) => /[\p{L}\p{N}]/u.test(x)).length;
}

/** Für den Lauf ohne Browser: jsdom als DOM, falls keiner da ist. */
async function sorgeFuerDom() {
  if (typeof globalThis.document !== 'undefined') return;
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///index.html' });
  const gl = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (globalThis));
  for (const k of [
    'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
    'HTMLParagraphElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle',
  ]) {
    gl[k] = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (dom.window))[k];
  }
}

/**
 * Misst beide Wege. @returns {Promise<{ lang: { woerter: number, minuten: number, schritte: [string, number][] }, kurz: { woerter: number, minuten: number, schritte: [string, number][] } }>}
 */
export async function messeLesezeit() {
  await sorgeFuerDom();
  const { inhalte } = await import('../src/inhalte/index.ts');
  const { baueSchritt } = await import('../src/ui/flaechen/geschichte.ts');
  const { themaTitel: titelVon } = await import('../src/ui/flaechen/theorie.ts');
  const { neuerStand, schritte, waehle, wegKapitel } = await import('../src/geschichte/engine.ts');
  const g = inhalte.geschichte;
  if (g === null) throw new Error('keine Story in den Inhalten');
  // wie die Seite (main.ts): Titel über die Themen-Kennung, damit „Zum Thema …“ mitzählt (R74)
  const themaTitel = (/** @type {string} */ id) => titelVon(inhalte, id);
  /** @param {boolean} kurz */
  const weg = (kurz) => {
    let s = neuerStand(kurz);
    for (const k of wegKapitel(g, kurz)) s = waehle(g, s, k.id, k.antworten.findIndex((a) => a.wertung === 'gut'));
    /** @type {[string, number][]} */
    const liste = schritte(g, kurz).map((sch) => {
      const el = baueSchritt({ g, stand: { ...s, schritt: sch }, bedienbar: true, themaTitel, tue: () => {} });
      return [sch.ort === 'kapitel' ? `${sch.kapitel}:${sch.teil}` : sch.ort, zaehleWoerter(el)];
    });
    const woerter = liste.reduce((a, [, n]) => a + n, 0);
    return { woerter, minuten: woerter / WOERTER_JE_MINUTE, schritte: liste };
  };
  return { lang: weg(false), kurz: weg(true) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const m = await messeLesezeit();
  for (const [name, x] of /** @type {const} */ ([['ganzer Weg', m.lang], ['Kurzfassung', m.kurz]])) {
    console.log(`${name}: ${x.woerter} Wörter ≈ ${x.minuten.toFixed(1)} Minuten (gerundet ${Math.round(x.minuten)})`);
  }
  if (process.argv.includes('--schritte')) console.log(JSON.stringify(m, null, 1));
}
