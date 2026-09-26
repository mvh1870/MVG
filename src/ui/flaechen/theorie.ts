/*
 * Fläche „Theorie“ (O-20, L-4): ruhige Lernseiten ohne Leitstand-Rahmen.
 *
 *   #theorie      → Kapitelliste (13 Kapitel aus der Gliederung des Whitepapers)
 *   #theorie/kN   → Lernseite Kapitel N, sofern inhalte/theorie/ sie enthält; sonst „folgt“
 *
 * Lernseite: Kapitelkopf · Kernaussage · Abschnitte (Zitate, Karten) · Originaltext wörtlich mit
 * Absatz-IDs (O-17) · Querverweis in die Story · Kapitel blättern.
 */

import type { Block, OeffentlicheInhalte, TheorieSeite, WhitepaperKapitel } from '../../inhalte/typen.ts';
import { h } from '../h.ts';
import { bildmarke } from '../marke.ts';
import { sym, symbolAusInhalt } from '../bausteine/bloecke.ts';
import { inhalt, inhaltInline } from '../bausteine/inhalt.ts';
import { kopfText } from '../anzeige.ts';
import { W } from '../woerter.ts';

export interface TheorieOptionen {
  inhalte: OeffentlicheInhalte;
  /** null = Kapitelliste */
  kapitel: number | null;
  version: string;
  /** false = nur Anzeige (Leinwand) */
  bedienbar: boolean;
}

/** Lernseite eines Kapitels (oder null, wenn sie noch fehlt). */
export function lernseiteFuer(inhalte: OeffentlicheInhalte, nr: number): TheorieSeite | null {
  return Object.values(inhalte.theorie).find((t) => t.kapitel === nr) ?? null;
}

/** Die Kapitel der Gliederung (mit Rückfall auf die Lernseiten, falls die Gliederung fehlt). */
export function kapitelListe(inhalte: OeffentlicheInhalte): { nr: number; titel: string; abschnitte: number; seite: boolean }[] {
  const gl: WhitepaperKapitel[] = inhalte.whitepaper.kapitel;
  if (gl.length > 0) {
    return gl.map((k) => {
      const nr = Number(k.nr);
      return { nr, titel: k.titel, abschnitte: k.abschnitte.length, seite: lernseiteFuer(inhalte, nr) !== null };
    }).filter((k) => Number.isInteger(k.nr));
  }
  return Object.values(inhalte.theorie).map((t) => ({ nr: t.kapitel, titel: t.titel, abschnitte: 0, seite: true })).sort((a, b) => a.nr - b.nr);
}

function verweis(o: TheorieOptionen, href: string, attrs: Record<string, string>, ...kinder: (Node | string | null)[]): HTMLElement {
  return o.bedienbar ? h('a', { ...attrs, href }, kinder) : h('span', attrs, kinder);
}

function kopfleiste(o: TheorieOptionen): HTMLElement {
  return h('header', { class: 'lern-kopf' },
    bildmarke('marke-logo'),
    h('p', { class: 'lern-bereich' }, `${W.theorie.bereich} `, h('span', null, W.theorie.bereichZusatz)),
    verweis(o, '#start', { class: 'lern-kopf-link', 'data-pruef': 'zur-start' }, sym('pfeilLinks'), W.theorie.start));
}

/**
 * Sprunglink an Kopf und Kapitelverzeichnis vorbei zum Inhalt (STIL „Barrierefreiheit“). Der Hash
 * gehört dem Router – der Link setzt den Fokus selbst auf die Kapitelüberschrift.
 */
function sprunglink(o: TheorieOptionen): HTMLElement | null {
  if (!o.bedienbar) return null;
  const a = h('a', { class: 'sprunglink', href: '#lern-inhalt', 'data-pruef': 'sprunglink' }, W.theorie.zumInhalt);
  a.addEventListener('click', (e) => {
    e.preventDefault();
    (a.closest('.lernseite')?.querySelector('.kapitel-titel') as HTMLElement | null)?.focus();
  });
  return a;
}

