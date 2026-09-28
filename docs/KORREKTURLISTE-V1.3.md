# Korrekturliste Whitepaper V1.3 (E13)

**Zweck.** Vorschläge an den Owner für die Fassung V1.3 des Whitepapers: Tippfehler und Satzfehler im Text sowie Widersprüche zwischen den Abbildungen und dem Text V1.2, dazu je Abbildung ein Bild-Prompt für die Neuerzeugung. Die interaktive Fassung zeigt den Text V1.2 unverändert (O-15); nichts von hier fließt ohne Owner-Entscheid in Zitate ein. Die Grafiken sind keine Quelle für Begriffe (O-14).

**Stand:** 2026-09-28 (gemessen mit `date -u`: Mon Sep 28 01:11 UTC 2026) · Posten P10.4 · Quelle `quellen/whitepaper/v1.2/whitepaper.json`, Abbildungen unter `quellen/whitepaper/v1.2/bilder/`, Beobachtungen aus `docs/recherche/grafiken-analyse.md`, jede Beschriftung am Bild nachgesehen.

## Legende
- **Absatz-ID** – Kennung aus `whitepaper.json` (z. B. `k6.4.3-p2`, Tabellen `…-t1`, Listen `…-l1`). Text in „…“ hinter einer ID ist wortgleich aus diesem Absatz.
- **Grafik zeigt** – Beschriftung oder Aufbau wie im Bild; Beschriftungen wörtlich in „…“. Nur in dieser Spalte stehen alte oder verbotene Begriffe (Ausnahme in `werkzeuge/begriffe.json`).
- **Text V1.2 sagt (Absatz-ID)** – was der Text an der belegten Stelle sagt.
- **Korrektur** – Vorschlag für V1.3, in der Terminologie des Texts.
- **verworfen** – Aussage der Analyse, die sich im Text nicht belegen lässt oder kein Widerspruch ist; sie steht unter der Tabelle mit Grund.
- **Gestaltung** – Bildfehler ohne Textbezug (Satz, Schrift, Anschnitt); nur als Hinweis für die Neuerzeugung.
- **Bild-Prompt V1.3** – Vorlage für die Neuerzeugung; zeigt nur, was der Text sagt. Zuordnung: Datei `imageN` ↔ Abbildung `abb-N`.

## Text
| Absatz-ID | Stelle | Befund | Vorschlag V1.3 |
|---|---|---|---|
| k2.5-t1 | Spalte „Symptom“, Zeile 7 | harter Trennstrich „Wissens-abhängigkeit“ (in der DOCX so gesetzt) | „Wissensabhängigkeit“ |
| k5.2-t1 | Baustein „Risiko-/Änderungs-/Maßnahmenverknüp-fung“ | harter Trennstrich mitten im Wort | „Maßnahmenverknüpfung“ (wie docs/BEGRIFFE.md) |
| k2-p1 | „Komplexe Bauvorhaben stehen unterzunehmendem Entscheidungsdruck.“ | Leerzeichen fehlt (L-14) | „stehen unter zunehmendem Entscheidungsdruck“ |
| k1.3-t1 | Zeile „Befähigung“: „Stellt sicher, dass Bauherren-Projektleitung, Auftraggeber Logik, PMO, Gremienrollen und Fachrollen das Modell selbst anwenden können.“ | Getrenntschreibung (L-14); an anderer Stelle „Auftraggeberlogik“ (k7.4-p2, k8.3-l1) | „Auftraggeberlogik“ |
| k9.2-p4 | „… die Bezeichnung „Auftraggeber Logik“ bleibt zulässig.“ | gleiche Getrenntschreibung; der Satz erklärt die Bezeichnung ausdrücklich für zulässig, deshalb nur Schreibweise | „die Bezeichnung „Auftraggeberlogik“ bleibt zulässig“ (Owner entscheidet, ob der Satz so bleibt) |
| k8.2-p2 · k8.2-p3 · k8.2-p4 | 30/60/90-Tage-Logik: „**In den ersten 30 Tagen** geht es um Sichtbarkeit: …“ · „Bis Tag 60 wird das Mindestmodell aufgebaut: …“ · „Bis Tag 90 ist das Modell in Anwendung: …“ | uneinheitliche Fettung (L-14): in p2 nur der Satzanfang fett, p3 und p4 als ganzer Absatz fett | einheitlich nur den Satzanfang fett: „**In den ersten 30 Tagen**“ · „**Bis Tag 60**“ · „**Bis Tag 90**“ |
| k10.3-p1 | „… Entscheidungen über Fortführung oder Stopp, Neu Priorisierung im Projektportfolio, …“ | Getrenntschreibung (beim Nachschlagen gefunden, nicht in L-14) | „Neupriorisierung im Projektportfolio“ |
| k3.1-p2 | „… nachvollziehbar und organisationsfest werden. ⏎ Zugleich benennt sie die sechs Verantwortungsfelder …“ | manueller Zeilenumbruch mitten im Absatz, davor ein Leerzeichen (beim Nachschlagen gefunden) | Zeilenumbruch und Leerzeichen entfernen, ein durchgehender Absatz |

## Abbildungen

Allgemein gilt für alle Inhaltsabbildungen (abb-2 … abb-14): Sie liegen nur als Rasterbild vor, der Text ist in die Pixel eingebrannt, Hintergründe tragen blasse Brücken-, Tor- und Zahnradmotive, die Strichstärken der Ikonen schwanken (Gestaltung). Die Neuerzeugung setzt Beschriftungen als Text; wo möglich wird die Abbildung als Vektorgrafik (SVG) gebaut.

### abb-2 · Kapitel 1 „Kurzfassung“ (k1)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| MVG-Kachel „Risk / Änderung“ | k1-p2: „Risiko- und Änderungssteuerung“ | „Risiko- und Änderungssteuerung“ |
| MVG-Kacheln „Datenstand“ und „Nachweis“ | k1-p2: „Datenstandslogik“, „Nachweisführung“ | „Datenstandslogik“, „Nachweisführung“ |
| Spalte „Bauherr“ mit sieben Kacheln, „Datenstand“ und „Nachweis“ getrennt | k3.1-p2: sechs Verantwortungsfelder „Ziel, Mandat, wesentliche Entscheidung, Risikoannahme, Freigabe sowie Datenstand und Nachweis“ | sechs Kacheln, „Datenstand und Nachweis“ als eine Kachel |
| Reihenfolge „Freigabe“ vor „Risikoannahme“; Kachel „Entscheidung“ | k3.1-p2 und k1.1-p1: Risikoannahme vor Freigabe; „wesentliche Entscheidung“ | Reihenfolge des Texts; „Wesentliche Entscheidung“ |

```text
Bild-Prompt V1.3 – abb-2 „Arbeit kann delegiert werden; bauherrenseitige Legitimation nicht.“
Aufbau: drei Spalten von links nach rechts, verbunden durch zwei breite Pfeile nach rechts.
Links, Fläche hell petrol getönt, Kopf „Delegierbare Arbeit“. Oberer Block „Rollen“ mit fünf Kacheln:
„Planer“, „Projektsteuerer“, „Gutachter“, „Projektmanagementbüro (PMO)“, „Berater“.
Unterer Block mit vier Zeilen: „analysieren“, „vorbereiten“, „koordinieren“, „dokumentieren“.
Mitte, Kopf auf Navy „Minimum Viable Governance (MVG)“, darunter zehn gleich große Kacheln in zwei Spalten:
„Zielsystem“, „Rollen“, „Mandate“, „Freigaben“, „Entscheidungs-IDs“, „Datenstandslogik“,
„Risiko- und Änderungssteuerung“, „Nachweisführung“, „Betriebshandbuch“, „Befähigung“.
Rechts, Kopf auf Grün „Bauherr“, darunter sechs Kacheln untereinander in dieser Reihenfolge:
„Ziel“, „Mandat“, „Wesentliche Entscheidung“, „Risikoannahme“, „Freigabe“, „Datenstand und Nachweis“.
Fußzeile über die ganze Breite: „Arbeit kann delegiert werden; bauherrenseitige Legitimation nicht.“
Stil: ruhige, flache Infografik ohne Verläufe, Schatten und Hintergrundmotive; Petrol #146878 und Navy #0C1C33
auf hellen Flächen (#F6F8FB, #EEF1F5, Weiß), Grün #349068 nur für die Spalte „Bauherr“; einfache Linien-Ikonen
gleicher Strichstärke; eine gut lesbare serifenlose Schrift (z. B. IBM Plex Sans), dunkler Text #0F1722 auf Hell,
weißer Text auf Navy/Petrol/Grün, Kontrast mindestens 4,5:1. Alle Beschriftungen als echter Text, exakt wie oben,
keine Silbentrennung in Wörtern, keine weiteren Wörter, keine Phantasie-Beschriftungen, keine englischen Begriffe, kein Logo.
Format 16:9 (1920 × 1080).
```

