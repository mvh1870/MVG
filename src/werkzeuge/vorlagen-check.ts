/*
 * Vorlagen-Check (Werkzeug A, P18.2) – rein, ohne DOM. Wertet die Antworten zu den Prüfpunkten einer erhaltenen
 * Entscheidungsvorlage aus (Konzept A.4): rot „nicht vollständig“, wenn ein Muss-Punkt fehlt, weniger als zwei
 * zulässige Wege da sind oder die Projektsteuerung als entscheidende Stelle genannt ist (A-R1, A-R4, B1); gelb
 * „noch nicht entscheidungsreif“ bei jeder anderen Lücke oder offenen Antwort (A-R2); grün, wenn alles „ja“ ist.
 * Die Fall-Zuordnung „Wer entscheidet was“ (A-R5) wirkt nur, solange ein Beispiel geladen ist (O-46: nicht
 * einstellbar); ohne Beispiel ist `mandat` null. Belege intern: V2.4 HB 3, 3.1; V1.2 k9.4-l1, k6.4.1-p3.
 */
import { leseWerkzeugStand, type Ampel, type Hinweis } from './gemeinsam.ts';

export type Antwort = 'ja' | 'teilweise' | 'nein';
export type Stelle = 'sie' | 'buergermeisterin' | 'lenkungskreis' | 'projektsteuerung' | 'offen';
export type Gegenstand = 'geld' | 'risiko' | 'freigabe' | 'ziele';
export type WegZustand = 'zulaessig' | 'unzulaessig' | 'schein' | 'offen';

/** Ein Prüfpunkt aus dem Inhalt; `art: 'zaehlung'` wird aus der Wegeliste errechnet (B1), nicht angeklickt. */
export interface Pruefpunkt {
  id: string;
  muss: boolean;
  art?: 'zaehlung';
  mindestens?: number;
}

export interface VorlageEingabe {
  /** fehlt = noch offen */
  antworten: Readonly<Record<string, Antwort | undefined>>;
  wege: readonly { titel: string; zustand: WegZustand }[];
  gegenstand: Gegenstand;
  stelle: Stelle;
  /** null = unbekannt */
  betrag: number | null;
  /** null = unbekannt */
  reserve: boolean | null;
  dringlich: boolean;
}

/** Zuordnung des Beispielprojekts (nur bei geladenem Beispiel, O-46). Unterhalb von `bis` ohne Reserve entscheiden „Sie“. */
export interface MandatsRegel {
  bis: number;
  darueber: Stelle;
  reserve: Stelle;
  immer: Readonly<Partial<Record<Gegenstand, Stelle>>>;
  beraet: readonly Stelle[];
}

export interface VorlagenBefund {
  ampel: Ampel;
  zulaessigeWege: number;
  /** Muss-Lücken zuerst, dann Reihenfolge der Punkte; `bezug` = Prüfpunkt */
  luecken: readonly Hinweis[];
  /** Hinweise ohne Ampelgrund: Mandat (blau), Dringlich, Zustand der Wege */
  hinweise: readonly Hinweis[];
  erfuellt: readonly string[];
  /** noch nicht beantwortet */
  offen: readonly string[];
}

/** Der Prüfpunkt, an dem die genannte Stelle hängt (A3). */
export const STELLEN_PUNKT = 'a3';
/** Mindestzahl zulässiger Wege, wenn der Punkt keine eigene nennt (HB 3.1: mindestens zwei Optionen). */
export const MINDEST_WEGE = 2;

/** Grund, warum im Beispiel die Bürgermeisterin entscheidet (Satz `mandat.saetze.gruende`). */
export type MandatsGrund = 'betrag' | 'reserve' | 'risiko' | 'freigabe' | 'ziele';

/**
 * Befugte Stelle im Beispielprojekt (A-R5). null heißt: Die Stelle hängt wirklich vom Unbekannten ab – Gegenstand Geld,
 * keine Bedingung für die höhere Stelle schon erfüllt, und Betrag oder Reserve unbekannt.
 */
export function befugteStelleImBeispiel(gegenstand: Gegenstand, betrag: number | null, reserve: boolean | null, m: MandatsRegel): Stelle | null {
  const immer = m.immer[gegenstand];
  if (immer !== undefined) return immer;
  if (betrag !== null && betrag > m.bis) return m.darueber;
  if (reserve === true) return m.reserve;
  if (betrag === null || reserve === null) return null;
  return 'sie';
}

/** Warum die höhere Stelle entscheidet; null, wenn „Sie“ entscheiden oder es offen ist. */
export function mandatsGrund(gegenstand: Gegenstand, betrag: number | null, reserve: boolean | null, m: MandatsRegel): MandatsGrund | null {
  if (gegenstand !== 'geld') return m.immer[gegenstand] !== undefined ? gegenstand : null;
  if (betrag !== null && betrag > m.bis) return 'betrag';
  if (reserve === true) return 'reserve';
  return null;
}

/** „Beispiel geladen“ (Konzept 0): Keine Eingabe hat seither Gegenstand, Betrag oder Reserve geändert. */
export function beispielNochGeladen(beispiel: { gegenstand: Gegenstand; betrag: number | null; reserve: boolean | null }, e: VorlageEingabe): boolean {
  return beispiel.gegenstand === e.gegenstand && beispiel.betrag === e.betrag && beispiel.reserve === e.reserve;
}

