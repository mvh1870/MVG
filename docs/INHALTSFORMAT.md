# Inhaltsformat

Stand P19.6 Integration (2026-10-04, alle 14 Stationen eingesetzt) und Technik IV (2026-10-04; Story-Format zusätzlich um `text-kurz`, `nur-kurzfassung`, Nebenfiguren und Stimmen, Wegkarten, `oberflaeche`, Absätze im Kärtchen, Schlagzeile und Eintrag-Kärtchen ergänzt – siehe „Format-Ergänzungen P19.6“; davor P19.5: Echos, Entscheidungsbuch, Kürzungen je Absatz, Vertiefung und fünf Mini-Arten, O-62; Neuausrichtung O-36 bis O-49). Verbindlich für alle Dateien unter `inhalte/` (O-18: Inhalte ohne Programmierung änderbar). Das Werkzeug `werkzeuge/inhalte.mjs` liest sie, prüft sie und schreibt `src/generiert/inhalte.json`; die Story übersetzt dabei `werkzeuge/geschichte.mjs`, die Explore-Texte `werkzeuge/explore.mjs`. Die Typen der Ausgabe stehen in `src/inhalte/typen.ts` und `src/geschichte/typen.ts`.

Kurz: Themen der Theorie, Startseite und Begriffs-Kompass sind **normales Markdown** mit **Kopfdaten** (YAML zwischen `---`) und **Containern** mit `:::` für alles, was eine feste Form hat; innerhalb eines Containers gliedern `###`-Überschriften die **Felder**. Story und Explore-Texte sind **YAML**-Dateien, deren Textfelder Markdown enthalten.

```
node werkzeuge/inhalte.mjs            # kompilieren (schreibt src/generiert/inhalte.json)
node werkzeuge/inhalte.mjs --pruefe   # kompilieren und alles prüfen; Exitcode 1 bei Fehlern
```

**Auf der Seite kein Bezug zur Vorlage** (O-38): Absatz-IDs aus V1.2 und Stellen aus V2.4 (`v24:hb-3.1`) belegen jede Fachaussage, stehen aber nur intern – in Kopfdaten, YAML-Kommentaren, Feldern `belege`/`beleg`/`deckt` und Container-Kennungen. Sie erscheinen nie im sichtbaren Text.

---

## 1 Dateien

| Datei | Inhalt | Kennung |
|---|---|---|
| `inhalte/start.md` | Startseite: Kicker, Leitsatz, These (4.1) | – |
| `inhalte/theorie/kNN-<name>.md` | ein Thema der Theorie (4.2) | `kNN`, z. B. `k04`; Adresse über `thema` |
| `inhalte/geschichte/rahmen.yaml` | Rahmen der Story: Auftakt, Figuren, Balken, Bilanz, Kärtchen, Ende (3) | – |
| `inhalte/geschichte/<kennung>-<name>.yaml` | ein Kapitel (Station) der Story (3) | seit P19.6 `s<n>` (`s1`, `s2`, `s3`, `s5`, `s8`, `s10`, `s12`, `s14` vorhanden, `s4`, `s6`, `s7`, `s9`, `s11`, `s13` folgen); `k<n>` gilt nur noch ohne `reihenfolge` (Übersetzer-Tests) |
| `inhalte/werkzeuge.yaml` | Texte und Beispiele der neun Explore-Werkzeuge (4.5) | – |
| `inhalte/glossar.yaml` | Glossar der Seite: Änderungen, Streichungen, neue Einträge (4.4) | `g-…` |
| `inhalte/begriffs-kompass.md` | Begriffs-Kompass (4.3) | je Eintrag eine Kennung |
| `inhalte/abdeckung.yaml` | Absatz-ID → Thema (4.6) | Absatz-ID |
| `inhalte/abbildungen/abb-N.yaml` | Beschreibung einer Abbildung der DOCX; daneben `abb-N.webp` und `stand.json` von `werkzeuge/abbildungen.mjs` (4.7) | `abb-N` wie in `whitepaper.json` |
| `inhalte/rechtliches/*.md` | Impressum und Datenschutz, gebaut von `werkzeuge/bau.mjs` (4.8) | – |
| `inhalte/fall.md` | Fall-Bibel: Nachschlagewerk der Autoren, wird nicht kompiliert (4.9) | – |

Kennungen (Kapitel, Themen, Optionen, Container …) bestehen aus Buchstaben, Ziffern und Bindestrich, **ohne Umlaute** (`entscheidungsvorlage`, `ueberblick`). Sichtbarer Text darf alles.

Zeichensatz UTF-8, Zeilenenden egal (werden zu LF). Dateien, die mit `_` oder `.` beginnen, werden ignoriert (Entwürfe). Eine andere `.md`- oder `.yaml`-Datei unter `inhalte/` meldet das Werkzeug als Warnung und ignoriert sie.

---

## 2 Grundbausteine (Markdown-Dateien)

### 2.1 Kopfdaten (YAML)
Am Dateianfang zwischen zwei Zeilen `---`. **Alle Werte werden als Text gelesen** und erst vom Werkzeug nach Schema umgewandelt (Zahl, Liste, ja/nein). Damit gibt es keine YAML-Fallen wie `no` → falsch oder `08:30` → Zahl.

```yaml
---
kapitel: 4
thema: verantwortung
reihe: 4
titel: Verantwortungsfelder des Bauherrn
teil: 1
kurzsatz: Die sechs Felder, in denen der Bauherr selbst entscheidungsfähig bleibt.
symbol: schild
---
```

Zu beachten:
- Schlüssel in Kleinbuchstaben mit Bindestrich (`titel-quelle`); im JSON werden daraus camelCase-Namen (`titelQuelle`).
- **`#` beginnt in YAML einen Kommentar** – dort stehen die internen Belege eines Themas.
- Ein Wert, der mit `[`, `{`, `*`, `&`, `!`, `|`, `>`, `@` oder `` ` `` beginnt, braucht Anführungszeichen. Text mit Glossarbezügen (`[[…]]`) gehört **nicht** in die Kopfdaten, sondern in ein Feld (2.3).
- ja/nein-Werte: `ja`, `nein` (auch `true`, `false`).

### 2.2 Container
```
::: art kennung
---
schluessel: wert
---
Text des Containers …
:::
```
- Öffnen: eine Zeile mit mindestens drei Doppelpunkten, dem **Art-Namen** und – je nach Art – einer oder mehreren **Kennungen** (`::: abschnitt k4.2`, `::: zitat k2.4-p2`).
- Schließen: eine Zeile **nur** aus Doppelpunkten (`:::`). Sie schließt immer den innersten offenen Container.
- Container dürfen verschachtelt werden (z. B. `etappe` in `etappen`); jede Art hat feste erlaubte Orte (4.2, 4.3).
- Direkt nach der Öffnungszeile dürfen Kopfdaten des Containers zwischen zwei `---`-Zeilen stehen (gleiche Regeln wie 2.1).
- Innerhalb von Code-Blöcken (```` ``` ````) werden `:::`-Zeilen nicht ausgewertet.

### 2.3 Felder
Innerhalb eines Containers (und auf oberster Ebene einer Datei) teilen `###`-Überschriften den Text in Felder. Text vor der ersten Feldüberschrift ist das Feld `text`. Aus der Überschrift wird der Feldname: Umlaute umgeschrieben, Wörter zusammengezogen (`### Rückseite` → `rueckseite`, `### Erklärung` → `erklaerung`). Welche Felder eine Art kennt, steht in Abschnitt 4; unbekannte Felder sind ein Fehler. Andere Überschriften (`#`, `##`, `####`) bleiben normaler Text.

Felder werden zur Bauzeit mit `marked` (GFM) zu HTML. Rohes HTML im Markdown wird **nicht** übernommen, sondern als Text angezeigt. Inline-Code (`` `RIS-009` ``) wird `<code>` und so in Monospace gesetzt – so werden Kennungen geschrieben.

Das Feld `leitfragen` eines `regie`-Blocks ist eine Markdown-Liste (jeder Punkt beginnt mit `- `); Text außerhalb der Liste ist ein Fehler.

### 2.4 Glossarbezüge
`[[Begriff]]` oder `[[Begriff|angezeigter Text]]` verweist auf einen Eintrag im Glossar der Seite (Einträge aus `quellen/whitepaper/v1.2/whitepaper.json`, angepasst durch `inhalte/glossar.yaml`, 4.4). Der Vergleich ignoriert Groß-/Kleinschreibung, weiche Trennzeichen und einen Klammerzusatz (`[[MVG]]` und `[[Minimum Viable Governance]]` treffen beide „Minimum Viable Governance (MVG)“). Glossarbezüge wirken in allen Markdown-Feldern, auch in den Textfeldern der Story und der Explore-Texte.

Ergebnis im HTML: `<span class="mvg-glossar" data-glossar="g-mandat" data-begriff="Mandat">Mandat</span>`. Die Oberfläche macht daraus den Mouseover/Fokus-Hinweis mit der Definition aus `inhalte.json → glossar`.

### 2.5 Zitate
- **Blockzitat:** `::: zitat k2.4-p2` … `:::` – der Text im Container muss wortgleich im Absatz stehen (O-17). Mehrere Absätze: `::: zitat k2.4-p1 k2.4-p2` (werden mit Leerzeichen verbunden). Auslassungen mit `[…]` sind erlaubt; jedes Stück muss dann in dieser Reihenfolge im Absatz stehen, an Wortgrenzen beginnen und enden und zwischen zwei `[…]` mindestens zwei Wörter tragen. Ein Zitat als Markdown-Liste ist nur erlaubt, wenn der Absatz eine Liste ist und jeder Punkt ein ganzer Punkt der Quelle ist (in ihrer Reihenfolge).
- **Inline-Zitat:** `[[zitat:k4.2-p3|die Bauherren-PL gibt bis einschließlich 100 TEUR eigenständig frei]]`.
- **Keine Bedienhinweise** (O-56): Die Spanne `[[bedienung:…]]` gibt es nicht mehr; der Prüfer meldet jeden Rest als Fehler. Die Lernwerkzeuge tragen ihre Beschriftung selbst (Titel, Körbe, Knöpfe, Stand). Auch im Fließtext keine Anleitungen („Klicken Sie …“, „Ziehen Sie den Regler …“) und keine Meta-Sätze über Bild, Text oder Herkunft – die Probe `werkzeuge/sichtbar.mjs` (`SICHTBAR_ARBEITSSTAND`) schlägt darauf an.

„Wortgleich“ heißt: gleich nach Normalisierung von Leerraum und Silbentrennung (`normalisiere()` aus `werkzeuge/whitepaper-lib.mjs`, geprüft gegen die Anzeigefassung aus `werkzeuge/anzeige-fassung.mjs`); Anführungszeichen, Striche, Groß-/Kleinschreibung zählen. Absatz-IDs: `k<abschnitt>-<p|l|t|b><n>`, z. B. `k2.4-p2` (zweiter Absatz in 2.4), `k3.2-t1` (erste Tabelle in 3.2).

Die Absatz-ID steht im HTML nur als Attribut (`<blockquote class="mvg-zitat" data-absatz="k2.4-p2">`); sichtbar erscheint keine Quellenangabe (O-38).

---

## 3 Story (P17.2, O-51/O-52): `inhalte/geschichte/`

Eine lineare Geschichte in 14 Stationen (drei Akte, P19) aus Sicht der Projektleitung des Bauherrn; verbindliches Drehbuch: `docs/DREHBUCH.md`. Übersetzer: `werkzeuge/geschichte.mjs` (aus `werkzeuge/inhalte.mjs` aufgerufen), Typen: `src/geschichte/typen.ts`, Ablauf: `src/geschichte/engine.ts`, Vergleich: `src/geschichte/mcda.ts`, Fläche: `src/ui/flaechen/geschichte.ts`. Alle Dateien sind reines YAML; Textfelder sind Markdown (Glossarbezüge erlaubt), lange Texte mit `|` als Block. Ein Wert mit „: “ braucht Anführungszeichen. **Unbekannte Felder und Dateien sind Fehler.** Jeder sichtbare Text läuft zusätzlich durch die Sichtbar-Probe (`werkzeuge/sichtbar.mjs`): kein „Kapitel“, keine Absatz-IDs, kein „Beleg“, keine Kennungen – die Seite sagt „Station 3 von 14“ (L-225). Kein Bild ohne Eintrag in `GIMMICKS` aus `src/grafik/figuren.ts`.

