/*
 * Der Reducer: `wende(zustand, aktion, modell) → zustand`.
 *
 * Rein: keine Uhr, kein Zufall, kein DOM, keine Veränderung der Eingaben. Zeitstempel kommen mit der
 * Aktion. Eine unzulässige Aktion (unbekannte Station, Welt B gesperrt, Entscheidung fehlt …) gibt
 * denselben Zustand unverändert zurück – dieselbe Referenz, damit die Oberfläche „nichts passiert“
 * ohne Vergleich erkennt.
 *
 * Das Modell ist die generierte `inhalte.json` (strukturell ein `StoryModell`); Tests geben kleine
 * Modelle. `binde(modell)` liefert die zweistellige Form `(z, aktion) => z` für die Oberfläche.
 */

import type { Aktion, Freischaltung, ModellStation, SpurEintrag, StoryModell, Zustand } from './typen.ts';
import { anfangszustand } from './zustand.ts';
import { berechneStatus } from './status.ts';
import { naechsteStation, schritteFuer } from './graph.ts';

const MAX_TEXT = 2000;
const MAX_ANSICHT = 64;

function mitStatus(z: Zustand, modell: StoryModell): Zustand {
  return { ...z, status: berechneStatus(z, modell) };
}

function begrenzeSchritt(st: ModellStation, rolle: string | null, schritt: number): number {
  const n = schritteFuer(st, rolle).length;
  if (n === 0) return 0;
  return Math.min(n - 1, Math.max(0, Math.trunc(schritt)));
}

function darfBetreten(z: Zustand, st: ModellStation): boolean {
  if (st.welt !== 'B') return true;
  return z.freigeschaltet.weltB || st.schaltetFrei.includes('weltB');
}

function schalteFreiAus(z: Zustand, liste: readonly Freischaltung[]): Zustand['freigeschaltet'] {
  if (liste.length === 0) return z.freigeschaltet;
  const f = { ...z.freigeschaltet };
  for (const was of liste) f[was] = true;
  return f;
}

/** Betritt eine Station (vorwärts: Verlauf wächst). */
function betrete(z: Zustand, id: string, modell: StoryModell, schritt: number | 'letzter', verlauf: string[]): Zustand {
  const st = modell.stationen[id];
  if (st === undefined || !darfBetreten(z, st)) return z;
  const n = schritteFuer(st, z.rolle).length;
  const neu: Zustand = {
    ...z,
    bereich: 'story',
    station: id,
    schritt: schritt === 'letzter' ? Math.max(0, n - 1) : begrenzeSchritt(st, z.rolle, schritt),
    welt: st.welt ?? (st.vergleich !== null ? 'A' : z.welt),
    vergleich: st.welt === 'B' ? 1 : 0,
    ebene: 0,
    verlauf,
    freigeschaltet: schalteFreiAus(z, st.schaltetFrei),
  };
  return mitStatus(neu, modell);
}

function aktuelleStation(z: Zustand, modell: StoryModell): ModellStation | null {
  if (z.station === null) return null;
  return modell.stationen[z.station] ?? null;
}

function weiter(z: Zustand, modell: StoryModell): Zustand {
  const st = aktuelleStation(z, modell);
  if (st === null) return starteStory(z, modell);
  const schritte = schritteFuer(st, z.rolle);
  const jetzt = schritte[z.schritt];
  if (jetzt !== undefined) {
    if (jetzt.art === 'rollenwahl' && z.rolle === null) return z;
    if (jetzt.art === 'entscheidung') {
      const ent = z.rolle !== null ? st.szenen[z.rolle]?.entscheidung ?? null : null;
      if (ent !== null && z.entscheidungen[ent.id] === undefined) return z;
    }
  }
  if (z.schritt < schritte.length - 1) {
    return { ...z, bereich: 'story', schritt: z.schritt + 1, ebene: 0 };
  }
  const ziel = naechsteStation(st, z, modell);
  if (ziel === null) return z;
  return betrete(z, ziel, modell, 0, [...z.verlauf, ziel]);
}

