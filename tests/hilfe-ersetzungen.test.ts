// Hilfe (P13, R48): jede Ersetzung der Übernahme wirkt – ihr Ergebnis steht in der erzeugten Hilfe. So kann keine
// Angleichung an MVG (Zuständigkeiten, Status, Schwellen, Begriffe) wegfallen, ohne dass ein Test rot wird.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ERSETZUNGEN, baueHilfe } from '../werkzeuge/hilfe.mjs';

/** Regeln, deren Ergebnis bewusst nicht im Text steht: eine frühere Regel oder ein anderer Schritt fasst dieselbe Stelle */
const AUSNAHMEN = new Set([
  'Einfuehrungs-\\/Reset-Rhythmus', // Teil von „Standardisierter Einfuehrungs-/Reset-Rhythmus“ (frühere Regel)
  'Leistungsphase \\(gates\\)', // Feldname in <code>, in Überschriften entfernt (R45)
  'Whitepaper-Inhalte', 'Das Whitepaper beschreibt', 'Whitepaper', // Stellen in entfernten Abschnitten bzw. von spezielleren Regeln gefasst
  // R49: standen nur im entfernten Abschnitt „Compliance & Standards-Zuordnung“; als Schutz für spätere Quellstände behalten
  'Change Management', 'Risk Management', 'Decision Gates', 'Stage Gates',
]);

/** Zahl der Regeln heute; wer eine Regel bewusst streicht, senkt diese Zahl mit Begründung */
const MINDESTENS = 284;

/** Fachlich tragende Ergebnisse (k9.3-p3, k4.2-p3, k6.4.2-t1, k6.4.4-p1, k6.4.3-p1, O-1) – unabhängig von der Regelliste */
const FEST = [
  'Frühwarnung → Risiko → Entscheidung (Entscheidungsvorlage) → Freigabe → Maßnahme → Managementbericht',
  'Berät CTC-Neurechnungen mit Abweichung > 5 % (Bestätigung durch den Bauherrn)',
  'Beschlüsse des Bauherrn mit klaren Bedingungen vorbereiten',
  'Gremium, in dem der Bauherr strategische Änderungen beschließt',
  'Managementbericht lesen, Top-Entscheidungen des Bauherrn beraten',
  'Managementbericht entgegennehmen und die Beschlussfassung des Bauherrn beraten',
  'Achten Sie darauf, dass der Bauherr die Freigabe im Freigabeprozess der Entscheidungsvorlage signiert',
  'Bauherr (Lenkungskreis berät):',
  'Offen · In Bearbeitung · Entscheidungsreif · Entschieden · Verworfen; Freigabeprozess der Entscheidungsvorlage',
  'Freigabeprozess bis „beschlossen“ führen (Status: Entschieden)',
  'Bauherren-PL: Eigenfreigabe bis einschließlich 100 TEUR',
  'Änderungsgremium: über 100 TEUR bis einschließlich 5 Mio. €',
  'Änderungsgremium bis einschließlich 5 Mio. €, darüber Beschlussfassung durch den Bauherrn im Lenkungskreis',
  'sonst Entscheidung des Bauherrn (Eskalation entlang der Mandatsleiter)',
  'eskaliert es entlang der Mandatsleiter',
  'pflegt Maßnahmen-, Problemregister, Governance-Kalender, Protokolle und Nachweise (MVG Kap. 6.4.2)',
  'Verantwortliche Rollen, PMO',
  'Bei eingeschränkter Steuerbarkeit ist die MVG-Neuinitialisierung das passende Format',
  // R48
  'Maßnahmen-, Problemregister, Governance-Kalender und Protokolle pflegt das PMO (MVG Kap. 6.4.2)',
  'auf Status „Entschieden“ aktualisiert',
  'was der Bauherr entscheiden soll (der Lenkungskreis berät)',
  'Berät Eskalationen aus der Risikobesprechung (Beschlussfassung durch den Bauherrn)',
  'Abweichung > 5 %: Eskalation entlang der Mandatsleiter',
  'nächste Stufe der Mandatsleiter (Änderungsgremium bzw. Bauherr im Lenkungskreis)',
  'Weist EAC und Stand der Risikoreserve aus (Freigabe des Einsatzes: Bauherr)',
  'Orientierungsrahmen nach der Reifegradanalyse und bei MVG-Neuinitialisierung',
  'Auflagen prüfbar und terminiert vorschlagen (die Freigabe erteilt der Bauherr)',
  'die Sichtbarkeit der Ansichten verwaltet der Admin',
  // R48 (Architektur): Schritte in `angleiche` (DOM) statt ERSETZUNGEN
  'Verantwortungspyramide (Ansicht der Anwendung)',
  'Verantwortungspyramide (MVG Kap. 3.3)',
  'Bauherr (im Lenkungskreis)',
  // R49: Nachweise (k6.4.2-t1), Einführungsrolle (k9.2-p4), 30/60/90 (k8.2), Maßnahmen (k6.4.3-p2), Mandat (k6.4.5-p1), Leitthese (k1-p1)
  'Nachweise und Verknüpfungen pflegt das PMO mit den Fachrollen (MVG Kap. 6.4.2)',
  'als Einführungsrolle, nach der Einführung deaktiviert (MVG Kap. 9.2)',
  'nur für die Einführung, danach deaktiviert (MVG Kap. 9.2)',
  '90 Tage Modell in Anwendung – die Übergabe schließt an (MVG Kap. 8.2)',
  'Beschlüsse und Auflagen werden zu Maßnahmen mit Frist',
  'Sie wird zur Entscheidung nach Mandat vorgelegt',
  'Arbeit kann delegiert werden; bauherrenseitige Legitimation nicht (MVG Kap. 1)',
  // R50: Beschluss nach Mandat (k4.2-p3, k6.4.5-p1), Freigabe durch den Bauherrn (k9.3-p3), 30/60/90 im Handbuch (k8.2)
  'durch die nach Mandat zuständige Stelle (Bauherren-PL, Änderungsgremium oder Beschlussfassung durch den Bauherrn im Lenkungskreis)',
  'die Freigabe erteilt der Bauherr selbst auf Vorlage der Bauherren-PL (der Lenkungskreis berät)',
  'Modell in Anwendung, Schwellen kalibriert, Entwurf des Betriebshandbuchs – die Übergabe schließt an',
  // R51: nach Mandat beschlossen, an einer Freigabe entscheidet der Bauherr (k4.2-p3, k6.4.5-p1, k9.3-p3)
  'werden nach Mandat beschlossen (Bauherren-PL, Änderungsgremium oder Beschlussfassung durch den Bauherrn im Lenkungskreis); betrifft eine Entscheidung eine',
  'ausgearbeitet und nach Mandat beschlossen wird (die Freigabe erteilt der Bauherr)',
  // R53: Änderungen nach Mandat, A = letztverantwortlich (k4.2-p1, k4.2-p3)
  'Gremium zur Bewertung und Entscheidung von Änderungen nach Mandat (über 100 TEUR bis einschließlich 5 Mio. €).',
  'Ist letztverantwortlich (A) für alle Freigaben LPH 0–9',
  'wer ausführt (R), wer letztverantwortlich ist (A), wer konsultiert (C) oder informiert (I) wird',
];

