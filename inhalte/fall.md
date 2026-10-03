---
# Fall-Bibel (P17.1, O-50, O-51): internes Nachschlagewerk für Story (docs/DREHBUCH.md), Theorie-Beispiele und Werkzeuge.
# Wird nicht auf der Seite gezeigt und nicht kompiliert (werkzeuge/inhalte.mjs überspringt diese Datei).
# Die Story ist seit O-51 neu; verbindlich für sie ist docs/DREHBUCH.md. Diese Datei hält nur die Eckdaten fest.
stadt: Lindenhall
bauherr: Stadt Lindenhall (Eigentümerin; Budget und Reserve vom Stadtrat beschlossen)
befugte-stelle: Bürgermeisterin Gisela Grundstein (entscheidet für die Stadt als Bauherr; der Lenkungskreis berät)
vertretung: Gebäudemanagement der Stadt Lindenhall (in der Story nur als Betreiberin nach der Übergabe sichtbar)
projekt: Schulcampus Lindenhall-Süd
bauteile: [Gesamtschule, Grundschule, Dreifeldsporthalle]
bauweise: Holzhybridbau
budget: rund 58 Mio. € (genau 58,4 Mio. € brutto), dazu rund 3 Mio. € Reserve (genau 2,9 Mio. €)
gremien: [Stadtrat, Lenkungskreis]
hinweis: Fiktiver Fall. Stadt, Projekt, Personen, Zahlen und Ereignisse sind erfunden.
---

Die Stadt Lindenhall baut im Süden der Stadt einen Schulcampus: eine Gesamtschule, eine Grundschule und eine Sporthalle, als Holzhybridbau. Der Stadtrat hat ein Budget von rund 58 Millionen Euro und eine Reserve von rund 3 Millionen Euro beschlossen. Für die Stadt als Bauherr entscheidet die Bürgermeisterin; der Lenkungskreis (Bürgermeisterin, Kämmerei, Schulamt) berät sie. Die Leserin oder der Leser ist die Projektleitung des Bauherrn („Sie“). Die Projektsteuerung bearbeitet und pflegt alle Vorgänge in der Software der Stadt; der Bauherr pflegt keine (O-36). Die Story beginnt im Januar 2026 und endet Ende August 2028 mit dem Schulstart.

## Wer entscheidet was (Projektblatt der Story)

| Stelle | Entscheidet | Beleg |
|---|---|---|
| Sie (Projektleitung des Bauherrn) | Entscheidungen bis 100.000 €, wenn das Budget sie ohne Reserve trägt | k4.2-p1, k4.2-p3 (Muster, projektbezogen vereinfacht), v24:hb-projektblatt |
| Bürgermeisterin (Bauherr) | alles darüber; jeden Einsatz der Reserve; Annahme großer Risiken; jede Freigabe am Ende einer Leistungsphase (LPH 0–9); Zielpriorität „Schulstart zuerst, dann das Geld“ | k3.2-t1, k4.1-p1, k9.3-p3, v24:hb-1, v24:va-4.1 |
| Lenkungskreis | berät die Bürgermeisterin | k9.3-p3 |
| Projektsteuerin | entscheidet nichts; bereitet vor, bearbeitet und pflegt alle Vorgänge, empfiehlt, hält Beschlüsse getrennt fest, übergibt am Ende | v24:hb-1, v24:hb-3.1, v24:tlb-2.1, v24:va-4.2 |

Das Änderungsgremium des Muster-Mandatsleiters kommt in der Story nicht vor (projektbezogene Festlegung des Bauherrn, siehe docs/DREHBUCH.md, Abschnitt 9).

## Zeitachse der Story

