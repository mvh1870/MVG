/*
 * Einstieg der Einzeldatei (P0.6 Durchstich): Hash-Router, Sitzung, Flächen.
 *
 *   #start · #story · #theorie · #theorie/k1 · #regie · #leinwand   (Unbekanntes → Start)
 *
 * Ein Fenster läuft in genau einer Betriebsart, festgelegt beim Laden:
 *   App      – Start, Story, Theorie; eine Sitzung, Stand im Speicher (Weiterlesen, E9)
 *   Regie    – eigene Sitzung (eigener Speicherschlüssel), sendet den öffentlichen Zustand
 *   Leinwand – keine Sitzung; zeichnet nur, was über den Kanal kommt (O-9)
 * Wechselt der Anker die Betriebsart (z. B. „Präsentieren“ → #regie), lädt das Fenster neu.
 */

import logoSvg from '../quellen/marke/logo-bm.svg';
import bildmarkeSvg from '../quellen/marke/logo-bm-bildmarke.svg';
import type { Aktion, Zustand } from './engine/typen.ts';
import { inhalte, regieFuer } from './inhalte/index.ts';
import { anfangszustand, oeffentlich } from './engine/zustand.ts';
import { lade, type SpeicherGriff } from './engine/speicher.ts';
import { erzeugeKanal } from './regie/kanal.ts';
import { setzeMarke } from './ui/marke.ts';
import { leseRoute, routeHash, type Route } from './ui/route.ts';
import { erzeugeSitzung, type Sitzung } from './ui/sitzung.ts';
import { ersetze } from './ui/h.ts';
import { installiereTooltips, type Tooltips } from './ui/bausteine/tooltip.ts';
import { erzeugeStory, type StoryFlaeche } from './ui/flaechen/story.ts';
import { baueStart } from './ui/flaechen/start.ts';
import { baueTheorie, kapitelListe } from './ui/flaechen/theorie.ts';
import { baueExplore } from './ui/flaechen/explore.ts';
import { erzeugeRegie } from './regie/regie.ts';
import { starteLeinwand } from './regie/leinwand.ts';
import { W } from './ui/woerter.ts';

declare const __MVG_VERSION__: string;

const TITEL = 'Minimum Viable Governance';
const STORY_VERSION = __MVG_VERSION__.split('.').slice(0, 2).join('.');
const VERSION = W.version(inhalte.whitepaper.fassung ?? '', STORY_VERSION);
const KANAL = 'regie';

type Betriebsart = 'app' | 'regie' | 'leinwand';

function betriebsart(r: Route): Betriebsart {
  return r.flaeche === 'regie' ? 'regie' : r.flaeche === 'leinwand' ? 'leinwand' : 'app';
}

/**
 * `localStorage`, wenn erreichbar; sonst null (schon der Zugriff kann werfen, z. B. bei gesperrten
 * Website-Daten). Die Plattform-API liest nur der Einstieg – die Engine bekommt den Griff gereicht.
 */
