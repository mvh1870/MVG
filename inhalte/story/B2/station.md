---
id: B2
welt: B
monat: 3
titel: Zusage im Flur, Frist im Förderbescheid – mit MVG
kurztitel: Zusage im Flur – mit MVG
lph: 5
uhr: Dienstag, 11:15 Uhr
whitepaper-bezug: [k6.4.4-t1, k4.2-p3, k6.4.2-t1, k6.4.3-p2, k6.4.4-p1, k6.4.1-p1, k6.4.5-p1, k6.4.5-t1, k4.4-p1, k4.6-p2]
status-start:
  entscheidungsfaehigkeit: 4
  kostenunsicherheit: mittel
  offene-risiken: 5
  ungeklaerte-entscheidungen: 2
  terminrisiko: mittel
partner: A2
weiter: B3
---

::: schritt einstieg
---
titel: Dienstag, 11:15 Uhr. Monat 3.
kurz: Einstieg
---
Dienstag, 10. März. Dieselbe Flurzusage, dieselbe Förderfrist.

::: mail
---
von: hoffmeister
betreff: "AW: Lieferzeit Holzbauelemente"
zeit: "10:31"
---
Lieferzeit rund 26 statt 16 Wochen. Terminwirkung nicht bewertet.
:::

::: chat
---
von: brenner
zeit: "10:48"
---
Lieferzeit als `FRW-002` erfasst, unbewertet, Bezug Förderfrist. Risikosichtung: Dienstag, 17. März.
:::

::: mail
---
von: roth
betreff: Mensa für den Ganztag
zeit: "11:09"
---
Schulverwaltung und Schulleitung: Der Ganztag braucht eine Mensa für rund 450 statt 300 Essen, laut Generalplanung grob 0,6 Mio. €. Die Geschäftsführung der GML sagte im Flur: „Machen wir.“ Ich nehme die GML beim Wort.
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
Jedes Stück hat eine Kennung und einen nächsten Schritt.
:::

::: paar
---
a: notiz
farbe: gelb
b: register
kennung: FRW-002
fluss: fruehwarnung
---
### Welt A
Holz 26 statt 16 Wochen – und die Förderfrist?

### Welt B
Lieferzeit Holzbauelemente · unbewertetes Signal
:::

::: paar
---
a: mail
von: roth
b: register
kennung: AEN-012
fluss: entscheidung
---
### Welt A
Mensa für den Ganztag – „Machen wir.“

### Welt B
Mensa für den Ganztag · Beantragt
:::

::: paar
---
a: notiz
farbe: lila
b: mandat
---
### Welt A
0,6 Mio. € – wer darf das?

### Welt B
Mandatsleiter · über 100 TEUR · Änderungsgremium
:::

::: kennzahl
---
a: 3
b: 0
---
lose {Notiz|Notizen}
:::

::: kennzahl
---
a: 0
b: 2
---
{Eintrag|Einträge} mit Kennung
:::

### Welt A
Welt A: eine Förderfrist auf einer Haftnotiz, eine Zusage aus dem Flur und niemand, der weiß, wer über 0,6 Mio. € entscheidet.

### Welt B
Welt B: dasselbe Terminsignal, derselbe Wunsch – aber als Frühwarnung und als beantragte Änderung, jede mit Register, Rolle und nächstem Schritt.
:::

::: schritt register
---
titel: Zwei Einträge, zwei Wege
kurz: Register
---
Die Frühwarnung wird bestätigt oder nicht; die Änderung braucht Auswirkung und Freigabeweg.

::: tafel k6.4.4-t1
---
form: register
hervor: [1, 4]
---
:::

::: kette
::: glied FRW-002
---
art: fruehwarnung
---
### Titel
[[Frühwarnung]] · erfasst

### Text
unbewertetes Signal zur Lieferzeit
:::

::: glied
---
art: bestaetigung
von: brenner
---
### Titel
Bestätigung · steht aus

### Text
Risikosichtung, Dienstag, 17. März · Projektsteuerung
:::

::: glied RIS-009
---
art: risiko
---
### Titel
Risiko · erst nach Bestätigung

### Text
„Lieferzeit Holzbauelemente“ · Förderfrist nicht bewertet
:::
:::
:::

::: schritt mandat
---
titel: Wer entscheidet AEN-012?
kurz: Mandat
---
::: mandatsleiter
---
betrag: rund 0,6 Mio. €
betrag-teur: 600
stufen:
  - wer: Bauherren-PL
    bereich: bis einschließlich 100 TEUR
    bis-teur: 100
  - wer: Änderungsgremium
    bereich: über 100 TEUR bis einschließlich 5 Mio. €
    bis-teur: 5000
  - wer: Bauherr
    bereich: über 5 Mio. € – Beschluss im Lenkungskreis
---
`AEN-012` · Auf welcher Stufe liegt die Mensa?
:::

