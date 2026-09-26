/*
 * Anzeige-Logik ohne DOM: was die Flächen aus Zustand und Inhalten ablesen.
 *
 * Alles hier ist rein und wird in tests/ui-anzeige.test.ts geprüft. Die Zeichenfunktionen
 * (src/ui/flaechen/…) fragen nur ab, sie rechnen nicht selbst – so zeichnen Story-Fenster, Regie-
 * Vorschau und Leinwand aus demselben Zustand dasselbe Bild.
 */

import type { Aktion, OeffentlicherZustand, Status, StatusSchluessel, Stufe } from '../engine/typen.ts';
import type { Block, KopfWert, OeffentlicheInhalte, Schritt, Station } from '../inhalte/typen.ts';
import { naechsteStation, schritteFuer } from '../engine/graph.ts';
import { STATUS_BESCHRIFTUNG, STATUS_SCHLUESSEL, STUFEN, wortEntscheidungsfaehigkeit } from '../engine/status.ts';

/* ------------------------------------------------------------------ Rollen -- */

/** Rollen-Kennungen der Inhalte → Attributwert `data-rolle` des Stils (docs/STIL.md). */
export type RollenAttr = 'gf' | 'bh' | 'pl' | 'ps' | 'plan' | 'ctl';

const ROLLEN_ATTR: Readonly<Record<string, RollenAttr>> = {
  gf: 'gf',
  bauherr: 'bh',
  pl: 'pl',
  ps: 'ps',
  planung: 'plan',
  controlling: 'ctl',
};

export function rollenAttr(rolle: string | null | undefined): RollenAttr | null {
  if (rolle === null || rolle === undefined) return null;
  return ROLLEN_ATTR[rolle] ?? null;
}

/* ------------------------------------------------------------ Kopfdaten -- */

export function kopfText(kopf: Readonly<Record<string, KopfWert>>, name: string): string | null {
  const w = kopf[name];
  if (typeof w === 'string') return w;
  if (typeof w === 'number') return String(w);
  return null;
}

export function kopfZahl(kopf: Readonly<Record<string, KopfWert>>, name: string): number | null {
  const w = kopf[name];
  if (typeof w === 'number' && Number.isFinite(w)) return w;
  if (typeof w === 'string' && /^-?\d+(?:[.,]\d+)?$/.test(w.trim())) return Number(w.replace(',', '.'));
  return null;
}

export function kopfListe(kopf: Readonly<Record<string, KopfWert>>, name: string): KopfWert[] {
  const w = kopf[name];
  return Array.isArray(w) ? w : [];
}

export function kopfKarte(kopf: Readonly<Record<string, KopfWert>>, name: string): Record<string, KopfWert> {
  const w = kopf[name];
  return w !== null && typeof w === 'object' && !Array.isArray(w) ? w : {};
}

export function istKarte(w: KopfWert | undefined): w is Record<string, KopfWert> {
  return w !== null && w !== undefined && typeof w === 'object' && !Array.isArray(w);
}

/** Alle Blöcke (auch verschachtelte) einer Liste, in Dokumentreihenfolge. */
export function alleBloecke(bloecke: readonly Block[]): Block[] {
  const aus: Block[] = [];
  const gehe = (liste: readonly Block[]): void => {
    for (const b of liste) {
      aus.push(b);
      gehe(b.kinder);
    }
  };
  gehe(bloecke);
  return aus;
}

/* ------------------------------------------------------------- Schritte -- */

/** Die Schritte einer Station, wie die gespielte Rolle sie sieht (Engine-Regel, mit Inhaltstypen). */
export function sichtbareSchritte(st: Station, rolle: string | null): Schritt[] {
  const ids = new Set(schritteFuer(st, rolle).map((s) => s.id));
  return st.schritte.filter((s) => ids.has(s.id));
}

export function aktuelleStation(z: Pick<OeffentlicherZustand, 'station'>, inhalte: OeffentlicheInhalte): Station | null {
  return z.station === null ? null : inhalte.stationen[z.station] ?? null;
}

export function aktuellerSchritt(z: Pick<OeffentlicherZustand, 'station' | 'schritt' | 'rolle'>, inhalte: OeffentlicheInhalte): Schritt | null {
  const st = aktuelleStation(z, inhalte);
  if (st === null) return null;
  return sichtbareSchritte(st, z.rolle)[z.schritt] ?? null;
}

