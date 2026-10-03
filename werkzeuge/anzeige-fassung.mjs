// Anzeigefassung der Quelle V1.2 (O-29, L-66): Das Wort „Whitepaper“ kommt im Produkt nirgends vor, Satzfehler der Quelle auch nicht (R67).
// Die Quelle unter quellen/ bleibt unverändert; beim Kompilieren ersetzt diese Liste die wenigen Stellen
// des Originaltexts, die das Wort enthalten, und lässt den Glossarbegriff „Whitepaper“ weg. Zitate in
// inhalte/ werden gegen diese Fassung geprüft (wortgleich wie angezeigt).

/** Ersetzungen in fester Reihenfolge (vom Längeren zum Kürzeren). */
export const ERSETZUNGEN = /** @type {const} */ ([
  ['Ein Whitepaper von Bauherr Mentoren zur', 'Bauherr Mentoren zur'],
  ['in diesem Whitepaper', 'in MVG'],
  ['Leitthese dieses Whitepapers', 'Leitthese von MVG'],
  ['Das Whitepaper setzt', 'MVG setzt'],
  ['im Whitepaper als', 'in MVG als'],
  // R67 (hebt L-14 für die Anzeige auf): Satzfehler der Quelle erschienen in Tafeln als Tippfehler, seit O-38 ohne Originaltext
  ['Wissens-abhängigkeit', 'Wissensabhängigkeit'],
  ['Maßnahmenverknüp-fung', 'Maßnahmenverknüpfung'],
  ['Auftraggeber Logik', 'Auftraggeberlogik'],
  // R74: in eigenem Tafeltext (kein Zitat) das Kürzel ausschreiben – sonst steht in den Themen „Bauherr Mentoren“ (O-51, L-243)
  ['ohne Dauerrolle von BM', 'ohne Dauerrolle von Bauherr Mentoren'],
]);

/** Glossarbegriffe, die entfallen */
const OHNE_BEGRIFF = new Set(['Whitepaper']);

/** @param {string} t */
export function ersetze(t) {
  let aus = t;
  for (const [alt, neu] of ERSETZUNGEN) aus = aus.split(alt).join(neu);
  return aus;
}

/**
 * Tiefe Kopie mit ersetzten Texten, ohne den Glossarbegriff „Whitepaper“ (Glossar und Tabellenzeile).
 * Übrig gebliebene Vorkommen (außer Dateiname der Quelle) sind ein Fehler: die Liste ist dann zu ergänzen.
 * @template T
 * @param {T} wp
 * @returns {T}
 */
export function anzeigeFassung(wp) {
  /** @param {any} o @returns {any} */
  const gehe = (o) => {
    if (typeof o === 'string') return ersetze(o);
    if (Array.isArray(o)) return o.map(gehe);
    if (o === null || typeof o !== 'object') return o;
    /** @type {Record<string, any>} */
    const aus = {};
    for (const [k, v] of Object.entries(o)) aus[k] = k === 'quelle' ? v : gehe(v);
    if (aus['art'] === 'tabelle' && Array.isArray(aus['zeilen'])) {
      const weg = aus['zeilen'].filter((/** @type {any} */ z) => Array.isArray(z) && OHNE_BEGRIFF.has(String(z[0])));
      if (weg.length > 0) {
        aus['zeilen'] = aus['zeilen'].filter((/** @type {any} */ z) => !weg.includes(z));
        if (typeof aus['text'] === 'string') {
          aus['text'] = aus['text'].split('\n').filter((/** @type {string} */ zeile) => !weg.some((/** @type {any[]} */ z) => zeile === z.join(' | '))).join('\n');
        }
      }
    }
    return aus;
  };
  const aus = gehe(wp);
  if (Array.isArray(aus.glossar)) aus.glossar = aus.glossar.filter((/** @type {any} */ g) => !OHNE_BEGRIFF.has(g.begriff));
  const rest = JSON.stringify({ ...aus, quelle: null }).match(/.{0,40}white ?paper.{0,40}/giu);
  if (rest !== null) throw new Error(`Anzeigefassung: „Whitepaper“ bleibt stehen – Ersetzungsliste ergänzen: ${rest.join(' … ')}`);
  return aus;
}