function fuss(o: TheorieOptionen): HTMLElement {
  return h('footer', { class: 'lern-fuss' },
    h('span', null, `${W.start.fuss} · `, h('span', { 'data-pruef': 'version' }, o.version)),
    h('span', { class: 'vermerk-hell', 'data-pruef': 'ungeprueft' }, sym('info'), W.ungeprueft));
}

function verzeichnis(o: TheorieOptionen, aktuell: number | null): HTMLElement {
  const liste = kapitelListe(o.inhalte);
  const breit = typeof matchMedia !== 'function' || matchMedia('(min-width: 1100px)').matches;
  return h('details', { class: 'kapitel-verzeichnis', open: breit },
    h('summary', { class: 't-label' }, W.theorie.kapitel),
    h('ol', { class: 'kapitel-liste' }, liste.map((k) => h('li', null, verweis(o, `#theorie/k${k.nr}`, {
      class: k.seite ? 'ist-gelesen' : 'ist-folgt',
      ...(k.nr === aktuell ? { 'aria-current': 'page' } : {}),
    }, h('b', null, String(k.nr)), h('span', null, k.titel, !k.seite ? h('small', { class: 'folgt-marke' }, ` · ${W.theorie.folgt}`) : null))))));
}

/* ------------------------------------------------------------ Kapitelliste -- */

function liste(o: TheorieOptionen): HTMLElement {
  const kap = kapitelListe(o.inhalte);
  return h('div', { class: 'lernseite', 'data-pruef': 'theorie' },
    kopfleiste(o),
    h('div', { class: 'lern-rahmen ist-einspaltig' },
      h('article', { class: 'lern-inhalt' },
        h('header', { class: 'kapitel-kopf' },
          h('span', { class: 'kapitel-nr' }, String(kap.length)),
          h('p', { class: 'kapitel-kicker' }, `${W.whitepaper} ${o.inhalte.whitepaper.fassung ?? ''}`),
          h('h1', { class: 'kapitel-titel' }, W.theorie.ueberblick),
          h('p', { class: 'kapitel-einstieg' }, W.theorie.ueberblickText)),
        h('ol', { class: 'kapitel-karten', 'data-pruef': 'kapitel-liste' }, kap.map((k) => h('li', null,
          k.seite
            ? verweis(o, `#theorie/k${k.nr}`, { class: 'kapitel-karte', 'data-pruef': `kapitel-${k.nr}` },
              h('b', { class: 'kapitel-karte-nr' }, String(k.nr)),
              h('span', { class: 'kapitel-karte-titel' }, k.titel),
              h('span', { class: 'kapitel-karte-los' }, W.theorie.lernseite, sym('pfeilRechts')))
            : h('div', { class: 'kapitel-karte ist-folgt', 'data-pruef': `kapitel-${k.nr}` },
              h('b', { class: 'kapitel-karte-nr' }, String(k.nr)),
              h('span', { class: 'kapitel-karte-titel' }, k.titel),
              h('span', { class: 'badge ist-folgt' }, W.theorie.folgt))))),
        fuss(o))));
}

/* -------------------------------------------------------------- Lernseite -- */

function zitatBlock(b: Block): HTMLElement {
  const f = inhalt(b.felder['text'] ?? '');
  for (const bq of f.querySelectorAll('blockquote')) bq.classList.add('lern-zitat');
  const quelle = kopfText(b.kopf, 'quelle');
  return h('figure', { class: 'lern-zitat-rahmen', 'data-pruef': 'zitat' }, f,
    quelle !== null ? h('figcaption', null, `${W.originalWoertlich} · ${quelle}`) : null);
}

