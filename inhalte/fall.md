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

**Reserve-Vorbehalt (allgemeine Regel, R69):** Mehrkosten über der Projektbasis gehen zulasten der Risikoreserve; deren Einsatz gibt der Bauherr frei – auch bei Entscheidungen, die im Mandat einer anderen Stelle liegen. Die Projektsteuerung bereitet diese Freigabe mit der Vorlage vor. s1 nennt die Regel einmal (Lage, Projektblatt); die Vorlagen des Änderungsgremiums (s3, s4, s6) und der Bauherren-PL (s8) nennen bei der befugten Stelle nur den Zusatz „Mehrkosten aus der Reserve gibt der Bauherr frei“. Reicht die Reserve nicht mehr (Prognose über 61,3 Mio. €), braucht es darüber hinaus die Neufestlegung der Projektbasis durch den Bauherrn (k13-t1); s8 fasst Grund und Optionen deshalb wegneutral („soweit sie reicht“). Bis März 2027 hat der Bauherr damit die Mehrkosten aus den Beschlüssen des Änderungsgremiums freigegeben (Bericht s7 bei s5 = B).

| Station | Ereignis | Betrag | Status auf dem empfohlenen Weg |
|---|---|---|---|
| Start | Projektbasis | 58,4 Mio. € | 58,40 · 42 Tage Puffer |
| s3 (Mär 2026) | A: Holzbau vorziehen (MAS-007) | +0,15 | 58,55 |
| s4 (Apr 2026) | B: Mensa erweiterbar vorbereiten (AEN-012) | +0,12 | 58,67 |
| s5 (Mai 2026) | Lage: „Kostenprognose 2026-05 · Version 3“ – ohne die Beschlüsse zu Holzbau und Mensa 1,73 über Version 1: allgemeine Baupreissteigerung 1,13 + Marktpreise Holzbauelemente 0,6 (in RIS-005 als enthalten vermerkt) | +1,73 | **60,40** (+2,00 = 3,4 %) |
| s5 | Zwei Rechnungen: Generalplanung (Holger Stein, Kostenplaner) rechnet den angekündigten Nachtrag der Haustechnik mit ein, Controlling (Aylin Kaya) nicht; die Projektsteuerung hat beide angefordert und klärt den Widerspruch | Differenz 1,2 (2,1 Prozentpunkte) | Nachtrag nicht eingetreten → RIS-014, nicht in der Prognose |
| s5 | B: Reserve vorsehen und offen berichten | 0 | 60,40; vorgesehen 2,0, frei 0,9; mit vollem Nachtrag fehlten 0,3 |
| s6 (Jul 2026) | A: Brandschutzauflage umsetzen (PRB-002) | +0,40 · −7 Tage | 60,80 · 35 Tage |
| s7 (Feb 2027) | RIS-014 geschlossen – Mehrleistungen gehören laut Prüfung der GML zum Planungsvertrag | 0 | – |
| s7 (Mär 2027) | Lage: Submission Holzbau 0,9 über dem Kostenansatz; 0,6 davon seit Mai in der Prognose, neu 0,3 | +0,30 | 61,10 (+2,70) |
| s7 | A: Reserve für den Mehrbetrag von 0,9 Mio. € freigegeben (bei s3 = A: 0,6 davon schon im Juli 2026 für den Elementzuschlag, s6; in s7 nur die neuen 0,3) | 0 (schon in der Prognose) | 61,10; frei bis Basis plus Reserve 0,2 |
| s8 (Jan 2028) | A: Ersatzgerät Lüftung (PRB-019) – Sachentscheidung im Mandat der Bauherren-PL; die 0,08 Mio. € gehen zulasten der Reserve (Prognose liegt auf jedem Weg über der Basis, auf diesem Weg reicht die Reserve), Freigabe durch den Bauherrn | +0,08 · −7 Tage | 61,18 · 28 Tage |
| Ende (Aug 2028) | Schulstart | – | **61,18 Mio. €** (+2,78), Reserve frei 0,12 · **28 Tage** Puffer · 0 offene Entscheidungen |

