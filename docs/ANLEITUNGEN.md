# Anleitungen

Die Anwendung ist **eine einzige Datei**. Sie läuft ohne Internet und ohne Installation; gebaut ist sie für Chrome, Edge, Safari und Firefox, Laptop, Beamer (16:9) und iPad quer (O-10). Automatisch getestet wird in Chromium; Safari, Firefox und iPad gehören zur Abnahme (`docs/ABNAHME.md`, D).

| Datei | Für wen | Inhalt |
|---|---|---|
| `dist/mvg.html` | Bauherr Mentoren (Termine, Präsentation) | alles, auch die Regie-Notizen und Leitfragen |
| `dist/mvg-kunde.html` | Kunden, Website, Versand | dasselbe **ohne** Regie-Notizen und Leitfragen (L-7). Die Regie bleibt bedienbar, zeigt aber keine Notizen. |

Den Vermerk „fachlich ungeprüft“ zeigen beide Dateien, bis der Owner die Fassung abnimmt (O-24).

## 1. Selbstlernen (ein Fenster)

1. Datei doppelklicken. Die Startseite zeigt zwei Wege:
   - **Erklärt – Kapitel für Kapitel**: die Theorie in 13 Kapiteln.
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
   - **Abbildungen** aus dem Originaltext stehen beim passenden Abschnitt und im Originaltext an ihrer Stelle; „Vergrößern“ (oder ein Klick aufs Bild) zeigt sie über die ganze Breite, Esc schließt. Veraltete Beschriftungen sind im Bild durch die Begriffe des Texts ersetzt; wo die Abbildung sonst vom Text abweicht, sagt es die Bildunterschrift – es gilt der Text. Jede Abbildung hat einen eigenen Link (`#theorie/k4/abb-6`), das Abbildungsverzeichnis steht in Explore (Grafik-Galerie).
   - Am Originaltext:
     - Die **Absatz-ID** ist ein Link auf genau diesen Absatz (`#theorie/k4/k4.2-p3`).
     - **Zitieren** zeigt die Angabe „Bauherr Mentoren, MVG V1.2, Kap. 4.2, Abs. 3“ samt Link und legt sie in die Zwischenablage. Geht das nicht (etwa beim Öffnen als lokale Datei), ist die Angabe markiert und lässt sich mit Strg+C bzw. ⌘+C kopieren.
   - **Kapitel drucken** und auf der Kapitelliste **Alle 13 Kapitel drucken** öffnen den Druckdialog. Dort „Als PDF speichern“ wählen.
   - Kapitel 13 enthält das Glossar mit Suche und den **Begriffs-Kompass**: Wer „Gate“ oder „Change-Board“ sucht, findet den MVG-Begriff.
   - **Fassung und Impressum** (Fuß jeder Lernseite): Version, Änderungsstand, Quelle, Abgrenzung (5.5) und Leistungsgrenzen (7.6).
4. **Explore** wird mit dem Ende der Geschichte freigeschaltet: Szenario-Simulator, Vorher/Nachher-Welten, Governance-Fluss-Sandbox, Zeitmaschine, Grafik-Galerie.
5. **Dossier**: Im Epilog druckt „Dossier drucken“ Ihren Weg, Ihre Entscheidungen, das Resümee und die zwei Vertiefungskapitel.
6. **Hilfe** (leiser Link im Fuß der Startseite und oben in Theorie und Explore, `#hilfe`): die Hilfe des MVG Companion in derselben Aufteilung wie in der Anwendung – Vorgehensmodell, Hilfe-Hub, Handbuch, Standards, Registerdokument-Katalog, Rollen-Anleitungen (13 Rollen), Kollaboration, FAQ & Glossar, Kundenanpassung, Datenmanagement, IT-/Datenschutz-Dossier. Die Übersicht hat eine Volltextsuche; jede Seite hat einen eigenen Link (`#hilfe/standards`).

## 2. Präsentation im Termin (Regie + Leinwand)

1. `dist/mvg.html#regie` öffnen, also die Datei öffnen und `#regie` an die Adresse hängen. Das ist die **Regie** auf dem Laptop.
2. **Leinwand öffnen** öffnet ein zweites Fenster. Dieses Fenster auf den Beamer ziehen und mit F11 in den Vollbildmodus schalten. Der Punkt „Leinwand verbunden“ wird grün.
   - Die Leinwand zeigt nur, was die Regie steuert.
   - Notizen, Leitfragen und das Protokoll erreichen sie nie (Bauart, getestet).
