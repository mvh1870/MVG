// Hilfe (P13, R48): jede Ersetzung der Übernahme wirkt – ihr Ergebnis steht in der erzeugten Hilfe. So kann keine
// Angleichung an MVG (Zuständigkeiten, Status, Schwellen, Begriffe) wegfallen, ohne dass ein Test rot wird.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ERSETZUNGEN, baueHilfe } from '../werkzeuge/hilfe.mjs';

/** Regeln, deren Ergebnis bewusst nicht im Text steht: eine frühere Regel oder ein anderer Schritt fasst dieselbe Stelle */
const AUSNAHMEN = new Set([
  'Einfuehrungs-\\/Reset-Rhythmus', // Teil von „Standardisierter Einfuehrungs-/Reset-Rhythmus“ (frühere Regel)
  'Leistungsphase \\(gates\\)', // Feldname in <code>, in Überschriften entfernt (R45)
  'Whitepaper-Inhalte', 'Das Whitepaper beschreibt', 'Whitepaper', // Stellen in entfernten Abschnitten bzw. von spezielleren Regeln gefasst
]);

/** Zahl der Regeln heute; wer eine Regel bewusst streicht, senkt diese Zahl mit Begründung */
const MINDESTENS = 204;

/** Fachlich tragende Ergebnisse (k9.3-p3, k4.2-p3, k6.4.2-t1, k6.4.4-p1, k6.4.3-p1, O-1) – unabhängig von der Regelliste */
const FEST = [
  'Frühwarnung → Risiko → Entscheidung (Entscheidungsvorlage) → Freigabe → Maßnahme → Managementbericht',
  'Berät CTC-Neurechnungen mit Abweichung > 5 % (Bestätigung durch den Bauherrn)',
  'Beschlüsse des Bauherrn mit klaren Bedingungen vorbereiten',
  'Gremium, in dem der Bauherr strategische Änderungen beschließt',
  'Managementbericht lesen, Top-Entscheidungen des Bauherrn beraten',
  'Managementbericht entgegennehmen und die Beschlussfassung des Bauherrn beraten',
  'Achten Sie darauf, dass der Bauherr die Freigabe im Approval-Workflow der Entscheidungsvorlage signiert',
  'durch den Bauherrn im Lenkungskreis beschlossen',
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
];

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
  // eine gelöschte Regel nimmt ihre Prüfung mit – daher: Mindestzahl und die fachlich tragenden Ergebnisse fest (R48, Architektur)
  assert.ok(ERSETZUNGEN.length >= MINDESTENS, `nur ${ERSETZUNGEN.length} Ersetzungen (vorher ${MINDESTENS}) – eine Regel entfernt?`);
  for (const soll of FEST) assert.ok(text.includes(soll), `fehlt: ${soll}`);
  // die Ausnahmen gibt es noch (sonst gehört der Eintrag weg)
  for (const a of AUSNAHMEN) assert.ok((ERSETZUNGEN as [RegExp, string][]).some(([m]) => m.source === a), a);
});
