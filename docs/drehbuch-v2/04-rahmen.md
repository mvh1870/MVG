# Drehbuch v2 · Rahmen der erweiterten Story (P19.2, O-62, L-270, L-273)

Ausführliches Drehbuch für alles, was um die 14 Stationen herum steht: Auftakt, Akt-Kopfkarten und Pausen, Ende und Bilanz, Steckbriefe, Entscheidungsbuch und Verlauf, Brücken und Ende der Kurzfassung, Wörter der Oberfläche und die Änderungsliste gegenüber `inhalte/geschichte/rahmen.yaml`. Verbindlich ist das Gerüst `docs/drehbuch-v2/00-geruest.md` (dritte Fassung); **für den Wortlaut der Entscheidungsbuch-Zeilen (5.2), der Pausen (2.3), der Brücken (6.1), des Mandat-Kärtchens (4.2), der Echo-Zeilen der Kurzfassung (6.2) und der Vertiefungs-Formen (7.4) gilt diese Datei; die Dateien 00 bis 03 gleichen sich daran an (L-276)**; gelesen sind außerdem die Prüfberichte `tmp/story-analyse/P-fachtreue-geruest.md` und `P-dramaturgie-geruest.md`, `docs/DREHBUCH.md`, `inhalte/geschichte/rahmen.yaml` und `inhalte/fall.md`. Dieses Dokument ersetzt noch nichts; die Stationen selbst stehen in den Dateien 01 bis 03.

**Lesart.** Zitatblöcke (`>`) sind sichtbarer Text und folgen den festen Grenzen: Anrede Sie, „Sie“ spricht nie, wenige Zahlen, keine Abkürzungen, höchstens 60 Wörter je Absatz, die Seite sagt „Station“ und „Akt“, nie „Kapitel“ oder „Whitepaper“, LPH nur intern. Alles andere ist Regie. **Beleg-IDs** (`v24:hb-…` Handbuch, `v24:tlb-…` Teilleistungsbild, `v24:va-…` Vertragsanlage, `k…` Absatz aus V1.2) stehen nur hier und nie sichtbar; bei Widerspruch gilt V2.4 (O-36). Keine Wertung der Antworten, kein Test, keine Selbsteinschätzung (O-46, O-8); der Fall ist fiktiv (O-3); keine neue Fachaussage ohne Beleg (O-38).

**Wie die Wörter gezählt sind.** Zahlen nach der Zählregel von `werkzeuge/lesezeit.mjs` (jedes Wort aus Buchstaben oder Ziffern; Kicker, Bildtexte und zugeklappte Aufklapper außer der Titelzeile zählen nicht). Meine Zahlen stehen in Abschnitt 9 und zählen genau die Zitatzeilen des jeweiligen Teils; die Messung in P19.6 bleibt maßgeblich.

**Prüfstand der Rechnung.** Die Voraussetzungen in Abschnitt 3 habe ich mit einem Wegwerfskript auf allen 3¹⁴ = 4.782.969 Wegen der langen Fassung und allen 81 Wegen der Kurzfassung gegen die Balkentabelle des Gerüsts (Abschnitt 3 dort) geprüft: 768 Wege „ruhig“ und 5/59/17 in der Kurzfassung stimmen mit dem Gerüst überein, alle aufgelisteten Voraussetzungen gelten auf jedem Endzustand, 0 Verstöße. Eine Voraussetzung des Gerüsts trägt nicht (Hinweis in Abschnitt 3.4).

---

## 1 · Auftakt

### 1.1 Aufbau (Reihenfolge von oben nach unten)

1. Campus Stufe 0 · Winter · Morgen, groß; Marke „Fiktiver Fall“ im ersten Satz des Einstiegs (L-227).
2. Titel und Einleitung (drei kurze Absätze).
3. **Wegwahl** („So erleben Sie es:“): zwei gleichwertige Karten, gebaut (O-61). Nur Zahlen und Zahlwörter ändern sich (1.3).
4. Die fünf Begleitfiguren mit Steckbrief im Aufklapper, darunter „Und Sie:“.
5. Die drei Balken mit je einem Satz.

Die drei Nebenfiguren (Ranzen, Spitzfeder, Pfennig) stehen **nicht** im Auftakt (kein Steckbrief auf der Startseite); sie treten erst in den Stationen auf (Abschnitt 4). Der Auftakt steht vor der Wahl des Wegs und zählt deshalb auf beiden Wegen gleich.

### 1.2 Einleitung

> **Ein Schulcampus für Lindenhall**
> Ein fiktiver Fall: Die Stadt Lindenhall baut eine Gesamtschule, eine Grundschule und eine Sporthalle. Sie leiten das Projekt für die Stadt. Im Sommer 2028 sollen die Kinder einziehen.
> Das Projekt ist erfunden, die Fragen kennt jede Baustelle.
> Unterwegs entscheiden Sie; am Ende steht Ihre Bilanz.

Regie. „Mehrmals“ statt einer Zahl (Gerüst, Abschnitt 7: „Auftakt“): Die Zahl steht nur auf den Wegkarten. Der Satz „im Süden der Stadt“ und „Ihre Antworten bewegen drei Balken“ entfallen; die Balken erklärt der Abschnitt darunter, die Gegend sagt die Station 1. Der alte dritte Absatz („Am Ende sehen Sie, wie Ihr Projekt ausgegangen ist“) ist im Schlusssatz aufgegangen.

### 1.3 Wegwahl (Karten sind gebaut; nur Zahlen und Wörter)

| Teil | Lange Karte | Kurze Karte |
|---|---|---|
| Überschrift der Wahl | > So erleben Sie es: | (gleich) |
| Titel | > Die ganze Geschichte | > Die Kurzfassung |
| Zeile mit Zahlen | > Vierzehn Entscheidungen · etwa 40 Minuten | > Vier Entscheidungen · etwa 10 Minuten |
| Text | > Alle Stationen, alle Aufgaben. | > Die wichtigsten Stationen, der Rest kurz erzählt. |
| Knopf | > Los geht's | > Kurzfassung starten |
| Bildbeschreibung (Skizze, nur Vorlesetext) | > Der Weg mit allen vierzehn Stationen, keine ausgelassen | > Derselbe Weg, aber nur vier von vierzehn Stationen werden gespielt, die übrigen sind kurz überbrückt |

Regie. (a) Das Zahlwort kommt aus `ZAHLWORT` in `src/ui/woerter.ts`; die Tabelle endet heute bei „Zwölf“, braucht also „Dreizehn“ und „Vierzehn“ (Abschnitt 7), sonst erscheint „14 Entscheidungen“. (b) „etwa 40 Minuten“ und „etwa 10 Minuten“ sind gerundete Messwerte (`tests/lesezeit.test.ts`): „etwa 40“ stimmt nur, solange der ganze Weg **unter 8.100 Wörtern** bleibt (8.100 geteilt durch 200 gibt 40,5, gerundet 41), „etwa 10“ nur unter 2.100 Wörtern der Kurzfassung (die gerechneten Entwürfe liegen bei rund 7.820 und rund 2.050 Wörtern, Abschnitt 9; die **obere Schranke** der Tests ist davon getrennt: 9.000 Wörter gesamt, 3.300 je Akt, Abschnitt 8). Die Teile ergeben die Wörter in Abschnitt 9. Wird in P19.6 mehr gemessen, ändert sich die Zahl auf der Seite, nicht der Text. (c) „Mit Ausprobieren eher 45 Minuten“ (Gerüst, Abschnitt 10) steht **nicht** auf der Karte, um die Zahlen zu schonen; es bleibt eine Offene Frage (Abschnitt 10, Nr. 3).

### 1.4 Die fünf Begleiter und Sie

Namen, Rollen und Porträts bleiben; Steckbriefe frischen die Figurenbögen auf (Abschnitt 4.2). Die Überschrift bleibt:

> Diese fünf Menschen begleiten Sie:

Darunter „Und Sie:“ mit Rolle „Projektleitung des Bauherrn“. Steckbriefe sind zugeklappt (Titelzeile „Steckbrief“); sie zählen deshalb mit je einem Wort.

### 1.5 Die drei Balken

Überschrift gekürzt („Drei Balken“ statt „Drei Balken begleiten Sie“); Texte so kurz, dass der Auftakt nahe bei 150 Wörtern bleibt (152; die Kurzfassung als Ganzes hat Luft). Die Erklärung „Sie sind neu“ bleibt als Grund für den Start unter der Hälfte (R76).

> **Drei Balken**
> **Geld:** Wie viel Budget und Reserve noch übrig sind.
> **Zeit:** Wie viel Zeitpuffer bis zum Schulstart bleibt.
> **Vertrauen:** Wie sehr sich Bürgermeisterin, Schule und Stadtrat auf Sie verlassen. Sie sind neu, deshalb beginnt es niedrig.

Die längeren Texte aus `rahmen.yaml` („… Sie sind neu – das muss erst wachsen“; „… für Unvorhergesehenes übrig ist“; „… im Sommer 2028 bleibt“) fallen für den Auftakt weg; der Zusatz „das muss erst wachsen“ geht nicht verloren, die Bilanz sagt es am Ende. **Auswirkung auf Tests:** die Balkentexte werden an mehreren Stellen gezeigt (Auftakt, Balkentafel); alle Stellen müssen dieselben Kurzsätze nehmen, sonst steht dasselbe in zwei Fassungen auf der Seite.

### 1.6 Kürzungsplan Auftakt (Gerüst, Abschnitt 2d)

Messung heute: 187 Wörter (Titel 4, Einleitung 70, Wegwahl 34, Figuren 32, Balken 47). Ziel 150, geplant 152 (Sprachfassung: „deshalb beginnt es niedrig“ beim Vertrauen, „mehrmals“ entfällt):

| Teil | heute | neu | Änderung |
|---|---|---|---|
| Titel | 4 | 4 | – |
| Einleitung | 70 | 45 | −25 (zwei Sätze zusammengelegt, „im Süden“, „Ihre Antworten bewegen drei Balken“, „mehrmals“ weg) |
| Wegwahl | 34 | 34 | – (nur Zahlwörter getauscht) |
| Figuren | 32 | 32 | – |
| Balken | 47 | 37 | −10 |
| **Summe** | **187** | **152** | **−35** |

Die „viermal entscheiden“ aus dem alten Drehbuch kommt nicht mehr vor; die Zahl steht nur auf den Karten.

---

## 2 · Akt-Kopfkarten und die zwei Pausen

### 2.1 Akt-Leiste (immer sichtbar, oben in der Leiste)

Eine schmale Leiste mit drei Abschnitten „Akt I“, „Akt II“, „Akt III“ über der Fortschrittslinie; der Abschnitt des Akts der gezeigten Station ist hervorgehoben (Wort **und** Füllung, nie nur Farbe). Die Fortschrittslinie darunter zeigt je Station ein Feld mit der Nummer, Akte durch eine kleine Lücke getrennt. Schmal (400 px): nur die Felder des laufenden Akts sind sichtbar, die anderen Akte als zwei kurze Striche. In der Kurzfassung zeigt die Leiste nur den Akt der gezeigten Station (Gerüst 2d), die Fortschrittslinie „1 von 4“ bis „4 von 4“.

Ortszeile unter der Leiste, ganzer Weg: **„Station 7 von 14 · Akt II · noch etwa 24 Minuten“**; Kurzfassung: **„Station 2 von 4 · Akt I · noch etwa 7 Minuten“** (Akt der gezeigten Station; die Nummer im Titel bleibt die Nummer der Geschichte, wie schon heute). Die Restzeit rechnet die Seite aus der Messung (Wörter des Rests des guten Wegs, geteilt durch 200, auf ganze Minuten gerundet), nie von Hand. Vorläufige Werte aus den Obergrenzen des Gerüsts:

| Beginn von Station | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| noch etwa (Minuten) | 40 | 37 | 34 | 32 | 29 | 26 | 24 | 21 | 18 | 15 | 12 | 10 | 6 | 4 |

Kurzfassung (Stationen 1, 3, 5, 12): 9 · 7 · 6 · 4. Vor der Pause und im Ende steht „gleich geschafft“ statt einer Zahl unter zwei Minuten. Regel: unter 2 Minuten „gleich geschafft“, sonst „noch etwa n Minuten“ (n ganze Zahl). **Abweichung von der Vorgabe:** Das Beispiel der Aufgabenstellung („Station 7 von 14 … noch etwa 9 Minuten“) wäre nach den Obergrenzen des Gerüsts Station 12; bei Station 7 ist der Rest rund 24 Minuten.

### 2.2 Akt-Kopfkarte (am ersten Schritt von Station 1, 6 und 11; in der Kurzfassung entfällt sie)

Ein schmales Band über dem Kopf der Station, links der Campus-Ausschnitt der Station, rechts Titel, Zeitraum und ein kurzer Satz. Titel und Zeitraum stehen im Kicker (zählen nicht zur Lesezeit); der Satz zählt (höchstens zehn Wörter).

| Akt | Kicker | Satz |
|---|---|---|
| I | Akt I · Ordnung schaffen · Januar bis Juni 2026 | > Zuerst klären Sie, wen Sie fragen. |
| II | Akt II · Takt und Zahlen · August 2026 bis Februar 2027 | > Jetzt kommt der Druck von außen. |
| III | Akt III · Entscheiden und Übergeben · April 2027 bis August 2028 | > Jetzt wird es persönlich. |

Regie. Die Sätze tragen die Leitidee der drei Akte (Gerüst, Abschnitt 1) ohne neue Fachaussage; sie sind Erzählung und stehen in den Wortzielen der Stationen 1, 6 und 11 (je 4 bis 6 Wörter, zusammen 16). Die Pause zuvor führt in den Akt schon hin, deshalb bleibt der Satz so knapp.

### 2.3 Die Pause (nach Station 5 und nach Station 10; nur ganzer Weg)

**Wann und wie.** Die Pause erscheint beim „Weiter“ von Station 5 zu 6 und von 10 zu 11 als eigener Schritt. Wer über die Fortschrittslinie springt, sieht sie nicht. Die Pause ist **kein Test** (O-46, O-8): keine Punkte, kein Urteil, keine Rangfolge.

**Aufbau (von oben):**
1. Campus-Bild der Pause: Akt I Stufe 2 · Sommer · Abend (wie Station 5), Akt II Stufe 4 · Winter · Abend ohne Sturm, leichter Schnee; davor die Bank unter der Linde (Gegenstand der Pausenkarte, Gerüst Abschnitt 9).
2. Kicker „Kurze Pause“, Überschrift mit Akt und Titel, Zeitraum.
3. Satz der Bürgermeisterin (Porträt, Sprechblase).
4. Block „Das können Sie jetzt“, drei Sätze.
5. **Verlauf** (Abschnitt 5.3): Kicker „Ihr Weg bis hier“, die drei Linien (Beschriftung in der Grafik), darunter der Aufklapper „Verlauf als Text“ (zugeklappt zählt nur die Titelzeile).
6. Zeile „gespeichert“, leise.
7. Knopf „Weiter mit Akt II“ bzw. „Weiter mit Akt III“.

#### Pause nach Akt I

> **Akt I · Ordnung schaffen** · Januar bis Juni 2026
> **Gisela Grundstein:** Jetzt wissen Sie, wen Sie fragen. Mal sehen, ob das auch hält, wenn es draußen drückt.
> **Das können Sie jetzt**
> Sie wissen, wer was entscheiden darf – und wann etwas zur Bürgermeisterin muss.
> Sie erkennen, was vorliegt – Hinweis, Risiko, Problem oder Änderungswunsch – und was die Projektsteuerin daraus macht.
> Sie lassen bei einer Änderung bis zur Entscheidung die bisherige Planung gelten; eine beiläufige Zusage ersetzt keinen Beschluss.
> Ihr Weg bis hier ist auf diesem Gerät gespeichert.
> Weiter mit Akt II

