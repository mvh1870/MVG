---
id: B1
welt: B
monat: 1
titel: Lage verstehen – mit MVG
lph: 4
uhr: Montag, 09:00 Uhr
whitepaper-bezug: [k4.2-p3, k5.3-p1, k6.4.2-t1, k6.4.5-t1, k3.2-t1, k4.2-p1, k4.5-p1, k4.6-p2, k6.3-p2, k6.3-p3, k6.4-p1, k6.4.1-p1, k6.4.3-p2, k9.1-p1, k9.2-p1, k9.2-p3]
status-start:
  entscheidungsfaehigkeit: 4
  kostenunsicherheit: mittel
  offene-risiken: 4
  ungeklaerte-entscheidungen: 1
  terminrisiko: niedrig
partner: A1
weiter: B2
---

::: schritt einstieg
---
titel: Montag, 09:00 Uhr. Monat 1.
kurz: Einstieg
---
Montag, 5. Januar. Dieselbe erste Woche, derselbe Bauantrag, dieselbe Marktnotiz. Diesmal gibt es ein angelegtes Zielsystem, dessen Priorität der Bauherr festlegt, eine Mandatsleiter, einen Rhythmus und Register mit verantwortlicher Rolle. Die Kostenprognose ist ein benannter Datenstand mit Version, nicht Holger Steins Privatsache.

::: protokoll
---
titel: Kick-off – Protokoll
datum: Di, 16.12.2025
von: petersen
---
- Zielsystem angelegt: Kosten, Termin, ESG und LCC mit Abwägungsregeln. Welche Zielpriorität gilt, legt Dr. Olbers fest – das steht noch aus.
- Mandatsleiter, von Dr. Olbers festgelegt: Bauherren-PL bis einschließlich 100 TEUR, Änderungsgremium über 100 TEUR bis einschließlich 5 Mio. €, darüber der Bauherr im Lenkungskreis.
- Register mit verantwortlicher Rolle und Turnus; Jour fixe dienstags mit Risikosichtung.
- Bauantrag: Einreichung Anfang Januar (Generalplanung).
- Nächster Jour fixe: 06.01.
:::

::: mail
---
von: petersen
betreff: Marktnotiz Holzbau – über den Projektverteiler
zeit: "08:47"
anhang: Marktnotiz_Holzbau_GP_Dez.pdf
---
Guten Morgen, die Marktnotiz der Generalplanung ist über den Projektverteiler gekommen – an die Projektsteuerung und an Sie. Die Generalplanung rechnet bei den Holzbauelementen mit steigenden Preisen, einen Betrag nennt sie noch nicht. In einem Register steht die Notiz noch nicht.
:::

::: datei
---
name: Kostenprognose 2026-01 · Version 1
quelle: Projektsteuerung
wert: Stand Kostenberechnung · gilt
---
Benannter Datenstand mit Version und Status.
:::

::: chat
---
von: stein
zeit: "09:02"
---
Die Kostenprognose steht als Version 1 im Datenstand. Die Annahmen zum Holz erkläre ich gern – aufgeschrieben sind noch nicht alle.
:::
:::

::: schritt vergleich
---
art: vergleich
titel: Welt A ⟷ Welt B
kurz: Welt A ⟷ B
knopf: Welt B ansehen
---
::: hinweis
Dieselbe erste Woche, dieselben Stücke – in Welt B hat jedes seinen Ort.
:::

::: paar
---
a: mail
von: petersen
b: register
fluss: fruehwarnung
---
### Welt A
Marktnotiz Holzbau – in welche Ablage?

### Welt B
Marktnotiz bei der Projektsteuerung · noch in keinem Register
:::

::: paar
---
a: datei
b: datenstand
---
### Welt A
**58,4 Mio. €** · Kosten_KB_Stein.xlsx

### Welt B
Datenstand: Kostenprognose 2026-01 · Version 1
:::

::: paar
---
a: notiz
farbe: rosa
b: mandat
fluss: freigabe
---
### Welt A
Wer gibt hier was frei?

### Welt B
Mandatsleiter · 100 TEUR · 5 Mio. €
:::

::: paar
---
a: notiz
farbe: lila
b: zielsystem
fluss: entscheidung
---
### Welt A
Kosten, Termin, ESG, LCC – was geht vor?

