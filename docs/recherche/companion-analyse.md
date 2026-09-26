# MVG-Companion as reference for the MVG story (read-only scouting)

Nothing was modified. Everything below comes from reading files and running `git remote -v`, `git branch` and `git tag`.

## 1. Terminology (`C:/Users/heinz/projects/MVG-Companion/KONZEPT-2026k-Terminologie.md`)

**Status of the programme.** It is the SSOT (single source of truth) of the "Deutsche Terminologie" programme. Owner decisions are E1–E95 and S1–S18. **Round 7 (E27–E31) overrides E7/E9/E13/E14/E20**, so the §2.3 table rows "Gate → Freigabepunkt / P0–P9" are stale. HEAD is R908 (v1.34.827). B3–B12, which include the ID migration, are still open.

**Binding terms (German):**
- **Zeitraum = Leistungsphase (LPH 0–9); Entscheidungstor = Freigabe.** Read "Freigabe LPH 3" as the Freigabe of LPH 3 (E27). "Gate" is removed completely from visible text (E7).
- Planned key migration: `GATE-<KURZ>-G<n>` → `LPH-<KURZ>-<n>` (E28). It has not run yet. The data still says `GATE-NETZNORD-G5`, but the display name is already `LPH 5 Ausführungsplanung` (E40).
- LPH 0 stays and the span is 0–9 (S7). LPH 0 is Bedarfsplanung per DIN 18205, which comes before the HOAI. The HOAI only covers LPH 1–9.
- The register is titled **"Leistungsphase"** (E29), not "Freigaberegister". Companion introduction phases are called **"Etappe"** (E31), so they are not confused with LPH.
- Go, No-Go and Go with Conditions stay as stored values. The display target is *Freigeben / nicht freigeben / Freigabe mit Auflagen* (E2). The Companion UI still shows "Go / No-Go / Go with Conditions" in many texts, and "Freigabe mit Auflagen" has 0 hits in the source.
- Navigation names (§2.1): Entscheidungsvorlage, Frühwarnung, Problem, Maßnahme, Änderung, Risiko, Managementbericht, Entscheidung, Phase→Leistungsphase.
- Register names (§2.2): Frühwarnungsregister, Problemregister, Maßnahmenregister (R572 "Action" was revoked), Änderungsregister, Risikoregister, Entscheidungsregister.
- "Artefakt" becomes **"Registerdokument"** (E32).
- Other terms: Decision Readiness→Entscheidungsreife, Readiness→Reifegrad, Readiness Check→Reifegradanalyse, Handover→Übergabe, Runbook→Betriebshandbuch, Audit Trail→Nachweiskette, Evidence→Nachweis, Evidence & Links→Nachweise & Verknüpfungen, Owner→Verantwortlich (column) / verantwortliche Rolle (running text) (E4), Scope→Umfang (E74), Heatmap→Bewertungsmatrix, Snapshot→Momentaufnahme, Board Pack→Sitzungspaket, Mitigation→Risikominderung, Contingency→Risikoreserve, EAC→erwartete Gesamtkosten, Long-Lead Item→Komponente mit langer Lieferzeit, Sponsor→Projektauftraggeber, Stakeholder→Beteiligte, Decision Log→Entscheidungsregister, Decision Pack→Entscheidungspaket, "entscheidungsreif"→"beschlussreif" where it would double up (E87), Gap Map→Lücken / Governance-Lücken (still open, B2b-3j).
- **Kept as they are:** Governance, Minimum Viable Governance (MVG), MVG Companion, MVG-Charter, RACI, PMO, ESG, LCC, KPI, CTC, EAC, FID, BPMN, Portfolio, Dashboard, Board, Baseline, Kickoff, Milestone. Stored values also stay: `Change-Board`, `Risk-Review`, `Gate-Review`, `CTC / Forecast`, `Governance & Reporting` (S12/E52/E53).
- **ID prefixes planned in §3 (not migrated yet):** DEC→ENT, RSK→RIS, EW→FRW, CHG→AEN, ACT→MAS, EVD→NAC, CAL→KAL, ROLE→ROL (except `ROLE-MENTOR`), THR→SWL, CLT→KVL.
- **Current ID format:** `DEC-NETZNORD-2026-003`. The Entscheidungsvorlage uses `DF-NETZNORD-2026-003`.
- **"D-017" does not exist anywhere in the Companion or the whitepaper text.** For the story, the target form would be `ENT-NETZNORD-2026-017`.

