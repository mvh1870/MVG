# MVG – „Zwei Welten. Ein Schulcampus.“ · Bauplan (Entwurf zur Freigabe)

Stand 2026-09-26 · Grundlage: Whitepaper Bauherr Mentoren V1.2 · Owner-Entscheide aus 8 Fragerunden

## 1 Zielbild in fünf Sätzen
1. Aus dem Whitepaper wird eine klickbare, animierte Geschichte: Management-Simulator mit Whitepaper-Tiefe, für Selbstlernen und Kundentermine gleichermaßen.
2. Der Leser erlebt einen fiktiven Schulcampus der Stadt Lindenhall zuerst in **Welt A** (ohne MVG) bis zur Eskalation, versteht am **Wendepunkt** die Ursachen, spult zurück und spielt dieselben Stationen in **Welt B** (mit MVG). Ein Schieberegler vergleicht beide Welten an jeder Station.
3. Sechs spielbare Rollen mit eigenen Entscheidungsszenen auf gemeinsamem Rückgrat; die Geschichte merkt sich jede Entscheidung und zitiert sie später. Daneben steht ein eigener **Theorie-Teil**, der die gesamte MVG-Theorie in der Gliederung des Whitepapers interaktiv vermittelt, und ein **Explore-Bereich** mit Werkzeugen und Simulator.
4. Eine einzige HTML-Datei, offline lauffähig, mit Regie + Leinwand für Kundentermine, später einbettbar in Website oder Programm.
5. Gebaut wird autonom in der Cloud (dein Routinen-Paket, Zweig `claude/haus`), bis alle Phasen erledigt sind; alles bleibt „fachlich ungeprüft“ bis zu deiner Abnahme.

## 2 Festgelegte Entscheide (Owner, 2026-09-26)
| Thema | Entscheid |
|---|---|
| Zweck | Akquise und Befähigung gleichgewichtig; Ende neutral, kein Vertrieb |
| Dramaturgie | Zwei Welten, Rückspulen am Wendepunkt, danach Schieberegler A↔B je Station |
| Fall | Öffentlicher Hochbau: Schulcampus (~58 Mio. €), Stadt als Eigentümerin, städtische Gebäudemanagement-GmbH als Bauherrenvertretung |
| Rollen | 6 spielbar: Geschäftsführung · Bauherr (Dezernentin) · Bauherren-PL · Projektsteuerung · Planung · Controlling; Rückgrat + Rollenszenen + „Standpunkt wechseln“ |
| Länge | Hauptpfad 25–35 Min; Express-Pfad ~12 Min; Explore bis 2 h |
| Figuren/Ton | Illustrierte SVG-Besetzung mit Namen, trockener Humor, fachlich korrekt |
| Enden | 3 Enden + Zielbild + Rückbezug + persönliches Resümee |
| Selbstdiagnose | Qualitativ, ohne Punktzahl; Verweis auf die echte Reifegradanalyse (10 Domänen/49 Fragen) nur als Methode |
| Präsentator | Regie + Leinwand (2 Fenster, BroadcastChannel, offline); Notizen & Leitfragen, Gesprächsprotokoll, Regie-Eingriffe |
| Geräte | Desktop, Beamer 16:9, iPad quer; Handy lesbar |
| Look | BM-Navy/Gold als Rahmen, Petrol/Grün als Grundton, Welt A Koralle + Notizpastelle, Welt B Türkis/Grün, Rollenfarben; eingebettete OFL-Schriften; Stil = gewählte Prototyp-Variante |
| Grafiken | Alle Diagramme nativ als animierte SVG; Originalbilder ins Archiv; Korrekturliste für V1.3 |
| Begriffe | Whitepaper-Text gilt (vor Companion); „Minimum Viable Governance“; LPH 0–9, nie G0–G5 |
| Text | Story frei und knapp; Original V1.2 wortgetreu in Ebene 4 und im Whitepaper-Modus |
| Sprache/Pflege | Deutsch; Inhalte als Markdown-Dateien je Station/Rolle, ohne Programmierung änderbar |
| Umfang | Alle 20 Punkte deines Konzepts + eigene Ideen (Abschnitt 5, einzeln streichbar) |
| Theorie-Teil | Eigene Sektion mit der gesamten MVG-Theorie in Whitepaper-Gliederung (13 Kapitel), interaktiv aufbereitet, jeder Absatz abgedeckt |
| Fassung | V1.2 maßgeblich + Re-Import-Werkzeug für künftige Fassungen |
| Cloud | GitHub mvh1870/MVG (privat, legst du an); Routinen-Paket unverändert; Zweig `claude/haus`; du führst zusammen; gründliche Prüf-Agenten |

