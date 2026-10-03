# Stil-Leitfaden

Stand P17.9 (2026-10-03). Verbindlich für alle Flächen der Seite (ARCHITEKTUR.md → `src/stil/`): Start, Story, Theorie, Explore, Regie und Leinwand. **Farben und Typografie** folgen dem vom Owner gewählten Prototyp **Variante B „Leitstand“** (`prototyp/variante-b-leitstand.html`, O-22); Aufbau und Bedienung folgen der Neuausrichtung O-36 bis O-49 mit ruhigem Einstieg (O-21, L-4). Farben nach O-11, Schriften nach L-2 und O-12, Hintergründe im Stil „Bauplan“ nach O-45, Akzentpalette nach O-57, isometrischer Campus nach O-53.

**Anschauen statt lesen:** `npm run oberflaeche` legt Bildschirmfotos jeder Fläche bei 1280 × 720, 1024 × 768 und 400 px in `tmp/oberflaeche/` ab (L-197: die alte Stilreferenz ist gelöscht).

## Dateien und Einbindung

| Datei | Inhalt |
|---|---|
| `src/stil/tokens.css` | alle Farben, Schriften, Größen, Abstände, Radien, Schatten, Bewegung (einzige Stelle mit Farbwerten) |
| `src/stil/basis.css` | Grundstellung (Browser-Vorgaben zurückgesetzt), Typografie, Silbentrennung, Fokus, Hochkontrast, Hilfsklassen, Semantik-Attribut `data-status`, gemeinsame Keyframes, reduzierte Bewegung |
| `src/stil/tafeln.css` | gemeinsame Bausteine (Knöpfe, Status-Symbol, ID-Marke, Merksatz, Hinweis, Glossar-Begriff mit Tooltip, Tabelle) und die Tafeln aus `src/grafik/tafel.ts` |
| `src/stil/regie.css` | Regie (Steuerpult mit Vorschau, Notiz, Leitfragen, Protokoll), Leinwand, Beamer-Schalter |
| `src/stil/start.css` | Startseite mit drei Wegen (Story breit mit isometrischem Campus und den Figuren, Theorie mit den vier Teilen, Explore mit den Gegenständen der Werkzeuge) und Campus-Hintergrund, Baukörper in den Akzenttönen (P17.7) |
| `src/stil/theorie.css` | ruhige Lernseiten der Themen; Verzeichnis ab 1100 px klebend und in sich rollend, Glossar, Lernwerkzeuge, Abbildungen, Druckbogen |
| `src/stil/rahmen.css` | Seitenrahmen (Kopf, Fuß, Sprunglink) und Bauplan-Hintergründe |
| `src/stil/geschichte.css` | Story (Fluss, Fortschrittslinie, Statusanzeige, Vorlage mit gewichtetem Vergleich, Vertiefungen) |
| `src/stil/explore.css` | Explore-Werkzeuge; je Werkzeug Akzentton (`data-ton`, `WERKZEUG_BILD` in explore.ts: Rechner Violett, Matrix Blau, Vorgänge Lagune, Takt Sonne, Glossar Grün) und Gegenstand aus figuren.ts; Kopf auf Rasterpapier im Ton des aktiven Werkzeugs (P17.7) |
| `src/stil/grafik.css` | isometrischer Campus (`src/grafik/campus-iso.ts`): Flächen je Material, Jahreszeit und Licht über `data-jahreszeit`/`data-licht`; Figuren und Gegenstände (`src/grafik/figuren.ts`, `fig-*`, `gm-*`) |
| `src/stil/index.css` | Einstieg für esbuild: `../generiert/schriften.css` → tokens → basis → tafeln → regie → start → theorie → rahmen → geschichte → explore → grafik |
| `src/stil/paare.json` | erlaubte Text/Grund-Paare (Quelle der Tabelle unten) |
| `src/stil/symbole.ts` | Ikonen und Status-Symbole als SVG-Zeichenketten (`symbol()`, `statusSymbol()`, `trendPfeil()`) |
| `src/stil/akzente.ts` | Namen und Rollen der Akzentpalette (`AKZENTE`, `AKZENT_ROLLEN`, O-57) |
| `src/stil/farben.ts` | `liesTokens()`, `loese()`, `kontrast()` – für Prüfungen |
| `src/generiert/schriften.css` | erzeugt von `werkzeuge/schriften.mjs` (`erzeugeSchriften()`), **vor jedem Bau** aufrufen |
| `quellen/marke/` | `logo-bm.svg`, `logo-bm-bildmarke.svg` (erzeugt von `werkzeuge/logo.mjs`), `logo-original.png` |

Bau: esbuild bündelt `src/stil/index.css` mit `bundle: true` (die `@import`s werden aufgelöst). Vorher `await erzeugeSchriften()` aus `werkzeuge/schriften.mjs`, sonst fehlt `src/generiert/schriften.css`. Der OFL-Hinweis steht als `/*! … */` am Kopf der Schriften und bleibt im Bündel erhalten. Das Logo kommt als Text ins Skript (esbuild-Loader `.svg: text` in `bau.mjs`): `import bildmarke from '../../quellen/marke/logo-bm-bildmarke.svg'` und inline einsetzen, damit `currentColor` greift (als `<img>` wäre es immer schwarz).

## Grundsätze

1. **Ruhiger Einstieg (O-21).** Die Startseite zeigt drei Wege als Türen – **Story**, **Theorie**, **Explore** – auf hellem Grund mit viel Weißraum; dahinter der Schulcampus als Linienzeichnung mit goldenen Maßlinien (O-45). Darunter leise „Wer steht dahinter“ mit dem Textlink zu bauherr-mentoren.com (O-44) und die Kennzeichnung „Fiktiver Fall“. Keine Instrumente, kein Navy-Rahmen. Impressum, Datenschutz und „Präsentieren“ (Regie) stehen leise im Fuß jeder Fläche.
2. **Story als Bilderbuch (O-51 bis O-53, P17.4).** Acht Kapitel, „Weiter“ Schritt für Schritt; oben eine Fortschrittslinie der Kapitel („3 von 8“, nie „Kapitel 3“) und die drei Balken Geld (Sonne), Zeit (Blau), Vertrauen (Beere) klein. Je Kapitel: große Nummer im Navy-Feld, isometrischer Campus groß im Rahmen (Seitenverhältnis 2,2 : 1, schmal 4 : 3), Einstieg auf einer Karte, die ins Bild ragt, Dialog mit Porträt und Sprechblase im Ton der Figur; die Frage auf Navy mit der Spielfigur „Sie“, drei Antwortkarten mit farbiger Nummer; nach der Wahl die Folge-Szene mit wachsenden Balken (Pfeil und Wort, ohne Zahlen), das Kärtchen „Wer entscheidet was“ als gelbes Papier, „So macht man es gut“ grün, „Das steckt dahinter“ violett mit Buch. Mini-Aufgaben als Knöpfe (zuordnen als Pillen, Reihenfolge durch Anklicken mit Nummern), der Vergleich als drei Karten in den Tönen Violett, Orange, Lagune, die nach Rang die Plätze tauschen, darunter „Was ist wichtiger?“ in drei Stufen. Schulstart mit Bilanzkarte im Ton des Ergebnisses. Bewegung nur als kurzes Einblenden und Füllen der Balken; bei reduzierter Bewegung keine.
3. **Theorie als Themen, ohne Rahmen (O-38).** Lernseiten nutzen Schriften, Farben und Bausteine des Stils, aber keinen Navy-Rahmen und keine Instrumente: eine Lesespalte (≤ 72 Zeichen), Themenverzeichnis links ab 1100 px. Bauplan nur im Kopf jedes Themas (Rasterpapier mit Motiv je Teil und Illustration je Thema, O-55), darunter ruhige Fläche ohne Hintergrund. Keine Kapitelnummern, kein Originaltext, keine Zitierangaben.
4. **Farbsemantik (O-11).** **Koralle** steht für Offenes, Ungeklärtes und Risiken (Warnhinweis, „vorher“), **Türkis/Frischgrün** für Geklärtes, IDs und Ergebnisse („nachher“); Ampelfarben bleiben dem Status vorbehalten (Grundsatz 7). Navy und Gold tragen Marke, Titel und Hauptaktionen. Keine Fläche bekommt eine eigene Farbe außerhalb der Tokens.
5. **Marke und Grundtöne.** Navy #0C1C33 und Gold (#A8823C, hell #C69D52) für Titel, Hauptknöpfe, Regie und Leinwand. Petrol #146878 ist der Grundton der Theorie; Grün #349068 nur als Grafikfarbe (als Text zu hell).
6. **Explore aus dem Inneren.** Die Werkzeuge (Rechner für den gewichteten Vergleich, Risikomatrix, Vorgangsarten, Takt, Glossar) sind über Tür und Kopf erreichbar, nie als Hauptweg; Regie und Leinwand (O-46) behalten den Navy-Grund.
7. **Status nie ohne Symbol oder Text.** Ampelfarben sind für Status reserviert (O-11). Jeder Status hat eine Form (ok = Kreis mit Haken, mittel = Raute mit Strich, kritisch = Dreieck mit Ausrufezeichen, neutral = Punkt) **und** ein Wort; für Screenreader steht der Wert als Text (`.nur-sr`).
8. **Marke (Bauherr Mentoren).** Logo nur als SVG aus `quellen/marke/` mit `fill="currentColor"`: Navy auf hellen Flächen, weiß oder Gold-hell auf Navy, nie verzerrt. Unter 96 px Höhe die **Bildmarke** (Wortmarke wäre unlesbar) und daneben der Name als Text; das Gesamtlogo ab 96 px. Kennzeichnung „Fiktiver Fall“ (O-3, O-45) klein und sachlich; Links zu bauherr-mentoren.com sachlich und leise (O-44).