/** Wortlaut der Quelle, der nach der Angleichung nirgends mehr stehen darf (R47/R48: Zuständigkeit, Register, Status) */
const WEG = /Bestätigt CTC-Neurechnungen|Beschlüsse mit klaren Bedingungen fassen|Gremium für strategische Change-Beschlüsse|entgegennehmen und Beschlüsse fassen|Trägt KEINE projektbezogenen|Register-Verantwortliche \(Projektsteuerung\)|Top-Entscheidungen treffen|auf Status beschlossen|Lenkungskreis informieren|Freigaben verwaltet der Admin|Betreiber-Rolle|Arbeit ist delegierbar|pflegt Nachweise & Links|Compliance & Standards-Zuordnung|MVG ist kompatibel|klassischen PMO-Einrichtung|wenn der Berater abzieht|Regelbetrieb\/ ?Übergabe\.|zu Aktionen mit Frist|berfällige Aktionen|dem Gremium zur Beschlussfassung|ohne eine Zeile Code|garantiert prüfungs|verlässt das Haus|ultimative Verantwortung|Anti-Patterns|MVG-Adoption|Druckbar als PDF|jede Karte führt mit ihren Knöpfen|Wie wir arbeiten\. |Berater bleibt als Sparringspartner| · druckbares Freigabe-Dossier|Für Beratungskunden kostenfrei|klappt alle Kapitel automatisch auf|englisch: Evidence|Methodische Grundlage|anschlussfähig an anerkannte Standards|orientiert sich konzeptionell|Approval-Stufen|Datenvertrags \(52\)|Pilotbetrieb, Übergabe, Verbesserungs|Nutzen Sie die Approval-Workflows|an der Freigabe beschlossen|zur Freigabe bringen|Freigabe Fassadenmuster|Neukunden-Einrichtung|Beraterstandard|Zwei Berater haben|3 dringendste Domänen|LPH 0–8|Re-Baseline|(?<!letzt)verantwortliche Rolle \(A\)|Kunden mit eigenem projektnahem|Freigabe-Dossier|Revisionssicherheit|neuer Berater|Kundenprojekt|Freigabe von Changes|Change-Freigaben|[Ii]st Accountable für|Accountable bleibt|als Accountable auf|rechenschaftspflichtig|Rohbauvergabe an Bieter B, (?:Budget )?4,1 Mio|Accountable Role|Accountable-Rolle|freigegebenen Changes|Entscheidung \(Freigabe\)|Approval-Workflow mit 6|Kundeninstallation|revisionssicher|ist Accountable|einem Accountable|Freigabebefugnis einer Rolle/u;

