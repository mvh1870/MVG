/*
 * Kleine interaktive Grafiken der Lernseiten (P12.3, O-30): Inhalte erklären statt zitieren.
 *
 *   ::: etappen      Abfolge zum Durchklicken (Punkte auf einer Linie, Text der gewählten Etappe)
 *   ::: umschalter   zwei Ansichten desselben Gegenstands (z. B. „ohne MVG“ / „mit MVG“)
 *   ::: sortieren    Zuordnungsübung mit zwei Körben, Rückmeldung je Element, ohne Punkte
 *   ::: regler       Schieberegler über geordnete Stufen (z. B. Beträge der Mandatsleiter)
 *
 * Auf der Leinwand und im Druck (nicht bedienbar) zeigen alle vier ihren ganzen Inhalt aufgelöst: Etappen
 * als Liste, beide Ansichten nebeneinander, die Zuordnung sortiert, alle Stufen (P12.5 R5).
 *
 * Alle vier sind per Tastatur bedienbar, melden Wechsel knapp an Screenreader und zeigen ohne
 * Bedienung schon einen sinnvollen Anfangszustand (Druck, Leinwand). Bewegung nur über CSS
 * (prefers-reduced-motion schaltet sie ab). Die Wahl bleibt örtlich (kein Engine-Zustand).
 */

import type { Block } from '../../inhalte/typen.ts';
import type { TitelStufe } from '../../grafik/tafel.ts';
import { h, ersetze } from '../h.ts';
import { inhalt } from './inhalt.ts';
import { kopfText } from '../anzeige.ts';
import { W } from '../woerter.ts';

const L = W.lernwerkzeug;

/** Titel eines Werkzeugs (h3 in Abschnitten, h2 auf Seitenebene). */
function kopf(b: Block, klasse: string, stufe: TitelStufe): HTMLElement | null {
  const titel = kopfText(b.kopf, 'titel');
  const text = b.felder['text'] ?? '';
  if (titel === null && text === '') return null;
  return h('header', { class: `lw-kopf ${klasse}-kopf` },
    titel !== null ? h(stufe, { class: 'lw-titel' }, titel) : null,
    text !== '' ? h('div', { class: 'lw-einleitung' }, inhalt(text)) : null);
}

/* ---------------------------------------------------------------- Etappen -- */