### abb-3 · Kapitel 2 „Ausgangslage und Kernproblem“ (k2)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Symptom „Changes ohne Schwellen“ | k2-p2: „Änderungen werden bearbeitet, aber nicht mit Freigabeschwellen verbunden.“ | „Änderungen ohne Freigabeschwellen“ |
| Symptom „Organisation nicht gerichtsfest“ | k2-p2 nennt als fünfte Grauzone: „Gremien erhalten Statusinformationen, aber keine klaren Entscheidungsfragen.“ k3-p2: „Es geht nicht um einen abschließenden juristischen Pflichtenkatalog.“ Der Text sagt „organisationsfest“ (k3.1-p2). | „Gremien ohne klare Entscheidungsfragen“ |
| Ergebnis „Diffuse Verantwortung und Steuerbarkeit“ (Steuerbarkeit als Symptom lesbar) | k2-p2: „Damit bleibt die Verantwortung formal beim Bauherrn – praktisch wird sie aber diffus.“ | „Verantwortung wird praktisch diffus“ |
| Mittelband „Fehlende Architektur“ | k2-p2: „… ob der Bauherr eine klare Führungs- und Entscheidungsarchitektur besitzt.“ | „Fehlende Führungs- und Entscheidungsarchitektur“ |

Verworfen: „5 Symptome im Bild, 8 in der Tabelle 2.5“ – die Abbildung steht am Kapitelanfang und folgt den fünf Grauzonen aus k2-p2, nicht der Tabelle k2.5-t1; kein Widerspruch.

```text
Bild-Prompt V1.3 – abb-3 „Ausgangslage und Kernproblem“
Aufbau: Kaskade von oben nach unten.
Oben drei Treiber-Karten nebeneinander, je mit Titel und Untertitel:
„Volatile Märkte“ – „Annahmen kippen“; „ESG und LCC“ – „Späte Zielkonflikte“; „Schlüsselrollen“ – „Wissensverlust“.
Drei Pfeile laufen zusammen in ein Navy-Band „Entscheidungsdruck“ (Symbol: Tacho).
Darunter ein Band „Fehlende Führungs- und Entscheidungsarchitektur“.
Von dort fünf gestrichelte Pfeile zu fünf gleich großen Karten („Grauzonen“):
„Rollen beschrieben, aber nicht mandatiert“, „Risiken bekannt, aber nicht entscheidungsreif“,
„Änderungen ohne Freigabeschwellen“, „Parallele Datenstände“, „Gremien ohne klare Entscheidungsfragen“.
Alle fünf münden in ein Navy-Band unten: „Verantwortung wird praktisch diffus“.
Stil: ruhige, flache Infografik; Petrol #146878 und Navy #0C1C33 auf hellen Flächen (#F6F8FB, #EEF1F5, Weiß),
die drei Treiber in drei zurückhaltenden Tönungen derselben Helligkeit; einfache Linien-Ikonen gleicher Strichstärke;
eine serifenlose Schrift (z. B. IBM Plex Sans), Kontrast mindestens 4,5:1. Beschriftungen als echter Text, exakt wie oben,
keine Silbentrennung, keine weiteren Wörter, keine englischen Begriffe, keine juristischen Begriffe, keine Hintergrundmotive.
Format 16:9 (1920 × 1080).
```

### abb-4 · Kapitel 3 „Begriffsrahmen“ (k3)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Rechte Spalte mit sechs Kacheln „Zielpriorität“, „Mandat“, „Entscheidung“, „Freigabe“, „Datenstand“, „Nachweis“ – ohne Risikoannahme | k3.1-p1: „… Zweck, Ziel, Mandat, wesentliche Entscheidung, Risikoannahme, Freigabe, Datenstand und Nachweis selbst legitimieren muss …“ | „Risikoannahme“ ergänzen; „Wesentliche Entscheidung“ |
| Kopf rechts „Bauherrenverantwortung“ | k3.2-t1 Spaltenkopf „Nicht delegierbar“; k3-p1 „nichtdelegierbaren Bauherrenverantwortung“ | „Nicht delegierbar“ bzw. „Nichtdelegierbare Bauherrenverantwortung“ |

Gestaltung: Die Mittelspalte „Mandats-schwelle“ ist in einer anderen Schrift gesetzt und getrennt; blasse Tor- und Brückenmotive hinter der Mittelspalte.

```text
Bild-Prompt V1.3 – abb-4 „Wo Vorbereitung endet und eigene Entscheidung beginnt“
Aufbau: drei Spalten. Links Kopf „Delegierbar“ mit sechs Kacheln (2 × 3):
„Analyse“, „Vorbereitung“, „Koordination“, „Berichterstattung“, „Dokumentation“, „Befähigung“.
Mitte eine schmale senkrechte Schwelle, Titel „Mandatsschwelle“, oben „Vorbereitung endet“, unten „Entscheidung beginnt“,
in der Mitte ein schlichtes Schloss-Symbol; je ein Pfeil von links in die Schwelle und von der Schwelle nach rechts.
Rechts Kopf „Nicht delegierbar“ mit sieben Kacheln: „Ziel“, „Mandat“, „Wesentliche Entscheidung“, „Risikoannahme“,
„Freigabe“, „Datenstand“, „Nachweis“.
Fußzeile: „Arbeit kann delegiert werden, Verantwortung muss ausübbar bleiben.“
Stil: ruhige, flache Infografik; links Petrol #146878, rechts Navy #0C1C33, Flächen hell (#F6F8FB, Weiß);
einfache Linien-Ikonen gleicher Strichstärke; eine einzige serifenlose Schrift (z. B. IBM Plex Sans) für alle Texte,
Kontrast mindestens 4,5:1; Beschriftungen als echter Text, exakt wie oben, keine Silbentrennung,
keine weiteren Wörter, keine Tor- oder Brückenmotive. Format 16:9 (1920 × 1080).
```

### abb-5 · Abschnitt 3.3 „Die Verantwortungspyramide“ (k3.3)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Arbeitsebene „Impact-Bewertung“ | k3.3-t1 Arbeitsebene: „Auswirkungsbewertung“ | „Auswirkungsbewertung“ |
| Arbeitsebene „Inputs“; „Nachverfolgung“ fehlt | k3.3-t1 Arbeitsebene: „… Unterlagenzusammenstellung und Nachverfolgung.“ | „Unterlagenzusammenstellung“, „Nachverfolgung“ |
| Mandatsebene ohne Stellvertretungen; „Eskalation“ | k3.3-t1 Mandatsebene: „Befugnisse, Freigabegrenzen, Zeichnungsrechte, Stellvertretungen, Eskalationsschwellen und Gremienbezug.“ | „Stellvertretungen“ ergänzen; „Eskalationsschwellen“ |
| Letztverantwortung „Grundsatze-ntscheidung“, „Freigabe“, „Nachweis“ | k3.3-t1 Letztverantwortung: „Ziel, Grundsatzentscheidung, wesentliche Freigabe, Risikoannahme, Nachweisfähigkeit und Beschlusslage.“ | „Grundsatzentscheidung“, „Wesentliche Freigabe“, „Nachweisfähigkeit“ |
| Sockel „MVG“ mit „Inputs“, „Rollen“, „Freigaben“, „Entscheidungs-IDs“, „Datenstände“ | k3.3-t1 Relevanz für MVG: „MVG übersetzt Rollen in ein Mandatsmodell und verknüpft es mit Freigaben, Entscheidungs-IDs und Datenständen.“ | „Mandatsmodell“ statt „Inputs“ |
| Seitentafeln „Dritte“ mit leeren Kopfleisten, Verbindungslinien auch zum Sockel | k3.3-p2: „Die Arbeitsebene kann in hohem Maß von Planern, Projektsteuerung, PMO, Gutachtern oder Beratern getragen werden.“ | Tafel mit diesen Rollen beschriften, Pfeil nur in die Arbeitsebene |

