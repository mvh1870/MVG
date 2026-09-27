---
id: B2
welt: B
monat: 3
titel: Erstes Signal – mit MVG
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
Dienstag, 10. März. Seit Februar steht das Projekt in LPH 5. Dieselbe Marktabfrage, dieselbe Mail, derselbe Satz im Flur. Diesmal hat jedes Stück eine Kennung: Die Lieferzeit steht als Frühwarnung `FRW-002` im Register, bestätigt ist sie noch nicht. Der Mensa-Wunsch steht als Änderung `AEN-012` im Änderungsregister – Status „Beantragt“, die Auswirkung noch nicht bewertet. Aus der Flurzusage ist ein Antrag geworden.

::: protokoll
---
titel: Marktabfrage Holzbau (Generalplanung)
datum: 10. März 2026
---
- Holzbauelemente: Lieferzeit jetzt rund 26 Wochen statt 16.
- Varianten werden durchgerechnet.
- Terminwirkung: nicht bewertet.
:::

::: chat
---
von: brenner
zeit: "10:48"
---
Marktabfrage Holzbau kam nach dem Jour fixe – ist jetzt als `FRW-002` im Frühwarnungsregister erfasst. Unbewertet, bestätigt ist noch nichts. Nächste Risikosichtung: Dienstag, 17. März.
:::

::: mail
---
von: roth
betreff: Mensa für den Ganztag
zeit: "11:09"
---
Der Ganztag wird größer als geplant. Die Kinder brauchen eine Mensa für rund 450 statt 300 Essen; die Generalplanung schätzt grob 0,6 Mio. €. Herr Deppe hat mir im Flur schon gesagt: „Wir kriegen das hin.“ Ich gehe davon aus, dass das gilt.
:::

::: datei
---
name: Änderungsregister · AEN-012 · Mensa für den Ganztag
quelle: Bauherren-PL
wert: Beantragt · Auswirkung offen
---
Angelegt nach der Mail von Sabine Roth; grobe Schätzung der Generalplanung, noch ohne Termin- und Risikowirkung.
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
Derselbe Vormittag, dieselben Stücke – in Welt B hat jedes eine Kennung und einen nächsten Schritt. Aus einer Änderung kann Entscheidungsbedarf entstehen; der nächste Schritt für `AEN-012` sind Auswirkung und Freigabeweg.
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
Lieferzeit Holz: 26 statt 16 Wochen – was heißt das für den Termin?

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
Mensa für den Ganztag – „Wir kriegen das hin.“

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
lose Notizen
:::

::: kennzahl
---
a: 0
b: 2
---
Einträge mit Kennung
:::

### Welt A
Welt A: eine Terminfrage auf einer Haftnotiz, eine Zusage aus dem Flur und niemand, der weiß, wer über 0,6 Mio. € entscheidet.

### Welt B
Welt B: dasselbe Terminsignal, derselbe Wunsch – aber als Frühwarnung und als beantragte Änderung, jede mit Register, Rolle und nächstem Schritt.
:::

::: schritt register
---
titel: Zwei Einträge, zwei Wege
kurz: Register
---
Die Register-Abgrenzung sagt für beide Einträge, was als Nächstes kommt: Die Frühwarnung wird bestätigt oder nicht, die Änderung braucht Auswirkung und Freigabeweg.

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
unbewertetes Signal · Quelle: Marktabfrage der Generalplanung
:::

::: glied
---
art: bestaetigung
von: brenner
---
### Titel
Bestätigung · steht aus

### Text
nächste Risikosichtung im Jour fixe, Dienstag, 17. März · Projektsteuerung
:::

::: glied RIS-009
---
art: risiko
---
### Titel
Risiko · erst nach Bestätigung

### Text
„Lieferzeit Holzbauelemente“ · Terminwirkung noch nicht bewertet
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
Rund 0,6 Mio. € liegen über 100 TEUR und bis einschließlich 5 Mio. € – über `AEN-012` entscheidet das Änderungsgremium unter Vorsitz von Frank Deppe. Es tagt monatlich, zzgl. anlassbezogener Sondersitzungen.
:::

::: merksatz
**Kein Flur, keine Haftnotiz:** Die Lieferzeit hat eine Nummer, die Mensa einen Antrag – und beide einen Weg.
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
name: Änderungsregister · AEN-012 · Mensa für den Ganztag
quelle: Bauherren-PL
wert: Beantragt · Auswirkung offen
---
:::