Belege der Sätze (intern): Satz 1 `k4.2-p1`, `k4.2-p2`, `v24:hb-1`, `v24:hb-projektblatt` · Satz 2 `v24:hb-1`, `v24:hb-1.2`, `v24:hb-1.4`, `v24:hb-1.5`, `v24:tlb-2` · Satz 3 `v24:hb-1.5`, `v24:hb-3.1` (Schluss), `k4.3-p2`, `v24:va-4.2`. Ableitung in Satz 3: „Eine Zusage im Flur ist kein Beschluss“ ist aus `hb-1.5` (bis zur wirksamen Freigabe gilt die bisherige Grundlage) und `hb-3.1` (Schweigen, Empfehlung, Softwarestatus sind kein Beschluss) abgeleitet, wie im Bestand (`k4`). **Gegenüber dem Gerüst:** Satz 3 ist von der Handlung („Sie lassen … gelten und verlassen sich nicht auf …“) auf eine kürzere Fassung gebracht, damit die Pause nahe bei 90 Wörtern bleibt; die Aussage bleibt dieselbe. Gezählt: 86 Wörter in den Zitatzeilen, dazu 3 für die Titelzeile des Aufklappers „Verlauf als Text“ = 89.

#### Pause nach Akt II

> **Akt II · Takt und Zahlen** · August 2026 bis Februar 2027
> **Gisela Grundstein:** Jetzt wissen wir, was Druck ist. Als Nächstes kommt es auf die Menschen an.
> **Das können Sie jetzt**
> Sie lassen eine Zahl mit Datum und Begründung vorlegen; abweichende Einschätzungen stehen erklärt daneben, ohne Mittelwert.
> Sie lesen einen Monatsbericht mit einer Frage: Was soll entschieden werden, von wem, bis wann?
> Eine Freigabe erlaubt den nächsten Schritt, bestellt wird aber über die Vergabestelle; Dringliches wird sofort gemeldet, Eile ersetzt keine Freigabe.
> Ihr Weg bis hier ist auf diesem Gerät gespeichert.
> Weiter mit Akt III

Belege (intern): Satz 1 `v24:hb-2` (Abs. 3, 6), `v24:hb-3` (Abs. 4), `v24:hb-5`, `v24:tlb-3`, `k4.6-p1`, `k4.6-p2` · Satz 2 `v24:hb-4`, `v24:tlb-4`, `k2.4-p2` · Satz 3 `v24:va-4.2`, `v24:tlb-5`, `k4.5-p1`, `k9.3-t1`, `v24:hb-4`, `v24:hb-1.4`, `v24:va-5.2`. Station 6 (Elternabend, Presse als Kulisse) steht bewusst in keinem Satz (L-273). „Sie lassen vorlegen“ statt „Sie legen vor“, weil die Projektsteuerin vorbereitet und vorlegt (Rolle, Gerüst Regel 4). Satz 3 verbindet zwei Aussagen (Freigabe und Dringliches); er bleibt ein Satz, weil das Gerüst „drei Sätze“ verlangt, und hat 19 Wörter. Der Satz der Bürgermeisterin ist gegenüber dem Gerüst gekürzt („Als Nächstes kommt es auf die Menschen an“ statt „Der nächste Teil ist der, in dem es auf die Menschen ankommt“), damit die Pause nahe bei 90 Wörtern bleibt. Gezählt: 93 Wörter in den Zitatzeilen, dazu 3 für „Verlauf als Text“ = 96.

#### Pause mit offenen Stationen (Sprung über die Fortschrittslinie)

Hat der Weg im Akt Stationen ohne Antwort, steht statt des Blocks „Das können Sie jetzt“ nur der folgende Satz (kein Urteil über den Weg, wie die Bilanz „offen“, R73). Der Knopf „Weiter“ bleibt, dazu der Knopf zur ersten offenen Station.

> Einige Stationen dieses Akts haben Sie noch nicht gespielt.

Knopf zur ersten offenen Station (Wortlaut des Bestands `zurOffenen`): > Zur ersten offenen Entscheidung: Station 2 · Ein erstes Warnsignal.

**Voraussetzungen der Pausentexte** (für Tests, Abschnitt 3.4): „Das können Sie jetzt“ erscheint nur, wenn **alle Stationen des Akts beantwortet** sind (Akt I: 1 bis 5; Akt II: 6 bis 10). Die Sätze sind Lernaussagen und setzen sonst keine Wahl voraus; keine nennt eine bestimmte Antwort. Der Satz der Bürgermeisterin ist Erzählung ohne Tatsache über einen Weg. Die Zeile „gespeichert“ erscheint nur, wenn der Stand tatsächlich im Browser liegt (sonst entfällt sie); sie sagt weder „Speichern“ noch „Klicken“ (kein Bedienhinweis, O-56).

### 2.4 Was in der Kurzfassung entfällt

Akt-Kopfkarten, beide Pausen, der Block „Das können Sie jetzt“, Vertiefungen, Entscheidungsbuch-Zeilen im Fluss der Stationen (das Buch bleibt über sein Symbol erreichbar, Abschnitt 5) und alle Interaktionen. Grund: Wortzahl, nicht Inhalt (Gerüst 2d).

---

## 3 · Ende und Bilanz

### 3.1 Aufbau des Endes (ganzer Weg)

1. Kicker „Ende August 2028“, Überschrift „Schulstart“, Campus Stufe 8 · Sommer · Morgen; bei „Zeit niedrig“ steht die **Sporthalle eingerüstet und offen** (`halleOffen`, Bestand), sonst fertig.
2. Einstieg (zwei Absätze), bei „Zeit niedrig“ der Zusatzabsatz.
3. Schlusszeilen der Figuren (nach Fassung).
4. Block „Das können Sie jetzt“ für Akt III (neu, vor der Bilanz).
5. Bilanz: Titel, Text, Balken, Satz je Balken, Verlauf.
6. Wege: „Noch einmal von vorn“, „Zu den Themen“; am Ende der Kurzfassung zusätzlich der Knopf „Weiter mit der ganzen Geschichte“ unter dem Kicker „Was dazwischen geschah“.
7. Abbinder „Fiktiver Fall. Ein Angebot von Bauherr Mentoren …“ (O-44, O-1; unverändert).

### 3.2 Einstieg

Ganzer Weg:

> Ende August 2028, halb acht am Morgen. Der erste Schulbus hält an der neuen Haltestelle, die Sonne steht noch tief über den Linden. Kinder mit Schultüten und viel zu großen Ranzen laufen über den Schulhof, die Eltern hinterher.
> Am gemeinsamen Haupteingang des Campus hängen Luftballons. Neben der Tür stehen die fünf, die diesen Campus knapp drei Jahre lang begleitet haben – und Sie. Etwas abseits warten Marlene Ranzen, Bernd Spitzfeder und Ewald Pfennig.

Kurzfassung (unverändert, keine Nebenfigur ist dort eingeführt):

> Ende August 2028, der erste Schultag. Am Haupteingang stehen Ihre fünf Begleiter – und Sie.

Zeit niedrig (beide Wege, nach dem ersten Absatz, unverändert):

> Nur die Sporthalle bleibt noch geschlossen – sie wird erst nach den Herbstferien fertig. Bis dahin turnen die Kinder in der alten Halle.

**Zwei kleine Berichtigungen gegenüber heute:** „zweieinhalb Jahre“ wird „knapp drei Jahre“ (Januar 2026 bis August 2028 sind 32 Monate); in der Zeile von Theo Lot entfällt „vor zwei Jahren“ (Zahl, die nicht stimmt).

**Voraussetzung der Zeit-niedrig-Zeile.** Sie beschreibt nur den Balkenstand (Zeit niedrig, Endstand 0 bis 3) und setzt keine Wahl voraus. Konsistenz mit den Stationen 13 und 14 (Autor von 02/03 beachten): Die Fugen im Hallenboden sind eine geführte Restleistung, die in den Herbstferien nachgebessert wird; die Halle ist auf den Wegen mit Zeit mittel oder hoch **nutzbar** (Nachbesserung in den Ferien), nur auf „Zeit niedrig“-Wegen öffnet sie erst nach den Herbstferien.

### 3.3 Schlusszeilen in vier Fassungen (Engine: `endeFassung`)

Reihenfolge der Prüfung: Vertrauen niedrig vor „nach einer Falle“ vor „offen“ vor Grundfassung (L-239). Zeilen mit **K** sind in der Kurzfassung sichtbar, die übrigen (`kurzfassung: false`) nur auf dem ganzen Weg; Ranzen und Spitzfeder stehen in jeder Fassung außer der Fassung „offen“, aus der nur der Satz der Bürgermeisterin wechselt. Die Zeilen von Schwung und Faden sind unverändert, bei Klingel nennt die Bühnenzeile die Glocke der alten Schule (die Kurzfassung hat die Glocke vorher nicht gesehen); neu sind die Zeile von Lot (Echo E10) und die Zeilen von Ranzen, Spitzfeder und Pfennig.

**Grundfassung** (keine Falle, Vertrauen nicht niedrig, keine Entscheidung offen):

> **Hanna Klingel** *(läutet die Glocke ihrer alten Schule)*: Guten Morgen! Willkommen in eurer Schule! **K**
> **Theo Lot:** *{Echo E10, Fassung nach Station 10}* Und inzwischen steht alles im Buch – hätte ich nie gedacht, dass ich das mal gut finde.
> **Konrad Schwung:** Seit dem Holz sag ich's gleich, wenn was klemmt. Hat sich gelohnt.
> **Clara Faden:** Alles Offene ist übergeben, mit Namen und Termin. Verschwunden ist nichts.
> **Marlene Ranzen:** Und mein Jüngster? Der sitzt heute im neuen Raum, nicht mehr im Container.
> **Bernd Spitzfeder:** Die Glocke läutet. Das schreibe ich genau so auf.
> **Ewald Pfennig:** Wo steht das? – Hier stand alles im Buch.
> **Gisela Grundstein:** Wissen Sie, was das Beste war? Ich wusste jedes Mal, worüber ich entscheide. **K**

Echo E10 (Zeile vor dem Satz von Lot; **eine** der drei Fassungen, nach der Antwort in Station 10, ohne Quelle (Sprung) die Fassung „gut“, in der Kurzfassung entfällt sie):

> Seit dem Sturm schreibe ich selbst auf, was ich sehe – Uhrzeit, Foto, fertig. *(gut)*
> Nach dem Sturm weiß ich: Wer es gleich aufschreibt, streitet später weniger. *(vertretbar)*
> Der Sturm hat uns eine Woche gekostet. Seitdem rufe ich an, bevor ich weitermache. *(Falle)*

**Nach einer Falle** (mindestens eine Falle, Vertrauen nicht niedrig): Zeile der Bürgermeisterin und Zeile von Pfennig ändern sich, die anderen bleiben:

> **Ewald Pfennig:** Das Buch lese ich gern. Wo etwas fehlt, frage ich weiter nach.
> **Gisela Grundstein:** Geschafft haben wir es. Aber nicht jede Entscheidung ist so sauber vorbereitet worden, wie sie hätte sein sollen – das machen wir beim nächsten Projekt besser. **K**

**Vertrauen niedrig** (geht vor „nach einer Falle“; ersetzt Lot und Bürgermeisterin, Pfennig wie „nach einer Falle“; Echo E10 entfällt):

> **Theo Lot:** Inzwischen ist alles schriftlich festgehalten. Hätten wir damit mal früher angefangen.
> **Ewald Pfennig:** Das Buch lese ich gern. Wo etwas fehlt, frage ich weiter nach.
> **Gisela Grundstein:** Beim nächsten Projekt reden wir früher miteinander. Versprochen? **K**

**Offen** (Entscheidungen offen, keine Falle, Vertrauen nicht niedrig; es gilt der Satz der Kurzfassung, keine neuen Zeilen, kein Block „Das können Sie jetzt“):

> **Gisela Grundstein:** Geschafft haben wir es. Was Sie unterwegs noch nicht entschieden haben, schauen wir uns noch einmal gemeinsam an. **K**

Regie. Klingel steht in allen Fassungen; sie läutet in jedem Fall (Zielzeile des Motivs „Glocke“, Gerüst Abschnitt 7). In den Fassungen mit „offen“ ersetzt der neue Ersatzsatz nur die Zeile der Bürgermeisterin (wie heute). Ranzen und Spitzfeder haben im Ende je **eine** Zeile (L-276): Ranzens Sorge („die Letzten im Container“) und Spitzfeders Chronistenrolle finden dort ihren Abschluss; beide Zeilen nennen nur Tatsachen, die auf jedem Weg gelten (die Kinder ziehen in die neuen Räume, Klingel läutet), und tragen `kurzfassung: false`. Im Schlussbild reicht Ranzen Klingel zusätzlich die Tür und Spitzfeder fotografiert die Glocke (Bild).

### 3.4 Voraussetzungen jedes Bilanz- und Balkensatzes (für `tests/geschichte-wege.test.ts`)

Die Spalte „setzt voraus“ ist die **Bedingung, die auf jedem Endzustand gelten muss, auf dem der Text erscheint**. Merkmale wie im Zustandsautomaten der Testhilfe: `falle` (mindestens eine Falle gewählt; in der Kurzfassung zählen übersprungene Stationen als gut), `nichtGut` (Zahl der Antworten, die nicht gut sind, gedeckelt auf 2), `teurerGeld`/`teurerZeit` (mindestens eine Antwort mit schlechterer Wirkung als die gute im selben Balken). Neu zu bilden ist **`falleStat3bis13`** (Falle in einer der Stationen 3 bis 13); es ersetzt das Merkmal `falleK4K7` der alten Tests. Nachgerechnet auf 4.782.969 Wegen (lang) und 81 Wegen (Kurzfassung): **jede Zeile gilt, 0 Verstöße**.

