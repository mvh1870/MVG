/*
 * Ablauf der Story (P17.2, O-52) – rein, ohne DOM, ohne Uhr, ohne Zufall. Der Stand hält nur, wo die Leserin oder
 * der Leser steht, welche Antworten gewählt sind, was in den Mini-Aufgaben angeklickt ist, welche Gewichte im
 * Vergleich gelten und ob die Kurzfassung läuft. Alles andere – Balken, Bilanz, Rangfolge – wird daraus berechnet.
 * Kein Sperren: Jeder Schritt ist jederzeit erreichbar (L-184).
 */
import { kipppunkte, rangfolge, spitze, type Gewichte, type Kipppunkt, type Platz } from './mcda.ts';
import { miniArt, type PostenLage } from './mini-arten.ts';
import {
  BALKEN, type Akt, type Antwort, type BalkenId, type BalkenStufe, type BilanzSicht, type BilanzTyp, type Geschichte, type Kapitel, type Mini,
  type Vergleich, type VergleichOption,
} from './typen.ts';

export type Teil = 'szene' | 'vergleich' | 'frage' | 'mini';
export const TEILE: readonly Teil[] = ['szene', 'vergleich', 'frage', 'mini'];

/**
 * Ein Schritt der Story. `pause` (P19.3) gibt es nur, wenn die Geschichte Akte hat: am Ende jedes Akts außer dem letzten, nur
 * auf dem ganzen Weg (die Kurzfassung hat keine Pause).
 */
export type Schritt = { ort: 'auftakt' } | { ort: 'kapitel'; kapitel: string; teil: Teil } | { ort: 'pause'; akt: string } | { ort: 'ende' };

/**
 * Fassung des gespeicherten Stands; ein älterer Stand (Stationen, v 1) wird verworfen. P19.3: bleibt 2 – der Schritt `pause`
 * ist eine zusätzliche, optionale Form; Kennungen, die es in der Geschichte nicht gibt (ein alter Stand mit k1 … k8 in einer
 * Geschichte mit s1 … s14), machen den ganzen Stand ungültig (`leseStand`: Ergebnis null, die Story beginnt von vorn).
 */
export const STAND_VERSION = 2;

export interface Stand {
  v: typeof STAND_VERSION;
  schritt: Schritt;
  /** Kapitel → Platz der gewählten Antwort auf der Seite (0–2) */
  wahlen: Record<string, number>;
  /** Kapitel → Mini-Aufgabe: zuordnen = je Posten der Platz der Wahl (−1 = offen); reihenfolge = Posten in der angeklickten Folge */
  mini: Record<string, number[]>;
  /** eigene Gewichte im Vergleich (null = die abgestimmten) */
  gewichte: Gewichte | null;
  kurz: boolean;
}

export type Balkenstand = Record<BalkenId, number>;

export const BALKEN_MIN = 0;
export const BALKEN_MAX = 10;
/** die drei Stufen „Was ist wichtiger?“: sehr wichtig · wichtig · weniger wichtig */
export const STUFEN_GEWICHT: readonly number[] = [5, 3, 1];

export function neuerStand(kurz = false): Stand {
  return { v: STAND_VERSION, schritt: { ort: 'auftakt' }, wahlen: {}, mini: {}, gewichte: null, kurz };
}

/* ------------------------------------------------------------------- Weg -- */

/** Kapitel des gewählten Wegs (Kurzfassung: nur die markierten). */
export function wegKapitel(g: Geschichte, kurz: boolean): Kapitel[] {
  return g.kapitel.filter((k) => !kurz || k.kurzfassung);
}

export function kapitel(g: Geschichte, id: string): Kapitel | null {
  return g.kapitel.find((k) => k.id === id) ?? null;
}

/** Teile eines Kapitels: Szene, (Vergleich), Frage, (Mini-Aufgabe – nicht in der Kurzfassung). */
export function teileVon(k: Kapitel, kurz: boolean): Teil[] {
  const aus: Teil[] = ['szene'];
  if (k.vergleich !== null) aus.push('vergleich');
  aus.push('frage');
  if (k.mini !== null && !kurz) aus.push('mini');
  return aus;
}

/* ------------------------------------------------------------------- Akte -- */

