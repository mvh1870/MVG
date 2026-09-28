/*
 * Explore · Governance-Fluss-Sandbox (P8.3, E5): Ereignisse einwerfen und durch die Register laufen
 * lassen. Je Register eine Spalte mit Bedeutung und nächstem Schritt (k6.4.4-t1); jeder Eintrag zeigt
 * Kennung, Status (k6.4.4-p1) und nur die Schritte, die sein Status erlaubt. Darunter der
 * Managementbericht als Aggregation. Regeln: src/engine/sandbox.ts.
 */

import { h, ersetze } from '../h.ts';
import { anfang, bericht, erlaubtIn, REGISTER, schritt, wirf, type Ereignis, type Register, type SandboxZustand } from '../../engine/sandbox.ts';
import { W } from '../woerter.ts';

export function sandbox(): HTMLElement {
  const S = W.sandbox;
  let z: SandboxZustand = anfang();
  const meldung = h('p', { class: 'nur-sr', 'aria-live': 'polite', 'data-pruef': 'sandbox-meldung' });
  const spalten = h('div', { class: 'sandbox-spalten', 'data-pruef': 'sandbox-spalten' });
  const berichtFlaeche = h('section', { class: 'sandbox-bericht', 'aria-labelledby': 'sandbox-bericht-titel', 'data-pruef': 'sandbox-bericht' });
  let fokus: string | null = null;
  let bekannt = new Set<string>();

  const tue = (neu: SandboxZustand, naechsterFokus: string | null): void => {
    z = neu;
    fokus = naechsterFokus;
    meldung.textContent = z.meldung;
    zeichne();
  };

  const zeichne = (): void => {
    ersetze(spalten, ...(Object.keys(REGISTER) as Register[]).map((r) => {
      const eintraege = z.eintraege.filter((e) => e.register === r);
      return h('section', { class: 'sandbox-spalte', 'data-register': r, 'aria-labelledby': `sandbox-${r}`, 'data-pruef': `sandbox-${r}` },
        h('h3', { class: 'sandbox-spalte-titel', id: `sandbox-${r}` }, REGISTER[r].name),
        h('p', { class: 'sandbox-bedeutung' }, REGISTER[r].bedeutung, h('small', null, `${S.weiter}: ${REGISTER[r].weiter}`), h('small', null, `${S.rolle}: ${REGISTER[r].rolle}`)),
        eintraege.length === 0 ? h('p', { class: 'sandbox-leer' }, S.leer) : h('ul', { class: 'sandbox-liste' }, eintraege.map((e) => h('li', { class: `sandbox-eintrag${bekannt.has(e.kennung) ? '' : ' ist-neu'}`, tabindex: -1, 'data-pruef': `eintrag-${e.kennung}` },
          h('span', { class: 'id-marke' }, e.kennung),
          h('span', { class: 'sandbox-status' }, e.status),
          e.aus !== null ? h('small', { class: 'sandbox-aus' }, e.aus) : null,
          h('span', { class: 'sandbox-schritte' }, erlaubtIn(z, e).map((s) => h('button', {
            type: 'button', class: 'sandbox-schritt', 'data-pruef': `schritt-${e.kennung}-${s}`,
            onclick: () => tue(schritt(z, e.kennung, s), e.kennung),
          }, S.schritte[s])))))));
    }));
    const b = bericht(z);
    ersetze(berichtFlaeche,
      h('h3', { class: 'sandbox-spalte-titel', id: 'sandbox-bericht-titel' }, S.bericht),
      h('p', { class: 'sandbox-bedeutung' }, S.berichtText),
      b.length === 0 ? h('p', { class: 'sandbox-leer' }, S.leer) : h('dl', { class: 'sandbox-summe' }, b.map((x) => h('div', null,
        h('dt', null, REGISTER[x.register].name),
        h('dd', null, Object.entries(x.status).map(([st, n]) => `${n} ${st}`).join(' · '))))));
    // Fokus: erster verbleibender Schritt des bearbeiteten Eintrags, sonst der neu entstandene Eintrag
    // (sein erster Schritt oder der Eintrag selbst), sonst der bearbeitete Eintrag – nie ins Leere
    if (fokus !== null) {
      const neuer = z.eintraege.find((e) => !bekannt.has(e.kennung) && e.kennung !== fokus)?.kennung ?? null;
      const eintrag = (k: string | null): HTMLElement | null => (k === null ? null : spalten.querySelector<HTMLElement>(`[data-pruef="eintrag-${k}"]`));
      const ziel = eintrag(fokus)?.querySelector<HTMLElement>('.sandbox-schritt') ?? eintrag(neuer)?.querySelector<HTMLElement>('.sandbox-schritt') ?? eintrag(neuer) ?? eintrag(fokus);
      ziel?.focus();
    }
    bekannt = new Set(z.eintraege.map((e) => e.kennung));
  };

  const einwurf = (e: Ereignis): HTMLElement => h('button', { type: 'button', class: 'sandbox-einwurf', 'data-pruef': `einwurf-${e}`, onclick: () => tue(wirf(z, e), null) }, S.einwurf[e]);
  zeichne();

  return h('section', { class: 'werkzeug sandbox', id: 'werkzeug-sandbox-flaeche', 'aria-labelledby': 'sandbox-titel', 'data-pruef': 'sandbox' },
    h('h2', { class: 'lern-abschnitt-titel', id: 'sandbox-titel' }, S.name),
    h('p', { class: 'kapitel-einstieg' }, S.einstieg),
    h('div', { class: 'sandbox-einwuerfe', role: 'group', 'aria-label': S.einwerfen },
      einwurf('fruehwarnung'), einwurf('problem'), einwurf('aenderung'), einwurf('schwelle'),
      h('button', { type: 'button', class: 'sandbox-einwurf ist-leise', 'data-pruef': 'sandbox-neu', onclick: () => tue(anfang(), null) }, S.neu)),
    meldung, spalten, berichtFlaeche,
    h('p', { class: 'sim-hinweis' }, S.grenze));
}
