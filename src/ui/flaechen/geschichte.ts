/*
 * Fläche „Story“ (P17.4, O-51 bis O-53): eine lineare Geschichte in acht Kapiteln aus Sicht der Projektleitung des
 * Bauherrn. Ein Fluss mit „Weiter“ Schritt für Schritt: Auftakt (Figuren, Balken, Wahl ganze Geschichte oder
 * Kurzfassung) → je Kapitel Szene (Campus, Dialog), in Kapitel 7 der Vergleich, Frage mit drei Antworten (nach der Wahl
 * Folge-Szene, Balken, „So macht man es gut“), in Kapitel 2, 4, 6, 8 die Mini-Aufgabe → Schulstart mit Bilanz.
 * Oben eine Fortschrittslinie der Kapitel und die drei Balken klein; die Seite sagt „3 von 8“, nie „Kapitel“ (L-225).
 *
 * `baueSchritt` zeichnet einen Schritt rein aus Geschichte und Stand (auch für Leinwand und Regie-Vorschau, ohne
 * Bedienung); `erzeugeGeschichte` ist die bedienbare Fläche mit Speicher, Fokusführung und Tastatur.
 */

import type { Akt, Antwort, BalkenId, CampusBild, Geschichte, Kapitel, Mini, Vergleich, Vertiefung, Zeile } from '../../geschichte/typen.ts';
import { BALKEN } from '../../geschichte/typen.ts';
import {
  abgestimmteGewichte, akt as aktVonId, akteVon, aktNummer, aktVon, aktWoerter, balken, balkenBis, beginne, bilanzAmEnde, brueckenKarten as brueckenGruppen,
  buchEintraege, dahinterHtmlFuer, endeFassung, endetStation, folgeHtmlFuer, gewaehlteAntwort, geheZu, gewichte, gleicherSchritt,
  gutHtmlFuer, kapitel as kapitelVon, letzteStation, leseStand, loeseEchos, loeseZeile, minutenAus, miniVonVorn,
  neuerStand, offeneKapitel, restWoerter, roemisch, schrittIndex, setzeAbgestimmt, setzeGewicht, stufe, STUFEN_GEWICHT, vergleichLage, verlaufBis,
  waehle, wegKapitel, weiterMitGanzer, werteMiniAus, weiter, zurueck, zaehlendePlatz, type Balkenstand, type Lesezeit, type Schritt, type Stand,
} from '../../geschichte/engine.ts';
import lesezeitDaten from '../../geschichte/lesezeit-daten.json' with { type: 'json' };
import { campusIso } from '../../grafik/campus-iso.ts';
import { verlaufBand } from '../../grafik/verlauf.ts';
import { wegSkizze } from '../../grafik/weg-skizze.ts';
import type { Figur } from '../../grafik/figuren.ts';
import { ersetze, h, vonHtml, type Kind } from '../h.ts';
import { inhalt, inhaltInline } from '../bausteine/inhalt.ts';
import { sym } from '../bausteine/bloecke.ts';
import { bmLink, seitenRahmen } from '../bausteine/seite.ts';
import { bogenKopf } from '../druck.ts';
import { W } from '../woerter.ts';
import { bildnis, gegenstand } from './geschichte-teile.ts';
import { miniBaustein } from './geschichte-mini.ts';
import { buchDruck, buchSeite, buchSymbol } from './geschichte-buch.ts';

const w = W.geschichte;

/** Gemessene Lesezeit je Schritt der echten Story (werkzeuge/lesezeit.mjs --schreibe); eine andere Geschichte (Test) bringt ihre eigene mit. */
export const LESEZEIT: Lesezeit = lesezeitDaten as Lesezeit;

/** Campus der Stufe mit Jahreszeit und Licht, groß; dekorativ (Drehbuch Abschnitt 7), Zusatz der Szene darüber. */
function campus(c: CampusBild, klasse: string, zusatz: string | null = null, halleOffen = false): HTMLElement {
  // der große Rahmen (2,2 : 1) bekommt den breiten Ausschnitt – sonst schnitte er Kran und Dächer oben ab (R75)
  const breit = klasse.includes('gs-campus-gross');
  const bild = vonHtml(campusIso(c.stufe, { jahreszeit: c.jahreszeit, licht: c.licht, ...(c.wetter ? { wetter: c.wetter } : {}), ...(breit ? { ausschnitt: 'breit' as const } : {}), ...(halleOffen ? { halleOffen: true } : {}) }));
  // füllt den Rahmen (Seitenverhältnis aus dem CSS); was übersteht, wird knapp beschnitten (breit: nur Himmel an den Seiten)
  bild.firstElementChild?.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  return h('div', { class: `gs-campus ${klasse}`, 'aria-hidden': 'true', 'data-stufe': c.stufe },
    bild,
    zusatz !== null ? gegenstand(zusatz, 120, 'gs-campus-zusatz') : null);
}

/** Kleine Symbole der Balken (Münze, Uhr, Hände) – eigene Vektorgrafik, ohne Farbe. */
const BALKEN_SYMBOL: Record<BalkenId, string> = {
  geld: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14.8 9.2a3.4 3.4 0 1 0 0 5.6M8 11h5M8 13.4h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  zeit: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 9v4.5l3 2M9.5 2.8h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  vertrauen: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.7a4.3 4.3 0 0 1 7.5 2.6c0 5.6-7.5 10.2-7.5 10.2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
};

/* -------------------------------------------------------------- Balken -- */

function balkenTitel(g: Geschichte, id: BalkenId): string {
  return g.balken.find((b) => b.id === id)?.titel ?? id;
}

/** Änderung eines Balkens in Worten: „Zeit: etwas mehr Luft“, „Vertrauen: deutlich gesunken“, „Geld: unverändert“. */
export function aenderungWort(g: Geschichte, id: BalkenId, vorher: number, nachher: number, wirkung: number): string {
  const b = g.balken.find((x) => x.id === id);
  const titel = b?.titel ?? id;
  const d = nachher - vorher;
  if (d === 0) {
    if (wirkung > 0 && nachher >= 10) return `${titel}: ${w.bleibtOben}`;
    if (wirkung < 0 && nachher <= 0) return `${titel}: ${w.bleibtUnten}`;
    return `${titel}: ${w.unveraendert}`;
  }
  return `${titel}: ${Math.abs(d) >= 2 ? w.deutlich : w.etwas} ${d > 0 ? b?.mehr ?? '' : b?.weniger ?? ''}`;
}

/** Pfeil zur Änderung; steht der Balken schon am Rand, zeigt er die Richtung der Wirkung (R75: „▲ bleibt ganz oben“). */
function pfeil(d: number, wirkung: number): string {
  const r = d !== 0 ? d : wirkung;
  return r > 0 ? '▲' : r < 0 ? '▼' : '●';
}

/**
 * Drei Balken mit Füllstand, ohne Zahlen. Mit `vorher` wächst bzw. schrumpft jeder Balken vom alten Stand zum neuen
 * (CSS, bei reduzierter Bewegung sofort), daneben Pfeil und Wort; für Screenreader steht der Füllstand als Wort.
 */
function balkenTafel(g: Geschichte, jetzt: Balkenstand, o: { vorher?: Balkenstand; wirkung?: Antwort['wirkung']; gross: boolean; pruef: string }): HTMLElement {
  return h('ul', { class: `gs-stand ${o.gross ? 'gs-stand-gross' : 'gs-stand-klein'}`, 'data-pruef': o.pruef, 'aria-label': w.balkenLeiste },
    BALKEN.map((id) => {
      const wert = jetzt[id];
      const von = o.vorher?.[id] ?? wert;
      const d = wert - von;
      const richtung = d > 0 ? 'hoch' : d < 0 ? 'runter' : 'gleich';
      const wort = o.vorher !== undefined ? aenderungWort(g, id, von, wert, o.wirkung?.[id] ?? 0) : null;
      return h('li', { class: 'gs-stand-zeile', 'data-balken': id, 'data-richtung': o.vorher !== undefined ? richtung : null },
        h('span', { class: 'gs-stand-name' }, h('span', { class: 'gs-stand-symbol' }, vonHtml(BALKEN_SYMBOL[id])), balkenTitel(g, id)),
        h('span', { class: 'gs-stand-spur', 'aria-hidden': 'true' },
          h('span', { class: `gs-stand-fuellung${o.vorher !== undefined && d !== 0 ? ' ist-bewegt' : ''}`, style: `--von:${von * 10}%;--nach:${wert * 10}%` })),
        wort !== null
          ? h('span', { class: 'gs-stand-wort', 'data-pruef': `wort-${id}`, 'aria-hidden': 'true' }, h('span', { class: 'gs-pfeil', 'aria-hidden': 'true' }, pfeil(d, o.wirkung?.[id] ?? 0)), wort.slice(wort.indexOf(':') + 2))
          : null,
        h('span', { class: 'nur-sr' }, ` ${w.fuellstand[stufe(wert)] ?? ''}${wort !== null ? `; ${wort}` : ''}`));
    }));
}

/* ------------------------------------------------------------- Bausteine -- */

export interface SchrittOptionen {
  g: Geschichte;
  stand: Stand;
  bedienbar: boolean;
  /** Titel eines Themas (null = gibt es nicht, kein Link) */
  themaTitel: (id: string) => string | null;
  /** Titel eines Explore-Werkzeugs (null oder fehlt = kein Verweis); Verweise stehen nur bedienbar, nie auf der Leinwand (P18.5) */
  werkzeugTitel?: (id: string) => string | null;
  tue: (neu: Stand) => void;
  /** gemessene Lesezeit (Akt-Dauer in der Kopfkarte); fehlt sie, gilt `LESEZEIT` */
  lesezeit?: Lesezeit;
  /** der Stand liegt tatsächlich im Browser (Zeile „gespeichert“ in der Pause, P19.3); fehlt = nicht gespeichert, die Zeile entfällt */
  gespeichert?: boolean;
}

function figurName(g: Geschichte, id: string): { name: string; rolle: string; akzent: string } {
  const f = g.figuren.find((x) => x.id === id);
  return { name: f?.name ?? id, rolle: f?.rolle ?? '', akzent: f?.akzent ?? 'navy' };
}

/** Stelle des Kapitels auf dem Weg, wie die Ortszeile sie nennt: lang „3“, in der Kurzfassung „2 von 4“ (R74). */
function stelleAufWeg(o: SchrittOptionen, k: Kapitel): string {
  if (!o.stand.kurz) return String(k.nr);
  const weg = wegKapitel(o.g, true);
  return w.vonN(weg.findIndex((x) => x.id === k.id) + 1, weg.length);
}

