---
station: B2
rolle: planung
frage: FRW-002 und AEN-012 sind erfasst. Was liefern Sie zu?
rueckbezug-auf: A2
---

::: option A
---
titel: Die Auswirkung von AEN-012 auf Kosten, Termin und Risiko bewerten
kurz: Mensa bewerten
status:
  entscheidungsfaehigkeit: +1
---
### Konsequenz
Die Auswirkung der Mensa steht in `AEN-012`, mit Verweis auf die Lieferzeit `FRW-002`. Das Änderungsgremium kann in seiner nächsten Sitzung auf Vorlage entscheiden.

### Was fehlt
Die Bestätigung der Lieferzeit, damit die Terminwirkung belastbar ist.

### Neues Risiko
Zwei verknüpfte Einträge, die zusammen fertig werden müssen.

### Governance-Frage
[[Entscheidungsreife]]: Ist die Vorlage reif, solange `FRW-002` nicht bestätigt ist?
:::

::: option B
---
titel: Die Bestätigung der Lieferzeit und ihre Terminwirkung zuliefern
kurz: Bestätigung zuliefern
status:
  offene-risiken: +1
---
### Konsequenz
Sie liefern Bestätigung und Terminwirkung zu; die Projektsteuerung macht aus `FRW-002` das Risiko `RIS-009`. Die Mensa wartet eine Woche.

### Was fehlt
Die Auswirkung von `AEN-012`.

### Neues Risiko
Ein bewertetes Risiko mehr im Register.

### Governance-Frage
Wer entscheidet über Risikominderung – und wer über die Annahme des Risikos?
:::

::: option C
---
titel: Mit der Planung der Mensa schon beginnen
kurz: Mensa vorab planen
status:
  ungeklaerte-entscheidungen: +1
---
### Konsequenz
Die Bauherren-PL stoppt es im Jour fixe: `AEN-012` ist beantragt, nicht beschlossen. Die Woche geht in die Auswirkungsbewertung.

### Was fehlt
Der Beschluss des Änderungsgremiums.

### Neues Risiko
Vorarbeit, die bei einer Ablehnung verloren ist.

### Governance-Frage
[[Mandat]]: Ab wann gilt eine beantragte Änderung als Auftrag?
:::

::: rueckbezug A
In Welt A haben Sie ‚Mensa einplanen‘ gewählt. In Welt B ist das kein stiller Auftrag: Die Mensa ist `AEN-012`, das Änderungsgremium entscheidet.
:::

::: rueckbezug B
In Welt A haben Sie ‚Auftrag abwarten‘ gewählt. In Welt B wartet niemand ins Leere: Der Freigabeweg steht fest.
:::

::: rueckbezug C
In Welt A haben Sie ‚Lieferzeit bewerten‘ gewählt. In Welt B fließt die Bewertung ein, wenn aus `FRW-002` das Risiko `RIS-009` wird.
:::

::: rueckbezug ohne
In Welt A wurden Marktabfrage und Mail zu einer Flurzusage und einer Terminmail. In Welt B werden sie zu `FRW-002` und `AEN-012`.
:::

::: regie
### Notiz
Die Generalplanung liefert zu: die Auswirkung der Mensa und die Bestätigung der Lieferzeit. Die Register führen andere Rollen.

### Leitfragen
- Beginnt Ihre Planung manchmal vor dem Beschluss mit einer Änderung?
- Wer macht bei Ihnen aus einem Signal ein bewertetes Risiko?
:::
