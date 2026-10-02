# Anleitungen

Der Governance Kompass ist eine **Internetseite** (O-42). Gebaut wird sie als Ordner `dist/` (Hauptseite, Impressum, Datenschutz, robots, sitemap, Vorschaubild, `.htaccess`); nichts wird von anderen Servern nachgeladen. Zum Ansehen ohne Server genügt es, `dist/index.html` im Browser zu öffnen. Veröffentlicht wird nach `docs/LAUNCH.md` (IONOS, www.GovernanceKompass.de). Gebaut ist die Seite für Chrome, Edge, Safari und Firefox, für Laptop, Beamer (16:9), iPad quer und Smartphone (O-10).

## 1. Lesen

Die Startseite bietet drei Wege und darunter „Wer steht dahinter“ mit einem leisen Link zu bauherr-mentoren.com.

1. **Story** (`#story`): eine Geschichte aus Sicht der Bauherren-PL am fiktiven Schulcampus Lindenhall-Süd – acht Stationen von Januar 2026 bis August 2028, etwa 25 Minuten, als **Kurzfassung** etwa 10 Minuten.
   - Je Station: Lage und Monatsbericht der Projektsteuerung, die Vorlage mit mindestens zwei Optionen und gewichtetem Vergleich, die Entscheidung und ihre Folgen. Die Statusanzeige zeigt Kosten, Terminpuffer und offene Entscheidungen.
   - In Station 1 legen Sie die Gewichte fest; sie gelten für alle folgenden Vorlagen. Die **Gegenprobe** probiert andere Gewichte aus, ohne die Entscheidung zu ändern; „Wann sich die Rangfolge dreht“ zeigt die Kipppunkte.
   - Aufklappbar: „So läuft es oft“, „Typischer Einwand“ und die Vorgänge der Station.
   - Blättern mit **Weiter/Zurück** oder den Pfeiltasten ← →; die Fortschrittslinie springt zu jedem Schritt.
   - Der Stand bleibt im Browser gespeichert; **Fortschritt löschen** am Fuß entfernt ihn.
2. **Theorie** (`#theorie`): 16 Themen, jedes mit Kernaussage, Abschnitten, Grafiken, kleinen Übungen und einem Wissenscheck; am Ende die Stationen der Story, die zum Thema passen. **Thema drucken** öffnet den Druckdialog („Als PDF speichern“). Das Thema **Glossar** hat eine Suche und den Begriffs-Kompass.
3. **Explore** (`#explore`): fünf Werkzeuge – gewichteter Vergleich (MCDA), Risikomatrix 5 × 5, Vorgangsarten und Wege, Takt und Monatsbericht, Glossar.

## 2. Präsentieren im Termin (Regie und Leinwand)

1. **Präsentieren** im Fuß der Seite öffnen (`#regie`). Das ist die **Regie** auf dem Laptop.
2. **Leinwand öffnen** öffnet ein zweites Fenster. Dieses Fenster auf den Beamer ziehen und mit F11 in den Vollbildmodus schalten. Der Punkt „Leinwand verbunden“ wird grün. Die Leinwand zeigt nur, was die Regie steuert; Notizen, Leitfragen und das Protokoll erreichen sie nie.
3. Steuern:
   - **Fläche**: Start, Story, Theorie oder Explore.
   - **Zurück/Weiter** oder ← →: in der Story Schritt für Schritt.
   - ↑ ↓: rollt die Leinwand, wenn der Inhalt länger ist als der Bildschirm.
   - **Springen zu** einer Station, **Kurzfassung** ein/aus, **Von vorn beginnen**.
   - An einer Vorlage übernehmen die Tasten **a, b, c** (oder die Knöpfe unter „Kundenwahl und Eingriffe“) die Wahl des Kunden; die Gewichte und der gewichtete Vergleich sind auf der Leinwand sichtbar.
   - **Theorie** und **Explore**: ein Thema oder Werkzeug wählen und auf der Leinwand zeigen.
4. **Regie-Notiz**: Notiz und Leitfragen zur Station oder zum Thema, darunter der typische Einwand mit Antwort.
5. **Beamer: groß und kontrastreich** vergrößert Schrift und Linien auf der Leinwand.
6. **Gesprächsprotokoll**: Notizen während des Termins festhalten; **Protokoll drucken** erzeugt einen Bogen mit Protokoll und Entscheidungen; **Protokoll löschen** entfernt Notizen und gespeicherten Stand der Präsentation aus dem Browser.

## 3. Veröffentlichen

Siehe `docs/LAUNCH.md`: Inhalt von `dist/` per SFTP oder Webspace-Explorer in den Webspace laden, Domain verbinden, HTTPS prüfen. Vorher Impressum und Datenschutz lesen und die Abnahme nach `docs/ABNAHME.md` machen.

## 4. Pflege (für den Bau)

- Inhalte stehen unter `inhalte/` (Format: `docs/INHALTSFORMAT.md`): Themen als Markdown, Story und Explore als YAML, Impressum und Datenschutz unter `inhalte/rechtliches/`.
- `npm run pruefe` prüft alles (Inhalte, Typen, Tests, Begriffe, Bau, Browser), `npm run bau` baut den Ordner `dist/`.
- Fachliche Quellen: der Standard V2.4 (`quellen/v2.4/`) und V1.2 (`quellen/whitepaper/v1.2/whitepaper.json`); bei Widerspruch gilt V2.4 (O-36). Auf der Seite steht kein Bezug auf die Quellen (O-38); die Belege bleiben intern in den Inhaltsdateien.
- Neue Fassung von V1.2: `npm run whitepaper:reimport -- --docx <neue.docx> --bericht tmp/reimport.md` meldet jede betroffene Stelle; danach mit `npm run whitepaper:import` die neue Quelle anlegen und den Pfad `STANDARD_WHITEPAPER` in `werkzeuge/inhalte.mjs` umstellen. `npm run pruefe` meldet dann jedes Zitat, das nicht mehr wortgleich ist.
- Vorschläge für die Grafiken einer neuen Fassung: `docs/KORREKTURLISTE-V1.3.md`.
