---
# Fall-Bibel (P16.5, O-50): internes Nachschlagewerk für Story (inhalte/geschichte/), Theorie-Beispiele und Werkzeuge.
# Wird nicht auf der Seite gezeigt. Eine Welt, eine Geschichte (O-40). Zeitachse mit LPH-Stand im Abschnitt „Zeitachse“ (Monat 1 = Januar 2026).
stadt: Lindenhall
bauherr: Stadt Lindenhall (Eigentümerin; Rückkopplung über Stadtrat und Bauausschuss)
vertretung: Gebäudemanagement Lindenhall GmbH
vertretung-kurz: GML
projekt: Schulcampus Lindenhall-Süd
bauteile: [Gesamtschule, Grundschule, Dreifeldsporthalle]
bauweise: Holzhybridbau
projektbasis: 58,4 Mio. € brutto, dazu 2,9 Mio. € Risikoreserve
projektbasis-mio: 58,4
gremien: [Stadtrat, Bauausschuss, Lenkungskreis, Änderungsgremium]
monat-0: 2025-12
hinweis: Fiktiver Fall. Stadt, Gesellschaft, Projekt und Personen sind erfunden.
---

Die Stadt Lindenhall baut im Süden der Stadt einen Schulcampus: eine Gesamtschule, eine Grundschule und eine Dreifeldsporthalle, als Holzhybridbau. Eigentümerin ist die Stadt; Stadtrat und Bauausschuss legen den Rahmen fest. Als Bauherr wird sie von der Gebäudemanagement Lindenhall GmbH (GML) vertreten. Der Stadtrat hat eine Projektbasis von 58,4 Mio. € brutto beschlossen und zusätzlich eine Risikoreserve von 2,9 Mio. € bereitgestellt (Basis plus Reserve: 61,3 Mio. €).

Es gibt eine Welt und eine Geschichte (O-40): die Arbeitsweise nach dem Standard „Aufgaben- und Risikomanagement V2.4“. Die Projektsteuerung bearbeitet und pflegt alle Vorgänge; der Bauherr und die GML pflegen keine. Die Geschichte beginnt im Januar 2026 mit der Übernahme der Projektleitung auf Bauherrenseite (Bauherren-PL) und endet im August 2028 mit dem Schulstart.

## Kosten und Reserve (Rechnung der Story)

Die Statusanzeige rechnet additiv (`src/geschichte/engine.ts`): Lage-Folgen gelten ab dem Lesen der Lage, die Folgen der gewählten Option ab der Folge. Eine Lage bucht deshalb nur, was noch nicht über eine frühere Entscheidung im Status steht. Die Kostenprognose wird gegen die Projektbasis (58,4) gezeigt; die Risikoreserve steht zusätzlich bereit und deckt Abweichungen bis 61,3 Mio. €. Freigegeben wird sie nur vom Bauherrn (nicht delegierbar, k3.2-t1); „vorgesehen“ heißt: für bekannte Mehrkosten eingeplant, nicht freigegeben.

| Station | Ereignis | Betrag | Status auf dem empfohlenen Weg |
|---|---|---|---|
| Start | Projektbasis | 58,4 Mio. € | 58,40 · 42 Tage Puffer |
| s3 (Mär 2026) | A: Holzbau vorziehen (MAS-007) | +0,15 | 58,55 |
| s4 (Apr 2026) | B: Mensa erweiterbar vorbereiten (AEN-012) | +0,12 | 58,67 |
| s5 (Mai 2026) | Lage: „Kostenprognose 2026-05 · Version 3“ – allgemeine Baupreissteigerung 1,13 + Marktpreise Holzbauelemente 0,6 (in RIS-005 als enthalten vermerkt) | +1,73 | **60,40** (+2,00 = 3,4 %) |
| s5 | Zwei Rechnungen: Projektsteuerung (Holger Stein) rechnet den angekündigten Nachtrag der Haustechnik mit ein, Controlling (Aylin Kaya) nicht | Differenz 1,2 (2,1 Prozentpunkte) | Nachtrag nicht eingetreten → RIS-014, nicht in der Prognose |
| s5 | B: Reserve vorsehen und offen berichten | 0 | 60,40; vorgesehen 2,0, frei 0,9; mit vollem Nachtrag fehlten 0,3 |
| s6 (Jul 2026) | A: Brandschutzauflage umsetzen (PRB-002) | +0,40 · −7 Tage | 60,80 · 35 Tage |
| s7 (Feb 2027) | RIS-014 geschlossen – Mehrleistungen gehören laut Prüfung der GML zum Planungsvertrag | 0 | – |
| s7 (Mär 2027) | Lage: Submission Holzbau 0,9 über dem Kostenansatz; 0,6 davon seit Mai in der Prognose, neu 0,3 | +0,30 | 61,10 (+2,70) |
| s7 | A: 0,9 Mio. € aus der Reserve freigegeben | 0 (schon in der Prognose) | 61,10; frei bis Basis plus Reserve 0,2 |
| s8 (Jan 2028) | A: Ersatzgerät Lüftung (PRB-019) | +0,08 · −7 Tage | 61,18 · 28 Tage |
| Ende (Aug 2028) | Schulstart | – | **61,18 Mio. €** (+2,78), Reserve frei 0,12 · **28 Tage** Puffer · 0 offene Entscheidungen |

