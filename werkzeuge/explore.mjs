/*
 * Explore-Übersetzer (P16.8, O-46; P18.3/P18.4, O-59): liest inhalte/werkzeuge.yaml (Texte der neun Werkzeuge), prüft
 * sie und liefert `werkzeuge` (dazu `regie`, das Regie-Material der vier neuen Werkzeuge) für src/generiert/inhalte.json (Typen: src/inhalte/typen.ts, `Werkzeuge`). Markdown
 * läuft durch den Kompilierer; `belege` bleiben intern (O-38). Die vier neuen Werkzeuge (Konzept docs/WERKZEUGE-P18.md
 * Abschnitt 5) rechnet der Übersetzer zur Selbstprobe mit den Kernen aus src/werkzeuge/ nach: jedes Beispiel muss sein
 * `erwartet` treffen, damit Beispiel, Kern und Konzept nie auseinanderlaufen.
 */
import YAML from 'yaml';
import { sichtbarVerboten } from './sichtbar.mjs';
import { pruefeVorlage } from '../src/werkzeuge/vorlagen-check.ts';
import { MIT_UNKLAR, wegweiser } from '../src/werkzeuge/wegweiser.ts';
import { bewerteRisiko, pruefeGrenzen } from '../src/werkzeuge/risiko-grenzen.ts';
import { AMPELN, FELDGRENZEN, pruefeBericht } from '../src/werkzeuge/monatsbericht.ts';

const ARTEN = ['aufgabe', 'fruehwarnung', 'risiko', 'problem', 'aenderung', 'massnahme'];
/** interner Beleg: Absatz-ID aus V1.2, Stelle aus V2.4 (Handbuch, Teilleistungsbild, Vertragsanlage, Ausschreibung) oder `fall` (Eckdatum der Fall-Bibel) */
const BELEG_V12 = /^k\d+(?:\.\d+)*-[pltb]\d+$/u;
const BELEG_V24 = /^v24:(?:hb|tlb|va|as)(?:-[a-z0-9]+(?:\.[0-9]+)*)?$/u;
const FRAGEN = ['dringlich', 'handlung', 'eingetreten', 'anpassen', 'moeglich', 'arbeit', 'entscheidung'];
const STELLEN = ['sie', 'buergermeisterin', 'lenkungskreis', 'projektsteuerung', 'offen'];
const GEGENSTAENDE = ['geld', 'risiko', 'freigabe', 'ziele'];
const WEGZUSTAENDE = ['zulaessig', 'unzulaessig', 'schein', 'offen'];
const ANTWORTEN = ['ja', 'teilweise', 'nein'];
const ZUSAETZE = ['sofort', 'unklar', 'keinVorgang', 'nichtSchaetzen', 'bisherGilt', 'entscheidung', 'bewerten', 'verknuepfen'];
const RISIKO_SAETZE = ['fehler', 'grenze', 'offen', 'vorlaeufig', 'schwereFolge', 'spanne', 'warnanlass', 'wesentlich', 'annahme', 'annahmeBeispiel', 'selten', 'geplant', 'belegt', 'prognose', 'puffer', 'vorrangA5', 'nachObenOffen'];
const BERICHT_SAETZE = ['ampelOhneFrage', 'entscheidungOhneWerBisWann', 'ohneKennung', 'leerStattKeine', 'zuViele', 'dringlich', 'umgesetztNichtWirksam', 'zuLang'];
const GRENZFEHLER = ['anzahl', 'nicht-positiv', 'nicht-steigend', 'ueber-100'];
/** @param {unknown} x */
const text = (x) => (x === undefined || x === null ? '' : String(x));

/** Adress-Kennung (#explore/<werkzeug>) → Teil in inhalte/werkzeuge.yaml; muss zu WERKZEUGE und TEIL in src/ui/flaechen/explore.ts passen (tests/explore-werkzeuge.test.ts). */
export const WERKZEUG_TEIL = {
  mcda: 'mcda', 'vorlagen-check': 'vorlagencheck', matrix: 'matrix', 'risiko-grenzen': 'risikogrenzen', vorgaenge: 'vorgaenge', wegweiser: 'wegweiser', takt: 'takt', monatsbericht: 'monatsbericht', glossar: 'glossar',
};
/** Die vier Werkzeuge mit Beispielen und Regie-Material (P18, O-59). */
const NEUE_WERKZEUGE = ['vorlagen-check', 'wegweiser', 'risiko-grenzen', 'monatsbericht'];

/**
 * Katalog für die Verweise aus Story und Themen (E-13): je Werkzeug (Adress-Kennung) die Kennungen seiner Beispiele
 * (leer bei den Werkzeugen ohne Beispiele). null, wenn es keine Werkzeuge gibt (dann wird nicht geprüft).
 * @param {any} werkzeuge Ergebnis von baueWerkzeuge
 * @returns {Record<string, string[]> | null}
 */
export function werkzeugKatalog(werkzeuge) {
  if (werkzeuge === null || werkzeuge === undefined) return null;
  return Object.fromEntries(Object.entries(WERKZEUG_TEIL).map(([adresse, teil]) => [adresse, (werkzeuge[teil]?.beispiele ?? []).filter((/** @type {any} */ b) => typeof b.id === 'string').map((/** @type {any} */ b) => b.id)]));
}

