/*
 * Grafik-Baukasten: Vergleichsszene Welt A ⟷ Welt B (Pflicht-Animation 2, O-2).
 *
 * Bei t = 0 liegen die Requisiten der Welt A durcheinander (Haftnotizen, Excel-Stände, verknotete
 * Fäden); mit t → 1 „fliegen“ sie an ihren Platz im Governance-Fluss und werden zu den Bausteinen der
 * Welt B (FRW-003, RIS-014, Datenstand …). Welches Stück wohin fliegt, sagen die `paar`-Container der
 * Inhalte (docs/INHALTSFORMAT.md 3.5); die Lage der Stücke ist Gestaltung und steht hier.
 */

import { h, s } from '../ui/h.ts';
import { FLUSS_BESCHRIFTUNG, FLUSS_POSITIONEN, type FlussPosition } from './governance-fluss.ts';
import { schmal, sanftBeide } from '../ui/bewegung.ts';

export interface VergleichsStueck {
  /** Welt-A-Stück als Knoten (fertig gezeichnet) */
  a: Node;
  /** Art des Welt-A-Stücks: mail · chat · notiz · datei */
  aArt: string;
  /** Welt-B-Baustein als Knoten oder null (Stück verschwindet) */
  b: Node | null;
  /** Art des Welt-B-Bausteins: register · datenstand · markierung · bericht · reserve … */
  bArt: string | null;
  fluss: FlussPosition | null;
}

export interface VergleichsOptionen {
  stuecke: VergleichsStueck[];
  /** Station im Fluss, an der die Szene steht */
  hier: FlussPosition;
  marken: { a: string; b: string };
}

export interface VergleichsGrafik {
  element: HTMLElement;
  /** 0 (Welt A) … 1 (Welt B) */
  setze(t: number): void;
  /** neu ausrichten (Fensterbreite geändert) */
  neuZeichnen(): void;
}

/**
 * Mitten der sieben Stationen in Prozent (breit: waagerecht, schmal: senkrecht). Schmal beginnt die
 * erste Station tiefer, damit ihr Baustein nicht unter der Marke „Welt B · Governance-Fluss“ liegt.
 */
const SX = [7.14, 21.43, 35.71, 50, 64.29, 78.57, 92.86];
const SY = [13, 26.1, 39.2, 52.3, 65.4, 78.5, 91.6];

/** Lage der Welt-A-Stücke (x, y, Drehung, Breite) – Pinnwand-Durcheinander wie im Prototyp. */
const LAGE_A: readonly (readonly [number, number, number, number])[] = [
  [13, 24, -3, 19], [37, 20, 4, 19], [62, 24, -5, 19], [86, 22, 6, 19],
  [14, 72, 3, 19], [38, 76, -6, 17], [61, 70, -3, 19], [85, 74, 5, 19],
];
const LAGE_A_SCHMAL: readonly (readonly [number, number, number, number])[] = [
  [27, 12, -3, 42], [73, 14, 4, 42], [28, 37, -5, 42], [74, 38, 6, 42],
  [26, 62, 3, 42], [73, 62, -6, 40], [28, 87, -3, 42], [72, 87, 5, 42],
];

/** Verknotete Fäden der Welt A (Bézier-Punkte im 1000 × 400-Raster). */
const FAEDEN_A: readonly (readonly number[])[] = [
  [130, 96, 330, 360, 470, 10, 610, 280],
  [370, 80, 520, 250, 60, 170, 140, 288],
  [620, 96, 760, 330, 240, 150, 380, 304],
  [860, 88, 520, 330, 260, 20, 140, 288],
  [380, 304, 560, 130, 690, 390, 850, 296],
  [610, 280, 930, 360, 700, 20, 860, 88],
];
const FAEDEN_A_SCHMAL: readonly (readonly number[])[] = [
  [270, 48, 900, 120, 0, 250, 280, 348],
  [730, 56, 100, 100, 900, 200, 260, 248],
  [280, 148, 800, 60, 300, 330, 730, 248],
  [740, 152, 400, 380, 50, 100, 260, 248],
  [730, 248, 300, 200, 950, 300, 720, 348],
  [280, 348, 100, 200, 950, 250, 740, 152],
];

/**
 * Ziel eines Stücks in Welt B: [x, y, Breite] breit und schmal. Teilen sich zwei Stücke eine Station
 * (`rang` 0/1 von `anzahl` 2, z. B. Änderung und Risikoreserve bei „Entscheidung“), steht das zweite
 * breit ÜBER der Stationsreihe und schmal NEBEN dem ersten – nie aufeinander.
 */
export function zielInB(st: Pick<VergleichsStueck, 'bArt' | 'fluss' | 'b'>, rang = 0, anzahl = 1): { breit: [number, number, number]; schmal: [number, number, number] } {
  if (st.fluss !== null) {
    const i = FLUSS_POSITIONEN.indexOf(st.fluss);
    const x = SX[i] ?? 50;
    const y = SY[i] ?? 50;
    if (anzahl < 2) return { breit: [x, 80, 13.2], schmal: [70, y, 40] };
    return rang === 0 ? { breit: [x, 80, 13.2], schmal: [53, y, 28] } : { breit: [x, 13, 12], schmal: [85, y, 27] };
  }
  if (st.bArt === 'markierung') return { breit: [38.5, 13, 9.5], schmal: [70, SY[1] ?? 25, 30] };
  return { breit: [20, 13, 26], schmal: [70, SY[1] ?? 25, 52] };
}

