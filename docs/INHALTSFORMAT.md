# Inhaltsformat

Stand P16.14 (2026-10-02, Neuausrichtung O-36 bis O-49). Verbindlich für alle Dateien unter `inhalte/` (O-18: Inhalte ohne Programmierung änderbar). Das Werkzeug `werkzeuge/inhalte.mjs` liest sie, prüft sie und schreibt `src/generiert/inhalte.json`; die Story übersetzt dabei `werkzeuge/geschichte.mjs`, die Explore-Texte `werkzeuge/explore.mjs`. Die Typen der Ausgabe stehen in `src/inhalte/typen.ts` und `src/geschichte/typen.ts`.

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
| `inhalte/geschichte/k<n>-<name>.yaml` | ein Kapitel der Story (3) | `k<n>`, z. B. `k3` |
| `inhalte/werkzeuge.yaml` | Texte der fünf Explore-Werkzeuge (4.5) | – |
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

Eine lineare Geschichte in acht Kapiteln aus Sicht der Projektleitung des Bauherrn; verbindliches Drehbuch: `docs/DREHBUCH.md`. Übersetzer: `werkzeuge/geschichte.mjs` (aus `werkzeuge/inhalte.mjs` aufgerufen), Typen: `src/geschichte/typen.ts`, Ablauf: `src/geschichte/engine.ts`, Vergleich: `src/geschichte/mcda.ts`, Fläche: `src/ui/flaechen/geschichte.ts`. Alle Dateien sind reines YAML; Textfelder sind Markdown (Glossarbezüge erlaubt), lange Texte mit `|` als Block. Ein Wert mit „: “ braucht Anführungszeichen. **Unbekannte Felder und Dateien sind Fehler.** Jeder sichtbare Text läuft zusätzlich durch die Sichtbar-Probe (`werkzeuge/sichtbar.mjs`): kein „Kapitel“, keine Absatz-IDs, kein „Beleg“, keine Kennungen – die Seite sagt „3 von 8“ (L-225). Kein Bild ohne Eintrag in `GIMMICKS` aus `src/grafik/figuren.ts`.

**`rahmen.yaml`:**

| Feld | Inhalt |
|---|---|
| `titel` | Titel der Geschichte (Auftakt) |
| `auftakt` | `campus` (s. u.), `text` (Markdown, nennt den Fall einmal fiktiv), `vorstellung` (Zeile über den Figuren), `los` (Knopf ganze Geschichte), `kurz` (leiser Knopf Kurzfassung) |
| `sie` | `steckbrief` der Spielfigur „Sie“ |
| `figuren` | genau fünf, in dieser Reihenfolge: `grundstein`, `faden`, `schwung`, `klingel`, `lot` – je `id`, `name`, `rolle`, `akzent` (Ton aus `src/stil/akzente.ts`), `steckbrief` |
| `balken` | `geld`, `zeit`, `vertrauen` – je `titel`, `text` (Kurztext beim ersten Auftritt), `start` (0–10), `mehr`/`weniger` (Wort der Änderung: „mehr Luft“, „gesunken“), `bilanz` (`hoch`, `mittel`, `niedrig`: je ein Satz) |
| `bilanz` | `nicht-getragen`, `letzte-meter`, `ruhig`, `umwege` – je `titel`, `text` |
| `mandat` | Kärtchen „Wer entscheidet was“: `titel`, `zeilen` (`{ wer, text }`) |
| `ende` | `zeit`, `campus`, `einstieg`, optional `einstieg-kurz` (wie im Kapitel), `szene` (Zeilen wie im Kapitel; die Zeile, die `vertrauen-niedrig` ersetzt, darf nicht `kurzfassung: false` tragen), `zeit-niedrig` (Absatz zusätzlich bei niedriger Zeit), `vertrauen-niedrig` (`{ figur, text }`: ersetzt bei niedrigem Vertrauen die Zeile dieser Figur; sie muss in der Szene sprechen) |

