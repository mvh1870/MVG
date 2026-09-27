# Übergabe

Kopf ≤ 100 Zeilen. Oben JETZT (überschreiben), darunter FRÜHER (anhängen, knapp).

## JETZT
- **O-27 (Owner, 2026-09-27):** weiterarbeiten, bis das Planblatt leer ist; nicht wegen Zeit/Zugzahl hinlegen. Sparsam mit Agenten.
- Stand 2026-09-27 (Abend) UTC (+00:00): **P1–P4 fertig.** P4.7: ein Prüf-Agent in allen Rollen, Runde 1: 18 Befunde (16 behoben, 2 verworfen mit Grund), Runde 2: 2 neue, behoben → nichts offen (`docs/P4-BEFUNDE.md`). P3.9-Vertiefungen: 7 Befunde behoben, in P4.7 nachgeprüft. Neu: Baustein `tafel` (L-32), Wendepunkt mit Radar/Ketten/Delegierbar?/Schwellen/Pyramide/Felder, Rückspulen mit Zeitleiste/Bausteinen/LPH 0 (L-33). P5.1 begonnen: `src/grafik/raci.ts` (RACI + Mandat, noch nicht eingebunden). Nächster Schritt: P5.1 fertig (Tafel-Formen für k6.4.4-t1 Register, k9.3-t1 LPH-Freigabemodell, k6.4.5-t1 Rhythmus, k6.4.2-t1 Zuständigkeit; RACI-Baustein im Compiler), dann B1–B6. Kette grün 560 s. Stationen bleiben bis P5.9 im Entwurf.
- Frischer Cloud-Rechner (gemessen 2026-09-27 07:48–07:53 UTC): Node v22.22.2 (≥ 22.18, reicht; kein nvm nötig) · `npm ci` 8 s · `npx playwright install chromium` scheitert (403, cdn.playwright.dev nicht freigegeben) · vorinstalliertes Chromium 141 unter `/opt/pw-browsers/chromium` läuft → `oberflaeche` nimmt es jetzt (L-15) · Kette grün mit Browser, 193 s (davon Oberfläche 179 s; ohne Browser 19 s).
- GitHub-Aktion `pruefe` (nachgesehen 12:45 UTC): grün auf allen Pushes von 933dbb0 bis cfef7bb; 01aa850 lief noch.
- Was steht: Startseite (zwei Wege), Story Prolog (6 Rollen, Interessen, Express) → A3 → Vergleich → B3 für alle Rollen (spielbarer Durchstich); der ganze Entscheidungsgraph (20 Stationen, 78 Szenen, 3 Enden) als Entwurf unter `entwurf/`; Leitstand mit Instrumenten, Story-Karte + LPH-Band, Seitenleiste (Raum, Ebenen, Glossar, Quellen), Permalinks, Explore-Rahmen mit Besetzungsgalerie; Theorie-Liste + Kap. 1; Regie + Leinwand; axe in der Browserkette.
- Wichtige Schnittstellen: `werkzeuge/whitepaper-lib.mjs` (istWortgleich, pruefeZitat, alleBloecke), `werkzeuge/inhalte.mjs` (kompiliere), `src/engine/aktionen.ts` (wende), `src/regie/kanal.ts`, `src/grafik/*`, `src/figuren/figur.ts`, Test-Haken `data-pruef="…"` (siehe tests/oberflaeche/*.szenario.mjs).
- Merker: Whitepaper-Zitate behalten „EW“ und „5 Mio. EUR“ (BEGRIFFE.md); Korrekturliste V1.3 sammelt Tippfehler/Fettung (L-14) und Grafik-Widersprüche (docs/recherche/grafiken-analyse.md).
- Offene Befunde: keine.

## FRÜHER
- 2026-09-26: Acht Fragerunden mit dem Owner, drei Stilprototypen (A Bühne, B Leitstand, C Reportage), Owner wählt B. Analysen der Schwesterprojekte in `docs/recherche/`.
- 2026-09-26/27: P0 lokal gebaut mit parallelen Agenten (Whitepaper-Quelle, Marke/Stil, Bau/Kette, Engine/Inhalte/Kanal), Durchstich, vier Prüf-Agenten (Architektur, Fachtreue, Begriffe, Stil): 64 Befunde, 60 behoben, 3 als L-7…L-10 entschieden, 1 teilweise (L-8).
- 2026-09-27: Erster Cloud-Block: Zweig `claude/haus` angelegt, P0.8 abgehakt, Browser-Rückfall auf vorinstalliertes Chromium (L-15).
- 2026-09-27 (Cloud-Block 1, 07:47–09:42 UTC): P0.8, P1.1–P1.5; Kette 191–200 s mit Browser.
