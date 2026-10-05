# Prüf-Agenten (O-24)

Prüf-Agenten sind unabhängige Unteragenten (Agent-Werkzeug), die ein Ergebnis **gegen die Quellen** prüfen, ohne es selbst geschrieben zu haben. Jeder bekommt: den Pfad der geprüften Dateien, die Rolle unten, und die Pflicht, **zu widerlegen**, nicht zu bestätigen. Im Zweifel ist es ein Befund.

Seit P17 (O-51 bis O-58) gelten die Rollen für die neue Gestalt: Story als Spiel (14 Stationen in drei Akten, drei Antworten, drei Balken, Mini-Aufgaben, Vergleich in Station 12, Kurzfassung, Bilanz), Themen als Buch (vier Teile, Fortschritt, Aufklapper, Wendekarten), Akzentpalette mit Campus, Figuren und Themen-Bildern, Regie mit Eingriffen. 

**Seit P19 (O-59 bis O-62):** Die Story hat 14 Stationen in drei Akten (Pausen mit Zwischenbilanz, Akt-Leiste), eine Lesezeit von etwa 40 Minuten (ganzer Weg) und etwa 10 Minuten (Kurzfassung), Echo-Zeilen, das Entscheidungsbuch, den Verlauf und elf Mini-Aufgaben in sieben Arten (Zuordnen, Reihenfolge, Matrix, Mappe, Pinnwand, Bericht, Rückfragen); Gerüst und Wortlaut stehen in `docs/drehbuch-v2/`. „Kapitel“ meint in den Rollen unten die Stationen. Zielwerte, an denen eine Prüfrunde misst, stehen in `PLAN.md` und `ENTSCHEIDE.md` (L-270 bis L-383, laufend), nicht hier.

Die Prüfrunden laufen über `docs/pruefrunde.workflow.js` bzw. `werkzeuge/pruefrunde-auftraege.mjs` (ein Auftrag je Prüffeld).

## Ablauf je Posten
1. Nach einem Inhaltsposten: mindestens **Fachtreue** und **Begriffe** (parallel starten).
2. Am Phasenende („Prüf-Agenten Pn“): alle Rollen, die zur Phase passen, dazu **Vollständigkeit** und **Spielgefühl und Verständlichkeit**.
3. Befunde sammeln → jeden Befund selbst nachprüfen (ist er echt?) → korrigieren → **erneut prüfen lassen**, bis eine Runde nichts Neues findet.
4. In `UEBERGABE.md` eine Zeile: „Prüfung Pn: x Befunde, y behoben, z verworfen (Grund)“.

## Rückgabeformat (für jede Rolle)
```
BEFUND <Nr> · <schwer|mittel|leicht> · <Datei>:<Zeile oder Knoten-ID> · <was falsch ist> · <Beleg: Absatz-ID, Stelle in V2.4 oder Regel> · <Vorschlag>
```
oder genau `KEINE BEFUNDE`. In den Prüfrunden gilt dieselbe Gliederung als JSON (`befunde`, `umfang`) und die verbindliche Schwere-Skala aus `docs/pruefrunde.workflow.js` (`GEMEINSAM`).

## Rollen

