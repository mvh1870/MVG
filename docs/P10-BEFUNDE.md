# Prüfung Phasenende P10 (Whitepaper-Funktionen & Auslieferung) – 2026-09-28

Einzelprüfung während des Baus: Korrekturliste V1.3 (Agent; 5 Behauptungen der Grafik-Analyse als unbelegt verworfen). Am Phasenende zwei Agenten: Inhalt (Fachtreue, Begriffe, Verständlichkeit, Vollständigkeit; 17 Befunde, 1 schwer) und Technik (Architektur, Stil/Barrierefreiheit, Tests; 13 Befunde, keiner schwer). Dazu ein Fund der GitHub-Aktion (Chromium 153). Status: `[ ]` offen · `[x]` erledigt · `[-]` verworfen (Grund).

## Inhalt (I)
- [x] I1 (schwer) Kompass: „Projekt-Neuaufsatz“ gestrichen (widerspricht k7.5-p1); Hinweis „kein vollständiger Projektneustart“ mit Beleg.
- [x] I2 „Leistungsumfang“ gestrichen (im Whitepaper Auftragsumfang von BM).
- [x] I3 „Kostenprognose“ gestrichen; nur Cost to Complete, CTC.
- [x] I4 „Decision Log“ zum neuen Eintrag Entscheidungsregister (k6.4.1-p3).
- [x] I5 Datenstand: „Stand der Unterlagen, Arbeitsstand“, Hinweis mit Planständen aus k4.6-p1.
- [x] I6 Unscharfe Synonyme gestrichen (Entscheidungsfähigkeit, Vollmacht, AG-Projektleitung, HOAI-Phase, Meilensteinfreigabe, Projekthandbuch); Lenkungskreis mit Hinweis aus k4.2-p3. Hinweise werden jetzt gezeigt und mitgeprüft.
- [x] I7 Beleg-Prüfung als eigenes Wort (Plural-/Fugen-s/-n zugelassen); Mandat → k1.1-p1, Leistungsphase → k9.3-p1; Test.
- [x] I8 Kasten-IDs (`-b`) in Permalink und Zitierangabe („Kasten 1“); Test.
- [x] I9 Anleitung: Re-Import in vier Schritten mit dem Umstellen der maßgeblichen Fassung.
- [x] I10 Regie/Leinwand auch über `iframe.src` gesperrt (Start in der App); Anleitung präzisiert; Szenario.
- [x] I11 Regie-Dossier mit Resümee (Ende, Richtung) und den zwei Kapiteln als Text; L-56 bleibt: Protokoll nur in der Regie.
- [x] I12 Quellenverzeichnis der Story im Impressum (Station → Absatz-IDs als Permalinks).
- [x] I13 Impressum nennt den Titel des Whitepapers aus der Quelle.
- [x] I14 Kompass-Text: „keine Gleichsetzung im Detail“.
- [x] I15 Statustext „Markiert – mit Strg+C bzw. ⌘+C kopieren.“, Rückfall in der Anleitung.
- [x] I16 Prompt abb-6: „Risikoreserve“ statt „Risikominderung“ auf der Karte Risikoannahme (k4-t1).
- [x] I17 Prompt abb-11: „Regelbetrieb (Bauherr)“ als abgesetzter Zielpunkt, nicht als BM-Station (k7.4-t1).

## Technik (T)
- [x] T1 = I8.
- [x] T2 = I10.
- [x] T3 Kein allein stehender Bogenkopf auf Seite 1 (`.druck-kopf + .druck-kapitel { break-before: avoid }`).
- [x] T4 Karten-/Registertafeln im Druck umbrechend; Szenario misst Überlauf bei Satzspiegelbreite (Kap. 8).
- [x] T5 Permalink-Ziele mit `scroll-margin-top`, erneutes Ausrichten nach dem Laden der Schriften; Szenario prüft „unter der Kopfleiste“, auch nach Neuladen, und die Impressum-Überschrift.
- [x] T6 IDs im Druckbogen umbenannt, Bezüge mitgezogen; Test ohne doppelte IDs.
- [x] T7 Klänge: angehaltener Audio-Kontext wird beim nächsten Ton geweckt; Test.
- [x] T8 Kompass-Sprung setzt die Suche zurück.
- [x] T9 „Zitieren“ mit `aria-controls`; Statustext im nächsten Takt.
- [x] T10 `einbettung` vor dem Abonnement deklariert.
- [x] T11 Kundenfassung: Arbeitsdatei je Lauf unter dem Zwischenordner.
- [x] T12 = I6 (Hinweis gezeigt und geprüft).
- [x] T13 Tests: Permalink-Rundlauf über alle Absätze aller Lernseiten, afterprint-Pfad, doppelte IDs, Überlauf, iframe.src.

## GitHub-Aktion
- [x] A1 axe `target-size` an der Einwand-Karte bei 400 px (Chromium 153, lokal 141 ohne Fund): Abstand der Karten 12 px statt 6 px. Nachprüfen am nächsten Lauf der Aktion.
