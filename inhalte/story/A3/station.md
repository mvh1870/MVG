---
id: A3
welt: A
monat: 5
titel: Kosten +8 %   # geschütztes Leerzeichen vor „%“: der Titel bricht dort nie um
lph: 5
uhr: Montag, 08:30 Uhr
whitepaper-bezug: [k2.4-p1, k2.4-p2, k4.6-p1, k4.6-p2]
status-start:
  entscheidungsfaehigkeit: 2
  kostenunsicherheit: hoch
  offene-risiken: 7
  ungeklaerte-entscheidungen: 3
  terminrisiko: mittel
partner: B3
weiter:
  - ziel: A6
    wenn: [interesse express]
  - ziel: A4
---

::: express
Im Januar bekam die Kämmerei die Projektbasis, ohne Preisannahme; eine Zielpriorität gab es nicht. Im März sagte die GML-Geschäftsführung im Flur eine größere Mensa zu; die Holz-Lieferzeit stieg auf 26 Wochen, bei Förderfrist 2028/29.
:::

::: schritt einstieg
---
titel: Montag, 08:30 Uhr. Monat 5.
kurz: Einstieg
---
Montag, 11. Mai. Nächste Woche tagen Lenkungskreis und Bauausschuss; beide brauchen eine Kostenzahl. Es gibt zwei.

::: mail
---
von: brenner
betreff: Kostenprognose Mai
zeit: "08:12"
anhang: Prognose_Mai_v3_final_NEU.xlsx
---
„Prognose: 8 % über Projektbasis, rund +4,7 Mio. €. Ursache offen.“
:::

::: chat
---
von: kaya
zeit: "08:27"
---
Bei mir: +5,9 %. Welche Zahl gilt?
:::

::: notiz
---
farbe: gelb
symbol: anruf
---
Kämmerei: Haushalt 2027 anpassen?
:::

::: notiz
---
farbe: lila
---
Risikoreserve – wer darf?
:::

::: notiz
---
farbe: limette
---
v3_final oder v3_final_NEU??
:::
:::

::: schritt lage
---
art: lage
titel: Was feststeht, und was offen ist
kurz: Lagebild
knopf: Jetzt entscheiden
---
::: datei
---
name: Prognose_Mai_v3_final_NEU.xlsx
quelle: Projektsteuerung
wert: +8 %
---
:::

::: datei
---
name: CTC_Mai_Controlling.xlsx
quelle: Controlling
wert: +5,9 %
---
:::

::: bekannt
- Zwei Zahlen, kein geltender [[Datenstand]].
- Beide ohne Einsatz der Risikoreserve (2,9 Mio. €).
- Seit März ohne Entscheidung: Mensa-Zusage (0,6 Mio. €), Lieferzeit Holz, Förderfrist.
:::

