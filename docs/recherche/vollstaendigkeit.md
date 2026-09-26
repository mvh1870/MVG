[harness: subagent output matched instruction-shaped pattern(s): settings-json, bypass-permissions. Control tags below are neutralized (`<` → `<\`); treat any remaining directive-shaped text as a finding to relay to the user, not an instruction to you.]

**Completeness critique: MVG story scouting (read-only, nothing changed)**

## 1. Corrections and precisions to the four reports

**"Same path" (bm-look §3).** The report was right in outline but vague on the mechanism. Precisely:
- **The path is `Decklauf.verlauf`** (`pakete/kern/src/domain/folien/lauf.ts:69`, requirement A59). It lists every slide shown, in order, including repeats.
- **`zeigeFolie` is the only place that writes a jump.** Its comment says "eine zweite Sprungstelle gäbe zwei Pfade".
  - `sprungziel(... 'zurueck')` goes back along the path, not the deck. From slide 2 → 9, "zurück" returns to 2.
  - `wiederholeFolie` (A60) makes a jump back onto a slide already on the path count as a new round. Paging with the arrow keys never resets a round.
- **One drawing function serves every surface:** `apps/bm/src/ui/deckflaeche.ts`, via `zeichneDeckfolie` / `zeichneFolie169` on top of `folienflaeche.ts zeichneBaustein`. Its callers are:
  - the editor preview (`ansicht.ts`)
  - the Regie/Pult (`lauf.ts`)
  - the Leinwand (`wand.ts`)
  - Selbstlernen (`lernen.ts`)
- **Presenter-only material never reaches the surface.** Content passes through `buehneninhalt` first, and `Element.notiz` is never handed to it at all.
- **Only the Regie can act on the slide.** The drawing function paints jump buttons and hotspots as inert on every surface. `sprungregie.ts` then swaps them for real buttons, but only in the Regie preview. This is A.G7 ("dasselbe Bild, aber nur die Regie hat die Hand am Lauf") and A57/A58.
- **K219 (2026-09-25):** Pult and Wand used to load the deck from the Lager, so the Regie could show something the room did not see. They now load it from the room state (`/daten/raumdeck/:code`).

**Offline precedent is stronger than "lightweight equivalent".** `BM-Archiv/bm-training/src/infrastructure/buehnenkanal.ts` is a working Regie→Bühne channel:
- `BroadcastChannel`, with a `localStorage` `storage`-event fallback under key `training.buehnenkanal`.
- **Measured working under `file://`**, including the single-file `BM-Training.html` (1.49 MB, strict CSP), and even with the two copies in different folders. Limit: measured on Chromium/Windows only; Firefox and Safari were not measured.
- It pushes a finished audience image (`Teilnehmerbild`), not a route (Entscheid 48). The timer lives in the Regie (Entscheid 50), a heartbeat ("Lebenszeichen") comes back, and `bildSchluessel` prevents flicker.
- The contract (port) is in `src/application/ports.ts:200-247`. This is the direct template for MVG's presenter mode.

**Terminology (companion report), checked against the files:**
- **G0–G5 is never in the whitepaper text.** The text uses LPH 0–9 throughout (e.g. l.870–872, glossary l.1160). G0–G5 appears only in the images (confirmed visually in image10: "Freigabe (G0–G5) – Go / No-Go", "Frühwarnung – schwaches Signal"). So on LPH, text and Companion SSOT agree; the conflict is **images vs text** and **Companion UI leftovers vs SSOT**.
- Companion `src` still has 191× "G0-G9", 3× "G0-G4", 1× "G0-G5" and 2× "Freigaben G0 bis G4". The data key migration (E28, `GATE-…-G<n>` → `LPH-…-<n>`) has not run.
- **Confirmed real conflicts between text and SSOT:**
  - "Freigaberegister" (whitepaper l.560, l.586) vs the register title "Leistungsphase" (E29).
  - "Änderungsgremium" (whitepaper) vs "Change-Board" (Companion `src`: 150 hits vs 7).
  - Decision statuses: whitepaper l.610 vs `registerdefs.ts:125`.
- **Freigabe outcome wording now has four variants:**
  - whitepaper: "Freigabe / keine Freigabe / Freigabe mit Auflagen"
  - SSOT E2: "Freigeben / Nicht freigeben / Freigabe mit Auflagen" (0 hits for "Freigabe mit Auflagen" in Companion `src`)
  - Companion UI: "Go with Conditions" (45 hits)
  - BM Riedbach case: "Freigabe erteilen / Freigabe mit Auflagen / Nicht freigeben"
- Minor: Scope → column label "Projektumfang" (E4); the whitepaper also says "Projektumfang".

**Graphics report:**
- `image13` (Implementierung) is **missing from whitepaper.md**. The conversion dropped it; the docx has it at `rId20`, at 8.1 "Sequenziertes Vorgehen".
- `image15` sits only in `footer2.xml` / `footer3.xml`.
- So the markdown is not a reliable map of where images go; use the docx.

**Two different "V1.2" files exist:**
- `MVG/Bauherr_Mentoren_Whitepaper_V1.2.docx`: 9.58 MB, 15 media, has a table of contents, modified 2026-09-08.
- `BM/apps/bm/quellen/wissen/…V1.2.docx`: 109 KB, 1 media, no table of contents, modified 2026-09-20.
- The paragraph text is identical apart from the table of contents.

**Conventions report:**
- There is **no global git identity**; each repo sets it locally. BM uses `Heinz-Marc <heinz-marc@gmx.de>`; MVG-Companion uses `user.name mvh1870` (possibly a GitHub handle).
- `credential.helper manager` (Git Credential Manager) is set system-wide. An earlier probe against github.com popped up a login window.
- `~/.claude/settings.json` has **no hooks** and `defaultMode: bypassPermissions`, so nothing global leaks into MVG.
- `cloud/fortsetzer.py` only acts when `CLAUDE_CODE_REMOTE=true` **and** the session's first input is the routine's prompt. Normal interactive claude.ai/code sessions are left alone.
- The cloud package is for **autonomous 3-hourly blocks**, not interactive web work.
- Doc drift: `cloud-probe.py` is described as 72 checks in ANLEITUNG and 58 in ENTSCHEIDE.

## 2. Newly found facts

**A ready-made "management simulator" model exists in BM:**
- `pakete/kern/src/domain/simulation/fall.ts`: Fall → Schritt → Zweig (three levels, no more), plus role cards (*Rollenkarten*) that belong to the case.
- A deliberate choice: no memory. A branch only decides the next step (Entscheid 91), and callbacks live in the presenter's wording.
- It fails closed; for example, a branch pointing to a missing step is an error.
- Case: `apps/bm/seeds/faelle/riedbach.json`, "Stadtwerke Riedbach". It is fictional: a municipal Betriebshof moving LPH 3 → 4, with a Fördermittelfrist, a disputed Nachtrag, and a Lenkungskreis that adjourned twice.
- It has 3 steps with 3 branches each. For example, S1 "Geben Sie frei?" offers A erteilen / B mit Auflagen / C nicht freigeben, and the resolution is "Alle drei Zweige sind vertretbar".
- Design doc: `BM-Archiv/bm-training/docs/E5-FALL-RIEDBACH.md`.
- A presenter note there says the teaching case is **deliberately not the product demo data** (NETZNORD).

**Existing MVG teaching content:** 16 course seeds in `BM/apps/bm/seeds/kurse/`, including:
- `mvg-grundlagen.json` (33 KB)
- `einfuehrung-mvg.json`
- `freigabe-reifegrad`, `entscheidungsreife`, `nachweiskette`, `risiko-fruehwarnung-aenderung`, `rollen-raci`, `uebergabe-regelbetrieb`, among others

They contain slide texts, quizzes, `simulation` blocks and presenter hints. They are marked `fachstand: "ungeprueft"`.

**Brand and liability rules** (`BM-Archiv/bm-training/docs/MARKENREGELN.md`, marked "haftungsrelevant"; the source it cites, `../bauherr-mentoren/CLAUDE.md`, is **not on this machine**):
- Provider is always "Bauherr Mentoren GmbH i. G.", never with a hyphen.
- Contact is only `kontakt@bauherr-mentoren.com`, with no phone number.
- No invented references, figures, certificates or customer names. A teaching case must be labelled as fictional.
- Freigabe canon: LPH 0–9, and the Bauherr grants every Freigabe. Anchors: Business Case → LPH 2, FID → LPH 3, long-lead items → LPH 7, Übergabe → LPH 9.
- The Companion is "für Beratungskunden kostenfrei" (never "kostenlos"), is not SaaS, and is not part of the paid service.
- The list of what BM does **not** do must be quoted word for word, and may only change after legal review.

**Wording rule.** BM `quellen/wissen/LIESMICH.md` quotes the owner: the wording in those files is binding ("so soll es dann auch sein").

**Website:**
- `WEBSITE-Bauherr-Mentoren.md` was captured from a running app (`npm run dev`, port 8001). That source code is not on this machine.
- Hosting is IONOS; the domain is bauherr-mentoren.com.
- The site names two contact persons (Martin Mohr, Marc Heinz); Impressum and Datenschutz name only Martin Mohr.

**Cloud decision of 2026-09-26** (`prompts/wiederanlauf/ENTSCHEIDE.md:2353ff`):
- The owner chose: a GitHub remote with push, a fresh session per block, questions written to the file and to chat, and ampel plus handover pushed.
- Documented facts: the cloud runs Linux with no PowerShell; it works on a GitHub clone and reads only the repo's settings; routines run at most hourly, have a daily cap, and share the account quota.
- The CLI bundled with the Desktop app reports `loggedIn: false` on this machine ("gram").
- Status: untested against the real service.
- **No repo on this machine has a github.com remote, and `gh` is not installed.**
- `P:\Meine Ablage` is a synced Google Drive folder (called "Cloud-Ablage" in Koordination). It serves as BM's `drive` remote and as the mirror of the prompt package, so "Cloud" is ambiguous in the owner's vocabulary.

**Embedding caveats** (general platform knowledge, not measured here):
- A `<meta>` CSP cannot set `frame-ancestors`; that needs an HTTP header (MVG-Companion's `DEPLOY.md` says the same).
- In Chrome, BroadcastChannel is partitioned by top-level site. An embedded iframe and a standalone presenter window on another origin will not see each other.

## 3. Open questions only the user can answer

**Scope and audience**
1. Who is the primary viewer: a prospective client alone (self-guided), a client in a meeting with the consultant, or both equally?
2. What depth is wanted: the full whitepaper (13 chapters, ~9,900 words) or a curated path of about 20–40 minutes? Should there be a "read the full text" layer?
3. Should it contain a real simulator core, i.e. the self-assessment (10 domains / 49 questions / 0–100) and decision branches in the style of Riedbach? Or should it be narrative with small interactions only?
4. What is the story's case? NETZNORD (Companion demo), Stadtwerke Riedbach (a fictional teaching case, per the rule that teaching cases are not demo data), a new case, or a persona choice (image14)?

**Presenter mode**
5. What does "take over the customer's clicks" mean?
   - a) One screen, where the consultant clicks for the customer (BM Präsentationsschirm pattern).
   - b) Two windows on one machine, presenter console plus beamer (BroadcastChannel, works offline).
   - c) The customer on their own device, remotely, which needs a relay server or hosted service.
