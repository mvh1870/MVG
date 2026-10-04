/*
 * Mini-Registry, Teil Darstellung (P19.1, L-270): je Mini-Art der Baustein der Seite – Aufgabenkörper, Zeile „Stand“,
 * Eingriffe der Regie und (wo die Art eine hat) die Papierfassung. Der Rahmen eines Mini-Schritts (Kopf, Aufgabe,
 * Stand-Zeile, „Noch einmal“, „Das steckt dahinter“) steht einmal in `geschichte.ts` (`miniSchritt`), die Regie-Zeile
 * (Titel, „Auflösen“, „Zurücksetzen“) in `regie.ts`; beide fragen nur diese Tabelle. Kern der Arten (Zug, Auswertung,
 * Lösung, Übersetzer-Prüfung): `src/geschichte/mini-arten.ts`.
 */

import type { Mini, MiniArt, MiniPosten, Kapitel, Geschichte } from '../../geschichte/typen.ts';
import { gemischt, klickeReihe, miniZug, ordneZu, werteMiniAus, type MiniAuswertung, type Stand } from '../../geschichte/engine.ts';
import type { Figur } from '../../grafik/figuren.ts';
import { miniMatrixBild } from '../../grafik/werkzeug-bilder.ts';
import { ersteWorte, nurText } from '../../regie/eingriffe.ts';
import { h, type Kind } from '../h.ts';
import { inhaltInline } from '../bausteine/inhalt.ts';
import { sym } from '../bausteine/bloecke.ts';
import { W } from '../woerter.ts';
import { bildAus, bildnis, gegenstand } from './geschichte-teile.ts';
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
        'data-pruef': `regie-mini-${i + 1}-${x.id}`, onclick: () => setze(miniZug(g, stand, k.id, i, j)),
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


/* --------------------------------- neue Arten (P19.5, docs/drehbuch-v2/04-rahmen.md 7.8) -- */

/**
 * Rückmeldung nach der Wahl, für alle fünf neuen Arten gleich gebaut: „Stimmt.“ bzw. „Nicht ganz.“ und die Erklärung der Karte (sie nennt
 * bei „Nicht ganz“ die Lösung in ihrem Satz). Keine Punkte, kein „n von m“, kein „Richtig“, keine Ampel (O-8, O-46).
 */
function rueckmeldung(lage: 'richtig' | 'falsch', erklaerungHtml: string, i: number): HTMLElement {
  return h('p', { class: 'gs-mini-rueck', 'data-pruef': `rueck-${i + 1}` },
    h('b', null, lage === 'richtig' ? [sym('haken'), w.miniStimmt] : w.miniNichtGanz), ' ', inhaltInline(erklaerungHtml));
}

/** Der Schlusssatz der Art – erst, wenn die Aufgabe abgeschlossen ist; aus den Lösungen, nie aus den Wahlen (immer derselbe Text). */
function schlussSatz(m: Mini, aus: MiniAuswertung): HTMLElement | null {
  return aus.fertig && m.schlussHtml !== undefined ? h('p', { class: 'gs-mini-schluss', tabindex: -1, 'data-pruef': 'mini-schluss' }, inhaltInline(m.schlussHtml)) : null;
}

/** Eine Wahl als Knopf (bedienbar) oder als stummes Feld (Leinwand): gedrückt = gewählt. */
function wahlKnopf(o: SchrittOptionen, text: Kind, an: boolean, pruef: string, tue: () => void, aus = false): HTMLElement {
  return o.bedienbar
    ? h('button', { type: 'button', class: 'gs-mini-wahl', 'aria-pressed': an ? 'true' : 'false', disabled: aus, 'data-pruef': pruef, onclick: tue }, h('span', null, text))
    : h('span', { class: 'gs-mini-wahl', 'aria-pressed': an ? 'true' : 'false' }, h('span', null, text));
}

const STUFE_WORT = ['sehr gering', 'gering', 'mittel', 'hoch', 'sehr hoch'];

