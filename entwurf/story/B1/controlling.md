---
station: B1
rolle: controlling
frage: Womit beginnen Sie im Controlling?
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
Die erste CTC hat Version und Datum. Im monatlichen Termin mit Bauherren-PL und PMO geht sie in den Managementbericht.

### Was fehlt
Schwellenwerte, ab denen eine Abweichung als Signal gilt.

### Neues Risiko
Abweichungen werden gesehen, aber nichts wird ausgelöst.

### Governance-Frage
[[CTC]]: Ab welcher Abweichung wird aus einer Zahl ein Signal?
:::

::: option B
---
titel: Schwellenwerte je Kostengruppe festhalten
kurz: Schwellenwerte festhalten
status:
  entscheidungsfaehigkeit: +1
---
### Konsequenz
Jede Kostengruppe hat einen Schwellenwert. Wird er verletzt, entsteht eine neue Frühwarnung; welche Stufe dann entscheidet, sagt die Mandatsleiter.

### Was fehlt
Die Marktnotiz zum Holzpreis berührt noch keine Schwelle.

### Neues Risiko
Ein Signal von außen bleibt unter dem Radar der Zahlen.

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
Schwellenwerte sind noch nicht festgehalten.

### Neues Risiko
Eine gemeinsame Zahl – aber noch kein Auslöser, wenn sie kippt.

### Governance-Frage
[[Datenstand]]: Welche Annahmen sind offen – und wer schließt sie?
:::

::: rueckbezug A
In Welt A haben Sie ‚Eigene CTC aufsetzen‘ gewählt. In Welt B ist die CTC kein Nebenstrang: Sie gehört zu den Registern des Controllings, monatlich, mit Version – neben der Prognose, nicht gegen sie.
:::

::: rueckbezug B
In Welt A haben Sie ‚Kostendatei nachvollziehen‘ gewählt. In Welt B ist die Kostenprognose ein benannter Datenstand; niemand muss die Annahmen aus einem Kopf erfragen.
:::

::: rueckbezug C
In Welt A haben Sie ‚Holzpreis einrechnen‘ gewählt. In Welt B hat die Marktnotiz einen Ort: Sie wird als Frühwarnung erfasst und bewertet, nicht still in eine Zelle gerechnet.
:::

::: rueckbezug ohne
In Welt A war dieselbe erste Woche: zwei Rechnungen, eine Datei, ein Kopf. In Welt B haben CTC, Prognose und Schwellenwerte eine verantwortliche Rolle und einen Turnus.
:::
