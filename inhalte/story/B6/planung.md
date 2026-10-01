---
station: B6
rolle: planung
frage: "Freigabe LPH 5 durch den Bauherrn: Was liefern Sie?"
rueckbezug-auf: A6
---

::: option A
---
titel: Die Planungsgrundlagen vollständig liefern, offene Punkte mit Vorschlag für Auflagen
kurz: Grundlagen mit Auflagenvorschlag
status:
  entscheidungsfaehigkeit: +1
---
### Konsequenz
Die Bauherren-PL übernimmt die Unterlagen in ihre Vorlage. Dr. Olbers kann entscheiden: Freigabe, keine Freigabe oder Freigabe mit Auflagen.

### Was fehlt
Nichts für die Vorlage; die Entscheidung trifft der Bauherr selbst.

### Neues Risiko
Auflagen brauchen eine verantwortliche Rolle und eine Frist.

### Governance-Frage
[[Freigabe]]: Welche Mindestgrundlagen braucht die Freigabe zum Abschluss von LPH 5?
:::

::: option B
---
titel: Um Verschiebung bitten, bis alle Fachplanungen abgeschlossen sind
kurz: Verschiebung erbitten
status:
  terminrisiko: +1
---
### Konsequenz
Die Bauherren-PL nimmt Ihre Bitte in die Vorlage auf; nach der Beratung im Lenkungskreis entscheidet Dr. Olbers.

### Was fehlt
Eine Begründung, welcher offene Punkt den Abschluss tatsächlich hindert.

### Neues Risiko
Der Termin rutscht für Punkte, die auch Auflagen sein könnten.

### Governance-Frage
[[Freigabe]]: Wer entscheidet, ob ein offener Punkt die Freigabe hindert?
:::

::: option C
---
titel: Eine letzte Optimierung noch vor der Freigabe einbringen
kurz: Letzte Optimierung einbringen
status:
  ungeklaerte-entscheidungen: +1
---
### Konsequenz
Die Optimierung wird als `AEN-041` beantragt. Sie geht nicht in den Datenstand der Freigabe ein; Grundlage der Freigabe bleibt der benannte Stand ohne sie.

### Was fehlt
Eine Auswirkungsbewertung für `AEN-041`.

### Neues Risiko
Eine Änderung, die gleich nach der Entscheidung über die Freigabe ansteht.

### Governance-Frage
[[Datenstand]]: Auf welchem Stand wird freigegeben – und was kommt danach?
:::

::: rueckbezug A
In Welt A haben Sie ‚Abschluss melden‘ gewählt. In Welt B reicht keine Liste: Die Freigabe beruht auf Kernfrage, Mindestgrundlagen, Mandat und benanntem Datenstand.
:::

::: rueckbezug B
In Welt A haben Sie ‚Abschluss zurückhalten‘ gewählt. In Welt B hängt der Abschluss nicht an unbeauftragten Änderungen: Jede steht mit Status und Beschlusslage im Änderungsregister.
:::

::: rueckbezug C
In Welt A haben Sie ‚Kostenstand mit abgleichen‘ gewählt. In Welt B ist eine Stellvertretung benannt, und die Annahmen stehen im benannten Datenstand; Ihre Mengen gehen den regulären Weg.
:::

::: rueckbezug ohne
In Welt A hing die Freigabe an Holger Steins Excel-Ständen. In Welt B tragen Register, Datenstand und Stellvertretung.
:::

::: regie
### Notiz
Die Generalplanung liefert die Planungsgrundlagen. Zeigen, dass eine späte Optimierung eine eigene Änderung wird und nicht in den Freigabestand rutscht.

### Leitfragen
- Was liefert Ihre Planung zur Freigabe am Abschluss einer Leistungsphase?
- Wie gehen Sie mit Änderungen kurz vor einer Freigabe um?
:::
