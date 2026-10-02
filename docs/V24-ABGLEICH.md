# Abgleich der Inhalte mit dem Standard V2.4

Stand: 2026-10-02 · Grundlage: O-36 bis O-49, `quellen/v2.4/` (Handbuch, Teilleistungsbild, Ausschreibung, Vertragsanlage Teil A).
Arbeitspapier, nur intern. Die Fundstellen dienen der Nachprüfung und erscheinen nie auf der Seite (O-37, O-38).

## Lesehilfe

- **K** = Kollision: V2.4 regelt die Stelle anders. Die Stelle muss geändert werden, denn V2.4 geht vor (O-36).
- **E** = Ergänzung: Die Stelle ist mit V2.4 vereinbar, sollte aber um den V2.4-Kern ergänzt werden (zum Beispiel MCDA oder Pflege durch die Projektsteuerung).
- **H** = Hinweis: Technik oder Abhängigkeit, die zur Umsetzung gehört (zum Beispiel eine Tafel, die wörtlich aus `whitepaper.json` kommt). Dazu gehören auch Stellen, die schon mit O-38 oder O-40 entfallen.
- Kürzel der Fundstellen: **HB** = `handbuch.md` (Abschnitt), **TLB** = `teilleistungsbild.md`, **AS** = `ausschreibung.md`, **VA** = `vertragsformulierungen-teil-a.md` (Ziffer).
- Die Zeilen nennen die Zeilennummer in der Datei, so wie sie beim Abgleich im Arbeitsbaum stand. `src/ui/woerter.ts` und `werkzeuge/inhalte.mjs` waren dabei schon ungecommittet geändert; bei Abweichungen gilt das Zitat, nicht die Zeilennummer.
- Die Vorschläge sind neue Sätze für die Seite. Sie enthalten keine Vertragstexte (O-37) und keinen Bezug zum Whitepaper (O-38). Jeder Vorschlag lässt sich auf die genannte V2.4-Stelle zurückführen.

## 0. V2.4-Kernregeln (Bezugspunkte der Einträge)

| Nr. | Regel | Fundstelle |
|---|---|---|
| R1 | Die Projektsteuerung bearbeitet und pflegt **alle** Vorgangsarten: Aufgaben, Maßnahmen, Frühwarnungen, Risiken, Probleme, Änderungen und Entscheidungsvorbereitungen. Sie verfolgt auch Umsetzung, Wirkung und Abschluss. Sie nimmt der befugten Stelle die operative Vorbereitung und Nachverfolgung ab. | HB 1 (Abs. 1, 4), HB 5; TLB 1, TLB 2 („Dokumentieren und berichten“); VA 2.1, 6.1 |
| R2 | Ein Informationsstand: Die vom Auftraggeber bereitgestellte Software ist maßgeblich. Eigene Arbeitsmittel sind erlaubt, die Inhalte werden aber fristgerecht übertragen. Parallele Listen sind nicht erforderlich. Ein freiwilliger Fallhelfer ersetzt die Dokumentation nicht. | HB 5; TLB 2 (Satz nach der Tabelle); AS 4; VA 6.1, 6.4 |
| R3 | Für jede erforderliche Handlungsentscheidung erstellt die Projektsteuerung eine Entscheidungsvorlage. Sie enthält mindestens **zwei ernsthafte, zulässige Optionen**, eine **MCDA**, eine begründete Empfehlung, die befugte Stelle und den Entscheidungstermin. Die Projektsteuerung trifft, genehmigt oder bestätigt die Entscheidung nie selbst. | HB 3, HB 3.1; TLB 2.1; AS 2; VA 3.1–3.2, 4.1 |
| R4 | MCDA: Die Kriterien kommen aus den Projektzielen. Kriterien, Gewichte und Skalen werden **vor der Bewertung** mit dem Auftraggeber abgestimmt. Gewichte und Punkte liegen zwischen 1 und 5, die Summe bildet Gewicht mal Punkte. Euro, Termine und offene Fragen bleiben neben den Punkten sichtbar, fehlende Angaben gelten nicht als null. Muss-Anforderungen werden vorab geprüft, eine unzulässige Option kann nicht gewinnen. Die **Gewichtungsabhängigkeit** wird geprüft, und eine Punktzahl ersetzt kein Urteil. Fehlt eine Option, wird die Vorlage als unvollständig gekennzeichnet; eine Scheinoption ist ausgeschlossen. | HB 3.1; TLB 2.1; VA 3.3, 3.4 |
| R5 | Der Beschluss wird **getrennt** dokumentiert, mit Quelle, Datum und Bedingungen. Schweigen, eine Empfehlung, ein Softwarestatus oder eine MCDA-Punktzahl sind kein Beschluss. Bleibt die Entscheidung aus, nennt die Projektsteuerung einen neuen Klärungstermin und die Folgen. | HB 1 (Tabelle, Zeile „Entscheidung vorbereiten“), HB 3.1; VA 3.5, 4.2 |
| R6 | Die **befugte Auftraggeberstelle** entscheidet über Ziele, wesentliche Abweichungen, Mittel, Risikoannahmen und Freigaben. Befugnisse und Schwellen legt der Auftraggeber fest. Die Projektsteuerung erhält keine zusätzliche Vollmacht. | HB 1 (Abs. 5), Projektblatt „Befugnisse und Schwellen“; TLB 3; VA 4.1 |
| R7 | Risikobewertung: Die Wahrscheinlichkeit hat fünf Stufen. Kosten, Termine (Kalendertage am Zieltermin) und Qualität oder Funktion haben je fünf Stufen; ein Wert auf einer Grenze zählt zur niedrigeren Stufe. Die **5×5-Matrix** ergibt sich aus der Wahrscheinlichkeit mal der höchsten belegten Auswirkung: 1–4 beobachten, 5–9 gezielt bearbeiten, 10–25 vorrangig bearbeiten, Auswirkung 5 immer vorrangig. Die Punkte sind keine Geldwerte und keine Freigabe. Besondere Warnanlässe gelten unabhängig von der Matrix. Wesentlich ist ein Risiko, wenn es vorrangig ist, eine Entscheidungsschwelle erreicht oder einen Warnanlass betrifft. Eine nur geplante Maßnahme senkt die Bewertung nicht. | HB 2, HB 3 |
| R8 | Wege der Vorgänge: Eine Frühwarnung wird nach ihrer Klärung zum Risiko, zum Problem oder zur Aufgabe, oder sie wird begründet geschlossen. Aufgaben, Probleme und Änderungen werden auch ohne Risikoeintrag bearbeitet. Tritt ein Risiko ein, wird ein Problem daraus. Die Herkunft bleibt verknüpft, nichts wird doppelt gezählt. | HB 1, 1.1–1.6; TLB 1; VA 2.8 |
| R9 | Takt: In aktiven Zeiten prüft die Projektsteuerung **jede Woche den gesamten offenen Bestand** aller Vorgangsarten und die offenen Entscheidungen und hält das mit einem Prüfvermerk fest. Neue Hinweise nimmt sie spätestens bei der nächsten wöchentlichen Prüfung auf. In Ruhezeiten prüft sie **monatlich**, neue Hinweise erfasst sie binnen fünf Arbeitstagen. **Dringliches** meldet sie sofort und dokumentiert es am selben Arbeitstag. | HB 4; AS 2; VA 5.1, 5.2 |
| R10 | **Monatstermin** online bis 60 Minuten mit Auftraggeber und Projektsteuerung, Fachleute nach Bedarf; in Ruhezeiten nur bei Bedarf. **Monatsbericht** von höchstens einer Seite: über alle Vorgangsarten, aus demselben Informationsstand, ohne zweite Liste. Zusätzliche Workshopreihen sind nicht vorgesehen. | HB 4; AS 2; VA 5.3 |
| R11 | Abschluss: Geschlossen wird nur mit nachgewiesenem Grund. Umgesetzt und wirksam sind nicht dasselbe. Eine Übergabe ist keine Erledigung. | HB 1.6, HB 5; VA 10.1 |
| R12 | Der Auftraggeber stellt Ziele, Bewertungsgrenzen, Befugnisse, Zugänge und Zuarbeit sicher. Er **pflegt nichts**, er **entscheidet** (O-36). | TLB 3; VA 7.1; O-36 |

## 1. Theorie: `inhalte/theorie/`

### k01-kurzfassung.md

- **k01-E1** · Z. 48–51 · „Kosten- und Terminfolgen zweier Varianten durchrechnen … Planer oder Projektsteuerung können sie übernehmen.“
  - V2.4: Die Analyse wird zum Optionenvergleich mit MCDA und Empfehlung der Projektsteuerung (R3, R4; HB 3.1).
  - Vorschlag (Erklärung): „Analyse ist Arbeit. Die Projektsteuerung vergleicht mindestens zwei zulässige Optionen nach gewichteten Kriterien und empfiehlt eine – gewählt wird beim Bauherrn.“
- **k01-E2** · Z. 71 · „Koordination ist klassische Zuarbeit, etwa durch die Projektsteuerung oder ein PMO.“
  - V2.4: Die Bearbeitung und Pflege aller Vorgänge liegt bei der Projektsteuerung (R1).
  - Vorschlag: „Koordination ist Zuarbeit. Im Standard führt die Projektsteuerung dazu alle offenen Vorgänge an einer Stelle.“
- **k01-E3** · Z. 81 · „Andere können das Risiko bewerten, annehmen muss es der Bauherr.“
  - V2.4: Die Projektsteuerung bewertet nach der 5×5-Matrix und bereitet die Risikoannahme als Entscheidung vor; selbst nimmt sie das Risiko nicht an (R7; HB 1.3, HB 2).
  - Vorschlag: „Die Risikoannahme ist Legitimation. Die Projektsteuerung bewertet das Risiko und legt die Annahme als Entscheidung vor – annehmen muss es der Bauherr.“
- **k01-E4** · Z. 91 · „Dokumentation ist delegierbar. Dass die Beschlusslage nachweisbar bleibt, verantwortet dagegen der Bauherr.“
  - V2.4: Den tatsächlichen Beschluss dokumentiert die Projektsteuerung getrennt von der Vorlage (R5).
  - Vorschlag (Satz anhängen): „Den Beschluss hält die Projektsteuerung getrennt von der Vorlage fest – mit Quelle, Datum und Bedingungen.“
- **k01-E5** · Z. 135 (Karte „Projektsteuerung“) · „Sie unterstützt bei Kosten, Terminen, Qualität, Koordination und Berichten. Die Entscheidung des Bauherrn ersetzt sie nicht.“
  - V2.4: R1, R3. Diese Karte trägt die Kernaussage von V2.4.
  - Vorschlag: „Sie bearbeitet alle Vorgänge – Aufgaben, Maßnahmen, Frühwarnungen, Risiken, Probleme, Änderungen – und bereitet jede Entscheidung mit mindestens zwei Optionen vor. Die Entscheidung des Bauherrn ersetzt sie nicht.“
- **k01-E6** · Z. 231 (Tafel `k1.3-t1`, Zeile „Standard für Entscheidungsvorlagen“) · „… Entscheidungsfrage, Alternativen, Annahmen, Risiken, Datenstand, Empfehlung, Freigabe und Beschlusslage.“
  - V2.4: R3, R4, R5.
  - Vorschlag (eigene Karte statt Tafel): „Sichert die Nachvollziehbarkeit von Entscheidungsfrage, mindestens zwei zulässigen Optionen, MCDA-Vergleich, Annahmen, Risiken, Datenstand, Empfehlung und Freigabe; der Beschluss wird getrennt festgehalten.“ (H: Der Tafeltext kommt wörtlich aus `whitepaper.json`, siehe Abschnitt 8.)
- **k01-E7** · Z. 271 (Regie) · „Sie unterstützt, ersetzt aber keine bauherrenseitige Entscheidung“.
  - V2.4: wie k01-E5.
  - Vorschlag: „Die Karte ‚Projektsteuerung‘ trägt: Sie bearbeitet alles und bereitet jede Entscheidung vor, entscheidet aber nie selbst.“
- **k01-H1** · Z. 263 (Querverweis Prolog, „Welt A ohne MVG, dann Welt B“) – entfällt mit O-40.

### k02-ausgangslage.md

- **k02-E1** · Z. 133 · „Vor einer wichtigen Freigabe fällt die Person aus, die die Kostenstände als Einzige vollständig kennt.“
  - V2.4: Aus dem Eintrag muss auch bei einem Bearbeiterwechsel hervorgehen, was bekannt ist und was noch offen ist (HB 2, Abs. 1); maßgeblich ist der eine Stand in der Software (R2).
  - Vorschlag (Satz anhängen): „Im Standard steht dieses Wissen nicht in einer persönlichen Datei, sondern in den Einträgen der Projektsteuerung – so, dass auch eine Vertretung erkennt, was bekannt ist und was noch geklärt werden muss.“
- **k02-E2** · Z. 215 · „Die Antwort sind mehr Berichte, mehr Abstimmung, mehr Gremienvorlagen, mehr Eskalationsrunden.“
  - V2.4: ein Monatsbericht von höchstens einer Seite und ein Monatstermin bis 60 Minuten (R10).
  - Vorschlag (rechte Ansicht, Satz anhängen): „Im Standard genügt ein Monatsbericht von höchstens einer Seite – entscheidend ist, dass er die offenen Entscheidungen und die benötigte Reaktion zeigt.“
- **k02-E3** · Z. 234–237 (Wissenscheck) · „… jeden Monat einen ausführlichen Ampelbericht, aber keine Entscheidungsfrage …“
  - V2.4: Der Bericht zeigt offene Entscheidungen und die benötigte Reaktion (HB 4, Abs. 6).
  - Vorschlag (Erklärung, Satz anhängen): „Ein kurzer Monatsbericht, der offene Entscheidungen und die benötigte Reaktion nennt, leistet mehr als ein langer ohne Frage.“
- **k02-E4** · Z. 267 · „Die Antwort ist ein verbindlicher Standard für Entscheidungsvorlagen mit einer Entscheidungsfrage je Eskalation.“ (ebenso Tafel `k2.5-t1`, Zeile „Eskalation ohne Entscheidung“, Z. 273)
  - V2.4: R3, R4.
  - Vorschlag: „Die Antwort: Zu jeder Eskalation legt die Projektsteuerung eine Vorlage mit Entscheidungsfrage, mindestens zwei zulässigen Optionen, gewichtetem Vergleich und Empfehlung vor.“
- **k02-E5** · Z. 35 / 43 (Umschalter Grauzonen) · „Risiken sind bekannt.“ / „Die Risiken sind nicht entscheidungsreif.“
  - V2.4: Eine bloße Liste bekannter Risiken genügt nicht; die Bewertung ergibt die Priorität (HB 1.3, R7).
  - Vorschlag (rechts): „Die Risiken stehen in einer Liste, aber niemand hat bewertet, welche vorrangig sind und welche Entscheidung sie brauchen.“
