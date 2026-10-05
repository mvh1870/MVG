/*
 * Zustandsautomat für die Wegtests der Story (P19.1, O-62, L-270) – reine Testhilfe, keine Auslieferung.
 *
 * Die Wegaufzählung (3^n bzw. 4^n Wege) wächst mit jedem Kapitel um den Faktor 3 bzw. 4. Was am Ende zählt, hängt aber nur
 * an den Balken (rund 860 erreichbare Stände) und an wenigen Merkmalen (Falle ja/nein, offene Kapitel, …). Der Automat
 * schreibt die Menge der erreichbaren Zustände Kapitel für Kapitel fort (Antwort gut/vertretbar/Falle, bei Bedarf „offen“
 * ohne Wirkung; ein von der Kurzfassung übersprungenes Kapitel zählt wie die gute Antwort) und hält je Schicht nur
 * verschiedene Zustände. Zu jedem Zustand merkt er einen Beispielweg; auf dem werden die Endtexte mit der echten Engine
 * bestimmt. Neue Merkmale (Gedächtnis-Echos) sind weitere Einträge in `MERKMALE`: ein Zähler mit Obergrenze oder ein Bit.
 */
import {
  BALKEN_MAX, BALKEN_MIN, balken, bilanzAmEnde, endeFassung, falleGewaehlt, gewaehlteAntwort, neuerStand, offeneKapitel, startBalken, waehle,
  wegKapitel, type Balkenstand, type EndeFassung, type Stand,
} from '../../src/geschichte/engine.ts';
import { BALKEN, type Antwort, type BalkenId, type BilanzSicht, type Geschichte, type Kapitel, type Wertung } from '../../src/geschichte/typen.ts';

export const WERTUNGEN_REIHE: readonly Wertung[] = ['gut', 'vertretbar', 'falle'];

/** Obergrenze für die Zahl der Zustände je Schicht: Überlauf ist ein Befund (der Automat wäre dann nicht mehr „klein“). */
export const MAX_ZUSTAENDE = 3_000_000;

/** Stelle (1–14) der Grundstation einer (ggf. synthetisch fortgeschriebenen) Folge: die 14 Stationen der echten Story wiederholen sich (P19.6) */
export const grundNr = (k: Kapitel): number => ((k.nr - 1) % 14) + 1;

/** Ein Merkmal: Anfangswert und Fortschreibung je Kapitel; `a === null` heißt „offen“ (nur auf gespielten Kapiteln). */
export interface Merkmal { name: string; init: number; schritt: (acc: number, k: Kapitel, a: Antwort | null) => number }

const gute = (k: Kapitel): Antwort => k.antworten.find((a) => a.wertung === 'gut') as Antwort;
const teurer = (b: BalkenId): Merkmal => ({ name: `teurer-${b}`, init: 0, schritt: (x, k, a) => (x === 1 || (a !== null && a.wirkung[b] < gute(k).wirkung[b]) ? 1 : 0) });

/** Die Merkmale, von denen die heutigen Endtexte abhängen (proben() in tests/geschichte-wege.test.ts). Reihenfolge fest. */
export const MERKMALE: readonly Merkmal[] = [
  { name: 'falle', init: 0, schritt: (x, _k, a) => (x === 1 || a?.wertung === 'falle' ? 1 : 0) },
  { name: 'offen', init: 0, schritt: (x, _k, a) => (x === 1 || a === null ? 1 : 0) },
  { name: 'nichtGut', init: 0, schritt: (x, _k, a) => Math.min(2, x + (a !== null && a.wertung !== 'gut' ? 1 : 0)) },
  teurer('geld'), teurer('zeit'), teurer('vertrauen'),
  // P19.6 (04-rahmen 3.4): ersetzt `falleK4K7`; „Geld hoch“ setzt keine Falle in den Stationen 3 bis 13 voraus (Falle in 1, 2 oder 14 ändert am Geld nichts).
  // `spaet` entfällt: die Zeilen „Beim nächsten Projekt …“ setzen nur eine Falle voraus.
  { name: 'falleStat3bis13', init: 0, schritt: (x, k, a) => (x === 1 || (grundNr(k) >= 3 && grundNr(k) <= 13 && a?.wertung === 'falle') ? 1 : 0) },
];

