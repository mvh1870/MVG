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
gremien: [Stadtrat, Finanzausschuss des Stadtrats (Haushaltsberatung), Lenkungskreis]
hinweis: Fiktiver Fall. Stadt, Projekt, Personen, Zahlen und Ereignisse sind erfunden.
---

Die Stadt Lindenhall baut im Süden der Stadt einen Schulcampus: eine Gesamtschule, eine Grundschule und eine Sporthalle, als Holzhybridbau. Der Stadtrat hat ein Budget von rund 58 Millionen Euro und eine Reserve von rund 3 Millionen Euro beschlossen. Für die Stadt als Bauherr entscheidet die Bürgermeisterin; der Lenkungskreis (Bürgermeisterin, Finanzabteilung, Schulamt) berät sie. Die Leserin oder der Leser ist die Projektleitung des Bauherrn („Sie“). Die Projektsteuerung (Clara Faden, in Station 11 vertreten) bearbeitet und pflegt alle Vorgänge in der Software der Stadt; der Bauherr pflegt keine (O-36). Die Story hat 14 Stationen in drei Akten, beginnt im Januar 2026 und endet Ende August 2028 mit dem Schulstart.

## Wer entscheidet was (Projektblatt der Story)

| Stelle | Entscheidet | Beleg |
|---|---|---|
| Sie (Projektleitung des Bauherrn) | Entscheidungen bis 100.000 €, wenn das Budget sie ohne Reserve trägt | k4.2-p1, k4.2-p3 (Muster, projektbezogen vereinfacht), v24:hb-projektblatt |
| Bürgermeisterin (Bauherr) | alles darüber; jeden Einsatz der Reserve; Annahme großer Risiken; jede Freigabe am Ende einer Leistungsphase (LPH 0–9); Zielpriorität „Schulstart zuerst, dann das Geld“ | k3.2-t1, k4.1-p1, k9.3-p3, v24:hb-1, v24:va-4.1 |
| Lenkungskreis | berät die Bürgermeisterin | k9.3-p3 |
| Vertretung der Bürgermeisterin | Wenn sie nicht da ist, vertritt sie die Leiterin der Finanzabteilung (die Kämmerin) – freie Festlegung des Falls, die Reichweite der Vertretung regelt keine Fachregel; Beleg v24:hb-projektblatt („Entscheidungszuständigkeit und Vertretung“), v24:hb-3.1 | `rahmen.yaml` mandat |
| Projektsteuerin | entscheidet nichts; bereitet vor, bearbeitet und pflegt alle Vorgänge, empfiehlt, hält Beschlüsse getrennt fest, übergibt am Ende | v24:hb-1, v24:hb-3.1, v24:tlb-2.1, v24:va-4.2 |

Das Änderungsgremium des Muster-Mandatsleiters kommt in der Story nicht vor (projektbezogene Festlegung des Bauherrn, siehe docs/DREHBUCH.md, Abschnitt 9).

## Zeitachse der Story (14 Stationen in drei Akten, P19.6)

Stand der Drehbücher `docs/drehbuch-v2/` (dritte Fassung): Akt I Stationen 1–5 (Januar bis Juni 2026), Akt II Stationen 6–10 (August 2026 bis Februar 2027), Akt III Stationen 11–14 (April 2027 bis August 2028). Die Leistungsphase (LPH) gilt intern für die Gesamtschule und läuft monoton; sichtbar steht sie nie als Zahl.

