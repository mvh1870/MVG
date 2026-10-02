/*
 * Bereich „Explore“ (P16.8, O-46): fünf Werkzeuge zum Ausprobieren, alle am fiktiven Schulcampus
 * Lindenhall-Süd (O-50). Nichts wird gesendet; Einstellungen gelten nur für diese Ansicht.
 *
 *   #explore            → MCDA-Rechner (erstes Werkzeug), darüber die Werkzeugleiste
 *   #explore/<werkzeug> → mcda · matrix · vorgaenge · takt · glossar
 *
 * Die Texte stehen in inhalte/werkzeuge.yaml; die Beispiele des Rechners sind die Vorlagen der Story.
 */

import type { Option, Station } from '../../geschichte/typen.ts';
import { GEWICHT_MAX, GEWICHT_MIN, kipppunkte, rangfolge, type Gewichte } from '../../geschichte/mcda.ts';
import { grundriss } from '../../grafik/bauplan.ts';
import type { OeffentlicheInhalte, Werkzeuge } from '../../inhalte/typen.ts';
import { ersetze, h, vonHtml } from '../h.ts';
import { inhalt, inhaltInline } from '../bausteine/inhalt.ts';
import { sym } from '../bausteine/bloecke.ts';
import { seitenRahmen } from '../bausteine/seite.ts';
import { glossarListe } from './theorie.ts';
import { W } from '../woerter.ts';

export const WERKZEUGE = ['mcda', 'matrix', 'vorgaenge', 'takt', 'glossar'] as const;
export type Werkzeug = (typeof WERKZEUGE)[number];

export function werkzeugAus(id: string | null): Werkzeug {
  return (WERKZEUGE as readonly string[]).includes(id ?? '') ? id as Werkzeug : 'mcda';
}

export interface ExploreOptionen {
  inhalte: OeffentlicheInhalte;
  werkzeug: string | null;
  bedienbar: boolean;
}

const E = W.werkzeuge;

/* ---------------------------------------------------------------- MCDA -- */

interface Rechner { station: string; gewichte: Gewichte; punkte: Record<string, Record<string, number>> }

function beispiele(o: ExploreOptionen): Station[] {
  return (o.inhalte.geschichte?.stationen ?? []).filter((s) => s.vorlage.art === 'optionen' && s.vorlage.unvollstaendigHtml === null);
}

function startRechner(o: ExploreOptionen, st: Station): Rechner {
  const g = o.inhalte.geschichte;
  const s1 = g?.stationen.find((x) => x.vorlage.art === 'gewichte');
  const vorschlag = s1?.vorlage.optionen.find((x) => x.id === s1.vorlage.empfehlung.option)?.gewichte ?? {};
  const gewichte: Gewichte = {};
  for (const k of g?.kriterien ?? []) gewichte[k.id] = vorschlag[k.id] ?? 3;
  const punkte: Record<string, Record<string, number>> = {};
  for (const opt of st.vorlage.optionen) {
    punkte[opt.id] = {};
    for (const k of g?.kriterien ?? []) (punkte[opt.id] ?? {})[k.id] = opt.punkte?.[k.id]?.[0] ?? 3;
  }
  return { station: st.id, gewichte, punkte };
}

/** Optionen mit den eingestellten Punkten (Begründung bleibt die der Vorlage). */
function optionenMit(st: Station, r: Rechner): Option[] {
  return st.vorlage.optionen.filter((x) => !x.klaerung).map((x) => ({
    ...x,
    punkte: Object.fromEntries(Object.entries(x.punkte ?? {}).map(([k, p]) => [k, [r.punkte[x.id]?.[k] ?? p[0], p[1]] as [number, string]])),
  }));
}

