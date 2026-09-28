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
- [x] P9.4 (2026-09-28) · Regie-Eingriffe: springen, Welt/Rolle umschalten, Ereignis einspielen, Szenario-Werte; Beamer-Schalter (E10) – wirkt auf die Story, nicht auf Explore (L-53)
- [x] P9.5 · Zwei-Fenster-Tests + Prüf-Agenten P9 (`docs/P9-BEFUNDE.md`)

### P10 · Whitepaper-Funktionen & Auslieferung
- [x] P10.1 · Zitierfunktion, Permalinks, Fußnoten/Quellen, Versions- und Änderungsstand, Vermerk „fachlich ungeprüft“ (L-55)
- [x] P10.2 · Druckansicht je Kapitel und gesamt, Druck-Dossier (E11) (L-56)
- [x] P10.3 · Re-Import-Werkzeug V1.3: neue DOCX einlesen, Diff je Absatz-ID, betroffene Stellen melden (L-57)
- [x] P10.4 · Korrekturliste V1.3 (E13): alle Grafik↔Text-Widersprüche mit Bild-Prompts (`docs/KORREKTURLISTE-V1.3.md`) – 8 Text-, 90 Grafik-Einträge, 13 Bild-Prompts
- [x] P10.5 · Begriffs-Kompass (E7) (L-57)
- [x] P10.6 · Einbett-Schnittstelle (E12): iframe-sicher, postMessage; dezente Klänge (E14, standardmäßig aus) (L-58)
- [x] P10.8 · Kundenfassung ohne Regie-Material (L-7): `npm run bau -- --kundenfassung` → `dist/mvg-kunde.html`; Test, dass kein Regie-Text enthalten ist (L-58)
- [x] P10.7 · Größenbudget < 4 MB, Determinismus, Anleitungen (Selbstlernen, Präsentator), Abnahme-Checkliste für den Owner (`docs/ABNAHME.md`) (L-58)
- [x] P10.9 · Prüf-Agenten P10 (`docs/P10-BEFUNDE.md`)

### P11 · Gesamtprüfung
- [ ] P11.1 · Vollständigkeitsprüfer: Bauplan, 20 Owner-Punkte, E1–E14, O-Entscheide, Abdeckung
- [ ] P11.2 · Alle Pfade × Rollen × Größen im Browser; Barrierefreiheit (auch Lauf mit `prefers-reduced-motion: reduce`, P2-Befund V6)
- [ ] P11.3 · Korrekturschleife, bis zwei Runden nichts Neues finden
- [ ] P11.4 · Abschluss: UEBERGABE mit Abnahmeanleitung; Ampel rot „fertig – Routine anhalten, claude/haus nach main zusammenführen“

## Erledigt
(noch nichts)