## 3 Dramaturgie (Hauptpfad)
Durchgehend sichtbar: Story-Karte, Statusbereich (Entscheidungsfähigkeit, Kostenunsicherheit, offene Risiken, ungeklärte Entscheidungen, Terminrisiko), LPH-Zeitband 0–9, Rollen-Linse.

| Akt | Station | Monat | Kern (Whitepaper) | Interaktion (Beispiele) |
|---|---|---|---|---|
| Prolog | Übernahme | 0 | Leitthese, Kap. 1 | Rolle wählen, Interessen wählen (Kosten/Organisation/Risiko …), Projekt übernehmen |
| I · Welt A | A1 Lage verstehen | 1 | Kap. 2.1–2.3 | Interaktive Projektübersicht, Beteiligten-Netz, Zielkonflikt-Regler (Kosten/Termin/ESG/LCC) |
| | A2 Erstes Signal | 3 | Kap. 4.1–4.2 | Lieferzeit Holzbau + Nutzerwunsch Mensa, informelle Zusage? |
| | A3 Kosten +8 % | 5 | Kap. 2.4, 4.6 | „Information noch nicht verfügbar“, Entscheidung A–D (Prototyp-Szene) |
| | A4 Ausschuss vertagt | 7 | Kap. 2.5, 4.3 | Gremium ohne Entscheidungsreife, 40-Seiten-Bericht |
| | A5 Folgekosten | 9 | Kap. 4.4–4.5 | Reserve verbraucht ohne Freigabe, Nachtrag, informelle Umplanung |
| | A6 Eskalation | 11 | Kap. 2.3, 2.5 | Freigabe LPH 5 steht an, Schlüsselperson fällt aus, Stadtrat fragt |
| Wendepunkt | Ursachenanalyse | – | Kap. 2.5, 3, 4 | Symptom-Radar, „Was passiert, wenn …?“-Wirkungsketten, Mandatsschwellen-Spiel, Pyramide, 6 Felder: Chaos → Ordnung |
| ⟲ | Rückspulen | 0 | Kap. 5, 5.4 | 8 MVG-Bausteine setzen sich zusammen; LPH 0 als früher Hebel |
| II · Welt B | B1–B6 | 1–11 | Kap. 5.3, 6.4, 9.1–9.5 | Dieselben Stationen mit Werkzeugen: Zielsystem, Mandatsleiter, Entscheidungs-IDs, Datenstand, Governance-Fluss, Entscheidungsvorlage, Freigabe LPH 5, Rhythmus/Betriebshandbuch; Schieberegler A↔B; „Damals haben Sie …“ |
| III · Wirklichkeit | Zurück in Welt A | 12 | Kap. 11, 8.2, 7, 8.3–8.4 | „Welt B war ein Gedankenexperiment.“ MVG-Neuinitialisierung, 30/60/90 als Zeitachse zum Schieben, Weg Diagnose → Regelbetrieb |
| | Ausgang | – | Kap. 9, 12 | 3 Enden: steuerbar übergeben · Freigabe mit Auflagen · Neufestlegung der Projektbasis; Zielbild; Rückbezug auf Ihre Spur |
| Epilog | Ihr Projekt | – | Kap. 10, 7.1 | Selbstdiagnose (qualitativ), 4 Bauherrentypen „Wie sähe das bei Ihnen aus?“, persönliches Resümee, Bibliothek |