::: bekannt
- Lieferzeit Holzbauelemente: von rund 16 auf 26 Wochen (Marktabfrage der Generalplanung); als Frühwarnung `FRW-002` im Frühwarnungsregister der Projektsteuerung erfasst, noch nicht bestätigt.
- Nutzerwunsch: Mensa für rund 450 statt 300 Essen, grob 0,6 Mio. € (Schätzung der Generalplanung); als Änderung `AEN-012` im Änderungsregister, Status „Beantragt“.
- Laut Sabine Roth ist im Flur gesagt worden: „Wir kriegen das hin.“ Im Register steht der Wunsch als beantragt, nicht als beschlossen.
- Mandatsleiter: Rund 0,6 Mio. € liegen über 100 TEUR und bis einschließlich 5 Mio. € – zuständig ist das Änderungsgremium.
:::

::: unbekannt
- Terminwirkung der Lieferzeit {#terminwirkung}
- Termin- und Risikowirkung der Mensa {#mensa-wirkung}
- Wann das Änderungsgremium über `AEN-012` entscheidet {#gremium}
- Ob Sabine Roth weiß, dass ihr Wunsch beantragt und nicht beschlossen ist {#nutzerseite}
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
Eine Frühwarnung ist ein unbewertetes Signal; wird sie bestätigt, wird daraus ein bewertetes Risiko. Eine gewollte Änderung gehört ins Änderungsregister, ihr nächster Schritt heißt Auswirkung und Freigabeweg.
:::

::: ebene 2
---
titel: Warum relevant
---
In Monat 3 trifft Welt B dasselbe Ereignis wie Welt A: dasselbe Terminsignal, derselbe Wunsch. Der Unterschied liegt im Umgang. Die Lieferzeit wird kein Satz im Statusbericht, sondern `FRW-002`; die Flurzusage wird keine stille Einplanung, sondern `AEN-012` mit Status. Beide Einträge haben eine Adresse; Kap. 6.4.1 legt fest: [[zitat:k6.4.1-p1|Jedes Register hat eine verantwortliche Rolle, einen Pflegezyklus und einen definierten nächsten Schritt.]] Bewertet ist damit noch nichts – aber jeder weiß, wer als Nächstes dran ist.
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
Rund 0,6 Mio. € liegen nach der Mandatsleiter beim Änderungsgremium; den Vorsitz hat Frank Deppe, dazu gehören die Bauherren-PL und Aylin Kaya, bei Nutzerthemen auch Sabine Roth. Kap. 6.4.5 beschreibt den Weg über die Stufen: [[zitat:k6.4.5-p1|Bei Überschreitung von Wert-, Risiko-, Frist- oder Mandatsschwellen wird entlang der Mandatsleiter an die Bauherren-PL, das Änderungsgremium oder zur Beschlussfassung durch den Bauherrn im Lenkungskreis eskaliert.]]
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
„Die Mandatsleiter habe ich selbst festgelegt. Ich weiß, wo die Mensa entschieden wird – was ich Frau Roth sage, wenn sie anruft, noch nicht.“
:::

::: standpunkt pl
---
figur: sie
---
„`FRW-002` und `AEN-012` stehen im Register. Bewertet ist noch keins von beiden – und beide hängen am Termin.“
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
„Eine Skizze für 450 Essen habe ich schon, dazu eine Lieferzeit, die jemand bestätigen muss. Womit fange ich an?“
:::

::: standpunkt controlling
---
figur: kaya
---
„0,6 Mio. € mit Status ‚Beantragt‘. Wenigstens weiß ich, welchen Status die Zahl hat.“
:::

::: regie
### Notiz
B2 zeigt dasselbe Ereignis wie A2 – dieselbe Lieferzeit, derselbe Wunsch. Welt B ist nicht schneller, sondern geordneter: `FRW-002` ist erfasst, aber noch nicht bestätigt; `AEN-012` ist beantragt, aber weder bewertet noch auf der Tagesordnung. Diese Schritte lösen erst die Optionen aus – nicht vorwegnehmen. Die Flurzusage nicht verurteilen: Sie ist jetzt ein Antrag. Zuerst den Regler zeigen, dann die Mandatsleiter.

### Leitfragen
- Wo landet bei Ihnen ein Signal, bevor jemand es bewertet – und wer bestätigt es?
- Wie wird bei Ihnen aus einem Nutzerwunsch eine beantragte Änderung mit Auswirkung und Freigabeweg?
- Wer entscheidet bei Ihnen über 0,6 Mio. € – und steht das vorher fest?
:::
