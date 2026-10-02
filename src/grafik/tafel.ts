/*
 * Grafik-Baukasten: Whitepaper-Tabellen als klickbare Grafiken (P4, L-32).
 *
 * Eine `::: tafel <Tabellen-ID>` holt die Tabelle zur Bauzeit wörtlich aus whitepaper.json (Kopf und
 * Zeilen); diese Datei zeichnet sie in einer von neun Formen. Alle Texte sind Tabellenzellen – die
 * Grafik ordnet sie nur an und fügt keine Aussage hinzu. Eigene Wörter sind Bedienung (WORT).
 *
 * - ketten    „Was passiert, wenn …?“: Muster → Konsequenz → MVG-Reaktion je Auslöser (Kap. 2.5)
 * - schwelle  Mandatsschwellen-Spiel: Aufgaben delegierbar / nicht delegierbar zuordnen (Kap. 3.2)
 * - pyramide  Verantwortungspyramide (Kap. 3.3), Ebenen klickbar
 * - felder    Verantwortungsfelder: Chaos (typische Fehlstelle) → Ordnung (MVG-Antwort) (Kap. 4)
 * - bausteine Die MVG-Bausteine setzen sich zusammen (Kap. 5.2)
 * - phasen    LPH-0–9-Freigabemodell (Kap. 9.3): Phasen als Leiste, Auswahl zeigt die Freigabefrage
 * - rhythmus  Governance-Rhythmus (Kap. 6.4.5): vom täglichen bis zum seltenen Termin
 * - karten    allgemeine Karten: erste Spalte als Titel, die übrigen als Angaben (z. B. Kap. 6.4.2)
 * - zeitachse schiebbare Zeitachse (Kap. 8.2, 30/60/90): der Regler wählt den Tag, die Tafel zeigt den Zeitraum
 */

import { h, attr, ersetze, elementAus } from '../ui/h.ts';
import { symbol } from '../stil/symbole.ts';

export const TAFEL_FORMEN = ['ketten', 'schwelle', 'pyramide', 'felder', 'bausteine', 'phasen', 'rhythmus', 'karten', 'zeitachse'] as const;
export type TafelForm = (typeof TAFEL_FORMEN)[number];

export function istTafelForm(x: string): x is TafelForm {
  return (TAFEL_FORMEN as readonly string[]).includes(x);
}

export type TitelStufe = 'h2' | 'h3' | 'h4';

export interface TafelDaten {
  form: TafelForm;
  /** Absatz-ID der Tabelle, z. B. k2.5-t1 */
  absatz: string;
  /** Quellenangabe „Whitepaper V1.2, Kap. 2.5“ */
  quelle: string;
  kopf: string[];
  zeilen: string[][];
  /** hervorgehobene Zeilen (1-basiert), z. B. die aktuelle LPH */
  hervor?: number[];
  /** Überschriftenstufe der Tafeltitel (Gliederung der umgebenden Seite; Standard h4) */
  stufe?: TitelStufe;
}

export const WORT = {
  wennPassiert: 'Was passiert, wenn …',
  wenn: 'Wenn',
  dann: 'dann',
  zuordnen: 'Ordnen Sie jede Aufgabe zu: delegierbar oder nicht delegierbar?',
  richtig: 'richtig',
  falsch: 'gehört auf die andere Seite',
  stand: (r: number, n: number, g: number) => `${r} von ${g} richtig · ${n} zugeordnet`,
  aufloesen: 'Alle zeigen',
  grenze: 'Grenze',
  ansicht: (w: string, spalte: string) => `Ansicht: ${w} – ${spalte}`,
  hier: 'hier steht der Fall',
  chaos: 'Chaos',
  ordnung: 'Ordnung',
  mehr: 'Mehr zum Feld',
  tag: (n: number) => `Tag ${n}`,
  schieben: 'Tag wählen',
} as const;

/** Feste, unregelmäßige Mischung (deterministisch: Fisher-Yates mit festem Startwert), damit Abwechseln nicht hilft. */
export function mische<T>(a: readonly T[], b: readonly T[]): T[] {
  const aus = [...a, ...b];
  let wert = 20260927;
  const zufall = (): number => {
    wert = (wert * 1103515245 + 12345) % 2147483648;
    return wert / 2147483648;
  };
  for (let i = aus.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [aus[i], aus[j]] = [aus[j] as T, aus[i] as T];
  }
  return aus;
}