/** Kopf eines Kapitels: große Nummer, Zeit, Titel (fokussierbar für die Fokusführung). */
function kopf(o: SchrittOptionen, k: Kapitel, unter: string): HTMLElement {
  return h('header', { class: 'gs-kopf' },
    h('span', { class: 'gs-nummer', 'aria-hidden': 'true' }, String(k.nr)),
    h('div', { class: 'gs-kopf-text' },
      h('p', { class: 'gs-kicker' }, unter),
      h('h1', { class: 'gs-titel', tabindex: -1, 'data-pruef': 'gs-titel' }, h('span', { class: 'nur-sr' }, `${stelleAufWeg(o, k)} · `), k.titel)));
}

/** Dialog: je Zeile Porträt und Sprechblase in der Farbe der Figur. */
function dialog(g: Geschichte, zeilen: readonly Zeile[]): HTMLElement {
  return h('ol', { class: 'gs-dialog', 'aria-label': w.szeneTitel },
    zeilen.map((z, i) => {
      if (z.figur === null) return h('li', { class: 'gs-zeile gs-zeile-erzaehlt' }, h('p', null, inhaltInline(z.html)));
      const f = figurName(g, z.figur);
      const gleich = i > 0 && zeilen[i - 1]?.figur === z.figur;
      return h('li', { class: `gs-zeile${gleich ? ' ist-folgezeile' : ''}`, 'data-figur': z.figur, 'data-akzent': f.akzent },
        gleich ? h('span', { class: 'gs-bildnis-platz', 'aria-hidden': 'true' }) : bildnis(z.figur as Figur, 64),
        h('div', { class: 'gs-blase' },
          h('p', { class: 'gs-sprecher' }, f.name, z.zusatz !== null ? h('span', { class: 'gs-zusatz' }, ` (${z.zusatz})`) : null),
          h('p', { class: 'gs-gesagt' }, inhaltInline(z.html))));
    }));
}

function kasten(art: 'gut' | 'dahinter', titel: string, symbol: Kind, ...inhaltKinder: Kind[]): HTMLElement {
  return h('section', { class: `gs-kasten gs-kasten-${art}`, 'aria-label': titel, 'data-pruef': `gs-${art}` },
    h('span', { class: 'gs-kasten-symbol', 'aria-hidden': 'true' }, symbol),
    h('div', { class: 'gs-kasten-text' }, h('h2', { class: 'gs-kasten-titel' }, titel), inhaltKinder));
}

/** Leise Verweise auf die Werkzeuge, die zum Kapitel passen (E-13, P18.5): „Vorlagen-Check ausprobieren“, öffnet mit dem Beispiel des Kapitels. */
function werkzeugVerweise(o: SchrittOptionen, k: Kapitel): HTMLElement | null {
  if (!o.bedienbar || o.werkzeugTitel === undefined) return null;
  const links = k.werkzeuge.flatMap((v) => {
    const titel = o.werkzeugTitel?.(v.id) ?? null;
    if (titel === null) return [];
    return [h('a', { href: `#explore/${v.id}${v.beispiel !== null ? `/${v.beispiel}` : ''}`, 'data-pruef': `gs-werkzeug-${v.id}` }, w.werkzeugProbieren(titel), sym('pfeilRechts'))];
  });
  return links.length === 0 ? null : h('p', { class: 'gs-thema gs-werkzeug', 'data-pruef': 'gs-werkzeuge' }, links);
}

/**
 * „Das steckt dahinter“: auf dem ganzen Weg offen; in der bedienbaren Kurzfassung steht der Satz in einem Aufklapper
 * (P17.5 – die Regel steht vollständig in „So macht man es gut“), der Link zum Thema bleibt sichtbar. Die Werkzeug-Verweise
 * stehen dort im Aufklapper (zugeklappt zählen sie nicht zur Lesezeit; die Kurzfassung hat keinen Puffer, P18.5).
 */
function dahinter(o: SchrittOptionen, k: Kapitel): HTMLElement {
  const thema = o.themaTitel(k.thema);
  const satz = h('p', null, inhaltInline(dahinterHtmlFuer(o.stand, k)));
  const proben = werkzeugVerweise(o, k);
  const link = thema !== null && o.bedienbar ? h('p', { class: 'gs-thema' }, h('a', { href: `#theorie/${k.thema}`, 'data-pruef': 'gs-thema' }, `${w.zumThema}: ${thema}`, sym('pfeilRechts'))) : null;
  if (!(o.stand.kurz && o.bedienbar)) return kasten('dahinter', w.dahinterTitel, gegenstand('buch', 56), satz, link, proben);
  return h('section', { class: 'gs-kasten gs-kasten-dahinter gs-kasten-auf', 'aria-label': w.dahinterTitel, 'data-pruef': 'gs-dahinter' },
    h('span', { class: 'gs-kasten-symbol', 'aria-hidden': 'true' }, gegenstand('buch', 56)),
    h('div', { class: 'gs-kasten-text' },
      h('details', { class: 'gs-dahinter-auf', 'data-pruef': 'gs-dahinter-auf' }, h('summary', { class: 'gs-kasten-titel' }, w.dahinterTitel), satz, proben),
      link));
}

function mandatKarte(g: Geschichte): HTMLElement {
  return h('div', { class: 'gs-mandat', 'data-pruef': 'gs-mandat' },
    gegenstand('kaertchen', 64, 'gs-mandat-bild'),
    h('div', { class: 'gs-mandat-text' },
      h('h3', { class: 'gs-mandat-titel' }, g.mandat.titel),
      h('dl', null, g.mandat.zeilen.map((z) => h('div', null, h('dt', null, z.wer), h('dd', null, inhaltInline(z.html)))))));
}

/**
 * Brückenkarten der Kurzfassung für übersprungene Stationen. Mit Akten (P19.3) teilen sich mehrere Stationen in Folge eine
 * Karte („Stationen 6 bis 8“); ohne Akte steht je Station eine Karte wie bisher.
 */
function brueckenKarten(g: Geschichte, vor: Kapitel | null): HTMLElement | null {
  const gruppen = brueckenGruppen(g, vor);
  if (gruppen.length === 0) return null;
  const kopfZeile = (k: Kapitel): HTMLElement => h('p', { class: 'gs-bruecke-kopf' }, h('b', null, `${k.nr} · ${k.titel}`), ` · ${k.zeit}`);
  return h('section', { class: 'gs-bruecken', 'aria-label': w.brueckeTitel },
    h('p', { class: 'gs-bruecken-titel' }, w.brueckeTitel),
    h('ul', null, gruppen.map((gruppe) => {
      const erste = gruppe[0] as Kapitel;
      if (gruppe.length === 1) {
        return h('li', { class: 'gs-bruecke', 'data-pruef': `bruecke-${erste.id}` },
          campus(erste.campus, 'gs-campus-mini'),
          h('div', null, kopfZeile(erste), inhalt(erste.brueckeHtml ?? '')));
      }
      const letzte = gruppe[gruppe.length - 1] as Kapitel;
      return h('li', { class: 'gs-bruecke gs-bruecke-gruppe', 'data-pruef': `bruecke-${erste.id}`, 'data-stationen': gruppe.map((k) => k.id).join(' ') },
        campus(letzte.campus, 'gs-campus-mini'),
        h('div', null,
          h('p', { class: 'gs-bruecke-spanne' }, w.brueckeStationen(erste.nr, letzte.nr)),
          gruppe.map((k) => h('div', { class: 'gs-bruecke-station' }, kopfZeile(k), inhalt(k.brueckeHtml ?? '')))));
    })));
}

/* -------------------------------------------------------------------- Akte -- */

/** Dauer eines Akts in ganzen Minuten aus der gemessenen Lesezeit (null = keine Messung). */
function aktMinuten(o: SchrittOptionen, a: Akt): number | null {
  const lz = o.lesezeit ?? LESEZEIT;
  const wo = aktWoerter(o.g, a, lz);
  return wo === null ? null : minutenAus(wo, lz.woerterJeMinute);
}

/**
 * Kopfkarte (P19.3): über der ersten Station eines Akts, nur auf dem ganzen Weg – Akt, Titel, Zeitraum, Dauer und ein kurzer Text.
 * Die Zeile mit Akt und Dauer ist ein Kicker und zählt nicht zur Lesezeit (sonst hinge die Messung an der Zahl, die sie selbst liefert).
 */
function aktKopf(o: SchrittOptionen, k: Kapitel): HTMLElement | null {
  const a = aktVon(o.g, k.id);
  if (a === null || o.stand.kurz || a.stationen[0] !== k.id) return null;
  const min = aktMinuten(o, a);
  return h('section', { class: 'gs-aktkopf', 'aria-label': w.aktTitel(roemisch(aktNummer(o.g, a)), a.titel), 'data-pruef': `akt-kopf-${a.id}` },
    h('p', { class: 'gs-kicker gs-aktkopf-kicker' }, `${w.aktTitel(roemisch(aktNummer(o.g, a)), a.titel)} · ${a.zeitraum}${min !== null ? ` · ${w.aktDauer(min)}` : ''}`),
    h('p', { class: 'gs-aktkopf-text' }, inhaltInline(a.kopfHtml)));
}

/** „Das können Sie jetzt“: drei Sätze, auf jedem Weg gleich. */
function koennen(a: Akt, pruef: string): HTMLElement {
  return h('section', { class: 'gs-koennen', 'aria-labelledby': `gs-koennen-${a.id}`, 'data-pruef': pruef },
    h('h2', { id: `gs-koennen-${a.id}`, class: 'gs-h2' }, w.koennenTitel),
    h('ul', null, a.pause.koennenHtml.map((t) => h('li', null, inhaltInline(t)))));
}

/**
 * Verlauf (P19.3, P19.4): drei Linien über die Stationen bis `bisNr`, ohne Zahlen, dahinter die Streifen „gut gefüllt“, „etwa halb voll“,
 * „knapp“; darunter die Textfassung im Aufklapper „Verlauf als Text“ (zugeklappt am Bildschirm, offen auf Leinwand und Papier): je Station
 * eine Zeile in den Wörtern der Folge („etwas“, „deutlich“, „unverändert“) mit dem Stand. Station ohne Antwort: „noch offen“, die Linie
 * reißt dort ab; in der Kurzfassung sind übersprungene Stationen hohle Punkte („nur erzählt“). Keine Markierung „gut“ oder „Falle“.
 * `kopf` ist der Kicker („Ihr Weg bis hier“ in der Pause, „Ihr Weg im Überblick“ in der Bilanz) und zählt nicht zur Lesezeit.
 */