export function etappen(b: Block, stufe: TitelStufe = 'h3', bedienbar = true): HTMLElement {
  const liste = b.kinder.filter((k) => k.art === 'etappe');
  if (!bedienbar) {
    return h('section', { class: 'lernwerkzeug lw-etappen ist-aufgeloest', 'data-pruef': 'etappen' },
      kopf(b, 'lw-etappen', stufe),
      h('ol', { class: 'lw-aufgeloest-liste' }, liste.map((e) => h('li', null,
        h('b', { class: 'lw-etappe-titel' }, kopfText(e.kopf, 'titel') ?? ''),
        h('div', { class: 'lw-etappe-text' }, inhalt(e.felder['text'] ?? ''))))));
  }
  const n = liste.length;
  const ansage = h('p', { class: 'nur-sr', 'aria-live': 'polite' });
  const detail = h('div', { class: 'lw-etappe-detail', 'data-pruef': 'etappe-detail' });
  const linie = h('span', { class: 'lw-etappen-fuellung', 'aria-hidden': 'true' });
  let jetzt = 0;
  const knoepfe = liste.map((e, i) => h('button', {
    type: 'button', class: 'lw-etappe', 'aria-pressed': i === 0 ? 'true' : 'false', 'data-pruef': `etappe-${i + 1}`,
    onclick: () => zeige(i, true),
    onkeydown: (ev: Event) => {
      const t = (ev as KeyboardEvent).key;
      const ziel = t === 'ArrowRight' ? i + 1 : t === 'ArrowLeft' ? i - 1 : t === 'Home' ? 0 : t === 'End' ? n - 1 : null;
      if (ziel === null || ziel < 0 || ziel >= n) return;
      ev.preventDefault();
      zeige(ziel, true);
      knoepfe[ziel]?.focus();
    },
  }, h('span', { class: 'lw-etappe-nr', 'aria-hidden': 'true' }, String(i + 1)), h('span', { class: 'lw-etappe-name' }, kopfText(e.kopf, 'titel') ?? '')));
  const zurueck = h('button', { type: 'button', class: 'knopf knopf-still lw-blaettern', 'data-pruef': 'etappe-zurueck', onclick: () => zeige(jetzt - 1, true) }, L.zurueck);
  const weiter = h('button', { type: 'button', class: 'knopf knopf-still lw-blaettern', 'data-pruef': 'etappe-weiter', onclick: () => zeige(jetzt + 1, true) }, L.weiter);
  function zeige(i: number, melden: boolean): void {
    if (i < 0 || i >= n) return;
    jetzt = i;
    knoepfe.forEach((k, j) => {
      k.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      k.classList.toggle('ist-erreicht', j <= i);
    });
    linie.style.setProperty('--anteil', n > 1 ? String(i / (n - 1)) : '1');
    const e = liste[i];
    ersetze(detail,
      h('span', { class: 't-label' }, L.etappeVon(i + 1, n)),
      h('b', { class: 'lw-etappe-titel' }, kopfText(e?.kopf ?? {}, 'titel') ?? ''),
      h('div', { class: 'lw-etappe-text' }, inhalt(e?.felder['text'] ?? '')));
    detail.classList.remove('ist-neu');
    void detail.offsetWidth;
    detail.classList.add('ist-neu');
    zurueck.toggleAttribute('disabled', i === 0);
    weiter.toggleAttribute('disabled', i === n - 1);
    if (melden) ansage.textContent = L.etappeAnsage(i + 1, n, kopfText(e?.kopf ?? {}, 'titel') ?? '');
  }
  zeige(0, false);
  return h('section', { class: 'lernwerkzeug lw-etappen', 'data-pruef': 'etappen', style: `--anzahl: ${n}` },
    kopf(b, 'lw-etappen', stufe),
    h('div', { class: 'lw-etappen-leiste', role: 'group', 'aria-label': kopfText(b.kopf, 'titel') ?? L.etappen },
      h('span', { class: 'lw-etappen-linie', 'aria-hidden': 'true' }, linie), knoepfe),
    detail,
    h('div', { class: 'lw-blaetter-reihe' }, zurueck, weiter),
    ansage);
}

/* -------------------------------------------------------------- Umschalter -- */

export function umschalter(b: Block, stufe: TitelStufe = 'h3', bedienbar = true): HTMLElement {
  const seiten = (['links', 'rechts'] as const).map((s) => ({
    s,
    name: kopfText(b.kopf, s) ?? s,
    block: b.kinder.find((k) => k.art === 'ansicht' && k.id === s),
  }));
  if (!bedienbar) {
    return h('section', { class: 'lernwerkzeug lw-umschalter ist-aufgeloest', 'data-pruef': 'umschalter' },
      kopf(b, 'lw-umschalter', stufe),
      h('div', { class: 'lw-nebeneinander' }, seiten.map((x) => h('div', { class: 'lw-ansicht', 'data-seite': x.s },
        h('span', { class: 't-label' }, x.name),
        h('div', { class: 'lw-ansicht-inhalt' }, inhalt(x.block?.felder['text'] ?? ''))))));
  }
  const feld = h('div', { class: 'lw-ansicht', 'data-pruef': 'umschalter-ansicht', 'aria-live': 'polite' });
  const knoepfe = seiten.map((x, i) => h('button', {
    type: 'button', class: `lw-schalter-seite lw-seite-${x.s}`, 'aria-pressed': i === 0 ? 'true' : 'false', 'data-pruef': `umschalter-${x.s}`,
    onclick: () => zeige(i),
  }, x.name));
  const schalter = h('div', { class: 'lw-schalter', role: 'group', 'aria-label': kopfText(b.kopf, 'titel') ?? L.umschalter }, h('span', { class: 'lw-schalter-marke', 'aria-hidden': 'true' }), knoepfe);
  function zeige(i: number): void {
    const x = seiten[i];
    if (x === undefined) return;
    knoepfe.forEach((k, j) => k.setAttribute('aria-pressed', j === i ? 'true' : 'false'));
    schalter.dataset['seite'] = x.s;
    feld.dataset['seite'] = x.s;
    ersetze(feld, h('div', { class: 'lw-ansicht-inhalt' }, inhalt(x.block?.felder['text'] ?? '')));
    feld.classList.remove('ist-neu');
    void feld.offsetWidth;
    feld.classList.add('ist-neu');
  }
  zeige(0);
  return h('section', { class: 'lernwerkzeug lw-umschalter', 'data-pruef': 'umschalter' },
    kopf(b, 'lw-umschalter', stufe), schalter, feld);
}