function detailListe(kopf: readonly string[], zeile: readonly string[], ab: number): HTMLElement {
  return h('dl', { class: 'tafel-detail' }, kopf.slice(ab).map((k, i) => h('div', null, h('dt', null, k), h('dd', null, zeile[ab + i] ?? ''))));
}

/** „Was passiert, wenn …?“: Auslöser wählen, die Kette baut sich auf. */
function ketten(d: TafelDaten): HTMLElement {
  const glieder = h('ol', { class: 'wirkungskette', 'aria-live': 'polite' });
  const knoepfe = d.zeilen.map((z, i) => h('button', {
    type: 'button', class: 'ausloeser', 'aria-pressed': 'false', 'data-pruef': `ausloeser-${i + 1}`, onclick: () => waehle(i),
  }, z[0] ?? ''));
  const waehle = (i: number): void => {
    knoepfe.forEach((b, j) => attr(b, 'aria-pressed', i === j ? 'true' : 'false'));
    const z = d.zeilen[i] ?? [];
    const teile: [string, string][] = [[`${WORT.wenn} · ${d.kopf[1] ?? ''}`, z[1] ?? ''], [`${WORT.dann} · ${d.kopf[2] ?? ''}`, z[2] ?? ''], [d.kopf[3] ?? '', z[3] ?? '']];
    ersetze(glieder, teile.map(([label, text], j) => h('li', { class: `glied-${j + 1}`, style: `--i:${j}` },
      h('span', { class: 't-label' }, label), h('p', null, text))));
  };
  waehle(0);
  return h('div', { class: 'tafel-ketten' },
    h('div', { class: 'ausloeser-wahl', role: 'group', 'aria-label': WORT.wennPassiert }, h('span', { class: 't-label' }, WORT.wennPassiert), knoepfe),
    glieder);
}

/** Mandatsschwellen-Spiel: jede Aufgabe einer Seite zuordnen; Rückmeldung je Karte, Stand oben. */
function schwelle(d: TafelDaten): HTMLElement {
  const unten = d.zeilen.map((z) => z[0] ?? '').filter((t) => t !== '').map((t) => ({ text: t, seite: 0 }));
  const oben = d.zeilen.map((z) => z[1] ?? '').filter((t) => t !== '').map((t) => ({ text: t, seite: 1 }));
  const karten = mische(unten, oben);
  const wahl: (number | null)[] = karten.map(() => null);
  const stand = h('p', { class: 'schwelle-stand', 'aria-live': 'polite', 'data-pruef': 'schwelle-stand' });
  const zeigeStand = (): void => {
    const n = wahl.filter((w) => w !== null).length;
    const r = wahl.filter((w, i) => w !== null && w === karten[i]?.seite).length;
    stand.textContent = WORT.stand(r, n, karten.length);
  };
  const elemente = karten.map((k, i) => {
    const rueck = h('span', { class: 'schwelle-rueck' });
    const knoepfe = [0, 1].map((seite) => h('button', {
      type: 'button', class: 'schwelle-knopf', 'aria-pressed': 'false', 'data-seite': seite,
      onclick: () => setze(seite),
    }, d.kopf[seite] ?? ''));
    const textId = `${d.absatz}-aufgabe-${i + 1}`;
    const el = h('li', { class: 'schwelle-karte', 'data-pruef': `aufgabe-${i + 1}` }, h('p', { id: textId }, k.text), h('div', { class: 'schwelle-knoepfe', role: 'group', 'aria-labelledby': textId }, knoepfe), rueck);
    const setze = (seite: number): void => {
      wahl[i] = seite;
      knoepfe.forEach((b, j) => attr(b, 'aria-pressed', j === seite ? 'true' : 'false'));
      const ok = seite === k.seite;
      el.setAttribute('data-ergebnis', ok ? 'richtig' : 'falsch');
      el.setAttribute('data-seite', String(k.seite));
      ersetze(rueck, elementAus(symbol(ok ? 'haken' : 'kreuz')), ok ? WORT.richtig : `${WORT.falsch}: ${d.kopf[k.seite] ?? ''}`);
      zeigeStand();
    };
    return { el, setze: () => setze(k.seite) };
  });
  zeigeStand();
  return h('div', { class: 'tafel-schwelle' },
    h('p', { class: 'tafel-hinweis' }, WORT.zuordnen),
    h('div', { class: 'schwelle-kopf' }, h('span', { class: 'schwelle-seite', 'data-seite': 0 }, d.kopf[0] ?? ''), h('span', { class: 'schwelle-linie' }, WORT.grenze), h('span', { class: 'schwelle-seite', 'data-seite': 1 }, d.kopf[1] ?? '')),
    stand,
    h('ol', { class: 'schwelle-karten' }, elemente.map((e) => e.el)),
    h('button', { type: 'button', class: 'knopf knopf-still', 'data-pruef': 'schwelle-aufloesen', onclick: () => elemente.forEach((e) => e.setze()) }, WORT.aufloesen));
}