export function verlauf(g: Geschichte, stand: Stand, bisNr: number, kopf: string, offen: boolean): HTMLElement {
  const punkte = verlaufBis(g, stand, bisNr);
  const reihe = (id: BalkenId, klasse: string) => ({
    klasse, name: balkenTitel(g, id),
    werte: punkte.map((p) => (p.offen === true ? null : p.balken[id])),
    hohl: punkte.map((p) => p.erzaehlt === true),
  });
  const svg = verlaufBand([reihe('geld', 'vb-geld'), reihe('zeit', 'vb-zeit'), reihe('vertrauen', 'vb-vertrauen')], w.verlaufBeschreibung);
  const erzaehlt = punkte.some((p) => p.erzaehlt === true);
  const zeilen = punkte.slice(1).map((p, i) => {
    const k = kapitelVon(g, p.id ?? '');
    const titel = `${p.nr} · ${k?.titel ?? ''}`;
    if (p.offen === true) return h('li', { class: 'gs-verlauf-zeile', 'data-offen': 'true' }, h('b', null, titel), `: ${w.verlaufOffen}`);
    const vor = (punkte[i] as (typeof punkte)[number]).balken;
    const wirkung = k !== null ? gewaehlteAntwort(stand, k)?.wirkung : undefined;
    const aender = BALKEN.map((id) => aenderungWort(g, id, vor[id], p.balken[id], wirkung?.[id] ?? 0).replace(': ', ' ')).join(', ');
    return h('li', { class: 'gs-verlauf-zeile', ...(p.erzaehlt === true ? { 'data-erzaehlt': 'true' } : {}) },
      h('b', null, titel), `: ${aender}.`, ' ',
      h('span', { class: 'gs-verlauf-stand' }, BALKEN.map((id) => `${balkenTitel(g, id)} ${w.verlaufStreifen[stufe(p.balken[id])] ?? ''}`).join(' · ')));
  });
  return h('div', { class: 'gs-verlauf', 'data-pruef': 'gs-verlauf' },
    h('p', { class: 'gs-kicker gs-verlauf-kopf' }, kopf),
    h('div', { class: 'gs-verlauf-bild' }, vonHtml(svg)),
    h('details', { class: 'gs-verlauf-worte', 'data-pruef': 'gs-verlauf-worte', open: offen },
      h('summary', null, w.verlaufText),
      h('p', { class: 'gs-verlauf-legende' }, w.verlaufLegende),
      erzaehlt ? h('p', { class: 'gs-verlauf-hohl', 'data-pruef': 'gs-verlauf-hohl' }, w.verlaufHohl) : null,
      h('ol', { class: 'gs-verlauf-liste' }, zeilen)));
}

/** Pause am Ende eines Akts (P19.3): Zwischenbilanz mit Balken und Verlauf, „Das können Sie jetzt“, Weiter; nur auf dem ganzen Weg. */
function pauseSchritt(o: SchrittOptionen, a: Akt): HTMLElement {
  const { g, stand } = o;
  const nr = aktNummer(g, a);
  const letzte = letzteStation(g, a);
  const bis = letzte?.nr ?? 0;
  const naechster = akteVon(g)[nr];
  const weiterTitel = naechster !== undefined ? w.weiterMitAkt(roemisch(nr + 1)) : w.weiter;
  const offeneImAkt = offeneKapitel(g, stand).find((k) => a.stationen.includes(k.id)) ?? null;
  return h('article', { class: 'gs-schritt gs-pause', 'data-teil': 'pause', 'data-akt': a.id },
    h('header', { class: 'gs-kopf' },
      h('span', { class: 'gs-nummer', 'aria-hidden': 'true' }, roemisch(nr)),
      h('div', { class: 'gs-kopf-text' },
        h('p', { class: 'gs-kicker' }, `${w.pauseKicker} · ${a.zeitraum}`),
        h('h1', { class: 'gs-titel', tabindex: -1, 'data-pruef': 'gs-titel' }, h('span', { class: 'nur-sr' }, `${w.pauseKicker} · `), w.aktTitel(roemisch(nr), a.titel)))),
    letzte !== null ? h('div', { class: 'gs-buehnenbild' }, campus(letzte.campus, 'gs-campus-gross')) : null,
    a.pause.zeile !== null ? dialog(g, [a.pause.zeile]) : null,
    h('section', { class: 'gs-zwischenbilanz', 'aria-labelledby': `gs-zwischenbilanz-${a.id}`, 'data-pruef': 'gs-zwischenbilanz' },
      h('h2', { id: `gs-zwischenbilanz-${a.id}`, class: 'gs-h2' }, w.zwischenbilanz),
      balkenTafel(g, balken(g, stand, { ort: 'pause', akt: a.id }), { gross: true, pruef: 'gs-stand-pause' }),
      verlauf(g, stand, bis, w.verlaufPause, !o.bedienbar)),
    // „Das können Sie jetzt“ gilt nur, wenn alle Stationen des Akts beantwortet sind – sonst ein Satz ohne Urteil (04-rahmen 2.3)
    offeneImAkt === null ? koennen(a, `gs-koennen-${a.id}`) : h('p', { class: 'gs-leise', 'data-pruef': 'gs-pause-offen' }, w.pauseOffen),
    // die Zeile „gespeichert“ nur, wenn der Stand wirklich im Browser liegt, und nie auf der Leinwand
    o.bedienbar && o.gespeichert === true ? h('p', { class: 'gs-leise gs-gespeichert', 'data-pruef': 'gs-gespeichert' }, w.gespeichert) : null,
    offeneImAkt !== null && o.bedienbar ? h('p', { class: 'gs-pause-offen-weiter' }, h('button', { type: 'button', class: 'gs-leiser-knopf', 'data-pruef': 'pause-zur-offenen', onclick: () => o.tue(geheZu(g, stand, { ort: 'kapitel', kapitel: offeneImAkt.id, teil: 'frage' })) }, w.zurOffenen(stelleAufWeg(o, offeneImAkt), offeneImAkt.titel), sym('pfeilRechts'))) : null,
    o.bedienbar && naechster !== undefined
      ? h('p', { class: 'gs-pause-weiter' }, h('button', { type: 'button', class: 'gs-knopf gs-knopf-gross', 'data-pruef': 'pause-weiter', onclick: () => o.tue(weiter(g, stand)) }, weiterTitel, sym('pfeilRechts')))
      : null);
}

/* ---------------------------------------------------------------- Schritte -- */

/**
 * Steckbrief einer Figur im Auftakt (P17.5): Porträt, Name und Rolle stehen offen, der Text in einem Aufklapper – der
 * Auftakt steht vor der Wahl des Wegs und zählt so auch für die Kurzfassung. Auf der Leinwand offen.
 */
function steckbriefText(o: SchrittOptionen, name: string, html: string): HTMLElement {
  return h('details', { class: 'gs-steckbrief-auf', open: !o.bedienbar },
    h('summary', null, w.steckbrief, h('span', { class: 'nur-sr' }, `: ${name}`)),
    h('p', { class: 'gs-steckbrief-text' }, inhaltInline(html)));
}

function auftakt(o: SchrittOptionen): HTMLElement {
  const { g } = o;
  const knopf = (kurz: boolean, text: string, klasse: string): HTMLElement => o.bedienbar
    ? h('button', { type: 'button', class: klasse, 'data-pruef': kurz ? 'fassung-kurz' : 'fassung-lang', onclick: () => o.tue(beginne(g, o.stand, kurz)) }, text, sym('pfeilRechts'))
    : h('span', { class: klasse }, text);
  const alle = wegKapitel(g, false);
  const kurzWeg = wegKapitel(g, true);
  const inKurz = alle.map((k) => kurzWeg.includes(k));
  const minuten = (t: string): string => /etwa \d+ Minuten/u.exec(t)?.[0] ?? '';
  const wegKarte = (kurz: boolean): HTMLElement => {
    const n = alle.length;
    const gespielt = kurz ? kurzWeg.length : n;
    return h('div', { class: `gs-wegkarte ${kurz ? 'gs-wegkarte-kurz' : 'gs-wegkarte-lang'}`, 'data-pruef': kurz ? 'weg-karte-kurz' : 'weg-karte-lang' },
      h('div', { class: 'gs-weg-bild', 'aria-hidden': 'true' },
        vonHtml(wegSkizze(kurz ? inKurz : inKurz.map(() => true), kurz ? w.wegBildKurz(n, gespielt) : w.wegBildLang(n), kurz))),
      h('h3', { class: 'gs-weg-titel' }, kurz ? w.wegKurzTitel : w.wegLangTitel),
      h('p', { class: 'gs-weg-meta' }, `${w.wegEntscheidungen(gespielt)} · ${minuten(kurz ? g.auftakt.kurz : W.start.storyMeta(n))}`),
      h('p', { class: 'gs-weg-text' }, kurz ? w.wegKurzText : w.wegLangText),
      knopf(kurz, kurz ? w.wegKurzKnopf : g.auftakt.los, kurz ? 'gs-knopf gs-knopf-kurz' : 'gs-knopf gs-knopf-gross'));
  };
  const start = balken(g, o.stand, { ort: 'auftakt' });
  return h('article', { class: 'gs-schritt gs-auftakt', 'data-teil': 'auftakt' },
    // „fiktiv“ einmal je Ansicht (L-227): der Auftakt sagt es im ersten Satz, das Ende im Abbinder
    h('div', { class: 'gs-buehnenbild' }, campus(g.auftakt.campus, 'gs-campus-gross')),
    h('header', { class: 'gs-auftakt-kopf' },
      h('h1', { class: 'gs-titel gs-titel-gross', tabindex: -1, 'data-pruef': 'gs-titel' }, g.titel),
      h('div', { class: 'gs-lead' }, inhalt(g.auftakt.textHtml))),
    // O-61: zwei gleichwertige Wegkarten – derselbe Weg einmal ganz, einmal gekürzt (Skizze mit besetzten und übersprungenen Stationen)
    h('section', { class: 'gs-wege', 'aria-labelledby': 'gs-wege-titel' },
      h('h2', { id: 'gs-wege-titel', class: 'gs-h2' }, w.wegWahl),
      h('div', { class: 'gs-wege-karten' }, wegKarte(false), wegKarte(true))),
    h('section', { class: 'gs-figuren', 'aria-labelledby': 'gs-figuren-titel' },
      h('h2', { id: 'gs-figuren-titel', class: 'gs-h2' }, g.auftakt.vorstellung),
      h('ul', { class: 'gs-figuren-liste' },
        g.figuren.map((f) => h('li', { class: 'gs-steckbrief', 'data-akzent': f.akzent, 'data-pruef': `figur-${f.id}` },
          bildnis(f.id as Figur, 120),
          h('h3', { class: 'gs-steckbrief-name' }, f.name),
          h('p', { class: 'gs-steckbrief-rolle' }, f.rolle),
          steckbriefText(o, f.name, f.steckbriefHtml)))),
      // „Sie“ ist keine der fünf Begleitfiguren: eigene Zeile darunter (R72)
      h('h2', { class: 'gs-h2 gs-figuren-sie-titel' }, w.undSie),
      h('ul', { class: 'gs-figuren-liste gs-figuren-sie' },
        h('li', { class: 'gs-steckbrief gs-steckbrief-sie', 'data-akzent': 'marke', 'data-pruef': 'figur-sie' },
          bildnis('sie', 120),
          h('h3', { class: 'gs-steckbrief-name' }, w.sie),
          h('p', { class: 'gs-steckbrief-rolle' }, w.sieRolle),
          steckbriefText(o, w.sie, g.sieHtml)))),
    h('section', { class: 'gs-stand-erklaert', 'aria-labelledby': 'gs-stand-titel' },
      h('h2', { id: 'gs-stand-titel', class: 'gs-h2' }, w.balkenTitel),
      balkenTafel(g, start, { gross: true, pruef: 'gs-stand-start' }),
      h('dl', { class: 'gs-stand-texte' }, g.balken.map((b) => h('div', { 'data-balken': b.id }, h('dt', null, b.titel), h('dd', null, inhaltInline(b.html)))))));
}