Auf jedem Weg liegt der Stand im Mai 2026 zwischen 60,13 und 60,98 Mio. € – über der Basis, unter Basis plus Reserve; mit dem vollen Nachtrag (1,2) läge er auf jedem Weg darüber. Andere Wege (nachgerechnet): s3 = B, s6 = K, s8 = B → 61,00 Mio. €, −35 Tage, 2 offen; s2 = C, s3 = C, s4 = A, s5 = A, s7 = C → 59,76 Mio. €, −28 Tage, 1 offen. Der teuerste Weg (s3 = C, s4 = A, s6 = K, sonst empfohlen) endet bei 61,79 Mio. € – die Reserve reicht dort nicht; die Story sagt das, ohne eine Zahl zu behaupten („was über 61,3 Mio. € hinausgeht, deckt sie nicht mehr“).

Weitere Zahlen:

| Größe | Wert | Anmerkung |
|---|---|---|
| Lieferzeit Holzbauelemente (Mär 2026) | 26 statt 16 Wochen; drei von vier Anbietern 24–26 Wochen | RIS-009, W 4 · A 4; ohne Gegenmaßnahme Montagebeginn bis rund 70 Tage später (mehr als der Puffer) |
| Abwarten (s3 = B) | rund 35 Tage Puffer, wenn sich die Lieferzeit bei rund 21 Wochen einpendelt; sonst rund 70 | Bandbreite statt Einzelzahl (V2.4 HB 2); Status rechnet mit 35; in s7 bestätigt (PRB-008) |
| Mensa (Apr 2026) | 450 statt 300 Essen, 0,6 Mio. €, rund vier Wochen Umplanung; Förderung deckt sie nicht | AEN-012, Antragstellerin Sabine Roth; Zusage von Frank Deppe im Flur (März) ist kein Beschluss |
| Brandschutz (Jun/Jul 2026) | Kapselung der Holzbauteile in den Fluren, 0,4 Mio. €, eine Woche Umplanung; Gutachten 0,03 Mio. € (von der GML gesondert beauftragt) | PRB-002, MAS-011; bei „Klärung abwarten“ bleiben die 0,4 in der Prognose, die Behörde lehnt die Alternative ab |
| Lüftungsgerät (Jan 2028) | vier Wochen später; Ersatzgerät 80.000 € / 7 Tage, Abwarten 20.000 € / 28 Tage | wie das fiktive Beispiel des Standards (L-193); 41 : 35 bei Gewichten 3/5/2 |
| Förderfrist | Inbetriebnahme zum Schuljahr 2028/29 | fiktiv wie der ganze Fall |

Mandat (Muster-Mandatsleiter, k4.2-p3): Bauherren-PL bis einschließlich 100 TEUR, Änderungsgremium über 100 TEUR bis einschließlich 5 Mio. €, darüber der Bauherr im Lenkungskreis. Eine neue Projektbasis beschließt der Bauherr – hier der Stadtrat – auf Vorlage aus dem Lenkungskreis. Das Projektblatt hat die GML vor der Beauftragung der Projektsteuerung festgelegt (Bewertungsgrenzen, Entscheidungsschwellen); die MCDA-Gewichte stimmt die Projektsteuerung in Station 1 ab, festgelegt werden sie von der GML.

## Zeitachse

Monat 1 ist Januar 2026, Monat 32 August 2028. LPH-Stand: LPH 4 bis Februar 2026, LPH 5 März–Dezember 2026, LPH 6 Januar–Februar 2027, LPH 7 März–Mai 2027, LPH 8 ab Juni 2027.