Welt A und Welt B erzählen dieselben Ereignisse; Welt B zeigt, was die MVG-Logik daraus macht. So kommen alle 13 Kapitel vor, ohne dass die Story zur Kapitelfolge wird.

## 4 Deine 20 Punkte → wo sie landen
Storyline/Dramaturgie → Abschnitt 3 · Entscheidungspunkte → jede Station, rollenspezifisch · Szenario-Simulator → Explore „Projektlage“ (Kostenabweichung, Terminabweichung, Risiken, Entscheidungsstatus → Eskalationsstufe, Informationsbedarf, Freigabeweg) · Progressive Information → 4 Ebenen, Mouseover-Begriffe, Seitenpanel, Quellenfenster · Interaktive Grafiken → alle Diagramme klickbar (Rolle, Eingangsinformationen, Kriterien, Schwellen, Nachweise, Folgeprozesse) · „Was passiert, wenn …?“ → Wendepunkt + Explore · Rollenperspektiven → 6 Rollen · Selbstdiagnose → Epilog · Story-Fallstudie → Tagesuhr („Montag, 08:30 Uhr“) · Konsequenzen sichtbar → Statusbereich · Zeit als Storyelement → Monate + LPH-Zeitband · Information nicht verfügbar → Bekannt/Unbekannt + „anfordern kostet Zeit“ · Entscheidungsvorlage → ENT-Vorlagen mit Checkliste „entscheidungsreif?“ · Vorher/Nachher → Schieberegler A↔B · Wissenschecks ohne Schulungscharakter → Fragen mit Erklärung statt Punkten · Intelligente Vertiefung → Interessenwahl im Prolog steuert Zusatzangebote · Persönliches Resümee → Ende · Whitepaper-Funktionen → Abschnitt 6 · Zwei Modi → Story + Explore · Story erinnert sich → Entscheidungsgedächtnis mit Zitaten.

## 5 Eigene Ideen (einzeln streichbar, Nummer nennen)
- **E1 Ihre Spur:** sichtbare Kette aller eigenen Entscheidungen über beide Welten; am Ende A-Spur gegen B-Spur.
- **E2 Nachweiskette zum Anfassen:** Klick auf eine Entscheidung zeigt Mandat → Freigabe → Entscheidungs-ID → Datenstand → Nachweis → Beschlusslage (Kap. 9) als Animation.
- **E3 Gremium-Szene:** Der Leser sitzt im Änderungsgremium und muss mit der Vorlage beschließen (Beschlusslage wird dokumentiert).
- **E4 Zeitmaschine:** Zeitachse schieben und sehen, wie sich Kostenunsicherheit und Entscheidungsstau in A und B über die Monate entwickeln (Diagramm).
- **E5 Governance-Fluss-Sandbox (Explore):** Ereignisse einwerfen (Frühwarnung, Problem, Änderung) und durch Register, Status und Rollen laufen sehen; nutzt dieselbe Mechanik wie die Regie-Eingriffe.
- **E6 Einwand-Karten:** typische Kundeneinwände („Ist das nicht nur mehr Bürokratie?“) mit Antworten aus dem Whitepaper, im Story-Modus als Denkanstoß, in der Regie als Spickzettel.
- **E7 Begriffs-Kompass:** Whitepaper-Begriffe neben gängigen Synonymen (Change-Board → Änderungsgremium, Gate → Freigabe), hilfreich für Kunden mit anderem Vokabular.
- **E8 Express-Pfad** (~12 Min) für die Geschäftsführung, über die Story-Karte wählbar.
- **E9 Weiterlesen:** Das Gerät merkt sich Stand und Spur (nur lokal).
- **E10 Beamer-Schalter in der Regie:** größere Schrift, höherer Kontrast auf der Leinwand.
- **E11 Druck-Dossier:** druckfertige Fassung (PDF über den Druckdialog) von Whitepaper, gewähltem Pfad, Resümee und Gesprächsprotokoll.
- **E12 Einbett-Schnittstelle:** iframe-sicher, Nachrichten-Schnittstelle für die Hostseite, später Web-Komponente `<mvg-story>`.
- **E13 Korrekturliste V1.3:** alle Widersprüche Grafik ↔ Text mit Bild-Prompts für die Neuerzeugung.
- **E14 Dezente Klänge** (standardmäßig aus).

