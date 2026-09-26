/*
 * Anfangszustand, Leinwand-Ausschnitt und Formprüfung.
 *
 * `oeffentlich()` baut den Leinwand-Zustand durch AUFZÄHLEN der erlaubten Felder, nicht durch
 * Weglassen der verbotenen: ein neues Feld im Zustand erreicht die Leinwand erst, wenn es hier
 * ausdrücklich eingetragen wird (Schutz durch Bauart, docs/ARCHITEKTUR.md „Regie und Leinwand“).
 */

import type {
  Bereich, OeffentlicherZustand, ProtokollEintrag, SpurEintrag, Status, StatusSchluessel, Welt, Zustand,
} from './typen.ts';
import { STATUS_SCHLUESSEL, istStufe } from './status.ts';

export const ZUSTAND_VERSION = 1 as const;

export function anfangszustand(): Zustand {
  return {
    version: ZUSTAND_VERSION,
    bereich: 'start',
    rolle: null,
    interessen: [],
    welt: 'A',
    station: null,
    schritt: 0,
    vergleich: 0,
    entscheidungen: {},
    antworten: {},
    spur: [],
    verlauf: [],
    status: { A: null, B: null },
    info: [],
    ebene: 0,
    ansicht: {},
    freigeschaltet: { weltB: false, explore: false },
    theorie: { kapitel: null },
    regie: { protokoll: [] },
  };
}

/* Auch verschachtelte Teile werden feldweise aufgezählt (nie `{ ...x }`): ein künftiges Feld in
   Status, Hinweisen oder Spur erreicht die Leinwand erst, wenn es hier eingetragen wird. */

function kopiereStatus(s: Status | null): Status | null {
  if (s === null) return null;
  const hinweise: Status['hinweise'] = {};
  for (const k of STATUS_SCHLUESSEL) {
    const v = s.hinweise[k];
    if (v !== undefined) hinweise[k] = v;
  }
  return {
    entscheidungsfaehigkeit: s.entscheidungsfaehigkeit,
    kostenunsicherheit: s.kostenunsicherheit,
    offeneRisiken: s.offeneRisiken,
    ungeklaerteEntscheidungen: s.ungeklaerteEntscheidungen,
    terminrisiko: s.terminrisiko,
    hinweise,
  };
}

function kopiereSpurEintrag(e: SpurEintrag): SpurEintrag {
  return {
    nr: e.nr,
    entscheidung: e.entscheidung,
    station: e.station,
    welt: e.welt,
    rolle: e.rolle,
    option: e.option,
    wechsel: e.wechsel,
    zeit: e.zeit,
  };
}

/** Der Teil des Zustands, den die Leinwand bekommt – ohne Regie-Eigenes. */
export function oeffentlich(z: Zustand): OeffentlicherZustand {
  return {
    version: z.version,
    bereich: z.bereich,
    rolle: z.rolle,
    interessen: [...z.interessen],
    welt: z.welt,
    station: z.station,
    schritt: z.schritt,
    vergleich: z.vergleich,
    entscheidungen: { ...z.entscheidungen },
    antworten: { ...z.antworten },
    spur: z.spur.map(kopiereSpurEintrag),
    verlauf: [...z.verlauf],
    status: { A: kopiereStatus(z.status.A), B: kopiereStatus(z.status.B) },
    info: [...z.info],
    ebene: z.ebene,
    ansicht: { ...z.ansicht },
    freigeschaltet: { weltB: z.freigeschaltet.weltB, explore: z.freigeschaltet.explore },
    theorie: { kapitel: z.theorie.kapitel },
  };
}

/* ------------------------------------------------------------ Formprüfung -- */

type Obj = Record<string, unknown>;

function istObj(x: unknown): x is Obj {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}
function istText(x: unknown): x is string {
  return typeof x === 'string';
}
function istZahl(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}
function istTextListe(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(istText);
}
function istTextKarte(x: unknown): x is Record<string, string> {
  return istObj(x) && Object.values(x).every(istText);
}
function istWelt(x: unknown): x is Welt {
  return x === 'A' || x === 'B';
}
function istBereich(x: unknown): x is Bereich {
  return x === 'start' || x === 'story' || x === 'theorie' || x === 'explore';
}

