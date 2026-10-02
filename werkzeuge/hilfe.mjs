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
  // R48: kein allgemeiner Einführungsrhythmus, Bezug nach der Reifegradanalyse (k8.2-p1)
  [/Standardisierter Einfuehrungs-\/Reset-Rhythmus/gu, 'Orientierungsrahmen nach der Reifegradanalyse und bei MVG-Neuinitialisierung'],
  [/MVG-Reifegrad-Modell \(5 Stufen\)/gu, 'Reifegrad-Modell der Anwendung (5 Stufen)'],
  // Beschlussfassung durch den Bauherrn im Lenkungskreis, der Lenkungskreis berät (k4.2-p3, k9.3-p3; R33)
  // R50: die Stufe gilt für jede Entscheidungsvorlage – beschlossen wird nach Mandat (k4.2-p3, k6.4.5-p1)
  [/formal durch Lenkungskreis verabschiedet/gu, 'durch die nach Mandat zuständige Stelle (Bauherren-PL, Änderungsgremium oder Beschlussfassung durch den Bauherrn im Lenkungskreis)'],
  [/im Lenkungskreis verabschiedet/gu, 'vom Bauherrn im Lenkungskreis beschlossen'],
  // R50: die Freigabe erteilt der Bauherr selbst auf Vorlage der Bauherren-PL; der Lenkungskreis berät (k9.3-p3)
  [/entscheidungsreif gemacht und im Lenkungskreis beschlossen/gu, 'entscheidungsreif gemacht; die Freigabe erteilt der Bauherr selbst auf Vorlage der Bauherren-PL (der Lenkungskreis berät)'],
  [/^Bauherr \/ Lenkungskreis:/gu, 'Bauherr (Lenkungskreis berät):'],
  // Eskalation entlang der Mandatsleiter, nicht pauschal an den Lenkungskreis (k4.2-p3, k6.4.5-p1; R45, wie L-69 im Handbuch)
  [/wird sie automatisch markiert und an den Lenkungskreis eskaliert/gu, 'wird sie markiert und entlang der Mandatsleiter eskaliert – an die Bauherren-PL, das Änderungsgremium oder zur Beschlussfassung durch den Bauherrn im Lenkungskreis'],
  [/eskaliert es automatisch an den Lenkungskreis/gu, 'eskaliert es entlang der Mandatsleiter – an die Bauherren-PL, das Änderungsgremium oder zur Beschlussfassung durch den Bauherrn im Lenkungskreis'],
  [/Eskalation an (?:den )?Lenkungskreis/gu, 'Eskalation entlang der Mandatsleiter'],
  [/sofortige Lenkungskreis-Eskalation/gu, 'sofortige Eskalation entlang der Mandatsleiter'],
  // Mandatsleiter k4.2-p3: bis einschließlich 5 Mio. €, darüber beschließt der Bauherr im Lenkungskreis (R46)
  [/Änderungsgremium bis 5 Mio\., darüber Lenkungskreis/gu, 'Änderungsgremium bis einschließlich 5 Mio. €, darüber Beschlussfassung durch den Bauherrn im Lenkungskreis'],
  [/Die MVG-Reife einer Organisation entwickelt sich entlang fünf Stufen/gu, 'Im Modell der Anwendung entwickelt sich die Reife einer Organisation entlang fünf Stufen'],
  [/Eine bewährte Einführungs-Roadmap für neue MVG-Projekte/gu, 'Die Einführungs-Roadmap der Anwendung für neue Projekte'],
  [/Decision Management/gu, 'Entscheidungsmanagement'],
  [/Change Management/gu, 'Änderungsmanagement'],
  [/\s*Druckbar als PDF\./gu, ''],
  [/Mio\. EUR/gu, 'Mio. €'],
  [/einen strukturierten Re-Start/gu, 'eine strukturierte MVG-Neuinitialisierung'],
  [/Re-Start/gu, 'MVG-Neuinitialisierung'],
  [/Wie wir arbeiten\. /gu, ''],
  [/Reifegradmodell des MVG-Standards/gu, 'Reifegradmodell der Anwendung'],
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
  // R48: „Freigabe“ ist ein reguläres Ergebnis, der Bauherr erteilt sie (k6.4.4-p1, k9.3-p3)
  [/Stolperstein: Go ohne Bedingungen - formulieren Sie Auflagen prüfbar und terminiert\./gu, 'Stolperstein: Auflagen ohne Prüfkriterium und Frist – Auflagen prüfbar und terminiert vorschlagen (die Freigabe erteilt der Bauherr).'],
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
  // R47: kanonischer Governance-Fluss (k6.4.3-p1) – Maßnahme vor Managementbericht
  [/Frühwarnung → Risiko → Entscheidung \(Entscheidungsvorlage\) → Freigabe → Managementbericht → Maßnahme/gu, 'Frühwarnung → Risiko → Entscheidung (Entscheidungsvorlage) → Freigabe → Maßnahme → Managementbericht'],
  // R47: der Lenkungskreis berät, der Bauherr beschließt und erteilt Freigaben (k9.3-p3, k13-t1)
  [/^Bestätigt CTC-Neurechnungen mit Abweichung > 5 %$/gu, 'Berät die Entscheidung des Bauherrn, wenn eine CTC-Abweichung über 5 % entlang der Mandatsleiter bei ihm ankommt'],
  [/^Beschlüsse mit klaren Bedingungen fassen$/gu, 'Beschlüsse des Bauherrn mit klaren Bedingungen vorbereiten'],
  [/^Gremium für strategische Change-Beschlüsse$/gu, 'Gremium, in dem der Bauherr Änderungen über 5 Mio. € beschließt (nach Mandat)'],
  [/Managementbericht lesen, Top-Entscheidungen treffen/gu, 'Managementbericht lesen, Top-Entscheidungen des Bauherrn beraten'],
  [/Managementbericht entgegennehmen und Beschlüsse fassen/gu, 'Managementbericht entgegennehmen und die Beschlussfassung des Bauherrn beraten'],
  [/Nutzen Sie den Approval-Workflow in der Entscheidungsvorlage für signierte Freigaben\. Verlangen Sie vor jeder Freigabe/gu, 'Achten Sie darauf, dass der Bauherr die Freigabe im Freigabeprozess der Entscheidungsvorlage signiert, und verlangen Sie vor jeder Freigabe'],
  // R47: kein Wirkungsversprechen ohne Beleg (O-1, O-17); die MVG-Neuinitialisierung ist das Format bei eingeschränkter Steuerbarkeit (k7.5-p1)
  [/Ja, sogar besser als bei einem Neustart – die Lücken sind sichtbar, die Wirkung wird schnell messbar\. Empfehlung: MVG-Neuinitialisierung mit Scout,/gu, 'Ja. Bei eingeschränkter Steuerbarkeit ist die MVG-Neuinitialisierung das passende Format (MVG Kap. 7.5). In der Anwendung: mit Scout,'],
  // R47: Status der Entscheidung und Freigabeprozess der Entscheidungsvorlage getrennt (k6.4.4-p1, k9.4-l1)
  [/(?<!Entscheidungsvorlage: )offen → in Prüfung → vorbereitet → freigegeben → beschlossen \/ abgelehnt \(6 Stufen\)/gu, 'Offen · In Bearbeitung · Entscheidungsreif · Entschieden · Verworfen; Freigabeprozess der Entscheidungsvorlage: offen → in Prüfung → vorbereitet → freigegeben → beschlossen / abgelehnt (6 Stufen)'],
  [/^Status auf "beschlossen" setzen$/gu, 'Freigabeprozess bis „beschlossen“ führen (Status: Entschieden)'],
  [/als Entscheidungen mit Status 'beschlossen' nachgeführt/gu, 'als Entscheidungen mit Status „Entschieden“ nachgeführt'],
  // R47: Zielkonflikt entscheidet der Bauherr, Eskalation entlang der Mandatsleiter (k3.2-t1, k4.2-p3)
  [/max\. 3 % Mehrkosten zulässig, sonst Lenkungskreis/gu, 'max. 3 % Mehrkosten zulässig, sonst Entscheidung des Bauherrn (Eskalation entlang der Mandatsleiter)'],
  // R47: Schwellen der Muster-Mandatsleiter mit „einschließlich“ (k4.2-p3)
  [/Bauherren-PL: Eigenfreigabe bis 100 TEUR/gu, 'Bauherren-PL: Eigenfreigabe bis einschließlich 100 TEUR'],
  [/Änderungsgremium: 100 TEUR bis 5 Mio\. €/gu, 'Änderungsgremium: über 100 TEUR bis einschließlich 5 Mio. €'],
  [/\(bis 100 TEUR\) über das Änderungsgremium \(bis 5 Mio\. €\)/gu, '(bis einschließlich 100 TEUR) über das Änderungsgremium (bis einschließlich 5 Mio. €)'],
  [/Bauherren-PL bis 100 TEUR, Änderungsgremium bis einschließlich/gu, 'Bauherren-PL bis einschließlich 100 TEUR, Änderungsgremium bis einschließlich'],
  [/^Bis 100 TEUR Eigenfreigabe/gu, 'Bis einschließlich 100 TEUR Eigenfreigabe'],
  // R47: Registerzuständigkeiten nach k6.4.2-t1 und k6.4.5-t1
  [/^Register-Verantwortliche \(Projektsteuerung\)$/gu, 'Verantwortliche Rollen, PMO'],
  [/Trägt KEINE projektbezogenen Standard-Zuständigkeiten — RACI\/Prozesse\/Register-Verantwortliche liegen bei der Projektsteuerung/gu, 'Trägt keine projektbezogenen Standard-Zuständigkeiten für RACI und Prozesse (Projektsteuerung); pflegt Maßnahmen-, Problemregister, Governance-Kalender, Protokolle und Nachweise (MVG Kap. 6.4.2)'],
  [/^Elf rollenbasierte Anleitungen$/gu, 'Rollenbasierte Anleitungen, unter anderem'],
  // R47: Grammatik der übernommenen Sätze (L-69 (19))
  [/Das im Monatslauf angestoßene Managementbericht/gu, 'Der im Monatslauf angestoßene Managementbericht'],
  [/für das nächste Managementbericht/gu, 'für den nächsten Managementbericht'],
  [/Im wöchentlichen Maßnahmenverfolgung/gu, 'In der wöchentlichen Maßnahmenverfolgung'],
  [/Beim wöchentlichen Maßnahmenprüfung/gu, 'Bei der wöchentlichen Maßnahmenprüfung'],
  [/mit Auswirkungsvergleich und Nachweise\b/gu, 'mit Auswirkungsvergleich und Nachweisen'],
  [/Annahmen, Risiken, Nachweise und Empfehlung/gu, 'Annahmen, Risiken, Nachweisen und Empfehlung'],
  [/und bestätigen sich das Signal zum Risiko befördert/gu, 'und bei Bestätigung zum Risiko befördert'],
  [/gegenüber dem Vorstand geändert/gu, 'gegenüber der Vorfassung geändert'],
  // R47: englische Wörter im Fließtext (L-69 (12))
  [/Aggregations-\/Berichts-Sink/gu, 'Aggregations- und Berichtssammelpunkt'],
  [/straff und timeboxed/gu, 'straff und mit fester Zeitvorgabe'],
  [/formal benannt und committed/gu, 'formal benannt und verpflichtet'],
  [/Audit-Spotcheck/gu, 'Audit-Stichprobe'],
  [/Werkzeug-Overhead-Trap/gu, 'Werkzeug-Aufwandsfalle'],
  [/rote Findings/gu, 'rote Befunde'],
  [/Anzahl Findings/gu, 'Anzahl Befunde'],
  [/können on-demand zugreifen/gu, 'können bei Bedarf zugreifen'],
  [/Im served Betrieb/gu, 'Im Betrieb über einen Webserver'],
  [/Entscheidungs- und Action-Management/gu, 'Entscheidungs- und Maßnahmensteuerung'],
  [/^Contracts$/gu, 'Verträge'],
  [/Stolperstein: Late Claims -/gu, 'Stolperstein: verspätete Nachforderungen –'],
  [/Threshold-Regeln/gu, 'Schwellenwert-Regeln'],
  [/keine Action erzeugen/gu, 'keine Maßnahme erzeugen'],
  [/Anzahl überfälliger Actions/gu, 'Anzahl überfälliger Maßnahmen'],
  [/^Thresholds$/gu, 'Schwellenwerte'],
  [/^Threshold:$/gu, 'Schwellenwert:'],
  [/\(Risiko\/EW\/Change\/Decision\/Gap\/Threshold\)/gu, '(Risiko/Frühwarnung/Änderung/Entscheidung/Lücke/Schwellenwert)'],
  // R48: PMO pflegt die Register nach k6.4.2-t1; RACI und Prozesse des Projekts bei der Projektsteuerung
  [/projektbezogene Tätigkeiten liegen bei der Projektsteuerung \(voll funktionaler Platzhalter für Kunden mit eigenem projektnahem PMO\)\./gu, 'RACI und Prozesse des Projekts liegen bei der Projektsteuerung (Platzhalter bei eigenem projektnahem PMO); Maßnahmen-, Problemregister, Governance-Kalender und Protokolle pflegt das PMO (MVG Kap. 6.4.2).'],
  // R48: Status der Entscheidung („Entschieden“) getrennt vom Freigabeprozess („beschlossen“) (k6.4.4-p1, k9.4-l1)
  [/auf Status beschlossen aktualisiert/gu, 'auf Status „Entschieden“ aktualisiert'],
  [/Alle offenen, in Prüfung befindlichen oder beschlossenen Entscheidungen/gu, 'Alle offenen, in Bearbeitung befindlichen oder entschiedenen Entscheidungen'],
  [/Tage von offen bis beschlossen/gu, 'Tage von Offen bis Entschieden'],
  // R48: der Lenkungskreis berät, der Bauherr beschließt; Eskalation entlang der Mandatsleiter (k9.3-p3, k4.2-p3, k6.4.5-p1)
  [/was vom Lenkungskreis erwartet wird/gu, 'was der Bauherr entscheiden soll (der Lenkungskreis berät)'],
  [/Setzt Eskalationen aus Risikobesprechung um/gu, 'Berät Eskalationen aus der Risikobesprechung (Beschlussfassung durch den Bauherrn)'],
  [/Abweichung > 5%: Lenkungskreis informieren/gu, 'Abweichung > 5 %: Eskalation entlang der Mandatsleiter'],
  [/— Freigaben verwaltet der Admin\./gu, '— die Sichtbarkeit der Ansichten verwaltet der Admin.'],
  // R48: Controlling weist aus, der Einsatz der Risikoreserve ist nicht delegierbar (k3.2-t1, k6.4.2-t1)
  [/Bestätigt EAC und Risikoreserve/gu, 'Weist EAC und Stand der Risikoreserve aus (Freigabe des Einsatzes: Bauherr)'],
  // R48: Übergabe der Betriebslogik, die Letztverantwortung bleibt beim Bauherrn (k3.3-p2, k6.1-t1)
  [/Übergang der Governance-Verantwortung an den Regelbetrieb des Kundenteams\./gu, 'Übergang der MVG-Betriebslogik aus dem Beratungsmandat in den Eigenbetrieb der Bauherrenorganisation.'],
  [/\(Arbeitsvorrat \/ File\)/gu, '(Arbeitsvorrat / Entscheidungsvorlage)'],
  // R48: Verweise mit Ziel in dieser Hilfe – Glossar unter FAQ & Glossar, Suche auf der Übersicht (L-69 (7))
  [/Eine vollständige Begriffsliste und die ID-Nomenklatur finden Sie unter /gu, 'Die Begriffsliste steht unter FAQ & Glossar, die ID-Nomenklatur unter '],
  [/Status- und Ampelwerte, Namens- und Verknüpfungsregeln sowie das Glossar der Governance-Begriffe/gu, 'Status- und Ampelwerte sowie Namens- und Verknüpfungsregeln (das Glossar der Governance-Begriffe steht unter FAQ & Glossar)'],
  [/Bei Unsicherheit zu einem Begriff erst ins Glossar schauen/gu, 'Bei Unsicherheit zu einem Begriff erst ins Glossar (FAQ & Glossar) schauen'],
  [/Mit Volltextsuche über Handbuch, Standards und Kontext-Hilfen — Treffer springen direkt ins Kapitel\./gu, 'Die Hilfe ist über die Suche auf ihrer Übersicht durchsuchbar.'],
  [/Im Handbuch blättern, statt die Volltextsuche zu nutzen/gu, 'Im Handbuch blättern, statt die Suche auf der Übersicht der Hilfe zu nutzen'],
  [/Live-Suche durchsucht beide: FAQ und Glossar/gu, 'Die Suche auf der Übersicht der Hilfe durchsucht beide: FAQ und Glossar'],
  [/Glossar mit Live-Suche von/gu, 'Glossar von'],
  [/ – mit Live-Suche/gu, ' – durchsuchbar über die Übersicht der Hilfe'],
  // R48: englische Wörter im Fließtext (L-69 (12))
  [/Risiko, EW, Change, Decision oder Gap/gu, 'Risiko, Frühwarnung, Änderung, Entscheidung oder Lücke'],
  [/Early-Warning-Behandlung/gu, 'Frühwarnungs-Behandlung'],
  [/durch Accountable Role bestätigt/gu, 'durch die letztverantwortliche Rolle (A) bestätigt'],
  [/side-by-side/gu, 'nebeneinander'],
  [/RAG-Status/gu, 'Ampelstatus'],
  [/Cross-Project-KPIs/gu, 'projektübergreifende Kennzahlen'],
  [/Knowledge-Transfer/gu, 'Wissenstransfer'],
  [/Ausreißer und Best\/Worst-Performer/gu, 'Ausreißer sowie die stärksten und schwächsten Projekte'],
  [/"Suggested Reaction"/gu, '„Vorgeschlagene Reaktion“'],
  [/Source und Source-ID \(woher die Aktion stammt\)/gu, 'Quelle und Quellen-ID (woher die Maßnahme stammt)'],
  [/im Stand-up/gu, 'in der kurzen Abstimmungsrunde'],
  [/\(TL;DR\)/gu, '(Überblick)'],
  [/Cross-Link zu Freigabe, EW, Nachweise/gu, 'Querverweis zu Freigabe, Frühwarnung und Nachweisen'],
  [/Cross-Links\b/gu, 'Querverweise'],
  [/Cross-Link\b/gu, 'Querverweis'],
  [/High-Priority-Entscheidungen/gu, 'Entscheidungen mit hoher Priorität'],
  // R49: Nachweise und Verknüpfungen pflegt das PMO mit den Fachrollen (k6.4.2-t1)
  [/Bauherren-PL pflegt Nachweise (?:&amp;|&) Links\./gu, 'Nachweise und Verknüpfungen pflegt das PMO mit den Fachrollen (MVG Kap. 6.4.2).'],
  // R49: BM-Mentor ist eine Einführungsrolle, nach der Einführung deaktiviert (k9.2-p4; O-34)
  [/— dazu der BM-Mentor \(Betreiber-Rolle\)\./gu, '— dazu die Sonderrolle BM-Mentor als Einführungsrolle, nach der Einführung deaktiviert (MVG Kap. 9.2).'],
  [/ohne operative Verantwortung \(keine RACI-\/Prozess-Teilnahme\)/gu, 'ohne operative Verantwortung (keine RACI-/Prozess-Teilnahme) – nur für die Einführung, danach deaktiviert (MVG Kap. 9.2)'],
  // R49: 30/60/90 nach k8.2-p2…p4 (Mindestmodell, Modell in Anwendung, Übergabe schließt an)
  [/60 Tage Stabilisierung, 90 Tage Regelbetrieb\/Übergabe\./gu, '60 Tage Mindestmodell aufgebaut, 90 Tage Modell in Anwendung – die Übergabe schließt an (MVG Kap. 8.2).'],
  // R49: Beschlüsse werden als Maßnahmen nachverfolgt (k6.4.3-p2); Pflege durch die verantwortlichen Rollen
  [/überfällige Aktionen/gu, 'überfällige Maßnahmen'],
  [/Beschlüsse und Aktionen\./gu, 'Beschlüsse und Maßnahmen.'],
  [/verantwortliche Rolle pflegen ihre Register/gu, 'die verantwortlichen Rollen pflegen ihre Register'],
  // R49: englische und saloppe Wörter im Fließtext (L-69 (12))
  [/von Best zu Worst/gu, 'von stärkeren zu schwächeren Projekten'],
  [/Source-Verknüpfung/gu, 'Quellen-Verknüpfung'],
  [/ultimative Verantwortung/gu, 'Letztverantwortung'],
  [/Anti-Patterns/gu, 'Fehlmuster'],
  [/MVG-Adoption/gu, 'MVG-Einführung'],
  [/Genau eine Accountable-Rolle je Prozess/gu, 'Genau eine letztverantwortliche Rolle (A) je Prozess'],
  // R49: Vorlage zur Entscheidung nach Mandat (k6.4.5-p1), nicht „dem Gremium“
  [/Sie wird dem Gremium zur Beschlussfassung vorgelegt\./gu, 'Sie wird zur Entscheidung nach Mandat vorgelegt (Bauherren-PL, Änderungsgremium oder Beschlussfassung durch den Bauherrn im Lenkungskreis).'],
  // R49: Leitthese im Wortlaut von V1.2 (k1-p1)
  [/Kernthese: Arbeit ist delegierbar, Verantwortung nicht\./gu, 'Kernthese: Arbeit kann delegiert werden; bauherrenseitige Legitimation nicht (MVG Kap. 1).'],
  [/Glossar von Accountable bis Abweichung/gu, 'Glossar von Abweichung bis Zielsystem-Dokument'],
  // R49: Kundenanpassung ohne Werbeversprechen
  [/ — ohne eine Zeile Code\./gu, '.'],
  [/das Ergebnis ist garantiert prüfungs-grün/gu, 'das Ergebnis durchläuft die Prüfung'],
  [/Regel: Kein Paket verlässt das Haus ohne „✔ 0 Fehler"\./gu, 'Regel: Ausgeliefert wird nur ein Paket mit „✔ 0 Fehler“.'],
  // R50: 30/60/90 auch im Handbuch nach k8.2-p1…p4 (Orientierungsrahmen; Mindestmodell, Modell in Anwendung)
  [/^ Mandate, Freigabe-\/Entscheidungslogik, Register und Managementbericht stabilisieren\.$/gu, ' Mindestmodell aufgebaut: Zielsystem, Mandatslogik, Leistungsphasen- und Freigabemodell, Entscheidungs-IDs, Datenstandslogik, Eskalation.'],
  [/^ Pilotbetrieb, Übergabe, Verbesserungs-Arbeitsvorrat\.$/gu, ' Modell in Anwendung, Schwellen kalibriert, Entwurf des Betriebshandbuchs – die Übergabe schließt an. Orientierungsrahmen nach der Reifegradanalyse und bei MVG-Neuinitialisierung (MVG Kap. 8.2).'],
  // R50: „Approval“ im Fließtext → Freigabeprozess (der Entscheidungsvorlage, k9.4-l1); der Glossarbegriff der Anwendung bleibt
  [/Entscheidungsvorlagen mit Approval-Workflow\./gu, 'Entscheidungsvorlagen mit Freigabeprozess.'],
  [/Empfehlung und Approval-Workflow\./gu, 'Empfehlung und Freigabeprozess.'],
  [/im Approval-Workflow der Entscheidungsvorlage/gu, 'im Freigabeprozess der Entscheidungsvorlage'],
  [/^Approval-Workflow durchlaufen$/gu, 'Freigabeprozess durchlaufen'],
  [/MCDA (?:&amp;|&) Approval-Workflow\)/gu, 'MCDA & Freigabeprozess)'],
  [/Nutzen Sie die Approval-Workflows in der Entscheidungsvorlage/gu, 'Nutzen Sie den Freigabeprozess in der Entscheidungsvorlage'],
  [/^Approval-Stufen$/gu, 'Stufen des Freigabeprozesses'],
  [/Entscheidungen \(Approval\)/gu, 'Entscheidungen (Freigabeprozess)'],
  [/Wirkung, Approval\)/gu, 'Wirkung, Freigabeprozess)'],
  [/Gateway \(Entscheidung\)/gu, 'Verzweigung (Entscheidung)'],
  // R50: die Summenzeile der Quelle entfällt – gezeigt werden 51 Bereiche
  [/Alle Bereiche des Datenvertrags \(52\)/gu, 'Alle Bereiche des Datenvertrags (51)'],
  // R51: Entscheidungen werden nach Mandat beschlossen, Freigaben erteilt der Bauherr (k4.2-p3, k6.4.5-p1, k9.3-p3)
  [/ausgearbeitet zur Entscheidungsvorlage und an der Freigabe beschlossen/gu, 'ausgearbeitet zur Entscheidungsvorlage und nach Mandat beschlossen'],
  [/\) → zur Freigabe bringen\./gu, ') → nach Mandat entscheiden lassen.'],
  // R51: Rhythmus nach k6.4.5-t1
  [/^Projektleitung, verantwortliche Rolle$/gu, 'Bauherren-PL, Projektsteuerung, verantwortliche Rolle'],
  [/^PL, Controlling$/gu, 'Bauherren-PL, Controlling, PMO'],
  // R51: das Vorgehen der Anwendung ist keine Regel aus V1.2 (O-17)
  [/ Fokus auf 3 dringendste Domänen, danach systematisch erweitern\./gu, ' Fokus auf die dringendsten Domänen, danach erweitern.'],
  // R51: „Freigabe“ nur für die Entscheidung des Bauherrn (BEGRIFFE)
  [/Freigabe Fassadenmuster 12 Tage überfällig/gu, 'Bemusterung Fassade 12 Tage überfällig'],
  [/^ Risiko wird beobachtet$/gu, ' Risiko wird gesteuert (Risikominderung läuft)'],
  // R51 (O-34): sachlich statt aus Sicht des Beratungsbetriebs
  [/^Neukunden-Einrichtung:$/gu, 'Einrichtung eines neuen Portfolios:'],
  [/^Kunden-Austausch:$/gu, 'Austausch:'],
  [/^ JSON-Datei vom Kunden anfordern/gu, ' Projektdatei anfordern'],
  [/^Beraterstandard:$/gu, 'Organisationsstandard:'],
  [/^ firmeneigene Vorlagen für wiederkehrende Projekttypen$/gu, ' eigene Vorlagen für wiederkehrende Projekttypen'],
  [/Mit anderen Beratern via Export/gu, 'Mit anderen Installationen via Export'],
  [/Zwei Berater haben parallel offline gearbeitet/gu, 'Zwei Personen haben parallel offline gearbeitet'],
  [/Geführte Erst-Einrichtung einer Kundeninstallation/gu, 'Geführte Erst-Einrichtung einer Installation'],
  [/Die Kunden-Einführung per Checkliste aufsetzen/gu, 'Die Einführung per Checkliste aufsetzen'],
  // R52: „Freigabe“ nur für die Entscheidung des Bauherrn (BEGRIFFE) – Dossier, Beschluss, Change
  [/Kompaktes Freigabe-Dossier für Kunden-IT und Datenschutz\./gu, 'Kompaktes Prüf-Dossier für die IT und den Datenschutz.'],
  [/Kompaktes, druckbares Freigabe-Dossier für Kunden-IT\/Datenschutz/gu, 'Kompaktes, druckbares Prüf-Dossier für IT/Datenschutz'],
  [/^Kurzfreigabe \(Überblick\)$/gu, 'Kurzfassung (Überblick)'],
  [/Vor dem Einsatz beim Kunden ausdrucken und mit IT\/Datenschutz freigeben/gu, 'Vor dem Einsatz ausdrucken und mit IT/Datenschutz abstimmen'],
  [/Eine veraltete Version vorlegen → Freigabe passt nicht zum Stand/gu, 'Eine veraltete Version vorlegen → Prüfung passt nicht zum Stand'],
  [/Beschluss: Rohbauvergabe an Bieter B, Budget 4,1 Mio freigegeben/gu, 'Beschluss: Rohbauvergabe an Bieter B'],
  // R53: Änderungen entscheidet das Gremium nach Mandat; A heißt „letztverantwortlich“ (k4.2-p1)
  [/Gremium zur Bewertung und Freigabe von Changes\./gu, 'Gremium zur Bewertung und Entscheidung von Änderungen nach Mandat (über 100 TEUR bis einschließlich 5 Mio. €).'],
  [/Sie steuert Change-Freigaben und Eskalationsstufen/gu, 'Sie steuert Änderungsbeschlüsse und Eskalationsstufen'],
  [/Ist Accountable für alle Freigaben LPH 0–9/gu, 'Ist letztverantwortlich (A) für alle Freigaben LPH 0–9'],
  [/Bauherr ist Accountable für alle Freigaben/gu, 'Bauherr ist letztverantwortlich (A) für alle Freigaben'],
  [/Accountable bleibt der Bauherr/gu, 'letztverantwortlich (A) bleibt der Bauherr'],
  [/den der Bauherr als Accountable auf Basis/gu, 'den der Bauherr als letztverantwortliche Rolle (A) auf Basis'],
  [/wer verantwortet \(R\), rechenschaftspflichtig ist \(A\), konsultiert \(C\) oder informiert \(I\) wird/gu, 'wer ausführt (R), wer letztverantwortlich ist (A), wer konsultiert (C) oder informiert (I) wird'],
  [/Wer verantwortet \(R\), wer ist rechenschaftspflichtig \(A\)/gu, 'Wer führt aus (R), wer ist letztverantwortlich (A)'],
  [/^ Accountable - rechenschaftspflichtig/gu, ' Accountable – letztverantwortlich'],
  // R54: auch die übrigen „Accountable“ im Fließtext (Glossar-Stichwort und RACI-Auflösung bleiben) und das Glossar „Mandat“ (k13-t1)
  [/genau eine Rolle ist Accountable\./gu, 'genau eine Rolle ist letztverantwortlich (A).'],
  [/mit genau einem Accountable,/gu, 'mit genau einer letztverantwortlichen Rolle (A),'],
  [/als Verantwortlich, Accountable oder Freigeber/gu, 'als ausführungsverantwortlich (R), letztverantwortlich (A) oder freigebend'],
  [/Verantwortlich\/Accountable\/Responsible/gu, 'ausführungs- oder letztverantwortlich (R/A)'],
  [/Entscheidungs-Accountable/gu, 'letztverantwortliche Rolle (A) der Entscheidung'],
  [/^Freigabebefugnis einer Rolle mit Schwellenwert\.$/gu, 'Klar zugewiesene Entscheidungs- und Eskalationsbefugnis einer Rolle oder eines Gremiums, verbunden mit Schwellen, Stellvertretung und Freigabeweg.'],
  // R55: Freigabe mit Auflagen gibt frei; Auflagen werden zu Maßnahmen (k6.4.4-p1, k6.4.3-p2)
  // R59: CTC-Neurechnung ist delegierbar (Controlling); der Lenkungskreis berät die Entscheidung des Bauherrn
  [/ab über 5 %/gu, 'über 5 %'],
  // R60: Risiko-, Entscheidungs- und Maßnahmensteuerung – Registerpflege nach MVG Kap. 6.4.2
  [/^Verantwortet Risiko-, Entscheidungs- und Maßnahmensteuerung$/gu, 'Steuert Risiken, Entscheidungen und Maßnahmen; pflegt Entscheidungs- und Änderungsregister sowie die Leistungsphase (Freigaben; MVG Kap. 6.4.2)'],
  [/^Die beim Bauherrn verbleibende Verantwortung für Ziel, Grundsatzentscheidung, wesentliche Freigabe, Risikoannahme und Nachweisfähigkeit – auch bei vollständig delegierter Vorbereitung\.$/gu, 'Die beim Bauherrn verbleibende Verantwortung für Ziel, Grundsatzentscheidung, wesentliche Freigabe, Risikoannahme, Nachweisfähigkeit und Beschlusslage – auch bei vollständig delegierter Vorbereitung.'],
  // R58: auch die Bauherren-PL stößt die CTC-Neurechnung beim Controlling an (k6.4.2-t1)
  [/Bei Drift: CTC-Neurechnung, Eskalation entlang der Mandatsleiter/gu, 'Bei Drift: CTC-Neurechnung beim Controlling anstoßen, Eskalation entlang der Mandatsleiter'],
  // R58: Glossar „MVG“ und „Betriebshandbuch“ im Wortlaut von k13-t1; Maßnahme ohne verkürzte Kette; LPH 0 legitimiert den Planungsstart
  [/^Minimum Viable Governance\. Schlanker Governance-Standard\.$/gu, 'Minimum Viable Governance: kleinster funktionsfähiger Governance-Standard, mit dem Bauherrenverantwortung entscheidungsfähig, nachweisbar und operabel wird.'],
  [/^Handlungsanweisung für den Regelbetrieb\.$/gu, 'Betriebslogik für den Regelbetrieb von MVG mit Rollen, Routinen, Taktung, Eskalation und Prüfmechanismen.'],
  [/Aus einer behandelten Frühwarnung angelegte Maßnahme im Maßnahmenregister mit verantwortlicher Rolle und Frist, verknüpft mit dem auslösenden Signal\. Sie schließt die Kette Frühwarnung → Risiko → Maßnahme\./gu, 'Maßnahme im Maßnahmenregister mit verantwortlicher Rolle und Frist, z. B. als Sofortreaktion aus der Frühwarnungs-Behandlung, verknüpft mit dem auslösenden Signal.'],
  [/Initialisierungs-Freigabe LPH 0, mit der der Bauherr den Projektstart freigibt\./gu, 'Freigabe zum Abschluss von LPH 0, mit der der Bauherr die Grundlage für den Planungsstart legitimiert.'],
  [/^ schlanke Steuerungsentscheidung – kein vollständiges PPM-System/gu, ' Markierung in der Portfoliosicht – die Entscheidung selbst ist eine wesentliche Entscheidung des Bauherrn (MVG Kap. 4.3)'],
  // R58: dieselbe Größe heißt CTC (Restkostenprognose) wie im Glossar – nicht FTC/Forecast-to-Complete
  [/Ist-Kosten plus Forecast-to-Complete/gu, 'Ist-Kosten plus CTC (Restkostenprognose)'],
  [/Halten Sie die FTC-Schätzung/gu, 'Halten Sie die CTC-Schätzung'],
  [/FTC 6,1 Mio/gu, 'CTC 6,1 Mio'],
  // R57: CTC und Prognose führt das Controlling (k6.4.2-t1, k6.4.5-t1); die Projektsteuerung liefert zu
  [/Erstellt CTC-Neurechnungen und Prognosen/gu, 'Liefert Kosten- und Terminstände für CTC und Prognose zu (Führung: Controlling)'],
  [/Monatlich: CTC-Closing und Prognose-Szenarien rechnen/gu, 'Monatlich: Zulieferung zum CTC-Closing (Controlling)'],
  // R57: Beschlüsse fasst der Bauherr im Lenkungskreis (k9.3-p3)
  [/Mandate bei Phasenwechseln und Lenkungskreis-Beschlüssen überprüfen/gu, 'Mandate bei Phasenwechseln und Beschlüssen des Bauherrn im Lenkungskreis überprüfen'],
  // R56: Glossar „Freigabe“ mit der Zuständigkeit (k13-t1, k9.3-p3); Säule II trennt Entscheidung und Freigabeprozess der Vorlage
  [/^Strukturierter Entscheidungsmeilenstein \(LPH 0–9\)\.$/gu, 'Entscheidung des Bauherrn am Abschluss einer Leistungsphase (LPH 0–9); sie gibt die nächste Leistungsphase frei. Die Freigabe erteilt der Bauherr selbst auf Vorlage der Bauherren-PL; der Lenkungskreis berät.'],
  [/Entscheidungen durchlaufen 6 signierte Stufen in der Nachweiskette\./gu, 'Entscheidungsvorlagen durchlaufen den Freigabeprozess mit signierten Stufen in der Nachweiskette (offen → … → beschlossen / abgelehnt).'],
  [/^Freigabebeschluss mit Auflagen, die vor weiterem Fortschritt erfüllt werden müssen\.$/gu, 'Freigabebeschluss, der die nächste Leistungsphase freigibt und Auflagen festlegt; die Auflagen werden zu Maßnahmen mit Frist.'],
  [/Zustand eines freigegebenen Changes/gu, 'Zustand eines beschlossenen Changes'],
  [/^Antrag\/Freigabe$/gu, 'Antrag/Beschluss'],
  [/→ Entscheidung \(Freigabe\)/gu, '→ Entscheidung (nach Mandat)'],
  // R52 (O-34): ohne Sicht des Beratungsbetriebs
  [/Bei der Einführung neuer Berater oder Kundenteams/gu, 'Bei der Einführung neuer Teammitglieder'],
  [/^Einführung neuer Berater$/gu, 'Einführung neuer Beteiligter'],
  [/ein aktives Kundenprojekt mit vollständigem Profil/gu, 'ein aktives Projekt mit vollständigem Profil'],
  [/^Aktives Kundenprojekt $/gu, 'Aktives Projekt '],
  // R52: Nachweisfähigkeit statt Revisionssicherheit (k1.3-t1: „Nachweiskette“)
  [/Nachvollziehbarkeit und Revisionssicherheit\./gu, 'Nachvollziehbarkeit und Nachweisfähigkeit.'],
  [/Sichert Revisionssicherheit und die dauerhafte Auffindbarkeit/gu, 'Sichert die Nachweisfähigkeit und die dauerhafte Auffindbarkeit'],
  [/revisionssicher archiviert/gu, 'nachweisfähig archiviert'],
  [/Chronologische, unveränderliche Historie aller Mutationen/gu, 'Chronologische, fortlaufende Historie aller Änderungen'],
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
  // O-1: Leistungszuschnitt der Beratung (Engagements mit Laufzeiten) – Abschnitt bis zum nächsten Trenner;
  // O-17 (R49): Zuordnung zu Normen („MVG ist kompatibel …“, „vollständige Abdeckung“) ist keine Aussage aus V1.2
  for (const h of [...wurzel.querySelectorAll('h2')]) {
    // R50: dazu „Methodische Grundlage“ (Anschluss an ISO/NAO/PRINCE2 – keine Aussage von V1.2)
    if (!/MVG-Lifecycle in der Beratungspraxis|Compliance & Standards-Zuordnung|^Methodische Grundlage$/u.test((h.textContent ?? '').trim())) continue;
    let x = h.nextElementSibling;
    while (x !== null && !/^H[12]$/u.test(x.tagName) && !x.classList.contains('section-divider')) {
      const weiter = x.nextElementSibling;
      x.remove();
      x = weiter;
    }
    h.remove();
  }
  // O-1/O-17: FAQ „ROI“ mit Wirkungszahlen, die V1.2 nicht nennt (R45); R49: Abgrenzung zum „klassischen PMO“
  // (V1.2 führt das PMO als Arbeitsrolle, k9.2-p4) und „wenn der Berater abzieht“ (Beraterbezug, O-34) – Korrekturliste
  const FAQ_WEG = /ROI von MVG|von einer klassischen PMO-Einrichtung|wenn der Berater abzieht/u;
  for (const d of [...wurzel.querySelectorAll('details')]) if (FAQ_WEG.test(d.querySelector(':scope > summary')?.textContent ?? '')) d.remove();
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
  // Feldnamen der Anwendung nicht in Überschriften („Leistungsphase (gates)“, R45)
  for (const c of [...wurzel.querySelectorAll(':is(h1, h2, h3, h4, h5, h6) code')]) if (/^\(\w+\)$/u.test((c.textContent ?? '').trim())) { const vor = c.previousSibling; c.remove(); if (vor?.nodeType === 3) vor.textContent = (vor.textContent ?? '').trimEnd(); }
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
    if (vor !== null && /^H\d$/u.test(vor.tagName)) {
      vor.textContent = (vor.textContent ?? '').replace(/G0\s*[–-]\s*G9/u, '(Freigabestufen 0–4)');
      // R43: das Stufenmodell steht unter „MVG-Methodik“ – am Ort sagen, dass es das der Anwendung ist (Satz wortgleich k9.3-p1)
      const vermerk = dok.createElement('p');
      vermerk.className = 'hilfe-hinweis';
      vermerk.textContent = 'Stufenmodell der Anwendung, keine Leistungsphasen. In MVG gilt: „Jede Leistungsphase endet mit einer Freigabe des Bauherrn.“ (Theorie, Kapitel 9.3)';
      vor.after(vermerk);
    }
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
  // … und ist ohne Verweise keine Navigation: <nav> ohne Link wird <div class="toc"> (ausgeliefert als h-toc; P12.5 R23, L-69 (8))
  for (const nav of [...wurzel.querySelectorAll('nav')]) {
    if (nav.querySelector('a[href]') !== null) continue;
    const div = dok.createElement('div');
    div.className = 'toc';
    while (nav.firstChild) div.appendChild(nav.firstChild);
    nav.replaceWith(div);
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
  // Nebeneinanderstehende Marken (frühere Knöpfe, Pillen, Plaketten) beim Vorlesen und Kopieren trennen
  for (const m of [...wurzel.querySelectorAll('.hilfe-marke, .pill, .badge, .tag')]) {
    const n = m.nextSibling;
    if (n !== null && n.nodeType === 1 && /** @type {Element} */ (n).matches('.hilfe-marke, .pill, .badge, .tag')) m.after(dok.createTextNode(' '));
  }
  // Hinweise auf den Druckknopf der Anwendung (hier gibt es ihn nicht)
  for (const li of [...wurzel.querySelectorAll('li')]) if (/Drucken\/PDF.*klappt alle Kapitel/u.test(li.textContent ?? '')) li.remove();
  // Text: Begriffe nach O-14/O-15/O-29
  const gang = dok.createTreeWalker(wurzel, 4);
  for (let n = gang.nextNode(); n !== null; n = gang.nextNode()) {
    if (n.parentElement?.closest('svg') !== null && n.parentElement?.closest('svg') !== undefined && n.parentElement?.tagName.toLowerCase() !== 'text' && n.parentElement?.tagName.toLowerCase() !== 'tspan') continue;
    n.textContent = ersetze(n.textContent ?? '');
  }  angleiche(wurzel);
  // R47: Umbruchstelle ohne Zeichen nach „/“ zwischen Wörtern (Ketten wie „Rollen/Freigaben/Entscheidungen“ brachen mitten im Wort)
  const gangW = dok.createTreeWalker(wurzel, 4);
  /** @type {Text[]} */
  const ketten = [];
  for (let n = gangW.nextNode(); n !== null; n = gangW.nextNode()) if (/[\p{L}-]\/\p{L}/u.test(n.textContent ?? '') && n.parentElement?.closest('code, svg, script, style') === null) ketten.push(/** @type {Text} */ (n));
  for (const t of ketten) {
    const teile = (t.textContent ?? '').split(/(?<=[\p{L}-]\/)(?=\p{L})/u);
    const frag = dok.createDocumentFragment();
    teile.forEach((teil, i) => { if (i > 0) frag.append(dok.createElement('wbr')); frag.append(dok.createTextNode(teil)); });
    t.replaceWith(frag);
  }
  // R50: Dateinamen und Kennungen in code brechen nach „_“ und „-“ und vor „.“ um, nicht mitten im Wort („mvg_project_pack|age.json“)
  const gangC = dok.createTreeWalker(wurzel, 4);
  /** @type {Text[]} */
  const kennungen = [];
  for (let n = gangC.nextNode(); n !== null; n = gangC.nextNode()) if (n.parentElement?.closest('code') !== null && n.parentElement?.closest('svg') === null && /\w[_.-]\w/u.test(n.textContent ?? '')) kennungen.push(/** @type {Text} */ (n));
  for (const t of kennungen) {
    const teile = (t.textContent ?? '').split(/(?<=\w[_-])(?=\w)|(?<=\w)(?=\.\w)/u);
    const frag = dok.createDocumentFragment();
    teile.forEach((teil, i) => { if (i > 0) frag.append(dok.createElement('wbr')); frag.append(dok.createTextNode(teil)); });
    t.replaceWith(frag);
  }
}