### Welt B
Zielpriorität · legt der Bauherr fest
:::

::: kennzahl
---
a: 3
b: 0
---
getrennte Ablagen
:::

::: kennzahl
---
a: 2
b: 0
---
lose Notizen
:::

### Welt A
Welt A: drei Ablagen, zwei Haftnotizen und eine Kostendatei, die nur einer lesen kann.

### Welt B
Welt B: ein benannter Datenstand, eine Mandatsleiter, eine Zielpriorität, die der Bauherr festlegt – und die Marktnotiz bei der Rolle, die das Frühwarnungsregister führt.
:::

::: schritt werkzeuge
---
titel: Wer macht was – mit Mandat
kurz: RACI
---
::: raci
---
zeilen:
  - id: zielprioritaet
    titel: Zielpriorität festlegen
    A: bauherr
    R: [pl]
    C: [gf, planung, controlling]
    I: [ps]
    mandat: nicht delegierbar (Kap. 3.2) · Lenkungskreis berät
  - id: datenstand
    titel: CTC und Prognose monatlich als Datenstand führen
    A: controlling
    R: [ps]
    C: [pl, planung]
    I: [bauherr, gf]
    mandat: "CTC und Prognose: Controlling, monatlich (Kap. 6.4.2) · führend bleiben die vom Bauherrn freigegebenen Datenquellen und Dokumentenstände (Kap. 6.3)"
  - id: fruehwarnung
    titel: Frühwarnung melden und erfassen
    A: ps
    R: [planung]
    C: [controlling]
    I: [pl]
    mandat: "Frühwarnungsregister: Projektsteuerung, wöchentliche Sichtung (Kap. 6.4.2)"
  - id: aenderung
    titel: Änderung bis einschließlich 100 TEUR freigeben
    A: pl
    R: [ps, planung]
    C: [controlling]
    I: [gf, bauherr]
    mandat: Bauherren-PL bis einschließlich 100 TEUR · über 100 TEUR bis einschließlich 5 Mio. € Änderungsgremium (Vorsitz Geschäftsführung) · darüber Bauherr im Lenkungskreis (Kap. 4.2)
  - id: reserve
    titel: Einsatz der Risikoreserve freigeben
    A: bauherr
    R: [pl]
    C: [gf, controlling]
    I: [ps, planung]
    mandat: nicht delegierbar (Kap. 3.2)
---
Die Tabelle beantwortet für den Schulcampus die Kernfrage aus Kap. 9.2: [[zitat:k9.2-p3|Wer bereitet vor, wer entscheidet, wer liefert belastbare Entscheidungsgrundlagen, wer wird konsultiert und wer muss informiert werden?]]
:::
:::

::: schritt rhythmus
---
titel: Wann was auf den Tisch kommt – und wo
kurz: Rhythmus und Register
---
Der Jour fixe am Dienstag ist der Ort der wöchentlichen Risikosichtung, das Änderungsgremium tagt monatlich, zzgl. anlassbezogener Sondersitzungen, jede Freigabe erteilt der Bauherr selbst – und jedes Register hat eine verantwortliche Rolle und einen Turnus, sodass die Marktnotiz eine Adresse hat, bevor jemand rechnet.

::: tafel k6.4.5-t1
---
form: rhythmus
hervor: [2]
---
:::

::: tafel k6.4.2-t1
---
form: karten
---
:::
:::

::: schritt lage
---
art: lage
titel: Was Sie wissen, und was nicht
kurz: Was Sie wissen
knopf: Jetzt entscheiden
---
::: datei
---
name: Kostenprognose 2026-01 · Version 1
quelle: Projektsteuerung
wert: Stand Kostenberechnung · gilt
---
:::

::: bekannt
- Projektbasis 58,4 Mio. € brutto, vom Stadtrat beschlossen; darin 2,9 Mio. € Risikoreserve – ihren Einsatz gibt nur der Bauherr frei.
- LPH 4: Die Genehmigungsplanung ist fertig, der Bauantrag geht diese Woche raus.
- Das Zielsystem ist mit Abwägungsregeln angelegt; welche Zielpriorität gilt, legt der Bauherr fest – das steht noch aus.
- Mandatsleiter, vom Bauherrn festgelegt: Bauherren-PL bis einschließlich 100 TEUR, Änderungsgremium über 100 TEUR bis einschließlich 5 Mio. €, darüber der Bauherr im Lenkungskreis.
- Die Marktnotiz ist bei der Projektsteuerung angekommen; in einem Register steht sie noch nicht.
:::

