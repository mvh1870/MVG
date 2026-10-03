# Vier neue Explore-Werkzeuge – Konzept (P18.1, O-59)

Stand 2026-10-03 · Entwurf zur Prüfung (Fachtreue + Begriffe, O-24). Internes Dokument: Belege, Kennungen und Quellenangaben stehen nur hier und in YAML-Kommentaren/`belege`-Feldern, nie auf der Seite (O-38).

Grundlage: O-59 (Werkzeuge A–D, Rahmen 1c 2a 3a 4a 5b 6a), O-36/O-37 (V2.4 maßgeblich, nicht wiedergeben), O-46 (kein Mandatsleiter-Simulator, keine Selbstdiagnose), O-8 (keine Punktzahl als Urteil über eine Organisation), O-50 (nur Schulcampus Lindenhall-Süd), O-56 (keine internen Bemerkungen sichtbar), O-42 (Internetseite, kein „App“, „Datei“, „Programm“). Fall: `inhalte/fall.md`, Story: `inhalte/geschichte/k*.yaml`.

Belegschreibweise (intern): `v24:hb-<Abschnitt>` Handbuch V2.4, `v24:hb-projektblatt` Projektblatt, `v24:tlb-<n>` Teilleistungsbild, `v24:va-<n>` Vertragsanlage Teil A (nur als interner Beleg, nie als Text, O-37), `v24:as-<n>` Ausschreibung; V1.2-Absatz-IDs wie `k9.4-l1`. „Fall“ = Eckdatum aus `inhalte/fall.md` (Beispielwert, keine Regel).

---

## 0 Gemeinsamer Rahmen (gilt für A–D)

| Punkt | Festlegung | Grund |
|---|---|---|
| Ort | Vier neue Werkzeuge unter Explore, Adresse `#explore/vorlagen-check`, `#explore/wegweiser`, `#explore/risiko-grenzen`, `#explore/monatsbericht` (Kennungen passen zu `KENNUNG` in `src/regie/buehne.ts`). | O-59, L-25 |
| Reihenfolge der Kacheln | jedes neue Werkzeug neben seinem „Geschwister“: MCDA-Rechner · **Vorlagen-Check** · Risikomatrix · **Risiko-Bewerter** · Vorgangsarten · **Vorgangs-Wegweiser** · Takt · **Monatsbericht** · Glossar (9 Kacheln). | Nachschlagen und Ausprobieren liegen beieinander |
| Farbe | Akzent wie das Geschwister: A `violett`, C `blau`, B `lagune`, D `sonne`; unterschieden durch den Gegenstand. Ampelfarben nur für Status (O-11). | O-57, O-11 |
| Vorbelegung | Jedes Werkzeug startet mit einem Beispiel vom Schulcampus; daneben Auswahl weiterer Beispiele und „Leer beginnen“. Alles überschreibbar. | O-59 (1), O-50 |
| Speichern | Nichts wird gespeichert oder gesendet: Eingaben leben nur im Speicher der geöffneten Ansicht; kein `localStorage`, kein Kanal außer Regie→Leinwand (nur Beispiel-Kennung und Schritt, siehe 0.3). Datenschutz-Satz in P18.5 prüfen. | O-59 (1), O-42, O-43 |
| Rückmeldung | unmittelbar bei jeder Eingabe (`aria-live="polite"`), Ampel oder Häkchen, je Lücke ein Satz „So schließen Sie sie“. Keine Punktzahl, kein Prozentwert als Urteil (O-8); die Matrixprodukte in C sind Werte der Risikomatrix, kein Urteil über jemanden. | O-59 (3), O-8 |
| Grafik | je Ergebnis eine kleine Grafik (vorhandene `GIMMICKS` oder neu benannte, Abschnitt 6). | O-59 (3), O-53 |
| Druck | Knopf „Drucken“ → `window.print()` mit eigenem Bogen (`src/ui/druck.ts`, `bogenKopf(titel, '', mitFiktiv)`), A4 hoch, eine Seite. Der Bogen enthält nur das Ergebnis, keine Bedienelemente. „Fiktiver Fall“ im Kopf, solange ein Beispiel geladen ist (nicht nach „Leer beginnen“). | O-59 (2), O-45 |
| Tastatur | alle Eingaben als echte Formularelemente (Optionsfelder, Auswahllisten, Zahlenfelder), Reihenfolge = Lesereihenfolge; Fokus bleibt beim Neuzeichnen auf dem bedienten Element (wie R68 im MCDA-Rechner). Kontrast ≥ 4,5:1; Bewegung nur ohne `prefers-reduced-motion`. | CLAUDE.md |
| Sichtbare Wörter | Kein „Whitepaper“, „Kapitel“, „V1.2“, Absatz-ID, „App“, „Datei“, „Programm“, „HTML“; wenige Abkürzungen: „gewichteter Vergleich“ statt „MCDA“ (das Kürzel erklärt der MCDA-Rechner), „Projektsteuerung“ statt „PS“, keine „LPH“, kein „AG“/„Auftraggeber“ (sondern „Bauherr“), kein „Projektblatt“ (sondern „die Grenzen, die der Bauherr für das Projekt festlegt“). Kennungen wie `RIS-014` sind in Explore erlaubt (BEGRIFFE.md, ID-Kürzel), sparsam und klein. | O-38, O-42, O-51, BEGRIFFE.md |
| Story- und Themenverweise | sichtbar ohne „Kapitel“: „In der Story: Die große Entscheidung“, „Im Thema: Entscheidungsvorlage“. | sichtbar.mjs verbietet „Kapitel“ |

### 0.1 Abgrenzung

- **O-37:** Kein Vertragstext, keine wörtliche Übernahme aus Handbuch, Teilleistungsbild, Ausschreibung oder Vertragsanlage. Alle Prüffragen, Hinweise und Sätze „So schließen Sie sie“ sind eigene, kurze Worte. Das Projektblatt wird nicht als Formular nachgebaut; C zeigt nur drei Reihen eigener Grenzen. Kein Download einer Vorlage. Die Vertragsanlage dient nur als interner Beleg.
- **O-46:** Kein Mandatsleiter-Simulator: kein Werkzeug lässt Wertschwellen oder Zuständigkeiten einstellen. Der Mandatshinweis in A nutzt fest die Zuordnung des Beispielprojekts (Fall, „Wer entscheidet was“) und erscheint nur bei geladenem Beispiel. Keine Selbstdiagnose: A prüft eine einzelne Vorlage, D einen einzelnen Bericht; kein Werkzeug bewertet eine Organisation, einen Reifegrad oder die eigene Arbeitsweise.
- **O-8:** kein Gesamtwert, keine Prozentzahl, kein Rang; Ergebnis in Worten + Ampel.
- **Keine neuen Fachaussagen:** Jede Regel unten hat eine Belegspalte. Was nur Bedienung ist (z. B. Zeilenbudget in D), ist als „Bedienregel“ gekennzeichnet und behauptet keine MVG-Regel.

### 0.2 Gemeinsame Bausteine (neu)

- `src/werkzeuge/` – reine Rechenkerne (kein DOM, keine Uhr, keine Zufälle), je Werkzeug eine Datei, getestet in `tests/werkzeuge-*.test.ts` mit Gegenproben und Mutanten-Probe (P18.2).
- `src/ui/flaechen/explore/` – Oberfläche je Werkzeug (P18.3/P18.4); `explore.ts` bindet sie ein.
- `src/grafik/werkzeug-bilder.ts` – parametrische Kleingrafiken (Ampel, Messlatte, Mini-Matrix, Seitenmesser), Abschnitt 6.

### 0.3 Regie und Leinwand (für alle vier)

Heute sendet die Regie nur `werkzeug`; die Leinwand zeichnet das Werkzeug mit `bedienbar: false` in der Ausgangsstellung. Vorschlag:

- `Buehne` bekommt ein Feld `werkzeugStand: string | null` (≤ 80 Zeichen, Muster `^[a-z0-9:;,.-]*$`), gelesen nur über die Kern-Funktion `leseWerkzeugStand(werkzeug, roh)` des jeweiligen Werkzeugs; Unpassendes → `null` (Leinwand bleibt beim Beispielanfang). Inhalt: **Beispiel-Kennung und Schritt**, z. B. `b:lueftung-kurz;s:3` (A), `b:messe;a:n,n,u` (B), `b:ris-009;t:71` (C, nur die „Was wäre, wenn“-Knöpfe), `b:oktober;w:1` (D). **Kein Freitext** über den Kanal – frei Getipptes der Moderation bleibt in der Regie (schützt vor Fehlanzeigen und hält `pruefeBuehne` einfach).
- Regie: unter der Werkzeugwahl Chips „Beispiel“ (je Vorbelegung) und für A/B „Schritt zurück · weiter“; die Pfeiltasten gehen in A und B erst durch die Schritte, am Ende zum nächsten Werkzeug.
- Leinwand: Ergebnisfläche groß (Ampel/Grafik links, Lücken bzw. Ergebnis rechts), keine Eingabefelder, Schrift ≥ 24 px bei 1920 × 1080; dieselbe Fläche wie die Seite mit `bedienbar: false`.
- Regie-Notiz und Leitfragen je Werkzeug in `werkzeuge.yaml` (`regie:`), kompiliert in den Regie-Teil wie bei den Story-Kapiteln (nie in `OeffentlicheInhalte`, L-7).

---

## A · Vorlagen-Check

**Zweck:** Prüft Schritt für Schritt, ob eine Entscheidungsvorlage entscheidungsreif ist, und sagt zu jeder Lücke in einem Satz, wie man sie schließt.

### A.1 Ablauf

1. Beispiel wählen (Vorgabe: „Lüftungsanlage – nur das Ersatzgerät“) oder „Leer beginnen“.
2. Kopf: Titel der Vorlage, Datum (frei), befugte Stelle, Betrag, Geld aus der Reserve (ja/nein/unbekannt), Wege (Liste).
3. Fünf Prüfschritte mit Fortschrittslinie (1 Frage und Rahmen · 2 Wege · 3 Gewichteter Vergleich · 4 Empfehlung · 5 Grundlagen). Je Prüfpunkt drei Antworten: **Ja · Teilweise · Nein**. Unbeantwortet = „noch offen“.
4. Rechts (schmal: darunter) läuft die Ampel mit; jede Lücke erscheint sofort mit ihrem Satz „So schließen Sie sie“.
5. Ergebnis: Ampel, Liste der Lücken (Muss-Lücken zuerst), Liste der erfüllten Punkte (eingeklappt), Grafik, Knopf „Drucken“. Verweis „Wann liegt ein anderer Weg vorn? → MCDA-Rechner“ bei Prüfpunkt C4.

### A.2 Felder

| Feld | Antwortmöglichkeiten | Wirkung |
|---|---|---|
| Titel der Vorlage | Freitext (≤ 80 Zeichen) | nur Druck/Anzeige |
| Befugte Stelle | Sie (Projektleitung des Bauherrn) · Bürgermeisterin · Lenkungskreis · Projektsteuerung · noch offen | Regeln A-R3, A-R4, A-R5 |
| Betrag des empfohlenen Wegs | Zahl in € oder „unbekannt“ | nur Mandatshinweis bei geladenem Beispiel (A-R5) |
| Geld aus der Reserve | ja · nein · unbekannt | Mandatshinweis (A-R5) |
| Wege | Liste, 1–5 Einträge: Name (Freitext) + Zustand **zulässig · unzulässig · nur zum Schein · noch ungeprüft** | Zählung zulässiger Wege (A-R6, A-R7) |
| Prüfpunkte A1–E3 | Ja · Teilweise · Nein | Ampel (A-R1, A-R2) |
| Dringlich? (Zusatzfrage am Ende von Schritt 1) | ja · nein | Hinweis A-R8 |

### A.3 Prüfpunkte, Regeln, Belege, Sätze „So schließen Sie sie“

