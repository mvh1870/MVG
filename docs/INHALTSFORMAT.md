# Inhaltsformat

Stand P0.5 (2026-09-26). Verbindlich für alle Dateien unter `inhalte/` (O-18: Inhalte ohne Programmierung änderbar). Das Werkzeug `werkzeuge/inhalte.mjs` liest sie, prüft sie und schreibt `src/generiert/inhalte.json`; die Typen dieser Datei stehen in `src/inhalte/typen.ts`.

Kurz: **normales Markdown**, oben **Kopfdaten** (YAML zwischen `---`), dazu **Container** mit `:::` für alles, was eine feste Form hat (Option, Mail, Zitat …). Innerhalb eines Containers gliedern `###`-Überschriften die **Felder**.

```
node werkzeuge/inhalte.mjs            # kompilieren (schreibt src/generiert/inhalte.json)
node werkzeuge/inhalte.mjs --pruefe   # kompilieren und alles prüfen; Exitcode 1 bei Fehlern
```

---

## 1 Dateien

| Datei | Inhalt | Kennung |
|---|---|---|
| `inhalte/start.md` | Startseite: Kicker, Leitsatz (wörtlich, mit Absatz-ID), These | – |
| `inhalte/fall.md` | Fall-Bibel: Stadt, GML, Projekt, Zahlen, Gremien, Figuren | – |
| `inhalte/rollen/<id>.md` | eine der sechs spielbaren Rollen | Dateiname: `gf`, `bauherr`, `pl`, `ps`, `planung`, `controlling` |
| `inhalte/story/<station>/station.md` | gemeinsames Rückgrat einer Station (alle Rollen) | Ordnername, z. B. `A3`, `B3`, `prolog`, `wendepunkt`, `ende-steuerbar` |
| `inhalte/story/<station>/<rolle>.md` | Rollenszene dieser Station (Entscheidung, Optionen, Rückbezug, Regie) | Ordner + Rolle, z. B. `A3/pl` |
| `inhalte/theorie/kNN-<name>.md` | Lernseite zu Kapitel NN (01–13) | `kNN`, z. B. `k02` |
| `inhalte/einwaende.md` | Einwand-Karten (E6) | je Karte eine ID |
| `inhalte/abdeckung.yaml` | Absatz-ID → Theorie-Seite / Story-Station | Absatz-ID |

Kennungen (Stationen, Schritte, Optionen, Figuren …) bestehen aus Buchstaben, Ziffern und Bindestrich, **ohne Umlaute** (`ende-neufestlegung`, `ueberblick`). Sichtbarer Text darf alles.

Zeichensatz UTF-8, Zeilenenden egal (werden zu LF). Dateien, die mit `_` beginnen, werden ignoriert (Entwürfe).

---

## 2 Grundbausteine

### 2.1 Kopfdaten (YAML)
Am Dateianfang zwischen zwei Zeilen `---`. **Alle Werte werden als Text gelesen** und erst vom Werkzeug nach Schema umgewandelt (Zahl, Liste, ja/nein). Damit gibt es keine YAML-Fallen wie `no` → falsch oder `08:30` → Zahl.

```yaml
---
id: A3
monat: 5
whitepaper-bezug: [k2.4-p2, k4.6-p2]
ende: nein
---
```

