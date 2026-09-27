# Übergabe

Kopf ≤ 100 Zeilen. Oben JETZT (überschreiben), darunter FRÜHER (anhängen, knapp).

## JETZT
- **O-27 (Owner, 2026-09-27):** weiterarbeiten, bis das Planblatt leer ist; nicht wegen Zeit/Zugzahl hinlegen. Sparsam mit Agenten.
- Stand 2026-09-27 22:44 UTC (+00:00): **P1–P6 fertig, P7.1–P7.6 fertig; P7.7 Phasenend-Prüfung läuft** (Inhalt quer, Technik, `pruefe:voll`). P6: Theorie Kap. 1–13, Glossarseite (L-47), Phasenend-Prüfung 21 Befunde erledigt (docs/P6-BEFUNDE.md), Szenario `theorie` prüft alle Lernseiten mit reduzierter Bewegung. P7: Wirklichkeit ausgebaut (zwei Runden, 16 + 2 Befunde), Enden-Logik „Wahl gibt Richtung, Spur entscheidet“ (L-48, H10 erledigt), Explore mit jedem Ende frei, Express-Umschalter und Explore-Weg an der Story-Karte (L-49), Tafel-Formen `zeitachse` (30/60/90) und `diagnose` (O-8), Nachweiskette zum Anfassen (E2, Container `nachweis` in B1–B6), drei Enden (März 2027, zwei Runden), Epilog mit Selbstdiagnose, Bauherrentypen, Spurvergleich, Resümee (L-50). Browser: welt-b-2 spielt Express bis in den Epilog. Danach: P8 Explore. Arbeitsbaum `../MVG-commit` (git worktree, detached) zum Committen, während Agenten im Hauptbaum schreiben – vor Benutzung `git reset --hard` und auf origin/claude/haus setzen.
- Frischer Cloud-Rechner (gemessen 2026-09-27 07:48–07:53 UTC): Node v22.22.2 (≥ 22.18, reicht; kein nvm nötig) · `npm ci` 8 s · `npx playwright install chromium` scheitert (403, cdn.playwright.dev nicht freigegeben) · vorinstalliertes Chromium 141 unter `/opt/pw-browsers/chromium` läuft → `oberflaeche` nimmt es jetzt (L-15) · Kette grün mit Browser, 193 s (davon Oberfläche 179 s; ohne Browser 19 s).
- GitHub-Aktion `pruefe` (nachgesehen 21:13 UTC): Läufe 47–51 abgebrochen, weil jeweils ein neuerer Push kam (Concurrency); Lauf 52 (f9afbce) läuft noch.
- Was steht: Startseite (zwei Wege), Story Prolog (6 Rollen, Interessen, Express) → A3 → Vergleich → B3 für alle Rollen (spielbarer Durchstich); der ganze Entscheidungsgraph (20 Stationen, 78 Szenen, 3 Enden) als Entwurf unter `entwurf/`; Leitstand mit Instrumenten, Story-Karte + LPH-Band, Seitenleiste (Raum, Ebenen, Glossar, Quellen), Permalinks, Explore-Rahmen mit Besetzungsgalerie; Theorie-Liste + Kap. 1; Regie + Leinwand; axe in der Browserkette.
- Wichtige Schnittstellen: `werkzeuge/whitepaper-lib.mjs` (istWortgleich, pruefeZitat, alleBloecke), `werkzeuge/inhalte.mjs` (kompiliere), `src/engine/aktionen.ts` (wende), `src/regie/kanal.ts`, `src/grafik/*`, `src/figuren/figur.ts`, Test-Haken `data-pruef="…"` (siehe tests/oberflaeche/*.szenario.mjs).
- Merker: Whitepaper-Zitate behalten „EW“ und „5 Mio. EUR“ (BEGRIFFE.md); Korrekturliste V1.3 sammelt Tippfehler/Fettung (L-14) und Grafik-Widersprüche (docs/recherche/grafiken-analyse.md).
- Offene Befunde: keine.

## FRÜHER
- 2026-09-26: Acht Fragerunden mit dem Owner, drei Stilprototypen (A Bühne, B Leitstand, C Reportage), Owner wählt B. Analysen der Schwesterprojekte in `docs/recherche/`.
- 2026-09-26/27: P0 lokal gebaut mit parallelen Agenten (Whitepaper-Quelle, Marke/Stil, Bau/Kette, Engine/Inhalte/Kanal), Durchstich, vier Prüf-Agenten (Architektur, Fachtreue, Begriffe, Stil): 64 Befunde, 60 behoben, 3 als L-7…L-10 entschieden, 1 teilweise (L-8).
- 2026-09-27: Erster Cloud-Block: Zweig `claude/haus` angelegt, P0.8 abgehakt, Browser-Rückfall auf vorinstalliertes Chromium (L-15).
- 2026-09-27 (Cloud-Block 1, 07:47–09:42 UTC): P0.8, P1.1–P1.5; Kette 191–200 s mit Browser.