| Station | Monat | LPH intern | Ereignis | Campus |
|---|---|---|---|---|
| 1 | Jan 2026 | 4 | Übernahme; Seite „Wer entscheidet was“, Ziel: Schulstart zuerst | 0, Winter |
| 2 | Mär 2026 | 4 | Hinweis auf längere Lieferzeiten → Frühwarnung | 0, Frühling |
| 3 | Apr 2026 | 4 | Klärung ein halbes Jahr statt vier Monate → Risiko, vorrangig; Holzpaket früher ausschreiben (rund 150.000 € Reserve); Ausschreibung bei „gut“ Ende April, bei „vertretbar“ und „Falle“ Mitte Mai, Zuschlag Los 1 Ende Juni | 1, Frühling |
| 4 | Mai 2026 | 4 (Abschluss) | Genehmigung für den Holzbau mit Brandschutzauflage → Problem; Kapselung der Holzbauteile in den Fluren, rund 0,4 Mio. € aus der Reserve; Zwischenmaßnahme: vorläufig gekapselt geplant (Fertigung und Holzstapel gibt es noch nicht: Zuschlag Los 1 erst im Juni) | 1,5, Frühling, Regen |
| 5 | Jun 2026 | 5 | Mensa erweiterbar (rund 150.000 € Reserve) statt 450 Essen (rund 600.000 €); Anmeldezahlen Ende Juni (nur im Weg „vertretbar“ erzählt); ein späterer Ausbau wäre ein neuer Antrag; Zuschlag Los 1 Ende Juni (nicht gespielt) | 2, Sommer |
| 6 | Aug 2026 | 6 | Elternabend in der Containerschule; Zeitung „Lindenbote“ | 2,5, Sommer |
| 7 | Sep 2026 | 7 | Zuschlag fürs zweite Holzlos (Grundschule), Freigabe der Bürgermeisterin, Bestellung über die Vergabestelle; Preisnachlass-Angebot für spätere Holzarbeiten als Chance, nicht in der Prognose | 2,5, Herbst |
| 8 | Okt 2026 | 7 | zwei Kostenstände → eine Zahl plus Risiko; Prüfung der Vergabestelle: gehört zum Vertrag, Risiko geschlossen | 3, Herbst |
| 9 | Dez 2026 | 8 | Monatsbericht und Monatstermin; Planstand Fassade überfällig; **Netzbetreiber: Anschluss im März statt Januar 2027, Problem mit Zwischenlösung Baustrom, ohne Folge für den Schulstart** | 3,5, Winter, Schnee |
| 10 | Feb 2027 | 8 | Sturm, zwei lose Gerüstanker an der Sporthalle (wie heute); Gerüstfirma übernimmt die Kosten (nur im Weg „gut“ erzählt, sonst Streit, nach einer Woche geklärt); Anker auf jedem Weg erneuert | 4, Winter, Sturm |
| 11 | Apr 2027 | 8 | Clara Faden fällt drei Wochen aus; **der Lüftungshersteller deutet möglichen Verzug an, ohne Termin (Frühwarnung)** und will bis Freitag eine Antwort zum Einbautermin; Eintrag lückenhaft („frag Theo“, zwischen zwei Terminen notiert); Übergabe an die Vertretung | 4,5, Frühling, Regen |
| 12 | Mai 2027 | 8 | **Verzug bestätigt, vier Monate (ausgefallener Liefertermin = Problem)**; drei zulässige Wege, vierter Vorschlag erreicht laut Datenblatt die geforderte Luftmenge nicht und scheidet vor den Punkten aus; 49 : 45 : 45 → Ersatzgerät (rund 400.000 € Reserve); **Auflage des Beschlusses: vor dem Schulstart eingebaut und in Betrieb** | 5, Frühling |
| 13 | Nov 2027 | 8 | Haushaltsberatung; Wirkung der Kapselung von der Brandschutzbehörde bestätigt (die Bestätigung trifft erst am Nachmittag ein); Hallenboden-Fugen (zwei Stellen), Firma sagt Nachbesserung bis zu den Herbstferien 2028 zu | 5,5, Herbst, Nebel |
| 14 | Jul 2028 | 8 → 9 | Freigabe mit Auflagen; Fugen und Feineinstellung der Lüftung an das Gebäudemanagement | 6 → 7, Sommer |
| Ende | Aug 2028 | Beginn 9 | Schulstart | 8, Sommer |

