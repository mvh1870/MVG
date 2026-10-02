/*
 * Einstieg der Hauptseite (P16, O-42): Hash-Router und Bereiche.
 *
 *   #start · #story(/s3) · #theorie(/<thema>) · #explore(/<werkzeug>) · #regie · #leinwand   (Unbekanntes → Start)
 *
 * Ein Fenster läuft in genau einer Betriebsart, festgelegt beim Laden:
 *   Seite    – Start, Story, Theorie, Explore; der Stand der Story liegt nur in diesem Browser
 *   Regie    – eigener Bühnenstand (eigener Speicherschlüssel), sendet den öffentlichen Stand
 *   Leinwand – zeichnet nur, was über den Kanal kommt (O-9)
 * Wechselt der Anker die Betriebsart (z. B. „Präsentieren“ → #regie), lädt das Fenster neu.
 */

import logoSvg from '../quellen/marke/logo-bm.svg';
import bildmarkeSvg from '../quellen/marke/logo-bm-bildmarke.svg';
// Abbildungen als data:-URL (P14): getrennt von inhalte.json, nur hier geladen
import abbildungsBilder from './generiert/abbildungen.json' with { type: 'json' };
import { inhalte, regieGeschichte, regieKapitel } from './inhalte/index.ts';
import { erzeugeKanal } from './regie/kanal.ts';
import { setzeMarke } from './ui/marke.ts';
import { setzeAbbildungsBilder } from './ui/bausteine/abbildung.ts';
import { istAbbildungsId, leseRoute, routeHash, type Route } from './ui/route.ts';
import { ersetze, h } from './ui/h.ts';
import { bogenKopf, ersatzBogenFuerStrgP } from './ui/druck.ts';
import { installiereTooltips, type Tooltips } from './ui/bausteine/tooltip.ts';
import { erzeugeGeschichte, ladeStand, type GeschichteFlaeche, type SpeicherGriff } from './ui/flaechen/geschichte.ts';
import { baueStart } from './ui/flaechen/start.ts';
import { baueTheorie, themaSeite, themaTitel, themen, zeigeAktuellenEintrag } from './ui/flaechen/theorie.ts';
import { baueExplore, werkzeugAus, WERKZEUGE } from './ui/flaechen/explore.ts';
import { wegStationen } from './geschichte/engine.ts';
import { erzeugeRegie } from './regie/regie.ts';
import { starteLeinwand } from './regie/leinwand.ts';
import { W } from './ui/woerter.ts';
import { fassungText } from './ui/fassung.ts';

const TITEL = W.name;
const VERSION = fassungText();
const KANAL = 'regie';

type Betriebsart = 'seite' | 'regie' | 'leinwand';

/** Ersatzbogen für Strg+P ohne eigenen Druckweg; auf der Leinwand ohne den Hinweis auf die Regie (R67) */
function ersatzDruck(mitRegie = true): { titel: string; teile: HTMLElement[] } {
  const wege = mitRegie ? W.druck.ersatzWege : W.druck.ersatzWege.slice(0, 1);
  return {
    titel: W.druck.ersatzTitel,
    teile: [
      bogenKopf(W.druck.ersatzTitel, VERSION, false),
      h('section', { class: 'druck-teil' }, h('p', null, W.druck.ersatzText), h('ul', null, wege.map((x) => h('li', null, x)))),
    ],
  };
}

function betriebsart(r: Route): Betriebsart {
  return r.flaeche === 'regie' ? 'regie' : r.flaeche === 'leinwand' ? 'leinwand' : 'seite';
}