## 6 Drei Bereiche: Story · Theorie · Explore
**Ruhiger Einstieg (Owner-Vorgabe):** Beim ersten Öffnen eine aufgeräumte Startseite mit genau zwei Wegen: **„Erklärt – Kapitel für Kapitel“** (Theorie) und **„Erlebt – als Geschichte“** (Story). Sonst nichts Aufdringliches: kein Statusbereich, keine Story-Karte, keine Werkzeugleisten. Bedienelemente erscheinen erst, wenn sie gebraucht werden (der Statusbereich z. B. mit der ersten Entscheidung, die Story-Karte nach der ersten Station), und bleiben zurückhaltend. Explore wird nicht auf der Startseite angeboten, sondern aus Story und Theorie heraus erreicht („Selbst ausprobieren“) und nach dem Ende freigeschaltet. Der Präsentator-Modus hat einen dezenten Einstieg (kleiner Link bzw. Tastenkürzel).
- **Story:** die geführte Geschichte (Abschnitt 3).
- **Theorie (MVG-Kompendium):** alle 13 Kapitel in der Reihenfolge des Whitepapers, jedes als bebilderte, interaktive Lernseite. Modelle und Tabellen werden zu klickbaren Grafiken und Karten (Symptome, Delegierbar/Nicht delegierbar, Verantwortungspyramide, 6 Verantwortungsfelder, 8 Bausteine, Wirklogik, LPH-0–9-Freigabemodell, Funktionslogiken des Companion, Register, Governance-Fluss, Rhythmus, Leistungsarchitektur, 30/60/90, Ergebnisobjekte, Anwendungssituationen, Neuinitialisierung, Gewinn). Jede Seite hat die 4 Ebenen, den Originaltext wortgetreu und Querverweise „In der Story erlebt: Station A3/B3“. Ein Prüfer beim Bau sichert, dass **jeder Absatz** des Whitepapers einer Theorie-Seite zugeordnet ist. Die Diagramme sind dieselben Bausteine wie in der Story.
- **Explore:** Werkzeuge und freie Erkundung: Szenario-Simulator, Vorher/Nachher-Welten, Governance-Fluss-Sandbox, Zeitmaschine, Grafik-Galerie, Fallfiguren, Story-Karte mit Sprung zu jeder Station.

## 6a Whitepaper-Funktionen
Volltext V1.2 wortgetreu mit Absatz-Kennungen (im Theorie-Teil) · Glossar (Mouseover + eigene Seite) · Quellen- und Abbildungsverzeichnis · Fußnoten · Permalinks auf Abschnitte und Stationen · Zitierfunktion („Bauherr Mentoren, Whitepaper V1.2, Kap. 4.2, Abs. 3“) · Druckansicht/PDF je Kapitel und gesamt · Versionsnummer und Änderungsstand im Impressum-Bereich · Vermerk „fachlich ungeprüft“ bis zu deiner Abnahme · Leistungsgrenzen und rechtlicher Hinweis wortgetreu.

## 7 Präsentator-Modus
- **Leinwand** zeigt nur das Kundenbild; Notizen, Leitfragen und Regie-Hinweise erreichen sie nie.
- **Regie** zeigt Vorschau, Sprechernotiz, Leitfragen, Einwand-Karten, nächste Station, Zeitgefühl; du klickst die Wahl des Kunden an.
- **Gesprächsprotokoll:** Kundenwahl + deine Notiz je Entscheidungspunkt; bleibt nur lokal; druckbar als Protokoll.
- **Regie-Eingriffe:** zu jeder Station springen, Welt und Rolle umschalten, Ereignis einspielen, Szenario-Werte ändern.
- Technik nach bm-training-Vorbild: ein Zustandsobjekt als Wahrheit, BroadcastChannel mit Speicher-Rückfall, eine Zeichenfunktion für alle Flächen, funktioniert auch direkt aus der Datei. Fallback: ein Fenster mit einblendbarer Regie.

