/*
 * Seitenleiste (docs/STIL.md „Seitenleiste“, L-4): eingeklappt eine Schiene mit drei Knöpfen, offen
 * Rollen-Linse, Reiter „Im Raum · Ebenen · Glossar“. Dazu die Rollen-Linse „Standpunkt wechseln“ als
 * Schublade über der Lagetafel (hält den Fokus, Esc schließt, Fokus kehrt zurück).
 */

import type { OeffentlicherZustand } from '../../engine/typen.ts';
import type { Block, Ebene, OeffentlicheInhalte, Station } from '../../inhalte/typen.ts';
import { h, attr, ersetze } from '../h.ts';
import { alleBloecke, aktuelleStation, kopfText, rollenAttr } from '../anzeige.ts';
import { inhalt, personFigur, personName, personFunktion } from '../bausteine/inhalt.ts';
import { sym, zitat } from '../bausteine/bloecke.ts';
import { bildmarke } from '../marke.ts';

export type Reiter = 'raum' | 'ebenen' | 'glossar';

export interface SeitenWoerter {
  kontext: string;
  rollenLinse: string;
  siespielen: string;
  standpunkt: string;
  raum: string;
  ebenen: string;
  glossar: string;
  imRaum: string;
  monat: string;
  fall: string;
  projekt: string;
  projektbasis: string;
  stand: string;
  bauherr: string;
  vertretung: string;
  tasten: string;
  einklappen: string;
  neu: string;
  glossarHinweis: string;
  ebenenHinweis: string;
  keineEbenen: string;
  quelle: string;
  zitatWort: string;
  ebene: string;
}

/** Figuren, die an einer Station auftreten (Absender, Glieder, Standpunkte). */
export function figurenDerStation(st: Station): string[] {
  const ids: string[] = [];
  const merke = (id: string | null): void => {
    if (id !== null && id !== 'sie' && !ids.includes(id)) ids.push(id);
  };
  for (const s of st.schritte) for (const b of alleBloecke(s.bloecke)) merke(kopfText(b.kopf, 'von'));
  for (const p of st.standpunkte) merke(p.figur);
  return ids;
}

/** Glossar-Kennungen, auf die eine Station (samt Rollenszene) verweist. */
export function glossarDerStation(st: Station, rolle: string | null): string[] {
  const text = JSON.stringify([st.schritte, st.ebenen, st.standpunkte, rolle !== null ? st.szenen[rolle] ?? null : null]);
  const ids: string[] = [];
  for (const m of text.matchAll(/data-glossar=\\"([^"\\]+)\\"/g)) if (m[1] !== undefined && !ids.includes(m[1])) ids.push(m[1]);
  return ids;
}

function ebenenInhalt(e: Ebene, w: SeitenWoerter, inhalte: OeffentlicheInhalte): Node[] {
  const teile: Node[] = [];
  if (e.felder['text']) teile.push(inhalt(e.felder['text']));
  for (const b of e.bloecke as Block[]) if (b.art === 'zitat' || b.art === 'original') teile.push(zitat(b, 'zitat-klein', w.zitatWort));
  void inhalte;
  return teile;
}

export interface Seitenleiste {
  element: HTMLElement;
  setze(z: OeffentlicherZustand): void;
  istOffen(): boolean;
  oeffne(reiter: Reiter): void;
  schliesse(): void;
}

export interface SeitenOptionen {
  inhalte: OeffentlicheInhalte;
  bedienbar: boolean;
  beiUmschalten: () => void;
  oeffneLinse: (() => void) | null;
  neustart: (() => void) | null;
  woerter: SeitenWoerter;
}

let leistenZaehler = 0;