/** Zustand: Balken, Merkmalswerte (in der Reihenfolge von `MERKMALE`) und ein Beispielweg (ein Zeichen je Kapitel: g v f o, „-“ = übersprungen). */
export interface Zustand { b: Balkenstand; m: number[]; weg: string }

export const schluessel = (b: Balkenstand, m: readonly number[]): string => `${BALKEN.map((x) => b[x]).join(',')}|${m.join(',')}`;
const begrenze = (n: number): number => Math.min(BALKEN_MAX, Math.max(BALKEN_MIN, n));

/** Mögliche Übergänge eines Kapitels: [Zeichen, Antwort oder null (offen)]. */
function uebergaenge(k: Kapitel, gespielt: boolean, mitOffen: boolean): [string, Antwort | null][] {
  if (!gespielt) return [['-', gute(k)]];
  const aus: [string, Antwort | null][] = [];
  for (const w of WERTUNGEN_REIHE) aus.push([w[0] as string, k.antworten.find((a) => a.wertung === w) as Antwort]);
  if (mitOffen) aus.push(['o', null]);
  return aus;
}

export interface Automat { schichten: number[]; ende: Zustand[] }

/** Menge der erreichbaren Zustände nach dem letzten Kapitel; `schichten` = Zahl der Zustände nach Kapitel 1, 2, … */
export function zustandsautomat(g: Geschichte, kurz: boolean, mitOffen: boolean, merkmale: readonly Merkmal[] = MERKMALE): Automat {
  const gespielt = new Set(wegKapitel(g, kurz).map((k) => k.id));
  let schicht = new Map<string, Zustand>();
  const start: Zustand = { b: startBalken(g), m: merkmale.map((x) => x.init), weg: '' };
  schicht.set(schluessel(start.b, start.m), start);
  const groessen: number[] = [];
  for (const k of g.kapitel) {
    const neu = new Map<string, Zustand>();
    for (const z of schicht.values()) {
      for (const [zeichen, a] of uebergaenge(k, gespielt.has(k.id), mitOffen)) {
        const b = { ...z.b };
        if (a !== null) for (const x of BALKEN) b[x] = begrenze(b[x] + a.wirkung[x]);
        const m = merkmale.map((f, i) => f.schritt(z.m[i] as number, k, a));
        const s = schluessel(b, m);
        if (!neu.has(s)) neu.set(s, { b, m, weg: z.weg + zeichen });
        if (neu.size > MAX_ZUSTAENDE) throw new Error(`Zustandsmenge über ${MAX_ZUSTAENDE} bei Kapitel ${k.id}`);
      }
    }
    schicht = neu;
    groessen.push(schicht.size);
  }
  return { schichten: groessen, ende: [...schicht.values()] };
}

/** Stand am Ende zu einem Beispielweg (Zeichen je Kapitel in der Reihenfolge von `g.kapitel`). */
export function standZuWeg(g: Geschichte, kurz: boolean, weg: string): Stand {
  let s = neuerStand(kurz);
  g.kapitel.forEach((k, i) => {
    const w = WERTUNGEN_REIHE.find((x) => x[0] === weg[i]);
    if (w !== undefined) s = waehle(g, s, k.id, k.antworten.findIndex((a) => a.wertung === w));
  });
  return { ...s, schritt: { ort: 'ende' } };
}

/** Ein Endzustand mit allem, was die Texte lesen – die Texte selbst kommen aus der echten Engine. */
export interface Ende {
  weg: string;
  kurz: boolean;
  b: Balkenstand;
  falle: boolean;
  /** mindestens ein Kapitel offen */
  offen: boolean;
  /** Zahl der nicht guten Antworten, höchstens 2 */
  nichtGut: number;
  teurer: Record<BalkenId, boolean>;
  /** Falle in einer der Stationen 3 bis 13 */
  falleStat3bis13: boolean;
  /** Bilanz-Sicht und Schlusszeilen-Fassung laut Engine */
  sicht: BilanzSicht;
  fassung: EndeFassung;
}

