/*
 * Lesezeit der Story (R73): misst den Lesetext des ganzen Wegs und der Kurzfassung reproduzierbar, ohne Browser. Jeder
 * Schritt wird mit `baueSchritt` (src/ui/flaechen/geschichte.ts) so gebaut, wie die Seite ihn zeigt (bedienbar), und
 * nach EINER festen Zählregel gezählt. Aufruf: `node werkzeuge/lesezeit.mjs` (Ausgabe: Wörter und Minuten je Weg).
 * tests/lesezeit.test.ts gleicht die Angaben auf der Seite (Auftakt-Knopf, Startseite) mit dieser Messung ab.
 *
 * P19.3: je Akt (Stationen plus Pause) und obere Schranke (`messeSchranke`); `--schreibe` schreibt src/geschichte/lesezeit-daten.json
 * (Wörter je Schritt für die Restzeit der Seite), `--schranke` gibt die obere Schranke aus.
 *
 * Zählregel (gilt seit R73, ersetzt die Zahlen in L-234/L-240, die sich nicht nachbilden ließen):
 *  1. Weg: guter Weg (in jedem Kapitel die gute Antwort gewählt), jeder Schritt des Wegs vom Auftakt bis zum Ende;
 *     Mini-Aufgaben ungelöst, Vergleich mit den abgestimmten Gewichten.
 *  2. Text: Textinhalt des Schritts (`article.gs-schritt`) – alle drei Antworten zählen mit (man liest sie, bevor man
 *     wählt), dazu die Folge der gewählten Antwort.
 *  3. Nicht gezählt: Text nur für Screenreader (`.nur-sr`), Grafiken (`svg`, `[aria-hidden="true"]`), die Balkentafel
 *     (`.gs-stand`), die kleinen Kicker (`.gs-kicker`; auch die Zeile „Akt · Zeitraum · Dauer“ der Kopfkarte, P19.3) und der Knopf
 *     „Weiter mit der ganzen Geschichte“ am Ende der Kurzfassung (Bedienung); ein zugeklappter Aufklapper zählt nur mit seiner Titelzeile.
 *  4. Wort: jede durch Leerraum oder eine Blockgrenze (jedes Element außer Auszeichnungen im Satz wie span, a, b, em)
 *     getrennte Folge mit mindestens einem Buchstaben oder einer Ziffer; weiche Trennstellen entfernt. Blockgrenze, weil die
 *     Seite Elemente ohne Leerraum aneinandersetzt – ohne sie klebten etwa Sprechername und Satz zu einem Wort zusammen.
 *  5. Minuten: Wörter / 200, angegeben auf ganze Minuten gerundet („etwa n Minuten“).
 * Warum diese Regel: Sie ist die in L-234 festgehaltene Zählweise (die einzige dokumentierte), ergänzt um Punkt 4 und am
 * selben DOM gemessen, den die Seite zeichnet – damit liefert jeder Lauf dieselbe Zahl, und der Test kann die Angabe prüfen.
 * Die Messung R73 ohne Punkt 4 (reiner textContent, 9,8 Minuten) zählte zu wenig: Sprechername und Satz, Antwortnummer und
 * Antwort, Titel und Text verschmolzen jeweils zu einem Wort.
 */

import { miniArt } from '../src/geschichte/mini-arten.ts';

export const WOERTER_JE_MINUTE = 200;
/** P19.3: obere Schranke je Akt in Minuten (Drehbuch v2, L-278: je Akt höchstens 3.300 Wörter, hier 16,5 Minuten, gerundet auf 17) */
export const AKT_MAX_MINUTEN = 17;
/** P19.3: obere Schranke für den ganzen Weg in Wörtern (Drehbuch v2, L-278: 9.000 ≈ 45 Minuten) */
export const WEG_MAX_WOERTER = 9000;

/** Elemente im Satz: Sie trennen keine Wörter (alle anderen Elemente gelten als Blockgrenze). */
const IM_SATZ = new Set(['a', 'abbr', 'b', 'em', 'i', 'mark', 'q', 'small', 'span', 'strong', 'sub', 'sup', 'u']);

