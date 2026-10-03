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
import { pruefeWerkzeugVerweise } from './explore.mjs';

const FIGUREN = ['grundstein', 'faden', 'schwung', 'klingel', 'lot'];
const BALKEN = ['geld', 'zeit', 'vertrauen'];
const STUFEN = ['hoch', 'mittel', 'niedrig'];
const BILANZ = ['nicht-getragen', 'letzte-meter', 'ruhig', 'umwege', 'offen'];
const WERTUNGEN = ['gut', 'vertretbar', 'falle'];
const JAHRESZEITEN = ['fruehling', 'sommer', 'herbst', 'winter'];
const LICHTER = ['morgen', 'tag', 'abend'];
const GEWICHTE = [5, 3, 1];
const KENNUNG = /^[a-z0-9][a-z0-9-]*$/u;
const KAPITEL_DATEI = /\/k(\d+)-[a-z0-9-]+\.yaml$/u;
/** interner Beleg: Absatz-ID aus V1.2 (k4.2-p3, k3.2-t1) oder Stelle aus V2.4 (v24:hb-3.1, v24:tlb-2, v24:va-4.1, v24:hb-projektblatt) */
const BELEG_V12 = /^k\d+(?:\.\d+)*-[pltb]\d+$/u;
const BELEG_V24 = /^v24:(?:hb|tlb|va)(?:-[a-z0-9]+(?:\.[0-9]+)*)?$/u;

/** @param {unknown} x */
const text = (x) => (x === undefined || x === null ? '' : String(x));

/**
 * @param {any} c Kompilierer (werkzeuge/inhalte.mjs)
 * @param {{ rel: string, text: string }[]} dateien alle Dateien aus inhalte/geschichte/
 * @param {string[] | null} [themen] Kennungen der Themen (null = nicht prüfen)
 * @param {Record<string, string[]> | null} [werkzeuge] Katalog der Explore-Werkzeuge und ihrer Beispiele (werkzeugKatalog; null = nur die Form prüfen)
 */
