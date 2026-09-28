# Anleitungen

Die Anwendung ist **eine einzige Datei**. Sie läuft ohne Internet und ohne Installation; gebaut ist sie für Chrome, Edge, Safari und Firefox, Laptop, Beamer (16:9) und iPad quer (O-10). Automatisch getestet wird in Chromium; Safari, Firefox und iPad gehören zur Abnahme (`docs/ABNAHME.md`, D).

| Datei | Für wen | Inhalt |
|---|---|---|
| `dist/mvg.html` | Bauherr Mentoren (Termine, Präsentation) | alles, auch die Regie-Notizen und Leitfragen |
| `dist/mvg-kunde.html` | Kunden, Website, Versand | dasselbe **ohne** Regie-Notizen und Leitfragen (L-7). Die Regie bleibt bedienbar, zeigt aber keine Notizen. |

Den Vermerk „fachlich ungeprüft“ zeigen beide Dateien, bis der Owner die Fassung abnimmt (O-24).

## 1. Selbstlernen (ein Fenster)

1. Datei doppelklicken. Die Startseite zeigt zwei Wege:
   - **Erklärt – Kapitel für Kapitel**: die Theorie in den 13 Kapiteln des Whitepapers.
   - **Erlebt – als Geschichte**: die Story „Zwei Welten. Ein Schulcampus.“
2. **Story** (ca. 30 Minuten):
   - Rolle wählen, Interessen wählen (oder „Express“ für die Kurzfassung).
   - Welt A erleben, Wendepunkt, Rückspulen, Welt B, Wirklichkeit, eines von drei Enden, Epilog.
   - Tasten:
     - ← → blättern
     - A–D wählen
     - Esc schließt Linse und Hinweise
   - Die Adresszeile zeigt den Permalink der Station (`#story/A3`).
   - Der Stand bleibt im Browser gespeichert; beim nächsten Öffnen geht es dort weiter.
   - **Klänge** (Knopf im Kopf) sind standardmäßig aus.
3. **Theorie**:
   - Jede Lernseite hat eine Kernaussage, Abschnitte mit Tafeln und den Originaltext V1.2 wörtlich.
   - Am Originaltext:
     - Die **Absatz-ID** ist ein Link auf genau diesen Absatz (`#theorie/k4/k4.2-p3`).
     - **Zitieren** zeigt die Angabe „Bauherr Mentoren, Whitepaper V1.2, Kap. 4.2, Abs. 3“ samt Link und legt sie in die Zwischenablage. Geht das nicht (etwa beim Öffnen als lokale Datei), ist die Angabe markiert und lässt sich mit Strg+C bzw. ⌘+C kopieren.
   - **Kapitel drucken** und auf der Kapitelliste **Alle 13 Kapitel drucken** öffnen den Druckdialog. Dort „Als PDF speichern“ wählen.
   - Kapitel 13 enthält das Glossar mit Suche und den **Begriffs-Kompass**: Wer „Gate“ oder „Change-Board“ sucht, findet den Begriff des Whitepapers.
   - **Fassung und Impressum** (Fuß jeder Lernseite): Version, Änderungsstand, Quelle, Abgrenzung (5.5) und Leistungsgrenzen (7.6).
4. **Explore** wird mit dem Ende der Geschichte freigeschaltet: Szenario-Simulator, Vorher/Nachher-Welten, Governance-Fluss-Sandbox, Zeitmaschine, Grafik-Galerie.
5. **Dossier**: Im Epilog druckt „Dossier drucken“ Ihren Weg, Ihre Entscheidungen, das Resümee und die zwei Vertiefungskapitel.

## 2. Präsentation im Termin (Regie + Leinwand)

1. `dist/mvg.html#regie` öffnen, also die Datei öffnen und `#regie` an die Adresse hängen. Das ist die **Regie** auf dem Laptop.
2. **Leinwand öffnen** öffnet ein zweites Fenster. Dieses Fenster auf den Beamer ziehen und mit F11 in den Vollbildmodus schalten. Der Punkt „Leinwand verbunden“ wird grün.
   - Die Leinwand zeigt nur, was die Regie steuert.
   - Notizen, Leitfragen und das Protokoll erreichen sie nie (Bauart, getestet).