3. Steuern:
   - Die Knöpfe **Zurück/Weiter** oder die Pfeiltasten ← → blättern: in der Story Schritt für Schritt, im Bereich Theorie Kapitel für Kapitel (die Story bleibt dabei, wo sie war).
   - **Rollen ↑/↓** oder die Pfeiltasten ↑ ↓ rollen auf der Leinwand die Tafel der Story bzw. die Lernseite, wenn sie länger ist als der Bildschirm; die Vorschau rollt mit. Am Beamer-Fenster selbst rollen auch Mausrad, Bild↑/↓ und Leertaste.
   - Die **Abbildungen** der Lernseiten erscheinen auf der Leinwand mit aufgeklappten Abweichungen, ohne „Vergrößern“. Die Abbildungen 9 (Governance-Fluss), 11 (Reifegradanalyse) und 12 (Implementierung) stehen nur im zugeklappten Originaltext und sind auf der Leinwand nicht zu sehen – im Termin am Laptop über Explore › Grafik-Galerie zeigen.
   - Die Tasten **a–d** übernehmen die Kundenwahl an der Entscheidung.
   - Die **Kundenwahl und Eingriffe** (Rolle, Ebenen, Informationen, Optionen) stehen oben rechts.
   - **Fläche**: Start · Story · Theorie · Kapitel 1–13 · Neu.
   - **Springen zu** (erst nach der Rollenwahl): jede Station, Welt B nach der Freischaltung.
   - **Rolle** wechselt die Perspektive mitten in der Station.
4. **Regie-Notiz** (rechts):
   - Notiz und Leitfragen zur Station, Rollenszene oder Theorie-Seite.
   - Darunter die **Einwand-Karten** als Spickzettel mit der Antwort von MVG.
5. **Beamer: groß und kontrastreich** vergrößert Schrift und Linien auf der Leinwand.
6. **Gesprächsprotokoll**:
   - Notizen während des Termins festhalten.
   - **Protokoll drucken** erzeugt ein Termin-Dossier: Protokoll, Weg, Entscheidungen, Kapitel zum Nachlesen.
7. **Kein zweiter Bildschirm?**
   - „Ohne Leinwand-Fenster: Vorschau füllt den Bildschirm“ zeigt die Vorschau groß.
   - Unten bleibt eine Leiste mit den Kundenwahlen, ohne Notizen.
   - Esc kehrt zur Regie zurück.
8. **Explore** steuert die Regie nicht (L-54). Wer es zeigen will, öffnet es im Hauptfenster (`#explore`).

- **Lernseiten im Termin:** Die Leinwand zeigt die Lernwerkzeuge aufgelöst – Etappen als Liste, beide Ansichten eines Umschalters nebeneinander, Zuordnungen fertig sortiert, alle Stufen eines Reglers. Wer eine Übung gemeinsam lösen will, öffnet die Lernseite im Hauptfenster (z. B. `#theorie/k7`); der Druck zeigt dieselbe aufgelöste Fassung.

## 3. Einbetten in eine Webseite (E12, P12)

Diesen Schnipsel an die Stelle der eigenen Seite kopieren, an der MVG interaktiv erscheinen soll. Er lässt den Rahmen **mit dem Inhalt mitwachsen** (keine zweite Scrollleiste, weiche Höhenänderung), gibt der Story ab 981 px Breite eine feste Höhe (90 % des Fensters, 640–900 px), rollt beim Wechsel zwischen Start, Story, Lernseiten und Kapiteln sanft an den Anfang des Rahmens zurück, falls er aus dem Bild gescrollt ist, und springt bei Absatz-Links an die richtige Stelle. Bei reduzierter Bewegung (Systemeinstellung) geschieht all das ohne Animation.