Auf jedem Weg liegt der Stand im Mai 2026 zwischen 60,13 und 60,98 Mio. € – über der Basis, unter Basis plus Reserve; mit dem vollen Nachtrag (1,2) läge er auf jedem Weg darüber. Nach der Lage in s7 (März 2027) liegt die Prognose genau auf den Wegen mit großer Mensa ohne Einsparpaket (s4 = A, s5 ≠ A) über Basis plus Reserve (61,43–61,71 Mio. €); der Bericht sagt dort, dass die Reserve nicht reicht und eine Neufestlegung der Projektbasis nötig wird, und s8 sagt je nach Weg, ob die Prognose noch darüber oder wieder darunter liegt. Die Zeilen dazu prüfen den Status bei der Lage (`kosten>61.3` bzw. `kosten<=61.3`), nicht einzelne Wahlen; nach der Lage in s8 liegt die Prognose genau auf 18 von 36 Vorsilben s3–s7 mit s4 = A und s5 ≠ A darüber (s7 = A; s7 = B bei s3 = C oder bei s3 = A und s6 = K). Auf den Wegen, auf denen erst das Ersatzgerät in s8 (+0,08) die Grenze überschreitet (s8-Lage 61,28 bei s3 = A, s4 = A, s5 ≠ A, s6 = A, s7 = B; 61,23 bei s3 = C, s4 = B, s5 ≠ A, s6 = K, s7 = A), sagt der s8-Bericht das vor der Entscheidung („Achtung – mit dem Ersatzgerät läge die Prognose über …“).

**Reserve bei vorgezogener Vergabe (s3 = A):** Der Elementzuschlag im Juli 2026 liegt im Rahmen der 0,6 Mio. € Marktpreise aus Version 3; diesen Betrag gibt der Bauherr dafür aus der Reserve frei (Bericht s6). In s7 stehen deshalb nur die neuen 0,3 Mio. € zur Freigabe; die Optionen nennen den Mehrbetrag „von zusammen 0,9 Mio. €“, s8 meldet bei s7 = C, dass es bei den 0,6 Mio. € bleibt. Die Prognose ändert sich durch Freigaben nicht (Status = Prognose).

**Offene Entscheidungen** (vertagte Entscheidungen): +1 bei s2 = C, s3 = B, s5 = C, s6 = K, s7 = B; dazu +1 in s7, wenn dort die Neufestlegung der Projektbasis nötig wird und nicht schon vorbereitet ist (s4 = A, s5 = B). Abgebaut, wenn der Bericht die Erledigung meldet: s2 = C in s3 (Freigabe LPH 4 am 17. März 2026), s3 = B in s7 (Lieferzeit mit der Vergabe geklärt, PRB-008), s6 = K in s7 (Behörde lehnt die Alternative ab, PRB-002 geschlossen), s7 = B in s8 (Zuschlag der Neuausschreibung im Mai 2027), die in s7 nötig gewordene Neufestlegung in s8, wo die Prognose wieder unter Basis plus Reserve liegt (s4 = A, s5 = B und s7 = C, s7 = B mit s3 = B oder s7 = B mit s3 = A und s6 = A; der Bericht: „nicht mehr nötig, die Vorlage zurückgezogen“). Liegt die Prognose in s8 noch darüber, bleibt sie offen („der Beschluss des Bauherrn steht noch aus“). Offen bis zum Ende bleibt die Neufestlegung der Projektbasis (s5 = C „Neufestlegung der Projektbasis vorbereiten“: die Projektsteuerung legt die Vorlage vor, der Bauherr stellt den Beschluss im Lenkungskreis bis nach den Hauptvergaben zurück, bis dahin trägt die vorgesehene Reserve – kein Verzug, kein Auftrag wartet; Bericht s6 sagt es, s7 erneut; s8: „der Beschluss des Bauherrn und die Bestätigung durch den Stadtrat stehen noch aus“) – am Ende also 1 offen bei s5 = C oder bei s5 = B mit einer s8-Lage über 61,3 Mio. €, sonst 0. Jeder Bericht, der eine offene Entscheidung nennt („bleibt offen“, „steht noch aus“), steht an einer Station mit Status offen ≥ 1 und umgekehrt (Test über alle Wege).

