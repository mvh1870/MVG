/*
 * D · Monatsbericht-Baukasten (P18.4, O-59; Konzept docs/WERKZEUGE-P18.md D): wenige Felder links, rechts die Vorschau
 * der Seite mit Seitenmesser; jede Eingabe prüft sofort (Ampel ohne Entscheidungsfrage, offene Entscheidung ohne wer und
 * bis wann, „keine“ statt leer …). Gedruckt wird nur der Bericht, nie die Hinweise (E-12). Unpersönlich (L-254).
 * Rechnung: src/werkzeuge/monatsbericht.ts (Feldgrenzen dort, damit der Höchstfall auf eine Seite passt).
 */
import type { MonatsberichtTeil } from '../../../inhalte/typen.ts';
import {
  AMPELN, FELDGRENZEN, leseStandBericht, pruefeBericht, type AmpelId, type Bericht, type BerichtEintrag, type Farbe, type OffeneEntscheidung,
} from '../../../werkzeuge/monatsbericht.ts';
import type { Ampel, Hinweis } from '../../../werkzeuge/gemeinsam.ts';
import { seitenmesserBild } from '../../../grafik/werkzeug-bilder.ts';
import { h, ersetze, vonHtml } from '../../h.ts';
import { inhalt } from '../../bausteine/inhalt.ts';
import { sym } from '../../bausteine/bloecke.ts';
import { ampelAnzeige, beispielWahl, druckKnopf, E, ergebnisBild, karte, knopf, mitFokus, optionen, textFeld, type WerkzeugOptionen } from './gemeinsam.ts';

interface Eintrag { text: string; kennung: string; dringlich: boolean; stand: 'umgesetzt' | 'wirksam' | null }
interface Entscheidung { id: string; frage: string; stelle: string; bis: string; kennung: string }
interface AmpelZ { farbe: Farbe; satz: string; gehoertZu: string; reaktion: string }
interface Zustand {
  beispiel: string | null;
  monat: string;
  datenstand: string;
  lage: string;
  ampeln: Record<AmpelId, AmpelZ>;
  abschnitte: Record<string, Eintrag[] | 'keine'>;
  entscheidungen: Entscheidung[] | 'keine';
  reaktion: string;
  naechste: number;
}

const FARBEN: readonly Farbe[] = ['gruen', 'gelb', 'rot'];
const NICHTS = 'nichts';
const REAKTION = 'reaktion';
const ERGEBNIS_BILD: Record<Ampel, 'stempel' | 'notizzettel' | 'warnschild'> = { gruen: 'stempel', gelb: 'notizzettel', rot: 'warnschild' };

function ausBeispiel(v: MonatsberichtTeil, id: string | null): Zustand {
  const b = v.beispiele.find((x) => x.id === id);
  const leer = (): AmpelZ => ({ farbe: 'gruen', satz: '', gehoertZu: NICHTS, reaktion: '' });
  if (b === undefined) {
    return { beispiel: null, monat: '', datenstand: '', lage: '', ampeln: { kosten: leer(), termine: leer(), qualitaet: leer() },
      abschnitte: Object.fromEntries(v.abschnitte.map((a) => [a.id, 'keine'])), entscheidungen: 'keine', reaktion: '', naechste: 1 };
  }
  const entscheidungen = b.entscheidungen === 'keine' ? 'keine' as const : b.entscheidungen.map((e, i) => ({ ...e, id: `e${i + 1}` }));
  return {
    beispiel: b.id, monat: b.monat, datenstand: b.datenstand, lage: b.lage,
    ampeln: Object.fromEntries(AMPELN.map((a) => [a, { farbe: b.ampeln[a].farbe, satz: b.ampeln[a].satz, gehoertZu: b.ampeln[a].reaktion !== null ? REAKTION : NICHTS, reaktion: b.ampeln[a].reaktion ?? '' }])) as Record<AmpelId, AmpelZ>,
    abschnitte: Object.fromEntries(v.abschnitte.map((a) => {
      const x = b.eintraege[a.id];
      return [a.id, x === undefined || x === 'keine' ? 'keine' : x.map((e) => ({ ...e, dringlich: false, stand: null }))];
    })),
    entscheidungen, reaktion: b.reaktion, naechste: (entscheidungen === 'keine' ? 0 : entscheidungen.length) + 1,
  };
}