/**
 * Verweisfeld `werkzeuge: [{ id, beispiel }]` (E-13) von Story-Kapiteln und Themen: Werkzeug und Beispiel müssen existieren,
 * `beispiel` ist optional und nur bei Werkzeugen mit Beispielen erlaubt; ein Werkzeug höchstens einmal je Verweisliste.
 * Ohne Katalog (null) wird nur die Form geprüft.
 * @param {unknown} roh
 * @param {string} ort
 * @param {Record<string, string[]> | null} katalog
 * @param {(ort: string, f: string) => void} fehler
 * @returns {{ id: string, beispiel: string | null }[]}
 */
export function pruefeWerkzeugVerweise(roh, ort, katalog, fehler) {
  if (roh === undefined) return [];
  if (!Array.isArray(roh)) { fehler(ort, '„werkzeuge“ erwartet eine Liste { id, beispiel }'); return []; }
  /** @type {{ id: string, beispiel: string | null }[]} */
  const aus = [];
  roh.forEach((x, i) => {
    const o = `${ort} werkzeuge[${i + 1}]`;
    if (typeof x !== 'object' || x === null || Array.isArray(x)) { fehler(o, 'erwartet { id, beispiel }'); return; }
    for (const k of Object.keys(x)) if (k !== 'id' && k !== 'beispiel') fehler(o, `unbekanntes Feld „${k}“ (erlaubt: id, beispiel)`);
    const id = text(/** @type {any} */ (x).id);
    const beispiel = /** @type {any} */ (x).beispiel === undefined ? null : text(/** @type {any} */ (x).beispiel);
    if (!Object.hasOwn(WERKZEUG_TEIL, id)) { fehler(o, `Werkzeug „${id}“ gibt es nicht (erlaubt: ${Object.keys(WERKZEUG_TEIL).join(', ')})`); return; }
    if (aus.some((v) => v.id === id)) fehler(o, `Werkzeug „${id}“ doppelt – ein Eintrag je Werkzeug`);
    if (beispiel !== null && katalog !== null && !(katalog[id] ?? []).includes(beispiel)) {
      fehler(o, (katalog[id] ?? []).length === 0 ? `„${id}“ hat keine Beispiele` : `Beispiel „${beispiel}“ gibt es bei „${id}“ nicht (erlaubt: ${(katalog[id] ?? []).join(', ')})`);
    }
    aus.push({ id, beispiel });
  });
  return aus;
}

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
  /** sichtbare Texte der neuen Werkzeuge: Sichtbar-Probe (O-38, O-42, O-56) und kein „Projektblatt“ (L-253, E-10) */
  const sichtbar = (/** @type {string} */ ort, /** @type {unknown} */ x) => {
    const s = text(x);
    for (const f of sichtbarVerboten(s)) c.fehler(rel, `${ort}: ${f}`);
    if (/Projektblatt/iu.test(s)) c.fehler(rel, `${ort}: „Projektblatt“ sichtbar – umschreiben (die Grenzen, die der Bauherr für das Projekt festlegt)`);
    return s;
  };
  const belege = (/** @type {unknown} */ b, /** @type {string} */ ort) => {
    if (!Array.isArray(b) || b.length === 0) { c.fehler(rel, `${ort}: interne Belege fehlen`); return; }
    for (const x of b) {
      const s = text(x);
      if (BELEG_V12.test(s)) {
        if (c.quelle !== null && c.quelle !== undefined && !c.quelle.nachId.has(s)) c.fehler(rel, `${ort}: Beleg „${s}“ – Absatz-ID gibt es nicht`);
      } else if (!BELEG_V24.test(s) && s !== 'fall') c.fehler(rel, `${ort}: Beleg „${s}“ – erwartet Absatz-ID, Stelle aus V2.4 (v24:hb-3.1) oder „fall“`);
    }
  };
  const neuerTeil = (/** @type {string} */ k) => {
    const x = teil(k);
    belege(y[k]?.belege, k);
    return { titel: sichtbar(`${k} titel`, x.titel), kurz: sichtbar(`${k} kurz`, x.kurz), html: (sichtbar(`${k} text`, y[k]?.text), x.html) };
  };
  /** Satz mit Regelgehalt: `{ text, belege }` */
  const satz = (/** @type {any} */ roh, /** @type {string} */ ort) => {
    if (roh === undefined || roh === null) { c.fehler(rel, `${ort}: fehlt`); return ''; }
    belege(roh.belege, ort);
    if (text(roh.text) === '') c.fehler(rel, `${ort}: Text fehlt`);
    return sichtbar(ort, roh.text);
  };
  // Ein Komma ohne Anführungszeichen in einer Zeile `{ titel: A, B }` zerlegt den Wert still in leere Schlüssel – das ist ein Fehler
  const leereSchluessel = (/** @type {unknown} */ x, /** @type {string} */ ort) => {
    if (Array.isArray(x)) x.forEach((e, i) => leereSchluessel(e, `${ort}[${i}]`));
    else if (x !== null && typeof x === 'object') for (const [k, w] of Object.entries(x)) {
      if (w === null) c.fehler(rel, `${ort}.${k}: leerer Wert – Komma im Text? Dann den Text in Anführungszeichen setzen`);
      else leereSchluessel(w, `${ort}.${k}`);
    }
  };
  for (const k of ['vorlagencheck', 'wegweiser', 'risikogrenzen', 'monatsbericht']) leereSchluessel(y[k], k);
  /** Regie-Material je neues Werkzeug (Notiz und Leitfragen) – nur für die Regie, nie öffentlich (L-7, Konzept 0.3) */
  /** @type {Record<string, { notizHtml: string, leitfragen: string[] }>} */
  const regie = {};
  for (const id of NEUE_WERKZEUGE) {
    const teilId = /** @type {Record<string, string>} */ (WERKZEUG_TEIL)[id] ?? id;
    const r = y[teilId]?.regie;
    const ort = `${teilId} regie`;
    if (r === undefined || r === null || typeof r !== 'object' || Array.isArray(r)) { c.fehler(rel, `${ort}: erwartet { notiz, leitfragen }`); continue; }
    for (const k of Object.keys(r)) if (k !== 'notiz' && k !== 'leitfragen') c.fehler(rel, `${ort}: unbekanntes Feld „${k}“ (erlaubt: notiz, leitfragen)`);
    if (text(r.notiz).trim() === '') c.fehler(rel, `${ort}: Notiz fehlt`);
    if (!Array.isArray(r.leitfragen) || r.leitfragen.length === 0) c.fehler(rel, `${ort}: mindestens eine Leitfrage`);
    regie[id] = { notizHtml: c.html(text(r.notiz), rel), leitfragen: (Array.isArray(r.leitfragen) ? r.leitfragen : []).map(text) };
  }
  const vorlagencheck = baueVorlagenCheck(y.vorlagencheck ?? {}, neuerTeil, sichtbar, belege, (/** @type {string} */ f) => c.fehler(rel, f));
  const wegweiserTeil = baueWegweiser(y.wegweiser ?? {}, neuerTeil, sichtbar, satz, belege, (/** @type {string} */ f) => c.fehler(rel, f));
  const risikogrenzen = baueRisikoGrenzen(y.risikogrenzen ?? {}, neuerTeil, sichtbar, satz, (/** @type {string} */ f) => c.fehler(rel, f));
  const monatsbericht = baueMonatsbericht(y.monatsbericht ?? {}, neuerTeil, sichtbar, satz, (/** @type {string} */ f) => c.fehler(rel, f));
  const werkzeuge = {
    einleitungHtml: c.html(text(y.einleitung), rel),
    mcda: { ...teil('mcda'), hinweisHtml: c.html(text(y.mcda?.hinweis), rel) },
    matrix: { ...teil('matrix'), stufen, regel: text(m.regel), sonder: text(m.sonder), wahrscheinlichkeit: (m.wahrscheinlichkeit ?? []).map(text), qualitaet: (m.qualitaet ?? []).map(text), beispiele },
    vorgaenge: { ...teil('vorgaenge'), arten, entscheidung: { titel: text(v.entscheidung?.titel), html: c.inline(text(v.entscheidung?.text), rel) } },
    takt: { ...teil('takt'), stufen: (t.stufen ?? []).map((/** @type {any} */ s) => ({ id: text(s.id), titel: text(s.titel), wer: text(s.wer), html: c.inline(text(s.text), rel), beispiel: c.inline(text(s.beispiel), rel) })) },
    glossar: teil('glossar'),
    vorlagencheck,
    wegweiser: wegweiserTeil,
    risikogrenzen,
    monatsbericht,
  };
  return { werkzeuge, regie };
}