`M` = Muss-Punkt (Nein → rot, Teilweise → gelb); ohne `M`: Nein oder Teilweise → gelb.

| Nr | Prüffrage (sichtbar, Entwurf) | M | So schließen Sie sie (sichtbar, Entwurf) | Beleg |
|---|---|---|---|---|
| A1 | Steht die Frage so da, dass sie mit der Wahl eines Wegs beantwortet wird? | M | Schreiben Sie die Frage so, dass die Antwort die Wahl eines Wegs ist. | v24:hb-3.1 (Entscheidungsbedarf klären), k9.4-l1 (Entscheidungsfrage), k5.1-p2 |
| A2 | Ist gesagt, warum der Bauherr entscheiden muss – und dass es keine Routinearbeit und kein reiner Prüfauftrag ist? | | Sagen Sie in einem Satz, warum das eine Entscheidung des Bauherrn ist, etwa weil Geld aus der Reserve gebraucht oder ein großes Risiko getragen würde. | v24:hb-3.1, v24:hb-1 (Abs. „befugte Stelle entscheidet über Ziele, wesentliche Abweichungen, Mittel, Risikoannahmen und Freigaben“), v24:hb-1.1 |
| A3 | Ist die Stelle genannt, die entscheiden darf, mit ihrem Rahmen? | M | Nennen Sie die Stelle, die nach dem Rahmen des Projekts entscheiden darf. | v24:hb-3.1, k9.4-l1 (Mandat und letztverantwortliche Rolle) |
| A4 | Ist ein Entscheidungstermin genannt? | M | Nennen Sie das Datum, bis zu dem entschieden sein muss – vor dem Auftrag, der davon abhängt. | v24:hb-3.1, v24:hb-3.2 (Termin vor der erforderlichen Beauftragung), v24:hb-5 (Zeile Entscheidung) |
| A5 | Steht da, was passiert, wenn später entschieden wird? | | Schreiben Sie dazu, was eine spätere Entscheidung kostet oder verschiebt. | v24:hb-3.1 |
| B1 | Gibt es mindestens zwei ernsthafte, zulässige Wege? *(aus der Wegeliste errechnet, nicht anklickbar)* | M | Arbeiten Sie einen zweiten Weg aus, der wirklich zulässig ist – auch das bisherige Vorgehen zählt, wenn es zulässig ist. Bis dahin trägt die Vorlage den Vermerk „nicht vollständig“ und nennt, was noch geklärt wird. | v24:hb-3.1 (Mindestens zwei Optionen; Vorlegen: „nicht vollständig“, keine Scheinkonstruktion), v24:hb-1.5, v24:tlb-2.1 |
| B2 | Sind für jeden Weg Vorgehen, Kosten, Zeit, Qualität und Nutzung, verbleibende Risiken, Annahmen und nötige Freigaben beschrieben? | | Ergänzen Sie je Weg, was er kostet, wie viel Zeit er braucht, was er für die Nutzung bedeutet, welches Risiko bleibt und welche Freigabe er braucht. | v24:hb-3.1, k9.4-l1 (Optionen und Konsequenzen; Wirkung auf Kosten, Termin, Qualität …), v24:va-3.2 |
| B3 | Wurden Sicherheit, Genehmigung und Funktion vor dem Punktevergleich geprüft? | | Prüfen Sie die zwingenden Anforderungen vorab; ein Weg, der sie nicht erfüllt, kommt nicht in den Vergleich. | v24:hb-3.1 (Grenzen und Empfehlung) |
| C1 | Wurden Gesichtspunkte, Gewichte und Punktestufen vorher mit dem Bauherrn abgestimmt, abgeleitet aus den Zielen des Projekts? | M | Stimmen Sie Gesichtspunkte und Gewichte ab, bevor bewertet wird, und leiten Sie sie aus den Zielen des Projekts ab. | v24:hb-3.1 (MCDA anwenden) |
| C2 | Hat jeder Punktwert einen Grund und einen Nachweis, und ist beschrieben, was jede Stufe bedeutet? | M | Schreiben Sie zu jedem Punktwert Grund und Nachweis, und sagen Sie, was jede Stufe bedeutet. | v24:hb-3.1 (Punkte nachvollziehbar begründen) |
| C3 | Stehen Euro, Tage und offene Fragen neben den Punkten – und ist nichts Fehlendes als null gezählt? | | Lassen Sie Beträge und Tage neben den Punkten stehen und markieren Sie Fehlendes als offen statt mit null. | v24:hb-3.1 |
| C4 | Ist geprüft, ob andere vertretbare Gewichte die Rangfolge ändern? | | Zeigen Sie, bei welchem Gewicht ein anderer Weg vorn läge. | v24:hb-3.1, v24:hb-3.2, v24:tlb-2.1 |
| D1 | Ist die Empfehlung begründet, mit Nachteilen, Unsicherheiten und Voraussetzungen? | M | Begründen Sie die Empfehlung und nennen Sie auch ihre Nachteile und Voraussetzungen. | v24:hb-3.1 |
| D2 | Trägt die Empfehlung auch fachlich – nicht nur über die Punktzahl? | | Sagen Sie, warum der Weg fachlich trägt; eine hohe Punktzahl allein ist noch kein Urteil. | v24:hb-3.1 |
| D3 | Bleibt der Beschluss offen – ohne dass Empfehlung, Schweigen oder ein Status in der Software als Beschluss gelten? | M | Lassen Sie den Beschluss offen; er wird erst nach der Entscheidung der befugten Stelle mit Datum und Bedingungen festgehalten. | v24:hb-3.1 (Beschluss getrennt dokumentieren), v24:va-4.2, k9.4-l1 (Beschlusslage) |
| E1 | Sind Datenstand und Quellen genannt? | M | Nennen Sie, auf welchem Stand von Zahlen und Plänen die Vorlage beruht. | v24:hb-3.1 (Vorlegen und nachhalten), k9.4-l1, k4.6-p2, k5.1-p2 |
| E2 | Verweist die Vorlage auf den Vorgang, aus dem sie entsteht? | | Verweisen Sie auf den Eintrag, aus dem die Entscheidung entsteht – etwa das Risiko, das Problem oder die Änderung. | v24:hb-3.1, v24:hb-5 |
| E3 | Liegt die Vorlage dort, wo alle Vorgänge stehen, oder ist eindeutig darauf verwiesen? | | Legen Sie die Vorlage in der Software des Bauherrn ab oder verweisen Sie dort eindeutig auf sie. | v24:hb-3.1, v24:hb-5 (Abs. 1) |

### A.4 Rechenregeln

| Regel | Inhalt | Beleg |
|---|---|---|
| A-R1 | **Rot „nicht vollständig“**, wenn ein M-Punkt „Nein“ ist, B1 nicht erfüllt ist (weniger als zwei zulässige Wege) oder A-R4 greift. | v24:hb-3.1 (Vorlegen: nicht vollständig kennzeichnen), v24:tlb-2.1 |
| A-R2 | **Gelb „noch nicht entscheidungsreif“**, wenn kein Rot-Grund vorliegt, aber ein Punkt „Teilweise“ oder ein Punkt ohne M „Nein“ ist oder noch offen ist. **Grün „entscheidungsreif“**, wenn alle Punkte „Ja“ sind. *(Bedienregel: Die Dreiteilung ordnet nur die Lücken; sie behauptet keine Rangfolge im Standard.)* | k6.4.1-p3 („entscheidungsreif gemacht“) |
| A-R3 | Befugte Stelle „noch offen“ → A3 gilt als „Nein“. | v24:hb-3.1 |
| A-R4 | Befugte Stelle „Projektsteuerung“ → rot mit Satz: „Die Projektsteuerung bereitet vor und empfiehlt; entscheiden darf sie nicht.“ | v24:hb-3, v24:hb-3.1, v24:tlb-2.1, v24:va-4.1 |
| A-R5 | Nur bei geladenem Beispiel (Fall-Zuordnung, nicht einstellbar, O-46): Betrag > 100.000 € oder Geld aus der Reserve → befugt ist die Bürgermeisterin; „Sie“ → Lücke A3 mit Satz „Im Beispielprojekt entscheidet darüber die Bürgermeisterin: mehr als 100.000 Euro oder Geld aus der Reserve.“; „Lenkungskreis“ → Lücke A3 mit Satz „Der Lenkungskreis berät die Bürgermeisterin; entscheiden tut sie.“ Betrag oder Reserve „unbekannt“ → A3 höchstens „Teilweise“ mit Satz „Klären Sie Betrag und Herkunft des Geldes – davon hängt ab, wer entscheidet.“ | Fall („Wer entscheidet was“), k9.3-p3, v24:hb-projektblatt (Befugnisse und Schwellen) |
| A-R6 | Zulässige Wege = Zahl der Wege mit Zustand „zulässig“. „Unzulässig“, „nur zum Schein“ und „noch ungeprüft“ zählen nicht; je ein Satz: unzulässig → „Ein unzulässiger Weg kann auch mit vielen Punkten nicht gewinnen.“ · Schein → „Ein Weg nur zum Schein zählt nicht als zweiter Weg.“ · ungeprüft → „Lassen Sie die Zulässigkeit fachlich bestätigen, bevor verglichen wird.“ | v24:hb-3.1 (Mindestens zwei Optionen; Grenzen), v24:hb-1.5 |
| A-R7 | Ein Weg „bisheriges Vorgehen beibehalten“ zählt wie jeder andere, wenn er als zulässig markiert ist (kein Sonderabzug). | v24:hb-3.1 („begründetes Beibehalten … sofern tatsächlich zulässig“) |
| A-R8 | Dringlich = ja → Hinweis (blau, kein Ampelgrund): „Dringliches wird gemeldet und gesichert, bevor die Vorlage fertig ist.“ | v24:hb-3.1 (letzter Satz „Vorlegen und nachhalten“), v24:hb-3 (Warnanlässe), v24:hb-4 |

### A.5 Vorbelegung (Schulcampus)

| Kennung | Beispiel | Werte | Ergebnis |
|---|---|---|---|
| `lueftung-kurz` *(Vorgabe)* | Lüftungsanlage der Gesamtschule, Mai 2027 – Fassung „nur das Ersatzgerät, mit Preis und Liefertermin“ (Falle in Story 7) | Stelle Bürgermeisterin; Betrag rund 400.000 €; Reserve ja; ein Weg (Ersatzgerät, zulässig); A1 Ja, A2 Teilweise, A3 Ja, A4 Nein, A5 Nein; B2 Teilweise, B3 Ja; C1–C4 Nein; D1 Teilweise, D2 Nein, D3 Ja; E1 Teilweise, E2 Nein, E3 Ja | **rot** – zweiter Weg fehlt, kein Vergleich, kein Termin |
| `lueftung-voll` | Dieselbe Lage, Fassung mit allen drei Wegen (gute Antwort in Story 7) | drei Wege zulässig: Ersatzgerät rund 400.000 €, Leihgeräte rund 150.000 € (Fachplanung bestätigt), später einziehen rund 50.000 €; Stelle Bürgermeisterin, Reserve ja; Termin „Ende Mai 2027“; Folge „sonst ist auch das Ersatzgerät nicht rechtzeitig da“; Gewichte vorher abgestimmt aus „zuerst der Schulstart, dann das Geld“; C4: „Wären Klima und Betrieb wichtig, läge der spätere Einzug gleichauf“; Empfehlung Ersatzgerät mit Nachteil „kostet am meisten“; Vorgang: die spätere Lieferung (Problem); Datenstand „Mai 2027“ | **grün** |
| `mensa` | Mensa für 450 statt 300 Essen, Juni 2026 (Story 4) | zwei Wege zulässig: größere Mensa rund 600.000 € und vier Wochen Umplanung · Mensa, die später wachsen kann, rund 150.000 €; Stelle Bürgermeisterin, Reserve ja; Termin nur „bevor die Fundamente gegossen werden“ (A4 Teilweise); bis zum Beschluss gilt die bisherige Planung (D3 Ja); übrige Ja | **gelb** – Termin ohne Datum |

