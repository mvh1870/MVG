---
station: B2
rolle: planung
frage: FRW-001 und AEN-012 sind erfasst. Was liefern Sie zu?
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
Die Auswirkung der Mensa steht in `AEN-012`, verknüpft mit `RIS-009`. Das Änderungsgremium kann in seiner nächsten Sitzung auf Vorlage entscheiden.

### Was fehlt
Die Bestätigung der Lieferzeit, damit die Terminwirkung belastbar ist.

### Neues Risiko
Zwei verknüpfte Einträge, die zusammen fertig werden müssen.

### Governance-Frage
[[Entscheidungsreife]]: Ist die Vorlage reif, solange `RIS-009` nicht bewertet ist?
:::

::: option B
---
titel: Die Bestätigung der Lieferzeit und die Terminwirkung für RIS-009 zuliefern
kurz: Bestätigung zuliefern
status:
  offene-risiken: +1
---
### Konsequenz
Sie liefern die Bestätigung der Lieferzeit und die Terminwirkung zu; die Projektsteuerung, die das Frühwarnungsregister führt, macht aus `FRW-001` das Risiko `RIS-009` mit bewerteter Terminwirkung. Die Mensa wartet eine Woche auf ihre Bewertung.

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
Die Bauherren-PL stoppt es im Jour fixe: `AEN-012` steht auf „Beantragt“, nicht auf „Beschlossen“. Die Arbeit der Woche geht in die Auswirkungsbewertung.

### Was fehlt
Der Beschluss des Änderungsgremiums.

### Neues Risiko
Vorarbeit, die bei einer Ablehnung verloren ist.

### Governance-Frage
[[Mandat]]: Ab wann gilt eine beantragte Änderung als Auftrag?
:::

::: rueckbezug A
In Welt A haben Sie ‚Mensa einplanen‘ gewählt. In Welt B wäre das kein stiller Auftrag: Die Mensa ist `AEN-012`, und bei rund 0,6 Mio. € entscheidet das Änderungsgremium.
:::

::: rueckbezug B
In Welt A haben Sie ‚Auftrag abwarten‘ gewählt. In Welt B wartet niemand ins Leere: Der Freigabeweg steht fest, und die Sitzung des Änderungsgremiums hat einen Termin.
:::

::: rueckbezug C
In Welt A haben Sie ‚Lieferzeit bewerten‘ gewählt. In Welt B bleibt die Bewertung nicht in einer Mail: Sie fließt ein, wenn aus `FRW-001` das Risiko `RIS-009` wird.
:::

::: rueckbezug ohne
In Welt A wurden Marktabfrage und Mail zu einer Flurzusage und einer Terminmail. In Welt B werden sie zu `FRW-001` und `AEN-012`.
:::

::: regie
### Notiz
Die Generalplanung liefert zu: die Auswirkung der Mensa und die Bestätigung der Lieferzeit. Die Register führen andere Rollen.

### Leitfragen
- Beginnt Ihre Planung manchmal vor dem Beschluss mit einer Änderung?
- Wer macht bei Ihnen aus einem Signal ein bewertetes Risiko?
:::