```text
Bild-Prompt V1.3 – abb-5 „Die Verantwortungspyramide – Arbeitsebene, Mandatsebene und Letztverantwortung“
Aufbau: Pyramide aus drei Stufen auf einem flachen Sockel, von unten nach oben.
Sockel „MVG“: „Rollen“, „Mandatsmodell“, „Freigaben“, „Entscheidungs-IDs“, „Datenstände“.
Stufe 1 „Arbeitsebene“: „Analyse“, „Planung“, „Koordination“, „Dokumentation“, „Auswirkungsbewertung“,
„Unterlagenzusammenstellung“, „Nachverfolgung“.
Stufe 2 „Mandatsebene“: „Befugnisse“, „Freigabegrenzen“, „Zeichnungsrechte“, „Stellvertretungen“,
„Eskalationsschwellen“, „Gremienbezug“; Randnotiz „Ausübung innerhalb definierter Schwellen übertragbar“.
Stufe 3 „Letztverantwortung“: „Ziel“, „Grundsatzentscheidung“, „Wesentliche Freigabe“, „Risikoannahme“,
„Nachweisfähigkeit“, „Beschlusslage“; Randnotiz „bleibt beim Bauherrn“.
Spitze: Symbol Person, Beschriftung „Bauherr legitimiert“.
Links und rechts je eine Tafel „Planer · Projektsteuerung · PMO · Gutachter · Berater“ mit einem gestrichelten Pfeil
nur in die Arbeitsebene.
Stil: ruhige, flache Infografik; Sockel und Arbeitsebene hell petrol, Mandatsebene Petrol #146878,
Letztverantwortung Navy #0C1C33, Flächen hell (#F6F8FB, Weiß); einfache Linien-Ikonen gleicher Strichstärke;
eine serifenlose Schrift (z. B. IBM Plex Sans), Kontrast mindestens 4,5:1; Beschriftungen als echter Text,
exakt wie oben, keine Silbentrennung in Wörtern, keine weiteren Wörter, keine englischen Begriffe.
Format 16:9 (1920 × 1080).
```

### abb-6 · Kapitel 4 „Verantwortungsfelder des Bauherrn“ (k4)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Kern „MVG-Kern“ mit „ausübbar“, „prüfbar“, „gestaltbar“, „nachweisfähig“ | k4-p1: „… mit der Bauherr Mentoren die Ausübungsfähigkeit des Bauherrn sichtbar, prüfbar und gestaltbar macht.“ | „sichtbar · prüfbar · gestaltbar“ |
| Ziel: „Kompromiss-Regeln“ | k4-t1 Ziel: „Abwägungsregeln“ | „Abwägungsregeln“ |
| Ziel: „G0 / G1“ | k4-t1 Ziel, MVG-Antwort: „Freigabelogik für LPH 0–2“ | „Freigabelogik für LPH 0–2“ |
| Entscheidung: „Entscheidung ID“ | k4-t1 Wesentliche Entscheidung: „System der Entscheidungs-IDs“ | „Entscheidungs-IDs“ |
| Entscheidung: „Reifegrad“ | k4-t1 Wesentliche Entscheidung: „Entscheidungsreife“ | „Entscheidungsreife“ |
| Risikoannahme: „Risk / Änderung“ | k4-t1 Risikoannahme: „Risiko-/Änderungs-/Maßnahmenverknüpfung“ | „Risiko-/Änderungs-/Maßnahmenverknüpfung“ |
| Freigabe: „Freigabe-Set G0-G5“ | k4-t1 Freigabe: „Leistungsphasen- und Freigabemodell LPH 0–9“ | „Leistungsphasen- und Freigabemodell LPH 0–9“ |
| Freigabe: „Datenstandsbezug“ | k4-t1 Freigabe: „Datenstandsreferenz“ | „Datenstandsreferenz“ |
| Datenstand & Nachweis: „Nachweiske…“, „Betriebshandb…“ von einer Haftnotiz verdeckt | k4-t1 Datenstand und Nachweis: „Nachweiskette, Betriebshandbuch“ | vollständig lesbar |
| Haftnotizen „Laufwerk“, „Vertrag“, „CDE-Planer“, „Telefon“, „k. A.“, „??“, „SAP“, „Email“ (u. a. ein Produktname) | k4.3-p2: „… verhindert, dass kritische Entscheidungen in Protokollen, E-Mails, Fachrunden oder informellen Abstimmungen verschwinden.“ | Notizen nur „Protokoll“, „E-Mail“, „Fachrunde“, „informelle Abstimmung“, ohne Produktnamen |

```text
Bild-Prompt V1.3 – abb-6 „Sechs Verantwortungsfelder des Bauherrn“
Aufbau: ruhiger Kreis in der Mitte, Titel „Sechs Verantwortungsfelder“, darin drei Plaketten
„sichtbar“, „prüfbar“, „gestaltbar“. Ringsum sechs Karten, jede mit Titel und vier Zeilen:
„Ziel“: „Zielsystem“, „Muss-/Kann-Kriterien“, „Abwägungsregeln“, „Freigabelogik für LPH 0–2“.
„Mandat“: „Mandatsmodell“, „Schwellen“, „Stellvertretungen“, „Eskalationswege“.
„Wesentliche Entscheidung“: „Entscheidungs-IDs“, „Entscheidungsreife“, „verantwortliche Rolle“, „Entscheidungsfrage“.
„Risikoannahme“: „Risiko-/Änderungs-/Maßnahmenverknüpfung“, „Restrisiko“, „Risikominderung“, „Schwellenlogik“.
„Freigabe“: „Leistungsphasen- und Freigabemodell LPH 0–9“, „Mindestgrundlagen“, „Datenstandsreferenz“, „Freigabeschwellen“.
„Datenstand und Nachweis“: „Version“, „Beschlusslage“, „Nachweiskette“, „Betriebshandbuch“.
Am äußeren Rand, schräg und deutlich kleiner, vier Haftnotizen, die zu den Karten hin ausgerichtet sind:
„Protokoll“, „E-Mail“, „Fachrunde“, „informelle Abstimmung“ – sie verdecken keine Beschriftung.
Stil: ruhige, flache Infografik; Karten weiß mit Kopf in Petrol #146878, Mitte Navy #0C1C33, Grund hell #EEF1F5;
Haftnotizen in blassem Gelb und Rosa mit dunkler Schrift; einfache Linien-Ikonen gleicher Strichstärke;
eine serifenlose Schrift (z. B. IBM Plex Sans), Kontrast mindestens 4,5:1; Beschriftungen als echter Text,
exakt wie oben, nichts angeschnitten, keine Silbentrennung, keine weiteren Wörter, keine Produktnamen,
keine englischen Begriffe, keine Brücken- oder Waagenmotive im Hintergrund. Format 16:9 (1920 × 1080).
```

