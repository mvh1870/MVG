---
id: B4
welt: B
monat: 7
titel: Gremium-Szene
lph: 5
uhr: Donnerstag, 10:00 Uhr
whitepaper-bezug: [k6.4.1-p4, k6.4.5-t1, k4.3-p1, k4.3-p2, k4.2-p3, k9.4-l1, k9.4-p3, k6.4.4-p1, k3.2-t1, k6.4.3-p2, k4.6-p2]
status-start:
  entscheidungsfaehigkeit: 4
  kostenunsicherheit: mittel
  offene-risiken: 7
  ungeklaerte-entscheidungen: 1
  terminrisiko: mittel
partner: A4
weiter: B5
---

::: schritt einstieg
---
titel: Donnerstag, 10:00 Uhr. Monat 7.
kurz: Einstieg
---
Donnerstag, 9. Juli. Das Änderungsgremium tagt. Seit Juni liegt die Baugenehmigung vor – mit Brandschutzauflagen zum Holzbau. Die Planänderung `AEN-031`, grob 0,4 Mio. €, liegt als Vorlage auf dem Tisch.

::: protokoll
---
titel: Änderungsgremium – Tagesordnung Juli
datum: Do, 09.07.2026
von: petersen
---
- `AEN-031` Brandschutzauflagen Holzbau: Vorlage von Projektsteuerung und Planung.
- Teilnahme: Frank Deppe (Vorsitz), Bauherren-PL, Aylin Kaya.
- Beschlusslage → Managementbericht an den Bauausschuss (16.07.).
:::

::: datei
---
name: Änderungsregister · AEN-031 · Brandschutzauflagen Holzbau
quelle: Bauherren-PL
wert: In Prüfung · Vorlage liegt vor
---
Planänderung aufgrund der Auflagen aus der Baugenehmigung; Kosten nach grober Schätzung der Generalplanung.
:::

::: chat
---
von: brenner
zeit: "09:41"
---
Vorlage zu `AEN-031` ist verteilt. Die Terminwirkung ist nur grob geschätzt – so steht es auch drin.
:::

::: datei
---
name: Managementbericht Juli · Entwurf
quelle: Bauherren-PL mit Controlling und PMO
wert: für den Bauausschuss am 16.07. · Beschlusslage folgt
---
Ein Bericht für die Gremien, mit Kennungen, Status und Beschlussvorbereitung.
:::
:::

::: schritt vergleich
---
art: vergleich
titel: Welt A ⟷ Welt B
kurz: Welt A ⟷ B
knopf: Welt B ansehen
---
::: hinweis
Dieselben Auflagen – in Welt B liegen sie vorher beim Gremium mit Mandat.
:::

::: paar
---
a: datei
b: bericht
fluss: managementbericht
---
### Welt A
**40 Seiten** · Statusbericht Juni, Ampeln ohne Frage

### Welt B
Managementbericht · Beschlusslage und Beschlussvorbereitung
:::

::: paar
---
a: chat
von: petersen
b: register
kennung: AEN-031
fluss: entscheidung
---
### Welt A
Tischvorlage Brandschutz – mit zum Statusbericht ablegen?

### Welt B
Brandschutzauflagen Holzbau · In Prüfung
:::

::: paar
---
a: notiz
farbe: gelb
b: mandat
---
### Welt A
Brandschutz 0,4 Mio. € – wer entscheidet bis September?

### Welt B
Mandatsleiter · über 100 TEUR · Änderungsgremium
:::

::: paar
---
a: notiz
farbe: rosa
b: vorlage
---
### Welt A
Welche Frage stellen wir dem Ausschuss?

### Welt B
Vorlage zu `AEN-031` · Entscheidungsfrage vorn
:::

::: kennzahl
---
a: 0
b: 1
---
Entscheidungsfragen auf dem Tisch
:::

::: kennzahl
---
a: 1
b: 0
---
Vertagungen ohne Entscheidungsfrage
:::

### Welt A
Welt A: ein Bericht ohne Frage, eine Tischvorlage ohne Ort und die Frage nach der Zuständigkeit auf einer Haftnotiz.

### Welt B
Welt B: dieselben Auflagen als Änderung mit Kennung, ein Gremium mit Mandat, eine Vorlage mit Frage – und ein Managementbericht, der die Beschlusslage trägt.
:::