/** Die Akte der Geschichte (leer = ohne Akte, die Story verhält sich wie bisher). */
export function akteVon(g: Geschichte): readonly Akt[] {
  return g.akte ?? [];
}

export function akt(g: Geschichte, id: string): Akt | null {
  return akteVon(g).find((a) => a.id === id) ?? null;
}

/** Der Akt, zu dem eine Station gehört. */
export function aktVon(g: Geschichte, kapitelId: string): Akt | null {
  return akteVon(g).find((a) => a.stationen.includes(kapitelId)) ?? null;
}

/** Stelle des Akts (1 = erster) – sichtbar römisch („Akt II“). */
export function aktNummer(g: Geschichte, a: Akt): number {
  return akteVon(g).indexOf(a) + 1;
}

const ROEMISCH: readonly string[] = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export const roemisch = (n: number): string => ROEMISCH[n - 1] ?? String(n);

/** Letzte Station eines Akts. */
export function letzteStation(g: Geschichte, a: Akt): Kapitel | null {
  return kapitel(g, a.stationen.at(-1) ?? '');
}

/** Ob nach diesem Akt eine Pause kommt: jeder Akt außer dem letzten (dessen „Das können Sie jetzt“ steht im Ende). */
export function hatPause(g: Geschichte, a: Akt): boolean {
  return akteVon(g).at(-1) !== a;
}

/** Alle Schritte des Wegs in Reihenfolge. Mit Akten steht am Ende jedes Akts außer dem letzten eine Pause – nur auf dem ganzen Weg. */
export function schritte(g: Geschichte, kurz: boolean): Schritt[] {
  const aus: Schritt[] = [{ ort: 'auftakt' }];
  for (const k of wegKapitel(g, kurz)) {
    for (const teil of teileVon(k, kurz)) aus.push({ ort: 'kapitel', kapitel: k.id, teil });
    const a = kurz ? null : aktVon(g, k.id);
    if (a !== null && a.stationen.at(-1) === k.id && hatPause(g, a)) aus.push({ ort: 'pause', akt: a.id });
  }
  aus.push({ ort: 'ende' });
  return aus;
}

export function gleicherSchritt(a: Schritt, b: Schritt): boolean {
  if (a.ort !== b.ort) return false;
  if (a.ort === 'kapitel' && b.ort === 'kapitel') return a.kapitel === b.kapitel && a.teil === b.teil;
  if (a.ort === 'pause' && b.ort === 'pause') return a.akt === b.akt;
  return true;
}

/** Kennung eines Schritts („auftakt“, „s3:frage“, „pause:a1“, „ende“) – Schlüssel der Lesezeit-Messung und der Regie-Sprungliste. */
export function schrittKennung(s: Schritt): string {
  return s.ort === 'kapitel' ? `${s.kapitel}:${s.teil}` : s.ort === 'pause' ? `pause:${s.akt}` : s.ort;
}

export function schrittIndex(g: Geschichte, stand: Stand): number {
  const i = schritte(g, stand.kurz).findIndex((s) => gleicherSchritt(s, stand.schritt));
  return i < 0 ? 0 : i;
}

export function geheZu(g: Geschichte, stand: Stand, schritt: Schritt): Stand {
  return schritte(g, stand.kurz).some((s) => gleicherSchritt(s, schritt)) ? { ...stand, schritt } : stand;
}

export function weiter(g: Geschichte, stand: Stand): Stand {
  const alle = schritte(g, stand.kurz);
  return { ...stand, schritt: alle[Math.min(alle.length - 1, schrittIndex(g, stand) + 1)] ?? stand.schritt };
}

export function zurueck(g: Geschichte, stand: Stand): Stand {
  const alle = schritte(g, stand.kurz);
  return { ...stand, schritt: alle[Math.max(0, schrittIndex(g, stand) - 1)] ?? stand.schritt };
}

/** Der erste Schritt des ersten Kapitels auf dem Weg. */
export function beginne(g: Geschichte, stand: Stand, kurz: boolean): Stand {
  const erstes = wegKapitel(g, kurz)[0];
  return { ...stand, kurz, schritt: erstes ? { ort: 'kapitel', kapitel: erstes.id, teil: 'szene' } : { ort: 'ende' } };
}

