/*
 * Fläche „Story“ (P16.6, O-40): eine durchgehende Geschichte aus Sicht des Bauherrn. Ein Fluss –
 * „Weiter“ Schritt für Schritt (Auftakt, je Station Lage → Vorlage → Folge, Schulstart), oben eine
 * schlanke Fortschrittslinie und eine kleine Statusanzeige, Vertiefungen zum Aufklappen.
 *
 * `baueSchritt` zeichnet einen Schritt rein aus Geschichte und Stand (auch für die Leinwand, ohne
 * Bedienung); `erzeugeGeschichte` ist die bedienbare Fläche mit Speicher und Tastatur.
 */

import type { Geschichte, Option, Station, Vorgang } from '../../geschichte/typen.ts';
import {
  empfohlen, empfehlungstextGilt, gewichte as geltendeGewichte, gilt, gewaehlteOption, gleicherSchritt, leseStand,
  neuerStand, pufferUrteil, schritte, schrittIndex, setzeGewicht, setzeKurz, station, status, waehle, weiter, zurueck,
  geheZu, wegStationen, type Schritt, type Stand, type Status,
} from '../../geschichte/engine.ts';
import { GEWICHT_MAX, GEWICHT_MIN, kipppunkte, rangfolge, type Gewichte } from '../../geschichte/mcda.ts';
import { campus, stufeAusLph } from '../../grafik/bauplan.ts';
import { attr, elementAus, ersetze, h, vonHtml, type Kind } from '../h.ts';
import { statusSymbol } from '../../stil/symbole.ts';
import { inhalt, inhaltInline } from '../bausteine/inhalt.ts';
import { sym } from '../bausteine/bloecke.ts';
import { bmLink, seitenRahmen } from '../bausteine/seite.ts';
import { W } from '../woerter.ts';

const w = W.geschichte;

/* ----------------------------------------------------------- Zahlen -- */

// Beträge mit mindestens einer Nachkommastelle („+2,0“ neben „+0,15“), Minus als „−“ (U+2212) wie in den Texten (R67)
const zahl = (n: number, stellen = 2): string =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: stellen > 0 ? 1 : 0, maximumFractionDigits: stellen }).format(n).replace('-', '−');
const mitVorzeichen = (n: number, stellen = 2): string => (n > 0 ? '+' : n < 0 ? '−' : '±') + zahl(Math.abs(n), stellen);

export function statusText(g: Geschichte, s: Status): { kosten: string; puffer: string; offen: string } {
  return {
    kosten: `${zahl(s.kosten)} ${g.status.kosten.einheit}`,
    puffer: `${zahl(s.puffer, 0)} ${g.status.puffer.einheit}`,
    offen: zahl(s.offen, 0),
  };
}

function folgenListe(g: Geschichte, f: Partial<Record<'kosten' | 'puffer' | 'offen', number>>): string[] {
  const aus: string[] = [];
  if (f.kosten) aus.push(`${g.status.kosten.titel} ${mitVorzeichen(f.kosten)} ${g.status.kosten.einheit}`);
  if (f.puffer) aus.push(`${g.status.puffer.titel} ${mitVorzeichen(f.puffer, 0)} ${g.status.puffer.einheit}`);
  if (f.offen) aus.push(`${g.status.offen.titel} ${mitVorzeichen(f.offen, 0)}`);
  return aus;
}

/* ------------------------------------------------------- Bausteine -- */

export interface SchrittOptionen {
  g: Geschichte;
  stand: Stand;
  bedienbar: boolean;
  /** Titel eines Theorie-Themas (null = Thema gibt es nicht, kein Link) */
  themaTitel: (id: string) => string | null;
  /** Gegenprobe-Gewichte (nur Anzeige) */
  gegenprobe: Gewichte | null;
  tue: (neu: Stand) => void;
  setzeGegenprobe: (g: Gewichte | null) => void;
}

function kopf(st: Station, teil: string): HTMLElement {
  return h('header', { class: 'gs-kopf' },
    h('p', { class: 'gs-kicker' }, `${w.station(st.nr)} · ${st.datum} · ${w.lph(st.lph)} · ${teil}`),
    h('h1', { class: 'gs-titel', tabindex: -1, 'data-pruef': 'gs-titel' }, st.titel));
}

