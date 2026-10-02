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
| `inhalte/geschichte/rahmen.yaml` | Rahmen der Story: Status, Kriterien, Prolog, Ende (3) | – |
| `inhalte/geschichte/sN-<name>.yaml` | eine Station der Story (3) | `id`, z. B. `s3` |
| `inhalte/werkzeuge.yaml` | Texte der fünf Explore-Werkzeuge (4.5) | – |
| `inhalte/glossar.yaml` | Glossar der Seite: Änderungen, Streichungen, neue Einträge (4.4) | `g-…` |
| `inhalte/begriffs-kompass.md` | Begriffs-Kompass (4.3) | je Eintrag eine Kennung |
| `inhalte/abdeckung.yaml` | Absatz-ID → Thema (4.6) | Absatz-ID |
| `inhalte/abbildungen/abb-N.yaml` | Beschreibung einer Abbildung der DOCX; daneben `abb-N.webp` und `stand.json` von `werkzeuge/abbildungen.mjs` (4.7) | `abb-N` wie in `whitepaper.json` |
| `inhalte/rechtliches/*.md` | Impressum und Datenschutz, gebaut von `werkzeuge/bau.mjs` (4.8) | – |
| `inhalte/fall.md` | Fall-Bibel: Nachschlagewerk der Autoren, wird nicht kompiliert (4.9) | – |

Kennungen (Stationen, Themen, Optionen, Container …) bestehen aus Buchstaben, Ziffern und Bindestrich, **ohne Umlaute** (`entscheidungsvorlage`, `ueberblick`). Sichtbarer Text darf alles.

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

### 2.5 Zitate und Bedienhinweise
- **Blockzitat:** `::: zitat k2.4-p2` … `:::` – der Text im Container muss wortgleich im Absatz stehen (O-17). Mehrere Absätze: `::: zitat k2.4-p1 k2.4-p2` (werden mit Leerzeichen verbunden). Auslassungen mit `[…]` sind erlaubt; jedes Stück muss dann in dieser Reihenfolge im Absatz stehen, an Wortgrenzen beginnen und enden und zwischen zwei `[…]` mindestens zwei Wörter tragen. Ein Zitat als Markdown-Liste ist nur erlaubt, wenn der Absatz eine Liste ist und jeder Punkt ein ganzer Punkt der Quelle ist (in ihrer Reihenfolge).
- **Inline-Zitat:** `[[zitat:k4.2-p3|die Bauherren-PL gibt bis einschließlich 100 TEUR eigenständig frei]]`.
- **Bedienhinweis:** `[[bedienung:Ziehen Sie den Regler.]]` – ein ganzer Satz, der nur gilt, wo das Werkzeug bedienbar ist; im Druck und auf der Leinwand ausgeblendet (R41, L-121).

„Wortgleich“ heißt: gleich nach Normalisierung von Leerraum und Silbentrennung (`normalisiere()` aus `werkzeuge/whitepaper-lib.mjs`, geprüft gegen die Anzeigefassung aus `werkzeuge/anzeige-fassung.mjs`); Anführungszeichen, Striche, Groß-/Kleinschreibung zählen. Absatz-IDs: `k<abschnitt>-<p|l|t|b><n>`, z. B. `k2.4-p2` (zweiter Absatz in 2.4), `k3.2-t1` (erste Tabelle in 3.2).

Die Absatz-ID steht im HTML nur als Attribut (`<blockquote class="mvg-zitat" data-absatz="k2.4-p2">`); sichtbar erscheint keine Quellenangabe (O-38).

---

## 3 Story (P16.6, O-40): `inhalte/geschichte/`

Eine durchgehende Geschichte aus Sicht des Bauherrn. Übersetzer: `werkzeuge/geschichte.mjs` (aus `werkzeuge/inhalte.mjs` aufgerufen), Typen: `src/geschichte/typen.ts`, Ablauf: `src/geschichte/engine.ts`, Vergleich: `src/geschichte/mcda.ts`. Alle Dateien sind reines YAML; Textfelder sind Markdown (Glossarbezüge erlaubt) und werden mit `|` als Block geschrieben.

**`rahmen.yaml`:** `titel`; `status` mit `kosten`, `puffer`, `offen` (je `start`, `einheit`, `titel`, optional `basis`); `kriterien` (Liste `{ id, titel }`, mindestens zwei); `prolog` (`titel`, `text`, `takt`); `ende` (`titel`, `text`, `puffer-gut`, `puffer-knapp`, `puffer-schlecht`).

**`sN-<name>.yaml`** (eine Datei je Station, `nr` lückenlos ab 1, zeitlich aufsteigend):

