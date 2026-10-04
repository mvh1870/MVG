/*
 * A · Vorlagen-Check (P18.3, O-59; Konzept docs/WERKZEUGE-P18.md A): Der Bauherr prüft eine erhaltene
 * Entscheidungsvorlage in fünf Schritten; rechts (schmal: darunter) läuft die Ampel mit, jede Lücke mit ihrem Satz
 * „So schließen Sie die Lücke“. Rechnung: src/werkzeuge/vorlagen-check.ts. Die Zuordnung des Beispielprojekts (wer was
 * entscheidet) gilt nur, solange ein Beispiel geladen ist und Gegenstand, Betrag und Reserve unverändert sind (O-46).
 */
import type { VorlagenCheckTeil } from '../../../inhalte/typen.ts';
import {
  beispielNochGeladen, leseStandVorlage, MINDEST_WEGE, pruefeVorlage, type Antwort, type Gegenstand, type Pruefpunkt, type Stelle,
  type VorlageEingabe, type VorlagenBefund, type WegZustand,
} from '../../../werkzeuge/vorlagen-check.ts';
import type { Hinweis } from '../../../werkzeuge/gemeinsam.ts';
import { h, ersetze } from '../../h.ts';
import { inhalt } from '../../bausteine/inhalt.ts';
import { sym } from '../../bausteine/bloecke.ts';
import {
  ampelAnzeige, auswahl, beispielWahl, druckKnopf, E, ergebnisBild, karte, knopf, mitFokus, optionen, textFeld, zahl, zahlFeld,
  type WerkzeugOptionen,
} from './gemeinsam.ts';

interface Zustand {
  beispiel: string | null;
  titel: string;
  gegenstand: Gegenstand;
  stelle: Stelle;
  betrag: number | null;
  reserve: boolean | null;
  dringlich: boolean;
  wege: { titel: string; zustand: WegZustand }[];
  antworten: Record<string, Antwort | undefined>;
  /** 0–4 = Prüfschritt */
  schritt: number;
}

const MAX_WEGE = 5;
/** so viele Lücken stehen sofort da, der Rest hinter „Weitere … Lücken anzeigen“ (R78: keine Wand aus 14 Karten im ersten Schritt) */
const ZUERST = 3;
const ANTWORTEN: readonly Antwort[] = ['ja', 'teilweise', 'nein'];

const BEISPIELE_VORLAGE = (v: VorlagenCheckTeil): string[] => v.beispiele.map((b) => b.id);

function ausBeispiel(v: VorlagenCheckTeil, id: string | null): Zustand {
  const b = v.beispiele.find((x) => x.id === id) ?? null;
  if (b === null) return { beispiel: null, titel: '', gegenstand: 'geld', stelle: 'offen', betrag: null, reserve: null, dringlich: false, wege: [], antworten: {}, schritt: 0 };
  return { beispiel: b.id, titel: b.titel, gegenstand: b.gegenstand, stelle: b.stelle, betrag: b.betrag, reserve: b.reserve, dringlich: false, wege: b.wege.map((x) => ({ ...x })), antworten: { ...b.antworten }, schritt: 0 };
}

const pruefpunkte = (v: VorlagenCheckTeil): Pruefpunkt[] => v.schritte.flatMap((s) => s.punkte.map((p) => ({
  id: p.id, muss: p.muss, ...(p.art === null ? {} : { art: p.art, mindestens: p.mindestens ?? MINDEST_WEGE }),
})));

function eingabe(z: Zustand): VorlageEingabe {
  return { antworten: z.antworten, wege: z.wege, gegenstand: z.gegenstand, stelle: z.stelle, betrag: z.betrag, reserve: z.reserve, dringlich: z.dringlich };
}

/** „Beispiel geladen“ (Konzept 0): nur dann gilt die Zuordnung des Beispielprojekts und stehen Namen aus dem Fall. */
function mitBeispiel(v: VorlagenCheckTeil, z: Zustand): boolean {
  const b = v.beispiele.find((x) => x.id === z.beispiel);
  return b !== undefined && beispielNochGeladen(b, eingabe(z));
}

function befundVorlage(v: VorlagenCheckTeil, z: Zustand): VorlagenBefund {
  return pruefeVorlage(pruefpunkte(v), eingabe(z), mitBeispiel(v, z) ? v.mandat : null);
}