Hinweis Fall-Bibel: Alle Zahlen, Wege, Stelle und Termin stammen aus `k7-entscheidung.yaml`, `k4-mensa.yaml` und `fall.md`. Neu ist nur die Angabe „Datenstand Mai 2027“ im Beispiel `lueftung-voll` (Story nennt keinen Datenstand; der Monat ist der Monat der Story-Szene) – siehe offene Entscheidung E-3.

### A.6 Rückmeldung und Grafik

- Ampel (parametrisch `ampel(stufe)`, neu) mit Wort daneben: „entscheidungsreif“ · „noch nicht entscheidungsreif“ · „nicht vollständig“ (Farbe nie allein).
- Grafik je Ergebnis: grün → `stempel` (vorhanden, Häkchen); gelb → `notizzettel` (vorhanden, Fragezeichen); rot → `warnschild` (vorhanden).
- Je erfülltem Prüfpunkt ein Häkchen in der Fortschrittslinie; je Lücke eine Karte: Prüffrage (kurz) + „So schließen Sie sie: …“.

### A.7 Druckbild (eine Seite)

Kopf (`bogenKopf`: „Vorlagen-Check · <Titel der Vorlage>“, Fiktiv-Vermerk bei Beispiel) · Zeile Ampel + Wort · Kasten „Rahmen“ (Stelle, Termin, Zahl der zulässigen Wege) · Tabelle der 18 Prüfpunkte in zwei Spalten (Häkchen / Teilweise / Lücke, Kurzform der Frage) · Liste „So schließen Sie die Lücken“ (höchstens 18 Sätze, 10 pt) · Fuß: „Eingaben wurden nicht gespeichert.“ Platzbedarf: höchstens etwa 55 Zeilen – passt.

### A.8 Verknüpfung

- Story: **7 „Die große Entscheidung“** (Hauptverweis, Kasten „Das steckt dahinter“: „Selbst ausprobieren: Vorlagen-Check“, öffnet mit `lueftung-voll`); **4 „Die Schule will mehr“** (öffnet mit `mensa`).
- Thema: **Entscheidungsvorlage** (`entscheidungsvorlage`, k14), am Ende „Selbst ausprobieren“.
- Explore: Querverweis aus C4 auf den MCDA-Rechner.

### A.9 Regie und Leinwand

Regie-Chips: `lueftung-kurz` · `lueftung-voll` · `mensa`; Schritt 1–5 und „Ergebnis“. Leinwand zeigt den aktuellen Schritt mit den Antworten des Beispiels (nur lesbar) bzw. das Ergebnis groß: Ampel links, Lückenkarten rechts. Regie-Notiz (Entwurf): „Erst die kurze Fassung zeigen und raten lassen, was fehlt; dann zur vollen Fassung wechseln.“ Leitfragen: „Welche dieser Fragen beantworten Ihre Vorlagen heute?“ · „Wer entscheidet bei Ihnen, ob eine Vorlage vollständig ist?“

---

## B · Vorgangs-Wegweiser

**Zweck:** Führt mit wenigen Ja/Nein-Fragen von einem Sachverhalt zur passenden Vorgangsart und zeigt den nächsten Schritt, was festzuhalten ist und welche Verwechslung typisch ist.

### B.1 Ablauf

1. Sachverhalt wählen (Vorgabe: „Hinweis von der Messe: Holz wird knapp“) oder „Eigener Sachverhalt“ (Freitext, nur Anzeige).
2. Vorfrage „Dringlich?“ – unabhängig vom Weg.
3. Bis zu fünf Fragen nacheinander; jede Antwort zeigt sofort die nächste Frage. Antworten: **Ja · Nein · Unklar** (bei W3 und W5) bzw. **Ja · Nein**.
4. Sobald eine Art feststeht: Nachfrage „Braucht es eine Entscheidung des Bauherrn?“
5. Ergebnis: Art (farbige Marke wie in „Vorgangsarten und Wege“), nächster Schritt, „Festhalten“, „Fertig, wenn“, typische Verwechslung(en), ggf. Kasten „Entscheidung vorbereiten“ und Kasten „Sofort melden“. Der zurückgelegte Weg steht als Pfad (Frage → Antwort) darüber; jede Antwort ist anklickbar und änderbar.

### B.2 Fragen und Entscheidungsbaum

| Nr | Frage (sichtbar, Entwurf) | Antworten | Folge | Beleg |
|---|---|---|---|---|
| W0 | Ist es dringlich – geht es um Sicherheit, eine Genehmigung, fehlende Befugnis oder droht eine Möglichkeit zu handeln verloren zu gehen? | Ja · Nein | Ja → Kasten „Sofort melden“ (B-R1); weiter mit W1 | v24:hb-3 (Warnanlässe, „Dringliche Meldungen warten nicht“), v24:hb-4 |
| W1 | Geht es um eine Handlung, die einen schon erfassten Vorgang klären, mindern oder beheben oder einen Beschluss umsetzen soll? | Ja · Nein | Ja → **Maßnahme** | v24:hb-1 (Tabelle), v24:hb-1.6 |
| W2 | Ist schon etwas Nachteiliges passiert? | Ja · Nein · Unklar | Ja → **Problem**; Unklar → **Frühwarnung** | v24:hb-1.4, v24:hb-1.2 |
| W3 | Soll etwas, das bisher gilt, bewusst anders werden – Umfang, Planung, Material, Ausführung oder Termin? | Ja · Nein | Ja → **Änderung** | v24:hb-1.5 |
| W4 | Könnte etwas Nachteiliges eintreten, oder ist eine Größe unsicher, die Kosten, Termine oder Qualität treffen kann? | Ja · Nein · Unklar | Ja → **Risiko**; Unklar → **Frühwarnung** | v24:hb-1.3, v24:hb-1.2, v24:hb-2 |
| W5 | Ist es eine geplante Arbeit mit vereinbartem Ergebnis, Verantwortlichen und Termin? | Ja · Nein | Ja → **Aufgabe**; Nein → „Keine Art passt sicher“ (B-R2) | v24:hb-1.1 |
| W6 | Braucht es eine Entscheidung des Bauherrn – über Ziele, wesentliche Abweichungen, Geld, das Tragen eines Risikos oder eine Freigabe? | Ja · Nein | Ja → Kasten „Entscheidung vorbereiten“ | v24:hb-1 (Tabelle „Entscheidung vorbereiten“; Abs. befugte Stelle), v24:hb-3.1, v24:hb-1.3 (Annahme eines wesentlichen Risikos), k4.4-p1 |

Reihenfolge-Begründung (intern): W1 vor W3, weil eine Maßnahme zur Umsetzung eines Beschlusses (z. B. vorgezogene Vergabe) sonst als Änderung missverstanden würde; W2 vor W3, weil ein eingetretener Zustand ein Problem ist, auch wenn seine Lösung später eine Änderung braucht (v24:hb-1.4: „Benötigt die Lösung eine Änderung …, bereitet sie diese vor“).

### B.3 Rechenregeln

| Regel | Inhalt | Beleg |
|---|---|---|
| B-R1 | Dringlich = Ja → Kasten: „Sofort über den vereinbarten Meldeweg melden, die unmittelbare Reaktion sichern und noch am selben Arbeitstag festhalten. Der Monatsbericht ersetzt das nicht.“ | v24:hb-4 (Abs. 4, 6), v24:hb-3 |
| B-R2 | „Unklar“ bei W2 oder W4 → Frühwarnung: Was sich nicht einordnen lässt, ist noch nicht ausreichend geklärt. W5 = Nein (keine Art) → Satz: „Lässt sich der Sachverhalt keiner Art zuordnen, ist er noch nicht geklärt – halten Sie ihn als Frühwarnung fest.“ und Ergebnis Frühwarnung (gestrichelt). | v24:hb-1.2 („Hinweis … noch nicht ausreichend geklärt“) |
| B-R3 | Ergebnis Problem → Zusatz „Eine Wahrscheinlichkeit wird nicht mehr geschätzt.“ | v24:hb-1.4 |
| B-R4 | Ergebnis Änderung → Zusatz „Bis zur Freigabe gilt die bisherige Grundlage.“ | v24:hb-1.5 |
| B-R5 | W6 = Ja → Kasten „Entscheidung vorbereiten: mindestens zwei zulässige Wege, gewichteter Vergleich, Empfehlung, Termin; den Beschluss trifft die befugte Stelle.“ + Verweis „Vorlagen-Check“. | v24:hb-1 (Tabelle), v24:hb-3.1 |
| B-R6 | W6 = Nein bei Aufgabe → kein Hinweis (nicht jede offene Aufgabe braucht einen Beschluss); bei Risiko → Hinweis „Bewerten Sie es – etwa im Risiko-Bewerter.“ | v24:hb-1.1, v24:hb-1.3 |
| B-R7 | Immer unter dem Ergebnis: „Zusammengehörige Einträge werden verknüpft; die Herkunft geht nicht verloren.“ | v24:hb-1 (Abs. 3), v24:hb-1.2 |

### B.4 Ergebnisteile je Art (Kurzfassung der sichtbaren Sätze; Belege)

| Art | Nächster Schritt | Festhalten | Fertig, wenn | Beleg |
|---|---|---|---|---|
| Frühwarnung | Quelle sichern, Prüffrage stellen, festlegen, wer bis wann prüft. | Eingang und Quelle, offene Frage, wer prüft, Wiedervorlage. | Ein Klärungsergebnis liegt vor – oder der Hinweis wird mit Begründung geschlossen. | v24:hb-1.2, v24:hb-5 |
| Risiko | Ursache, mögliche Folgen und Zeitraum beschreiben, bewerten, Gegenmaßnahmen mit den Fachleuten entwickeln. | Ursache, Unsicherheit, Folgen, Zeitraum, begründete Bewertung, Datenstand, Maßnahmen, verbleibendes Risiko. | Eingetreten (weiter als Problem), die Möglichkeit ist entfallen oder die Wirkung ist nachweisbar beseitigt. | v24:hb-1.3, v24:hb-2, v24:hb-5 |
| Problem | Klären, was geschehen ist und welche Folgen feststehen; Lösung und Zwischenmaßnahmen abstimmen. | Eingetretener Zustand, bekannte Folgen, Klärung, Zwischenmaßnahme, Lösungsweg, Nachweis. | Die Lösung ist umgesetzt und fachlich bestätigt oder die weitere Bearbeitung ist ausdrücklich übernommen. | v24:hb-1.4, v24:hb-5 |
| Änderung | Anlass, Antragsteller, bisherige Grundlage und Wunsch aufnehmen; Auswirkungen ermitteln lassen. | Anlass, Antragsteller, bisherige und vorgeschlagene Grundlage, geprüfte Auswirkungen, Vorlage, Beschluss, Auflagen, Umsetzung. | Der beschlossene neue Stand ist umgesetzt; abgelehnte Anträge bleiben mit Begründung nachvollziehbar. | v24:hb-1.5, v24:hb-5 |
| Maßnahme | Bezug, Ziel, Verantwortlichen und Termin nennen; vorher klären, ob sie im Auftrag und in den Befugnissen liegt. | Ausgangsvorgang, erwartete Wirkung, Zuständigkeit, Termin, nötige Freigabe; Nachweis der Umsetzung und Ergebnis der Wirksamkeitsprüfung. | Umsetzung und Wirkung sind belegt. | v24:hb-1.6, v24:hb-5 |
| Aufgabe | Ergebnis, Verantwortlichen, Termin und Abhängigkeiten festlegen. | Erwartetes Ergebnis, Bearbeiter, Termin, Abhängigkeiten. | Das vereinbarte Ergebnis liegt vor und ist verwendbar. | v24:hb-1.1, v24:hb-5 |