| Text (Anfang, zur Festhaltung im Test) | erscheint, wenn | setzt voraus |
|---|---|---|
| Bilanz „Ruhig ins Ziel“ („Die Kinder sind pünktlich eingezogen, und jede große Entscheidung …“) | Typ ruhig | keine Falle (`!falle`) |
| Bilanz „Geschafft – mit Umwegen“ („Der Campus steht, die Kinder sind da – aber nicht jede Ihrer Antworten …“) | Typ umwege | `nichtGut ≥ 1` |
| Bilanz „Auf den letzten Metern“ („Die Schule hat geöffnet, aber der Zeitpuffer war am Ende aufgebraucht …“) | Typ letzte-meter | `teurerZeit` |
| Bilanz „Gebaut, aber ohne Rückhalt“ („Die Gebäude stehen, doch das Vertrauen hat gelitten …“) | Typ nicht-getragen | `nichtGut ≥ 2` |
| Bilanz „Noch nicht alle Entscheidungen getroffen“ | mindestens eine Station des Wegs ohne Antwort | keine Wahl; sie nennt keinen Weg |
| Geld hoch („Die Reserve wurde dort eingesetzt, wo sie gebraucht wurde. Jedes Mal hat die Bürgermeisterin das entschieden …“) | Geld 7 bis 10 | **keine Falle in den Stationen 3 bis 13** (`!falleStat3bis13`); Falle in 1, 2 oder 14 ändert am Geld nichts |
| Geld mittel („Ein großer Teil der Reserve ist verbraucht; manches wurde teurer als nötig.“) | Geld 4 bis 6 | `teurerGeld` |
| Geld niedrig („Die Reserve ist fast aufgebraucht; jede Antwort, die nicht der beste Weg war, hat sie ein Stück kleiner gemacht.“) | Geld 0 bis 3 | `teurerGeld` |
| Zeit hoch („Der Zeitpuffer hat gehalten …“) | Zeit 7 bis 10 | keine (beschreibt den Stand) |
| Zeit mittel („Der Zeitpuffer war am Ende dünn, hat aber gereicht.“) | Zeit 4 bis 6 | `teurerZeit` |
| Zeit niedrig („Der Zeitpuffer ist aufgebraucht: Die Sporthalle öffnet erst nach den Herbstferien.“) | Zeit 0 bis 3 | keine |
| Vertrauen hoch, mittel, niedrig (je ein Satz) | Stufe des Vertrauens | keine (beschreiben den Stand) |
| Zeile „Nur die Sporthalle bleibt noch geschlossen …“ und Campus mit offener Halle | Zeit 0 bis 3 und Bilanz nicht „offen“ | keine; Konsistenz mit 13/14 siehe 3.2 |
| Bürgermeisterin, Grundfassung („Wissen Sie, was das Beste war? …“) | Fassung grund | keine Falle (`!falle`) |
| Bürgermeisterin nach einer Falle („Geschafft haben wir es. Aber nicht jede Entscheidung …“) | Fassung nach-falle | Falle (`falle`) |
| Bürgermeisterin bei niedrigem Vertrauen („Beim nächsten Projekt reden wir früher miteinander …“) | Fassung vertrauen-niedrig | **Falle (`falle`)** – ersetzt das Merkmal `spaet` (siehe unten) |
| Bürgermeisterin „offen“ („Geschafft haben wir es. Was Sie unterwegs noch nicht entschieden haben …“) | Fassung offen | keine Falle, Vertrauen nicht niedrig, Station offen |
| Lot, Grundfassung und nach einer Falle (Echo E10 + „Und inzwischen steht alles im Buch …“) | Fassung grund oder nach-falle, nicht Kurz | keine für den zweiten Satz; der erste Satz folgt dem Echo-Test (Fassung nach der Antwort in Station 10, ohne Antwort „gut“) |
| Lot bei niedrigem Vertrauen („Inzwischen ist alles schriftlich festgehalten. Hätten wir damit mal früher angefangen.“) | Fassung vertrauen-niedrig, nicht Kurz | `falle` |
| Pfennig, Grundfassung („Wo steht das? – Hier stand alles im Buch.“) | Fassung grund, nicht Kurz | keine Falle (`!falle`); „im Buch stand alles“ gilt auf jedem Weg, das Buch ist neutral (Abschnitt 5.2) |
| Pfennig nach einer Falle und bei niedrigem Vertrauen („Das Buch lese ich gern. Wo etwas fehlt, frage ich weiter nach.“) | Fassung nach-falle oder vertrauen-niedrig, nicht Kurz | `falle` |
| Schwung, Faden, Klingel (unveränderte Zeilen) | Fassung grund oder nach-falle (Klingel immer) | keine |
| Ranzen („Und mein Jüngster? Der sitzt heute im neuen Raum …“), Spitzfeder („Die Glocke läutet. Das schreibe ich genau so auf.“) | jede Fassung außer „offen“, nicht Kurz | keine; beide Sätze gelten auf jedem Weg (die Kinder ziehen ein, Klingel läutet immer) |
| Block „Das können Sie jetzt“ vor der Bilanz (Akt III) | alle Stationen 11 bis 14 beantwortet, nicht Kurz | keine Wahl; reine Lernaussagen |
| Knopf „Weiter mit der ganzen Geschichte“ mit Kicker „Was dazwischen geschah“ | Kurzfassung | keine; sagt nichts über den Weg |

**Zu `spaet`.** Das alte Merkmal (Antworten, nach denen die Bürgermeisterin zu spät erfährt) bezieht sich auf die acht alten Stationen. Ersatz: Die Zeile „Beim nächsten Projekt reden wir früher miteinander“ setzt nur eine Falle voraus. Auf allen Wegen mit niedrigem Vertrauen gibt es mindestens eine Falle und mindestens zwei nicht gute Antworten (nachgerechnet). Der Weg „lauter vertretbar, nur Station 14 Falle“ endet mit Vertrauen 2: dort ist die einzige Falle in Station 14; die Zeile passt auch dann, weil davor schon vertretbare Antworten die Bürgermeisterin auf Umwege geschickt haben. **Das Gerüst verlangt (Abschnitt 3), „Falle in 1 bis 13“ gelte bei niedrigem Vertrauen; das stimmt nicht** (Gegenbeispiel `gvvvvvvvvvvvvf`: Vertrauen 3 mit Falle nur in Station 14). Die tragende Voraussetzung ist daher „mindestens eine Falle“.

### 3.5 Block „Das können Sie jetzt“ vor der Bilanz (Akt III)

Nur auf dem ganzen Weg, nur wenn die Stationen 11 bis 14 beantwortet sind. Auf der Seite steht der Kopf als Kicker (zählt nicht), die drei Sätze zählen.

> **Das können Sie jetzt** · Akt III · Entscheiden und Übergeben
> Sie verlangen, dass auch ein Fremder einen Eintrag versteht.
> Sie bekommen große Entscheidungen mit mindestens zwei zulässigen Wegen vorgelegt; was erfüllt sein muss, wird zuerst geprüft.
> Sie lassen jeden Beschluss mit Quelle, Datum und Bedingungen festhalten und Offenes mit Termin und Namen übergeben.

Belege (intern): Satz 1 `v24:hb-2` (Abs. 1), `v24:hb-5` (Tabelle „Alle Vorgänge“, Abs. 5), `v24:hb-1.2`, `v24:tlb-3` · Satz 2 `v24:hb-3.1`, `v24:hb-3.2`, `v24:tlb-2.1`, `v24:va-3.1` bis `v24:va-3.5`, `k3.2-t1`, `k4.1-p1` · Satz 3 `v24:hb-3.1` (Schluss), `v24:hb-5` (Abs. 5 bis 6), `k4.3-p2`, `k4.6-p2`, `k9.3-p3`. **Gegenüber dem Gerüst:** Satz 2 endet ohne „Punkte kommen danach“ (die Reihenfolge Muss vor Punkten steht schon im Satzteil „was erfüllt sein muss, wird zuerst geprüft“), damit der Block kurz bleibt (Überschrift 4 Wörter, drei Sätze 42 Wörter, zusammen 46); „mit Quelle, Datum und Bedingungen“ ist ein stehender Begriff (Gerüst Abschnitt 8, Folgeposten 5: Wortlaut-Schwelle von neun Wörtern in P19.6 prüfen).

### 3.6 Alle Bilanz-Typen (Texte unverändert, Bilder je Typ unverändert)

Die Bilanztexte bleiben wörtlich, weil sie auch nach der Erweiterung auf jedem Weg stimmen (Tabelle 3.4). Zur Erinnerung, wann sie erscheinen: Vertrauen niedrig → „Gebaut, aber nicht getragen“; sonst Zeit niedrig → „Auf den letzten Metern“; sonst keine Falle, Zeit hoch, Vertrauen hoch, Geld mindestens mittel → „Ruhig ins Ziel“; sonst „Geschafft – mit Umwegen“; ist eine Station offen, gilt immer „Noch nicht alle Entscheidungen getroffen“.

> **Gebaut, aber ohne Rückhalt**
> Die Gebäude stehen, doch das Vertrauen hat gelitten: Zu oft hat die Bürgermeisterin Dinge zu spät oder anders erfahren, als sie es von Ihnen erwarten durfte. Sie nickt Ihnen zu – knapp. Beim nächsten Mal, sagt ihr Blick, will sie früher einbezogen werden.

> **Auf den letzten Metern**
> Die Schule hat geöffnet, aber der Zeitpuffer war am Ende aufgebraucht. Wer eine Entscheidung aufschiebt oder auf Umwegen löst, bezahlt auf der Baustelle fast immer mit Zeit.

> **Ruhig ins Ziel**
> Die Kinder sind pünktlich eingezogen, und jede große Entscheidung hat die Bürgermeisterin selbst getroffen – mit allem, was sie dafür wissen musste. So bleibt ein Projekt steuerbar, auch wenn es stürmt.

> **Geschafft – mit Umwegen**
> Der Campus steht, die Kinder sind da. Aber nicht jede Ihrer Antworten war der gerade Weg, und jeder Umweg hat etwas gekostet: Zeit, Geld oder Vertrauen.

> **Noch nicht alle Entscheidungen getroffen**
> Der Campus steht, die Kinder sind da. Ein Urteil über Ihren Weg gibt es erst, wenn Sie alle Entscheidungen getroffen haben. Darunter sehen Sie die drei Balken nach den Antworten, die Sie schon gegeben haben.

Bei „offen“ entfallen die Sätze je Balken und der Block „Das können Sie jetzt“; es bleiben Balkentafel, Verlauf (mit Lücke bei den offenen Stationen), der Hinweis „n Entscheidungen haben Sie noch nicht getroffen – sie zählen hier nicht mit“ und der Knopf „Zur ersten offenen Entscheidung: Station n · Titel“.

Bilder je Typ unverändert: Sonne über dem Campus (ruhig), Wegweiser mit Umweg (Umwege), Stoppuhr (letzte Meter), Brücke mit Riss (nicht getragen); für „offen“ kein Bild.

### 3.7 Die Sätze je Balken (unverändert, nur auf „nicht offen“)

Je Balken ein Satz unter dem Bilanz-Titel; Texte wie in `rahmen.yaml` (Geld hoch, mittel, niedrig; Zeit hoch, mittel, niedrig; Vertrauen hoch, mittel, niedrig). Voraussetzungen siehe 3.4. Die Stufen: niedrig 0 bis 3, mittel 4 bis 6, hoch 7 bis 10.

### 3.8 Campus am Ende

Stufe 8 · Sommer · Morgen, Ausschnitt breit. Zusätze wie heute: Schulbus, Kinder mit Schultüten und Ranzen, Luftballons, Handglocke in der Hand von Hanna Klingel; bei reduzierter Bewegung stehen die Kinder still. **Zeit niedrig** (Endstand 0 bis 3, Bilanz nicht „offen“): Sporthalle eingerüstet, Beschreibungstext „Nur die Sporthalle ist noch nicht fertig und steht eingerüstet.“ (Bestand `halleOffen`). Im Schlussbild des ganzen Wegs stehen die drei Nebenfiguren etwas abseits und sprechen je eine Zeile (3.3): Ranzen mit Klemmbrett (hilft Klingel mit der Tür), Spitzfeder mit Notizblock (fotografiert die Glocke), Pfennig mit Taschenuhr (schaut aufs Buch). In der Kurzfassung fehlen sie.

---

## 4 · Steckbriefe

### 4.1 Wo die Steckbriefe stehen

- Die fünf Hauptfiguren und „Sie“: zugeklappter Steckbrief im Auftakt (wie heute).
- Die drei Nebenfiguren: **kein** Steckbrief auf der Startseite und im Auftakt. Sichtbar sind **Name und Rolle** beim Sprechen (Namensschild neben dem Porträt) und ein kurzer Satz beim ersten Auftritt (Spalte „Namensschild“). Der längere Text („Steckbrief“) steht nur in der Regie-Ansicht der Figuren, damit die Leinwand nicht überlädt.
- Namenssuche: Die Namen Ranzen, Spitzfeder, Pfennig und die Zeitung „Lindenbote“ sind zu wiederholen (Gerüst Offene Frage 7; Ersatznamen Ranzel, Federle, Groschen).

### 4.2 Auffrischung der fünf Hauptfiguren und von „Sie“

Nur die **Steckbriefe** ändern sich (sichtbar, zugeklappt); Rolle, Akzent, Porträt und Sprechweise bleiben. Gründe aus den Figurenbögen (Gerüst Abschnitt 7).

| Figur | neuer Steckbrief (sichtbar) | Grund |
|---|---|---|
| Sie | > Sie leiten das Projekt für die Stadt, die als Bauherr den Campus bauen lässt. Listen führen andere: Sie prüfen, was Ihnen vorgelegt wird, fordern nach, was fehlt, und entscheiden, was in Ihrem Rahmen liegt. Alles andere bringen Sie rechtzeitig zur Bürgermeisterin. | Rolle O-36: prüfen, nachfordern, entscheiden, melden lassen; nichts selbst pflegen (`v24:hb-1`, `v24:tlb-1`, `v24:tlb-2`) |
| Gisela Grundstein | > Sie entscheidet für die Stadt die großen Dinge: was zuerst kommt, jede Freigabe (das förmliche Ja am Ende eines großen Abschnitts) und jeden Einsatz der Reserve, des Geldpuffers. Der Lenkungskreis, eine feste Beratungsrunde mit Finanzabteilung und Schulamt, berät sie – entscheiden tut sie selbst. Ihre erste Frage lautet immer: Was genau soll ich entscheiden – und bis wann? | Refrain des Bogens (Station 1 bis 12, Gerüst 7) |
| Clara Faden | > Sie hält alle Fäden zusammen: Sie führt alle Aufgaben, Hinweise, Risiken und Änderungen, prüft jede Woche alles Offene und bereitet jede Entscheidung vor, bei der etwas getan werden muss – mit mindestens zwei zulässigen Wegen und einer Empfehlung. Was beschlossen wird, hält sie im Entscheidungsbuch fest. Entscheiden darf sie nicht. | Entscheidungsbuch (`v24:hb-3.1`, `v24:va-3.5`); Projektsteuerin führt es; „erforderliche Handlungsentscheidung“ statt „jede Entscheidung“ (`v24:hb-3.1`, `v24:va-3.1`: Routine und reiner Prüfauftrag sind keine Handlungsentscheidung) |
| Konrad Schwung | > Er plant den Campus von der ersten Linie bis zur letzten Fuge. Er findet für alles eine Lösung – und verspricht sie manchmal schneller, als sie geprüft ist. Schlechte Nachrichten erwähnt er gern beiläufig. | Bogen: Beiläufiges in 2, Wendepunkt in 12 |
| Hanna Klingel | > Sie weiß, was die Kinder brauchen – und sie will viel davon. Jeder Wunsch hat einen guten Grund; nicht jeder passt ins Budget. Die Messingglocke ihrer alten Schule soll im neuen Haus läuten. | Motiv „Glocke“ (3, 5, 6, 7, 12, 14) |
| Theo Lot | > Er ist jeden Tag auf der Baustelle und kennt jede Schraube. Aufschreiben findet er lästig, das Bauen nicht. Vieles, was er weiß, steckt nur in seinem Kopf. | bereitet Station 11 („frag Theo“) vor |

**Bögen (nur Regie, Nachtrag zu Gerüst Abschnitt 7).** Konrad Schwungs Wendepunkt liegt in **12**, nicht in 7 (das alte Drehbuch sagte 7); seine Zielzeile bleibt. Giselas Anerkennung vor dem Stadtrat steht in 13. Ranzens Bogen („besorgt → Mitgestalterin“) endet mit ihrer Zeile im Ende, ihr Echo in 13 trägt die Zeile nach E8 (L-276); Spitzfeders Bogen („Zitierender → Chronist“) endet mit seiner Zeile im Ende. Hanna Klingels Zielzeile bleibt „Willkommen in eurer Schule!“. Clara Fadens Zielzeile bleibt. Theo Lots Zielzeile bekommt das Echo E10 voran (3.3).

**Mandat-Kärtchen („Wer entscheidet was“).** Zeile der Projektsteuerin nennt künftig das Buch; die Vertretung der Bürgermeisterin ist eine Zeile (Gerüst Offene Frage 5, Vorschlag):

> **Projektsteuerin:** bereitet alles vor, pflegt alle Listen mit Aufgaben, Risiken und Änderungen, hält jeden Beschluss im Entscheidungsbuch fest, empfiehlt – entscheidet nie.
> **Bürgermeisterin:** alles darüber · jeder Einsatz der Reserve · ob die Stadt ein großes Risiko trägt · jede Freigabe am Ende eines großen Planungs- oder Bauabschnitts (Fachleute sagen: Leistungsphase) · was zuerst kommt: der Schulstart, dann das Geld.
> Wenn sie nicht da ist, vertritt sie die Leiterin der Finanzabteilung. ⟦-K⟧

