// Anzeigefassung der Quelle V1.2 (O-29, L-66): Das Wort „Whitepaper“ kommt im Produkt nirgends vor, Satzfehler der Quelle auch nicht (R67).
// Die Quelle unter quellen/ bleibt unverändert; beim Kompilieren ersetzt diese Liste die wenigen Stellen
// des Originaltexts, die das Wort enthalten, und lässt den Glossarbegriff „Whitepaper“ weg. Zitate in
// inhalte/ werden gegen diese Fassung geprüft (wortgleich wie angezeigt).

/** Ersetzungen in fester Reihenfolge (vom Längeren zum Kürzeren). */
export const ERSETZUNGEN = /** @type {const} */ ([
  ['Ein Whitepaper von Bauherr Mentoren zur', 'Bauherr Mentoren zur'],
  ['in diesem Whitepaper', 'in MVG'],
  ['Leitthese dieses Whitepapers', 'Leitthese von MVG'],
  ['Das Whitepaper setzt', 'MVG setzt'],
  ['im Whitepaper als', 'in MVG als'],
  // R67 (hebt L-14 für die Anzeige auf): Satzfehler der Quelle erschienen in Tafeln als Tippfehler, seit O-38 ohne Originaltext
  ['Wissens-abhängigkeit', 'Wissensabhängigkeit'],
  ['Maßnahmenverknüp-fung', 'Maßnahmenverknüpfung'],
  ['Auftraggeber Logik', 'Auftraggeberlogik'],
  // R74: in eigenem Tafeltext (kein Zitat) das Kürzel ausschreiben – sonst steht in den Themen „Bauherr Mentoren“ (O-51, L-243)
  ['ohne Dauerrolle von BM', 'ohne Dauerrolle von Bauherr Mentoren'],
  // R76: Abkürzungen in den Karten „Delegierbar und nicht delegierbar“ (Tafel k3.2-t1) beim ersten Auftreten ausschreiben,
  // wie im Lesetext von k04/k05 („Nachhaltigkeit (ESG) und Lebenszykluskosten (LCC)“) und BEGRIFFE („CTC (Restkostenprognose)“)
  ['Qualität, ESG und LCC.', 'Qualität, Nachhaltigkeit (ESG) und Lebenszykluskosten (LCC).'],
  ['CTC-Berechnung', 'Restkostenprognose (CTC)'],
  // R78: die Rolle heißt auf der Seite „Projektleitung des Bauherrn“ (Tafel k1.3-t1, Zeile Befähigung)
  ['dass Bauherren-Projektleitung,', 'dass die Projektleitung des Bauherrn,'],
  ['Projektumfang und ESG/LCC;', 'Projektumfang, Nachhaltigkeit und Lebenszykluskosten (ESG/LCC);'],
]);

/** Zellen der Tafeln (Sprachdurchgang L-290): je Tafel genaue Zelltexte (Kopf oder Zeile) der Quelle → verständliche Fassung.
 * Jeder Eintrag muss genau eine Zelle der Tafel treffen, sonst bricht die Anzeigefassung ab (veraltete Liste). Die Aussage der Zelle bleibt dieselbe;
 * Wörter, die Abbildungen als Beleg brauchen (angeglichen in inhalte/abbildungen), bleiben stehen. */