export interface SchrittGruppe {
  /** Gruppenname aus den Inhalten oder null (Einzelschritt) */
  gruppe: string | null;
  /** kurze Beschriftung für Fortschritt und Karte */
  kurz: string;
  /** Indizes in den sichtbaren Schritten */
  indizes: number[];
}

/** Aufeinanderfolgende Schritte mit gleicher `gruppe` werden ein Fortschrittsschritt mit Takten. */
export function gruppiere(schritte: readonly Schritt[]): SchrittGruppe[] {
  const aus: SchrittGruppe[] = [];
  schritte.forEach((s, i) => {
    const letzte = aus[aus.length - 1];
    if (s.gruppe !== null && letzte !== undefined && letzte.gruppe === s.gruppe) {
      letzte.indizes.push(i);
      return;
    }
    const kurz = s.gruppe !== null ? (s.gruppe.split(' · ')[0] ?? s.gruppe) : (s.kurz || s.titel);
    aus.push({ gruppe: s.gruppe, kurz, indizes: [i] });
  });
  return aus;
}

/** Position eines Schritts: Nummer der Gruppe (ab 1), Takt in der Gruppe (ab 1), Taktzahl. */
export function schrittPosition(schritte: readonly Schritt[], index: number): { nr: number; takt: number; takte: number; gruppe: SchrittGruppe | null } {
  const gruppen = gruppiere(schritte);
  for (let g = 0; g < gruppen.length; g += 1) {
    const gr = gruppen[g] as SchrittGruppe;
    const t = gr.indizes.indexOf(index);
    if (t >= 0) return { nr: g + 1, takt: t + 1, takte: gr.indizes.length, gruppe: gr };
  }
  return { nr: 0, takt: 0, takte: 0, gruppe: null };
}

/** Zeile über dem Tafeltitel: „Schritt 2 · Was Sie wissen“ bzw. „Schritt 1 · 3/6 Mandat“. */
export function kicker(schritte: readonly Schritt[], index: number): string {
  const s = schritte[index];
  if (s === undefined) return '';
  const p = schrittPosition(schritte, index);
  const kurz = s.kurz || s.titel;
  return p.takte > 1 ? `Schritt ${p.nr} · ${p.takt}/${p.takte} ${kurz}` : `Schritt ${p.nr} · ${kurz}`;
}

/** Tafeltitel: bei Gruppen der Gruppenname (wie im Prototyp), sonst der Schritttitel. */
export function tafelTitel(schritte: readonly Schritt[], index: number): string {
  const s = schritte[index];
  if (s === undefined) return '';
  return s.gruppe ?? s.titel;
}

/* --------------------------------------------------------------- Welten -- */

export type AnzeigeWelt = 'a' | 'b' | 'ab';

/** Welt der Lagetafel: A, B oder der Vergleich (AB); der Prolog ist weltneutral (null). */
export function tafelWelt(st: Station | null): AnzeigeWelt | null {
  if (st === null) return null;
  if (st.welt === 'A') return 'a';
  if (st.welt === 'B') return 'b';
  if (st.vergleich !== null) return 'ab';
  return null;
}

/** Welt der Statusinstrumente: die angezeigte Welt (am Vergleich folgt sie dem Regler). */
export function instrumentWelt(z: Pick<OeffentlicherZustand, 'welt'>): 'A' | 'B' {
  return z.welt;
}

/** Status der angezeigten Welt; fällt auf die andere Welt zurück, solange eine keinen Stand hat. */
export function anzeigeStatus(z: Pick<OeffentlicherZustand, 'welt' | 'status'>): Status | null {
  return z.status[z.welt] ?? z.status[z.welt === 'A' ? 'B' : 'A'] ?? null;
}

/* ------------------------------------------------ Schrittweiser Aufbau (L-4) -- */

/** Statusinstrumente: ab dem ersten Entscheidungsschritt (und danach in jeder Welt-B- oder Vergleichsstation). */
export function instrumenteSichtbar(z: OeffentlicherZustand, inhalte: OeffentlicheInhalte): boolean {
  const st = aktuelleStation(z, inhalte);
  if (st === null || z.bereich !== 'story') return false;
  if (z.spur.length > 0) return true;
  if (st.welt === 'B' || st.vergleich !== null) return true;
  const s = aktuellerSchritt(z, inhalte);
  return s !== null && (s.art === 'entscheidung' || s.art === 'konsequenz');
}

