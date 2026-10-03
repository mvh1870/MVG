/*
 * B · Vorgangs-Wegweiser (P18.3, O-59; Konzept docs/WERKZEUGE-P18.md B): wenige Ja/Nein-Fragen vom Sachverhalt zur
 * Vorgangsart, mit nächstem Schritt, dem, was festgehalten wird, „Fertig, wenn“ (wortgleich aus „Vorgangsarten und
 * Wege“) und der typischen Verwechslung. Unpersönlich (L-254). Rechnung: src/werkzeuge/wegweiser.ts.
 */
import type { WegweiserTeil } from '../../../inhalte/typen.ts';
import { leseStandWegweiser, MIT_UNKLAR, verwechslungen, wegweiser, zusaetze, type Art, type FrageId, type Wahl, type Weg, type Zusatz } from '../../../werkzeuge/wegweiser.ts';
import type { GimmickName } from '../../../grafik/figuren.ts';
import { h, ersetze } from '../../h.ts';
import { inhalt, inhaltInline } from '../../bausteine/inhalt.ts';
import { sym } from '../../bausteine/bloecke.ts';
import { beispielWahl, druckKnopf, E, ergebnisBild, knopf, mitFokus, optionen, textFeld, type WerkzeugOptionen } from './gemeinsam.ts';

/** Reihenfolge der Fragen im Baum (für das Zurücksetzen späterer Antworten). */
const REIHE: readonly FrageId[] = ['dringlich', 'handlung', 'eingetreten', 'anpassen', 'moeglich', 'arbeit', 'entscheidung'];
const AUS_KURZ: Record<string, Wahl> = { j: 'ja', n: 'nein', u: 'unklar' };

/** Gegenstand je Ergebnis (Konzept B.7). */
const BILD: Record<Art | 'kein', GimmickName> = {
  kein: 'lupe', fruehwarnung: 'notizzettel', risiko: 'matrix', problem: 'absperrband', aenderung: 'grundriss', massnahme: 'werkzeugkasten', aufgabe: 'kalender',
};
/** Zusätze als eigener Kasten (mit kleinem Gegenstand) statt als Satz unter dem Ergebnis. */
const KASTEN: Partial<Record<Zusatz, GimmickName>> = { sofort: 'telefon', entscheidung: 'waage' };

type Antworten = Partial<Record<FrageId, Wahl>>;

/** Antworten aus dem Schritt `a:j,n,u` – in der Reihenfolge, in der der Weg die Fragen stellt. */
function ausSchritt(schritt: string | null): Antworten | null {
  if (schritt === null) return null;
  const folge = schritt.slice(2).split(',').map((k) => AUS_KURZ[k]);
  let a: Antworten = {};
  for (const wahl of folge) {
    const f = wegweiser(a).naechste;
    if (f === null || wahl === undefined) break;
    a = { ...a, [f]: wahl };
  }
  return a;
}

