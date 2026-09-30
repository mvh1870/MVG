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
| `inhalte/` | Alle Texte als Markdown (siehe `docs/INHALTSFORMAT.md`), seit P5.10 der ganze Entscheidungsgraph (L-45) |
| `entwurf/` | Ort für künftige Entwürfe in der Form von `inhalte/`; `npm run entwurf` überlagert `inhalte/` damit und prüft (Vorschau mit `--bau` → `tmp/mvg-entwurf.html`); derzeit leer bis auf `LIESMICH.md` |
| `src/main.ts` | Einstieg: liest den Hash (`#regie`, `#leinwand`, Permalinks), startet die passende Fläche |
| `src/engine/` | Reine Logik ohne DOM: Typen, Anfangszustand, Aktionen (Reducer), Graph, Bedingungen, Gedächtnis; Explore-Regeln `simulator.ts` (Szenario-Simulator) und `sandbox.ts` (Governance-Fluss-Sandbox), je mit Absatz-ID |
| `src/inhalte/` | Typisierter Laufzeitzugriff auf `src/generiert/inhalte.json` |
| `src/ui/` | DOM-Zeichnung: `h.ts` (Mini-Helfer), `flaechen/` (start, story, theorie, explore, hilfe), `leitstand/` (Rahmen, Instrumente, Story-Karte, LPH-Band, Seitenleiste), `bausteine/` (Ebenen, Glossar, Entscheidung, Konsequenz, Schieberegler, Abbildung …), `einbettung.ts` (Einbett-Protokoll: bereit/ort/hoehe/ziel an den Host, gehe/frage/fenster vom Host), `dialog.ts` (modale Dialoge: Lage eingebettet, Höhendeckel, Rollsperre, Fokus bleibt im Dialog, rollfrei am Ende ohne Fenstermeldung), `druck.ts` (Druckbogen: `druckeBogen` für den Knopf; Strg+P über `bogenFuerStrgP` – Lernseite, Dossier auf jedem Epilog-Schritt, Regie-Protokoll – und `ersatzBogenFuerStrgP` für Flächen ohne eigenen Bogen, Vorrang laufender Knopf-Druck > Bogen der Seite > Ersatz; weiche Trennstellen an Fugen `mitTrennstellen`, in der Hilfe `trennstellenImDruck`) |
| `src/grafik/` | Diagramm-Baukasten als SVG (Governance-Fluss, Mandatsleiter, Pyramide, Felder, Symptom-Radar, LPH-Modell …), von Story, Theorie und Explore gemeinsam genutzt (Explore: Tafeln der Galerie, Zeitmaschine) |
| `src/figuren/` | SVG-Figuren- und Requisiten-Baukasten |
| `src/regie/` | `kanal.ts` (BroadcastChannel + storage-Rückfall), Regie, Leinwand, Protokoll |
| `src/stil/` | `tokens.css`, `basis.css`, Komponenten-CSS; `src/generiert/schriften.css` wird erzeugt |
| `werkzeuge/` | `bau.mjs`, `kette.mjs`, `inhalte.mjs`, `hilfe.mjs`, `abbildungen.mjs`, `begriffe.mjs` + `begriffe.json`, `oberflaeche.mjs`, `whitepaper-import.mjs` + `whitepaper-lib.mjs` (Lesen, Suchen, Vergleichen der Quelle), `reimport.mjs` (neue Fassung gegen V1.2), `anzeige-fassung.mjs` (Anzeigefassung ohne „Whitepaper“, L-66), `schriften.mjs`, `logo.mjs`, `stilreferenz.mjs`, `vorschau.mjs`, `entwurf.mjs`, `haupt.mjs` (Skript oder Modul), `huelle.html`; außerhalb der Kette: `mutanten.mjs` (Mutanten-Probe der Engine) |
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
- Die **Regie** besitzt den Zustand. Nach jeder Aktion sendet sie `{ art: 'zustand', zustand: oeffentlich(zustand), nr }` über den Kanal. Die **Leinwand** zeichnet nur, was sie empfängt; ihre Zeichnung ist `inert` (nicht bedienbar).
- Nachrichten im Kanal (`src/regie/kanal.ts`, jede geprüft): `zustand` (öffentlicher Zustand), `anzeige` (Beamer-Schalter), `rollen` (Nummer, Schritt −1/+1: Tafel der Story bzw. Lernseite um knapp eine Höhe rollen, L-75, P12.5 R9), `hallo` und `lebenszeichen` (Verbindung). Keine trägt Regie-Material.
- Das Leinwand-**Fenster** reagiert selbst nur auf Mausrad und Rolltasten (Bild↑/↓, ↑ ↓, Leertaste): Es rollt die Tafel bzw. die Seite, ändert aber keinen Zustand.
- Regie-Eigenes (Sprechernotizen, Leitfragen, Protokoll) liegt **nicht** im gesendeten Zustand und wird von der Leinwand-Zeichnung **nie** angefordert – Schutz durch Bauart, nicht durch CSS.
- Kanal nach Vorbild `quellen/bm/buehnenkanal.ts`: BroadcastChannel, Rückfall über `localStorage`-`storage`-Ereignis, Lebenszeichen der Leinwand zurück an die Regie. Funktioniert auch unter `file://`.
- Einwand-Karten (E6) sind **öffentlich** (Story, Ebenen-Schritt); die Regie zeigt sie zusätzlich als Spickzettel, getrennt unter dem Hinweis „nur in der Regie“ (L-54).
- Ein-Fenster-Regie: die Vorschau füllt das Fenster (Maßstab aus Breite und Höhe), darunter eine Eingriffsleiste mit den öffentlichen Kundenwahlen; Notizen, Protokoll und Steuerung sind verdeckt und `inert`. Pfeiltasten und a–d wirken weiter, Esc kehrt zurück (L-54).

