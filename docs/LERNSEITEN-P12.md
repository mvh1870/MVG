# Lernseiten neu aufbereiten (P12.3, O-30)

Owner (2026-09-28): „Die Sachen … werden extrem viel einfach referenziert aus dem Text. … Es sind viel zu viele Referenzierungen und bitte auch diese Sachen mit kleinen Grafiken erklären, also auch interaktiv. Es kann auch ruhig ausführlicher sein als jetzt.“ Originaltext am Seitenende, zugeklappt (steht, P12.2).

## Aufbau einer Lernseite

1. **Einleitung** (Text der Datei, 2–4 Sätze): Worum geht es, und warum ist das für den Bauherrn wichtig?
2. **Kernaussage** (`::: kernaussage`): ein bis zwei eigene Sätze – kein Zitat.
3. **Je Abschnitt des Kapitels** (`::: abschnitt kN.M`, alle Abschnitte der Gliederung in Reihenfolge):
   - Lesetext in eigenen Worten, **erklärend**, 80–220 Wörter: Was ist gemeint, woran erkennt man es im Projekt, was folgt daraus für den Bauherrn? Gern ein kurzes Beispiel aus der Praxis öffentlicher Bauherren (allgemein oder ausdrücklich als Beispiel, nie als echter Fall).
   - **Mindestens eine interaktive Grafik je Abschnitt**, passend zum Inhalt:
     - `etappen` – Abfolgen, Prozesse, Zeitachsen (z. B. Weg Diagnose → Regelbetrieb, Status einer Änderung)
     - `umschalter` – Gegenüberstellungen (ohne/mit MVG, Bericht/Führung, delegierbar/nicht delegierbar)
     - `sortieren` – Zuordnungsübungen (Wer entscheidet? Delegierbar oder nicht? Welches Register?)
     - `regler` – geordnete Stufen (Mandatsleiter nach Betrag, Reife, Takte, 30/60/90)
     - vorhandene: `karten`, `tafel` (Tabelle des Originaltexts als Grafik), `raci`, `governancefluss`, `merksatz`
   - Bestehende Wissenschecks bleiben (einer je Kapitel 2–12).
4. **Querverweis in die Story** (bleibt), dann automatisch der Originaltext (zugeklappt).

## Regeln

- **Kaum Zitate im Lesetext:** keine `[[zitat:…]]` im Fließtext, keine Absatz-IDs, keine Floskeln „laut MVG“/„wörtlich“. Höchstens ein bis zwei `::: zitat`-Blöcke je Kapitel, und nur wo der Wortlaut zählt (Definitionen, Leistungsgrenzen, rechtlicher Hinweis – O-17 verlangt diese wortgetreu). Der Originaltext steht vollständig unten.
- **Fachtreue (O-17):** Keine neuen Fachaussagen. Jede MVG-Regel im Lesetext und in den Grafiken muss sich auf einen Absatz des Kapitels zurückführen lassen. Die Belege stehen unsichtbar in den Kopfdaten als YAML-Kommentar: `# Belege k4.2: k4.2-p1, k4.2-p3`.
- Begriffe nach `docs/BEGRIFFE.md` (LPH 0–9, Änderungsgremium, Entscheidungsvorlage, Freigabe / keine Freigabe / Freigabe mit Auflagen …). Kein „Whitepaper“ (O-29). Kein Vertrieb (O-1), besonders in Kap. 7 und 12: beschreiben, nicht anbieten. Glossarbezüge `[[Begriff]]` sind erwünscht (Tooltip).
- Ebenen-Blöcke (`::: ebenen`) auf Lernseiten entfallen; ihr Inhalt geht in die Abschnitte.
- Der Stil ist ruhig und sachlich, Sie-Form, kurze Sätze.
