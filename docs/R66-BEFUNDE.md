# Runde 66 – Befunde (Prüfung auf 43329ae, Einarbeitung offen)
Geprüft am 2026-10-02 05:05–06:10 UTC in einer parallelen Sitzung (Workflow `docs/pruefrunde.workflow.js`, zehn Agenten, ohne Gegenprüfung – Gegenprüfung beim Einarbeiten, L-154). Zählung: 0 schwer, 3 mittel, 15 leicht.
**Für den nächsten Block:** diese Befunde einarbeiten (L-182), nicht Runde 66 neu prüfen. Danach Runde 67 voll.

## 1. [leicht] fach-theorie-1 · `inhalte/theorie/k05-fuehrungsmodell.md`
**Ort:** Z. 232 (Wissenscheck „kopplung“, ### Erklärung) gegen Z. 251 (zitat k5.3-p1)

**Befund:** Die Erklärung des Wissenschecks ist das Zitat darunter Wort für Wort. Einziger Unterschied: ein Doppelpunkt statt eines Punkts nach „Kopplung“. Nach einem Klick erscheinen die drei Sätze in der Rückmeldung also zweimal direkt untereinander, einmal als Erklärung und einmal als „Originaltext, wörtlich“. Auch der Lesetext in 5.3 sagt dasselbe schon fast wortgleich. Das ist dieselbe Art Doppelung, die R64/R65 bei den Rückmeldungen bereinigt haben, nur zwischen Erklärung und Zitat.

**Beleg:** Gemessen mit Playwright: #theorie/k5, Klick auf [data-pruef=wc-antwort-a], innerText von .wc-ergebnis. Ausgabe: „Genau: ¶ Erst die Verbindung … ¶ Die Wirkung von MVG entsteht durch Kopplung: Ein Zielsystem allein reicht nicht – … verbunden werden. ¶ Die Wirkung von MVG entsteht durch Kopplung. Ein Zielsystem allein reicht nicht – … verbunden werden. ¶ Originaltext, wörtlich · MVG V1.2, Kap. 5.3“.

**Vorschlag:** Die Erklärung in eigenen Worten auf den Fall der Frage beziehen. Zum Beispiel: „Drei vorhandene Elemente sind noch keine Kopplung. Wirksam wird MVG erst, wenn Zielsystem, Mandate und Freigaben ineinandergreifen.“ Den Wortlaut nur im Zitat lassen. In k02 Z. 237 dasselbe prüfen: Die Erklärung gibt k2.4-p2 dort fast wörtlich wieder, und das Zitat folgt direkt darunter.

## 2. [leicht] fach-theorie-1 · `inhalte/theorie/k06-companion.md`
**Ort:** Z. 417 (Wissenscheck „neue-fruehwarnung“, antwort a)

**Befund:** Die Rückmeldung lautet „Genau: Ein bewertetes Risiko wird aus ihr erst, wenn sie bestätigt wird.“ Im Ergebnisfeld steht das ohne den Antworttitel. „ihr/sie“ hat dort also keinen Bezug. Davor nennt die Frage zuletzt „eine CTC-Verletzung“, danach spricht die Erklärung von „Die Verletzung“. Man kann „sie“ deshalb auch als die Verletzung lesen. Bestätigt wird aber die Frühwarnung (k6.4.3-p2).

**Beleg:** Gemessen mit Playwright: #theorie/k6, Klick auf wc-antwort-a, innerText von .wc-ergebnis: „Genau: ¶ Ein bewertetes Risiko wird aus ihr erst, wenn sie bestätigt wird. ¶ Die Verletzung ist ein neues, unbewertetes Signal …“. Quelle k6.4.3-p2: „Eine Frühwarnung (EW) ist ein unbewertetes Signal. Wird sie bestätigt, wird daraus ein bewertetes Risiko.“

**Vorschlag:** Das Bezugswort nennen: „Ein bewertetes Risiko wird aus der neuen Frühwarnung erst, wenn sie bestätigt wird.“

## 3. [leicht] fach-theorie-1 · `inhalte/theorie/k06-companion.md`
**Ort:** Z. 425 (Wissenscheck „neue-fruehwarnung“, antwort b)

**Befund:** „Das bestehende Risiko bleibt, wie es ist“ sagt mehr als die Quelle. k6.4.3-p2 sagt nur, dass die neue Frühwarnung keine „Rückrichtung aus einem bestehenden Risiko“ ist, das Risiko also nicht zurückgestuft wird. Dass das Risiko unverändert bleibt, steht dort nicht. Es wird ohnehin monatlich formal geprüft und wöchentlich gesichtet (k6.4.2-t1). Man kann „bleibt, wie es ist“ als „wird nicht neu bewertet“ missverstehen.

**Beleg:** k6.4.3-p2: „… CTC- oder Schwellenwertverletzungen erzeugen neue Frühwarnungen als neue Signale, nicht als Rückrichtung aus einem bestehenden Risiko.“ k6.4.2-t1: Risikoregister „monatlich (Prüfung); wöchentliche Sichtung“.

**Vorschlag:** „Das bestehende Risiko wird nicht zur Frühwarnung zurückgestuft; die Verletzung kommt als eigene Frühwarnung hinzu.“

## 4. [leicht] fach-theorie-2 · `inhalte/theorie/k08-implementierung.md`
**Ort:** Z. 193, wissenscheck orientierungsrahmen, antwort c (neu seit R65)

**Befund:** Die neue Rückmeldung lautet „Einen festen Ablauf mit Terminen gibt sie nicht vor – dafür steht das Vorgehensmodell.“ Damit behauptet sie, das Vorgehensmodell gebe einen festen Ablauf mit Terminen vor. V1.2 nennt das Vorgehensmodell nur den verbindlichen Projektverlauf aus Schritten (Einrichtung → … → Regelbetrieb), ohne Termine. Termine kommen nur als Ergebnis „Terminplan“ der Einrichtung vor (k8.1-t1). Die Regie-Notiz derselben Seite (Z. 339) verlangt außerdem „keine Termine für den Kunden in Aussicht stellen“.

**Beleg:** k8.2-p1 („kein starrer Projektplan“), k8.2-p5 („Der verbindliche Projektverlauf folgt dem Vorgehensmodell (Einrichtung → Diagnose → …)“), k8.1-t1; im Browser angeklickt: Ausgabe „Nicht ganz: Einen festen Ablauf mit Terminen gibt sie nicht vor – dafür steht das Vorgehensmodell.“

**Vorschlag:** Ohne Termine formulieren und ohne die Erklärung zu wiederholen, etwa: „Starr ist sie gerade nicht – den verbindlichen Verlauf bestimmt das Vorgehensmodell.“

## 5. [leicht] fach-theorie-2 · `inhalte/theorie/k10-anwendungssituationen.md`
**Ort:** Z. 204 und Z. 212 (wissenscheck infrastruktur-fid, antwort b/c); dazu inhalte/theorie/k12-gewinn.md Z. 97 (wissenscheck fuehrungswirkung, antwort b)

**Befund:** Die Bereinigung aus L-180/L-181 ist unvollständig: Diese falschen Antworten wiederholen weiter den Inhalt der Erklärung, die gleich darunter steht. k10 b: „Zum Abschluss von LPH 2 geht es um Variantenwahl und Business Case.“, die Erklärung sagt „zum Abschluss von LPH 2 für Variantenwahl und Business Case“. k10 c: „LPH 7 betrifft Vergabe oder die Bindung einer Komponente mit langer Lieferzeit.“, wortnah zur Erklärung. k12 b: „Die Zahl der Artefakte zählt am Ende gerade nicht.“, die Erklärung sagt „zählt am Ende nicht die Zahl der Governance-Artefakte“. Ähnlich, aber weniger dringend, die richtigen Antworten k07 a, k09 a und k12 a.

**Beleg:** L-180/L-181 (Rückmeldungen wiederholen die Erklärung nicht mehr: k07/k08/k11 b, k08 c, k09 b, k11 c). Im Browser je Antwort geklickt und den Text von Rückmeldung und Erklärung ausgelesen.

**Vorschlag:** Wie in R65 kurz umformulieren, ohne den Inhalt der Erklärung, z. B. k10 b „An LPH 2 hängt eine frühere Entscheidung als die FID.“, k10 c „LPH 7 liegt deutlich nach der FID.“, k12 b „Mehr Artefakte heißen nicht mehr Führung.“

## 6. [leicht] fach-theorie-2 · `inhalte/theorie/k07-leistungsarchitektur.md`
**Ort:** Z. 396, sortieren „Leistung oder Grenze?“, posten bauleitung, Erklärung

**Befund:** „Keine davon ersetzt Bauherr Mentoren.“ liest sich in der üblichen Wortstellung so: Keine der Leistungen (Fachplanung, Bauleitung, Objektüberwachung) ersetzt BM. Gemeint ist das Gegenteil, nämlich dass BM keine davon ersetzt. Der Satz ist mehrdeutig und gerade in der Leistungsgrenze missverständlich.

**Beleg:** k7.6-p1: „BM ersetzt keine … Fachplanung, keine Bauleitung, keine Objektüberwachung …“

**Vorschlag:** „Bauherr Mentoren ersetzt keine davon.“

## 7. [leicht] fach-theorie-2 · `inhalte/theorie/k09-ergebnisbild.md`
**Ort:** Z. 502, sortieren „Vorlage oder Handbuch?“, posten beschlusslage, Erklärung

**Befund:** „Die Beschlusslage hält die Entscheidungsvorlage fest.“ liest sich zuerst so, als hielte die Beschlusslage die Vorlage fest. Gemeint ist der umgekehrte Bezug, den Etappe 6 derselben Seite (Z. 70) richtig formuliert: „Die Entscheidungsvorlage hält die Beschlusslage fest“.

**Beleg:** k9.4-l1 (Punkt „Beschlusslage“ der Entscheidungsvorlage); k09 Z. 70

**Vorschlag:** „Die Entscheidungsvorlage hält die Beschlusslage fest.“

## 8. [leicht] fach-story-a · `inhalte/story/A3/ps.md`
**Ort:** option C, Abschnitt „Neues Risiko“ (Z. 61)

**Befund:** Unter der Überschrift „Neues Risiko“ steht seit L-181 kein Risiko, sondern eine Einordnung, die sich selbst aufhebt: „Eine Option über 5 Mio. € läge nach dem Muster bei der Beschlussfassung durch den Bauherrn im Lenkungskreis – in Welt A ohne Folge: Es gibt keine Schwelle.“ Ein „neues Risiko“, das „ohne Folge“ bleibt, liest sich widersprüchlich. Außerdem folgt der Satz direkt auf „rund 5,3 Mio. €“ in der Konsequenz. So legt er weiter nahe, die Abweichung selbst sei das Maß der Mandatsleiter, obwohl L-181 genau das ausräumen wollte (Wendepunkt-Regie: „wer entscheidet, hängt von der Option ab“). Alle anderen Optionen in A1–A6 nennen unter „Neues Risiko“ eine echte Gefahr, etwa A3/pl D „Parallele Datenstände – Entscheidungen beruhen auf widersprüchlichen Grundlagen.“

**Beleg:** k4.2-p3 (die Mandatsleiter regelt Freigaben und Entscheidungen, keine Prognosewerte); Wendepunkt-Regie Z. 125 f.; L-181 (1); gelesen in A3/ps.md und im gebauten dist/mvg.html (grep: der Satz ist so gebaut).

**Vorschlag:** Als echtes Risiko formulieren und den Mustersatz behalten, z. B.: „Wer über eine Option dieser Größe entscheidet, ist offen – nach dem Muster läge eine Option über 5 Mio. € bei der Beschlussfassung durch den Bauherrn im Lenkungskreis; in Welt A gibt es keine Schwelle.“ Alternativ den Mustersatz in „Was fehlt“ verschieben und unter „Neues Risiko“ „Drei Dateien im Umlauf, keine gilt“ setzen.

## 9. [leicht] fach-story-a · `inhalte/fall.md`
**Ort:** Tabelle „Zahlen“, Zeile „aktualisierte Prognose (nur Welt A)“ (Z. 44)

**Befund:** Die Fall-Bibel ordnet „+9,1 %, rund +5,3 Mio. €“ der Option „Prognose aktualisieren lassen“ zu. Das ist A3/pl D, und dort steht nur „+9,1 %“, ohne Betrag und ohne Mandatshinweis. Betrag und Mustersatz stehen in A3/ps C mit dem Kurztitel „Prognose aktualisieren“. Außerdem knüpft „eine Option dieser Größe“ das Mandatsmaß wieder an die Abweichung von 5,3 Mio. €, die L-181 gerade davon trennen sollte. Der Prüfer gleicht die Stationen mit der Fall-Bibel ab; der Verweis führt auf die falsche Rolle.

**Beleg:** inhalte/story/A3/pl.md Option D (kurz „Prognose aktualisieren lassen“, Konsequenz „jetzt +9,1 %“); inhalte/story/A3/ps.md Option C (kurz „Prognose aktualisieren“, „rund 5,3 Mio. €“); L-181 (1).

**Vorschlag:** Anmerkung ändern in: „A3, Optionen ‚Prognose aktualisieren lassen‘ (pl) und ‚Prognose aktualisieren‘ (ps, mit Betrag); nach dem Muster läge eine Option über 5 Mio. € beim Bauherrn im Lenkungskreis – wer entscheidet, hängt von der Option ab“.

## 10. [leicht] fach-story-a · `inhalte/story/A6/bauherr.md`
**Ort:** option A, Konsequenz (Z. 16)

**Befund:** „Die Freigabe wird verschoben, LPH 6 kann nicht beginnen.“ Das passt zu MVG (k9.3-p2), aber nicht zur Logik von Welt A. Dort lief LPH 5 ohne Freigabe zum Abschluss von LPH 4 an: Protokoll A2 „kein eigener Termin, weiter wie besprochen“, Vertiefung A2 „LPH 5 läuft seit Februar, ein Beschluss dazu ist nirgends dokumentiert“, fall.md Monat 2 „stillschweigend ‚weiter so‘“. Wer A2 gesehen hat, kann sich fragen, warum in Welt A ausgerechnet jetzt eine Freigabe den Fortgang aufhält. Falsch ist nichts, die Formulierung ist nur missverständlich.

**Beleg:** k9.3-p2 „Die Freigabe am Abschluss einer Leistungsphase gibt die nächste frei.“; inhalte/story/A2/station.md Protokoll und vertiefung freigaben; inhalte/fall.md Zeitachse Monat 2.

**Vorschlag:** Den Unterschied benennen, z. B.: „Die Freigabe wird verschoben; diesmal geht es nicht stillschweigend weiter – LPH 6 wartet.“ Oder als Wirkung statt als Regel: „… die Vorbereitung der Vergabe wartet.“

## 11. [mittel] fach-story-b · `inhalte/story/B5/station.md`
**Ort:** ::: regie / Notiz, Satz „… wer die Deckung in B4 schon als Frage gestellt hat, sieht sie dort mitgezählt.“ (Gegenstelle inhalte/story/B4/bauherr.md, option C)

**Befund:** Die Regie-Notiz (L-181) verspricht, dass eine in B4 gestellte Deckungsfrage im B5-Regler unter „ungeklärte Entscheidungen“ mitgezählt wird. Für die Rolle Bauherr stimmt das nicht. B4/bauherr C („Die Deckungsfrage mit Frist auf September legen“) stellt genau diese Frage, wirkt aber nur auf terminrisiko +1 und nicht auf die ungeklärten Entscheidungen. Nachgerechnet mit berechneStatus über alle Wahlen in B1, B2 und B4: Bauherr mit B1 A, B2 A, B4 C startet B5 mit 2 ungeklärten Entscheidungen, genauso viele wie mit B4 A. Die gleichartige Handlung B4/ps C („Die Deckung aus der Risikoreserve als Frage an den Bauherrn benennen“) zählt dagegen mit +1 (mit Frist), ebenso gf A, controlling A und planung A. Gemessene Spannen am B5-Start: bauherr 1–2, pl 1–2, gf/ps/planung/controlling 2–3. Die Gesamtspanne 1–3 in der Notiz stimmt also, nur der Zusatz nicht für jede Rolle.

**Beleg:** Messweg: tmp/r66/tmp/fach-story-b/b5.ts (importiert src/engine/status.ts und src/generiert/inhalte.json, rechnet alle Kombinationen B1/B2/B4 je Rolle bis B5). Ausgabe: „bauherr 2: 12 (z.B. AAA,AAB,AAC) | 1: 15“. Wirkungen: B4/bauherr.md option C `terminrisiko: +1`, B4/ps.md option C `ungeklaerte-entscheidungen: +1 (mit Frist)`. Regel: Widerspruch zwischen zwei Stellen (Regie gegen Anzeige), wie R65 bei derselben Notiz.

**Vorschlag:** Entweder B4/bauherr C auf `ungeklaerte-entscheidungen: +1 (mit Frist)` stellen, so wie ps C (die Frage liegt mit Frist offen beim Bauherrn; das Terminrisiko steht schon in „Neues Risiko“). Oder den Zusatz in der B5-Notiz einschränken: „… wer sie in B4 als Projektsteuerung, Geschäftsführung, Controlling oder Planung als Frage gestellt hat, sieht sie dort mitgezählt; als Bauherr mit Frist gelegt, zählt sie als Terminrisiko.“ Dazu eine Probe in tests/story-graph.test.ts, die die Aussage der Notiz gegen berechneStatus prüft.

## 12. [leicht] fach-story-b · `inhalte/story/B5/station.md`
**Ort:** schritt lage, ::: unbekannt {#reservestand} „Was von den 2,9 Mio. € beansprucht, freigegeben und frei ist“; ebenso inhalte/story/B5/controlling.md option A, Konsequenz

**Befund:** Dieselbe Station nennt unter „bekannt“: „Risikoreserve 2,9 Mio. €, noch nicht eingesetzt; ihren Einsatz gibt nur der Bauherr frei“. In der Vertiefung Kosten steht „sie ist nicht eingesetzt“. In keiner B-Spur gibt der Bauherr vor B5 Reserve frei: ENT-017 lässt die Reserve unberührt (B4, Ebene 2), und die Deckung von AEN-031 ist offen (B5, bekannt). Dass „freigegeben“ unbekannt sein soll, liest sich deshalb gegen die eigene Lage. Offen ist eigentlich nur, was beansprucht ist und was danach frei bleibt.

**Beleg:** B5/station.md: bekannt-Liste und vertiefung kosten gegen unbekannt #reservestand. B4/station.md Ebene 2 „die Risikoreserve blieb unberührt“. fall.md: Freigabe des Einsatzes nur durch den Bauherrn (k3.2-t1).

**Vorschlag:** „Was von den 2,9 Mio. € schon beansprucht ist und was danach frei bliebe“. In controlling A entsprechend „was von 2,9 Mio. € beansprucht und was frei ist“.

## 13. [leicht] abbildungen · `inhalte/abbildungen/abb-6.yaml`
**Ort:** abweichungen[0] (seit R65 neu gefasst, bfabf61)

**Befund:** Die neue Abweichung sagt: „einen MVG-Kern kennt der Text nicht, er nennt die sechs Felder eine Arbeitsstruktur …“. Im Wortlaut stimmt das: „MVG-Kern“ und „Governance-Kern“ kommen in whitepaper.md 0-mal vor. Der Text kennt aber einen Kern an genau dieser Stelle. k7.1-p2 nennt die sechs Verantwortungsfelder selbst das „Kernmodell“ der Bauherrenverantwortung, und k4-t1 gibt jedem Feld einen „Nichtdelegierbaren Kern“. Das Bild setzt einen eigenen Kern in die Mitte und ordnet die sechs Felder darum herum an. Nach dem Text sind die Felder selbst der Kern. Diese Umkehrung beschreibt die Abweichung nur halb. Ein Leser kann zudem schließen, das Kern-Motiv sei dem Text ganz fremd.

**Beleg:** k7.1-p2: „Die sechs Verantwortungsfelder strukturieren als Kernmodell die Bauherrenverantwortung“. k4-t1, Spaltenkopf „Nichtdelegierbarer Kern“. Gemessen mit grep -c „MVG-Kern|Governance-Kern“ in quellen/whitepaper/v1.2/whitepaper.md: 0 Treffer.

**Vorschlag:** Satz ergänzen, etwa: „… einen MVG-Kern in der Mitte kennt der Text nicht; er nennt die sechs Felder selbst das Kernmodell der Bauherrenverantwortung und eine Arbeitsstruktur, mit der …“. Beleg auf „k4-p1 k7.1-p2“ erweitern.

## 14. [mittel] hilfe-begriffe · `src/generiert/hilfe.json`
**Ort:** Seite faq-glossar (Glossar: Zeilen „Zielsystem-Dokument“, „Priorisierung K/T/Q/R/ESG“, „Trade-off-Regeln“) und Seite registerdokument-katalog (dieselben drei Zeilen plus „Entscheidungsvorlage … K/T/Q/R/ESG-Auswirkungen“); Quelle: quellen/hilfe/companion-hilfe-v1.34.911.html, keine Glättung in werkzeuge/hilfe.mjs

**Befund:** Die Hilfe legt das Zielsystem auf „die fünf Dimensionen Kosten, Termine, Qualität, Risiko und ESG“ fest („Begründete Rangfolge der fünf Zieldimensionen“, Abwägung „zwischen K/T/Q/R/ESG“). Das widerspricht V1.2 und auch anderen Stellen der Hilfe selbst. In V1.2 fehlen in dieser Aufzählung Projektumfang und LCC, und die Zahl „fünf“ kommt dort gar nicht vor. Innerhalb der Hilfe nennt der Glossareintrag „Entscheidungsvorlage“ die Wirkung als „Kosten/Termin/Qualität/ESG-LCC/Umfang/Risiko“, das Handbuch beim Änderungsregister „Auswirkungsbewertung (6 Dimensionen)“ und beim Risikoregister „5 Dimensionen: Kosten, Termin, Qualität, Umfang, ESG/LCC“. Die Abweichung steht nicht in docs/KORREKTURLISTE-COMPANION.md und ist in P12-BEFUNDE.md und ENTSCHEIDE.md nicht erwähnt (grep „Dimension“, „Zieldimension“ ohne Treffer).

**Beleg:** k4.3-p1: „… Projektzweck, Zielsystem oder die Dimensionen Kosten, Termin, Qualität, Projektumfang, Risiko und ESG/LCC …“. k5.2-t1 (Baustein Zielsystem und Abwägungsregeln): „… wenn Kosten, Termine, Qualität, ESG, LCC, Risiko und Nutzwert kollidieren“. Die Theorie k04 (inhalte/theorie/k04-verantwortungsfelder.md:260) gibt k4.3-p1 mit sechs Dimensionen wieder. Gemessen mit einem Textauszug aus hilfe.json (tmp/r66/tmp/hb/faq-glossar.txt:156 und 133, registerdokument-katalog.txt:5–7).

**Vorschlag:** Entweder als Zielgrößen der Anwendung kennzeichnen (Glättung „über die Zieldimensionen der Anwendung (Kosten, Termine, Qualität, Risiko, ESG)“, „Rangfolge der Zieldimensionen der Anwendung“) und eine Zeile in die Korrekturliste aufnehmen (Companion: fünf Dimensionen K/T/Q/R/ESG; V1.2: k4.3-p1 bzw. k5.2-t1). Oder „fünf“ streichen und nach k4.3-p1 angleichen. Dazu eine FEST/WEG-Probe im Hilfe-Test.

## 15. [leicht] hilfe-begriffe · `src/generiert/hilfe.json`
**Ort:** Seite rollen-anleitungen-controlling-finance (Kern-Verantwortung und Typische Workflows, auch im Cheat-Sheet); rollen-anleitungen-auftragnehmer-lieferanten (Kern-Verantwortung und Workflows)

**Befund:** Inhaltliche Dubletten der Quelle stehen im Rollenblatt und im Cheat-Sheet. Beim Controlling wird das Monats-CTC dreimal genannt („CTC/Prognose monatlich schließen“, „Monatlich: CTC-Closing für alle Projekte“, „Monatliches CTC-Closing“), die Quartalsprognose zweimal („Quartalsweise: Prognose-Szenarien aktualisieren“, „Quartals-Prognose mit Szenarien“). Beim Auftragnehmer steht der Änderungsantrag dreimal („Change-Requests sauber einreichen“, „Bei Changes: Change-Request einreichen“, „Change-Requests mit Auswirkungen einreichen“). R65 hat nur die LPH-2-Dublette des Lenkungskreises als Dublette der Quelle in die Korrekturliste aufgenommen (Zeile 104). Diese gleichartigen Fälle sind dort nicht vermerkt und auch nicht geglättet.

**Beleg:** Textauszug: tmp/r66/tmp/hb/rollen-anleitungen__rollen-anleitungen-controlling-finance.txt (Kern- und Workflow-Liste), …-auftragnehmer-lieferanten.txt. Vergleich: KORREKTURLISTE-COMPANION.md Zeile 104 (R65, Lenkungskreis: „Quelle doppelt“) und L-181 („die LPH-2-Dublette der Quelle in die Korrekturliste“).

**Vorschlag:** Entweder in der Korrekturliste allgemein vermerken („Rollenblätter: Kern- und Workflow-Listen wiederholen sich teils inhaltlich, Quelle doppelt, belassen“) oder die wortnahen Wiederholungen wie bei der Lenkungskreis-Zeile aus R64 per Glättung mit WEG-Probe streichen.

## 16. [leicht] hilfe-begriffe · `src/generiert/hilfe.json`
**Ort:** Seite handbuch, Abschnitt „Übergabe / Betriebshandbuch“ → Praxistipp; Seite mvg-vorgehensmodell, Phasenmodell „05 Etappe 5 Übergabe“

**Befund:** Die Hilfe nennt zwei verschiedene Dauern für die Übergabe. Im Handbuch steht „Übergabe als 2-Wochen-Prozess planen, nicht als Termin“, im Vorgehensmodell „Etappe 5 · Übergabe … 2-4 Wochen“. Beides sind Angaben der Anwendung, keine MVG-Regel (V1.2 nennt keine Dauer der Übergabe: k8.2-p4 „Die Übergabe schließt an“). Für Lesende widersprechen sie sich trotzdem.

**Beleg:** Textauszug tmp/r66/tmp/hb/handbuch.txt (Praxistipp Übergabe) und mvg-vorgehensmodell.txt (Etappe 5, „2-4 Wochen“). V1.2 k8.2-p4 und k8.2-t1 ohne Dauerangabe für die Übergabe.

**Vorschlag:** Einheitlich fassen (z. B. Praxistipp „Übergabe als mehrwöchigen Prozess planen (Vorgehensmodell der Anwendung: 2–4 Wochen)“) oder als Widerspruch der Anwendung in die Korrekturliste aufnehmen, wie in R64 die „Reaktivierung durch …“.

## 17. [leicht] stil-bildschirm · `src/stil/leitstand.css`
**Ort:** Zeile 470/1308 (.fs-titel, sichtbar ab 1440 px); Story B4 (Rolle pl), Fußleiste Schritt 4 „Beschlusslage“, 1440×800, Seitenleiste zu

**Befund:** Bei 1440 px mit geschlossener Seitenleiste hat der Schritttitel „Beschlusslage“ an B4 kaum Reserve: Der Text ist 77,3 px breit, Platz sind 79,8 px (Knopfbreite minus Innenabstand, Nummer und Lücke). Das sind 96,9 % und damit über der 93-%-Grenze aus L-129. Gegenprobe: Schon mit +0,015 em Laufweite (rund 3 % breiter) wird der Titel gekappt (81,3/79 px, `overflow: hidden`, `text-overflow: clip`), also mitten im Wort. Unter Chrome 153 mit breiterem Satz droht deshalb „Beschlussla…“ ohne Auslassungszeichen. Bei 1480 px sind es 91,2 %, bei 1536 px 85,1 %. An allen übrigen Stationen (A1–A6, Wendepunkt, Rückspulen, B1–B3, B5, B6, Wirklichkeit, Epilog) bleibt bei 1440 px jeder Titel bis +0,015 em ungekappt; „Entscheidung“ steht dort bei 91,1 %. Die Reserve, die L-181 eingeführt hat, gilt nur bei offener Seitenleiste (ab 1800 px). Die Probe `schritttitelBreit` vergleicht bei geschlossener Leiste nur Text mit Kasten, und der Kasten schrumpft auf den Text. Deshalb sieht sie die fehlende Reserve nicht.

**Beleg:** Gemessen mit Chromium 141 an file:///…/dist/mvg.html#story/B4, Stand per standVor('pl','B4') aus localStorage. Je `.fortschritt-schritt`: Platz = clientWidth − padding − Breite von .fs-nr − column-gap von .fs-zeile, Text = Range-Breite von .fs-titel (12 px). Ergebnis 1440 px: Beschlusslage 77,3/79,8 = 96,9 %, Entscheidung 73,3/80,4 = 91,1 %. Laufweiten-Gegenprobe: letter-spacing +0,01 em ungekappt, +0,015 em gekappt (Skripte tmp/r66/tmp/stil/b4b.mjs und b4c.mjs). Regel L-129: ungeteiltes Wort über 93 % der Zeile ist ein Bruchrisiko unter Chrome 153. L-181: eine 94-%-Probe taugt nicht, weil der Titel auf seinen Text schrumpft.

**Vorschlag:** Die Reserve wie in L-181 auch für die geschlossene Leiste festlegen: Titel erst sichtbar, wenn der längste Titel einer Station höchstens 93 % seines Platzes braucht. Zum Beispiel ab 9 Schritten erst ab 1480 px, oder der Kurztitel „Beschluss“. In `schritttitelBreit` den Platz wie oben (Knopf minus Nummer) statt `clientWidth` des Titels messen und bei 1440 px an B4 höchstens 93 % verlangen. Gegenprobe ist der heutige Stand (96,9 % → rot).

## 18. [mittel] architektur · `tests/oberflaeche/theorie.szenario.mjs`
**Ort:** Z. 475–477 (R65-Probe „Alles drucken: Seite nur Tabellenkopf und Rest“, Filter `x.z.length <= 4 && /^[A-ZÄÖÜ][A-ZÄÖÜ /–-]{5,}$/u`)

**Befund:** Laut Kommentar und L-181 sichert die Probe den Theorie-Druck für k1.3-t1 und k10.5-t1. Tatsächlich erkennt sie nur k1.3-t1. Der Kopf von k10.5-t1 lautet im PDF „ENTSCHEIDUNGS PROBLEM WARUM ES KRITISCH IST BM-ARTEFAKT BZW. ROUTINE“. Der Punkt in „BZW.“ liegt außerhalb der Zeichenklasse, deshalb fällt diese Seite durch den Filter. Gemessen: Mutant M6 (R65-Regel in theorie.css gestrichen) erzeugt Seite 172 mit genau 4 Zeilen, nämlich Kopf von k10.5-t1 und letzte Zeile „MVG-Neuinitialisierung ohne eindeutigen Datenstand …“. Die Probe meldet aber nur Seite 12 (k1.3-t1). Mutant M10 schränkt die Regel auf zweispaltige Tabellen ein (`table:not(:has(th:nth-child(3))) tbody tr:last-child:not(:first-child)`). Er bringt genau diesen Fehler auf Seite 172 zurück (Kopf und Rest, 4 Zeilen), und `--szenario theorie` bleibt grün. Die Mutation überlebt also, und sie hat echte Wirkung. Dazu ein Vorsorge-Punkt: Die Grenze von ≤ 4 Zeilen übersieht jeden Rest, dessen letzte Zeile im Druck mehr als 3 Zeilen umbricht.

**Beleg:** Messweg: Worktree r66-mut auf 43329ae. `node werkzeuge/bau.mjs --ziel tmp/m10.html`, dann `node werkzeuge/oberflaeche.mjs --szenario theorie --nur-desktop --datei tmp/m10.html` ergibt exit 0, „✓ theorie @ 1280×720“. Eine Kopie des Szenarios gibt alle PDF-Seiten mit ≤ 8 Zeilen aus und zeigt für m10 und m6: {s:172, n:4, z0:"ENTSCHEIDUNGS PROBLEM WARUM ES KRITISCH IST BM-ARTEFAKT BZW. ROUTINE"}. Im Basisstand hat Seite 172 n=6 (zwei Zeilen). Quelle der Tabelle: whitepaper.md Z. 777 `<!-- id: k10.5-t1 -->`. Regel: Ein Test prüft nicht, was er behauptet (mittel).

**Vorschlag:** Die Kopfzeilen der Druck-Tabellen aus dem DOM lesen, so wie es `koepfeAlle` schon tut (thead-Text ohne Leerraum). Danach eine Seite melden, deren erste Zeile einem thead entspricht und auf der nur die Zeilen der letzten tbody-Zeile folgen. Das Zeilenmaß dafür aus dem DOM nehmen statt fest ≤ 4. Mindestens die Zeichenklasse um `.` und Ziffern erweitern und die Zeilengrenze lockern. Als Gegenprobe einen Mutanten nur gegen k10.5-t1 rot sehen.