Die Zeile mit der Vertretung ist ein eigener Absatz und entfällt in der Kurzfassung (wie in 01, Station 1). Der Kärtchen-Wortlaut oben ist verbindlich; die Zeilen für „Sie“ und „Lenkungskreis“ stehen in 01 (Station 1). Beleg (intern): `v24:hb-projektblatt` („Entscheidungszuständigkeit und Vertretung“), `v24:hb-3.1`. Die Vertretung durch die Leiterin der Finanzabteilung (die Kämmerin) ist eine freie Festlegung des Falls; die Reichweite der Vertretung wird nicht geregelt (keine Fachregel).

### 4.3 Die drei Nebenfiguren (Porträt für `src/grafik/figuren.ts`)

Kennungen (ASCII): `ranzen`, `spitzfeder`, `pfennig`. In `figuren.ts` als eigene Liste `NEBENFIGUREN` führen (nicht in `FIGUREN`, sonst erscheinen sie in den Schleifen des Auftakts); Namen und Rollen wie unten.

#### Marlene Ranzen

| Feld | Inhalt |
|---|---|
| Rolle (sichtbar) | Elternvertreterin |
| Namensschild beim ersten Auftritt (sichtbar) | > Vorsitzende des Elternbeirats der künftigen Gesamtschule |
| Steckbrief (nur Regie) | > Sie fragt für alle, die sich nicht trauen – höflich und hartnäckig. Ihre Kinder sollen nicht die letzten im Container sein. |
| Alter, Typ | 39 |
| Sprechweise | kurze Fragen, die mit „Und“ beginnen |
| Beispielsätze | „Und was heißt das für meinen Jüngsten?“ · „Ja oder nein – ich schreibe es auf die Einladung.“ |
| Sorge | dass ihre Kinder die letzten im Container sind |
| Auftritte | 6 (Hauptauftritt, Chor der Eltern); 13 (Stimme im Echo E8, eine Zeile); Ende (Schlussbild, eine Zeile, hilft Klingel mit der Tür) |
| Bogen (nur Ton) | von der besorgten Frage zur Mitgestalterin |
| Akzent der Sprechblase | `gruen` |
| Bildbeschreibung (`BILD_TEXT`) | Marlene Ranzen, Elternvertreterin: dunkle Locken im Dutt, grasgrüne Regenjacke, Schlüsselband mit bunten Anhängern und ein Klemmbrett mit Fragenliste. |
| Porträt | Brustbild im Dreiviertelprofil wie die Hauptfiguren; dunkle Locken im Dutt (Haar `dunkel`, eine Locke an der Schläfe), Hautton 2; Regenjacke grasgrün **#4C9A5F** mit hochgestelltem Kragen; Schlüsselband mit buntem Schulranzen-Anhänger (Perlenfarben der Akzentpalette); Klemmbrett im rechten Arm (Blatt mit drei Zeilen und Häkchen). Erkennungszeichen: das Klemmbrett. Stimmungen: neutral = aufmerksam, Augenbrauen leicht gehoben; besorgt = Station 6; froh = Schlussbild. |

#### Bernd Spitzfeder

| Feld | Inhalt |
|---|---|
| Rolle (sichtbar) | Lokalreporter |
| Namensschild beim ersten Auftritt (sichtbar) | > Reporter bei der Zeitung „Lindenbote“ |
| Steckbrief (nur Regie) | > Er hört zu und schreibt mit. Dass die Wahrheit nicht in eine Überschrift passt, weiß er – er schreibt sie trotzdem so genau wie möglich. |
| Alter, Typ | 52, ruhig, zuhörend |
| Sprechweise | knappe Fragen, die wie Feststellungen klingen |
| Beispielsätze | „Und wer entscheidet das?“ · „Das schreibe ich so auf.“ |
| Sorge | dass die Wahrheit nicht in eine Überschrift passt |
| Auftritte | 6 (hinten im Saal, schreibt mit); 13 (nur Schlagzeile im Echo E8); Ende (Schlussbild, eine Zeile, fotografiert die Glocke) |
| Bogen (nur Ton) | vom Zitierenden zum Chronisten |
| Akzent der Sprechblase | keiner; die Zeitung spricht in der Bildkarte „Lindenbote“ (Schlagzeile in drei Fassungen in Station 6, Papierton) |
| Bildbeschreibung (`BILD_TEXT`) | Bernd Spitzfeder, Lokalreporter: sandfarbener Trenchcoat, graublaue Schiebermütze mit Bleistift im Mützenband und ein Notizblock mit Gummiband. |
| Porträt | Brustbild im Dreiviertelprofil; kurzer grauer Vollbart, ruhiger Blick, Hautton 1; Trenchcoat sandfarben **#C8A97E** mit hochgestelltem Kragen; Schiebermütze graublau **#6B7C93**, **Bleistift im Mützenband** (nicht hinter dem Ohr: den Platz hat der Zeichenstift von Schwung); Notizblock mit Gummiband in der linken Hand. Erkennungszeichen: der Notizblock. Stimmungen: neutral = zuhörend; besorgt = Station 6, schaut auf den Block; froh = Schlussbild. |

#### Ewald Pfennig

| Feld | Inhalt |
|---|---|
| Rolle (sichtbar) | Stadtrat im Finanzausschuss |
| Namensschild beim ersten Auftritt (sichtbar) | > Stadtrat, sitzt im Finanzausschuss |
| Steckbrief (nur Regie) | > Er rechnet im Kopf und fragt gründlich nach. Er hat nichts gegen Geld, nur gegen Geld ohne Nachweis. |
| Alter, Typ | 63, gründlich, trocken |
| Sprechweise | knapp, rechnet nach; „Wo steht das?“ |
| Beispielsätze | „Wo steht das?“ · „Ich habe nichts gegen Geld, nur gegen Geld ohne Nachweis.“ |
| Sorge | dass er im Prüfbericht liest, er habe nicht gefragt |
| Auftritte | 8 (Folge, im Stadtrat: nach A fragt niemand nach einer zweiten Zahl); 13 (Hauptauftritt); Ende (Schlussbild, Zeile) |
| Bogen (nur Ton) | vom Skeptiker zu dem, der das Buch gern liest (oder prüfen lässt) |
| Akzent der Sprechblase | `beere` (der Stadtrat trägt das Vertrauen der Stadt; Farbwahl offen, Abschnitt 10, Nr. 5) |
| Bildbeschreibung (`BILD_TEXT`) | Ewald Pfennig, Stadtrat: schmal, grauer Nadelstreifenanzug, Lesebrille auf der Nase, blauer Ordner unter dem Arm und eine Taschenuhr mit Kette. |
| Porträt | Brustbild im Dreiviertelprofil; schmales Gesicht, kurzes weißes Haar mit Geheimratsecken, halbmondförmige Lesebrille tief auf der Nase, Hautton 1; Nadelstreifenanzug grau **#3B4252** mit Weste; **Taschenuhr** mit goldener Kette an der Weste; blauer Ordner mit Haftzetteln unter dem linken Arm. Erkennungszeichen: die Taschenuhr. Stimmungen: neutral = prüfend; besorgt = eine Augenbraue hochgezogen (13); froh = Mundwinkel leicht gehoben (Schlussbild). |

**Gegenstände (Szenenbilder, dekorativ, `aria-hidden`).** Ranzen: Klemmbrett mit Fragenliste, Handzeichen im Saal, Einladung; Spitzfeder: Notizblock, Zeitungskopf „Lindenbote“, Schlagzeile in drei Fassungen (Station 6); Pfennig: Ordner, Taschenuhr, Haushaltsplan mit Haftzetteln. Die Vertretung von Clara Faden bleibt Stimme ohne Porträt (Gerüst Offene Frage 8); Vergabestelle, Finanzabteilung, Schulamt, Gebäudemanagement, Brandschutzbehörde, Netzbetreiber, Hersteller und Firmen bleiben erwähnt.

**Regeln für alle drei.** Sie sprechen nur im Ton, nie in Tatsachen, die vom Weg abhängen (Echo-Regel, Gerüst Abschnitt 4); sie führen keine Fachregel ein; die Zeitung ist fiktiv und trägt den erfundenen Namen „Lindenbote“ (L-273); „Presse ist Kulisse“.

---

## 5 · Entscheidungsbuch und Verlauf

### 5.1 Das Entscheidungsbuch: Aufbau

**Zugang.** Ein kleines Symbol (Buch mit rotem Lesebändchen) steht neben dem Kärtchen „Wer entscheidet was“, sobald Station 1 abgeschlossen ist; ein Punkt am Symbol zeigt einen neuen Eintrag (für Screenreader das Wort „neu“). Es öffnet das Buch als Seite über der Station (Schließen bringt zurück). Das Buch zählt nicht zur Lesezeit der Stationen.

**Seitenaufbau.**

> **Das Entscheidungsbuch**
> Hier hält die Projektsteuerin fest, was die Stadt beschlossen hat, auf welcher Grundlage und wer entschieden hat. Sie lesen mit.
> **Beschluss:** Die zuständige Stelle hat entschieden. **Vermerk:** Es wurde etwas festgehalten, aber nichts beschlossen. **Übergabe:** Offenes geht mit Termin und Namen an einen Nachfolger.

Darunter die Einträge in der Reihenfolge der Stationen (von oben nach unten, wie in einem Buch); der jüngste Eintrag ist beim Öffnen sichtbar und trägt „neu“.

**Leerzustand** (vor dem ersten Eintrag; nur über die Fortschrittslinie erreichbar, sonst fehlt das Symbol bis Station 1 beendet ist):

> Noch steht nichts im Buch. Mit der ersten Station beginnt es sich zu füllen.

**Ein Eintrag** (Karte):

- Kopf: Nummer und Titel der Station, Anlassmonat: „4 · Die Auflage · Mai 2026“
- Stempel: Art als **Wort und Symbol** (Beschluss = Haken im Kreis, Vermerk = Punkt, Übergabe = Pfeil zur Hand); nie nur Farbe.
- vier Zeilen: **Anlass** (der Monat der Station) · **Entschieden von** · **Grundlage** · **Ergebnis**.

Die Spalte heißt „Anlass“, nicht „Wann“: Der Eintrag nennt den Anlassmonat der Station, nicht das Datum, an dem beschlossen wurde. Damit bleibt jede Zeile auf jedem Weg wahr (Neutralitätsregel des Gerüsts, Abschnitt 5; ein „Wann“ würde bei einem späten Weg falsch).

**Neutralitätsregeln** (jede Zeile muss auf jedem Weg wahr sein): keine Aussage über Zeitpunkt, Qualität oder Vollständigkeit der Vorarbeit („mitgeteilt“, „vollständig“, „am selben Tag“, „mit zwei Wegen“ stehen nicht im Buch); „Grundlage“ nennt nur das Dokument oder den Anlass; „Ergebnis“ nennt nur Tatsachen, die in der Folge jeder der drei Antworten der Station gelten (Prüfung durch den Agenten Fachtreue in P19.6). Das Buch nennt den Beschluss der **Stadt**, nie Ihre Antwort, keine Punkte, keine Wertung.

### 5.2 Die 14 Einträge (natürliche Sprache; für alle Wege gleich)

| Nr · Titel | Anlass | Art | Entschieden von | Grundlage | Ergebnis |
|---|---|---|---|---|---|
| 1 · Wer darf was entscheiden? | Januar 2026 | Beschluss | die Bürgermeisterin | die Seite „Wer entscheidet was“ der Projektsteuerin | Die Entscheidungsgrenzen sind festgelegt. Zuerst kommt der Schulstart, dann das Geld. |
| 2 · Ein erstes Warnsignal | März 2026 | Vermerk | niemand – es wurde nichts beschlossen | Hinweis des Architekten zu den Lieferzeiten der Holzelemente | Offen ist, wie lange die Holzelemente zur Lieferung brauchen. |
| 3 · Wie gefährlich ist das? | April 2026 | Beschluss | die Bürgermeisterin; der Lenkungskreis hat beraten | Vorlage der Projektsteuerin; Auskünfte der Hersteller | Die Holzelemente werden früher ausgeschrieben, rund 150.000 Euro kommen aus der Reserve. |
| 4 · Die Auflage | Mai 2026 | Beschluss | die Bürgermeisterin | Vorlage der Projektsteuerin zur Brandschutzauflage | Die Holzbauteile in den Fluren werden gekapselt, rund 400.000 Euro kommen aus der Reserve. Die Wirkung gilt erst, wenn die Brandschutzbehörde sie bestätigt hat. |
| 5 · Die Schule will mehr | Juni 2026 | Beschluss | die Bürgermeisterin; der Lenkungskreis hat beraten | Änderungswunsch der Schule | Die Mensa wird erweiterbar gebaut, rund 150.000 Euro kommen aus der Reserve. Eine große Mensa ist nicht beschlossen; ein späterer Ausbau wäre ein neuer Antrag. |
| 6 · Der Elternabend | August 2026 | Vermerk | niemand – es wurde nichts beschlossen | Elternabend in der Containerschule | Die Eltern fragten nach der Mensa und nach dem Schulstart 2028. |
| 7 · Der Zuschlag | September 2026 | Beschluss | die Bürgermeisterin (Freigabe); bestellt wird über die Vergabestelle | Zuschlagsvorschlag der Vergabestelle zum Holz der Grundschule | Der Zuschlag für das Holz der Grundschule ist freigegeben. Ein Preisnachlass-Angebot für spätere Holzarbeiten liegt vor; es zählt als Chance und steht nicht in der Prognose. |
| 8 · Zwei Zahlen, zwei Wahrheiten | Oktober 2026 | Vermerk | niemand – eine Prognose ist kein Beschluss | Kostenstand der Projektsteuerin mit Datum | Die Prognose liegt rund eine Million Euro über dem Budget. Die angekündigten Mehrkosten der Haustechnik stehen als Risiko daneben, nicht in der Prognose. |
| 9 · Der Monatstermin | Dezember 2026 | Vermerk | niemand – es wurde nichts beschlossen | Monatsbericht und Prüfvermerk Dezember 2026 | Offen sind der Planstand der Fassade und der Netzanschluss: Er kommt im März statt im Januar, bis dahin läuft Baustrom. |
| 10 · Ärger auf der Baustelle | Februar 2027 | Vermerk | niemand – der Bauleiter hat gesperrt | Meldung des Bauleiters | Die losen Anker am Gerüst der Sporthalle sind erneuert, und es ist geklärt, wer die Kosten trägt. |
| 11 · Wenn Wissen im Kopf steckt | April 2027 | Übergabe | die Projektsteuerin an ihre Vertretung | Einträge der Projektsteuerin | Die Vertretung übernimmt die offenen Einträge, darunter den Hinweis des Lüftungsherstellers. |
| 12 · Die große Entscheidung | Mai 2027 | Beschluss | die Bürgermeisterin; der Lenkungskreis hat beraten | Vorlage der Projektsteuerin zur Lüftungsanlage | Die Lüftungsanlage der Gesamtschule bekommt ein Ersatzgerät, rund 400.000 Euro kommen aus der Reserve. Auflage: Es ist vor dem Schulstart eingebaut und in Betrieb. |
| 13 · Beschluss und Nachweis | November 2027 | Vermerk | niemand – kein neuer Beschluss | Haushaltsberatung des Stadtrats; das Entscheidungsbuch | Die Beschlüsse stehen mit Quelle und Datum im Buch. Die Brandschutzbehörde hat die Wirkung der Kapselung bestätigt. Offen sind zwei Fugen im Hallenboden; die Firma hat Nachbesserung bis zu den Herbstferien 2028 zugesagt. |
| 14 · Schulstart | Juli 2028 | Beschluss und Übergabe | die Bürgermeisterin; der Lenkungskreis hat beraten | Vorlage der Projektleitung, von der Projektsteuerin vorbereitet | Die Bürgermeisterin gibt mit Auflagen frei. Die Fugen im Hallenboden und die Feineinstellung der Lüftung gehen mit Termin und Namen an das Gebäudemanagement. |

