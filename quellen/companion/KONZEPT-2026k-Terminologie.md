# KONZEPT 2026k — „Deutsche Terminologie"

**SSOT dieses Programms.** Wahrheit über Zuschnitt, Entscheide, Zuordnungstabelle und
Bündelstand. Fachlich entscheidet der Owner-Auftrag; handwerklich entscheiden
`CLAUDE.md` und dieses Dokument (16 Gates, Release-Ritual, adversarialer Review,
Negativproben-Sammellauf).

Angelegt 2026-08-23. Modus **VOLLAUTOMATISCH** (Owner-MC, Runde 2 Frage 4).

---

## §0 Auftrag

Die deutschsprachige Fassung von MVG Companion und der Website *Bauherr Mentoren*
verliert ihre unnötigen Anglizismen. Fachliche Aussagen, Rollen, Schwellen,
Statuslogiken, Prozesse, Zahlen und Zusammenhänge bleiben unverändert. Die
**englische Fassung bleibt wortgleich wie sie ist** — sie wird nicht neu übersetzt,
sondern nur an die geänderten Schlüssel angehängt (siehe §4).

---

## §1 Die Entscheide (Owner-MC, seit 2026-08-23)

Die ersten achtzehn wurden in sechs Runden Multiple-Choice gefällt, bevor eine Zeile
gebaut wurde; seither sind Runde 7 (E27–E31, 2026-08-23) und **E32** (2026-08-24) dazugekommen.
Sie sind bindend; eine Abweichung braucht einen neuen Owner-MC. ⚠ Die Überschrift trug bis
2026-08-24 die feste Zahl „achtzehn" und war damit ab Runde 7 falsch — **eine Zahl in der
Prosa veraltet mit den Daten**; maßgeblich ist die Tabelle, nicht ihr Kopf.

| Nr | Gegenstand | Entscheid |
|---|---|---|
| **E1** | Geltungsbereich | **App + Website.** MVG Companion vollständig; Website bauherr-mentoren: Quellen ändern **und** Auslieferungspaket bauen, Veröffentlichung bleibt beim Owner. Repo-Doku und Änderungshistorie bleiben unangetastet. |
| **E2** | Gespeicherte Fachwerte | **Nur Anzeige.** `gates[].decision` bleibt gespeichert `Go` / `No-Go` / `Go with Conditions`; angezeigt wird *Freigeben* / *Nicht freigeben* / *Freigabe mit Auflagen*. Entspricht der Hausregel P1c (werterhaltend). |
| **E3** | Navigation vs. Register | **Nav kurz, sonst Registerform.** Linke Navigation exakt nach Auftrag Regel 2; Seitenüberschrift, Fließtext, Hilfe, Glossar und Ausgaben verwenden die Registerform. |
| **E4** | Owner / Scope / Audit Trail | **Kontextabhängig.** Spalten und Nav kurz (*Verantwortlich*, *Projektumfang*, *Nachweiskette*), Fließtext ausführlich (*verantwortliche Rolle*, *Projekt-/Leistungsumfang*). |
| **E5** | Textkörper | **Alle vier:** Demo-Datenstand · Hilfe/FAQ/Glossar/Kurzinfos · Scout-Fragenkatalog · Druck-, Word- und MD-Ausgaben. |
| **E6** | Altbegriffe | **Vollständig entfernen**, auch im Glossar. Kein englischer Altbegriff bleibt sichtbar. |
| **E7** | „Gate" | **Vollständig tilgen**, auch bei konkretem Bezug: *Freigabepunkt P3*. |
| **E8** | Ablauf | **Vollautomatisch ohne Halt.** Bericht am Ende. |
| **E9** | Phase ↔ Leistungsphase | Nav heißt **„Phase"**; im Text scharf getrennt: *Leistungsphase 3 (LPH 3)* = Zeitraum, *Freigabepunkt P3* = Entscheidung. |
| **E10** | Entscheidung ↔ Entscheidungsvorlage | Nav bleibt **„Entscheidung"**; die Spalte im Freigabepunkt wird **„Freigabeentscheidung"**. |
| **E11** | Über die Liste hinaus | **Streng nur die Liste.** Portfolio, Dashboard, Charter, Board, Baseline, Compliance, Print-Center, Workspaces, Hub bleiben. |
| **E12** | Website-Tiefe | **Quellen ändern + Auslieferungspaket bauen.** Kein Go-Live. |
| **E13** | Freigabepunkt-Kennung | **Echte Migration** `G0–G9 → P0–P9`, Datenschlüssel wandern mit. |
| **E14** | „und vergleichbar" | **Alle drei Ebenen:** Freigabepunkt-Kennung, Präfix `GATE- → PHASE-`, Eintragskürzel. |
| **E15** | Technische Bezeichner | **Unangetastet.** Feldnamen, Ansichtskennungen, Rechte, CSS-Klassen, Dateiformate, Schnittstellen. |
| **E16** | Ausgabedateinamen | **Eindeutschen.** Dateiendungen und `.mvgc`/`.mvgt`/`.mvgs` bleiben. |
| **E17** | Eintragskürzel | **Echt migrieren**, wie die Freigabepunkte. |
| **E18** | Nachweiskette | **Mitmigrieren** — mit datierter Hinweiszeile im Ansichtskopf (§6). |
| **E19** | Präfix-Umfang | **Alle**, auch der Formatvertrag `ROLE-`/`THR-`/`CLT-`. |
| **E20** | Zielkürzel | **Dreistellig** (§3). |
| **E21** | Altstände | **Automatisch beim Öffnen, mit Sicherung unmittelbar davor.** |
| **E22** | Auffindbarkeit | **Altkennung findet den Eintrag** — unsichtbar, rein für Unterlagen im Umlauf. |
| **E23** | Kundenpaket-Prüfer | **Nur die neue Form.** Kein Doppel-Annehmen. |
| **E24** | `ROLE-MENTOR` | **Ausnahme, bleibt unverändert.** Betreiberkennung mit Rechte-Bypass und PIN-Gate. |
| **E25** | Formatvertrag-Zielformen | `ROLE→ROL`, `THR→SWL`, `CLT→KVL`. |
| **E26** | Bilder | Bildschirmfotos neu aufnehmen, wo automatisch möglich; gezeichnete Grafiken auflisten. |

### ⚠⚠ RUNDE 7 — Owner-MC 2026-08-23 (nach R894-Zwischenstand): DIE LEISTUNGSPHASE

Der Owner hat den Zuschnitt nach dem B1-Zwischenstand **revidiert**. Die Entscheide
**E7, E9, E13, E14 und E20 sind damit überholt**; sie bleiben oben stehen, damit die
Umkehr auffindbar bleibt, gelten aber in der Fassung E27–E31.

**Der Auftrag im Wortlaut:** *„Ich will, dass Phase und Gate überall in Leistungsphase
umbenannt wird und in dem Zusammenhang G oder P zu LPH."* — auf Rückfrage präzisiert:
*„Gate müsste zu Freigabe werden."*

| Nr | Gegenstand | Entscheid |
|---|---|---|
| **E27** | Grundzuordnung | **Zeitraum = Leistungsphase (Kennung LPH), Entscheidungstor = Freigabe.** Ersetzt E7 (*Freigabepunkt*) und E9 (*Trennung Leistungsphase/Freigabepunkt*). Lesart: „Freigabe LPH 3" = die Freigabe der Leistungsphase 3. ⚠ Die Präzisierung ist nicht kosmetisch: gemessen hätte die wörtliche Fassung „Gate → Leistungsphase" **44 Sätze tautologisch** („1 Gate schließt 1 LPH" → „1 Leistungsphase schließt 1 Leistungsphase") und **233 grammatisch falsch** gemacht („1 Woche vor Gate" → „1 Woche vor Leistungsphase"). Mit „Freigabe" lösen sich beide Klassen auf. |
| **E28** | Kennungs-Umfang | **Voller Schnitt — auch die Datenschlüssel.** `G0–G9 → LPH 0–9` in der Anzeige **und** `GATE-<KURZ>-G<n> → LPH-<KURZ>-<n>` im Datenmodell. Ersetzt E13/E14/E20 (`G→P`, `GATE-→PHASE-`, dreistellig). Betroffen: 700 Code-Fundstellen, 281 Demo-Datensätze, 10 Fixtures, **16 Verkettungsklassen**. ⚠ Unumkehrbar und verkettet — eigenes Bündel, eigene Vorabmessung, eigener Review (S3-Muster). **Auflage:** der Parser `/G(\d+)\b/` (`0003:3255` + byte-gleiche Kopie `src/core/wordartefakte.ts:381`) ist **heute schon falsch** (`GATE-BAUG3-G7` → `G3`, der Projektkurzname gewinnt) und muss im selben Schnitt verankert werden. |
| **E29** | Registertitel | **„Leistungsphase"** — nicht „Leistungsphasenregister". Bewusste Abweichung von der Registerform (E3) für diesen einen Fall; der Owner hat die Kurzform ausdrücklich eingetragen. Nav **und** Seitenüberschrift lauten „Leistungsphase". ⚠⚠ **ZWEITER Geschlechtswechsel an derselben Stelle:** B1 stellte gerade *der* Gate-Katalog (m) → *das* Phasenregister (n) um; jetzt wird daraus *die* Leistungsphase (f). Die B1-Vorfeld-Regeln sind damit nicht anzupassen, sondern **neu zu fassen** — eine mechanische Nachführung erzeugte „das Leistungsphase". |
| **E30** | Kundenpaket-Phasenmodell | **Nur die Musterwerte.** `"P0 Bedarf" … "P9 Betrieb"` werden im mitgelieferten Muster (`beispiel_kundenpaket.json` + `__BM_KND_MUSTER`) auf den LPH-Kanon gezogen; **bereits ausgelieferte Kundenpakete bleiben unangetastet** und öffnen weiter. Das Feld dient der freien Kundenbenennung — sein Zweck darf nicht angetastet werden. ⚠ `_check_customer.js:393-399` prüft nur die Struktur („maximal 12 Phasen"), die **Werte sind unbewacht** — die Umstellung braucht dort einen eigenen Beleg. |
| **E31** | Companion-Einführungsphasen | **„Etappe".** Die 30 Stellen `Phase 1 · Aufsetzen (Tag 1)` u. ä. werden zu `Etappe 1 · …`. Grund: R580 hat diese Phasen ausdrücklich **vom Gate-System entkoppelt**; nach der Umbenennung stünden sie sonst unmittelbar neben „LPH 1 Grundlagenermittlung". Die Entkopplung wird damit auch sprachlich durchgehalten. |
| **E32** | `Artefakt` → Zielform | **Owner-MC 2026-08-24, Option C: die Zielform wird PRÄZISIERT.** Der Auftrag lautete wörtlich *„nenne überall Artefakte in Register um"*; die Vorabmessung zeigte, dass `Register` im Haus **bereits vergeben** ist — es bezeichnet die geführten Datenlisten (`REGISTER_DEFS`, **3.902** Fundstellen), während `Artefakt` die **erzeugten Dokumente** meint (`artifactType` = charter/readout/handover/decisionFile; **1.497** Fundstellen, **935** ersetzbar). **79 Zeilen tragen beide Begriffe**, die App stellt sie selbst nebeneinander (*„Artefakte und Register einsatzfähig machen"*) ⇒ ein wortgetreuer Lauf schriebe *„Register und Register"*. Zielform ist darum **`Registerdokument`** — sie trägt den vom Owner gewollten Begriff *Register* und bleibt vom Datenregister unterscheidbar. ⚠ **Auflagen für den Zuschnitt (B2c):** (a) die genaue Wortwahl je KOMPOSITUM ist beim Zuschnitt gegen die Grammatik zu prüfen — `Registerdokument` ist lang, für Zusammensetzungen wie `Artefakt-Katalog`/`Artefakt-Explorer` kann eine kürzere Fügung richtiger sein (§6.6 Grammatikprobe, P2-Kompositumregel); (b) die **79 Kollisionszeilen** sind einzeln durchzusehen, nicht per Wortregel; (c) `wordartefakte.ts`, `artifactType` und `artefaktKatalog` sind Bezeichner bzw. Datenschlüssel und fallen unter die Kennungs-Politik, nicht unter den Textschnitt. **Präzedenz:** in R894 verhinderte eine gleichartige Owner-Präzisierung (Runde 7) **gemessen 277 Fehlstellen**. |
| **E33** | B2b-Zuschnitt + Zielform `Handover` | **Selbst gefällt 2026-08-24 (Auto-Commit-Dauerregel, CLAUDE.md 7), zwei Teile.** ⓐ **ZUSCHNITT.** Die Pflicht-Vorabmessung widerlegte die §5-Schätzung „~1.400 Stellen" zum achten Mal in diesem Programm: gemessen sind **4.244** ersetzbare Stellen über 69 Begriffe (`_b2b_inventar.js`), davon **255 Datenschlüssel** und **432 Wörterbuch-Schlüssel** (`_b2b_gefahr.js`). Ein Lauf dieser Größe wäre in seinen Nachzügen nicht mehr zuzuordnen — genau die Begründung, aus der B2b überhaupt von B2 getrennt wurde. Der gerechnete Zuschnitt (`_b2b_zuschnitt.js`) teilt nach drei **gemessenen** Merkmalen — Zweideutigkeit · Datenschlüssel-Anteil · Menge — in **B2b-1 KERN** (13 Begriffe / 1.433) · **B2b-2 RESTMENGE** (23 / 280) · **B2b-3 SONDERFÄLLE** (33 / 2.531). ⚠ Der KERN trifft die alte Schätzung fast exakt; unterschätzt waren die Sonderfälle, die knapp 60 % der Menge stellen. R897 nimmt daraus die **Familie `Handover` + `Runbook`** (B2b-1a): `Handover-Runbook` koppelt beide mit 52 Stellen untrennbar, ein Schnitt über nur einen erzeugte `Übergabe-Runbook`. Reihenfolge nach der User-Dauerregel „schwer nach leicht" — `Handover` ist mit 284 Stellen, Geschlechtswechsel und 33 Zusammensetzungen der schwerste Einzelbegriff des KERN. ⓑ **ZIELFORM.** Dieselbe Lage wie bei `Register` in E32, diesmal von der Messung **vor** dem Lauf gefunden: `Übergabe` ist im Haus bereits der Name der LPH 9 und Bestandteil von `Übergabe-Checkliste`; `_b2b_kollision.js` misst **29 Zeilen** mit beiden Begriffen, der Bestand stellt sie durchgehend nebeneinander (`{term:"Handover", def:"Übergabe an Regelbetrieb…"}`). **Entschieden wurde dennoch für `Übergabe`** (SSOT §2.3), gegen die Ausweichform `Betriebsübergabe`, aus drei gemessenen Gründen: (1) `Betriebsübergabe-Betriebshandbuch` wäre doppeltes „Betrieb" auf 32 Zeichen — die P2-Klasse „unlesbare Länge" aus R896, und zwar an der häufigsten Zusammensetzung; (2) die Kollisionen sind heute eine **Redundanz**, keine Unterscheidung (englischer Titel, deutsche Erklärung) — sie aufzulösen ist ein Gewinn; (3) die App führt `Handover` bereits **selbst als englische Fassung** von `Übergabe` (`"5 · Übergabe":"5 · Handover"` in `0857-bm-v860-i18n-en-docs`), eine dritte deutsche Form wäre ein neuer Begriff. Die 29 Kollisionen sind einzeln von Hand entschieden (`_b2b_hand.js`), nie per Wortregel. |

### Selbst gefällte Folge-Entscheide zu Runde 7 (Auto-Commit-Dauerregel, begründet)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **S6** | Reichweite bleibt bei E15 | Technische Bezeichner (`gateId`, View-Key `gates`, Rechte `approveGate`, CSS-Klassen, Dateiformat-Schlüssel) bleiben **unangetastet**. „Überall" im Owner-Auftrag meint den sichtbaren Text und die Kennungen — E15 ist bereits per MC gefällt und wird durch E27–E31 nicht berührt. Ein Voll-Rename träfe **≈ 4.120** Fundstellen und 402 Prüfvektor-Zeilen, ohne dass ein Nutzer etwas davon sieht. ⚠ **18 Grenzfälle** (Bezeichner und Sichttext in derselben Zeile, z. B. `registerdefs.ts:126 {key:'gateRef', label:'Gate'}`) brauchen je eine Einzelentscheidung beim Bau und sind in §5 als eigene Liste geführt. |
| **S7** | LPH 0 bleibt, Spanne 0–9 | Der 10er-Kanon ist per Owner-MC (R605) gesetzt und **siebenfach im Code verankert**; ein Rückbau auf 1–9 bräche das 1:1-Mapping und die Migration R605. Die drei Stellen, die „LPH 0–8" behaupten (`0134:28`, `0234:5`, EN-Spiegel `0858:8`), sind Restbestand der 5-Gate-Ära und werden auf 0–9 gezogen. ⚠ **Eine sachliche Unwahrheit wird berichtigt:** `0003-basis.js:1302` behauptet „Leistungsphase 0 (Bedarfsplanung) **nach HOAI**" — die HOAI kennt LPH 1–9; Bedarfsplanung ist DIN 18205. Der Satz wird auf „(Bedarfsplanung, DIN 18205 — der HOAI vorgelagert)" korrigiert. Keine Stelle im Bestand relativiert das heute. |
| **S8** | Widersprechende Mappings | Die **Branchentabelle** `0014-basis.js:367` (sichtbarer Kundentext) führt ein drittes, nicht-1:1-Mapping (`G1 → LPH1–2`, `G3 → LPH4–7`) und würde nach der Umbenennung „Leistungsphase 1 → LPH 1–2" behaupten — ein offener Selbstwiderspruch auf einer Hilfeseite. Sie wird auf den 10er-Kanon gezogen, ebenso ihr EN-Spiegel `0857:12`. Die veralteten Kopfkommentare `0337:3-4` / `0342:4` werden berichtigt; `0838:9-13 OLD_DEFAULTS` bleibt als **Migrationsquelle** unangetastet und wird als historisch gekennzeichnet. |
| **S9** | Reihenfolge | **S2 gilt fort: Text vor Kennungen** — und zwar jetzt gegen die allgemeine Hausregel „schwer nach leicht". Begründung aus der Messung, nicht aus Bequemlichkeit: die Kennungsmigration (E28) ist der **einzige nicht umkehrbare** Schritt, und die Kennungs-**Anzeige** (1.157 Stellen) ist von ihr funktional abhängig — fünf Parse-Stellen lesen die Kennung aus dem **sichtbaren** Namen (`0003:2675/4591`, `0337:40`, `0342:26`, `0812:45`), `0930:44` schneidet sie umgekehrt ab. Ein Kennungsschnitt vor der Textstufe müsste dieselbe Kopplung zweimal auflösen. |
| **S10** | Werkzeugstand | `_terminologie/_kennungen.js` misst gegen das **verworfene** Ziel (`:80-87` meldet `G0-G9 → P0-P9`, `:55/63` führt `ZIEL={GATE:'PHASE',…}`) und ist vor dem Kennungsbündel auf E28 umzustellen — sonst prüft das Werkzeug eine Zielform, die es nicht mehr gibt. Ebenso liegt **`_terminologie/` in keinem `BEREICHE`-Eintrag** von `_ersetze.js`: `_navprobe.js:30` (`['Phase','Gate-Katalog']`) geht bei jeder Nav-Umstellung rot, ohne dass ein Textlauf sie erreicht — sie wird von Hand nachgezogen. |

### Selbst gefällte Entscheide (Auto-Commit-Dauerregel, begründet)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **S1** | Umschlüsselungswerkzeug | E23 schneidet hart: eine ausgelieferte `.mvgc` mit `ROLE-` wird abgewiesen. Der Prüfer bleibt streng wie entschieden, **aber** es entsteht ein benanntes Werkzeug, das eine Altdatei einmalig in die neue Form überführt. Ohne das läge beim Kunden eine Datei, die nicht mehr öffnet, und der einzige Weg wäre Neuversand. |
| **S2** | Reihenfolge der Bündel | Text vor Kennungen. Die Textumstellung ist umkehrbar und berührt keine Verknüpfung; die Kennungsmigration ist einmalig und verkettet. Ein Fehler im Text kostet einen Nachzug, ein Fehler in den Kennungen kostet Verweise. |
| **S3** | `ROLE-` als eigenes Bündel | 3.106 Fundstellen, davon der Großteil sicherheitsrelevant (Rechte, PIN, Kundenpaket). Kein Sammelbündel — eigener Schnitt, eigene Vorabmessung, eigener Review. |
| **S4** | Dreistufiges Verfahren | ersetzen → englische Seite zurücknehmen → mit zweitem Zeugen beweisen (§4.1). Vier gescheiterte Anläufe, das über ein Block-Urteil zu lösen. |