function mcda(o: ExploreOptionen, w: Werkzeuge): HTMLElement {
  const g = o.inhalte.geschichte;
  const liste = beispiele(o);
  const ort = h('div', { class: 'ex-mcda-ort' });
  if (g === null || liste.length === 0) return h('section', null, h('p', null, E.keinBeispiel));
  let r = startRechner(o, liste[liste.length - 1] ?? liste[0] as Station);

  const zeichne = (): void => {
    const st = liste.find((x) => x.id === r.station) ?? liste[0] as Station;
    const opts = optionenMit(st, r);
    const plaetze = rangfolge(opts, g.kriterien, r.gewichte);
    const max = Math.max(1, ...plaetze.map((p) => p.summe));
    const kipp = kipppunkte(opts, g.kriterien, r.gewichte);
    const titel = (id: string): string => opts.find((x) => x.id === id)?.titel ?? id;
    const auswahl = (wert: number, beimAendern: (n: number) => void, name: string): HTMLElement => o.bedienbar
      ? h('select', { class: 'ex-punkt-wahl', 'aria-label': name, onchange: (e: Event) => beimAendern(Number((e.target as HTMLSelectElement).value)) },
        [1, 2, 3, 4, 5].map((n) => h('option', { value: n, selected: n === wert }, String(n))))
      : h('b', null, String(wert));
    ersetze(ort,
      h('p', { class: 'ex-frage' }, h('b', null, st.vorlage.frage), ' ', h('small', null, `${st.datum} · ${st.kurztitel}`)),
      h('div', { class: 'ex-tabelle-rahmen', tabindex: 0, role: 'region', 'aria-label': E.mcdaTabelle },
        h('table', { class: 'gs-tabelle ex-tabelle', 'data-pruef': 'ex-mcda-tabelle' },
          h('thead', null, h('tr', null, h('th', { scope: 'col' }, W.geschichte.kriterium), h('th', { scope: 'col' }, W.geschichte.gewicht),
            opts.map((x) => h('th', { scope: 'col' }, `${x.id} · ${x.titel}`)))),
          h('tbody', null, g.kriterien.map((k) => h('tr', null,
            h('th', { scope: 'row' }, k.titel),
            h('td', null, auswahl(r.gewichte[k.id] ?? 3, (n) => { r = { ...r, gewichte: { ...r.gewichte, [k.id]: n } }; zeichne(); }, `${W.geschichte.gewicht} ${k.titel}`)),
            opts.map((x) => h('td', null,
              auswahl(r.punkte[x.id]?.[k.id] ?? 3, (n) => { r = { ...r, punkte: { ...r.punkte, [x.id]: { ...r.punkte[x.id], [k.id]: n } } }; zeichne(); }, `${x.titel}: ${k.titel}`),
              h('small', null, x.punkte?.[k.id]?.[1] ?? '')))))),
          h('tfoot', null, h('tr', null, h('th', { scope: 'row', colspan: 2 }, W.geschichte.summe),
            opts.map((x) => {
              const p = plaetze.find((y) => y.option.id === x.id);
              return h('td', { class: p?.rang === 1 ? 'ist-vorn' : null, 'data-pruef': `ex-summe-${x.id}` },
                h('b', null, String(p?.summe ?? 0)), ' ', h('small', null, W.geschichte.rang(p?.rang ?? 0)),
                h('span', { class: 'gs-balken', style: `--anteil:${Math.round(((p?.summe ?? 0) / max) * 100)}%`, 'aria-hidden': 'true' }));
            }))))),
      h('div', { class: 'gs-kipp', 'aria-live': 'polite' },
        h('h3', null, W.geschichte.kipppunkte),
        kipp.length === 0 ? h('p', null, W.geschichte.keinKipppunkt)
          : h('ul', null, kipp.map((x) => h('li', null, W.geschichte.kipppunkt(g.kriterien.find((c) => c.id === x.kriterium)?.titel ?? x.kriterium, x.gewicht, x.spitze.map(titel)))))));
  };

  const wahl = o.bedienbar ? h('label', { class: 'ex-beispiel' }, h('span', { class: 't-label' }, E.beispiel),
    h('select', { 'data-pruef': 'ex-beispiel', onchange: (e: Event) => {
      const st = liste.find((x) => x.id === (e.target as HTMLSelectElement).value);
      if (st !== undefined) { r = startRechner(o, st); zeichne(); }
    } }, liste.map((st) => h('option', { value: st.id, selected: st.id === r.station }, `${st.kurztitel} – ${st.vorlage.frage}`)))) : null;
  const zuruecksetzen = o.bedienbar ? h('button', { type: 'button', class: 'gs-leiser-knopf', 'data-pruef': 'ex-zuruecksetzen', onclick: () => {
    const st = liste.find((x) => x.id === r.station);
    if (st !== undefined) { r = startRechner(o, st); zeichne(); }
  } }, E.zuruecksetzen) : null;
  zeichne();
  return h('div', { class: 'ex-werkzeug', 'data-werkzeug': 'mcda' },
    h('div', { class: 'gs-text' }, inhalt(w.mcda.html)),
    h('div', { class: 'ex-leiste' }, wahl, zuruecksetzen),
    ort,
    h('div', { class: 'ex-hinweis' }, sym('info'), h('div', null, inhalt(w.mcda.hinweisHtml))),
    h('p', { class: 'gs-leise' }, E.punkteHinweis(GEWICHT_MIN, GEWICHT_MAX)));
}

