# Architektur

Stand P16.14 (2026-10-02, Neuausrichtung O-36 bis O-49). Verbindlich für alle Posten; Abweichungen nur mit L-Eintrag.

## Fluss
```
quellen/ + inhalte/  ──werkzeuge (Node)──►  src/generiert/ (ignoriert)  ──esbuild──►  dist/ (Webseitenordner, committet)
```
- `werkzeuge/inhalte.mjs` liest Quellen und Inhalte, prüft sie und schreibt `src/generiert/inhalte.json` und `src/generiert/abbildungen.json`; die Story übersetzt dabei `werkzeuge/geschichte.mjs`, die Explore-Texte `werkzeuge/explore.mjs`.
- `werkzeuge/bau.mjs` bündelt mit esbuild `src/main.ts` (IIFE) und `src/stil/index.css`, setzt beides in die Hülle `werkzeuge/huelle.html` ein und schreibt den Webseitenordner `dist/` (O-42, O-47): `index.html` (Hauptseite, alles eingebettet), `impressum.html` und `datenschutz.html` (aus `inhalte/rechtliches/*.md` mit `werkzeuge/rechtliches.html`), `robots.txt`, `sitemap.xml`, `.htaccess` (aus `werkzeuge/htaccess.txt`: HTTPS, Sicherheitsköpfe) und `vorschau.png` (Kopie von `quellen/marke/vorschau.png`).
- Zur Laufzeit wird nichts nachgeladen, nichts geparst außer JSON, und es gibt keinen Netzzugriff (O-43).

