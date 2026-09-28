/*
 * Explore · Grafik-Galerie mit Abbildungsverzeichnis und Story-Karte mit Sprung (P8.5).
 *
 * Galerie: alle Whitepaper-Tabellen, die die Lernseiten als interaktive Tafel zeigen (Zellen wortgleich,
 * L-32), nach Kapitel geordnet; eine Tafel ist offen. Abbildungsverzeichnis: die Abbildungen des
 * Whitepapers mit Kapitel und Stelle – als Rasterbilder nicht übernommen (L-51), der Text V1.2 gilt
 * (O-14, O-15). Story-Karte: jede Station als Sprungziel; Welt B erst nach der Freischaltung.
 */

import { h, ersetze } from '../h.ts';
import { wahlleiste } from '../bausteine/wahlleiste.ts';
import type { Block, OeffentlicheInhalte } from '../../inhalte/typen.ts';
import * as B from '../bausteine/bloecke.ts';
import { kopfText, stationsName } from '../anzeige.ts';
import { W } from '../woerter.ts';

interface TafelEintrag { block: Block; kapitel: number }

/** Alle Tafeln der Lernseiten (in Kapitel- und Lesereihenfolge, je Tabelle einmal). */
export function galerieTafeln(inhalte: OeffentlicheInhalte): TafelEintrag[] {
  const aus: TafelEintrag[] = [];
  const gesehen = new Set<string>();
  const gehe = (bloecke: readonly Block[], kapitel: number): void => {
    for (const b of bloecke) {
      if (b.art === 'tafel' && b.id !== null && !gesehen.has(b.id)) { gesehen.add(b.id); aus.push({ block: b, kapitel }); }
      gehe(b.kinder, kapitel);
      for (const e of b.ebenen ?? []) gehe(e.bloecke, kapitel);
    }
  };
  for (const t of Object.values(inhalte.theorie).sort((a, b) => a.kapitel - b.kapitel)) gehe(t.bloecke, t.kapitel);
  return aus;
}

/** Diagramme der Geschichte (native SVG/HTML-Grafiken der Story): Art → Stationen, in der Reihenfolge der Geschichte. */
export const STORY_DIAGRAMME = ['mandatsleiter', 'kette', 'raci', 'datenstand', 'grafik', 'vorlage', 'nachweiskette'] as const;
export function storyDiagramme(inhalte: OeffentlicheInhalte): { art: string; stationen: string[] }[] {
  const nach = new Map<string, string[]>();
  const gehe = (bloecke: readonly Block[], st: string): void => {
    for (const b of bloecke) {
      if ((STORY_DIAGRAMME as readonly string[]).includes(b.art)) {
        const art = b.art === 'grafik' ? `grafik:${b.id ?? ''}` : b.art;
        const liste = nach.get(art) ?? [];
        if (!liste.includes(st)) nach.set(art, [...liste, st]);
      }
      gehe(b.kinder, st);
    }
  };
  for (const id of inhalte.stationsFolge) for (const s of inhalte.stationen[id]?.schritte ?? []) gehe(s.bloecke, id);
  return [...nach.entries()].map(([art, stationen]) => ({ art, stationen }));
}

/** Stelle im Text als Permalink: `k3.3` → Abschnitt 3.3, `k7.1-p1` → Abschnitt 7.1, `k1` → Kapitel 1. */
function stelle(ort: string, kapitel: string): Node {
  const abschnitt = /^k(\d+(?:\.\d+)+)/u.exec(ort)?.[1] ?? null;
  const ziel = abschnitt !== null ? `#theorie/k${kapitel}/${abschnitt}` : `#theorie/k${kapitel}`;
  return h('a', { href: ziel }, abschnitt !== null ? W.galerie.abschnitt(abschnitt) : W.theorie.kapitelVon(kapitel));
}

