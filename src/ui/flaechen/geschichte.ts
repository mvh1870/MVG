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

import type { Antwort, BalkenId, CampusBild, Geschichte, Kapitel, Mini, Vergleich, Zeile } from '../../geschichte/typen.ts';
import { BALKEN } from '../../geschichte/typen.ts';
import {
  abgestimmteGewichte, balken, balkenBis, beginne, bilanzAmEnde, bruecken, endeFassung, gemischt, gewaehlteAntwort, geheZu, gewichte,
  gleicherSchritt, kapitel as kapitelVon, klickeReihe, leseStand, miniVonVorn, neuerStand, offeneKapitel, ordneZu,
  schrittIndex, setzeAbgestimmt, setzeGewicht, stufe, STUFEN_GEWICHT, vergleichLage, waehle,
  wegKapitel, werteMiniAus, weiter, zurueck, zaehlendePlatz, type Balkenstand, type Schritt, type Stand,
} from '../../geschichte/engine.ts';
import { campusIso } from '../../grafik/campus-iso.ts';
import { gimmick, portraet, type Figur, type GimmickName } from '../../grafik/figuren.ts';
import { ersetze, h, vonHtml, type Kind } from '../h.ts';
import { inhalt, inhaltInline } from '../bausteine/inhalt.ts';
import { sym } from '../bausteine/bloecke.ts';
import { bmLink, seitenRahmen } from '../bausteine/seite.ts';
import { bogenKopf } from '../druck.ts';
import { W } from '../woerter.ts';

const w = W.geschichte;

/* -------------------------------------------------------------- Bilder -- */

function bildAus(svg: string, klasse: string): HTMLElement {
  return h('span', { class: klasse, 'aria-hidden': 'true' }, vonHtml(svg));
}

/** Porträt (dekorativ: Name und Rolle stehen daneben als Text). */
function bildnis(figur: Figur, groesse: 'klein' | 'gross' | number = 'klein'): HTMLElement {
  return bildAus(portraet(figur, { groesse, dekorativ: true }), `gs-bildnis gs-bildnis-${typeof groesse === 'number' ? 'mass' : groesse}`);
}

function gegenstand(name: string | null, groesse = 96, klasse = 'gs-gegenstand'): HTMLElement | null {
  if (name === null) return null;
  return bildAus(gimmick(name as GimmickName, { groesse, dekorativ: true }), klasse);
}