- **k02-H1** · Z. 271 · „(Kapitel 7.1) … Kapitel 3“ – Kapitelbezüge entfallen (O-38).
- **k02-H2** · Z. 280–327 · Querverweise A1–A6, Wendepunkt, B3, B6 – entfallen (O-40).

### k03-begriffsrahmen.md

- **k03-E1** · Z. 108 · „Die Vorbereitung einer Entscheidungsvorlage ist delegierbar – die Entscheidung über Projektstart, Fortführung oder Stopp nicht.“ (ebenso Tafel `k3.2-t1`, Zeile 2, Z. 114)
  - V2.4: Die Vorbereitung liegt bei der Projektsteuerung, mit Pflichtinhalt (R3, R4).
  - Vorschlag: „Die Vorbereitung einer Entscheidungsvorlage ist delegierbar – im Standard an die Projektsteuerung, mit mindestens zwei zulässigen Optionen und gewichtetem Vergleich. Die Entscheidung über Projektstart, Fortführung oder Stopp ist es nicht.“
- **k03-E2** · Z. 122–140 (Wissenscheck) · „Die Projektsteuerung hat die Varianten analysiert und die Entscheidungsvorlage vorbereitet …“
  - V2.4: R3, R5, R6.
  - Vorschlag (Frage): „Die Projektsteuerung hat zwei Optionen verglichen, gewichtet und eine Empfehlung begründet – wer legitimiert die Entscheidung?“; (Antwort b): „Wer die Vorlage erarbeitet, bereitet vor. Auch die Empfehlung und die höchste Punktzahl sind kein Beschluss.“
- **k03-E3** · Z. 176 (Regler, Arbeitsebene) · „… von Planern, Projektsteuerung, PMO, Gutachtern oder Beratern getragen werden.“
  - V2.4: R1. Fachleute liefern zu, die Projektsteuerung führt zusammen (TLB 3).
  - Vorschlag (Satz anhängen): „Die laufende Bearbeitung aller Vorgänge liegt im Standard bei der Projektsteuerung; die Fachleute liefern ihr zu.“
- **k03-E4** · Z. 155 · „Es innerhalb klar definierter Schwellen auszuüben, kann er an Rollen übertragen.“
  - V2.4: Befugnisse und Schwellen legt der Auftraggeber verbindlich fest (R6).
  - Vorschlag (Satz anhängen): „Diese Schwellen stehen schriftlich fest, bevor die erste Vorlage kommt.“
- **k03-H1** · Z. 205, 212, 219 · Querverweise Wendepunkt, B5 und Ende „Neufestlegung … im Lenkungskreis“ – entfallen (O-40).

### k04-verantwortungsfelder.md

- **k04-E1** · Z. 96–99 (Sortieren, Posten 5) · „Vorlagen, Optionen und Empfehlungen sind delegierbar.“
  - V2.4: R3, R4.
  - Vorschlag (Erklärung): „Vorlagen mit mindestens zwei Optionen, gewichtetem Vergleich und Empfehlung erarbeitet die Projektsteuerung.“
- **k04-E2** · Z. 116–119 (Posten 7) · „Das Risikoregister führen und Risikominderung vorschlagen – Register, Bewertung und Vorschläge sind Vorbereitung.“
  - V2.4: R1, R7.
  - Vorschlag (Posten): „Risiken bewerten, Gegenmaßnahmen vorschlagen und ihre Wirkung verfolgen“; (Erklärung): „Das übernimmt die Projektsteuerung.“
- **k04-E3** · Z. 146–149 (Posten 10) · „Datenpflege ist delegierbar, der verbindliche Datenstand nicht.“
  - V2.4: R1, R2.
  - Vorschlag (Erklärung): „Die Pflege übernimmt die Projektsteuerung in der vom Bauherrn bereitgestellten Software; welcher Datenstand verbindlich gilt, bestimmt der Bauherr.“
- **k04-E4** · Z. 162 / 175 · „MVG setzt dem ein Zielsystem entgegen: Muss-Kriterien, verhandelbare Kriterien, Abwägungsregeln …“
  - V2.4: Die MCDA-Kriterien kommen aus den Projektzielen; Muss-Anforderungen werden vor dem Punktevergleich geprüft (HB 3.1).
  - Vorschlag (Satz anhängen): „Aus diesem Zielsystem leitet die Projektsteuerung später die Kriterien ihres gewichteten Optionenvergleichs ab; Muss-Kriterien prüft sie vor jedem Punktevergleich.“
- **k04-E5** · Z. 184–247 (Muster-Mandatsleiter: „Die Bauherren-PL gibt eigenständig frei“, Änderungsgremium, „Bauherr im Lenkungskreis“)
  - V2.4: Die befugte Stelle und die Schwellen legt der Auftraggeber fest (R6). Die Leiter ist damit vereinbar, aber jede Stufe entscheidet auf eine Vorlage der Projektsteuerung (R3).
  - Vorschlag (Satz nach Z. 188): „Auf jeder Stufe entscheidet die befugte Stelle auf eine Vorlage der Projektsteuerung mit mindestens zwei Optionen und gewichtetem Vergleich; selbst pflegen muss keine Stufe etwas.“ Regler und Wissenscheck bleiben (O-38: Inhalte bleiben). Der Mandatsleiter-Simulator in Explore entfällt (O-46).
- **k04-E6** · Z. 264 · „Vorbereiten dürfen andere – Entscheidungsvorlagen, Auswirkungsanalysen, Optionen, Empfehlungen und Fachbewertungen sind delegierbar.“
  - V2.4: R3, R4, R5.
  - Vorschlag: „Vorbereitet wird sie von der Projektsteuerung: Frage, Entscheidungstermin, mindestens zwei zulässige Optionen, gewichteter Vergleich und Empfehlung. Fachbewertungen liefern die zuständigen Fachleute zu.“
- **k04-E7** · Z. 322 / 324 · „Das Risikoregister ist gepflegt, aber die Risiken werden nur gelistet. … Ein Risiko ist dann mehr als ein Eintrag: … eine Eskalationsschwelle.“
  - V2.4: Vereinbar (HB 1.3: „Eine bloße Liste bekannter Risiken genügt nicht“). Es fehlt die Bewertungslogik (R7).
  - Vorschlag (Satz anhängen): „Die Projektsteuerung bewertet jedes Risiko nach Wahrscheinlichkeit und höchster Auswirkung: 1 bis 4 Punkte heißt beobachten, 5 bis 9 gezielt bearbeiten, ab 10 – und bei schwerster Auswirkung immer – vorrangig. Ob ein wesentliches Restrisiko getragen wird, legt sie dem Bauherrn als Entscheidung vor.“
- **k04-E8** · Z. 337 (Umschalter rechts) · „… und eine Eskalationsschwelle sagt, wann es eskaliert wird.“
  - V2.4: Bei vorrangigen Risiken informiert die Projektsteuerung den Auftraggeber und bereitet rechtzeitig vor; Warnanlässe gelten unabhängig von der Matrix (HB 3).
  - Vorschlag: „… Vorrangige Risiken meldet die Projektsteuerung dem Bauherrn und bereitet die Entscheidung vor; Fragen der Sicherheit oder Genehmigung warten auf keine Bewertung.“
- **k04-E9** · Z. 350 · „Die Vorbereitung – Unterlagenpakete, Prüfvermerke, Planungsstände, Freigabevorschläge, Gremienberichte – kann delegiert werden; die Freigabe selbst nicht.“
  - V2.4: R1, R6.
  - Vorschlag: „Die Vorbereitung übernimmt die Projektsteuerung; die Freigabe selbst erteilt der Bauherr.“
- **k04-E10** · Z. 401 · „Der Bauherr muss die Daten nicht selbst pflegen – Datenpflege, Dokumentation, Protokolle und Annahmenregister kann er abgeben.“
  - V2.4: R1, R2, R12.
  - Vorschlag: „Der Bauherr pflegt die Daten nicht selbst: Die Projektsteuerung führt alle Vorgänge in der vom Bauherrn bereitgestellten Software. Das ist der eine maßgebliche Stand, aus dem auch der Monatsbericht entsteht.“
- **k04-K1** · Z. 493 (Querverweis B6) · „… der Bauherr erteilt sie auf Vorlage der Bauherren-PL …“
  - V2.4: Die Vorbereitung liegt bei der Projektsteuerung (R1, R3). Die Stelle entfällt ohnehin mit der Story (O-40); in neuen Querverweisen gilt die neue Fassung.
  - Vorschlag: „… der Bauherr erteilt sie selbst; vorbereitet hat sie die Projektsteuerung.“
- **k04-H1** · Z. 419–493 · übrige Querverweise A2–A5, Wendepunkt, B1–B5 – entfallen (O-40).

### k05-fuehrungsmodell.md

- **k05-E1** · Z. 68 · „… mit klarer Entscheidungsfrage, bekannten Optionen und transparenten Annahmen …“ (ebenso Sortieren, Posten 3, Z. 102: „Eine klare Entscheidungsfrage und bekannte Optionen“)
  - V2.4: R3, R4.
  - Vorschlag: „… mit klarer Entscheidungsfrage, mindestens zwei zulässigen und nach denselben Kriterien verglichenen Optionen und transparenten Annahmen …“; Posten 3: „Eine klare Entscheidungsfrage und mindestens zwei verglichene Optionen“.
- **k05-E2** · Z. 151 · „Die Risiko-/Änderungs-/Maßnahmenverknüpfung verbindet Risiken, Änderungen und Maßnahmen mit Entscheidungen.“ (ebenso Tafel `k5.2-t1`)
  - V2.4: sechs Vorgangsarten, verknüpft, ohne Doppelzählung (R8; HB 1, Abs. 3).
  - Vorschlag (Satz anhängen): „Im Standard umfasst das alle Vorgangsarten – Aufgaben, Maßnahmen, Frühwarnungen, Risiken, Probleme und Änderungen. Zusammengehöriges wird verknüpft, nichts wird doppelt gezählt.“
- **k05-K1** · Z. 171 · „Und die Bauherren-PL bekommt eine handhabbare Logik für Vorbereitung, Nachverfolgung und Eskalation.“
  - V2.4: Die Projektsteuerung nimmt der befugten Stelle die operative Vorbereitung und Nachverfolgung ab (HB 1, Abs. 5; R1).
  - Vorschlag: „Und die Bauherrenseite bekommt eine handhabbare Logik: Vorbereitung und Nachverfolgung übernimmt die Projektsteuerung, die befugte Stelle entscheidet.“
- **k05-E3** · Z. 177–223 (Etappen „Was eine wesentliche Änderung führbar macht“) · Etappe 5 „Die Vorlage enthält eine Empfehlung.“, Etappe 7 „Die Beschlusslage ist nachgewiesen.“
  - V2.4: R4, R5; bis zur Freigabe bleibt die bisherige Grundlage maßgeblich (HB 1.5).
  - Vorschlag: neue Etappe zwischen 4 und 5, „Optionen und MCDA: Mindestens zwei zulässige Optionen werden mit vorab abgestimmten Gewichten verglichen; geprüft wird, ob andere vertretbare Gewichte die Rangfolge ändern.“ Etappe 7: „Der tatsächliche Beschluss ist getrennt von der Vorlage festgehalten, die Umsetzung wird verfolgt. Bis dahin gilt die bisherige Grundlage.“
- **k05-H1** · Z. 154 · „… in Kapitel 6 und … in Kapitel 9“ – Kapitelbezug entfällt (O-38).
- **k05-H2** · Z. 352–363 · Querverweise Rückspulen, B1 – entfallen (O-40).

### k06-companion.md (Schwerpunkt des Abgleichs)

- **k06-E1** · Z. 27 (Kernaussage) · „Tragend ist, dass Register, Rollen und Takte eindeutig zusammenarbeiten.“
  - V2.4: R1, R9.
  - Vorschlag: „Tragend ist, dass alle Vorgänge in einer Hand liegen – bei der Projektsteuerung –, in einem festen Takt geprüft werden und auf einem Informationsstand beruhen.“
- **k06-E2** · Z. 63 (und Tafel `k6.1-t1`, Zeile „Entscheidungsassistent“) · „Der Entscheidungsassistent führt durch Entscheidungsfrage, Mandat, Freigabe, Datenstand und Nachweis.“
  - V2.4: R3, R4.
  - Vorschlag (Satz anhängen): „In der Vorlage gehören dazu mindestens zwei zulässige Optionen und ihr gewichteter Vergleich.“
- **k06-E3** · Z. 122 / 124 · „Das Führungsmodell funktioniert auch mit den Büro- und Projektwerkzeugen …“ / „Führend bleiben dabei die Datenquellen und Dokumentenstände, die der Bauherr freigegeben hat.“
  - V2.4: Maßgeblich ist die vom Auftraggeber bereitgestellte Software; ein freiwilliger Fallhelfer ersetzt diese Dokumentation nicht (R2; HB 5).
  - Vorschlag (Satz anhängen): „Maßgeblich bleibt die Software, die der Bauherr bereitstellt. Ein zusätzliches Hilfsmittel ersetzt die Einträge dort nicht.“
- **k06-K1** · Z. 199 · „… gemeinsamen Arbeitsstandard für die verantwortlichen Rollen, die Bauherren-PL, das PMO, das Controlling und den Lenkungskreis.“
  - V2.4: R1, R12.
  - Vorschlag: „… sondern um einen gemeinsamen Arbeitsstandard: Die Projektsteuerung bearbeitet alle Vorgänge, die Fachleute liefern zu, die befugte Stelle des Bauherrn entscheidet.“
- **k06-K2** · Z. 201 · „Wer pflegt welches Register? … Hat in Ihrem Projekt jedes Register eine verantwortliche Rolle, jedes Thema einen Weg und jede Entscheidung ihren Ort?“
  - V2.4: R1.
  - Vorschlag: „Wer bearbeitet die Vorgänge? Welchen Weg nimmt ein Vorgang? Wann wird entschieden – und von wem? … Liegt in Ihrem Projekt die Bearbeitung aller offenen Vorgänge bei einer Stelle, und hat jede Entscheidung eine Vorlage und einen Termin?“
- **k06-K3** · Z. 211 / 218 (Etappen „Der Aufbau“) · „… von der verantwortlichen Rolle je Register …“ / „Wer pflegt welches Register, in welchem Turnus?“
  - V2.4: R1, R9.
  - Vorschlag: Etappe 1 „… von der einen bearbeitenden Stelle bis zum Monatsbericht“; Etappe 2 „Vorgangsarten und Takt: Wer bearbeitet, wie oft wird geprüft?“