### abb-7 · Kapitel 5 „Minimum Viable Governance als Bauherren-Führungsmodell“ (k5)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Fünf Spalten „Zielsystem“, „Rollen & Mandate“, „Freigaben & Files“, „Steuerungslogik“, „Operating Model & Aktive Führung“ | k5.2-t1: acht Bausteine „Zielsystem und Abwägungsregeln“, „Rollen und Mandate“, „Freigabelogik“, „System der Entscheidungs-IDs“, „Datenstands- und Nachweislogik“, „Risiko-/Änderungs-/Maßnahmenverknüpfung“, „Betriebshandbuch“, „Befähigung“ | die acht Bausteine aus k5.2-t1 |
| Es fehlen System der Entscheidungs-IDs, Risiko-/Änderungs-/Maßnahmenverknüpfung, Betriebshandbuch, Befähigung; „Datenstand“ und „Nachverfolgung“ stehen doppelt | k5.2-t1 (je ein Baustein) | jeden Baustein genau einmal |
| „Freigaben & Files“ | k5.2-t1: „Freigabelogik“ | „Freigabelogik“ |
| „Impact Check“ (zweimal) | k5.3-p2: „… eine Auswirkungsbewertung auf Kosten, Termin, Qualität, Projektumfang, Risiko und ESG/LCC …“ | „Auswirkungsbewertung“ |
| „Operating Model & Aktive Führung“ | k5.2-t1 Betriebshandbuch: „Beschreibt den Regelbetrieb mit Taktung, Rollen, Routinen, Eskalation und Verantwortlichkeiten.“ | „Betriebshandbuch“ |
| Grundsatzleiste „Minimum first“, „Impact First“, „Entscheidungsreife“, „Evidenz“, „Auditierbarkeit“ | k5-p1: „… das Verantwortung in entscheidbare, mandatsfähige und nachweisbare Strukturen übersetzt.“ | Leiste „entscheidbar · mandatsfähig · nachweisbar“ |

Gestaltung: Die Grundsatzleiste schreibt „first“ und „First“ uneinheitlich (siehe Spalte „Grafik zeigt“).

```text
Bild-Prompt V1.3 – abb-7 „Bausteine des Bauherren-Führungsmodells“
Aufbau: oben acht gleich große Kacheln in zwei Reihen zu je vier, nummeriert 1–8:
1 „Zielsystem und Abwägungsregeln“, 2 „Rollen und Mandate“, 3 „Freigabelogik“, 4 „System der Entscheidungs-IDs“,
5 „Datenstands- und Nachweislogik“, 6 „Risiko-/Änderungs-/Maßnahmenverknüpfung“, 7 „Betriebshandbuch“, 8 „Befähigung“.
Darunter ein waagerechtes Band „Kopplung – Beispiel: wesentliche Änderungsentscheidung“ mit sieben Stationen, durch Pfeile verbunden:
„Entscheidungs-ID“ → „gültiger Datenstand“ → „Auswirkungsbewertung“ → „Mandatsprüfung“ → „Empfehlung“
→ „Freigabe- oder Eskalationslogik“ → „Nachweis der Beschlusslage“.
Fußleiste mit drei Plaketten: „entscheidbar“, „mandatsfähig“, „nachweisbar“.
Stil: ruhige, flache Infografik; Kacheln weiß mit Petrol-Kopf #146878, Kopplungsband Navy #0C1C33 mit weißer Schrift,
Grund hell #EEF1F5; einfache Linien-Ikonen gleicher Strichstärke; eine serifenlose Schrift (z. B. IBM Plex Sans),
Kontrast mindestens 4,5:1; Beschriftungen als echter Text, exakt wie oben, keine Silbentrennung,
keine weiteren Wörter, keine englischen Begriffe. Format 16:9 (1920 × 1080).
```

### abb-8 · Abschnitt 5.4 „LPH 0 als früher Wirkungsraum“ (k5.4)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Mittelpunkt „LPH0“ | k5.4-p1: „LPH 0“ | „LPH 0“ |
| Zielsystem: „Capex“, „Termin“, „Qualität“, „ESG“, „LCC“ | k5.2-t1 Zielsystem und Abwägungsregeln: „… wenn Kosten, Termine, Qualität, ESG, LCC, Risiko und Nutzwert kollidieren.“ | „Kosten“ statt „Capex“; „Risiko“ und „Nutzwert“ ergänzen |
| Zielsystem: „Kompromisse“ | k5.2-t1: „Zielsystem und Abwägungsregeln“ | „Abwägungsregeln“ |
| Sechs Karten (Zielsystem, RACI, Governance, Freigabe, Risikoregister, KPI-System); Datenstandslogik fehlt | k5.4-p1: „… weil dort Zielsystem, Mandatslogik, Leistungsphasen- und Freigabemodell, Datenstandslogik und erste Entscheidungsstandards früh angelegt werden können.“ | fünf Karten nach k5.4-p1 |
| Karte „Freigabe“ mit Tor-Symbol | k9.3-t1 LPH 0: „Sind Bedarf, Zielbild und Auftrag geklärt – gibt es eine legitimierte Grundlage für den Planungsstart?“ | „Freigabe LPH 0“ mit dieser Freigabefrage, ohne Tor |

Verworfen: „Der Text sagt, LPH 0 sei nicht das Hauptnarrativ“ – k5.4-p1 sagt das über das Whitepaper; die Abbildung steht im Abschnitt 5.4, der LPH 0 behandelt, und darf LPH 0 in die Mitte stellen. „Die A-Spalte der RACI ist in mehreren Zeilen markiert“ – das Bild zeigt je Zeile höchstens ein A; eine Regel „ein A je Rolle“ steht nicht im Text (k4.2-p1, k9.2-p1 nennen nur die vier RACI-Arten).

```text
Bild-Prompt V1.3 – abb-8 „LPH 0 als früher Wirkungsraum“
Aufbau: Kreis in der Mitte „LPH 0 · Bedarfsplanung“, darunter kleiner „früher Hebel“.
Fünf Karten ringsum, mit schlichten Doppelpfeilen zum Kreis:
„Zielsystem“: sieben kleine Schieberegler mit den Beschriftungen „Kosten“, „Termine“, „Qualität“, „ESG“, „LCC“, „Risiko“,
„Nutzwert“ und eine Zeile „Abwägungsregeln“.
„Mandatslogik“: Zeilen „Rollen“, „Mandate“, „Schwellen“.
„Leistungsphasen- und Freigabemodell“: Kasten „Freigabe LPH 0“ mit dem Satz
„Sind Bedarf, Zielbild und Auftrag geklärt – gibt es eine legitimierte Grundlage für den Planungsstart?“
„Datenstandslogik“: Zeilen „Version“, „Annahmen“, „Beschlusslage“.
„Erste Entscheidungsstandards“ (ohne Unterzeilen).
Stil: ruhige, flache Infografik; Karten weiß mit Petrol-Kopf #146878, Kreis Navy #0C1C33 mit weißer Schrift,
Grund hell #EEF1F5, keine Signalfarben; einfache Linien-Ikonen gleicher Strichstärke; eine serifenlose Schrift
(z. B. IBM Plex Sans), Kontrast mindestens 4,5:1; Beschriftungen als echter Text, exakt wie oben, keine Silbentrennung,
keine weiteren Wörter, keine englischen Begriffe, keine Tore. Format 16:9 (1920 × 1080).
```