## Verzeichnisse
| Pfad | Inhalt |
|---|---|
| `quellen/whitepaper/v1.2/` | DOCX (Original), `bilder/` (Originalbilder), `whitepaper.json` + `whitepaper.md` (strukturiert, Absatz-IDs, nur intern zur Nachprüfung), `pandoc-rohfassung.md` (nur Referenz) |
| `quellen/v2.4/` | Standard „Aufgaben- und Risikomanagement V2.4“ (Handbuch, Teilleistungsbild, Ausschreibung, Vertragsanlage Teil A); bei Widerspruch maßgeblich (O-36); interne Belege `v24:…` |
| `quellen/marke/` | Logo (Original-PNG, vektorisierte SVGs), `vorschau.png` (Vorschaubild für geteilte Links) |
| `quellen/bm/`, `quellen/companion/` | Referenzen aus Schwesterprojekten (Tokens, Kanal-Vorlage, Begriffslisten, Impressum-Vorlage); nicht eingebunden, nur Vorlage |
| `inhalte/` | Alle Texte (siehe `docs/INHALTSFORMAT.md`): Startseite, Themen der Theorie, Story (`geschichte/*.yaml`), Explore-Texte (`werkzeuge.yaml`), Glossar-Anpassungen, Begriffs-Kompass, Abdeckung, Abbildungen, Rechtliches; `fall.md` nur noch als Nachschlagewerk der Autoren |
| `entwurf/` | Ort für künftige Entwürfe in der Form von `inhalte/`; `npm run entwurf` überlagert `inhalte/` damit und prüft (Vorschau mit `--bau`); derzeit leer bis auf `LIESMICH.md` |
| `src/main.ts` | Einstieg: Hash-Router (`src/ui/route.ts`), legt beim Laden die Betriebsart fest (Seite · Regie · Leinwand), startet den Bereich; lädt als einziges Modul `src/generiert/abbildungen.json` |
| `src/geschichte/` | Story ohne DOM (P16.6, O-40): `typen.ts` (Typen der Story), `engine.ts` (Stand, Schritte Prolog → je Station Lage/Vorlage/Folge → Ende, Wahlen, Gewichte, Bedingungen (`s3=A`, `s3!=A`, `kurz`/`lang`, mit `&` verknüpft; dazu Statusbedingungen wie `kosten>61.3` oder `offen>=1`, R68/L-210: an Berichtszeilen und Vorgängen mit dem Status bei der Lage der Station, an Endzeilen mit dem Endstand – `gilt(…, station)` bzw. `gilt(…, 'ende')`; in `lage-folgen-bedingt` verbietet sie der Übersetzer, weil der Status erst daraus entsteht), Status aus Folgen, Endzeilen (`ende.zeilen`, L-215/L-218: Zeilen des Endes unter dem Puffer-Urteil, je nach Bedingung), Kurzfassung, `leseStand`), `mcda.ts` (gewichteter Kriterienvergleich: Summen, Rangfolge, Kipppunkte; V2.4 Handbuch 3.1) |
| `src/inhalte/` | Typisierter Laufzeitzugriff auf `src/generiert/inhalte.json`: `inhalte` (ohne Regie-Material), `regieGeschichte()`, `regieKapitel()`, `regieInhalte()` nur für die Regie |
| `src/ui/` | DOM-Zeichnung: `h.ts` (Mini-Helfer), `route.ts` (Hash-Router, rein), `woerter.ts` (Bedienwörter), `marke.ts`, `fassung.ts`, `anzeige.ts`, `dialog.ts` (modale Dialoge), `druck.ts` (Druckbogen, Strg+P mit Ersatzbogen) |
| `src/ui/flaechen/` | Bereiche: `start.ts` (ruhiger Einstieg mit drei Wegen, O-21), `geschichte.ts` (Story: ein Fluss mit Weiter/Zurück, Fortschrittslinie, Statusleiste, Stand in `localStorage` unter `gk.story`), `theorie.ts` (Themen, `#theorie/<thema>`, Glossarliste, Druck je Thema), `explore.ts` (fünf Werkzeuge: `mcda`, `matrix`, `vorgaenge`, `takt`, `glossar`) |
| `src/ui/bausteine/` | `seite.ts` (gemeinsamer Rahmen: Kopf mit Bildmarke und den drei Bereichen, Fuß mit Absender, Impressum, Datenschutz, „Präsentieren“), `inhalt.ts` (Inhalts-HTML aufbereiten, Glossarbezüge), `bloecke.ts` (Hinweis, Merksatz, Tafel), `lernwerkzeuge.ts` (Etappen, Umschalter, Sortieren, Regler; Karten und Wissenscheck zeichnet `flaechen/theorie.ts`), `abbildung.ts` (Figur mit Bildunterschrift und Vergrößern-Dialog), `tooltip.ts` (Glossar-Hinweis) |
| `src/grafik/` | `tafel.ts` (Tabellen als klickbare Grafiken, `::: tafel`), `bauplan.ts` (Hintergründe im Stil „Bauplan“, Schulcampus als Linienzeichnung, O-45) |
| `src/regie/` | `kanal.ts` (BroadcastChannel + storage-Rückfall), `buehne.ts` (öffentlicher Stand der Bühne und `pruefeBuehne`), `regie.ts` (Regie-Fläche, Stand unter `gk.regie`), `leinwand.ts` (Leinwand und Vorschau-Zeichnung) |
| `src/stil/` | `tokens.css`, `basis.css`, Bereichs-CSS (`leitstand`, `start`, `theorie`, `rahmen`, `geschichte`, `explore`), Einstieg `index.css`; `farben.ts`, `symbole.ts`, `paare.json` für Prüfungen; `src/generiert/schriften.css` wird erzeugt |
| `werkzeuge/` | siehe „Werkzeuge“ |
| `tests/` | `*.test.ts` (node:test, jsdom wo nötig); Browser-Szenarien unter `tests/oberflaeche/` (Start, Story, Theorie, Explore, Regie, PDF) |
| `dist/` | der ausgelieferte Webseitenordner (committet) |
| `prototyp/` | Stilreferenz (nicht eingebunden) |
| `cloud/` | Routinen-Paket des Owners, unverändert |

