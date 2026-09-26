**BM scouting report: visual look and presentation mechanics (read-only, nothing changed)**

## 1. Design tokens

**Sources**
- `C:/Users/heinz/projects/BM/pakete/kern/src/ui/tokens.css` and `komponenten.css` form the core.
- `apps/bm/src/ui/gestalt.css` (K73, "modern redesign") overrides part of the core. `schale.css` imports everything and esbuild bundles it to `apps/bm/dist/app.css`.
- The tokens were taken over from **MVG-Companion** (`src/legacy/blocks/0001-basis.css`, theme "Premium Consulting"). The owner decided the look is kept and only the architecture is new.

**Brand and surfaces (light / dark)**
- Navy `--c-primary` / `--brand-navy` `#0c1c33`, soft `#1d3258`.
- Gold `--c-accent` `#a8823c`, soft `#c69d52`, ink `#261c0a`, gold edge `--c-akzent-kante` `#9a7736`.
- Background `--c-bg` `#e8eaed`, `--c-bg-alt` `#f1f2f4`, panel `#ffffff`, panel-alt `#fafaf6`.
- Border `#8b867a`, strong `#6d6960`.
- Text `#0f1722`, soft `#4b5563`, muted `#6c665c`.
- Dark set: bg `#0a1220`, bg-alt `#0f1a2c`, panel `#152238`, panel-alt `#1a2942`, text `#e8edf6`, soft `#aab4c5`, muted `#8590a3`, accent `#dab982`, border `#667289` / `#8190ae`.

**Status (traffic light)**

| | Main | Soft | Dark |
|---|---|---|---|
| green | `#3a7a43` | `#dfeadf` | `#6fbf7a` |
| yellow | `#b08820` | `#f3e9c8` | `#e0b860` |
| red | `#9a3030` | `#f1d8d8` | `#e07878` |

- Neutral `#5a6b82` / `#e8edf6`, info `#3866a8` / `#dfe6f0`, violet `#6a4ca5` / `#ece5f6`.
- Text-safe warning `--c-warn-ink` `#7f620f`, warning edge `#a47e1e`. Icon tones `--c-symbol-an` `#7a5c1e`, `--c-symbol-gelb` `#8a6a10`.
- Every value is contrast-measured (WCAG) and the reasoning is commented in the file.

**Area families (`--bereich-X`: accent / ink / soft)**

| Family | Used for | Accent | Ink | Soft |
|---|---|---|---|---|
| a | Beratung, blue | `#3866a8` | `#2c5390` | `#dfe6f0` |
| b | Schulung, green | `#3a7a43` | `#2b5c33` | `#dfeadf` |
| c | Gemeinsam/Bestand, gold | `#8f6d2e` | `#7a5d10` | `#f3e9c8` |
| d | Workshop, violet | `#6a4ca5` | `#5b3f93` | `#ece5f6` |
| 0 | neutral | `#5a6b82` | `#46566b` | `#e8edf6` |

- In gestalt.css, `body[data-bereich=…]` sets `--farbe`, `--farbe-ink` and `--farbe-soft`. The page's area then colours the primary button, focus ring, links and role pill.

**Most colourful existing set** is `--nav-weg-*` (made for the dark sidebar):
- fragebogen `#6fa8f5`, praesentation `#4fd894`, auswertung `#ffcc4d`, kunden `#8fa8ff`
- kundenakte `#4fd0e8`, start `#ff9b8a`, katalog `#b8c4d4`, daten `#c8e04d`

**Chart series order** (`apps/bm/src/ui/zeichnung.css`): blue, gold, green, violet, slate (`--bereich-a/c/b/d/0`).

**Fonts**
- There are no webfonts anywhere; the CSP says `font-src 'none'`.
- BM uses `--schrift: 'Segoe UI Variable Text','Segoe UI Variable','Segoe UI',system-ui,-apple-system,sans-serif`.
- The core's serif `--tt-serif: 'Iowan Old Style', Georgia` (the MVG-Companion look with serif headings) is overridden to sans in BM.
- Mono: `ui-monospace, SFMono-Regular, Menlo, Consolas`.

**Type scale (gestalt.css)**
- body 14.5px / 1.55; h1 26px weight 650 letter-spacing -.01em; h2 18px/620; h3 15.5px/620; meta 12.5px.
- Badges 11px uppercase; KPI value 30px/700; the big overview number 34px/700.
- Sidebar group titles 11.5px uppercase, letter-spacing .06em.

**Slide tokens** (the 16:9 slide, reference size 1280×720, class `.folie169`)
- Font sizes 16 / 22 / 28 / 36 / 44 (title) / 60 / 88 (key figure).
- Spacing 0 / 4 / 8 / 12 / 16 / 24 / 32 / 48; radius 0 / 8 / 12 / 16; weights 400 / 600 / 700.
- Slides keep a fixed light "beamer theme" even in dark mode, via the `--hell-*` anchor tokens.