## Typorollen

Fünf Familien, eingebettet als woff2 (latin + latin-ext), nur diese Schnitte (L-2; gemessen im Prototyp):

| Rolle | Familie · Schnitt | Token / Klasse | Verwendung |
|---|---|---|---|
| Anzeige | Big Shoulders Display 800 | `--typo-anzeige`, `--typo-kennzahl` | Titel der Story-Schritte, Kennzahlen, Statuswerte, Themennummern |
| Tafeltitel | IBM Plex Sans 700, 21 px | `--typo-tafeltitel` | Entscheidungsfrage, Werkzeug- und Tafeltitel |
| Fließtext | IBM Plex Sans 400, 15 px/1,45 | `--typo-text` | alles Übrige |
| Lesetext | IBM Plex Sans 400, 17 px/1,6 | `--typo-lese`, `.lesetext` | Theorie |
| Klein | IBM Plex Sans 400, 13 px/1,4 | `--typo-klein` | Nebentext |
| Hervorhebung | IBM Plex Sans 500/600/700 | `em`, `strong` | `em` ist **aufrecht, 600** (kein Kursivschnitt eingebettet) |
| Label | Barlow Condensed 600, 12 px, Versalien, +0,1em | `--typo-label`, `.t-label` | Beschriftungen |
| Kicker | Barlow Condensed 600, 13 px, Versalien, +0,12em | `--typo-kicker` | Zeile über Titeln |
| Reiter | Barlow Condensed 700, 14 px, Versalien | `--typo-reiter` | Kopf-Bereiche, Feldtitel, Marken |
| Mono | IBM Plex Mono 500/600 | `--typo-mono`, `.mono`, `.id-marke` | IDs (`ENT-017`), Zeiten, Versionen |

Barlow Condensed 500 ist eingebettet für schmale Schrift ohne eigenes Gewicht (Achsen, Zeitlineal). Größenskala: `--gr-xs` 12 · `--gr-s` 13 · `--gr-m` 14 · `--gr-text` 15 · `--gr-l` 16 · `--gr-xl` 18 · `--gr-2xl` 21 · `--gr-3xl` 24 · `--gr-4xl` 28 · `--gr-5xl` 34 · `--gr-7xl` 64 (px); `--gr-lese` 17. Kleinste Schrift 11,5 px – nur für Versal-Labels sowie Kennungen in Mono; Nebentext nie unter 12 px; Fließtext nie unter 13 px. Deutsche Silbentrennung (`hyphens: auto`) für Absätze, Listen, Zitate und Tabellenzellen unter `lang="de"`; Titel, Labels, IDs und Tasten werden nie getrennt.

## Farben

Alle Werte stehen in `src/stil/tokens.css` (Quelle je Wert im Kommentar). Komponenten nutzen nur `var(--…)`; ein Test (`tests/stil-tokens.test.ts`) verbietet Farbwerte außerhalb der Tokens. Tokens, die keine Fläche mehr nutzt, werden gelöscht (P16.14, O-41).

| Gruppe | Tokens |
|---|---|
| Marke (O-11, BM-Kern) | `--navy` #0C1C33 · `--navy-soft` #1D3258 · `--navy-2` #13274A · `--navy-linie` #2A4068 · `--gold` #A8823C · `--gold-hell` #C69D52 · `--gold-kante` #9A7736 · `--gold-hover` #D6AE66 · `--gold-text` #7A5C1E · `--petrol` #146878 · `--gruen` #349068 |
| Flächen und Text | `--grund` #EEF1F5 · `--weiss` #FFFFFF · `--tinte` #0F1722 · `--tinte-2` #4B5563 · `--tinte-leise` #5A6B82 · `--tinte-instrument` #34435A · `--linie` #D5DCE6 · `--linie-2` #C3CDD9 · `--linie-3` #AEB9C8 · `--auf-navy` #E8EDF6 · `--auf-navy-2` #A9B8CE · `--flaeche-1` #F6F8FB · `--flaeche-2` #F3F5F8 · `--flaeche-3` #F4F7FB · `--flaeche-4` #E9EFF6 · `--spur` #DCE3EB · `--knopf-sockel` #CDD5E0 · `--knopf-sockel-navy` #050D19 · `--gesperrt` #CBD3DE · `--gesperrt-text` #3C4A5E |
| Koralle (offen, Risiko; O-11) | `--koralle` #E4572E · `--koralle-text` #B23E1A · `--koralle-soft` #FDEBE5 · `--koralle-hauch` #FFF4F0 · `--koralle-kante` #F4C3B2 |
| Türkis (geklärt, mit Regel; O-11) | `--tuerkis` #12A4A0 · `--tuerkis-text` #0B7A77 · `--tuerkis-soft` #E6F5F4 · `--tuerkis-hauch` #F4FBFA · `--frischgruen` #3FB57A · `--frischgruen-text` #237A4E |
| Akzent Bericht (Story) | `--rolle-ps-text` #146878 |
| Akzentpalette (O-57) | `--akzent-<ton>`, `--akzent-<ton>-soft`, `--akzent-<ton>-text` für sonne · orange · beere · violett · blau · lagune · gruen (Werte und Rollen: Abschnitt „Akzentpalette (O-57)“) |
| Isometrischer Campus (O-53) | `--iso-*` (Himmel je Licht, Rasen je Jahreszeit, Schnee, Erde, Holz, Beton, Glas, Laub, Haut, Fahrzeuge); nur Flächen der Illustration, nie Text |
| Figuren und Gegenstände (O-51) | `--fig-*` (Haut in vier Tönen, Haar, Mund, Erkennungszeichen wie Lesebändchen, Messing, Helm, Papier); Kleidung im Figurenton `--akzent-*`; nur Flächen der Illustration, nie Text |
| Status (BM-Ampel; nur für Status, O-11) | `--status-rot` #9A3030 · `--status-rot-soft` #F1D8D8 · `--status-gelb-soft` #F3E9C8 · `--status-gelb-text` #7F620F · `--status-gelb-symbol` #A47E1E · `--status-gruen` #3A7A43 · `--status-gruen-soft` #DFEADF · `--status-gruen-text` #2B5C33 · `--status-neutral` #5A6B82 · `--status-neutral-soft` #E8EDF6 · `--status-gelb-kante` #D9C27A · `--status-gruen-kante` #A9C8AD |
| Gold-Flächen | `--gold-soft` #FFF7E3 · `--gold-soft-kante` #E8CF97 |
| ID-Marken (Kürzel der Vorgangsarten, O-15) | `--id-ent-grund` #E8EDF6 · `--id-ent-text` #1D3258 · `--id-ris-grund` #E6F5F4 · `--id-ris-text` #0B7A77 · `--id-frw-grund` #FFF3C4 · `--id-frw-text` #6A5208 · `--id-aen-grund` #FFF7E3 · `--id-aen-text` #7A5C22 · `--id-mas-grund` #EAF5EE · `--id-mas-text` #1D5B33 · `--id-nac-grund` #EDEAF4 · `--id-nac-text` #5B3F93 · `--id-prb-grund` #FDEBE5 · `--id-prb-text` #8A2E12 |
| Transparente Töne | `--gold-hell-a18` rgba(198, 157, 82, .18) · `--gold-hell-a28` rgba(198, 157, 82, .28) · `--gold-hell-a45` rgba(198, 157, 82, .45) · `--gold-hell-a60` rgba(198, 157, 82, .6) · `--weiss-a85` rgba(255, 255, 255, .85) |
| Fokus | `--fokus` #0C1C33 · `--fokus-hof` rgba(198, 157, 82, .6) |

**Semantik über Attribute** (in `basis.css`), damit Komponenten keine Farben kennen müssen:

| Attribut | setzt | Werte |
|---|---|---|
| `data-status` | `--status-farbe`, `--status-soft`, `--status-text` | `ok` · `mittel` · `kritisch` · `neutral` |

Gelb als Grafik (Raute, Balken) ist `--status-gelb-symbol` #A47E1E (BM-Warnkante), weil #B08820 auf hellen Flächen nur 2,9:1 erreicht; gelber **Text** ist `--status-gelb-text` #7F620F.

