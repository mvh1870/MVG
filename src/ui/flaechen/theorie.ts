/*
 * Fläche „Theorie“ (O-20, L-4): ruhige Lernseiten ohne Leitstand-Rahmen.
 *
 *   #theorie      → Kapitelliste (13 Kapitel aus der Gliederung des Whitepapers)
 *   #theorie/kN   → Lernseite Kapitel N, sofern inhalte/theorie/ sie enthält; sonst „folgt“
 *
 * Lernseite: Kapitelkopf · Kernaussage · Abschnitte (Zitate, Karten) · Originaltext wörtlich mit
 * Absatz-IDs (O-17) · Querverweis in die Story · Kapitel blättern.
 */

import type { TitelStufe } from '../../grafik/tafel.ts';
import type { Block, Ebene, OeffentlicheInhalte, TheorieSeite, WhitepaperKapitel } from '../../inhalte/typen.ts';
import { h, ersetze } from '../h.ts';
import { bildmarke } from '../marke.ts';
import { sym, symbolAusInhalt, tafel as tafelBlock, raci as raciBlock, merksatz, hinweis } from '../bausteine/bloecke.ts';
import { inhalt, inhaltInline } from '../bausteine/inhalt.ts';
import { etappen, regler, sortieren, umschalter } from '../bausteine/lernwerkzeuge.ts';
import { abbildung } from '../bausteine/abbildung.ts';
import { kopfText, stationsName } from '../anzeige.ts';
import { W } from '../woerter.ts';
import { AENDERUNGEN } from '../impressum.ts';
import { governanceFluss, FLUSS_BESCHRIFTUNG, FLUSS_POSITIONEN } from '../../grafik/governance-fluss.ts';
import { bogenKopf, druckeBogen } from '../druck.ts';
import { IMPRESSUM } from '../route.ts';

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
      // nur die erste Ebene (6.1–6.4), nicht 6.4.1 …
      return { nr, titel: k.titel, abschnitte: k.abschnitte.filter((a) => a.nr.split('.').length === 2).length, seite: lernseiteFuer(inhalte, nr) !== null };
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
    o.bedienbar ? h('a', { class: 'lern-kopf-link lern-kopf-leise', href: '#hilfe', 'data-pruef': 'zur-hilfe' }, W.hilfe.link) : null,
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
    verweis(o, '#explore', { class: 'lern-kopf-link', 'data-pruef': 'zu-explore' }, sym('pfeilRechts'), W.explore.selbstAusprobieren),
    h('span', null, `${W.start.fuss} · `, h('span', { 'data-pruef': 'version' }, o.version)),
    verweis(o, `#theorie/${IMPRESSUM}`, { class: 'lern-fuss-link', 'data-pruef': 'zum-impressum' }, W.theorie.impressumLink),
    h('span', { class: 'vermerk-hell', 'data-pruef': 'ungeprueft' }, sym('info'), W.ungeprueft));
}

function verzeichnis(o: TheorieOptionen, aktuell: number | null): HTMLElement {
  const liste = kapitelListe(o.inhalte);
  const breit = typeof matchMedia !== 'function' || matchMedia('(min-width: 1100px)').matches;
  // eigene Navigation-Landmarke (R21); display: contents lässt das Raster der Lernseite unberührt
  return h('nav', { class: 'kapitel-verzeichnis-nav', 'aria-label': W.theorie.verzeichnisNav }, h('details', { class: 'kapitel-verzeichnis', open: breit },
    h('summary', { class: 't-label' }, W.theorie.kapitel),
    h('ol', { class: 'kapitel-liste' }, liste.map((k) => h('li', null, verweis(o, `#theorie/k${k.nr}`, {
      class: k.seite ? 'ist-gelesen' : 'ist-folgt',
      ...(k.nr === aktuell ? { 'aria-current': 'page' } : {}),
    }, h('b', null, String(k.nr)), h('span', null, k.titel, !k.seite ? h('small', { class: 'folgt-marke' }, ` · ${W.theorie.folgt}`) : null)))))));
}

/* ------------------------------------------------------------ Kapitelliste -- */