/** Zwischen ganzer Geschichte und Kurzfassung wechseln; liegt der Schritt nicht auf dem neuen Weg, geht es zum nächsten Kapitel. */
export function setzeKurz(g: Geschichte, stand: Stand, kurz: boolean): Stand {
  if (stand.kurz === kurz) return stand;
  const neu = { ...stand, kurz };
  if (schritte(g, kurz).some((s) => gleicherSchritt(s, stand.schritt))) return neu;
  // nur der Weg in die Kurzfassung kann einen Schritt verlieren (ein übersprungenes Kapitel oder eine Mini-Aufgabe)
  const hier = nrAmSchritt(g, stand.schritt);
  const k = wegKapitel(g, kurz).find((x) => x.nr > hier);
  return { ...neu, schritt: k ? { ort: 'kapitel', kapitel: k.id, teil: 'szene' } : { ort: 'ende' } };
}

/** Nummer der Station, bei der der Schritt steht (Pause: die letzte Station des Akts; Auftakt: 0; Ende: unendlich). */
function nrAmSchritt(g: Geschichte, s: Schritt): number {
  if (s.ort === 'kapitel') return kapitel(g, s.kapitel)?.nr ?? 0;
  if (s.ort === 'pause') { const a = akt(g, s.akt); return (a === null ? null : letzteStation(g, a))?.nr ?? 0; }
  return s.ort === 'ende' ? Number.POSITIVE_INFINITY : 0;
}

/**
 * Vom Ende der Kurzfassung in die ganze Geschichte: Sie setzt an der ersten Station ein, die die Kurzfassung nicht gespielt hat
 * (Szene); gibt es keine, bleibt der Schritt stehen. Antworten bleiben erhalten.
 */
export function weiterMitGanzer(g: Geschichte, stand: Stand): Stand {
  const erste = g.kapitel.find((k) => !k.kurzfassung);
  const neu = { ...stand, kurz: false };
  return erste === undefined ? neu : { ...neu, schritt: { ort: 'kapitel', kapitel: erste.id, teil: 'szene' } };
}

/** Kapitel, die die Kurzfassung vor diesem Kapitel (bzw. vor dem Ende: `null`) überspringt – sie erscheinen als Brücke. */
export function bruecken(g: Geschichte, vor: Kapitel | null): Kapitel[] {
  const bis = vor?.nr ?? Number.POSITIVE_INFINITY;
  const vorher = wegKapitel(g, true).filter((k) => k.nr < bis).at(-1)?.nr ?? 0;
  return g.kapitel.filter((k) => !k.kurzfassung && k.nr > vorher && k.nr < bis);
}

/** Höchstzahl übersprungener Stationen auf einer gebündelten Brückenkarte (Gerüst Abschnitt 2d: „zwei Karten“ für sechs Stationen). */
export const BRUECKE_MAX = 3;

/**
 * Die Brücken vor einer Station, gebündelt (P19.3): mehrere übersprungene Stationen in Folge teilen sich eine Karte (höchstens
 * `BRUECKE_MAX`). Ohne Akte bleibt jede Station eine eigene Karte – wie bisher.
 */
export function brueckenKarten(g: Geschichte, vor: Kapitel | null): Kapitel[][] {
  const liste = bruecken(g, vor);
  if (akteVon(g).length === 0) return liste.map((k) => [k]);
  const gruppen: Kapitel[][] = [];
  for (let i = 0; i < liste.length; i += BRUECKE_MAX) gruppen.push(liste.slice(i, i + BRUECKE_MAX));
  return gruppen;
}

/* -------------------------------------------------------------- Antworten -- */

/** Platz der guten Antwort. */
export function gutePlatz(k: Kapitel): number {
  return Math.max(0, k.antworten.findIndex((a) => a.wertung === 'gut'));
}

export function waehle(g: Geschichte, stand: Stand, kapitelId: string, platz: number): Stand {
  const k = kapitel(g, kapitelId);
  if (k === null || !Number.isInteger(platz) || platz < 0 || platz >= k.antworten.length) return stand;
  return { ...stand, wahlen: { ...stand.wahlen, [kapitelId]: platz } };
}

/** Was in diesem Kapitel zählt: die Wahl; in der Kurzfassung zählt ein übersprungenes Kapitel wie die gute Antwort. */
export function zaehlendePlatz(stand: Stand, k: Kapitel): number | null {
  if (stand.kurz && !k.kurzfassung) return gutePlatz(k);
  return stand.wahlen[k.id] ?? null;
}