/** Zählt die Wörter eines Story-Schritts nach der Zählregel oben. @param {Element} artikel */
export function zaehleWoerter(artikel) {
  const a = /** @type {Element} */ (artikel.cloneNode(true));
  // P19.3: der Knopf am Ende der Kurzfassung („Weiter mit der ganzen Geschichte“) ist Bedienung, kein Lesetext der Kurzfassung
  for (const x of a.querySelectorAll('.nur-sr, svg, [aria-hidden="true"], .gs-stand, .gs-kicker, [data-pruef="weiter-ganz"]')) x.remove();
  // Mini-Registry: eine Mini-Art kann weitere Elemente von der Zählung ausnehmen (`lesezeitOhne`); die bisherigen Arten keine
  const miniAuswahl = miniArt(a.getAttribute('data-art') ?? '')?.lesezeitOhne ?? [];
  if (miniAuswahl.length > 0) for (const x of a.querySelectorAll(miniAuswahl.join(','))) x.remove();
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
 * Misst beide Wege (guter Weg) und – mit Akten (P19.3) – je Akt. Ohne Angabe die echte Story der Inhalte; mit `g` (und den Titel-
 * Funktionen) jede andere Geschichte, etwa die synthetische mit 14 Stationen im Test.
 * @param {{ g?: any, themaTitel?: (id: string) => string | null, werkzeugTitel?: (id: string) => string | null, lesezeit?: any }} [o]
 * @returns {Promise<{ lang: { woerter: number, minuten: number, schritte: [string, number][] }, kurz: { woerter: number, minuten: number, schritte: [string, number][] }, akte: { id: string, titel: string, woerter: number, minuten: number }[] }>}
 */
export async function messeLesezeit(o = {}) {
  await sorgeFuerDom();
  const { baueSchritt, g, themaTitel, werkzeugTitel, engine } = await umgebung(o);
  /** @param {boolean} kurz */
  const weg = (kurz) => {
    let s = engine.neuerStand(kurz);
    for (const k of engine.wegKapitel(g, kurz)) s = engine.waehle(g, s, k.id, k.antworten.findIndex((/** @type {any} */ a) => a.wertung === 'gut'));
    /** @type {[string, number][]} */
    const liste = engine.schritte(g, kurz).map((/** @type {any} */ sch) => {
      const el = baueSchritt({ g, stand: { ...s, schritt: sch }, bedienbar: true, themaTitel, werkzeugTitel, ...(o.lesezeit !== undefined ? { lesezeit: o.lesezeit } : {}), tue: () => {} });
      return [engine.schrittKennung(sch), zaehleWoerter(el)];
    });
    const woerter = liste.reduce((a, [, n]) => a + n, 0);
    return { woerter, minuten: woerter / WOERTER_JE_MINUTE, schritte: liste };
  };
  const lang = weg(false);
  const kurz = weg(true);
  // je Akt: seine Stationen und die Pause an seinem Ende (so steht die Dauer in der Kopfkarte der Seite)
  const akte = engine.akteVon(g).map((/** @type {any} */ a) => {
    const woerter = lang.schritte.filter(([k]) => aktGehoert(a, k)).reduce((x, [, n]) => x + n, 0);
    return { id: a.id, titel: a.titel, woerter, minuten: woerter / WOERTER_JE_MINUTE };
  });
  return { lang, kurz, akte };
}

/** Gehört die Schritt-Kennung („s3:frage“, „pause:a1“) zum Akt? @param {any} a @param {string} kennung */
function aktGehoert(a, kennung) {
  return kennung === `pause:${a.id}` || a.stationen.includes(kennung.split(':')[0]);
}

/** Gemeinsame Umgebung der Messungen: Inhalte, Seitenbau, Engine; die Titel-Funktionen wie die Seite (main.ts). @param {any} o */
async function umgebung(o) {
  const { inhalte } = await import('../src/inhalte/index.ts');
  const { baueSchritt } = await import('../src/ui/flaechen/geschichte.ts');
  const { themaTitel: titelVon } = await import('../src/ui/flaechen/theorie.ts');
  const { werkzeugTitel: werkzeugVon, werkzeugAus } = await import('../src/ui/flaechen/explore.ts');
  const engine = await import('../src/geschichte/engine.ts');
  const g = o.g ?? inhalte.geschichte;
  if (g === null || g === undefined) throw new Error('keine Story in den Inhalten');
  // wie die Seite (main.ts): Titel über die Themen-Kennung, damit „Zum Thema …“ mitzählt (R74); dazu die Werkzeug-Verweise (P18.5)
  const themaTitel = o.themaTitel ?? ((/** @type {string} */ id) => titelVon(inhalte, id));
  const werkzeugTitel = o.werkzeugTitel ?? ((/** @type {string} */ id) => (inhalte.werkzeuge !== null ? werkzeugVon(inhalte.werkzeuge, werkzeugAus(id)) : null));
  return { baueSchritt, g, themaTitel, werkzeugTitel, engine };
}

/**
 * Obere Schranke der Lesezeit (P19.3): je Schritt der längste Text, den irgendeine Antwort ergibt – an jeder Station je Antwort
 * (die anderen gut), bei Mini-Aufgaben gelöst und ungelöst, am Ende der längste der drei einheitlichen Wege (alles gut ·
 * vertretbar · Falle). Der Weg ist der ganze Weg; Auftakt zählt zum ersten, Ende zum letzten Akt. P19.4: Gedächtnis-Echos hängen an
 * früheren Antworten – je Schritt zählt zusätzlich die längste Fassung (alle Quellen mit derselben Wertung, drei Läufe).
 * @param {{ g?: any, themaTitel?: (id: string) => string | null, werkzeugTitel?: (id: string) => string | null, lesezeit?: any }} [o]
 * @returns {Promise<{ woerter: number, minuten: number, akte: { id: string, woerter: number, minuten: number }[] }>}
 */
export async function messeSchranke(o = {}) {
  await sorgeFuerDom();
  const { baueSchritt, g, themaTitel, werkzeugTitel, engine } = await umgebung(o);
  const { miniArt: art } = await import('../src/geschichte/mini-arten.ts');
  /** @param {any} stand @param {any} sch */
  const zaehle = (stand, sch) => zaehleWoerter(baueSchritt({ g, stand: { ...stand, schritt: sch }, bedienbar: true, themaTitel, werkzeugTitel, ...(o.lesezeit !== undefined ? { lesezeit: o.lesezeit } : {}), tue: () => {} }));
  /** @param {(k: any) => number} wahl Platz der Antwort je Station */
  const stand = (wahl) => {
    let s = engine.neuerStand(false);
    for (const k of g.kapitel) s = engine.waehle(g, s, k.id, wahl(k));
    return s;
  };
  const platzVon = (/** @type {any} */ k, /** @type {string} */ w) => k.antworten.findIndex((/** @type {any} */ a) => a.wertung === w);
  const gut = stand((k) => platzVon(k, 'gut'));
  /** @type {Map<string, number>} */
  const je = new Map();
  for (const sch of engine.schritte(g, false)) {
    const kennung = engine.schrittKennung(sch);
    /** @type {number[]} */
    const varianten = [];
    if (sch.ort === 'kapitel') {
      const k = engine.kapitel(g, sch.kapitel);
      for (const w of ['gut', 'vertretbar', 'falle']) {
        let s = engine.waehle(g, gut, k.id, platzVon(k, w));
        varianten.push(zaehle(s, sch));
        if (sch.teil === 'mini' && k.mini !== null) {
          s = { ...s, mini: { ...s.mini, [k.id]: /** @type {any} */ (art(k.mini.art)).loese(k.mini) } };
          varianten.push(zaehle(s, sch));
        }
      }
    } else if (sch.ort === 'ende') {
      for (const w of ['gut', 'vertretbar', 'falle']) varianten.push(zaehle(stand((k) => platzVon(k, w)), sch));
    } else varianten.push(zaehle(gut, sch));
    // P19.4: Echos hängen an früheren Antworten – jede Fassung nach der Wertung ALLER Quellen (alle drei gleich, die übrigen Stationen gut)
    // ergibt für diesen Schritt eine Variante; die längste zählt
    if (sch.ort === 'kapitel' || sch.ort === 'ende') {
      for (const w of ['gut', 'vertretbar', 'falle']) {
        let s = gut;
        for (const e of g.echos ?? []) {
          const q = engine.kapitel(g, e.quelle);
          if (q !== null) s = engine.waehle(g, s, q.id, platzVon(q, w));
        }
        if (s !== gut) varianten.push(zaehle(s, sch));
      }
    }
    je.set(kennung, Math.max(...varianten));
  }
  const alle = engine.akteVon(g);
  const akte = alle.map((/** @type {any} */ a, /** @type {number} */ i) => {
    let woerter = 0;
    for (const [kennung, n] of je) {
      if (aktGehoert(a, kennung) || (i === 0 && kennung === 'auftakt') || (i === alle.length - 1 && kennung === 'ende')) woerter += n;
    }
    return { id: a.id, woerter, minuten: woerter / WOERTER_JE_MINUTE };
  });
  const woerter = [...je.values()].reduce((x, n) => x + n, 0);
  return { woerter, minuten: woerter / WOERTER_JE_MINUTE, akte };
}

/**
 * Daten für die Seite (src/geschichte/lesezeit-daten.json): Wörter je Schritt des guten Wegs, ganzer Weg und Kurzfassung.
 * @param {Awaited<ReturnType<typeof messeLesezeit>>} m
 */
export function lesezeitDaten(m) {
  return { woerterJeMinute: WOERTER_JE_MINUTE, lang: Object.fromEntries(m.lang.schritte), kurz: Object.fromEntries(m.kurz.schritte) };
}

/** Die Datei mit den Daten der echten Story (relativ zur Wurzel). */
export const DATEN_DATEI = 'src/geschichte/lesezeit-daten.json';

/** Schreibt die Datei: ein Eintrag je Zeile, damit Änderungen im Vergleich lesbar bleiben. @param {ReturnType<typeof lesezeitDaten>} d */
export function formatiereDaten(d) {
  const block = (/** @type {Record<string, number>} */ o) => `{\n${Object.entries(o).map(([k, n]) => `    ${JSON.stringify(k)}: ${n}`).join(',\n')}\n  }`;
  return `{\n  "woerterJeMinute": ${d.woerterJeMinute},\n  "lang": ${block(d.lang)},\n  "kurz": ${block(d.kurz)}\n}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const m = await messeLesezeit();
  for (const [name, x] of /** @type {const} */ ([['ganzer Weg', m.lang], ['Kurzfassung', m.kurz]])) {
    console.log(`${name}: ${x.woerter} Wörter ≈ ${x.minuten.toFixed(1)} Minuten (gerundet ${Math.round(x.minuten)})`);
  }
  for (const a of m.akte) console.log(`  Akt ${a.id} · ${a.titel}: ${a.woerter} Wörter ≈ ${a.minuten.toFixed(1)} Minuten`);
  if (process.argv.includes('--schranke')) {
    const sc = await messeSchranke();
    console.log(`obere Schranke, ganzer Weg: ${sc.woerter} Wörter ≈ ${sc.minuten.toFixed(1)} Minuten`);
    for (const a of sc.akte) console.log(`  Akt ${a.id}: ${a.woerter} Wörter ≈ ${a.minuten.toFixed(1)} Minuten`);
  }
  if (process.argv.includes('--schreibe')) {
    const { writeFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    writeFileSync(fileURLToPath(new URL(`../${DATEN_DATEI}`, import.meta.url)), formatiereDaten(lesezeitDaten(m)));
    console.log(`geschrieben: ${DATEN_DATEI}`);
  }
  if (process.argv.includes('--schritte')) console.log(JSON.stringify(m, null, 1));
}
