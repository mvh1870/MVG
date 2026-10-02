# Drehbuch – Stationsgerüst (P1.3)

Grundlagen: `docs/BAUPLAN.md` Abschnitt 3 (Dramaturgie), `inhalte/fall.md` (Fall-Bibel: Zahlen, Zeitachse, Gremien, Figuren), `ENTSCHEIDE.md`. Die Entscheidungen je Station und Rolle, ihre Optionen, Konsequenzen und die Enden-Logik legt P1.4 als Inhaltsdateien fest; dieses Gerüst sagt, **was** an jeder Station geschieht, **welches Kapitel** es trägt, **wie sich der Status** in Welt A und Welt B bewegt und **wie lange** es dauert.

Fiktiver Fall (O-3). Story frei formuliert; jede MVG-Regel, die eine Station zeigt, stammt aus dem genannten Kapitel (O-17).

## 1 Übersicht

Maschinenlesbar: Der Test `tests/drehbuch.test.ts` liest diese Tabelle. Er prüft Hauptpfad 25–35 Min, Express 11–13 Min, alle 13 Kapitel berührt, Monat und LPH gegen die Zeitachse der Fall-Bibel (`lph-stand`) und die Statuswerte gegen `docs/INHALTSFORMAT.md` 2.7. Status in der Reihenfolge **Entscheidungsfähigkeit (0–5) · Kostenunsicherheit · offene Risiken · ungeklärte Entscheidungen · Terminrisiko**, jeweils als `status-start` der Station; „–“ = die Station setzt keinen Startstand (Prolog, Wendepunkt, Rückspulen, Ausgang und Epilog zeigen keinen Statusbereich; die Wirklichkeit übernimmt den Stand von Welt A nach A6).

<!-- stationen:anfang -->
| ID | Art | Monat | LPH | Ereignis | Kapitel | Status A | Status B | Min | Express |
|---|---|---|---|---|---|---|---|---|---|
| prolog | prolog | 0 | 4 | Sie übernehmen das Projekt; Rolle und Interessen wählen | 1 | – | – | 1,5 | 1 |
| A1 | station | 1 | 4 | Übernahme ohne Übergabe: Kämmerei will bis Freitag den Haushaltsansatz 2027, Preisannahme unbekannt; Zielkonflikt nie priorisiert | 2.1, 2.2, 2.3 | 3 · mittel · 4 · 1 · niedrig | – | 1,5 | 0 |
| A2 | station | 3 | 5 | Zusage im Flur, Frist im Förderbescheid: größere Mensa per Flurzusage; Förderfrist Schuljahr 2028/29, Lieferzeit Holzbauelemente 16 → 26 Wochen | 4.1, 4.2 | 3 · mittel · 5 · 2 · mittel | – | 1,5 | 0 |
| A3 | station | 5 | 5 | Kosten +8 % gegen +5,9 %; Information noch nicht verfügbar | 2.4, 4.6 | 2 · hoch · 7 · 3 · mittel | – | 1,5 | 1,5 |
| A4 | station | 7 | 5 | Bauausschuss vertagt: 40-Seiten-Bericht ohne Entscheidungsfrage | 2.5, 4.3 | 1 · hoch · 8 · 5 · hoch | – | 1,5 | 0 |
| A5 | station | 9 | 5 | Folgekosten: Brandschutzauflagen, Mensa-Umplanung, Nachträge der Generalplanung und der TGA-Fachplanung; Reserve ohne Freigabe verbraucht | 4.4, 4.5 | 1 · sehr hoch · 9 · 6 · hoch | – | 1,5 | 0 |
| A6 | station | 11 | 5 | Eskalation: Freigabe zum Abschluss von LPH 5 steht an, Schlüsselperson fällt aus, Stadtrat fragt | 2.3, 2.5 | 0 · sehr hoch · 10 · 7 · sehr hoch | – | 1,5 | 1,5 |
| wendepunkt | wendepunkt | – | – | Ursachenanalyse: Symptom-Radar, Wirkungsketten, Mandatsschwellen, Pyramide, sechs Felder | 2.5, 3.1, 3.2, 3.3, 4, 4.2 | – | – | 3 | 2 |
| rueckspulen | rueckspulen | 0 | 4 | Zurück auf Monat 0: die acht Bausteine setzen sich zusammen; LPH 0 als früher Hebel | 5, 5.1, 5.2, 5.4 | – | – | 1 | 0,5 |
| B1 | station | 1 | 4 | Dieselbe Übernahme mit Zielsystem, Mandatsleiter, Rhythmus und Registern: die Frage der Kämmerei ist beantwortbar | 4.2, 5.3, 6.1, 6.4.1, 6.4.2, 6.4.5, 9.1, 9.2 | – | 4 · mittel · 4 · 1 · niedrig | 2 | 0 |
| B2 | station | 3 | 5 | Dieselbe Zusage und Frist: Lieferzeit als Frühwarnung FRW-002, Mensa als Änderung AEN-012 | 6.4.3, 6.4.4, 4.2 | – | 3 · mittel · 5 · 2 · mittel | 2 | 0 |
| B3 | station | 5 | 5 | Dieselbe Abweichung: ein Datenstand, Mandat nach Option, ENT-017 | 2.4, 4.2, 4.6, 6.3, 6.4.3, 6.4.4, 9.4 | – | 3 · mittel · 7 · 1 · mittel | 2 | 2 |
| B4 | station | 7 | 5 | Ausschussreif: Änderungsgremium beschließt AEN-031 (Brandschutzauflagen) mit Vorlage; Managementbericht an den Bauausschuss | 4.3, 6.4.1, 6.4.5, 9.4 | – | 3 · mittel · 7 · 2 · mittel | 2 | 0 |
| B5 | station | 9 | 5 | Folgekosten mit Problemregister; Freigabe des Einsatzes der Risikoreserve beim Bauherrn | 3.2, 4.4, 4.5, 6.4.4, 6.4.5 | – | 3 · mittel · 6 · 2 · mittel | 2 | 0 |
| B6 | station | 11 | 5 | Freigabe zum Abschluss von LPH 5 mit Kernfrage und Mindestgrundlagen; Stellvertretung und Nachweis tragen | 2.3, 4.2, 6.4.1, 6.4.5, 9.3, 9.5 | – | 3 · mittel · 5 · 2 · mittel | 2 | 2 |
| wirklichkeit | wirklichkeit | 12 | 5 | Zurück in Welt A: MVG-Neuinitialisierung, 30/60/90 als Zeitachse, Weg Diagnose → Regelbetrieb, Mitwirkung und Abnahme | 11, 8.1, 8.2, 8.3, 8.4, 7 | – | – | 2,5 | 1 |
| ausgang | ende | – | – | Drei Enden; Zielbild, Rückbezug auf Ihre Spur, Nachweiskette zum Anfassen | 9, 12 | – | – | 1,5 | 0,5 |
| epilog | epilog | – | – | Ihr Projekt: Selbstdiagnose (qualitativ), Anwendungssituationen, persönliches Resümee, Bibliothek mit Glossar | 10, 7.1, 13 | – | – | 2 | 0 |
<!-- stationen:ende -->