- **k06-K4** · Z. 251 · „Erstens hat jedes Register eine verantwortliche Rolle, einen Pflegezyklus und einen definierten nächsten Schritt.“
  - V2.4: Jeder Vorgang hat Verantwortlichen, nächsten Schritt, Termin und Bearbeitungsstand; gepflegt werden alle von der Projektsteuerung (HB 5, Tabelle „Alle Vorgänge“; R1).
  - Vorschlag: „Erstens führt die Projektsteuerung alle Vorgänge in der bereitgestellten Software; jeder Eintrag hat einen Verantwortlichen, einen nächsten Schritt und einen Termin.“
- **k06-K5** · Z. 253 · „Der Managementbericht – der aggregierte Gremienbericht – ist der gemeinsame Sammelpunkt für Gremien. … Information und Beschlussvorbereitung laufen im Managementbericht zusammen.“ (ebenso Umschalter Z. 262)
  - V2.4: Monatsbericht von höchstens einer Seite, aus demselben Informationsstand, ohne zweite Liste; die Beschlussvorbereitung ist die Entscheidungsvorlage (R3, R10).
  - Vorschlag: „Der Monatsbericht – höchstens eine Seite, aus demselben Stand wie die Software – zeigt wesentliche Veränderungen, blockierte Aufgaben, ungeklärte Frühwarnungen und offene Entscheidungen mit der benötigten Reaktion. Die Beschlussvorbereitung selbst ist die Entscheidungsvorlage.“ Umschalter links: „Der Monatsbericht: eine Seite für den Überblick; er verweist auf die Einträge, statt eine zweite Liste zu führen.“
- **k06-E4** · Z. 253 / 266 · „Sie werden über das Entscheidungsregister und eine Entscheidungsvorlage entscheidungsreif gemacht.“
  - V2.4: R3, R4.
  - Vorschlag (Satz anhängen): „Entscheidungsreif heißt: mindestens zwei zulässige Optionen, gewichteter Vergleich, Empfehlung, befugte Stelle und Termin.“
- **k06-K6** · Z. 275–281 (Registerpflege) · „Die Bauherren-PL pflegt Entscheidungs-, Änderungs- und Freigaberegister … Die Projektsteuerung führt Risiko- und Frühwarnungsregister … Das PMO betreut Maßnahmen- und Problemregister … Nachweise und Verknüpfungen … beim PMO …“
  - V2.4: R1, R2, R9, R12. Das ist die zentrale Kollision.
  - Vorschlag (Abschnitt neu, Titel „Vorgangsarten und Takt“): „Alle Vorgangsarten – Aufgaben, Maßnahmen, Frühwarnungen, Risiken, Probleme, Änderungen und Entscheidungsvorbereitungen – bearbeitet und pflegt die Projektsteuerung in der vom Bauherrn bereitgestellten Software. In aktiven Zeiten prüft sie jede Woche den gesamten offenen Bestand, in Ruhezeiten monatlich; Dringliches meldet sie sofort. Fachbeiträge wie Kostenprognose und Restkosten (CTC) fordert sie bei den zuständigen Stellen an, etwa beim Controlling. Bauherren-PL und Gremien pflegen nichts – sie entscheiden.“
- **k06-K7** · Z. 283–326 (Bedienhinweis und Sortieren „Wer pflegt dieses Register? Bauherren-PL / Projektsteuerung“)
  - V2.4: R1, R3, R6.
  - Vorschlag: Sortieren „Bearbeitet die Projektsteuerung – entscheidet der Bauherr“ mit den Posten: Entscheidungsvorlage mit zwei Optionen erstellen (links) · eine Option wählen (rechts) · Risiko bewerten (links) · ein wesentliches Restrisiko tragen (rechts) · Änderung gegen den geltenden Stand aufbereiten (links) · Änderung freigeben (rechts) · Beschluss mit Quelle und Datum dokumentieren (links).
- **k06-K8** · Z. 330 (Tafel `k6.4.2-t1`) · Registergruppen mit Bauherren-PL, Projektsteuerung, PMO, Controlling.
  - V2.4: R1. Die Tafel kommt wörtlich aus `whitepaper.json`.
  - Vorschlag: Tafel entfernen und durch eigene Karten der Vorgangsarten ersetzen, alle mit „bearbeitet: Projektsteuerung“ (siehe Abschnitt 8).
- **k06-K9** · Z. 341 · „Er beginnt mit einer Frühwarnung: einem Signal, das noch niemand bewertet hat. Erst wenn es bestätigt wird, entsteht daraus ein bewertetes Risiko.“
  - V2.4: R8 (HB 1.2; Aufgaben, Probleme und Änderungen auch ohne Risikoeintrag, HB 1, Abs. 6).
  - Vorschlag: „Ein Vorgang kann als Aufgabe, Frühwarnung, Risiko, Problem oder Änderung beginnen. Eine Frühwarnung ist ein Hinweis, der noch nicht geklärt ist. Nach der Klärung wird sie als Risiko bewertet, als Problem bearbeitet, als Aufgabe weitergeführt oder begründet geschlossen.“
- **k06-E5** · Z. 343 · „Die Entscheidungsvorlage bündelt dann Frage, Datenstand, Optionen, Bewertung und Empfehlung. Was beschlossen wird, verfolgt das Projekt als Maßnahme weiter …“
  - V2.4: R3, R4, R5, R11.
  - Vorschlag: „Die Projektsteuerung bündelt in der Vorlage Frage, Datenstand, mindestens zwei zulässige Optionen, den gewichteten Vergleich und ihre Empfehlung. Den Beschluss hält sie getrennt fest und verfolgt Umsetzung und Wirkung – umgesetzt ist noch nicht wirksam.“
- **k06-K10** · Z. 355–373 (Etappen „Ein Thema läuft durch den Fluss“) · Etappe 1 „Noch ist nicht klar, ob daraus ein Risiko wird.“, Etappe 2 „Bestätigt … Erst jetzt wird daraus ein bewertetes Risiko.“
  - V2.4: R8.
  - Vorschlag: Etappe 2 umbenennen in „Geklärt: Die Prüffrage ist beantwortet. Daraus wird ein Risiko, ein Problem, eine Aufgabe – oder die Frühwarnung wird begründet geschlossen.“ Etappe 3: „… Daraus kann Entscheidungsbedarf entstehen – ebenso aus Aufgaben, Änderungen oder Problemen.“
- **k06-K11** · Z. 397–401 (Etappe 7) · „Managementbericht · Der aggregierte Gremienbericht – zur Information und Beschlussvorbereitung.“
  - V2.4: R10.
  - Vorschlag: „Monatsbericht · Höchstens eine Seite für den Bauherrn: was sich verändert hat und welche Entscheidung ansteht.“
- **k06-K12** · Z. 412–417 (Wissenscheck, Antwort a) · „Ein bewertetes Risiko wird aus der neuen Frühwarnung erst, wenn sie bestätigt wird.“
  - V2.4: R8.
  - Vorschlag: „Ein Risiko wird daraus erst, wenn die Klärung ein mögliches Ereignis ergibt. Sie kann auch zum Problem oder zur Aufgabe werden oder begründet geschlossen werden.“
- **k06-K13** · Z. 440 · „Eine Frühwarnung ist ein unbewertetes Signal. Nächster Schritt: bestätigen – bei Bestätigung wird sie ein Risiko.“
  - V2.4: R8 (HB 1.2).
  - Vorschlag: „Eine **Frühwarnung** ist ein noch ungeklärter Hinweis. Nächster Schritt: Quelle sichern, Prüffrage, Verantwortlichen und Wiedervorlage festlegen; das Ergebnis ist ein Risiko, ein Problem, eine Aufgabe oder die begründete Schließung.“
- **k06-E6** · Z. 441–443 · Risiko „Nächster Schritt: Risikominderung oder Entscheidung“; Problem „eine Maßnahme, gegebenenfalls eine Entscheidung“; Änderung „Auswirkung und Freigabeweg“.
  - V2.4: R7; HB 1.4 (keine Wahrscheinlichkeit für ein Problem); HB 1.5 (bis zur Freigabe gilt die bisherige Grundlage).
  - Vorschlag: Risiko „Nächster Schritt: Bewertung nach Wahrscheinlichkeit und Auswirkung, dann beobachten, gezielt oder vorrangig bearbeiten.“ · Problem „… Für ein eingetretenes Problem wird keine Wahrscheinlichkeit mehr geschätzt.“ · Änderung „Nächster Schritt: Auswirkungen gegen den geltenden Stand, Vorlage mit mindestens zwei Optionen; bis zur Freigabe gilt die bisherige Grundlage.“
- **k06-E7** · Z. 438–446 (Liste der Register) · Aufgabe und Maßnahme fehlen.
  - V2.4: R1, HB 1.1, 1.6.
  - Vorschlag (zwei Zeilen ergänzen): „Eine **Aufgabe** ist geplante Arbeit mit Ergebnis, Verantwortlichem und Termin. Nächster Schritt: Fortschritt verfolgen, geschlossen wird mit dem verwendbaren Ergebnis.“ · „Eine **Maßnahme** soll einen Zustand verändern. Nächster Schritt: Umsetzung und Wirkung prüfen – umgesetzt ist noch nicht wirksam.“
- **k06-K14** · Z. 446 · „Der Managementbericht ist der aggregierte Gremienbericht für Information und Beschlussvorbereitung.“
  - V2.4: R10. Vorschlag wie k06-K11.
- **k06-K15** · Z. 499 (Tafel `k6.4.4-t1`) · „Frühwarnung | unbewertetes Signal | bestätigen; bei Bestätigung Risiko“ und „Managementbericht | aggregierter Gremienbericht“.
  - V2.4: R8, R10. Die Tafel kommt wörtlich aus `whitepaper.json`.
  - Vorschlag: durch eigene Karten ersetzen (Inhalt wie k06-K13, k06-E6, k06-E7, k06-K11).
- **k06-K16** · Z. 520 · „Erteilen wird sie der Bauherr selbst, auf Vorlage der Bauherren-PL; der Lenkungskreis berät und bereitet vor.“
  - V2.4: R1, R3, R6.
  - Vorschlag: „Die Projektsteuerung bereitet die Freigabe vor; erteilen wird sie der Bauherr selbst. Der Lenkungskreis berät.“
- **k06-E8** · Z. 539–553 (Statusbegriffe) · „Risiken: aktiv · beobachtet · gemindert · geschlossen“
  - V2.4: Prioritäten beobachten, gezielt, vorrangig; gemindert erst mit belegter Wirkung; geschlossen nur mit Grund (R7, R11; HB 3, HB 5).
  - Vorschlag (Satz unter den Karten): „Unabhängig vom Status zeigt die Bewertung die Priorität – beobachten, gezielt oder vorrangig bearbeiten. Als gemindert gilt ein Risiko erst, wenn die Wirkung der Maßnahme belegt ist; geschlossen wird es nur mit nachgewiesenem Grund.“
- **k06-K17** · Z. 564 · „Innerhalb des Mandats entscheiden die verantwortliche Rolle und die Bauherren-PL selbst, im definierten Rahmen, und dokumentieren das im Register.“ (ebenso Etappe „Im Mandat“, Z. 615)
  - V2.4: R1, R5.
  - Vorschlag: „Innerhalb ihres Mandats entscheidet die zuständige Stelle des Bauherrn selbst. Die Projektsteuerung hat die Entscheidung vorbereitet und hält den Beschluss getrennt in der Software fest.“
- **k06-K18** · Z. 562 / 577 (Regler, Stufe „täglich“) · „vom täglichen Blick auf Fristen …“ / „verantwortliche Rollen, PMO · Maßnahmen, Probleme, Fristen.“
  - V2.4: Einen täglichen Takt gibt es nicht. Stattdessen werden dringliche Sachverhalte sofort gemeldet und am selben Arbeitstag dokumentiert (R9).
  - Vorschlag: Stufe „sofort“ · Marke „Projektsteuerung“ · „Dringliche Sachverhalte meldet sie sofort über den vereinbarten Meldeweg und dokumentiert sie am selben Arbeitstag. Die regelmäßige Prüfung ersetzt keine dringliche Meldung.“
- **k06-K19** · Z. 583–585 (Stufe „wöchentlich“) · „Bauherren-PL, Projektsteuerung, verantwortliche Rolle · Wöchentliche Risikosichtung im regelmäßigen Abstimmungstermin; offene Entscheidungen und Maßnahmen.“
  - V2.4: Die wöchentliche Prüfung umfasst den gesamten offenen Bestand aller Vorgangsarten; sie ist ein Prüfdurchgang der Projektsteuerung mit Prüfvermerk, kein Termin des Bauherrn (R9).
  - Vorschlag: Marke „Projektsteuerung“ · „In aktiven Zeiten prüft sie jede Woche alle offenen Vorgänge – Aufgaben, Maßnahmen, Frühwarnungen, Risiken, Probleme, Änderungen und offene Entscheidungen – und hält das mit Datum und Bearbeiter fest. Vertieft wird nur, was sich verändert hat.“
- **k06-K20** · Z. 590–593 (Stufe „monatlich“) · „drei Termine im Monatstakt · Die Projektsteuerung prüft die Risiken formal … Die Bauherren-PL und das Änderungsgremium bewerten und entscheiden Änderungen – monatlich … Im Monatstermin von Bauherren-PL, Controlling und PMO …“
  - V2.4: ein Monatstermin online bis 60 Minuten und ein Bericht von höchstens einer Seite (R10). Bewertet werden Änderungen von der Projektsteuerung; die befugte Stelle entscheidet (R1, R6).
  - Vorschlag: Marke „Bauherr und Projektsteuerung“ · „Ein Online-Termin von bis zu 60 Minuten: offene Entscheidungen und wesentliche Vorgänge, Fachleute nach Bedarf. Dazu der Monatsbericht von höchstens einer Seite.“ Neue Stufe „Ruhezeiten“: „Monatliche Gesamtprüfung; neue Hinweise binnen fünf Arbeitstagen; der Termin nur bei Bedarf, der Bericht bleibt.“
- **k06-K21** · Z. 601 (Stufe „je Freigabe“) · „Der Bauherr erteilt jede Freigabe selbst auf Vorlage der Bauherren-PL; der Lenkungskreis berät und bereitet vor.“
  - V2.4: wie k06-K16.
  - Vorschlag: „Der Bauherr erteilt jede Freigabe selbst; vorbereitet hat sie die Projektsteuerung, der Lenkungskreis berät. …“
- **k06-E9** · Z. 620–636 (Eskalation entlang der Mandatsleiter)
  - V2.4: Mit R6 vereinbar. Dringliches wartet weder auf die nächste Sitzung noch auf eine vollständige Bewertung (HB 3, Abs. 4).
  - Vorschlag (Satz unter den Etappen): „Auf jeder Stufe liegt eine Vorlage der Projektsteuerung. Dringliches wartet nicht auf die nächste Sitzung.“