/** `localStorage`, wenn erreichbar; sonst null (schon der Zugriff kann werfen). */
function standardSpeicher(): SpeicherGriff | null {
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------- Seite -- */

function starteSeite(wurzel: HTMLElement): void {
  const speicher = standardSpeicher();
  const g = inhalte.geschichte;
  let story: GeschichteFlaeche | null = null;
  let tipps: Tooltips | null = null;
  let flaeche = '';
  ersatzBogenFuerStrgP(() => ['start', 'story', 'explore'].includes(document.body.dataset['flaeche'] ?? '') || document.querySelector('[data-pruef="thema-drucken"]') === null, () => ersatzDruck());

  const raeume = (): void => {
    for (const d of document.querySelectorAll<HTMLDialogElement>('dialog[open]')) d.close();
    tipps?.entferne();
    tipps = null;
  };
  const zeigeSeite = (seite: HTMLElement, name: string, titel: string, fokus: string): void => {
    ersetze(wurzel, seite);
    tipps = installiereTooltips(seite, inhalte, W.themen.glossar);
    window.scrollTo(0, 0);
    if (flaeche !== '') (seite.querySelector(fokus) as HTMLElement | null)?.focus({ preventScroll: true });
    flaeche = name;
    document.body.dataset['flaeche'] = name.split(':')[0] ?? name;
    document.title = titel;
  };

  const zeige = (r: Route): void => {
    switch (r.flaeche) {
      case 'story': {
        if (g === null) return;
        raeume();
        if (story === null) {
          story = erzeugeGeschichte({ g, speicher, themaTitel: (id) => themaTitel(inhalte, id) });
          story.beiAenderung((s) => {
            const id = s.schritt.ort === 'station' ? s.schritt.station : null;
            history.replaceState(null, '', routeHash({ flaeche: 'story', station: id }));
          });
        }
        if (flaeche !== 'story') zeigeSeite(story.element, 'story', `${W.story} · ${TITEL}`, '.gs-titel');
        tipps ??= installiereTooltips(story.element, inhalte, W.themen.glossar);
        if (r.station !== null) story.zuStation(r.station);
        break;
      }
      case 'theorie': {
        raeume();
        const seite = baueTheorie({ inhalte, thema: r.thema, version: VERSION, bedienbar: true });
        const t = r.thema !== null ? themaSeite(inhalte, r.thema) : null;
        zeigeSeite(seite, `theorie:${t?.thema ?? ''}`, t !== null ? `${t.titel} · ${W.themen.bereich} · ${TITEL}` : `${W.themen.titel} · ${TITEL}`, '.kapitel-titel');
        zeigeAktuellenEintrag(seite);
        // Abbildung (abb-6) als Sprungziel
        if (r.abschnitt !== null && istAbbildungsId(r.abschnitt)) {
          const ziel = seite.querySelector<HTMLElement>(`figure.abbildung[data-abbildung="${r.abschnitt}"]`);
          if (ziel !== null) {
            ziel.classList.add('ist-ziel');
            ziel.tabIndex = -1;
            ziel.scrollIntoView({ block: 'start' });
            ziel.focus({ preventScroll: true });
          }
        }
        break;
      }
      case 'explore': {
        raeume();
        const werkzeug = werkzeugAus(r.werkzeug);
        zeigeSeite(baueExplore({ inhalte, werkzeug, bedienbar: true }), `explore:${werkzeug}`, `${inhalte.werkzeuge?.[werkzeug].titel ?? W.rahmen.explore} · ${W.rahmen.explore} · ${TITEL}`, '.ex-titel');
        break;
      }
      default: {
        raeume();
        zeigeSeite(baueStart({
          startseite: inhalte.startseite,
          themenAnzahl: themen(inhalte).length,
          stationenAnzahl: g !== null ? wegStationen(g, false).length : 0,
          werkzeugAnzahl: WERKZEUGE.length,
          weiterlesen: g !== null && ladeStand(g, speicher) !== null,
          bedienbar: true,
        }), 'start', `${TITEL} – ${W.langname}`, '.start-titel');
      }
    }
  };

  window.addEventListener('hashchange', () => {
    const r = leseRoute(location.hash);
    if (betriebsart(r) !== 'seite') {
      location.reload();
      return;
    }
    // die Story schreibt ihren Anker selbst (replaceState); ein Klick auf denselben Bereich zeichnet neu
    zeige(r);
  });
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || story === null || flaeche !== 'story') return;
    if (story.taste(e)) e.preventDefault();
  });

  zeige(leseRoute(location.hash));
}

/* ------------------------------------------------------------------- Regie -- */

function starteRegie(wurzel: HTMLElement): void {
  const kanal = erzeugeKanal(KANAL);
  const regie = erzeugeRegie({
    inhalte,
    kanal,
    version: VERSION,
    speicher: standardSpeicher(),
    regieGeschichte,
    regieKapitel,
    oeffneLeinwand: () => {
      window.open(`${location.href.replace(/#.*$/, '')}#leinwand`, 'gk-leinwand');
    },
  });
  ersetze(wurzel, regie.element);
  document.body.dataset['flaeche'] = 'regie';
  document.title = `${W.regie.titel} · ${TITEL}`;
  document.addEventListener('keydown', (e) => {
    if (!e.defaultPrevented && regie.taste(e)) e.preventDefault();
  });
  window.addEventListener('hashchange', () => {
    if (betriebsart(leseRoute(location.hash)) !== 'regie') location.reload();
  });
  window.addEventListener('pagehide', () => kanal.schliessen());
}

/* ---------------------------------------------------------------- Leinwand -- */

function starteLeinwandFenster(wurzel: HTMLElement): void {
  const kanal = erzeugeKanal(KANAL);
  starteLeinwand(wurzel, { inhalte, kanal, version: VERSION });
  document.body.dataset['flaeche'] = 'leinwand';
  document.title = `${W.leinwand.titel} · ${TITEL}`;
  ersatzBogenFuerStrgP(() => true, () => ersatzDruck(false));
  window.addEventListener('hashchange', () => {
    if (betriebsart(leseRoute(location.hash)) !== 'leinwand') location.reload();
  });
  window.addEventListener('pagehide', () => kanal.schliessen());
}

/* ------------------------------------------------------------------- Start -- */

setzeMarke(logoSvg, bildmarkeSvg);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
setzeAbbildungsBilder(abbildungsBilder as Record<string, string>);
const wurzel = document.getElementById('mvg') ?? document.body;
switch (betriebsart(leseRoute(location.hash))) {
  case 'regie':
    starteRegie(wurzel);
    break;
  case 'leinwand':
    starteLeinwandFenster(wurzel);
    break;
  default:
    starteSeite(wurzel);
}