```html
<iframe id="mvg" title="MVG interaktiv"
        src="mvg-kunde.html?einbettung-herkunft=https%3A%2F%2Fwww.example.de&einbettung-hintergrund=ffffff#start"
        style="display:block;width:100%;height:720px;border:0;transition:height .35s ease"></iframe>
<script>
(function () {
  var rahmen = document.getElementById('mvg');
  var ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (ruhig) rahmen.style.transition = 'none';
  var fest = function () { return Math.round(Math.max(640, Math.min(900, window.innerHeight * 0.9))); };
  var ort = '';
  window.addEventListener('message', function (e) {
    if (e.source !== rahmen.contentWindow) return;
    var d = e.data;
    if (!d || d.mvg !== 'einbettung') return;
    if (d.art === 'hoehe') rahmen.style.height = (d.px === null ? fest() : Math.max(320, d.px)) + 'px';
    if (d.art === 'ort') {
      // neue Seite (Fläche oder Kapitel): an den Anfang des Rahmens, falls er aus dem Bild ist
      var neu = String(d.hash).split('/').slice(0, 2).join('/');
      var r = rahmen.getBoundingClientRect();
      // weit weg: ohne Animation (sonst kurz leere Fläche, während der Rahmen schrumpft); Story: ganz ins Bild
      var weit = r.top < -window.innerHeight;
      if (ort !== '' && neu !== ort && (r.top < 0 || (d.flaeche === 'story' && r.bottom > window.innerHeight))) rahmen.scrollIntoView({ behavior: (ruhig || weit) ? 'auto' : 'smooth', block: 'start' });
      ort = neu;
    }
    // Sprungziel im Rahmen (z. B. ein Absatz): die Hostseite rollt dorthin
    if (d.art === 'ziel') {
      // die Höhe sofort (ohne Übergang) setzen, sonst reicht die Seite noch nicht bis zum Ziel
      rahmen.style.transition = 'none';
      void rahmen.offsetHeight;
      window.scrollTo({ top: rahmen.getBoundingClientRect().top + window.scrollY + d.y - 16, behavior: ruhig ? 'auto' : 'smooth' });
      if (!ruhig) window.requestAnimationFrame(function () { rahmen.style.transition = 'height .35s ease'; });
    }
  });
})();
</script>
```

- `einbettung-herkunft`: die Adresse der eigenen Website (URL-kodiert). Dann hört und antwortet MVG interaktiv nur dieser Herkunft.
- `einbettung-hintergrund`: Hintergrundfarbe der eigenen Seite als Hex ohne `#` (z. B. `ffffff`). Nur helle Farben (etwa ab #ececec) werden übernommen, damit die Texte lesbar bleiben; sonst bleibt das eigene Grau.
- Die Anwendung meldet dem Host `{ mvg: 'einbettung', art: 'bereit', version }`, nach jedem Wechsel `{ …, art: 'ort', hash, flaeche, titel }` und bei jeder Größenänderung `{ …, art: 'hoehe', px }` (`px: null` = feste Höhe, z. B. die Story am großen Bildschirm) sowie bei Sprüngen auf einen Absatz `{ …, art: 'ziel', y }`.
- Der Host kann schicken:
  - `{ mvg: 'einbettung', art: 'gehe', ziel: '#theorie/k4' }`
  - `{ mvg: 'einbettung', art: 'frage' }`
- Regie und Leinwand gibt es im Rahmen nicht: Weder `gehe` noch eine Adresse mit `#regie` oder `#leinwand` öffnet sie, die Anwendung zeigt dann die Startseite.

## 4. Pflege (für den Bau)

- Inhalte stehen als Markdown unter `inhalte/` (Format: `docs/INHALTSFORMAT.md`).
- `npm run pruefe` prüft alles, `npm run bau` baut beide Dateien.
- Neue Fassung des MVG-Originaltexts (L-57):
  1. `npm run whitepaper:reimport -- --docx <neue.docx> --bericht tmp/reimport.md` meldet jede betroffene Stelle.
  2. `node werkzeuge/whitepaper-import.mjs --docx <neue.docx> --ziel quellen/whitepaper/v1.3 --fassung V1.3` legt die neue Quelle an.
  3. Die maßgebliche Fassung umstellen: den Pfad `quellen/whitepaper/v1.2/whitepaper.json` in `werkzeuge/inhalte.mjs` (STANDARD_WHITEPAPER) und `werkzeuge/whitepaper-lib.mjs` (STANDARD_PFAD) auf v1.3 setzen und den Änderungsstand in `src/ui/impressum.ts` nachtragen.
  4. `npm run pruefe`: Der Inhaltsprüfer meldet jetzt jedes Zitat, das nicht mehr wortgleich ist. Die betroffenen Stellen aus Schritt 1 anpassen.
- Vorschläge für die Grafiken der V1.3: `docs/KORREKTURLISTE-V1.3.md`.
- Neue Fassung der Hilfe (MVG Companion, O-31, L-69): den statischen Export der Hilfe nach `quellen/hilfe/` legen, `QUELLE` in `werkzeuge/hilfe.mjs` darauf setzen und `node werkzeuge/hilfe.mjs --pruefe` laufen lassen. Meldet die Prüfung einen Begriff, die Ersetzungsliste `ERSETZUNGEN` ergänzen (nur Fließtext; Kennungen der Anwendung bleiben). Die Aufteilung übernimmt das Werkzeug aus den Kapiteln der Quelle.
