# Übergabe

Kopf ≤ 100 Zeilen. Oben JETZT (überschreiben), darunter FRÜHER (anhängen, knapp).

## JETZT
- **Stand 2026-09-29 16:05 UTC (+00:00): Planblatt nicht leer.** Offen: P12.5 (Gesamtprüfung, Schleife nach L-64 – Runde 27 sauber (L-98), Runde 28 mit 3 mittleren Stil-Befunden, eingearbeitet (L-99, L-100) – Zählung neu; als Nächstes Runde 29) und P14 (Abbildungen im Fachtext, O-32: P14.1/P14.2 in Arbeit, P14.3 Prüfung). Die Routine läuft weiter bis zum leeren Plan (O-27).
- **Neu seit dem letzten Abschluss (Owner im Chat):** O-31 Hilfe (P13, fertig) und O-32 Abbildungen der DOCX im Fachtext (P14): 13 Abbildungen im Originaltext an ihrer Stelle, 10 davon auch auf der Lernseite (abb-10, abb-12, abb-13 widersprechen einer Regel ihrer Lernseite, L-82); verbotene Beschriftungen im Bild durch Begriffe des Texts überdeckt, Bildunterschrift „Wo sie vom Text abweicht, gilt der Text“, Abweichungen aufklappbar, Vergrößern, Permalink `#theorie/kN/abb-N`, Verzeichnis in Explore (L-77, L-80). Werkzeug `werkzeuge/abbildungen.mjs` (Chromium, deterministisch), Beschreibungen `inhalte/abbildungen/abb-N.yaml`.
- **Letzte Runden P12.5:** R9 (L-76, L-78), R10 (L-79), R11 (L-80), R12 (L-82, L-83), R13 als Workflow mit Gegenprüfung (L-84), R14 (L-85), R15 (L-86), R16 (L-87), R17 (L-88), R18 (L-89), R19 (L-90), R20 (L-91), R21 (L-92), R22 (L-93), R23 (L-94), R24 sauber (L-95), R25 (L-96), R26 (L-97), R27 sauber (L-98), R28 (L-99, L-100); Protokoll `docs/P12-BEFUNDE.md`.
- **GitHub-Aktion (Chrome 153, volle Kette):** war seit Lauf 142 (Runde 18) rot, unbemerkt: Galerie-Wortbruch bei 320 px (overflow-wrap:anywhere, L-99) und Lauf 153 Lesezeit ps 35,1 min; beides behoben – Ergebnis des nächsten Laufs hier eintragen. Nach jedem Push das Ergebnis lesen.
- **Messwerte:** Lesezeit pl Hauptpfad 34,6 min, Express 14,7 min (O-5); `dist/mvg.html` 3,41 MB (85 % von 4 MB), Kundenfassung 3,36 MB; deterministisch, ohne Netz.
- **Für den Owner (wenn der Plan leer ist):** Routine anhalten; `claude/haus` nach `main` zusammenführen (Merge); Abnahme nach `docs/ABNAHME.md` – neu: jede im Bild angeglichene Beschriftung und jede Abweichung der 13 Abbildungen sichten; danach Vermerk „fachlich ungeprüft“ entfernen lassen (O-24).
- **Arbeitsweise dieses Blocks:** Commits nur mit grüner Kette; laufen parallel Agenten im Arbeitsbaum, wird die Kette auf einer Kopie gefahren und genau dieser Stand committet (eigener Index), damit nichts Ungeprüftes in den Commit rutscht.
- Rechner: Node v22.22.2, vorinstalliertes Chromium 141 unter `/opt/pw-browsers/chromium` (L-15). Kette ≈ 500–550 s.

## FRÜHER
- 2026-09-26: Acht Fragerunden mit dem Owner, drei Stilprototypen (A Bühne, B Leitstand, C Reportage), Owner wählt B. Analysen der Schwesterprojekte in `docs/recherche/`.
- 2026-09-26/27: P0 lokal gebaut mit parallelen Agenten (Whitepaper-Quelle, Marke/Stil, Bau/Kette, Engine/Inhalte/Kanal), Durchstich, vier Prüf-Agenten (Architektur, Fachtreue, Begriffe, Stil): 64 Befunde, 60 behoben, 3 als L-7…L-10 entschieden, 1 teilweise (L-8).
- 2026-09-27: Erster Cloud-Block: Zweig `claude/haus` angelegt, P0.8 abgehakt, Browser-Rückfall auf vorinstalliertes Chromium (L-15).
- 2026-09-27 (Cloud-Block 1, 07:47–09:42 UTC): P0.8, P1.1–P1.5; Kette 191–200 s mit Browser.
- 2026-09-28 (Cloud, bis 2026-09-28 07:31 UTC): P11.5/P11.6 Kürzung auf O-5 und Wissenschecks; P11.3 fünf Korrekturrunden (21/17/12/5/7 Befunde, zuletzt nur leichte); P11.4 Abschluss.
- 2026-09-28 (Cloud, ab 07:31 UTC): Owner-Sichtung O-28–O-31 (P12 Story aus Bauherrensicht, Theorie neu, Hilfe P13); P12.5 Runden 1–11; ab 20:55 UTC O-32 Abbildungen (P14) mit Workflow (13 Autoren, unabhängige Prüfung, Nachbesserung, Feinschliff).
