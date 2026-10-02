# Prüf-Agenten (O-24)

Prüf-Agenten sind unabhängige Unteragenten (Agent-Werkzeug), die ein Ergebnis **gegen die Quellen** prüfen, ohne es selbst geschrieben zu haben. Jeder bekommt: den Pfad der geprüften Dateien, die Rolle unten, und die Pflicht, **zu widerlegen**, nicht zu bestätigen. Im Zweifel ist es ein Befund.

## Ablauf je Posten
1. Nach einem Inhaltsposten: mindestens **Fachtreue** und **Begriffe** (parallel starten).
2. Am Phasenende („Prüf-Agenten Pn“): alle Rollen, die zur Phase passen, dazu **Vollständigkeit**.
3. Befunde sammeln → jeden Befund selbst nachprüfen (ist er echt?) → korrigieren → **erneut prüfen lassen**, bis eine Runde nichts Neues findet.
4. In `UEBERGABE.md` eine Zeile: „Prüfung Pn: x Befunde, y behoben, z verworfen (Grund)“.

## Rückgabeformat (für jede Rolle)
```
BEFUND <Nr> · <schwer|mittel|leicht> · <Datei>:<Zeile oder Knoten-ID> · <was falsch ist> · <Beleg: Absatz-ID, Stelle in V2.4 oder Regel> · <Vorschlag>
```
oder genau `KEINE BEFUNDE`.

## Rollen

### Fachtreue
Prüft jeden fachlichen Satz gegen den Standard V2.4 (`quellen/v2.4/`) und V1.2 (`quellen/whitepaper/v1.2/whitepaper.json`); bei Widerspruch gilt V2.4 (O-36). Befund, wenn: eine Aussage in keiner der beiden Quellen vorkommt oder ihr widerspricht (neue Fachaussage); Zuständigkeiten falsch sind (die Projektsteuerung pflegt alle Vorgänge und bereitet vor, der Bauherr entscheidet; Lenkungskreis berät; Freigabe durch die befugte Stelle; Mandatsleiter-Schwellen 100 TEUR / 5 Mio. €); Vorgangsarten verdreht sind (Aufgabe, Maßnahme, Frühwarnung, Risiko, Problem, Änderung, dazu die Entscheidungsvorbereitung); Matrix, Takt, Vorlage (mindestens zwei zulässige Optionen, gewichteter Vergleich) oder LPH-Zuordnungen nicht stimmen; ein Zitat nicht wortgleich ist.

### Begriffe
Prüft gegen `docs/BEGRIFFE.md`: verbotene Begriffe (auch in Bildbeschriftungen, aria-Labels, Tooltips), sichtbar verbotene Wörter (Whitepaper, Kapitel, Datei, App, Programm, HTML, Kundenfassung), falsche Statusnamen und Kürzel, falsche Schreibweisen, englische Fachwörter, „Minimal“ statt „Minimum“.

### Dramaturgie und Verständlichkeit
Prüft aus Sicht einer aufmerksamen Bauherren-PL ohne Vorwissen: Ist jede Station ohne Theorie verständlich? Trägt der Fluss (Lage → Vorlage → Entscheidung → Folge)? Sind Folgen plausibel und nicht belehrend? Stimmen Status und Berichtstexte auf jedem Weg (Bedingungen `wenn`) und mit `inhalte/fall.md` (Zeitachse, Zahlen, Figuren)? Ist „So läuft es oft“ fair, der Ton sachkundig, leicht, ohne Vertrieb (O-1)? Lesezeit Hauptweg ≈ 25 Min., Kurzfassung ≈ 10 Min.

### Bauherr (Story als Leser)
Liest die Story als Bauherren-PL auf dem empfohlenen Weg, in der Kurzfassung und mit abweichenden Wahlen: Sind die Entscheidungen echt (mindestens zwei vertretbare Optionen, Gewichte verschiebbar, Empfehlung nachvollziehbar)? Wird sichtbar, was die Projektsteuerung tut und was beim Bauherrn bleibt? Fehlen Übergänge, Sackgassen, tote Verweise auf Themen?

### Stil und Barrierefreiheit
Prüft gegen `docs/STIL.md`: Farben nur aus den Tokens, Statusfarben nur für Status und nie allein, Kontrast ≥ 4,5:1, Fokus sichtbar, Tastaturbedienung, `prefers-reduced-motion`, kein Überlauf bei 1280×720 / 1024×768 / 400 px, ruhiger Einstieg (O-21, L-4).

### Architektur und Code
Prüft gegen `docs/ARCHITEKTUR.md`: Story-Engine (`src/geschichte/`) rein und deterministisch, keine Regie-Daten in der Leinwand, CSP ohne Lockerung, keine Laufzeit-Bibliotheken, Tests prüfen Verhalten (und würden bei einer Verfälschung rot).

### Vollständigkeit
Vergleicht Ergebnis mit `PLAN.md` (Abnahmen, Phase P16), den Owner-Entscheiden O-36 bis O-50 und der Abdeckungskarte. Nennt, was fehlt oder nur behauptet ist.