**Änderungen gegenüber dem Gerüst (Abschnitt 5)**, alle zur Wahrung der Neutralität: Zeile 3 und 4 „Vorlage mit zwei Wegen“ → „Vorlage der Projektsteuerin“ (die Falle-Folgen erzählen nicht überall zwei Wege); Zeile 5 „Änderungsantrag … mit zwei Wegen“ → „Änderungswunsch der Schule“, dazu „ein späterer Ausbau wäre ein neuer Antrag“ (löst den früheren Widerspruch „Anmeldezahlen im Herbst“ auf, L-276); Zeile 7 „Vergabemappe“ → „Zuschlagsvorschlag der Vergabestelle“, „zweites Holzlos“ → „Holz der Grundschule“ (die Kurzfassung kennt das erste Los nicht) und „gesondert als Chance geführt“ → „zählt als Chance und steht nicht in der Prognose“ (so steht es im Fall, `inhalte/fall.md`); Zeile 8 „eine Zahl“ → „Die Prognose liegt …“ (nach der Prüfung, Fall: 59,4 Millionen, +1,7 Prozent; die Falle-Antworten haben dem Stadtrat eine andere Zahl genannt); Zeile 9 „Monatsbericht, eine Seite“ → „Monatsbericht Dezember 2026“ (die Falle lässt den Bericht grün); Zeile 10 „Bereich gesperrt“ → „der Bauleiter hat gesperrt“ (die Falle sperrt nur eine Seite); **Zeile 12 „Vorlage mit drei zulässigen Wegen, Gewichte abgestimmt“ → „Vorlage der Projektsteuerin zur Lüftungsanlage“** (die Falle „nur ein Gerät mit Preis“ legt keine drei Wege vor); Auflage „eingebaut und in Betrieb“ statt „eingestellt“ (die Feineinstellung im ersten Winter ist ein Übergabeposten in 14, sonst wäre die Auflage nicht erfüllt); Zeile 13 ergänzt um die Tatsachen des Falls (Behörde, Fugen, Herbstferien). Die Tatsachen der Spalte „Ergebnis“ stehen alle in `inhalte/fall.md` (soweit P19.6 sie dort nachträgt, Gerüst Abschnitt 8). **Diese Tabelle ist der alleinige Wortlaut:** die Zeilen in 00, 01, 02 und 03 geben sie wörtlich wieder oder verweisen auf sie (L-276).

**Kurzfassung.** Das Buch zeigt die Einträge der gespielten Stationen (1, 3, 5, 12) voll; für jede übersprungene Station steht **eine Zeile** (nur Art und Ergebnis, ohne Kopf), sobald die Brückenkarte der Station gezeigt wurde. Das Buch ist dort nur über das Symbol zu öffnen, es steht nicht im Fluss der Stationen (Wörter, Abschnitt 2.4). Die Brückenzeilen und die Zeilen des Buchs sagen dasselbe in anderen Wörtern.

### 5.3 Der Verlauf

**Was er zeigt.** Drei kleine Linien (Geld, Zeit, Vertrauen) über die Stationen, bis zur aktuellen Station gezeichnet, **in allen elf Stufen, ohne Zahlen auf den Achsen**; dahinter drei Streifen für „gut gefüllt“, „etwa halb voll“, „knapp“ (Stufen hoch, mittel, niedrig, Engine `stufe`). Die Beschriftung steht direkt an der Linie (nicht in einer Legende), die Punkte liegen auf den Ständen nach jeder Station (`balkenBis`). Es gibt **keine Markierung „gut“ oder „Falle“ je Station** und keine Vergleichslinie „lauter gut“ (Gerüst Offene Frage 6). Wo der Verlauf steht: in den beiden Pausen, in der Bilanz (am Ende, auch Kurzfassung, Kurzfassung ohne Pausen), im Druck (Vektor, Schwarz-Weiß lesbar: Linienart **und** Wort) und auf der Leinwand (bei Pause und Bilanz, ohne Bedienung).

**Kopf (Kicker, zählt nicht zur Lesezeit):** „Ihr Weg bis hier“ (Pause) · „Ihr Weg im Überblick“ (Bilanz). Die Streifen und Linien sind in der Grafik selbst beschriftet („gut gefüllt“, „etwa halb voll“, „knapp“, Name der Linie am Ende der Linie; die Beschriftung ist Teil der Grafik und zählt nicht). Die erklärende Legende steht als erste Zeile im Aufklapper „Verlauf als Text“ (zugeklappt zählt nur die Titelzeile, 3 Wörter):

> Die Linien zeigen, wie sich Geld, Zeit und Vertrauen von Station zu Station verändert haben. Die Streifen dahinter heißen „gut gefüllt“, „etwa halb voll“ und „knapp“.

**Textfassung** (derselbe Aufklapper, im Druck offen; je Station eine Zeile, ohne Zahlen, in den Wörtern, die die Folge schon benutzt; „etwas“ für einen Schritt, „deutlich“ für zwei, „unverändert“ bei null):

> Station 4 · Die Auflage: Geld etwas weniger übrig, Zeit etwas weniger Luft, Vertrauen etwas gestiegen.

Dazu je Zeile der Stand: „Geld gut gefüllt · Zeit gut gefüllt · Vertrauen gut gefüllt“. Die Wörter für die Veränderung kommen aus den Balkentexten („mehr übrig“, „weniger übrig“, „mehr Luft“, „weniger Luft“, „gestiegen“, „gesunken“).

**Leerzustand und Sonderfälle.**

- Vor Station 1: Der Verlauf erscheint noch nicht.
- Station ohne Antwort („offen“ in der Bilanz): die Linie endet an der letzten beantworteten Station; die Textfassung schreibt „Station 2 · Ein erstes Warnsignal: noch offen“; keine gestrichelte Linie, die einen Weg andeutet.
- **Kurzfassung:** übersprungene Stationen zählen wie die gute Antwort; ihre Punkte sind **hohl**; die Legende „Hohle Punkte: Diese Stationen wurden nur erzählt.“ steht im Aufklapper (nicht sichtbar gezählt).

> Hohle Punkte: Diese Stationen wurden nur erzählt.

**Warum ohne Zahlen und Wertung.** O-46 und O-8: Der Verlauf ist ein Bild der Balken, kein Zeugnis. Die Linien machen kleine Rückschläge sichtbar (Zeit −1 in 4, 10, 11), die das Band „hoch“ verdeckt; das Vertrauen ist ab Station 5 voll (Gerüst Abschnitt 3), deshalb zählt der Verlauf in allen elf Stufen und nicht in drei Bändern.

### 5.4 Druckdarstellung

- **Entscheidungsbuch:** eine eigene Seite im Querformat, Titel „Entscheidungsbuch · Schulcampus Lindenhall-Süd (fiktiver Fall)“, Tabelle mit den Spalten Nr · Anlass · Art · Entschieden von · Grundlage · Ergebnis (bis zu 14 Zeilen; nur Zeilen bis zur aktuellen Station); ohne „neu“-Punkte; die Art steht als Wort, nie nur als Symbol. Eine Seite genügt: etwa 420 Wörter in 9 Punkt.
- **Verlauf:** Vektorgrafik auf der Bilanzseite, Linien mit unterschiedlicher Strichart plus Wort an der Linie; darunter die Textfassung offen.
- **Pause:** nicht im Druck (die Pausen gehören zum Weg am Bildschirm; der Druckbogen zeigt je Station Ihre Antwort und „So macht man es gut“, wie heute).
- Vertiefungen sind nicht im Druck (Gerüst 2c).

### 5.5 Leinwand (Regie)

Die Leinwand zeigt das Buch als **Seite ohne Bedienung**: dieselben Einträge bis zur gezeigten Station, ohne „neu“-Punkt, ohne die Antwort der Spielerin oder des Spielers, ohne irgendeine Wertung (die Einträge sind für alle Wege gleich). Die Regie hat einen Knopf „Entscheidungsbuch zeigen“. Pause und Verlauf erscheinen auf der Leinwand ohne die Zeile „gespeichert“ und ohne Knopf; die Leinwand zeigt nie die Wertung der Antworten und nie Notizen.

---

## 6 · Brücken der Kurzfassung und ihr Ende

### 6.1 Brückenkarten (gebündelt, fünf Karten, zehn Zeilen)

Je Lücke eine Karte; der erste Teil der Zeile ist die **Nummer der Station** (fett), dann der Monat, dann ein Satz. Die Karte trägt als Kopf das Wort „Inzwischen“ **als Kicker** (zählt nicht; statt „Was inzwischen geschah“ und statt Nummer, Titel und Zeit je Zeile); der Titel der Station steht nur als Hilfetext. Die Zeilen zählen einschließlich der Nummer (jede Ziffer ist ein Wort) **147 Wörter**, also unter 150 (nach der dritten Fassung unverändert: B7 +1, B8 +1, B10 −2). Es erzählt der gute Weg; die Balken zählen wie „gut“.

| Karte (vor Station) | Zeilen | Balken wie gut (Geld/Zeit/Vertrauen) |
|---|---|---|
| 1 (vor 3) | > **2** · März: Der Architekt erwähnt, Holz könnte knapp werden; die Projektsteuerin lässt es als Frühwarnung prüfen. | 0/+1/+1 |
| 2 (vor 5) | > **4** · Mai: Eine Bedingung zum Brandschutz kommt. Sie wird als Problem aufgenommen, die Lösung beschließt die Bürgermeisterin. | −1/−1/+1 |
| 3 (vor 12, erste Karte) | > **6** · August: Auf dem Elternabend nennen Sie, was beschlossen und was offen ist.<br>> **7** · September: Auftrag fürs Holz der Grundschule; die Bürgermeisterin gibt frei, die städtische Vergabestelle bestellt.<br>> **8** · Oktober: Dem Stadtrat wird eine Zahl mit Datum genannt; die angekündigten Haustechnik-Mehrkosten stehen als Risiko daneben. | 6: 0/0/+1 · 7: 0/+1/+1 · 8: +2/0/+2 |
| 4 (vor 12, zweite Karte) | > **9** · Dezember: Sie lesen den Monatsbericht mit Blick auf offene Entscheidungen.<br>> **10** · Februar: Ein Sturm lockert das Gerüst; der Bauleiter sperrt sofort, die Projektsteuerin meldet es.<br>> **11** · April: Clara Faden fällt aus; der Lüftungshersteller deutet Verzug an, ihre Vertretung übernimmt die Einträge. | 9: 0/+1/+1 · 10: 0/−1/+1 · 11: 0/−1/+1 |
| 5 (vor dem Ende) | > **13** · November: Die Projektsteuerin weist dem Stadtrat jeden Beschluss nach.<br>> **14** · Juli: Die Bürgermeisterin erteilt die Freigabe mit Auflagen; Offenes geht mit Termin und Namen ans Gebäudemanagement. | 13: 0/0/+1 · 14: 0/0/+1 |

**Kopf der fünf Karten (Kicker, zählt nicht):** Inzwischen

**Regie.** (a) Brücke 14 ist **neu gegenüber dem Gerüst** (dort: „Station 14 wird als Ende gezeigt“, ohne Zeile): Ohne sie kennt die Kurzfassung im Ende weder die Freigabe mit Auflagen noch die Übergabe, die Faden im Ende nur auf dem ganzen Weg sagt (`kurzfassung: false`). Mit 17 Wörtern hält sie die Grenze (jede Zeile höchstens 17 Wörter einschließlich der Nummer). (b) Brücke 8 sagt „Dem Stadtrat wird eine datierte Zahl genannt“ (Passiv), nicht „Sie nennen“: Die Zahl legt die Projektsteuerin vor, die Bürgermeisterin vertritt sie; so steht keine Rolle falsch; „angekündigte Mehrkosten der Haustechnik“ erklärt den Begriff für die Kurzfassung, die Szene dazu nicht gesehen hat. Brücke 7 sagt „Holz der Grundschule“ statt „zweites Holzlos“ aus demselben Grund. Brücke 10: Sperren ist Sache des Bauleiters, melden Sache der Projektsteuerin (`v24:hb-4`, `v24:tlb-5`). (c) Brücke 7 sagt „gibt frei“ und „bestellt wird über die Vergabestelle“ (Beleg `v24:va-4.2`, `v24:tlb-5`). Die Zeilen 2, 4, 6, 9, 11, 13 und 14 sind der verbindliche Wortlaut; die Akt-Dateien führen sie gleich (L-276). (d) Brücke 11 enthält die Vorgeschichte der Lüftung für Station 12 (Gerüst 2d). (e) Es steht in keiner Zeile eine Wertung oder ein Beleg; Wörter wie „Station“ stehen nicht in den Zeilen, die Nummer ist die der Geschichte (die Fortschrittslinie der Kurzfassung zählt „1 von 4“ bis „4 von 4“, wie heute, R74). (f) Karten 1 bis 5 stehen am Anfang des jeweils nächsten gespielten Schritts (Szene von 3, 5, 12 und Ende), wie heute.

### 6.2 Die drei sichtbaren Echos der Kurzfassung (E1, E4, E7)

Je Echo eine Zeile in drei Fassungen; die Fassung nach der **gespielten** Antwort der Quelle (alle drei Quellen sind in der Kurzfassung gespielt, also nie die Ersatzfassung „gut“). Die Wertung wird nie genannt. Nur Ton, nie eine Tatsache (Gerüst Abschnitt 4). Die Prüfzeile nennt, was in der Folge der Quelle auf diesem Weg steht. Die Fassungen von E1, E4 und E7 sind der Wortlaut aus 01; E1 (Falle) ist neutral genug für jede Folge von Station 5, auch für den Weg, auf dem Schwung dort selbst ohne Beschluss plant (L-276). „Schlechte Nachrichten“ statt „Vorrangiges“: Der Verzug in 12 ist ein Problem, kein Risiko mit Matrixfeld.

| Echo | Ort · Figur | gut | vertretbar | Falle | Prüfzeile (muss in der Folge der Quelle stehen) |
|---|---|---|---|---|---|
| E1 | in Station 5, Folge · Gisela Grundstein | > „Genau für solche Fälle haben wir im Januar die Seite geschrieben.“ | > „Gut, dass es diesmal nur einmal zu mir kommt.“ | > „Schon einmal wurde zugesagt, bevor ich entschieden hatte. Das darf nicht zur Gewohnheit werden.“ | g: Seite unterschrieben · v: viele Fragen bei der Bürgermeisterin · f: Dämmung ohne Beschluss zugesagt |
| E4 | in Station 12, Szene · Clara Faden | > „Seit dem Holz weiß ich: Schlechte Nachrichten wollen Sie früh hören – deshalb liegt die Vorlage schon bei.“ | > „Beim Holz lag die Vorlage erst später vor. Diesmal liegt sie gleich bei.“ | > „Beim Holz kam die Meldung erst spät. Diesmal melde ich die Lage sofort.“ | g: gemeldet, Vorlage in der Woche · v: Vorlage gut drei Wochen später, Ende April · f: Meldung erst nach Bestätigung der Zahl (Faden meldete selbst; „spät“ meint die Meldung des Lesers) |
| E7 | in Station 12, Szene · Hanna Klingel | > „Bei der Mensa wusste ich immer, woran ich bin. Sagen Sie mir auch jetzt, was feststeht und was nicht.“ | > „Bei der Mensa habe ich lange auf Bescheid gewartet. Bitte nicht noch einmal so lange.“ | > „Bei der Mensa hat man umgeplant, bevor jemand entschieden hat. Diesmal bitte erst entscheiden.“ | g: Antrag mit beiden Wegen · v: Schule wartete · f: Schwung plante ohne Beschluss um |