function karten(b: Block): HTMLElement {
  return h('div', { class: 'lernkarten' }, b.kinder.filter((k) => k.art === 'karte').map((k) => {
    const titel = kopfText(k.kopf, 'titel');
    const nr = k.id !== null && /^\d+$/.test(k.id) ? k.id : null;
    return h('div', { class: 'lernkarte', 'data-pruef': 'lernkarte' },
      titel !== null ? h('span', { class: 'lernkarte-titel' }, symbolAusInhalt(kopfText(k.kopf, 'symbol')), nr !== null ? h('span', { class: 'lernkarte-zahl' }, nr) : null, titel) : null,
      h('div', { class: 'lernkarte-text' }, inhalt(k.felder['text'] ?? '')));
  }));
}

function bloeckeIn(bloecke: readonly Block[]): Node[] {
  const aus: Node[] = [];
  for (const b of bloecke) {
    switch (b.art) {
      case 'zitat':
        aus.push(zitatBlock(b));
        break;
      case 'karten':
        aus.push(karten(b));
        break;
      default:
        if (b.felder['text']) aus.push(h('div', { class: 'lesetext' }, inhalt(b.felder['text'])));
        aus.push(...bloeckeIn(b.kinder));
    }
  }
  return aus;
}

function originaltext(b: Block, fassung: string): HTMLElement {
  const f = inhalt(b.felder['text'] ?? '');
  const absaetze: HTMLElement[] = [];
  for (const el of [...f.children]) {
    // Überschrift eines Unterabschnitts (Gliederung des Whitepapers, O-20)
    if (el.tagName === 'H4') {
      absaetze.push(h('h2', { class: 'original-abschnitt', 'data-abschnitt': el.getAttribute('data-abschnitt') ?? '' }, el.textContent ?? ''));
      continue;
    }
    const id = el.getAttribute('data-absatz') ?? '';
    el.classList.remove('mvg-original');
    if (el.tagName === 'UL' || el.tagName === 'OL') el.classList.add('absatz-liste');
    if (el.tagName === 'TABLE') el.classList.add('register-tabelle');
    absaetze.push(h('div', { class: 'absatz', 'data-absatz': id },
      h('span', { class: 'absatz-id' }, id),
      el.tagName === 'P' ? h('span', null, ...el.childNodes) : h('div', { class: 'absatz-block' }, el)));
  }
  return h('section', { class: 'originaltext', 'aria-label': W.theorie.originaltext(fassung), 'data-pruef': 'originaltext' },
    h('header', { class: 'originaltext-kopf' },
      h('span', { class: 't-label' }, W.theorie.originaltext(fassung)),
      h('span', { class: 'originaltext-quelle' }, kopfText(b.kopf, 'quelle') ?? '')),
    absaetze);
}

function querverweise(o: TheorieOptionen, bloecke: readonly Block[]): HTMLElement | null {
  const qv = bloecke.filter((b) => b.art === 'querverweis');
  if (qv.length === 0) return null;
  return h('section', { class: 'querverweis-block', 'aria-label': W.theorie.inDerStory },
    h('span', { class: 't-label' }, W.theorie.inDerStory),
    h('div', { class: 'querverweise' }, qv.map((b) => {
      const st = b.id !== null ? o.inhalte.stationen[b.id] ?? null : null;
      const welt = st?.welt === 'B' ? 'b' : st?.welt === 'A' ? 'a' : null;
      return verweis(o, '#story', { class: 'querverweis', 'data-pruef': `querverweis-${b.id ?? ''}`, ...(welt !== null ? { 'data-welt': welt } : {}) },
        h('span', { class: 'querverweis-symbol' }, sym('pfeilRechts')),
        h('span', { class: 'querverweis-text' }, kopfText(b.kopf, 'text') ?? b.id ?? '', h('small', null, inhaltInline(b.felder['text'] ?? ''))));
    })));
}

