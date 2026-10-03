# Architektur

Stand P17 (2026-10-03, Neugestaltung O-50 bis O-58 auf der Neuausrichtung O-36 bis O-49; Prüfrunden bis R75). Verbindlich für alle Posten; Abweichungen nur mit L-Eintrag.

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
| `src/geschichte/` | Story ohne DOM (P17.2, O-51/O-52): `typen.ts` (Typen: Figuren, Balken, Kapitel mit Szene, drei Antworten, Mini-Aufgabe, Vergleich, Ende), `engine.ts` (Stand, Schritte Auftakt → je Kapitel Szene · (Vergleich) · Frage · (Mini-Aufgabe, nur lang) → Schulstart, Wahlen, Balken Geld · Zeit · Vertrauen 0–10 nach jeder Antwort begrenzt, Stufen und Bilanz-Typ, Kurzfassung mit Brücken – übersprungene Kapitel zählen wie die gute Antwort –, Mini-Aufgaben auswerten, Gewichte in drei Stufen 5/3/1, `vergleichLage`, `leseStand` – ein älterer Stand wird verworfen), `mcda.ts` (gewichteter Vergleich: Summen, Rangfolge, Kipppunkte über zulässige Gewichte; V2.4 Handbuch 3.1; auch für den Rechner in Explore) |
| `src/inhalte/` | Typisierter Laufzeitzugriff auf `src/generiert/inhalte.json`: `inhalte` (ohne Regie-Material), `regieGeschichte()`, `regieKapitel()`, `regieInhalte()` nur für die Regie |
| `src/ui/` | DOM-Zeichnung: `h.ts` (Mini-Helfer), `route.ts` (Hash-Router, rein), `woerter.ts` (Bedienwörter), `marke.ts`, `fassung.ts`, `anzeige.ts`, `druck.ts` (Druckbogen, Strg+P mit Ersatzbogen) |
| `src/ui/flaechen/` | Bereiche: `start.ts` (ruhiger Einstieg mit drei Wegen, O-21), `geschichte.ts` (Story als Bilderbuch: Auftakt mit Figuren, je Kapitel Campus und Dialog, Antwortkarten, Folge mit Balken, Mini-Aufgaben, Vergleich, Schulstart mit Bilanz; Fortschrittslinie der Kapitel, Fokusführung, Druckbogen `storyDruck`; Stand in `localStorage` unter `gk.story`), `theorie.ts` (Themen als Buch nach O-54: Inhaltsverzeichnis `#theorie` mit Teilen I–IV und Anhang, Nummern in Leserichtung, Symbol, Kurzsatz, Häkchen und Fortschrittsbalken; Thema `#theorie/<thema>` mit Teil und Nummer im Kopf und im Verzeichnis; Glossarliste, Druck je Thema), `explore.ts` (neun Werkzeuge: `mcda`, `vorlagen-check`, `matrix`, `risiko-grenzen`, `vorgaenge`, `wegweiser`, `takt`, `monatsbericht`, `glossar`; Reihenfolge und Adress-Kennungen in `src/ui/werkzeug-kennungen.ts`) |
| `src/ui/flaechen/explore/` | Oberflächen der vier neuen Werkzeuge (P18.3/P18.4, O-59): `vorlagen-check.ts`, `wegweiser.ts`, `risiko-grenzen.ts`, `monatsbericht.ts` und `gemeinsam.ts` (Beispielwahl mit „Leer beginnen“, Ampel mit Wort, Optionsfelder, Druckknopf mit eigenem Bogen). Nichts wird gespeichert oder gesendet; die Rechnung steht in `src/werkzeuge/` |
| `src/werkzeuge/` | Reine Rechenkerne der vier neuen Werkzeuge (P18.2, ohne DOM, Uhr und Zufall; Regeln in `docs/WERKZEUGE-P18.md`): `vorlagen-check.ts` (Ampel aus Muss-Punkten, zulässige Wege, Mandat im Beispielprojekt), `wegweiser.ts` (Fragenbaum zur Vorgangsart), `risiko-grenzen.ts` (eigene Grenzen, Matrixfeld, unbekannt ist nicht null, Spannen), `monatsbericht.ts` (Prüfung und Seitenschätzung: 50 Zeilen je Seite bei vorsichtigen 78 Zeichen je Zeile), `gemeinsam.ts` (Ampel, Hinweis, Lesen des Werkzeugstands vom Kanal: höchstens 80 Zeichen, nur `[a-z0-9:;,.-]`). Tests `tests/werkzeuge-*.test.ts`, Mutanten in `werkzeuge/mutanten.mjs` |
| `src/ui/themen-fortschritt.ts` | Fortschritt der Themen (P17.8, O-54): geschafft, wenn alle Verständnisfragen eines Themas beantwortet sind (richtig oder nicht), ohne Fragen mit dem Seitenende (IntersectionObserver am Kontakt-Fuß), Anhang zählt nicht; Stand in `localStorage` unter `gk.theorie` (`{ v: 1, antworten: { <thema>: [<frage>] }, gelesen: [<thema>] }`, nicht die gewählte Antwort), jeder Zugriff in try/catch; Leinwand und Druck zeigen keinen Fortschritt |
| `src/ui/bausteine/` | `seite.ts` (gemeinsamer Rahmen: Kopf mit Bildmarke und den drei Bereichen, Fuß mit Absender, Impressum, Datenschutz, „Präsentieren“), `inhalt.ts` (Inhalts-HTML aufbereiten, Glossarbezüge), `bloecke.ts` (Hinweis, Merksatz, Tafel), `lernwerkzeuge.ts` (Etappen, Umschalter, Sortieren, Regler; Karten und Wissenscheck zeichnet `flaechen/theorie.ts`), `abbildung.ts` (Figur mit Bild, Marke und Titel – kein Vergrößern, keine Abweichungen; O-55, O-56), `tooltip.ts` (Glossar-Hinweis) |
| `src/grafik/` | `tafel.ts` (Tabellen als klickbare Grafiken, `::: tafel`), `bauplan.ts` (Hintergründe im Stil „Bauplan“ für Start, Theorie und Vorschaubild, O-45), `campus-iso.ts` (isometrischer Campus der Story, Stufen 0–8, Jahreszeit, Licht; O-53), `figuren.ts` (Porträts der Figuren und kleine Gegenstände der Szenen), `themen-bilder.ts` (16 Kapitel-Illustrationen der Themen als Schmuck, `aria-hidden`; L-231), `werkzeug-bilder.ts` (Ampel, Messlatte mit vier Grenzen, Mini-Matrix und Seitenmesser der vier neuen Werkzeuge; Klassen `wb-*`, keine Farbwerte). Regel für alle Grafiken: SVG als Text, ohne `id` und `url()` (mehrere Bilder je Seite, L-229), deterministisch (kein Zufall, keine Uhr; gleiche Eingabe → gleiches SVG) |
| `src/regie/` | `kanal.ts` (BroadcastChannel + storage-Rückfall), `buehne.ts` (öffentlicher Stand der Bühne und `pruefeBuehne`, mit dem Feld `werkzeugStand`), `regie.ts` (Regie-Fläche, Stand unter `gk.regie`), `werkzeug-stand.ts` (rein: Schritte und „Was wäre, wenn“-Schalter der vier neuen Werkzeuge, Stand `b:<beispiel>[;<schritt>]`), `eingriffe.ts` (rein: Sprung je Schritt, Wahl zurücknehmen, Mini-Aufgabe auflösen, kurze Knopftexte), `leinwand.ts` (Leinwand und Vorschau-Zeichnung; rollt zur Folge, zu den Karten, zum gesetzten Posten) |
| `src/stil/` | `tokens.css`, `basis.css`, Bereichs-CSS in der Reihenfolge von `index.css` (`tafeln`, `regie`, `start`, `theorie`, `rahmen`, `geschichte`, `explore`, `grafik`), Einstieg `index.css`; `farben.ts`, `akzente.ts`, `symbole.ts`, `paare.json` für Prüfungen; `src/generiert/schriften.css` wird erzeugt |
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
| `sichtbar.mjs` | sichtbar verbotene Wörter in der gezeichneten Seite (O-38, O-39, O-42, O-14) und Reste von Arbeitsstand (`SICHTBAR_ARBEITSSTAND`, O-56: Abweichungen vom Text, Meta-Sätze über Bild und Text, Bedienungs-Anleitungen, Kennungen L-/O-/R…/P…, Prüf- und Quellenvermerke, intern, TODO, Platzhalter); genutzt von `tests/sichtbar.test.ts` (jede Fläche im DOM, mit Gegenprobe), `tests/bau.test.ts` und den Browser-Szenarien |
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
- **Ein** serialisierbarer Stand (`Stand` in `src/geschichte/engine.ts`, Feld `v: 2`): Schritt, Wahl je Kapitel (Platz 0–2 auf der Seite), Antworten der Mini-Aufgaben, eigene Gewichte im Vergleich (null = abgestimmt), Kurzfassung. Alles andere – Balken, Bilanz, Rangfolge, Kipppunkte – wird daraus berechnet. Ein gespeicherter Stand mit anderer Fassung (die Stationen der Fassung P16) wird verworfen.
- Jede Änderung über reine Funktionen (`weiter`, `zurueck`, `geheZu`, `beginne`, `waehle`, `ordneZu`, `klickeReihe`, `miniVonVorn`, `setzeGewicht`, `setzeAbgestimmt`, `setzeKurz`) ohne Uhr und Zufall (die Reihenfolge-Aufgabe ist fest gemischt); Tests sind deterministisch. Keine Freischaltung, kein Sperren: jeder Schritt ist jederzeit erreichbar (L-184).
- Die Fläche zeichnet einen Schritt rein aus Geschichte und Stand (`baueSchritt`, auch für die Leinwand, dort ohne Bedienelemente). Nach jedem Neuzeichnen setzt sie den Fokus: neuer Schritt → Titel, neue Wahl → Folge-Szene (dazu eine `aria-live`-Ansage der Balken), sonst dasselbe Bedienelement – nie auf `<body>`.
- Persistenz: `localStorage` mit vier Schlüsseln – `gk.story` (Stand der Story), `gk.theorie` (Kennungen beantworteter Verständnisfragen und gelesener Themen, keine Antworten), `gk.regie` (Bühnenstand und Gesprächsprotokoll der Regie) und `mvg.kanal.regie` (Rückfall des Kanals zwischen Regie und Leinwand, `kanalSchluessel` in `src/regie/kanal.ts`: hält nur die zuletzt gesendete Nachricht – Bühnenstand, Anzeige oder Lebenszeichen, nie Regie-Material). „Protokoll löschen“ entfernt `gk.regie` und `mvg.kanal.regie`; solange die Regie offen ist, schreibt der Kanal mit dem nächsten Lebenszeichen wieder einen Eintrag. Jede Lese- und Schreiboperation in try/catch; ohne Speicher läuft alles weiter. Ein gespeicherter Stand wird mit `leseStand` geprüft.