| Kapitel | Monat | Leistungsphase (intern) | Ereignis | Campus (src/grafik/campus-iso.ts) |
|---|---|---|---|---|
| 1 | Jan 2026 | LPH 4 | Übernahme; Mandat und Zielpriorität festgelegt | Stufe 0, Winter |
| 2 | Mär 2026 | LPH 5 | Hinweis auf längere Lieferzeiten der Holzelemente → Frühwarnung | Stufe 0, Frühling |
| 3 | Apr 2026 | LPH 5 | Klärung: halbes Jahr statt vier Monate → Risiko, vorrangig; Holzelemente früher ausgeschrieben (rund 150.000 € aus der Reserve) | Stufe 1, Frühling |
| 4 | Jun 2026 | LPH 5 | Mensa für 450 statt 300 Essen (rund 600.000 €, vier Wochen Umplanung) oder erweiterbar (rund 150.000 €) → erweiterbar, aus der Reserve | Stufe 2, Sommer |
| 5 | Okt 2026 | LPH 5 | Kämmerei: eine Million über dem Budget; Architekt: zwei Millionen (angekündigte Mehrkosten der Haustechnik, gut eine Million, eingerechnet) → eine Zahl plus Risiko mit Spanne; Prüfung der Vergabestelle: gehört zum bestehenden Vertrag, Risiko geschlossen | Stufe 3, Herbst |
| 6 | Feb 2027 | LPH 8 | Sturm, zwei lose Gerüstanker an der Sporthalle → sofort gesperrt, gemeldet, am selben Tag festgehalten; Gerüstfirma zahlt | Stufe 4, Winter (Sturm) |
| 7 | Mai 2027 | LPH 8 | Lüftungsanlage der Gesamtschule vier Monate später → Vorlage mit drei Wegen (Ersatzgerät rund 400.000 €, Leihgeräte rund 150.000 €, später einziehen rund 50.000 €), gewichteter Vergleich 49 : 45 : 45 → Ersatzgerät, aus der Reserve | Stufe 5, Frühling |
| 8 | Jul 2028 | LPH 8 | Freigabe am Ende der Bauzeit mit Auflagen; Hallenboden-Fugen und Feineinstellung der Lüftung an das Gebäudemanagement übergeben | Stufe 6 → 7, Sommer |
| Ende | Aug 2028 | Beginn LPH 9 | Schulstart | Stufe 8, Sommer |

Geld auf dem guten Weg (intern, nie als Zahl auf der Seite): Prognose ohne die angekündigten Mehrkosten rund eine Million über dem Budget (Baupreise, vorgezogene Holzelemente, erweiterbare Mensa); mit dem Ersatzgerät rund 1,4 Millionen über dem Budget, also innerhalb der Reserve. Eine Neufestlegung der Projektbasis ist auf keinem Weg nötig.

## Figuren

| Kennung | Name | Rolle | Alter | Farbe (Vorschlag) | Erkennungszeichen |
|---|---|---|---|---|---|
| sie | Sie | Projektleitung des Bauherrn (Spielfigur, ohne Gesicht) | – | Navy #1D3258, Gold #C69D52 | goldener Bauhelm unter dem Arm |
| grundstein | Gisela Grundstein | Bürgermeisterin, entscheidet für die Stadt als Bauherr | 58 | Weinrot #8E2C48 | goldene runde Brille, Linden-Anstecker |
| faden | Clara Faden | Projektsteuerin (externes Büro) | 41 | Petrol #146878 | rotes Lesebändchen aus dem Notizbuch, Tablet |
| schwung | Konrad Schwung | Architekt, Generalplanung (sein Büro stellt die Bauleitung) | 54 | Orange #E07B24 | langer orangefarbener Schal, Zeichenstift hinter dem Ohr |
| klingel | Hanna Klingel | Schulleiterin der künftigen Gesamtschule, Nutzerin | 46 | Senfgelb #E3A72F | Messing-Handglocke |
| lot | Theo Lot | Bauleiter vor Ort (Büro des Architekten) | 61 | Warnorange #F08A1C | weißer Helm, gelber Zollstock in der Brusttasche |

Steckbriefe, Sprechweisen, Sorgen, Bögen und Porträts: docs/DREHBUCH.md, Abschnitt 2. Weitere Stellen ohne Porträt: Stadtrat, Lenkungskreis, Kämmerei, Schulamt, Vergabestelle, Sicherheitskoordination, Gebäudemanagement der Stadt, Hersteller und Firmen.

## Fundus für Themen und Explore

Theorie-Beispiele und Explore-Werkzeuge (O-50, O-57: Explore-Inhalt bleibt) nutzen zum Teil Angaben aus der früheren Story. Bis r72 widersprachen einige davon der neuen Story (Lüftungsgerät, Kostenstände, Monatsbericht); sie sind seither entweder an die Story angeglichen oder ausdrücklich vom Story-Ereignis gelöst (anderes Gerät, anderer Gegenstand). Regel: Ein Themenbeispiel erzählt kein Story-Ereignis mit anderen Zahlen – entweder gleiche Eckdaten wie die Story oder ein anderer Gegenstand; neue Figurennamen bzw. namenlose Rollen, Zahlen gerundet wie in der Story.