### Akzentpalette (O-57)

Die Markenfarben (Navy, Gold, Petrol, Koralle, Türkis; O-11) bleiben Basis und tragen Marke, Titel und Hauptaktionen. Dazu kommen **sieben kräftige Akzenttöne** für Story und Themen – farbenfroh, aber gedeckt genug, um neben Navy und Gold ruhig zu wirken. Jeder Ton hat drei Stufen:

- **Grundton** `--akzent-<ton>`: Balken, Symbole, Flächen in Illustrationen, Kanten. Als Grafik ≥ 3:1 auf Weiß (außer Sonne) und auf Navy.
- **Fläche** `--akzent-<ton>-soft`: helle Karte oder Abbildungsgrund; trägt `--tinte` und den Textton.
- **Textton** `--akzent-<ton>-text`: Kicker, Nummern, Labels; ≥ 4,5:1 auf Weiß, `--grund` und der eigenen Fläche; Weiß darauf ≥ 4,5:1 (Marke).

| Ton | Grundton | Fläche | Textton | Text auf Weiß | Text auf Fläche | Grundton auf Weiß / Navy |
|---|---|---|---|---|---|---|
| Sonne | #E0A21B | #FCF0D2 | #7A5410 | 6,8:1 | 6,0:1 | 2,2:1 (nur mit Kante im Textton) / 7,6:1 |
| Orange | #E2703A | #FCE6D9 | #A2441A | 6,2:1 | 5,2:1 | 3,2:1 / 5,4:1 |
| Beere | #D6456B | #FBE2E9 | #A3294B | 7,1:1 | 5,8:1 | 4,3:1 / 4,0:1 |
| Violett | #8061CC | #EEE9FA | #5B3FA8 | 7,7:1 | 6,5:1 | 4,7:1 / 3,7:1 |
| Blau | #3A82CF | #E2EEFA | #1D5C9C | 6,9:1 | 5,8:1 | 4,0:1 / 4,3:1 |
| Lagune | #17A096 | #DCF2EF | #0D6F68 | 6,0:1 | 5,2:1 | 3,2:1 / 5,3:1 |
| Grün | #4E9F44 | #E4F2DF | #2E6B29 | 6,5:1 | 5,6:1 | 3,3:1 / 5,2:1 |

**Feste Rollen** (`AKZENT_ROLLEN` in `src/stil/akzente.ts`, ohne Doppelung): Teile der Themen I Grundlagen = Grün · II Führungsmodell und Arbeitsweise = Lagune · III Anwendung und Einführung = Orange · IV Werkzeuge der Praxis = Violett (O-54, O-55); Balken der Story Geld = Sonne · Zeit = Blau · Vertrauen = Beere (O-52). **Figuren** (O-51) bekommen je einen Ton als Kleidungsfarbe; Vorschlag: Bürgermeisterin Violett, Projektsteuerin Lagune, Architekt Blau, Schulleiterin Orange, Bauleiter Sonne – neben den Balken nie als einzige Unterscheidung (Name und Bild tragen die Bedeutung).

Regeln: Akzenttöne sind keine Statusfarben (Ampel bleibt Status, O-11) und nie die einzige Bedeutungsträgerin. Text in Akzentfarbe nur im Textton. Alle Paare stehen unten in der Tabelle; `tests/stil-akzente.test.ts` prüft Vollständigkeit und Kontrast, `tests/stil-kontrast.test.ts` jeden Wert. Kein Dunkelmodus (siehe `tokens.css`): die Seite bleibt hell mit Navy-Rahmen; „dunkel“ zeigt nur die Illustration im Abendlicht.

### Isometrischer Campus (O-53)

`campusIso(stufe, { jahreszeit, licht, himmel, klasse })` aus `src/grafik/campus-iso.ts` liefert den Schulcampus Lindenhall-Süd als flache isometrische Illustration (SVG-Zeichenkette, `role="img"`, `aria-label` und `<title>` je Stufe, Jahreszeit und Licht, mit „fiktiver Fall“). Stufen: 0 Grundstück mit Bauzaun, Bauschild „Hier baut die Stadt Lindenhall“ und Vermessung · 1 Baugrube mit Bagger, Kipper, Containern · 2 Rohbau Gesamtschule mit Turmdrehkran, Gerüst, Fahrmischer · 3 Holzbau (Kran hebt Holzelemente) · 4 Gesamtschule fertig, Holztragwerk der Sporthalle · 5 Sporthalle fertig, Grundschule im Rohbau · 6 Außenanlagen (Pflaster, junge Bäume, Walze) · 7 fertig ohne Menschen · 8 Schulstart mit Kindern, Fahrrädern und Schulbus. Jahreszeit (`fruehling` · `sommer` · `herbst` · `winter`) färbt Rasen, Gründächer und Laub, bringt Blüten, fallende Blätter oder Schnee; Licht (`morgen` · `tag` · `abend`) wechselt Himmel, Sonne, Schattenrichtung und Seitenlicht, abends leuchten Fenster und Laternen. Deterministisch (feste Streuung statt Zufall), keine Animation, keine fremden Ressourcen; Farben nur über Klassen aus `grafik.css` und `--iso-*`/`--akzent-*`. Ansehen: `node werkzeuge/grafik-vorschau.mjs` (PNG nach `tmp/grafik/`).

### Bilder der Themen (O-55, P17.9)

`src/grafik/themen-bilder.ts` liefert zwei reine SVG-Zeichenketten, beide Schmuck neben einer Überschrift (`aria-hidden`, ohne Schrift, ohne Kennungen, deterministisch):

- `kopfMotiv(teil)` – Bauplan als Kopf-Hintergrund, 800 × 260 Rasterpapier (feine Linien alle 20, kräftigere alle 100 im Grundton des Teils), rechts das Motiv des Teils als feine Linienzeichnung im Textton mit goldenen Maßketten: **I** Grundriss mit Wandstärken, Türen, Treppe, Achsen und Fundamentschnitt · **II** Tragwerk mit Fachwerkdach, Aussteifung, Knoten und Gerüst · **III** Baustelle mit Turmdrehkran, Last und Rohbau · **IV** Planblatt mit Schriftfeld, Geodreieck, Maßstab, Zirkel und Bleistift · **Anhang** Planschrank mit Rücken, Rollen und Registerkarten · `alle` (Inhaltsverzeichnis) die vier Motive klein als Fries, jedes in der Farbe seines Teils. `preserveAspectRatio="xMaxYMid slice"`: das Motiv bleibt rechts sichtbar, links liegt ein Schleier in der Fläche des Teils unter dem Titel.
- `themaBild(thema)` – Illustration je Thema (160 × 160, weiße Scheibe mit Ring im Grundton, Bodenschatten, drei Funken): Überblick Kompass auf Plan · Ausgangslage Fragezeichen über der Bauakte · Begriffsrahmen zwei Puzzleteile · Verantwortungsfelder Schild mit Haus und Siegel · Führungsmodell Fahne auf gestuftem Sockel · Arbeitsweise Vorgang im Kreislauf · Ergebnisbild Stempel und Siegel · Leistungsarchitektur drei Ebenen · Implementierung Zahnräder mit Schlüssel · Anwendungssituationen Bauherr mit Helm und Plan · Neuinitialisierung Neustart-Pfeil mit Kompassnadel · Was Bauherren gewinnen steigende Säulen · Glossar aufgeschlagenes Buch · Entscheidungsvorlage Waage mit zwei Optionen · Vorgänge Warndreieck vor der Liste · Takt Kalenderblatt mit Säulen und Uhr; `uebersicht` Buch mit vier Registerfahnen in den Farben der Teile.

Farben nur über Klassen (`km-*`, `tb-*` in `theorie.css`): Flächen `--teil` (Grundton), `--teil-text` (dunkel), `--teil-soft` (hell), dazu Weiß, Navy, Gold (`--gold-hell`, `--gold`, `--gold-kante`) und `--fig-haut-1`. `tests/themen-bilder.test.ts` prüft Vollständigkeit (jedes Thema), Determinismus, Wohlgeformtheit, keine Farbwerte/Ressourcen/Kennungen und dass jede Klasse gestaltet ist.

### Figuren und Gegenstände (O-51)