## Regie und Leinwand (O-9)
- Die **Regie** besitzt den Bühnenstand (`Buehne` in `src/regie/buehne.ts`: Bereich, Thema, Werkzeug, `werkzeugStand` – `b:<beispiel>[;<schritt>]`, vom Kern des Werkzeugs gelesen, nie Freitext –, Stand der Story). Nach jeder Änderung sendet sie `{ art: 'zustand', zustand, nr }` über den Kanal. Die **Leinwand** prüft jeden empfangenen Stand mit `pruefeBuehne` und zeichnet nur ihn; ihre Zeichnung ist `inert` (nicht bedienbar).
- Nachrichten im Kanal (`src/regie/kanal.ts`, jede geprüft): `zustand` (öffentlicher Bühnenstand), `anzeige` (Beamer-Schalter), `rollen` (Schritt −1/+1: Leinwand um knapp eine Höhe rollen), `hallo` und `lebenszeichen` (Verbindung). Keine trägt Regie-Material.
- Regie-Eigenes (Notizen, Leitfragen, Gesprächsprotokoll) liegt **nicht** im gesendeten Stand und wird von der Leinwand-Zeichnung **nie** angefordert – Schutz durch Bauart, nicht durch CSS. Im JSON steht es getrennt (`regie`, `geschichteRegie`); `src/inhalte/index.ts` gibt es nur über die Regie-Funktionen heraus.
- Story auf der Leinwand (P17.6, O-53): jeder Eingriff der Regie ist ein gewöhnlicher Stand der Story (Wahl, Zuordnung, Reihenfolge, Gewichte); die Wertung der Antworten zeichnet nur die Regie. Die Beamer-Optik misst die Breite der Anzeige per Container-Abfrage (`.anzeige`), nicht das Fenster – die Vorschau (Bühne 1280 px) zeigt dieselbe Stufe wie eine Leinwand von 1280 px; ab 1200/1500/1800 px wächst die Story per `zoom` (1,1/1,3/1,55), ohne Kopfnavigation und Startknöpfe.
- Kanal nach Vorbild `quellen/bm/buehnenkanal.ts`: BroadcastChannel, Rückfall über `localStorage`-`storage`-Ereignis, Lebenszeichen der Leinwand zurück an die Regie. Funktioniert auch unter `file://`.