function vorgangKarte(v: Vorgang): HTMLElement {
  return h('li', { class: 'gs-vorgang', 'data-art': v.art, 'data-pruef': `vorgang-${v.kennung}` },
    h('p', { class: 'gs-vorgang-kopf' },
      h('span', { class: 'id-marke', 'data-art': v.art }, v.kennung),
      h('span', { class: 'gs-vorgang-art' }, w.arten[v.art] ?? v.art),
      h('b', null, v.titel)),
    h('p', { class: 'gs-vorgang-text' }, inhaltInline(v.html)),
    h('dl', { class: 'gs-vorgang-daten' },
      h('div', null, h('dt', null, w.verantwortlich), h('dd', null, v.verantwortlich)),
      v.termin !== '' ? h('div', null, h('dt', null, w.termin), h('dd', null, v.termin)) : null,
      v.stand !== '' ? h('div', null, h('dt', null, w.stand), h('dd', null, v.stand)) : null,
      v.matrix !== null ? h('div', null, h('dt', null, w.bewertung), h('dd', null, w.matrix(v.matrix.w, v.matrix.a))) : null));
}

function lage(o: SchrittOptionen, st: Station): HTMLElement {
  const zeilen = st.bericht.zeilen.filter((z) => gilt(o.g, o.stand, z.wenn, st));
  const vorgaenge = st.vorgaenge.filter((v) => gilt(o.g, o.stand, v.wenn, st));
  return h('article', { class: 'gs-schritt', 'data-teil': 'lage' },
    kopf(st, w.teile['lage'] ?? ''),
    h('div', { class: 'gs-text' }, inhalt(st.lageHtml)),
    h('section', { class: 'gs-bericht', 'aria-label': st.bericht.titel, 'data-pruef': 'gs-bericht' },
      h('h2', { class: 'gs-bericht-titel' }, sym('bericht'), st.bericht.titel.replace(' · ', '\u00a0· ')),
      h('ul', { class: 'gs-bericht-zeilen' }, zeilen.map((z) => h('li', null, inhaltInline(z.html)))),
      h('p', { class: 'gs-bericht-reaktion' }, st.bericht.reaktion)),
    vorgaenge.length > 0 ? h('details', { class: 'gs-vertiefung gs-bestand', 'data-pruef': 'gs-bestand' },
      h('summary', null, w.vorgaenge, h('span', { class: 'gs-zahl' }, String(vorgaenge.length))),
      h('ul', { class: 'gs-vorgaenge' }, vorgaenge.map(vorgangKarte))) : null);
}

function regler(o: SchrittOptionen, gew: Gewichte, beimAendern: (k: string, wert: number) => void, pruef: string): HTMLElement {
  // Leinwand: die Gewichte als Text, ohne Bedienelemente
  if (!o.bedienbar) {
    return h('dl', { class: 'gs-regler gs-regler-text', 'data-pruef': pruef },
      o.g.kriterien.map((k) => h('div', { class: 'gs-regler-zeile' }, h('dt', null, k.titel), h('dd', { class: 'gs-regler-wert' }, String(gew[k.id] ?? 3)))));
  }
  return h('div', { class: 'gs-regler', 'data-pruef': pruef },
    o.g.kriterien.map((k) => {
      const id = `${pruef}-${k.id}`;
      const ausgabe = h('output', { class: 'gs-regler-wert', for: id }, String(gew[k.id] ?? 3));
      const feld = h('input', {
        type: 'range', id, min: GEWICHT_MIN, max: GEWICHT_MAX, step: 1, value: gew[k.id] ?? 3,
        // R68: data-pruef wie die id – zeichnet die Fläche nach einer Änderung neu, setzt zeichne() den Fokus zurück
        // (sonst fiele er auf <body>, und die nächste Pfeiltaste blätterte die Story)
        'data-kriterium': k.id, 'data-pruef': id,
        oninput: (e: Event) => {
          const wert = Number((e.target as HTMLInputElement).value);
          ausgabe.textContent = String(wert);
          beimAendern(k.id, wert);
        },
      });
      return h('div', { class: 'gs-regler-zeile' }, h('label', { for: id }, k.titel), feld, ausgabe);
    }));
}

function vergleichTabelle(o: SchrittOptionen, st: Station, gew: Gewichte): HTMLElement {
  const plaetze = rangfolge(st.vorlage.optionen, o.g.kriterien, gew);
  const max = Math.max(1, ...plaetze.map((p) => p.summe));
  return h('div', { class: 'gs-vergleich', 'data-pruef': 'gs-vergleich', tabindex: 0, role: 'region', 'aria-label': w.vergleich },
    h('table', { class: 'gs-tabelle' },
      h('caption', { class: 'nur-sr' }, w.vergleich),
      h('thead', null, h('tr', null,
        h('th', { scope: 'col' }, w.kriterium),
        h('th', { scope: 'col', class: 'gs-zahl-spalte' }, w.gewicht),
        plaetze.map((p) => h('th', { scope: 'col' }, `${p.option.id} · ${p.option.titel}`)))),
      h('tbody', null, o.g.kriterien.map((k) => h('tr', null,
        h('th', { scope: 'row' }, k.titel),
        h('td', { class: 'gs-zahl-spalte' }, String(gew[k.id] ?? 0)),
        plaetze.map((p) => {
          const pt = p.option.punkte?.[k.id];
          return h('td', null, h('b', { class: 'gs-punkt', 'data-punkt': pt?.[0] ?? 0 }, String(pt?.[0] ?? '–')), h('small', null, pt?.[1] ?? ''));
        })))),
      h('tfoot', null, h('tr', null,
        h('th', { scope: 'row', colspan: 2 }, w.summe),
        plaetze.map((p) => h('td', { class: p.rang === 1 ? 'ist-vorn' : null, 'data-pruef': `summe-${p.option.id}` },
          h('b', null, String(p.summe)), ' ', h('small', null, w.rang(p.rang)),
          h('span', { class: 'gs-balken', style: `--anteil:${Math.round((p.summe / max) * 100)}%`, 'aria-hidden': 'true' })))))));
}

