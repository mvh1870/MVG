# Whitepaper graphics: scouting report (images 1–15)

## Key findings
- **All content images (2–14) look AI-generated and exist only as raster files, with text baked into the pixels.** Signs of this:
  - Broken hyphenation: "Grundsatze-ntscheidung" (image 5).
  - Clipped words: "eche Entscheidung" instead of "echte" (image 11).
  - Garbled text: "RISK / TRNEL / OLEE" (image 12).
  - Faint phantom bridges and gears in the backgrounds, and uneven icon stroke widths.
  - The pixel sizes match the 1K aspect presets of Gemini "Nano Banana Pro" exactly: 1376×768 (16:9), 1264×848 (3:2), 1200×896 (4:3), 1152×928 (5:4). The PNGs (image3 1448×1086, image4 1116×810, image6 1448×1069) look like edited or cropped versions.
  - At about 1K they are fine as figures, but too soft for full-screen hero use on retina screens.
- **Terminology drift.** Most images use an older vocabulary that the text has since replaced:
  - "G0–G5" gates instead of LPH 0–9 Freigaben
  - "Operating Model" instead of Betriebshandbuch / Regelbetrieb
  - "Design" instead of Konzeption
  - "Reset" instead of MVG-Neuinitialisierung
  - "Impact" instead of Auswirkungsbewertung
  - "Risk", "Evidence", "Long Lead", "Readiness", "Files", "Capex"
  - Nothing that uses these labels can be carried over unchanged.
- **Font:** the labels look like a Roboto / Roboto Condensed-style sans. Image4 uses a different typeface for "Mandats-schwelle".

## Per image
In each entry: what it shows, the labels, the structure, the style, the mismatches with the text (marked ⚠), and a recommendation.

**image1 (cover logo).** White on transparent PNG, 698×937: towers, bridge arc, "BAUHERR MENTOREN". Clean. No vector version exists in MVG or BM. **Reuse it; ask the owner for an SVG.**

**image15 (footer logo).** 216×273, white on solid **#0070C0**, which is Office's standard blue, not a BM brand colour. Low resolution. **Replace it** with the SVG logo on a CSS background.

**image2 (Kurzfassung).** A three-column flow with arrows:
- Left, "Delegierbare Arbeit": Rollen (Planer, Projektsteuerer, PMO, Gutachter, Berater) and Funktionen (Analyse, Vorbereitung, Koordination, Dokumentation).
- Middle, navy "MVG" with a bridge badge: 10 tiles (Zielsystem, Rollen, Mandate, Freigaben, Entschei-dungs-IDs, Datenstand, "Risk / Änderung", Nachweis, Betriebs-handbuch, Befähigung).
- Right, green "Bauherr": Ziel, Mandat, Entscheidung, Freigabe, Risikoannahme, Datenstand, Nachweis.
- ⚠ "Risk" is English. The text has 6 fields with "Datenstand und Nachweis" combined; the image splits them into 7. Freigabe comes before Risikoannahme, while the text order is Risikoannahme → Freigabe.
- **Rebuild as an animated SVG. This is the story's "master map".** Work items flow left → MVG → Bauherr; clicking a tile jumps to its chapter. Good as a chapter opener or overview.

**image3 (Ausgangslage).** A cascade:
- Three driver cards: "Volatile Märkte – Kippende Annahmen" (blue tint), "ESG & LCC – Späte Zielkonflikte" (green), "Schlüsselrollen – Wissensverlust" (lilac).
- → "Entscheidungsdruck" (gauge) → "Fehlende Architektur" (Entscheidung, Freigabe, Dokumentation, Gremium, joined in a broken dashed loop).
- → 5 symptoms: Rollen ohne Mandat, Risiken nicht entscheidungsreif, "Changes ohne Schwellen", Parallele Datenstände, "Organisation nicht gerichtsfest".
- → "Diffuse Verantwortung und Steuerbarkeit".
- ⚠ "Changes" is English. "Gerichtsfest" is a legal claim, but the text deliberately stays non-legal (5.5); it uses "organisationsfest" / "nachweisfähig". The final label reads as if Steuerbarkeit were a symptom. The image shows 5 symptoms; the table in 2.5 has 8.
- **Rebuild as an animated "pressure cascade".** Drivers pulse, pressure flows down, and clicking a symptom opens its row from the 2.5 table. Strong opener.

**image4 (Begriffsrahmen).**
- Left "Delegierbare Arbeit": Analyse, Vorbereitung, Berichterstattung, Koordination, Dokumentation, Befähigung.
- Centre column "Mandatsschwelle": "Vorbereitung endet" / "Entscheidung beginnt", with a lock shield and faint gates.
- Right "Bauherrenverantwortung": Zielpriorität, Mandat, Entscheidung, Freigabe, Datenstand, Nachweis.
- ⚠ **Risikoannahme is missing** from the right side, even though it is one of the six core fields. The centre label is in a different font.
- **Rebuild.** The "Mandatsschwelle" gate is the central metaphor of the whole story: drag or click a task and it either passes (delegable) or bounces back to the Bauherr. Ideal for interaction.

