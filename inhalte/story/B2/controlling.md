---
station: B2
rolle: controlling
frage: Was liefern Sie zur Mensa-Änderung und zur Lieferzeit zu?
rueckbezug-auf: A2
---

::: option A
---
titel: Die Kostenauswirkung von AEN-012 für das Änderungsgremium beziffern
kurz: Auswirkung beziffern
status:
  entscheidungsfaehigkeit: +1
---
### Konsequenz
Grob 0,6 Mio. € stehen mit Kostengruppe und Datenstand in `AEN-012`. Das Änderungsgremium kann darauf entscheiden.

### Was fehlt
Die Termin- und Risikowirkung der Mensa – die Schätzung der Generalplanung hat sie noch nicht.

### Neues Risiko
Die Kostenseite ist klar, die Terminseite offen.

### Governance-Frage
[[Entscheidungsreife]]: Ist `AEN-012` ohne Terminwirkung entscheidungsreif?
:::

::: option B
---
titel: Die mögliche Kostenwirkung der Lieferzeit (FRW-002) in der Prognose getrennt ausweisen
kurz: Lieferzeit ausweisen
status:
  kostenunsicherheit: -1
---
### Konsequenz
Die Prognose zeigt die Lieferzeit als unbewertetes Signal mit Kostenspanne, getrennt von der CTC; bewertet wird sie erst als `RIS-009`.

### Was fehlt
Ihre Zahl zur Mensa: `AEN-012` wartet noch auf die bezifferte Auswirkung.

### Neues Risiko
Die Änderung läuft ohne Kostenseite ins Gremium.

### Governance-Frage
Welche Risiken sind in der Prognose enthalten – und welche nur beobachtet?
:::

::: option C
---
titel: Einen Aufschlag für die Mensa vorsorglich in die CTC nehmen
kurz: Vorsorglich einrechnen
status:
  kostenunsicherheit: +1
---
### Konsequenz
Ihre CTC nimmt vorweg, was das Änderungsgremium noch nicht beschlossen hat. Im Managementbericht steht die Mensa als Kosten, im Änderungsregister als beantragt.

### Was fehlt
Der Abgleich mit dem Status von `AEN-012`.

### Neues Risiko
Zahl und Beschlusslage passen nicht zusammen.

### Governance-Frage
[[Datenstand]]: Welche Änderungen sind in einer Prognose enthalten – und welche beschlossen?
:::

::: rueckbezug A
In Welt A haben Sie ‚Mensa einrechnen‘ gewählt. In Welt B nimmt Ihre Zahl nichts vorweg: `AEN-012` ist beantragt, das Änderungsgremium entscheidet.
:::

::: rueckbezug B
In Welt A haben Sie ‚Mensa herauslassen‘ gewählt. In Welt B hat die Zusage als `AEN-012` einen Ort und einen Status.
:::

::: rueckbezug C
In Welt A haben Sie ‚Zusage klären lassen‘ gewählt. In Welt B braucht es keine Nachfrage: Die Mandatsleiter sagt, wer entscheidet.
:::

::: rueckbezug ohne
In Welt A gingen Lieferzeit und Mensa in keine Liste. In Welt B sind sie `FRW-002` und `AEN-012`.
:::

::: regie
### Notiz
Das Controlling sitzt im Änderungsgremium und liefert die Kostenseite. Zeigen, dass eine vorweggenommene Zahl (Option C) Zahl und Beschlusslage auseinanderlaufen lässt.

### Leitfragen
- Enthält Ihre Prognose beantragte oder beschlossene Änderungen?
- Wer beziffert bei Ihnen die Auswirkung einer Änderung?
:::
