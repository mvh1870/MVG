# Planblatt

Regeln: Oben steht der **offene Teil**. Nimm den obersten Posten `[ ]`, der keine Owner-Antwort braucht. `[~]` = in Arbeit (mit Datum), `[x]` = erledigt (mit Commit-Kurzhash). Ein Posten darf geteilt werden (P3.2a, P3.2b …), wenn er nicht in einen Block passt; neue Posten nur mit Begründung in `ENTSCHEIDE.md`. Ein Posten ist erst erledigt, wenn seine **Abnahme** erfüllt ist und `npm run pruefe` grün ist. Phasenabschluss-Posten („Prüf-Agenten …“) sind Pflicht, nicht optional.
Grundlagen: `docs/BAUPLAN.md` (freigegeben) · `ENTSCHEIDE.md` · `docs/ARCHITEKTUR.md` · `docs/INHALTSFORMAT.md` · `docs/STIL.md` · `docs/BEGRIFFE.md` · `docs/PRUEFAGENTEN.md`.

## Offen

### P0 · Einrichtung (lokal, mit dem Owner)
- [x] P0.1 · Repo, Quellen, Regelwerk (CLAUDE.md, PLAN.md, ENTSCHEIDE.md, UEBERGABE.md, OWNER-FRAGEN.md, docs/) — Abnahme: Dateien vorhanden, erster Commit.
- [x] P0.2 · Whitepaper-Quelle strukturiert: `quellen/whitepaper/v1.2/whitepaper.json` + `.md` mit stabilen Absatz-IDs, Tabellen, Abbildungspositionen; Import-Werkzeug (auch für V1.3) — Abnahme: alle 13 Kapitel, jede Tabelle, jede Abbildung; Tests grün.
- [x] P0.3 · Marke & Stil: Logo als SVG (aus Original-PNG vektorisiert), Schriften eingebettet, Tokens (`src/stil/`), `docs/STIL.md` aus Variante B inkl. L-4 — Abnahme: Stil-Referenzseite im Bau, Kontrast ≥ 4,5:1.
- [x] P0.4 · Bau & Prüfkette: `npm run bau` (Einzeldatei `dist/mvg.html`, CSP, deterministisch), `npm run pruefe` (Typen, Tests, Inhalte, Begriffe, Bau ×2, Größe, Oberfläche) — Abnahme: Kette grün lokal; Oberfläche findet einen Browser oder meldet sauber „übersprungen“.
- [x] P0.5 · Engine + Inhaltsformat + Regie-Kanal (`src/engine/`, `werkzeuge/inhalte.mjs`, `docs/INHALTSFORMAT.md`, `src/regie/kanal.ts`) — Abnahme: Reducer-, Parser-, Kanal-Tests grün.
- [x] P0.6 · Durchstich: Startseite (2 Wege), Story Prolog-Minimum → A3 → (Schieberegler) → B3 für Rolle Bauherren-PL, Theorie-Probe (Kap. 1 + Kapitelliste), Regie/Leinwand-Sync — Abnahme: Klickpfad im Browser ohne Konsolenfehler bei 1280×720, 1024×768, 400 px; Leinwand zeigt nie Regie-Notizen.
- [x] P0.7 · Prüf-Agenten P0 (Architektur, Fachtreue A3/B3, Stil) + Korrekturen — Abnahme: keine offenen Befunde.
- [x] P0.8 (1cc13c4) · GitHub-Remote mvh1870/MVG (gepusht 2026-09-27), `cloud/` einrichten (Owner führt CLOUD-EINRICHTEN und ROUTINE-ANLEGEN aus), erster Cloud-Block beobachtet — Abnahme: Ampel des ersten Blocks auf `claude/haus`. **Erster Cloud-Block:** Du bist der Beweis – setze diesen Posten auf `[x]` (mit deinem ersten Commit), trage in die Übergabe ein, was der frische Rechner hatte (Node-Version, ob `npx playwright install chromium` ging, Dauer von `npm ci` und der Kette), und fahre mit P1.1 fort.

### P1 · Drehbuch & Theorie-Gliederung (Cloud)
- [x] P1.1 (793a4f2) · Abdeckungskarte: jeder Whitepaper-Absatz (ID aus P0.2) → Theorie-Seite (+ Story-Station, wo passend) in `inhalte/abdeckung.yaml`; Prüfer im `inhalte`-Werkzeug — Abnahme: 100 % der Absätze zugeordnet.
- [x] P1.2 (e4a3e6c) · Fall-Bibel `inhalte/fall.md`: Stadt, GML, Projekt, Zahlen, Zeitachse Monat 0–12 mit LPH-Stand, Gremien und Takte, alle Figuren mit Stimme — Abnahme: widerspruchsfrei zu O-3, L-5, Whitepaper (Mandatsleiter, Rhythmus, Register).
- [x] P1.3 (a58be26) · Stationsgerüst `docs/DREHBUCH.md`: Prolog, A1–A6, Wendepunkt, Rückspulen, B1–B6, Wirklichkeit, 3 Enden, Epilog – je Ereignis, Kapitelbezug, Statusverlauf A/B, Dauer — Abnahme: Hauptpfad 25–35 Min, Express ~12 Min, alle 13 Kapitel berührt.
- [x] P1.4 (45e5da6) · Entscheidungsgraph: je Station × Rolle Entscheidung, Optionen, Konsequenz (4 Felder), Statuswirkung, Gedächtnis-Bezüge; Enden-Logik — als Inhaltsdateien nach `docs/INHALTSFORMAT.md` (Texte dürfen hier noch Rohfassung sein) — Abnahme: Graph-Prüfer grün (erreichbar, keine Sackgassen, alle Rollen, alle Enden).
- [x] P1.5 (93890fd) · Prüf-Agenten Drehbuch (Fachtreue, Begriffe, Dramaturgie) + Korrekturen — Abnahme: keine offenen Befunde.

