/*
 * Explore · Grafik-Galerie mit Abbildungsverzeichnis und Story-Karte mit Sprung (P8.5).
 *
 * Galerie: alle Whitepaper-Tabellen, die die Lernseiten als interaktive Tafel zeigen (Zellen wortgleich,
 * L-32), nach Kapitel geordnet; eine Tafel ist offen. Abbildungsverzeichnis: die Abbildungen des
 * Whitepapers mit Kapitel und Stelle – als Rasterbilder nicht übernommen (L-51), der Text V1.2 gilt
 * (O-14, O-15). Story-Karte: jede Station als Sprungziel; Welt B erst nach der Freischaltung.
 */

import { h, attr, ersetze } from '../h.ts';
import type { Block, OeffentlicheInhalte } from '../../inhalte/typen.ts';
import * as B from '../bausteine/bloecke.ts';
import { kopfText } from '../anzeige.ts';
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

export function galerie(inhalte: OeffentlicheInhalte, weltB = true): HTMLElement | null {
  const G = W.galerie;
  const tafeln = galerieTafeln(inhalte);
  if (tafeln.length === 0) return null;
  const buehne = h('div', { class: 'galerie-buehne', 'aria-live': 'polite', 'data-pruef': 'galerie-buehne' });
  const knoepfe = tafeln.map((t, i) => h('button', { type: 'button', class: 'welten-knopf', 'aria-pressed': 'false', 'data-pruef': `galerie-${t.block.id ?? ''}`, onclick: () => zeige(i) },
    `${W.theorie.kapitelKurz(String(t.kapitel))} · ${t.block.id ?? ''}`));
  const zeige = (i: number): void => {
    knoepfe.forEach((k, j) => attr(k, 'aria-pressed', i === j ? 'true' : 'false'));
    const t = tafeln[i];
    if (t === undefined) return;
    ersetze(buehne, h('p', { class: 'galerie-quelle' }, `${kopfText(t.block.kopf, 'quelle') ?? ''} · `, h('a', { href: `#theorie/k${t.kapitel}` }, G.zurLernseite)),
      B.tafel(t.block, [], inhalte, 'h3'));
  };
  zeige(0);

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
    h('div', { class: 'welten-wahl', role: 'group', 'aria-label': G.wahl }, knoepfe),
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
        h('tbody', null, abb.map((a) => h('tr', null,
          h('td', null, G.abbNr(a.id)),
          h('td', null, h('a', { href: `#theorie/k${a.kapitel}` }, W.theorie.kapitelVon(a.kapitel))),
          h('td', null, a.ort)))))) : null);
}

/** Story-Karte mit Sprung: jede Station; Welt B erst, wenn sie freigeschaltet ist (sonst ohne Link). */
export function stationsKarte(inhalte: OeffentlicheInhalte, weltB: boolean): HTMLElement {
  const G = W.galerie;
  return h('section', { class: 'werkzeug', id: 'werkzeug-figuren-flaeche', 'aria-labelledby': 'karte-titel', 'data-pruef': 'explore-karte' },
    h('h2', { class: 'lern-abschnitt-titel', id: 'karte-titel' }, G.karte),
    h('p', { class: 'kapitel-einstieg' }, weltB ? G.karteText : G.karteGesperrt),
    h('ol', { class: 'explore-stationen' }, inhalte.stationsFolge.map((id) => {
      const st = inhalte.stationen[id];
      if (st === undefined) return null;
      const name = /^[AB]\d$/u.test(id) ? `${id} · ${st.kurztitel}` : st.kurztitel === 'Ende' ? st.titel : st.kurztitel;
      const gesperrt = st.welt === 'B' && !weltB;
      return h('li', { 'data-welt': st.welt === 'A' ? 'a' : st.welt === 'B' ? 'b' : null },
        gesperrt ? h('span', { class: 'explore-station ist-gesperrt' }, name, h('span', { class: 'nur-sr' }, ` (${G.gesperrt})`))
          : h('a', { class: 'explore-station', href: `#story/${id}`, 'data-pruef': `sprung-${id}` }, name));
    })));
}