## Inhalte
- `werkzeuge/inhalte.mjs` liest `inhalte/**/*.md` (Kopfdaten YAML über `yaml`, Text Markdown über `marked` → HTML zur Bauzeit, Strukturblöcke nach `docs/INHALTSFORMAT.md`), prüft Schema, Graph, Begriffe, Zitate und Abdeckung und schreibt `src/generiert/inhalte.json`.
- `werkzeuge/abbildungen.mjs` (P14, O-32, L-77) macht aus den 13 Inhaltsabbildungen der DOCX (`quellen/whitepaper/v1.2/bilder/`) WebP-Dateien unter `inhalte/abbildungen/` – Beschriftungen mit verbotenen Begriffen im Bild durch Begriffe des Texts überdeckt, Beschreibung je Bild in `abb-N.yaml`. Es braucht Chromium und läuft nur bei Änderungen (nicht in der Kette); `inhalte` prüft über `stand.json`, dass kein Bild veraltet ist, und schreibt die Bilder als data:-URL nach `src/generiert/abbildungen.json`. Nur `src/main.ts` lädt diese Datei und reicht sie an `src/ui/bausteine/abbildung.ts` (Figur mit Bildunterschrift und Vergrößern-Dialog) – die übrigen Module, der Leinwand-Graph und die Oberflächentests bleiben ohne Bilddaten (Wächter in `tests/ui-bauart.test.ts`); nur `tests/abbildungen.test.ts` liest die Datei, um sie zu prüfen. Vergrößern öffnet über `src/ui/dialog.ts`: eingebettet an der Figur, die Hostseite rollt dorthin.
- `werkzeuge/hilfe.mjs` übernimmt die Hilfe des MVG Companion aus `quellen/hilfe/` (bereinigt, Begriffe nach MVG, L-69; Wortlaut über `ERSETZUNGEN`, Tabellenzeilen, Listen und Glossarnamen per DOM in `angleiche`, Kopfzeilen als `thead`) nach `src/generiert/hilfe.json`; läuft mit `inhalte` und als Vorstufe von `bau`. Die Fläche `src/ui/flaechen/hilfe.ts` zeigt sie unter `#hilfe` und `#hilfe/<seite>`.
- **Zitate** tragen eine Absatz-ID aus `whitepaper.json`; der Prüfer verlangt Wortgleichheit (Normalisierung nur von Leerraum und Silbentrennzeichen).

## Einzeldatei und Sicherheit
- esbuild: `format: 'iife'`, Ziel `es2020` (Safari ≥ 15.4), minifiziert, keine Quelltextkarten in `dist/`.
- CSP als `<meta>`: `default-src 'none'; script-src 'sha256-…'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'`. (`frame-ancestors` geht nur per HTTP-Kopf; das regelt später der Einbettende.)
- Schriften als woff2-data-URIs in `src/generiert/schriften.css`, Bilder als data-URIs.
- Budget < 4 MB; `npm run bau:pruefe` baut zweimal und verlangt Byte-Gleichheit.

## Prüfkette `npm run pruefe`
`inhalte --pruefe` → `typen` → `test` → `begriffe` → `bau --pruefe` (zweimal, identisch, Größe) → `oberflaeche` (Browser).
`inhalte` läuft zuerst, weil `src/generiert/inhalte.json` (ignoriert) auf einem frischen Klon erst erzeugt werden muss, bevor Typen und Tests sie lesen. `inhalte --pruefe` prüft die fertige JSON auch auf verbotene Begriffe (samt Whitepaper-Text und Glossar).
Findet `oberflaeche` keinen Browser, versucht es in der Cloud (`CLAUDE_CODE_REMOTE=true`) einmal `npx playwright install chromium`; gelingt das nicht, meldet es „übersprungen“ (Exitcode 3 = gelb, nicht rot) und nennt den Grund – der Befund gehört dann in die Übergabe. In GitHub Actions (`GITHUB_ACTIONS=true`) oder mit `MVG_BROWSER_PFLICHT=1` ist ein fehlender Browser rot.

## Namen
Deutsche Bezeichner in ASCII-Umschrift (`waehleOption`, `oeffentlich`, `schritt`), Typen in PascalCase (`Zustand`, `Station`), Dateien klein mit Bindestrich. Kommentare erklären das Warum.

## Browserziele
Aktuelle Chrome/Edge/Firefox, Safari ≥ 15.4 (macOS, iPadOS). Bildschirme 1280×720 (Beamer), 1024×768 (iPad quer), 400 px Breite (lesbar).