**image5 (Verantwortungspyramide).** A pyramid:
- Apex: "Bauherr legitimiert".
- "Letztverantwortung": Ziel, Grundsatze-ntscheidung ⚠, Freigabe, Risikoannahme, Nachweis, Beschlusslage; side note "bleibt beim Bauherrn".
- "Mandatsebene": Befugnisse, Freigabe-grenzen, Zeichnungs-rechte, Eskalation, Gremienbezug; side note "begrenzt übertragbar".
- "Arbeitsebene": Analyse, Planung, Koordination, Dokumentation, "Impact-Bewertung" ⚠, "Inputs" ⚠.
- Base "MVG": Inputs, Rollen, Freigaben, Entscheidungs-IDs, Datenstände.
- Two identical "Dritte / Dritte bereiten vor" side panels, with empty header bars.
- ⚠ "Stellvertretungen" from the text is missing.
- **Rebuild.** The layers assemble bottom-up; clicking a layer shows the three-row table from 3.3; the "Dritte" arrows animate into the Arbeitsebene only.

**image6 (Verantwortungsfelder).**
- Hub "MVG-Kern" with the attributes ausübbar / prüfbar / gestaltbar / nachweisfähig. ⚠ The text says "sichtbar, prüfbar, gestaltbar".
- Six cards around it:
  - Ziel: Zielsystem, Muss/Kann, "Kompromiss-Regeln" (text: Abwägungsregeln), "G0 / G1" (text: LPH 0–2)
  - Mandat: Mandatsmodell, Schwellen, Eskalation, Freigabebezug
  - Entscheidung: "Entscheidung ID" (hyphen missing), "Reifegrad" (text: Entscheidungsreife), verantwortliche Rolle, Entscheidungsfrage
  - Risikoannahme: "Risk / Änderung", Restrisiko, Risikominderung, Schwellenlogik
  - Freigabe: "Freigabe-Set G0-G5" ⚠, Mindestgrundlagen, Datenstandsbezug, Freigabeschwelle
  - Datenstand & Nachweis: Version, Beschlusslage, Nachweiske…, Betriebshandb… (both cut off by a sticky note)
- Chaotic sticky notes: Laufwerk, Vertrag, CDE-Planer, Telefon, k. A., ??, SAP, Email. These represent informal information sources.
- **Rebuild. Best "before/after" scene:** the sticky-note chaos scatters, then the notes snap into the six fields. Each card opens its row from the chapter 4 table: Kern / Vorbereitung / Fehlstelle / MVG-Antwort.

**image7 (MVG model).**
- Five columns with arrows:
  - Zielsystem: Zielsystem, Prioritäten, Datenstand, Dokumentierte Optionen
  - Rollen & Mandate: Rollen, Verantwortung, Mandate, Mandatskarte
  - "Freigaben & Files" ⚠: Freigabe, Entscheidungsvorlagen, "Impact Check", Nachverfolgung
  - Steuerungslogik: KPIs, Managementberichte, Datenstand, Nachverfolgung
  - "Operating Model & Aktive Führung" ⚠: Input → ⇄ → Entscheidung / Umsetzung; Governance-Routinen; "Aktive Entscheidungsführung" checklist
- Principles bar: "Minimum first", "Impact First" ⚠ (inconsistent capitalisation), Entscheidungsreife, Evidenz, Auditierbarkeit.
- ⚠ It does not match the 8 building blocks in 5.2. Entscheidungs-IDs, the risk/change/action linkage, Betriebshandbuch and Befähigung are missing, and Datenstand and Nachverfolgung are duplicated.
- **Use only as inspiration.** Rebuild natively around the 8 building blocks, with the coupling example from 5.3 (a change runs through ID → Datenstand → Auswirkung → Mandat → Freigabe → Nachweis) as the animation.

**image8 (LPH 0).**
- Hub "LPH0" (⚠ no space) with six cards:
  - Zielsystem: "Capex" ⚠, Termin, Qualität, ESG, LCC, sliders, "Kompromisse"
  - RACI: matrix plus Mandate / Freigaben. ⚠ The A column is marked for several rows.
  - Governance: Lenkungs-, Projekt-, Fachebene, Rhythmus, Standardagenda
  - Freigabe: Entscheidungsreife, gate, checklist
  - Risikoregister: **orange**; Änderungssteuerung, Frühwarnung
  - KPI-System: Nachweisführung