| Angabe | Wert | genutzt in |
|---|---|---|
| Budget und Reserve | 58,4 Mio. € brutto, Reserve 2,9 Mio. € (Basis plus Reserve 61,3 Mio. €) | Theorie-Beispiele |
| Lieferzeit Holzbauelemente | 26 statt 16 Wochen (Story: ein halbes Jahr statt vier Monate), drei von vier Anbietern; Frühwarnung März 2026 (im Thema wie in der Story: der Architekt hört beiläufig von längeren Lieferzeiten, ohne Zahl; die Zahlen erst mit der Klärung), Risiko einen Monat später; Risiko W 4 · A 4 = vorrangig (höchste belegte Auswirkung: Qualität/Funktion Stufe 4, Schulstart ohne neue Gebäude) | Thema „Vorgänge und Risiken“, Explore Risikomatrix |
| Mensa | 450 statt 300 Essen, 0,6 Mio. €, rund vier Wochen Umplanung; Änderung ohne Risikoeintrag; eine Zusage im Flur ist kein Beschluss | Thema „Vorgänge und Risiken“, Explore Vorgangsarten |
| Zwei Kostenrechnungen (an Kapitel 5 angeglichen) | Oktober 2026; Kämmerei und Architekt rund eine Million auseinander; Mehrkosten der Haustechnikfirma, gut eine Million, als Risiko RIS-014 (nicht in der Prognose); Monatsbericht Oktober 2026: Prognose 59,4 Mio. € (+1,7 %), mit den Mehrkosten weiter innerhalb von 61,3 Mio. € | Themen „Verantwortungsfelder“, „Arbeitsweise“, „Vorgänge und Risiken“, „Takt und Bericht“; Explore Risikomatrix (RIS-014) |
| Brandschutzauflage | Kapselung der Holzbauteile in den Fluren, 0,4 Mio. €; Problem mit Zwischenmaßnahme | Thema „Vorgänge und Risiken“ |
| Wärmepumpe der Grundschule (Beispiel des Standards, HB 3.2 „verspätete Anlagenlieferung“) | bewusst ein anderes Gerät als die Lüftungsanlage aus Kapitel 7; Ersatzgerät 80.000 € / 7 Tage, Abwarten 20.000 € / 28 Tage; mit den vereinfachten Skalen des Standards 41 : 35 bei Gewichten 3 / 5 / 2, Gleichstand 31 : 31 bei Termingewicht 3; liegt im Mandat der Projektleitung (bis 100.000 € ohne Reserve) | Thema „Entscheidungsvorlage“, Wendekarte in „Vorgänge und Risiken“ (der Explore-Vergleichsrechner rechnet seit L-232 mit Kapitel 7) |
| Grenzen der Risikobewertung (Projektblatt) | Kosten bis 0,1 / 0,5 / 1,5 / 3,0 Mio. € → Stufe 1–4, darüber 5; Termin bis 14 / 28 / 42 / 70 Tage → Stufe 1–4, darüber 5; ein Grenzwert gehört zur niedrigeren Stufe; Wahrscheinlichkeit bis 10 / 30 / 50 / 70 % → Stufe 1–4, darüber 5 (Explore, Beispielwert, L-253; die Beispiele wählen die Stufe direkt, keine Prozentzahl als Fall-Tatsache) | Explore Risikomatrix, Explore Risiko-Bewerter |
| Kennungen der früheren Story | RIS-005, RIS-009, RIS-014, RIS-021, RIS-022, AEN-012, AEN-013, PRB-002, MAS-007, MAS-011, PRB-019 | Theorie-Kommentare, Explore; die neue Story verwendet sichtbar keine Kennungen |
| Lüftungsanlage der Gesamtschule (Kapitel 7) | vier Monate später; drei Wege, Ersatzgerät rund 400.000 €, Entscheidung der Bürgermeisterin | Themen „Arbeitsweise“ und „Vorgänge und Risiken“ (Sortierposten, an die Story angeglichen), Explore Vergleichsrechner |
| Datenstand der Vorlage zur Lüftungsanlage | „Datenstand Mai 2027“ (Monat der Szene in Kapitel 7; die Story nennt keinen Datenstand) – Explore, Beispielwert, L-253 | Explore Vorlagen-Check (`lueftung-voll`) |
| Qualitäts-Ampel im Monatsbericht Oktober 2026 | „Qualität grün – keine Einschränkung bekannt“ (die Story nennt keine Qualitätsangabe) – Explore, Beispielwert, L-253 | Explore Monatsbericht (`oktober`) |
| RIS-021 Kampfmittelverdacht im Baufeld der Sporthalle | W 1 · A 5 wie in der Explore-Risikomatrix; die Auswirkung 5 in der Zeile Qualität/Funktion und der Warnanlass Sicherheit – Explore, Beispielwert, L-254; Kosten und Termin unbekannt (keine Zahl) | Explore Risiko-Bewerter (`ris-021`), Explore Risikomatrix |
| Förderfrist | Inbetriebnahme zum Schuljahr 2028/29 | Theorie-Beispiele |
| Gerüst an der Sporthalle (an Kapitel 6 angeglichen) | nach dem Sturm zwei lose Gerüstanker; die Bauleitung sperrt sofort und holt die Sicherheitskoordination; die Projektsteuerung meldet über den vereinbarten Meldeweg und dokumentiert am selben Arbeitstag; keine Uhrzeit, keine Kosten | Themen „Arbeitsweise“ (Sortierposten), „Entscheidungsvorlage“, „Takt und Bericht“; Explore „Takt“ (Karte „Sofort“) |
