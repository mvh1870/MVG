# Prüfung Phasenende P5 (Welt B) – 2026-09-27

Zwei Prüf-Agenten: Inhalt quer über B1–B6 (Dramaturgie, Rollen, Fachtreue-quer; 21 Befunde, 1 schwer) und Technik (Architektur, Stil/Barrierefreiheit, Vollständigkeit; 11 Befunde). Die Stationen selbst waren je einzeln auf Fachtreue/Begriffe geprüft (P5.2–P5.7). Status: `[ ]` offen · `[x]` erledigt · `[-]` verworfen (Grund).

## Inhalt (I)
- [x] I1 (schwer) Datenstand bleibt Mai–November „Version 3“ → L-42: „Kostenprognose 2026-10 · Version 4“ (enthält AEN-012, AEN-022, AEN-031) gilt ab Oktober; B5 nennt Version 3 mit „Version 4 in Arbeit“, B6 Version 4; fall.md ergänzt. Status-start bleibt wie im DREHBUCH.
- [x] I2 ENT-017 wird in B4 nachvollziehbar aufgelöst (Juni, Änderungsgremium, AEN-022, Zielpriorität vom Bauherrn).
- [x] I3 Deckung von AEN-031 in B5 als offene Frage sichtbar (Lage, unbekannt, Regie).
- [x] I4 RIS-009 in B2-Rollendateien → FRW-001 (L-36).
- [x] I5 Lieferzeit wird `FRW-002` (die Marktnotiz aus B1 kann FRW-001 sein); B3-Vertiefung risiko nimmt die Marktnotiz auf.
- [x] I6 B5/bauherr, gf, planung: Vorlage „in Vorbereitung“, nicht „liegt auf dem Tisch“.
- [x] I7 B6-Rückbezüge: nichts als erledigt, was die Station offen hält; „benannte“ statt „geregelte“ Stellvertretung.
- [x] I8 B3: jede Rolle bekommt eine Frage am Schritt „mandat“ (bisher nur die PL).
- [x] I9 Express-Karten „Was dazwischen geschah“ vor B3 und B6 (DREHBUCH §2, H17, D16) – neuer Container `express` (L-43).
- [x] I10 B1/controlling, B4/controlling: Schwellenwerte je Kostengruppe nicht voraussetzen.
- [x] I11–I20 Wortlaut (B6/ps Stadtratsanfrage, B6/pl und B5/pl, gf: Entscheidung des Bauherrn nicht vorwegnehmen, B5 TGA-Nachtrag im Risikoregister beobachtet, B5 „betroffene Freigabe“, B5/controlling Datenstand, B1/bauherr Stellvertretung, Wiederholungen der Merksätze/Kennzahlen/Ebene-2-Einstiege, „Freigaberegister“, PMO erklären, Backticks im Optionstitel).
- [x] I21 B1: Rhythmus und Register in einem Schritt.

## Technik (T)
- [x] T1 Spur: lange Kurzformen laufen in der schmalen Seitenleiste über → Umbruch im Flex-Kind.
- [x] T2 RACI: die Spalte der gespielten Rolle steht direkt hinter der Entscheidung.
- [x] T3 Phasen/Rhythmus: „hier steht der Fall“ auch für Screenreader am Knopf.
- [x] T4 Szenario: Ebenen 2–4 je Station öffnen.
- [-] T5 alle 18 Kombinationen Rolle × Größe: Laufzeit (je Rolle rund 1,5 min) → 1280 alle sechs, 1024 und 400 je drei (zusammen jede Rolle außerhalb des Desktops), L-43.
- [x] T6 Express: Prüfung an jeder Station.
- [x] T7 Stand vor B1 mit Interessen (Vertiefungen in Welt B geprüft); Entwurfsfehler brechen das Szenario ab.
- [x] T8 `erwarteNicht` wartet kurz; Zahl der Läufe = Zahl der Aufträge.
- [x] T9 Unit-Tests: Formen rhythmus/karten, Phasen-Wahl mit Screenreader-Hinweis, RACI-Zeilenwahl und eigene Spalte, Compiler (hervor, vorlage ohne Kennung, Gliedart problem), Spur-Neuzeichnen mit „umentschieden“ (Gegenprobe: ohne Spur im Cache-Schlüssel rot). Signal-Szene: im Browser (B2 muss die Register-Tafel zeigen). „B ohne Partner“ kommt im Graph nicht vor.
- [x] T10 Szenario prüft die Seiten der Spur (A links, B rechts).
- [x] T11 PLAN P7: Epilog „A-Spur gegen B-Spur“ (E1-Rest aus L-41).

## Runde 2 (Nachprüfung Inhalt)
Alle 21 bestätigt behoben, Abweichungen des Autors vertretbar; 5 neue leichte Befunde (B6 „seit Mai“, B6-Express ohne ENT-017, B5-Status „niedrig“, B5-Regie nimmt AEN-031 vorweg, B4-Kennzahl „ohne Frage und Frist“) – im Commit nach „MVG P5.9“ behoben.
