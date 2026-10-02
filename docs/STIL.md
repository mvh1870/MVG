# Stil-Leitfaden

Stand P16.14 (2026-10-02). Verbindlich für alle Flächen der Seite (ARCHITEKTUR.md → `src/stil/`): Start, Story, Theorie, Explore, Regie und Leinwand. **Farben und Typografie** folgen dem vom Owner gewählten Prototyp **Variante B „Leitstand“** (`prototyp/variante-b-leitstand.html`, O-22); Aufbau und Bedienung folgen der Neuausrichtung O-36 bis O-49 mit ruhigem Einstieg (O-21, L-4). Farben nach O-11, Schriften nach L-2 und O-12, Hintergründe im Stil „Bauplan“ nach O-45.

**Anschauen statt lesen:** `npm run oberflaeche` legt Bildschirmfotos jeder Fläche bei 1280 × 720, 1024 × 768 und 400 px in `tmp/oberflaeche/` ab (L-197: die alte Stilreferenz ist gelöscht).

## Dateien und Einbindung

| Datei | Inhalt |
|---|---|
| `src/stil/tokens.css` | alle Farben, Schriften, Größen, Abstände, Radien, Schatten, Bewegung (einzige Stelle mit Farbwerten) |
| `src/stil/basis.css` | Grundstellung (Browser-Vorgaben zurückgesetzt), Typografie, Silbentrennung, Fokus, Hochkontrast, Hilfsklassen, Semantik-Attribut `data-status`, gemeinsame Keyframes, reduzierte Bewegung |
| `src/stil/tafeln.css` | gemeinsame Bausteine (Knöpfe, Status-Symbol, ID-Marke, Merksatz, Hinweis, Glossar-Begriff mit Tooltip, Tabelle) und die Tafeln aus `src/grafik/tafel.ts` |
| `src/stil/regie.css` | Regie (Steuerpult mit Vorschau, Notiz, Leitfragen, Protokoll), Leinwand, Beamer-Schalter |
| `src/stil/start.css` | Startseite mit drei Wegen und Campus-Hintergrund |
| `src/stil/theorie.css` | ruhige Lernseiten der Themen; Verzeichnis ab 1100 px klebend und in sich rollend, Glossar, Lernwerkzeuge, Abbildungen, Druckbogen |
| `src/stil/rahmen.css` | Seitenrahmen (Kopf, Fuß, Sprunglink) und Bauplan-Hintergründe |
| `src/stil/geschichte.css` | Story (Fluss, Fortschrittslinie, Statusanzeige, Vorlage mit gewichtetem Vergleich, Vertiefungen) |
| `src/stil/explore.css` | Explore-Werkzeuge |
| `src/stil/index.css` | Einstieg für esbuild: `../generiert/schriften.css` → tokens → basis → tafeln → regie → start → theorie → rahmen → geschichte → explore |
| `src/stil/paare.json` | erlaubte Text/Grund-Paare (Quelle der Tabelle unten) |
| `src/stil/symbole.ts` | Ikonen und Status-Symbole als SVG-Zeichenketten (`symbol()`, `statusSymbol()`, `trendPfeil()`) |
| `src/stil/farben.ts` | `liesTokens()`, `loese()`, `kontrast()` – für Prüfungen |
| `src/generiert/schriften.css` | erzeugt von `werkzeuge/schriften.mjs` (`erzeugeSchriften()`), **vor jedem Bau** aufrufen |
| `quellen/marke/` | `logo-bm.svg`, `logo-bm-bildmarke.svg` (erzeugt von `werkzeuge/logo.mjs`), `logo-original.png` |

Bau: esbuild bündelt `src/stil/index.css` mit `bundle: true` (die `@import`s werden aufgelöst). Vorher `await erzeugeSchriften()` aus `werkzeuge/schriften.mjs`, sonst fehlt `src/generiert/schriften.css`. Der OFL-Hinweis steht als `/*! … */` am Kopf der Schriften und bleibt im Bündel erhalten. Das Logo kommt als Text ins Skript (esbuild-Loader `.svg: text` in `bau.mjs`): `import bildmarke from '../../quellen/marke/logo-bm-bildmarke.svg'` und inline einsetzen, damit `currentColor` greift (als `<img>` wäre es immer schwarz).

## Grundsätze