**`k<n>-<name>.yaml`** (eine Datei je Kapitel, `nr` lückenlos ab 1 und wie im Dateinamen; Adresse `#story/k<n>`):

| Feld | Inhalt |
|---|---|
| `nr`, `titel`, `zeit` | Kopf (Pflicht); `zeit` sichtbar („April 2026“) |
| `campus` | `{ stufe: 0–8, jahreszeit: fruehling·sommer·herbst·winter, licht: morgen·tag·abend }` – Bild von `src/grafik/campus-iso.ts`; optional `campus-nachher` (Bild nach der Folge) und `zusatz` (Grafik über dem Campus, z. B. `geruest-sturm`) |
| `kurzfassung` / `bruecke` | `kurzfassung: true` = gehört zur Kurzfassung (das erste Kapitel immer); jedes andere Kapitel braucht `bruecke` (ein Satz, erzählt den guten Weg; erscheint in der Kurzfassung als Brückenkarte) |
| `thema` | Kennung des passenden Themas (`#theorie/<thema>`, muss es geben) – Link im Kasten „Das steckt dahinter“ und „In der Story erlebt“ auf der Themenseite |
| `belege` | Pflicht, **nur intern**: Absatz-IDs aus V1.2 (`k4.2-p3`) oder Stellen aus V2.4 (`v24:hb-3.1`, `v24:tlb-2`, `v24:va-4.1`, `v24:hb-projektblatt`); Erläuterungen als YAML-Kommentar |
| `einstieg` | erzählender Absatz unter dem Campus |
| `einstieg-kurz` | optional, nur in Kapiteln der Kurzfassung (P17.5): derselbe Sachstand kürzer – die Kurzfassung zeigt ihn statt `einstieg`; muss weniger Wörter haben als `einstieg`; keine neue Fachaussage |
| `szene` | Liste `{ figur, text }` (optional `zusatz`: Regieanweisung in Klammern; ohne `figur` erzählt; `kurzfassung: false` = die Kurzfassung lässt die Zeile weg – nur in Kapiteln der Kurzfassung und im Ende, danach bleiben mindestens zwei Zeilen; auf dem ganzen Weg steht jede Zeile) |
| `bild-szene`, `bild-frage` | optional, kleine Grafik aus `GIMMICKS` |
| `frage` | die Frage an Sie (ein Absatz) |
| `antworten` | **genau drei**, in der Reihenfolge der Seite; jede Wertung (`gut`, `vertretbar`, `falle`) genau einmal – nie sichtbar; je `text`, `balken` (`{ geld, zeit, vertrauen }`, ganze Zahlen −2 … +2), `folge` (Folge-Szene), optional `bild` |
| `gut` | „So macht man es gut“ (zwei Sätze) |
| `dahinter` | „Das steckt dahinter“ (ein Satz) |
| `mandat-nach-folge` | `true` = nach der Folge das Kärtchen „Wer entscheidet was“ (Kapitel 1); ab dem nächsten Kapitel an jeder Frage aufklappbar |
| `mini` | optional, Mini-Aufgabe (nur auf dem langen Weg): `art` (`zuordnen` oder `reihenfolge`), `titel`, `aufgabe`, `posten` (mindestens drei; `{ text, loesung, erklaerung }` bzw. bei `reihenfolge` `{ text, erklaerung }` in der richtigen Folge – die Seite mischt sie fest), bei `zuordnen` `wahlen` (`{ id, titel }`, optional `figur` für ein Porträt auf dem Knopf und `falsch`: feste Rückmeldung, nur für Wahlen, die nie richtig sind) |
| `vergleich` | genau ein Kapitel: `einleitung`, `kriterien` (`{ id, titel, gewicht }`, Gewicht 5 sehr wichtig · 3 wichtig · 1 weniger wichtig = abgestimmte Stellung), `optionen` (`{ id: A…, titel, punkte, worte }` je Kriterium Punkte 1–5 und Worte; `begruendung` intern), `saetze` (je Option und `gleichauf`), `empfehlung`, `wer` |
| `regie` | optional `notiz`, `leitfragen` – nur für die Regie (geht nach `geschichteRegie`) |

