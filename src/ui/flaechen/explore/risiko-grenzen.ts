/*
 * C · Risiko-Bewerter mit eigenen Grenzen (P18.4, O-59; Konzept docs/WERKZEUGE-P18.md C): vier Grenzen je Reihe
 * (Wahrscheinlichkeit, Kosten, Termin), wie der Bauherr sie für das Projekt festlegt; daraus Stufen, Matrixfeld und
 * Bearbeitungspriorität – auch, wenn noch nicht alles bekannt ist (unbekannt ist nicht null). Unpersönlich (L-254).
 * Rechnung: src/werkzeuge/risiko-grenzen.ts; Stufentexte und Qualitätsstufen aus der Risikomatrix (keine zweite Quelle).
 */
import type { RisikoGrenzenTeil } from '../../../inhalte/typen.ts';
import {
  bewerteRisiko, leseStandRisiko, pruefeGrenzen, type Grenzen, type ProjektGrenzen, type Reihe, type RisikoBefund, type RisikoEingabe, type Stufe, type Wert,
} from '../../../werkzeuge/risiko-grenzen.ts';
import type { GimmickName } from '../../../grafik/figuren.ts';
import { messlatteBild, miniMatrixBild } from '../../../grafik/werkzeug-bilder.ts';
import { h, ersetze, vonHtml } from '../../h.ts';
import { inhalt, inhaltInline } from '../../bausteine/inhalt.ts';
import { sym } from '../../bausteine/bloecke.ts';
import { auswahl, beispielWahl, druckKnopf, E, ergebnisBild, karte, knopf, mitFokus, optionen, textFeld, zahl, zahlFeld, type WerkzeugOptionen } from './gemeinsam.ts';

type Massnahme = 'keine' | 'geplant' | 'belegt';
type ZeileArt = 'wert' | 'spanne' | 'unbekannt' | 'entfaellt';
interface Zeile { art: ZeileArt; wert: number | null; von: number | null; bis: number | null }
interface WZeile { art: 'stufe' | 'prozent' | 'unbekannt'; stufe: Stufe; prozent: number | null }
interface QZeile { art: 'stufe' | 'unbekannt' | 'entfaellt'; stufe: Stufe }
interface Zustand {
  beispiel: string | null;
  titel: string;
  kennung: string;
  grenzen: Record<Reihe, (number | null)[]>;
  w: WZeile;
  kosten: Zeile;
  termin: Zeile;
  qualitaet: QZeile;
  warn: string[];
  massnahme: Massnahme;
  schwelle: boolean;
  prognose: 'ja' | 'nein' | 'teilweise';
  puffer: boolean | null;
  annahmen: string[];
}

const REIHEN: readonly Reihe[] = ['wahrscheinlichkeit', 'kosten', 'termin'];
const STUFEN: readonly Stufe[] = [1, 2, 3, 4, 5];
const BILD: Record<'beobachten' | 'gezielt' | 'vorrangig' | 'offen', GimmickName> = { vorrangig: 'warnschild', gezielt: 'lupe', beobachten: 'kalender', offen: 'notizzettel' };

const zeileAus = (x: Wert): Zeile => x.art === 'wert' ? { art: 'wert', wert: x.wert, von: null, bis: null }
  : x.art === 'spanne' ? { art: 'spanne', wert: null, von: x.von, bis: x.bis }
  : { art: x.art === 'entfaellt' ? 'entfaellt' : 'unbekannt', wert: null, von: null, bis: null };
const wAus = (x: Wert): WZeile => x.art === 'stufe' ? { art: 'stufe', stufe: x.stufe, prozent: null }
  : x.art === 'wert' ? { art: 'prozent', stufe: 3, prozent: x.wert } : { art: 'unbekannt', stufe: 3, prozent: null };
const qAus = (x: Wert): QZeile => x.art === 'stufe' ? { art: 'stufe', stufe: x.stufe } : { art: x.art === 'entfaellt' ? 'entfaellt' : 'unbekannt', stufe: 3 };

