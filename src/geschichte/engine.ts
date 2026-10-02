/*
 * Ablauf der Story (P16.6, O-40) – rein, ohne DOM. Ein Stand hält nur, wo die Leserin oder der Leser
 * steht, was entschieden ist und welche Gewichte gelten; alles andere (Status, Empfehlung, Bedingungen)
 * wird daraus berechnet. Keine Freischaltung, kein Sperren: Jeder Schritt ist jederzeit erreichbar (L-184).
 */
import { spitze, begrenzeGewicht, type Gewichte } from './mcda.ts';
import { STATUS_SCHLUESSEL, type Geschichte, type Option, type Station, type StatusSchluessel } from './typen.ts';

export type Teil = 'lage' | 'vorlage' | 'folge';
export const TEILE: readonly Teil[] = ['lage', 'vorlage', 'folge'];

export type Schritt = { ort: 'prolog' } | { ort: 'station'; station: string; teil: Teil } | { ort: 'ende' };

export interface Stand {
  v: 1;
  schritt: Schritt;
  /** Station → gewählte Option */
  wahlen: Record<string, string>;
  /** selbst eingestellte Gewichte (null = die der gewählten Variante aus Station 1) */
  gewichte: Gewichte | null;
  /** Kurzfassung (nur die markierten Stationen) */
  kurz: boolean;
}

export type Status = Record<StatusSchluessel, number>;

export function neuerStand(kurz = false): Stand {
  return { v: 1, schritt: { ort: 'prolog' }, wahlen: {}, gewichte: null, kurz };
}

/** Stationen des gewählten Wegs (Kurzfassung: nur die markierten). */
export function wegStationen(g: Geschichte, kurz: boolean): Station[] {
  return g.stationen.filter((s) => !kurz || s.kurzfassung);
}

export function station(g: Geschichte, id: string): Station | null {
  return g.stationen.find((s) => s.id === id) ?? null;
}

/** Alle Schritte des Wegs in Reihenfolge. */
export function schritte(g: Geschichte, kurz: boolean): Schritt[] {
  const aus: Schritt[] = [{ ort: 'prolog' }];
  for (const s of wegStationen(g, kurz)) for (const teil of TEILE) aus.push({ ort: 'station', station: s.id, teil });
  aus.push({ ort: 'ende' });
  return aus;
}

export function gleicherSchritt(a: Schritt, b: Schritt): boolean {
  if (a.ort !== b.ort) return false;
  if (a.ort === 'station' && b.ort === 'station') return a.station === b.station && a.teil === b.teil;
  return true;
}

export function schrittIndex(g: Geschichte, stand: Stand): number {
  const alle = schritte(g, stand.kurz);
  const i = alle.findIndex((s) => gleicherSchritt(s, stand.schritt));
  return i < 0 ? 0 : i;
}

export function geheZu(g: Geschichte, stand: Stand, schritt: Schritt): Stand {
  const gibt = schritte(g, stand.kurz).some((s) => gleicherSchritt(s, schritt));
  return gibt ? { ...stand, schritt } : stand;
}

export function weiter(g: Geschichte, stand: Stand): Stand {
  const alle = schritte(g, stand.kurz);
  const i = schrittIndex(g, stand);
  return { ...stand, schritt: alle[Math.min(alle.length - 1, i + 1)] ?? stand.schritt };
}

export function zurueck(g: Geschichte, stand: Stand): Stand {
  const alle = schritte(g, stand.kurz);
  const i = schrittIndex(g, stand);
  return { ...stand, schritt: alle[Math.max(0, i - 1)] ?? stand.schritt };
}

/** Zwischen Lang- und Kurzfassung wechseln; liegt der Schritt nicht auf dem neuen Weg, geht es zur nächsten Station danach. */
export function setzeKurz(g: Geschichte, stand: Stand, kurz: boolean): Stand {
  if (stand.kurz === kurz) return stand;
  const neu = { ...stand, kurz };
  if (schritte(g, kurz).some((s) => gleicherSchritt(s, stand.schritt))) return neu;
  const hier = stand.schritt.ort === 'station' ? (station(g, stand.schritt.station)?.nr ?? 0) : 0;
  const naechste = wegStationen(g, kurz).find((s) => s.nr > hier);
  return { ...neu, schritt: naechste ? { ort: 'station', station: naechste.id, teil: 'lage' } : { ort: 'ende' } };
}

/* ------------------------------------------------------------ Gewichte -- */

/** Die Station, die die Gewichte festlegt (die erste mit Art „gewichte“). */
export function gewichteStation(g: Geschichte): Station | null {
  return g.stationen.find((s) => s.vorlage.art === 'gewichte') ?? null;
}

