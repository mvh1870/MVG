---
station: B1
rolle: controlling
frage: "Kämmerei-Ansatz: Was richten Sie ein?"
rueckbezug-auf: A1
---

::: option A
---
titel: CTC und Prognose nach Kostengruppen DIN 276 als monatlichen Datenstand aufsetzen
kurz: Monatlichen Datenstand aufsetzen
status:
  kostenunsicherheit: -1
---
### Konsequenz
Die erste CTC hat Version und Datum und geht monatlich in den Managementbericht.

### Was fehlt
Schwellenwerte je Kostengruppe – bis sie festgehalten sind, bleibt eine Abweichung eine Zahl ohne Auslöser.

### Neues Risiko
Abweichungen werden gesehen, aber nichts wird ausgelöst.

### Governance-Frage
[[Frühwarnung]]: Ab welcher Abweichung wird aus einer Zahl ein Signal?
:::

::: option B
---
titel: Schwellenwerte je Kostengruppe festhalten
kurz: Schwellenwerte festhalten
status:
  entscheidungsfaehigkeit: +1
---
### Konsequenz
Wird ein Schwellenwert verletzt, entsteht eine neue Frühwarnung. Bestätigt sie sich, wird sie ein bewertetes Risiko; entsteht daraus Entscheidungsbedarf, sagt die Mandatsleiter, wer entscheidet.

### Was fehlt
Die offene Preisannahme berührt noch keine Schwelle.

### Neues Risiko
Ein Signal von außen bleibt unter dem Radar.

### Governance-Frage
[[Frühwarnung]]: Wer erfasst ein Signal, das noch keine Schwelle verletzt?
:::

::: option C
---
titel: Die Annahmen der Kostenprognose mit Holger Stein im Datenstand abgleichen
kurz: Annahmen abgleichen
status:
  offene-risiken: -1
---
### Konsequenz
Die Annahmen stehen im Datenstand, nicht in Steins Zellbezügen. Ihre CTC und seine Prognose beruhen auf derselben Grundlage.

### Was fehlt
Schwellenwerte je Kostengruppe – bis sie festgehalten sind, löst eine Abweichung kein Signal aus.

### Neues Risiko
Eine gemeinsame Zahl – aber noch kein Auslöser, wenn sie kippt.

### Governance-Frage
[[Datenstand]]: Welche Annahmen sind offen – und wer schließt sie?
:::

::: rueckbezug A
In Welt A haben Sie ‚Eigene Zahl melden‘ gewählt. In Welt B bekommt die Kämmerei den Datenstand, den Sie monatlich mit Version führen.
:::

::: rueckbezug B
In Welt A haben Sie ‚Kostendatei nachvollziehen‘ gewählt. In Welt B muss niemand die Annahmen aus einem Kopf erfragen.
:::

::: rueckbezug C
In Welt A haben Sie ‚Preissteigerung einrechnen‘ gewählt. In Welt B steht die Preisannahme offen im Datenstand, nicht still in einer Zelle.
:::

::: rueckbezug ohne
In Welt A: zwei Rechnungen, eine Datei, ein Kopf. In Welt B haben CTC und Prognose eine Rolle und einen Turnus.
:::

::: nachsatz
Die Geschichte merkt sich Ihre Wahl.
:::

::: regie
### Notiz
Das Controlling bekommt in Welt B einen Turnus und Schwellenwerte statt einer Nebenrechnung. Zeigen, dass ein Schwellenwert ein Signal auslöst, aber nicht entscheidet.

### Leitfragen
- Ab welcher Abweichung wird bei Ihnen aus einer Zahl ein Signal?
- Wer gleicht bei Ihnen die Annahmen von Prognose und CTC ab?
:::