### abb-9 · Kapitel 6 „MVG Companion als Umsetzungsbeschleuniger“ (k6)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Kachel „Evidence“ | k6.1-t1: „Daten- und Nachweisabfrage“; k6-p1: „Nachweisführung“ | „Nachweisführung“ bzw. Funktionslogik „Daten- und Nachweisabfrage“ |
| Sieben Kacheln „Entscheidung“, „Freigabe“, „Mandat“, „Datenstand“, „Evidence“, „Betriebshandbuch“, „Übergabe“; Rolleneinführung fehlt | k6.1-t1: sieben Funktionslogiken „Entscheidungsassistent“, „Leitfaden für Freigaben“, „Verantwortungszuordnung“, „Daten- und Nachweisabfrage“, „Betriebshandbuch-Assistent“, „Rolleneinführung“, „MVG-Übergabeassistent“ | die sieben Funktionslogiken |
| Rückführpfeil „Operating Model“ | k6.2-t1 Befähigungsschritt „Regelbetrieb“: „Wiederkehrende Anwendungshilfe für Entscheidungen, Freigaben und Prüfungen.“ | „Regelbetrieb“ |
| „Prüfung-Takt“ | k6.2-t1 Übergabe: „Prüfrhythmus“ | „Prüfrhythmus“ |
| Kette „Anwendung“ (mit Kachel „Übergabe“) → „Befähigung“ → „Regelbetrieb“ | k6.2-p1: „Schulung, Pilotierung, Übergabe und Regelbetrieb greifen auf dieselbe Logik zurück.“ | Befähigungskette „Schulung → Pilotierung → Übergabe → Regelbetrieb“ |
| Leiste „Bauherr entscheidet“, „Freigabe bleibt“, „Rollenrechte“, „Nachweiskette“, „Prüfung-Takt“ | k6.3-b1: „Der MVG Companion ersetzt keine Bauherrenentscheidung …“; „Verbindlich bleiben freigegebene Datenstände, definierte Rollenrechte, Datenschutzanforderungen und die bauherrenseitige Legitimation der Entscheidung.“ | Leiste nach k6.3-b1 |

```text
Bild-Prompt V1.3 – abb-9 „MVG Companion als Umsetzungsbeschleuniger“
Aufbau: links ein schmaler Block „MVG-Logik“, Pfeil nach rechts in einen breiten Block „MVG Companion“
mit sieben Kacheln (4 + 3): „Entscheidungsassistent“, „Leitfaden für Freigaben“, „Verantwortungszuordnung“,
„Daten- und Nachweisabfrage“, „Betriebshandbuch-Assistent“, „Rolleneinführung“, „MVG-Übergabeassistent“.
Rechts davon eine Kette aus vier Stationen mit Pfeilen: „Schulung“ → „Pilotierung“ → „Übergabe“ → „Regelbetrieb“,
darüber die Klammer „Befähigung“.
Fußleiste mit vier Plaketten, Titel „Verbindlich bleiben“: „freigegebene Datenstände“, „definierte Rollenrechte“,
„Datenschutzanforderungen“, „bauherrenseitige Legitimation der Entscheidung“.
Kleine Zeile darunter: „Der MVG Companion ersetzt keine Bauherrenentscheidung.“
Stil: ruhige, flache Infografik; Companion-Block Petrol #146878 hell getönt, „Regelbetrieb“ in Grün #349068,
übrige Köpfe Navy #0C1C33, Grund hell #EEF1F5; einfache Linien-Ikonen gleicher Strichstärke; eine serifenlose Schrift
(z. B. IBM Plex Sans), Kontrast mindestens 4,5:1; Beschriftungen als echter Text, exakt wie oben, keine Silbentrennung,
keine weiteren Wörter, keine englischen Begriffe, kein Brückenlogo. Format 16:9 (1920 × 1080).
```

### abb-10 · Abschnitt 6.4 „Zusammenarbeit im MVG Companion“ (k6.4, Governance-Fluss)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Knoten „Freigabe (G0–G5)“ | k6.4.4-t1 Freigabe: „Entscheidung des Bauherrn am Abschluss der Leistungsphase“; k13-t1 Freigabe: „(LPH 0–9)“ | „Freigabe (Abschluss LPH 0–9)“ |
| Ergebnis „Go / No-Go“ | k6.4.4-p1: „Ergebnis Freigabe / keine Freigabe / Freigabe mit Auflagen“ | „Freigabe / keine Freigabe / Freigabe mit Auflagen“ |
| Frühwarnung „– schwaches Signal“ | k6.4.3-p2: „Eine Frühwarnung (EW) ist ein unbewertetes Signal.“ | „unbewertetes Signal“ |
| Gestrichelter Pfeil „Indicator“ vom Risiko zurück zur Frühwarnung | k6.4.3-p2: „… CTC- oder Schwellenwertverletzungen erzeugen neue Frühwarnungen als neue Signale, nicht als Rückrichtung aus einem bestehenden Risiko.“ | Pfeil streichen |
| Banner „Schwellenwert löst Frühwarnung aus“ mit Pfeil **in** „CTC / Prognose“ | k6.4.3-p2 (wie oben): CTC- oder Schwellenwertverletzungen erzeugen neue Frühwarnungen | Pfeil **von** „CTC und Prognose“ zur Frühwarnung, Beschriftung „CTC- oder Schwellenwertverletzung → neue Frühwarnung“ |
| „Managementbericht“ nur über „Bericht“ aus der Freigabe erreicht; kein Pfeil von der Maßnahme | k6.4.3-p1: „EW (unbewertetes Signal) → bestätigt → Risiko → Entscheidung → Freigabe → Maßnahme → Managementbericht“ | Pfeil „Maßnahme → Managementbericht“ |
| Rückkante „mitigiert das Risiko (Regelkreis schließt)“ | k6.4.4-t1 Risikoregister, nächster Schritt: „Risikominderung oder Entscheidung“ | „Risikominderung“ |
| Risiko „– bewertet (P-A)“ | k6.4.4-t1 Risikoregister: „bewertetes mögliches Ereignis“ | „bewertetes mögliches Ereignis“ |
| Problem „– akutes Problem“ | k6.4.4-t1 Problemregister: „eingetretenes Problem“ | „eingetretenes Problem“ |
| Änderung „– Änderungsantrag“ | k6.4.4-t1 Änderungsregister: „gewollte Änderung“ | „gewollte Änderung“ |
| „CTC / Prognose – Kostenprognose“ | k6.4.2-t1: „CTC und Prognose“; k13-t1 CTC: „im Whitepaper als Restkostenprognose verwendet“ | „CTC und Prognose – Restkostenprognose“ |
| Maßnahme „– Maßnahme mit Frist“ | k6.4.3-p2: „Beschlüsse werden anschließend als Maßnahmen mit einer verantwortlichen Rolle und einer Frist nachverfolgt.“ | „Maßnahme – verantwortliche Rolle und Frist“ |

Verworfen: „Die Freigabe folgt im Bild auf jede Entscheidungsvorlage, der Text definiert sie nur am Abschluss einer Leistungsphase“ – der kanonische Fluss k6.4.3-p1 stellt die Freigabe selbst hinter die Entscheidung; widersprüchlich ist nur die Beschriftung (oben erfasst). „Das Bild zeigt nur 6.4.3, nicht Registerpflege und Takt“ – eine Auswahl, kein Widerspruch.
Gestaltung: In der Legende sehen „Überwachung / Indikator“ und „Bericht in den Managementbericht“ gleich aus (beide gestrichelt).

```text
Bild-Prompt V1.3 – abb-10 „Kanonischer Governance-Fluss“
Aufbau: eine waagerechte Hauptkette in der Bildmitte, sieben Knoten mit durchgezogenen Pfeilen:
„Frühwarnung – unbewertetes Signal“ → (Pfeilbeschriftung „bestätigt“) → „Risiko – bewertetes mögliches Ereignis“
→ „Entscheidung“ → „Freigabe – Entscheidung des Bauherrn am Abschluss der Leistungsphase“
→ „Maßnahme – verantwortliche Rolle und Frist“ → „Managementbericht – aggregierter Gremienbericht“.
Über dem Knoten „Entscheidung“ zwei kleinere Knoten „Entscheidungsregister – offener Entscheidungsbedarf“ und
„Entscheidungsvorlage – Frage, Datenstand, Optionen, Bewertung, Empfehlung“ mit Pfeil vom Register zur Vorlage.
Unter der Kette zwei Zuläufe in das Entscheidungsregister: „Änderung – gewollte Änderung“ und „Problem – eingetretenes Problem“,
dazu vom Risiko eine Kante; Beschriftung der Zuläufe: „Entscheidungsbedarf“.
Am Knoten „Freigabe“ drei kleine Ergebnis-Plaketten: „Freigabe“, „keine Freigabe“, „Freigabe mit Auflagen“.
Links oben ein Knoten „CTC und Prognose – Restkostenprognose“ mit gestricheltem Pfeil zur Frühwarnung,
Beschriftung „CTC- oder Schwellenwertverletzung → neue Frühwarnung“. Kein Pfeil vom Risiko zurück zur Frühwarnung.
Am Knoten „Risiko“ die kleine Zeile „nächster Schritt: Risikominderung oder Entscheidung“.
Legende mit zwei eindeutig verschiedenen Linienarten: durchgezogen „Governance-Fluss“, gestrichelt „erzeugt neues Signal“.
Stil: ruhige, flache Infografik; Knoten weiß mit Petrol-Rand #146878, Freigabe-Knoten Navy #0C1C33 mit weißer Schrift,
Grund hell #EEF1F5; einfache Linien-Ikonen gleicher Strichstärke; eine serifenlose Schrift (z. B. IBM Plex Sans),
Kontrast mindestens 4,5:1; Beschriftungen als echter Text, exakt wie oben, keine Silbentrennung, keine weiteren Wörter,
keine englischen Begriffe, keine Tore. Format 16:9 (1920 × 1080).
```

