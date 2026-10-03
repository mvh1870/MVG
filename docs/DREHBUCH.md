# Drehbuch der Story (P17.1, O-51 bis O-58)

Verbindliches Drehbuch der neuen Story des Governance Kompass. Daraus werden die Inhalte geschrieben (P17.5), Format und Engine gebaut (P17.2), die Grafik gezeichnet (P17.3), die Fläche gebaut (P17.4) und Regie und Leinwand angepasst (P17.6). Es ersetzt die Fassung P16.5 (Stationen s1–s8, Statusanzeige, Vorlagen an jeder Station) vollständig (O-51 ändert O-40).

Grundlage: O-51 bis O-58, dazu O-1, O-3, O-14, O-36, O-38, O-44, O-50. Fachquellen: `quellen/v2.4/` (Handbuch = `v24:hb-…`, Teilleistungsbild = `v24:tlb-…`, Vertragsanlage Teil A = `v24:va-…`, Projektblatt = `v24:hb-projektblatt`) und `quellen/whitepaper/v1.2/whitepaper.json` (Absatz-IDs `k…`). Bei Widerspruch gilt V2.4 (O-36). Handlung, Personen und Zahlen sind frei erfunden (O-52); der Fall ist fiktiv und so gekennzeichnet (O-3). Nachschlagewerk zum Fall: `inhalte/fall.md`.

**Lesart dieses Dokuments:** Alles, was auf der Seite erscheint, steht in Zitatblöcken (`>`) oder in den Spalten „sichtbar“. Alles andere ist Regieanweisung und bleibt intern – insbesondere die Spalte **Beleg** und die Wertung der Antworten (gut / vertretbar / Falle). Auf der Seite stehen nie „Whitepaper“, „Kapitel“, Absatz-IDs, Belege, Kennungen wie `FRW-001` oder „LPH“ ohne Erklärung (O-38, O-56, `werkzeuge/sichtbar.mjs`).

---

## 0 · Regeln für die Umsetzung

1. **Ein Fluss, acht Kapitel, ein Ende.** Auftakt → Kapitel 1–8 → Schulstart mit Bilanz. Jedes Kapitel läuft so: **Einstieg** (Monat, Campus-Bild) → **Szene** (Dialog mit Porträts) → **Frage an Sie** → **drei Antworten** → **Folge-Szene** der gewählten Antwort, die Balken bewegen sich → **So macht man es gut** → in Kapitel 2, 4, 6, 8 die **Mini-Aufgabe** → Kasten **Das steckt dahinter** mit Link zum Thema. „Weiter“ Schritt für Schritt, oben eine schlanke Fortschrittslinie („3 von 8“).
2. **Sichtbare Kapitelbezeichnung:** Nummer und Titel, ohne das Wort „Kapitel“ – z. B. „3 · Wie gefährlich ist das?“, in der Fortschrittslinie „3 von 8“. Grund: `werkzeuge/sichtbar.mjs` sperrt „Kapitel“ als Whitepaper-Bezug; die Story braucht das Wort nicht.
3. **Zusammenlaufen:** Jede Folge-Szene endet beim selben Sachstand wie die gute Antwort (die Holzelemente werden früher ausgeschrieben, die Mensa wird erweiterbar, das Ersatzgerät kommt …). Was sich unterscheidet, sind der Weg dorthin, der Ton der Szene und die Balken. Kein späteres Kapitel setzt eine bestimmte Wahl voraus; die Engine braucht keine Bedingungen außer den Balkenständen am Ende.
4. **Reihenfolge der Antworten** auf der Seite ist je Kapitel fest (deterministisch) und gemischt; sie steht in der Spalte „Platz“. Die Wertung ist nie sichtbar – die Folge-Szene und die Balken zeigen sie.
5. **Wer entscheidet** (überall gleich, Kärtchen „Wer entscheidet was“ aus Kapitel 1): Sie bis 100.000 Euro, wenn das Budget es ohne Reserve trägt; alles darüber, jede Freigabe, jeder Griff in die Reserve, die Annahme großer Risiken und die Zielpriorität bei der Bürgermeisterin für die Stadt als Bauherr; der Lenkungskreis berät sie; die Projektsteuerin bereitet alles vor, bearbeitet und pflegt alle Vorgänge, empfiehlt und entscheidet nie. Keine Figur verstößt dagegen, ohne dass die Folge-Szene es korrigiert.
6. **Sprache:** warm erzählend, kurze Sätze, Anrede „Sie“, keine Abkürzungen (kein „PL“, „GML“, „MCDA“, keine Kennungen), runde Zahlen nur, wo es ohne nicht geht. „Leistungsphase“ erscheint genau einmal erklärt (Kärtchen in Kapitel 1). Fachbegriffe, die der Bauherr kennen soll, dürfen vorkommen und werden im Satz erklärt: Frühwarnung, Risiko, Problem, Änderung, Maßnahme, Aufgabe, Vorlage, Freigabe, Freigabe mit Auflagen, Reserve, Lenkungskreis, gewichteter Vergleich.
7. **Kein Vertrieb** (O-1). Einziger Link nach außen ist der leise Textlink am Ende (O-44).
8. **Fiktiv:** Auftakt und Ende tragen die Marke „Fiktiver Fall“ (O-3).

---

## 1 · Leitidee und Lernziele

**Leitidee (sichtbar im Auftakt sinngemäß, intern als Richtschnur):**
Sie leiten für die Stadt Lindenhall den Bau eines Schulcampus, und im Sommer 2028 sollen die Kinder einziehen. Unterwegs kommen ein Warnsignal, ein großer Wunsch, zwei widersprüchliche Zahlen, ein Sturm und eine große Entscheidung – und jedes Mal geht es um dieselbe Frage: Wer bereitet vor, wer entscheidet, und wie bleibt das nachvollziehbar? Die Projektsteuerin nimmt Ihnen die Arbeit ab, die Bürgermeisterin trifft die großen Entscheidungen, und Sie sorgen dafür, dass jede Frage rechtzeitig an die richtige Stelle kommt.

**Roter Faden:** der Schulstart im Sommer 2028 – das Ziel, das die Bürgermeisterin in Kapitel 1 an die erste Stelle setzt und das in Kapitel 7 die Gewichte bestimmt.

| Nr | Lernziel (was ein Bauherr nach der Geschichte verstanden hat) | Kapitel | Beleg |
|---|---|---|---|
| 1 | Wer was entscheiden darf, wird vorab schriftlich festgelegt, mit Schwellen; welches Ziel zuerst kommt, legt der Bauherr selbst fest. | 1 | k4.2-p1, k4.2-p2, k4.2-p3 (Muster), k4.1-p1, k3.2-t1, v24:hb-projektblatt (Befugnisse und Schwellen), v24:va-4.1 |
| 2 | Die Projektsteuerung bearbeitet und pflegt alle Vorgänge, bereitet jede Entscheidung vor und empfiehlt – entscheiden, genehmigen oder bestätigen darf sie nicht; der Bauherr pflegt nichts, er entscheidet. | alle | v24:hb-1 (Abs. 1 und „befugte Stelle“), v24:hb-3, v24:tlb-1, v24:tlb-2.1, v24:va-4.1, v24:va-4.2, O-36 |
| 3 | Ein unklarer Hinweis ist eine Frühwarnung: Quelle, Prüffrage, wer bis wann prüft; nach der Klärung wird er Risiko, Problem oder Aufgabe oder wird begründet geschlossen. | 2 | v24:hb-1 (Tabelle), v24:hb-1.2, v24:hb-4 (Abs. 3), v24:tlb-2 |
| 4 | Ein Risiko wird nach Wahrscheinlichkeit und höchster belegter Auswirkung eingestuft; was vorrangig ist, erfährt der Bauherr sofort; ob ein großes Risiko getragen oder Reserve dagegen eingesetzt wird, entscheidet der Bauherr. | 3 | v24:hb-2, v24:hb-3 (Tabelle Prioritäten, wesentliche Risiken), v24:hb-1.3, k4.4-p1, k3.2-t1 |
| 5 | Ein Wunsch, der den geltenden Stand ändert, ist eine Änderung: Antrag, Vergleich mit dem geltenden Stand, mindestens zwei Wege, Entscheidung der befugten Stelle; bis dahin gilt die bisherige Planung; eine Zusage im Flur ist kein Beschluss. | 4 | v24:hb-1.5, v24:hb-3.1 (letzter Absatz), v24:va-4.2, k4.3-p2 |
| 6 | Es gibt einen maßgeblichen Datenstand; unterschiedliche Zahlen werden begründet, nicht gemittelt; Unsicheres steht als Risiko mit Spanne daneben und wird nicht doppelt gezählt. | 5 | v24:hb-2 (Abs. 3, 6), v24:hb-3 (Abs. „Unterschiedliche Einschätzungen“), v24:hb-5, v24:tlb-3, k4.6-p1, k4.6-p2 |
| 7 | Dringliches wird sofort gemeldet und am selben Arbeitstag festgehalten; Schutz wartet nicht auf eine Vorlage; Dringlichkeit ersetzt keine Freigabe. | 6 | v24:hb-4, v24:hb-3 (Sicherheit unabhängig von der Matrix), v24:hb-1.4, v24:hb-3.1 (Vorlegen und nachhalten), v24:tlb-5 |
| 8 | Eine Entscheidungsvorlage hat mindestens zwei zulässige Wege, einen gewichteten Vergleich nach vorab abgestimmten Gewichten, eine Prüfung, ob andere Gewichte die Rangfolge ändern, und eine begründete Empfehlung; der Beschluss fällt getrennt bei der befugten Stelle. | 7 | v24:hb-3.1, v24:hb-3.2, v24:tlb-2.1, v24:va-3.1 bis v24:va-3.5, k3.2-t1, k4.1-p1 |
| 9 | Die Freigabe erteilt der Bauherr selbst (Freigabe, keine Freigabe, Freigabe mit Auflagen), der Lenkungskreis berät; Offenes wird mit Termin und Zuständigen übergeben, nie als erledigt ausgegeben. | 8 | k9.3-p3, k6.4.4-p1, k4.5-p1, v24:hb-5 (Abs. 6–8), v24:tlb-2 (Abschließen und übergeben), v24:hb-1.4 |

---

## 2 · Figuren

Sechs Porträts (Sie als Spielfigur plus fünf Figuren), flach, als Vektorgrafik selbst gezeichnet (O-53), Brustbild im Dreiviertelprofil auf einem runden Farbfeld in der Figurenfarbe. Farben sind Vorschläge für die Akzentpalette (P17.3 legt die Tokens fest; Kontrast ≥ 4,5:1 gilt für Text, nicht für Flächen der Zeichnung). Die Namen sind erfunden; eine Suche nach realen bekannten Personen gleichen Namens ergab keinen Treffer (2026-10-03).

### Sie – Projektleitung des Bauherrn (Spielfigur)

