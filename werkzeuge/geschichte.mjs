/*
 * Story-Übersetzer (P17.2, O-51/O-52): liest inhalte/geschichte/rahmen.yaml und k<n>-<name>.yaml, prüft sie streng
 * und liefert `geschichte` und `geschichteRegie` (Regie-Material, nur für die Regie) für src/generiert/inhalte.json
 * (Typen: src/geschichte/typen.ts, Format: docs/INHALTSFORMAT.md Abschnitt 3). Markdown läuft durch den Kompilierer
 * von werkzeuge/inhalte.mjs (Glossar-Spannen, geprüftes HTML); jeder sichtbare Text zusätzlich durch die
 * Sichtbar-Probe (werkzeuge/sichtbar.mjs). `belege` und `begruendung` bleiben intern (O-38) und gehen nicht in die
 * Ausgabe; die Wertung der Antworten geht hinein (die Engine braucht sie), erscheint aber nie auf der Seite.
 */
import YAML from 'yaml';
import { sichtbarVerboten } from './sichtbar.mjs';
import { AKZENTE } from '../src/stil/akzente.ts';
import { GIMMICKS } from '../src/grafik/figuren.ts';
import { MINI_ART_KENNUNGEN, miniArt } from '../src/geschichte/mini-arten.ts';
import { BUCH_ARTEN, MINI_STELLEN, NEBENFIGUREN, SPRECHER, VERTIEFUNG_FORMEN } from '../src/geschichte/typen.ts';
import { W } from '../src/ui/woerter.ts';
import { ECHO_PLATZHALTER, ECHOS_MAX } from '../src/geschichte/engine.ts';
import { pruefeWerkzeugVerweise } from './explore.mjs';

const FIGUREN = ['grundstein', 'faden', 'schwung', 'klingel', 'lot'];
/** Monate, mit denen die Zeit einer Station beginnt und eine Brückenzeile anfängt (P19.6, Akte) */
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
/**
 * Block `oberflaeche` in rahmen.yaml (P19.6, L-345): Wortlaut-Liste der Seite – bekannte Schlüssel mit der erwarteten Form. Die Wörter selbst
 * stehen in src/ui/woerter.ts; `tests/geschichte-oberflaeche.test.ts` gleicht beides ab. Der Übersetzer prüft nur Form und Sichtbar-Probe und baut den Block nicht.
 * @type {Record<string, 'text' | 'liste' | string[]>}
 */
export const OBERFLAECHE = {
  station: 'text', 'akt-leiste': 'text', 'rest-gleich': 'text', 'rest-minuten': 'text', 'ort-pause': 'text', 'pause-kicker': 'text', 'kann-jetzt': 'text',
  'pause-weiter': 'text', 'pause-offen': 'text', 'zur-offenen': 'text', gespeichert: 'text', 'weiter-kicker': 'text', 'weiter-ganz': 'text',
  'bruecken-kicker': 'text', buch: 'text', 'buch-titel': 'text', 'buch-intro': 'text', 'buch-leer': 'text', 'buch-legende': 'text', 'buch-spalten': 'liste',
  'buch-art': ['beschluss', 'vermerk', 'uebergabe', 'beschluss-uebergabe'], 'buch-neu': 'text', 'buch-zeigen': 'text', 'buch-druck-titel': 'text',
  'verlauf-pause': 'text', 'verlauf-bilanz': 'text', 'verlauf-text': 'text', 'verlauf-legende': 'text', 'verlauf-hohl': 'text', 'verlauf-offen': 'text',
  vertiefung: 'text', 'vertiefung-formen': ['nachdenken', 'zweiter-fall', 'warum-so'], 'vertiefung-antwort': 'text', 'mini-kicker': 'text',
};
const BALKEN = ['geld', 'zeit', 'vertrauen'];
const STUFEN = ['hoch', 'mittel', 'niedrig'];
const BILANZ = ['nicht-getragen', 'letzte-meter', 'ruhig', 'umwege', 'offen'];
const WERTUNGEN = ['gut', 'vertretbar', 'falle'];
const JAHRESZEITEN = ['fruehling', 'sommer', 'herbst', 'winter'];
const LICHTER = ['morgen', 'tag', 'abend'];
const GEWICHTE = [5, 3, 1];
const KENNUNG = /^[a-z0-9][a-z0-9-]*$/u;
/** Datei einer Station: <Kennung>-<name>.yaml (Kennung = Buchstaben und Ziffer(n): k1 … k8 heute, s1 … s14 mit Reihenfolge-Angabe, P19.3) */
const KAPITEL_DATEI = /\/([a-z]+\d+)-[a-z0-9-]+\.yaml$/u;
const STATIONS_KENNUNG = /^[a-z]+\d+$/u;
/** Zwischenstufen des Campus (P19.3): halbe Stufen laut Drehbuch-Gerüst Abschnitt 9 */
const ZWISCHENSTUFEN = [1.5, 2.5, 3.5, 4.5, 5.5];
const WETTER = ['sturm', 'regen', 'schnee', 'nebel'];
/** interner Beleg: Absatz-ID aus V1.2 (k4.2-p3, k3.2-t1) oder Stelle aus V2.4 (v24:hb-3.1, v24:tlb-2, v24:va-4.1, v24:hb-projektblatt) */
const BELEG_V12 = /^k\d+(?:\.\d+)*-[pltb]\d+$/u;
const BELEG_V24 = /^v24:(?:hb|tlb|va)(?:-[a-z0-9]+(?:\.[0-9]+)*)?$/u;

/** @param {unknown} x */
const text = (x) => (x === undefined || x === null ? '' : String(x));
/** Wörter eines Textes (Folgen aus Buchstaben), für die Längenvergleiche der Kurzfassung und der Vertiefung. @param {unknown} t */
const woerter = (t) => text(t).split(/\s+/u).filter((x) => /\p{L}/u.test(x)).length;
/** Echo-Kennung: Buchstabe, dann Buchstaben, Ziffern, Bindestrich (E1 … E10) */
const ECHO_KENNUNG = /^[A-Za-z][A-Za-z0-9-]*$/u;
/** Absatz der Vertiefung höchstens so viele Wörter (docs/drehbuch-v2/04-rahmen.md 7.4) */
export const VERTIEFUNG_ABSATZ_MAX = 60;
/** Wörter, die im Entscheidungsbuch nicht stehen dürfen: Jede Zeile muss auf jedem Weg wahr sein (docs/drehbuch-v2/04-rahmen.md 5.1) */
const BUCH_VERBOTEN = /mitgeteilt|vollständig|am selben Tag|mit zwei Wegen|mit drei Wegen|Wertung|Punkte|Ihre Antwort|Ihre Wahl/iu;

/**
 * @param {any} c Kompilierer (werkzeuge/inhalte.mjs)
 * @param {{ rel: string, text: string }[]} dateien alle Dateien aus inhalte/geschichte/
 * @param {string[] | null} [themen] Kennungen der Themen (null = nicht prüfen)
 * @param {Record<string, string[]> | null} [werkzeuge] Katalog der Explore-Werkzeuge und ihrer Beispiele (werkzeugKatalog; null = nur die Form prüfen)
 */