/** Verantwortungspyramide: Zeilen von unten (erste Zeile) nach oben; Klick zeigt Bedeutung und Relevanz. */
function pyramide(d: TafelDaten): HTMLElement {
  const detail = h('div', { class: 'tafel-auswahl', 'aria-live': 'polite' });
  const n = d.zeilen.length;
  const stufen = d.zeilen.map((z, i) => h('button', {
    type: 'button', class: 'pyramide-stufe', 'aria-pressed': 'false', 'data-pruef': `stufe-${i + 1}`, style: `--stufe:${i};--stufen:${n}`,
    onclick: () => waehle(i),
  }, z[0] ?? ''));
  const waehle = (i: number): void => {
    stufen.forEach((b, j) => attr(b, 'aria-pressed', i === j ? 'true' : 'false'));
    const z = d.zeilen[i] ?? [];
    ersetze(detail, h(d.stufe ?? 'h4', { class: 'tafel-titel' }, titelMitUmbruch(z[0] ?? '')), detailListe(d.kopf, z, 1));
  };
  waehle(n - 1);
  return h('div', { class: 'tafel-pyramide' }, h('div', { class: 'pyramide', role: 'group', 'aria-label': d.kopf[0] ?? '' }, [...stufen].reverse()), detail);
}

/** Verantwortungsfelder: Schalter Chaos ↔ Ordnung für alle Felder; Kern und Vorbereitung aufklappbar. */
function felder(d: TafelDaten): HTMLElement {
  const iChaos = 3;
  const iOrdnung = 4;
  const karten = d.zeilen.map((z, i) => {
    const text = h('p', { class: 'feld-zustand' }, z[iChaos] ?? '');
    const el = h('li', { class: 'feld-karte', 'data-pruef': `feld-${i + 1}`, 'data-zustand': 'chaos', style: `--i:${i}` },
      h(d.stufe ?? 'h4', { class: 'tafel-titel' }, titelMitUmbruch(z[0] ?? '')), h('span', { class: 't-label feld-marke' }, d.kopf[iChaos] ?? ''), text,
      h('details', null, h('summary', null, WORT.mehr), detailListe(d.kopf.slice(0, 3), z.slice(0, 3), 1)));
    return { el, text, z };
  });
  const knoepfe = (['chaos', 'ordnung'] as const).map((zustand) => h('button', {
    type: 'button', class: 'felder-schalter-knopf', 'aria-pressed': zustand === 'chaos' ? 'true' : 'false', 'data-pruef': `felder-${zustand}`,
    onclick: () => setze(zustand),
  }, zustand === 'chaos' ? WORT.chaos : WORT.ordnung));
  const ansicht = h('p', { class: 'felder-ansicht', 'aria-live': 'polite', 'data-pruef': 'felder-ansicht' }, WORT.ansicht(WORT.chaos, d.kopf[iChaos] ?? ''));
  const setze = (zustand: 'chaos' | 'ordnung'): void => {
    ansicht.textContent = WORT.ansicht(zustand === 'chaos' ? WORT.chaos : WORT.ordnung, d.kopf[zustand === 'chaos' ? iChaos : iOrdnung] ?? '');
    knoepfe.forEach((b) => attr(b, 'aria-pressed', b.getAttribute('data-pruef') === `felder-${zustand}` ? 'true' : 'false'));
    const spalte = zustand === 'chaos' ? iChaos : iOrdnung;
    for (const k of karten) {
      k.el.setAttribute('data-zustand', zustand);
      k.text.textContent = k.z[spalte] ?? '';
      const marke = k.el.querySelector('.feld-marke');
      if (marke !== null) marke.textContent = d.kopf[spalte] ?? '';
    }
  };
  return h('div', { class: 'tafel-felder' },
    h('div', { class: 'felder-schalter', role: 'group', 'aria-label': `${WORT.chaos} / ${WORT.ordnung}` }, knoepfe),
    ansicht,
    h('ol', { class: 'felder-karten' }, karten.map((k) => k.el)));
}

