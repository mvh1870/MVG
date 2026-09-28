---
id: B3
welt: B
monat: 5
titel: Kosten +8 %   # geschütztes Leerzeichen vor „%“: der Titel bricht dort nie um
lph: 5
uhr: derselbe Montag
whitepaper-bezug: [k2.4-p2, k4.2-p3, k6.4.3-p1, k6.4.3-p2, k6.4.4-t1, k9.4-l1, k6.4.1-p3, k4.4-p2, k9.4-p1]
status-start:
  entscheidungsfaehigkeit: 4
  kostenunsicherheit: mittel
  offene-risiken: 7 (1 neu bewertet)
  ungeklaerte-entscheidungen: 1
  terminrisiko: mittel
partner: A3
weiter:
  - ziel: B6
    wenn: [interesse express]
  - ziel: B4
---

::: express
Im Januar bekam die Kämmerei Version 1; Zielsystem und Mandatsleiter standen. Im März wurden Mensa-Zusage und Lieferzeit zu `AEN-012` und `FRW-002`, Bezug Förderfrist.
:::

::: schritt signal
---
titel: Signal
kurz: Signal
gruppe: Welt B · Monat 5 · derselbe Montag
---
::: grafik ctc-verlauf
---
titel: Restkostenprognose (CTC)
untertitel: Monat 1–5
---
Die Restkostenprognose des Controllings steigt und überschreitet in Monat 5 den Schwellenwert.
:::

::: kette
::: glied FRW-003
---
art: fruehwarnung
---
### Titel
Neue [[Frühwarnung]]

### Text
unbewertet · Quelle: CTC über Schwellenwert
:::

::: glied
---
art: bestaetigung
von: brenner
---
### Titel
bestätigt und bewertet

### Text
Jonas Brenner · Projektsteuerung
:::

::: glied RIS-014
---
art: risiko
---
### Titel
Risiko

### Text
„Preissteigerung Holzbauelemente“
:::
:::

::: merksatz
**Kein Anruf:** ein nummeriertes Signal.
:::
:::

::: schritt datenstand
---
titel: Datenstand
kurz: Datenstand
gruppe: Welt B · Monat 5 · derselbe Montag
---
::: datenstand
---
name: Kostenprognose 2026-05 · Version 3
abweichung: +8,0 %
betrag: +4,7 Mio. €
basis: bei 58,4 Mio. € brutto
versionen:
  - "Version 1: ersetzt"
  - "Version 2: ersetzt"
  - "Version 3: gilt"
  - "Version 4: künftig"
---

### Vergleich
~~+8 %~~ · ~~+5,9 %~~

Zwei Zahlen, keine gilt. In Welt B geht genau eine in die Gremien – mit Namen, Version und Status.
:::
:::

::: schritt mandat
---
titel: Mandat
kurz: Mandat
gruppe: Welt B · Monat 5 · derselbe Montag
---
::: mandatsleiter
---
betrag: 4,7 Mio. €
betrag-teur: 4700
stufen:
  - wer: Bauherren-PL
    bereich: bis einschließlich 100 TEUR
    bis-teur: 100
  - wer: Änderungsgremium
    bereich: über 100 TEUR bis einschließlich 5 Mio. €
    bis-teur: 5000
  - wer: Bauherr
    bereich: über 5 Mio. € – Beschluss im Lenkungskreis
    hinweis: "Risikoreserve: nur Bauherr"
---
`ENT-017` · Welche Option?
:::

::: mandatsoption 1
---
titel: Projektumfang anpassen
detail: "Änderung AEN-022: Fassade"
zustaendig: Änderungsgremium
stufe: 2
---
Über `AEN-022` entscheidet das Änderungsgremium.
:::

::: mandatsoption 2
---
titel: Risikoreserve einsetzen
detail: Freigabe des Einsatzes nicht delegierbar
zustaendig: Bauherr
stufe: 3
---
Die Freigabe des Einsatzes der Risikoreserve ist nicht delegierbar; sie bleibt beim Bauherrn.
:::

::: merksatz
Das [[Mandat]] hängt von der Option ab.
:::
:::

::: schritt vorlage
---
titel: ENT-017
kurz: ENT-017
gruppe: Welt B · Monat 5 · derselbe Montag
---
::: vorlage ENT-017
---
titel: Entscheidungsvorlage
datenstand: Kostenprognose 2026-05 · Version 3
---
### Frage
„Wie wird die Kostenabweichung aufgefangen?“