function liste(o: TheorieOptionen): HTMLElement {
  const kap = kapitelListe(o.inhalte);
  return h('div', { class: 'lernseite', 'data-pruef': 'theorie' },
    kopfleiste(o),
    h('div', { class: 'lern-rahmen ist-einspaltig' },
      // main nur bedienbar: Leinwand und Regie-Vorschau betten die Seite ein und haben keine eigene main (R21)
      h(o.bedienbar ? 'main' : 'article', { class: 'lern-inhalt', id: 'lern-inhalt' },
        h('header', { class: 'kapitel-kopf' },
          h('span', { class: 'kapitel-nr' }, String(kap.length)),
          h('p', { class: 'kapitel-kicker' }, `${W.whitepaper} ${o.inhalte.whitepaper.fassung ?? ''}`),
          h('h1', { class: 'kapitel-titel', tabindex: -1 }, W.theorie.ueberblick),
          h('p', { class: 'kapitel-einstieg' }, W.theorie.ueberblickText),
          o.bedienbar ? h('p', null, h('button', { type: 'button', class: 'knopf knopf-still druck-knopf', 'data-pruef': 'alles-drucken', onclick: () => {
            druckeBogen(W.druck.allesTitel, [bogenKopf(W.druck.allesTitel, o.version, false), ...kap.filter((k) => k.seite).map((k) => kapitelFuerDruck(o.inhalte, k.nr, o.version))]);
          } }, sym('dokument'), W.druck.allesDrucken)) : null),
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
        impressum(o),
        fuss(o))));
}

/**
 * Impressum (P10.1): Herausgeber, Fassung mit Änderungsstand, Quelle, fiktiver Fall, Vermerk; die
 * Abgrenzung (5.5) und die Leistungsgrenzen (7.6) stehen wörtlich im Originaltext – hier verlinkt.
 */