/** Story-Karte: nach dem Einstieg der ersten Station hinter dem Prolog. */
export function karteSichtbar(z: OeffentlicherZustand, inhalte: OeffentlicheInhalte): boolean {
  if (z.station === null || z.station === inhalte.start || z.bereich !== 'story') return false;
  return z.verlauf.length > 2 || (z.verlauf.length === 2 && z.schritt > 0);
}

/* -------------------------------------------------------- Weiter / Zurück -- */

/**
 * Die Aktion hinter „Weiter“ (Knopf, Pfeiltaste, Regie) – oder null, wenn es gerade nicht weitergeht
 * (Rolle fehlt, Entscheidung fehlt, Ende). Im Ebenen-Schritt blättert „Weiter“ durch die Ebenen 1–4.
 */
export function weiterAktion(z: OeffentlicherZustand, inhalte: OeffentlicheInhalte): Aktion | null {
  if (z.station === null) return { art: 'starteStory' };
  const st = aktuelleStation(z, inhalte);
  if (st === null) return null;
  const schritte = sichtbareSchritte(st, z.rolle);
  const s = schritte[z.schritt];
  if (s !== undefined) {
    if (s.art === 'ebenen') {
      const e = Math.max(1, z.ebene);
      if (e < 4) return { art: 'setzeEbene', ebene: e + 1 };
    }
    if (s.art === 'rollenwahl' && z.rolle === null) return null;
    if (s.art === 'entscheidung') {
      const ent = z.rolle !== null ? st.szenen[z.rolle]?.entscheidung ?? null : null;
      if (ent !== null && z.entscheidungen[ent.id] === undefined) return null;
    }
  }
  if (z.schritt < schritte.length - 1) return { art: 'weiter' };
  if (st.ende) return null;
  const ziel = naechsteStation(st, z, inhalte);
  if (ziel === null) return null;
  const zielStation = inhalte.stationen[ziel];
  if (zielStation?.welt === 'B' && !z.freigeschaltet.weltB && !zielStation.schaltetFrei.includes('weltB')) return null;
  return { art: 'weiter' };
}

/** Die Aktion hinter „Zurück“; im Ebenen-Schritt zuerst eine Ebene zurück. */
export function zurueckAktion(z: OeffentlicherZustand, inhalte: OeffentlicheInhalte): Aktion | null {
  const st = aktuelleStation(z, inhalte);
  if (st === null) return null;
  const s = sichtbareSchritte(st, z.rolle)[z.schritt];
  if (s?.art === 'ebenen' && z.ebene > 1) return { art: 'setzeEbene', ebene: z.ebene - 1 };
  if (z.schritt > 0 || z.verlauf.length >= 2) return { art: 'zurueck' };
  return null;
}

/* ---------------------------------------------------------- Instrumente -- */

export type StatusStufe = 'ok' | 'mittel' | 'kritisch' | 'neutral';

export interface InstrumentWert {
  schluessel: StatusSchluessel;
  label: string;
  grafik: 'zeiger' | 'balken' | 'punkte' | 'stufen';
  /** Zahl (Zähler) oder Stufenindex */
  zahl: number;
  /** angezeigter Wert als Wort bzw. Zahl */
  wort: string;
  /** Wortform (bei Zeiger: niedrig/mittel/hoch) */
  zusatz: string | null;
  stufe: StatusStufe;
  hinweis: string | null;
  /** Punkte: Anzahl und Spalten */
  punkte?: { anzahl: number; spalten: number };
}

function stufeVonStufe(s: Stufe): StatusStufe {
  if (s === 'niedrig') return 'ok';
  if (s === 'mittel') return 'mittel';
  return 'kritisch';
}

