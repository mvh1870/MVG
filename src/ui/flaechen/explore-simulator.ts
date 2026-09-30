/*
 * Explore · Szenario-Simulator (P8.1): Eingaben zur Projektlage links, Ergebnis rechts – wer entscheidet
 * (Mandatsleiter), welche Entscheidungen beim Bauherrn bleiben, welcher Informationsbedarf besteht,
 * welcher Freigabeweg gilt, welcher Schritt als Nächstes kommt. Jede Aussage nennt ihre Absatz-ID und
 * öffnet den Wortlaut aus dem Quellenfenster. Die Regeln stehen in src/engine/simulator.ts.
 */

import { h, ersetze } from '../h.ts';
import { simuliere, type Deckung, type EntscheidungsStatus, type SimEingabe, type SimHinweis, type Stufe } from '../../engine/simulator.ts';
import type { OeffentlicheInhalte } from '../../inhalte/typen.ts';
import { inhalt } from '../bausteine/inhalt.ts';
import { W } from '../woerter.ts';

/** Die Stufen der Leiter trennen nicht selbst (STIL: Labels nie automatisch getrennt, R32) – nur an gesetzter Stelle. */
const trennbar = (s: string): string => s.replace('Änderungsgremium', 'Änderungs\u00adgremium');

const START: SimEingabe = { betragTeur: 400, deckung: 'budget', terminWochen: 0, schwelleUeberschritten: false, zielkonflikt: false, risikoAnnahme: false, substanziell: true, freigabeBeruehrt: false, datenstandBenannt: false, status: 'in-bearbeitung' };