### P2 · Engine & Rahmen
- [x] P2.1 (3b59c8a) · Engine vollständig: Graph, Bedingungen, Gedächtnis, Enden, Weiterlesen (E9), Zustands-Version, Station ohne `status-start` übernimmt den Stand ihrer Welt (L-19) — Abnahme: Einheitentests inkl. Mutanten-Probe.
- [x] P2.2 (06b0977) · Leitstand-Rahmen mit schrittweiser Einblendung (L-4): Statusinstrumente, Story-Karte, LPH-Band 0–9, Rollen-Linse, „Standpunkt wechseln“, Seitenleiste — Abnahme: Browser-Tests.
- [x] P2.3 (f961dc5) · Ebenen 1–4, Glossar-Mouseover (Tastatur + Touch), Quellenfenster — Abnahme: jede Ebene erreichbar; Glossar wortgleich aus V1.2.
- [x] P2.4 (f8f9d29, a3f1eaf) · Bereiche Start/Story/Theorie/Explore, Freischaltungen, Permalinks, Tastatur, Barrierefreiheit — Abnahme: axe ohne ernste Befunde.
- [x] P2.5 (cb82295) · Prolog: Rollenwahl (6), Interessenwahl (intelligente Vertiefung), Express-Pfad (E8) — Abnahme: jede Rolle startbar.
- [x] P2.6 (933dbb0) · Prüf-Agenten P2 (Architektur, Stil/Barrierefreiheit, Vollständigkeit) + Korrekturen (L-27, `docs/P2-BEFUNDE.md`) — Abnahme: keine offenen Befunde; `node werkzeuge/mutanten.mjs` 10/10 rot.

### P3 · Welt A
- [x] P3.1 (dec2c58) · Figuren- und Requisiten-Baukasten (SVG): alle Figuren (Rollenfarben, Mimik neutral/besorgt/erleichtert), Mail, Chat, Excel-Stand, Haftnotiz, Protokoll, Aktenstapel — Abnahme: Galerie-Seite im Bau.
- [x] P3.2 (Commit „MVG P3.8“) · Station A1 (alle 6 Rollen)
- [x] P3.3 (Commit „MVG P3.8“) · Station A2 (alle 6 Rollen)
- [x] P3.4 (Commit „MVG P3.8“) · Station A3 (alle 6 Rollen; PL aus dem Durchstich übernehmen)
- [x] P3.5 (Commit „MVG P3.8“) · Station A4 (alle 6 Rollen)
- [x] P3.6 (Commit „MVG P3.8“) · Station A5 (alle 6 Rollen)
- [x] P3.7 (Commit „MVG P3.8“) · Station A6 (alle 6 Rollen)
- [x] P3.8 (Commit „MVG P3.8“, Befunde `docs/P3-BEFUNDE.md`) · Prüf-Agenten Welt A + Korrekturen — Abnahme: keine offenen Befunde; jede Rolle in Browser-Tests bis zum Wendepunkt spielbar (drei Größen, mit axe); je Station Ebene 1–4; LPH-Band auch bei 400 px geprüft (P2-Befund V7/V9).
- [x] P3.9 (Commit „MVG P3.9/P4“) · Vertiefungsangebote je Interesse (O-19 „intelligente Vertiefung“, P2-Befund V1): bedingte Zusatzkarten `wenn: [interesse …]` an den Stationen A1–A6 und B1–B6; Prolog-Satz wieder zusagen — Abnahme: Test „Interesse gewählt → Angebot sichtbar, sonst nicht“.

### P4 · Wendepunkt & Diagramm-Baukasten
- [x] P4.1 (Commit „MVG P3.9/P4“) · Symptom-Radar (8 Symptome, Kap. 2.5) mit den in Welt A erlebten Symptomen
- [x] P4.2 (Commit „MVG P3.9/P4“) · „Was passiert, wenn …?“-Wirkungsketten (mind. 6 Auslöser)
- [x] P4.3 (Commit „MVG P3.9/P4“) · Mandatsschwellen-Spiel: Aufgaben über die Schwelle ziehen (delegierbar / nicht delegierbar, Kap. 3.2)
- [x] P4.4 (Commit „MVG P3.9/P4“) · Verantwortungspyramide (Kap. 3.3), Ebenen klickbar
- [x] P4.5 (Commit „MVG P3.9/P4“) · Sechs Verantwortungsfelder: Chaos → Ordnung (Kap. 4, Tabelle als Karten)
- [x] P4.6 (Commit „MVG P4.6“) · Rückspulen-Sequenz + 8 MVG-Bausteine (Kap. 5), LPH 0 als früher Hebel (5.4)
- [x] P4.7 (6021a35 + Commit „MVG P4.7: Runde 2“, `docs/P4-BEFUNDE.md`) · Prüf-Agenten P4 + Korrekturen