Zu beachten:
- Schlüssel in Kleinbuchstaben mit Bindestrich (`status-start`, `whitepaper-bezug`); im JSON werden daraus camelCase-Namen (`statusStart`).
- **`#` beginnt in YAML einen Kommentar.** Farben deshalb in Anführungszeichen: `farbe: "#3866A8"`. Das Werkzeug meldet eine leere Farbe als Fehler.
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
- Öffnen: eine Zeile mit mindestens drei Doppelpunkten, dem **Art-Namen** und – je nach Art – einer oder mehreren **Kennungen** (`::: option A`, `::: zitat k2.4-p2`).
- Schließen: eine Zeile **nur** aus Doppelpunkten (`:::`). Sie schließt immer den innersten offenen Container.
- Container dürfen verschachtelt werden (z. B. eine `mail` in einem `schritt`); jede Art hat feste erlaubte Orte (Abschnitt 4).
- Direkt nach der Öffnungszeile dürfen Kopfdaten des Containers zwischen zwei `---`-Zeilen stehen (gleiche Regeln wie 2.1).
- Innerhalb von Code-Blöcken (```` ``` ````) werden `:::`-Zeilen nicht ausgewertet.

### 2.3 Felder
Innerhalb eines Containers (und auf oberster Ebene einer Datei) teilen `###`-Überschriften den Text in Felder. Text vor der ersten Feldüberschrift ist das Feld `text`. Aus der Überschrift wird der Feldname: Umlaute umgeschrieben, Wörter zusammengezogen (`### Was fehlt` → `wasFehlt`, `### Governance-Frage` → `governanceFrage`, `### Rückmeldung` → `rueckmeldung`). Welche Felder eine Art kennt, steht in Abschnitt 4; unbekannte Felder sind ein Fehler. Andere Überschriften (`#`, `##`, `####`) bleiben normaler Text.

Felder werden zur Bauzeit mit `marked` (GFM) zu HTML. Rohes HTML im Markdown wird **nicht** übernommen, sondern als Text angezeigt. Inline-Code (`` `ENT-017` ``) wird `<code>` und so in Monospace gesetzt – so werden IDs geschrieben.

### 2.4 Listen mit Kennung und Checklisten
- Listenpunkt mit Kennung: `- Terminwirkung {#terminwirkung}` (Kennung am Zeilenende).
- Checklisten-Punkte (nur im Feld `checkliste` einer `vorlage`): `- [x]` erfüllt · `- [-]` fehlt · `- [ ]` noch offen.

### 2.5 Glossarbezüge
`[[Begriff]]` oder `[[Begriff|angezeigter Text]]` verweist auf einen Eintrag im Glossar des Whitepapers (`quellen/whitepaper/v1.2/whitepaper.json`, Feld `glossar`). Der Vergleich ignoriert Groß-/Kleinschreibung, weiche Trennzeichen und einen Klammerzusatz (`[[MVG]]` und `[[Minimum Viable Governance]]` treffen beide „Minimum Viable Governance (MVG)“).

Ergebnis im HTML: `<span class="mvg-glossar" data-glossar="g-mandat" data-begriff="Mandat">Mandat</span>`. Die Oberfläche macht daraus den Mouseover/Fokus-Hinweis mit der Definition aus `inhalte.json → glossar`.

### 2.6 Zitate (wortgleich, O-17)
- **Blockzitat:** `::: zitat k2.4-p2` … `:::` – der Text im Container muss wortgleich im Absatz stehen. Mehrere Absätze: `::: zitat k2.4-p1 k2.4-p2` (werden mit Leerzeichen verbunden). Auslassungen mit `[…]` sind erlaubt; jedes Stück muss dann in dieser Reihenfolge im Absatz stehen.
- **Inline-Zitat:** `[[zitat:k4.2-p3|die Bauherren-PL gibt bis einschließlich 100 TEUR eigenständig frei]]`.
- **Originaltext einbinden:** `::: original k2.4-p1 k2.4-p2` (oder ganzer Abschnitt `::: original k2.4`, oder Bereich `::: original k2.4-p1..k2.4-p3`) – der Container bleibt leer, das Werkzeug setzt den Text aus `whitepaper.json` ein. Das ist der bevorzugte Weg im Theorie-Teil: wortgetreu durch Bauart. Umfasst der Auszug mehrere Abschnitte (z. B. `::: original k1`), steht vor dem ersten Absatz jedes Unterabschnitts dessen Überschrift (`<h4 class="mvg-original-titel" data-abschnitt="k1.1">1.1 Leitthese</h4>`) – der Originaltext bleibt in der Gliederung des Whitepapers (O-20).

„Wortgleich“ heißt: gleich nach Normalisierung von Leerraum und Silbentrennung (`normalisiere()` aus `werkzeuge/whitepaper-lib.mjs`); Anführungszeichen, Striche, Groß-/Kleinschreibung zählen. Absatz-IDs: `k<abschnitt>-<p|l|t|b><n>`, z. B. `k2.4-p2` (Kapitel 2.4, zweiter Absatz), `k3.2-t1` (erste Tabelle in 3.2).

HTML: `<blockquote class="mvg-zitat" data-absatz="k2.4-p2">…</blockquote>` bzw. `<q class="mvg-zitat" data-absatz="…">…</q>`; die Quelle („Whitepaper V1.2, Kap. 2.4“) steht im Block unter `kopf.quelle`.

### 2.7 Statuswerte und Statuswirkung
Fünf Werte (Statusbereich des Leitstands):

| Schlüssel | Werte |
|---|---|
| `entscheidungsfaehigkeit` | Zahl 0–5 |
| `kostenunsicherheit` | Stufe: `niedrig` · `mittel` · `hoch` · `sehr hoch` |
| `offene-risiken` | Zahl ≥ 0 |
| `ungeklaerte-entscheidungen` | Zahl ≥ 0 |
| `terminrisiko` | Stufe: `niedrig` · `mittel` · `hoch` · `sehr hoch` |

Schreibweise eines Werts: `4` (setzen) · `+1` / `-1` (ändern um; bei Stufen um Stufen – **das Vorzeichen entscheidet**: `1` setzt, `+1` ändert; Anführungszeichen sind möglich, aber nicht nötig) · `sehr hoch` (Stufe setzen) · Zusatz in Klammern wird als Hinweis angezeigt: `7 (1 neu bewertet)`. Ein Wert wird auf seinen Bereich begrenzt (0–5, niedrig … sehr hoch, ≥ 0).

- `status-start` (Station) setzt beim Betreten den Stand der Welt dieser Station; er muss **alle fünf** Werte setzen.
- `status` (Option, Zeitsprung) wirkt auf die Welt der Station. Eine Option **muss** eine Statuswirkung haben; „keine Wirkung“ schreibt man ausdrücklich: `status: keine`.

Die Engine rechnet den Status jedes Mal aus dem Verlauf neu (Stationen in Reihenfolge: `status-start`, dann angeforderte Informationen, dann die Wahl). Eine geänderte Wahl verschiebt den Status also sauber zurück.

Nachwirkung (L-21): Was Informationen und Wahl an einer Station gegenüber ihrem Stand bewegt haben, wirkt in der nächsten Station **derselben Welt** nach – auf deren `status-start` wird je Wert höchstens ±1 aufgeschlagen (Stufen um eine Stufe). So bleibt der erzählte Trend der Welt erhalten, und die Spur zählt trotzdem. Eine Station **ohne** `status-start` (z. B. die Wirklichkeit) rechnet mit dem laufenden Stand ihrer Welt weiter (L-19).

### 2.8 Bedingungen
Für `weiter` (Abschnitt 3.3). Eine Bedingung je Zeile; eine Liste unter `wenn` heißt „alle“, unter `wenn-eine` heißt „mindestens eine“.

| Form | Bedeutung |
|---|---|
| `wahl A3 = A` · `wahl A3 = A\|D` · `wahl A3/pl != B` | frühere Wahl (ohne `/rolle`: die gerade gespielte Rolle) |
| `antwort B3/pl/reife = nein` | Antwort auf eine Frage |
| `rolle = pl\|ps` | gespielte Rolle |
| `welt = B` | aktuelle Welt |
| `interesse kosten` | im Prolog gewähltes Interesse |
| `info A3/info` | Information angefordert (Zeitsprung) |
| `besucht A4` | Station schon besucht |
| `freigeschaltet welt-b` · `freigeschaltet explore` | Freischaltung |
| `status A kostenunsicherheit >= hoch` · `status B offene-risiken < 5` | Statusvergleich (`=`, `!=`, `<`, `<=`, `>`, `>=`) |
| `nicht …` | Verneinung jeder Form |

---

## 3 Story

### 3.1 Aufbau
Die Story ist ein Graph aus **Stationen** (Knoten) mit Kanten `weiter`. Jede Station hat eine Folge von **Schritten** (Klicks). Das **Rückgrat** (`station.md`) gilt für alle Rollen; die **Rollenszene** (`<rolle>.md`) liefert Entscheidung, Optionen, Fragen, Rückbezüge und Regie-Material für genau eine Rolle. Schritte der Arten `entscheidung`, `konsequenz` und `rueckbezug` werden nur gezeigt, wenn die gespielte Rolle dafür eine Szene hat.

Welt B ist gesperrt, bis eine Station mit `schaltet-frei: [welt-b]` betreten wurde (in den Inhalten das Rückspulen, `schaltet-frei: [welt-b]`; bis P5.10 schaltete die Vergleichsstation des Durchstichs frei). Der Prüfer verlangt, dass keine Welt-B-Station ohne diese Freischaltung erreichbar ist.

### 3.2 `station.md` – Kopfdaten
| Schlüssel | Pflicht | Wert |
|---|---|---|
| `id` | ja | gleich dem Ordnernamen |
| `art` | nein | `station` (Vorgabe) · `prolog` · `vergleich` · `wendepunkt` · `rueckspulen` · `wirklichkeit` · `ende` · `epilog` |
| `welt` | nein | `A` · `B`; leer = neutral (Prolog, Wendepunkt, Vergleich) |
| `monat` | nein | Zahl 0–12 |
| `titel` | ja | z. B. `Kosten +8 %` |
| `kurztitel` | nein | für die Story-Karte; Vorgabe `titel` |
| `lph` | nein | 0–9 (LPH-Zeitband) |
| `uhr` | nein | Tagesuhr, z. B. `Montag, 08:30 Uhr` |
| `whitepaper-bezug` | nein | Liste von Absatz-IDs (Pflicht-Prüfung: existieren) |
| `status-start` | nein | alle fünf Statuswerte (2.7) |
| `weiter` | ja, außer `ende: ja` | Station-ID oder Liste von Kanten `{ziel, wenn, wenn-eine}`; die erste passende Kante gilt |
| `ende` | nein | `ja` = Ende der Geschichte (keine Kante nötig) |
| `schaltet-frei` | nein | Liste: `welt-b`, `explore` |
| `partner` | nein | dieselbe Station in der anderen Welt (für den Schieberegler A ↔ B) |
| `vergleich` | bei `art: vergleich` | `{a: A3, b: B3}` |

Kanten mit Bedingung:
```yaml
weiter:
  - ziel: ende-auflagen
    wenn: [status B entscheidungsfaehigkeit < 3]
  - ziel: ende-steuerbar
```

### 3.3 `station.md` – Container
| Art | Ort | Kennung | Kopfdaten | Felder / Inhalt |
|---|---|---|---|---|
| `schritt` | oben | Pflicht (`einstieg`) | `art` (s. u.), `titel` (Pflicht), `kurz`, `gruppe`, `uhr`, `knopf` (Beschriftung des Weiter-Knopfs, z. B. „Jetzt entscheiden“), bei `rollenwahl`: `folgt` (Liste Rollen ohne Szenen) | `text`, bei `vergleich`: `weltA`, `weltB` (Bildbeschreibung je Seite) |
| `ebenen` | oben | – | – | enthält `ebene 1` … `ebene 4` |
| `ebene` | in `ebenen` | `1`–`4` | `titel` | `text`; Ebene 4 enthält ein `zitat` |
| `standpunkt` | oben | Rolle (`controlling`) | `figur` (Pflicht) | `text` = was diese Figur im selben Moment denkt („Standpunkt wechseln“) |
| `express` | oben | – | – | `text` (Pflicht) – Karte „Was dazwischen geschah“ über dem ersten Schritt der Station, nur für Leser mit Interesse `express` (L-43) |
| `vertiefung` | oben | Interesse (`kosten`) | `titel` (Pflicht) | `text` (Pflicht) – Zusatzkarte unter den Ebenen, nur sichtbar, wenn der Leser im Prolog dieses Interesse gewählt hat (P3.9); braucht einen Schritt `ebenen`; Zitate wortgleich mit Absatz-ID |
| `regie` | oben | – | – | `notiz`, `leitfragen` (Liste) – **nur Regie**, landet nie in den Leinwand-Daten |

Schrittarten (`art` im `schritt`): `text` (Vorgabe) · `lage` (Bekannt/Unbekannt) · `entscheidung` · `konsequenz` · `rueckbezug` · `vergleich` (Schieberegler) · `rollenwahl` · `interessenwahl` · `ebenen`. Schritte mit gleicher `gruppe` zeigt die Oberfläche als Teile eines Schritts (z. B. die sechs Teile von B3).

Bausteine in einem `schritt`:

- `tafel <Tabellen-ID>` (auch in Theorie-Seiten, Abschnitten, Ebenen): Whitepaper-Tabelle als Grafik, `form` Pflicht (`radar` · `ketten` · `schwelle` · `pyramide` · `felder` · `bausteine` · `phasen` · `register` · `rhythmus` · `karten`), bei `radar` optional `erlebt` (Zeilennummer → Stationen, kommagetrennt), optional `hervor` (Liste von Zeilennummern, z. B. die aktuelle LPH; bei `phasen`/`rhythmus` vorgewählt); Zellen kommen wortgleich aus whitepaper.json (L-32).
- `raci` (P5.1, Kap. 9.2): Kopfdaten `zeilen` = Liste mit `id`, `titel`, `A` (genau eine Rolle), `R`/`C`/`I` (Listen von Rollen), `mandat` (Text: Schwelle, Gremium); jede Rolle höchstens ein Buchstabe; optional `text` als Einleitung. Die Spalte der gespielten Rolle ist hervorgehoben. Zuordnungen sind Fall-Inhalt und müssen zu Kap. 3.2 passen (z. B. Freigabe des Einsatzes der Risikoreserve: A beim Bauherrn).

| Art | Kennung | Kopfdaten | Felder / Inhalt |
|---|---|---|---|
| `mail` | – | `von` (Figur, Pflicht), `betreff` (Pflicht), `zeit`, `anhang` | `text` |
| `chat` | – | `von` (Pflicht), `zeit` | `text` |
| `anruf` | – | `von` (Pflicht), `zeit` | `text` |
| `notiz` | – | `farbe`: `gelb` · `rosa` · `lila` · `limette`; `symbol` | `text` (Haftnotiz, Welt A) |
| `protokoll` | – | `titel` (Pflicht), `datum`, `von` (Figur) | `text` (Punkte als Liste; Welt A, P3.1) |
| `akten` | – | `beschriftung` (Pflicht), `anzahl` (1–12, Ordnerrücken) | `text` (Zusatz, optional; Welt A, P3.1) |
| `datei` | – | `name` (Pflicht), `quelle`, `wert` | `text` (z. B. Excel-Stand) |
| `bekannt` | – | – | `text` = Liste |
| `unbekannt` | – | – | `text` = Liste mit Kennungen `{#id}` |
| `zeitsprung` | Pflicht (`info`) | `knopf`, `kosten`, `dauer`, `status` (2.7), `loest` (Kennung → Hinweis), `bleibt` (Kennung → Hinweis) | `text`, `neuBekannt` |
| `grafik` | Pflicht (Name im Grafik-Baukasten) | `titel`, `untertitel` | `text` = Beschreibung für Screenreader |
| `kette` | – | – | enthält `glied` |
| `glied` | optional (`FRW-003`) | `art`: `fruehwarnung` · `bestaetigung` · `risiko` · `aenderung` · `entscheidung` · `freigabe` · `massnahme` · `problem` · `bericht`; `von` | `titel`, `text` |
| `datenstand` | – | `name` (Pflicht), `abweichung`, `betrag`, `basis`, `versionen` (Liste `- Version 3: gilt` → `{name, stand}`) | `text`, `vergleich` |
| `mandatsleiter` | – | `betrag`, `betrag-teur` (Zahl), `stufen` (Liste von `{wer, bereich, bis-teur, hinweis}`) | `text` (Frage zur Leiter) |
| `mandatsoption` | Pflicht (`1`) | `titel` (Pflicht), `detail`, `zustaendig` (Pflicht), `stufe` (Zahl) | `text` = Begründung |
| `vorlage` | Pflicht (`ENT-017`) | `titel`, `datenstand` | `frage`, `checkliste` (2.4) |
| `fluss` | – | `position`: `fruehwarnung` · `bestaetigt` · `risiko` · `entscheidung` · `freigabe` · `massnahme` · `managementbericht` | `text` |
| `paar` | – | `a` (Art des Welt-A-Stücks: `mail` · `chat` · `notiz` · `datei`), `von`, `b` (Art im Fluss), `kennung`, `fluss` (Position wie oben) | `weltA`, `weltB` |
| `kennzahl` | – | `a` (Zahl), `b` (Zahl) | `text` = Bezeichnung |
| `interesse` | Pflicht (`kosten`) | `titel` (Pflicht) | `text` |
| `merksatz` | – | – | `text` |
| `hinweis` | – | – | `text` |
| `zitat`, `original` | Absatz-ID(s) | – | siehe 2.6 |

### 3.4 Rollenszene `<rolle>.md`
Kopfdaten: `station` (Pflicht, = Ordner), `rolle` (Pflicht, = Dateiname), `frage` (Pflicht, sobald es Optionen gibt), `entscheidung` (Kennung, Vorgabe `<station>/<rolle>`), `rueckbezug-auf` (Station oder Entscheidung, auf deren Wahl sich die Rückbezüge beziehen).

| Art | Kennung | Kopfdaten | Felder |
|---|---|---|---|
| `option` | Pflicht, `A`–`F` | `titel` (Pflicht), `kurz` (Pflicht, für Rückbezug und Spur), `symbol`, `status` (Pflicht, 2.7) | `konsequenz`, `wasFehlt`, `neuesRisiko`, `governanceFrage` – alle Pflicht (Überschriften `### Konsequenz`, `### Was fehlt`, `### Neues Risiko`, `### Governance-Frage`) |
| `nachsatz` | – | – | `text` (steht unter jeder Konsequenz) |
| `frage` | Pflicht (`reife`) | `schritt` (in welchem Schritt sie erscheint) | `frage`, `rueckmeldung`; enthält `antwort` |
| `antwort` | Pflicht (`ja`) | `titel` (Pflicht), `praefix`, `symbol` | `text` |
| `rueckbezug` | Option (`A`) oder `ohne` | – | `text` – Welt B zitiert die frühere Wahl („Damals haben Sie …“); `ohne` gilt, wenn keine Wahl vorliegt |
| `regie` | – | – | `notiz`, `leitfragen` – nur Regie |

Der Prüfer verlangt: jede Option hat alle vier Konsequenz-Felder und eine Statuswirkung; zu jeder Option der Entscheidung, auf die `rueckbezug-auf` zeigt, gibt es einen `rueckbezug`.

### 3.5 Vergleichsstation (Welt A ↔ B)
Eine Station mit `art: vergleich`, `vergleich: {a: A3, b: B3}` und einem Schritt `art: vergleich`. (Die Form bleibt erlaubt; die Inhalte nutzen sie seit P5.10 nicht mehr – die Durchstich-Station `A3-B3-vergleich` ist entfallen, der Regler steht in den Vergleichsschritten `art: vergleich` der B-Stationen, L-45.) Ihre `paar`-Container beschreiben, welches Welt-A-Stück an welche Stelle des Governance-Flusses „fliegt“, die `kennzahl`-Container die Zähler unter dem Regler (Welt A → Welt B). Nach dem Wendepunkt tragen alle Stationen einer Welt ihren `partner`; der Schieberegler steht dann an jeder Station bereit.

### 3.6 Ebenen 1–4 (progressive Information)
`ebene 1` Kernaussage · `ebene 2` Warum relevant · `ebene 3` Vertiefung (Tabellen als GFM-Tabelle) · `ebene 4` Nachweis = `zitat` mit Absatz-ID (wortgleich). Stationen und Theorie-Seiten nutzen dieselbe Form.

---

## 4 Weitere Dateien

### 4.0 `inhalte/start.md`
Kopfdaten: `kicker` (Pflicht), `titel` (Pflicht: Leitsatz der Startseite), `titel-quelle` (Absatz-ID; dann muss der Leitsatz wortgleich in diesem Absatz stehen, O-17). Text der Datei (Pflicht) = These unter dem Leitsatz, Inline-Markdown (`**…**` hebt hervor). Ausgabe: `startseite` (`kicker`, `titel`, `titelQuelle`, `these`); fehlt die Datei, ist `startseite` null. Fachliche Sätze der Startseite stehen hier, nicht im Code (O-18).

### 4.1 `inhalte/fall.md`
Kopfdaten: `stadt`, `bauherr`, `vertretung`, `vertretung-kurz`, `projekt`, `bauteile` (Liste), `bauweise`, `projektbasis` (Text, z. B. `58,4 Mio. € brutto`), `projektbasis-mio` (Zahl), `gremien` (Liste), `monat-0` (Kalendermonat von Monat 0, `JJJJ-MM`), `lph-stand` (Zeitachse: `"Monat": "LPH"` für Monat 0–12; der Prüfer verlangt, dass `monat`/`lph` jeder Station dazu passen), `hinweis` (Pflicht: Kennzeichnung als fiktiv, O-3). Text der Datei = Fall-Bibel (Zahlen, Zeitachse, Gremien und Takte), Markdown mit `##`-Überschriften und Tabellen.

| Art | Kennung | Kopfdaten | Felder |
|---|---|---|---|
| `figur` | Pflicht (`brenner`) | `name` (Pflicht), `rolle` (Rollen-ID oder leer), `funktion` (Pflicht), `farbe` (Pflicht, `"#RRGGBB"`), `spieler` (ja/nein) | `kurzbeschreibung`, `stimme` |

### 4.2 `inhalte/rollen/<id>.md`
Kopfdaten: `titel` (Pflicht), `kurztitel`, `farbe` (Pflicht), `textfarbe` (wenn die Farbe als Text zu hell ist), `figur` (Figur aus `fall.md`), `whitepaper-bezug`. Felder (oberste Ebene): `text` (Einleitung), `### Linse` (Pflicht: worauf die Rolle schaut), `### Delegierbar` (Arbeit, die diese Rolle trägt oder weitergeben kann), `### Nicht delegierbar` (was beim Bauherrn bzw. außerhalb ihres Mandats bleibt – die Grenze der Rolle), je als Liste. Die Begriffe folgen der Tabelle in Kap. 3.2; jede Aussage muss sich auf Kap. 3.2/3.3/4.2/6.4/9.3 zurückführen lassen (Absatz-IDs in `whitepaper-bezug`).

Ob eine Rolle spielbar ist, steht im Prolog (`schritt` mit `art: rollenwahl`, Liste `folgt`).

### 4.3 `inhalte/theorie/kNN-<name>.md` (Lernseite)
Kopfdaten: `kapitel` (Pflicht, 1–13), `titel` (Pflicht, wie im Whitepaper), `kurztitel`, `grafik` (Name im Grafik-Baukasten), `story` (Liste von Stationen: „In der Story erlebt“), `deckt` (Liste von Absatz-IDs oder Abschnitten, die diese Seite abdeckt, zusätzlich zu `original`/`zitat`). Text der Datei = Einleitung.

| Art | Ort | Kennung | Kopfdaten | Felder |
|---|---|---|---|---|
| `kernaussage` | oben | – | – | `text` |
| `abschnitt` | oben | Abschnitts-ID (`k2.4`) | `titel` | `text`; enthält alle Bausteine unten |
| `karten` | oben, `abschnitt` | – | `titel` | enthält `karte` |
| `karte` | `karten` | optional | `titel` (Pflicht), `symbol` | `text`, `rueckseite` |
| `grafik` | überall | Pflicht | `titel`, `untertitel` | `text` |
| `original` | überall | Absatz-ID(s) | – | leer (2.6) |
| `zitat` | überall | Absatz-ID(s) | – | `text` (2.6) |
| `ebenen`/`ebene` | oben, `abschnitt` | wie 3.3 | | |
| `querverweis` | überall | Station (`A3`) | `text` (Knopfbeschriftung) | `text` |
| `merksatz`, `hinweis` | überall | – | – | `text` |
| `tafel`, `raci` | oben, `abschnitt`, `ebene` | wie 3.3 (L-32, L-34) | | Whitepaper-Tabelle als Grafik bzw. RACI mit Mandat; auf der Lernseite ohne Spur und ohne gespielte Rolle |

Darstellung (P6.1): Ebenen erscheinen auf der Lernseite als vier aufklappbare Stufen (Ebene 1 offen, Ebene 4 als Nachweis); Tafeln, RACI, Merksätze und Hinweise stehen auch auf Seitenebene zwischen den Abschnitten.

Jeder Absatz des Whitepapers soll einer Seite zugeordnet sein (O-20): über `original`, `zitat`, `deckt` oder `abdeckung.yaml`.

### 4.4 `inhalte/einwaende.md`
Kopfdaten: keine Pflicht. Container `einwand <id>` mit Kopfdaten `stationen` (Liste), `kapitel` (Liste) und Feldern `### Einwand`, `### Antwort`; darin ein `zitat` oder `original` als Beleg (Pflicht – die Antwort kommt aus dem Whitepaper).

### 4.5 `inhalte/abdeckung.yaml`
```yaml
# Absatz-ID: wohin sie gehört
k2.4-p2:
  theorie: k02
  story: [A3, B3]
k4.2-p3:
  theorie: k04
  story: B3
```
`theorie` und `story` sind eine Kennung oder eine Liste. `theorie` darf auch eine **geplante** Kapitelseite `kNN` nennen, die es noch nicht als Datei gibt (ein Kapitel = eine Lernseite, O-20; L-16). Der Prüfer rechnet die Abdeckung aus dieser Datei **und** aus den Theorie-Seiten (`original`, `zitat`, `deckt`) zusammen. Seit P1.1 ist eine Theorie-Abdeckung unter 100 % ein **Fehler** (mit den ersten Absätzen ohne Seite), ebenso ein Absatz, der nicht (auch) auf der Seite seines eigenen Kapitels steht.

---

## 5 Was das Werkzeug prüft (`--pruefe`)

| Prüfung | Fehler, wenn … |
|---|---|
| Form | Container nicht geschlossen, unbekannte Art/Feld/Kopfdaten, Art am falschen Ort, Kennung fehlt |
| Schema | Pflichtfeld fehlt, Wert nicht erlaubt (Stufe, Zahl außerhalb des Bereichs, Farbe) |
| Verweise | Figur, Rolle, Station, Schritt, Folgeknoten, Partner, Frage-Schritt existiert nicht |
| Graph | Station vom Prolog nicht erreichbar · Sackgasse (keine Kante, kein Ende) · Welt B ohne Freischaltung erreichbar · spielbare Rolle ohne Szene an einer Station mit Entscheidung · Rückbezug fehlt für eine Option |
| Zitate | Absatz-ID unbekannt oder Text nicht wortgleich |
| Glossar | `[[Begriff]]` nicht im Glossar |
| Abdeckung | Theorie-Abdeckung < 100 % · Absatz nicht auf der Seite seines Kapitels · Seite/Station unbekannt |

Fehlt `whitepaper.json` noch, sind Zitat-, Glossar- und Abdeckungsprüfung **Warnungen** (sonst Fehler). Ohne `--pruefe` meldet das Werkzeug nur Formfehler, die das Kompilieren verhindern.

---

## 6 Vollständiges Beispiel

(Ein lauffähiges Gesamtbeispiel mit Prolog, Vergleichsstation, Welt B, Theorie-Seite und Einwand steht als `BEISPIEL` in `tests/inhalte.test.ts`; der ganze Entscheidungsgraph liegt seit P5.10 unter `inhalte/story/`; `entwurf/` nimmt nur noch künftige Entwürfe auf, siehe `entwurf/LIESMICH.md`.)

`inhalte/story/X1/station.md`
```markdown
---
id: X1
welt: A
monat: 5
titel: Kosten +8 %
uhr: Montag, 08:30 Uhr
lph: 5
whitepaper-bezug: [k2.4-p2]
status-start:
  entscheidungsfaehigkeit: 2
  kostenunsicherheit: hoch
  offene-risiken: 7
  ungeklaerte-entscheidungen: 3
  terminrisiko: mittel
weiter: X2
partner: Y1
---

::: schritt einstieg
---
titel: Montag, 08:30 Uhr. Monat 5 nach Ihrer Übernahme.
kurz: Einstieg
---
::: mail
---
von: brenner
betreff: Kostenprognose Mai – bitte kurzfristig ansehen
zeit: "08:12"
anhang: Prognose_Mai_v3_final_NEU.xlsx
---
„Die aktualisierte Kostenprognose liegt 8 % über der Projektbasis …“
:::

::: notiz
---
farbe: gelb
---
v3 oder v4??
:::
:::

::: schritt lage
---
art: lage
titel: Was Sie wissen, und was nicht
---
::: bekannt
- Zwei [[Datenstand|Datenstände]]: +8 % und +5,9 %.
:::

::: unbekannt
- Ursache {#ursache}
- Terminwirkung {#terminwirkung}
:::

::: zeitsprung info
---
knopf: Weitere Informationen anfordern
kosten: "Kostet Zeit: zwei Wochen"
dauer: Zwei Wochen später
status:
  terminrisiko: hoch
loest:
  ursache: jetzt bekannt
bleibt:
  terminwirkung: bleibt unbekannt
---
Terminrisiko steigt auf hoch.

### Neu bekannt
Ursache überwiegend Preissteigerung Holzbauelemente.
:::
:::

::: schritt entscheidung
---
art: entscheidung
titel: Was tun Sie?
---
:::

::: schritt konsequenz
---
art: konsequenz
titel: Was Ihre Wahl auslöst
---
:::

::: ebenen
::: ebene 1
---
titel: Kernaussage
---
Berichte erzeugen Information. Führung entsteht erst, wenn Information mit Mandat, Entscheidung und Datenstand verbunden wird.
:::
::: ebene 4
---
titel: Nachweis
---
::: zitat k2.4-p2
Berichterstattung erzeugt Information.
:::
:::
:::
```

`inhalte/story/X1/pl.md`
```markdown
---
station: X1
rolle: pl
frage: Was tun Sie?
---

::: option A
---
titel: Weiterarbeiten und Ursachenanalyse parallel
kurz: Weiterarbeiten
status:
  ungeklaerte-entscheidungen: "+1"
  kostenunsicherheit: sehr hoch
---
### Konsequenz
Die Arbeit läuft weiter …

### Was fehlt
Wer entscheidet über Änderungen am Projektumfang – und ab welcher Summe?

### Neues Risiko
Schleichende Änderung des Projektumfangs.

### Governance-Frage
[[Mandat]]: Welche Schwelle löst eine Entscheidung des Bauherrn aus?
:::

::: nachsatz
Die Geschichte merkt sich Ihre Wahl.
:::

::: regie
### Notiz
Die Wahl nicht bewerten.

### Leitfragen
- Wer entscheidet bei Ihnen, welche Prognose gilt?
:::
```

Daraus entsteht (gekürzt) in `src/generiert/inhalte.json`:
```json
{
  "stationen": {
    "X1": {
      "id": "X1", "art": "station", "welt": "A", "monat": 5, "lph": 5,
      "weiter": [{ "ziel": "X2", "wenn": null }],
      "statusStart": [{ "schluessel": "entscheidungsfaehigkeit", "art": "setze", "wert": 2, "hinweis": null }, "…"],
      "schritte": [{ "id": "einstieg", "art": "text", "titel": "Montag, 08:30 Uhr. …", "bloecke": [{ "art": "mail", "kopf": { "von": "brenner", "…": "…" }, "felder": { "text": "<p>„Die aktualisierte …“</p>" } }] }, "…"],
      "infos": [{ "id": "info", "wirkung": [{ "schluessel": "terminrisiko", "art": "setze", "wert": "hoch", "hinweis": null }] }],
      "szenen": { "pl": { "entscheidung": { "id": "X1/pl", "optionen": [{ "id": "A", "kurz": "Weiterarbeiten", "felder": { "konsequenz": "<p>…</p>" }, "wirkung": ["…"] }] } } }
    }
  },
  "regie": { "X1/pl": { "notiz": "<p>Die Wahl nicht bewerten.</p>", "leitfragen": ["Wer entscheidet bei Ihnen, welche Prognose gilt?"] } }
}
```

Regie-Material (`regie`) steht im JSON **getrennt** von den Stationen: die Leinwand-Zeichnung greift nur auf `stationen` zu und kann Notizen und Leitfragen gar nicht erreichen (docs/ARCHITEKTUR.md, „Regie und Leinwand“).

**Nicht geheim:** Die Trennung schützt vor dem *Anzeigen* auf der Leinwand, nicht vor dem *Lesen*. Regie und Leinwand sind dieselbe Einzeldatei (`#regie`, `#leinwand`); Notizen und Leitfragen stehen deshalb im Klartext in `dist/mvg.html` und in jeder weitergegebenen Kopie. In `regie`-Blöcke gehört nur, was ein Kunde lesen dürfte – nichts Vertrauliches, keine internen Einschätzungen von Kunden oder Personen. Eine spätere Einbettungsvariante (Website) soll das Regie-Material weglassen.

---

## 7 Ausgabe `src/generiert/inhalte.json` (Kurzreferenz, Typen: `src/inhalte/typen.ts`)

| Schlüssel | Inhalt |
|---|---|
| `start`, `stationsFolge` | Startstation (`prolog`) und Reihenfolge für die Story-Karte (Breitensuche entlang `weiter`) |
| `stationen.<id>` | Kopfdaten (camelCase), `schritte[]` (`id`, `art`, `titel`, `kurz`, `gruppe`, `uhr`, `kopf`, `felder`, `bloecke`), `infos[]` (Zeitsprünge mit `wirkung`), `ebenen[]`, `standpunkte[]`, `vertiefungen[]` (`interesse`, `titel`, `html`), `szenen.<rolle>` |
| `stationen.<id>.szenen.<rolle>` | `entscheidung` (`id`, `frage`, `optionen[]` mit `titel`, `kurz`, `symbol`, `felder`, `wirkung`; `nachsatz`), `fragen[]`, `rueckbezug` (`auf` = aufgelöste Entscheidungs-ID, `texte`, `ohne`) |
| Block (`bloecke[]`, `kinder[]`) | `art`, `kennungen`, `id`, `kopf` (umgewandelte Kopfdaten), `felder` (HTML), `liste` (bei `bekannt`/`unbekannt`/`vorlage`: `{id, stand, html}`), `kinder`. `zitat`: `kopf.quelle`, `kopf.vollstaendig`; `original`: `kopf.absaetze`, `kopf.quelle` |
| `rollen.<id>` | `titel`, `kurztitel`, `farbe`, `textfarbe`, `figur`, `whitepaper`, `felder`, `spielbar` (aus `folgt` im Prolog); `rollenFolge` = Anzeige-Reihenfolge |
| `interessen[]` | aus dem Prolog (`id`, `titel`, `html`) |
| `fall` | Kopfdaten, `einleitung`, `figuren.<id>` |
| `startseite` | `kicker`, `titel`, `titelQuelle`, `these` (Inline-HTML) aus `inhalte/start.md`, sonst null |
| `glossar.<id>` | alle Glossareinträge des Whitepapers (`begriff`, `definition`) |
| `theorie.<kNN>`, `einwaende[]`, `abdeckung` | Lernseiten, Einwand-Karten, Abdeckung (`gesamt`, `zugeordnet`, `anteil`, `ziele`) |
| `regie` | **nur Regie**: `<station>` bzw. `<station>/<rolle>` → `notiz` (HTML), `leitfragen` (Inline-HTML). `src/inhalte/index.ts` gibt es nur über `regieInhalte()`/`regieFuer()` heraus; `inhalte` enthält es nicht. |

Statuswirkungen stehen überall als Liste `{schluessel, art: 'setze' | 'aendere', wert, hinweis}`; Bedingungen als Datenform (`src/engine/typen.ts`, Typ `Bedingung`).

---

## 8 Mehrsprachigkeit (vorbereitet)
Alle sichtbaren Texte stehen in `inhalte/`; Kennungen, Schlüssel und Art-Namen sind sprachneutral. Eine spätere Übersetzung legt `inhalte/<sprache>/…` mit denselben Kennungen an; das Werkzeug erhält dafür einen Parameter. In P0 gibt es nur Deutsch.