/** Satz zu einer Lücke (A-R3 bis A-R5) oder einem Hinweis. */
function satz(v: VorlagenCheckTeil, x: Hinweis): string {
  const [kopf, teil] = x.id.split(':');
  const stelle = (id: Stelle): string => v.stellen.find((s) => s.id === id)?.satz ?? '';
  switch (kopf) {
    case 'stelle-projektsteuerung': return stelle('projektsteuerung');
    case 'stelle-beraet': return stelle('lenkungskreis');
    case 'mandat-beraet': return v.mandat.saetze.beraet[(teil ?? 'unbestimmt') as 'buergermeisterin' | 'sie' | 'unbestimmt'] ?? '';
    case 'mandat-unbestimmt': return v.mandat.saetze.unbestimmt;
    case 'mandat-falsch': return v.mandat.saetze.falsch.replace('{grund}', v.mandat.saetze.gruende[(teil ?? 'betrag') as keyof typeof v.mandat.saetze.gruende] ?? '');
    case 'mandat-selbst': return v.mandat.saetze.selbst;
    case 'dringlich': return v.dringlich.satz;
    default:
      if (kopf?.startsWith('weg-')) return v.wegzustaende.find((w) => `weg-${w.id}` === kopf)?.satz ?? '';
      return v.schritte.flatMap((s) => s.punkte).find((p) => p.id === x.id)?.schliessen ?? '';
  }
}

const punkt = (v: VorlagenCheckTeil, id: string | undefined) => v.schritte.flatMap((s) => s.punkte).find((p) => p.id === id);
const ergebnisGegenstand = { gruen: 'stempel', gelb: 'notizzettel', rot: 'warnschild' } as const;

