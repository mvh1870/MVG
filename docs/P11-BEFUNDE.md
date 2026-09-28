# Gesamtprüfung P11 – 2026-09-28

P11.1 Vollständigkeitsprüfer (Bauplan, 20 Owner-Punkte, E1–E14, O-Entscheide, Abdeckung): 12 Befunde (2 schwer). P11.2: `pruefe:voll` grün, ganzer Lauf mit reduzierter Bewegung grün (25 Läufe). Status: `[ ]` offen · `[x]` erledigt · `[-]` verworfen (Grund) · `→` in einen Posten übernommen.

## P11.1 Vollständigkeit (V)
- [→] V1 (schwer) Lesezeit gemessen statt geplant: Hauptpfad Bauherren-PL rund 12 000 sichtbare Wörter (≈ 67 min bei 180 Wörtern/min) statt 25–35 min (O-5) → Posten P11.5.
- [x] V2 (schwer) „Ereignis einspielen“/„Szenario-Werte“ nicht gebaut → gestrichen mit Begründung (L-60), P9.4 berichtigt.
- [→] V3 Wissenschecks nur in B3 → Posten P11.6.
- [x] V4 Governance-Fluss als Übersicht auf der Lernseite 6.4.3 (derselbe Baustein wie B3); Test.
- [x] V5 Facetten der interaktiven Grafiken: L-60 (nur was die Tabellen tragen).
- [x] V6 UEBERGABE-Kopf neu geschrieben.
- [x] V7 Commit-Kurzhashes im Planblatt nachgetragen; Aktion-Befund offen geführt, bis ein Lauf grün ist.
- [x] V8 Explore-Text: „Aus der Geschichte führt der Weg hierher mit ihrem Ende; direkt geöffnet stehen die Werkzeuge jederzeit bereit.“
- [x] V9 Regie zeigt „Als Nächstes: …“ unter Zurück/Weiter; Test.
- [x] V10 Glossarseite ohne Ebenen: L-60.
- [x] V11 Browser: Anleitung sagt, was automatisch getestet ist; Rest in ABNAHME D (L-60).
- [x] V12 P1.5-Hinweise H12–H20 mit Stand nachgetragen.

## P11.5/P11.6 Kürzung und Wissenschecks – Fachtreue (F)
Teil 1 (Prolog, A1, A2, A4, A5, B1, B2, B4, B5, Rückspulen, Epilog): 18 Befunde (1 schwer: „jede Freigabe erteilt der Bauherr selbst“ ohne Bezug auf die LPH-Freigabe) – alle mit den vorgeschlagenen Wortlauten eingearbeitet.
Teil 2 (A3, A6, Wendepunkt, B3, B6, Wirklichkeit, drei Enden, Wissenschecks Kap. 2–12): 16 Befunde (keiner schwer; u. a. Statusmodell der Vorlage vs. Freigabe in B6, Zeitanker B3, Anwendung des Musters im Wendepunkt, Wissenschecks k07/k12 näher an O-1) – alle eingearbeitet; danach die Lesezeit mit kleinen Kürzungen wieder unter das Ziel gebracht (alle Rollen Hauptpfad ≤ 34,8 min, Express ≤ 14,9 min).
- [x] F1–F18 (Teil 1), F19–F34 (Teil 2) erledigt.

## P11.3 Korrekturschleife – Runde 1 (R1)
Inhalt (Rolle Bauherr und Planung, Haupt- und Express-Pfad, Stichprobe Fachtreue 15/15 gedeckt): 14 Befunde (0 schwer, 3 mittel). Technik (Architektur, Stil, Barrierefreiheit): 7 Befunde (0 schwer, 3 mittel). Alle erledigt (L-64):
- [x] Lesezeit-Messung zählt alle Textknoten (vorher fehlten ~1 100 Wörter) und prüft das Ende des Pfads; danach Kürzungsrunde 3 (zwei Redaktionsläufe): alle Rollen Hauptpfad 33,0–33,3 min, Express 14,5–14,8 min.
- [x] Wendepunkt kurz: Pyramide und Felder in Ebene 2/3 des Schritts „Tiefer gehen“ (DREHBUCH, H18).
- [x] B3-Rollenfrage am Schritt „mandat“ wird gezeigt; Test.
- [x] Rückbezug-Tabelle „Welt A · Stand am Ende“ / „Welt B · Stand jetzt“.
- [x] Planung A2 Option B: plant vorsorglich mit (Spur zu A5 und Wirklichkeit).
- [x] B3 Status ohne feste Klammer; B1/B4/A6/Wirklichkeit/A3/k04/k06/Kompass-Beleg (k2.5-t1) sprachlich und fachlich nachgeschärft; ende-auflagen ohne Spielmechanik-Satz.
- [x] Lernseiten: `scroll-padding-top` gegen verdeckten Fokus; Governance-Fluss-Übersicht ohne „aktuelle“ Station und ohne Puls.
- [x] „Zurück“ = Umkehr von „Weiter“ im Ebenen-Schritt; Ebenen-Ort mit `aria-live`; Szenario bedient die Reiter per Tastatur.
- [x] Test „Als Nächstes“ vergleicht Vorschau und tatsächlichen Ort über zwölf Schritte.
- [-] Wirklichkeit „Mail von Dr. Olbers“ beim Spielen der Rolle Bauherr: bleibt – die Oberfläche zeigt dann „Sie“ als Absender (H13).

