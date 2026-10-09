/*
 * E · Register-Zusammenspiel (Owner im Chat 2026-10-09): Die Grundgrafik der Register mit vier Ansichten – Zuschauen (der Fall
 * läuft von allein, mit Anhalten, Schritt und Tempo), Geschichte (der Fall erzählt, Schritt für Schritt), Selbst durchprobieren
 * (geführt, mit Rückmeldung) und Erkunden (Station oder Pfeil wählen) – und fünf Fragen über der Grafik: Wer macht das? Wann?
 * Ab wann? Was entsteht? Was fehlt, wenn es fehlt? Rollen überall neutral: Bauherr, Lenkungskreis, Projektsteuerung. Die Form
 * rechnet src/werkzeuge/register.ts, die Texte stehen in inhalte/werkzeuge.yaml. Nichts wird gespeichert oder gesendet.
 */
import type { RegisterKnoten, RegisterTeil } from '../../../inhalte/typen.ts';
import {
  ANLAESSE, EBENEN, KNOTEN, ROLLEN, SCHWELLE, ausgehend, besucht, bewerteWahl, bisBlockade, blockiert, kante, probefrage, zaehleFuehrung,
  type AnlassId, type Ebene, type Ort, type Rolle, type Weg,
} from '../../../werkzeuge/register.ts';
import { h, ersetze } from '../../h.ts';
import { auswahl, E, knopf, mitFokus, optionen, type WerkzeugOptionen } from './gemeinsam.ts';
import { baueGrafik, OHNE_ZUSTAND, TON, type Zustand } from './register-grafik.ts';

const R = E.register;

type Modus = 'zuschauen' | 'geschichte' | 'probieren' | 'erkunden';
const MODI: readonly Modus[] = ['zuschauen', 'geschichte', 'probieren', 'erkunden'];

/** Lesezeit je Schritt beim Zuschauen (ms); „Doppeltes Tempo“ halbiert sie. */
const TAKT_MS = 4600;

interface Probe {
  /** Frage an der Station: Wohin geht es? Danach: Wer führt die Zielstation? */
  phase: 'weiter' | 'wer';
  letzte: Ort | null;
  werLetzte: Rolle | null;
  /** Schritte, bei denen die Frage nach dem Weiter schon beim ersten Versuch stimmte */
  ersteRichtig: number;
  falschBeiSchritt: boolean;
}

interface Stand {
  modus: Modus;
  anlass: AnlassId;
  ebene: Ebene;
  /** bestätigte Schritte des Falls */
  n: number;
  laeuft: boolean;
  schnell: boolean;
  gewaehlt: Ort | null;
  gewaehlteKante: string | null;
  ausgefallen: Set<Ort>;
  probe: Probe;
}

const neueProbe = (): Probe => ({ phase: 'weiter', letzte: null, werLetzte: null, ersteRichtig: 0, falschBeiSchritt: false });