- **k06-K22** · Z. 692 / 695 (Regie) · „… die Register mit Rolle und Takt (6.4.2, Sortierübung ‚Wer pflegt dieses Register?‘) …“ / Leitfrage „Welche Register führen Sie heute – und wer pflegt welches in welchem Takt?“
  - V2.4: R1, R9.
  - Vorschlag: Notiz „Im Termin trägt: Die Projektsteuerung bearbeitet alle Vorgänge, wöchentlich geprüft; der Bauherr pflegt nichts, er entscheidet.“ · Leitfrage „Wer bearbeitet bei Ihnen alle offenen Vorgänge – und wer entscheidet nur?“
- **k06-H1** · Z. 347 (Baustein `::: governancefluss`) – Die Komponente bildet den Fluss mit „bestätigen → Risiko“ ab und muss mit k06-K10 angepasst werden.
- **k06-H2** · Z. 641–687 · Querverweise B1–B6 und Ende „Freigabe mit Auflagen“ – entfallen (O-40). Inhaltlich kollidieren dort zusätzlich Z. 645 („Risikosichtung ist wöchentlich (dienstags), das Änderungsgremium tagt monatlich“) und Z. 673 („Problemregister des PMO“).
- **k06-H3** · Z. 448 · „(Kap. 9.4)“ – Kapitelbezug entfällt (O-38).

### k07-leistungsarchitektur.md

- **k07-K1** · Z. 313 · „Die Bauherren-PL bereitet vor, koordiniert, führt das Entscheidungsregister, eskaliert und verfolgt nach; … PMO und Projektsteuerung liefern Daten, Takt, Register und Managementberichte …“
  - V2.4: R1, R3, R6, R10.
  - Vorschlag: „Die Projektsteuerung bearbeitet alle Vorgänge, bereitet jede Entscheidung mit mindestens zwei Optionen und gewichtetem Vergleich vor, verfolgt die Umsetzung und berichtet monatlich auf einer Seite; Zielpriorisierung, Risikoannahme und Freigabe ersetzt sie nicht. Die Bauherren-PL entscheidet innerhalb ihrer Schwelle; darüber legt die Projektsteuerung die Vorlage der befugten Stelle vor. Planung, Fachberatung sowie Recht und Vergabe liefern Grundlagen und Einschätzungen; die Abwägung bleibt beim Bauherrn.“
- **k07-K2** · Z. 400 (Tafel `k7.6-t1`) · Zeilen „Bauherren-PL | Vorbereitung, Koordination, Entscheidungsregister, Eskalation, Nachverfolgung“ und „PMO und Projektsteuerung | Daten, Takt, Register, Managementberichte …“.
  - V2.4: R1. Die Tafel kommt wörtlich aus `whitepaper.json`.
  - Vorschlag: eigene Karten mit den Zeilen aus k07-K1. Die Zeilen „Bauherr Mentoren“, „Planung / Fachberatung“ und „Recht / Vergabe“ bleiben.
- **k07-K3** · Z. 237 / 252–258 · „Sie sollen die Arbeit selbst tun können: Entscheidungen vorbereiten, Schwellen anwenden, Datenstände nennen, Risiken eskalieren und Freigaben nachhalten.“
  - V2.4: Das Vorbereiten und Nachhalten liegt bei der Projektsteuerung; die Bauherrenrollen stimmen Kriterien und Gewichte ab und entscheiden (R1, R4, R12).
  - Vorschlag: „Sie sollen ihren Teil selbst können: Die Projektsteuerung bereitet Entscheidungen mit gewichtetem Optionenvergleich vor und verfolgt sie nach; die Bauherrenrollen stimmen Kriterien und Gewichte ab, wenden Schwellen an, prüfen Vorlagen und entscheiden.“ (Umschalter rechts entsprechend in zwei Spalten.)
- **k07-H1** · Z. 76 / 120 · „Bewertungsmatrix“ (Ergebnis der Reifegradanalyse) – nicht mit der 5×5-Risikomatrix verwechseln. Sinnvoll ist „Bewertung über die zehn Domänen“; der Text bleibt sonst unverändert.
- **k07-H2** · Z. 366 · „Eine operative Dauer-Projektsteuerung übernimmt Bauherr Mentoren nicht.“ – mit V2.4 vereinbar (V2.4 beschreibt die Projektsteuerung, nicht Bauherr Mentoren); keine Änderung.
- **k07-H3** · Z. 435–446 · Querverweise Wirklichkeit, Epilog – entfallen (O-40, O-46: Selbstdiagnose entfällt).

### k08-implementierung.md

- **k08-E1** · Z. 208 · „… Kosten- und Terminstand, Risiko- und Änderungsinformationen.“
  - V2.4: Ausgangsbestand und erster abgestimmter Bearbeitungsstand aller Vorgangsarten (HB 4, letzter Absatz; Projektblatt „Ausgangsbestand“).
  - Vorschlag: „… Kosten- und Terminstand und der Bearbeitungsstand aller Vorgänge in der bereitgestellten Software.“
- **k08-E2** · Z. 296 / 313–319 · „Sie weiß dann, wie wesentliche Entscheidungen vorbereitet, mandatiert, freigegeben, dokumentiert und nachverfolgt werden.“
  - V2.4: R3, R5.
  - Vorschlag (Satz anhängen): „Vorbereitet heißt dabei: mit mindestens zwei zulässigen Optionen und gewichtetem Vergleich; dokumentiert heißt: der Beschluss getrennt von der Vorlage.“
- **k08-H1** · Z. 120 · „Bewertungsmatrix“ – wie k07-H1.
- **k08-H2** · Z. 330–334 · Querverweis Wirklichkeit – entfällt (O-40).

### k09-ergebnisbild.md

- **k09-K1** · Z. 68–70 (Etappe „Beschlusslage“) · „Die Entscheidungsvorlage hält die Beschlusslage fest; danach folgt die Nachverfolgung.“
  - V2.4: Der Beschluss bleibt von der Vorlage getrennt (R5).
  - Vorschlag: „Was tatsächlich beschlossen ist – getrennt von der Vorlage festgehalten, mit Quelle, Datum und Bedingungen. Danach folgt die Nachverfolgung.“
- **k09-E1** · Z. 82 · „Die Projektsteuerung bereitet eine Entscheidung gründlich vor. Mit dem Modell lässt sich fragen, welche Vorbereitung sie übernehmen kann und wer letztverantwortlich ist.“
  - V2.4: R1, R3.
  - Vorschlag: „Im Standard übernimmt sie die ganze Vorbereitung – Frage, Optionen, gewichteter Vergleich, Empfehlung. Das Modell zeigt, wer letztverantwortlich ist und auf welcher Stufe entschieden wird.“
- **k09-K2** · Z. 211 · „Er erteilt jede Freigabe selbst, auf Vorlage der Bauherren-PL. Weder die Projektsteuerung noch der Lenkungskreis erteilen sie; der Lenkungskreis berät und bereitet vor.“
  - V2.4: R1, R6.
  - Vorschlag: „Er erteilt jede Freigabe selbst; die Projektsteuerung bereitet sie vollständig vor. Weder die Projektsteuerung noch der Lenkungskreis erteilen sie; der Lenkungskreis berät.“
- **k09-K3** · Z. 221–223 (Etappe „Vorbereiten“) · „Die Bauherren-PL legt die Freigabe zur Entscheidung vor; der Lenkungskreis berät und bereitet vor.“
  - V2.4: R1, R3.
  - Vorschlag: „Die Projektsteuerung bereitet die Freigabe vor und legt sie dem Bauherrn vor; der Lenkungskreis berät. Die Freigabe beruht auf …“ (Rest bleibt.)
- **k09-K4** · Z. 339 / 343–346 (Wissenscheck) · „Er erteilt jede Freigabe selbst auf Vorlage der Bauherren-PL …“ / Antwort a „Der Bauherr, auf Vorlage der Bauherren-PL“.
  - V2.4: wie k09-K2.
  - Vorschlag: Antwort a „Der Bauherr selbst, auf Vorlage der Projektsteuerung“; Antwort c bleibt („Die Projektsteuerung erteilt die Freigabe ausdrücklich nicht“).
- **k09-K5** · Z. 375–412 (Standard für Entscheidungsvorlagen, Etappe „Abwägung“: „Optionen und Konsequenzen …, Wirkung …, Empfehlung“)
  - V2.4: Ohne zwei zulässige Optionen und ohne MCDA wäre die Vorlage nach V2.4 als unvollständig zu kennzeichnen (R3, R4; HB 3.1, „Vorlegen und nachhalten“).
  - Vorschlag (Etappe 3): „**Mindestens zwei zulässige Optionen** mit ihren Konsequenzen, die **Wirkung auf Kosten, Termin, Qualität, Projektumfang, Risiko und ESG/LCC**, ein **gewichteter Vergleich (MCDA)** mit vorab abgestimmten Kriterien und Gewichten samt Prüfung, ob andere vertretbare Gewichte die Rangfolge ändern, und eine begründete **Empfehlung** mit Nachteilen und Voraussetzungen.“ Etappe 1 ergänzen: „… dazu der **Entscheidungstermin** und die Folgen einer Verzögerung.“
- **k09-E2** · Z. 377 / 412 · „… ein eigener Freigabeprozess mit sechs Stufen, von denen jede signiert wird …“
  - V2.4: Ein Status in der Software ist kein Beschluss (R5).
  - Vorschlag (Satz anhängen): „Der Status zeigt den Stand der Vorlage; den Beschluss selbst ersetzt er nicht.“
- **k09-K6** · Z. 499–502 (Sortieren, Posten „Beschlusslage“) · „Die Entscheidungsvorlage hält die Beschlusslage fest.“
  - V2.4: R5.
  - Vorschlag: Posten „Bezug zum Beschluss“ · Erklärung „Die Vorlage verweist auf den Beschluss; festgehalten wird er getrennt, mit Quelle, Datum und Bedingungen.“
- **k09-E3** · Z. 423 · „… in welchem Takt die Governance-Termine stattfinden und wer das Entscheidungsregister führt.“ (ebenso Posten „register“, Z. 469–472)
  - V2.4: R1, R9, R10.
  - Vorschlag (Satz anhängen): „Im Standard bearbeitet die Projektsteuerung alle Vorgänge einschließlich der Entscheidungsvorbereitungen; geprüft wird wöchentlich, besprochen monatlich in höchstens 60 Minuten.“
- **k09-K7** · Z. 555 (Regie) · „Der Bauherr erteilt jede Freigabe selbst auf Vorlage der Bauherren-PL, der Lenkungskreis berät und bereitet vor.“
  - V2.4: wie k09-K2. Vorschlag: „… auf Vorlage der Projektsteuerung, der Lenkungskreis berät.“
- **k09-H1** · Z. 128 / 167–170 · 13 Arbeitsrollen samt „Lenkungskreis/Vorstand“ und „BM-Mentor … Vollzugriff im MVG Companion“ – mit V2.4 vereinbar, bleibt als Inhalt (O-38).
- **k09-H2** · Z. 245 · „wörtlich aus der Tabelle in Kap. 9.3“ – entfällt (O-38).
- **k09-H3** · Z. 511–550 · Querverweise B1, B3, B4, B6 und zwei Enden – entfallen (O-40); Z. 536 kollidiert zusätzlich wie k09-K2.

### k10-anwendungssituationen.md

- **k10-E1** · Z. 67 · „Der Ausschuss braucht eine Vorlage, die zeigt, wer was vorbereitet hat, auf welchem Stand die Zahlen beruhen und worüber genau er entscheidet.“
  - V2.4: R3, R4.
  - Vorschlag (Satz anhängen): „… und zwischen welchen mindestens zwei zulässigen Wegen er wählt.“
- **k10-K1** · Z. 270 · „… das Änderungsregister mit verbindlicher Auswirkungsbewertung und dem monatlichen Änderungsgremium …“
  - V2.4: Eine Änderung wird gegen den geltenden Stand aufbereitet und mit Optionen und MCDA zum benötigten Entscheidungstermin vorgelegt; ein fester monatlicher Entscheidungstakt ist nicht vorgesehen (HB 1.5, HB 3.1; R9, R10). Das Gremium kann befugte Stelle bleiben.
  - Vorschlag: „… die Änderung, die die Projektsteuerung gegen den geltenden Stand aufbereitet und mit mindestens zwei Optionen zum benötigten Termin der befugten Stelle vorlegt …“
- **k10-K2** · Z. 326–333 (Sortieren, Posten 5) · „Änderungsgremium (monatlich, zuzüglich anlassbezogener Sondersitzungen)“; ebenso Tafel `k10.5-t1`, Z. 272.
  - V2.4: wie k10-K1.
  - Vorschlag: Posten „Entscheidungsvorlage zur Änderung (zwei Optionen, gewichteter Vergleich)“. Die Tafel durch eigene Karten ersetzen (Abschnitt 8).
- **k10-E2** · Z. 266 · „… von der Variantenfreigabe ohne vollständige Abwägung …“
  - V2.4: R4 (MCDA als nachvollziehbare Abwägung).
  - Vorschlag (in Z. 270 ergänzen): „… etwa die Entscheidungsvorlage mit gewichtetem Optionenvergleich, …“
- **k10-E3** · Z. 225 · „… und Maßnahmen zeigen keine Wirkung.“
  - V2.4: R11 (umgesetzt ist nicht wirksam).
  - Vorschlag (Satz anhängen): „Dass eine Maßnahme umgesetzt ist, heißt noch nicht, dass sie wirkt; das muss eigens geprüft werden.“
- **k10-H1** · Z. 341–352 · Querverweise Epilog und Ende „Neufestlegung … im Lenkungskreis“ – entfallen (O-40, O-46).

### k11-neuinitialisierung.md

- **k11-E1** · Z. 62 / 77 / 79 / 85 / 87 · „Gremien bekommen Statusberichte, aber keine Optionen …“ / „Die Projektsteuerung liefert mehr Information, ohne dass der Bauherr dadurch an Führungsfähigkeit gewinnt.“
  - V2.4: R3, R10.
  - Vorschlag (Satz nach Z. 62): „Im Standard liefert die Projektsteuerung stattdessen Entscheidungsvorlagen mit mindestens zwei Optionen und einen Monatsbericht von höchstens einer Seite.“
- **k11-E2** · Z. 124 · „… die Risiko- und Änderungslage …“
  - V2.4: R1, R8.
  - Vorschlag: „… die Lage aller offenen Vorgänge – Aufgaben, Maßnahmen, Frühwarnungen, Risiken, Probleme und Änderungen – …“
- **k11-H1** · Z. 299–317 · Querverweise Wirklichkeit, zwei Enden (Z. 317 „im Lenkungskreis“) – entfallen (O-40).

### k12-gewinn.md