Auf dem Weg der Kurzfassung steht je Echo **eine** Zeile (zusammen 11 + 17 + 19 = 47 Wörter in der guten Fassung, 38 bis 41 in den beiden anderen; der Kürzungsplan des Gerüsts rechnete mit 43, Abschnitt 9). Wird die Messung in P19.6 zu lang, fällt zuerst E7 (Gerüst 2d). Alle übrigen Echos (E2, E3, E5, E6, E8, E9, E10) tragen `kurzfassung: false`; E10 steht im Ende des ganzen Weges (3.3).

### 6.3 Ende der Kurzfassung und Weiterführung

Das Ende der Kurzfassung ist das Ende des ganzen Weges ohne die Zeilen mit `kurzfassung: false` (Lot, Schwung, Faden, Ranzen, Spitzfeder, Pfennig), ohne Block „Das können Sie jetzt“, mit dem Knopf der Weiterführung unter einem Kicker. Aufbau:

1. Brückenkarte 5 (13 und 14, 6.1), Kicker „Ende August 2028“, Überschrift „Schulstart“, Campus (bei Zeit niedrig die Sporthalle offen).
2. Einstieg (kurz): > Ende August 2028, der erste Schultag. Am Haupteingang stehen Ihre fünf Begleiter – und Sie.
3. Zwei Zeilen: Klingel (läutet) und die Bürgermeisterin in der Fassung des Wegs (3.3).
4. Bilanz (3.6, 3.7) mit Verlauf (Kicker, hohle Punkte für übersprungene Stationen).
5. Weiterführung und die zwei leisen Wege:

> *(Kicker, zählt nicht:)* Was dazwischen geschah
> **Weiter mit der ganzen Geschichte** · Noch einmal von vorn · Zu den Themen

**Verhalten des Knopfs „Weiter mit der ganzen Geschichte“** (Regie, Vorgabe für P19.1): Er wechselt auf den ganzen Weg und springt zur **ersten übersprungenen Station** (Station 2); die vier gegebenen Antworten (1, 3, 5, 12) bleiben stehen, die übersprungenen Stationen zählen ab dann nicht mehr wie „gut“, sondern erst mit der Antwort (der Wechsel kann die Balken sichtbar verändern; die Engine hat die Umschaltung seit L-232). Sie finden bereits gegebene Antworten beim Durchgehen als „Ihre Wahl“ markiert. Alternative, falls die Engine das nicht sauber trägt: „Von vorn mit der ganzen Geschichte“ als neuer Weg (Offene Frage 4).

**Voraussetzung** (Test): Kicker und Knopf erscheinen nur in der Kurzfassung und sagen nichts über den Weg. Ein Satz zur Weiterführung entfällt: Er hätte das Ende der Kurzfassung über 150 Wörter gebracht (gezählt: Ende 137 + Knopf 5 + „Verlauf als Text“ 3 = 145).

---

## 7 · Wörter und Begriffe der Oberfläche

Alle Wörter in natürlicher Sprache; sichtbar nie „Kapitel“, „Whitepaper“, „Datei“, „App“, „HTML“, „Programm“, kein „Bedienhinweis“, kein „Klicken Sie“ (`werkzeuge/sichtbar.mjs`, O-56). Neu oder geändert in `src/ui/woerter.ts` (Einträge unter `W.geschichte`, wenn nicht anders vermerkt). Zeichenketten sind sichtbarer Text.

### 7.1 Stationen und Akte

| Schlüssel | Wert | Verwendung |
|---|---|---|
| `station` | „Station“ | Ortszeile, Pause |
| `stationVonN(nr, n)` | `Station ${nr} von ${n}` | Ortszeile |
| `vonN(nr, n)` | `${nr} von ${n}` (bleibt) | Fortschrittslinie („4 von 14“) |
| `akt[0..2]` | „Akt I“, „Akt II“, „Akt III“ | Akt-Leiste, Pause |
| `aktTitel[0..2]` | „Ordnung schaffen“, „Takt und Zahlen“, „Entscheiden und Übergeben“ | Akt-Leiste, Kopfkarte, Pause |
| `aktZeitraum[0..2]` | „Januar bis Juni 2026“, „August 2026 bis Februar 2027“, „April 2027 bis August 2028“ | Kopfkarte, Pause |
| `aktLeiste` | „Die drei Akte der Geschichte“ | Beschriftung für Screenreader |
| `restzeit(min)` | min unter 2: „gleich geschafft“, sonst `noch etwa ${min} Minuten` | Ortszeile |
| Ortszeile ganzer Weg | `Station 7 von 14 · Akt II · noch etwa 24 Minuten` | `ortText` |
| Ortszeile Kurzfassung | `Station 2 von 4 · Akt I · noch etwa 7 Minuten` | `ortText` |
| Ortszeile Pause | `Pause nach Akt I` | `ortText` |
| `auftakt`, `endeOrt`, `ende`, `endeKurz` | „Auftakt“, „Ende · Ihre Bilanz“, „Schulstart“, „Ende“ (bleiben) | Leiste, Regie |

### 7.2 Pause, „Das können Sie jetzt“, gespeichert

| Schlüssel | Wert |
|---|---|
| `pauseKicker` | „Kurze Pause“ |
| `kannJetzt` | „Das können Sie jetzt“ |
| `pauseWeiter(akt)` | `Weiter mit ${akt}` |
| `pauseOffen` | „Einige Stationen dieses Akts haben Sie noch nicht gespielt.“ |
| `gespeichert` | „Ihr Weg bis hier ist auf diesem Gerät gespeichert.“ |
| `zurOffenen(stelle, titel)` | `Zur ersten offenen Entscheidung: ${stelle} · ${titel}` (bleibt; `stelle` heißt künftig „Station 2“) |
| `weiterGanz` | „Weiter mit der ganzen Geschichte“ (Knopf, nur am Ende der Kurzfassung) |
| `weiterKicker` | „Was dazwischen geschah“ (Kicker über dem Knopf, zählt nicht) |
| `teile.pause` (Regie) | „Pause“ |
| Regie-Knopf Pause | `Pause nach Akt I` / `Pause nach Akt II` |

### 7.3 Entscheidungsbuch und Verlauf

| Schlüssel | Wert |
|---|---|
| `buch` | „Entscheidungsbuch“ |
| `buchTitel` | „Das Entscheidungsbuch“ |
| `buchIntro` | „Hier hält die Projektsteuerin fest, was die Stadt beschlossen hat, auf welcher Grundlage und wer entschieden hat. Sie lesen mit.“ |
| `buchLeer` | „Noch steht nichts im Buch. Mit der ersten Station beginnt es sich zu füllen.“ |
| `buchLegende` | „Beschluss: Die zuständige Stelle hat entschieden. Vermerk: Es wurde etwas festgehalten, aber nichts beschlossen. Übergabe: Offenes geht mit Termin und Namen an einen Nachfolger.“ |
| `buchSpalten` | „Anlass“, „Entschieden von“, „Grundlage“, „Ergebnis“ |
| `buchArt` | „Beschluss“, „Vermerk“, „Übergabe“, „Beschluss und Übergabe“ |
| `buchNeu` | „neu“ (auch für Screenreader) |
| `buchZeigen` (Regie) | „Entscheidungsbuch zeigen“ |
| `buchDruckTitel` | „Entscheidungsbuch · Schulcampus Lindenhall-Süd (fiktiver Fall)“ |
| `verlaufPause` | „Ihr Weg bis hier“ |
| `verlaufBilanz` | „Ihr Weg im Überblick“ |
| `verlaufLegende` | „Die Linien zeigen, wie sich Geld, Zeit und Vertrauen von Station zu Station verändert haben. Die Streifen dahinter heißen „gut gefüllt“, „etwa halb voll“ und „knapp“.“ (erste Zeile im Aufklapper „Verlauf als Text“) |
| `verlaufText` | „Verlauf als Text“ |
| `verlaufHohl` | „Hohle Punkte: Diese Stationen wurden nur erzählt.“ |
| `verlaufOffen` | „noch offen“ |

Die Stufenwörter „gut gefüllt“, „etwa halb voll“, „knapp“ und die Wörter der Veränderung („etwas“, „deutlich“, „unverändert“) gibt es schon (`fuellstand`, `etwas`, `deutlich`, `unveraendert`).

### 7.4 Vertiefung

Aufklapper am Ende jeder Station, zugeklappt, nur auf dem ganzen Weg, nicht im Druck. Die Titelzeile hat zwei Teile: die Form als Kicker, die Frage als Titel.

| Schlüssel | Wert |
|---|---|
| `vertiefung` | „Vertiefung“ |
| Form „Zum Nachdenken“ | Kicker „Zum Nachdenken“; Aufklapper „Antwort“ innerhalb des Texts (Frage, dann der Aufklapper mit der Überschrift „Antwort“; nie „zum Aufklappen“, das wäre ein Bedienhinweis, O-56) |
| Form „Ein zweiter Fall“ | Kicker „Ein zweiter Fall“ (ein Beispiel in anderer Lage, nie ein Lindenhall-Ereignis mit anderen Zahlen); Aufklapper „Antwort“ wie oben |
| Form „Warum so?“ | Kicker „Warum so?“ (kein Aufklapper, Erklärung in Absätzen, jeder Absatz höchstens 60 Wörter) |

Formen je Station (Titel nach Gerüst 2c; **verbindlich ist diese Liste, sie entspricht den Akt-Dateien 01 bis 03**, L-276): 1 Warum so? · 2 Zum Nachdenken · 3 Warum so? · 4 Zum Nachdenken · 5 Ein zweiter Fall · 6 Zum Nachdenken (nur Erzählung) · 7 Zum Nachdenken · 8 Zum Nachdenken · 9 Zum Nachdenken · 10 Zum Nachdenken · 11 Zum Nachdenken · 12 Ein zweiter Fall · 13 Zum Nachdenken · 14 Warum so?. Die Titel von 5 und 12 stehen als Frage oder Name, ohne das Wort „Fallbeispiel“ (der Kicker sagt „Ein zweiter Fall“).

### 7.5 Wegwahl und Start

| Schlüssel | heute | neu |
|---|---|---|
| `ZAHLWORT` (Datei `woerter.ts`) | endet bei 12 („Zwölf“) | ergänzt um 13 „Dreizehn“, 14 „Vierzehn“ |
| `wegLangText` | „Alle Stationen, alle Aufgaben.“ | gleich |
| `wegKurzText` | „Die wichtigsten Stationen, der Rest kurz überbrückt.“ | „Die wichtigsten Stationen, der Rest kurz erzählt.“ |
| `wegEntscheidungen(n)` | „Acht Entscheidungen“ | „Vierzehn Entscheidungen“ (aus `ZAHLWORT`) |
| `wegBildLang(n)` | „Der Weg mit allen acht Stationen, keine ausgelassen“ | „… allen vierzehn Stationen …“ |
| `wegBildKurz(n, k)` | „… nur vier von acht Stationen …“ | „… nur vier von vierzehn Stationen werden gespielt, die übrigen sind kurz überbrückt“ |
| `start.storyText` | „… Unterwegs entscheiden Sie achtmal – und sehen gleich, was jede Wahl für Geld, Zeit und Vertrauen bedeutet.“ | „… Unterwegs entscheiden Sie immer wieder – und sehen gleich, was jede Wahl für Geld, Zeit und Vertrauen bedeutet.“ |
| `start.storyMeta(n)` | „Acht Entscheidungen · etwa 25 Minuten, kurz etwa 10“ | „Vierzehn Entscheidungen · etwa 40 Minuten, kurz etwa 10“ |
| Auftakt-Knopf kurz (`rahmen.yaml` `kurz`) | „Kurzfassung (etwa 10 Minuten)“ | gleich |

### 7.6 Titel der Mini-Aufgaben (Fragen ohne Bedienanweisung, O-56)

Neu in den Stationen 4, 7, 8, 9, 11, 12, 13; bestehend 2, 5, 10, 14. Die Arbeitstitel „Matrix-Probe“, „Mappe nachfordern“, „Pinnwand“, „Bericht lesen“, „Rückfragen“ bleiben intern.

| Station | sichtbarer Titel |
|---|---|
| 2 | Was ist was? |
| 4 | Stimmt die Einstufung? |
| 5 | Wer entscheidet das? |
| 7 | Fehlt etwas in der Mappe? |
| 8 | Stimmen die Verknüpfungen? |
| 9 | Was fehlt im Bericht? |
| 10 | Was kommt wann? |
| 11 | Wer weiß was? |
| 12 | Muss oder nicht? |
| 13 | Beschluss oder nicht? |
| 14 | Zu Recht geschlossen oder übergeben? |

`miniKicker` bleibt „Mini-Aufgabe“. Die Zählwörter („Richtig“, „Nicht ganz – richtig ist: …“, „n von m richtig.“) bleiben **nur** bei den Arten `zuordnen` und `reihenfolge` (Stationen 2, 5, 10, 12, 13, 14). Die fünf neuen Arten (Station 4, 7, 8, 9, 11) zeigen sie nicht; ihre Rückmeldung steht in 7.8 (L-276, löst L-10 der Fachtreue-Prüfung).

### 7.7 Begriffe für `docs/BEGRIFFE.md` (Folgeposten, Gerüst 8)

**Aufgenommen in `docs/BEGRIFFE.md` (Sprachfassung P19.2, L-303), Wortlaut des Vorschlags:**

- **Entscheidungsbuch:** Story-Wort für die getrennte Dokumentation der Beschlüsse (V2.4: „Beschluss getrennt dokumentieren“ mit Quelle, Datum und Bedingungen, `v24:hb-3.1`, `v24:va-3.5`; V1.2 sagt „Entscheidungsregister“, V2.4 gilt). Die Projektsteuerin führt es, die Leserin oder der Leser liest nur. Ein Eintrag je Station mit Art (Beschluss · Vermerk · Übergabe), Anlass (Monat der Station), Entschieden von, Grundlage und Ergebnis. Es zeigt nur, was die zuständige Stelle entschieden hat, nie die Antwort der Leserin, keine Wertung. Kein neuer Fachbegriff: Die Themen und das Explore sagen „Beschluss getrennt dokumentieren“.
- **Station** (mit **Akt**): Story-Wort statt „Kapitel“ (auf der Seite nie „Kapitel“, O-38). 14 Stationen in drei Akten, sichtbar „Station 7 von 14 · Akt II“; intern `s1` bis `s14` (alt `k1` bis `k8`). **Pause**, **Verlauf** und **Vertiefung** sind Wörter der Bedienfläche, keine Fachbegriffe.
- Weitere Story-Schreibweisen (statt Standardwort): Angebotsfrist („das Angebot gilt bis“) statt Bindung, zuständige Stelle statt befugte Stelle, „erlaubt“ statt legitimiert, „ohne Mittelwert“ statt nicht gemittelt, „was erfüllt sein muss“ statt zwingend. **Vergabemappe** heißt sichtbar „Mappe“, **Muss-Filter** nur intern (sichtbar „Muss oder nicht?“); **Frühwarnung** bleibt Vorgangsart. Die Tabelle steht in `docs/BEGRIFFE.md`, Abschnitt „Story-Schreibweisen“.

### 7.8 Die fünf neuen Mini-Arten: Namen, Rückmeldung, Auswertung, Kurzfassungsmarken (L-276)

**Namen** (Kennungen der Mini-Registry, ASCII): Station 4 `matrix` (früher Vorschlag „einstufung“; der Arbeitstitel „Matrix-Probe“ passt zum Namen), Station 7 `mappe`, Station 8 `pinnwand`, Station 9 `bericht`, Station 11 `rueckfragen`. Muss-Filter (12) und „Beschluss oder nicht?“ (13) sind Spielarten von `zuordnen`.