/** Kopf der Karte je Art: Matrix mit markiertem Feld, Haftzettel der Mappe oder Faden der Pinnwand. */
function kartenKopf(art: MiniArt, m: Mini, p: MiniPosten, k: Kapitel, i: number, lage: string, gewaehlt: number): HTMLElement {
  const text = h('p', { class: 'gs-mini-text', id: `gs-posten-${k.id}-${i}` }, inhaltInline(p.html));
  if (art === 'matrix' && p.feld !== undefined) {
    const [wa, au] = p.feld;
    const beschreibung = `${W.geschichte.miniMatrixFeld(STUFE_WORT[wa - 1] ?? '', STUFE_WORT[au - 1] ?? '')}`;
    return h('div', { class: 'gs-mini-karte gs-mini-zettel', 'data-pruef': `matrix-feld-${i + 1}` },
      h('span', { class: 'gs-mini-matrix', 'aria-hidden': 'true' }, bildAus(miniMatrixBild({ feld: { w: wa, a: au }, bis: null, nachObenOffen: false }, beschreibung, 88), 'gs-mini-matrix-bild')),
      h('span', { class: 'nur-sr' }, `${beschreibung}. `), text);
  }
  if (art === 'pinnwand') {
    const name = (id: string): string => m.zettel?.find((z) => z.id === id)?.html ?? id;
    const nach = p.nach ?? [];
    // der Faden zeigt nach der Wahl die Lösung – als Wort und als Linienart, nie nur als Farbe
    const faden = gewaehlt >= 0 ? p.loesung : 'offen';
    return h('div', { class: 'gs-mini-karte gs-mini-faden', 'data-faden': faden, 'data-lage': lage, 'data-pruef': `faden-${i + 1}` },
      text,
      h('p', { class: 'gs-faden-zeile' },
        h('span', { class: 'gs-zettel gs-zettel-klein' }, inhaltInline(name(p.von ?? ''))),
        h('span', { class: 'gs-faden-linie', 'aria-hidden': 'true' }),
        nach.length > 0 ? h('span', { class: 'gs-faden-ziele' }, nach.map((id) => h('span', { class: 'gs-zettel gs-zettel-klein' }, inhaltInline(name(id)))))
          : h('span', { class: 'gs-faden-ende' }, w.miniFaden['keinZiel'] ?? ''),
        gewaehlt >= 0 ? h('b', { class: 'gs-faden-wort' }, w.miniFaden[p.loesung] ?? '') : null));
  }
  return h('div', { class: art === 'mappe' ? 'gs-mini-karte gs-mini-haftzettel' : 'gs-mini-karte' }, text);
}

/**
 * Matrix, Mappe und Pinnwand: je Karte zwei bzw. drei feste Wahlen, die Rückmeldung kommt sofort (Zug und Auswertung wie bei der
 * Zuordnung). Die Arten unterscheiden sich in der Karte (Matrixfeld, Haftzettel, Faden) und im Schlusssatz.
 */
function zeichneKartenwahl(o: SchrittOptionen, k: Kapitel, m: Mini): HTMLElement {
  const antworten = o.stand.mini[k.id];
  const aus = werteMiniAus(m, antworten);
  const wand = m.art === 'pinnwand' && m.zettel !== undefined
    ? h('ul', { class: 'gs-zettel-wand', 'aria-label': w.miniZettel, 'data-pruef': 'zettel-wand' }, m.zettel.map((z) => h('li', { class: 'gs-zettel', 'data-zettel': z.id }, inhaltInline(z.html))))
    : null;
  const liste = h('ol', { class: `gs-mini-liste gs-mini-karten gs-mini-${m.art}`, 'data-wahlen': m.wahlen.length, 'data-pruef': `mini-${m.art}` },
    m.posten.map((p, i) => {
      const gewaehlt = antworten?.[i] ?? -1;
      const lage = aus.je[i] ?? 'offen';
      return h('li', { class: 'gs-mini-posten', 'data-lage': lage, 'data-pruef': `posten-${i + 1}` },
        kartenKopf(m.art, m, p, k, i, lage, gewaehlt),
        h('div', { class: 'gs-mini-wahlen', role: 'group', 'aria-labelledby': `gs-posten-${k.id}-${i}` },
          m.wahlen.map((x, j) => wahlKnopf(o, x.titel, gewaehlt === j, `wahl-${i + 1}-${x.id}`, () => o.tue(miniZug(o.g, o.stand, k.id, i, j))))),
        lage === 'richtig' || lage === 'falsch' ? rueckmeldung(lage, p.erklaerungHtml, i) : null);
    }));
  return h('div', { class: 'gs-mini-karten-mit-schluss' }, wand, liste, schlussSatz(m, aus));
}

/**
 * Bericht gegenlesen (P19.5): Mehrfachauswahl – gesetzt wird nur „nachfordern“, ungesetzt gilt „in Ordnung“; eine Prüfung für alle Zeilen,
 * danach je Zeile ein Satz und der Schlusssatz. Nach der Prüfung ist die Auswahl gesperrt (bis „Noch einmal“).
 */
