/*
 * Bereich „Theorie“ (P16.3, O-38): Minimum Viable Governance in Themen – ohne Kapitel, Nummern,
 * Originaltext oder Zitierangaben. Die Inhalte bleiben; nur der Bezug auf eine Vorlage ist weg.
 *
 *   #theorie            → Übersicht der Themen
 *   #theorie/<thema>    → ein Thema (Kopf, Kernaussage, Abschnitte, Grafiken, „In der Story erlebt“)
 *
 * Hintergrund: heller Grundriss mit Achsraster, sehr dezent (O-45). Am Ende jedes Themas leise der
 * Kontakt über bauherr-mentoren.com (O-44).
 */

import { tafelnAufgeloest, type TitelStufe } from '../../grafik/tafel.ts';
import { grundriss } from '../../grafik/bauplan.ts';
import type { Block, Ebene, OeffentlicheInhalte, TheorieSeite } from '../../inhalte/typen.ts';
import { h, ersetze, laengstesWort, mitTrennstellen, umbruchNachSchraegstrich, vonHtml } from '../h.ts';
import { sym, symbolAusInhalt, tafel as tafelBlock, merksatz, hinweis } from '../bausteine/bloecke.ts';
import { inhalt } from '../bausteine/inhalt.ts';
import { etappen, regler, sortieren, umschalter } from '../bausteine/lernwerkzeuge.ts';
import { abbildung } from '../bausteine/abbildung.ts';
import { bmLink, seitenRahmen } from '../bausteine/seite.ts';
import { kopfText } from '../anzeige.ts';
import { W } from '../woerter.ts';
import { bogenFuerStrgP, bogenKopf, druckeBogen } from '../druck.ts';

const T = W.themen;

export interface TheorieOptionen {
  inhalte: OeffentlicheInhalte;
  /** null = Übersicht */
  thema: string | null;
  version: string;
  /** false = nur Anzeige (Leinwand, Druck) */
  bedienbar: boolean;
}

/** Alle Themen in ihrer Reihenfolge. */
export function themen(inhalte: OeffentlicheInhalte): TheorieSeite[] {
  return Object.values(inhalte.theorie).sort((a, b) => a.reihe - b.reihe);
}

export function themaSeite(inhalte: OeffentlicheInhalte, thema: string): TheorieSeite | null {
  return Object.values(inhalte.theorie).find((t) => t.thema === thema.toLowerCase()) ?? null;
}

/** Titel eines Themas (für Links aus Story und Explore); null, wenn es das Thema nicht gibt. */
export function themaTitel(inhalte: OeffentlicheInhalte, thema: string): string | null {
  return themaSeite(inhalte, thema)?.titel ?? null;
}

function verweis(o: TheorieOptionen, href: string, attrs: Record<string, string>, ...kinder: (Node | string | null)[]): HTMLElement {
  return o.bedienbar ? h('a', { ...attrs, href }, kinder) : h('span', attrs, kinder);
}

function rahmen(o: TheorieOptionen, inhaltKnoten: Node[]): HTMLElement {
  return seitenRahmen({
    bereich: 'theorie',
    klasse: 'seite-theorie',
    bedienbar: o.bedienbar,
    hintergrund: h('div', { class: 'lern-hintergrund', 'aria-hidden': 'true' }, vonHtml(grundriss())),
    inhalt: inhaltKnoten,
  });
}

function verzeichnis(o: TheorieOptionen, aktuell: string | null): HTMLElement {
  const breit = typeof matchMedia !== 'function' || matchMedia('(min-width: 1100px)').matches;
  return h('nav', { class: 'kapitel-verzeichnis-nav', 'aria-label': T.verzeichnis }, h('details', { class: 'kapitel-verzeichnis', open: breit },
    h('summary', { class: 't-label' }, T.verzeichnis),
    h('ol', { class: 'kapitel-liste themen-liste' }, themen(o.inhalte).map((t) => h('li', null, verweis(o, `#theorie/${t.thema}`, {
      'data-pruef': `verzeichnis-${t.thema}`,
      ...(t.thema === aktuell ? { 'aria-current': 'page' } : {}),
    }, h('span', null, t.kurztitel)))))));
}

