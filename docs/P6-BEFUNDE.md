# Prüfung Phasenende P6 (Theorie) – 2026-09-27

Jede Lernseite war paketweise in zwei Runden auf Fachtreue, Begriffe und Verständlichkeit geprüft (L-46). Am Phasenende prüften zwei Agenten quer: Inhalt (Dramaturgie, Fachtreue quer, Begriffe quer, Vollständigkeit; 10 Befunde) und Technik (Architektur, Stil/Barrierefreiheit, Tests; 11 Befunde, 1 schwer). Status: `[ ]` offen · `[x]` erledigt · `[-]` verworfen (Grund).

## Inhalt (I)
- [x] I1 Kap. 4.5: Brücke von der weiten Freigabe (k4.5-p1) zur Freigabe am Abschluss einer Leistungsphase (Kap. 9.3, Glossar).
- [x] I2 Querverweise nennen Falldetails → Etikett „In der Story erlebt · Fiktiver Fall“ (O-3, L-5).
- [x] I3 k13 verweist auf den Epilog (DREHBUCH §5).
- [x] I4 Querverweise ergänzt: k06 → `ende-auflagen`, k03 → `ende-neufestlegung`. Übrige Stationen mit Bezug (k03: A5, B1, B4; k09: A6, B5) bleiben ohne Knopf, weil die Seiten schon die tragenden Stationen verlinken.
- [x] I5 Glossarbezüge für MVG, Mandat, Datenstand, Leistungsphasen- und Freigabemodell, Neufestlegung der Projektbasis. FID steht nur in wortgleichen Zitaten → dort kein Bezug.
- [x] I6 k06: MVG ausgeschrieben vor „MVG Companion“.
- [x] I7 Einleitungen einheitlich „Kapitel N …“; k10 ohne Doppelung.
- [x] I8 Wiederholungen: k06 Ebene 3 zeigt die Eskalationsleiter (k6.4.5-p1), Einleitung k06 gekürzt; k12 Ebene 4 zitiert k12.1-p1.
- [x] I9 Holger Stein mit Rolle beim ersten Vorkommen (k02).
- [x] I10 k02 Querverweis B3 mit „Monat 5“.

## Technik (T)
- [x] T1 (schwer) Zitat in Ebene 4 weiß auf weiß → `.lern-zitat-rahmen { color: var(--tinte) }`; Kontrast der Lernseiten-Zitate wird im Browser gemessen (Gegenprobe: ohne Korrektur 24 Funde 1,00:1).
- [x] T2 Breite Tabellen im Originaltext: Bereich mit `tabindex=0`, `role=region`, Bezeichnung „Tabelle <ID>“.
- [x] T3 Ebenen bei 400 px ohne Seitwärtsscrollen (`minmax(0, 1fr)`, `min-width: 0`, Umbruch).
- [x] T4 Neues Szenario `theorie`: alle 13 Lernseiten, Ebenen und Tafeln geöffnet, Layout, axe, Zitat-Kontrast, Tastatur an Tabellen (schnell 1280 und 400, voll zusätzlich 1024).
- [x] T5 Leinwand ohne Links und Suche: Test über alle Kapitel und die Liste.
- [x] T6 Tafel- und RACI-Titel folgen der Gliederung (h2 auf Seitenebene, h3 in Abschnitten und Ebenen; Story unverändert h4).
- [x] T7 Toter Pfad: `grafik` nur noch in Schritten; Feld `TheorieSeite.grafik` entfernt.
- [x] T8 Lernseite ohne `kapitel` ist ein Compilerfehler.
- [x] T9 Unit-Tests: Kapitel-Vorkommen im Glossar (doppelte Bezüge zählen einmal), RACI auf der Lernseite. Sortierung über mehrere Kapitel ergibt sich aus der Seitenreihenfolge und ist nicht eigens getestet.
- [x] T10 `pruefeLayout` nur noch in `hilfen.mjs` (mit der `clip`-Ausnahme).
- [x] T11 `prefers-reduced-motion` im Szenario `theorie` nachgestellt; es prüft, dass keine Animation mehr läuft.
