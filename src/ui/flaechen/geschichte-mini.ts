/*
 * Mini-Registry, Teil Darstellung (P19.1, L-270): je Mini-Art der Baustein der Seite – Aufgabenkörper, Zeile „Stand“,
 * Eingriffe der Regie und (wo die Art eine hat) die Papierfassung. Der Rahmen eines Mini-Schritts (Kopf, Aufgabe,
 * Stand-Zeile, „Noch einmal“, „Das steckt dahinter“) steht einmal in `geschichte.ts` (`miniSchritt`), die Regie-Zeile
 * (Titel, „Auflösen“, „Zurücksetzen“) in `regie.ts`; beide fragen nur diese Tabelle. Kern der Arten (Zug, Auswertung,
 * Lösung, Übersetzer-Prüfung): `src/geschichte/mini-arten.ts`.
 */

import type { Mini, MiniArt, Kapitel, Geschichte } from '../../geschichte/typen.ts';
import { gemischt, klickeReihe, ordneZu, werteMiniAus, type MiniAuswertung, type Stand } from '../../geschichte/engine.ts';
import type { Figur } from '../../grafik/figuren.ts';
import { ersteWorte, nurText } from '../../regie/eingriffe.ts';
import { h, type Kind } from '../h.ts';
import { inhaltInline } from '../bausteine/inhalt.ts';
import { sym } from '../bausteine/bloecke.ts';
import { W } from '../woerter.ts';
import { bildnis, gegenstand } from './geschichte-teile.ts';
import type { SchrittOptionen } from './geschichte.ts';

const w = W.geschichte;
const wr = W.regie;

/** Was die Regie einem Baustein mitgibt: die Aufgabe, ihren Zustand und wie ein neuer Stand gesetzt wird. */
export interface MiniRegieKontext {
  g: Geschichte;
  k: Kapitel;
  m: Mini;
  stand: Stand;
  aus: MiniAuswertung;
  setze(neu: Stand): void;
}

export interface MiniBaustein {
  /** Aufgabenkörper des Schritts (Karten, Wahlen, Ablagen); bedienbar oder nicht (Leinwand) je nach `o.bedienbar` */
  zeichne(o: SchrittOptionen, k: Kapitel, m: Mini): HTMLElement;
  /** Text der Zeile „Stand“ unter der Aufgabe (leer = nichts) */
  standZeile(antworten: readonly number[] | undefined, m: Mini, aus: MiniAuswertung): string;
  /** Körper der Regie-Eingriffe (ohne Titelzeile und ohne „Auflösen/Zurücksetzen“) */
  regie(c: MiniRegieKontext): Node[];
  /** Papierfassung der Aufgabe im Druckbogen (Zustand, nie die Wertung; null/fehlt = nichts) */
  druck?(g: Geschichte, k: Kapitel, m: Mini, antworten: readonly number[] | undefined): Node[] | null;
}

