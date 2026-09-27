---
station: B6
rolle: planung
frage: Die Freigabe zum Abschluss von LPH 5 wird vorbereitet. Was liefert die Generalplanung?
rueckbezug-auf: A6
---

::: option A
---
titel: Die Planungsgrundlagen vollständig liefern, offene Punkte mit Vorschlag für Auflagen
kurz: Grundlagen mit Auflagenvorschlag
status:
  ungeklaerte-entscheidungen: -1
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
Die Bauherren-PL nimmt Ihre Bitte in die Vorlage auf. Dr. Olbers entscheidet auf Vorlage – Freigabe, keine Freigabe oder Freigabe mit Auflagen; der Lenkungskreis berät.

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
Die Optimierung wird als `AEN-041` beantragt. Sie geht nicht in den Datenstand der Freigabe ein; freigegeben wird der benannte Stand ohne sie.

### Was fehlt
Eine Auswirkungsbewertung für `AEN-041`.

### Neues Risiko
Eine Änderung direkt nach der Freigabe.

### Governance-Frage
[[Datenstand]]: Auf welchem Stand wird freigegeben – und was kommt danach?
:::

::: rueckbezug A
In Welt A haben Sie ‚Abschluss melden‘ gewählt. In Welt B reicht keine Liste: Die Freigabe beruht auf Kernfrage, Mindestgrundlagen, Mandat und benanntem Datenstand.
:::

::: rueckbezug B
In Welt A haben Sie ‚Abschluss zurückhalten‘ gewählt. In Welt B hängt der Abschluss nicht an unbeauftragten Änderungen: `AEN-012` und `AEN-031` sind beschlossen und dokumentiert.
:::

::: rueckbezug C
In Welt A haben Sie ‚Kostenstand mit abgleichen‘ gewählt. In Welt B trägt die geregelte Stellvertretung mit dem benannten Datenstand; Ihre Mengen gehen den regulären Weg.
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