### P5 · Welt B
- [x] P5.1 (Commit „MVG P5.1“, L-34) · MVG-Werkzeug-Bausteine: Mandatsleiter, Governance-Fluss (animiert, Status je Register), Entscheidungsvorlage mit Checkliste (Kap. 9.4), Datenstand-Anzeige, Register-Karten (6.4.4), LPH-0–9-Freigabemodell (9.3), Governance-Kalender/Rhythmus (6.4.5), RACI + Mandat (9.2)
- [x] P5.2 (ce5949d + Commit „MVG P5.3“; Prüfung 13 + 3 Befunde behoben) · Station B1 (alle Rollen) + Schieberegler A↔B + Rückbezüge — je Station B1–B6 auch die vier Vertiefungen je Interesse (L-31)
- [x] P5.3 (Commit „MVG P5.3“; Prüfung 10 + 2 Befunde behoben, L-36) · Station B2
- [x] P5.4 (Commit „MVG P5.4“; Prüfung 3 Befunde behoben) · Station B3 (PL aus dem Durchstich übernehmen)
- [x] P5.5 (Commit „MVG P5.5“; Prüfung 11 Befunde behoben, Runde 2 ohne Befund, L-37) · Station B4 + Gremium-Szene (E3)
- [x] P5.6 (Commit „MVG P5.6“; Prüfung 12 + 1 Befunde behoben, L-38) · Station B5
- [x] P5.7 (Commit „MVG P5.7“; Prüfung 13 + 4 Befunde behoben, L-39/L-40) · Station B6
- [x] P5.8 (Commit „MVG P5.8“, L-41) · Ihre Spur (E1): Entscheidungskette über beide Welten
- [x] P5.9 (Commit „MVG P5.9“ + Reste; `docs/P5-BEFUNDE.md`, L-42–L-44) · Prüf-Agenten Welt B + Korrekturen (Browser: alle Rollen durch B1–B6 in drei Größen mit axe, Express-Pfad, je Station Ebene 1–4; P2-Befund V3/V7/V9)
- [x] P5.10 (Commit „MVG P5.10“, L-45; volle Kette grün 802 s, dist 1,47 MB) · Umzug `entwurf/` → `inhalte/` (L-30, L-45): der ganze Entscheidungsgraph wird das spielbare Produkt `dist/mvg.html`; Durchstich-Abkürzung (Prolog → A3 → Vergleich → B3) entfällt; Tests und Szenarien auf den Hauptweg — Abnahme: `entwurf/` leer (Werkzeug bleibt), volle Kette grün.

### P6 · Theorie-Teil (O-20)
- [x] P6.1 (Commit „MVG P6.1“) · Lernseiten-Rahmen: Kernaussage, Grafik, Karten, Ebenen, Originaltext wortgetreu, Querverweise „In der Story erlebt“, Kapitelnavigation
- [x] P6.2 (Commit „MVG P6.2–P6.6“; Prüfung 32 Befunde + Runde 2) · Kap. 1 Kurzfassung
- [x] P6.3 (Commit „MVG P6.2–P6.6“; Prüfung 32 Befunde + Runde 2) · Kap. 2 Ausgangslage und Kernproblem
- [x] P6.4 (Commit „MVG P6.2–P6.6“; Prüfung 32 Befunde + Runde 2) · Kap. 3 Begriffsrahmen
- [x] P6.5 (Commit „MVG P6.2–P6.6“; Prüfung 32 Befunde + Runde 2) · Kap. 4 Verantwortungsfelder
- [x] P6.6 (Commit „MVG P6.2–P6.6“; Prüfung 32 Befunde + Runde 2) · Kap. 5 MVG als Bauherren-Führungsmodell
- [x] P6.7 (2026-09-27, zwei Prüfrunden, ohne Befund) · Kap. 6 MVG Companion (inkl. 6.4 Zusammenarbeit, Governance-Fluss)
- [x] P6.8 (2026-09-27, zwei Prüfrunden, ohne Befund) · Kap. 7 Leistungsarchitektur
- [x] P6.9 (2026-09-27, zwei Prüfrunden, ohne Befund) · Kap. 8 Implementierung
- [x] P6.10 (2026-09-27, zwei Prüfrunden, ohne Befund) · Kap. 9 Ergebnisbild und Ergebnisse
- [x] P6.11 (2026-09-27, zwei Prüfrunden, Befunde eingearbeitet) · Kap. 10 Anwendungssituationen
- [x] P6.12 (2026-09-27, zwei Prüfrunden, Befunde eingearbeitet) · Kap. 11 MVG-Neuinitialisierung
- [x] P6.13 (2026-09-27, zwei Prüfrunden, Befunde eingearbeitet) · Kap. 12 Was Bauherren gewinnen
- [x] P6.14 (2026-09-27, L-47) · Kap. 13 Glossar (eigene Seite + Mouseover-Quelle)
- [x] P6.15 (2026-09-27, docs/P6-BEFUNDE.md, 21 Befunde erledigt) · Abdeckung 100 %, Zitate wortgleich, Prüf-Agenten je Kapitel + Korrekturen