function kippText(o: SchrittOptionen, st: Station, gew: Gewichte): HTMLElement {
  const k = kipppunkte(st.vorlage.optionen, o.g.kriterien, gew);
  const titel = (id: string): string => st.vorlage.optionen.find((x) => x.id === id)?.titel ?? id;
  return h('div', { class: 'gs-kipp', 'data-pruef': 'gs-kipp' },
    h('h3', null, w.kipppunkte),
    k.length === 0 ? h('p', null, w.keinKipppunkt)
      : h('ul', null, k.map((x) => h('li', null, w.kipppunkt(o.g.kriterien.find((c) => c.id === x.kriterium)?.titel ?? x.kriterium, x.gewicht, x.spitze.map(titel))))));
}

function optionKarte(o: SchrittOptionen, st: Station, opt: Option, empf: string): HTMLElement {
  const gewaehlt = o.stand.wahlen[st.id] === opt.id;
  const inhaltKarte: Kind[] = [
    h('p', { class: 'gs-option-kopf' },
      h('span', { class: 'gs-option-id' }, opt.id),
      h('b', null, opt.titel),
      opt.id === empf ? h('span', { class: 'gs-marke' }, w.empfohlen) : null,
      opt.klaerung ? h('span', { class: 'gs-marke gs-marke-klaerung' }, w.klaerung) : null),
    h('span', { class: 'gs-option-text' }, inhaltInline(opt.html)),
    opt.gewichte !== null ? h('span', { class: 'gs-option-gewichte' }, o.g.kriterien.map((k) => h('span', null, `${k.titel} ${opt.gewichte?.[k.id] ?? ''}`))) : null,
    folgenListe(o.g, opt.folgen).length > 0 ? h('span', { class: 'gs-option-folgen' }, folgenListe(o.g, opt.folgen).join(' · ')) : null,
    h('span', { class: 'gs-option-los' }, gewaehlt ? [sym('haken'), w.gewaehlt] : w.waehlen),
  ];
  return o.bedienbar
    ? h('button', {
      type: 'button', class: 'gs-option', 'aria-pressed': gewaehlt ? 'true' : 'false', 'data-option': opt.id, 'data-pruef': `option-${opt.id}`,
      onclick: () => o.tue(waehle(o.g, o.stand, st.id, opt.id)),
    }, inhaltKarte)
    : h('div', { class: 'gs-option', 'aria-pressed': gewaehlt ? 'true' : 'false', 'data-option': opt.id }, inhaltKarte);
}