`portraet(figur, { groesse, stimmung, dekorativ, klasse })` aus `src/grafik/figuren.ts` zeichnet die Spielfigur „Sie“ (von schräg hinten, ohne Gesicht, goldener Helm unter dem Arm, Mappe) und die fünf Figuren nach den Porträtbeschreibungen im Drehbuch als flaches Brustbild im Dreiviertelprofil (Blick nach rechts, zur Sprechblase) auf rundem Farbfeld im Figurenton (`FIGUR_AKZENT`: Grundstein Violett, Faden Lagune, Schwung Blau, Klingel Orange, Lot Sonne; „Sie“ Gold der Marke). Größen: `'gross'` 200 px (Steckbrief, Vorgabe), `'klein'` 56 px (Avatar, ohne feine Details) oder eine Zahl; Stimmungen `neutral` · `froh` · `besorgt` für Folge-Szenen. Das Rundbild kommt ohne Clip-Pfad und ohne Kennungen aus (Schultern enden mit einem Bogen auf dem Rand), damit beliebig viele Porträts auf einer Seite stehen können, auch ausgeblendete. `gimmick(name, { groesse })` liefert die Gegenstände der Grafik-Liste (`GIMMICKS`: Bauzaun, Warnschild, Kostenzettel, zwei Zahlenzettel, Lastwagen mit Holz, Holzstapel, Lupe, Waage mit drei Schalen, Mensatablett, Grundriss mit Erweiterung, Gerüst im Sturm, Lüftungsgerät, Handglocke, Schulbus, Kärtchen „Wer entscheidet was“, Pokal, Projektblatt, Notizzettel, Telefon, Kalender, Absperrband, Stempel, Rednerpult, Schlüsselbund, Buch, Übergabemappe, Matrix, Sonne über dem Campus, Wegweiser, Stoppuhr, Brücke mit Riss) auf 120 × 120 Einheiten, Vorgabe 96 px. Beide mit `role="img"`, deutschem `aria-label` und `<title>`, oder mit `dekorativ: true` als `aria-hidden`; Farben nur über `fig-*`/`gm-*`-Klassen in `grafik.css`. Ansehen: `node werkzeuge/grafik-vorschau.mjs --figuren`.

### Erlaubte Text/Grund-Paare

Nur diese Paare dürfen Text (bzw. bei „Grafik“ Symbole, Ränder, Fokusringe) tragen. Die Liste steht in `src/stil/paare.json`; `tests/stil-kontrast.test.ts` rechnet jeden Wert gegen `tokens.css` nach und vergleicht diese Tabelle mit der Liste. Grenzen: Text ≥ 4,5:1 · „groß“ (≥ 24 px oder ≥ 18,66 px fett) ≥ 3:1 · „Grafik“ (WCAG 1.4.11) ≥ 3:1. Derzeit braucht kein Textpaar die Ausnahme „groß“.