function impressum(o: TheorieOptionen): HTMLElement {
  const T = W.theorie;
  const fassung = o.inhalte.whitepaper.fassung ?? '';
  const abschnitt = (nr: string): { kapitel: number; nr: string; titel: string } | null => {
    const k = o.inhalte.whitepaper.kapitel.find((x) => x.nr === nr.split('.')[0]);
    const a = k?.abschnitte.find((x) => x.nr === nr);
    return k !== undefined && a !== undefined ? { kapitel: Number(k.nr), nr, titel: a.titel } : null;
  };
  const grenzen = ['5.5', '7.6'].map(abschnitt).filter((a) => a !== null);
  const zeile = (titel: string, ...inhalt: (Node | string | null)[]): HTMLElement[] => [h('dt', null, titel), h('dd', null, inhalt)];
  return h('section', { class: 'impressum', 'data-abschnitt': IMPRESSUM, 'data-pruef': 'impressum', 'aria-labelledby': 'impressum-titel' },
    h('h2', { class: 'abschnitt-titel', id: 'impressum-titel' }, T.impressum),
    h('dl', { class: 'impressum-liste' },
      zeile(T.impressumAbsender, W.absender),
      zeile(T.impressumFassung, h('span', { 'data-pruef': 'impressum-version' }, o.version)),
      zeile(T.impressumQuelle, T.impressumQuelleText(o.inhalte.whitepaper.titel ?? 'Minimum Viable Governance', fassung)),
      zeile(T.impressumFall, T.impressumFallText),
      zeile(T.impressumStatus, h('span', { class: 'vermerk-hell' }, sym('info'), W.ungeprueft), ' ', T.impressumStatusText),
      zeile(T.impressumFussnoten, T.impressumFussnotenText),
      zeile(T.impressumGrenzen, h('span', { class: 'impressum-grenzen' }, grenzen.map((a) =>
        verweis(o, `#theorie/k${a.kapitel}/${a.nr}`, { class: 'glossar-ort', 'data-pruef': `impressum-grenze-${a.nr}` }, `${a.nr} ${a.titel}`))))),
    // Quellenverzeichnis der Story (P10.1): je Station die Absätze des Whitepapers, auf die sie sich stützt
    h('details', { class: 'impressum-quellen', 'data-pruef': 'quellenverzeichnis' },
      h('summary', { class: 't-label' }, T.quellenverzeichnis),
      h('p', { class: 'impressum-quellen-text' }, T.quellenverzeichnisText),
      h('ul', null, o.inhalte.stationsFolge.map((id) => {
        const ids = o.inhalte.stationen[id]?.whitepaper ?? [];
        if (ids.length === 0) return null;
        return h('li', null, h('b', null, stationsName(o.inhalte, id)), ' ',
          ids.map((a) => {
            const kap = /^k(\d{1,2})/u.exec(a)?.[1] ?? '';
            return verweis(o, `#theorie/k${kap}/${a}`, { class: 'absatz-id' }, a);
          }));
      }))),
    h('h3', { class: 't-label' }, T.impressumAenderungen),
    h('ol', { class: 'impressum-aenderungen', reversed: true }, AENDERUNGEN.map((a) => h('li', null,
      h('b', null, `${W.story} ${a.fassung}`), h('span', { class: 'mono' }, ` · ${a.datum} · `), a.text))));
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

/**
 * Wissenscheck (P11.6, Owner-Punkt „Wissenschecks ohne Schulungscharakter“): eine Frage, zwei bis drei
 * Antworten; die Wahl zeigt eine kurze Rückmeldung und die Erklärung mit wortgleichem Beleg – keine
 * Punkte, kein Richtig/Falsch-Zähler. Die Wahl bleibt örtlich (kein Engine-Zustand).
 */
function wissenscheck(b: Block): HTMLElement {
  const antworten = b.kinder.filter((k) => k.art === 'antwort');
  const belege = b.kinder.filter((k) => k.art === 'zitat' || k.art === 'original');
  const ergebnis = h('div', { class: 'wc-ergebnis', 'aria-live': 'polite', 'data-pruef': 'wc-ergebnis' });
  const knoepfe = antworten.map((a) => h('button', {
    type: 'button', class: 'knopf knopf-still wc-antwort', 'aria-pressed': 'false', 'data-pruef': `wc-antwort-${a.id ?? ''}`,
    onclick: () => {
      for (const k of knoepfe) k.setAttribute('aria-pressed', k === knopf(a) ? 'true' : 'false');
      const praefix = kopfText(a.kopf, 'praefix');
      ersetze(ergebnis,
        h('div', { class: 'wc-rueckmeldung' }, praefix !== null ? h('b', null, `${praefix} `) : null, inhalt(a.felder['text'] ?? '')),
        h('div', { class: 'wc-erklaerung' }, inhalt(b.felder['erklaerung'] ?? '')),
        belege.map((z) => zitatBlock(z)));
    },
  }, kopfText(a.kopf, 'titel') ?? a.id ?? ''));
  const knopf = (a: Block): HTMLElement | undefined => knoepfe[antworten.indexOf(a)];
  return h('section', { class: 'wissenscheck', 'data-pruef': 'wissenscheck', 'aria-label': W.theorie.wissenscheck },
    h('span', { class: 't-label' }, W.theorie.wissenscheck),
    h('div', { class: 'wc-frage' }, inhalt(b.felder['frage'] ?? '')),
    h('div', { class: 'wc-antworten reihe', role: 'group', 'aria-label': W.theorie.wissenscheckAntworten }, knoepfe),
    ergebnis);
}

/** Ebenen 1–4 auf einer Lernseite (P6.1): aufklappbar, Ebene 1 offen; Ebene 4 trägt den Nachweis (Zitat). */
function ebenenBlock(ebenen: readonly Ebene[], inhalte: OeffentlicheInhalte, stufe: TitelStufe): HTMLElement {
  return h('div', { class: 'lern-ebenen', 'data-pruef': 'lern-ebenen' }, ebenen.map((e) => h('details', { class: 'lern-ebene', 'data-ebene': e.nr, 'data-pruef': `lern-ebene-${e.nr}`, open: e.nr === 1 },
    h('summary', null, h('span', { class: 'lern-ebene-nr' }, String(e.nr)), h('span', null, h('small', null, `${W.ebene} ${e.nr}`), e.titel)),
    e.felder['text'] ? h('div', { class: 'lesetext' }, inhalt(e.felder['text'])) : null,
    bloeckeIn(e.bloecke, inhalte, stufe))));
}

/**
 * Permalink eines Absatzes (P10.1): `k4-t1` → `#theorie/k4/k4-t1`. Kap. 13 hat keinen Originaltext (Glossar,
 * L-47): dort gäbe es kein Sprungziel – der Beleg bleibt Text (P12.5 R11).
 */
function belegLink(id: string): string | null {
  const kapitel = /^k(\d{1,2})/u.exec(id)?.[1] ?? '';
  return kapitel === '13' ? null : `#theorie/k${kapitel}/${id}`;
}

/** Blöcke einer Lernseite; `stufe` = Überschriftenstufe für Tafeltitel (h2 auf Seitenebene, h3 in Abschnitten). */
function bloeckeIn(bloecke: readonly Block[], inhalte: OeffentlicheInhalte, stufe: TitelStufe = 'h3'): Node[] {
  const aus: Node[] = [];
  for (const b of bloecke) {
    switch (b.art) {
      case 'zitat':
      case 'original':
        aus.push(zitatBlock(b));
        break;
      case 'karten':
        aus.push(karten(b));
        break;
      case 'etappen':
        aus.push(etappen(b, stufe, lwBedienbar));
        break;
      case 'umschalter':
        aus.push(umschalter(b, stufe, lwBedienbar));
        break;
      case 'sortieren':
        aus.push(sortieren(b, stufe, lwBedienbar));
        break;
      case 'regler':
        aus.push(regler(b, stufe, lwBedienbar));
        break;
      case 'tafel': {
        const t = tafelBlock(b, [], inhalte, stufe);
        if (t !== null) aus.push(t);
        break;
      }
      case 'raci': {
        const r = raciBlock(b, inhalte, null, stufe);
        if (r !== null) aus.push(r);
        break;
      }
      case 'merksatz':
        aus.push(merksatz(b));
        break;
      case 'wissenscheck':
        aus.push(wissenscheck(b));
        break;
      case 'governancefluss': {
        // derselbe Baustein wie in der Story (B3), hier als Übersicht ohne „Sie sind hier“
        const g = governanceFluss({ position: 'managementbericht', marken: {}, hier: '' });
        g.setze();
        // Übersicht: alle Stationen gleich (keine „aktuelle“ Station, kein Puls)
        g.element.classList.add('ist-uebersicht');
        g.element.classList.remove('ist-lebendig');
        for (const li of g.element.querySelectorAll('.ist-hier')) { li.classList.remove('ist-hier'); li.classList.add('ist-passiert'); }
        g.element.setAttribute('aria-label', W.theorie.flussUebersicht(FLUSS_POSITIONEN.map((p) => FLUSS_BESCHRIFTUNG[p].replace('\u00ad', '')).join(' → ')));
        aus.push(h('figure', { class: 'lern-fluss' }, g.element, b.felder['text'] ? h('figcaption', null, inhalt(b.felder['text'])) : null));
        break;
      }
      case 'hinweis':
        aus.push(hinweis(b));
        break;
      case 'abbildung': {
        const a = inhalte.whitepaper.abbildungen.find((x) => x.id === b.id);
        const f = a !== undefined ? abbildung(a, { bedienbar: lwBedienbar, belegLink }) : null;
        if (f !== null) aus.push(f);
        break;
      }
      case 'ebenen':
        if (b.ebenen !== undefined && b.ebenen.length > 0) aus.push(ebenenBlock(b.ebenen, inhalte, 'h3'));
        break;
      default:
        if (b.felder['text']) aus.push(h('div', { class: 'lesetext' }, inhalt(b.felder['text'])));
        aus.push(...bloeckeIn(b.kinder, inhalte, stufe));
    }
  }
  return aus;
}

/** Zitierangabe „Bauherr Mentoren, Whitepaper V1.2, Kap. 4.2, Abs. 3“ aus der Absatz-ID (P10.1). */
export function zitierAngabe(id: string, fassung: string): string | null {
  const m = /^k(\d{1,2}(?:\.\d{1,2}){0,3})-([pltb])(\d{1,3})$/u.exec(id);
  return m === null ? null : W.theorie.zitierAngabe(W.absender, fassung, W.theorie.stelle(m[1] ?? '', m[2] ?? '', m[3] ?? ''));
}

/**
 * „Zitieren“ an einem Absatz: Zitierangabe mit Permalink zeigen und in die Zwischenablage legen;
 * ohne Zwischenablage (file://, verweigert) bleibt die Angabe markiert zum Kopieren stehen.
 */
function zitierKnopf(id: string, kapitel: number, fassung: string, absatz: () => HTMLElement): HTMLElement {
  const angabe = zitierAngabe(id, fassung) ?? id;
  const knopf = h('button', { type: 'button', class: 'absatz-zitieren', 'aria-label': W.theorie.zitierenAbsatz(id), 'aria-expanded': 'false', 'data-pruef': 'zitieren' }, sym('dokument'), h('span', null, W.theorie.zitieren));
  knopf.addEventListener('click', () => {
    const el = absatz();
    const offen = el.querySelector('.zitierangabe');
    if (offen !== null) {
      offen.remove();
      knopf.setAttribute('aria-expanded', 'false');
      knopf.removeAttribute('aria-controls');
      return;
    }
    const basis = typeof location === 'object' ? `${location.href.split('#')[0] ?? ''}` : '';
    const link = `${basis}#theorie/k${kapitel}/${id}`;
    const text = h('span', { class: 'zitierangabe-text', 'data-pruef': 'zitierangabe' }, `${angabe}. ${W.theorie.zitatLink}: ${link}`);
    const status = h('span', { class: 'zitierangabe-status', role: 'status' });
    const angabeId = `zitat-${id}`;
    el.append(h('p', { class: 'zitierangabe', id: angabeId }, text, status));
    knopf.setAttribute('aria-expanded', 'true');
    knopf.setAttribute('aria-controls', angabeId);
    // Statustext erst im nächsten Takt: eine eben eingefügte Live-Region liest sonst niemand vor
    const melde = (t: string): void => { setTimeout(() => { status.textContent = t; }, 50); };
    const markiere = (): void => {
      const sel = typeof getSelection === 'function' ? getSelection() : null;
      if (sel !== null) sel.selectAllChildren(text);
      melde(W.theorie.zitatMarkieren);
    };
    const ablage = typeof navigator === 'object' ? navigator.clipboard : undefined;
    if (ablage === undefined) markiere();
    else ablage.writeText(text.textContent ?? '').then(() => melde(W.theorie.zitatKopiert), markiere);
  });
  return knopf;
}

function originaltext(b: Block, fassung: string, kapitel: number, bedienbar: boolean, inhalte: OeffentlicheInhalte): HTMLElement {
  const f = inhalt(b.felder['text'] ?? '');
  const absaetze: HTMLElement[] = [];
  for (const el of [...f.children]) {
    // Abbildung an ihrer Stelle in der DOCX (P14, O-32)
    if (el.tagName === 'FIGURE') {
      const a = inhalte.whitepaper.abbildungen.find((x) => x.id === el.getAttribute('data-abbildung'));
      const fig = a !== undefined ? abbildung(a, { bedienbar, belegLink }) : null;
      if (fig !== null) absaetze.push(h('div', { class: 'original-abbildung' }, fig));
      continue;
    }
    // Überschrift eines Unterabschnitts (Gliederung des Whitepapers, O-20)
    if (el.tagName === 'H4') {
      absaetze.push(h('h2', { class: 'original-abschnitt', 'data-abschnitt': el.getAttribute('data-abschnitt') ?? '' }, el.textContent ?? ''));
      continue;
    }
    const id = el.getAttribute('data-absatz') ?? '';
    el.classList.remove('mvg-original');
    if (el.tagName === 'UL' || el.tagName === 'OL') el.classList.add('absatz-liste');
    if (el.tagName === 'TABLE') el.classList.add('register-tabelle');
    // Absatz-ID als Permalink (P10.1); „Zitieren“ nur, wenn bedienbar (nicht auf der Leinwand)
    const kopf = bedienbar && id !== ''
      ? h('span', { class: 'absatz-kopf' },
        h('a', { class: 'absatz-id', href: `#theorie/k${kapitel}/${id}`, 'aria-label': W.theorie.permalinkAbsatz(id) }, id),
        zitierKnopf(id, kapitel, fassung, () => zeile))
      : h('span', { class: 'absatz-id' }, id);
    const zeile: HTMLElement = h('div', { class: 'absatz', 'data-absatz': id },
      kopf,
      el.tagName === 'P' ? h('span', null, ...el.childNodes)
        // breite Tabellen scrollen waagrecht: der Bereich muss per Tastatur erreichbar sein (WCAG 2.1.1)
        : el.tagName === 'TABLE' ? h('div', { class: 'absatz-block', tabindex: 0, role: 'region', 'aria-label': W.theorie.tabelle(id) }, el)
        : h('div', { class: 'absatz-block' }, el));
    absaetze.push(zeile);
  }
  // am Seitenende, immer zugeklappt (O-30): „braucht man in den seltensten Fällen“; ein Absatz-Permalink klappt auf
  return h('details', { class: 'originaltext', 'data-pruef': 'originaltext' },
    h('summary', { class: 'originaltext-kopf', 'data-pruef': 'originaltext-auf' },
      h('span', { class: 't-label' }, W.theorie.originaltext(fassung)),
      h('span', { class: 'originaltext-quelle' }, kopfText(b.kopf, 'quelle') ?? ''),
      h('span', { class: 'originaltext-hinweis' }, W.theorie.originaltextAufklappen)),
    absaetze);
}

function querverweise(o: TheorieOptionen, bloecke: readonly Block[]): HTMLElement | null {
  const qv = bloecke.filter((b) => b.art === 'querverweis');
  if (qv.length === 0) return null;
  return h('section', { class: 'querverweis-block', 'aria-label': W.theorie.inDerStory },
    h('span', { class: 't-label' }, W.theorie.inDerStory, h('span', { class: 'querverweis-fiktiv' }, ` · ${W.fiktiv}`)),
    h('div', { class: 'querverweise' }, qv.map((b) => {
      const st = b.id !== null ? o.inhalte.stationen[b.id] ?? null : null;
      const welt = st?.welt === 'B' ? 'b' : st?.welt === 'A' ? 'a' : null;
      return verweis(o, `#story/${b.id ?? ''}`, { class: 'querverweis', 'data-pruef': `querverweis-${b.id ?? ''}`, ...(welt !== null ? { 'data-welt': welt } : {}) },
        h('span', { class: 'querverweis-symbol' }, sym('pfeilRechts')),
        h('span', { class: 'querverweis-text' }, kopfText(b.kopf, 'text') ?? b.id ?? '', h('small', null, inhaltInline(b.felder['text'] ?? ''))));
    })));
}


/**
 * Glossar (P6.14): alle Begriffe des Whitepapers wortgleich, alphabetisch, mit Suchfeld und
 * „Kommt vor in“ (Stationen und Kapitel mit Glossarbezug, vom Compiler gesammelt).
 */
function glossarListe(o: TheorieOptionen): HTMLElement {
  const eintraege = Object.values(o.inhalte.glossar).sort((a, b) => a.begriff.localeCompare(b.begriff, 'de'));
  const gesamt = eintraege.length;
  const zahl = h('p', { class: 'glossar-zahl', role: 'status', 'aria-live': 'polite', 'data-pruef': 'glossar-zahl' }, W.theorie.glossarZahl(gesamt, gesamt));
  const leer = h('p', { class: 'glossar-leer', hidden: true }, W.theorie.glossarLeer);
  const zeilen = eintraege.map((g) => {
    const orte: HTMLElement[] = [
      ...g.vorkommen.stationen.map((id) => {
        const welt = o.inhalte.stationen[id]?.welt;
        return verweis(o, `#story/${id}`, { class: 'glossar-ort', ...(welt === 'A' || welt === 'B' ? { 'data-welt': welt.toLowerCase() } : {}) }, stationsName(o.inhalte, id));
      }),
      ...g.vorkommen.kapitel.map((k) => verweis(o, `#theorie/k${k}`, { class: 'glossar-ort' }, W.theorie.kapitelKurz(String(k)))),
    ];
    return h('div', { class: 'glossar-eintrag', id: g.id, 'data-pruef': 'glossar-eintrag', 'data-suche': `${g.begriff} ${g.definition}`.toLocaleLowerCase('de') },
      h('dt', null, g.begriff),
      h('dd', null, h('p', null, g.definition),
        orte.length > 0 ? h('p', { class: 'glossar-orte' }, h('span', { class: 't-label' }, W.theorie.kommtVor), ...orte) : null));
  });
  const feld = h('input', { type: 'search', class: 'glossar-feld', id: 'glossar-suche', 'data-pruef': 'glossar-suche', autocomplete: 'off', spellcheck: 'false' }) as HTMLInputElement;
  // Begriffs-Kompass (P10.5, E7): andere Wörter → Begriff des Whitepapers; dieselbe Suche filtert mit
  const kompassZeilen = o.inhalte.kompass.map((k) => {
    const kap = /^k(\d{1,2})/u.exec(k.beleg)?.[1] ?? '';
    return h('tr', { 'data-pruef': 'kompass-eintrag', 'data-suche': `${k.begriff} ${k.andere.join(' ')}`.toLocaleLowerCase('de') },
      h('td', null, k.andere.join(' · ')),
      // Der Anker gehört dem Router: der Begriff springt selbst zum Glossareintrag
      h('td', null, o.bedienbar && k.glossar !== null
        ? h('button', { type: 'button', class: 'kompass-begriff', 'data-glossar-ziel': k.glossar, onclick: () => {
          const ziel = document.getElementById(k.glossar ?? '');
          if (ziel === null) return;
          // Suche zurücksetzen, damit Zähler und Liste zum gezeigten Eintrag passen
          if (feld.value !== '') {
            feld.value = '';
            feld.dispatchEvent(new Event('input'));
          }
          ziel.tabIndex = -1;
          if (typeof ziel.scrollIntoView === 'function') ziel.scrollIntoView({ block: 'center' });
          ziel.focus({ preventScroll: true });
        } }, k.begriff)
        : h('b', null, k.begriff),
        k.hinweis !== null ? h('div', { class: 'kompass-hinweis' }, inhalt(k.hinweis)) : null),
      h('td', null, verweis(o, `#theorie/k${kap}/${k.beleg}`, { class: 'absatz-id' }, k.beleg)));
  });
  const kompass = kompassZeilen.length === 0 ? null : h('section', { class: 'kompass', 'data-pruef': 'kompass', 'aria-labelledby': 'kompass-titel' },
    h('h2', { class: 'abschnitt-titel', id: 'kompass-titel' }, W.theorie.kompass),
    h('p', { class: 'lesetext' }, W.theorie.kompassText),
    h('div', { class: 'absatz-block', tabindex: 0, role: 'region', 'aria-label': W.theorie.tabelle('Begriffs-Kompass') },
      h('table', { class: 'register-tabelle kompass-tabelle' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, W.theorie.kompassAndere), h('th', { scope: 'col' }, W.theorie.kompassBegriff), h('th', { scope: 'col' }, W.theorie.kompassBeleg))),
        h('tbody', null, kompassZeilen))));
  feld.addEventListener('input', () => {
    const q = feld.value.trim().toLocaleLowerCase('de');
    let sichtbar = 0;
    for (const z of zeilen) {
      const treffer = q === '' || (z.getAttribute('data-suche') ?? '').includes(q);
      z.hidden = !treffer;
      if (treffer) sichtbar++;
    }
    for (const z of kompassZeilen) z.hidden = !(q === '' || (z.getAttribute('data-suche') ?? '').includes(q));
    zahl.textContent = W.theorie.glossarZahl(sichtbar, gesamt);
    leer.hidden = sichtbar > 0 || kompassZeilen.some((z) => !z.hidden);
  });
  return h('section', { class: 'glossar', 'aria-label': W.theorie.glossar, 'data-pruef': 'glossar' },
    o.bedienbar ? h('div', { class: 'glossar-suche' }, h('label', { for: 'glossar-suche', class: 't-label' }, W.theorie.glossarSuche), feld, zahl) : null,
    h('dl', { class: 'glossar-eintraege' }, zeilen), leer,
    h('p', { class: 'glossar-quelle' }, W.glossarQuelle(o.inhalte.whitepaper.fassung ?? '')),
    kompass);
}