function vorlage(o: SchrittOptionen, st: Station): HTMLElement {
  const v = st.vorlage;
  const gew = geltendeGewichte(o.g, o.stand);
  const empf = empfohlen(o.g, o.stand, st);
  const empfOption = v.optionen.find((x) => x.id === empf);
  const empfText = empfehlungstextGilt(o.g, o.stand, st) ? inhalt(v.empfehlung.html) : h('p', null, w.empfehlungAllgemein(empfOption?.titel ?? empf));
  const teile: Kind[] = [
    kopf(st, w.teile['vorlage'] ?? ''),
    h('section', { class: 'gs-vorlage', 'aria-label': w.vorlage, 'data-pruef': 'gs-vorlage' },
      h('p', { class: 'gs-vorlage-art' }, sym('dokument'), w.vorlage),
      h('h2', { class: 'gs-frage' }, v.frage),
      h('div', { class: 'gs-text' }, inhalt(v.grundHtml)),
      h('dl', { class: 'gs-vorlage-daten' },
        h('div', null, h('dt', null, w.stelle), h('dd', null, v.stelle)),
        v.termin !== '' ? h('div', null, h('dt', null, w.bis), h('dd', null, v.termin)) : null,
        h('div', null, h('dt', null, w.verzug), h('dd', null, inhaltInline(v.verzugHtml))),
        v.muss !== null ? h('div', null, h('dt', null, w.muss), h('dd', null, v.muss)) : null),
      v.unvollstaendigHtml !== null ? h('div', { class: 'gs-unvollstaendig', 'data-pruef': 'gs-unvollstaendig' }, h('p', { class: 'gs-hinweis-titel' }, sym('warnung'), w.unvollstaendig), inhalt(v.unvollstaendigHtml)) : null),
  ];
  if (v.art === 'gewichte') {
    teile.push(h('div', { class: 'gs-optionen', role: 'group', 'aria-label': v.frage }, v.optionen.map((x) => optionKarte(o, st, x, empf))));
    teile.push(h('section', { class: 'gs-gewichte', 'aria-labelledby': 'gs-gewichte-titel' },
      h('h3', { id: 'gs-gewichte-titel' }, w.gewichteTitel),
      h('p', { class: 'gs-leise' }, w.gewichteHinweis),
      regler(o, gew, (k, wert) => o.tue(setzeGewicht(o.g, o.stand, k, wert)), 'gewichte')));
  } else {
    const anzeige = o.gegenprobe ?? gew;
    let aktuell: Gewichte = anzeige;
    const tabelle = h('div', { class: 'gs-vergleich-ort' }, vergleichTabelle(o, st, anzeige), kippText(o, st, anzeige));
    teile.push(h('section', { class: 'gs-mcda', 'aria-labelledby': 'gs-vergleich-titel' },
      h('h3', { id: 'gs-vergleich-titel' }, w.vergleich),
      h('p', { class: 'gs-leise' }, w.vergleichHinweis),
      tabelle,
      h('details', { class: 'gs-vertiefung gs-gegenprobe', open: o.gegenprobe !== null, 'data-pruef': 'gs-gegenprobe' },
        h('summary', null, w.gegenprobe),
        h('p', { class: 'gs-leise' }, w.gegenprobeHinweis),
        regler(o, anzeige, (k, wert) => {
          // R68: von der gerade geltenden Gegenprobe ausgehen – sonst zählte nur der zuletzt bewegte Regler
          aktuell = { ...aktuell, [k]: wert };
          o.setzeGegenprobe(aktuell);
          ersetze(tabelle, vergleichTabelle(o, st, aktuell), kippText(o, st, aktuell));
        }, 'gegenprobe'),
        o.bedienbar ? h('button', { type: 'button', class: 'gs-leiser-knopf', 'data-pruef': 'gegenprobe-zurueck', onclick: () => o.setzeGegenprobe(null) }, w.gegenprobeZurueck) : null)));
    teile.push(h('section', { class: 'gs-empfehlung', 'aria-label': w.empfehlung, 'data-pruef': 'gs-empfehlung' },
      h('p', { class: 'gs-hinweis-titel' }, sym('stempel'), w.empfehlung), empfText));
    teile.push(h('div', { class: 'gs-optionen', role: 'group', 'aria-label': v.frage }, v.optionen.map((x) => optionKarte(o, st, x, empf))));
  }
  return h('article', { class: 'gs-schritt', 'data-teil': 'vorlage' }, teile);
}

function folge(o: SchrittOptionen, st: Station): HTMLElement {
  const opt = gewaehlteOption(o.g, o.stand, st);
  const thema = st.theorie !== null ? o.themaTitel(st.theorie) : null;
  const folgen = opt !== null ? folgenListe(o.g, opt.folgen) : [];
  return h('article', { class: 'gs-schritt', 'data-teil': 'folge' },
    kopf(st, w.teile['folge'] ?? ''),
    opt === null
      ? h('p', { class: 'gs-hinweis' }, w.nochKeineWahl, ' ', o.bedienbar ? h('button', { type: 'button', class: 'gs-leiser-knopf', onclick: () => o.tue(geheZu(o.g, o.stand, { ort: 'station', station: st.id, teil: 'vorlage' })) }, w.teile['vorlage'] ?? '') : null)
      : h('section', { class: 'gs-entscheidung', 'data-pruef': 'gs-entscheidung' },
        h('p', { class: 'gs-hinweis-titel' }, sym('haken'), w.ihreEntscheidung),
        h('h2', { class: 'gs-frage' }, `${opt.id} · ${opt.titel}`),
        h('div', { class: 'gs-text' }, inhalt(opt.konsequenzHtml)),
        opt.naechsteHtml !== null ? h('div', { class: 'gs-naechste' }, h('h3', null, w.naechste), inhalt(opt.naechsteHtml)) : null,
        h('p', { class: 'gs-folgen' }, h('b', null, `${w.folgen}: `), folgen.length > 0 ? folgen.join(' · ') : w.keineFolgen)),
    h('div', { class: 'gs-merksatz' }, inhalt(st.folgeHtml)),
    h('details', { class: 'gs-vertiefung', 'data-pruef': 'gs-so-laeuft' }, h('summary', null, w.soLaeuft), inhalt(st.soLaeuftHtml)),
    h('details', { class: 'gs-vertiefung', 'data-pruef': 'gs-einwand' },
      h('summary', null, w.einwand),
      h('p', { class: 'gs-einwand-frage' }, st.einwand.frage),
      inhalt(st.einwand.antwortHtml)),
    thema !== null && o.bedienbar ? h('p', { class: 'gs-thema' }, `${w.zumThema} `, h('a', { href: `#theorie/${st.theorie ?? ''}`, 'data-pruef': 'gs-thema' }, thema)) : null);
}