export function gewaehlteAntwort(stand: Stand, k: Kapitel): Antwort | null {
  const p = zaehlendePlatz(stand, k);
  return p === null ? null : k.antworten[p] ?? null;
}

/* ----------------------------------------------------------------- Balken -- */

const begrenze = (n: number): number => Math.min(BALKEN_MAX, Math.max(BALKEN_MIN, n));

/** Startwerte der Balken. */
export function startBalken(g: Geschichte): Balkenstand {
  const s: Balkenstand = { geld: 0, zeit: 0, vertrauen: 0 };
  for (const b of g.balken) s[b.id] = begrenze(b.start);
  return s;
}

/**
 * Balken nach allen zählenden Antworten der Kapitel bis einschließlich `bisNr` (Kapitelnummer; Unendlich = Ende).
 * Jede Antwort wird einzeln angewandt und das Ergebnis jedes Mal auf 0–10 begrenzt – ein voller Balken läuft nicht
 * über und wird von der nächsten Senkung sofort sichtbar kleiner.
 */
export function balkenBis(g: Geschichte, stand: Stand, bisNr: number): Balkenstand {
  const s = startBalken(g);
  for (const k of g.kapitel) {
    if (k.nr > bisNr) break;
    const a = gewaehlteAntwort(stand, k);
    if (a === null) continue;
    for (const b of BALKEN) s[b] = begrenze(s[b] + a.wirkung[b]);
  }
  return s;
}

/** Balken am Schritt: am Auftakt die Startwerte, im Kapitel nach allem bis einschließlich dieses Kapitels, am Ende alles. */
export function balken(g: Geschichte, stand: Stand, schritt: Schritt = stand.schritt): Balkenstand {
  if (schritt.ort === 'auftakt') return startBalken(g);
  if (schritt.ort === 'ende') return balkenBis(g, stand, Number.POSITIVE_INFINITY);
  return balkenBis(g, stand, nrAmSchritt(g, schritt));
}

/** Ein Punkt des Verlaufs: die Balken nach einer Station (`nr` 0 = Start). */
export interface VerlaufPunkt {
  nr: number;
  /** Kennung der Station; null am Start */
  id: string | null;
  balken: Balkenstand;
}

/**
 * Verlauf der drei Balken (P19.3, Pause): Start und die Stände nach jeder Station bis einschließlich `bisNr`, genau wie
 * `balkenBis` sie liefert – die Zeichnung (src/grafik/verlauf.ts) erfindet nichts dazu.
 */
export function verlaufBis(g: Geschichte, stand: Stand, bisNr: number): VerlaufPunkt[] {
  const aus: VerlaufPunkt[] = [{ nr: 0, id: null, balken: startBalken(g) }];
  for (const k of g.kapitel) if (k.nr <= bisNr) aus.push({ nr: k.nr, id: k.id, balken: balkenBis(g, stand, k.nr) });
  return aus;
}

/* --------------------------------------------------------------- Lesezeit -- */

/**
 * Gemessene Lesezeit je Schritt (P19.3, werkzeuge/lesezeit.mjs, Datei src/geschichte/lesezeit-daten.json): Wörter je Schritt auf
 * dem guten Weg, getrennt für den ganzen Weg und die Kurzfassung; Schlüssel = `schrittKennung`. Daraus rechnet die Seite die
 * Restzeit – rein und ohne Uhr.
 */
export interface Lesezeit {
  woerterJeMinute: number;
  lang: Record<string, number>;
  kurz: Record<string, number>;
}

/** Minuten aus Wörtern, auf ganze Minuten gerundet, mindestens 1. */
export function minutenAus(woerter: number, jeMinute: number): number {
  return Math.max(1, Math.round(woerter / jeMinute));
}

/** Wörter von diesem Schritt bis zum Ende des Wegs (der aktuelle Schritt zählt voll); null, wenn für einen Schritt keine Messung vorliegt. */
export function restWoerter(g: Geschichte, stand: Stand, lz: Lesezeit): number | null {
  const alle = schritte(g, stand.kurz);
  const tabelle = stand.kurz ? lz.kurz : lz.lang;
  let summe = 0;
  for (const sch of alle.slice(schrittIndex(g, stand))) {
    const n = tabelle[schrittKennung(sch)];
    if (n === undefined) return null;
    summe += n;
  }
  return summe;
}

