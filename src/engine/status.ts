/*
 * Statusbereich: Werte, Wirkungen, Neuberechnung aus dem Verlauf.
 *
 * Warum Neuberechnung statt fortlaufender Änderung: Eine Wahl lässt sich in der Konsequenz noch
 * umentscheiden, und die Regie springt zwischen Stationen. Würde der Reducer Wirkungen nur
 * aufaddieren, stünden nach „A, dann doch D“ beide Wirkungen im Status. `berechneStatus` spielt den
 * Verlauf jedes Mal von vorn ab – deterministisch und ohne versteckten Rest.
 */

import type {
  Ergebnis, ModellStation, Status, StatusSchluessel, Stufe, StoryModell, WirkEintrag, Zustand,
} from './typen.ts';

export const STUFEN: readonly Stufe[] = ['niedrig', 'mittel', 'hoch', 'sehr hoch'];

export const STATUS_SCHLUESSEL: readonly StatusSchluessel[] = [
  'entscheidungsfaehigkeit',
  'kostenunsicherheit',
  'offeneRisiken',
  'ungeklaerteEntscheidungen',
  'terminrisiko',
];

/** Sichtbare Namen der Instrumente. */
export const STATUS_BESCHRIFTUNG: Readonly<Record<StatusSchluessel, string>> = {
  entscheidungsfaehigkeit: 'Entscheidungsfähigkeit',
  kostenunsicherheit: 'Kostenunsicherheit',
  // Risiko-Status laut Kap. 6.4.4: aktiv · beobachtet · gemindert · geschlossen („offen“ gibt es nur bei Entscheidungen).
  offeneRisiken: 'Aktive Risiken',
  ungeklaerteEntscheidungen: 'Ungeklärte Entscheidungen',
  terminrisiko: 'Terminrisiko',
};

/** Schreibweisen in den Inhaltsdateien (kebab-case) → Schlüssel. camelCase wird ebenfalls angenommen. */
const SCHLUESSEL_AUS_TEXT: Readonly<Record<string, StatusSchluessel>> = {
  'entscheidungsfaehigkeit': 'entscheidungsfaehigkeit',
  'kostenunsicherheit': 'kostenunsicherheit',
  'offene-risiken': 'offeneRisiken',
  'offeneRisiken': 'offeneRisiken',
  'ungeklaerte-entscheidungen': 'ungeklaerteEntscheidungen',
  'ungeklaerteEntscheidungen': 'ungeklaerteEntscheidungen',
  'terminrisiko': 'terminrisiko',
};

/** Ausgangspunkt, wenn eine Wirkung auf eine Welt ohne gesetzten Stand trifft. */
export const STATUS_NEUTRAL: Readonly<Status> = Object.freeze({
  entscheidungsfaehigkeit: 3,
  kostenunsicherheit: 'mittel',
  offeneRisiken: 0,
  ungeklaerteEntscheidungen: 0,
  terminrisiko: 'mittel',
  hinweise: {},
});

export function istStufe(x: unknown): x is Stufe {
  return typeof x === 'string' && (STUFEN as readonly string[]).includes(x);
}

export function istStufenSchluessel(s: StatusSchluessel): boolean {
  return s === 'kostenunsicherheit' || s === 'terminrisiko';
}

export function leseStatusSchluessel(text: string): StatusSchluessel | null {
  return SCHLUESSEL_AUS_TEXT[text.trim()] ?? null;
}

function begrenze(schluessel: StatusSchluessel, wert: number): number {
  if (schluessel === 'entscheidungsfaehigkeit') return Math.min(5, Math.max(0, Math.round(wert)));
  return Math.max(0, Math.round(wert));
}

function kopiere(s: Readonly<Status>): Status {
  return { ...s, hinweise: { ...s.hinweise } };
}

/** Wendet Wirkungen in Reihenfolge an. Ohne Ausgangsstand beginnt sie bei STATUS_NEUTRAL. */
export function wendeWirkung(s: Readonly<Status> | null, wirkung: readonly WirkEintrag[]): Status {
  const neu = kopiere(s ?? STATUS_NEUTRAL);
  for (const w of wirkung) {
    if (istStufenSchluessel(w.schluessel)) {
      const k = w.schluessel as 'kostenunsicherheit' | 'terminrisiko';
      if (w.art === 'setze' && istStufe(w.wert)) {
        neu[k] = w.wert;
      } else if (w.art === 'aendere' && typeof w.wert === 'number') {
        const i = Math.min(STUFEN.length - 1, Math.max(0, STUFEN.indexOf(neu[k]) + Math.round(w.wert)));
        neu[k] = STUFEN[i] ?? neu[k];
      }
    } else if (typeof w.wert === 'number') {
      const k = w.schluessel as 'entscheidungsfaehigkeit' | 'offeneRisiken' | 'ungeklaerteEntscheidungen';
      neu[k] = begrenze(k, w.art === 'setze' ? w.wert : neu[k] + w.wert);
    }
    if (w.hinweis === null) delete neu.hinweise[w.schluessel];
    else neu.hinweise[w.schluessel] = w.hinweis;
  }
  return neu;
}