Die Spalte „Fertig, wenn“ übernimmt die vorhandenen `vorgaenge.arten[].abschluss` (gleicher Wortlaut wie im Werkzeug „Vorgangsarten und Wege“), damit beide Werkzeuge nie auseinanderlaufen.

### B.5 Typische Verwechslungen (je Art höchstens zwei angezeigt)

| Kennung | Bei Art | Satz (sichtbar, Entwurf) | Beleg |
|---|---|---|---|
| `zu-frueh-risiko` | Frühwarnung | „Gleich als Risiko eintragen“ – erst klären; eine Bewertung ohne Grundlage braucht es nicht. | v24:hb-1.2, v24:hb-2 (keine künstliche Wahrscheinlichkeit), Story 2 |
| `bis-zum-termin` | Frühwarnung | „Das hat Zeit bis zum Monatstermin“ – ein neuer Hinweis wird spätestens bei der nächsten Wochendurchsicht festgehalten. | v24:hb-4 (Abs. 3), Story 2 |
| `geplant-senkt` | Risiko | „Die Maßnahme ist geplant, also ist das Risiko kleiner“ – die Bewertung sinkt erst, wenn Umsetzung und Wirkung belegt sind. | v24:hb-3 (Abs. 7) |
| `selten-also-egal` | Risiko | „Unwahrscheinlich, also egal“ – eine schwere Folge wird trotzdem geklärt. | v24:hb-3 (Abs. 2) |
| `wahrscheinlichkeit-problem` | Problem | „Wie wahrscheinlich ist das?“ – es ist schon passiert; jetzt zählen Folgen und Lösung. | v24:hb-1.4 |
| `eile-freigabe` | Problem | „Es eilt, also ist es freigegeben“ – Dringlichkeit ersetzt keine Freigabe. | v24:hb-1.4 |
| `zusage-beschluss` | Änderung | „Das wurde doch zugesagt“ – eine Zusage am Rand ist kein Beschluss; bis zur Freigabe gilt die bisherige Planung. | v24:hb-1.5, v24:hb-3.1 (Schweigen, Empfehlung kein Beschluss), Story 4 |
| `freigabe-nachtrag` | Änderung | „Freigegeben heißt bestellt“ – die Freigabe im Projekt ist noch keine Vertragsänderung oder Bestellung. | v24:hb-1.5 (Abs. 3) |
| `umgesetzt-wirksam` | Maßnahme | „Erledigt“ – umgesetzt und wirksam sind nicht dasselbe. | v24:hb-1.6 |
| `termin-statt-grund` | Aufgabe | „Neuer Termin, Thema erledigt“ – ein neuer Termin ersetzt nicht die Erklärung der Verzögerung. | v24:hb-1.1 |
| `jede-aufgabe-beschluss` | Aufgabe | „Dafür braucht es einen Beschluss“ – nicht jede offene Aufgabe braucht eine Risikobewertung oder einen Beschluss. | v24:hb-1.1 |

### B.6 Vorbelegung (Schulcampus)

| Kennung | Sachverhalt (sichtbar) | Antworten (W0…W6) | Ergebnis | Quelle |
|---|---|---|---|---|
| `messe` *(Vorgabe)* | März 2026: Der Architekt hat auf einer Messe gehört, dass die Lieferzeiten für Holzelemente länger werden. | W0 N · W1 N · W2 N · W3 N · W4 Unklar · W6 N | Frühwarnung | Story 2 |
| `hersteller` | April 2026: Drei von vier Herstellern brauchen ein halbes Jahr statt vier Monate; ob der Holzbau später beginnt, ist offen. | N · N · N · N · W4 J · W6 J | Risiko + Entscheidung vorbereiten | Story 3 |
| `ausschreiben` | April 2026: Die Holzelemente werden auf Beschluss der Bürgermeisterin früher ausgeschrieben. | N · W1 J · W6 N | Maßnahme | Story 3, Fundus MAS-007 |
| `mensa` | Juni 2026: Die Schulleitung wünscht eine Mensa für 450 statt 300 Essen. | N · N · N · W3 J · W6 J | Änderung + Entscheidung vorbereiten | Story 4 |
| `mehrkosten` | Oktober 2026: Die Haustechnikfirma kündigt Mehrkosten von gut einer Million an; die Vergabestelle prüft, ob sie berechtigt sind. | N · N · N · N · W4 J · W6 N | Risiko | Story 5, Fundus RIS-014 |
| `geruest` | Februar 2027: Nach dem Sturm sind zwei Gerüstanker an der Sporthalle lose. | W0 J · N · W2 J · W6 N | Problem + Sofort melden | Story 6 |
| `lueftung` | Mai 2027: Der Hersteller der Lüftungsanlage für die Gesamtschule liefert vier Monate später. | N · N · W2 J · W6 J | Problem + Entscheidung vorbereiten | Story 7; v24:hb-1.4 („ausgefallener Liefertermin“) |
| `haushalt` | Die Kostenübersicht für den Haushaltsansatz 2027 geht bis Freitag an die Kämmerei. | N · N · N · N · W4 N · W5 J · W6 N | Aufgabe | Fundus AUF-001 (`werkzeuge.yaml`) |

Hinweis `geruest`: Die Sperrung durch den Bauleiter erscheint im Ergebnis als „Zwischenmaßnahme, mit dem Problem verknüpft“ (v24:hb-1.4, v24:hb-5 Zeile Problem); keine Kosten, keine Uhrzeit (Fall).

### B.7 Rückmeldung und Grafik

- Je Antwort wächst der Pfad um ein Häkchen-Segment (gezeichnet wie ein Wegweiser-Ast); das Ergebnis erscheint mit Marke in der Farbe der Art.
- Grafik je Ergebnis: Frühwarnung `notizzettel` · Risiko `matrix` · Problem `absperrband` · Änderung `grundriss` · Maßnahme **neu `werkzeugkasten`** · Aufgabe `kalender`; Zusatz Entscheidung `waage`, Dringlich `telefon` (klein daneben). Kachel: **neu `gabelung`**.

### B.8 Druckbild (eine Seite)

Kopf („Vorgangs-Wegweiser · <Sachverhalt>“) · Sachverhalt · Pfad (Fragen mit Antworten) · Ergebnis-Kasten (Art, nächster Schritt, Festhalten, Fertig, wenn) · Verwechslungen · ggf. Kästen Entscheidung/Sofort melden · Fuß. Etwa 35 Zeilen.

### B.9 Verknüpfung

- Story: **2 „Ein erstes Warnsignal“** (öffnet mit `messe`); zusätzlich **6 „Ärger auf der Baustelle“** (öffnet mit `geruest`).
- Thema: **Vorgangsarten und Risikobewertung** (`vorgaenge`, k15).
- Explore: aus dem Ergebnis „Mehr zu dieser Art“ → `#explore/vorgaenge` (Art vorgewählt, falls die Route das trägt – sonst ohne).

### B.10 Regie und Leinwand

Regie-Chips je Sachverhalt; „weiter“ beantwortet die nächste Frage mit der Antwort des Beispiels (die Runde rät vorher). Leinwand: aktuelle Frage groß mit drei Antwortflächen (nur Anzeige, gewählte hervorgehoben), danach das Ergebnis. Regie-Notiz: „Erst raten lassen, dann die Antwort setzen; bei ‚Unklar‘ zeigen, warum es eine Frühwarnung wird.“ Leitfragen: „Welche Art landet bei Ihnen am häufigsten in der falschen Liste?“ · „Wer bei Ihnen hält fest, woher ein Hinweis stammt?“

---

## C · Risiko-Bewerter mit eigenen Grenzen

**Zweck:** Bewertet ein Risiko mit den vier eigenen Grenzen des Projekts für Wahrscheinlichkeit, Kosten und Termin und zeigt Stufen, Matrixfeld und Bearbeitungspriorität – auch dann, wenn noch nicht alles bekannt ist.

### C.1 Ablauf

1. **Grenzen des Projekts** (eingeklappt mit den Beispielwerten, aufklappbar): drei Reihen mit je vier Zahlen. Fehler sofort am Feld („Die Grenzen müssen von links nach rechts steigen.“).
2. **Risiko**: Beispiel wählen (Vorgabe `ris-009`) oder leer; Titel, Kennung (frei).
3. **Wahrscheinlichkeit**: Stufe direkt (1–5 mit Worten) **oder** Prozentwert; „unbekannt“.
4. **Auswirkungen**: Kosten (Betrag oder Spanne von–bis), Termin (Kalendertage am Zieltermin), Qualität oder Funktion (Stufe 1–5 mit Beschreibung). Jede Zeile hat den Zustand **Wert · unbekannt · trifft nicht zu**; „0“ ist ein Wert.
5. **Zusätze**: Warnanlässe (vier Kästchen), Stand der Gegenmaßnahme, „erreicht eine Entscheidungsschwelle des Bauherrn“, „Betrag schon in der Kostenprognose“, „Puffer berücksichtigt“.
6. **Ergebnis** live: je Zeile Stufe + Messlatte, Mini-Matrix mit Feld, Priorität mit Text „Was die Projektsteuerung veranlasst“, Zustand fest/vorläufig/offen, Hinweise, „Was wäre, wenn“-Knöpfe, Drucken.

### C.2 Felder

| Feld | Antwortmöglichkeiten | Prüfung |
|---|---|---|
| Grenzen Wahrscheinlichkeit | vier Prozentzahlen | jede > 0 und < 100, streng steigend (C-R1) |
| Grenzen Kosten | vier Eurobeträge | jede > 0, streng steigend (C-R1) |
| Grenzen Termin | vier Kalendertage (ganze Zahlen) | jede > 0, streng steigend (C-R1) |
| Wahrscheinlichkeit | Stufe 1 sehr gering · 2 gering · 3 mittel · 4 hoch · 5 sehr hoch **oder** Prozent (0 < p < 100) · unbekannt | |
| Kosten bei Eintritt | Wert (€) · Spanne (von–bis €) · unbekannt · trifft nicht zu | Wert ≥ 0, von ≤ bis |
| Termin am Zieltermin | Wert (Tage) · Spanne · unbekannt · trifft nicht zu | ganze Tage ≥ 0 |
| Qualität oder Funktion | Stufe 1–5 (Beschreibungen aus `matrix.qualitaet`) · unbekannt · trifft nicht zu | |
| Warnanlässe | Sicherheit · Genehmigung · fehlende Befugnis · drohender Verlust einer Möglichkeit zu handeln | |
| Gegenmaßnahme | keine · geplant · umgesetzt, Wirkung belegt | |
| Entscheidungsschwelle des Bauherrn erreicht | ja · nein | kein Rechnen mit Schwellen (O-46) |
| Betrag schon in der Kostenprognose | ja · nein · teilweise | nur Hinweis (C-R10) |
| Puffer beim Termin berücksichtigt | ja · nein | nur Hinweis (C-R11) |

### C.3 Rechenregeln