export const TAFELZELLEN = /** @type {Record<string, [string, string][]>} */ ({
  'k1.3-t1': [
    ["Element", "Teil"],
    ["Ergebnis", "Was dabei herauskommt"],
    ["Bauherren-Mandats- und Verantwortungsmodell", "Modell für Befugnisse und Verantwortung"],
    ["Klärt Verantwortungsfelder, nichtdelegierbaren Kern, delegierbare Vorbereitung, Rollen, Schwellen und Eskalationswege.", "Klärt die sechs Verantwortungsfelder, was nur der Bauherr entscheiden kann, was andere vorbereiten dürfen, welche Rollen es gibt, ab welcher Grenze wer entscheidet und wie ein Thema nach oben gelangt."],
    ["Gibt jeder wesentlichen Bauherrenentscheidung eine eindeutige Kennung, einen Datenstand, ein Mandat, einen Freigabeweg und einen Nachverfolgungsstatus.", "Jede wichtige Entscheidung bekommt eine eindeutige Kennung. Zu ihr gehören der Stand der Unterlagen, auf dem sie beruht (Datenstand), das Mandat, der Weg der Freigabe und ein Vermerk, wie weit die Umsetzung ist."],
    ["Leistungsphasen- und Freigabemodell LPH 0–9", "Modell der Leistungsphasen und Freigaben (LPH 0–9)"],
    ["Verbindet Projektfortschritt mit Entscheidungsvorbereitung, Freigabereife, Risikoannahme und Nachweisführung.", "Verbindet den Fortschritt des Projekts mit der Vorbereitung der Entscheidungen, damit klar ist, wann eine Freigabe reif ist, welche Risiken getragen werden und wie alles belegt wird."],
    ["Standard für Entscheidungsvorlagen", "Aufbau der Entscheidungsvorlagen"],
    ["Sichert die Nachvollziehbarkeit von Entscheidungsfrage, Alternativen, Annahmen, Risiken, Datenstand, Empfehlung, Freigabe und Beschlusslage.", "Sorgt dafür, dass man nachvollziehen kann: welche Frage entschieden wurde, welche Möglichkeiten es gab, welche Annahmen und Risiken galten, auf welchem Stand der Unterlagen, was empfohlen, freigegeben und beschlossen wurde."],
    ["Übergibt Routinen, Rollen, Taktung, Fristen, Eskalationswege und Betriebslogik in den Regelbetrieb.", "Gibt feste Abläufe, Rollen, Termine, Fristen und Wege nach oben an den Regelbetrieb weiter."],
    ["Stellt sicher, dass Bauherren-Projektleitung, Auftraggeber Logik, PMO, Gremienrollen und Fachrollen das Modell selbst anwenden können.", "Sorgt dafür, dass die Projektleitung des Bauherrn, die Auftraggeberseite (die Stellen, die für den Bauherrn handeln), das PMO, die Mitglieder der Gremien und die Fachleute das Modell selbst anwenden können."],
  ],
  'k2.5-t1': [
    ["Symptom", "Warnzeichen"],
    ["Typisches Muster", "So zeigt es sich im Projekt"],
    ["Konsequenz für den Bauherrn", "Folge für den Bauherrn"],
    ["MVG-Reaktion", "Antwort von MVG"],
    ["Kosten, Termine, Qualität, ESG, Nutzeranforderungen und Risiko werden situativ gegeneinander ausgespielt.", "Kosten, Termine, Qualität, Nachhaltigkeit (ESG), Nutzerwünsche und Risiko werden je nach Lage gegeneinander ausgespielt."],
    ["Entscheidungen werden inkonsistent; spätere Korrekturen werden wahrscheinlicher.", "Entscheidungen widersprechen sich; spätere Korrekturen werden wahrscheinlicher."],
    ["Zielsystem, Muss-/Kann-Kriterien und Abwägungsregeln festlegen.", "Ein Zielsystem festlegen: was unbedingt erfüllt sein muss (Muss), was verhandelbar ist (Kann) und nach welchen Regeln abgewogen wird (Abwägungsregeln)."],
    ["RACI (Rollen- und Zuständigkeitsmatrix) oder Organigramm existieren, aber Freigabeschwellen, Stellvertretungen und Eskalationswege fehlen.", "Eine Rollenübersicht (RACI) oder ein Organigramm gibt es, aber es fehlen Grenzen, ab denen jemand anderes freigibt (Freigabeschwellen), Vertretungen und feste Wege nach oben (Eskalationswege)."],
    ["Entscheidungen werden informell getroffen oder zu spät eskaliert.", "Entscheidungen werden auf dem kurzen Dienstweg getroffen oder zu spät nach oben gegeben."],
    ["RACI um Mandat, Schwelle, letztverantwortliche Rolle und Bezug zur Freigabe erweitern.", "Die Rollenübersicht (RACI) ergänzen: Wer darf bis zu welcher Grenze entscheiden, wer trägt am Ende die Verantwortung und auf welche Freigabe bezieht sich das?"],
    ["Unterlagen sind umfangreich, aber Entscheidungsfrage, Optionen, Datenstand und Risiken sind nicht präzise genug.", "Die Unterlagen sind umfangreich, aber Entscheidungsfrage, Möglichkeiten zur Auswahl, Stand der Unterlagen und Risiken sind nicht genau genug beschrieben."],
    ["Gremien vertagen, entscheiden unter Unsicherheit oder delegieren Verantwortung zurück.", "Gremien vertagen, entscheiden unter Unsicherheit oder geben die Verantwortung zurück."],
    ["Entscheidungsreife je Freigabe definieren und mit Entscheidungs-IDs verbinden.", "Für jede Freigabe festlegen, wann die Entscheidung reif ist (Entscheidungsreife), und jeder wichtigen Entscheidung eine Kennung (Entscheidungs-ID) geben."],
    ["Datenstandslogik, Versionierung und referenzierte Entscheidungsgrundlagen einführen.", "Regeln für den Stand der Unterlagen und für Versionen einführen und bei jeder Entscheidung benennen, auf welchen Stand sie sich stützt."],
    ["Risiken und Änderungen laufen parallel, ohne gemeinsame Priorisierung, Auswirkungsbewertung und Freigabeschwelle.", "Risiken und Änderungen laufen nebeneinander her, ohne gemeinsame Reihenfolge der Dringlichkeit, ohne Bewertung der Auswirkungen und ohne Grenze, ab der jemand freigeben muss."],
    ["Risiko-/Änderungs-/Maßnahmensystem mit Entscheidungsverknüpfungen und Schwellenlogik koppeln.", "Risiken, Änderungen und Maßnahmen gemeinsam führen, mit Verbindung zu den Entscheidungen und mit festen Grenzen, ab denen jemand entscheiden muss."],
    ["Kostenprognosen, Restkosten, Risikoreserve und Risiken werden unterschiedlich gelesen.", "Verschiedene Stellen verstehen Kostenprognose, Restkosten, Risikoreserve und Risiken unterschiedlich."],
    ["Entscheidungen zu Budget und Neufestlegung der Projektbasis werden politisch oder informell statt evidenzbasiert getroffen.", "Entscheidungen zum Budget und zur Neufestlegung der Projektbasis werden aus politischen Gründen oder nach Absprache getroffen statt auf belegter Grundlage."],
    ["Prognosebericht, CTC-Entscheidungsanbindung und Neufestlegung der Projektbasis als Sonderformat außerhalb der regulären Freigabereihe etablieren.", "Einen Prognosebericht einführen, die Restkostenprognose (CTC) an Entscheidungen koppeln und für die Neufestlegung der Projektbasis ein eigenes Verfahren außerhalb der normalen Freigaben vorsehen."],
    ["Kritisches Wissen liegt bei wenigen Personen und ist nicht in Routinen übersetzt.", "Kritisches Wissen liegt bei wenigen Personen und ist nicht in feste Abläufe gebracht."],
    ["Organisation wird verletzlich, sobald Rollen wechseln oder ausfallen.", "Die Organisation gerät ins Wanken, sobald Rollen wechseln oder ausfallen."],
    ["Betriebshandbuch, Rollenlogik, Standardroutinen und Befähigung verankern.", "Betriebshandbuch, klare Rollen, feste Abläufe und Schulung einführen."],
    ["Themen werden nach oben gegeben, aber ohne klare Entscheidungsoptionen, Empfehlung oder Konsequenzen.", "Themen werden nach oben gegeben, aber ohne klare Möglichkeiten zur Auswahl, ohne Empfehlung und ohne Folgen."],
    ["Eskalation erzeugt Verzögerung statt Führung.", "Die Weitergabe nach oben führt zu Verzögerung statt zu Führung."],
    ["Standard für Entscheidungsvorlagen und Entscheidungsfrage je Eskalation verbindlich machen.", "Den festen Aufbau für Entscheidungsvorlagen und eine klare Entscheidungsfrage bei jeder Weitergabe nach oben verbindlich machen."],
  ],
  'k3.2-t1': [
    ["Koordination von Terminen, Unterlagen, Registern, Gesprächen, Arbeitssitzungen und Gremienvorlagen.", "Abstimmung von Terminen, Unterlagen, Listen (Registern), Gesprächen, Arbeitssitzungen und Gremienvorlagen."],
    ["Dokumentation von Besprechungen, Beschlüssen, Maßnahmen und Datenständen.", "Dokumentation von Besprechungen, Beschlüssen, Maßnahmen und Ständen der Unterlagen (Datenständen)."],
    ["Moderation, Strukturierung, Schulung und Befähigung.", "Gespräche leiten (Moderation), Ordnung schaffen (Strukturierung), Schulung und Befähigung."],
    ["Festlegung, welche Zielpriorität gilt und welche Zielkonflikte wie aufgelöst werden.", "Festlegen, welches Ziel Vorrang hat und wie entschieden wird, wenn Ziele sich widersprechen."],
    ["Entscheidung über Projektstart, wesentliche Freigabe, Neufestlegung der Projektbasis (erneute Abstimmung und Legitimation von Kosten-, Termin-, Risiko- und Projektumfangsgrundlagen), Fortführung oder Stopp, wesentliche Änderung oder Abbruch.", "Entscheiden, ob das Projekt startet, ob eine wichtige Freigabe erteilt wird, ob Kosten, Termine, Risiken und Projektumfang noch einmal neu abgestimmt und bestätigt werden (Neufestlegung der Projektbasis), ob das Projekt weiterläuft oder gestoppt wird und ob eine große Änderung kommt oder das Projekt abgebrochen wird."],
    ["Festlegung von Mandaten, Freigabeschwellen, Eskalationswegen und verbindlichen Entscheidungsrechten.", "Festlegen, wer was entscheiden darf (Mandate), ab welcher Grenze jemand anderes freigibt (Freigabeschwellen), wie ein Thema nach oben gelangt (Eskalationswege) und wer verbindlich entscheidet."],
    ["Akzeptanz von Risikoexposition sowie Auswirkungen auf Kosten, Termin, Qualität, Projektumfang und ESG/LCC; Freigabe des Einsatzes der Risikoreserve.", "Entscheiden, welche Risiken das Projekt trägt und welche Folgen für Kosten, Termin, Qualität, Projektumfang, Nachhaltigkeit (ESG) und Lebenszykluskosten (LCC) es hinnimmt; Geld aus der Risikoreserve freigeben."],
    ["Sicherstellung, dass die Organisation auf belastbarer Grundlage entscheidet und die Beschlusslage nachweisbar bleibt.", "Dafür sorgen, dass die Organisation auf verlässlicher Grundlage entscheidet und man später belegen kann, was beschlossen wurde."],
    ["Aufrechterhaltung der eigenen Bauherrenrolle und Steuerungsfähigkeit.", "Die eigene Rolle als Bauherr ausfüllen und die eigene Steuerungsfähigkeit erhalten."],
  ],
  'k3.3-t1': [
    ["Relevanz für MVG", "Was MVG dazu beiträgt"],
    ["Befugnisse, Freigabegrenzen, Zeichnungsrechte, Stellvertretungen, Eskalationsschwellen und Gremienbezug.", "Befugnisse, Grenzen für Freigaben, Unterschriftsrechte, Vertretungen, Grenzen für die Weitergabe nach oben und die Einbindung der Gremien."],
    ["MVG übersetzt Rollen in ein Mandatsmodell und verknüpft es mit Freigaben, Entscheidungs-IDs und Datenständen.", "MVG macht aus Rollen ein Regelwerk für Befugnisse (Mandatsmodell) und verknüpft es mit Freigaben, Entscheidungs-IDs und Ständen der Unterlagen."],
    ["Ziel, Grundsatzentscheidung, wesentliche Freigabe, Risikoannahme, Nachweisfähigkeit und Beschlusslage.", "Ziel, Grundsatzentscheidung, wichtige Freigabe, Entscheidung über Risiken, Nachweis und Beschlusslage."],
    ["MVG macht sichtbar, was der Bauherr selbst legitimieren und dokumentieren muss.", "MVG macht sichtbar, was der Bauherr selbst entscheiden, bestätigen und belegen muss."],
  ],
  'k4-t1': [
    ["Projektzweck, Bedarf, Muss-/Kann-Kriterien, Zielprioritäten, Abwägungsregeln.", "Wozu das Projekt da ist, was gebraucht wird, was unbedingt erfüllt sein muss (Muss) und was verhandelbar ist (Kann), welches Ziel Vorrang hat und welche Abwägungsregeln gelten."],
    ["Zielkonflikte werden situativ gelöst; spätere Änderungen wirken wie Sachzwang.", "Zielkonflikte werden je nach Lage gelöst; spätere Änderungen wirken wie unvermeidlich."],
    ["Entscheidungsrechte, Freigabeschwellen, Stellvertretungen, Eskalationswege, Gremienbezug.", "Wer was entscheiden darf, ab welcher Grenze jemand anderes freigibt (Freigabeschwellen), wer vertritt, wie ein Thema nach oben gelangt (Eskalationswege) und wie die Gremien eingebunden sind."],
    ["Rollenaufnahme, RACI-Vorschlag, Organigramm, Prozessanalyse, Gremienkalender.", "Rollen erfassen, Vorschlag für die Rollenübersicht (RACI), Organigramm, Analyse der Abläufe, Kalender der Gremien."],
    ["Rollen sind beschrieben, aber nicht entscheidungsfähig mandatiert.", "Die Rollen sind beschrieben, aber niemand hat ihnen die Befugnis gegeben, wirklich zu entscheiden."],
    ["Bauherren-Mandats- und Verantwortungsmodell mit Schwellen und Bezug zur Freigabe.", "Ein Modell für Befugnisse und Verantwortung mit Grenzen (Schwellen) und Bezug zur Freigabe."],
    ["Projektstart (LPH 0), Variantenwahl und Business Case (LPH 2), FID (LPH 3), Vergabe und Bindung einer Komponente mit langer Lieferzeit (LPH 7), Übergabe des Vorhabens (LPH 9), Neufestlegung der Projektbasis, Fortführung oder Stopp.", "Projektstart (LPH 0), Wahl der Variante und Business Case (LPH 2), endgültige Entscheidung zu investieren – FID (LPH 3), Vergabe und verbindliche Bestellung eines Bauteils mit langer Lieferzeit (LPH 7), Übergabe des Vorhabens (LPH 9), Neufestlegung der Projektbasis, Weiterführung oder Stopp."],
    ["System der Entscheidungs-IDs, Entscheidungsreife, Standard für Entscheidungsvorlagen.", "System der Entscheidungs-IDs, Entscheidungsreife, fester Aufbau der Entscheidungsvorlagen."],
    ["Akzeptanz von Risikoexposition, Restrisiko, Einsatz der Risikoreserve sowie Auswirkungen auf Kosten, Termin, Qualität, Projektumfang und ESG/LCC.", "Entscheiden, welche Risiken das Projekt bewusst trägt, das Restrisiko (was nach allen Gegenmaßnahmen übrig bleibt), den Einsatz der Risikoreserve (des Puffers für Risiken) sowie die Folgen für Kosten, Termin, Qualität, Projektumfang, Nachhaltigkeit und Lebenszykluskosten (ESG/LCC)."],
    ["Risikoregister, Bewertung, Vorschläge zur Risikominderung, Szenarien, Sensitivitäten.", "Risikoliste (Risikoregister), Bewertung, Vorschläge zur Risikominderung, Szenarien (mögliche Verläufe) und Rechnungen, wie stark sich das Ergebnis ändert, wenn sich Annahmen ändern (Sensitivitäten)."],
    ["Risiken werden gelistet, aber nicht bauherrenseitig angenommen oder eskaliert.", "Risiken stehen nur in einer Liste; sie werden weder bewusst vom Bauherrn angenommen noch zur Entscheidung an ihn weitergegeben."],
    ["Freigaben erfolgen auf unklarem Datenstand oder ohne Mandatsprüfung.", "Es wird freigegeben, obwohl unklar ist, welcher Stand der Unterlagen gilt, oder ohne zu prüfen, ob die freigebende Stelle befugt ist."],
    ["Leistungsphasen- und Freigabemodell LPH 0–9, Freigabeschwellen, Mindestgrundlagen, Datenstandsreferenz.", "Leistungsphasen- und Freigabemodell LPH 0–9, Freigabeschwellen, Mindestunterlagen, Bezug auf den benannten Datenstand."],
    ["Verbindlicher Datenstand, Annahmen, Versionen, Beschlusslage, Protokollstandard, Nachweiskette.", "Der verbindlich geltende Stand der Unterlagen (Datenstand), Annahmen, Versionen, Beschlusslage, einheitlicher Aufbau der Protokolle, Nachweiskette."],
    ["Datenpflege, Dokumentation, Protokolle, Annahmenregister, Unterlagenlenkung.", "Daten pflegen, dokumentieren, Protokolle schreiben, Liste der Annahmen führen, Unterlagen steuern (Unterlagenlenkung)."],
    ["Parallele Datenstände und nicht reproduzierbare Entscheidungsgrundlagen.", "Mehrere Fassungen der Zahlen nebeneinander und Entscheidungsgrundlagen, die sich später nicht rekonstruieren lassen."],
    ["Datenstandslogik, Standard für Entscheidungsvorlagen, Nachweiskette, Betriebshandbuch.", "Regeln für den Stand der Unterlagen, fester Aufbau der Entscheidungsvorlagen, Nachweiskette, Betriebshandbuch."],
  ],
  'k5.2-t1': [
    ["MVG-Baustein", "Baustein"],
    ["Funktion", "Wozu er da ist"],
    ["Minimale Wirkung für den Bauherrn", "Mindestens dieser Nutzen für den Bauherrn"],
    ["Legt fest, was Vorrang hat, wenn Kosten, Termine, Qualität, ESG, LCC, Risiko und Nutzwert kollidieren.", "Legt fest, was Vorrang hat, wenn Kosten, Termine, Qualität, Nachhaltigkeit (ESG), Lebenszykluskosten (LCC), Risiko und Nutzwert sich widersprechen."],
    ["Verhindert situative Priorisierung und schafft eine belastbare Grundlage für Varianten- und Freigabeentscheidungen.", "Verhindert, dass je nach Lage anders gewichtet wird, und gibt Entscheidungen über Varianten und Freigaben eine verlässliche Grundlage."],
    ["Übersetzt Rollen in Befugnisse, Schwellen, Stellvertretungen, Freigaben und Eskalationswege.", "Macht aus Rollen Befugnisse, Grenzen (Schwellen), Vertretungen, Freigaben und Wege nach oben (Eskalationswege)."],
    ["Verhindert verdeckte Verantwortungsübernahme und unklare Entscheidungsrechte.", "Verhindert, dass jemand unbemerkt Verantwortung an sich zieht und dass unklar bleibt, wer entscheiden darf."],
    ["Verknüpft Projektfortschritt mit Entscheidungsvorbereitung und Freigabereife.", "Verbindet den Fortschritt des Projekts mit der Vorbereitung der Entscheidungen und damit, wann eine Freigabe reif ist (Freigabereife)."],
    ["Macht sichtbar, welche Entscheidungen vor welchem Schritt belastbar getroffen werden müssen.", "Macht sichtbar, welche Entscheidungen vor welchem Schritt verlässlich getroffen werden müssen."],
    ["Gibt wesentlichen Entscheidungen eine eindeutige Kennung und Nachverfolgungslogik.", "Gibt wichtigen Entscheidungen eine eindeutige Kennung und hält fest, wie ihre Umsetzung verfolgt wird."],
    ["Schafft Transparenz über offene, vorbereitete, getroffene und nachzuhaltende Entscheidungen.", "Zeigt, welche Entscheidungen offen, vorbereitet, getroffen und noch nachzuverfolgen sind."],
    ["Definiert, welche Versionen, Annahmen und Beschlussgrundlagen gelten.", "Legt fest, welche Versionen, Annahmen und Beschlussgrundlagen gelten."],
    ["Reduziert parallele Wahrheiten und stärkt die Nachweiskette, Gremienfähigkeit und Nachvollziehbarkeit.", "Verringert, dass mehrere Fassungen der Wahrheit nebeneinander bestehen, und stärkt Nachweiskette und Nachvollziehbarkeit, sodass Gremien auf gesicherter Grundlage entscheiden können."],
    ["Risiko-/Änderungs-/Maßnahmenverknüp-fung", "Verknüpfung von Risiken, Änderungen und Maßnahmen"],
    ["Verhindert, dass Risiken und Änderungen nur gelistet, aber nicht führungswirksam werden.", "Verhindert, dass Risiken und Änderungen nur in Listen stehen, ohne dass jemand führt oder entscheidet."],
    ["Beschreibt den Regelbetrieb mit Taktung, Rollen, Routinen, Eskalation und Verantwortlichkeiten.", "Beschreibt den Regelbetrieb mit Terminen im Takt, Rollen, festen Abläufen, Wegen nach oben und Verantwortlichkeiten."],
    ["Sichert den Übergang aus dem Projektaufbau in die wiederholbare Anwendung.", "Sorgt dafür, dass aus dem Aufbau im Projekt ein Alltagsbetrieb wird, der sich wiederholen lässt."],
    ["Macht Schlüsselrollen in der Bauherrenorganisation handlungsfähig.", "Befähigt die wichtigsten Rollen in der Organisation des Bauherrn zu handeln."],
  ],
  'k6.1-t1': [
    ["Funktionslogik", "Funktion"],
    ["Beitrag zur Umsetzung", "Was sie tun soll"],
    // O-64: der Companion ist angekündigt, nicht bereitgestellt – der Nutzen ist ein Ziel, keine zugesagte Eigenschaft
    ["Nutzen für den Bauherrn", "Angestrebter Nutzen für den Bauherrn"],
    ["Erklärt Zweck der Freigabe, Mindestgrundlagen und typische Entscheidungs-IDs.", "Erklärt, wozu die Freigabe da ist, welche Unterlagen mindestens vorliegen müssen und wie typische Entscheidungs-IDs aussehen."],
    ["Klare Freigabereife ohne zusätzliche Abstimmungsschleifen.", "Klar, wann eine Freigabe reif ist, ohne zusätzliche Abstimmungsrunden."],
    ["Verknüpft Verantwortungsfeld, Rolle, Schwelle und Eskalation.", "Verknüpft Verantwortungsfeld, Rolle, Grenze (Schwelle) und Weitergabe nach oben (Eskalation)."],
    ["Bessere Nachvollziehbarkeit und eine belastbare Nachweiskette.", "Bessere Nachvollziehbarkeit und eine verlässliche Nachweiskette."],
    ["Überführt Routinen, Taktung, verantwortliche Rollen und Prüfungen in die Anwendung.", "Bringt feste Abläufe, Termine im Takt, verantwortliche Rollen und Prüfungen in die Anwendung."],
    ["Führt offene Punkte, Betriebslogik und Prüfzyklen zusammen.", "Führt offene Punkte, Abläufe des Betriebs und Prüfzyklen zusammen."],
    ["Strukturierter Übergang aus Beratungsmandat in Eigenbetrieb.", "Ordentlicher Übergang von der Beratung in den eigenen Betrieb der Bauherrenorganisation."],
  ],
  'k7.1-t1': [
    ["Aspekt", "Worum es geht"],
    ["Schnelles Lagebild der bauherrenseitigen Entscheidungs- und Nachweisfähigkeit.", "Schnell ein Bild davon, ob der Bauherr entscheiden und belegen kann."],
    ["Unklare Mandate, Entscheidungsstau, divergierende Datenstände, Brüche bei Freigaben sowie schleichende Risiko- oder Änderungsentwicklungen.", "Unklare Mandate, Entscheidungsstau, widersprüchliche Stände der Unterlagen, Freigaben, die nicht zusammenpassen, und Risiken oder Änderungen, die sich unbemerkt aufbauen."],
    ["Welche Entscheidungen sind kritisch? Welche Verantwortung bleibt beim Bauherrn? Welche Mandate fehlen? Welche Datenstände sind widersprüchlich? Welche Entscheidungen sind noch nicht entscheidungsreif?", "Welche Entscheidungen sind kritisch? Welche Verantwortung bleibt beim Bauherrn? Welche Mandate (Befugnisse) fehlen? Welche Stände der Unterlagen (Datenstände) widersprechen sich? Welche Entscheidungen sind noch nicht entscheidungsreif?"],
    ["Benennung einer verantwortlichen Rolle, Bereitstellung der Kernunterlagen, Teilnahme an Gesprächen und am Managementbericht, Entscheidung über Prioritäten.", "Eine verantwortliche Rolle benennen, die Kernunterlagen bereitstellen, an Gesprächen und am Managementbericht teilnehmen, über Prioritäten entscheiden."],
    ["Diagnose, Strukturierung, Moderation, Verdichtung, Empfehlung und priorisierte Umsetzungslogik.", "Bestandsaufnahme (Diagnose), Ordnung schaffen, Gespräche leiten, die Ergebnisse zusammenfassen, Empfehlungen geben und eine Reihenfolge für die Umsetzung vorschlagen."],
  ],
  'k7.2-t1': [
    ["Aspekt", "Worum es geht"],
    ["Entwurf eines belastbaren Mandats-, Rollen-, Freigabe- und Entscheidungsmodells.", "Entwurf eines verlässlichen Modells für Befugnisse, Rollen, Freigaben und Entscheidungen."],
    ["Diagnose liegt vor; die Organisation braucht ein funktionsfähiges Mindestmodell.", "Die Bestandsaufnahme (Diagnose) liegt vor; die Organisation braucht ein Mindestmodell, das funktioniert."],
    ["Welche Freigaben sind für das Projekt verbindlich? Welche Entscheidungen sind wesentlich? Welche Schwellen gelten? Welche Datenstände müssen je Entscheidung referenziert werden?", "Welche Freigaben sind für das Projekt verbindlich? Welche Entscheidungen sind wesentlich? Welche Grenzen (Schwellen) gelten? Auf welchen Stand der Unterlagen muss sich jede Entscheidung beziehen?"],
    ["Zielsystem, Mandatsmodell, Leistungsphasen- und Freigabemodell, System der Entscheidungs-IDs, Datenstandslogik, Eskalationslogik, Struktur des Betriebshandbuchs.", "Zielsystem, Mandatsmodell, Leistungsphasen- und Freigabemodell, System der Entscheidungs-IDs, Regeln für den Stand der Unterlagen, Regeln für die Weitergabe nach oben, Aufbau des Betriebshandbuchs."],
    ["Entscheidung über Zielprioritäten, Mandate, Schwellen, das Leistungsphasen- und Freigabemodell sowie die Regelbetriebslogik.", "Entscheiden, welches Ziel Vorrang hat, über Mandate und Schwellen, über das Leistungsphasen- und Freigabemodell und über die Regeln für den Regelbetrieb."],
    ["Konzeption, Strukturierung, Entscheidungsmoderation, Konsolidierung und Operationalisierung.", "Den Entwurf erarbeiten, Ordnung schaffen, Entscheidungsrunden leiten, Ergebnisse zusammenführen und das Modell alltagstauglich machen."],
  ],
  'k7.3-t1': [
    ["Aspekt", "Worum es geht"],
    ["Test des Modells an realen Entscheidungs- und Freigabesituationen.", "Das Modell an echten Entscheidungen und Freigaben testen."],
    ["Entwurf des Bauherren-Führungsmodells liegt vor, muss aber praktisch kalibriert werden.", "Der Entwurf des Bauherren-Führungsmodells liegt vor, muss aber noch an der Praxis feiner eingestellt (kalibriert) werden."],
    ["Berichte zur Pilotierung, kalibrierte Schwellen, angepasste Routinen, Erkenntnisse, Abnahmevorschlag.", "Berichte über den Test an echten Fällen (Pilotierung), eingestellte Grenzwerte, angepasste Abläufe, Erkenntnisse und ein Vorschlag zur Abnahme."],
    ["Anwendung im echten Entscheidungsfall, Rückmeldung, Freigabe von Anpassungen.", "Das Modell im echten Entscheidungsfall anwenden, Rückmeldung geben, über Anpassungen entscheiden."],
    ["Begleitung, Beobachtung, Kalibrierung, Moderation und Konsolidierung der Lernergebnisse.", "Begleiten, beobachten, feiner einstellen (Kalibrierung), Gespräche leiten und die Lernergebnisse zusammenführen."],
  ],
  'k7.4-t1': [
    ["Aspekt", "Worum es geht"],
    ["Verankerung des MVG-Modells in Schlüsselrollen und Übergabe in den Regelbetrieb.", "Das MVG-Modell in den wichtigsten Rollen verankern und in den Regelbetrieb übergeben."],
    ["Das Bauherren-Führungsmodell ist definiert und in der Pilotierung erprobt, aber noch nicht stabil in Routinen überführt.", "Das Bauherren-Führungsmodell ist festgelegt und im Test erprobt, aber noch nicht dauerhaft in feste Abläufe überführt."],
    ["Schulungen, Rollenkarten, Betriebshandbuch, Verbesserungsvorrat, Übergabebericht, Abnahmekriterien.", "Schulungen, Rollenkarten, Betriebshandbuch, eine Sammlung von Verbesserungsvorschlägen (Verbesserungsvorrat), Übergabebericht, Kriterien für die Abnahme."],
    ["Übernahme der Betriebsverantwortung, Benennung der Rollen, Teilnahme an Befähigungsmaßnahmen und Prüfungen.", "Die Verantwortung für den Betrieb übernehmen, die Rollen benennen, an Schulungen und Prüfungen teilnehmen."],
  ],
  'k7.5-t1': [
    ["Aspekt", "Worum es geht"],
    ["Wiederherstellung belastbarer Steuerungs-, Entscheidungs- und Nachweisfähigkeit.", "Das Projekt soll wieder steuerbar sein; es soll wieder entschieden und belegt werden können."],
    ["Projekt läuft, aber Entscheidungslogik, Datenstände, Prioritäten oder Mandate sind nicht mehr tragfähig.", "Das Projekt läuft, aber Entscheidungsregeln, Stände der Unterlagen, Prioritäten oder Befugnisse halten nicht mehr."],
    ["Welche Entscheidungen müssen neu legitimiert werden? Welche Datenstände gelten? Welche Freigaben müssen in der Folge nachgeholt oder wiederholt werden? Welche Prioritäten sind neu zu setzen?", "Welche Entscheidungen müssen neu getroffen und bestätigt werden? Welche Stände der Unterlagen gelten? Welche Freigaben müssen in der Folge nachgeholt oder wiederholt werden? Welche Prioritäten sind neu zu setzen?"],
    ["Governance-Lagebild, Neuordnung offener Entscheidungen, Logik zur Neufestlegung der Projektbasis, Eskalationsplan, stabilisierter Regelbetrieb.", "Ein Überblick über die Lage der Steuerung (Governance-Lagebild), neu geordnete offene Entscheidungen, Regeln für die Neufestlegung der Projektbasis, ein Plan für das Weitergeben nach oben und ein Regelbetrieb, der wieder verlässlich läuft."],
    ["Entscheidung über den Auftrag zur MVG-Neuinitialisierung, Prioritäten, Neufestlegung der Projektbasis, Freigaben und eine neue Mandatslogik.", "Entscheiden über den Auftrag zur MVG-Neuinitialisierung, über Prioritäten, die Neufestlegung der Projektbasis, Freigaben und neue Regeln für Befugnisse."],
    ["Strukturierung, Konzeption der MVG-Neuinitialisierung, Moderation, Entscheidungslogik, Übergabe und Stabilisierung.", "Ordnung schaffen, die MVG-Neuinitialisierung entwerfen, Gespräche leiten, Entscheidungsregeln erarbeiten, übergeben und stabilisieren."],
  ],
  'k8.1-t1': [
    ["Vorgehensschritt", "Schritt"],
    ["Kernaktivitäten", "Hauptarbeiten"],
    ["Ausübungsfähigkeit des Bauherrn prüfen.", "Prüfen, ob der Bauherr seine Verantwortung wahrnehmen kann."],
    ["Dokumentenprüfung, Gespräche, Sichtung der Entscheidungen, Mandats- und Datenstandsprüfung.", "Unterlagen prüfen, Gespräche führen, Entscheidungen sichten, Mandate und Stände der Unterlagen prüfen."],
    ["Entscheidungen zu Mandaten, Schwellen, Freigaben und Rollen.", "Über Mandate, Grenzen (Schwellen), Freigaben und Rollen entscheiden."],
    ["Entwurf abgenommen oder mit Auflagen bestätigt.", "Entwurf abgenommen oder mit Bedingungen (Auflagen) bestätigt."],
    ["Anwendung im realen Projekt, Rückmeldung, Freigaben.", "Das Modell im echten Projekt anwenden, Rückmeldung geben, Freigaben erteilen."],
    ["Berichte zur Pilotierung, kalibrierte Schwellen, Erkenntnisse.", "Berichte zur Pilotierung (Test an echten Fällen), eingestellte Grenzwerte, Erkenntnisse."],
    ["Schlüsselrollen handlungsfähig machen.", "Die wichtigsten Rollen handlungsfähig machen."],
    ["Schulungen, Rollenklärungen, Entscheidungsübungen, Regelbetriebslogik.", "Schulungen, Rollenklärungen, Entscheidungsübungen, Regeln für den Regelbetrieb."],
    ["Teilnahme der Schlüsselrollen, Übernahme der Routinen.", "Teilnahme der wichtigsten Rollen, Übernahme der festen Abläufe."],
    ["Abnahme erteilen, die verantwortliche Rolle für den Regelbetrieb benennen und den Prüfzyklus bestätigen.", "Abnahme erteilen, die verantwortliche Rolle für den Regelbetrieb benennen und den Rhythmus der Prüfungen bestätigen."],
    ["Regelbetrieb freigegeben.", "Regelbetrieb vom Bauherrn bestätigt."],
  ],
  'k8.2-t1': [
    ["Fokus", "Schwerpunkt"],
    ["Typische Ergebnisse", "Was typischerweise vorliegt"],
    ["Diagnose und Priorisierung", "Bestandsaufnahme und Prioritäten"],
    ["Konzeption und Mindeststandard", "Entwurf und Mindeststandard"],
    ["Modell in Anwendung und Kalibrierung", "Das Modell wird angewendet und feiner eingestellt"],
    ["Mandatsmodell, Leistungsphasen- und Freigabemodell, Entscheidungs-IDs, Datenstandslogik.", "Mandatsmodell, Leistungsphasen- und Freigabemodell, Entscheidungs-IDs, Regeln für den Stand der Unterlagen."],
    ["Bericht zur Pilotierung, kalibrierte Routinen, Befähigung; der Entwurf des Betriebshandbuchs liegt vor, die Übergabe schließt an.", "Bericht zur Pilotierung (Test an echten Fällen), eingestellte Abläufe, Schulung; der Entwurf des Betriebshandbuchs liegt vor, die Übergabe schließt an."],
  ],
  'k8.4-t1': [
    ["Sind Zielprioritäten und Abwägungsregeln dokumentiert und entscheidungsfähig?", "Sind die Rangfolge der Ziele und die Abwägungsregeln dokumentiert, sodass danach entschieden werden kann?"],
    ["Sind letztverantwortliche Rollen, Schwellen, Stellvertretungen und Eskalationswege klar?", "Ist klar, wer am Ende verantwortlich ist, ab welcher Grenze wer entscheidet, wer vertritt und wie ein Thema nach oben gelangt?"],
    ["Sind wesentliche Entscheidungen identifizierbar und nachverfolgbar?", "Lassen sich wesentliche Entscheidungen eindeutig erkennen und verfolgen?"],
    ["Risiko-/Änderungs-/Maßnahmenverknüpfung", "Verknüpfung von Risiken, Änderungen und Maßnahmen"],
    ["Sind Regelbetrieb, Taktung, Rollen und Prüfroutinen beschrieben?", "Sind Regelbetrieb, Termine im Takt, Rollen und Prüfabläufe beschrieben?"],
    ["Können Schlüsselrollen das Modell ohne Dauerrolle von BM anwenden?", "Können die wichtigsten Rollen das Modell anwenden, ohne dass Bauherr Mentoren dauerhaft mitarbeitet?"],
  ],
  'k9.3-t1': [
    ["Sind Bedarf, Zielbild und Auftrag geklärt – gibt es eine legitimierte Grundlage für den Planungsstart?", "Sind Bedarf, Zielbild und Auftrag geklärt – liegt eine verlässliche, vom Bauherrn getragene Grundlage für den Planungsstart vor?"],
    ["Ist auf Basis der Kostenschätzung eine Vorzugsvariante gewählt – und trägt der Business Case die Weiterplanung?", "Ist auf Basis der Kostenschätzung eine bevorzugte Variante gewählt – und trägt der Business Case die Weiterplanung?"],
    ["Sind die Genehmigungsunterlagen eingereicht beziehungsweise die Genehmigungslage gesichert – und sind Auflagen und Risiken bewertet?", "Sind die Genehmigungsunterlagen eingereicht oder die Genehmigung sonst gesichert – und sind Auflagen und Risiken bewertet?"],
    ["Sind Leistungsverzeichnisse und Vergabeunterlagen vollständig – und ist die Vergabestrategie mit Losen, Verfahren und Terminen beschlossen?", "Sind Leistungsverzeichnisse und Vergabeunterlagen vollständig – und ist die Vergabestrategie mit Teilpaketen der Ausschreibung (Losen), Verfahren und Terminen beschlossen?"],
    ["Ist das Vergabeergebnis geprüft und im Budgetrahmen – können Bauverträge geschlossen und Komponenten mit langer Lieferzeit gebunden werden?", "Ist das Vergabeergebnis geprüft und im Budgetrahmen – können Bauverträge geschlossen und Bauteile mit langer Lieferzeit verbindlich bestellt werden?"],
  ],
  'k11.3-t1': [
    ["Entscheidungsinventar", "Bestandsliste der Entscheidungen"],
    ["Macht offene, überfällige oder unklare wesentliche Entscheidungen sichtbar.", "Zeigt, welche wichtigen Entscheidungen offen, überfällig oder unklar sind."],
    ["Logik zur Neufestlegung der Projektbasis", "Regeln für die Neufestlegung der Projektbasis"],
    ["Klärt, ob und wie Kosten, Termine, Projektumfang, Risiko oder Mandat neu legitimiert werden müssen.", "Klärt, ob und wie Kosten, Termine, Projektumfang, Risiko oder Befugnisse neu festgelegt und bestätigt werden müssen."],
    ["Datenstandsbereinigung", "Klärung des Datenstands"],
    ["Definiert, welcher Stand für die nächsten Entscheidungen gilt.", "Legt fest, welcher Stand der Unterlagen für die nächsten Entscheidungen gilt."],
    ["Stabilisiertes Betriebshandbuch", "Überarbeitetes Betriebshandbuch"],
    ["Führt das Projekt nach der MVG-Neuinitialisierung in einen handhabbaren Regelbetrieb zurück.", "Bringt das Projekt nach der MVG-Neuinitialisierung zurück in einen Regelbetrieb, der sich bewältigen lässt."],
  ],
  'k12-t1': [
    // O-64: Gewinne als Ziel, nicht als zugesagte Wirkung
    ["Gewinn", "Angestrebter Gewinn"],
    ["Wirkung", "Wie er entstehen soll"],
    ["Betriebshandbuch, Routinen und Unterstützung durch den MVG Companion erleichtern den Regelbetrieb.", "Betriebshandbuch, Routinen und – sobald verfügbar – der MVG Companion sollen den Regelbetrieb erleichtern."],
    ["Entscheidungsfragen, Mandate, Freigaben und Datenstände werden vor der Freigabe zusammengeführt.", "Vor der Freigabe werden Entscheidungsfrage, Befugnisse, Freigabe und Stand der Unterlagen zusammengeführt."],
    ["Rollen lernen die MVG-Logik nicht nur in einer Arbeitssitzung, sondern in der Anwendung.", "Rollen lernen MVG nicht nur in einer Arbeitssitzung, sondern in der Anwendung."],
    ["Bessere Nachweisfähigkeit", "Besser belegbar"],
    ["Entscheidungs-IDs, Datenstände und Beschlusslagen bleiben referenzierbar.", "Entscheidungs-IDs, Stände der Unterlagen und Beschlüsse lassen sich jederzeit wiederfinden."],
    ["Geringere Zusatzlast", "Weniger zusätzliche Arbeit"],
    ["Der Mindeststandard bleibt auf führungsrelevante Entscheidungen konzentriert.", "Der Mindeststandard beschränkt sich auf die Entscheidungen, auf die es für die Führung ankommt."],
  ],
  'k12.1-t1': [
    ["Welche Entscheidungen, Mandate, Freigaben und Datenstände sind im 30/60/90-Orientierungsrahmen nach der MVG-Reifegradanalyse relevant?", "Welche Entscheidungen, Befugnisse, Freigaben und Stände der Unterlagen sind nach der MVG-Reifegradanalyse im 30/60/90-Tage-Plan wichtig?"],
    ["Lagebild, Entscheidungsliste und priorisierte Umsetzungsschritte.", "Überblick über die Lage, Entscheidungsliste und Umsetzungsschritte in einer festen Reihenfolge."],
    ["Companion-Kalibrierung", "Einrichtung des Companion (sobald er verfügbar ist)"],
    ["Anwendungslogik für Schulung, Pilotierung und Übergabe.", "Eine Arbeitsweise für Schulung, Erprobung und Übergabe."],
    ["Welche echte Entscheidung eignet sich zur Kalibrierung des MVG-Modells?", "Welche echte Entscheidung eignet sich zum Feineinstellen (Kalibrieren) des MVG-Modells?"],
    ["Praxistest mit Freigabefrage, Entscheidungs-ID, Datenstand und Nachweislogik.", "Praxistest mit Freigabefrage, Entscheidungs-ID, Datenstand und Regeln für den Nachweis."],
  ],
});