/* --------------------------------------------------------------- Matrix -- */

export function matrixStufe(w: Werkzeuge, wahrscheinlichkeit: number, auswirkung: number): Werkzeuge['matrix']['stufen'][number] | null {
  const wert = wahrscheinlichkeit * auswirkung;
  // Auswirkung 5 ist immer vorrangig (V2.4) – die höchste Stufe
  if (auswirkung === 5) return w.matrix.stufen[w.matrix.stufen.length - 1] ?? null;
  return w.matrix.stufen.find((s) => s.von <= wert && wert <= s.bis) ?? null;
}

function matrix(o: ExploreOptionen, w: Werkzeuge): HTMLElement {
  const m = w.matrix;
  const detail = h('div', { class: 'ex-matrix-detail', 'aria-live': 'polite', 'data-pruef': 'ex-matrix-detail' });
  let gewaehlt: [number, number] = [4, 4];
  const zellen: HTMLElement[] = [];
  const zeige = (wa: number, au: number): void => {
    gewaehlt = [wa, au];
    for (const z of zellen) z.setAttribute('aria-pressed', z.dataset['w'] === String(wa) && z.dataset['a'] === String(au) ? 'true' : 'false');
    const stufe = matrixStufe(w, wa, au);
    const hier = m.beispiele.filter((b) => b.w === wa && b.a === au);
    ersetze(detail,
      h('p', { class: 'ex-matrix-wert' }, h('b', null, String(wa * au)), ` = ${E.wahrscheinlichkeit} ${wa} (${m.wahrscheinlichkeit[wa - 1] ?? ''}) × ${E.auswirkung} ${au}`),
      stufe !== null ? h('p', { class: 'ex-matrix-stufe', 'data-stufe': stufe.id }, h('b', null, stufe.titel), au === 5 ? ` – ${E.immerVorrangig}` : null) : null,
      stufe !== null ? h('p', null, inhaltInline(stufe.html)) : null,
      h('p', { class: 'gs-leise' }, `${E.qualitaetStufe(au)} ${m.qualitaet[au - 1] ?? ''}`),
      hier.length > 0 ? h('ul', { class: 'ex-matrix-beispiele' }, hier.map((b) => h('li', null, h('span', { class: 'id-marke ex-id', 'data-art': 'risiko' }, b.kennung), ' ', b.titel))) : null);
  };
  const raster = h('table', { class: 'ex-matrix', 'data-pruef': 'ex-matrix' },
    h('caption', { class: 'nur-sr' }, m.titel),
    h('thead', null, h('tr', null, h('td', null), [1, 2, 3, 4, 5].map((wa) => h('th', { scope: 'col' }, h('b', null, String(wa)), h('small', null, m.wahrscheinlichkeit[wa - 1] ?? ''))))),
    h('tbody', null, [5, 4, 3, 2, 1].map((au) => h('tr', null,
      h('th', { scope: 'row' }, h('b', null, String(au))),
      [1, 2, 3, 4, 5].map((wa) => {
        const stufe = matrixStufe(w, wa, au);
        const anzahl = m.beispiele.filter((b) => b.w === wa && b.a === au).length;
        const attrs = { class: 'ex-zelle', 'data-stufe': stufe?.id ?? '', 'data-w': wa, 'data-a': au, 'aria-pressed': 'false', 'aria-label': E.zelle(wa, au, wa * au, stufe?.titel ?? '', anzahl) };
        const innen = [h('span', null, String(wa * au)), anzahl > 0 ? h('span', { class: 'ex-zelle-punkt', 'aria-hidden': 'true' }, String(anzahl)) : null];
        const z = o.bedienbar ? h('button', { ...attrs, type: 'button', onclick: () => zeige(wa, au) }, innen) : h('span', attrs, innen);
        zellen.push(z);
        return h('td', null, z);
      })))));
  zeige(...gewaehlt);
  return h('div', { class: 'ex-werkzeug', 'data-werkzeug': 'matrix' },
    h('div', { class: 'gs-text' }, inhalt(m.html)),
    h('div', { class: 'ex-matrix-rahmen' },
      h('div', { class: 'ex-matrix-achsen' },
        h('p', { class: 't-label ex-achse-a' }, E.auswirkung),
        raster,
        h('p', { class: 't-label ex-achse-w' }, E.wahrscheinlichkeit)),
      detail),
    h('ul', { class: 'ex-stufen' }, m.stufen.map((s) => h('li', { 'data-stufe': s.id }, h('b', null, `${s.titel} (${s.von}–${s.bis})`), ' ', inhaltInline(s.html)))),
    h('p', null, h('b', null, m.regel)),
    h('div', { class: 'ex-hinweis' }, sym('warnung'), h('p', null, m.sonder)));
}