## Werkzeuge
| Datei | Aufgabe |
|---|---|
| `bau.mjs` (+ `huelle.html`, `rechtliches.html`, `htaccess.txt`) | Webseitenordner `dist/` bauen; `--pruefe` baut zweimal und verlangt Byte-Gleichheit |
| `kette.mjs` | Prüfkette `npm run pruefe` (siehe unten) |
| `inhalte.mjs` | Inhalte kompilieren und prüfen (`docs/INHALTSFORMAT.md`) |
| `geschichte.mjs` | Story aus `inhalte/geschichte/*.yaml` übersetzen und prüfen (aus `inhalte.mjs` aufgerufen) |
| `explore.mjs` | Explore-Texte aus `inhalte/werkzeuge.yaml` übersetzen und prüfen (aus `inhalte.mjs` aufgerufen) |
| `abbildungen.mjs` | Abbildungen der DOCX angleichen und als WebP schreiben (Chromium, nur bei Änderungen, nicht in der Kette) |
| `begriffe.mjs` + `begriffe.json` | verbotene Begriffe in Repo-Dateien (`npm run begriffe`, `docs/BEGRIFFE.md`) |
| `sichtbar.mjs` | sichtbar verbotene Wörter in der gezeichneten Seite (O-38, O-39, O-42, O-14); genutzt von Tests und Browser-Szenarien |
| `oberflaeche.mjs` | Browser-Szenarien (Playwright) |
| `whitepaper-import.mjs` + `whitepaper-lib.mjs` | Quelle lesen, suchen, vergleichen; `reimport.mjs` (neue Fassung gegen V1.2) |
| `anzeige-fassung.mjs` | Anzeigefassung des Quelltexts ohne „Whitepaper“ (L-66) |
| `schriften.mjs`, `logo.mjs`, `vorschaubild.mjs` | Schriften als data-URIs, Logo vektorisieren, Vorschaubild erzeugen (Chromium, einmalig) |
| `vorschau.mjs` | kleiner Vorschau-Server für `dist/` (nur 127.0.0.1) |
| `entwurf.mjs` | Entwürfe aus `entwurf/` gegen den Stand prüfen |
| `haupt.mjs` | Hilfe: Skript oder Modul |
| `pruefrunde-auftraege.mjs` | Hilfe für Prüfrunden der Prüf-Agenten |
| `mutanten.mjs` | außerhalb der Kette: Mutanten-Probe der Story-Engine – verfälscht je eine Stelle in `src/geschichte/engine.ts`, lässt `tests/geschichte.test.ts` laufen und erwartet Rot |

## Stand und Ablauf der Story
- **Ein** serialisierbarer Stand (`Stand` in `src/geschichte/engine.ts`, Feld `v`): Schritt, Wahlen je Station, selbst eingestellte Gewichte, Kurzfassung. Alles andere – Status, Empfehlung, Bedingungen – wird daraus berechnet.
- Jede Änderung über reine Funktionen (`weiter`, `zurueck`, `geheZu`, `waehle`, `setzeGewicht`, `setzeKurz`) ohne Uhr und Zufall; Tests sind deterministisch. Keine Freischaltung, kein Sperren: jeder Schritt ist jederzeit erreichbar (L-184).
- Die Fläche zeichnet einen Schritt rein aus Geschichte und Stand (`baueSchritt`, auch für die Leinwand).
- Persistenz: `localStorage` (`gk.story` für die Seite, `gk.regie` für die Regie), jede Lese- und Schreiboperation in try/catch; ohne Speicher läuft alles weiter. Ein gespeicherter Stand wird mit `leseStand` geprüft.

## Regie und Leinwand (O-9)
- Die **Regie** besitzt den Bühnenstand (`Buehne` in `src/regie/buehne.ts`: Bereich, Thema, Werkzeug, Stand der Story). Nach jeder Änderung sendet sie `{ art: 'zustand', zustand, nr }` über den Kanal. Die **Leinwand** prüft jeden empfangenen Stand mit `pruefeBuehne` und zeichnet nur ihn; ihre Zeichnung ist `inert` (nicht bedienbar).
- Nachrichten im Kanal (`src/regie/kanal.ts`, jede geprüft): `zustand` (öffentlicher Bühnenstand), `anzeige` (Beamer-Schalter), `rollen` (Schritt −1/+1: Leinwand um knapp eine Höhe rollen), `hallo` und `lebenszeichen` (Verbindung). Keine trägt Regie-Material.
- Regie-Eigenes (Notizen, Leitfragen, Gesprächsprotokoll) liegt **nicht** im gesendeten Stand und wird von der Leinwand-Zeichnung **nie** angefordert – Schutz durch Bauart, nicht durch CSS. Im JSON steht es getrennt (`regie`, `geschichteRegie`); `src/inhalte/index.ts` gibt es nur über die Regie-Funktionen heraus.
- Kanal nach Vorbild `quellen/bm/buehnenkanal.ts`: BroadcastChannel, Rückfall über `localStorage`-`storage`-Ereignis, Lebenszeichen der Leinwand zurück an die Regie. Funktioniert auch unter `file://`.