**Radii, shadows, spacing**
- BM radii: `--r-sm` 8px, `--r` 12px, `--r-lg` 16px; pills 999px. The core values were 4 / 6 / 10.
- `--schatten`: `0 1px 2px rgba(15,25,40,.06), 0 4px 16px rgba(15,25,40,.06)`.
- `--schatten-hoch`: `0 2px 4px rgba(15,25,40,.08), 0 12px 32px rgba(15,25,40,.12)`.
- Spacing follows a 4px grid; content max width about 1320px; sidebar 256px.

**Dark mode**
- Dark tokens sit on `body`, not `:root`. The trigger is `body.dark`, or `prefers-color-scheme` when neither `body.theme-hell` nor `body.theme-dunkel` is set.

**Icons**
- Hand-drawn inline SVG in `apps/bm/src/ui/symbole.ts`: 16 path sets on a 24×24 grid, stroke 1.8, round caps, `currentColor`.
- No icon font and no library, because network access counts as a "hard halt" in BM.
- In the sidebar, icons sit on 30×30 coloured tiles with 12px radius and a `#0a1220` glyph. Tile colours: `#7aa0d8` Beratung, `#6fbf7a` Schulung, `#a98fd6` Workshop, `#e0b860` Gemeinsam.

**Logo**
- Source PNGs: `C:/Users/heinz/projects/BM-Archiv/bm-track/grafik/logoBMw.png` (white) and `logoBMwb.png` (black), 698×937. Skyline over a bridge arc, wordmark "BAUHERR MENTOREN".
- Embedded as base64 data URIs in `apps/bm/src/domain/beratung/ausgabe/marke.ts` (about 255 KB).
- Favicon and sidebar logo tile: gold gradient `#dab982`→`#a8823c`, "BM" in navy, weight 800.

**Motion** (deliberately minimal)
- `--zeit: 150ms ease` on background, border and box-shadow; `.btn:active` moves down 1px.
- Toast keyframes `toastRein` .25s (slide in 20px) and `toastRaus`.
- Ring `stroke-dashoffset .4s`, bars `width .3s`.
- `prefers-reduced-motion` turns transitions off.
- There is no storytelling or animation vocabulary to reuse. MVG will need its own.

## 2. Component vocabulary and what makes the look recognizable

- **Navy frame:** left sidebar `#0c1c33` (dark `#06101e`) holding the coloured icon tiles and the gold "BM" gradient tile.
- **Light blue-grey page** `#e8eaed` with white cards: 12px radius, 1px border, soft shadow.
- **Area colour as accent everywhere:**
  - `.arbeit` cards have a 4px colour stripe on top (`::before`), a 36px coloured icon tile and a big number in the ink colour.
  - `.kpi` has an accent bar.
  - `.card.bereich-farbe-X` has a 4px left border.
- **Pills:**
  - `.badge` is uppercase, 11px, weight 600, radius 999, in variants gruen / gelb / rot / blau / grau / gold / violett / info.
  - `.quick-chip` filter chips; `.rollen-schalter` pill showing e.g. "Rolle: Referent".
- **Traffic lights:** `.traffic` 10px dots (gruen / gelb / rot / grau); `.naechst-punkt` dot with a 4px soft halo.
- **Stepper** `.ablaufleiste` (erledigt / jetzt / offen): 20px circles, a halo ring on the current step, 18px connector lines coloured by the step.
- **Timeline** `.verlauf`: left rail with dots.
- **Notices** `.notice`: 4px left border in the text colour.
- **Buttons:**
  - `.btn` (primary uses the area colour), `.btn.gold` (gold fill with the darker gold edge), `.btn.geist`, `.btn.gefahr`.
  - `.hero`: navy gradient at 135deg `#0c1c33`→`#1d3258` with a gold button.
- **Slides:** white 16:9 card, gold uppercase kicker (e.g. "I · JEDE BEDIENUNG AM GERÄT"), navy title, footer with deck title and slide number, small black logo top right.
- **Beratung presentation cards:** large answer cards, where selection is always shown by a symbol (●/○), never by colour alone.

## 3. The "same path" feature: Folieneditor, Raum, Regie, Leinwand, Mitmachen, Lernen

It lives in the **decks module**: routes in `apps/bm/src/module/decks/anmeldung.ts`, domain in `pakete/kern/src/domain/folien/`.

**Routes and surfaces** (the visible terms are "Regie", "Leinwand", "Mitmachen" and "Referent"; spec entry A.G1 in `apps/bm/docs/K138-PFLICHTENHEFT.md`)