1. **Ruhiger Einstieg (O-21).** Die Startseite zeigt drei Wege als Türen – **Story**, **Theorie**, **Explore** – auf hellem Grund mit viel Weißraum; dahinter der Schulcampus als Linienzeichnung mit goldenen Maßlinien (O-45). Darunter leise „Wer steht dahinter“ mit dem Textlink zu bauherr-mentoren.com (O-44) und die Kennzeichnung „Fiktiver Fall“. Keine Instrumente, kein Navy-Rahmen. Impressum, Datenschutz und „Präsentieren“ (Regie) stehen leise im Fuß jeder Fläche.
2. **Story als ein Fluss (O-40).** Eine durchgehende Geschichte aus Sicht des Bauherrn: „Weiter“ Schritt für Schritt (Auftakt, je Station Lage → Vorlage → Folge, Ende), oben eine schlanke Fortschrittslinie und eine kleine Statusanzeige (Kosten, Termin, offene Entscheidungen). An jeder Entscheidungsstation die **Vorlage der Projektsteuerung** mit Optionen und **gewichtetem Vergleich**: Die Gewichte lassen sich verschieben, die Rangfolge ändert sich sichtbar. Vertiefungen („So läuft es oft“, „Typischer Einwand und Antwort“) klappen im Text auf. Dahinter derselbe Campus im Bau, sehr dezent, er wächst mit der Leistungsphase der Station (O-45).
3. **Theorie als Themen, ohne Rahmen (O-38).** Lernseiten nutzen Schriften, Farben und Bausteine des Stils, aber keinen Navy-Rahmen und keine Instrumente: eine Lesespalte (≤ 72 Zeichen), Themenverzeichnis links ab 1100 px, heller Grundriss mit Achsraster als Hintergrund. Keine Kapitelnummern, kein Originaltext, keine Zitierangaben.
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
| Status (BM-Ampel; nur für Status, O-11) | `--status-rot` #9A3030 · `--status-rot-soft` #F1D8D8 · `--status-gelb-soft` #F3E9C8 · `--status-gelb-text` #7F620F · `--status-gelb-symbol` #A47E1E · `--status-gruen` #3A7A43 · `--status-gruen-soft` #DFEADF · `--status-gruen-text` #2B5C33 · `--status-neutral` #5A6B82 · `--status-neutral-soft` #E8EDF6 · `--status-gelb-kante` #D9C27A · `--status-gruen-kante` #A9C8AD |
| Gold-Flächen | `--gold-soft` #FFF7E3 · `--gold-soft-kante` #E8CF97 |
| ID-Marken (Kürzel der Vorgangsarten, O-15) | `--id-ent-grund` #E8EDF6 · `--id-ent-text` #1D3258 · `--id-ris-grund` #E6F5F4 · `--id-ris-text` #0B7A77 · `--id-frw-grund` #FFF3C4 · `--id-frw-text` #6A5208 · `--id-aen-grund` #FFF7E3 · `--id-aen-text` #7A5C22 · `--id-mas-grund` #EAF5EE · `--id-mas-text` #1D5B33 · `--id-nac-grund` #EDEAF4 · `--id-nac-text` #5B3F93 · `--id-prb-grund` #FDEBE5 · `--id-prb-text` #8A2E12 |
| Transparente Töne | `--gold-hell-a18` rgba(198, 157, 82, .18) · `--gold-hell-a28` rgba(198, 157, 82, .28) · `--gold-hell-a45` rgba(198, 157, 82, .45) · `--gold-hell-a60` rgba(198, 157, 82, .6) · `--navy-a42` rgba(12, 28, 51, .42) · `--weiss-a85` rgba(255, 255, 255, .85) |
| Fokus | `--fokus` #0C1C33 · `--fokus-hof` rgba(198, 157, 82, .6) |

**Semantik über Attribute** (in `basis.css`), damit Komponenten keine Farben kennen müssen:

| Attribut | setzt | Werte |
|---|---|---|
| `data-status` | `--status-farbe`, `--status-soft`, `--status-text` | `ok` · `mittel` · `kritisch` · `neutral` |

Gelb als Grafik (Raute, Balken) ist `--status-gelb-symbol` #A47E1E (BM-Warnkante), weil #B08820 auf hellen Flächen nur 2,9:1 erreicht; gelber **Text** ist `--status-gelb-text` #7F620F.

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
<!-- paare:ende -->

Halbtransparente Flächen (`--weiss-a85` im Seitenkopf, `--navy-a42` als Abdunklung hinter Dialogen) zählen als ihr deckender Nachbar (Weiß bzw. Navy); Text liegt dort nur in den Paaren der deckenden Farbe.

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
    <header class="kapitel-kopf"><p class="kapitel-kicker">…</p><h1 class="kapitel-titel">…</h1><p class="kapitel-einstieg">…</p></header>
    <section class="kernaussage"><span class="t-label">Kernaussage</span><p>…</p></section>
    <section class="lern-abschnitt"><h2 class="abschnitt-titel">…</h2><div class="lesetext">(Markdown-HTML)</div></section>
    <div class="lernkarten"><button class="lernkarte" aria-expanded="false">…</button>…</div>
    <figure class="lern-grafik">(SVG aus src/grafik) <figcaption>…</figcaption></figure>
    <section class="querverweis-block"><a class="querverweis">In der Story erlebt: …</a></section>
    <nav class="kapitel-nav" aria-label="…"><a rel="prev">…</a><a rel="next">…</a></nav>
    <p class="lern-kontakt">… <a>bauherr-mentoren.com</a></p>
  </main>