function zurueck(z: Zustand, modell: StoryModell): Zustand {
  const st = aktuelleStation(z, modell);
  if (st === null) return z;
  if (z.schritt > 0) return { ...z, schritt: z.schritt - 1, ebene: 0 };
  if (z.verlauf.length < 2) return z;
  const verlauf = z.verlauf.slice(0, -1);
  const vorher = verlauf[verlauf.length - 1] as string;
  return betrete(z, vorher, modell, 'letzter', verlauf);
}

function starteStory(z: Zustand, modell: StoryModell): Zustand {
  if (z.station !== null) return z.bereich === 'story' ? z : { ...z, bereich: 'story' };
  if (modell.stationen[modell.start] === undefined) return z;
  return betrete(z, modell.start, modell, 0, [modell.start]);
}

function waehle(z: Zustand, option: string, zeit: number | undefined, modell: StoryModell): Zustand {
  const st = aktuelleStation(z, modell);
  if (st === null || z.rolle === null) return z;
  const ent = st.szenen[z.rolle]?.entscheidung ?? null;
  if (ent === null) return z;
  const schritt = schritteFuer(st, z.rolle)[z.schritt];
  if (schritt === undefined || (schritt.art !== 'entscheidung' && schritt.art !== 'konsequenz')) return z;
  if (!ent.optionen.some((o) => o.id === option)) return z;
  if (z.entscheidungen[ent.id] === option) return z;

  const zeitWert = zeit !== undefined && Number.isFinite(zeit) ? zeit : null;
  const alt = z.spur.findIndex((e) => e.entscheidung === ent.id);
  let spur: SpurEintrag[];
  if (alt >= 0) {
    spur = z.spur.map((e, i) => (i === alt ? { ...e, option, wechsel: e.wechsel + 1, zeit: zeitWert } : e));
  } else {
    spur = [...z.spur, {
      nr: z.spur.length + 1,
      entscheidung: ent.id,
      station: st.id,
      welt: st.welt,
      rolle: z.rolle,
      option,
      wechsel: 0,
      zeit: zeitWert,
    }];
  }
  return mitStatus({ ...z, entscheidungen: { ...z.entscheidungen, [ent.id]: option }, spur }, modell);
}

function antworte(z: Zustand, frage: string, antwort: string, modell: StoryModell): Zustand {
  const st = aktuelleStation(z, modell);
  if (st === null || z.rolle === null) return z;
  const f = st.szenen[z.rolle]?.fragen.find((x) => x.id === frage);
  if (f === undefined || !f.antworten.some((a) => a.id === antwort)) return z;
  const schluessel = `${st.id}/${z.rolle}/${frage}`;
  if (z.antworten[schluessel] === antwort) return z;
  return { ...z, antworten: { ...z.antworten, [schluessel]: antwort } };
}

function fordereInfo(z: Zustand, info: string, modell: StoryModell): Zustand {
  const st = aktuelleStation(z, modell);
  if (st === null || !st.infos.some((i) => i.id === info)) return z;
  const schluessel = `${st.id}/${info}`;
  if (z.info.includes(schluessel)) return z;
  return mitStatus({ ...z, info: [...z.info, schluessel] }, modell);
}

function setzeVergleich(z: Zustand, wert: number, modell: StoryModell): Zustand {
  const st = aktuelleStation(z, modell);
  if (st === null || !Number.isFinite(wert)) return z;
  if (st.vergleich === null && st.partner === null) return z;
  if (!z.freigeschaltet.weltB) return z;
  const v = Math.min(1, Math.max(0, wert));
  const welt = st.vergleich !== null ? (v >= 0.5 ? 'B' : 'A') : z.welt;
  if (v === z.vergleich && welt === z.welt) return z;
  return { ...z, vergleich: v, welt };
}

function waehleRolle(z: Zustand, rolle: string, modell: StoryModell): Zustand {
  const r = modell.rollen[rolle];
  if (r === undefined || !r.spielbar || z.rolle === rolle) return z;
  const neu: Zustand = { ...z, rolle };
  const st = aktuelleStation(neu, modell);
  if (st !== null) neu.schritt = begrenzeSchritt(st, rolle, z.schritt);
  return mitStatus(neu, modell);
}

function setzeInteressen(z: Zustand, interessen: readonly string[], modell: StoryModell): Zustand {
  const erlaubt = modell.interessen.map((i) => i.id);
  const neu = erlaubt.filter((id) => interessen.includes(id));
  if (neu.length === z.interessen.length && neu.every((id, i) => z.interessen[i] === id)) return z;
  return { ...z, interessen: neu };
}

