# Stil-Leitfaden „Leitstand“

Stand P0.3 (2026-09-26). Verbindlich für alle Flächen (ARCHITEKTUR.md → `src/stil/`). Referenz ist der vom Owner gewählte Prototyp **Variante B „Leitstand“** (`prototyp/variante-b-leitstand.html`, O-22) zusammen mit dem ruhigen Einstieg (O-21, L-4) und dem Startseiten-Entwurf (`prototyp/startseite-entwurf.html`). Farben nach O-11, Schriften nach L-2 und O-12.

**Anschauen statt lesen:** `node werkzeuge/stilreferenz.mjs --bilder` erzeugt `tmp/stilreferenz.html` (jeder Baustein, Startseite, Lernseite, Farben, Paare) und Bildschirmfotos bei 1280 × 720 und 400 px in `tmp/stilreferenz/`.

## Dateien und Einbindung

| Datei | Inhalt |
|---|---|
| `src/stil/tokens.css` | alle Farben, Schriften, Größen, Abstände, Radien, Schatten, Bewegung (einzige Stelle mit Farbwerten) |
| `src/stil/basis.css` | Grundstellung (Browser-Vorgaben zurückgesetzt), Typografie, Silbentrennung, Fokus, Hochkontrast, Hilfsklassen, Semantik-Attribut `data-status`, gemeinsame Keyframes, reduzierte Bewegung |
| `src/stil/tafeln.css` | gemeinsame Bausteine (Knöpfe, Status-Symbol, ID-Marke, Merksatz, Hinweis, Glossar-Begriff mit Tooltip, Tabelle) und die Tafeln aus `src/grafik/tafel.ts` |
| `src/stil/regie.css` | Regie (Steuerpult mit Vorschau, Notiz, Leitfragen, Protokoll, Einwände), Leinwand, Beamer-Schalter |
| `src/stil/start.css` | Startseite mit den Türen |
| `src/stil/theorie.css` | ruhige Lernseiten der Themen; Verzeichnis ab 1100 px klebend und in sich rollend, Glossar, Lernwerkzeuge, Abbildungen, Druckbogen |
| `src/stil/rahmen.css` | Seitenrahmen (Kopf, Fuß) und Bauplan-Linien |
| `src/stil/geschichte.css` | Story |
| `src/stil/explore.css` | Explore-Werkzeuge |
| `src/stil/index.css` | Einstieg für esbuild: `../generiert/schriften.css` → tokens → basis → tafeln → regie → start → theorie → rahmen → geschichte → explore |
| `src/stil/paare.json` | erlaubte Text/Grund-Paare (Quelle der Tabelle unten) |
| `src/stil/symbole.ts` | Ikonen und Status-Symbole als SVG-Zeichenketten (`symbol()`, `statusSymbol()`, `trendPfeil()`) |
| `src/stil/farben.ts` | `liesTokens()`, `loese()`, `kontrast()` – für Prüfungen |
| `src/generiert/schriften.css` | erzeugt von `werkzeuge/schriften.mjs` (`erzeugeSchriften()`), **vor jedem Bau** aufrufen |
| `quellen/marke/` | `logo-bm.svg`, `logo-bm-bildmarke.svg` (erzeugt von `werkzeuge/logo.mjs`), `logo-original.png` |

Bau: esbuild bündelt `src/stil/index.css` mit `bundle: true` (die `@import`s werden aufgelöst). Vorher `await erzeugeSchriften()` aus `werkzeuge/schriften.mjs`, sonst fehlt `src/generiert/schriften.css`. Der OFL-Hinweis steht als `/*! … */` am Kopf der Schriften und bleibt im Bündel erhalten. Das Logo kommt als Text ins Skript (esbuild-Loader `.svg: text` in `bau.mjs`): `import bildmarke from '../../quellen/marke/logo-bm-bildmarke.svg'` und inline einsetzen, damit `currentColor` greift (als `<img>` wäre es immer schwarz).

## Grundsätze

1. **Ruhiger Einstieg (O-21).** Die Startseite zeigt genau zwei Wege – „Erklärt – Kapitel für Kapitel“ und „Erlebt – als Geschichte“ – auf hellem Grund mit viel Weißraum. Keine Instrumente, kein Navy-Rahmen. „Hilfe“ und „Präsentieren“ stehen leise im Fuß (Hilfe auch leise in den Kopfleisten von Theorie und Explore, O-31); ein leiser Link „Glossar“ kommt dazu, sobald es eine eigene Glossar-Fläche gibt (bis dahin erreicht man das Glossar in der Seitenleiste der Story und über die Tooltips in Story und Theorie – ein Link ins Leere wäre schlechter als keiner). Explore erscheint erst aus dem Inneren.
2. **Der Leitstand baut sich auf (L-4).** Die Story beginnt mit Kopf, Lagetafel und Fußleiste. Die Statusinstrumente erscheinen mit der ersten Entscheidung, die Story-Karte nach der ersten Station, die rechte Seitenleiste ist eingeklappt (schmale Schiene mit drei Knöpfen) und öffnet auf Klick. Gesteuert nur über Attribute am Rahmen, siehe „Rahmen“ im Katalog.
3. **Theorie ohne Rahmen.** Lernseiten nutzen Schriften, Farben und Bausteine des Leitstands, aber keinen Navy-Rahmen und keine Instrumente: eine Lesespalte (≤ 72 Zeichen), Kapitelverzeichnis links ab 1100 px.
4. **Farbsemantik der zwei Welten (O-2, O-11).** Welt A (ohne MVG) ist **Koralle** mit Haftnotiz-Pastellen, Pinnwand, Excel-Ständen – Unordnung, die man sieht. Welt B (mit MVG) ist **Türkis/Frischgrün** mit IDs, Datenständen, Siegeln – Ordnung, die man sieht. Der Vergleich A ⟷ B ist ein Verlauf Koralle → Gold → Türkis. Welt immer über `data-welt="a|b|ab"`, nie über eigene Farben.
5. **Rahmen und Marke.** Navy #0C1C33 und Gold (#A8823C, hell #C69D52) bilden den Rahmen (Kopf, Story-Karte, Fußleiste, Tasten, Urteil, Ebene 4). Petrol #146878 ist der Grundton der Theorie; Grün #349068 nur als Grafikfarbe (als Text zu hell).
6. **Rollen (O-4).** Jede der sechs Rollen hat eine Farbe (`data-rolle="gf|bh|pl|ps|plan|ctl"`): Kleidung der Figur, Rollen-Chip, Blickwinkel-Karte. Eine Rolle wird **nie nur über die Farbe** erkannt – immer mit Name, Namensschild oder Rollenbezeichnung.
7. **Status nie ohne Symbol oder Text.** Ampelfarben sind für Status reserviert (O-11). Jeder Status hat eine Form (ok = Kreis mit Haken, mittel = Raute mit Strich, kritisch = Dreieck mit Ausrufezeichen, neutral = Punkt) **und** ein Wort; für Screenreader steht der Wert als Text (`.nur-sr`).
8. **Marke (Bauherr Mentoren).** Logo nur als SVG aus `quellen/marke/` mit `fill="currentColor"`: weiß auf Navy, Navy auf hellen Flächen, nie verzerrt, nie eingefärbt außer Weiß, Navy oder Gold-hell auf Navy. Unter 96 px Höhe die **Bildmarke** (Wortmarke wäre unlesbar) und daneben „Bauherr Mentoren“ als Text; das Gesamtlogo ab 96 px. (Bewusste Abweichung vom Prototyp, der im Kopf das Gesamtlogo in 36 px Höhe zeigte.) Absender immer „Bauherr Mentoren“. Die Vermerke **„Fall fiktiv“** (O-3) und **„fachlich ungeprüft“** (O-24) bleiben sichtbar (`.vermerk` im Kopf, `.vermerk-hell`/`.start-vermerk` auf hellen Flächen).