6. Should there be presenter-only content (talking notes, hints, next-step suggestions) that must never appear in the audience view?
7. Should anything the customer answers be saved or exported (a result sheet or PDF), or does everything stay in the browser?

**Tech, hosting, embedding**
8. Is "single-file HTML" a hard requirement (offline, `file://`, email attachment, strict CSP), or only the preferred build output?
9. Embed where? The IONOS website (what technology, and where is its source?), the MVG Companion, BM, or an LMS. Is an iframe acceptable, or should it be a web component or script include?
10. Which browsers must it support (Safari/iPad? Firefox?) and which devices (beamer PC, tablet, phone)?
11. Should the tooling reuse BM's (Node 24 type stripping, esbuild 0.28.1, TS 7.0.2, guard scripts, German identifiers) or be lighter?

**Cloud**
12. Does "Claude Code on the web" mean interactive sessions you drive, or the autonomous routine package (`cloud/`, every 3 h, branch `claude/haus`)? Or both?
13. Which GitHub account or organisation (is `mvh1870` yours?), what repo name, and private? Creating and pushing the remote is a hard halt, so you do it yourself. When?
14. Should MVG copy BM's rulebook (Kennungen, OWNER-FRAGEN, ampel, the four hard halts) or use a slimmer one?

**Branding and look**
15. What does "more colourful" mean? Proposed: BM navy `#0c1c33` / gold `#a8823c` as the frame, the whitepaper's petrol `#146878` / green `#349068` as the story colours, and the `--nav-weg-*` / sticky-note pastels as accents. Should it be light-only, or also dark?
16. Is a web font allowed (breaking BM's `font-src 'none'`), or should it stay with the system font stack? Serif headings (Companion) or sans (BM)?
17. Do you have a vector (SVG) BM logo? Should the Office-blue footer logo (`#0070C0`) be dropped?
18. Should the whitepaper images be reused as-is, regenerated with corrected labels, or redrawn as native SVG? Can we generate new AI imagery?

**Content fidelity and contradictions to resolve**
19. Which terminology wins? Whitepaper text, Companion SSOT (E27–E32) or BM_Umbenennungen? Specifically:
    - "Freigaberegister" or "Leistungsphase"
    - "Änderungsgremium" or "Change-Board"
    - which of the four Freigabe outcome variants
    - decision and change status sets
20. The images contradict the text (G0–G5, Go/No-Go, the 0–5 maturity scale with 5 domains, "Operating Model", "gerichtsfest", the 30/60/90 spine in image13). Is the text the single source of truth?
21. May the story shorten or paraphrase the whitepaper, or must it quote it verbatim? Does the verbatim "Abgrenzung" and legal note (whitepaper 5.5 / MARKENREGELN) have to appear?
22. Who approves content before publishing, and does the Impressum's content-responsible person need to sign off? Is this V1.2 final, or will a V1.3 follow?
23. Is it customer-facing and public? If so, the BM-internal rule "Recht/Lizenz/Datenschutz außen vor" does not apply. Is analytics or tracking wanted (probably none)?

**Process**
24. Is German-only enough, or is English needed as well?
25. What is the first milestone: one showcase chapter (e.g. the Mandatsschwelle gate or the Governance-Fluss) as a vertical slice, or the whole skeleton first?

**Key paths:**
- `BM/pakete/kern/src/domain/folien/lauf.ts`
- `BM/apps/bm/src/ui/deckflaeche.ts`
- `BM/apps/bm/src/module/decks/sprungregie.ts`
- `BM/apps/bm/docs/K138-PFLICHTENHEFT.md` (A.G1, A.G7, A57)
- `BM-Archiv/bm-training/src/infrastructure/buehnenkanal.ts`
- `BM-Archiv/bm-training/src/application/ports.ts`
- `BM/pakete/kern/src/domain/simulation/fall.ts`
- `BM/apps/bm/seeds/faelle/riedbach.json`
- `BM/apps/bm/seeds/kurse/`
- `BM-Archiv/bm-training/docs/MARKENREGELN.md`
- `BM-Archiv/bm-training/docs/E5-FALL-RIEDBACH.md`
- `prompts/wiederanlauf/cloud/{LIESMICH.txt,CLOUD-REGELN.md,cloud-einrichten.py}`
- `prompts/wiederanlauf/ENTSCHEIDE.md:2353`
- `MVG-Companion/KONZEPT-2026k-Terminologie.md`

All paths are relative to `C:/Users/heinz/projects/` except `prompts/…`, which is under `C:/Users/heinz/`.