- **k12-E1** · Z. 26 / 52 (Tafel `k12-t1`, Zeile „Geringere Zusatzlast“) · „… bis zu einer geringeren Zusatzlast, weil der Mindeststandard auf führungsrelevante Entscheidungen konzentriert bleibt.“
  - V2.4: R10, R12.
  - Vorschlag (Satz anhängen): „Für den Bauherrn heißt das konkret: Er pflegt nichts; ihn erreichen ein Monatstermin von höchstens 60 Minuten, ein Bericht von höchstens einer Seite und die Vorlagen, über die er entscheiden muss.“
- **k12-H1** · Z. 154–158 · Querverweis Ende „Steuerbar übergeben“ – entfällt (O-40).

### k13-glossar.md und Glossar (`whitepaper.json` → `glossar`, gelesen von `werkzeuge/inhalte.mjs` Z. 124–125, 507, 548–554)

Das Glossar zeigt die 32 Einträge aus `quellen/whitepaper/v1.2/whitepaper.json` im Wortlaut. Weil V1.2 Quelle bleibt und nicht geändert wird, braucht das Glossar eine eigene Quelle in `inhalte/`, die geänderte und neue Einträge trägt (H, Abschnitt 8).

- **k13-K1** · Glossar `g-fruehwarnung` · „Unbewertetes Signal und strikte Vorstufe eines Risikos. Erst nach Bestätigung und Bewertung wird daraus ein Risiko; …“
  - V2.4: R8 (HB 1.2).
  - Vorschlag: „Hinweis auf eine mögliche Beeinträchtigung, der noch nicht ausreichend geklärt ist. Die Projektsteuerung sichert Quelle und Eingang und legt Prüffrage, Verantwortlichen und Wiedervorlage fest. Nach der Klärung wird daraus ein Risiko, ein Problem oder eine Aufgabe, oder die Frühwarnung wird begründet geschlossen. CTC- oder Schwellenwertverletzungen erzeugen neue Frühwarnungen.“
- **k13-K2** · Glossar `g-entscheidungsvorlage` · „Nachweislogik für eine wesentliche Entscheidung mit … Optionen, Annahmen, Auswirkungen, Empfehlung, Freigabeprozess, Beschlusslage und Nachverfolgung.“
  - V2.4: R3, R4, R5.
  - Vorschlag: „Von der Projektsteuerung erarbeitete Grundlage für eine erforderliche Bauherrenentscheidung: Entscheidungsfrage, Bezug zu Freigabe und Mandat, befugte Stelle und Entscheidungstermin, Datenstand, mindestens zwei zulässige Optionen mit Annahmen und Auswirkungen, gewichteter Vergleich (MCDA) mit Prüfung der Gewichtungsabhängigkeit, begründete Empfehlung, Freigabeweg und Nachverfolgung. Der Beschluss wird getrennt dokumentiert.“
- **k13-K3** · Glossar `g-pmo` · „Projektmanagementbüro; unterstützt unter anderem Koordination, Berichterstattung, Gremienarbeit, Datenpflege und Nachverfolgung.“
  - V2.4: R1 (Pflege und Nachverfolgung aller Vorgänge durch die Projektsteuerung).
  - Vorschlag: „Projektmanagementbüro; unterstützt unter anderem Koordination, Gremienarbeit und Protokolle. Die Bearbeitung, Pflege und Nachverfolgung aller Vorgänge liegt im Standard bei der Projektsteuerung.“
- **k13-E1** · Glossar `g-entscheidungsreife` · „Zustand, in dem eine Entscheidung ausreichend vorbereitet ist …“
  - V2.4: R3, R4.
  - Vorschlag (Satz anhängen): „Dazu gehören mindestens zwei zulässige Optionen und ihr gewichteter Vergleich; fehlt eine Grundlage, ist die Vorlage als unvollständig gekennzeichnet.“
- **k13-E2** · Glossar `g-neufestlegung-der-projektbasis` · „Es wird über eine Entscheidungsvorlage vorbereitet und durch den Bauherrn im Lenkungskreis beschlossen …“
  - V2.4: R3, R6.
  - Vorschlag: „… über eine Entscheidungsvorlage der Projektsteuerung mit mindestens zwei Optionen vorbereitet und durch den Bauherrn im Lenkungskreis beschlossen …“
- **k13-E3** · Glossar `g-bauherren-fuehrungsmodell` · „… Risiko-/Änderungs-/Maßnahmenverknüpfung …“
  - V2.4: R8. Vorschlag: „… Verknüpfung aller Vorgangsarten (Aufgaben, Maßnahmen, Frühwarnungen, Risiken, Probleme, Änderungen) …“
- **k13-E4** · Glossar `g-betriebshandbuch` · „… mit Rollen, Routinen, Taktung …“
  - V2.4: R9, R10. Vorschlag (Satz anhängen): „Im Standard: wöchentliche Prüfung aller offenen Vorgänge, monatlicher Termin bis 60 Minuten, Bericht bis eine Seite.“
- **k13-E5** · Glossar `g-freigabe` – vereinbar; Vorschlag (Satz anhängen): „Vorbereitet wird sie von der Projektsteuerung.“
- **k13-E6** · neue Glossareinträge (aus V2.4, intern belegt):
  - **MCDA (Multikriterien-Entscheidungsanalyse)** – Vergleich von Handlungsoptionen anhand derselben gewichteten Kriterien; Gewichte und Punkte 1–5, vorab abgestimmt; Gewicht mal Punkte ergibt die Summe (HB 3.1).
  - **Vorgangsart** – Aufgabe, Maßnahme, Frühwarnung, Risiko, Problem oder Änderung; dazu die Entscheidungsvorbereitung (HB 1).
  - **Aufgabe** – geplante Arbeit mit vereinbartem Ergebnis, Verantwortlichem und Termin (HB 1, HB 1.1).
  - **Maßnahme** – gezielte Handlung, die einen Zustand klärt, verbessert oder einen Beschluss umsetzt; umgesetzt und wirksam sind nicht dasselbe (HB 1, HB 1.6).
  - **Risiko** – mögliches nachteiliges Ereignis oder unsichere Größe, die Projektziele beeinträchtigen kann (HB 1, HB 1.3).
  - **Problem** – bereits eingetretener nachteiliger Zustand; keine Wahrscheinlichkeit mehr (HB 1.4).
  - **Änderung** – bewusste Anpassung einer geltenden Vorgabe; bis zur Freigabe gilt die bisherige Grundlage (HB 1.5).
  - **Risikomatrix (5×5)** – Wahrscheinlichkeit mal höchste belegte Auswirkung; 1–4 beobachten, 5–9 gezielt, 10–25 vorrangig, Auswirkung 5 immer vorrangig; keine Geldwerte, keine Freigabe (HB 2).
  - **Wesentliches Risiko** – vorrangig, über einer Entscheidungsschwelle oder mit besonderem Warnanlass (HB 3).
  - **Befugte Stelle** – die Stelle des Bauherrn, die nach den festgelegten Befugnissen und Schwellen entscheidet (HB 1, HB 3.1).
  - **Gewichtungsabhängigkeit** – ob andere vertretbare Gewichte die Rangfolge der Optionen ändern; sie muss in der Empfehlung sichtbar sein (HB 3.1, 3.2).
  - **Beschluss** – die tatsächliche Entscheidung der befugten Stelle, getrennt von der Vorlage dokumentiert; Schweigen, Empfehlung oder Softwarestatus sind keiner (HB 3.1).
  - **Monatstermin** – online, bis 60 Minuten, Bauherr und Projektsteuerung (HB 4).
  - **Monatsbericht** – höchstens eine Seite über alle Vorgangsarten, aus demselben Informationsstand (HB 4).
  - **Ruhezeit** – ausdrücklich vereinbarte Zeit mit monatlicher Gesamtprüfung und Termin nur bei Bedarf (HB 4).
  - **Dringlicher Sachverhalt** – wird sofort gemeldet und am selben Arbeitstag dokumentiert (HB 4).
- **k13-H1** · Z. 11 · „… im Wortlaut von MVG V1.2“ und Z. 25 (Regie) „… steht im Wortlaut von MVG“ – Bezug entfällt (O-38). Die Definitionen sind ohnehin nicht mehr durchgehend wörtlich.
- **k13-H2** · Glossar `g-whitepaper` – entfällt (O-38).

## 2. `inhalte/begriffs-kompass.md`

- **bk-E1** · Z. 35–41 (Entscheidungsvorlage) · keine Erläuterung.
  - V2.4: R3, R4.
  - Vorschlag (Hinweis): „Im Standard erarbeitet sie die Projektsteuerung – mit mindestens zwei zulässigen Optionen und gewichtetem Vergleich.“
- **bk-E2** · Z. 51–57 (Entscheidungsregister, „Decision Log“)
  - V2.4: offene Entscheidungen als eigene Vorgangsart der Projektsteuerung (HB 1, Tabelle; HB 5).
  - Vorschlag (Hinweis): „Im Standard führt die Projektsteuerung offene Entscheidungen als eigene Vorgangsart, getrennt vom späteren Beschluss.“
- **bk-K1** · Z. 125–131 (Frühwarnung, Beleg `k6.4.3-p2` = „strikte Vorstufe“)
  - V2.4: R8.
  - Vorschlag (Hinweis): „Ein noch ungeklärter Hinweis; nach der Klärung wird daraus ein Risiko, ein Problem oder eine Aufgabe – oder er wird begründet geschlossen.“
- **bk-K2** · Z. 133–139 (Managementbericht, andere: „Management-Report, Steering-Report, Lenkungskreisbericht“)
  - V2.4: R10.
  - Vorschlag: Eintrag „Monatsbericht“ mit andere: [One-Pager, Monatsreport, Statusbericht] und Hinweis: „Höchstens eine Seite, aus demselben Informationsstand wie die Einträge.“ Den Eintrag „Managementbericht“ auf diesen Begriff verweisen lassen.
- **bk-E3** · Z. 17–33 (Änderungsgremium, Lenkungskreis) – vereinbar als befugte Stellen. Vorschlag (Hinweis): „Entscheidet auf Vorlage der Projektsteuerung.“
- **bk-E4** · neue Einträge:
  - MCDA – andere: [Nutzwertanalyse, Multikriterienanalyse, Scoring-Modell, gewichteter Kriterienvergleich]
  - Risikomatrix – andere: [Heatmap, Wahrscheinlichkeits-Auswirkungs-Matrix, P-I-Matrix]
  - Problem – andere: [Issue, Störung]
  - Änderung – andere: [Change Request, Änderungsantrag]
  - Aufgabe – andere: [Task, To-do, Action Item]
  - Maßnahme – andere: [Action, Gegenmaßnahme] (Abgrenzung zu „Risikominderung“, Z. 117)
  - Vorgangsart – andere: [Registertyp, Eintragsart]
  - befugte Stelle – andere: [Entscheider, Decision Owner, Entscheidungsträger]
  - Monatstermin – andere: [Jour fixe des Bauherrn, Steuerungstermin]
- **bk-H1** · Z. 32, 98, 156 · sichtbare Absatz-IDs im Hinweis („(k4.2-p3)“ usw.) und das Feld `beleg` mit Whitepaper-Absätzen – entfallen sichtbar (O-38). Neue Einträge brauchen einen internen Beleg auf V2.4 (Abschnitt 8).

## 3. `inhalte/einwaende.md`

- **ew-E1** · Z. 16 (buerokratie) · „MVG beschreibt die Zusammenarbeit in Registern, Rollen und Takt ausdrücklich als gemeinsamen Arbeitsstandard.“
  - V2.4: R1, R10, R12.
  - Vorschlag: „Für den Bauherrn bleibt es schlank: Er pflegt nichts, die Projektsteuerung führt alle Vorgänge. Ihn erreichen ein Monatstermin von höchstens 60 Minuten, ein Bericht von höchstens einer Seite und die Vorlagen, über die er entscheiden muss.“
- **ew-E2** · Z. 47–48 (projektsteuerung) · „MVG sieht die Projektsteuerung ausdrücklich in der Unterstützung – bei Kosten, Terminen, Qualität, Koordination und Berichterstattung. Die bauherrenseitige Entscheidung ersetzt sie nicht.“
  - V2.4: R1, R3, R6. Vereinbar, aber der Einwand passt jetzt zum Kern.
  - Vorschlag: „Gut so – genau dort liegt im Standard die Arbeit: Die Projektsteuerung bearbeitet alle Vorgänge und bereitet jede Entscheidung mit mindestens zwei Optionen und gewichtetem Vergleich vor. Entscheiden, freigeben und Risiken annehmen kann sie nicht – das bleibt beim Bauherrn.“
- **ew-K1** · Z. 64 (gremien) · „Einen festen Takt sieht es trotzdem vor, etwa ein Änderungsgremium, das monatlich tagt, dazu anlassbezogene Sondersitzungen.“
  - V2.4: R9, R10.
  - Vorschlag: „Zusätzliche Gremien braucht es nicht. Vorgesehen sind ein monatlicher Online-Termin von höchstens 60 Minuten mit der Projektsteuerung und ein Bericht von höchstens einer Seite; Dringliches wird sofort gemeldet. Entschieden wird auf Vorlagen statt auf Statusberichten.“
- **ew-E3** · Z. 84 (projektgroesse) · „… Wesentlich ist dabei nicht jede operative Entscheidung.“
  - V2.4: Nicht jede offene Aufgabe braucht eine Risikobewertung oder einen Beschluss (HB 1.1).
  - Vorschlag (Satz anhängen): „Nicht jede offene Aufgabe braucht eine Bewertung oder einen Beschluss des Bauherrn.“
- **ew-E4** · Z. 120 (werkzeug) · „Das Führungsmodell funktioniert laut MVG auch mit vorhandenen Büro- und Projektwerkzeugen.“
  - V2.4: R2.
  - Vorschlag (Satz anhängen): „Maßgeblich ist die Software, die der Bauherr bereitstellt; ein zusätzliches Werkzeug ersetzt die Einträge dort nicht.“
- **ew-E5** · Z. 140 (freigaben) · „Vor einer Freigabe muss klar sein, welche Entscheidung getroffen wird …“
  - V2.4: R1. Vorschlag (Satz anhängen): „Vorbereitet wird sie von der Projektsteuerung, erteilt vom Bauherrn selbst.“