test('Hilfe (R48): jede Ersetzung mit festem Ersatz steht im Ergebnis – außer den benannten Ausnahmen', () => {
  const { hilfe, fehler } = baueHilfe({ ziel: null });
  assert.deepEqual(fehler, []);
  const teile: string[] = [];
  const sammle = (o: unknown): void => {
    if (typeof o === 'string') teile.push(o);
    else if (Array.isArray(o)) o.forEach(sammle);
    else if (o !== null && typeof o === 'object') Object.values(o).forEach(sammle);
  };
  sammle(hilfe);
  const text = teile.join(' ').replace(/<wbr>/gu, '').replace(/<[^>]+>/gu, ' ')
    .replace(/&gt;/gu, '>').replace(/&lt;/gu, '<').replace(/&quot;/gu, '"').replace(/&amp;/gu, '&').replace(/\s+/gu, ' ');
  const fehlt = (ERSETZUNGEN as [RegExp, string][])
    .filter(([m, statt]) => statt !== '' && !/\$\d/u.test(statt) && !AUSNAHMEN.has(m.source))
    .filter(([, statt]) => !text.includes(statt.replace(/\s+/gu, ' ').trim()))
    .map(([m, statt]) => `${m.source} → ${statt}`);
  assert.deepEqual(fehlt, []);
  // R49 (Architektur): Löschregeln (Ersatz '') – ihr Muster passt im Ergebnis nirgends mehr (vorher ungesichert: „Druckbar
  // als PDF.“ und „jede Karte führt mit ihren Knöpfen …“ kamen ohne roten Test zurück)
  // R50 (Architektur): für alle Regeln, deren Ersatz nicht selbst auf ihr Muster passt – eine unwirksame Regel fällt auch dann
  // auf, wenn eine andere Regel denselben Ersatztext liefert
  const nochDa = (ERSETZUNGEN as [RegExp, string][])
    .filter(([m, statt]) => !/\$[\d&]/u.test(statt) && !new RegExp(m.source, m.flags.replace('g', '')).test(statt))
    .filter(([m]) => new RegExp(m.source, m.flags.replace('g', '')).test(text))
    .map(([m]) => m.source);
  assert.deepEqual(nochDa, []);
  // eine gelöschte Regel nimmt ihre Prüfung mit – daher: Mindestzahl und die fachlich tragenden Ergebnisse fest (R48, Architektur)
  assert.ok(ERSETZUNGEN.length >= MINDESTENS, `nur ${ERSETZUNGEN.length} Ersetzungen (vorher ${MINDESTENS}) – eine Regel entfernt?`);
  // R54 (Architektur): die Mindestzahl ließ neun Regeln stillschweigend fallen – jetzt ist jedes Muster eingefroren
  // (tests/hilfe-ersetzungen.muster.json); wer eine Regel bewusst streicht, streicht dort ihr Muster mit Begründung im L-Eintrag
  const quellen = new Set(ERSETZUNGEN.map(([m]) => m.source));
  const eingefroren: string[] = JSON.parse(readFileSync(new URL('./hilfe-ersetzungen.muster.json', import.meta.url), 'utf8'));
  assert.deepEqual(eingefroren.filter((m) => !quellen.has(m)), [], 'Regel entfernt oder geändert');
  assert.equal(ERSETZUNGEN.length, eingefroren.length, 'neue Regel: ihr Muster in tests/hilfe-ersetzungen.muster.json aufnehmen');
  for (const soll of FEST) assert.ok(text.includes(soll), `fehlt: ${soll}`);
  assert.doesNotMatch(text, WEG);
  // R48 (Architektur): die Kopfzeile jeder Tabelle steht im thead (Druck wiederholt sie, sie bleibt nie allein am Seitenende)
  const roh = teile.join(' ');
  assert.equal((roh.match(/<tbody><tr><th[ >]/gu) ?? []).length, 0, 'Tabelle beginnt mit einer th-Zeile im tbody');
  assert.ok((roh.match(/<thead>/gu) ?? []).length >= 30, 'Tabellenköpfe als thead');
  // die Ausnahmen gibt es noch (sonst gehört der Eintrag weg)
  for (const a of AUSNAHMEN) assert.ok((ERSETZUNGEN as [RegExp, string][]).some(([m]) => m.source === a), a);
});