### P7 · Wirklichkeit & Ende
- [x] P7.1 (2026-09-27, zwei Prüfrunden, 16 + 2 Befunde eingearbeitet) · Zurück in Welt A: MVG-Neuinitialisierung (Kap. 11), 30/60/90 als schiebbare Zeitachse (8.2), Leistungsweg Diagnose → Regelbetrieb (Kap. 7), Mitwirkung/Abnahme (8.3/8.4)
- [x] P7.2 (2026-09-27, geprüft; Epilog-Runde 2 in P7.7) · 3 Enden + Enden-Logik (Hinweis H10; Explore mit dem Ende freischalten und aus der Story verlinken, Test; Express-Umschalter auch in der Story-Karte, E8 – P2-Befund V3/V8)
- [x] P7.3 (2026-09-27, geprüft; Epilog-Runde 2 in P7.7) · Zielbild (Kap. 9, 12), Rückbezug, Nachweiskette zum Anfassen (E2)
- [x] P7.4 (2026-09-27, geprüft; Epilog-Runde 2 in P7.7) · Selbstdiagnose qualitativ (O-8)
- [x] P7.5 (2026-09-27, geprüft; Epilog-Runde 2 in P7.7) · Bauherrentypen (Kap. 10): „Wie sähe das bei Ihnen aus?“
- [x] P7.6 (2026-09-27, geprüft; Epilog-Runde 2 in P7.7) · Persönliches Resümee: Themen, 3 Prinzipien, 2 Vertiefungen, 1 Checkliste; Epilog: A-Spur gegen B-Spur (`spurZeilen`, E1-Rest aus L-41)
- [x] P7.7 (2026-09-27, docs/P7-BEFUNDE.md; pruefe:voll grün) · Prüf-Agenten P7 + Korrekturen

### P8 · Explore
- [x] P8.1 (2026-09-27, Prüfung: 7 Befunde eingearbeitet) · Szenario-Simulator (Kostenabweichung, Terminabweichung, Risiken, Entscheidungsstatus → Risikoeinschätzung, erforderliche Entscheidung, Eskalationsstufe, Informationsbedarf, Freigabeweg, Handlungsmöglichkeiten); Regeln aus Whitepaper, getestet
- [x] P8.2 (2026-09-27) · Vorher/Nachher-Welten (Informationswege, Rollen, Entscheidungen, Eskalationen, Register, Reporting, Gremien)
- [x] P8.3 (2026-09-27) · Governance-Fluss-Sandbox (E5)
- [x] P8.4 (2026-09-27) · Zeitmaschine (E4)
- [x] P8.5 (2026-09-27, L-51) · Grafik-Galerie + Abbildungsverzeichnis, Figurenübersicht, Story-Karte mit Sprung
- [x] P8.6 (2026-09-28, docs/P8-BEFUNDE.md, 30 Befunde erledigt) · Prüf-Agenten P8 + Korrekturen

### P9 · Präsentator (O-9)
- [x] P9.1 (2026-09-28) · Regie/Leinwand vollständig: Kanal mit Rückfall, Lebenszeichen, Ein-Fenster-Regie
- [x] P9.2 (2026-09-28) · Notizen, Leitfragen, Einwand-Karten (E6) je Station und Theorie-Kapitel
- [x] P9.3 (2026-09-28) · Gesprächsprotokoll (lokal) + Druckfassung
- [x] P9.4 (2740e07) · Regie-Eingriffe: springen, Welt/Rolle umschalten; Beamer-Schalter (E10) – „Ereignis einspielen“ und „Szenario-Werte“ gestrichen (L-60), Ereignisse sind die Zeitsprünge und Kundenwahlen der Story
- [x] P9.5 (58705fc) · Zwei-Fenster-Tests + Prüf-Agenten P9 (`docs/P9-BEFUNDE.md`)

### P10 · Whitepaper-Funktionen & Auslieferung
- [x] P10.1 (8acbff0) · Zitierfunktion, Permalinks, Fußnoten/Quellen, Versions- und Änderungsstand, Vermerk „fachlich ungeprüft“ (L-55)
- [x] P10.2 (8acbff0) · Druckansicht je Kapitel und gesamt, Druck-Dossier (E11) (L-56)
- [x] P10.3 (8acbff0) · Re-Import-Werkzeug V1.3: neue DOCX einlesen, Diff je Absatz-ID, betroffene Stellen melden (L-57)
- [x] P10.4 (8acbff0) · Korrekturliste V1.3 (E13): alle Grafik↔Text-Widersprüche mit Bild-Prompts (`docs/KORREKTURLISTE-V1.3.md`) – 8 Text-, 90 Grafik-Einträge, 13 Bild-Prompts
- [x] P10.5 (8acbff0) · Begriffs-Kompass (E7) (L-57)
- [x] P10.6 (8acbff0) · Einbett-Schnittstelle (E12): iframe-sicher, postMessage; dezente Klänge (E14, standardmäßig aus) (L-58)
- [x] P10.8 (8acbff0) · Kundenfassung ohne Regie-Material (L-7): `npm run bau -- --kundenfassung` → `dist/mvg-kunde.html`; Test, dass kein Regie-Text enthalten ist (L-58)
- [x] P10.7 (8acbff0) · Größenbudget < 4 MB, Determinismus, Anleitungen (Selbstlernen, Präsentator), Abnahme-Checkliste für den Owner (`docs/ABNAHME.md`) (L-58)
- [x] P10.9 (868249b) · Prüf-Agenten P10 (`docs/P10-BEFUNDE.md`)