<!-- paare:anfang -->
| Text | Grund | Kontrast | Art | Verwendung |
|---|---|---|---|---|
| `--tinte` #0F1722 | `--weiss` #FFFFFF | 18,0:1 | Text | Fließtext auf Karten, Tafeln, Seitenleiste |
| `--tinte` #0F1722 | `--grund` #EEF1F5 | 15,9:1 | Text | Fließtext auf Start, Story, Theorie, Explore |
| `--tinte` #0F1722 | `--flaeche-3` #F4F7FB | 16,8:1 | Text | Ebene 2, Zitatblock |
| `--tinte` #0F1722 | `--flaeche-4` #E9EFF6 | 15,6:1 | Text | Ebene 3 |
| `--tinte` #0F1722 | `--gold-soft` #FFF7E3 | 16,9:1 | Text | gewählte Option, Lehre, aktuelle LPH |
| `--tinte` #0F1722 | `--koralle-hauch` #FFF4F0 | 16,7:1 | Text | ungeklärte Punkte (Koralle) |
| `--tinte` #0F1722 | `--tuerkis-hauch` #F4FBFA | 17,2:1 | Text | geklärte Punkte (Türkis) |
| `--tinte` #0F1722 | `--status-neutral-soft` #E8EDF6 | 15,3:1 | Text | Chips der Kurzlage |
| `--tinte` #0F1722 | `--status-gelb-soft` #F3E9C8 | 14,8:1 | Text | Rückmeldung (mittel) |
| `--tinte` #0F1722 | `--status-gruen-soft` #DFEADF | 14,6:1 | Text | Rückmeldung (ok) |
| `--tinte-2` #4B5563 | `--weiss` #FFFFFF | 7,6:1 | Text | leiser Text, Labels |
| `--tinte-2` #4B5563 | `--grund` #EEF1F5 | 6,7:1 | Text | leiser Text auf Grund |
| `--tinte-2` #4B5563 | `--flaeche-1` #F6F8FB | 7,1:1 | Text | Tabellenkopf |
| `--tinte-2` #4B5563 | `--flaeche-2` #F3F5F8 | 6,9:1 | Text | Versionen, Einträge |
| `--tinte` #0F1722 | `--flaeche-2` #F3F5F8 | 16,5:1 | Text | Sandbox-Einträge, Sim-Stufen |
| `--tinte` #0F1722 | `--koralle-soft` #FDEBE5 | 15,6:1 | Text | Vorher, Warnhinweis |
| `--tinte` #0F1722 | `--tuerkis-soft` #E6F5F4 | 16,1:1 | Text | Nachher, geklärter Stand |
| `--tinte-2` #4B5563 | `--flaeche-3` #F4F7FB | 7,0:1 | Text | Nebentext im Zitatblock |
| `--tinte-2` #4B5563 | `--gold-soft` #FFF7E3 | 7,1:1 | Text | Nebentext auf Gold-Fläche |
| `--tinte-2` #4B5563 | `--koralle-hauch` #FFF4F0 | 7,0:1 | Text | Nebentext auf Koralle-Hauch |
| `--tinte-2` #4B5563 | `--status-neutral-soft` #E8EDF6 | 6,4:1 | Text | Nebentext im Chip |
| `--tinte-leise` #5A6B82 | `--weiss` #FFFFFF | 5,4:1 | Text | noch nicht erreichte Prüfpunkte |
| `--navy` #0C1C33 | `--weiss` #FFFFFF | 17,1:1 | Text | Titel, aktive Reiter |
| `--navy` #0C1C33 | `--grund` #EEF1F5 | 15,1:1 | Text | Titel der Startseite und Themen; Fokusring auf hellen Flächen |
| `--navy` #0C1C33 | `--gold-hell` #C69D52 | 6,8:1 | Text | Weiter-Knopf, Wahl-Chip, Sprunglink |
| `--navy` #0C1C33 | `--gold-soft` #FFF7E3 | 16,0:1 | Text | aktuelle LPH, Markierung |
| `--navy` #0C1C33 | `--status-neutral-soft` #E8EDF6 | 14,5:1 | Text | Neustart-Knopf |
| `--navy-soft` #1D3258 | `--weiss` #FFFFFF | 12,7:1 | Text | Links, Querverweis |
| `--navy-soft` #1D3258 | `--grund` #EEF1F5 | 11,2:1 | Text | Gedächtnis-Zeile |
| `--navy-soft` #1D3258 | `--flaeche-2` #F3F5F8 | 11,7:1 | Text | Text im Vergleich |
| `--navy-soft` #1D3258 | `--flaeche-3` #F4F7FB | 11,8:1 | Text | Label im Zitatblock |
| `--weiss` #FFFFFF | `--navy` #0C1C33 | 17,1:1 | Text | Text auf Navy (Regie, Sprunglink, Ebene 4) |
| `--weiss` #FFFFFF | `--navy-soft` #1D3258 | 12,7:1 | Text | aktueller Fortschrittsschritt, erledigte LPH |
| `--weiss` #FFFFFF | `--navy-2` #13274A | 14,8:1 | Text | Schließen-Knopf |
| `--weiss` #FFFFFF | `--koralle-text` #B23E1A | 5,8:1 | Text | Hinweismarke auf Koralle |
| `--weiss` #FFFFFF | `--tuerkis-text` #0B7A77 | 5,2:1 | Text | Marke auf Türkis, aktuelle Version |
| `--auf-navy` #E8EDF6 | `--navy` #0C1C33 | 14,5:1 | Text | Text in Regie und Leinwand |
| `--auf-navy` #E8EDF6 | `--navy-2` #13274A | 12,6:1 | Text | Knöpfe und Fortschritt im Rahmen |
| `--auf-navy` #E8EDF6 | `--navy-soft` #1D3258 | 10,8:1 | Text | Tabellenkopf Register, erledigte LPH |
| `--auf-navy-2` #A9B8CE | `--navy` #0C1C33 | 8,5:1 | Text | leiser Text auf Navy |
| `--auf-navy-2` #A9B8CE | `--navy-2` #13274A | 7,4:1 | Text | offene Fortschrittsschritte |
| `--auf-navy-2` #A9B8CE | `--navy-soft` #1D3258 | 6,3:1 | Text | leiser Text auf aktivem Schritt |
| `--gold-hell` #C69D52 | `--navy` #0C1C33 | 6,8:1 | Text | Labels und Tasten auf Navy; Fokusring im Rahmen |
| `--gold-hell` #C69D52 | `--navy-2` #13274A | 5,9:1 | Text | Knöpfe der Regie |
| `--gold-hell` #C69D52 | `--navy-soft` #1D3258 | 5,1:1 | Text | aktueller Schritt auf Navy |
| `--gold-text` #7A5C1E | `--weiss` #FFFFFF | 6,2:1 | Text | Kernaussage-Label |
| `--gold-text` #7A5C1E | `--grund` #EEF1F5 | 5,5:1 | Text | Kicker der Startseite |
| `--gold-text` #7A5C1E | `--gold-soft` #FFF7E3 | 5,8:1 | Text | heller Vermerk |
| `--petrol` #146878 | `--weiss` #FFFFFF | 6,4:1 | Text | Kicker der Theorie-Tür, Themennummer |
| `--petrol` #146878 | `--grund` #EEF1F5 | 5,6:1 | Text | Themennummer, Bereich |
| `--koralle` #E4572E | `--navy` #0C1C33 | 4,6:1 | Text | Koralle als Kennfarbe auf Navy |
| `--tuerkis` #12A4A0 | `--navy` #0C1C33 | 5,6:1 | Text | Türkis als Kennfarbe auf Navy |
| `--koralle-text` #B23E1A | `--weiss` #FFFFFF | 5,8:1 | Text | Koralle-Text: offen, Risiko, Konsequenz |
| `--koralle-text` #B23E1A | `--grund` #EEF1F5 | 5,2:1 | Text | Koralle-Text auf Grund |
| `--koralle-text` #B23E1A | `--koralle-soft` #FDEBE5 | 5,1:1 | Text | Marke Vorher, Warnung |
| `--koralle-text` #B23E1A | `--koralle-hauch` #FFF4F0 | 5,4:1 | Text | Gegenüberstellung (vorher) |
| `--koralle-text` #B23E1A | `--flaeche-1` #F6F8FB | 5,5:1 | Text | Tabellenkopf (vorher) |
| `--tuerkis-text` #0B7A77 | `--weiss` #FFFFFF | 5,2:1 | Text | Türkis-Text: geklärt, IDs |
| `--tuerkis-text` #0B7A77 | `--grund` #EEF1F5 | 4,6:1 | Text | Türkis-Text auf Grund |
| `--tuerkis-text` #0B7A77 | `--tuerkis-soft` #E6F5F4 | 4,6:1 | Text | Marke Nachher, geklärt |
| `--tuerkis-text` #0B7A77 | `--tuerkis-hauch` #F4FBFA | 4,9:1 | Text | Türkis-Flächen |
| `--tuerkis-text` #0B7A77 | `--flaeche-1` #F6F8FB | 4,9:1 | Text | Tabellenkopf (nachher) |
| `--navy-soft` #1D3258 | `--koralle-soft` #FDEBE5 | 11,0:1 | Text | Vergleichsmarke (linke Hälfte) |
| `--navy-soft` #1D3258 | `--tuerkis-soft` #E6F5F4 | 11,4:1 | Text | Vergleichsmarke (rechte Hälfte) |
| `--frischgruen-text` #237A4E | `--weiss` #FFFFFF | 5,3:1 | Text | positive Rückmeldung |
| `--status-rot` #9A3030 | `--weiss` #FFFFFF | 7,4:1 | Text | Status kritisch als Text |
| `--status-rot` #9A3030 | `--status-rot-soft` #F1D8D8 | 5,5:1 | Text | Badge kritisch, Prüfpunkt fehlt |
| `--status-gelb-text` #7F620F | `--weiss` #FFFFFF | 5,7:1 | Text | Status mittel als Text |
| `--status-gelb-text` #7F620F | `--status-gelb-soft` #F3E9C8 | 4,7:1 | Text | Badge mittel |
| `--status-gruen-text` #2B5C33 | `--weiss` #FFFFFF | 7,8:1 | Text | Status ok als Text |
| `--status-gruen-text` #2B5C33 | `--status-gruen-soft` #DFEADF | 6,3:1 | Text | Badge ok, gelöste Frage |
| `--status-neutral` #5A6B82 | `--weiss` #FFFFFF | 5,4:1 | Text | Status neutral als Text |
| `--status-neutral` #5A6B82 | `--status-neutral-soft` #E8EDF6 | 4,6:1 | Text | Badge neutral, Prüfpunkt offen |
| `--gesperrt-text` #3C4A5E | `--gesperrt` #CBD3DE | 6,0:1 | Text | gesperrter Knopf |
| `--rolle-ps-text` #146878 | `--weiss` #FFFFFF | 6,4:1 | Text | Titel des Berichts in der Story |
| `--id-ent-text` #1D3258 | `--id-ent-grund` #E8EDF6 | 10,8:1 | Text | ID-Marke ENT- |
| `--id-ris-text` #0B7A77 | `--id-ris-grund` #E6F5F4 | 4,6:1 | Text | ID-Marke RIS- |
| `--id-prb-text` #8A2E12 | `--id-prb-grund` #FDEBE5 | 7,3:1 | Text | ID-Marke PRB- (Story) |
| `--id-frw-text` #6A5208 | `--id-frw-grund` #FFF3C4 | 6,7:1 | Text | ID-Marke FRW- |
| `--id-aen-text` #7A5C22 | `--id-aen-grund` #FFF7E3 | 5,8:1 | Text | ID-Marke AEN- |
| `--id-mas-text` #1D5B33 | `--id-mas-grund` #EAF5EE | 7,2:1 | Text | ID-Marke MAS- |
| `--id-nac-text` #5B3F93 | `--id-nac-grund` #EDEAF4 | 6,9:1 | Text | ID-Marke NAC- |
| `--weiss` #FFFFFF | `--status-gelb-symbol` #A47E1E | 3,8:1 | Grafik | Zeichen in der Raute (mittel) |
| `--weiss` #FFFFFF | `--status-gruen` #3A7A43 | 5,2:1 | Grafik | Haken im Kreis, Prüfkästchen erfüllt, Freigabe-Marke |
| `--gold-kante` #9A7736 | `--grund` #EEF1F5 | 3,7:1 | Grafik | Außenkante gewählte Option, Reiter-Unterstrich |
| `--gold-kante` #9A7736 | `--weiss` #FFFFFF | 4,1:1 | Grafik | Reiter-Unterstrich, aktuelle LPH |
| `--koralle` #E4572E | `--weiss` #FFFFFF | 3,7:1 | Grafik | Linien und Kanten Koralle |
| `--tuerkis` #12A4A0 | `--weiss` #FFFFFF | 3,1:1 | Grafik | Rahmen und Kanten Türkis |
| `--akzent-sonne-text` #7A5410 | `--weiss` #FFFFFF | 6,8:1 | Text | Akzent Sonne: Kicker, Nummer, Label |
| `--akzent-sonne-text` #7A5410 | `--grund` #EEF1F5 | 6,0:1 | Text | Akzent Sonne auf Grund |
| `--akzent-sonne-text` #7A5410 | `--akzent-sonne-soft` #FCF0D2 | 6,0:1 | Text | Akzent Sonne: Marke auf eigener Fläche |
| `--tinte` #0F1722 | `--akzent-sonne-soft` #FCF0D2 | 15,9:1 | Text | Fließtext auf Fläche Sonne |
| `--weiss` #FFFFFF | `--akzent-sonne-text` #7A5410 | 6,8:1 | Text | Marke weiß auf Sonne |
| `--akzent-sonne` #E0A21B | `--navy` #0C1C33 | 7,6:1 | Grafik | Balken und Symbol Sonne auf Navy (Leinwand) |
| `--akzent-orange-text` #A2441A | `--weiss` #FFFFFF | 6,2:1 | Text | Akzent Orange: Kicker, Nummer, Label |
| `--akzent-orange-text` #A2441A | `--grund` #EEF1F5 | 5,5:1 | Text | Akzent Orange auf Grund |
| `--akzent-orange-text` #A2441A | `--akzent-orange-soft` #FCE6D9 | 5,2:1 | Text | Akzent Orange: Marke auf eigener Fläche |
| `--tinte` #0F1722 | `--akzent-orange-soft` #FCE6D9 | 15,0:1 | Text | Fließtext auf Fläche Orange |
| `--weiss` #FFFFFF | `--akzent-orange-text` #A2441A | 6,2:1 | Text | Marke weiß auf Orange |
| `--akzent-orange` #E2703A | `--weiss` #FFFFFF | 3,2:1 | Grafik | Balken, Symbol, Kante Orange auf Weiß |
| `--akzent-orange` #E2703A | `--navy` #0C1C33 | 5,4:1 | Grafik | Balken und Symbol Orange auf Navy (Leinwand) |
| `--akzent-beere-text` #A3294B | `--weiss` #FFFFFF | 7,1:1 | Text | Akzent Beere: Kicker, Nummer, Label |
| `--akzent-beere-text` #A3294B | `--grund` #EEF1F5 | 6,2:1 | Text | Akzent Beere auf Grund |
| `--akzent-beere-text` #A3294B | `--akzent-beere-soft` #FBE2E9 | 5,8:1 | Text | Akzent Beere: Marke auf eigener Fläche |
| `--tinte` #0F1722 | `--akzent-beere-soft` #FBE2E9 | 14,7:1 | Text | Fließtext auf Fläche Beere |
| `--weiss` #FFFFFF | `--akzent-beere-text` #A3294B | 7,1:1 | Text | Marke weiß auf Beere |
| `--akzent-beere` #D6456B | `--weiss` #FFFFFF | 4,3:1 | Grafik | Balken, Symbol, Kante Beere auf Weiß |
| `--akzent-beere` #D6456B | `--navy` #0C1C33 | 4,0:1 | Grafik | Balken und Symbol Beere auf Navy (Leinwand) |
| `--akzent-violett-text` #5B3FA8 | `--weiss` #FFFFFF | 7,7:1 | Text | Akzent Violett: Kicker, Nummer, Label |
| `--akzent-violett-text` #5B3FA8 | `--grund` #EEF1F5 | 6,8:1 | Text | Akzent Violett auf Grund |
| `--akzent-violett-text` #5B3FA8 | `--akzent-violett-soft` #EEE9FA | 6,5:1 | Text | Akzent Violett: Marke auf eigener Fläche |
| `--tinte` #0F1722 | `--akzent-violett-soft` #EEE9FA | 15,2:1 | Text | Fließtext auf Fläche Violett |
| `--weiss` #FFFFFF | `--akzent-violett-text` #5B3FA8 | 7,7:1 | Text | Marke weiß auf Violett |
| `--akzent-violett` #8061CC | `--weiss` #FFFFFF | 4,7:1 | Grafik | Balken, Symbol, Kante Violett auf Weiß |
| `--akzent-violett` #8061CC | `--navy` #0C1C33 | 3,7:1 | Grafik | Balken und Symbol Violett auf Navy (Leinwand) |
| `--akzent-blau-text` #1D5C9C | `--weiss` #FFFFFF | 6,9:1 | Text | Akzent Blau: Kicker, Nummer, Label |
| `--akzent-blau-text` #1D5C9C | `--grund` #EEF1F5 | 6,1:1 | Text | Akzent Blau auf Grund |
| `--akzent-blau-text` #1D5C9C | `--akzent-blau-soft` #E2EEFA | 5,8:1 | Text | Akzent Blau: Marke auf eigener Fläche |
| `--tinte` #0F1722 | `--akzent-blau-soft` #E2EEFA | 15,3:1 | Text | Fließtext auf Fläche Blau |
| `--weiss` #FFFFFF | `--akzent-blau-text` #1D5C9C | 6,9:1 | Text | Marke weiß auf Blau |
| `--akzent-blau` #3A82CF | `--weiss` #FFFFFF | 4,0:1 | Grafik | Balken, Symbol, Kante Blau auf Weiß |
| `--akzent-blau` #3A82CF | `--navy` #0C1C33 | 4,3:1 | Grafik | Balken und Symbol Blau auf Navy (Leinwand) |
| `--akzent-lagune-text` #0D6F68 | `--weiss` #FFFFFF | 6,0:1 | Text | Akzent Lagune: Kicker, Nummer, Label |
| `--akzent-lagune-text` #0D6F68 | `--grund` #EEF1F5 | 5,3:1 | Text | Akzent Lagune auf Grund |
| `--akzent-lagune-text` #0D6F68 | `--akzent-lagune-soft` #DCF2EF | 5,2:1 | Text | Akzent Lagune: Marke auf eigener Fläche |
| `--tinte` #0F1722 | `--akzent-lagune-soft` #DCF2EF | 15,4:1 | Text | Fließtext auf Fläche Lagune |
| `--weiss` #FFFFFF | `--akzent-lagune-text` #0D6F68 | 6,0:1 | Text | Marke weiß auf Lagune |
| `--akzent-lagune` #17A096 | `--weiss` #FFFFFF | 3,2:1 | Grafik | Balken, Symbol, Kante Lagune auf Weiß |
| `--akzent-lagune` #17A096 | `--navy` #0C1C33 | 5,3:1 | Grafik | Balken und Symbol Lagune auf Navy (Leinwand) |
| `--akzent-gruen-text` #2E6B29 | `--weiss` #FFFFFF | 6,5:1 | Text | Akzent Grün: Kicker, Nummer, Label |
| `--akzent-gruen-text` #2E6B29 | `--grund` #EEF1F5 | 5,7:1 | Text | Akzent Grün auf Grund |
| `--akzent-gruen-text` #2E6B29 | `--akzent-gruen-soft` #E4F2DF | 5,6:1 | Text | Akzent Grün: Marke auf eigener Fläche |
| `--tinte` #0F1722 | `--akzent-gruen-soft` #E4F2DF | 15,5:1 | Text | Fließtext auf Fläche Grün |
| `--weiss` #FFFFFF | `--akzent-gruen-text` #2E6B29 | 6,5:1 | Text | Marke weiß auf Grün |
| `--akzent-gruen` #4E9F44 | `--weiss` #FFFFFF | 3,3:1 | Grafik | Balken, Symbol, Kante Grün auf Weiß |
| `--akzent-gruen` #4E9F44 | `--navy` #0C1C33 | 5,2:1 | Grafik | Balken und Symbol Grün auf Navy (Leinwand) |
<!-- paare:ende -->