function zeichneBericht(o: SchrittOptionen, k: Kapitel, m: Mini): HTMLElement {
  const antworten = o.stand.mini[k.id] ?? [];
  const n = m.posten.length;
  const aus = werteMiniAus(m, antworten);
  const geprueft = antworten.length === n + 1 && antworten[n] === 1;
  const liste = h('ol', { class: 'gs-mini-liste gs-mini-karten gs-mini-bericht', 'data-geprueft': geprueft ? 'true' : 'false', 'data-pruef': 'mini-bericht' },
    m.posten.map((p, i) => {
      const gesetzt = antworten[i] === 1;
      const lage = aus.je[i] ?? 'offen';
      return h('li', { class: 'gs-mini-posten', 'data-lage': lage, 'data-gesetzt': gesetzt ? 'true' : 'false', 'data-pruef': `posten-${i + 1}` },
        h('div', { class: 'gs-mini-karte' }, h('p', { class: 'gs-mini-text', id: `gs-posten-${k.id}-${i}` }, inhaltInline(p.html))),
        h('div', { class: 'gs-mini-wahlen', role: 'group', 'aria-labelledby': `gs-posten-${k.id}-${i}` },
          wahlKnopf(o, w.miniNachfordern, gesetzt, `wahl-${i + 1}-nachfordern`, () => o.tue(miniZug(o.g, o.stand, k.id, i)), geprueft),
          geprueft && !gesetzt ? h('span', { class: 'gs-mini-ok' }, w.miniInOrdnung) : null),
        lage === 'richtig' || lage === 'falsch' ? rueckmeldung(lage, p.erklaerungHtml, i) : null);
    }));
  const pruefen = o.bedienbar && !geprueft
    ? h('p', { class: 'gs-mini-pruefen' }, h('button', { type: 'button', class: 'gs-knopf', 'data-pruef': 'mini-pruefen', onclick: () => o.tue(miniZug(o.g, o.stand, k.id, n)) }, sym('haken'), w.miniPruefen))
    : null;
  return h('div', { class: 'gs-mini-karten-mit-schluss' }, liste, pruefen, schlussSatz(m, aus));
}

/**
 * Rückfragen im Entscheidungsfenster (P19.5, „Wer weiß was?“): zwei von vier Gesprächen; das Gespräch erscheint nach der Wahl – ohne
 * „Stimmt“ und ohne „Nicht ganz“, es gibt kein Richtig oder Falsch. Die Gespräche stehen in `.gs-gespraech` (zählen nicht zur Lesezeit).
 */
function zeichneRueckfragen(o: SchrittOptionen, k: Kapitel, m: Mini): HTMLElement {
  const antworten = o.stand.mini[k.id] ?? [];
  const aus = werteMiniAus(m, antworten);
  const kontingent = m.kontingent ?? 0;
  // aufgelöst durch die Regie: alle Gespräche stehen da
  const gesperrt = antworten.length >= kontingent;
  const liste = h('ul', { class: 'gs-mini-liste gs-gespraeche', 'data-pruef': 'mini-rueckfragen' },
    m.posten.map((p, i) => {
      const gewaehlt = antworten.includes(i);
      const aus1 = !gewaehlt && gesperrt;
      return h('li', { class: 'gs-mini-posten gs-gespraech-posten', 'data-lage': aus.je[i] ?? 'offen', 'data-gesperrt': aus1 ? 'true' : 'false', 'data-pruef': `posten-${i + 1}` },
        h('div', { class: 'gs-mini-wahlen' }, wahlKnopf(o, inhaltInline(p.html), gewaehlt, `wahl-${i + 1}`, () => o.tue(miniZug(o.g, o.stand, k.id, i)), aus1)),
        gewaehlt ? h('div', { class: 'gs-gespraech', 'data-pruef': `gespraech-${i + 1}` },
          (p.gespraech ?? []).map((z) => h('p', { class: 'gs-gespraech-zeile' }, h('b', null, `${z.wer}: `), inhaltInline(z.html))),
          h('p', { class: 'gs-gespraech-fest' }, inhaltInline(p.erklaerungHtml))) : null);
    }));
  return h('div', { class: 'gs-mini-karten-mit-schluss' }, liste, eintragKarte(m, antworten), schlussSatz(m, aus));
}

/**
 * Eintrag-Kärtchen (P19.6): die Zeilen („Quelle“, „Offene Frage“ …) sind anfangs leer; jedes gewählte Gespräch füllt die Zeile, die es
 * betrifft, mit dem, was die Vertretung festhält. Ohne Kärtchen im Inhalt (`Mini.eintrag`) gibt es nichts. Es zählt nicht zur Lesezeit.
 */
function eintragKarte(m: Mini, antworten: readonly number[]): HTMLElement | null {
  const e = m.eintrag;
  if (e === undefined) return null;
  const gewaehlt = antworten.map((i) => m.posten[i]);
  return h('div', { class: 'gs-eintrag', 'data-pruef': 'mini-eintrag' },
    h('p', { class: 'gs-kicker' }, w.miniEintrag),
    e.titelHtml !== null ? h('p', { class: 'gs-eintrag-titel' }, inhaltInline(e.titelHtml)) : null,
    h('dl', null, e.zeilen.map((zeile) => {
      const p = gewaehlt.find((x) => x?.eintragZeile === zeile);
      return h('div', { 'data-gefuellt': p !== undefined ? 'true' : 'false', 'data-pruef': `eintrag-zeile` },
        h('dt', null, zeile),
        h('dd', null, p?.eintragTextHtml !== undefined ? inhaltInline(p.eintragTextHtml) : h('span', { class: 'gs-eintrag-leer' }, w.miniEintragLeer)));
    })));
}