function kapitelNav(o: TheorieOptionen, nr: number): HTMLElement {
  const kap = kapitelListe(o.inhalte);
  const vor = kap.find((k) => k.nr === nr - 1) ?? null;
  const nach = kap.find((k) => k.nr === nr + 1) ?? null;
  return h('nav', { class: 'kapitel-nav', 'aria-label': W.theorie.kapitel },
    vor !== null ? verweis(o, `#theorie/k${vor.nr}`, { rel: 'prev' }, h('span', { class: 't-label' }, W.theorie.zurueckKap(String(vor.nr))), h('b', null, vor.titel)) : null,
    nach !== null ? verweis(o, `#theorie/k${nach.nr}`, { rel: 'next' }, h('span', { class: 't-label' }, W.theorie.weiterKap(String(nach.nr))), h('b', null, nach.titel)) : null);
}

function lernseite(o: TheorieOptionen, nr: number): HTMLElement {
  const seite = lernseiteFuer(o.inhalte, nr);
  const gl = kapitelListe(o.inhalte).find((k) => k.nr === nr) ?? null;
  const fassung = o.inhalte.whitepaper.fassung ?? '';
  const titel = seite?.titel ?? gl?.titel ?? W.theorie.kapitelVon(String(nr));
  const kopf = h('header', { class: 'kapitel-kopf' },
    h('span', { class: 'kapitel-nr' }, String(nr)),
    h('p', { class: 'kapitel-kicker' }, `${W.theorie.kapitelVon(String(nr))} · ${W.whitepaper} ${fassung}`),
    h('h1', { class: 'kapitel-titel', tabindex: -1 }, titel),
    seite !== null && seite.einleitung !== '' ? h('div', { class: 'kapitel-einstieg' }, inhalt(seite.einleitung)) : null);

  const teile: Node[] = [kopf, h('p', null, h('span', { class: 'vermerk-hell' }, sym('info'), W.ungeprueft))];
  if (seite === null) {
    teile.push(h('div', { class: 'kernaussage ist-folgt', 'data-pruef': 'folgt' }, h('span', { class: 't-label' }, W.theorie.folgt), h('p', null, W.theorie.folgtText)),
      h('p', null, verweis(o, '#theorie', { class: 'querverweis' }, h('span', { class: 'querverweis-symbol' }, sym('pfeilLinks')), W.theorie.zurListe)));
  } else {
    const abschnittTitel = new Map((o.inhalte.whitepaper.kapitel.find((k) => Number(k.nr) === nr)?.abschnitte ?? []).map((a) => [a.id, a]));
    for (const b of seite.bloecke) {
      if (b.art === 'kernaussage') {
        teile.push(h('section', { class: 'kernaussage', 'data-pruef': 'kernaussage' }, h('span', { class: 't-label' }, W.theorie.kernaussage), inhalt(b.felder['text'] ?? '')));
      } else if (b.art === 'abschnitt') {
        const a = b.id !== null ? abschnittTitel.get(b.id) : undefined;
        const t = kopfText(b.kopf, 'titel') ?? a?.titel ?? '';
        teile.push(h('section', { class: 'lern-abschnitt', 'data-abschnitt': b.id ?? '' },
          h('h2', { class: 'abschnitt-titel' }, a !== undefined ? h('span', { class: 'abschnitt-nr' }, a.nr) : null, t),
          b.felder['text'] ? h('div', { class: 'lesetext' }, inhalt(b.felder['text'])) : null,
          bloeckeIn(b.kinder)));
      } else if (b.art === 'original') {
        teile.push(originaltext(b, fassung));
      }
    }
    const qv = querverweise(o, seite.bloecke);
    if (qv !== null) teile.push(qv);
  }
  teile.push(kapitelNav(o, nr), fuss(o));

  return h('div', { class: 'lernseite', 'data-pruef': 'theorie', 'data-kapitel': nr },
    sprunglink(o),
    kopfleiste(o),
    h('div', { class: 'lern-rahmen' },
      verzeichnis(o, nr),
      h('article', { class: 'lern-inhalt', 'data-pruef': seite !== null ? 'lernseite' : 'lernseite-folgt' }, teile)));
}

export function baueTheorie(o: TheorieOptionen): HTMLElement {
  return o.kapitel === null ? liste(o) : lernseite(o, o.kapitel);
}