### Fachtreue
Prüft jeden fachlichen Satz gegen den Standard V2.4 (`quellen/v2.4/`) und V1.2 (`quellen/whitepaper/v1.2/whitepaper.json`); bei Widerspruch gilt V2.4 (O-36). Befund, wenn: eine Aussage in keiner der beiden Quellen vorkommt oder ihr widerspricht (neue Fachaussage); Zuständigkeiten falsch sind (die Projektsteuerung pflegt alle Vorgänge und bereitet vor, der Bauherr entscheidet; Lenkungskreis berät; Freigabe durch die befugte Stelle; Mandatsleiter-Schwellen 100 TEUR / 5 Mio. €); Vorgangsarten verdreht sind (Aufgabe, Maßnahme, Frühwarnung, Risiko, Problem, Änderung, dazu die Entscheidungsvorbereitung); Matrix, Takt, Vorlage (mindestens zwei zulässige Optionen, gewichteter Vergleich) oder LPH-Zuordnungen nicht stimmen; ein Zitat nicht wortgleich ist.
**In der Story (O-52):** Nur wer was entscheidet, wer was vorbereitet und pflegt und wie die Abläufe laufen, muss V1.2/V2.4 folgen – auch in Antworten, Folge-Szenen, „So macht man es gut“, „Das steckt dahinter“, Mini-Aufgaben (jede Lösung) und der Wertung gut/vertretbar/Falle (die „gute“ Antwort darf nichts tun, was der Standard einer anderen Stelle zuweist; die „Falle“ muss eine echte typische Falle sein). Handlung, Personen, Termine und Beträge sind frei erfunden und dürfen zugespitzt sein; sie sind kein Befund, solange sie in sich stimmig sind und keine Regel verfälschen. Das projektbezogene Mandat der Story (L-225) gilt als Festlegung des Bauherrn.
**In den Themen (O-55, L-230):** Kürzungen dürfen keine Regel verfälschen oder Bedingungen weglassen; Aufklapper, Wendekarten (Vorder- und Rückseite) und Kernaussagen zählen wie Fließtext; die sieben Verständnisfragen müssen eindeutig richtig auflösen.

### Begriffe
Prüft gegen `docs/BEGRIFFE.md`: verbotene Begriffe (auch in Bildbeschriftungen, aria-Labels, Tooltips, SVG-Texten von Campus, Figuren und Themen-Bildern), sichtbar verbotene Wörter (Whitepaper, Kapitel – die Seite nummeriert ihre eigenen Kapitel, O-54, schreibt aber nicht „Kapitel“ –, Datei, App, Programm, HTML, Kundenfassung), falsche Statusnamen und Kürzel, falsche Schreibweisen, englische Fachwörter, „Minimal“ statt „Minimum“. Dazu O-56: nichts Sichtbares, das nach Arbeitsstand klingt (Prüfvermerke, Quellenhinweise, Begründungen, Bedienungs- und Regie-Hinweise, „Abweichungen“) – Muster in `werkzeuge/sichtbar.mjs` (`SICHTBAR_ARBEITSSTAND`), aber auch, was die Probe nicht kennt.

### Spielgefühl und Verständlichkeit (O-51, O-53, O-55, O-57)
Spielt die Seite als neugierige Laiin ohne Vorwissen – Story (langer Weg, Kurzfassung, mindestens ein Weg mit Fallen-Antworten), Themen, Startseite – und prüft das Erlebnis, nicht die Fachtreue: Ist jeder Schritt total einfach verständlich, in natürlicher, warmer Sprache mit Anrede „Sie“? Kommen Zahlen und Abkürzungen nur vor, wo es ohne nicht geht (dann rund)? Gibt es Textwüsten (lange Absätze ohne Gliederung, mehr Text als auf einen Bildschirm passt)? Steht auf jedem Schritt eine kleinere oder größere Grafik, passt sie zur Szene (Campus-Stufe, Jahreszeit, Figur, Gegenstand)? Fühlt es sich wie ein Spiel an: sind die drei Antworten echte Versuchungen (die Falle nicht offensichtlich, die gute nicht immer die längste oder an derselben Stelle), sind Folge-Szenen und Balkenbewegung spürbar und glaubhaft, sind Mini-Aufgaben lösbar und erklärt, ist die Bilanz verdient? Sprechen die Figuren in ihrer eigenen Sprechweise (Drehbuch)? Lesen sich die gekürzten Themen leicht, führen Kernaussage, Karten und Aufklapper? Befunde mit Ort und konkretem Gegenvorschlag (Satz, Kürzung, Bild).

### Dramaturgie und Rechnung (Story)
Prüft die Story gegen `docs/DREHBUCH.md` und `inhalte/fall.md`: Stimmen Folgen, Balkenwirkung (−2…+2, Begrenzung 0–10), Balkenworte und Bilanz-Typ auf jedem Weg mit der Engine (`src/geschichte/engine.ts`)? Stimmen Vergleichssummen, Gewichtsstufen 5/3/1, Kipppunkte und Empfehlung in Station 12? Brückenzeilen der Kurzfassung (gebündelt je Karte, mit Akten), übersprungene Stationen wie die gute Antwort, Echo-Zeilen (ändern Balken und Bilanz nicht), Verlauf und Entscheidungsbuch (zeigt nie die Antwort, nur die Festlegung)? Widersprechen sich Stationen untereinander (Daten, Personen, Campus-Stufe, Akte)? Lesezeit ganzer Weg ≈ 40 Min. (obere Schranke ≈ 46, Grenze 9.200 Wörter, L-403), Kurzfassung ≈ 10 Min. Ton sachkundig, ohne Vertrieb (O-1).

