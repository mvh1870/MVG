/*
 * Szenen der Lagetafel: je Schrittart (und im Rückgrat je Bausteinart) eine Zeichnung.
 *
 * Eine Szene entsteht neu, wenn sich ihr Schlüssel ändert (neue Station, neuer Schritt, neue Wahl
 * in der Konsequenz, Information angefordert) – dann laufen ihre Auftritte (ARCHITEKTUR.md: Animationen
 * hängen an Schlüsselwechseln). Alles andere (Reglerwert, Mandatsoption, Einschätzung, Ebene)
 * aktualisiert die bestehende Szene über `aktualisiere(z)`.
 *
 * Texte kommen aus den Inhalten; aus src/ui/woerter.ts nur Bedienbeschriftungen.
 */

import type { Aktion, OeffentlicherZustand, Status, StatusSchluessel } from '../../engine/typen.ts';
import type { Block, Entscheidung, OeffentlicheInhalte, Option, Schritt, Station } from '../../inhalte/typen.ts';
import { berechneStatus } from '../../engine/status.ts';
import { rueckbezug } from '../../engine/gedaechtnis.ts';
import { h, attr, elementAus, s } from '../h.ts';
import { statusSymbol } from '../../stil/symbole.ts';
import {
  aenderungsSaetze, aktuellerSchritt, aktuelleStation, alleBloecke, ansichtSchluessel, instrumentWerte, kopfKarte, kopfListe,
  kopfText, kopfZahl, istKarte, mandatsWahl, rollenAttr, statusWort, gruppiere, schrittPosition,
} from '../anzeige.ts';
import * as B from '../bausteine/bloecke.ts';
import { inhalt, inhaltInline, personFigur, personName, personFunktion } from '../bausteine/inhalt.ts';
import { weltRegler } from '../bausteine/weltregler.ts';
import { governanceFluss, istFlussPosition, type FlussMarke, type FlussPosition, FLUSS_POSITIONEN } from '../../grafik/governance-fluss.ts';
import { mandatsleiter, type LeiterStufe } from '../../grafik/mandatsleiter.ts';
import { vorlage as vorlageGrafik, type PruefStand } from '../../grafik/checkliste.ts';
import { ctcVerlauf } from '../../grafik/ctc-verlauf.ts';
import { vergleichSzene, type VergleichsStueck } from '../../grafik/vergleich-szene.ts';
import { dezimal, naechsterFrame, sanftBeide, zaehle, type Takt } from '../bewegung.ts';
import { W } from '../woerter.ts';
import { spurTafel } from '../leitstand/spur.ts';

export interface SzenenKontext {
  inhalte: OeffentlicheInhalte;
  station: Station;
  schritte: Schritt[];
  index: number;
  schritt: Schritt;
  z: OeffentlicherZustand;
  /** null = nicht bedienbar (Leinwand, Regie-Vorschau) */
  tue: ((a: Aktion) => void) | null;
  takt: Takt;
}

export interface Szene {
  element: HTMLElement;
  aktualisiere(z: OeffentlicherZustand): void;
  beimEintritt(): void;
}

/** Schlüssel der Szene: ändert er sich, entsteht die Szene neu. */
export function szenenSchluessel(z: OeffentlicherZustand, inhalte: OeffentlicheInhalte): string {
  const st = aktuelleStation(z, inhalte);
  const s0 = aktuellerSchritt(z, inhalte);
  if (st === null || s0 === null) return `leer|${z.station ?? '-'}|${z.schritt}`;
  // Die Rolle gehört zum Schlüssel (ihre Szenen), nur nicht an der Rollenwahl selbst: dort soll die
  // Wahl die Karten nicht neu auftreten lassen, und das verzögerte „weiter“ bleibt an diesem Takt.
  const teile = [st.id, String(z.schritt), s0.id, s0.art === 'rollenwahl' ? '*' : z.rolle ?? '-'];
  if (s0.art === 'konsequenz') {
    const ent = z.rolle !== null ? st.szenen[z.rolle]?.entscheidung ?? null : null;
    teile.push(ent !== null ? z.entscheidungen[ent.id] ?? '-' : '-');
  }
  if (alleBloecke(s0.bloecke).some((b) => b.art === 'zeitsprung')) teile.push(st.infos.map((i) => (z.info.includes(`${st.id}/${i.id}`) ? '1' : '0')).join(''));
  return teile.join('|');
}

const tu = (k: SzenenKontext, a: Aktion): void => {
  k.tue?.(a);
};

function szene(element: HTMLElement, aktualisiere: (z: OeffentlicherZustand) => void = () => {}, beimEintritt: () => void = () => {}): Szene {
  return { element, aktualisiere, beimEintritt };
}

function entscheidungVon(k: Pick<SzenenKontext, 'station' | 'z'>): Entscheidung | null {
  return k.z.rolle !== null ? k.station.szenen[k.z.rolle]?.entscheidung ?? null : null;
}

/* -------------------------------------------------------------------- Prolog -- */

function prolog(k: SzenenKontext): Szene {
  const fall = k.inhalte.fall;
  const figuren = fall !== null ? Object.values(fall.figuren) : [];
  const text0 = k.schritt.felder['text'] ?? '';
  return szene(h('div', { class: 'prolog' },
    h('div', { class: 'karte prolog-text anim-auftauchen' }, inhalt(text0), k.schritt.bloecke.map((b) => B.block(b, k.inhalte, W.originalWoertlich))),
    figuren.length > 0 ? h('div', { class: 'karte prolog-besetzung anim-auftauchen', style: '--verzug:160ms' },
      h('h3', { class: 'karte-titel' }, B.sym('person'), W.besetzung),
      h('ul', { class: 'besetzung besetzung-raster' }, figuren.map((f) => h('li', null, personFigur(f.id, 44, k.inhalte), h('div', null, h('b', null, f.name), h('span', null, f.funktion)))))) : null));
}

function rollenwahl(k: SzenenKontext): Szene {
  const karten = k.inhalte.rollenFolge.map((id, i) => {
    const r = k.inhalte.rollen[id];
    if (r === undefined) return null;
    const knopf = h('button', {
      type: 'button',
      class: 'rollen-karte',
      'data-rolle': rollenAttr(id),
      'data-pruef': `rolle-${id}`,
      'aria-pressed': k.z.rolle === id ? 'true' : 'false',
      disabled: !r.spielbar,
      style: `--verzug:${i * 70}ms`,
      onclick: () => {
        if (!r.spielbar) return;
        tu(k, { art: 'waehleRolle', rolle: id });
        k.takt.spaeter(() => tu(k, { art: 'weiter' }), 450);
      },
    },
    r.figur !== null ? personFigur(r.figur, 56, k.inhalte) : null,
    h('span', { class: 'rollen-karte-text' },
      h('b', null, r.titel),
      r.felder.linse !== undefined ? h('span', { class: 'rollen-karte-linse' }, inhaltInline(r.felder.linse)) : null),
    h('span', { class: `badge${r.spielbar ? '' : ' ist-folgt'}`, 'data-rolle': r.spielbar ? rollenAttr(id) : null }, r.spielbar ? W.spielbar : W.folgt));
    return knopf;
  });
  const el = h('div', { class: 'stapel rollenwahl' },
    h('div', { class: 'szene-einleitung' }, inhalt(k.schritt.felder['text'] ?? '')),
    h('div', { class: 'rollen-raster', role: 'group', 'aria-label': k.schritt.titel }, karten));
  return szene(el, (z) => {
    for (const b of el.querySelectorAll<HTMLElement>('.rollen-karte')) attr(b, 'aria-pressed', b.dataset['pruef'] === `rolle-${z.rolle}` ? 'true' : 'false');
  });
}