Halbtransparente Flächen (`--weiss-a85` im Seitenkopf) zählen als ihr deckender Nachbar (Weiß); Text liegt dort nur in den Paaren der deckenden Farbe.

## Abstände, Radien, Schatten

- **Abstände im 4er-Raster:** `--a-1` 4 · `--a-2` 8 · `--a-3` 12 · `--a-4` 16 · `--a-5` 20 · `--a-6` 24 · `--a-8` 32 · `--a-10` 40 · `--a-12` 48 · `--a-16` 64 (px). Seitenrand mindestens 16 px, auch bei 400 px Breite. Lücken in Stapeln/Reihen über `--luecke` (`.stapel`, `.reihe`).
- **Radien:** `--radius-xs` 3 (Tags) · `--radius-s` 6 (Chips, kleine Knöpfe) · `--radius-m` 8 (Knöpfe, Felder) · `--radius-l` 10 (Karten) · `--radius-xl` 12 (Optionen, Türen) · `--radius-rund` (Pillen).
- **Schatten:** `--schatten-karte` (Linie + weich) für Karten · `--schatten-karte-hoch` für hervorgehobene Karten · `--schatten-knopf` (+ `-hover`, `-druck`) für den Sockel der Wahlknöpfe · `--schatten-rahmen` (1 px Gold-Haarlinie) · `--schatten-schwebend` (Tooltip, Dialog) · `--schatten-tuer` (Türen der Startseite).
- **Breiten:** Lesespalte `--breite-lesen` 72ch (Theorie), Startseite `--breite-start` 1120 px.

## Bewegung

| Token | Dauer | Wofür |
|---|---|---|
| `--dauer-sofort` | 150 ms | Hover, Druck, Tooltip |
| `--dauer-kurz` | 300 ms | Einblenden kleiner Teile |
| `--dauer-mittel` | 500 ms | Schrittwechsel der Story (`gs-ein`), neue Teile (`auftauchen`, `.anim-einblenden`) |
| (Tafeln) | 420 ms | gestaffelte Glieder und Bausteine der Tafeln (`szene-ein`) |
| `--dauer-lang` | 800 ms | erster Auftritt der Startseite (`start-ein`) |

Kurven: `--kurve-aus` (Schrittwechsel, Einblenden) · `--kurve-pop` (Karten mit leichtem Überschwingen). Gestaffelte Auftritte über `--verzug` (z. B. `style="--verzug:80ms"` je Option).

**Was sich bewegt:** Schrittwechsel der Story, neu erscheinende Teile, Hover und Druck an Optionen und Türen, der erste Auftritt der Startseite. **Was sich nicht bewegt:** Text beim Lesen, Tabellen, die Startseite nach dem ersten Erscheinen. Animationen hängen am Schlüsselwechsel (neuer Schritt, neue Wahl), nie am bloßen Neuzeichnen (ARCHITEKTUR.md).

**Reduzierte Bewegung:** Unter `prefers-reduced-motion: reduce` laufen alle Animationen und Übergänge in 1 ms auf ihren Endzustand, Schleifen enden nach einem Durchgang. Zustände hängen **nie** an einer Animation (alles ist auch ohne Bewegung ablesbar).

## Ikonen

Inline-SVG im 24 × 24-Raster, Strich 1,8, runde Enden und Ecken, `currentColor`, keine Füllung (Ausnahme `vorspulen`). Größe über `font-size` (Ikone = 1em). Immer dekorativ (`aria-hidden="true"`); die Bedeutung trägt ein Text daneben oder `aria-label` am Knopf. Satz: `src/stil/symbole.ts` (`symbol('haken')`), Namen deutsch (u. a. `pfeilRechts`, `haken`, `kreuz`, `warnung`, `dokument`, `eskalieren`, `aktualisieren`, `wechsel`, `stempel`, `tabelle`, `buch`, `person`, `ebenen`). Status-Symbole im 16er-Raster: `statusSymbol('ok'|'mittel'|'kritisch'|'neutral')`.

## Komponentenkatalog