const RANG: Record<Antwort, number> = { nein: 0, teilweise: 1, ja: 2 };
const hoechstens = (a: Antwort, grenze: Antwort): Antwort => (RANG[a] <= RANG[grenze] ? a : grenze);

/** Was an A3 gilt: die wirksame Antwort und, falls ein eigener Satz die Lücke erklärt, dessen Kennung. */
interface StellenUrteil {
  antwort: Antwort | undefined;
  satz: string | null;
  info: Hinweis | null;
  /** A-R4: rot unabhängig von der Antwort */
  rot: boolean;
}

function urteileStelle(e: VorlageEingabe, mandat: MandatsRegel | null): StellenUrteil {
  const antwort = e.antworten[STELLEN_PUNKT];
  if (e.stelle === 'projektsteuerung') return { antwort: 'nein', satz: 'stelle-projektsteuerung', info: null, rot: true };
  if (e.stelle === 'offen') return { antwort: 'nein', satz: null, info: null, rot: false };
  if (mandat === null) {
    if (e.stelle === 'lenkungskreis') return { antwort: 'nein', satz: 'stelle-beraet', info: null, rot: false };
    return { antwort, satz: null, info: null, rot: false };
  }
  const befugt = befugteStelleImBeispiel(e.gegenstand, e.betrag, e.reserve, mandat);
  if (mandat.beraet.includes(e.stelle)) {
    return { antwort: 'nein', satz: `mandat-beraet:${befugt === null ? 'unbestimmt' : befugt}`, info: null, rot: false };
  }
  if (befugt === null) {
    if (antwort === undefined) return { antwort, satz: null, info: null, rot: false };
    return { antwort: hoechstens(antwort, 'teilweise'), satz: 'mandat-unbestimmt', info: null, rot: false };
  }
  if (e.stelle === 'sie' && befugt !== 'sie') {
    const grund = mandatsGrund(e.gegenstand, e.betrag, e.reserve, mandat);
    return { antwort: 'nein', satz: `mandat-falsch:${grund ?? 'betrag'}`, info: null, rot: false };
  }
  if (e.stelle !== 'sie' && befugt === 'sie') {
    return { antwort, satz: null, info: { id: 'mandat-selbst', schwere: 'info', bezug: STELLEN_PUNKT }, rot: false };
  }
  return { antwort, satz: null, info: null, rot: false };
}

/** Wertet eine Vorlage aus (A-R1 bis A-R8). */
export function pruefeVorlage(punkte: readonly Pruefpunkt[], e: VorlageEingabe, mandat: MandatsRegel | null): VorlagenBefund {
  const zulaessigeWege = e.wege.filter((w) => w.zustand === 'zulaessig').length;
  const stelle = urteileStelle(e, mandat);
  let rot = stelle.rot;
  let gelb = false;
  const mussLuecken: Hinweis[] = [];
  const andereLuecken: Hinweis[] = [];
  const erfuellt: string[] = [];
  const offen: string[] = [];

  for (const p of punkte) {
    let antwort: Antwort | undefined;
    let satz = p.id;
    if (p.art === 'zaehlung') {
      antwort = zulaessigeWege >= (p.mindestens ?? MINDEST_WEGE) ? 'ja' : 'nein';
    } else if (p.id === STELLEN_PUNKT) {
      antwort = stelle.antwort;
      if (stelle.satz !== null) satz = stelle.satz;
    } else {
      antwort = e.antworten[p.id];
    }
    if (antwort === undefined) {
      offen.push(p.id);
      gelb = true;
      continue;
    }
    if (antwort === 'ja') {
      erfuellt.push(p.id);
      continue;
    }
    const schwer = p.muss && antwort === 'nein';
    if (schwer) rot = true;
    else gelb = true;
    const luecke: Hinweis = { id: satz, schwere: schwer || (p.id === STELLEN_PUNKT && stelle.rot) ? 'rot' : 'gelb', bezug: p.id };
    (p.muss ? mussLuecken : andereLuecken).push(luecke);
  }

  const hinweise: Hinweis[] = [];
  if (stelle.info !== null) hinweise.push(stelle.info);
  for (const z of ['unzulaessig', 'schein', 'offen'] as const) {
    if (e.wege.some((w) => w.zustand === z)) hinweise.push({ id: `weg-${z}`, schwere: 'info', bezug: 'b1' });
  }
  if (e.dringlich) hinweise.push({ id: 'dringlich', schwere: 'info' });

  const ampel: Ampel = rot ? 'rot' : gelb ? 'gelb' : 'gruen';
  return { ampel, zulaessigeWege, luecken: [...mussLuecken, ...andereLuecken], hinweise, erfuellt, offen };
}

/** Schritt auf dem Kanal Regie → Leinwand: Prüfschritt 1–5 oder das Ergebnis (Konzept A.9). */
export const SCHRITT_VORLAGE = /^s:(?:[1-5]|ergebnis)$/u;

/** Werkzeugstand des Vorlagen-Checks für die Leinwand (Konzept 0.3). */
export function leseStandVorlage(roh: unknown, beispiele: readonly string[]): { beispiel: string; schritt: string | null } | null {
  return leseWerkzeugStand(roh, beispiele, SCHRITT_VORLAGE);
}