function prolog(o: SchrittOptionen): HTMLElement {
  const lang = wegStationen(o.g, false).length;
  const kurz = wegStationen(o.g, true).length;
  const fassung = (k: boolean, titel: string, meta: string): HTMLElement => o.bedienbar
    ? h('button', { type: 'button', class: 'gs-fassung', 'aria-pressed': o.stand.kurz === k ? 'true' : 'false', 'data-pruef': k ? 'fassung-kurz' : 'fassung-lang', onclick: () => o.tue(setzeKurz(o.g, o.stand, k)) }, h('b', null, titel), h('span', null, meta))
    : h('div', { class: 'gs-fassung', 'aria-pressed': o.stand.kurz === k ? 'true' : 'false' }, h('b', null, titel), h('span', null, meta));
  return h('article', { class: 'gs-schritt gs-prolog', 'data-teil': 'prolog' },
    h('header', { class: 'gs-kopf' },
      h('p', { class: 'gs-kicker' }, `${w.prolog} · ${w.fiktiv}`),
      h('h1', { class: 'gs-titel', tabindex: -1, 'data-pruef': 'gs-titel' }, o.g.prolog.titel)),
    h('div', { class: 'gs-text' }, inhalt(o.g.prolog.html)),
    h('div', { class: 'gs-takt' }, sym('aktualisieren'), h('div', null, inhalt(o.g.prolog.taktHtml))),
    h('fieldset', { class: 'gs-fassungen' },
      h('legend', null, w.fassung),
      fassung(false, w.langfassung, w.langMeta(lang)),
      fassung(true, w.kurzfassung, w.kurzMeta(kurz))));
}

function ende(o: SchrittOptionen): HTMLElement {
  const s = status(o.g, o.stand, { ort: 'ende' });
  const t = statusText(o.g, s);
  const urteil = pufferUrteil(s.puffer);
  const urteilText = urteil === 'gut' ? o.g.ende.pufferGut : urteil === 'knapp' ? o.g.ende.pufferKnapp : o.g.ende.pufferSchlecht;
  return h('article', { class: 'gs-schritt gs-ende', 'data-teil': 'ende' },
    h('header', { class: 'gs-kopf' },
      h('p', { class: 'gs-kicker' }, `${w.ende} · ${w.fiktiv}`),
      h('h1', { class: 'gs-titel', tabindex: -1, 'data-pruef': 'gs-titel' }, o.g.ende.titel)),
    h('div', { class: 'gs-text' }, inhalt(o.g.ende.html)),
    h('p', { class: 'gs-urteil', 'data-urteil': urteil, 'data-pruef': 'gs-urteil' }, inhaltInline(urteilText)),
    ...o.g.ende.zeilen.filter((z) => gilt(o.g, o.stand, z.wenn, 'ende')).map((z) => h('p', { class: 'gs-urteil', 'data-pruef': 'gs-ende-zeile' }, inhaltInline(z.html))),
    h('dl', { class: 'gs-endstand' },
      h('div', null, h('dt', null, o.g.status.kosten.titel), h('dd', null, t.kosten)),
      h('div', null, h('dt', null, o.g.status.puffer.titel), h('dd', null, t.puffer)),
      h('div', null, h('dt', null, o.g.status.offen.titel), h('dd', null, t.offen))),
    h('section', { class: 'gs-bilanz', 'aria-labelledby': 'gs-bilanz-titel' },
      h('h2', { id: 'gs-bilanz-titel' }, w.ihreEntscheidungen),
      h('ol', { class: 'gs-bilanz-liste', 'data-pruef': 'gs-bilanz' }, o.g.stationen.map((st) => {
        const opt = gewaehlteOption(o.g, o.stand, st);
        const automatisch = o.stand.wahlen[st.id] === undefined && opt !== null;
        const wieEmpf = opt !== null && opt.id === empfohlen(o.g, o.stand, st);
        return h('li', null,
          h('span', { class: 'gs-bilanz-station' }, `${st.nr} · ${st.kurztitel}`),
          h('b', null, opt !== null ? opt.titel : '–'),
          h('small', null, automatisch ? w.automatisch : opt === null ? '' : wieEmpf ? w.wieEmpfohlen : w.andersAlsEmpfohlen));
      }))),
    o.bedienbar ? h('nav', { class: 'gs-ende-wege', 'aria-label': w.ende },
      h('a', { href: '#theorie', 'data-pruef': 'ende-theorie' }, w.zurTheorie),
      h('a', { href: '#explore', 'data-pruef': 'ende-explore' }, w.zuExplore),
      bmLink()) : null);
}