Andere Wege (nachgerechnet mit der Engine): s3 = B, s6 = K, s8 = B → 61,00 Mio. €, −35 Tage, 0 offen; s2 = C, s3 = C, s4 = A, s5 = A, s7 = C → 59,76 Mio. €, −28 Tage, 0 offen; alles vertagt (s2 = C, s3 = B, s5 = C, s6 = K, s7 = B) → 60,76 Mio. €, −77 Tage, 1 offen; s3 = B, s4 = A, s5 = C → 61,51 Mio. €, −21 Tage, 1 offen. Der teuerste Weg (s3 = C, s4 = A, s6 = K, sonst empfohlen) endet bei 61,79 Mio. € – die Reserve reicht dort nicht; s7 und s8 sagen das und nennen die nötige Neufestlegung der Projektbasis, die am Ende offen ist (1 offen). Die Kurzfassung mit den empfohlenen Optionen endet wie der empfohlene Weg (61,18 Mio. €, 28 Tage, 0 offen).

Weitere Zahlen:

| Größe | Wert | Anmerkung |
|---|---|---|
| Lieferzeit Holzbauelemente (Mär 2026) | 26 statt 16 Wochen; drei von vier Anbietern 24–26 Wochen | RIS-009, W 4 · A 4; ohne Gegenmaßnahme Montagebeginn bis rund 70 Tage später (mehr als der Puffer) |
| Abwarten (s3 = B) | rund 35 Tage Puffer, wenn sich die Lieferzeit bei rund 21 Wochen einpendelt; sonst rund 70 | Bandbreite statt Einzelzahl (V2.4 HB 2); Status rechnet mit 35; in s7 bestätigt (PRB-008) |
| Mensa (Apr 2026) | 450 statt 300 Essen, 0,6 Mio. €, rund vier Wochen Umplanung, davon rund zwei Wochen auf dem kritischen Weg (Puffer −14); Förderung deckt sie nicht | AEN-012, Antragstellerin Sabine Roth; Zusage von Frank Deppe im Flur (März) ist kein Beschluss |
| Brandschutz (Jun/Jul 2026) | Kapselung der Holzbauteile in den Fluren, 0,4 Mio. €, eine Woche Umplanung; Gutachten 0,03 Mio. € (von der GML gesondert beauftragt) | PRB-002, MAS-011; bei „Klärung abwarten“ bleiben die 0,4 in der Prognose, die Behörde lehnt die Alternative im August 2026 ab |
| Lüftungsgerät (Jan 2028) | vier Wochen später; Ersatzgerät 80.000 € / 7 Tage, Abwarten 20.000 € / 28 Tage | Beträge und Tage wie das fiktive Beispiel des Standards (L-193). Punkte nach den Skalen des Projektblatts: Kosten 3 / 5, Termin 5 / 2 → 57 : 48 bei 3/5/3/2, 59 : 55 bei „Ausgewogen“, 53 : 54 bei „Kosten vor Termin“. Das Thema „Entscheidungsvorlage“ rechnet mit den vereinfachten Skalen des Standards (41 : 35 bei 3/5/2) |
| Skalen für den Vergleich (Projektblatt, s1) | Kosten: Mehrkosten bis 20 / 50 / 150 / 500 TEUR → 5 / 4 / 3 / 2 Punkte, mehr 1; Einsparung zählt wie keine Mehrkosten. Termin: Verzug bis 7 / 14 / 21 / 28 Tage → 5 / 4 / 3 / 2, mehr 1 | Terminskala wie die Beispielskala des Standards; Kostenskala auf die Größe des Projekts gestuft. Jeder Kosten- und Terminpunkt folgt aus den Folgen der Option (`tests/geschichte.test.ts`) |
| Ratsbeschluss zum Klimaziel | Der Stadtrat hat den Holzhybridbau für alle drei Bauteile beschlossen | fiktiv; Grund für „weniger Holz als im Ratsbeschluss zum Klimaziel“ (s3, Sporthalle in Stahlbeton, Klima 1 Punkt). Die Abweichung ist eine wesentliche Änderung: Option C braucht zusätzlich zum Änderungsgremium einen Beschluss des Bauherrn (s3: befugte Stelle und Konsequenz) |
| Grenzen für die Risikobewertung (Projektblatt) | Auswirkung Kosten: bis 0,1 / 0,5 / 1,5 / 3,0 Mio. € → Stufe 1 / 2 / 3 / 4, darüber 5. Auswirkung Termin: bis 14 / 28 / 42 / 70 Tage → Stufe 1 / 2 / 3 / 4, darüber 5. Ein Grenzwert gehört zur niedrigeren Stufe | eigene Grenzen der Risikomatrix, getrennt von den Skalen des Vergleichs (MCDA). Passend dazu: RIS-005 (0,6 Mio. €) und RIS-014 (bis 1,2 Mio. €) Auswirkung 3. RIS-009 Auswirkung 4: Der Montagebeginn verschiebt sich bis rund 70 Tage; gezählt wird die Verschiebung des Zieltermins (Inbetriebnahme zum Schuljahr 2028/29) nach Abzug des Terminpuffers (42 Tage), also bis 28 Tage – beim Termin allein Stufe 2. Das Matrixfeld bestimmt die höchste belegte Auswirkung (V2.4 HB 2): Startet das Schuljahr bis zu vier Wochen ohne die neuen Gebäude, beginnt der Unterricht in Ausweichräumen, Ganztag, Sport und Fachräume bleiben erheblich eingeschränkt – Qualität/Funktion Stufe 4 („eine wichtige Teilfunktion bleibt erheblich eingeschränkt“; die Hauptnutzung fällt nicht ganz aus, sonst Stufe 5). Daher 4 × 4 = 16, vorrangig. Die Förderfrist ist zusätzlich ein besonderer Warnanlass, unabhängig von der Matrix. Die Grenzen selbst sind nicht auf der Seite genannt; sichtbar sind RIS-009 „vorrangig“ (Story, Explore „Auswirkung auf den Schulbetrieb“) |
| Marktabfrage Holzbauelemente | s2 = B: Auflage bis Ende März 2026, liegt am 27. März vor; s2 = C: vor der Freigabe, Freigabe LPH 4 am 17. März | Ergebnis in „Kostenprognose 2026-05 · Version 3“ eingerechnet (0,6 Mio. € Marktpreise) |
| Förderfrist | Inbetriebnahme zum Schuljahr 2028/29 | fiktiv wie der ganze Fall |

