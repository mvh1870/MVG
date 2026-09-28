# Übergabe

Kopf ≤ 100 Zeilen. Oben JETZT (überschreiben), darunter FRÜHER (anhängen, knapp).

## JETZT
- **Stand 2026-09-28 07:31 UTC (+00:00): Planblatt leer – der Bau ist fertig.** Letzte Posten: P11.3 Korrekturschleife (fünf Runden, zuletzt zwei Runden hintereinander ohne schwere oder mittlere Befunde, L-64; `docs/P11-BEFUNDE.md` R1–R5) und P11.4 Abschluss.
- **Für den Owner, in dieser Reihenfolge:**
  1. Routine anhalten (sonst kommt der nächste Block nach Plan; er fände ein leeres Planblatt).
  2. `claude/haus` nach `main` zusammenführen (Merge, kein Force). Der Lauf pusht nie auf `main`.
  3. Abnahme nach `docs/ABNAHME.md` (A Fachlich, B Erlebnis, C Termin mit Regie/Leinwand, D Geräte); Bedienung in `docs/ANLEITUNGEN.md`. Datei zum Öffnen: `dist/mvg.html` (Arbeitsfassung mit Regie-Notizen) bzw. `dist/mvg-kunde.html` (Kundenfassung ohne Notizen, L-58). Beide laufen offline per Doppelklick.
  4. Nach der fachlichen Abnahme (ABNAHME A) den Vermerk „fachlich ungeprüft“ entfernen lassen (O-24; der Lauf nimmt ihn nicht selbst weg).
  5. Owner-Frage 2026-09-28-1 (Lesezeit, O-5): Vorgabe a (kürzen) ist umgesetzt; Frist 14:43 UTC. Ohne Antwort gilt die Vorgabe – die Zeile „VORGABE IN KRAFT“ hängt der nächste Block an, falls die Routine noch läuft.
- **Messwerte:** Lesezeit alle sechs Rollen Hauptpfad 33,8–34,2 min (O-5: 25–35), Express 14,8–15,0 min (Ziel ≤ 15; Messung L-61/L-65, Pflicht in der Kette). Datei 1,9 MB (< 4 MB), deterministisch, ohne Netzzugriff.
- **Prüfungen:** lokale Kette grün auf 41fb789 (≈ 420 s); GitHub-Aktion (volle Kette, alle Rollen × Größen) **grün auf dem Abschluss-Commit 41fb789 (Lauf 89)**, davor 356b687 (Lauf 87). Lauf 80 war rot (Lesezeit-Szenario unter Last), behoben in 101fc2e.
- **Was steht:** Startseite (zwei Wege, O-21); Story vollständig (Prolog, A1–A6, Wendepunkt, Rückspulen, B1–B6, Wirklichkeit, 3 Enden, Epilog; 6 Rollen, 96 Rollenszenen, Express) aus `inhalte/`; 13 Lernseiten mit Originaltext (Abdeckung 155/155), Wissenschecks Kap. 2–12, Glossar + Begriffs-Kompass, Zitieren/Permalinks, Impressum mit Quellenverzeichnis, Druck; Explore (Simulator, Welten, Sandbox, Zeitmaschine, Galerie); Regie + Leinwand; Einbettung, Klänge (aus), Kundenfassung.
- **Bekannt und bewusst so:** Safari/Firefox/iPad nur vom Owner prüfbar (ABNAHME D, L-60); Regie der Kundenfassung bedienbar ohne Notizen (L-58); Korrekturliste für V1.3 in `docs/KORREKTURLISTE-V1.3.md`, Re-Import mit `werkzeuge/reimport.mjs`.
- Rechner: Node v22.22.2, vorinstalliertes Chromium 141 unter `/opt/pw-browsers/chromium` (L-15).

## FRÜHER
- 2026-09-26: Acht Fragerunden mit dem Owner, drei Stilprototypen (A Bühne, B Leitstand, C Reportage), Owner wählt B. Analysen der Schwesterprojekte in `docs/recherche/`.
- 2026-09-26/27: P0 lokal gebaut mit parallelen Agenten (Whitepaper-Quelle, Marke/Stil, Bau/Kette, Engine/Inhalte/Kanal), Durchstich, vier Prüf-Agenten (Architektur, Fachtreue, Begriffe, Stil): 64 Befunde, 60 behoben, 3 als L-7…L-10 entschieden, 1 teilweise (L-8).
- 2026-09-27: Erster Cloud-Block: Zweig `claude/haus` angelegt, P0.8 abgehakt, Browser-Rückfall auf vorinstalliertes Chromium (L-15).
- 2026-09-27 (Cloud-Block 1, 07:47–09:42 UTC): P0.8, P1.1–P1.5; Kette 191–200 s mit Browser.
- 2026-09-28 (Cloud, bis 2026-09-28 07:31 UTC): P11.5/P11.6 Kürzung auf O-5 und Wissenschecks; P11.3 fünf Korrekturrunden (21/17/12/5/7 Befunde, zuletzt nur leichte); P11.4 Abschluss.
