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
- [x] P1.4 · Entscheidungsgraph: je Station × Rolle Entscheidung, Optionen, Konsequenz (4 Felder), Statuswirkung, Gedächtnis-Bezüge; Enden-Logik — als Inhaltsdateien nach `docs/INHALTSFORMAT.md` (Texte dürfen hier noch Rohfassung sein) — Abnahme: Graph-Prüfer grün (erreichbar, keine Sackgassen, alle Rollen, alle Enden).
- [ ] P1.5 · Prüf-Agenten Drehbuch (Fachtreue, Begriffe, Dramaturgie) + Korrekturen — Abnahme: keine offenen Befunde.

### P2 · Engine & Rahmen
- [ ] P2.1 · Engine vollständig: Graph, Bedingungen, Gedächtnis, Enden, Weiterlesen (E9), Zustands-Version, Station ohne `status-start` übernimmt den Stand ihrer Welt (L-19) — Abnahme: Einheitentests inkl. Mutanten-Probe.
- [ ] P2.2 · Leitstand-Rahmen mit schrittweiser Einblendung (L-4): Statusinstrumente, Story-Karte, LPH-Band 0–9, Rollen-Linse, „Standpunkt wechseln“, Seitenleiste — Abnahme: Browser-Tests.
- [ ] P2.3 · Ebenen 1–4, Glossar-Mouseover (Tastatur + Touch), Quellenfenster — Abnahme: jede Ebene erreichbar; Glossar wortgleich aus V1.2.
- [ ] P2.4 · Bereiche Start/Story/Theorie/Explore, Freischaltungen, Permalinks, Tastatur, Barrierefreiheit — Abnahme: axe ohne ernste Befunde.
- [ ] P2.5 · Prolog: Rollenwahl (6), Interessenwahl (intelligente Vertiefung), Express-Pfad (E8) — Abnahme: jede Rolle startbar.

### P3 · Welt A
- [ ] P3.1 · Figuren- und Requisiten-Baukasten (SVG): alle Figuren (Rollenfarben, Mimik neutral/besorgt/erleichtert), Mail, Chat, Excel-Stand, Haftnotiz, Protokoll, Aktenstapel — Abnahme: Galerie-Seite im Bau.
- [ ] P3.2 · Station A1 (alle 6 Rollen)
- [ ] P3.3 · Station A2 (alle 6 Rollen)
- [ ] P3.4 · Station A3 (alle 6 Rollen; PL aus dem Durchstich übernehmen)
- [ ] P3.5 · Station A4 (alle 6 Rollen)
- [ ] P3.6 · Station A5 (alle 6 Rollen)
- [ ] P3.7 · Station A6 (alle 6 Rollen)
- [ ] P3.8 · Prüf-Agenten Welt A + Korrekturen — Abnahme: keine offenen Befunde; jede Rolle in Browser-Tests bis zum Wendepunkt spielbar.

### P4 · Wendepunkt & Diagramm-Baukasten
- [ ] P4.1 · Symptom-Radar (8 Symptome, Kap. 2.5) mit den in Welt A erlebten Symptomen
- [ ] P4.2 · „Was passiert, wenn …?“-Wirkungsketten (mind. 6 Auslöser)
- [ ] P4.3 · Mandatsschwellen-Spiel: Aufgaben über die Schwelle ziehen (delegierbar / nicht delegierbar, Kap. 3.2)
- [ ] P4.4 · Verantwortungspyramide (Kap. 3.3), Ebenen klickbar
- [ ] P4.5 · Sechs Verantwortungsfelder: Chaos → Ordnung (Kap. 4, Tabelle als Karten)
- [ ] P4.6 · Rückspulen-Sequenz + 8 MVG-Bausteine (Kap. 5), LPH 0 als früher Hebel (5.4)
- [ ] P4.7 · Prüf-Agenten P4 + Korrekturen

### P5 · Welt B
- [ ] P5.1 · MVG-Werkzeug-Bausteine: Mandatsleiter, Governance-Fluss (animiert, Status je Register), Entscheidungsvorlage mit Checkliste (Kap. 9.4), Datenstand-Anzeige, Register-Karten (6.4.4), LPH-0–9-Freigabemodell (9.3), Governance-Kalender/Rhythmus (6.4.5), RACI + Mandat (9.2)
- [ ] P5.2 · Station B1 (alle Rollen) + Schieberegler A↔B + Rückbezüge
- [ ] P5.3 · Station B2
- [ ] P5.4 · Station B3 (PL aus dem Durchstich übernehmen)
- [ ] P5.5 · Station B4 + Gremium-Szene (E3)
- [ ] P5.6 · Station B5
- [ ] P5.7 · Station B6
- [ ] P5.8 · Ihre Spur (E1): Entscheidungskette über beide Welten
- [ ] P5.9 · Prüf-Agenten Welt B + Korrekturen