### P11 · Gesamtprüfung
- [x] P11.1 · Vollständigkeitsprüfer: Bauplan, 20 Owner-Punkte, E1–E14, O-Entscheide, Abdeckung (`docs/P11-BEFUNDE.md`)
- [x] P11.2 · Alle Pfade × Rollen × Größen im Browser; Barrierefreiheit (auch Lauf mit `prefers-reduced-motion: reduce`, P2-Befund V6) – `pruefe:voll` grün (927 s), `MVG_BEWEGUNG=reduziert` voll grün (25 Läufe)
- [x] P11.5a · Lesezeit messen (Szenario `lesezeit`, L-61) + Ebenen 2–4 auf Wunsch statt Pflicht-Blättern – PL 51,9 min, Express 30,6 min
- [-] P11.5b · Lange Listen kompakt – verworfen: Lage- und Prüflisten sind Kern der Mechanik; stattdessen in P11.5c redaktionell gekürzt (Listen auf 3–4 Punkte)
- [x] P11.5c · Texte je Station gekürzt: alle Rollen Hauptpfad 34,4–34,6 min, Express 14,7–14,8 min (vorher 51,9 / 24,2); Messung jetzt Pflicht; Fachtreue Teil 1 (18 Befunde) eingearbeitet, Teil 2 folgt; B4-Vorlage AEN-031 wird jetzt gezeigt
- [x] P11.6 · Wissenschecks „Fragen mit Erklärung statt Punkten“ über B3 hinaus: je Lernseite (Kap. 2–12) eine Frage mit Erklärung und Beleg (L-60)
- [x] P11.3 (4402ba6) · Korrekturschleife, bis zwei Runden nichts Neues finden – fünf Runden, R4 und R5 ohne schwere/mittlere Befunde (L-64)
- [x] P11.4 · Abschluss: UEBERGABE mit Abnahmeanleitung; Ampel rot „fertig – Routine anhalten, claude/haus nach main zusammenführen“

### P12 · Owner-Sichtung 2026-09-28 (O-28–O-30)
- [x] P12.1 · „Whitepaper“ überall entfernen, Produktname „MVG interaktiv“ (O-29): Oberfläche, Inhalte, Quellenangaben, Impressum, Druck, Titel, Kundenfassung; Originaltext-Stellen per Ersetzungsliste (L-66); Prüfung in der Kette, dass die sichtbare Seite das Wort nie enthält
- [x] P12.2 · Lernseiten: Originaltext ans Seitenende, immer zugeklappt (O-30)
- [x] P12.3 · Lernseiten neu aufbereiten (O-30): je Kapitel Inhalt erklärt statt zitiert, kleine interaktive Grafiken, ausführlicher; Fachtreue-Prüfung je Kapitelgruppe
- [x] P12.4 · Story aus Bauherrensicht (O-28): Fall-Bibel und Drehbuch auf Bauherrenprobleme umstellen, Stationen A1–A6/B1–B6 neu besetzen, Rollen reagieren auf das Bauherrenproblem; Lesezeit hält O-5
- [x] P12.5 (d930358, L-182) · Prüf-Agenten P12 (alle Rollen) + Korrekturschleife; Übergabe — Abnahme (O-35): zwei Runden ohne schwere Befunde (erfüllt mit R65 und R66); R66 eingearbeitet, offene mittlere Befunde in `docs/ABNAHME-MITTEL.md`

### P13 · Hilfe (O-31)
- [x] P13.1 · Hilfe des MVG Companion übernehmen (`werkzeuge/hilfe.mjs`, L-69): gleiche Aufteilung (11 Teile, 13 Rollen-Anleitungen), Bedienteile der Anwendung entfernt, Begriffe nach MVG, in `inhalte` und `bau` eingebunden — Abnahme: `--pruefe` ohne Funde, deterministisch
- [x] P13.2 · Fläche „Hilfe“ im Lernseiten-Design: Route `#hilfe/<seite>`, Verzeichnis, Suche, Blättern, Vermerk; leise Zugänge (Start, Theorie, Explore) — Abnahme: Einheitentests, Browser-Szenario `hilfe` (alle 24 Seiten, drei Größen, axe, kein Seitwärtsscrollen)
- [x] P13.3 · Prüf-Agenten Hilfe (Begriffe, Stil/Barrierefreiheit): 17 Runden, Runden 16 und 17 ohne schwere/mittlere Befunde (L-69 (7)–(24), `docs/KORREKTURLISTE-COMPANION.md`)

### P14 · Abbildungen im Fachtext (O-32)
- [x] P14.1 (3848a7d; geprüft bis R66, O-35) · Bildwerkzeug `werkzeuge/abbildungen.mjs` (L-77): 13 Inhaltsabbildungen aus der DOCX (abb-2 … abb-14) als WebP, Beschriftungen mit verbotenen Begriffen (docs/BEGRIFFE.md, O-14) durch die Begriffe des Texts überdeckt, deterministisch; Beschreibung je Abbildung in `inhalte/abbildungen/abb-N.yaml` — Abnahme: zweimal ausgeführt byte-gleich, `inhalte --pruefe` erkennt veraltete Bilder, jede überdeckte Stelle im Bild geprüft
- [x] P14.2 (geprüft bis R66, O-35) · Abbildungen an ihren Stellen: im zugeklappten Originaltext an der Stelle der DOCX, auf der Lernseite beim passenden Abschnitt (`::: abbildung`), vergrößerbar, mit Bildunterschrift „wo die Abbildung vom Text abweicht, gilt der Text“; Abbildungsverzeichnis in Explore zeigt sie — Abnahme: Einheitentests, Browser-Szenario (drei Größen, axe, Dialog), `dist/mvg.html` < 4 MB
- [x] P14.3 (R65/R66 ohne schweren Befund, d930358) · Prüf-Agenten Abbildungen (Fachtreue/Begriffe je Bild, Stil/Barrierefreiheit) + Korrekturen — Abnahme: zwei Runden ohne schwere Befunde, offene mittlere in `docs/ABNAHME-MITTEL.md` (O-35, ersetzt L-64)