export function baueGeschichte(c, dateien, themen = null, werkzeuge = null) {
  for (const d of dateien) {
    if (!d.rel.endsWith('/rahmen.yaml') && !KAPITEL_DATEI.test(d.rel)) {
      c.fehler(d.rel, 'unbekannte Datei im Ordner der Story – erwartet rahmen.yaml oder k<n>-<name>.yaml');
    }
  }
  const rahmenDatei = dateien.find((d) => d.rel.endsWith('/rahmen.yaml'));
  if (rahmenDatei === undefined) return { geschichte: null, regie: {} };

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

  /* -------------------------------------------------------------- Helfer -- */
  /** Unbekannte Felder melden; Pflichtfelder prüfen. */
  const form = (/** @type {any} */ o, /** @type {string[]} */ pflicht, /** @type {string[]} */ frei, /** @type {string} */ ort) => {
    if (typeof o !== 'object' || o === null || Array.isArray(o)) { c.fehler(ort, 'erwartet „schlüssel: wert“'); return {}; }
    for (const k of Object.keys(o)) if (!pflicht.includes(k) && !frei.includes(k)) c.fehler(ort, `unbekanntes Feld „${k}“ (erlaubt: ${[...pflicht, ...frei].join(', ')})`);
    for (const k of pflicht) if (o[k] === undefined || o[k] === null || o[k] === '') c.fehler(ort, `Feld „${k}“ fehlt`);
    return o;
  };
  /** Sichtbarer Text: Sichtbar-Probe, dann Markdown. */
  const sicht = (/** @type {unknown} */ t, /** @type {string} */ ort) => {
    const s = text(t);
    for (const f of sichtbarVerboten(s)) c.fehler(ort, f);
    return s;
  };
  const html = (/** @type {unknown} */ t, /** @type {string} */ ort) => c.html(sicht(t, ort), ort);
  const inline = (/** @type {unknown} */ t, /** @type {string} */ ort) => {
    const s = sicht(t, ort);
    if (/\n\s*\n/u.test(s.trim())) c.fehler(ort, 'ein Absatz erwartet (keine Leerzeile)');
    return c.inline(s, ort);
  };
  const klar = (/** @type {unknown} */ t, /** @type {string} */ ort) => sicht(t, ort).trim();
  const campus = (/** @type {any} */ x, /** @type {string} */ ort) => {
    const o = form(x, ['stufe', 'jahreszeit', 'licht'], ['wetter'], ort);
    const stufe = Number(o.stufe);
    if (!Number.isInteger(stufe) || stufe < 0 || stufe > 8) c.fehler(ort, `Campus-Stufe „${text(o.stufe)}“ – erwartet 0–8`);
    if (!JAHRESZEITEN.includes(o.jahreszeit)) c.fehler(ort, `Jahreszeit „${text(o.jahreszeit)}“ – erwartet ${JAHRESZEITEN.join(', ')}`);
    if (!LICHTER.includes(o.licht)) c.fehler(ort, `Licht „${text(o.licht)}“ – erwartet ${LICHTER.join(', ')}`);
    // R72: besonderes Wetter (heute nur „sturm“: grauer Himmel, Böen, Planen) – ohne Angabe gilt die Jahreszeit
    if (o.wetter !== undefined && o.wetter !== 'sturm') c.fehler(ort, `Wetter „${text(o.wetter)}“ – erwartet sturm`);
    return { stufe: Number.isInteger(stufe) ? stufe : 0, jahreszeit: text(o.jahreszeit), licht: text(o.licht), ...(o.wetter === 'sturm' ? { wetter: 'sturm' } : {}) };
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
  const zeile = (/** @type {any} */ z, /** @type {string} */ ort, mitKurz = false) => {
    const o = form(z, ['text'], mitKurz ? ['figur', 'zusatz', 'kurzfassung'] : ['figur', 'zusatz'], ort);
    if (o.figur !== undefined && !FIGUREN.includes(o.figur)) c.fehler(ort, `Figur „${text(o.figur)}“ unbekannt (${FIGUREN.join(', ')})`);
    if (o.kurzfassung !== undefined && typeof o.kurzfassung !== 'boolean') c.fehler(ort, '„kurzfassung“ muss ja oder nein sein');
    return { figur: o.figur === undefined ? null : text(o.figur), zusatz: o.zusatz === undefined ? null : klar(o.zusatz, ort), html: inline(o.text, ort), kurzfassung: o.kurzfassung !== false };
  };
  const szene = (/** @type {unknown} */ s, /** @type {string} */ ort) => {
    if (!Array.isArray(s) || s.length === 0) { c.fehler(ort, 'Szene: Liste von Zeilen { figur, text } erwartet'); return []; }
    return s.map((z, i) => zeile(z, `${ort} Zeile ${i + 1}`, true));
  };
  /**
   * Kürzungen der Kurzfassung (P17.5): `einstieg-kurz` nur dort, wo die Kurzfassung den Schritt zeigt, und kürzer als
   * `einstieg`; Zeilen mit `kurzfassung: false` nur dort, und dann bleiben mindestens zwei Zeilen stehen.
   */
  const kuerzung = (/** @type {any} */ o, /** @type {any[]} */ zeilen, /** @type {boolean} */ inKurz, /** @type {string} */ ort) => {
    const weg = zeilen.filter((z) => !z.kurzfassung).length;
    const roh = o['einstieg-kurz'];
    if (!inKurz) {
      if (roh !== undefined) c.fehler(ort, '„einstieg-kurz“ nur in Kapiteln der Kurzfassung');
      if (weg > 0) c.fehler(`${ort} szene`, '„kurzfassung: nein“ an einer Zeile nur in Kapiteln der Kurzfassung');
      return null;
    }
    if (weg > 0 && zeilen.length - weg < 2) c.fehler(`${ort} szene`, `in der Kurzfassung blieben ${zeilen.length - weg} Zeilen – mindestens zwei`);
    if (roh === undefined || roh === null) return null;
    const woerter = (/** @type {unknown} */ t) => text(t).split(/\s+/u).filter((x) => /\p{L}/u.test(x)).length;
    if (woerter(roh) >= woerter(o.einstieg)) c.fehler(ort, `„einstieg-kurz“ hat ${woerter(roh)} Wörter, „einstieg“ ${woerter(o.einstieg)} – die Kurzfassung muss kürzer sein`);
    return html(roh, `${ort} einstieg-kurz`);
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
  const r = form(lies(rahmenDatei), ['titel', 'auftakt', 'sie', 'figuren', 'balken', 'bilanz', 'mandat', 'ende'], [], rel);
  const au = form(r.auftakt ?? {}, ['campus', 'text', 'vorstellung', 'los', 'kurz'], [], `${rel} auftakt`);
  const sie = form(r.sie ?? {}, ['steckbrief'], [], `${rel} sie`);
  const figuren = (Array.isArray(r.figuren) ? r.figuren : []).map((/** @type {any} */ f, /** @type {number} */ i) => {
    const ort = `${rel} figuren ${i + 1}`;
    const o = form(f, ['id', 'name', 'rolle', 'akzent', 'steckbrief'], [], ort);
    if (!AKZENTE.includes(o.akzent)) c.fehler(ort, `Akzent „${text(o.akzent)}“ unbekannt (${AKZENTE.join(', ')})`);
    return { id: text(o.id), name: klar(o.name, ort), rolle: klar(o.rolle, ort), akzent: text(o.akzent), steckbriefHtml: inline(o.steckbrief, ort) };
  });
  if (figuren.map((/** @type {any} */ f) => f.id).join() !== FIGUREN.join()) c.fehler(`${rel} figuren`, `erwartet die fünf Figuren in dieser Reihenfolge: ${FIGUREN.join(', ')}`);
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
      const o = form(z, ['wer', 'text'], [], `${rel} mandat ${i + 1}`);
      return { wer: klar(o.wer, `${rel} mandat ${i + 1}`), html: inline(o.text, `${rel} mandat ${i + 1}`) };
    }),
  };
  if (mandat.zeilen.length === 0) c.fehler(`${rel} mandat`, 'keine Zeilen');
  const en = form(r.ende ?? {}, ['zeit', 'campus', 'einstieg', 'szene', 'zeit-niedrig', 'vertrauen-niedrig', 'nach-falle', 'offen'], ['einstieg-kurz'], `${rel} ende`);
  const endeSzene = szene(en.szene, `${rel} ende.szene`);
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
  const roh = dateien.filter((d) => KAPITEL_DATEI.test(d.rel)).map((d) => ({ d, y: lies(d), dateiNr: Number(KAPITEL_DATEI.exec(d.rel)?.[1]) }))
    .sort((a, b) => a.dateiNr - b.dateiNr);
  /** @type {Record<string, { notizHtml: string, leitfragen: string[] }>} */
  const regie = {};
  const kapitel = roh.map(({ d, y, dateiNr }, i) => {
    const ort = d.rel;
    const o = form(y, ['nr', 'titel', 'zeit', 'campus', 'thema', 'belege', 'einstieg', 'szene', 'frage', 'antworten', 'gut', 'dahinter'],
      ['kurzfassung', 'bruecke', 'einstieg-kurz', 'campus-nachher', 'zusatz', 'bild-szene', 'bild-frage', 'mandat-nach-folge', 'mini', 'vergleich', 'regie', 'werkzeuge'], ort);
    const nr = Number(o.nr);
    if (nr !== i + 1) c.fehler(ort, `Nummer ${text(o.nr)} – erwartet ${i + 1} (lückenlos ab 1)`);
    if (nr !== dateiNr) c.fehler(ort, `Nummer ${text(o.nr)} passt nicht zum Dateinamen (k${dateiNr}-…)`);
    const id = `k${nr}`;
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
      const x = form(a, ['wertung', 'text', 'balken', 'folge'], ['bild'], ao);
      if (!WERTUNGEN.includes(x.wertung)) c.fehler(ao, `Wertung „${text(x.wertung)}“ – erwartet ${WERTUNGEN.join(', ')}`);
      const b = form(x.balken ?? {}, BALKEN, [], `${ao} balken`);
      /** @type {Record<string, number>} */
      const wirkung = {};
      for (const k of BALKEN) {
        const v = b[k];
        if (!Number.isInteger(v) || v < -2 || v > 2) c.fehler(`${ao} balken`, `${k} = ${text(v)} – erwartet eine ganze Zahl von −2 bis +2`);
        wirkung[k] = Number.isInteger(v) ? Math.max(-2, Math.min(2, v)) : 0;
      }
      return { wertung: text(x.wertung), html: inline(x.text, ao), wirkung, folgeHtml: html(x.folge, `${ao} folge`), bild: bild(x.bild, ao) };
    });
    for (const w of WERTUNGEN) {
      const n = antworten.filter((/** @type {any} */ a) => a.wertung === w).length;
      if (antwortenRoh.length === 3 && n !== 1) c.fehler(ort, `Wertung „${w}“ ${n}-mal – jede Wertung genau einmal`);
    }

    if (o.regie !== undefined) {
      const rg = form(o.regie, [], ['notiz', 'leitfragen'], `${ort} regie`);
      regie[id] = { notizHtml: c.html(text(rg.notiz), ort), leitfragen: (Array.isArray(rg.leitfragen) ? rg.leitfragen : []).map(text) };
    }

    const kapSzene = szene(o.szene, `${ort} szene`);
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
      brueckeHtml: kurz ? null : html(o.bruecke, `${ort} bruecke`),
      thema,
      // E-13 (P18.5): Verweise auf Explore-Werkzeuge, leise im Kasten „Das steckt dahinter“; Werkzeug und Beispiel müssen es geben
      werkzeuge: pruefeWerkzeugVerweise(o.werkzeuge, ort, werkzeuge, (/** @type {string} */ wo, /** @type {string} */ f) => c.fehler(wo, f)),
      einstiegHtml: html(o.einstieg, `${ort} einstieg`),
      einstiegKurzHtml,
      szene: kapSzene,
      bildSzene: bild(o['bild-szene'], ort),
      bildFrage: bild(o['bild-frage'], ort),
      frageHtml: inline(o.frage, `${ort} frage`),
      antworten,
      gutHtml: html(o.gut, `${ort} gut`),
      dahinterHtml: inline(o.dahinter, `${ort} dahinter`),
      mandatNachFolge: o['mandat-nach-folge'] === true,
      mini: o.mini === undefined ? null : mini(o.mini, `${ort} mini`),
      vergleich: o.vergleich === undefined ? null : vergleich(o.vergleich, `${ort} vergleich`),
    };
  });
  if (kapitel.length === 0) c.fehler(rel, 'keine Kapitel');
  if (kapitel.length > 0 && !kapitel.some((/** @type {any} */ k) => k.kurzfassung)) c.fehler(rel, 'kein Kapitel gehört zur Kurzfassung');
  if (kapitel.length > 0 && !kapitel[0]?.kurzfassung) c.fehler(rel, 'das erste Kapitel gehört zur Kurzfassung');
  const vergleiche = kapitel.filter((/** @type {any} */ k) => k.vergleich !== null).length;
  if (kapitel.length > 0 && vergleiche !== 1) c.fehler(rel, `genau ein Kapitel mit Vergleich erwartet, nicht ${vergleiche}`);
  if (kapitel.length > 0 && !kapitel.some((/** @type {any} */ k) => k.mandatNachFolge)) c.fehler(rel, 'kein Kapitel zeigt das Kärtchen „Wer entscheidet was“ (mandat-nach-folge)');

  /** Mini-Aufgabe */
  function mini(/** @type {any} */ m, /** @type {string} */ ort) {
    const o = form(m, ['art', 'titel', 'aufgabe', 'bild', 'posten'], ['wahlen'], ort);
    const art = text(o.art);
    if (art !== 'zuordnen' && art !== 'reihenfolge') c.fehler(ort, `Art „${art}“ – erwartet zuordnen oder reihenfolge`);
    const wahlen = (Array.isArray(o.wahlen) ? o.wahlen : []).map((/** @type {any} */ w, /** @type {number} */ i) => {
      const wo = `${ort} wahlen ${i + 1}`;
      const x = form(w, ['id', 'titel'], ['figur', 'falsch', 'heisst', 'bild'], wo);
      if (x.figur !== undefined && x.figur !== 'sie' && !FIGUREN.includes(x.figur)) c.fehler(wo, `Figur „${text(x.figur)}“ unbekannt`);
      return { id: kennung(x.id, wo, 'Wahl') ?? '', titel: klar(x.titel, wo), figur: x.figur === undefined ? null : text(x.figur), falschHtml: x.falsch === undefined ? null : inline(x.falsch, wo), heisstHtml: x.heisst === undefined ? null : inline(x.heisst, wo), bild: bild(x.bild, wo) };
    });
    if (art === 'zuordnen' && wahlen.length < 2) c.fehler(ort, 'zuordnen braucht mindestens zwei Wahlen');
    if (art === 'reihenfolge' && o.wahlen !== undefined) c.fehler(ort, 'eine Reihenfolge hat keine Wahlen');
    if (new Set(wahlen.map((/** @type {any} */ w) => w.id)).size !== wahlen.length) c.fehler(ort, 'Wahl doppelt');
    const posten = (Array.isArray(o.posten) ? o.posten : []).map((/** @type {any} */ p, /** @type {number} */ i) => {
      const po = `${ort} posten ${i + 1}`;
      const x = form(p, art === 'zuordnen' ? ['text', 'loesung', 'erklaerung'] : ['text', 'erklaerung'], ['bild'], po);
      if (art === 'zuordnen' && !wahlen.some((/** @type {any} */ w) => w.id === text(x.loesung))) c.fehler(po, `Lösung „${text(x.loesung)}“ ist keine der Wahlen`);
      return { html: inline(x.text, po), loesung: art === 'zuordnen' ? text(x.loesung) : '', erklaerungHtml: inline(x.erklaerung, po), bild: bild(x.bild, po) };
    });
    if (posten.length < 3) c.fehler(ort, 'mindestens drei Posten');
    if (art === 'zuordnen') for (const w of wahlen) if (w.falschHtml !== null && posten.some((/** @type {any} */ p) => p.loesung === w.id)) c.fehler(ort, `Wahl „${w.id}“ hat eine feste Rückmeldung „falsch“, ist aber bei einem Posten richtig`);
    // O-53: auch der Schritt der Mini-Aufgabe zeigt eine Grafik – „bild“ ist Pflichtfeld (form meldet, wenn es fehlt)
    return { art, titel: klar(o.titel, ort), aufgabeHtml: inline(o.aufgabe, ort), bild: bild(o.bild, ort) ?? '', wahlen, posten };
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

  const geschichte = {
    titel: klar(r.titel, rel),
    auftakt: { campus: campus(au.campus, `${rel} auftakt.campus`), textHtml: html(au.text, `${rel} auftakt`), vorstellung: klar(au.vorstellung, `${rel} auftakt`), los: klar(au.los, `${rel} auftakt`), kurz: klar(au.kurz, `${rel} auftakt`) },
    sieHtml: inline(sie.steckbrief, `${rel} sie`),
    figuren,
    balken,
    bilanz,
    mandat,
    kapitel,
    ende,
  };
  return { geschichte, regie };
}