/* ------------------------------------------------------------ Vorgänge -- */

function vorgaenge(o: ExploreOptionen, w: Werkzeuge): HTMLElement {
  const v = w.vorgaenge;
  const detail = h('div', { class: 'ex-art-detail', 'aria-live': 'polite', 'data-pruef': 'ex-art-detail' });
  const knoepfe: HTMLElement[] = [];
  const name = (id: string): string => id === 'entscheidung' ? v.entscheidung.titel : v.arten.find((a) => a.id === id)?.titel ?? id;
  const zeige = (id: string): void => {
    for (const k of knoepfe) k.setAttribute('aria-pressed', k.dataset['art'] === id ? 'true' : 'false');
    if (id === 'entscheidung') {
      ersetze(detail, h('h3', null, v.entscheidung.titel), h('p', null, inhaltInline(v.entscheidung.html)));
      return;
    }
    const a = v.arten.find((x) => x.id === id);
    if (a === undefined) return;
    ersetze(detail,
      h('h3', null, h('span', { class: 'id-marke ex-id', 'data-art': a.id }, a.titel)),
      h('p', null, inhaltInline(a.html)),
      h('dl', { class: 'ex-art-daten' },
        h('div', null, h('dt', null, E.beispielVorgang), h('dd', null, inhaltInline(a.beispiel))),
        h('div', null, h('dt', null, E.abschluss), h('dd', null, inhaltInline(a.abschluss)))),
      h('p', { class: 't-label' }, E.wege),
      h('div', { class: 'ex-wege' }, a.wege.map((z) => o.bedienbar
        ? h('button', { type: 'button', class: 'ex-weg', 'data-ziel': z, onclick: () => zeige(z) }, sym('pfeilRechts'), name(z))
        : h('span', { class: 'ex-weg' }, sym('pfeilRechts'), name(z)))));
  };
  const leiste = h('div', { class: 'ex-arten', role: 'group', 'aria-label': v.titel }, [...v.arten.map((a) => ({ id: a.id, titel: a.titel })), { id: 'entscheidung', titel: v.entscheidung.titel }].map((a) => {
    const k = o.bedienbar
      ? h('button', { type: 'button', class: 'ex-art', 'data-art': a.id, 'aria-pressed': 'false', 'data-pruef': `ex-art-${a.id}`, onclick: () => zeige(a.id) }, a.titel)
      : h('span', { class: 'ex-art', 'data-art': a.id, 'aria-pressed': 'false' }, a.titel);
    knoepfe.push(k);
    return k;
  }));
  zeige(v.arten[0]?.id ?? 'aufgabe');
  return h('div', { class: 'ex-werkzeug', 'data-werkzeug': 'vorgaenge' },
    h('div', { class: 'gs-text' }, inhalt(v.html)),
    leiste,
    detail);
}