/* ------------------------------------------------------------- Übersicht -- */

function uebersicht(o: TheorieOptionen, unbekannt: boolean): HTMLElement {
  return rahmen(o, [h('div', { class: 'lern-rahmen ist-einspaltig' },
    h(o.bedienbar ? 'div' : 'article', { class: 'lern-inhalt', 'data-pruef': 'theorie' },
      h('header', { class: 'kapitel-kopf' },
        h('p', { class: 'kapitel-kicker' }, T.bereich),
        h('h1', { class: 'kapitel-titel', tabindex: -1 }, T.titel),
        h('p', { class: 'kapitel-einstieg' }, unbekannt ? T.unbekannt : T.einleitung)),
      h('ol', { class: 'kapitel-karten', 'data-pruef': 'themen-liste' }, themen(o.inhalte).map((t) => h('li', null,
        verweis(o, `#theorie/${t.thema}`, { class: 'kapitel-karte', 'data-pruef': `thema-${t.thema}` },
          h('span', { class: 'kapitel-karte-titel' }, t.titel),
          h('span', { class: 'kapitel-karte-los' }, T.lesen, sym('pfeilRechts')))))),
      kontaktZeile(o)))]);
}

/* ---------------------------------------------------------------- Thema -- */

function zitatBlock(b: Block): HTMLElement {
  const f = inhalt(b.felder['text'] ?? '');
  for (const bq of f.querySelectorAll('blockquote')) bq.classList.add('lern-zitat');
  return h('figure', { class: 'lern-zitat-rahmen', 'data-pruef': 'zitat' }, f);
}

function karten(b: Block): HTMLElement {
  return h('div', { class: 'lernkarten' }, b.kinder.filter((k) => k.art === 'karte').map((k) => {
    const titel = kopfText(k.kopf, 'titel');
    const nr = k.id !== null && /^\d+$/.test(k.id) ? k.id : null;
    return h('div', { class: 'lernkarte', 'data-pruef': 'lernkarte' },
      titel !== null ? h('span', { class: 'lernkarte-titel' }, symbolAusInhalt(kopfText(k.kopf, 'symbol')), nr !== null ? h('span', { class: 'lernkarte-zahl' }, nr) : null, mitTrennstellen(titel)) : null,
      h('div', { class: 'lernkarte-text' }, inhalt(k.felder['text'] ?? '')));
  }));
}

/** Feste Verschiebung der Antworten je Wissenscheck (deterministisch aus der Kennung, 0 … n−1). */
export function wcVerschiebung(id: string, n: number): number {
  if (n < 2) return 0;
  let s = 0;
  for (const z of id) s = (s * 31 + (z.codePointAt(0) ?? 0)) % 9973;
  return s % n;
}

/** Wissenscheck (P11.6): eine Frage, zwei bis drei Antworten; die Wahl zeigt Rückmeldung, Erklärung und Kernsatz. */
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
  const v = wcVerschiebung(b.id ?? '', knoepfe.length);
  const reihe = [...knoepfe.slice(v), ...knoepfe.slice(0, v)];
  return h('section', { class: 'wissenscheck', 'data-pruef': 'wissenscheck', 'aria-label': W.theorie.wissenscheck },
    h('span', { class: 't-label' }, W.theorie.wissenscheck),
    h('div', { class: 'wc-frage' }, inhalt(b.felder['frage'] ?? '')),
    h('div', { class: 'wc-antworten reihe', role: 'group', 'aria-label': W.theorie.wissenscheckAntworten }, reihe),
    ergebnis);
}