::: unbekannt
- Wie stark der Holzpreis die Kosten trifft {#holzpreis}
- Ob aus der Marktnotiz ein Risiko wird {#signal}
- Welche Annahmen der Kostenprognose bisher nur Holger Stein kennt {#annahmen}
- Wer Holger Stein vertritt {#stellvertretung}
:::
:::

::: schritt rueckbezug
---
art: rueckbezug
titel: Damals in Welt A
kurz: Rückbezug
---
:::

::: schritt entscheidung
---
art: entscheidung
titel: Was tun Sie?
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
MVG wirkt erst, wenn Zielsystem, RACI und Freigabekalender miteinander verbunden sind und Register, Rollen und Taktung eindeutig zusammenarbeiten.
:::

::: ebene 2
---
titel: Warum relevant
---
In Monat 1 ist in Welt B so wenig passiert wie in Welt A. Der Unterschied liegt im Zusammenhang: Die Marktnotiz geht an die Rolle, die das Frühwarnungsregister führt; die Zielpriorität liegt als Frage beim Bauherrn; die Kostenprognose hat einen Namen und eine Version. Eine [[RACI]] allein leistet das nicht. [[zitat:k9.2-p1|Entscheidend ist die Kopplung an Mandate, Freigabeschwellen, Stellvertretungen und Eskalationspfade.]] Eine Stellvertretung für Holger Stein ist in dieser Woche noch nicht geregelt – auch Welt B hat offene Punkte, aber sie haben einen Ort.
:::

::: ebene 3
---
titel: Vertiefung
---
| Baustein | Kapitel | In B1 sichtbar |
|---|---|---|
| Mandatsleiter | 4.2 | Bauherren-PL bis einschließlich 100 TEUR, Änderungsgremium über 100 TEUR bis einschließlich 5 Mio. €, darüber der Bauherr im Lenkungskreis |
| Register mit verantwortlicher Rolle | 6.4.1, 6.4.2 | Frühwarnungsregister bei der Projektsteuerung, Änderungsregister bei der Bauherren-PL, CTC und Prognose beim Controlling |
| Rhythmus | 6.4.5 | wöchentliche Risikosichtung im Jour fixe, Änderungsgremium monatlich, zzgl. anlassbezogener Sondersitzungen |
| Mandats- und Verantwortungsmodell | 9.1 | Rollen, Mandate, Schwellen, Freigaben und Eskalation in einem Modell |
| RACI mit Mandat | 9.2 | Kopplung an Mandate, Freigabeschwellen, Stellvertretungen und Eskalationspfade |

Register, RACI und Governance-Kalender kann der [[MVG Companion]] abbilden (Kap. 6.3). Er ist ein optionales Arbeitsmittel; das Bauherren-Führungsmodell funktioniert auch mit vorhandenen Büro- und Projektwerkzeugen.
:::

::: ebene 4
---
titel: Nachweis
---
::: zitat k5.3-p1
Die Wirkung von MVG entsteht durch Kopplung. Ein Zielsystem allein reicht nicht – ebenso wenig eine RACI-Matrix, ein Freigabekalender oder eine einzelne Entscheidungsvorlage. MVG wirkt erst, wenn diese Elemente miteinander verbunden werden.
:::

::: zitat k6.4.1-p1
Jedes Register hat eine verantwortliche Rolle, einen Pflegezyklus und einen definierten nächsten Schritt.
:::
:::
:::

::: vertiefung kosten
---
titel: Ein Datenstand mit Namen
---
Die Projektbasis von 58,4 Mio. € enthält 2,9 Mio. € Risikoreserve. Die Kostenprognose steht als „Kostenprognose 2026-01 · Version 1“ im Datenstand, auf dem Stand der Kostenberechnung; einige Annahmen zum Holz kennt bisher nur Holger Stein. Kap. 4.6 verlangt vom Bauherrn keine eigene Datenpflege: [[zitat:k4.6-p2|Der Bauherr muss nicht alle Daten selbst pflegen, aber er muss sicherstellen, dass Entscheidungen auf belastbaren, benannten und reproduzierbaren Grundlagen beruhen.]]
:::

::: vertiefung organisation
---
titel: Linien statt einer Liste
---
Statt einer Liste der Beteiligten gibt es eine RACI mit Mandatsspalte und eine Mandatsleiter mit drei Stufen. Offen ist noch, wer Holger Stein vertritt. Kap. 4.2 sagt, warum das zählt: [[zitat:k4.2-p1|RACI unterscheidet dabei ausführungsverantwortliche, letztverantwortliche, konsultierte und informierte Rollen. Diese Zuordnung reicht allein nicht aus, wenn Freigabeschwellen, Stellvertretungen und Eskalationswege fehlen.]]
:::

::: vertiefung risiko
---
titel: Ein Signal mit Adresse
---
Die Marktnotiz kam über den Projektverteiler bei der Projektsteuerung an, die das Frühwarnungsregister führt; erfasst ist sie noch nicht. Kap. 6.4.3 beschreibt den Weg: [[zitat:k6.4.3-p2|Eine Frühwarnung (EW) ist ein unbewertetes Signal. Wird sie bestätigt, wird daraus ein bewertetes Risiko.]]
:::

::: vertiefung freigaben
---
titel: Die Freigabe zu LPH 4 im Register
---
Im Februar steht die Freigabe zum Abschluss von LPH 4 an. Sie steht im Freigaberegister, das die Bauherren-PL führt; erteilen wird sie der Bauherr selbst auf Vorlage der Bauherren-PL. Kap. 4.5 sagt, worauf sie sich stützt: [[zitat:k4.5-p1|Freigabe bedeutet bauherrenseitige Legitimation eines nächsten Schritts auf einem benannten Datenstand.]]
:::

::: standpunkt gf
---
figur: deppe
---
„Mandatsleiter steht, Register laufen. Die Zielpriorität lege nicht ich fest – aber festgelegt werden muss sie.“
:::

::: standpunkt bauherr
---
figur: olbers
---
„Diesmal liegt eine Frage bei mir, bevor etwas passiert ist: Welche Zielpriorität gilt?“
:::

::: standpunkt pl
---
figur: sie
---
„Zielsystem, Mandatsleiter, Register – alles hat seinen Ort. Nur die Marktnotiz steht noch in keinem Register, und wer Holger Stein vertritt, weiß ich nicht.“
:::

::: standpunkt ps
---
figur: brenner
---
„Die Marktnotiz ist bei uns angekommen. Dienstag ist Risikosichtung.“
:::

::: standpunkt planung
---
figur: hoffmeister
---
„Wenn das Holz teurer wird, braucht es eine Variante. Diesmal gibt es Register – mal sehen, ob sie schneller sind als mein Telefon.“
:::

::: standpunkt controlling
---
figur: kaya
---
„Eine Kostenprognose mit Namen und Version – ich weiß endlich, womit ich rechne.“
:::

::: nachweis
---
mandat: Der Bauherr legt die Zielpriorität fest – nicht delegierbar; der Lenkungskreis berät.
freigabe: Keine berührt – die Zielpriorität ist keine Freigabe; im Februar steht die Freigabe zum Abschluss von LPH 4 an.
kennung: Noch keine – die Zielpriorität steht als offene Frage beim Bauherrn.
datenstand: Kostenprognose 2026-01 · Version 1, auf dem Stand der Kostenberechnung.
nachweis: Kick-off-Protokoll vom 16.12.2025 – Zielsystem angelegt, Mandatsleiter vom Bauherrn festgelegt.
beschlusslage: Mandatsleiter festgelegt; welche Zielpriorität gilt, steht noch aus.
---
:::

::: regie
### Notiz
B1 zeigt dieselbe Woche ohne neues Ereignis. Welt B ist nicht ruhiger, weil weniger passiert, sondern weil jedes Stück einen Ort hat. Nicht beschönigen: Auch hier ist die Marktnotiz vor der Entscheidung noch nicht erfasst, und die Stellvertretung für Holger Stein ist offen. Zuerst den Regler zeigen, dann die RACI mit der Spalte der gespielten Rolle.

### Leitfragen
- Wo steht bei Ihnen, wer vorbereitet, wer entscheidet und wer freigibt – mit Schwelle?
- Wie oft sichten Sie Signale, die noch keine Risiken sind?
- Welcher Ihrer Datenstände hat einen Namen und eine Version?
:::