export function galerie(inhalte: OeffentlicheInhalte, weltB = true): HTMLElement | null {
  const G = W.galerie;
  const tafeln = galerieTafeln(inhalte);
  if (tafeln.length === 0) return null;
  const buehne = h('div', { class: 'galerie-buehne', 'data-pruef': 'galerie-buehne' });
  const wahl = wahlleiste({
    beschriftungen: tafeln.map((t) => `${W.theorie.kapitelKurz(String(t.kapitel))} · ${t.block.id ?? ''}`),
    pruef: (i) => `galerie-${tafeln[i]?.block.id ?? ''}`,
    gruppe: G.wahl,
    meldung: G.gezeigt,
    bei: (i) => {
      const t = tafeln[i];
      if (t === undefined) return;
      ersetze(buehne, h('p', { class: 'galerie-quelle' }, `${kopfText(t.block.kopf, 'quelle') ?? ''} · `, h('a', { href: `#theorie/k${t.kapitel}` }, G.zurLernseite)),
        B.tafel(t.block, [], inhalte, 'h3'));
    },
  });
  wahl.waehle(0);

  const abb = inhalte.whitepaper.abbildungen;
  const diagramme = storyDiagramme(inhalte);
  const stationsLink = (id: string): Node => {
    const st = inhalte.stationen[id];
    const name = st === undefined ? id : /^[AB]\d$/u.test(id) ? id : st.titel;
    return st?.welt === 'B' && !weltB ? h('span', null, name) : h('a', { href: `#story/${id}` }, name);
  };
  return h('section', { class: 'werkzeug', id: 'werkzeug-galerie-flaeche', 'aria-labelledby': 'galerie-titel', 'data-pruef': 'galerie' },
    h('h2', { class: 'lern-abschnitt-titel', id: 'galerie-titel' }, G.name),
    h('p', { class: 'kapitel-einstieg' }, G.einstieg(tafeln.length)),
    wahl.leiste, wahl.meldung,
    buehne,
    diagramme.length > 0 ? h('section', { class: 'galerie-verzeichnis', 'aria-labelledby': 'dia-titel', 'data-pruef': 'story-diagramme' },
      h('h3', { class: 'sim-teil-titel', id: 'dia-titel' }, G.diagramme),
      h('p', { class: 'sim-hinweis' }, G.diagrammeText),
      h('ul', { class: 'resuemee-liste' }, diagramme.map((d) => h('li', null, h('b', null, G.diagrammName(d.art)), ': ',
        d.stationen.flatMap((id, i) => (i === 0 ? [stationsLink(id)] : [', ', stationsLink(id)])))))) : null,
    abb.length > 0 ? h('section', { class: 'galerie-verzeichnis', 'aria-labelledby': 'abb-titel', 'data-pruef': 'abbildungsverzeichnis' },
      h('h3', { class: 'sim-teil-titel', id: 'abb-titel' }, G.verzeichnis),
      h('p', { class: 'sim-hinweis' }, G.verzeichnisText),
      h('table', { class: 'register-tabelle' },
        h('thead', null, h('tr', null, h('th', null, G.abb), h('th', null, G.kapitel), h('th', null, G.stelle))),
        h('tbody', null, abb.map((a, i) => h('tr', null,
          h('td', null, G.abbNr(i + 1)),
          h('td', null, h('a', { href: `#theorie/k${a.kapitel}` }, W.theorie.kapitelVon(a.kapitel))),
          h('td', null, stelle(a.ort, a.kapitel))))))) : null);
}

/** Story-Karte mit Sprung: jede Station; Welt B erst, wenn sie freigeschaltet ist (sonst ohne Link). */
export function stationsKarte(inhalte: OeffentlicheInhalte, weltB: boolean): HTMLElement {
  const G = W.galerie;
  return h('section', { class: 'werkzeug', 'aria-labelledby': 'karte-titel', 'data-pruef': 'explore-karte' },
    h('h2', { class: 'lern-abschnitt-titel', id: 'karte-titel' }, G.karte),
    h('p', { class: 'kapitel-einstieg' }, weltB ? G.karteText : G.karteGesperrt),
    h('ol', { class: 'explore-stationen' }, inhalte.stationsFolge.map((id) => {
      const st = inhalte.stationen[id];
      if (st === undefined) return null;
      const name = stationsName(inhalte, id);
      const gesperrt = st.welt === 'B' && !weltB;
      return h('li', { 'data-welt': st.welt === 'A' ? 'a' : st.welt === 'B' ? 'b' : null },
        gesperrt ? h('span', { class: 'explore-station ist-gesperrt' }, name, h('span', { class: 'nur-sr' }, ` (${G.gesperrt})`))
          : h('a', { class: 'explore-station', href: `#story/${id}`, 'data-pruef': `sprung-${id}` }, name));
    })));
}
