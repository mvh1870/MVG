---
station: B5
rolle: planung
frage: PRB-004 berührt die Risikoreserve. Was liefern Sie zur Vorlage?
rueckbezug-auf: A5
---

::: option A
---
titel: Die Auswirkung des Nachtrags fachlich bewerten und zuliefern
kurz: Auswirkung zuliefern
status:
  offene-risiken: -1
---
### Konsequenz
Die fachliche Auswirkung steht in `PRB-004`; Berechtigung und Höhe des Nachtrags prüft die Projektsteuerung. Die Bauherren-PL kann die Vorlage an Dr. Olbers geben; sie entscheidet über den Einsatz der Reserve.

### Was fehlt
Nichts für die Vorlage – die Entscheidung liegt beim Bauherrn.

### Neues Risiko
Keines; die Auswirkung ist bewertet.

### Governance-Frage
Warum gibt nur der Bauherr den Einsatz der Risikoreserve frei?
:::

::: option B
---
titel: Eine Einsparung an anderer Stelle als Änderung beantragen
kurz: Einsparung beantragen
status:
  ungeklaerte-entscheidungen: +1
---
### Konsequenz
Die Einsparung steht als `AEN-036` im Änderungsregister, mit Auswirkung. Ob sie kommt, entscheidet die zuständige Stufe; die Freigabe der Reserve für `PRB-004` bleibt davon getrennt.

### Was fehlt
Die Bewertung, ob die Einsparung Qualität oder LCC berührt.

### Neues Risiko
Eine zweite offene Entscheidung, die mit der ersten verwechselt werden kann.

### Governance-Frage
[[Mandat]]: Wer entscheidet über die Einsparung – und wer über die Reserve?
:::

::: option C
---
titel: Dr. Olbers direkt anrufen, damit es schneller geht
kurz: Direkt beim Bauherrn
status:
  terminrisiko: +1
---
### Konsequenz
Dr. Olbers hört zu und sagt: „Schicken Sie es über die Bauherren-PL, ich entscheide auf Vorlage.“ Ein Tag geht verloren, der Weg bleibt derselbe.

### Was fehlt
Die Vorlage – ein Anruf ersetzt sie nicht.

### Neues Risiko
Ein kurzer Umweg, kein Schaden.

### Governance-Frage
[[Nichtdelegierbare Bauherrenverantwortung]]: Auf welchem Datenstand entscheidet der Bauherr?
:::

::: rueckbezug A
In Welt A haben Sie ‚Nachtrag auf Zusage stützen‘ gewählt. In Welt B bucht niemand stillschweigend gegen die Reserve: Die Mensa steht mit ihren Kosten in `AEN-012`, und den Einsatz der Risikoreserve gibt nur der Bauherr frei.
:::

::: rueckbezug B
In Welt A haben Sie ‚Nachtrag zurückstellen‘ gewählt. In Welt B gibt es dafür keinen Grund: Die Mensa ist als `AEN-012` beschlossen, ihre Kosten stehen in der Auswirkung.
:::

::: rueckbezug C
In Welt A haben Sie ‚Mehrkosten offenlegen‘ gewählt. In Welt B ist die Offenlegung der Normalfall: Probleme stehen im Problemregister, und der Entscheidungsbedarf hat einen Weg.
:::

::: rueckbezug ohne
In Welt A war die Reserve zu einem guten Teil verplant, ohne dass jemand sie freigegeben hatte. In Welt B steht `PRB-004` im Problemregister, und über die Reserve entscheidet der Bauherr.
:::

::: regie
### Notiz
Die Generalplanung liefert die fachliche Auswirkung zu; der Weg zum Bauherrn führt über die Vorlage der Bauherren-PL. Option C ist ein kurzer Umweg, kein Schaden.

### Leitfragen
- Wie oft ruft bei Ihnen die Planung den Bauherrn direkt an?
- Wer trennt bei Ihnen Einsparung und Reserve?
:::