/** Ein Schritt der Story als Artikel (rein aus Geschichte und Stand). */
export function baueSchritt(o: SchrittOptionen): HTMLElement {
  const s = o.stand.schritt;
  if (s.ort === 'prolog') return prolog(o);
  if (s.ort === 'ende') return ende(o);
  const st = station(o.g, s.station);
  if (st === null) return prolog(o);
  return s.teil === 'lage' ? lage(o, st) : s.teil === 'vorlage' ? vorlage(o, st) : folge(o, st);
}

/* ------------------------------------------------------ Leiste oben -- */

function schrittName(g: Geschichte, s: Schritt): string {
  if (s.ort === 'prolog') return w.prolog;
  if (s.ort === 'ende') return w.ende;
  const st = station(g, s.station);
  return `${st?.nr ?? ''} ${st?.kurztitel ?? ''} · ${w.teile[s.teil] ?? ''}`;
}

/** Fortschrittslinie: ein Punkt je Schritt, gruppiert nach Station; bedienbar = Sprung. */
export function fortschritt(g: Geschichte, stand: Stand, bedienbar: boolean, tue: (neu: Stand) => void): HTMLElement {
  const alle = schritte(g, stand.kurz);
  const jetzt = schrittIndex(g, stand);
  const zustand = (i: number): string => (i < jetzt ? 'erledigt' : i === jetzt ? 'jetzt' : 'offen');
  return h('nav', { class: 'gs-fortschritt', 'aria-label': w.fortschritt, 'data-pruef': 'gs-fortschritt' },
    // Sprungpunkte (ab 761 px; schmaler wären sie unter 24 px breit – dort nur die Linie, geblättert wird mit Weiter/Zurück)
    h('ol', { class: 'gs-punkte' }, alle.map((s, i) => {
      const name = schrittName(g, s);
      const attrs = {
        class: 'gs-punkt-schritt', 'data-ort': s.ort, 'data-teil': s.ort === 'station' ? s.teil : null,
        'data-zustand': zustand(i), 'aria-current': i === jetzt ? 'step' : null, title: name,
      };
      return h('li', null, bedienbar
        ? h('button', { ...attrs, type: 'button', 'aria-label': name, onclick: () => tue(geheZu(g, stand, s)) })
        : h('span', { ...attrs, 'aria-label': name }));
    })),
    h('div', { class: 'gs-linie', 'aria-hidden': 'true' }, alle.map((s, i) => h('span', { 'data-ort': s.ort, 'data-teil': s.ort === 'station' ? s.teil : null, 'data-zustand': zustand(i) }))));
}

/** Leiste oben: Fortschrittslinie, darunter Ort und kleine Statusanzeige. */
export function leisteOben(g: Geschichte, stand: Stand, bedienbar: boolean, tue: (neu: Stand) => void): Node[] {
  return [fortschritt(g, stand, bedienbar, tue), h('p', { class: 'gs-fortschritt-text', 'aria-live': 'polite' }, schrittName(g, stand.schritt)), statusLeiste(g, stand)];
}

export function statusLeiste(g: Geschichte, stand: Stand): HTMLElement {
  const s = status(g, stand);
  const t = statusText(g, s);
  const basis = g.status.kosten.basis;
  const ueber = basis !== null ? Math.round((s.kosten - basis) * 100) / 100 : 0;
  // R67 (STIL Grundsatz 7): die Lage steht nie nur in der Farbe – je Kachel Form (statusSymbol) und Wort
  const kachel = (art: string, lage: Lage, titel: string, ...wert: Kind[]): HTMLElement =>
    h('div', { 'data-status': art, 'data-lage': lage },
      h('dt', null, titel),
      h('dd', null, elementAus(statusSymbol(lage)), wert, h('span', { class: 'nur-sr', 'data-pruef': 'gs-lagewort' }, ` (${w.lagen[lage]})`)));
  return h('dl', { class: 'gs-status', 'aria-label': w.status, 'data-pruef': 'gs-status' },
    kachel('kosten', ueber > 2.9 ? 'kritisch' : ueber > 0 ? 'mittel' : 'ok', g.status.kosten.titel, t.kosten, basis !== null && ueber !== 0 ? h('small', null, ` (${mitVorzeichen(ueber)})`) : null),
    kachel('puffer', s.puffer < 0 ? 'kritisch' : s.puffer <= 7 ? 'mittel' : 'ok', g.status.puffer.titel, t.puffer),
    kachel('offen', s.offen > 1 ? 'kritisch' : s.offen > 0 ? 'mittel' : 'ok', g.status.offen.titel, t.offen));
}