## Inhalte
- `werkzeuge/inhalte.mjs` liest `inhalte/**` (Markdown mit YAML-Kopfdaten über `yaml` und `marked` → HTML zur Bauzeit, Blöcke nach `docs/INHALTSFORMAT.md`; Story und Explore als YAML), prüft Schema, Begriffe, Zitate und Abdeckung und schreibt `src/generiert/inhalte.json`.
- `werkzeuge/abbildungen.mjs` (P14, O-32, L-77) macht aus den 13 Inhaltsabbildungen der DOCX WebP-Dateien unter `inhalte/abbildungen/` – Beschriftungen mit verbotenen Begriffen im Bild durch Begriffe des Texts überdeckt, Beschreibung je Bild in `abb-N.yaml`. `inhalte` prüft über `stand.json`, dass kein Bild veraltet ist, und schreibt die Bilder als data:-URL nach `src/generiert/abbildungen.json`. Nur `src/main.ts` lädt diese Datei und reicht sie an `src/ui/bausteine/abbildung.ts` – die übrigen Module, die Leinwand und die Oberflächentests bleiben ohne Bilddaten (Wächter in `tests/ui-bauart.test.ts`).
- **Auf der Seite kein Bezug zur Vorlage** (O-38): keine Kapitelnummern, Absatz-IDs, Zitierangaben oder Originaltext. Absatz-IDs und `v24:`-Belege bleiben intern (Kopfdaten, Kommentare, `belege`); `werkzeuge/sichtbar.mjs` prüft die gezeichnete Seite.
- **Kein Arbeitsstand auf der Seite** (O-56): keine Abweichungen der Abbildungen, keine Bedienhinweise (`[[bedienung:…]]` abgeschafft), keine Prüf- oder Quellenvermerke, Begründungen oder Entscheidungs-Kennungen; „Fiktiver Fall“ einmal je Bereich bzw. Seite (O-3). Regie-Material bleibt in der Regie (L-7).
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
Außerhalb der Kette: `node werkzeuge/mutanten.mjs` (Mutanten-Probe der Story-Engine und der Rechenkerne der Werkzeuge, Exitcode 1, wenn ein Mutant grün bleibt). `node werkzeuge/grafik-vorschau.mjs` rendert den isometrischen Campus (`src/grafik/campus-iso.ts`) als PNG nach `tmp/grafik/` zum Ansehen.

## Namen
Deutsche Bezeichner in ASCII-Umschrift (`waehle`, `setzeGewicht`, `schritt`), Typen in PascalCase (`Stand`, `Kapitel`), Dateien klein mit Bindestrich. Kommentare erklären das Warum.

## Browserziele
Aktuelle Chrome/Edge/Firefox, Safari ≥ 15.4 (macOS, iPadOS). Bildschirme 1280×720 (Beamer), 1024×768 (iPad quer), 400 px Breite (lesbar).