/** @typedef {(ort: string, x: unknown) => string} Sichtbar */
/** @typedef {(f: string) => void} Fehler */

/** Liste der Kennungen: eindeutig und nur aus dem erlaubten Vorrat. */
function kennungen(/** @type {any[]} */ liste, /** @type {string[]} */ erlaubt, /** @type {string} */ ort, /** @type {Fehler} */ fehler, genau = true) {
  const ids = liste.map((/** @type {any} */ x) => text(x.id ?? x.art));
  for (const id of ids) if (!erlaubt.includes(id)) fehler(`${ort}: „${id}“ unbekannt`);
  if (new Set(ids).size !== ids.length) fehler(`${ort}: Kennung doppelt`);
  if (genau && ids.length !== erlaubt.length) fehler(`${ort}: erwartet genau ${erlaubt.join(', ')}`);
}

/**
 * A · Vorlagen-Check (Konzept A, Abschnitt 5).
 * @param {any} v @param {(k: string) => any} neuerTeil @param {Sichtbar} sichtbar @param {(b: unknown, ort: string) => void} belege @param {Fehler} fehler
 */
function baueVorlagenCheck(v, neuerTeil, sichtbar, belege, fehler) {
  const kopf = neuerTeil('vorlagencheck');
  const ampel = { gruen: sichtbar('vorlagencheck ampel', v.ampel?.gruen), gelb: sichtbar('vorlagencheck ampel', v.ampel?.gelb), rot: sichtbar('vorlagencheck ampel', v.ampel?.rot) };
  const schritte = (v.schritte ?? []).map((/** @type {any} */ s) => ({
    id: text(s.id),
    titel: sichtbar(`vorlagencheck ${s.id}`, s.titel),
    punkte: (s.punkte ?? []).map((/** @type {any} */ p) => {
      const ort = `vorlagencheck ${text(p.id)}`;
      belege(p.belege, ort);
      if (typeof p.muss !== 'boolean') fehler(`${ort}: „muss“ ist ja oder nein`);
      if (p.art !== undefined && p.art !== 'zaehlung') fehler(`${ort}: art nur „zaehlung“`);
      for (const f of ['kurz', 'frage', 'schliessen']) if (text(p[f]) === '') fehler(`${ort}: ${f} fehlt`);
      return {
        id: text(p.id), muss: p.muss === true, art: p.art === 'zaehlung' ? 'zaehlung' : null, mindestens: p.mindestens === undefined ? null : Number(p.mindestens),
        kurz: sichtbar(ort, p.kurz), frage: sichtbar(ort, p.frage), schliessen: sichtbar(ort, p.schliessen),
      };
    }),
  }));
  if (schritte.length !== 5) fehler('vorlagencheck: erwartet fünf Prüfschritte');
  const punkte = schritte.flatMap((/** @type {any} */ s) => s.punkte);
  const ids = punkte.map((/** @type {any} */ p) => p.id);
  if (new Set(ids).size !== ids.length) fehler('vorlagencheck: Prüfpunkt doppelt');
  if (!punkte.some((/** @type {any} */ p) => p.muss)) fehler('vorlagencheck: mindestens ein Muss-Punkt');
  if (!ids.includes('a3')) fehler('vorlagencheck: Prüfpunkt a3 (befugte Stelle) fehlt');
  if (punkte.filter((/** @type {any} */ p) => p.art === 'zaehlung').length !== 1) fehler('vorlagencheck: genau ein errechneter Punkt (Zahl der zulässigen Wege)');
  const stellen = (v.stellen ?? []).map((/** @type {any} */ s) => {
    if (s.satz !== undefined) belege(s.belege, `vorlagencheck Stelle ${s.id}`);
    return { id: text(s.id), titel: sichtbar('vorlagencheck Stelle', s.titel), ohneBeispiel: s.ohneBeispiel === undefined ? null : sichtbar('vorlagencheck Stelle', s.ohneBeispiel), satz: s.satz === undefined ? null : sichtbar('vorlagencheck Stelle', s.satz) };
  });
  kennungen(stellen, STELLEN, 'vorlagencheck stellen', fehler);
  for (const id of ['lenkungskreis', 'projektsteuerung']) if (stellen.find((/** @type {any} */ s) => s.id === id)?.satz === null) fehler(`vorlagencheck: Stelle ${id} braucht einen Satz`);
  const wegzustaende = (v.wegzustaende ?? []).map((/** @type {any} */ z) => {
    if (z.satz !== undefined) belege(z.belege, `vorlagencheck Weg ${z.id}`);
    return { id: text(z.id), titel: sichtbar('vorlagencheck Weg', z.titel), satz: z.satz === undefined ? null : sichtbar('vorlagencheck Weg', z.satz) };
  });
  kennungen(wegzustaende, WEGZUSTAENDE, 'vorlagencheck wegzustaende', fehler);
  for (const z of wegzustaende) if (z.id !== 'zulaessig' && z.satz === null) fehler(`vorlagencheck: Wegzustand ${z.id} braucht einen Satz`);
  belege(v.dringlich?.belege, 'vorlagencheck dringlich');
  const dringlich = { frage: sichtbar('vorlagencheck dringlich', v.dringlich?.frage), satz: sichtbar('vorlagencheck dringlich', v.dringlich?.satz) };
  const gegenstaende = (v.gegenstaende ?? []).map((/** @type {any} */ g) => ({ id: text(g.id), titel: sichtbar('vorlagencheck Gegenstand', g.titel) }));
  kennungen(gegenstaende, GEGENSTAENDE, 'vorlagencheck gegenstaende', fehler);
  const m = v.mandat ?? {};
  belege(m.belege, 'vorlagencheck mandat');
  const ms = m.saetze ?? {};
  const mandat = {
    bis: Number(m.bis), darueber: text(m.darueber), reserve: text(m.reserve), immer: Object.fromEntries(Object.entries(m.immer ?? {}).map(([k, x]) => [k, text(x)])), beraet: (m.beraet ?? []).map(text),
    saetze: {
      falsch: sichtbar('mandat', ms.falsch),
      gruende: Object.fromEntries(['betrag', 'reserve', 'risiko', 'freigabe', 'ziele'].map((k) => [k, sichtbar('mandat', ms.gruende?.[k])])),
      beraet: Object.fromEntries(['buergermeisterin', 'sie', 'unbestimmt'].map((k) => [k, sichtbar('mandat', ms.beraet?.[k])])),
      unbestimmt: sichtbar('mandat', ms.unbestimmt),
      selbst: sichtbar('mandat', ms.selbst),
    },
  };
  if (!(mandat.bis > 0)) fehler('vorlagencheck mandat: „bis“ ist ein Betrag über null');
  for (const x of [mandat.darueber, mandat.reserve, ...Object.values(mandat.immer), ...mandat.beraet]) if (!STELLEN.includes(x)) fehler(`vorlagencheck mandat: Stelle „${x}“ unbekannt`);
  for (const k of Object.keys(mandat.immer)) if (!GEGENSTAENDE.includes(k)) fehler(`vorlagencheck mandat: Gegenstand „${k}“ unbekannt`);
  if (!mandat.saetze.falsch.includes('{grund}')) fehler('vorlagencheck mandat: Satz „falsch“ ohne {grund}');
  const beispiele = (v.beispiele ?? []).map((/** @type {any} */ b) => {
    const ort = `vorlagencheck Beispiel ${text(b.id)}`;
    if (!GEGENSTAENDE.includes(b.gegenstand)) fehler(`${ort}: Gegenstand unbekannt`);
    if (!STELLEN.includes(b.stelle)) fehler(`${ort}: Stelle unbekannt`);
    const wege = (b.wege ?? []).map((/** @type {any} */ w) => {
      if (!WEGZUSTAENDE.includes(w.zustand)) fehler(`${ort}: Wegzustand „${text(w.zustand)}“ unbekannt`);
      return { titel: sichtbar(ort, w.titel), zustand: text(w.zustand) };
    });
    if (wege.length > 5) fehler(`${ort}: höchstens fünf Wege`);
    const antworten = Object.fromEntries(Object.entries(b.antworten ?? {}).map(([k, a]) => [k, text(a)]));
    for (const [k, a] of Object.entries(antworten)) {
      const p = punkte.find((/** @type {any} */ x) => x.id === k);
      if (p === undefined) fehler(`${ort}: Prüfpunkt „${k}“ unbekannt`);
      else if (p.art === 'zaehlung') fehler(`${ort}: „${k}“ wird aus den Wegen errechnet`);
      if (!ANTWORTEN.includes(a)) fehler(`${ort}: Antwort „${a}“ – ja, teilweise oder nein`);
    }
    const aus = {
      id: text(b.id), titel: sichtbar(ort, b.titel), lage: sichtbar(ort, b.lage), gegenstand: text(b.gegenstand), stelle: text(b.stelle),
      betrag: b.betrag === null || b.betrag === undefined ? null : Number(b.betrag), reserve: typeof b.reserve === 'boolean' ? b.reserve : null, wege, antworten,
    };
    // Selbstprobe: Ampel des Beispiels mit dem Kern (mit Beispiel gilt die Zuordnung des Beispielprojekts)
    const befund = pruefeVorlage(punkte.map((/** @type {any} */ p) => ({ id: p.id, muss: p.muss, ...(p.art === null ? {} : { art: p.art, mindestens: p.mindestens ?? 2 }) })),
      { antworten, wege: /** @type {any} */ (wege), gegenstand: /** @type {any} */ (aus.gegenstand), stelle: /** @type {any} */ (aus.stelle), betrag: aus.betrag, reserve: aus.reserve, dringlich: false }, /** @type {any} */ (mandat));
    if (befund.ampel !== b.erwartet) fehler(`${ort}: Selbstprobe – erwartet ${text(b.erwartet)}, der Kern ergibt ${befund.ampel}`);
    return aus;
  });
  if (beispiele.length === 0) fehler('vorlagencheck: mindestens ein Beispiel');
  return { ...kopf, ampel, schritte, stellen, wegzustaende, dringlich, gegenstaende, mandat, beispiele };
}