| Art | Station · Rhythmus | Bedienform (nicht sichtbar) | Rückmeldung nach der Wahl | Schlusssatz (verschieden je Art, aus den Lösungen, nie aus der Wahl) |
|---|---|---|---|---|
| `matrix` | 4 · nach der Folge | je Zettel zwei Wahlen („stimmt“, „nachfordern“), Stempel auf dem Zettel | sofort je Zettel | keiner (der Aufgabentext sagt schon, dass das Problem nicht in der Matrix steht) |
| `mappe` | 7 · nach der Folge | je Abschnitt zwei Wahlen („so annehmen“, „nachfordern“), Haftzettel an der Mappe | sofort je Abschnitt | „Drei Abschnitte wurden nachgefordert.“ |
| `pinnwand` | 8 · nach der Folge | je Paar drei Wahlen; der Faden färbt sich nach der Wahl | sofort je Paar, der Faden zeigt die Lösung | „Zwei Verbindungen hätten doppelt gezählt.“ |
| `bericht` | 9 · **vor der Frage**, nach der Szene | Mehrfachauswahl: nur „nachfordern“ wird gesetzt, ungesetzt gilt „in Ordnung“; eine Prüfung für alle sechs Zeilen | gemeinsam, je Zeile ein Satz | „Drei Zeilen wurden nachgefordert.“ |
| `rueckfragen` | 11 · **vor der Frage** | zwei von vier Gesprächen (Kontingent) | das Gespräch erscheint nach der Wahl; kein „Stimmt“ | „Die übrigen fragt die Vertretung nach.“ |

**Rückmeldung (Wertung, Entscheid).** Je Karte, Zettel, Abschnitt oder Zeile erscheint nach der Wahl ein kurzes Wort mit Erklärung: bei richtiger Wahl „**Stimmt.**“, sonst „**Nicht ganz.**“, danach die Erklärung der Karte (sie nennt bei „Nicht ganz“ die Lösung in ihrem Satz, zum Beispiel „Hier hätte die Projektsteuerin nachgefordert.“). **Keine Punkte, kein „n von m“, kein „Richtig“, keine Ampel der Leserin oder des Lesers** (O-8, O-46); der Schlusssatz oben (außer bei `matrix`, die keinen hat) ist kurz (4 bis 6 Wörter, damit die obere Schranke unter 9.000 Wörtern bleibt) und nennt eine Tatsache der Lösung, nicht der Wahl. Die Rückmeldungen unterscheiden sich damit nach Bedienform und Schlusssatz je Art (nicht dreimal dasselbe in den Stationen 7, 8, 9: Haftzettel an der Mappe, Faden an der Pinnwand, gemeinsame Prüfung am Berichtsblatt). `rueckfragen` kennt kein „Stimmt“ und kein „Nicht ganz“, weil es kein Richtig oder Falsch gibt.

**Pinnwand: Zettel und Endpunkte** (Station 8; die Karte in 02 ist der sichtbare Satz und zugleich die Textfassung „verbunden mit …“ bei schmalem Fenster):

| Zettel | Name (sichtbar auf dem Zettel) |
|---|---|
| Z1 | Risiko: angekündigte Mehrkosten |
| Z2 | Prüfung der Vergabestelle |
| Z3 | Prognose |
| Z4 | Frühwarnung: Holz |
| Z5 | Risiko: Lieferzeit |
| Z6 | früheres Holz (Beschluss) |
| Z7 | Änderung: Mensa erweiterbar |
| Z8 | mögliche Risiken der Änderung |
| Z9 | Problem: Kapselung |
| Z10 | Risiko: Kapselung |

| Karte | `von` | `nach` | Lösung |
|---|---|---|---|
| 1 | Z1 | Z2 | stimmt |
| 2 | Z1 | Z3 | würde doppelt gezählt |
| 3 | Z4 | Z5 und Z6 | stimmt |
| 4 | Z7 | – (loses Ende, Z8 hängt daneben) | nachfordern |
| 5 | Z9 | Z10 | würde doppelt gezählt |

**`rueckfragen`: Zustand, Auflösen, Auswertung.** Zustand je Station: `mini[kapitel]: number[]` mit den Kennungen der gewählten Gespräche (0 bis 3, höchstens zwei, bekannte Kennungen, Reihenfolge der Wahl). Beim Wiederöffnen erscheinen genau diese Gespräche; die übrigen zwei bleiben gesperrt. Die Regie-Taste „Auflösen“ zeigt alle vier Gespräche mit ihren Zeilen und dem Satz, was die Vertretung daraus festhalten würde (nicht nur die zwei nicht gewählten). Auswertung: keine, nur der Schlusssatz oben. `lesezeitOhne`: Die Zeilen der Gespräche und ihre Erklärungen zählen in der Lesezeit nicht; die Lesezeit zählt Titel, Aufgabe und die vier Etiketten mit Namen; die obere Schranke (`messeSchranke`) setzt die beiden längsten Gespräche an.

**Kurzfassungsmarken** (Entscheid): Das Feld `kurzfassung: false` gilt je Absatz oder Zeile. Es steht an der **Vertiefung** (ganz: nie in der Kurzfassung) und an Teilen von **Folge**, **„So macht man es gut“** und **„Das steckt dahinter“**, die nur in der langen Fassung stehen (zum Beispiel der zweite Satz von „Dahinter“, die Zeilen über das Entscheidungsbuch in der Folge). **Frage, Szene und Antworten** gelten in beiden Fassungen; einzelne Szenenzeilen tragen die Marke wie schon heute. Ersatzzeilen für die Kurzfassung stehen als Feld `…-kurz` (in den Akt-Dateien `⟦+K⟧`). **Echo mit fester Fortsetzung** (zum Beispiel Klingel in Station 12): `echo: E7` und `fortsetzung` (lang) beziehungsweise `fortsetzung-kurz`; die Engine setzt die Fassung des Echos und hängt die Fortsetzung an.

---

## 8 · Änderungsliste gegenüber `inhalte/geschichte/rahmen.yaml` (Zeile für Zeile)

Zeilen der heutigen Datei (Kopfkommentar, Zeile 1 bis 3): Der Kopfkommentar nennt „Drehbuch docs/DREHBUCH.md Abschnitte 1–3, 6“ und „Belege des Mandats“; neu: Verweis auf `docs/drehbuch-v2/04-rahmen.md`, Belege des Mandats um `v24:hb-3.1` ergänzen (Entscheidungsbuch). Alle Inhalte unten sind Vorschläge zur Umsetzung in P19.6; Zeilen ohne Änderung stehen mit „unverändert“.

| Zeile (Schlüssel) | heute | neu | Grund |
|---|---|---|---|
| `titel` | Ein Schulcampus für Lindenhall | unverändert | – |
| `auftakt.campus` | `{ stufe: 0, jahreszeit: winter, licht: morgen }` | unverändert | – |
| `auftakt.text` Absatz 1 | „Ein fiktiver Fall: Die Stadt Lindenhall baut im Süden der Stadt eine Gesamtschule, eine Grundschule und eine Sporthalle. Sie leiten das Projekt für die Stadt. Im Sommer 2028 sollen die Kinder einziehen.“ | „Ein fiktiver Fall: Die Stadt Lindenhall baut eine Gesamtschule, eine Grundschule und eine Sporthalle. Sie leiten das Projekt für die Stadt. Im Sommer 2028 sollen die Kinder einziehen.“ | Kürzungsplan Auftakt (−4 Wörter) |
| `auftakt.text` Absatz 2 | „Es ist kein echtes Projekt, aber es könnte eines sein: Die Fragen, die hier auftauchen, stellen sich auf vielen Baustellen.“ | „Das Projekt ist erfunden, die Fragen kennt jede Baustelle.“ | Kürzungsplan Auftakt (−12) |
| `auftakt.text` Absatz 3 | „Ihre Antworten bewegen drei Balken: Geld, Zeit und Vertrauen. Am Ende sehen Sie, wie Ihr Projekt ausgegangen ist.“ | „Unterwegs entscheiden Sie; am Ende steht Ihre Bilanz.“ | „mehrmals“ statt Zahl; Balken erklärt der Abschnitt darunter |
| `auftakt.vorstellung` | „Diese fünf Menschen begleiten Sie:“ | unverändert | – |
| `auftakt.los` | Los geht's | unverändert | – |
| `auftakt.kurz` | Kurzfassung (etwa 10 Minuten) | unverändert | – |
| `sie.steckbrief` | „Sie leiten das Projekt für die Stadt als Bauherrn. Sie pflegen keine Listen – Sie entscheiden, was in Ihrem Rahmen liegt, und bringen alles andere rechtzeitig zur Bürgermeisterin.“ | Text aus 4.2 („Listen führen andere: Sie prüfen …“) | Rolle O-36: prüfen, nachfordern, entscheiden, melden lassen |
| `figuren[grundstein].steckbrief` | „Sie entscheidet für die Stadt die großen Dinge: … – entscheiden tut sie.“ | + „Ihre erste Frage lautet immer: Was genau soll ich entscheiden – und bis wann?“ | Refrain des Bogens |
| `figuren[faden].steckbrief` | „Sie hält alle Fäden zusammen: … Entscheiden darf sie nicht.“ | + „Was beschlossen wird, hält sie im Entscheidungsbuch fest.“ vor dem letzten Satz | Entscheidungsbuch |
| `figuren[schwung].steckbrief` | „Er plant den Campus … schneller, als ihm lieb sein sollte.“ | + „Schlechte Nachrichten erwähnt er gern beiläufig.“ | Bogen Station 2 und 12 |
| `figuren[klingel].steckbrief` | „Sie weiß, was die Kinder brauchen – … nicht jeder passt ins Budget.“ | + „Die Messingglocke ihrer alten Schule soll im neuen Haus läuten.“ | Motiv Glocke |
| `figuren[lot].steckbrief` | „Er ist jeden Tag auf der Baustelle … bauen nicht.“ | + „Vieles, was er weiß, steckt nur in seinem Kopf.“ | bereitet Station 11 vor |
| `figuren[*].id/name/rolle/akzent` | grundstein/faden/schwung/klingel/lot | unverändert | – |
| `nebenfiguren` | (fehlt) | neu: drei Einträge `ranzen`, `spitzfeder`, `pfennig` mit `name`, `rolle`, `akzent`, `kurz` (Namensschild), `steckbrief` (nur Regie); Werte aus 4.3 | O-62: drei Nebenfiguren mit Porträt |
| `balken.geld.text` | „Wie viel vom Budget und von der Reserve noch für Unvorhergesehenes übrig ist.“ | „Wie viel Budget und Reserve noch übrig sind.“ | Kürzungsplan Auftakt |
| `balken.zeit.text` | „Wie viel Zeitpuffer bis zum Schulstart im Sommer 2028 bleibt.“ | „Wie viel Zeitpuffer bis zum Schulstart bleibt.“ | Kürzungsplan Auftakt |
| `balken.vertrauen.text` | „Wie sehr sich Bürgermeisterin, Schule und Stadtrat auf Sie verlassen. Sie sind neu – das muss erst wachsen.“ | „Wie sehr sich Bürgermeisterin, Schule und Stadtrat auf Sie verlassen. Sie sind neu, deshalb beginnt es niedrig.“ | Kürzungsplan Auftakt; Grund des Starts (R76) bleibt |
| `balken.*.start/mehr/weniger` | 9 · 6 · 4; „mehr übrig“ / „weniger übrig“ usw. | unverändert | Start nach L-225 |
| `balken.*.bilanz.*` | Sätze je Balken | unverändert | gelten auf jedem Weg (3.4) |
| `bilanz.*` (alle fünf Typen) | Titel und Texte | unverändert | gelten auf jedem Weg (3.4, 3.6) |
| `mandat.titel`, Zeilen „Sie“, „Lenkungskreis“ | wie heute | unverändert | – |
| `mandat.zeilen[Bürgermeisterin]` | „… was zuerst kommt: der Schulstart, dann das Geld.“ | + eigener Absatz „Wenn sie nicht da ist, vertritt sie die Leiterin der Finanzabteilung.“ (`kurzfassung: false`) | Gerüst Offene Frage 5; keine Fachregel; Kurzfassung ohne den Absatz |
| `mandat.zeilen[Projektsteuerin]` | „bereitet alles vor, pflegt alle Vorgänge, empfiehlt – entscheidet nie.“ | „bereitet alles vor, pflegt alle Listen mit Aufgaben, Risiken und Änderungen, hält jeden Beschluss im Entscheidungsbuch fest, empfiehlt – entscheidet nie.“ | `v24:hb-3.1` |
| `ende.zeit` | Ende August 2028 | unverändert | – |
| `ende.campus` | `{ stufe: 8, jahreszeit: sommer, licht: morgen }` | unverändert | – |
| `ende.einstieg` Absatz 1 | wie heute | unverändert | – |
| `ende.einstieg` Absatz 2 | „Am gemeinsamen Haupteingang des Campus hängen Luftballons, und neben der Tür stehen die fünf, die diesen Campus zweieinhalb Jahre lang begleitet haben – und Sie.“ | „Am gemeinsamen Haupteingang des Campus hängen Luftballons. Neben der Tür stehen die fünf, die diesen Campus knapp drei Jahre lang begleitet haben – und Sie. Etwas abseits warten Marlene Ranzen, Bernd Spitzfeder und Ewald Pfennig.“ | 32 Monate; drei Nebenfiguren im Schlussbild |
| `ende.einstieg-kurz` | „Ende August 2028, der erste Schultag. Am Haupteingang stehen die fünf – und Sie.“ | „Ende August 2028, der erste Schultag. Am Haupteingang stehen Ihre fünf Begleiter – und Sie.“ | „die fünf“ ohne Bezug in der Kurzfassung; dort gibt es keine Nebenfiguren |
| `ende.szene[klingel]` | „Guten Morgen! Willkommen in eurer Schule!“ (zusatz: läutet ihre Glocke) | Text unverändert; zusatz „läutet die Glocke ihrer alten Schule“ | die Kurzfassung kennt die Glocke vorher nicht |
| `ende.szene[lot]` | „Steht alles drin, was wir hier gemacht haben. Hätte ich vor zwei Jahren nicht gedacht, dass ich das mal gut finde.“ (`kurzfassung: false`) | Echo E10 (drei Fassungen, 3.3) + „Und inzwischen steht alles im Buch – hätte ich nie gedacht, dass ich das mal gut finde.“ | Gerüst: sein Satz wächst durch 10; „vor zwei Jahren“ stimmt nicht |
| `ende.szene[schwung]` | „Seit dem Holz sag ich's gleich, wenn was klemmt. Hat sich gelohnt.“ (`kurzfassung: false`) | unverändert | – |
| `ende.szene[faden]` | „Alles Offene ist übergeben, mit Namen und Termin. Verschwunden ist nichts.“ (`kurzfassung: false`) | unverändert | – |
| `ende.szene[ranzen]` | (fehlt) | neu, `kurzfassung: false`: „Und mein Jüngster? Der sitzt heute im neuen Raum, nicht mehr im Container.“ (nach Faden) | Bogen der Elternvertreterin |
| `ende.szene[spitzfeder]` | (fehlt) | neu, `kurzfassung: false`: „Die Glocke läutet. Das schreibe ich genau so auf.“ (nach Ranzen) | Bogen des Reporters |
| `ende.szene[pfennig]` | (fehlt) | neu, `kurzfassung: false`: „Wo steht das? – Hier stand alles im Buch.“ (nach Spitzfeder, vor der Bürgermeisterin) | Bogen des Stadtrats |
| `ende.szene[grundstein]` | „Wissen Sie, was das Beste war? Ich wusste jedes Mal, worüber ich entscheide.“ | unverändert | Voraussetzung `!falle` bleibt |
| `ende.zeit-niedrig` | „Nur die Sporthalle bleibt noch zu – … in der alten Halle.“ | „Nur die Sporthalle bleibt noch geschlossen – … in der alten Halle.“ (wie `rahmen.yaml`) | Konsistenz mit 13 und 14 siehe 3.2 |
| `ende.vertrauen-niedrig[lot]`, `[grundstein]` | Lot: „Steht inzwischen alles drin. Hätten wir mal früher damit angefangen.“ | Lot: „Inzwischen ist alles schriftlich festgehalten. Hätten wir damit mal früher angefangen.“ (wie `rahmen.yaml`, L-311); Grundstein unverändert | „drin“ ohne Bezug (Sprachprüfung P19.2); der Test mit dem alten Wortlaut wird in P19.6 angepasst |
| `ende.vertrauen-niedrig[pfennig]` | (fehlt) | neu: „Das Buch lese ich gern. Wo etwas fehlt, frage ich weiter nach.“ | Bogen des Stadtrats, Ton nach Falle |
| `ende.nach-falle[grundstein]` | „Geschafft haben wir es. Aber nicht jedes Mal lief es so, …“ | unverändert | – |
| `ende.nach-falle[pfennig]` | (fehlt) | neu: „Das Buch lese ich gern. Wo etwas fehlt, frage ich weiter nach.“ | wie oben |
| `ende.offen[grundstein]` | „Geschafft haben wir es – und was unterwegs offen geblieben ist, …“ | unverändert | – |
| `ende.kann-jetzt` | (fehlt) | neu: Kopf und drei Sätze (3.5), Voraussetzung: Stationen 11 bis 14 beantwortet, nicht Kurzfassung | Block vor der Bilanz |
| `ende.weiter-kurz` | (fehlt) | neu: Kicker „Was dazwischen geschah“ und Knopf „Weiter mit der ganzen Geschichte“ (6.3), nur Kurzfassung | Weiterführung |
| `akte` | (fehlt) | neu: drei Einträge mit `titel`, `zeitraum`, `satz` (Kopfkarte, 2.2) und `pause` (Satz der Bürgermeisterin, drei Sätze „Das können Sie jetzt“, Pausen-Campus) | Akt-Leiste, Pausen |
| `bruecken` | (fehlt; heute stehen Brückensätze in `k2`, `k5`, `k6`, `k8`) | neu: fünf Karten mit zehn Zeilen (6.1), Balken wie gut; die `bruecke`-Zeilen der alten Kapitel entfallen oder wandern dort hinein | O-62: gebündelte Brücken der Kurzfassung |
| `buch` | (fehlt) | neu: 14 Einträge (5.2) mit Art, Entschieden von, Grundlage, Ergebnis; Intro, Legende, Leerzustand | Entscheidungsbuch |
| `verlauf` | (fehlt) | neu: Kicker, Legende, Texte der Textfassung kommen aus den Balken | Verlauf |