### P15 · Name „Governance Kompass“ (O-33)
- [x] P15.1 (Commit „MVG P15.1“, L-146) · Benennung „Governance Kompass“ überall (Dokumenttitel, Startseite, Kopfleisten, Füße, Druckbögen, Regie, Leinwand, Hülle, Anleitungen), Adresse www.GovernanceKompass.de in Fuß, Impressum und Druckkopf; Bildmarke und Bezeichnung „Bauherr Mentoren“ bleiben; Dateinamen (`dist/mvg.html`) bleiben (Bauregel) — Abnahme: Einheitentests und Szenarien prüfen Name, Absender, Adresse und Logo auf jeder Fläche; Kette grün.
- [x] P15.2 (R65/R66 ohne schweren Befund, d930358) · Prüf-Agenten P15 (Begriffe, Stil, Druck) in der nächsten Prüfrunde von P12.5 — Abnahme: wie P12.5 (O-35).

### P16 · Neuausrichtung: Internetseite, Standard V2.4, Story nur in der neuen Arbeitsweise (O-36 bis O-49, Owner 2026-10-02)
Grundlage: `ENTSCHEIDE.md` O-36 bis O-49, Quellen `quellen/v2.4/`. Jeder Posten endet mit grüner Kette; Inhaltsposten mit Prüf-Agenten Fachtreue + Begriffe (O-24 bleibt, der Vermerk entfällt). Was rausfliegt, wird gelöscht, nicht versteckt (O-41).
- [x] P16.1 (L-195) · Abgleich und Regeln: `docs/V24-ABGLEICH.md` (jede Stelle in Theorie, Story, Glossar, Explore, die V2.4 anders regelt: wer pflegt welche Register, Entscheidungsvorlage mit ≥ 2 Optionen und MCDA, 5×5-Matrix, Takt wöchentlich/monatlich, Ein-Seiten-Bericht, Bauherr pflegt nichts) – Liste nur für die Arbeit, keine Owner-Frage (O-36); `docs/BEGRIFFE.md` und `werkzeuge/begriffe.json` um sichtbar verbotene Wörter ergänzen („Whitepaper“, „Kapitel“, „Kap.“, „V1.2“, Absatz-ID-Muster, „fachlich ungeprüft“, „Datei“, „Einzeldatei“, „HTML“, „App“, „Programm“, „Kundenfassung“; Ausnahmen begründet); Kettenprüfung auf dem sichtbaren Text der gebauten Seite — Abnahme: Prüfung in der Kette, heute rot gemessen (Liste der Funde in der Übergabe).
- [x] P16.2 (L-183) · Vermerk „fachlich ungeprüft“ überall entfernen (Kopf, Fuß, Druckbögen, Regie, Leinwand, Hilfe, Dokumente), zugehörige Tests und Proben umbauen (O-39) — Abnahme: Kette grün, Text kommt in `dist/` nicht mehr vor.
- [x] P16.3 (L-190, L-192) · Whitepaper-Bezüge raus (O-38): Originaltext-Bereich, Zitierfunktion, Absatz-IDs, Quellfenster/Belege mit Absatz-ID, „Kap. N“, „Kapitel“, „MVG V1.2“ aus allen Flächen (Theorie, Story-Ebenen, Glossar, Explore, Druck, Impressum, Regie); Theorie-Teile als Themen benannt (keine Nummern), Routen `#theorie/<thema>`; die 13 Abbildungen bleiben ohne Whitepaper-Bezug; interne Nachprüfung (Absatz-IDs in den Quelldateien, Abdeckung) bleibt im Werkzeug — Abnahme: Begriffsprüfung aus P16.1 für diese Wörter grün, Theorie-Szenario grün.
- [x] P16.4 (L-192, L-200) · Theorie an V2.4 angleichen: jede Stelle aus `docs/V24-ABGLEICH.md` umgeschrieben (Inhalte bleiben sonst wie sie sind, Owner-Notiz in O-38); drei neue Themen: „Die Entscheidungsvorlage: zwei Optionen und MCDA“ (mit interaktivem Gewichte-Regler, Beispiel Ersatzgerät 41 : 35 und Gleichstand bei Gewicht 3), „Vorgangsarten und Risikobewertung“ (Aufgabe, Maßnahme, Frühwarnung, Risiko, Problem, Änderung; 5×5-Matrix, Prioritäten), „Takt und Monatsbericht“ (wöchentliche Prüfung, Sofortmeldung, Monatstermin bis 60 Min., Bericht eine Seite); Ende jeder Theorie-Seite mit Link zu bauherr-mentoren.com (O-44) — Abnahme: Prüf-Agenten Fachtreue (gegen V1.2 + V2.4) und Begriffe ohne offene schwere Befunde.
- [x] P16.5 (L-200, L-202–L-204) · Story-Drehbuch neu (O-40): `inhalte/fall.md` erweitert (Projektsteuerung mit Gesicht, Register, Monatstermin, Bericht), `docs/DREHBUCH.md` neu – etwa 8 Stationen über die Leistungsphasen, je Station ein Bauherrenproblem, die Vorlage der Projektsteuerung (≥ 2 zulässige Optionen, MCDA-Kriterien und Gewichte), Statuswirkung, Kästchen „So läuft es oft“ + „Typischer Einwand und Antwort“, Kurzfassung (≈ 10 Min.) und Hauptweg (≈ 25 Min.), ein Ende; Prüf-Agenten Fachtreue + Dramaturgie — Abnahme: Drehbuch ohne offene schwere Befunde.
- [x] P16.6 (L-184, L-185, L-187, L-191) · Story-Rahmen neu: Engine und Oberfläche ohne Welt A, Wendepunkt, Rückspulen, Vergleich, Rollenwahl, „Standpunkt wechseln“, Rückbezüge und mehrere Enden; neue Navigation als ein Fluss („Weiter“, schlanke Fortschrittslinie, Vertiefung aufklappbar, keine Leiste „Einstieg · Lagebild · Tiefer gehen“); Entscheidungsstation mit Optionen und verschiebbaren MCDA-Gewichten; kleine Statusanzeige (Kosten, Termin, offene Entscheidungen); Kurzfassung; neues Design im Stil der Seite — Abnahme: Einheitentests, Browser-Szenario (1280×720, 1024×768, 400 und 320 px), axe ohne ernste Befunde, Tastatur.
- [x] P16.7a (L-200, L-202) · Story-Inhalte Stationen 1–4 nach Drehbuch (Texte, Vorlagen, MCDA-Daten, Kästchen) mit Prüf-Agenten Fachtreue + Begriffe.
- [x] P16.7b (L-203, L-204; Lesezeit Hauptweg ≈ 20 Min. Lesen + Entscheiden, Kurzfassung ≈ 10 Min.) · Story-Inhalte Stationen 5–8, Ende, Kurzfassung; Lesezeit gemessen (Hauptweg ≈ 25 Min., Kurzfassung ≈ 10 Min.); Ende mit Link zu bauherr-mentoren.com (O-44).
- [x] P16.8 (L-188, L-192) · Explore neu (O-46): MCDA-Rechner, Risikomatrix 5×5, Vorgangsarten und Wege, Takt; Glossar an V2.4 angepasst; Mandatsleiter-Simulator, Selbstdiagnose und Companion-Hilfe (Bereich „Hilfe“, `werkzeuge/hilfe.mjs`, Quellen, Tests) gelöscht — Abnahme: Einheitentests, Browser-Szenario, axe.
- [x] P16.9 (L-189) · Regie und Leinwand an die neue Story angepasst (Sprung je Station, Notizen und Einwände je Station, MCDA-Gewichte auf der Leinwand sichtbar), sichtbar verlinkt (O-46) — Abnahme: Regie-Szenario grün.
- [x] P16.10 (`src/grafik/bauplan.ts`) · Hintergründe im Stil „Bauplan“ (O-45): Startseite (Campus-Axonometrie mit Maßlinien, deutlich), Theorie (Grundriss mit Achsraster, sehr dezent), Story (Campus im Bau, wächst mit der Leistungsphase der Station, sehr dezent); gezeichnet als SVG, deterministisch, Kontrast des Texts ≥ 4,5:1, `prefers-reduced-motion` — Abnahme: Kontrastprobe und Bildschirmfotos in drei Größen.
- [x] P16.11 · Startseite neu und Wording „Internetseite“ (O-42, O-44): Startseite mit „Wer steht dahinter“ und Link, Logo im Kopf und Fußzeile verlinkt („Ein Angebot von Bauherr Mentoren“), alle sichtbaren Texte auf „Internetseite“ umgestellt, keine Registrierung/kein Login (read-only) — Abnahme: Begriffsprüfung grün, Szenario Start.
- [x] P16.12 (L-194) · Impressum und Datenschutz als eigene Seiten (O-43): Bauherr Mentoren GmbH i. G., vertreten durch Martin Mohr; Kontakt kontakt@bauherr-mentoren.com; Angaben aus `quellen/bm/impressum-bauherr-mentoren.md` (Kranzhornstr. 12, 83080 Oberaudorf; Verantwortlich nach § 18 Abs. 2 MStV Martin Mohr; Handelsregister und USt-IdNr. „werden nach Eintragung bzw. Erteilung ergänzt“, wie dort), Datenschutz zugeschnitten aus `quellen/bm/datenschutz-bauherr-mentoren.md` (Aufsicht BayLDA); Datenschutz für eine read-only-Seite (keine Cookies, kein Tracking, keine Dritten, lokale Speicherung mit Knopf „Fortschritt löschen“, Hoster IONOS mit Server-Protokollen, Betroffenenrechte, Aufsichtsbehörde) — Abnahme: beide Seiten im Bau, aus jeder Fläche erreichbar, Szenario.
- [x] P16.13 (L-194) · Webseiten-Bau (O-42, O-47): `dist/` als Webseitenordner (`index.html`, `impressum.html`, `datenschutz.html`, `robots.txt`, `sitemap.xml`, Vorschaubild, Favicon, Titel/Beschreibung/Open-Graph); Kundenfassung `mvg-kunde.html` und alles dafür gelöscht; Kette und GitHub-Aktion angepasst; `docs/LAUNCH.md` mit Upload-Anleitung für IONOS (Webspace, Domain auf den Ordner, HTTPS) und Checkliste vor dem Launch — Abnahme: Bau deterministisch, ohne Nachladen von Dritten, Kette grün.
- [x] P16.14 (L-196–L-199, L-201) · Aufräumen (O-41): verwaiste Inhalte, Code, Stile, Tests, Werkzeuge, Proben und Dokumente der entfallenen Teile gelöscht (Suche nach Welt A, Rollen, Vergleich, Enden, Originaltext, Zitieren, Kundenfassung, Hilfe, Simulator, Diagnose, Vermerk); `docs/ARCHITEKTUR.md`, `docs/INHALTSFORMAT.md`, `docs/ABNAHME.md` und Übergabe auf den neuen Stand — Abnahme: keine toten Exporte, keine unbenutzten Dateien (Prüfung in der Kette), Kette grün.
- [x] P16.15 (L-205–L-223) · Prüf-Agenten Neuausrichtung (alle Rollen aus `docs/PRUEFAGENTEN.md`, Fachtreue gegen V1.2 + V2.4) + Korrekturschleife — Abnahme: zwei Runden ohne schwere Befunde, offene mittlere in `docs/ABNAHME-MITTEL.md` (O-35, O-48).
- [x] P16.16 (L-224) · Abschluss (O-49): Übergabe, `docs/LAUNCH.md` final, CI auf dem letzten Commit grün gelesen, `claude/haus` einmal per Merge nach `main` gepusht, Push-Nachricht an den Owner, Ampel rot „fertig“.

