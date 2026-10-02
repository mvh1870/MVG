# Drehbuch der Story (P16.5, O-40)

Eine durchgehende Geschichte in der Arbeitsweise nach dem Standard „Aufgaben- und Risikomanagement V2.4“ (O-36): acht Stationen von Januar 2026 (LPH 4) bis Januar 2028 (LPH 8), Ende im August 2028 mit dem Schulstart (Übergabe, Beginn LPH 9 – die Zeichnung zeigt dort den fertigen Campus). Keine zweite Welt, keine Rollenwahl, ein Ende. Der Fall bleibt der fiktive Schulcampus Lindenhall-Süd (O-50); Zahlen, Zeitachse und Figuren stehen in `inhalte/fall.md` (internes Nachschlagewerk, wird nicht kompiliert).

## Leser und Rollen

- **Sie** vertreten den Bauherrn: Der Prolog führt einmal „Projektleitung auf Bauherrenseite (Bauherren-PL)“ bei der GML ein, danach heißt es „Bauherren-PL“ oder „Sie“. Sie pflegen kein Register. Sie entscheiden nach Mandat – oder Sie tragen die Vorlage dorthin, wo nach Mandat entschieden wird (Bauherr mit Dr. Miriam Olbers, der Lenkungskreis berät; Änderungsgremium unter Frank Deppe, Geschäftsführer der GML). Jede Vorlage nennt die **befugte Stelle**.
- **Jonas Brenner (Projektsteuerung)** bearbeitet und pflegt alle Vorgangsarten in der Software der GML (Aufgaben, Maßnahmen, Frühwarnungen, Risiken, Probleme, Änderungen), prüft wöchentlich den offenen Bestand, meldet Dringliches sofort, bereitet jede erforderliche Handlungsentscheidung als **Entscheidungsvorlage mit mindestens zwei zulässigen Optionen und MCDA** vor, dokumentiert den Beschluss getrennt und verfolgt Umsetzung und Wirkung (V2.4 Handbuch 1, 3.1, 4, 5; TLB 2). Er entscheidet nie selbst, beauftragt keine Gutachten (das tut die GML gesondert) und fordert Fachbeiträge bei den Beteiligten an.
- Weitere Figuren: Aylin Kaya (Controlling der GML), Lena Hoffmeister (Generalplanung), Dr. Miriam Olbers (Dezernentin, Stimme des Bauherrn), Frank Deppe (Geschäftsführer der GML, Vorsitz Änderungsgremium), Holger Stein (Kostenplaner der Generalplanung; die Projektsteuerung fordert seine Kostenberechnung an und plausibilisiert sie, Fachplanung macht sie nicht), Sabine Roth (Nutzervertretung), Bernd Kowalski (Bauausschuss), Nora Petersen (Projektassistenz der GML, pflegt keine Vorgänge).
- **Mandat** (Muster-Mandatsleiter): Bauherren-PL bis einschließlich 100 TEUR; Änderungsgremium über 100 TEUR bis einschließlich 5 Mio. €; darüber der Bauherr im Lenkungskreis. Den Einsatz der Risikoreserve und die Freigabe am Ende einer Leistungsphase gibt der Bauherr selbst frei (nicht delegierbar). Eine neue Projektbasis beschließt der Bauherr im Lenkungskreis (Dr. Olbers) auf Vorlage der Projektsteuerung, wie im Glossar; weil die Stadt die Mittel bewilligt, lässt die GML den Beschluss vom Stadtrat bestätigen (s5, s7, s8). Weicht eine Option von einem Ratsbeschluss ab (s3 C, weniger Holz als im Klimaziel), nennt die Vorlage den zusätzlichen Beschluss des Bauherrn. Wo der Bauherr selbst entscheidet (Freigabe, Reserve, Umgang mit der Prognose), fragt die Story: „Wie soll der Bauherr entscheiden? Ihre Empfehlung geht an Dr. Olbers.“
- **Projektblatt:** vor der Beauftragung der Projektsteuerung von der GML festgelegt (Bewertungsgrenzen, Entscheidungsschwellen); die Projektsteuerung bringt in Station 1 nur die MCDA-Gewichte zur Abstimmung.

## Takt, den die Story zeigt

Wöchentlich prüft die Projektsteuerung alle offenen Vorgänge; Dringliches meldet sie sofort und dokumentiert es am selben Arbeitstag. Einmal im Monat gibt es einen Online-Termin von höchstens 60 Minuten und einen Bericht von höchstens einer Seite (Handbuch 4). Jede Station zeigt den **Monatsbericht** des Monats („Monatsbericht · <Monat Jahr>“, Station 1 „… (Auftakt)“) und endet mit dem dokumentierten Beschluss.

