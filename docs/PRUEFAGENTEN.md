# Prüf-Agenten (O-24)

Prüf-Agenten sind unabhängige Unteragenten (Agent-Werkzeug), die ein Ergebnis **gegen die Quellen** prüfen, ohne es selbst geschrieben zu haben. Jeder bekommt: den Pfad der geprüften Dateien, die Rolle unten, und die Pflicht, **zu widerlegen**, nicht zu bestätigen. Im Zweifel ist es ein Befund.

## Ablauf je Posten
1. Nach einem Inhaltsposten: mindestens **Fachtreue** und **Begriffe** (parallel starten).
2. Am Phasenende („Prüf-Agenten Pn“): alle Rollen, die zur Phase passen, dazu **Vollständigkeit**.
3. Befunde sammeln → jeden Befund selbst nachprüfen (ist er echt?) → korrigieren → **erneut prüfen lassen**, bis eine Runde nichts Neues findet.
4. In `UEBERGABE.md` eine Zeile: „Prüfung Pn: x Befunde, y behoben, z verworfen (Grund)“.

## Rückgabeformat (für jede Rolle)
```
BEFUND <Nr> · <schwer|mittel|leicht> · <Datei>:<Zeile oder Knoten-ID> · <was falsch ist> · <Beleg: Absatz-ID im Whitepaper oder Regel> · <Vorschlag>
```
oder genau `KEINE BEFUNDE`.

## Rollen

### Fachtreue
Prüft jeden fachlichen Satz gegen `quellen/whitepaper/v1.2/whitepaper.json`. Befund, wenn: eine Aussage im Whitepaper nicht vorkommt oder ihm widerspricht (neue Fachaussage, O-17); Zuständigkeiten falsch sind (z. B. Freigabe durch Lenkungskreis statt Bauherr; Mandatsleiter-Schwellen falsch); Registerlogik verdreht ist (Frühwarnung vs. Risiko vs. Problem vs. Änderung); ein Zitat nicht wortgleich ist oder die falsche Absatz-ID trägt; LPH-Zuordnungen (Business Case LPH 2, FID LPH 3, Vergabe/lange Lieferzeit LPH 7, Übergabe LPH 9) nicht stimmen; die 30/60/90-Logik als allgemeiner Einführungsrhythmus dargestellt wird.

### Begriffe
Prüft gegen `docs/BEGRIFFE.md`: verbotene Begriffe (auch in Bildbeschriftungen, aria-Labels, Tooltips), falsche Statusnamen, falsche Schreibweisen, englische Fachwörter, „Minimal“ statt „Minimum“.

### Dramaturgie und Verständlichkeit
Prüft aus Sicht eines aufmerksamen Bauherren-Entscheiders ohne Vorwissen: Ist die Szene ohne Theorie verständlich? Trägt die Spannung (Situation → Warnsignal → Entscheidung → Konsequenz …)? Sind Konsequenzen plausibel und nicht belehrend („nicht richtig/falsch, sondern Folgen“)? Sind Rückbezüge auf frühere Entscheidungen korrekt verdrahtet? Stimmen Zeitachse, Zahlen und Figuren mit `inhalte/fall.md` überein? Ist der Ton sachkundig, leicht, ohne Vertrieb (O-1)? Textlänge: Story knapp, Tiefe in Ebenen.

### Rolle (je gespielter Rolle)
Spielt die Story als eine der 6 Rollen durch (Inhaltsdateien und Graph lesen, im Browser wenn möglich): Hat die Rolle eigene, echte Entscheidungen, die zu ihrem Mandat passen? Wird sichtbar, was sie delegieren darf und was nicht? Fehlen Szenen, Sackgassen, tote Verweise?

### Stil und Barrierefreiheit
Prüft gegen `docs/STIL.md`: Farben nur aus den Tokens, Statusfarben nur für Status und nie allein, Kontrast ≥ 4,5:1, Fokus sichtbar, Tastaturbedienung, `prefers-reduced-motion`, kein Überlauf bei 1280×720 / 1024×768 / 400 px, ruhiger Einstieg (O-21, L-4).

### Architektur und Code
Prüft gegen `docs/ARCHITEKTUR.md`: Engine rein und deterministisch, keine Regie-Daten in der Leinwand, CSP ohne Lockerung, keine Laufzeit-Bibliotheken, Tests prüfen Verhalten (und würden bei einer Verfälschung rot).

### Vollständigkeit
Vergleicht Ergebnis mit `docs/BAUPLAN.md`, `PLAN.md` (Abnahmen), den 20 Owner-Punkten (Bauplan Abschnitt 4), E1–E14 und der Abdeckungskarte. Nennt, was fehlt oder nur behauptet ist.