function kapitelNav(o: TheorieOptionen, nr: number): HTMLElement {
  const kap = kapitelListe(o.inhalte);
  const vor = kap.find((k) => k.nr === nr - 1) ?? null;
  const nach = kap.find((k) => k.nr === nr + 1) ?? null;
  return h('nav', { class: 'kapitel-nav', 'aria-label': W.theorie.kapitel },
    vor !== null ? verweis(o, `#theorie/k${vor.nr}`, { rel: 'prev' }, h('span', { class: 't-label' }, W.theorie.zurueckKap(String(vor.nr))), h('b', null, vor.titel)) : null,
    nach !== null ? verweis(o, `#theorie/k${nach.nr}`, { rel: 'next' }, h('span', { class: 't-label' }, W.theorie.weiterKap(String(nach.nr))), h('b', null, nach.titel)) : null);
}

/** Lernwerkzeuge bedienbar (Hauptfenster) oder aufgelöst (Leinwand, Druck); gesetzt beim Bau einer Lernseite. */
let lwBedienbar = true;

function lernseite(o: TheorieOptionen, nr: number): HTMLElement {
  lwBedienbar = o.bedienbar;
  const seite = lernseiteFuer(o.inhalte, nr);
  const gl = kapitelListe(o.inhalte).find((k) => k.nr === nr) ?? null;
  const fassung = o.inhalte.whitepaper.fassung ?? '';
  const titel = seite?.titel ?? gl?.titel ?? W.theorie.kapitelVon(String(nr));
  const kopf = h('header', { class: 'kapitel-kopf' },
    h('span', { class: 'kapitel-nr' }, String(nr)),
    h('p', { class: 'kapitel-kicker' }, `${W.theorie.kapitelVon(String(nr))} · ${W.whitepaper} ${fassung}`),
    h('h1', { class: 'kapitel-titel', tabindex: -1 }, titel),
    seite !== null && seite.einleitung !== '' ? h('div', { class: 'kapitel-einstieg' }, inhalt(seite.einleitung)) : null);

  const drucken = o.bedienbar && seite !== null
    ? h('button', { type: 'button', class: 'knopf knopf-still druck-knopf', 'data-pruef': 'kapitel-drucken', onclick: () => {
      druckeBogen(W.druck.kapitelTitel(nr, titel), [bogenKopf(W.druck.kapitelTitel(nr, titel), o.version, false), kapitelFuerDruck(o.inhalte, nr, o.version)]);
    } }, sym('dokument'), W.druck.kapitelDrucken)
    : null;
  /** Originaltext: ans Seitenende (O-30) */
  const unten: HTMLElement[] = [];
  const teile: Node[] = [kopf, h('p', { class: 'kapitel-vermerk' }, h('span', { class: 'vermerk-hell' }, sym('info'), W.ungeprueft), drucken)];
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
          bloeckeIn(b.kinder, o.inhalte)));
      } else if (b.art === 'original') {
        unten.push(originaltext(b, fassung, nr, o.bedienbar, o.inhalte));
      } else if (b.art === 'glossar') {
        teile.push(glossarListe(o));
      } else if (b.art !== 'querverweis') {
        // Grafik, Ebenen, Merksatz … auch auf Seitenebene (P6.1)
        teile.push(...bloeckeIn([b], o.inhalte, 'h2'));
      }
    }
    const qv = querverweise(o, seite.bloecke);
    if (qv !== null) teile.push(qv);
    teile.push(...unten);
  }
  teile.push(kapitelNav(o, nr), fuss(o));

  return h('div', { class: 'lernseite', 'data-pruef': 'theorie', 'data-kapitel': nr },
    sprunglink(o),
    kopfleiste(o),
    h('div', { class: 'lern-rahmen' },
      verzeichnis(o, nr),
      h(o.bedienbar ? 'main' : 'article', { class: 'lern-inhalt', id: 'lern-inhalt', 'data-pruef': seite !== null ? 'lernseite' : 'lernseite-folgt' }, teile)));
}