| Feld | Inhalt |
|---|---|
| Name | keiner – immer „Sie“ |
| Steckbrief (sichtbar) | Sie leiten das Projekt für die Stadt. Sie pflegen keine Listen – Sie entscheiden, was in Ihrem Rahmen liegt, und bringen alles andere rechtzeitig zur Bürgermeisterin. |
| Sprechweise | Sie sprechen nie in Dialogzeilen; Ihre Stimme sind die Antworten. |
| Sorge | dass etwas Wichtiges an Ihnen vorbeiläuft |
| Bogen | von „neu im Amt, keiner kennt Sie“ zu der Person, auf deren Vorlagen sich alle verlassen (Balken Vertrauen) |
| Porträt | ohne Gesicht, von schräg hinten: Navy-Jacke (#1D3258), goldener Bauhelm unter dem Arm (#C69D52), Mappe in der Hand. Erkennungszeichen: der goldene Helm. Erscheint klein am Rand jeder Frage („Ihre Entscheidung“). |

### Gisela Grundstein – Bürgermeisterin, entscheidet für die Stadt als Bauherr

| Feld | Inhalt |
|---|---|
| Alter, Typ | 58, seit acht Jahren Bürgermeisterin; ruhig, direkt, mag keine Umwege |
| Steckbrief (sichtbar) | Sie entscheidet für die Stadt die großen Dinge: was zuerst kommt, jede Freigabe, jeden Griff in die Reserve. Der Lenkungskreis berät sie – entscheiden tut sie. |
| Sprechweise | kurze Sätze, fragt zuerst nach der Frage, dann nach den Details; trockener Humor |
| Beispielsätze | „Was genau soll ich entscheiden – und bis wann?“ · „Ich bin Bürgermeisterin, nicht Bauleiterin.“ |
| Sorge | im Stadtrat eine Zahl vertreten zu müssen, die sie nicht versteht |
| Bogen | von „Regeln Sie das, ich will nicht mit jeder Kleinigkeit behelligt werden“ (Kapitel 1) über „Ich brauche eine Zahl, keine zwei“ (5) zu „Ich wusste jedes Mal, worüber ich entscheide“ (Ende) |
| Porträt | silbergrauer Bob, große runde Brille mit goldenem Rand, weinroter Blazer (#8E2C48) über cremefarbener Bluse. Erkennungszeichen: die goldene Brille und ein kleiner Stadtwappen-Anstecker (Linde) am Revers. |

### Clara Faden – Projektsteuerin

| Feld | Inhalt |
|---|---|
| Alter, Typ | 41, leitet die Projektsteuerung aus einem externen Büro; genau, freundlich, unbestechlich |
| Steckbrief (sichtbar) | Sie hält alle Fäden zusammen: Sie erfasst und pflegt jeden Vorgang, prüft jede Woche alles Offene und bereitet jede Entscheidung vor – mit mindestens zwei Wegen und einer Empfehlung. Entscheiden darf sie nicht. |
| Sprechweise | sachlich und warm, zählt gern auf („Erstens …“), sagt unbequeme Dinge ohne Drama |
| Beispielsätze | „Ich empfehle. Entscheiden tun Sie.“ · „Offenes zeige ich als offen.“ |
| Sorge | dass eine Entscheidung ohne Vorlage fällt – oder eine Vorlage ohne Entscheidung liegen bleibt |
| Bogen | von der „Frau mit den Listen“, über die der Bauleiter spottet, zur Person, auf deren Einträge sich alle verlassen; sie lässt sich nie dazu bringen, etwas kleiner oder erledigter darzustellen, als es ist (3, 8) |
| Porträt | dunkles Haar zum tiefen Zopf, Pullover in Petrol (#146878), Tablet unter dem Arm. Erkennungszeichen: ein roter Faden – ein rotes Lesebändchen, das aus ihrem Notizbuch hängt (#C8452F). |

### Konrad Schwung – Architekt, Generalplanung

| Feld | Inhalt |
|---|---|
| Alter, Typ | 54, leitet das Büro, das den Campus plant und die Bauleitung stellt; begeistert, optimistisch, ein guter Planer |
| Steckbrief (sichtbar) | Er plant den Campus von der ersten Linie bis zur letzten Fuge. Er findet für alles eine Lösung – manchmal schneller, als ihm lieb sein sollte. |
| Sprechweise | locker, bildhaft, viel „wird schon“ |
| Beispielsätze | „Das kriegen wir hin.“ · „Das pendelt sich ein, glauben Sie mir.“ |
| Sorge | dass sein Entwurf am Ende kleingespart wird |
| Bogen | vom Optimisten, der Warnzeichen beiläufig erwähnt (2) und beim Schulfest etwas zusagt (4), zum Planer, der schlechte Nachrichten sofort und mit Lösungen bringt: „Ich sag's lieber gleich und nicht erst, wenn's brennt“ (7) |
| Porträt | graue Locken, runde schwarze Brille, schwarzer Rollkragen. Erkennungszeichen: ein langer orangefarbener Schal (#E07B24) und ein Zeichenstift hinter dem Ohr. |

### Hanna Klingel – Schulleiterin der künftigen Gesamtschule, Nutzerin

| Feld | Inhalt |
|---|---|
| Alter, Typ | 46, leitet die Gesamtschule, die in den Campus einzieht; herzlich, hartnäckig, denkt in Schuljahren |
| Steckbrief (sichtbar) | Sie weiß, was die Kinder brauchen – und sie will viel davon. Jeder Wunsch hat einen guten Grund; nicht jeder passt ins Budget. |
| Sprechweise | lebhaft, sagt „die Kinder“, wenn sie „der Bedarf“ meint |
| Beispielsätze | „Später ist immer zu spät – die Kinder essen jetzt.“ · „Ich will nur eins hören: Können die Kinder kommen?“ |
| Sorge | dass ihre Schule im Sommer 2028 noch in Containern sitzt |
| Bogen | von der Nutzerin, die eine Zusage am Rand des Schulfests für einen Beschluss hält (4), zur Partnerin, die den Weg über die Änderung kennt und am Ende die Kinder begrüßt (Ende) |
| Porträt | rotbraunes Haar hochgesteckt, senfgelbe Strickjacke (#E3A72F), bunte Kette. Erkennungszeichen: eine kleine Messing-Handglocke, die sie am Ende läutet. |

### Theo Lot – Bauleiter

| Feld | Inhalt |
|---|---|
| Alter, Typ | 61, Bauleiter vor Ort für das Büro des Architekten; erfahren, brummig, verlässlich |
| Steckbrief (sichtbar) | Er ist jeden Tag auf der Baustelle und kennt jede Schraube. Schreiben findet er lästig – bauen nicht. |
| Sprechweise | knapp, handfest, Sätze ohne Schnörkel |
| Beispielsätze | „Holz kommt, wenn es kommt.“ · „Wenn umgeplant wird, will ich es wissen, bevor ich Beton gieße – nicht danach.“ |
| Sorge | Stillstand: Leute, die herumstehen, und Zeit, die keiner zurückgibt |
| Bogen | vom „Ich bau, ich schreib nicht“ (2) über den Sturm (6), nach dem ein sauberer Eintrag zeigt, wer zahlt, zu „Steht alles drin. Hätte ich nicht gedacht, dass ich das mal gut finde“ (Ende) |
| Porträt | grauer Schnurrbart, wettergegerbtes Gesicht, weißer Helm, orangefarbene Warnweste (#F08A1C) über kariertem Hemd. Erkennungszeichen: ein gelber Zollstock in der Brusttasche. |

**Weitere Stellen, die nur erwähnt werden (keine Porträts):** der Stadtrat (hat Budget und Reserve beschlossen, wird berichtet), der Lenkungskreis (Bürgermeisterin, Kämmerei, Schulamt; Sie berichten, die Projektsteuerin stellt die Vorlagen vor; er berät), die Kämmerei, die Vergabestelle der Stadt, die Sicherheitskoordination, das Gebäudemanagement der Stadt (übernimmt am Ende den Betrieb), Hersteller und Firmen.

---

## 3 · Die drei Balken: Geld · Zeit · Vertrauen

| Balken | Bedeutung (sichtbar als Kurztext beim ersten Auftritt) | Start |
|---|---|---|
| **Geld** | > Wie viel vom Budget und von der Reserve noch für Unvorhergesehenes übrig ist. | gut gefüllt |
| **Zeit** | > Wie viel Luft bis zum Schulstart im Sommer 2028 bleibt. | halb gefüllt |
| **Vertrauen** | > Wie sehr sich Bürgermeisterin, Schule und Stadtrat auf Ihre Vorlagen verlassen. | knapp unter der Mitte – Sie sind neu |

**Rechnung (intern, nie als Zahl auf der Seite):** Stufen 0 bis 10. Start Geld 9, Zeit 6, Vertrauen 4. Jede Antwort bewegt jeden Balken um −2, −1, 0, +1 oder +2; das Ergebnis wird auf 0 bis 10 begrenzt. Auf der Seite: Balken mit Füllstand, beim Wechsel ein Pfeil und ein Wort („Zeit: etwas mehr Luft“, „Vertrauen: deutlich gesunken“; ±1 = „etwas“, ±2 = „deutlich“), bei 0 „unverändert“. Nie nur Farbe: Pfeil + Wort + Füllstand.

**Stand am Ende** (für Bilanz und Ende): niedrig 0–3 · mittel 4–6 · hoch 7–10.

**Bilanz-Typen** (die erste zutreffende Regel gilt):

| Regel | Titel (sichtbar) | Text (sichtbar) |
|---|---|---|
| Vertrauen niedrig | **Gebaut, aber nicht getragen** | > Die Gebäude stehen, doch das Vertrauen hat gelitten: Zu oft hat die Bürgermeisterin Dinge zu spät oder auf Umwegen erfahren. Ein Projekt braucht nicht nur Holz und Beton, sondern Entscheidungen, auf die sich alle verlassen können. |
| Zeit niedrig | **Auf den letzten Metern** | > Die Schule hat geöffnet, aber der Puffer war am Ende aufgebraucht. Abwarten fühlt sich vorsichtig an – auf einer Baustelle kostet es fast immer Zeit. |
| Zeit hoch, Vertrauen hoch, Geld mindestens mittel | **Ruhig ins Ziel** | > Die Kinder sind pünktlich eingezogen, und jede große Entscheidung lag dort, wo sie hingehört. Sie haben früh gefragt, vollständig vorgelegt und nichts versteckt – so bleibt ein Projekt steuerbar, auch wenn es stürmt. |
| alle anderen | **Geschafft – mit Umwegen** | > Der Campus steht, die Kinder sind da – aber manches hat länger gedauert oder mehr gekostet als nötig. Wo eine Frage später als möglich an die richtige Stelle kam, hat das Projekt dafür bezahlt. |

**Je Balken ein Satz unter dem Bilanz-Titel** (sichtbar):

| Balken | hoch | mittel | niedrig |
|---|---|---|---|
| Geld | > Die Reserve wurde dort eingesetzt, wo sie gebraucht wurde – jedes Mal von der Bürgermeisterin freigegeben –, und ein guter Teil ist übrig. | > Ein großer Teil der Reserve ist verbraucht; manches wurde teurer, weil es spät entschieden wurde. | > Die Reserve ist fast aufgebraucht – Eile, Umwege und eine halb eingerechnete Forderung haben sie aufgezehrt. |
| Zeit | > Der Puffer hat gehalten; das Projekt hatte bis zum Schluss Luft. | > Der Puffer ist dünn geworden, aber er hat gereicht. | > Der Puffer ist aufgebraucht; die Sporthalle öffnet erst nach den Herbstferien. |
| Vertrauen | > Bürgermeisterin, Schule und Stadtrat haben sich auf Ihre Vorlagen verlassen können. | > Man vertraut Ihnen – fragt aber gern noch einmal nach. | > Die Bürgermeisterin lässt sich inzwischen jede Zahl zweimal zeigen. |

**Nachgerechnete Wege** (Balkenwirkungen aus Abschnitt 4; P17.2 testet sie):

| Weg | Geld | Zeit | Vertrauen | Bilanz |
|---|---|---|---|---|
| immer gut | 7 (hoch) | 9 (hoch) | 10 (hoch, ab Kapitel 4 voll) | Ruhig ins Ziel |
| immer vertretbar | 5 (mittel) | 2 (niedrig) | 4 (mittel) | Auf den letzten Metern |
| immer Falle | 1 (niedrig) | 2 (niedrig) | 0 (niedrig) | Gebaut, aber nicht getragen |
| Kurzfassung, immer gut | 7 | 9 | 10 | Ruhig ins Ziel |

---

## 4 · Auftakt und die acht Kapitel

### Auftakt

Campus Stufe 0 · Winter · Morgen (wie Kapitel 1), groß. Marke „Fiktiver Fall“. Darunter die fünf Figuren als Karten (Porträt, Name, Rolle, Steckbrief aus Abschnitt 2) und die drei Balken.

> **Ein Schulcampus für Lindenhall**
> Ein fiktiver Fall: Die Stadt Lindenhall baut im Süden der Stadt eine Gesamtschule, eine Grundschule und eine Sporthalle. Sie leiten das Projekt für die Stadt. Im Sommer 2028 sollen die Kinder einziehen.
> Es ist kein echtes Projekt, aber es könnte eines sein: Die Fragen, die hier auftauchen, stellen sich auf vielen Baustellen.
> Unterwegs müssen Sie sich achtmal entscheiden. Ihre Antworten bewegen drei Balken: Geld, Zeit und Vertrauen. Am Ende sehen Sie, wie Ihr Projekt ausgegangen ist.
> Diese fünf Menschen begleiten Sie:

Knopf: > Los geht's · daneben leise: > Kurzfassung (etwa 10 Minuten)

---

### Kapitel 1 · Wer darf was entscheiden?

| Feld | Inhalt |
|---|---|
| Zeit | Januar 2026, Winter |
| Campus | **Stufe 0 · Winter · Morgen** – verschneites, leeres Grundstück im Bauzaun; Bauschild am Zaun; kahle Linden am Rand; kühles Blau, erstes Licht hinter den Bäumen |
| Figuren | Grundstein, Faden, Schwung |
| Kurzfassung | ja |
| Thema | `begriffe` |
| Beleg | k3.2-t1, k3.2-p1, k4.1-p1, k4.2-p1, k4.2-p2, k4.2-p3 (Muster-Mandatsleiter, hier projektbezogen vereinfacht), k9.3-p3, v24:hb-1 (Abs. „Die befugte Stelle …“), v24:hb-projektblatt (Ziele, Befugnisse und Schwellen), v24:tlb-3, v24:va-4.1 |

**Einstieg**
> Januar 2026. Auf dem Grundstück im Süden von Lindenhall liegt Schnee, am Zaun lehnt ein Bauschild. Seit heute leiten Sie das Projekt für die Stadt. Der Stadtrat hat das Geld bewilligt: ein Budget von rund 58 Millionen Euro und dazu eine Reserve von 3 Millionen für Unvorhergesehenes. Die Planung ist schon weit; jetzt beginnt die Zeit, in der jede Woche etwas entschieden werden muss. Ihr erster Termin findet im kleinen Baucontainer am Rand des Grundstücks statt – die Heizung brummt, auf dem Tisch stehen vier Tassen Kaffee.

**Szene**
> **Gisela Grundstein:** Schön, dass Sie da sind. Eins vorweg: Im Sommer 2028 ziehen hier die Kinder ein. Das ist mir das Wichtigste – danach kommt das Geld.
> **Clara Faden:** Dann schreibe ich das genau so auf, als Ihre Festlegung. Was noch fehlt: Wer darf hier was entscheiden?
> **Gisela Grundstein:** Ach, das regeln Sie beide. Ich will nicht mit jeder Kleinigkeit behelligt werden.
> **Konrad Schwung:** Ich bräuchte übrigens bis Freitag ein Ja zu den Fassadenplatten. Wer gibt mir das?
> **Clara Faden:** Genau darum geht es. Ich bereite alles vor, was entschieden werden muss. Entscheiden darf ich nichts – das muss vorher feststehen.
> **Gisela Grundstein:** Na gut. Aber bitte so, dass ich nicht jede Woche einen Anruf bekomme.

**Frage**
> Die Projektsteuerin wartet auf Ihren Auftrag, die Bürgermeisterin schaut auf die Uhr. Wie regeln Sie, wer was entscheidet?

| Platz | Wertung | Antwort (sichtbar) | Geld | Zeit | Vertrauen |
|---|---|---|---|---|---|
| 2 | A · gut | > Die Projektsteuerin schreibt einen Vorschlag auf eine Seite: was Sie entscheiden, was die Bürgermeisterin entscheidet. Die Bürgermeisterin legt es fest. | 0 | 0 | +2 |
| 1 | B · vertretbar | > Sicher ist sicher: Alles, was Geld oder Zeit kostet, geht an die Bürgermeisterin. | 0 | −1 | +1 |
| 3 | C · Falle | > Die Bürgermeisterin vertraut Ihnen. Sie entscheiden alles und halten sie auf dem Laufenden. | 0 | +1 | −2 |

**Folge-Szenen**

*A · gut*
> Eine Woche später liegt eine Seite auf dem Tisch der Bürgermeisterin. Sie liest sie zweimal, streicht ein Wort und unterschreibt: „Gut. Dann weiß ich, wann Sie zu mir kommen – und wann nicht.“ Konrad Schwung bekommt sein Ja zu den Fassadenplatten am Freitag von Ihnen, denn sie kosten nicht mehr als geplant. Clara Faden legt die Seite dort ab, wo alle Beteiligten sie finden.

*B · vertretbar*
> In den ersten zwei Wochen landen elf Fragen bei der Bürgermeisterin, darunter die Farbe der Fassadenplatten. Beim zwölften Mal ruft sie an: „Ich bin Bürgermeisterin, nicht Bauleiterin.“ Clara Faden schreibt eine Seite mit klaren Grenzen, die Bürgermeisterin unterschreibt – und der Architekt hat eine Woche verloren.

*C · Falle*
> Zwei Wochen geht das gut. Dann sagen Sie dem Architekten eine teurere Dämmung zu, und im Stadtrat fragt jemand, wer das beschlossen hat. Die Bürgermeisterin weiß von nichts. Am nächsten Morgen unterschreibt sie die Seite, die von Anfang an gefehlt hat, lässt die Dämmung prüfen – und schaut Sie dabei länger an als nötig.

**Nach jeder Folge: Kärtchen „Wer entscheidet was“** (Gegenstand „Projektblatt“, bleibt in den folgenden Kapiteln über ein kleines Symbol aufrufbar)
> **Wer entscheidet was**
> **Sie:** Entscheidungen bis 100.000 Euro, wenn das Budget sie ohne Reserve trägt.
> **Bürgermeisterin:** alles darüber · jeder Griff in die Reserve · ob die Stadt ein großes Risiko trägt · jede Freigabe am Ende eines großen Planungs- oder Bauabschnitts (Fachleute sagen: Leistungsphase) · was zuerst kommt: der Schulstart, dann das Geld.
> **Lenkungskreis:** berät die Bürgermeisterin.
> **Projektsteuerin:** bereitet alles vor, pflegt alle Vorgänge, empfiehlt – entscheidet nie.

**So macht man es gut**
> Wer was entscheiden darf, steht fest, bevor die erste Entscheidung ansteht – schriftlich und mit klaren Grenzen. Was der Bauherr nicht abgeben kann, bleibt bei ihm: welches Ziel zuerst kommt, die Freigaben, der Griff in die Reserve und die großen Risiken.

**Das steckt dahinter** → Thema `begriffe`
> Arbeit kann man abgeben, die Verantwortung für die großen Entscheidungen nicht – deshalb braucht jedes Projekt ein Mandat, das vor dem ersten Streit feststeht.

---

### Kapitel 2 · Ein erstes Warnsignal

| Feld | Inhalt |
|---|---|
| Zeit | März 2026, Vorfrühling |
| Campus | **Stufe 0 · Frühling · Tag** – dasselbe Grundstück ohne Schnee, Vermessungspflöcke, Baucontainer, Wiesenblumen und Krokusse am Zaun; klares, helles Vormittagslicht |
| Figuren | Schwung, Faden, Lot |
| Kurzfassung | nein (Brückensatz) |
| Thema | `arbeitsweise` |
| Beleg | v24:hb-1 (Tabelle: Frühwarnung), v24:hb-1.2, v24:hb-2 (Abs. 6: keine künstliche Wahrscheinlichkeit, fehlende Angaben nicht null), v24:hb-4 (Abs. 3: spätestens bei der nächsten wöchentlichen Aktualisierung), v24:tlb-2 (Frühwarnungen klären), v24:tlb-3 (Fachbeitrag mit Frage und Termin) |

**Einstieg**
> März 2026. Der Schnee ist weg, der Bauzaun steht, und an der Baustraße blühen die ersten Krokusse. Im Büro des Architekten wird jetzt die Ausführung geplant – Wand für Wand, Holzbauteil für Holzbauteil. Clara Faden geht jede Woche alle offenen Vorgänge durch: Aufgaben, Termine, Fragen ohne Antwort. Heute sitzt sie mit dem Architekten und dem Bauleiter im Container, um die nächsten Wochen abzustimmen.

**Szene**
> **Konrad Schwung:** Übrigens, nur am Rande: Ein Holzbauer hat erzählt, dass die Lieferzeiten für Holzelemente gerade länger werden.
> **Clara Faden:** Wie viel länger? Und bei welchen Herstellern?
> **Konrad Schwung:** Weiß ich nicht genau. Das war nur ein Gespräch auf einer Messe. Das pendelt sich ein, glauben Sie mir.
> **Theo Lot:** Holz kommt, wenn es kommt. Ich hab noch keinen Bau erlebt, wo's nicht irgendwann kam.
> **Theo Lot:** Und überhaupt: Ich bau, ich schreib nicht. Listen sind Ihr Job.
> **Clara Faden:** Kann sein. Aber wenn nicht, sollten wir es früh wissen.

**Frage**
> Noch ist nichts passiert, und niemand weiß, ob überhaupt etwas passieren wird. Was soll mit dem Hinweis passieren?

| Platz | Wertung | Antwort (sichtbar) | Geld | Zeit | Vertrauen |
|---|---|---|---|---|---|
| 1 | A · gut | > Die Projektsteuerin hält ihn als Frühwarnung fest: woher er kommt, was zu prüfen ist und wer bis wann nachfragt. | 0 | +1 | +1 |
| 3 | B · vertretbar | > Gleich als Risiko eintragen und eine Zahl schätzen – lieber zu früh als zu spät. | 0 | +1 | 0 |
| 2 | C · Falle | > Abwarten, bis der Architekt Genaueres weiß, und dann im nächsten Monatstermin darüber sprechen. | 0 | −1 | −1 |

**Folge-Szenen**

*A · gut*
> Clara Faden schreibt drei Zeilen: Hinweis des Architekten aus einem Gespräch auf einer Messe. Prüffrage: Wie lang sind die Lieferzeiten bei den Herstellern, die für uns infrage kommen? Konrad Schwung fragt bis Ende des Monats nach. Mehr braucht es noch nicht – in zwei Wochen gibt es eine Antwort. Theo Lot zuckt mit den Schultern: „Papierkram.“ Clara Faden lächelt nur.

*B · vertretbar*
> Clara Faden trägt ein Risiko ein und schreibt eine geschätzte Verzögerung dazu. Nur weiß noch niemand, was genau zu schätzen ist – da steht eine Zahl ohne Grundlage. Immerhin fragt der Architekt bis Ende des Monats bei den Herstellern nach, und die Antwort wird die Schätzung ersetzen.

*C · Falle*
> Clara Faden hält den Hinweis trotzdem fest – bei ihr geht nichts verloren. Nur eine Prüffrage und einen Termin bekommt er nicht, weil Sie abwarten wollten, und so wartet der Architekt auf einen Anruf, der nicht kommt. Erst im Monatstermin drei Wochen später fragt er bei den Herstellern nach.

**So macht man es gut**
> Ein unklarer Hinweis wird sofort festgehalten – mit seiner Herkunft, einer klaren Prüffrage, einem Namen und einem Termin. Bewertet wird erst, wenn die Antwort da ist; bis dahin bleibt er offen und wird jede Woche angeschaut.

**Mini-Aufgabe 1 · Was ist was?** (zuordnen)
> Auf einer Baustelle passiert vieles gleichzeitig. Ordnen Sie jedem Satz zu, was er ist: Frühwarnung, Risiko, Problem, Änderung, Maßnahme oder Aufgabe.

| Posten (sichtbar) | Lösung | Erklärung (sichtbar, nach der Antwort) |
|---|---|---|
| > Ein Hersteller erwähnt am Telefon, dass Holz knapp werden könnte. | Frühwarnung | > Ein Hinweis, der noch nicht geklärt ist. Erst einmal wird geprüft, was dran ist. |
| > Drei Hersteller bestätigen ein halbes Jahr Lieferzeit. Ob der Holzbau deshalb später beginnt, ist noch offen. | Risiko | > Etwas Nachteiliges kann eintreten, ist aber noch nicht passiert. Das wird bewertet. |
| > Nach dem Starkregen steht die Baugrube unter Wasser. | Problem | > Das ist schon passiert. Jetzt geht es um die Folgen und die Lösung, nicht mehr um die Wahrscheinlichkeit. |
| > Die Schule wünscht sich eine größere Mensa. | Änderung | > Etwas, das bisher gilt, soll bewusst anders werden. Das braucht eine Entscheidung. |
| > Eine Pumpe wird aufgestellt, damit die Baugrube wieder trocken wird. | Maßnahme | > Eine gezielte Handlung, die einen Zustand verbessert. Ob sie wirkt, wird nachgeprüft. |
| > Der Architekt schätzt bis Freitag die Kosten für den Fahrradkeller. | Aufgabe | > Eine geplante Arbeit mit Ergebnis, Namen und Termin. |

Beleg Mini-Aufgabe: v24:hb-1 (Tabelle der Sachverhalte), v24:hb-1.1 bis v24:hb-1.6.

**Das steckt dahinter** → Thema `arbeitsweise`
> Nicht jeder Hinweis wird zum Risiko – aber jeder wird geklärt, bis feststeht, ob daraus ein Risiko, ein Problem oder eine Aufgabe wird oder ob er begründet geschlossen werden kann.

---

### Kapitel 3 · Wie gefährlich ist das?

| Feld | Inhalt |
|---|---|
| Zeit | April 2026, Frühling |
| Campus | **Stufe 1 · Frühling · Tag** – Baugrube der Gesamtschule, Bagger, Kipper, Baucontainer; die Linden treiben hellgrün aus; sonnig, kurze Schatten |
| Figuren | Schwung, Faden, Lot, Klingel |
| Kurzfassung | ja |
| Thema | `vorgaenge` |
| Beleg | v24:hb-1.2 (Klärung → Risiko), v24:hb-1.3 (Risikoannahme bereitet die Projektsteuerung vor, nimmt sie nicht selbst an), v24:hb-2 (Wahrscheinlichkeit × höchste belegte Auswirkung; Qualität/Funktion Stufe 4), v24:hb-3 (Tabelle: vorrangig → Auftraggeber informieren, Entscheidungen rechtzeitig vorbereiten; wesentliches Risiko; drohender Verlust einer Handlungsoption), v24:hb-3.1, k4.4-p1, k3.2-t1 (Reserve), v24:va-4.1 |

Fachliche Einordnung (intern): Die Frühwarnung aus Kapitel 2 ist geklärt und wird Risiko; Herkunft verknüpft. Wahrscheinlichkeit hoch; höchste belegte Auswirkung: Schulstart ohne die neuen Gebäude, Ganztag, Sport und Fachräume erheblich eingeschränkt (Qualität/Funktion Stufe 4) → Feld im vorrangigen Bereich. Gegenmaßnahme über 100.000 Euro und aus der Reserve → Bürgermeisterin. „Abwarten“ wäre die Annahme eines wesentlichen Risikos → ebenfalls Bürgermeisterin. Die Vorlage hat zwei Wege; sie wird nicht als Vergleichstabelle gezeigt (der gewichtete Vergleich erscheint nur in Kapitel 7, O-52), ist aber in der Geschichte vollständig.

**Einstieg**
> April 2026. Die Bagger sind da, die Baugrube wird jeden Tag tiefer, und die Linden am Rand treiben aus. Die Antwort der Hersteller liegt auf dem Tisch: eine Mappe mit drei Schreiben, daneben ein Kalender, auf dem jemand den Sommer 2028 dick eingekreist hat.

**Szene**
> **Konrad Schwung:** Drei von vier Herstellern brauchen jetzt ein halbes Jahr statt vier Monate. Vielleicht wird es ja wieder besser.
> **Clara Faden:** Ich habe es als Risiko bewertet. Wie wahrscheinlich ist es? Hoch. Wie schlimm, wenn es so kommt? Dann fangen die Holzbauer bis zu zehn Wochen später an, und der Schulstart wackelt.
> **Theo Lot:** Zehn Wochen. Die holt keiner rein, ich auch nicht.
> **Konrad Schwung:** Wir könnten auch einfach hoffen. Hat schon oft geklappt.
> **Clara Faden:** Hoffen ist kein Weg, den ich vorlegen kann.
> **Clara Faden:** Beides zusammen heißt: vorrangig bearbeiten. Es gibt einen Ausweg – die Holzelemente in einem eigenen Paket früher ausschreiben. Das kostet rund 150.000 Euro.
> **Hanna Klingel:** Bitte sagen Sie mir nicht, dass meine Schule im Sommer 2028 noch in Containern sitzt.

Grafik zur Szene: kleine Matrix aus 5 × 5 Feldern ohne Zahlen, Achsen „wie wahrscheinlich“ und „wie schlimm“, ein Feld oben rechts markiert, Beschriftung > vorrangig.

**Frage**
> Die Projektsteuerin hat bewertet, was sich bewerten lässt. Was jetzt geschieht, liegt bei Ihnen: Was machen Sie mit dieser Einschätzung?

| Platz | Wertung | Antwort (sichtbar) | Geld | Zeit | Vertrauen |
|---|---|---|---|---|---|
| 3 | A · gut | > Sie informieren die Bürgermeisterin noch diese Woche. Die Projektsteuerin legt ihr eine Vorlage vor: früher ausschreiben oder abwarten. | −1 | +2 | +1 |
| 1 | B · vertretbar | > Sie beobachten das Risiko noch einen Monat und legen es dann im Lenkungskreis vor. | −1 | −1 | −1 |
| 2 | C · Falle | > Sie bitten die Projektsteuerin, das Risiko vorerst kleiner darzustellen. Die Bürgermeisterin soll sich nicht unnötig sorgen. | −2 | −2 | −2 |

**Folge-Szenen**

*A · gut*
> Die Bürgermeisterin liest die Vorlage am Abend: zwei Wege, jeweils mit Kosten, Zeit und dem, was an Risiko übrig bleibt, dazu die Empfehlung, früher auszuschreiben. Im Lenkungskreis wird kurz beraten, dann entscheidet sie: früher ausschreiben, das Geld kommt aus der Reserve. „Abwarten hieße, ich trage das Risiko. Das will ich nicht.“ Zwei Wochen später sind die Holzelemente ausgeschrieben, und Theo Lot streicht im Kalender ein dickes Fragezeichen durch.

*B · vertretbar*
> Einen Monat später ist die Lage dieselbe, nur die Zeit ist knapper. Die Bürgermeisterin entscheidet im Lenkungskreis wie empfohlen: früher ausschreiben, das Geld kommt aus der Reserve. Dann fragt sie: „Warum höre ich das erst jetzt?“ Die Holzelemente werden ausgeschrieben – einen Monat später, als es möglich gewesen wäre.

*C · Falle*
> Clara Faden schüttelt freundlich den Kopf: „Ich bewerte, wie es ist. Kleiner machen kann ich es nicht.“ Im nächsten Monatsbericht steht das Risiko als vorrangig, und die Bürgermeisterin ruft an, bevor Sie es ihr erklären konnten. Sie entscheidet sofort: früher ausschreiben, aus der Reserve – nur kostet es jetzt mehr, weil die Ausschreibung eilt.

**So macht man es gut**
> Ein Risiko wird danach eingestuft, wie wahrscheinlich es ist und wie schwer die schlimmste belegte Folge wiegt; was vorrangig ist, erfährt der Bauherr sofort. Ob die Stadt ein großes Risiko trägt oder Geld aus der Reserve dagegen einsetzt, entscheidet die Bürgermeisterin – nicht der Architekt, nicht die Projektsteuerin und auch nicht Sie.

**Das steckt dahinter** → Thema `vorgaenge`
> Die Bewertung macht aus einer Sorge eine Rangfolge: Was vorrangig ist, wird zuerst bearbeitet – und wer ein Risiko tragen will, muss das ausdrücklich entscheiden.

---

### Kapitel 4 · Die Schule will mehr

| Feld | Inhalt |
|---|---|
| Zeit | Juni 2026, Frühsommer |
| Campus | **Stufe 2 · Sommer · Abend** – Rohbau der Gesamtschule über der Bodenplatte, gelber Turmdrehkran, Fahrmischer; als Zusatz der Szenen-Grafik eine bunte Wimpelkette vom Schulfest und Kinderzeichnungen am Zaun; warmes, tiefes Licht, lange Schatten |
| Figuren | Klingel, Schwung, Faden, Lot |
| Kurzfassung | ja |
| Thema | `anwendung` |
| Beleg | v24:hb-1.5 (Änderung: Anlass, Antragsteller, bisherige Grundlage, Auswirkungen; zwei ernsthafte, zulässige Optionen; bis zur Freigabe bleibt die bisherige Grundlage maßgeblich; abgelehnte Anträge nachvollziehbar), v24:hb-1 (Änderungen auch ohne Risikoeintrag), v24:hb-3.1 (letzter Absatz: Schweigen, Empfehlung, Softwarestatus sind kein Beschluss), v24:va-4.2, k4.3-p2 (Entscheidungen verschwinden nicht in informellen Abstimmungen), k3.2-t1 (wesentliche Änderung), k10.5-t1 (Änderungsantrag mit unvollständiger Auswirkungsbewertung) |

**Einstieg**
> Juni 2026. Die Bodenplatte der Gesamtschule ist gegossen, die ersten Wände stehen, ein gelber Kran dreht sich über der Baustelle. Am Bauzaun hängen noch die Wimpel vom Schulfest, bei dem die künftigen Schülerinnen und Schüler ihre Baustelle besucht haben. Jetzt kommt Hanna Klingel mit roten Wangen in den Container, in der Hand einen Stapel Zettel mit den neuen Zahlen für den Ganztag.

**Szene**
> **Hanna Klingel:** Ich habe wunderbare Nachrichten: Der Ganztag wächst! Wir brauchen eine größere Mensa – für 450 Essen statt 300.
> **Konrad Schwung:** Hab ich ihr beim Schulfest schon gesagt: Das kriegen wir hin.
> **Clara Faden:** Eine größere Mensa kostet rund 600.000 Euro und vier Wochen Umplanung. Es gibt einen zweiten Weg: die Mensa jetzt so bauen, dass sie später wachsen kann – für etwa 150.000 Euro.
> **Hanna Klingel:** Später ist immer zu spät. Die Kinder essen jetzt.
> **Theo Lot:** Wenn umgeplant wird, will ich es wissen, bevor ich Beton gieße – nicht danach.

**Frage**
> Die Schule hat gute Gründe, das Budget hat Grenzen, und der Architekt hat schon „Das kriegen wir hin“ gesagt. Wie gehen Sie mit dem Wunsch der Schule um?

| Platz | Wertung | Antwort (sichtbar) | Geld | Zeit | Vertrauen |
|---|---|---|---|---|---|
| 2 | A · gut | > Die Projektsteuerin nimmt ihn als Änderung auf und legt der Bürgermeisterin beide Wege vor. Bis sie entschieden hat, gilt die bisherige Planung. | −1 | 0 | +2 |
| 3 | B · vertretbar | > Erst die Anmeldezahlen im Herbst abwarten – dann weiß man, wie groß der Bedarf wirklich ist. | −1 | −1 | 0 |
| 1 | C · Falle | > Die Zusage vom Schulfest gilt. Der Architekt soll gleich umplanen. | −2 | −1 | −2 |

**Folge-Szenen**

*A · gut*
> Clara Faden schreibt den Antrag auf: wer was will, was bisher gilt, was sich ändern würde. Im Lenkungskreis hört die Bürgermeisterin die Schule und die Kämmerei und entscheidet: Die Mensa wird so gebaut, dass sie später wachsen kann; das Geld kommt aus der Reserve. Hanna Klingel ist nicht ganz zufrieden, aber sie weiß, woran sie ist – und Theo Lot gießt die Fundamente gleich richtig.

*B · vertretbar*
> Im Herbst bestätigen die Anmeldezahlen den Bedarf. Inzwischen ist die Planung weiter, und ein Fundament muss nachträglich verstärkt werden. Die Bürgermeisterin entscheidet auf Vorlage der Projektsteuerin für die Mensa, die später wachsen kann, aus der Reserve. Die Schule hat ein halbes Jahr auf eine Antwort gewartet, und Theo Lot fragt, warum man ihm das nicht vor dem Betonieren gesagt hat.

*C · Falle*
> Konrad Schwung plant drei Wochen lang die große Mensa. Dann fragt die Bürgermeisterin, wer das beschlossen hat – niemand. Eine Zusage am Rand eines Schulfests ist kein Beschluss. Die Projektsteuerin legt beide Wege nachträglich vor, die Bürgermeisterin entscheidet für die Mensa, die später wachsen kann, und die drei Wochen Planung muss trotzdem jemand bezahlen.

**So macht man es gut**
> Ein Wunsch, der den geltenden Stand ändert, wird als Änderung aufgenommen: wer ihn stellt, was bisher gilt, was er kostet und wie viel Zeit er braucht – und er wird mit mindestens zwei Wegen der Stelle vorgelegt, die entscheiden darf. Bis entschieden ist, gilt die bisherige Planung; eine Zusage im Flur oder beim Schulfest ersetzt keinen Beschluss.

**Mini-Aufgabe 2 · Wer entscheidet das?** (zuordnen, drei Knöpfe je Posten: Sie · Bürgermeisterin · Projektsteuerin)
> Sechs Fragen, drei Möglichkeiten. Wer entscheidet?

| Posten (sichtbar) | Lösung | Erklärung (sichtbar) |
|---|---|---|
| > Eine kleine Planänderung im Lehrerzimmer für 30.000 Euro, die das Budget ohne Reserve trägt | Sie | > Das liegt in Ihrem Rahmen: bis 100.000 Euro, ohne Griff in die Reserve. |
| > Die größere Mensa für 600.000 Euro | Bürgermeisterin | > Mehr als 100.000 Euro, und das Geld käme aus der Reserve. Der Lenkungskreis berät sie. |
| > 150.000 Euro aus der Reserve für die früher ausgeschriebenen Holzelemente | Bürgermeisterin | > Über die Reserve entscheidet immer die Bürgermeisterin – egal wie klein der Betrag ist. |
| > Die Freigabe am Ende der Ausführungsplanung | Bürgermeisterin | > Jede Freigabe am Ende eines großen Abschnitts erteilt der Bauherr selbst. Der Lenkungskreis berät nur. |
| > Ob die Stadt längere Lieferzeiten einfach in Kauf nimmt | Bürgermeisterin | > Ein großes Risiko bewusst zu tragen, ist eine Entscheidung des Bauherrn. |
| > Welche von zwei gleich teuren Farben die Fassadenplatten bekommen | Sie | > Kein Mehrbetrag, kein Risiko, keine Freigabe – das entscheiden Sie. |

Rückmeldung, wenn „Projektsteuerin“ gewählt wird (bei jedem Posten gleich):
> Die Projektsteuerin bereitet das vor und empfiehlt – entscheiden darf sie es nicht.

Beleg Mini-Aufgabe: k4.2-p3 (Schwelle 100 TEUR), k3.2-t1 (Reserve, Risikoannahme, wesentliche Freigabe nicht delegierbar), k9.3-p3 (Freigabe selbst, Lenkungskreis berät), v24:hb-1 (Abs. „befugte Stelle“), v24:va-4.1 (keine Entscheidungsbefugnis der Projektsteuerung).

**Das steckt dahinter** → Thema `anwendung`
> Eine Änderung braucht einen sauberen Weg vom Antrag bis zum Beschluss – sonst entscheiden am Ende Gespräche am Rand über Geld, das niemand freigegeben hat.

---

### Kapitel 5 · Zwei Zahlen, zwei Wahrheiten

| Feld | Inhalt |
|---|---|
| Zeit | Oktober 2026, Herbst |
| Campus | **Stufe 3 · Herbst · Abend** – der Kran hebt Holzelemente an die Gesamtschule, die unteren Geschosse sind verkleidet; Linden gelb und rot, Laub auf der Baustraße; goldenes Spätnachmittagslicht |
| Figuren | Grundstein, Schwung, Faden |
| Kurzfassung | nein (Brückensatz) |
| Thema | `verantwortung` |
| Beleg | v24:hb-2 (Abs. 1: Fakten, Schätzungen, offene Fragen; Abs. 3: in der Prognose enthaltene Beträge kenntlich, nicht erneut hinzurechnen; Abs. 6: Bandbreite statt künstlicher Wahrscheinlichkeit), v24:hb-3 (Unterschiedliche Einschätzungen mit Begründung dokumentiert, nicht gemittelt), v24:hb-5 (ein maßgeblicher Dokumentationsstand; Risiko nur mit nachgewiesenem Grund schließen), v24:tlb-3 (Fachbeiträge anfordern, Widersprüche benennen), v24:hb-1.5 (Nachtragsanerkennung und -verhandlung gesondert), k4.6-p1, k4.6-p2, k2.4-p2 |

Fachliche Einordnung (intern): Die angekündigten Mehrkosten sind ein Risiko (noch nicht eingetreten), keine Kosten in der Prognose; die Prognose ohne sie liegt etwa eine Million über dem Budget und innerhalb der Reserve (Baupreise, vorgezogene Holzelemente, erweiterbare Mensa). Ob die Forderung berechtigt ist, prüft die Vergabestelle der Stadt (keine Nachtragsverhandlung durch die Projektsteuerung). Ergebnis auf allen Wegen: gehört zum bestehenden Vertrag, Risiko mit Begründung geschlossen.

**Einstieg**
> Oktober 2026. Der Kran hebt die ersten Holzelemente an die Gesamtschule, die Linden leuchten gelb. Nächste Woche will die Bürgermeisterin dem Stadtrat sagen, wo das Projekt beim Geld steht. Auf ihrem Schreibtisch liegen zwei Papiere, beide mit einer Zahl unten rechts – und die Zahlen sind nicht dieselben.

**Szene**
> **Gisela Grundstein:** Die Kämmerei sagt, wir liegen eine Million über dem Budget. Der Architekt sagt zwei. Was stimmt denn nun?
> **Konrad Schwung:** Meine Zahl. Die Haustechnikfirma hat Mehrkosten angekündigt, gut eine Million. Die habe ich schon drin. Ich rechne lieber zu viel als zu wenig.
> **Gisela Grundstein:** Und warum steht davon nichts in der Rechnung der Kämmerei?
> **Clara Faden:** Ich habe beide Rechnungen angefordert und Zeile für Zeile verglichen. Der Unterschied ist genau diese Ankündigung. Angekündigt heißt aber nicht berechtigt – die Vergabestelle prüft das gerade.
> **Gisela Grundstein:** Ich brauche eine Zahl, die ich im Stadtrat vertreten kann. Nicht zwei.
> **Clara Faden:** Beide Zahlen liegen innerhalb der Reserve. Aber welche Sie nennen, sollten Sie wissen – nicht raten.

**Frage**
> Beide Zahlen haben einen Grund. Nur eine kann in den Stadtrat. Welche Zahl geben Sie der Bürgermeisterin?

| Platz | Wertung | Antwort (sichtbar) | Geld | Zeit | Vertrauen |
|---|---|---|---|---|---|
| 3 | A · gut | > Eine Zahl mit Stand und Begründung: eine Million über dem Budget – und daneben die angekündigten Mehrkosten als Risiko, mit ihrer Spanne. | +1 | 0 | +2 |
| 1 | B · vertretbar | > Die höhere Zahl des Architekten. Lieber vorsichtig. | −1 | −1 | 0 |
| 2 | C · Falle | > Die Mitte: anderthalb Millionen. Dann liegt keiner ganz daneben. | −1 | 0 | −2 |

**Folge-Szenen**

*A · gut*
> Die Bürgermeisterin nennt im Stadtrat eine Zahl und einen Satz dazu: was drin ist, was nicht und was gerade geprüft wird. Zum ersten Mal fragt niemand nach einer zweiten Zahl. Vier Wochen später ist die Prüfung fertig: Die Mehrleistungen gehören zum bestehenden Vertrag der Haustechnikfirma. Clara Faden schließt das Risiko – mit Begründung. Die Bürgermeisterin sagt nach der Sitzung nur: „So möchte ich das jedes Mal.“

*B · vertretbar*
> Der Stadtrat erschrickt über zwei Millionen und verlangt eine Liste, wo man sparen könnte; die Planung wartet vier Wochen auf die Antwort. Dann ist die Prüfung fertig: Die Mehrleistungen gehören zum bestehenden Vertrag, die Zahl sinkt wieder. Nur hat die Firma gemerkt, dass ihre Forderung schon eingerechnet war – und sie verhandelt jetzt bei jeder Kleinigkeit härter.

*C · Falle*
> Anderthalb Millionen stehen in keiner Rechnung. Als ein Stadtrat fragt, woher die Zahl kommt, bleibt nur die Antwort: aus der Mitte. Clara Faden legt danach beide Rechnungen nebeneinander und zeigt den Unterschied. Die Prüfung endet wie erwartet – die Mehrleistungen gehören zum bestehenden Vertrag –, aber die Firma verhandelt jetzt härter, denn halb eingerechnet war ihre Forderung ja schon.

**So macht man es gut**
> Es gibt einen maßgeblichen Stand der Zahlen, und jede Zahl darin hat ein Datum und eine Begründung. Unterschiedliche Einschätzungen werden nebeneinander erklärt, nicht gemittelt; was noch unsicher ist, steht als Risiko mit seiner Spanne daneben und wird nicht doppelt gezählt.

**Das steckt dahinter** → Thema `verantwortung`
> Eine Entscheidung ist nur so gut wie die Zahlen, auf denen sie steht – deshalb sorgt der Bauherr dafür, dass es einen belastbaren Stand gibt, auch wenn er ihn nicht selbst pflegt.

---

### Kapitel 6 · Ärger auf der Baustelle

| Feld | Inhalt |
|---|---|
| Zeit | Februar 2027, Winter, nach einem Sturm |
| Campus | **Stufe 4 · Winter · Tag** – Gesamtschule außen fast fertig, an der Sporthalle richten Zimmerleute das Holztragwerk auf; als Zusatz der Szenen-Grafik: Gerüst an der Sporthalle mit einem schiefen Feld, flatternde Plane, dunkle Wolken, schräger Regen statt Schnee; graublaues Licht |
| Figuren | Lot, Schwung (Telefonat; die Projektsteuerin ist nicht dabei) |
| Kurzfassung | nein (Brückensatz) |
| Thema | `takt` |
| Beleg | v24:hb-4 (Schaubild und Abs. 4: dringlich sofort über den vereinbarten Meldeweg, am selben Arbeitstag dokumentieren, sobald die unmittelbare Reaktion gesichert ist; akute Gefahr nie unbearbeitet), v24:hb-3 (Sicherheit unabhängig von der Matrix; Dringliches wartet nicht auf Sitzung oder Bewertung), v24:hb-1.4 (Problem, Zwischenmaßnahme; die Dringlichkeit erteilt keine Freigabe; schließen erst bei bestätigter Lösung), v24:hb-3.1 (Schutzmaßnahmen warten nicht auf die fertige Vorlage), v24:hb-1.6 (Wirkung prüfen), v24:tlb-5 (keine Sicherheitskoordination und Bauüberwachung durch die Projektsteuerung), v24:va-5.2 |

Fachliche Einordnung (intern): Sperren ist Sache der Bauleitung vor Ort mit der Sicherheitskoordination; Sie stoßen nur an. Die Projektsteuerin meldet über den vereinbarten Weg und dokumentiert am selben Arbeitstag – dafür muss sie davon erfahren (deshalb ist sie in der Szene nicht dabei). Die Kosten der Reparatur trägt die Gerüstfirma; es entsteht keine Entscheidung über Geld.

**Einstieg**
> Februar 2027. Die Gesamtschule ist außen fast fertig, an der Sporthalle richten die Zimmerleute das Holztragwerk auf; rundum ragt ein Gerüst in den grauen Himmel. In der Nacht ist ein Sturm über Lindenhall gezogen. Auf der Baustelle liegen abgerissene Planen im Matsch, ein Bauzaunfeld ist umgekippt. Freitag, kurz nach drei, klingelt Ihr Telefon.

**Szene**
> **Theo Lot:** Das Gerüst an der Sporthalle hat seit heute Nacht zwei lose Anker. Wenn ich sperre, stehen die Zimmerleute bis Dienstag herum.
> **Konrad Schwung:** Zwei Tage Stillstand im Februar – das tut weh.
> **Theo Lot:** Ich dachte, wir besprechen das am Montag in Ruhe. Die Projektsteuerin ist heute sowieso nicht auf der Baustelle.
> **Konrad Schwung:** Vielleicht reicht es ja, nur die eine Seite abzusperren.
> **Theo Lot:** Sie sprechen für den Bauherrn. Was soll ich machen?

**Frage**
> Draußen pfeift noch der Wind, und der Bauleiter wartet am Telefon. Was sagen Sie ihm?

| Platz | Wertung | Antwort (sichtbar) | Geld | Zeit | Vertrauen |
|---|---|---|---|---|---|
| 1 | A · gut | > Sperren Sie sofort und holen Sie die Sicherheitskoordination. Ich sage gleich der Projektsteuerin Bescheid – sie meldet es und hält es noch heute fest. | 0 | −1 | +1 |
| 2 | B · vertretbar | > Sperren Sie sofort. Alles Weitere besprechen wir am Montag mit der Projektsteuerin. | 0 | −1 | 0 |
| 3 | C · Falle | > Arbeiten Sie an der anderen Seite weiter, bis der Gerüstbauer am Montag kommt. | −1 | −2 | −2 |

**Folge-Szenen**

*A · gut*
> Um halb vier ist der Bereich abgesperrt, die Sicherheitskoordination ist vor Ort. Clara Faden meldet den Schaden über den vereinbarten Weg, sagt der Bürgermeisterin in zwei Sätzen Bescheid und legt noch am Abend einen Eintrag an: was passiert ist, wann, wer gesperrt hat, mit Fotos. Am Dienstag sind die Anker erneuert, und weil der Eintrag genau zeigt, was war, übernimmt die Gerüstfirma die Kosten. Theo Lot brummt: „Ganz schön praktisch, so ein Eintrag.“

*B · vertretbar*
> Gesperrt wird sofort, niemand kommt zu Schaden. Aber am Montag weiß keiner mehr genau, wann was war, und die Gerüstfirma bestreitet, dass der Sturm schuld ist. Clara Faden setzt den Freitag aus Fotos und Anrufen zusammen; nach einer Woche ist geklärt, wer zahlt. Theo Lot murmelt: „Hätten wir's mal gleich aufgeschrieben.“

*C · Falle*
> Am Samstag kommt die Sicherheitskoordination vorbei und stoppt die ganze Baustelle, bis das Gerüst geprüft ist. Verletzt wurde niemand – zum Glück. Clara Faden erfährt erst jetzt davon, meldet den Vorfall sofort und hält ihn noch am selben Tag fest. Die Prüfung dauert eine Woche, und die Bürgermeisterin fragt, warum am Freitag weitergearbeitet wurde.

**So macht man es gut**
> Wo es um Sicherheit geht, wird sofort gehandelt und sofort gemeldet – Schutz wartet auf keine Sitzung und keine Vorlage. Noch am selben Arbeitstag wird festgehalten, was passiert ist; danach werden Ursache und Lösung geklärt, und was Geld kostet oder etwas ändert, entscheidet weiterhin die Stelle, die es darf.

**Mini-Aufgabe 3 · Was kommt wann?** (sortieren; Posten erscheinen gemischt)
> Bringen Sie die Schritte nach dem Sturm in die richtige Reihenfolge.

| Richtige Stelle | Posten (sichtbar) | Erklärung (sichtbar) |
|---|---|---|
| 1 | > Der Bauleiter sperrt den Bereich ab. | > Schutz zuerst – vor jeder Besprechung. |
| 2 | > Sicherheitskoordination und Projektsteuerin werden informiert; die Projektsteuerin meldet über den vereinbarten Weg. | > Dringliches wird sofort gemeldet, nicht erst in der nächsten Sitzung. |
| 3 | > Noch am selben Tag entsteht ein Eintrag mit Uhrzeit, Fotos und Zuständigen. | > Festgehalten wird, sobald die erste Reaktion gesichert ist – am selben Arbeitstag. |
| 4 | > Die Fachleute klären die Ursache. | > Erst verstehen, dann reparieren. |
| 5 | > Die Lösung wird vorbereitet; braucht sie Geld oder eine Änderung, entscheidet die Stelle, die es darf. | > Auch in Eile gilt: Dringlichkeit ersetzt keine Freigabe. |
| 6 | > Erst wenn die Reparatur nachweislich wirkt, wird der Eintrag geschlossen. | > Umgesetzt und wirksam sind nicht dasselbe. |

Beleg Mini-Aufgabe: v24:hb-4, v24:hb-1.4, v24:hb-1.6, v24:hb-3, v24:hb-5 (Abschluss).

**Das steckt dahinter** → Thema `takt`
> Neben dem festen Takt – jede Woche alles Offene prüfen, einmal im Monat ein kurzer Termin und eine Seite Bericht – gilt eine Regel immer: Dringliches wird sofort gemeldet und noch am selben Tag festgehalten.

---

### Kapitel 7 · Die große Entscheidung

| Feld | Inhalt |
|---|---|
| Zeit | Mai 2027, Frühling |
| Campus | **Stufe 5 · Frühling · Morgen** – Gesamtschule und Sporthalle geschlossen, daneben wächst die Grundschule eingerüstet, Kran noch da; frühes Morgenlicht, rosa-gold, lange weiche Schatten |
| Figuren | Schwung, Lot, Faden, Klingel, Grundstein |
| Kurzfassung | ja |
| Thema | `entscheidungsvorlage` |
| Beleg | v24:hb-3.1 (Entscheidungsbedarf, befugte Stelle, Termin, Folgen einer Verzögerung; mindestens zwei Optionen; Kriterien aus den Projektzielen, Gewichte und Stufen 1–5 vorab mit dem Auftraggeber abgestimmt; Gewicht × Punkt, Summe; Euro und Termin sichtbar; zwingende Anforderungen vorab; Prüfung anderer vertretbarer Gewichte; Empfehlung mit Nachteilen; Beschluss getrennt, mit Quelle, Datum, Bedingungen), v24:hb-3.2 (Gewichtungsabhängigkeit muss sichtbar bleiben), v24:tlb-2.1, v24:va-3.1 bis v24:va-3.5, v24:va-4.1, v24:va-4.2, k3.2-t1 (Reserve), k4.1-p1 (Zielpriorität), k9.3-p3 (Lenkungskreis berät) |

Fachliche Einordnung (intern): Problem (Liefertermin ausgefallen) → Entscheidungsvorlage. Mehr als 100.000 Euro und aus der Reserve → befugte Stelle Bürgermeisterin, Lenkungskreis berät; Sie legen vor (mit Ihrer Empfehlung). Kriterien aus den Projektzielen, Gewichte vor der Bewertung mit Ihnen abgestimmt und aus der Zielpriorität der Bürgermeisterin abgeleitet (Kapitel 1). Alle drei Optionen sind zulässig: Die Fachplanung bestätigt, dass Leihgeräte die Anforderungen an die Raumluft übergangsweise erfüllen. Das ist der einzige gewichtete Vergleich der Story (O-52).

**Einstieg**
> Mai 2027. Gesamtschule und Sporthalle sind geschlossen, daneben wächst die Grundschule. Morgens fällt das Licht schräg über den künftigen Schulhof. Bis zum Schulstart sind es noch fünfzehn Monate, und zum ersten Mal fühlt sich das gar nicht mehr so lang an. Dann kommt eine Nachricht, die niemand hören will.

**Szene**
> **Konrad Schwung:** Ich sag's lieber gleich und nicht erst, wenn's brennt: Der Hersteller der Lüftungsanlage für die Gesamtschule liefert vier Monate später.
> **Theo Lot:** Vier Monate. Dann bauen wir die Anlage ein, wenn die Kinder schon da sein sollen.
> **Clara Faden:** Ich habe drei Wege ausgearbeitet, und alle drei sind zulässig: ein Ersatzgerät eines anderen Herstellers, Leihgeräte in den Klassenräumen bis zur Lieferung – oder die Gesamtschule zieht erst nach den Herbstferien ein.
> **Hanna Klingel:** Leihgeräte in jedem Klassenraum? Die brummen. Und nach den Herbstferien … das erkläre ich den Eltern nicht gern.
> **Gisela Grundstein:** Zeigen Sie mir alle drei Wege. Und was Sie empfehlen. Entscheiden tue ich.

**Der Vergleich** (eigener Schritt zwischen Szene und Frage; groß, farbig, Grafik „Waage mit drei Schalen“)

> Die Projektsteuerin vergleicht die drei Wege nach vier Gesichtspunkten. Wie wichtig jeder ist, hat sie vorher mit Ihnen abgestimmt – abgeleitet aus dem Ziel der Bürgermeisterin: zuerst der Schulstart, dann das Geld.

Was die Wege bedeuten (sichtbar, in Worten neben den Punkten):

| Weg | Geld | Schulstart | Gute Luft im Unterricht | Klima und Betrieb |
|---|---|---|---|---|
| > **A · Ersatzgerät** | > rund 400.000 Euro mehr | > alle Kinder ziehen pünktlich ein | > volle Lüftung ab dem ersten Tag | > braucht etwas mehr Strom als das bestellte Gerät |
| > **B · Leihgeräte** | > rund 150.000 Euro Miete | > alle pünktlich | > laut, oft Fenster auf, bis die Anlage läuft | > viel Strom, später zweimal umbauen |
| > **C · Später einziehen** | > rund 50.000 Euro für längere Container | > Grundschule pünktlich, Gesamtschule erst nach den Herbstferien | > volle Lüftung, sobald die Kinder kommen | > das bestellte, sparsamste Gerät |

Punkte 1 bis 5 (höher = besser; sichtbar als fünf Punkte je Feld, keine Ziffern nötig):

| Weg | Geld | Schulstart | Gute Luft | Klima und Betrieb | Begründung (intern, für die Engine-Tests und die Prüfung) |
|---|---|---|---|---|---|
| A | 2 | 5 | 5 | 3 | Geld: Skala bis 50.000 / 150.000 / 300.000 / 500.000 Euro → 5 / 4 / 3 / 2, darüber 1; 400.000 → 2. Schulstart: pünktlich 5, bis 2 / 4 / 8 Wochen später 4 / 3 / 2, mehr 1. |
| B | 4 | 5 | 2 | 2 | 150.000 → 4; pünktlich; Unterricht übergangsweise eingeschränkt (laut, Fensterlüftung) → 2; Strom und zweimal Umbau → 2 |
| C | 5 | 2 | 5 | 5 | 50.000 → 5; Gesamtschule rund acht Wochen später → 2; volle Funktion ab Einzug → 5; bestelltes, sparsamstes Gerät → 5 |

**„Was ist wichtiger?“** – je Gesichtspunkt drei Stufen: > sehr wichtig · wichtig · weniger wichtig (intern 5 · 3 · 1). Abgestimmt (Ausgangsstellung): Schulstart sehr wichtig, Geld wichtig, Gute Luft wichtig, Klima und Betrieb weniger wichtig. Die Leserin oder der Leser darf die Stufen umstellen; die Rangfolge (Platz + Balken + Summe klein daneben) ändert sich sofort; ein Knopf > Abgestimmte Gewichte stellt die Ausgangsstellung wieder her. Die Frage danach gilt immer für die abgestimmten Gewichte.

Rechnung mit den abgestimmten Gewichten: A = 5·5 + 3·2 + 3·5 + 1·3 = **49** · B = 5·5 + 3·4 + 3·2 + 1·2 = **45** · C = 5·2 + 3·5 + 3·5 + 1·5 = **45**. Gegenproben (nachgerechnet): Schulstart nur „wichtig“ → A 39, B 35, C 41 (C vorn); Klima „sehr wichtig“ → A 61, B 53, C 65 (C vorn); Geld „sehr wichtig“ → A 53, B 53, C 55 (C vorn); Gute Luft „weniger wichtig“ → A 39, B 41, C 35 (B vorn). B liegt nie vorn, solange Gute Luft mindestens „wichtig“ ist (B − A = 2·Geld − 3·Luft − Klima ≤ 0).

Satz der Projektsteuerin unter dem Vergleich, je nach aktueller Rangfolge (sichtbar):

| Lage | Satz |
|---|---|
| A vorn | > Das Ersatzgerät liegt vorn: Hier zählt vor allem, dass alle Kinder pünktlich in Räume mit guter Luft einziehen. |
| B vorn | > Die Leihgeräte liegen vorn – aber nur, weil gute Luft im Unterricht hier kaum zählt. Passt das zu Ihrer Schule? |
| C vorn | > Der spätere Einzug liegt vorn: Wenn Geld oder Klima so viel zählen wie der Schulstart, lohnt sich das Warten. |
| zwei oder drei gleichauf vorn | > Gleichauf – jetzt entscheidet das fachliche Urteil, nicht die Punktzahl. |

Empfehlung der Projektsteuerin (sichtbar, fest, für die abgestimmten Gewichte):
> **Empfehlung:** das Ersatzgerät. Es kostet am meisten, aber nur damit ziehen alle Kinder pünktlich in Räume mit guter Luft – und das ist das Ziel, das die Bürgermeisterin gesetzt hat. Wichtig für die Entscheidung: Wäre der Schulstart nur so wichtig wie das Geld oder wären Klima und Betrieb sehr wichtig, läge der spätere Einzug vorn. Die Leihgeräte liegen nur vorn, wenn gute Luft kaum zählt.
> **Wer entscheidet:** die Bürgermeisterin – mehr als 100.000 Euro, und das Geld käme aus der Reserve. Der Lenkungskreis berät. Entscheiden muss sie bis Ende Mai, sonst ist auch das Ersatzgerät nicht mehr rechtzeitig da.

**Frage**
> Die Vorlage geht an die Bürgermeisterin. Was legen Sie ihr vor?

| Platz | Wertung | Antwort (sichtbar) | Geld | Zeit | Vertrauen |
|---|---|---|---|---|---|
| 2 | A · gut | > Alle drei Wege mit dem Vergleich und der Empfehlung für das Ersatzgerät – samt dem Hinweis, wann der spätere Einzug vorn läge. | −1 | +1 | +1 |
| 3 | B · vertretbar | > Alle drei Wege – aber mit Ihrer eigenen Empfehlung für den späteren Einzug, weil er am wenigsten kostet. | −1 | 0 | 0 |
| 1 | C · Falle | > Es eilt. Sie geben das Ersatzgerät selbst frei und holen die Zustimmung der Bürgermeisterin danach ein. | −2 | +1 | −2 |

**Folge-Szenen**

*A · gut*
> Im Lenkungskreis beraten Kämmerei und Schulamt. Die Bürgermeisterin stellt nur eine Frage: „Wenn mir der Schulstart wichtiger ist als das Geld – bleibt es beim Ersatzgerät?“ Clara Faden nickt. Die Bürgermeisterin entscheidet: Ersatzgerät, das Geld kommt aus der Reserve. Clara Faden hält den Beschluss fest, mit Datum und einer Auflage: Das Gerät muss bis zum Herbst eingebaut sein. Hanna Klingel atmet hörbar aus.

*B · vertretbar*
> Die Bürgermeisterin liest Ihre Empfehlung und dann den Vergleich. „Sie empfehlen das Günstigste. Aber mein Ziel war der Schulstart.“ Sie vertagt um eine Woche, hört die Schule an und entscheidet dann: Ersatzgerät, aus der Reserve. Ihre Empfehlung war ehrlich begründet – sie passte nur nicht zu dem Ziel, das die Bürgermeisterin gesetzt hatte. Die Woche fehlt dem Einbau am Ende.

*C · Falle*
> Die Haustechnikfirma bestellt sofort – zu ihrem Preis, denn verhandelt hat niemand. Die Bürgermeisterin erfährt es aus dem Monatsbericht: „Mehr als 100.000 Euro und Geld aus der Reserve – das ist meine Entscheidung. So steht es auf der Seite, die wir vereinbart haben.“ Sie stimmt nachträglich zu, weil es in der Sache richtig ist. Aber der Stadtrat fragt nach.

**So macht man es gut**
> Eine große Entscheidung kommt als Vorlage mit mindestens zwei zulässigen Wegen, einem gewichteten Vergleich nach vorher abgestimmten Gewichten und einer begründeten Empfehlung – samt dem Hinweis, bei welchen anderen Gewichten die Rangfolge kippt. Entschieden wird von der Stelle, die es darf, und der Beschluss wird getrennt festgehalten: Empfehlung und Punktzahl sind noch keine Entscheidung.

**Das steckt dahinter** → Thema `entscheidungsvorlage`
> Der gewichtete Vergleich nimmt niemandem die Entscheidung ab; er zeigt, welcher Weg zu den gesetzten Zielen passt und wie sehr das Ergebnis an den Gewichten hängt.

---

### Kapitel 8 · Schulstart

| Feld | Inhalt |
|---|---|
| Zeit | Juli 2028, Hochsommer (das Ende spielt Ende August 2028) |
| Campus | **Stufe 6 · Sommer · Tag** – alle drei Gebäude stehen, Wege, Schulhof, Rasen und junge Bäume werden angelegt; nach der Folge-Szene **Stufe 7 · Sommer · Tag** (fertig, noch ohne Kinder); heller Mittag, kräftiges Blau |
| Figuren | Lot, Schwung, Klingel, Faden, Grundstein |
| Kurzfassung | nein (Brückensatz; das Ende wird gezeigt) |
| Thema | `ergebnisbild` |
| Beleg | k9.3-p3 (der Bauherr erteilt jede Freigabe selbst, der Lenkungskreis berät), k6.4.4-p1 (Ergebnis: Freigabe / keine Freigabe / Freigabe mit Auflagen), k4.5-p1 (Freigabe kann die Übergabe des Vorhabens betreffen), v24:hb-1 (befugte Stelle), v24:hb-1.4 (offene Folgen nicht als erledigt darstellen), v24:hb-5 (Übergabe offener Vorgänge mit Grundlagen, Fristen und Nachfolgern; ein Vorgang verschwindet nicht durch die Übergabe), v24:tlb-2 (Abschließen und übergeben) |

Fachliche Einordnung (intern): Freigabe am Ende der Bauzeit (Abschluss der Objektüberwachung, Übergabe; intern Freigabe zum Abschluss von LPH 8). Sichtbar heißt sie „die Freigabe am Ende der Bauzeit“ – keine Phasennummer. Die Projektsteuerin übergibt offene Vorgänge an das Gebäudemanagement der Stadt.

**Einstieg**
> Juli 2028. Der Kran ist fort, auf dem Schulhof wird Rasen gesät und werden junge Bäume gepflanzt, die Fenster glänzen. In drei Wochen beginnt das Schuljahr. Theo Lot geht mit einer langen Liste durch die Räume, Konrad Schwung prüft jede Tür, und Hanna Klingel hat die ersten Stundenpläne schon an die Wand geheftet. Vorher steht die letzte große Freigabe an: die am Ende der Bauzeit.

**Szene**
> **Theo Lot:** Fast alles fertig. Nur der Hallenboden: An zwei Stellen sind Fugen offen. Die Firma bessert bis zu den Herbstferien nach.
> **Konrad Schwung:** Und die Lüftung braucht im ersten Winter noch eine Feineinstellung. Das ist normal.
> **Hanna Klingel:** Ich will nur eins hören: Können die Kinder kommen?
> **Clara Faden:** Ich habe die Freigabe vorbereitet. Zwei Punkte sind offen, beide mit Termin und Zuständigen. Als erledigt melde ich sie nicht – sie sind es nicht.
> **Gisela Grundstein:** Dann sagen Sie mir, was Sie empfehlen.

**Frage**
> Die Schule will einziehen, und auf der Liste stehen noch zwei Zeilen. Was empfehlen Sie der Bürgermeisterin?

| Platz | Wertung | Antwort (sichtbar) | Geld | Zeit | Vertrauen |
|---|---|---|---|---|---|
| 3 | A · gut | > Freigabe mit Auflagen: Die Schule zieht ein, die zwei offenen Punkte gehen mit Termin und Zuständigen an das Gebäudemanagement der Stadt. | 0 | 0 | +1 |
| 2 | B · vertretbar | > Freigabe. Die zwei Punkte klärt der Architekt mit den Firmen. | 0 | 0 | 0 |
| 1 | C · Falle | > Freigabe ohne Einschränkung – zwei Kleinigkeiten müssen nicht in den Bericht. | 0 | 0 | −2 |

**Folge-Szenen**

*A · gut*
> Im Lenkungskreis wird kurz beraten, dann erteilt die Bürgermeisterin die Freigabe mit Auflagen. Clara Faden übergibt alles, was noch offen ist, an das Gebäudemanagement – jeden Punkt mit Termin und Namen. Nach den Herbstferien sind die Fugen geschlossen, im Januar ist die Lüftung eingestellt, und beides ist mit Nachweis erledigt. Das Gebäudemanagement findet alles an einer Stelle – niemand muss suchen.

*B · vertretbar*
> Die Bürgermeisterin erteilt die Freigabe. Clara Faden übergibt die zwei Punkte trotzdem an das Gebäudemanagement – verschwinden lässt sie nichts. Weil die Freigabe sie aber nicht nennt, fühlt sich die Firma für den Hallenboden nicht gedrängt: Die Fugen sind erst im Frühjahr geschlossen.

*C · Falle*
> Clara Faden schüttelt den Kopf: „Offenes zeige ich als offen.“ In ihrem Bericht stehen die zwei Punkte, und die Bürgermeisterin liest ihn, bevor sie unterschreibt. „Warum wollten Sie mir das nicht sagen?“ Sie erteilt die Freigabe mit Auflagen; die Punkte werden erledigt – das Gespräch aber bleibt Ihnen im Gedächtnis.

**So macht man es gut**
> Die Freigabe erteilt der Bauherr selbst – als Freigabe, keine Freigabe oder Freigabe mit Auflagen; der Lenkungskreis berät. Was noch offen ist, wird mit Termin und Zuständigen übergeben und nie als erledigt ausgegeben: Ein Vorgang verschwindet nicht durch die Übergabe.

**Mini-Aufgabe 4 · Schließen oder übergeben?** (zuordnen, zwei Knöpfe je Posten)
> Die Projektsteuerin räumt auf. Was kann sie schließen, was übergibt sie an das Gebäudemanagement?

| Posten (sichtbar) | Lösung | Erklärung (sichtbar) |
|---|---|---|
| > Die Frühwarnung zu den Lieferzeiten aus dem Frühjahr 2026 – geklärt, das Holz ist verbaut. | schließen | > Die Frage ist beantwortet, das Ergebnis liegt vor. |
| > Die angekündigten Mehrkosten der Haustechnik – geprüft: Sie gehören zum bestehenden Vertrag. | schließen | > Ein Risiko wird nur mit nachgewiesenem Grund geschlossen – den gibt es hier. |
| > Die losen Gerüstanker – erneuert und von der Sicherheitskoordination bestätigt. | schließen | > Die Lösung ist umgesetzt und fachlich bestätigt. |
| > Die offenen Fugen im Hallenboden – Nachbesserung beauftragt, noch nicht fertig. | übergeben | > Beauftragt ist nicht erledigt. Der Punkt geht mit Termin und Zuständigen weiter. |
| > Die Feineinstellung der Lüftung im ersten Winter | übergeben | > Das kommt erst noch. Wer sich darum kümmert und bis wann, wird bei der Übergabe festgehalten. |

Beleg Mini-Aufgabe: v24:hb-5 (Abs. 5–7: Abschlusskriterien, Risiko nur mit nachgewiesenem Grund schließen, Übergabe mit Fristen und Nachfolgern), v24:hb-1.2, v24:hb-1.4, v24:hb-1.6.

**Das steckt dahinter** → Thema `ergebnisbild`
> Am Ende zählt, was sich nachweisen lässt: welche Entscheidung wer auf welchem Stand getroffen hat – und was noch offen ist, mit Namen und Termin.

---

## 5 · Kurzfassung (etwa 10 Minuten)

Gezeigt werden **Kapitel 1, 3, 4 und 7** vollständig (Einstieg, Szene, Frage, Folge, So macht man es gut, Das steckt dahinter; in Kapitel 7 mit dem Vergleich), danach das **Ende**. Die Mini-Aufgaben entfallen in der Kurzfassung. Übersprungene Kapitel erscheinen als schmale Brückenkarte mit Campus-Bild der Stufe, Nummer und Titel und einem Brückensatz; ihre Balkenwirkung zählt wie die gute Antwort (der Brückensatz erzählt den guten Weg). Die Fortschrittslinie zeigt „1 von 4“ … „4 von 4“.

| Übersprungen | Brückensatz (sichtbar) | Balken (wie gut) |
|---|---|---|
| 2 · Ein erstes Warnsignal | > Im März erwähnt der Architekt beiläufig, dass Holzelemente knapp werden könnten. Die Projektsteuerin hält den Hinweis als Frühwarnung fest – mit Prüffrage, Namen und Termin – und zwei Wochen später ist die Antwort da. | Zeit +1, Vertrauen +1 |
| 5 · Zwei Zahlen, zwei Wahrheiten | > Im Herbst nennen Kämmerei und Architekt zwei verschiedene Zahlen. Die Projektsteuerin klärt den Unterschied – angekündigte Mehrkosten, die noch geprüft werden –, und die Bürgermeisterin nennt dem Stadtrat eine Zahl mit Begründung; die Mehrkosten erweisen sich als unberechtigt. | Geld +1, Vertrauen +2 |
| 6 · Ärger auf der Baustelle | > Im Februar lockert ein Sturm das Gerüst an der Sporthalle. Der Bauleiter sperrt sofort, die Projektsteuerin meldet es und hält es noch am selben Tag fest – so ist später klar, dass die Gerüstfirma zahlt. | Zeit −1, Vertrauen +1 |
| 8 · Schulstart | > Im Juli 2028 empfehlen Sie die Freigabe mit Auflagen. Die Bürgermeisterin erteilt sie, und zwei kleine Restarbeiten gehen mit Termin und Zuständigen an das Gebäudemanagement der Stadt. | Vertrauen +1 |

Lesezeit-Schätzung (nachgezählt am Drehbuch, 2026-10-03): rund 2.400 sichtbare Wörter auf dem Weg der Kurzfassung (vier Kapitel mit je einer Folge, Vergleich, Brücken, Auftakt, Ende, Bilanz) – etwa 10 Minuten. Hauptweg: rund 4.400 sichtbare Wörter mit je einer Folge-Szene, dazu vier Mini-Aufgaben und der Vergleich zum Ausprobieren – etwa 25 Minuten. P17.5 misst nach.

---

## 6 · Ende: Schulstart

| Feld | Inhalt |
|---|---|
| Zeit | Ende August 2028, erster Schultag |
| Campus | **Stufe 8 · Sommer · Morgen** – fertiger Campus, dazu: Schulbus an der neuen Haltestelle, Kinder mit Schultüten und Ranzen, Eltern, Fahrräder in den Ständern, Luftballons am Eingang der Grundschule, die Handglocke in Hanna Klingels Hand; Licht: früher Morgen, warmes Gold, lange Schatten unter den Linden. Bei reduzierter Bewegung stehen die Kinder still im Bild; sonst laufen sie in einer kurzen, ruhigen Bewegung über den Schulhof. |
| Beleg | – (Erzählung; die Bilanz wertet nur die Balken) |

**Szene**
> Ende August 2028, halb acht am Morgen. Der erste Schulbus hält an der neuen Haltestelle, die Sonne steht noch tief über den Linden. Kinder mit Schultüten und viel zu großen Ranzen laufen über den Schulhof, die Eltern hinterher. Am Eingang der Grundschule hängen Luftballons, und neben der Tür stehen die fünf, die diesen Campus zweieinhalb Jahre lang begleitet haben – und Sie.
> **Hanna Klingel** *(läutet ihre Glocke)*: Guten Morgen! Willkommen in eurer Schule!
> **Theo Lot:** Steht alles drin, was wir hier gemacht haben. Hätte ich vor zwei Jahren nicht gedacht, dass ich das mal gut finde.
> **Konrad Schwung:** Und beim nächsten Mal sag ich's gleich, wenn was klemmt. Ehrenwort.
> **Clara Faden:** Alles Offene ist übergeben, mit Namen und Termin. Verschwunden ist nichts.
> **Gisela Grundstein:** Wissen Sie, was das Beste war? Ich wusste jedes Mal, worüber ich entscheide.

Varianten nach Balkenstand (ersetzen bzw. ergänzen; sichtbar):

| Bedingung | Änderung |
|---|---|
| Zeit niedrig | nach dem ersten Absatz zusätzlich: > Nur die Sporthalle bleibt noch zu – sie wird erst nach den Herbstferien fertig. Bis dahin turnen die Kinder in der alten Halle. |
| Vertrauen niedrig | statt der Zeile der Bürgermeisterin: > **Gisela Grundstein:** Beim nächsten Projekt reden wir früher miteinander. Versprochen? |

Danach die **Bilanz** (Abschnitt 3): drei Balken im Endstand, Titel des Bilanz-Typs, zwei Sätze, je Balken ein Satz. Darunter zwei leise Wege: > Noch einmal von vorn · > Zu den Themen. Ganz unten, klein (O-44, O-1):
> Fiktiver Fall. Ein Angebot von Bauherr Mentoren – Kontakt über [bauherr-mentoren.com](https://bauherr-mentoren.com).

---

## 7 · Grafik-Liste (P17.3, P17.4)

Bildstil (O-53): isometrischer Campus, flach, farbenfroh, selbst gezeichnete Vektorgrafik, keine fremden Bilder; Porträts wie in Abschnitt 2. Auf jedem Schritt ist eine kleinere oder größere Grafik zu sehen. Alle Grafiken sind dekorativ (`aria-hidden`), außer Vergleich und Balken (mit Text-Alternative). Reduzierte Bewegung: keine Animation, Endzustände sofort.

**Wiederkehrende Elemente**
- **Campus**, isometrisch, gleiche Kamera in allen Stufen, Stufen 0–8 mit Jahreszeit (Frühling, Sommer, Herbst, Winter) und Licht (Morgen, Tag, Abend) wie `src/grafik/campus-iso.ts` (P17.3): gebaut wird nacheinander Gesamtschule → Sporthalle → Grundschule → Außenanlagen. Zuordnung: Kapitel 1 Stufe 0 Winter Morgen · 2 Stufe 0 Frühling Tag · 3 Stufe 1 Frühling Tag · 4 Stufe 2 Sommer Abend · 5 Stufe 3 Herbst Abend · 6 Stufe 4 Winter Tag (Sturm als Zusatz) · 7 Stufe 5 Frühling Morgen · 8 Stufe 6, nach der Folge Stufe 7, Sommer Tag · Ende Stufe 8 Sommer Morgen. Zusätze je Szene (Wimpel, Gerüst im Sturm, Luftballons) zeichnet die Szenen-Grafik über den Campus.
- **Porträts** der fünf Figuren und die Spielfigur „Sie“; in der Szene groß links neben der Sprechblase der sprechenden Figur, die anderen klein in einer Reihe.
- **Balken** Geld · Zeit · Vertrauen: kleine Leiste oben unter der Fortschrittslinie; bei der Folge groß mit Pfeilen und Wort.
- **Kärtchen „Wer entscheidet was“** (Projektblatt mit Büroklammer) – ab Kapitel 1 als kleines Symbol aufrufbar.
- **Kasten „Das steckt dahinter“** mit einem kleinen aufgeschlagenen Buch als Symbol.

| Kapitel | Kapitelbeginn | Szene | Frage | Folge |
|---|---|---|---|---|
| Auftakt | Campus Stufe 0 Winter Morgen, groß; Marke „Fiktiver Fall“ | fünf Figurenkarten mit Porträt | – | – |
| 1 | Campus Stufe 0 (Winter, Morgen, Bauschild) | Grundstein, Faden, Schwung; Gegenstand: Fassadenplatten-Muster in Schwungs Hand | Spielfigur „Sie“ mit Mappe; Gegenstand: leeres Blatt mit Stift | Projektblatt mit Unterschrift (A), Stapel aus elf Zetteln (B), Stadtrat-Mikrofon mit Fragezeichen (C); danach Kärtchen „Wer entscheidet was“ |
| 2 | Campus Stufe 0 (Frühling, Tag, Krokusse) | Schwung, Faden, Lot; Gegenstand: Messe-Visitenkarte, Sprechblase mit Holzstapel | Notizzettel mit Fragezeichen | Zettel mit drei Zeilen und Kalenderblatt (A), Zettel mit durchgestrichener Schätzzahl (B), Telefon, das nicht klingelt (C) |
| 2 · Mini | sechs Karten (Telefon, Holzstapel, Pfütze in Baugrube, Mensatablett, Pumpe, Fahrrad) | – | – | Häkchen bzw. Hinweis je Karte |
| 3 | Campus Stufe 1 (Frühling, Tag, Baugrube) | Schwung, Faden, Lot, Klingel; kleine Matrix 5 × 5 ohne Zahlen mit markiertem Feld „vorrangig“; Lkw mit Holzelementen | Warnschild (Dreieck mit Ausrufezeichen) | Vorlage mit zwei Spalten und Stempel „beschlossen“ (A), Kalender mit umgeblättertem Monat (B), Monatsbericht mit rot markierter Zeile und klingelndem Telefon (C) |
| 4 | Campus Stufe 2 (Sommer, Abend, Kran, Wimpel) | Klingel, Schwung, Faden, Lot; Gegenstand: Mensatablett mit Teller, Wimpelkette | zwei Mensa-Grundrisse nebeneinander (klein / mit gestrichelter Erweiterung) | Grundriss mit gestrichelter Erweiterung und Stempel (A), Anmeldeformulare und verstärktes Fundament (B), zerknüllte Planrolle (C) |
| 4 · Mini | sechs Fragekarten mit je drei Porträt-Knöpfen (Sie, Grundstein, Faden) | – | – | Porträt der richtigen Stelle hervorgehoben |
| 5 | Campus Stufe 3 (Herbst, Abend, Holzelemente) | Grundstein, Schwung, Faden; zwei Kostenzettel mit verschieden langen Balken (ohne Zahlen) | Rednerpult des Stadtrats | ein Zettel mit Balken und daneben gestrichelte Spanne (A), langer Balken mit Sparliste (B), Balken genau in der Mitte mit Fragezeichen (C) |
| 6 | Campus Stufe 4 (Winter, Tag, Sturm, Gerüst) | Lot, Schwung, beide mit Telefon; Sturmwolke, loser Gerüstanker | Absperrband | Absperrband + Eintrag mit Uhr und Kamera (A), Absperrband + Wochenkalender (B), Stoppschild an der Baustelle (C) |
| 6 · Mini | sechs Schrittkarten mit kleinen Symbolen (Absperrband, Telefon, Eintrag, Lupe, Vorlage, Häkchen) | – | – | richtige Reihenfolge als Pfad |
| 7 | Campus Stufe 5 (Frühling, Morgen, Grundschule wächst) | alle fünf; Gegenstand: Lüftungsgerät mit Kalender „+4 Monate“ als Symbol (Pfeil, keine Zahl) | Waage mit drei Schalen (A, B, C) | Beschluss mit Stempel und Datum (A), Uhr mit einer Woche (B), Stadtrat-Mikrofon und Monatsbericht (C) |
| 7 · Vergleich | – | Tabelle mit Punkten als Kreise, Gewichte als drei Stufenknöpfe je Gesichtspunkt, Rangbalken in den Farben A/B/C; Porträt der Projektsteuerin neben dem Empfehlungssatz | – | – |
| 8 | Campus Stufe 6, nach der Folge Stufe 7 (Sommer, Tag) | Lot, Schwung, Klingel, Faden, Grundstein; Gegenstand: Hallenboden mit zwei markierten Fugen, Thermometer an der Lüftung | Schlüsselbund mit Anhänger | Übergabemappe mit zwei Karteikarten (A), zwei Karteikarten in der Mappe des Architekten (B), Bericht mit zwei hervorgehobenen Zeilen (C) |
| 8 · Mini | fünf Karteikarten, zwei Ablagen („schließen“, „übergeben“) | – | – | Karten in der richtigen Ablage |
| Ende | Campus Stufe 8 (Sommer, Morgen; Kinder, Schulbus, Schultüten, Luftballons) | alle fünf Porträts lächelnd; Handglocke | – | Bilanz: drei Balken groß, Titel; dazu je Bilanz-Typ ein kleines Bild: Sonne über dem Campus (Ruhig ins Ziel), Wegweiser mit Umweg (Mit Umwegen), Stoppuhr (Letzte Meter), Brücke mit Riss (Nicht getragen) |

---

## 8 · Hinweise für Regie und Leinwand (P17.6)

Die Regie springt je Kapitel und je Schritt, kann die Antwort wählen (Tasten 1–3 in der Reihenfolge der Seite) und im Vergleich die Gewichte stellen; die Leinwand zeigt Szene, Balken, Vergleich und Bilanz, nie die Wertung der Antworten und nie Notizen. Regie-Notizen je Kapitel (nur in der Regie): Frage an die Runde vor der Wahl, z. B. Kapitel 1 „Wer entscheidet bei Ihnen heute über 100.000 Euro?“, Kapitel 7 „Was ist Ihnen wichtiger – Schulstart oder Geld?“ (Gewichte gemeinsam einstellen).

---

## 9 · Was dieses Drehbuch selbst entschieden hat (für L-Einträge)

1. Mandat projektbezogen zweistufig (Sie bis 100.000 Euro ohne Reserve, darüber die Bürgermeisterin, Lenkungskreis berät); die mittlere Stufe des Muster-Mandatsleiters (Änderungsgremium) entfällt in der Story, weil es nur fünf Figuren gibt und der Bauherr Schwellen projektbezogen festlegt (k4.2-p1, Projektblatt).
2. Die Bürgermeisterin ist die befugte Stelle der Stadt als Bauherr; die städtische Gebäudemanagement-Gesellschaft (O-3) erscheint nur als „Gebäudemanagement der Stadt“ (Betrieb nach der Übergabe), damit die Organisation total einfach bleibt.
3. Sichtbar „3 · Titel“ und „3 von 8“ statt „Kapitel 3“, weil die Sichtbarkeitsprobe „Kapitel“ sperrt.
4. Balken intern 0–10, Start Geld 9, Zeit 6, Vertrauen 4, Wirkung −2…+2, begrenzt; Stufen niedrig 0–3, mittel 4–6, hoch 7–10.
5. Vier Bilanz-Typen mit fester Prüfreihenfolge (Vertrauen niedrig vor Zeit niedrig vor „Ruhig ins Ziel“).
6. Folge-Szenen laufen zum Sachstand der guten Antwort zusammen; nur das Ende hat zwei Varianten nach Balkenstand.
7. Kurzfassung mit Kapitel 1, 3, 4, 7; übersprungene Kapitel zählen wie die gute Antwort; Mini-Aufgaben entfallen dort.
8. Gewichte im Vergleich in drei Stufen (5 · 3 · 1), abgestimmt aus der Zielpriorität der Bürgermeisterin (Kapitel 1); Punkt-Skalen für Geld und Schulstart in Abschnitt 4, Kapitel 7.
9. Neufestlegung der Projektbasis kommt in der Story nicht vor: Auf jedem Weg reicht die Reserve.
10. Die Vorlagen in Kapitel 3 und 4 existieren in der Geschichte vollständig, werden aber ohne Vergleichstabelle erzählt (O-52: gewichteter Vergleich nur in Kapitel 7).
11. Die Projektsteuerin ist in Kapitel 6 nicht in der Szene, damit Meldung und Festhalten am selben Tag von Ihrer Antwort abhängen.
12. Figurennamen: Gisela Grundstein, Clara Faden, Konrad Schwung, Hanna Klingel, Theo Lot.