### abb-11 · Kapitel 7 „Leistungsarchitektur von Bauherr Mentoren“ (k7)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Station „MVG Design“ | k7-l1, k7.2-p1: „MVG-Konzeption“ | „MVG-Konzeption“ |
| Station „Pilot & Kalibrierung“ | k7-l1: „Pilotierung und Kalibrierung“ | „Pilotierung und Kalibrierung“ |
| „eche Entscheidung“ (Wort angeschnitten) | k7.3-p1: „Erst im echten Entscheidungsfall zeigt sich …“ | „echter Entscheidungsfall“ |
| Konzeption: „Freigabe-Set“ | k7.2-t1 Typische Ergebnisse: „Leistungsphasen- und Freigabemodell“ | „Leistungsphasen- und Freigabemodell“ |
| Unterspur „Reset / Neuinitialisierung“ | k7-l1, k7.5-p1: „MVG-Neuinitialisierung“ | „MVG-Neuinitialisierung“ |
| Unterspur zweigt aus der Reifegradanalyse ab | k7-p2: „Für laufende Projekte mit eingeschränkter Steuerbarkeit kommt die MVG-Neuinitialisierung als gezieltes Sonderformat hinzu.“ k11.3-p2: „Ob früher Einstieg über die MVG-Reifegradanalyse oder eine MVG-Neuinitialisierung im laufenden Projekt …“ | eigener Einstieg „laufendes Projekt mit eingeschränkter Steuerbarkeit“ |
| Unterspur „Bewertung“ → „Stabilisierung“ | k11.2-p2: „Die MVG-Neuinitialisierung beginnt mit einem Lagebild und endet mit einer stabilisierten Entscheidungsarchitektur.“ k7.5-t1 Ergebnisse: „Governance-Lagebild, Neuordnung offener Entscheidungen, …, stabilisierter Regelbetrieb“ | „Governance-Lagebild“ → „Neuordnung offener Entscheidungen“ → „stabilisierter Regelbetrieb“ |
| Pilotierung: „Management-bericht“ | k7.3-t1 Typische Ergebnisse: „Berichte zur Pilotierung, kalibrierte Schwellen, angepasste Routinen, Erkenntnisse, Abnahmevorschlag.“ | „Bericht zur Pilotierung“ |
| Reifegradanalyse: „Lagebild“, „Mandate“, „Datenstand“, „30/60/90 Plan“ | k7.1-t1 Typische Ergebnisse: „Bewertungsmatrix, wichtigste Risiken, Verantwortungslücken, Entscheidungsliste, 30/60/90-Tage-Plan.“ | Ergebnisse nach k7.1-t1; „30/60/90-Tage-Plan“ |

```text
Bild-Prompt V1.3 – abb-11 „Leistungsarchitektur von Bauherr Mentoren“
Aufbau: obere Spur mit fünf Stationen von links nach rechts, durch Pfeile verbunden, je Station Titel und drei Zeilen:
„MVG-Reifegradanalyse“: „Bewertungsmatrix“, „Entscheidungsliste“, „30/60/90-Tage-Plan“.
„MVG-Konzeption“: „Zielsystem“, „Leistungsphasen- und Freigabemodell“, „System der Entscheidungs-IDs“.
„Pilotierung und Kalibrierung“: „echter Entscheidungsfall“, „kalibrierte Schwellen“, „Bericht zur Pilotierung“.
„Befähigung und Übergabe“: „Schulungen“, „Rollenkarten“, „Betriebshandbuch“.
„Regelbetrieb“: „Übernahme der Betriebsverantwortung“.
Untere Spur, deutlich abgesetzt und mit eigenem Einstieg links „laufendes Projekt mit eingeschränkter Steuerbarkeit“,
Titel „MVG-Neuinitialisierung – Sonderformat“: drei Stationen „Governance-Lagebild“ → „Neuordnung offener Entscheidungen“
→ „stabilisierter Regelbetrieb“, gestrichelter Pfeil nach oben in „Regelbetrieb“.
Stil: ruhige, flache Infografik; obere Spur Petrol #146878, „Regelbetrieb“ Grün #349068, untere Spur Navy #0C1C33 hell getönt,
Grund hell #EEF1F5; einfache Linien-Ikonen gleicher Strichstärke; eine serifenlose Schrift (z. B. IBM Plex Sans),
Kontrast mindestens 4,5:1; Beschriftungen als echter Text, exakt wie oben, nichts angeschnitten, keine Silbentrennung,
keine weiteren Wörter, keine englischen Begriffe. Format 16:9 (1920 × 1080).
```

### abb-12 · Abschnitt 7.1 „MVG-Reifegradanalyse“ (k7.1-p1)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Titel „MATURITY ASSESSMENT“ | k7.1-p1: „Die MVG-Reifegradanalyse ist der Einstieg in die neue Leistungsarchitektur.“ | „MVG-Reifegradanalyse“ |
| Skala 0–5 (Zeiger und „Punktwert: 0 … 5“), Werte „0.0“, „1.2“, „2,7“, „4,3“, „3.0“ | k7.1-p2: „… in der Logik Ja = 100, Teilweise = 50 und Nein = 0 auf einer Skala von 0–100.“ | Skala 0–100; keine Beispielwerte |
| Fünf Domänen mit Namen („Governance & Organisation“ … „QA/QM & Qualitätssteuerung“) | k7.1-p2: „… bewertet die 10 MVG-Domänen mit 49 Fragen …“; „Die zehn Domänen sind mitsamt ihren Prüffragen im Erhebungsinstrument der MVG-Reifegradanalyse dokumentiert.“ | zehn Domänen; Namen nicht aus dem Bild, sondern aus dem Erhebungsinstrument (im Whitepaper nicht genannt) |
| Keine Lesart der Werte | k7.1-p2: „Die Lesart lautet: < 55 kritisch, 55–79 mit Lücken, ≥ 80 steuerbar.“ | drei Bänder mit diesen Schwellen |
| Domänen-Beschriftungen „RISK“, „TRNEL“, „OLEE“ (sinnlos), „Frühwarnungs“, „Änderung Requests + Impact“, „Defect-Logik“ | k6.4.2-t1: „Frühwarnungsregister“; k10.5-t1: „verbindliche Auswirkungsbewertung“ | entfällt mit der Neuordnung auf zehn Domänen |
| „Ergebnisse: Heatmap“ | k7.1-p1: „… liefert eine Bewertungsmatrix, Governance-Lücken, eine Entscheidungsliste sowie einen 30/60/90-Tage-Plan.“ | „Bewertungsmatrix“; „Governance-Lücken“ und „Entscheidungsliste“ ergänzen |
| „Roadmap für 30/60/90 Tage“ mit „Fokus: Quick Wins / Stabilisierung / Optimierung“ | k8.2-t1 Fokus: „Diagnose und Priorisierung“ · „Konzeption und Mindeststandard“ · „Modell in Anwendung und Kalibrierung“ | „30/60/90-Tage-Plan“ mit den Fokusangaben aus k8.2-t1 |
| RACI mit „Projektauftraggeber“, „Manager“, „Team“, „A“ in allen drei Zeilen, als Ergebnis der Analyse | k9.2-p4: 13 Arbeitsrollen, „Bauherr/Projektauftraggeber“, „Die Funktion des Projektauftraggebers ist keine zusätzliche Arbeitsrolle“; k7.1-p1 nennt keine RACI als Ergebnis | RACI-Block streichen |