Summe Hauptpfad 32,5 Min (Bandbreite 25–35), Express 12 Min. Der Test rechnet beides nach.

Der Vergleich `A3-B3-vergleich` aus dem Durchstich (P0.6) ist mit dem Umzug P5.10 entfallen (L-45); den Schieberegler tragen die Vergleichsschritte der B-Stationen (P5.2).

## 2 Pfade

- **Hauptpfad:** prolog → A1 → … → A6 → wendepunkt → rueckspulen → B1 → … → B6 → wirklichkeit → ausgang → epilog. Welt B wird erst im Rückspulen freigeschaltet (Graph-Prüfer, `docs/INHALTSFORMAT.md`). Ab B1 steht an jeder B-Station der Schieberegler A↔B; die Rückbezüge („Damals haben Sie …“) greifen auf die Wahl der Partnerstation in Welt A zu.
- **Express (E8, ~12 Min, für die Geschäftsführung; umgesetzt als Interesse „express“ im Prolog mit bedingten Kanten, L-26):** prolog → A3 → A6 → wendepunkt (kurz) → rueckspulen → B3 → B6 → wirklichkeit (kurz) → ausgang. Was an A1, A2, A4, A5, B1, B2, B4 und B5 geschieht, steht als Karte „Was dazwischen geschah“ (ein bis zwei Sätze, ohne Entscheidung) am Anfang der nächsten Express-Station und ist in deren Minuten eingerechnet; der Epilog ist im Express optional (0 Min; Explore ist mit dem Ende frei, L-49). Über die Story-Karte kann man jederzeit abzweigen.
- **Standpunkt wechseln:** an jeder Station mit Entscheidung; die Station bleibt, die Rolle wechselt (P2.2).

## 3 Stationen

