---
station: B5
rolle: bauherr
frage: Die Vorlage zur Risikoreserve für PRB-004 ist in Vorbereitung; der Nachtrag ist nicht abschließend geprüft. Wie entscheiden Sie?
rueckbezug-auf: A5
---

::: rueckbezug A
In Welt A haben Sie ‚Nachträglich freigeben‘ gewählt. In Welt B geben Sie vorher frei – auf einer Vorlage mit benanntem Datenstand.
:::

::: rueckbezug B
In Welt A haben Sie ‚Reserve sperren‘ gewählt. In Welt B braucht es keine Sperre: Ohne Ihre Freigabe wird die Reserve nicht eingesetzt.
:::

::: rueckbezug C
In Welt A haben Sie ‚Offenlegen‘ gewählt. In Welt B ist nichts offenzulegen, was verborgen war: `PRB-004` steht im Register, und der Managementbericht zeigt es den Gremien.
:::

::: rueckbezug ohne
In Welt A war die Reserve verplant, bevor jemand fragte. In Welt B liegt die Frage bei Ihnen, bevor ein Euro fließt.
:::

::: option A
---
titel: Den Einsatz auf dem benannten Datenstand freigeben
kurz: Einsatz freigeben
status:
  ungeklaerte-entscheidungen: -1
---
### Konsequenz
Sie geben den Einsatz der Risikoreserve frei; Nachweis im Entscheidungsregister, die verbleibende Reserve ist ausgewiesen.

### Was fehlt
Die abschließende Prüfung von Berechtigung und Höhe – die Grundlagen der Vorlage sind unvollständig.

### Neues Risiko
Die Reserve ist kleiner geworden; das Restrisiko muss neu bewertet werden.

### Governance-Frage
[[Nichtdelegierbare Bauherrenverantwortung]]: Welche Risikoexposition akzeptieren Sie mit der kleineren Reserve?
:::

::: option B
---
titel: Einen Teilbetrag freigeben, den Rest nach Prüfung des Nachtrags
kurz: Teilweise freigeben
status:
  kostenunsicherheit: +1
---
### Konsequenz
Sie geben frei, was belegt ist, den Rest nach der Prüfung durch die Projektsteuerung. `PRB-004` bleibt mit Frist offen.

### Was fehlt
Die Prüfung des Nachtrags durch die Projektsteuerung und eine zweite Vorlage.

### Neues Risiko
Zwei Freigaben für ein Problem; die Nachverfolgung muss beide zusammenhalten.

### Governance-Frage
[[Entscheidungsreife]]: Welcher Teil ist heute entscheidungsreif – und welcher nicht?
:::

::: option C
---
titel: Die Freigabe ablehnen und eine Deckung ohne Reserve verlangen
kurz: Freigabe ablehnen
status:
  ungeklaerte-entscheidungen: +1
---
### Konsequenz
Die Vorlage geht zurück. Das Controlling sucht Umschichtungen im Budget; das verändert Kosten und Projektumfang an anderer Stelle.

### Was fehlt
Eine Entscheidung über die Umschichtung auf der zuständigen Mandatsebene.

### Neues Risiko
Die Reserve bleibt unberührt, aber die Lücke wandert in andere Posten.

### Governance-Frage
[[Mandat]]: Ist die Umschichtung selbst eine Entscheidung – und wessen?
:::

::: regie
### Notiz
Das ist der Moment des Bauherrn: Die Freigabe des Einsatzes der Risikoreserve ist nicht delegierbar. Jede Option ist hier eine echte Entscheidung – auf Vorlage.

### Leitfragen
- Auf welcher Grundlage haben Sie zuletzt Reserve freigegeben?
- Wer bewertet bei Ihnen das Restrisiko danach?
:::