Gestaltung: Dezimaltrennzeichen gemischt (Punkt und Komma); englischer Titel in Versalien.

```text
Bild-Prompt V1.3 – abb-12 „MVG-Reifegradanalyse“
Aufbau: Titel „MVG-Reifegradanalyse“, Untertitel „typischerweise 2–4 Wochen · 10 MVG-Domänen · 49 Fragen“.
Links ein Raster aus zehn gleich großen, leeren Feldern (2 × 5), beschriftet nur „Domäne 1“ bis „Domäne 10“,
darüber die Zeile „Bewertung je Frage: Ja = 100 · Teilweise = 50 · Nein = 0“. Keine Zahlenwerte in den Feldern.
Rechts daneben eine waagerechte Skala „0–100“ mit drei Bändern und Beschriftung:
„< 55 kritisch“ (gedecktes Rot #9A3030), „55–79 mit Lücken“ (gedecktes Gelb #B08820), „≥ 80 steuerbar“ (gedecktes Grün #3A7A43).
Darunter eine Zeile in kleiner Schrift: „Gemessen wird ausschließlich über die 10 Domänen.“
Unten vier Ergebnis-Kacheln mit Pfeil aus dem Raster: „Bewertungsmatrix“, „Governance-Lücken“, „Entscheidungsliste“,
„30/60/90-Tage-Plan“; an der letzten Kachel drei kleine Zeilen:
„0–30 Tage: Diagnose und Priorisierung“, „31–60 Tage: Konzeption und Mindeststandard“,
„61–90 Tage: Modell in Anwendung und Kalibrierung“.
Stil: ruhige, flache Infografik; Rahmen und Köpfe Petrol #146878 und Navy #0C1C33 auf hellen Flächen (#F6F8FB, Weiß),
Ampeltöne nur in den drei Skalenbändern; keine Tachonadel, keine Diagrammkurven; eine serifenlose Schrift
(z. B. IBM Plex Sans), Dezimalzeichen und Zahlen einheitlich deutsch, Kontrast mindestens 4,5:1; Beschriftungen als
echter Text, exakt wie oben, keine erfundenen Domänennamen, Rollen oder Werte, keine Versalien-Titel,
keine englischen Begriffe. Format 16:9 (1920 × 1080).
```

### abb-13 · Kapitel 8 „Implementierung – von Diagnose zu Regelbetrieb“ (k8-p1)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Schritt „Setup“ | k8.1-t1 Vorgehensschritt: „Einrichtung“ | „Einrichtung“ |
| Schritt „Design“ | k8.1-t1: „Konzeption“ | „Konzeption“ |
| Schritt „Pilot“ | k8.1-t1: „Pilotierung und Kalibrierung“ | „Pilotierung und Kalibrierung“ |
| Diagnose: „Gap-Map“ | k8.1-t1 Diagnose, Ergebnisse: „Bewertungsmatrix, Governance-Lücken, wichtigste Risiken, Entscheidungsliste, 30/60/90-Tage-Plan.“ | „Governance-Lücken“ |
| Konzeption: „Freigabe-Set“ | k8.1-t1 Konzeption: „Leistungsphasen- und Freigabemodell“ | „Leistungsphasen- und Freigabemodell“ |
| Befähigung: „Training“ | k8.1-t1 Befähigung, Kernaktivitäten: „Schulungen, Rollenklärungen, Entscheidungsübungen, Regelbetriebslogik.“ | „Schulungen“ |
| Übergabe: „Prüfung-Takt“ | k8.1-t1 Übergabe: „… Prüfrhythmus festlegen.“ | „Prüfrhythmus“ |
| „Betriebsstart“ doppelt (unter Übergabe und unter Regelbetrieb); Regelbetrieb „Abnahmefähig“ | k8.1-t1 Übergabe: Ergebnisse „Betriebshandbuch, Übergabebericht, Betriebsstart.“, Abnahme „Regelbetrieb freigegeben.“ | „Betriebsstart“ nur unter Übergabe; Regelbetrieb „Regelbetrieb freigegeben“ |
| Zeitleiste „0-30 Tage Sichtbarkeit · 31-60 Tage Mindestmodell · 61-90 Tage Anwendung“ unter dem gesamten Vorgehen von der Einrichtung bis zum Regelbetrieb | k8.2-p1: „… sie ist kein allgemeiner Einführungsrhythmus und kein starrer Projektplan.“ k8.2-p5: „… die 30/60/90-Logik priorisiert die ersten Wirkungen nach der Reifegradanalyse.“ | Zeitleiste vom Vorgehen lösen, als eigener Kasten „Orientierungsrahmen nach der MVG-Reifegradanalyse“ |
| Übergabe und Regelbetrieb liegen im Band „61-90 Tage“ | k8.2-p4: „Bis Tag 90 ist das Modell in Anwendung: … der Entwurf des Betriebshandbuchs liegt vor. Die Übergabe schließt an.“ | Übergabe nach Tag 90 |

Die Wörter der Zeitleiste selbst („Sichtbarkeit“, „Mindestmodell“, „Anwendung“) stimmen mit k8.2-p2, k8.2-p3 und k8.2-p4 überein.

```text
Bild-Prompt V1.3 – abb-13 „Sequenziertes Vorgehen“
Aufbau: oben eine Kette aus sechs Spalten mit Pfeilen, je Spalte Titel und zwei bis drei Zeilen:
„Einrichtung“: „verantwortliche Rolle“, „Leistungsumfang“, „Datenzugang“.
„Diagnose“: „Bewertungsmatrix“, „Governance-Lücken“, „Entscheidungsliste“.
„Konzeption“: „Zielsystem“, „Mandatsmodell“, „Leistungsphasen- und Freigabemodell“, „Entscheidungs-IDs“, „Datenstandslogik“.
„Pilotierung und Kalibrierung“: „echte Entscheidungen“, „kalibrierte Schwellen“.
„Befähigung“: „Schulungen“, „Rollenklärungen“, „Routinen“.
„Übergabe“: „Betriebshandbuch“, „Prüfrhythmus“, „Betriebsstart“.
Danach ein grüner Abschluss „Regelbetrieb“ mit der Zeile „Regelbetrieb freigegeben“.
Unten, deutlich getrennt und NICHT unter der Kette ausgerichtet, ein eigener Kasten
„30/60/90-Tage-Logik – Orientierungsrahmen nach der MVG-Reifegradanalyse und im Rahmen einer MVG-Neuinitialisierung,
kein allgemeiner Einführungsrhythmus“ mit drei Segmenten: „0–30 Tage · Sichtbarkeit“, „31–60 Tage · Mindestmodell“,
„61–90 Tage · Modell in Anwendung“ und einem kleinen Hinweis am Ende „Die Übergabe schließt an.“
Stil: ruhige, flache Infografik; Spalten weiß mit Petrol-Kopf #146878, Regelbetrieb Grün #349068, 30/60/90-Kasten Navy #0C1C33
hell getönt, Grund hell #EEF1F5; einfache Linien-Ikonen gleicher Strichstärke; eine serifenlose Schrift (z. B. IBM Plex Sans),
Kontrast mindestens 4,5:1; Beschriftungen als echter Text, exakt wie oben, Halbgeviertstrich in Zeiträumen, keine Silbentrennung,
keine weiteren Wörter, keine englischen Begriffe. Format 16:9 (1920 × 1080).
```