## P11.3 Korrekturschleife – Runde 2 (R2)
Inhalt (Rollen GF und Projektsteuerung, Haupt- und Express-Pfad, alle vier am Ende angekommen): 10 Befunde (0 schwer, 5 mittel). Technik (Architektur, Barrierefreiheit, Tests): 7 Befunde (1 schwer, 3 mittel). Alle erledigt; wegen des schweren Befunds folgt Runde 3 (L-64).
- [x] `paar`-Vergleiche B1/B2/B4/B5 zitieren die gekürzten A-Wortlaute; B2 ohne „Varianten werden durchgerechnet“ (wie A2).
- [x] ende-auflagen (alle Rollen): „Auf dieser Spur hätte sie noch nicht getragen;“ statt „Bis sie greift …“.
- [x] Wendepunkt: „Brandschutzauflagen grob 0,4“; Ebene-1-Kernaussage mit Inhalt (k3.3).
- [x] A1-Kernaussage ohne neue Verknüpfung (k2.1/k2.2/k2.3 getrennt, O-17).
- [x] A6 Bekannt nennt die unentschiedene Holz-Lieferzeit; B6 Checkliste nennt „Freigabe LPH 5“; B4 GF Option B „nur grob geschätzt“; Express-Knopf „rund 15 Minuten“.
- Lesezeit nach den Inhaltsbefunden (pl, alte Zählung): Hauptpfad 33,0 min, Express 14,6 min.
- [x] T1 (schwer) B3 „mandat“: Die Rollenfrage war unsichtbar (`.reife` ohne `ist-bereit`, nur nach einer Antwort gesetzt) – jetzt sofort bereit.
- [x] T2 Test dazu: Unit-Test prüft `ist-bereit`, `aria-pressed` und Rückmeldung; Szenario `welt-b` (1280) blättert zum Mandats-Schritt, antwortet per Enter und prüft beides im Browser (Gegenprobe mit altem Code rot).
- [x] T3 Ebenen-Ort ohne `aria-live`; knappe Ansage „Ebene n: Titel“ in eigener nur-sr-Zeile.
- [x] T4/T5 Lesezeit zählt sichtbaren Text unter `aria-hidden` und prüft das Ende streng (L-65); danach Express-Karten und drei Kernsätze gekürzt: alle Rollen Hauptpfad 33,9–34,3 min, Express 14,7–15,0 min.
- [x] T6 Regie-Vorschau-Test verlangt beim ersten Schritt eine Vorschau und mindestens zwei Vergleiche.
- [x] T7 Szenario `theorie`: 120 Tabulatorschritte vor und zurück auf Kap. 8, kein Fokus unter der Kopfleiste (Gegenprobe ohne `scroll-padding` rot).

## P11.3 Korrekturschleife – Runde 3 (R3)
Inhalt (bauherr Express, planung Hauptpfad, controlling Express, wechselnde Optionen, alle am Ende, 0 Konsolenfehler): 7 Befunde (0 schwer, 2 mittel). Technik: Bericht folgt.
- [x] B3 Express-Karte: `AEN-012` „fürs Änderungsgremium“ (nicht die Frühwarnung).
- [x] ende-auflagen (alle Rollen): „Getragen hat sie noch nicht;“.
- [x] A6 „seit März offen“; A1 „Annahmen kippen schnell“ (k2.1-p1); Wirklichkeit „Entscheidungslogik“ (k11.2-p1), „ein 40-Seiten-Statusbericht“; B6-Chat „seine benannte Stellvertretung“.
- [x] Wendepunkt Ebene 1 nach k3.3-p2 berichtigt: übertragbar sind Arbeit und Ausübung von Mandaten, nicht Festlegung des Mandats und Letztverantwortung.
- [x] CI-Lauf 80 rot: Lesezeit-Szenario brach unter Last bei „#story“ ab – wartet jetzt bis 5 s auf die nächste bedienbare Szene (101fc2e).
