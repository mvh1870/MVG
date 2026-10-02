# Prüfung Phasenende P2 (2026-09-27)

Drei Prüf-Agenten (O-24, `docs/PRUEFAGENTEN.md`) über die Commits 93890fd..cb82295: Architektur und Code (7 Befunde), Stil und Barrierefreiheit (6), Vollständigkeit (10). Dazu die GitHub-Aktion `pruefe` (rot auf cb82295).

## Behoben in P2.6
- A1 (schwer) Spur-Delta zählte eine Wahl doppelt, wenn eine Station durch Sprünge zweimal im Verlauf stand → `wegBis()` in `src/engine/status.ts` (jede Station einmal, bis zur aktuellen); Tests mit Rücksprung.
- A2 Touch: erstes Antippen schloss den Hinweis wieder (Ersatz-Ereignisse vor click) → `pointerdown` merkt den Zustand; Test mit echter Ereignisfolge.
- A3/A4/V4 Permalink mit Rolle, Adresszeile (`replaceState` auch beim Einstieg), `#story/B3` gesperrt, Weiterlesen nach Neuladen → im Szenario `wege` geprüft.
- A5/V2 Spur-Tests schärfer (drei Stationen, Rücksprung); unechte „Mutanten-Probe“ entfernt; echtes Werkzeug `node werkzeuge/mutanten.mjs` (10 Mutanten der Engine) – erster Lauf 9/10, Lücke „Ende hält an, auch mit Kanten“ per Test geschlossen → 10/10.
- A6 LPH-Band sagte „abgeschlossen“ → „zurückliegend“ (keine Aussage über Freigaben).
- A7 JSDoc von `baueAbdeckung` wieder an ihrem Platz.
- S1 vier Reiter liefen bei schmaler Seitenleiste über → kleiner/enger unter 1200 px.
- S2 Streifen erledigter LPH immer türkis → folgt der Welt (`data-welt` an der Story-Karte).
- S3 eigener Fokusring am Aufklapper → entfernt (Standardring gilt).
- S4 Glossar-Hinweistext nennt Antippen.
- S5 aktuelle LPH sichtbar ausgeschrieben unter dem Band.
- S6 tote `.auf-navy .lph`-Regeln entfernt.
- V5 Glossar per Tastaturfokus und wörtlicher Vergleich mit whitepaper.json getestet.
- V10 Commit-Hashes im Planblatt, Posten P2.6, Übergabe berichtigt, GitHub-Aktion nachgesehen.
- CI: `tests/bau-kette.test.ts` Popup-Test verlor in der Aktion einmal den Wurf (Wurf beim Laden vor dem Beobachter) → Wurf erst auf Klick, deterministisch.

## Übertragen in spätere Posten
- V1 „intelligente Vertiefung“ wirkt noch nicht → neuer Posten P3.9; Prolog-Satz bis dahin zurückhaltend.
- V3 Express über die Story-Karte (E8) → P7.2; Browsertest Express → P5.9.
- V6 `prefers-reduced-motion`-Lauf → P11.2.
- V7 Browser: alle Rollen in drei Größen mit axe → P3.8/P5.9/P11.2.
- V8 Explore mit dem Ende freischalten und aus der Story verlinken → P7.2.
- V9 Ebenen 1–4 je Station → Abnahme P3.8/P5.9/P6.1.