## Typorollen

Fünf Familien, eingebettet als woff2 (latin + latin-ext), nur diese Schnitte (L-2; gemessen im Prototyp):

| Rolle | Familie · Schnitt | Token / Klasse | Verwendung |
|---|---|---|---|
| Titel | Big Shoulders Display 800, Versalien, +0,02em | `--typo-titel`, `.t-titel` | Kopf-Titel, Linsen-Titel, Urteil |
| Anzeige | Big Shoulders Display 800 | `--typo-anzeige`, `--typo-kennzahl`, `.t-anzeige`, `.wert` | Instrumentwerte, Uhr, Tasten A–D, Kapitelnummern, Zeitsprung |
| Tafeltitel | IBM Plex Sans 700, 21 px | `--typo-tafeltitel` | Titel der Lagetafel |
| Fließtext | IBM Plex Sans 400, 15 px/1,45 | `--typo-text` | alles Übrige im Leitstand |
| Lesetext | IBM Plex Sans 400, 17 px/1,6 | `--typo-lese`, `.lesetext` | Theorie, Originaltext |
| Hervorhebung | IBM Plex Sans 500/600/700 | `em`, `strong` | `em` ist **aufrecht, 600** (kein Kursivschnitt eingebettet) |
| Label | Barlow Condensed 600, 12 px, Versalien, +0,1em | `--typo-label`, `.t-label` | Beschriftungen, Instrument-Labels |
| Kicker | Barlow Condensed 600, 13 px, Versalien, +0,12em | `--typo-kicker`, `.t-kicker` | Zeile über Titeln |
| Reiter/Badge | Barlow Condensed 700, 13–15 px, Versalien | `--typo-reiter`, `.badge`, `.reiter` | Reiter, Badges, Feldtitel |
| Mono | IBM Plex Mono 500/600 | `.mono`, `.id-marke` | IDs (`ENT-017`), Dateinamen, Zeiten, Versionen |
| Hand | Caveat 700, 21 px | `--typo-hand`, `.t-hand` | **nur** Haftnotizen der Welt A |

Barlow Condensed 500 ist eingebettet für schmale Schrift ohne eigenes Gewicht (Achsen, Zeitlineal). Größenskala: `--gr-xs` 12 · `--gr-s` 13 · `--gr-m` 14 · `--gr-text` 15 · `--gr-l` 16 · `--gr-xl` 18 · `--gr-2xl` 21 · `--gr-3xl` 24 · `--gr-4xl` 28 · `--gr-5xl` 34 · `--gr-6xl` 44 · `--gr-7xl` 64 · `--gr-8xl` 92 (px); `--gr-lese` 17. Kleinste Schrift 11,5 px – nur für Versal-Labels sowie Kennungen und Dateinamen in Mono auf Requisiten; Nebentext im Leitstand (Einheiten, Meta-Angaben, Zusätze an Instrumenten und Karten) nie unter 12 px; Fließtext nie unter 13 px. (Die 12-px-Stufe ist bewusst: Der Leitstand ist dicht wie der Prototyp Variante B; Sätze stehen nie in ihr.) Deutsche Silbentrennung (`hyphens: auto`) für Absätze, Listen, Zitate und Tabellenzellen unter `lang="de"`; Titel, Labels, IDs und Tasten werden nie getrennt.

## Farben

Alle Werte stehen in `src/stil/tokens.css` (Quelle je Wert im Kommentar). Komponenten nutzen nur `var(--…)`; ein Test (`tests/stil-tokens.test.ts`) verbietet Farbwerte außerhalb der Tokens.

