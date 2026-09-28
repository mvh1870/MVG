# Übergabe

Kopf ≤ 100 Zeilen. Oben JETZT (überschreiben), darunter FRÜHER (anhängen, knapp).

## JETZT
- **O-27 (Owner, 2026-09-27):** weiterarbeiten, bis das Planblatt leer ist; nicht wegen Zeit/Zugzahl hinlegen. Sparsam mit Agenten.
- Stand 2026-09-28 02:09 UTC (+00:00): **P0–P10 fertig, P11.1 und P11.2 erledigt.** Offen: P11.5 (Story auf O-5 straffen, Lesezeit messen), P11.6 (Wissenschecks auf den Lernseiten), P11.3 (Korrekturschleife), P11.4 (Abschluss).
- Was steht: Startseite (zwei Wege, O-21); Story vollständig (Prolog, A1–A6, Wendepunkt, Rückspulen, B1–B6, Wirklichkeit, 3 Enden, Epilog; 6 Rollen, 96 Rollenszenen, Express) aus `inhalte/`; 13 Lernseiten mit Originaltext (Abdeckung 155/155), Glossar + Begriffs-Kompass (Kap. 13), Zitieren/Permalinks, Impressum mit Quellenverzeichnis, Druck (Kapitel, alle, Dossier); Explore (Simulator, Welten, Sandbox, Zeitmaschine, Galerie); Regie + Leinwand (Notizen, Leitfragen, Einwände, Protokoll, Beamer, Ein-Fenster, Als Nächstes); Einbettung, Klänge (aus), Kundenfassung `dist/mvg-kunde.html`.
- Prüfungen: lokal `pruefe:voll` grün (927 s, auf 8acbff0), Lauf mit reduzierter Bewegung voll grün (25 Läufe), Kette auf dem neuen Stand grün. Befundlisten `docs/P*-BEFUNDE.md`, zuletzt P10 (31) und P11 (12).
- **Offener Befund GitHub-Aktion:** Läufe 69–71 (2740e07, 58705fc, 8acbff0) rot, jeweils nur axe `target-size` an der Einwand-Karte bei 400 px (Chromium 153; lokal 141 ohne Fund). Abstand auf 12 px erhöht (868249b) – am Lauf dazu nachsehen; bleibt es rot, Zielgröße der Karte selbst prüfen.
- Rechner: Node v22.22.2, vorinstalliertes Chromium 141 unter `/opt/pw-browsers/chromium` (`npx playwright install` scheitert mit 403, L-15). `MVG_BEWEGUNG=reduziert` schaltet einen Lauf mit reduzierter Bewegung.
- Wichtige Schnittstellen: `werkzeuge/whitepaper-lib.mjs`, `werkzeuge/inhalte.mjs` (kompiliere), `werkzeuge/reimport.mjs`, `werkzeuge/bau.mjs` (beide Dateien), `src/engine/aktionen.ts` (wende), `src/regie/*`, `src/grafik/*`, `src/ui/druck.ts`, `src/ui/einbettung.ts`, Test-Haken `data-pruef="…"`.
- Merker: Whitepaper-Zitate behalten „EW“ und „5 Mio. EUR“ (BEGRIFFE.md); Korrekturliste V1.3 steht (E13).

## FRÜHER
- 2026-09-26: Acht Fragerunden mit dem Owner, drei Stilprototypen (A Bühne, B Leitstand, C Reportage), Owner wählt B. Analysen der Schwesterprojekte in `docs/recherche/`.
- 2026-09-26/27: P0 lokal gebaut mit parallelen Agenten (Whitepaper-Quelle, Marke/Stil, Bau/Kette, Engine/Inhalte/Kanal), Durchstich, vier Prüf-Agenten (Architektur, Fachtreue, Begriffe, Stil): 64 Befunde, 60 behoben, 3 als L-7…L-10 entschieden, 1 teilweise (L-8).
- 2026-09-27: Erster Cloud-Block: Zweig `claude/haus` angelegt, P0.8 abgehakt, Browser-Rückfall auf vorinstalliertes Chromium (L-15).
- 2026-09-27 (Cloud-Block 1, 07:47–09:42 UTC): P0.8, P1.1–P1.5; Kette 191–200 s mit Browser.