::: schritt gremium
---
titel: Im Änderungsgremium – AEN-031
kurz: Gremium
---
::: mandatsleiter
---
betrag: grob 0,4 Mio. €
betrag-teur: 400
stufen:
  - wer: Bauherren-PL
    bereich: bis einschließlich 100 TEUR
    bis-teur: 100
  - wer: Änderungsgremium
    bereich: über 100 TEUR bis einschließlich 5 Mio. €
    bis-teur: 5000
  - wer: Bauherr
    bereich: über 5 Mio. € – Beschluss im Lenkungskreis
    hinweis: "Risikoreserve: nur Bauherr"
---
`AEN-031` · Auf welcher Stufe liegt die Planänderung?
:::

::: mandatsoption 1
---
titel: Planänderung Brandschutz
detail: "Änderung AEN-031 · Status In Prüfung"
zustaendig: Änderungsgremium
stufe: 2
---
Über 100 TEUR bis einschließlich 5 Mio. €: Änderungsgremium. Den Einsatz der Risikoreserve gibt nur der Bauherr frei.
:::

::: vorlage AEN-031
---
titel: Vorlage zur Änderung
datenstand: Kostenprognose 2026-05 · Version 3 · Schätzung der Generalplanung, Stand Juli
---
### Frage
„Wie werden die Brandschutzauflagen aus der Baugenehmigung in der Ausführungsplanung umgesetzt?“

### Checkliste
- [x] eindeutige [[Entscheidungs-ID]] · `AEN-031`
- [x] Entscheidungsfrage
- [x] betroffene Freigabe · Freigabe zum Abschluss von LPH 5
- [x] Verantwortungsfeld · Freigabe (Änderung)
- [x] Mandat und letztverantwortliche Rolle · Änderungsgremium
- [x] Datenstand und zentrale Annahmen · Schätzung der Generalplanung
- [ ] Optionen und Konsequenzen · nur eine Ausführung, keine Varianten
- [ ] Wirkung auf Kosten, Termin, Qualität, Projektumfang, Risiko und ESG/LCC · Kosten und Termin grob, Rest offen
- [x] Empfehlung · Projektsteuerung und Planung
- [x] Freigabe- oder Eskalationsweg · Änderungsgremium; Deckung aus der Risikoreserve: Bauherr
- [ ] Freigabeprozess (sechsstufig, jede Stufe wird signiert): offen → in Prüfung → vorbereitet → freigegeben → beschlossen | abgelehnt · Stand der Vorlage: freigegeben zur Sitzung
- [ ] Beschlusslage · wird in der Sitzung dokumentiert
- [ ] Nachverfolgung
:::

::: merksatz
**Die Auflage steht fest, die Umsetzung wird entschieden:** mit Kennung, Stufe und Frage.
:::
:::

::: schritt bericht
---
titel: Vom Gremium in den Managementbericht
kurz: Beschlusslage
---
Beschluss oder Zurückstellung stehen im Protokoll; der Managementbericht sammelt sie für den Bauausschuss.

::: protokoll
---
titel: Änderungsgremium – Beschlussprotokoll Juli (Entwurf)
datum: Do, 09.07.2026
von: petersen
---
- `AEN-012` Mensa, `AEN-022` Fassade · Beschlossen · unverändert.
- `AEN-031` Brandschutzauflagen · Beschluss: wird in der Sitzung eingetragen
- Bei Zurückstellung: Frage · Frist · verantwortliche Rolle; Aufträge: Rolle · Frist
- Weiter an: Managementbericht, 16.07.
:::

::: tafel k6.4.5-t1
---
form: rhythmus
hervor: [3, 4, 5]
---
:::
:::

::: schritt lage
---
art: lage
titel: Was Sie wissen, und was nicht
kurz: Was Sie wissen
knopf: Jetzt entscheiden
---
::: datei
---
name: Änderungsregister · AEN-031 · Brandschutzauflagen Holzbau
quelle: Bauherren-PL
wert: In Prüfung · Vorlage liegt vor
---
:::

::: bekannt
- `AEN-031`: „In Prüfung“, grob 0,4 Mio. € nach Schätzung der Generalplanung.
- Zuständig ist das Änderungsgremium.
- In der Vorlage sind Kosten und Termin nur grob geschätzt.
- `ENT-017` (Fassade) ist im Juni entschieden: Änderung `AEN-022`, Risikoreserve unberührt.
:::