Figuren nach der Fall-Bibel; Rollen mit den Kennungen der Inhaltsdateien: `gf` (Geschäftsführung), `bauherr` (Bauherr), `pl` (Bauherren-PL), `ps` (Projektsteuerung), `planung` (Planung), `controlling` (Controlling).

### Prolog · Übernahme (Monat 0, LPH 4)
Sie übernehmen das Projekt – in der gewählten Rolle; Leitthese aus Kap. 1 als ruhiger Einstieg. Rollenwahl (sechs Rollen, O-4), Interessenwahl steuert Vertiefungen. Kein Statusbereich, keine Story-Karte (L-4).

### A1 · Übernahme ohne Übergabe (Monat 1, LPH 4)
**Ereignis:** Erste Woche, aus Bauherrensicht (O-28): Die Vorgängerin ist weg, übergeben sind drei Ablagen. Die Kämmerei braucht bis Freitag den Haushaltsansatz 2027 (Mittelabfluss, Kostenobergrenze) und fragt, ob Baupreissteigerungen eingepreist sind; Dr. Olbers fragt, welche Zahl der Stadtrat zuletzt gehört hat. Der Zielkonflikt (Kosten, Schuljahresbeginn 2028, Holzbau als Klimaziel des Rats, Betriebskosten/LCC) ist nie priorisiert; die Kostendatei pflegt Holger Stein allein. Projektsteuerung schickt den 40-Seiten-Bericht, Planung verweist auf die Kostenberechnung LPH 3, Controlling hat eine eigene Zahl – keiner beantwortet die Frage der Kämmerei. Der Bauantrag geht raus. **Kapitel:** 2.1–2.3 (volatile Märkte, Komplexität durch ESG/LCC und Nachweislogik, Wissen in Schlüsselrollen). **Entscheidungsmoment:** Was tun Sie mit der Frage der Kämmerei – und worauf richten Sie die ersten Wochen aus? (je Rolle eigener Blick; Details P1.4). **Status A:** Startstand 3 · mittel · 4 · 1 · niedrig. **Tendenz:** unauffällig – das ist der Punkt.

### A2 · Zusage im Flur, Frist im Förderbescheid (Monat 3, LPH 5)
**Ereignis:** Sabine Roth schreibt für Schulleitung und Schulverwaltung: Der Ganztag braucht eine Mensa für rund 450 statt 300 Essen, grob 0,6 Mio. €; Deppe hat im Flur schon „machen wir“ gesagt. Der Förderbescheid Ganztag (fiktiv) verlangt die Inbetriebnahme zum Schuljahr 2028/29 – und auf Ihre Nachfrage meldet die Generalplanung 26 statt 16 Wochen Lieferzeit für die Holzbauelemente: Terminrisiko für die Förderfrist. **Kapitel:** 4.1 Ziel, 4.2 Mandat. **Entscheidungsmoment:** Zusage bestätigen, prüfen lassen, eskalieren – und wer darf das? **Status A:** 3 · mittel · 5 · 2 · mittel. **Tendenz:** ein Risiko mehr, eine ungeklärte Entscheidung mehr.

### A3 · Kosten +8 % (Monat 5, LPH 5) – steht (Durchstich)
**Ereignis:** Montag, 11. Mai, 08:30 Uhr: Brenner +8 % (rund 4,7 Mio. €), Kaya +5,9 %. Lenkungskreis am 19., Bauausschuss am 21. Mai. „Information noch nicht verfügbar“; anfordern kostet zwei Wochen. **Kapitel:** 2.4, 4.6. **Entscheidung:** Optionen A–D (bestehend für PL; übrige Rollen P3.4). **Status A:** 2 · hoch · 7 · 3 · mittel.

### A4 · Ausschuss vertagt (Monat 7, LPH 5)
**Ereignis:** Donnerstag im Juli, Bauausschuss. Vorlage: der monatliche Statusbericht, 40 Seiten, Ampeln auf Gelb und Rot, keine Entscheidungsfrage. Kowalski fragt zweimal, worüber der Ausschuss entscheiden soll. Vertagt. **Kapitel:** 2.5 (Symptome), 4.3 (wesentliche Entscheidung). **Entscheidungsmoment:** Was nehmen Sie aus der Sitzung mit – und was legen Sie beim nächsten Mal vor? **Status A:** 1 · hoch · 8 · 5 · hoch. **Tendenz:** Entscheidungsstau wird sichtbar.