| Monat | Kalender | LPH | Ereignis | Station |
|---|---|---|---|---|
| 1 | Jan 2026 | 4 | Übernahme ohne Übergabe: Unterlagen in drei Ablagen, Haushaltsansatz 2027 bis Freitag, Baupreissteigerung nicht belegt (FRW-001). Projektblatt liegt vor; Gewichte festgelegt. Bauantrag am 29. Januar eingereicht. | s1 |
| 2 | Feb 2026 | 4 | FRW-001 → RIS-005; erster abgestimmter Bestand (23 Vorgänge); Freigabe zum Abschluss von LPH 4 (empfohlen mit Auflage Marktabfrage bis Ende April). | s2 |
| 3 | Mär 2026 | 5 | Lieferzeit Holzbauelemente (FRW-002 → RIS-009); Wunsch größere Mensa (AEN-012). | s3 |
| 4 | Apr 2026 | 5 | Änderungsgremium entscheidet über die Mensa (28. April); MAS-007 Vergabeunterlagen am 15. April. | s4 |
| 5 | Mai 2026 | 5 | Zwei Prognosen, ein Datenstand (Version 3); Lenkungskreis 19. Mai, Bauausschuss 21. Mai. | s5 |
| 6 | Jun 2026 | 5 | Baugenehmigung am 12. Juni mit Brandschutzauflagen. | – |
| 7 | Jul 2026 | 5 | Problem PRB-002, Zwischenmaßnahme MAS-011, unvollständige Vorlage; Zuschlag für die vorab ausgeschriebenen Holzbauelemente (bei s3 = A). | s6 |
| 13–14 | Jan–Feb 2027 | 6 | Vorbereitung der Vergabe; RIS-014 geschlossen (19. Februar). | – |
| 15 | Mär 2027 | 7 | Submission Holzbau (2. März), Ausfall Holger Stein (ab 8. März), Freigabe der Reserve bis 24. März. | s7 |
| 18 | Jun 2027 | 8 | Objektüberwachung; die Bauarbeiten laufen. | – |
| 25 | Jan 2028 | 8 | Dringliche Gerüstmeldung (PRB-018, 11. Januar); Lüftungsgerät vier Wochen später (PRB-019). | s8 |
| 32 | Aug 2028 | 8 | Schulstart, Schlüsselübergabe. | Ende |

## Gremien und Takte

| Gremium | Wer | Takt | Rolle im Fall |
|---|---|---|---|
| Stadtrat | Rat der Stadt Lindenhall | monatlich, Sommerpause im August | hat Projektbasis und Reserve beschlossen; beschließt als Bauherr eine neue Projektbasis auf Vorlage aus dem Lenkungskreis |
| Bauausschuss | Ausschuss des Stadtrats, Vorsitz Bernd Kowalski | zweimonatlich, donnerstags | wird berichtet |
| Lenkungskreis | Dr. Miriam Olbers (Bauherr), Frank Deppe (GML), Vertretung der Kämmerei; die Bauherren-PL berichtet | monatlich, dritter Dienstag | berät; entschieden wird vom Bauherrn als befugter Stelle auf Vorlage der Projektsteuerung |
| Änderungsgremium | Vorsitz Frank Deppe, Bauherren-PL, Aylin Kaya; Sabine Roth bei Nutzerthemen; die Projektsteuerung bereitet vor | monatlich, zzgl. anlassbezogener Sondersitzungen | entscheidet über 100 TEUR bis einschließlich 5 Mio. € |
| Monatstermin | Bauherren-PL und Projektsteuerung, Fachleute nach Bedarf | monatlich, online, höchstens 60 Minuten | dazu der Monatsbericht von höchstens einer Seite |

Die Projektsteuerung prüft jede Woche alle offenen Vorgänge und meldet Dringliches sofort (am selben Arbeitstag dokumentiert). Alle Vorgänge stehen in der Software der GML.

Kennungen (docs/BEGRIFFE.md): `AUF-` Aufgabe, `MAS-` Maßnahme, `FRW-` Frühwarnung, `RIS-` Risiko, `PRB-` Problem, `AEN-` Änderung, `ENT-` Entscheidung, `NAC-` Nachweis. Freigaben tragen kein Kürzel („Freigabe LPH 4“). Vergeben: `AUF-001`, `AUF-002`, `FRW-001` → `RIS-005` → `PRB-007`; `FRW-002` → `RIS-009` (bei Abwarten → `PRB-008`); `MAS-007`; `AEN-012` (Mensa), `AEN-013` (Sporthalle in Stahlbeton); `RIS-014`; `PRB-002`, `MAS-011`; `PRB-018` (Gerüst), `PRB-019` (Lüftungsgerät). Für die Risikomatrix im Werkzeug zusätzlich `RIS-021` und `RIS-022`. Datenstände: „Kostenprognose 2026-01 · Version 1“, „Kostenprognose 2026-05 · Version 3“.

## Figuren

Die Leserin oder der Leser ist die Bauherren-PL („Sie“). Die übrigen Figuren treten in der Story auf; ihre Kopfdaten bleiben in der Form, die das Prüfwerkzeug kennt.

