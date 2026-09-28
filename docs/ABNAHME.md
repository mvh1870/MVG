# Abnahme-Checkliste für den Owner

Zum Abhaken beim Durchsehen von `dist/mvg.html` (Anleitung: `docs/ANLEITUNGEN.md`). Jede Zeile nennt, woran man es sieht; in Klammern der Entscheid. Was nicht passt, als Frage in `OWNER-FRAGEN.md` oder direkt als Änderungswunsch.

## A. Fachliche Abnahme (entscheidet über den Vermerk)
- [ ] Theorie: je Kapitel Kernaussage und Abschnitte gelesen; nichts behauptet, was der MVG-Originaltext nicht sagt (O-17). Stichprobe: „Zitieren“ an drei Absätzen, Angabe stimmt.
- [ ] Story: je Welt zwei Stationen in einer Rolle gespielt; Optionen, Konsequenzen und Belege (Ebene 4, Absatz-ID) fachlich korrekt (O-4, O-17).
- [ ] Begriffe: LPH 0–9, nie G0–G5; Änderungsgremium, Entscheidungsvorlage, Freigabe / keine Freigabe / Freigabe mit Auflagen (O-14, O-15). Begriffs-Kompass (Kap. 13) als Lesehilfe in Ordnung.
- [ ] Einwand-Karten (10) und Regie-Notizen: Antworten tragen, nichts klingt nach Vertrieb (O-1).
- [ ] Selbstdiagnose ohne Punktzahl, Hinweis auf die Reifegradanalyse als BM-Methode (O-8).
- [ ] Fall fiktiv und überall so gekennzeichnet (O-3).
- [ ] Korrekturliste V1.3 (`docs/KORREKTURLISTE-V1.3.md`) gesichtet.
- [ ] Abbildungen (O-32, L-77): alle 13 in Explore › Grafik-Galerie › Abbildungsverzeichnis geöffnet; jede im Bild angeglichene Beschriftung („Im Bild an die Begriffe des Texts angeglichen …“) und jede aufgeführte Abweichung vom Text gesichtet – die Überdeckungen sind Änderungen an den eigenen Grafiken. Stimmen die Plätze auf den Lernseiten, und sollen abb-10, abb-12 und abb-13 (widersprechen einer Regel, die ihre Lernseite lehrt, L-82) nur im Originaltext stehen?
- [ ] Hilfe (O-31): Aufteilung wie im Companion, Begriffe nach MVG, Korrekturen in `docs/KORREKTURLISTE-COMPANION.md` gesichtet.
- [ ] **Danach:** Vermerk „fachlich ungeprüft“ entfernen lassen (Owner-Entscheid; der Lauf nimmt ihn nicht selbst weg, O-24).

## B. Erlebnis
- [ ] Startseite ruhig, genau zwei Wege (O-21), Stil wie Variante B „Leitstand“ (O-22).
- [ ] Story-Hauptpfad in 25–35 Minuten (O-5); Express-Pfad kürzer.
- [ ] Dramaturgie: Welt A bis zur Eskalation → Wendepunkt → Rückspulen → Welt B → Wirklichkeit → drei Enden → Epilog mit Resümee (O-2, O-7).
- [ ] Rolle bestimmt Perspektive (Mails, Optionen, Linse) in allen sechs Rollen (O-4).
- [ ] Figuren, Humor, Requisiten angemessen (O-6); Farben (O-11); Schriften (O-12).
- [ ] Diagramme nativ und klickbar (O-13); dazu die Originalabbildungen als Bild mit Bildunterschrift, vergrößerbar (O-32); Grafik-Galerie in Explore.
- [ ] Explore nach dem Ende freigeschaltet; Werkzeuge nennen je Regel die Absatz-ID (L-51).

## C. Termin mit Regie und Leinwand (O-9)
- [ ] Zwei Fenster: Regie am Laptop, Leinwand am Beamer; Verbindung grün, Leinwand zeigt nie Notizen, Leitfragen, Protokoll.
- [ ] Springen, Rolle umschalten, Kundenwahl per a–d, Beamer-Schalter, Ein-Fenster-Modus mit Esc.
- [ ] Langer Tafelinhalt (z. B. Epilog-Resümee im Beamer) und lange Lernseite: mit „Rollen ↓“ bzw. ↓ bis ans Ende, mit ↑ zurück; die Vorschau zeigt dieselbe Stelle. Im Bereich Theorie blättert „Weiter“ zum nächsten Kapitel, die Story bleibt stehen.
- [ ] Protokoll drucken (eine Seite bei kurzem Protokoll).

## D. Geräte (O-10)
- [ ] Chrome oder Edge, Safari, Firefox: Start, eine Station, eine Lernseite.
- [ ] Beamer 16:9, iPad quer, Smartphone lesbar.

## E. Auslieferung
- [ ] `dist/mvg-kunde.html` ohne Regie-Notizen (Test `tests/bau.test.ts`), für Website/Versand (L-7).
- [ ] Einbettung auf einer Testseite (`tests/oberflaeche/einbettung-host.html` als Vorlage).
- [ ] Größe < 4 MB, offline, deterministisch (Kette: `bau --pruefe`).
- [ ] Impressum: Herausgeber, Fassung, Änderungsstand, Links auf 5.5 und 7.6 (O-23).

## F. Übergabe
- [ ] Zweig `claude/haus` nach `main` zusammenführen (O-25).
- [ ] Routine anhalten, wenn das Planblatt leer ist (Ampel rot „fertig“, O-27).