/**
 * Zeilen einer Szene auf diesem Weg: die Kurzfassung lässt Zeilen mit `kurzfassung: false` weg (P17.5); Echo-Zeilen bekommen die
 * Fassung nach der gespielten Antwort ihrer Quelle (P19.4, `loeseZeile`).
 */
function zeilenDesWegs(g: Geschichte, stand: Stand, zeilen: readonly Zeile[]): Zeile[] {
  return (stand.kurz ? zeilen.filter((z) => z.kurzfassung) : [...zeilen]).map((z) => loeseZeile(g, stand, z));
}

function szene(o: SchrittOptionen, k: Kapitel): HTMLElement {
  const einstieg = o.stand.kurz && k.einstiegKurzHtml !== null ? k.einstiegKurzHtml : k.einstiegHtml;
  return h('article', { class: 'gs-schritt gs-szene', 'data-teil': 'szene' },
    o.stand.kurz ? brueckenKarten(o.g, k) : null,
    aktKopf(o, k),
    kopf(o, k, k.zeit),
    h('div', { class: 'gs-buehnenbild' }, campus(k.campus, 'gs-campus-gross', k.zusatz)),
    h('div', { class: 'gs-einstieg', 'data-pruef': 'gs-einstieg' }, inhalt(loeseEchos(o.g, o.stand, einstieg)), gegenstand(k.bildSzene, 104, 'gs-gegenstand gs-gegenstand-einstieg')),
    dialog(o.g, zeilenDesWegs(o.g, o.stand, k.szene)));
}

function antwortKarte(o: SchrittOptionen, k: Kapitel, a: Antwort, platz: number): HTMLElement {
  const gewaehlt = o.stand.wahlen[k.id] === platz;
  const andere = o.stand.wahlen[k.id] !== undefined && !gewaehlt;
  const innen: Kind[] = [
    h('span', { class: 'gs-antwort-nr', 'aria-hidden': 'true' }, String(platz + 1)),
    h('span', { class: 'gs-antwort-text' }, inhaltInline(a.html)),
    gewaehlt ? h('span', { class: 'gs-antwort-marke' }, sym('haken'), w.gewaehlt) : null,
  ];
  const attr = { class: `gs-antwort${andere ? ' ist-andere' : ''}`, 'aria-pressed': gewaehlt ? 'true' : 'false', 'data-platz': platz, 'data-pruef': `antwort-${platz + 1}` };
  return o.bedienbar
    ? h('button', { ...attr, type: 'button', onclick: () => o.tue(waehle(o.g, o.stand, k.id, platz)) }, innen)
    : h('div', attr, innen);
}

function frage(o: SchrittOptionen, k: Kapitel): HTMLElement {
  const { g, stand } = o;
  const platz = stand.wahlen[k.id];
  const a = platz !== undefined ? k.antworten[platz] ?? null : null;
  const vorher = balkenBis(g, stand, k.nr - 1);
  const nachher = balkenBis(g, stand, k.nr);
  // „Das steckt dahinter“ und die Vertiefung stehen am Ende der Station: hier, wenn die Frage der letzte Teil ist (P19.5: Mini vor der Frage)
  const mitDahinter = endetStation(k, stand.kurz, 'frage');
  const nachMandat = g.kapitel.some((x) => x.mandatNachFolge && x.nr < k.nr);
  return h('article', { class: 'gs-schritt gs-frage', 'data-teil': 'frage' },
    kopf(o, k, k.zeit),
    h('section', { class: 'gs-frage-block', 'aria-labelledby': 'gs-frage-text' },
      h('div', { class: 'gs-frage-figur' }, bildnis('sie', 88), gegenstand(k.bildFrage, 64, 'gs-gegenstand gs-gegenstand-frage')),
      h('div', { class: 'gs-frage-inhalt' },
        h('p', { class: 'gs-kicker gs-kicker-gold' }, w.ihreEntscheidung),
        h('h2', { id: 'gs-frage-text', class: 'gs-frage-text' }, inhaltInline(k.frageHtml)))),
    nachMandat ? h('details', { class: 'gs-mandat-auf', 'data-pruef': 'gs-mandat-auf' }, h('summary', null, sym('dokument'), w.mandatZeigen), mandatKarte(g)) : null,
    h('div', { class: 'gs-antworten', role: 'group', 'aria-label': w.antworten }, k.antworten.map((x, i) => antwortKarte(o, k, x, i))),
    a === null ? null : h('section', { class: 'gs-folge', 'aria-labelledby': 'gs-folge-titel', 'data-pruef': 'gs-folge', 'data-wertung-nie-sichtbar': null },
      h('h2', { id: 'gs-folge-titel', class: 'gs-h2 gs-folge-titel', tabindex: -1, 'data-pruef': 'gs-folge-titel' }, w.folgeTitel),
      h('div', { class: 'gs-folge-szene' }, gegenstand(a.bild, 96, 'gs-gegenstand gs-gegenstand-folge'), h('div', { class: 'gs-folge-text' }, inhalt(loeseEchos(g, stand, folgeHtmlFuer(stand, a))))),
      k.campusNachher !== null ? h('div', { class: 'gs-buehnenbild gs-buehnenbild-nachher' }, campus(k.campusNachher, 'gs-campus-gross')) : null,
      h('div', { class: 'gs-wirkung' },
        h('h3', { class: 'gs-wirkung-titel' }, w.wirkungTitel),
        balkenTafel(g, nachher, { vorher, wirkung: a.wirkung, gross: true, pruef: 'gs-stand-folge' })),
      k.mandatNachFolge ? mandatKarte(g) : null,
      kasten('gut', w.gutTitel, sym('haken'), inhalt(gutHtmlFuer(stand, k))),
      mitDahinter ? dahinter(o, k) : null,
      mitDahinter ? vertiefungKasten(o, k) : null));
}

/**
 * Vertiefung (P19.5): am Ende der Station, zugeklappt, nur auf dem ganzen Weg und nur am Bildschirm (nicht im Druck, nicht auf der
 * Leinwand). Die Titelzeile hat zwei Teile – die Form als Kicker, der Titel als Frage; „Zum Nachdenken“ und „Ein zweiter Fall“ halten
 * die Antwort hinter einem zweiten Aufklapper „Antwort“, „Warum so?“ erklärt in Absätzen.
 */
export function vertiefung(v: Vertiefung, kennung: string): HTMLElement {
  const absaetze = (liste: readonly string[]): HTMLElement[] => liste.map((t) => h('p', null, inhaltInline(t)));
  return h('details', { class: `gs-vertiefung gs-vertiefung-${v.form}`, 'data-pruef': `gs-vertiefung-${kennung}`, 'data-form': v.form },
    h('summary', { class: 'gs-vertiefung-kopf' },
      h('span', { class: 'gs-kicker gs-vertiefung-form' }, w.vertiefungForm[v.form] ?? v.form),
      h('span', { class: 'gs-vertiefung-titel' }, v.titel)),
    h('div', { class: 'gs-vertiefung-text' },
      absaetze(v.absaetzeHtml),
      v.antwortHtml !== undefined ? h('details', { class: 'gs-vertiefung-antwort', 'data-pruef': 'gs-vertiefung-antwort' }, h('summary', null, w.vertiefungAntwort), absaetze(v.antwortHtml)) : null));
}

function vertiefungKasten(o: SchrittOptionen, k: Kapitel): HTMLElement | null {
  if (k.vertiefung === undefined || o.stand.kurz || !o.bedienbar) return null;
  return vertiefung(k.vertiefung, k.id);
}

/* ---------------------------------------------------------- Mini-Aufgaben -- */

