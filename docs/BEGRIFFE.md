# Begriffe

Maßgeblich ist der Text des Whitepapers V1.2 (O-15), danach die Companion-Terminologie (`quellen/companion/KONZEPT-2026k-Terminologie.md`) nur dort, wo das Whitepaper schweigt. Die Grafiken des Whitepapers sind **keine** Quelle für Begriffe (O-14).

## Kernbegriffe (so und nicht anders)
| Begriff | Bedeutung / Verwendung | Quelle |
|---|---|---|
| Minimum Viable Governance (MVG) | kleinster funktionsfähiger Governance-Standard | Glossar |
| Bauherr, Bauherrenorganisation | wie Glossar | Glossar |
| Nichtdelegierbare Bauherrenverantwortung | Ziel, Mandat, wesentliche Entscheidung, Risikoannahme, Freigabe, Datenstand und Nachweis | Kap. 3.1 |
| Arbeitsebene · Mandatsebene · Letztverantwortung | Verantwortungspyramide | Kap. 3.3 |
| Sechs Verantwortungsfelder | Ziel · Mandat · Wesentliche Entscheidung · Risikoannahme · Freigabe · Datenstand und Nachweis | Kap. 4 |
| Acht MVG-Bausteine | Zielsystem und Abwägungsregeln · Rollen und Mandate · Freigabelogik · System der Entscheidungs-IDs · Datenstands- und Nachweislogik · Risiko-/Änderungs-/Maßnahmenverknüpfung · Betriebshandbuch · Befähigung | Kap. 5.2 |
| Freigabe | Entscheidung des Bauherrn am Abschluss einer Leistungsphase **LPH 0–9**; der Bauherr erteilt jede Freigabe selbst auf Vorlage der Bauherren-PL; der Lenkungskreis berät und bereitet vor | Kap. 9.3, Glossar |
| Freigabe-Ergebnis | Freigabe / keine Freigabe / Freigabe mit Auflagen | Kap. 6.4.4 |
| Freigabe-Status | offen → in Vorbereitung → abgeschlossen | Kap. 6.4.4 |
| Entscheidungsvorlage | Nachweislogik einer wesentlichen Entscheidung (Checkliste Kap. 9.4) | Kap. 9.4 |
| Freigabeprozess der Entscheidungsvorlage | offen → in Prüfung → vorbereitet → freigegeben → beschlossen \| abgelehnt (jede Stufe signiert) | Kap. 9.4 |
| Entscheidungs-Status | Offen · In Bearbeitung · Entscheidungsreif · Entschieden · Verworfen | Kap. 6.4.4 |
| Risiko-Status | aktiv · beobachtet · gemindert · geschlossen | Kap. 6.4.4 |
| Änderungs-Status | Beantragt · In Prüfung · Beschlossen · Abgelehnt · Umgesetzt | Kap. 6.4.4 |
| Kanonischer Governance-Fluss | Frühwarnung (unbewertetes Signal) → bestätigt → Risiko → Entscheidung → Freigabe → Maßnahme → Managementbericht | Kap. 6.4.3 |
| Frühwarnung | unbewertetes Signal; CTC- oder Schwellenwertverletzungen erzeugen **neue** Frühwarnungen | Kap. 6.4.3, Glossar |
| Mandatsleiter (Muster) | Bauherren-PL bis einschließlich 100 TEUR · Änderungsgremium über 100 TEUR bis einschließlich 5 Mio. € · darüber Beschlussfassung durch den Bauherrn im Lenkungskreis | Kap. 4.2 |
| Änderungsgremium | monatlich, zzgl. anlassbezogener Sondersitzungen | Kap. 6.4.2 |
| Managementbericht | aggregierter Gremienbericht | Kap. 6.4 |
| Neufestlegung der Projektbasis | Sonderformat außerhalb der regulären Freigabereihe, im Lenkungskreis beschlossen | Glossar |
| MVG-Neuinitialisierung | Sonderformat für laufende Projekte mit eingeschränkter Steuerbarkeit; keine Freigabe | Kap. 7.5, 11 |
| MVG-Reifegradanalyse | 10 Domänen, 49 Fragen, 0–100; < 55 kritisch, 55–79 mit Lücken, ≥ 80 steuerbar (nur als Methode erwähnen, O-8) | Kap. 7.1 |
| 30/60/90-Tage-Logik | Orientierungsrahmen nach Reifegradanalyse und bei Neuinitialisierung, **kein** allgemeiner Einführungsrhythmus | Kap. 8.2 |
| Rollen (Standardmodell) | 13 Arbeitsrollen + Sonderrolle BM-Mentor (Kap. 9.2); in der Story „Bauherren-PL“ für Bauherren-Projektleitung | Kap. 9.2 |
| ID-Kürzel in der Story | ENT- (Entscheidung), RIS- (Risiko), FRW- (Frühwarnung), AEN- (Änderung), MAS- (Maßnahme), NAC- (Nachweis); Form in der Story kurz: `ENT-017` | Companion §3 (Whitepaper schweigt) |

## Verbotene Begriffe (geprüft von `npm run begriffe`, Liste in `werkzeuge/begriffe.json`)
| Nicht | Sondern |
|---|---|
| Gate, Gates, G0–G5, G0 … G9 | Freigabe, LPH 0–9, „Freigabe LPH 3“ |
| Go / No-Go / Go with Conditions | Freigabe / keine Freigabe / Freigabe mit Auflagen |
| Decision File, Entscheidungsakte | Entscheidungsvorlage |
| Change-Board | Änderungsgremium |
| Operating Model | Betriebshandbuch, Regelbetrieb |
| Readout | Resümee (Ende der Story) bzw. Managementbericht |
| Scope | Projektumfang |
| Evidence | Nachweis |
| Readiness | Entscheidungsreife, Reifegrad |
| Reset, Governance-Reset | MVG-Neuinitialisierung |
| Long Lead | Komponente mit langer Lieferzeit |
| Impact, Impact-Bewertung | Auswirkung, Auswirkungsbewertung |
| Risk | Risiko |
| Mitigation | Risikominderung |
| Contingency | Risikoreserve |
| Heatmap | Bewertungsmatrix bzw. Risikomatrix |
| Stakeholder | Beteiligte |
| MVG Design | MVG-Konzeption |
| gerichtsfest | organisationsfest, nachweisfähig |
| Minimal Viable Governance | Minimum Viable Governance |

Ausnahmen: der Begriffs-Kompass (E7) und die Korrekturliste V1.3 (E13) nennen alte Begriffe absichtlich. Sie stehen in eigenen Dateien, die in `werkzeuge/begriffe.json` als Ausnahme geführt werden. Eine Zeile darf außerdem mit `<!-- begriffe-erlaubt: Grund -->` markiert werden; jede solche Markierung braucht einen Grund.

## Schreibweisen
Bauherren-PL · Leistungsphase (LPH 0 … LPH 9) · Entscheidungs-ID · Datenstand · Mio. € · TEUR · ESG/LCC · CTC (Restkostenprognose) · „Minimum Viable Governance“ ausgeschrieben beim ersten Vorkommen je Fläche.