### abb-14 · Kapitel 10 „Anwendungssituationen und Praxislogik“ (k10)
| Grafik zeigt | Text V1.2 sagt (Absatz-ID) | Korrektur |
|---|---|---|
| Mitte „Entscheidungsakte“ | k10.1-p1: „… in klaren Mandaten, Entscheidungsvorlagen, Freigabelogik, Protokollstandard, Vergabeanbindung und belastbar dokumentierten Eskalationen.“ | „Entscheidungsvorlage“ |
| Feld „Driftende Projekte“ | k10.4 (Überschrift): „Projekte mit schleichendem Steuerungsverlust und MVG-Neuinitialisierung“ | „Schleichender Steuerungsverlust“ |
| „Governance-Reset“ | k10.4-p1: „… sondern eine gezielte MVG-Neuinitialisierung“ | „MVG-Neuinitialisierung“ |
| „Lagebild ordnen“ | k10.4-p1: „Datenstand sichern, Entscheidungslandschaft ordnen, Mandate klären, erforderliche Freigaben nachholen oder wiederholen …“ | „Datenstand sichern“, „Entscheidungslandschaft ordnen“ |
| „Long Lead“ | k10.3-p1: „… Entscheidungen zu Komponenten mit langer Lieferzeit …“ | „Komponenten mit langer Lieferzeit“ |
| „Freigabe-Readiness“ | k10.3-p1: „… sowie die Freigabereife zum Abschluss von LPH 2 …, von LPH 3 … und von LPH 7 …“ | „Freigabereife LPH 2, 3 und 7“ |
| „Nachweisfestigkeit“, „Gremienlogik“ | k10.1-p1: „Öffentliche Bauherren stehen häufig unter hoher Nachweis-, Gremien- und Vergabekomplexität.“ | „Nachweiskomplexität“, „Gremienkomplexität“ (oder Kacheln „Protokollstandard“, „Mandate“ aus k10.1-p1) |
| „Private / Institutionelle“, „Energie / Infrastruktur“ | k10.2 und k10.3 (Überschriften): „Private und institutionelle Bauherren“, „Energieversorger und Infrastrukturträger“ | Überschriften des Texts |

Gestaltung: Mittelkreis „Governance-Kern“ ist kein Begriff des Texts; Brückenmotive zwischen den Feldern.

```text
Bild-Prompt V1.3 – abb-14 „Anwendungssituationen“
Aufbau: vier gleich große Felder um einen Kreis in der Mitte, schlichte Pfeile von jedem Feld zum Kreis.
Kreis: Titel „MVG“, darunter drei Zeilen „Entscheidungsvorlage“, „Freigabelogik“, „Eskalation“.
Feld oben links „Öffentliche Bauherren“: „Nachweiskomplexität“, „Gremienkomplexität“, „Vergabeanbindung“.
Feld oben rechts „Private und institutionelle Bauherren“: „Geschwindigkeit“, „Zielkonflikte“, „Entscheidungssicherheit“.
Feld unten links „Energieversorger und Infrastrukturträger“: „Priorisierung“, „Komponenten mit langer Lieferzeit“,
„Freigabereife LPH 2, 3 und 7“.
Feld unten rechts „Schleichender Steuerungsverlust“: kleine Kette „Datenstand sichern“ → „Entscheidungslandschaft ordnen“
→ „Mandate klären“ → „MVG-Neuinitialisierung“.
Stil: ruhige, flache Infografik; Felder weiß mit Petrol-Kopf #146878, Kreis Navy #0C1C33 mit weißer Schrift,
Grund hell #EEF1F5; einfache Linien-Ikonen gleicher Strichstärke; eine serifenlose Schrift (z. B. IBM Plex Sans),
Kontrast mindestens 4,5:1; Beschriftungen als echter Text, exakt wie oben, keine Silbentrennung, keine weiteren Wörter,
keine englischen Begriffe, keine Brücken- oder Tormotive. Format 16:9 (1920 × 1080).
```

### Logos image1 (Titel) und image15 (Fußzeile)
Keine Abbildung mit Textbezug, daher ohne Widerspruchstabelle und ohne Bild-Prompt.
- **image1:** weiße Bildmarke mit Schriftzug „BAUHERR MENTOREN“ auf transparentem Grund, nur als PNG (698 × 937). Das Repo hat eine selbst vektorisierte Fassung (`quellen/marke/logo-bm.svg`, `logo-bm-bildmarke.svg`, erzeugt aus `logo-original.png`); für V1.3 die Original-SVG vom Owner erbitten.
- **image15:** dieselbe Marke weiß auf vollflächigem Blau #0070C0, klein (216 × 273). #0070C0 ist das Standardblau von Office und kein Markenfarbton von Bauherr Mentoren (Markenfarben laut docs/STIL.md: Navy #0C1C33, Gold #A8823C). Vorschlag: durch die SVG-Marke auf Navy oder auf hellem Grund ersetzen.

## Zusammenfassung
| Abschnitt | Einträge |
|---|---|
| Text | 8 (2 aus dem Bau, 4 aus L-14, 2 beim Nachschlagen gefunden) |
| Abbildungen – Widersprüche Grafik ↔ Text | 90 in 13 Abbildungen: abb-2 4 · abb-3 4 · abb-4 2 · abb-5 6 · abb-6 10 · abb-7 6 · abb-8 5 · abb-9 6 · abb-10 12 · abb-11 9 · abb-12 8 · abb-13 10 · abb-14 8 (Zeilen der Tabellen) |
| Bild-Prompts V1.3 | 13 (abb-2 … abb-14) |
| Logos | 2 (image1, image15) |
| Verworfene Analyse-Aussagen | 5 (abb-3 1 · abb-8 2 · abb-10 2, siehe unten) |

**Die drei wichtigsten Korrekturen** (alle im Text belegt):
1. **abb-12 Reifegradanalyse** – Das Bild zeigt eine andere Methode als der Text: Skala 0–5 statt 0–100, fünf erfundene Domänen statt zehn, keine Lesart statt „< 55 kritisch, 55–79 mit Lücken, ≥ 80 steuerbar“ (k7.1-p2), andere Ergebnisse als in k7.1-p1 und eine Rolle „Manager“, die das Rollenmodell k9.2-p4 nicht kennt. Nicht weiterverwenden.
2. **abb-10 Governance-Fluss** – Freigabe mit alter Stufenbezeichnung und zweiwertigem Ergebnis statt „Freigabe / keine Freigabe / Freigabe mit Auflagen“ (k6.4.4-p1); ein Pfeil vom Risiko zurück zur Frühwarnung, den k6.4.3-p2 ausdrücklich ausschließt; die Schwellenwert-Kante zeigt in die CTC statt aus ihr heraus (k6.4.3-p2).
3. **abb-13 Implementierung** – Die 30/60/90-Zeitleiste liegt unter dem ganzen Vorgehen, obwohl k8.2-p1 sie als „kein allgemeiner Einführungsrhythmus“ bestimmt und k8.2-p4 die Übergabe erst nach Tag 90 anschließt; drei Schrittnamen weichen von k8.1-t1 ab (Einrichtung, Konzeption, Pilotierung und Kalibrierung).

**Verworfene Aussagen der Analyse** (`docs/recherche/grafiken-analyse.md`):
- abb-3 „5 Symptome statt 8“: Das Bild folgt den fünf Grauzonen aus k2-p2, nicht der Tabelle k2.5-t1.
- abb-8 „LPH 0 ist nicht das Hauptnarrativ“: k5.4-p1 meint das Whitepaper; das Bild steht in 5.4 und darf LPH 0 in die Mitte stellen.
- abb-8 „mehrere A in der RACI“: je Zeile höchstens ein A; eine Regel „ein A“ steht nicht im Text.
- abb-10 „Freigabe folgt auf jede Entscheidungsvorlage“: Der Fluss k6.4.3-p1 setzt die Freigabe selbst hinter die Entscheidung; nur die Beschriftung widerspricht.
- abb-10 „zeigt nur 6.4.3“: eine Auswahl, kein Widerspruch.

Kontrollhinweis: `npm run begriffe` prüft diese Datei nicht (Ausnahme in `werkzeuge/begriffe.json`); alte Begriffe stehen trotzdem nur in der Spalte „Grafik zeigt“.
