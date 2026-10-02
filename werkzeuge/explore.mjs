/*
 * Explore-Übersetzer (P16.8, O-46): liest inhalte/werkzeuge.yaml (Texte der fünf Werkzeuge), prüft sie und
 * liefert `werkzeuge` für src/generiert/inhalte.json (Typen: src/inhalte/typen.ts, `Werkzeuge`). Markdown
 * läuft durch den Kompilierer; `belege` bleiben intern (O-38).
 */
import YAML from 'yaml';

const ARTEN = ['aufgabe', 'fruehwarnung', 'risiko', 'problem', 'aenderung', 'massnahme'];
/** @param {unknown} x */
const text = (x) => (x === undefined || x === null ? '' : String(x));

/**
 * @param {any} c Kompilierer
 * @param {string} rel
 * @param {string} roh
 */
export function baueWerkzeuge(c, rel, roh) {
  /** @type {any} */
  let y = {};
  try {
    y = YAML.parse(roh) ?? {};
  } catch (e) {
    c.fehler(rel, `YAML unlesbar: ${String(/** @type {Error} */ (e).message ?? e).split('\n')[0]}`);
  }
  const teil = (/** @type {string} */ k) => {
    const t = y[k] ?? {};
    if (t.titel === undefined) c.fehler(rel, `${k}: Titel fehlt`);
    if (k !== 'glossar' && (!Array.isArray(t.belege) || t.belege.length === 0)) c.fehler(rel, `${k}: interne Belege fehlen`);
    return { titel: text(t.titel), kurz: text(t.kurz), html: c.html(text(t.text), rel) };
  };
  const m = y.matrix ?? {};
  const stufen = (m.stufen ?? []).map((/** @type {any} */ s) => ({ id: text(s.id), titel: text(s.titel), von: Number(s.von), bis: Number(s.bis), html: c.inline(text(s.text), rel) }));
  for (let w = 1; w <= 25; w++) if (stufen.filter((/** @type {any} */ s) => s.von <= w && w <= s.bis).length !== 1) c.fehler(rel, `Matrix: Wert ${w} liegt nicht in genau einer Stufe`);
  const beispiele = (m.beispiele ?? []).map((/** @type {any} */ b) => {
    const ok = [b.w, b.a].every((v) => Number.isInteger(v) && v >= 1 && v <= 5);
    if (!ok) c.fehler(rel, `Matrix-Beispiel ${text(b.kennung)}: w und a je 1–5`);
    return { kennung: text(b.kennung), titel: text(b.titel), w: Number(b.w), a: Number(b.a) };
  });
  if ((m.wahrscheinlichkeit ?? []).length !== 5) c.fehler(rel, 'Matrix: fünf Stufen der Wahrscheinlichkeit');
  if ((m.qualitaet ?? []).length !== 5) c.fehler(rel, 'Matrix: fünf Stufen der Auswirkung auf Qualität');
  const v = y.vorgaenge ?? {};
  const arten = (v.arten ?? []).map((/** @type {any} */ a) => {
    if (!ARTEN.includes(a.id)) c.fehler(rel, `Vorgangsart „${text(a.id)}“ unbekannt`);
    for (const w of a.wege ?? []) if (!ARTEN.includes(w) && w !== 'entscheidung') c.fehler(rel, `Vorgangsart ${a.id}: Weg „${w}“ unbekannt`);
    return { id: text(a.id), titel: text(a.titel), html: c.inline(text(a.text), rel), beispiel: c.inline(text(a.beispiel), rel), abschluss: c.inline(text(a.abschluss), rel), wege: (a.wege ?? []).map(text) };
  });
  if (arten.length !== ARTEN.length) c.fehler(rel, `Vorgangsarten: erwartet ${ARTEN.length}`);
  const t = y.takt ?? {};
  return {
    einleitungHtml: c.html(text(y.einleitung), rel),
    mcda: { ...teil('mcda'), hinweisHtml: c.html(text(y.mcda?.hinweis), rel) },
    matrix: { ...teil('matrix'), stufen, regel: text(m.regel), sonder: text(m.sonder), wahrscheinlichkeit: (m.wahrscheinlichkeit ?? []).map(text), qualitaet: (m.qualitaet ?? []).map(text), beispiele },
    vorgaenge: { ...teil('vorgaenge'), arten, entscheidung: { titel: text(v.entscheidung?.titel), html: c.inline(text(v.entscheidung?.text), rel) } },
    takt: { ...teil('takt'), stufen: (t.stufen ?? []).map((/** @type {any} */ s) => ({ id: text(s.id), titel: text(s.titel), wer: text(s.wer), html: c.inline(text(s.text), rel), beispiel: c.inline(text(s.beispiel), rel) })) },
    glossar: teil('glossar'),
  };
}