/** Campus der Stufe mit Jahreszeit und Licht, groß; dekorativ (Drehbuch Abschnitt 7), Zusatz der Szene darüber. */
function campus(c: CampusBild, klasse: string, zusatz: string | null = null): HTMLElement {
  // der große Rahmen (2,2 : 1) bekommt den breiten Ausschnitt – sonst schnitte er Kran und Dächer oben ab (R75)
  const breit = klasse.includes('gs-campus-gross');
  const bild = vonHtml(campusIso(c.stufe, { jahreszeit: c.jahreszeit, licht: c.licht, ...(c.wetter ? { wetter: c.wetter } : {}), ...(breit ? { ausschnitt: 'breit' as const } : {}) }));
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
  const satz = h('p', null, inhaltInline(k.dahinterHtml));
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

/** Brückenkarten der Kurzfassung für übersprungene Kapitel. */
function brueckenKarten(g: Geschichte, vor: Kapitel | null): HTMLElement | null {
  const liste = bruecken(g, vor);
  if (liste.length === 0) return null;
  return h('section', { class: 'gs-bruecken', 'aria-label': w.brueckeTitel },
    h('p', { class: 'gs-bruecken-titel' }, w.brueckeTitel),
    h('ul', null, liste.map((k) => h('li', { class: 'gs-bruecke', 'data-pruef': `bruecke-${k.id}` },
      campus(k.campus, 'gs-campus-mini'),
      h('div', null, h('p', { class: 'gs-bruecke-kopf' }, h('b', null, `${k.nr} · ${k.titel}`), ` · ${k.zeit}`), inhalt(k.brueckeHtml ?? ''))))));
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
    ? h('button', { type: 'button', class: klasse, 'data-pruef': kurz ? 'fassung-kurz' : 'fassung-lang', onclick: () => o.tue(beginne(g, o.stand, kurz)) }, text, kurz ? null : sym('pfeilRechts'))
    : h('span', { class: klasse }, text);
  const start = balken(g, o.stand, { ort: 'auftakt' });
  return h('article', { class: 'gs-schritt gs-auftakt', 'data-teil': 'auftakt' },
    // „fiktiv“ einmal je Ansicht (L-227): der Auftakt sagt es im ersten Satz, das Ende im Abbinder
    h('div', { class: 'gs-buehnenbild' }, campus(g.auftakt.campus, 'gs-campus-gross')),
    h('header', { class: 'gs-auftakt-kopf' },
      h('h1', { class: 'gs-titel gs-titel-gross', tabindex: -1, 'data-pruef': 'gs-titel' }, g.titel),
      h('div', { class: 'gs-lead' }, inhalt(g.auftakt.textHtml))),
    h('div', { class: 'gs-start-knoepfe' },
      knopf(false, g.auftakt.los, 'gs-knopf gs-knopf-gross'),
      knopf(true, g.auftakt.kurz, 'gs-leiser-knopf')),
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

/** Zeilen einer Szene auf diesem Weg: die Kurzfassung lässt Zeilen mit `kurzfassung: false` weg (P17.5). */
function zeilenDesWegs(stand: Stand, zeilen: readonly Zeile[]): Zeile[] {
  return stand.kurz ? zeilen.filter((z) => z.kurzfassung) : [...zeilen];
}

function szene(o: SchrittOptionen, k: Kapitel): HTMLElement {
  const einstieg = o.stand.kurz && k.einstiegKurzHtml !== null ? k.einstiegKurzHtml : k.einstiegHtml;
  return h('article', { class: 'gs-schritt gs-szene', 'data-teil': 'szene' },
    o.stand.kurz ? brueckenKarten(o.g, k) : null,
    kopf(o, k, k.zeit),
    h('div', { class: 'gs-buehnenbild' }, campus(k.campus, 'gs-campus-gross', k.zusatz)),
    h('div', { class: 'gs-einstieg', 'data-pruef': 'gs-einstieg' }, inhalt(einstieg), gegenstand(k.bildSzene, 104, 'gs-gegenstand gs-gegenstand-einstieg')),
    dialog(o.g, zeilenDesWegs(o.stand, k.szene)));
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
  const mitDahinter = k.mini === null || stand.kurz;
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
      h('div', { class: 'gs-folge-szene' }, gegenstand(a.bild, 96, 'gs-gegenstand gs-gegenstand-folge'), h('div', { class: 'gs-folge-text' }, inhalt(a.folgeHtml))),
      k.campusNachher !== null ? h('div', { class: 'gs-buehnenbild gs-buehnenbild-nachher' }, campus(k.campusNachher, 'gs-campus-gross')) : null,
      h('div', { class: 'gs-wirkung' },
        h('h3', { class: 'gs-wirkung-titel' }, w.wirkungTitel),
        balkenTafel(g, nachher, { vorher, wirkung: a.wirkung, gross: true, pruef: 'gs-stand-folge' })),
      k.mandatNachFolge ? mandatKarte(g) : null,
      kasten('gut', w.gutTitel, sym('haken'), inhalt(k.gutHtml)),
      mitDahinter ? dahinter(o, k) : null));
}

/* ---------------------------------------------------------- Mini-Aufgaben -- */

function miniZuordnen(o: SchrittOptionen, k: Kapitel, m: Mini): HTMLElement {
  const antworten = o.stand.mini[k.id];
  const aus = werteMiniAus(m, antworten);
  // Ablagen (z. B. „zu Recht geschlossen“ · „übergeben“): wo die Wahlen ein Bild haben, oben je Ablage Bild und Zahl der Karten
  const ablagen = m.wahlen.some((x) => x.bild !== null)
    ? h('ul', { class: 'gs-mini-ablagen', 'data-pruef': 'mini-ablagen' }, m.wahlen.map((x, j) => {
      const n = m.posten.filter((_, i) => (antworten?.[i] ?? -1) === j).length;
      return h('li', { class: 'gs-mini-ablage', 'data-pruef': `ablage-${x.id}` }, gegenstand(x.bild, 56, 'gs-gegenstand gs-mini-ablage-bild'),
        h('span', null, h('b', null, x.titel), h('span', { class: 'gs-mini-ablage-zahl' }, w.miniKarten(n))));
    }))
    : null;
  const liste = h('ol', { class: 'gs-mini-liste gs-mini-zuordnen', 'data-wahlen': m.wahlen.length },
    m.posten.map((p, i) => {
      const gewaehlt = antworten?.[i] ?? -1;
      const lage = aus.je[i] ?? 'offen';
      const loesung = m.wahlen.find((x) => x.id === p.loesung);
      const falsch = gewaehlt >= 0 ? m.wahlen[gewaehlt] ?? null : null;
      return h('li', { class: 'gs-mini-posten', 'data-lage': lage, 'data-pruef': `posten-${i + 1}` },
        h('div', { class: 'gs-mini-karte' }, gegenstand(p.bild, 48, 'gs-gegenstand gs-mini-posten-bild'), h('p', { class: 'gs-mini-text', id: `gs-posten-${k.id}-${i}` }, inhaltInline(p.html))),
        h('div', { class: 'gs-mini-wahlen', role: 'group', 'aria-labelledby': `gs-posten-${k.id}-${i}` },
          m.wahlen.map((x, j) => {
            const an = gewaehlt === j;
            const kinder: Kind[] = [x.figur !== null ? bildnis(x.figur as Figur, 32) : null, h('span', null, x.titel)];
            return o.bedienbar
              ? h('button', { type: 'button', class: 'gs-mini-wahl', 'aria-pressed': an ? 'true' : 'false', 'data-pruef': `wahl-${i + 1}-${x.id}`, onclick: () => o.tue(ordneZu(o.g, o.stand, k.id, i, j)) }, kinder)
              : h('span', { class: 'gs-mini-wahl', 'aria-pressed': an ? 'true' : 'false' }, kinder);
          })),
        lage === 'offen' ? null : h('p', { class: 'gs-mini-rueck', 'data-pruef': `rueck-${i + 1}` },
          h('b', null, lage === 'richtig' ? [sym('haken'), w.miniRichtig] : w.miniFalsch(loesung?.titel ?? '')), ' ',
          lage === 'falsch' && falsch?.falschHtml ? [inhaltInline(falsch.falschHtml), ' '] : null,
          inhaltInline(p.erklaerungHtml)));
    }));
  // R75: kurze Bedeutung je Wahl als Legende über den Karten – lösbar ohne Fachwissen
  const legende = m.wahlen.some((x) => x.heisstHtml !== null)
    ? h('dl', { class: 'gs-mini-legende', 'data-pruef': 'mini-legende' }, m.wahlen.filter((x) => x.heisstHtml !== null).map((x) => h('div', null, h('dt', null, x.titel), h('dd', null, inhaltInline(x.heisstHtml ?? '')))))
    : null;
  if (ablagen === null) return legende === null ? liste : h('div', { class: 'gs-mini-zuordnen-mit-legende' }, legende, liste);
  return h('div', { class: 'gs-mini-zuordnen-mit-ablagen' }, legende, ablagen, liste);
}

function miniReihe(o: SchrittOptionen, k: Kapitel, m: Mini): HTMLElement {
  const folge = o.stand.mini[k.id] ?? [];
  const aus = werteMiniAus(m, folge);
  // fertig: die Karten stehen in der richtigen Reihenfolge, verbunden zu einem Pfad (Drehbuch Abschnitt 7)
  const ordnung = aus.fertig ? m.posten.map((_, i) => i) : gemischt(m.posten.length);
  return h('ol', { class: `gs-mini-liste gs-mini-reihe${aus.fertig ? ' ist-pfad' : ''}`, 'data-pruef': 'mini-reihe' },
    ordnung.map((i) => {
      const p = m.posten[i];
      const stelle = folge.indexOf(i);
      const lage = aus.fertig ? aus.je[i] ?? 'offen' : 'offen';
      const kinder: Kind[] = [
        h('span', { class: 'gs-reihe-nr', 'aria-hidden': stelle < 0 ? 'true' : null }, stelle < 0 ? '' : String(stelle + 1)),
        gegenstand(p?.bild ?? null, 44, 'gs-gegenstand gs-mini-posten-bild'),
        h('span', { class: 'gs-reihe-text' }, inhaltInline(p?.html ?? '')),
        stelle >= 0 ? h('span', { class: 'nur-sr' }, `, ${w.miniStelle(stelle + 1)}`) : null,
      ];
      return h('li', { class: 'gs-mini-posten', 'data-lage': lage, 'data-pruef': `posten-${i + 1}` },
        o.bedienbar
          ? h('button', { type: 'button', class: 'gs-reihe-knopf', 'aria-pressed': stelle >= 0 ? 'true' : 'false', 'data-pruef': `reihe-${i + 1}`, onclick: () => o.tue(klickeReihe(o.g, o.stand, k.id, i)) }, kinder)
          : h('span', { class: 'gs-reihe-knopf', 'aria-pressed': stelle >= 0 ? 'true' : 'false' }, kinder),
        aus.fertig ? h('p', { class: 'gs-mini-rueck', 'data-pruef': `rueck-${i + 1}` },
          h('b', null, lage === 'richtig' ? [sym('haken'), w.miniRichtig] : w.miniGehoert(i + 1)), ' ', inhaltInline(p?.erklaerungHtml ?? '')) : null);
    }));
}

function miniSchritt(o: SchrittOptionen, k: Kapitel): HTMLElement {
  const m = k.mini as Mini;
  const aus = werteMiniAus(m, o.stand.mini[k.id]);
  const offen = aus.je.filter((x) => x === 'offen').length;
  const zuordnen = m.art === 'zuordnen';
  // Zuordnen gibt je Posten sofort Rückmeldung; die Reihenfolge erst, wenn alle Schritte angeklickt sind
  const stand = zuordnen ? (offen === m.posten.length ? '' : offen > 0 ? `${w.miniErgebnis(aus.richtig, m.posten.length - offen)} ${w.miniNoch(offen)}` : w.miniErgebnis(aus.richtig, m.posten.length))
    : aus.fertig ? w.miniErgebnis(aus.richtig, m.posten.length)
      : (o.stand.mini[k.id]?.length ?? 0) > 0 ? w.miniGesetzt(o.stand.mini[k.id]?.length ?? 0, m.posten.length) : '';
  return h('article', { class: 'gs-schritt gs-mini', 'data-teil': 'mini', 'data-art': m.art },
    kopf(o, k, `${w.miniKicker} · ${m.titel}`),
    h('section', { class: 'gs-mini-aufgabe', 'aria-labelledby': 'gs-mini-aufgabe' },
      h('span', { class: 'gs-mini-symbol', 'aria-hidden': 'true' }, sym('puzzle')),
      h('p', { id: 'gs-mini-aufgabe', class: 'gs-mini-auftrag' }, inhaltInline(m.aufgabeHtml)),
      gegenstand(m.bild, 96, 'gs-gegenstand gs-mini-bild')),
    zuordnen ? miniZuordnen(o, k, m) : miniReihe(o, k, m),
    h('div', { class: 'gs-mini-fuss' },
      h('p', { class: 'gs-mini-stand', role: 'status', 'data-pruef': 'mini-stand' }, stand),
      o.bedienbar && (o.stand.mini[k.id]?.some((x) => x >= 0) ?? false)
        ? h('button', { type: 'button', class: 'gs-leiser-knopf', 'data-pruef': 'mini-nochmal', onclick: () => o.tue(miniVonVorn(o.stand, k.id)) }, sym('zurueckspulen'), w.miniNochmal) : null),
    dahinter(o, k));
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
  const zeilen = zeilenDesWegs(typ === 'offen' ? { ...stand, kurz: true } : stand, e.szene).map((z) => {
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
    h('div', { class: 'gs-buehnenbild' }, campus(e.campus, 'gs-campus-gross gs-campus-ende')),
    h('div', { class: 'gs-einstieg', 'data-pruef': 'gs-einstieg' }, inhalt(einstieg),
      // wie die Sätze je Balken ein Urteil über den ganzen Weg – bei offenen Entscheidungen nicht (R75)
      typ !== 'offen' && stufe(b.zeit) === 'niedrig' ? h('div', { 'data-pruef': 'gs-zeit-niedrig' }, inhalt(e.zeitNiedrigHtml)) : null, gegenstand('schulbus', 104, 'gs-gegenstand gs-gegenstand-einstieg')),
    dialog(g, zeilen),
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
      offen > 0 ? h('p', { class: 'gs-leise', 'data-pruef': 'gs-offen' }, w.offen(offen)) : null),
    o.bedienbar ? h('nav', { class: 'gs-ende-wege', 'aria-label': w.ende },
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
  const k = kapitelVon(o.g, s.kapitel);
  if (k === null) return auftakt(o);
  if (s.teil === 'szene') return szene(o, k);
  if (s.teil === 'vergleich' && k.vergleich !== null) return vergleichSchritt(o, k);
  if (s.teil === 'mini' && k.mini !== null) return miniSchritt(o, k);
  return frage(o, k);
}

/* ------------------------------------------------------------- Leiste oben -- */

/** Kurzer Name des Orts: „3 von 8 · Wie gefährlich ist das?“ */
export function ortText(g: Geschichte, stand: Stand): string {
  const s = stand.schritt;
  if (s.ort === 'auftakt') return w.auftakt;
  if (s.ort === 'ende') return w.endeOrt;
  const weg = wegKapitel(g, stand.kurz);
  const i = weg.findIndex((k) => k.id === s.kapitel);
  return `${w.vonN(i + 1, weg.length)} · ${weg[i]?.titel ?? ''}`;
}

/** Fortschrittslinie: ein Feld je Kapitel des Wegs (bedienbar = Sprung zur Szene), dazu Auftakt und Schulstart. */
export function fortschritt(g: Geschichte, stand: Stand, bedienbar: boolean, tue: (neu: Stand) => void): HTMLElement {
  const weg = wegKapitel(g, stand.kurz);
  const s = stand.schritt;
  const hier = s.ort === 'kapitel' ? weg.findIndex((k) => k.id === s.kapitel) : s.ort === 'ende' ? weg.length : -1;
  const feld = (inhaltText: Kind, name: string, ziel: Schritt, zustand: string, art: string): HTMLElement => {
    const attrs = { class: 'gs-feld', 'data-zustand': zustand, 'data-art': art, 'aria-current': zustand === 'jetzt' ? 'step' : null, title: name };
    return h('li', null, bedienbar
      ? h('button', { ...attrs, type: 'button', 'aria-label': name, onclick: () => tue(geheZu(g, stand, ziel)) }, inhaltText)
      : h('span', { ...attrs, 'aria-label': name }, inhaltText));
  };
  return h('nav', { class: 'gs-fortschritt', 'aria-label': w.fortschritt, 'data-pruef': 'gs-fortschritt' },
    h('ol', { class: 'gs-felder' },
      feld(sym('flagge'), w.auftakt, { ort: 'auftakt' }, s.ort === 'auftakt' ? 'jetzt' : 'erledigt', 'rand'),
      weg.map((k, i) => feld(String(k.nr), `${w.vonN(i + 1, weg.length)} · ${k.titel}`, { ort: 'kapitel', kapitel: k.id, teil: 'szene' },
        i === hier ? 'jetzt' : zaehlendePlatz(stand, k) !== null ? 'erledigt' : 'offen', 'kapitel')),
      feld(sym('stempel'), w.endeOrt, { ort: 'ende' }, s.ort === 'ende' ? 'jetzt' : 'offen', 'rand')));
}

/** Leiste oben: Fortschritt, Ort in Worten, Balken klein. */
export function leisteOben(g: Geschichte, stand: Stand, bedienbar: boolean, tue: (neu: Stand) => void): Node[] {
  return [
    fortschritt(g, stand, bedienbar, tue),
    h('p', { class: 'gs-ort', 'data-pruef': 'gs-ort' }, ortText(g, stand)),
    balkenTafel(g, balken(g, stand), { gross: false, pruef: 'gs-stand-leiste' }),
  ];
}

/* ------------------------------------------------------------------- Druck -- */

/** Druckbogen der Story (Strg+P): je Kapitel des Wegs Ihre Antwort und „So macht man es gut“, dazu die Bilanz. */
export function storyDruck(g: Geschichte, stand: Stand, version: string): { titel: string; teile: Node[] } {
  const b = balken(g, stand, { ort: 'ende' });
  const typ = bilanzAmEnde(g, stand);
  const s = stand.schritt;
  const amEnde = s.ort === 'ende';
  // bis wohin der Weg reicht: ein übersprungenes Kapitel ist „erzählt“, sobald seine Brücke (im nächsten Kapitel) erreicht ist
  const hier = amEnde ? Number.POSITIVE_INFINITY : s.ort === 'kapitel' ? (kapitelVon(g, s.kapitel)?.nr ?? 0) : 0;
  const offen = offeneKapitel(g, stand).length;
  return {
    titel: w.druckTitel,
    teile: [
      bogenKopf(`${w.druckTitel} · ${g.titel}`, version, true),
      h('div', { class: 'druck-story', 'data-pruef': 'story-druck' },
        g.kapitel.map((k) => {
          const a = gewaehlteAntwort(stand, k);
          const erzaehlt = stand.kurz && !k.kurzfassung;
          // „So macht man es gut“ wie am Bildschirm erst nach der eigenen Wahl – sonst stünde die Lösung vor der Frage (R73)
          const gewaehlt = !erzaehlt && a !== null;
          return h('section', { class: 'druck-teil', 'data-pruef': `druck-${k.id}` },
            h('h2', null, `${k.nr} · ${k.titel}`, h('small', null, ` · ${k.zeit}`)),
            // die Frage gibt der Antwort auf Papier ihren Bezug (R75); sie ist keine Wertung
            erzaehlt ? null : h('p', { class: 'druck-frage' }, inhaltInline(k.frageHtml)),
            // R76: ein erzähltes Kapitel trägt seinen Brückensatz – eine Antwort gab es dort nicht
            erzaehlt && hier > k.nr
              ? h('p', { class: 'druck-bruecke' }, h('b', null, `${w.druckBruecke}: `), inhaltInline(k.brueckeHtml ?? ''))
              : h('p', null, h('b', null, `${w.druckAntwort}: `), !erzaehlt && a !== null ? inhaltInline(a.html) : w.druckOffen),
            gewaehlt ? h('div', { class: 'druck-gut' }, h('h3', null, w.gutTitel), inhalt(k.gutHtml)) : null);
        }),
        // die Bilanz nur, wenn das Ende erreicht ist – wie am Bildschirm, samt Hinweis auf offene Entscheidungen
        h('section', { class: 'druck-teil', 'data-pruef': 'druck-bilanz' }, amEnde
          ? [
            h('h2', null, `${w.bilanzTitel}: ${g.bilanz[typ].titel}`),
            h('p', null, inhaltInline(g.bilanz[typ].html)),
            // bei offenen Entscheidungen kein Urteil je Balken, aber ihr Stand in Worten – der Druck zeigt keine Balken (R74)
            h('ul', null, g.balken.map((x) => h('li', null, h('b', null, `${x.titel}: `),
              typ === 'offen' ? w.fuellstand[stufe(b[x.id])] ?? '' : inhaltInline(x.bilanz[stufe(b[x.id])])))),
            offen > 0 ? h('p', null, w.offen(offen)) : null]
          : [h('h2', null, w.bilanzTitel), h('p', null, w.druckBilanzSpaeter)]))],
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

export function erzeugeGeschichte(o: { g: Geschichte; speicher: SpeicherGriff | null; themaTitel: (id: string) => string | null; werkzeugTitel?: (id: string) => string | null }): GeschichteFlaeche {
  const { g } = o;
  let stand: Stand = ladeStand(g, o.speicher) ?? neuerStand();
  let zuhoerer: ((s: Stand) => void) | null = null;
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
    try { o.speicher?.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(stand)); } catch { /* Speicher voll oder gesperrt */ }
  };

  /** Was nach dem Neuzeichnen den Fokus bekommt: neuer Schritt → Titel, neue Wahl → Folge, sonst dasselbe Element. */
  type Fokus = { art: 'titel' } | { art: 'folge' } | { art: 'gleich'; pruef: string | null };

  const zeichne = (fokus: Fokus): void => {
    ersetze(leiste, ...leisteOben(g, stand, true, (n) => setze(n)));
    ersetze(buehne, baueSchritt({ g, stand, bedienbar: true, themaTitel: o.themaTitel, ...(o.werkzeugTitel !== undefined ? { werkzeugTitel: o.werkzeugTitel } : {}), tue: (n) => setze(n) }));
    if (fokus.art === 'titel') buehne.firstElementChild?.classList.add('ist-neu');
    const i = schrittIndex(g, stand);
    const amEnde = stand.schritt.ort === 'ende';
    const amAnfang = stand.schritt.ort === 'auftakt';
    ersetze(navi,
      i > 0 ? h('button', { type: 'button', class: 'gs-knopf gs-knopf-zurueck', 'data-pruef': 'zurueck', onclick: () => setze(zurueck(g, stand)) }, sym('pfeilLinks'), w.zurueck) : h('span'),
      h('span', { class: 'gs-navi-ort', 'aria-hidden': 'true' }, ortText(g, stand)),
      amEnde ? h('span')
        : h('button', { type: 'button', class: 'gs-knopf gs-knopf-weiter', 'data-pruef': 'weiter', onclick: weiterKlick },
          amAnfang ? g.auftakt.los : w.weiter, sym('pfeilRechts')));
    hinweis.textContent = '';
    document.body.dataset['teil'] = stand.schritt.ort === 'kapitel' ? stand.schritt.teil : stand.schritt.ort;
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
    if (merken) speichere();
    const aktiv = document.activeElement instanceof HTMLElement ? document.activeElement.dataset['pruef'] ?? null : null;
    const s = stand.schritt;
    let fokus: Fokus = { art: 'gleich', pruef: aktiv };
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
      if (e.key === 'ArrowRight') { weiterKlick(); return true; }
      if (e.key === 'ArrowLeft') { setze(zurueck(g, stand)); return true; }
      return false;
    },
    beiAenderung(fn) { zuhoerer = fn; },
  };
}