| Regel | Inhalt | Beleg |
|---|---|---|
| C-R1 | Je Reihe genau vier Grenzen, streng steigend, positiv; Prozentgrenzen > 0 und < 100. Sonst keine Stufe für diese Reihe (Zeile zeigt den Fehler). | v24:hb-projektblatt (Zeilen Wahrscheinlichkeit, Kosten, Termin), v24:hb-2 (Abs. 2, 4) |
| C-R2 | Stufe aus Grenzen: Wert ≤ G1 → 1; ≤ G2 → 2; ≤ G3 → 3; ≤ G4 → 4; > G4 → 5. **Ein Wert genau auf einer Grenze gehört zur niedrigeren Stufe.** Liegt der Wert genau auf einer Grenze, zeigt die Messlatte das mit dem Satz „Genau auf der Grenze – das ist noch Stufe n.“ | v24:hb-2 (Abs. 4), v24:hb-projektblatt (letzter Absatz) |
| C-R3 | Wahrscheinlichkeit: Stufe direkt genügt; eine genaue Prozentzahl ist nicht nötig. | v24:hb-2 (Abs. 2) |
| C-R4 | Matrixfeld = Wahrscheinlichkeitsstufe × **höchste belegte** Auswirkungsstufe; die Einzelstufen bleiben sichtbar. | v24:hb-2 (Schaubild, Abs. 6), v24:hb-3 |
| C-R5 | Priorität: 1–4 beobachten, 5–9 gezielt bearbeiten, 10–25 vorrangig; **Auswirkung 5 ist immer vorrangig.** Werte und Texte aus `matrix.stufen` (keine zweite Quelle). | v24:hb-2 (Schaubild), v24:hb-3 (Tabelle) |
| C-R6 | **Unbekannt ist nicht null:** Ist eine Auswirkung „unbekannt“ (oder ihre Spanne reicht über eine Stufengrenze), ist die Einstufung **vorläufig**: angezeigt werden „mindestens“ (aus den belegten Stufen) und „schlimmstenfalls“ (unbekannte Zeile = Stufe 5, Spanne = obere Stufe) als Bereich in der Mini-Matrix, dazu der Satz „Eine mögliche schwere Folge muss geklärt werden, auch wenn der Nachweis noch fehlt.“ Ist die Wahrscheinlichkeit unbekannt oder keine Auswirkung belegt, ist die Einstufung **offen** (kein Feld). „Trifft nicht zu“ zählt nicht mit; „0“ ist ein belegter Wert (Stufe 1). | v24:hb-2 (Abs. 6: „Fehlende Angaben gelten nicht als null … vorläufig oder offen … plausible schwere Folge muss geklärt werden“), v24:hb-projektblatt („Null, unbekannt und nicht zutreffend bleiben unterscheidbar“) |
| C-R7 | Spanne: Stufen von unterem und oberem Wert; gleich → fest, verschieden → vorläufig (C-R6) und Satz „Halten Sie die Spanne fest und was noch geprüft werden muss.“ | v24:hb-2 (Abs. 6: „Bandbreite und Prüfbedarf festgehalten“) |
| C-R8 | **Wesentlich**, wenn vorrangig, Entscheidungsschwelle erreicht oder Warnanlass. Dann Hinweise: „Ergänzen Sie belastbare Spannen für Kosten und Termin – oder wer welche Frage bis wann klärt.“ und „Ob die Stadt ein wesentliches Risiko trägt, entscheidet die befugte Stelle; die Projektsteuerung bereitet das vor.“ (im Beispiel: „die Bürgermeisterin“). | v24:hb-3 (Abs. 2), v24:hb-1.3 (Abs. 2), k4.4-p1, Fall |
| C-R9 | Warnanlass angekreuzt → Kasten unabhängig vom Feld: „Das wird unabhängig von der Matrix behandelt und sofort gemeldet.“ | v24:hb-3 (Abs. 3), v24:hb-4 |
| C-R10 | „Betrag schon in der Kostenprognose“ = ja/teilweise → Hinweis „Kenntlich machen und nicht noch einmal hinzurechnen.“ (keine Rechnung). | v24:hb-2 (Abs. 3), v24:hb-1 (Abs. 3: nicht mehrfach zählen) |
| C-R11 | „Puffer berücksichtigt“ = nein → Hinweis „Zählen Sie die Verschiebung am Zieltermin; eine einzelne spätere Arbeit verschiebt nicht unbedingt das Ende.“ | v24:hb-2 (Abs. 3) |
| C-R12 | Gegenmaßnahme „geplant“ → Feld bleibt, Satz „Eine geplante Maßnahme senkt die Bewertung noch nicht.“; „umgesetzt, Wirkung belegt“ → Satz „Jetzt darf die Bewertung angepasst werden – mit Begründung.“ (Werte ändert die Person selbst). | v24:hb-3 (Abs. 7), v24:hb-1.3 (Abs. 2) |
| C-R13 | Niedrige Wahrscheinlichkeit (Stufe 1–2) und höchste Auswirkung ≥ 4 → Satz „Eine niedrige Wahrscheinlichkeit allein rechtfertigt nicht, die schwere Folge auszublenden.“ | v24:hb-3 (Abs. 2) |
| C-R14 | Immer klein unter der Matrix: „Die Punkte sind keine Geldwerte und keine Freigabe.“ (= `matrix.regel`, zweiter Satz). | v24:hb-2 (Schaubild) |

### C.4 Vorbelegung (Schulcampus)

**Grenzen:** Kosten 100.000 / 500.000 / 1.500.000 / 3.000.000 €; Termin 14 / 28 / 42 / 70 Tage (Fall, Fundus „Grenzen der Risikobewertung“). **Wahrscheinlichkeit: Vorschlag 10 / 30 / 50 / 70 %** – im Fall bisher nicht festgelegt (offene Entscheidung E-1).

| Kennung | Risiko | Eingaben | Ergebnis | Quelle |
|---|---|---|---|---|
| `ris-009` *(Vorgabe)* | Holzbauelemente kommen zu spät (April 2026) | W: Stufe 4 „hoch“ (direkt, drei von vier Herstellern); Kosten unbekannt; Termin unbekannt (bis zu zehn Wochen späterer Holzbaubeginn, Puffer noch nicht geprüft); Qualität/Funktion 4; Gegenmaßnahme geplant (früher ausschreiben); Entscheidungsschwelle ja | **vorläufig**: mindestens 4 × 4 = 16 vorrangig, schlimmstenfalls vorrangig (Auswirkung 5); wesentlich; „geplant senkt nicht“ | Story 3, Fundus (W 4 · A 4 vorrangig, Qualität/Funktion 4) |
| `ris-014` | Angekündigte Mehrkosten der Haustechnikfirma (Oktober 2026) | W: Stufe 3 „mittel“; Kosten Spanne 1.000.000–1.500.000 € („gut eine Million“); Termin trifft nicht zu; Qualität trifft nicht zu; nicht in der Kostenprognose; Entscheidungsschwelle ja | **fest**: 3 × 3 = 9 gezielt bearbeiten; 1,5 Mio. liegt **genau auf der Grenze** → noch Stufe 3; wesentlich (Schwelle) | Story 5, Fundus RIS-014, vorhandenes Matrix-Beispiel (w 3, a 3) |
| `ris-021` | Kampfmittelverdacht im Baufeld der Sporthalle | W: Stufe 1 „sehr gering“; Termin: mehr als 70 Tage (Wert 90, **Vorschlag**); Kosten unbekannt; Qualität unbekannt; Warnanlass Sicherheit | **vorläufig, vorrangig** (Auswirkung 5 immer vorrangig, obwohl 1 × 5 = 5); Warnanlass-Kasten; Satz C-R13 | vorhandenes Matrix-Beispiel (w 1, a 5); Termin-Wert neu (E-2) |

**„Was wäre, wenn“-Knöpfe** (nur bei `ris-009`, alles umkehrbar): „Die zehn Wochen schlagen voll auf den Schulstart durch: 70 Tage“ → Termin Stufe 4, **genau auf der Grenze**, Feld bleibt 16 · „… 71 Tage“ → Stufe 5 → vorrangig wegen Auswirkung 5 · „Maßnahme umgesetzt, Wirkung belegt“ → Satz C-R12. Die Knöpfe sind als Annahme beschriftet („Angenommen: …“), damit keine neue Fall-Tatsache entsteht.

### C.5 Rückmeldung und Grafik

- **Messlatten** (parametrisch, neu `messlatte(grenzen, wert|spanne)`): je Reihe eine waagerechte Latte mit vier Kerben, Wert als Marke, Stufe als Ziffer; Grenzwert-Treffer mit kleiner goldener Klammer.
- **Mini-Matrix** (parametrisch, neu `miniMatrix(w, a, bereich?)`): 5 × 5, Feld markiert; bei „vorläufig“ der Bereich mindestens → schlimmstenfalls schraffiert; bei „offen“ leer mit Fragezeichen.
- Ergebnis-Gegenstand: vorrangig `warnschild` · gezielt `lupe` · beobachten `kalender` · offen `notizzettel`. Kachel: **neu `messlatte`** (Gimmick-Fassung ohne Werte).
- Häkchen an den Grenzreihen, sobald gültig.

### C.6 Druckbild (eine Seite)

Kopf („Risiko-Bewerter · <Titel>“) · Grenzen des Projekts (drei Zeilen) · Tabelle Auswirkungen (Eingabe → Stufe, mit Zustand) · Mini-Matrix + Priorität + Text „Was die Projektsteuerung veranlasst“ · Zustand (fest/vorläufig/offen) · Hinweise (höchstens acht Sätze) · Fuß. Etwa 40 Zeilen.

### C.7 Verknüpfung

- Story: **3 „Wie gefährlich ist das?“** (öffnet mit `ris-009`); **5 „Zwei Zahlen, zwei Wahrheiten“** optional (öffnet mit `ris-014`).
- Thema: **Vorgangsarten und Risikobewertung** (`vorgaenge`, k15, Abschnitte zur Bewertung).
- Explore: Querverweis zur Risikomatrix 5×5 (gleiche Stufentexte).

### C.8 Regie und Leinwand

Regie-Chips `ris-009` · `ris-014` · `ris-021` und die drei „Was wäre, wenn“-Knöpfe (gehen als `t:70`, `t:71`, `m:belegt` über `werkzeugStand`). Leinwand: Messlatten links, Mini-Matrix und Priorität rechts, groß. Regie-Notiz: „Mit 70 und 71 Tagen zeigen, dass ein Tag die Stufe kippt – und warum ‚unbekannt‘ nicht ‚null‘ ist.“ Leitfragen: „Wer legt bei Ihnen die Grenzen fest – und stehen sie irgendwo?“ · „Was tun Sie mit einer Auswirkung, die noch niemand beziffern kann?“

---

## D · Monatsbericht-Baukasten

**Zweck:** Macht aus wenigen Feldern einen Monatsbericht auf einer Seite und warnt, wenn eine Ampel ohne Entscheidungsfrage oder benötigte Reaktion dasteht.

### D.1 Ablauf

1. Beispiel `oktober` (Vorgabe) oder leer.
2. Links die Felder in der Reihenfolge des Berichts, rechts die **Vorschau der Seite** (maßstäblich verkleinert) mit Seitenmesser.
3. Jede Eingabe aktualisiert Vorschau, Seitenmesser und Hinweise sofort.
4. „Drucken“ druckt genau die Vorschau (eine Seite). Bestehen Hinweise, steht über dem Knopf „Noch n Hinweise offen“ – Drucken bleibt möglich.

### D.2 Felder

| Feld | Antwortmöglichkeiten | Grenze (Bedienregel) |
|---|---|---|
| Monat, Datenstand | Freitext (z. B. „Oktober 2026“, „Stand der Software zum Monatstermin“) | je ≤ 40 Zeichen |
| Lage in einem Satz | Freitext | ≤ 280 Zeichen |
| Ampeln Kosten · Termine · Qualität | grün · gelb · rot + ein Satz | Satz ≤ 140 Zeichen |
| Je Ampel: „gehört zu“ | Auswahl: eine der offenen Entscheidungen · benötigte Reaktion (Freitext ≤ 140) · nichts | |
| Wesentliche Veränderungen | Liste: Satz + Kennung | ≤ 4 Einträge |
| Blockierte Aufgaben | „keine“ oder Liste: Satz + Kennung | ≤ 3 |
| Kritische Maßnahmen | „keine“ oder Liste: Satz + Kennung + Stand (umgesetzt · Wirkung belegt) | ≤ 3 |
| Ungeklärte Frühwarnungen | „keine“ oder Liste: Satz + Kennung | ≤ 3 |
| Wesentliche Probleme und Änderungen | „keine“ oder Liste: Satz + Kennung | ≤ 4 |
| Offene Entscheidungen | „keine“ oder Liste: Frage + befugte Stelle + bis wann + Kennung | ≤ 3 |
| Benötigte Reaktion des Bauherrn | Freitext | ≤ 200 Zeichen |
| Eintrag dringlich? | Kästchen je Eintrag | |