export function simulator(inhalte: OeffentlicheInhalte): HTMLElement {
  const S = W.simulator;
  const e: SimEingabe = { ...START };
  const ergebnis = h('div', { class: 'sim-ergebnis', 'data-pruef': 'sim-ergebnis' });
  const kurz = h('p', { class: 'nur-sr', 'aria-live': 'polite', 'data-pruef': 'sim-meldung' });

  const regler = (name: 'betragTeur' | 'terminWochen', max: number, schritt: number, anzeige: (n: number) => string): HTMLElement => {
    const wert = h('output', { class: 'sim-wert', 'data-pruef': `sim-${name}-wert` }, anzeige(e[name]));
    const feld = h('input', { type: 'range', id: `sim-${name}`, min: 0, max, step: schritt, value: e[name], class: 'sim-regler', 'data-pruef': `sim-${name}` }) as HTMLInputElement;
    feld.addEventListener('input', () => {
      e[name] = Number(feld.value);
      wert.textContent = anzeige(e[name]);
      feld.setAttribute('aria-valuetext', anzeige(e[name]));
      zeichne();
    });
    feld.setAttribute('aria-valuetext', anzeige(e[name]));
    return h('div', { class: 'sim-feld' }, h('label', { for: `sim-${name}`, class: 't-label' }, S.felder[name]), h('div', { class: 'sim-regler-zeile' }, feld, wert));
  };
  const schalter = (name: 'schwelleUeberschritten' | 'zielkonflikt' | 'risikoAnnahme' | 'substanziell' | 'freigabeBeruehrt' | 'datenstandBenannt'): HTMLElement => {
    const feld = h('input', { type: 'checkbox', id: `sim-${name}`, checked: e[name], 'data-pruef': `sim-${name}` }) as HTMLInputElement;
    feld.addEventListener('change', () => { e[name] = feld.checked; zeichne(); });
    return h('label', { class: 'sim-schalter', for: `sim-${name}` }, feld, h('span', null, S.felder[name]));
  };
  const deckung = h('fieldset', { class: 'sim-gruppe' }, h('legend', { class: 't-label' }, S.felder.deckung),
    (['budget', 'reserve', 'ueber-basis'] as Deckung[]).map((d) => {
      const feld = h('input', { type: 'radio', name: 'sim-deckung', id: `sim-deckung-${d}`, value: d, checked: e.deckung === d, 'data-pruef': `sim-deckung-${d}` }) as HTMLInputElement;
      feld.addEventListener('change', () => { if (feld.checked) { e.deckung = d; zeichne(); } });
      return h('label', { class: 'sim-schalter', for: `sim-deckung-${d}` }, feld, h('span', null, S.deckung[d]));
    }));
  const status = h('select', { id: 'sim-status', class: 'sim-auswahl', 'data-pruef': 'sim-status' },
    (['offen', 'in-bearbeitung', 'entscheidungsreif', 'entschieden'] as EntscheidungsStatus[]).map((s) => h('option', { value: s, selected: e.status === s }, S.status[s]))) as HTMLSelectElement;
  status.addEventListener('change', () => { e.status = status.value as EntscheidungsStatus; zeichne(); });

  const quelle = (id: string): HTMLElement => {
    const q = inhalte.quellen[id];
    return q === undefined ? h('span', { class: 'sim-quelle' }, id)
      : h('details', { class: 'sim-quelle' }, h('summary', null, `${S.quelle} ${id}`), h('div', { class: 'sim-zitat', tabindex: 0, role: 'region', 'aria-label': `${S.quelle} ${id}` }, inhalt(q.html)));
  };
  const liste = (titel: string, hinweise: SimHinweis[], pruef: string): HTMLElement | null => hinweise.length === 0 ? null
    : h('section', { class: 'sim-teil', 'data-pruef': pruef }, h('h3', { class: 'sim-teil-titel' }, titel),
      h('ul', { class: 'sim-liste' }, hinweise.map((x) => h('li', null, h('p', null, x.text), quelle(x.quelle)))));
  const leiter = (stufe: Stufe | null): HTMLElement => h('ol', { class: 'sim-leiter', 'aria-label': S.leiter }, (['pl', 'gremium', 'bauherr'] as Stufe[]).map((s) =>
    h('li', { class: `sim-stufe${s === stufe ? ' ist-aktiv' : ''}`, 'aria-current': s === stufe ? 'true' : null, 'data-pruef': `sim-stufe-${s}` }, trennbar(S.stufen[s]))));

  const zeichne = (): void => {
    const r = simuliere(e);
    kurz.textContent = S.meldung(r.wer, r.wesentlich, r.freigabeBeimBauherrn, r.stufeOffen);
    ersetze(ergebnis,
      h('section', { class: 'sim-teil sim-wer', 'data-pruef': 'sim-wer' }, h('h3', { class: 'sim-teil-titel' }, S.wer), h('p', { class: 'sim-wer-name' }, r.wer), leiter(r.stufeOffen ? null : r.stufe),
        h('p', { class: 'sim-wesentlich' }, r.wesentlich ? S.wesentlich : r.stufeOffen ? S.offenWesentlich : S.nichtWesentlich)),
      liste(S.titel.eskalation, r.eskalation, 'sim-eskalation'),
      liste(S.titel.bauherr, r.bauherr, 'sim-bauherr'),
      liste(S.titel.information, r.information, 'sim-information'),
      liste(S.titel.freigabeweg, r.freigabeweg, 'sim-freigabeweg'),
      liste(S.titel.naechster, r.naechsterSchritt, 'sim-naechster'));
  };
  zeichne();

  return h('section', { class: 'werkzeug sim', id: 'werkzeug-simulator-flaeche', 'aria-labelledby': 'sim-titel', 'data-pruef': 'simulator' },
    h('h2', { class: 'lern-abschnitt-titel', id: 'sim-titel' }, S.name),
    h('p', { class: 'kapitel-einstieg' }, S.einstieg),
    h('div', { class: 'sim-raster' },
      h('form', { class: 'sim-eingabe', 'aria-label': S.eingabe, onsubmit: (ev: Event) => ev.preventDefault() },
        regler('betragTeur', 10000, 50, S.teur),
        deckung,
        regler('terminWochen', 26, 1, S.wochen),
        h('fieldset', { class: 'sim-gruppe' }, h('legend', { class: 't-label' }, S.lage), schalter('schwelleUeberschritten'), schalter('zielkonflikt'), schalter('risikoAnnahme'), schalter('substanziell'), schalter('freigabeBeruehrt'), schalter('datenstandBenannt')),
        h('div', { class: 'sim-feld' }, h('label', { for: 'sim-status', class: 't-label' }, S.felder.status), status)),
      h('div', { class: 'sim-ausgabe' }, kurz, ergebnis)),
    h('p', { class: 'sim-hinweis' }, S.grenze));
}