/** Die fünf Instrumente (Reihenfolge des Prototyps). */
export function instrumentWerte(s: Readonly<Status>): InstrumentWert[] {
  const hinweis = (k: StatusSchluessel): string | null => s.hinweise[k] ?? null;
  const ef = s.entscheidungsfaehigkeit;
  return [
    {
      schluessel: 'entscheidungsfaehigkeit',
      label: STATUS_BESCHRIFTUNG.entscheidungsfaehigkeit,
      grafik: 'zeiger',
      zahl: ef,
      wort: String(ef),
      zusatz: wortEntscheidungsfaehigkeit(ef),
      stufe: ef <= 2 ? 'kritisch' : ef === 3 ? 'mittel' : 'ok',
      hinweis: hinweis('entscheidungsfaehigkeit'),
    },
    {
      schluessel: 'kostenunsicherheit',
      label: STATUS_BESCHRIFTUNG.kostenunsicherheit,
      grafik: 'balken',
      zahl: STUFEN.indexOf(s.kostenunsicherheit),
      wort: s.kostenunsicherheit,
      zusatz: null,
      stufe: stufeVonStufe(s.kostenunsicherheit),
      hinweis: hinweis('kostenunsicherheit'),
    },
    {
      schluessel: 'offeneRisiken',
      label: STATUS_BESCHRIFTUNG.offeneRisiken,
      grafik: 'punkte',
      zahl: s.offeneRisiken,
      wort: String(s.offeneRisiken),
      zusatz: null,
      stufe: 'neutral',
      hinweis: hinweis('offeneRisiken'),
      punkte: { anzahl: 10, spalten: 5 },
    },
    {
      schluessel: 'ungeklaerteEntscheidungen',
      label: STATUS_BESCHRIFTUNG.ungeklaerteEntscheidungen,
      grafik: 'punkte',
      zahl: s.ungeklaerteEntscheidungen,
      wort: String(s.ungeklaerteEntscheidungen),
      zusatz: null,
      stufe: 'neutral',
      hinweis: hinweis('ungeklaerteEntscheidungen'),
      punkte: { anzahl: 6, spalten: 3 },
    },
    {
      schluessel: 'terminrisiko',
      label: STATUS_BESCHRIFTUNG.terminrisiko,
      grafik: 'stufen',
      zahl: STUFEN.indexOf(s.terminrisiko),
      wort: s.terminrisiko,
      zusatz: null,
      stufe: stufeVonStufe(s.terminrisiko),
      hinweis: hinweis('terminrisiko'),
    },
  ];
}

/** Wert eines Instruments als Text (Screenreader, Ansagen, Vergleichstabelle). */
export function statusWort(s: Readonly<Status>, k: StatusSchluessel): string {
  switch (k) {
    case 'entscheidungsfaehigkeit':
      return `${s.entscheidungsfaehigkeit} von 5`;
    case 'kostenunsicherheit':
      return s.kostenunsicherheit;
    case 'terminrisiko':
      return s.terminrisiko;
    default:
      return String(s[k]);
  }
}

function rang(s: Readonly<Status>, k: StatusSchluessel): number {
  if (k === 'kostenunsicherheit' || k === 'terminrisiko') return STUFEN.indexOf(s[k]);
  return s[k];
}

/** Trendpfeil: gut/schlecht aus Sicht der Steuerbarkeit (mehr Entscheidungsfähigkeit = gut). */
export function trend(k: StatusSchluessel, vorher: Readonly<Status> | null, nachher: Readonly<Status>): 'gut' | 'schlecht' | null {
  if (vorher === null) return null;
  const a = rang(vorher, k);
  const b = rang(nachher, k);
  if (a === b) return null;
  const hoch = b > a;
  const gut = k === 'entscheidungsfaehigkeit' ? hoch : !hoch;
  return gut ? 'gut' : 'schlecht';
}

/** Änderungen zwischen zwei Ständen als Sätze („Ungeklärte Entscheidungen 3 → 4“). */
export function aenderungsSaetze(vorher: Readonly<Status> | null, nachher: Readonly<Status> | null): { schluessel: StatusSchluessel; text: string; richtung: 'gut' | 'schlecht' }[] {
  if (vorher === null || nachher === null) return [];
  const aus: { schluessel: StatusSchluessel; text: string; richtung: 'gut' | 'schlecht' }[] = [];
  for (const k of STATUS_SCHLUESSEL) {
    const t = trend(k, vorher, nachher);
    if (t === null) continue;
    const zahl = k === 'offeneRisiken' || k === 'ungeklaerteEntscheidungen';
    aus.push({
      schluessel: k,
      text: zahl ? `${STATUS_BESCHRIFTUNG[k]} ${statusWort(vorher, k)} → ${statusWort(nachher, k)}` : `${STATUS_BESCHRIFTUNG[k]} → ${statusWort(nachher, k)}`,
      richtung: t,
    });
  }
  return aus;
}

/* ----------------------------------------------------------------- Uhr -- */