## Statusanzeige (klein, oben)

| Wert | Start | Bedeutung |
|---|---|---|
| Kostenprognose | 58,4 Mio. € (= Projektbasis) | aktueller Datenstand; die Klammer zeigt die Abweichung von der Projektbasis. Die Risikoreserve (2,9 Mio. €) steht zusätzlich bereit; Basis plus Reserve = 61,3 Mio. € |
| Terminpuffer | 42 Tage | Puffer bis zur Inbetriebnahme zum Schuljahr 2028/29 (Förderfrist) |
| Offene Entscheidungen | 0 | vertagte Entscheidungen (keine Freigabe, Abwarten, Projektbasis neu festlegen lassen, Klärung abwarten, neu ausschreiben). Jede wird an der Station abgebaut, deren Bericht die Erledigung meldet (`lage-folgen-bedingt`, `offen: -1`): s2 = C in s3, s3 = B und s6 = K in s7, s7 = B in s8. Offen bis zum Ende bleibt nur die Neufestlegung der Projektbasis (s5 = C); der Bericht in s8 sagt es |

Die Werte entstehen additiv: Lage-Folgen einer Station (auch die bedingten) gelten ab dem Lesen der Lage, die Folgen der gewählten Option ab der Folge (`src/geschichte/engine.ts`). Deshalb bucht eine Lage nur, was noch nicht über eine frühere Entscheidung im Status steht. Auf dem empfohlenen Weg: Mai 2026 60,4 Mio. € (+2,0 = 3,4 %), März 2027 61,1, Ende 61,18 Mio. €, Puffer 28 Tage (Rechnung in `inhalte/fall.md`, geprüft in `tests/geschichte.test.ts`).

## Ablauf einer Station (ein Fluss, „Weiter“)

1. **Lage** – was passiert ist, kurz; dazu der Monatsbericht (eine Seite) und die Vorgänge als Karten (mit Quelle, Termin, Verantwortlichem; bei Risiken Status und Matrixstufe getrennt, z. B. „aktiv · vorrangig bearbeiten“).
2. **Die Vorlage** – Frage, befugte Stelle, Entscheidungstermin, Folgen einer Verzögerung; mindestens zwei zulässige Optionen (sonst als unvollständig gekennzeichnet); MCDA-Tabelle; Gewichte verschiebbar, die Rangfolge ändert sich sichtbar; Empfehlung mit Nachteilen und Kipppunkt.
3. **Folge** – Ihre Wahl, Statusänderung, Beschluss getrennt dokumentiert, nächste Schritte der Projektsteuerung.
4. Aufklappbar an jeder Station: **„So läuft es oft“** und **„Typischer Einwand – und die Antwort“**; Link zum passenden Theorie-Thema.

Berichtszeilen und Vorgänge können an eine frühere Wahl gebunden sein (`wenn: s3=A`, mehrere Teile mit `&`, dazu `kurz`/`lang`); jede Option einer früheren Station, die die Lage verändert, bekommt dort eine passende Zeile. Die Kurzfassung erklärt in s5 (Mensa, Marktabfrage ohne Bezug auf die übersprungene Freigabe) und s8 (Brandschutz, Vergabe, bei s3 = B die Lieferzeit) mit `kurz`-Zeilen, was auf den übersprungenen Stationen geschah. Liegt die Prognose über Basis plus Reserve (61,3 Mio. €) – nach der Lage in s7 genau auf den Wegen s4 = A und s5 ≠ A –, sagt der Bericht, dass die Reserve nicht reicht und eine Neufestlegung der Projektbasis nötig wird; s8 sagt es je nach Weg erneut oder meldet, dass die Prognose wieder darunter liegt. Hebt erst das Ersatzgerät in s8 die Prognose über die Grenze (s3 = A, s4 = A, s5 ≠ A, s6 = A, s7 = B oder s3 = C, s4 = B, s5 ≠ A, s6 = K, s7 = A), sagt der s8-Bericht das vor der Entscheidung. Bei s3 = A gibt der Bauherr im Juli 2026 (s6) 0,6 Mio. € der Reserve für den Elementzuschlag frei; in s7 stehen dann nur die neuen 0,3 Mio. € zur Freigabe (Freigaben ändern die Prognose nicht). Das Ende nennt bei negativem Puffer den Schulstart nicht als Tatsache („August 2028 – das Schuljahr 2028/29 beginnt“; Urteil: Inbetriebnahme nicht zu halten, Förderfrist gefährdet).

## Kriterien und Gewichte