type Lage = 'ok' | 'mittel' | 'kritisch';

/** Leistungsphase am Schritt (für die Zeichnung im Hintergrund). */
export function lphAm(g: Geschichte, s: Schritt): number | null {
  if (s.ort === 'prolog') return g.stationen[0]?.lph ?? null;
  if (s.ort === 'ende') return 9;
  return station(g, s.station)?.lph ?? null;
}

/* ----------------------------------------------------------- Fläche -- */

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
  /** Permalink-Sprung (#story/s3) */
  zuStation(id: string): void;
  stand(): Stand;
  taste(e: KeyboardEvent): boolean;
  /** wird bei jeder Änderung gerufen (Adresszeile, Regie) */
  beiAenderung(fn: (s: Stand) => void): void;
}

/**
 * R67 (WCAG 2.4.11): Der Fokus liegt nie unter den klebenden Leisten. Ihre Höhen stehen als --gs-oben/--gs-unten
 * auf <html> (scroll-padding in geschichte.css); bleibt ein fokussiertes Element trotzdem unter einer Leiste, rollt
 * die Seite ohne Animation (prefers-reduced-motion gilt damit von selbst) gerade so weit, dass es frei steht.
 */
function haltFokusFrei(element: HTMLElement, leiste: HTMLElement, unten: HTMLElement, hinweis: HTMLElement): void {
  const RAND = 8;
  const masse = (): void => {
    const wurzel = document.documentElement.style;
    wurzel.setProperty('--gs-oben', `${Math.ceil(leiste.getBoundingClientRect().height) + RAND}px`);
    wurzel.setProperty('--gs-unten', `${Math.ceil(unten.getBoundingClientRect().bottom - hinweis.getBoundingClientRect().top) + RAND}px`);
  };
  if (typeof ResizeObserver === 'function') {
    const beobachter = new ResizeObserver(masse);
    beobachter.observe(leiste);
    beobachter.observe(unten);
  }
  const frei = (ziel: HTMLElement): void => {
    // nur der Schritt liegt zwischen den Leisten; Kopf, Leisten und Fuß stehen nie darunter
    if (!ziel.isConnected || ziel.closest('.gs-buehne') === null) return;
    const q = ziel.getBoundingClientRect();
    if (q.height === 0) return;
    // oben endet die Leiste; unten deckt der Verlauf ab dem Hinweis (darüber ist er durchsichtig)
    const oben = leiste.getBoundingClientRect().bottom + RAND;
    const grenze = hinweis.getBoundingClientRect().top - RAND;
    let um = 0;
    if (q.top < oben) um = q.top - oben;
    else if (q.bottom > grenze) um = Math.min(q.bottom - grenze, q.top - oben);
    if (Math.abs(um) >= 1) window.scrollBy({ top: um, behavior: 'instant' });
  };
  // nach dem eigenen Rollen des Browsers prüfen (das folgt dem Fokusereignis)
  element.addEventListener('focusin', (e) => {
    const ziel = e.target;
    if (!(ziel instanceof HTMLElement)) return;
    masse();
    requestAnimationFrame(() => frei(ziel));
  });
}