### D.3 Prüfregeln

| Regel | Inhalt / Satz „So schließen Sie sie“ | Beleg |
|---|---|---|
| D-R1 | **Ampel ohne Entscheidungsfrage:** Ampel gelb oder rot und „gehört zu“ = nichts → Warnung (gelb). Satz: „Diese Ampel bleibt Beobachtung. Verknüpfen Sie sie mit einer offenen Entscheidung – Frage, wer, bis wann – oder nennen Sie die Reaktion, die Sie brauchen.“ | k2.4-p2 („Ein Ampelbericht ohne Entscheidungsfrage bleibt Beobachtung“), v24:hb-4 (Abs. 6: offene Entscheidungen und benötigte Reaktion) |
| D-R2 | Offene Entscheidung ohne befugte Stelle oder ohne Termin → Lücke. Satz: „Ergänzen Sie, wer entscheidet und bis wann.“ | v24:hb-5 (Zeile Entscheidung), v24:hb-3.1 |
| D-R3 | Eintrag ohne Kennung → Hinweis. Satz: „Verweisen Sie auf den Eintrag in der Software – der Bericht ist keine zweite Liste.“ | v24:hb-4 (Abs. 6), v24:tlb-2 |
| D-R4 | Abschnitt weder „keine“ noch Einträge → Hinweis. Satz: „Gibt es hier nichts, wählen Sie ‚keine‘ – leer und keine sind nicht dasselbe.“ *(Die Abschnitte selbst sind die Inhalte des Berichts nach dem Standard.)* | v24:hb-4 (Abs. 6), v24:hb-2 (Abs. 6, Fehlendes ist nicht null) |
| D-R5 | Eintrag als dringlich markiert → Hinweis. Satz: „Dringliches wurde sofort gemeldet; der Bericht ersetzt diese Meldung nicht.“ | v24:hb-4 (Abs. 1, 4, 6) |
| D-R6 | Kritische Maßnahme „umgesetzt“ ohne „Wirkung belegt“ → Hinweis. Satz: „Umgesetzt heißt noch nicht wirksam – nennen Sie, wann die Wirkung geprüft wird.“ | v24:hb-1.6 |
| D-R7 | **Seitenmesser:** geschätzter Platzbedarf > eine Seite → Warnung (rot). Satz: „Der Bericht passt nicht mehr auf eine Seite. Kürzen Sie oder fassen Sie Einträge zusammen.“ *(Schätzung = Bedienregel, s. D.6; die Regel „höchstens eine Seite“ ist belegt.)* | v24:hb-4 (Abs. 6, Schaubild), v24:as-2 |
| D-R8 | Fester Fußsatz im Bericht: „Die vollständigen Einträge stehen in der Software.“ | v24:hb-4 (Abs. 6: ersetzt nicht die vollständigen Einträge) |

Ampel des Werkzeugs: grün (Häkchen) „Bericht vollständig“, wenn keine Warnung und keine Lücke; gelb bei Hinweisen; rot bei D-R1, D-R2 oder D-R7.

### D.4 Vorbelegung (Schulcampus) – `oktober`

| Feld | Wert | Quelle |
|---|---|---|
| Monat, Datenstand | Oktober 2026 · Stand der Software zum Monatstermin | Fundus „Monatsbericht Oktober 2026“ |
| Lage | Die Prognose liegt bei rund 59,4 Millionen Euro, rund eine Million über dem Budget und innerhalb der Reserve; die angekündigten Mehrkosten der Haustechnikfirma stehen als Risiko daneben. | Fundus, Story 5, Thema Takt (Rechnung 58,4 + 1,0) |
| Ampel Kosten | gelb – rund eine Million über dem Budget, innerhalb der Reserve; gehört zu: benötigte Reaktion „Die Bürgermeisterin nennt dem Stadtrat diese Zahl mit Begründung, die angekündigten Mehrkosten als Risiko daneben.“ | Story 5 (gute Antwort) |
| Ampel Termine | grün – die ersten Holzelemente werden montiert. | Story 5 (Einstieg) |
| Ampel Qualität | grün – keine Einschränkung bekannt. | **neu, schlicht** (E-3) |
| Wesentliche Veränderungen | Zwei Kostenrechnungen abgeglichen: Der Unterschied sind die angekündigten Mehrkosten (`RIS-014`). · Erste Holzelemente montiert (`MAS-007`). | Story 5, Fundus |
| Blockierte Aufgaben | keine | – |
| Kritische Maßnahmen | keine | – |
| Ungeklärte Frühwarnungen | keine | – |
| Probleme und Änderungen | Mensa, die später wachsen kann: beschlossen im Juni, Umsetzung läuft (`AEN-012`). | Story 4, Fundus |
| Offene Entscheidungen | keine | Story 5 (keine Vorlage offen) |
| Benötigte Reaktion | Kenntnis; Zahl für den Stadtrat wie oben. Die Vergabestelle prüft die Mehrkosten, Ergebnis in rund vier Wochen. | Story 5 |

Ergebnis: grün, Seitenmesser etwa 60 %. Probe für die Rückmeldung: Setzt man „gehört zu“ der Kosten-Ampel auf „nichts“, erscheint sofort D-R1.

### D.5 Rückmeldung und Grafik

- **Seitenmesser** (parametrisch, neu `seitenmesser(anteil)`): Umriss einer Seite, der sich füllt; über 100 % läuft er sichtbar über (rot, mit Wort „zu lang“).
- Ampelzeile im Bericht: drei Punkte **mit Wort** (auch schwarzweiß lesbar).
- Ergebnis-Gegenstand: grün `stempel` · gelb `notizzettel` · rot `warnschild`. Kachel: **neu `berichtsblatt`** (eine Seite mit drei Ampelpunkten).

### D.6 Druckbild (eine Seite)

Der Bogen **ist** der Bericht: Kopf (`bogenKopf`: „Monatsbericht <Monat> · Schulcampus Lindenhall-Süd“, Fiktiv-Vermerk) · Lage · Ampelzeile · zwei Spalten mit den fünf Abschnitten · Kasten „Offene Entscheidungen“ (Frage · wer · bis wann) · „Benötigte Reaktion“ · Fuß (Datenstand, D-R8). Hinweise des Werkzeugs werden **nicht** mitgedruckt. Seitenmesser-Schätzung (Bedienregel): 92 Zeichen je Zeile bei 10,5 pt, 58 Zeilen Nutzhöhe abzüglich Kopf (8) → 50 Zeilen; die Feldgrenzen in D.2 halten den Höchstfall bei ≤ 50 Zeilen. Abnahme in P18.4: PDF-Probe eine Seite im Höchstfall.

### D.7 Verknüpfung

- Story: **5 „Zwei Zahlen, zwei Wahrheiten“** (öffnet mit `oktober`); Story 6 bleibt beim Werkzeug „Takt“.
- Thema: **Takt und Monatsbericht** (`takt`, k16) – am Abschnitt zum Monatsbericht.
- Explore: Querverweis zum Werkzeug „Takt“ (Karte „Jeden Monat“).

### D.8 Regie und Leinwand

Regie-Chip `oktober` und Schalter „Kosten-Ampel ohne Frage“ (`w:1`) für die Vorführung der Warnung. Leinwand zeigt die Vorschau der Seite groß und den Seitenmesser; die Warnung als Karte. Regie-Notiz: „Erst den sauberen Bericht zeigen, dann die Verknüpfung der Kosten-Ampel lösen – die Warnung erscheint.“ Leitfragen: „Wie viele Seiten hat Ihr Monatsbericht heute?“ · „Welche Ampel in Ihrem letzten Bericht hatte eine Entscheidungsfrage?“

---

## 5 Datenformat: Erweiterung von `inhalte/werkzeuge.yaml`

Neue Teile auf oberster Ebene, gleiches Muster wie die bestehenden (`titel` Pflicht, `kurz`, `text` Markdown, `belege` Pflicht, intern). Regeln und Zahlen der Rechnung stehen im Code (`src/werkzeuge/`), Texte und Beispiele in YAML. Die Matrixstufen und Qualitätsbeschreibungen nimmt C aus dem bestehenden `matrix`-Teil (keine Doppelung); die Abschlusssätze nimmt B aus `vorgaenge.arten[].abschluss`.