| Feld | Inhalt |
|---|---|
| `id`, `nr`, `titel`, `kurztitel`, `datum`, `monat`, `lph` (0–9) | Kopf (Pflicht) |
| `kurzfassung` | `true` = gehört zur Kurzfassung (Station 1 immer) |
| `belege` | interne Belege (`v24:hb-3.1`, Absatz-IDs; Pflicht, mindestens einer) – nie in der Ausgabe (O-38) |
| `lage` | Markdown (Pflicht) |
| `lage-folgen` | optional `{ kosten, puffer, offen }` (Zahlen), gilt ab dem Lesen der Lage |
| `bericht` | `titel`, `zeilen` (Text oder `{ text, wenn }`), `reaktion` |
| `vorgaenge` | Liste `{ art, kennung, titel, text, verantwortlich, termin, stand, matrix: { w, a }, wenn }`; Art: `aufgabe`, `massnahme`, `fruehwarnung`, `risiko`, `problem`, `aenderung`; ein Risiko, dessen `stand` nicht mit „geschlossen“ beginnt, braucht die Matrix (`w`, `a` je 1–5) |
| `vorlage` | `art` (`gewichte` oder `optionen`), `frage`, `grund`, `stelle`, `termin`, `verzug`, `muss`, optional `unvollstaendig`, `optionen`, `empfehlung { option, text }` |
| `folge`, `so-laeuft-es-oft`, `einwand { frage, antwort }` | Markdown (Pflicht) |
| `theorie` | Kennung (`thema`) des passenden Themas – „In der Story erlebt“ auf der Themenseite |
| `regie` | `notiz` (Markdown), `leitfragen` (Liste) – nur für die Regie (geht nach `geschichteRegie`) |

**Optionen:** `id` (ein Großbuchstabe), `titel`, `text`, `folgen` (`{ kosten, puffer, offen }`), `konsequenz`, optional `naechste`. Bei `optionen`: `punkte` je Kriterium `[1–5, "Begründung"]` (Begründung in Anführungszeichen, wenn sie ein Komma enthält). Bei `gewichte`: `gewichte` je Kriterium 1–5. `klaerung: true` = keine Entscheidung in der Sache (nur in einer unvollständigen Vorlage, geht nicht in den Vergleich). Weniger als zwei zulässige Optionen ⇒ `unvollstaendig` ist Pflicht, und eine unvollständige Vorlage braucht eine Klärungsoption. `empfehlung.option` muss eine Option der Vorlage sein.

**Bedingungen** (`wenn` an Berichtszeilen und Vorgängen): `s3=A` oder `s3!=A` – zeigen nur auf frühere Stationen und auf Optionen, die es dort gibt. Stationen außerhalb der Kurzfassung zählen dort mit der Option, die mit den geltenden Gewichten vorn liegt.

**Ganze Geschichte:** Die erste Station legt die Gewichte fest (`art: gewichte`) und gehört zur Kurzfassung; jede Station liegt zeitlich (`monat`) nicht vor der vorigen.

**Regie-Material ist nicht geheim:** `regie` steht im JSON getrennt (`geschichteRegie`, bei Themen `regie`), damit die Leinwand es nie zeichnet (docs/ARCHITEKTUR.md, „Regie und Leinwand“). Regie und Leinwand sind aber dieselbe Hauptseite; Notizen und Leitfragen stehen im Klartext in `dist/index.html`. In `regie` gehört nur, was ein Kunde lesen dürfte – nichts Vertrauliches, keine internen Einschätzungen von Kunden oder Personen.

---

## 4 Theorie und weitere Dateien

### 4.1 `inhalte/start.md`
Kopfdaten: `kicker` (Pflicht), `titel` (Pflicht: Leitsatz der Startseite), `titel-quelle` (Absatz-ID, intern; dann muss der Leitsatz wortgleich in diesem Absatz stehen, O-17). Text der Datei (Pflicht) = These unter dem Leitsatz, Inline-Markdown (`**…**` hebt hervor). Ausgabe: `startseite` (`kicker`, `titel`, `titelQuelle`, `these`); fehlt die Datei, ist `startseite` null. Fachliche Sätze der Startseite stehen hier, nicht im Code (O-18).

### 4.2 `inhalte/theorie/kNN-<name>.md` (Thema, P16.3, O-38)
Kopfdaten: `kapitel` (Pflicht, 1–16, passt zum Dateinamen; intern, bestimmt Abdeckung und Abbildungen), `titel` (Pflicht), `kurztitel`, `thema` (Kennung in der Adresse `#theorie/<thema>`, Vorgabe die Dateikennung), `reihe` (1–30, Reihenfolge der Themen; Vorgabe `kapitel`), `deckt` (Liste von Absatz-IDs oder Abschnitten, die dieses Thema zusätzlich zu `zitat` und `tafel` abdeckt). `thema` und `reihe` sind über alle Themen eindeutig. Text der Datei = Einleitung. Interne Belege stehen als YAML-Kommentare in den Kopfdaten.