function standardSpeicher(): SpeicherGriff | null {
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Speicher mit eigenem Schlüsselvorsatz (die Regie stört das Weiterlesen des Hauptfensters nicht). */
function mitVorsatz(g: SpeicherGriff | null, vorsatz: string): SpeicherGriff | null {
  if (g === null) return null;
  return {
    getItem: (k) => g.getItem(vorsatz + k),
    setItem: (k, v) => g.setItem(vorsatz + k, v),
    removeItem: (k) => g.removeItem(vorsatz + k),
  };
}

function startzustand(speicher: SpeicherGriff | null): Zustand {
  return lade(speicher, inhalte) ?? anfangszustand();
}

/* --------------------------------------------------------------------- App -- */

function starteApp(wurzel: HTMLElement): void {
  const speicher = standardSpeicher();
  const sitzung: Sitzung = erzeugeSitzung(startzustand(speicher), inhalte, { speicher });
  let story: StoryFlaeche | null = null;
  let tipps: Tooltips | null = null;
  let flaeche = '';

  const raeume = (): void => {
    story?.entferne();
    story = null;
    tipps?.entferne();
    tipps = null;
  };
  const tue = (a: Aktion): void => {
    sitzung.tue(a);
  };

  const zeige = (r: Route): void => {
    const z = sitzung.zustand();
    switch (r.flaeche) {
      case 'story': {
        if (z.station === null) tue({ art: 'starteStory' });
        else tue({ art: 'wechsleBereich', bereich: 'story' });
        if (flaeche !== 'story') {
          raeume();
          story = erzeugeStory({ inhalte, tue, zurStart: () => navigiere({ flaeche: 'start' }) });
          ersetze(wurzel, story.element);
          story.setze(oeffentlich(sitzung.zustand()), null);
          window.scrollTo(0, 0);
        }
        // Permalink #story/A3 (P2.4): springt zur Station, sobald eine Rolle gewählt ist; Welt B nur nach Freischaltung (Engine)
        if (r.station !== null && sitzung.zustand().rolle !== null) {
          const ziel = Object.keys(inhalte.stationen).find((id) => id.toLowerCase() === r.station);
          if (ziel !== undefined && ziel !== sitzung.zustand().station) tue({ art: 'geheZu', station: ziel });
        }
        // Adresszeile auf die tatsächliche Station (auch bei „Weiterlesen“ oder gesperrtem Permalink)
        const jetzt = sitzung.zustand().station;
        if (jetzt !== null) history.replaceState(null, '', routeHash({ flaeche: 'story', station: jetzt }));
        flaeche = 'story';
        document.body.dataset['flaeche'] = 'story';
        document.title = `${W.story} · ${TITEL}`;
        break;
      }
      case 'theorie': {
        if (r.kapitel === null) tue({ art: 'wechsleBereich', bereich: 'theorie' });
        else tue({ art: 'oeffneKapitel', kapitel: r.kapitel });
        raeume();
        const seite = baueTheorie({ inhalte, kapitel: r.kapitel, version: VERSION, bedienbar: true });
        ersetze(wurzel, seite);
        tipps = installiereTooltips(seite, inhalte, W.glossarQuelle(inhalte.whitepaper.fassung ?? ''));
        window.scrollTo(0, 0);
        const abschnitt = r.abschnitt !== null ? seite.querySelector<HTMLElement>(`[data-abschnitt="k${r.abschnitt}"]`) : null;
        if (abschnitt !== null) {
          // Permalink auf einen Abschnitt (P2.4): dorthin, Fokus für Screenreader
          abschnitt.tabIndex = -1;
          abschnitt.scrollIntoView({ block: 'start' });
          abschnitt.focus({ preventScroll: true });
        } else (seite.querySelector('.kapitel-titel') as HTMLElement | null)?.focus({ preventScroll: true });
        flaeche = `theorie-${r.kapitel ?? 0}`;
        document.body.dataset['flaeche'] = 'theorie';
        document.title = `${W.theorie.bereich} ${W.theorie.bereichZusatz} · ${TITEL}`;
        break;
      }
      case 'explore': {
        tue({ art: 'wechsleBereich', bereich: 'explore' });
        raeume();
        const seite = baueExplore({ inhalte, freigeschaltet: sitzung.zustand().freigeschaltet.explore, weltB: sitzung.zustand().freigeschaltet.weltB, version: VERSION });
        ersetze(wurzel, seite);
        window.scrollTo(0, 0);
        (seite.querySelector('.kapitel-titel') as HTMLElement | null)?.focus({ preventScroll: true });
        flaeche = 'explore';
        document.body.dataset['flaeche'] = 'explore';
        document.title = `${W.explore.bereich} ${W.explore.bereichZusatz} · ${TITEL}`;
        break;
      }
      default: {
        tue({ art: 'wechsleBereich', bereich: 'start' });
        raeume();
        ersetze(wurzel, baueStart({
          startseite: inhalte.startseite,
          kapitelAnzahl: kapitelListe(inhalte).length,
          rollenAnzahl: inhalte.rollenFolge.length,
          weiterlesen: sitzung.zustand().station !== null,
          fassung: inhalte.whitepaper.fassung ?? '',
          version: VERSION,
          bedienbar: true,
        }));
        window.scrollTo(0, 0);
        flaeche = 'start';
        document.body.dataset['flaeche'] = 'start';
        document.title = `${TITEL} – ${W.absender}`;
      }
    }
  };

  const navigiere = (r: Route): void => {
    const ziel = routeHash(r);
    if (location.hash !== ziel) location.hash = ziel;
    else zeige(r);
  };

  sitzung.abonniere((neu, alt, aktion) => {
    if (story !== null && flaeche === 'story') {
      story.setze(oeffentlich(neu), aktion);
      // Adresszeile zeigt den Permalink der Station (ohne hashchange: replaceState)
      if (neu.station !== null && neu.station !== alt.station) history.replaceState(null, '', routeHash({ flaeche: 'story', station: neu.station }));
    }
  });

  window.addEventListener('hashchange', () => {
    const r = leseRoute(location.hash);
    if (betriebsart(r) !== 'app') {
      location.reload();
      return;
    }
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
  const speicher = mitVorsatz(standardSpeicher(), 'regie.');
  const sitzung = erzeugeSitzung(startzustand(speicher), inhalte, { speicher });
  const kanal = erzeugeKanal(KANAL);
  const regie = erzeugeRegie({
    inhalte,
    sitzung,
    kanal,
    version: VERSION,
    regieFuer,
    oeffneLeinwand: () => {
      window.open(`${location.href.replace(/#.*$/, '')}#leinwand`, 'mvg-leinwand');
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
  window.addEventListener('hashchange', () => {
    if (betriebsart(leseRoute(location.hash)) !== 'leinwand') location.reload();
  });
  window.addEventListener('pagehide', () => kanal.schliessen());
}

/* ------------------------------------------------------------------- Start -- */

setzeMarke(logoSvg, bildmarkeSvg);
const wurzel = document.getElementById('mvg') ?? document.body;
switch (betriebsart(leseRoute(location.hash))) {
  case 'regie':
    starteRegie(wurzel);
    break;
  case 'leinwand':
    starteLeinwandFenster(wurzel);
    break;
  default:
    starteApp(wurzel);
}