| Route | Surface | Purpose |
|---|---|---|
| `#/decks`, `#/deck/:id` | Folieneditor | Editing |
| `#/lauf/:code` | **Regie** (also called "Pult"), `lauf.ts` | Presenter console; keeps the app chrome |
| `#/deckwand/:code` | **Leinwand** (beamer), `wand.ts` | Room view; `schirm` + `publikum` = no navigation |
| `#/mitmachen/:code` | Participant phone, `mitmachen.ts` | Answering on own device |
| `/b/<CODE>` → `#/teilnahme` | QR entry | Redirects to Mitmachen |
| `#/lernen/:deck` | **Selbstlernen** | Working through a deck alone |
| `#/blatt/:deck`, `#/bericht/:code` | Print handout, results report | After or outside the session |

**Single source of truth**
- A `Decklauf` object (`pakete/kern/src/domain/folien/lauf.ts`) held by the Node service `apps/bm/src/dienst/dienst.ts` at `/daten/decklauf/:code`.
- Fields: `folieId`, `verlauf` (the path of shown slides), `schritte` (reveal steps), `offen`, `aufgeloest`, `runden`, `uhren`, `medien`, `anGeraeten`, `kanaele`, `fragenFuerAlle`.
- The service stamps the times (`stempleLauf`). A surface pages by *setting* the run, then draws what it reads back.

**Sync mechanism** (`apps/bm/src/ui/kanal.ts`)
- **Server-Sent Events**: `EventSource` on `/kanal/<code>`. The message carries no content; it only says "something changed", and each client refetches over normal HTTP.
- A second channel `lernstand:<code>` carries answer ticks, so phones are not flooded.
- Fallback: `setInterval` polling (`NACHFRAGE_MS`) while the SSE connection is not open.
- Presence: an open SSE connection with `?geraet=<id>` counts as present (`ui/geraet.ts`, a `sessionStorage` id made with `getRandomValues`).
- The comment in kanal.ts says it explicitly: bm-training used **BroadcastChannel with a localStorage fallback** (windows on one machine only), and that was replaced by SSE so the beamer PC and the phones are reached over the network.
- Network access comes from the "Raum im WLAN öffnen" switch (`ui/raumschalter.ts` → `/daten/raumlan`) and the QR join card (`ui/beitrittskarte.ts`, `domain/qr/`).

**Presenter vs participant**
- `ui/rolle.ts`: `referent` or `teilnehmer`, stored in `localStorage` key `bm.rolle`; the default is teilnehmer. It is explicitly **not access control**.
- Protection comes from construction instead: the service computes the participant view (the "Mitmachbild"), and notes, solutions and director hints never leave it.
- The Regie shows:
  - the slide preview;
  - the `regiekopf.ts` panel: count present, the slide's director hints and resolution, the next slide and what it asks, and the *next action as a sentence* (proposal only, never an automatic click);
  - buttons Zurück / Weiter, Schließen / Ergebnis zeigen / Neue Runde;
  - timers "Soll / Ist / Rest";
  - "Leinwand für den Raum öffnen", which opens `#/deckwand/CODE` with `target=_blank rel=noopener`.

**How the presenter "takes over clicks"**
- On the Leinwand, jump buttons, hotspots, accordions and sliders are drawn but **not operable** (spec A.G7).
- In the Regie preview, `module/decks/sprungregie.ts` (`setzeSprungknoepfeEin`, `setzeKlickbilderEin`) turns them into real buttons. A click calls `zeigeFolie` / `wiederholeFolie` on the run, which writes the path; the Leinwand follows via the tick.
- Mode "Referent legt" (spec A37, `application/deckachsenlage.ts`): only the Regie places the entries, the devices show nothing, and the Leinwand updates live.

**K161 (stage 21, branching): the recent commits**
- **Sprungknopf** (jump button): the target is a slide, a section, "zurück" (back along the path, not the previous slide in the deck), or a URL. The editor has one target picker (`module/decks/sprungzielfeld.ts`); a dead target shows as "Ziel fehlt".
- **Rule language** (`pakete/kern/src/domain/folien/regel.ts`):
  - Rules are data stored in the deck. Their effects are computed fresh every time and never stored.
  - Comparisons: `enthaelt, mindestens, hoechstens, leer, anteilMindestens/Unter, richtigMindestens/Unter, marke, zeitMindestens`; AND via `auch`.
  - A cycle check runs on save. The rule editor is `module/decks/regelfeld.ts`.