Station 1 legt die Gewichte fest (Handbuch 3.1: Kriterien, Gewichte und Bewertungsstufen werden vor der Bewertung mit dem Auftraggeber abgestimmt). Kriterien für alle Vorlagen: **Kosten**, **Termin**, **Qualität und Funktion**, **Klima und Betrieb**. Gewichte und Punkte 1–5; höhere Punkte bedeuten bessere Zielerreichung. **Skalen** (im Projektblatt, s1 nennt sie): Kosten – Mehrkosten gegenüber der Prognose bis 20 / 50 / 150 / 500 TEUR geben 5 / 4 / 3 / 2 Punkte, mehr 1; Einsparungen zählen wie keine Mehrkosten. Termin – Verzug (Verlust an Terminpuffer) bis 7 / 14 / 21 / 28 Tage gibt 5 / 4 / 3 / 2 Punkte, mehr 1 (wie die Beispielskala des Standards). Qualität und Funktion, Klima und Betrieb werden je Option begründet. `tests/geschichte.test.ts` prüft, dass jeder Kosten- und Terminpunkt aus den Folgen der Option folgt. Mit „Termin vor Kosten“ (3/5/3/2) liegt jede Empfehlung vorn; in s4 gleichauf mit C (52 : 52), die Projektsteuerung begründet B. „Kosten vor Termin“ dreht s4 (C) und s8 (B, 54 : 53); „Ausgewogen“ dreht s4 (C). Zwingende Anforderungen werden vor dem Punktevergleich geprüft. Die Projektsteuerung sagt, ob vertretbare andere Gewichte die Rangfolge ändern.

## Stationen (`inhalte/geschichte/s1` … `s8`)

| Nr | Monat | Datum | LPH | Station | Vorgänge der Projektsteuerung | Vorlage (befugte Stelle) | Kurzfassung |
|---|---|---|---|---|---|---|---|
| 1 | 1 | Jan 2026 | 4 | Übernahme mit Projektblatt | AUF-001 Haushaltsansatz, FRW-001 Baupreissteigerung, AUF-002 erster Bestand | Gewichte festlegen (GML – Sie als Bauherren-PL) | ja |
| 2 | 2 | Feb 2026 | 4 | Freigabe zum Abschluss von LPH 4 | FRW-001 → RIS-005, Freigabevorlage | Freigabe / mit Auflagen / keine (Bauherr; Lenkungskreis berät) | – |
| 3 | 3 | Mär 2026 | 5 | Lieferzeit Holzbau | FRW-002 → RIS-009 (4 × 4, vorrangig) | Holzbau vorziehen (MAS-007) / Abwarten (35–70 Tage) / Sporthalle in Stahlbeton (AEN-013) (Änderungsgremium; bei C zusätzlich der Bauherr) | ja |
| 4 | 4 | Apr 2026 | 5 | Größere Mensa | AEN-012 ohne Risikoeintrag, Flurzusage ist kein Beschluss | groß / erweiterbar / wie geplant (Änderungsgremium) | – |
| 5 | 5 | Mai 2026 | 5 | Zwei Zahlen, ein Datenstand | Version 3, RIS-014 Nachtrag, RIS-005 mit vermerktem Betrag | Einsparpaket / Reserve vorsehen und berichten / neue Projektbasis (Bauherr; Lenkungskreis berät) | ja |
| 6 | 7 | Jul 2026 | 5 | Brandschutzauflagen | PRB-002, MAS-011 Zwischenmaßnahme; unvollständige Vorlage | Auflage umsetzen / Klärung abwarten (Änderungsgremium) | – |
| 7 | 15 | Mär 2027 | 7 | Vergabe Holzbau und die Reserve | RIS-005 → PRB-007, RIS-014 geschlossen, bei Abwarten RIS-009 → PRB-008; Ausfall Holger Stein (Generalplanung) | Reserve freigeben / neu ausschreiben / beauftragen und im Ausbau sparen (Bauherr, nicht delegierbar) | – |
| 8 | 25 | Jan 2028 | 8 | Das Lüftungsgerät kommt später | PRB-018 dringliche Gerüstmeldung, PRB-019 Lüftungsgerät | Ersatzgerät / Abwarten (Bauherren-PL im Mandat) | ja |
| Ende | 32 | Aug 2028 | 9 | Schulstart (Übergabe, Beginn LPH 9) | Rückblick: Entscheidungen, Aufwand, Bestand | – | ja |

Jede Regel, die eine Station behauptet, lässt sich intern auf V2.4 oder V1.2 zurückführen (Feld `belege` und Kommentare in der Station, nie sichtbar, O-38). Format: `docs/INHALTSFORMAT.md`, Abschnitt 3a.