function endeVon(g: Geschichte, kurz: boolean, s: Stand, weg: string, m: readonly number[], merkmale: readonly Merkmal[]): Ende {
  const wert = (n: string): number => m[merkmale.findIndex((x) => x.name === n)] ?? 0;
  return {
    weg, kurz, b: balken(g, s, { ort: 'ende' }), falle: wert('falle') === 1, offen: wert('offen') === 1, nichtGut: wert('nichtGut'),
    teurer: { geld: wert('teurer-geld') === 1, zeit: wert('teurer-zeit') === 1, vertrauen: wert('teurer-vertrauen') === 1 },
    falleStat3bis13: wert('falleStat3bis13') === 1, sicht: bilanzAmEnde(g, s), fassung: endeFassung(g, s),
  };
}

/** Alle erreichbaren Endzustände (Automat + Engine auf dem Beispielweg). */
export function endZustaende(g: Geschichte, kurz: boolean, mitOffen: boolean): Ende[] {
  return zustandsautomat(g, kurz, mitOffen).ende.map((z) => endeVon(g, kurz, standZuWeg(g, kurz, z.weg), z.weg, z.m, MERKMALE));
}

/* ------------------------------------------------------ Gegenprobe: Wegaufzählung -- */

/** Merkmalswerte eines fertigen Stands, aus Engine-Auskünften gefaltet (unabhängig von der Mengenfortschreibung). */
export function merkmaleVon(g: Geschichte, s: Stand, merkmale: readonly Merkmal[] = MERKMALE): number[] {
  const gespielt = new Set(wegKapitel(g, s.kurz).map((k) => k.id));
  return merkmale.map((f) => g.kapitel.reduce((acc, k) => f.schritt(acc, k, gespielt.has(k.id) && s.wahlen[k.id] === undefined ? null : gewaehlteAntwort(s, k)), f.init));
}

/** Endzustände durch Aufzählung aller 3^n (mit „offen“: 4^n) Wege – nur für kleine n. Schlüssel → Ende. */
export function endZustaendeBruteForce(g: Geschichte, kurz: boolean, mitOffen: boolean): Map<string, Ende> {
  const kap = wegKapitel(g, kurz);
  const wahl: (Wertung | 'offen')[] = mitOffen ? ['offen', ...WERTUNGEN_REIHE] : [...WERTUNGEN_REIHE];
  const aus = new Map<string, Ende>();
  for (let i = 0; i < wahl.length ** kap.length; i++) {
    let s = neuerStand(kurz);
    let x = i;
    for (const k of kap) {
      const w = wahl[x % wahl.length] as Wertung | 'offen';
      x = Math.floor(x / wahl.length);
      if (w !== 'offen') s = waehle(g, s, k.id, k.antworten.findIndex((a) => a.wertung === w));
    }
    s = { ...s, schritt: { ort: 'ende' } };
    const m = merkmaleVon(g, s);
    const sl = schluessel(balken(g, s, { ort: 'ende' }), m);
    if (!aus.has(sl)) aus.set(sl, { ...endeVon(g, kurz, s, '', m, MERKMALE), falle: falleGewaehlt(g, s), offen: offeneKapitel(g, s).length > 0 });
  }
  return aus;
}

export const endeSchluessel = (e: Ende): string => schluessel(e.b, [e.falle, e.offen, e.nichtGut, e.teurer.geld, e.teurer.zeit, e.teurer.vertrauen, e.falleStat3bis13].map(Number));

/* ------------------------------------------------------------ synthetische Stories -- */

export interface Synthese {
  /** Zahl der Kapitel; die 14 Stationen der echten Story wiederholen sich zyklisch (Wirkungen und Wertungen) */
  n: number;
  /** welche Kapitel zur Kurzfassung gehören (Standard: jedes zweite, beginnend mit dem ersten) */
  kurzfassung?: (nr: number) => boolean;
  /** „scharf“: jede von null verschiedene Wirkung wird ±2, damit Balken an beide Grenzen stoßen */
  scharf?: boolean;
}

export function synthetischeStory(g: Geschichte, o: Synthese): Geschichte {
  const aus = structuredClone(g);
  const grund = g.kapitel;
  aus.kapitel = Array.from({ length: o.n }, (_, i) => {
    const k = structuredClone(grund[i % grund.length] as Kapitel);
    k.id = `k${i + 1}`;
    k.nr = i + 1;
    k.kurzfassung = (o.kurzfassung ?? ((nr) => nr % 2 === 1))(i + 1);
    if (o.scharf) for (const a of k.antworten) for (const b of BALKEN) a.wirkung[b] = Math.sign(a.wirkung[b]) * 2;
    return k;
  });
  return aus;
}