## 8 Technik (meine Entscheide, du hattest sie mir überlassen)
- TypeScript (streng), Node 24 für Werkzeuge, esbuild bündelt zu **einer HTML-Datei** (CSS, JS, Schriften, Bilder eingebettet; Ziel < 4 MB), strenge CSP ohne Netzzugriff, deterministischer Bau.
- Keine schwere Bibliothek: eigene kleine Story-Engine (Graph aus Stationen/Knoten/Bedingungen, Entscheidungsgedächtnis), SVG + Web Animations für alle Grafiken.
- Inhalte als Markdown mit Kopfdaten je Station/Rolle; ein Prüfer beim Bau: jeder Knoten erreichbar, keine Sackgassen, alle Rollen vollständig, verbotene Begriffe, Zitate wortgleich mit V1.2.
- BM-Farbtokens kopiert (mit Quellvermerk), Logo aus dem Original-PNG vektorisiert, Schriften aus OFL-Paketen eingebettet.
- Tests: Einheitentests (Engine, Verzweigung, Gedächtnis, Regie-Sync), Browser-Tests über alle Rollen und Pfade in 1280×720, 1024×768 und 400 px (Konsole, Überlauf, Kontrast/Barrierefreiheit), Zwei-Fenster-Test für Regie/Leinwand, Größen- und Determinismus-Prüfung.
- Einbettbar: eigenständige Datei + iframe-sichere Variante; Web-Komponente als Ausbaustufe.

## 9 Phasen und Abnahmekriterien
| Phase | Wo | Inhalt | Fertig, wenn … |
|---|---|---|---|
| **P0 Einrichtung** | lokal, mit dir | Repo + GitHub-Remote; Quellen ins Repo (DOCX, Text mit Absatz-IDs, Originalbilder, Tokens, Logo-SVG, Kanal-Vorlage); Regelwerk (kurze CLAUDE.md, Planblatt, Entscheidungslog, Übergabe, OWNER-FRAGEN.md, Ampel); Werkzeugkette und Prüfkette; Stil-Leitfaden aus deiner Variante; Durchstich: Engine + Station A3/B3 + Regie/Leinwand + Einzeldatei-Bau, alles grün; Cloud-Paket eingerichtet, Routine angelegt | erster Cloud-Block hat gepusht und seine Ampel steht |
| P1 Drehbuch & Theorie-Gliederung | Cloud | Alle Stationen, Rollenszenen, Entscheidungen, Konsequenzen, Gedächtnis-Bezüge, Enden; Abdeckungskarte: jeder Whitepaper-Absatz → Theorie-Seite (+ Story-Station) | Prüf-Agenten (Fachtreue, Begriffe, Dramaturgie) ohne offene Befunde; Graph-Prüfer und Abdeckungs-Prüfer grün |
| P2 Engine & Rahmen | Cloud | Story-Engine, Statusbereich, Story-Karte, LPH-Band, Rollen-Linse, 4 Ebenen, Glossar, Bereiche Story/Theorie/Explore, Weiterlesen, Tastatur, Barrierefreiheit | alle Einheiten- und Browser-Tests grün |
| P3 Welt A | Cloud | 6 Stationen × 6 Rollen, Besetzung und Illustrationen | jede Rolle durchspielbar, Prüf-Agenten ohne Befund |
| P4 Wendepunkt & Diagramm-Baukasten | Cloud | Symptom-Radar, Wirkungsketten, Mandatsschwelle, Pyramide, 6 Felder – als wiederverwendbare Bausteine für Story und Theorie | Grafiken klickbar, Inhalte gegen Kap. 2–4 geprüft |
| P5 Welt B | Cloud | 6 Stationen × 6 Rollen, Schieberegler A↔B, MVG-Werkzeuge | alle Werkzeuge gegen Kap. 5, 6, 9 geprüft |
| P6 Theorie-Teil | Cloud | 13 Kapitel als interaktive Lernseiten, Originaltext wortgetreu, Querverweise in die Story | Abdeckung 100 % der Absätze, Zitate wortgleich, Prüf-Agenten je Kapitel ohne Befund |
| P7 Wirklichkeit & Ende | Cloud | Neuinitialisierung, 30/60/90, Leistungsweg, 3 Enden, Zielbild, Resümee, Selbstdiagnose, Bauherrentypen | alle Enden erreichbar, Resümee spiegelt die Spur |
| P8 Explore & Simulator | Cloud | Szenario-Simulator, Vorher/Nachher-Welten, Sandbox, Zeitmaschine | Simulator-Regeln getestet |
| P9 Präsentator | Cloud | Regie/Leinwand vollständig, Notizen, Leitfragen, Einwände, Protokoll, Eingriffe | Zwei-Fenster-Test grün, nichts Regie-Eigenes auf der Leinwand |
| P10 Whitepaper-Funktionen & Auslieferung | Cloud | Verzeichnisse, Permalinks, Zitieren, Druck, Version, Re-Import, Korrekturliste V1.3, Einbettung, Größenbudget, Anleitungen, Abnahme-Checkliste | Druckansicht sauber, Einzeldatei < 4 MB, deterministisch |
| P11 Gesamtprüfung | Cloud | Vollständigkeitsprüfer, alle Pfade, Korrekturschleife bis nichts Neues kommt | Ampel „fertig – Routine anhalten, claude/haus zusammenführen“ |