/** MVG-Bausteine: Karten setzen sich nacheinander zusammen; aufklappbar Funktion und Wirkung. */
function bausteine(d: TafelDaten): HTMLElement {
  return h('ol', { class: 'tafel-bausteine' }, d.zeilen.map((z, i) => h('li', { class: 'baustein-karte', style: `--i:${i}`, 'data-pruef': `baustein-${i + 1}` },
    h('details', null, h('summary', null, h('i', null, String(i + 1)), h('b', null, z[0] ?? '')), detailListe(d.kopf, z, 1)))));
}

/** Auswahlleiste mit Detail: gemeinsamer Aufbau für Phasen und Rhythmus. */
function leisteMitDetail(d: TafelDaten, klasse: string, beschrift: (z: string[], i: number) => Node[], ab: number): HTMLElement {
  const detail = h('div', { class: 'tafel-auswahl', 'aria-live': 'polite' });
  const hervor = d.hervor ?? [];
  const knoepfe = d.zeilen.map((z, i) => h('button', {
    type: 'button', class: `leiste-knopf${hervor.includes(i + 1) ? ' ist-hervor' : ''}`, 'aria-pressed': 'false', 'data-pruef': `${klasse}-${i + 1}`,
    onclick: () => waehle(i),
  }, beschrift(z, i), hervor.includes(i + 1) ? h('span', { class: 'nur-sr' }, ` (${WORT.hier})`) : null));
  const waehle = (i: number): void => {
    knoepfe.forEach((b, j) => attr(b, 'aria-pressed', i === j ? 'true' : 'false'));
    const z = d.zeilen[i] ?? [];
    ersetze(detail, h(d.stufe ?? 'h4', { class: 'tafel-titel' }, titelMitUmbruch(z.slice(0, ab).join(' · '))), hervor.includes(i + 1) ? h('p', { class: 'tafel-spur' }, elementAus(symbol('haken')), WORT.hier) : null, detailListe(d.kopf, z, ab));
  };
  waehle(Math.max(0, (hervor[0] ?? 1) - 1));
  return h('div', { class: `tafel-leiste tafel-${klasse}` }, h('div', { class: 'leiste', role: 'group', 'aria-label': d.kopf[0] ?? '' }, knoepfe), detail);
}

function phasen(d: TafelDaten): HTMLElement {
  return leisteMitDetail(d, 'phase', (z) => [h('b', null, z[0] ?? ''), h('small', null, z[1] ?? '')], 2);
}

function rhythmus(d: TafelDaten): HTMLElement {
  return leisteMitDetail(d, 'rhythmus', (z) => [h('b', null, z[0] ?? '')], 1);
}

/**
 * Tafeltitel dürfen nach „/“ umbrechen: „Risiko-/Änderungs-/Maßnahmenverknüpfung“ bliebe sonst ein
 * einziges Wort und schöbe die Karte bei 400 px im Beamer-Zoom über den Rand (P12.5 R12).
 */
function titelMitUmbruch(text: string): Node[] {
  return text.split(/(?<=\/)/u).flatMap((t, i) => (i === 0 ? [document.createTextNode(t)] : [document.createElement('wbr'), document.createTextNode(t)]));
}

function karten(d: TafelDaten): HTMLElement {
  return h('ol', { class: 'tafel-karten' }, d.zeilen.map((z, i) => h('li', { class: 'tafel-karte', 'data-pruef': `karte-${i + 1}` },
    h(d.stufe ?? 'h4', { class: 'tafel-titel' }, titelMitUmbruch(z[0] ?? '')), detailListe(d.kopf, z, 1))));
}

/** Zeitraum „0–30 Tage“ → [0, 30]; ohne Zahlenpaar null. */
export function zeitraum(zelle: string): [number, number] | null {
  const m = /(\d+)\s*[–-]\s*(\d+)/u.exec(zelle);
  return m === null ? null : [Number(m[1] ?? 0), Number(m[2] ?? 0)];
}

/**
 * Schiebbare Zeitachse (Kap. 8.2): ein Regler über alle Zeiträume der ersten Spalte; der gewählte
 * Tag hebt seinen Zeitraum hervor und zeigt dessen Zeile. Die Zeiträume sind zugleich Knöpfe.
 */