**`rahmen.yaml`:**

| Feld | Inhalt |
|---|---|
| `titel` | Titel der Geschichte (Auftakt) |
| `auftakt` | `campus` (s. u.), `text` (Markdown, nennt den Fall einmal fiktiv), `vorstellung` (Zeile über den Figuren), `los` (Knopf der Karte „Die ganze Geschichte“), `kurz` (Beschriftung der Kurzfassung „Kurzfassung (etwa n Minuten)“; die Minutenangabe steht auch auf der Karte „Die Kurzfassung“ und ist an die Messung gekoppelt, O-61); optional (P19.6) `balken-titel` (Überschrift über den drei Balken) und `wegwahl` (Texte der beiden Wegkarten) |
| `sie` | `steckbrief` der Spielfigur „Sie“ |
| `figuren` | genau fünf, in dieser Reihenfolge: `grundstein`, `faden`, `schwung`, `klingel`, `lot` – je `id`, `name`, `rolle`, `akzent` (Ton aus `src/stil/akzente.ts`), `steckbrief` |
| `balken` | `geld`, `zeit`, `vertrauen` – je `titel`, `text` (Kurztext beim ersten Auftritt), `start` (0–10), `mehr`/`weniger` (Wort der Änderung: „mehr Luft“, „gesunken“), `bilanz` (`hoch`, `mittel`, `niedrig`: je ein Satz) |
| `bilanz` | `nicht-getragen`, `letzte-meter`, `ruhig`, `umwege`, `offen` (neutral, solange auf dem Weg Entscheidungen offen sind, R73) – je `titel`, `text` |
| `mandat` | Kärtchen „Wer entscheidet was“: `titel`, `zeilen` (`{ wer, text }`; P19.6: `text` darf eine Liste von Absätzen sein, einzelne `{ text, kurzfassung: nein }`) |
| `nebenfiguren` | optional (P19.6): genau `ranzen`, `spitzfeder`, `pfennig` in dieser Reihenfolge – je `id`, `name`, `rolle`, `akzent` (Akzentton oder `keiner`), `kurz` (Namensschild beim ersten Auftritt), `steckbrief` (nur Regie) |
| `oberflaeche` | optional (P19.6): Wortlaut-Liste der Seite (Akt-Leiste, Pause, Buch, Verlauf …), geprüft, aber nicht gebaut – die Wörter stehen in `src/ui/woerter.ts` (siehe „Format-Ergänzungen P19.6“) |
| `reihenfolge` | optional (P19.3): Liste der Stationskennungen in der Reihenfolge der Geschichte (`[s1, s2, … s14]`: Kleinbuchstaben und Ziffern, jede einmal, zu jeder Kennung genau eine Datei `<kennung>-<name>.yaml`). Ohne `reihenfolge` gelten wie bisher nur Dateien `k<n>-<name>.yaml` in Zahlenfolge, die Nummer steht im Dateinamen |
| `akte` | optional (P19.3), Liste der Akte – siehe „Akte“ unten. Ohne `akte` verhält sich die Story wie bisher (keine Pause, keine Akt-Leiste, keine Kopfkarte, keine gebündelten Brücken) |
| `echos` | optional (P19.4), Liste der Echos (höchstens elf) – siehe „Gedächtnis: Echos“ unten. Ohne `echos` hängt keine Zeile an einer früheren Antwort |
| `buch` | optional (P19.4), das Entscheidungsbuch, ein Eintrag je Station – siehe „Entscheidungsbuch“ unten. Ohne `buch` gibt es kein Symbol, keine Seite, keinen Druck und keinen Schalter der Regie |
| `ende` | `zeit`, `campus`, `einstieg`, optional `einstieg-kurz` (wie im Kapitel), `szene` (Zeilen wie im Kapitel), `zeit-niedrig` (Absatz zusätzlich bei niedriger Zeit), `vertrauen-niedrig`, `nach-falle` und `offen` (je eine Liste `{ figur, text }`: ersetzt bei niedrigem Vertrauen bzw. – wenn das Vertrauen nicht niedrig ist – nach einer gewählten Falle bzw. – ohne Falle – bei offenen Entscheidungen (R73) die Zeile dieser Figur; die Figur spricht in der Szene, jede höchstens einmal; die Ersatzzeile steht auf denselben Wegen wie die ersetzte, L-239) |