function ausBeispiel(v: RisikoGrenzenTeil, id: string | null, grenzen?: Zustand['grenzen']): Zustand {
  const g = grenzen ?? { wahrscheinlichkeit: [...v.grenzen.wahrscheinlichkeit], kosten: [...v.grenzen.kosten], termin: [...v.grenzen.termin] };
  const b = v.beispiele.find((x) => x.id === id);
  if (b === undefined) {
    return { beispiel: null, titel: '', kennung: '', grenzen: g, w: { art: 'unbekannt', stufe: 3, prozent: null }, kosten: zeileAus({ art: 'unbekannt' }), termin: zeileAus({ art: 'unbekannt' }),
      qualitaet: { art: 'unbekannt', stufe: 3 }, warn: [], massnahme: 'keine', schwelle: false, prognose: 'nein', puffer: null, annahmen: [] };
  }
  return { beispiel: b.id, titel: b.titel, kennung: b.kennung, grenzen: g, w: wAus(b.w), kosten: zeileAus(b.kosten), termin: zeileAus(b.termin), qualitaet: qAus(b.qualitaet),
    warn: [...b.warn], massnahme: b.massnahme, schwelle: b.schwelle, prognose: b.prognose, puffer: b.puffer, annahmen: [] };
}

const zahlOderNaN = (n: number | null): number => (n === null ? Number.NaN : n);
function wert(z: Zeile): Wert {
  if (z.art === 'unbekannt' || z.art === 'entfaellt') return { art: z.art };
  if (z.art === 'wert') return { art: 'wert', wert: zahlOderNaN(z.wert) };
  return { art: 'spanne', von: zahlOderNaN(z.von), bis: zahlOderNaN(z.bis) };
}
function eingabe(z: Zustand): RisikoEingabe {
  return {
    w: z.w.art === 'stufe' ? { art: 'stufe', stufe: z.w.stufe } : z.w.art === 'prozent' ? { art: 'wert', wert: zahlOderNaN(z.w.prozent) } : { art: 'unbekannt' },
    kosten: wert(z.kosten), termin: wert(z.termin),
    qualitaet: z.qualitaet.art === 'stufe' ? { art: 'stufe', stufe: z.qualitaet.stufe } : { art: z.qualitaet.art },
    warn: z.warn, massnahme: z.massnahme, schwelle: z.schwelle, prognose: z.prognose, puffer: z.puffer,
  };
}
const projektGrenzen = (z: Zustand): ProjektGrenzen => ({
  wahrscheinlichkeit: z.grenzen.wahrscheinlichkeit.map(zahlOderNaN) as unknown as Grenzen,
  kosten: z.grenzen.kosten.map(zahlOderNaN) as unknown as Grenzen,
  termin: z.grenzen.termin.map(zahlOderNaN) as unknown as Grenzen,
});

/** Kurze Beschriftung einer Grenze auf der Messlatte. */
function grenzWort(reihe: Reihe, n: number): string {
  if (reihe === 'wahrscheinlichkeit') return `${zahl(n)} %`;
  if (reihe === 'termin') return `${zahl(n)} Tage`;
  return n >= 100_000 ? `${zahl(n / 1_000_000)} Mio. €` : `${zahl(n)} €`;
}