/**
 * B · Vorgangs-Wegweiser (Konzept B, Abschnitt 5).
 * @param {any} v @param {(k: string) => any} neuerTeil @param {Sichtbar} sichtbar @param {(roh: any, ort: string) => string} satz
 * @param {(b: unknown, ort: string) => void} belege @param {Fehler} fehler
 */
function baueWegweiser(v, neuerTeil, sichtbar, satz, belege, fehler) {
  const kopf = neuerTeil('wegweiser');
  const fragen = (v.fragen ?? []).map((/** @type {any} */ f) => {
    belege(f.belege, `wegweiser Frage ${f.id}`);
    return { id: text(f.id), frage: sichtbar(`wegweiser Frage ${f.id}`, f.frage) };
  });
  kennungen(fragen, FRAGEN, 'wegweiser fragen', fehler);
  const ergebnisse = (v.ergebnisse ?? []).map((/** @type {any} */ e) => {
    belege(e.belege, `wegweiser Ergebnis ${e.art}`);
    return { art: text(e.art), schritt: sichtbar('wegweiser Ergebnis', e.schritt), festhalten: sichtbar('wegweiser Ergebnis', e.festhalten) };
  });
  kennungen(ergebnisse, ARTEN, 'wegweiser ergebnisse', fehler);
  const zusaetze = Object.fromEntries(ZUSAETZE.map((k) => [k, { titel: sichtbar(`wegweiser ${k}`, v.zusaetze?.[k]?.titel), text: satz(v.zusaetze?.[k], `wegweiser Zusatz ${k}`) }]));
  for (const k of Object.keys(v.zusaetze ?? {})) if (!ZUSAETZE.includes(k)) fehler(`wegweiser: Zusatz „${k}“ unbekannt`);
  const verwechslungen = (v.verwechslungen ?? []).map((/** @type {any} */ x) => {
    if (!ARTEN.includes(x.art)) fehler(`wegweiser Verwechslung ${x.id}: Art unbekannt`);
    return { id: text(x.id), art: text(x.art), text: satz(x, `wegweiser Verwechslung ${x.id}`) };
  });
  kennungen(verwechslungen, verwechslungen.map((/** @type {any} */ x) => x.id), 'wegweiser verwechslungen', fehler, false);
  const beispiele = (v.beispiele ?? []).map((/** @type {any} */ b) => {
    const ort = `wegweiser Beispiel ${text(b.id)}`;
    const antworten = Object.fromEntries(Object.entries(b.antworten ?? {}).map(([k, a]) => [k, text(a)]));
    for (const [k, a] of Object.entries(antworten)) {
      if (!FRAGEN.includes(k)) fehler(`${ort}: Frage „${k}“ unbekannt`);
      if (!['ja', 'nein', 'unklar'].includes(a) || (a === 'unklar' && !MIT_UNKLAR.includes(/** @type {any} */ (k)))) fehler(`${ort}: Antwort „${a}“ bei ${k}`);
    }
    // Selbstprobe: der Weg ist vollständig beantwortet und endet bei der erwarteten Art
    const weg = wegweiser(/** @type {any} */ (antworten));
    if (weg.naechste !== null) fehler(`${ort}: Selbstprobe – Frage „${weg.naechste}“ bleibt offen`);
    if (weg.pfad.length !== Object.keys(antworten).length) fehler(`${ort}: Selbstprobe – Antworten außerhalb des Wegs`);
    const e = b.erwartet ?? {};
    if (weg.art !== (e.art ?? null)) fehler(`${ort}: Selbstprobe – erwartet ${text(e.art)}, der Kern ergibt ${text(weg.art)}`);
    if (e.entscheidung !== undefined && weg.entscheidung !== e.entscheidung) fehler(`${ort}: Selbstprobe – Entscheidung erwartet ${e.entscheidung}`);
    if (e.dringlich !== undefined && weg.dringlich !== e.dringlich) fehler(`${ort}: Selbstprobe – dringlich erwartet ${e.dringlich}`);
    return { id: text(b.id), titel: sichtbar(ort, b.titel), text: sichtbar(ort, b.text), antworten };
  });
  if (beispiele.length === 0) fehler('wegweiser: mindestens ein Beispiel');
  return { ...kopf, fragen, ergebnisse, zusaetze, verwechslungen, beispiele };
}