export function baueGeschichte(c, dateien, themen = null, werkzeuge = null) {
  const rahmenDatei = dateien.find((d) => d.rel.endsWith('/rahmen.yaml'));
  const lies = (/** @type {{ rel: string, text: string }} */ d) => {
    try {
      const y = YAML.parse(d.text) ?? {};
      if (typeof y !== 'object' || Array.isArray(y)) { c.fehler(d.rel, 'erwartet „schlüssel: wert“ auf oberster Ebene'); return {}; }
      return y;
    } catch (e) {
      c.fehler(d.rel, `YAML unlesbar: ${String(/** @type {Error} */ (e).message ?? e).split('\n')[0]}`);
      return {};
    }
  };
  const rahmenRoh = rahmenDatei === undefined ? {} : lies(rahmenDatei);
  // P19.3: optionale Reihenfolge der Stationen (Kennungen s1 … s14 in beliebiger Folge); ohne sie gilt k<n> in Zahlenfolge wie bisher
  /** @type {string[] | null} */
  let reihenfolge = null;
  if (rahmenRoh.reihenfolge !== undefined) {
    const ro = `${rahmenDatei?.rel ?? 'rahmen.yaml'} reihenfolge`;
    if (!Array.isArray(rahmenRoh.reihenfolge) || rahmenRoh.reihenfolge.length === 0) c.fehler(ro, 'Liste von Stationskennungen erwartet (s1, s2, …)');
    else {
      reihenfolge = rahmenRoh.reihenfolge.map(text);
      for (const k of reihenfolge) if (!STATIONS_KENNUNG.test(k)) c.fehler(ro, `Kennung „${k}“ – erwartet Kleinbuchstaben und Ziffern (s1, k3)`);
      if (new Set(reihenfolge).size !== reihenfolge.length) c.fehler(ro, 'Kennung doppelt');
    }
  }
  for (const d of dateien) {
    const m = KAPITEL_DATEI.exec(d.rel);
    if (d.rel.endsWith('/rahmen.yaml')) continue;
    if (m === null || (reihenfolge === null ? !/^k\d+$/u.test(m[1] ?? '') : !reihenfolge.includes(m[1] ?? ''))) {
      c.fehler(d.rel, reihenfolge === null
        ? 'unbekannte Datei im Ordner der Story – erwartet rahmen.yaml oder k<n>-<name>.yaml'
        : 'unbekannte Datei im Ordner der Story – erwartet rahmen.yaml oder <kennung>-<name>.yaml mit einer Kennung aus der Reihenfolge');
    }
  }
  if (rahmenDatei === undefined) return { geschichte: null, regie: {} };

  /** Nebenfiguren, die rahmen.yaml führt (P19.6): nur diese dürfen in Szenen sprechen (neben den fünf Figuren und den Stimmen) */
  /** @type {Set<string>} */
  const nebenIds = new Set();
  /** Kennungen der Echos (P19.4) und ihre Verwendungen (Echo-Zeile, Platzhalter) – geprüft, sobald die Stationen feststehen */
  /** @type {Set<string>} */
  const echoIds = new Set();
  /** @type {Map<string, Record<string, string>>} */
  const echoFassungen = new Map();
  /** @type {{ id: string, nr: number, ort: string, zeile?: { kurzfassung: boolean, mitKurz: boolean, kurzText: boolean } }[]} */
  const echoVerwendungen = [];

  /* -------------------------------------------------------------- Helfer -- */
  /** Unbekannte Felder melden; Pflichtfelder prüfen. */
  const form = (/** @type {any} */ o, /** @type {string[]} */ pflicht, /** @type {string[]} */ frei, /** @type {string} */ ort) => {
    if (typeof o !== 'object' || o === null || Array.isArray(o)) { c.fehler(ort, 'erwartet „schlüssel: wert“'); return {}; }
    for (const k of Object.keys(o)) if (!pflicht.includes(k) && !frei.includes(k)) c.fehler(ort, `unbekanntes Feld „${k}“ (erlaubt: ${[...pflicht, ...frei].join(', ')})`);
    for (const k of pflicht) if (o[k] === undefined || o[k] === null || o[k] === '') c.fehler(ort, `Feld „${k}“ fehlt`);
    return o;
  };
  /**
   * Sichtbarer Text: Sichtbar-Probe, dann Markdown. Echo-Platzhalter `{echo: E1}` (P19.4) gibt es nur dort, wo `echoNr` gesetzt ist
   * (Folge, Einstieg einer Station mit dieser Nummer); jeder nennt ein bekanntes Echo, dessen Quelle früher liegt (Prüfung nach den Stationen).
   */
  const sicht = (/** @type {unknown} */ t, /** @type {string} */ ort, /** @type {number | null} */ echoNr = null) => {
    const s = text(t);
    for (const f of sichtbarVerboten(s)) c.fehler(ort, f);
    for (const m of s.matchAll(ECHO_PLATZHALTER)) {
      if (echoNr === null) c.fehler(ort, `Echo-Platzhalter „${m[0]}“ nur in „folge“ und „einstieg“ einer Station`);
      else if (!echoIds.has(m[1] ?? '')) c.fehler(ort, `Echo „${m[1]}“ gibt es nicht (rahmen.yaml, echos)`);
      else echoVerwendungen.push({ id: m[1] ?? '', nr: echoNr, ort });
    }
    if (/\{echo:/u.test(s.replace(ECHO_PLATZHALTER, ''))) c.fehler(ort, 'Echo-Platzhalter unlesbar – erwartet {echo: E1}');
    return s;
  };
  const html = (/** @type {unknown} */ t, /** @type {string} */ ort, /** @type {number | null} */ echoNr = null) => c.html(sicht(t, ort, echoNr), ort);
  const inline = (/** @type {unknown} */ t, /** @type {string} */ ort, /** @type {number | null} */ echoNr = null) => {
    const s = sicht(t, ort, echoNr);
    if (/\n\s*\n/u.test(s.trim())) c.fehler(ort, 'ein Absatz erwartet (keine Leerzeile)');
    return c.inline(s, ort);
  };
  const klar = (/** @type {unknown} */ t, /** @type {string} */ ort) => sicht(t, ort).trim();
  const campus = (/** @type {any} */ x, /** @type {string} */ ort) => {
    const o = form(x, ['stufe', 'jahreszeit', 'licht'], ['wetter'], ort);
    const stufe = Number(o.stufe);
    // P19.3: ganze Stufen 0–8 und die fünf Zwischenstufen 1,5 · 2,5 · 3,5 · 4,5 · 5,5 (Gerüst Abschnitt 9)
    if (!(Number.isInteger(stufe) && stufe >= 0 && stufe <= 8) && !ZWISCHENSTUFEN.includes(stufe)) c.fehler(ort, `Campus-Stufe „${text(o.stufe)}“ – erwartet 0–8 oder eine Zwischenstufe (${ZWISCHENSTUFEN.join(', ')})`);
    if (!JAHRESZEITEN.includes(o.jahreszeit)) c.fehler(ort, `Jahreszeit „${text(o.jahreszeit)}“ – erwartet ${JAHRESZEITEN.join(', ')}`);
    if (!LICHTER.includes(o.licht)) c.fehler(ort, `Licht „${text(o.licht)}“ – erwartet ${LICHTER.join(', ')}`);
    // R72/P19.3: besonderes Wetter – sturm, regen, schnee, nebel; ohne Angabe gilt die Jahreszeit
    if (o.wetter !== undefined && !WETTER.includes(o.wetter)) c.fehler(ort, `Wetter „${text(o.wetter)}“ – erwartet ${WETTER.join(', ')}`);
    const gueltig = (Number.isInteger(stufe) && stufe >= 0 && stufe <= 8) || ZWISCHENSTUFEN.includes(stufe);
    return { stufe: gueltig ? stufe : 0, jahreszeit: text(o.jahreszeit), licht: text(o.licht), ...(WETTER.includes(o.wetter) ? { wetter: o.wetter } : {}) };
  };
  const kennung = (/** @type {unknown} */ x, /** @type {string} */ ort, /** @type {string} */ was) => {
    if (x === undefined || x === null) return null;
    if (!KENNUNG.test(text(x))) c.fehler(ort, `${was} „${text(x)}“ ist keine Kennung (Kleinbuchstaben, Ziffern, Bindestrich)`);
    return text(x);
  };
  /** Name einer kleinen Grafik aus src/grafik/figuren.ts (`gimmick`) */
  const bild = (/** @type {unknown} */ x, /** @type {string} */ ort) => {
    if (x === undefined || x === null) return null;
    if (!(/** @type {readonly string[]} */ (GIMMICKS)).includes(text(x))) c.fehler(ort, `Bild „${text(x)}“ gibt es nicht (src/grafik/figuren.ts, GIMMICKS)`);
    return text(x);
  };
  /** Zeile einer Szene; `kurzfassung: false` (nur in Szenen, `mitKurz`) = die Kurzfassung lässt die Zeile weg (P17.5). */
  /**
   * Zeile einer Szene; `kurzfassung: false` (nur in Szenen, `mitKurz`) = die Kurzfassung lässt die Zeile weg (P17.5). P19.4: statt `text`
   * eine Echo-Zeile `echo: E7` mit fester `fortsetzung` (und `fortsetzung-kurz`) – nur in Szenen (`echoNr` = Nummer der Station, Ende:
   * unendlich); `html` hält dann die Fassung „gut“ samt Fortsetzung als Vorgabe.
   */
  const zeile = (/** @type {any} */ z, /** @type {string} */ ort, mitKurz = false, /** @type {number | null} */ echoNr = null) => {
    const hatEcho = typeof z === 'object' && z !== null && z.echo !== undefined;
    const o = form(z, hatEcho ? [] : ['text'], [...(mitKurz ? ['figur', 'zusatz', 'kurzfassung', 'text-kurz', 'nur-kurzfassung'] : ['figur', 'zusatz']), ...(hatEcho ? ['echo', 'fortsetzung', 'fortsetzung-kurz'] : [])], ort);
    if (o.figur !== undefined && !(/** @type {readonly string[]} */ (SPRECHER)).includes(o.figur)) c.fehler(ort, `Figur „${text(o.figur)}“ unbekannt (${SPRECHER.join(', ')})`);
    // P19.6: eine Nebenfigur spricht nur, wenn rahmen.yaml sie führt (Name, Rolle, Namensschild)
    else if ((/** @type {readonly string[]} */ (NEBENFIGUREN)).includes(o.figur) && !nebenIds.has(o.figur)) c.fehler(ort, `Nebenfigur „${text(o.figur)}“ steht nicht in „nebenfiguren“ (rahmen.yaml)`);
    if (o.kurzfassung !== undefined && typeof o.kurzfassung !== 'boolean') c.fehler(ort, '„kurzfassung“ muss ja oder nein sein');
    if (o['nur-kurzfassung'] !== undefined && o['nur-kurzfassung'] !== true) c.fehler(ort, '„nur-kurzfassung“ gibt es nur als ja (die Zeile steht dann nur in der Kurzfassung) – sonst weglassen');
    const nurKurz = o['nur-kurzfassung'] === true;
    const kurzRoh = o['text-kurz'];
    if (nurKurz && o.kurzfassung === false) c.fehler(ort, '„nur-kurzfassung“ und „kurzfassung: nein“ zugleich – entweder oder');
    if (kurzRoh !== undefined && o.kurzfassung === false) c.fehler(ort, '„text-kurz“ an einer Zeile mit „kurzfassung: nein“ – die Kurzfassung zeigt sie nicht');
    if (kurzRoh !== undefined && nurKurz) c.fehler(ort, '„text-kurz“ an einer Zeile „nur-kurzfassung“ – der Text der Zeile ist schon der der Kurzfassung');
    const basis = { figur: o.figur === undefined ? null : text(o.figur), zusatz: o.zusatz === undefined ? null : klar(o.zusatz, ort), kurzfassung: o.kurzfassung !== false };
    // P19.6: `text-kurz` ersetzt die ganze Zeile in der Kurzfassung; `nur-kurzfassung` setzt eine Zeile, die nur dort steht
    const kurzHtml = kurzRoh === undefined ? undefined : inline(kurzRoh, `${ort} text-kurz`);
    const zusaetze = { ...(kurzHtml !== undefined ? { kurzHtml } : {}), ...(nurKurz ? { nurKurz: /** @type {const} */ (true) } : {}) };
    if (!hatEcho) {
      if (kurzRoh !== undefined && woerter(kurzRoh) >= woerter(o.text)) c.fehler(ort, `„text-kurz“ hat ${woerter(kurzRoh)} Wörter, „text“ ${woerter(o.text)} – die Kurzfassung muss kürzer sein`);
      return { figur: basis.figur, zusatz: basis.zusatz, html: inline(o.text, ort), kurzfassung: basis.kurzfassung, ...zusaetze };
    }
    const id = text(o.echo);
    if (echoNr === null) c.fehler(ort, 'Echo-Zeile nur in der Szene einer Station oder des Endes');
    else if (!echoIds.has(id)) c.fehler(ort, `Echo „${id}“ gibt es nicht (rahmen.yaml, echos)`);
    else echoVerwendungen.push({ id, nr: echoNr, ort, zeile: { kurzfassung: basis.kurzfassung, mitKurz, kurzText: kurzRoh !== undefined } });
    const fort = o.fortsetzung === undefined ? undefined : inline(o.fortsetzung, `${ort} fortsetzung`);
    const fortKurz = o['fortsetzung-kurz'] === undefined ? undefined : inline(o['fortsetzung-kurz'], `${ort} fortsetzung-kurz`);
    if (fortKurz !== undefined && fort === undefined) c.fehler(ort, '„fortsetzung-kurz“ ohne „fortsetzung“');
    const gut = echoFassungen.get(id)?.gut ?? '';
    // der Ersatz der Kurzfassung muss kürzer sein als jede Fassung des Echos samt Fortsetzung (sonst würde die Kurzfassung länger)
    if (kurzRoh !== undefined && echoFassungen.has(id)) {
      const kuerzeste = Math.min(...Object.values(echoFassungen.get(id) ?? {}).map((f) => woerter(f))) + woerter(o.fortsetzung);
      if (woerter(kurzRoh) >= kuerzeste) c.fehler(ort, `„text-kurz“ hat ${woerter(kurzRoh)} Wörter, die kürzeste Fassung samt Fortsetzung ${kuerzeste} – die Kurzfassung muss kürzer sein`);
    }
    return {
      ...basis, html: fort !== undefined ? `${gut} ${fort}` : gut, echo: id,
      ...(fort !== undefined ? { fortsetzungHtml: fort } : {}), ...(fortKurz !== undefined ? { fortsetzungKurzHtml: fortKurz } : {}), ...zusaetze,
    };
  };
  /** @param {unknown} s @param {string} ort @param {number | null} [echoNr] Nummer der Station, wenn die Szene Echo-Zeilen tragen darf */
  const szene = (s, ort, echoNr = null) => {
    if (!Array.isArray(s) || s.length === 0) { c.fehler(ort, 'Szene: Liste von Zeilen { figur, text } erwartet'); return []; }
    return s.map((z, i) => zeile(z, `${ort} Zeile ${i + 1}`, true, echoNr));
  };
  /**
   * Kürzungen der Kurzfassung (P17.5): `einstieg-kurz` nur dort, wo die Kurzfassung den Schritt zeigt, und kürzer als
   * `einstieg`; Zeilen mit `kurzfassung: false` nur dort, und dann bleiben mindestens zwei Zeilen stehen.
   */
  const kuerzung = (/** @type {any} */ o, /** @type {any[]} */ zeilen, /** @type {boolean} */ inKurz, /** @type {string} */ ort) => {
    const weg = zeilen.filter((z) => !z.kurzfassung).length;
    // P19.6: Zeilen mit Ersatz (`text-kurz`) und Zeilen nur für die Kurzfassung (`nur-kurzfassung`)
    const ersatzZeilen = zeilen.filter((z) => z.kurzHtml !== undefined).length;
    const nur = zeilen.filter((z) => z.nurKurz === true).length;
    const roh = o['einstieg-kurz'];
    if (!inKurz) {
      if (roh !== undefined) c.fehler(ort, '„einstieg-kurz“ nur in Kapiteln der Kurzfassung');
      if (weg > 0) c.fehler(`${ort} szene`, '„kurzfassung: nein“ an einer Zeile nur in Kapiteln der Kurzfassung');
      if (ersatzZeilen > 0) c.fehler(`${ort} szene`, '„text-kurz“ an einer Zeile nur in Kapiteln der Kurzfassung');
      if (nur > 0) c.fehler(`${ort} szene`, '„nur-kurzfassung“ an einer Zeile nur in Kapiteln der Kurzfassung');
      return null;
    }
    if (weg > 0 && zeilen.length - weg < 2) c.fehler(`${ort} szene`, `in der Kurzfassung blieben ${zeilen.length - weg} Zeilen – mindestens zwei`);
    if (nur > 0 && zeilen.length - nur < 2) c.fehler(`${ort} szene`, `auf dem ganzen Weg blieben ${zeilen.length - nur} Zeilen – mindestens zwei`);
    if (roh === undefined || roh === null) return null;
    if (woerter(roh) >= woerter(o.einstieg)) c.fehler(ort, `„einstieg-kurz“ hat ${woerter(roh)} Wörter, „einstieg“ ${woerter(o.einstieg)} – die Kurzfassung muss kürzer sein`);
    return html(roh, `${ort} einstieg-kurz`);
  };
  /**
   * Text, den die Kurzfassung kürzen darf (P19.5, docs/drehbuch-v2/04-rahmen.md 7.8): ein Text wie bisher – oder eine Liste von Absätzen
   * (`html`) bzw. Sätzen (`inline`), jeder Eintrag ein Text oder `{ text, kurzfassung: nein }` (nur in der langen Fassung). Dazu der
   * Ersatz `<feld>-kurz`: ein kürzerer Text für die Kurzfassung (wie `einstieg-kurz`). Beides zugleich gibt es nicht.
   * @param {any} o Objekt mit dem Feld @param {string} feld @param {string} ort @param {'html' | 'inline'} art @param {boolean} inKurz Station gehört zur Kurzfassung
   * @param {number | null} echoNr Station, in der Echo-Platzhalter stehen dürfen (null = keine)
   * @returns {{ lang: string, kurz: string | null }}
   */
  const kuerzbar = (o, feld, ort, art, inKurz, echoNr) => {
    const roh = o[feld];
    const fo = `${ort} ${feld}`;
    const eins = (/** @type {unknown} */ t, /** @type {string} */ wo) => (art === 'html' ? html(t, wo, echoNr) : inline(t, wo, echoNr));
    const fuege = (/** @type {{ text: unknown, kurz: boolean, wo: string }[]} */ liste) => liste.map((e) => eins(e.text, e.wo)).join(art === 'html' ? '' : ' ');
    /** @type {string} */
    let lang;
    /** @type {string | null} */
    let kurz = null;
    /** @type {unknown} */
    let langRoh = roh;
    if (Array.isArray(roh)) {
      if (roh.length === 0) c.fehler(fo, 'leere Liste');
      const eintraege = roh.map((/** @type {any} */ x, /** @type {number} */ i) => {
        const wo = `${fo} ${i + 1}`;
        if (typeof x === 'string') return { text: x, kurz: true, wo };
        const e = form(x, ['text'], ['kurzfassung'], wo);
        if (e.kurzfassung !== undefined && typeof e.kurzfassung !== 'boolean') c.fehler(wo, '„kurzfassung“ muss ja oder nein sein');
        return { text: e.text, kurz: e.kurzfassung !== false, wo };
      });
      const weg = eintraege.filter((e) => !e.kurz).length;
      if (weg > 0 && !inKurz) c.fehler(fo, '„kurzfassung: nein“ nur in Kapiteln der Kurzfassung');
      if (weg > 0 && weg === eintraege.length) c.fehler(fo, 'in der Kurzfassung bliebe nichts stehen – mindestens ein Eintrag ohne „kurzfassung: nein“');
      lang = fuege(eintraege);
      if (weg > 0 && inKurz) kurz = fuege(eintraege.filter((e) => e.kurz));
      langRoh = eintraege.map((e) => text(e.text)).join(' ');
    } else lang = eins(roh, fo);
    const ersatz = o[`${feld}-kurz`];
    if (ersatz !== undefined && ersatz !== null) {
      if (kurz !== null) c.fehler(ort, `„${feld}“ mit „kurzfassung: nein“ und „${feld}-kurz“ zugleich – entweder oder`);
      else if (!inKurz) c.fehler(ort, `„${feld}-kurz“ nur in Kapiteln der Kurzfassung`);
      else if (woerter(ersatz) >= woerter(langRoh)) c.fehler(ort, `„${feld}-kurz“ hat ${woerter(ersatz)} Wörter, „${feld}“ ${woerter(langRoh)} – die Kurzfassung muss kürzer sein`);
      else kurz = eins(ersatz, `${fo}-kurz`);
    }
    return { lang, kurz };
  };
  const belege = (/** @type {unknown} */ b, /** @type {string} */ ort) => {
    if (!Array.isArray(b) || b.length === 0) { c.fehler(ort, 'interne Belege fehlen (Feld „belege“)'); return; }
    for (const x of b) {
      const s = text(x);
      if (BELEG_V12.test(s)) {
        if (c.quelle !== null && c.quelle !== undefined && !c.quelle.nachId.has(s)) c.fehler(ort, `Beleg „${s}“: Absatz-ID gibt es nicht`);
      } else if (!BELEG_V24.test(s)) c.fehler(ort, `Beleg „${s}“ – erwartet eine Absatz-ID (k4.2-p3) oder eine Stelle aus V2.4 (v24:hb-3.1)`);
    }
  };

  /* -------------------------------------------------------------- Rahmen -- */
  const rel = rahmenDatei.rel;
  const r = form(rahmenRoh, ['titel', 'auftakt', 'sie', 'figuren', 'balken', 'bilanz', 'mandat', 'ende'], ['reihenfolge', 'akte', 'echos', 'buch', 'nebenfiguren', 'oberflaeche'], rel);
  const au = form(r.auftakt ?? {}, ['campus', 'text', 'vorstellung', 'los', 'kurz'], ['balken-titel', 'wegwahl'], `${rel} auftakt`);
  const sie = form(r.sie ?? {}, ['steckbrief'], [], `${rel} sie`);
  const figuren = (Array.isArray(r.figuren) ? r.figuren : []).map((/** @type {any} */ f, /** @type {number} */ i) => {
    const ort = `${rel} figuren ${i + 1}`;
    const o = form(f, ['id', 'name', 'rolle', 'akzent', 'steckbrief'], [], ort);
    if (!AKZENTE.includes(o.akzent)) c.fehler(ort, `Akzent „${text(o.akzent)}“ unbekannt (${AKZENTE.join(', ')})`);
    return { id: text(o.id), name: klar(o.name, ort), rolle: klar(o.rolle, ort), akzent: text(o.akzent), steckbriefHtml: inline(o.steckbrief, ort) };
  });
  if (figuren.map((/** @type {any} */ f) => f.id).join() !== FIGUREN.join()) c.fehler(`${rel} figuren`, `erwartet die fünf Figuren in dieser Reihenfolge: ${FIGUREN.join(', ')}`);
  /**
   * Nebenfiguren (P19.6, O-62): `id`, `name`, `rolle`, `akzent` (Ton der Akzentpalette oder „keiner“), `kurz` (Namensschild beim ersten Auftritt,
   * sichtbar) und `steckbrief` (nur die Regie). Genau die drei Kennungen aus `NEBENFIGUREN` in dieser Reihenfolge – oder das Feld fehlt (dann
   * sprechen keine Nebenfiguren). Sie stehen nicht im Auftakt und haben dort keinen Steckbrief.
   */
  const nebenfiguren = (() => {
    if (r.nebenfiguren === undefined) return [];
    const no = `${rel} nebenfiguren`;
    if (!Array.isArray(r.nebenfiguren) || r.nebenfiguren.length === 0) { c.fehler(no, 'Liste der Nebenfiguren erwartet'); return []; }
    const liste = r.nebenfiguren.map((/** @type {any} */ f, /** @type {number} */ i) => {
      const ort = `${no} ${i + 1}`;
      const o = form(f, ['id', 'name', 'rolle', 'akzent', 'kurz', 'steckbrief'], [], ort);
      if (o.akzent !== 'keiner' && !AKZENTE.includes(o.akzent)) c.fehler(ort, `Akzent „${text(o.akzent)}“ unbekannt (${AKZENTE.join(', ')}, keiner)`);
      return { id: text(o.id), name: klar(o.name, ort), rolle: klar(o.rolle, ort), akzent: text(o.akzent), kurzHtml: inline(o.kurz, `${ort} kurz`), steckbriefHtml: inline(o.steckbrief, `${ort} steckbrief`) };
    });
    if (liste.map((/** @type {any} */ f) => f.id).join() !== NEBENFIGUREN.join()) c.fehler(no, `erwartet die drei Nebenfiguren in dieser Reihenfolge: ${NEBENFIGUREN.join(', ')}`);
    for (const f of liste) nebenIds.add(f.id);
    return liste;
  })();
  const balkenRoh = form(r.balken ?? {}, BALKEN, [], `${rel} balken`);
  const balken = BALKEN.map((id) => {
    const ort = `${rel} balken.${id}`;
    const o = form(balkenRoh[id] ?? {}, ['titel', 'text', 'start', 'mehr', 'weniger', 'bilanz'], [], ort);
    const start = Number(o.start);
    if (!Number.isInteger(start) || start < 0 || start > 10) c.fehler(ort, `Start „${text(o.start)}“ – erwartet 0–10`);
    const bi = form(o.bilanz ?? {}, STUFEN, [], `${ort}.bilanz`);
    return {
      id, titel: klar(o.titel, ort), html: inline(o.text, ort), start: Number.isInteger(start) ? start : 0, mehr: klar(o.mehr, ort), weniger: klar(o.weniger, ort),
      bilanz: Object.fromEntries(STUFEN.map((s) => [s, inline(bi[s], `${ort}.bilanz.${s}`)])),
    };
  });
  const bilanzRoh = form(r.bilanz ?? {}, BILANZ, [], `${rel} bilanz`);
  const bilanz = Object.fromEntries(BILANZ.map((id) => {
    const o = form(bilanzRoh[id] ?? {}, ['titel', 'text'], [], `${rel} bilanz.${id}`);
    return [id, { titel: klar(o.titel, `${rel} bilanz.${id}`), html: inline(o.text, `${rel} bilanz.${id}`) }];
  }));
  const ma = form(r.mandat ?? {}, ['titel', 'zeilen'], [], `${rel} mandat`);
  const mandat = {
    titel: klar(ma.titel, `${rel} mandat`),
    zeilen: (Array.isArray(ma.zeilen) ? ma.zeilen : []).map((/** @type {any} */ z, /** @type {number} */ i) => {
      const mo = `${rel} mandat ${i + 1}`;
      const o = form(z, ['wer', 'text'], [], mo);
      const wer = klar(o.wer, mo);
      if (!Array.isArray(o.text)) return { wer, html: inline(o.text, mo) };
      // P19.6: der Text darf eine Liste von Absätzen sein; ein Absatz `{ text, kurzfassung: nein }` steht nur auf dem ganzen Weg
      if (o.text.length === 0) c.fehler(mo, 'leere Liste');
      const absaetze = o.text.map((/** @type {any} */ x, /** @type {number} */ j) => {
        const wo = `${mo} Absatz ${j + 1}`;
        if (typeof x === 'string') return { html: inline(x, wo), kurzfassung: true };
        const e = form(x, ['text'], ['kurzfassung'], wo);
        if (e.kurzfassung !== undefined && typeof e.kurzfassung !== 'boolean') c.fehler(wo, '„kurzfassung“ muss ja oder nein sein');
        return { html: inline(e.text, wo), kurzfassung: e.kurzfassung !== false };
      });
      if (absaetze.length > 0 && absaetze.every((/** @type {any} */ a) => !a.kurzfassung)) c.fehler(mo, 'in der Kurzfassung bliebe nichts stehen – mindestens ein Absatz ohne „kurzfassung: nein“');
      return { wer, html: absaetze.map((/** @type {any} */ a) => a.html).join(' '), absaetze };
    }),
  };
  if (mandat.zeilen.length === 0) c.fehler(`${rel} mandat`, 'keine Zeilen');
  /** Echos (P19.4): eine Zeile in drei Fassungen je Quelle; ändert nur Ton und Wortlaut */
  const echos = (() => {
    if (r.echos === undefined) return [];
    const eo = `${rel} echos`;
    if (!Array.isArray(r.echos) || r.echos.length === 0) { c.fehler(eo, 'Liste von Echos { id, quelle, fassungen } erwartet'); return []; }
    if (r.echos.length > ECHOS_MAX) c.fehler(eo, `höchstens ${ECHOS_MAX} Echos, nicht ${r.echos.length}`);
    return r.echos.map((/** @type {any} */ e, /** @type {number} */ i) => {
      const ort = `${eo} ${i + 1}`;
      const o = form(e, ['id', 'quelle', 'fassungen'], [], ort);
      const id = text(o.id);
      if (!ECHO_KENNUNG.test(id)) c.fehler(ort, `Echo-Kennung „${id}“ – erwartet Buchstabe, dann Buchstaben, Ziffern, Bindestrich (E1)`);
      else if (echoIds.has(id)) c.fehler(ort, `Echo „${id}“ doppelt`);
      echoIds.add(id);
      const f = form(o.fassungen ?? {}, WERTUNGEN, [], `${ort} fassungen`);
      // die Wertung wird nie genannt: weder „Falle“ noch „vertretbar“ noch „Wertung“ (das gewöhnliche Wort „gut“ bleibt erlaubt)
      for (const w of WERTUNGEN) {
        const treffer = /\b(?:Falle|vertretbar|Wertung)\b/u.exec(text(f[w]));
        if (treffer !== null) c.fehler(`${ort} fassungen.${w}`, `„${treffer[0]}“ nennt die Wertung – ein Echo gibt Ton, nie das Urteil`);
      }
      const fassungen = Object.fromEntries(WERTUNGEN.map((w) => [w, inline(f[w], `${ort} fassungen.${w}`)]));
      echoFassungen.set(id, fassungen);
      return { id, quelle: text(o.quelle), fassungen };
    });
  })();
  /** `oberflaeche` (P19.6): nur Form und Sichtbar-Probe – die Wörter stehen in src/ui/woerter.ts (OBERFLAECHE oben, L-345) */
  if (r.oberflaeche !== undefined) {
    const oo = `${rel} oberflaeche`;
    const ob = form(r.oberflaeche, [], Object.keys(OBERFLAECHE), oo);
    for (const [k, v] of Object.entries(ob)) {
      const art = OBERFLAECHE[k];
      if (art === undefined) continue;
      if (art === 'text') { if (typeof v !== 'string' || v.trim() === '') c.fehler(`${oo} ${k}`, 'Text erwartet'); else sicht(v, `${oo} ${k}`); }
      else if (art === 'liste') { if (!Array.isArray(v) || v.length === 0) c.fehler(`${oo} ${k}`, 'Liste erwartet'); else v.forEach((t, i) => sicht(t, `${oo} ${k} ${i + 1}`)); }
      else {
        const sub = form(v, art, [], `${oo} ${k}`);
        for (const a of art) if (sub[a] !== undefined) sicht(sub[a], `${oo} ${k}.${a}`);
      }
    }
  }
  const en = form(r.ende ?? {}, ['zeit', 'campus', 'einstieg', 'szene', 'zeit-niedrig', 'vertrauen-niedrig', 'nach-falle', 'offen'], ['einstieg-kurz'], `${rel} ende`);
  const endeSzene = szene(en.szene, `${rel} ende.szene`, Number.POSITIVE_INFINITY);
  const ende = {
    zeit: klar(en.zeit, `${rel} ende`),
    campus: campus(en.campus, `${rel} ende.campus`),
    einstiegHtml: html(en.einstieg, `${rel} ende`),
    einstiegKurzHtml: kuerzung(en, endeSzene, true, `${rel} ende`),
    szene: endeSzene,
    zeitNiedrigHtml: html(en['zeit-niedrig'], `${rel} ende.zeit-niedrig`),
    vertrauenNiedrig: ersatz(en['vertrauen-niedrig'], `${rel} ende.vertrauen-niedrig`),
    nachFalle: ersatz(en['nach-falle'], `${rel} ende.nach-falle`),
    offen: ersatz(en.offen, `${rel} ende.offen`),
  };
  /**
   * Ersatzzeilen des Endes (L-239): je Zeile die Figur, deren Zeile sie ersetzt – die Figur spricht in der Szene des Endes,
   * jede höchstens einmal; die Ersatzzeile steht auf denselben Wegen wie die ersetzte (ganze Geschichte bzw. Kurzfassung).
   */
  function ersatz(/** @type {unknown} */ roh, /** @type {string} */ ort) {
    if (roh === undefined) return []; // fehlt das Feld, meldet es schon form
    if (!Array.isArray(roh) || roh.length === 0) { c.fehler(ort, 'Liste von Ersatzzeilen { figur, text } erwartet'); return []; }
    const liste = roh.map((z, i) => zeile(z, `${ort} ${i + 1}`));
    const figuren = liste.map((z) => z.figur);
    if (new Set(figuren).size !== figuren.length) c.fehler(ort, 'eine Figur hat zwei Ersatzzeilen');
    for (const f of figuren) if (f === null || !endeSzene.some((/** @type {any} */ z) => z.figur === f)) c.fehler(ort, `ersetzt die Zeile einer Figur, die in der Szene des Endes spricht – „${f ?? 'ohne Figur'}“ spricht dort nicht`);
    return liste;
  }

  /* ------------------------------------------------------------- Kapitel -- */
  /**
   * Brückensatz einer übersprungenen Station. Ohne `akte:` wie bisher ein Markdown-Block. Mit Akten (P19.6, L-343) ist er eine Zeile der
   * Brückenkarte: `Monat: Satz.` – die Seite setzt die fette Nummer davor, Titel und Jahr entfallen. Die Entwürfe schreiben ihn in drei Formen
   * (`**2** · März: …`, `März: …`, nur der Satz): die erste verliert die Nummer (sie muss die der Station sein), die dritte bekommt den Monat der Zeit.
   */
  function brueckenzeile(/** @type {any} */ o, /** @type {number} */ nr, /** @type {string} */ ort) {
    if (r.akte === undefined) return html(o.bruecke, ort);
    let t = text(o.bruecke).trim();
    const nummer = /^\*\*(\d+)\*\*\s*·\s*/u.exec(t);
    if (nummer !== null) {
      if (Number(nummer[1]) !== nr) c.fehler(ort, `die Nummer „${nummer[1]}“ vor dem Satz ist nicht die der Station (${nr}) – die Seite setzt sie selbst, sie kann entfallen`);
      t = t.slice(nummer[0].length);
    }
    if (!MONATE.some((m) => t.startsWith(`${m}:`))) {
      const monat = text(o.zeit).split(/\s+/u)[0] ?? '';
      if (MONATE.includes(monat)) t = `${monat}: ${t}`;
      else c.fehler(ort, 'die Brückenzeile beginnt mit „Monat:“ – oder die Zeit der Station nennt den Monat zuerst');
    }
    return inline(t, ort);
  }

  const kapitelId = (/** @type {{ rel: string }} */ d) => KAPITEL_DATEI.exec(d.rel)?.[1] ?? '';
  const roh = dateien.filter((d) => KAPITEL_DATEI.test(d.rel) && !d.rel.endsWith('/rahmen.yaml')).map((d) => ({ d, y: lies(d), dateiId: kapitelId(d), dateiNr: Number(/\d+$/u.exec(kapitelId(d))?.[0]) }))
    .filter((x) => (reihenfolge === null ? /^k\d+$/u.test(x.dateiId) : reihenfolge.includes(x.dateiId)))
    .sort((a, b) => (reihenfolge === null ? a.dateiNr - b.dateiNr : reihenfolge.indexOf(a.dateiId) - reihenfolge.indexOf(b.dateiId)));
  if (reihenfolge !== null) {
    for (const k of reihenfolge) if (!roh.some((x) => x.dateiId === k)) c.fehler(`${rel} reihenfolge`, `Station „${k}“ hat keine Datei (${k}-<name>.yaml)`);
  }
  /** @type {Record<string, { notizHtml: string, leitfragen: string[] }>} */
  const regie = {};
  const kapitel = roh.map(({ d, y, dateiNr, dateiId }, i) => {
    const ort = d.rel;
    const o = form(y, ['nr', 'titel', 'zeit', 'campus', 'thema', 'belege', 'einstieg', 'szene', 'frage', 'antworten', 'gut', 'dahinter'],
      ['kurzfassung', 'bruecke', 'einstieg-kurz', 'campus-nachher', 'zusatz', 'bild-szene', 'bild-frage', 'mandat-nach-folge', 'mini', 'vergleich', 'regie', 'werkzeuge', 'vertiefung', 'gut-kurz', 'dahinter-kurz'], ort);
    const nr = Number(o.nr);
    if (nr !== i + 1) c.fehler(ort, `Nummer ${text(o.nr)} – erwartet ${i + 1} (${reihenfolge === null ? 'lückenlos ab 1' : 'Stelle in der Reihenfolge'})`);
    // ohne Reihenfolge-Angabe trägt der Dateiname die Nummer (k3-…); mit ihr zählt die Stelle in der Reihenfolge
    if (reihenfolge === null && nr !== dateiNr) c.fehler(ort, `Nummer ${text(o.nr)} passt nicht zum Dateinamen (k${dateiNr}-…)`);
    const id = dateiId;
    belege(o.belege, ort);
    const thema = text(o.thema);
    if (!KENNUNG.test(thema)) c.fehler(ort, `Thema „${thema}“ ist keine Kennung`);
    else if (themen !== null && !themen.includes(thema)) c.fehler(ort, `Thema „${thema}“ gibt es nicht (#theorie/<thema>)`);
    const kurz = o.kurzfassung === true;
    if (o.kurzfassung !== undefined && typeof o.kurzfassung !== 'boolean') c.fehler(ort, '„kurzfassung“ muss ja oder nein sein');
    if (kurz && o.bruecke !== undefined) c.fehler(ort, 'ein Kapitel der Kurzfassung hat keinen Brückensatz');
    if (!kurz && (o.bruecke === undefined || text(o.bruecke).trim() === '')) c.fehler(ort, 'ein Kapitel außerhalb der Kurzfassung braucht einen Brückensatz (Feld „bruecke“)');
    if (o['mandat-nach-folge'] !== undefined && typeof o['mandat-nach-folge'] !== 'boolean') c.fehler(ort, '„mandat-nach-folge“ muss ja oder nein sein');

    // genau drei Antworten, jede Wertung genau einmal, Wirkung je Balken −2 … +2
    const antwortenRoh = Array.isArray(o.antworten) ? o.antworten : [];
    if (antwortenRoh.length !== 3) c.fehler(ort, `genau drei Antworten erwartet, nicht ${antwortenRoh.length}`);
    const antworten = antwortenRoh.map((/** @type {any} */ a, /** @type {number} */ j) => {
      const ao = `${ort} Antwort ${j + 1}`;
      const x = form(a, ['wertung', 'text', 'balken', 'folge'], ['bild', 'folge-kurz', 'schlagzeile'], ao);
      // P19.6: die Schlagzeile des „Lindenbote“ steht als Unterschrift unter dem Bild „schlagzeile“ der Antwort – ohne dieses Bild gibt es sie nicht
      if (x.schlagzeile !== undefined && x.bild !== 'schlagzeile') c.fehler(ao, '„schlagzeile“ braucht das Bild „schlagzeile“ an derselben Antwort');
      if (!WERTUNGEN.includes(x.wertung)) c.fehler(ao, `Wertung „${text(x.wertung)}“ – erwartet ${WERTUNGEN.join(', ')}`);
      const b = form(x.balken ?? {}, BALKEN, [], `${ao} balken`);
      /** @type {Record<string, number>} */
      const wirkung = {};
      for (const k of BALKEN) {
        const v = b[k];
        if (!Number.isInteger(v) || v < -2 || v > 2) c.fehler(`${ao} balken`, `${k} = ${text(v)} – erwartet eine ganze Zahl von −2 bis +2`);
        wirkung[k] = Number.isInteger(v) ? Math.max(-2, Math.min(2, v)) : 0;
      }
      // P19.5: die Folge darf für die Kurzfassung gekürzt sein (Absätze mit `kurzfassung: nein` oder `folge-kurz`); P19.4: Echo-Platzhalter
      const folge = kuerzbar(x, 'folge', ao, 'html', kurz, i + 1);
      return {
        wertung: text(x.wertung), html: inline(x.text, ao), ...(x.schlagzeile !== undefined ? { schlagzeileHtml: inline(x.schlagzeile, `${ao} schlagzeile`) } : {}), wirkung,
        folgeHtml: folge.lang, ...(folge.kurz !== null ? { folgeKurzHtml: folge.kurz } : {}), bild: bild(x.bild, ao),
      };
    });
    for (const w of WERTUNGEN) {
      const n = antworten.filter((/** @type {any} */ a) => a.wertung === w).length;
      if (antwortenRoh.length === 3 && n !== 1) c.fehler(ort, `Wertung „${w}“ ${n}-mal – jede Wertung genau einmal`);
    }

    if (o.regie !== undefined) {
      const rg = form(o.regie, [], ['notiz', 'leitfragen'], `${ort} regie`);
      regie[id] = { notizHtml: c.html(text(rg.notiz), ort), leitfragen: (Array.isArray(rg.leitfragen) ? rg.leitfragen : []).map(text) };
    }

    const gut = kuerzbar(o, 'gut', ort, 'html', kurz, null);
    const dahinter = kuerzbar(o, 'dahinter', ort, 'inline', kurz, null);
    const kapSzene = szene(o.szene, `${ort} szene`, i + 1);
    const einstiegKurzHtml = kuerzung(o, kapSzene, kurz, ort);

    return {
      id,
      nr,
      titel: klar(o.titel, ort),
      zeit: klar(o.zeit, ort),
      campus: campus(o.campus, `${ort} campus`),
      campusNachher: o['campus-nachher'] === undefined ? null : campus(o['campus-nachher'], `${ort} campus-nachher`),
      zusatz: bild(o.zusatz, ort),
      kurzfassung: kurz,
      brueckeHtml: kurz ? null : brueckenzeile(o, nr, `${ort} bruecke`),
      thema,
      // E-13 (P18.5): Verweise auf Explore-Werkzeuge, leise im Kasten „Das steckt dahinter“; Werkzeug und Beispiel müssen es geben
      werkzeuge: pruefeWerkzeugVerweise(o.werkzeuge, ort, werkzeuge, (/** @type {string} */ wo, /** @type {string} */ f) => c.fehler(wo, f)),
      einstiegHtml: html(o.einstieg, `${ort} einstieg`, i + 1),
      einstiegKurzHtml,
      szene: kapSzene,
      bildSzene: bild(o['bild-szene'], ort),
      bildFrage: bild(o['bild-frage'], ort),
      frageHtml: inline(o.frage, `${ort} frage`),
      antworten,
      gutHtml: gut.lang,
      dahinterHtml: dahinter.lang,
      ...(gut.kurz !== null ? { gutKurzHtml: gut.kurz } : {}),
      ...(dahinter.kurz !== null ? { dahinterKurzHtml: dahinter.kurz } : {}),
      ...(o.vertiefung !== undefined ? { vertiefung: vertiefung(o.vertiefung, `${ort} vertiefung`) } : {}),
      mandatNachFolge: o['mandat-nach-folge'] === true,
      mini: o.mini === undefined ? null : mini(o.mini, `${ort} mini`, o.vergleich !== undefined),
      vergleich: o.vergleich === undefined ? null : vergleich(o.vergleich, `${ort} vergleich`),
    };
  });
  if (kapitel.length === 0) c.fehler(rel, 'keine Kapitel');
  if (kapitel.length > 0 && !kapitel.some((/** @type {any} */ k) => k.kurzfassung)) c.fehler(rel, 'kein Kapitel gehört zur Kurzfassung');
  if (kapitel.length > 0 && !kapitel[0]?.kurzfassung) c.fehler(rel, 'das erste Kapitel gehört zur Kurzfassung');
  const vergleiche = kapitel.filter((/** @type {any} */ k) => k.vergleich !== null).length;
  if (kapitel.length > 0 && vergleiche !== 1) c.fehler(rel, `genau ein Kapitel mit Vergleich erwartet, nicht ${vergleiche}`);
  if (kapitel.length > 0 && !kapitel.some((/** @type {any} */ k) => k.mandatNachFolge)) c.fehler(rel, 'kein Kapitel zeigt das Kärtchen „Wer entscheidet was“ (mandat-nach-folge)');

  /* --------------------------------------------------------------- Echos -- */
  // P19.4: die Quelle ist eine Station; ein Echo wird gesetzt, und zwar nach seiner Quelle; in der Kurzfassung nur, wo die Quelle gespielt wird
  {
    const nrVon = (/** @type {string} */ id) => kapitel.find((/** @type {any} */ k) => k.id === id)?.nr ?? null;
    const kurzNr = new Set(kapitel.filter((/** @type {any} */ k) => k.kurzfassung).map((/** @type {any} */ k) => k.nr));
    for (const e of echos) {
      const eo = `${rel} echos ${e.id}`;
      if (nrVon(e.quelle) === null) c.fehler(eo, `Quelle „${e.quelle}“ ist keine Station`);
      if (!echoVerwendungen.some((v) => v.id === e.id)) c.fehler(eo, 'wird nirgends gesetzt (Echo-Zeile oder Platzhalter)');
    }
    for (const v of echoVerwendungen) {
      const e = echos.find((/** @type {any} */ x) => x.id === v.id);
      const q = e === undefined ? null : nrVon(e.quelle);
      if (q === null) continue;
      if (q >= v.nr) c.fehler(v.ort, `Echo „${v.id}“: die Quelle (Station ${q}) liegt nicht vor dieser Stelle – ein Echo klingt erst nach der Antwort`);
      // die Kurzfassung zeigt nur Echos, deren Quelle sie spielt; die übrigen Zeilen tragen „kurzfassung: nein“
      // (P19.6: mit „text-kurz“ steht dort der Ersatz, nicht das Echo – die Zeile braucht dann keine Marke)
      if (v.zeile !== undefined && v.zeile.kurzfassung && !v.zeile.kurzText && (v.nr === Number.POSITIVE_INFINITY || kurzNr.has(v.nr)) && !kurzNr.has(q)) {
        c.fehler(v.ort, `Echo „${v.id}“: seine Quelle (Station ${q}) fehlt in der Kurzfassung – die Zeile braucht „kurzfassung: nein“ oder „text-kurz“`);
      }
    }
  }

  /* ------------------------------------------------- Entscheidungsbuch -- */
  /**
   * Entscheidungsbuch (P19.4, docs/drehbuch-v2/04-rahmen.md 5): ein Eintrag je Station – `station`, `art` (beschluss · vermerk · uebergabe ·
   * beschluss-uebergabe), `entschieden`, `grundlage`, `ergebnis`. Der Anlass ist der Monat der Station. Jede Zeile muss auf jedem Weg wahr
   * sein: ein Vermerk entscheidet „niemand“, ein Beschluss nie; Wörter wie „vollständig“, „mitgeteilt“, „mit zwei Wegen“ stehen nicht im Buch.
   * @returns {any[]}
   */
  function buchBauen() {
    if (r.buch === undefined) return [];
    const bo = `${rel} buch`;
    if (!Array.isArray(r.buch) || r.buch.length === 0) { c.fehler(bo, 'Liste von Einträgen erwartet'); return []; }
    const ids = kapitel.map((/** @type {any} */ k) => k.id);
    /** @type {string[]} */
    const gesehen = [];
    const liste = r.buch.map((/** @type {any} */ e, /** @type {number} */ i) => {
      const ort = `${bo} ${i + 1}`;
      const o = form(e, ['station', 'art', 'entschieden', 'grundlage', 'ergebnis'], [], ort);
      const station = text(o.station);
      if (!ids.includes(station)) c.fehler(ort, `Station „${station}“ gibt es nicht`);
      else if (gesehen.includes(station)) c.fehler(ort, `Station „${station}“ hat zwei Einträge`);
      gesehen.push(station);
      if (!BUCH_ARTEN.includes(o.art)) c.fehler(ort, `Art „${text(o.art)}“ – erwartet ${BUCH_ARTEN.join(', ')}`);
      for (const f of ['entschieden', 'grundlage', 'ergebnis']) {
        const treffer = BUCH_VERBOTEN.exec(text(o[f]));
        if (treffer !== null) c.fehler(`${ort} ${f}`, `„${treffer[0]}“ steht nicht im Buch – jede Zeile muss auf jedem Weg wahr sein`);
      }
      const niemand = /^niemand\b/iu.test(text(o.entschieden).trim());
      if (o.art === 'vermerk' && !niemand) c.fehler(ort, 'ein Vermerk ist kein Beschluss – „entschieden“ beginnt mit „niemand“');
      if ((o.art === 'beschluss' || o.art === 'beschluss-uebergabe') && niemand) c.fehler(ort, 'ein Beschluss hat eine entscheidende Stelle – „entschieden“ beginnt nicht mit „niemand“');
      return { station, art: text(o.art), entschiedenHtml: inline(o.entschieden, `${ort} entschieden`), grundlageHtml: inline(o.grundlage, `${ort} grundlage`), ergebnisHtml: inline(o.ergebnis, `${ort} ergebnis`) };
    });
    for (const id of ids.filter((x) => !gesehen.includes(x))) c.fehler(bo, `Station „${id}“ hat keinen Eintrag – ein Eintrag je Station`);
    // in der Reihenfolge der Stationen
    const reihe = liste.map((/** @type {any} */ x) => ids.indexOf(x.station)).filter((/** @type {number} */ n) => n >= 0);
    if (reihe.some((n, j) => j > 0 && n < (reihe[j - 1] ?? 0))) c.fehler(bo, 'die Einträge folgen der Reihenfolge der Stationen');
    return liste;
  }
  const buch = buchBauen();

  /* ---------------------------------------------------------------- Akte -- */
  /**
   * Akte (P19.3, optional): `akte:` im Rahmen gliedert die Stationen in aufeinanderfolgende Gruppen. Jede Station steht in genau
   * einem Akt, die Akte folgen der Reihenfolge der Stationen ohne Lücke und ohne Sprung. Je Akt eine Kopfkarte (Text über der ersten
   * Station) und die Pause am Ende („Das können Sie jetzt“: genau drei Sätze, dazu optional eine Zeile einer Figur).
   * Ohne `akte:` verhält sich die Story wie bisher.
   * @returns {any[]}
   */
  function akteBauen() {
    if (r.akte === undefined) return [];
    const ao = `${rel} akte`;
    if (!Array.isArray(r.akte) || r.akte.length === 0) { c.fehler(ao, 'Liste von Akten erwartet'); return []; }
    const ids = kapitel.map((/** @type {any} */ k) => k.id);
    /** @type {string[]} */
    const gesehen = [];
    const liste = r.akte.map((/** @type {any} */ a, /** @type {number} */ i) => {
      const ort = `${rel} akte ${i + 1}`;
      const o = form(a, ['id', 'titel', 'zeitraum', 'stationen', 'kopf', 'pause'], [], ort);
      const stationen = Array.isArray(o.stationen) ? o.stationen.map(text) : [];
      if (!Array.isArray(o.stationen) || stationen.length === 0) c.fehler(ort, 'Liste von Stationen erwartet');
      for (const k of stationen) {
        if (!ids.includes(k)) c.fehler(ort, `Station „${k}“ gibt es nicht`);
        else if (gesehen.includes(k)) c.fehler(ort, `Station „${k}“ steht schon in einem anderen Akt – jede Station genau in einem Akt`);
        gesehen.push(k);
      }
      const p = form(o.pause ?? {}, ['koennen'], ['zeile'], `${ort} pause`);
      const koennen = Array.isArray(p.koennen) ? p.koennen : [];
      if (koennen.length !== 3) c.fehler(`${ort} pause`, `„Das können Sie jetzt“: genau drei Sätze erwartet, nicht ${koennen.length}`);
      return {
        id: kennung(o.id, ort, 'Akt') ?? '',
        titel: klar(o.titel, ort),
        zeitraum: klar(o.zeitraum, ort),
        stationen,
        kopfHtml: inline(o.kopf, `${ort} kopf`),
        pause: {
          zeile: p.zeile === undefined ? null : zeile(p.zeile, `${ort} pause zeile`),
          koennenHtml: koennen.map((/** @type {unknown} */ x, /** @type {number} */ j) => inline(x, `${ort} pause koennen ${j + 1}`)),
        },
      };
    });
    if (new Set(liste.map((/** @type {any} */ a) => a.id)).size !== liste.length) c.fehler(ao, 'Akt-Kennung doppelt');
    for (const id of ids) if (!gesehen.includes(id)) c.fehler(ao, `Station „${id}“ steht in keinem Akt – jede Station genau in einem Akt`);
    // Reihenfolge: die Akte nacheinander ergeben genau die Folge der Stationen (kein Sprung, kein Vertauschen)
    const flach = liste.flatMap((/** @type {any} */ a) => a.stationen);
    const bekannt = flach.filter((/** @type {string} */ k, /** @type {number} */ j) => ids.includes(k) && flach.indexOf(k) === j);
    if (bekannt.length === ids.length && bekannt.join() !== ids.join()) c.fehler(ao, `die Akte müssen den Stationen in ihrer Reihenfolge folgen (${ids.join(', ')})`);
    return liste;
  }
  const akte = akteBauen();

  /**
   * Vertiefung (P19.5, docs/drehbuch-v2/04-rahmen.md 7.4): `form` (nachdenken · zweiter-fall · warum-so), `titel`, `text` (Absätze, bei den
   * ersten beiden Formen Frage bzw. Fall) und – nur dort – `antwort` (Absätze hinter dem Aufklapper „Antwort“). Jeder Absatz höchstens
   * 60 Wörter. Die Vertiefung steht nie in der Kurzfassung (`kurzfassung: nein` ist erlaubt, `ja` ein Fehler).
   */
  function vertiefung(/** @type {any} */ v, /** @type {string} */ ort) {
    const o = form(v, ['form', 'titel', 'text'], ['antwort', 'kurzfassung'], ort);
    if (!VERTIEFUNG_FORMEN.includes(o.form)) c.fehler(ort, `Form „${text(o.form)}“ – erwartet ${VERTIEFUNG_FORMEN.join(', ')}`);
    if (o.kurzfassung !== undefined && o.kurzfassung !== false) c.fehler(ort, 'die Vertiefung steht nie in der Kurzfassung („kurzfassung: nein“ oder weglassen)');
    const absaetze = (/** @type {unknown} */ liste, /** @type {string} */ feld, /** @type {boolean} */ pflicht) => {
      if (liste === undefined) return [];
      if (!Array.isArray(liste) || (pflicht && liste.length === 0)) { c.fehler(`${ort} ${feld}`, 'Liste von Absätzen erwartet'); return []; }
      return liste.map((/** @type {unknown} */ t, /** @type {number} */ i) => {
        if (woerter(t) > VERTIEFUNG_ABSATZ_MAX) c.fehler(`${ort} ${feld} ${i + 1}`, `Absatz mit ${woerter(t)} Wörtern – höchstens ${VERTIEFUNG_ABSATZ_MAX}`);
        return inline(t, `${ort} ${feld} ${i + 1}`);
      });
    };
    const text1 = absaetze(o.text, 'text', true);
    const mitAntwort = o.form === 'nachdenken' || o.form === 'zweiter-fall';
    if (mitAntwort && (o.antwort === undefined || !Array.isArray(o.antwort) || o.antwort.length === 0)) c.fehler(ort, `Form „${text(o.form)}“ braucht eine „antwort“ (Absätze hinter dem Aufklapper)`);
    if (!mitAntwort && o.antwort !== undefined) c.fehler(ort, 'Form „warum-so“ hat keine „antwort“ – die Erklärung steht in „text“');
    const antwort = mitAntwort ? absaetze(o.antwort, 'antwort', true) : [];
    return { form: text(o.form), titel: klar(o.titel, ort), absaetzeHtml: text1, ...(mitAntwort ? { antwortHtml: antwort } : {}) };
  }

  /** Mini-Aufgabe: gemeinsames Gerüst; was je Art gilt, steht in der Mini-Registry (src/geschichte/mini-arten.ts, `uebersetzung`) */
  function mini(/** @type {any} */ m, /** @type {string} */ ort, /** @type {boolean} */ hatVergleich = false) {
    const o = form(m, ['art', 'titel', 'aufgabe', 'bild', 'posten'], ['wahlen', 'stelle', 'schluss', 'zettel', 'kontingent', 'eintrag'], ort);
    const art = text(o.art);
    const def = miniArt(art);
    if (def === null) c.fehler(ort, `Art „${art}“ – erwartet ${MINI_ART_KENNUNGEN.join(', ')}`);
    // P19.5: Platz im Ablauf der Station; ohne Angabe nach der Folge (wie bisher)
    const stelle = o.stelle === undefined ? 'nach-folge' : text(o.stelle);
    if (!MINI_STELLEN.includes(/** @type {any} */ (stelle))) c.fehler(ort, `Stelle „${stelle}“ – erwartet ${MINI_STELLEN.join(', ')}`);
    else if (stelle === 'vor-vergleich' && !hatVergleich) c.fehler(ort, 'Stelle „vor-vergleich“ nur in der Station mit dem Vergleich');
    const feste = def?.uebersetzung.festeWahlen;
    const wahlen = feste !== undefined ? feste.map((w) => ({ ...w })) : (Array.isArray(o.wahlen) ? o.wahlen : []).map((/** @type {any} */ w, /** @type {number} */ i) => {
      const wo = `${ort} wahlen ${i + 1}`;
      const x = form(w, ['id', 'titel'], ['figur', 'falsch', 'heisst', 'bild'], wo);
      if (x.figur !== undefined && x.figur !== 'sie' && !FIGUREN.includes(x.figur)) c.fehler(wo, `Figur „${text(x.figur)}“ unbekannt`);
      return { id: kennung(x.id, wo, 'Wahl') ?? '', titel: klar(x.titel, wo), figur: x.figur === undefined ? null : text(x.figur), falschHtml: x.falsch === undefined ? null : inline(x.falsch, wo), heisstHtml: x.heisst === undefined ? null : inline(x.heisst, wo), bild: bild(x.bild, wo) };
    });
    /** @param {string} o2 @param {string} t */
    const meldung = (o2, t) => c.fehler(o2, t);
    def?.uebersetzung.pruefeWahlen(wahlen, o.wahlen !== undefined, ort, meldung);
    if (new Set(wahlen.map((/** @type {any} */ w) => w.id)).size !== wahlen.length) c.fehler(ort, 'Wahl doppelt');
    const posten = (Array.isArray(o.posten) ? o.posten : []).map((/** @type {any} */ p, /** @type {number} */ i) => {
      const po = `${ort} posten ${i + 1}`;
      const x = form(p, def?.uebersetzung.postenFelder ?? ['text', 'erklaerung'], ['bild', ...(def?.uebersetzung.postenFrei ?? [])], po);
      const loesung = def?.uebersetzung.loesung(x.loesung, wahlen, po, (/** @type {string} */ o2, /** @type {string} */ t) => c.fehler(o2, t)) ?? '';
      const zus = def?.uebersetzung.postenZusatz?.(x, po, meldung, { inline: (t, wo) => inline(t, wo) }) ?? {};
      return { html: inline(x.text, po), loesung, erklaerungHtml: inline(x.erklaerung, po), bild: bild(x.bild, po), ...zus };
    });
    if (posten.length < 3) c.fehler(ort, 'mindestens drei Posten');
    def?.uebersetzung.pruefeGesamt(wahlen, posten, ort, meldung);
    // P19.5: Schlusssatz (nur Arten ohne Zählwörter) und art-eigene Felder der Aufgabe (Zettel, Kontingent)
    const schluss = def?.uebersetzung.schluss;
    if (schluss === 'nie' && o.schluss !== undefined) c.fehler(ort, `Art „${art}“ hat keinen Schlusssatz („schluss“) – sie meldet mit Zählwörtern bzw. gar nicht`);
    if (schluss === 'pflicht' && (o.schluss === undefined || text(o.schluss).trim() === '')) c.fehler(ort, 'Schlusssatz fehlt (Feld „schluss“, aus den Lösungen, nie aus den Wahlen)');
    const erlaubt = def?.uebersetzung.zusatzFelder ?? [];
    for (const k of ['zettel', 'kontingent', 'eintrag']) if (o[k] !== undefined && !erlaubt.includes(k)) c.fehler(ort, `Feld „${k}“ gibt es bei der Art „${art}“ nicht`);
    const zusatz = def?.uebersetzung.zusatz?.(o, posten, ort, meldung, { inline: (t, wo) => inline(t, wo) }) ?? {};
    // O-53: auch der Schritt der Mini-Aufgabe zeigt eine Grafik – „bild“ ist Pflichtfeld (form meldet, wenn es fehlt)
    return {
      art, titel: klar(o.titel, ort), aufgabeHtml: inline(o.aufgabe, ort), bild: bild(o.bild, ort) ?? '', wahlen, posten,
      ...(stelle !== 'nach-folge' && MINI_STELLEN.includes(/** @type {any} */ (stelle)) ? { stelle } : {}),
      ...(schluss === 'pflicht' && o.schluss !== undefined ? { schlussHtml: inline(o.schluss, `${ort} schluss`) } : {}),
      ...zusatz,
    };
  }

  /** Gewichteter Vergleich (nur ein Kapitel) */
  function vergleich(/** @type {any} */ v, /** @type {string} */ ort) {
    const o = form(v, ['einleitung', 'kriterien', 'optionen', 'saetze', 'empfehlung', 'wer'], [], ort);
    const kriterien = (Array.isArray(o.kriterien) ? o.kriterien : []).map((/** @type {any} */ k, /** @type {number} */ i) => {
      const ko = `${ort} kriterien ${i + 1}`;
      const x = form(k, ['id', 'titel', 'gewicht'], ['im-satz'], ko);
      if (!GEWICHTE.includes(x.gewicht)) c.fehler(ko, `Gewicht „${text(x.gewicht)}“ – erwartet 5 (sehr wichtig), 3 (wichtig) oder 1 (weniger wichtig)`);
      // „im-satz“: wie der Gesichtspunkt mitten im Satz heißt („der Schulstart“), für die Kipppunkt-Sätze
      return { id: kennung(x.id, ko, 'Kriterium') ?? '', titel: klar(x.titel, ko), imSatz: x['im-satz'] === undefined ? klar(x.titel, ko) : klar(x['im-satz'], ko), gewicht: GEWICHTE.includes(x.gewicht) ? x.gewicht : 3 };
    });
    if (kriterien.length < 2) c.fehler(ort, 'mindestens zwei Kriterien');
    const kids = kriterien.map((/** @type {any} */ k) => k.id);
    // ein doppeltes Kriterium überschriebe Punkte und Gewichte still und erschiene zweimal (R73)
    if (new Set(kids).size !== kids.length) c.fehler(ort, 'Kriterium doppelt');
    const optionen = (Array.isArray(o.optionen) ? o.optionen : []).map((/** @type {any} */ p, /** @type {number} */ i) => {
      const po = `${ort} optionen ${i + 1}`;
      const x = form(p, ['id', 'titel', 'punkte', 'worte'], ['begruendung'], po);
      if (!/^[A-Z]$/u.test(text(x.id))) c.fehler(po, `Kennung „${text(x.id)}“ – erwartet ein Großbuchstabe`);
      const pk = form(x.punkte ?? {}, kids, [], `${po} punkte`);
      const wo = form(x.worte ?? {}, kids, [], `${po} worte`);
      /** @type {Record<string, number>} */
      const punkte = {};
      /** @type {Record<string, string>} */
      const worte = {};
      for (const k of kids) {
        const n = pk[k];
        if (!Number.isInteger(n) || n < 1 || n > 5) c.fehler(`${po} punkte`, `${k} = ${text(n)} – erwartet 1–5`);
        punkte[k] = Number.isInteger(n) ? n : 0;
        worte[k] = klar(wo[k], `${po} worte`);
      }
      return { id: text(x.id), titel: klar(x.titel, po), punkte, worte };
    });
    if (optionen.length < 2) c.fehler(ort, 'mindestens zwei zulässige Optionen');
    if (new Set(optionen.map((/** @type {any} */ x) => x.id)).size !== optionen.length) c.fehler(ort, 'Option doppelt');
    const sa = form(o.saetze ?? {}, [...optionen.map((/** @type {any} */ x) => x.id), 'gleichauf'], [], `${ort} saetze`);
    return {
      einleitungHtml: html(o.einleitung, ort),
      kriterien,
      optionen,
      saetze: Object.fromEntries(Object.keys(sa).map((k) => [k, inline(sa[k], `${ort} saetze.${k}`)])),
      empfehlungHtml: html(o.empfehlung, `${ort} empfehlung`),
      werHtml: html(o.wer, `${ort} wer`),
    };
  }

  /**
   * Wegkarten im Auftakt (P19.6, `auftakt.wegwahl`): Überschrift und je Karte `titel`, `text`, `knopf`, `bild`. Die Zeile mit Zahlwort und
   * Minuten rechnet die Seite aus der Messung. Die Bildbeschreibung nennt Zahlen (alle Stationen, gespielte Stationen): sie muss zu den Stationen
   * der Geschichte passen – die Seite zählt sie selbst, `bild` ist deshalb nur die Probe, dass die Datei nicht von der Zahl abweicht.
   */
  const wegwahl = (() => {
    if (au.wegwahl === undefined) return undefined;
    const wo = `${rel} auftakt.wegwahl`;
    const o = form(au.wegwahl, ['ueberschrift', 'lang', 'kurz'], [], wo);
    const karte = (/** @type {'lang' | 'kurz'} */ art) => {
      const ko = `${wo}.${art}`;
      const k = form(o[art] ?? {}, ['titel', 'text', 'knopf', 'bild'], [], ko);
      const n = kapitel.length;
      const gespielt = kapitel.filter((/** @type {any} */ x) => x.kurzfassung).length;
      const erwartet = art === 'lang' ? W.geschichte.wegBildLang(n) : W.geschichte.wegBildKurz(n, gespielt);
      if (k.bild !== undefined && text(k.bild) !== erwartet) c.fehler(`${ko} bild`, `erwartet „${erwartet}“ (die Seite zählt ${n} Stationen, davon ${gespielt} in der Kurzfassung)`);
      return { titel: klar(k.titel, ko), text: klar(k.text, ko), knopf: klar(k.knopf, ko), bild: klar(k.bild, ko) };
    };
    return { ueberschrift: klar(o.ueberschrift, wo), lang: karte('lang'), kurz: karte('kurz') };
  })();
  const geschichte = {
    titel: klar(r.titel, rel),
    auftakt: {
      campus: campus(au.campus, `${rel} auftakt.campus`), textHtml: html(au.text, `${rel} auftakt`), vorstellung: klar(au.vorstellung, `${rel} auftakt`), los: klar(au.los, `${rel} auftakt`), kurz: klar(au.kurz, `${rel} auftakt`),
      ...(au['balken-titel'] !== undefined ? { balkenTitel: klar(au['balken-titel'], `${rel} auftakt balken-titel`) } : {}),
      ...(wegwahl !== undefined ? { wegwahl } : {}),
    },
    sieHtml: inline(sie.steckbrief, `${rel} sie`),
    figuren,
    ...(nebenfiguren.length > 0 ? { nebenfiguren } : {}),
    balken,
    bilanz,
    mandat,
    kapitel,
    akte,
    ...(echos.length > 0 ? { echos } : {}),
    ...(buch.length > 0 ? { buch } : {}),
    ende,
  };
  return { geschichte, regie };
}
