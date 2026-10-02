# Prüfung Phasenende P9 (Regie & Leinwand) – 2026-09-28

Am Phasenende zwei Agenten: Inhalt (Fachtreue, Begriffe, Einwand-Karten, Regie-Notizen; 12 Befunde, keiner schwer) und Technik (Architektur, Stil/Barrierefreiheit, Tests; 17 Befunde, 1 schwer). Status: `[ ]` offen · `[x]` erledigt · `[-]` verworfen (Grund).

## Inhalt (I)
- [x] I1 gremien: Antwort nennt den Takt (Änderungsgremium monatlich, anlassbezogene Sondersitzungen, k6.4.2-t1) und belegt „Entscheidungsunterlagen statt Statusberichte“ mit k5.3-l1.
- [x] I2 projektgroesse: keine neue Fachaussage mehr; Zielgruppe mit k1-p3 belegt.
- [x] I3 k12 Leitfrage 2 ohne Einladung zur Pilotierung (O-1).
- [x] I4 zu-spaet: k7.5-p1 als zweiter Beleg.
- [x] I5 kosten: k5.1-p1 als zweiter Beleg.
- [x] I6 raci: „übersetzt Rollenbilder in eine transparente Verantwortungslogik“ statt „ist ein Baustein“ (k9.2-p1).
- [x] I7 Kopf von `einwaende.md`: Stationen ohne Ebenen-Schritt wirken nur in der Regie.
- [x] I8 k08 Leitfrage 2 ohne Pilotierungsanklang.
- [x] I9 k02 Regie-Notiz wortnah an 2.4 (Mandat, Entscheidung, Schwelle, Datenstand, Freigabe, Nachweis).
- [x] I10 k02 Leitfrage ohne suggestive Alternative.
- [x] I11 Story-Überschrift „Typische Einwände – und was das Whitepaper sagt“.
- [x] I12 Knopf „Ohne Leinwand-Fenster: Vorschau füllt den Bildschirm“.

## Technik (T)
- [x] B1 (schwer) Beamer-Zoom schnitt die Leinwand unten ab → Leitstandhöhe `100dvh / 1.15` auf der Leinwand; Szenario misst 1280×720 und 1180×820.
- [x] B2 Regie sendet beim Start den Beamer-Stand (aus); Szenario lädt die Regie mit Beamer an neu.
- [x] B3 Ein-Fenster: Rahmenbreite aus Breite und Höhe; Szenario 1920×1000.
- [x] B4 Ein-Fenster: Kopf, Steuerung, Notiz, Protokoll, Fuß `inert`; Fokus nach Esc zurück auf den Knopf.
- [x] B5 Eingriffsleiste statt Schublade; L-53 berichtigt (L-54).
- [x] B6 Springen erst nach der Rollenwahl.
- [x] B7 Druck blendet die Regie mit `display:none` aus; Szenario prüft eine PDF-Seite.
- [x] L1 Rollenfeld zeigt vor der Wahl „–“.
- [x] L2 Tasten im Auswahlfeld blättern nicht.
- [x] L3 Einwände auf der Leinwand bleiben zu (L-54).
- [x] L4 Aufklapp-Winkel an Einwand-Karten.
- [x] L5 Einwände getrennt vom Hinweis „nur in der Regie“; ARCHITEKTUR berichtigt.
- [x] L6 Eingriffe vor der Notiz.
- [x] L7 Compiler: Regie-Block ohne `kapitel:` und doppelter Regie-Block sind Fehler; Einwand-Kapitel gegen die Gliederung geprüft; JSDoc zusammengeführt.
- [x] L8 Eigene Symbole für „Ein Fenster“ und „Beamer“.
- [x] L9 Ohne `window.print` bleibt keine Druckklasse stehen.
- [x] T1 Tests: Kanal `anzeige` (gültig, veraltet, ungültig, nach hallo, beide Wege); Regie-Bauart (Start sendet anzeige, Sprung gesperrt, Einwände nach dem Hinweis, Kapitel ohne Eintrag, Druckteil vollständig, Ein-Fenster inert und Fokus); Szenario `regie` erweitert (Beamer-Höhe, Neuladen, 1920×1000, axe im Ein-Fenster, PDF-Seiten).