| Art | Ort | Kennung | Kopfdaten | Felder / Inhalt |
|---|---|---|---|---|
| `kernaussage` | oben | – | – | `text` (Pflicht) |
| `abschnitt` | oben | Abschnitts-ID (`k4.2`, intern) | `titel` | `text`; enthält die Bausteine, die „abschnitt“ als Ort erlauben |
| `ebenen` / `ebene` | oben, `abschnitt` / in `ebenen` | – / `1`–`4` | – / `titel` | `text`; vier aufklappbare Stufen (Ebene 1 offen); Ebene 4 braucht ein `zitat` |
| `karten` / `karte` | oben, `abschnitt` / in `karten` | – / optional | `titel` / `titel` (Pflicht), `symbol` | `text` / `text`, `rueckseite` |
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

Formen der `tafel`: `radar` · `ketten` (mindestens vier Spalten) · `schwelle` (genau zwei Spalten) · `pyramide` · `felder` (mindestens fünf Spalten) · `bausteine` · `phasen` · `register` · `rhythmus` · `karten` · `zeitachse` (Regler über die Zeiträume der ersten Spalte) · `diagnose` (qualitative Selbstdiagnose ohne Punktzahl, O-8). `hervor` nennt Zeilen, die hervorgehoben bzw. vorgewählt sind.

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
abweichungen:                      # was danach noch vom Text abweicht – steht aufklappbar in der Bildunterschrift
  - text: Im Kern steht „ausübbar“; der Text nennt sichtbar, prüfbar und gestaltbar.
    beleg: k4-p1