::: mandatsoption 1
---
titel: Mensa für rund 450 Essen
detail: "Änderung AEN-012 · Status Beantragt"
zustaendig: Änderungsgremium
stufe: 2
---
Über 100 TEUR bis einschließlich 5 Mio. €: Änderungsgremium, Vorsitz Geschäftsführung.
:::

::: merksatz
**Kein Flur, keine Haftnotiz:** Die Lieferzeit hat eine Nummer, die Mensa einen Antrag.
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
name: Änderungsregister · AEN-012 · Mensa für den Ganztag
quelle: Bauherren-PL
wert: Beantragt · Auswirkung offen
---
:::

::: bekannt
- Lieferzeit Holzbauelemente: rund 26 statt 16 Wochen; `FRW-002`, nicht bestätigt.
- Förderbescheid Ganztag: Inbetriebnahme zum Schuljahr 2028/29.
- Mensa für rund 450 statt 300 Essen, grob 0,6 Mio. €; `AEN-012`, beantragt, nicht beschlossen.
:::

::: unbekannt
- Ob die Förderfrist hält {#terminwirkung}
- Termin- und Risikowirkung der Mensa {#mensa-wirkung}
- Termin der Entscheidung über `AEN-012` {#gremium}
- Ob Sabine Roth weiß, dass nichts beschlossen ist {#nutzerseite}
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
Eine Frühwarnung ist ein unbewertetes Signal; erst bestätigt wird sie ein bewertetes Risiko. Eine gewollte Änderung braucht Auswirkung und Freigabeweg.
:::

::: ebene 2
---
titel: Warum relevant
---
In Monat 3 trifft Welt B dasselbe wie Welt A: dieselbe Förderfrist, derselbe Wunsch. Der Unterschied liegt im Umgang. Die Lieferzeit wird kein Satz im Statusbericht, sondern `FRW-002`; die Flurzusage wird keine stille Einplanung, sondern `AEN-012` mit Status. Beide Einträge haben eine Adresse; Kap. 6.4.1 legt fest: [[zitat:k6.4.1-p1|Jedes Register hat eine verantwortliche Rolle, einen Pflegezyklus und einen definierten nächsten Schritt.]] Bewertet ist noch nichts – aber jeder weiß, wer als Nächstes dran ist. Über `AEN-012` entscheidet das Änderungsgremium; es tagt monatlich, zzgl. anlassbezogener Sondersitzungen.
:::

::: ebene 3
---
titel: Vertiefung
---
Die beiden Einträge dieser Station in der Register-Abgrenzung (Kap. 6.4.2, 6.4.4) – und der Eintrag, der aus `FRW-002` erst mit der Bestätigung wird:

| Eintrag | Register | Verantwortliche Rolle | Stand | Nächster Schritt |
|---|---|---|---|---|
| `FRW-002` | Frühwarnungsregister | Projektsteuerung | erfasst, nicht bestätigt | bestätigen; bei Bestätigung Risiko |
| `RIS-009` | Risikoregister | Projektsteuerung | noch nicht angelegt – erst nach Bestätigung | Risikominderung oder Entscheidung |
| `AEN-012` | Änderungsregister | Bauherren-PL | Beantragt | Auswirkung, Freigabeweg |

Der Freigabeweg von `AEN-012` folgt der Mandatsleiter (Kap. 4.2): Rund 0,6 Mio. € liegen über 100 TEUR und bis einschließlich 5 Mio. €, also beim Änderungsgremium.
:::

::: ebene 4
---
titel: Nachweis
---
::: zitat k6.4.3-p2
Eine Frühwarnung (EW) ist ein unbewertetes Signal. Wird sie bestätigt, wird daraus ein bewertetes Risiko. Aus Risiken, Änderungen oder Problemen kann Entscheidungsbedarf entstehen; […]
:::

::: zitat k4.2-p3
Als Muster-Mandatsleiter gilt: Die Bauherren-PL gibt bis einschließlich 100 TEUR eigenständig frei; oberhalb von 100 TEUR bis einschließlich 5 Mio. EUR entscheidet das Änderungsgremium; darüber erfolgt die Beschlussfassung durch den Bauherrn im Lenkungskreis.
:::
:::
:::

::: vertiefung kosten
---
titel: Eine Schätzung mit Status
---
Die größere Mensa ist grob auf 0,6 Mio. € geschätzt, noch ohne Termin- und Risikowirkung. Im Änderungsregister steht sie als `AEN-012` mit Status; beschlossen ist nichts. Kap. 6.4.4 nennt die Stufen, die eine Änderung durchläuft: [[zitat:k6.4.4-p1|Änderungen – Beantragt · In Prüfung · Beschlossen · Abgelehnt · Umgesetzt]]
:::

::: vertiefung organisation
---
titel: Eine Leiter statt eines Flurs
---
Rund 0,6 Mio. € liegen nach der Mandatsleiter beim Änderungsgremium; den Vorsitz hat die Geschäftsführung, dazu gehören die Bauherren-PL und das Controlling, bei Nutzerthemen auch Sabine Roth. Kap. 6.4.5 beschreibt den Weg über die Stufen: [[zitat:k6.4.5-p1|Bei Überschreitung von Wert-, Risiko-, Frist- oder Mandatsschwellen wird entlang der Mandatsleiter an die Bauherren-PL, das Änderungsgremium oder zur Beschlussfassung durch den Bauherrn im Lenkungskreis eskaliert.]]
:::

::: vertiefung risiko
---
titel: Zehn Wochen mehr, jetzt mit Nummer
---
Die Lieferzeit der Holzbauelemente steigt von rund 16 auf 26 Wochen. Als `FRW-002` ist sie erfasst; ein bewertetes Risiko wird sie erst mit der Bestätigung. Kap. 4.4 sagt, wo die Bewertung endet: [[zitat:k4.4-p1|Risiken können analysiert, bewertet und gemindert werden. Die Annahme wesentlicher Risikoexposition bleibt jedoch eine Bauherrenentscheidung.]]
:::

::: vertiefung freigaben
---
titel: Freigabeweg ist nicht Freigabe
---
Über `AEN-012` entscheidet das Änderungsgremium. Die Freigabe zum Abschluss von LPH 5 erteilt der Bauherr selbst auf Vorlage der Bauherren-PL – und dann muss sichtbar sein, welche Änderungen seit der Freigabe zum Abschluss von LPH 4 hinzugekommen sind. Die Datenstandslogik in Kap. 4.6 fragt danach: [[zitat:k4.6-p2|Welche Änderungen wurden seit der letzten Freigabe aufgenommen?]]
:::

::: standpunkt gf
---
figur: deppe
---
„Im Flur war das gut gemeint. Jetzt steht die Mensa als Antrag im Register – und im Änderungsgremium habe ich den Vorsitz.“
:::

::: standpunkt bauherr
---
figur: olbers
---
„Ich weiß, wo die Mensa entschieden wird. Ob wir das Terminrisiko für die Förderfrist tragen, entscheide am Ende ich.“
:::

::: standpunkt pl
---
figur: sie
---
„`FRW-002` und `AEN-012` stehen im Register. Bewertet ist keins – und beide hängen an der Förderfrist.“
:::

::: standpunkt ps
---
figur: brenner
---
„`FRW-002` ist erfasst, bestätigt noch nicht. Und die Mensa will auch aufbereitet werden – beides in einer Woche.“
:::

::: standpunkt planung
---
figur: hoffmeister
---
„Eine Skizze für 450 Essen habe ich, dazu eine Lieferzeit, die jemand bestätigen muss. Womit fange ich an?“
:::

::: standpunkt controlling
---
figur: kaya
---
„0,6 Mio. € mit Status ‚Beantragt‘. Wenigstens weiß ich, welchen Status die Zahl hat.“
:::

::: nachweis
---
mandat: Änderungsgremium unter Vorsitz der Geschäftsführung – rund 0,6 Mio. € liegen über 100 TEUR und bis einschließlich 5 Mio. €.
freigabe: Berührt die Freigabe zum Abschluss von LPH 5 – dort muss AEN-012 sichtbar sein; für die Änderung selbst sind Auswirkung und Freigabeweg der nächste Schritt.
kennung: AEN-012 · Mensa für den Ganztag, Status „Beantragt“.
datenstand: Grobe Schätzung der Generalplanung, rund 0,6 Mio. € – Auswirkung noch nicht bewertet.
nachweis: Eintrag im Änderungsregister nach der Mail von Sabine Roth – aus der Flurzusage wird ein Antrag.
beschlusslage: Offen – das Änderungsgremium tagt monatlich, zzgl. anlassbezogener Sondersitzungen.
---
:::

::: regie
### Notiz
B2 zeigt dasselbe Ereignis wie A2 – dieselbe Förderfrist, derselbe Wunsch. Welt B ist nicht schneller, sondern geordneter: `FRW-002` ist erfasst, aber noch nicht bestätigt; `AEN-012` ist beantragt, aber weder bewertet noch auf der Tagesordnung. Diese Schritte lösen erst die Optionen aus – nicht vorwegnehmen. Die Flurzusage nicht verurteilen: Sie ist jetzt ein Antrag. Zuerst den Regler zeigen, dann die Mandatsleiter.

### Leitfragen
- Wo landet bei Ihnen ein Signal zu einer Förderfrist – und wer bestätigt es?
- Wie wird bei Ihnen aus einem Nutzerwunsch eine beantragte Änderung mit Auswirkung und Freigabeweg?
- Wer entscheidet bei Ihnen über 0,6 Mio. € – und steht das vorher fest?
:::