/** Rahmen eines Mini-Schritts, gleich für jede Art; Aufgabenkörper und Stand-Zeile liefert der Baustein der Art (`geschichte-mini.ts`). */
function miniSchritt(o: SchrittOptionen, k: Kapitel): HTMLElement {
  const m = k.mini as Mini;
  const baustein = miniBaustein(m.art);
  const aus = werteMiniAus(m, o.stand.mini[k.id]);
  return h('article', { class: 'gs-schritt gs-mini', 'data-teil': 'mini', 'data-art': m.art },
    kopf(o, k, `${w.miniKicker} · ${m.titel}`),
    h('section', { class: 'gs-mini-aufgabe', 'aria-labelledby': 'gs-mini-aufgabe' },
      h('span', { class: 'gs-mini-symbol', 'aria-hidden': 'true' }, sym('puzzle')),
      h('p', { id: 'gs-mini-aufgabe', class: 'gs-mini-auftrag' }, inhaltInline(m.aufgabeHtml)),
      gegenstand(m.bild, 96, 'gs-gegenstand gs-mini-bild')),
    baustein.zeichne(o, k, m),
    h('div', { class: 'gs-mini-fuss' },
      h('p', { class: 'gs-mini-stand', role: 'status', 'data-pruef': 'mini-stand' }, baustein.standZeile(o.stand.mini[k.id], m, aus)),
      o.bedienbar && (o.stand.mini[k.id]?.some((x) => x >= 0) ?? false)
        ? h('button', { type: 'button', class: 'gs-leiser-knopf', 'data-pruef': 'mini-nochmal', onclick: () => o.tue(miniVonVorn(o.stand, k.id)) }, sym('zurueckspulen'), w.miniNochmal) : null),
    endetStation(k, o.stand.kurz, 'mini') ? dahinter(o, k) : null,
    endetStation(k, o.stand.kurz, 'mini') ? vertiefungKasten(o, k) : null);
}

/* --------------------------------------------------------------- Vergleich -- */

function punktReihe(n: number): HTMLElement {
  return h('span', { class: 'gs-punkte', 'aria-hidden': 'true' }, [1, 2, 3, 4, 5].map((i) => h('span', { class: i <= n ? 'ist-voll' : null })));
}

function vergleichSchritt(o: SchrittOptionen, k: Kapitel): HTMLElement {
  const v = k.vergleich as Vergleich;
  const gew = gewichte(o.g, o.stand);
  const ab = abgestimmteGewichte(v);
  const lage = vergleichLage(v, gew);
  const max = Math.max(1, ...lage.plaetze.map((p) => p.summe));
  const titel = (id: string): string => v.optionen.find((x) => x.id === id)?.titel ?? id;
  const krit = (id: string): string => v.kriterien.find((x) => x.id === id)?.imSatz ?? id;
  const vornTexte = lage.vorn.map(titel);
  const vornSumme = lage.plaetze[0]?.summe ?? 0;
  const statusText = lage.vorn.length > 1 ? w.gleichauf(vornTexte, vornSumme) : w.vorn(vornTexte[0] ?? '', vornSumme);
  const eigen = o.stand.gewichte !== null;
  const kippListe = lage.kipp.length === 0 ? h('p', null, w.kippKeiner)
    : h('ul', null, lage.kipp.map((x) => h('li', null, w.kipp(krit(x.kriterium), x.gewicht, gew[x.kriterium] ?? x.gewicht, x.spitze.map(titel)))));
  return h('article', { class: 'gs-schritt gs-vergleich', 'data-teil': 'vergleich' },
    kopf(o, k, `${w.vergleichKicker} · ${w.vergleichTitel}`),
    h('div', { class: 'gs-vgl-einleitung' }, bildnis('faden', 64), h('div', { class: 'gs-blase', 'data-akzent': 'lagune' }, inhalt(v.einleitungHtml)), gegenstand('waage', 96, 'gs-gegenstand gs-gegenstand-waage')),
    h('div', { class: 'gs-vgl-karten', 'data-pruef': 'gs-vgl-karten' },
      v.optionen.map((opt, i) => {
        const p = lage.plaetze.find((x) => x.option.id === opt.id);
        const rang = p?.rang ?? 0;
        return h('section', { class: `gs-vgl-karte${rang === 1 ? ' ist-vorn' : ''}`, 'data-option': opt.id, 'data-farbe': ['violett', 'orange', 'lagune'][i] ?? 'blau', style: `order:${(rang * 10) + i}`, 'aria-labelledby': `gs-vgl-${opt.id}`, 'data-pruef': `vgl-${opt.id}` },
          h('header', { class: 'gs-vgl-kopf' },
            h('span', { class: 'gs-vgl-buchstabe', 'aria-hidden': 'true' }, opt.id),
            h('h2', { id: `gs-vgl-${opt.id}`, class: 'gs-vgl-titel' }, opt.titel),
            h('span', { class: 'gs-vgl-platz', 'data-pruef': `platz-${opt.id}` }, w.platz(rang))),
          h('dl', { class: 'gs-vgl-kriterien' }, v.kriterien.map((c) => h('div', null,
            h('dt', null, c.titel, h('span', { class: 'nur-sr' }, `: ${w.punkteVon(opt.punkte[c.id] ?? 0)}`)),
            h('dd', null, punktReihe(opt.punkte[c.id] ?? 0), h('span', { class: 'gs-vgl-worte' }, opt.worte[c.id] ?? ''))))),
          h('footer', { class: 'gs-vgl-summe' },
            h('span', { class: 'gs-vgl-spur', 'aria-hidden': 'true' }, h('span', { class: 'gs-vgl-fuellung', style: `--anteil:${Math.round(((p?.summe ?? 0) / max) * 100)}%` })),
            h('small', { 'data-pruef': `summe-${opt.id}` }, w.punkte(p?.summe ?? 0))));
      })),
    h('section', { class: 'gs-vgl-gewichte', 'aria-labelledby': 'gs-gewichte-titel', 'data-pruef': 'gs-gewichte' },
      h('h2', { id: 'gs-gewichte-titel', class: 'gs-h2' }, w.wasWichtiger),
      h('div', { class: 'gs-gewichte-liste' }, v.kriterien.map((c) => h('fieldset', { class: 'gs-gewicht' },
        h('legend', null, c.titel),
        h('div', { class: 'gs-stufen' }, STUFEN_GEWICHT.map((s) => {
          const an = gew[c.id] === s;
          const kinder: Kind[] = [w.stufen[s] ?? String(s), ab[c.id] === s ? h('span', { class: 'gs-abgestimmt', title: w.abgestimmt }, h('span', { class: 'nur-sr' }, ` (${w.abgestimmt})`)) : null];
          return o.bedienbar
            ? h('button', { type: 'button', class: 'gs-stufe', 'aria-pressed': an ? 'true' : 'false', 'data-stufe': s, 'data-pruef': `stufe-${c.id}-${s}`, onclick: () => o.tue(setzeGewicht(o.g, o.stand, c.id, s)) }, kinder)
            : h('span', { class: 'gs-stufe', 'aria-pressed': an ? 'true' : 'false', 'data-stufe': s }, kinder);
        }))))),
      h('div', { class: 'gs-vgl-status' },
        h('p', { class: 'gs-vgl-vorn', role: 'status', 'data-pruef': 'gs-vgl-vorn' }, statusText),
        o.bedienbar ? h('button', { type: 'button', class: 'gs-leiser-knopf', 'data-pruef': 'gewichte-abgestimmt', disabled: !eigen, onclick: () => o.tue(setzeAbgestimmt(o.stand)) }, sym('zurueckspulen'), w.abgestimmteGewichte) : null)),
    h('div', { class: 'gs-vgl-satz' }, bildnis('faden', 56),
      h('div', { class: 'gs-blase', 'data-akzent': 'lagune' }, h('p', { class: 'gs-sprecher' }, w.projektsteuerinSagt), h('p', { 'data-pruef': 'gs-vgl-satz' }, inhaltInline(v.saetze[lage.satz] ?? '')))),
    // Kipppunkte: auf dem ganzen Weg offen; in der bedienbaren Kurzfassung aufklappbar (P17.5 – die Empfehlung nennt den nächstliegenden)
    o.stand.kurz && o.bedienbar
      ? h('details', { class: 'gs-vgl-kipp gs-vgl-kipp-auf', 'data-pruef': 'gs-kipp' }, h('summary', { class: 'gs-h3' }, w.kippTitel), kippListe)
      : h('section', { class: 'gs-vgl-kipp', 'aria-labelledby': 'gs-kipp-titel', 'data-pruef': 'gs-kipp' }, h('h3', { id: 'gs-kipp-titel', class: 'gs-h3' }, w.kippTitel), kippListe),
    h('section', { class: 'gs-vgl-empfehlung', 'data-pruef': 'gs-empfehlung' },
      gegenstand('stempel', 64, 'gs-gegenstand'),
      h('div', null, inhalt(v.empfehlungHtml), inhalt(v.werHtml))));
}

/* ------------------------------------------------------------------- Ende -- */

const BILANZ_BILD: Record<string, string> = { ruhig: 'sonne', umwege: 'wegweiser', 'letzte-meter': 'stoppuhr', 'nicht-getragen': 'bruecke', offen: 'notizzettel' };

