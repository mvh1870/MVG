---
station: B5
rolle: ps
frage: PRB-004 ist eingetreten und berührt die Reserve. Was tragen Sie bei?
rueckbezug-auf: A5
---

::: option A
---
titel: Das Risikoregister nachziehen und die Restrisiken neu bewerten
kurz: Risiken neu bewerten
status:
  offene-risiken: -1
---
### Konsequenz
Das Risikoregister wird mit `PRB-004` verknüpft; die Restrisiken sind neu bewertet, jedes mit nächstem Schritt.

### Was fehlt
Die Freigabe des Einsatzes der Risikoreserve steht noch aus.

### Neues Risiko
Eine saubere Risikolage mit offener Deckungsfrage.

### Governance-Frage
Risikoannahme: Welche Restrisiken muss die verbleibende Reserve tragen?
:::

::: option B
---
titel: Reservestand und Restrisiken für die Vorlage an Dr. Olbers zuarbeiten
kurz: Reservevorlage zuarbeiten
status:
  entscheidungsfaehigkeit: +1
---
### Konsequenz
Die Vorlage zeigt Reservestand, Bedarf aus `PRB-004` und die Restrisiken. Die Bauherren-PL legt vor; Dr. Olbers entscheidet selbst über den Einsatz.

### Was fehlt
Die Terminwirkung des Nachtrags ist noch nicht bewertet.

### Neues Risiko
Kostenfrage geklärt, Terminfrage offen.

### Governance-Frage
[[Entscheidungsvorlage]]: Welche Grundlagen braucht der Bauherr für die Freigabe der Reserve?
:::

::: option C
---
titel: Die Terminwirkung des Nachtrags bewerten und eine Maßnahme vorschlagen
kurz: Terminwirkung bewerten
status:
  terminrisiko: -1
---
### Konsequenz
Die Terminwirkung von `PRB-004` ist bewertet; die vorgeschlagene Maßnahme steht mit Rolle und Frist im Maßnahmenregister.

### Was fehlt
Der Reservestand für die Vorlage an den Bauherrn.

### Neues Risiko
Die Freigabe der Reserve verzögert sich um einen Monat.

### Governance-Frage
[[Nichtdelegierbare Bauherrenverantwortung]]: Bis wann braucht der Bauherr die Vorlage zur Reserve?
:::

::: rueckbezug A
In Welt A haben Sie ‚Reserve einrechnen‘ gewählt. In Welt B wird die Reserve nicht still verbraucht: Ihr Einsatz braucht die Freigabe des Bauherrn, und die Vorlage zeigt, was danach übrig ist.
:::

::: rueckbezug B
In Welt A haben Sie ‚Reserveverbrauch offenlegen‘ gewählt. In Welt B landet die Tabelle nicht im Anhang einer Mail: Sie ist Teil einer Vorlage, über die Dr. Olbers entscheidet.
:::

::: rueckbezug C
In Welt A haben Sie ‚Mehrkosten getrennt ausweisen‘ gewählt. In Welt B gibt es keinen Streit um die Rechnung: Es gilt ein Datenstand, und das Problem steht mit Kennung im Problemregister.
:::

::: rueckbezug ohne
In Welt A liefen im September Posten gegen die Reserve, ohne Freigabe. In Welt B entscheidet der Bauherr, bevor sie eingesetzt wird.
:::

::: regie
### Notiz
Die Projektsteuerung prüft den Nachtrag auf Berechtigung und Höhe. Die Wahl hier: was sie außerdem beiträgt – Risikolage, Reservestand oder Terminwirkung.

### Leitfragen
- Wer bewertet bei Ihnen die Restrisiken nach einem Einsatz der Reserve?
- Wie schnell kommt eine Terminwirkung bei Ihnen ins Register?
:::