### A5 · Folgekosten (Monat 9, LPH 5)
**Ereignis:** Die Baugenehmigung (Monat 6) brachte Brandschutzauflagen zum Holzbau, grob 0,4 Mio. €; die Mensa wurde informell umgeplant, die Generalplanung meldet einen Nachtrag zur Mensa-Umplanung, der Nachtrag der TGA-Fachplanung liegt vor. Kaya stellt fest: Die Risikoreserve ist zu einem guten Teil schon verplant – freigegeben hat das niemand. **Kapitel:** 4.4 Risikoannahme, 4.5 Freigabe. **Entscheidungsmoment:** Reserve nachträglich legitimieren, Kosten verschieben, offenlegen? **Status A:** 1 · sehr hoch · 9 · 6 · hoch.

### A6 · Eskalation (Monat 11, LPH 5)
**Ereignis:** Die Freigabe zum Abschluss von LPH 5 steht an. Holger Stein fällt für Wochen aus; seine Excel-Stände versteht niemand vollständig. Eine Fraktion im Stadtrat fragt nach Kosten und Termin; Olbers braucht bis Freitag eine Antwort. **Kapitel:** 2.3 (Wissensverlust, Schlüsselrollen), 2.5. **Entscheidungsmoment:** Freigabe beantragen, verschieben, oder die Lage offen auf den Tisch legen? **Status A:** 0 · sehr hoch · 10 · 7 · sehr hoch. Danach: „Was ist hier eigentlich passiert?“

### Wendepunkt · Ursachenanalyse (ohne Monat)
**Ereignis:** Die Welt A steht still; der Leser sieht auf die eigene Spur. **Bausteine:** Symptom-Radar mit den erlebten Symptomen (Kap. 2.5), „Was passiert, wenn …?“-Wirkungsketten, Mandatsschwellen-Spiel (delegierbar / nicht delegierbar, Kap. 3.2; Schwellen der Mandatsleiter, Kap. 4.2), Verantwortungspyramide (Kap. 3.3), sechs Verantwortungsfelder Chaos → Ordnung (Kap. 4). **Kapitel:** 2.5, 3.1–3.3, 4, 4.2. **Kein Status**, keine Wertung der Spielerwahl.

### Rückspulen (zurück auf Monat 0, LPH 4)
**Ereignis:** Die Zeitleiste läuft zurück. Die acht Bausteine des Bauherren-Führungsmodells (Kap. 5.2) setzen sich zusammen; LPH 0 wird als früher Hebel gezeigt (Kap. 5.4) – der Fall selbst steht in LPH 4; MVG ist nicht auf LPH 0 beschränkt (Kap. 5.4). Gedankenexperiment: MVG steht bei Ihrer Übernahme bereits (keine Aussage über die Dauer einer Einführung). Schaltet Welt B frei. **Kapitel:** 5, 5.1, 5.2, 5.4.

### B1 · Übernahme ohne Übergabe – mit MVG (Monat 1, LPH 4)
**Ereignis:** Dieselbe erste Woche, dieselbe Frist der Kämmerei. Diesmal ist sie beantwortbar: Der Ansatz kommt aus dem benannten Datenstand „Kostenprognose 2026-01 · Version 1“, die fehlende Preissteigerung steht darin als offene Annahme. Dazu: angelegtes Zielsystem mit Abwägungsregeln (die Zielpriorität legt der Bauherr in B1 fest, L-35), Mandatsleiter nach k4.2-p3, Rhythmus und Registerpflege nach k6.4.2/6.4.5 im MVG Companion (Funktionslogiken Kap. 6.1; der Companion ist ein Arbeitsmittel, das Führungsmodell trägt auch ohne ihn, k6.3-p3), RACI mit Mandat (Kap. 9.2). **Kapitel:** 4.2, 5.3, 6.1, 6.4.1, 6.4.2, 6.4.5, 9.1, 9.2. **Status B:** 4 · mittel · 4 · 1 · niedrig. Schieberegler A↔B ab hier.

### B2 · Zusage im Flur, Frist im Förderbescheid – mit MVG (Monat 3, LPH 5)
**Ereignis:** Dieselbe Flurzusage, dieselbe Förderfrist. Die Lieferzeit wird als Frühwarnung `FRW-002` erfasst, aber noch nicht bestätigt; erst nach Bestätigung wird sie Risiko `RIS-009` (Kap. 6.4.3, 6.4.4). Der Mensa-Wunsch steht als Änderung `AEN-012` mit Status „Beantragt“ im Änderungsregister, nächster Schritt Auswirkung und Freigabeweg – rund 0,6 Mio. € liegen über 100 TEUR, also Änderungsgremium. Die Flurzusage wird zur beantragten Änderung. **Kapitel:** 6.4.3, 6.4.4, 4.2. **Status B:** 3 · mittel · 5 · 2 · mittel (dasselbe Ereignis, dasselbe Terminrisiko – der Unterschied liegt im Umgang). Bestätigung und Bewertung lösen erst die Optionen aus (L-36).