### P6 · Theorie-Teil (O-20)
- [ ] P6.1 · Lernseiten-Rahmen: Kernaussage, Grafik, Karten, Ebenen, Originaltext wortgetreu, Querverweise „In der Story erlebt“, Kapitelnavigation
- [ ] P6.2 · Kap. 1 Kurzfassung
- [ ] P6.3 · Kap. 2 Ausgangslage und Kernproblem
- [ ] P6.4 · Kap. 3 Begriffsrahmen
- [ ] P6.5 · Kap. 4 Verantwortungsfelder
- [ ] P6.6 · Kap. 5 MVG als Bauherren-Führungsmodell
- [ ] P6.7 · Kap. 6 MVG Companion (inkl. 6.4 Zusammenarbeit, Governance-Fluss)
- [ ] P6.8 · Kap. 7 Leistungsarchitektur
- [ ] P6.9 · Kap. 8 Implementierung
- [ ] P6.10 · Kap. 9 Ergebnisbild und Ergebnisse
- [ ] P6.11 · Kap. 10 Anwendungssituationen
- [ ] P6.12 · Kap. 11 MVG-Neuinitialisierung
- [ ] P6.13 · Kap. 12 Was Bauherren gewinnen
- [ ] P6.14 · Kap. 13 Glossar (eigene Seite + Mouseover-Quelle)
- [ ] P6.15 · Abdeckung 100 %, Zitate wortgleich, Prüf-Agenten je Kapitel + Korrekturen

### P7 · Wirklichkeit & Ende
- [ ] P7.1 · Zurück in Welt A: MVG-Neuinitialisierung (Kap. 11), 30/60/90 als schiebbare Zeitachse (8.2), Leistungsweg Diagnose → Regelbetrieb (Kap. 7), Mitwirkung/Abnahme (8.3/8.4)
- [ ] P7.2 · 3 Enden + Enden-Logik
- [ ] P7.3 · Zielbild (Kap. 9, 12), Rückbezug, Nachweiskette zum Anfassen (E2)
- [ ] P7.4 · Selbstdiagnose qualitativ (O-8)
- [ ] P7.5 · Bauherrentypen (Kap. 10): „Wie sähe das bei Ihnen aus?“
- [ ] P7.6 · Persönliches Resümee: Themen, 3 Prinzipien, 2 Vertiefungen, 1 Checkliste
- [ ] P7.7 · Prüf-Agenten P7 + Korrekturen

### P8 · Explore
- [ ] P8.1 · Szenario-Simulator (Kostenabweichung, Terminabweichung, Risiken, Entscheidungsstatus → Risikoeinschätzung, erforderliche Entscheidung, Eskalationsstufe, Informationsbedarf, Freigabeweg, Handlungsmöglichkeiten); Regeln aus Whitepaper, getestet
- [ ] P8.2 · Vorher/Nachher-Welten (Informationswege, Rollen, Entscheidungen, Eskalationen, Register, Reporting, Gremien)
- [ ] P8.3 · Governance-Fluss-Sandbox (E5)
- [ ] P8.4 · Zeitmaschine (E4)
- [ ] P8.5 · Grafik-Galerie + Abbildungsverzeichnis, Figurenübersicht, Story-Karte mit Sprung
- [ ] P8.6 · Prüf-Agenten P8 + Korrekturen

### P9 · Präsentator (O-9)
- [ ] P9.1 · Regie/Leinwand vollständig: Kanal mit Rückfall, Lebenszeichen, Ein-Fenster-Regie
- [ ] P9.2 · Notizen, Leitfragen, Einwand-Karten (E6) je Station und Theorie-Kapitel
- [ ] P9.3 · Gesprächsprotokoll (lokal) + Druckfassung
- [ ] P9.4 · Regie-Eingriffe: springen, Welt/Rolle umschalten, Ereignis einspielen, Szenario-Werte; Beamer-Schalter (E10)
- [ ] P9.5 · Zwei-Fenster-Tests + Prüf-Agenten P9

### P10 · Whitepaper-Funktionen & Auslieferung
- [ ] P10.1 · Zitierfunktion, Permalinks, Fußnoten/Quellen, Versions- und Änderungsstand, Vermerk „fachlich ungeprüft“
- [ ] P10.2 · Druckansicht je Kapitel und gesamt, Druck-Dossier (E11)
- [ ] P10.3 · Re-Import-Werkzeug V1.3: neue DOCX einlesen, Diff je Absatz-ID, betroffene Stellen melden
- [ ] P10.4 · Korrekturliste V1.3 (E13): alle Grafik↔Text-Widersprüche mit Bild-Prompts (`docs/KORREKTURLISTE-V1.3.md`)
- [ ] P10.5 · Begriffs-Kompass (E7)
- [ ] P10.6 · Einbett-Schnittstelle (E12): iframe-sicher, postMessage; dezente Klänge (E14, standardmäßig aus)
- [ ] P10.8 · Kundenfassung ohne Regie-Material (L-7): `npm run bau -- --kundenfassung` → `dist/mvg-kunde.html`; Test, dass kein Regie-Text enthalten ist
- [ ] P10.7 · Größenbudget < 4 MB, Determinismus, Anleitungen (Selbstlernen, Präsentator), Abnahme-Checkliste für den Owner (`docs/ABNAHME.md`)

### P11 · Gesamtprüfung
- [ ] P11.1 · Vollständigkeitsprüfer: Bauplan, 20 Owner-Punkte, E1–E14, O-Entscheide, Abdeckung
- [ ] P11.2 · Alle Pfade × Rollen × Größen im Browser; Barrierefreiheit
- [ ] P11.3 · Korrekturschleife, bis zwei Runden nichts Neues finden
- [ ] P11.4 · Abschluss: UEBERGABE mit Abnahmeanleitung; Ampel rot „fertig – Routine anhalten, claude/haus nach main zusammenführen“

## Erledigt
(noch nichts)