Mandat (Muster-Mandatsleiter, k4.2-p3): Bauherren-PL bis einschließlich 100 TEUR, Änderungsgremium über 100 TEUR bis einschließlich 5 Mio. €, darüber der Bauherr im Lenkungskreis. Eine neue Projektbasis beschließt der Bauherr im Lenkungskreis (Dr. Olbers) auf Vorlage der Projektsteuerung (wie das Glossar, k13-t1); weil die Stadt die Mittel bewilligt, lässt die GML den Beschluss vom Stadtrat bestätigen (s5, s7, s8). Das Projektblatt hat die GML vor der Beauftragung der Projektsteuerung festgelegt (Bewertungsgrenzen, Entscheidungsschwellen); die MCDA-Gewichte stimmt die Projektsteuerung in Station 1 ab; festgelegt werden sie vom Bauherrn (Dr. Olbers, der Lenkungskreis berät, 20. Januar 2026) auf Empfehlung der Bauherren-PL – die Zielpriorität ist nicht delegierbar (k3.2-t1, k4.1-p1).

## Zeitachse

Monat 1 ist Januar 2026, Monat 32 August 2028. LPH-Stand: LPH 4 bis Februar 2026, LPH 5 März–Dezember 2026, LPH 6 Januar–Februar 2027, LPH 7 März–Mai 2027, LPH 8 Juni 2027 – Juli 2028, mit der Übergabe im August 2028 beginnt LPH 9 (die Zeichnung am Ende zeigt den fertigen Campus).