export function wegweiserWerkzeug(o: WerkzeugOptionen): HTMLElement {
  const v: WegweiserTeil = o.w.wegweiser;
  const stand = o.stand !== null ? leseStandWegweiser(`b:${o.stand.beispiel}${o.stand.schritt !== null ? `;${o.stand.schritt}` : ''}`, v.beispiele.map((b) => b.id)) : null;
  let beispiel: string | null = stand?.beispiel ?? v.beispiele[0]?.id ?? null;
  let eigenerText = '';
  /** Ein eigener Sachverhalt beginnt leer; ein Beispiel ist mit seinen Antworten vorbelegt (O-59: alles überschreibbar), die Leinwand zeigt nur bis zum gesendeten Schritt */
  const start = (id: string | null): Antworten => (id === null ? {} : { ...(v.beispiele.find((b) => b.id === id)?.antworten ?? {}) });
  let a: Antworten = stand?.schritt != null ? ausSchritt(stand.schritt) ?? {} : start(beispiel);

  const frageText = (id: FrageId): string => v.fragen.find((f) => f.id === id)?.frage ?? id;
  const artTitel = (art: Art): string => o.w.vorgaenge.arten.find((x) => x.id === art)?.titel ?? art;

  const sachOrt = h('div', { class: 'wz-sachverhalt' });
  const pfadOrt = h('div', { class: 'wz-form', 'data-pruef': 'ww-fragen' });
  const ergebnisOrt = h('section', { class: 'wz-ergebnis', 'aria-label': E.ergebnis, 'data-pruef': 'ww-ergebnis' });
  const status = h('p', { class: 'nur-sr', 'aria-live': 'polite', 'data-pruef': 'ww-status' });

  const antworte = (f: FrageId, wahl: Wahl): void => {
    const alt = a[f];
    a = { ...a, [f]: wahl };
    // eine geänderte Antwort im Baum macht die späteren Antworten hinfällig (die Vorfrage „dringlich“ und die Entscheidung nicht)
    if (alt !== undefined && alt !== wahl && f !== 'dringlich' && f !== 'entscheidung') {
      for (const spaeter of REIHE.slice(REIHE.indexOf(f) + 1)) delete a[spaeter];
    }
    mitFokus(pfadOrt, zeichneFragen);
    zeichneErgebnis();
  };

  const frageFeld = (f: FrageId, nr: number): HTMLElement => optionen<Wahl>({
    bedienbar: o.bedienbar,
    name: `ww-${f}`,
    legende: [h('span', { class: 'wz-frage-nr', 'aria-hidden': 'true' }, a[f] !== undefined ? sym('haken') : String(nr)), frageText(f)],
    wahl: (MIT_UNKLAR.includes(f) ? (['ja', 'nein', 'unklar'] as const) : (['ja', 'nein'] as const)).map((x) => ({ wert: x, titel: E.antwort[x] })),
    gewaehlt: a[f],
    beiWahl: (x) => antworte(f, x),
    klasse: a[f] !== undefined ? 'ist-beantwortet' : 'ist-offen',
  });

  const zeichneFragen = (): void => {
    const weg = wegweiser(a);
    const gestellt = [...weg.pfad, ...(weg.naechste !== null ? [weg.naechste] : [])];
    ersetze(pfadOrt,
      h('p', { class: 'wz-gruppe-titel' }, E.pfad),
      h('ol', { class: 'wz-pfad' }, gestellt.map((f, i) => h('li', { 'data-frage': f }, frageFeld(f, i + 1)))),
      o.bedienbar && weg.pfad.length > 0 ? h('div', { class: 'wz-navi' }, knopf({ pruef: 'ww-von-vorn', leise: true, text: [sym('zurueckspulen'), E.vonVorn], beiKlick: () => {
        a = {};
        zeichneFragen();
        zeichneErgebnis();
        (pfadOrt.querySelector('input') as HTMLElement | null)?.focus();
      } })) : null);
  };

  const ergebnisTeile = (weg: Weg, links = o.bedienbar): { kopf: HTMLElement; teile: HTMLElement[] } | null => {
    if (weg.art === null && !weg.keinVorgang && !weg.nurEntscheidung) return null;
    const z = zusaetze(weg);
    const satz = (k: Zusatz): string => v.zusaetze[k].text;
    const kopf = weg.art !== null
      ? h('p', { class: 'wz-art' }, h('span', { class: 'id-marke ex-id', 'data-art': weg.art, 'data-pruef': 'ww-art' }, artTitel(weg.art)))
      : h('p', { class: 'wz-art' }, h('b', { 'data-pruef': 'ww-art' }, weg.nurEntscheidung ? v.zusaetze.entscheidung.titel : v.zusaetze.keinVorgang.titel));
    const teile: HTMLElement[] = [];
    if (weg.art !== null) {
      const e = v.ergebnisse.find((x) => x.art === weg.art);
      const art = o.w.vorgaenge.arten.find((x) => x.id === weg.art);
      teile.push(h('dl', { class: 'wz-art-daten' },
        h('div', null, h('dt', null, E.naechsterSchritt), h('dd', null, e?.schritt ?? '')),
        h('div', null, h('dt', null, E.festhalten), h('dd', null, e?.festhalten ?? '')),
        h('div', null, h('dt', null, E.fertigWenn), h('dd', null, art !== undefined ? inhaltInline(art.abschluss) : ''))));
      const vw = verwechslungen(weg.art, v.verwechslungen);
      if (vw.length > 0) teile.push(h('div', { class: 'wz-verwechslung', 'data-pruef': 'ww-verwechslung' }, h('p', { class: 't-label' }, E.verwechslung),
        h('ul', null, vw.map((id) => h('li', null, v.verwechslungen.find((x) => x.id === id)?.text ?? '')))));
    }
    const saetze = z.filter((k) => KASTEN[k] === undefined && k !== 'bewerten');
    if (saetze.length > 0) teile.push(h('ul', { class: 'wz-zusaetze' }, saetze.map((k) => h('li', { 'data-zusatz': k }, satz(k)))));
    if (z.includes('bewerten')) teile.push(h('p', { class: 'wz-verweis', 'data-zusatz': 'bewerten' }, satz('bewerten'), ' ',
      links ? h('a', { href: '#explore/risiko-grenzen', 'data-pruef': 'ww-zum-risiko' }, sym('pfeilRechts'), o.w.risikogrenzen.titel) : null));
    for (const k of z) {
      const bild = KASTEN[k];
      if (bild === undefined) continue;
      teile.push(h('div', { class: 'wz-kasten', 'data-zusatz': k, 'data-pruef': `ww-kasten-${k}` }, ergebnisBild(bild, 48),
        h('div', null, h('p', null, h('b', null, v.zusaetze[k].titel)), h('p', null, satz(k)),
          k === 'entscheidung' && links ? h('p', null, h('a', { href: '#explore/vorlagen-check', 'data-pruef': 'ww-zum-vorlagen-check' }, sym('pfeilRechts'), o.w.vorlagencheck.titel)) : null)));
    }
    return { kopf, teile };
  };

  const zeichneErgebnis = (): void => {
    const weg = wegweiser(a);
    const e = ergebnisTeile(weg);
    status.textContent = e !== null ? `${E.ergebnis}: ${weg.art !== null ? artTitel(weg.art) : weg.nurEntscheidung ? v.zusaetze.entscheidung.titel : v.zusaetze.keinVorgang.titel}` : weg.naechste !== null ? `${E.naechsteFrage}: ${frageText(weg.naechste)}` : '';
    if (e === null) {
      ersetze(ergebnisOrt, h('div', { class: 'wz-ergebnis-kopf' }, ergebnisBild('gabelung'), h('p', { class: 'wz-leise' }, weg.naechste !== null ? `${E.naechsteFrage}: ${frageText(weg.naechste)}` : '')));
      return;
    }
    ersetze(ergebnisOrt,
      h('div', { class: 'wz-ergebnis-kopf' }, e.kopf, ergebnisBild(weg.nurEntscheidung ? 'waage' : BILD[weg.art ?? 'kein'])),
      e.teile,
      weg.art !== null && o.bedienbar ? h('p', { class: 'wz-verweis' }, h('a', { href: '#explore/vorgaenge', 'data-pruef': 'ww-zur-art' }, sym('pfeilRechts'), E.mehrZurArt)) : null,
      o.bedienbar && weg.naechste === null ? druckKnopf('wegweiser', () => druck(weg)) : null);
  };

  const sachverhalt = (): { titel: string; text: string } => {
    const b = v.beispiele.find((x) => x.id === beispiel);
    return b !== undefined ? { titel: b.titel, text: b.text } : { titel: E.eigenerSachverhalt, text: eigenerText };
  };

  const druck = (weg: Weg): { titel: string; fiktiv: boolean; teile: Node[] } => {
    const s = sachverhalt();
    const e = ergebnisTeile(weg, false);
    return {
      titel: `${v.titel} · ${s.titel}`,
      fiktiv: beispiel !== null,
      teile: [
        s.text.trim() !== '' ? h('section', { class: 'druck-teil' }, h('h2', null, E.sachverhalt), h('p', null, s.text)) : null,
        h('section', { class: 'druck-teil' }, h('h2', null, E.pfad), h('ol', { class: 'wz-druck-pfad' }, weg.pfad.map((f) => h('li', null, frageText(f), ' – ', h('b', null, E.antwort[a[f] ?? 'nein']))))),
        e !== null ? h('section', { class: 'druck-teil wz-druck-ergebnis' }, h('h2', null, E.ergebnis), e.kopf, e.teile) : null,
      ].filter((x): x is HTMLElement => x !== null),
    };
  };

  const zeichneSach = (): void => {
    const b = v.beispiele.find((x) => x.id === beispiel);
    ersetze(sachOrt, b !== undefined
      ? h('p', { class: 'ex-frage', 'data-pruef': 'ww-sachverhalt' }, b.text)
      : o.bedienbar ? textFeld({ name: 'ww-eigener-text', titel: E.eigenerText, wert: eigenerText, max: 200, mehrzeilig: true, beiEingabe: (t) => { eigenerText = t; } }) : null);
  };
  const lade = (id: string | null): void => {
    beispiel = id;
    a = start(id);
    zeichneSach();
    zeichneFragen();
    zeichneErgebnis();
  };

  zeichneSach();
  zeichneFragen();
  zeichneErgebnis();
  return h('div', { class: 'ex-werkzeug wz', 'data-werkzeug': 'wegweiser' },
    h('div', { class: 'gs-text' }, inhalt(v.html)),
    h('div', { class: 'ex-leiste' }, beispielWahl({
      bedienbar: o.bedienbar, pruef: 'ww-beispiel', titel: E.sachverhalt, beispiele: v.beispiele.map((b) => ({ id: b.id, titel: b.titel })), aktiv: beispiel, leer: true, leerTitel: E.eigenerSachverhalt, beiWahl: lade,
    })),
    sachOrt,
    status,
    h('div', { class: 'wz-raster' }, pfadOrt, ergebnisOrt));
}