/** Zeile eines Risiko-Beispiels → `Wert` des Kerns. @param {unknown} x @param {string} ort @param {Fehler} fehler */
function risikoWert(x, ort, fehler) {
  if (x === undefined || x === 'unbekannt') return { art: 'unbekannt' };
  if (x === 'entfaellt') return { art: 'entfaellt' };
  const o = /** @type {any} */ (x);
  if (typeof o === 'object' && o !== null) {
    if (Number.isInteger(o.stufe) && o.stufe >= 1 && o.stufe <= 5) return { art: 'stufe', stufe: o.stufe };
    if (typeof o.wert === 'number' && o.wert >= 0) return { art: 'wert', wert: o.wert };
    if (typeof o.von === 'number' && typeof o.bis === 'number' && o.von >= 0 && o.von <= o.bis) return { art: 'spanne', von: o.von, bis: o.bis };
  }
  fehler(`${ort}: Wert unlesbar (stufe 1–5, wert ≥ 0, von ≤ bis, unbekannt oder entfaellt)`);
  return { art: 'unbekannt' };
}

/**
 * C · Risiko-Bewerter mit eigenen Grenzen (Konzept C, Abschnitt 5).
 * @param {any} v @param {(k: string) => any} neuerTeil @param {Sichtbar} sichtbar @param {(roh: any, ort: string) => string} satz @param {Fehler} fehler
 */