const WOCHENTAG: Readonly<Record<string, string>> = {
  Montag: 'Mo', Dienstag: 'Di', Mittwoch: 'Mi', Donnerstag: 'Do', Freitag: 'Fr', Samstag: 'Sa', Sonntag: 'So',
};

function zeitAus(text: string | null | undefined): string | null {
  return /(\d{1,2}:\d{2})/.exec(text ?? '')?.[1] ?? null;
}

/** Die Tagesuhr der Lagetafel: Tag (kurz, mit Monat) und Uhrzeit; nach einem Zeitsprung dessen Dauer. */
export function uhrAnzeige(
  st: Station,
  z: Pick<OeffentlicherZustand, 'info'>,
  inhalte: OeffentlicheInhalte,
): { tag: string; zeit: string | null; gesprungen: boolean } | null {
  let uhr = st.uhr;
  if (uhr === null && st.vergleich !== null) uhr = inhalte.stationen[st.vergleich.a]?.uhr ?? null;
  if (uhr === null) return null;
  let zeit = zeitAus(uhr);
  if (zeit === null && st.partner !== null) zeit = zeitAus(inhalte.stationen[st.partner]?.uhr);
  const ohneZeit = uhr.replace(/,?\s*\d{1,2}:\d{2}(?:\s*Uhr)?/, '').trim();
  let tag = WOCHENTAG[ohneZeit] ?? ohneZeit;
  if (WOCHENTAG[ohneZeit] !== undefined && st.monat !== null) tag = `${tag} · Monat ${st.monat}`;
  // Zeitsprung: die angeforderte Information verschiebt die Uhr (Anzeige wie im Prototyp).
  for (const info of st.infos) {
    if (!z.info.includes(`${st.id}/${info.id}`)) continue;
    const block = alleBloecke(st.schritte.flatMap((s) => s.bloecke)).find((b) => b.art === 'zeitsprung' && b.id === info.id);
    const dauer = block !== undefined ? kopfText(block.kopf, 'dauer') : null;
    if (dauer !== null) return { tag: dauer, zeit, gesprungen: true };
  }
  return { tag, zeit, gesprungen: false };
}

const ZAHLWOERTER: Readonly<Record<string, number>> = {
  ein: 1, eine: 1, einen: 1, zwei: 2, drei: 3, vier: 4, 'fünf': 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10,
};

/** Tage aus einer Dauer („Zwei Wochen später“ → 14, „3 Tage“ → 3); null, wenn nicht lesbar. */
export function tageAus(text: string): number | null {
  const m = /(\d+|[a-zäöüß]+)\s+(tage?n?|wochen?|monate?)\b/iu.exec(text);
  if (!m) return null;
  const roh = (m[1] ?? '').toLowerCase();
  const n = /^\d+$/.test(roh) ? Number(roh) : ZAHLWOERTER[roh];
  if (n === undefined || !Number.isFinite(n)) return null;
  const einheit = (m[2] ?? '').toLowerCase();
  const faktor = einheit.startsWith('woche') ? 7 : einheit.startsWith('monat') ? 30 : 1;
  return n * faktor;
}

/* --------------------------------------------------------------- Ansicht -- */

/** Schlüssel einer Anzeige-Wahl (z. B. Mandatsleiter-Option) im Zustandsfeld `ansicht`. */
export function ansichtSchluessel(station: string, schritt: string): string {
  return `${station}/${schritt}`;
}

/** Die angezeigte Option eines Mandatsleiter-Schritts (Vorgabe: die erste). */
export function mandatsWahl(z: Pick<OeffentlicherZustand, 'ansicht'>, station: string, schritt: Schritt): string | null {
  const optionen = schritt.bloecke.filter((b) => b.art === 'mandatsoption' && b.id !== null).map((b) => b.id as string);
  const gewaehlt = z.ansicht[ansichtSchluessel(station, schritt.id)];
  if (gewaehlt !== undefined && optionen.includes(gewaehlt)) return gewaehlt;
  return optionen[0] ?? null;
}

/* ------------------------------------------------------ Regie-Eingriffe -- */

export interface Eingriff {
  /** Beschriftung des Regie-Knopfs */
  beschriftung: string;
  aktion: Aktion;
  /** aktuell gewählt/gedrückt */
  gedrueckt: boolean;
  /** Test-Haken */
  pruef: string;
}