### B3 · Dieselbe Abweichung – mit MVG (Monat 5, LPH 5) – steht (Durchstich)
**Ereignis:** Derselbe Montag. Ein Datenstand („Kostenprognose 2026-05 · Version 3“), Mandat hängt von der Option ab, Entscheidungsvorlage `ENT-017`. **Kapitel:** 2.4, 4.2 (Mandatsleiter), 4.6 und 6.3 (Datenstand), 6.4.3, 6.4.4, 9.4. **Status B:** 3 · mittel · 7 · 1 · mittel.

### B4 · Ausschussreif (Monat 7, LPH 5)
**Ereignis:** Die Baugenehmigung (Monat 6) brachte Brandschutzauflagen zum Holzbau, grob 0,4 Mio. €; die nötige Planänderung steht als `AEN-031` im Änderungsregister. Der Leser sitzt im Änderungsgremium (E3) und beschließt mit der Vorlage; die Beschlusslage wird dokumentiert (Mensa `AEN-012` und `AEN-022` sind zu diesem Zeitpunkt entschieden). Soll die Deckung aus der Risikoreserve kommen, bleibt die Freigabe dieses Einsatzes beim Bauherrn (k3.2-t1) – das Thema von B5. Der Bauausschuss bekommt den Managementbericht als Sammelpunkt (Kap. 6.4.1) mit klarer Beschlussvorbereitung – diesmal wird nicht vertagt, oder die Vertagung hat eine Frist und eine Frage. **Kapitel:** 4.3, 6.4.1, 6.4.5, 9.4. **Status B:** 3 · mittel · 7 · 2 · mittel.

### B5 · Folgekosten – mit MVG (Monat 9, LPH 5)
**Ereignis:** Der in Monat 5 angekündigte Nachtrag der TGA-Fachplanung ist eingetreten und steht als Problem `PRB-004` im Problemregister, mit Maßnahme und – weil er die Reserve berührt – Entscheidungsbedarf (die Mensa-Kosten stehen dagegen in der Auswirkung von `AEN-012`). Der Einsatz der Risikoreserve braucht die Freigabe des Bauherrn (nicht delegierbar, Kap. 3.2) – Olbers entscheidet auf Vorlage. **Kapitel:** 3.2, 4.4, 4.5, 6.4.4, 6.4.5. **Status B:** 3 · mittel · 6 · 2 · mittel.

### B6 · Freigabe zum Abschluss von LPH 5 (Monat 11, LPH 5)
**Ereignis:** Die Freigabe beruht auf Kernfrage, Mindestgrundlagen, Mandat, Datenstand und dokumentiertem Ergebnis (Kap. 9.3); der Bauherr erteilt sie selbst auf Vorlage der Bauherren-PL, der Lenkungskreis berät. Holger Stein fällt auch hier aus – Register, Datenstand („Kostenprognose 2026-10 · Version 4“, L-42) und eine benannte Stellvertretung (Kap. 4.2, 2.3) tragen; das Wissen liegt nicht nur in einem Kopf, sondern auf dem Weg ins Betriebshandbuch (Kap. 9.5). Die Stadtratsanfrage wird aus dem Managementbericht beantwortet (Kap. 6.4.1). Ergebnis: Freigabe, keine Freigabe oder Freigabe mit Auflagen. **Kapitel:** 2.3, 4.2, 6.4.1, 6.4.5, 9.3, 9.5. **Status B:** 3 · mittel · 5 · 2 · mittel.