export function erzeugeSeitenleiste(o: SeitenOptionen): Seitenleiste {
  const w = o.woerter;
  let offen = false;
  let reiter: Reiter = 'raum';
  let letzterZ: OeffentlicherZustand | null = null;
  let schluessel = '';

  const schienenKnopf = (r: Reiter, symbol: 'person' | 'ebenen' | 'buch', text: string): HTMLButtonElement => h('button', {
    type: 'button',
    class: 'schienen-knopf',
    'aria-label': text,
    'aria-expanded': 'false',
    title: text,
    'data-pruef': `seitenleiste-${r}`,
    onclick: () => oeffne(r),
  }, sym(symbol));
  const schiene = h('div', { class: 'seitenleiste-schiene' },
    schienenKnopf('raum', 'person', `${w.rollenLinse} · ${w.raum}`), schienenKnopf('ebenen', 'ebenen', w.ebenen), schienenKnopf('glossar', 'buch', w.glossar));
  const rollenBox = h('section', { class: 'rollen-box', 'aria-label': w.rollenLinse });
  leistenZaehler += 1;
  const vorsatz = `seite-${leistenZaehler}`;
  const REITER = ['raum', 'ebenen', 'glossar'] as const;
  const reiterKnoepfe = REITER.map((r) => h('button', {
    type: 'button',
    class: 'reiter',
    role: 'tab',
    id: `${vorsatz}-reiter-${r}`,
    'aria-controls': `${vorsatz}-panel`,
    'aria-selected': 'false',
    tabindex: -1,
    onclick: () => {
      reiter = r;
      zeichne(true);
    },
  }, r === 'raum' ? w.raum : r === 'ebenen' ? w.ebenen : w.glossar));
  const inhaltEl = h('div', { class: 'seitenleiste-inhalt', role: 'tabpanel', id: `${vorsatz}-panel`, 'aria-labelledby': `${vorsatz}-reiter-raum`, tabindex: 0 });
  const reiterTaste = (ereignis: Event): void => {
    const e = ereignis as KeyboardEvent;
    const i = REITER.indexOf(reiter);
    const ziel = e.key === 'ArrowRight' ? (i + 1) % REITER.length
      : e.key === 'ArrowLeft' ? (i + REITER.length - 1) % REITER.length
        : e.key === 'Home' ? 0
          : e.key === 'End' ? REITER.length - 1 : null;
    if (ziel === null) return;
    // Verbraucht: sonst blätterte ← → zugleich die Story weiter (main.ts prüft defaultPrevented).
    e.preventDefault();
    e.stopPropagation();
    reiter = REITER[ziel] ?? 'raum';
    zeichne(true);
    reiterKnoepfe[ziel]?.focus();
  };
  const fuss = h('footer', { class: 'seitenleiste-fuss' }, bildmarke('marke-logo'), h('span', null, w.tasten),
    h('button', { type: 'button', class: 'knopf-neustart', 'data-pruef': 'seitenleiste-zu', onclick: () => schliesse() }, sym('pfeilRechts'), w.einklappen),
    o.neustart !== null ? h('button', { type: 'button', class: 'knopf-neustart', 'data-pruef': 'neustart', onclick: () => o.neustart?.() }, sym('zurueckspulen'), w.neu) : null);
  const karte = h('div', { class: 'seitenleiste-karte' }, rollenBox, h('div', { class: 'reiter-leiste', role: 'tablist', 'aria-label': w.kontext, onkeydown: reiterTaste }, reiterKnoepfe), inhaltEl, fuss);
  const element = h('aside', { class: 'seitenleiste', 'aria-label': w.kontext }, schiene, karte);

  const zeichne = (erzwingen: boolean): void => {
    const z = letzterZ;
    if (z === null) return;
    for (const k of schiene.querySelectorAll('button')) attr(k, 'aria-expanded', offen ? 'true' : 'false');
    reiterKnoepfe.forEach((k, i) => {
      const an = REITER[i] === reiter;
      attr(k, 'aria-selected', an ? 'true' : 'false');
      k.tabIndex = an ? 0 : -1;
    });
    attr(inhaltEl, 'aria-labelledby', `${vorsatz}-reiter-${reiter}`);
    const st = aktuelleStation(z, o.inhalte);
    const neu = `${z.station}|${z.rolle}|${reiter}|${offen}`;
    if (!erzwingen && neu === schluessel) return;
    schluessel = neu;
    // Rollen-Box
    const rolle = z.rolle !== null ? o.inhalte.rollen[z.rolle] ?? null : null;
    const standpunkte = st?.standpunkte ?? [];
    ersetze(rollenBox,
      h('span', { class: 't-label' }, w.rollenLinse),
      h('div', { class: 'rollen-box-zeile' },
        rolle?.figur ? personFigur(rolle.figur, 50, o.inhalte) : null,
        rolle !== null ? h('span', { class: 'rollen-chip', 'data-rolle': rollenAttr(rolle.id) }, `${w.siespielen}: `, h('b', null, rolle.titel)) : null),
      standpunkte.length > 0 && o.oeffneLinse !== null ? h('button', {
        type: 'button', class: 'knopf-linse', 'aria-haspopup': 'dialog', 'data-pruef': 'standpunkt', onclick: () => o.oeffneLinse?.(),
      }, sym('wechsel'), w.standpunkt) : null);
    // Reiter-Inhalt
    const teile: Node[] = [];
    if (st !== null && reiter === 'raum') {
      const figuren = figurenDerStation(st);
      if (figuren.length > 0) {
        teile.push(h('h3', { class: 'leiste-titel' }, `${w.imRaum}${st.monat !== null ? ` · ${w.monat} ${st.monat}` : ''}`));
        teile.push(h('ul', { class: 'besetzung' }, figuren.map((f) => h('li', null, personFigur(f, 38, o.inhalte), h('div', null, h('b', null, personName(f, o.inhalte)), h('span', null, personFunktion(f, o.inhalte)))))));
      }
      const fall = o.inhalte.fall;
      if (fall !== null) {
        teile.push(h('h3', { class: 'leiste-titel' }, w.fall));
        teile.push(h('dl', { class: 'fall-daten' },
          h('div', null, h('dt', null, w.projekt), h('dd', null, `${fall.projekt}: ${fall.bauteile.join(', ')}${fall.bauweise !== null ? ` · ${fall.bauweise}` : ''}`)),
          h('div', null, h('dt', null, w.projektbasis), h('dd', null, fall.projektbasis)),
          st.lph !== null ? h('div', null, h('dt', null, w.stand), h('dd', null, `LPH ${st.lph}`)) : null,
          h('div', null, h('dt', null, w.bauherr), h('dd', null, `${fall.bauherr}; ${w.vertretung} ${fall.vertretung}${fall.vertretungKurz !== null ? ` (${fall.vertretungKurz})` : ''}`))));
        teile.push(h('p', { class: 'leiste-hinweis' }, fall.hinweis));
      }
    } else if (st !== null && reiter === 'ebenen') {
      const ebenen = st.ebenen ?? (st.partner !== null ? o.inhalte.stationen[st.partner]?.ebenen ?? null : null);
      if (ebenen === null || ebenen.length === 0) teile.push(h('p', { class: 'leiste-hinweis' }, w.keineEbenen));
      else {
        teile.push(h('p', { class: 'leiste-hinweis' }, w.ebenenHinweis));
        ebenen.forEach((e, i) => {
          const d = h('details', { class: 'klapp', open: i === 0 }, h('summary', null, h('span', { class: 'klapp-nr' }, String(e.nr)), `${w.ebene} ${e.nr} · ${e.titel}`), h('div', { class: 'klapp-inhalt' }, ebenenInhalt(e, w, o.inhalte)));
          teile.push(d);
        });
      }
    } else if (st !== null) {
      const ids = glossarDerStation(st, z.rolle);
      teile.push(h('p', { class: 'leiste-hinweis' }, w.glossarHinweis));
      teile.push(h('dl', { class: 'glossar-liste' }, ids.map((id) => o.inhalte.glossar[id]).filter((g) => g !== undefined).map((g) => h('div', null, h('dt', null, g.begriff), h('dd', null, g.definition)))));
      teile.push(h('p', { class: 'leiste-hinweis' }, w.quelle));
    }
    inhaltEl.replaceChildren(...teile);
  };

  const oeffne = (r: Reiter): void => {
    reiter = r;
    offen = true;
    o.beiUmschalten();
    zeichne(true);
    const erster = reiterKnoepfe[REITER.indexOf(r)];
    if (o.bedienbar) erster?.focus({ preventScroll: true });
  };
  const schliesse = (): void => {
    offen = false;
    o.beiUmschalten();
    zeichne(true);
    if (o.bedienbar) (schiene.querySelector('button') as HTMLButtonElement | null)?.focus({ preventScroll: true });
  };

  return {
    element,
    setze(z) {
      letzterZ = z;
      zeichne(false);
    },
    istOffen: () => offen,
    oeffne,
    schliesse,
  };
}