**Status names:**
- Entscheidungsregister and approval workflow: `offen · in Prüfung · vorbereitet · freigegeben · beschlossen · beschlossen mit Bedingungen · abgelehnt` (`src/core/registerdefs.ts:125`).
- Risiko: `aktiv · beobachtet · gemindert · geschlossen`.
- Frühwarnung: `aktiv · bestätigt · eskaliert · geschlossen`.
- Änderung: `offen · in Prüfung · beschlossen · abgelehnt · umgesetzt`.
- Maßnahme: `offen · in Arbeit · geplant · abgeschlossen`.
- Freigabe: `offen → in Vorbereitung → abgeschlossen`.

**Roles** (demo data): ROLE-OWNER Bauherr / Auftraggeber, ROLE-OWNERPL Bauherren-Projektleitung ("Bauherren-PL"), ROLE-PMO, ROLE-PS Projektsteuerung, ROLE-LK Lenkungskreis, ROLE-CTRL Controlling / Finance, ROLE-PROC Einkauf / Vergabe, ROLE-PLAN Planung / Fachplanung, ROLE-EXT Externe Berater, ROLE-CONTR, ROLE-AUSF, ROLE-FMOPS, ROLE-MENTOR BM-Mentor.

**Contradictions between the whitepaper and the Companion:**
1. **Mandatsleiter body:** the whitepaper (l.418) says "bis 100 TEUR Bauherren-PL / bis 5 Mio. EUR **Änderungsgremium** / darüber Bauherr im Lenkungskreis". The Companion help texts use the same thresholds but call the body **"Change-Board"** (150 hits, kept on purpose as a stored value). "Änderungsgremium" appears only 7 times.
2. **Mandate demo data does not match:** OWNERPL "bis 500 TEUR" (Beauftragungen) plus "Changes < 100 TEUR", OWNER "bis 5 Mio. EUR", LK "> 5 Mio. EUR … Freigaben G2-G4". The whitepaper says the **Bauherr grants every Freigabe himself** and the Lenkungskreis only advises and prepares.
3. **Decision status:** the whitepaper (l.610) lists Offen · In Bearbeitung · Entscheidungsreif · Entschieden · Verworfen. The Companion register uses the workflow vocabulary instead (offen / in Prüfung / vorbereitet / beschlossen …). Change status also differs: whitepaper "Beantragt" vs Companion "offen".
4. **Freigabe outcome wording:** the whitepaper says "Freigabe / keine Freigabe / Freigabe mit Auflagen". The SSOT says "Freigeben / nicht freigeben". The UI still says "Go / No-Go / Go with Conditions" and has leftover "G0–G9" and "Freigaben G0 bis G4" texts.
5. **Register naming:** the whitepaper says "Freigaberegister"; the Companion says "Leistungsphase" (0 hits for Freigaberegister).
6. **Whitepaper images:**
   - image10 says "Freigabe (G0–G5) – Go / No-Go".
   - image9 says "Evidence" and "Operating Model".
   - image11 says "MVG Design", "Pilot & Kalibrierung" and has a cropped "eche Entscheidung".
   - image14 says "Entscheidungsakte", "Long Lead", "Freigabe-Readiness" and "Governance-Reset".
   - These conflict with both the whitepaper text and the SSOT.
7. **Assessment:** the whitepaper says 10 domains / 49 questions. Demo data says "Domäne 0 + 1–10 / 53 Fragen" while the screenshot says 49.