function istStatus(x: unknown): x is Status {
  if (x === null) return true;
  if (!istObj(x)) return false;
  if (!istZahl(x['entscheidungsfaehigkeit']) || !istZahl(x['offeneRisiken']) || !istZahl(x['ungeklaerteEntscheidungen'])) return false;
  if (!istStufe(x['kostenunsicherheit']) || !istStufe(x['terminrisiko'])) return false;
  const h = x['hinweise'];
  if (!istObj(h)) return false;
  return Object.entries(h).every(([k, v]) => (STATUS_SCHLUESSEL as readonly string[]).includes(k as StatusSchluessel) && istText(v));
}

function istSpurEintrag(x: unknown): x is SpurEintrag {
  return istObj(x) && istZahl(x['nr']) && istText(x['entscheidung']) && istText(x['station'])
    && (x['welt'] === null || istWelt(x['welt'])) && istText(x['rolle']) && istText(x['option'])
    && istZahl(x['wechsel']) && (x['zeit'] === null || istZahl(x['zeit']));
}

function istProtokollEintrag(x: unknown): x is ProtokollEintrag {
  return istObj(x) && istZahl(x['nr']) && (x['station'] === null || istText(x['station']))
    && istZahl(x['schritt']) && istText(x['text']) && istZahl(x['zeit']);
}

/** Prüft die Form des Leinwand-Zustands (z. B. aus dem Kanal). Liefert ihn oder null. */
export function pruefeOeffentlich(roh: unknown): OeffentlicherZustand | null {
  if (!istObj(roh)) return null;
  const z = roh;
  if (z['version'] !== ZUSTAND_VERSION) return null;
  if (!istBereich(z['bereich'])) return null;
  if (!(z['rolle'] === null || istText(z['rolle']))) return null;
  if (!istTextListe(z['interessen'])) return null;
  if (!istWelt(z['welt'])) return null;
  if (!(z['station'] === null || istText(z['station']))) return null;
  if (!istZahl(z['schritt']) || !istZahl(z['vergleich']) || !istZahl(z['ebene'])) return null;
  if (!istTextKarte(z['entscheidungen']) || !istTextKarte(z['antworten']) || !istTextKarte(z['ansicht'])) return null;
  if (!Array.isArray(z['spur']) || !z['spur'].every(istSpurEintrag)) return null;
  if (!istTextListe(z['verlauf']) || !istTextListe(z['info'])) return null;
  const st = z['status'];
  if (!istObj(st) || !istStatus(st['A']) || !istStatus(st['B'])) return null;
  const fr = z['freigeschaltet'];
  if (!istObj(fr) || typeof fr['weltB'] !== 'boolean' || typeof fr['explore'] !== 'boolean') return null;
  const th = z['theorie'];
  if (!istObj(th) || !(th['kapitel'] === null || istZahl(th['kapitel']))) return null;
  // Nur die bekannten Felder übernehmen – auf jeder Ebene: fremde Zusätze fallen weg.
  return oeffentlich({ ...(z as unknown as OeffentlicherZustand), regie: { protokoll: [] } });
}

/** Prüft einen vollständigen Zustand (z. B. aus dem Speicher). Liefert ihn oder null. */
export function pruefeZustand(roh: unknown): Zustand | null {
  const oe = pruefeOeffentlich(roh);
  if (oe === null || !istObj(roh)) return null;
  const regie = roh['regie'];
  if (!istObj(regie) || !Array.isArray(regie['protokoll']) || !regie['protokoll'].every(istProtokollEintrag)) return null;
  const protokoll = (regie['protokoll'] as ProtokollEintrag[]).map((e) => ({ nr: e.nr, station: e.station, schritt: e.schritt, text: e.text, zeit: e.zeit }));
  return { ...oe, regie: { protokoll } };
}