/* ---------------------------------------------------------------- Takt -- */

function takt(_o: ExploreOptionen, w: Werkzeuge): HTMLElement {
  const t = w.takt;
  const monat = h('ol', { class: 'ex-monat', 'aria-label': E.monatsAblauf },
    [1, 2, 3, 4].map((n) => h('li', { class: 'ex-woche' },
      h('span', { class: 't-label' }, E.woche(n)),
      h('span', { class: 'ex-marke', 'data-takt': 'woche' }, E.wochenPruefung),
      n === 2 ? h('span', { class: 'ex-marke', 'data-takt': 'sofort' }, sym('blitz'), E.dringlich) : null,
      n === 4 ? h('span', { class: 'ex-marke', 'data-takt': 'monat' }, E.monatsTermin) : null)));
  return h('div', { class: 'ex-werkzeug', 'data-werkzeug': 'takt' },
    h('div', { class: 'gs-text' }, inhalt(t.html)),
    monat,
    h('div', { class: 'ex-takt' }, t.stufen.map((s) => h('section', { class: 'ex-takt-karte', 'data-takt': s.id, 'data-pruef': `ex-takt-${s.id}` },
      h('h3', null, s.titel),
      h('p', { class: 't-label' }, s.wer),
      h('p', null, inhaltInline(s.html)),
      h('p', { class: 'ex-beispiel-text' }, h('b', null, `${E.imBeispiel}: `), inhaltInline(s.beispiel))))));
}

/* --------------------------------------------------------------- Fläche -- */

export function baueExplore(o: ExploreOptionen): HTMLElement {
  const w = o.inhalte.werkzeuge;
  const aktiv = werkzeugAus(o.werkzeug);
  const titel = (id: Werkzeug): string => w?.[id].titel ?? id;
  const kurz = (id: Werkzeug): string => w?.[id].kurz ?? '';
  const werkzeugEl = w === null ? null
    : aktiv === 'mcda' ? mcda(o, w)
    : aktiv === 'matrix' ? matrix(o, w)
    : aktiv === 'vorgaenge' ? vorgaenge(o, w)
    : aktiv === 'takt' ? takt(o, w)
    : h('div', { class: 'ex-werkzeug', 'data-werkzeug': 'glossar' }, glossarListe(o));
  return seitenRahmen({
    bereich: 'explore',
    klasse: 'seite-explore',
    bedienbar: o.bedienbar,
    hintergrund: h('div', { class: 'lern-hintergrund', 'aria-hidden': 'true' }, vonHtml(grundriss())),
    inhalt: h('div', { class: 'ex-rahmen', 'data-pruef': 'explore' },
      h('header', { class: 'ex-kopf' },
        h('p', { class: 'gs-kicker' }, `${E.bereich} · ${W.fiktiv}`),
        h('h1', { class: 'gs-titel ex-titel', tabindex: -1, 'data-pruef': 'ex-titel' }, titel(aktiv)),
        w !== null ? h('div', { class: 'gs-leise ex-einleitung' }, inhalt(w.einleitungHtml)) : null),
      h('nav', { class: 'ex-werkzeuge', 'aria-label': E.werkzeuge },
        WERKZEUGE.map((id) => o.bedienbar
          ? h('a', { class: 'ex-werkzeug-link', href: `#explore/${id}`, 'aria-current': id === aktiv ? 'page' : null, 'data-pruef': `ex-${id}` }, h('b', null, titel(id)), h('small', null, kurz(id)))
          : h('span', { class: 'ex-werkzeug-link', 'aria-current': id === aktiv ? 'page' : null }, h('b', null, titel(id)), h('small', null, kurz(id))))),
      h('section', { class: 'ex-buehne', 'aria-label': titel(aktiv) }, werkzeugEl)),
  });
}