function baueRisikoGrenzen(v, neuerTeil, sichtbar, satz, fehler) {
  const kopf = neuerTeil('risikogrenzen');
  const g = v.grenzen ?? {};
  const grenzen = { wahrscheinlichkeit: (g.wahrscheinlichkeit ?? []).map(Number), kosten: (g.kosten ?? []).map(Number), termin: (g.termin ?? []).map(Number) };
  for (const [reihe, werte] of Object.entries(grenzen)) {
    const f = pruefeGrenzen(werte, reihe === 'wahrscheinlichkeit');
    if (f.length > 0) fehler(`risikogrenzen Grenzen ${reihe}: ${f.join(', ')}`);
    if (reihe === 'termin' && werte.some((/** @type {number} */ x) => !Number.isInteger(x))) fehler('risikogrenzen Grenzen termin: ganze Tage');
  }
  const zustaende = Object.fromEntries(['fest', 'vorlaeufig', 'offen'].map((k) => [k, sichtbar('risikogrenzen zustaende', v.zustaende?.[k])]));
  const warnanlaesse = (v.warnanlaesse ?? []).map((/** @type {any} */ w) => ({ id: text(w.id), titel: sichtbar('risikogrenzen warnanlaesse', w.titel) }));
  kennungen(warnanlaesse, ['sicherheit', 'genehmigung', 'befugnis', 'option'], 'risikogrenzen warnanlaesse', fehler);
  const grenzfehler = Object.fromEntries(GRENZFEHLER.map((k) => [k, sichtbar('risikogrenzen grenzfehler', v.grenzfehler?.[k])]));
  const saetze = Object.fromEntries(RISIKO_SAETZE.map((k) => [k, satz(v.saetze?.[k], `risikogrenzen Satz ${k}`)]));
  for (const k of Object.keys(v.saetze ?? {})) if (!RISIKO_SAETZE.includes(k)) fehler(`risikogrenzen: Satz „${k}“ unbekannt`);
  if (!saetze.grenze.includes('{n}')) fehler('risikogrenzen: Satz „grenze“ ohne {n}');
  const warnIds = warnanlaesse.map((/** @type {any} */ w) => w.id);
  const beispiele = (v.beispiele ?? []).map((/** @type {any} */ b) => {
    const ort = `risikogrenzen Beispiel ${text(b.id)}`;
    const massnahme = b.massnahme ?? 'keine';
    const prognose = b.prognose ?? 'nein';
    if (!['keine', 'geplant', 'belegt'].includes(massnahme)) fehler(`${ort}: massnahme unbekannt`);
    if (!['ja', 'nein', 'teilweise'].includes(prognose)) fehler(`${ort}: prognose unbekannt`);
    const warn = (b.warn ?? []).map(text);
    for (const w of warn) if (!warnIds.includes(w)) fehler(`${ort}: Warnanlass „${w}“ unbekannt`);
    const aus = {
      id: text(b.id), kennung: sichtbar(ort, b.kennung), titel: sichtbar(ort, b.titel),
      w: risikoWert(b.w, `${ort} w`, fehler), kosten: risikoWert(b.kosten, `${ort} kosten`, fehler), termin: risikoWert(b.termin, `${ort} termin`, fehler), qualitaet: risikoWert(b.qualitaet, `${ort} qualitaet`, fehler),
      warn, massnahme, schwelle: b.schwelle === true, prognose, puffer: typeof b.puffer === 'boolean' ? b.puffer : null,
      waswaere: (b.waswaere ?? []).map((/** @type {any} */ a) => ({
        id: text(a.id), titel: sichtbar(`${ort} waswaere`, a.titel),
        w: a.w === undefined ? null : risikoWert(a.w, `${ort} waswaere ${a.id}`, fehler),
        termin: a.termin === undefined ? null : risikoWert(a.termin, `${ort} waswaere ${a.id}`, fehler),
        massnahme: a.massnahme === undefined ? null : text(a.massnahme),
      })),
    };
    for (const a of aus.waswaere) if (!/^Angenommen: /u.test(a.titel)) fehler(`${ort}: Annahme „${a.id}“ beginnt mit „Angenommen: “ (keine neue Fall-Tatsache)`);
    for (const z of ['kosten', 'termin']) if (aus[z].art === 'stufe') fehler(`${ort}: ${z} als Betrag, Spanne, unbekannt oder entfaellt – nicht als Stufe`);
    if (aus.qualitaet.art === 'wert' || aus.qualitaet.art === 'spanne') fehler(`${ort}: Qualität nur als Stufe`);
    // Selbstprobe mit dem Kern
    const befund = bewerteRisiko(/** @type {any} */ (aus), /** @type {any} */ (grenzen));
    const e = b.erwartet ?? {};
    const ist = { feld: befund.feld?.wert ?? null, zustand: befund.zustand, nachObenOffen: befund.nachObenOffen, prioritaet: befund.prioritaet, vorrangWegenA5: befund.vorrangWegenA5 };
    for (const [k, soll] of Object.entries(e)) if (/** @type {any} */ (ist)[k] !== soll) fehler(`${ort}: Selbstprobe ${k} – erwartet ${String(soll)}, der Kern ergibt ${String(/** @type {any} */ (ist)[k])}`);
    if (Object.keys(e).length === 0) fehler(`${ort}: „erwartet“ fehlt`);
    return aus;
  });
  if (beispiele.length === 0) fehler('risikogrenzen: mindestens ein Beispiel');
  return { ...kopf, grenzen, zustaende, warnanlaesse, grenzfehler, saetze, beispiele };
}