/** Glossarbegriffe, die entfallen */
const OHNE_BEGRIFF = new Set(['Whitepaper']);

/** @param {string} t */
export function ersetze(t) {
  let aus = t;
  for (const [alt, neu] of ERSETZUNGEN) aus = aus.split(alt).join(neu);
  return aus;
}


/**
 * Ersetzt in einer Tafel (art „tabelle“) genaue Zellen laut TAFELZELLEN und baut den Text neu auf.
 * Jede Angabe muss genau eine Zelle treffen (Kopf oder Zeile), sonst ist die Liste veraltet.
 * @param {Record<string, any>} t
 */
function ersetzeZellen(t) {
  const paare = TAFELZELLEN[String(t['id'])];
  if (paare === undefined) return t;
  const kopf = Array.isArray(t['kopf']) ? [...t['kopf']] : [];
  const zeilen = Array.isArray(t['zeilen']) ? t['zeilen'].map((/** @type {any} */ z) => (Array.isArray(z) ? [...z] : z)) : [];
  const vorher = [kopf, ...zeilen].map((z) => z.join(' | ')).join('\n');
  if (typeof t['text'] === 'string' && t['text'] !== vorher) throw new Error(`Anzeigefassung: Text der Tafel ${t['id']} passt nicht zu Kopf und Zeilen`);
  for (const [alt, neu] of paare) {
    let treffer = 0;
    for (const reihe of [kopf, ...zeilen]) {
      for (let i = 0; i < reihe.length; i += 1) {
        if (reihe[i] === alt) { reihe[i] = neu; treffer += 1; }
      }
    }
    if (treffer !== 1) throw new Error(`Anzeigefassung: Tafel ${t['id']}: Zelle „${alt.slice(0, 60)}“ trifft ${treffer}× (TAFELZELLEN ist veraltet)`);
  }
  return { ...t, kopf, zeilen, text: [kopf, ...zeilen].map((z) => z.join(' | ')).join('\n') };
}