| Gruppe | Tokens |
|---|---|
| Marke (O-11, BM-Kern) | `--navy` #0C1C33 · `--navy-soft` #1D3258 · `--navy-2` #13274A · `--navy-linie` #2A4068 · `--gold` #A8823C · `--gold-hell` #C69D52 · `--gold-kante` #9A7736 · `--gold-hover` #D6AE66 · `--gold-text` #7A5C1E · `--petrol` #146878 · `--gruen` #349068 |
| Flächen und Text | `--grund` #EEF1F5 · `--weiss` #FFFFFF · `--tinte` #0F1722 · `--tinte-2` #4B5563 · `--tinte-leise` #5A6B82 · `--tinte-instrument` #34435A · `--linie` #D5DCE6 · `--linie-2` #C3CDD9 · `--linie-3` #AEB9C8 · `--auf-navy` #E8EDF6 · `--auf-navy-2` #A9B8CE · `--flaeche-1` #F6F8FB · `--flaeche-2` #F3F5F8 · `--flaeche-3` #F4F7FB · `--flaeche-4` #E9EFF6 · `--flaeche-4-kante` #D0DAE6 · `--instrument-oben` #FCFDFE · `--instrument-unten` #EDF1F6 · `--punktraster` #C9D2DE · `--gitter` #E3E8EF · `--spur` #DCE3EB · `--knopf-sockel` #CDD5E0 · `--knopf-sockel-navy` #050D19 · `--gesperrt` #CBD3DE · `--gesperrt-text` #3C4A5E · `--tipp-punkte` #9AA7B8 |
| Welt A (ohne MVG) | `--koralle` #E4572E · `--koralle-text` #B23E1A · `--koralle-soft` #FDEBE5 · `--koralle-soft-2` #FDE1D7 · `--koralle-hauch` #FFF4F0 · `--koralle-kante` #F4C3B2 · `--koralle-nadel` #F58A6A · `--pinnwand` #F5EEE4 · `--pinnwand-kante` #E6D8C6 · `--welt-a-grund` #F6EFE6 · `--welt-a-licht` #FFF6EC · `--notiz-gelb` #FEF29C · `--notiz-rosa` #FDC5C4 · `--notiz-lila` #E0D4F8 · `--notiz-gruen` #D8F8A0 · `--notiz-tinte` #2A2A2A · `--notiz-lila-text` #4B3A78 · `--notiz-rosa-text` #8A2A1C |
| Welt B (mit MVG) | `--tuerkis` #12A4A0 · `--tuerkis-text` #0B7A77 · `--tuerkis-soft` #E6F5F4 · `--tuerkis-hauch` #F4FBFA · `--frischgruen` #3FB57A · `--frischgruen-text` #237A4E · `--regler-a` #F1A68E · `--regler-b` #94D6D3 |
| Rollen (O-4, O-11) | `--rolle-gf` #6A4CA5 · `--rolle-gf-text` #6A4CA5 · `--rolle-gf-soft` #EDEAF4 · `--rolle-gf-kante` #BCAED7 · `--rolle-bh` #1D3258 · `--rolle-bh-text` #1D3258 · `--rolle-bh-soft` #E4E6EB · `--rolle-bh-kante` #99A3B4 · `--rolle-pl` #3866A8 · `--rolle-pl-text` #3866A8 · `--rolle-pl-soft` #E7EDF5 · `--rolle-pl-kante` #A5BAD8 · `--rolle-ps` #146878 · `--rolle-ps-text` #146878 · `--rolle-ps-soft` #E3EDEF · `--rolle-ps-kante` #95BBC2 · `--rolle-plan` #D9822B · `--rolle-plan-text` #9A5412 · `--rolle-plan-soft` #FAF0E6 · `--rolle-plan-kante` #EEC7A0 · `--rolle-ctl` #A8823C · `--rolle-ctl-text` #7A5C22 · `--rolle-ctl-soft` #F5F0E8 · `--rolle-ctl-kante` #D8C7A7 |
| Status (BM-Ampel; nur für Status, O-11) | `--status-rot` #9A3030 · `--status-rot-soft` #F1D8D8 · `--status-gelb` #B08820 · `--status-gelb-soft` #F3E9C8 · `--status-gelb-text` #7F620F · `--status-gelb-symbol` #A47E1E · `--status-gruen` #3A7A43 · `--status-gruen-soft` #DFEADF · `--status-gruen-text` #2B5C33 · `--status-neutral` #5A6B82 · `--status-neutral-soft` #E8EDF6 · `--status-gelb-kante` #D9C27A · `--status-gruen-kante` #A9C8AD |
| Gold-Flächen | `--gold-soft` #FFF7E3 · `--gold-soft-kante` #E8CF97 · `--neu-grund` #FFF9D6 · `--neu-kante` #E7D66A |
| Requisiten | `--tabelle-grund` #F4F8F5 · `--tabelle-kante` #B8D5C2 · `--tabelle-symbol` #1F7A45 · `--tabelle-text` #1D5B33 · `--anhang-grund` #EAF5EE · `--id-ent-grund` #E8EDF6 · `--id-ent-text` #1D3258 · `--id-ris-grund` #E6F5F4 · `--id-ris-text` #0B7A77 · `--id-frw-grund` #FFF3C4 · `--id-frw-text` #6A5208 · `--id-aen-grund` #FFF7E3 · `--id-aen-text` #7A5C22 · `--id-mas-grund` #EAF5EE · `--id-mas-text` #1D5B33 · `--id-nac-grund` #EDEAF4 · `--id-nac-text` #5B3F93 |
| Figuren (P3.1, flache SVG) | `--figur-haut-1` #EDC3A0 · `--figur-haut-2` #F0C8A6 · `--figur-haut-3` #C98E62 · `--figur-haut-4` #F3D0B5 · `--figur-haut-5` #DDA682 · `--figur-haut-6` #EDC09B · `--figur-haar-1` #3A2A22 · `--figur-haar-2` #6B4A2E · `--figur-haar-3` #241A15 · `--figur-haar-4` #A4492A · `--figur-haar-5` #9AA0A8 · `--figur-haar-6` #6F7279 · `--figur-linie` #1B2430 · `--figur-brille` #2A3345 · `--figur-lippe-hell` #F4DCC8 |
| Transparente Töne | `--gold-hell-a18` rgba(198, 157, 82, .18) · `--gold-hell-a28` rgba(198, 157, 82, .28) · `--gold-hell-a45` rgba(198, 157, 82, .45) · `--gold-hell-a60` rgba(198, 157, 82, .6) · `--gold-hell-a75` rgba(198, 157, 82, .75) · `--koralle-a25` rgba(228, 87, 46, .25) · `--koralle-a60` rgba(228, 87, 46, .6) · `--koralle-text-a16` rgba(178, 62, 26, .16) · `--tuerkis-a08` rgba(18, 164, 160, .08) · `--tuerkis-a25` rgba(18, 164, 160, .25) · `--tuerkis-a75` rgba(18, 164, 160, .75) · `--navy-a42` rgba(12, 28, 51, .42) · `--navy-a93` rgba(12, 28, 51, .93) · `--weiss-a05` rgba(255, 255, 255, .05) · `--weiss-a70` rgba(255, 255, 255, .7) · `--weiss-a85` rgba(255, 255, 255, .85) · `--schwarz-a35` rgba(0, 0, 0, .35) · `--maske` #000 |
| Fokus | `--fokus` #0C1C33 · `--fokus-hof` rgba(198, 157, 82, .6) |

**Semantik über Attribute** (in `basis.css`), damit Komponenten keine Farben kennen müssen:

| Attribut | setzt | Werte |
|---|---|---|
| `data-welt` | `--welt-farbe`, `--welt-text`, `--welt-soft` | `a` Koralle · `b` Türkis · `ab` Gold/Navy (Vergleich) |
| `data-rolle` | `--rollen-farbe`, `--rollen-text`, `--rollen-soft`, `--rollen-kante` | `gf` Geschäftsführung · `bh` Bauherr · `pl` Bauherren-PL · `ps` Projektsteuerung · `plan` Planung · `ctl` Controlling |
| `data-status` | `--status-farbe`, `--status-soft`, `--status-text` | `ok` · `mittel` · `kritisch` · `neutral` |