```yaml
vorlagencheck:
  titel: Vorlagen-Check
  kurz: Ist die Entscheidungsvorlage entscheidungsreif? Prüfen Sie es Schritt für Schritt.
  belege: [v24:hb-3, v24:hb-3.1, v24:hb-5, v24:tlb-2.1, k9.4-l1, k6.4.1-p3]
  text: |
    Eine Vorlage ist entscheidungsreif, wenn die befugte Stelle mit ihr wirklich wählen kann …
  ampel:                      # Wörter neben der Ampel
    gruen: entscheidungsreif
    gelb: noch nicht entscheidungsreif
    rot: nicht vollständig
  schritte:
    - id: rahmen
      titel: Frage und Rahmen
      punkte:
        - { id: a1, muss: true, frage: "Steht die Frage so da, dass sie mit der Wahl eines Wegs beantwortet wird?", schliessen: "Schreiben Sie die Frage so, dass die Antwort die Wahl eines Wegs ist.", belege: [v24:hb-3.1, k9.4-l1, k5.1-p2] }
        # … a2–a5
    - id: wege          # b1 wird errechnet: art: zaehlung
      titel: Wege
      punkte:
        - { id: b1, muss: true, art: zaehlung, mindestens: 2, frage: "…", schliessen: "…", belege: [v24:hb-3.1, v24:hb-1.5, v24:tlb-2.1] }
    # … vergleich, empfehlung, grundlagen
  stellen:                    # Auswahl „befugte Stelle“; entscheidet: false → Lücke (A-R4, A-R5)
    - { id: sie, titel: "Sie (Projektleitung des Bauherrn)" }
    - { id: buergermeisterin, titel: Bürgermeisterin }
    - { id: lenkungskreis, titel: Lenkungskreis, satz: "Der Lenkungskreis berät die Bürgermeisterin; entscheiden tut sie." }
    - { id: projektsteuerung, titel: Projektsteuerung, entscheidet: false, satz: "Die Projektsteuerung bereitet vor und empfiehlt; entscheiden darf sie nicht." }
  wegzustaende:
    - { id: zulaessig, titel: zulässig, zaehlt: true }
    - { id: unzulaessig, titel: unzulässig, satz: "Ein unzulässiger Weg kann auch mit vielen Punkten nicht gewinnen." }
    - { id: schein, titel: nur zum Schein, satz: "Ein Weg nur zum Schein zählt nicht als zweiter Weg." }
    - { id: ungeprueft, titel: noch ungeprüft, satz: "Lassen Sie die Zulässigkeit fachlich bestätigen, bevor verglichen wird." }
  dringlich: { frage: "…", satz: "Dringliches wird gemeldet und gesichert, bevor die Vorlage fertig ist.", belege: [v24:hb-3.1, v24:hb-3] }
  mandat:                     # nur bei geladenem Beispiel (O-46: nicht einstellbar)
    belege: [fall, k9.3-p3, v24:hb-projektblatt]
    bis: 100000               # bis einschließlich: Sie, wenn ohne Reserve
    darueber: buergermeisterin
    reserve: buergermeisterin
    satz: "Im Beispielprojekt entscheidet darüber die Bürgermeisterin: mehr als 100.000 Euro oder Geld aus der Reserve."
  beispiele:
    - id: lueftung-kurz
      titel: "Lüftungsanlage – nur das Ersatzgerät"
      quelle: k7                # intern: Story-Kapitel
      stelle: buergermeisterin
      betrag: 400000
      reserve: true
      wege: [{ titel: Ersatzgerät, zustand: zulaessig }]
      antworten: { a1: ja, a2: teilweise, a3: ja, a4: nein, a5: nein, b2: teilweise, b3: ja, c1: nein, c2: nein, c3: nein, c4: nein, d1: teilweise, d2: nein, d3: ja, e1: teilweise, e2: nein, e3: ja }
    # lueftung-voll, mensa
  regie:
    notiz: "…"
    leitfragen: ["…", "…"]

wegweiser:
  titel: Vorgangs-Wegweiser
  kurz: Vom Sachverhalt zur Vorgangsart – mit wenigen Fragen.
  belege: [v24:hb-1, v24:hb-1.1, v24:hb-1.2, v24:hb-1.3, v24:hb-1.4, v24:hb-1.5, v24:hb-1.6, v24:hb-5]
  text: |
    …
  fragen:                     # Reihenfolge und Folgen stehen im Kern (B.2); hier nur Texte
    - { id: dringlich, frage: "…", belege: [v24:hb-3, v24:hb-4] }
    - { id: handlung, frage: "…", belege: [v24:hb-1.6] }
    - { id: eingetreten, frage: "…", unklar: true, belege: [v24:hb-1.4, v24:hb-1.2] }
    - { id: anpassen, frage: "…", belege: [v24:hb-1.5] }
    - { id: moeglich, frage: "…", unklar: true, belege: [v24:hb-1.3, v24:hb-2] }
    - { id: arbeit, frage: "…", belege: [v24:hb-1.1] }
    - { id: entscheidung, frage: "…", belege: [v24:hb-1, v24:hb-3.1, k4.4-p1] }
  ergebnisse:                 # genau die sechs Arten (wie vorgaenge.arten)
    - { art: fruehwarnung, schritt: "…", festhalten: "…", belege: [v24:hb-1.2, v24:hb-5] }
    # … risiko, problem, aenderung, massnahme, aufgabe
  zusaetze:                   # B-R1 … B-R7
    sofort: { text: "…", belege: [v24:hb-4, v24:hb-3] }
    unklar: { text: "…", belege: [v24:hb-1.2] }
    entscheidung: { text: "…", belege: [v24:hb-1, v24:hb-3.1] }
    verknuepfen: { text: "…", belege: [v24:hb-1] }
  verwechslungen:
    - { id: zu-frueh-risiko, art: fruehwarnung, text: "…", belege: [v24:hb-1.2, v24:hb-2] }
    # … (B.5)
  beispiele:
    - { id: messe, quelle: k2, text: "März 2026: …", antworten: { dringlich: nein, handlung: nein, eingetreten: nein, anpassen: nein, moeglich: unklar, entscheidung: nein } }
    # … (B.6)
  regie: { notiz: "…", leitfragen: ["…"] }

risikogrenzen:
  titel: Risiko-Bewerter
  kurz: Ein Risiko mit den eigenen Grenzen des Projekts bewerten – auch wenn noch nicht alles bekannt ist.
  belege: [v24:hb-2, v24:hb-3, v24:hb-projektblatt, v24:hb-1.3]
  text: |
    …
  grenzen:                    # Vorbelegung; Prüfung C-R1 im Übersetzer und im Kern
    wahrscheinlichkeit: [10, 30, 50, 70]      # Prozent – Vorschlag, siehe E-1
    kosten: [100000, 500000, 1500000, 3000000] # Euro – Fall
    termin: [14, 28, 42, 70]                   # Kalendertage – Fall
  warnanlaesse:
    - { id: sicherheit, titel: Sicherheit }
    - { id: genehmigung, titel: Genehmigung }
    - { id: befugnis, titel: fehlende Befugnis }
    - { id: option, titel: drohender Verlust einer Möglichkeit zu handeln }
  saetze:                     # C-R2, C-R6 … C-R13 (je mit belege)
    grenze: { text: "Genau auf der Grenze – das ist noch Stufe {n}.", belege: [v24:hb-2] }
    vorlaeufig: { text: "…", belege: [v24:hb-2, v24:hb-projektblatt] }
    # spanne, wesentlich, annahme, warnanlass, prognose, puffer, geplant, belegt, selten
  beispiele:
    - id: ris-009
      kennung: RIS-009
      titel: Holzbauelemente kommen zu spät
      quelle: k3
      w: { stufe: 4 }
      kosten: unbekannt
      termin: unbekannt
      qualitaet: { stufe: 4 }
      massnahme: geplant
      schwelle: true
      waswaere:               # nur Annahmen, sichtbar mit „Angenommen: …“
        - { id: t70, titel: "Angenommen: die zehn Wochen schlagen voll auf den Schulstart durch", termin: { wert: 70 } }
        - { id: t71, titel: "Angenommen: ein Tag mehr", termin: { wert: 71 } }
        - { id: belegt, titel: "Angenommen: die Maßnahme ist umgesetzt und wirkt", massnahme: belegt }
    - { id: ris-014, kennung: RIS-014, titel: Angekündigte Mehrkosten der Haustechnikfirma, quelle: k5, w: { stufe: 3 }, kosten: { von: 1000000, bis: 1500000 }, termin: entfaellt, qualitaet: entfaellt, prognose: nein, schwelle: true }
    - { id: ris-021, kennung: RIS-021, titel: Kampfmittelverdacht im Baufeld der Sporthalle, w: { stufe: 1 }, kosten: unbekannt, termin: { wert: 90 }, qualitaet: unbekannt, warn: [sicherheit] }
  regie: { notiz: "…", leitfragen: ["…"] }

monatsbericht:
  titel: Monatsbericht
  kurz: Wenige Felder, eine Seite – und eine Warnung, wenn eine Ampel keine Frage hat.
  belege: [v24:hb-4, v24:as-2, k2.4-p2, v24:hb-5]
  text: |
    …
  abschnitte:                 # Reihenfolge und Höchstzahl (Bedienregel); Texte sichtbar
    - { id: veraenderungen, titel: Wesentliche Veränderungen, max: 4 }
    - { id: blockiert, titel: Blockierte Aufgaben, max: 3 }
    - { id: massnahmen, titel: Kritische Maßnahmen, max: 3 }
    - { id: fruehwarnungen, titel: Ungeklärte Frühwarnungen, max: 3 }
    - { id: probleme, titel: Wesentliche Probleme und Änderungen, max: 4 }
  saetze:                     # D-R1 … D-R8 (je mit belege)
    ampelOhneFrage: { text: "…", belege: [k2.4-p2, v24:hb-4] }
    # …
  beispiele:
    - id: oktober
      quelle: k5
      monat: Oktober 2026
      datenstand: Stand der Software zum Monatstermin
      lage: "…"
      ampeln:
        kosten: { farbe: gelb, satz: "…", reaktion: "…" }
        termine: { farbe: gruen, satz: "…" }
        qualitaet: { farbe: gruen, satz: "…" }
      eintraege:
        veraenderungen: [{ text: "…", kennung: RIS-014 }, { text: "…", kennung: MAS-007 }]
        blockiert: keine
        massnahmen: keine
        fruehwarnungen: keine
        probleme: [{ text: "…", kennung: AEN-012 }]
      entscheidungen: keine
      reaktion: "…"
  regie: { notiz: "…", leitfragen: ["…"] }
```

**Prüfungen im Übersetzer** (`werkzeuge/explore.mjs`, P18.1/P18.2): Titel und `belege` Pflicht je Teil; jede Regel/jeder Satz mit `belege` (Absatz-ID oder `v24:…`, Muster wie `BELEG_V24` in `werkzeuge/geschichte.mjs`, plus `fall`); Prüfpunkt-IDs eindeutig, mindestens ein `muss`; jedes Beispiel beantwortet nur bekannte Punkte/Fragen; Grenzen: vier, streng steigend, positiv, Prozent < 100; Beispielwerte im zulässigen Bereich; Wegweiser-`ergebnisse` genau die sechs `ARTEN`; Verwechslungen nur bekannte Arten; Monatsbericht-Beispiel passt in die Höchstzahlen; `regie` wandert in den Regie-Teil; alle sichtbaren Texte durch die Sichtbar-Probe und `npm run begriffe`. Zusätzlich **Selbstprobe der Beispiele**: Der Übersetzer rechnet jedes Beispiel mit dem Kern und vergleicht mit einem erwarteten Ergebnis im YAML (`erwartet: rot` bzw. `erwartet: { art: fruehwarnung }`, `erwartet: { feld: 16, zustand: vorlaeufig }`), damit Beispiel und Konzept nie auseinanderlaufen.

**Typen** (`src/inhalte/typen.ts`): `Werkzeuge` bekommt `vorlagencheck`, `wegweiser`, `risikogrenzen`, `monatsbericht` (je `WerkzeugTeil & {…}`); `regie` nicht im öffentlichen Typ. `WERKZEUGE` in `explore.ts` wird um `vorlagen-check`, `wegweiser`, `risiko-grenzen`, `monatsbericht` erweitert (Adress-Kennung ↔ YAML-Schlüssel über eine feste Tabelle). `docs/INHALTSFORMAT.md` 4.5 wird in P18.1 nach Abnahme dieses Konzepts ergänzt („fünf“ → „neun“).

---

## 6 Grafik

| Name | Art | Verwendung | Status |
|---|---|---|---|
| `stempel`, `notizzettel`, `warnschild`, `lupe`, `kalender`, `matrix`, `absperrband`, `grundriss`, `waage`, `telefon` | Gimmick | Ergebnisgegenstände A–D | vorhanden (`GIMMICKS`) |
| `klemmbrett` | Gimmick | Kachel A: Klemmbrett mit Liste und Häkchen | **neu** |
| `gabelung` | Gimmick | Kachel B: Weg, der sich in zwei Pfeile teilt | **neu** |
| `messlatte` | Gimmick | Kachel C: Messlatte mit vier Kerben | **neu** |
| `berichtsblatt` | Gimmick | Kachel D: eine Seite mit drei Ampelpunkten | **neu** |
| `werkzeugkasten` | Gimmick | Ergebnis „Maßnahme“ in B | **neu** |
| `ampel(stufe)` | parametrisch, `src/grafik/werkzeug-bilder.ts` | A, D | **neu** |
| `messlatte(grenzen, wert)` | parametrisch | C | **neu** |
| `miniMatrix(w, a, bereich?)` | parametrisch | C | **neu** |
| `seitenmesser(anteil)` | parametrisch | D | **neu** |

Alle neuen Gimmicks mit `GIMMICK_TEXT` (Bildbeschreibung) und in der Grafik-Vorschau; parametrische Grafiken mit `role="img"` und einer Beschreibung aus den Werten („Matrixfeld Wahrscheinlichkeit 4, Auswirkung 4, vorrangig, vorläufig“).

---

## 7 Rechenkerne (`src/werkzeuge/`, rein, P18.2)