Nach P3, P5, P6, P9 und P11 steht jeweils eine vorzeigbare Fassung auf `claude/haus`.

## 10 Cloud-Betrieb
- Dein Paket: Routine alle 3 h, Blöcke à 120 Min / 25 Züge, jeder Zug gepusht, du führst `claude/haus` nach `main` zusammen, wann du willst.
- Fragen gehen nur mit Vorgabe und 12-h-Frist in `OWNER-FRAGEN.md`; ohne Antwort gilt die Vorgabe. Alles Übrige entscheidet der Lauf selbst und schreibt es ins Entscheidungslog.
- Schätzung ohne Gewähr: 25–40 Blöcke, also rund 4–6 Tage Laufzeit; das Kontingent teilt sich mit deinen anderen Sitzungen.
- Am Ende: Ampel rot mit „fertig“; die Routine hältst du an.

## 11 Was ich von dir brauche (P0)
1. Stilvariante wählen (Prototyp-Seite).
2. Diesen Plan ausdrücklich freigeben, mit Streichungen aus Abschnitt 5.
3. Auf github.com/mvh1870 das leere private Repo `MVG` anlegen (ohne README) und mir die URL bestätigen.
4. Dein OK für den ersten Push (Git öffnet ggf. ein Anmeldefenster).
5. `cloud\CLOUD-EINRICHTEN.cmd` und `cloud\ROUTINE-ANLEGEN.cmd` selbst ausführen (Anmeldung einmal im Browser); in der Cloud-Umgebung ggf. Netzfreigabe für Paketquellen und Testbrowser erweitern.

## 12 Risiken und Gegenmittel
- **Inhaltsmenge (6 Rollen × 2 Welten):** Drehbuch zuerst, Graph-Prüfer, Prüf-Agenten, Vermerk „fachlich ungeprüft“.
- **Illustrationen ohne Bildgenerator in der Cloud:** ein festes SVG-Figurenbaukasten-System aus P0, alle Figuren daraus.
- **Cloud-Paket ungemessen:** erster Block ist der Test; P0 endet erst, wenn er gepusht hat; Startsatz für Neustart liegt bereit.
- **Browser-Tests in der Cloud:** falls der Testbrowser nicht geladen werden kann, weichen die Tests auf jsdom aus und der Befund steht in der Übergabe.
- **Safari/iPad und Zwei-Fenster-Betrieb:** BroadcastChannel mit Speicher-Rückfall; Ein-Fenster-Regie als Ausweg.