- **ew-E6** · neue Einwände (O-40 verlangt „Typischer Einwand und Antwort“ an jeder Station):
  - „Zwei echte Optionen gibt es nicht immer.“ → „Dann wird die Vorlage als unvollständig gekennzeichnet und der Klärungsbedarf offengelegt. Eine Scheinoption ersetzt die fehlende Alternative nicht.“ (HB 3.1)
  - „Punkte und Gewichte sind Scheingenauigkeit.“ → „Die Gewichte werden vorab abgestimmt, die Punkte je Zelle begründet, und es wird geprüft, ob andere vertretbare Gewichte die Rangfolge ändern. Eine hohe Punktzahl ersetzt kein fachliches Urteil.“ (HB 3.1)
  - „Dann entscheidet doch die Projektsteuerung.“ → „Nein. Sie empfiehlt; entscheiden, genehmigen oder bestätigen tut sie nicht. Auch ihre Empfehlung oder ein Status in der Software ist kein Beschluss.“ (HB 3, 3.1)
  - „Bis zum Monatstermin können wir nicht warten.“ → „Muss man nicht: Dringliches wird sofort gemeldet; die Vorlage und notwendige Schutzmaßnahmen warten nicht auf die fertige MCDA.“ (HB 3, 3.1, 4)
  - „Unser Risikoregister ist doch voll.“ → „Viele Einträge oder niedrige Stufen belegen noch keine gute Bearbeitung. Zählt, ob Bewertung und nächster Schritt nachvollziehbar sind.“ (TLB 4)
- **ew-H1** · Kopf Z. 3 und alle `::: zitat`-Blöcke · „Jede Antwort braucht einen Beleg aus dem Whitepaper (zitat oder original).“ – sichtbare Zitate entfallen (O-38). Die Belege bleiben intern, und V2.4-Fundstellen müssen als Beleg zulässig werden (Abschnitt 8).
- **ew-H2** · Felder `stationen:` / `kapitel:` – Die Story-Stationen A/B entfallen (O-40). Die Zuordnung muss auf die neuen Stationen umgestellt werden.

## 4. `inhalte/fall.md`

- **fall-K1** · Z. 13 · „gremien: [Stadtrat, Bauausschuss, Lenkungskreis, Änderungsgremium (Welt B)]“
  - V2.4: R10. Der Monatstermin fehlt, „Welt B“ entfällt (O-40).
  - Vorschlag: „gremien: [Stadtrat, Bauausschuss, Lenkungskreis, Änderungsgremium, Monatstermin mit der Projektsteuerung]“
- **fall-K2** · Z. 51 und Z. 65 · „Auskunft der Generalplanung auf Nachfrage der Bauherren-PL“ / „auf Nachfrage der Bauherren-PL meldet die Generalplanung 26 statt 16 Wochen“
  - V2.4: Hinweise erfasst und klärt die Projektsteuerung (HB 1.2, R1).
  - Vorschlag: „Auskunft der Generalplanung auf Nachfrage der Projektsteuerung; als Frühwarnung erfasst“ bzw. „auf Nachfrage der Projektsteuerung meldet die Generalplanung …“
- **fall-E1** · Z. 42 / 45 · „+8 % … Projektsteuerung“ gegen „+5,9 % … eigene CTC-Rechnung der GML“
  - V2.4: Unterschiedliche Einschätzungen werden mit Begründung dokumentiert, nicht gemittelt (HB 3, Abs. 5); ein Informationsstand (R2).
  - Vorschlag (Anmerkung): „Die Projektsteuerung führt beide Werte mit ihrer Begründung in einem Eintrag zusammen; gemittelt wird nicht.“
- **fall-E2** · Z. 54 · „Mandatsleiter in Welt B: die Muster-Mandatsleiter von MVG (k4.2-p3) – Bauherren-PL bis einschließlich 100 TEUR, Änderungsgremium …, darüber … Lenkungskreis. In Welt A gibt es keine festgelegten Schwellen.“
  - V2.4: R6. Schwellen stehen in den Festlegungen des Bauherrn; Welt A entfällt (O-40).
  - Vorschlag: „Befugnisse und Schwellen des Falls: Bauherren-PL bis einschließlich 100 TEUR, Änderungsgremium bis einschließlich 5 Mio. €, darüber Beschlussfassung durch den Bauherrn im Lenkungskreis. Auf jeder Stufe entscheidet die befugte Stelle auf eine Vorlage der Projektsteuerung.“
- **fall-E3** · nach Z. 54 · Es fehlen die Bewertungsgrenzen des Falls. Ohne sie lassen sich 5×5-Matrix und MCDA in der Story nicht rechnen (HB 2; Projektblatt „Wahrscheinlichkeit“, „Kostenbasis / Grenzen“, „Terminwirkung / Grenzen“, „Bewertung / Optionenvergleich“).
  - Vorschlag: eine neue Tabelle „Festlegungen des Bauherrn (fiktiv)“ mit vier Prozentgrenzen der Wahrscheinlichkeit, vier Eurogrenzen, vier Grenzen in Kalendertagen am Zieltermin (Schuljahr 2028/29), den MCDA-Kriterien des Falls (zum Beispiel Kosten, Termin/Förderfrist, Funktion für den Schulbetrieb, LCC) mit abgestimmten Gewichten 1–5 und den Skalen. Die Zahlen sind Fallwerte, keine MVG-Regel, und brauchen einen L-Eintrag (O-26). Auf der Seite erscheinen sie als Festlegungen des Falls, ohne Vertragsbegriffe (O-37).
- **fall-K3** · Z. 80 · „Lenkungskreis | … Bauherren-PL berichtet | monatlich, dritter Dienstag | Welt B: berät und bereitet vor; die Beschlussfassung liegt beim Bauherrn“
  - V2.4: Die Vorlagen kommen von der Projektsteuerung (R3); vorbereiten tut sie, nicht der Lenkungskreis (R1).
  - Vorschlag: „… Bauherren-PL nimmt teil; die Projektsteuerung legt die Vorlagen vor | monatlich, dritter Dienstag | berät; die Beschlussfassung liegt beim Bauherrn“
- **fall-K4** · Z. 81 · „Änderungsgremium (nur Welt B) | … Projektsteuerung und Planung bereiten vor | monatlich, zzgl. anlassbezogener Sondersitzungen (k6.4.5-t1)“
  - V2.4: Die Projektsteuerung bereitet vor, die Planung liefert zu (TLB 3). Entschieden wird zum Entscheidungstermin der Vorlage, nicht in einem festen Takt (R3, R10).
  - Vorschlag: „Änderungsgremium | Vorsitz Frank Deppe, Bauherren-PL, Aylin Kaya; Sabine Roth bei Nutzerthemen | tritt zum Entscheidungstermin der jeweiligen Vorlage zusammen | entscheidet oberhalb von 100 TEUR bis einschließlich 5 Mio. € auf Vorlage der Projektsteuerung; die Planung liefert zu“
- **fall-K5** · Z. 82 · „Jour fixe | Bauherren-PL, Projektsteuerung, Planung … | wöchentlich, Dienstag | … wöchentliche Risikosichtung, offene Entscheidungen und Maßnahmen“
  - V2.4: R9 (wöchentliche Prüfung aller Vorgangsarten durch die Projektsteuerung, mit Prüfvermerk), R10 (Monatstermin).
  - Vorschlag: zwei Zeilen statt einer: „Wöchentliche Prüfung | Projektsteuerung (Jonas Brenner) | jede Woche, dienstags | prüft alle offenen Vorgänge, Prüfvermerk mit Datum und Bearbeiter“ und „Monatstermin | Dr. Miriam Olbers, Bauherren-PL, Projektsteuerung; Fachleute nach Bedarf | monatlich, online, bis 60 Minuten | offene Entscheidungen und wesentliche Vorgänge; dazu der Monatsbericht von einer Seite“
- **fall-K6** · Z. 84 · „Welt B: Register mit verantwortlicher Rolle und Turnus nach k6.4.2-t1, ein Managementbericht als Sammelpunkt für die Gremien …“
  - V2.4: R1, R2, R10.
  - Vorschlag: „Alle Vorgänge führt die Projektsteuerung in der Software, die die GML bereitstellt; daraus entsteht monatlich ein Bericht von höchstens einer Seite. Benannte Datenstände mit Version.“
- **fall-E4** · Z. 86 (Kennungen) · `ENT-`, `AEN-`, `RIS-`, `FRW-`, `PRB-`, `MAS-`, `NAC-` – die Aufgabe fehlt.
  - V2.4: R1.
  - Vorschlag: „`AUF-` Aufgabe“ ergänzen und in `docs/BEGRIFFE.md` nachziehen (eigener Posten).
- **fall-K7** · Z. 197 (Nora Petersen) · „In Welt B pflegt sie als PMO Maßnahmen, Probleme, Governance-Kalender und Protokolle.“
  - V2.4: R1.
  - Vorschlag: „Projektassistenz der GML: Sie organisiert Termine und Protokolle auf Bauherrenseite. Vorgänge pflegt sie nicht – das tut die Projektsteuerung.“
- **fall-E5** · Z. 115 (Jonas Brenner) · „Externer Projektsteuerer, gründlich und immer etwas in Eile. Seine Mails haben Anhänge und Betreffzeilen mit ‚bitte kurzfristig‘.“
  - V2.4: R1, R3. O-40 verlangt für die Projektsteuerung ein klares Gesicht als Vorbereiterin aller Vorlagen.
  - Vorschlag: „Externer Projektsteuerer. Er führt alle offenen Vorgänge des Projekts und bringt zu jeder Entscheidung eine Vorlage mit zwei Wegen, Punkten und einer Empfehlung – entscheiden lässt er den Bauherrn.“
- **fall-E6** · Z. 184 (Holger Stein) · „In Welt A liegt das Wissen in seinen Excel-Dateien …“
  - V2.4: R2; HB 2 (Bearbeiterwechsel).
  - Vorschlag: „Kennt jede Zeile der Kostenprognose. Seine Einschätzungen stehen in den Einträgen der Projektsteuerung, sodass seine Vertretung weiterarbeiten kann, als er in Monat 11 ausfällt.“
- **fall-H1** · Z. 2–3, 14–28, 56–72 · Zeitachse nur LPH 4–5, Monate 0–12, Stationen A/B, Wirklichkeit. O-40 verlangt etwa 8 Stationen über die Leistungsphasen (O-45: Der Campus wächst mit der Leistungsphase). Zeitachse und `lph-stand` müssen deshalb neu gefasst werden (siehe Abschnitt 7).
- **fall-H2** · Z. 90, 92–105 · „Die Bauherren-PL ist die Spielerrolle …“ – O-40: Der Leser ist der Bauherr, und es gibt keine Rollenwahl mehr. Spielerfigur und Dr. Olbers müssen neu zugeordnet werden (Abschnitt 7).
- **fall-H3** · Z. 41, 54, 64, 81, 84 · Absatz-IDs (`k3.2-t1`, `k4.2-p3`, `k9.3-t1`, `k6.4.5-t1`, `k6.4.2-t1`) – intern zulässig; sie dürfen nie auf die Seite gelangen (O-38).

## 5. `src/engine/simulator.ts`

Vorweg: O-46 lässt den Mandatsleiter-Simulator entfallen, und O-41 verlangt das Löschen samt `src/ui/flaechen/explore-simulator.ts`, `tests/simulator.test.ts` und `tests/oberflaeche/explore.szenario.mjs`. Die Einträge gelten nur, falls Teile der Logik in den neuen Werkzeugen (MCDA-Rechner, Risikomatrix, Vorgangsarten und Wege) weiterverwendet werden.

- **sim-K1** · Z. 162 · „Die Freigabe zum Abschluss der Leistungsphase erteilt der Bauherr selbst auf Vorlage der Bauherren-PL – … der Lenkungskreis berät und bereitet vor.“
  - V2.4: R1, R3. Vorschlag: „Die Freigabe zum Abschluss der Leistungsphase erteilt der Bauherr selbst; die Projektsteuerung bereitet sie vor, der Lenkungskreis berät.“
- **sim-K2** · Z. 173 · „Innerhalb des Mandats entscheiden die verantwortliche Rolle und die Bauherren-PL im definierten Rahmen und dokumentiert im Register.“
  - V2.4: R1, R5. Vorschlag: „Innerhalb ihres Mandats entscheidet die zuständige Stelle; die Projektsteuerung hält den Beschluss in der Software fest.“
- **sim-K3** · Z. 195 / 203 · „verantwortliche Rolle festlegen und im Register dokumentieren“ / „im definierten Rahmen vorbereiten und im Register dokumentieren“
  - V2.4: R1. Vorschlag: „Die Projektsteuerung erfasst den Vorgang mit Verantwortlichem, nächstem Schritt und Termin.“ / „Die Projektsteuerung bereitet im definierten Rahmen vor und dokumentiert.“
- **sim-K4** · Z. 201 · „… die Entscheidungsvorlage vervollständigen – Frage, betroffene Freigabe, Mandat, Datenstand, Optionen, Wirkung, Empfehlung, Freigabe- oder Eskalationsweg.“
  - V2.4: R3, R4. Vorschlag: „… Frage, Entscheidungstermin, befugte Stelle, Datenstand, mindestens zwei zulässige Optionen, gewichteter Vergleich mit Prüfung der Gewichtungsabhängigkeit, Empfehlung, Freigabe- oder Eskalationsweg.“
- **sim-K5** · Z. 204 · „die Änderung für das Änderungsgremium vorbereiten.“
  - V2.4: R1, R3. Vorschlag: „Die Projektsteuerung bereitet die Änderung mit mindestens zwei Optionen für das Änderungsgremium vor.“
- **sim-K6** · Z. 212 · „Beschlusslage dokumentieren und die Nachverfolgung führen.“
  - V2.4: R5, R11. Vorschlag: „Den Beschluss getrennt dokumentieren (Quelle, Datum, Bedingungen); Umsetzung und Wirkung verfolgen.“
- **sim-K7** · Z. 4–6 (Kopf) · „Wo das Whitepaper keine Schwelle nennt (Termin, Risiko), setzt der Simulator auch keine …“
  - V2.4: R7. Für Risiken gibt es die 5×5-Matrix, für Termine Grenzen in Kalendertagen.
  - Vorschlag: Bewertung nach R7 aufnehmen (Matrix, „vorrangig“, „wesentlich“) – oder den Simulator löschen (O-46).
- **sim-E1** · Z. 20–21 / 100 · `terminWochen` · „Für Terminwirkungen nennt MVG keine allgemeine Schwelle …“
  - V2.4: Terminwirkung in Kalendertagen am benannten Zieltermin, vier Grenzen vom Bauherrn festgelegt (HB 2, Abs. 3–4).
  - Vorschlag: „Terminwirkungen zählen in Kalendertagen am Zieltermin; ab welcher Verschiebung welche Stufe gilt, legt der Bauherr mit vier Grenzen fest.“
- **sim-E2** · Z. 150 · „Als wesentliche Entscheidung braucht sie eine eindeutige Kennung, einen Datenstand, eine verantwortliche Rolle, eine Entscheidungsfrage und einen Nachverfolgungsstatus.“
  - V2.4: R3. Vorschlag (anhängen): „… dazu Entscheidungstermin, befugte Stelle und mindestens zwei zulässige Optionen.“
- **sim-H1** · Z. 39–40, 62, alle `quelle:` · Absatz-IDs als sichtbare Quelle – entfallen (O-38).