function ende(o: SchrittOptionen): HTMLElement {
  const { g, stand } = o;
  const b = balken(g, stand, { ort: 'ende' });
  const typ = bilanzAmEnde(g, stand);
  const e = g.ende;
  const fassung = endeFassung(g, stand);
  const ersatz = fassung === 'vertrauen-niedrig' ? e.vertrauenNiedrig : fassung === 'nach-falle' ? e.nachFalle : fassung === 'offen' ? e.offen : [];
  // eine Ersatzzeile steht auf denselben Wegen wie die ersetzte (L-239); bei offenen Entscheidungen nur die Zeilen der
  // Kurzfassung – die übrigen setzen eine gespielte Geschichte voraus (R74)
  const zeilen = zeilenDesWegs(g, typ === 'offen' ? { ...stand, kurz: true } : stand, e.szene).map((z) => {
    const neu = ersatz.find((x) => x.figur === z.figur);
    return neu === undefined ? z : { ...neu, kurzfassung: z.kurzfassung };
  });
  const einstieg = stand.kurz && e.einstiegKurzHtml !== null ? e.einstiegKurzHtml : e.einstiegHtml;
  const offeneListe = offeneKapitel(g, stand);
  const offen = offeneListe.length;
  const erstesOffen = offeneListe[0] ?? null;
  return h('article', { class: 'gs-schritt gs-ende', 'data-teil': 'ende', 'data-bilanz': typ, 'data-fassung': fassung },
    stand.kurz ? brueckenKarten(g, null) : null,
    h('header', { class: 'gs-kopf gs-kopf-ende' },
      h('span', { class: 'gs-nummer gs-nummer-ende', 'aria-hidden': 'true' }, gegenstand('schulglocke', 56, 'gs-nummer-bild')),
      h('div', { class: 'gs-kopf-text' },
        h('p', { class: 'gs-kicker' }, e.zeit),
        h('h1', { class: 'gs-titel', tabindex: -1, 'data-pruef': 'gs-titel' }, w.ende))),
    h('div', { class: 'gs-buehnenbild' }, campus(e.campus, 'gs-campus-gross gs-campus-ende', null, typ !== 'offen' && stufe(b.zeit) === 'niedrig')),
    h('div', { class: 'gs-einstieg', 'data-pruef': 'gs-einstieg' }, inhalt(einstieg),
      // wie die Sätze je Balken ein Urteil über den ganzen Weg – bei offenen Entscheidungen nicht (R75)
      typ !== 'offen' && stufe(b.zeit) === 'niedrig' ? h('div', { 'data-pruef': 'gs-zeit-niedrig' }, inhalt(e.zeitNiedrigHtml)) : null, gegenstand('schulbus', 104, 'gs-gegenstand gs-gegenstand-einstieg')),
    dialog(g, zeilen),
    // P19.3: nach dem letzten Akt steht „Das können Sie jetzt“ vor der Bilanz (nur auf dem ganzen Weg; die Kurzfassung hat keine Pause)
    (() => { const letzterAkt = akteVon(g).at(-1); return letzterAkt !== undefined && !stand.kurz ? koennen(letzterAkt, 'gs-koennen-ende') : null; })(),
    h('section', { class: 'gs-bilanz', 'aria-labelledby': 'gs-bilanz-titel', 'data-pruef': 'gs-bilanz' },
      h('div', { class: 'gs-bilanz-kopf' },
        gegenstand(BILANZ_BILD[typ] ?? null, 112, 'gs-gegenstand gs-bilanz-bild'),
        h('div', null,
          h('p', { class: 'gs-kicker gs-kicker-gold' }, w.bilanzTitel),
          h('h2', { id: 'gs-bilanz-titel', class: 'gs-bilanz-titel', 'data-pruef': 'gs-bilanz-titel' }, g.bilanz[typ].titel),
          h('p', { class: 'gs-bilanz-text' }, inhaltInline(g.bilanz[typ].html)))),
      balkenTafel(g, b, { gross: true, pruef: 'gs-stand-ende' }),
      // die Sätze je Balken urteilen über den ganzen Weg – bei offenen Entscheidungen nur die Balken (R73)
      typ === 'offen' ? null : h('ul', { class: 'gs-bilanz-saetze' }, g.balken.map((x) => h('li', { 'data-balken': x.id }, h('b', null, `${x.titel}: `), inhaltInline(x.bilanz[stufe(b[x.id])])))),
      // P19.4: der Verlauf der ganzen Geschichte gehört zur Bilanz der erweiterten Story (mit Akten); bei offenen Stationen mit Lücke
      akteVon(g).length > 0 ? verlauf(g, stand, Number.POSITIVE_INFINITY, w.verlaufBilanz, !o.bedienbar) : null,
      offen > 0 ? h('p', { class: 'gs-leise', 'data-pruef': 'gs-offen' }, w.offen(offen)) : null),
    o.bedienbar ? h('nav', { class: 'gs-ende-wege', 'aria-label': w.ende },
      // P19.3: vom Ende der Kurzfassung in die ganze Geschichte, an der ersten nicht gespielten Station
      stand.kurz && g.kapitel.some((k) => !k.kurzfassung) ? h('button', { type: 'button', class: 'gs-knopf', 'data-pruef': 'weiter-ganz', onclick: () => o.tue(weiterMitGanzer(g, stand)) }, w.weiterGanz, sym('pfeilRechts')) : null,
      // R75: von der Bilanz mit offenen Entscheidungen direkt zur ersten offenen Frage
      erstesOffen !== null ? h('button', { type: 'button', class: 'gs-knopf', 'data-pruef': 'zur-offenen', onclick: () => o.tue(geheZu(g, stand, { ort: 'kapitel', kapitel: erstesOffen.id, teil: 'frage' })) }, w.zurOffenen(stelleAufWeg(o, erstesOffen), erstesOffen.titel), sym('pfeilRechts')) : null,
      h('button', { type: 'button', class: 'gs-knopf', 'data-pruef': 'von-vorn', onclick: () => o.tue(neuerStand()) }, sym('zurueckspulen'), w.vonVorn),
      h('a', { class: 'gs-knopf gs-knopf-still', href: '#theorie', 'data-pruef': 'ende-themen' }, w.zuDenThemen, sym('pfeilRechts'))) : null,
    h('p', { class: 'gs-abbinder' }, `${w.fiktiv}. ${W.rahmen.angebot} Bauherr Mentoren – `, o.bedienbar ? bmLink() : W.rahmen.kontaktBm));
}

/** Ein Schritt der Story als Artikel (rein aus Geschichte und Stand). */
export function baueSchritt(o: SchrittOptionen): HTMLElement {
  const s = o.stand.schritt;
  if (s.ort === 'auftakt') return auftakt(o);
  if (s.ort === 'ende') return ende(o);
  if (s.ort === 'pause') {
    const a = aktVonId(o.g, s.akt);
    return a === null ? auftakt(o) : pauseSchritt(o, a);
  }
  const k = kapitelVon(o.g, s.kapitel);
  if (k === null) return auftakt(o);
  if (s.teil === 'szene') return szene(o, k);
  if (s.teil === 'vergleich' && k.vergleich !== null) return vergleichSchritt(o, k);
  if (s.teil === 'mini' && k.mini !== null) return miniSchritt(o, k);
  return frage(o, k);
}

/* ------------------------------------------------------------- Leiste oben -- */

/** Station und Akt, bei denen der Schritt steht (Pause: die letzte Station des Akts); null am Auftakt und am Ende. */
function stationAmSchritt(g: Geschichte, s: Schritt): { k: Kapitel; a: Akt | null } | null {
  if (s.ort === 'kapitel') { const k = kapitelVon(g, s.kapitel); return k === null ? null : { k, a: aktVon(g, k.id) }; }
  if (s.ort === 'pause') { const a = aktVonId(g, s.akt); const k = a === null ? null : letzteStation(g, a); return a === null || k === null ? null : { k, a }; }
  return null;
}

/**
 * Kurzer Name des Orts. Ohne Akte: „3 von 8 · Wie gefährlich ist das?“. Mit Akten (P19.3): „Station 7 von 14 · Akt II · noch etwa
 * 9 Minuten“ (Restzeit aus der gemessenen Lesezeit je Schritt, deterministisch; fehlt die Messung, steht sie nicht da); in der Pause
 * „Pause · Akt I geschafft“.
 */
export function ortText(g: Geschichte, stand: Stand, lz: Lesezeit = LESEZEIT): string {
  const s = stand.schritt;
  if (s.ort === 'auftakt') return w.auftakt;
  if (s.ort === 'ende') return w.endeOrt;
  const weg = wegKapitel(g, stand.kurz);
  const hier = stationAmSchritt(g, s);
  const i = weg.findIndex((k) => k.id === hier?.k.id);
  if (akteVon(g).length === 0) return `${w.vonN(i + 1, weg.length)} · ${weg[i]?.titel ?? ''}`;
  const rest = restWoerter(g, stand, lz);
  const teile = [
    s.ort === 'pause' && hier?.a ? w.pauseOrt(roemisch(aktNummer(g, hier.a))) : w.stationVonN(i + 1, weg.length),
    s.ort === 'pause' || hier?.a == null ? null : w.aktNr(roemisch(aktNummer(g, hier.a))),
    rest === null ? null : w.restMinuten(minutenAus(rest, lz.woerterJeMinute)),
  ];
  return teile.filter((t): t is string => t !== null).join(' · ');
}

/** Fortschrittslinie: ein Feld je Kapitel des Wegs (bedienbar = Sprung zur Szene), dazu Auftakt und Schulstart. Mit Akten: Akt-Leiste. */
export function fortschritt(g: Geschichte, stand: Stand, bedienbar: boolean, tue: (neu: Stand) => void): HTMLElement {
  const weg = wegKapitel(g, stand.kurz);
  const s = stand.schritt;
  const hier = s.ort === 'kapitel' ? weg.findIndex((k) => k.id === s.kapitel) : s.ort === 'ende' ? weg.length : s.ort === 'pause' ? weg.findIndex((k) => k.id === stationAmSchritt(g, s)?.k.id) : -1;
  const feld = (inhaltText: Kind, name: string, ziel: Schritt, zustand: string, art: string): HTMLElement => {
    const attrs = { class: 'gs-feld', 'data-zustand': zustand, 'data-art': art, 'aria-current': zustand === 'jetzt' ? 'step' : null, title: name };
    return h('li', null, bedienbar
      ? h('button', { ...attrs, type: 'button', 'aria-label': name, onclick: () => tue(geheZu(g, stand, ziel)) }, inhaltText)
      : h('span', { ...attrs, 'aria-label': name }, inhaltText));
  };
  const kapitelFeld = (k: Kapitel, i: number): HTMLElement => feld(String(k.nr), `${w.vonN(i + 1, weg.length)} · ${k.titel}`, { ort: 'kapitel', kapitel: k.id, teil: 'szene' },
    i === hier ? 'jetzt' : zaehlendePlatz(stand, k) !== null ? 'erledigt' : 'offen', 'kapitel');
  const anfang = feld(sym('flagge'), w.auftakt, { ort: 'auftakt' }, s.ort === 'auftakt' ? 'jetzt' : 'erledigt', 'rand');
  const schluss = feld(sym('stempel'), w.endeOrt, { ort: 'ende' }, s.ort === 'ende' ? 'jetzt' : 'offen', 'rand');
  const akte = akteVon(g);
  if (akte.length === 0) {
    return h('nav', { class: 'gs-fortschritt', 'aria-label': w.fortschritt, 'data-pruef': 'gs-fortschritt' },
      h('ol', { class: 'gs-felder' }, anfang, weg.map(kapitelFeld), schluss));
  }
  // Akt-Leiste (P19.3): nur der Akt der gezeigten Station ist aufgeklappt (ein Feld je Station), die übrigen sind je ein Feld
  // mit der römischen Zahl; dazu ein Sprungmenü mit allen Stationen. Der Weg (Kurzfassung) zählt nur die Stationen, die er zeigt.
  const aktHier = stationAmSchritt(g, s)?.a ?? null;
  const gruppen = akte.map((a, j) => {
    const stationen = weg.map((k, i) => ({ k, i })).filter(({ k }) => a.stationen.includes(k.id));
    return { a, j, stationen };
  }).filter((x) => x.stationen.length > 0);
  const aktName = (a: Akt): string => w.aktTitel(roemisch(aktNummer(g, a)), a.titel);
  const felder = gruppen.map(({ a, stationen }) => {
    if (a === aktHier) return stationen.map(({ k, i }) => kapitelFeld(k, i));
    const erste = stationen[0]?.k as Kapitel;
    const vorbei = hier >= 0 && (stationen[stationen.length - 1]?.i ?? 0) < hier;
    return [feld(roemisch(aktNummer(g, a)), aktName(a), { ort: 'kapitel', kapitel: erste.id, teil: 'szene' }, vorbei ? 'erledigt' : 'offen', 'akt')];
  });
  const menue = bedienbar ? h('details', { class: 'gs-sprung', 'data-pruef': 'gs-sprung' },
    h('summary', { class: 'gs-sprung-knopf' }, w.stationWaehlen),
    h('div', { class: 'gs-sprung-liste', role: 'group', 'aria-label': w.stationWaehlenListe },
      gruppen.map(({ a, stationen }) => h('div', { class: 'gs-sprung-akt' },
        h('p', { class: 'gs-sprung-akt-titel' }, aktName(a)),
        h('ul', null, stationen.map(({ k, i }) => h('li', null,
          h('button', { type: 'button', class: 'gs-sprung-station', 'aria-current': i === hier ? 'step' : null, 'data-pruef': `sprung-${k.id}`,
            onclick: () => tue(geheZu(g, stand, { ort: 'kapitel', kapitel: k.id, teil: 'szene' })) }, `${k.nr} · ${k.titel}`)))))))) : null;
  return h('nav', { class: 'gs-fortschritt gs-fortschritt-akte', 'aria-label': w.aktLeiste, 'data-pruef': 'gs-fortschritt' },
    h('ol', { class: 'gs-felder' }, anfang, felder, schluss),
    menue);
}