/* -------------------------------------------------------------- Rollen-Linse -- */

export interface LinsenWoerter {
  rollenLinse: string;
  titel: string;
  schliessen: string;
  unter: (uhr: string | null) => string;
  zurueck: (rolle: string) => string;
  folgt: string;
}

export interface Linse {
  element: DocumentFragment;
  oeffne(z: OeffentlicherZustand): void;
  schliesse(): void;
  istOffen(): boolean;
  /** Tab-Taste innerhalb der Linse halten */
  halteFokus(e: KeyboardEvent): void;
}

export function erzeugeLinse(inhalte: OeffentlicheInhalte, w: LinsenWoerter, rueckruf: { beiOeffnen: () => void; beiSchliessen: () => void }): Linse {
  const grund = h('div', { class: 'linse-grund', hidden: true, onclick: () => schliesse() });
  const titelId = `linse-titel-${Math.random().toString(36).slice(2, 8)}`;
  const inhaltEl = h('div', { class: 'linse-inhalt' });
  const schliessKnopf = h('button', { type: 'button', class: 'knopf-schliessen', 'aria-label': w.schliessen, onclick: () => schliesse() }, sym('kreuz'));
  const dialog = h('section', { class: 'linse', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titelId, hidden: true, 'data-pruef': 'linse' },
    h('header', { class: 'linse-kopf' }, h('div', null, h('span', { class: 't-label' }, w.rollenLinse), h('h2', { class: 'linse-titel', id: titelId }, w.titel)), schliessKnopf),
    inhaltEl);
  let offen = false;
  let rueck: HTMLElement | null = null;

  const schliesse = (): void => {
    if (!offen) return;
    offen = false;
    grund.hidden = true;
    dialog.hidden = true;
    rueckruf.beiSchliessen();
    if (rueck !== null && document.contains(rueck)) rueck.focus({ preventScroll: true });
  };

  const f = document.createDocumentFragment();
  f.append(grund, dialog);
  return {
    element: f,
    istOffen: () => offen,
    schliesse,
    oeffne(z) {
      const st = aktuelleStation(z, inhalte);
      if (st === null) return;
      const rolle = z.rolle !== null ? inhalte.rollen[z.rolle] ?? null : null;
      ersetze(inhaltEl,
        h('p', { class: 'linse-unter' }, w.unter(st.uhr)),
        st.standpunkte.map((p, i) => {
          const r = inhalte.rollen[p.rolle];
          return h('div', { class: 'blickwinkel', 'data-rolle': rollenAttr(p.rolle), style: `--verzug:${120 + i * 140}ms` },
            personFigur(p.figur, 58, inhalte),
            h('div', null, h('span', { class: 'blickwinkel-rolle' }, r?.kurztitel ?? p.rolle), h('b', null, personName(p.figur, inhalte)), h('blockquote', null, inhalt(p.html))));
        }),
        h('div', { class: 'rollen-uebersicht' },
          h('ul', null, inhalte.rollenFolge.map((id) => {
            const r = inhalte.rollen[id];
            if (r === undefined) return null;
            return h('li', { class: id === z.rolle ? 'ist-ich' : null }, r.figur !== null ? personFigur(r.figur, 28, inhalte) : null,
              h('span', null, r.kurztitel, !r.spielbar ? h('small', { class: 'folgt-marke' }, ` · ${w.folgt}`) : null));
          }))),
        h('button', { type: 'button', class: 'knopf knopf-still linse-zurueck', onclick: () => schliesse() }, sym('pfeilLinks'), w.zurueck(rolle?.kurztitel ?? '')));
      rueck = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      offen = true;
      grund.hidden = false;
      dialog.hidden = false;
      rueckruf.beiOeffnen();
      schliessKnopf.focus({ preventScroll: true });
    },
    halteFokus(e) {
      if (!offen || e.key !== 'Tab') return;
      const ziele = [...dialog.querySelectorAll<HTMLElement>('button, [tabindex="0"]')].filter((el) => !el.hasAttribute('disabled'));
      const erstes = ziele[0];
      const letztes = ziele[ziele.length - 1];
      if (erstes === undefined || letztes === undefined) return;
      if (e.shiftKey && document.activeElement === erstes) {
        e.preventDefault();
        letztes.focus();
      } else if (!e.shiftKey && document.activeElement === letztes) {
        e.preventDefault();
        erstes.focus();
      } else if (!dialog.contains(document.activeElement)) {
        e.preventDefault();
        erstes.focus();
      }
    },
  };
}