/* --------------------------------------------------------------- Sortieren -- */

export function sortieren(b: Block, stufe: TitelStufe = 'h3', bedienbar = true): HTMLElement {
  const namen = { links: kopfText(b.kopf, 'links') ?? '', rechts: kopfText(b.kopf, 'rechts') ?? '' };
  const posten = b.kinder.filter((k) => k.art === 'posten');
  if (!bedienbar) {
    const korb = (seite: 'links' | 'rechts'): HTMLElement => h('div', { class: `lw-korb-aufgeloest lw-seite-${seite}` },
      h('span', { class: `lw-korb lw-seite-${seite}` }, namen[seite]),
      h('ul', { class: 'lw-aufgeloest-liste' }, posten.filter((p) => (kopfText(p.kopf, 'seite') ?? 'links') === seite).map((p) => h('li', null,
        h('div', { class: 'lw-posten-text' }, inhalt(p.felder['text'] ?? '')),
        p.felder['erklaerung'] ? h('div', { class: 'lw-posten-rueck' }, inhalt(p.felder['erklaerung'])) : null))));
    return h('section', { class: 'lernwerkzeug lw-sortieren ist-aufgeloest', 'data-pruef': 'sortieren' },
      kopf(b, 'lw-sortieren', stufe), h('div', { class: 'lw-nebeneinander' }, korb('links'), korb('rechts')));
  }
  const ansage = h('p', { class: 'nur-sr', 'aria-live': 'polite' });
  const stand = h('p', { class: 'lw-sortier-stand', 'data-pruef': 'sortieren-stand' });
  let erledigt = 0;
  const zeilen = posten.map((p, i) => {
    const richtig = (kopfText(p.kopf, 'seite') ?? 'links') as 'links' | 'rechts';
    const rueck = h('div', { class: 'lw-posten-rueck', 'data-pruef': `posten-rueck-${i + 1}` });
    const zeile = h('li', { class: 'lw-posten', 'data-pruef': `posten-${i + 1}` });
    const wahl = (seite: 'links' | 'rechts'): void => {
      if (!zeile.classList.contains('ist-zugeordnet')) erledigt += 1;
      zeile.classList.add('ist-zugeordnet');
      zeile.dataset['seite'] = richtig;
      const passt = seite === richtig;
      zeile.classList.toggle('ist-daneben', !passt);
      for (const k of zeile.querySelectorAll('button')) k.setAttribute('aria-pressed', k.dataset['seite'] === seite ? 'true' : 'false');
      ersetze(rueck,
        h('b', null, passt ? L.passt : L.gehoertZu(namen[richtig])),
        p.felder['erklaerung'] ? h('span', null, ' ', inhalt(p.felder['erklaerung'])) : null);
      ansage.textContent = passt ? L.passt : L.gehoertZu(namen[richtig]);
      stand.textContent = L.sortierStand(erledigt, posten.length);
    };
    const knopf = (seite: 'links' | 'rechts'): HTMLElement => h('button', {
      type: 'button', class: `knopf knopf-still lw-korb-knopf lw-seite-${seite}`, 'aria-pressed': 'false', 'data-seite': seite, 'data-pruef': `posten-${i + 1}-${seite}`,
      onclick: () => wahl(seite),
    }, namen[seite]);
    zeile.append(
      h('div', { class: 'lw-posten-text' }, inhalt(p.felder['text'] ?? '')),
      h('div', { class: 'lw-posten-wahl', role: 'group', 'aria-label': L.zuordnen }, knopf('links'), knopf('rechts')),
      rueck);
    return { zeile, loese: () => wahl(richtig) };
  });
  stand.textContent = L.sortierStand(0, posten.length);
  const aufloesen = h('button', { type: 'button', class: 'knopf knopf-still', 'data-pruef': 'sortieren-aufloesen', onclick: () => { for (const z of zeilen) if (!z.zeile.classList.contains('ist-zugeordnet')) z.loese(); } }, L.aufloesen);
  return h('section', { class: 'lernwerkzeug lw-sortieren', 'data-pruef': 'sortieren' },
    kopf(b, 'lw-sortieren', stufe),
    h('div', { class: 'lw-koerbe', 'aria-hidden': 'true' }, h('span', { class: 'lw-korb lw-seite-links' }, namen.links), h('span', { class: 'lw-korb lw-seite-rechts' }, namen.rechts)),
    h('ol', { class: 'lw-posten-liste' }, zeilen.map((z) => z.zeile)),
    h('div', { class: 'lw-blaetter-reihe' }, stand, aufloesen),
    ansage);
}