function mische(a: readonly number[], b: readonly number[], t: number): number[] {
  return a.map((x, i) => x + ((b[i] ?? x) - x) * t);
}

export function vergleichSzene(o: VergleichsOptionen): VergleichsGrafik {
  const hierIndex = FLUSS_POSITIONEN.indexOf(o.hier);
  const stuecke = o.stuecke.map((st, i) => {
    const a = LAGE_A[i % LAGE_A.length] ?? [50, 50, 0, 19];
    const an = LAGE_A_SCHMAL[i % LAGE_A_SCHMAL.length] ?? [50, 50, 0, 42];
    const gleich = st.fluss === null ? [] : o.stuecke.filter((x) => x.fluss === st.fluss && x.b !== null);
    const ziel = zielInB(st, gleich.indexOf(st), gleich.length);
    const klassen = ['morph', st.b === null ? 'ist-ausblenden' : '', st.bArt === 'markierung' ? 'ist-marke' : ''].filter(Boolean).join(' ');
    const stil = [
      `--ax:${a[0]}`, `--ay:${a[1] + (i >= LAGE_A.length ? 6 : 0)}`, `--ar:${a[2]}`, `--aw:${a[3]}`,
      `--bx:${ziel.breit[0]}`, `--by:${ziel.breit[1]}`, `--bw:${ziel.breit[2]}`,
      `--nax:${an[0]}`, `--nay:${an[1]}`, `--naw:${an[3]}`,
      `--nbx:${ziel.schmal[0]}`, `--nby:${ziel.schmal[1]}`, `--nbw:${ziel.schmal[2]}`,
    ].join(';');
    return h('div', { class: klassen, style: stil },
      h('div', { class: `morph-a morph-a-${st.aArt}` }, st.a),
      st.b !== null ? h('div', { class: `morph-b morph-b-${st.bArt ?? 'text'}` }, st.b) : null);
  });
  const stationen = FLUSS_POSITIONEN.map((p, i) => h('div', {
    class: `morph-station${i === hierIndex ? ' ist-hier' : ''}`,
    style: `--sx:${SX[i]};--sy:${SY[i]}`,
  }, h('i', null, String(i + 1)), h('span', null, FLUSS_BESCHRIFTUNG[p])));
  const faedenA = FAEDEN_A.map(() => s('path', { class: 'faden-a', 'vector-effect': 'non-scaling-stroke' }));
  const faedenB = FAEDEN_A.map(() => s('path', { class: 'faden-b', 'vector-effect': 'non-scaling-stroke' }));
  const svg = s('svg', { class: 'morph-faeden', viewBox: '0 0 1000 400', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, faedenA, faedenB);
  const element = h('div', { class: 'vergleich morph-szene', 'aria-hidden': 'true', style: '--t:0' },
    h('div', { class: 'vergleich-a' }),
    h('div', { class: 'vergleich-b' }),
    h('span', { class: 'vergleich-marke', 'data-welt': 'a' }, o.marken.a),
    h('span', { class: 'vergleich-marke', 'data-welt': 'b' }, o.marken.b),
    svg,
    stationen,
    h('div', { class: 'morph-puls' }),
    stuecke);

  let t = 0;
  const zeichneFaeden = (): void => {
    const eng = schmal();
    const quelle = eng ? FAEDEN_A_SCHMAL : FAEDEN_A;
    const e = sanftBeide(Math.min(1, Math.max(0, t)));
    faedenA.forEach((pa, i) => {
      const a = quelle[i] ?? [];
      let b: number[];
      if (eng) {
        const y0 = (SY[i] ?? 0) * 4;
        const y1 = (SY[i + 1] ?? 0) * 4;
        const d = (y1 - y0) / 3;
        b = [100, y0, 100, y0 + d, 100, y0 + 2 * d, 100, y1];
      } else {
        const x0 = (SX[i] ?? 0) * 10;
        const x1 = (SX[i + 1] ?? 0) * 10;
        const d = (x1 - x0) / 3;
        b = [x0, 184, x0 + d, 184, x0 + 2 * d, 184, x1, 184];
      }
      const q = mische(a, b, e).map((v) => v.toFixed(1));
      const pfad = `M${q[0]} ${q[1]}C${q[2]} ${q[3]} ${q[4]} ${q[5]} ${q[6]} ${q[7]}`;
      const breite = (2 + 3 * e).toFixed(2);
      pa.setAttribute('d', pfad);
      pa.setAttribute('stroke-width', breite);
      const pb = faedenB[i];
      if (pb !== undefined) {
        pb.setAttribute('d', pfad);
        pb.setAttribute('stroke-width', breite);
      }
    });
  };

  const api: VergleichsGrafik = {
    element,
    setze(neu) {
      t = Math.min(1, Math.max(0, neu));
      element.style.setProperty('--t', t.toFixed(4));
      element.classList.toggle('ist-b', t >= 0.5);
      element.classList.toggle('ist-angekommen', t >= 1);
      zeichneFaeden();
    },
    neuZeichnen: zeichneFaeden,
  };
  api.setze(0);
  return api;
}