/** Ebenen 1–4 (P6.1): aufklappbar, Ebene 1 offen. */
function ebenenBlock(ebenen: readonly Ebene[], inhalte: OeffentlicheInhalte, stufe: TitelStufe): HTMLElement {
  return h('div', { class: 'lern-ebenen', 'data-pruef': 'lern-ebenen' }, ebenen.map((e) => h('details', { class: 'lern-ebene', 'data-ebene': e.nr, 'data-pruef': `lern-ebene-${e.nr}`, open: e.nr === 1 },
    h('summary', null, h('span', { class: 'lern-ebene-nr' }, String(e.nr)), h('span', null, h('small', null, `${W.ebene} ${e.nr}`), e.titel)),
    e.felder['text'] ? h('div', { class: 'lesetext' }, inhalt(e.felder['text'])) : null,
    bloeckeIn(e.bloecke, inhalte, stufe))));
}

/** Lernwerkzeuge bedienbar (Hauptfenster) oder aufgelöst (Leinwand, Druck); gesetzt beim Bau eines Themas. */
let lwBedienbar = true;

/** Blöcke eines Themas; `stufe` = Überschriftenstufe für Tafeltitel. */
function bloeckeIn(bloecke: readonly Block[], inhalte: OeffentlicheInhalte, stufe: TitelStufe = 'h3'): Node[] {
  const aus: Node[] = [];
  for (const b of bloecke) {
    switch (b.art) {
      case 'zitat':
        aus.push(zitatBlock(b));
        break;
      case 'original':
      case 'querverweis':
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
        const t = tafelBlock(b, stufe);
        if (t !== null) aus.push(t);
        break;
      }
      case 'merksatz':
        aus.push(merksatz(b));
        break;
      case 'wissenscheck':
        aus.push(wissenscheck(b));
        break;
      case 'hinweis':
        aus.push(hinweis(b));
        break;
      case 'abbildung': {
        const a = inhalte.abbildungen.find((x) => x.id === b.id);
        const f = a !== undefined ? abbildung(a, { bedienbar: lwBedienbar }) : null;
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

/** „In der Story erlebt“: Stationen, die auf dieses Thema verweisen. */
function inDerStory(o: TheorieOptionen, thema: string): HTMLElement | null {
  const st = o.inhalte.geschichte?.stationen.filter((s) => s.theorie === thema) ?? [];
  if (st.length === 0) return null;
  return h('section', { class: 'querverweis-block', 'aria-label': T.inDerStory },
    h('span', { class: 't-label' }, T.inDerStory, h('span', { class: 'querverweis-fiktiv' }, ` · ${W.fiktiv}`)),
    h('div', { class: 'querverweise' }, st.map((s) => verweis(o, `#story/${s.id}`, { class: 'querverweis', 'data-pruef': `querverweis-${s.id}` },
      h('span', { class: 'querverweis-symbol' }, sym('pfeilRechts')),
      h('span', { class: 'querverweis-text' }, s.titel, h('small', null, `${s.datum} · LPH ${s.lph}`))))));
}

/** Glossar: alle Begriffe alphabetisch, mit Suchfeld, „Mehr dazu in“ und Begriffs-Kompass. */
export function glossarListe(o: { inhalte: OeffentlicheInhalte; bedienbar: boolean }): HTMLElement {
  const eintraege = Object.values(o.inhalte.glossar).sort((a, b) => a.begriff.localeCompare(b.begriff, 'de'));
  const gesamt = eintraege.length;
  const nachKapitel = new Map(Object.values(o.inhalte.theorie).map((t) => [t.kapitel, t]));
  const zahl = h('p', { class: 'glossar-zahl', role: 'status', 'aria-live': 'polite', 'data-pruef': 'glossar-zahl' }, T.glossarZahl(gesamt, gesamt));
  const leer = h('p', { class: 'glossar-leer', hidden: true }, T.glossarLeer);
  const link = (href: string, attrs: Record<string, string>, text: string): HTMLElement => o.bedienbar ? h('a', { ...attrs, href }, text) : h('span', attrs, text);
  const zeilen = eintraege.map((g) => {
    const orte = g.vorkommen.kapitel.map((k) => nachKapitel.get(k)).filter((t) => t !== undefined && t.thema !== 'glossar')
      .map((t) => link(`#theorie/${t?.thema ?? ''}`, { class: 'glossar-ort' }, t?.kurztitel ?? ''));
    return h('div', { class: 'glossar-eintrag', id: g.id, 'data-pruef': 'glossar-eintrag', 'data-suche': `${g.begriff} ${g.definition}`.toLocaleLowerCase('de') },
      h('dt', null, g.begriff),
      h('dd', null, (() => { const p = h('p', null, g.definition); umbruchNachSchraegstrich(p); return p; })(),
        orte.length > 0 ? h('p', { class: 'glossar-orte' }, h('span', { class: 't-label' }, T.kommtVor), ...orte) : null));
  });
  const feld = h('input', { type: 'search', class: 'glossar-feld', id: 'glossar-suche', 'data-pruef': 'glossar-suche', autocomplete: 'off', spellcheck: 'false' }) as HTMLInputElement;
  const kompassZeilen = o.inhalte.kompass.map((k) => h('tr', { 'data-pruef': 'kompass-eintrag', 'data-suche': `${k.begriff} ${k.andere.join(' ')}`.toLocaleLowerCase('de') },
    h('td', null, k.andere.join(' · ')),
    h('td', null, o.bedienbar && k.glossar !== null
      ? h('button', { type: 'button', class: 'kompass-begriff', 'data-glossar-ziel': k.glossar, onclick: () => {
        const ziel = document.getElementById(k.glossar ?? '');
        if (ziel === null) return;
        if (feld.value !== '') {
          feld.value = '';
          feld.dispatchEvent(new Event('input'));
        }
        ziel.tabIndex = -1;
        if (typeof ziel.scrollIntoView === 'function') ziel.scrollIntoView({ block: 'center' });
        ziel.focus({ preventScroll: true });
      } }, k.begriff)
      : h('b', null, k.begriff),
      k.hinweis !== null ? h('div', { class: 'kompass-hinweis' }, inhalt(k.hinweis)) : null)));
  const kompass = kompassZeilen.length === 0 ? null : h('section', { class: 'kompass', 'data-pruef': 'kompass', 'aria-labelledby': 'kompass-titel' },
    h('h2', { class: 'abschnitt-titel', id: 'kompass-titel' }, T.kompass),
    h('p', { class: 'lesetext' }, T.kompassText),
    h('div', { class: 'absatz-block', tabindex: 0, role: 'region', 'aria-label': T.tabelle(T.kompass) },
      h('table', { class: 'register-tabelle kompass-tabelle' },
        h('thead', null, h('tr', null, h('th', { scope: 'col' }, T.kompassAndere), h('th', { scope: 'col' }, T.kompassBegriff))),
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
    zahl.textContent = T.glossarZahl(sichtbar, gesamt);
    leer.hidden = sichtbar > 0 || kompassZeilen.some((z) => !z.hidden);
  });
  return h('section', { class: 'glossar', 'aria-label': T.glossar, 'data-pruef': 'glossar' },
    o.bedienbar ? h('div', { class: 'glossar-suche' }, h('label', { for: 'glossar-suche', class: 't-label' }, T.glossarSuche), feld, zahl) : null,
    h('dl', { class: 'glossar-eintraege' }, zeilen), leer,
    kompass);
}

function themaNav(o: TheorieOptionen, seite: TheorieSeite): HTMLElement {
  const alle = themen(o.inhalte);
  const i = alle.indexOf(seite);
  const vor = alle[i - 1] ?? null;
  const nach = alle[i + 1] ?? null;
  return h('nav', { class: 'kapitel-nav', 'aria-label': T.blaettern },
    vor !== null ? verweis(o, `#theorie/${vor.thema}`, { rel: 'prev' }, h('span', { class: 't-label' }, T.zurueck), h('b', null, vor.titel)) : null,
    nach !== null ? verweis(o, `#theorie/${nach.thema}`, { rel: 'next' }, h('span', { class: 't-label' }, T.weiter), h('b', null, nach.titel)) : null);
}

function kontaktZeile(o: TheorieOptionen): HTMLElement {
  return h('p', { class: 'lern-kontakt', 'data-pruef': 'lern-kontakt' }, `${T.kontakt} `, o.bedienbar ? bmLink() : W.rahmen.kontaktBm);
}

/** Inhalt eines Themas (Kopf bis „In der Story“), ohne Rahmen – für Seite, Leinwand und Druck. */
function themaInhalt(o: TheorieOptionen, seite: TheorieSeite): Node[] {
  lwBedienbar = o.bedienbar;
  const titel = seite.titel;
  const teile: Node[] = [h('header', { class: 'kapitel-kopf' },
    h('p', { class: 'kapitel-kicker' }, T.bereich),
    h('h1', { class: 'kapitel-titel', tabindex: -1, style: `--zeichen:${laengstesWort(titel)}` }, titel),
    seite.einleitung !== '' ? h('div', { class: 'kapitel-einstieg' }, inhalt(seite.einleitung)) : null)];
  for (const b of seite.bloecke) {
    if (b.art === 'kernaussage') {
      teile.push(h('section', { class: 'kernaussage', 'data-pruef': 'kernaussage' }, h('span', { class: 't-label' }, T.kernaussage), inhalt(b.felder['text'] ?? '')));
    } else if (b.art === 'abschnitt') {
      const t = kopfText(b.kopf, 'titel') ?? '';
      teile.push(h('section', { class: 'lern-abschnitt' },
        t !== '' ? h('h2', { class: 'abschnitt-titel' }, mitTrennstellen(t)) : null,
        b.felder['text'] ? h('div', { class: 'lesetext' }, inhalt(b.felder['text'])) : null,
        bloeckeIn(b.kinder, o.inhalte)));
    } else if (b.art === 'glossar') {
      teile.push(glossarListe(o));
    } else if (b.art !== 'querverweis' && b.art !== 'original') {
      teile.push(...bloeckeIn([b], o.inhalte, 'h2'));
    }
  }
  const qv = inDerStory(o, seite.thema);
  if (qv !== null) teile.push(qv);
  return teile;
}

function themaSeiteBauen(o: TheorieOptionen, seite: TheorieSeite): HTMLElement {
  const drucken = o.bedienbar
    ? h('button', { type: 'button', class: 'knopf knopf-still druck-knopf', 'data-pruef': 'thema-drucken', onclick: () => {
      druckeBogen(seite.titel, [bogenKopf(seite.titel, o.version, false), themaFuerDruck(o.inhalte, seite.thema, o.version)]);
    } }, sym('dokument'), T.drucken)
    : null;
  if (drucken !== null) bogenFuerStrgP(drucken, () => ({ titel: seite.titel, teile: [bogenKopf(seite.titel, o.version, false), themaFuerDruck(o.inhalte, seite.thema, o.version)] }));
  const teile = themaInhalt(o, seite);
  teile.splice(1, 0, h('p', { class: 'kapitel-vermerk' }, drucken));
  teile.push(themaNav(o, seite), kontaktZeile(o));
  return rahmen(o, [h('div', { class: 'lern-rahmen' },
    verzeichnis(o, seite.thema),
    h(o.bedienbar ? 'div' : 'article', { class: 'lern-inhalt', 'data-pruef': 'lernseite', 'data-thema': seite.thema }, teile))]);
}

/** Thema für den Druckbogen: dieselbe Zeichnung wie die Leinwand, ohne Rahmen. */
export function themaFuerDruck(inhalte: OeffentlicheInhalte, thema: string, version: string): HTMLElement {
  const seite = themaSeite(inhalte, thema);
  const o: TheorieOptionen = { inhalte, thema, version, bedienbar: false };
  tafelnAufgeloest(true);
  try {
    const el = h('div', { class: 'lern-inhalt druck-kapitel' }, seite !== null ? themaInhalt(o, seite) : null);
    loeseFuerDruckAuf(el);
    return el;
  } finally {
    tafelnAufgeloest(false);
  }
}

/** Druck: Wissenscheck und Schwellen-Spiel aufgelöst, Eingaben entfallen, Knöpfe werden Text. */
function loeseFuerDruckAuf(seite: HTMLElement): void {
  for (const f of seite.querySelectorAll<HTMLElement>('figure.abbildung')) {
    const marke = f.querySelector('.abbildung-unterschrift > .abbildung-marke');
    const titel = f.querySelector('.abbildung-unterschrift > .abbildung-titel');
    const rahmenEl = f.querySelector('.abbildung-rahmen');
    if (marke !== null && titel !== null && rahmenEl !== null) rahmenEl.prepend(h('p', { class: 'abbildung-druckkopf' }, marke, titel));
  }
  for (const d of seite.querySelectorAll<HTMLDetailsElement>('details')) d.open = true;
  for (const wc of seite.querySelectorAll<HTMLElement>('.wissenscheck')) {
    const ergebnis = wc.querySelector('.wc-ergebnis');
    const knoepfe = [...wc.querySelectorAll<HTMLButtonElement>('.wc-antwort')];
    if (ergebnis === null || knoepfe.length === 0) continue;
    const liste = h('ul', { class: 'wc-druck-antworten' });
    for (const k of knoepfe) {
      k.click();
      const r = ergebnis.querySelector('.wc-rueckmeldung');
      liste.append(h('li', null, h('b', null, k.textContent ?? ''), ' → ', ...(r !== null ? [...r.childNodes] : [])));
    }
    ergebnis.querySelector('.wc-rueckmeldung')?.remove();
    ergebnis.prepend(liste);
    ergebnis.removeAttribute('aria-live');
    wc.querySelector('.wc-antworten')?.remove();
  }
  for (const s of seite.querySelectorAll<HTMLElement>('.tafel-schwelle')) {
    s.querySelector<HTMLButtonElement>('[data-pruef="schwelle-aufloesen"]')?.click();
    for (const karte of s.querySelectorAll<HTMLElement>('.schwelle-karte')) {
      const gewaehlt = karte.querySelector('.schwelle-knopf[aria-pressed="true"]')?.textContent ?? '';
      karte.querySelector('.schwelle-knoepfe')?.replaceWith(h('p', { class: 'schwelle-druck-seite' }, h('b', null, `→ ${gewaehlt}`)));
      karte.querySelector('.schwelle-rueck')?.remove();
    }
    for (const weg of s.querySelectorAll('.tafel-hinweis, .schwelle-stand, [data-pruef="schwelle-aufloesen"]')) weg.remove();
  }
  for (const e of seite.querySelectorAll('input, select, textarea')) e.remove();
  for (const k of seite.querySelectorAll<HTMLButtonElement>('button:not(.begriff)')) {
    const text = h('span', null, ...k.childNodes);
    for (const a of k.getAttributeNames()) if (!['type', 'disabled', 'role', 'tabindex'].includes(a) && !a.startsWith('aria-')) text.setAttribute(a, k.getAttribute(a) ?? '');
    if (k.getAttribute('aria-pressed') === 'true') text.setAttribute('data-gewaehlt', '');
    k.replaceWith(text);
  }
}

/** Themenverzeichnis (klebend, rollt in sich): den aktuellen Eintrag sichtbar machen, ohne die Seite zu rollen */
export function zeigeAktuellenEintrag(seite: HTMLElement): void {
  requestAnimationFrame(() => {
    const v = seite.querySelector<HTMLElement>('.kapitel-verzeichnis');
    const a = v?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!v || !a || v.scrollHeight <= v.clientHeight + 1) return;
    const vr = v.getBoundingClientRect();
    const massstab = v.offsetHeight > 0 ? vr.height / v.offsetHeight : 1;
    const oben = (a.getBoundingClientRect().top - vr.top) / (massstab || 1) + v.scrollTop;
    v.scrollTop = Math.max(0, oben - v.clientHeight / 2);
  });
}

export function baueTheorie(o: TheorieOptionen): HTMLElement {
  if (o.thema === null) return uebersicht(o, false);
  const seite = themaSeite(o.inhalte, o.thema);
  if (seite === null) return uebersicht(o, true);
  tafelnAufgeloest(!o.bedienbar);
  try {
    return themaSeiteBauen(o, seite);
  } finally {
    tafelnAufgeloest(false);
  }
}