### Wirklichkeit · Zurück in Welt A (Monat 12, LPH 5)
**Ereignis:** „Welt B war ein Gedankenexperiment.“ Das Projekt steht in Welt A, Monat 12. Was jetzt? MVG-Neuinitialisierung (Kap. 11), die 30/60/90-Tage-Logik als schiebbare Zeitachse (Kap. 8.2 – Orientierungsrahmen, kein allgemeiner Einführungsrhythmus), der Weg Diagnose → Regelbetrieb (Kap. 7, 8.1), Mitwirkung des Bauherrn und Abnahmelogik (Kap. 8.3, 8.4). **Status A:** kein `status-start` – die Station übernimmt den Stand nach Ihrer Wahl in A6 (Startstand von A6: 0 · sehr hoch · 10 · 7 · sehr hoch). Für P1.4: keine Option in A6 schließt LPH 5 ab; in Monat 12 steht das Projekt weiter in LPH 5. Für P2.1 (L-19): Eine Station ohne `status-start` übernimmt den laufenden Stand ihrer Welt (`welt: A`); die Engine muss das können, `docs/INHALTSFORMAT.md` 2.7 wird dann ergänzt. Kein Vertrieb (O-1): die Leistungsarchitektur wird erklärt, nicht angeboten.

### Ausgang · drei Enden
Umsetzung (L-20): drei Stationen `ende-steuerbar`, `ende-auflagen`, `ende-neufestlegung`, erreicht über bedingte Kanten der Wirklichkeit; alle führen zum Epilog.

**Ereignis:** Eines von drei Enden (O-7): **steuerbar übergeben** – das Bauherren-Führungsmodell wird übergeben (ein Befähigungsschritt, keine Freigabe, k9.3-p2); das Projekt läuft steuerbar in LPH 5 weiter – gemeint ist nicht die Übergabe des Vorhabens (LPH 9) · **Freigabe mit Auflagen** – der Bauherr erteilt die Freigabe zum Abschluss von LPH 5 mit Auflagen (k6.4.4-p1) · **Neufestlegung der Projektbasis** – Sonderformat außerhalb der regulären Freigabereihe, über eine Entscheidungsvorlage vorbereitet und vom Bauherrn im Lenkungskreis beschlossen (Glossar, docs/BEGRIFFE.md). Welches Ende eintritt, hängt von der Spur ab (Enden-Logik P1.4). Danach Zielbild (Kap. 9, 12), Rückbezug auf Ihre Spur (E1) und die Nachweiskette zum Anfassen (E2). **Kapitel:** 9, 12.

### Epilog · Ihr Projekt
**Ereignis:** Selbstdiagnose qualitativ, ohne Punktzahl (O-8; die Reifegradanalyse aus Kap. 7.1 nur als Methode), Anwendungssituationen „Wie sähe das bei Ihnen aus?“ – die drei Bauherrentypen aus Kap. 10.1–10.3 und das Projekt mit schleichendem Steuerungsverlust aus Kap. 10.4, persönliches Resümee (drei Prinzipien, zwei Vertiefungen, eine Checkliste), Bibliothek mit Glossar (Kap. 13). **Kapitel:** 10, 7.1, 13.

## 4 Statusverlauf

Welt A (Startstände A1–A6) verliert Entscheidungsfähigkeit von 3 auf 0; Kostenunsicherheit steigt von mittel auf sehr hoch; offene Risiken 4 → 10; ungeklärte Entscheidungen 1 → 7; Terminrisiko niedrig → sehr hoch. Welt B hält die Entscheidungsfähigkeit bei 3–4 (B1 4), die ungeklärten Entscheidungen bei 1–2, jeweils mit Frist, die Risiken steigen bis B3 und sinken danach, weil sie bewertet und gemindert werden. Beide Welten erleben dieselben Ereignisse; der Unterschied ist der Umgang. Die Werte sind `status-start` je Station; die Wahl des Lesers verschiebt sie innerhalb der Station (P1.4).

## 5 Kapitel ↔ Stationen

| Kapitel | Stationen |
|---|---|
| 1 Kurzfassung | prolog |
| 2 Ausgangslage und Kernproblem | A1, A3, A4, A6, wendepunkt, B3, B6 |
| 3 Begriffsrahmen | wendepunkt, B5 |
| 4 Verantwortungsfelder | A2, A3, A4, A5, wendepunkt, B1, B2, B3, B4, B5, B6 |
| 5 MVG als Bauherren-Führungsmodell | rueckspulen, B1 |
| 6 MVG Companion | B1, B2, B3, B4, B5, B6 |
| 7 Leistungsarchitektur | wirklichkeit, epilog |
| 8 Implementierung | wirklichkeit |
| 9 Ergebnisbild und Ergebnisse | B1, B3, B4, B6, ausgang |
| 10 Anwendungssituationen | epilog |
| 11 MVG-Neuinitialisierung | wirklichkeit |
| 12 Was Bauherren gewinnen | ausgang |
| 13 Glossar | epilog (und als Mouseover an jeder Station) |