function standRueckfragen(a: readonly number[] | undefined, m: Mini): string {
  const n = a?.length ?? 0;
  return n === 0 ? w.miniGespraeche(m.kontingent ?? 0) : w.miniGespraecheRest(Math.max(0, (m.kontingent ?? 0) - n));
}

function regieBericht(c: MiniRegieKontext): Node[] {
  const { g, k, m, stand, setze } = c;
  const n = m.posten.length;
  const antworten = stand.mini[k.id] ?? [];
  const aus = werteMiniAus(m, antworten);
  return [h('ol', { class: 'regie-mini' }, m.posten.map((p, i) => h('li', { class: 'regie-mini-posten', 'data-lage': aus.je[i] ?? 'offen' },
    h('span', { class: 'regie-mini-text', id: `regie-posten-${i}`, title: nurText(p.html) }, `${i + 1} · ${ersteWorte(p.html, 8)}`),
    h('span', { class: 'regie-stufen', role: 'group', 'aria-labelledby': `regie-posten-${i}` },
      h('button', { type: 'button', class: `regie-chip regie-chip-klein${p.loesung === 'nachfordern' ? ' ist-loesung' : ''}`, 'aria-pressed': antworten[i] === 1 ? 'true' : 'false', 'data-pruef': `regie-mini-${i + 1}-nachfordern`,
        onclick: () => setze(miniZug(g, stand, k.id, i)) }, w.miniNachfordern, p.loesung === 'nachfordern' ? h('span', { class: 'nur-sr' }, ` (${wr.miniLoesung})`) : null))))),
  h('p', { class: 'regie-zeile' }, h('button', { type: 'button', class: 'regie-chip regie-chip-klein', 'data-pruef': 'regie-mini-pruefen', onclick: () => setze(miniZug(g, stand, k.id, n)) }, sym('haken'), w.miniPruefen))];
}

function regieRueckfragen(c: MiniRegieKontext): Node[] {
  const { g, k, m, stand, setze } = c;
  const antworten = stand.mini[k.id] ?? [];
  return [h('ol', { class: 'regie-mini' }, m.posten.map((p, i) => h('li', { class: 'regie-mini-posten', 'data-lage': antworten.includes(i) ? 'gewaehlt' : 'offen' },
    h('button', { type: 'button', class: 'regie-chip regie-chip-klein', 'aria-pressed': antworten.includes(i) ? 'true' : 'false', 'data-pruef': `regie-mini-${i + 1}`, onclick: () => setze(miniZug(g, stand, k.id, i)) }, `${i + 1} · ${ersteWorte(p.html, 8)}`),
    // die Regie sieht alle Gespräche mit ihren Zeilen und dem Satz, was die Vertretung daraus festhalten würde
    h('span', { class: 'regie-gespraech', 'data-pruef': `regie-gespraech-${i + 1}` },
      (p.gespraech ?? []).map((z) => h('span', { class: 'regie-leise' }, `${z.wer}: ${nurText(z.html)} `)),
      h('b', null, ` ${nurText(p.erklaerungHtml)}`)))))];
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
/** Die neuen Arten melden ohne Zählwörter: keine Stand-Zeile (Rückfragen sagt, wie viele Gespräche noch möglich sind). */
const keineStandZeile = (): string => '';

export const MINI_BAUSTEINE: Record<MiniArt, MiniBaustein> = {
  zuordnen: { zeichne: zeichneZuordnen, standZeile: standZuordnen, regie: regieZuordnen },
  reihenfolge: { zeichne: zeichneReihe, standZeile: standReihe, regie: regieReihe },
  matrix: { zeichne: zeichneKartenwahl, standZeile: keineStandZeile, regie: regieZuordnen },
  mappe: { zeichne: zeichneKartenwahl, standZeile: keineStandZeile, regie: regieZuordnen },
  pinnwand: { zeichne: zeichneKartenwahl, standZeile: keineStandZeile, regie: regieZuordnen },
  bericht: { zeichne: zeichneBericht, standZeile: keineStandZeile, regie: regieBericht },
  rueckfragen: { zeichne: zeichneRueckfragen, standZeile: (a, m) => standRueckfragen(a, m), regie: regieRueckfragen },
};

export function miniBaustein(art: MiniArt): MiniBaustein {
  return MINI_BAUSTEINE[art];
}