## 2. Color strategy (`KONZEPT-Farbstrategie.md`, stage 1 implemented in `src/legacy/blocks/0001-basis.css:4-46`)

**Brand:** `--brand-navy #0c1c33` and `--brand-navy-soft #1d3258` for header, primary actions and text accents. `--brand-gold #a8823c` and `--brand-gold-soft #c69d52` for highlights and secondary CTAs. Rule: brand colors are never status colors, and status colors are never decoration.

**Status (RAG plus two):**

| Token | Solid | Soft (surface) | Meaning |
|---|---|---|---|
| rot | `#9a3030` | `#f1d8d8` | überfällig / kritisch / fehlt / No-Go |
| gelb | `#b08820` | `#f3e9c8` | in Arbeit / bald fällig / mit Auflagen |
| grün | `#3a7a43` | `#dfeadf` | ok / erledigt / belegt / Go |
| neutral | `#5a6b82` | `#e8edf6` | offen / N/A |
| info | `#3866a8` | `#dfe6f0` | hints, links |
| violett | `#6a4ca5` | `#ece5f6` | special / process accent |

**Register category accents** (independent of status): Decisions `#1d3258` · Risks `#9a3030` (muted) · Changes `#b08820` · Actions `#3a7a43` · Meetings/Prozesse violett `#6a4ca5` · Evidence/Daten info `#3866a8`.

**Surfaces:**
- Light: bg `#e8eaed`, panel `#ffffff`, panel-alt `#fafaf6`, border `#e6e3d9`, text `#0f1722`, muted `#6c665c`. The manifest bg is `#f7f4ee` (cream) and theme `#1d3258`.
- Dark: bg `#0a1220`, panel `#152238`, accent `#dab982`, green `#6fbf7a`, yellow `#e0b860`, red `#e07878`.

**Rules:** status is never shown by color alone (always paired with a symbol or text), contrast is at least 4.5:1, and every color has light/dark parity.

**Icons:**
- Inline SVG, "Lucide-style" (24×24, stroke), as the `ICONS` map in `src/legacy/blocks/0003-basis.js:210-255`: menu, search, gate, check, file, alert, bell, repeat, euro, calendar, shield, users, award, map, zap …
- The BM line-art skyline logo SVG (towers, bridge curves, outlined wordmark "BAUHERR MENTOREN") is just above, around l.160-207.
- App icon `icon.svg`: navy `#1d3258` rounded square, gold `#c9a13b` frame, serif "MVG" in cream `#f7f4ee`. This gold is another off-token value, like `#b8860b`.

**Fonts:** no web fonts are embedded. Headings use `--tt-serif: 'Iowan Old Style', Georgia, serif`; body uses the system sans stack at 14px/1.55.

## 3. Screenshots (dated 2026-06-04, *before* the terminology programme, so labels are still English)

- **Overall:** navy topbar with project and role selectors ("Bauherren-Projektleitung"), Ctrl-K search, undo/redo. Dark-navy sidebar with gold stars for favorites; the active item has a gold left bar. Warm off-white canvas and white cards with thin warm borders.
- **01 Portfolio:** navy hero with gold letter-spaced kicker "MINIMUM VIABLE GOVERNANCE", large serif title and stat line. KPI tiles have a colored left border (red/green/red/gold) and big serif numbers: Portfolio-Ampel 2/2/4, EAC-Drift, 19 kritische EW, 59 offene Actions. Project cards carry uppercase pills (HEALTH ROT, READINESS 40).
- **02 Dashboard:** 10 domain score bars (A Projektkontext … J Handover) in green/red. A 5×5 risk heatmap with pastel cells; occupied cells are saturated gold, orange or red.
- **03 Decision File:** list/detail layout. List items have a red left border, a pink "OFFEN" pill, a priority pill and a monospace ID. The detail shows the six-step workflow row and an MCDA table (Kosten W=5, Termin 4, Qualität 4, Risiko 5, ESG/LCC 3; scores 72 (69%) vs 79 (75%)).
- **04 Prozesse:** 44 processes in 11 category chips. Detail has Rollen / Inputs / Outputs cards and a mini BPMN (green start circle, red end circle).
- **Also on every screen:** a gold round "+" FAB, and a bottom status bar (Offen 8 · Überfällig 0 · Krit. EWs 2 · Rolle · Strict AN · "Lokal gespeichert").
- **Overall tone:** restrained "premium consulting". For a more colorful story, the defined violet, info-blue and category accents are the sanctioned extension. The whitepaper illustrations lean petrol/teal, navy and light blue, with green for Regelbetrieb.