/* ------------------------------------------------------------------ Regler -- */

export function regler(b: Block, stufe: TitelStufe = 'h3', bedienbar = true): HTMLElement {
  const stufen = b.kinder.filter((k) => k.art === 'stufe');
  if (!bedienbar) {
    return h('section', { class: 'lernwerkzeug lw-regler ist-aufgeloest', 'data-pruef': 'regler-block' },
      kopf(b, 'lw-regler', stufe),
      h('ol', { class: 'lw-aufgeloest-liste' }, stufen.map((s) => {
        const marke = kopfText(s.kopf, 'marke');
        return h('li', null,
          h('span', { class: 't-label' }, kopfText(s.kopf, 'titel') ?? ''),
          marke !== null ? h('b', { class: 'lw-stufe-marke' }, marke) : null,
          h('div', { class: 'lw-stufe-text' }, inhalt(s.felder['text'] ?? '')));
      })));
  }
  const n = stufen.length;
  const karte = h('div', { class: 'lw-stufe-karte', 'data-pruef': 'regler-karte', 'aria-live': 'polite' });
  const marken = stufen.map((s, i) => h('li', { class: 'lw-regler-marke', 'data-stufe': i + 1 }, kopfText(s.kopf, 'titel') ?? ''));
  const eingabe = h('input', {
    type: 'range', class: 'lw-regler-eingabe', min: 1, max: Math.max(1, n), step: 1, value: 1, 'data-pruef': 'regler',
    'aria-label': kopfText(b.kopf, 'titel') ?? L.regler,
    oninput: () => zeige(Number(eingabe.value) - 1),
  });
  function zeige(i: number): void {
    const s = stufen[i];
    if (s === undefined) return;
    eingabe.setAttribute('aria-valuetext', kopfText(s.kopf, 'titel') ?? String(i + 1));
    marken.forEach((m, j) => m.classList.toggle('ist-aktiv', j === i));
    const marke = kopfText(s.kopf, 'marke');
    ersetze(karte,
      h('span', { class: 't-label' }, kopfText(s.kopf, 'titel') ?? ''),
      marke !== null ? h('b', { class: 'lw-stufe-marke' }, marke) : null,
      h('div', { class: 'lw-stufe-text' }, inhalt(s.felder['text'] ?? '')));
    karte.style.setProperty('--anteil', n > 1 ? String(i / (n - 1)) : '1');
    karte.classList.remove('ist-neu');
    void karte.offsetWidth;
    karte.classList.add('ist-neu');
  }
  zeige(0);
  return h('section', { class: 'lernwerkzeug lw-regler', 'data-pruef': 'regler-block', style: `--anzahl: ${n}` },
    kopf(b, 'lw-regler', stufe),
    h('div', { class: 'lw-regler-bahn' }, eingabe, h('ol', { class: 'lw-regler-marken', 'aria-hidden': 'true' }, marken)),
    karte);
}
