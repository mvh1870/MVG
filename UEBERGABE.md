# Übergabe

Kopf ≤ 100 Zeilen. Oben JETZT (überschreiben), darunter FRÜHER (anhängen, knapp).

## JETZT
- Stand 2026-09-27: **P0.1–P0.7 erledigt**, Kette grün (inhalte · typen · test 175 · begriffe · bau 904 kB deterministisch · oberflaeche 6 Läufe). Offen: **P0.8** (GitHub-Remote, Cloud-Paket, Routine – Owner-Schritte).
- Was steht: Startseite (zwei Wege), Story Prolog → A3 → Weltregler → B3 nur für Rolle Bauherren-PL (die übrigen 5 Rollen „folgt“), Theorie-Liste + Kap. 1, Regie + Leinwand (zwei Fenster, BroadcastChannel), Whitepaper-Quelle mit Absatz-IDs, Stil aus Variante B, Prüfkette mit Browser.
- Erster Cloud-Block: zuerst P0.8 abhaken (siehe Planblatt) und die Messwerte des frischen Rechners hier eintragen; das Ergebnis der GitHub-Aktion `pruefe` für `main` nachsehen, sobald erreichbar.
- Nächster Posten für die Cloud: **P1.1 Abdeckungskarte** (dann P1.2 Fall-Bibel, P1.3 Stationsgerüst, P1.4 Entscheidungsgraph, P1.5 Prüfung).
- Wichtige Schnittstellen: `werkzeuge/whitepaper-lib.mjs` (istWortgleich, pruefeZitat, alleBloecke), `werkzeuge/inhalte.mjs` (kompiliere), `src/engine/aktionen.ts` (wende), `src/regie/kanal.ts`, `src/grafik/*`, `src/figuren/figur.ts`, Test-Haken `data-pruef="…"` (siehe tests/oberflaeche/*.szenario.mjs).
- Bekannte Schönheitsfehler (aus P0.6, klein): 1024 px – „Kosten +8 %“ bricht in der Story-Karte um; lange Dateinamen im Excel-Stand brechen im Wort; 1280×720 Vergleichsschritt – „Welt B ansehen“ erst nach Scrollen in der Lagetafel. In P2.2 mit erledigen.
- Merker: Whitepaper-Zitate behalten „EW“ und „5 Mio. EUR“ (BEGRIFFE.md); Korrekturliste V1.3 sammelt Tippfehler/Fettung (L-14) und Grafik-Widersprüche (docs/recherche/grafiken-analyse.md).
- Offene Befunde: keine.

## FRÜHER
- 2026-09-26: Acht Fragerunden mit dem Owner, drei Stilprototypen (A Bühne, B Leitstand, C Reportage), Owner wählt B. Analysen der Schwesterprojekte in `docs/recherche/`.
- 2026-09-26/27: P0 lokal gebaut mit parallelen Agenten (Whitepaper-Quelle, Marke/Stil, Bau/Kette, Engine/Inhalte/Kanal), Durchstich, vier Prüf-Agenten (Architektur, Fachtreue, Begriffe, Stil): 64 Befunde, 60 behoben, 3 als L-7…L-10 entschieden, 1 teilweise (L-8).