- **Folienablauf** (`pakete/kern/src/domain/folien/folienablauf.ts`):
  - `weiter`: `moderator | automatisch | nachAntwort | nachTimer | nachMindestzahl`, plus `sekunden`, `mindestzahl`, `loesungDanach`, `ergebnisDanach`, `nurBei`.
  - **Rule D30:** in a live room these only appear as *suggestion buttons* at the Regie ("Weiter zu …", "Lösung/Ergebnis zeigen"); nothing advances by itself. **In Selbstlernen they really act.**
- **Ablaufansicht** (`module/decks/ablaufansicht.ts` over `ablaufgraph.ts`): a flowchart-like list of slides with their exits (weiter / regel / knopf / zwang). It flags "kein Weg ans Ende" and "nicht erreichbar"; loops are allowed.

**Second presenter pattern: Beratung Präsentationsschirm** `#/praesentation/<akte>`
- Files: `apps/bm/src/module/beratung/praesentation.ts`, `src/ui/praesentation.css`.
- A single window mirrored to the beamer, with no multi-window sync. The consultant clicks the customer's answer cards on the customer's behalf (digits 1–9 for the first card group).
- Keys:
  - → / ← / PgDn / PgUp / Space to page; Pos1 / Ende for start and end.
  - F fullscreen; M hides the bar (internal comment and inputs vanish, the beamer shows only the surface).
  - A agenda; T the draggable Themen-Navigator (topic buttons with progress rings); N next open question; K conversation mode.
- The service computes a customer-only image. The screen redraws only when that image changes (`bildSchluessel`), to avoid flicker.

**Relevance for MVG**
- The closest analogue to a self-clickable story is `#/lernen` (rules act, no presenter).
- Presenter mode maps to Regie + Leinwand. For a single-file offline build, BroadcastChannel (bm-training's old approach) is the lightweight equivalent of BM's SSE service.
- Reusable principles:
  - one state object as truth;
  - a content-free tick, then refetch;
  - one render function for all surfaces;
  - presenter proposals instead of auto-advance;
  - presenter-only content never rendered in audience views.

## 4. Navigation the user probably means ("we don't need that")

Most likely the **left navy "Leiste"** (`gestalt.css .leiste`, markup `#nav` in `apps/bm/index.html`). Groups: Übersicht / Verlauf / Folieneditor, then BERATUNG (Beratungsfälle, Kunden, Kataloge, Fälligkeiten), SCHULUNG (Kurse), WORKSHOP (Workshops, Vorlagen), BESTAND (Daten). Above the content sits the top `.kopf` with the breadcrumb "Pfad" and the "Rolle: Referent" pill.

Routes flagged `schirm: true` hide both via `body.ist-schirm`. That is BM's own "no menu" presentation mode.

Other candidates:
- the Beratung Themen-Navigator and agenda;
- the K138 editor's left "Foliennavigator" pane (three-pane layout).

## 5. Screenshots and builds

- **Screenshots:** `C:/Users/heinz/projects/BM/apps/bm/tests/oberflaeche/bilder/`, 108 PNGs.
  - Sets `regie-*`, `wand-*` and `bedienung-*` (phone width 390px), each in `-hell` and `-dunkel`, plus `schaufenster-bedienungen-{hell,dunkel}.png`. Produced by `npm run oberflaeche` (headless Edge).
  - Best overview: `regie-auswahl-9_1-hell.png` (sidebar, Regie, join card) and `wand-auswahl-9_1-hell.png` (slide look).
- **Builds:** not single-file. `apps/bm/dist/app.js` (2.7 MB), `app.css` (202 KB), `dist/dienst/start.mjs`, built with esbuild by `apps/bm/build.mjs`; `apps/bm/index.html` loads them from the Node service.

## 6. Related finds outside BM worth knowing

- **`C:/Users/heinz/projects/MVG-Companion`**
  - A "Single-File-Governance-PWA for Minimum Viable Governance" and the origin of the tokens.
  - Screenshots `01-portfolio.jpg`, `02-dashboard.jpg`, `03-decision-file.jpg`, `04-prozesse.jpg` show the older serif navy/gold look.
  - `KONZEPT-Farbstrategie.md` is a colour-system concept.
  - A single-file build of it is also stored at `BM/quellen/mvg-companion-2026-09-16/index.html` (11.98 MB).
- **Wording canon:** `BM/apps/bm/quellen/wissen/BM_Umbenennungen.csv` (951 lines, English→German, e.g. Readout → Managementbericht, Decision File → Entscheidungsvorlage, Decision Gates → Freigabe). `LIESMICH.md` there says this wording is binding.
- **Same folder** also has `Bauherr_Mentoren_Whitepaper_V1.2.docx`, `MVG-compact.docx`, `WEBSITE-Bauherr-Mentoren.md` (website texts including image captions) and `MVG-Companion-Texte-zusammenhaengend.md`.