### P17 · Neugestaltung: Story als Spiel, Themen als Buch (O-51 bis O-58, Owner 2026-10-03)
- [x] P17.1 (L-225, drei Prüfrunden) · Drehbuch der neuen Story (`docs/DREHBUCH.md` neu): Figuren mit Namen, Steckbrief, Sprechweise; acht Kapitel mit Szenen, je Entscheidung drei Antworten (gut, vertretbar, Falle) samt Folge-Szene, Balkenwirkung und „So macht man es gut“; vier Mini-Aufgaben; Kapitel 7 mit gewichtetem Vergleich; „Das steckt dahinter“ je Kapitel mit Thema; Kurzfassung (vier Kapitel + Brückensätze); Bilanz; Fachbelege intern (V1.2/V2.4) — Abnahme: Fachtreue + Begriffe geprüft, nichts Offenes.
- [x] P17.2 · Story-Format, Übersetzer und Engine neu (`inhalte/geschichte/`, `werkzeuge/geschichte.mjs`, `src/geschichte/`): Kapitel, Szenen mit Figuren, Entscheidungen mit Wertung und Balkenwirkung, Mini-Aufgaben, Vergleich in Kapitel 7, Kurzfassung, Bilanz, gespeicherter Stand; alte Stationen und Statusbedingungen gelöscht (O-41); `docs/INHALTSFORMAT.md` — Abnahme: Tests für jede Regel mit Gegenprobe, Kette grün.
- [x] P17.3 · Grafik: Akzentpalette (Tokens, Kontrast ≥ 4,5:1), fünf Figuren-Porträts und die Spielfigur, isometrischer Campus in acht Stufen mit Jahreszeit, Licht und Kindern am Schluss, kleine Szenen-Grafiken für jeden Schritt — Abnahme: alle Grafiken gerendert und angesehen, hell/dunkel, reduzierte Bewegung.
- [x] P17.4 · Story-Fläche neu (`src/ui/flaechen/geschichte.ts`, Stil): Kapitel-Ansicht mit Figuren-Dialog, Entscheidung, Folge-Szene, Balken, Mini-Aufgaben, Vergleich, Bilanz, Kurzfassung, Fortschritt; Tastatur, Fokus, Screenreader, 320 px bis Beamer; Druck-Ersatzbogen — Abnahme: Szenario „story“ neu und grün, axe ohne Befund.
- [x] P17.5 · Story-Inhalte nach Drehbuch geschrieben (acht Kapitel, Kurzfassung), Lesezeit gemessen (etwa 25 / etwa 10 Minuten, gemessen 10,4 nach R75) — Abnahme: Fachtreue + Begriffe, Lesezeit im Rahmen.
- [x] P17.6 · Regie und Leinwand auf die neue Story (Sprung je Kapitel, Wahl aus der Regie, Balken und Vergleich auf der Leinwand, Notizen nur in der Regie) — Abnahme: Regie-Szenario grün, Leinwand ohne Notizen.
- [x] P17.7 · Startseite angeglichen mit den Figuren der Story, Explore mit neuen Farben und Grafiken (Inhalt unverändert) — Abnahme: Szenarien „start“ und „explore“ grün.
- [x] P17.8 · Themen-Inhaltsverzeichnis als Buch (vier Teile, Kapitel 1–16 nummeriert, Symbol, Kurzsatz, Glossar als Anhang), Fortschritt mit Häkchen und Balken im Browser gespeichert, Datenschutz angepasst — Abnahme: Test der Fortschrittslogik, Szenario „theorie“ grün.
- [x] P17.9 · Themen-Optik: Kopf mit reicherem Bauplan-Motiv je Teil und Illustration je Kapitel, ruhiger Grund, Abschnitts-Symbole, Abbildungen auf farbiger Fläche, Knopf „Vergrößern“ entfernt — Abnahme: Kontrast, Druck und Szenarien grün.
- [x] P17.10 · Interne Bemerkungen entfernt (Abweichungen der Abbildungen, sichtbare Bedienungs- und Regie-Hinweise, Prüfvermerke, Quellenhinweise, Begründungen) und eine Probe in der Kette, die so etwas künftig meldet — Abnahme: Probe mit Gegenprobe rot, Kette grün.
- [x] P17.11 · Themen-Texte um etwa ein Drittel gekürzt, gegliedert in Karten, Aufklapper und große Kernaussage mit Symbol; Verständnisfragen halbiert (die schwierigeren bleiben) — Abnahme: Fachtreue + Begriffe je Kapitel, keine neue Fachaussage.
- [ ] P17.12 · Prüf-Agenten (Rollen in `docs/PRUEFAGENTEN.md` und Workflow auf neue Story und Optik) + Korrekturschleife — Abnahme: zwei Runden ohne schwere Befunde, offene mittlere in `docs/ABNAHME-MITTEL.md` (O-35, O-58).
- [ ] P17.13 · Abschluss (O-58): Übergabe, ABNAHME-Checkliste neu, CI auf dem letzten Commit grün gelesen, `claude/haus` einmal per Merge nach `main` gepusht, Nachricht an den Owner, Ampel rot „fertig“.

## Erledigt
(noch nichts)