### Bauherr (Story als Leser)
Liest die Story als Bauherren-PL: Wird sichtbar, was die Projektsteuerung tut und was beim Bauherrn bleibt? Sind die Entscheidungen echt? Fehlen Übergänge, Sackgassen, tote Verweise auf Themen („Das steckt dahinter“ führt zum passenden Thema)?

### Stil und Barrierefreiheit
Prüft gegen `docs/STIL.md`: Farben nur aus den Tokens (Markenfarben plus Akzentpalette mit festen Rollen, L-226; Figurenfarben L-229), Statusfarben nur für Status und nie allein, Kontrast ≥ 4,5:1 (auch Text auf Akzentflächen und Teilfarben), Fokus sichtbar, Tastaturbedienung (Antworten, Mini-Aufgaben aller sieben Arten, Gewichte, Wendekarten mit `aria-pressed`, Aufklapper, Entscheidungsbuch: Symbol als Umschalter, Escape schließt, Fokus auf den Titel und zurück auf das Symbol, Pfeiltasten verlassen es nicht; Akt-Leiste und Stationsliste; Pause mit Verlauf als Bild samt Textfassung; Rückmeldung der Mini-Aufgaben in der Live-Region; hohle Punkte des Verlaufs wirklich hohl, Endbeschriftungen ohne Überdeckung; Haftzettel und Statusleiste bei 320 und 400 px), Screenreader (Balken ohne Zahl verständlich, Schmuckbilder `aria-hidden`), `prefers-reduced-motion` (Kartendrehung, Balken, Rollen), kein Überlauf bei 1280×720 / 1024×768 / 400 px / 320 px und Beamer, ruhiger Einstieg (O-21, L-4).

### Architektur und Code
Prüft gegen `docs/ARCHITEKTUR.md`: Story-Engine (`src/geschichte/`) und Regie-Eingriffe (`src/regie/eingriffe.ts`) rein und deterministisch, keine Regie-Daten in der Leinwand (Wertung gut/vertretbar/Falle, Notizen, Leitfragen, Lösungen nur in der Regie, L-235), Grafiken (`src/grafik/`) deterministisch ohne `id`/`url()`, Speicher nur `gk.story`, `gk.theorie`, `gk.regie` (Fortschritt speichert nie die Antwort; `gk.story` Fassung 2, unbekannte Kennungen verwerfen den Stand als Ganzes; Buch und Verlauf werden nicht gespeichert, „neu“ nur im Speicher der Seite), Mini-Registry (`MINI_ARTEN`, `MINI_BAUSTEINE` je `Record<MiniArt, …>`, keine Schleife kennt eine Einzelart), Leinwand ohne Buchinhalt (nur der Schalter), erzeugte Dateien atomar geschrieben, Szenarien bauen nie beim Import, Browser-Szenarien und Ketten-Tests mit `timeout` und `maxBuffer`, nicht erreichbare Wege dokumentiert (Nebenfiguren und Stimmen nutzt die echte Story nicht, L-356), CSP ohne Lockerung, keine Laufzeit-Bibliotheken, Tests prüfen Verhalten (und würden bei einer Verfälschung rot).

### Vollständigkeit
Vergleicht Ergebnis mit `PLAN.md` (Abnahmen der laufenden Phase, derzeit P19.1 bis P19.9), den Owner-Entscheiden O-36 bis O-62 (dazu O-59 bis O-62 im Einzelnen: vier Werkzeuge, Startkopf, Wegkarten, 14 Stationen), den L-Entscheiden L-225 bis L-383 (laufend fortschreiben) und `docs/ABNAHME.md`. Nennt, was fehlt oder nur behauptet ist.