/** Wörter eines Akts auf dem ganzen Weg: seine Stationen, bei Pause auch die Pause; null, wenn eine Messung fehlt. */
export function aktWoerter(g: Geschichte, a: Akt, lz: Lesezeit): number | null {
  let summe = 0;
  for (const sch of schritte(g, false)) {
    const gehoert = sch.ort === 'kapitel' ? a.stationen.includes(sch.kapitel) : sch.ort === 'pause' && sch.akt === a.id;
    if (!gehoert) continue;
    const n = lz.lang[schrittKennung(sch)];
    if (n === undefined) return null;
    summe += n;
  }
  return summe;
}

/** Stufe eines Balkenwerts: niedrig 0–3, mittel 4–6, hoch 7–10. */
export function stufe(wert: number): BalkenStufe {
  return wert <= 3 ? 'niedrig' : wert <= 6 ? 'mittel' : 'hoch';
}

/** Ob auf dem Weg eine Falle zählt (in der Kurzfassung zählen übersprungene Kapitel wie die gute Antwort). */
export function falleGewaehlt(g: Geschichte, stand: Stand): boolean {
  return wegKapitel(g, stand.kurz).some((k) => gewaehlteAntwort(stand, k)?.wertung === 'falle');
}

/**
 * Bilanz-Typ – die erste zutreffende Regel gilt (Drehbuch Abschnitt 3). „Ruhig ins Ziel“ verlangt zusätzlich, dass keine
 * Falle gewählt ist: Sein Text sagt, dass jede große Entscheidung bei der Bürgermeisterin lag und sie alles wusste – das
 * stimmt nach keiner Falle (L-239). Ein solcher Weg mit guten Balken endet „mit Umwegen“.
 */
export function bilanzTyp(b: Balkenstand, falle: boolean): BilanzTyp {
  if (stufe(b.vertrauen) === 'niedrig') return 'nicht-getragen';
  if (stufe(b.zeit) === 'niedrig') return 'letzte-meter';
  if (!falle && stufe(b.zeit) === 'hoch' && stufe(b.vertrauen) === 'hoch' && stufe(b.geld) !== 'niedrig') return 'ruhig';
  return 'umwege';
}

/**
 * Bilanz am Ende des Wegs. Sind auf dem Weg noch Entscheidungen offen (über die Fortschrittslinie ans Ende gesprungen,
 * L-232), gibt es kein Urteil über den Weg, sondern den neutralen Text „offen“ (R73) – jeder Bilanz-Typ spricht über
 * Antworten, die es dann nicht alle gibt.
 */
export function bilanzAmEnde(g: Geschichte, stand: Stand): BilanzSicht {
  if (offeneKapitel(g, stand).length > 0) return 'offen';
  return bilanzTyp(balken(g, stand, { ort: 'ende' }), falleGewaehlt(g, stand));
}

/**
 * Welche Fassung der Schlusszeilen gilt: Vertrauen niedrig vor „nach einer Falle“ vor „offen“ (Entscheidungen offen,
 * R73) vor der Grundfassung (L-239).
 */
export type EndeFassung = 'grund' | 'nach-falle' | 'vertrauen-niedrig' | 'offen';

export function endeFassung(g: Geschichte, stand: Stand): EndeFassung {
  if (stufe(balken(g, stand, { ort: 'ende' }).vertrauen) === 'niedrig') return 'vertrauen-niedrig';
  if (falleGewaehlt(g, stand)) return 'nach-falle';
  return offeneKapitel(g, stand).length > 0 ? 'offen' : 'grund';
}

/** Kapitel des Wegs, in denen noch keine Antwort gewählt ist. */
export function offeneKapitel(g: Geschichte, stand: Stand): Kapitel[] {
  return wegKapitel(g, stand.kurz).filter((k) => stand.wahlen[k.id] === undefined);
}

/* ----------------------------------------------------------- Mini-Aufgaben -- */

export type { PostenLage };

export interface MiniAuswertung {
  /** je Posten (in der Reihenfolge der Liste) */
  je: PostenLage[];
  richtig: number;
  fertig: boolean;
}