- ⚠ The text for 5.4 emphasises Datenstandslogik and the Freigabemodell. KPIs are not mentioned there, and the text says explicitly that LPH 0 is *not* the main narrative.
- **Opener candidate.** It is the most colourful image. Rebuilding is optional; the goal-trade-off sliders make a nice mini-interaction.

**image9 (MVG Companion).**
- MVG-Logik → "Companion" (bridge badge) "Anwendung": Entscheidung, Freigabe, Mandat, Datenstand, "Evidence" ⚠, Betriebshandbuch, Übergabe → Befähigung → Regelbetrieb.
- Loop arrow labelled "Operating Model" ⚠.
- Bottom rules: Bauherr entscheidet, Freigabe bleibt, Rollenrechte, Nachweiskette, "Prüfung-Takt" ⚠ (should be Prüfrhythmus).
- ⚠ The tiles do not match the 7 functions in 6.1 (Rolleneinführung is missing).
- **Opener** (clean, low density). Alternatively rebuild with the tiles mapped to the 7 functions.

**image10 (Governance-Fluss).**
- Network of: Frühwarnung "– schwaches Signal", Problem, Änderung, CTC / Prognose, Risiko "– bewertet (P-A)", Entscheidungs-register, Entscheidungs-vorlage, "Freigabe (G0–G5) – Go / No-Go", Maßnahme, Managementbericht.
- Edge labels: wird zu (bestätigt), "Indicator" ⚠, wesentlich, eskaliert, erfordert, ausarbeiten, führt zu, beeinflusst, reif, erzeugt, Auflagen, Bericht, "mitigiert das Risiko (Regelkreis schließt)".
- Top banner: "Schwellenwert löst Frühwarnung aus". Legend with three line styles.
- ⚠ Mismatches:
  - G0–G5 vs LPH 0–9.
  - Go/No-Go vs "Freigabe / keine Freigabe / Freigabe mit Auflagen".
  - "Schwaches" vs "unbewertetes" Signal.
  - The threshold arrow points *into* CTC; the text says CTC breaches *create* new early warnings.
  - Freigabe is drawn as following every decision template, while the text defines it strictly as the decision at the end of a Leistungsphase.
  - The image covers only 6.4.3, not register ownership or cadence.
- **Top candidate for a native animated SVG.** Signal "tokens" travel the canonical chain EW → bestätigt → Risiko → Entscheidung → Freigabe → Maßnahme → Managementbericht. Nodes show their status sets and owning role (6.4.2 table), and the presenter can inject events.

**image11 (Leistungsarchitektur).**
- Reifegradanalyse (Lagebild, Mandate, Datenstand, 30/60/90 Plan) → "MVG Design" ⚠ (Zielsystem, "Freigabe-Set" ⚠, Entscheidungs-IDs, Betriebs-handbuch) → "Pilot & Kalibrierung" ("eche Entscheidung" ⚠, Schwellen, Management-bericht) → Befähigung & Übergabe (Rollenkarten, Routinen, Abnahme) → Regelbetrieb (Steuerbarkeit, Nachweis, Betriebs-verantwortung).
- Lower track: "Reset / Neuinitialisierung" → Bewertung → Stabilisierung ⇢ Regelbetrieb.
- **Rebuild** as a clickable path. Each station opens its Aspekt table from 7.1–7.5, and the Neuinitialisierung branch is shown as a special track.