/**
 * Was die Regie am aktuellen Schritt für den Kunden anklicken kann (Kundenwahl A–D, Rolle, Information,
 * Welt A/B, Mandatsoption, Einschätzung, Ebene). Zeitstempel ergänzt der Aufrufer.
 */
export function eingriffe(z: OeffentlicherZustand, inhalte: OeffentlicheInhalte): Eingriff[] {
  const st = aktuelleStation(z, inhalte);
  if (st === null || z.bereich !== 'story') return [];
  const s = aktuellerSchritt(z, inhalte);
  if (s === null) return [];
  const aus: Eingriff[] = [];
  const szene = z.rolle !== null ? st.szenen[z.rolle] ?? null : null;
  switch (s.art) {
    case 'rollenwahl':
      for (const id of inhalte.rollenFolge) {
        const r = inhalte.rollen[id];
        if (r === undefined || !r.spielbar) continue;
        aus.push({ beschriftung: r.kurztitel, aktion: { art: 'waehleRolle', rolle: id }, gedrueckt: z.rolle === id, pruef: `regie-rolle-${id}` });
      }
      break;
    case 'interessenwahl':
      for (const i of inhalte.interessen) {
        const an = z.interessen.includes(i.id);
        const neu = an ? z.interessen.filter((x) => x !== i.id) : [...z.interessen, i.id];
        aus.push({ beschriftung: i.titel, aktion: { art: 'setzeInteressen', interessen: neu }, gedrueckt: an, pruef: `regie-interesse-${i.id}` });
      }
      break;
    case 'entscheidung':
    case 'konsequenz':
      for (const o of szene?.entscheidung?.optionen ?? []) {
        aus.push({
          beschriftung: `${o.id} · ${o.kurz}`,
          aktion: { art: 'waehle', option: o.id },
          gedrueckt: z.entscheidungen[szene?.entscheidung?.id ?? ''] === o.id,
          pruef: `regie-wahl-${o.id}`,
        });
      }
      break;
    case 'vergleich':
      aus.push({ beschriftung: 'Welt A', aktion: { art: 'setzeVergleich', wert: 0 }, gedrueckt: z.vergleich < 0.5, pruef: 'regie-welt-a' });
      aus.push({ beschriftung: 'Welt B', aktion: { art: 'setzeVergleich', wert: 1 }, gedrueckt: z.vergleich >= 0.5, pruef: 'regie-welt-b' });
      break;
    case 'ebenen':
      for (let e = 1; e <= 4; e += 1) {
        aus.push({ beschriftung: `Ebene ${e}`, aktion: { art: 'setzeEbene', ebene: e }, gedrueckt: Math.max(1, z.ebene) === e, pruef: `regie-ebene-${e}` });
      }
      break;
    default:
      break;
  }
  // Informationen anfordern (Zeitsprung) in diesem Schritt
  for (const b of alleBloecke(s.bloecke)) {
    if (b.art !== 'zeitsprung' || b.id === null) continue;
    const angefordert = z.info.includes(`${st.id}/${b.id}`);
    aus.push({ beschriftung: kopfText(b.kopf, 'knopf') ?? b.id, aktion: { art: 'fordereInfo', info: b.id }, gedrueckt: angefordert, pruef: `regie-info-${b.id}` });
  }
  // Anzeige-Wahl am Mandatsleiter
  const wahl = mandatsWahl(z, st.id, s);
  for (const b of s.bloecke) {
    if (b.art !== 'mandatsoption' || b.id === null) continue;
    aus.push({
      beschriftung: `Option ${b.id} · ${kopfText(b.kopf, 'titel') ?? ''}`.trim(),
      aktion: { art: 'zeige', schluessel: ansichtSchluessel(st.id, s.id), wert: b.id },
      gedrueckt: wahl === b.id,
      pruef: `regie-mandat-${b.id}`,
    });
  }
  // Fragen der Rollenszene in diesem Schritt (z. B. „Ist ENT-017 entscheidungsreif?“)
  for (const f of szene?.fragen ?? []) {
    if (f.schritt !== s.id) continue;
    for (const a of f.antworten) {
      aus.push({
        beschriftung: a.titel,
        aktion: { art: 'antworte', frage: f.id, antwort: a.id },
        gedrueckt: z.antworten[`${st.id}/${z.rolle ?? ''}/${f.id}`] === a.id,
        pruef: `regie-antwort-${a.id}`,
      });
    }
  }
  return aus;
}