**Kurzfassung (P17.5, etwa 10 Minuten):** Die Kurzfassung zeigt dieselben Texte wie der ganze Weg, mit vier Kürzungen: `einstieg-kurz` statt `einstieg`, ohne Zeilen mit `kurzfassung: false`, „Das steckt dahinter“ zugeklappt (der Link zum Thema bleibt offen; die Regel steht in „So macht man es gut“) und im Vergleich die Kipppunkte zugeklappt (die Empfehlung nennt sie). Im Auftakt – er steht vor der Wahl des Wegs – sind die Steckbriefe auf beiden Wegen zugeklappt; Porträt, Name und Rolle stehen offen. Auf der Leinwand ist nichts zugeklappt.

**Rechnung (Engine, nie als Zahl auf der Seite):** Balken starten mit `start` (Drehbuch: Geld 9, Zeit 6, Vertrauen 4); jede zählende Antwort wird der Reihe nach angewandt und das Ergebnis **jedes Mal** auf 0–10 begrenzt. Stufen: niedrig 0–3, mittel 4–6, hoch 7–10. Bilanz in fester Prüfreihenfolge: Vertrauen niedrig → `nicht-getragen`; Zeit niedrig → `letzte-meter`; Zeit hoch, Vertrauen hoch, Geld mindestens mittel → `ruhig`; sonst `umwege`. In der Kurzfassung zählt jedes übersprungene Kapitel wie seine gute Antwort; auf dem langen Weg zählt ein Kapitel ohne Wahl nicht. Folge-Szenen laufen zum Sachstand der guten Antwort zusammen; Bedingungen gibt es nicht (außer den Varianten des Endes nach Balkenstand). `tests/geschichte.test.ts` rechnet die Wege des Drehbuchs nach.

**Regie-Material ist nicht geheim:** `regie` steht im JSON getrennt (`geschichteRegie`, bei Themen `regie`), damit die Leinwand es nie zeichnet (docs/ARCHITEKTUR.md, „Regie und Leinwand“). Regie und Leinwand sind aber dieselbe Hauptseite; Notizen und Leitfragen stehen im Klartext in `dist/index.html`. In `regie` gehört nur, was ein Kunde lesen dürfte – nichts Vertrauliches, keine internen Einschätzungen von Kunden oder Personen.

---

## 4 Theorie und weitere Dateien

### 4.1 `inhalte/start.md`
Kopfdaten: `kicker` (Pflicht), `titel` (Pflicht: Leitsatz der Startseite), `titel-quelle` (Absatz-ID, intern; dann muss der Leitsatz wortgleich in diesem Absatz stehen, O-17). Text der Datei (Pflicht) = These unter dem Leitsatz, Inline-Markdown (`**…**` hebt hervor). Ausgabe: `startseite` (`kicker`, `titel`, `titelQuelle`, `these`); fehlt die Datei, ist `startseite` null. Fachliche Sätze der Startseite stehen hier, nicht im Code (O-18).

### 4.2 `inhalte/theorie/kNN-<name>.md` (Thema, P16.3, O-38)
Kopfdaten: `kapitel` (Pflicht, 1–16, passt zum Dateinamen; intern, bestimmt Abdeckung und Abbildungen), `titel` (Pflicht), `kurztitel`, `thema` (Kennung in der Adresse `#theorie/<thema>`, Vorgabe die Dateikennung), `reihe` (1–30, Reihenfolge der Themen; Vorgabe `kapitel`), `teil` (Pflicht: `1`–`4` oder `anhang`; Teile des Buchs nach O-54: 1 Grundlagen · 2 Führungsmodell und Arbeitsweise · 3 Anwendung und Einführung · 4 Werkzeuge der Praxis; in der Reihenfolge nach `reihe` nie rückwärts, der Anhang nur am Ende), `kurzsatz` (Pflicht, höchstens 90 Zeichen, ein Satz in natürlicher Sprache fürs Inhaltsverzeichnis, keine neue Fachaussage), `symbol` (Pflicht, Name aus `src/stil/symbole.ts`), `deckt` (Liste von Absatz-IDs oder Abschnitten, die dieses Thema zusätzlich zu `zitat` und `tafel` abdeckt). `thema` und `reihe` sind über alle Themen eindeutig. Die sichtbare Nummer (`nr`, 1 … in Leserichtung, „5 · Führungsmodell“, nie „Kapitel“) setzt der Compiler aus `reihe`; `kapitel` bleibt intern. Text der Datei = Einleitung. Interne Belege stehen als YAML-Kommentare in den Kopfdaten.

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
| `wissenscheck` | oben, `abschnitt` | Pflicht | – | `frage`, `erklaerung` (Pflicht); enthält mindestens zwei `antwort` und ein `zitat` als Beleg (P11.6) |
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