**image12 (Reifegradanalyse).** This image contradicts the text most seriously.
- "MATURITY ASSESSMENT" gauge scaled 0–5.
- 5 domains, each with "Nachweise" and a "Punktwert 0–5" (0.0 / 1.2 / 2,7 / 4,3 / 3.0 — mixed decimal separators): Governance & Organisation; Risiko & Änderungssteuerung ("Frühwarnungs", "Änderung Requests + Impact"); Ressourcen & Rollenfähigkeit ("RISK TRNEL OLEE" garbled); Informationsmanagement & Entscheidungsreife; QA/QM ("Defect-Logik").
- Outputs: Heatmap, "Roadmap für 30/60/90 Tage" (Quick Wins / Stabilisierung / Optimierung), RACI with "Projektauftraggeber / Manager / Team" (several A's).
- ⚠ The text specifies **10 domains, 49 questions, Ja 100 / Teilweise 50 / Nein 0, scale 0–100, <55 kritisch / 55–79 mit Lücken / ≥80 steuerbar**. Its 30/60/90 foci are Diagnose / Konzeption / Anwendung, and "Manager" is not one of the 13 roles.
- **Do not reuse. Rebuild natively** as an interactive mini self-assessment (10 domains, 0–100 traffic-light bands, heatmap). This is the natural simulator core.

**image13 (Implementierung).**
- Setup ⚠ → Diagnose (Gap-Map, Bewertungsmatrix, Entscheidungsliste) → Design ⚠ (Zielsystem, Mandatsmodell, Freigabe-Set ⚠, Entscheidungs-IDs, Datenstandslogik) → Pilot → Befähigung ("Training") → Übergabe (Betriebshandbuch, "Prüfung-Takt", Betriebsstart) ⇢ Regelbetrieb (Abnahmefähig, Betriebsstart again).
- Timeline bar: 0–30 Sichtbarkeit / 31–60 Mindestmodell / 61–90 Anwendung. These labels match the text.
- ⚠ The steps should be Einrichtung / Konzeption / Pilotierung und Kalibrierung. Drawing 30/60/90 underneath the whole process contradicts the text ("kein allgemeiner Einführungsrhythmus").
- **Rebuild** as a scrubbable timeline.

**image14 (Anwendungssituationen).**
- Four quadrants around "Governance-Kern" (Entscheidungsakte ⚠ instead of Entscheidungsvorlage, Freigabelogik, Eskalationspfad):
  - Öffentliche Bauherren: Nachweisfestigkeit, Gremienlogik, Vergabeanbindung
  - Private / Institutionelle: Geschwindigkeit, Zielkonflikte, Entscheidungssicherheit
  - Energie / Infrastruktur: Priorisierung, "Long Lead" ⚠, "Freigabe-Readiness" ⚠
  - Driftende Projekte: Lagebild ordnen, Mandate klären, "Governance-Reset" ⚠
- Bridges connect the quadrants.
- **Opener, and a persona selector** ("Welcher Bauherr sind Sie?") that personalises the story path.

## De-facto colour palette (PIL: median-cut per image plus hue-family clustering over images 2–14)
The whitepaper's look is almost monochrome petrol/teal on icy tints.

| Role | Hex | Where |
|---|---|---|
| Primary petrol (headers, icons) | **#146878** / #10687C / #155870 | all images |
| Petrol mid | #2E7588 / #2C7888 | image7, image14 |
| Deep navy (emphasis headers) | **#0C446C** / #0C5074 / #105878 (MVG box) | image2, image7, image13 |
| Dark ink navy | #183858 / #143F65 / #0D3550 | image3 bars, text |
| Blue (RACI / Freigabe headers, arrows) | #145488 / #1A5989 / #185890 | image4, image8 |
| Green ("Bauherr", Regelbetrieb, Design) | **#349068** / #2C885C / #409C68 / #287C3C | image2, image5, image9, image13 |
| Aqua-teal (KPI) | #249094 / #148490 | image8, image12 |
| Orange-red (risk; only accent) | **#D44C20** (tint #FDF0E9) | image8 |
| Surface tints | #E7F3F8, #E5EEF7 (blue), #E5F4E9 (mint), #E1F3F4 (aqua), page #F5F9FC | everywhere |
| Lilac tint | #E9E8F5 | image3 |
| Sticky notes | #FEF29C yellow, #D8F8A0 lime, #FDC5C4 / #FDBED5 pink, #E0D4F8 lilac, #E8F0F8 blue | image6 |
| Muted grey-teal lines | #83A3AC / #99BDBC | connectors |
| Logo field | #0070C0 | image15 |

Comparison with the sister project: BM's tokens (`C:/Users/heinz/projects/BM/pakete/kern/src/ui/tokens.css`) use navy **#0C1C33** / #1D3258, gold **#A8823C**, status green #3A7A43, yellow #B08820 and red #9A3030. The whitepaper images have **no gold at all**, and their navy is more petrol. For a "more colourful" story, combine the whitepaper petrol/green with BM navy and gold, and add the orange (#D44C20) and the sticky-note pastels as accents.

## Openers vs. native rebuilds
- **Chapter openers (low density, use as atmospheric raster images, possibly with a slow Ken-Burns effect):**
  - image14 (Anwendungssituationen)
  - image9 (Companion)
  - image8 (LPH 0)
  - image3 (Ausgangslage)
  - image2 (Kurzfassung / overview)

  Even these carry ⚠ labels, so either regenerate them with corrected text, or crop and blur them as backgrounds.
- **Dense diagrams to rebuild natively as SVG** (priority order):
  1. image10 (flow simulation)
  2. image12 (self-assessment)
  3. image6 (chaos → order)
  4. image4 (the threshold gate)
  5. image5 (pyramid)
  6. image11 and image13 (paths / timeline)
  7. image7 (rework to the 8 building blocks)
- **Print / whitepaper mode:** images 2, 3, 5, 9 and 14 can serve as "Abbildung" figures if the English terms are acceptable. Images 6, 7, 10, 11, 12 and 13 should not be printed unchanged because of the G0–G5 / Operating-Model / 0–5 scale contradictions.

Working files: palette figures computed from `.../scratchpad/docx/word/media/`; close-up crops in `C:/Users/heinz/AppData/Local/Temp/claude/C--Users-heinz-projects-MVG/0b3db9fe-c448-4a3b-bb69-5623eba83339/scratchpad/crops/`.