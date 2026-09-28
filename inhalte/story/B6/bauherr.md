---
station: B6
rolle: bauherr
frage: Die Bauherren-PL legt Ihnen die Vorlage zur Freigabe LPH 5 vor, der Lenkungskreis berät am 17. November. Wie entscheiden Sie?
rueckbezug-auf: A6
---

::: rueckbezug A
In Welt A haben Sie ‚Freigabe verschieben‘ gewählt. Hier zeigt die Vorlage, was vorliegt und was fehlt.
:::

::: rueckbezug B
In Welt A haben Sie ‚Letzte Zahl nennen‘ gewählt. In Welt B kommt die Antwort an die Fraktion aus dem Managementbericht, nicht aus Holger Steins Kopf.
:::

::: rueckbezug C
In Welt A haben Sie ‚Lage offenlegen‘ gewählt. In Welt B ist die Lage kein Geständnis, sondern Routine: Register und Managementbericht zeigen sie jeden Monat.
:::

::: rueckbezug ohne
In Welt A stand die Freigabe ohne Grundlage an, und Holger Stein fehlte. In Welt B fehlt er auch – aber Register, Datenstand und Stellvertretung tragen.
:::

::: option A
---
titel: Die Freigabe erteilen
kurz: Freigabe erteilen
status:
  ungeklaerte-entscheidungen: -1
---
### Konsequenz
Nach der Beratung im Lenkungskreis erteilen Sie die Freigabe auf dem benannten Datenstand; das Ergebnis ist dokumentiert.

### Was fehlt
Nichts in der Struktur, sofern das Controlling den Datenstand bestätigt und die Empfehlung vorliegt.

### Neues Risiko
Offene Risiken gehen in die nächste Phase mit – benannt, aber nicht verschwunden.

### Governance-Frage
[[Freigabe]]: Welche Annahmen legitimieren Sie mit dieser Freigabe mit?
:::

::: option B
---
titel: Die Freigabe mit Auflagen erteilen
kurz: Freigabe mit Auflagen
status:
  ungeklaerte-entscheidungen: "-1 (Auflagen mit Frist)"
---
### Konsequenz
Sie erteilen die Freigabe mit Auflagen, etwa zur Stellvertretung für die Kostenprognose – jede mit Frist und verantwortlicher Rolle im Register.

### Was fehlt
Die Erfüllung der Auflagen; sie wird im Rhythmus nachgehalten.

### Neues Risiko
Auflagen, die niemand nachhält, werden zu stillen Ausnahmen.

### Governance-Frage
Wer prüft, ob die Auflagen erfüllt sind – und was geschieht, wenn nicht?
:::

::: option C
---
titel: Keine Freigabe erteilen
kurz: Keine Freigabe
status:
  terminrisiko: +1
---
### Konsequenz
Sie erteilen keine Freigabe und benennen, was fehlt. Die Vorlage geht mit Frist zurück an die Bauherren-PL.

### Was fehlt
Die Mindestgrundlagen, die Sie benannt haben.

### Neues Risiko
LPH 6 beginnt später; der Termin rückt.

### Governance-Frage
[[Freigabe]]: Welche Mindestgrundlage fehlt – und wer liefert sie bis wann?
:::

::: regie
### Notiz
Der Bauherr erteilt die Freigabe selbst, auf Vorlage der Bauherren-PL; der Lenkungskreis berät am 17. November. Alle drei Ergebnisse sind in Welt B tragfähig – den Unterschied macht die Grundlage, nicht das Ergebnis.

### Leitfragen
- Wer erteilt bei Ihnen die Freigabe am Abschluss einer Leistungsphase?
- Auf welchem Datenstand?
:::