/**
 * Liest einen Statuswert aus Inhaltstext: `4`, `"+1"`, `-1`, `sehr hoch`, `7 (1 neu bewertet)`.
 * Wird vom Inhaltswerkzeug benutzt; hier, damit Engine und Werkzeug dieselbe Lesart haben.
 */
export function leseWirkEintrag(schluesselText: string, wertText: string): Ergebnis<WirkEintrag> {
  const schluessel = leseStatusSchluessel(schluesselText);
  if (schluessel === null) {
    return { ok: false, fehler: `unbekannter Statuswert „${schluesselText}“ (erlaubt: entscheidungsfaehigkeit, kostenunsicherheit, offene-risiken, ungeklaerte-entscheidungen, terminrisiko)` };
  }
  const m = /^\s*(.*?)\s*(?:\(([^()]*)\))?\s*$/u.exec(wertText);
  const kern = (m?.[1] ?? '').trim();
  const hinweis = m?.[2] !== undefined && m[2].trim() !== '' ? m[2].trim() : null;
  if (kern === '') return { ok: false, fehler: `Statuswert ${schluesselText} ist leer` };
  const zahl = /^([+-]?)(\d+)$/u.exec(kern);
  if (zahl) {
    const betrag = Number(zahl[2]);
    const vorzeichen = zahl[1] ?? '';
    if (vorzeichen !== '') {
      return { ok: true, wert: { schluessel, art: 'aendere', wert: vorzeichen === '-' ? -betrag : betrag, hinweis } };
    }
    if (istStufenSchluessel(schluessel)) {
      return { ok: false, fehler: `${schluesselText} braucht eine Stufe (${STUFEN.join(', ')}) oder eine Änderung wie "+1", nicht ${kern}` };
    }
    if (schluessel === 'entscheidungsfaehigkeit' && betrag > 5) {
      return { ok: false, fehler: `entscheidungsfaehigkeit liegt zwischen 0 und 5, nicht ${betrag}` };
    }
    return { ok: true, wert: { schluessel, art: 'setze', wert: betrag, hinweis } };
  }
  if (istStufenSchluessel(schluessel)) {
    if (istStufe(kern)) return { ok: true, wert: { schluessel, art: 'setze', wert: kern, hinweis } };
    return { ok: false, fehler: `${schluesselText}: „${kern}“ ist keine Stufe (${STUFEN.join(', ')})` };
  }
  return { ok: false, fehler: `${schluesselText}: „${kern}“ ist keine Zahl` };
}

/** Prüft, ob eine Wirkung alle fünf Werte setzt (Pflicht für `status-start`). */
export function istVollstaendigerStart(wirkung: readonly WirkEintrag[]): boolean {
  return STATUS_SCHLUESSEL.every((k) => wirkung.some((w) => w.schluessel === k && w.art === 'setze'));
}

/** Der Teil des Zustands, den die Neuberechnung liest. */
export type StatusQuelle = Pick<Zustand, 'verlauf' | 'rolle' | 'entscheidungen' | 'info'>;

/** Zahlenwert eines Statuswerts (Stufen als Index 0–3), für das Spur-Delta. */
function zahl(s: Readonly<Status>, k: StatusSchluessel): number {
  const w = s[k];
  return typeof w === 'number' ? w : STUFEN.indexOf(w);
}

/** Spur-Delta je Welt: was die bisherigen Wahlen gegenüber den Startständen verschoben haben. */
type Delta = Partial<Record<StatusSchluessel, number>>;

/** Größte Nachwirkung früherer Wahlen je Wert und Station (L-21): der Trend der Welt bleibt erzählt. */
export const SPUR_GRENZE = 1;

function kappe(x: number): number {
  return Math.max(-SPUR_GRENZE, Math.min(SPUR_GRENZE, x));
}

/** Startstand plus gekapptes Spur-Delta. */
function mitDelta(start: Status, delta: Delta): Status {
  const w: WirkEintrag[] = [];
  for (const k of STATUS_SCHLUESSEL) {
    const d = kappe(delta[k] ?? 0);
    if (d !== 0) w.push({ schluessel: k, art: 'aendere', wert: d, hinweis: start.hinweise[k] ?? null });
  }
  return wendeWirkung(start, w);
}

function wendeStation(
  st: ModellStation,
  z: StatusQuelle,
  vorher: Status | null,
  delta: Delta,
): { status: Status | null; delta: Delta } {
  let s = vorher;
  let basis: Status | null = null;
  if (st.statusStart !== null) {
    basis = mitDelta(wendeWirkung(null, st.statusStart), delta);
    s = basis;
  }
  for (const info of st.infos) {
    if (z.info.includes(`${st.id}/${info.id}`)) s = wendeWirkung(s, info.wirkung);
  }
  const ent = z.rolle !== null ? st.szenen[z.rolle]?.entscheidung ?? null : null;
  if (ent !== null) {
    const wahl = z.entscheidungen[ent.id];
    const option = ent.optionen.find((o) => o.id === wahl);
    if (option !== undefined) s = wendeWirkung(s, option.wirkung);
  }
  // Delta nachführen: Was diese Station (Informationen, Wahl) gegenüber ihrem Stand bewegt hat,
  // wirkt in der nächsten Station derselben Welt gekappt nach. Ohne Startstand zählt der Stand davor.
  const bezug = basis ?? vorher;
  const neu: Delta = { ...delta };
  if (s !== null && bezug !== null) {
    for (const k of STATUS_SCHLUESSEL) neu[k] = kappe((basis !== null ? kappe(delta[k] ?? 0) : (delta[k] ?? 0)) + zahl(s, k) - zahl(bezug, k));
  }
  return { status: s, delta: neu };
}