::: figur sie
---
name: Sie
rolle: pl
funktion: Bauherren-PL
farbe: "#3866A8"
spieler: ja
---
### Kurzbeschreibung
Die Leserin oder der Leser: Sie leiten das Projekt ab Januar 2026 auf Bauherrenseite bei der GML. Sie pflegen keine Vorgänge, Sie entscheiden – oder tragen die Vorlage zur befugten Stelle.

### Stimme
Ihre eigene.
:::

::: figur brenner
---
name: Jonas Brenner
rolle: ps
funktion: Projektsteuerung, extern
farbe: "#146878"
---
### Kurzbeschreibung
Leitet die Projektsteuerung. Er und sein Team erfassen und pflegen alle Vorgänge, prüfen jede Woche den offenen Bestand und bereiten jede Entscheidung als Vorlage mit mindestens zwei Optionen und gewichtetem Vergleich vor. Er entscheidet nie selbst.

### Stimme
Sachlich, knapp, mit Verweis auf den Eintrag in der Software.
:::

::: figur kaya
---
name: Aylin Kaya
rolle: controlling
funktion: Controlling der GML
farbe: "#A8823C"
---
### Kurzbeschreibung
Rechnet für die GML die Restkostenprognose (CTC) und liefert Fachbeiträge zu Kosten. Im Mai 2026 liegt ihre Zahl 1,2 Mio. € unter der der Projektsteuerung – sie rechnet den angekündigten Nachtrag nicht ein.

### Stimme
Präzise, ungeduldig mit Versionsnummern.
:::

::: figur hoffmeister
---
name: Lena Hoffmeister
rolle: planung
funktion: Generalplanung
farbe: "#D9822B"
---
### Kurzbeschreibung
Leitet die Generalplanung und liefert Fachbeiträge zu Planung, Terminen und Angeboten. Meldet im März 2026 die längere Lieferzeit der Holzbauelemente.

### Stimme
Lösungsfreudig, ruft lieber an, als zu schreiben.
:::

::: figur olbers
---
name: Dr. Miriam Olbers
rolle: bauherr
funktion: Dezernentin, Bauherr
farbe: "#1D3258"
---
### Kurzbeschreibung
Dezernentin der Stadt Lindenhall und für das Projekt die Stimme des Bauherrn. Entscheidet als befugte Stelle (Freigaben, Reserve), der Lenkungskreis berät; steht Stadtrat und Bauausschuss Rede und Antwort.

### Stimme
Ruhig; fragt zuerst nach der Entscheidungsfrage, dann nach den Details.
:::

::: figur deppe
---
name: Frank Deppe
rolle: gf
funktion: Geschäftsführung GML
farbe: "#6A4CA5"
---
### Kurzbeschreibung
Geschäftsführer der GML und Vorsitzender des Änderungsgremiums. Sagt im Flur gern zu – eine Zusage ist aber kein Beschluss.

### Stimme
Verbindlich, zuversichtlich, kurze Sätze.
:::

::: figur stein
---
name: Holger Stein
funktion: Kostenplaner im Team der Projektsteuerung
farbe: "#5B6770"
---
### Kurzbeschreibung
Kennt jede Zeile der Kostenprognose. Fällt im März 2027 für Wochen aus; eine Kollegin übernimmt aus dem Bestand in der Software, ohne Übergabelücke.

### Stimme
Leise, genau, spricht in Zellbezügen.
:::

::: figur petersen
---
name: Nora Petersen
funktion: Projektassistenz der GML
farbe: "#7A5C3E"
---
### Kurzbeschreibung
Organisiert Termine und Unterlagen der Bauherren-PL. Vorgänge pflegt sie nicht – das tut die Projektsteuerung.

### Stimme
Freundlich, organisiert, fragt nach der Version.
:::

::: figur roth
---
name: Sabine Roth
funktion: Nutzervertretung, künftige Schulleiterin der Gesamtschule
farbe: "#B04A5A"
---
### Kurzbeschreibung
Spricht für Nutzer und Schulverwaltung. Ihr Anliegen im März 2026: eine größere Mensa für den Ganztag (AEN-012).

### Stimme
Herzlich und hartnäckig; sagt „die Kinder“, wenn sie „der Bedarf“ meint.
:::

::: figur kowalski
---
name: Bernd Kowalski
funktion: Vorsitzender des Bauausschusses
farbe: "#4A5568"
---
### Kurzbeschreibung
Ratsmitglied und Vorsitzender des Bauausschusses. Will wissen, worüber der Ausschuss eigentlich entscheiden soll.

### Stimme
Trocken, höflich, fragt zweimal nach.
:::