export function erzeugeGeschichte(o: { g: Geschichte; speicher: SpeicherGriff | null; themaTitel: (id: string) => string | null }): GeschichteFlaeche {
  const { g } = o;
  let stand: Stand = ladeStand(g, o.speicher) ?? neuerStand();
  let gegenprobe: Gewichte | null = null;
  let zuhoerer: ((s: Stand) => void) | null = null;
  const leiste = h('div', { class: 'gs-leiste' });
  const buehne = h('div', { class: 'gs-buehne' });
  const navi = h('nav', { class: 'gs-navi', 'aria-label': w.fortschritt });
  const hinweis = h('p', { class: 'gs-navi-hinweis', 'aria-live': 'polite' });
  const hintergrund = h('div', { class: 'gs-hintergrund', 'aria-hidden': 'true' });
  const unten = h('div', { class: 'gs-unten' }, hinweis, navi);
  const loeschen = h('button', { type: 'button', class: 'gs-leiser-knopf', 'data-pruef': 'fortschritt-loeschen', title: w.fortschrittHinweis, onclick: () => {
    try { o.speicher?.removeItem(SPEICHER_SCHLUESSEL); } catch { /* Speicher gesperrt: nichts zu löschen */ }
    gegenprobe = null;
    // R68: gelöscht bleibt gelöscht – der frische Stand wird erst mit dem nächsten Schritt wieder gespeichert
    setze(neuerStand(), true, false);
  } }, w.fortschrittLoeschen);
  const element = seitenRahmen({
    bereich: 'story',
    klasse: 'seite-story',
    hintergrund,
    inhalt: [leiste, buehne, unten],
    fussZusatz: h('p', { class: 'fuss-zusatz' }, `${w.fiktiv} · ${w.fortschrittHinweis} `, loeschen),
  });
  haltFokusFrei(element, leiste, unten, hinweis);

  const speichere = (): void => {
    try { o.speicher?.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(stand)); } catch { /* Speicher voll oder gesperrt */ }
  };

  const zeichne = (schrittNeu: boolean): void => {
    const fokusId = (document.activeElement as HTMLElement | null)?.dataset['pruef'] ?? null;
    ersetze(leiste, leisteOben(g, stand, true, (n) => setze(n, true)));
    ersetze(buehne, baueSchritt({ g, stand, bedienbar: true, themaTitel: o.themaTitel, gegenprobe, tue: (n) => setze(n, !gleicherSchritt(n.schritt, stand.schritt)), setzeGegenprobe: (x) => { gegenprobe = x; if (x === null) zeichne(false); } }));
    const lph = lphAm(g, stand.schritt);
    const stufe = String(stufeAusLph(lph));
    if (hintergrund.dataset['stufe'] !== stufe) {
      hintergrund.dataset['stufe'] = stufe;
      ersetze(hintergrund, vonHtml(campus(stufeAusLph(lph), 'bauplan bauplan-story')));
    }
    // nur ein neuer Schritt blendet ein, eine Wahl im selben Schritt nicht
    if (schrittNeu) buehne.firstElementChild?.classList.add('ist-neu');
    const i = schrittIndex(g, stand);
    const anzahl = schritte(g, stand.kurz).length;
    const amEnde = stand.schritt.ort === 'ende';
    const istProlog = stand.schritt.ort === 'prolog';
    ersetze(navi,
      i > 0 ? h('button', { type: 'button', class: 'gs-knopf gs-knopf-zurueck', 'data-pruef': 'zurueck', onclick: () => setze(zurueck(g, stand), true) }, sym('pfeilLinks'), w.zurueck) : h('span'),
      amEnde ? h('button', { type: 'button', class: 'gs-knopf', 'data-pruef': 'von-vorn', onclick: () => setze({ ...neuerStand(stand.kurz) }, true) }, w.vonVorn)
        : h('button', { type: 'button', class: 'gs-knopf gs-knopf-weiter', 'data-pruef': 'weiter', onclick: weiterKlick },
          istProlog ? (Object.keys(stand.wahlen).length > 0 ? w.weiterlesen : w.beginnen) : w.weiter, sym('pfeilRechts')));
    attr(navi, 'data-schritt', `${i + 1}/${anzahl}`);
    hinweis.textContent = '';
    document.body.dataset['teil'] = stand.schritt.ort === 'station' ? stand.schritt.teil : stand.schritt.ort;
    if (schrittNeu) {
      window.scrollTo(0, 0);
      (buehne.querySelector('.gs-titel') as HTMLElement | null)?.focus({ preventScroll: true });
    } else if (fokusId !== null) {
      (element.querySelector(`[data-pruef="${fokusId}"]`) as HTMLElement | null)?.focus({ preventScroll: true });
    }
  };

  function setze(neu: Stand, schrittNeu: boolean, merken = true): void {
    if (!gleicherSchritt(neu.schritt, stand.schritt)) gegenprobe = null;
    stand = neu;
    if (merken) speichere();
    zeichne(schrittNeu);
    zuhoerer?.(stand);
  }

  function weiterKlick(): void {
    const s = stand.schritt;
    // Ohne Wahl geht es von der Vorlage nicht zur Folge – die Folge zeigt, was aus der Entscheidung wird
    if (s.ort === 'station' && s.teil === 'vorlage' && stand.wahlen[s.station] === undefined) {
      hinweis.textContent = w.nochKeineWahl;
      (buehne.querySelector('.gs-option') as HTMLElement | null)?.focus();
      return;
    }
    setze(weiter(g, stand), true);
  }

  zeichne(false);
  return {
    element,
    zuStation(id: string) {
      const st = g.stationen.find((x) => x.id.toLowerCase() === id.toLowerCase());
      if (st === undefined) return;
      let neu = stand;
      if (!wegStationen(g, neu.kurz).includes(st)) neu = { ...neu, kurz: false };
      setze(geheZu(g, neu, { ort: 'station', station: st.id, teil: 'lage' }), true);
    },
    stand: () => stand,
    taste(e: KeyboardEvent): boolean {
      const ziel = e.target as HTMLElement | null;
      if (ziel?.closest('input, textarea, select, summary, [contenteditable]') || e.altKey || e.ctrlKey || e.metaKey) return false;
      if (e.key === 'ArrowRight') { weiterKlick(); return true; }
      if (e.key === 'ArrowLeft') { setze(zurueck(g, stand), true); return true; }
      return false;
    },
    beiAenderung(fn) { zuhoerer = fn; },
  };
}