### Selbst gefällte Entscheide zu Bündel B2 (Auto-Commit-Dauerregel, R895)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **S11** | Zuschnitt von B2 | Die §5-Zeile B2 nennt zwei Dinge (Oberflächenlabels **und** `Gate → Freigabe`). **B2 führt nur `Gate → Freigabe` aus**; die Register-Spalten und Oberflächenlabels werden als **B2b** herausgelöst. Grund: der Gate-Schnitt allein ist mit 1.712 ersetzbaren Fundstellen der größte des Programms — zusammengelegt wären die ~90 nachzuziehenden Prüfvektoren nicht mehr der einen oder anderen Ursache zuzuordnen gewesen. §9a und `MASTER-PROMPT-2026k.md` nennen B2b als nächsten Schritt. |
| **S12** | `Gate-Review` bleibt | Der Begriff ist an **fünf** Stellen ein gespeicherter Fach- bzw. Vergleichswert: `eventClass(type)` (`0003:7096`, `0003:7163`), `bm90AgendaFor('Gate-Review')` (`0074:25`), `raciEntries[].process` (Demo **und** Kundenpaket), `protokolle[].type`/`meetingSeries[].type` (über genau diesen Typ ordnet **bm638** Serie und Protokoll einander zu) und `TYPE_ALIAS` (`0727:16`). Er fällt damit unter **E2** und geht gemeinsam mit `Management-Readout` nach **B7**, dort mit Migrationsschritt — genau so, wie es der zweite R894-Review für `Management-Readout` entschieden hat. Zwei gleichartige Fälle verschieden zu behandeln wäre keine Grenze, sondern eine Inkonsistenz. **155 Stellen bleiben damit sichtbar** (gemessen mit `_b2_schaden.js`) — die größte bewusst stehengelassene Menge des Bündels. |
| **S13** | Kundenglossar | Der **Musterschlüssel** `"Gate":"Quality Gate"` wandert mit (analog **E30**); bereits ausgelieferte Kundenpakete behalten `"Gate"` und finden den Begriff nicht mehr. Kein Datenverlust, das Paket öffnet weiter. Der Alt-Schlüssel-Rückfall gehört nach **B10**, wo mit **S1** ohnehin das Umschlüsselungswerkzeug entsteht — zwei halbe Lösungen an zwei Stellen wären teurer als eine ganze. ⚠ Zusätzlich gemessen: `bm695Term` (`0687:31`) bildet den Plural als `(s|es)?` ab, also nach ENGLISCHER Regel; der deutsche Plural auf -n wird nicht erfasst. Eine Erweiterung wäre **falsch**, weil der Ersatz den gefundenen Suffix an den KUNDENBEGRIFF hängt („Quality Gaten"). Die Grenze ist im Vektor `deep-test.html:844` festgenagelt statt verschwiegen → **B10**. |
| **S14** | Die drei Schnitt-Prinzipien | **P1** B2 ersetzt ausschließlich das Wortglied `Gate`/`Gates`; andere Glieder bleiben stehen, auch wenn sie selbst Anglizismen sind (sie gehören in ihr Bündel) — Ausnahmen nur, wo die Owner-Liste die Zielform des ganzen Kompositums nennt oder wo wörtliches Ersetzen eine **Tautologie** erzeugt. **P2** Bindestrich-Komposita werden verschmolzen, wenn das zweite Glied deutsch ist; der Bindestrich bleibt bei Fremdwort, Kennung, Eigenname oder unlesbarer Länge. **P3** Die **Regelliste IST die Whitelist**: was keine Regel hat, wird nicht angefasst — dafür tragen die nackten Regeln `wortanfang` UND `wortende`, und die ausgelassene Menge wird mit GRUND ausgewiesen (`_b2_rest.js`, „keine Regel" = 0). |
| **S15** | Homograph „Freigabe" | Der i18n-Lint fand die vorhergesagte Kollision: `"Freigabe"` → `"Approval"` (Bestand: die freigebende Rolle) gegen `"Freigabe"` → `"Gate"` (neu: das Entscheidungstor). Ein deutscher Schlüssel kann nur EINEN englischen Wert haben; effektiv gewann „Gate", womit die Freigebenden-Spalte im englischen Boot „Gate" geheißen hätte — und in **derselben** Registerdefinition stünden zwei Spalten „Freigabe" (`approver` und `gateRef`). **Entscheid: der ÄLTERE, weniger prominente Gebrauch wird präzisiert** — `approver` heißt „**Freigabe durch**" (8 Code-Stellen + 2 Wörterbuch-Schlüssel). Der bare Begriff bleibt dem Entscheidungstor vorbehalten (E27), und die englische Fassung bleibt wortgleich: der Wert „Approval" wandert unverändert unter den neuen Schlüssel. |
| **S16** | Karten-Wettlauf | Der DOM-Golden führte für `meetingManager` **6** Karten; im settled Zustand sind es **5** — nachgemessen im Browser an **beiden** Ständen (R894 **und** R895). Erbauer `bm-v357` und Aufräumer `bm-v482`/`bm-v552` arbeiten gegeneinander; der Golden hatte einen Zwischenzustand eingefroren. **Der Wettlauf wird NICHT in B2 entschieden** (das wäre eine Verhaltensänderung außerhalb des Auftrags); der Golden folgt dem gemessenen settled Zustand. Damit hat der bereits ausgewiesene Wettlauf eine **zweite** Fundstelle neben `berechtigungen`. |
| **S17** | Residue-Zuwachs | `residueMax` 886 → **952**. Längennormiert gemessen (die Einträge sind gekappt, „Freigabe" ist vier Zeichen länger als „Gate" — ein naiver Mengenvergleich zählte 94 statt 66): **66 echt neu, 0 echt weg**. ⚠⚠ **Kein Übersetzungsverlust:** alle 66 hatten **auch vor dem Programm kein Wörterbuchpaar** (am Vorstand `8b00e8b` nachgemessen für `Gate-Status`/`Gate-Landkarte`/`Gate-Logik`/`Gate-Entscheidung`/`Gates`). Sie zeigten den deutschen Quelltext, der zufällig ein ENGLISCHES Wort enthielt — und blieben dem Residue-Wächter deshalb unsichtbar. **B2 ist das erste Bündel, dessen AUSGANGSbegriff selbst englisch war.** Entscheid: **kein neues Paar in B2** — es gäbe nichts nachzuziehen (§6.3 schützt bestehende Paare, und die sind vollständig mitgewandert), und ein Paar müsste auf den alten deutschen Quelltext zeigen, um wortgleich zu bleiben. Der EN-Ausbau ist als benannte Aufgabe gebucht; **seine Liste IST diese Baseline**. |
| **S18** | Werkzeug-Jargon | Die Bauteile der eigenen Prüfkette heißen selbst „Gate" (Compile-Gate, Typ-Gate, Live-Smoke-Gates, Headless-Gate-Runner), dazu die generische Riegel-Bedeutung (PIN-Gate, Rechte-Gate, Boot-Gate). **Gemessen: 26 von 26 Kandidaten in `_gates_headless.js` sind Entwicklersprache** — sie fallen **nicht** unter den Auftrag. Zwei Gürtel halten das auseinander: die Regelliste als Whitelist (primär) und `istWerkzeugJargon` für die **nackte** Form in den Werkzeug-Dateien (sekundär). ⚠ Der zweite Gürtel greift ausdrücklich NICHT für Zusammensetzungen — `Gate-Landkarte` und `Gate-Wiederholung` sind dort Produkttext-Anker. Die wenigen **nackten** Produkttext-Anker (`['gateRef','Gate']`, der Fallback-Titel) sind von Hand geführt und in `_b2_hand2.js` belegt. |

### Selbst gefällte Entscheide zu Bündel B2b-1b (Auto-Commit-Dauerregel, R898)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **E34** | Zuschnitt B2b-1 → **B2b-1b + B2b-1c** | ⚠⚠ **Die Hausregel „schwer nach leicht" wurde bis hier still mit „viele Stellen zuerst" gleichgesetzt — und das ist messbar falsch.** `_b2b_zuschnitt.js` sortiert nach Menge, §9a listet den KERN in genau dieser Reihenfolge; danach wäre `Actuals` (161) der schwerste Rest-Begriff gewesen. Gemessen (neues Werkzeug **`_b2b_schwere.js`**) trägt `Actuals` **keinen einzigen** Aufwandstreiber: 0 Zusammensetzungen, 0 Kollisionen, 0 Prüfvektoren, kein Geschlechtswechsel. `Heatmap` hat bei 49 nackten Stellen **34 verschiedene Zusammensetzungen**, von denen jede eine eigene Regel braucht. **B2b-1b** bündelt die vier Begriffe, die je EINEN Treiber auf seinem Höchststand tragen (Komposita: Heatmap 34, Agenda 28 · Genus: Audit-Trail 40 Begleitwörter · Kollisionen: Variance 16); **B2b-1c** die sieben ohne solchen Treiber. Die Schnitte sind in der **Menge** fast gleich (672/646) und in der **Schwere** weit auseinander — das ist der Beleg, dass Menge nicht Schwere ist. |
| **E35** | `Audit Trail` (Leerzeichenform) wandert mit | Der Zuschnitt hatte sie nach Menge (21 Stellen) in die RESTMENGE **B2b-2** sortiert. Ein Lauf, der nur die Bindestrichform umbenennt, lässt **dieselbe Sache in zwei Schreibweisen** in der Oberfläche stehen und **sieht dabei vollständig aus**. Zwei Schreibweisen desselben Begriffs gehören in denselben Schnitt. |
| **E36** | Die RACI-Familie wird zusammengeführt | `RACI-Matrix-Heatmap` wäre wortgetreu „RACI-Matrix-Bewertungsmatrix" — dasselbe Wort zweimal. Die Ansicht heißt im Haus ohnehin schon **„RACI-Matrix"** (Überschrift `0003:7271`, Untertitel „Prozesse × Rollen"), und die Farbcodierung steht im Untertitel. Damit `RACI-Heatmap` und `RACI-Matrix-Heatmap` danach nicht **zwei Namen für dieselbe Ansicht** tragen, laufen **beide** auf `RACI-Matrix`. Das ist eine Zusammenführung, keine bloße Übersetzung — sie steht darum ausgeschrieben und nicht in einer Wortregel versteckt. Ebenso `Risk-Heatmap` **und** `Risiko-Heatmap` → `Risiko-Bewertungsmatrix`: den englischen Rest stehen zu lassen wäre in einem Programm, das Anglizismen tilgt, ein halber Schnitt, der vollständig aussieht. |
| **E37** | Der gespeicherte KPI-Wert bekommt eine **Migrationsstufe** | `thresholds[].kpi` trägt den KPI-Namen als **gespeicherten Wert** und wird in `0003-basis.js:6481` mit `===` verglichen. Die Alternative wäre gewesen, den Wert vom Sichttext zu **entkoppeln** (Kennung statt Name) — das ist die sauberere Architektur, aber ein **Eingriff ins Datenmodell außerhalb des Auftrags** (E15: nur die Klasse TEXT wird angefasst). Entscheid: **Umbenennen + Leiter-Stufe 2.23.0 → 2.24.0** (`bm961WertKanon`), und die Entkopplung als benannte Aufgabe nach **B7** (dort steht mit E2 ohnehin die Anzeigeschicht für Fachwerte an). ⚠ Der Portfolio-Regex behält die **alten** Alternativen absichtlich: die Leiter heilt gespeicherte Stände, ein frisch importiertes Fremdpaket kann den Altwert weiterhin mitbringen. |

### Selbst gefällte Entscheide zu R899 (B2b-1c + B2b-1d + die vier Owner-Punkte)

Der Owner hat am 2026-08-24 **vier Punkte** beauftragt und die offenen Fragen dazu
vorab per MC beantwortet (Anzeige-Namen statt Kennungsmigration · Spaltenköpfe **plus**
B2b-1c · nur die Nav-Gruppe · **ein** Release). Die Ausgestaltung ist unten gebucht.

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **E38** | Zuschnitt R899 | **B2b-1c UND B2b-1d in EINEM Release** (Owner-MC). B2b-1c ist der geplante Rest-KERN (7 Begriffe, 646 Stellen); B2b-1d ist **neu** und trägt die vier Owner-Punkte. ⚠ Die Zusammenlegung widerspricht der R898-Begründung „ein Sammelschnitt macht die Nachzüge nicht mehr zuordenbar" — sie ist eine bewusste Owner-Entscheidung, und die Zuordenbarkeit wird stattdessen über **getrennte Werkzeuge** hergestellt: der Wortlauf über `_ersetze.js --buendel=B2b-1c`, der Positionslauf über `_b2b1d_lauf.js`, die Handstellen über `_b2b1c_hand.js` mit **Klassen-Kennung je Stelle**. Jede Nachziehung ist damit ihrer Ursache zuzuordnen, ohne dass die Releases getrennt sein müssen. |
| **E39** | B2b-1d ist ein **POSITIONS-Schnitt**, kein Begriffs-Schnitt | Der Auftrag „auf den Übersichten aller Register sind noch die englischen Begriffe" trifft **32 distinkte Spaltenköpfe** (live am gebooteten Artefakt über alle 88 Ansichten gemessen). Die Hälfte davon — `Owner`, `Decision`, `Risk`, `Change`, `Residual`, `Scope`, `Trigger`, `Score`, `Readiness` — fällt als BEGRIFF nach **B2b-3** (SONDERFÄLLE, hohe Datenschlüssel-Quote, eigener Review). Ein wortweiter Lauf hätte B2b-3 **vorzeitig und unvollständig** hereingezogen. Ersetzt wird darum nur an zwei gemessenen Trägerformen: `label:"X"` **neben einem Datenschlüssel** (`key:`/`k:`/`f:`) und `<th …>X</th>`. Das Klassen-Urteil kommt aus `entscheide()` des Ersetzers, nicht aus einem Nachbau (R897-Lehre). ⚠ Die ausgelassene Menge ist benannt: die Fachkürzel **CPI · SPI · EAC · FTC · Var % · ESG · ESG/LCC · PV/EV/AC · Standard** bleiben (E11, PMI/DIN-Konvention), und `Risk-Review` sowie `Change-Board` bleiben als **gespeicherte Fachwerte** der S12-Klasse stehen (→ B7). |
| **E40** | Freigabe-Namen: **Anzeige** wandert, **Kennung** bleibt | Owner-MC: `G0 Bedarfsplanung` → `LPH 0 Bedarfsplanung`. `gateId` bleibt `GATE-<KURZ>-G<n>`, `gateCode` liefert weiter `G<n>` (E15). Die Kurzform folgt der **R580-Kurzform**, nicht der Langform des Phasenbands (`LPH 6 Vorbereitung Vergabe`, nicht `… der Vergabe`) — R580 hat die beiden bewusst getrennt. ⚠⚠ `gates[].name` ist ein **GESPEICHERTER** Wert ⇒ Leiter-Stufe **2.24.0 → 2.25.0** (`bm962FreigabeNamen`, INLINE im bm57-Block nach der V13-Lehre) mit einer **geschlossenen Liste statt eines Musters**: ein `/^G(\d) /` hätte kundeneigene Benennungen mitgezogen, und die dürfen genau das nicht. ⚠ Dazu vier Parser, die die Kennung aus dem NAMEN lasen (`gateShortCode` sogar zuerst) — sie lesen sie jetzt aus der KENNUNG und verstehen im Rückfall **beide** Schreibweisen. |
| **E41** | Nav-Gruppe „Register" — **nur die Nav** | Owner-MC. Betroffen sind **17 Schlüsselstellen** (Reihenfolge, Vorgabe-Aufklappzustand, Symbol, Farbe, Einhängepunkt, EN-Paar, Hilfe-Hub-Gruppierung, Kundenpaket-Muster). Der Prozess-**Reiter** „Registerdokumente" und der gesamte Fließtext bleiben (E3: Nav kurz, sonst Registerform). ⚠⚠ **Zwei Stellen wären still ausgefallen:** der gespeicherte Aufklappzustand `mvg_nav_collapsed` (Schlüssel-Migration in `0125`, **vor** dem inT-Guard nach der R853-Lehre) und der Überschreib-Schlüssel `navGruppen` der KUNDENPAKETE (`0680:20` bekommt einen **Alt-Schlüssel-Rückfall**, damit ausgelieferte Pakete weiter wirken — die R897-Klasse, diesmal proaktiv statt nachträglich). |
| **E42** | Der Aufklapp-Pfeil ist ein **Bug**, keine Terminologie | Gemessen im laufenden Boot: der `.arrow` der Gruppe hatte **2 px** berechnete Breite, alle anderen 9 px („Meetings & Berichte" 8,2 px). Er ist ein Flex-Element ohne `flex`-Angabe; der lange Gruppenname drückte ihn platt, übrig blieb der 2-px-Rand — **ein Strich**. ⚠ Die Umbenennung (E41) hätte das SYMPTOM geheilt und die KLASSE stehen lassen. Geheilt wird die Ursache: `flex:0 0 auto`. |
| **E43** | Die Umfeld-Heilung von `istSprachSchluessel` | SSOT §9a Punkt 0c-bis, seit R898 offen. Der Riegel hält jeden groß beginnenden Schlüssel für einen Sprachschlüssel und sperrte damit `AGENDA_TEMPLATES` (`0071:8`) **seit dem ersten Bündel**. ⚠ Die Heilung setzt **nicht am einzelnen Wert** an (eine UND-verknüpfte Verfeinerung kann Schutz nur ENTZIEHEN), sondern am **UMFELD**: sind die Geschwister-Werte überwiegend deutsch, ist der Wert keine englische Fassung. **Vor dem Einbau in beide Richtungen gemessen** (`_b2b_umfeld.js`): Vorlagen-Tabelle **75 %** deutsche Marken bei 8 Geschwistern, die fünf großen EN-Wörterbücher **0 %** bei 86–1.465. Die Entscheidung steht im Ersetzer, das Messwerkzeug liest sie von dort (zirkuläre Requires waren der erste Wurf). ⚠ `_dictheil.js` brauchte denselben Riegel — es wollte die frisch befreite Tabelle **im selben Schritt** wieder englisch machen. |
| **E44** | P1-Ausnahme für `Mitigations-Action(s)` | Ein streng gliedweiser Lauf schriebe „Risikominderungs-Actions" — halb deutsch, halb englisch, **und gegen eine bereits gefällte Entscheidung**: B1b (R894) hat den R572-Widerruf vollzogen, das Register heißt „Maßnahmenregister". Zielform ist „Maßnahme(n) zur Risikominderung". |
| **E45** | Zuschnitt B2b-2, an fünf Stellen von Hand korrigiert | Die SSOT nannte „23 Begriffe / 280 Stellen“. Gemessen am Stand nach R899 sind es **16 Begriffe / 208 Stellen**, und die Abweichung ist keine Nachlässigkeit, sondern das Ergebnis von vier gemessenen Bedingungen (in `_b2b_begriffe.js` im Wortlaut): noch keinem Schnitt zugeordnet · Klasse MENGE · **mindestens EINE ersetzbare Stelle** (eine Regel, die nicht feuern kann, ist die Klasse „tote Schutz-Regel“ aus dem R899-Nachtrag: sie wirft nicht, sie schweigt) · **kein Geschwister oder Teilbegriff eines Begriffs, der in B2b-3 bleibt**. Daraus folgen die Ausschlüsse `Ownern` (Beugung von `Owner`), `Domaenen-Scores` (Schreibvariante von `Domänen-Scores`), `Role Onboarding` (trägt `Onboarding`) und — gemessen, siehe E47 — `Tooltip`/`Tooltips`. |
| **E46** | `Deliverables` → **`Arbeitsergebnisse`** statt „Ergebnisse“ | ⚠⚠ **Eine Kollision, VOR dem Lauf vermieden statt danach gemessen.** Der Schlüssel `"Ergebnisse":"Results"` existiert bereits im englischen Wörterbuch. Mit der ursprünglichen Zielform wären zwei deutsche Schlüssel auf einen gefallen — mit VERSCHIEDENEN englischen Werten, also unter Verlust einer Übersetzung, und die Überschrift `<h3>Deliverables</h3>` hätte im englischen Modus danach „Results“ gezeigt. Das ist genau die Klasse aus §9a Auflage 10, für die es „bislang KEIN Instrument“ gibt: sie wird hier nicht gemessen, sondern **vermieden**. `Deliverable` → `Arbeitsergebnis` steht als Zielform in der Tabelle, bekommt aber **keine Regel**: gemessen hat die Einzahlform **0 ersetzbare Stellen**, und eine Regel, die nicht feuern kann, ist nach Bedingung (c) desselben Entscheids Dekoration (R900-Review, MINOR-20 — die erste Fassung schrieb „folgt mit“ und beschrieb damit eine Ersetzung, die nicht stattfindet). |
| **E47** | Die Zwei-Bedeutungen-Probe wird zur **MESSUNG** — `Tooltip`/`Tooltips` nach B2b-3 | §9a Auflage 1 verlangt seit R895 die Frage „trägt der Begriff im Haus auch Entwicklersprache?“ und sagt selbst, die Liste `ZWEIDEUTIG` sei „eine HYPOTHESE, kein Messergebnis“ — hatte dafür aber **kein Instrument**. Neues Werkzeug **`_b2b_jargon.js`**: Anteil der ersetzbaren Stellen im eigenen Prüfbestand, Schwelle **> 50 %**, Rausch-Untergrenze 8 Stellen, beide Richtungen (markiert-ohne-Beleg UND unmarkiert-mit-Beleg). Gemessen: `Tooltip` **57 %** (`Tooltip-Strip`, `Tooltip-Engine`, `Tooltip-Kopplung`, `Tooltip-Audit` sind Namen hauseigener Mechanik). ⚠ Die automatische Klasse sagte für denselben Begriff DATENQUOTE — und war ein Fehlalarm (drei Test-Literale, ein Wörterbuch-SCHLÜSSEL). **Zwei Kriterien, ein Begriff, gegenläufiges Urteil: das schärfere gewinnt.** `Tooltips` folgt ihm, weil Einzahl und Mehrzahl desselben Wortes nicht in zwei Schnitte dürfen. |
| **E48** | Kompositum-Regel: es wandert **nur das Glied, das im Bündel steht** | `Action-Burndown` → `Action-Abarbeitungsverlauf`, nicht `Maßnahmen-…`. Wer beide Glieder anfasst, greift einem Bündel vor, das seine eigene Vorabmessung noch nicht hatte. ⚠ **Ausnahme mit Beleg:** ist die Zielform für das GANZE Kompositum bereits an anderer Stelle entschieden, gilt die Hausentscheidung — `Decision-Backlog` wird `Entscheidungsregister`, weil §2.2 die Leerzeichenform `Decision Backlog` genau so setzt und B1 sie ausgeführt hat. Die Bindestrichform blieb dabei stehen; seither trug die Oberfläche **zwei Schreibweisen derselben Sache** — die `Audit Trail`/`Audit-Trail`-Klasse aus R898, nur über zwei Bündel verteilt. |

### Selbst gefällte Entscheide zu R901 (B2b-3a — der erste Sonderfall-Schnitt)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **E49** | Zuschnitt B2b-3: **`Owner` allein** ist der erste Schnitt | ⚠⚠ **Die Menge von B2b-3 stand seit R897 falsch im Einstiegsdokument** („38 Begriffe, 2.475 Stellen"). Diese Zahl kommt aus `_b2b_zuschnitt.js`, und der rechnet gegen `_b2b_gefahr.js` — also gegen den **ROHBESTAND**, der den Regelbestand nicht kennt. Nach fünf abgeschlossenen Bündeln überzeichnet er systematisch: seine Ausgabe führt `Runbook` mit 18, `Variance` mit 5, `Severity`/`Actuals` mit je 1 — Begriffe, deren Bündel „Rest 0" gemeldet haben. Nachgemessen sind **alle** diese Stellen von Regeln gedeckt (bei `Runbook` von den drei E3-Schutzregeln, die den Begriff **absichtlich** stehen lassen). Neues Werkzeug **`_b2b3_offen.js`**: von **2.522** Rohstellen sind **66 gedeckt**, OFFEN sind **2.456** über 38 Begriffe; **acht** Begriffe fallen ganz heraus. ⇒ *Die R897-Lehre „Rest 0 heißt NICHT nichts mehr zu tun" gilt auch in der GEGENRICHTUNG: eine Stelle mit Begriff heißt nicht, dass dort noch etwas zu tun ist.* ⚠ Der Zuschnitt folgt E34 (gemessene Schwere, nicht Menge), und der schwerste Treiber ist hier die **Beugungslast**: `Owner` trägt **219 GENUS / 151 ADJ** — mehr als das Vierfache des nächsten (`Drawer` 74/13). Der Grund ist strukturell, nicht mengenbedingt (siehe E50). `Ownern` (16) läuft mit, weil Beugungsformen desselben Wortes nicht in zwei Schnitte dürfen (Bedingung (d) aus E45). |
| **E50** | Zielform `Owner`: **E4 gilt, und die Zielform-Tabelle war die falsche Hälfte** | Die Tabelle `ZIELFORM` führte `'Owner': 'Verantwortlich'` — das ist die **Spalten**form. **E4 ist bindend und kontextabhängig**: *„Spalten und Nav kurz (Verantwortlich), Fließtext ausführlich (verantwortliche Rolle)"*. Die Spaltenhälfte ist mit **B2b-1d** (R899) bereits gelaufen; offen ist die **Fließtexthälfte**. ⚠⚠ Ein Lauf mit der Tabellenform hätte durchweg falsches Deutsch erzeugt — gemessen an den echten Begleitwörtern: `mit Owner` (148) → *„mit Verantwortlich"*, `ohne Owner` (45) → *„ohne Verantwortlich"*, `einen Owner` (23) → *„einen Verantwortlich"*. `Verantwortlich` ist ein **Adjektiv** und kann im Fließtext nicht als Substantiv stehen. **Das ist die E32-Klasse („die Zielform IST der Zuschnitt"), erstmals nicht an einer Kollision, sondern an der WORTART** — und die Schwere-Messung rechnete mit der falschen Form, ohne dass etwas rot wurde. ⇒ Zielform im Fließtext ist **`verantwortliche Rolle`** (f), mit dem Geschlechtswechsel **m → f** an jeder Artikelstelle. |
| **E51** | Drei gemessene Sonderfälle, die **keine** Wortregel verträgt | **(a) `der Owner` ist mehrdeutig.** „nachdem **der Owner** die Umsetzung bestätigt" ist Nominativ **Singular** (→ *die verantwortliche Rolle*), „Coaching **der Owner** je Register" und „nach Rückmeldung **der Owner**" sind Genitiv **Plural** (→ *der verantwortlichen Rollen*). Eine Regel über beide ist **immer** falsch — zeichengenau die R899-Klasse 0-ζ („eine Versions-Zahl ist entweder ein Endstand oder ein Schritt"), hier an einem **Kasus** statt an einer Zahl. Sie werden einzeln entschieden. **(b) `Owner Register` ist ein Rollen-DATENWERT** (`targetRoles:['PMO','Owner Register',…]`), kein Fließtext. **(c) Hausjargon:** `Owner-MC`, `Owner-Entscheid`, `Owner-Auftrag`, `Owner-Kanon` und Sätze wie „die Nummer, nach der der Owner sie ausgewählt hat" meinen den **Projektauftraggeber**, nicht den Fach-Owner eines Registereintrags — die R895-Zwei-Bedeutungen-Lehre an einem Begriff, den die Jargon-Probe mit 7 % als unauffällig führt, **weil sie den Prüfbestand misst und der Hausjargon im Produktivtext steht**. ⇒ Die Jargon-Quote misst, **wo** ein Begriff steht, nicht **was** er bedeutet; sie ist ein Indiz, kein Urteil. |

### Selbst gefällte Entscheide zu R902 (B2b-3b — die Fachbegriffe)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **E52** | `CTC / Forecast` **bleibt stehen** (S12 → B7) | **230 der 309 nackten `Forecast`-Stellen sind gar kein Fließtext, sondern dieser REGISTERNAME.** Er ist zugleich **Schlüssel in vier Nachschlagetabellen** (`ARTIFACT_VIEW52` `0014:763` · `REGLBL` `0003:7828` · `rowsForKind53` `0016:246` · `renderConsultPage53` `0016:262`) **und gespeicherter Wert** in `linkedArtifacts`, `registers[]` und `register`. Das ist zeichengenau die **R898-Klasse** (`thresholds[].kpi`): im Quellbaum wandern alle Seiten gemeinsam, ein **frischer** Stand ist stimmig — und die Gates fahren frische Stände; ein **Bestands**-Stand verlöre die Auflösung stillschweigend (die Registerdokument-Knöpfe eines Beratungsmoduls fielen auf ein totes `<span class="tag">` zurück). Er gehört mit `Risk-Review` und `Change-Board` in die **S12-Menge nach B7** — dort braucht er einen Owner-Entscheid über den deutschen Namen UND eine Leiter-Stufe. Geschützt sind **sieben** Schreibweisen (`CTC / Forecast`, `CTC/Forecast`, `CTC_Forecast`, `CTC & Forecast`, `CTC &amp; Forecast`, `CTC-Forecast`, `Forecast / CTC`) — eine davon wandern zu lassen hieße, denselben Namen in zwei Sprachen zu führen und dabei **vollständig auszusehen** (die R898-Auflage, die `Audit Trail` neben `Audit-Trail` gezogen hat). |
| **E53** | `Governance & Reporting` **bleibt stehen** (S12 → B7) | Dieselbe Klasse an einem zweiten Feld: die Prozess-**KATEGORIE** ist Schlüssel im Anzeige-Kürzel `REP` (`0497`), in der RACI-Anreicherung (`0513`), in den Prozess-Reitern (`0516`) und in der Phasenliste (`0440`/`0003`) — und sie wird an `customProcesses` **gespeichert** (`0357:216`), also auch an nutzereigenen Prozessen. |
| **E54** | `Projekt-Reporting`, `Onboarding neues Teammitglied`, `Forecast-Update` **bleiben stehen** | Gespeicherte Titel — und zwei davon zugleich **Anker einer Migrations-Prüfung**: `Projekt-Reporting` steht in `0727:82` auf **beiden** Seiten einer Heilung (alter Titel → neuer Titel), `Onboarding neues Teammitglied` in der Purge-Tabelle `ALT441` (`0727:57`), deren Kommentar ausdrücklich sagt „greift NUR Vorlagen mit exakt diesen Titeln". Das ist die **R897-Klasse**: eine Umbenennung darf die Stellen nicht anfassen, die den ALTEN Namen absichtlich festhalten. `Forecast-Update` ist ein Prozess-Titel, der über `raciEntries[].process` gespeichert wird. |
| **E55** | `Rollout` ist **Enum-WERT** und **Fließtext** zugleich | In der Vorgabeliste der Projektlage (`projectProfiles.occasion`) ist `Rollout` ein **WERT**, kein Anzeigetext — P1c aus dem i18n-Programm: werterhaltend, nur die Anzeige wird englisch. Als **Fließtext** („Blaupause für den späteren Rollout") wandert derselbe Begriff sehr wohl. ⇒ Die **E4-Kontextteilung**, hier zwischen WERT und SATZ statt zwischen Spalte und Fließtext. Geschützt sind die Vorgabeliste (drei Vorkommen) und ihr Wörterbuch-Paar. |
| **E56** | Die englische Seite eines **EN-Sweep-Paares** bleibt | `0949:141` trägt `[/^Einstiegs-One-Pager · (.+) · Stand (.+)$/, "Onboarding one-pager · $1 · as of $2"]` — die **dreizehnte Trägerform** englischen Textes: ein Paar, dessen deutsche Seite ein REGEX ist (den der Ersetzer bauartbedingt nicht anfasst) und dessen englische Seite eine gewöhnliche Zeichenkette ist (die er sehr wohl anfasst). Kein Wörterbuch-Zeuge sieht sie: kein Doppelpunkt, keine `en`-Marke, keine Schlüsselposition. |
| **E57** | Prüfbestands-Jargon bleibt | Das Sim-Modul `Reporting/Performance/PWA` und der Datencontainer `stakeholders` in einer Integritäts-Meldung benennen **Mechanik**, keine Oberfläche — genau das, wofür `_b2b_jargon.js` misst. |
| **E58** | ASCII-Zielform für die ASCII-Schreibvariante | `Domaenen-Scores` → **`Domaenen-Punktwerte`** (nicht `Domänen-Punktwerte`). Ihre einzige Stelle ist eine Assert-Meldung in `deep-test.html`, und Meldungstexte der Harnesse sind im Haus ASCII — Prong **7u** misst genau diese Grenze. Eine Zielform mit Umlaut hätte dort eine Schreibweise eingeführt, die der Bestand an dieser Stelle nicht führt. |
### Selbst gefällte Entscheide zu R903 (B2b-3c — die Prüfung)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **E59** | **Zuschnitt B2b-3c = `Review` allein** | Wie B2b-3a trägt der Schnitt genau EINEN Begriff, und aus demselben Grund: `Review` führt **drei der vier gemessenen Treiber** (Stellen 616 · GENUS 53 · ADJ 26 · Vektoren 143; nur bei KOMPO liegt `Drawer` mit 77:60 vorn). ⚠⚠ **Die Messung, die den Zuschnitt trägt, war beim ersten Lauf falsch** — siehe E60. Und der Schnitt bleibt bei einem Begriff, obwohl er damit nur rund 150 Ersetzungen trägt: er führt eine neue KLASSE im Ersetzer ein (**E62**), und eine Klasse in `entscheide()` wirkt auf JEDEN Begriff — liefe daneben ein zweiter schwerer Begriff, wäre bei einem Befund nicht mehr zu trennen, welcher von beiden ihn ausgelöst hat. |
| **E60** | **Die GENUS-Spalte war für alle 23 B2b-3-Begriffe ein Vorgabewert, kein Messwert** | `_b2b_schwere.js` ist fail-closed: ein Begriff, der in KEINER der beiden Genus-Tabellen steht, gilt als Wechsel. Für B2b-3 stand **keiner der 23** drin — GENUS meldete **364** statt der gemessenen **152**, ADJ **146** statt **86**, und `Drawer` wäre mit 74 geratenen Stellen auf Platz zwei des Zuschnitts gekommen, wo real **gar kein** Wechsel vorliegt (der Drawer → der Detailbereich). Der R902-Kommentar behebt exakt diese Klasse für B2b-3b und beschreibt sie wörtlich; beim nächsten Bündel war sie sofort wieder da, **weil nichts das Fehlen MELDET**. ⇒ Der Bericht weist geratene Zellen jetzt mit `?` aus und benennt sie; eine Probe über ALLE Schnitte hält die Lücke fail-closed (sie fand beim ersten Lauf fünf weitere in drei gelaufenen Bündeln). |
| **E61** | Die `Review`-**NAMEN** bleiben stehen (S12 → B7) | 501 Stellen bleiben (gemessen nach dem Lauf, keine davon ohne Regel) — 410 Name/Fachwert, 91 Chronik, und die Hälfte davon ist ein NAME: `Risk-Review` (159, sichtbarer Spaltenkopf UND gespeicherter Wert), `Gate-Review` (110, in B2/E2 bereits entschieden — die Schutz-Regel steht hier ERNEUT, weil `_b2_rest.js` nur die Regeln DES Bündels kennt), der mit `===` verglichene Sitzungstyp `Übergabe Review` (`0003:7127`/`7199`), der gespeicherte Statuswert `In Review` (`0016:88`), die Antwortoption `Prüfung oder Review` (`organisationsprofil.ts`) und `Abnahme-Review`, das im selben Datensatz neben dem geschützten `titleP` steht. ⚠⚠ **Die deutsche Prosaform `Risiko-Reviews` (60 Stellen) läuft MIT** — wanderte sie allein, stünde dieselbe Sitzung als „Risiko-Prüfung" im Text und als „Risk-Review" in der Spalte, und der Bestand **sähe dabei vollständig aus** (die R898-Auflage). ⚠ Beim Statuswert kommt ein zweiter, unabhängiger Grund dazu: **`In Prüfung` existiert im Bestand bereits** — als Status der Changes und der Wertanalyse. Ein Lauf hätte den Entscheidungs-Status auf einen FREMDEN, schon vergebenen Wert fallen lassen (E32-Klasse, erstmals an einem Enum). |
| **E62** | Neue Ersetzer-Klasse **EIGENVERWEIS** | Dieses Projekt schreibt in seinen Meldungstexten über SICH SELBST (`R832-Review`, `R849-Review-Befund`). Ein Lauf darüber schriebe Unsinn und machte die eigene Werkzeugkette unlesbar (R895-Lehre). Die vorhandene Klasse `istWerkzeugJargon` kann das per Bauart nicht sehen: **dateigebunden** und nur für die **nackte** Form. Die neue Klasse ist eng: `R` + drei bis vier Ziffern + optionaler Kleinbuchstabe + Bindestrich, **am Anfang** des Wortverbunds. GEMESSEN über alle Begriffe: **85 Stellen in 52 Formen**, 79 im Prüfbestand und 6 in `grund:`-Feldern der R10-Buchführung — **keine einzige Produkttext**. Der Rest der Chronik ohne Release-Marker (`Review-MAJOR`, `Review-Fix` …) läuft über Schutz-Regeln, bewusst mit der KüRZESTEN Form, damit eine gelöschte Fundstelle nicht jedes Mal eine tote Regel hinterlässt. |
| **E63** | Die Trennlinie heißt **NAME bleibt, SATZ wandert** | Dieselbe Kontextteilung wie `Rollout` in E55, nur an einem Begriff, der sie in **drei** Bedeutungen trägt. Praktische Folge: die bloße Form `Review` wandert überall, **auch im Prüfbestand** — „die adversariale Prüfung fand drei davon" ist lesbares Deutsch, `R832-Prüfung` wäre ein kaputter Bezeichner. Gemessen ist keine der 25 nackten `Review`-Stellen im Prüfbestand eine Produkttext-ERWARTUNG. | ⚠⚠ **DIE GRENZE ZU E62 IST GEZOGEN, NICHT GERATEN** (zweiter Review-Durchgang R903): E62 schützt die **Namensformen** der Chronik — alles, was wie ein Bezeichner aussieht (`R832-Review`, `Review-MAJOR`, `Review-Fix`). E63 lässt das **gewöhnliche Wort im Satz** wandern, **auch wenn der Satz von einem Review handelt**: aus „die der adversariale Review beanstandet hat“ wird „die in der Prüfung beanstandet wurde“. Der Review hat das als Klassen-Widerspruch gemeldet — zu Recht, denn die Grenze stand nirgends. Sie wird hier gezogen und nicht verschoben: ein Name muss zeichengenau bleiben, weil ihn etwas nachschlägt; ein Satz nicht. ⚠ Wo die Wanderung eine Grammatikfolge hatte (Kasus-Kipp, Wortdoppelung), ist sie von Hand geheilt — die Handstelle heilt also die FOLGE einer bewussten Wanderung, nicht deren Versehen.
| **E64** | **Die Heilung einer Beschriftungs-Regex wird VERENGT, nicht geweitet** | `Gate → Freigabe` hat etwas getan, was in diesem Programm noch nicht vorkam: es hat ein **Fremdwort** auf ein **gewöhnliches deutsches Wort** abgebildet, das der Bestand schon **vor B2 624-mal** trug (gezählt am Backup `index.release-1.34.813`). Die blanke Alternative `freigabe` ändert das Urteil der Kette bei **2.104** Literalen und reißt **167** Beschriftungen aus ihrem RICHTIGEN Register (63 raci · 45 calendar · 26 evidence · 21 ctc · 12 contracts). Auch die Kennung `lph` ist verworfen, obwohl trennscharf: sie fängt `LPH 7 Vergabe`, das vorher `G7 Vergabe` hieß und zu `contracts` ging (26 Umleitungen). Gewählt ist der REGISTERNAME `leistungsphase` (plus `freigabelandkarte`): 104 neu gefangen, 10 Umleitungen. ⇒ **Eine Heilung stellt her, was die Umbenennung weggenommen hat — sie verbessert nicht nebenbei, denn das wäre eine unbelegte Verhaltensänderung im Gewand einer Reparatur.** Beide Verwerfungen stehen als KO-Assert in H-R903. |

### Selbst gefällte Entscheide zu R904 (B2b-3d — die Momentaufnahme)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **E65** | **Die Zielform bleibt `Momentaufnahme`, obwohl sie im Bestand schon vergeben war** | ⚠⚠ **Dies ist die erste Umbenennung des Programms, deren Zielform NICHT neu ist.** Bis hierher bildete jedes Bündel ein Fremdwort auf ein deutsches Wort ab, das es vorher nicht gab; hier trägt der Bestand für dieselbe Sache **zwei** deutsche Wörter, beide älter als 2026k: `Berichtspunkt` (**94** Stellen, mit eigenen Wörterbuch-Paaren `"Berichtspunkt":"Report item"`) und `Momentaufnahme` (**27** Stellen). Die Oberfläche zeigte sie bis R904 als **Glosse** nebeneinander — „Berichtspunkte (Snapshots)", „Snapshot / Berichtspunkt erstellen", „Berichtspunkt (Snapshot) setzen". ⇒ **Gewählt ist `Momentaufnahme`** (SSOT §2.3, unverändert), und zwar aus einem gemessenen Grund: `Berichtspunkt` benennt den **Gebrauch** (ein Punkt einer Berichtsreihe) und ist im **Wiederherstellungs**-Kontext sachlich falsch — „lokaler Berichtspunkt + Voll-Backup", „vor größeren Änderungen einen Berichtspunkt als Wiederherstellungspunkt anlegen". Die 27 Bestandsstellen sind sämtlich `Kostengruppen-Momentaufnahme`, also **dieselbe Art Objekt in engerem Umfang**; das Wort wird damit einheitlich gebraucht statt doppeldeutig. ⚠ Es ist zugleich **Schlüssel im Artefakt-Katalog** (`0906:80`) und hat ein eigenes Wörterbuch-Paar `"Cost group snapshot"` — H-R904 fährt diesen Schlüssel am ECHTEN Kern `bm896ArtInfo`, weil E65 sonst eine Behauptung wäre. |
| **E66** | Der gespeicherte Prüfwert **`auditTrail[].action === 'Snapshot'` bleibt englisch** | Die R898/R902-Klasse in ihrer sichtbarsten Form. **Ein** Schreiber (`0003:1532`), **14** `===`-Leser über Produktion, Modul und Prüfbestand. Entscheidend sind zwei gemessene Folgen für einen **Bestands**-Stand: die Auswahlliste des Nachweisketten-Filters wird **aus den Daten** gebaut (`0385:80` `new Set(list.map(a => a.action))`) — dieselbe Ereignisart stünde dort unter ZWEI Namen —, und jeder alte Eintrag verlöre seine goldene Kennzeichnung. ⚠ Dazu ein zweites Argument, das ohne Messung nicht sichtbar ist: die **Geschwister** dieses Werts sind eine geschlossene Familie gespeicherter Vokabeln, und die Hälfte davon ist selbst englisch (`Approval`, `Merge-Add`, `Merge-Overwrite`, `Threshold-EW`, `Threshold-Action`, `Bulk-Update`). `Snapshot` stehen zu lassen ist damit **konsistent mit seiner eigenen Wertfamilie**; sie wandert als GANZES oder gar nicht — das ist eine **B7/B8**-Frage, keine dieses Textschnitts. ⚠⚠ **Neun Anker statt einer Regel**, weil der Wert zeichengleich mit dem gewöhnlichen Wort ist: jede Schutz-Regel verankert ihre STELLUNG. Zwei davon waren im ersten Wurf **wirkungslos** — sie reichten in den CAMEL-Bezeichner `entityType` und wurden mit Grund CAMEL verworfen, während die nackte Regel an derselben Stelle zugegriffen hätte. Gefunden hat es das **Lesen der Trefferzahl je Regel** (Auflage 0-ω); geheilt sind sie mit dem Zonen-Marker `2026k-ALTBEGRIFF`, weil es an dieser Stelle **keine** tragfähige Anker-Form gibt (nach rechts CAMEL, nach links CODE). |
| **E67** | Neue Trägerform **GLOSSE** — und sie entsteht nur, wenn der Bestand schon ein deutsches Wort hat | Aus „Berichtspunkte (Snapshots)" wurde „Berichtspunkte (Momentaufnahmen)": die Klammer erklärte ein Fremdwort und **verdoppelt jetzt nur noch**. ⚠⚠ **Kein Zähler sieht das** — der Lauf ist korrekt, die englische Seite unberührt, alle sechs Zeugen grün; falsch ist erst das ERGEBNIS. Elf Stellen sind aufgelöst; welches Wort bleibt, entscheidet der KONTEXT: `Berichtspunkt` in der Trendanalyse (Reihenpunkt), `Momentaufnahme` in der Befehlsleiste (Objekt — der Befehl friert einen Zustand ein und meldet danach „Momentaufnahme erstellt."). ⚠ **Nicht jede Nachbarschaft ist eine Glosse**, und die vier Ausnahmen sind benannt: zweimal zitiert die Klammer eine **Knopf-Beschriftung** („Berichtspunkt setzen (Momentaufnahme jetzt)"), zweimal steht ein echter Satz über ZWEI verschiedene Dinge („jede neue Momentaufnahme erzeugt einen Berichtspunkt"). ⚠ Zwei der elf sind zugleich **Wörterbuch-Schlüssel**; dort wandert der Schlüssel mit und der englische Wert bleibt Zeichen für Zeichen stehen. |
| **E68** | Die **Werkzeugsprache des Prüfbestands** bleibt, mit Grund statt mit Schweigen | 16 Zusammensetzungen benennen im Prüfbestand die Mechanik dieses Projekts (`Snapshot-Mechanik`, `state-Snapshot`, `Fixture-Snapshots`, `2-MB-Snapshot` …). Sie brauchen **keine** Ersetzung — die nackte Regel trägt beide Wortgrenzen und lässt jedes Kompositum stehen —, aber sie brauchen einen **GRUND**, sonst meldet `_b2_rest.js` sie als „keine Regel", und genau diese Zahl ist die Zusicherung des Bündels. ⚠⚠ Es ist die **E62-Klasse mit anderem Marker**: hier steht statt der Release-Kennung eine **BLOCK**- oder **LAYER**-Kennung davor (`0677-Snapshot-Fix`, `v234-Snapshot-Erweiterung`) — Formen, die die Klasse EIGENVERWEIS per Bauart **nicht** erkennt, weil sie nur `R` + Ziffern kennt. ⇒ Die Klasse wurde **nicht geweitet**: gemessen über alle Begriffe an den Stellen, die `entscheide()` wirklich nimmt, trägt **keine einzige** eine Block- oder Layer-Kennung (die beiden Formen sind Komposita und werden ohnehin von der Wortgrenze gehalten). Eine Klassen-Weitung ohne Fundstellen wäre eine Verhaltensänderung ohne Anlass. |

### Selbst gefällte Entscheide zu R905 (B2b-3e — der Detailbereich)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **E69** | **Die Zielform `Detailbereich` ist vom Bestand selbst bestätigt** — und `Detailansicht` ist NICHT ihr Synonym | Auflage **0-Ϥ** (R904) verlangt, die Zielform vor dem Schnitt zu **zählen UND anzusehen**. Gezählt: `Detailbereich` stand **dreimal** im Bestand, und alle drei Stellen sind **Glossen auf genau diesen Begriff** (`<b>Drawer (Detailbereich):</b>` 0225:19 · „`<b>Drawer:</b>` editierbarer Detailbereich mit Notiz …" 0234:23 · derselbe Satz als Wörterbuch-Schlüssel 0858:8). Das ist die **freundliche** Form der R904-Lage: es gibt **kein zweites Hauswort**, zwischen dem zu wählen wäre — die Glosse fällt beim Schnitt mit sich selbst zusammen. ⚠ Angesehen wurde auch der naheliegende Kandidat `Detailansicht` (**38** Stellen): er ist **kein Synonym, sondern der Oberbegriff über beide Träger**, und der Bestand sagt das ausdrücklich — „… sind per Klick mit **Detailansicht** in den **Detail-Drawer** bzw. die **Detailseite** verknüpft" (`0234:6`). Eine reine Zählung hätte ihn als vergebene Zielform gelesen und den Schnitt verworfen. |
| **E70** | **Die Werkzeugsprache des Prüfbestands bleibt** — 62 Formen, 82 Stellen, jede mit Grund | Die **E68**-Klasse aus R904 in ihrer größten Ausprägung. `Drawer` führt mit **77** die KOMPO-Spalte der ganzen Restmenge — aber **62 dieser 78 Wortverbünde stehen als ERSETZBARER TEXT ausschließlich im Prüfbestand** (⚠ 17 von ihnen kommen auch in `src/legacy`/`src/core` vor — dort aber sämtlich in KOMMENTAREN, die `entscheide()` per Klasse nicht nimmt; nachgemessen im zweiten adversarialen Durchgang): Namen von Proben, Szenarien, Fixtures und Assert-Meldungen (`Drawer-Ziel-Korrektheit`, `Phantom-Drawer`, `bm937-Drawer-Vollausbau`). Sie brauchen **keine** Ersetzung — die nackte Regel trägt beide Wortgrenzen —, aber einen **Grund**, sonst meldet `_b2_rest.js` sie als „keine Regel", und genau diese Zahl ist die Zusicherung des Bündels. ⚠ **Die Trennlinie ist gemessen, nicht geschätzt:** aufgenommen ist genau die Form, deren Fundstellen **alle** im Bereich `tests` liegen; sobald eine Form auch nur EINE Stelle im Produkt hat, wandert sie (16 Formen, 152 Stellen). ⚠⚠ **Und sie ist gegengeprüft:** eine Schutz-Regel auf einem Test-Literal wäre falsch, wenn das Literal eine **Erwartung an Produkttext** ist — sie fröre die alte Schreibweise ein, während das Produkt wandert. Die beiden Fälle, die danach aussahen, sind nachgesehen und harmlos (`deep-test.html` pinnt `Im Drawer öffnen` in der **nackten** Form, beide Seiten wandern gemeinsam; dieselbe Datei pinnt `Drawer-Ableitung` aus einem **Kommentar** in `0921:252`, den der Ersetzer per Klasse nicht anfasst). |
| **E71** | Die **GLOSSE** wird durch **Streichung** aufgelöst, nicht durch eine Wahl | Anders als in R904 (E67), wo je Kontext zwischen `Berichtspunkt` und `Momentaufnahme` zu entscheiden war, ist hier das erklärende Wort **die Zielform selbst**. Nach dem Lauf steht „Detailbereich (Detailbereich)" bzw. „Detailbereich: editierbarer Detailbereich" — dreimal, davon einmal als Wörterbuch-Schlüssel. ⚠⚠ **Kein Zähler sieht das:** der Lauf ist korrekt, die englische Seite unberührt, alle sechs Zeugen grün, `_b2_rest.js` meldet 0 — falsch ist erst das **Ergebnis**. ⚠ Die dritte Stelle ist der **Schlüssel** zur zweiten: das Voll-Handbuch wird **segmentweise** übersetzt, der umformulierte deutsche Satz ist zugleich der Schlüssel. Wer nur den Satz heilt, lässt den Schlüssel ins Leere laufen und die englische Fassung fällt dort **still** aus (die R897-Klasse). Der englische Wert („editable detail area with note, links and history …") bleibt Zeichen für Zeichen stehen. |
| **E72** | ⚠⚠ **Die verwaiste KLEBEFORM wird in DIESEM Release geheilt — auch für die vier fremden Bündel** | Der eigentliche Befund des Release, und er gehört gar nicht zu diesem Schnitt. Jede Regel trägt beide Wortgrenzen (Auflage 4), jedes Instrument sucht **zeichengenau**, der Ersetzer ist **case-sensitiv**: eine zusammengeschriebene Form fällt durch **alle drei Netze zugleich**. Gemessen mit dem neuen `_b2b_kleinform.js` über alle Schnitte: `Detaildrawer` **26** · `Standardagenda` **8** · `Freigabeagenda` **6** · `Dokumentenreview` **3** · `Betriebsowner` **3** · `Wirksamkeitsreview` **2** (Quellstellen inkl. des gespiegelten Projektpakets; 48 gesamt, davon 33 im Artefakt). Alle sechs sind **sichtbarer deutscher Text**, und **vier** stammen aus Bündeln, die ihren Rest mit **NULL** ausgewiesen haben (B2b-1b/R898, B2b-3a/R901, B2b-3c/R903). ⚠⚠ **Am schärfsten ist der Beleg, dass es Inkonsistenzen im eigenen Haus waren:** `Standard-Tagesordnung` stand **schon 8-mal** und `Wirksamkeitsprüfung` **schon 2-mal** im Bestand — beide Schreibweisen lagen nebeneinander, und nur die getrennte war für die Instrumente sichtbar. ⇒ **Geheilt wird im Release, das den Befund macht** (die R903/R904-Hausform: der eigentliche Befund gehört oft nicht zum Schnitt). ⚠ **Vier weitere Klebeformen bleiben bewusst stehen** — `Gesamtscore` (7) · `Admintools` (5) · `Änderungstrigger` (4) · `Kostenimpact` (2): ihre Begriffe gehören zu **B2b-3** und sind noch nicht gelaufen. Sie hier zu heilen nähme einem künftigen Schnitt seine Stellen weg, und **sein Rest-Ausweis fände sie danach nicht mehr**. Sie stehen im Werkzeug gelistet und in §9a benannt. |
| **E73** | **„KLASSE TRIFFT NICHT ZU" ist eine eigene Antwort — weder ROT noch stilles 0** | Drei Instrumente meldeten für dieses Bündel aus dem **falschen Grund**, und alle drei sind geheilt. · `_b2b_abkuerzung.js` war seit R897 für **fünf von sieben** Schnitten ROT (B2b-1a, B2b-3a, B2b-3c, B2b-3d, B2b-3e): sein Vakuum-Riegel zählte die Stellen **erst nach** dem Kürzel-Test, und ein **einwortiger** Begriff kann per Bauart keine Abkürzung auflösen. · `_b2b3b_kompgenus.js` hätte für den ersten Schnitt **ohne** Geschlechtswechsel „die Tabelle ist veraltet" gemeldet — die richtige Farbe aus dem falschen Grund, und der Leser sucht am falschen Ort. · `_b2b3a_kasus.js` war auf `verantwortliche Rolle` **fest verdrahtet** (der im R904-Nachtrag benannte, **nicht** geheilte Punkt aus 0-Ϩ) und meldete für jedes fremde Bündel 0; nach der Verallgemeinerung misst es erstmals auch **B2b-2** und **B2b-3b** (beide 0 Befunde). ⇒ Jedes der drei nennt jetzt einen **Deckungs-Ausweis** und unterscheidet „die Klasse existiert hier nicht" von „ich habe nichts gemessen". ⚠ **Ein Riegel, der die Normallage anschwärzt, wird nach dem dritten Mal nicht mehr gelesen** — das ist 0-ϧ in der Gegenrichtung. |

### Selbst gefällte Entscheide zu R906 (B2b-3f — der Umfang)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **E74** | ⚠⚠ **Die Zielform ist `Umfang`, nicht `Projektumfang` — der Bestand schlägt die Werkzeug-Tabelle** | Auflage **0-Ϥ** verlangt, die Zielform vor dem Schnitt zu **zählen UND anzusehen**. Gezählt: **`Projektumfang` kommt im ganzen Bestand NULL mal vor**; die drei Treffer stehen in dieser SSOT, in `_b2b1c_hand.js` und in einer Genus-Tabelle — also ausschließlich in der eigenen Buchführung. Die **Spalte** heißt dagegen seit **R899** (B2b-1d) `Umfang`: `<th>Scope</th>` → `<th>Umfang</th>` und `{key:"impactScope",label:"Scope"}` → `label:"Umfang"`, beides am Vorgänger-Commit nachgemessen. ⚠⚠ **Und diese Form ist nicht nur ausgeliefert, sie ist EINGEFROREN:** die Migrationstabelle `BM899_SPALTEN` (`0389`) führt `'Scope':'Umfang'` **innerhalb einer `2026k-UNBERUEHRBAR`-Zone** und übersetzt damit die **gespeicherte Spaltenreihenfolge jedes Bestandsnutzers**. Eine zweite Umbenennung derselben Spalte bräuchte eine ZWEITE Generation (`'Umfang':'Projektumfang'`) und ließe jeden, der sie verpasst, still ans Tabellenende rutschen — genau der leise Ausfall, den R899 dort selbst beschreibt. ⇒ **Eine ausgelieferte Zuordnung ist kein Nebenprodukt der Umbenennung, sondern ihre stärkste Bindung.** E4s Absicht („Spalten und Nav KURZ") ist damit erfüllt, ihr Wortlaut nicht — und das ist gebucht statt stillschweigend. ⚠ Die Fließtext-Hälfte von E4 (`Projekt-/Leistungsumfang`) fällt mit derselben Messung: die Fließtext-Stellen sind zu einem großen Teil Aufzählungen **genau der fünf Spalten** (Kosten · Termin · Qualität · Umfang · ESG/LCC); eine längere Form im Satz spaltete dieselbe Sache in zwei Wörter. Wo der Bestand ein eigenes Hauswort führt (`Leistungsumfang`, 12 Stellen, zwei Wörterbuch-Paare, eigene Überschrift), bleibt dieses **unberührt** — es wandert nicht, es steht schon da. |
| **E75** | **Der gespeicherte Fachwert `Scope` bleibt** (S12 → B7) — und er ist der **schärfste** Kandidat dieser Klasse | `Scope` ist der **erste** Wert des gemeinsamen 19er-Typ-Vokabulars (`SHARED_TYPE_OPTIONS` / `BM805_COMMON` / `TYP_VOKABULAR`) und steht als `changes[].type`, `actions[].type`, `risks.category` und `decisions.type` in Demo-Daten, Projektpaket und Kundenpaket; dazu zwei `===`-Leser im Prüfbestand. **57 der 67** ganzen Zeichenketten `Scope` sind dieser Wert. Er bleibt, wie `CTC / Forecast` (E52), `Rollout` (E55), `Risk-Review` (E61) und `Snapshot` (E66) vor ihm. ⚠ **Ehrlich ausgewiesen, weil es gegen die eigene Buchung spricht:** die Wertfamilie ist **ansonsten vollständig deutsch** (`Termin`, `Kosten`, `Qualität`, `Vertrag & Vergabe`, `Technik`, `Organisation`, `Genehmigung/Compliance`, `Risiko`, `Lieferkette`, `Governance`, `Planung`, `Personal`, `Betrieb`, `Bau`, `Schnittstelle`, `Ressourcen`, `Förderung`, `Sonstiges`). R904 hat `Snapshot` unter anderem deshalb stehen lassen, weil **seine** Familie zur Hälfte englisch ist; hier zeigt dasselbe Argument in die **Gegenrichtung**. Es entscheidet trotzdem nicht: ohne Migration stünde dieselbe Sache in einem Bestands-Stand unter zwei Namen, und die Auswahlliste böte den einen, während die Daten den anderen tragen. ⇒ **`Scope` ist der schärfste B7-Kandidat**, und das ist hier gebucht, damit B7 ihn nicht verliert. ⚠⚠ **AUSDRÜCKLICH AUSGENOMMEN, vom adversarialen Review gefunden:** `DECISION_TEMPLATES[].crit[][0]` (`0003:4862-4863`) wird über `bm61NewDecisionFromTemplate` als `STATE.decisionCriteria[].criteria[].name` **persistiert** — `Scope`/`Scope-Wirkung` sind dort zu `Umfang`/`Umfangswirkung` gewandert und stehen damit in der E75-Aufzählung nicht. Das ist **bewusst**: ein Kriteriumsname ist FREITEXT, wird von niemandem mit `===` verglichen (gemessen: `grep -rn "Scope-Wirkung\|Umfangswirkung"` findet nur die Definition selbst), und jede Entscheidung trägt ihre eigene, in sich stimmige Kriterienliste. Die E75-Begründung — „dieselbe Sache unter zwei Namen **im selben Datenstand**" — greift hier also nicht: alte Entscheidungen behalten ihre alten Kriterien, neue bekommen die neuen, und keine Liste wird gegen eine andere gehalten. |
| **E76** | **Der MVG-Scout behält sein eigenes Hauswort `Bereich`** — eine kontextabhängige Zielform eine Ebene tiefer | Der Scout nennt seinen `scope` durchgängig `Bereich`: `T('Bereich','Scope')` in `0972:427` ist die **deutsche** Seite eines ausgelieferten Paares. Die nackte Regel hätte in drei Assert-Meldungen des Prüfbestands `Umfang` geschrieben und den Prüftext damit auf ein Wort gesetzt, das die **geprüfte Oberfläche** an dieser Stelle nicht verwendet. Das ist die **E4-Klasse eine Ebene tiefer**: der Kontext ist kein Satzbau, sondern ein **Teilsystem**. ⚠ Gemessen, nicht angenommen — im Produkt betrifft es **keine einzige** Stelle: `0967:386` meint die Bewertungs-Dimension und wandert richtig auf `Umfang`, `registratur.ts:84` bekommt eine eigene Regel auf `Bereiche`. |

### Selbst gefällte Entscheide zu R907 (B2b-3g — der Punktwert und der Reifegrad)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **E77** | ⚠⚠ **`Score` und `Readiness` laufen im SELBEN Schnitt — der Grund ist keine Menge, sondern eine BINDUNG** | `Readiness-Score` (**49** Stellen) gehört beiden Begriffen, und er ist kein Fließtext, sondern ein **gespeicherter Wert**: einer der zehn Einträge des `thresholds.kpi`-Vokabulars (Auswahlliste `0003:6487`), gelesen mit `===` in `0003:6516`, dazu zwei `===`-Leser im Prüfbestand. ⚠⚠ **Die Migrationsleiter dafür EXISTIERT bereits** — `BM961_WERTE['thresholds.kpi']` (`0020:386`), von **R898** für `EAC-Variance %` → `EAC-Abweichung %` gebaut, mit genau EINEM Paar. Liefe `Readiness` allein zuerst, hieße der Wert `Reifegrad-Score`; liefe `Score` allein zuerst, `Readiness-Punktwert`. In **beiden** Fällen bräuchte der zweite Lauf eine **ZWEITE Leiter-Generation auf denselben Wert**, und wer sie verpasst, verliert seine Schwellenwert-Regel still — zeichengenau die Bindung, die **E74** (R906) an `BM899_SPALTEN` beschrieben hat, nur an einem Wert statt an einer Spalte. ⇒ **EIN Schnitt, EINE Leiterstufe, EIN Zielwert `Reifegrad-Punktwert`.** ⚠ Preis der Entscheidung, ehrlich benannt: der Schnitt trägt damit **538 Stellen in 56 Formen** und als erster seit B2b-3b einen **Geschlechtswechsel** (`die Readiness` → `der Reifegrad`, 23 Begleitwörter). Das ist teurer als zwei kleine Läufe — aber zwei kleine Läufe wären am selben Datenstand zwei Migrationen. |
| **E78** | ⚠⚠ **`Readiness` war in der eigenen Begriffsliste NIE geführt — und mit ihm fünf weitere** | Die SSOT führt `Readiness \| Reifegrad` in **§2.3**, seit dem ersten Tag. Die ausgelieferte Migrationstabelle `BM899_SPALTEN` führt `'Readiness':'Reifegrad'` seit **R899** — beim Bestandsnutzer heißt die Spalte also längst so. In `_terminologie/_b2b_begriffe.js` — der Liste, aus der **jeder** B2b-Schnitt seine Menge zieht — stand der Begriff **nicht**. Gemessen mit `_b2_rest.js`: **362 ersetzbare Stellen in 35 Formen, davon NULL von irgendeiner Regel belegt.** ⚠⚠ Der Kopf jener Datei behauptet seit R897 wörtlich, ihr Inhalt sei „die SSOT-§2.3-Tabelle plus die §2.5-Zusammensetzungen"; ihre Selbstprobe prüft `BEGRIFFE` gegen `ZIELFORM` gegen `SCHNITTE` gegen `regeln.js` — **vier eigene Listen im Kreis**. Gegen die SSOT hat nie etwas gemessen. ⇒ **Eine Zusicherung ohne Instrument**, zehn Releases lang, in der Datei, die den Zuschnitt jedes Bündels bestimmt. ⚠ Das ist die **Gegenrichtung zu E74**: dort führte `ZIELFORM` eine Form, die der Bestand nie hatte; hier führt der Bestand eine Zuordnung für einen Begriff, den `ZIELFORM` gar nicht kennt. `_b2b_zielabgleich.js` konnte das **per Bauart** nicht sehen — es vergleicht nur die Paare, die in `ZIELFORM` STEHEN (6 von 31). *Ein Instrument, das nur die geführten Fälle prüft, kann einen ungeführten nie melden.* |
| **E79** | **Neues Instrument `_b2b_ssotabgleich.js`** — die SSOT gegen die Werkzeug-Liste, fail-closed | Es liest **§2.3 + §2.5** (105 Zeilen), hält sie gegen `BEGRIFFE` und teilt in drei Klassen: **geführt** (93) · **Ausnahme mit Grund** (12, geschlossene Liste, jeder Grund am Bestand nachgemessen) · **BEFUND**. Fail-closed: eine Überschrift, die es nicht gibt, und eine leer gelesene Tabelle **werfen**, statt 0 zu melden. Vakuum-Riegel auf drei Größen. KO-Drehung in beide Richtungen (ein geführter Begriff aus `BEGRIFFE` entfernt ⇒ MUSS Befund werden; zurückgelegt ⇒ wieder grün). ⚠⚠ **Der erste Wurf der Ausnahmeliste trug vier Einträge mit einer PLAUSIBLEN Begründung** („B1 hat den Registertitel umbenannt") — `_b2_rest.js` widerlegte alle vier: `Decision` **1.501**, `Evidence` **116**, `Gap Map` **6**, `Opt-in` **5**, sämtlich ohne jede Regel. ⇒ *Eine Ausnahme ohne Messung ist keine Ausnahme, sondern ein Deckel.* Jeder Grund trägt jetzt seine Zahl. ⚠ Und beim Bau fiel die **Schrägstrich-Falle** an: `Best/Worst Performer` steht ALS GANZES in `BEGRIFFE`; wer nur die Hälften prüft, meldet einen Begriff als fehlend, der da ist — die ganze Zelle wird zuerst geprüft, und die Selbstprobe hält das fest. |
| **E80** | **Die sechs ungeführten Begriffe sind eingetragen und ZWEI neue Schnitte GEBUCHT** | `Readiness` läuft in **B2b-3g** (R907, an `Score` gebunden). Neu gebucht, gemessen, mit Namen statt als Notiz: **B2b-3h „Die Entscheidung"** (`Top-Decisions`/`Decisions`/`Decision`) — **1.507 Stellen · 1.155 nackt · 67 Zusammensetzungen · 198 GENUS · 123 ADJ · 202 Kollisionen**, damit der **mit Abstand größte Einzelschnitt des ganzen Programms**, größer als `Owner` (920) — und **B2b-3i „Der Nachweis"** (`Evidence`/`Gap Map`/`Opt-in`, 138 Stellen). ⚠ Ein Begriff ohne Schnitt taucht in **keiner** Schwere-Messung und **keiner** Rest-Liste auf; genau der Zustand, aus dem diese sechs kommen. Darum stehen sie MIT Schnitt in `SCHNITTE`, und die Selbstprobe führt beide in einer geschlossenen Liste `OHNE_REGELN_ERWARTET` — **fail-closed in beide Richtungen**: ein Schnitt, der unerwartet ohne Regeln dasteht, ist rot, und ein gebuchter, der Regeln bekommen hat, ebenso. ⚠⚠ **Dort stand vorher ein Zähl-Assert** (`ohneRegeln.length <= 1`) und darunter eine Zeile, die die **gemessene** Liste mit dem Wort „erwartet" davor druckte — sie konnte der Messung per Bauart nie widersprechen. *Ein Zähl-Assert prüft nicht, was in den Zeilen steht* (R887). ⚠ **Zur Restschätzung des Programms:** die sechs bringen **rund 1.990 gemessene Stellen** in die offene Menge, die dort vorher nicht standen. Das ist keine neue Arbeit, sondern vorher unsichtbare. |

### Selbst gefällte Entscheide zu R908 (B2b-3h — die Entscheidung)

| Nr | Gegenstand | Entscheid + Begründung |
|---|---|---|
| **E92** | ⚠⚠ **`Gap Map` IST AUS B2b-3i HERAUSGENOMMEN und als eigener Schnitt B2b-3j gebucht** | Der Grund ist gemessen, nicht geschmacklich, und er ist zweifach. **(1) DIE BINDESTRICH-SCHWESTER (E82-Klasse, diesmal VOR dem Lauf gefunden).** Die SSOT §2.3 führt die **Leerzeichen**-Form; sie hat im ganzen Bestand **7 Fundstellen** — davon **3 auf der englischen Wert-Seite** (`'Governance-Gap-Map':'Governance Gap Map'`, `BM_TIP_EN`) und **4 in zwei gespiegelten Demo-Quellen** (`"outputs":["Gap Map",…]`), also real **ZWEI** deutsche Stellen. Der Begriff lebt im Haus dagegen als **Bindestrich**-Form: `Gap-Map` **87** · `Governance-Gap-Map` **28** · dazu `Gaps` **130** und die Ansichts-Kennung `gapmap` **54**. Ein Lauf auf die SSOT-Wortform allein hätte **115 Sichtstellen unberührt gelassen** und damit zeichengenau die E82-Falle wiederholt, gegen die der Kopf von `SCHNITTE` seine eigene Auflage führt („zwei Schreibweisen desselben Begriffs gehören in denselben Schnitt“). **(2) DIE ZIELFORM IST VERGEBEN, UND ZWAR IN ANDERER BEDEUTUNG** (0-Τ / E65-Klasse): `Governance-Lücken` steht im Bestand bereits **zweimal als deutscher Sichttext** (`0016:266` „Steuerbarkeit, Risiken und Governance-Lücken … sichtbar machen“ · `0016:287`) — dort meint es die **Sache**, nicht die **Ansicht**. Die Ansicht so zu benennen gäbe derselben Zeichenfolge im Haus zwei Bedeutungen (R895-Lehre). ⇒ **B2b-3j „Die Lücke“** ist mit beiden Schreibweisen gebucht; sein Zielform-Entscheid steht beim Zuschnitt an. ⚠ Dort ist zusätzlich der Nachbarbegriff **`Gap`/`Gaps`** zu prüfen, den die SSOT §2.3 **nicht führt**: nach 0-ϣ bindet er an dieselbe Fläche („Governance-<Ziel> … 12 Gaps identifiziert“), und ein halber Lauf lässt genau diesen Satz stehen. |
| **E93** | **Die NEGATIV-ERWARTUNG ist eine eigene Schutzklasse** | Ein Prüfvektor der Form `src.indexOf('<Altbegriff>') < 0` behauptet, dass der Altbegriff **weg** ist — er trägt ihn also mit **Absicht**. Wandert er mit, prüft er danach, dass die **Zielform** fehlt, und reißt genau dann, wenn der Lauf richtig war. Gemessen: der Bestand führt **394** solcher Erwartungen (deep 239 · selftest 18 · sim 5, Rest in weiteren Blöcken); **zwei** tragen die Zielform eines bereits gelaufenen Schnitts, und beide sind nachgesehen **bewusste KO-Drehungen** (deep `16788` „die deutsche Zielform darf NICHT als WERT auftauchen“ · deep `24145` „der KANON-Eintrag bleibt die WERT-Ebene“) — **kein Alt-Befund**. Für B2b-3i waren **vier** betroffen; sie tragen jetzt Schutz-Regeln. ⚠ Der erste Wurf der Schutzliste führte nur die Erwartungen mit **blankem** `Evidence` und übersah die mit `Evidence & Übergabe/Betriebshandbuch` — die R903-Lehre „eine Heilung wird VERENGT, nicht geweitet“ in ihrer **Gegenrichtung**: *eine Schutzliste darf nicht enger sein als ihre Klasse.* ⇒ Dazu gehört die **sinntragende Assert-Botschaft** („die EN-Seite behaelt „Evidence““): eine **Aussage ÜBER** den Altbegriff, keine Verwendung von ihm. |
| **E94** | ⚠⚠ **EIN SCHUTZ-ANKER MUSS GANZ IN EINER ZEICHENKETTE LIEGEN — und eine wirkungslose Schutz-Regel ist UNSICHTBAR** | Vier Anker des ersten B2b-3i-Wurfs trugen die Quotes und Doppelpunkte der **Umgebung** (`'Evidence':'evidence'` · `evidenceLinks:'Evidence'` · `':['Evidence & Links','Evidence',…` · `'Evidence — open: '`). Der Ersetzer arbeitet **klassentreu**: was er anfasst, ist der **Inhalt** einer Zeichenkette; ein Anker, der eine Klassengrenze (Code ↔ Text) überschreitet, kann in einer Quelldatei **per Bauart nie** matchen — nur dort, wo dieselbe Zeichenfolge **zitiert** in einer Zeichenkette steht (im Prüfbestand). Genau so sah es aus: im `tests`-Bereich meldete der Ersetzer Treffer, in `legacy` schwieg er. Der Lauf benannte daraufhin den **Alt-Alias** der Name→Ansicht-Tabelle, den **Namensbaustein der ausgelieferten CSV-Importvorlage** (E16) und die **SYN-Altnamenliste** um. ⚠⚠ **Gesehen hat sie nur das LESEN DES GOLDEN-DIFFS**: der Ersetzer listet eine SCHUTZ-Regel mit **0 Treffern** in seiner Tabelle **gar nicht auf** — die Gegenrichtung zu **0-ω** (R904), wo die Trefferzahl je Regel zu *lesen* war; hier fehlt die Zeile überhaupt, es gibt nichts zu lesen. Eine wirkungslose Schutz-Regel **sieht aus wie Sorgfalt**. ⚠⚠ **UND DIE SCHÄRFSTE FRAGE KAM ZULETZT (0-Ϳ, dritte Ausprägung): ein Anker kann richtig liegen und trotzdem wirkungslos sein.** `/Evidence/` (URL-Pfadsegment der Demo-Nachweise) liegt ganz in der JSON-Zeichenkette — die Klassen-Probe sagt *ok* — und wird von `entscheide()` **24-mal mit dem Grund CAMEL** verworfen, weil `wortUm()` den ganzen URL-Pfad als EIN Wort fasst und darin `UKWestfeld`/`BettenhausC`/`NetzausbauNord` steht. Der Ersetzer verbucht das als **ÜBERSPRUNGEN, nicht als Fehler**, und die nackte Regel wanderte danach alle **24 URLs**. ⇒ Neues Instrument **`_b2b3i_regelprobe.js`** mit **drei** Fragen: (1) steht die Zeichenfolge im Bestand? (2) liegt sie ganz in Klasse TEXT? (3) **nimmt `entscheide()` sie an — und mit welchem Grund verwirft er sonst?** Frage (3) ist das Urteil, (1) und (2) erklären nur, warum; sie ist billig, weil `entscheide()` exportiert ist. **24 Selbstproben**, Vakuum-Riegel am Zugriff, KO-Drehungen in beide Richtungen, und eine bewusst **selbstkalibrierende** E2E-Hälfte (der erste Wurf pinnte dort eine feste Zeichenfolge und war schon beim ersten Lauf rot, weil der Schnitt sie bewegt hatte — R888-Lehre). ⚠ **Reihenfolge-Feinheit**: ein Anker auf eine Wendung, die der Lauf erst **erzeugt**, ist VOR dem Lauf zwangsläufig „TOT: fehlt“ und danach grün — die Probe gehört **vor UND nach** den Lauf. ⇒ Wo ein Anker per Bauart unmöglich ist (der zu schützende Text bildet ALLEIN eine Zeichenkette), läuft die Stelle über **`_b2b3i_hand.js`** (5 Stellen) — und sie ist **nach JEDEM Ersetzer-Lauf erneut nötig**: *`_ersetze.js` allein darf nie der letzte Schritt sein.* |
| **E95** | ⚠⚠ **EIN ERSATZTEXT, DER DEN ALTBEGRIFF ENTHÄLT, WIRD VON DER EIGENEN NACKTEN REGEL GEFRESSEN** | Die Glossen-Regel schrieb `als Beleg. In der englischen Fassung: Evidence.` — und die **nackte Regel desselben Bündels** machte daraus im **gleichen Lauf** `… In der englischen Fassung: Nachweis.`, also wieder eine Tautologie, nur eine Windung weiter. Das ist die R903-Klasse („eine Handstelle, deren `von` ein Teilstring ihres `nach` ist, schreibt bei jedem Lauf erneut“) in ihrer **gefährlicheren** Form: hier frisst nicht die Regel *sich selbst*, sondern eine **andere** Regel desselben Bündels frisst sie. Gefunden hat es die **Idempotenz-Probe** (R903-Auflage: nach `--schreib` ein zweites Mal fahren) — sie meldete **1 statt 0**. ⇒ Wo ein Ersatztext den Altbegriff **bewusst** nennen soll (Glossar, Sprachhinweis), braucht die entstehende Wendung einen **eigenen Schutz-Anker**, und der muss **länger** sein als die nackte Regel (der Ersetzer sortiert längste zuerst). Geprüft wird das jetzt statisch von `_b2b3i_regelprobe.js` (zweite Frage, mit KO-Drehung auf einen zu **kurzen** Schutz-Anker). |
| **E83** | ⚠⚠ **0-Ѕ ANGEWANDT, aber als WERT-Regel, nicht als Schnitt-Fusion** | `High-Priority Decisions ohne Evidence` ist einer der zehn `thresholds.kpi`-Einträge (Auswahlliste + Presets-Defaults, ohne `===`-Leser) und trägt **zwei Begriffe aus zwei gebuchten Schnitten**: `Decisions` (B2b-3h) und `Evidence` (B2b-3i). Die wörtliche 0-Ѕ-Lesart („dann gehören beide zusammen") hätte B2b-3h und B2b-3i fusioniert — zusammen **263 Kollisionen** in einem Release, auf dem ohnehin größten Schnitt des Programms. Entschieden ist die **Zweck-Lesart**: die Auflage verhindert ZWEI Leiter-Generationen auf denselben Wert; das leistet auch eine **vollständige Wanderung des Werts in EINEM Schnitt**. Der Wert wandert darum in B2b-3h KOMPLETT (`High-Priority-Entscheidungen ohne Nachweis`, Leiter-Stufe 2.26.0 → 2.27.0, dritte Generation des WERT-Kanons), und **B2b-3i fasst ihn nicht mehr an** — seine Vorabmessung führt ihn als erledigt. Beide KPI-Werte (`Anzahl offener Decisions` ebenso) wandern über die BESTEHENDE Leiter `BM961_WERTE` — die E77-Bedingung (Wert wandert nur, wo eine Leiter existiert) ist erfüllt. |
| **E84** | **NAME bleibt, SATZ wandert — vier Namen erneut geschützt** | `Decision Management` ist eine **Prozess-KATEGORIE** des Katalogs (RACI-Vorlage je Kategorie `0513:16`; kundeneigene Prozesse speichern ihre Kategorie) — die E53-Klasse (`Governance & Reporting`, R902); Handbuch-Kapitel und Assessment-Domäne E zitieren diese Fläche und bleiben mit (0-ϯ). `Decision Workshop` ist ein **gespeicherter Termintyp** (`===`-Leser `0003:7200`, Agenda-Vorlagen-Schlüssel `0071:14`) — die E61-Klasse (`Übergabe Review`). `Decision Gates` (B2-Norm) und die **MCDA-Definition** `Multi-Criteria Decision Analysis` (+ deutscher Methodenname `Multi-Criteria-Decision-Analyse`) bleiben nach R900-Klasse. ⚠ Alle Schutz-Regeln stehen im B2b-3h-Regelblock ERNEUT, auch wo ein früheres Bündel sie trägt — **der Lauf kennt nur die Regeln DES Bündels** (R903-Präzedenz, in diesem Release am eigenen Leib gemessen, s. E88). |
| **E85** | **Der Quell-Wert `actions[].source === 'Decision'` bleibt (S12 → B7) — mit gemessener Zitat-Trennlinie** | Das Feld trägt `Decision` als Fachwert (Vokabular `SRCLABEL`/`BM947_SRC`, Erzeuger `0243:72`, Demogenerator `0304:73`, Auswahlliste des Registers) und hat — anders als `thresholds.kpi` — **keine Migrationsleiter**: er bleibt, wie `Scope` (E75) und `Snapshot` (E66). Nach 0-ϯ bleiben seine **Zitate** mit; die Trennlinie ist gemessen: eine Aufzählung, deren **jedes Glied in Wert-Schreibung** steht (`Risk/EW/Change/Decision/Gap`, `Risk, EW, Change, Decision, Gap`), ist ein Zitat und bleibt — Prosa mit abweichender Schreibung („Risk, **Frühwarnung**, Change, Decision oder Gap") spricht über die Sache und wandert. ⚠ Die **ANZEIGE**-Tabellen `PFXLBL` (0395/0771) und `TYPMAP` (0710) übersetzen den ID-Präfix rein fürs Auge und tragen die deutsche Form zu Recht; nur die WERT-Tabellen bleiben englisch. Die Laufzeit-Token-Familien (`type:"Decision"`, `kind:'Decision'` — Schreiber+Leser im selben Boot, nicht persistiert) wandern dagegen MIT. |
| **E86** | **Acht Mehrwort-/Kompositum-Zielformen aus dem Hausbestand entschieden** | `Decision Log` → **Entscheidungsregister** (dasselbe Register, das B1 so gesetzt hat — dieselbe Sache nicht unter zwei Namen, R905; „das Decision Log" → „das Entscheidungsregister" hält das Genus) · `Decision Pack`/`Decision-Pack` → **Entscheidungspaket** (analog Board Pack → Sitzungspaket; der ausgelieferte Dateiname `DecisionPack_<id>.doc` bleibt als Klebeform/E16 unberührt) · `Decision Need`/`Decision-Bedarf` → **Entscheidungsbedarf** (Hauswort) · `Decision Input` → **Entscheidungsgrundlage** (Hauswort, 3 Bestandsstellen) · `Decision-Lifecycle`/`Decision Lifecycle`/`Decision-Lebenszyklus` → **Entscheidungs-Lebenszyklus** (drei Schreibweisen vereinheitlicht; die EN-Werte der früheren Schlüssel waren nicht wortgleich → Cross-Store-Whitelist statt EN-Angleichung, denn die englische Fassung bleibt wortgleich) · `Decision-Velocity` → **Entscheidungsgeschwindigkeit** (E44-Klasse: `Entscheidungs-Velocity` wäre halb deutsch) · `Freigabe-Decision` → **Freigabeentscheidung** (E10-Hausform, zusammengeschrieben) · `Hängt ab von (Decisions)` → **`Hängt ab von (Entscheidungs-IDs)`** (0-Ϯ: die ausgelieferte Spaltenform aus `BM899_SPALTEN` ist die Bindung). |
| **E87** | **Die Kollisions-Klasse (E32): `entscheidungsreif` + Zielform → `beschlussreif`** | „entscheidungsreife Decisions" wäre nach dem Lauf „entscheidungsreife Entscheidungen" — eine Wort-Doppelung. `beschlussreif` sagt dasselbe ohne Doppelung und passt zum vorhandenen „beschlussfähige Vorlage"; **7 Stellen** gemessen, als eigene Regeln vor der nackten. Der TERMINUS `Entscheidungsreife` (Decision Readiness, R899/R907) bleibt unberührt. Dazu die GLOSSE (0-Φ): „Hohes Risiko ohne Entscheidungsbedarf (Decision)" → die Klammer FÄLLT (Handstelle, 2 Träger: dq-Meldung 0140 + Wörterbuch-Schlüssel 0914; der englische Wert behält seine Klammer). |
| **E88** | ⚠⚠ **DER UNTERSTRICH IST KEINE WORTVERBUND-GRENZE — und die Ersetzer-SELBSTPROBE ist der Fänger** | Der Bindestrich zählt für die Wortgrenzen-Prüfung zum Wortverbund (darum brauchen auch Kopfwort-Komposita eigene Regeln, Grund WORTANFANG), der **Unterstrich NICHT**: die nackte Regel griff in den AUSGELIEFERTEN Dateinamen `BM_MVG_Kursunterlagen_Decision_Readiness_und_Entscheidungsvorlages` (E16-Klasse) und benannte ihn um. ⚠⚠ Gefunden hat es **die Selbstprobe des Ersetzers** („jede Schutz-Regel schützt eine Zeichenfolge, die es GIBT"): die R907-Schutzregel für genau diesen Namen wurde durch den Schaden TOT. Geheilt: Name zurückgedreht (beide Demo-Quellen), Schutz-Regel im B2b-3h-Block ERNEUT, und die Lauf-Zahl nach 0-Ѐ **neu simuliert** (der ausgelieferte Regelsatz gegen den Vorzustand: **1.303 in 183 Dateien**, nicht die 1.329 des verworfenen ersten Laufs). ⇒ *E16-Schutzregeln reisen nicht zwischen Bündeln — sie stehen je Bündel erneut, wie die Norm-Namen (E84).* |
| **E89** | ⚠⚠ **`_enheil.js 8b00e8b` WAR SEIT R898 ROT — sieben Releases buchten „0 bewegt"** | Die `de`-Eigenschaft eines `{de,en}`-Paares ist für `paareRoh` ein Paar wie jedes andere: die Bewegung der DEUTSCHEN Hälfte (`\nAgenda:\n` → `\nTagesordnung:\n`, R898/B2b-1b im Mail-Fragment 0938) galt dem Werkzeug als bewegte ENGLISCHE Wert-Seite — `bewegt: 1`, Exit ROT, in jedem Release seit R898 (an R898/R901/R905/R906/R907 nachgemessen). Die gebuchten „0 bewegt" stammten aus Läufen gegen den jeweiligen VOR-Release-Stand, in dem die Alt-Bewegung unsichtbar ist. **Geheilt an der Wurzel**: ein `de`-Riegel (nur `en`-Eigenschaften sind englische Wert-Seite; die en-Zwillinge bleiben voll geprüft). Der eine verbleibende VERWORFENE ist eine belegte Alt-Handänderung (Handbuch-Glossar „von Accountable bis Variance" → „von A bis Z", beidseitig bewusst). ⇒ **Wer eine Zeugen-Zahl bucht, nennt den Aufruf mit** — dieselbe Messung mit anderem Referenz-Commit ist ein anderer Zeuge (die CLAUDE.md-7b-Klasse „Definition mitliefern", am eigenen Zeugensatz). |
| **E90** | **Drei weitere Instrumente auf ihr erstes Bündel festgenagelt (0-Ϩ, dritter Fall der Klasse)** | `_b2b3a_gross.js` führte die FORMEN hart kodiert (nur `verantwortliche Rolle`) und meldete für jede spätere klein beginnende Zielform „GESAMT 0" — eine leere Frage als Entwarnung; erweitert um `wichtigste Entscheidungen` (5 Stellen an Zeichenketten-Anfängen geheilt, Folgelauf 0). Die **Demo-Lint-KPI-Liste** (`KPIS_OK`, `_check_demo.js`) kannte die neuen KPI-Werte nicht und meldete den eigenen Fortschritt als Fehler — exakt die in ihrem eigenen Kopf dokumentierte Klasse; nachgezogen (Alt-Formen bleiben für Fremdpakete, wie beim EAC-Paar). Und die Grammatik-Tabellen (`kompgenus`/`nachfeld`/`zielgenus`) sind je Bündel nachgezogen — die Grammatik-Lage ist dabei GEMESSEN statt geglaubt: das Haus behandelt `Decision` vor deutschen Begleitwörtern durchgehend **weiblich**; die „ein/das Decision"-Belege der E80-Buchung (198 GENUS / 123 ADJ) waren sämtlich Komposita mit eigenem Kopfwort (`ein Decision Need` → `ein Entscheidungsbedarf`). Vorfeld-Regeln brauchte nur `Top-Decisions` (Dativ: „zu den wichtigsten Entscheidungen"). |

| **E91** | ⚠⚠ **Die adversarialen Durchgänge fanden den Wert HALB GEWANDERT — in drei Schreibformen, die kein Anker kannte** | Der E85-Entscheid („`actions[].source` bleibt") war im ersten Lauf an drei Stellen VERLETZT, und alle drei Netze meldeten grün: **(a)** der **Modul-Zwilling** der Auswahlliste (`registerdefs.ts`, TS-Quoting mit Leerzeichen) bot `Entscheidung` zur Auswahl an, während die Wert-Tabellen englisch lesen — der Schutz-Anker trug nur die kompakte Legacy-Schreibweise; **(b)** die **DATEN-Form** `"source":"Decision"` (JSON, ×10 in beiden Demo-Quellen) wanderte — der Demo-Stand trug einen Wert, den seine eigene Auswahlliste nicht kennt, und der KO-Pin maß nur die Code-Form `source:'…'`; **(c)** die zwei **LESER-TabellEN** (`map` 0003:3728 · `BM819_SRC` 0817:48) verloren ihren `Decision`-Schlüssel — `map['Decision']` wäre für jeden Bestandsstand `undefined` gewesen (sourceId-Referenzwahl weg, bm819-Migration tot). Geheilt: Modul-Zwilling und Daten zurückgedreht, die Leser-Tabellen führen BEIDE Schlüssel (Risk/Risiko-Hausform), drei neue Schutz-Anker (TS-Form · Daten-Form · Tabellen-Schlüssel), der deep-KO-Pin misst jetzt beide Quoting-Formen, Lauf-Zahl nach 0-Ѐ neu simuliert (1.303). ⇒ **Ein Wert hat so viele Schreibformen, wie es Träger gibt — ein Anker je Schreibform, und der KO-Pin misst jede.** Dazu aus denselben Durchgängen: die **Leerzeichen-Schwester** `Top Decisions` fiel an die nackte Regel („Top Entscheidungen", Deppenleerzeichen — die E82-Klasse in Gegenrichtung; jetzt eigene Regeln, positionsscharf `Wichtigste/wichtigste Entscheidungen`) · die **Bindestrich-Ellipse** `Top-Decisions/-Risiken/-Frühwarnungen` hing nach dem Lauf an einem Kopf, den es nicht mehr gibt (aufgelöst: „wichtigste Entscheidungen, Top-Risiken und Top-Frühwarnungen") · **CRLF-Kollateral**: zwei Handstellen-Heilungen schrieben CR-Bytes in LF-Blöcke (130 CR im Generat; `.gitattributes` hätte sie beim Commit gestrippt und die GENERAT-FRISCHE auf jedem Frisch-Checkout zerrissen) · `_demo_sanitize.js` säte den ALTEN KPI-Namen zurück · der Modul-Block-Byte-Pin (H-R828c) und die Phase-5-Bilanz (`deep-Soll`) waren nicht nachgezogen. |

### ⚠⚠ S5 — 2026k WIDERRUFT eine frühere Terminologie-Entscheidung (R572)

**Sachverhalt.** Release **R572** (25-Punkte-Programm, Bündel ⑨) hat den Begriff
seinerzeit bewusst in die **Gegenrichtung** umgestellt: *„Action" statt
„Maßnahme"*, als Komplettumstellung über Oberfläche, Exporte, Dokumentation und
Demo-Daten. Der Tiefen-Test friert das seither ein — unter anderem mit der
Auflage, dass der **Demo-Datenstand „Maßnahme"-frei** ist.

Der Auftrag von 2026k verlangt das Gegenteil: `Action Log → Maßnahmenregister`.

**Entscheid.** Der aktuelle Owner-Auftrag ist eindeutig und **sticht R572**. Die
betroffenen Prüfvektoren werden **gedreht**, nicht umgangen — jede gedrehte
Stelle nennt R572 als Vorgänger, damit die Umkehr im Bestand auffindbar bleibt
und nicht als Versehen erscheint.

**⚠ Offener Punkt für den Owner (Empfehlung, nicht selbst entschieden):**
Die Liste nennt nur `Action Log`. Damit entsteht eine sichtbare Inkonsistenz —
das Register heißt künftig **Maßnahmenregister**, während benachbarte
R572-Begriffe englisch bleiben:

| bleibt (nicht auf der Liste) | Ort |
|---|---|
| `Action-Plan` | Überschrift der Maßnahmen-Übersicht |
| `Action-Übersicht` | `REGISTER_THEMES.actionsplan.title` |
| `Action` als Wert im Schnellerfassungs-Menü | Smart-Paste-Auswahl |
| `Actions` / `Mitigations` in den Demo-Texten | Beispielinhalte |

**Empfehlung:** diese vier mitziehen (*Maßnahmenplan*, *Maßnahmen-Übersicht*,
*Maßnahme*, *Maßnahmen/Risikominderungen*) — sonst steht in derselben Ansicht
„Maßnahmenregister" über einer „Action-Übersicht". Bis zur Owner-Antwort bleiben
sie nach E11 („streng nur die Liste") unverändert.

---

## §2 Begriffs-Zuordnung (sichtbarer Text)

Maßgeblich ist die Owner-Liste. Spalte *Kontext* löst E4 auf.

### 2.1 Navigation (E3 — exakt, kurz)

| bisher | Navigation |
|---|---|
| Decision File | **Entscheidungsvorlage** |
| Early Warning Log | **Frühwarnung** |
| Issue Log | **Problem** |
| Action Log | **Maßnahme** |
| Change Log | **Änderung** |
| Risk Register | **Risiko** |
| Readout | **Managementbericht** |
| Decision Backlog | **Entscheidung** |
| Gate-Katalog | **Phase** |

### 2.2 Register (Überschriften, Fließtext, Hilfe, Ausgaben)

| bisher | Registerform |
|---|---|
| Early Warning Log | **Frühwarnungsregister** |
| Issue Log | **Problemregister** |
| Action Log | **Maßnahmenregister** |
| Change Log | **Änderungsregister** |
| Risk Register | **Risikoregister** |
| Decision Backlog | **Entscheidungsregister** |
| Gate-Katalog | **Phasenregister** |
| Decision File | **Entscheidungsvorlage** |
| Readout | **Managementbericht** |

### 2.3 Fachbegriffe

| bisher | neu | Kontext |
|---|---|---|
| Decision | Entscheidung | |
| Decision ID | Entscheidungs-ID | |
| Decision Readiness | Entscheidungsreife | |
| Decision Principles | Entscheidungsgrundsätze | |
| Gate | **Freigabepunkt** | E7 — vollständig; „Gate G3" → „Freigabepunkt P3" |
| Gate Review / Gate-Review | Freigabeprüfung | |
| Gate Set | Phasen- und Freigabemodell | |
| Go / No-Go | Freigeben / nicht freigeben | **nur Anzeige** (E2) |
| Go with Conditions | Freigabe mit Auflagen | **nur Anzeige** (E2) |
| Readiness Check | Reifegradanalyse | |
| Readiness | Reifegrad | |
| Maturity Assessment | Reifegradbewertung | |
| Runbook | Betriebshandbuch | |
| Handover | Übergabe | |
| Guardrails | Rahmenbedingungen | |
| Audit Trail / Audit-Trail | Nachweiskette | Spalte: *Nachweiskette*; Fließtext: *Prüfpfad/Nachweiskette* (E4) |
| Single Source of Truth | zentrale Datenquelle | |
| Evidence | Nachweis | |
| Evidence & Links | Nachweise & Verknüpfungen | |
| Owner | Verantwortlich / verantwortliche Rolle | Spalte kurz, Fließtext lang (E4) |
| Timeline | Zeitachse | |
| Trend Analytics / Trend-Analytics | Trendanalyse | |
| Snapshot | Momentaufnahme | |
| Heatmap | Bewertungsmatrix | |
| Burndown | Abarbeitungsverlauf | |
| Drilldown | Detailansicht | |
| Drawer | Detailbereich | |
| Quick Filter | Schnellfilter | |
| Feature | Funktion | |
| Setup | Einrichtung | |
| Onboarding | Einführung | |
| Role Onboarding | Rolleneinführung | |
| Preflight Check | Vorprüfung | |
| Board Pack | Sitzungspaket | |
| Traceability | Nachverfolgbarkeit | |
| Role Health | Rollenstatus | |
| Cadence Adherence | Rhythmustreue | |
| Reporting | Berichterstattung | |
| Forecast | Prognose | |
| Forecasting | Prognoseerstellung | |
| Actuals | Ist-Kosten | |
| Commitments | gebundene Kosten | |
| Forecast to Complete | Restkostenprognose | |
| Estimate at Completion | erwartete Gesamtkosten | |
| Variance | Abweichung | |
| Contingency | Risikoreserve | |
| Scope | **Umfang** | ⚠ E74 (R906) ersetzt die E4-Wortwahl: die Spalte heißt seit R899 `Umfang` und die eingefrorene Migrationstabelle `BM899_SPALTEN` bindet daran; `Projektumfang` kommt im Bestand NULL mal vor. Wo der Bestand `Leistungsumfang` führt, bleibt dieses stehen. |
| Impact | Auswirkung | |
| Mitigation | Risikominderung | |
| Residual Risk | Restrisiko | |
| Change Control | Änderungssteuerung | |
| Claim Control | Nachtragssteuerung | |
| Long-Lead Item | Komponente mit langer Lieferzeit | |
| Stakeholder | Beteiligte | |
| Sponsor | Projektauftraggeber | |
| Lessons Learned | Erkenntnisse | |
| Backlog | Arbeitsvorrat | |
| Deliverable | Ergebnis | |
| Template | Vorlage | |
| Tool | Werkzeug | |
| Rollout | Einführung | |
| Workbench | Arbeitsumgebung | |
| Guidance | Anwendungshilfe | |
| Review | Prüfung | |
| Meeting Manager | Sitzungsverwaltung | |
| Agenda | Tagesordnung | |
| Timebox | Zeitrahmen | |
| Backup | Sicherung | |
| Diff / Merge | Abgleich / Zusammenführung | |
| Topbar | Kopfzeile | |
| Best Practice | Praxistipp | |
| Trigger | Auslöser | |
| Severity | Schweregrad | |
| Score | Punktwert | |
| Gap Map | Lücken | |
| Governance Gap Map | Governance-Lücken | |
| Cross-Project | projektübergreifend | |
| Best/Worst Performer | stärkste / schwächste Projekte | |
| Side-by-side | nebeneinander | |
| Inline Edit | direkte Bearbeitung | |
| Strict Mode | strenger Berechtigungsmodus | |
| Hard Block | Sperre | |
| Opt-in | freiwillige Aktivierung | |
| Badge | Kennzeichnung | |
| Chip | Markierung | |
| Tooltip | Kurzinfo | |
| Light/Dark Mode | Hell-/Dunkelmodus | |

### 2.4 Bewusst beibehalten

**Governance** (zentraler Fach- und Positionierungsbegriff, Auftrag Regel 4) ·
**Minimum Viable Governance (MVG)** · **MVG Companion** · **MVG-Charter** ·
**RACI**, **PMO**, **ESG**, **LCC**, **KPI**, **CTC**, **EAC**, **FID**, **BPMN**
(Auftrag Regel 5) · **G0–G9 als Zeitraum-Bezug LPH** bleibt „LPH 0–9" ·
außerhalb der Liste (E11): Portfolio, Dashboard, Charter, Board, Baseline,
Compliance, Print-Center, Workspaces, Hub, Kickoff, Milestone.

### 2.5 Zusammensetzungen mit eigener Regel

Gemessen 1.668 Stellen. Die häufigsten brauchen eine eigene Form, weil ein
stumpfes Ersetzen grammatisch falsche Wörter erzeugt:

| Form | Anzahl | neu |
|---|---|---|
| Decisions | 481 | Entscheidungen |
| Gates | 389 | Freigabepunkte |
| Snapshots | 145 | Momentaufnahmen |
| Readouts | 108 | Managementberichte |
| Decision Files | 102 | Entscheidungsvorlagen |
| Templates | 37 | Vorlagen |
| Mitigations | 32 | Risikominderungen |
| Risiko-Reviews / Risk-Reviews | 43 | Risikoprüfungen |
| Tools | 30 | Werkzeuge |
| Gate-Reviews | 23 | Freigabeprüfungen |
| Top-Decisions | 19 | wichtigste Entscheidungen |
| Ownern / Owners | 24 | Verantwortlichen |
| Domänen-Scores | 13 | Domänen-Punktwerte |
| Tooltips | 11 | Kurzinfos |
| Deliverables | 11 | Ergebnisse |
| Timeboxen | 9 | Zeitrahmen |
| Mitigationsplan | 8 | Plan zur Risikominderung |
| Management-Readouts | 7 | Managementberichte |

---

## §3 Kennungs-Zuordnung (E13–E25)

| bisher | neu | Daten | Code | Klasse |
|---|---|---|---|---|
| `G0`–`G9` | `P0`–`P9` | 1.563 gesamt | | Freigabepunkt-Marke |
| `GATE-` | `PHASE-` | 292 | 31 | Präfix |
| `DEC-` | `ENT-` | 496 | 53 | Entscheidung |
| `RSK-` | `RIS-` | 248 | 82 | Risiko |
| `EW-` | `FRW-` | 166 | 73 | Frühwarnung |
| `CHG-` | `AEN-` | 65 | 4 | Änderung |
| `ACT-` | `MAS-` | 152 | 22 | Maßnahme |
| `EVD-` | `NAC-` | 136 | 2 | Nachweis |
| `CAL-` | `KAL-` | 62 | 14 | Kalender |
| `ROLE-` | `ROL-` | 1.551 | 1.555 | **eigenes Bündel (S3)** |
| `THR-` | `SWL-` | 9 | 11 | Schwellenwert |
| `CLT-` | `KVL-` | 3 | 30 | Kundenvorlage |
| `CTC-`, `RACI-` | *bleiben* | | | Fachkürzel (Regel 5) |
| übrige 17 Präfixe | *bleiben* | | | nicht im Schnitt (E14) |
| `ROLE-MENTOR` | *bleibt* | | | **Ausnahme E24** |

**`SCH-` ist bereits durch Terminplan-Einträge belegt** — darum `THR- → SWL-`
statt des naheliegenden `SCH-`. Kollisionsfreiheit ist vor jedem Schnitt
mechanisch nachzuweisen.

---

## §4 Die tragende technische Kopplung

**Der deutsche Text IST der Wörterbuch-Schlüssel.** Die englische Fassung entsteht
aus `{"<deutscher Text>":"<englischer Text>"}` in 26 Wörterbuch-Blöcken. Daraus
folgt zwingend:

1. Jede Änderung eines deutschen sichtbaren Textes **entwertet den zugehörigen
   englischen Eintrag still**. Der Text bliebe im englischen Modus deutsch stehen.
2. Der Schlüssel muss darum **im selben Schnitt** mitwandern — der **Wert bleibt
   wortgleich** (Auftrag: „die englische Übersetzung bleibt so wie sie ist").
3. Wo deutscher und englischer Text bisher **identisch** waren (z. B. „Decision
   Backlog"), gab es gar keinen Eintrag. Dort entsteht jetzt ein **neuer**:
   `"Entscheidungsregister" : "Decision Backlog"`.
4. Nach jedem Schnitt: `node _gates_headless.js --only=livesmoke7 --update-i18n-golden`
   und `_i18n_golden.json` mitliefern; dazu die Restbestandsliste
   (`--only=livesmoke9 --update-residue-baseline`).

Zweite Kopplung: **14 Seitenüberschriften stehen im DOM-Golden** — Auffrischung
über `--only=livesmoke --update-golden` gehört in jeden Text-Schnitt.

### 4.1 Das Verfahren ist DREISTUFIG (Entscheid S4, aus B1 erzwungen)

Der Versuch, den Ersetzer so klug zu machen, dass er die englische Seite von
allein verschont, ist **viermal gescheitert** — jedes Mal an einem Format, das
der Bestand längst führt. Das Verfahren trennt darum die Aufgaben:

| Schritt | Werkzeug | Aufgabe |
|---|---|---|
| 1 Ersetzen | `_ersetze.js` | bewusst **großzügig**: jeder sichtbare Text wandert |
| 2 Zurücknehmen | `_dictheil.js` | stellt die **englische Seite** wieder her, paar-lokal entschieden |
| 3 Beweisen | `_engolden.js` | zweiter Zeuge an **anderer Datenquelle** |

**Die vier Formate**, an denen die Erkennung nacheinander blind war:

1. `{"<deutsch>":"<englisch>"}` — Wörterbuch-Blöcke, am **Dateinamen** erkannt (Liste unvollständig)
2. `{"de":"<deutsch>","en":"<englisch>"}` — Block 0937, kein `__bm907S`-Step
3. `["<deutsch>", "<englisch>"]` — Tabellen 0915/0916, kein Schlüssel zum Anknüpfen
4. **einfache Anführungszeichen** — 0853 Chrome-Store, 0894 Assistenten

⚠⚠ Die vierte steht **wörtlich in CLAUDE.md**: „der bm-v856-Chrome-Store ist
SINGLE-quoted (Werkzeuge, die Dict-Paare umschreiben, müssen ALLE Quote-Stile
kennen)."

**Die Regel für Schritt 2 hat zwei Hälften — beide nötig:** links ein deutscher
Anzeigetext (Leerzeichen oder Umlaut, also kein technischer Bezeichner) **und**
rechts etwas, das vorher *erkennbar englisch war*. Nur die erste Hälfte drehte
legitime Verdeutschungen zurück („Managementbericht erstellen" → „Readout
erstellen"); nur die zweite hätte technische Schlüssel getroffen.

⚠ **Die Heuristik hat eine ehrliche Grenze:** „Portfolio Readout" enthält kein
englisches Funktionswort und wurde nicht erkannt — zwei Stellen mussten von Hand
nachgezogen werden. **Gefunden hat sie der zweite Zeuge**, nicht die Heuristik.
Genau dafür ist er da.

---

## §5 Bündelplan

| # | Bündel | Gegenstand | Umfang |
|---|---|---|---|
| **B1** | Navigation & Registertitel | NAV, `REGISTER_DEFS`, 14 Seitenüberschriften, Wörterbuch-Nachzug, DOM-Golden | ~350 |
| **B1b** | Widerruf R572 | `Action-Übersicht`/`Action-Plan` → Maßnahmen-Form, `Gegenmaßnahme` → `Risikominderung` (S5) | 5 Regeln |
| **B1c** | Nachzug Leistungsphase | E29: `Phasenregister` → **Leistungsphase** (115 Stellen, davon 9 von Hand wegen Numerus-/Verbwechsel), Nav-Label, `_navprobe`/`_navwache`; **E31**: Companion-Einführungsphasen → **Etappe** (9 Sichtstellen in zwei Sätzen) | ~130 |
| **B2** | ~~Register-Spalten & Oberflächenlabels~~ → **`Gate` → `Freigabe` (E27)** | ✅ **ERLEDIGT in R895.** Der Schnitt wurde beim Bau auf E27 VERENGT: 1.428 mechanisch (Bestand 1.062 · Modul 74 · Datenstände 103 · Prüfvektoren 189) + 24 + 39 von Hand. Die Oberflächenlabels sind als **B2b** herausgelöst (S11). | erledigt |
| **B2b** | Register-Spalten & Oberflächenlabels | Spaltenüberschriften, Knöpfe, Kennzeichnungen, Kurzinfos, Formulare — der Teil der alten B2-Zeile, der **nicht** `Gate` betraf. Auflagen und Reihenfolge in §9a. | ~1.400 |
| **B2c** | `Artefakt` → `Registerdokument` (E32) | Owner-Auftrag vom 2026-08-24, Zielform per Owner-MC präzisiert. **935 ersetzbare Stellen** von 1.497 (legacy 567 · modul 41 · daten 197 · tests 130), 69 distinkte Wortformen. ⚠ **79 Kollisionszeilen** (beide Begriffe in einer Zeile) einzeln durchsehen — eine Wortregel erzeugt dort Tautologien. Auflagen in E32. | ~935 |
| **B3** | Hilfe, FAQ, Glossar, Schulung | Hilfe-Hub, Schulungsmodule, Rollen-Anleitungen, Glossar (E6: ohne Altbegriffe), Prozess-Steckbriefe | ~3.200 |
| **B4** | Ausgaben | Druck-, Word-, MD-, CSV-Ausgaben und **Dateinamen** (E16); byte-gepinnte Testvektoren nachziehen | ~1.100 |
| **B5** | Scout-Fragenkatalog | 70 Fragen, 63 ausführliche Hilfen; eigene Wächter (7u, Satzmengen-Schnitt) | ~900 |
| **B6** | Demo-Datenstand | 533 kB Beispielinhalte über `_demo_sanitize.js`; Restbestandsliste zwingend | ~2.900 |
| **B7** | Anzeigeschicht Fachwerte | E2: Go/No-Go/Go with Conditions und übrige gespeicherte Werte nur in der Anzeige | ~150 |
| **B8** | Kennungen ohne `ROLE-` | **E28** (ersetzt E13/E14/E20): `G0–G9 → LPH 0–9` in der Anzeige **und** `GATE-<KURZ>-G<n> → LPH-<KURZ>-<n>` im Datenmodell; dazu `DEC-`, `RSK-`, `EW-`, `CHG-`, `ACT-`, `EVD-`, `CAL-`, `THR-`, `CLT-` + Migrationsstufe + Sicherung (E21) + Auffindbarkeit (E22). ⚠ **Auflagen aus der Messung:** 16 Verkettungsklassen (`CHK-GATE-LEGACY-G3-1`, `AUD-GATE-KLINIK-G0`) · der Parser `/G(\d+)\b/` (`0003:3255` + Kopie `wordartefakte.ts:381`) ist **heute schon falsch** und gehört in denselben Schnitt · fünf Parse-Stellen lesen die Kennung aus dem **sichtbaren** Namen · `_check_static.js:1982` pinnt `var ORDER=['G0'…'G9']` wörtlich · `deep-test.html:6905` pinnt die Zeichenzahl von `src/core`+`src/ui` | ~3.300 |
| **B9** | `ROLE-` | S3: eigener Schnitt, Rechte/PIN/Kundenpaket, Ausnahme `ROLE-MENTOR` | ~3.106 |
| **B10** | Kundenpaket | E23 harter Prüfer + S1 Umschlüsselungswerkzeug | ~200 |
| **B11** | Website | Quellen + Auslieferungspaket (E12) | ~500 |
| **B12** | Bilder & Abschluss | Bildschirmfotos neu, Grafikliste, Änderungsliste, Beibehaltensliste | — |

---

## §5a Werkzeuge (`_terminologie/`)

| Werkzeug | Aufgabe | Eigene Probe |
|---|---|---|
| `_scan.js` | klassenscharfe Vorabmessung (TEXT/KOMP/IDNT/ATTR/CODE/KOMM/REGEX) | Selbstprobe, Anzahl gerechnet |
| `_dictfind.js` | **die einzige Paar-Erkennung** — beide Anführungsstile, Objekt- und Array-Form | still beim Import |
| `_ersetze.js` | klassentreue Ersetzung, Bereiche `legacy`/`modul`/`daten`/**`tests`** | Selbstprobe **63/63**, Anzahl gerechnet |
| `_dictheil.js` | stellt die englische Seite wieder her (paar-lokal, zwei Regelhälften) | Trockenlauf zeigt jede Stelle |
| `_dictprobe.js` | Quelltext-Probe **ohne Blockliste**, drei Formate | zwei Vakuum-Riegel |
| `_engolden.js` | **zweiter Zeuge** am Browser-Boot — fand alle vier Blindstellen | Vakuum-Riegel |
| `_navwache.js` | hält die neun englischen Nav-Texte gegen den Sollstand | KO-Drehung beidseitig |
| `_genus.js` | Begleitwörter bei Geschlechtswechsel | reine Messung |
| `_kartenprobe.mjs` · `_ursache.mjs` · `_kartenspur.mjs` | Diagnose des Karten-Wettlaufs | Mehrfachläufe |

**Die neun Werkzeuge aus B2 (R895)** — sie fehlten hier bis R896:

| Werkzeug | Aufgabe | Eigene Probe |
|---|---|---|
| `_b2_inventar.js` | Vorabmessung des Bündels: Fundstellen je Klasse und Wortform | Anzahl gerechnet |
| `_b2_roh.js` | rohe Fundstellenliste vor dem Zuschnitt | — |
| `_b2_rest.js` | **die Rest-Liste**: jede ersetzbare Stelle, die KEINE Regel beansprucht, mit Grund. ⚠ Der Begriff ist seit R896 **Pflicht-Argument** — vorher stand dort ein Vorgabewert `Gate`, der in jedem künftigen Bündel weiter `Gate` maß und folgerichtig „keine Regel = 0“ meldete, ohne dessen Begriff je angesehen zu haben | Aufruf ohne Begriff = ROT (Exit 2) |
| `_b2_hand.js` · `_b2_hand2.js` | die Stellen, die keine Wortregel trifft (24 + 39) | 24/24 · 44/44 |
| `_b2_halbiert.js` | halbierte Prüfvektoren (Regex-Literale, Eigenschafts-Zugriffe) | — |
| `_b2_englobal.js` | **blocklisten-freier fünfter Zeuge** für die englische Seite | 7/7 |
| `_b2_englisch.js` | englische Seite gegen den Vorstand. ⚠ Sein erster Wurf konnte per Bauart NIE anschlagen (aus `` wurde über ein Heredoc das Steuerzeichen U+0008) und meldete grün, während vier bekannte Schäden vor ihm lagen | 6/6, **mit KO-Drehung** |
| `_b2_schaden.js` | misst die SCHADENS-Zahlen (nicht die Mengen) gegen den Stand vor dem Schnitt, mit ausgeschriebener Definition | reproduzierbar gegen HEAD |

**Reihenfolge in jedem Bündel:** messen → ersetzen → heilen → bauen → beweisen
(Quelltext-Probe **und** zweiter Zeuge) → Goldens → Prüfläufe.

## §6 Auflagen, die in jedem Bündel gelten

1. **Vorabmessung vor dem Schnitt** (`node _terminologie/_scan.js`) — der Zuschnitt
   gründet auf gemessenen Zahlen, nie auf Schätzung.
2. **Klassentreue**: nur die Klasse TEXT wird angefasst. CODE, IDENT, ATTR, KOMM
   und REGEX bleiben (E15). Das Werkzeug erzwingt das; ein Schnitt, der eine
   andere Klasse berührt, ist rot.
3. **Wörterbuch-Nachzug im selben Schnitt** (§4). Ein Schnitt ohne Nachzug ist
   unvollständig, auch wenn alle Prüfungen grün sind.
4. **16 Gates + Negativproben-Sammellauf + adversarialer read-only-Review** vor
   jeder Freigabe (`CLAUDE.md` Regel 5 und 7).
5. **Nachweisketten-Hinweis** (E18): der Ansichtskopf der Nachweiskette trägt ab
   B8 eine datierte Zeile, dass Kennungen vor der Umstellung dem alten Schema
   folgten und mitgeführt wurden.
6. **Keine Umbenennung ohne Grammatikprobe**: das Ergebnis muss im Satz stehen
   können. Zusammensetzungen (§2.5) haben eigene Formen.

---

## §7 Stop-Kriterien

Anhalten und berichten statt stumm weiterlaufen bei: Datenverlust- oder
Sicherheitsrisiko · einer Prüfung, die nach Kontrollmessung rot bleibt · einem
Befund, der das Zielbild in Frage stellt · einer Umbenennung, die fachlich
mehrdeutig wird und in §2 keine Antwort findet.

---

## §8 Bündelstand

| Bündel | Stand | Release |
|---|---|---|
| Vorbereitung | ✅ neun Werkzeuge mit Selbstproben, Vorabmessung, SSOT | — |
| **B1** Navigation & Registertitel | ✅ abgeschlossen | R894 |
| **B1b** R572-Widerruf (Action → Maßnahme) | ✅ abgeschlossen | R894 |
| **B1c** Nachzug Leistungsphase (E29/E31) | ✅ abgeschlossen | R894 |
| **B2** `Gate` → `Freigabe` (E27) | ✅ **abgeschlossen** — 1.428 mechanisch · 24 + 39 von Hand · **182** belegt geschützt (181 beim Zuschnitt) · **fünf** Zeugen (`_engolden` · `_lprobe` · `_enheil` · `_b2_englobal` · `_b2_englisch`) | **R895** |
| **B2c** `Artefakt` → `Registerdokument` (E32) | ✅ **abgeschlossen** — 844 mechanisch · **10** von Hand (4 sachliche Widersprüche + 3 tote Bestands-Regexe + 3 Prüfvektor-Regexe; `_b2c_hand.js`, Selbstprobe 40/40) · 81 belegt geschützt · Rest 0 (beide Wortformen) · drei blocklisten-freie EN-Zeugen + EN-Golden-Wertmenge identisch | **R896** |
| **B2b-1a** „Die Übergabe" (`Handover` → Übergabe · `Runbook` → Betriebshandbuch) | ✅ **abgeschlossen** — 606 mechanisch · **33** von Hand über neun Klassen (A Wert-Ebene 11 · C Tautologien 10 · D Wörterbuch-Nachzug 6 · E Genus 2 · F Großform 1 · G Anzeige-Kanon 1 · H Rückwärts-Heuristik 2 · J Kasus 1; `_b2b_hand.js`, Selbstprobe 11/11 mit differenzieller KO-Drehung) · **5 Schutz-Regeln** auf die WERT-Ebene · Rest **0** (beide Begriffe) · 11 verbleibende Stellen = exakt die Schutzmenge · zwei blocklisten-freie EN-Zeugen grün. **⚠⚠ Zentraler Befund: eine entwertete Abwärtskompatibilität** — der Lauf benannte die Synonym-Tabelle `0814-bm-v816-owner.js:27` mit um und hätte bei Bestandsständen Owner-Dubletten erzeugt; **kein Gate wurde rot**, und die Erwartung des zuständigen Prüfvektors `R763/P18 (b)` wurde vom selben Lauf mit angepasst. Gefunden von der eigens gebauten Probe `_b2b_altnamen.js`. Messbericht `_terminologie/messung_b2b1a.md` | **R897** |
| **B2b-1b** „Die vier schweren" (`Heatmap` → Bewertungsmatrix · `Agenda` → Tagesordnung · `Audit-Trail`+`Audit Trail` → Nachweiskette · `Variance` → Abweichung) | ✅ **abgeschlossen** — 680 mechanisch · **58** von Hand über zehn Klassen (A englische Wert-Seite 4 · C Tautologien 3 · S sachlich falsch 1 · D Wörterbuch-Nachzug 3 · R halbierte Vektoren 8 · E Escape-Klasse 5 · **X Funktionsausfall 1** · **G Grammatik 17** · **V Review-Befunde 12** · **P Schema-Pins 4**; `_b2b1b_hand.js`, Selbstprobe 14/14) · Rest **0** für alle fünf Begriffe · Trockenlauf danach **0**. **⚠⚠ Zentraler Befund: kein Text, sondern ein GESPEICHERTER VERGLEICHSWERT** — `thresholds[].kpi` wird mit `===` verglichen; im Quellbaum wanderten alle Seiten gemeinsam, ein Bestands-Stand hätte die Schwellenwert-Regel stillschweigend verloren, **ohne dass ein Gate rot wird** (die Gates fahren frische Stände). Geheilt per Leiter-Stufe **2.23.0 → 2.24.0** (`bm961WertKanon`). Dazu **drei Regex-Literale im Bestandscode**, die nach dem Lauf nichts mehr treffen (Portfolio-Schwelle · Audit-Export-Zuständigkeit · Dashboard-Kartenverlinkung) — gefunden von `_b2_halbiert.js`. **Zwei neue Trägerformen** (9./10. nach R894): `de:`/`en:` als Objekt-Eigenschaften und die **Escape-Klasse** `\nWort` (CAMEL-Fehlgriff). **Vier Werkzeuge waren auf B2b-1a festgenagelt** und meldeten grün für ein Bündel, das nicht mehr lief. Messbericht `_terminologie/messung_b2b1b.md` | **R898** |
| **B2b-1c** „Die sieben leichten" (`Actuals` → Ist-Kosten · `Sponsor` → Projektauftraggeber · `Mitigation(s)` → Risikominderung(en) · `Best Practice` → Praxistipp · `Severity` → Schweregrad · `Decision Readiness` → Entscheidungsreife) | ✅ **abgeschlossen** — 644 mechanisch · **12** von Hand über vier Klassen (C Tautologien 3 · D Wörterbuch-Nachzug 4 · E Escape-Klasse 1 · L Spaltenköpfe 4; `_b2b1c_hand.js`, Selbstprobe 8/8) · Rest **0** für alle sieben Begriffe · Trockenlauf danach **0** · zwei blocklisten-freie EN-Zeugen grün. ⚠⚠ **Zentraler Befund: die ELFTE Trägerform englischen Textes** — der ternäre Zweig als OBJEKT-Literal (`en ? {…} : {…}`); aus `Schweregrad:'Severity'` wurde `Schweregrad:'Schweregrad'`, die englische Fassung war **still weg**, und gefunden hat es die Tautologie-Probe, kein Riegel. ⚠ Dazu die **Umfeld-Heilung** (E43), die `AGENDA_TEMPLATES` nach fünf Bündeln erstmals erreichbar machte — und `_dictheil.js`, das sie im selben Schritt wieder zurückdrehen wollte | **R899** |
| **B2b-1d** „Die Spaltenköpfe und die vier Owner-Punkte" (E39–E42) | ✅ **abgeschlossen** — **151 Spaltenköpfe** an zwei Trägerformen + 17 Nav-Schlüsselstellen + der Flex-Fix des Aufklapp-Pfeils + die Freigabe-Namen `LPH <n>` mit Leiter-Stufe **2.24.0 → 2.25.0**. Live nachgemessen bleiben von 32 englischen Spaltenköpfen **zwei** (`Risk-Review`, `Change-Board` — gespeicherte Fachwerte, S12 → B7). ⚠⚠ **Zentraler Befund: eine Umbenennung kann ein WERKZEUG-VERZEICHNIS entwerten** — die 7x-Anker sind Zeilennummern, und ein Lauf, der Kommentare einfügt, verschiebt **392** davon über **drei Träger** in **fünf Formen**. `_ankerschub.js` (neu) zieht sie nach; sein Bau hat vier eigene Fehlerklassen offengelegt (Inhalts- statt Positions-Abgleich · mehrdeutige Zeilen als Evidenz · zwei Regeln über demselben Text · fehlende Idempotenz) | **R899** |
| **B2b-2** „Die Restmenge" (20 Begriffe) | ✅ **abgeschlossen** — 361 mechanisch · 12 von Hand · Rest **0** · alle sechs EN-Zeugen grün (E45–E48) | **R900** |
| **B2b-3a** „Der Verantwortliche" (`Owner`, `Ownern`) | ✅ **abgeschlossen** — 920 mechanisch · 263 Großschreibungen · 23 RACI-Positionen · 12 Handstellen · Rest 2 (Grund WORTENDE) (E49–E51) | **R901** |
| **B2b-3b** „Die Fachbegriffe" (10 Begriffe / 13 Formen) | ✅ **abgeschlossen** — **422 mechanisch** in 74 Dateien · **6 Handstellen** (alle der Klasse REGEX-BINDUNG) · Rest **0** für alle 13 Formen · alle sechs EN-Zeugen grün. ⚠⚠ **Zentraler Befund: 230 der 309 nackten `Forecast`-Stellen waren gar kein Fließtext**, sondern der Registername `CTC / Forecast` — Schlüssel in vier Nachschlagetabellen und gespeicherter Wert (E52, S12 → B7). ⚠⚠ **Zweiter Befund: `_b2_halbiert.js` suchte zeichen- und groß/klein-genau** und meldete darum EINE Stelle, wo der neue Durchgang SIEBEN weitere findet (`/Dom.nen-Scores/i` mit Umlaut-Platzhalter · `/ctc|forecast|…/` kleingeschrieben) — vier davon echte stille Funktionsausfälle; geheilt ist das Werkzeug (Durchgang (a3)) und die Fundstellen (`_b2b3b_hand.js`) — ⚠ und die Heilung selbst musste ENG gefasst werden: die blanke Alternative `prognose` hätte 19 Beschriftungen NEU gefangen, zwei Heilungen entfielen ganz. Vier neue Werkzeuge: `_b2b3b_vorfeld.js` · `_b2b3b_kompgenus.js` · `_b2b3b_nachfeld.js` · `_b2b3b_hand.js` (E52–E58) | **R902** |
| **B2b-3c** „Die Prüfung" (`Review`) | ✅ **abgeschlossen** — 113 mechanisch · **32 Handstellen** in fünf Klassen · Rest **0** · alle sechs EN-Zeugen grün. ⚠⚠ **Zentraler Befund: VIER tote Beschriftungs-Regexe früherer Bündel** (`/heatmap/` R898 · `/action|…|burndown/` R900 · `/gate/` R895 · `/readout/` R894) — sie lagen unter der **Rauschgrenze der eigenen Kontrolle**: `_b2_halbiert.js` übersprang Begriffe unter FÜNF Buchstaben, und `Gate` hat vier. ⚠⚠ **Zweiter Befund: eine Heilung wird VERENGT, nicht geweitet** — `Freigabe` stand schon vor B2 624-mal im Bestand, die blanke Alternative reißt 167 Beschriftungen aus ihrem richtigen Register (E59–E64) | **R903** |
| **B2b-3d** „Die Momentaufnahme" (`Snapshot`, `Snapshots`) | ✅ **abgeschlossen** — 337 mechanisch in 71 Dateien · **20 Handstellen** in vier Klassen · Rest **0** · alle sechs EN-Zeugen grün. ⚠⚠ **Erste Umbenennung des Programms, deren ZIELFORM schon vergeben war** (`Momentaufnahme` 27-mal als Katalog-Schlüssel, dazu `Berichtspunkt` als zweites Hauswort, beide als GLOSSE nebeneinander). ⚠⚠ **Zweiter Befund: alle vier Grammatik-Instrumente messen VOR dem Lauf** — die Frage „ist der Text jetzt richtiges Deutsch?" stellte kein Werkzeug; gemessen kostete das neun falsche Begleitwörter aus B1/B2, zehn Releases lang bei grünen Gates (E65–E68) | **R904** |
| **B2b-3e** „Der Detailbereich" (`Drawer`) | ✅ **abgeschlossen** — 152 mechanisch in 43 Dateien · **24 Handstellen** in zwei Klassen · Rest **82** (sämtlich Werkzeugsprache des Prüfbestands, jede mit Grund) · alle sechs EN-Zeugen grün. ⚠⚠ **Zentraler Befund: die VERWAISTE KLEBEFORM** — sie fällt durch alle drei Netze des Programms zugleich (beide Wortgrenzen · zeichengenaue Messung · case-sensitiver Ersetzer); sechs Formen aus VIER Bündeln, vier davon mit ausgewiesenem „Rest 0" (E69–E73) | **R905** |
| **B2b-3f** „Der Umfang" (`Scope`) | ✅ **abgeschlossen** — 133 mechanisch in 39 Dateien · **6 Handstellen** in drei Klassen (davon **3 wirksam**, 3 historisch) · Rest **0** · alle sechs EN-Zeugen grün. ⚠⚠ **Zentraler Befund: die ZIELFORM stand im eigenen Werkzeugkasten falsch** — `Projektumfang` kommt im Bestand NULL mal vor, während die Spalte seit R899 `Umfang` heißt und die eingefrorene Migrationstabelle `BM899_SPALTEN` daran bindet. ⚠⚠ **Zweiter Befund: wer einen WERT schützt, muss auch seine ERWÄHNUNG schützen** — der Spaltenkopf-Tooltip nannte nach dem Lauf eine Auswahl, die es nicht gibt (E74–E76) | **R906** |
| **B2b-3** Rest der SONDERFÄLLE (19 Formen Entwicklersprache) | offen — `node _terminologie/_b2b3_offen.js` vor jedem Zuschnitt (Auflage 0-ο), danach `_b2b_jargon.js`, `_b2b_schwere.js --buendel=<B>` und **seit R906 `_b2b_zielabgleich.js`** (0-Ϯ). ⚠ Diese Tabelle stand nach R902 **drei Releases still** — B2b-3c/3d/3e fehlten hier, obwohl sie gelaufen waren; nachgetragen in R906 | — |
| **B2b-3g** „Der Punktwert und der Reifegrad" (`Score` + `Readiness`) | ✅ **abgeschlossen** — 491 mechanisch + 4 Handstellen, Rest 0, Leiter 2.25.0 → 2.26.0, E77–E82. ⚠ Diese Zeile stand bis R908 auf „läuft in R907" — die eigene Tabelle war einen Release stale (dieselbe Klasse, die sie in ihrem Kopf für B2b-3c/3d/3e beschreibt) | **R907** |
| **B2b-3h** „Die Entscheidung" (`Top-Decisions`/`Decisions`/`Decision`) | ✅ **abgeschlossen** — 1.303 mechanisch in 183 Dateien (0-Ѐ-simuliert gegen den Vorzustand) + 16 Handstellen in fünf Klassen (REGEX-BINDUNG · VEKTOR · GLOSSE ×2 · GRAMMATIK ×7 · NACHLESE ×5) + 5 Großschreibungen · Rest 0 mit Grund (3 WORTENDE = zusammengesetzte Vektor-/Kommentar-Fragmente · 1 JARGON · 1 FREMD-GEDECKT) · Leiter 2.26.0 → 2.27.0 (dritte WERT-Kanon-Generation, der doppelt gebundene KPI-Wert wandert KOMPLETT, E83) · alle sechs englischen Zeugen grün · E83–E91 | **R908** |
| **B2b-3i** „Der Nachweis" (`Evidence` + `Opt-in`) | ✅ **abgeschlossen** (R909) — **84 mechanisch** (79 `Evidence` + 5 `Opt-in`/`opt-in`, gemessen als Differenz gegen den Vorzustand) + **5 Handstellen** (anker-unmögliche Stellen, `_b2b3i_hand.js`), Rest **0**, Tautologie 0 · Klebeform 0 · halbierte Vektoren 0 · Zielgenus 0 bei 169 Dateien Deckung · `_enheil` gegen HEAD 0/0. Entscheide **E92–E95**. ⚠ `Gap Map` ist mit E92 herausgenommen. | — |
| **B2b-3j** „Die Lücke" (`Gap Map` + `Governance Gap Map`, dazu `Gap-Map`/`Governance-Gap-Map` und der ungeführte Nachbar `Gap`/`Gaps`) | **GEBUCHT** (E92, R909) — Leerzeichenform 7 (real 2 deutsche Stellen) · `Gap-Map` 87 · `Governance-Gap-Map` 28 · `Gaps` 130 · Kennung `gapmap` 54 (bleibt, B8). ⚠ Die SSOT-Zielform `Governance-Lücken` ist gemessen VERGEBEN (0016:266/287, andere Bedeutung) — der Zielform-Entscheid steht beim Zuschnitt an. | — |
| B3–B12 | offen | — |

---

## §9 ⚠⚠ HIER GEHT ES WEITER — Stand 2026-08-24 (nach R895)

⚠⚠ **R895 IST GEBAUT UND BELEGT, ABER NICHT COMMITTET** (Chat-Übergabe 2026-08-24).
Bündel **B2** (`Gate` → `Freigabe`, Entscheid E27) ist vollständig gebaut; ein Prüflauf war
grün, der darauffolgende zeigte `Parität 263/2` — Kontrollmessung offen. Kein Tag, kein Push.
Die offene Liste steht in `HANDOFF.md` unter „⇢⇢ STAND FÜR DEN NEUEN CHAT". R894 (B1 + B1b + B1c) bleibt wie in §9-alt beschrieben;
seine Lehren stehen unverändert weiter unten.

### Was in R895 steht

| Beleg | Ergebnis |
|---|---|
| Textumstellung B2 | **1.428 mechanisch** (Bestand 1.062 · Modul 74 · Datenstände 103 · Prüfvektoren 189) |
| Hand-Edits | **24** (`_b2_hand.js`, Begleitwort + Adjektiv) + **39** Nachlauf (`_b2_hand2.js`) |
| bewusst geschützt | **181** beim Zuschnitt, **182** im Ist — über 11 Schutz-Regeln, jede mit Grund im Regelwerk |
| Rest ohne Regel | **88** beim Zuschnitt (`WORTANFANG` 64 · `WORTENDE` 18 · `JARGON` 6), **86** im Ist (63 · 17 · 6) — je mit benanntem Grund, **„keine Regel" = 0** |
| Englische Fassung unverändert | **fünf** Zeugen grün: `_engolden` · `_lprobe` 822/9 Formen · `_enheil` 37 Dateien · **`_b2_englobal` 1.063 Dateien ohne Blockliste** · **`_b2_englisch` 0 Befunde** |
| Messbericht | `_terminologie/messung_b2.md` |

### ⚠⚠ Was aus R895 WEITER TRÄGT

**1. „Gate" hat in diesem Projekt ZWEI Bedeutungen — und die zweite ist**
**Entwicklersprache.** Die Bauteile der eigenen Prüfkette heissen selbst „Gate"
(Compile-Gate, Typ-Gate, Live-Smoke-Gates, Headless-Gate-Runner), dazu die
generische Riegel-Bedeutung (PIN-Gate, Rechte-Gate, Boot-Gate). **Gemessen: 28
von 40 Fundstellen in `_gates_headless.js` sind Jargon.** Ein blanker Lauf hätte
die eigene Werkzeugkette unlesbar gemacht. ⇒ Wer einen Begriff umbenennt, prüft
zuerst, ob er im Haus ZWEI Bedeutungen hat.

**2. Die Regelliste IST die Whitelist — aber nur mit BEIDEN Wortgrenzen.**
Ohne `wortanfang` griffe die nackte Regel mitten in `Standard-Gates`,
`Compile-Gate` und `Gateway` hinein. Und die AUSGELASSENE Menge gehört benannt:
`_b2_rest.js` weist jede nicht ersetzte Fundstelle mit ihrem GRUND aus — „keine
Regel" ist dort 0, jede Auslassung ist eine Entscheidung.

**3. Eine SCHUTZ-Regel muss vor jeder Ersetzung rangieren, nicht nach Länge.**
`Gate-Checklisten` (16 Zeichen) schlug die Ausnahme `Quality-Gate` (12) und
belegte die Stelle in `Quality-Gate-Checklisten` zuerst — die Ausnahme kam nie
zum Zug und beschädigte eine bereits von Hand geheilte Erwartung ein zweites Mal.

**4. Der Klassifizierer war blind für Kommentare in `${…}`** — und das hat eine
**echte B1-Lücke** gerissen: `0003-basis.js:3161` (`<li>Gate-Katalog G0–G9</li>`)
blieb in R894 unmigriert, weil die Klassifizierung ab Zeile 2954 aus dem Tritt
war. ⇒ *Ein Parser, der eine Trägerform nicht kennt, verfehlt nicht nur sie,
sondern alles dahinter.*

**5. `deep-test.html` galt als Übersetzungstabelle** (26 de/en-Paare von 545
reichten für die alte Absolut-Schwelle) und wäre dateiweit geschützt gewesen —
**113 verhinderte Stellen** hätte der Lauf übersprungen. Das ist **dieselbe
Klasse, die R894-Lehre 10 heilen sollte, diesmal in der Reparatur**. Geheilt mit
einem gemessenen ANTEIL (20 %; echte Tabellen 32,8 %/56,3 %, falsche ≤ 4,8 %).

**6. Fünf Positions-Helfer kannten ihr eigenes Anführungszeichen nicht.** Ein
Apostroph im Wert (`('orphaned')`) beendete die Rückwärtssuche zu früh; zehn
englische Werte in `0855` waren dadurch ungeschützt. Geheilt, indem die
Zeichenketten-Grenzen **aus dem Klassifizierer** kommen — gefragt statt gesucht.

**7. `_enheil.js` prüft nur Dateien mit `__bm907S` — das ist eine Blockliste.**
`0937` führt 538 `{"de":…,"en":…}`-Paare ohne Marker und war unsichtbar. Neuer
blocklisten-freier Zeuge `_b2_englobal.js`; sein erster Wurf klagte 487
harmlose Stellen an und übersprang ausgerechnet die Datei, an der von Hand
gearbeitet wurde. ⇒ *Ein Zeuge, der eine ganze Datenklasse falsch anklagt, ist
kein Zeuge — und einer, der dort wegsieht, wo gearbeitet wurde, erst recht nicht.*

**8. ⚠⚠ EIN ZEUGE, DER NIE ANSCHLAGEN KONNTE, MELDETE GRÜN.** `_b2_englisch.js`
wurde über ein Bash-Heredoc geschrieben; dabei wurde aus `\b` das Steuerzeichen
**U+0008 (Backspace)**. Das Muster verlangte damit ein Backspace im Text und
fand nie etwas — vier bekannte Schäden lagen vor ihm. Aufgefallen ist es NUR,
weil ein bekannter Verstoss zum Gegenprüfen vorlag. ⇒ **Jede neue Probe braucht
ihre KO-Drehung IM Werkzeug**, und die Hausnotiz „Bash-Heredocs fressen
Backslash-Escapes" gilt auch für Regex-Literale in Werkzeugen.

**9. Der Lauf erzeugt TAUTOLOGIEN, die kein Prüflauf sieht.** „Gate freigeben"
wird wörtlich zu „Freigabe freigeben" — gemessen zehn Stellen. §6.6
(Grammatikprobe) ist damit keine Formalie: sie ist der einzige Wächter dieser
Klasse.

**10. Ein REGEX-Literal, das eine Knopf-BESCHRIFTUNG matcht, ist ein stiller**
**Funktionsausfall.** `0645:105` bildete `/^Gate freigeben$/` auf ein Symbol ab;
nach der Umbenennung fiel das Häkchen weg — ohne rotes Gate. Gefunden hat es
`_b2_halbiert.js`. Dieselbe Klasse: die Präfix-Liste des Drawers (`0543:36`).

**11. Halbierte Vektoren haben eine DRITTE Form.** Neben Regex-Literalen und
Sollwert-Erwartungen gibt es den **Eigenschafts-Zugriff**: `st3.customerPackage.glossar.Gate`
ist CODE und wandert nicht, während die Fixture daneben wandert.

**12. Ein Riegel, der die FALSCHE GRENZE prüft, ist an der Hälfte seiner Fälle
blind.** Der Jargon-Gürtel fragte, ob die getroffene Spanne EIN WORT ist — damit
rutschte jede Vorfeld-Regel (`das Gate`, `kein Gate`) an ihm vorbei, und fünf
Meldungen der eigenen Prüfkette wurden verdeutscht. Gefangen hat es die
Fail-Path-Probe selbst, weil sie ihren eigenen Satz auf Deutsch druckte.
Richtig ist die **Bindestrich**-Grenze.

**13. Eine Regel, die nur deshalb nie falsch trifft, weil eine andere sie deckt,
ist nicht richtig — sie ist ungetestet.** `ein Gate` greift mitten in
`kein Gate`; normalerweise belegt die längere Regel zuerst. Sobald sie einmal
nicht greift, beißt die kürzere. Alle 173 Nicht-Schutz-Regeln tragen jetzt
`wortanfang`.

### ⚠ Offene Punkte, die B2 benannt und NICHT gelöst hat

1. **Der Kundenglossar-Mechanismus kennt nur englische Plurale** (`(s|es)?`).
   Der deutsche Plural auf -n wird nicht erfasst; eine Erweiterung wäre falsch,
   weil der Ersatz den Suffix an den Kundenbegriff hängt („Quality Gaten").
   Die Grenze ist im Vektor `deep-test.html:844` **festgenagelt** → **B10**.
2. **Ausgelieferte Kundenpakete verlieren die Glossar-Zuordnung für „Gate"**
   (der Musterschlüssel wandert, analog E30). Kein Datenverlust → **B10**,
   gemeinsam mit dem Umschlüsselungswerkzeug S1.
3. **`Gate-Review` bleibt sichtbar** (155 Stellen, `_b2_schaden.js`) — gespeicherter Fachwert nach
   E2, geht mit `Management-Readout` gemeinsam nach **B7**.
4. `Kundenpaket-Lint-Gate`, `Release-Gate`, `Sichtbarkeits-Gates` — Prüfketten-
   bzw. Riegel-Jargon in kundenseitigem Hilfetext → **B3** (inhaltliche
   Umformulierung, keine Wortregel).

---

## §9a ⚠ DER NÄCHSTE SCHRITT

**B2b geht weiter — der Zuschnitt ist gerechnet und in E33 gebucht.** Die
Pflicht-Vorabmessung widerlegte die alte Schätzung „~1.400 Stellen": gemessen
sind **4.244** über 69 Begriffe. Die Teilung nach drei gemessenen Merkmalen
(`node _terminologie/_b2b_zuschnitt.js`):

| Schnitt | Begriffe | Stellen | Stand |
|---|---|---|---|
| **B2b-1a** `Handover`+`Runbook` | 2 | 632 | ✅ R897 |
| **B2b-1b** die vier **schweren** | 5 | 672 | ✅ R898 |
| **B2b-1c** die sieben **leichten** | 7 | 646 | ✅ R899 |
| **B2b-1d** Spaltenköpfe + Owner-Punkte | 30 Beschriftungen | 151 | ✅ R899 |
| **B2b-2** RESTMENGE | 20 | 219 | ✅ R900 |
| **B2b-3a** `Owner` + `Ownern` | 2 | 920 | ✅ R901 |
| **B2b-3b** die zehn **Fachbegriffe** (13 Formen) | 10 | 422 | ✅ R902 |
| **B2b-3c** `Review` — die **Prüfung** | 1 | 616 (113 ersetzt + 32 Handstellen, 501 bleiben) | ✅ R903 |
| **B2b-3d** `Snapshot`+`Snapshots` — die **Momentaufnahme** | 2 | 369 (337 ersetzt + 20 Handstellen, 32 bleiben) | ✅ R904 |
| **B2b-3e** `Drawer` — der **Detailbereich** | 1 | 234 (152 ersetzt + 24 Handstellen, 82 bleiben = Werkzeugsprache) | ✅ R905 |
| **B2b-3f** `Scope` — der **Umfang** | 1 | 210 ersetzbar (136 ersetzt, **74 bleiben** = gespeicherter Fachwert E75 + Werkzeugsprache E70/E76) + 6 Handstellen. ⚠ Die 6 Handstellen ziehen NICHT von den 210 ab: zwei drehen eine `Umfang`-Stelle auf `Scope` zurück, zwei streichen eine Glosse — keine davon ist eine `Scope`-Fundstelle des Inventars. 210 − 136 = 74, nachgemessen mit `_b2_rest.js` | ✅ R906 |
| **B2b-3g** `Score` + `Readiness` — der **Punktwert** und der **Reifegrad** | 2 | 538 ersetzbar (491 ersetzt, 4 geschützt = zwei ausgelieferte Dateinamen ×2, 2 als Schlüssel der eingefrorenen Migrationstabellen) + 4 Handstellen. ⚠ Der Zuschnitt folgt einer BINDUNG, nicht der Menge: `Readiness-Score` gehört beiden und ist ein gespeicherter Wert mit bestehender Leiter (E77) | ✅ R907 |
| **B2b-3h** `Decision`/`Decisions`/`Top-Decisions` — die **Entscheidung** | 3 | 1.303 mechanisch in 183 Dateien (0-Ѐ-simuliert gegen den Vorzustand) + 16 Handstellen in fünf Klassen (REGEX-BINDUNG · VEKTOR · GLOSSE ×2 · GRAMMATIK ×7 · NACHLESE ×5) + 5 Großschreibungen; Rest 0 mit Grund (3 WORTENDE = zusammengesetzte Vektor-/Kommentar-Fragmente · 1 JARGON · 1 FREMD-GEDECKT). ⚠ Der doppelt gebundene KPI-Wert wanderte KOMPLETT (E83); `Decision Management`/`Decision Workshop`/`actions[].source` bleiben als Namen/Werte (E84/E85) | ✅ R908 |
| **B2b-3** Rest der SONDERFÄLLE (Entwicklersprache) | 19 | **nachzumessen** | offen, eigener Zuschnitt |

⚠⚠ **Die Reihenfolge folgt seit E34 der gemessenen SCHWERE, nicht der Menge.**
Die alte Liste hier sortierte nach Stellenzahl und hätte `Actuals` (161) zuerst
genannt — gemessen trägt `Actuals` **keinen einzigen** Aufwandstreiber, während
`Heatmap` bei 49 nackten Stellen **34 Zusammensetzungen** hat. Das Werkzeug ist
`_b2b_schwere.js`; die Begründung steht in E34, die Zahlen in
`_terminologie/messung_b2b1b.md` §1.

**B2b-1c Rest-KERN** (7 Begriffe, 646 Stellen, 23 Zusammensetzungen, **kein**
Geschlechtswechsel, 7 Kollisionen, 14 Prüfvektoren): `Actuals` 161 · `Sponsor`
130 · `Mitigation` 93 · `Mitigations` 87 · `Best Practice` 85 · `Severity` 49 ·
`Decision Readiness` 41.
⚠ **Drei Auflagen, die schon gemessen sind:** `Mitigation` und `Mitigations`
müssen im **selben** Schnitt bleiben (sonst greift die kürzere Regel in die
Stellen der längeren) · `Mitigation-Plan` ist ein **aktiver Namens-Join**
(Katalog ↔ `outputs`, `_b2b_join.js` vor dem Golden-Refresh) · `Mitigation:` in
`0162-bm-v161-snippets.js:6` steht hinter einer **Escape-Folge** und ist für den
Ersetzer unsichtbar (`_b2b_escape.js --buendel=B2b-1c`).

**B2b-3 SONDERFÄLLE — DER STAND NACH R904.** Aus der Messmenge sind `Owner`
(R901), die zehn Fachbegriffe (R902), `Review` (R903) und `Snapshot`/`Snapshots`
(R904) abgearbeitet; **20 Formen** bleiben, und sie sind alle Entwicklersprache.
⚠⚠ **Die Zahlen sind nachzumessen, nicht fortzuschreiben** (Auflage 0-ο):
`node _terminologie/_b2b3_offen.js` liefert die offene Menge,
`_b2b_schwere.js --buendel=B2b-3` die Aufwandstreiber.

**`Drawer` ist mit R905 gelaufen** (B2b-3e, 234 Stellen · 90 nackt · 77 KOMPO ·
130 Vektoren · **kein** Geschlechtswechsel): 152 mechanisch, 24 Handstellen, Rest 82
— sämtlich Werkzeugsprache des Prüfbestands (E70). Die vorab gemessene Erwartung ist
eingetroffen: **43 %** seiner nackten Stellen lagen im eigenen Prüfbestand, und der
Bestand **glossierte ihn selbst** (E69/E71).

**`Scope` ist mit R906 gelaufen** (B2b-3f, 210 ersetzbare Stellen · 163 nackt ·
22 KOMPO · **kein** Geschlechtswechsel): 133 mechanisch, 6 Handstellen, Rest **0**.
Die Vorabmessung nach 0-Ϥ hat dabei die **Zielform selbst** widerlegt (E74) — sie
stand nicht im Bestand falsch, sondern im eigenen Werkzeugkasten.

**`Score` und `Readiness` sind mit R907 gelaufen** (B2b-3g, 538 ersetzbare Stellen ·
159 nackt · 52 KOMPO · 23 GENUS — aber nur an Komposita, siehe unten): 491 mechanisch,
4 Handstellen, Rest **0**. Der Schnitt trug ZWEI Begriffe, weil ein gespeicherter Wert
sie bindet (E77) — `Readiness-Score` hätte sonst **zwei Migrations-Generationen**
gebraucht. ⚠ Der Geschlechtswechsel `die Readiness` → `der Reifegrad` ist an der
NACKTEN Form ein **Phantom**: vor ihr steht im ganzen Bestand kein deutsches
Begleitwort (79 Stellen gemessen); er schlägt nur dort durch, wo der Begriff
**Kopfwort** ist.

**`Decision`/`Decisions`/`Top-Decisions` sind mit R908 gelaufen** (B2b-3h, der größte
Einzelschnitt des Programms: 1.303 mechanisch in 183 Dateien + 16 Handstellen +
5 Großschreibungen, Rest 0 mit Grund, Leiter 2.26.0 → 2.27.0, E83–E91). ⚠⚠ Der
doppelt gebundene KPI-Wert `High-Priority Decisions ohne Evidence` ist dabei KOMPLETT
gewandert (E83) — **B2b-3i führt ihn als erledigt, nicht als Arbeit.** ⚠ Die
Grammatik-Buchung aus E80 (198 GENUS / 123 ADJ) war die GEFÄHRLICHERE Lesart, nicht
die reale: das Haus behandelt die nackte Form durchgehend weiblich (E90).

**⚠ OFFENER PUNKT AUS DEM R908-ZWEIT-REVIEW (MINOR 14), bewusst NICHT in R908 gebaut:**
`BM947_SRC` (0020:221, wird vom Migrations-Step 2.18.0→2.19.0 in den Stand GESCHRIEBEN)
und `SRCLABEL` (0314:23) sind Tabellen derselben Bauart wie `BM961_WERTE` und liegen in
**keiner** `2026k-UNBERUEHRBAR`-Zone — geschützt nur durch bündelgebundene Anker, und der
Lauf kennt nur die Regeln SEINES Bündels (R903). Eine Zonen-Nachrüstung zieht den
Statik-Prong 9e (`MIGTAB`, Zonenzahl==Tabellenzahl) und den deep-Pin `zonen907===3` mit —
darum als EIGENER Schritt vor dem nächsten Schnitt, der `Decision`-Formen trägt (real:
ein Wiederholungslauf von B2b-3h, dessen Anker sie heute decken), nicht als Beifang.

## ⚠⚠ DER NÄCHSTE SCHNITT IST **B2b-3i „DER NACHWEIS"** (`Evidence` · `Gap Map` · `Opt-in`)

Zuletzt gemessen 138 Stellen, ⚠ 85 Kollisionen bei `Evidence` (`Nachweis` steht im Haus
längst — 0-Ϥ mit B2b-3h-Schärfe). Die Zahlen sind nachzumessen, nicht fortzuschreiben
(0-ο); vor dem Zuschnitt die volle Vorab-Kette: `_b2b_ssotabgleich.js` (0-Ѓ) ·
`_b2b_zielabgleich.js` (0-Ϯ) · `_b2b3_offen.js` · `_b2b_schwere.js --buendel=B2b-3i` ·
`_b2b_kleinform.js` · Zielform zählen UND ansehen (0-Ϥ). ⚠⚠ Der KPI-Wert
`High-Priority-Entscheidungen ohne Nachweis` ist mit R908 komplett gewandert (E83) und
wird NICHT erneut angefasst. Danach die Restmenge der Entwicklersprache.

### Der Abschnitt zu `Decision` (Stand vor R908), historisch

Er kommt nicht aus der `B2b-3`-Messmenge, sondern aus dem **SSOT-Abgleich** (E78/E80):
`Decision` stand in der SSOT §2.3 seit dem ersten Tag und in der Werkzeug-Begriffsliste
**nie**. Nach E34 („die Reihenfolge folgt der gemessenen SCHWERE") führt er **jede**
Spalte und ist damit unstrittig der nächste:

| Begriff | Stellen | nackt | KOMPO | GENUS | ADJ | KOLL | Vektoren |
|---|---|---|---|---|---|---|---|
| `Decision` | 1.044 | 705 | 60 | **198** | **123** | **191** | 93 |
| `Decisions` | 443 | 430 | 7 | — | — | 11 | 25 |
| `Top-Decisions` | 20 | 20 | 0 | — | — | 0 | 0 |
| **Summe** | **1.507** | **1.155** | **67** | **198** | **123** | **202** | **118** |

Zum Vergleich: der bisher größte Schnitt des Programms war `Owner` (B2b-3a, 920
Stellen), der bisher schwerste Geschlechtswechsel `Impact` (17 GENUS / 16 ADJ).
`Decision` trägt beides um eine Größenordnung höher.

⚠⚠ **Vier Auflagen sind für ihn schon gemessen:**

1. **0-Ϥ mit besonderer Schärfe.** Die Zielform `Entscheidung` ist durch **B1** (R894)
   bereits massenhaft im Bestand — der Registertitel heißt so, die Navigation ebenso.
   Die **202 Kollisionen** sind die höchste Zahl, die dieses Programm je gemessen hat;
   jede braucht nach E32 eine eigene Entscheidung, sonst entstehen Tautologien der
   Form „Entscheidung (Entscheidung)".
2. **Der Geschlechtswechsel ist ECHT, nicht wie bei `Readiness` ein Phantom.**
   `Decision` steht im Haus in ZWEI Lesarten (`die Decision` 25 · `eine Decision` 16 ·
   `einer Decision` 10 gegen `ein Decision` 24 · `das Decision` 7); eingetragen ist die
   Form, die den Wechsel gegen `die Entscheidung` auslöst — dieselbe Regel wie bei
   `Backlog`. **123 ADJ**-Stellen erreicht eine reine Begleitwort-Regel NICHT.
3. **`Decision-Readiness` ist mit R907 schon abgeräumt** (E82) — 103 Stellen über fünf
   Schreibweisen, die B2b-1c nie erreicht hat. Sie tragen jetzt `Entscheidungsreife`
   und gehören NICHT mehr zu B2b-3h.
4. **Die Kennungen bleiben** (E15/E13–E25 → B8): `DEC-`, `Decision-IDs`,
   `TR-DECISION-READINESS` und ihresgleichen sind gespeicherte Kennungen und wandern
   erst mit dem Kennungs-Bündel.

**Danach `B2b-3i „Der Nachweis"`** (`Evidence` 127 · `Gap Map` 6 · `Opt-in` 5 = 138;
⚠ 85 KOLL bei `Evidence`, weil `Nachweis` im Haus längst steht) und erst dann die
Restmenge der Entwicklersprache.

Danach nach gemessener Schwere: `Score` (80) ·
`Diff` (70 KOMPO) · `Impact` (17 GENUS / 16 ADJ — der schwerste verbliebene
Wechsel) · `Merge` · `Template`/`Templates` (16 KOLL) · `Trigger` · `Topbar` ·
`Tool`/`Tools` · `Tooltip`/`Tooltips` · `Badge` · `Setup` · `Feature` · `Backup` ·
`Chip` · `Evidence & Links`.

Für sie alle gilt die R895-Lehre „ein Begriff kann im Haus ZWEI Bedeutungen haben"
in voller Schärfe — und seit R904 zusätzlich **0-Ϥ**: erst die ZIELFORM im Bestand
zählen UND ansehen, dann den Zuschnitt rechnen.

**Vor jedem Lauf zu erledigen — die Liste ist seit R904 um VIER weitere Punkte länger:**

0-Ѓ. **⚠⚠ NEU (R907): DIE BEGRIFFSLISTE IST EIN PRÜFLING, KEINE QUELLE — WER SEINE
   MENGE AUS EINER LISTE ZIEHT, MUSS DIE LISTE GEGEN IHRE QUELLE MESSEN.**
   `_b2b_begriffe.js` nennt sich in seiner ersten Zeile „eine Quelle, kein zweites
   Verzeichnis" und behauptet in seinem Kopf, sein Inhalt sei „die SSOT-§2.3-Tabelle".
   Seine Selbstprobe prüft `BEGRIFFE` gegen `ZIELFORM` gegen `SCHNITTE` gegen
   `regeln.js` — **vier eigene Listen im Kreis**; gegen die SSOT hat nie etwas
   gemessen. Gemessen fehlten **sechs** Begriffe mit rund **1.990 Stellen ohne jede
   Regel**, darunter mit `Decision` (1.501) der größte Einzelbegriff des Programms.
   Ein Begriff, den `BEGRIFFE` nicht kennt, bekommt in KEINEM Schnitt eine Regel,
   taucht in KEINER Rest-Liste auf und wird von KEINER Schwere-Messung gewogen — er
   ist **unsichtbar, nicht erledigt**.
   ⇒ **`node _terminologie/_b2b_ssotabgleich.js` vor jedem Zuschnitt.** Ausnahmen sind
     eine geschlossene Liste, und **jeder Grund gehört gemessen**: der erste Wurf trug
     vier plausible, aber falsche Begründungen, die `_b2_rest.js` sämtlich widerlegte.
     *Eine Ausnahme ohne Messung ist keine Ausnahme, sondern ein Deckel.*
   ⚠ Es ist die **Gegenrichtung zu 0-Ϯ/E74**: dort führte `ZIELFORM` eine Form, die der
     Bestand nie hatte; hier führt der Bestand eine ausgelieferte Zuordnung für einen
     Begriff, den `ZIELFORM` gar nicht kennt. `_b2b_zielabgleich.js` kann das per
     Bauart nicht sehen — es vergleicht nur die Paare, die in `ZIELFORM` STEHEN.
     *Ein Instrument, das nur die geführten Fälle prüft, kann einen ungeführten nie
     melden.*

0-Ѕ. **⚠⚠ NEU (R907): EINE BESTEHENDE MIGRATIONSLEITER ENTSCHEIDET DEN ZUSCHNITT.**
   Trifft ein gespeicherter Wert ZWEI Begriffe, die in verschiedenen Schnitten stünden,
   dann bräuchte er **zwei Generationen auf denselben Wert** — und wer die zweite
   verpasst, verliert die daran hängende Regel still. `Readiness-Score` gehört sowohl
   `Score` als auch `Readiness`; beide laufen darum in EINEM Schnitt (E77).
   ⇒ Vor jedem Zuschnitt: trägt einer der Begriffe ein **Kompositum, das ein anderer
     Begriff der offenen Menge teilt**, und ist dieses Kompositum ein gespeicherter
     Wert? Dann gehören beide zusammen.
   ⚠ Und die Schutzzone gehört an **jede** Tabelle dieser Bauart, nicht an die zuletzt
     gebaute: `BM961_WERTE` (R898) stand bis R907 ohne — unauffällig nur, weil ihr
     einziger Schlüssel zu einem bereits gelaufenen Bündel gehörte.

0-І. **⚠⚠ NEU (R907): EIN WERKZEUG, DAS SEINEN CLI-RUMPF BEIM `require` FÄHRT, IST
   NICHT EINBINDBAR — UND LIEFERT EIN GRÜN AUS DEM FALSCHEN WERKZEUG.**
   `_b2b_zielgenus.js` exportierte `muster()`, ließ aber seinen ganzen Bericht beim
   `require` laufen. Wer die Funktion holen wollte, bekam je nach Aufruf entweder die
   FREMDE Selbstprobe samt ihrem `process.exit(0)` — der eigene Lauf endete grün, ohne
   eine einzige eigene Zusicherung gefahren zu haben — oder die Nutzungsmeldung mit
   Exit 2.
   ⇒ Die Selbstprobe bleibt an `process.argv` (0-Ϫ, der Zugriffs-Beweis braucht das),
     der BERICHT bekommt einen `require.main`-Riegel. Beide Zweige schließen sich dann
     aus. *Zwei Werkzeuge mit derselben Flag-Erkennung sind in EINEM Prozess nicht
     komponierbar.*

0-Ѐ. **⚠⚠ NEU (R906): EINE WURZEL-HEILUNG MACHT IHRE EIGENE HANDSTELLE
   GEGENSTANDSLOS — UND WER BEIDE ZÄHLT, ZÄHLT DIESELBE STELLE ZWEIMAL.**
   Wird ein Schaden an der WURZEL verhindert (eine Schutz-Regel statt einer
   Einzelzeile, Master-Prompt §2 (6)), dann kann die zugehörige Handstelle mit
   dem ausgelieferten Regelsatz **gar nicht mehr auslösen**: `urteil()` liefert
   für sie nur noch `BEREITS-GEHEILT`, und das gilt als grün. Sie ist damit
   genau die `ueberholt`-Klasse aus R900 — und sie steht doppelt in der
   Release-Buchung, einmal als mechanische Ersetzung des **verworfenen** ersten
   Laufs und einmal als Handstelle.
   ⇒ Solche Stellen tragen `historisch: true`; das Werkzeug weist **WIRKSAM**
     getrennt aus, und die Selbstprobe verlangt für jede historische Stelle
     **BEREITS-GEHEILT plus eine existierende Wurzel-Regel**.
   ⚠ Daraus folgt unmittelbar die zweite Hälfte: **die gebuchte Lauf-Zahl gilt
     für den Regelsatz, der AUSGELIEFERT wird**, nicht für den Lauf, den man
     unterwegs verworfen hat. In R906 stand „136 in 40 Dateien" in sechs
     Dokumenten; gemessen sind es **133 in 39**. Nachrechenbar mit einer
     Simulation von `lauf()` gegen den Vorzustand — und diese Simulation gehört
     zum Ritual, sobald während eines Bündels eine Schutz-Regel nachgezogen wird.

0-Ё. **⚠⚠ NEU (R906): DER GENITIV IST EINE EIGENE GRAMMATIK-KLASSE, und die
   Begründung „einwortig ⇒ trifft nicht zu" ist für ihn FALSCH.**
   `_b2b3a_kasus.js` meldete für jeden Schnitt mit einwortiger Zielform „KLASSE
   TRIFFT NICHT ZU" und begründete das damit, dass der **Dativ** bei einem
   einwortigen Substantiv zeichengleich mit dem Nominativ ist. Das stimmt — und
   der GENITIV kommt darin nicht vor. Ein Fremdwort (`Scope`, `Review`,
   `Snapshot`) trägt im Genitiv **keine** Endung, ein starkes deutsches
   Maskulinum/Neutrum verlangt `-s`. Gemessen kostete das
   `des Struktur-Umfang` — falsches Deutsch, **live** in der
   Datenmanagement-Tabelle, bei `_b2_rest.js` 0 und sechs grünen Zeugen.
   ⇒ Neue **Klasse G-GENITIV** mit eigener Wortliste `GENITIV_STARK` und
     Deckungs-Ausweis. Jede Umbenennung FREMDWORT → starkes m/n erzeugt sie.
   ⚠ Ihr erster Lauf über alle Schnitte meldete sofort `des Detailbereich-
     Graphen` — einen **völlig richtigen** Satz, denn dort ist `Graphen` das
     Kopfwort und `Detailbereich` bloßes Bestimmungswort. Die Bindestrich-Grenze
     steht jetzt im Muster. *Eine Probe, die richtige Sätze anschwärzt, ist
     schlimmer als keine* (0-ϧ) — und sie fällt beim ersten Lauf an, nicht beim
     zehnten.

0-Ђ. **⚠ NEU (R906): EINE HEURISTIK, DIE ZWEIMAL FÄLLT, IST DIE FALSCHE FRAGE.**
   Die Phantom-Zonen-Erkennung fragte erst „trägt der Zonenkörper ein
   Kommentar-Ende?" (fail-open: in einer kommentarreichen Datei fast immer),
   dann „trägt der Kopf bis zur ersten Leerzeile eines?" (hilft nicht: eine
   Phantom-Zone braucht keine Leerzeile). Beides sind Fragen über den INHALT.
   Die richtige Frage ist eine über die **STELLE**: steht der Marker innerhalb
   eines offenen Blockkommentars? Rückwärts entscheidbar, per Vertrag erfüllt,
   von einem Literal nie.
   ⇒ Wenn eine Heuristik zweimal fällt, ist meist nicht die Schwelle falsch,
     sondern die Frage.

0-Ϯ. **⚠⚠ NEU (R906): EINE AUSGELIEFERTE ZUORDNUNG SCHLÄGT DIE WERKZEUG-TABELLE.**
   Auflage 0-Ϥ sagt, die Zielform könne im Bestand schon vergeben sein. R906 ist der
   Fall eine Ebene höher: sie kann durch einen **früheren Schnitt** bereits **gesetzt
   und migriert** sein. `ZIELFORM` führte `Projektumfang` — eine Form, die im ganzen
   Bestand **NULL mal** vorkommt —, während die Spalte seit R899 `Umfang` heißt und
   die Migrationstabelle `BM899_SPALTEN` genau das **einfriert**: `'Scope':'Umfang'`
   innerhalb einer `2026k-UNBERUEHRBAR`-Zone, die die gespeicherte
   Spaltenreihenfolge jedes Bestandsnutzers übersetzt.
   ⇒ **`node _terminologie/_b2b_zielabgleich.js` vor jedem Zuschnitt.** Es hält die
     ausgelieferte Kurzform gegen `ZIELFORM`; von 41 eingefrorenen Paaren sind sechs
     vergleichbar, und zwei wichen ab — `Owner` bewusst (E4/E50), `Scope` unbewusst.
   ⚠ Sieben Releases lang hat das kein Instrument verglichen, obwohl
     `_b2b1d_spalten.js` in seinem eigenen Kopf schreibt, die Zielformen folgten
     „SSOT §2.3 bzw. E4". **Eine Zusicherung im Kommentar ist keine Prüfung.**
   ⚠⚠ Beim Bau des Werkzeugs sind DREI Klassen aufgefallen, die alle dieselbe Wurzel
     haben — *das eigene Erklären zählt als Bestand* (der R903-EIGENVERWEIS):
     (a) der Kommentar-Kopf der Zone trägt ein **Beispiel-Paar** und wurde mitgezählt
     (32 statt 31); (b) der erste H-R906-Vektor nannte die Zonen-Marker **wörtlich**
     und erzeugte damit eine **PHANTOM-ZONE** — `riegleBloecke()` in `_ersetze.js`
     hätte einen Teil von `deep-test.html` für **jeden künftigen Lauf** still
     eingefroren; (c) der Anker `BM899_SPALTEN` traf die **erste Erwähnung** des
     Namens, und die steht im Kopf der **anderen** Zone.

0-ϯ. **⚠⚠ NEU (R906): WER EINEN WERT SCHÜTZT, MUSS AUCH SEINE ERWÄHNUNG SCHÜTZEN.**
   Die Schutz-Regeln eines gespeicherten Fachwerts (S12-Klasse) decken den **Wert** —
   in Listen, Datensätzen und `===`-Vergleichen. Sie decken **nicht den Fließtext, der
   ihn AUFZÄHLT**. Nach dem R906-Lauf sagte der Spaltenkopf-Tooltip „Fachlicher Typ
   (z. B. **Umfang**, Termin, Lieferkette)" und erklärte damit eine Auswahl, die es
   nicht gibt: die Liste bietet `Scope`. `_b2_rest.js` meldete **0**, alle sechs
   englischen Zeugen blieben grün — falsch ist erst das **Ergebnis**, genau wie bei
   der GLOSSE (0-Ϧ), mit der diese Klasse verschwistert ist.
   ⇒ Nach jedem Lauf mit einem geschützten Wert: **einen Fenster-Grep über die
     Zielform in Aufzählungs-Nachbarschaft** („z. B.", „etwa", Kommaketten mit zwei
     weiteren Werten derselben Liste).
   ⚠ Geheilt wird an der **WURZEL** (eine Schutz-Regel auf die Wortfolge), nicht als
     Einzelzeile: eine von Hand gedrehte Zeile verdeutscht der nächste Lauf prompt
     wieder (Master-Prompt §2 (6)).
   ⚠ **Abgegrenzt, nicht pauschal:** „Anpassung von Umfang, Termin, Vergabe oder
     Technik" bleibt deutsch — es ist Prosa und keine Aufzählung der Liste (`Vergabe`
     ist kein Wert; der Wert heißt `Vertrag & Vergabe`). Die Trennlinie ist, ob der
     Satz die Werte **zitiert** oder nur über die Sache spricht.

0-Ϳ. **⚠⚠ NEU (R906): EIN ANKER DARF NICHT IN EINEN CAMEL-BEZEICHNER ENDEN — SONST
   IST ER WIRKUNGSLOS UND DIE NACKTE REGEL GREIFT.** R902 hat gebucht, dass ein Anker
   nicht am **Rand** einer Zeichenkette ansetzen darf. R906 fügt die andere Seite
   hinzu: `wortUm()` zieht den ganzen Wortverbund **um die Spanne** zusammen, und ein
   `actionId` oder `impactCost` dahinter macht daraus einen CAMEL-Treffer. **Zwei**
   Schutz-Anker fielen so heraus (8 + 1 Stellen) und ein **dritter** war schlicht
   falsch geschrieben (1 Stelle, 0 Treffer), **während die nackte Regel danach zugriff** —
   gemessene Folge: **10 gespeicherte Werte wären umbenannt worden, die übrigen 47 nicht**,
   also dieselbe Sache unter zwei Namen im selben Datenstand.
   ⇒ Der Anker muss an einem Zeichen **enden, hinter dem kein Wortzeichen steht**
     (`Scope"},{`), oder — wenn rechts unmittelbar ein Bezeichner steht — nach
     **LINKS** greifen und mitten in der Nachbar-Zeichenkette ansetzen
     (`Change',type:'Scope'`).
   ⚠ Gefunden hat es zum zweiten Mal nach R904 das **Lesen der Trefferzahl je Regel**
     (0-ω): `0 SCHUTZ / 4 ÜBERSPRUNGEN`. Bei derselben Gelegenheit fiel eine **tote**
     Regel auf — `istWerkzeugJargon()` deckte ihre Stelle bereits.

0-ϐ. **⚠⚠ NEU (R905): EINE ZU STRENGE SCHWELLE WIRD NICHT DADURCH RICHTIG, DASS MAN
   SIE LOCKERT.** Der erste adversariale Durchgang fand, dass die Handstellen-Probe
   `nach`-Treffer `=== soll` verlangte und damit für die Klebeform-Klasse rot wurde,
   ohne dass etwas fehlte (`Detailbereich` steht in `0002-bmDemoData.json` 13-mal,
   `soll` ist 11). Die Reparatur `>=` beseitigte den Fehlalarm — und baute einen
   **echten Falsch-Grün** ein: eine **ersatzlos gelöschte** Stelle meldete „bereits
   geheilt", weil `von` weg war und `nach` zufällig oft genug dastand. Gefunden hat
   das der **zweite** Durchgang, der die Reparatur des ersten nachgerechnet hat.
   ⇒ Richtig ist ein **anderer Anker**, nicht ein weicherer: ein **KONTEXT-BELEG** je
     Handstelle — die Zeichenfolge, die nach der Heilung an genau dieser Stelle stehen
     MUSS, mit exakter Trefferzahl. Sie hängt weder an einem Zählerstand noch an einem
     Vorstand, den der eigene Commit verschiebt (der naheliegende `git show HEAD:`-Weg
     wäre nach dem Release-Commit sofort rot geworden — die `ueberholt`-Klasse).
   ⚠ Alle 21 Belege sind am Bestand nachgemessen (Trefferzahl == `soll`), und die
     KO-Drehung fährt beide Richtungen: geheilter Text ⇒ grün, ersatzlos gelöschter
     Text ⇒ ROT, und OHNE Beleg wäre derselbe gelöschte Text grün.

0-ϑ. **⚠⚠ NEU (R905): EINE ZAHL KORRIGIEREN HEISST SIE NACHMESSEN, NICHT
   FORTSCHREIBEN — dieselbe Klasse zweimal in einem Release.** Der erste Durchgang
   meldete, dass zwei Zeilenverweise auf `deep-test.html` nach dem Einfügen des
   EIGENEN Prüfvektors verschoben waren. Die Korrektur rechnete die Verschiebung aus
   der Länge des eingefügten Blocks (**+158**) statt sie zu messen; echt waren
   **+184**, und der zweite Durchgang fand beide neuen Zahlen wieder falsch.
   ⇒ Eine Zeilennummer in `deep-test.html` ist per Bauart ein Anker, der bei **jedem**
     neuen Prüfvektor bricht. Angegeben wird die **Zeichenfolge**; wer sie sucht,
     findet sie mit `grep -n`, und sie altert nicht.
   ⚠ Dazu aus demselben Durchgang: die Vereinheitlichung einer Zahl über die Doku
     übersah **zwei** Dokumente — ausgerechnet `CLAUDE.md` und `_expected.json`, also
     die beiden **lint-gekoppelten**. Eine Zahl gilt erst dann als vereinheitlicht,
     wenn sie über ALLE Träger gegriffen wurde (`grep -rn` statt Erinnerung).

0-Ϭ. **⚠⚠ NEU (R905): DIE VERWAISTE KLEBEFORM — SIE FÄLLT DURCH ALLE DREI NETZE
   DIESES PROGRAMMS ZUGLEICH.** Jede Regel trägt beide Wortgrenzen (Auflage 4), jedes
   Mess-Instrument sucht den Begriff **zeichengenau**, und der Ersetzer ist
   **case-sensitiv**. Eine **zusammengeschriebene** Form (`Detaildrawer`,
   `Standardagenda`, `Dokumentenreview`) erfüllt keine dieser drei Bedingungen — sie
   steht in keiner Rest-Liste, in keinem Gefahren-Bericht und in keiner
   Kompositum-Messung. Gemessen am 2026-08-25 über alle Schnitte: **sechs** solche
   Formen mit **48 Quellstellen**, allesamt sichtbarer deutscher Text, und **vier**
   davon in Bündeln, die ihren Rest mit **NULL** ausgewiesen haben (B2b-1b/R898,
   B2b-3a/R901, B2b-3c/R903). Die Null war jedes Mal richtig — sie galt nur für eine
   Menge, die diese Form nicht enthielt.
   ⚠⚠ Am schärfsten ist der Beleg, dass es **Inkonsistenzen im eigenen Haus** waren:
   `Standard-Tagesordnung` stand **schon 8-mal** und `Wirksamkeitsprüfung` **schon
   2-mal** im Bestand; beide Schreibweisen lagen nebeneinander, und nur die getrennte
   war für die Instrumente sichtbar.
   ⇒ **`node _terminologie/_b2b_kleinform.js --buendel=<B>|alle` vor UND nach jedem
     Lauf.** Es trennt drei Eimer: KLEBEFORM (deutsches Kompositum — das Signal),
     GROSSFORM (durchgehend groß, meist eine gespeicherte Kennung) und BEZEICHNER
     (CSS-Klasse, Element-Kennung, Test-Etikett — gezählt, nicht gelistet, weil eine
     342-zeilige Liste niemand liest).
   ⚠ **Eine Klebeform aus einem NOCH OFFENEN Schnitt wird NICHT vorweggenommen:**
     `Gesamtscore` (7), `Admintools` (5), `Änderungstrigger` (4) und `Kostenimpact` (2)
     gehören zu B2b-3. Sie hier zu heilen nähme dem künftigen Schnitt seine Stellen
     weg, und **sein** Rest-Ausweis fände sie danach nicht mehr.
   ⚠⚠ **UND DAS WERKZEUG SELBST IST BEIM ERSTEN LAUF IN EINE FALLE GETRETEN, DIE DAS
     HAUS SEIT EINEM REVIEW KENNT UND AN DER APP PRÜFT:**
     `String.prototype.toLowerCase` ist in Unicode **nicht längenerhaltend** — `İ`
     (U+0130) wird zu zwei Zeichen. `deep-test.html` trägt dieses Zeichen **zweimal**,
     und zwar als **absichtlichen Prüfvektor**, dessen Kommentar wörtlich lautet
     „längenänderndes Kleinschreiben (U+0130) verschiebt die Offsets NICHT". Ab
     Position 2.537.804 war jeder Index der kleingeschriebenen Kopie versetzt, und das
     Werkzeug meldete zwei **kanonisch** geschriebene Formen als Abweichung.
     ⇒ *Ein Index in einer UMGEWANDELTEN Zeichenkette ist kein Index in der
       ursprünglichen.* Geheilt mit einer Regex auf dem Original, KO-Drehung in beide
       Richtungen. **Wer im Haus etwas über den Bestand zählt, zählt am Original.**

0-Ϥ. **⚠⚠ NEU (R904): DIE ZIELFORM KANN IM BESTAND SCHON VERGEBEN SEIN — UND DANN
   IST NICHT IHRE ZAHL DER BEFUND, SONDERN WAS SIE BENENNT.** Auflage 0-ϲ (R903)
   sagt bereits, dass die Zielform ein gewöhnliches deutsches Wort sein kann; sie
   misst das aber nur für **Regex-Heilungen**. R904 ist der Fall eine Ebene höher:
   `Momentaufnahme` stand **27-mal** im Bestand, und zwar als
   `Kostengruppen-Momentaufnahme` — ein **Schlüssel im Artefakt-Katalog** mit
   eigenem Wörterbuch-Paar. Dazu trug der Bestand für dieselbe Sache ein ZWEITES
   deutsches Wort (`Berichtspunkt`, 94 Stellen) und zeigte beide als **Glosse**
   nebeneinander. Eine reine Zählung („27 Fundstellen, unkritisch") hätte beides
   verfehlt.
   ⇒ Vor jedem Schnitt die Zielform im Bestand **zählen UND ansehen**: ist sie ein
     NAME (Katalog-Schlüssel, Spaltenkopf, gespeicherter Wert)? Gibt es für dieselbe
     Sache schon ein anderes deutsches Wort? Beides entscheidet den Zuschnitt, nicht
     die Menge.

0-Ϧ. **⚠⚠ NEU (R904): DIE GLOSSE — EINE KLAMMER, DIE EIN FREMDWORT ERKLÄRT, WIRD
   NACH DER UMBENENNUNG ZUR DOPPELUNG.** „Berichtspunkte (Snapshots)" ist eine
   Erklärung; „Berichtspunkte (Momentaufnahmen)" ist zweimal dasselbe Wort. ⚠⚠ **Kein
   Zähler sieht das:** der Lauf ist korrekt, die englische Seite unberührt, alle sechs
   Zeugen grün — falsch ist erst das ERGEBNIS. Sie entsteht ausschließlich dort, wo
   der Bestand für dieselbe Sache bereits ein deutsches Wort hat, ist also die
   Zwillingsschwester von 0-Ϥ.
   ⇒ Nach jedem Lauf ein Fenster-Grep über die Zielform und ihr Hauswort-Synonym.
   ⚠ NICHT jede Nachbarschaft ist eine Glosse: eine Klammer kann eine
     KNOPF-Beschriftung zitieren, und ein Satz kann von zwei verschiedenen Dingen
     handeln. In R904 waren 11 von 15 Nachbarschaften Glossen, 4 nicht.

0-ϧ. **⚠⚠ NEU (R904): ALLE GRAMMATIK-INSTRUMENTE DES PROGRAMMS MESSEN VOR DEM LAUF
   — KEINES FRAGT DANACH.** `_b2b3b_vorfeld.js`, `_b2b3b_kompgenus.js`,
   `_b2b3a_kasus.js` und `_b2b3b_nachfeld.js` beantworten alle dieselbe Frage:
   *„welche Regel muss ich schreiben?"* Die Frage *„ist der Text jetzt richtiges
   Deutsch?"* stellte bis R904 **kein Werkzeug**. Gemessen kostete das **neun falsche
   Begleitwörter an acht Fundstellen** aus **B1/B2** (eine Zeile trägt deren zwei),
   die seit R894/R895 als falsches Deutsch in der ausgelieferten
   Oberfläche standen („hat ein vollständiges Entscheidungsvorlage", „am
   Entscheidungsvorlage", „im Leistungsphase") — bei grünen Gates, zehn Releases
   lang. ⚠ Und sie waren mit einer Vorfeld-Regel gar nicht zu fangen: der Bestand
   trägt jede dieser Wendungen ein- bis dreimal, sie liegen also unter der
   Aufmerksamkeitsschwelle einer nach Häufigkeit sortierten Vorfeld-Messung.
   ⇒ **`node _terminologie/_b2b_zielgenus.js --buendel=<B>` NACH jedem Lauf**, und
     einmal je Release `--buendel=alle`. ⚠ Es führt bewusst NUR eindeutige
     Begleitwörter: der erste Wurf nahm `der`/`dieser`/`jeder` mit — vor einem
     weiblichen Substantiv völlig richtig — und meldete 28 Stellen, davon 28 falsch.
     *Eine Probe, die richtige Sätze anschwärzt, wird nach dem dritten Mal nicht mehr
     gelesen und ist damit schlimmer als keine.*

0-Ϩ. **⚠⚠ NEU (R904): DIE R899-AUFLAGE „`--buendel` IST PFLICHT" GILT NUR FÜR DIE
   VIER WERKZEUGE, DIE R899 ANGEFASST HAT — JEDES SEITHER GEBAUTE HAT DEN FEHLER
   NEU.** Gemessen 2026-08-25 über alle **55** Werkzeuge, deren Dateiname auf
   `_terminologie/_b2*.js` passt, gezählt am Vorkommen der Zeichenfolge `--buendel`:
   **34 kennen es nicht, 21 kennen es** (die Definition steht hier, damit ein Zweiter
   die Zahl aus derselben Quelle nachrechnen kann — CLAUDE.md 7b). ⚠ Nicht jede der 34
   ist ein Mangel: die `*_hand.js`-Werkzeuge gehören per Bauart zu genau einem Bündel.
   Ein Mangel ist es dort, wo ein Werkzeug eine ALLGEMEINE Klasse misst und trotzdem
   eine feste Bündel-Tabelle führt — drei solche Grammatik-Proben meldeten für B2b-3d
   GRÜN, ohne etwas gemessen zu haben:
   · `_b2b3b_kompgenus.js` — seine Tabelle führte ausschließlich B2b-3b-Formen, und
     weil B2b-3b **gelaufen** ist, kommt keine davon im Bestand noch vor. Es konnte
     ab R902 für JEDES Bündel nur noch „Stellen: 0" melden — auch für B2b-3c, dessen
     Zusammensetzungen sehr wohl das Geschlecht wechseln. Nach der Heilung: **5
     echte Stellen** für B2b-3d.
   · `_b2b3b_nachfeld.js` — sein eigener Kopf schreibt seit R903 wörtlich „sie muss je
     Bündel nachgezogen werden, **und nichts erzwingt das**". Beim nächsten Bündel war
     die Lücke prompt wieder da. ⚠ Der neu eingebaute Deckungs-Riegel fand beim
     ERSTEN Lauf, dass auch **B2b-3b selbst** nur für 8 von 13 Formen gemessen worden
     war.
   · `_b2b3a_kasus.js` — meldet für jedes fremde Bündel 0.
   ⇒ Eine Auflage, die als Prosa formuliert ist, deckt nur die Werkzeuge, die zum
     Zeitpunkt ihrer Formulierung existierten. Sie gehört **in den Code** — als
     Pflicht-Argument UND als **Deckungs-Ausweis**, der rot wird, wenn die Deckung
     null ist (0-Ϟ). ⚠ Beim Einbau des Markers `'='` („kein Geschlechtswechsel") fiel
     sofort die Gegenprobe an: `PRONOMEN['=']` ist `undefined`, und
     `String.match(undefined)` baut in JavaScript `new RegExp(undefined)` = `/(?:)/`
     — ein Muster, das **auf alles passt**. Der erste Lauf meldete 124 Kandidaten
     statt 5. *Ein neuer Markenwert ist erst dann eingeführt, wenn JEDER Verbraucher
     ihn kennt; der stille Zwischenzustand meldet nicht nichts, sondern alles.*


0-ϡ. **⚠⚠ NEU (R903): EINE RAUSCHGRENZE, DIE EINEN BEGRIFF DER EIGENEN LISTE
   AUSSCHLIESST, IST KEINE SCHWELLE, SONDERN EIN BLINDER FLECK.** Der Durchgang (a3
   von `_b2_halbiert.js` — die Heilung aus R902 — übersprang Begriffe unter FÜNF
   Buchstaben. `Gate` hat vier. Der wichtigste Begriff des ganzen Programms lag damit
   unter der Schwelle seiner eigenen Kontrolle, und VIER Beschriftungs-Regexe lagen
   dadurch tot: `/heatmap/` seit R898, `/action|…|burndown/` seit R900, `/gate/` seit
   R895, `/readout/` seit R894. Alle vier leiten in `inferKind53` (`0016:219`) und
   seinem Zwilling (`0084:16`) aus einer KARTEN-Beschriftung das Zielregister ab.
   ⇒ Schwelle jetzt VIER (die kürzeste Form der Begriffsliste); gemessen steigt die
     Zahl der Verdachtsfälle über alle zwölf Bündel von 35 auf 53.
   ⚠ Sieben der 18 neuen prüfen die KENNUNG `GATE-` und sind heute richtig — sie sind
   aber genau die Stellen, die **B8** anfassen muss (E15 dreht die Kennung). Ein
   Verdachtsbericht, der die B8-Stellen VORAB nennt, ist mehr wert als eine niedrige Zahl.

0-ϲ. **⚠⚠ NEU (R903): EINE HEILUNG WIRD VERENGT, NICHT GEWEITET — UND DAS IST NEU,
   WEIL DIE ZIELFORM EIN GEWÖHNLICHES DEUTSCHES WORT SEIN KANN.** Bis B2 bildete jede
   Umbenennung ein FREMDWORT auf einen deutschen Begriff ab, den es vorher nicht gab.
   `Gate → Freigabe` ist anders: `Freigabe` stand schon **vor B2 624-mal** im Bestand
   (gezählt am Backup `index.release-1.34.813`). Eine Beschriftungs-Regex, die auf das
   neue Wort geweitet wird, verliert darum Trennschärfe statt sie zurückzugewinnen:
   gemessen ändert die blanke Alternative das Urteil bei 2.104 Literalen und reißt 167
   Beschriftungen aus ihrem RICHTIGEN Register.
   ⇒ **`node _terminologie/_b2b3c_weite.js` vor jeder Regex-Heilung.** Es hält ALTE und
     NEUE Erkennung gegen alle Zeichenketten-Literale und meldet, wie viele ihr Urteil
     ändern — und misst für eine LEITER die ganze Kette statt des einzelnen Musters,
     weil eine Alternative in Zeile 7 nichts ändert für das, was Zeile 3 schon fängt.
   ⚠ Auch eine TRENNSCHARFE Alternative kann falsch sein: die Kennung `lph` fängt
   ausschließlich Leistungsphasen — und darunter 26, die VOR der Umbenennung zu
   `contracts` gingen. Eine Heilung stellt her; sie verbessert nicht nebenbei.
   ⚠⚠ **DIE MESSUNG GILT FÜR JEDE ALTERNATIVE, NICHT NUR FÜR DIE VERDÄCHTIGE.**
   Der erste Wurf maß nur `freigabe` und `lph` und erklärte die drei anderen
   Alternativen für unbedenklich — nachgezählt an den Backups unmittelbar vor der
   jeweiligen Umbenennung standen `bewertungsmatrix` und `managementbericht`
   je **dreimal** schon vorher im Bestand (`1.34.816` vor R898, `1.34.812` vor
   R894); nur `abarbeitungsverlauf` war wirklich neu (0×). Die sechs Stellen sind
   geduldet und **benannt** — aber die Behauptung „jede Fundstelle hieß vorher X“
   war unbelegt, und zwar an genau der Stelle, an der zwei andere Alternativen
   mit Zahlen verworfen wurden. ⇒ *Wer eine Alternative zulässt, misst sie wie
   die, die er ablehnt.*

0-Ϟ. **⚠⚠ NEU (R903): EINE LEERE FRAGE SIEHT AUS WIE EINE BESTANDENE PROBE.** Drei
   Werkzeuge maßen für B2b-3c nichts und meldeten grün:
   · `_b2b_enfeld.js` — die EINZIGE Probe, die den `{de:…,en:…}`-Schaden sehen kann —
     schrieb „Zielformen geprueft: **0 von 1**" und drei Zeilen darunter „**GRÜN**".
     Ihre Stichwort-Schwelle lag bei acht Buchstaben, `Prüfung` hat sieben. Jetzt sieben
     UND **fail-closed auf die eigene Deckung**.
   · `_b2b3b_nachfeld.js` trug eine Genus-Tabelle mit ausschließlich B2b-3b-Begriffen
     und meldete „0 Kandidaten". ⚠ Nach dem Nachtrag: 31 Kandidaten, ALLE in Kommentaren
     — der Lauf fasst Kommentare gar nicht an. Das Werkzeug ist jetzt klassenscharf und
     meldet EINEN statt 31 Falschmeldungen.
   · `_b2_halbiert.js`s Selbstprobe las die Tabelle des gefahrenen Bündels und wurde in
     JEDEM späteren rot, ohne dass am Werkzeug etwas fehlte.
   ⇒ Jede Probe braucht einen **Deckungs-Ausweis** und muss rot werden, wenn die
     Deckung null ist. Ein Grün aus dem Nichts ist schlimmer als eine fehlende Probe,
     weil es die Klasse für geprüft hält.

0-Ϫ. **⚠⚠ NEU (R903): EINE REVIEW-EMPFEHLUNG IST AUCH NUR EINE HYPOTHESE.**
   Der erste adversariale Durchgang empfahl als NIT eine
   `require.main === module`-Wache vor der Selbstprobe zweier neuer Werkzeuge
   (ein fremder Prozess, der zufällig `--selfprobe` in seiner argv trägt, könnte
   sie samt `process.exit` auslösen). Eingebaut — und `_b2b3a_zugriff.js` meldete
   für **beide** sofort „bleibt GRUEN bei totem Zugriff — der Riegel ist
   tautologisch“: der Beweis lädt die Werkzeuge per `require()` aus einem
   `node -e`, dort gibt es kein Hauptmodul, `require.main === module` ist falsch,
   und die Selbstprobe wurde **still übersprungen**.
   ⇒ Der „fremde Prozess mit `--selfprobe`“ ist hier kein Risiko, sondern der
     MECHANISMUS, auf dem der Zugriffs-Beweis beruht — alle acht anderen
     Werkzeuge dort fahren dieselbe Form. Die Wache ist zurückgenommen, die
     Messung steht im Kommentar.
   ⚠ Das ist die dritte Ausprägung derselben Lehre in diesem Release:
   **eine Aussage über die WERKZEUGKETTE ist eine Hypothese, bis ein Lauf sie
   festnagelt** — und sie gilt für die Empfehlung eines Kritikers genauso wie
   für die eigene Behauptung. ⚠ Zweite Ausprägung derselben Sitzung, weil sie
   sich wiederholt: die Shell frisst Backticks in doppelt gequoteten
   `node -e`/`python -c`-Aufrufen — dieser Absatz stand nach dem ersten Versuch
   mit vier leeren Code-Spans da (CLAUDE.md „Bekannte Fallen“, Punkt 4).
**⚠ ZWEI OFFENE PUNKTE AUS DEM R903-REVIEW — benannt, nicht geheilt:**

- **Zwei weitere Fallback-Karten derselben Klasse:** `0516-bm-v520-proc-tabs.js:155`
  und `0601-bm-v608-detail-links.js:16` führen beide `['gates',/gate/]` und
  `['readout',/readout/]` als Schlüsselwort-Karte über einen **Artefakt-NAMEN**.
  Sie sind nicht geheilt, weil ihnen mit `window.bm520ArtView(name)` ein
  kanonischer Auflöser VORGESCHALTET ist und die Karte nur ein Rückfall ist —
  ob sie tot sind, hängt an den Artefakt-Namen und gehört eigens gemessen.
  ⇒ Beim nächsten Bündel mitprüfen; der (a3)-Durchgang meldet sie nicht, weil
    `Artefakt`/`Readout` nicht in seiner Bündelliste stehen.
- **Drei Handstellen-Werkzeuge ohne `--selfprobe`:** `_b2b3a_hand.js` und
  `_b2b3b_hand.js` (seit R901 bzw. R902) fallen aus dem Negativproben-Sammellauf
  heraus, weil dessen Erkenner ein Werkzeug an genau diesem Zweig erkennt —
  ihre Handstellen werden von ihm **nie** nachgeprüft. Das ist die
  `ueberholt`-Klasse eine Ebene tiefer: nicht das Werkzeug rottet, sondern
  seine Zugehörigkeit zum Lauf. `_b2b3c_hand.js` hat den Zweig seit R903;
  die beiden älteren bekommen ihn, wenn ihr Bündel das nächste Mal angefasst wird
  (jetzt nachzuziehen hätte den Sammellauf mit `ueberholt`-Meldungen belastet,
  ohne dass R903 dafür etwas kann).

0-ϣ. **⚠ NEU (R903): DIE ELLIPTISCHE ZUSAMMENSETZUNG.** `Risk- und Prognose-Review`
   bindet ZWEI Köpfe an EIN Kopfwort, und nur einer wandert. Wandert das Kopfwort, ist
   der geschützte Kopf STILL mitumbenannt, **ohne dass seine Zeichenfolge irgendwo im
   Bestand aufgetaucht wäre** — keine Schutz-Regel, kein Zeuge und kein Golden sehen das.
   ⇒ Vor jedem Lauf `grep -oE "[A-Za-zÄÖÜ]+- und [A-Za-zÄÖÜ]+-<Altbegriff>"`; die
     Auflösung ist eine HANDSTELLE, keine Regel (ihr Ersatz müsste den Altbegriff
     ausschreiben, und die Selbstprobe „Kein Ersatz enthält den Ausgangsbegriff"
     verbietet das zu Recht — er wäre nicht idempotent).

0-χ. **⚠⚠ NEU (R902): EINE PROBE, DIE MIT `indexOf` SUCHT, IST ZEICHEN- UND
   GROSS/KLEIN-GENAU — UND DER BESTAND IST ES NICHT.** `_b2_halbiert.js` fand die
   Regex-Bindungen dieses Bündels nicht, weil der Bestand seine Beschriftungs-Regexe
   anders schreibt: `/Dom.nen-Scores/i` setzt für den Umlaut einen **Platzhalter**
   (die Zeichenkette steht dort gar nicht), `/ctc|forecast|eac|budget/.test(t)`
   schreibt **klein**, weil der Prüftext kleingeschrieben ankommt. Gemeldet wurde
   **eine** Stelle; der neue Durchgang findet **sieben weitere**, und **vier** davon sind
   echte stille Funktionsausfälle (eine Dashboard-Karte ohne Klick-Pfad, drei Drilldowns
   ohne Register). Die übrigen drei sind durch E52/E53/E54 geschützt und treffen
   unverändert — sie sind der Beleg, dass diese Schutz-Entscheide Funktion erhalten.
   ⇒ Geheilt ist das Werkzeug: **Durchgang (a3)** sucht schreibweisen-unabhängig und
     meldet als eigene Klasse `REGEX~`. ⚠ Er ist ein **Verdacht**, keine Meldung —
     eine Alternative wie `trend` trifft auch nach der Umbenennung noch.
   ⚠ Bei derselben Gelegenheit fiel auf, dass die MISCH-Hälfte desselben Werkzeugs
   seit B2 auf `z.indexOf("Gate")` festgenagelt war und in jedem späteren Bündel nur
   Zeilen meldete, die zufällig „Gate" enthielten.

0-ψ. **⚠⚠ NEU (R902): DAS VORFELD EINES KOMPOSITUMS SIEHT KEINE MESSUNG.**
   Wandert das **Kopfwort** (`Kunden-Rollout` → `Kunden-Einführung`), wechselt das
   Geschlecht genauso wie bei der nackten Form — aber `_b2b_schwere.js` zählt GENUS
   und ADJ **nur an nackten Stellen**, `_b2b3b_vorfeld.js` misst nur die nackte Form,
   und die Vorfeld-Regeln sind auf die nackte Form gemünzt. Der erste Lauf schrieb
   *„Den Kunden-Einführung per Checkliste aufsetzen"*.
   ⇒ **`node _terminologie/_b2b3b_kompgenus.js <ref>` vor dem Lauf**, mit der
     Kompositum-Liste des eigenen Bündels.
   ⚠ Sein erster Wurf übersah **zwei von acht** Stellen, weil zwischen Artikel und
   Substantiv ein **HTML-Element** steht (`für den <b>Kunden-Rollout</b>`). *Eine
   Auszeichnung ist für eine Vorfeld-Messung unsichtbar, solange das Muster sie nicht
   kennt.*

0-ω. **⚠⚠ NEU (R902): EIN ANKER DARF DIE ZEICHENKETTE VERLASSEN, ABER NICHT AM RAND
   BEGINNEN UND NICHT IN EINEN BEZEICHNER HINEINREICHEN.** Der Ersetzer verwirft eine
   Regel per `KLASSE-`-Grund **ohne einen Zähler zu bewegen** — ein Bericht mit lauter
   Nullen ist von „nichts gefunden" nicht zu unterscheiden. Zwei Formen sind real
   zugeschlagen: eine Regel, die am **Anführungszeichen** beginnt (dort steht CODE,
   nicht die Zeichenkette — die Schutz-Regel auf dem Enum-Wörterbuchpaar fiel aus und
   der Lauf entwertete die englische Übersetzung des Enum-Werts), und ein Anker, der
   in einen **CAMEL-Bezeichner** hineinreicht (`Reporting '+(c.reportingPeriod` — der
   Ersetzer sieht `reportingPeriod`).
   ⇒ Nach jedem Lauf die **Trefferzahl je Regel** lesen: eine Regel mit lauter Nullen
     ist entweder tot oder falsch verankert.
0-ϝ. **⚠⚠ NEU (R902): EIN PRÜFVEKTOR BRAUCHT SEINEN ERREICHBARKEITS-AUSWEIS,
   BEVOR ER GESCHRIEBEN WIRD.** Der erste Wurf von H-R902 maß drei Namen am
   laufenden Fenster, die dort nicht existieren: `rowsForKind53`,
   `ARTIFACT_VIEW52` und `inferKind53` sind **IIFE-lokal**. ⚠ Ein vierter war
   schlimmer: **`window.BPMN_PROCESSES` EXISTIERT** und trägt zur Laufzeit einen
   anderen Bestand als der Quelltext — die Override-Falle der Goldenen Regel 2.
   ⇒ *Ein vorhandener Name ist keine Zusicherung über seinen Inhalt.*
   ⇒ Vor jedem Wert-Vektor: `grep "^(function" <block>` und ein Blick, ob der
     Name am Fenster nur EXISTIERT oder auch das TRÄGT, was der Quelltext zeigt.
     Wo nichts erreichbar ist, ist der Artefakt-Text die ehrliche Zweitwahl —
     benannt als schwächer, nicht als gleichwertig ausgegeben (R893-Form).

0-ϛ. **⚠ NEU (R902): DIE ASSERT-MELDUNG KAPPT DER RUNNER BEI 500 ZEICHEN.**
   Ein Prosa-Vorspann füllt sie vollständig, und der rote Lauf meldet dann die
   Begründung statt der Messwerte. Die Begründung gehört in den Blockkopf, die
   **FLAGS nach vorn**.

0-ϟ. **⚠⚠ NEU (R902): EINE SELBSTPROBE-SCHWELLE ALTERT MIT DEM PROGRAMM.**
   `_b2b_jargon.js` verlangte „der stärkste UNGELAUFENE Begriff trägt > 20
   Stellen". R900 hatte den ANKER beweglich gemacht, nachdem `Backlog` daran
   zerbrochen war — die ZAHL blieb stehen und zerbrach eine Ebene höher.
   ⇒ Eine Schwelle gegen eine Menge, die das Programm selbst leerräumt, ist
     immer eine Zeitbombe. Sie gehört an die ZUSICHERUNG (`> 0`), der
     Vakuum-Schutz an eine Größe, die nicht schrumpft.
   ⚠ Und ein Erkenner, der Prosa nicht von Code trennt, meldet reihenweise
   Falsches: `_selfprobes.js` hielt erst jede ERWÄHNUNG von `--selfprobe` für
   eine Selbstprobe, dann ein ZITAT im Kommentar — in diesem Haus wird über
   Code ständig geschrieben (dieselbe Falle wie beim Schutzriegel-Hook, R894).

**Die Liste von R901:**

0-Ϫb. **⚠⚠ NEU (R904): EINE VERSIEGELUNG DECKT IHRE ZEILE — DIE ANDERE HÄLFTE
   EINES VEKTOR-PAARES STEHT AUF EINER EIGENEN.** Versiegelt wurde die VORLAGE
   eines Compare-Vektors (`{ …, action: 'Snapshot', … }`), die ERWARTUNG sechs
   Zeilen tiefer (`'Invalid Date', '', 'Snapshot',`) blieb ungeschützt und wurde
   verdeutscht. Der Vektor behauptete danach einen Widerspruch und riss den
   deep-Assert H-R879. ⚠⚠ **Kein statisches Werkzeug sah ihn:** eine MISCH-Zeile
   gibt es nicht (zwei Zeilen), ein sprachliches Signal auch nicht, und
   `_b2b3a_ensoll.js` — die Probe, die es für genau diese Klasse gibt — war auf
   ihr erstes Bündel festgenagelt und maß die falsche Zielform.
   ⇒ **Durchgang (d) DATEI-MISCH** in `_b2_halbiert.js`: trägt eine Datei den
     Altbegriff auf einer VERSIEGELTEN Zeile und den Neubegriff im Fenster ±15?
     Wirk-bewiesen am echten Bruch (mit ihm: `testport.ts:1684 (+6)`; ohne ihn
     schweigt er). ⚠ Die Verengung auf versiegelte Dateien und das Fenster sind
     beide gemessen: ohne die erste meldete er alle 71 Lauf-Dateien, ohne das
     zweite für eine Datei 38 Zeilen — also in beiden Fällen eine Liste, die
     niemand liest, und damit dieselbe Klasse wie gar keine Probe.
   ⚠ Wer eine Zeile versiegelt, übernimmt die Verantwortung für ALLES auf ihr
     (Master-Prompt) — und muss zusätzlich fragen, ob die andere Hälfte des
     Paares auf einer eigenen Zeile steht.

0-ο. **⚠⚠ NEU (R901): DIE ZUSCHNITT-ZAHL IST EIN ROHBESTAND, KEINE OFFENE MENGE.**
   `_b2b_zuschnitt.js` rechnet gegen `_b2b_gefahr.js`, und der kennt den REGELBESTAND
   nicht — er fragt `entscheide()` mit einer FIKTIVEN Regel. Nach fünf abgeschlossenen
   Bündeln überzeichnet er systematisch: seine Ausgabe führte `Runbook` mit 18,
   `Variance` mit 5, `Severity`/`Actuals` mit je 1 — Begriffe, deren Bündel **„Rest 0"
   gemeldet haben**. Alle diese Stellen sind von Regeln GEDECKT (bei `Runbook` von den
   drei E3-Schutzregeln, die den Begriff ABSICHTLICH stehen lassen).
   ⇒ **`node _terminologie/_b2b3_offen.js` VOR jedem Zuschnitt.** Gemessen VOR R901:
     2.522 roh, 66 gedeckt, **2.456 offen**, acht Begriffe fallen ganz heraus.
     ⚠⚠ **NACH R901 misst dasselbe Werkzeug 1.683 / 75 / 1.608 über 36 Begriffe** —
     die Zahl ist ein STAND, kein Fixwert, und sie ist nachzumessen statt
     fortzuschreiben. Die erste Fassung dieses Absatzes rechnete `2.456 − 920`
     und verfehlte den echten Wert um 72 (R901-Review, MAJOR 14).
   ⇒ *Die R897-Lehre „Rest 0 heißt NICHT nichts mehr zu tun" gilt auch in der
     GEGENRICHTUNG: eine Stelle mit Begriff heißt nicht, dass dort noch etwas zu tun ist.*
   ⚠ Der erste Wurf des Werkzeugs fragte `entscheide(…, null)` — **ohne Wortgrenzen** —
   und zählte `Reviewer`/`OwnerId` mit (`Review` 702 statt 91), bei GRÜNER Selbstprobe.
   Geheilt per **PIN-Probe gegen `_b2b_gefahr.messen()`**: zwei Wege, eine Zahl.

0-π. **⚠⚠ NEU (R901): EINE KONTEXTABHÄNGIGE ZIELFORM (E4) BRAUCHT EINE MESSUNG JE
   KONTEXT — und die Zielform-Tabelle führt nur EINE.** `ZIELFORM['Owner']` stand auf
   `Verantwortlich`, der SPALTENform, die mit B2b-1d längst gelaufen war. E4 schreibt
   für den Fließtext `verantwortliche Rolle` vor. Ein Lauf mit der Tabellenform hätte
   durchweg falsches Deutsch erzeugt (`mit Owner` 148× → *„mit Verantwortlich"*).
   **`Verantwortlich` ist ein ADJEKTIV und kann im Fließtext nicht als Substantiv
   stehen** ⇒ die E32-Klasse „die Zielform IST der Zuschnitt", erstmals nicht an einer
   Kollision, sondern an der **WORTART**. Die Schwere-Messung rechnete mit der falschen
   Form, ohne dass etwas rot wurde.
   ⚠ Aus derselben Wurzel folgen zwei weitere Kontexte, die je ein eigenes Instrument
   brauchten: die **RACI-POSITIONS-AUFZÄHLUNG** (`_b2b3a_raci.js`, 23 Stellen — `Owner`
   als Etikett neben `Accountable`/`Approver`) und die **GROSSSCHREIBUNG** an Satz-,
   Zeichenketten- und Elementanfängen (`_b2b3a_gross.js`, **263** Stellen).

0-ρ. **⚠⚠ NEU (R901): EINE FENSTERBREITE IST EINE LEISE GRENZE.**
   `istAufrufEnglisch` suchte den Aufrufnamen der Form `L('<de>','<en>')` in einem
   Fenster von **220 Zeichen**. Das reicht für **826 von 829** Aufrufen — und für drei
   nicht. Einer davon trägt einen deutschen ersten Parameter über 220 Zeichen; der Lauf
   hielt den zweiten darum nicht mehr für die englische Seite und **verdeutschte sie**.
   Die deutsche Seite sagt dort „Bauherr" und wurde gar nicht getroffen ⇒ **der Schaden
   lag AUSSCHLIESSLICH in der englischen Fassung**, und kein Wörterbuch-Zeuge konnte ihn
   sehen; gefunden hat ihn allein `_lprobe.js`.
   ⇒ *Eine Fensterbreite liefert kein falsches Ergebnis — sie liefert gar keines.*
   Geheilt auf 1200, **am Bestand gemessen** (Maximum 364), mit KO-Drehung bewacht.

0-σ. **⚠⚠ NEU (R901): DER GOLDEN-DIFF HAT WIEDER GEFUNDEN, WAS KEINE ZAHL MELDETE** —
   zum zweiten Mal nach R900, und diesmal zwei Grammatik-KLASSEN auf einmal:
   **(a) die AUFZÄHLUNG NACH EINER PRÄPOSITION** — „Risiken **mit** Wahrscheinlichkeit,
   Status, Risikominderung und *verantwortliche* Rolle": `mit` regiert den Dativ, und
   zwischen Präposition und Begriff stehen drei weitere Glieder, die eine Vorfeld-Regel
   per Bauart nicht sieht (11 Stellen). **(b) der MASKULINE RÜCKVERWEIS** — „Verantwort-
   liche Rolle ist **der, der** reagieren muss" (2 Stellen). Werkzeug
   `_b2b3a_kasus.js`. ⚠ Dazu das **NACHFELD** (Possessivpronomen im Folgetext) und die
   **WORT-DOPPELUNG mit dem eigenen Kopfwort** (`title="Rolle (verantwortliche Rolle)"`)
   ⇒ *jede mehrwortige Zielform, deren letztes Wort ein gewöhnliches Substantiv ist,
   kann mit sich selbst kollidieren — an Stellen, die VOR dem Lauf unauffällig sind.*
   ⚠⚠ Und die Prüfvektoren: ein Vektor hält oft BEIDE Seiten eines Wörterbuch-Paares
   fest, und der Ersetzer traf beide (`=== "Verantwortliche Rolle per register"`).
   `_b2b3a_ensoll.js` misst das — **seine erste Fassung fand nur einen von zwei Fällen**,
   weil sie eine Wortliste englischer FUNKTIONSwörter führte und ein englisches VERB
   nicht kannte. Geheilt durch eine formunabhängige Regel: *dieselbe deutsche Zielform
   kann NIE auf beiden Seiten eines Wörterbuch-Vergleichs stehen.*

**Vor jedem Lauf zu erledigen — die Liste ist seit R899 um drei Punkte länger:**

0-κ. **⚠⚠ NEU (R900): DIE ZWEI-BEDEUTUNGEN-PROBE IST JETZT EINE MESSUNG.**
   Auflage 1 (unten) stand seit R895 da und hatte **kein Instrument** — die Liste
   `ZWEIDEUTIG` wurde von Hand gepflegt und von Hand geglaubt. `_b2b_jargon.js`
   misst den Anteil der ersetzbaren Stellen im eigenen Prüfbestand (Schwelle
   **> 50 %**, Rausch-Untergrenze 8 Stellen, beide Richtungen). Beim ERSTEN Lauf
   fand sie einen echten Fehlzuschnitt: `Tooltip` **57 %**.
   ⚠⚠ Und die Lehre daraus ist größer als der Befund: die automatische Klasse
   hatte denselben Begriff aussortiert, aber mit der FALSCHEN Begründung
   (Datenquote — nachgesehen drei Test-Literale und ein Wörterbuch-Schlüssel).
   Wer nur den Fehlalarm korrigiert, holt den Begriff in den mechanischen Lauf.
   ⇒ **Zwei Kriterien, ein Begriff, gegenläufiges Urteil: das SCHÄRFERE gewinnt.**

0-λ. **⚠⚠ NEU (R900): DIE ABKÜRZUNGS-AUFLÖSUNG — zwölfte Trägerform, und die
   erste, bei der die englische Wortfolge KEIN Anglizismus ist.**
   `{term:"SSOT", def:"Single Source of Truth. …"}` sagt, wofür die Buchstaben
   stehen; das Kürzel bleibt (Fachkürzel wie PMO, RACI, HOAI). Eingedeutscht
   bleibt der Satz grammatisch heil und verliert seine AUSSAGE — **kein Fehler,
   sondern eine gelöschte Erklärung**, und darum von keiner Zählung zu sehen.
   Werkzeug `_b2b_abkuerzung.js` (Kürzel aus den Wortanfängen in zwei Lesarten,
   Fenster 120 Zeichen) — es liefert ausdrücklich **eine Liste zum Ansehen, kein
   Urteil**: nicht jede Stelle eines abgekürzten Begriffs ist eine Auflösung, und
   ein Werkzeug, das hier automatisch schützte, ließe Fließtext stehen und sähe
   dabei wie Sorgfalt aus (R897).
   Geschützt wird am ORT mit dem dritten Zeilen-Marker **`2026k-ABKUERZUNG`**.
   ⚠ **Die Grenze des Markers gehört mitgedacht: eine ZEILE kann ein ganzes
   Wörterbuch sein** (`0003:6609` ist rund 1.000 Zeichen und trägt daneben
   `Contingency`, das wandern soll), und einzeiliges JSON hat gar keine Zeile für
   einen Kommentar — dort greift nur die Schutz-Regel auf die Zeichenfolge.

0-μ. **⚠⚠ NEU (R900): DAS `en`-FELD IN DER OBJEKT-FORM `{de:…,en:…}` IST FÜR
   ALLE WÖRTERBUCH-ZEUGEN UNSICHTBAR.** Der Ersetzer sieht dort einen gewöhnlichen
   Zeichenketten-Wert. In R900 traf er ihn ZWEIMAL: `en:'Timeline'` wurde zu
   `en:'Zeitachse'` — **obwohl `de` schon deutsch war, also AUSSCHLIESSLICH die
   englische Seite** — und `de:'Burndown',en:'Burndown'` wurde beidseitig deutsch.
   `_engolden`, `_enheil` und `_b2_englobal` vergleichen Wörterbuch-PAARE und sind
   dafür per Bauart blind. **`_b2b_enfeld.js` ist die einzige Probe, die es sieht
   — sie gehört nach JEDEN Lauf**, und ihr Befund ist seit R900 zusätzlich im
   Vektor H-R900 als Gate verankert.

0-ν. **⚠⚠ NEU (R900): DER GENUS-TEST DER SCHWERE-MESSUNG WAR FAIL-OPEN — und der
   Golden-Diff hat gefunden, was er verschwieg.** `_b2b_schwere.js` bestimmte den
   Geschlechtswechsel als `(GENUS_ALT[alt] || '?') !== (GENUS_NEU[ziel] || '?')`;
   bei ZWEI unbekannten Begriffen ist das `false`, also "kein Wechsel". Der
   Kommentar daneben versprach fail-closed, und die Selbstprobe schrieb die
   Implementierung nach statt den Vertrag zu prüfen. FOLGE: für B2b-2 stand in
   JEDER Zeile ein Strich in der GENUS-Spalte, und der Lauf schrieb `Decisions ins
   Backlog` zu `Decisions ins Arbeitsvorrat` um (sächlich → männlich).
   Geheilt: `istWechsel()` ist fail-closed, die Tabellen sind ergänzt, die
   Selbstprobe prüft den VERTRAG mit KO-Drehung.
   ⚠ Zwei Auflagen folgen daraus für jeden weiteren Schnitt: **(a) die
   Vorab-Handmessung der Begleitwörter muss die VERSCHMOLZENEN Präpositionen
   mitnehmen** (`ins`, `zum`, `zur`, `ans`, `aufs`, `beim`, `vom`) — die
   R900-Handmessung deckte nur `der/die/das/ein…` und lief an der einzigen
   Fehlstelle vorbei; **(b) ein Begriff kann im Haus ZWEI Geschlechter tragen**
   (`den Backlog` neben `aktualisiertes Backlog`); eingetragen wird die Form, die
   den Wechsel AUSLÖST.
   ⚠⚠ Und die Dach-Lehre: **gefunden hat es das LESEN des i18n-Golden-Diffs**,
   nicht eine Messung — die R899-Nachtrag-Auflage 0-θ in ihrer nützlichen
   Richtung. Bei einem Terminologie-Lauf steht dort jeder geänderte Sichttext
   einzeln nebeneinander; das ist die einzige Stelle, an der ein Grammatikfehler
   auffällt, den keine Zahl meldet.

0-δ. **⚠⚠ NEU (R899): EIN POSITIONS-SCHNITT HAT SIEBEN TRÄGERFORMEN, NICHT ZWEI.**
   Der Spaltenkopf-Schnitt B2b-1d begann mit zwei gemessenen Formen (`label:"X"`
   neben einem Datenschlüssel · `<th …>X</th>`). Bis er grün war, kamen fünf
   weitere dazu, und **jede einzelne wurde erst durch einen roten Prüfvektor
   sichtbar, nie durch eine Messung**:
   | # | Form | gefunden durch |
   |---|---|---|
   | 3 | `k:` / `f:` statt `key:` als Datenschlüssel | die eigene Diskriminanten-Probe |
   | 4 | `<feldname>:'<Beschriftung>'` — die Label-Tabelle des Steckbriefs (`0382:15`) | Parität A18-0 |
   | 5 | der **deutsche** Zweig eines Sprach-Ternärs (`0909:24`) | deep R700 |
   | 6 | eine **zusammengesetzte** Beschriftung (`Hängt ab von (Decision-IDs)`) | die Live-Messung der Spaltenreihe |
   | 7 | eine Kopfzeile als **Array-Element** (`head:['Berichtspunkt','Label']`) | deep R838 |
   ⚠⚠ Form 4 trug zusätzlich eine **Kollision**: `owner:'Owner'` → `Verantwortlich`
   stieß auf ein bereits vorhandenes `responsible:'Verantwortlich'`. Aufgelöst über
   die RACI-Lesart (`responsible` → *Durchführend*) — dieselbe Klasse wie E32
   (`Register`) und E33 (`Übergabe`), nur an einer Beschriftungstabelle statt an
   einem Begriff. ⇒ **Vor jedem Positions-Schnitt: die Trägerformen ERHEBEN, nicht
   annehmen.**

0-ε. **⚠⚠ NEU (R899): DER ERSETZER KANN DIE EINGABE EINES PRÜFVEKTORS BESCHÄDIGEN —
   nicht nur seine Erwartung.** R894 hat gelernt, dass ein Lauf eine Test-ERWARTUNG
   verderben kann. R899 zeigt die schärfere Form: der Sammel-Nachzug der
   Freigabe-Namen über `deep-test.html` überschrieb die **Eingabe** des frisch
   gebauten H-R899 (`name:'G0 Bedarfsplanung'` → `'LPH 0 …'`). Die Migration hatte
   danach nichts mehr zu heilen, die inhaltliche Prüfung meldete **grün** — und nur
   der VAKUUM-RIEGEL fiel um. ⇒ Ein Vektor ohne Vakuum-Riegel hätte hier eine
   Arbeit bestätigt, die gar nicht stattgefunden hat. Eingaben, die die ALTE Form
   tragen müssen, werden darum **zusammengesetzt** notiert (`'G'+'0 …'`), damit ein
   künftiger Lauf sie nicht wieder trifft.

0-ζ. **⚠⚠ NEU (R899): EINE VERSIONS-ZAHL IST ENTWEDER EIN ENDSTAND ODER EIN SCHRITT.**
   Das Nachziehen der Schema-Revision `2.24.0` → `2.25.0` über die Harnesse traf
   auch `step898.to==='2.24.0'` — die Erwartung eines FREMDEN Migrationsschritts,
   der weiterhin nach 2.24.0 führt. Ein pauschales Ersetzen über beide Bedeutungen
   ist immer falsch; die Schritt-Grenzen sind einzeln durchzusehen.

0-ι. **⚠⚠ OFFEN (R899-Nachtrag, bewusst NICHT im Buendel geheilt): DIE FREIEN
   ANKER IN `src/core/*.ts` TREFFEN DIE RICHTIGE DATEI UND OFT DAS FALSCHE
   KONSTRUKT.** Der zweite adversariale Durchgang hat den Nachzug mechanisch
   nachgerechnet (176 von 176 geaenderten Vorkommen exakt der Abbildung, alle
   Spannen vorwaerts, keiner ueber ein Dateiende) — und dann die SEMANTIK
   geprueft: `escapeIcs (0003:4675)` zeigt auf eine `STATE.gates.filter`-Zeile,
   die Funktion steht bei 5289; drei Anker zeigen auf LEERE Zeilen. Maschinell
   geprueft, soweit der Doku-Name als Symbol im Zielblock deklariert ist:
   **78 pruefbar, 9 falsch**. Der Versatz ist VORBESTEHEND (ueber zwoelf Commits
   hinweg trug die Zeile nie das genannte Konstrukt) — der Nachzug hat die
   Fehlstelle korrekt weitergerechnet und damit falsche Buchfuehrung mit einem
   gruenen Lauf bestaetigt.
   ⚠ **Warum kein Gate es sieht:** die 7x-Prongs pruefen das `kopf`-Praedikat nur
   an der QUOTIERTEN Ankerform in zehn Verzeichnis-Dateien; fuer die freien Anker
   in den Doku-Kommentaren gibt es KEIN Praedikat, und der Inventar-Prong prueft
   bewusst nur „Zeile existiert und ist nicht leer".
   ⇒ **Die Heilung ist ein eigener Schnitt:** das `kopf`-Praedikat auf die freie
   Form ausdehnen (Name vor der Klammer ⇒ naechste vorangehende Deklaration), mit
   beziffertem Ist-Stand und ausgewiesener Ausnahmeliste — sonst ist der Prong
   sofort rot. Bauform gibt es bereits (`KRIT_PROBE`/`RAHMEN_PROBE`).
   ⚠ Bis dahin gilt: **ein `src/core`-Anker in der KURZFORM ist ein Hinweis auf
   die Datei, keine Zusage ueber die Zeile.** Wer ihn benutzt, greppt nach dem
   NAMEN (Goldene Regel 2), statt der Zahl zu glauben.

0-η. **⚠⚠ NEU (R899-Nachtrag): JEDE REGEL BRAUCHT BEIDE WORTGRENZEN — AUCH DIE
   VORFELD-REGELN.** Die Hausregel (Auflage 4) galt bis hierher nur für die NACKTEN
   Regeln, als sei ein Begleitwort kein Wort. Die Regel `der Severity` griff
   INNERHALB von `oder` und schrieb sichtbaren Text zu `Priorität odem Schweregrad`
   um. `der` steckt in `oder`/`wieder`/`jeder`, `die` in `Studie`, `den` in
   `werden`/`finden`. Alle **288** ersetzenden Regeln mit Begleitwort tragen jetzt
   `wortanfang: true`; die Klasse misst `_terminologie/_b2b_wortgrenze.js` (Pflicht im
   Sammellauf) über die **183** Regeln, denen `wortanfang` bewusst fehlt.
   ⚠⚠ Die Probe darf dafür KEINE Handliste von Begleitwörtern führen — ihre erste
   Fassung tat es und war für 176 Regeln blind (`beim Gate`, `Jedem Gate`,
   `sein Decision File`). Sie fragt die REGEL-Eigenschaft, nicht ein Wörterbuch.
   ⚠ Der Preis ist gemessen: die vierzehn `ein…`-Regeln verlieren damit die
   kein/mein/sein/dein-Familie (`keinem Gate` = `k` + `einem Gate`, und
   `keiner Freigabe` ist korrekt, weil `-em → -er` der Geschlechtswechsel IST) —
   mit `entscheide()` gemessen fällt **jede** solche Stelle in die Klasse KOMM, wird
   also ohnehin nicht angefasst. Kosten null; ein künftiges `keinem <Begriff>` in
   sichtbarem Text fällt der Rest-Messung als Stelle ohne Regel auf.

0-θ. **⚠⚠ NEU (R899-Nachtrag): EIN GOLDEN-REFRESH VOR DER FEHLERSUCHE ERKLÄRT DEN
   FEHLER ZUR NORM.** Der `odem`-Schaden wurde MIT dem Refresh in
   `_i18n_golden.json` eingecheckt; der i18n-Wächter hätte ihn nie wieder gemeldet
   und jede Heilung als Abweichung angezeigt. ⇒ **Der Golden-Diff wird GELESEN,
   nicht bloß erzeugt** — bei einem Terminologie-Lauf ist er die einzige Stelle, an
   der jeder geänderte Sichttext einzeln nebeneinandersteht. (R894-Lehre, hier in
   ihrer teuersten Form.)

0-α. **⚠⚠ NEU (R899): `node _terminologie/_ankerschub.js HEAD --probe` NACH dem Lauf.**
   Ein Terminologie-Lauf fügt KOMMENTARE ein, und jede eingefügte Zeile verschiebt
   die **7x-Anker** der Verzeichnisse. In R899 waren es **392 Stellen** über **drei
   Träger** (`src/core/*.ts` quotiert · die `ausnahmen`-Tabellen in `_check_static.js` ·
   `_rebuild/funktions_inventar.json`/`.md` in KURZ- und VOLLFORM, dazu **Anker-SPANNEN**).
   ⚠ Das Werkzeug ist **nicht idempotent** — ein zweiter Lauf verdoppelt den Versatz;
   es verriegelt sich selbst und bietet `--zurueck` an. Danach
   `node _rebuild/phase6_kopplung.mjs --write` (die Matrix hängt am Inventar).
   ⚠⚠ **NACHTRAG R899, GEMESSEN: das Werkzeug war in Dateien blind, die es SELBST
   bearbeitet.** `src/core/*.ts` lief mit `frei: false`, also nur über die
   QUOTIERTE Ankerform — die Doku-Kommentare **derselben Dateien** tragen den Anker
   aber in der Kurzform (`/** titleOf (0534:79) */`). Gemessen: **272 quotierte
   nachgezogen, 2.069 freie nie angefasst, 211 davon allein durch R899 falsch**
   (kein einziger Fehlgriff — alle 2.069 treffen einen echten Block). ⇒ **Die
   TRÄGERliste zu prüfen reicht nicht; die FORMENliste JE Träger gehört dazu.**
   Geheilt (`frei: true` für src/core · einmaliger `--nachzug` mit Maskierung der
   schon geschobenen Anker · neue Ziel-Einschränkung `--nur=`).

0-β. **⚠⚠ NEU (R899): eine Versions-Zahl in einem Prüfvektor ist entweder ein
   ENDSTAND oder ein SCHRITT — ein pauschales Ersetzen über beide ist immer falsch.**
   Das Nachziehen `2.24.0`→`2.25.0` traf auch `step898.to==='2.24.0'`, also die
   Erwartung eines FREMDEN Migrationsschritts. Zeichengenau die R897-Klasse „ein Lauf,
   der seine eigene Erwartung mit anpasst" — hier an einer fremden.

0-γ. **⚠⚠ NEU (R899): eine TAUTOLOGIE kann zwischen ZWEI Feldern entstehen, die erst
   ein Dritter zusammensetzt.** Der Wörterbuch-Schlüssel eines Prozesses ist die
   VERKETTUNG aus `goal` und `desc`; beide lesen sich einzeln sauber und wiederholen
   sich erst nebeneinander. An keiner der beiden Einzelstellen ist das zu sehen —
   `_b2b_tautologie.js` findet es, weil es gegen den **Vorstand** misst.

0-τ. **⚠⚠ NEU (R901-Review): EINE DATENSTRUKTUR, DIE WIE EINE BESCHRIFTUNGSLISTE
   AUSSIEHT, MUSS KEINE SEIN — und der Kommentar darüber sagt es.**
   `0909:26` führt `var FLD=[['status','Status',0],['owner','Owner',0], …]`. Das
   zweite Element ist **kein Etikett, sondern ein NACHSCHLAGE-SCHLÜSSEL** in die
   Sprachtabelle `LB` zwei Zeilen darüber (`en ? {Owner:'Owner'} :
   {Owner:'Verantwortlich'}`). Die Übersetzung fand dort längst statt. Wer den
   Schlüssel dreht, lässt `LB['Verantwortlich']` ins Leere laufen; der Fallback
   `||lk` zeigt danach in BEIDEN Sprachen „Verantwortlich" — auf Deutsch
   zufällig richtig, **auf ENGLISCH falsch**. ⚠⚠ Und der Kommentar stand
   unmittelbar darüber: `[objKey, LB-Key, istDatum]`.
   ⇒ **Kein Instrument dieses Programms kann das sehen** — es ist kein
     Wörterbuch-Paar, kein `en:`-Feld, kein Aufruf, kein englischer Satz.
     Gefunden hat es der adversariale Review.

0-υ. **⚠⚠ NEU (R901-Review): `Array.isArray(fundstellen())` IST KEIN
   VAKUUM-RIEGEL.** Drei von sechs neuen Werkzeugen trugen ihn — und er ist
   STRUKTURELL nicht widerlegbar: die Funktion gibt immer ein Array zurück, auch
   mit totem Dateizugriff. Der Review hat `E.sammleDateien` auf `() => []`
   gedreht, und alle drei Selbstproben blieben **grün**; besonders schwer bei
   `_b2b3a_ensoll.js`, dem einzigen fail-closed Wächter der sechs (er meldete
   „BEFUNDE: 0 (MUSS 0 sein)" und beendete grün).
   ⇒ Ein Vakuum-Riegel hängt an der gelesenen **DATEIMENGE** — nicht an einem
     Rückgabetyp (tautologisch) und nicht an TREFFERN (zerbricht am eigenen
     Erfolg, sobald die Heilung wirkt).
   ⇒ **Ein Riegel je Werkzeug ist eine Handliste**: `_b2b3a_zugriff.js` fährt die
     Drehung EINMAL für alle sechs. ⚠ Sein erster Wurf war selbst ein Vakuum —
     bei `node -e` hat `process.argv` nur ein Element, das angehängte
     `--selfprobe` landete auf Index 1 und war für `slice(2)` unsichtbar; die
     Probe fuhr den Normalbericht und meldete alle sechs fälschlich als
     tautologisch.

0-φ. **⚠⚠ NEU (R901-Review): DIE ADJ-KLASSE HAT EINE ZWEITE SCHICHT — DEN
   ARTIKEL VOR DEM ADJEKTIV.** R898 lernte, dass die Vorfeld-Regeln das
   ADJEKTIV nicht erreichen. R901 zeigt die nächste: eine Regel wie
   `klaren Owner` → `klare verantwortliche Rolle` dekliniert das Adjektiv
   richtig und lässt den **Artikel davor** maskulin stehen, weil er außerhalb
   ihres Fensters liegt — `braucht einen klare verantwortliche Rolle`. Die
   Regel `einen Owner` → `eine verantwortliche Rolle` hätte ihn gedreht,
   verliert aber gegen die LÄNGERE Adjektiv-Regel. Zwei Stellen, **beide im
   ausgelieferten Artefakt**, und wieder nur an der SPRACHE zu sehen.
   Werkzeug: `_b2b3a_kasus.js` Klasse C (geschlossene Artikel-Liste, keine
   Musterregel).

0. **⚠⚠ NEU (R898): Prüfen, ob die Werkzeuge das RICHTIGE Bündel messen.**
   Vier von ihnen waren auf B2b-1a festgenagelt und meldeten nach dessen
   Freigabe brav GRÜN — für ein Bündel, das gar nicht mehr lief; bei
   `_b2b_tautologie.js` ist das real passiert. Alle Bündel-Werkzeuge tragen
   jetzt `--buendel=<B>` als **Pflicht-Argument** und sind fail-closed. Ein
   Werkzeug, das ohne Bündel läuft und trotzdem eine Zahl liefert, ist ein
   Befund, kein Komfort.
0b. **⚠⚠ NEU (R898): `_b2b_schwere.js --buendel=<B>` VOR dem Zuschnitt.**
   „Schwer nach leicht" meint die gemessene Schwere (Zusammensetzungen ·
   Geschlechtswechsel · Kollisionen · Prüfvektoren), **nicht** die Stellenzahl.
0c. **⚠⚠ NEU (R898): `_b2b_join.js HEAD` vor UND nach dem Lauf.** Namens-Joins
   zwischen zwei Listen (Katalog ↔ `outputs`) reißen bei einseitiger
   Umbenennung **still**. Gemessen wird die **Verwaisung**, nicht die
   Namensmenge — eine beidseitige Umbenennung ist der erwünschte Ausgang und
   darf nicht rot werden.
0a-bis. **⚠⚠ NEU (R898), und die drei teuersten Punkte der ganzen Liste:**
   **(i) Die ADJEKTIV-Klasse.** Die Vorfeld-Regeln und die Genus-Probe decken
   **Begleitwörter**, nicht das **Adjektiv** — `den kompletten` (m) wird zu
   `die komplette` (f). In R898 wurden daraus **17 Stellen falsches Deutsch bei
   GRÜNEN Gates**, weil der Ersetzer die Prüfvektoren mitgezogen hatte: der
   Fehler war nur an der **Sprache** zu sehen, an keiner Zahl.
   `_b2b_schwere.js` hat dafür jetzt die Spalte **ADJ**; für B2b-1c meldet sie
   `Severity` 3/2, wo die alte Messung **0** auswies.
   ⚠ Dazu die **verwaiste Kurzform** (`Trail` neben einem Titel, der
   „Nachweiskette" sagt): sie steht in **keiner** Begriffsliste und ist für
   jedes Inventar unsichtbar — sie gehört von Hand mitgesucht.
   **(ii) Eine GEWEITETE Regel braucht dieselbe Sorgfalt wie eine verengte.**
   `_b2_halbiert.js` findet, was **zu wenig** trifft; **kein Werkzeug prüft, ob
   ein von Hand geweiteter Regex jetzt zu viel trifft**. In R898 traf die eigene
   Heilung eine fremde Schwelle mit.
   **(iii) Ein Test-Literal kann eine EINGABE in fremder Sprache sein**, keine
   Erwartung an deutschen Text — beides sieht im Quelltext gleich aus. ⚠ Der
   Ersetzer ist **case-sensitiv**: die GROSSSCHREIB-Variante daneben bleibt
   stehen, und die Vektoren stehen danach in zwei Sprachen nebeneinander.

0c-bis. **⚠⚠ NEU (R898): die beiden KLASSIFIZIERER-Riegel gegenprüfen.** Zwei
   sperrten in R898 sichtbaren deutschen Text, **bündelübergreifend**:
   `ATTR_TECHNISCH` traf den Schwanz von `textContent=` (geheilt, aber im Baum
   stehen **353** solcher Zuweisungen, davon 153 anzeigetext-artig) ·
   `istSprachSchluessel` hält **jeden** groß beginnenden Schlüssel für einen
   Sprachschlüssel und sperrte damit eine ganze Vorlagen-Tabelle **seit dem
   ersten Bündel** (sie trug noch B2- und B2b-1a-Altbestand). Die strukturelle
   Heilung des zweiten steht **aus** und gehört vor B2b-1c — sonst bleibt die
   Tabelle dort erneut unsichtbar.

0d. **⚠⚠ NEU (R898): `_b2b_escape.js --buendel=<B>` und `_b2b_enfeld.js`.** Zwei
   Trägerformen, die KEIN Bestandsinstrument sah: ein Begriff hinter einer
   Escape-Folge (`\nWort` ⇒ CAMEL-Fehlgriff, für den Ersetzer unsichtbar und in
   **keiner** Rest-Liste) und eine deutsche Zielform im Wert einer
   `en`-**Eigenschaft** (kein Wörterbuch-Paar, darum für `_dictheil.js` und
   `_b2_englobal.js` unsichtbar).

1. **Zwei-Bedeutungen-Probe zuerst:** trägt der Begriff im Haus auch
   Entwicklersprache? (R895-Lehre 1) — sonst wird die eigene Werkzeugkette
   unlesbar. `_b2b_inventar.js` markiert die bekannten Fälle als „zweideutig";
   die Markierung ist eine **Hypothese**, die gegen die Fundstellen zu prüfen
   ist, kein Messergebnis.
2. **⚠⚠ NEU (R897): `_b2b_altnamen.js` VOR dem Golden-Refresh.** Sie findet
   entwertete **Abwärtskompatibilität** — Synonymlisten, Migrationstabellen,
   Aliasse, die den ALTEN Namen absichtlich festhalten. In R897 hätte der Lauf
   dort Owner-Dubletten bei Bestandsständen erzeugt, **ohne dass ein Gate rot
   wurde**; die Erwartung des zuständigen Prüfvektors wurde vom selben Lauf mit
   angepasst. Solche Stellen sind für einen klassenscharfen Ersetzer von
   Oberflächentext ununterscheidbar — erkennbar nur am **Umfeld**.
3. **⚠ NEU (R897): `_b2b_kollision.js` VOR dem Lauf.** Ist die Zielform im Haus
   schon vergeben? In E32 fand das der Owner, in E33 die Messung. Wo beide
   Begriffe in einer Zeile stehen, wird **einzeln** entschieden.
4. **Beide Wortgrenzen** an jeder nackten Regel; die Rest-Liste
   (`_b2_rest.js <Begriff> --buendel=<B>`) muss „keine Regel" = 0 zeigen.
   ⚠ Der Begriff ist seit R896 Pflicht-Argument.
5. **`_b2_halbiert.js --buendel=<B>` nach dem Lauf** — Regex-Literale, Sollwerte
   und Eigenschafts-Zugriffe. ⚠ **Das Bündel ist seit R897 Pflicht-Argument**
   (der alte Vorgabewert `B2` maß im R897-Lauf real das falsche Bündel und sah
   dabei nach einer erledigten Auflage aus).
6. **`_b2_englisch.js` und `_b2_englobal.js` nach dem Lauf** — beide
   blocklisten-frei, beide mit eigener KO-Drehung.
7. **Grammatikprobe `_b2b_tautologie.js <ref>`** — sie misst gegen den
   **Vorstand**, nicht absolut. ⚠ Eine absolute Zählung meldete im R897-Bestand
   181 Kandidaten, fast alle legitim.
8. **Prüfvektoren (`tests`) von Hand durchsehen** — der Ersetzer kann eine
   Test-ERWARTUNG beschädigen (R894-Lehre 5; in R897 zum zweiten Mal
   eingetreten, diesmal an der Wert-Ebene).
9. **Golden-Refreshes erst NACH der Fehlersuche** (R894-Lehre 2 gilt fort).
10. **⚠⚠ NEU (R898): sinkt beim EN-Golden-Refresh die SCHLÜSSELZAHL, nachmessen
    BEVOR committet wird.** Zwei deutsche Schlüssel können durch die Umbenennung
    auf denselben fallen. Tragen beide **denselben** englischen Wert, ist es eine
    Entdoppelung (so in R898: `Abweichung:` und `Variance:` → beide
    `"Variance:"`). Tragen sie **verschiedene**, ist eine Übersetzung
    **verloren** — und dafür gibt es bislang **kein Instrument**: der i18n-Lint
    prüft Wert-Kollisionen (Homographen), nicht das Verschmelzen zweier
    Schlüssel. Die Zahl im Golden-Diff ist der einzige Ort, an dem es sichtbar
    wird.

**Danach B3–B12** nach Bündelplan §5. Die Kennungsmigration **E28**
(`G0–G9 → LPH 0–9` + `GATE-<KURZ>-G<n> → LPH-<KURZ>-<n>`) bleibt der einzige
**nicht umkehrbare** Schnitt und braucht eigene Vorabmessung und eigenen Review;
die Auflage zum falschen Parser `/G(\d+)\b/` (`0003:3255` + Kopie
`wordartefakte.ts:381`) steht unverändert.

### Offener Kandidat (unverändert seit R894)

Der **Karten-Wettlauf** in `berechtigungen`: Erbauer (bm-v357) und Aufräumer
(bm-v552) arbeiten gegeneinander; die Kartenzahl dieser Ansicht ist dadurch eine
Zufallsgrösse. Der Golden steht auf 5 (= Absicht des Bestandscodes).

---

## §9-ALT — der Stand nach R894 (Lehren unverändert gültig)

### R894 im Wortlaut

**R894 IST ABGESCHLOSSEN.** Bündel **B1 + B1b + B1c** sind gebaut, belegt und
released; alle 16 Prüfläufe grün, Negativproben-Sammellauf grün, adversarialer
Review durchlaufen, OneDrive publiziert.

### Was in R894 steht

| Beleg | Ergebnis |
|---|---|
| Textumstellung B1 | 2.561 Bestand · 64 Modul · 747 Datenstände · 16 Prüfvektoren |
| **B1b** (Widerruf R572) | `Action-Übersicht`→`Maßnahmen-Übersicht`, `Action-Plan`→`Maßnahmenplan`, `Gegenmaßnahme`→`Risikominderung` |
| **B1c** (E29 Leistungsphase) | `Phasenregister` → **Leistungsphase**: 106 mechanisch + 9 von Hand (Numerus-/Verbwechsel) + Nav-Label |
| **E31** (Etappe) | Companion-Einführungsphasen `Phase 1..5` → `Etappe 1..5`, 9 Sichtstellen in zwei Sätzen |
| Neuer Block `bm-v961` | englische Navigation, compile **845** |
| **Englische Fassung unverändert** | `_engolden.js` → 5.456/5.456 · 0 weg · 0 neu — **UND** `_lprobe.js` → 822 Aufrufe über 9 Formen, 0 bewegt |
| Nav-Wache | `_terminologie/_navwache.js` → grün |
| Prüfläufe | Compile 845 · deep **1433/0** · Selftest **529/0** · Sim **456/0** · Live-Smoke **99/0** · EN **66/0** · EN-Golden 20/0 · EN-Residue **10/0** (`residueMax` 891→**888**) · Parität 265/0 |

### ⚠⚠ Was aus R894 WEITER TRÄGT (über dieses Programm hinaus)

**1. Es gibt SIEBEN Formen, in denen englischer Text entsteht — vier Literale,
ein Funktionsaufruf, ein ternärer Ausdruck und ein Wörterbuch ohne Store.**
Die Aufruf-Form `L('<deutsch>','<englisch>')` trägt keinen Doppelpunkt, keine
`en`-Marke, keine Schlüsselposition — jede der vier bekannten Erkennungen ist
daran per Bauart blind. Sie verbargen zusammen **zwanzig echte Schäden** an der englischen
Fassung (`Readout of ` → `Managementbericht of ` u. a. in
`0922-bm-v912-b4-readout-cockpit.js`). Gefunden hat sie **kein Instrument**,
sondern der adversariale Blick auf einen ganz anderen Vektor.
⇒ **Die FORMEN-LISTE ist Prüfling.** Der Erstwurf der neuen Probe kannte nur den
Bezeichner des Zufallsfunds; erhoben sind **neun** (`T` 94× · `L` 60× · `L61` ·
`L775` · `bm955T` · `L946` · `L916` · `L945` · `L950`, zusammen 822 Aufrufe).
Werkzeug `_terminologie/_lprobe.js`, **fail-closed** gegen unbekannte Formen.

**2. Ein Golden-Refresh VOR der Fehlersuche adelt den Fehler.** Der
Residue-Wächter hatte die drei Schäden gesehen (als „deutscher Rest im
englischen Modus"); der Baseline-Refresh lief davor und fror sie als Sollzustand
ein. Erst der Lauf nach der Heilung meldete sie als *verschwunden* — und war
damit ein unabhängiger Zweitbeleg der Heilung.

**3. Eine Erkennung, die von Daten abhängt, die das Werkzeug selbst verändert,**
**verhält sich im zweiten Lauf anders als im ersten.** Der dateiweite
Wörterbuch-Schutz hing an Umlauten in Schlüsselposition — die dieses Programm
einträgt. `0014-basis.js` galt **vor** B1 als normal, **danach** als Wörterbuch.
Folge: der B1-Lauf war unvollständig (58 Stellen), ohne dass eine Regel sich
geändert hatte. Geheilt auf **paar-lokale** Entscheidung.

**4. Der Ersetzer fasst Zeichenketten an, aber keine REGEX-Literale.** Wo ein
Vektor seine Fixture als String und die Erwartung als `/…/` führt, wandert nur
die eine Hälfte — der Vektor wird **halbiert** und ist danach weder alt noch
neu. Fünfmal aufgetreten (R377, R543, R572-Kernlabels, R850, SIM-Word).

**5. Der Ersetzer kann die ERWARTUNG eines Tests beschädigen.** Im Bereich
`tests` wurde der *erwartete englische* Zieltext eines EN-Boot-Slots verdeutscht
(`indexOf('Risk Register')` → `indexOf('Risikoregister')`). Verwandt mit „das
Werkzeug frisst seine eigene Ausnahme", aber eine Stufe subtiler: es trifft nicht
Sollwert-DATEN, sondern Sollwert-ERWARTUNGEN. **Wurzel ist der ungeschützte
Testbereich** — vor dem nächsten Lauf über `tests` gehören die EN-Erwartungen in
`livesmoke3` geschützt (Kandidat: Marker-Zone analog zur `UNBERUEHRBAR`-Liste).

---

### ⚠⚠ Was der ZWEITE Review-Durchgang fand — alles in den Reparaturen des ersten

Die Hausregel „ein Durchgang reicht nicht" hat sich zum zweiten Mal bestätigt:
**20 MAJOR im zweiten Durchgang, die schwersten in den Heilungen des ersten.**

**6. Eine Reparatur, die nur an der Zeichenklasse dreht und die BAUART stehen**
**lässt, kann schlimmer sein als der Fehler.** Die Escape-Heilung ersetzte
`[^\\]` durch `(?:[^\\]|\\.)`, behielt aber die Backreference-Form
`(["'])…\1`. Ein einzelner Apostroph in einem Kopfkommentar fraß daraufhin
einen Treffer über **41.891 Zeichen**: `0859` fiel von **748 auf 2** erkannte
Paare, `0938` von 165 auf 4. Weil `_enheil.js` denselben Parser nutzt, meldete
es GRÜN, nachdem es 2 von 748 Einträgen angesehen hatte.
⇒ **Wer einen Parser ändert, misst die AUSBEUTE JE DATEI, nicht die Summe.**
Die Summe (22.075 → 21.407) sah nach einem kleinen Minus aus und verbarg, dass
zwei Dateien fast vollständig ausgefallen waren. Richtig ist, das eigene Quote
aus der Zeichenklasse auszuschließen — mit Backreference in JS nicht
ausdrückbar, also **zwei getrennte Muster** (jetzt 22.681 Paare, längster
Treffer 312).

**7. Es gibt eine ACHTE Form — und sie ist die einzige mit SICHERHEITS-Folge.**
`[onchange*="Readout"]` (`0054-permguard`, `0057-projectlock`) ist ein
CSS-Attribut-**Teilstring**-Selektor. Er matcht auf FUNKTIONSNAMEN, die nach
E15 unverändert bleiben. Verdeutscht trifft er **nichts mehr**:
Berechtigungs-Guard und Projektsperre fielen an diesen Feldern **still aus**.
Kein Gate konnte das sehen — es ist kein Text, der falsch aussieht, sondern ein
Schutz, der aufhört zu wirken. Ursache: `istAttributPosition` kannte nur
`attr=`; jetzt sind alle Operatoren gedeckt (`= *= ^= $= ~= |=`).

**8. Der Bezugsstand eines Vorher-Nachher-Wächters ist der Stand VOR dem**
**Programm, nie der letzte Commit.** `_lprobe.js` ankerte auf `HEAD` — und HEAD
ist der B1-Zwischenstand *mit* dem Schaden. Die Probe meldete darum die
**Heilung** als Verstoß, und ihr `--heile` hätte den Schaden zuverlässig
zurückgeschrieben. Ein Wächter, der die Reparatur rückgängig macht, ist
schlimmer als keiner. Fest auf `8b00e8b`.

**9. Eine Einzelzeile zu reparieren heilt keine Wurzel.** Der erste Durchgang
benannte richtig, dass der ungeschützte Testbereich das Problem sei; die
EN-Erwartung wurde trotzdem nur als Zeile gedreht — und vom **nächsten Lauf**
**prompt wieder verdeutscht**. Erst der Zonen-Vertrag hält: eine Zeile mit dem
Marker **`2026k-EN-SOLL`** ist für den Ersetzer unberührbar.
⚠ **Jede neue EN-Erwartung im Testbereich gehört mit diesem Marker versehen.**

**10. Ein Marker-Schutz, der eine ganze Datei sperrt, kann sie unmigriert**
**lassen.** `0904-datamgmt` trägt den `__bm907S`-Marker, führt aber
`[<kategorie>, <deutsches Label>]`. Dateiweit geschützt blieb sie **zu 100 %**
unmigriert (bytegleich mit dem Vorstand), und die Datenmanagement-Ansicht
zeigte „Gate-Katalog" neben einer sonst deutschen Oberfläche. Die
Unterscheidung leistet `istUebersetzungstabelle` — sie lag ungenutzt in
`_dictfind.js`, obwohl sie genau dafür gebaut war.

**11. Ein Riegel, dessen Wirkung das Urteil nicht erreicht, ist ein Vorwand.**
`_enheil.js` urteilte allein nach `bewegt.length`; verworfene und nicht
paarbare Stellen gingen nicht ein. Es konnte eine ganze Datei übergehen und
GRÜN melden. Jetzt fail-closed, mit Vakuum-Riegel **im Lauf** (nicht nur in
der Selbstprobe) und einem Wirk-Beweis auf den Fund-Pfad.

### ⚠ Offener Punkt aus dem zweiten Durchgang (nicht in R894 gebaut)

`0708-bm-v716.js:105` vergleicht `cur.type==="Management-Readout"` und bietet
denselben Wert im Auswahlmenü an — ein **gespeicherter Fachwert**. Der Lauf hat
ihn nach `Managementbericht` gezogen. In den ausgelieferten Daten kommt er
**nicht** vor (0 Treffer im Demo-Stand), es ist also kein akuter Schaden; für
bereits gespeicherte NUTZERdaten wäre es einer. Gehört nach **Entscheid E2**
(Anzeigeschicht) in Bündel **B7** — dort mit Migrationsschritt.

---
### §9a-ALT (R894) — durch §9a oben ersetzt

**B2 — `Gate` → `Freigabe`** (Entscheid E27). Der größte Textschnitt des
Programms und der letzte vor den Kennungen.

**Gemessen liegt vor** (`_terminologie/messung_lph.md`):

| Klasse | Zahl | Behandlung |
|---|---:|---|
| sichtbarer Gate-Text gesamt | **1.958** (1.555 Produkt · 403 Test) | |
| davon **Zeitpunkt-Sinn** | **233** an 138 Ankern | ⚠ **Einzelentscheidung**, keine Wortregel — „1 Woche vor Gate", „Gate-Datum", „am passenden Gate freigeben" |
| davon **gemeinsam mit Leistungsphase** | **44** (+55 in Kommentaren) | ⚠ werden bei wörtlicher Ersetzung tautologisch; mit „Freigabe" lösen sie sich auf — **einzeln lesen** |
| technische Bezeichner (E15/S6) | **≈ 4.120** | **unberührt** |
| ⚠ Grenzfälle Bezeichner+Sichttext in derselben Zeile | **18** | je eine Einzelentscheidung, Liste in der Messung §4 E4 |
| Kunden-Glossar `"Gate":"Quality Gate"` | 1 Paar + 23 abhängige | ⚠ ausgelieferte Kundenpakete verlieren sonst ihre Glossar-Zuordnung |

**Vor dem Lauf zu erledigen (aus den R894-Lehren):**
1. Die **EN-Erwartungen im Testbereich schützen** (Lehre 5) — sonst verdeutscht
   der Lauf erneut englische Sollwerte in `livesmoke3`.
2. `_lprobe.js` **nach** jedem Lauf fahren, nicht nur `_engolden.js` (Lehre 1).
3. Golden-Refreshes **erst nach** der Fehlersuche (Lehre 2).
4. Nach dem Lauf gezielt nach **halbierten Vektoren** suchen: Fixture als String
   gewandert, Erwartung als Regex stehengeblieben (Lehre 4).

**Danach B3–B12** nach Bündelplan §5; die Kennungsmigration **E28**
(`G0–G9 → LPH 0–9` + `GATE-<KURZ>-G<n> → LPH-<KURZ>-<n>`) ist der einzige
**nicht umkehrbare** Schnitt und braucht eigene Vorabmessung und eigenen Review
(S3-Muster). Ihre Auflage steht in E28: der Parser `/G(\d+)\b/` (`0003:3255` +
byte-gleiche Kopie `src/core/wordartefakte.ts:381`) ist **heute schon falsch**
(`GATE-BAUG3-G7` → `G3`) und muss im selben Schnitt verankert werden.

#### Offener Kandidat (Stand R894)

Der **Karten-Wettlauf** in `berechtigungen`: Erbauer (bm-v357) und Aufräumer
(bm-v552, R152 #6/#8) arbeiten gegeneinander; die Kartenzahl dieser Ansicht ist
dadurch eine Zufallsgröße. Der Golden steht auf 5 (= Absicht des Bestandscodes).
Sauber wäre, den Wettlauf zu entscheiden.