function notiere(z: Zustand, text: string, zeit: number): Zustand {
  const t = text.trim();
  if (t === '' || !Number.isFinite(zeit)) return z;
  const eintrag = {
    nr: z.regie.protokoll.length + 1,
    station: z.station,
    schritt: z.schritt,
    text: t.slice(0, MAX_TEXT),
    zeit,
  };
  return { ...z, regie: { protokoll: [...z.regie.protokoll, eintrag] } };
}

function neustart(z: Zustand): Zustand {
  // Die Regie behält ihr Gesprächsprotokoll; Explore bleibt offen, wenn es einmal frei war.
  const a = anfangszustand();
  return {
    ...a,
    freigeschaltet: { ...a.freigeschaltet, explore: z.freigeschaltet.explore },
    regie: { protokoll: z.regie.protokoll.map((e) => ({ ...e })) },
  };
}

/** Wendet eine Aktion an. Rein und deterministisch. */
export function wende(z: Zustand, aktion: Aktion, modell: StoryModell): Zustand {
  switch (aktion.art) {
    case 'wechsleBereich':
      if (!['start', 'story', 'theorie', 'explore'].includes(aktion.bereich) || z.bereich === aktion.bereich) return z;
      return { ...z, bereich: aktion.bereich };
    case 'starteStory':
      return starteStory(z, modell);
    case 'waehleRolle':
      return waehleRolle(z, aktion.rolle, modell);
    case 'setzeInteressen':
      return setzeInteressen(z, aktion.interessen, modell);
    case 'weiter':
      return weiter(z, modell);
    case 'zurueck':
      return zurueck(z, modell);
    case 'geheZu': {
      const schritt = aktion.schritt ?? 0;
      if (aktion.station === z.station) {
        const st = aktuelleStation(z, modell);
        if (st === null) return z;
        const s = begrenzeSchritt(st, z.rolle, schritt);
        return s === z.schritt && z.bereich === 'story' ? z : { ...z, bereich: 'story', schritt: s, ebene: 0 };
      }
      return betrete(z, aktion.station, modell, schritt, [...z.verlauf, aktion.station]);
    }
    case 'waehle':
      return waehle(z, aktion.option, aktion.zeit, modell);
    case 'antworte':
      return antworte(z, aktion.frage, aktion.antwort, modell);
    case 'fordereInfo':
      return fordereInfo(z, aktion.info, modell);
    case 'setzeVergleich':
      return setzeVergleich(z, aktion.wert, modell);
    case 'setzeEbene': {
      if (!Number.isInteger(aktion.ebene) || aktion.ebene < 0 || aktion.ebene > 4 || aktion.ebene === z.ebene) return z;
      return { ...z, ebene: aktion.ebene };
    }
    case 'zeige': {
      const { schluessel, wert } = aktion;
      if (schluessel === '' || schluessel.length > MAX_ANSICHT || wert.length > MAX_ANSICHT) return z;
      if (z.ansicht[schluessel] === wert) return z;
      return { ...z, ansicht: { ...z.ansicht, [schluessel]: wert } };
    }
    case 'schalteFrei':
      if (aktion.was !== 'weltB' && aktion.was !== 'explore') return z;
      if (z.freigeschaltet[aktion.was]) return z;
      return { ...z, freigeschaltet: { ...z.freigeschaltet, [aktion.was]: true } };
    case 'oeffneKapitel': {
      const k = aktion.kapitel;
      if (!Number.isInteger(k) || k < 1 || k > 13) return z;
      if (z.bereich === 'theorie' && z.theorie.kapitel === k) return z;
      return { ...z, bereich: 'theorie', theorie: { kapitel: k } };
    }
    case 'notiere':
      return notiere(z, aktion.text, aktion.zeit);
    case 'neustart':
      return neustart(z);
  }
}

/** Zweistellige Form für die Oberfläche: `const w = binde(inhalte); z = w(z, { art: 'weiter' })`. */
export function binde(modell: StoryModell): (z: Zustand, aktion: Aktion) => Zustand {
  return (z, aktion) => wende(z, aktion, modell);
}