```ts
// src/werkzeuge/gemeinsam.ts
export type Ampel = 'gruen' | 'gelb' | 'rot';
export interface Hinweis { id: string; schwere: 'rot' | 'gelb' | 'info'; bezug?: string }

// src/werkzeuge/vorlagen-check.ts
export type Antwort = 'ja' | 'teilweise' | 'nein';
export type Stelle = 'sie' | 'buergermeisterin' | 'lenkungskreis' | 'projektsteuerung' | 'offen';
export type WegZustand = 'zulaessig' | 'unzulaessig' | 'schein' | 'ungeprueft';
export interface Pruefpunkt { id: string; muss: boolean; art?: 'zaehlung'; mindestens?: number }
export interface VorlageEingabe {
  antworten: Readonly<Record<string, Antwort | undefined>>;   // fehlt = noch offen
  wege: readonly { titel: string; zustand: WegZustand }[];
  stelle: Stelle;
  betrag: number | null;          // null = unbekannt
  reserve: boolean | null;        // null = unbekannt
  dringlich: boolean;
}
export interface MandatsRegel { bis: number; darueber: Stelle; reserve: Stelle }   // nur Beispiel (O-46)
export interface VorlagenBefund {
  ampel: Ampel;
  zulaessigeWege: number;
  luecken: readonly Hinweis[];    // Muss-Lücken zuerst, dann Reihenfolge der Punkte
  erfuellt: readonly string[];
  offen: readonly string[];       // noch nicht beantwortet
}
export function befugteStelleImBeispiel(betrag: number | null, reserve: boolean | null, m: MandatsRegel): Stelle | null;
export function pruefeVorlage(punkte: readonly Pruefpunkt[], e: VorlageEingabe, mandat: MandatsRegel | null): VorlagenBefund;

// src/werkzeuge/wegweiser.ts
export type Art = 'aufgabe' | 'massnahme' | 'fruehwarnung' | 'risiko' | 'problem' | 'aenderung';
export type FrageId = 'dringlich' | 'handlung' | 'eingetreten' | 'anpassen' | 'moeglich' | 'arbeit' | 'entscheidung';
export type Wahl = 'ja' | 'nein' | 'unklar';
export interface Weg {
  art: Art | null;                // null = noch nicht bestimmt
  ausUnklar: boolean;             // Frühwarnung wegen „unklar“ oder „keine Art“ (B-R2)
  dringlich: boolean | null;
  entscheidung: boolean | null;
  pfad: readonly FrageId[];       // tatsächlich gestellte Fragen
  naechste: FrageId | null;       // nächste offene Frage, null = fertig
}
export function wegweiser(a: Readonly<Partial<Record<FrageId, Wahl>>>): Weg;
export function verwechslungen(art: Art, alle: readonly { id: string; art: Art }[]): readonly string[];  // höchstens zwei
export function zusaetze(w: Weg): readonly string[];   // 'sofort' | 'unklar' | 'entscheidung' | 'bewerten' | 'verknuepfen'

// src/werkzeuge/risiko-grenzen.ts
export type Stufe = 1 | 2 | 3 | 4 | 5;
export type Grenzen = readonly [number, number, number, number];
export type Wert =
  | { art: 'wert'; wert: number }
  | { art: 'spanne'; von: number; bis: number }
  | { art: 'stufe'; stufe: Stufe }            // Wahrscheinlichkeit direkt, Qualität/Funktion
  | { art: 'unbekannt' }
  | { art: 'entfaellt' };
export type GrenzFehler = 'anzahl' | 'nicht-steigend' | 'nicht-positiv' | 'ueber-100';
export function pruefeGrenzen(g: readonly number[], prozent: boolean): readonly GrenzFehler[];
export function stufeAus(wert: number, g: Grenzen): Stufe;              // Grenzwert → niedrigere Stufe
export function aufGrenze(wert: number, g: Grenzen): Stufe | null;      // Stufe, wenn genau auf einer Grenze
export function prioritaet(w: Stufe, a: Stufe): 'beobachten' | 'gezielt' | 'vorrangig';   // a = 5 → vorrangig
export interface RisikoEingabe {
  w: Wert; kosten: Wert; termin: Wert; qualitaet: Wert;
  warn: readonly string[]; massnahme: 'keine' | 'geplant' | 'belegt';
  schwelle: boolean; prognose: 'ja' | 'nein' | 'teilweise'; puffer: boolean | null;
}
export interface ProjektGrenzen { wahrscheinlichkeit: Grenzen; kosten: Grenzen; termin: Grenzen }
export interface RisikoBefund {
  stufen: { w: Stufe | null; kosten: Stufe | null; termin: Stufe | null; qualitaet: Stufe | null };   // null = unbekannt/entfällt
  zustand: 'fest' | 'vorlaeufig' | 'offen';
  feld: { w: Stufe; a: Stufe; wert: number } | null;                // mindestens
  schlimmstenfalls: { w: Stufe; a: Stufe; wert: number } | null;    // nur bei vorläufig
  prioritaet: 'beobachten' | 'gezielt' | 'vorrangig' | null;
  prioritaetSchlimmstenfalls: 'beobachten' | 'gezielt' | 'vorrangig' | null;
  wesentlich: boolean;
  aufGrenze: readonly ('wahrscheinlichkeit' | 'kosten' | 'termin')[];
  hinweise: readonly Hinweis[];
}
export function bewerteRisiko(e: RisikoEingabe, g: ProjektGrenzen): RisikoBefund;

// src/werkzeuge/monatsbericht.ts
export type Farbe = 'gruen' | 'gelb' | 'rot';
export interface BerichtEintrag { text: string; kennung: string; dringlich?: boolean; stand?: 'umgesetzt' | 'wirksam' }
export interface OffeneEntscheidung { id: string; frage: string; stelle: string; bis: string; kennung: string }
export interface Bericht {
  monat: string; datenstand: string; lage: string;
  ampeln: Record<'kosten' | 'termine' | 'qualitaet', { farbe: Farbe; satz: string; gehoertZu: { entscheidung: string } | { reaktion: string } | null }>;
  abschnitte: Record<string, readonly BerichtEintrag[] | 'keine' | null>;   // null = noch nicht ausgefüllt
  entscheidungen: readonly OffeneEntscheidung[] | 'keine' | null;
  reaktion: string;
}
export interface Umfang { zeilen: number; anteil: number; passt: boolean }   // anteil 1 = eine Seite
export function schaetzeUmfang(b: Bericht, zeichenJeZeile?: number, zeilenJeSeite?: number): Umfang;   // Vorgabe 92 / 50
export function pruefeBericht(b: Bericht, maxJeAbschnitt: Readonly<Record<string, number>>): { ampel: Ampel; hinweise: readonly Hinweis[]; umfang: Umfang };

// je Werkzeug für die Leinwand (0.3)
export function leseWerkzeugStand(roh: unknown, beispiele: readonly string[]): { beispiel: string; schritt: string | null } | null;
```

**Testplan P18.2 (Auszug, Gegenproben):** `stufeAus(1_500_000, Kosten) === 3` und `stufeAus(1_500_001, Kosten) === 4`; `stufeAus(70, Termin) === 4`, `71 → 5`; `prioritaet(1, 5) === 'vorrangig'`, `prioritaet(2, 2) === 'beobachten'`, `prioritaet(1, 4) === 'beobachten'`, `prioritaet(3, 3) === 'gezielt'`, `prioritaet(2, 5)` vorrangig, `prioritaet(5, 2) === 'vorrangig'` (10); unbekannte Kosten → `zustand: 'vorlaeufig'`, nie Stufe 1; `{art:'wert', wert:0}` → Stufe 1 und belegt; `entfaellt` zählt nicht; Grenzen `[14, 14, 42, 70]` → `nicht-steigend`; `[0, …]` → `nicht-positiv`; Prozent `[10, 30, 50, 100]` → `ueber-100`; Vorlage mit genau einem zulässigen + einem Schein-Weg → rot; Stelle Projektsteuerung → rot, auch wenn alles „ja“; alle „ja“ + zwei zulässige Wege → grün; Wegweiser: `eingetreten: 'unklar'` → Frühwarnung, `handlung: 'ja'` → Maßnahme ohne weitere Fragen, Alles-Nein → Frühwarnung mit `ausUnklar`; Bericht: gelbe Ampel ohne `gehoertZu` → rot; mit Reaktion → kein D-R1; Höchstfall aller Felder → `passt: true`, ein Zeichen über allen Feldgrenzen → Feldgrenze greift in der Oberfläche. Mutanten-Probe (`werkzeuge/mutanten.mjs` erweitern): `<=`→`<` in `stufeAus`, Vorrang A5 entfernt, `unbekannt` als 1, Muss-Regel entfernt, `unklar`-Zweig entfernt, D-R1 entfernt – jede Mutante muss einen Test rot machen.

---

## 8 Offene Entscheidungen (mit Vorschlag)

| Nr | Frage | Vorschlag |
|---|---|---|
| E-1 | Prozentgrenzen der Wahrscheinlichkeit fehlen im Fall. | **10 / 30 / 50 / 70 %** in die Fundus-Tabelle von `inhalte/fall.md` aufnehmen (Zeile „Grenzen der Risikobewertung“); die Beispiele wählen die Stufe direkt, sodass keine Prozentzahl als Fall-Tatsache erscheint. L-Eintrag. |
| E-2 | `ris-021` braucht für „Auswirkung 5“ eine belegte Zeile; der Fall nennt keine. | Termin **90 Tage** (über der vierten Grenze), Kosten und Qualität unbekannt, Warnanlass Sicherheit; in den Fundus aufnehmen. Alternative: `ris-021` weglassen und Auswirkung 5 nur über den Knopf „71 Tage“ zeigen. |
| E-3 | Kleine neue Beispielangaben: „Datenstand Mai 2027“ (A, `lueftung-voll`), „Qualität grün – keine Einschränkung bekannt“ (D, `oktober`). | Übernehmen und im Fundus vermerken; sie widersprechen der Story nicht. |
| E-4 | Muss-Punkte in A (rot vs. gelb). Der Standard nennt ausdrücklich nur „zweite zulässige Option oder andere wesentliche Grundlage“. | Muss = Frage, Stelle, Termin, zwei zulässige Wege, abgestimmte Kriterien, begründete Punkte, Empfehlung, Beschluss offen, Datenstand (9 von 18; B1 wird aus der Wegeliste errechnet, die übrigen 17 sind anklickbar); Fachtreue-Agent soll das ausdrücklich prüfen. |
| E-5 | Startbeispiel A: falsche oder richtige Vorlage zuerst? | **`lueftung-kurz` (rot)** – sofortige Rückmeldung (O-59 (3)); D startet dagegen sauber (grün), die Warnung zeigt der Regie-Schalter. |
| E-6 | „0“ bei einer Auswirkung. | belegter Wert, Stufe 1 (folgt aus „bis zur ersten Grenze = Stufe 1“); sichtbar „0 – keine Mehrkosten“, getrennt von „unbekannt“ und „trifft nicht zu“. |
| E-7 | Spanne über eine Stufengrenze (C-R7). | vorläufig mit Bereich mindestens/schlimmstenfalls, keine Mittelung (v24:hb-3 Abs. 4: Einschätzungen nicht mitteln). |
| E-8 | Kanal Regie→Leinwand: Freitext übertragen? | **Nein**, nur Beispiel-Kennung und Schritt (`werkzeugStand`); `Buehne` bleibt `v: 1`, neues Feld optional, alte Stände gelten weiter. |
| E-9 | Pfeiltasten der Regie in A/B. | erst durch die Schritte, am Ende zum nächsten Werkzeug. |
| E-10 | Wort „Projektblatt“ sichtbar? | Nein – „die Grenzen, die der Bauherr für das Projekt festlegt“ (Wort auf der Seite nicht eingeführt). |
| E-11 | Kachelreihenfolge und Zahl auf der Startseite. | Geschwister-Reihenfolge (Abschnitt 0); Startseite/Einleitung „neun Werkzeuge“ in P18.5. |
| E-12 | Druck mit offenen Hinweisen. | erlaubt; Hinweise werden nicht mitgedruckt (D) bzw. als Lückenliste gedruckt (A, C), weil dort die Lücken das Ergebnis sind. |
| E-13 | Story-Verweise: zwei je Werkzeug (A: 7 + 4, B: 2 + 6, C: 3 + 5, D: 5)? | Ja; braucht ein neues optionales Feld `werkzeug: { id, beispiel }` in den Kapitel-YAMLs (Übersetzer `werkzeuge/geschichte.mjs`) und `werkzeuge: [..]` in den Kopfdaten der Themen – Umsetzung in P18.5. |