</div>
```
Die Klassennamen `kapitel-…` sind intern geblieben; sichtbar heißt es „Thema“ (O-38). Theorie, Story und Explore zeichnen ihren Inhaltsbereich als `main` (genau eine je Fläche, L-91), das Verzeichnis als `nav` (`display: contents`); Leinwand und Regie-Vorschau betten die Fläche ohne Bedienung ein, die Regie hat ihren eigenen `main` (L-92).

**Abbildung (`.abbildung`, P14, O-32, L-190).** Auf der Lernseite beim Abschnitt:
```html
<figure class="abbildung" data-abbildung="abb-6">
  <div class="abbildung-rahmen"><img class="abbildung-bild ist-vergroesserbar" alt="…" width="1200" height="886"></div>
  <figcaption class="abbildung-unterschrift">
    <span class="t-label abbildung-marke">Abbildung 5</span><span class="abbildung-titel">…</span>
    <span class="abbildung-vorrang">Wo die Abbildung vom Text abweicht, gilt der Text.</span>
    <span class="abbildung-angeglichen">Im Bild an die Begriffe des Texts angeglichen: „…“</span>
    <details class="abbildung-abweichungen"><summary>Abweichungen vom Text (n)</summary><ul><li>…</li></ul></details>
    <button class="knopf knopf-still abbildung-gross">Vergrößern</button>
  </figcaption>
  <dialog class="abbildung-dialog">Kopf (Titel, Schließen) + Bild in voller Breite, mindestens 900 px (schmale Fenster rollen waagrecht)</dialog>
</figure>
```
Weiße Karte wie `.lern-grafik`, Bild auf ganzer Spaltenbreite; Klick aufs Bild öffnet ebenfalls den Dialog (Tastatur: der Knopf). Auf der Leinwand und im Druck ohne Knopf und Dialog, mit aufgeklappten Abweichungen. Der Dialog hat keinen Innenabstand, der Kopf klebt bündig. Mausrad, Wischen und Rolltasten über dem offenen Dialog rollen nur ihn, nie die Seite dahinter (`halteRollenImDialog`).

### Explore
`.ex-rahmen > .ex-kopf + nav.ex-werkzeuge (je Werkzeug .ex-werkzeug-link) + Werkzeugfläche`: Rechner für den gewichteten Vergleich, Risikomatrix 5 × 5, Vorgangsarten und Wege, Takt, Glossar (O-46). In `explore.css`.

### Regie und Leinwand (O-9, O-46)
`.regie > .regie-kopf + .regie-raster (.regie-links: .regie-vorschau > .vorschau-rahmen > .vorschau-buehne (1280 × 720) · .regie-rechts: .regie-karte, .regie-notiz, .regie-leitfragen, .regie-protokoll-…) + .regie-fuss`; Leinwand `.leinwand` (bzw. `.leinwand-warten`) mit `.anzeige`; `.ist-beamer` vergrößert und verstärkt (siehe „Beamer-Modus“). Navy-Grund mit Gold-Fokus. In `regie.css`.

## Barrierefreiheit

- **Kontrast** nur über die erlaubten Paare oben (≥ 4,5:1; Grafik ≥ 3:1), gemessen im Test.
- **Fokus immer sichtbar:** 3 px Ring (`--fokus`): Navy mit Gold-Hof auf hellen Flächen (Start, Story, Theorie, Explore), Gold-hell auf Navy (Regie). Nie `outline: none` ohne Ersatz; Maus-Klicks zeigen keinen Ring (`:focus-visible`).
- **Tastatur überall:** alle Bedienelemente sind `button`/`a`/`input`; in der Story ←/→ zum Blättern, in der Regie Buchstabentasten für die Wahl; Dialoge (Abbildungs-Dialog) halten den Fokus – Tab und Umschalt+Tab kreisen im Dialog – und geben ihn beim Schließen zurück.
- **Nie nur Farbe:** Status = Form + Wort, Auswahl = Fläche + Ring + `aria-pressed`, Rangfolge = Platz + Zahl, Vorher/Nachher = Farbe + Wort.
- **Sprache und Struktur:** `lang="de"`, Silbentrennung automatisch, eine `h1` je Fläche, Landmarken (`header`, `nav`, `main`, `footer`), Live-Region für Statusänderungen, `.nur-sr` für Werte, die sonst nur grafisch sind; Sprunglink `.sprung-inhalt` zum Inhalt.
- **Bewegung:** siehe oben; kein Blinken schneller als 3 Hz.
- **Zielgrößen:** Bedienelemente ≥ 36 × 36 px. Ausgenommen sind Textverweise (im Fließtext, in Tabellen und Listen) und die Schritte der Fortschrittslinie; für sie gilt WCAG 2.5.8 (≥ 24 px oder ausreichender Abstand, L-73/L-75).
- **Geräte:** 1280 × 720 (Beamer), 1024 × 768 (iPad quer), 400 px Breite lesbar ohne waagerechtes Scrollen.

## Tabus

- Keine Emojis, keine Clipart, keine Stockfotos, keine Figuren; Illustration nur als feine Linienzeichnung im Stil „Bauplan“ (O-45).
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