**`<kennung>-<name>.yaml`** (eine Datei je Kapitel; `nr` lückenlos ab 1 – ohne `reihenfolge` wie im Dateinamen `k<n>-…`, mit `reihenfolge` die Stelle in der Reihenfolge, also nicht die Zahl der Kennung; die Kennung ist die Adresse `#story/<kennung>`; die Seite sagt sichtbar „Station“, nie „Kapitel" und nie die Kennung):

| Feld | Inhalt |
|---|---|
| `nr`, `titel`, `zeit` | Kopf (Pflicht); `zeit` sichtbar („April 2026“) |
| `campus` | `{ stufe: 0–8 oder eine Zwischenstufe 1.5 · 2.5 · 3.5 · 4.5 · 5.5 (P19.3), jahreszeit: fruehling·sommer·herbst·winter, licht: morgen·tag·abend }`, optional `wetter: sturm` (grauer Himmel, Böen, abgerissene Planen, umgekipptes Zaunfeld; R72) · `regen` (Regenstriche, dunkle Wolken, die Sonne bleibt) · `schnee` (dichter Schneefall auch außerhalb des Winters) · `nebel` (Nebelbänder, Laub bleibt; P19.3) – Bild von `src/grafik/campus-iso.ts`; optional `campus-nachher` (Bild nach der Folge) und `zusatz` (Gegenstand über dem Campus; derzeit ungenutzt – Wimpel in Stufe 2, Sturm über `wetter`, Luftballons in Stufe 8 zeichnet der Campus selbst, R73) |
| `kurzfassung` / `bruecke` | `kurzfassung: true` = gehört zur Kurzfassung (das erste Kapitel immer); jedes andere Kapitel braucht `bruecke` (ein Satz, erzählt den guten Weg; erscheint in der Kurzfassung als Brückenkarte; mit `akte:` als Zeile `Monat: Satz`, siehe „Format-Ergänzungen P19.6“) |
| `thema` | Kennung des passenden Themas (`#theorie/<thema>`, muss es geben) – Link im Kasten „Das steckt dahinter“ und „In der Story erlebt“ auf der Themenseite |
| `belege` | Pflicht, **nur intern**: Absatz-IDs aus V1.2 (`k4.2-p3`) oder Stellen aus V2.4 (`v24:hb-3.1`, `v24:tlb-2`, `v24:va-4.1`, `v24:hb-projektblatt`); Erläuterungen als YAML-Kommentar |
| `einstieg` | erzählender Absatz unter dem Campus |
| `einstieg-kurz` | optional, nur in Kapiteln der Kurzfassung (P17.5): derselbe Sachstand kürzer – die Kurzfassung zeigt ihn statt `einstieg`; muss weniger Wörter haben als `einstieg`; keine neue Fachaussage |
| `szene` | Liste `{ figur, text }` (`figur` ist eine der fünf Figuren, eine Nebenfigur aus `nebenfiguren` oder eine Stimme `vergabestelle` · `vertretung`, P19.6; optional `zusatz`: Regieanweisung in Klammern; ohne `figur` erzählt; `kurzfassung: false` = die Kurzfassung lässt die Zeile weg – nur in Kapiteln der Kurzfassung und im Ende, danach bleiben mindestens zwei Zeilen; auf dem ganzen Weg steht jede Zeile; P19.6: `text-kurz` ersetzt die Zeile in der Kurzfassung, `nur-kurzfassung: ja` setzt eine Zeile, die nur dort steht). P19.4: statt `text` eine **Echo-Zeile** `{ figur, echo: E7, fortsetzung?, fortsetzung-kurz? }` – siehe „Gedächtnis: Echos“ |
| `bild-szene`, `bild-frage` | optional, kleine Grafik aus `GIMMICKS` |
| `frage` | die Frage an Sie (ein Absatz) |
| `antworten` | **genau drei**, in der Reihenfolge der Seite; jede Wertung (`gut`, `vertretbar`, `falle`) genau einmal – nie sichtbar; je `text`, `balken` (`{ geld, zeit, vertrauen }`, ganze Zahlen −2 … +2), `folge` (Folge-Szene; Text oder gekürzt für die Kurzfassung, siehe „Kürzungen der Kurzfassung“; darf `{echo: E1}` enthalten), optional `folge-kurz`, `bild`, `schlagzeile` (P19.6: Unterschrift unter dem Bild `schlagzeile`) |
| `gut` | „So macht man es gut“ (zwei Sätze); wie `folge` kürzbar, dazu `gut-kurz` |
| `dahinter` | „Das steckt dahinter“ (ein Satz); wie `folge` kürzbar, dazu `dahinter-kurz` |
| `vertiefung` | optional (P19.5): zugeklappter Block am Ende der Station – siehe „Vertiefung“ |
| `mandat-nach-folge` | `true` = nach der Folge das Kärtchen „Wer entscheidet was“ (Kapitel 1); ab dem nächsten Kapitel an jeder Frage aufklappbar |
| `mini` | optional, Mini-Aufgabe (nur auf dem langen Weg): `art` (`zuordnen`, `reihenfolge` oder – P19.5 – `matrix`, `mappe`, `pinnwand`, `bericht`, `rueckfragen`, siehe „Neue Mini-Arten“), optional `stelle` (`nach-folge` Vorgabe · `vor-frage` · `vor-vergleich`, nur in der Station mit dem Vergleich), `titel`, `aufgabe`, `bild` (Pflicht, Grafik des Schritts aus `GIMMICKS`, O-53), `posten` (mindestens drei; `{ text, loesung, erklaerung }` bzw. bei `reihenfolge` `{ text, erklaerung }` in der richtigen Folge – die Seite mischt sie fest und zeigt sie nach dem letzten Klick geordnet als Pfad; optional `bild` je Karte), bei `zuordnen` `wahlen` (`{ id, titel }`, optional `figur` für ein Porträt auf dem Knopf, `bild` – haben die Wahlen Bilder, erscheinen sie als Ablagen mit der Zahl der Karten – `falsch`: feste Rückmeldung, nur für Wahlen, die nie richtig sind, und `heisst`: Legende zur Wahl, wortgleich aus den Erklärungen der Posten, L-252) |
| `vergleich` | genau ein Kapitel: `einleitung`, `kriterien` (`{ id, titel, gewicht }`, optional `im-satz`: der Name mitten im Satz mit Artikel, „der Schulstart“ – für die Kipppunkt-Sätze; nennt er zwei Dinge mit „und“, steht das Verb in der Mehrzahl; Gewicht 5 sehr wichtig · 3 wichtig · 1 weniger wichtig = abgestimmte Stellung), `optionen` (`{ id: A…, titel, punkte, worte }` je Kriterium Punkte 1–5 und Worte; `begruendung` intern), `saetze` (je Option und `gleichauf`), `empfehlung`, `wer` |
| `regie` | optional `notiz`, `leitfragen` – nur für die Regie (geht nach `geschichteRegie`) |
| `werkzeuge` | optional (P18.5, E-13), Liste `[{ id, beispiel }]` der Explore-Werkzeuge, die zum Kapitel passen: `id` = Adress-Kennung (`vorlagen-check`, `wegweiser`, `risiko-grenzen`, `monatsbericht`, …), `beispiel` (optional, nur bei Werkzeugen mit Beispielen) = Kennung eines Beispiels aus `werkzeuge.yaml`. Der Übersetzer prüft, dass Werkzeug und Beispiel existieren und ein Werkzeug nur einmal vorkommt. Sichtbar: leiser Verweis „Vorlagen-Check ausprobieren“ im Kasten „Das steckt dahinter“, öffnet über `#explore/<id>/<beispiel>`; in der Kurzfassung steht er im zugeklappten Aufklapper (zählt nicht zur Lesezeit), auf der Leinwand nie. Belegt (seit P19.7, Stationen s1–s14): s5, s7, s12 → Vorlagen-Check, s2, s4, s10, s11 → Wegweiser, s3, s8 → Risiko-Bewerter, s8, s9 → Monatsbericht; das Beispiel stammt immer aus derselben Station (4.5). In der Lesezeit zählt der Verweis auf dem ganzen Weg mit (zwei Wörter), in der Kurzfassung nicht |

**Akte (P19.3, O-62; optional): `akte:` in `rahmen.yaml`.** Eine Liste von Akten in der Reihenfolge der Geschichte; jeder Akt gruppiert aufeinanderfolgende Stationen. Felder je Akt (alle Pflicht außer `pause.zeile`):

| Feld | Inhalt |
|---|---|
| `id` | Kennung (`a1`, `a2`, …; Kleinbuchstaben, Ziffern, Bindestrich), je Akt einmal |
| `titel` | sichtbar „Akt I · Ordnung schaffen“ (die römische Zahl setzt die Seite nach der Stelle des Akts) |
| `zeitraum` | sichtbar, z. B. „Januar bis Juni 2026“ |
| `stationen` | Liste der Stationskennungen des Akts, in der Reihenfolge der Geschichte |
| `kopf` | **Kopfkarte**: ein Absatz über der ersten Station des Akts (nur auf dem ganzen Weg), darüber eine Kicker-Zeile „Akt I · Titel · Zeitraum · etwa n Minuten“ (Dauer aus der gemessenen Lesezeit des Akts, Stationen und Pause; die Kicker-Zeile zählt nicht zur Lesezeit) |
| `pause` | `koennen`: **genau drei Sätze** „Das können Sie jetzt“ (auf jedem Weg gleich; nur aus den Lernzielen der Stationen; intern auf V1.2/V2.4 zurückführbar, kein neuer Fachsatz); optional `zeile`: `{ figur, text }`, ein Satz einer Figur zu Beginn der Pause. Jeder Akt außer dem letzten hat am Ende eine **Pause** (eigener Schritt, nur auf dem ganzen Weg); die drei Sätze des letzten Akts stehen im Ende vor der Bilanz (seine `zeile` entfällt) |

Übersetzer-Prüfungen: jede Station genau in einem Akt, keine unbekannte Station, jeder Akt mindestens eine Station, die Akte nacheinander ergeben genau die Reihenfolge der Stationen (kein Sprung, kein Vertauschen), Akt-Kennung einmal, genau drei Sätze, unbekannte Felder sind Fehler; sichtbarer Text läuft durch die Sichtbar-Probe.

**Verhalten der Seite mit Akten (P19.3):**
- **Ortszeile** „Station 7 von 14 · Akt II · noch etwa 9 Minuten“; in der Kurzfassung „Station 2 von 4 · …“; in der Pause „Pause · Akt I geschafft · noch etwa n Minuten“. Die Restzeit rechnet die Seite deterministisch aus der gemessenen Lesezeit je Schritt (`src/geschichte/lesezeit-daten.json`, Wörter je Schritt des guten Wegs, ganzer Weg und Kurzfassung getrennt; Wörter ÷ 200, gerundet, mindestens eine Minute), vom aktuellen Schritt bis zum Ende. Fehlt für einen Schritt die Messung, steht keine Zeit. Die Datei erzeugt `node werkzeuge/lesezeit.mjs --schreibe`; `tests/lesezeit.test.ts` schlägt fehl, wenn sie veraltet ist.
- **Akt-Leiste** statt eines Felds je Station: nur der Akt der gezeigten Station ist aufgeklappt (ein Feld je Station), die anderen Akte je ein Feld mit der römischen Zahl; dazu das Sprungmenü „Station wählen“ (alle Stationen unter den Akt-Überschriften; nicht auf der Leinwand). Die Kurzfassung zeigt nur Akte mit gespielten Stationen. Zielgröße mindestens 24 px auch bei 320 px (Umbruch statt Schrumpfen unter 24 px).
- **Pause** am Aktende: Zwischenbilanz (Balken), **Verlaufsband** (drei Linien Geld · Zeit · Vertrauen über die Stationen bis zum Aktende, ohne Zahlen, vor den Bändern hoch/mittel/niedrig; Grafik `src/grafik/verlauf.ts`, Linienart und Beschriftung am Linienende, „Der Verlauf in Worten“ als Tabelle), „Das können Sie jetzt“, Knopf „Weiter mit Akt II“. In der Kurzfassung entfällt die Pause.
- **Brücken** der Kurzfassung gebündelt: übersprungene Stationen in Folge teilen sich eine Karte („Stationen 6 bis 8“, höchstens drei je Karte). **Ohne Akte** steht je Station eine Karte wie bisher.
- **Ende der Kurzfassung:** Knopf „Weiter mit der ganzen Geschichte“ – springt in den ganzen Weg an die erste Station, die die Kurzfassung nicht spielt; die Antworten bleiben.
- **Druck:** je Akt ein Abschnitt mit Akt-Überschrift (Seitenumbruch zwischen den Akten, Stationen eine Überschriftenebene tiefer), danach die Bilanz.
- **Speicher:** `gk.story` bleibt Fassung 2 (der Schritt `pause` ist eine zusätzliche Form). Kennt die Geschichte keine der im Stand genannten Stationen (alter Stand mit `k1` … `k8` in einer Geschichte mit `s1` … `s14`), ist der ganze Stand ungültig und wird verworfen – die Geschichte beginnt von vorn; einzelne unbekannte Einträge neben bekannten fallen einzeln weg.

**Gedächtnis: Echos (P19.4, O-62; `docs/drehbuch-v2/00-geruest.md` Abschnitt 4).** Ein Echo ist eine Zeile in drei Fassungen, die nach der **gespielten Antwort einer früheren Station** gewählt wird. Es ändert nur Ton und Wortlaut – nie eine Tatsache, nie einen Balken, nie die Bilanz (die Engine rechnet Balken und Bilanz ohne Echos; `tests/geschichte-echo.test.ts` vergleicht beides mit und ohne Echos über alle Stände). `echos:` in `rahmen.yaml`: Liste `{ id, quelle, fassungen: { gut, vertretbar, falle } }` – `id` Buchstabe, dann Buchstaben, Ziffern, Bindestrich (`E1` … `E10`, `E8b`; höchstens elf), `quelle` die Station, deren Antwort wählt, jede Fassung ein Absatz (Inline-Markdown). Die Wertung wird nie genannt: „Falle“, „vertretbar“ und „Wertung“ stehen in keiner Fassung (das gewöhnliche Wort „gut“ ist erlaubt). **Verwendung:** (1) als **Echo-Zeile** in einer Szene (Station oder Ende): `{ figur: grundstein, echo: E7, fortsetzung: "…", fortsetzung-kurz: "…" }` – statt `text`; die Engine setzt die Fassung ein und hängt die feste `fortsetzung` an (in der Kurzfassung `fortsetzung-kurz`, sonst `fortsetzung`); (2) als **Platzhalter** `{echo: E1}` im Fließtext von `folge` oder `einstieg` einer Station. **Fehlt die Antwort** der Quelle (Sprung, Kurzfassung ohne die Station, noch nicht gespielt), gilt die Fassung „gut“. **Regeln des Übersetzers:** die Quelle ist eine Station und liegt **vor** der Stelle; jedes Echo wird mindestens einmal gesetzt; unbekannte Echos und Platzhalter an anderen Stellen sind Fehler; eine Echo-Zeile in einer Station der Kurzfassung (oder im Ende), deren Quelle die Kurzfassung nicht spielt, trägt `kurzfassung: false`. Ausgabe: `geschichte.echos`, an der Zeile `echo`, `fortsetzungHtml`, `fortsetzungKurzHtml` (`html` hält die Vorgabe „gut“ samt Fortsetzung). Kennzahlen der Lesezeit: der gute Weg zählt die Fassung „gut“; die obere Schranke (`messeSchranke`) setzt je Schritt die längste Fassung an.

**Entscheidungsbuch (P19.4, O-62; `docs/drehbuch-v2/04-rahmen.md` 5).** `buch:` in `rahmen.yaml`: ein Eintrag je Station in der Reihenfolge der Stationen: `{ station, art, entschieden, grundlage, ergebnis }`; `art` = `beschluss` · `vermerk` (kein Beschluss) · `uebergabe` · `beschluss-uebergabe`; die Texte sind Inline-Markdown. Der **Anlass** ist der Monat der Station (`zeit`), kein Beschlussdatum. Das Buch nennt den Beschluss der **Stadt**, nie die Antwort der Leserin oder des Lesers: **jede Zeile muss auf jedem Weg wahr sein.** Der Übersetzer prüft: ein Eintrag je Station (nicht doppelt, nicht unbekannt, keiner fehlt), Art bekannt, ein Vermerk entscheidet „niemand …“ und ein Beschluss nie, und die Wörter „mitgeteilt“, „vollständig“, „am selben Tag“, „mit zwei/drei Wegen“, „Wertung“, „Punkte“, „Ihre Antwort/Wahl“ stehen nicht im Buch. **Verhalten der Seite** (Engine `buchEintraege`, `buchZugang`): ein Symbol (Buch mit Lesebändchen) neben der Ortszeile, sobald Station 1 abgeschlossen ist; ein Punkt (und für Screenreader das Wort „neu“) zeigt einen Eintrag, der beim letzten Öffnen noch fehlte (Speicher nur in der Seite, nicht im Browser); es öffnet das Buch als Seite über der Station (Titel fokussiert, Escape oder „Zurück zur Geschichte“ schließt, der Fokus kehrt zum Symbol zurück, jede Änderung des Stands schließt es). Ein Eintrag steht, sobald seine Station auf dem Weg gespielt ist (Antwort gewählt) und die Leserin oder der Leser nicht davor steht; ohne Eintrag der Leerzustand. **Kurzfassung:** gespielte Stationen voll, für jede übersprungene eine Zeile (Art und Ergebnis, ohne Kopf), sobald die Brückenkarte der Station gezeigt wurde. **Leinwand:** die Regie schaltet das Buch mit „Entscheidungsbuch zeigen“ ein (Feld `buch` im Bühnenstand; gilt nur für den Schritt, an dem es gedrückt wurde) – dieselbe Seite ohne Bedienung, ohne „neu“, ohne Antwort. **Druck:** eine eigene Seite im Querformat mit der Tabelle Nr · Anlass · Art · Entschieden von · Grundlage · Ergebnis, nur Zeilen bis zur aktuellen Station. Das Buch zählt nicht zur Lesezeit.

**Verlauf (P19.3, P19.4).** In der Pause und – mit Akten – in der Bilanz (auch in der Kurzfassung, auch bei offenen Stationen): Kicker „Ihr Weg bis hier“ bzw. „Ihr Weg im Überblick“ (zählt nicht zur Lesezeit), drei Linien ohne Zahlen vor den Streifen „gut gefüllt“, „etwa halb voll“, „knapp“, darunter der Aufklapper „Verlauf als Text“ (zugeklappt; auf Leinwand und im Druck offen): erste Zeile die Legende, dann je Station eine Zeile „4 · Titel: Geld etwas weniger übrig, Zeit …, Vertrauen …“ in den Wörtern der Folge (etwas · deutlich · unverändert) mit dem Stand. Eine Station ohne Antwort heißt „noch offen“, ihre Linie **reißt ab** (keine gestrichelte Verbindung); in der Kurzfassung sind übersprungene Stationen **hohle Punkte** („Hohle Punkte: nur erzählt.“). Keine Markierung „gut“ oder „Falle“. Die Zeile „Ihr Weg bis hier ist auf diesem Gerät gespeichert.“ steht in der Pause nur, wenn der Stand tatsächlich im Browser liegt, nie auf der Leinwand. Hat der Akt Stationen ohne Antwort, steht in der Pause statt „Das können Sie jetzt“ nur „Einige Stationen dieses Akts haben Sie noch nicht gespielt.“ mit dem Knopf zur ersten offenen Entscheidung.

**Kürzungen der Kurzfassung je Absatz (P19.5, `docs/drehbuch-v2/04-rahmen.md` 7.8).** `folge` (je Antwort), `gut` und `dahinter` sind entweder ein Text (wie bisher) oder eine **Liste**; jeder Eintrag ist ein Text oder `{ text, kurzfassung: false }` (der Eintrag steht nur auf dem ganzen Weg). `folge` und `gut` sind Markdown-Blöcke (die Einträge sind Absätze), `dahinter` ist ein Absatz (die Einträge sind Sätze, mit Leerzeichen verbunden). Daneben der **Ersatz** `folge-kurz`, `gut-kurz`, `dahinter-kurz`: ein kürzerer Text für die Kurzfassung (wie `einstieg-kurz`). Regeln: die Marke und der Ersatz nur in Stationen der Kurzfassung; nicht alle Einträge dürfen wegfallen; Marke und Ersatz nicht zugleich; der Ersatz hat weniger Wörter als der lange Text. Ausgabe: `folgeHtml`/`gutHtml`/`dahinterHtml` (lang) und – nur wo gekürzt – `folgeKurzHtml`/`gutKurzHtml`/`dahinterKurzHtml`; ohne Kürzung ändert sich die Ausgabe nicht. **Frage, Szene und Antworten gelten auf beiden Wegen**; einzelne Szenenzeilen tragen die Marke wie bisher. Ein **Echo mit fester Fortsetzung** (Klingel in Station 12) ist `echo: E7` mit `fortsetzung` und `fortsetzung-kurz`.

**Vertiefung (P19.5, `docs/drehbuch-v2/04-rahmen.md` 7.4).** `vertiefung:` an einer Station: `{ form, titel, text: [Absätze], antwort?: [Absätze] }`. `form` = `nachdenken` („Zum Nachdenken“: `text` ist die Frage, `antwort` steht hinter dem zweiten Aufklapper „Antwort“) · `zweiter-fall` („Ein zweiter Fall“: ein Beispiel in anderer Lage, nie ein Ereignis der Geschichte mit anderen Zahlen; ebenfalls mit `antwort`) · `warum-so` („Warum so?“: Erklärung in Absätzen, **keine** `antwort`). Jeder Absatz höchstens **60 Wörter**. Optional `kurzfassung: false` (die Vertiefung steht nie in der Kurzfassung; `true` ist ein Fehler). Auf der Seite: am Ende der Station (dort, wo „Das steckt dahinter“ steht), zugeklappt, Kicker mit der Form, Titel als Frage; **nur auf dem ganzen Weg, nur am Bildschirm** (nicht im Druck, nicht auf der Leinwand); zugeklappt zählt nur die Titelzeile zur Lesezeit.

**Format-Ergänzungen P19.6 (Technik IV, L-340 bis L-349; `tests/geschichte-uebersetzer-p196.test.ts`, `tests/geschichte-p196.test.ts`, `tests/figuren-p196.test.ts`, `tests/geschichte-oberflaeche.test.ts`).** Sie machen den Entwurf der Stationen 1 bis 14 (die Dateien der Schreiber) übersetzbar, ohne dass ein Satz geändert wird. Alles ist optional; ohne die neuen Felder bleiben Ausgabe und Seite unverändert (die Gegenproben der Tests).
- **Zeilen der Szene.** `text-kurz: "…"` ersetzt die Zeile in der Kurzfassung (bei einer Echo-Zeile die ganze Zeile samt Echo und Fortsetzung; sie braucht dann kein `kurzfassung: nein`, auch wenn die Quelle des Echos übersprungen wird). Regeln: nur in Stationen der Kurzfassung und im Ende, nicht mit `kurzfassung: nein` oder `nur-kurzfassung`, weniger Wörter als der Text (bei einer Echo-Zeile als die kürzeste Fassung samt Fortsetzung). `nur-kurzfassung: ja` – nur `ja`, nicht mit `kurzfassung: nein`, nur in Stationen der Kurzfassung und im Ende – setzt eine Zeile, die der ganze Weg nicht zeigt; auf jedem Weg bleiben mindestens zwei Zeilen. Ausgabe: `kurzHtml`, `nurKurz`; die Seite wählt über `zeilenAufWeg` (Engine).
- **Sprecher.** `figur` kennt zusätzlich `ranzen`, `spitzfeder`, `pfennig` (Nebenfiguren: sie sprechen nur, wenn `nebenfiguren` in `rahmen.yaml` sie führt) und `vergabestelle`, `vertretung` (Stimmen: ohne Eintrag, Name und Rolle aus `SPRECHER_NAME` in `src/grafik/figuren.ts`, Akzent `keiner`, Porträt = Umriss mit Sprechlinien statt Gesicht). Nebenfiguren haben ein Porträt in der Art der fünf Figuren (`NEBENFIGUREN` in `figuren.ts`, nicht in `FIGUREN`: sie erscheinen weder im Auftakt noch auf der Startseite). Das Namensschild `kurz` steht unter dem Namen bei ihrem ersten Auftritt in einer Szene (Station vor Ende), nie danach; der Steckbrief steht nur in der Regie unter der Notiz der Station („Nebenfiguren in dieser Station“). Die Wahlen einer Mini-Aufgabe kennen weiter nur `sie` und die fünf Figuren.
- **Auftakt.** `balken-titel` ersetzt die Überschrift „Drei Balken begleiten Sie“. `wegwahl: { ueberschrift, lang: { titel, text, knopf, bild }, kurz: { … } }` ersetzt die Wörter der beiden Wegkarten; die Zeile mit Zahlwort und Minuten rechnet die Seite (`ZAHLWORT` reicht bis „Vierzehn“). `bild` muss die Beschreibung sein, die die Seite aus der Zahl der Stationen bildet (der Übersetzer vergleicht, damit die Zahl nicht von der Datei abweicht). Ohne `wegwahl` gelten die Wörter aus `woerter.ts`.
- **`oberflaeche`.** Eine Wortlaut-Liste der Seite (Schlüssel: `OBERFLAECHE` in `werkzeuge/geschichte.mjs`; Blöcke mit Unterschlüsseln – `buch-art`, `vertiefung-formen` – vollständig). Der Übersetzer prüft Form und Sichtbar-Probe und **baut sie nicht**: Die Seite liest ihre Wörter aus `src/ui/woerter.ts`; `tests/geschichte-oberflaeche.test.ts` hält fest, dass beide dasselbe sagen. Der Block darf nach dem Einsetzen auch gestrichen werden.
- **Kärtchen „Wer entscheidet was“.** `zeilen[].text` darf eine Liste sein (jeder Eintrag ein Text oder `{ text, kurzfassung: nein }`; nicht alle dürfen entfallen). Ausgabe: `html` (alle Absätze hintereinander) und `absaetze`; die Kärtchen im Fluss zeigen in der Kurzfassung nur die Absätze ohne die Marke.
- **Schlagzeile.** `schlagzeile: "…"` an einer Antwort mit `bild: schlagzeile` – die Seite setzt sie als Unterschrift unter das Zeitungsbild der gewählten Folge. Das Bild allein ist ohne Unterschrift erlaubt.
- **Brückenzeile mit Akten.** Hat `rahmen.yaml` `akte:`, ist `bruecke` eine Zeile der Brückenkarte `Monat: Satz.` (Ausgabe inline): Eine führende `**n** · ` wird entfernt (sie muss die Nummer der Station sein), fehlt der Monat, kommt er aus dem ersten Wort von `zeit`. Die Karte trägt den Kicker „Inzwischen“ (zählt nicht zur Lesezeit); jede Zeile beginnt mit der fetten Nummer, der Titel der Station steht nur für Screenreader, kein Jahr, kein „Station“. Ohne `akte:` bleibt es bei der Karte mit Nummer, Titel und Zeit und dem Markdown-Block.
- **Eintrag-Kärtchen der Rückfragen.** Beginnen **alle** Erklärungen der Gespräche mit `Zeile „Quelle“: Die Vertretung würde festhalten: „…“`, zerlegt der Übersetzer sie (`eintragZeile`, `eintragTextHtml`; die Erklärung bleibt unverändert) und die Seite zeichnet das Kärtchen mit den Zeilen in der Reihenfolge der Gespräche: anfangs „noch leer“, jedes gewählte Gespräch füllt seine Zeile. Optional `eintrag: "Lüftung · Hersteller · frag Theo"` als Kopf. Alle oder keine Erklärung, jede Zeile nur einmal. Das Kärtchen zählt nicht zur Lesezeit (`lesezeitOhne`).
- **Echos.** `ECHOS_MAX` ist 11: E8 hat zwei Sprecher (Pfennig und Ranzen in Station 13), ein Echo trägt nur eine Zeile je Fassung – sie sind zwei Einträge mit derselben Quelle (`E8`, `E8b`).
- **Bilder.** `GIMMICKS` kennt zusätzlich `stuhlreihen`, `schlagzeile`, `glocke-haken`, `angebotskalender`, `pinnwand`, `haftzettel`, `gespraechskarten`, `musskarten`, `genehmigung-auflage`, `hallenboden`, `tasse` (Linienzeichnung wie die übrigen, Beschreibung im Alt-Text). Nicht gebaut, weil die Entwürfe sie nicht brauchen: `legende` und mehrere `feld`-Angaben bei `matrix`, `heisst` bei `mappe` und `bericht` (die Legende steht in der Aufgabe, L-346).

**Stationen einsetzen (P19.6, L-330, L-350 bis L-356).** Alle 14 Stationen sind eingesetzt: Dateien `s1-mandat`, `s2-warnsignal`, `s3-risiko`, `s4-auflage`, `s5-mensa`, `s6-elternabend`, `s7-zuschlag`, `s8-zahlen`, `s9-monatstermin`, `s10-sturm`, `s11-wissen`, `s12-entscheidung`, `s13-nachweis`, `s14-schulstart`; `reihenfolge` in `rahmen.yaml` nennt alle vierzehn, `nr` zählt die Stelle (1 … 14, lückenlos), `akte` teilt sie in s1–s5, s6–s10, s11–s14; der Block `oberflaeche` steht nicht mehr im Rahmen (die Wörter der Bedienung stehen in `src/ui/woerter.ts`). Für eine weitere Station gilt: (1) Datei `inhalte/geschichte/s<n>-<name>.yaml` mit allen Pflichtfeldern der Tabelle oben (vollständig und sichtbar fertig; unfertige Stationen werden nicht eingecheckt); (2) ihre Kennung an die Stelle in `reihenfolge:` setzen und in **allen** Dateien dahinter `nr` um eins erhöhen (sonst meldet der Übersetzer „Nummer … erwartet …“); (3) `kurzfassung: true` samt `einstieg-kurz` oder, wenn die Kurzfassung sie überspringt, `bruecke`; (4) `belege` intern, `thema` aus den Themen, optional `mini`, `vertiefung`, `werkzeuge`, `regie`; (5) in `rahmen.yaml`: `echos` (`quelle` = Kennung der Station, deren Antwort wählt; die Echo-Zeile in `szene` der späteren Station; ein zweiter Sprecher derselben Quelle bekommt eine eigene Kennung wie `E8b`), `buch`, `akte`, `ende` unverändert; (6) `node werkzeuge/inhalte.mjs`, `node werkzeuge/lesezeit.mjs --schreibe`, `npm run bau`; `tests/geschichte-geruest.test.ts` (Kennungen und Dateinamen) fortschreiben, und die Zahlen der Seite (`W.start.storyText`, `storyMeta`) auf die gemessene Zeit setzen (`tests/lesezeit.test.ts`). Gemessen mit allen vierzehn Stationen: ganzer Weg 7.830 Wörter ≈ 39 Minuten („etwa 40“), Kurzfassung 1.960 Wörter ≈ 10 Minuten, obere Schranke 8.949 Wörter (Akte 3.165 · 2.892 · 2.892); die echte Story nutzt keine Nebenfiguren (L-356). Kennungen in Tests (`s5`, `s8` …) sind die der Stationen; `werkzeuge.yaml` verweist mit `quelle:` auf Stationskennungen.

**Neue Mini-Arten (P19.5, `docs/drehbuch-v2/04-rahmen.md` 7.8).** Die Mini-Aufgabe hat zusätzlich `stelle` (`nach-folge` Vorgabe, `vor-frage`, `vor-vergleich`) und – je Art – `schluss`, `zettel`, `kontingent`. Der Schlusssatz (`schluss`, ein Satz, 4 bis 6 Wörter) steht nach der Aufgabe, ist aus den **Lösungen** gebildet und derselbe, ob die Wahl stimmt oder nicht. **Rückmeldung** der fünf Arten: je Karte „Stimmt.“ bzw. „Nicht ganz.“ mit der Erklärung der Karte (sie nennt bei „Nicht ganz“ die Lösung in ihrem Satz); **keine Punkte, kein „n von m“, kein „Richtig“, keine Ampel** – die Zählwörter bleiben nur bei `zuordnen` und `reihenfolge`.

| Art | Station | Felder | Bedienung und Rückmeldung |
|---|---|---|---|
| `matrix` („Stimmt die Einstufung?“) | nach der Folge | Posten `{ text, loesung: stimmt\|nachfordern, erklaerung, feld: [w, a] }` (je 1–5, nur für die Zeichnung; die Beschreibung des Bildes nennt Stufen in Worten, nie Zahlen); feste Wahlen „Stimmt“ · „Nachfordern“; kein `schluss` | je Zettel zwei Wahlen, sofort Rückmeldung |
| `mappe` („Fehlt etwas in der Mappe?“) | nach der Folge | Posten `{ text, loesung: annehmen\|nachfordern, erklaerung }`, `schluss` Pflicht; mindestens ein Abschnitt je Lösung; feste Wahlen „So annehmen“ · „Nachfordern“ | je Abschnitt zwei Wahlen (Haftzettel), sofort |
| `pinnwand` („Stimmen die Verknüpfungen?“) | nach der Folge | `zettel: [{ id, text }]` (mindestens zwei), Posten `{ text, loesung: stimmt\|doppelt\|nachfordern, erklaerung, von, nach: [Zettel] }`; `nach: []` = loses Ende und wird nachgefordert, ein Faden mit Ziel nie; `schluss` Pflicht; feste Wahlen „Stimmt“ · „Zählt doppelt“ · „Nachfordern“ | je Faden drei Wahlen; der Faden zeigt nach der Wahl die **Lösung** (Wort und Linienart, nie nur Farbe) |
| `bericht` („Was fehlt im Bericht?“) | **vor der Frage** | Posten `{ text, loesung: ok\|nachfordern, erklaerung }`, `schluss` Pflicht; mindestens eine Zeile je Lösung | Mehrfachauswahl: gesetzt wird nur „nachfordern“, ungesetzt gilt „in Ordnung“; eine Prüfung für alle Zeilen („Prüfen“), danach je Zeile ein Satz, der Schlusssatz und gesperrte Auswahl (bis „Noch einmal“); Zustand `mini[kapitel]` leer oder `n + 1` Zahlen (0/1 je Zeile, zuletzt 1 = geprüft) |
| `rueckfragen` („Wer weiß was?“) | **vor der Frage** | `kontingent` (1 bis Zahl der Gespräche − 1), Posten `{ text (Etikett mit Namen), erklaerung (was die Vertretung festhält), gespraech: [{ wer, text }] }` (mindestens vier), `schluss` Pflicht; keine Lösung | zwei von vier Gesprächen; das Gespräch erscheint nach der Wahl, **kein „Stimmt“ und kein „Nicht ganz“**; die übrigen sind gesperrt. Zustand `mini[kapitel]`: die Plätze der gewählten Gespräche in der Reihenfolge der Wahl (höchstens das Kontingent; die Regie-Auflösung nennt alle vier). Die Zeilen der Gespräche und ihre Erklärungen zählen nicht zur Lesezeit (`lesezeitOhne`) |

Der **Muss-Filter** (Station 12, vor dem Vergleich) und **„Beschluss oder nicht?“** (Station 13) sind Spielarten von `zuordnen` (eigene Wahlen, Zählwörter wie bisher, kein `schluss`); der Muss-Filter steht mit `stelle: vor-vergleich`. Feste Wahlen setzt der Übersetzer; eine Angabe `wahlen:` bei `matrix`, `mappe`, `pinnwand`, `bericht` und `rueckfragen` ist ein Fehler, ebenso `zettel` außerhalb der Pinnwand und `kontingent` außerhalb der Rückfragen. In der Kurzfassung steht keine Mini-Aufgabe.

**Neue Mini-Art ergänzen (Mini-Registry, P19.1, L-270):** Jede Art steht an einer Stelle und läuft über dieselben Kernschleifen; die Schleifen (Schritte, Regie-Sprungliste, Fortschrittslinie, `leseStand`, `werteMiniAus`) bleiben unverändert. Der gespeicherte Stand bleibt `mini[kapitel]: number[]` (gk.story v2) – die Art kodiert ihren Zustand in dieser Zahlenliste. Schritte: (1) Kennung in `MiniArt` (`src/geschichte/typen.ts`) aufnehmen, bei Bedarf neue Felder in `Mini`/`MiniPosten` (die Typprüfung zeigt, was fehlt); (2) in `src/geschichte/mini-arten.ts` einen Eintrag in `MINI_ARTEN` ergänzen: `uebersetzung` (Pflichtfelder der Posten, Regeln für Wahlen, Lösung, Gesamtprüfung – der Übersetzer ruft sie über `miniArt(art)`, Fehlertexte wie bisher; seit P19.5 außerdem `festeWahlen`, `schluss` (`nie`/`pflicht`), `zusatzFelder`, `postenZusatz` und `zusatz` für art-eigene Felder), optional `fertig` (wann die Aufgabe abgeschlossen ist, wenn nicht jeder Posten eine Lage hat), `zug` (Zug der Leserin oder des Lesers, rein), `werte` (Lage je Posten), `gueltig` (Prüfung einer gespeicherten Zahlenliste), `loese` (Regie „Auflösen“), `aenderung` (zuletzt gesetzter Posten, damit die Leinwand dorthin rollt), `lesezeitOhne` (Elemente, die die Lesezeit-Zählung auslässt; meist leer); (3) in `src/ui/flaechen/geschichte-mini.ts` den Baustein in `MINI_BAUSTEINE` ergänzen: `zeichne` (Aufgabenkörper; ohne Bedienung, wenn `o.bedienbar` falsch ist), `standZeile`, `regie` (Körper der Regie-Eingriffe), optional `druck` (Papierfassung als Zustand, nie die Wertung); (4) Tests: Eintrag in `tests/geschichte-mini-registry.test.ts` (die Probe läuft über alle Kapitel mit Mini), ein Kapitel-Szenario in `werkzeuge/oberflaeche.mjs`, Inhalt mit `art: <Kennung>` in `inhalte/geschichte/`. Beide Tabellen sind `Record<MiniArt, …>`: fehlt einer der Einträge, bricht `npm run typen`.

**Papier der Mini-Arten (P19.7, L-364):** Keine der sieben Arten (zuordnen, reihenfolge, matrix, mappe, pinnwand, bericht, rueckfragen) hat eine Papierfassung (`druck`). Der Druckbogen der Story zeigt je Station Frage, Ihre Antwort und „So macht man es gut“, je Akt eine eigene Überschrift mit Seitenumbruch, dazu den Verlauf in der Bilanz und das Entscheidungsbuch auf einer eigenen Seite; die Mini-Aufgabe ist eine Übung am Bildschirm und steht nicht auf dem Papier (ihr Zustand ist kein Beschluss, und eine Papierfassung ohne Wertung ließe die Aufgabe leer wirken). Wer eine Papierfassung ergänzt, trägt `druck` im Baustein ein und passt den PDF-Probelauf in `tests/oberflaeche/story.szenario.mjs` an.

**Lesezeit (P19.3):** `werkzeuge/lesezeit.mjs` misst den guten Weg je Schritt, je Akt (Stationen plus Pause) und liefert mit `--schranke` die **obere Schranke** (je Schritt der längste Text, den irgendeine Antwort ergibt; Mini-Aufgaben gelöst und ungelöst; Ende nach dem längsten der drei einheitlichen Wege): je Akt höchstens 17 Minuten (3.300 Wörter), ganzer Weg höchstens 9.000 Wörter. `tests/lesezeit.test.ts` koppelt die Angaben der Seite (Wegwahl-Karten, Startseite, Auftakt, je Akt die Dauer der Kopfkarte, die Restzeit der Ortszeile) an die Messung.

**Kurzfassung (P17.5, etwa 10 Minuten, gemessen mit `werkzeuge/lesezeit.mjs`):** Die Kurzfassung zeigt dieselben Texte wie der ganze Weg, mit vier Kürzungen: `einstieg-kurz` statt `einstieg`, ohne Zeilen mit `kurzfassung: false`, „Das steckt dahinter“ zugeklappt (der Link zum Thema bleibt offen; die Regel steht in „So macht man es gut“) und im Vergleich die Kipppunkte zugeklappt (die Empfehlung nennt sie). Im Auftakt – er steht vor der Wahl des Wegs – sind die Steckbriefe auf beiden Wegen zugeklappt; Porträt, Name und Rolle stehen offen. Auf der Leinwand ist nichts zugeklappt.

**Rechnung (Engine, nie als Zahl auf der Seite):** Balken starten mit `start` (Drehbuch: Geld 9, Zeit 6, Vertrauen 4); jede zählende Antwort wird der Reihe nach angewandt und das Ergebnis **jedes Mal** auf 0–10 begrenzt. Stufen: niedrig 0–3, mittel 4–6, hoch 7–10. Bilanz in fester Prüfreihenfolge: Vertrauen niedrig → `nicht-getragen`; Zeit niedrig → `letzte-meter`; Zeit hoch, Vertrauen hoch, Geld mindestens mittel und keine Falle → `ruhig`; sonst `umwege`. Ist auf dem Weg eine Entscheidung offen, zeigt das Ende statt eines Bilanz-Typs `offen` ohne die Sätze je Balken (R73). In der Kurzfassung zählt jedes übersprungene Kapitel wie seine gute Antwort; auf dem langen Weg zählt ein Kapitel ohne Wahl nicht. Folge-Szenen laufen zum Sachstand der guten Antwort zusammen; Bedingungen gibt es nicht (außer den Varianten des Endes nach Balkenstand). `tests/geschichte.test.ts` rechnet die Wege des Drehbuchs nach.

**Regie-Material ist nicht geheim:** `regie` steht im JSON getrennt (`geschichteRegie`, bei Themen `regie`), damit die Leinwand es nie zeichnet (docs/ARCHITEKTUR.md, „Regie und Leinwand“). Regie und Leinwand sind aber dieselbe Hauptseite; Notizen und Leitfragen stehen im Klartext in `dist/index.html`. In `regie` gehört nur, was ein Kunde lesen dürfte – nichts Vertrauliches, keine internen Einschätzungen von Kunden oder Personen.

---

## 4 Theorie und weitere Dateien

### 4.1 `inhalte/start.md`
Kopfdaten: `kicker` (Pflicht), `titel` (Pflicht: Leitsatz der Startseite), `titel-quelle` (Absatz-ID, intern; dann muss der Leitsatz wortgleich in diesem Absatz stehen, O-17). Text der Datei (Pflicht) = These unter dem Leitsatz, Inline-Markdown (`**…**` hebt hervor). Ausgabe: `startseite` (`kicker`, `titel`, `titelQuelle`, `these`); fehlt die Datei, ist `startseite` null. Fachliche Sätze der Startseite stehen hier, nicht im Code (O-18).

### 4.2 `inhalte/theorie/kNN-<name>.md` (Thema, P16.3, O-38)
Kopfdaten: `kapitel` (Pflicht, 1–16, passt zum Dateinamen; intern, bestimmt Abdeckung und Abbildungen), `titel` (Pflicht), `kurztitel`, `thema` (Kennung in der Adresse `#theorie/<thema>`, Vorgabe die Dateikennung), `reihe` (1–30, Reihenfolge der Themen; Vorgabe `kapitel`), `teil` (Pflicht: `1`–`4` oder `anhang`; Teile des Buchs nach O-54: 1 Grundlagen · 2 Führungsmodell und Arbeitsweise · 3 Anwendung und Einführung · 4 Werkzeuge der Praxis; in der Reihenfolge nach `reihe` nie rückwärts, der Anhang nur am Ende), `kurzsatz` (Pflicht, höchstens 90 Zeichen, ein Satz in natürlicher Sprache fürs Inhaltsverzeichnis, keine neue Fachaussage), `symbol` (Pflicht, Name aus `src/stil/symbole.ts`), `werkzeuge` (optional, P18.5, E-13: Liste `[{ id, beispiel }]` wie im Story-Kapitel, `beispiel` optional; z. B. `werkzeuge: [{ id: wegweiser }, { id: risiko-grenzen }]` – am Ende des Themas „Zum Ausprobieren“, nur auf der Seite; geprüft nach dem Einlesen aller Dateien), `deckt` (Liste von Absatz-IDs oder Abschnitten, die dieses Thema zusätzlich zu `zitat` und `tafel` abdeckt). `thema` und `reihe` sind über alle Themen eindeutig. Die sichtbare Nummer (`nr`, 1 … in Leserichtung, „5 · Führungsmodell“, nie „Kapitel“) setzt der Compiler aus `reihe`; `kapitel` bleibt intern. Text der Datei = Einleitung. Interne Belege stehen als YAML-Kommentare in den Kopfdaten.

| Art | Ort | Kennung | Kopfdaten | Felder / Inhalt |
|---|---|---|---|---|
| `kernaussage` | oben | – | `symbol` (Name aus `src/stil/symbole.ts`; ohne Angabe das Symbol des Themas) | `text` (Pflicht) – groß mit Symbol (P17.9) |
| `abschnitt` | oben | Abschnitts-ID (`k4.2`, intern) | `titel` | `text`; enthält die Bausteine, die „abschnitt“ als Ort erlauben. Freier Text bleibt an seiner Stelle: Text vor dem ersten Baustein ist `text`, jeder Text zwischen oder nach Bausteinen wird ein Baustein `lesetext` an dieser Stelle (P17.9) |
| `aufklapper` | oben, `abschnitt` | – (der **Titel** steht in der Öffnungszeile: `::: aufklapper Wer entscheidet am Ende?`, schlichter Text ohne `[[…]]` und Markdown) | `symbol` (optional; sonst nach dem ersten Stichwort im Titel bzw. das Symbol des Themas) | `text` (Pflicht, mit den üblichen Inline-Bausteinen) – zugeklappt, in der Farbe des Teils; auf Leinwand und im Druck offen (P17.9) |
| `ebenen` / `ebene` | oben, `abschnitt` / in `ebenen` | – / `1`–`4` | – / `titel` | `text`; vier aufklappbare Stufen (Ebene 1 offen); Ebene 4 braucht ein `zitat` |
| `karten` / `karte` | oben, `abschnitt` / in `karten` | – / optional | `titel` / `titel` (Pflicht), `symbol` | `text` / `text`, `rueckseite` – Titel und Text von `karten` stehen als kleine Überschrift und Einleitung über den Karten; eine Karte mit `### Rückseite` lässt sich mit dem Knopf „Umdrehen“ wenden (Leinwand, Druck: beide Seiten untereinander; P17.9) |
| `etappen` / `etappe` | oben, `abschnitt` / in `etappen` | – / Pflicht (`1`, `2` …) | `titel` / `titel` (Pflicht) | `text` – Abfolge zum Durchklicken (P12.3) |
| `umschalter` / `ansicht` | oben, `abschnitt` / in `umschalter` | – / `links` oder `rechts` | `titel`, `links`, `rechts` (Pflicht) / – | `text` – zwei Ansichten, z. B. „Ohne MVG“ / „Mit MVG“ |
| `sortieren` / `posten` | oben, `abschnitt` / in `sortieren` | – / Pflicht | `titel`, `links`, `rechts` (Pflicht) / `seite` (`links`/`rechts`, Pflicht) | `text`, `erklaerung` – Zuordnungsübung ohne Punkte |
| `regler` / `stufe` | oben, `abschnitt` / in `regler` | – / Pflicht | `titel` / `titel` (Pflicht), `marke` | `text` – Schieberegler über geordnete Stufen |
| `wissenscheck` | oben, `abschnitt` | Pflicht | `stelle` (1 bis Zahl der Antworten: Stelle der richtigen Antwort a in der Anzeige; ohne Feld Verschiebung nach Kennung) | `frage`, `erklaerung` (Pflicht); enthält mindestens zwei `antwort` und ein `zitat` als Beleg (P11.6) |
| `antwort` | in `wissenscheck` | Pflicht | `titel` (Pflicht), `praefix`, `symbol` | `text` |
| `tafel` | oben, `abschnitt`, `ebene` | Tabellen-ID (`k4-t1`) | `form` (Pflicht), `hervor` (Liste von Zeilennummern) | `text` – Tabelle als Grafik, Zellen wortgleich aus `whitepaper.json` (L-32) |
| `abbildung` | oben, `abschnitt` | `abb-N` (Pflicht) | – | leer – Abbildung der DOCX mit Bildunterschrift (4.7) |
| `merksatz`, `hinweis` | oben, `abschnitt`, `ebene` | – | – | `text` (Pflicht) |
| `zitat` | oben, `abschnitt`, `ebene`, `karte`, `wissenscheck` | Absatz-ID(s) | – | `text` (2.5) |
| `glossar` | oben | – | – | leer – durchsuchbare Liste aller Glossarbegriffe mit „Kommt vor in“ (Themen mit Glossarbezug, vom Compiler gesammelt; L-47) |
| `regie` | oben | – | – | `notiz`, `leitfragen` – **nur Regie**, höchstens einer je Thema (Schlüssel `theorie/k<kapitel>`) |

Formen der `tafel`: `ketten` (mindestens vier Spalten) · `schwelle` (genau zwei Spalten) · `pyramide` · `felder` (mindestens fünf Spalten) · `bausteine` · `phasen` · `rhythmus` · `karten` · `zeitachse` (Regler über die Zeiträume der ersten Spalte). `hervor` nennt Zeilen, die hervorgehoben bzw. vorgewählt sind.

Beispiel (P17.9):

```
::: kernaussage
---
symbol: schild
---
Der Bauherr trägt die Legitimation.
:::

::: aufklapper Wer entscheidet am Ende?
Das [[Mandat]] legt fest, wer freigibt.
:::
```

Darstellung: Tafeln, Merksätze und Hinweise stehen auch auf Seitenebene zwischen den Abschnitten. Etappen, Umschalter, Sortieren und Regler zeichnet `src/ui/bausteine/lernwerkzeuge.ts`; auf der Leinwand und im Druck zeigen sie ihren ganzen Inhalt aufgelöst.

Jeder Absatz aus V1.2 soll einem Thema zugeordnet sein (O-20): über `zitat`, `tafel`, `deckt` oder `abdeckung.yaml` (4.6).

### 4.3 `inhalte/begriffs-kompass.md` (P10.5, E7)
Kopfdaten: keine. Container `kompass <kennung>` (nur oben) mit Kopfdaten `begriff` (Pflicht, MVG-Begriff), `andere` (Pflicht, Liste gängiger anderer Wörter), `beleg` (Pflicht, intern: genau eine Absatz-ID, in der der Begriff als eigenes Wort steht, oder ein V2.4-Verweis `v24:hb-3.1`) und Feld `### Hinweis` (optional). Steht der Begriff im Glossar, verweist der Eintrag dorthin. Die Datei nennt alte Begriffe absichtlich (Ausnahme in `werkzeuge/begriffe.json`).

### 4.4 `inhalte/glossar.yaml` (P16.4, O-36)
Passt die Glossareinträge aus `whitepaper.json` an V2.4 an: `aendern: { g-…: { begriff?, definition, belege } }`, `entfernen: [g-…]`, `neu: [{ id: g-…, begriff, definition, belege }]`. Jede Änderung und jeder neue Eintrag braucht `belege` (Absatz-ID oder `v24:…`, intern). Definitionen in eigenen Worten, keine Vertragstexte (O-37).

### 4.5 `inhalte/werkzeuge.yaml` (P16.8, O-46; P18.3/P18.4, O-59)
Texte der neun Explore-Werkzeuge, reines YAML: `einleitung`; je bisherigem Werkzeug `mcda`, `matrix`, `vorgaenge`, `takt`, `glossar` ein Teil mit `titel` (Pflicht), `kurz` (Zeile der Kachel), `vorspann` (Pflicht, alle neun Werkzeuge, L-322: `wozu`, `eingabe`, `ergebnis`, je ein bis zwei einfache Sätze – Zweck, Eingabe und Deutung, keine Bedienanleitung; der Übersetzer wendet die Sichtbar-Probe an), `text` und – außer `glossar` – `belege` (Pflicht, intern). Dazu:
- `mcda.hinweis`;
- `matrix.stufen` (`{ id, titel, von, bis, text }`, jeder Wert 1–25 in genau einer Stufe), `regel`, `sonder`, `wahrscheinlichkeit` und `qualitaet` (je fünf Stufen), `beispiele` (`{ kennung, titel, w, a }`, je 1–5);
- `vorgaenge.arten` (genau die sechs Vorgangsarten, je `id`, `titel`, `text`, `beispiel`, `abschluss`, `wege` – Vorgangsarten oder `entscheidung`), `vorgaenge.entscheidung` (`titel`, `text`);
- `takt.stufen` (`{ id, titel, wer, text, beispiel }`).

**Vier neue Werkzeuge (P18.3/P18.4, O-59; Konzept `docs/WERKZEUGE-P18.md` Abschnitt 5).** Regeln und Zahlen der Rechnung stehen in `src/werkzeuge/` (Rechenkerne), hier nur Texte und Beispiele. Adresse ↔ Teil: `#explore/vorlagen-check` ↔ `vorlagencheck`, `#explore/wegweiser` ↔ `wegweiser`, `#explore/risiko-grenzen` ↔ `risikogrenzen`, `#explore/monatsbericht` ↔ `monatsbericht` (feste Tabelle `TEIL` in `src/ui/werkzeug-kennungen.ts`, gespiegelt als `WERKZEUG_TEIL` in `werkzeuge/explore.mjs`; ein Test hält beide gleich). Jeder Teil hat `titel`, `kurz`, `text` (Markdown) und `belege`; **jeder Satz mit Regelgehalt** ist ein Paar `{ text, belege }` (bzw. trägt `belege` neben seinen Feldern). Erlaubte Belege: Absatz-ID aus V1.2 (muss es geben), `v24:hb|tlb|va|as-…` oder `fall` (Eckdatum der Fall-Bibel). Sichtbar gelten die Regeln von O-38/O-42/O-56 und kein „Projektblatt“ (L-253, E-10); Bedienwörter (Knöpfe, Feldnamen) stehen in `src/ui/woerter.ts`. Ein Komma in einem Wert innerhalb `{ … }` verlangt Anführungszeichen – sonst zerfällt der Wert in leere Schlüssel, was der Übersetzer als Fehler meldet. **Leser:** der Vorlagen-Check spricht den Bauherrn an („Lassen Sie … ergänzen“), die anderen drei sind unpersönlich (L-254).
- `vorlagencheck`: `ampel` (`gruen`, `gelb`, `rot` – Wort neben der Ampel); `schritte` (genau fünf, je `id`, `titel`, `punkte`); Prüfpunkt `{ id, muss, kurz, frage, schliessen, belege }`, genau einer mit `art: zaehlung` und `mindestens` (errechnet aus den Wegen), einer mit `id: a3` (befugte Stelle); `stellen` (genau `sie`, `buergermeisterin`, `lenkungskreis`, `projektsteuerung`, `offen`; `titel`, optional `ohneBeispiel` – Name ohne geladenes Beispiel –, `satz` + `belege` für Lenkungskreis und Projektsteuerung); `wegzustaende` (`zulaessig`, `unzulaessig`, `schein`, `offen`, außer `zulaessig` mit `satz`); `dringlich` (`frage`, `satz`, `belege`); `gegenstaende` (`geld`, `risiko`, `freigabe`, `ziele`); `mandat` (Zuordnung des Beispielprojekts, nur bei geladenem Beispiel, O-46: `bis`, `darueber`, `reserve`, `immer`, `beraet`, `saetze` mit `falsch` – enthält `{grund}` –, `gruende`, `beraet`, `unbestimmt`, `selbst`); `beispiele` (`id`, `titel`, `lage`, `quelle`, `gegenstand`, `stelle`, `betrag`, `reserve`, `wege` ≤ 5, `antworten` je Prüfpunkt `ja|teilweise|nein`, **`erwartet`**: `gruen|gelb|rot`).
- `wegweiser`: `fragen` (genau die sieben Kennungen `dringlich`, `handlung`, `eingetreten`, `anpassen`, `moeglich`, `arbeit`, `entscheidung`; `frage`, `belege`); `ergebnisse` (genau die sechs Vorgangsarten; `schritt`, `festhalten`, `belege` – „Fertig, wenn“ kommt wortgleich aus `vorgaenge.arten[].abschluss`); `zusaetze` (genau `sofort`, `unklar`, `keinVorgang`, `nichtSchaetzen`, `bisherGilt`, `entscheidung`, `bewerten`, `verknuepfen`; je `titel`, `text`, `belege`); `verwechslungen` (`{ id, art, text, belege }`, je Art höchstens zwei angezeigt); `beispiele` (`id`, `titel`, `text`, `quelle`, `antworten` – `unklar` nur bei `eingetreten` und `moeglich` –, **`erwartet`**: `{ art, entscheidung?, dringlich? }`; der Weg muss vollständig beantwortet sein).
- `risikogrenzen`: `grenzen` (`wahrscheinlichkeit` in Prozent, `kosten` in Euro, `termin` in ganzen Tagen – je vier, positiv, streng steigend, Prozent < 100); `zustaende` (`fest`, `vorlaeufig`, `offen`); `warnanlaesse` (`sicherheit`, `genehmigung`, `befugnis`, `option`); `grenzfehler` (Satz je Fehlerart des Kerns); `saetze` (feste Kennungen wie im Kern: `fehler`, `grenze` mit `{n}`, `offen`, `vorlaeufig`, `schwereFolge`, `spanne`, `warnanlass`, `wesentlich`, `annahme`, `annahmeBeispiel`, `selten`, `geplant`, `belegt`, `prognose`, `puffer`, `vorrangA5`, `nachObenOffen`); `beispiele` (`id`, `kennung`, `titel`, `quelle`, Zeilen `w`, `kosten`, `termin`, `qualitaet` als `{ stufe }`, `{ wert }`, `{ von, bis }`, `unbekannt` oder `entfaellt`; `warn`, `massnahme`, `schwelle`, `prognose`, `puffer`; `waswaere` – Annahmen, Titel beginnt mit „Angenommen: “ –; **`erwartet`**: `{ feld, zustand, nachObenOffen?, prioritaet?, vorrangWegenA5? }`). Stufentexte und Qualitätsstufen nimmt das Werkzeug aus `matrix` (keine zweite Quelle).
- `monatsbericht`: `ampel` (Wörter der Werkzeug-Ampel); `ampeln` (`kosten`, `termine`, `qualitaet`); `farben`; `abschnitte` (fünf, je `id`, `titel`, `max`); `entscheidungen` (`titel`, `max`); `reaktion`; `projekt` (Name im Kopf, nur mit Beispiel); `fuss` (`text`, `belege`); `saetze` (Kennungen wie im Kern: `ampelOhneFrage`, `entscheidungOhneWerBisWann`, `ohneKennung`, `leerStattKeine`, `zuViele`, `dringlich`, `umgesetztNichtWirksam`, `zuLang`); `beispiele` (`id`, `titel`, `monat`, `datenstand`, `lage`, `ampeln` je `{ farbe, satz, reaktion? }`, `eintraege` je Abschnitt `keine` oder Liste `{ text, kennung }`, `entscheidungen`, `reaktion`, **`erwartet`**: Ampel). Jedes Feld hält die Feldgrenzen aus `FELDGRENZEN` in `src/werkzeuge/monatsbericht.ts`.

**Regie je neues Werkzeug (P18.5):** Jeder der vier Teile hat `regie: { notiz, leitfragen }` (Pflicht, Markdown bzw. Liste von Sätzen). Es geht nach `werkzeugeRegie` (Schlüssel = Adress-Kennung), nie in `werkzeuge` und nie auf die Leinwand. Der Übersetzer exportiert zusätzlich `werkzeugKatalog` und `pruefeWerkzeugVerweise` für die Verweisfelder von Story und Themen.

**Verknüpfung mit der Story (P19.7, L-360):** Jedes Beispiel nennt in `quelle` die Station, aus der es stammt (`s1` … `s14`), `fall` (Eckdatum der Fall-Bibel) oder `matrix` (Beispiel des Standards); `tests/werkzeuge-verknuepfung.test.ts` prüft das. Ein Verweis `werkzeuge:` an einer Station (Format E-13) führt nur zu einem Beispiel mit `quelle` = dieser Station – so zeigt der Link „… ausprobieren“ im Kasten „Das steckt dahinter“ nie etwas, das die Geschichte erst später erzählt. Stand: s2, s4, s10, s11 → Wegweiser (`messe`, `auflage`, `geruest`, `verzug`); s5, s7, s12 → Vorlagen-Check (`mensa`, `zuschlag`, `lueftung-voll`); s3, s8 → Risiko-Bewerter (`ris-009`, `ris-014`); s8, s9 → Monatsbericht (`oktober`, `dezember`). Stationen ohne Werkzeug-Verweis (1, 6, 13, 14) haben kein passendes Werkzeug; ihr Thema (`thema:`) bleibt der Verweis, und der Block „In der Geschichte erlebt“ eines Themas listet alle Stationen, die es nennen.

**Selbstprobe:** Der Übersetzer rechnet jedes Beispiel mit dem Kern nach (`pruefeVorlage`, `wegweiser`, `bewerteRisiko`, `pruefeBericht`) und meldet einen Fehler, wenn das Ergebnis nicht `erwartet` trifft – Beispiel, Kern und Konzept laufen so nie auseinander. Regie-Notizen der neuen Werkzeuge (`regie:`) kommen erst mit P18.5.

### 4.6 `inhalte/abdeckung.yaml`
```yaml
# Absatz-ID: zu welchem Thema sie gehört
k2.4-p2:
  theorie: k02
k4.2-p3:
  theorie: [k04, k14]
```
Einziger Schlüssel ist `theorie` (eine Dateikennung `kNN` oder eine Liste). Er darf auch ein Kapitel nennen, für das es noch keine Datei gibt. Der Prüfer rechnet die Abdeckung aus dieser Datei **und** aus den Themen (`zitat`, `tafel`, `deckt`) zusammen. Eine Abdeckung unter 100 % ist ein **Fehler** (mit den ersten Absätzen ohne Thema), ebenso ein Absatz, der nicht (auch) auf dem Thema seines eigenen Kapitels steht.

### 4.7 `inhalte/abbildungen/abb-N.yaml` (P14, O-32, L-77)
Die 13 Inhaltsabbildungen der DOCX V1.2 (`abb-2` … `abb-14`, Ort und Prüfsumme in `whitepaper.json`) erscheinen auf dem Thema ihres Kapitels mit `::: abbildung abb-N` (P16.3: der Originaltext entfällt; jede Abbildung mit Bild muss auf genau einem Thema stehen).
```yaml
id: abb-6
quelle: bilder/image6.png          # wie „datei“ in whitepaper.json
titel: Sechs Verantwortungsfelder um den MVG-Kern
alt: Sechs Karten um einen Kreis „MVG-Kern“ …   # höchstens 600 Zeichen; beschreibt das Bild nach der Angleichung
angeglichen:                       # Beschriftungen, die im Bild überdeckt werden (verbotener Begriff, Fehler im Bild; text: "" = reine Abdeckung)
  - { x: 360, y: 259, b: 174, h: 34, text: Freigabelogik für LPH 0–2, beleg: k4-t1, schrift: barlow }
```
Weitere Felder gibt es nicht. Das frühere Feld `abweichungen` (was im Bild noch vom Text abwich) ist abgeschafft (O-56, O-41): ein Rest ist „unbekanntes Feld“. Auf der Seite trägt die Abbildung nur Marke („Abbildung N“) und Titel; Titel und `alt` beschreiben das Bild sachlich, ohne Meta-Sätze („der Text nennt …“, „im Bild steht …“). Vergrößert wird mit der Lupe des Browsers – einen Knopf „Vergrößern“ gibt es nicht (O-55).
Überdeckung: Rechteck in Pixeln des Originals, mit der Hintergrundfarbe gefüllt (Median des Rands oder `hintergrund`), Text in IBM Plex Sans (`schrift: plex`, Vorgabe) oder Barlow Condensed (`barlow`), `gewicht` 400–700, `groesse` (sonst passend gerechnet), `ausrichtung` links/mitte/rechts, `farbe`; `\n` im Text trennt Zeilen. Der neue Text ist ein Begriff des Texts, als ganzer Begriff wortgleich im Absatz `beleg`. **Reine Abdeckung** (R72): `text: ""` füllt das Rechteck nur mit der Hintergrundfarbe (`hintergrund` empfohlen, wo der Grund einen Verlauf hat) und entfernt so einen Bildteil, den der Text ausschließt – eine Kante, ein Zeitband, eine Skala; `beleg` nennt dann den Absatz, der ihn ausschließt (keine Wortgleichheit), Schriftangaben (`farbe`, `schrift`, `gewicht`, `groesse`, `ausrichtung`) sind dort ein Fehler. Die Schriftgröße einer Überdeckung folgt den Nachbarzeilen, soweit das Rechteck es zulässt. Alte Beschriftungen mit verbotenem Begriff stehen nie in der Datei (sie wird von `npm run begriffe` geprüft).
Bilder erzeugen: `node werkzeuge/abbildungen.mjs [abb-N …]` (Chromium; schreibt `abb-N.webp` und `stand.json`, deterministisch). Vermessen: `--raster abb-N x y b h [--nach]` (Ausschnitt mit Koordinatenraster), Sichtprüfung: `--vorschau abb-N` (nur `tmp/abbildungen/`). `inhalte` meldet ein Bild als **veraltet** (harter Fehler, auch im Bau), wenn Quelle oder Überdeckungen nicht mehr zu `stand.json` passen; Titel und Alternativtext ändern kein Bild. Die Bilder gehen als data:-URL nach `src/generiert/abbildungen.json` (nur `src/main.ts` lädt sie).

### 4.8 `inhalte/rechtliches/*.md`
`impressum.md` und `datenschutz.md`: normales Markdown ohne Container. `inhalte.mjs` übergeht sie; `werkzeuge/bau.mjs` setzt sie mit `werkzeuge/rechtliches.html` zu `dist/impressum.html` und `dist/datenschutz.html` zusammen (O-42, O-43).

### 4.9 `inhalte/fall.md` (Nachschlagewerk)
Die Fall-Bibel (Stadt, GML, Projekt, Zahlen, Zeitachse, Gremien, Figuren) bleibt als internes Nachschlagewerk der Autoren, damit Story, Themen und Explore denselben fiktiven Fall erzählen (O-3, L-5, O-45). Seit P16.14 wird sie **nicht** kompiliert und erscheint nicht auf der Seite; ihr Format wird nicht geprüft. Fachliche Sätze, die auf der Seite stehen sollen, gehören in die Story oder in ein Thema.

---

## 5 Was das Werkzeug prüft (`--pruefe`)

| Prüfung | Fehler, wenn … |
|---|---|
| Form | Container nicht geschlossen, unbekannte Art/Feld/Kopfdaten, Art am falschen Ort, Kennung fehlt oder unzulässig, YAML unlesbar |
| Schema | Pflichtfeld fehlt, Wert nicht erlaubt (Zahl außerhalb des Bereichs, Form der Tafel, Wahlwert) |
| Themen | `kapitel` fehlt oder passt nicht zum Dateinamen · `thema` oder `reihe` doppelt · `teil`, `kurzsatz` oder `symbol` fehlt · `teil` unbekannt oder gegen die Leserichtung · `kurzsatz` über 90 Zeichen · `symbol` unbekannt (auch an `kernaussage` und `aufklapper`) · `aufklapper` ohne Titel in der Öffnungszeile, mit `[[…]]`/Markdown im Titel oder ohne Text · zweiter Regie-Block · Wissenscheck ohne zwei Antworten oder ohne Beleg · Ebene 4 ohne Zitat |
| Story, P19.4/P19.5 | Echo: Kennung unlesbar oder doppelt, mehr als zehn, Fassung fehlt oder nennt die Wertung, Quelle keine Station oder nicht vor der Stelle, nirgends gesetzt, Platzhalter an falscher Stelle oder unlesbar, Echo-Zeile mit `text`, `fortsetzung-kurz` ohne `fortsetzung`, Quelle fehlt in der Kurzfassung ohne `kurzfassung: false` · Buch: Eintrag fehlt, doppelt oder unbekannt, Art unbekannt, Vermerk mit Stelle oder Beschluss mit „niemand“, verbotenes Wort, Reihenfolge · Kürzung: Marke außerhalb der Kurzfassung, alle Einträge weg, Marke und Ersatz zugleich, Ersatz nicht kürzer · Vertiefung: Form unbekannt, `antwort` fehlt oder überzählig, Absatz über 60 Wörter, `kurzfassung: ja` · Mini: Stelle unbekannt, `vor-vergleich` ohne Vergleich, feste Wahlen angegeben, Schlusssatz fehlt oder bei einer Art ohne, Matrixfeld außerhalb 1–5, Faden zu unbekanntem Zettel oder zum selben Zettel, loses Ende ohne `nachfordern`, Kontingent unpassend, Gespräch ohne `wer` |
| Story (3) | unbekannte Datei oder unbekanntes Feld · Pflichtfeld oder interne Belege fehlen · Beleg weder Absatz-ID noch V2.4-Stelle · `nr` nicht lückenlos oder nicht wie im Dateinamen · Thema unbekannt · nicht genau drei Antworten oder eine Wertung nicht genau einmal · Balkenwirkung keine ganze Zahl von −2 bis +2 · Campus-Stufe, Jahreszeit oder Licht unbekannt · Figur oder Bild unbekannt · Kapitel der Kurzfassung mit bzw. anderes Kapitel ohne Brückensatz · erstes Kapitel nicht in der Kurzfassung · nicht genau ein Vergleich · Gewicht nicht 5/3/1, Punkte nicht 1–5, Satz je Option und „gleichauf“ fehlt · Mini-Aufgabe mit unbekannter Lösung, Reihenfolge mit Wahlen, feste Rückmeldung an einer richtigen Wahl, weniger als drei Posten · kein Kärtchen „Wer entscheidet was“ · Variante „Vertrauen niedrig“ ohne sprechende Figur · sichtbar verbotenes Wort (`werkzeuge/sichtbar.mjs`) |
| Explore (4.5) | Titel oder interne Belege fehlen · Matrix-Stufen decken 1–25 nicht genau einmal · nicht je fünf Stufen · Vorgangsart oder Weg unbekannt · neue Werkzeuge: Beleg weder Absatz-ID noch V2.4-Stelle noch `fall` · Satz ohne `belege` · Kennung unbekannt, doppelt oder fehlend · leerer Wert (Komma ohne Anführungszeichen) · Grenzen nicht vier, nicht steigend, nicht positiv · Feldgrenze überschritten · Selbstprobe trifft `erwartet` nicht · sichtbar verbotenes Wort oder „Projektblatt“ |
| Verweise auf Werkzeuge (P18.5) | `werkzeuge` in Kapitel oder Thema keine Liste von `{ id, beispiel }` · Werkzeug unbekannt oder doppelt · Beispiel unbekannt oder bei einem Werkzeug ohne Beispiele · Regie eines neuen Werkzeugs ohne Notiz oder Leitfragen |
| Zitate | Absatz-ID unbekannt oder Text nicht wortgleich (2.5) |
| Glossar | `[[Begriff]]` nicht im Glossar · `glossar.yaml` ändert/entfernt Unbekanntes oder ohne Beleg |
| Kompass | Begriff steht nicht im Beleg-Absatz · mehr als eine Absatz-ID · `andere` leer · Eintrag doppelt |
| Abdeckung | Abdeckung < 100 % · Absatz nicht auf dem Thema seines Kapitels · Thema unbekannt |
| Abbildungen (4.7) | Beschreibung verletzt das Schema (Felder, Rechteck, Beleg keine Absatz-ID, `alt` > 600 Zeichen) · Bild veraltet gegenüber `stand.json` oder WebP passt nicht (auch ohne `--pruefe`, harter Fehler) · `::: abbildung` ohne Beschreibung, im fremden Kapitel oder auf zwei Themen · Abbildung mit Bild steht auf keinem Thema · Überdeckungstext nicht als ganzer Begriff wortgleich im Absatz `beleg` |
| Begriffe | verbotener Begriff (docs/BEGRIFFE.md) irgendwo in der fertigen JSON – auch in Glossar und Kapiteltiteln (der Kompass ausgenommen) |

Fehlt `whitepaper.json` noch, sind Zitat-, Glossar- und Abdeckungsprüfung **Warnungen** (sonst Fehler). Ohne `--pruefe` meldet das Werkzeug nur Fehler, die das Kompilieren verhindern.

Ein lauffähiges kleines Beispiel (Thema, Abdeckung, Startseite) steht als `BEISPIEL` in `tests/inhalte.test.ts`; die Story prüfen `tests/geschichte.test.ts` (Engine) und `tests/geschichte-uebersetzer.test.ts` (Übersetzer). Für ein neues Kapitel ist das nächstliegende vorhandene unter `inhalte/geschichte/` die beste Vorlage.

---

## 6 Ausgabe `src/generiert/inhalte.json` (Kurzreferenz, Typen: `src/inhalte/typen.ts`, `src/geschichte/typen.ts`)

| Schlüssel | Inhalt |
|---|---|
| `version` | Formatversion (1) |
| `whitepaper` | `fassung`, `titel`, `kapitel` (Gliederung, intern), `abbildungen[]` (je Abbildung `id`, `nr`, `kapitel`, `ort`, `bild` mit `titel`, `alt`, `breite`, `hoehe` – oder `null`) |
| `startseite` | `kicker`, `titel`, `titelQuelle`, `these` (Inline-HTML) aus `inhalte/start.md`, sonst null |
| `glossar.<id>` | Glossar der Seite (`begriff`, `definition`, `vorkommen.kapitel[]`) |
| `theorie.<kNN>` | Themen: `id`, `kapitel`, `thema`, `reihe`, `nr`, `teil`, `titel`, `kurztitel`, `kurzsatz`, `symbol`, `deckt`, `werkzeuge[]` (`id`, `beispiel`), `einleitung` (HTML), `bloecke[]`, `quelle` |
| Block (`bloecke[]`, `kinder[]`) | `art`, `kennungen`, `id`, `kopf` (umgewandelte Kopfdaten; `zitat`: `quelle`, `vollstaendig`; `tafel`: `quelle`, `tabelle`, `hervor`), `felder` (HTML), `kinder`; `ebenen`-Blöcke tragen `ebenen[]` (`nr`, `titel`, `felder`, `bloecke`) |
| `kompass[]` | `id`, `begriff`, `andere`, `beleg`, `glossar`, `hinweis` |
| `abdeckung` | `gesamt`, `zugeordnet`, `anteil`, `ziele` (Absatz-ID → `{ theorie[] }`) |
| `geschichte` | `titel`, `auftakt` (`campus`, `textHtml`, `vorstellung`, `los`, `kurz`), `sieHtml`, `figuren[]`, `balken[]` (`id`, `titel`, `html`, `start`, `mehr`, `weniger`, `bilanz`), `bilanz` (je Typ `titel`, `html`), `mandat`, `kapitel[]` (`id`, `nr`, `titel`, `zeit`, `campus`, `campusNachher`, `zusatz`, `kurzfassung`, `brueckeHtml`, `thema`, `einstiegHtml`, `szene[]`, `bildSzene`, `bildFrage`, `frageHtml`, `antworten[]` mit `wertung`, `html`, `wirkung`, `folgeHtml`, `bild`, `gutHtml`, `dahinterHtml`, `mandatNachFolge`, `mini` (mit `bild`, Posten und Wahlen mit `bild`), `vergleich` (Kriterien mit `imSatz`)), `ende` (mit `vertrauenNiedrig[]`, `nachFalle[]`, `offen[]`), `akte[]`, optional `echos[]` (`id`, `quelle`, `fassungen`) und `buch[]` (`station`, `art`, `entschiedenHtml`, `grundlageHtml`, `ergebnisHtml`); Zeilen mit optional `echo`, `fortsetzungHtml`, `fortsetzungKurzHtml`; Antworten und Kapitel mit optional `folgeKurzHtml`, `gutKurzHtml`, `dahinterKurzHtml`, `vertiefung` (`form`, `titel`, `absaetzeHtml`, `antwortHtml`); `mini` mit optional `stelle`, `schlussHtml`, `zettel`, `kontingent`, Posten mit optional `feld`, `von`, `nach`, `gespraech`; ohne `belege` und `begruendung`. Felder, die nur bei Gebrauch entstehen, fehlen sonst ganz – die Ausgabe der bisherigen Story ist byteweise dieselbe |
| `werkzeugeRegie` | **nur Regie** (P18.5): Adress-Kennung (`vorlagen-check`, `wegweiser`, `risiko-grenzen`, `monatsbericht`) → `notizHtml`, `leitfragen` |
| `werkzeuge` | Explore-Texte (`einleitungHtml`, `mcda`, `matrix`, `vorgaenge`, `takt`, `glossar`, `vorlagencheck`, `wegweiser`, `risikogrenzen`, `monatsbericht`); ohne `belege` und ohne `erwartet` |
| `regie` | **nur Regie**: `theorie/k<kapitel>` → `notiz` (HTML), `leitfragen` (Inline-HTML) |
| `geschichteRegie` | **nur Regie**: Kapitel (`k3`) → `notizHtml`, `leitfragen` |
| `src/generiert/abbildungen.json` (eigene Datei) | `abb-N` → Bild als `data:image/webp;base64,…`; nur `src/main.ts` lädt sie (P14, L-77) |

`src/inhalte/index.ts` gibt `regie`, `geschichteRegie` und `werkzeugeRegie` nur über `regieKapitel()`, `regieInhalte()`, `regieGeschichte()` und `regieWerkzeug()` heraus; das öffentliche `inhalte` enthält sie nicht.

---

## 7 Mehrsprachigkeit (vorbereitet)
Alle sichtbaren Texte stehen in `inhalte/`; Kennungen, Schlüssel und Art-Namen sind sprachneutral. Eine spätere Übersetzung legt `inhalte/<sprache>/…` mit denselben Kennungen an; das Werkzeug erhält dafür einen Parameter. Derzeit gibt es nur Deutsch.