Klassennamen deutsch. Zustände über `ist-…`-Klassen oder ARIA (`aria-current`, `aria-pressed`, `aria-selected`, `aria-expanded`). Markup-Skizzen verkürzt; vollständige Beispiele in `src/ui/`.

### Seitenrahmen
`div.seite[data-bereich] > a.sprung-inhalt + Hintergrund (Bauplan-SVG, `aria-hidden`) + header.seiten-kopf (Bildmarke mit Link zu bauherr-mentoren.com, Name, `nav.kopf-bereiche` Story · Theorie · Explore) + main.seiten-haupt#inhalt + footer.seiten-fuss (Absender, `nav.fuss-links` Impressum · Datenschutz · Präsentieren)`. In `rahmen.css`, Aufbau in `src/ui/bausteine/seite.ts`.

### Knöpfe
`.knopf.knopf-navy` (Hauptaktion, Symbol gold; `:disabled` grau) · `.knopf.knopf-gold` (Weiter-Aktion, Symbol rechts) · `.knopf.knopf-still[aria-pressed]` (stille Aktion oder Wahl). Mindesthöhe 44 px, gedrückt `translateY(1px)`. In `tafeln.css`; die Story hat eigene `.gs-knopf`.

### Status-Symbol, ID-Marke, Merksatz, Hinweis
`svg.status-symbol[data-status] > .form + .zeichen` (Form + Farbe, nie Farbe allein) · `.id-marke[data-art="ent|ris|frw|aen|mas|nac|prb"]` (Kürzel der Vorgangsarten, Form `ENT-017`) · `.lehre` (Merksatz auf Gold-Fläche, Symbol `lesezeichen`) · `.hinweis-zeile` (Symbol `info` + Text). In `tafeln.css`.

### Glossar-Begriff und Tooltip
`span.begriff[role=button]` im Fließtext (gepunktete Unterstreichung, `cursor: help`), Tooltip `div.tipp[role=tooltip] > b + Text + small` (fest positioniert, erscheint bei Maus **und** Tastaturfokus, bleibt offen, solange der Zeiger auf Begriff oder Tooltip steht). In `tafeln.css`, Verhalten in `src/ui/bausteine/tooltip.ts`.

### Tafeln
`figure.tafel[data-form]` aus `src/grafik/tafel.ts` mit gemeinsamen Teilen `.tafel-titel`, `.tafel-auswahl`, `.tafel-detail`, `.tafel-einleitung`; Formen: Wirkungsketten, Mandatsschwelle, Pyramide, Verantwortungsfelder, Bausteine, Phasen und Rhythmus, Karten, Zeitachse. In `tafeln.css`.

### Startseite
```html
<div class="startseite">
  <div class="start-haupt">
    <div class="start-einstieg"><p class="start-kicker">…</p><h1 class="start-titel">…</h1><p class="start-these">…</p><p class="start-internetseite">…</p></div>
    <nav class="tueren" aria-label="…">
      <a class="tuer" data-weg="story" href="#story"><h2 class="tuer-titel"><span class="tuer-kicker">…</span>…</h2><p class="tuer-text">…</p>
        <span class="tuer-meta"><span>8 Stationen</span><span class="tuer-los">Beginnen symbol('pfeilRechts')</span></span></a>
      <a class="tuer" data-weg="theorie" …>…</a>
      <a class="tuer" data-weg="explore" …>…</a>
    </nav>
  </div>
  <section class="start-dahinter"><h2 class="t-label">Wer steht dahinter</h2><p>… <a>bauherr-mentoren.com</a></p></section>
  <p class="start-fiktiv">…</p>
</div>
```
Hintergrund `.start-hintergrund` mit dem Campus (`src/grafik/bauplan.ts`, `campus()`), in `start.css`.

### Story
```html
<header class="gs-leiste"><ol class="gs-punkte">(Fortschrittslinie, je Schritt 24 px Trefferfläche)</ol><div class="gs-status">Kosten · Termin · offene Entscheidungen</div></header>
<section class="gs-schritt">
  <header class="gs-kopf"><p class="gs-kicker">…</p><h1 class="gs-titel">…</h1></header>
  <div class="gs-text">Lage</div>
  <section class="gs-vorlage">Vorlage der Projektsteuerung: <p class="gs-frage">…</p>
    <div class="gs-optionen"><button class="gs-option" aria-pressed="false">…</button>…</div>
    <section class="gs-gewichte"><div class="gs-regler">(Gewichte je Kriterium)</div></section>
    <section class="gs-mcda"><div class="gs-vergleich">(Rangfolge)</div><div class="gs-kipp">…</div></section>
    <section class="gs-empfehlung">…</section></section>
  <section class="gs-entscheidung">Folge · <div class="gs-merksatz">…</div></section>
  <details class="gs-vertiefung"><summary>So läuft es oft</summary>…</details>
  <details class="gs-vertiefung"><summary>Typischer Einwand und Antwort</summary>…</details>
  <nav class="gs-navi">Zurück · Weiter</nav>
</section>
```
Hintergrund `.gs-hintergrund` mit dem Campus im Bau (`stufeAusLph`), sehr dezent. In `geschichte.css`.

### Theorie-Lernseite
```html
<div class="lern-rahmen">
  <nav class="kapitel-verzeichnis-nav" aria-label="Themen"><details class="kapitel-verzeichnis" open><summary class="t-label">Themen</summary><ol class="kapitel-liste themen-liste"><li><a aria-current="page">…</a></li>…</ol></details></nav>
  <main class="lern-inhalt">
    <header class="kapitel-kopf thema-kopf" data-teil="2">
      <div class="kopf-band"><div class="kopf-band-motiv" aria-hidden="true">(kopfMotiv)</div>
        <div class="kopf-band-text"><p class="kapitel-kicker">Teil II · …</p><h1 class="kapitel-titel">5 · …</h1></div>
        <div class="kopf-band-bild" aria-hidden="true">(themaBild)</div></div>
      <div class="kapitel-einstieg">…</div></header>
    <section class="kernaussage"><span class="kernaussage-symbol">(Symbol)</span><div class="kernaussage-text"><span class="t-label">Kernaussage</span><p>…</p></div></section>
    <section class="lern-abschnitt"><h2 class="abschnitt-titel"><span class="abschnitt-symbol">(Symbol)</span><span class="abschnitt-text">…</span></h2><div class="lesetext">(Markdown-HTML)</div> … Bausteine und Text in der Reihenfolge der Quelle</section>
    <details class="aufklapper"><summary class="aufklapper-kopf"><span class="aufklapper-symbol">…</span><span class="aufklapper-titel">…</span><span class="aufklapper-zeichen">↓</span></summary><div class="aufklapper-inhalt lesetext">…</div></details>
    <div class="lernkarten-gruppe"><h3 class="lernkarten-titel">…</h3><div class="lernkarten-einleitung">…</div><div class="lernkarten"><div class="lernkarte">…</div><div class="lernkarte ist-wendekarte" data-seite="vorne">… <button class="lernkarte-wenden" aria-pressed="false">Umdrehen</button></div></div></div>
    <figure class="lern-grafik">(SVG aus src/grafik) <figcaption>…</figcaption></figure>
    <section class="querverweis-block"><a class="querverweis">In der Story erlebt: …</a></section>
    <nav class="kapitel-nav" aria-label="…"><a rel="prev">…</a><a rel="next">…</a></nav>
    <p class="lern-kontakt">… <a>bauherr-mentoren.com</a></p>
  </main>
</div>
```
**Optik der Themen (P17.9, O-55).** Die Farbe des Teils (`data-teil` am Kopf und am Inhalt `.lern-inhalt`, auch im Druckbogen) setzt `--teil`, `--teil-soft`, `--teil-text` (I Grün · II Lagune · III Orange · IV Violett · Anhang Navy). Der **Kopf** ist ein Band auf `--teil-soft` mit Rasterpapier und Motiv des Teils (Kanten­leiste links im Grundton), Kicker im Textton, Titel in Navy (Größe nach dem längsten Wort in der Textspalte, `cqi`), Illustration rechts (156 px; ≤ 700 px über dem Titel, 96 px; das Motiv blasser). Die Einleitung steht unter dem Band. Hinter dem Lesetext liegt **kein** Hintergrund mehr. **Kernaussage**: weiße Karte, Leiste im Grundton, Symbol (64 px, Kreis auf `--teil-soft` mit Ring) – aus `symbol:` der Kernaussage, sonst das Symbol des Themas; Text 22 px halbfett. **Abschnitte**: Symbol in einem 40-px-Feld auf `--teil-soft` vor dem Titel, gewählt nach dem frühesten Stichwort im Titel (`abschnittSymbol`), sonst das Symbol des Themas. **Karten** auf `--teil-soft` mit Kante im Grundton und Titel im Textton; Kartengruppen zeigen Titel (h3 mit Strich im Grundton) und Einleitung. **Karten mit Rückseite** drehen sich mit dem Knopf „Umdrehen“ um die senkrechte Achse (aria-pressed, Ansage „Titel: Rückseite“, die verdeckte Seite ist `inert`); bei `prefers-reduced-motion` ohne Drehung; Leinwand und Druck zeigen beide Seiten untereinander. **Aufklapper** (`::: aufklapper`): Zeile auf `--teil-soft` mit Leiste, Symbol im Ring und Pfeil, Inhalt auf Weiß; auf Leinwand und im Druck offen. Ebenen-Aufklapper (außer Ebene 4), Verständnisfragen und Lernwerkzeuge tragen Leiste bzw. Kante im Grundton. **Abbildungen** liegen auf einer Fläche `--teil-soft` mit Kante oben im Grundton, das Bild auf weißer Karte darin; die Marke „Abbildung N“ ist eine Pille Weiß auf Textton, der Titel in Tinte. Druck: Band entfällt (der Druckkopf trägt Titel), Flächen bleiben hell (`print-color-adjust: exact`), Abbildungsfläche mit 3 mm Innenabstand.