function bericht(z: Zustand): Bericht {
  const eintrag = (e: Eintrag): BerichtEintrag => ({ text: e.text, kennung: e.kennung, ...(e.dringlich ? { dringlich: true } : {}), ...(e.stand !== null ? { stand: e.stand } : {}) });
  return {
    monat: z.monat, datenstand: z.datenstand, lage: z.lage, reaktion: z.reaktion,
    ampeln: Object.fromEntries(AMPELN.map((id) => {
      const a = z.ampeln[id];
      const gehoertZu = a.gehoertZu === NICHTS ? null : a.gehoertZu === REAKTION ? { reaktion: a.reaktion } : { entscheidung: a.gehoertZu };
      return [id, { farbe: a.farbe, satz: a.satz, gehoertZu }];
    })) as Bericht['ampeln'],
    abschnitte: Object.fromEntries(Object.entries(z.abschnitte).map(([k, x]) => [k, x === 'keine' ? 'keine' : x.map(eintrag)])),
    entscheidungen: z.entscheidungen === 'keine' ? 'keine' : z.entscheidungen.map((e): OffeneEntscheidung => ({ ...e })),
  };
}

export function monatsbericht(o: WerkzeugOptionen): HTMLElement {
  const v = o.w.monatsbericht;
  const stand = o.stand !== null ? leseStandBericht(`b:${o.stand.beispiel}${o.stand.schritt !== null ? `;${o.stand.schritt}` : ''}`, v.beispiele.map((b) => b.id)) : null;
  let z = ausBeispiel(v, stand?.beispiel ?? v.beispiele[0]?.id ?? null);
  // Regie-Schalter „Kosten-Ampel ohne Frage“ (Konzept D.8): die Verknüpfung der Kosten-Ampel gelöst
  if (stand?.schritt === 'w:1') z.ampeln.kosten = { ...z.ampeln.kosten, gehoertZu: NICHTS };
  const offen = new Set<string>();
  const max = Object.fromEntries(v.abschnitte.map((a) => [a.id, a.max]));

  const formOrt = h('div', { class: 'wz-form', 'data-pruef': 'mb-form' });
  const vorschauOrt = h('section', { class: 'wz-ergebnis wz-vorschau', 'aria-label': E.vorschau, 'data-pruef': 'mb-vorschau' });
  const status = h('p', { class: 'nur-sr', 'aria-live': 'polite', 'data-pruef': 'mb-status' });
  const titelAmpel = (id: AmpelId): string => v.ampeln.find((x) => x.id === id)?.titel ?? id;
  const titelAbschnitt = (id: string): string => (id === 'entscheidungen' ? v.entscheidungen.titel : v.abschnitte.find((x) => x.id === id)?.titel ?? id);
  const entscheidungsListe = (): Entscheidung[] => (z.entscheidungen === 'keine' ? [] : z.entscheidungen);
  const geaendert = (): void => zeichneVorschau();

  /* ------------------------------------------------------------ Eingaben -- */
  const ampelFeld = (id: AmpelId): HTMLElement => {
    const ort = h('fieldset', { class: 'wz-gruppe wz-ampel-feld', 'data-ampel-feld': id });
    const zeichne = (): void => {
      const a = z.ampeln[id];
      const setze = (neu: Partial<AmpelZ>): void => { z.ampeln[id] = { ...z.ampeln[id], ...neu }; geaendert(); };
      const wahl = [{ wert: NICHTS, titel: E.nichts }, { wert: REAKTION, titel: E.reaktionWahl }, ...entscheidungsListe().map((e, i) => ({ wert: e.id, titel: E.entscheidungWahl(i + 1) }))];
      ersetze(ort,
        h('legend', { class: 'wz-gruppe-titel' }, titelAmpel(id)),
        optionen<Farbe>({ bedienbar: true, name: `mb-farbe-${id}`, legende: E.ampelFarbe(titelAmpel(id)), wahl: FARBEN.map((f) => ({ wert: f, titel: v.farben[f] })), gewaehlt: a.farbe, beiWahl: (f) => setze({ farbe: f }), klasse: 'wz-farben' }),
        textFeld({ name: `mb-satz-${id}`, titel: E.ampelSatz(titelAmpel(id)), wert: a.satz, max: FELDGRENZEN.ampelSatz, beiEingabe: (t) => setze({ satz: t }) }),
        h('label', { class: 'wz-feld' }, h('span', { class: 't-label' }, E.gehoertZu(titelAmpel(id))),
          h('select', { 'data-pruef': `mb-gehoert-${id}`, onchange: (e: Event) => { setze({ gehoertZu: (e.target as HTMLSelectElement).value }); mitFokus(ort, zeichne); } },
            wahl.map((x) => h('option', { value: x.wert, selected: x.wert === a.gehoertZu }, x.titel)))),
        a.gehoertZu === REAKTION ? textFeld({ name: `mb-reaktion-${id}`, titel: E.reaktionText(titelAmpel(id)), wert: a.reaktion, max: FELDGRENZEN.ampelReaktion, beiEingabe: (t) => setze({ reaktion: t }) }) : null);
    };
    zeichne();
    return ort;
  };

  const eintragZeile = (id: string, liste: Eintrag[], e: Eintrag, i: number, neu: () => void): HTMLElement => h('li', { class: 'wz-eintrag' },
    textFeld({ name: `mb-${id}-text-${i}`, titel: E.eintragText(i + 1), wert: e.text, max: FELDGRENZEN.eintrag, beiEingabe: (t) => { liste[i] = { ...liste[i] ?? e, text: t }; geaendert(); } }),
    textFeld({ name: `mb-${id}-kennung-${i}`, titel: E.eintragKennung(i + 1), wert: e.kennung, max: FELDGRENZEN.kennung, beiEingabe: (t) => { liste[i] = { ...liste[i] ?? e, kennung: t }; geaendert(); } }),
    id === 'massnahmen' ? h('label', { class: 'wz-feld' }, h('span', { class: 't-label' }, E.eintragStand(i + 1)),
      h('select', { 'data-pruef': `mb-${id}-stand-${i}`, onchange: (ev: Event) => { const w = (ev.target as HTMLSelectElement).value; liste[i] = { ...liste[i] ?? e, stand: w === '' ? null : w as 'umgesetzt' | 'wirksam' }; geaendert(); } },
        h('option', { value: '', selected: e.stand === null }, '–'),
        (['umgesetzt', 'wirksam'] as const).map((s) => h('option', { value: s, selected: e.stand === s }, E.eintragStandWort[s])))) : null,
    h('label', { class: 'wz-wahl' }, h('input', { type: 'checkbox', 'data-pruef': `mb-${id}-dringlich-${i}`, checked: e.dringlich, onchange: (ev: Event) => { liste[i] = { ...liste[i] ?? e, dringlich: (ev.target as HTMLInputElement).checked }; geaendert(); } }), h('span', null, E.eintragDringlich(i + 1))),
    knopf({ pruef: `mb-${id}-weg-${i}`, leise: true, label: E.eintragEntfernen(i + 1), text: [sym('kreuz'), h('span', { class: 'nur-sr' }, E.entfernen)], beiKlick: () => { liste.splice(i, 1); neu(); } }));

  const abschnittFeld = (id: string): HTMLElement => {
    const ort = h('div', { class: 'wz-abschnitt-ort' });
    const zeichne = (): void => {
      const x = z.abschnitte[id] ?? 'keine';
      const liste = x === 'keine' ? [] : x;
      const summe = x === 'keine' ? E.abschnittKeine(titelAbschnitt(id)) : E.abschnittAnzahl(titelAbschnitt(id), liste.length);
      const neuZeichnen = (fokus?: string): void => { mitFokus(ort, zeichne); geaendert(); if (fokus !== undefined) (ort.querySelector(`[data-pruef="${fokus}"]`) as HTMLElement | null)?.focus(); };
      const d = h('details', { class: 'wz-gruppe wz-abschnitt', 'data-abschnitt': id, open: offen.has(id) || (x !== 'keine') },
        h('summary', { class: 'wz-gruppe-titel', 'data-pruef': `mb-${id}-summe` }, summe),
        h('label', { class: 'wz-wahl' }, h('input', { type: 'checkbox', 'data-pruef': `mb-${id}-keine`, checked: x === 'keine', onchange: (e: Event) => {
          z.abschnitte[id] = (e.target as HTMLInputElement).checked ? 'keine' : [];
          offen.add(id);
          neuZeichnen();
        } }), h('span', null, E.keine)),
        x !== 'keine' ? h('ol', { class: 'wz-eintraege' }, liste.map((e, i) => eintragZeile(id, liste, e, i, () => neuZeichnen(`mb-${id}-hinzu`)))) : null,
        x !== 'keine' && liste.length < (max[id] ?? 3) ? knopf({ pruef: `mb-${id}-hinzu`, leise: true, text: [sym('pfeilRechts'), E.eintragHinzu], beiKlick: () => {
          liste.push({ text: '', kennung: '', dringlich: false, stand: null });
          z.abschnitte[id] = liste;
          neuZeichnen(`mb-${id}-text-${liste.length - 1}`);
        } }) : null);
      d.addEventListener('toggle', () => { if ((d as HTMLDetailsElement).open) offen.add(id); else offen.delete(id); });
      ersetze(ort, d);
    };
    zeichne();
    return ort;
  };

  const entscheidungenFeld = (): HTMLElement => {
    const ort = h('div', { class: 'wz-abschnitt-ort' });
    const zeichne = (): void => {
      const x = z.entscheidungen;
      const liste = x === 'keine' ? [] : x;
      const neuZeichnen = (fokus?: string): void => {
        mitFokus(ort, zeichne);
        for (const id of AMPELN) {
          // eine gelöschte Entscheidung kann nicht mehr Ziel einer Ampel sein
          if (![NICHTS, REAKTION, ...liste.map((e) => e.id)].includes(z.ampeln[id].gehoertZu)) z.ampeln[id] = { ...z.ampeln[id], gehoertZu: NICHTS };
        }
        zeichneAmpeln();
        geaendert();
        if (fokus !== undefined) (ort.querySelector(`[data-pruef="${fokus}"]`) as HTMLElement | null)?.focus();
      };
      const feld = (e: Entscheidung, i: number, k: 'frage' | 'stelle' | 'bis' | 'kennung', titel: string, maxL: number): HTMLElement =>
        textFeld({ name: `mb-e-${k}-${i}`, titel, wert: e[k], max: maxL, beiEingabe: (t) => { liste[i] = { ...liste[i] ?? e, [k]: t }; geaendert(); } });
      const d = h('details', { class: 'wz-gruppe wz-abschnitt', 'data-abschnitt': 'entscheidungen', open: offen.has('entscheidungen') || x !== 'keine' },
        h('summary', { class: 'wz-gruppe-titel', 'data-pruef': 'mb-entscheidungen-summe' }, x === 'keine' ? E.abschnittKeine(v.entscheidungen.titel) : E.abschnittAnzahl(v.entscheidungen.titel, liste.length)),
        h('label', { class: 'wz-wahl' }, h('input', { type: 'checkbox', 'data-pruef': 'mb-entscheidungen-keine', checked: x === 'keine', onchange: (ev: Event) => {
          z.entscheidungen = (ev.target as HTMLInputElement).checked ? 'keine' : [];
          offen.add('entscheidungen');
          neuZeichnen();
        } }), h('span', null, E.keine)),
        x !== 'keine' ? h('ol', { class: 'wz-eintraege' }, liste.map((e, i) => h('li', { class: 'wz-eintrag', 'aria-label': E.entscheidungNr(i + 1) },
          feld(e, i, 'frage', `${E.entscheidungNr(i + 1)}: ${E.frage}`, FELDGRENZEN.frage),
          feld(e, i, 'stelle', E.wer, FELDGRENZEN.stelle),
          feld(e, i, 'bis', E.bisWann, FELDGRENZEN.bis),
          feld(e, i, 'kennung', E.kennung, FELDGRENZEN.kennung),
          knopf({ pruef: `mb-e-weg-${i}`, leise: true, label: E.entscheidungEntfernen(i + 1), text: [sym('kreuz'), h('span', { class: 'nur-sr' }, E.entfernen)], beiKlick: () => { liste.splice(i, 1); neuZeichnen('mb-e-hinzu'); } })))) : null,
        x !== 'keine' && liste.length < v.entscheidungen.max ? knopf({ pruef: 'mb-e-hinzu', leise: true, text: [sym('pfeilRechts'), E.entscheidungHinzu], beiKlick: () => {
          liste.push({ id: `e${z.naechste++}`, frage: '', stelle: '', bis: '', kennung: '' });
          z.entscheidungen = liste;
          neuZeichnen(`mb-e-frage-${liste.length - 1}`);
        } }) : null);
      d.addEventListener('toggle', () => { if ((d as HTMLDetailsElement).open) offen.add('entscheidungen'); else offen.delete('entscheidungen'); });
      ersetze(ort, d);
    };
    zeichne();
    return ort;
  };

  const ampelnOrt = h('div', { class: 'wz-ampeln' });
  const zeichneAmpeln = (): void => mitFokus(ampelnOrt, () => ersetze(ampelnOrt, AMPELN.map(ampelFeld)));

  const zeichneForm = (): void => {
    if (!o.bedienbar) { ersetze(formOrt); return; }
    zeichneAmpeln();
    ersetze(formOrt,
      h('div', { class: 'wz-felder' },
        textFeld({ name: 'mb-monat', titel: E.monat, wert: z.monat, max: FELDGRENZEN.monat, beiEingabe: (t) => { z.monat = t; geaendert(); } }),
        textFeld({ name: 'mb-datenstand', titel: E.datenstand, wert: z.datenstand, max: FELDGRENZEN.datenstand, beiEingabe: (t) => { z.datenstand = t; geaendert(); } })),
      textFeld({ name: 'mb-lage', titel: E.lage, wert: z.lage, max: FELDGRENZEN.lage, mehrzeilig: true, beiEingabe: (t) => { z.lage = t; geaendert(); } }),
      ampelnOrt,
      v.abschnitte.map((a) => abschnittFeld(a.id)),
      entscheidungenFeld(),
      textFeld({ name: 'mb-reaktion', titel: v.reaktion, wert: z.reaktion, max: FELDGRENZEN.reaktion, mehrzeilig: true, beiEingabe: (t) => { z.reaktion = t; geaendert(); } }));
  };

  /* -------------------------------------------------------------- Bericht -- */
  /** Der Bericht selbst – Vorschau und Druckbogen sind derselbe Inhalt (D.6); `mitTitel` nur in der Vorschau (der Bogen hat seinen Kopf). */
  const berichtEl = (mitTitel: boolean): HTMLElement => {
    const es = entscheidungsListe();
    const verweis = (a: AmpelZ): string | null => {
      if (a.gehoertZu === REAKTION) return a.reaktion.trim() !== '' ? a.reaktion : null;
      const i = es.findIndex((e) => e.id === a.gehoertZu);
      return i < 0 ? null : `${v.entscheidungen.titel}: ${es[i]?.frage ?? ''}`;
    };
    return h('article', { class: 'wz-bericht', 'data-pruef': 'mb-bericht' },
      mitTitel ? h('header', { class: 'wz-bericht-kopf' }, h('p', { class: 'wz-bericht-titel' }, E.berichtTitel(z.monat)), z.beispiel !== null ? h('p', { class: 'wz-bericht-ort' }, v.projekt) : null) : null,
      z.lage.trim() !== '' ? h('p', { class: 'wz-bericht-lage' }, z.lage) : null,
      h('ul', { class: 'wz-bericht-ampeln' }, AMPELN.map((id) => {
        const a = z.ampeln[id];
        const ziel = a.farbe === 'gruen' ? null : verweis(a);
        return h('li', { 'data-farbe': a.farbe },
          h('span', { class: 'wz-punkt', 'aria-hidden': 'true' }),
          h('b', null, `${titelAmpel(id)}: ${v.farben[a.farbe]}`), a.satz.trim() !== '' ? ` – ${a.satz}` : null,
          ziel !== null ? h('span', { class: 'wz-bericht-ziel' }, sym('pfeilRechts'), ziel) : null);
      })),
      h('div', { class: 'wz-bericht-spalten' }, v.abschnitte.map((a) => {
        const x = z.abschnitte[a.id] ?? 'keine';
        return h('section', { class: 'wz-bericht-abschnitt' }, h('h4', null, a.titel),
          x === 'keine' || x.length === 0 ? h('p', { class: 'wz-leise' }, x === 'keine' ? E.keine : '–')
            : h('ul', null, x.map((e) => h('li', null, e.text, e.kennung.trim() !== '' ? [' ', h('span', { class: 'mono' }, e.kennung)] : null, e.stand !== null ? ` · ${E.eintragStandWort[e.stand]}` : null))));
      })),
      h('section', { class: 'wz-bericht-entscheidungen' }, h('h4', null, v.entscheidungen.titel),
        es.length === 0 ? h('p', { class: 'wz-leise' }, z.entscheidungen === 'keine' ? E.keine : '–')
          : h('ul', null, es.map((e) => h('li', null, h('b', null, e.frage), ` · ${E.wer}: ${e.stelle} · ${E.bisWann}: ${e.bis}`, e.kennung.trim() !== '' ? [' ', h('span', { class: 'mono' }, e.kennung)] : null)))),
      h('section', { class: 'wz-bericht-reaktion' }, h('h4', null, v.reaktion), h('p', null, z.reaktion.trim() !== '' ? z.reaktion : '–')),
      h('footer', { class: 'wz-bericht-fuss' }, z.datenstand.trim() !== '' ? h('p', null, E.datenstandZeile(z.datenstand)) : null, h('p', null, v.fuss)));
  };

  const hinweisTitel = (x: Hinweis): string | null => {
    if (x.bezug === undefined) return null;
    if ((AMPELN as readonly string[]).includes(x.bezug)) return titelAmpel(x.bezug as AmpelId);
    const i = entscheidungsListe().findIndex((e) => e.id === x.bezug);
    return i >= 0 ? E.entscheidungNr(i + 1) : titelAbschnitt(x.bezug);
  };

  const zeichneVorschau = (): void => {
    const p = pruefeBericht(bericht(z), max);
    const wort = v.ampel[p.ampel];
    status.textContent = `${wort}${p.hinweise.length > 0 ? ` – ${E.hinweiseOffen(p.hinweise.length)}` : ''}`;
    ersetze(vorschauOrt,
      h('div', { class: 'wz-ergebnis-kopf' }, ampelAnzeige(p.ampel, wort, 'mb-ampel'), ergebnisBild(ERGEBNIS_BILD[p.ampel], 56),
        h('div', { class: 'wz-seitenmesser', 'data-pruef': 'mb-seitenmesser', 'data-passt': p.umfang.passt ? 'ja' : 'nein' }, vonHtml(seitenmesserBild(p.umfang.anteil, E.seitenanteil(p.umfang.anteil), 44)), h('span', null, E.seitenanteil(p.umfang.anteil)))),
      p.hinweise.length > 0 ? h('ul', { class: 'wz-karten', 'data-pruef': 'mb-hinweise' }, p.hinweise.map((x) => karte({ titel: hinweisTitel(x), satz: v.saetze[x.id] ?? '', schwere: x.schwere, pruef: `mb-hinweis-${x.id}` }))) : null,
      h('p', { class: 't-label' }, E.vorschau),
      h('div', { class: 'wz-blatt' }, berichtEl(true)),
      o.bedienbar ? h('div', { class: 'wz-druckzeile' },
        p.hinweise.length > 0 ? h('p', { class: 'wz-leise', 'data-pruef': 'mb-hinweise-offen' }, E.hinweiseOffen(p.hinweise.length)) : null,
        druckKnopf('monatsbericht', () => ({ titel: `${E.berichtTitel(z.monat)}${z.beispiel !== null ? ` · ${v.projekt}` : ''}`, fiktiv: z.beispiel !== null, teile: [berichtEl(false)] }))) : null);
  };

  const lade = (id: string | null): void => {
    z = ausBeispiel(v, id);
    offen.clear();
    zeichneForm();
    zeichneVorschau();
  };
  zeichneForm();
  zeichneVorschau();
  return h('div', { class: 'ex-werkzeug wz', 'data-werkzeug': 'monatsbericht' },
    h('div', { class: 'gs-text' }, inhalt(v.html)),
    h('div', { class: 'ex-leiste' }, beispielWahl({ bedienbar: o.bedienbar, pruef: 'mb-beispiel', beispiele: v.beispiele, aktiv: z.beispiel, leer: true, beiWahl: lade })),
    status,
    h('div', { class: o.bedienbar ? 'wz-raster wz-raster-bericht' : 'wz-raster wz-raster-einzeln' }, formOrt, vorschauOrt));
}