```
Überdeckung: Rechteck in Pixeln des Originals, mit der Hintergrundfarbe gefüllt (Median des Rands oder `hintergrund`), Text in IBM Plex Sans (`schrift: plex`, Vorgabe) oder Barlow Condensed (`barlow`), `gewicht` 400–700, `groesse` (sonst passend gerechnet), `ausrichtung` links/mitte/rechts, `farbe`; `\n` im Text trennt Zeilen. Der neue Text ist ein Begriff des Texts, als ganzer Begriff wortgleich im Absatz `beleg`. Alte Beschriftungen mit verbotenem Begriff stehen nie in der Datei (sie wird von `npm run begriffe` geprüft).
Bilder erzeugen: `node werkzeuge/abbildungen.mjs [abb-N …]` (Chromium; schreibt `abb-N.webp` und `stand.json`, deterministisch). Vermessen: `--raster abb-N x y b h [--nach]` (Ausschnitt mit Koordinatenraster), Sichtprüfung: `--vorschau abb-N` (nur `tmp/abbildungen/`). `inhalte` meldet ein Bild als **veraltet** (harter Fehler, auch im Bau), wenn Quelle oder Überdeckungen nicht mehr zu `stand.json` passen; Titel, Alternativtext und Abweichungen ändern kein Bild. Die Bilder gehen als data:-URL nach `src/generiert/abbildungen.json` (nur `src/main.ts` lädt sie).

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
| Themen | `kapitel` fehlt oder passt nicht zum Dateinamen · `thema` oder `reihe` doppelt · zweiter Regie-Block · Wissenscheck ohne zwei Antworten oder ohne Beleg · Ebene 4 ohne Zitat |
| Story (3) | Pflichtfeld oder interne Belege fehlen · `nr` nicht lückenlos · Kennung doppelt · LPH außerhalb 0–9 · Punkte/Gewichte nicht 1–5 · Vorlage mit weniger als zwei zulässigen Optionen ohne `unvollstaendig` · Empfehlung keine Option · Vorgangsart unbekannt · offenes Risiko ohne Matrix · Bedingung unlesbar oder nicht auf eine frühere Station · erste Station legt die Gewichte nicht fest oder gehört nicht zur Kurzfassung · Stationen zeitlich rückwärts |
| Explore (4.5) | Titel oder interne Belege fehlen · Matrix-Stufen decken 1–25 nicht genau einmal · nicht je fünf Stufen · Vorgangsart oder Weg unbekannt |
| Zitate | Absatz-ID unbekannt oder Text nicht wortgleich (2.5) |
| Glossar | `[[Begriff]]` nicht im Glossar · `glossar.yaml` ändert/entfernt Unbekanntes oder ohne Beleg |
| Kompass | Begriff steht nicht im Beleg-Absatz · mehr als eine Absatz-ID · `andere` leer · Eintrag doppelt |
| Abdeckung | Abdeckung < 100 % · Absatz nicht auf dem Thema seines Kapitels · Thema unbekannt |
| Abbildungen (4.7) | Beschreibung verletzt das Schema (Felder, Rechteck, Beleg keine Absatz-ID, `alt` > 600 Zeichen) · Bild veraltet gegenüber `stand.json` oder WebP passt nicht (auch ohne `--pruefe`, harter Fehler) · `::: abbildung` ohne Beschreibung, im fremden Kapitel oder auf zwei Themen · Abbildung mit Bild steht auf keinem Thema · Überdeckungstext nicht als ganzer Begriff wortgleich im Absatz `beleg` |
| Begriffe | verbotener Begriff (docs/BEGRIFFE.md) irgendwo in der fertigen JSON – auch in Glossar und Kapiteltiteln (der Kompass ausgenommen) |

Fehlt `whitepaper.json` noch, sind Zitat-, Glossar- und Abdeckungsprüfung **Warnungen** (sonst Fehler). Ohne `--pruefe` meldet das Werkzeug nur Fehler, die das Kompilieren verhindern.

Ein lauffähiges kleines Beispiel (Thema, Abdeckung, Startseite) steht als `BEISPIEL` in `tests/inhalte.test.ts`; die Story prüft `tests/geschichte.test.ts`. Für eine neue Station ist die nächstliegende vorhandene Station unter `inhalte/geschichte/` die beste Vorlage.

---

## 6 Ausgabe `src/generiert/inhalte.json` (Kurzreferenz, Typen: `src/inhalte/typen.ts`, `src/geschichte/typen.ts`)

| Schlüssel | Inhalt |
|---|---|
| `version` | Formatversion (1) |
| `whitepaper` | `fassung`, `titel`, `kapitel` (Gliederung, intern), `abbildungen[]` (je Abbildung `id`, `nr`, `kapitel`, `ort`, `bild` mit `titel`, `alt`, `breite`, `hoehe`, `angeglichen[]`, `abweichungen[]` – oder `null`) |
| `startseite` | `kicker`, `titel`, `titelQuelle`, `these` (Inline-HTML) aus `inhalte/start.md`, sonst null |
| `glossar.<id>` | Glossar der Seite (`begriff`, `definition`, `vorkommen.kapitel[]`) |
| `theorie.<kNN>` | Themen: `id`, `kapitel`, `thema`, `reihe`, `titel`, `kurztitel`, `deckt`, `einleitung` (HTML), `bloecke[]`, `quelle` |
| Block (`bloecke[]`, `kinder[]`) | `art`, `kennungen`, `id`, `kopf` (umgewandelte Kopfdaten; `zitat`: `quelle`, `vollstaendig`; `tafel`: `quelle`, `tabelle`, `hervor`), `felder` (HTML), `kinder`; `ebenen`-Blöcke tragen `ebenen[]` (`nr`, `titel`, `felder`, `bloecke`) |
| `kompass[]` | `id`, `begriff`, `andere`, `beleg`, `glossar`, `hinweis` |
| `abdeckung` | `gesamt`, `zugeordnet`, `anteil`, `ziele` (Absatz-ID → `{ theorie[] }`) |
| `geschichte` | `titel`, `status`, `kriterien`, `prolog` (`titel`, `html`, `taktHtml`), `ende` (`titel`, `html`, `pufferGut`, `pufferKnapp`, `pufferSchlecht`), `stationen[]` (Kopf, `lageHtml`, `lageFolgen`, `bericht`, `vorgaenge`, `vorlage` mit `optionen[]` und `empfehlung`, `folgeHtml`, `soLaeuftHtml`, `einwand`, `theorie`); ohne `belege` |
| `werkzeuge` | Explore-Texte (`einleitungHtml`, `mcda`, `matrix`, `vorgaenge`, `takt`, `glossar`); ohne `belege` |
| `regie` | **nur Regie**: `theorie/k<kapitel>` → `notiz` (HTML), `leitfragen` (Inline-HTML) |
| `geschichteRegie` | **nur Regie**: Station (`s3`) → `notizHtml`, `leitfragen` |
| `src/generiert/abbildungen.json` (eigene Datei) | `abb-N` → Bild als `data:image/webp;base64,…`; nur `src/main.ts` lädt sie (P14, L-77) |

`src/inhalte/index.ts` gibt `regie` und `geschichteRegie` nur über `regieKapitel()`, `regieInhalte()` und `regieGeschichte()` heraus; das öffentliche `inhalte` enthält sie nicht.

---

## 7 Mehrsprachigkeit (vorbereitet)
Alle sichtbaren Texte stehen in `inhalte/`; Kennungen, Schlüssel und Art-Namen sind sprachneutral. Eine spätere Übersetzung legt `inhalte/<sprache>/…` mit denselben Kennungen an; das Werkzeug erhält dafür einen Parameter. Derzeit gibt es nur Deutsch.