### 4.5 `inhalte/werkzeuge.yaml` (P16.8, O-46)
Texte der fünf Explore-Werkzeuge, reines YAML: `einleitung`; je Werkzeug `mcda`, `matrix`, `vorgaenge`, `takt`, `glossar` ein Teil mit `titel` (Pflicht), `kurz`, `text` und – außer `glossar` – `belege` (Pflicht, intern). Dazu:
- `mcda.hinweis`;
- `matrix.stufen` (`{ id, titel, von, bis, text }`, jeder Wert 1–25 in genau einer Stufe), `regel`, `sonder`, `wahrscheinlichkeit` und `qualitaet` (je fünf Stufen), `beispiele` (`{ kennung, titel, w, a }`, je 1–5);
- `vorgaenge.arten` (genau die sechs Vorgangsarten, je `id`, `titel`, `text`, `beispiel`, `abschluss`, `wege` – Vorgangsarten oder `entscheidung`), `vorgaenge.entscheidung` (`titel`, `text`);
- `takt.stufen` (`{ id, titel, wer, text, beispiel }`).

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
angeglichen:                       # Beschriftungen mit verbotenem Begriff (docs/BEGRIFFE.md), im Bild überdeckt
  - { x: 360, y: 259, b: 174, h: 34, text: Freigabelogik für LPH 0–2, beleg: k4-t1, schrift: barlow }