export function vorlagenCheck(o: WerkzeugOptionen): HTMLElement {
  const v = o.w.vorlagencheck;
  const stand = o.stand !== null ? leseStandVorlage(`b:${o.stand.beispiel}${o.stand.schritt !== null ? `;${o.stand.schritt}` : ''}`, BEISPIELE_VORLAGE(v)) : null;
  let z = ausBeispiel(v, stand?.beispiel ?? v.beispiele[0]?.id ?? null);
  const schrittAusStand = stand?.schritt?.slice(2) ?? null;
  if (schrittAusStand !== null && schrittAusStand !== 'ergebnis') z.schritt = Number(schrittAusStand) - 1;
  const nurErgebnis = !o.bedienbar && schrittAusStand === 'ergebnis';

  const lageOrt = h('div', { class: 'wz-lage' });
  const formOrt = h('div', { class: 'wz-form', 'data-pruef': 'vc-form' });
  const ergebnisOrt = h('section', { class: 'wz-ergebnis', 'aria-label': E.ergebnis, 'data-pruef': 'vc-ergebnis' });
  const status = h('p', { class: 'nur-sr', 'aria-live': 'polite', 'data-pruef': 'vc-status' });

  const stellenTitel = (s: { id: Stelle; titel: string; ohneBeispiel: string | null }): string => (mitBeispiel(v, z) ? s.titel : s.ohneBeispiel ?? s.titel);
  const aendere = (neu: Partial<Zustand>): void => {
    z = { ...z, ...neu };
    zeichneErgebnis();
  };

  /* ------------------------------------------------------------ Eingaben -- */
  const rahmen = (): HTMLElement => !o.bedienbar ? h('dl', { class: 'wz-druck-rahmen', 'data-pruef': 'vc-rahmen' },
    h('div', null, h('dt', null, E.gegenstand), h('dd', null, v.gegenstaende.find((g) => g.id === z.gegenstand)?.titel ?? '')),
    h('div', null, h('dt', null, E.stelle), h('dd', null, stellenTitel(v.stellen.find((s) => s.id === z.stelle) ?? { id: 'offen', titel: '', ohneBeispiel: null }))),
    h('div', null, h('dt', null, E.betrag), h('dd', null, z.betrag === null ? E.unbekannt : zahl(z.betrag))))
    : h('fieldset', { class: 'wz-gruppe', 'data-pruef': 'vc-rahmen' },
    h('legend', { class: 'wz-gruppe-titel' }, E.rahmenVorlage),
    h('div', { class: 'wz-felder' },
      textFeld({ name: 'vc-titel', titel: E.titelVorlage, wert: z.titel, max: 80, mehrzeilig: true, beiEingabe: (t) => aendere({ titel: t }) }),
      auswahl({ name: 'vc-gegenstand', titel: E.gegenstand, wahl: v.gegenstaende.map((g) => ({ wert: g.id, titel: g.titel })), gewaehlt: z.gegenstand, beiWahl: (g) => { aendere({ gegenstand: g }); stellenAuffrischen(); } }),
      h('label', { class: 'wz-feld' }, h('span', { class: 't-label' }, E.stelle),
        h('select', { 'data-pruef': 'vc-stelle', onchange: (e: Event) => aendere({ stelle: (e.target as HTMLSelectElement).value as Stelle }) },
          v.stellen.map((s) => h('option', { value: s.id, selected: s.id === z.stelle }, stellenTitel(s))))),
      zahlFeld({ name: 'vc-betrag', titel: E.betrag, wert: z.betrag, platzhalter: E.unbekannt, beiEingabe: (n) => { aendere({ betrag: n }); stellenAuffrischen(); } }),
      auswahl({ name: 'vc-reserve', titel: E.reserve, wahl: [{ wert: 'ja', titel: E.jaNeinUnbekannt.ja }, { wert: 'nein', titel: E.jaNeinUnbekannt.nein }, { wert: 'unbekannt', titel: E.jaNeinUnbekannt.unbekannt }],
        gewaehlt: z.reserve === null ? 'unbekannt' : z.reserve ? 'ja' : 'nein', beiWahl: (r) => { aendere({ reserve: r === 'unbekannt' ? null : r === 'ja' }); stellenAuffrischen(); } })));

  /** Die Namen der Stellen hängen am Zustand „Beispiel geladen“ – nur die Beschriftung wechselt, der Fokus bleibt. */
  const stellenAuffrischen = (): void => {
    const wahl = formOrt.querySelector<HTMLSelectElement>('[data-pruef="vc-stelle"]');
    if (wahl === null) return;
    for (const opt of wahl.options) {
      const s = v.stellen.find((x) => x.id === opt.value);
      if (s !== undefined) opt.textContent = stellenTitel(s);
    }
  };

  const frage = (p: VorlagenCheckTeil['schritte'][number]['punkte'][number]): HTMLElement => optionen<Antwort>({
    bedienbar: o.bedienbar,
    name: `vc-${p.id}`,
    legende: p.frage,
    wahl: ANTWORTEN.map((a) => ({ wert: a, titel: E.antwort[a] })),
    gewaehlt: z.antworten[p.id],
    beiWahl: (a) => { z = { ...z, antworten: { ...z.antworten, [p.id]: a } }; zeichneErgebnis(); zeichneLeiste(); },
  });

  const wegeListe = (): HTMLElement => {
    const zulaessig = z.wege.filter((w) => w.zustand === 'zulaessig').length;
    const zeile = (w: Zustand['wege'][number], i: number): HTMLElement => o.bedienbar
      ? h('li', { class: 'wz-weg' },
        textFeld({ name: `vc-weg-${i}`, titel: E.wegName(i + 1), wert: w.titel, max: 60, versteckt: false, beiEingabe: (t) => { z.wege[i] = { ...w, titel: t }; zeichneErgebnis(); } }),
        auswahl({ name: `vc-weg-zustand-${i}`, titel: E.wegZustand(i + 1), versteckt: true, wahl: v.wegzustaende.map((x) => ({ wert: x.id, titel: x.titel })), gewaehlt: w.zustand,
          beiWahl: (zu) => { z.wege[i] = { ...z.wege[i] ?? w, zustand: zu }; zeichneErgebnis(); zeichneZaehlung(); } }),
        knopf({ pruef: `vc-weg-weg-${i}`, leise: true, label: E.wegEntfernen(i + 1), text: [sym('kreuz'), E.entfernen], beiKlick: () => {
          z = { ...z, wege: z.wege.filter((_, j) => j !== i) };
          mitFokus(formOrt, zeichneSchritt);
          (formOrt.querySelector('[data-pruef="vc-weg-hinzu"]') as HTMLElement | null)?.focus();
          zeichneErgebnis();
        } }))
      : h('li', { class: 'wz-weg' }, h('b', null, w.titel), ' – ', v.wegzustaende.find((x) => x.id === w.zustand)?.titel ?? '');
    return h('div', { class: 'wz-gruppe', 'data-pruef': 'vc-wege' },
      h('p', { class: 'wz-gruppe-titel' }, E.wegListe),
      h('ol', { class: 'wz-wege' }, z.wege.map(zeile)),
      o.bedienbar && z.wege.length < MAX_WEGE ? knopf({ pruef: 'vc-weg-hinzu', leise: true, text: [sym('pfeilRechts'), E.wegHinzu], beiKlick: () => {
        z = { ...z, wege: [...z.wege, { titel: '', zustand: 'offen' }] };
        zeichneSchritt();
        (formOrt.querySelector(`[data-pruef="vc-weg-${z.wege.length - 1}"] input, input[data-pruef="vc-weg-${z.wege.length - 1}"]`) as HTMLElement | null)?.focus();
        zeichneErgebnis();
      } }) : null,
      h('p', { class: 'wz-zaehlung', 'data-pruef': 'vc-zaehlung', 'data-ok': zulaessig >= MINDEST_WEGE ? 'ja' : 'nein' },
        sym(zulaessig >= MINDEST_WEGE ? 'haken' : 'warnung'), E.zulaessigeWege(zulaessig, MINDEST_WEGE)));
  };
  const zeichneZaehlung = (): void => {
    const alt = formOrt.querySelector('[data-pruef="vc-zaehlung"]');
    const neu = wegeListe().querySelector('[data-pruef="vc-zaehlung"]');
    if (alt !== null && neu !== null) alt.replaceWith(neu);
  };

  const leisteOrt = h('nav', { class: 'wz-schritte', 'aria-label': E.schritte });
  const zeichneLeiste = (): void => {
    const befund = befundVorlage(v, z);
    mitFokus(leisteOrt, () => ersetze(leisteOrt, h('ol', null, v.schritte.map((s, i) => {
      const fertig = s.punkte.every((p) => befund.erfuellt.includes(p.id));
      const inhaltL = [h('span', { class: 'wz-schritt-nr', 'aria-hidden': 'true' }, fertig ? sym('haken') : String(i + 1)), h('span', null, s.titel)];
      return h('li', { 'data-fertig': fertig ? 'ja' : 'nein' }, o.bedienbar
        ? h('button', { type: 'button', class: 'wz-schritt', 'data-pruef': `vc-schritt-${i + 1}`, 'aria-current': i === z.schritt ? 'step' : null, onclick: () => { z.schritt = i; zeichneSchritt(); zeichneLeiste(); } }, inhaltL)
        : h('span', { class: 'wz-schritt', 'aria-current': i === z.schritt ? 'step' : null }, inhaltL));
    }))));
  };

  const schrittOrt = h('div', { class: 'wz-schritt-inhalt' });
  const zeichneSchritt = (): void => {
    const s = v.schritte[z.schritt];
    if (s === undefined) return;
    const fragen = s.punkte.filter((p) => p.art === null).map(frage);
    ersetze(schrittOrt,
      h('h3', { class: 'wz-schritt-titel', tabindex: -1, 'data-pruef': 'vc-schritt-titel' }, h('small', null, E.schrittVon(z.schritt + 1, v.schritte.length)), s.titel),
      z.schritt === 0 ? rahmen() : null,
      s.id === 'wege' ? wegeListe() : null,
      fragen,
      s.id === 'vergleich' && o.bedienbar ? h('p', { class: 'wz-verweis' }, h('a', { href: '#explore/mcda', 'data-pruef': 'vc-zum-mcda' }, sym('pfeilRechts'), `${E.andererWegVorn} – ${o.w.mcda.titel}`)) : null,
      z.schritt === 0 ? optionen<'ja' | 'nein'>({ bedienbar: o.bedienbar, name: 'vc-dringlich', legende: v.dringlich.frage, wahl: [{ wert: 'ja', titel: E.antwort.ja }, { wert: 'nein', titel: E.antwort.nein }], gewaehlt: z.dringlich ? 'ja' : 'nein', beiWahl: (a) => aendere({ dringlich: a === 'ja' }) }) : null,
      o.bedienbar ? h('div', { class: 'wz-navi' },
        z.schritt > 0 ? knopf({ pruef: 'vc-zurueck', text: [sym('pfeilLinks'), E.zurueck], beiKlick: () => wechsle(z.schritt - 1) }) : null,
        z.schritt < v.schritte.length - 1 ? knopf({ pruef: 'vc-weiter', text: [E.weiter, sym('pfeilRechts')], beiKlick: () => wechsle(z.schritt + 1) }) : null) : null);
  };
  const wechsle = (i: number): void => {
    z.schritt = i;
    zeichneSchritt();
    zeichneLeiste();
    (schrittOrt.querySelector('[data-pruef="vc-schritt-titel"]') as HTMLElement | null)?.focus({ preventScroll: false });
  };

  /* ------------------------------------------------------------ Ergebnis -- */
  /** Karten einer Lücke (R78: nach Wichtigkeit gereiht – rote vor gelben, die des aktuellen Schritts zuerst) */
  const lueckenKarte = (l: VorlagenBefund['luecken'][number]): HTMLElement => karte({
    titel: punkt(v, l.bezug)?.kurz ?? null,
    satz: `${E.soSchliessenSie}: ${satz(v, l)}`,
    schwere: l.schwere,
    wort: E.schwere[l.schwere === 'rot' ? 'rot' : 'gelb'],
    pruef: `vc-luecke-${l.bezug ?? ''}`,
  });
  /** Ob die Zusatzlücken ausgeklappt sind – bleibt über das Neuzeichnen hinweg erhalten */
  let weitereOffen = false;
  const lueckenListe = (befund: VorlagenBefund): HTMLElement => {
    const imSchritt = new Set((v.schritte[z.schritt]?.punkte ?? []).map((p) => p.id));
    const rang = (l: VorlagenBefund['luecken'][number]): number => (imSchritt.has(l.bezug ?? '') ? 0 : 2) + (l.schwere === 'rot' ? 0 : 1);
    const gereiht = befund.luecken.map((l, i) => ({ l, i })).sort((a, b) => rang(a.l) - rang(b.l) || a.i - b.i).map((x) => x.l);
    const sofort = gereiht.length > ZUERST + 1 ? gereiht.slice(0, ZUERST) : gereiht;
    const weitere = gereiht.slice(sofort.length);
    const d = weitere.length > 0
      ? h('details', { class: 'wz-weitere', 'data-pruef': 'vc-weitere', open: weitereOffen },
        h('summary', null, E.weitereLuecken(weitere.length)),
        h('ul', { class: 'wz-karten' }, weitere.map(lueckenKarte)))
      : null;
    d?.addEventListener('toggle', () => { weitereOffen = (d as HTMLDetailsElement).open; });
    return h('div', { class: 'wz-luecken', 'data-pruef': 'vc-luecken' }, h('ul', { class: 'wz-karten' }, sofort.map(lueckenKarte)), d);
  };
  const zeichneErgebnis = (): void => {
    // R79: die Haken der Schrittleiste folgen jeder Eingabe, nicht erst dem Schrittwechsel
    zeichneLeiste();
    const befund = befundVorlage(v, z);
    const wort = v.ampel[befund.ampel];
    status.textContent = `${wort} – ${E.luecken(befund.luecken.length)}${befund.offen.length > 0 ? `, ${E.nochOffen(befund.offen.length)}` : ''}`;
    ersetze(ergebnisOrt,
      h('div', { class: 'wz-ergebnis-kopf' },
        ampelAnzeige(befund.ampel, wort, 'vc-ampel'),
        ergebnisBild(ergebnisGegenstand[befund.ampel])),
      h('p', { class: 'wz-zahlen' }, E.luecken(befund.luecken.length), befund.offen.length > 0 ? ` · ${E.nochOffen(befund.offen.length)}` : null),
      befund.luecken.length > 0 ? lueckenListe(befund) : null,
      befund.hinweise.length > 0 ? h('ul', { class: 'wz-karten', 'data-pruef': 'vc-hinweise' }, befund.hinweise.map((x) => karte({ titel: null, satz: satz(v, x), schwere: 'info' }))) : null,
      befund.erfuellt.length > 0 ? h('details', { class: 'wz-erfuellt' }, h('summary', null, E.erfuellt(befund.erfuellt.length)),
        h('ul', null, befund.erfuellt.map((id) => h('li', null, sym('haken'), punkt(v, id)?.kurz ?? id)))) : null,
      o.bedienbar ? druckKnopf('vorlagen-check', () => druck(befund)) : null);
  };

  /* ---------------------------------------------------------------- Druck -- */
  const druck = (befund: VorlagenBefund): { titel: string; fiktiv: boolean; teile: Node[] } => {
    const stellenName = v.stellen.find((s) => s.id === z.stelle);
    const standVon = (id: string): keyof typeof E.punktStand => {
      if (befund.erfuellt.includes(id)) return 'ja';
      if (befund.offen.includes(id)) return 'offen';
      const l = befund.luecken.find((x) => x.bezug === id);
      return l?.schwere === 'rot' ? 'nein' : 'teilweise';
    };
    const alle = v.schritte.flatMap((s) => s.punkte);
    return {
      titel: z.titel.trim() !== '' ? `${v.titel} · ${z.titel.trim()}` : v.titel,
      fiktiv: z.beispiel !== null,
      teile: [
        h('section', { class: 'druck-teil wz-druck-kopf' }, ampelAnzeige(befund.ampel, v.ampel[befund.ampel], 'vc-druck-ampel'),
          h('dl', { class: 'wz-druck-rahmen' },
            h('div', null, h('dt', null, E.gegenstand), h('dd', null, v.gegenstaende.find((g) => g.id === z.gegenstand)?.titel ?? '')),
            h('div', null, h('dt', null, E.stelle), h('dd', null, stellenName !== undefined ? stellenTitel(stellenName) : '')),
            h('div', null, h('dt', null, E.betrag), h('dd', null, z.betrag === null ? E.unbekannt : zahl(z.betrag))),
            h('div', null, h('dt', null, E.wegListe), h('dd', null, E.zulaessigeWege(befund.zulaessigeWege, MINDEST_WEGE))))),
        h('section', { class: 'druck-teil' },
          h('ul', { class: 'wz-druck-punkte' }, alle.map((p) => {
            const st = standVon(p.id);
            return h('li', { 'data-stand': st }, h('span', { class: 'wz-druck-stand' }, E.punktStand[st]), ' ', p.kurz);
          }))),
        befund.luecken.length + befund.hinweise.length > 0 ? h('section', { class: 'druck-teil' }, h('h2', null, E.soSchliessenSieAlle),
          h('ol', { class: 'wz-druck-saetze' }, [...befund.luecken, ...befund.hinweise].map((x) => h('li', null, x.bezug !== undefined && punkt(v, x.bezug) !== undefined && x.schwere !== 'info' ? h('b', null, `${punkt(v, x.bezug)?.kurz ?? ''}: `) : null, satz(v, x))))) : null,
      ].filter((x): x is HTMLElement => x !== null),
    };
  };

  /* --------------------------------------------------------------- Aufbau -- */
  const zeichneLage = (): void => {
    const b = v.beispiele.find((x) => x.id === z.beispiel);
    ersetze(lageOrt, b !== undefined ? h('p', { class: 'ex-frage', 'data-pruef': 'vc-lage' }, b.lage) : null);
  };
  const ladeBeispiel = (id: string | null): void => {
    z = ausBeispiel(v, id);
    zeichneLage();
    zeichneLeiste();
    zeichneSchritt();
    zeichneErgebnis();
  };
  zeichneLage();
  zeichneLeiste();
  zeichneSchritt();
  zeichneErgebnis();
  if (nurErgebnis) ersetze(formOrt);
  else formOrt.append(leisteOrt, schrittOrt);

  return h('div', { class: 'ex-werkzeug wz', 'data-werkzeug': 'vorlagen-check' },
    h('div', { class: 'gs-text' }, inhalt(v.html)),
    h('div', { class: 'ex-leiste' }, beispielWahl({ bedienbar: o.bedienbar, pruef: 'vc-beispiel', beispiele: v.beispiele, aktiv: z.beispiel, leer: true, beiWahl: ladeBeispiel })),
    lageOrt,
    status,
    h('div', { class: 'wz-raster' }, formOrt, ergebnisOrt));
}