/**
 * Der Weg, über den der Status gerechnet wird: jede Station einmal (erster Besuch), bis zur aktuellen
 * Station. Sprünge (`geheZu`, Regie, Permalink) hängen eine Station erneut an den Verlauf; ohne diese
 * Bereinigung zählte das Spur-Delta ihre Wahl doppelt, und der Stand hinge vom Sprungweg ab.
 */
export function wegBis(verlauf: readonly string[]): string[] {
  const weg: string[] = [];
  for (const id of verlauf) if (!weg.includes(id)) weg.push(id);
  const jetzt = verlauf[verlauf.length - 1];
  return jetzt === undefined ? weg : weg.slice(0, weg.indexOf(jetzt) + 1);
}

/**
 * Status beider Welten aus dem Verlauf: je Station `status-start` (plus Nachwirkung der bisherigen
 * Wahlen dieser Welt, je Wert höchstens ±1, L-21), dann angeforderte Informationen, dann die Wahl der
 * gespielten Rolle. Eine Station ohne `status-start` rechnet mit dem Stand ihrer Welt weiter (L-19).
 * Eine Vergleichsstation zeigt vorab den Startstand ihrer Welt-B-Station (der Regler blendet ihn ein).
 */
export function berechneStatus(z: StatusQuelle, modell: StoryModell): { A: Status | null; B: Status | null } {
  const erg: { A: Status | null; B: Status | null } = { A: null, B: null };
  const delta: { A: Delta; B: Delta } = { A: {}, B: {} };
  for (const id of wegBis(z.verlauf)) {
    const st = modell.stationen[id];
    if (st === undefined) continue;
    if (st.vergleich !== null) {
      const b = modell.stationen[st.vergleich.b];
      if (b !== undefined && b.welt !== null && b.statusStart !== null) erg[b.welt] = mitDelta(wendeWirkung(null, b.statusStart), delta[b.welt]);
    }
    if (st.welt === null) continue;
    const r = wendeStation(st, z, erg[st.welt], delta[st.welt]);
    erg[st.welt] = r.status;
    delta[st.welt] = r.delta;
  }
  return erg;
}

export interface StatusAenderung {
  schluessel: StatusSchluessel;
  von: number | Stufe;
  nach: number | Stufe;
}

/** Was sich zwischen zwei Ständen geändert hat (für „ungeklärte Entscheidungen 3 → 4“). */
export function statusAenderungen(vorher: Readonly<Status> | null, nachher: Readonly<Status> | null): StatusAenderung[] {
  if (vorher === null || nachher === null) return [];
  const aus: StatusAenderung[] = [];
  for (const k of STATUS_SCHLUESSEL) {
    if (vorher[k] !== nachher[k]) aus.push({ schluessel: k, von: vorher[k], nach: nachher[k] });
  }
  return aus;
}

/** Wortform der Entscheidungsfähigkeit (Prototyp: ≤ 2 niedrig, 3 mittel, ≥ 4 hoch). */
export function wortEntscheidungsfaehigkeit(v: number): 'niedrig' | 'mittel' | 'hoch' {
  if (v <= 2) return 'niedrig';
  if (v === 3) return 'mittel';
  return 'hoch';
}

/** Ein Satz je Wert, z. B. für Screenreader: „Entscheidungsfähigkeit niedrig (2 von 5)“. */
export function beschreibeStatus(s: Readonly<Status>): string[] {
  const zusatz = (k: StatusSchluessel): string => {
    const h = s.hinweise[k];
    return h !== undefined ? ` (${h})` : '';
  };
  return [
    `${STATUS_BESCHRIFTUNG.entscheidungsfaehigkeit} ${wortEntscheidungsfaehigkeit(s.entscheidungsfaehigkeit)} (${s.entscheidungsfaehigkeit} von 5)${zusatz('entscheidungsfaehigkeit')}`,
    `${STATUS_BESCHRIFTUNG.kostenunsicherheit} ${s.kostenunsicherheit}${zusatz('kostenunsicherheit')}`,
    `${STATUS_BESCHRIFTUNG.offeneRisiken} ${s.offeneRisiken}${zusatz('offeneRisiken')}`,
    `${STATUS_BESCHRIFTUNG.ungeklaerteEntscheidungen} ${s.ungeklaerteEntscheidungen}${zusatz('ungeklaerteEntscheidungen')}`,
    `${STATUS_BESCHRIFTUNG.terminrisiko} ${s.terminrisiko}${zusatz('terminrisiko')}`,
  ];
}