```
Weitere Felder gibt es nicht. Das frühere Feld `abweichungen` (was im Bild noch vom Text abwich) ist abgeschafft (O-56, O-41): ein Rest ist „unbekanntes Feld“. Auf der Seite trägt die Abbildung nur Marke („Abbildung N“) und Titel; Titel und `alt` beschreiben das Bild sachlich, ohne Meta-Sätze („der Text nennt …“, „im Bild steht …“). Vergrößert wird mit der Lupe des Browsers – einen Knopf „Vergrößern“ gibt es nicht (O-55).
Überdeckung: Rechteck in Pixeln des Originals, mit der Hintergrundfarbe gefüllt (Median des Rands oder `hintergrund`), Text in IBM Plex Sans (`schrift: plex`, Vorgabe) oder Barlow Condensed (`barlow`), `gewicht` 400–700, `groesse` (sonst passend gerechnet), `ausrichtung` links/mitte/rechts, `farbe`; `\n` im Text trennt Zeilen. Der neue Text ist ein Begriff des Texts, als ganzer Begriff wortgleich im Absatz `beleg`. Alte Beschriftungen mit verbotenem Begriff stehen nie in der Datei (sie wird von `npm run begriffe` geprüft).
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
| Story (3) | unbekannte Datei oder unbekanntes Feld · Pflichtfeld oder interne Belege fehlen · Beleg weder Absatz-ID noch V2.4-Stelle · `nr` nicht lückenlos oder nicht wie im Dateinamen · Thema unbekannt · nicht genau drei Antworten oder eine Wertung nicht genau einmal · Balkenwirkung keine ganze Zahl von −2 bis +2 · Campus-Stufe, Jahreszeit oder Licht unbekannt · Figur oder Bild unbekannt · Kapitel der Kurzfassung mit bzw. anderes Kapitel ohne Brückensatz · erstes Kapitel nicht in der Kurzfassung · nicht genau ein Vergleich · Gewicht nicht 5/3/1, Punkte nicht 1–5, Satz je Option und „gleichauf“ fehlt · Mini-Aufgabe mit unbekannter Lösung, Reihenfolge mit Wahlen, feste Rückmeldung an einer richtigen Wahl, weniger als drei Posten · kein Kärtchen „Wer entscheidet was“ · Variante „Vertrauen niedrig“ ohne sprechende Figur · sichtbar verbotenes Wort (`werkzeuge/sichtbar.mjs`) |
| Explore (4.5) | Titel oder interne Belege fehlen · Matrix-Stufen decken 1–25 nicht genau einmal · nicht je fünf Stufen · Vorgangsart oder Weg unbekannt |
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
| `theorie.<kNN>` | Themen: `id`, `kapitel`, `thema`, `reihe`, `nr`, `teil`, `titel`, `kurztitel`, `kurzsatz`, `symbol`, `deckt`, `einleitung` (HTML), `bloecke[]`, `quelle` |
| Block (`bloecke[]`, `kinder[]`) | `art`, `kennungen`, `id`, `kopf` (umgewandelte Kopfdaten; `zitat`: `quelle`, `vollstaendig`; `tafel`: `quelle`, `tabelle`, `hervor`), `felder` (HTML), `kinder`; `ebenen`-Blöcke tragen `ebenen[]` (`nr`, `titel`, `felder`, `bloecke`) |
| `kompass[]` | `id`, `begriff`, `andere`, `beleg`, `glossar`, `hinweis` |
| `abdeckung` | `gesamt`, `zugeordnet`, `anteil`, `ziele` (Absatz-ID → `{ theorie[] }`) |
| `geschichte` | `titel`, `auftakt` (`campus`, `textHtml`, `vorstellung`, `los`, `kurz`), `sieHtml`, `figuren[]`, `balken[]` (`id`, `titel`, `html`, `start`, `mehr`, `weniger`, `bilanz`), `bilanz` (je Typ `titel`, `html`), `mandat`, `kapitel[]` (`id`, `nr`, `titel`, `zeit`, `campus`, `campusNachher`, `zusatz`, `kurzfassung`, `brueckeHtml`, `thema`, `einstiegHtml`, `szene[]`, `bildSzene`, `bildFrage`, `frageHtml`, `antworten[]` mit `wertung`, `html`, `wirkung`, `folgeHtml`, `bild`, `gutHtml`, `dahinterHtml`, `mandatNachFolge`, `mini`, `vergleich`), `ende`; ohne `belege` und `begruendung` |
| `werkzeuge` | Explore-Texte (`einleitungHtml`, `mcda`, `matrix`, `vorgaenge`, `takt`, `glossar`); ohne `belege` |
| `regie` | **nur Regie**: `theorie/k<kapitel>` → `notiz` (HTML), `leitfragen` (Inline-HTML) |
| `geschichteRegie` | **nur Regie**: Kapitel (`k3`) → `notizHtml`, `leitfragen` |
| `src/generiert/abbildungen.json` (eigene Datei) | `abb-N` → Bild als `data:image/webp;base64,…`; nur `src/main.ts` lädt sie (P14, L-77) |

`src/inhalte/index.ts` gibt `regie` und `geschichteRegie` nur über `regieKapitel()`, `regieInhalte()` und `regieGeschichte()` heraus; das öffentliche `inhalte` enthält sie nicht.

---

## 7 Mehrsprachigkeit (vorbereitet)
Alle sichtbaren Texte stehen in `inhalte/`; Kennungen, Schlüssel und Art-Namen sind sprachneutral. Eine spätere Übersetzung legt `inhalte/<sprache>/…` mit denselben Kennungen an; das Werkzeug erhält dafür einen Parameter. Derzeit gibt es nur Deutsch.