/**
 * D · Monatsbericht-Baukasten (Konzept D, Abschnitt 5).
 * @param {any} v @param {(k: string) => any} neuerTeil @param {Sichtbar} sichtbar @param {(roh: any, ort: string) => string} satz @param {Fehler} fehler
 */
function baueMonatsbericht(v, neuerTeil, sichtbar, satz, fehler) {
  const kopf = neuerTeil('monatsbericht');
  const ampel = { gruen: sichtbar('monatsbericht ampel', v.ampel?.gruen), gelb: sichtbar('monatsbericht ampel', v.ampel?.gelb), rot: sichtbar('monatsbericht ampel', v.ampel?.rot) };
  const ampeln = (v.ampeln ?? []).map((/** @type {any} */ a) => ({ id: text(a.id), titel: sichtbar('monatsbericht ampeln', a.titel) }));
  kennungen(ampeln, [...AMPELN], 'monatsbericht ampeln', fehler);
  const farben = { gruen: sichtbar('monatsbericht farben', v.farben?.gruen), gelb: sichtbar('monatsbericht farben', v.farben?.gelb), rot: sichtbar('monatsbericht farben', v.farben?.rot) };
  const abschnitte = (v.abschnitte ?? []).map((/** @type {any} */ a) => {
    if (!(Number.isInteger(a.max) && a.max >= 1)) fehler(`monatsbericht Abschnitt ${a.id}: max ist eine ganze Zahl ≥ 1`);
    return { id: text(a.id), titel: sichtbar('monatsbericht abschnitte', a.titel), max: Number(a.max) };
  });
  kennungen(abschnitte, abschnitte.map((/** @type {any} */ a) => a.id), 'monatsbericht abschnitte', fehler, false);
  if (abschnitte.length !== 5) fehler('monatsbericht: erwartet fünf Abschnitte');
  const entscheidungen = { titel: sichtbar('monatsbericht entscheidungen', v.entscheidungen?.titel), max: Number(v.entscheidungen?.max) };
  const reaktion = sichtbar('monatsbericht reaktion', v.reaktion);
  const projekt = sichtbar('monatsbericht projekt', v.projekt);
  const fuss = satz(v.fuss, 'monatsbericht fuss');
  const saetze = Object.fromEntries(BERICHT_SAETZE.map((k) => [k, satz(v.saetze?.[k], `monatsbericht Satz ${k}`)]));
  for (const k of Object.keys(v.saetze ?? {})) if (!BERICHT_SAETZE.includes(k)) fehler(`monatsbericht: Satz „${k}“ unbekannt`);
  const lang = (/** @type {string} */ ort, /** @type {string} */ t, /** @type {number} */ max) => { if (t.length > max) fehler(`${ort}: ${t.length} Zeichen, höchstens ${max} (Feldgrenze)`); return t; };
  const beispiele = (v.beispiele ?? []).map((/** @type {any} */ b) => {
    const ort = `monatsbericht Beispiel ${text(b.id)}`;
    /** @type {Record<string, any>} */
    const am = {};
    for (const id of AMPELN) {
      const a = b.ampeln?.[id] ?? {};
      if (!['gruen', 'gelb', 'rot'].includes(a.farbe)) fehler(`${ort}: Ampel ${id} ohne Farbe`);
      am[id] = { farbe: text(a.farbe), satz: lang(ort, sichtbar(ort, a.satz), FELDGRENZEN.ampelSatz), reaktion: a.reaktion === undefined ? null : lang(ort, sichtbar(ort, a.reaktion), FELDGRENZEN.ampelReaktion) };
    }
    /** @type {Record<string, any>} */
    const eintraege = {};
    for (const a of abschnitte) {
      const roh = b.eintraege?.[a.id];
      if (roh === 'keine') { eintraege[a.id] = 'keine'; continue; }
      if (!Array.isArray(roh) || roh.length === 0) { fehler(`${ort}: Abschnitt ${a.id} – „keine“ oder Einträge`); eintraege[a.id] = 'keine'; continue; }
      if (roh.length > a.max) fehler(`${ort}: Abschnitt ${a.id} mit mehr als ${a.max} Einträgen`);
      eintraege[a.id] = roh.map((/** @type {any} */ e) => ({ text: lang(ort, sichtbar(ort, e.text), FELDGRENZEN.eintrag), kennung: lang(ort, sichtbar(ort, e.kennung), FELDGRENZEN.kennung) }));
    }
    for (const k of Object.keys(b.eintraege ?? {})) if (!abschnitte.some((/** @type {any} */ a) => a.id === k)) fehler(`${ort}: Abschnitt „${k}“ unbekannt`);
    const es = b.entscheidungen === 'keine' ? 'keine' : (b.entscheidungen ?? []).map((/** @type {any} */ e) => ({
      frage: lang(ort, sichtbar(ort, e.frage), FELDGRENZEN.frage), stelle: lang(ort, sichtbar(ort, e.stelle), FELDGRENZEN.stelle), bis: lang(ort, sichtbar(ort, e.bis), FELDGRENZEN.bis), kennung: lang(ort, sichtbar(ort, e.kennung), FELDGRENZEN.kennung),
    }));
    if (Array.isArray(es) && es.length > entscheidungen.max) fehler(`${ort}: mehr als ${entscheidungen.max} offene Entscheidungen`);
    const aus = {
      id: text(b.id), titel: sichtbar(ort, b.titel), monat: lang(ort, sichtbar(ort, b.monat), FELDGRENZEN.monat), datenstand: lang(ort, sichtbar(ort, b.datenstand), FELDGRENZEN.datenstand),
      lage: lang(ort, sichtbar(ort, b.lage), FELDGRENZEN.lage), ampeln: am, eintraege, entscheidungen: es, reaktion: lang(ort, sichtbar(ort, b.reaktion), FELDGRENZEN.reaktion),
    };
    // Selbstprobe: der Bericht des Beispiels mit dem Kern
    const bericht = {
      monat: aus.monat, datenstand: aus.datenstand, lage: aus.lage, reaktion: aus.reaktion,
      ampeln: Object.fromEntries(AMPELN.map((id) => [id, { farbe: am[id].farbe, satz: am[id].satz, gehoertZu: am[id].reaktion === null ? null : { reaktion: am[id].reaktion } }])),
      abschnitte: eintraege,
      entscheidungen: es === 'keine' ? 'keine' : es.map((/** @type {any} */ e, /** @type {number} */ i) => ({ ...e, id: `e${i + 1}` })),
    };
    const befund = pruefeBericht(/** @type {any} */ (bericht), Object.fromEntries(abschnitte.map((/** @type {any} */ a) => [a.id, a.max])));
    if (befund.ampel !== b.erwartet) fehler(`${ort}: Selbstprobe – erwartet ${text(b.erwartet)}, der Kern ergibt ${befund.ampel} (${befund.hinweise.map((h) => h.id).join(', ')})`);
    return aus;
  });
  if (beispiele.length === 0) fehler('monatsbericht: mindestens ein Beispiel');
  return { ...kopf, ampel, ampeln, farben, abschnitte, entscheidungen, reaktion, projekt, fuss, saetze, beispiele };
}