export function risikoGrenzen(o: WerkzeugOptionen): HTMLElement {
  const v = o.w.risikogrenzen;
  const m = o.w.matrix;
  const stand = o.stand !== null ? leseStandRisiko(`b:${o.stand.beispiel}${o.stand.schritt !== null ? `;${o.stand.schritt}` : ''}`, v.beispiele.map((b) => b.id)) : null;
  let z = ausBeispiel(v, stand?.beispiel ?? v.beispiele[0]?.id ?? null);

  const formOrt = h('div', { class: 'wz-form', 'data-pruef': 'rg-form' });
  const ergebnisOrt = h('section', { class: 'wz-ergebnis', 'aria-label': E.ergebnis, 'data-pruef': 'rg-ergebnis' });
  const status = h('p', { class: 'nur-sr', 'aria-live': 'polite', 'data-pruef': 'rg-status' });
  const befund = (): RisikoBefund => bewerteRisiko(eingabe(z), projektGrenzen(z));
  const beispielDaten = () => v.beispiele.find((b) => b.id === z.beispiel);

  /* ------------------------------------------------------ Was wäre, wenn -- */
  /** Setzt oder nimmt eine Annahme zurück (C.4): jede wirkt auf ihr Feld; t70 und t71 schließen sich aus. */
  const schalteAnnahme = (id: string, an: boolean): void => {
    const b = beispielDaten();
    const a = b?.waswaere.find((x) => x.id === id);
    if (b === undefined || a === undefined) return;
    let annahmen = z.annahmen.filter((x) => x !== id);
    if (an) {
      if (a.termin !== null) annahmen = annahmen.filter((x) => b.waswaere.find((y) => y.id === x)?.termin === null);
      annahmen.push(id);
    }
    const aktiv = b.waswaere.filter((x) => annahmen.includes(x.id));
    const termin = aktiv.find((x) => x.termin !== null)?.termin ?? b.termin;
    const w = aktiv.find((x) => x.w !== null)?.w ?? b.w;
    const massnahme = aktiv.find((x) => x.massnahme !== null)?.massnahme ?? b.massnahme;
    z = { ...z, annahmen, termin: zeileAus(termin), w: wAus(w), massnahme };
  };

  /* ------------------------------------------------------------ Eingaben -- */
  const grenzenFeld = (): HTMLElement => {
    const fehlerOrt = (r: Reihe) => h('p', { class: 'wz-feld-fehler', 'data-pruef': `rg-grenzfehler-${r}`, 'aria-live': 'polite' });
    const zeichneFehler = (wurzel: HTMLElement): void => {
      let alle = true;
      for (const r of REIHEN) {
        const f = pruefeGrenzen(z.grenzen[r].map(zahlOderNaN), r === 'wahrscheinlichkeit');
        if (r === 'termin' && z.grenzen.termin.some((x) => x !== null && !Number.isInteger(x)) && !f.includes('nicht-positiv')) alle = false;
        if (f.length > 0) alle = false;
        const ort = wurzel.querySelector(`[data-pruef="rg-grenzfehler-${r}"]`);
        if (ort !== null) ort.textContent = f.map((x) => v.grenzfehler[x]).join(' ');
      }
      const ok = wurzel.querySelector('[data-pruef="rg-grenzen-ok"]');
      if (ok !== null) { ok.toggleAttribute('hidden', !alle); }
    };
    const wurzel = h('details', { class: 'wz-gruppe wz-grenzen', 'data-pruef': 'rg-grenzen' },
      h('summary', { class: 'wz-gruppe-titel' }, E.grenzen, ' ', h('span', { class: 'wz-ok', 'data-pruef': 'rg-grenzen-ok' }, sym('haken'), E.grenzenGueltig)),
      REIHEN.map((r) => h('div', { class: 'wz-grenzreihe', role: 'group', 'aria-label': E.reihe[r] },
        h('p', { class: 't-label' }, E.reihe[r]),
        h('div', { class: 'wz-grenzwerte' }, [0, 1, 2, 3].map((i) => zahlFeld({
          name: `rg-grenze-${r}-${i + 1}`, titel: E.grenzeNr(E.reihe[r], i + 1), versteckt: true, wert: z.grenzen[r][i] ?? null, ganz: r === 'termin',
          beiEingabe: (n) => { z.grenzen[r][i] = n; zeichneFehler(wurzel); zeichneErgebnis(); },
        }))),
        fehlerOrt(r))));
    zeichneFehler(wurzel);
    return wurzel;
  };

  const zeileFeld = (name: 'kosten' | 'termin'): HTMLElement => {
    const ort = h('div', { class: 'wz-zeile', 'data-zeile': name });
    const zeichne = (): void => {
      const zl = z[name];
      const einheit = E.einheit[name];
      const setze = (neu: Partial<Zeile>): void => { z = { ...z, [name]: { ...z[name], ...neu } }; zeichneErgebnis(); };
      ersetze(ort,
        optionen<ZeileArt>({
          bedienbar: true, name: `rg-${name}-art`, legende: E.zeile[name],
          wahl: (['wert', 'spanne', 'unbekannt', 'entfaellt'] as const).map((x) => ({ wert: x, titel: E.angabe[x] })), gewaehlt: zl.art,
          beiWahl: (x) => { z = { ...z, [name]: { ...z[name], art: x } }; mitFokus(ort, zeichne); zeichneErgebnis(); },
        }),
        zl.art === 'wert' ? h('div', { class: 'wz-felder' }, zahlFeld({ name: `rg-${name}-wert`, titel: `${E.zeile[name]} in ${einheit}`, wert: zl.wert, ganz: name === 'termin', beiEingabe: (n) => setze({ wert: n }) })) : null,
        zl.art === 'spanne' ? h('div', { class: 'wz-felder' },
          zahlFeld({ name: `rg-${name}-von`, titel: `${E.von} (${einheit})`, wert: zl.von, ganz: name === 'termin', beiEingabe: (n) => setze({ von: n }) }),
          zahlFeld({ name: `rg-${name}-bis`, titel: `${E.bis} (${einheit})`, wert: zl.bis, ganz: name === 'termin', beiEingabe: (n) => setze({ bis: n }) })) : null);
    };
    zeichne();
    return ort;
  };

  const wFeld = (): HTMLElement => {
    const ort = h('div', { class: 'wz-zeile', 'data-zeile': 'w' });
    const zeichne = (): void => {
      ersetze(ort,
        optionen<WZeile['art']>({
          bedienbar: true, name: 'rg-w-art', legende: E.zeile.w,
          wahl: (['stufe', 'prozent', 'unbekannt'] as const).map((x) => ({ wert: x, titel: E.angabe[x] })), gewaehlt: z.w.art,
          beiWahl: (x) => { z = { ...z, w: { ...z.w, art: x } }; mitFokus(ort, zeichne); zeichneErgebnis(); },
        }),
        z.w.art === 'stufe' ? h('div', { class: 'wz-felder' }, auswahl({
          name: 'rg-w-stufe', titel: E.zeile.w, wahl: STUFEN.map((s) => ({ wert: String(s), titel: `${s} · ${m.wahrscheinlichkeit[s - 1] ?? ''}` })), gewaehlt: String(z.w.stufe),
          beiWahl: (s) => { z = { ...z, w: { ...z.w, stufe: Number(s) as Stufe } }; zeichneErgebnis(); },
        })) : null,
        z.w.art === 'prozent' ? h('div', { class: 'wz-felder' }, zahlFeld({ name: 'rg-w-prozent', titel: `${E.zeile.w} in ${E.einheit.prozent}`, wert: z.w.prozent, beiEingabe: (n) => { z = { ...z, w: { ...z.w, prozent: n } }; zeichneErgebnis(); } })) : null);
    };
    zeichne();
    return ort;
  };

  const qFeld = (): HTMLElement => {
    const ort = h('div', { class: 'wz-zeile', 'data-zeile': 'qualitaet' });
    const zeichne = (): void => {
      ersetze(ort,
        optionen<QZeile['art']>({
          bedienbar: true, name: 'rg-q-art', legende: E.zeile.qualitaet,
          wahl: (['stufe', 'unbekannt', 'entfaellt'] as const).map((x) => ({ wert: x, titel: E.angabe[x] })), gewaehlt: z.qualitaet.art,
          beiWahl: (x) => { z = { ...z, qualitaet: { ...z.qualitaet, art: x } }; mitFokus(ort, zeichne); zeichneErgebnis(); },
        }),
        z.qualitaet.art === 'stufe' ? h('div', { class: 'wz-felder' }, auswahl({
          name: 'rg-q-stufe', titel: E.zeile.qualitaet, wahl: STUFEN.map((s) => ({ wert: String(s), titel: `${s} · ${m.qualitaet[s - 1] ?? ''}` })), gewaehlt: String(z.qualitaet.stufe),
          beiWahl: (s) => { z = { ...z, qualitaet: { ...z.qualitaet, stufe: Number(s) as Stufe } }; zeichneErgebnis(); },
        })) : null);
    };
    zeichne();
    return ort;
  };

  const zusaetzeFeld = (): HTMLElement => h('fieldset', { class: 'wz-gruppe' },
    h('legend', { class: 'wz-gruppe-titel' }, E.zusaetze),
    h('fieldset', { class: 'wz-frage' }, h('legend', { class: 'wz-legende' }, E.warnanlaesse),
      h('div', { class: 'wz-wahlen' }, v.warnanlaesse.map((x) => h('label', { class: 'wz-wahl' },
        h('input', { type: 'checkbox', 'data-pruef': `rg-warn-${x.id}`, checked: z.warn.includes(x.id), onchange: (e: Event) => {
          const an = (e.target as HTMLInputElement).checked;
          z = { ...z, warn: an ? [...z.warn, x.id] : z.warn.filter((y) => y !== x.id) };
          zeichneErgebnis();
        } }), h('span', null, x.titel))))),
    h('div', { class: 'wz-felder' },
      auswahl<Massnahme>({ name: 'rg-massnahme', titel: E.gegenmassnahme, wahl: (['keine', 'geplant', 'belegt'] as const).map((x) => ({ wert: x, titel: E.massnahmeStand[x] })), gewaehlt: z.massnahme, beiWahl: (x) => { z = { ...z, massnahme: x }; zeichneErgebnis(); } }),
      auswahl<'ja' | 'nein' | 'teilweise'>({ name: 'rg-prognose', titel: E.prognose, wahl: (['nein', 'teilweise', 'ja'] as const).map((x) => ({ wert: x, titel: E.prognoseStand[x] })), gewaehlt: z.prognose, beiWahl: (x) => { z = { ...z, prognose: x }; zeichneErgebnis(); } }),
      auswahl<'ja' | 'nein' | 'unbekannt'>({ name: 'rg-puffer', titel: E.puffer, wahl: (['unbekannt', 'ja', 'nein'] as const).map((x) => ({ wert: x, titel: E.jaNeinUnbekannt[x] })), gewaehlt: z.puffer === null ? 'unbekannt' : z.puffer ? 'ja' : 'nein', beiWahl: (x) => { z = { ...z, puffer: x === 'unbekannt' ? null : x === 'ja' }; zeichneErgebnis(); } })),
    h('label', { class: 'wz-wahl' }, h('input', { type: 'checkbox', 'data-pruef': 'rg-schwelle', checked: z.schwelle, onchange: (e: Event) => { z = { ...z, schwelle: (e.target as HTMLInputElement).checked }; zeichneErgebnis(); } }), h('span', null, E.schwelle)));

  const waswaereFeld = (): HTMLElement | null => {
    const b = beispielDaten();
    if (b === undefined || b.waswaere.length === 0) return null;
    return h('div', { class: 'wz-gruppe wz-waswaere', role: 'group', 'aria-label': E.waswaere, 'data-pruef': 'rg-waswaere' },
      h('p', { class: 'wz-gruppe-titel' }, E.waswaere),
      h('div', { class: 'wz-annahmen' }, b.waswaere.map((a) => o.bedienbar
        ? knopf({ pruef: `rg-annahme-${a.id}`, text: a.titel, gedrueckt: z.annahmen.includes(a.id), beiKlick: () => { schalteAnnahme(a.id, !z.annahmen.includes(a.id)); mitFokus(formOrt, zeichneForm); zeichneErgebnis(); } })
        : h('span', { class: 'wz-knopf', 'aria-pressed': z.annahmen.includes(a.id) ? 'true' : 'false' }, a.titel))),
      o.bedienbar && z.annahmen.length > 0 ? knopf({ pruef: 'rg-annahmen-zurueck', leise: true, text: [sym('zurueckspulen'), E.zurueckZumBeispiel], beiKlick: () => {
        for (const id of [...z.annahmen]) schalteAnnahme(id, false);
        mitFokus(formOrt, zeichneForm);
        (formOrt.querySelector('[data-pruef^="rg-annahme-"]') as HTMLElement | null)?.focus();
        zeichneErgebnis();
      } }) : null);
  };

  const zeichneForm = (): void => {
    if (!o.bedienbar) { ersetze(formOrt, waswaereFeld()); return; }
    ersetze(formOrt,
      waswaereFeld(),
      grenzenFeld(),
      h('fieldset', { class: 'wz-gruppe' }, h('legend', { class: 'wz-gruppe-titel' }, E.risikoTitel),
        h('div', { class: 'wz-felder' },
          textFeld({ name: 'rg-titel', titel: E.titel, wert: z.titel, max: 80, mehrzeilig: true, beiEingabe: (t) => { z = { ...z, titel: t }; } }),
          textFeld({ name: 'rg-kennung', titel: E.kennung, wert: z.kennung, max: 10, beiEingabe: (t) => { z = { ...z, kennung: t }; } })),
        wFeld(), zeileFeld('kosten'), zeileFeld('termin'), qFeld()),
      zusaetzeFeld());
  };

  /* ------------------------------------------------------------ Ergebnis -- */
  const stufenText = (von: Stufe | null, bis: Stufe | null, art: string): string => {
    if (von === null) return art === 'entfaellt' ? E.angabe.entfaellt : E.angabe.unbekannt;
    return bis !== null && bis !== von ? `${E.stufeNr(von)} ${E.bis} ${bis}` : E.stufeNr(von);
  };
  const satz = (id: string): string => (id === 'annahme' && z.beispiel !== null ? v.saetze['annahmeBeispiel'] : v.saetze[id]) ?? '';

  const zeilen = (b: RisikoBefund) => {
    const grenzOk = (r: Reihe): boolean => pruefeGrenzen(z.grenzen[r].map(zahlOderNaN), r === 'wahrscheinlichkeit').length === 0;
    const latte = (r: Reihe, z0: Zeile | null, prozent: number | null, von: Stufe | null, bis: Stufe | null, titel: string): HTMLElement | null => {
      if (!grenzOk(r)) return null;
      const werte = z.grenzen[r].map(zahlOderNaN);
      const wert = prozent !== null ? { von: prozent, bis: prozent } : z0 === null ? null : z0.art === 'wert' && z0.wert !== null ? { von: z0.wert, bis: z0.wert } : z0.art === 'spanne' && z0.von !== null && z0.bis !== null ? { von: z0.von, bis: z0.bis } : null;
      const text = stufenText(von, bis, z0?.art ?? '');
      return h('span', { class: 'wz-latte' }, vonHtml(messlatteBild({
        grenzen: werte, beschriftung: werte.map((x) => grenzWort(r, x)), wert: von === null ? null : wert, stufen: von === null ? null : { von, bis: bis ?? von }, aufGrenze: b.aufGrenze.includes(r),
      }, E.messlatteBild(titel, text), 300)));
    };
    return [
      { id: 'w', titel: E.zeile.w, text: b.stufen.w === null ? E.angabe.unbekannt : `${E.stufeNr(b.stufen.w)} · ${m.wahrscheinlichkeit[b.stufen.w - 1] ?? ''}`, latte: z.w.art === 'prozent' ? latte('wahrscheinlichkeit', null, z.w.prozent, b.stufen.w, b.stufenBis.w, E.zeile.w) : null, reihe: 'wahrscheinlichkeit' as Reihe | null },
      { id: 'kosten', titel: E.zeile.kosten, text: stufenText(b.stufen.kosten, b.stufenBis.kosten, z.kosten.art), latte: latte('kosten', z.kosten, null, b.stufen.kosten, b.stufenBis.kosten, E.zeile.kosten), reihe: 'kosten' as Reihe | null },
      { id: 'termin', titel: E.zeile.termin, text: stufenText(b.stufen.termin, b.stufenBis.termin, z.termin.art), latte: latte('termin', z.termin, null, b.stufen.termin, b.stufenBis.termin, E.zeile.termin), reihe: 'termin' as Reihe | null },
      { id: 'qualitaet', titel: E.zeile.qualitaet, text: b.stufen.qualitaet === null ? stufenText(null, null, z.qualitaet.art) : `${E.stufeNr(b.stufen.qualitaet)} · ${m.qualitaet[b.stufen.qualitaet - 1] ?? ''}`, latte: null, reihe: null },
    ];
  };

  const prioritaetTeil = (b: RisikoBefund): HTMLElement => {
    const stufe = m.stufen.find((s) => s.id === b.prioritaet);
    const stufeBis = b.prioritaetBis !== null && b.prioritaetBis !== b.prioritaet ? m.stufen.find((s) => s.id === b.prioritaetBis) : undefined;
    const feldText = b.feld !== null ? `${b.bis !== null || b.nachObenOffen ? `${E.mindestens} ` : ''}${E.feld(b.feld.w, b.feld.a)}${b.bis !== null ? ` · ${E.bis} ${E.feld(b.bis.w, b.bis.a)}` : ''}${b.nachObenOffen ? ` · ${v.saetze['nachObenOffen'] ?? ''}` : ''}` : null;
    const zustand = v.zustaende[b.zustand];
    const bild = b.feld !== null
      ? miniMatrixBild({ feld: b.feld, bis: b.bis, nachObenOffen: b.nachObenOffen }, E.matrixBild(`${b.feld.w} × ${b.feld.a}`, stufe?.titel ?? '', zustand))
      : miniMatrixBild({ feld: null, bis: null, nachObenOffen: false }, E.matrixOffen(zustand));
    return h('div', { class: 'wz-matrix-teil' },
      h('div', { class: 'wz-matrix-bild' }, vonHtml(bild)),
      h('div', { class: 'wz-matrix-text' },
        h('p', { class: 'wz-zustand', 'data-zustand': b.zustand, 'data-pruef': 'rg-zustand' }, zustand),
        feldText !== null ? h('p', { class: 'wz-feldwert', 'data-pruef': 'rg-feld' }, feldText) : null,
        stufe !== undefined ? h('p', { class: 'wz-prioritaet', 'data-stufe': stufe.id, 'data-pruef': 'rg-prioritaet' }, h('b', null, stufe.titel), stufeBis !== undefined ? ` – ${E.bis} ${stufeBis.titel}` : null) : null,
        b.vorrangWegenA5 ? h('p', { class: 'wz-a5', 'data-pruef': 'rg-a5' }, v.saetze['vorrangA5'] ?? '') : null,
        stufe !== undefined ? h('p', { class: 'wz-veranlasst' }, h('span', { class: 't-label' }, E.veranlasst), ' ', inhaltInline(stufe.html)) : null));
  };

  const hinweisListe = (b: RisikoBefund, max = Infinity): HTMLElement | null => {
    const liste = b.hinweise.filter((x) => x.id !== 'grenze' && x.id !== 'fehler').slice(0, max);
    return liste.length === 0 ? null : h('ul', { class: 'wz-karten', 'data-pruef': 'rg-hinweise' }, liste.map((x) => karte({ titel: null, satz: satz(x.id), schwere: x.schwere, pruef: `rg-hinweis-${x.id}` })));
  };

  const zeichneErgebnis = (): void => {
    const b = befund();
    const stufe = m.stufen.find((s) => s.id === b.prioritaet);
    status.textContent = `${v.zustaende[b.zustand]}${b.feld !== null ? `, ${E.feld(b.feld.w, b.feld.a)}` : ''}${stufe !== undefined ? `, ${stufe.titel}` : ''}`;
    const fehlerZeilen = new Set(b.hinweise.filter((x) => x.id === 'fehler').map((x) => x.bezug));
    ersetze(ergebnisOrt,
      h('div', { class: 'wz-ergebnis-kopf' }, h('p', { class: 'wz-ergebnis-titel' }, z.kennung !== '' ? h('span', { class: 'id-marke ex-id', 'data-art': 'risiko' }, z.kennung) : null, ' ', z.titel), ergebnisBild(BILD[b.prioritaet ?? 'offen'])),
      h('ul', { class: 'wz-stufen', 'data-pruef': 'rg-stufen' }, zeilen(b).map((x) => h('li', { 'data-zeile': x.id },
        h('p', null, h('span', { class: 't-label' }, x.titel), ' ', h('b', { 'data-pruef': `rg-stufe-${x.id}` }, x.text)),
        x.latte,
        x.reihe !== null && b.aufGrenze.includes(x.reihe) ? h('p', { class: 'wz-grenze-satz', 'data-pruef': `rg-grenze-${x.id}` }, (v.saetze['grenze'] ?? '').replace('{n}', String(b.stufen[x.id as 'w' | 'kosten' | 'termin'] ?? ''))) : null,
        fehlerZeilen.has(x.id === 'w' ? 'wahrscheinlichkeit' : x.id) ? h('p', { class: 'wz-feld-fehler' }, v.saetze['fehler'] ?? '') : null))),
      prioritaetTeil(b),
      hinweisListe(b),
      h('p', { class: 'gs-leise' }, m.regel),
      o.bedienbar ? druckKnopf('risiko-grenzen', () => druck(b)) : null);
  };

  /* ---------------------------------------------------------------- Druck -- */
  const druck = (b: RisikoBefund): { titel: string; fiktiv: boolean; teile: Node[] } => ({
    titel: `${v.titel} · ${z.titel.trim() !== '' ? z.titel.trim() : E.risikoTitel}`,
    fiktiv: z.beispiel !== null,
    teile: [
      h('section', { class: 'druck-teil' }, h('h2', null, E.grenzen),
        h('dl', { class: 'wz-druck-rahmen' }, REIHEN.map((r) => h('div', null, h('dt', null, E.reihe[r]), h('dd', null, z.grenzen[r].map((x) => (x === null ? '–' : grenzWort(r, x))).join(' · ')))))),
      h('section', { class: 'druck-teil' }, h('h2', null, E.ergebnis),
        h('table', { class: 'wz-druck-tabelle' }, h('tbody', null, zeilen(b).map((x) => h('tr', null, h('th', { scope: 'row' }, x.titel), h('td', null, x.text)))))),
      h('section', { class: 'druck-teil' }, prioritaetTeil(b)),
      hinweisListe(b, 8),
    ].filter((x): x is HTMLElement => x !== null),
  });

  const lade = (id: string | null): void => {
    z = ausBeispiel(v, id, z.grenzen);
    zeichneForm();
    zeichneErgebnis();
  };
  if (stand?.schritt != null) for (const t of stand.schritt.split(';')) {
    const id = t === 't:70' ? 't70' : t === 't:71' ? 't71' : t === 'w:1' ? 'w1' : t === 'm:belegt' ? 'belegt' : null;
    if (id !== null) schalteAnnahme(id, true);
  }
  zeichneForm();
  zeichneErgebnis();
  return h('div', { class: 'ex-werkzeug wz', 'data-werkzeug': 'risiko-grenzen' },
    h('div', { class: 'gs-text' }, inhalt(v.html)),
    h('div', { class: 'ex-leiste' }, beispielWahl({ bedienbar: o.bedienbar, pruef: 'rg-beispiel', beispiele: v.beispiele.map((b) => ({ id: b.id, titel: `${b.kennung} · ${b.titel}` })), aktiv: z.beispiel, leer: true, beiWahl: lade })),
    status,
    h('div', { class: 'wz-raster' }, formOrt, ergebnisOrt));
}