### Checkliste
- [x] eindeutige [[Entscheidungs-ID]]
- [x] Entscheidungsfrage
- [x] betroffene Freigabe · LPH 5
- [x] Verantwortungsfeld
- [ ] Mandat und letztverantwortliche Rolle · je nach Option
- [x] Datenstand und zentrale Annahmen
- [x] Optionen und Konsequenzen
- [-] Wirkung auf Kosten, Termin, Qualität, Projektumfang, Risiko und ESG/LCC · Option 2 ohne Termin, Risiko
- [-] Empfehlung
- [ ] Freigabe- oder Eskalationsweg
- [ ] Freigabeprozess (sechsstufig, jede Stufe wird signiert): offen → in Prüfung → vorbereitet → freigegeben → beschlossen | abgelehnt
- [ ] Beschlusslage
- [ ] Nachverfolgung
:::
:::

::: schritt fluss
---
titel: Governance-Fluss
kurz: Fluss
gruppe: Welt B · Monat 5 · derselbe Montag
---
::: fluss
---
position: entscheidung
---
:::
:::

::: schritt rueckbezug
---
art: rueckbezug
titel: Rückbezug
kurz: Rückbezug
gruppe: Welt B · Monat 5 · derselbe Montag
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
Berichte erzeugen Information. Führung entsteht erst, wenn Information unter anderem mit Mandat, Entscheidung, Datenstand und Freigabe verbunden wird.
:::

::: ebene 2
---
titel: Warum relevant
---
Eine Kostenabweichung ist erst dann führbar, wenn klar ist, wer auf welchem Datenstand mit welcher Frage entscheidet. Eine neue Prognose wird Version 4 und ersetzt Version 3 nachvollziehbar; über `AEN-022` entscheidet das Änderungsgremium, weil 4,7 Mio. € über 100 TEUR und bis einschließlich 5 Mio. € liegen.
:::

::: ebene 3
---
titel: Vertiefung
---
Auszug aus der Register-Abgrenzung (Kap. 6.4.4):

| Register | Bedeutung | Nächster Schritt |
|---|---|---|
| Frühwarnung | unbewertetes Signal | bestätigen; bei Bestätigung Risiko |
| Risikoregister | bewertetes mögliches Ereignis | Risikominderung oder Entscheidung |
| Änderungsregister | gewollte Änderung | Auswirkung, Freigabeweg |
| Entscheidungsregister | offener Entscheidungsbedarf | Entscheidungsvorlage |
| Managementbericht | aggregierter Gremienbericht | Information und Beschlussvorbereitung |
:::

::: ebene 4
---
titel: Nachweis
---
::: zitat k2.4-p2
Berichterstattung erzeugt Information. Führung entsteht erst, wenn Information mit Mandat, Entscheidung, Schwelle, Risikoannahme, Datenstand, Freigabe und Nachweis verbunden wird. Ein Ampelbericht ohne Entscheidungsfrage bleibt Beobachtung. Ein Änderungsregister ohne Schwellenlogik bleibt Verwaltung.
:::
:::
:::

::: vertiefung kosten
---
titel: Eine Zahl, die gilt
---
Es gilt die „Kostenprognose 2026-05 · Version 3“: +8 %, rund +4,7 Mio. € gegen die Projektbasis von 58,4 Mio. €, die Risikoreserve von 2,9 Mio. € darin noch nicht eingesetzt. Den Weg ausgelöst hat die Restkostenprognose des Controllings: Sie lag über dem Schwellenwert, daraus wurde `FRW-003`. Kap. 6.4.3: [[zitat:k6.4.3-p2|CTC- oder Schwellenwertverletzungen erzeugen neue Frühwarnungen als neue Signale, nicht als Rückrichtung aus einem bestehenden Risiko.]]
:::

::: vertiefung organisation
---
titel: Jedes Register hat eine Rolle
---
Das Controlling führt CTC und Prognose (die Zahl der Version 3 rechnet die Projektsteuerung zu), die Projektsteuerung Frühwarnungs- und Risikoregister, die Bauherren-PL Entscheidungs- und Änderungsregister. So kommt `FRW-003` über `RIS-014` bei `ENT-017` an – mit Frage und Frist. Kap. 6.4.1: [[zitat:k6.4.1-p3|Entscheidungsbedürftige Themen werden nicht nur berichtet, sondern über das Entscheidungsregister und eine Entscheidungsvorlage entscheidungsreif gemacht.]]
:::