/**
 * R47: Zuständigkeiten, die sich nur aus Tabellenzeile, Listenpunkt oder Glossarname ergeben, an MVG angleichen
 * (k6.4.2-t1 Registerzuständigkeit, k4.2-p3/k6.4.5-p1 Eskalation, k9.3-p3 Freigabe, k3.3-t1 Verantwortungspyramide).
 * @param {Element} wurzel
 */
function angleiche(wurzel) {
  const dok = wurzel.ownerDocument;
  const text = (/** @type {Element | null | undefined} */ el) => (el?.textContent ?? '').replace(/\s+/gu, ' ').trim();
  for (const t of [...wurzel.querySelectorAll('table')]) {
    // R47: Kopfzeile aus th im tbody (Cheat-Sheets der Rollen) als thead – im Druck wiederholt und nie allein am Seitenende
    const ersteZeile = t.querySelector(':scope > tbody > tr:first-child');
    if (t.querySelector(':scope > thead') === null && ersteZeile !== null && ersteZeile.children.length > 0 && [...ersteZeile.children].every((z) => z.tagName === 'TH')) {
      const thead = dok.createElement('thead');
      thead.append(ersteZeile);
      t.prepend(thead);
    }
    const kopf = [...t.querySelectorAll('thead th')].map((x) => text(x)).join('|');
    const tb = t.querySelector('tbody');
    if (kopf === 'Register|Verantwortlich' && tb !== null) {
      tb.replaceChildren(...[
        ['Entscheidungsregister · Änderungsregister · Leistungsphase', 'Bauherren-PL'],
        ['Risikoregister · Frühwarnungsregister', 'Projektsteuerung'],
        ['Maßnahmenregister · Problemregister · Governance-Kalender · Protokolle', 'PMO'],
        ['CTC / Prognose', 'Controlling'],
        ['Nachweise & Übergabe/Betriebshandbuch', 'PMO (mit Fachrollen)'],
      ].map((zeile) => {
        const tr = dok.createElement('tr');
        for (const z of zeile) { const td = dok.createElement('td'); td.textContent = z; tr.append(td); }
        return tr;
      }));
    }
    for (const tr of [...t.querySelectorAll('tbody tr')]) {
      const z = [...tr.children];
      if (text(z[0]) === 'Risiko-/Mandats-Eskalation' && text(z[2]) === 'Lenkungskreis' && z[2] !== undefined) z[2].textContent = 'nächste Stufe der Mandatsleiter (Änderungsgremium bzw. Bauherr im Lenkungskreis)';
      if (text(z[0]) === 'Freigabeentscheidung' && text(z[1]) === 'Lenkungskreis' && z[1] !== undefined) z[1].textContent = 'Bauherr (im Lenkungskreis)';
      // Glossar: die drei Ebenen heißen in MVG Verantwortungspyramide; die gleichnamige Ansicht der Anwendung zeigt die Mandatsleiter
      const b = z[0]?.querySelector('b');
      if (b !== null && b !== undefined && text(b) === 'Verantwortungspyramide' && /^Die im Companion visualisierte Mandats/u.test(text(z[1]))) b.textContent = 'Verantwortungspyramide (Ansicht der Anwendung)';
      if (b !== null && b !== undefined && text(b) === 'Verantwortungsdreieck') b.textContent = 'Verantwortungspyramide (MVG Kap. 3.3)';
    }
  }
  // Handbuch · Übergabe: verantwortliche Rolle je Register nach k6.4.2-t1
  const soll = new Map([['EW Log:', ['Frühwarnungsregister:', ' Projektsteuerung']], ['Änderungsregister:', ['Änderungsregister:', ' Bauherren-PL']]]);
  for (const li of [...wurzel.querySelectorAll('li')]) {
    const b = li.firstElementChild;
    const neu = b?.tagName === 'B' ? soll.get(text(b)) : undefined;
    if (b === null || b === undefined || neu === undefined || li.childNodes.length !== 2 || li.lastChild?.nodeType !== 3) continue;
    if (![li.previousElementSibling, li.nextElementSibling].some((x) => /^(?:Risikoregister|Entscheidungsregister|Maßnahmenregister|Frühwarnungsregister):/u.test(text(x)))) continue;
    b.textContent = neu[0];
    /** @type {Text} */ (li.lastChild).textContent = neu[1];
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

/** Nach den Ersetzungen (auf dem HTML): doppelte Angaben „LPH 7: Vergabe (LPH 7)“, Kopplung „LPH-0-Vorlage“, fachliche Glättungen.
 * R64: als Liste exportiert und wie ERSETZUNGEN eingefroren (tests/hilfe-glaettungen.muster.json) – keine Regel fällt still weg */
export const GLAETTUNGEN = /** @type {[RegExp, string | ((...teile: string[]) => string)][]} */ ([
  [/&amp;amp;/gu, '&amp;'],
  [/berichtet ins <b>Managementbericht<\/b>/gu, 'berichtet in den <b>Managementbericht</b>'],
  [/werden am <span>Freigabe<\/span> beschlossen/gu, 'werden an der <span>Freigabe</span> beschlossen'],
  // R51: nach Mandat beschlossen; an einer Freigabe entscheidet der Bauherr (k4.2-p3, k6.4.5-p1, k9.3-p3)
  [/werden an der <span>Freigabe<\/span> beschlossen \(Freigeben \/ Nicht freigeben \/ Freigabe mit Auflagen\)/gu, 'werden nach Mandat beschlossen (Bauherren-PL, Änderungsgremium oder Beschlussfassung durch den Bauherrn im Lenkungskreis); betrifft eine Entscheidung eine <span>Freigabe</span>, entscheidet der Bauherr dort über Freigeben / Nicht freigeben / Freigabe mit Auflagen'],
  // (auch in der Beschreibung der Grafik – <desc> geht nicht durch ersetze)
  [/ausgearbeitet zur Entscheidungsvorlage und an der Freigabe beschlossen/gu, 'ausgearbeitet zur Entscheidungsvorlage und nach Mandat beschlossen'],
  [/ausgearbeitet und an der <b>Freigabe<\/b> beschlossen wird/gu, 'ausgearbeitet und nach Mandat beschlossen wird (die <b>Freigabe</b> erteilt der Bauherr)'],
  [/mit <span>Entscheidungsvorlage<\/span>-Vorlagen/gu, 'mit Vorlagen für <span>Entscheidungsvorlagen</span>'],
  // das Inhaltsverzeichnis ist hier eine Liste ohne Verweise
  [/<li>Das Inhaltsverzeichnis ist klickbar<\/li>/gu, ''],
  [/<b>Kein Lizenzmodell<\/b>, keine/gu, '<b>Keine</b>'],
  // R52: Nachweise nimmt die Bauherren-PL entgegen, gepflegt werden sie vom PMO mit den Fachrollen (k6.4.2-t1)
  [/(<td>Nachweise\/(?:<wbr>)?Abnahmen<\/td><td>Externe<\/td><td>)Bauherren-PL(<\/td>)/gu, '$1Bauherren-PL; Pflege durch das PMO$2'],
  // R54: im Fließtext der Freigabeprozess (das Glossar-Stichwort „Approval-Workflow“ bleibt)
  [/<li><b>Approval-Workflow<\/b> mit 6 signierten Stufen/gu, '<li><b>Freigabeprozess</b> mit 6 signierten Stufen'],
  // R50: nicht MVG orientiert sich an Frameworks, sondern die Konventionen der Anwendung (O-17)
  [/MVG ist ein eigenständiger, schlanker Governance-Ansatz\. Er <b>orientiert<\/b> sich konzeptionell an etablierten Methoden/gu, 'Die Konventionen der Anwendung <b>orientieren</b> sich an etablierten Methoden'],
  // R49: Beschlüsse werden als Maßnahmen nachverfolgt (k6.4.3-p2), Probleme im Problemregister
  [/werden zu <span>Aktionen<\/span> mit Frist/gu, 'werden zu <span>Maßnahmen</span> mit Frist'],
  [/Überfällige <span>Aktionen<\/span> &amp; neue <span>Problemregister<\/span>/gu, 'Überfällige <span>Maßnahmen</span> &amp; neue <span>Probleme</span>'],
  [/hat eine <b>Verantwortliche Rolle<\/b>/gu, 'hat eine <b>verantwortliche Rolle</b>'],
  // O-1: Angebotsaussage über BM (im Quelltext mit Hervorhebung, daher auf dem HTML)
  [/\s*Für Beratungskunden (?:<b>)?kostenfrei(?:<\/b>)?: kein separates Lizenzentgelt, unbegrenzte Nutzungsrechte auch nach Mandatsende\./gu, ''],
  [/(LPH (\d)\b(?:[^()<]|<[^>]*>){0,80}?)\s*\(LPH \2\)/gu, '$1'],
  [/\bLPH (\d)-(?=[A-ZÄÖÜ])/gu, 'LPH-$1-'],
  // R55: Feldname im Entscheidungsregister wie die übrigen Stellen der Hilfe (letztverantwortliche Rolle, k4.2-p1)
  [/<b>Accountable:<\/b> wer trägt die Letztverantwortung/gu, '<b>Letztverantwortlich (A):</b> wer trägt die Letztverantwortung'],
  // R55: Rhythmus nach k6.4.5-t1 – Freigaben je Freigabe, Änderungsgremium monatlich und anlassbezogen
  [/<tr><td><b>Quartalsweise \/ je Freigabe<\/b><\/td>/gu, '<tr><td><b>Monatlich, zzgl. Sondersitzungen</b></td><td>Bauherren-PL, Änderungsgremium</td><td>Änderungen bewerten und nach Mandat entscheiden</td></tr><tr><td><b>Je Freigabe</b></td>'],
  // R56: Rhythmus vollständig nach k6.4.5-t1 – wöchentliche Risikosichtung, monatliche formale Risikoprüfung der Projektsteuerung
  [/(<tr><td><b>Wöchentlich<\/b><\/td><td>Bauherren-PL, Projektsteuerung, verantwortliche Rolle<\/td><td>)<span>Risiken<\/span> \/ /gu, '$1Risikosichtung, '],
  [/(<tr><td><b>Monatlich, zzgl\. Sondersitzungen<\/b>)/gu, '<tr><td><b>Monatlich</b></td><td>Projektsteuerung</td><td>Formale Risikoprüfung und Bericht → <span>Managementbericht</span></td></tr>$1'],
  // R56: Rechte-Kennungen als Feldnamen (L-69); Entscheidungen und Änderungen sind keine Freigaben
  [/<li>approveDecision\/(?:<wbr>)?approveGate\/(?:<wbr>)?approveChange – Freigaben<\/li>/gu, '<li><code>approveDecision</code>/<wbr><code>approveGate</code>/<wbr><code>approveChange</code> – Entscheidungen, Freigaben und Änderungen bestätigen (nach Mandat)</li>'],
  // R59: Schritte „Nummer + Überschrift“ mit Klassen, damit der Druck die Nummer beim Schritt hält
  [/<div><div>(\d)<\/div><div><h3>/gu, '<div class="h-schritt"><div class="h-schritt-nr">$1</div><div><h3>'],
  // R60: Registerpflege nach MVG Kap. 6.4.2 – die Bauherren-PL steuert, Risikoregister pflegt die Projektsteuerung
  [/<b>Projektleitung:<\/b> steuert operativ, moderiert den Jour fixe, hält Risiken\/(?:<wbr>)?Entscheidungen\/(?:<wbr>)?Changes aktuell und bereitet/gu, '<b>Bauherren-PL:</b> steuert operativ, moderiert den Jour fixe, hält Entscheidungen und Changes aktuell, steuert die Risikobehandlung (Risikoregister: Projektsteuerung) und bereitet'],
  // R60: deutsche Wörter im Fließtext (L-69), Kennungen in code bleiben
  [/<b>Residual:<\/b> verbleibendes Risiko/gu, '<b>Restrisiko:</b> verbleibendes Risiko'],
  [/einen protokollierten Override/gu, 'eine protokollierte Ausnahme'],
  [/oder protokollierten Override;/gu, 'oder eine protokollierte Ausnahme;'],
  [/<li>Inline-Edit für /gu, '<li>Direktbearbeitung für '],
  [/Benachrichtigung \(Toast\)/gu, 'Benachrichtigung (Kurzmeldung)'],
  [/ein altes, niedrig-prioritäres Item/gu, 'ein alter, niedrig priorisierter Eintrag'],
  [/<li>Seed-Risiken \(wenn definiert\)/gu, '<li>Vorbelegte Risiken (wenn definiert)'],
  [/Auflagen-Tracker:/gu, 'Auflagen-Übersicht:'],
  [/Lösung\/(?:<wbr>)?Workaround/gu, 'Lösung/<wbr>Behelfslösung'],
  [/ein tragfähiger Workaround\./gu, 'eine tragfähige Behelfslösung.'],
  [/Workaround Zusatzpumpe/gu, 'Behelfslösung Zusatzpumpe'],
  [/>Forecast-Update</gu, '>Prognose-Aktualisierung<'],
  // R60: der Governance-Kalender wird laufend geführt, gepflegt monatlich (Register-Pflege derselben Seite)
  [/<td>PMO · wöchentlich<\/td>/gu, '<td>PMO · wöchentlich bis monatlich</td>'],
  // R60: Zahl und Einheit nicht am Zeilenende trennen (außerhalb von Tags)
  [/(\d) (?=(?:TEUR|EUR|€|Mio\.|Wochen|Tage|Monate)(?![\p{L}]))/gu, '$1\u00a0'],
  [/Mio\. €/gu, 'Mio.\u00a0€'],
  // R61: Ein Risiko trägt nach MVG eine Frist (k4.4) – der Gegensatz zur Frühwarnung entfällt
  [/<li>Hat Frist und Eskalationsdatum – Risiko hat keine Frist<\/li>/gu, '<li>Hat Frist und Eskalationsdatum</li>'],
  [/Checkliste mit Pflicht-Items/gu, 'Checkliste mit Pflichtpunkten'],
  [/gebundene Kosten und aktualisierter Restkostenprognose/gu, 'gebundenen Kosten und aktualisierter Restkostenprognose'],
  [/und Optionen-Punktwerte \(1-5\)/gu, 'und Optionen-Punktwerten (1-5)'],
  [/„\+3 Risiken seit letztem Stand\)/gu, '„+3 Risiken seit letztem Stand“)'],
  // R59: Glossar „Bauherren-Führungsmodell“ und „Nachweiskette“ im Wortlaut von k13-t1
  [/<td><b>Bauherren-Führungsmodell<\/b><\/td><td>[^<]*Risiko\/(?:<wbr>)?Change\/(?:<wbr>)?Maßnahme, CTC\/(?:<wbr>)?KPI, [^<]*<\/td>/gu, '<td><b>Bauherren-Führungsmodell</b></td><td>Das Zusammenspiel aus Zielsystem, Rollen und Mandaten, Freigaben, Entscheidungs-IDs, Datenstands- und Nachweislogik, Risiko-/Änderungs-/Maßnahmenverknüpfung, Restkostenprognose (CTC), Leistungskennzahlen (KPI), Eskalation, Betriebshandbuch und Befähigung zu einer durchgängigen Steuerungsarchitektur – das Führungsmodell, mit dem ein Bauherr ein komplexes Vorhaben steuerbar hält.</td>'],
  [/<td><b>Nachweiskette<\/b><\/td><td>Chronologische, fortlaufende Historie aller Änderungen mit Zeitstempel und Rolle\.<\/td>/gu, '<td><b>Nachweiskette</b></td><td>Nachvollziehbare Kette von Entscheidungsgrundlagen, Annahmen, Freigaben, Beschlüssen und Nachverfolgung (in der Anwendung zusätzlich die fortlaufende Historie aller Änderungen mit Zeitstempel und Rolle).</td>'],
  // R59/R62: ein Risiko trägt eine verantwortliche Rolle und eine Frist (k4.4-p2)
  [/Stolperstein: Risiken ohne Eigentümer\/(?:<wbr>)?Frist verpuffen - jedes Top-Risiko braucht beides\./gu, 'Stolperstein: Risiken ohne verantwortliche Rolle und Frist verpuffen – jedes Top-Risiko braucht beides.'],
  // R62: welche Projektleitung gemeint ist – die Bauherren-PL (k4.2-p3, k6.4.5-p1); Freigabe erteilt der Bauherr (k9.3-p3); PMO-Register (k6.4.2-t1, k6.4.5-t1)
  [/Bei Trend-Drift: Eskalation an Projektleitung/gu, 'Bei Trend-Drift: Eskalation an die Bauherren-PL'],
  [/<b>Hoch:<\/b> innerhalb 7[ \u00a0]Tage handeln/gu, '<b>Hoch:</b> innerhalb von 7\u00a0Tagen handeln'],
  [/<b>Mittel:<\/b> innerhalb 30[ \u00a0]Tage</gu, '<b>Mittel:</b> innerhalb von 30\u00a0Tagen<'],
  [/ · Freigabebeschluss \(Freigeben\//gu, ' · Freigabeentscheidung des Bauherrn (Freigeben/'],
  [/<b>PMO:<\/b> hütet Methodik und Datenqualität, pflegt Kalender\/(?:<wbr>)?Managementberichte, hält überfällige Punkte nach\./gu, '<b>PMO:</b> hütet Methodik und Datenqualität, pflegt Maßnahmen- und Problemregister, Governance-Kalender und Protokolle, wirkt am Managementbericht mit und hält überfällige Punkte nach.'],
  [/verantwortliche Rolle und PL entscheiden/gu, 'verantwortliche Rolle und Bauherren-PL entscheiden'],
  [/eskaliert es an die PL\./gu, 'eskaliert es an die Bauherren-PL.'],
  [/<td>PL\/(<wbr>)?(verantwortliche Rolle|PMO) ·/gu, '<td>Bauherren-PL/$1$2 ·'],
  [/<td>PL<\/td>/gu, '<td>Bauherren-PL</td>'],
  // R63: Eskalation entlang der Mandatsleiter (k4.2-p3, k6.4.5-p1; k9.3-p3: der Lenkungskreis berät)
  [/Risiken materialisieren sich, ohne dass der Lenkungskreis es weiß\./gu, 'Risiken materialisieren sich, ohne dass die nächste Stufe der Mandatsleiter davon erfährt.'],
  // R63: Optionen gehen an die Stelle, die nach Mandat entscheidet – der Lenkungskreis berät (k4.2-p3, k9.3-p3); die Freigabe ist
  // kein Meilenstein, sondern die Entscheidung des Bauherrn am Abschluss der Leistungsphase (k6.4.4-t1, k9.3-p2)
  [/Optionen ohne ehrliche Nachteile - der Lenkungskreis braucht die ganze Wahrheit\./gu, 'Optionen ohne ehrliche Nachteile – wer nach Mandat entscheidet, braucht die ganze Wahrheit.'],
  [/kein Vorfall-Register — der <b>Beschluss-Meilenstein<\/b>/gu, 'kein Vorfall-Register — die <b>Entscheidung des Bauherrn</b> am Abschluss der Leistungsphase'],
  // R59: Entscheidungsvorlage = Nachweislogik einer wesentlichen Entscheidung (k13-t1)
  [/ausgearbeitete Akte zu <b>einer<\/b> wesentlichen Entscheidung/gu, 'ausgearbeitete Nachweislogik zu <b>einer</b> wesentlichen Entscheidung'],
  // R59: Feldnamen deutsch (L-69)
  [/Pflichtfelder fehlen:<\/b> Title, verantwortliche Rolle, dueDate etc\./gu, 'Pflichtfelder fehlen:</b> Titel, verantwortliche Rolle, Fälligkeit usw.'],
  // R58: CTC statt FTC in den Methoden (Glossar: CTC = Restkostenprognose)
  [/<li><b>FTC – Forecast to Complete:<\/b> verbleibende Restkosten/gu, '<li><b>CTC – Restkostenprognose:</b> verbleibende Restkosten'],
  [/<li><b>EAC – Estimate at Completion:<\/b> Ist-Kosten \+ FTC</gu, '<li><b>EAC – Estimate at Completion:</b> Ist-Kosten + CTC<'],
  // R57: alle Rechte-Kennungen der Liste als Feldnamen (L-69)
  [/<li>(createXxx|deleteXxx|editXxx|clearAudit) – /gu, '<li><code>$1</code> – '],
  [/<li>importJson \/ exportJson – /gu, '<li><code>importJson</code> / <code>exportJson</code> – '],
  // R57: Fortführung oder Stopp ist eine wesentliche Entscheidung, kein Sonderformat (k4.3-p1, k13-t1)
  [/Neufestlegung der Projektbasis \/ Fortführen\/(?:<wbr>)?Stoppen als Sonderformat außerhalb der Freigabereihe beschließen/gu, 'Neufestlegung der Projektbasis als Sonderformat außerhalb der Freigabereihe sowie Fortführung oder Stopp als wesentliche Entscheidung beschließen'],
  // R64: die Mandatsleiter kennt nur Beträge (k4.2-p3) – kein zweites Kriterium „strategisch“ (k6.4.5-p1 nennt keins)
  [/&gt; 5[ \u00a0]Mio\.[ \u00a0]€ oder strategisch: Beschlussfassung/gu, 'über 5\u00a0Mio.\u00a0€: Beschlussfassung'],
  [/Gremium für Changes über 5[ \u00a0]Mio\.[ \u00a0]€ oder mit strategischer Wirkung/gu, 'Gremium für Changes über 5\u00a0Mio.\u00a0€'],
  // R64: das Glossar hat nach dem Streichen der doppelten Zeile 129 Begriffe (der Verweis ist zuvor gesetzt, VERWEISE)
  [/Vollständiges Glossar mit 130 Begriffen/gu, 'Vollständiges Glossar mit 129 Begriffen'],
  // R55: „Glossar A-Z“ nach den Angleichungen wieder alphabetisch (Intl.Collator de)
  [/(aria-label="Tabelle: Glossar A-Z"><table>\s*<thead>[\s\S]*?<\/thead>\s*<tbody>)([\s\S]*?)(<\/tbody>)/gu, (_, vor, zeilen, nach) => {
    const liste = zeilen.match(/<tr>[\s\S]*?<\/tr>/gu) ?? [];
    const wort = (/** @type {string} */ z) => (z.match(/<td>(?:<b>)?([^<]*)/u)?.[1] ?? '').trim();
    const ordnung = new Intl.Collator('de');
    // R64: gleichlautende Zeilen nur einmal („Nachweis-Belege“ stand zweimal in der Quelle)
    return vor + [...new Set(liste)].sort((x, y) => ordnung.compare(wort(x), wort(y))).join('') + nach;
  }],
]);

function glaette(/** @type {string} */ html) {
  let t = html;
  for (const [muster, statt] of GLAETTUNGEN) t = typeof statt === 'string' ? t.replace(muster, statt) : t.replace(muster, statt);
  return t;
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
    // R50: nur echte Kennungen (Großbuchstaben, Ziffern, <…>) – „MVG-Neuinitialisierung“, „PMO-Stakeholder“ bleiben prüfbar
    .replace(/\b[A-Z]{2,}-(?:<[^>]*>|[A-Z0-9]+)(?:[-.]+(?:<[^>]*>|[A-Z0-9]+))*(?![\p{L}\p{N}])/gu, '·')
    .replace(/\bGATE\b/gu, '·')
    // nur Datenfelder mit Zählangabe „(readouts · 30 Einträge)“; ein bloßes „(scope)“ bleibt prüfbar (R49)
    .replace(/\([a-z][A-Za-z]+\s·\s[^)]*\)/gu, '(·)');
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