function zeichneZuordnen(o: SchrittOptionen, k: Kapitel, m: Mini): HTMLElement {
  const antworten = o.stand.mini[k.id];
  const aus = werteMiniAus(m, antworten);
  // Ablagen (z. B. „zu Recht geschlossen“ · „übergeben“): wo die Wahlen ein Bild haben, oben je Ablage Bild und Zahl der Karten
  const ablagen = m.wahlen.some((x) => x.bild !== null)
    ? h('ul', { class: 'gs-mini-ablagen', 'data-pruef': 'mini-ablagen' }, m.wahlen.map((x, j) => {
      const n = m.posten.filter((_, i) => (antworten?.[i] ?? -1) === j).length;
      return h('li', { class: 'gs-mini-ablage', 'data-pruef': `ablage-${x.id}` }, gegenstand(x.bild, 56, 'gs-gegenstand gs-mini-ablage-bild'),
        h('span', null, h('b', null, x.titel), h('span', { class: 'gs-mini-ablage-zahl' }, w.miniKarten(n))));
    }))
    : null;
  const liste = h('ol', { class: 'gs-mini-liste gs-mini-zuordnen', 'data-wahlen': m.wahlen.length },
    m.posten.map((p, i) => {
      const gewaehlt = antworten?.[i] ?? -1;
      const lage = aus.je[i] ?? 'offen';
      const loesung = m.wahlen.find((x) => x.id === p.loesung);
      const falsch = gewaehlt >= 0 ? m.wahlen[gewaehlt] ?? null : null;
      return h('li', { class: 'gs-mini-posten', 'data-lage': lage, 'data-pruef': `posten-${i + 1}` },
        h('div', { class: 'gs-mini-karte' }, gegenstand(p.bild, 48, 'gs-gegenstand gs-mini-posten-bild'), h('p', { class: 'gs-mini-text', id: `gs-posten-${k.id}-${i}` }, inhaltInline(p.html))),
        h('div', { class: 'gs-mini-wahlen', role: 'group', 'aria-labelledby': `gs-posten-${k.id}-${i}` },
          m.wahlen.map((x, j) => {
            const an = gewaehlt === j;
            const kinder: Kind[] = [x.figur !== null ? bildnis(x.figur as Figur, 32) : null, h('span', null, x.titel)];
            return o.bedienbar
              ? h('button', { type: 'button', class: 'gs-mini-wahl', 'aria-pressed': an ? 'true' : 'false', 'data-pruef': `wahl-${i + 1}-${x.id}`, onclick: () => o.tue(ordneZu(o.g, o.stand, k.id, i, j)) }, kinder)
              : h('span', { class: 'gs-mini-wahl', 'aria-pressed': an ? 'true' : 'false' }, kinder);
          })),
        lage === 'offen' ? null : h('p', { class: 'gs-mini-rueck', 'data-pruef': `rueck-${i + 1}` },
          h('b', null, lage === 'richtig' ? [sym('haken'), w.miniRichtig] : w.miniFalsch(loesung?.titel ?? '')), ' ',
          lage === 'falsch' && falsch?.falschHtml ? [inhaltInline(falsch.falschHtml), ' '] : null,
          inhaltInline(p.erklaerungHtml)));
    }));
  // R75: kurze Bedeutung je Wahl als Legende über den Karten – lösbar ohne Fachwissen
  const legende = m.wahlen.some((x) => x.heisstHtml !== null)
    ? h('dl', { class: 'gs-mini-legende', 'data-pruef': 'mini-legende' }, m.wahlen.filter((x) => x.heisstHtml !== null).map((x) => h('div', null, h('dt', null, x.titel), h('dd', null, inhaltInline(x.heisstHtml ?? '')))))
    : null;
  if (ablagen === null) return legende === null ? liste : h('div', { class: 'gs-mini-zuordnen-mit-legende' }, legende, liste);
  return h('div', { class: 'gs-mini-zuordnen-mit-ablagen' }, legende, ablagen, liste);
}

function zeichneReihe(o: SchrittOptionen, k: Kapitel, m: Mini): HTMLElement {
  const folge = o.stand.mini[k.id] ?? [];
  const aus = werteMiniAus(m, folge);
  // fertig: die Karten stehen in der richtigen Reihenfolge, verbunden zu einem Pfad (Drehbuch Abschnitt 7)
  const ordnung = aus.fertig ? m.posten.map((_, i) => i) : gemischt(m.posten.length);
  return h('ol', { class: `gs-mini-liste gs-mini-reihe${aus.fertig ? ' ist-pfad' : ''}`, 'data-pruef': 'mini-reihe' },
    ordnung.map((i) => {
      const p = m.posten[i];
      const stelle = folge.indexOf(i);
      const lage = aus.fertig ? aus.je[i] ?? 'offen' : 'offen';
      const kinder: Kind[] = [
        h('span', { class: 'gs-reihe-nr', 'aria-hidden': stelle < 0 ? 'true' : null }, stelle < 0 ? '' : String(stelle + 1)),
        gegenstand(p?.bild ?? null, 44, 'gs-gegenstand gs-mini-posten-bild'),
        h('span', { class: 'gs-reihe-text' }, inhaltInline(p?.html ?? '')),
        stelle >= 0 ? h('span', { class: 'nur-sr' }, `, ${w.miniStelle(stelle + 1)}`) : null,
      ];
      return h('li', { class: 'gs-mini-posten', 'data-lage': lage, 'data-pruef': `posten-${i + 1}` },
        o.bedienbar
          ? h('button', { type: 'button', class: 'gs-reihe-knopf', 'aria-pressed': stelle >= 0 ? 'true' : 'false', 'data-pruef': `reihe-${i + 1}`, onclick: () => o.tue(klickeReihe(o.g, o.stand, k.id, i)) }, kinder)
          : h('span', { class: 'gs-reihe-knopf', 'aria-pressed': stelle >= 0 ? 'true' : 'false' }, kinder),
        aus.fertig ? h('p', { class: 'gs-mini-rueck', 'data-pruef': `rueck-${i + 1}` },
          h('b', null, lage === 'richtig' ? [sym('haken'), w.miniRichtig] : w.miniGehoert(i + 1)), ' ', inhaltInline(p?.erklaerungHtml ?? '')) : null);
    }));
}