## 4. Companion features that map onto story chapters, and props

**Chapter mapping:**
- **Ausgangslage / Symptome** → Portfolio-Ampel and Executive Cockpit tiles.
- **Verantwortungspyramide / Mandat** → the existing view "Verantwortungspyramide" (12 hits) and "Mandate & Eskalation".
- **Six Verantwortungsfelder:**
  - Ziel → MVG-Charter
  - Mandat → Mandate
  - Wesentliche Entscheidung → Entscheidungsregister
  - Risikoannahme → Risikoregister
  - Freigabe → Leistungsphase
  - Datenstand → Nachweise and Nachweiskette (`auditTrail`)
- **Companion Funktionslogik** → "Kanonischer Governance-Fluss" (`0615-bm-v622-kollaboration-view.js`, `renderInformationFlow`) plus the Register-Abgrenzung table.
- **Leistungsarchitektur:**
  - Reifegradanalyse → Readiness Assessment (0–100, <55 / 55–79 / ≥80), Governance-Lücken, 30/60/90 Maßnahmenplan
  - Konzeption → Charter, RACI-Matrix, Prozesskatalog
  - Pilotierung → Governance-Kalender plus Managementbericht
  - Befähigung → 16 training modules and role introduction
  - Übergabe → `handoverRunbook` / `projectHandoverStatus` (register coverage %, handover blockers)
- **Neuinitialisierung** → the KLINIK project.

**Props:**
1. **Mini Entscheidungsvorlage "ENT-NETZNORD-2026-003 · Reservetransformator beschaffen Ja/Nein?"** The whitepaper's 13-item checklist ticks off one by one, then a six-step signed stepper runs (offen → in Prüfung → vorbereitet → freigegeben → beschlossen | abgelehnt), then a "Freigabe LPH 6" stamp.
2. **MCDA slider widget:** the customer changes the weights and Option A/B (72 vs 79) flips live.
3. **Mandatsleiter elevator:** drop a change amount and it climbs to the right body. The demo values fit: CHG-104 60 TEUR → Bauherren-PL; CHG-001 +450 TEUR → Änderungsgremium; >5 Mio → Bauherr im Lenkungskreis.
4. **EW→Risiko flip card:** "Hersteller meldet Lieferzeit > 20 Monate" (EW-001, Hoch) becomes RSK-001 "Lieferzeit Leistungstransformator" (P4/T5) and lands in the 5×5 Bewertungsmatrix.
5. **LPH 0–9 timeline:** LPH 0–4 Freigabe (green), LPH 5 Freigabe mit Auflagen (gold), LPH 6 in Vorbereitung (2026-09-02), LPH 7–9 offen. Each Freigabe carries checklist items (191 in the demo).
6. **Reifegrad gauge** 40/100 with domain bars A–J.
7. **Managementbericht 2026-07:** Budget 18.5 Mio, EAC 19.055 Mio (+555 TEUR, +3 %), trend stabil.
8. **Governance-Kalender strip:** Lenkungskreis every 28 days (Wed 14:00), Änderungsgremium monthly, weekly Risiko-Sichtung.
9. **RACI mini-grid** with A/R/C/I chips.
10. **Role switcher** in the Companion topbar style. This could be the story's perspective and presenter device.
11. **Nachweiskette timeline** with signatures.

## 5. Build and distribution