Die Klassennamen `kapitel-…` sind intern geblieben; sichtbar heißt es „Thema“ (O-38). Theorie, Story und Explore zeichnen ihren Inhaltsbereich als `main` (genau eine je Fläche, L-91), das Verzeichnis als `nav` (`display: contents`); Leinwand und Regie-Vorschau betten die Fläche ohne Bedienung ein, die Regie hat ihren eigenen `main` (L-92).

**Abbildung (`.abbildung`, P14, O-32, L-190).** Auf der Lernseite beim Abschnitt:
```html
<figure class="abbildung" data-abbildung="abb-6">
  <div class="abbildung-rahmen"><img class="abbildung-bild" alt="…" width="1200" height="886"></div>
  <figcaption class="abbildung-unterschrift">
    <span class="t-label abbildung-marke">Abbildung 5</span><span class="abbildung-titel">…</span>
  </figcaption>
</figure>
```
Seit P17.9 auf der hellen Fläche des Teils, das Bild auf weißer Karte darin, Bild auf ganzer Spaltenbreite; die Bildunterschrift trägt nur Marke und Titel – keine Abweichungen, kein Vorrang-Satz, keine Angleichungsliste (O-56), kein Knopf „Vergrößern“ und kein Dialog: vergrößert wird mit der Lupe des Browsers (O-55).

### Explore
`.ex-rahmen > .ex-kopf + nav.ex-werkzeuge (je Werkzeug .ex-werkzeug-link) + Werkzeugfläche`: Rechner für den gewichteten Vergleich, Risikomatrix 5 × 5, Vorgangsarten und Wege, Takt, Glossar (O-46). In `explore.css`.

### Regie und Leinwand (O-9, O-46)
`.regie > .regie-kopf + .regie-raster (.regie-links: .regie-vorschau > .vorschau-rahmen > .vorschau-buehne (1280 × 720) · .regie-rechts: .regie-karte, .regie-notiz, .regie-leitfragen, .regie-protokoll-…) + .regie-fuss`; Leinwand `.leinwand` (bzw. `.leinwand-warten`) mit `.anzeige`; `.ist-beamer` vergrößert und verstärkt (siehe „Beamer-Modus“). Navy-Grund mit Gold-Fokus. In `regie.css`.

## Barrierefreiheit

- **Kontrast** nur über die erlaubten Paare oben (≥ 4,5:1; Grafik ≥ 3:1), gemessen im Test.
- **Fokus immer sichtbar:** 3 px Ring (`--fokus`): Navy mit Gold-Hof auf hellen Flächen (Start, Story, Theorie, Explore), Gold-hell auf Navy (Regie). Nie `outline: none` ohne Ersatz; Maus-Klicks zeigen keinen Ring (`:focus-visible`).
- **Tastatur überall:** alle Bedienelemente sind `button`/`a`/`input`; in der Story ←/→ zum Blättern, in der Regie Buchstabentasten für die Wahl.
- **Nie nur Farbe:** Status = Form + Wort, Auswahl = Fläche + Ring + `aria-pressed`, Rangfolge = Platz + Zahl, Vorher/Nachher = Farbe + Wort.
- **Sprache und Struktur:** `lang="de"`, Silbentrennung automatisch, eine `h1` je Fläche, Landmarken (`header`, `nav`, `main`, `footer`), Live-Region für Statusänderungen, `.nur-sr` für Werte, die sonst nur grafisch sind; Sprunglink `.sprung-inhalt` zum Inhalt.
- **Bewegung:** siehe oben; kein Blinken schneller als 3 Hz.
- **Zielgrößen:** Bedienelemente ≥ 36 × 36 px. Ausgenommen sind Textverweise (im Fließtext, in Tabellen und Listen) und die Schritte der Fortschrittslinie; für sie gilt WCAG 2.5.8 (≥ 24 px oder ausreichender Abstand, L-73/L-75).
- **Geräte:** 1280 × 720 (Beamer), 1024 × 768 (iPad quer), 400 px Breite lesbar ohne waagerechtes Scrollen.

## Tabus

- Keine Emojis, keine Clipart, keine Stockfotos; Illustrationen nur selbst gezeichnet als Vektorgrafik: Bauplan-Linien (O-45, Theorie-Köpfe) sowie der isometrische Campus und die Figuren der Story (O-53).
- Keine lila-blauen Verläufe, keine Neon- oder Glaseffekte, keine Schlagschatten auf Text.
- Keine Farben außerhalb von `tokens.css`; keine Ampelfarbe als Dekoration (O-11).
- Keine Kursivschrift (nicht eingebettet), keine weiteren Schriftschnitte, keine Systemschrift als Gestaltungsmittel.
- Kein Logo als Rastergrafik, nicht gestaucht, nicht umgefärbt; keine Wortmarke unter 96 px Höhe.
- Keine Bedienelemente auf der Startseite außer den drei Türen und den leisen Links (O-21).
- Sichtbar nie „Datei“, „HTML“, „App“, „Programm“, „Kundenfassung“ (O-42), kein Bezug zum Whitepaper (O-38).
- Keine Begriffe aus der Verbotsliste (`docs/BEGRIFFE.md`) in Labels, Ikonen-Namen oder Beispieltexten.

## Prüfungen und Werkzeuge

| Befehl | prüft / erzeugt |
|---|---|
| `node --test tests/stil-kontrast.test.ts` | Kontrast aller Paare aus `paare.json` gegen `tokens.css`; diese Tabelle = Liste; O-11-Farben unverändert |
| `node --test tests/stil-akzente.test.ts` | Akzentpalette: je Ton Grundton, Fläche, Textton; Pflicht-Paare vorhanden und kontraststark; Rollen ohne Doppelung |
| `node --test tests/campus-iso.test.ts` | isometrischer Campus: deterministisch, wohlgeformt, `role="img"` mit Beschreibung, keine fremden Ressourcen und Farbwerte, jede Klasse in `grafik.css` |
| `node --test tests/figuren.test.ts` | Porträts und Gegenstände: deterministisch, wohlgeformt, `role="img"` mit deutscher Beschreibung, keine fremden Ressourcen, Farbwerte und Kennungen, jede Klasse in `grafik.css` |
| `node werkzeuge/grafik-vorschau.mjs [--alle]` | PNG-Vorschau des Campus nach `tmp/grafik/` (Stufen, Jahreszeiten, Licht; außerhalb der Kette) |
| `node --test tests/stil-tokens.test.ts` | keine Farbwerte außerhalb der Tokens, jede `var()` definiert, Import-Reihenfolge, Schriftgewichte, Ikonen |
| `node --test tests/stil-werkzeuge.test.ts` | PNG-Decoder, Logo neu gezeichnet = `quellen/marke`, Schriften nur Variante-B-Schnitte, unicode-range aus @fontsource, deterministisch |
| `node werkzeuge/logo.mjs [--vergleich]` | Logo-SVGs aus dem Original-PNG (potrace, deterministisch); `--vergleich` → `tmp/logo-vergleich.png` |
| `node werkzeuge/schriften.mjs [--ziel p]` | `src/generiert/schriften.css` (22 @font-face, ≈ 562 KiB) |

## Beamer-Modus (E10, L-71)

- Die Regie schaltet „Beamer“: `.ist-beamer` an Leinwand und Vorschau-Bühne. `.anzeige` bekommt `zoom: 1.15`, und `--tinte-2`/`--tinte-leise`/`--linie`/`--auf-navy-2` werden kräftiger.
- `vh` ist unter dem Zoom ungezoomt: Themenverzeichnis und Startseite rechnen ihre Höhen durch 1,15 (`--vh: calc(1vh / 1.15)`).
- Die Regie-Vorschau ist eine feste Bühne von 1280 × 720 (`--vh: 7.2px`), unabhängig vom Regie-Fenster.

## Offen

- **Grafik-Baukasten** (`src/grafik/`): Tafeln (`tafel.ts`) und Bauplan-Hintergründe (`bauplan.ts`) nutzen Linien-, Gold- und Statusfarben; eigene Regeln entstehen dort.
