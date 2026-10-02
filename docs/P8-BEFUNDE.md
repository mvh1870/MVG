# Prüfung Phasenende P8 (Explore) – 2026-09-28

Einzelprüfungen während des Baus: Simulator und Rückbezüge (7 + 1), Vorher/Nachher-Welten (4). Am Phasenende zwei Agenten: Inhalt (Fachtreue, Begriffe, Verständlichkeit, Vollständigkeit; 9 Befunde) und Technik (Architektur, Stil/Barrierefreiheit, Tests; 21 Befunde, 1 schwer). Status: `[ ]` offen · `[x]` erledigt · `[-]` verworfen (Grund).

## Inhalt (I)
- [x] I1 Galerie-Kachel verspricht nur, was die Galerie zeigt.
- [x] I2 Diagramme der Geschichte in der Galerie (mit Station); nicht als Kopie, weil sie mit dem Fall arbeiten (L-52).
- [x] I3 Sandbox zeigt die verantwortliche Rolle je Register (k6.4.2-t1, Muster).
- [x] I4 Freigabe zum Abschluss einer Leistungsphase ist nicht Teil der Sandbox – im Grenztext und L-52 gesagt.
- [x] I5 Simulator: überschrittene Schwelle lässt die Stufe offen (auch auf Gremiumsstufe), die Leiter markiert dann keine Stufe.
- [x] I6 Keine „Risikoeinschätzung“ ohne Schwelle im Whitepaper; „Handlungsmöglichkeiten“ = nächster Schritt (L-52).
- [x] I7 Kein erfundener Problemstatus; „ggf. Entscheidung“ bleibt nach der Maßnahme möglich.
- [x] I8 Explore-Einstieg aktualisiert.
- [x] I9 Satz zum Mandat mit eigener Quelle k3.2-t1.

## Technik (T)
- [x] S1 (schwer) Sandbox verlor den Fokus nach Schritten ohne Folgeschritt → Fokus auf neuen Eintrag bzw. den Eintrag selbst (`tabindex=-1`); im Szenario geprüft.
- [x] M1 Live-Regionen: Zeitmaschine zeichnet nur beim Monatswechsel; Welten und Galerie ohne große Live-Region, kurze Statusmeldung über die neue `wahlleiste`.
- [x] M2 Zeitmaschine: Welt A als Ring über Welt B – gleiche Werte bleiben sichtbar; Legende entsprechend.
- [x] M3 Schrift im Diagramm 13 px (≥ 12 px bei 400 px), x-Achse mit Titel „Monat“ aus den Wörtern.
- [x] M4 Zielgrößen ≥ 36 px (Sandbox-Schritte, Regler, Quellen- und Tabellen-Aufklapper).
- [x] M5 `stationsName` einmal in `src/ui/anzeige.ts` (mit Enden-Regel L-46) – behebt auch „Ende“ im Glossar-„Kommt vor in“.
- [x] M6 siehe I5, mit Test auf Gremiumsstufe.
- [x] M7 Statuswörter außerhalb k6.4.4-p1 mit Quelle (`STATUS_QUELLE`), Test über alle erreichbaren Zustände.
- [x] M8 Explore nicht auf der Leinwand, P9.4 wirkt auf die Story (L-53, Notiz im PLAN).
- [x] M9 Abbildungsverzeichnis ohne erfundene Nummern (Reihenfolge im Text), Stelle als Permalink.
- [x] M10 Tests: Welten-Compiler (doppelt, Pflichtfelder, ohne Datei), Explore ohne Welten, Sandbox- und Simulator-Grenzfälle, Fokus nach Endschritten.
- [x] L1 Werkzeugkarten aus den tatsächlich gezeichneten Flächen.
- [x] L2 gemeinsame `wahlleiste` statt doppeltem Knopf-Muster.
- [x] L3 `STUFEN` aus `engine/status.ts`.
- [x] L4 nur neue Sandbox-Einträge blenden ein.
- [x] L5 Merkmale der Lage als `fieldset` mit `legend`.
- [x] L6 Kontrastpaare (`--tinte` auf `--flaeche-2`, `--koralle-soft`, `--tuerkis-soft`) in paare.json und STIL.
- [x] L7 Figuren und Story-Karte in einem Abschnitt, Besetzung zuerst.
- [x] L8 ARCHITEKTUR nennt Simulator, Sandbox und Explore als Nutzer der Grafiken.
- [x] L9 Entscheidungsbedarf je Quelle nur einmal.
- [x] L10 `npm run inhalte` zählt die Welten-Aspekte.
