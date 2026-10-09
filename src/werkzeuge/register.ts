/*
 * Register-Zusammenspiel (Werkzeug E, Owner im Chat 2026-10-09) – rein, ohne DOM. Die Form des Zusammenspiels steht hier,
 * die Texte stehen in inhalte/werkzeuge.yaml (Teil `register`, je Kennung). Regeln: Knoten und Pfeile folgen der
 * Register-Abgrenzung des Standards und V2.4; zwei Pfeile der Vorlagegrafik gibt es nicht (Frühwarnung → Risiko nur nach
 * Klärung, nie „Rückrichtung“ aus einem Risiko; Vorlage erzeugt keine Maßnahme ohne Beschluss).
 * Belege intern: V1.2 k6.4.3-p2, k6.4.4-t1; V2.4 HB 1, 1.2–1.6, 3, 3.1, 4, 5.
 */

export const KNOTEN = ['fruehwarnung', 'problem', 'aenderung', 'prognose', 'risiko', 'register', 'vorlage', 'freigabe', 'massnahme', 'bericht'] as const;
export type KnotenId = (typeof KNOTEN)[number];
/** Der Schwellenwert steht als Hinweiskasten über den Registern; er ist kein Register. */
export const SCHWELLE = 'schwelle' as const;
export type Ort = KnotenId | typeof SCHWELLE;
export const ORTE: readonly Ort[] = [SCHWELLE, ...KNOTEN];

export const ROLLEN = ['bauherr', 'lenkungskreis', 'projektsteuerung'] as const;
export type Rolle = (typeof ROLLEN)[number];

/** wird-zu: Lebenszyklus; ueberwachung: Überwachung und Rückwirkung; bericht: Bericht in den Managementbericht */
export type KantenArt = 'wird-zu' | 'ueberwachung' | 'bericht';

export interface Kante {
  id: string;
  von: Ort;
  nach: Ort;
  art: KantenArt;
}

export const KANTEN: readonly Kante[] = [
  { id: 'prognose-schwelle', von: 'prognose', nach: SCHWELLE, art: 'ueberwachung' },
  { id: 'schwelle-fruehwarnung', von: SCHWELLE, nach: 'fruehwarnung', art: 'ueberwachung' },
  { id: 'fruehwarnung-risiko', von: 'fruehwarnung', nach: 'risiko', art: 'wird-zu' },
  { id: 'fruehwarnung-problem', von: 'fruehwarnung', nach: 'problem', art: 'wird-zu' },
  { id: 'risiko-register', von: 'risiko', nach: 'register', art: 'wird-zu' },
  { id: 'problem-register', von: 'problem', nach: 'register', art: 'wird-zu' },
  { id: 'aenderung-register', von: 'aenderung', nach: 'register', art: 'wird-zu' },
  { id: 'aenderung-prognose', von: 'aenderung', nach: 'prognose', art: 'wird-zu' },
  { id: 'register-vorlage', von: 'register', nach: 'vorlage', art: 'wird-zu' },
  { id: 'vorlage-freigabe', von: 'vorlage', nach: 'freigabe', art: 'wird-zu' },
  { id: 'freigabe-massnahme', von: 'freigabe', nach: 'massnahme', art: 'wird-zu' },
  { id: 'freigabe-bericht', von: 'freigabe', nach: 'bericht', art: 'bericht' },
  { id: 'massnahme-risiko', von: 'massnahme', nach: 'risiko', art: 'ueberwachung' },
];

export const KANTEN_IDS: readonly string[] = KANTEN.map((k) => k.id);

export function kante(id: string): Kante | null {
  return KANTEN.find((k) => k.id === id) ?? null;
}

/** Pfeile, die von einem Ort ausgehen, in der Reihenfolge der Tabelle. */
export function ausgehend(von: Ort): readonly Kante[] {
  return KANTEN.filter((k) => k.von === von);
}

/** Pfeile, die an einem Ort ankommen. */
export function eingehend(nach: Ort): readonly Kante[] {
  return KANTEN.filter((k) => k.nach === nach);
}

/** Die vier Ebenen über der Grafik; `stoerung` schaltet Stationen aus. */
export const EBENEN = ['wer', 'wann', 'schwelle', 'ergebnis', 'stoerung'] as const;
export type Ebene = (typeof EBENEN)[number];

/** Die acht Anlässe (Modi Zuschauen, Geschichte, Durchprobieren laufen über denselben Weg). */
export const ANLAESSE = ['hinweis', 'problem', 'aenderung', 'schwelle', 'baugrund', 'absage', 'ausschreibung', 'fassade'] as const;
export type AnlassId = (typeof ANLAESSE)[number];

export interface Weg {
  start: Ort;
  /** Pfeile in der Reihenfolge des Falls */
  schritte: readonly string[];
}

export type WegFehler =
  | { art: 'unbekannter-pfeil'; schritt: number; kante: string }
  | { art: 'nicht-erreicht'; schritt: number; kante: string; von: Ort }
  | { art: 'doppelt'; schritt: number; kante: string }
  | { art: 'leer' };

/**
 * Prüft einen Weg: Jeder Pfeil gibt es, jeder höchstens einmal, und seine Quelle ist schon erreicht (Start oder Ziel eines früheren
 * Pfeils). So darf ein Fall nach einem Pfeil an eine frühere Station zurückkehren (Abzweig), aber nie von einer Station ausgehen,
 * die er nicht berührt hat.
 */