/**
 * Reihenfolge, in der eine Reihenfolge-Aufgabe ihre Posten zeigt: fest gemischt (kein Zufall), damit jeder Lauf
 * dieselbe Aufgabe sieht und die richtige Folge nicht schon dasteht.
 */
export function gemischt(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i).sort((a, b) => ((a * 7 + 3) % 11) - ((b * 7 + 3) % 11) || a - b);
}

function miniVon(g: Geschichte, kapitelId: string): Mini | null {
  return kapitel(g, kapitelId)?.mini ?? null;
}

/**
 * Ein Zug in einer Mini-Aufgabe, für jede Art gleich (Mini-Registry, `mini-arten.ts`, `zug`): `posten` ist der Platz in
 * der Liste der Aufgabe, `wahl` der Platz der Wahl, wo die Art eine braucht. Ungültiges lässt den Stand unverändert.
 */
export function miniZug(g: Geschichte, stand: Stand, kapitelId: string, posten: number, wahl?: number): Stand {
  const m = miniVon(g, kapitelId);
  const def = m === null ? null : miniArt(m.art);
  if (m === null || def === null) return stand;
  const neu = def.zug(m, stand.mini[kapitelId] ?? [], posten, wahl);
  return neu === null ? stand : { ...stand, mini: { ...stand.mini, [kapitelId]: neu } };
}

/** Zuordnen: Posten `posten` bekommt die Wahl `wahl` (Platz in `mini.wahlen`). */
export function ordneZu(g: Geschichte, stand: Stand, kapitelId: string, posten: number, wahl: number): Stand {
  return miniVon(g, kapitelId)?.art === 'zuordnen' ? miniZug(g, stand, kapitelId, posten, wahl) : stand;
}

/** Reihenfolge: einen Posten als nächsten anklicken – oder, ist er schon dran, ihn und alles danach wieder lösen. */
export function klickeReihe(g: Geschichte, stand: Stand, kapitelId: string, posten: number): Stand {
  return miniVon(g, kapitelId)?.art === 'reihenfolge' ? miniZug(g, stand, kapitelId, posten) : stand;
}

/** Mini-Aufgabe zurücksetzen. */
export function miniVonVorn(stand: Stand, kapitelId: string): Stand {
  const mini = { ...stand.mini };
  delete mini[kapitelId];
  return { ...stand, mini };
}

export function werteMiniAus(m: Mini, antworten: readonly number[] | undefined): MiniAuswertung {
  const je = miniArt(m.art)?.werte(m, antworten ?? []) ?? m.posten.map((): PostenLage => 'offen');
  return { je, richtig: je.filter((x) => x === 'richtig').length, fertig: je.every((x) => x !== 'offen') };
}

/* --------------------------------------------------------------- Vergleich -- */

/** Das Kapitel mit dem Vergleich (es gibt genau eines). */
export function vergleichKapitel(g: Geschichte): Kapitel | null {
  return g.kapitel.find((k) => k.vergleich !== null) ?? null;
}

export function abgestimmteGewichte(v: Vergleich): Gewichte {
  const aus: Gewichte = {};
  for (const k of v.kriterien) aus[k.id] = k.gewicht;
  return aus;
}

/** Geltende Gewichte: eigene, sonst die abgestimmten. */
export function gewichte(g: Geschichte, stand: Stand): Gewichte {
  const v = vergleichKapitel(g)?.vergleich ?? null;
  if (v === null) return {};
  const ab = abgestimmteGewichte(v);
  if (stand.gewichte === null) return ab;
  const aus: Gewichte = {};
  for (const k of v.kriterien) aus[k.id] = STUFEN_GEWICHT.includes(stand.gewichte[k.id] ?? -1) ? (stand.gewichte[k.id] as number) : (ab[k.id] ?? 3);
  return aus;
}

/** Eine Stufe („Was ist wichtiger?“) für ein Kriterium setzen; nur 5, 3 oder 1. */
export function setzeGewicht(g: Geschichte, stand: Stand, kriterium: string, wert: number): Stand {
  const v = vergleichKapitel(g)?.vergleich ?? null;
  if (v === null || !v.kriterien.some((k) => k.id === kriterium) || !STUFEN_GEWICHT.includes(wert)) return stand;
  const neu = { ...gewichte(g, stand), [kriterium]: wert };
  const ab = abgestimmteGewichte(v);
  const gleich = v.kriterien.every((k) => neu[k.id] === ab[k.id]);
  return { ...stand, gewichte: gleich ? null : neu };
}