::: unbekannt
- Ursache {#ursache}
- Terminwirkung {#terminwirkung}
- Nachtragsrisiko {#nachtragsrisiko}
:::

::: zeitsprung info
---
knopf: Weitere Informationen anfordern
kosten: "Kostet Zeit: vier Tage"
dauer: Vier Tage später
status:
  terminrisiko: hoch
loest:
  ursache: jetzt geklärt
  nachtragsrisiko: Nachtrag TGA angekündigt
bleibt:
  terminwirkung: bleibt offen
---
Terminrisiko steigt auf hoch.

### Neu bekannt
Ursache überwiegend Preissteigerung Holzbauelemente; ein Nachtrag TGA ist angekündigt.
:::
:::

::: schritt entscheidung
---
art: entscheidung
titel: Entscheidung
kurz: Entscheidung
---
:::

::: schritt konsequenz
---
art: konsequenz
titel: Was Ihre Wahl auslöst
kurz: Konsequenz
---
:::

::: schritt ebenen
---
art: ebenen
titel: Vier Ebenen – vom Satz zum Nachweis
kurz: Tiefer gehen
---
:::

::: ebenen
::: ebene 1
---
titel: Kernaussage
---
Zwei Zahlen sind keine Entscheidungsgrundlage. Ohne benannten Datenstand ist eine Entscheidung später nicht nachvollziehbar.
:::

::: ebene 2
---
titel: Warum relevant
---
Die naheliegende Reaktion ist mehr Bericht, mehr Abstimmung, mehr Gremium. [[zitat:k2.4-p1|Es löst aber nicht automatisch die Frage, wer was auf welcher Grundlage entscheiden darf und muss.]]
:::

::: ebene 3
---
titel: Vertiefung
---
Die Fragen der Datenstandslogik (Kap. 4.6) – an diesem Montag:

| Frage | An diesem Montag |
|---|---|
| Welche Version gilt? | „v3_final_NEU“ gegen die [[CTC]] des Controllings |
| Welche Annahmen sind offen? | Ursache, Terminwirkung, Nachtragsrisiko |
| Welche Änderungen wurden seit der letzten Freigabe aufgenommen? | Mensa-Zusage – ob sie in einer der beiden Zahlen steckt, ist nirgends festgehalten; die Lieferzeit Holz ist nicht bewertet |
| Welche Beschlusslage besteht? | keine zur Abweichung |
| Wo wird die Nachweiskette geführt? | in Mails und Excel-Dateien |
:::

::: ebene 4
---
titel: Nachweis
---
::: zitat k4.6-p1
Datenstand und Nachweis sind kein administratives Nebenprodukt. Sie sind ein eigenes Verantwortungsfeld. Eine formal richtige Entscheidung kann praktisch unbrauchbar werden, wenn unklar ist, welche Zahlen, Planstände, Annahmen, Risiken oder Protokolle zugrunde lagen.
:::
:::
:::

::: vertiefung kosten
---
titel: Zwei Zahlen, eine Projektbasis
---
+8 % bei der Projektsteuerung, +5,9 % beim Controlling – beide gegen die Projektbasis von 58,4 Mio. € gerechnet, die Risikoreserve von 2,9 Mio. € darin noch nicht eingesetzt. Welche Zahl gilt, ist nirgends festgehalten. Kap. 4.6: [[zitat:k4.6-p2|Der Bauherr muss nicht alle Daten selbst pflegen, aber er muss sicherstellen, dass Entscheidungen auf belastbaren, benannten und reproduzierbaren Grundlagen beruhen.]]
:::

::: vertiefung organisation
---
titel: Rechnen ist delegierbar
---
Projektsteuerung und Controlling rechnen jeweils eine eigene Prognose. Die Tabelle in Kap. 3.2 führt diese Arbeit als delegierbar: [[zitat:k3.2-t1|Berichterstattung, Prognoseerstellung, CTC-Berechnung, Terminbewertung und Datenaufbereitung.]] Wer festlegt, welche Zahl in den Lenkungskreis am 19. Mai geht, und wer über die Risikoreserve entscheiden darf, ist an diesem Montag offen.
:::

::: vertiefung risiko
---
titel: Seit März liegen geblieben
---
Die längere Lieferzeit der Holzbauelemente ist seit März bekannt und nicht bewertet, die Mensa im Flur zugesagt, nicht beschlossen; die Ursache der Abweichung ist ungeklärt, das Nachtragsrisiko offen. Kap. 2.5 beschreibt dieses Muster: [[zitat:k2.5-t1|Risiken und Änderungen laufen parallel, ohne gemeinsame Priorisierung, Auswirkungsbewertung und Freigabeschwelle.]]
:::

::: vertiefung freigaben
---
titel: Fünf Fragen vor einer Freigabe
---
Lenkungskreis und Bauausschuss tagen nächste Woche; auf dem Zettel steht „Risikoreserve – wer darf?“. Gemeint ist eine Freigabe des Einsatzes der Risikoreserve. Vor jeder Freigabe muss nach Kap. 4.5 klar sein, [[zitat:k4.5-p2|welche Entscheidung getroffen wird, welches Mandat gilt, welche Mindestgrundlagen vorliegen, welche Risiken angenommen werden und welcher Datenstand referenziert wird.]] An diesem Montag ist keiner der fünf Punkte beantwortet.
:::

::: standpunkt gf
---
figur: deppe
---
„Zwei Zahlen, und am 19. ist Lenkungskreis. Welche davon trage ich dort vor – und wer sagt mir das?“
:::

::: standpunkt bauherr
---
figur: olbers
---
„Am 21. fragt mich der Bauausschuss, was los ist. Welche Zahl nenne ich dort – und was soll ich eigentlich entscheiden?“
:::

::: standpunkt pl
---
figur: sie
---
„Zwei Zahlen eine Woche vor den Gremien, dazu Mensa und Lieferzeit offen. Womit gehe ich in den Lenkungskreis?“
:::

::: standpunkt ps
---
figur: brenner
---
„Die +8 % sind gerechnet, die Ursache fehlt noch. Welche Zahl in die Vorlage geht, sagt mir niemand.“
:::

::: standpunkt planung
---
figur: hoffmeister
---
„Wenn die Politik sparen will: Eine günstigere Fassade hätte ich. Nur fragt mich keiner.“
:::

::: standpunkt controlling
---
figur: kaya
---
„Welche Prognose gilt – meine +5,9 % oder die +8 % der Projektsteuerung?“
:::