## 6. `src/ui/woerter.ts` (sichtbare Texte)

- **ui-K1** · Z. 388 (sandbox.grenze) · „… die verantwortliche Rolle je Register steht in Kap. 6.4.2. …“
  - V2.4: R1. Vorschlag (für das neue Werkzeug „Vorgangsarten und Wege“): „Alle Vorgänge bearbeitet die Projektsteuerung. Die Freigabe zum Abschluss einer Leistungsphase erteilt der Bauherr selbst.“
- **ui-K2** · Z. 376 / 381 (sandbox.einwurf, schritte) · „Frühwarnung einwerfen“, „Problem melden“, „Änderung beantragen“ … „bestätigen“
  - V2.4: R8; Aufgabe und Maßnahme fehlen.
  - Vorschlag: Einwürfe „Aufgabe anlegen“, „Hinweis erfassen (Frühwarnung)“, „Risiko erkennen“, „Problem melden“, „Änderung beantragen“; Schritt „bestätigen“ ersetzen durch „klären → Risiko | Problem | Aufgabe | schließen“; neue Schritte „Wirkung prüfen“, „Beschluss dokumentieren“.
- **ui-K3** · Z. 386–387 (sandbox.bericht) · „Managementbericht“ / „aggregierter Gremienbericht – Information und Beschlussvorbereitung“
  - V2.4: R10. Vorschlag: „Monatsbericht“ / „höchstens eine Seite – Veränderungen und offene Entscheidungen“.
- **ui-K4** · Z. 374 (sandbox.einstieg) · „… durch die Register – mit den Statusbegriffen und nächsten Schritten aus Kap. 6.4.“
  - V2.4: R1, R8; dazu O-38. Vorschlag: „Werfen Sie einen Vorgang ein und verfolgen Sie seinen Weg – von der Erfassung durch die Projektsteuerung bis zur Entscheidung des Bauherrn.“
- **ui-K5** · Z. 433 (simulator.grenze) · „Eine Risikobewertung nimmt der Simulator nicht vor – MVG nennt dafür keine Schwelle …“
  - V2.4: R7. Der Text entfällt mit dem Simulator (O-46); im Werkzeug „Risikomatrix 5×5“ gilt die Matrix.
- **ui-K6** · Z. 405, 425–426 (simulator.einstieg, leiter, stufen) · „… wer nach der Muster-Mandatsleiter entscheidet …“
  - O-46: entfällt. Falls ein Rest bleibt, gilt der Zusatz aus k04-E5 („auf Vorlage der Projektsteuerung“).
- **ui-E1** · Z. 315–318 (explore.werkzeuge) · Szenario-Simulator, Vorher/Nachher-Welten, Sandbox, Zeitmaschine
  - O-46 verlangt neue Werkzeuge mit V2.4-Inhalt. Vorschläge:
    - „MCDA-Rechner – Zwei Optionen, eigene Gewichte von 1 bis 5: Sehen Sie, wie sich die Rangfolge verschiebt und wann Gleichstand entsteht.“
    - „Risikomatrix 5×5 – Wahrscheinlichkeit und Auswirkung wählen: beobachten, gezielt oder vorrangig bearbeiten.“
    - „Vorgangsarten und Wege – Aufgabe, Maßnahme, Frühwarnung, Risiko, Problem, Änderung: was sie unterscheidet und wohin sie führen.“
    - „Takt – Wöchentlich prüfen, monatlich 60 Minuten, eine Seite Bericht; Dringliches sofort.“
- **ui-E2** · Z. 164 (einheit) · „aktiv“ (Risiken, Status nach Kap. 6.4.4)
  - V2.4: R7. Vorschlag: „vorrangig“ als Einheit der Statusanzeige (zum Beispiel „2 vorrangig“). O-40 sieht für die Statusanzeige Kosten, Termin und offene Entscheidungen vor.
- **ui-E3** · Z. 423 (simulator.wochen) · Terminwirkung in Wochen – V2.4 rechnet in Kalendertagen (HB 2). Gilt für jede neue Statusanzeige „Termin“: „+7 Kalendertage“.
- **ui-E4** · Z. 136–137 · „Muster-Mandatsleiter (Kap. 4.2)“ / „Welche Option liegt auf dem Tisch?“ – Für die neue Story gilt: „Die Vorlage der Projektsteuerung“ / „Welche Option wählen Sie?“ (O-40); der Kapitelbezug entfällt (O-38).
- **ui-H1** · Sichtbare Texte, die schon mit O-38, O-39 oder O-40 entfallen (nicht V2.4, aber im selben Zug zu ersetzen): Z. 19 (`ungeprueft`), 20–24 („MVG“ als Fassung), 33 (Originaltext, 13 Kapitel), 38–42 (zwei Welten, Rollen), 50–56, 140–152 (Welt A/B, Rückspulen, Originaltext), 168–216 (Rollen-Linse, Standpunkt, Quellen mit Absatz), 229–283 (Kapitel, Originaltext, Zitieren, Absatz-IDs, Impressum „Fachlich ungeprüft“, „Programm“), 302–318 (Explore mit Originaltext), 323–355 (Galerie „wortgleich wie im Originaltext“, Story-Karte Welt B), 357–369 (Zeitmaschine Welt A/B), 391–400 (Vorher/Nachher-Welten).

## 7. Story (`inhalte/story/`) – Grundsätze für die Neufassung

Die Stationen A1–A6, B1–B6, Wendepunkt, Rückspulen, Wirklichkeit, die drei Enden und der Epilog in der heutigen Form entfallen (O-40, O-41). Die neue Story muss diese Grundsätze erfüllen:

1. **Der Leser ist der Bauherr.** In der Ich- oder Sie-Form steht er an der Stelle von Dr. Miriam Olbers (oder einer neu benannten Figur „Sie, Bauherr“); die Bauherren-PL wird Figur. Er pflegt nichts, er entscheidet (R12, O-36).
2. **Die Projektsteuerung (Jonas Brenner) bereitet jede Vorlage vor** und führt alle Vorgänge in der Software, die die GML bereitstellt (R1, R2). Weder Bauherren-PL noch PMO noch der Bauherr führen Register.
3. **Jede Entscheidungsstation folgt dem Ablauf aus HB 3.1:** Frage und Grund, befugte Stelle, Entscheidungstermin, Folgen einer Verzögerung; mindestens zwei zulässige Optionen; Muss-Anforderungen vor dem Punktevergleich; MCDA mit vorab abgestimmten Kriterien, Gewichten und Skalen (1–5) und begründeten Punkten; Euro und Kalendertage sichtbar neben den Punkten; Prüfung der Gewichtungsabhängigkeit; begründete Empfehlung mit Nachteilen (R3, R4).
4. **Gewichte verschieben = Gewichtungsprüfung, nicht Umbewerten.** Die Gewichte sind vor der Bewertung abgestimmt (HB 3.1). Der Regler zeigt, ob andere vertretbare Gewichte die Rangfolge ändern. Der Text darf nicht nahelegen, man passe die Gewichte nachträglich an die gewünschte Option an. Den Gleichstand muss die Empfehlung offen nennen.
5. **Der Bauherr wählt, die Projektsteuerung dokumentiert den Beschluss getrennt** (Quelle, Datum, Bedingungen) und verfolgt Umsetzung und Wirkung. Schweigen, Empfehlung oder Softwarestatus sind kein Beschluss; bleibt die Wahl aus, folgen neuer Termin und Folgen (R5, R11).
6. **Mindestens einmal eine unvollständige Vorlage:** Es gibt keine zweite zulässige Option. Die Projektsteuerung kennzeichnet die Vorlage als unvollständig und legt den Klärungsbedarf offen, statt eine Scheinoption zu bauen (HB 3.1).
7. **Mindestens einmal ein dringlicher Sachverhalt** (zum Beispiel Sicherheit oder Genehmigung): Er wird sofort gemeldet und am selben Arbeitstag dokumentiert; Schutzmaßnahmen warten nicht auf die MCDA (R9; HB 3, 3.1, 4).
8. **Alle sechs Vorgangsarten kommen vor,** jede mit ihrem Weg: Eine Frühwarnung wird geklärt und führt zu einem Risiko, Problem oder einer Aufgabe, oder sie wird geschlossen; ein Risiko tritt ein und wird zum Problem; eine Änderung entsteht ohne Risikoeintrag; eine Maßnahme ist umgesetzt, aber nicht wirksam (R8, R11).
9. **Risiken werden mit der 5×5-Matrix bewertet** (Fallgrenzen aus fall-E3). Auswirkung 5 ist immer vorrangig; eine nur geplante Maßnahme senkt die Bewertung nicht (R7).
10. **Takt sichtbar:** Die wöchentliche Prüfung läuft im Hintergrund (Prüfvermerk). Mindestens eine Station ist der Monatstermin (online, bis 60 Minuten) mit dem Monatsbericht von einer Seite als Bild. In einer Ruhezeit (zum Beispiel der Sommerpause) wird nur monatlich geprüft (R9, R10).
11. **Freigaben zum Abschluss einer Leistungsphase** erteilt der Bauherr selbst auf Vorlage der Projektsteuerung; LPH 0–9, nie G0–G5 (R6, O-14).
12. **Etwa 8 Stationen über die Leistungsphasen** (O-40, O-45), jede mit einer echten Bauherrenentscheidung. Die Zeitachse in `fall.md` reicht heute nur von LPH 4 bis 5 und muss erweitert werden (fall-H1). Ein möglicher Anker in LPH 8 ist eine verspätete Anlagenlieferung im Stil des Beispiels aus HB 3.2, mit eigenen Fallzahlen, nicht 1:1.
13. **Statusanzeige:** Kosten (€), Termin (Kalendertage am Zieltermin), offene Entscheidungen (R7, R10, O-40).
14. **„So läuft es oft“ / „Typischer Einwand und Antwort“** je Station (O-40). Die Einwände aus Abschnitt 3 (ew-E6) bilden den Grundstock.
15. Keine Vertragstexte und keine Leistungsbild-Sprache (O-37), kein Bezug zum Whitepaper (O-38), fiktiver Fall gekennzeichnet (O-45), kein Vertrieb (O-1).

## 8. Querschnitt: Technik und Umsetzung (H)

- **Tafeln aus `whitepaper.json`:** `::: tafel <id>` gibt V1.2-Tabellen wörtlich aus. Kollidierende Tafeln – `k6.4.2-t1` (k06-K8), `k6.4.4-t1` (k06-K15), `k7.6-t1` (k07-K2), `k10.5-t1` (k10-K2) – müssen durch eigene Bausteine in `inhalte/` ersetzt werden (zum Beispiel `::: karten`). Bei `k1.3-t1`, `k2.5-t1`, `k3.2-t1`, `k5.2-t1` und `k6.1-t1` genügt ein Ergänzungssatz unter der Tafel (k01-E6, k02-E4, k03-E1, k05-E2, k06-E2).
- **Glossar:** Es kommt heute vollständig aus `whitepaper.json` (`werkzeuge/inhalte.mjs` Z. 124–125, 507, 548–554). Für k13-K1 bis k13-E6 braucht es eine eigene Glossarquelle in `inhalte/` mit internen Belegen auf V1.2 oder V2.4. Die Glossarbezüge `[[…]]` sind auf diese Quelle umzustellen.
- **Belege:** Kommentare `# Belege …` und Compiler-Prüfungen kennen nur V1.2-Absatz-IDs. Für V2.4 ist ein internes Belegformat nötig, zum Beispiel `v24:hb-3.1`, `v24:tlb-2.1`; es erscheint nie sichtbar (O-38).
- **Komponente `::: governancefluss`** und die Sandbox-Logik bilden „Frühwarnung → bestätigen → Risiko“ ab. Sie müssen auf R8 umgestellt werden (k06-H1, ui-K2).
- **Platz der drei neuen Themen:** nach den 13 Teilen als Themen 14–16 (O-38: Reihenfolge der 13 bleibt), mit Querverweisen aus k04.3/k09.4 (Vorlage), k04.4/k06.4.4 (Vorgangsarten, Risiko) und k06.4.5/k09.5 (Takt).

## 9. Drei neue Theorie-Themen (O-38)

### Thema A · Entscheidungsvorlage mit MCDA

Gliederung und Kerninhalte:

1. **Wann eine Vorlage nötig ist** – Nötig ist sie bei jeder erforderlichen Handlungsentscheidung des Bauherrn. Routineaufgaben und reine Prüfaufträge brauchen nicht automatisch eine (HB 3.1, Absatz „Entscheidungsbedarf klären“).
2. **Wer was tut** – Die Projektsteuerung entwickelt, vergleicht und empfiehlt. Sie trifft, genehmigt oder bestätigt die Entscheidung nicht. Die befugte Stelle entscheidet (HB 3, HB 1, Abs. 5; TLB 2.1).
3. **Frage und Rahmen** – konkrete Frage, Grund für die Bauherrenentscheidung, Entscheidungstermin, Folgen einer Verzögerung, befugte Stelle mit Mandat oder Freigabebezug (HB 3.1).
4. **Mindestens zwei Optionen** – Zu jeder Option gehören Vorgehen, Kosten- und Terminfolgen, Qualität und Funktion, Restrisiken, Annahmen und benötigte Freigaben. „Weiter wie bisher“ zählt nur, wenn es zulässig ist. Eine untaugliche Scheinoption genügt nicht (HB 3.1).
5. **MCDA Schritt für Schritt** – Die Kriterien kommen aus den Projektzielen. Kriterien, Gewichte und Bewertungsstufen werden vorab mit dem Bauherrn abgestimmt, vorhandene Festlegungen genutzt. Gewichte und Punkte liegen zwischen 1 und 5; höhere Gewichte bedeuten mehr Einfluss, höhere Punkte eine günstigere Zielerreichung. Jede Punktestufe ist beschrieben, jede Zelle hat Punktwert, Begründung und Nachweis. Gewicht mal Punkte ergibt die Summe. Euro, Kalendertage und offene Fragen bleiben sichtbar, fehlende Angaben gelten nicht als null (HB 3.1).
6. **Grenzen des Rechnens** – Muss-Anforderungen zu Sicherheit, Genehmigung und Funktion werden vor dem Punktevergleich geprüft; eine unzulässige Option kann nicht gewinnen. Die Projektsteuerung prüft, ob andere vertretbare Gewichte die Rangfolge ändern. Eine hohe Punktzahl ersetzt kein Urteil, und die Empfehlung nennt Nachteile, Unsicherheiten und Voraussetzungen (HB 3.1).
7. **Beispiel Ersatzgerät** (fiktives Darstellungsbeispiel, HB 3.2; TLB 2.1; AS 2) – Frage: Bei einer verspäteten Anlagenlieferung ein gleichwertiges Ersatzgerät einsetzen oder abwarten? Beide Optionen erfüllen die Muss-Anforderungen.
   - A · Ersatzgerät: 80.000 € mehr, Zieltermin +7 Kalendertage, volle Funktion. B · Abwarten: 20.000 € mehr, +28 Kalendertage, volle Funktion.
   - Skalen vorab: Kosten bis 20.000 / 40.000 / 60.000 / 80.000 € geben 5 / 4 / 3 / 2 Punkte, darüber 1. Termin bis 7 / 14 / 21 / 28 Kalendertage geben 5 / 4 / 3 / 2 Punkte, darüber 1. Funktion voll: 5.
   - Gewichte: Kosten 3, Zieltermin 5, Funktion 2. A: 3×2 + 5×5 + 2×5 = **41**; B: 3×5 + 5×2 + 2×5 = **35** – Empfehlung A unter dieser Terminpriorität.
   - **Gewichtungsprüfung:** Termingewicht 3 statt 5 ergibt A: 3×2 + 3×5 + 2×5 = **31**, B: 3×5 + 3×2 + 2×5 = **31** – Gleichstand. Diese Abhängigkeit muss in der Empfehlung sichtbar bleiben.
   - Zur Vorlage gehören außerdem Kosten- und Terminplanstand, Nachweise der Gleichwertigkeit und Verfügbarkeit, Restrisiken beider Wege, nötige Freigaben, befugte Stelle und Entscheidungstermin. Ein Beschluss wird im Beispiel weder getroffen noch bestätigt.
   - Interaktiv: Regler für die drei Gewichte (1–5) mit Live-Summe; bei Gleichstand erscheint der Hinweis „Gewichtungsabhängig – die Empfehlung muss das sagen“. Dieselbe Logik nutzt der MCDA-Rechner in Explore (O-46).