## Inhalte
- `werkzeuge/inhalte.mjs` liest `inhalte/**` (Markdown mit YAML-Kopfdaten über `yaml` und `marked` → HTML zur Bauzeit, Blöcke nach `docs/INHALTSFORMAT.md`; Story und Explore als YAML), prüft Schema, Begriffe, Zitate und Abdeckung und schreibt `src/generiert/inhalte.json`.
- `werkzeuge/abbildungen.mjs` (P14, O-32, L-77) macht aus den 13 Inhaltsabbildungen der DOCX WebP-Dateien unter `inhalte/abbildungen/` – Beschriftungen mit verbotenen Begriffen im Bild durch Begriffe des Texts überdeckt, Beschreibung je Bild in `abb-N.yaml`. `inhalte` prüft über `stand.json`, dass kein Bild veraltet ist, und schreibt die Bilder als data:-URL nach `src/generiert/abbildungen.json`. Nur `src/main.ts` lädt diese Datei und reicht sie an `src/ui/bausteine/abbildung.ts` – die übrigen Module, die Leinwand und die Oberflächentests bleiben ohne Bilddaten (Wächter in `tests/ui-bauart.test.ts`).
- **Auf der Seite kein Bezug zur Vorlage** (O-38): keine Kapitelnummern, Absatz-IDs, Zitierangaben oder Originaltext. Absatz-IDs und `v24:`-Belege bleiben intern (Kopfdaten, Kommentare, `belege`); `werkzeuge/sichtbar.mjs` prüft die gezeichnete Seite.
- **Zitate** tragen intern eine Absatz-ID aus `whitepaper.json`; der Prüfer verlangt Wortgleichheit (Normalisierung nur von Leerraum und Silbentrennzeichen).

## Webseitenordner und Sicherheit
- esbuild: `format: 'iife'`, Ziel `es2020` (Safari ≥ 15.4), minifiziert, keine Quelltextkarten in `dist/`.
- CSP als `<meta>`: `default-src 'none'; script-src 'sha256-…'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'`. `frame-ancestors` und weitere Sicherheitsköpfe setzt `.htaccess`.
- Schriften als woff2-data-URIs in `src/generiert/schriften.css`, Bilder als data-URIs.
- Budget < 4 MB für `index.html`; `npm run bau:pruefe` baut zweimal und verlangt Byte-Gleichheit, auch mit `dist/`.

## Prüfkette `npm run pruefe`
`inhalte --pruefe` → `typen` → `test` → `begriffe` → `bau --pruefe` (zweimal, identisch, Größe) → `oberflaeche` (Browser).
`inhalte` läuft zuerst, weil `src/generiert/inhalte.json` (ignoriert) auf einem frischen Klon erst erzeugt werden muss, bevor Typen und Tests sie lesen. `inhalte --pruefe` prüft die fertige JSON auch auf verbotene Begriffe (samt Glossar).
Findet `oberflaeche` keinen Browser, versucht es in der Cloud (`CLAUDE_CODE_REMOTE=true`) einmal `npx playwright install chromium`; gelingt das nicht, meldet es „übersprungen“ (Exitcode 3 = gelb, nicht rot) und nennt den Grund – der Befund gehört dann in die Übergabe. In GitHub Actions (`GITHUB_ACTIONS=true`) oder mit `MVG_BROWSER_PFLICHT=1` ist ein fehlender Browser rot.
Außerhalb der Kette: `node werkzeuge/mutanten.mjs` (Mutanten-Probe der Story-Engine, Exitcode 1, wenn ein Mutant grün bleibt).

## Namen
Deutsche Bezeichner in ASCII-Umschrift (`waehle`, `setzeGewicht`, `schritt`), Typen in PascalCase (`Stand`, `Station`), Dateien klein mit Bindestrich. Kommentare erklären das Warum.

## Browserziele
Aktuelle Chrome/Edge/Firefox, Safari ≥ 15.4 (macOS, iPadOS). Bildschirme 1280×720 (Beamer), 1024×768 (iPad quer), 400 px Breite (lesbar).