/** Geltende Gewichte: selbst eingestellt, sonst die der gewählten (oder empfohlenen) Variante. */
export function gewichte(g: Geschichte, stand: Stand): Gewichte {
  if (stand.gewichte !== null) return stand.gewichte;
  const st = gewichteStation(g);
  const id = st ? (stand.wahlen[st.id] ?? st.vorlage.empfehlung.option) : null;
  const o = st?.vorlage.optionen.find((x) => x.id === id);
  const aus: Gewichte = {};
  for (const k of g.kriterien) aus[k.id] = o?.gewichte?.[k.id] ?? 3;
  return aus;
}

export function setzeGewicht(g: Geschichte, stand: Stand, kriterium: string, wert: number): Stand {
  if (!g.kriterien.some((k) => k.id === kriterium)) return stand;
  return { ...stand, gewichte: { ...gewichte(g, stand), [kriterium]: begrenzeGewicht(wert) } };
}

/* ------------------------------------------------------- Entscheidungen -- */

/**
 * Die Option, die die Projektsteuerung vorn sieht: bei einer Gewichte-Vorlage die vorgeschlagene, sonst die
 * Spitze des gewichteten Vergleichs mit den geltenden Gewichten (bei Gleichstand die vorgeschlagene, wenn
 * sie dabei ist). Eine unvollständige Vorlage empfiehlt, was sie vorschlägt.
 */
export function empfohlen(g: Geschichte, stand: Stand, st: Station): string {
  const v = st.vorlage;
  if (v.art === 'gewichte' || v.unvollstaendigHtml !== null) return v.empfehlung.option;
  const vorn = spitze(v.optionen, g.kriterien, gewichte(g, stand));
  if (vorn.includes(v.empfehlung.option)) return v.empfehlung.option;
  return vorn[0] ?? v.empfehlung.option;
}

/** Gilt der vorbereitete Empfehlungstext? (Nur wenn die berechnete Empfehlung die vorgeschlagene ist.) */
export function empfehlungstextGilt(g: Geschichte, stand: Stand, st: Station): boolean {
  return empfohlen(g, stand, st) === st.vorlage.empfehlung.option;
}

export function waehle(g: Geschichte, stand: Stand, stationId: string, optionId: string): Stand {
  const st = station(g, stationId);
  if (st === null || !st.vorlage.optionen.some((o) => o.id === optionId)) return stand;
  const neu: Stand = { ...stand, wahlen: { ...stand.wahlen, [stationId]: optionId } };
  // Wer die Variante der Gewichte neu wählt, übernimmt ihre Gewichte (eigene Feineinstellung verfällt)
  if (st.vorlage.art === 'gewichte') neu.gewichte = null;
  return neu;
}

/** Was an dieser Station gilt: die Wahl, sonst – für Stationen außerhalb des Wegs – die Empfehlung. */
export function wahl(g: Geschichte, stand: Stand, st: Station): string | null {
  const w = stand.wahlen[st.id];
  if (w !== undefined) return w;
  if (stand.kurz && !st.kurzfassung) return empfohlen(g, stand, st);
  return null;
}

export function gewaehlteOption(g: Geschichte, stand: Stand, st: Station): Option | null {
  const id = wahl(g, stand, st);
  return st.vorlage.optionen.find((o) => o.id === id) ?? null;
}

/** Statusbedingung „puffer<0“, „kosten>61.3“, „offen>=1“ (R68: nur für Berichtszeilen und Vorgänge einer Station) */
export const STATUS_BEDINGUNG = /^(kosten|puffer|offen)(<=|>=|<|>)(-?\d+(?:\.\d+)?)$/u;

/**
 * Bedingung: Teile mit „&“ verknüpft, alle müssen gelten; null gilt immer. „s3=A“ / „s3!=A“ – ohne Wahl gilt keine
 * der beiden Formen; „kurz“ / „lang“ – der gewählte Weg; „puffer<0“ usw. – der Status bei der Lage der Station `bei`
 * (ohne `bei` gilt eine Statusbedingung nie).
 */