/** Zustand des Buchs in der Leiste (P19.4): ob die Seite offen ist, ob es einen neuen Eintrag gibt, und wie sie umgeschaltet wird. */
export interface BuchLeiste {
  offen: boolean;
  neu: boolean;
  umschalten: () => void;
}

/** Leiste oben: Fortschritt, Ort in Worten, Balken klein – bedienbar mit dem Symbol des Entscheidungsbuchs (sobald Station 1 abgeschlossen ist). */
export function leisteOben(g: Geschichte, stand: Stand, bedienbar: boolean, tue: (neu: Stand) => void, lz: Lesezeit = LESEZEIT, buch?: BuchLeiste): Node[] {
  const symbol = bedienbar && buch !== undefined ? buchSymbol(g, stand, buch) : null;
  const ort = h('p', { class: 'gs-ort', 'data-pruef': 'gs-ort' }, ortText(g, stand, lz));
  return [
    fortschritt(g, stand, bedienbar, tue),
    // ohne Buch bleibt die Leiste, wie sie war; mit Symbol steht es neben der Ortszeile
    symbol === null ? ort : h('div', { class: 'gs-ortzeile' }, ort, symbol),
    balkenTafel(g, balken(g, stand), { gross: false, pruef: 'gs-stand-leiste' }),
  ];
}

/* ------------------------------------------------------------------- Druck -- */

/** Eine Station im Druckbogen: Frage, Ihre Antwort (oder Brückensatz) und „So macht man es gut“; `ueberschrift` ist h2 (ohne Akte) bzw. h3 (unter der Akt-Überschrift). */
function druckStation(g: Geschichte, stand: Stand, k: Kapitel, hier: number, ueberschrift: 'h2' | 'h3'): HTMLElement {
  const a = gewaehlteAntwort(stand, k);
  const erzaehlt = stand.kurz && !k.kurzfassung;
  // „So macht man es gut“ wie am Bildschirm erst nach der eigenen Wahl – sonst stünde die Lösung vor der Frage (R73)
  const gewaehlt = !erzaehlt && a !== null;
  return h('section', { class: 'druck-teil', 'data-pruef': `druck-${k.id}` },
    h(ueberschrift, null, `${k.nr} · ${k.titel}`, h('small', null, ` · ${k.zeit}`)),
    // die Frage gibt der Antwort auf Papier ihren Bezug (R75); sie ist keine Wertung
    erzaehlt ? null : h('p', { class: 'druck-frage' }, inhaltInline(k.frageHtml)),
    // R76: ein erzähltes Kapitel trägt seinen Brückensatz – eine Antwort gab es dort nicht
    erzaehlt && hier > k.nr
      ? h('p', { class: 'druck-bruecke' }, h('b', null, `${w.druckBruecke}: `), inhaltInline(k.brueckeHtml ?? ''))
      : h('p', null, h('b', null, `${w.druckAntwort}: `), !erzaehlt && a !== null ? inhaltInline(a.html) : w.druckOffen),
    gewaehlt ? h('div', { class: 'druck-gut' }, h(ueberschrift === 'h2' ? 'h3' : 'h4', null, w.gutTitel), inhalt(k.gutHtml)) : null,
    // Mini-Registry: eine Art mit Papierfassung (`druck`) druckt ihren Zustand hier; die bisherigen Arten drucken nichts
    k.mini !== null && !stand.kurz ? miniBaustein(k.mini.art).druck?.(g, k, k.mini, stand.mini[k.id]) ?? null : null);
}

/** Druckbogen der Story (Strg+P): je Kapitel des Wegs Ihre Antwort und „So macht man es gut“, dazu die Bilanz. */
export function storyDruck(g: Geschichte, stand: Stand, version: string): { titel: string; teile: Node[] } {
  const b = balken(g, stand, { ort: 'ende' });
  const typ = bilanzAmEnde(g, stand);
  const s = stand.schritt;
  const amEnde = s.ort === 'ende';
  // bis wohin der Weg reicht: ein übersprungenes Kapitel ist „erzählt“, sobald seine Brücke (im nächsten Kapitel) erreicht ist
  const hier = amEnde ? Number.POSITIVE_INFINITY : stationAmSchritt(g, s)?.k.nr ?? 0;
  const offen = offeneKapitel(g, stand).length;
  return {
    titel: w.druckTitel,
    teile: [
      bogenKopf(`${w.druckTitel} · ${g.titel}`, version, true),
      h('div', { class: 'druck-story', 'data-pruef': 'story-druck' },
        // mit Akten (P19.3): je Akt ein Abschnitt mit Überschrift, zwischen den Akten ein Seitenumbruch; ohne Akte wie bisher
        akteVon(g).length === 0 ? g.kapitel.map((k) => druckStation(g, stand, k, hier, 'h2')) : akteVon(g).map((a) => h('section', { class: 'druck-akt', 'data-pruef': `druck-akt-${a.id}` },
          h('h2', { class: 'druck-akt-titel' }, w.aktTitel(roemisch(aktNummer(g, a)), a.titel), h('small', null, ` · ${a.zeitraum}`)),
          g.kapitel.filter((k) => a.stationen.includes(k.id)).map((k) => druckStation(g, stand, k, hier, 'h3')))),
        // die Bilanz nur, wenn das Ende erreicht ist – wie am Bildschirm, samt Hinweis auf offene Entscheidungen
        h('section', { class: 'druck-teil', 'data-pruef': 'druck-bilanz' }, amEnde
          ? [
            h('h2', null, `${w.bilanzTitel}: ${g.bilanz[typ].titel}`),
            h('p', null, inhaltInline(g.bilanz[typ].html)),
            // bei offenen Entscheidungen kein Urteil je Balken, aber ihr Stand in Worten – der Druck zeigt keine Balken (R74)
            h('ul', null, g.balken.map((x) => h('li', null, h('b', null, `${x.titel}: `),
              typ === 'offen' ? w.fuellstand[stufe(b[x.id])] ?? '' : inhaltInline(x.bilanz[stufe(b[x.id])])))),
            // P19.4: der Verlauf auf der Bilanzseite (Vektor, Linienart und Wort an der Linie, die Textfassung offen)
            akteVon(g).length > 0 ? verlauf(g, stand, Number.POSITIVE_INFINITY, w.verlaufBilanz, true) : null,
            offen > 0 ? h('p', null, w.offen(offen)) : null]
          : [h('h2', null, w.bilanzTitel), h('p', null, w.druckBilanzSpaeter)]),
        // P19.4: das Entscheidungsbuch auf einer eigenen Seite im Querformat, nur die Einträge bis zur aktuellen Station
        buchDruck(g, stand))],
  };
}

/* ------------------------------------------------------------------ Fläche -- */