**Fakten mit Zahlen (nur was die Drehbücher belegen; sie widersprechen der Fall-Bibel nicht):**
- **Geld auf dem guten Weg:** Prognose im Oktober 2026 rund eine Million über dem Budget (59,4 Mio. €, +1,7 %): Baupreise rund 0,3 Mio. €, Kapselung 0,4, vorgezogenes Holzpaket 0,15, erweiterbare Mensa 0,15 (zusammen 1,0). Mit dem Ersatzgerät (0,4) im Mai 2027 rund 1,4 Mio. € über dem Budget (59,8 Mio. €, +2,4 %), **innerhalb der Reserve** von 2,9 Mio. €; knapp die Hälfte der Reserve ist am Ende verbraucht. **Bis Oktober 2026 sind Reserveeinsätze von 0,15 + 0,4 + 0,15 = 0,7 Mio. € bereits beschlossen** (Buch 3, 4, 5). Die angekündigten Mehrkosten der Haustechnik (gut eine Million, Risiko, nicht in der Prognose) bleiben wie heute und erweisen sich als unberechtigt. Kein Geldrückfluss in Station 13 und keine „zurückgehaltene Reserve“ in Station 8. **Die Zerlegung der einen Million gilt für die gute Linie; auf Wegen mit Falle kommen kleine Mehrkosten ohne Summe hinzu, die Folgen erzählen sie nur als Verzug und Arbeit.** „Rund eine Million“ ist der gerundete Stand, den Buch 8 und der Monatsbericht für alle Wege nennen (L-276).
- **Genehmigung:** Für Baugrube und Gründung der Gesamtschule lag eine Teilgenehmigung vor; die Genehmigung für den Holzbau kommt im Mai 2026 mit der Auflage (Fundus: „Baugenehmigung kommt mit Brandschutzauflagen zum Holzbau“, Kapselung in den Fluren, 0,4 Mio. €). Die Wirkung bestätigt die Brandschutzbehörde im November 2027.
- **Holzpaket in zwei Losen:** Los 1 Gesamtschule und Sporthalle, Zuschlag Juni 2026 (nicht gespielt); Los 2 Grundschule, Zuschlag September 2026 (Station 7). Lieferzeit insgesamt ein halbes Jahr, in Chargen: die ersten Chargen vier bis fünf Monate nach dem Zuschlag (stimmt mit „erste Holzelemente im Oktober 2026“ und dem Tragwerk der Sporthalle im Februar 2027).
- **Elternabend** Ende August 2026 in den Containern der Gesamtschule. **Monatsbericht Dezember 2026** (eine Seite): Prognose unverändert 59,4 Mio. €; die Mehrkosten der Haustechnik sind seit November geschlossen. **Netzbetreiber** und **Brandschutzbehörde** als nur erwähnte Stellen.
- **Fall-Tatsachen der Stationen (aus 01, 02 und 03 gesammelt):** Station 3 Zeiten der Ausschreibung (Zeitachse oben); Station 4 zweiter Weg „Gesamtschule anders aufbauen, deutlich teurer und langsamer“ (nur qualitativ), Zwischenlösung „vorläufig gekapselt geplant“, Zuschlag Los 1 erst im Juni; Station 5 Anmeldezahlen Ende Juni (nur im Weg „vertretbar“ erzählt); Station 6 ein späterer Ausbau der Mensa wäre ein neuer Antrag der Schule (entscheiden würde die Bürgermeisterin); Station 7 Anfang September, Bindung bis Freitag, Zimmerleute ab Januar, bei Falle zwei Wochen längere Lieferzeit; Station 9 Netzanschluss im März statt Januar, Kapselung bis Dezember 2026 eingebaut, der Netzanschluss steht auf jedem Weg im Bericht; Station 10 Gerüstfirma zahlt (nur „gut“), Stopp der Baustelle bei „Falle“ am Freitagabend; Station 11 Hersteller will bis Freitag eine Antwort, Dachfenster-Abnahme bei Lot (Falle), Hustentasse; Station 12 Auflage „eingebaut und in Betrieb“, vierter Vorschlag günstiger, aber unter der geforderten Luftmenge; Station 13 Behörde bestätigt nachmittags; Station 14 Feineinstellung der Lüftung im ersten Winter (Übergabeposten, keine Auflage von Station 12); die Leiterin der Finanzabteilung (Kämmerin) vertritt die Bürgermeisterin (freie Festlegung ohne Regel).