export function gilt(g: Geschichte, stand: Stand, wenn: string | null, bei: Station | null = null): boolean {
  if (wenn === null) return true;
  return wenn.split('&').every((roh) => {
    const teil = roh.trim();
    if (teil === 'kurz') return stand.kurz;
    if (teil === 'lang') return !stand.kurz;
    const sb = STATUS_BEDINGUNG.exec(teil);
    if (sb !== null) {
      if (bei === null) return false;
      const wert = status(g, stand, { ort: 'station', station: bei.id, teil: 'lage' })[sb[1] as StatusSchluessel];
      const grenze = Number(sb[3]);
      switch (sb[2]) {
        case '<': return wert < grenze;
        case '>': return wert > grenze;
        case '<=': return wert <= grenze;
        default: return wert >= grenze;
      }
    }
    const m = /^(s\d+)(!?=)([A-Z])$/u.exec(teil);
    if (m === null) return false;
    const st = station(g, m[1] ?? '');
    if (st === null) return false;
    const w = wahl(g, stand, st);
    if (w === null) return false;
    return m[2] === '=' ? w === m[3] : w !== m[3];
  });
}

/* --------------------------------------------------------------- Status -- */

function addiere(s: Status, f: Partial<Record<StatusSchluessel, number>>): void {
  for (const k of STATUS_SCHLUESSEL) s[k] += f[k] ?? 0;
}

/**
 * Status am Schritt: Startwerte, dazu die Lage-Folgen jeder erreichten Station und die Folgen jeder getroffenen
 * Entscheidung bis hierher. Stationen außerhalb des Wegs zählen mit ihrer Empfehlung, sobald der Weg sie
 * zeitlich überholt hat.
 */
export function status(g: Geschichte, stand: Stand, schritt: Schritt = stand.schritt): Status {
  const s: Status = { kosten: g.status.kosten.start, puffer: g.status.puffer.start, offen: g.status.offen.start };
  const bisNr = schritt.ort === 'prolog' ? 0 : schritt.ort === 'ende' ? Number.POSITIVE_INFINITY : (station(g, schritt.station)?.nr ?? 0);
  for (const st of g.stationen) {
    if (st.nr > bisNr) break;
    addiere(s, st.lageFolgen);
    for (const b of st.lageFolgenBedingt) if (gilt(g, stand, b.wenn)) addiere(s, b.folgen);
    const o = gewaehlteOption(g, stand, st);
    // die eigene Entscheidung zählt ab der Folge, nicht schon beim Lesen der Vorlage
    if (st.nr === bisNr && schritt.ort === 'station' && schritt.teil !== 'folge') continue;
    if (o !== null) addiere(s, o.folgen);
  }
  s.kosten = Math.round(s.kosten * 100) / 100;
  return s;
}

export type PufferUrteil = 'gut' | 'knapp' | 'schlecht';
export function pufferUrteil(puffer: number): PufferUrteil {
  return puffer > 7 ? 'gut' : puffer >= 0 ? 'knapp' : 'schlecht';
}

/** Stationen des Wegs, an denen noch nicht entschieden ist. */
export function offeneStationen(g: Geschichte, stand: Stand): Station[] {
  return wegStationen(g, stand.kurz).filter((st) => stand.wahlen[st.id] === undefined);
}

/* ---------------------------------------------------------- Speichern -- */

/** Liest einen gespeicherten Stand; Unpassendes fällt weg, Unlesbares ergibt null. */
export function leseStand(g: Geschichte, roh: unknown): Stand | null {
  if (typeof roh !== 'object' || roh === null) return null;
  const r = roh as Record<string, unknown>;
  if (r['v'] !== 1) return null;
  const kurz = r['kurz'] === true;
  const wahlen: Record<string, string> = {};
  if (typeof r['wahlen'] === 'object' && r['wahlen'] !== null) {
    for (const [k, v] of Object.entries(r['wahlen'] as Record<string, unknown>)) {
      const st = station(g, k);
      if (st !== null && typeof v === 'string' && st.vorlage.optionen.some((o) => o.id === v)) wahlen[k] = v;
    }
  }
  let gew: Gewichte | null = null;
  if (typeof r['gewichte'] === 'object' && r['gewichte'] !== null) {
    const q = r['gewichte'] as Record<string, unknown>;
    if (g.kriterien.every((k) => typeof q[k.id] === 'number')) {
      gew = {};
      for (const k of g.kriterien) gew[k.id] = begrenzeGewicht(q[k.id] as number);
    }
  }
  const stand: Stand = { v: 1, schritt: { ort: 'prolog' }, wahlen, gewichte: gew, kurz };
  const s = r['schritt'] as Record<string, unknown> | undefined;
  if (s && (s['ort'] === 'prolog' || s['ort'] === 'ende')) stand.schritt = { ort: s['ort'] };
  else if (s && s['ort'] === 'station' && typeof s['station'] === 'string' && TEILE.includes(s['teil'] as Teil)) {
    return geheZu(g, stand, { ort: 'station', station: s['station'], teil: s['teil'] as Teil });
  }
  return stand;
}
