# Architektur

Stand P0 (2026-09-26). Verbindlich für alle Posten; Abweichungen nur mit L-Eintrag.

## Fluss
```
quellen/ + inhalte/  ──werkzeuge (Node)──►  src/generiert/ (ignoriert)  ──esbuild──►  dist/mvg.html (eine Datei)
```
- Werkzeuge lesen Quellen und Inhalte, prüfen sie und schreiben generierte Daten nach `src/generiert/`.
- esbuild bündelt `src/main.ts` (IIFE) und `src/stil/*.css`; `werkzeuge/bau.mjs` setzt alles in die Hülle `werkzeuge/huelle.html` ein.
- Zur Laufzeit wird nichts nachgeladen, nichts geparst außer JSON, und es gibt keinen Netzzugriff.

## Verzeichnisse
| Pfad | Inhalt |
|---|---|
| `quellen/whitepaper/v1.2/` | DOCX (Original), `bilder/` (Originalbilder), `whitepaper.json` + `whitepaper.md` (strukturiert, Absatz-IDs), `pandoc-rohfassung.md` (nur Referenz) |
| `quellen/marke/` | Logo (Original-PNG, vektorisierte SVGs) |
| `quellen/bm/`, `quellen/companion/` | Referenzen aus Schwesterprojekten (Tokens, Kanal-Vorlage, Begriffslisten); nicht eingebunden, nur Vorlage |
| `inhalte/` | Alle Texte als Markdown (siehe `docs/INHALTSFORMAT.md`) |
| `src/main.ts` | Einstieg: liest den Hash (`#regie`, `#leinwand`, Permalinks), startet die passende Fläche |
| `src/engine/` | Reine Logik ohne DOM: Typen, Anfangszustand, Aktionen (Reducer), Graph, Bedingungen, Gedächtnis |
| `src/inhalte/` | Typisierter Laufzeitzugriff auf `src/generiert/inhalte.json` |
| `src/ui/` | DOM-Zeichnung: `h.ts` (Mini-Helfer), `flaechen/` (start, story, theorie, explore), `leitstand/` (Rahmen, Instrumente, Story-Karte, LPH-Band, Seitenleiste), `bausteine/` (Ebenen, Glossar, Entscheidung, Konsequenz, Schieberegler …) |
| `src/grafik/` | Diagramm-Baukasten als SVG (Governance-Fluss, Mandatsleiter, Pyramide, Felder, Symptom-Radar, LPH-Modell …), von Story und Theorie gemeinsam genutzt |
| `src/figuren/` | SVG-Figuren- und Requisiten-Baukasten |
| `src/regie/` | `kanal.ts` (BroadcastChannel + storage-Rückfall), Regie, Leinwand, Protokoll |
| `src/stil/` | `tokens.css`, `basis.css`, Komponenten-CSS; `src/generiert/schriften.css` wird erzeugt |
| `werkzeuge/` | `bau.mjs`, `kette.mjs`, `inhalte.mjs`, `begriffe.mjs` + `begriffe.json`, `oberflaeche.mjs`, `whitepaper-import.mjs`, `schriften.mjs`, `logo.mjs`, `vorschau.mjs`, `huelle.html` |
| `tests/` | `*.test.ts` (node:test, jsdom wo nötig); Browser-Szenarien unter `tests/oberflaeche/` |
| `dist/mvg.html` | die ausgelieferte Einzeldatei (committet) |
| `prototyp/` | Stilreferenz und Szenen-Spezifikation (nicht eingebunden) |
| `cloud/` | Routinen-Paket des Owners, unverändert |

## Zustand und Aktionen
- **Ein** serialisierbares Zustandsobjekt (`src/engine/typen.ts`), Feld `version` für Weiterlesen (E9).
- Jede Änderung über `wende(zustand, aktion): Zustand` – rein, ohne Uhr und Zufall (Zeitstempel kommen in der Aktion mit). Tests sind deterministisch.
- Die UI löst Aktionen aus und zeichnet aus dem Zustand. Animationen hängen an Schlüsselwechseln (neue Station, neue Wahl), nicht am Neuzeichnen.
- Persistenz: `localStorage` Schlüssel `mvg.stand.v1`, jede Lese- und Schreiboperation in try/catch; ohne Speicher läuft alles weiter.

## Regie und Leinwand (O-9)
- Die **Regie** besitzt den Zustand. Nach jeder Aktion sendet sie `{ art: 'zustand', zustand: oeffentlich(zustand), nr }` über den Kanal. Die **Leinwand** zeichnet nur, was sie empfängt, und ist nicht bedienbar.
- Regie-Eigenes (Sprechernotizen, Leitfragen, Einwand-Karten, Protokoll) liegt **nicht** im gesendeten Zustand und wird von der Leinwand-Zeichnung **nie** angefordert – Schutz durch Bauart, nicht durch CSS.
- Kanal nach Vorbild `quellen/bm/buehnenkanal.ts`: BroadcastChannel, Rückfall über `localStorage`-`storage`-Ereignis, Lebenszeichen der Leinwand zurück an die Regie. Funktioniert auch unter `file://`.
- Ein-Fenster-Regie: dieselbe Regie-Fläche mit einblendbarer Schublade (Taste), wenn kein zweites Fenster möglich ist.

## Inhalte
- `werkzeuge/inhalte.mjs` liest `inhalte/**/*.md` (Kopfdaten YAML über `yaml`, Text Markdown über `marked` → HTML zur Bauzeit, Strukturblöcke nach `docs/INHALTSFORMAT.md`), prüft Schema, Graph, Begriffe, Zitate und Abdeckung und schreibt `src/generiert/inhalte.json`.
- **Zitate** tragen eine Absatz-ID aus `whitepaper.json`; der Prüfer verlangt Wortgleichheit (Normalisierung nur von Leerraum und Silbentrennzeichen).

## Einzeldatei und Sicherheit
- esbuild: `format: 'iife'`, Ziel `es2020` (Safari ≥ 15.4), minifiziert, keine Quelltextkarten in `dist/`.
- CSP als `<meta>`: `default-src 'none'; script-src 'sha256-…'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'`. (`frame-ancestors` geht nur per HTTP-Kopf; das regelt später der Einbettende.)
- Schriften als woff2-data-URIs in `src/generiert/schriften.css`, Bilder als data-URIs.
- Budget < 4 MB; `npm run bau:pruefe` baut zweimal und verlangt Byte-Gleichheit.

## Prüfkette `npm run pruefe`
`typen` → `test` → `inhalte --pruefe` → `begriffe` → `bau --pruefe` (zweimal, identisch, Größe) → `oberflaeche` (Browser).
Findet `oberflaeche` keinen Browser, versucht es in der Cloud einmal `npx playwright install chromium`; gelingt das nicht, meldet es „übersprungen“ (gelb, nicht rot) und nennt den Grund – der Befund gehört dann in die Übergabe.

## Namen
Deutsche Bezeichner in ASCII-Umschrift (`waehleOption`, `oeffentlich`, `schritt`), Typen in PascalCase (`Zustand`, `Station`), Dateien klein mit Bindestrich. Kommentare erklären das Warum.

## Browserziele
Aktuelle Chrome/Edge/Firefox, Safari ≥ 15.4 (macOS, iPadOS). Bildschirme 1280×720 (Beamer), 1024×768 (iPad quer), 400 px Breite (lesbar).
