---
station: B5
rolle: pl
frage: Wie bringen Sie PRB-004 zur Entscheidung?
rueckbezug-auf: A5
---

::: option A
---
titel: Eine Entscheidungsvorlage zum Einsatz der Risikoreserve vorlegen
kurz: Vorlage an den Bauherrn
status:
  ungeklaerte-entscheidungen: -1
---
### Konsequenz
Die Projektsteuerung bereitet die Vorlage vor, Sie legen sie Dr. Olbers vor. Ob sie den Einsatz freigibt, entscheidet Dr. Olbers; Datum, Betrag und Datenstand ihrer Entscheidung stehen im Entscheidungsregister.

### Was fehlt
Ein Blick darauf, wie viel Reserve danach bleibt.

### Neues Risiko
Spätere Risiken treffen auf einen kleineren Puffer.

### Governance-Frage
Risikoannahme: Wie viel Reserve will der Bauherr für die nächsten Leistungsphasen halten?
:::

::: option B
---
titel: Den Nachtrag zuerst von der Projektsteuerung auf Berechtigung und Höhe prüfen lassen
kurz: Nachtrag erst prüfen lassen
status:
  terminrisiko: +1
---
### Konsequenz
Die Projektsteuerung prüft, die Planung liefert die fachliche Auswirkung zu. Zwei Wochen später ist die Summe belegt und kleiner. Die Vorlage an Dr. Olbers kommt eine Sitzung später.

### Was fehlt
Eine Frist für die Prüfung in der Maßnahme zu `PRB-004`.

### Neues Risiko
Die TGA-Fachplanung wartet auf eine Antwort.

### Governance-Frage
[[Entscheidungsreife]]: Wann ist die Vorlage belastbar genug?
:::

::: option C
---
titel: Mit Aylin Kaya eine Deckung ohne Risikoreserve suchen
kurz: Deckung ohne Reserve suchen
status:
  ungeklaerte-entscheidungen: +1
---
### Konsequenz
Aylin Kaya findet in anderen Positionen einen Teil der Summe. Der Rest bleibt ein Thema für die Reserve – aus einer Entscheidung werden zwei.

### Was fehlt
Klarheit, welche Stufe über eine solche Umschichtung entscheidet.

### Neues Risiko
Puffer in anderen Positionen fehlen später.

### Governance-Frage
[[Mandat]]: Welche Stufe entscheidet über eine Umschichtung zwischen Positionen?
:::

::: rueckbezug A
In Welt A haben Sie ‚Nachträglich legitimieren‘ gewählt. In Welt B gibt es nichts nachträglich zu legitimieren: Der Einsatz der Risikoreserve wird vorher beim Bauherrn beantragt, auf einem benannten Datenstand.
:::

::: rueckbezug B
In Welt A haben Sie ‚Kosten verschieben‘ gewählt. In Welt B steht der Nachtrag als `PRB-004` im Problemregister, mit Maßnahme und Entscheidungsbedarf – dort lässt er sich nicht still verschieben.
:::

::: rueckbezug C
In Welt A haben Sie ‚Lage offenlegen‘ gewählt. In Welt B muss nichts eigens offengelegt werden: `PRB-004` hat eine verantwortliche Rolle, eine Maßnahme und einen Weg zur Entscheidung.
:::

::: rueckbezug ohne
In Welt A liefen Posten gegen die Risikoreserve, ohne dass jemand ihren Einsatz freigegeben hatte. In Welt B gibt der Bauherr ihren Einsatz frei – vorher, auf Vorlage.
:::

::: regie
### Notiz
Die Bauherren-PL bringt `PRB-004` zur Entscheidung: Die Projektsteuerung prüft den Nachtrag, die Planung liefert die fachliche Auswirkung zu, der Bauherr gibt die Reserve frei.

### Leitfragen
- Wer prüft bei Ihnen Nachträge auf Berechtigung und Höhe?
- Wie viel Reserve wollen Sie für die nächsten Leistungsphasen halten?
:::