export function pruefeWeg(w: Weg): readonly WegFehler[] {
  const f: WegFehler[] = [];
  if (w.schritte.length === 0) return [{ art: 'leer' }];
  const erreicht = new Set<Ort>([w.start]);
  const gesehen = new Set<string>();
  w.schritte.forEach((id, i) => {
    const k = kante(id);
    if (k === null) { f.push({ art: 'unbekannter-pfeil', schritt: i, kante: id }); return; }
    if (gesehen.has(id)) f.push({ art: 'doppelt', schritt: i, kante: id });
    gesehen.add(id);
    if (!erreicht.has(k.von)) f.push({ art: 'nicht-erreicht', schritt: i, kante: id, von: k.von });
    erreicht.add(k.nach);
  });
  return f;
}

/** Stationen, die der Weg bis einschließlich Schritt `bis` (null = ganz) berührt hat, in der Reihenfolge des ersten Besuchs. */
export function besucht(w: Weg, bis: number | null = null): readonly Ort[] {
  const aus: Ort[] = [w.start];
  const n = bis === null ? w.schritte.length : Math.min(bis + 1, w.schritte.length);
  for (let i = 0; i < n; i++) {
    const k = kante(w.schritte[i] ?? '');
    if (k !== null && !aus.includes(k.nach)) aus.push(k.nach);
  }
  return aus;
}

/**
 * Ablauf bei ausgefallenen Stationen: Der Fall läuft, bis ein Pfeil an eine ausgefallene Station führen würde oder von einer
 * ausgefallenen ausgeht. Gibt den Index des ersten blockierten Schritts zurück, sonst null (der Fall läuft durch).
 */
export function blockiert(w: Weg, ausgefallen: ReadonlySet<Ort>): { schritt: number; station: Ort } | null {
  if (ausgefallen.has(w.start)) return { schritt: 0, station: w.start };
  for (let i = 0; i < w.schritte.length; i++) {
    const k = kante(w.schritte[i] ?? '');
    if (k === null) continue;
    if (ausgefallen.has(k.von)) return { schritt: i, station: k.von };
    if (ausgefallen.has(k.nach)) return { schritt: i, station: k.nach };
  }
  return null;
}

/** Die Schritte, die vor dem blockierten Schritt noch laufen. */
export function bisBlockade(w: Weg, ausgefallen: ReadonlySet<Ort>): number {
  return blockiert(w, ausgefallen)?.schritt ?? w.schritte.length;
}

export interface Probefrage {
  /** Station, an der gefragt wird */
  von: Ort;
  /** richtige Antwort: Zielstation des nächsten Schritts */
  richtig: Ort;
  /** die Antworten in fester Reihenfolge, die richtige eingeschlossen */
  wahl: readonly Ort[];
}

/**
 * Frage zu Schritt `i` des Falls: „Wie geht es weiter?“. Zur Wahl stehen das Ziel des Schritts, die anderen Ziele, die von der
 * Station ausgehen (richtige Pfeile, aber in diesem Fall nicht jetzt), und zwei Stationen ohne Pfeil von hier – ohne Zufall,
 * die Auswahl hängt nur von Station und Schritt ab.
 */
export function probefrage(w: Weg, i: number): Probefrage | null {
  const k = kante(w.schritte[i] ?? '');
  if (k === null) return null;
  const nah = ausgehend(k.von).map((x) => x.nach).filter((o) => o !== k.nach);
  const fern = ORTE.filter((o) => o !== k.von && o !== k.nach && !nah.includes(o) && o !== SCHWELLE);
  const start = (i * 3 + ORTE.indexOf(k.von)) % Math.max(1, fern.length);
  const falsch = [...nah, ...fern.slice(start), ...fern.slice(0, start)].slice(0, Math.max(2, nah.length));
  const wahl = [k.nach, ...falsch.slice(0, 3)];
  // feste Mischung: die richtige Antwort steht je nach Schritt an einer anderen Stelle
  const platz = i % wahl.length;
  const gemischt = [...wahl.slice(1)];
  gemischt.splice(platz, 0, k.nach);
  return { von: k.von, richtig: k.nach, wahl: gemischt };
}

/** Wie eine gewählte Zielstation zur Frage passt: richtig, ein anderer Pfeil von hier, oder kein Pfeil von hier. */
export function bewerteWahl(frage: Probefrage, gewaehlt: Ort): 'richtig' | 'anderer-pfeil' | 'kein-pfeil' {
  if (gewaehlt === frage.richtig) return 'richtig';
  return ausgehend(frage.von).some((k) => k.nach === gewaehlt) ? 'anderer-pfeil' : 'kein-pfeil';
}

/** Zahl der Stationen je führender Rolle, in der Reihenfolge von `ROLLEN`. */
export function zaehleFuehrung(fuehrt: Readonly<Record<string, Rolle>>): Record<Rolle, number> {
  const z: Record<Rolle, number> = { bauherr: 0, lenkungskreis: 0, projektsteuerung: 0 };
  for (const r of Object.values(fuehrt)) z[r] += 1;
  return z;
}
