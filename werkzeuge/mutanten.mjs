#!/usr/bin/env node
/**
 * Mutanten-Probe der Story-Engine (P2.1/P2.6, seit P16.14 src/geschichte) und der Rechenkerne der Werkzeuge
 * (P18.2, src/werkzeuge): verfälscht je eine Stelle, lässt die zugehörigen Tests laufen und erwartet ROT. Ein Mutant, der grün bleibt, ist ein Befund: die Tests
 * prüfen diese Regel nicht wirklich. Die Datei wird danach immer wiederhergestellt.
 *
 *   node werkzeuge/mutanten.mjs      → „n/n Mutanten rot“; Exitcode 1, wenn einer grün bleibt
 *
 * Läuft außerhalb der Kette (dauert je Mutant einige Sekunden).
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { istHauptmodul } from './haupt.mjs';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TESTS = ['tests/geschichte.test.ts', 'tests/geschichte-wege.test.ts'];
const TESTS_WERKZEUGE = [
  'tests/werkzeuge-vorlagen-check.test.ts', 'tests/werkzeuge-wegweiser.test.ts', 'tests/werkzeuge-risiko-grenzen.test.ts',
  'tests/werkzeuge-monatsbericht.test.ts',
];

/** [Datei, alt, neu, was, Tests?] – `alt` muss genau einmal vorkommen; ohne Tests gelten die Story-Tests. */
export const MUTANTEN = [
  ['src/geschichte/engine.ts', 'for (const b of BALKEN) s[b] = begrenze(s[b] + a.wirkung[b]);', 'for (const b of BALKEN) s[b] = s[b] + a.wirkung[b];', 'Balken nach jeder Antwort auf 0–10 begrenzt'],
  ['src/geschichte/engine.ts', '  if (stand.kurz && !k.kurzfassung) return gutePlatz(k);\n', '', 'Kurzfassung: übersprungene Kapitel zählen wie die gute Antwort'],
  ['src/geschichte/engine.ts', "  if (stufe(b.vertrauen) === 'niedrig') return 'nicht-getragen';\n", '', 'Bilanz: Vertrauen niedrig zuerst'],
  ['src/geschichte/engine.ts', "return wert <= 3 ? 'niedrig'", "return wert < 3 ? 'niedrig'", 'Stufe: 3 ist niedrig'],
  ['src/geschichte/engine.ts', " && stufe(b.geld) !== 'niedrig') return 'ruhig';", ") return 'ruhig';", 'Bilanz „ruhig“ verlangt Geld mindestens mittel'],
  ['src/geschichte/engine.ts', "  if (!falle && stufe(b.zeit)", "  if (stufe(b.zeit)", 'Bilanz „ruhig“ nur ohne Falle (L-239)'],
  ['src/geschichte/engine.ts', "  if (falleGewaehlt(g, stand)) return 'nach-falle';\n", '', 'Schlusszeilen nach einer Falle (L-239)'],
  ['src/geschichte/engine.ts', "  if (offeneKapitel(g, stand).length > 0) return 'offen';\n", '', 'Bilanz „offen“ bei offenen Entscheidungen (R73)'],
  ['src/geschichte/engine.ts', "return offeneKapitel(g, stand).length > 0 ? 'offen' : 'grund';", "return 'grund';", 'Schlusszeilen bei offenen Entscheidungen (R73)'],
  ['src/geschichte/engine.ts', "return stelle === i ? 'richtig' : 'falsch';", "return 'richtig';", 'Reihenfolge: falsche Stelle ist falsch'],
  ['src/geschichte/engine.ts', 'kipppunkte(v.optionen, v.kriterien, gew, STUFEN_GEWICHT)', 'kipppunkte(v.optionen, v.kriterien, gew)', 'Kipppunkte nur über die drei Stufen'],
  ['src/geschichte/engine.ts', '  if (r[\'v\'] !== STAND_VERSION) return null;\n', '', 'Älterer Stand wird verworfen'],
  ['src/geschichte/engine.ts', ' || !STUFEN_GEWICHT.includes(wert)) return stand;', ') return stand;', 'Gewichte nur 5, 3 oder 1'],
  // P18.2, Testplan in docs/WERKZEUGE-P18.md Abschnitt 7
  ['src/werkzeuge/risiko-grenzen.ts', '  if (wert <= g[3]) return 4;', '  if (wert < g[3]) return 4;', 'Risiko: Grenzwert gehört zur niedrigeren Stufe (Termin 70)', TESTS_WERKZEUGE],
  ['src/werkzeuge/risiko-grenzen.ts', '  if (wert <= g[2]) return 3;', '  if (wert < g[2]) return 3;', 'Risiko: Grenzwert gehört zur niedrigeren Stufe (Kosten 1,5 Mio.)', TESTS_WERKZEUGE],
  ['src/werkzeuge/risiko-grenzen.ts', "  if (a === 5) return 'vorrangig';\n", '', 'Risiko: Auswirkung 5 immer vorrangig', TESTS_WERKZEUGE],
  ['src/werkzeuge/risiko-grenzen.ts', 'const belegteA = auswirkungen.filter(belegt);', "const belegteA = auswirkungen.map((z) => (z === 'unbekannt' ? { von: 1, bis: 1, grenze: false } : z)).filter(belegt);", 'Risiko: unbekannt ist nicht 1', TESTS_WERKZEUGE],
  ['src/werkzeuge/risiko-grenzen.ts', 'const belegteA = auswirkungen.filter(belegt);', "const belegteA = auswirkungen.map((z) => (z === 'unbekannt' ? { von: 5, bis: 5, grenze: false } : z)).filter(belegt);", 'Risiko: unbekannt ist nicht 5', TESTS_WERKZEUGE],
  ['src/werkzeuge/risiko-grenzen.ts', 'const nachObenOffen = unbekannteA && (aMax === null || aMax < 5);', 'const nachObenOffen = unbekannteA;', 'Risiko: belegte Auswirkung 5 ist nicht „nach oben offen“', TESTS_WERKZEUGE],
  ['src/werkzeuge/risiko-grenzen.ts', 'const vorrangWegenA5 = a5Fest && (feld === null || feld.wert < AB_VORRANGIG);', 'const vorrangWegenA5 = aMax === 5 && (feld === null || feld.wert < AB_VORRANGIG);', 'Risiko: Vorrang aus einer Spanne nur über „bis“', TESTS_WERKZEUGE],
  ['src/werkzeuge/vorlagen-check.ts', "const schwer = p.muss && antwort === 'nein';", 'const schwer = false;', 'Vorlage: Muss-Punkt „nein“ macht rot', TESTS_WERKZEUGE],
  ['src/werkzeuge/vorlagen-check.ts', "  if (e.stelle === 'projektsteuerung') return", "  if (e.stelle === 'gibt-es-nicht') return", 'Vorlage: Projektsteuerung entscheidet nicht', TESTS_WERKZEUGE],
  ['src/werkzeuge/vorlagen-check.ts', '  if (betrag !== null && betrag > m.bis) return m.darueber;', '  if (betrag === null || reserve === null) return null;\n  if (betrag !== null && betrag > m.bis) return m.darueber;', 'Vorlage: unbestimmt nur, wenn die Stelle vom Unbekannten abhängt', TESTS_WERKZEUGE],
  ['src/werkzeuge/vorlagen-check.ts', 'betrag > m.bis) return m.darueber;', 'betrag >= m.bis) return m.darueber;', 'Vorlage: bis 100.000 € einschließlich entscheiden Sie', TESTS_WERKZEUGE],
  ['src/werkzeuge/vorlagen-check.ts', "return { antwort: hoechstens(antwort, 'teilweise'), satz", 'return { antwort, satz', 'Vorlage: unbestimmt → A3 höchstens teilweise', TESTS_WERKZEUGE],
  ['src/werkzeuge/wegweiser.ts', "    if (w === 'unklar' && k.unklar !== undefined) {\n      art = k.unklar;\n      ausUnklar = true;\n      break;\n    }\n", '', 'Wegweiser: „unklar“ → Frühwarnung', TESTS_WERKZEUGE],
  ['src/werkzeuge/wegweiser.ts', '    else keinVorgang = true;\n', '', 'Wegweiser: alles Nein → vermutlich kein Vorgang, Entscheidungsfrage folgt', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', "    if (!verknuepft) h.push({ id: 'ampelOhneFrage', schwere: 'gelb', bezug: id });\n", '', 'Bericht: Ampel ohne Entscheidungsfrage warnt (D-R1)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', "id: 'ampelOhneFrage', schwere: 'gelb'", "id: 'ampelOhneFrage', schwere: 'rot'", 'Bericht: D-R1 ist gelb, nicht rot', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', "    if (inhalt === 'keine') continue;\n", '', 'Bericht: „keine“ ist nicht leer (D-R4)', TESTS_WERKZEUGE],
  // R77: überlebende Mutanten der Prüfrunde
  ['src/werkzeuge/risiko-grenzen.ts', 'stufen.w <= 2 && aMin', 'stufen.w <= 3 && aMin', 'Risiko: „selten“ gilt nicht für Wahrscheinlichkeit Stufe 3', TESTS_WERKZEUGE],
  ['src/werkzeuge/risiko-grenzen.ts', 'stufen.w <= 2 && aMin', 'stufen.w <= 1 && aMin', 'Risiko: „selten“ gilt auch für Wahrscheinlichkeit Stufe 2', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'export const ZEILEN_JE_SEITE = 50;', 'export const ZEILEN_JE_SEITE = 60;', 'Bericht: höchstens 50 Zeilen je Seite (nicht mehr)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'export const ZEILEN_JE_SEITE = 50;', 'export const ZEILEN_JE_SEITE = 49;', 'Bericht: höchstens 50 Zeilen je Seite (nicht weniger)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'export const ZEICHEN_JE_ZEILE = 78;', 'export const ZEICHEN_JE_ZEILE = 92;', 'Bericht: vorsichtige Zeilenbreite für die Seitenschätzung', TESTS_WERKZEUGE],
  // R78: überlebende Mutanten der Prüfrunde (Monatsbericht, Daten der Vorlagen-Zuständigkeit)
  ['src/werkzeuge/monatsbericht.ts', ' || leer(b.lage) ||', ' ||', 'Bericht: ohne Lage ist der Bericht unvollständig (R77)', TESTS_WERKZEUGE],
  ['src/ui/flaechen/explore/gemeinsam.ts', "bogenKopf(b.titel, '', b.fiktiv)", "bogenKopf(b.titel, '', false)", 'Werkzeug-Druck: „Fiktiver Fall“ mit Beispiel (R79)', ['tests/explore-werkzeuge.test.ts']],
  ['src/ui/flaechen/explore/monatsbericht.ts', 'fiktiv: z.beispiel !== null', 'fiktiv: true', 'Werkzeug-Druck: ohne Beispiel kein „Fiktiver Fall“ (R79)', ['tests/explore-werkzeuge.test.ts']],
  ['src/werkzeuge/monatsbericht.ts', "const BREIT = 'MWmw@%';", "const BREIT = 'MW';", 'Bericht: auch @ und % zählen breit (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'spalten += zeilenFuer(textBreite(`${e.text} ${e.kennung}`), spalte);', 'spalten += zeilenFuer(`${e.text} ${e.kennung}`.length, spalte);', 'Bericht: Einträge nach Zeichenbreite (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'z += voll(`${e.frage} · ${e.stelle} · bis ${e.bis} · ${e.kennung}`);', 'z += zeilenFuer(`${e.frage} · ${e.stelle} · bis ${e.bis} · ${e.kennung}`.length, zeichenJeZeile);', 'Bericht: offene Entscheidungen nach Zeichenbreite (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/risiko-grenzen.ts', 'return { von: stufeAus(v.von, g), bis: stufeAus(v.bis, g), grenze: false };', 'return { von: stufeAus(v.von, g), bis: stufeAus(v.bis, g), grenze: aufGrenze(v.von, g) !== null };', 'Risiko: Spanne zeigt keinen Grenzwert-Treffer (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/risiko-grenzen.ts', 'if (!nachObenOffen && (obenFeld.w', 'if ((obenFeld.w', 'Risiko: nach oben offen → keine obere Ecke (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', ' || leer(b.reaktion) ||', ' ||', 'Bericht: ohne benötigte Reaktion ist der Bericht unvollständig (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', "if (leer(e.frage) || leer(e.stelle)", "if (leer(e.stelle)", 'Bericht: offene Entscheidung ohne Frage → rot (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'if (inhalt.length > max)', 'if (inhalt.length >= max)', 'Bericht: genau die Höchstzahl an Einträgen ist erlaubt', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'Math.floor(zeichenJeZeile / 2) - 2;', 'Math.floor(zeichenJeZeile / 2) + 20;', 'Bericht: Abschnittsspalte der Seitenschätzung halb so breit wie die Zeile', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'const BREIT_FAKTOR = 1.35;', 'const BREIT_FAKTOR = 1;', 'Bericht: breite Buchstaben (M, W) zählen in der Seitenschätzung mehr', TESTS_WERKZEUGE],
  ['src/werkzeuge/wegweiser.ts', 'const nurEntscheidung = keinVorgang && entscheidung === true;', 'const nurEntscheidung = false;', 'Wegweiser: alles Nein und Entscheidung nötig → „Entscheidung vorbereiten“, nicht „kein Vorgang“ (R78)', TESTS_WERKZEUGE],
  ['src/werkzeuge/wegweiser.ts', "if (w.art !== null) z.push('verknuepfen');", "if (w.art !== null || w.keinVorgang) z.push('verknuepfen');", 'Wegweiser: verknüpft wird nur, was als Vorgang entsteht (R78)', TESTS_WERKZEUGE],
  ['src/werkzeuge/wegweiser.ts', "    if (dringlich === true) art = 'fruehwarnung';\n    else keinVorgang = true;\n", '    keinVorgang = true;\n', 'Wegweiser: dringlich und alles Nein → Frühwarnung, nie „kein Vorgang“ (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/gemeinsam.ts', 'export const STAND_MAX = 80;', 'export const STAND_MAX = 320;', 'Werkzeugstand: höchstens 80 Zeichen auf dem Kanal', TESTS_WERKZEUGE],
  ['src/werkzeuge/vorlagen-check.ts', 'export const MINDEST_WEGE = 2;', 'export const MINDEST_WEGE = 1;', 'Vorlage: mindestens zwei zulässige Wege als Vorgabe', TESTS_WERKZEUGE],
];

function testsRot(tests = TESTS) {
  const erg = spawnSync(process.execPath, ['--test', '--test-reporter=dot', ...tests], { cwd: WURZEL, encoding: 'utf8' });
  return erg.status !== 0;
}

export function probe() {
  /** @type {{ was: string, datei: string, rot: boolean, fehler?: string }[]} */
  const ergebnisse = [];
  for (const [datei, alt, neu, was, tests] of MUTANTEN) {
    const voll = path.join(WURZEL, datei);
    const original = readFileSync(voll, 'utf8');
    if (original.split(alt).length !== 2) {
      ergebnisse.push({ was, datei, rot: false, fehler: 'Stelle nicht (genau einmal) gefunden' });
      continue;
    }
    try {
      writeFileSync(voll, original.replace(alt, neu), 'utf8');
      ergebnisse.push({ was, datei, rot: testsRot(tests) });
    } finally {
      writeFileSync(voll, original, 'utf8');
    }
  }
  return ergebnisse;
}

if (istHauptmodul(import.meta.url)) {
  const vorher = spawnSync(process.execPath, ['--test', '--test-reporter=dot', ...TESTS, ...TESTS_WERKZEUGE], { cwd: WURZEL, encoding: 'utf8' });
  if (vorher.status !== 0) {
    console.log('mutanten: Die Engine- oder Werkzeug-Tests sind schon ohne Mutation rot – erst reparieren.');
    process.exitCode = 1;
  } else {
    const erg = probe();
    for (const e of erg) console.log(`  ${e.rot ? '✓ rot ' : '✗ GRÜN'}  ${e.was} (${e.datei})${e.fehler ? ` – ${e.fehler}` : ''}`);
    const rot = erg.filter((e) => e.rot).length;
    console.log(`mutanten: ${rot}/${erg.length} Mutanten rot`);
    process.exitCode = rot === erg.length ? 0 : 1;
  }
}