function zeitachse(d: TafelDaten): HTMLElement {
  const raeume: [number, number][] = d.zeilen.map((z) => zeitraum(z[0] ?? '') ?? [0, 0]);
  const bis = Math.max(1, ...raeume.map((r) => r[1]));
  const detail = h('div', { class: 'tafel-auswahl', 'aria-live': 'polite' });
  const regler = h('input', { type: 'range', class: 'zeitachse-regler', min: 0, max: bis, step: 1, value: 0, 'aria-label': WORT.schieben, 'data-pruef': 'zeitachse-regler' }) as HTMLInputElement;
  const zeile = (tag: number): number => Math.max(0, raeume.findIndex((r) => tag >= r[0] && tag <= r[1]));
  const knoepfe = d.zeilen.map((z, i) => h('button', {
    type: 'button', class: 'zeitachse-abschnitt', style: `--von:${(raeume[i]?.[0] ?? 0) / bis};--bis:${(raeume[i]?.[1] ?? 0) / bis}`, 'aria-pressed': 'false', 'data-pruef': `zeitachse-${i + 1}`,
    onclick: () => { regler.value = String(raeume[i]?.[0] ?? 0); zeige(); },
  }, h('b', null, z[0] ?? ''), h('small', null, z[1] ?? '')));
  const zeige = (): void => {
    const tag = Number(regler.value);
    const i = zeile(tag);
    const z = d.zeilen[i] ?? [];
    attr(regler, 'aria-valuetext', `${WORT.tag(tag)} · ${z[0] ?? ''}`);
    knoepfe.forEach((b, j) => attr(b, 'aria-pressed', i === j ? 'true' : 'false'));
    ersetze(detail, h(d.stufe ?? 'h4', { class: 'tafel-titel' }, h('span', { class: 'zeitachse-tag', 'data-pruef': 'zeitachse-tag' }, WORT.tag(tag)), ' · ', titelMitUmbruch(z[0] ?? '')), detailListe(d.kopf, z, 1));
  };
  regler.addEventListener('input', zeige);
  zeige();
  return h('div', { class: 'tafel-zeitachse' }, h('div', { class: 'zeitachse-leiste', role: 'group', 'aria-label': d.kopf[0] ?? '' }, knoepfe), regler, detail);
}

/**
 * R48: Formen, die immer nur eine gewählte Zeile oder Ansicht zeigen (oder Teile zuklappen). Nicht bedienbar – im
 * Druckbogen und auf der Leinwand – fehlte der Rest (k4-t1: Spalte „MVG-Antwort“, k2.5-t1: sieben von acht Ketten);
 * dort stehen sie aufgelöst als Karten mit allen Spalten (L-68, L-100: aufgelöst statt scheinbar bedienbar).
 */
const MIT_AUSWAHL: ReadonlySet<TafelForm> = new Set<TafelForm>(['ketten', 'pyramide', 'felder', 'bausteine', 'phasen', 'rhythmus', 'zeitachse']);
let aufgeloest = false;
/** Beim Bau einer nicht bedienbaren Lernseite (Leinwand, Druck, Regie-Vorschau) setzen, danach zurücksetzen. */
export function tafelnAufgeloest(ja: boolean): void {
  aufgeloest = ja;
}

function aufgeloesteKarten(d: TafelDaten): HTMLElement {
  const ab = d.form === 'phasen' ? 2 : 1;
  // die Pyramide von oben (Letztverantwortung) nach unten, wie gezeichnet
  const zeilen = d.form === 'pyramide' ? [...d.zeilen].reverse() : d.zeilen;
  return h('ol', { class: 'tafel-karten tafel-aufgeloest', 'data-pruef': 'tafel-aufgeloest' }, zeilen.map((z, i) => h('li', { class: 'tafel-karte', 'data-pruef': `karte-${i + 1}` },
    h(d.stufe ?? 'h4', { class: 'tafel-titel' }, titelMitUmbruch(z.slice(0, ab).join(' · '))), detailListe(d.kopf, z, ab))));
}

/** Zeichnet eine Tafel. */
export function tafel(d: TafelDaten): HTMLElement {
  let bild: HTMLElement;
  if (aufgeloest && MIT_AUSWAHL.has(d.form)) return h('figure', { class: 'tafel', 'data-form': d.form, 'data-absatz': d.absatz, 'data-pruef': `tafel-${d.form}` }, aufgeloesteKarten(d));
  switch (d.form) {
    case 'ketten': bild = ketten(d); break;
    case 'schwelle': bild = schwelle(d); break;
    case 'pyramide': bild = pyramide(d); break;
    case 'felder': bild = felder(d); break;
    case 'bausteine': bild = bausteine(d); break;
    case 'phasen': bild = phasen(d); break;
    case 'rhythmus': bild = rhythmus(d); break;
    case 'karten': bild = karten(d); break;
    case 'zeitachse': bild = zeitachse(d); break;
  }
  return h('figure', { class: 'tafel', 'data-form': d.form, 'data-absatz': d.absatz, 'data-pruef': `tafel-${d.form}` }, bild);
}