export interface SpeicherGriff {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

export const SPEICHER_SCHLUESSEL = 'gk.story';

export function ladeStand(g: Geschichte, speicher: SpeicherGriff | null): Stand | null {
  try {
    const roh = speicher?.getItem(SPEICHER_SCHLUESSEL) ?? null;
    return roh === null ? null : leseStand(g, JSON.parse(roh));
  } catch {
    return null;
  }
}

export interface GeschichteFlaeche {
  element: HTMLElement;
  /** Permalink-Sprung (#story/k3) */
  zuKapitel(id: string): void;
  stand(): Stand;
  taste(e: KeyboardEvent): boolean;
  /** wird bei jeder Änderung gerufen (Adresszeile) */
  beiAenderung(fn: (s: Stand) => void): void;
}

/**
 * R67 (WCAG 2.4.11): Der Fokus liegt nie unter den klebenden Leisten. Ihre Höhen stehen als --gs-oben/--gs-unten auf
 * <html> (scroll-padding in geschichte.css); bleibt ein fokussiertes Element trotzdem darunter, rollt die Seite ohne
 * Animation gerade so weit, dass es frei steht.
 */
function haltFokusFrei(element: HTMLElement, leiste: HTMLElement, unten: HTMLElement): void {
  const RAND = 8;
  const masse = (): void => {
    const wurzel = document.documentElement.style;
    wurzel.setProperty('--gs-oben', `${Math.ceil(leiste.getBoundingClientRect().height) + RAND}px`);
    wurzel.setProperty('--gs-unten', `${Math.ceil(unten.getBoundingClientRect().height) + RAND}px`);
  };
  if (typeof ResizeObserver === 'function') {
    const beobachter = new ResizeObserver(masse);
    beobachter.observe(leiste);
    beobachter.observe(unten);
  }
  element.addEventListener('focusin', (e) => {
    const ziel = e.target;
    if (!(ziel instanceof HTMLElement)) return;
    masse();
    requestAnimationFrame(() => {
      if (!ziel.isConnected || ziel.closest('.gs-buehne') === null) return;
      const q = ziel.getBoundingClientRect();
      if (q.height === 0) return;
      const oben = leiste.getBoundingClientRect().bottom + RAND;
      const grenze = unten.getBoundingClientRect().top - RAND;
      let um = 0;
      if (q.top < oben) um = q.top - oben;
      else if (q.bottom > grenze) um = Math.min(q.bottom - grenze, q.top - oben);
      if (Math.abs(um) >= 1) window.scrollBy({ top: um, behavior: 'instant' });
    });
  });
}

export function erzeugeGeschichte(o: { g: Geschichte; speicher: SpeicherGriff | null; themaTitel: (id: string) => string | null; werkzeugTitel?: (id: string) => string | null; lesezeit?: Lesezeit }): GeschichteFlaeche {
  const { g } = o;
  const lz = o.lesezeit ?? LESEZEIT;
  const geladen = ladeStand(g, o.speicher);
  let stand: Stand = geladen ?? neuerStand();
  let zuhoerer: ((s: Stand) => void) | null = null;
  // Zeile „gespeichert“ in der Pause: nur, wenn der Stand tatsächlich im Browser liegt (geladen oder eben geschrieben)
  let gespeichertOk = geladen !== null;
  // Entscheidungsbuch (P19.4): die Seite liegt über der Station; „neu“ = Einträge, die beim letzten Öffnen noch nicht da waren (nur im Speicher der Seite)
  let buchOffen = false;
  const buchGesehen = new Set<string>();
  const leiste = h('div', { class: 'gs-leiste' });
  const buehne = h('div', { class: 'gs-buehne' });
  const navi = h('nav', { class: 'gs-navi', 'aria-label': w.fortschritt });
  const hinweis = h('p', { class: 'gs-navi-hinweis', role: 'status' });
  // eine Ansage für Folgen und Balken (aria-live), getrennt vom neu gezeichneten Schritt
  const ansage = h('p', { class: 'nur-sr', 'aria-live': 'polite', 'data-pruef': 'gs-ansage' });
  const unten = h('div', { class: 'gs-unten' }, hinweis, navi);
  const loeschen = h('button', { type: 'button', class: 'gs-leiser-knopf', 'data-pruef': 'fortschritt-loeschen', onclick: () => {
    try { o.speicher?.removeItem(SPEICHER_SCHLUESSEL); } catch { /* Speicher gesperrt: nichts zu löschen */ }
    // R68: gelöscht bleibt gelöscht – der frische Stand wird erst mit der nächsten Änderung wieder gespeichert
    setze(neuerStand(), false);
  } }, w.fortschrittLoeschen);
  const element = seitenRahmen({
    bereich: 'story',
    klasse: 'seite-story',
    inhalt: [leiste, buehne, ansage, unten],
    // der Speicherhinweis steht im Datenschutz (O-56, L-242; R75)
    fussZusatz: h('p', { class: 'fuss-zusatz' }, loeschen),
  });
  haltFokusFrei(element, leiste, unten);

  const speichere = (): void => {
    try {
      if (o.speicher !== null) { o.speicher.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(stand)); gespeichertOk = true; }
    } catch { gespeichertOk = false; /* Speicher voll oder gesperrt */ }
  };

  /** Was nach dem Neuzeichnen den Fokus bekommt: neuer Schritt → Titel, neue Wahl → Folge, sonst dasselbe Element. */
  type Fokus = { art: 'titel' } | { art: 'folge' } | { art: 'gleich'; pruef: string | null };

  /** Öffnet oder schließt die Seite des Entscheidungsbuchs (Symbol in der Leiste, Escape, „Zurück zur Geschichte“). */
  const schalteBuch = (): void => {
    buchOffen = !buchOffen;
    zeichne(buchOffen ? { art: 'titel' } : { art: 'gleich', pruef: 'buch-symbol' });
  };
  const buchNeu = (): boolean => !buchOffen && buchEintraege(g, stand).some((e) => !buchGesehen.has(e.k.id));

  const zeichne = (fokus: Fokus): void => {
    ersetze(leiste, ...leisteOben(g, stand, true, (n) => setze(n), lz, { offen: buchOffen, neu: buchNeu(), umschalten: schalteBuch }));
    if (buchOffen) {
      ersetze(buehne, buchSeite(g, stand, { gesehen: new Set(buchGesehen), schliessen: schalteBuch }));
      // der jüngste Eintrag ist beim Öffnen sichtbar; danach gelten alle gezeigten Einträge als gesehen
      buehne.querySelector<HTMLElement>('.gs-buch-liste > li:last-child')?.scrollIntoView({ block: 'nearest' });
      for (const e of buchEintraege(g, stand)) buchGesehen.add(e.k.id);
    } else ersetze(buehne, baueSchritt({ g, stand, bedienbar: true, themaTitel: o.themaTitel, ...(o.werkzeugTitel !== undefined ? { werkzeugTitel: o.werkzeugTitel } : {}), lesezeit: lz, gespeichert: gespeichertOk, tue: (n) => setze(n) }));
    if (fokus.art === 'titel') buehne.firstElementChild?.classList.add('ist-neu');
    const i = schrittIndex(g, stand);
    const amEnde = stand.schritt.ort === 'ende';
    const amAnfang = stand.schritt.ort === 'auftakt';
    ersetze(navi,
      i > 0 ? h('button', { type: 'button', class: 'gs-knopf gs-knopf-zurueck', 'data-pruef': 'zurueck', onclick: () => setze(zurueck(g, stand)) }, sym('pfeilLinks'), w.zurueck) : h('span'),
      h('span', { class: 'gs-navi-ort', 'aria-hidden': 'true' }, ortText(g, stand, lz)),
      amEnde ? h('span')
        : h('button', { type: 'button', class: 'gs-knopf gs-knopf-weiter', 'data-pruef': 'weiter', onclick: weiterKlick },
          amAnfang ? g.auftakt.los : w.weiter, sym('pfeilRechts')));
    hinweis.textContent = '';
    document.body.dataset['teil'] = buchOffen ? 'buch' : stand.schritt.ort === 'kapitel' ? stand.schritt.teil : stand.schritt.ort;
    if (fokus.art === 'titel') {
      window.scrollTo(0, 0);
      (buehne.querySelector('.gs-titel') as HTMLElement | null)?.focus({ preventScroll: true });
    } else if (fokus.art === 'folge') {
      const ziel = buehne.querySelector<HTMLElement>('[data-pruef="gs-folge-titel"]');
      ziel?.focus({ preventScroll: true });
      ziel?.scrollIntoView({ block: 'start' });
    } else {
      // Fokus auf dasselbe Bedienelement (Mini-Aufgabe, Gewichte); fehlt es, auf den Titel – nie auf <body>
      const ziel = fokus.pruef !== null ? element.querySelector<HTMLElement>(`[data-pruef="${fokus.pruef}"]`) : null;
      const verfuegbar = ziel !== null && !(ziel instanceof HTMLButtonElement && ziel.disabled);
      (verfuegbar ? ziel : buehne.querySelector<HTMLElement>('.gs-titel'))?.focus({ preventScroll: true });
    }
  };

  /** Ansage nach einer Wahl: Folge in einem Satz und die Balken in Worten. */
  const sageWahl = (k: Kapitel): void => {
    const p = stand.wahlen[k.id];
    const a = p !== undefined ? k.antworten[p] : undefined;
    if (p === undefined || a === undefined) return;
    const vorher = balkenBis(g, stand, k.nr - 1);
    const nachher = balkenBis(g, stand, k.nr);
    ansage.textContent = `${w.gewaehlt}: ${p + 1}. ${BALKEN.map((id) => aenderungWort(g, id, vorher[id], nachher[id], a.wirkung[id])).join('. ')}.`;
  };

  function setze(neu: Stand, merken = true): void {
    const alt = stand;
    stand = neu;
    // jede Änderung des Stands führt aus dem Buch zurück zur Geschichte
    buchOffen = false;
    if (merken) speichere();
    const aktiv = document.activeElement instanceof HTMLElement ? document.activeElement.dataset['pruef'] ?? null : null;
    const s = stand.schritt;
    // „Prüfen“ (Bericht gegenlesen) verschwindet nach der Prüfung: der Fokus geht zum Schlusssatz, nicht auf <body>
    let fokus: Fokus = { art: 'gleich', pruef: aktiv === 'mini-pruefen' ? 'mini-schluss' : aktiv };
    if (!gleicherSchritt(alt.schritt, s)) fokus = { art: 'titel' };
    else if (s.ort === 'kapitel' && s.teil === 'frage' && alt.wahlen[s.kapitel] !== stand.wahlen[s.kapitel]) fokus = { art: 'folge' };
    ansage.textContent = '';
    zeichne(fokus);
    if (fokus.art === 'folge' && s.ort === 'kapitel') {
      const k = kapitelVon(g, s.kapitel);
      if (k !== null) sageWahl(k);
    }
    zuhoerer?.(stand);
  }

  function weiterKlick(): void {
    const s = stand.schritt;
    if (s.ort === 'auftakt') { setze(beginne(g, stand, false)); return; }
    // Ohne Wahl geht es von der Frage nicht weiter – die Folge zeigt, was aus der Entscheidung wird
    if (s.ort === 'kapitel' && s.teil === 'frage' && stand.wahlen[s.kapitel] === undefined) {
      hinweis.textContent = w.nochKeineWahl;
      (buehne.querySelector('.gs-antwort') as HTMLElement | null)?.focus();
      return;
    }
    setze(weiter(g, stand));
  }

  zeichne({ art: 'gleich', pruef: null });
  return {
    element,
    zuKapitel(id: string) {
      const k = kapitelVon(g, id.toLowerCase());
      if (k === null) return;
      let neu = stand;
      if (!wegKapitel(g, neu.kurz).includes(k)) neu = { ...neu, kurz: false };
      setze(geheZu(g, neu, { ort: 'kapitel', kapitel: k.id, teil: 'szene' }));
    },
    stand: () => stand,
    taste(e: KeyboardEvent): boolean {
      const ziel = e.target as HTMLElement | null;
      if (ziel?.closest('input, textarea, select, summary, [contenteditable]') || e.altKey || e.ctrlKey || e.metaKey) return false;
      if (e.key === 'Escape' && buchOffen) { schalteBuch(); return true; }
      if (e.key === 'ArrowRight') { weiterKlick(); return true; }
      if (e.key === 'ArrowLeft') { setze(zurueck(g, stand)); return true; }
      return false;
    },
    beiAenderung(fn) { zuhoerer = fn; },
  };
}