| Monat | Kalender | LPH | Ereignis | Station |
|---|---|---|---|---|
| 1 | Jan 2026 | 4 | Übernahme ohne Übergabe: Unterlagen in drei Ablagen, Haushaltsansatz 2027 bis Freitag, Baupreissteigerung nicht belegt (FRW-001). Projektblatt liegt vor; der Bauherr legt im Lenkungskreis am 20. Januar die Gewichte fest. Bauantrag am 29. Januar eingereicht. | s1 |
| 2 | Feb 2026 | 4 | FRW-001 → RIS-005; erster abgestimmter Bestand (23 Vorgänge); Freigabe zum Abschluss von LPH 4 (empfohlen mit Auflage Marktabfrage bis Ende März). | s2 |
| 3 | Mär 2026 | 5 | Lieferzeit Holzbauelemente (FRW-002 → RIS-009); Wunsch größere Mensa (AEN-012); Marktabfrage Holzbauelemente (bei s2 = C Freigabe LPH 4 am 17. März). | s3 |
| 4 | Apr 2026 | 5 | Änderungsgremium entscheidet über die Mensa (28. April); MAS-007 Vergabeunterlagen am 15. April. | s4 |
| 5 | Mai 2026 | 5 | Zwei Prognosen, ein Datenstand (Version 3); Lenkungskreis 19. Mai, Bauausschuss 21. Mai. | s5 |
| 6 | Jun 2026 | 5 | Baugenehmigung am 12. Juni mit Brandschutzauflagen. | – |
| 7 | Jul 2026 | 5 | Problem PRB-002, Zwischenmaßnahme MAS-011, unvollständige Vorlage; Zuschlag für die vorab ausgeschriebenen Holzbauelemente mit Freigabe von 0,6 Mio. € aus der Reserve durch den Bauherrn (bei s3 = A). | s6 |
| 12 | Dez 2026 | 5 | Freigabe zum Abschluss von LPH 5 durch den Bauherrn (Bericht s7; in der Kurzfassung s8). | – |
| 13–14 | Jan–Feb 2027 | 6 | Vorbereitung der Vergabe; RIS-014 geschlossen (19. Februar); Freigabe zum Abschluss von LPH 6 im Februar (Bericht s7). | – |
| 15 | Mär 2027 | 7 | Submission Holzbau (2. März), Ausfall Holger Stein (ab 8. März), Freigabe der Reserve bis 24. März. | s7 |
| 17 | Mai 2027 | 7 | Freigabe zum Abschluss von LPH 7 durch den Bauherrn (Bericht s8). | – |
| 18 | Jun 2027 | 8 | Objektüberwachung; die Bauarbeiten laufen. | – |
| 25 | Jan 2028 | 8 | Dringliche Gerüstmeldung (PRB-018, 11. Januar); Lüftungsgerät vier Wochen später (PRB-019). | s8 |
| 32 | Aug 2028 | 9 | Schulstart, Übergabe, Beginn LPH 9; Schlüsselübergabe, wenn der Puffer gehalten hat. | Ende |

## Gremien und Takte

| Gremium | Wer | Takt | Rolle im Fall |
|---|---|---|---|
| Stadtrat | Rat der Stadt Lindenhall | monatlich, Sommerpause im August | hat Projektbasis und Reserve beschlossen; bestätigt eine neue Projektbasis, die der Bauherr im Lenkungskreis beschlossen hat (die Stadt bewilligt die Mittel) |
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
Leitet die Projektsteuerung. Er und sein Team erfassen und pflegen alle Vorgänge, prüfen jede Woche den offenen Bestand und bereiten jede erforderliche Entscheidung als Vorlage mit mindestens zwei Optionen und gewichtetem Vergleich vor. Er entscheidet nie selbst.

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
Rechnet für die GML die Restkostenprognose (CTC) und liefert Fachbeiträge zu Kosten. Im Mai 2026 liegt ihre Zahl 1,2 Mio. € unter der Kostenberechnung der Generalplanung – sie rechnet den angekündigten Nachtrag nicht ein.

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
funktion: Kostenplaner der Generalplanung
farbe: "#5B6770"
---
### Kurzbeschreibung
Rechnet für die Generalplanung die Kostenberechnung; die Projektsteuerung fordert sie an und plausibilisiert sie (Fachplanung macht die Projektsteuerung nicht). Kennt jede Zeile. Fällt im März 2027 für Wochen aus; eine Kollegin aus seinem Büro übernimmt, der Datenstand liegt in der Software der GML – keine Übergabelücke.

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
