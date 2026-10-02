/*
 * Story-Übersetzer (P16.6, O-40): liest inhalte/geschichte/rahmen.yaml und s*.yaml, prüft sie und liefert
 * `geschichte` und `geschichteRegie` (Regie-Notizen, nur für die Regie) für src/generiert/inhalte.json (Typen: src/geschichte/typen.ts). Markdown läuft
 * durch den Kompilierer von werkzeuge/inhalte.mjs (Glossar-Spannen, geprüftes HTML). `belege` bleiben
 * intern (O-38) und gehen nicht in die Ausgabe.
 */
import YAML from 'yaml';

const STATUS = ['kosten', 'puffer', 'offen'];
const ARTEN = ['aufgabe', 'massnahme', 'fruehwarnung', 'risiko', 'problem', 'aenderung'];
const BEDINGUNG = /^(s\d+)(!?=)([A-Z])$/u;

/** @param {unknown} x */
const text = (x) => (x === undefined || x === null ? '' : String(x));

/**
 * @param {any} c Kompilierer
 * @param {{ rel: string, text: string }[]} dateien alle Dateien aus inhalte/geschichte/
 */
export function baueGeschichte(c, dateien) {
  const rahmenDatei = dateien.find((d) => d.rel.endsWith('/rahmen.yaml'));
  if (rahmenDatei === undefined) return { geschichte: null, regie: {} };
  const lies = (/** @type {{ rel: string, text: string }} */ d) => {
    try {
      return YAML.parse(d.text) ?? {};
    } catch (e) {
      c.fehler(d.rel, `YAML unlesbar: ${String(/** @type {Error} */ (e).message ?? e).split('\n')[0]}`);
      return {};
    }
  };
  const r = lies(rahmenDatei);
  const rel = rahmenDatei.rel;
  const pflicht = (/** @type {any} */ o, /** @type {string} */ k, /** @type {string} */ ort) => {
    if (o?.[k] === undefined || o[k] === null || o[k] === '') c.fehler(ort, `Feld „${k}“ fehlt`);
    return o?.[k];
  };
  /** @type {Record<string, any>} */
  const status = {};
  for (const k of STATUS) {
    const s = r.status?.[k];
    if (s === undefined) { c.fehler(rel, `status.${k} fehlt`); continue; }
    status[k] = { start: Number(s.start), einheit: text(s.einheit), titel: text(s.titel), basis: s.basis === undefined ? null : Number(s.basis) };
  }
  const kriterien = (r.kriterien ?? []).map((/** @type {any} */ k) => ({ id: text(k.id), titel: text(k.titel) }));
  if (kriterien.length < 2) c.fehler(rel, 'mindestens zwei Kriterien');
  const kritIds = kriterien.map((/** @type {any} */ k) => k.id);

  const folgen = (/** @type {any} */ f, /** @type {string} */ ort) => {
    /** @type {Record<string, number>} */
    const aus = {};
    for (const [k, v] of Object.entries(f ?? {})) {
      if (!STATUS.includes(k)) c.fehler(ort, `Folge „${k}“ unbekannt (${STATUS.join(', ')})`);
      else if (typeof v !== 'number' || !Number.isFinite(v)) c.fehler(ort, `Folge „${k}“ ist keine Zahl`);
      else aus[k] = v;
    }
    return aus;
  };

  const stationsDateien = dateien.filter((d) => /\/s\d+-[^/]+\.yaml$/u.test(d.rel));
  const roh = stationsDateien.map((d) => ({ d, y: lies(d) })).sort((a, b) => Number(a.y.nr) - Number(b.y.nr));
  const ids = roh.map((x) => text(x.y.id));
  /** @type {Map<string, string[]>} */
  const optionenJe = new Map(roh.map((x) => [text(x.y.id), (x.y.vorlage?.optionen ?? []).map((/** @type {any} */ o) => text(o.id))]));

  // Bedingung: Teile mit „&“ verknüpft, je Teil „s3=A“, „s3!=A“ (frühere Wahl), „kurz“ oder „lang“ (Weg)
  // R68: dazu Statusbedingungen „puffer<0“, „kosten>61.3“, „offen>=1“ – nur in Berichtszeilen und Vorgängen (`mitStatus`)
  const bedingung = (/** @type {unknown} */ w, /** @type {string} */ ort, /** @type {number} */ nr, mitStatus = false) => {
    if (w === undefined || w === null) return null;
    for (const teil of text(w).split('&').map((x) => x.trim())) {
      if (teil === 'kurz' || teil === 'lang') continue;
      if (/^(kosten|puffer|offen)(<=|>=|<|>)(-?\d+(?:\.\d+)?)$/u.test(teil)) {
        if (!mitStatus) c.fehler(ort, `Bedingung „${text(w)}“: Statusbedingung „${teil}“ nur in Berichtszeilen und Vorgängen`);
        continue;
      }
      const m = BEDINGUNG.exec(teil);
      if (m === null) { c.fehler(ort, `Bedingung „${text(w)}“ unlesbar (Form s3=A, s3!=A, kurz, lang; verknüpft mit &)`); return null; }
      const st = roh.find((x) => x.y.id === m[1]);
      if (st === undefined) c.fehler(ort, `Bedingung „${text(w)}“: Station ${m[1]} fehlt`);
      else {
        if (Number(st.y.nr) >= nr) c.fehler(ort, `Bedingung „${text(w)}“ zeigt nicht auf eine frühere Station`);
        if (!(optionenJe.get(m[1] ?? '') ?? []).includes(m[3] ?? '')) c.fehler(ort, `Bedingung „${text(w)}“: Option ${m[3]} fehlt`);
      }
    }
    return text(w);
  };

  /** @type {Record<string, { notizHtml: string, leitfragen: string[] }>} */
  const regie = {};
  const stationen = roh.map(({ d, y }, i) => {
    const ort = d.rel;
    regie[text(y.id)] = { notizHtml: c.html(text(y.regie?.notiz), ort), leitfragen: (y.regie?.leitfragen ?? []).map(text) };
    const nr = Number(pflicht(y, 'nr', ort));
    if (nr !== i + 1) c.fehler(ort, `Nummer ${nr} – erwartet ${i + 1}`);
    if (ids.indexOf(y.id) !== i) c.fehler(ort, `Kennung „${y.id}“ doppelt`);
    for (const k of ['id', 'titel', 'kurztitel', 'datum', 'monat', 'lph', 'lage', 'bericht', 'vorlage', 'folge', 'so-laeuft-es-oft', 'einwand', 'regie']) pflicht(y, k, ort);
    if (!Array.isArray(y.belege) || y.belege.length === 0) c.fehler(ort, 'interne Belege fehlen (Feld „belege“)');
    const lph = Number(y.lph);
    if (!(lph >= 0 && lph <= 9)) c.fehler(ort, `LPH ${y.lph} außerhalb 0–9`);
    const v = y.vorlage ?? {};
    const art = text(v.art);
    if (art !== 'gewichte' && art !== 'optionen') c.fehler(ort, `Vorlage: Art „${art}“ unbekannt`);
    const optionen = (v.optionen ?? []).map((/** @type {any} */ o) => {
      const oo = `${ort} Option ${text(o.id)}`;
      const klaerung = o.klaerung === true;
      /** @type {Record<string, [number, string]> | null} */
      let punkte = null;
      /** @type {Record<string, number> | null} */
      let gewichte = null;
      if (art === 'optionen' && !klaerung) {
        punkte = {};
        for (const k of kritIds) {
          const p = o.punkte?.[k];
          if (!Array.isArray(p) || p.length !== 2 || !Number.isInteger(p[0]) || p[0] < 1 || p[0] > 5) c.fehler(oo, `Punkte „${k}“ fehlen oder nicht 1–5 mit Begründung`);
          else punkte[k] = [p[0], text(p[1])];
        }
      }
      if (art === 'gewichte') {
        gewichte = {};
        for (const k of kritIds) {
          const g = o.gewichte?.[k];
          if (!Number.isInteger(g) || g < 1 || g > 5) c.fehler(oo, `Gewicht „${k}“ fehlt oder nicht 1–5`);
          else gewichte[k] = g;
        }
      }
      return {
        id: text(o.id),
        titel: text(pflicht(o, 'titel', oo)),
        html: c.inline(text(o.text), oo),
        punkte,
        gewichte,
        klaerung,
        folgen: folgen(o.folgen, oo),
        konsequenzHtml: c.html(text(pflicht(o, 'konsequenz', oo)), oo),
        naechsteHtml: o.naechste === undefined ? null : c.html(text(o.naechste), oo),
      };
    });
    const zulaessig = optionen.filter((/** @type {any} */ o) => !o.klaerung);
    const unvollstaendig = v.unvollstaendig === undefined ? null : c.html(text(v.unvollstaendig), ort);
    if (zulaessig.length < 2 && unvollstaendig === null) c.fehler(ort, 'Vorlage mit weniger als zwei zulässigen Optionen muss als unvollständig gekennzeichnet sein');
    if (unvollstaendig !== null && !optionen.some((/** @type {any} */ o) => o.klaerung)) c.fehler(ort, 'unvollständige Vorlage ohne Klärungsoption');
    const empf = text(v.empfehlung?.option);
    if (!optionen.some((/** @type {any} */ o) => o.id === empf)) c.fehler(ort, `Empfehlung „${empf}“ ist keine Option`);
    const bericht = y.bericht ?? {};
    const vorgaenge = (y.vorgaenge ?? []).map((/** @type {any} */ g) => {
      const go = `${ort} ${text(g.kennung)}`;
      if (!ARTEN.includes(g.art)) c.fehler(go, `Vorgangsart „${text(g.art)}“ unbekannt`);
      const m = g.matrix;
      if (g.art === 'risiko' && !text(g.stand).startsWith('geschlossen') && (m === undefined || !(m.w >= 1 && m.w <= 5 && m.a >= 1 && m.a <= 5))) c.fehler(go, 'Risiko ohne Matrix (w, a je 1–5)');
      return {
        art: text(g.art),
        kennung: text(pflicht(g, 'kennung', go)),
        titel: text(pflicht(g, 'titel', go)),
        html: c.inline(text(pflicht(g, 'text', go)), go),
        verantwortlich: text(pflicht(g, 'verantwortlich', go)),
        termin: text(g.termin),
        stand: text(g.stand),
        matrix: m === undefined ? null : { w: Number(m.w), a: Number(m.a) },
        wenn: bedingung(g.wenn, go, nr, true),
      };
    });
    return {
      id: text(y.id),
      nr,
      titel: text(y.titel),
      kurztitel: text(y.kurztitel),
      datum: text(y.datum),
      monat: Number(y.monat),
      lph,
      kurzfassung: y.kurzfassung === true,
      lageHtml: c.html(text(y.lage), ort),
      lageFolgen: folgen(y['lage-folgen'], ort),
      // Lage-Folgen, die nur auf bestimmten Wegen gelten (z. B. eine vertagte Entscheidung wird erledigt: offen −1)
      lageFolgenBedingt: (y['lage-folgen-bedingt'] ?? []).map((/** @type {any} */ b) => ({ wenn: bedingung(pflicht(b, 'wenn', ort), ort, nr) ?? '', folgen: folgen(b.folgen, ort) })),
      bericht: {
        titel: text(bericht.titel),
        zeilen: (bericht.zeilen ?? []).map((/** @type {any} */ z) => {
          if (typeof z === 'string') return { html: c.inline(z, ort), wenn: null };
          // R67: „Text: mit Doppelpunkt“ ohne Anführungszeichen wird in YAML stillschweigend zu einem Objekt
          if (typeof z !== 'object' || z === null || typeof z.text !== 'string' || Object.keys(z).some((k) => k !== 'text' && k !== 'wenn')) {
            c.fehler(ort, `Berichtszeile unlesbar (Text oder { text, wenn }; Text mit „: “ in Anführungszeichen): ${JSON.stringify(z).slice(0, 60)}`);
            return { html: '', wenn: null };
          }
          return { html: c.inline(z.text, ort), wenn: bedingung(z.wenn, ort, nr, true) };
        }),
        reaktion: text(bericht.reaktion),
      },
      vorgaenge,
      vorlage: {
        art,
        frage: text(pflicht(v, 'frage', ort)),
        grundHtml: c.html(text(v.grund), ort),
        stelle: text(pflicht(v, 'stelle', ort)),
        termin: text(v.termin),
        verzugHtml: c.inline(text(v.verzug), ort),
        muss: v.muss === undefined ? null : text(v.muss),
        unvollstaendigHtml: unvollstaendig,
        optionen,
        empfehlung: { option: empf, html: c.html(text(v.empfehlung?.text), ort) },
      },
      folgeHtml: c.html(text(y.folge), ort),
      soLaeuftHtml: c.html(text(y['so-laeuft-es-oft']), ort),
      einwand: { frage: text(y.einwand?.frage), antwortHtml: c.html(text(y.einwand?.antwort), ort) },
      theorie: y.theorie === undefined ? null : text(y.theorie),
    };
  });
  if (stationen.length === 0) c.fehler(rel, 'keine Stationen');
  if (!stationen.some((s) => s.vorlage.art === 'gewichte')) c.fehler(rel, 'keine Station legt die Gewichte fest');
  if (stationen[0]?.vorlage.art !== 'gewichte') c.fehler(rel, 'die erste Station muss die Gewichte festlegen');
  if (!stationen[0]?.kurzfassung) c.fehler(rel, 'die erste Station gehört zur Kurzfassung');
  for (let i = 1; i < stationen.length; i++) {
    if ((stationen[i]?.monat ?? 0) < (stationen[i - 1]?.monat ?? 0)) c.fehler(rel, `Station ${i + 1} liegt zeitlich vor Station ${i}`);
  }

  const p = r.prolog ?? {};
  const e = r.ende ?? {};
  const geschichte = {
    titel: text(pflicht(r, 'titel', rel)),
    status,
    kriterien,
    prolog: { titel: text(p.titel), html: c.html(text(p.text), rel), taktHtml: c.html(text(p.takt), rel) },
    ende: { titel: text(e.titel), html: c.html(text(e.text), rel), pufferGut: c.inline(text(e['puffer-gut']), rel), pufferKnapp: c.inline(text(e['puffer-knapp']), rel), pufferSchlecht: c.inline(text(e['puffer-schlecht']), rel) },
    stationen,
  };
  return { geschichte, regie };
}
