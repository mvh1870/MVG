# Übergabe

Kopf ≤ 100 Zeilen. Oben JETZT (überschreiben), darunter FRÜHER (anhängen, knapp).

## JETZT
- **O-27 (Owner, 2026-09-27):** weiterarbeiten, bis das Planblatt leer ist; nicht wegen Zeit/Zugzahl hinlegen. Sparsam mit Agenten.
- Stand 2026-09-27 10:04 UTC (+00:00), Cloud-Block 1 läuft nach O-27 weiter: **P1 fertig, P2.1 erledigt** (Spur-Delta L-21, Station ohne Startstand L-19, Volldurchlauf aller 6 Rollen × 3 Enden durch den Entwurf mit dem Reducer, Mutanten-Probe). Nächster Posten **P2.2 Leitstand-Rahmen** (schrittweise Einblendung L-4; Schönheitsfehler aus P0.6 mit erledigen; Hinweis H15: in der Story Konsequenz + Governance-Frage, „Was fehlt“/„Neues Risiko“ aufklappbar). Hinweise H10–H20 in `docs/P1.5-BEFUNDE.md` für P3/P5/P7.
- Frischer Cloud-Rechner (gemessen 2026-09-27 07:48–07:53 UTC): Node v22.22.2 (≥ 22.18, reicht; kein nvm nötig) · `npm ci` 8 s · `npx playwright install chromium` scheitert (403, cdn.playwright.dev nicht freigegeben) · vorinstalliertes Chromium 141 unter `/opt/pw-browsers/chromium` läuft → `oberflaeche` nimmt es jetzt (L-15) · Kette grün mit Browser, 193 s (davon Oberfläche 179 s; ohne Browser 19 s).
- GitHub-Aktion `pruefe`: Ergebnis noch nicht nachgesehen (kein Zugriff geprüft) – nachholen.
- Was steht: Startseite (zwei Wege), Story Prolog → A3 → Weltregler → B3 nur für Rolle Bauherren-PL (die übrigen 5 Rollen „folgt“), Theorie-Liste + Kap. 1, Regie + Leinwand (zwei Fenster, BroadcastChannel), Whitepaper-Quelle mit Absatz-IDs, Stil aus Variante B, Prüfkette mit Browser.
- Wichtige Schnittstellen: `werkzeuge/whitepaper-lib.mjs` (istWortgleich, pruefeZitat, alleBloecke), `werkzeuge/inhalte.mjs` (kompiliere), `src/engine/aktionen.ts` (wende), `src/regie/kanal.ts`, `src/grafik/*`, `src/figuren/figur.ts`, Test-Haken `data-pruef="…"` (siehe tests/oberflaeche/*.szenario.mjs).
- Bekannte Schönheitsfehler (aus P0.6, klein): 1024 px – „Kosten +8 %“ bricht in der Story-Karte um; lange Dateinamen im Excel-Stand brechen im Wort; 1280×720 Vergleichsschritt – „Welt B ansehen“ erst nach Scrollen in der Lagetafel. In P2.2 mit erledigen.
- Merker: Whitepaper-Zitate behalten „EW“ und „5 Mio. EUR“ (BEGRIFFE.md); Korrekturliste V1.3 sammelt Tippfehler/Fettung (L-14) und Grafik-Widersprüche (docs/recherche/grafiken-analyse.md).
- Offene Befunde: keine.

## FRÜHER
- 2026-09-26: Acht Fragerunden mit dem Owner, drei Stilprototypen (A Bühne, B Leitstand, C Reportage), Owner wählt B. Analysen der Schwesterprojekte in `docs/recherche/`.
- 2026-09-26/27: P0 lokal gebaut mit parallelen Agenten (Whitepaper-Quelle, Marke/Stil, Bau/Kette, Engine/Inhalte/Kanal), Durchstich, vier Prüf-Agenten (Architektur, Fachtreue, Begriffe, Stil): 64 Befunde, 60 behoben, 3 als L-7…L-10 entschieden, 1 teilweise (L-8).
- 2026-09-27: Erster Cloud-Block: Zweig `claude/haus` angelegt, P0.8 abgehakt, Browser-Rückfall auf vorinstalliertes Chromium (L-15).
- 2026-09-27 (Cloud-Block 1, 07:47–09:42 UTC): P0.8, P1.1–P1.5; Kette 191–200 s mit Browser.