::: unbekannt
- Wie sich die Planänderung auf den Termin auswirkt {#terminwirkung}
- Wie belastbar die Kostenschätzung ist {#kosten}
- Ob es eine günstigere Ausführung der Auflagen gibt {#variante}
- Woher die Deckung kommt {#deckung}
:::
:::

::: schritt rueckbezug
---
art: rueckbezug
titel: Damals in Welt A
kurz: Rückbezug
---
:::

::: schritt entscheidung
---
art: entscheidung
titel: Was tun Sie?
kurz: Entscheidung
---
:::

::: schritt konsequenz
---
art: konsequenz
titel: Was Ihre Wahl auslöst
kurz: Konsequenz
---
:::

::: schritt ebenen
---
art: ebenen
titel: Vier Ebenen – vom Satz zum Nachweis
kurz: Tiefer gehen
---
:::

::: ebenen
::: ebene 1
---
titel: Kernaussage
---
Über `AEN-031` entscheidet, wer das Mandat hat: das Änderungsgremium, auf einer Vorlage mit Frage und Datenstand. Der Managementbericht sammelt für die Gremien.
:::

::: ebene 2
---
titel: Warum relevant
---
Im Juni hat das Gremium `ENT-017` entschieden: Die Fassade wird als Änderung `AEN-022` angepasst – auf der ergänzten Vorlage und nachdem Dr. Olbers die Zielpriorität für diesen Konflikt festgelegt hatte; die Risikoreserve blieb unberührt. Nun die nächste Änderung: Dieselben Auflagen wie in Welt A, derselbe Ausschusstermin – aber bevor der Bauausschuss tagt, liegt die Frage schon bei der Stelle mit dem Mandat. Die Planänderung hat eine Kennung, ihr Betrag eine Stufe auf der Mandatsleiter, die Vorlage eine Frage. Kap. 4.3 sagt, wozu das dient: [[zitat:k4.3-p2|Das System der Entscheidungs-IDs verhindert, dass kritische Entscheidungen in Protokollen, E-Mails, Fachrunden oder informellen Abstimmungen verschwinden.]] Offen ist auch hier etwas – die Terminwirkung ist grob geschätzt, die Deckung nicht geklärt. Aber beides steht in der Vorlage.
:::

::: ebene 3
---
titel: Vertiefung
---
| Baustein | Kapitel | In B4 sichtbar |
|---|---|---|
| Mandatsleiter | 4.2 | Grob 0,4 Mio. € liegen über 100 TEUR und bis einschließlich 5 Mio. € – Änderungsgremium |
| Kennung mit Datenstand, Rolle, Frage und Status | 4.3 | `AEN-031` im Änderungsregister, Status „In Prüfung“ |
| Managementbericht als Sammelpunkt | 6.4.1 | Bericht an den Bauausschuss mit Beschlusslage und Beschlussvorbereitung |
| Rhythmus | 6.4.5 | Änderungsgremium monatlich, zzgl. anlassbezogener Sondersitzungen |
| [[Entscheidungsvorlage]] | 9.4 | Checkliste zu `AEN-031`: was erfüllt ist und was offen |
| Nicht delegierbar | 3.2 | Festlegung der Mandatsleiter und Freigabe des Einsatzes der Risikoreserve – beide beim Bauherrn |

Die Statusbegriffe der Änderung (Kap. 6.4.4) – Beantragt, In Prüfung, Beschlossen, Abgelehnt, Umgesetzt – bleiben vom Freigabeprozess getrennt.
:::

::: ebene 4
---
titel: Nachweis
---
::: zitat k6.4.1-p4
Der Managementbericht – der aggregierte Gremienbericht – ist der gemeinsame Sammelpunkt für Gremien; das Entscheidungsregister ist nur die Warteschlange für echte Entscheidungen.
:::

::: zitat k9.4-p3
Damit wird die Entscheidung nicht schwerer, sondern belastbarer. Ein guter Standard für Entscheidungsvorlagen reduziert Unklarheit, weil er früh festlegt, welche Informationen wirklich entscheidungsrelevant sind.
:::
:::
:::

::: vertiefung kosten
---
titel: Zwei Fragen, zwei Stufen
---
Grob 0,4 Mio. € schätzt die Generalplanung für die Planänderung. Über die Änderung entscheidet das Änderungsgremium; woher die Deckung kommt, ist eine eigene Frage. Kommt sie aus der Risikoreserve, liegt sie beim Bauherrn: Kap. 3.2 zählt zur nicht delegierbaren Verantwortung die [[zitat:k3.2-t1|Freigabe des Einsatzes der Risikoreserve]].
:::

::: vertiefung organisation
---
titel: Wer am Tisch sitzt
---
Im Änderungsgremium sitzen Frank Deppe (Vorsitz), die Bauherren-PL und Aylin Kaya, bei Nutzerthemen auch Sabine Roth; Projektsteuerung und Planung bereiten vor. Das Mandat folgt der Mandatsleiter aus Kap. 4.2: [[zitat:k4.2-p3|oberhalb von 100 TEUR bis einschließlich 5 Mio. EUR entscheidet das Änderungsgremium]]. Die Stufen hat der Bauherr festgelegt; das Gremium entscheidet in seinem Mandat.
:::

::: vertiefung risiko
---
titel: Die Auflage gilt, die Umsetzung ist offen
---
Die Vorlage beziffert die Terminwirkung bisher grob – ob die Planänderung die ohnehin lange Lieferzeit der Holzbauelemente berührt, weiß noch niemand. Kap. 6.4.3 sagt, was eine Vorlage leisten soll: [[zitat:k6.4.3-p2|Die Entscheidungsvorlage bündelt Frage, Datenstand, Optionen, Bewertung und Empfehlung.]] Die Bewertung der Terminwirkung ist der offene Teil.
:::

::: vertiefung freigaben
---
titel: Beschluss heute, Freigabe LPH 5 im November
---
Über `AEN-031` entscheidet das Änderungsgremium. Die Freigabe zum Abschluss von LPH 5 steht im November an; dann zählt, welche Änderungen seit der letzten Freigabe aufgenommen wurden. Kap. 4.6 fragt danach, und das Beschlussprotokoll dieser Sitzung liefert die Antwort: [[zitat:k4.6-p2|Welche Beschlusslage besteht?]]
:::

::: standpunkt gf
---
figur: deppe
---
„Grob 0,4 Mio. € – das liegt in unserem Mandat. Heute will ich einen Beschluss oder eine Frage mit Frist, nichts dazwischen.“
:::

::: standpunkt bauherr
---
figur: olbers
---
„Im Änderungsgremium sitze ich nicht. Am 16. will der Ausschuss wissen, was beschlossen ist – und was bei mir landet.“
:::

::: standpunkt pl
---
figur: sie
---
„Die Vorlage hat eine Frage und einen Datenstand. Die Terminwirkung ist grob geschätzt – reicht das für einen Beschluss?“
:::

::: standpunkt ps
---
figur: brenner
---
„Kosten grob, Termin grob, beides steht in der Vorlage. Bis zum Managementbericht brauche ich die Beschlusslage.“
:::

::: standpunkt planung
---
figur: hoffmeister
---
„Die Auflage gilt, daran ändert keiner etwas. Wie wir sie umsetzen, entscheidet das Gremium – eine Idee für eine günstigere Ausführung hätte ich.“
:::

::: standpunkt controlling
---
figur: kaya
---
„0,4 Mio. € in der Vorlage. Auf welche Kostengruppen – und woher kommt das Geld?“
:::

::: nachweis
---
mandat: Änderungsgremium unter Vorsitz von Frank Deppe – grob 0,4 Mio. € liegen über 100 TEUR und bis einschließlich 5 Mio. €.
freigabe: Betroffen ist die Freigabe LPH 5; eine Deckung aus der Risikoreserve gibt nur der Bauherr frei.
kennung: AEN-031 · Brandschutzauflagen Holzbau, Status „In Prüfung“.
datenstand: Kostenprognose 2026-05 · Version 3 mit Schätzung der Generalplanung zu AEN-031, Stand Juli.
nachweis: Vorlage mit Frage, Mandat und Empfehlung; die Terminwirkung ist nur grob geschätzt.
beschlusslage: Beschlussprotokoll der Sitzung vom 9. Juli (Entwurf) – ob beschlossen oder mit Frist zurückgestellt, trägt das Gremium ein; es geht in den Managementbericht an den Bauausschuss (16. Juli).
---
:::

::: regie
### Notiz
B4 zeigt dasselbe Ereignis wie A4 – dieselben Auflagen, derselbe Ausschusstermin. Der Leser sitzt im Änderungsgremium (Rollen gf, pl, controlling stimmen mit; ps und planung bereiten vor; der Bauherr sitzt nicht darin und bekommt die Beschlusslage). Das Beschlussprotokoll bleibt ein Entwurf: Ob das Gremium beschließt, mit Auftrag beschließt oder mit Frist zurückstellt, entscheidet die Rolle. Beschluss und Deckung trennen – die Freigabe des Einsatzes der Risikoreserve ist Thema von B5. Zuerst den Regler zeigen, dann Mandatsleiter und Vorlage.

### Leitfragen
- Was liegt Ihrem Gremium vor: eine Vorlage mit Frage oder ein Bericht?
- Wie stellt Ihr Gremium zurück – mit Frage, Frist und verantwortlicher Rolle?
- Wo trennen Sie bei Ihnen den Beschluss über eine Änderung von der Freigabe ihrer Deckung?
:::