/**
 * Lernseite eines Kapitels für den Druckbogen (P10.2): dieselbe Zeichnung wie die Leinwand (nicht
 * bedienbar), ohne Kopfleiste, Kapitelverzeichnis und Blättern.
 */
export function kapitelFuerDruck(inhalte: OeffentlicheInhalte, nr: number, version: string): HTMLElement {
  const seite = baueTheorie({ inhalte, kapitel: nr, version, bedienbar: false });
  for (const weg of seite.querySelectorAll('.lern-kopf, .kapitel-verzeichnis-nav, .kapitel-verzeichnis, .kapitel-nav, .sprunglink, .lern-fuss')) weg.remove();
  // im Druck mit dem Originaltext (aufgeklappt)
  for (const d of seite.querySelectorAll<HTMLDetailsElement>('details.originaltext, details.abbildung-abweichungen')) d.open = true;
  seite.classList.add('druck-kapitel');
  return seite;
}

/** Kapitelverzeichnis (klebend, rollt in sich): den aktuellen Eintrag sichtbar machen, ohne die Seite zu rollen */
export function zeigeAktuellenEintrag(seite: HTMLElement): void {
  requestAnimationFrame(() => {
    const v = seite.querySelector<HTMLElement>('.kapitel-verzeichnis');
    const a = v?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!v || !a || v.scrollHeight <= v.clientHeight + 1) return;
    // Regie-Vorschau: die Bühne ist per transform skaliert – Abstände aus dem Rechteck zurückrechnen
    const vr = v.getBoundingClientRect();
    const massstab = v.offsetHeight > 0 ? vr.height / v.offsetHeight : 1;
    const oben = (a.getBoundingClientRect().top - vr.top) / (massstab || 1) + v.scrollTop;
    v.scrollTop = Math.max(0, oben - v.clientHeight / 2);
  });
}

export function baueTheorie(o: TheorieOptionen): HTMLElement {
  return o.kapitel === null ? liste(o) : lernseite(o, o.kapitel);
}