8. **Vorlegen und nachhalten** – Zur Vorlage gehören Datenstand, Quellen und die Verknüpfung zum auslösenden Vorgang; sie wird fristgerecht in der Software abgelegt. Fehlt eine zweite Option, ist die Vorlage als unvollständig gekennzeichnet und der Klärungsbedarf offen. Dringliches und Schutzmaßnahmen warten nicht auf die MCDA (HB 3.1).
9. **Beschluss getrennt** – Die befugte Stelle entscheidet; die Projektsteuerung dokumentiert den tatsächlichen Beschluss mit Quelle, Datum und Bedingungen und verfolgt die Folgemaßnahmen. Schweigen, Empfehlung oder Softwarestatus sind kein Beschluss; bleibt er aus, folgen neuer Klärungstermin und Folgen (HB 3.1; VA 4.2 nur inhaltlich).
10. Übungen: Sortieren „zulässige Option oder Scheinoption?“; Wissenscheck „Termingewicht 3 – was folgt?“ (Antwort: Gleichstand 31:31, die Empfehlung muss die Abhängigkeit nennen); Wissenscheck „Die Projektsteuerung empfiehlt A, der Bauherr schweigt – ist A beschlossen?“ (Nein).

### Thema B · Vorgangsarten und Risikobewertung

Gliederung und Kerninhalte:

1. **Nicht jeder Hinweis wird zum Risiko** – die sieben Sachverhalte (HB 1, Tabelle):
   - Aufgabe: geplante Arbeit mit Ergebnis, Verantwortlichem und Termin.
   - Maßnahme: gezielte Handlung zur Klärung, Verbesserung oder Umsetzung eines Beschlusses.
   - Frühwarnung: noch nicht geklärter Hinweis.
   - Risiko: mögliches Ereignis oder unsichere Größe.
   - Problem: bereits eingetretener Zustand.
   - Änderung: bewusste Anpassung einer geltenden Vorgabe.
   - Entscheidung vorbereiten: die Vorlage nach Thema A.
2. **Wege zwischen den Arten** – Eine Frühwarnung führt nach der Klärung zum Risiko, Problem oder zur Aufgabe, oder sie wird begründet geschlossen; die Herkunft bleibt verknüpft (HB 1.2). Tritt ein Risiko ein, folgt die Problembearbeitung, unsichere weitere Folgen bleiben getrennt (HB 1.3). Aufgaben, Probleme und Änderungen brauchen keinen Risikoeintrag (HB 1, TLB 1). Zusammengehöriges wird verknüpft, nichts doppelt gezählt; zusammenfassen ist erlaubt, solange Verantwortung und Wege erkennbar bleiben. Die Zahl der Risiken ist nicht begrenzt; ein gemeinsamer Auslöser kann mehrere Risiken haben (HB 1).
3. **Je Art: was festgehalten wird und wann sie schließt** – nach HB 5 (Tabelle) und HB 1.1–1.6. Eine Aufgabe schließt mit dem verwendbaren Ergebnis, eine Maßnahme erst mit nachgewiesener Wirkung, ein Problem ohne Wahrscheinlichkeit und mit Lösungsnachweis. Eine Änderung belässt bis zur Freigabe die alte Grundlage; die Projektfreigabe ist keine Vertragsänderung oder Bestellung (HB 1.5, nur inhaltlich).
4. **Ein Risikoeintrag** – Ursache, ungewisses Ereignis oder ungewisse Größe, mögliche Folgen, betroffenes Ziel, Zeitraum. Fakten, Schätzungen und offene Fragen werden getrennt, der Datenstand genannt; die Vertretung muss erkennen, was bekannt ist (HB 2, Abs. 1).
5. **Bewerten in fünf Stufen** – Die Wahrscheinlichkeit hat fünf Stufen (sehr gering bis sehr hoch); die Grenzen legt der Bauherr fest, eine begründete Zuordnung genügt. Kosten: zusätzliche Kosten bei Eintritt, nichts doppelt zur Prognose. Termin: Kalendertage am benannten Zieltermin, Puffer berücksichtigt. Qualität und Funktion haben die Stufen 1–5 (geringe Abweichung … Ausfall der Hauptnutzung). Ein Wert genau auf der Grenze zählt zur niedrigeren Stufe (HB 2).
6. **Die 5×5-Matrix** – Wahrscheinlichkeit mal höchste belegte Auswirkung. 1–4 beobachten, 5–9 gezielt bearbeiten, 10–25 vorrangig, Auswirkung 5 immer vorrangig. Die Einzelwerte für Kosten, Termin und Qualität bleiben sichtbar. Punkte sind keine Geldwerte und keine Freigabe. Fehlende Angaben gelten nicht als null, die Einstufung bleibt dann vorläufig; bei unsicheren Mengen werden Bandbreite und Prüfbedarf festgehalten (HB 2). Interaktiv: anklickbare Matrix mit Farbfeldern und Text zur Priorität (Grundlage für das Explore-Werkzeug, O-46).
7. **Was die Priorität auslöst** – nach der Tabelle in HB 3: Beim Beobachten gibt es einen Verantwortlichen, einen Prüftermin und die Auslöser einer Neubewertung. Bei gezielter Bearbeitung eine Maßnahme mit Verantwortung und Termin. Bei vorrangiger Bearbeitung eine fachliche Einschätzung, Information an den Bauherrn und eine rechtzeitig vorbereitete Entscheidung. Wesentlich ist ein Risiko, wenn es vorrangig ist, eine Entscheidungsschwelle erreicht oder einen Warnanlass betrifft; dann gibt es Bandbreiten oder eine Klärungsfrage. Eine niedrige Wahrscheinlichkeit rechtfertigt nicht, eine schwere Folge auszublenden (HB 3).
8. **Warnanlässe außerhalb der Matrix** – Sicherheit, Genehmigung, fehlende Befugnisse und der drohende Verlust einer Handlungsoption; dringliche Meldungen warten nicht (HB 3).
9. **Maßnahmen und Wirkung** – Handlung, Verantwortlicher, Termin und erwartete Wirkung. Eine geplante Maßnahme senkt die Bewertung nicht, erst die belegte Wirkung. Umgesetzt und wirksam sind nicht dasselbe. Chancen werden gesondert beschrieben, nicht verrechnet (HB 3, HB 1.6).
10. **Wer was tut** – Die Projektsteuerung bewertet und zieht bei strittigen Fragen Fachleute hinzu; unterschiedliche Einschätzungen werden mit Begründung dokumentiert, nicht gemittelt. Ob ein wesentliches Restrisiko getragen wird, entscheidet der Bauherr auf Vorlage; die Projektsteuerung nimmt es nicht für ihn an (HB 1.3, HB 3).
11. **Schließen** – nur mit Grund: eingetreten und als Problem weitergeführt, entfallen oder nachweislich beseitigt. Ein als erledigt markierter Vorgang genügt nicht (HB 5).
12. Übungen: Sortieren mit Fallbeispielen „Frühwarnung, Risiko, Problem, Änderung oder Aufgabe?“ (zum Beispiel die längere Lieferzeit der Holzbauelemente, der Mensa-Wunsch, die Brandschutzauflage, der TGA-Nachtrag); Wissenscheck „W 2, Auswirkung 5 – welche Priorität?“ (vorrangig).

### Thema C · Takt und Monatsbericht

Gliederung und Kerninhalte:

1. **Grundsatz** – Die regelmäßige Prüfung ersetzt keine dringliche Meldung (HB 4).
2. **Sofort: dringliche Sachverhalte** – über den vereinbarten Meldeweg melden; sobald die unmittelbare Reaktion gesichert ist, am selben Arbeitstag dokumentieren. Es gibt keine zusätzliche Rufbereitschaft, aber eine erkannte akute Gefahr bleibt nicht liegen; Dringliches wartet weder auf die Sitzung noch auf die Bewertung (HB 4, HB 3).
3. **Wöchentlich in aktiven Zeiten** – Die Projektsteuerung prüft kurz alle offenen Einträge: Aufgaben, Maßnahmen, Frühwarnungen, Risiken, Probleme, Änderungen und offene Entscheidungen. Geprüft werden neue Informationen, fehlende Rückmeldungen, überfällige Ergebnisse, die Wirkung von Maßnahmen, ausstehende Freigaben und Auflagen. Vertieft wird nur Verändertes oder Klärungsbedürftiges, unveränderte Texte werden nicht neu geschrieben. Ein Prüfvermerk mit Datum und Bearbeiter hält den Durchgang fest. Neue Hinweise kommen spätestens bei der nächsten Prüfung hinein (HB 4).
4. **Ruhe- und Nachlaufzeiten** – nur wenn ausdrücklich vereinbart: monatliche Gesamtprüfung, neue Hinweise binnen fünf Arbeitstagen, Termin nur bei konkretem Bedarf; der Bericht bleibt (HB 4).
5. **Der Monatstermin** – in aktiven Zeiten einmal im Monat online, bis 60 Minuten. Bauherr und Projektsteuerung besprechen die relevanten Vorgänge, Fachleute kommen nach Bedarf dazu. Vor- und Nachbereitung gehören zur Leistung, die Zeitgrenze gilt für den Termin. Ergebnisse und nächste Schritte werden kurz festgehalten. Weitere Workshopreihen gibt es nicht (HB 4; AS 2).
6. **Der Monatsbericht** – höchstens eine Seite. Er zeigt wesentliche Veränderungen über alle Vorgangsarten, blockierte Aufgaben, kritische Maßnahmen, ungeklärte Frühwarnungen, wesentliche Probleme und Änderungen sowie offene Entscheidungen mit der benötigten Reaktion. Er nutzt denselben Informationsstand wie die Software, verweist auf die Einträge und braucht keine zweite Liste. Er ersetzt weder die Einträge noch die Sofortmeldung (HB 4). Interaktiv: ein Musterbericht des fiktiven Falls auf einer Seite, mit Markierung „Was gehört hinein?“.
7. **Ein Informationsstand** – Maßgeblich ist die Software, die der Bauherr bereitstellt. Eigene Arbeitsmittel sind erlaubt, die Inhalte werden fristgerecht übertragen. Bei einem Ausfall sichert die Projektsteuerung die Angaben vorübergehend strukturiert und überträgt sie danach; Dringliches geht auch ohne Software (HB 5).
8. **Anfang und Ende** – Hinweise werden ab Leistungsbeginn bearbeitet, der erste abgestimmte Bestand liegt zum vereinbarten Termin vor (HB 4). Am Ende übergibt die Projektsteuerung alle offenen Vorgänge mit Grundlagen, Fristen und Nachfolgern; ein Vorgang verschwindet nicht durch die Übergabe (HB 5).
9. **Was der Bauherr davon hat** – Er pflegt nichts. Ihn erreichen ein Termin von höchstens 60 Minuten im Monat, eine Seite Bericht, sofortige Meldungen bei Dringlichem und die Vorlagen, über die er entscheidet (O-36; HB 4).
10. Übungen: Regler „sofort · wöchentlich · monatlich · Ruhezeit“ (ersetzt den Takt-Regler in k06.4.5, siehe k06-K18 bis k06-K20); Sortieren „Gehört in den Monatsbericht?“ (blockierte Aufgabe ja, unveränderter Risikotext nein, offene Entscheidung mit Termin ja); Wissenscheck „Eine Genehmigungsauflage gefährdet die Sicherheit – bis zum Monatstermin warten?“ (Nein, sofort melden).

## 10. Zählung

| Datei | K | E | H | Summe |
|---|---|---|---|---|
| k01-kurzfassung.md | 0 | 7 | 1 | 8 |
| k02-ausgangslage.md | 0 | 5 | 2 | 7 |
| k03-begriffsrahmen.md | 0 | 4 | 1 | 5 |
| k04-verantwortungsfelder.md | 1 | 10 | 1 | 12 |
| k05-fuehrungsmodell.md | 1 | 3 | 2 | 6 |
| k06-companion.md | 22 | 9 | 3 | 34 |
| k07-leistungsarchitektur.md | 3 | 0 | 3 | 6 |
| k08-implementierung.md | 0 | 2 | 2 | 4 |
| k09-ergebnisbild.md | 7 | 3 | 3 | 13 |
| k10-anwendungssituationen.md | 2 | 3 | 1 | 6 |
| k11-neuinitialisierung.md | 0 | 2 | 1 | 3 |
| k12-gewinn.md | 0 | 1 | 1 | 2 |
| k13-glossar.md / Glossar | 3 | 6 (davon 16 neue Begriffe) | 2 | 11 |
| begriffs-kompass.md | 2 | 4 (davon 9 neue Einträge) | 1 | 7 |
| einwaende.md | 1 | 6 (davon 5 neue Einwände) | 2 | 9 |
| fall.md | 7 | 6 | 3 | 16 |
| src/engine/simulator.ts | 7 | 2 | 1 | 10 |
| src/ui/woerter.ts | 6 | 4 | 1 | 11 |
| **Summe** | **62** | **77** | **31** | **170** |

Dazu kommen die Story-Grundsätze (15 Punkte, Abschnitt 7), der Querschnitt (5 Punkte, Abschnitt 8) und die Gliederungen der drei neuen Themen (Abschnitt 9).