/* ------------------------------------------------------------------- Regie -- */

function regieZuordnen(c: MiniRegieKontext): Node[] {
  const { g, k, m, stand, aus, setze } = c;
  const antworten = stand.mini[k.id];
  return [h('ol', { class: 'regie-mini' }, m.posten.map((p, i) => {
    const gewaehlt = antworten?.[i] ?? -1;
    return h('li', { class: 'regie-mini-posten', 'data-lage': aus.je[i] ?? 'offen' },
      h('span', { class: 'regie-mini-text', id: `regie-posten-${i}`, title: nurText(p.html) }, `${i + 1} · ${ersteWorte(p.html, 8)}`),
      h('span', { class: 'regie-stufen', role: 'group', 'aria-labelledby': `regie-posten-${i}` }, m.wahlen.map((x, j) => h('button', {
        type: 'button', class: `regie-chip regie-chip-klein${x.id === p.loesung ? ' ist-loesung' : ''}`, 'aria-pressed': gewaehlt === j ? 'true' : 'false',
        'data-pruef': `regie-mini-${i + 1}-${x.id}`, onclick: () => setze(ordneZu(g, stand, k.id, i, j)),
      }, x.titel, x.id === p.loesung ? h('span', { class: 'regie-loesung', 'aria-hidden': 'true' }, ' ✓') : null, x.id === p.loesung ? h('span', { class: 'nur-sr' }, ` (${wr.miniLoesung})`) : null))));
  }))];
}

function regieReihe(c: MiniRegieKontext): Node[] {
  const { g, k, m, stand, aus, setze } = c;
  const folge = stand.mini[k.id] ?? [];
  return [h('p', { class: 'regie-leise' }, wr.miniReiheHinweis),
    h('ol', { class: 'regie-mini regie-mini-reihe' }, gemischt(m.posten.length).map((i) => {
      const p = m.posten[i];
      const stelle = folge.indexOf(i);
      return h('li', { class: 'regie-mini-posten', 'data-lage': aus.fertig ? aus.je[i] ?? 'offen' : 'offen' }, h('button', {
        type: 'button', class: 'regie-chip regie-chip-klein regie-reihe', 'aria-pressed': stelle >= 0 ? 'true' : 'false', 'data-pruef': `regie-reihe-${i + 1}`,
        title: nurText(p?.html ?? ''), onclick: () => setze(klickeReihe(g, stand, k.id, i)),
      }, h('span', { class: 'regie-reihe-nr', 'aria-hidden': stelle < 0 ? 'true' : null }, stelle < 0 ? '·' : String(stelle + 1)),
      h('span', null, ersteWorte(p?.html ?? '', 8)),
      h('span', { class: 'regie-loesung' }, ` (${wr.miniLoesung}: ${i + 1})`)));
    }))];
}

/* ------------------------------------------------------------ Stand-Zeile -- */

// Zuordnen gibt je Posten sofort Rückmeldung
function standZuordnen(_a: readonly number[] | undefined, m: Mini, aus: MiniAuswertung): string {
  const offen = aus.je.filter((x) => x === 'offen').length;
  return offen === m.posten.length ? '' : offen > 0 ? `${w.miniErgebnis(aus.richtig, m.posten.length - offen)} ${w.miniNoch(offen)}` : w.miniErgebnis(aus.richtig, m.posten.length);
}

// die Reihenfolge erst, wenn alle Schritte angeklickt sind
function standReihe(a: readonly number[] | undefined, m: Mini, aus: MiniAuswertung): string {
  if (aus.fertig) return w.miniErgebnis(aus.richtig, m.posten.length);
  return (a?.length ?? 0) > 0 ? w.miniGesetzt(a?.length ?? 0, m.posten.length) : '';
}

/**
 * Die Tabelle der Bausteine. Eine neue Art: Eintrag hier (Zeichnung, Stand-Zeile, Regie, optional `druck`), dazu der
 * Eintrag in `MINI_ARTEN` (`src/geschichte/mini-arten.ts`); der Typ `Record<MiniArt, …>` verlangt beide.
 */
export const MINI_BAUSTEINE: Record<MiniArt, MiniBaustein> = {
  zuordnen: { zeichne: zeichneZuordnen, standZeile: standZuordnen, regie: regieZuordnen },
  reihenfolge: { zeichne: zeichneReihe, standZeile: standReihe, regie: regieReihe },
};

export function miniBaustein(art: MiniArt): MiniBaustein {
  return MINI_BAUSTEINE[art];
}