- **Source and build:** the app is `src/legacy/skeleton.html` plus **971 blocks** (847 script, 126 style) listed in `src/legacy/manifest.json`, plus TS modules in `src/core`/`src/ui` bundled by esbuild (`buildSync`, iife, es2020).
- **`_build.mjs`:**
  - `--write-root` writes the root `index.html` (a generated file, never hand-edited) and `dist/standalone/index.html`.
  - `--twice` checks for a deterministic sha256.
  - `--pwa` writes `dist/pwa/` (index.html, .gz, .br via node:zlib, `mvg-sw.js`, manifest, icon, 2 JPGs).
  - `--beta` writes a ZIP.
  - `--kunde=<.mvgc>` embeds a white-label customer package.
- `build-dist.sh` and `build-beta.sh` only delegate to `_build.mjs`.
- **Sizes:** standalone **11,250,327 B (~11 MB)**, which includes the 545 KB demo JSON. `dist/pwa` is stale (Aug 2): 9.2 MB, br 1.83 MB, gz 2.69 MB.
- **PWA:** yes. `manifest.json` has shortcuts (Cockpit, Readout, Kalender, Gates) and file handlers for `.mvg`/`.json`. The service worker is cache-first with background revalidation. It also works from `file://`.
- **Other:** CSP is set as a `<meta>` tag; `DEPLOY.md` recommends `frame-ancestors` and X-Frame-Options headers, which matters for embedding. No fonts are inlined; icons are inline SVG. The app has no runtime dependencies; dev dependencies are playwright, axe, esbuild and typescript 7.
- **`.github/workflows/gates.yml`:**
  - ubuntu job: typecheck, `_build.mjs --twice`, `--selfprobe`, `--pwa --beta --kunde=beispiel_kundenpaket.json`, 15 headless gates with a JUnit artifact.
  - windows job: a determinism check.
- **There is no GitHub remote.** The only remote is `backup → D:/MVG-Backup/MVG-Companion.git` (a local bare repo), so the workflow has never run. Branches are master, prae2026h and claude/elated-newton-5bb07a; the latest tag is v1.34.827-R908.
- **Process weight:** CLAUDE.md is 168 KB, HANDOFF 291 KB and CHANGELOG 3.7 MB. That is a warning sign for a lean new repo.

## 6. Demo and example data

- **`mvg_project_package.json`** (identical to `src/legacy/blocks/0002-bmDemoData.json`, schema 3.5.0) has 2 full projects:
  - **NETZNORD:** "Netzausbau Transformatorstation Nord", Stadtwerke Nordmark AG, 15–20 Mio EUR, Vorbereitung Vergabe. People: Dr. Hannah Brink (Bauherren-PL), Markus Theile (PMO), PSU Steuerungspartner GmbH. Records: 17 decisions, 11 EW, 15 risks, 10 changes, 10 Freigaben.
  - **KLINIK:** "Klinikum Erweiterung Bettenhaus C", Universitätsklinikum Westfeld, 180–220 Mio EUR, "Re-Start / Governance-Reset". This is a natural fit for the Neuinitialisierung chapter.
  - Six more IDs are only leftovers: FWSUED, VSZLPH0, H2HUB, BAHNKNOT, SCHULE, ITTRANSF.
  - The data contains a ready-made chain: **EW-NETZNORD-2026-001 → RSK-001 → DEC-003 → ACT-001** (`sourceId` = EW-001).
- **Don't copy blindly:**
  - The text of DF-NETZNORD-2026-003 is about "Vergabepaket Sekundärtechnik", which does not match its decision "Reservetransformator".
  - Open decisions still reference already-closed Freigaben (G1/G2).
  - Both "erledigt" and "abgeschlossen" are used as action status.
- **`beispiel_kundenpaket.json`** is a white-label template, not story data: "Muster Bau GmbH", accent `#1d4ed8`, glossary "Freigabe → Quality Gate", mandate "Bis 250 TEUR".