## Figuren

| Kennung | Name | Rolle | Alter | Farbe (Vorschlag) | Erkennungszeichen |
|---|---|---|---|---|---|
| sie | Sie | Projektleitung des Bauherrn (Spielfigur, ohne Gesicht) | – | Navy #1D3258, Gold #C69D52 | goldener Bauhelm unter dem Arm |
| grundstein | Gisela Grundstein | Bürgermeisterin, entscheidet für die Stadt als Bauherr | 58 | Weinrot #8E2C48 | goldene runde Brille, Linden-Anstecker |
| faden | Clara Faden | Projektsteuerin (externes Büro) | 41 | Petrol #146878 | rotes Lesebändchen aus dem Notizbuch, Tablet |
| schwung | Konrad Schwung | Architekt, Generalplanung (sein Büro stellt die Bauleitung) | 54 | Orange #E07B24 | langer orangefarbener Schal, Zeichenstift hinter dem Ohr |
| klingel | Hanna Klingel | Schulleiterin der künftigen Gesamtschule, Nutzerin | 46 | Senfgelb #E3A72F | Messing-Handglocke |
| lot | Theo Lot | Bauleiter vor Ort (Büro des Architekten) | 61 | Warnorange #F08A1C | weißer Helm, gelber Zollstock in der Brusttasche |

Steckbriefe, Sprechweisen, Sorgen, Bögen und Porträts der fünf Hauptfiguren: docs/DREHBUCH.md, Abschnitt 2 (Steckbriefe aufgefrischt in `docs/drehbuch-v2/04-rahmen.md` 4.2).
Neu in P19.6 (O-62): drei Nebenfiguren mit Porträt in `src/grafik/figuren.ts` (`NEBENFIGUREN`), Namen und Rollen laut `docs/drehbuch-v2/04-rahmen.md` 4.3; sie sprechen nur im Ton, nie in Tatsachen, die vom Weg abhängen.

| Kennung | Name | Rolle | Alter | Akzent | Auftritte | Erkennungszeichen |
|---|---|---|---|---|---|---|
| ranzen | Marlene Ranzen | Elternvertreterin (Vorsitzende des Elternbeirats der künftigen Gesamtschule) | 39 | grün | Station 6 (Hauptauftritt), 13 (Echo), Ende | Klemmbrett mit Fragenliste, grasgrüne Regenjacke |
| spitzfeder | Bernd Spitzfeder | Lokalreporter der Zeitung „Lindenbote“ | 52 | keiner (Papierton) | Station 6, 13 (nur Schlagzeile im Echo), Ende | Notizblock mit Gummiband, Bleistift im Mützenband |
| pfennig | Ewald Pfennig | Stadtrat im Finanzausschuss | 63 | beere | Station 8 (in der Folge), 13 (Hauptauftritt), Ende | Taschenuhr mit Kette, blauer Ordner |

Die Zeitung „Lindenbote“ ist fiktiv („Presse ist Kulisse“, keine Regel zu Presse oder Außenkommunikation). Die **Vertretung** von Clara Faden (Station 11) und die **Vergabestelle** (Station 7, am Telefon) sind Stimmen ohne Gesicht (`STIMMEN`: Umriss mit Sprechlinien). Nur erwähnt, ohne Porträt: Stadtrat als Gremium, Lenkungskreis, Finanzabteilung, Schulamt, Sicherheitskoordination, Gebäudemanagement, Brandschutzbehörde, Netzbetreiber, Hersteller und Firmen.


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
