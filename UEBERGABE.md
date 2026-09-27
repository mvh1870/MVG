# Übergabe

Kopf ≤ 100 Zeilen. Oben JETZT (überschreiben), darunter FRÜHER (anhängen, knapp).

## JETZT
- **O-27 (Owner, 2026-09-27):** weiterarbeiten, bis das Planblatt leer ist; nicht wegen Zeit/Zugzahl hinlegen. Sparsam mit Agenten.
- Stand 2026-09-27 17:06 UTC (+00:00): **P1–P4, P5.1–P5.6 fertig.** B5 (12 Befunde behoben, L-38; Gliedart problem, Signal-Szene zeigt Tafeln). B4 Gremium-Szene (11 Befunde behoben, L-37); Browserläufe parallel (Kette 353 s). B3 ergänzt (3 Befunde behoben). B1 (L-35) und B2 (L-36) ausgebaut, je Prüfung Fachtreue/Begriffe mit zwei Runden, nichts offen (B1: 13 + 3, B2: 10 + 2 Befunde behoben). Szenario `welt-a` spielt die PL vom Prolog bis durch B1 und B2 (Liste `WELT_B` im Szenario erweitern, wenn eine B-Station fertig ist). Nächster Posten **P5.4 B3** (fehlt: vier Vertiefungen, sechs Standpunkte, Regie; B3 liegt in `inhalte/`). Kette grün 674 s.
- Frischer Cloud-Rechner (gemessen 2026-09-27 07:48–07:53 UTC): Node v22.22.2 (≥ 22.18, reicht; kein nvm nötig) · `npm ci` 8 s · `npx playwright install chromium` scheitert (403, cdn.playwright.dev nicht freigegeben) · vorinstalliertes Chromium 141 unter `/opt/pw-browsers/chromium` läuft → `oberflaeche` nimmt es jetzt (L-15) · Kette grün mit Browser, 193 s (davon Oberfläche 179 s; ohne Browser 19 s).
- GitHub-Aktion `pruefe` (nachgesehen 14:45 UTC): grün auf allen Pushes von 933dbb0 bis 44159e5; 45ba1df lief noch.
- Was steht: Startseite (zwei Wege), Story Prolog (6 Rollen, Interessen, Express) → A3 → Vergleich → B3 für alle Rollen (spielbarer Durchstich); der ganze Entscheidungsgraph (20 Stationen, 78 Szenen, 3 Enden) als Entwurf unter `entwurf/`; Leitstand mit Instrumenten, Story-Karte + LPH-Band, Seitenleiste (Raum, Ebenen, Glossar, Quellen), Permalinks, Explore-Rahmen mit Besetzungsgalerie; Theorie-Liste + Kap. 1; Regie + Leinwand; axe in der Browserkette.
- Wichtige Schnittstellen: `werkzeuge/whitepaper-lib.mjs` (istWortgleich, pruefeZitat, alleBloecke), `werkzeuge/inhalte.mjs` (kompiliere), `src/engine/aktionen.ts` (wende), `src/regie/kanal.ts`, `src/grafik/*`, `src/figuren/figur.ts`, Test-Haken `data-pruef="…"` (siehe tests/oberflaeche/*.szenario.mjs).
- Merker: Whitepaper-Zitate behalten „EW“ und „5 Mio. EUR“ (BEGRIFFE.md); Korrekturliste V1.3 sammelt Tippfehler/Fettung (L-14) und Grafik-Widersprüche (docs/recherche/grafiken-analyse.md).
- Offene Befunde: keine.

## FRÜHER
- 2026-09-26: Acht Fragerunden mit dem Owner, drei Stilprototypen (A Bühne, B Leitstand, C Reportage), Owner wählt B. Analysen der Schwesterprojekte in `docs/recherche/`.
- 2026-09-26/27: P0 lokal gebaut mit parallelen Agenten (Whitepaper-Quelle, Marke/Stil, Bau/Kette, Engine/Inhalte/Kanal), Durchstich, vier Prüf-Agenten (Architektur, Fachtreue, Begriffe, Stil): 64 Befunde, 60 behoben, 3 als L-7…L-10 entschieden, 1 teilweise (L-8).
- 2026-09-27: Erster Cloud-Block: Zweig `claude/haus` angelegt, P0.8 abgehakt, Browser-Rückfall auf vorinstalliertes Chromium (L-15).
- 2026-09-27 (Cloud-Block 1, 07:47–09:42 UTC): P0.8, P1.1–P1.5; Kette 191–200 s mit Browser.