::: vertiefung risiko
---
titel: Ein Risiko mit Entscheidungsbedarf
---
Die Lieferzeit steht seit März als `FRW-002` im Register; `FRW-003` ist ein neues Signal, ausgelöst von der CTC. Die Projektsteuerung hat es bestätigt und bewertet: `RIS-014` „Preissteigerung Holzbauelemente“. In `ENT-017` fehlen zu Option 2 noch Termin und Risiko. Kap. 4.4: [[zitat:k4.4-p2|Ein Risiko wird nicht nur als Eintrag geführt, sondern mit einer verantwortlichen Rolle, Frist, Wirkung, Risikominderung, Restrisiko, Entscheidungsbedarf und Eskalationsschwelle verbunden.]]
:::

::: vertiefung freigaben
---
titel: Die betroffene Freigabe steht in der Vorlage
---
`ENT-017` nennt die betroffene Freigabe: LPH 5. Die Freigabe zum Abschluss von LPH 5 erteilt der Bauherr selbst auf Vorlage der Bauherren-PL. Der Freigabe- oder Eskalationsweg ist in der Vorlage noch offen – er hängt von der Option ab. Kap. 9.4 nennt das Ziel der Vorlage: [[zitat:k9.4-p1|Ziel ist, dass spätere Dritte nachvollziehen können, welche Frage entschieden wurde, auf welchem Datenstand, mit welchen Optionen, Annahmen, Risiken, Empfehlungen und Freigaben.]]
:::

::: standpunkt gf
---
figur: deppe
---
„4,7 Mio. € – das liegt beim Änderungsgremium, wenn es um die Fassade geht. Da habe ich den Vorsitz. Bei der Risikoreserve nicht.“
:::

::: standpunkt bauherr
---
figur: olbers
---
„Am 21. tagt der Bauausschuss. Ich weiß, welche Zahl gilt. Ob die Frage bei mir landet, hängt an der Option.“
:::

::: standpunkt pl
---
figur: sie
---
„`ENT-017` liegt vor mir: eine Frage, zwei Optionen, eine Zahl mit Version. Eine Woche bis zum Lenkungskreis – kann die zuständige Stufe darauf entscheiden?“
:::

::: standpunkt ps
---
figur: brenner
---
„`FRW-003` ist bestätigt, `RIS-014` bewertet, `ENT-017` in Arbeit. Wer entscheidet, hängt an der Option – nicht an mir.“
:::

::: standpunkt planung
---
figur: hoffmeister
---
„Eine günstigere Fassade hätte ich. Als `AEN-022` ist sie jetzt eine Option in der Vorlage – entscheiden werde nicht ich.“
:::

::: standpunkt controlling
---
figur: kaya
---
„Meine CTC hat den Schwellenwert gerissen, daraus ist `FRW-003` geworden. Und es gilt eine Prognose: Version 3.“
:::

::: nachweis
---
mandat: Hängt von der Option ab – Änderungsgremium bei AEN-022, Bauherr beim Einsatz der Risikoreserve.
freigabe: Betroffen ist die Freigabe LPH 5; der Freigabeweg ist in der Vorlage noch offen.
kennung: ENT-017 · „Wie wird die Kostenabweichung aufgefangen?“
datenstand: Kostenprognose 2026-05 · Version 3 – +8 %, rund +4,7 Mio. €.
nachweis: Entscheidungsvorlage mit Checkliste; zu Option 2 fehlen noch Termin und Risiko.
beschlusslage: Noch keine – sie wird mit der Entscheidung zu ENT-017 dokumentiert.
---
:::

::: regie
### Notiz
B3 zeigt denselben Montag wie A3 – dieselbe Abweichung, dieselben Gremientermine. Welt B ist nicht frei von offenen Punkten: `ENT-017` ist noch nicht vollständig, und welche Stufe der Mandatsleiter entscheidet, hängt von der Option ab. Nicht beschönigen und nicht vorwegnehmen. Die sechs Teile der Reihe nach zeigen; Signal und Datenstand zügig, das Gewicht liegt auf Mandat und `ENT-017`.

### Leitfragen
- Welche Zahl wäre bei Ihnen an diesem Montag die geltende – und wer hätte das festgelegt?
- Löst bei Ihnen ein Schwellenwert ein Signal aus, oder landet eine Zahl in einer Mail?
- Wo hätte bei Ihnen eine Abweichung von 4,7 Mio. € ihre Entscheidungsfrage bekommen?
:::