Rollenfarben: `--rolle-X` ist die Figur- und Akzentfarbe; **Text** in Rollenfarbe und **Weiß auf Rollenfläche** (Rollen-Chip) immer mit `--rolle-X-text` (Planung #9A5412 und Controlling #7A5C22 sind textsicher abgedunkelt, #D9822B und #A8823C wären zu hell). Gelb als Grafik (Raute, Balken) ist `--status-gelb-symbol` #A47E1E (BM-Warnkante), weil #B08820 auf dem Instrument nur 2,9:1 erreicht; gelber **Text** ist `--status-gelb-text` #7F620F.

### Erlaubte Text/Grund-Paare

Nur diese Paare dürfen Text (bzw. bei „Grafik“ Symbole, Ränder, Fokusringe) tragen. Die Liste steht in `src/stil/paare.json`; `tests/stil-kontrast.test.ts` rechnet jeden Wert gegen `tokens.css` nach und vergleicht diese Tabelle mit der Liste. Grenzen: Text ≥ 4,5:1 · „groß“ (≥ 24 px oder ≥ 18,66 px fett) ≥ 3:1 · „Grafik“ (WCAG 1.4.11) ≥ 3:1. Derzeit braucht kein Textpaar die Ausnahme „groß“.

<!-- paare:anfang -->
| Text | Grund | Kontrast | Art | Verwendung |
|---|---|---|---|---|
| `--tinte` #0F1722 | `--weiss` #FFFFFF | 18,0:1 | Text | Fließtext auf Karten, Tafeln, Seitenleiste |
| `--tinte` #0F1722 | `--grund` #EEF1F5 | 15,9:1 | Text | Fließtext auf Lagetafel, Start, Theorie |
| `--tinte` #0F1722 | `--flaeche-3` #F4F7FB | 16,8:1 | Text | Ebene 2, Originaltext |
| `--tinte` #0F1722 | `--flaeche-4` #E9EFF6 | 15,6:1 | Text | Ebene 3 |
| `--tinte` #0F1722 | `--gold-soft` #FFF7E3 | 16,9:1 | Text | gewählte Option, Lehre, aktuelle LPH |
| `--tinte` #0F1722 | `--neu-grund` #FFF9D6 | 17,0:1 | Text | Neu-Hinweis |
| `--tinte` #0F1722 | `--koralle-hauch` #FFF4F0 | 16,7:1 | Text | ungeklärte Punkte (Welt A) |
| `--tinte` #0F1722 | `--tuerkis-hauch` #F4FBFA | 17,2:1 | Text | Flächen der Welt B |
| `--tinte` #0F1722 | `--status-neutral-soft` #E8EDF6 | 15,3:1 | Text | Chips der Kurzlage |
| `--tinte` #0F1722 | `--instrument-unten` #EDF1F6 | 15,9:1 | Text | Instrumentwerte (unterer Rand des Verlaufs) |
| `--tinte` #0F1722 | `--tabelle-grund` #F4F8F5 | 16,8:1 | Text | Excel-Stand |
| `--tinte` #0F1722 | `--status-gelb-soft` #F3E9C8 | 14,8:1 | Text | Rückmeldung (mittel) |
| `--tinte` #0F1722 | `--status-gruen-soft` #DFEADF | 14,6:1 | Text | Rückmeldung (ok) |
| `--tinte` #0F1722 | `--notiz-lila` #E0D4F8 | 12,8:1 | Text | Feld „Was fehlte“ |
| `--tinte` #0F1722 | `--notiz-rosa` #FDC5C4 | 12,0:1 | Text | Feld „Risiko“ |
| `--tinte-2` #4B5563 | `--weiss` #FFFFFF | 7,6:1 | Text | leiser Text, Labels |
| `--tinte-2` #4B5563 | `--grund` #EEF1F5 | 6,7:1 | Text | leiser Text auf Grund |
| `--tinte-2` #4B5563 | `--flaeche-1` #F6F8FB | 7,1:1 | Text | Tabellenkopf |
| `--tinte-2` #4B5563 | `--flaeche-2` #F3F5F8 | 6,9:1 | Text | Versionen, Rollenübersicht |
| `--tinte` #0F1722 | `--flaeche-2` #F3F5F8 | 16,5:1 | Text | Sandbox-Einträge, Sim-Stufen |
| `--tinte` #0F1722 | `--koralle-soft` #FDEBE5 | 15,6:1 | Text | Vorher/Nachher Welt A, Story-Karte Explore |
| `--tinte` #0F1722 | `--tuerkis-soft` #E6F5F4 | 16,1:1 | Text | Vorher/Nachher Welt B, Story-Karte Explore |
| `--tinte-2` #4B5563 | `--flaeche-3` #F4F7FB | 7,0:1 | Text | Quelle im Originaltext |
| `--tinte-2` #4B5563 | `--gold-soft` #FFF7E3 | 7,1:1 | Text | Nebentext auf Gold-Fläche |
| `--tinte-2` #4B5563 | `--koralle-hauch` #FFF4F0 | 7,0:1 | Text | Nebentext Welt A |
| `--tinte-2` #4B5563 | `--instrument-unten` #EDF1F6 | 6,7:1 | Text | Einheit am Instrument |
| `--tinte-2` #4B5563 | `--status-neutral-soft` #E8EDF6 | 6,4:1 | Text | Nebentext im Chip |
| `--tinte-2` #4B5563 | `--tabelle-grund` #F4F8F5 | 7,1:1 | Text | Quelle im Excel-Stand |
| `--tinte-leise` #5A6B82 | `--weiss` #FFFFFF | 5,4:1 | Text | noch nicht erreichte Prüfpunkte |
| `--tinte-instrument` #34435A | `--instrument-unten` #EDF1F6 | 8,8:1 | Text | Instrument-Beschriftung |
| `--navy` #0C1C33 | `--weiss` #FFFFFF | 17,1:1 | Text | Titel, aktive Reiter |
| `--navy` #0C1C33 | `--grund` #EEF1F5 | 15,1:1 | Text | Titel der Startseite, Kapitel; Fokusring auf hellen Flächen |
| `--navy` #0C1C33 | `--gold-hell` #C69D52 | 6,8:1 | Text | Weiter-Knopf, Wahl-Chip, Sprunglink |
| `--navy` #0C1C33 | `--gold-soft` #FFF7E3 | 16,0:1 | Text | aktuelle LPH, Markierung |
| `--navy` #0C1C33 | `--status-neutral-soft` #E8EDF6 | 14,5:1 | Text | Neustart-Knopf |
| `--navy-soft` #1D3258 | `--weiss` #FFFFFF | 12,7:1 | Text | Links, Querverweis |
| `--navy-soft` #1D3258 | `--grund` #EEF1F5 | 11,2:1 | Text | Gedächtnis-Zeile |
| `--navy-soft` #1D3258 | `--flaeche-2` #F3F5F8 | 11,7:1 | Text | Welt-Text im Vergleich (AB) |
| `--navy-soft` #1D3258 | `--flaeche-3` #F4F7FB | 11,8:1 | Text | Label Originaltext |
| `--weiss` #FFFFFF | `--navy` #0C1C33 | 17,1:1 | Text | Text im Rahmen, Uhr, Urteil, Ebene 4 |
| `--weiss` #FFFFFF | `--navy-soft` #1D3258 | 12,7:1 | Text | aktueller Fortschrittsschritt, erledigte LPH |
| `--weiss` #FFFFFF | `--navy-2` #13274A | 14,8:1 | Text | Schließen-Knopf |
| `--weiss` #FFFFFF | `--koralle-text` #B23E1A | 5,8:1 | Text | Mail „neu“, gesprungene Uhr |
| `--weiss` #FFFFFF | `--tuerkis-text` #0B7A77 | 5,2:1 | Text | Siegel, aktuelle Version |
| `--auf-navy` #E8EDF6 | `--navy` #0C1C33 | 14,5:1 | Text | Text in Story-Karte und Kopf |
| `--auf-navy` #E8EDF6 | `--navy-2` #13274A | 12,6:1 | Text | Knöpfe und Fortschritt im Rahmen |
| `--auf-navy` #E8EDF6 | `--navy-soft` #1D3258 | 10,8:1 | Text | Tabellenkopf Register, erledigte LPH |
| `--auf-navy-2` #A9B8CE | `--navy` #0C1C33 | 8,5:1 | Text | leiser Text auf Navy |
| `--auf-navy-2` #A9B8CE | `--navy-2` #13274A | 7,4:1 | Text | offene Fortschrittsschritte |
| `--auf-navy-2` #A9B8CE | `--navy-soft` #1D3258 | 6,3:1 | Text | leiser Text auf aktivem Schritt |
| `--gold-hell` #C69D52 | `--navy` #0C1C33 | 6,8:1 | Text | Labels und Tasten auf Navy; Fokusring im Rahmen |
| `--gold-hell` #C69D52 | `--navy-2` #13274A | 5,9:1 | Text | Schienen-Knöpfe |
| `--gold-hell` #C69D52 | `--navy-soft` #1D3258 | 5,1:1 | Text | aktuelle Station |
| `--gold-text` #7A5C1E | `--weiss` #FFFFFF | 6,2:1 | Text | Kernaussage-Label |
| `--gold-text` #7A5C1E | `--grund` #EEF1F5 | 5,5:1 | Text | Kicker der Startseite |
| `--gold-text` #7A5C1E | `--gold-soft` #FFF7E3 | 5,8:1 | Text | Vermerk „fachlich ungeprüft“ (hell) |
| `--petrol` #146878 | `--weiss` #FFFFFF | 6,4:1 | Text | Kicker der Theorie-Tür, Kapitelnummer |
| `--petrol` #146878 | `--grund` #EEF1F5 | 5,6:1 | Text | Kapitelnummer, Bereich |
| `--koralle` #E4572E | `--navy` #0C1C33 | 4,6:1 | Text | Welt-Name A in der Welt-Anzeige (27 px, 800) |
| `--tuerkis` #12A4A0 | `--navy` #0C1C33 | 5,6:1 | Text | Welt-Name B in der Welt-Anzeige (27 px, 800); Spur und Knoten Welt B |
| `--koralle-text` #B23E1A | `--weiss` #FFFFFF | 5,8:1 | Text | Welt A: Texte, Feldtitel Konsequenz |
| `--koralle-text` #B23E1A | `--grund` #EEF1F5 | 5,2:1 | Text | Welt A: Reglerende |
| `--koralle-text` #B23E1A | `--koralle-soft` #FDEBE5 | 5,1:1 | Text | Welt-Badge A |
| `--koralle-text` #B23E1A | `--koralle-soft-2` #FDE1D7 | 4,7:1 | Text | Warnchip, offene Frage |
| `--koralle-text` #B23E1A | `--koralle-hauch` #FFF4F0 | 5,4:1 | Text | Gegenüberstellung Welt A |
| `--koralle-text` #B23E1A | `--pinnwand` #F5EEE4 | 5,1:1 | Text | Pinnwand-Label |
| `--koralle-text` #B23E1A | `--flaeche-1` #F6F8FB | 5,5:1 | Text | Tabellenkopf Welt A |
| `--tuerkis-text` #0B7A77 | `--weiss` #FFFFFF | 5,2:1 | Text | Welt B: Texte, IDs |
| `--tuerkis-text` #0B7A77 | `--grund` #EEF1F5 | 4,6:1 | Text | Welt B: Reglerende |
| `--tuerkis-text` #0B7A77 | `--tuerkis-soft` #E6F5F4 | 4,6:1 | Text | Welt-Badge B |
| `--tuerkis-text` #0B7A77 | `--tuerkis-hauch` #F4FBFA | 4,9:1 | Text | Welt-B-Flächen |
| `--tuerkis-text` #0B7A77 | `--flaeche-1` #F6F8FB | 4,9:1 | Text | Tabellenkopf Welt B |
| `--navy-soft` #1D3258 | `--koralle-soft` #FDEBE5 | 11,0:1 | Text | Welt-Badge AB (linke Hälfte) |
| `--navy-soft` #1D3258 | `--tuerkis-soft` #E6F5F4 | 11,4:1 | Text | Welt-Badge AB (rechte Hälfte) |
| `--frischgruen-text` #237A4E | `--weiss` #FFFFFF | 5,3:1 | Text | Welt B: positiver Ausgang |
| `--status-rot` #9A3030 | `--weiss` #FFFFFF | 7,4:1 | Text | Status kritisch als Text |
| `--status-rot` #9A3030 | `--status-rot-soft` #F1D8D8 | 5,5:1 | Text | Badge kritisch, Prüfpunkt fehlt |
| `--status-gelb-text` #7F620F | `--weiss` #FFFFFF | 5,7:1 | Text | Status mittel als Text |
| `--status-gelb-text` #7F620F | `--status-gelb-soft` #F3E9C8 | 4,7:1 | Text | Badge mittel |
| `--status-gruen-text` #2B5C33 | `--weiss` #FFFFFF | 7,8:1 | Text | Status ok als Text |
| `--status-gruen-text` #2B5C33 | `--status-gruen-soft` #DFEADF | 6,3:1 | Text | Badge ok, gelöste Frage |
| `--status-neutral` #5A6B82 | `--weiss` #FFFFFF | 5,4:1 | Text | Status neutral als Text |
| `--status-neutral` #5A6B82 | `--status-neutral-soft` #E8EDF6 | 4,6:1 | Text | Badge neutral, Prüfpunkt offen |
| `--gesperrt-text` #3C4A5E | `--gesperrt` #CBD3DE | 6,0:1 | Text | gesperrter Knopf |
| `--notiz-tinte` #2A2A2A | `--notiz-gelb` #FEF29C | 12,6:1 | Text | Haftnotiz gelb |
| `--notiz-tinte` #2A2A2A | `--notiz-rosa` #FDC5C4 | 9,5:1 | Text | Haftnotiz rosa, Feld Risiko |
| `--notiz-tinte` #2A2A2A | `--notiz-lila` #E0D4F8 | 10,2:1 | Text | Haftnotiz lila, Feld Was fehlte |
| `--notiz-tinte` #2A2A2A | `--notiz-gruen` #D8F8A0 | 12,2:1 | Text | Haftnotiz grün |
| `--notiz-lila-text` #4B3A78 | `--notiz-lila` #E0D4F8 | 6,9:1 | Text | Feldtitel Was fehlte |
| `--notiz-rosa-text` #8A2A1C | `--notiz-rosa` #FDC5C4 | 5,7:1 | Text | Feldtitel Risiko |
| `--tabelle-text` #1D5B33 | `--anhang-grund` #EAF5EE | 7,2:1 | Text | Mail-Anhang |
| `--tabelle-text` #1D5B33 | `--tabelle-grund` #F4F8F5 | 7,5:1 | Text | Dateiname im Excel-Stand |
| `--rolle-gf-text` #6A4CA5 | `--weiss` #FFFFFF | 6,6:1 | Text | Rolle Geschäftsführung (Text; Weiß auf Chip) |
| `--rolle-gf-text` #6A4CA5 | `--rolle-gf-soft` #EDEAF4 | 5,5:1 | Text | Blickwinkel Geschäftsführung |
| `--rolle-bh-text` #1D3258 | `--weiss` #FFFFFF | 12,7:1 | Text | Rolle Bauherr |
| `--rolle-bh-text` #1D3258 | `--rolle-bh-soft` #E4E6EB | 10,2:1 | Text | Blickwinkel Bauherr |
| `--rolle-pl-text` #3866A8 | `--weiss` #FFFFFF | 5,8:1 | Text | Rolle Bauherren-PL |
| `--rolle-pl-text` #3866A8 | `--rolle-pl-soft` #E7EDF5 | 4,9:1 | Text | Blickwinkel Bauherren-PL |
| `--rolle-ps-text` #146878 | `--weiss` #FFFFFF | 6,4:1 | Text | Rolle Projektsteuerung |
| `--rolle-ps-text` #146878 | `--rolle-ps-soft` #E3EDEF | 5,4:1 | Text | Blickwinkel Projektsteuerung |
| `--rolle-plan-text` #9A5412 | `--weiss` #FFFFFF | 5,8:1 | Text | Rolle Planung |
| `--rolle-plan-text` #9A5412 | `--rolle-plan-soft` #FAF0E6 | 5,1:1 | Text | Blickwinkel Planung |
| `--rolle-ctl-text` #7A5C22 | `--weiss` #FFFFFF | 6,2:1 | Text | Rolle Controlling |
| `--rolle-ctl-text` #7A5C22 | `--rolle-ctl-soft` #F5F0E8 | 5,5:1 | Text | Blickwinkel Controlling |
| `--id-ent-text` #1D3258 | `--id-ent-grund` #E8EDF6 | 10,8:1 | Text | ID-Marke ENT- |
| `--id-ris-text` #0B7A77 | `--id-ris-grund` #E6F5F4 | 4,6:1 | Text | ID-Marke RIS- |
| `--id-prb-text` #8A2E12 | `--id-prb-grund` #FDEBE5 | 7,3:1 | Text | ID-Marke PRB- (Story) |
| `--id-frw-text` #6A5208 | `--id-frw-grund` #FFF3C4 | 6,7:1 | Text | ID-Marke FRW- |
| `--id-aen-text` #7A5C22 | `--id-aen-grund` #FFF7E3 | 5,8:1 | Text | ID-Marke AEN- |
| `--id-mas-text` #1D5B33 | `--id-mas-grund` #EAF5EE | 7,2:1 | Text | ID-Marke MAS- |
| `--id-nac-text` #5B3F93 | `--id-nac-grund` #EDEAF4 | 6,9:1 | Text | ID-Marke NAC- |
| `--status-gruen` #3A7A43 | `--instrument-unten` #EDF1F6 | 4,6:1 | Grafik | Status-Symbol ok, Balken, Zeigersegment |
| `--status-gelb-symbol` #A47E1E | `--instrument-unten` #EDF1F6 | 3,3:1 | Grafik | Status-Symbol mittel (Raute), Balken, Zeigersegment |
| `--status-rot` #9A3030 | `--instrument-unten` #EDF1F6 | 6,5:1 | Grafik | Status-Symbol kritisch (Dreieck), Balken, Zeigersegment |
| `--status-neutral` #5A6B82 | `--instrument-unten` #EDF1F6 | 4,8:1 | Grafik | Status-Symbol neutral, Punkte |
| `--weiss` #FFFFFF | `--status-gelb-symbol` #A47E1E | 3,8:1 | Grafik | Zeichen in der Raute (mittel) |
| `--weiss` #FFFFFF | `--status-gruen` #3A7A43 | 5,2:1 | Grafik | Haken im Kreis, Prüfkästchen erfüllt, Freigabe-Marke |
| `--gold-kante` #9A7736 | `--grund` #EEF1F5 | 3,7:1 | Grafik | Außenkante gewählte Option, Reiter-Unterstrich |
| `--gold-kante` #9A7736 | `--weiss` #FFFFFF | 4,1:1 | Grafik | Reiter-Unterstrich, aktuelle LPH |
| `--koralle` #E4572E | `--weiss` #FFFFFF | 3,7:1 | Grafik | Linien und Kanten Welt A |
| `--tuerkis` #12A4A0 | `--weiss` #FFFFFF | 3,1:1 | Grafik | Rahmen und Kanten Welt B |
<!-- paare:ende -->

Halbtransparente Flächen (`--weiss-a85` im Tafelkopf, `--navy-a93` im Zeitsprung) zählen als ihr deckender Nachbar (Weiß bzw. Navy); Text liegt dort nur in den Paaren der deckenden Farbe.

## Abstände, Radien, Schatten

- **Abstände im 4er-Raster:** `--a-1` 4 · `--a-2` 8 · `--a-3` 12 · `--a-4` 16 · `--a-5` 20 · `--a-6` 24 · `--a-8` 32 · `--a-10` 40 · `--a-12` 48 · `--a-16` 64 · `--a-24` 96 (px). Seitenrand mindestens 16 px, auch bei 400 px Breite. Lücken in Stapeln/Reihen über `--luecke` (`.stapel`, `.reihe`).
- **Radien:** `--radius-xs` 3 (Tags) · `--radius-s` 6 (Chips, kleine Knöpfe) · `--radius-m` 8 (Knöpfe, Felder) · `--radius-l` 10 (Karten, Lagetafel) · `--radius-xl` 12 (Entscheidungsknöpfe, Szenen) · `--radius-xxl` 18 · `--radius-rund` (Pillen).
- **Schatten:** `--schatten-karte` (Linie + weich) für Karten · `--schatten-karte-hoch` für hervorgehobene Karten · `--schatten-knopf` (+ `-hover`, `-druck`) für den 3D-Sockel der Entscheidungsknöpfe · `--schatten-notiz` für Haftnotizen · `--schatten-rahmen` (1 px Gold-Haarlinie) für Lagetafel, Seitenleiste, Türen · `--schatten-instrument` · `--schatten-taste` (Tastenkappe) · `--schatten-welt-b` (türkiser Rand) · `--schatten-schwebend` (Tooltip) · `--schatten-schublade` (Rollen-Linse).
- **Raster des Leitstands:** Story-Karte `--breite-karte` 214 px (unter 1200 px: 186), Seitenleiste `--breite-seitenleiste` 292 px (248), eingeklappt `--breite-schiene` 52 px.

## Bewegung

| Token | Dauer | Wofür |
|---|---|---|
| `--dauer-sofort` | 150 ms | Hover, Druck, Tooltip |
| `--dauer-kurz` | 300 ms | Einblenden kleiner Teile, Linsen-Grund |
| `--dauer-mittel` | 500 ms | Karten, Felder, Optionen (`auftauchen`), Trendpfeil |
| (Szene) | 450 ms | Szenenwechsel `.szene` (`szene-ein`) |
| `--dauer-lang` | 800 ms | Aufbau des Leitstands (Instrumente von oben, Karte), Zähler |
| `--dauer-zeiger` | 1100 ms | Instrumentnadel, Aufleuchten (`.blitz`) |
| `--dauer-sprung` | 2300 ms | Zeitsprung |
| `--dauer-puls`, `--dauer-led` | 1800 / 2400 ms | Schleifen: Ping der aktuellen Station, LED der Welt |

Kurven: `--kurve-aus` (Szene, Einblenden) · `--kurve-pop` (Karten mit leichtem Überschwingen) · `--kurve-feder` (Trendpfeil, Siegel, Wahl-Chip) · `--kurve-zeiger` (Nadel, Lot) · `--kurve-gleich` (Fortschritt). Gestaffelte Auftritte über `--verzug` (z. B. `style="--verzug:80ms"` je Option).

**Was sich bewegt:** Szenenwechsel, neu erscheinende Teile (Instrumente, Karte, Felder, Optionen, Notizen), Zustandswechsel an Instrumenten (Nadel, Balken, Blitz, Trendpfeil), die aktuelle Station (Ping), der Zeitsprung, die Rollen-Linse. **Was sich nicht bewegt:** Text beim Lesen, Tabellen, Originaltext, die Startseite nach dem ersten Erscheinen. Animationen hängen am Schlüsselwechsel (neue Station, neue Wahl), nie am bloßen Neuzeichnen (ARCHITEKTUR.md); `.ohne-aufbau` am Rahmen zeigt alles sofort (Weiterlesen, Leinwand-Neuladen).

**Reduzierte Bewegung:** Unter `prefers-reduced-motion: reduce` laufen alle Animationen und Übergänge in 1 ms auf ihren Endzustand, Schleifen enden nach einem Durchgang, „tippt …“ entfällt, der Zeitsprung zeigt nur den Titel. Zustände hängen **nie** an einer Animation (alles ist auch ohne Bewegung ablesbar). Schleifen, die ganz entfallen sollen, bekommen die Klasse `.schleife`.

## Ikonen

Inline-SVG im 24 × 24-Raster, Strich 1,8, runde Enden und Ecken, `currentColor`, keine Füllung (Ausnahme `vorspulen`). Größe über `font-size` (Ikone = 1em). Immer dekorativ (`aria-hidden="true"`); die Bedeutung trägt ein Text daneben oder `aria-label` am Knopf. Satz: `src/stil/symbole.ts` (`symbol('haken')`), Namen deutsch (u. a. `mail`, `chat`, `pfeilRechts`, `haken`, `kreuz`, `warnung`, `dokument`, `eskalieren`, `aktualisieren`, `zurueckspulen`, `wechsel`, `stempel`, `tabelle`, `buch`, `person`, `ebenen`). Status-Symbole im 16er-Raster: `statusSymbol('ok'|'mittel'|'kritisch'|'neutral')`.

## Komponentenkatalog

Klassennamen deutsch; in Klammern der Name im Prototyp. Zustände über `ist-…`-Klassen oder ARIA (`aria-current`, `aria-pressed`, `aria-selected`, `aria-expanded`). Markup-Skizzen verkürzt; vollständige Beispiele in `werkzeuge/stilreferenz.mjs`.

### Knöpfe (`.btn`)
`.knopf.knopf-navy` (Hauptaktion, Symbol gold; `:disabled` grau) · `.knopf.knopf-gold` (Weiter-Aktion, Symbol rechts) · `.knopf.knopf-still[aria-pressed]` (stille Aktion oder Wahl). Mindesthöhe 44 px, gedrückt `translateY(1px)`. In `tafeln.css`.

### Status-Symbol, ID-Marke, Merksatz, Hinweis
`svg.status-symbol[data-status] > .form + .zeichen` (Form + Farbe, nie Farbe allein) · `.id-marke[data-art="ent|ris|frw|aen|mas|nac|prb"]` (Kürzel nach Companion §3, Form `ENT-017`) · `.lehre` (Merksatz auf Gold-Fläche, Symbol `lesezeichen`) · `.hinweis-zeile` (Symbol `info` + Text). In `tafeln.css`.

### Glossar-Begriff und Tooltip (`.term`, `.tip`)
`span.begriff[role=button]` im Fließtext (gepunktete Unterstreichung, `cursor: help`), Tooltip `div.tipp[role=tooltip] > b + Text + small` (fest positioniert, erscheint bei Maus **und** Tastaturfokus, bleibt offen, solange der Zeiger auf Begriff oder Tooltip steht). In `tafeln.css`, Verhalten in `src/ui/bausteine/tooltip.ts`.

### Tafeln
`figure.tafel[data-form]` aus `src/grafik/tafel.ts`: Radar (`.tafel-radar`, `.radar-…`), Wirkungsketten (`.tafel-ketten`, `.ausloeser`, `.wirkungskette > li.glied-1…3`), Mandatsschwelle (`.tafel-schwelle`, `.schwelle-…`), Pyramide (`.pyramide-stufe`), Verantwortungsfelder (`.felder-schalter`, `.feld-karte[data-zustand="chaos|ordnung"]`), Bausteine (`.baustein-karte`), Phasen und Rhythmus (`.tafel-leiste`, `.leiste-knopf`), Register und Karten (`.register-karte`, `.tafel-karte`), Zeitachse (`.zeitachse-…`), Selbstdiagnose (`.diagnose-…`). Gemeinsam: `.tafel-titel`, `.tafel-auswahl`, `.tafel-detail`, `.tafel-einleitung`. In `tafeln.css`.

### Regie und Leinwand (O-9)
`.regie > .regie-kopf + .regie-raster (.regie-links: .regie-vorschau > .vorschau-rahmen > .vorschau-buehne (1280 × 720) · .regie-rechts: .regie-karte, .regie-notiz, .regie-leitfragen, .regie-einwand, .regie-protokoll-…) + .regie-fuss`; Leinwand `.leinwand` (bzw. `.leinwand-warten`) mit `.anzeige`; `.ist-beamer` vergrößert und verstärkt (siehe „Beamer-Modus“). In `regie.css`.

### Startseite
```html
<div class="startseite">
  <header class="start-kopf">Bildmarke (navy) <div class="start-absender"><b>Governance Kompass</b><span>Bauherr Mentoren · MVG V1.2</span></div></header>
  <main class="start-haupt">
    <div><p class="start-kicker">Minimum Viable Governance</p><h1 class="start-titel">…</h1><p class="start-these">…</p></div>
    <div class="tueren">
      <a class="tuer" data-weg="theorie" href="#theorie"><svg class="tuer-bild kapitel-striche">…</svg>
        <h2 class="tuer-titel"><span class="tuer-kicker">Erklärt</span>Kapitel für Kapitel</h2><p class="tuer-text">…</p>
        <span class="tuer-meta"><span>13 Kapitel</span><span class="tuer-los">Öffnen symbol('pfeilRechts')</span></span></a>
      <a class="tuer" data-weg="story" …>… .weg-start, path.weg-a, path.weg-b, text.weg-text[data-welt] …</a>
    </div>
  </main>
  <footer class="start-fuss"><span>… <span class="start-vermerk">fachlich ungeprüft</span></span><span class="leise-links"><a class="leise-link">Hilfe</a><a class="leise-link">Präsentieren</a></span></footer>
</div>
```

### Theorie-Lernseite
```html
<div class="lernseite">
  <header class="lern-kopf">Bildmarke <p class="lern-bereich">Erklärt <span>· Kapitel für Kapitel</span></p><a class="lern-kopf-link lern-kopf-leise">Hilfe</a><a class="lern-kopf-link">Start</a></header>
  <div class="lern-rahmen">
    <nav class="kapitel-verzeichnis-nav" aria-label="Kapitel"><details class="kapitel-verzeichnis" open><summary class="t-label">Kapitel</summary><ol class="kapitel-liste"><li><a aria-current="page" class="ist-gelesen"><b>2</b><span>…</span></a></li>…</ol></details></nav>
    <main class="lern-inhalt" id="lern-inhalt">
      <header class="kapitel-kopf"><span class="kapitel-nr">2</span><p class="kapitel-kicker">…</p><h1 class="kapitel-titel">…</h1><p class="kapitel-einstieg">…</p></header>
      <section class="kernaussage"><span class="t-label">Kernaussage</span><p>… <em>Mandat</em> …</p></section>
      <div class="lesetext">(Markdown-HTML)</div>
      <div class="lernkarten"><button class="lernkarte" aria-expanded="false"><span class="lernkarte-titel">…</span><p>…</p></button>…</div>
      <figure class="lern-grafik">(SVG aus src/grafik) <figcaption>…</figcaption></figure>
      <section class="originaltext"><header class="originaltext-kopf"><span class="t-label">Originaltext V1.2 · wörtlich</span><span class="originaltext-quelle">Kap. 2.4</span></header>
        <p class="absatz" id="…"><a class="absatz-id" href="#…">Absatz-ID</a><span>wortgleicher Text</span></p>…</section>
      <div class="querverweise"><a class="querverweis" data-welt="a"><span class="querverweis-symbol">…</span>In der Story: Station 3 <small>Welt A</small></a></div>
      <nav class="kapitel-nav" aria-label="Kapitel blättern"><a rel="prev">…</a><a rel="next">…</a></nav>
    </main>
  </div>
</div>
```
Theorie, Hilfe und Explore zeichnen ihren Inhaltsbereich als `main` (genau eine je Fläche, L-91), das Kapitelverzeichnis als `nav` (`display: contents`); Leinwand und Regie-Vorschau betten die Lernseite als `article` ein, die Regie hat ihren eigenen `main` (L-92). `.vermerk-hell` trägt „fachlich ungeprüft“. Ein angesprungener Absatz (`:target`) wird gold hinterlegt.

**Abbildung der DOCX (`.abbildung`, P14, O-32).** Auf der Lernseite beim Abschnitt und im Originaltext an ihrer Stelle (`.original-abbildung`):
```html
<figure class="abbildung" data-abbildung="abb-6">
  <div class="abbildung-rahmen"><img class="abbildung-bild ist-vergroesserbar" alt="…" width="1200" height="886"></div>
  <figcaption class="abbildung-unterschrift">
    <span class="t-label abbildung-marke">Abbildung 5 · Kapitel 4</span><span class="abbildung-titel">…</span>
    <span class="abbildung-vorrang">Abbildung aus dem Originaltext. Wo sie vom Text abweicht, gilt der Text.</span>
    <span class="abbildung-angeglichen">Im Bild an die Begriffe des Texts angeglichen: „…“</span>
    <details class="abbildung-abweichungen"><summary>Abweichungen vom Text (n)</summary><ul><li>… (<a class="abbildung-beleg">k4-p1</a>)</li></ul></details>
    <button class="knopf knopf-still abbildung-gross">Vergrößern</button>
  </figcaption>
  <dialog class="abbildung-dialog">Kopf (Titel, Schließen) + Bild in voller Breite, mindestens 900 px (schmale Fenster rollen waagrecht)</dialog>
</figure>
```
Weiße Karte wie `.lern-grafik`, Bild auf ganzer Spaltenbreite; Klick aufs Bild öffnet ebenfalls den Dialog (Tastatur: der Knopf). Auf der Leinwand und im Druck ohne Knopf und Dialog, mit aufgeklappten Abweichungen (dort kann niemand aufklappen). Der Dialog hat keinen Innenabstand, der Kopf klebt bündig; eingebettet ist seine Höhe auf das Fenster der Hostseite gedeckelt (gemessen oder von der Hostseite gemeldet; unbekannt: 640 px, und am Dialogende rollt die Hostseite weiter). Die Grafik-Dialoge der Hilfe folgen demselben Layout. Mausrad, Wischen und Rolltasten über dem offenen Dialog rollen nur ihn – nie die Seite oder die Hostseite dahinter, auch wenn das Bild ganz hineinpasst (`halteRollenImDialog`). Ausnahme eingebettet ohne bekannte Fensterhöhe (`data-rollfrei`): Am Dialogende und neben dem Dialog rollen Rad und Rolltasten die Hostseite bis zur Dialogkante, nie darüber hinaus; Wischen gibt der Dialog dort an die Hostseite weiter.

## Barrierefreiheit

- **Kontrast** nur über die erlaubten Paare oben (≥ 4,5:1; Grafik ≥ 3:1), gemessen im Test.
- **Fokus immer sichtbar:** 3 px Ring (`--fokus`): Navy mit Gold-Hof auf hellen Flächen (Lagetafel, Seitenleiste, Start, Theorie, `.flaeche-hell`), Gold-hell auf Navy (`.leitstand`, `.auf-navy`). Nie `outline: none` ohne Ersatz; Maus-Klicks zeigen keinen Ring (`:focus-visible`).
- **Tastatur überall:** alle Bedienelemente sind `button`/`a`/`[role=slider][tabindex=0]`; Tasten A–D, ←/→, Esc wie im Prototyp; Dialoge (Rollen-Linse, Abbildungs- und Hilfe-Grafik-Dialog) halten den Fokus – Tab und Umschalt+Tab kreisen im Dialog, auch eingebettet – und geben ihn beim Schließen zurück.
- **Nie nur Farbe:** Welt = Farbe + Wort („Welt A · ohne MVG“), Status = Form + Wort, Rolle = Farbe + Name, Auswahl = Fläche + Ring + `aria-pressed`, Prüfpunkt = Symbol + Wort.
- **Sprache und Struktur:** `lang="de"`, Silbentrennung automatisch, eine `h1` je Fläche, Landmarken (`header`, `nav`, `main`, `aside`), Live-Region für Statusänderungen (Prototyp `#live`), `.nur-sr` für Werte, die sonst nur grafisch sind; Sprunglink `.sprunglink` zur Lagetafel.
- **Bewegung:** siehe oben; kein Blinken schneller als 3 Hz (die Vorspul-Ikone wechselt mit 2,9 Hz nur während des Zeitsprungs und entfällt bei reduzierter Bewegung).
- **Zielgrößen:** Bedienelemente ≥ 36 × 36 px (Entscheidungsknöpfe ≥ 96 px hoch, Reglergriff 48 px). Ausgenommen sind Textverweise (im Fließtext, in Tabellen und Listen, Absatz-Permalinks, Fußverweise) und die Fortschrittsschritte bei schmaler Breite; für sie gilt WCAG 2.5.8 (≥ 24 px oder ausreichender Abstand, L-73/L-75); unter 380 px stehen Stationen ab acht Schritten in einem Raster mit fünf Spalten, jeder Schritt ≥ 24 × 24 px (L-132, L-133) – die frühere Ausnahme „gleichwertige Bedienung“ (L-108) ist entfallen.
- **Geräte:** 1280 × 720 (Beamer), 1024 × 768 (iPad quer), 400 px Breite lesbar ohne waagerechtes Scrollen (Referenzseite geprüft).

## Tabus

- Keine Emojis, keine Clipart, keine Stockfotos; Illustration nur als flache SVG nach dem Figurenvertrag.
- Keine lila-blauen Verläufe, keine Neon- oder Glaseffekte, keine Schlagschatten auf Text. Erlaubte Verläufe: Koralle → Gold → Türkis (Welt A ⟷ B), der helle Instrumentenverlauf, Navy-Tiefen im Rahmen.
- Keine Farben außerhalb von `tokens.css`; keine Ampelfarbe als Dekoration (O-11).
- Keine Kursivschrift (nicht eingebettet), keine weiteren Schriftschnitte, keine Systemschrift als Gestaltungsmittel; Caveat nur auf Haftnotizen.
- Kein Logo als Rastergrafik, nicht gestaucht, nicht umgefärbt; keine Wortmarke unter 96 px Höhe.
- Keine Bedienelemente auf der Startseite außer den zwei Türen und den leisen Links (O-21); Explore und Präsentieren nie als Hauptweg.
- Keine Begriffe aus der Verbotsliste (`docs/BEGRIFFE.md`) in Labels, Ikonen-Namen oder Beispieltexten.

## Prüfungen und Werkzeuge

| Befehl | prüft / erzeugt |
|---|---|
| `node --test tests/stil-kontrast.test.ts` | Kontrast aller Paare aus `paare.json` gegen `tokens.css`; diese Tabelle = Liste; O-11-Farben unverändert |
| `node --test tests/stil-tokens.test.ts` | keine Farbwerte außerhalb der Tokens, jede `var()` definiert, Import-Reihenfolge, Schriftgewichte, Ikonen |
| `node --test tests/stil-werkzeuge.test.ts` | PNG-Decoder, Logo neu gezeichnet = `quellen/marke`, Schriften nur Variante-B-Schnitte, unicode-range aus @fontsource, deterministisch |
| `node werkzeuge/logo.mjs [--vergleich]` | Logo-SVGs aus dem Original-PNG (potrace, deterministisch); `--vergleich` → `tmp/logo-vergleich.png` |
| `node werkzeuge/schriften.mjs [--ziel p]` | `src/generiert/schriften.css` (22 @font-face, ≈ 562 KiB) |
| `node werkzeuge/stilreferenz.mjs [--bilder]` | `tmp/stilreferenz.html`, Bildschirmfotos 1280/400 px, meldet Konsolenfehler und waagerechten Überlauf |

## Beamer-Modus (E10, L-71)

- Die Regie schaltet „Beamer“: `.ist-beamer` an Leinwand und Vorschau-Bühne. `.anzeige` bekommt `zoom: 1.15`, und `--tinte-2`/`--tinte-leise`/`--linie` werden kräftiger.
- `vh` ist unter dem Zoom ungezoomt: Leitstand (ab 981 px), Kapitelverzeichnis (ab 1100 px) und Startseite rechnen ihre Höhen durch 1,15 (`--vh: calc(1vh / 1.15)`); auf Beamern bis 800 px Höhe entfällt das Türbild der Startseite.
- Die Regie-Vorschau ist eine feste Bühne von 1280 × 720 (`--vh: 7.2px`), unabhängig vom Regie-Fenster.

## Offen

- **Grafik-Baukasten** (`src/grafik/`): nutzt `--gitter`, `--spur`, Welt- und Statusfarben; eigene Regeln entstehen dort.
