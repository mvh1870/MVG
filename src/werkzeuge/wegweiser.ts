/*
 * Vorgangs-Wegweiser (Werkzeug B, P18.2) – rein, ohne DOM. Führt mit Ja/Nein-Fragen vom Sachverhalt zur Vorgangsart
 * (Konzept B.2): zuerst die Vorfrage „dringlich?“, dann Handlung → Maßnahme, schon eingetreten → Problem, bewusst
 * anders → Änderung, möglich → Risiko, geplante Arbeit → Aufgabe; „unklar“ bei eingetreten/möglich → Frühwarnung,
 * alles Nein → „vermutlich kein Vorgang“ (B-R2). Danach immer die Frage nach einer Entscheidung des Bauherrn.
 * Belege intern: V2.4 HB 1, 1.1–1.6, 3, 4.
 */
import { leseWerkzeugStand } from './gemeinsam.ts';

export type Art = 'aufgabe' | 'massnahme' | 'fruehwarnung' | 'risiko' | 'problem' | 'aenderung';
export type FrageId = 'dringlich' | 'handlung' | 'eingetreten' | 'anpassen' | 'moeglich' | 'arbeit' | 'entscheidung';
export type Wahl = 'ja' | 'nein' | 'unklar';

export interface Weg {
  /** null = noch nicht bestimmt oder kein Vorgang */
  art: Art | null;
  /** Frühwarnung wegen „unklar“ (B-R2) */
  ausUnklar: boolean;
  /** alle Fragen W1–W5 mit Nein beantwortet (B-R2): „Vermutlich kein Vorgang“ – nicht, wenn zugleich eine Entscheidung gebraucht wird */
  keinVorgang: boolean;
  /** alle Fragen W1–W5 mit Nein, aber eine Entscheidung des Bauherrn ist nötig (R78): das Ergebnis ist „Entscheidung vorbereiten“, nicht „kein Vorgang“ */
  nurEntscheidung: boolean;
  dringlich: boolean | null;
  entscheidung: boolean | null;
  /** tatsächlich gestellte und beantwortete Fragen in der Reihenfolge des Wegs */
  pfad: readonly FrageId[];
  /** nächste offene Frage, null = fertig */
  naechste: FrageId | null;
}

/** Fragen, bei denen „unklar“ eine Antwort ist (W2, W4). */
export const MIT_UNKLAR: readonly FrageId[] = ['eingetreten', 'moeglich'];

/** Der Baum W1–W5: Frage, Art bei „ja“, Art bei „unklar“ (nur W2, W4). */
const BAUM: readonly { frage: FrageId; ja: Art; unklar?: Art }[] = [
  { frage: 'handlung', ja: 'massnahme' },
  { frage: 'eingetreten', ja: 'problem', unklar: 'fruehwarnung' },
  { frage: 'anpassen', ja: 'aenderung' },
  { frage: 'moeglich', ja: 'risiko', unklar: 'fruehwarnung' },
  { frage: 'arbeit', ja: 'aufgabe' },
];

/** Antwort, wie sie für diese Frage zählt; „unklar“ bei einer reinen Ja/Nein-Frage gilt als nicht beantwortet. */
function wahl(a: Readonly<Partial<Record<FrageId, Wahl>>>, f: FrageId): Wahl | undefined {
  const w = a[f];
  if (w === 'unklar' && !MIT_UNKLAR.includes(f)) return undefined;
  return w;
}

/** Weg durch die Fragen zu den gegebenen Antworten; Antworten hinter dem Ergebnis bleiben unbeachtet. */
export function wegweiser(a: Readonly<Partial<Record<FrageId, Wahl>>>): Weg {
  const d = wahl(a, 'dringlich');
  const dringlich = d === undefined ? null : d === 'ja';
  const pfad: FrageId[] = d === undefined ? [] : ['dringlich'];
  let art: Art | null = null;
  let ausUnklar = false;
  let keinVorgang = false;
  let offeneBaumfrage: FrageId | null = null;

  for (const k of BAUM) {
    const w = wahl(a, k.frage);
    if (w === undefined) {
      offeneBaumfrage = k.frage;
      break;
    }
    pfad.push(k.frage);
    if (w === 'ja') {
      art = k.ja;
      break;
    }
    if (w === 'unklar' && k.unklar !== undefined) {
      art = k.unklar;
      ausUnklar = true;
      break;
    }
  }
  if (art === null && offeneBaumfrage === null) keinVorgang = true;

  let entscheidung: boolean | null = null;
  if (art !== null || keinVorgang) {
    const e = wahl(a, 'entscheidung');
    if (e !== undefined) {
      entscheidung = e === 'ja';
      pfad.push('entscheidung');
    }
  }
  const nurEntscheidung = keinVorgang && entscheidung === true;
  const naechste: FrageId | null =
    dringlich === null ? 'dringlich' : offeneBaumfrage !== null ? offeneBaumfrage : entscheidung === null ? 'entscheidung' : null;
  return { art, ausUnklar, keinVorgang: keinVorgang && !nurEntscheidung, nurEntscheidung, dringlich, entscheidung, pfad, naechste };
}

/** Höchstens zwei typische Verwechslungen zur Art, in der Reihenfolge des Inhalts (Konzept B.5). */
export function verwechslungen(art: Art, alle: readonly { id: string; art: Art }[]): readonly string[] {
  return alle.filter((v) => v.art === art).slice(0, 2).map((v) => v.id);
}

/** Zusätze unter dem Ergebnis (B-R1 bis B-R7), in fester Reihenfolge. */
export type Zusatz = 'sofort' | 'unklar' | 'keinVorgang' | 'nichtSchaetzen' | 'bisherGilt' | 'entscheidung' | 'bewerten' | 'verknuepfen';

export function zusaetze(w: Weg): readonly Zusatz[] {
  const z: Zusatz[] = [];
  if (w.dringlich === true) z.push('sofort');
  if (w.ausUnklar) z.push('unklar');
  if (w.keinVorgang) z.push('keinVorgang');
  if (w.art === 'problem') z.push('nichtSchaetzen');
  if (w.art === 'aenderung') z.push('bisherGilt');
  if (w.entscheidung === true) z.push('entscheidung');
  if (w.entscheidung === false && w.art === 'risiko') z.push('bewerten');
  // verknüpft wird nur, was als Vorgang entsteht (R78): bei „kein Vorgang“ und bei reiner Entscheidungsvorbereitung entsteht kein Eintrag
  if (w.art !== null) z.push('verknuepfen');
  return z;
}

/**
 * Schritt auf dem Kanal Regie → Leinwand: die gesetzten Antworten in Reihenfolge, j/n/u (Konzept 0.3, B.10); `a:0` = noch
 * keine Antwort gesetzt (P18.5: die Runde rät, bevor die Regie die erste Antwort setzt). Ein leeres `a:` bleibt ungültig.
 */
export const SCHRITT_WEGWEISER = /^a:(?:0|[jnu](?:,[jnu]){0,6})$/u;

/** Werkzeugstand des Wegweisers für die Leinwand. */
export function leseStandWegweiser(roh: unknown, beispiele: readonly string[]): { beispiel: string; schritt: string | null } | null {
  return leseWerkzeugStand(roh, beispiele, SCHRITT_WEGWEISER);
}