export function setzeAbgestimmt(stand: Stand): Stand {
  return { ...stand, gewichte: null };
}

export interface VergleichLage {
  plaetze: Platz<VergleichOption>[];
  /** die vorn liegenden Optionen */
  vorn: string[];
  /** Schlüssel des Satzes der Projektsteuerin: die Kennung der vorderen Option oder „gleichauf“ */
  satz: string;
  /** bei welcher anderen Stufe eines einzelnen Kriteriums die Spitze wechselt */
  kipp: Kipppunkt[];
}

export function vergleichLage(v: Vergleich, gew: Gewichte): VergleichLage {
  const plaetze = rangfolge(v.optionen, v.kriterien, gew);
  const vorn = spitze(v.optionen, v.kriterien, gew);
  return { plaetze, vorn, satz: vorn.length === 1 ? (vorn[0] ?? 'gleichauf') : 'gleichauf', kipp: kipppunkte(v.optionen, v.kriterien, gew, STUFEN_GEWICHT) };
}

/* -------------------------------------------------------------- Speichern -- */

const istPlatz = (x: unknown, n: number): x is number => typeof x === 'number' && Number.isInteger(x) && x >= 0 && x < n;

/** Liest einen gespeicherten Stand; Unpassendes fällt weg, Unlesbares oder ein älterer Stand ergibt null. */
export function leseStand(g: Geschichte, roh: unknown): Stand | null {
  if (typeof roh !== 'object' || roh === null) return null;
  const r = roh as Record<string, unknown>;
  if (r['v'] !== STAND_VERSION) return null;
  // P19.3: ein Stand mit Kennungen, die es in dieser Geschichte nicht gibt (alt: k1 … k8, neu: s1 … s14), ist ungültig – als Ganzes
  const genannt: string[] = [];
  for (const feld of ['wahlen', 'mini'] as const) {
    const t = r[feld];
    if (typeof t === 'object' && t !== null) genannt.push(...Object.keys(t));
  }
  const schr = r['schritt'] as Record<string, unknown> | undefined;
  if (schr && schr['ort'] === 'kapitel' && typeof schr['kapitel'] === 'string') genannt.push(schr['kapitel']);
  if (genannt.length > 0 && !genannt.some((id) => kapitel(g, id) !== null)) return null;
  const stand = neuerStand(r['kurz'] === true);
  if (typeof r['wahlen'] === 'object' && r['wahlen'] !== null) {
    for (const [id, p] of Object.entries(r['wahlen'] as Record<string, unknown>)) {
      const k = kapitel(g, id);
      if (k !== null && istPlatz(p, k.antworten.length)) stand.wahlen[id] = p;
    }
  }
  if (typeof r['mini'] === 'object' && r['mini'] !== null) {
    for (const [id, liste] of Object.entries(r['mini'] as Record<string, unknown>)) {
      const m = kapitel(g, id)?.mini ?? null;
      if (m === null || !Array.isArray(liste)) continue;
      if (miniArt(m.art)?.gueltig(m, liste) === true) stand.mini[id] = liste as number[];
    }
  }
  if (typeof r['gewichte'] === 'object' && r['gewichte'] !== null) {
    let s = stand;
    for (const [k, w] of Object.entries(r['gewichte'] as Record<string, unknown>)) if (typeof w === 'number') s = setzeGewicht(g, s, k, w);
    stand.gewichte = s.gewichte;
  }
  const sch = schr;
  if (sch && sch['ort'] === 'ende') return geheZu(g, stand, { ort: 'ende' });
  if (sch && sch['ort'] === 'pause' && typeof sch['akt'] === 'string') return geheZu(g, stand, { ort: 'pause', akt: sch['akt'] });
  if (sch && sch['ort'] === 'kapitel' && typeof sch['kapitel'] === 'string' && TEILE.includes(sch['teil'] as Teil)) {
    return geheZu(g, stand, { ort: 'kapitel', kapitel: sch['kapitel'], teil: sch['teil'] as Teil });
  }
  return stand;
}