function interessenwahl(k: SzenenKontext): Szene {
  const knoepfe = k.inhalte.interessen.map((i) => h('button', {
    type: 'button',
    class: 'knopf knopf-still interesse',
    'data-pruef': `interesse-${i.id}`,
    'aria-pressed': k.z.interessen.includes(i.id) ? 'true' : 'false',
    onclick: () => {
      const jetzt = k.z.interessen;
      tu(k, { art: 'setzeInteressen', interessen: jetzt.includes(i.id) ? jetzt.filter((x) => x !== i.id) : [...jetzt, i.id] });
    },
  }, B.sym('haken'), i.titel));
  const el = h('div', { class: 'stapel interessenwahl' },
    h('div', { class: 'szene-einleitung' }, inhalt(k.schritt.felder['text'] ?? '')),
    h('div', { class: 'interessen reihe', role: 'group', 'aria-label': k.schritt.titel }, knoepfe),
    h('div', { class: 'reihe' }, h('button', { type: 'button', class: 'knopf knopf-gold', 'data-pruef': 'szene-weiter', onclick: () => tu(k, { art: 'weiter' }) },
      B.sym('pfeilRechts'), h('span', null, h('b', null, kopfText(k.schritt.kopf, 'knopf') ?? W.weiter)))));
  return szene(el, (z) => {
    k.z = z;
    knoepfe.forEach((b, i) => attr(b, 'aria-pressed', z.interessen.includes(k.inhalte.interessen[i]?.id ?? '') ? 'true' : 'false'));
  });
}

/* ------------------------------------------------------------ Welt A: Einstieg -- */

