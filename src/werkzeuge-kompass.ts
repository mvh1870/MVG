/*
 * Einstieg der eigenständigen Werkzeugseite „Werkzeuge Kompass“ (Exportpaket, L-431): nur die neun Werkzeuge und
 * „Drittanbieter & Lizenzen“, ohne Geschichte, Themen, Regie und Leinwand. Gebaut von werkzeuge/werkzeuge-kompass.mjs.
 *
 *   #explore(/<werkzeug>(/<beispiel>)) · #lizenzen   (Unbekanntes → erstes Werkzeug)
 */

import logoSvg from '../quellen/marke/logo-bm.svg';
import bildmarkeSvg from '../quellen/marke/logo-bm-bildmarke.svg';
import { inhalte } from './inhalte/index.ts';
import { setzeMarke } from './ui/marke.ts';
import { leseRoute, type Route } from './ui/route.ts';
import { ersetze } from './ui/h.ts';
import { installiereTooltips, type Tooltips } from './ui/bausteine/tooltip.ts';
import { setzeEigenstaendig } from './ui/bausteine/seite.ts';
import { baueExplore, werkzeugAus, werkzeugTitel } from './ui/flaechen/explore.ts';
import { baueLizenzen } from './ui/flaechen/lizenzen.ts';
import { W } from './ui/woerter.ts';
import { fassungText } from './ui/fassung.ts';

const TITEL = W.werkzeugeKompass.name;
const VERSION = fassungText();

function starte(wurzel: HTMLElement): void {
  let tipps: Tooltips | null = null;
  let erstes = true;
  const zeigeSeite = (seite: HTMLElement, name: string, titel: string, fokus: string): void => {
    tipps?.entferne();
    ersetze(wurzel, seite);
    tipps = installiereTooltips(seite, inhalte, W.themen.glossar);
    window.scrollTo(0, 0);
    if (!erstes) (seite.querySelector(fokus) as HTMLElement | null)?.focus({ preventScroll: true });
    erstes = false;
    document.body.dataset['flaeche'] = name;
    document.title = titel;
  };
  const zeige = (r: Route): void => {
    if (r.flaeche === 'lizenzen') {
      zeigeSeite(baueLizenzen({ version: VERSION, bedienbar: true }), 'lizenzen', `${W.lizenzen.titel} · ${TITEL}`, '.lz-titel');
      return;
    }
    const werkzeug = werkzeugAus(r.flaeche === 'explore' ? r.werkzeug : null);
    const beispiel = r.flaeche === 'explore' ? r.beispiel : null;
    zeigeSeite(baueExplore({ inhalte, werkzeug, beispiel, bedienbar: true }), 'explore',
      `${inhalte.werkzeuge !== null ? werkzeugTitel(inhalte.werkzeuge, werkzeug) : TITEL} · ${TITEL}`, '.ex-titel');
  };
  window.addEventListener('hashchange', () => zeige(leseRoute(location.hash)));
  zeige(leseRoute(location.hash));
}

setzeEigenstaendig(true);
setzeMarke(logoSvg, bildmarkeSvg);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
starte(document.getElementById('mvg') ?? document.body);