**Folge für Tests und Werkzeuge (P19.6):**

1. `tests/geschichte-wege.test.ts`: die Voraussetzungen aus 3.4 eintragen (Merkmal `falleStat3bis13` statt `falleK4K7`, Merkmal `spaet` entfällt, Vertrauen niedrig setzt `falle` voraus); die neuen Zeilen mit ihrem Anfang festhalten (Pfennig, Lot nach Echo, Block „Das können Sie jetzt“).
2. `tests/lesezeit.test.ts`: „etwa 40“ und „etwa 10“ aus der Messung; Obergrenze für den langen Weg (guter Weg, ungelöst) 8.099 Wörter, für die Kurzfassung 2.099. **Obere Schranke** (P19.3, größte Folge je Station, Mini gelöst mit Erklärungen): `WEG_MAX_WOERTER` von 8.300 auf **9.000** und die Grenze je Akt von 15 Minuten (3.000 Wörter) auf **3.300 Wörter** anheben (Vorgabe für P19.6, L-276); die Schranke der Entwürfe liegt bei rund 8.980 Wörtern, Akt I bei rund 3.160; „angekündigt + 6 Minuten“ (46) hält.
3. `werkzeuge/lesezeit.mjs`: je Schritt die Wörter ausgeben, damit die Restzeit der Ortszeile aus der Messung entsteht (nicht von Hand).
4. `werkzeuge/sichtbar.mjs` und `npm run begriffe` über die neuen Inhalte; „Pause“ und „Akt“ sind erlaubt.

---

## 9 · Wörter je Teil (gezählt an den Zitatzeilen dieser Datei, Zählregel von `lesezeit.mjs`)

| Teil | Wörter | Ziel laut Gerüst | Bemerkung |
|---|---|---|---|
| 1 Auftakt (Titel 4, Einleitung 45, Wegwahl 34, Figuren 32, Balken 37) | 152 | 150 (Kurz) bzw. 200 (lang) | gilt auf beiden Wegen gleich; −35 gegenüber heute (187); 2 Wörter über dem Kurz-Ziel |
| 2 Akt-Kopfkarten (3 Sätze) | 16 | in den Stationen 1, 6, 11 enthalten | zählen zu den Wortzielen dieser Stationen |
| 2 Pause I | 91 | 90 | 88 Zitatzeilen plus Titelzeile „Verlauf als Text“ (3) |
| 2 Pause II | 97 | 90 | 94 Zitatzeilen plus 3; +7 gegenüber dem Gerüst |
| 3 Ende ganzer Weg (Einstieg, Szene mit Ranzen, Spitzfeder und Pfennig, Block, Bilanz, Wege, Abbinder, Verlauf-Titelzeile) | 345 | 280 | heute 236; dazu Block „Das können Sie jetzt“ 47, Pfennig 10, Ranzen 15, Spitzfeder 11, Einstieg +10, Lot mit Echo E10 +8, Klingel-Zusatz +3, Verlauf-Titelzeile 3, Bilanz-Sätze der Sprachfassung +2 (Geld hoch +3, Zeit hoch −1); +65 gegenüber dem Gerüst (L-276) |
| 3 Ende Kurzfassung (ohne Brücken, mit Knopf der Weiterführung) | 151 | 150 | heute 137 ohne Brücken; Knopf 5, Verlauf 3, Klingel-Zusatz +3, „Ihre fünf Begleiter“ +1, Bilanz-Sätze der Sprachfassung +2 |
| 3 Block „Das können Sie jetzt“ (Akt III) | 47 | in 345 enthalten | Überschrift 4, Sätze 9 + 17 + 17 |
| 6 Brückenkarten (zehn Zeilen, Köpfe als Kicker) | 147 | ≤ 150 | jede Zeile höchstens 17 Wörter einschließlich der Nummer; B7 +1, B8 +1, B10 −2 gegenüber der zweiten Fassung |
| 6 Echos E1, E4, E7 (Kurzfassung, gute Fassung) | 47 | 43 | eine Zeile je Echo; E4 gut 17 Wörter (statt 16), 38 bis 41 in den anderen Fassungen |

**Absätze über 60 Wörter:** keine (längster Zitatabsatz 52 Wörter, Einstieg Ende; die zwei Vertiefungsabsätze von Station 11 und 12 sind geteilt).

**Summe ganzer Weg (dritte Fassung, L-276).** Die gerechneten Entwürfe der Akt-Dateien ergeben für die Stationen 7.005 Wörter (Akt I 2.589 · Akt II 2.346 · Akt III 2.070; die Stations-Obergrenzen des Gerüsts summieren sich auf 7.430, die Entwürfe liegen darunter). Dazu Auftakt 152, Pausen 188, Ende 345 = **7.690 Wörter**; mit den Titelzeilen der 14 zugeklappten Vertiefungen (rund 60), den Akt-Kopfkarten (16) und den Wahlknöpfen der Karten-Minis (rund 58) **rund 7.820 Wörter ≈ 39 Minuten**. „Etwa 40“ hält: Die Grenze liegt bei 8.100 Wörtern, die Reserve beträgt rund 280. (Die zweite Fassung addierte die Stations-Obergrenzen und kam auf 8.083; mit den neuen Zeilen im Ende wären es 8.112 gewesen, über der Grenze, obwohl die Entwürfe weit darunter liegen. Maßgeblich ist die Entwurfsrechnung, danach die Messung in P19.6.)

**Obere Schranke** (P19.3, `messeSchranke`: größte Folge je Station, Mini gelöst mit Erklärungen und Rückmeldungen, längste Echo-Fassung): Die Konsistenz-Prüfung rechnete rund 8.900 Wörter (Akt I rund 3.130, Akt II rund 2.900, Akt III rund 2.830) gegen die bisherigen Testgrenzen 8.300 und 3.000 je Akt; die Entwürfe der dritten Fassung lagen bei rund 8.950 Wörtern; nach der Sprachfassung (L-300 bis L-303) liegen sie bei **rund 8.980 Wörtern** (Schätzung, Genauigkeit etwa ±100; Akt I rund 3.160, Akt II rund 2.900, Akt III rund 2.890). **Vorgabe für P19.6 (L-276):** Testgrenzen auf **9.000 Wörter gesamt und 3.300 je Akt** anheben (`tests/lesezeit.test.ts`: `WEG_MAX_WOERTER` und Akt-Grenze); die angekündigten „etwa 40 Minuten“ plus 6 Minuten (46) halten. Weil die Schranke nur etwa 20 Wörter unter der Grenze liegt, gilt für die Messung in P19.6 die Reihenfolge der Schnitte: zuerst die Schlusssätze der Mini-Aufgaben (zusammen 26 Wörter), dann die Erklärungen von Karte 2 in Station 7 und 12, dann das Ranzen-Echo in Station 13 (15 Wörter; Ranzen behält ihre Zeile im Ende).

**Summe Kurzfassung (Entwurfsrechnung der dritten Fassung).** Die erste Rechnung des Gerüsts (2.083) und die zweite Fassung dieser Datei (2.017, mit Zielwerten statt Entwürfen) werden durch die Rechnung aus den Entwürfen ersetzt: Auftakt 152 + Station 1 etwa 380 + Station 3 etwa 303 + Station 5 etwa 295 + Station 12 etwa 623 (mit den Echos E4 und E7) + Brücken 147 + Ende 151 = **rund 2.051 Wörter** (10,3 Minuten, „etwa 10“). Das Fenster für „etwa 10“ liegt bei 1.900 bis 2.099 Wörtern; die Untergrenze hat rund 150, die Obergrenze rund 50 Wörter Spielraum (die Kalibrierung des Aufschlags in der Kurzfassung bleibt die größte Unschärfe, P19.6 misst neu). Die Zahlen enthalten die alten Brückenkarten nicht doppelt (die reinen Stationszahlen heute: 390, 318, 327, 587, Ende 137). Der Sturm als fünfte Station (+260) passt nicht (rund 2.280 Wörter, 11,4 Minuten); die Aussage des Gerüsts bleibt richtig. Gemessen habe ich mit demselben Zählverfahren wie `lesezeit.mjs` (Wegwerfskript); P19.6 misst neu.

---

## 10 · Abweichungen vom Gerüst und offene Fragen

**Abweichungen** (jeweils begründet oben):

1. **Pause II mit 96 Wörtern statt 90, Ende 319 statt 280** (Auftakt 149 statt 200 gleicht aus; Summe 8.083 statt 8.090).
2. **Buch: Spalte „Anlass“ statt „Wann“**; Zeilen 3, 4, 5, 7, 8, 9, 10, **12** neutralisiert (Zeile 12 „drei zulässige Wege“ stimmt auf dem Weg „nur ein Gerät mit Preis“ nicht).
3. **Voraussetzung „Vertrauen niedrig ⇒ Falle in 1 bis 13“ des Gerüsts trägt nicht** (Gegenbeispiel `gvvvvvvvvvvvvf`); richtig ist „mindestens eine Falle“ (und mindestens zwei nicht gute Antworten).
4. **Brücke 14 neu** (zehnte Zeile): Ohne sie fehlt der Kurzfassung die Freigabe mit Auflagen.
5. **Kürzungsplan der Kurzfassung:** Das Gerüst zählt die alten Brückenkarten doppelt; die echte Reserve beträgt rund 80 Wörter (2.017 statt 2.083 bis 2.099). Die Schnitte in Station 3 (−18) und 12 (−17) sind kleiner als im Gerüst (−28, −63); der Muss-Filter fällt in der Kurzfassung ohnehin weg.
6. **Restzeit in der Ortszeile** aus der Messung; das Beispiel „Station 7 … noch etwa 9 Minuten“ der Aufgabenstellung trifft Station 12; bei Station 7 stehen etwa 24 Minuten.
7. **Pausentext Satz 3 Akt I** als Aussage statt Handlung (Wortzahl); Akt III Satz 2 ohne „Punkte kommen danach“.
8. **Ranzen, Spitzfeder und Pfennig haben im Ende je eine Zeile** (Gerüst: nur Pfennig); die Bögen von Ranzen und Spitzfeder brauchen einen Abschluss (Prüfbericht Konsistenz, M11). Die Zeilen tragen `kurzfassung: false`; das Ende liegt damit bei rund 348 Wörtern (Gerüst-Ziel 280, Abschnitt 9).
9. **Pfennigs Satz „Geld ohne Beleg“ heißt „Geld ohne Nachweis“** (sichtbar sperrt `werkzeuge/sichtbar.mjs` das Wort „Beleg“; „Nachweis“ ist ein Wort des Standards).
10. **Akt-Kopfkarte** (je ein Satz, 2.2) und **Pause bei offenen Stationen** (2.3) sind im Gerüst nicht vorgesehen; ohne sie wäre „Das können Sie jetzt“ auf einem Sprungweg falsch.
11. **Dritte Fassung (L-276):** Entscheidungsbuch, Pausen, Brücken, Kärtchen und Echo-Wortlaut sind hier verbindlich; neue Mini-Arten mit Namen, Rückmeldung, Pinnwand-Endpunkten, `rueckfragen`-Zustand und Kurzfassungsmarken (7.8); Vertiefungs-Formen wie in den Akt-Dateien (7.4); obere Schranke der Tests 9.000 Wörter gesamt und 3.300 je Akt (Abschnitt 8, Test 2); Brücken 7, 8 und 10 geändert (6.1); Ende mit Zeilen von Ranzen und Spitzfeder.

**Offene Fragen** (jeweils mit Vorschlag, O-26):

1. **Pausen im Sprungweg:** Der Block „Das können Sie jetzt“ gilt nur, wenn alle Stationen des Akts beantwortet sind. Vorschlag: so lassen; einfacher wäre „immer anzeigen“, aber dann steht eine Lernaussage ohne gespielte Station.
2. **Zeit niedrig und Fugen im Hallenboden:** Die Halle ist auf allen Wegen außer „Zeit niedrig“ nutzbar, die Fugen werden in den Herbstferien nachgebessert (3.2). Vorschlag: im Text von 13 und 14 so festschreiben; sonst widerspricht die Zeile „Nur die Sporthalle bleibt noch zu“ der guten Linie.
3. **„Mit Ausprobieren eher 45 Minuten“** auf der Seite? Entschieden (L-275): nein, nur „etwa 40 Minuten“.
4. **Weiterführung aus der Kurzfassung:** Wechsel mit den vier Antworten (Vorschlag) oder neuer Weg „Von vorn mit der ganzen Geschichte“; der Wechsel kann die Balken beim Übergang sichtbar bewegen (übersprungene Stationen zählen dann nicht mehr als gut).
5. **Akzent der Nebenfiguren:** Ranzen `gruen`, Pfennig `beere`, Spitzfeder ohne Akzent (Papierton der Zeitung); sieben Akzente tragen schon Balken und Hauptfiguren. Vorschlag: so lassen.
6. **Mandat-Kärtchen:** Zeile „vertritt sie die Leiterin der Finanzabteilung“ ist eine freie Festlegung (Gerüst Offene Frage 5). Vorschlag: aufnehmen; es gibt keine Regel zur Reichweite der Vertretung.
7. **Namenssuche** für Ranzen, Spitzfeder, Pfennig und „Lindenbote“ wiederholen (Gerüst Offene Frage 7; Ersatznamen Ranzel, Federle, Groschen).
8. **Verlauf mit hohlen Punkten in der Kurzfassung:** Vorschlag: so lassen; Alternative: nur die gespielten Stationen verbinden.