function einstieg(k: SzenenKontext): Szene {
  const mails = k.schritt.bloecke.filter((b) => b.art === 'mail');
  const chats = k.schritt.bloecke.filter((b) => b.art === 'chat' || b.art === 'anruf');
  const notizen = k.schritt.bloecke.filter((b) => b.art === 'notiz');
  const requisiten = k.schritt.bloecke.filter((b) => b.art === 'protokoll' || b.art === 'akten');
  const woerter = { eingang: W.posteingang, neu: W.neu, betreff: W.betreff, anhang: W.anhang, sie: W.sieSelbst };
  const ich = k.z.rolle !== null ? k.inhalte.rollen[k.z.rolle]?.figur ?? null : null;
  const faeden = [
    'M25 22 C 50 42, 50 58, 75 72', 'M75 28 C 43 45, 57 52, 25 68', 'M25 22 C 37 2, 67 0, 75 28',
    'M25 68 C 13 99, 87 99, 75 72', 'M75 28 C 104 57, 3 42, 25 68',
  ];
  const einleitung = k.schritt.felder['text'] ? h('div', { class: 'szene-einleitung', 'data-pruef': 'einstieg-text' }, inhalt(k.schritt.felder['text'])) : null;
  return szene(h('div', { class: 'stapel' }, einleitung, h('div', { class: 'einstieg' },
    h('div', { class: 'einstieg-feed' },
      mails.map((b, i) => h('div', { class: 'anim-auftauchen', style: `--verzug:${80 + i * 200}ms` }, B.mail(b, k.inhalte, woerter, ich))),
      chats.map((b, i) => B.chat(b, k.inhalte, 700 + i * 300, ich, W.sieSelbst)),
      requisiten.map((b, i) => (b.art === 'protokoll' ? B.protokoll(b, 900 + i * 200) : B.akten(b, 900 + i * 200)))),
    notizen.length > 0 ? h('div', { class: 'pinnwand', role: 'group', 'aria-label': W.randnotizen },
      h('span', { class: 'pinnwand-label t-label', 'aria-hidden': 'true' }, W.randnotizen),
      s('svg', { class: 'faeden', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
        faeden.slice(0, Math.max(0, notizen.length + 1)).map((d, i) => s('path', { d, style: `--verzug:${1.8 + i * 0.2}s` }))),
      notizen.map((b, i) => B.haftnotiz(b, i, 1300 + i * 150))) : null)));
}

/* ----------------------------------------------------------- Welt A: Lagebild -- */

function lage(k: SzenenKontext): Szene {
  const bloecke = k.schritt.bloecke;
  const dateien = bloecke.filter((b) => b.art === 'datei');
  const bekannt = bloecke.find((b) => b.art === 'bekannt') ?? null;
  const unbekannt = bloecke.find((b) => b.art === 'unbekannt') ?? null;
  const sprung = bloecke.find((b) => b.art === 'zeitsprung' && b.id !== null) ?? null;
  const angefordert = sprung !== null && k.z.info.includes(`${k.station.id}/${sprung.id}`);
  const loest = sprung !== null ? kopfKarte(sprung.kopf, 'loest') : {};
  const bleibt = sprung !== null ? kopfKarte(sprung.kopf, 'bleibt') : {};
  const zwilling: Node[] = [];
  dateien.forEach((d, i) => {
    if (i > 0) zwilling.push(h('span', { class: 'ungleich', 'aria-hidden': 'true' }, '≠'));
    zwilling.push(B.tabellenstand(d, i));
  });
  const knopfWeiter = kopfText(k.schritt.kopf, 'knopf');
  const el = h('div', { class: 'stapel lage' },
    angefordert && sprung !== null ? h('div', { class: 'spaeter' }, B.sym('vorspulen'), h('b', null, kopfText(sprung.kopf, 'dauer') ?? ''), h('span', null, inhaltInline(sprung.felder['text'] ?? ''))) : null,
    h('div', { class: 'lage-raster' },
      h('section', { class: 'karte lage-bekannt anim-auftauchen', 'aria-label': W.bekannt, style: '--verzug:60ms' },
        h('h3', { class: 'karte-titel' }, B.sym('haken'), W.bekannt),
        zwilling.length > 0 ? h('div', { class: 'zwilling' }, zwilling) : null,
        bekannt !== null ? h('ul', { class: 'lage-liste' }, (bekannt.liste ?? []).map((p) => h('li', null, inhaltInline(p.html)))) : null,
        angefordert && sprung !== null && sprung.felder['neuBekannt'] ? h('div', { class: 'neu-hinweis' }, h('span', { class: 'neu-marke' }, W.neuBekannt), inhalt(sprung.felder['neuBekannt'])) : null),
      unbekannt !== null ? h('section', { class: 'karte ist-leise lage-unbekannt anim-auftauchen', 'aria-label': W.unbekannt, style: '--verzug:180ms' },
        h('h3', { class: 'karte-titel' }, B.sym('frage'), W.unbekannt),
        h('ul', { class: 'ungeklaert' }, (unbekannt.liste ?? []).map((p) => {
          const geloest = angefordert && p.id !== null ? kopfText(loest, p.id) : null;
          const offen = angefordert && p.id !== null ? kopfText(bleibt, p.id) : null;
          return h('li', { class: geloest !== null ? 'ist-geloest' : offen !== null ? 'ist-offen' : null },
            h('span', { class: 'fragezeichen', 'aria-hidden': 'true' }, geloest !== null ? B.sym('haken') : '?'),
            h('span', { class: 'ungeklaert-text' }, inhaltInline(p.html)),
            geloest !== null ? h('span', { class: 'ungeklaert-tag' }, geloest) : offen !== null ? h('span', { class: 'ungeklaert-tag ist-offen' }, offen) : null);
        }))) : null),
    h('div', { class: 'lage-aktionen reihe' },
      sprung !== null && sprung.id !== null ? h('button', {
        type: 'button', class: 'knopf knopf-navy', 'data-pruef': 'info-anfordern', disabled: angefordert,
        onclick: () => tu(k, { art: 'fordereInfo', info: sprung.id as string }),
      }, B.sym('vorspulen'), h('span', null, h('b', null, kopfText(sprung.kopf, 'knopf') ?? ''), kopfText(sprung.kopf, 'kosten') !== null ? h('small', null, kopfText(sprung.kopf, 'kosten')) : null)) : null,
      h('button', { type: 'button', class: 'knopf knopf-gold', 'data-pruef': 'szene-weiter', onclick: () => tu(k, { art: 'weiter' }) },
        B.sym('pfeilRechts'), h('span', null, h('b', null, knopfWeiter ?? W.weiter)))));
  return szene(el);
}

/* ------------------------------------------------------- Entscheidung A–D -- */

/** Chips der Kurzlage: Stände aus den Excel-Dateien, offene bzw. geklärte Punkte des Lagebilds. */
function kurzlage(k: SzenenKontext): HTMLElement | null {
  const chips: HTMLElement[] = [];
  for (const sch of k.station.schritte) {
    for (const b of sch.bloecke) {
      if (b.art === 'datei' && kopfText(b.kopf, 'wert') !== null) chips.push(h('span', { class: 'chip' }, kopfText(b.kopf, 'wert'), ' ', h('small', null, kopfText(b.kopf, 'quelle') ?? '')));
    }
    const sprung = sch.bloecke.find((b) => b.art === 'zeitsprung' && b.id !== null);
    const angefordert = sprung !== undefined && k.z.info.includes(`${k.station.id}/${sprung.id}`);
    const loest = sprung !== undefined ? kopfKarte(sprung.kopf, 'loest') : {};
    for (const b of sch.bloecke) {
      if (b.art !== 'unbekannt') continue;
      for (const p of b.liste ?? []) {
        const geloest = angefordert && p.id !== null ? kopfText(loest, p.id) : null;
        chips.push(h('span', { class: `chip${geloest === null ? ' ist-warnung' : ''}` }, inhaltInline(p.html), h('small', null, geloest ?? '?')));
      }
    }
  }
  if (chips.length === 0) return null;
  return h('div', { class: 'kurzlage anim-einblenden' }, h('span', { class: 't-label' }, W.lage), chips);
}

function optionKnopf(o: Option, i: number, gewaehlt: string | null, beiWahl: (id: string) => void): HTMLButtonElement {
  return h('button', {
    type: 'button',
    class: 'option',
    'data-option': o.id,
    'data-pruef': `option-${o.id}`,
    'aria-pressed': gewaehlt === o.id ? 'true' : 'false',
    'aria-keyshortcuts': o.id,
    style: `--verzug:${i * 80 + 60}ms`,
    onclick: () => beiWahl(o.id),
  },
  h('kbd', { class: 'option-taste', 'aria-hidden': 'true' }, o.id),
  h('span', { class: 'option-text' }, h('span', { class: 'nur-sr' }, `${W.option} ${o.id}: `), o.titel),
  h('span', { class: 'option-symbol' }, B.symbolAusInhalt(o.symbol)));
}

function optionen(k: SzenenKontext, ent: Entscheidung, weiterNachWahl: boolean): { element: HTMLElement; setze(z: OeffentlicherZustand): void } {
  const gewaehlt = k.z.entscheidungen[ent.id] ?? null;
  const knoepfe: HTMLButtonElement[] = [];
  const beiWahl = (id: string): void => {
    if (k.tue === null) return;
    tu(k, { art: 'waehle', option: id, zeit: Date.now() });
    const b = knoepfe.find((x) => x.dataset['option'] === id);
    if (b !== undefined) {
      b.classList.remove('ist-bestaetigt');
      void b.offsetWidth;
      b.classList.add('ist-bestaetigt');
    }
    if (weiterNachWahl) k.takt.spaeter(() => tu(k, { art: 'weiter' }), 520);
  };
  ent.optionen.forEach((o, i) => knoepfe.push(optionKnopf(o, i, gewaehlt, beiWahl)));
  const element = h('div', { class: 'optionen', role: 'group', 'aria-label': W.optionen }, knoepfe);
  return {
    element,
    setze(z) {
      const w = z.entscheidungen[ent.id] ?? null;
      for (const b of knoepfe) attr(b, 'aria-pressed', b.dataset['option'] === w ? 'true' : 'false');
    },
  };
}

function optionsHinweis(ent: Entscheidung): HTMLElement {
  const erste = ent.optionen[0]?.id ?? 'A';
  const letzte = ent.optionen[ent.optionen.length - 1]?.id ?? 'D';
  return h('p', { class: 'options-hinweis' }, B.sym('info'), `${W.optionenHinweis[0]} `, h('kbd', null, erste), '–', h('kbd', null, letzte), `. ${W.optionenHinweis[1]}`);
}

function entscheidung(k: SzenenKontext): Szene {
  const ent = entscheidungVon(k);
  if (ent === null) return generisch(k);
  const opt = optionen(k, ent, true);
  return szene(h('div', { class: 'stapel entscheidung' }, kurzlage(k), opt.element, optionsHinweis(ent)), (z) => opt.setze(z));
}

/* --------------------------------------------------------------- Konsequenz -- */

function konsequenz(k: SzenenKontext): Szene {
  const ent = entscheidungVon(k);
  if (ent === null) return generisch(k);
  const wahl = k.z.entscheidungen[ent.id] ?? null;
  const o = ent.optionen.find((x) => x.id === wahl) ?? null;
  if (o === null) {
    const opt = optionen(k, ent, false);
    return szene(h('div', { class: 'stapel' }, h('div', { class: 'karte keine-wahl' }, h('p', null, h('b', null, W.keineWahl), ' ', ent.frage), opt.element, optionsHinweis(ent))), (z) => opt.setze(z));
  }
  // Status vor und nach der Wahl (die Engine rechnet ihn aus dem Verlauf neu)
  const welt = k.station.welt ?? 'A';
  const ohne = { ...k.z.entscheidungen };
  delete ohne[ent.id];
  const vorher = berechneStatus({ verlauf: k.z.verlauf, rolle: k.z.rolle, entscheidungen: ohne, info: k.z.info }, k.inhalte)[welt];
  const nachher = k.z.status[welt];
  const saetze = aenderungsSaetze(vorher, nachher);
  const nachsatz = ent.nachsatz !== null ? inhalt(ent.nachsatz) : null;
  const fuss = h('div', { class: 'feld-fuss anim-einblenden', style: '--verzug:700ms' });
  if (nachsatz !== null) {
    [...nachsatz.querySelectorAll('p')].forEach((p, i) => {
      if (i === 0) fuss.append(h('p', { class: 'kernsatz-kurz' }, ...p.childNodes));
      else fuss.append(h('p', { class: 'gedaechtnis' }, B.sym('lesezeichen'), h('span', null, ...p.childNodes)));
    });
  }
  const feld = (art: string, symbol: 'blitz' | 'puzzle' | 'warnung' | 'kompass', titel: string, html: string, verzug: number): HTMLElement =>
    h('section', { class: 'feld', 'data-art': art, 'data-pruef': `feld-${art}`, style: `--verzug:${verzug}ms` }, h('h3', null, B.sym(symbol), titel), h('div', null, inhalt(html)));
  const nochmal = h('div', { class: 'nochmal', role: 'group', 'aria-label': W.andereWahl }, h('span', { class: 't-label' }, W.andereWahl),
    ent.optionen.map((x) => h('button', {
      type: 'button', class: 'nochmal-knopf', 'aria-pressed': x.id === wahl ? 'true' : 'false', 'aria-label': `${W.option} ${x.id}: ${x.titel}`, 'data-pruef': `nochmal-${x.id}`,
      onclick: () => tu(k, { art: 'waehle', option: x.id, zeit: Date.now() }),
    }, x.id)));
  return szene(h('div', { class: 'stapel konsequenz', 'data-pruef': 'konsequenz' },
    h('div', { class: 'wahl-kopf' },
      h('div', { class: 'wahl anim-einblenden' }, h('kbd', { class: 'option-taste', 'aria-hidden': 'true' }, o.id), h('div', null, h('span', { class: 't-label' }, W.ihreWahl), h('b', null, o.titel))),
      nochmal),
    h('div', { class: 'status-leiste anim-einblenden', style: '--verzug:300ms', 'data-pruef': 'status-aenderung' }, h('span', { class: 't-label' }, W.status),
      saetze.length > 0
        ? saetze.map((x) => h('span', { class: 'status-satz' }, elementAus(statusSymbol(x.richtung === 'gut' ? 'ok' : 'kritisch')), x.text))
        : h('span', { class: 'status-satz' }, elementAus(statusSymbol('neutral')), W.statusUnveraendert)),
    // H15 (P1.5): Konsequenz und Governance-Frage stehen offen; „Was fehlt“ und „Neues Risiko“ klappt man auf
    h('div', { class: 'felder' },
      feld('konsequenz', 'blitz', W.konsequenz, o.felder.konsequenz, 120),
      feld('governance', 'kompass', W.governanceFrage, o.felder.governanceFrage, 260)),
    h('details', { class: 'felder-mehr anim-einblenden', style: '--verzug:400ms', 'data-pruef': 'felder-mehr' },
      h('summary', null, B.sym('puzzle'), `${W.wasFehlt} · ${W.neuesRisiko}`),
      h('div', { class: 'felder' },
        feld('fehlt', 'puzzle', W.wasFehlt, o.felder.wasFehlt, 0),
        feld('risiko', 'warnung', W.neuesRisiko, o.felder.neuesRisiko, 0))),
    fuss));
}

/* ------------------------------------------------ Vergleich Welt A ⟷ Welt B -- */

function stueckA(b: Block, inhalte: OeffentlicheInhalte): Node {
  const art = kopfText(b.kopf, 'a') ?? 'notiz';
  const html = b.felder['weltA'] ?? '';
  if (art === 'mail' || art === 'chat') {
    const von = kopfText(b.kopf, 'von');
    const name = von !== null ? personName(von, inhalte).split(' ').pop() ?? '' : '';
    return h('div', { class: `morph-karte morph-${art}` }, h('div', { class: 'morph-kopf' }, B.sym(art === 'mail' ? 'mail' : 'chat'), name), inhaltInline(html));
  }
  if (art === 'datei') {
    const f = inhaltInline(html);
    const stark = (f as DocumentFragment).querySelector('strong');
    const zahl = stark?.textContent ?? '';
    stark?.remove();
    const rest = (f.textContent ?? '').replace(/^\s*·\s*/, '').trim();
    return h('div', { class: 'morph-karte morph-datei' }, h('b', null, zahl), h('span', { class: 'mono' }, rest));
  }
  return h('div', { class: 'morph-karte morph-notiz', 'data-farbe': B.notizFarbe(kopfText(b.kopf, 'farbe')) }, inhaltInline(html));
}

function stueckB(b: Block): Node | null {
  const art = kopfText(b.kopf, 'b');
  const html = b.felder['weltB'];
  if (art === null || html === undefined || html === '') return null;
  if (art === 'datenstand') {
    const t = inhaltInline(html).textContent ?? '';
    const i = t.indexOf(': ');
    return h('div', { class: 'morph-baustein morph-datenstand' }, h('span', { class: 't-label' }, B.sym('haken'), i >= 0 ? t.slice(0, i) : t), i >= 0 ? h('span', { class: 'mono' }, t.slice(i + 2)) : null);
  }
  if (art === 'markierung') return h('div', { class: 'morph-baustein morph-markierung' }, inhaltInline(html));
  const kennung = kopfText(b.kopf, 'kennung');
  return h('div', { class: 'morph-baustein' }, kennung !== null ? h('span', { class: 'mono' }, kennung) : null, h('span', null, inhaltInline(html)));
}

function vergleich(k: SzenenKontext): Szene {
  const paare = k.schritt.bloecke.filter((b) => b.art === 'paar');
  const kennzahlen = k.schritt.bloecke.filter((b) => b.art === 'kennzahl');
  const hinweise = k.schritt.bloecke.filter((b) => b.art === 'hinweis');
  const stuecke: VergleichsStueck[] = paare.map((b) => {
    const fluss = kopfText(b.kopf, 'fluss');
    const bKnoten = stueckB(b);
    return { a: stueckA(b, k.inhalte), aArt: kopfText(b.kopf, 'a') ?? 'notiz', b: bKnoten, bArt: bKnoten !== null ? kopfText(b.kopf, 'b') : null, fluss: istFlussPosition(fluss) ? fluss : null };
  });
  // Position im Fluss: die Station der B-Seite steht bei der Entscheidung (Fluss-Baustein dort), sonst „Entscheidung“.
  const bStation = k.station.vergleich !== null ? k.inhalte.stationen[k.station.vergleich.b] ?? null : null;
  const flussBlock = bStation !== null ? alleBloecke(bStation.schritte.flatMap((x) => x.bloecke)).find((b) => b.art === 'fluss') : undefined;
  const pos = flussBlock !== undefined ? kopfText(flussBlock.kopf, 'position') : null;
  const grafik = vergleichSzene({ stuecke, hier: istFlussPosition(pos) ? pos : 'entscheidung', marken: { a: W.weltAChaos, b: W.weltBFluss } });
  const sr = h('p', { class: 'nur-sr', 'aria-live': 'polite' });
  const regler = weltRegler({
    beiWert: k.tue !== null ? (v) => tu(k, { art: 'setzeVergleich', wert: v }) : null,
    beschriftung: { a: W.weltA, aZusatz: W.ohneMvg, b: W.weltB, bZusatz: W.mitMvg, regler: W.regler },
  });
  const kacheln = kennzahlen.map((b) => {
    const zahl = h('b', null, String(kopfZahl(b.kopf, 'a') ?? 0));
    return { zahl, a: kopfZahl(b.kopf, 'a') ?? 0, b: kopfZahl(b.kopf, 'b') ?? 0, el: h('div', { class: 'kachel' }, zahl, h('span', null, inhaltInline(b.felder['text'] ?? ''))) };
  });
  const ablesung = kacheln.length > 0 ? h('div', { class: 'ablesung', 'data-welt': 'a', 'aria-live': 'off' }, kacheln.map((x) => x.el)) : null;
  const knopf = kopfText(k.schritt.kopf, 'knopf');
  const el = h('div', { class: 'stapel vergleich-schritt' },
    h('p', { class: 'vergleich-hinweis' }, B.sym('info'), h('span', null, hinweise.map((b) => inhaltInline(b.felder['text'] ?? ''))), k.tue !== null ? h('span', { class: 'regler-anleitung' }, W.reglerHinweis) : null),
    grafik.element,
    sr,
    regler.element,
    ablesung,
    h('div', { class: 'reihe' }, h('button', { type: 'button', class: 'knopf knopf-gold', 'data-pruef': 'szene-weiter', onclick: () => tu(k, { art: 'weiter' }) }, B.sym('pfeilRechts'), h('span', null, h('b', null, knopf ?? W.weiter)))));

  let angezeigt = -1;
  let seite: boolean | null = null;
  let gleitNr = 0;
  const zeige = (t: number): void => {
    angezeigt = t;
    grafik.setze(t);
    const b = t >= 0.5;
    if (b !== seite) {
      const erst = seite === null;
      seite = b;
      if (ablesung !== null) ablesung.setAttribute('data-welt', b ? 'b' : 'a');
      for (const x of kacheln) {
        const von = Number(x.zahl.textContent ?? '0');
        const nach = b ? x.b : x.a;
        if (erst) x.zahl.textContent = String(nach);
        else zaehle(x.zahl, von, nach, 500);
      }
      sr.replaceChildren(inhaltInline((b ? k.schritt.felder['weltB'] : k.schritt.felder['weltA']) ?? ''));
    }
  };
  const aktualisiere = (z: OeffentlicherZustand): void => {
    regler.setze(z.vergleich);
    const ziel = z.vergleich;
    if (angezeigt < 0 || Math.abs(ziel - angezeigt) <= 0.25) {
      gleitNr += 1;
      zeige(ziel);
      return;
    }
    // Sprung (z. B. Regie „Welt B“): hier sanft nachziehen, Endstand = Zustand.
    const nr = ++gleitNr;
    const von = angezeigt;
    k.takt.schleife(900, (p) => {
      if (nr === gleitNr) zeige(von + (ziel - von) * sanftBeide(p));
    });
  };
  // Fensterbreite geändert: Fäden neu legen (breit/hochkant); der Zuhörer meldet sich selbst ab,
  // sobald die Szene nicht mehr im Dokument steht.
  const beiGroesse = (): void => {
    if (!grafik.element.isConnected) {
      window.removeEventListener('resize', beiGroesse);
      return;
    }
    grafik.neuZeichnen();
  };
  return szene(el, aktualisiere, () => {
    aktualisiere(k.z);
    regler.lade();
    if (typeof window !== 'undefined') window.addEventListener('resize', beiGroesse);
  });
}

/* -------------------------------------------------------------- Welt B: Teile -- */

function teileLeiste(k: SzenenKontext): HTMLElement | null {
  if (k.schritt.gruppe === null) return null;
  const gruppe = gruppiere(k.schritte).find((g) => g.indizes.includes(k.index));
  if (gruppe === undefined || gruppe.indizes.length < 2) return null;
  const pos = schrittPosition(k.schritte, k.index);
  return h('nav', { class: 'teile', 'aria-label': `${W.teile}: ${gruppe.kurz}` }, gruppe.indizes.map((idx, t) => {
    const sch = k.schritte[idx];
    return h('button', {
      type: 'button',
      class: `teil${t + 1 < pos.takt ? ' ist-erledigt' : ''}`,
      'aria-current': t + 1 === pos.takt ? 'step' : null,
      'data-pruef': `teil-${t + 1}`,
      onclick: () => tu(k, { art: 'geheZu', station: k.station.id, schritt: idx }),
    }, h('i', null, String(t + 1)), h('span', null, sch?.kurz ?? ''));
  }));
}

function signal(k: SzenenKontext): Szene {
  const bl = k.schritt.bloecke;
  const grafik = bl.find((b) => b.art === 'grafik');
  const kette = bl.find((b) => b.art === 'kette');
  const merksatz = bl.find((b) => b.art === 'merksatz');
  // Schritttext und weitere Blöcke (z. B. eine Register-Tafel) nicht verschlucken (P5.6)
  const text = k.schritt.felder['text'] ? h('div', { class: 'karte' }, inhalt(k.schritt.felder['text'])) : null;
  const weitere = bl.filter((b) => b !== grafik && b !== kette && b !== merksatz).map((b) => B.block(b, k.inhalte, W.originalWoertlich, k.z.verlauf, k.z.rolle));
  const raster = h('div', { class: 'signal-raster' },
    grafik !== undefined ? grafikBlock(grafik) : null,
    kette !== undefined ? B.kette(kette, k.inhalte, 1500) : null,
    merksatz !== undefined ? h('div', { class: 'signal-merksatz' }, B.merksatz(merksatz, 3000)) : null);
  return szene(text === null && weitere.every((x) => x === null) ? raster : h('div', { class: 'stapel' }, text, raster, weitere));
}

function grafikBlock(b: Block): HTMLElement {
  const beschreibung = inhaltInline(b.felder['text'] ?? '').textContent ?? '';
  if (b.id === 'ctc-verlauf') {
    return ctcVerlauf({ titel: kopfText(b.kopf, 'titel'), untertitel: kopfText(b.kopf, 'untertitel'), beschreibung, monate: ['M1', 'M2', 'M3', 'M4', 'M5'], schwelle: 'Schwellenwert' });
  }
  return h('figure', { class: 'verlauf' }, h('figcaption', null, h('span', { class: 't-label' }, kopfText(b.kopf, 'titel') ?? '')), h('p', null, beschreibung));
}

function datenstandTeil(k: SzenenKontext): Szene {
  const b = k.schritt.bloecke.find((x) => x.art === 'datenstand');
  if (b === undefined) return generisch(k);
  const d = B.datenstand(b, { titel: W.datenstandTitel, siegel: W.verbindlich, vergleich: W.zumVergleich });
  return szene(d.element, () => {}, () => {
    for (const z of d.zahlen) {
      const roh = z.getAttribute('data-wert') ?? '';
      const zahl = Number(roh.replace(/[^\d,.-]/g, '').replace(',', '.'));
      const vorzeichen = roh.trim().startsWith('+') ? '+' : '';
      const stellen = (roh.split(',')[1] ?? '').length;
      if (Number.isFinite(zahl)) zaehle(z, 0, zahl, 1300, (v) => `${vorzeichen}${dezimal(v, stellen)}`);
    }
  });
}

function mandatTeil(k: SzenenKontext): Szene {
  const leiterBlock = k.schritt.bloecke.find((b) => b.art === 'mandatsleiter');
  if (leiterBlock === undefined) return generisch(k);
  const optionenBl = k.schritt.bloecke.filter((b) => b.art === 'mandatsoption' && b.id !== null);
  const merksatz = k.schritt.bloecke.find((b) => b.art === 'merksatz');
  const stufen: LeiterStufe[] = kopfListe(leiterBlock.kopf, 'stufen').filter(istKarte).map((x) => ({
    wer: String(x['wer'] ?? ''),
    bereich: String(x['bereich'] ?? ''),
    bisTeur: typeof x['bisTeur'] === 'number' ? x['bisTeur'] : null,
    hinweis: typeof x['hinweis'] === 'string' ? x['hinweis'] : null,
  }));
  const betragText = kopfText(leiterBlock.kopf, 'betrag') ?? '';
  const stufeVon = (id: string | null): number => kopfZahl(optionenBl.find((b) => b.id === id)?.kopf ?? {}, 'stufe') ?? 1;
  const wahl0 = mandatsWahl(k.z, k.station.id, k.schritt);
  const leiter = mandatsleiter({ stufen, betragTeur: kopfZahl(leiterBlock.kopf, 'betragTeur') ?? 0, betragText, ziel: stufeVon(wahl0), stufeWort: W.stufe, titel: W.musterMandatsleiter });
  const knoepfe = optionenBl.map((b) => h('button', {
    type: 'button',
    class: 'mandat-option',
    'data-option': b.id,
    'data-pruef': `mandat-option-${b.id}`,
    'aria-pressed': b.id === wahl0 ? 'true' : 'false',
    onclick: () => tu(k, { art: 'zeige', schluessel: ansichtSchluessel(k.station.id, k.schritt.id), wert: b.id as string }),
  }, h('span', { class: 'mandat-punkt', 'aria-hidden': 'true' }), h('span', { class: 't-label' }, `${W.option} ${b.id}`), h('b', null, kopfText(b.kopf, 'titel') ?? ''), h('span', null, kopfText(b.kopf, 'detail') ?? '')));
  const urteil = h('div', { class: 'urteil', 'aria-live': 'polite', 'data-pruef': 'urteil' });
  let letzte: string | null = null;
  const setze = (z: OeffentlicherZustand, erst: boolean): void => {
    const wahl = mandatsWahl(z, k.station.id, k.schritt);
    for (const b of knoepfe) attr(b, 'aria-pressed', b.dataset['option'] === wahl ? 'true' : 'false');
    if (wahl === letzte) return;
    letzte = wahl;
    const o = optionenBl.find((b) => b.id === wahl);
    urteil.replaceChildren(h('span', { class: 't-label' }, W.zustaendig(betragText)), h('b', null, kopfText(o?.kopf ?? {}, 'zustaendig') ?? ''), h('div', null, inhalt(o?.felder['text'] ?? '')));
    if (!erst) {
      urteil.classList.remove('ist-neu');
      void urteil.offsetWidth;
      urteil.classList.add('ist-neu');
    }
    leiter.setzeZiel(stufeVon(wahl));
  };
  setze(k.z, true);
  const el = h('div', { class: 'mandat-raster' },
    leiter.element,
    h('div', { class: 'mandat-seite' },
      h('span', { class: 't-label mandat-titel' }, W.musterMandatsleiter),
      h('div', { class: 'mandat-frage' }, inhaltInline(leiterBlock.felder['text'] ?? '')),
      h('div', { class: 'mandat-optionen', role: 'group', 'aria-label': W.mandatFrage }, knoepfe),
      urteil,
      merksatz !== undefined ? B.merksatz(merksatz) : null));
  return szene(el, (z) => setze(z, false), () => leiter.klettere(k.takt));
}

function vorlageTeil(k: SzenenKontext): Szene {
  const b = k.schritt.bloecke.find((x) => x.art === 'vorlage');
  if (b === undefined) return generisch(k);
  const szeneRolle = k.z.rolle !== null ? k.station.szenen[k.z.rolle] ?? null : null;
  const frage = szeneRolle?.fragen.find((f) => f.schritt === k.schritt.id) ?? null;
  const grafik = vorlageGrafik({
    id: b.id ?? '',
    titel: kopfText(b.kopf, 'titel') ?? '',
    meta: kopfText(b.kopf, 'datenstand') !== null ? `Datenstand: ${kopfText(b.kopf, 'datenstand')}` : null,
    frage: inhaltInline(b.felder['frage'] ?? ''),
    punkte: (b.liste ?? []).map((p) => ({ inhalt: inhaltInline(p.html), stand: (p.stand ?? 'offen') as PruefStand })),
  });
  const schluessel = frage !== null ? `${k.station.id}/${k.z.rolle ?? ''}/${frage.id}` : '';
  const rueck = h('div', { class: 'reife-rueckmeldung', 'aria-live': 'polite', 'data-pruef': 'rueckmeldung' });
  const knoepfe = (frage?.antworten ?? []).map((a) => h('button', {
    type: 'button', class: 'knopf knopf-still', 'data-antwort': a.id, 'data-pruef': `reife-${a.id}`, 'aria-pressed': 'false',
    onclick: () => tu(k, { art: 'antworte', frage: frage?.id ?? '', antwort: a.id }),
  }, B.symbolAusInhalt(a.symbol), a.titel));
  const reife = frage !== null ? h('div', { class: 'reife' },
    h('div', { class: 'reife-frage' }, h('div', { class: 'reife-titel' }, inhalt(frage.felder.frage)), h('div', { class: 'reife-knoepfe', role: 'group', 'aria-label': W.ihreEinschaetzung }, knoepfe)),
    rueck) : null;
  let letzte: string | null | undefined;
  const setze = (z: OeffentlicherZustand, erst: boolean): void => {
    const antwort = schluessel !== '' ? z.antworten[schluessel] ?? null : null;
    for (const kn of knoepfe) attr(kn, 'aria-pressed', kn.dataset['antwort'] === antwort ? 'true' : 'false');
    if (antwort === letzte) return;
    letzte = antwort;
    const a = frage?.antworten.find((x) => x.id === antwort) ?? null;
    if (a === null || frage === null) {
      rueck.replaceChildren(h('p', { class: 'reife-warten' }, W.rueckmeldungWarten));
      return;
    }
    rueck.replaceChildren(h('div', { class: 'rueckmeldung', 'data-status': 'neutral' },
      a.praefix !== null ? h('b', null, elementAus(statusSymbol('neutral')), a.praefix) : null, ' ',
      inhaltInline(frage.felder.rueckmeldung ?? ''), a.html !== '' ? inhalt(a.html) : null));
    if (!erst) {
      grafik.markiereFehlende();
      reife?.classList.add('ist-bereit');
      grafik.zeigeAlle();
    }
  };
  setze(k.z, true);
  const el = h('div', { class: 'vorlage-raster' }, grafik.element, reife);
  return szene(el, (z) => setze(z, false), () => {
    if (letzte !== null && letzte !== undefined) {
      grafik.zeigeAlle();
      reife?.classList.add('ist-bereit');
      return;
    }
    grafik.tickeAb(k.takt, () => reife?.classList.add('ist-bereit'));
  });
}

function flussMarken(k: SzenenKontext, position: FlussPosition): Partial<Record<FlussPosition, FlussMarke>> {
  const alle = alleBloecke(k.station.schritte.flatMap((x) => x.bloecke));
  const glied = (art: string): Block | undefined => alle.find((b) => b.art === 'glied' && kopfText(b.kopf, 'art') === art);
  const marken: Partial<Record<FlussPosition, FlussMarke>> = {};
  const frw = glied('fruehwarnung');
  if (frw?.id) marken.fruehwarnung = { text: frw.id, mono: true };
  const best = glied('bestaetigung');
  const von = best !== undefined ? kopfText(best.kopf, 'von') : null;
  if (von !== null) {
    const rolle = k.inhalte.fall?.figuren[von]?.rolle ?? null;
    marken.bestaetigt = { text: (rolle !== null ? k.inhalte.rollen[rolle]?.kurztitel : undefined) ?? personFunktion(von, k.inhalte), mono: false };
  }
  const ris = glied('risiko');
  if (ris?.id) marken.risiko = { text: ris.id, mono: true };
  const vorl = alle.find((b) => b.art === 'vorlage' && b.id !== null);
  if (vorl?.id) marken.entscheidung = { text: vorl.id, mono: true };
  if (k.station.lph !== null) marken.freigabe = { text: `LPH ${k.station.lph}`, mono: false };
  const hier = FLUSS_POSITIONEN.indexOf(position);
  FLUSS_POSITIONEN.forEach((p, i) => {
    if (i > hier && marken[p] === undefined) marken[p] = { text: 'ausstehend', mono: false };
  });
  return marken;
}

function flussTeil(k: SzenenKontext): Szene {
  const b = k.schritt.bloecke.find((x) => x.art === 'fluss');
  const pos = b !== undefined ? kopfText(b.kopf, 'position') : null;
  if (b === undefined || !istFlussPosition(pos)) return generisch(k);
  const g = governanceFluss({ position: pos, marken: flussMarken(k, pos), hier: W.sieSindHier });
  return szene(h('div', { class: 'stapel fluss-szene' }, h('div', { class: 'fluss-lead anim-einblenden' }, inhalt(b.felder['text'] ?? '')), g.element), () => {}, () => g.laufe(k.takt));
}

/* ------------------------------------------------------------------ Rückbezug -- */

function statusZeilen(a: Status | null, b: Status | null): HTMLElement[] {
  if (a === null || b === null) return [];
  const wa = instrumentWerte(a);
  const wb = instrumentWerte(b);
  return wa.map((x, i) => {
    const y = wb[i] as (typeof wb)[number];
    const zelle = (s0: Status, w: typeof x): HTMLElement => h('td', null, h('span', { class: 'v' },
      w.grafik !== 'punkte' ? elementAus(statusSymbol(w.stufe)) : null,
      w.grafik === 'zeiger' ? `${w.zusatz ?? ''} (${statusWort(s0, w.schluessel as StatusSchluessel)})` : statusWort(s0, w.schluessel)),
    w.hinweis !== null ? h('small', null, ` (${w.hinweis})`) : null);
    return h('tr', null, h('td', null, x.label), zelle(a, x), zelle(b, y));
  });
}

function rueckbezugTeil(k: SzenenKontext): Szene {
  const rb = rueckbezug(k.z, k.inhalte);
  const inB = k.station.welt === 'B';
  let oben: Node;
  if (rb !== null && rb.option !== null) {
    const ent = Object.values(k.inhalte.stationen).flatMap((st) => Object.values(st.szenen)).map((sz) => sz.entscheidung).find((e) => e !== null && e.id === rb.entscheidung) ?? null;
    const opt = ent?.optionen.find((o) => o.id === rb.option) ?? null;
    oben = h('div', { class: 'erinnerung' },
      h('div', { class: 'erinnerung-a' }, h('span', { class: 't-label' }, inB ? W.ihreWahlA : W.ihreFruehereWahl), h('div', { class: 'wahl' }, h('kbd', { class: 'option-taste', 'aria-hidden': 'true' }, rb.option), h('b', null, opt?.titel ?? rb.kurz ?? ''))),
      h('div', { class: 'erinnerung-pfeil', 'aria-hidden': 'true' }, B.sym('pfeilRechts')),
      h('div', { class: 'erinnerung-b' }, h('span', { class: 't-label' }, inB ? W.weltBErinnert : W.weltAErinnert), h('div', null, inhalt(rb.html))));
  } else {
    oben = h('div', { class: 'erinnerung ist-ohne' }, h('div', { class: 'erinnerung-b' }, h('span', { class: 't-label' }, W.ohneWahlA), h('div', null, inhalt(rb?.html ?? ''))));
  }
  const ent = Object.values(k.inhalte.stationen).flatMap((st) => Object.values(st.szenen)).map((sz) => sz.entscheidung).find((e) => e !== null && e.id === rb?.entscheidung) ?? null;
  const wahl = ent !== null ? k.z.entscheidungen[ent.id] ?? null : null;
  const tabelle = h('div', { class: 'vergleichstabelle anim-einblenden', style: '--verzug:900ms' }, h('table', null,
    h('thead', null, h('tr', null, h('th', { scope: 'col' }, W.status), h('th', { scope: 'col', 'data-welt': 'a' }, `${W.weltA}${wahl !== null ? ` · ${W.nachWahl(wahl)}` : ''}`), h('th', { scope: 'col', 'data-welt': 'b' }, `${W.weltB} · ${W.derselbeMoment}`))),
    h('tbody', null, statusZeilen(k.z.status.A, k.z.status.B))));
  return szene(h('div', { class: 'stapel rueckbezug', 'data-pruef': 'rueckbezug' },
    h('p', { class: 'rueckbezug-kopf' }, B.sym('lesezeichen'), W.erinnert), oben, k.z.status.A !== null && k.z.status.B !== null ? tabelle : null));
}

/* --------------------------------------------------------------------- Ebenen -- */

function ebenenSzene(k: SzenenKontext): Szene {
  const ebenen = k.station.ebenen ?? [];
  if (ebenen.length === 0) return generisch(k);
  const lot = h('span', { class: 'ebenen-lot', 'aria-hidden': 'true' });
  const knoepfe = ebenen.map((e) => h('button', {
    type: 'button', class: 'ebene-knopf', 'aria-current': 'false', 'data-pruef': `ebene-knopf-${e.nr}`,
    onclick: () => tu(k, { art: 'setzeEbene', ebene: e.nr }),
  }, h('i', null, String(e.nr)), h('span', null, h('small', null, `${W.ebene} ${e.nr}`), e.titel)));
  const ort = h('div', { class: 'ebene-ort' });
  let letzte = -1;
  const setze = (z: OeffentlicherZustand): void => {
    const nr = Math.max(1, z.ebene);
    knoepfe.forEach((b, i) => attr(b, 'aria-current', ebenen[i]?.nr === nr ? 'true' : 'false'));
    if (nr !== letzte) {
      letzte = nr;
      const e = ebenen.find((x) => x.nr === nr) ?? ebenen[0];
      if (e !== undefined) {
        const teile: Node[] = [];
        const textHtml = e.felder['text'] ?? '';
        if (e.nr === 1) teile.push(h('p', { class: 'kernsatz' }, inhaltInline(textHtml)));
        else if (textHtml !== '') {
          const f = inhalt(textHtml);
          for (const t of f.querySelectorAll('table')) t.classList.add('register-tabelle');
          teile.push(h('div', { class: 'ebene-text' }, f));
        }
        for (const b of e.bloecke) {
          if (b.art === 'zitat' || b.art === 'original') teile.push(B.zitat(b, 'zitat', W.originalWoertlich));
          // Tafeln und RACI auch in Ebenen (P7.1: Weg Diagnose → Regelbetrieb, Abnahmekriterien in der Wirklichkeit)
          else if (b.art === 'tafel' || b.art === 'raci') {
            const t = B.block(b, k.inhalte, W.originalWoertlich, z.verlauf, z.rolle);
            if (t !== null) teile.push(t);
          }
        }
        ort.replaceChildren(h('section', { class: 'ebene', 'data-ebene': e.nr, 'data-pruef': `ebene-${e.nr}`, 'aria-label': `${W.ebene} ${e.nr}: ${e.titel}` },
          h('span', { class: 't-label' }, `${W.ebene} ${e.nr} · ${e.titel}`), teile));
      }
    }
    naechsterFrame(() => {
      const b = knoepfe[ebenen.findIndex((x) => x.nr === nr)];
      if (b !== undefined) lot.style.transform = `translateY(${b.offsetTop + b.offsetHeight / 2 - 7.5}px)`;
    });
  };
  setze(k.z);
  const el = h('div', { class: 'ebenen' }, h('nav', { class: 'ebenen-wahl', 'aria-label': W.ebenen }, h('div', { class: 'ebenen-linie' }), lot, knoepfe), ort);
  const vertiefungen = vertiefungenFuer(k);
  if (vertiefungen === null) return szene(el, setze);
  return szene(h('div', { class: 'stapel' }, el, vertiefungen), setze);
}

/** Vertiefungen der Station zu den im Prolog gewählten Interessen (P3.9, O-19); null, wenn keine passt. */
function vertiefungenFuer(k: SzenenKontext): HTMLElement | null {
  const passend = k.station.vertiefungen.filter((v) => k.z.interessen.includes(v.interesse));
  if (passend.length === 0) return null;
  return h('div', { class: 'vertiefungen', 'data-pruef': 'vertiefungen' }, passend.map((v) => {
    const interesse = k.inhalte.interessen.find((i) => i.id === v.interesse);
    return h('section', { class: 'vertiefung', 'data-pruef': `vertiefung-${v.interesse}`, 'aria-label': `${W.fuerSieVertieft}: ${v.titel}` },
      h('span', { class: 't-label' }, `${W.fuerSieVertieft} · ${interesse?.titel ?? v.interesse}`),
      h('h3', { class: 'vertiefung-titel' }, v.titel),
      h('div', { class: 'ebene-text' }, inhalt(v.html)));
  }));
}

/* ------------------------------------------------------------------- Rückfall -- */

function generisch(k: SzenenKontext): Szene {
  return szene(h('div', { class: 'stapel' },
    k.schritt.felder['text'] ? h('div', { class: 'karte' }, inhalt(k.schritt.felder['text'])) : null,
    k.schritt.bloecke.map((b) => zustandsBlock(b, k))));
}

/** Blöcke, die den Zustand des Lesers brauchen (Epilog, P7.6); alle anderen zeichnet der Baukasten. */
function zustandsBlock(b: Block, k: SzenenKontext): Node | null {
  const text = b.felder['text'] ? h('div', { class: 'tafel-einleitung' }, inhalt(b.felder['text'])) : null;
  if (b.art === 'spurvergleich') return h('div', { class: 'stapel spur-epilog', 'data-pruef': 'spurvergleich' }, text, spurTafel(k.z, k.inhalte, W.seite.spur));
  if (b.art === 'resuemee') return resuemee(b, k, text);
  return B.block(b, k.inhalte, W.originalWoertlich, k.z.verlauf, k.z.rolle);
}

/** Kapitelnummern der Whitepaper-Bezüge der besuchten Stationen, nach Häufigkeit (bei Gleichstand nach Nummer). */
export function kapitelDerSpur(verlauf: readonly string[], inhalte: OeffentlicheInhalte): number[] {
  const zahl = new Map<number, number>();
  for (const id of new Set(verlauf)) {
    for (const a of inhalte.stationen[id]?.whitepaper ?? []) {
      const nr = Number(/^k(\d+)/u.exec(a)?.[1] ?? NaN);
      if (Number.isInteger(nr) && nr >= 1 && nr <= 13) zahl.set(nr, (zahl.get(nr) ?? 0) + 1);
    }
  }
  return [...zahl.entries()].sort((x, y) => y[1] - x[1] || x[0] - y[0]).map(([nr]) => nr);
}

/**
 * Persönliches Resümee (P7.6): Themen = gewählte Interessen und die drei Kapitel, die Ihre Stationen am
 * häufigsten berührt haben; zwei Vertiefungen = die beiden ersten davon als Lernseiten. Prinzipien und
 * Checkliste kommen als Kinder aus den Inhalten (wortgleiche Zitate, Tafel; `hinweis` = Zwischenüberschrift).
 */
function resuemee(b: Block, k: SzenenKontext, text: Node | null): HTMLElement {
  const R = W.resuemee;
  const titel = (nr: number): string => k.inhalte.whitepaper.kapitel.find((x) => Number(x.nr) === nr)?.titel ?? '';
  const kapitel = kapitelDerSpur(k.z.verlauf, k.inhalte).slice(0, 3);
  const interessen = k.z.interessen.filter((i) => i !== 'express').map((i) => k.inhalte.interessen.find((x) => x.id === i)?.titel ?? i);
  return h('div', { class: 'stapel resuemee', 'data-pruef': 'resuemee' }, text,
    h('section', { class: 'resuemee-teil', 'data-pruef': 'resuemee-themen' },
      h('h4', { class: 'tafel-titel' }, R.themen),
      interessen.length > 0 ? h('p', null, h('span', { class: 't-label' }, `${R.interessen}: `), interessen.join(' · ')) : null,
      h('ul', { class: 'resuemee-liste' }, kapitel.map((nr) => h('li', null, R.kapitel(nr, titel(nr)))))),
    h('section', { class: 'resuemee-teil', 'data-pruef': 'resuemee-vertiefungen' },
      h('h4', { class: 'tafel-titel' }, R.vertiefungen),
      h('ul', { class: 'resuemee-liste' }, kapitel.slice(0, 2).map((nr) => h('li', null,
        k.tue !== null ? h('a', { href: `#theorie/k${nr}`, 'data-pruef': `resuemee-k${nr}` }, R.kapitel(nr, titel(nr))) : R.kapitel(nr, titel(nr)))))),
    // Ein `hinweis` im Resümee ist Zwischenüberschrift („Drei Prinzipien“, „Eine Checkliste“)
    b.kinder.map((kind) => kind.art === 'hinweis'
      ? h('h4', { class: 'tafel-titel resuemee-titel' }, inhaltInline(kind.felder['text'] ?? ''))
      : B.block(kind, k.inhalte, W.originalWoertlich, k.z.verlauf, k.z.rolle)));
}

/* ------------------------------------------------------------------ Auswahl -- */

function inhaltsSzene(k: SzenenKontext): Szene {
  const arten = new Set(k.schritt.bloecke.map((b) => b.art));
  switch (k.schritt.art) {
    case 'rollenwahl': return rollenwahl(k);
    case 'interessenwahl': return interessenwahl(k);
    case 'lage': return lage(k);
    case 'entscheidung': return entscheidung(k);
    case 'konsequenz': return konsequenz(k);
    case 'vergleich': return vergleich(k);
    case 'rueckbezug': return rueckbezugTeil(k);
    case 'ebenen': return ebenenSzene(k);
    default:
      break;
  }
  if (arten.has('mail') || arten.has('chat') || arten.has('notiz') || arten.has('protokoll') || arten.has('akten')) return einstieg(k);
  if (arten.has('kette')) return signal(k);
  if (arten.has('datenstand')) return datenstandTeil(k);
  if (arten.has('mandatsleiter')) return mandatTeil(k);
  if (arten.has('vorlage')) return vorlageTeil(k);
  if (arten.has('fluss')) return flussTeil(k);
  if (k.station.art === 'prolog') return prolog(k);
  if (k.station.art === 'rueckspulen' && k.index === 0) return rueckspulen(k);
  return generisch(k);
}

/* --------------------------------------------------------------- Rückspulen -- */

/** P4.6: Die Zeitleiste der Welt A läuft von der letzten Station zurück auf Monat 0. */
function rueckspulen(k: SzenenKontext): Szene {
  const stationen = Object.values(k.inhalte.stationen)
    .filter((st) => st.welt === 'A' && st.monat !== null && st.art === 'station')
    .sort((a, b) => (a.monat ?? 0) - (b.monat ?? 0));
  const ende = Math.max(1, ...stationen.map((st) => st.monat ?? 0));
  const links = (m: number): string => `${(m / ende) * 100}%`;
  const zeiger = h('span', { class: 'spule-zeiger', style: `left:${links(ende)}` });
  const monat = h('b', { class: 'spule-monat', 'aria-hidden': 'true' }, `${W.monat} ${ende}`);
  const punkte = stationen.map((st, i) => h('li', { class: 'spule-punkt', style: `left:${links(st.monat ?? 0)};--i:${stationen.length - 1 - i}` },
    h('span', { class: 'spule-marke' }), h('span', { class: 'spule-name' }, st.kurztitel)));
  const leiste = h('div', { class: 'spule', role: 'img', 'aria-label': W.spuleZurueck(ende) },
    h('div', { class: 'spule-bahn' }), h('ol', { class: 'spule-punkte' }, punkte), zeiger,
    h('span', { class: 'spule-null', style: 'left:0' }, `${W.monat} 0`));
  const text = k.schritt.felder['text'] ? h('div', { class: 'karte' }, inhalt(k.schritt.felder['text'])) : null;
  return szene(h('div', { class: 'stapel rueckspulen' }, h('div', { class: 'spule-rahmen' }, monat, leiste), text), () => {}, () => {
    naechsterFrame(() => {
      leiste.classList.add('ist-zurueck');
      zeiger.style.left = '0%';
      zaehle(monat, ende, 0, 2400, (v) => `${W.monat} ${Math.round(v)}`);
    });
  });
}

/** Baut die Szene des aktuellen Schritts (mit Teile-Leiste bei Gruppen). */
export function baueSzene(k: SzenenKontext): Szene {
  const innen = inhaltsSzene(k);
  const teile = teileLeiste(k);
  // Express (E8, L-43): über dem ersten Schritt einer Station, was der Leser übersprungen hat
  const express = k.index === 0 && k.station.express !== null && k.z.interessen.includes('express')
    ? h('aside', { class: 'express-karte', 'data-pruef': 'express-karte', 'aria-label': W.wasDazwischen }, h('span', { class: 't-label' }, W.wasDazwischen), inhalt(k.station.express))
    : null;
  const element = h('div', { class: 'szene', 'data-schritt': k.schritt.id }, express, teile, innen.element);
  return { element, aktualisiere: innen.aktualisiere, beimEintritt: innen.beimEintritt };
}