3. Steuern:
   - Die Knöpfe **Zurück/Weiter** oder die Pfeiltasten blättern.
   - Die Tasten **a–d** übernehmen die Kundenwahl an der Entscheidung.
   - Die **Kundenwahl und Eingriffe** (Rolle, Ebenen, Informationen, Optionen) stehen oben rechts.
   - **Fläche**: Start · Story · Theorie · Kapitel 1–13 · Neu.
   - **Springen zu** (erst nach der Rollenwahl): jede Station, Welt B nach der Freischaltung.
   - **Rolle** wechselt die Perspektive mitten in der Station.
4. **Regie-Notiz** (rechts):
   - Notiz und Leitfragen zur Station, Rollenszene oder Theorie-Seite.
   - Darunter die **Einwand-Karten** als Spickzettel mit der Antwort des Whitepapers.
5. **Beamer: groß und kontrastreich** vergrößert Schrift und Linien auf der Leinwand.
6. **Gesprächsprotokoll**:
   - Notizen während des Termins festhalten.
   - **Protokoll drucken** erzeugt ein Termin-Dossier: Protokoll, Weg, Entscheidungen, Kapitel zum Nachlesen.
7. **Kein zweiter Bildschirm?**
   - „Ohne Leinwand-Fenster: Vorschau füllt den Bildschirm“ zeigt die Vorschau groß.
   - Unten bleibt eine Leiste mit den Kundenwahlen, ohne Notizen.
   - Esc kehrt zur Regie zurück.
8. **Explore** steuert die Regie nicht (L-54). Wer es zeigen will, öffnet es im Hauptfenster (`#explore`).

## 3. Einbetten in eine Webseite (E12)

```html
<iframe src="mvg-kunde.html?einbettung-herkunft=https%3A%2F%2Fwww.example.de#start"
        title="Minimum Viable Governance" style="width:100%;height:720px;border:0"></iframe>
```

- Die Anwendung meldet dem Host `{ mvg: 'einbettung', art: 'bereit', version }` und nach jedem Wechsel `{ …, art: 'ort', hash, flaeche, titel }`.
- Der Host kann schicken:
  - `{ mvg: 'einbettung', art: 'gehe', ziel: '#theorie/k4' }`
  - `{ mvg: 'einbettung', art: 'frage' }`
- Regie und Leinwand gibt es im Rahmen nicht: Weder `gehe` noch eine Adresse mit `#regie` oder `#leinwand` öffnet sie, die Anwendung zeigt dann die Startseite.
- Mit `einbettung-herkunft` wird nur diese Herkunft gehört und beantwortet.

## 4. Pflege (für den Bau)

- Inhalte stehen als Markdown unter `inhalte/` (Format: `docs/INHALTSFORMAT.md`).
- `npm run pruefe` prüft alles, `npm run bau` baut beide Dateien.
- Neue Whitepaper-Fassung (L-57):
  1. `npm run whitepaper:reimport -- --docx <neue.docx> --bericht tmp/reimport.md` meldet jede betroffene Stelle.
  2. `node werkzeuge/whitepaper-import.mjs --docx <neue.docx> --ziel quellen/whitepaper/v1.3 --fassung V1.3` legt die neue Quelle an.
  3. Die maßgebliche Fassung umstellen: den Pfad `quellen/whitepaper/v1.2/whitepaper.json` in `werkzeuge/inhalte.mjs` (STANDARD_WHITEPAPER) und `werkzeuge/whitepaper-lib.mjs` (STANDARD_PFAD) auf v1.3 setzen und den Änderungsstand in `src/ui/impressum.ts` nachtragen.
  4. `npm run pruefe`: Der Inhaltsprüfer meldet jetzt jedes Zitat, das nicht mehr wortgleich ist. Die betroffenen Stellen aus Schritt 1 anpassen.
- Vorschläge für die Grafiken der V1.3: `docs/KORREKTURLISTE-V1.3.md`.
