#!/usr/bin/env node
/**
 * Hilfe (P13, O-31): übernimmt die Hilfe des MVG Companion (statischer Export, quellen/hilfe/) mit
 * derselben Kapitelaufteilung in src/generiert/hilfe.json.
 *
 *   node werkzeuge/hilfe.mjs            erzeugen
 *   node werkzeuge/hilfe.mjs --pruefe   erzeugen und prüfen (verbotene Begriffe, „Whitepaper“); Exitcode 1 bei Funden
 *
 * Bereinigt wird, was nur in der Companion-Anwendung wirkt (Knöpfe für Export, Scout, Speicher-Hinweise,
 * Menüs, Dialoge, Eingabefelder, Ereignis- und Datenattribute); Klassen bleiben nur, wenn src/stil/hilfe.css
 * sie gestaltet. Begriffe folgen dem maßgeblichen Text (O-14, O-15, O-29): Ersetzungsliste ERSETZUNGEN.
 * Deterministisch: gleiche Quelle → byte-gleiche Ausgabe.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { istHauptmodul } from './haupt.mjs';
import { formatiereFund, pruefeText } from './begriffe.mjs';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const QUELLE = path.join('quellen', 'hilfe', 'companion-hilfe-v1.34.911.html');
export const ZIEL = path.join('src', 'generiert', 'hilfe.json');

/** Begriffe nach O-14/O-15/O-29; Reihenfolge: spezifisch vor allgemein. */
export const ERSETZUNGEN = /** @type {[RegExp, string][]} */ ([
  // Kennungen der Anwendung (GATE-NETZNORD-G2) bleiben: kein G nach Bindestrich, Punkt oder Wortzeichen
  // Zeitpunkt der Freigabe am Ende der Phase, nicht ihr Beginn (BEGRIFFE: „Freigabe LPH n“)
  [/post-G(\d)\b/gu, 'nach Freigabe LPH $1'],
  [/\bvor G(\d)\b/gu, 'vor Freigabe LPH $1'],
  [/\bVorbereitung G(\d)\b/gu, 'Vorbereitung Freigabe LPH $1'],
  [/\bG(\d) Freigabe\b/gu, 'Freigabe LPH $1'],
  // im Quelltext „<b>Freigabe-Zeitachse:</b> G0–G9 als Stationen“: eigener Textknoten
  [/^\s*G0–G9 als Stationen/gu, ' Freigaben LPH 0–9 als Stationen'],
  [/\bG(\d)-Vorlage/gu, 'Vorlage Freigabe LPH $1'],
  [/— MVG-Leitprinzip/gu, '— Leitprinzip der Anwendung'],
  [/Erstes Managementbericht/gu, 'Erster Managementbericht'],
  [/Gremientaugliches Managementbericht/gu, 'Gremientauglicher Managementbericht'],
  [/Das fertige, entscheidungsorientierte Managementbericht/gu, 'Der fertige, entscheidungsorientierte Managementbericht'],
  [/Externe Berater fließt schrittweise aus/gu, 'Externe Berater ziehen sich schrittweise zurück'],
  // im Quelltext steht „<b>Freigabebesprechung</b> – G0 bis G4“: das Muster muss im eigenen Textknoten greifen
  [/– G0 bis G4/gu, '– Freigabestufe 0 bis 4'],
  [/Standardisierter Einfuehrungs-\/Reset-Rhythmus/gu, 'Orientierungsrahmen für Einführung und Neuinitialisierung'],
  [/MVG-Reifegrad-Modell \(5 Stufen\)/gu, 'Reifegrad-Modell der Anwendung (5 Stufen)'],
  [/Die MVG-Reife einer Organisation entwickelt sich entlang fünf Stufen/gu, 'Im Modell der Anwendung entwickelt sich die Reife einer Organisation entlang fünf Stufen'],
  [/Eine bewährte Einführungs-Roadmap für neue MVG-Projekte/gu, 'Die Einführungs-Roadmap der Anwendung für neue Projekte'],
  [/Decision Management/gu, 'Entscheidungsmanagement'],
  [/Change Management/gu, 'Änderungsmanagement'],
  [/\s*Druckbar als PDF\./gu, ''],
  [/Mio\. EUR/gu, 'Mio. €'],
  [/einen strukturierten Re-Start/gu, 'eine strukturierte MVG-Neuinitialisierung'],
  [/Re-Start/gu, 'MVG-Neuinitialisierung'],
  [/Wie wir arbeiten\. /gu, ''],
  [/Freigabe-Adherence/gu, 'Freigabetreue'],
  [/\s*Berater bleibt als Sparringspartner verfügbar, ist aber nicht mehr operativ nötig\./gu, ''],
  [/ — jetzt für /gu, ' — für '],
  [/ · druckbares Freigabe-Dossier/gu, ''],
  [/ — jede Karte führt mit ihren Knöpfen direkt in die passende Ansicht/gu, ''],
  // O-1: keine Angebotsaussagen über Bauherr Mentoren (Preise, Lizenzen)
  [/\s*Für Beratungskunden kostenfrei: kein separates Lizenzentgelt, unbegrenzte Nutzungsrechte auch nach Mandatsende\./gu, ''],
  [/(?<![-\w])LPH(\d)/gu, 'LPH $1'],
  [/\s*„?Drucken\/PDF“?( dieser Seite)? klappt alle Kapitel automatisch auf\.?/gu, ''],
  [/Durchsuchbar über die Hilfe-Volltextsuche im Hilfe-Hub/gu, 'Durchsuchbar über die Suche auf der Übersicht der Hilfe'],
  [/\bZulaessige/gu, 'Zulässige'], [/\bOeffentlich/gu, 'Öffentlich'], [/\bAusfuehrbares/gu, 'Ausführbares'],
  [/\bGedaechtnis/gu, 'Gedächtnis'], [/\bverfaellt/gu, 'verfällt'], [/\bgehoert/gu, 'gehört'], [/\blaedt\b/gu, 'lädt'], [/\bTraeger/gu, 'Träger'],
  [/G0–G9 entlang der Leistungsphasen \(LPH 0–9\)/gu, 'Freigaben entlang der Leistungsphasen LPH 0–9'],
  [/Leistungsphase 0 \(Bedarfsplanung\) nach HOAI/gu, 'Leistungsphase 0 (Bedarfsplanung), den HOAI-Leistungsphasen vorgelagert'],
  [/Ausfuehrungsplanung/gu, 'Ausführungsplanung'],
  [/Uebergabe/gu, 'Übergabe'],
  [/finales Readout/gu, 'finaler Managementbericht'],
  [/finales Managementbericht/gu, 'finaler Managementbericht'],
  [/G3 \(Ausführungsplanung\)/gu, 'LPH 5 (Ausführungsplanung)'],
  [/G0–G9 entlang der Leistungsphasen \(LPH 0–8\)/gu, 'entlang der Leistungsphasen LPH 0–9'],
  [/(?<![-.\w])G(\d):\s*([^(\n<]+?)\s*\(LPH \1\)/gu, 'LPH $1: $2'],
  [/(?<![-.\w])G(\d)\s*[–-]\s*G(\d)\b/gu, 'LPH $1–$2'],
  [/\bLeistungsphase G(\d)/gu, 'Leistungsphase $1'],
  [/(?<![-.\w])G(\d)\b/gu, 'LPH $1'],
  [/Stage-Gate-Logik/gu, 'Freigabelogik'],
  [/Stage-Gate/gu, 'Freigabe'],
  [/Gate Guide/gu, 'Freigabe-Leitfaden'],
  [/Change-Board-Sitzung/gu, 'Sitzung des Änderungsgremiums'],
  [/Change-Board/gu, 'Änderungsgremium'],
  [/Decision Files?/gu, 'Entscheidungsvorlage'],
  [/Entscheidungsakten?/gu, 'Entscheidungsvorlage'],
  [/Risk-Closure-Rate/gu, 'Risiko-Abschlussquote'],
  [/Risk- und EW-Erfassung/gu, 'Risiko- und Frühwarnungserfassung'],
  [/Risk Management/gu, 'Risikomanagement'],
  [/\bRisks\b/gu, 'Risiken'],
  [/\bRisk\b/gu, 'Risiko'],
  [/Go-Entscheidung/gu, 'Freigabeentscheidung'],
  [/Go \/ No-Go/gu, 'Freigabe / keine Freigabe'],
  [/No-Go/gu, 'keine Freigabe'],
  [/Go ohne Bedingungen/gu, 'Freigabe ohne Auflagen'],
  [/Go with Conditions/gu, 'Freigabe mit Auflagen'],
  // Beispiel für eine fremde Kundenbezeichnung: bleibt erkennbar anders als „Freigabe“
  [/Quality Gate/gu, 'Qualitätstor'],
  [/Long-Lead-Komponenten/gu, 'Komponenten mit langer Lieferzeit'],
  [/Long-Lead/gu, 'Komponenten mit langer Lieferzeit'],
  [/Operating-Model/gu, 'Führungsmodell'],
  [/Data & Evidence Prompt/gu, 'Daten- und Nachweis-Prompt'],
  [/Evidence-Belege/gu, 'Nachweis-Belege'],
  [/\s*\(englisch: Evidence\)/gu, ''],
  [/\bEvidence\b/gu, 'Nachweis'],
  [/Nachweise & Links \(evidence\)/gu, 'Nachweise & Links'],
  [/Minimal Viable Governance/gu, 'Minimum Viable Governance'],
  [/Go \/ No-Go \/ Go with Conditions/gu, 'Freigabe / keine Freigabe / Freigabe mit Auflagen'],
  [/Stop\/Go-Steuerung \(Go \/ Hold \/ Stop \/ Repriorisieren\)/gu, 'Fortführungssteuerung (Fortführen / Halten / Stoppen / Repriorisieren)'],
  [/Stop[/-]Go/gu, 'Fortführen/Stoppen'],
  [/Governance-Reset/gu, 'MVG-Neuinitialisierung'],
  [/vor \/ nach Reset/gu, 'vor / nach der Neuinitialisierung'],
  [/Reset stellt/gu, 'Zurücksetzen stellt'],
  [/Reset-Bedarf/gu, 'Neuinitialisierungsbedarf'],
  [/Einfuehrungs-\/Reset-Rhythmus/gu, 'Einführungs-/Neuinitialisierungsrhythmus'],
  [/Reset \/ MVG-Neuinitialisierung/gu, 'MVG-Neuinitialisierung'],
  [/\bReset\b/gu, 'Neuinitialisierung'],
  [/Re-Baseline-Sonderformat/gu, 'Sonderformat Neufestlegung der Projektbasis'],
  [/Re-Baselines/gu, 'Neufestlegungen der Projektbasis'],
  [/Re-Baseline/gu, 'Neufestlegung der Projektbasis'],
  [/\bmitigiert\b/gu, 'mindert'],
  [/stage-gate-\/leistungsphasenbasierte/gu, 'freigabe- und leistungsphasenbasierte'],
  [/stage-gate-Logik/gu, 'Freigabelogik'],
  [/gate-loses Sonderformat/gu, 'Sonderformat außerhalb der Freigabereihe'],
  [/Leistungsphase \(gates\)/gu, 'Leistungsphase (Freigaben)'],
  [/Standardgates/gu, 'Standardfreigaben'],
  [/Gate-Review/gu, 'Freigabeprüfung'],
  [/als Release-Gate nutzt/gu, 'als Prüftor vor der Auslieferung nutzt'],
  [/Release-Gate/gu, 'Prüftor vor der Auslieferung'],
  [/Decision Gates/gu, 'Entscheidungspunkte'],
  [/Stage Gates/gu, 'Phasenfreigaben'],
  [/Sichtbarkeits-Gates/gu, 'Sichtbarkeitsregeln'],
  [/GATE-IDs/gu, 'Freigabe-IDs'],
  [/Change-Impact-Analyse/gu, 'Auswirkungsanalyse der Änderung'],
  [/Impact-5er-Set/gu, 'Auswirkungs-5er-Set'],
  [/Whitepaper-Inhalte/gu, 'MVG-Inhalte'],
  // als Aussage der Anwendung, nicht als MVG-Aussage (die Namen weichen von MVG Kap. 6.1 ab, Korrekturliste)
  [/Das Whitepaper beschreibt den Companion über sieben Funktionslogiken\./gu, 'Die Anwendung bildet die sieben Funktionslogiken aus MVG (Kap. 6.1) mit eigenen Namen ab.'],
  [/Das Whitepaper beschreibt/gu, 'MVG beschreibt'],
  [/Das Whitepaper/gu, 'MVG'],
  [/das Whitepaper/gu, 'MVG'],
  [/Whitepaper/gu, 'MVG-Originaltext'],
]);

/** Klassen, die src/stil/hilfe.css gestaltet (alles andere fällt weg). */
/** Farbwerte der Companion-Grafiken → Marken-Tokens */
const FARBEN = new Map([
  ['#3a7a43', 'var(--petrol)'], ['#0e7c66', 'var(--tuerkis-text)'], ['#1d3258', 'var(--navy)'], ['#a8823c', 'var(--gold-text)'],
  ['#9a3030', 'var(--navy-soft)'], ['#fff', 'var(--weiss)'], ['#ffffff', 'var(--weiss)'],
]);

const KLASSEN = new Set([
  'card', 'card-title', 'feature-card', 'feature-grid', 'notice', 'info', 'hint', 'tag', 'badge', 'pill', 'grid', 'cols-2', 'cols-3',
  'step-list', 'table-wrap', 'lead', 'lead-text', 'sub', 'meta', 'small', 'prose', 'section-divider', 'kpi', 'label', 'value',
  'green', 'gold', 'blue', 'gray', 'help-content', 'help-content-inline', 'help-item', 'num-mark', 'role-pick-card', 'desc',
  'checked', 'page-header', 'ico', 'grafik-wrap', 'summary-titel', 'hilfe-marke',
]);

/** Was nur in der Anwendung wirkt – samt Inhalt entfernen. */
const WEG = [
  'script', 'style', 'input', 'select', 'textarea', 'form', 'dialog', '.bm59-banner', '.page-header .actions', '.bm774-menu',
  '#bm825Card', '.bm61-kpis', '.bm914-pn', 'aside.help-sidebar', '[data-bmfn="sec"]', '.bmfs-ind', '.bm-reg-filterbar', '[title="Spalten-Reihenfolge ändern"]', '.bm649-dup',
  '.bm327-float', '.bm120-grip', '.bmx-facetbar', '.toolbar', '.bm399-tbar', '.bm228-toggle', '.bmx-aggfoot',
].join(',');

/** @param {string} t */
export function ersetze(t) {
  let aus = t;
  for (const [muster, statt] of ERSETZUNGEN) aus = aus.replace(muster, statt);
  return aus;
}

/**
 * Bereinigt einen Teilbaum an Ort und Stelle.
 * @param {Element} wurzel
 * @param {Map<string, string>} anker Companion-Kapitel-ID → Hilfe-Route
 */
function bereinige(wurzel, anker, titel = '') {
  const dok = wurzel.ownerDocument;
  for (const el of [...wurzel.querySelectorAll(WEG)]) el.remove();
  // O-1: Leistungszuschnitt der Beratung (Engagements mit Laufzeiten) – Abschnitt bis zum nächsten Trenner
  for (const h of [...wurzel.querySelectorAll('h2')]) {
    if (!/MVG-Lifecycle in der Beratungspraxis/u.test(h.textContent ?? '')) continue;
    let x = h.nextElementSibling;
    while (x !== null && !/^H[12]$/u.test(x.tagName) && !x.classList.contains('section-divider')) {
      const weiter = x.nextElementSibling;
      x.remove();
      x = weiter;
    }
    h.remove();
  }
  // Momentaufnahmen des exportierenden Browsers (Speicher-Audit, Sync-Status, localStorage-Belegung, Speicher-Modus)
  wurzel.querySelector('#bm102-sync')?.closest('.grid')?.remove();
  // Suchkarten der Anwendung (die Hilfe-Fläche hat eine eigene Suche) und „+ Tag“-Schalter
  for (const h of [...wurzel.querySelectorAll('.card > h3')]) if (/durchsuchen/u.test(h.textContent ?? '')) h.parentElement?.remove();
  for (const el of [...wurzel.querySelectorAll('span')]) if (el.children.length === 0 && (el.textContent ?? '').trim() === '+ Tag') el.remove();
  // Tote Bedienreste: Knopftexte, leere Schnellstart-Hinweise, Rollen-Plaketten, Karte ohne Werkzeuge
  for (const el of [...wurzel.querySelectorAll('button, span, div, p')]) {
    const t = (el.textContent ?? '').trim();
    if (t === 'Ansicht öffnen →' || (t === '×' && el.tagName.toLowerCase() !== 'div') || (el.classList.contains('notice') && /^Schnell starten:/u.test(t))) el.remove();
  }
  for (const b of [...wurzel.querySelectorAll('.role-pick-card .badge')]) if (/^(?:Auto|Meine Rolle)$/u.test((b.textContent ?? '').trim())) b.remove();
  for (const h of [...wurzel.querySelectorAll('.card h3')]) if ((h.textContent ?? '').trim() === 'Loslegen') h.closest('.card')?.remove();
  // Trenner mit Abschnittstitel („Werkzeugübersicht“): als Überschrift, damit die Gliederung stimmt
  for (const t of [...wurzel.querySelectorAll('div.section-divider')]) {
    if ((t.textContent ?? '').trim() === '' || t.children.length > 0) continue;
    const h = dok.createElement('h2');
    h.className = 'section-divider';
    h.textContent = t.textContent;
    t.replaceWith(h);
  }
  // Seitenkopf der Anwendung: der Titel steht schon in der Kopfzeile der Hilfe; weitere Titel eine Ebene tiefer
  for (const h of [...wurzel.querySelectorAll('.page-header h1')]) h.remove();
  for (const h of [...wurzel.querySelectorAll('h1')]) {
    const h2 = dok.createElement('h2');
    while (h.firstChild) h2.appendChild(h.firstChild);
    h.replaceWith(h2);
  }
  // Feldnamen in Festbreitenschrift: als <code> auszeichnen (sonst stehen „gates“, „risks“ als Wörter im Text)
  for (const sp of [...wurzel.querySelectorAll('span[style*="monospace"]')]) {
    const c = dok.createElement('code');
    while (sp.firstChild) c.appendChild(sp.firstChild);
    sp.replaceWith(c);
  }
  // Knöpfe der Anwendung tragen oft Inhalt (Kennungen, Tags): als Text behalten
  for (const k of [...wurzel.querySelectorAll('button')]) {
    const ersatz = dok.createElement('span');
    ersatz.className = 'hilfe-marke';
    while (k.firstChild) ersatz.appendChild(k.firstChild);
    k.replaceWith(ersatz);
  }
  for (const a of [...wurzel.querySelectorAll('a')]) {
    const ziel = a.getAttribute('href') ?? '';
    const route = ziel.startsWith('#') ? anker.get(ziel.slice(1)) : undefined;
    if (route !== undefined) {
      for (const n of [...a.attributes]) a.removeAttribute(n.name);
      a.setAttribute('href', route);
      continue;
    }
    const ersatz = dok.createElement('span');
    while (a.firstChild) ersatz.appendChild(a.firstChild);
    a.replaceWith(ersatz);
  }
  for (const el of [wurzel, ...wurzel.querySelectorAll('*')]) {
    const inSvg = el.closest('svg') !== null;
    for (const n of [...el.attributes]) {
      const name = n.name.toLowerCase();
      if (name.startsWith('on')) el.removeAttribute(n.name);
      // Rollen und Tooltips der Anwendung („Öffnen: …“, „Klick sortiert …“): hier ohne Wirkung, per Tastatur ohnehin unerreichbar
      else if ((name === 'role' && n.value !== 'img') || (name === 'title' && !inSvg)) el.removeAttribute(n.name);
      else if (name === 'id' && inSvg) continue; // Pfeilspitzen und Verläufe: url(#…) braucht die ID
      else if (name.startsWith('data-') || name === 'id' || name === 'tabindex' || name === 'contenteditable' || name === 'draggable') el.removeAttribute(n.name);
      else if (name === 'style' && !inSvg) el.removeAttribute(n.name);
      else if (name === 'class' && !inSvg) {
        const behalten = n.value.split(/\s+/u).filter((k) => KLASSEN.has(k));
        if (behalten.length > 0) el.setAttribute('class', behalten.join(' '));
        else el.removeAttribute('class');
      } else if ((name === 'aria-label' || name === 'alt') && !inSvg) el.setAttribute(n.name, ersetze(n.value));
    }
  }
  // leere Hüllen (nach dem Entfernen) weg
  for (const el of [...wurzel.querySelectorAll('div, span, p')].reverse()) {
    if (el.children.length === 0 && (el.textContent ?? '').trim() === '') el.remove();
  }
  // Verlauf auf einer waagerechten Linie: mit objectBoundingBox (Höhe 0) zeichnet der Browser nichts
  for (const l of [...wurzel.querySelectorAll('line')]) {
    const id = /^url\(#([^)]+)\)$/u.exec(l.getAttribute('stroke') ?? '')?.[1];
    const g = id !== undefined ? wurzel.querySelector(`linearGradient[id="${id}"]`) : null;
    if (g === null || g.hasAttribute('gradientUnits') || l.getAttribute('y1') !== l.getAttribute('y2')) continue;
    g.setAttribute('gradientUnits', 'userSpaceOnUse');
    for (const a of ['x1', 'x2', 'y1', 'y2']) g.setAttribute(a, l.getAttribute(a) ?? '0');
  }
  // Spalten ohne Inhalt (etwa „Tags“ nach dem Entfernen der Schalter) fallen weg
  for (const t of [...wurzel.querySelectorAll('table')]) {
    const zeilen = [...t.querySelectorAll('tr')];
    const koerper = zeilen.filter((z) => z.querySelector('td') !== null);
    if (koerper.length === 0) continue;
    const breite = Math.max(...zeilen.map((z) => z.children.length));
    for (let sp = breite - 1; sp >= 0; sp -= 1) {
      const leer = koerper.every((z) => { const c = z.children[sp]; return c === undefined || (c.children.length === 0 && (c.textContent ?? '').trim() === ''); });
      if (leer && zeilen.every((z) => (z.children[sp]?.getAttribute('colspan') ?? '1') === '1')) for (const z of zeilen) z.children[sp]?.remove();
    }
  }
  // Fünf-Stufen-Modell (G0–G4) der Anwendung, das keine Leistungsphasen meint: „Stufe n“ statt „LPH n“
  for (const t of [...wurzel.querySelectorAll('table')]) {
    const erste = [...t.querySelectorAll('tbody tr')].map((z) => z.children[0]);
    if (erste.length === 0 || erste.length > 5 || !erste.every((c) => /^G[0-4]$/u.test((c?.textContent ?? '').trim())) || /\(LPH/u.test(t.textContent ?? '')) continue;
    for (const c of erste) if (c) c.textContent = `Freigabestufe ${(c.textContent ?? '').trim().slice(1)}`;
    let vor = t.closest('.table-wrap') ?? t;
    vor = vor.previousElementSibling;
    if (vor !== null && /^H\d$/u.test(vor.tagName)) vor.textContent = (vor.textContent ?? '').replace(/G0\s*[–-]\s*G9/u, '(Freigabestufen 0–4)');
  }
  const stufenGang = dok.createTreeWalker(wurzel, 4);
  for (let n = stufenGang.nextNode(); n !== null; n = stufenGang.nextNode()) {
    // Aufzählung je Projekttyp: „G0 Konzept, G1 Vorplanung, … G4 IBN“
    if (/(?<![-.\w])G\d [^,]+,\s*G\d/u.test(n.textContent ?? '')) n.textContent = (n.textContent ?? '').replace(/(?<![-.\w])G(\d)\b/gu, 'Freigabestufe $1');
  }
  // Tabellen scrollen schmal waagerecht in einer Hülle, die per Tastatur erreichbar ist
  for (const t of [...wurzel.querySelectorAll('table')]) {
    let huelle = t.parentElement;
    if (huelle === null || !huelle.classList.contains('table-wrap') || huelle.children.length !== 1) {
      huelle = dok.createElement('div');
      huelle.className = 'table-wrap';
      t.replaceWith(huelle);
      huelle.appendChild(t);
    }
    // tabindex setzt die Oberfläche nur, wenn die Tabelle wirklich überläuft (src/ui/flaechen/hilfe.ts)
    huelle.setAttribute('role', 'region');
  }
  // Name jeder Tabelle und breiten Grafik: die Überschrift davor
  let ueberschrift = titel;
  for (const el of [...wurzel.querySelectorAll('h1, h2, h3, h4, h5, .table-wrap')]) {
    if (el.classList.contains('table-wrap')) el.setAttribute('aria-label', ueberschrift !== '' ? `Tabelle: ${ueberschrift}` : 'Tabelle');
    else ueberschrift = ersetze((el.textContent ?? '').replace(/\s+/gu, ' ').trim());
  }
  // Breite Grafiken (viewBox ab 900) rollen schmal waagerecht, statt auf Mikroschrift zu schrumpfen
  for (const svg of [...wurzel.querySelectorAll('svg')]) {
    const breite = Number((svg.getAttribute('viewBox') ?? '').split(/\s+/u)[2] ?? 0);
    if (breite < 900 || svg.parentElement?.closest('svg') !== null) continue;
    const huelle = dok.createElement('div');
    huelle.className = 'grafik-wrap';
    huelle.setAttribute('role', 'region');
    huelle.setAttribute('aria-label', `Grafik: ${ersetze(svg.getAttribute('aria-label') ?? svg.querySelector('title')?.textContent ?? letzteUeberschrift(svg) ?? 'Übersicht')}`);
    svg.replaceWith(huelle);
    huelle.appendChild(svg);
  }
  // Farben der Grafiken: Marken-Tokens statt fester Werte (Ampelfarben nur für Status, STIL 7)
  for (const el of [...wurzel.querySelectorAll('svg, svg *')]) {
    const stil = (el.getAttribute('style') ?? '').split(';').map((x) => x.trim()).filter((x) => x !== '' && !/^cursor\s*:/u.test(x));
    for (const a of ['fill', 'stroke', 'stop-color']) {
      const wert = el.getAttribute(a);
      if (wert === null) continue;
      const neu = FARBEN.get(wert.toLowerCase()) ?? (wert.startsWith('var(') ? wert.replace(/,\s*#[0-9a-f]{3,8}\s*\)/iu, ')') : null);
      if (neu !== null) {
        el.removeAttribute(a);
        stil.push(`${a}:${neu}`);
      }
    }
    if (stil.length > 0) el.setAttribute('style', stil.join(';'));
    else el.removeAttribute('style');
  }
  // Überschriften lückenlos ab h2 (die Seite trägt das h1)
  // in Dokumentreihenfolge verschieben, nicht deckeln: gleiche Quellebene → gleiche Zielebene,
  // eine tiefere Quellebene → eine Ebene unter der vorigen (Stapel Quelle → Ziel), die oberste auf h2
  /** @type {{ quelle: number, ziel: number }[]} */
  const stapel = [];
  for (const x of [...wurzel.querySelectorAll('h2, h3, h4, h5, h6')]) {
    const ebene = Number(x.tagName[1]);
    while (stapel.length > 0 && (stapel[stapel.length - 1]?.quelle ?? 0) > ebene) stapel.pop();
    const oben = stapel[stapel.length - 1];
    let soll;
    if (oben !== undefined && oben.quelle === ebene) soll = oben.ziel;
    else {
      soll = Math.min(6, (oben?.ziel ?? 1) + 1);
      stapel.push({ quelle: ebene, ziel: soll });
    }
    if (soll === Number(x.tagName[1])) continue;
    const neu = dok.createElement(`h${soll}`);
    for (const at of [...x.attributes]) neu.setAttribute(at.name, at.value);
    while (x.firstChild) neu.appendChild(x.firstChild);
    x.replaceWith(neu);
  }
  // Einzelner Aufklapper mit eigenen Überschriften, die nicht tiefer als die umgebende Überschrift liegen
  // (eingebettetes Dossier): summary eine Ebene unter die Umgebung, der Inhalt gleichrangig darunter
  const alleEl = [...wurzel.querySelectorAll('*')];
  for (const d of [...wurzel.querySelectorAll('details')]) {
    const s = d.querySelector(':scope > summary');
    const innen = [...d.querySelectorAll('h2, h3, h4, h5, h6')].filter((x) => !s?.contains(x));
    if (s === null || innen.length === 0 || s.querySelector('h1, h2, h3, h4, h5, h6') !== null) continue;
    // Aufklapper-Reihen (Handbuch, Standards) regelt der nächste Schritt
    if ([...(d.parentElement?.children ?? [])].filter((x) => x.matches('details')).length > 1) continue;
    const m = Math.min(...innen.map((x) => Number(x.tagName[1])));
    let umgebung = 1;
    for (const x of alleEl) {
      if (x === d) break;
      // nur Überschriften, deren Abschnitt den Aufklapper enthält (nicht aus geschlossenen Nachbarkarten)
      if (/^H[1-6]$/u.test(x.tagName) && !d.contains(x) && x.parentElement?.contains(d)) umgebung = Number(x.tagName[1]);
    }
    // Titel eine Ebene unter der Umgebung, Inhalt genau eine Ebene unter dem Titel
    const ziel = Math.min(5, umgebung + 1);
    const schub = ziel + 1 - m;
    for (const x of innen) {
      const neu = dok.createElement(`h${Math.max(2, Math.min(6, Number(x.tagName[1]) + schub))}`);
      for (const at of [...x.attributes]) neu.setAttribute(at.name, at.value);
      while (x.firstChild) neu.appendChild(x.firstChild);
      x.replaceWith(neu);
    }
    const titel = dok.createElement(`h${ziel}`);
    titel.className = 'summary-titel';
    while (s.firstChild) titel.appendChild(s.firstChild);
    s.appendChild(titel);
  }
  // Abschnitte als Aufklapper (Handbuch, Standards): der Titel im summary wird Überschrift, eine Ebene über
  // der obersten Überschrift im Abschnitt – sonst hingen alle Unterüberschriften unter „Inhaltsverzeichnis“
  for (const d of [...wurzel.querySelectorAll('details')]) {
    const s = d.querySelector(':scope > summary');
    const innen = [...d.querySelectorAll(':scope > :not(summary) :is(h2, h3, h4, h5, h6), :scope > :is(h2, h3, h4, h5, h6)')];
    if (s === null || innen.length === 0 || s.querySelector('h1, h2, h3, h4, h5, h6') !== null) continue;
    const oben = Math.min(...innen.map((x) => Number(x.tagName[1])));
    if (oben <= 2) continue;
    const titel = dok.createElement(`h${oben - 1}`);
    titel.className = 'summary-titel';
    while (s.firstChild) titel.appendChild(s.firstChild);
    if (titel.firstChild !== null && titel.firstChild.nodeType === 3) titel.firstChild.textContent = (titel.firstChild.textContent ?? '').replace(/^\s*\d+\s*-\s*/u, '');
    s.appendChild(titel);
  }
  // Geschwister in derselben Aufklapper-Reihe ohne eigene Unterüberschriften: dieselbe Ebene wie die Nachbarn
  for (const d of [...wurzel.querySelectorAll('details')]) {
    const s = d.querySelector(':scope > summary');
    if (s === null || s.querySelector('h1, h2, h3, h4, h5, h6') !== null || d.parentElement === null) continue;
    const nachbar = [...d.parentElement.children].map((x) => x.matches('details') ? x.querySelector(':scope > summary > .summary-titel') : null).find((x) => x !== null);
    if (nachbar === undefined || nachbar === null) continue;
    const titel = dok.createElement(nachbar.tagName.toLowerCase());
    titel.className = 'summary-titel';
    while (s.firstChild) titel.appendChild(s.firstChild);
    if (titel.firstChild !== null && titel.firstChild.nodeType === 3) titel.firstChild.textContent = (titel.firstChild.textContent ?? '').replace(/^\s*\d+\s*-\s*/u, '');
    s.appendChild(titel);
  }
  // Inhaltsverzeichnis: die Liste zählt selbst, die Nummer im Text („1 - …“) fällt weg
  for (const sp of [...wurzel.querySelectorAll('nav ol > li > span')]) {
    if (sp.firstChild !== null && sp.firstChild.nodeType === 3) sp.firstChild.textContent = (sp.firstChild.textContent ?? '').replace(/^\s*\d+\s*-\s*/u, '');
  }
  // O-1: Selbstdarstellung von BM (Eintrag „Über Bauherr Mentoren“) und Akquise-Hinweise
  for (const h of [...wurzel.querySelectorAll('h3, h4')]) if (/^Über Bauherr Mentoren\b/u.test((h.textContent ?? '').trim())) h.parentElement?.remove();
  for (const li of [...wurzel.querySelectorAll('li')]) if (/Akquise/u.test(li.textContent ?? '')) li.remove();
  // Verweise der Anwendung ohne Ziel („Print-Center →“), Hinweise auf entfallene Ansichten, Schulungsmodule
  for (const el of [...wurzel.querySelectorAll('span')]) {
    const t = (el.textContent ?? '').trim();
    if (t.endsWith('→') && t.length < 50 && el.querySelector('a') === null && el.closest('a') === null) {
      const eltern = el.parentElement;
      el.remove();
      if (eltern !== null && eltern.children.length === 0 && (eltern.textContent ?? '').trim() === '') eltern.remove();
    }
  }
  for (const el of [...wurzel.querySelectorAll('div, p')]) if (el.children.length < 6 && /^Diese Inhalte gibt es jetzt als eigene Ansicht/u.test((el.textContent ?? '').trim())) el.remove();
  for (const el of [...wurzel.querySelectorAll('p')]) if (/^Aktueller Speicher-Modus dieser Instanz/u.test((el.textContent ?? '').trim())) el.remove();
  for (const li of [...wurzel.querySelectorAll('li')]) if (/^Modul 1 oder 2 durcharbeiten/u.test((li.textContent ?? '').trim())) li.remove();
  // frühere Navigationsknöpfe „→ Portfolio-Manager“: ohne Ziel, samt leer gewordener Hülle
  for (const m of [...wurzel.querySelectorAll('.hilfe-marke')]) {
    if (!/^→/u.test((m.textContent ?? '').trim())) continue;
    const eltern = m.parentElement;
    m.remove();
    if (eltern !== null && eltern.children.length === 0 && (eltern.textContent ?? '').trim() === '') eltern.remove();
  }
  // Hinweise auf den Druckknopf der Anwendung (hier gibt es ihn nicht)
  for (const li of [...wurzel.querySelectorAll('li')]) if (/Drucken\/PDF.*klappt alle Kapitel/u.test(li.textContent ?? '')) li.remove();
  // Text: Begriffe nach O-14/O-15/O-29
  const gang = dok.createTreeWalker(wurzel, 4);
  for (let n = gang.nextNode(); n !== null; n = gang.nextNode()) {
    if (n.parentElement?.closest('svg') !== null && n.parentElement?.closest('svg') !== undefined && n.parentElement?.tagName.toLowerCase() !== 'text' && n.parentElement?.tagName.toLowerCase() !== 'tspan') continue;
    n.textContent = ersetze(n.textContent ?? '');
  }
}

/** Text der letzten Überschrift vor einem Element (in Dokumentreihenfolge) */
function letzteUeberschrift(/** @type {Element} */ el) {
  const alle = [...el.ownerDocument.querySelectorAll('h1, h2, h3, h4, h5, *')];
  let text = null;
  for (const x of alle) {
    if (x === el) break;
    if (/^H\d$/u.test(x.tagName)) text = (x.textContent ?? '').replace(/\s+/gu, ' ').trim();
  }
  return text;
}

/** Nach den Ersetzungen: doppelte Angaben „LPH 7: Vergabe (LPH 7)“, Kopplung „LPH-0-Vorlage“ */
function glaette(/** @type {string} */ html) {
  return html
    .replace(/&amp;amp;/gu, '&amp;')
    .replace(/berichtet ins <b>Managementbericht<\/b>/gu, 'berichtet in den <b>Managementbericht</b>')
    .replace(/<b>Kein Lizenzmodell<\/b>, keine/gu, '<b>Keine</b>')
    // O-1: Angebotsaussage über BM (im Quelltext mit Hervorhebung, daher auf dem HTML)
    .replace(/\s*Für Beratungskunden (?:<b>)?kostenfrei(?:<\/b>)?: kein separates Lizenzentgelt, unbegrenzte Nutzungsrechte auch nach Mandatsende\./gu, '')
    .replace(/(LPH (\d)\b(?:[^()<]|<[^>]*>){0,80}?)\s*\(LPH \2\)/gu, '$1')
    .replace(/\bLPH (\d)-(?=[A-ZÄÖÜ])/gu, 'LPH-$1-');
}

/** Klassen der Hilfe erhalten den Vorsatz „h-“: keine Kollision mit Klassen der übrigen Flächen (.tag, .card …) */
function mitVorsatz(/** @type {Element} */ wurzel) {
  for (const el of [...wurzel.querySelectorAll('[class]')]) {
    if (el.closest('svg') !== null) continue;
    el.setAttribute('class', (el.getAttribute('class') ?? '').split(/\s+/u).filter((k) => k !== '').map((k) => (k === 'hilfe-marke' ? k : `h-${k}`)).join(' '));
  }
}

/** Verweise der Anwendung ohne Ziel, die auf Teile der Hilfe (oder die Theorie) zeigen */
const VERWEISE = new Map([
  ['Vollständiges Glossar mit 130 Begriffen', '#hilfe/faq-glossar'],
  ['Detaillierte MVG-Beschreibung', '#theorie'],
  ['Rollen-Anleitungen', '#hilfe/rollen-anleitungen'],
]);

/**
 * Rollenkarten auf ihre Unterseite, tote Verweise auf ihr Ziel verlinken.
 * @param {Element} wurzel
 * @param {Map<string, string>} ziele Titel → Route
 */
function verlinke(wurzel, ziele) {
  const dok = wurzel.ownerDocument;
  const zuLink = (/** @type {Element} */ el, /** @type {string} */ href) => {
    const a = dok.createElement('a');
    a.setAttribute('href', href);
    while (el.firstChild) a.appendChild(el.firstChild);
    el.appendChild(a);
  };
  for (const h of [...wurzel.querySelectorAll('.role-pick-card :is(h2, h3, h4, h5)')]) {
    const ziel = ziele.get((h.textContent ?? '').trim());
    if (ziel !== undefined) zuLink(h, ziel);
  }
  for (const sp of [...wurzel.querySelectorAll('span')]) {
    const ziel = VERWEISE.get((sp.textContent ?? '').trim());
    if (ziel !== undefined && sp.closest('a') === null && sp.querySelector('a') === null) zuLink(sp, ziel);
  }
}

/**
 * @typedef {{ id: string, titel: string, html: string, unter: { id: string, titel: string, html: string }[] }} HilfeKapitel
 * @typedef {{ titel: string, quelle: string, stand: string, kapitel: HilfeKapitel[] }} Hilfe
 */

/**
 * @param {string} html
 * @returns {Hilfe}
 */
export function erzeugeHilfe(html) {
  const { document } = new JSDOM(html).window;
  const abschnitte = [...document.querySelectorAll('section.bm966-kap')];
  /** @type {Map<string, string>} */
  const anker = new Map();
  let nr = 0;
  const kennung = (/** @type {string} */ titel) => titel.toLowerCase().replace(/ä/gu, 'ae').replace(/ö/gu, 'oe').replace(/ü/gu, 'ue').replace(/ß/gu, 'ss').replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '');
  const plan = abschnitte.map((s) => {
    nr += 1;
    const titel = ersetze((s.querySelector(':scope > .bm966-kap-titel')?.textContent ?? '').trim());
    const id = kennung(titel) || `kapitel-${nr}`;
    anker.set(s.id, `#hilfe/${id}`);
    const unter = [...s.querySelectorAll('.bm966-unterkap')].map((u) => {
      const ut = ersetze((u.querySelector('.bm966-unterkap-titel')?.textContent ?? '').replace(/^Rollen-Anleitung:\s*/u, '').trim());
      const uid = `${id}-${kennung(ut)}`;
      anker.set(u.id, `#hilfe/${uid}`);
      return { u, id: uid, titel: ut };
    });
    return { s, id, titel, unter };
  });
  /** @type {HilfeKapitel[]} */
  const kapitel = plan.map(({ s, id, titel, unter }) => {
    const unterAus = unter.map(({ u, id: uid, titel: ut }) => {
      u.querySelector('.bm966-unterkap-titel')?.remove();
      u.remove();
      bereinige(u, anker, ut);
      mitVorsatz(u);
      return { id: uid, titel: ut, html: glaette(u.innerHTML.trim()) };
    });
    s.querySelector(':scope > .bm966-kap-titel')?.remove();
    bereinige(s, anker, titel);
    verlinke(s, new Map([
      ...unter.map(({ id: uid, titel: ut }) => /** @type {[string, string]} */ ([ut, `#hilfe/${uid}`])),
      ...plan.map((p) => /** @type {[string, string]} */ ([p.titel, `#hilfe/${p.id}`])),
    ]));
    mitVorsatz(s);
    return { id, titel, html: glaette(s.innerHTML.trim()), unter: unterAus };
  });
  const kopf = document.querySelector('.bm966-kopf p')?.textContent ?? '';
  const stand = /Stand (\d{4}-\d{2}-\d{2})/u.exec(kopf)?.[1] ?? '';
  return { titel: 'Hilfe', quelle: 'MVG Companion – Hilfe und Vorgehensmodell, v1.34.911', stand, kapitel };
}

/** Sichtbarer Text der Hilfe (für die Begriffsprüfung). @param {Hilfe} h */
export function hilfeText(h) {
  const { document } = new JSDOM('').window;
  const teile = [];
  for (const k of h.kapitel) {
    for (const x of [k, ...k.unter]) {
      const d = document.createElement('div');
      d.innerHTML = x.html;
      // Grafiken: nur ihre sichtbaren Beschriftungen und Beschreibungen zählen
      for (const el of d.querySelectorAll('svg style')) el.remove();
      for (const el of d.querySelectorAll('svg text, svg tspan, svg title, svg desc')) el.append(' ');
      for (const el of d.querySelectorAll('td, th, li, p, div, h1, h2, h3, h4, summary, dt, dd, br')) el.append(' ');
      teile.push(x.titel, d.textContent ?? '');
      for (const el of d.querySelectorAll('[title],[aria-label],[alt]')) teile.push(el.getAttribute('title') ?? '', el.getAttribute('aria-label') ?? '', el.getAttribute('alt') ?? '');
    }
  }
  return teile.join('\n').replace(/[ \t]+/gu, ' ');
}

/**
 * Für die Begriffsprüfung: Kennungen der Software (camelCase, snake_case, ID-Formate wie GATE-<…>,
 * eingeklammerte Datenfelder „(readouts · 30 Einträge)“) sind Namen, keine Begriffe – sie bleiben in der
 * Hilfe stehen (sonst stimmte sie nicht mehr mit der Anwendung überein) und werden hier ausgeblendet.
 * @param {string} t
 */
export function ohneKennungen(t) {
  return t
    .replace(/\b[a-z]+[A-Z][A-Za-z0-9]*\b/gu, '·')
    .replace(/\b\w*_\w+\b/gu, '·')
    .replace(/\b[A-Z]{2,}-(?:<|[A-Z0-9])[\w<>.-]*/gu, '·')
    .replace(/\bGATE\b/gu, '·')
    .replace(/\((?:[a-z][A-Za-z]+)(?:\s·[^)]*)?\)/gu, '(·)');
}

/**
 * @param {{ wurzel?: string, pruefe?: boolean, ziel?: string | null }} [o]
 */
export function baueHilfe(o = {}) {
  const wurzel = o.wurzel ?? WURZEL;
  // Zeilenenden wie im Checkout (.gitattributes: eol=lf), unabhängig von der Arbeitskopie
  const hilfe = erzeugeHilfe(readFileSync(path.join(wurzel, QUELLE), 'utf8').replace(/\r\n?/gu, '\n'));
  const text = hilfeText(hilfe);
  const funde = pruefeText(ohneKennungen(text), 'src/generiert/hilfe.json');
  const wort = text.match(/.{0,30}white\s*-?\s*paper.{0,30}/iu);
  const fehler = funde.map((f) => formatiereFund(f));
  if (wort !== null) fehler.push(`„Whitepaper“ in der Hilfe (O-29): „${wort[0]}“`);
  if (o.ziel !== null) {
    const ziel = path.join(wurzel, o.ziel ?? ZIEL);
    mkdirSync(path.dirname(ziel), { recursive: true });
    writeFileSync(ziel, `${JSON.stringify(hilfe)}\n`);
  }
  return { hilfe, fehler };
}

if (istHauptmodul(import.meta.url)) {
  const pruefe = process.argv.includes('--pruefe');
  const { hilfe, fehler } = baueHilfe();
  const n = hilfe.kapitel.reduce((s, k) => s + 1 + k.unter.length, 0);
  console.log(`hilfe: ${hilfe.kapitel.length} Kapitel, ${n} Seiten → ${ZIEL}`);
  if (fehler.length > 0) {
    for (const f of fehler.slice(0, 40)) console.log(`  ${f}`);
    if (fehler.length > 40) console.log(`  … ${fehler.length - 40} weitere`);
    if (pruefe) process.exitCode = 1;
  }
}