export function registerWerkzeug(o: WerkzeugOptionen): HTMLElement {
  const w = o.w.register;
  const st: Stand = { modus: 'zuschauen', anlass: 'hinweis', ebene: 'wer', n: 0, laeuft: false, schnell: false, gewaehlt: null, gewaehlteKante: null, ausgefallen: new Set(), probe: neueProbe() };

  const ortTitel = (ort: Ort): string => (ort === SCHWELLE ? w.schwelle.titel : w.knoten[ort].titel);
  const rollenTitel = (r: Rolle): string => w.rollen.find((x) => x.id === r)?.titel ?? r;
  const fuehrtVon = (ort: Ort): Rolle => (ort === SCHWELLE ? w.schwelle.wer.fuehrt : w.knoten[ort].wer.fuehrt);
  const anlassDaten = (): RegisterTeil['anlaesse'][number] => w.anlaesse.find((a) => a.id === st.anlass) ?? (w.anlaesse[0] as RegisterTeil['anlaesse'][number]);
  const weg = (): Weg => { const a = anlassDaten(); return { start: a.start, schritte: a.schritte.map((s) => s.kante) }; };
  const gesamt = (): number => anlassDaten().schritte.length;

  const grafik = baueGrafik(w, {
    bedienbar: o.bedienbar,
    beiWahl: (ort) => waehleOrt(ort),
    beiWahlKante: (id) => { st.gewaehlteKante = st.gewaehlteKante === id ? null : id; st.gewaehlt = null; zeichne(); },
  });
  const kopf = h('div', { class: 'rz-kopf' });
  const rollenLeiste = h('div', { class: 'rz-rollen', 'data-pruef': 'register-rollen' });
  const flaeche = h('div', { class: 'rz-flaeche', 'data-pruef': 'register-flaeche', 'aria-live': 'polite' });
  const detail = h('div', { class: 'rz-detail', 'data-pruef': 'register-detail' });
  const wurzel = h('div', { class: 'ex-werkzeug rz', 'data-werkzeug': 'register' });

  /* ------------------------------------------------------------------ Zustand der Grafik */

  /** Wie viele Schritte die Grafik zeigt (beim Durchprobieren schon der Pfeil, nach dem die Frage richtig beantwortet ist). */
  function sichtbareSchritte(): number {
    if (st.modus === 'erkunden') return 0;
    if (st.modus === 'probieren') return Math.min(gesamt(), st.n + (st.probe.phase === 'wer' ? 1 : 0));
    return st.n;
  }

  function grafikZustand(impuls: boolean): Zustand {
    if (st.modus === 'erkunden') {
      return { ...OHNE_ZUSTAND, ebene: st.ebene, ausgefallen: st.ausgefallen, gewaehlt: st.gewaehlt, gewaehlteKante: st.gewaehlteKante };
    }
    const wg = weg();
    const sicht = sichtbareSchritte();
    const aktiveKante = sicht > 0 ? wg.schritte[sicht - 1] ?? null : null;
    const aktivOrt = sicht > 0 ? kante(aktiveKante ?? '')?.nach ?? wg.start : wg.start;
    return {
      ebene: st.ebene,
      aktiv: aktivOrt,
      besucht: new Set(besucht(wg, sicht - 1)),
      kanteAktiv: aktiveKante,
      kantenDurch: new Set(wg.schritte.slice(0, sicht)),
      ausgefallen: st.modus === 'zuschauen' ? st.ausgefallen : new Set(),
      gewaehlt: st.gewaehlt,
      gewaehlteKante: st.gewaehlteKante,
      impuls,
    };
  }

  /* ------------------------------------------------------------------ Bedienung */

  function waehleOrt(ort: Ort): void {
    if (st.ebene === 'stoerung' && ort !== SCHWELLE && (st.modus === 'zuschauen' || st.modus === 'erkunden')) {
      if (st.ausgefallen.has(ort)) st.ausgefallen.delete(ort); else st.ausgefallen.add(ort);
      st.gewaehlt = ort;
      st.gewaehlteKante = null;
      if (st.modus === 'zuschauen') st.n = Math.min(st.n, bisBlockade(weg(), st.ausgefallen));
      if (st.laeuft && blockiert(weg(), st.ausgefallen)?.schritt === st.n) st.laeuft = false;
      zeichne();
      return;
    }
    st.gewaehlt = st.gewaehlt === ort ? null : ort;
    st.gewaehlteKante = null;
    zeichne();
  }

  const setzeModus = (m: Modus): void => {
    if (st.modus === m) return;
    st.modus = m;
    st.laeuft = false;
    st.n = 0;
    st.probe = neueProbe();
    st.gewaehlteKante = null;
    if (m === 'geschichte' || m === 'probieren') st.ebene = st.ebene === 'stoerung' ? 'wer' : st.ebene;
    zeichne();
  };

  const setzeAnlass = (a: AnlassId): void => {
    st.anlass = a;
    st.laeuft = false;
    st.n = 0;
    st.probe = neueProbe();
    zeichne();
  };

  const grenze = (): number => (st.modus === 'zuschauen' ? bisBlockade(weg(), st.ausgefallen) : gesamt());

  let timer: ReturnType<typeof setTimeout> | null = null;
  const planeTakt = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (!st.laeuft) return;
    timer = setTimeout(() => {
      if (!wurzel.isConnected) { st.laeuft = false; return; }
      if (st.n < grenze()) st.n += 1;
      if (st.n >= grenze()) st.laeuft = false;
      zeichne(true);
    }, st.schnell ? TAKT_MS / 2 : TAKT_MS);
  };

  function schrittVor(): void {
    if (st.n < grenze()) { st.n += 1; zeichne(true); }
  }
  function schrittZurueck(): void {
    if (st.n > 0) { st.n -= 1; st.laeuft = false; zeichne(); }
  }
  function startStopp(): void {
    if (st.laeuft) { st.laeuft = false; zeichne(); return; }
    if (st.n >= grenze()) st.n = 0;
    st.laeuft = true;
    // der erste Schritt folgt gleich, die weiteren im Takt
    st.n = Math.min(st.n + 1, grenze());
    if (st.n >= grenze()) st.laeuft = false;
    zeichne(true);
  }

  /* ------------------------------------------------------------------ Teile der Fläche */

  function rolleMarke(r: Rolle): HTMLElement {
    return h('span', { class: 'rz-rolle', 'data-rolle': r }, rollenTitel(r));
  }

  function fuehrtZeile(ort: Ort): HTMLElement {
    const wer = ort === SCHWELLE ? w.schwelle.wer : w.knoten[ort].wer;
    return h('p', { class: 'rz-fuehrt', 'data-pruef': 'register-fuehrt' },
      h('span', { class: 't-label' }, R.fuehrtLabel), ' ', rolleMarke(wer.fuehrt),
      wer.beteiligt.length > 0 ? h('span', { class: 'rz-beteiligt' }, ' · ', R.beteiligt, ': ', wer.beteiligt.map((b, i) => [i > 0 ? ', ' : '', rolleMarke(b.rolle)])) : null);
  }

  function rollenKarten(): HTMLElement {
    const z = zaehleFuehrung(Object.fromEntries(KNOTEN.map((id) => [id, w.knoten[id].wer.fuehrt])) as Record<string, Rolle>);
    return h('div', { class: 'rz-rollen-liste' },
      h('p', { class: 't-label rz-rollen-titel' }, R.rollenTitel),
      h('ul', { class: 'rz-rollen-karten' }, w.rollen.map((r) => h('li', { class: 'rz-rollen-karte', 'data-rolle': r.id, 'data-pruef': `register-rolle-${r.id}` },
        h('p', { class: 'rz-rollen-kopf' }, rolleMarke(r.id), h('span', { class: 'rz-zahl' }, R.stationen(z[r.id]))),
        h('p', null, r.text)))));
  }

  /** Bedienleiste über der Grafik: Anlass, Ansicht, Frage. */
  function zeichneKopf(): void {
    const ansichten = h('div', { class: 'rz-gruppe', role: 'group', 'aria-label': R.ansicht, 'data-pruef': 'register-modi' },
      h('span', { class: 't-label' }, R.ansicht),
      h('div', { class: 'rz-knoepfe' }, MODI.map((m) => knopf({ pruef: `register-modus-${m}`, text: R.modi[m], gedrueckt: st.modus === m, beiKlick: () => setzeModus(m) }))));
    const fragen = h('div', { class: 'rz-gruppe', role: 'group', 'aria-label': R.frage, 'data-pruef': 'register-ebenen' },
      h('span', { class: 't-label' }, R.frage),
      h('div', { class: 'rz-knoepfe' }, EBENEN.map((e) => {
        const gesperrt = e === 'stoerung' && (st.modus === 'geschichte' || st.modus === 'probieren');
        const k = knopf({ pruef: `register-ebene-${e}`, text: R.ebenen[e], gedrueckt: st.ebene === e, beiKlick: () => { st.ebene = e; zeichne(); } });
        if (gesperrt) { (k as HTMLButtonElement).disabled = true; k.title = R.stoerungNurHier; }
        return k;
      })));
    const anlass = auswahl<AnlassId>({
      name: 'register-anlass', titel: R.anlass, gewaehlt: st.anlass,
      wahl: ANLAESSE.map((id) => ({ wert: id, titel: w.anlaesse.find((a) => a.id === id)?.titel ?? id })),
      beiWahl: setzeAnlass,
    });
    ersetze(kopf, st.modus === 'erkunden' ? [ansichten, fragen] : [anlass, ansichten, fragen]);
  }

  /** Bild des Falls: Einstieg, aktueller Schritt, Ende. */
  /** Station, an der der Fall gerade steht (Start, sonst Ziel des letzten Schritts) – gibt der Karte ihren Farbton. */
  function aktiveStation(): Ort {
    const wg = weg();
    const sicht = sichtbareSchritte();
    return sicht > 0 ? kante(wg.schritte[sicht - 1] ?? '')?.nach ?? wg.start : wg.start;
  }

  /** Untertitel unter dem Bild: Zuschauen erklärt den Pfeil, Erzählt erzählt den Schritt; vor dem ersten Schritt steht der Einstieg. */
  function untertitelText(): string | null {
    if (st.modus !== 'zuschauen' && st.modus !== 'geschichte') return null;
    const b = st.modus === 'zuschauen' && st.ausgefallen.size > 0 ? blockiert(weg(), st.ausgefallen) : null;
    if (b !== null && st.n >= b.schritt) return R.blockiert(ortTitel(b.station));
    const a = anlassDaten();
    if (st.n === 0) return a.einstieg;
    const sch = a.schritte[st.n - 1];
    if (sch === undefined) return null;
    return st.modus === 'geschichte' ? sch.text : w.kanten[sch.kante]?.erklaerung ?? sch.text;
  }

  /** Nur der erste Satz (Abkürzungen wie „z. B.“ trennen nicht): die Karte neben dem Bild bleibt kurz, die ganze Station steht beim Erkunden. */
  function ersterSatz(t: string): string {
    for (const m of t.matchAll(/[.!?](?=\s)/gu)) {
      const wort = /[\p{L}\d)]+$/u.exec(t.slice(0, m.index))?.[0] ?? '';
      if (wort.length >= 4 || /[\d)]$/u.test(wort)) return t.slice(0, m.index + 1);
    }
    return t;
  }

  /** Karte neben dem Bild: Zuschauen nennt die Station, die erreicht ist; Erzählt erklärt den Pfeil (der erzählte Text steht im Untertitel). */
  function schrittKarte(erzaehlt: boolean): HTMLElement {
    const a = anlassDaten();
    const gesamtN = a.schritte.length;
    const n = st.n;
    const karte = h('div', { class: 'rz-schritt', 'data-pruef': 'register-schritt', 'data-ton': TON[aktiveStation()] });
    if (n === 0) {
      karte.append(h('p', { class: 't-label' }, R.beginn), h('h3', { class: 'rz-schritt-titel' }, a.titel), h('p', { class: 'rz-text' }, a.kurz));
      return karte;
    }
    const s = a.schritte[n - 1];
    const k = s === undefined ? null : kante(s.kante);
    if (s === undefined || k === null) return karte;
    const stationText = k.nach === SCHWELLE ? w.schwelle.text : w.knoten[k.nach].text;
    karte.append(
      h('p', { class: 't-label' }, R.schritt(n, gesamtN)),
      h('h3', { class: 'rz-schritt-titel' }, R.pfeil(ortTitel(k.von), ortTitel(k.nach))),
      erzaehlt
        ? h('p', { class: 'rz-text' }, h('b', null, `${R.pfeilErklaerung}: `), w.kanten[k.id]?.erklaerung ?? '')
        : h('p', { class: 'rz-text' }, h('b', null, `${ortTitel(k.nach)}: `), ersterSatz(stationText)),
      fuehrtZeile(k.nach));
    if (n === gesamtN) karte.append(h('p', { class: 'rz-ende', 'data-pruef': 'register-ende' }, h('b', null, `${R.ende}. `), a.ende));
    return karte;
  }

  function blockadeKarte(): HTMLElement | null {
    if (st.modus !== 'zuschauen' || st.ausgefallen.size === 0) return null;
    const b = blockiert(weg(), st.ausgefallen);
    if (b === null || st.n < b.schritt) return null;
    const k = b.station === SCHWELLE ? null : w.knoten[b.station];
    return h('div', { class: 'rz-blockade', 'data-pruef': 'register-blockade', role: 'status' },
      h('p', null, h('b', null, R.blockiert(ortTitel(b.station)))),
      k !== null ? h('p', null, h('span', { class: 't-label' }, `${R.wasFehlt}: `), k.stoerung) : null);
  }

  function steuerung(): HTMLElement {
    const gz = grenze();
    const bk = (pruef: string, text: string, beiKlick: () => void, aus = false, gedr?: boolean): HTMLElement => {
      const k = knopf({ pruef, text, beiKlick, ...(gedr === undefined ? {} : { gedrueckt: gedr }) });
      if (aus) (k as HTMLButtonElement).disabled = true;
      return k;
    };
    return h('div', { class: 'rz-steuerung', role: 'group', 'aria-label': R.modi.zuschauen },
      st.modus === 'zuschauen' ? bk('register-start', st.laeuft ? R.anhalten : R.start, startStopp) : null,
      bk('register-zurueck', R.zurueck, schrittZurueck, st.n === 0),
      bk('register-vor', R.weiter, schrittVor, st.n >= gz),
      bk('register-neu', R.vonVorn, () => { st.n = 0; st.laeuft = false; st.probe = neueProbe(); zeichne(); }, st.n === 0 && !st.laeuft),
      st.modus === 'zuschauen' ? bk('register-tempo', R.schnell, () => { st.schnell = !st.schnell; zeichne(); }, false, st.schnell) : null,
      h('span', { class: 'rz-zaehler', 'data-pruef': 'register-zaehler' }, R.schritt(st.n, gesamt())));
  }

  /** Durchprobieren: erst „Wie geht es weiter?“, dann „Wer führt die Station?“, dann der nächste Schritt. */
  function probeKarte(): HTMLElement {
    const a = anlassDaten();
    const n = st.n;
    const karte = h('div', { class: 'rz-probe', 'data-pruef': 'register-probe', 'data-ton': TON[aktiveStation()] });
    if (n >= a.schritte.length) {
      karte.append(
        h('p', { class: 't-label' }, R.ende),
        h('p', { class: 'rz-text' }, a.ende),
        h('p', { class: 'rz-ergebnis', 'data-pruef': 'register-probe-ergebnis' }, R.probe.ergebnis(st.probe.ersteRichtig, a.schritte.length)),
        knopf({ pruef: 'register-probe-neu', text: R.vonVorn, beiKlick: () => { st.n = 0; st.probe = neueProbe(); zeichne(); } }));
      return karte;
    }
    const wg = weg();
    const frage = probefrage(wg, n);
    const k = kante(wg.schritte[n] ?? '');
    if (frage === null || k === null) return karte;
    karte.append(h('p', { class: 't-label' }, R.schritt(n + 1, a.schritte.length)));
    if (n === 0 && st.probe.phase === 'weiter' && st.probe.letzte === null) karte.append(h('p', { class: 'rz-text' }, a.einstieg));
    const letzte = st.probe.letzte;
    const bewertung = letzte === null ? null : bewerteWahl(frage, letzte);
    karte.append(optionen<string>({
      bedienbar: true, name: 'register-weiter', klasse: 'rz-frage',
      legende: R.probe.weiter(ortTitel(frage.von)),
      wahl: frage.wahl.map((ort) => ({ wert: ort, titel: ortTitel(ort) })),
      gewaehlt: st.probe.phase === 'wer' ? frage.richtig : letzte,
      beiWahl: (wert) => {
        if (st.probe.phase === 'wer') return;
        const ort = wert as Ort;
        st.probe.letzte = ort;
        if (bewerteWahl(frage, ort) === 'richtig') {
          if (!st.probe.falschBeiSchritt) st.probe.ersteRichtig += 1;
          st.probe.phase = 'wer';
          st.probe.werLetzte = null;
        } else st.probe.falschBeiSchritt = true;
        zeichne(true);
      },
    }));
    if (bewertung !== null && letzte !== null) {
      const ziele = ausgehend(frage.von).map((x) => ortTitel(x.nach)).join(', ');
      const satz = bewertung === 'richtig' ? `${R.probe.richtig} ${w.kanten[k.id]?.erklaerung ?? ''}`
        : bewertung === 'anderer-pfeil' ? R.probe.anderer(ortTitel(frage.richtig))
        : `${R.probe.keinPfeil(ortTitel(frage.von), ortTitel(letzte))} ${R.probe.mogliche(ziele)}`;
      karte.append(h('p', { class: 'rz-rueckmeldung', 'data-ergebnis': bewertung, 'data-pruef': 'register-rueckmeldung', role: 'status' }, satz));
    }
    if (st.probe.phase === 'wer') {
      const ziel = k.nach;
      const fuehrt = fuehrtVon(ziel);
      karte.append(optionen<Rolle>({
        bedienbar: true, name: 'register-wer', klasse: 'rz-frage',
        legende: R.probe.wer(ortTitel(ziel)),
        wahl: ROLLEN.map((r) => ({ wert: r, titel: rollenTitel(r) })),
        gewaehlt: st.probe.werLetzte,
        beiWahl: (r) => { st.probe.werLetzte = r; zeichne(); },
      }));
      if (st.probe.werLetzte !== null) {
        const ok = st.probe.werLetzte === fuehrt;
        const wer = ziel === SCHWELLE ? w.schwelle.wer : w.knoten[ziel].wer;
        karte.append(h('p', { class: 'rz-rueckmeldung', 'data-ergebnis': ok ? 'richtig' : 'falsch', 'data-pruef': 'register-wer-rueckmeldung', role: 'status' },
          ok ? `${R.probe.werRichtig(rollenTitel(fuehrt))} ${wer.text}` : R.probe.werFalsch(rollenTitel(fuehrt))));
        if (ok) {
          karte.append(knopf({ pruef: 'register-probe-weiter', text: R.weiter, beiKlick: () => {
            st.n += 1;
            st.probe = { ...neueProbe(), ersteRichtig: st.probe.ersteRichtig };
            zeichne();
          } }));
        }
      }
    }
    return karte;
  }

  function stationDetail(ort: Ort): HTMLElement {
    const k = ort === SCHWELLE ? null : w.knoten[ort];
    const zeile = (e: Ebene, titel: string, inhalt: Node | string): HTMLElement =>
      h('div', { class: 'rz-zeile', 'data-ebene': e, 'data-aktiv': st.ebene === e ? 'ja' : null }, h('dt', { class: 't-label' }, titel), h('dd', null, inhalt));
    const wer = ort === SCHWELLE ? w.schwelle.wer : (k as RegisterKnoten).wer;
    return h('section', { class: 'rz-karte', 'data-ort': ort, 'data-ton': TON[ort], 'data-pruef': 'register-station', 'aria-label': ortTitel(ort) },
      h('p', { class: 't-label' }, R.stationKopf),
      h('h3', { class: 'rz-karte-titel' }, ortTitel(ort), ' ', rolleMarke(wer.fuehrt)),
      h('p', { class: 'rz-text' }, ort === SCHWELLE ? w.schwelle.text : (k as RegisterKnoten).text),
      h('dl', { class: 'rz-zeilen' },
        zeile('wer', R.ebenen.wer, h('span', null, wer.text, wer.beteiligt.length > 0 ? h('ul', { class: 'rz-liste' }, wer.beteiligt.map((b) => h('li', null, rolleMarke(b.rolle), ' ', b.text))) : null)),
        k === null ? null : zeile('wann', R.ebenen.wann, k.wann.text),
        k === null ? null : zeile('schwelle', R.ebenen.schwelle, k.schwelle.text),
        k === null ? null : zeile('ergebnis', R.ebenen.ergebnis, k.ergebnis.text),
        k === null ? null : zeile('stoerung', R.ebenen.stoerung, k.stoerung)),
      knopf({ pruef: 'register-auswahl-aufheben', leise: true, text: R.auswahlAufheben, beiKlick: () => { st.gewaehlt = null; zeichne(); } }));
  }

  function kanteDetail(id: string): HTMLElement | null {
    const kt = kante(id);
    if (kt === null) return null;
    const t = w.kanten[id];
    return h('section', { class: 'rz-karte', 'data-kante': id, 'data-ton': TON[kt.nach], 'data-pruef': 'register-pfeil', 'aria-label': t?.text ?? id },
      h('p', { class: 't-label' }, R.pfeilErklaerung),
      h('h3', { class: 'rz-karte-titel' }, R.pfeil(ortTitel(kt.von), ortTitel(kt.nach)), ': ', t?.text ?? ''),
      h('p', { class: 'rz-text' }, t?.erklaerung ?? ''),
      knopf({ pruef: 'register-auswahl-aufheben', leise: true, text: R.auswahlAufheben, beiKlick: () => { st.gewaehlteKante = null; zeichne(); } }));
  }

  function zeichneFlaeche(): void {
    const teile: (HTMLElement | null)[] = [];
    if (st.modus === 'zuschauen') teile.push(steuerung(), blockadeKarte(), schrittKarte(false));
    else if (st.modus === 'geschichte') teile.push(steuerung(), schrittKarte(true));
    else if (st.modus === 'probieren') teile.push(probeKarte());
    else if (st.gewaehlt === null && st.gewaehlteKante === null) teile.push(h('p', { class: 'rz-hinweis' }, R.waehlen));
    if (st.ebene === 'stoerung' && (st.modus === 'zuschauen' || st.modus === 'erkunden')) teile.push(h('p', { class: 'rz-hinweis', 'data-pruef': 'register-stoerung-hinweis' }, R.stoerungHinweis));
    ersetze(flaeche, teile);
    ersetze(detail, st.gewaehlteKante !== null ? kanteDetail(st.gewaehlteKante) : st.gewaehlt !== null ? stationDetail(st.gewaehlt) : null);
  }

  function zeichne(mitImpuls = false): void {
    mitFokus(wurzel, () => {
      zeichneKopf();
      grafik.zeige(grafikZustand(mitImpuls));
      grafik.untertitel(untertitelText());
      zeichneFlaeche();
    });
    planeTakt();
  }

  /* ------------------------------------------------------------------ nicht bedienbar (Leinwand) */
  if (!o.bedienbar) {
    grafik.zeige({ ...OHNE_ZUSTAND });
    return h('div', { class: 'ex-werkzeug rz', 'data-werkzeug': 'register' }, grafik.wurzel, rollenKarten());
  }

  ersetze(rollenLeiste, rollenKarten());
  // Bild und Erklärung nebeneinander (breite Fenster), sonst untereinander – der Untertitel steht immer direkt unter dem Bild
  const spiel = h('div', { class: 'rz-spiel' }, h('div', { class: 'rz-bild' }, grafik.wurzel), h('div', { class: 'rz-seite' }, flaeche, detail));
  ersetze(wurzel, [kopf, spiel, rollenLeiste]);
  zeichne();
  return wurzel;
}