/**
 * Tiefe Kopie mit ersetzten Texten, ohne den Glossarbegriff „Whitepaper“ (Glossar und Tabellenzeile).
 * Übrig gebliebene Vorkommen (außer Dateiname der Quelle) sind ein Fehler: die Liste ist dann zu ergänzen.
 * @template T
 * @param {T} wp
 * @returns {T}
 */
export function anzeigeFassung(wp) {
  /** @param {any} o @returns {any} */
  const gehe = (o) => {
    if (typeof o === 'string') return ersetze(o);
    if (Array.isArray(o)) return o.map(gehe);
    if (o === null || typeof o !== 'object') return o;
    /** @type {Record<string, any>} */
    const aus = {};
    const quelleObjekt = o['art'] === 'tabelle' && TAFELZELLEN[String(o['id'])] !== undefined ? ersetzeZellen(o) : o;
    for (const [k, v] of Object.entries(quelleObjekt)) aus[k] = k === 'quelle' ? v : gehe(v);
    if (aus['art'] === 'tabelle' && Array.isArray(aus['zeilen'])) {
      const weg = aus['zeilen'].filter((/** @type {any} */ z) => Array.isArray(z) && OHNE_BEGRIFF.has(String(z[0])));
      if (weg.length > 0) {
        aus['zeilen'] = aus['zeilen'].filter((/** @type {any} */ z) => !weg.includes(z));
        if (typeof aus['text'] === 'string') {
          aus['text'] = aus['text'].split('\n').filter((/** @type {string} */ zeile) => !weg.some((/** @type {any[]} */ z) => zeile === z.join(' | '))).join('\n');
        }
      }
    }
    return aus;
  };
  const aus = gehe(wp);
  if (Array.isArray(aus.glossar)) aus.glossar = aus.glossar.filter((/** @type {any} */ g) => !OHNE_BEGRIFF.has(g.begriff));
  const rest = JSON.stringify({ ...aus, quelle: null }).match(/.{0,40}white ?paper.{0,40}/giu);
  if (rest !== null) throw new Error(`Anzeigefassung: „Whitepaper“ bleibt stehen – Ersetzungsliste ergänzen: ${rest.join(' … ')}`);
  return aus;
}
