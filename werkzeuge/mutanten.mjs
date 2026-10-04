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
/** P19.1: der Zustandsautomat der Wegtests (tests/hilfen) und sein Differentialtest gegen die Wegaufzählung */
const HILFE_AUTOMAT = 'tests/hilfen/geschichte-zustaende.ts';
const TESTS_AUTOMAT = ['tests/geschichte-zustaende.test.ts', 'tests/geschichte-wege.test.ts'];
/** P19.3: Akte, Akt-Leiste, Pause, Brücken, Speicher (synthetische Story mit 14 Stationen); Übersetzer, Campus, Lesezeit */
const TESTS_AKTE = ['tests/geschichte-akte.test.ts'];
const TESTS_UEBERSETZER = ['tests/geschichte-uebersetzer.test.ts'];
const TESTS_CAMPUS = ['tests/campus-iso.test.ts'];
const TESTS_LESEZEIT = ['tests/lesezeit.test.ts'];
/** P19.4/P19.5: Echos, Entscheidungsbuch, Verlauf, Vertiefung, neue Mini-Arten, Kürzungen der Kurzfassung (Übersetzer und Seite) */
const TESTS_P19 = [
  'tests/geschichte-echo.test.ts', 'tests/geschichte-buch.test.ts', 'tests/geschichte-mini-neu.test.ts', 'tests/geschichte-uebersetzer-p19.test.ts',
  'tests/geschichte-mini-registry.test.ts',
];
const TESTS_WERKZEUGE = [
  'tests/werkzeuge-vorlagen-check.test.ts', 'tests/werkzeuge-wegweiser.test.ts', 'tests/werkzeuge-risiko-grenzen.test.ts',
  'tests/werkzeuge-monatsbericht.test.ts', 'tests/werkzeuge-wachter.test.ts',
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
  ['src/geschichte/mini-arten.ts', "return stelle === i ? 'richtig' : 'falsch';", "return 'richtig';", 'Reihenfolge: falsche Stelle ist falsch'],
  ['src/geschichte/engine.ts', 'kipppunkte(v.optionen, v.kriterien, gew, STUFEN_GEWICHT)', 'kipppunkte(v.optionen, v.kriterien, gew)', 'Kipppunkte nur über die drei Stufen'],
  ['src/geschichte/engine.ts', '  if (r[\'v\'] !== STAND_VERSION) return null;\n', '', 'Älterer Stand wird verworfen'],
  ['src/geschichte/engine.ts', ' || !STUFEN_GEWICHT.includes(wert)) return stand;', ') return stand;', 'Gewichte nur 5, 3 oder 1'],
  // R79: Bilanz der Kurzfassung, Vergleichssätze, Ende-Campus
  ['src/geschichte/engine.ts', "stufe(b.zeit) === 'hoch' && stufe(b.vertrauen) === 'hoch'", "stufe(b.zeit) === 'mittel' && stufe(b.vertrauen) === 'hoch'", 'Bilanz: vier gute Antworten der Kurzfassung enden „ruhig“, nie „mit Umwegen“ (R79)'],
  ['src/geschichte/engine.ts', "satz: vorn.length === 1 ? (vorn[0] ?? 'gleichauf') : 'gleichauf'", "satz: vorn.length >= 1 ? (vorn[0] ?? 'gleichauf') : 'gleichauf'", 'Vergleich: bei Gleichstand gilt der Satz „gleichauf“ (R79)'],
  ['src/generiert/inhalte.json', 'Das Ersatzgerät liegt vorn – mit diesen Gewichten zählt, dass alle Kinder pünktlich einziehen.', 'x', 'Vergleich: Wortlaut des Satzes A ist festgehalten (R79)'],
  ['src/ui/flaechen/geschichte.ts', "'gs-campus-gross gs-campus-ende', null, typ !== 'offen' && stufe(b.zeit) === 'niedrig')", "'gs-campus-gross gs-campus-ende', null, false)", 'Ende-Campus: bei Zeit „niedrig“ ist die Sporthalle unfertig (R79)', ['tests/geschichte-flaeche.test.ts']],
  ['src/generiert/inhalte.json', '"geld": -1,\n              "vertrauen": -2,\n              "zeit": 0', '"geld": -1,\n              "vertrauen": 0,\n              "zeit": 0', 'Antwort: Wirkung der Falle in Kapitel 5 (Vertrauen −2) ist festgehalten (R79)'],
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
  ['src/werkzeuge/monatsbericht.ts', 'export const ZEICHEN_JE_ZEILE = 86;', 'export const ZEICHEN_JE_ZEILE = 100;', 'Bericht: vorsichtige Zeilenbreite für die Seitenschätzung', TESTS_WERKZEUGE],
  // R78: überlebende Mutanten der Prüfrunde (Monatsbericht, Daten der Vorlagen-Zuständigkeit)
  ['src/werkzeuge/monatsbericht.ts', ' || leer(b.lage) ||', ' ||', 'Bericht: ohne Lage ist der Bericht unvollständig (R77)', TESTS_WERKZEUGE],
  ['src/ui/flaechen/explore/vorlagen-check.ts', "(imSchritt.has(l.bezug ?? '') ? 0 : 2) + (l.schwere === 'rot' ? 0 : 1)", "(imSchritt.has(l.bezug ?? '') ? 0 : 1) + (l.schwere === 'rot' ? 0 : 2)", 'Vorlagen-Check: Lücken des Schritts vor der Schwere (R79)', ['tests/explore-werkzeuge.test.ts']],
  ['src/ui/flaechen/explore/vorlagen-check.ts', 'gereiht.length > ZUERST + 1 ?', 'gereiht.length > ZUERST ?', 'Vorlagen-Check: eine einzelne weitere Lücke wird nicht eingeklappt (R79)', ['tests/explore-werkzeuge.test.ts']],
  ['src/ui/flaechen/explore/vorlagen-check.ts', "open: weitereOffen }", "open: false }", 'Vorlagen-Check: „Weitere Lücken“ bleibt offen (R79)', ['tests/explore-werkzeuge.test.ts']],
  ['src/ui/flaechen/explore/vorlagen-check.ts', "const nurErgebnis = !o.bedienbar && schrittAusStand === 'ergebnis';", 'const nurErgebnis = false;', 'Vorlagen-Check: Leinwand im Schritt Ergebnis ohne Prüfschritt (R79)', ['tests/explore-werkzeuge.test.ts']],
  ['src/ui/flaechen/explore/gemeinsam.ts', "bogenKopf(b.titel, '', b.fiktiv)", "bogenKopf(b.titel, '', false)", 'Werkzeug-Druck: „Fiktiver Fall“ mit Beispiel (R79)', ['tests/explore-werkzeuge.test.ts']],
  ['src/ui/flaechen/explore/monatsbericht.ts', 'fiktiv: z.beispiel !== null', 'fiktiv: true', 'Werkzeug-Druck: ohne Beispiel kein „Fiktiver Fall“ (R79)', ['tests/explore-werkzeuge.test.ts']],
  ['src/werkzeuge/monatsbericht.ts', "const BREIT = 'MWmw@%';", "const BREIT = 'MW';", 'Bericht: auch @ und % zählen breit (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'spalten += zeilenFuer(`${e.text} ${e.kennung}`, spalte);', 'spalten += Math.ceil(`${e.text} ${e.kennung}`.length / spalte);', 'Bericht: Einträge nach Zeichenbreite (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'z += voll(`${e.frage} · ${e.stelle} · bis ${e.bis} · ${e.kennung}`);', 'z += zeilenFuer(`${e.frage} · ${e.stelle} · bis ${e.bis} · ${e.kennung}`.length, zeichenJeZeile);', 'Bericht: offene Entscheidungen nach Zeichenbreite (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/risiko-grenzen.ts', 'return { von: stufeAus(v.von, g), bis: stufeAus(v.bis, g), grenze: false };', 'return { von: stufeAus(v.von, g), bis: stufeAus(v.bis, g), grenze: aufGrenze(v.von, g) !== null };', 'Risiko: Spanne zeigt keinen Grenzwert-Treffer (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/risiko-grenzen.ts', 'if (!nachObenOffen && (obenFeld.w', 'if ((obenFeld.w', 'Risiko: nach oben offen → keine obere Ecke (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', ' || leer(b.reaktion) ||', ' ||', 'Bericht: ohne benötigte Reaktion ist der Bericht unvollständig (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', "if (leer(e.frage) || leer(e.stelle)", "if (leer(e.stelle)", 'Bericht: offene Entscheidung ohne Frage → rot (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'if (inhalt.length > max)', 'if (inhalt.length >= max)', 'Bericht: genau die Höchstzahl an Einträgen ist erlaubt', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'Math.floor(zeichenJeZeile / 2) - 2;', 'Math.floor(zeichenJeZeile / 2) + 20;', 'Bericht: Abschnittsspalte der Seitenschätzung halb so breit wie die Zeile', TESTS_WERKZEUGE],
  ['src/regie/buehne.ts', '  if (!Object.hasOwn(LESER, werkzeug)) return null;', '  if (false) return null;', 'Regie: Werkzeugname „constructor“ umgeht die Kennungsprüfung nicht (R79)', TESTS_WERKZEUGE],
  ['src/geschichte/mcda.ts', ' || a.option.id.localeCompare(b.option.id)', '', 'Vergleich: Gleichstand nach Kennung (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', "zeilenFuer(`Datenstand: ${b.datenstand}`, zeichenJeZeile) + zeilenFuer(FUSS, zeichenJeZeile)", 'zeilenFuer(FUSS, zeichenJeZeile)', 'Bericht: Datenstand-Zeile zählt in der Seitenschätzung (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', '(b.projekt != null ? voll(b.projekt) : 0)', '0', 'Bericht: Projektzeile zählt in der Seitenschätzung (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', "const BREIT = 'MWmw@%';", "const BREIT = 'MW@%';", 'Bericht: m und w zählen in der Seitenschätzung als breit (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'if (w > breite) {\n      if (rest > 0) zeilen += 1;', 'if (w > breite) {', 'Bericht: ein langes Wort beginnt eine neue Zeile (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/monatsbericht.ts', 'const BREIT_FAKTOR = 1.35;', 'const BREIT_FAKTOR = 1;', 'Bericht: breite Buchstaben (M, W) zählen in der Seitenschätzung mehr', TESTS_WERKZEUGE],
  ['src/werkzeuge/wegweiser.ts', 'const nurEntscheidung = keinVorgang && entscheidung === true;', 'const nurEntscheidung = false;', 'Wegweiser: alles Nein und Entscheidung nötig → „Entscheidung vorbereiten“, nicht „kein Vorgang“ (R78)', TESTS_WERKZEUGE],
  ['src/werkzeuge/wegweiser.ts', "if (w.art !== null) z.push('verknuepfen');", "if (w.art !== null || w.keinVorgang) z.push('verknuepfen');", 'Wegweiser: verknüpft wird nur, was als Vorgang entsteht (R78)', TESTS_WERKZEUGE],
  ['src/werkzeuge/wegweiser.ts', "    if (dringlich === true) art = 'fruehwarnung';\n    else keinVorgang = true;\n", '    keinVorgang = true;\n', 'Wegweiser: dringlich und alles Nein → Frühwarnung, nie „kein Vorgang“ (R79)', TESTS_WERKZEUGE],
  ['src/werkzeuge/gemeinsam.ts', 'export const STAND_MAX = 80;', 'export const STAND_MAX = 320;', 'Werkzeugstand: höchstens 80 Zeichen auf dem Kanal', TESTS_WERKZEUGE],
  ['src/werkzeuge/vorlagen-check.ts', 'export const MINDEST_WEGE = 2;', 'export const MINDEST_WEGE = 1;', 'Vorlage: mindestens zwei zulässige Wege als Vorgabe', TESTS_WERKZEUGE],
  // P19.1 (O-62, L-270): Zustandsautomat der Wegtests – jede Verfälschung muss am Differentialtest oder an den Proben scheitern
  [HILFE_AUTOMAT, 'for (const w of WERTUNGEN_REIHE) aus.push(', 'for (const w of WERTUNGEN_REIHE.slice(0, 2)) aus.push(', 'Automat: Übergang „Falle“ vergessen', TESTS_AUTOMAT],
  [HILFE_AUTOMAT, "if (mitOffen) aus.push(['o', null]);", "if (false) aus.push(['o', null]);", 'Automat: Übergang „offen“ vergessen', TESTS_AUTOMAT],
  [HILFE_AUTOMAT, 'export const MAX_ZUSTAENDE = 3_000_000;', 'export const MAX_ZUSTAENDE = 50;', 'Automat: Zustandsmenge zu klein', TESTS_AUTOMAT],
  [HILFE_AUTOMAT, "{ name: 'falle', init: 0, schritt: (x, _k, a) => (x === 1 || a?.wertung === 'falle' ? 1 : 0) }", "{ name: 'falle', init: 0, schritt: (x) => x }", 'Automat: Falle-Merkmal ignoriert', TESTS_AUTOMAT],
  [HILFE_AUTOMAT, 'b[x] = begrenze(b[x] + a.wirkung[x])', 'b[x] = b[x] + a.wirkung[x]', 'Automat: Balken nicht auf 0–10 begrenzt', TESTS_AUTOMAT],
  [HILFE_AUTOMAT, "  if (!gespielt) return [['-', gute(k)]];\n", '', 'Automat: von der Kurzfassung übersprungenes Kapitel zählt nicht wie die gute Antwort', TESTS_AUTOMAT],
  [HILFE_AUTOMAT, 'const s = schluessel(b, m);', 'const s = schluessel(b, []);', 'Automat: Zustände nur nach Balken zusammengelegt (Merkmale vergessen)', TESTS_AUTOMAT],
  [HILFE_AUTOMAT, "Math.min(2, x + (a !== null && a.wertung !== 'gut' ? 1 : 0))", "Math.min(1, x + (a !== null && a.wertung !== 'gut' ? 1 : 0))", 'Automat: Zähler „nicht gute Antworten“ zu früh gedeckelt', TESTS_AUTOMAT],
  // P19.3 (O-62): Akte, Pause, gebündelte Brücken, Ende der Kurzfassung, Restzeit, Speicher, Übersetzer, Campus, Lesezeit je Akt
  ['src/geschichte/engine.ts', "a.stationen.at(-1) === k.id && hatPause(g, a)) aus.push", "a.stationen.at(-1) === k.id && false) aus.push", 'Akte: keine Pause am Aktende', TESTS_AKTE],
  ['src/geschichte/engine.ts', "const a = kurz ? null : aktVon(g, k.id);", "const a = aktVon(g, k.id);", 'Akte: die Kurzfassung hat keine Pause', TESTS_AKTE],
  ['src/geschichte/engine.ts', "return akteVon(g).at(-1) !== a;", "return true;", 'Akte: nach dem letzten Akt keine Pause (das Ende zeigt „Das können Sie jetzt“)', TESTS_AKTE],
  ['src/geschichte/engine.ts', "export const BRUECKE_MAX = 3;", "export const BRUECKE_MAX = 4;", 'Brücken: höchstens drei Stationen je Karte', TESTS_AKTE],
  ['src/geschichte/engine.ts', "  if (akteVon(g).length === 0) return liste.map((k) => [k]);\n", "", 'Brücken: ohne Akte je Station eine Karte wie bisher', TESTS_AKTE],
  ['src/geschichte/engine.ts', "if (genannt.length > 0 && !genannt.some((id) => kapitel(g, id) !== null)) return null;", "", 'Speicher: ein Stand mit fremden Kennungen (k1 … k8 → s1 … s14) ist ungültig', TESTS_AKTE],
  ['src/geschichte/engine.ts', "if (sch && sch['ort'] === 'pause' && typeof sch['akt'] === 'string') return geheZu(g, stand, { ort: 'pause', akt: sch['akt'] });\n", "", 'Speicher: die Pause wird wiedergefunden', TESTS_AKTE],
  ['src/geschichte/engine.ts', "const erste = g.kapitel.find((k) => !k.kurzfassung);", "const erste = g.kapitel.find((k) => k.kurzfassung);", 'Kurzfassung: „Weiter mit der ganzen Geschichte“ an der ersten nicht gespielten Station', TESTS_AKTE],
  ['src/geschichte/engine.ts', "const hier = nrAmSchritt(g, stand.schritt);", "const hier = 0;", 'Kurzfassung: Wechsel aus der Pause weiter mit der nächsten gespielten Station', TESTS_AKTE],
  ['src/geschichte/engine.ts', "slice(schrittIndex(g, stand))) {", "slice(schrittIndex(g, stand) + 1)) {", 'Restzeit: der aktuelle Schritt zählt voll', TESTS_AKTE],
  ['src/geschichte/engine.ts', "return Math.max(1, Math.round(woerter / jeMinute));", "return Math.max(1, Math.floor(woerter / jeMinute));", 'Restzeit: Minuten gerundet', TESTS_AKTE],
  ['src/geschichte/engine.ts', "if (k.nr > bisNr) continue;\n    const erzaehlt", "if (k.nr >= bisNr) continue;\n    const erzaehlt", 'Verlauf: bis einschließlich der gefragten Station', TESTS_AKTE],
  ['src/ui/flaechen/geschichte.ts', "if (a === aktHier) return stationen.map(", "if (false) return stationen.map(", 'Akt-Leiste: der Akt der gezeigten Station ist aufgeklappt', TESTS_AKTE],
  ['src/ui/flaechen/geschichte.ts', "|| a.stationen[0] !== k.id) return null;", "|| false) return null;", 'Kopfkarte nur über der ersten Station eines Akts', TESTS_AKTE],
  ['src/ui/flaechen/geschichte.ts', "stand.kurz && g.kapitel.some((k) => !k.kurzfassung) ? h('button'", "false ? h('button'", 'Ende der Kurzfassung: Knopf „Weiter mit der ganzen Geschichte“', TESTS_AKTE],
  ['src/grafik/verlauf.ts', "{ klasse: 'vb-band-mittel', von: 3.5, bis: 6.5 },", "{ klasse: 'vb-band-mittel', von: 3.5, bis: 6 },", 'Verlaufsband: die Bänder reichen lückenlos von niedrig bis hoch', TESTS_AKTE],
  ['src/stil/geschichte.css', ".druck-story .druck-akt + .druck-akt { break-before: page; }", ".druck-story .druck-akt + .druck-akt { break-before: auto; }", 'Druck: Seitenumbruch zwischen den Akten', TESTS_AKTE],
  ['src/stil/geschichte.css', ".gs-fortschritt-akte .gs-felder li { min-width: 24px; }", ".gs-fortschritt-akte .gs-felder li { min-width: 12px; }", 'Akt-Leiste: Zielgröße mindestens 24 px', TESTS_AKTE],
  ['werkzeuge/geschichte.mjs', "else if (gesehen.includes(k)) c.fehler(ort,", "else if (false) c.fehler(ort,", 'Übersetzer: jede Station höchstens in einem Akt', TESTS_UEBERSETZER],
  ['werkzeuge/geschichte.mjs', "for (const id of ids) if (!gesehen.includes(id)) c.fehler(", "for (const id of []) if (!gesehen.includes(id)) c.fehler(", 'Übersetzer: jede Station in einem Akt', TESTS_UEBERSETZER],
  ['werkzeuge/geschichte.mjs', "bekannt.join() !== ids.join()", "false", 'Übersetzer: die Akte folgen der Reihenfolge der Stationen', TESTS_UEBERSETZER],
  ['werkzeuge/geschichte.mjs', "if (koennen.length !== 3)", "if (koennen.length < 3)", 'Übersetzer: „Das können Sie jetzt“ in genau drei Sätzen', TESTS_UEBERSETZER],
  ['werkzeuge/geschichte.mjs', "if (nr !== i + 1) c.fehler(", "if (false) c.fehler(", 'Übersetzer: Nummer = Stelle in der Reihenfolge', TESTS_UEBERSETZER],
  ['werkzeuge/geschichte.mjs', "if (new Set(reihenfolge).size !== reihenfolge.length)", "if (false)", 'Übersetzer: Kennung in der Reihenfolge nur einmal', TESTS_UEBERSETZER],
  ['werkzeuge/geschichte.mjs', "const ZWISCHENSTUFEN = [1.5, 2.5, 3.5, 4.5, 5.5];", "const ZWISCHENSTUFEN = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5];", 'Übersetzer: nur die fünf Zwischenstufen', TESTS_UEBERSETZER],
  ['src/grafik/campus-iso.ts', "export const CAMPUS_ZWISCHENSTUFEN: readonly number[] = [1.5, 2.5, 3.5, 4.5, 5.5];", "export const CAMPUS_ZWISCHENSTUFEN: readonly number[] = [1.5, 2.5, 3.5, 4.5];", 'Campus: fünf Zwischenstufen', TESTS_CAMPUS],
  ['src/grafik/campus-iso.ts', "if (buehne.licht !== 'abend') lieferwagen(buehne, 216, 258);", "lieferwagen(buehne, 216, 258);", 'Campus 2,5: Lieferwagen nur tagsüber', TESTS_CAMPUS],
  ['src/grafik/campus-iso.ts', "if (jahreszeit === 'winter' && w === 'regen') return dazu;", "", 'Campus: Regen im Winter ohne Flocken', TESTS_CAMPUS],
  ['werkzeuge/lesezeit.mjs', "export const AKT_MAX_MINUTEN = 17;", "export const AKT_MAX_MINUTEN = 15;", 'Lesezeit: obere Schranke je Akt 17 Minuten', TESTS_LESEZEIT],
  ['werkzeuge/lesezeit.mjs', "(i === 0 && kennung === 'auftakt')", "(false)", 'Lesezeit: Auftakt zählt zur Schranke des ersten Akts', TESTS_LESEZEIT],
  // P19.4 (O-62): Echo-Zeilen, Entscheidungsbuch, Verlauf; P19.5: Platz der Mini-Aufgabe, neue Arten, Kürzungen der Kurzfassung, Vertiefung
  ['src/geschichte/engine.ts', "?.wertung ?? 'gut';\n}\n\n/** Inline-HTML der Fassung", "?.wertung ?? 'falle';\n}\n\n/** Inline-HTML der Fassung", 'Echo: ohne Antwort der Quelle gilt „gut“', TESTS_P19],
  ['src/geschichte/engine.ts', "const rest = stand.kurz ? z.fortsetzungKurzHtml ?? z.fortsetzungHtml : z.fortsetzungHtml;", "const rest = z.fortsetzungHtml;", 'Echo: die Kurzfassung nimmt ihre eigene Fortsetzung', TESTS_P19],
  ['src/geschichte/engine.ts', "(_ganz, id: string) => echoHtml(g, stand, id) ?? '')", "(_ganz, id: string) => echoHtml(g, stand, id) ?? 'x')", 'Echo-Platzhalter: ein unbekanntes Echo fällt weg', TESTS_P19],
  ['src/geschichte/engine.ts', "if (eintrag === undefined || k.nr > bisNr) continue;", "if (eintrag === undefined) continue;", 'Buch: nur Einträge bis zur gezeigten Station', TESTS_P19],
  ['src/geschichte/engine.ts', "} else if (stand.wahlen[k.id] !== undefined) aus.push({ eintrag, k, voll: true });", "} else aus.push({ eintrag, k, voll: true });", 'Buch: ein Eintrag erst nach der Antwort in seiner Station', TESTS_P19],
  ['src/geschichte/engine.ts', "return iZiel >= 0 && iHier >= iZiel;", "return iZiel >= 0;", 'Buch, Kurzfassung: die Zeile einer übersprungenen Station erst nach ihrer Brückenkarte', TESTS_P19],
  ['src/geschichte/engine.ts', "return stelle > erste.nr || (stelle === erste.nr && stand.wahlen[erste.id] !== undefined);", "return stelle >= erste.nr;", 'Buch: Zugang erst, wenn Station 1 abgeschlossen ist', TESTS_P19],
  ['src/geschichte/engine.ts', "else if (stand.wahlen[k.id] === undefined) p.offen = true;", "else if (false) p.offen = true;", 'Verlauf: Station ohne Antwort ist „offen“', TESTS_P19],
  ['src/geschichte/engine.ts', "const erzaehlt = stand.kurz && !k.kurzfassung;\n    const p: VerlaufPunkt", "const erzaehlt = false;\n    const p: VerlaufPunkt", 'Verlauf: übersprungene Stationen der Kurzfassung sind „nur erzählt“', TESTS_P19],
  ['src/geschichte/engine.ts', "if (mini === 'vor-frage') aus.push('mini');", "if (false) aus.push('mini');", 'Schritte: Mini-Aufgabe vor der Frage', TESTS_P19],
  ['src/geschichte/engine.ts', "if (mini === 'vor-vergleich') aus.push('mini');", "if (false) aus.push('mini');", 'Schritte: Mini-Aufgabe vor dem Vergleich', TESTS_P19],
  ['src/geschichte/engine.ts', "return teileVon(k, kurz).at(-1) === teil;", "return teil === 'mini';", 'Ende der Station: dort stehen „Dahinter“ und Vertiefung', TESTS_P19],
  ['src/geschichte/engine.ts', "(stand.kurz ? a.folgeKurzHtml ?? a.folgeHtml : a.folgeHtml);", "a.folgeHtml;", 'Kurzfassung: gekürzte Folge', TESTS_P19],
  ['src/geschichte/engine.ts', "(stand.kurz ? k.gutKurzHtml ?? k.gutHtml : k.gutHtml);", "k.gutHtml;", 'Kurzfassung: gekürztes „So macht man es gut“', TESTS_P19],
  ['src/geschichte/engine.ts', "fertig: def?.fertig !== undefined ? def.fertig(m, antworten ?? []) : je.every", "fertig: je.every", 'Mini: eine Art legt „fertig“ selbst fest (Rückfragen)', TESTS_P19],
  ['src/geschichte/mini-arten.ts', "    if (basis[n] === 1) return null;\n", "", 'Bericht: nach der Prüfung gesperrt', TESTS_P19],
  ['src/geschichte/mini-arten.ts', "if (a.length !== n + 1 || a[n] !== 1) return 'offen';", "if (a.length !== n + 1) return 'offen';", 'Bericht: Rückmeldung erst nach der Prüfung', TESTS_P19],
  ['src/geschichte/mini-arten.ts', "return liste.length === 0 || (liste.length === n + 1 &&", "return (liste.length === n + 1 &&", 'Bericht: ein leerer Zustand ist gültig', TESTS_P19],
  ['src/geschichte/mini-arten.ts', " || alt.length >= (m.kontingent ?? 0)) return null;", ") return null;", 'Rückfragen: höchstens das Kontingent', TESTS_P19],
  ['src/geschichte/mini-arten.ts', "alt.includes(posten) ||", "", 'Rückfragen: dasselbe Gespräch nicht noch einmal', TESTS_P19],
  ['src/geschichte/mini-arten.ts', "return ok && (liste.length <= (m.kontingent ?? 0) || liste.length === m.posten.length);", "return ok;", 'Rückfragen: gespeicherter Stand höchstens Kontingent oder alle', TESTS_P19],
  ['src/geschichte/mini-arten.ts', "return a.length >= (m.kontingent ?? m.posten.length);", "return a.length >= 1;", 'Rückfragen: fertig mit dem genutzten Kontingent', TESTS_P19],
  ['src/geschichte/mini-arten.ts', "n >= 1 && n <= 5);\n      if (!ok) fehler(ort, 'Feld:", "n >= 0 && n <= 5);\n      if (!ok) fehler(ort, 'Feld:", 'Matrix: Feld ab 1', TESTS_P19],
  ['src/geschichte/mini-arten.ts', "n >= 1 && n <= 5);\n      if (!ok) fehler(ort, 'Feld:", "n >= 1 && n <= 6);\n      if (!ok) fehler(ort, 'Feld:", 'Matrix: Feld bis 5', TESTS_P19],
  ['src/geschichte/mini-arten.ts', "if ((p.nach ?? []).length === 0 && p.loesung !== 'nachfordern') fehler(", "if (false) fehler(", 'Pinnwand: ein loses Ende wird nachgefordert', TESTS_P19],
  ['src/geschichte/mini-arten.ts', "if ((p.nach ?? []).includes(p.von ?? '')) fehler(", "if (false) fehler(", 'Pinnwand: kein Faden zum selben Zettel', TESTS_P19],
  ['werkzeuge/geschichte.mjs', "if (q >= v.nr) c.fehler(", "if (false) c.fehler(", 'Übersetzer: ein Echo klingt erst nach der Antwort der Quelle', TESTS_P19],
  ['werkzeuge/geschichte.mjs', "if (v.zeile !== undefined && v.zeile.kurzfassung &&", "if (false && v.zeile.kurzfassung &&", 'Übersetzer: Echo-Zeile in der Kurzfassung nur mit gespielter Quelle', TESTS_P19],
  ['werkzeuge/geschichte.mjs', "/mitgeteilt|vollständig|", "/vollständig|", 'Übersetzer: im Buch steht „mitgeteilt“ nicht', TESTS_P19],
  ['werkzeuge/geschichte.mjs', "if (o.art === 'vermerk' && !niemand) c.fehler(", "if (false) c.fehler(", 'Übersetzer: ein Vermerk entscheidet niemand', TESTS_P19],
  ['werkzeuge/geschichte.mjs', "if (weg > 0 && !inKurz) c.fehler(fo,", "if (false) c.fehler(fo,", 'Übersetzer: „kurzfassung: nein“ nur in Stationen der Kurzfassung', TESTS_P19],
  ['werkzeuge/geschichte.mjs', "else if (woerter(ersatz) >= woerter(langRoh))", "else if (false)", 'Übersetzer: …-kurz kürzer als der lange Text', TESTS_P19],
  ['werkzeuge/geschichte.mjs', "if (woerter(t) > VERTIEFUNG_ABSATZ_MAX)", "if (woerter(t) >= VERTIEFUNG_ABSATZ_MAX)", 'Übersetzer: Vertiefung, 60 Wörter je Absatz sind erlaubt', TESTS_P19],
  ['werkzeuge/geschichte.mjs', "if (woerter(t) > VERTIEFUNG_ABSATZ_MAX)", "if (woerter(t) > VERTIEFUNG_ABSATZ_MAX + 5)", 'Übersetzer: Vertiefung, höchstens 60 Wörter je Absatz', TESTS_P19],
  ['werkzeuge/geschichte.mjs', "if (r.echos.length > ECHOS_MAX)", "if (r.echos.length >= ECHOS_MAX)", 'Übersetzer: zehn Echos sind erlaubt', TESTS_P19],
  ['werkzeuge/geschichte.mjs', "else if (stelle === 'vor-vergleich' && !hatVergleich)", "else if (false)", 'Übersetzer: Mini vor dem Vergleich nur mit Vergleich', TESTS_P19],
  ['werkzeuge/lesezeit.mjs', "if (s !== gut) varianten.push(zaehle(s, sch));", "if (false) varianten.push(zaehle(s, sch));", 'Lesezeit: die obere Schranke zählt die längste Echo-Fassung', TESTS_P19],
  ['src/ui/flaechen/geschichte-buch.ts', "o.gesehen !== undefined && !o.gesehen.has(s.k.id);", "o.gesehen !== undefined;", 'Buch: „neu“ nur für Einträge, die beim letzten Öffnen fehlten', TESTS_P19],
  ['src/ui/flaechen/geschichte.ts', "const buchNeu = (): boolean => !buchOffen && buchEintraege", "const buchNeu = (): boolean => buchEintraege", 'Buch: geöffnet trägt das Symbol keinen Punkt', TESTS_P19],
  ['src/ui/flaechen/geschichte.ts', "const mitDahinter = endetStation(k, stand.kurz, 'frage');", "const mitDahinter = k.mini === null || stand.kurz;", 'Station: „Dahinter“ am Ende der Station, auch bei Mini vor der Frage', TESTS_P19],
  ['src/ui/flaechen/geschichte.ts', "if (k.vertiefung === undefined || o.stand.kurz || !o.bedienbar) return null;", "if (k.vertiefung === undefined || !o.bedienbar) return null;", 'Vertiefung: nie in der Kurzfassung', TESTS_P19],
  ['src/ui/flaechen/geschichte.ts', "if (k.vertiefung === undefined || o.stand.kurz || !o.bedienbar) return null;", "if (k.vertiefung === undefined || o.stand.kurz) return null;", 'Vertiefung: nicht auf der Leinwand', TESTS_P19],
  ['src/ui/flaechen/geschichte.ts', "aktiv === 'mini-pruefen' ? 'mini-schluss' : aktiv", "aktiv", 'Bericht: nach der Prüfung geht der Fokus zum Schlusssatz', TESTS_P19],
  ['src/ui/flaechen/geschichte-mini.ts', "h('b', null, lage === 'richtig' ? [sym('haken'), w.miniStimmt] : w.miniNichtGanz)", "h('b', null, lage === 'richtig' ? [sym('haken'), w.miniStimmt] : w.miniStimmt)", 'Mini: „Nicht ganz.“ bei falscher Wahl', TESTS_P19],
  ['src/ui/flaechen/geschichte-mini.ts', "return aus.fertig && m.schlussHtml !== undefined ?", "return m.schlussHtml !== undefined ?", 'Mini: Schlusssatz erst nach Abschluss der Aufgabe', TESTS_P19],
  ['src/ui/flaechen/geschichte-mini.ts', "const faden = gewaehlt >= 0 ? p.loesung : 'offen';", "const faden = gewaehlt >= 0 ? m.wahlen[gewaehlt]?.id ?? 'offen' : 'offen';", 'Pinnwand: der Faden zeigt die Lösung, nicht die Wahl', TESTS_P19],
  ['src/ui/flaechen/geschichte-mini.ts', "const gesperrt = antworten.length >= kontingent;", "const gesperrt = false;", 'Rückfragen: die übrigen Gespräche sind gesperrt', TESTS_P19],
  ['src/grafik/verlauf.ts', "if (w === null) { aktuell = null; return; }", "if (w === null) { return; }", 'Verlaufsband: bei „offen“ reißt die Linie ab', TESTS_P19],
  ['src/grafik/verlauf.ts', "r.hohl?.[i] === true ? ' vb-punkt-hohl' : ''", "''", 'Verlaufsband: hohle Punkte für nur Erzähltes', TESTS_P19],
  ['src/regie/regie.ts', "if (neu.buch === true && (neu.bereich !== 'story' || !gleicherSchritt(", "if (false && (neu.bereich !== 'story' || !gleicherSchritt(", 'Regie: das Buch auf der Leinwand gilt nur für den Schritt', TESTS_P19],
  ['src/regie/buehne.ts', "r['buch'] === true && r['bereich'] === 'story'", "r['buch'] === true", 'Bühnenstand: das Buch nur im Bereich Story', TESTS_P19],
  ['src/regie/leinwand.ts', "const buch = b.buch === true && (g.buch?.length ?? 0) > 0;", "const buch = b.buch === true;", 'Leinwand: ohne Buch in der Story kein Buch', TESTS_P19],
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
  const vorher = spawnSync(process.execPath, ['--test', '--test-reporter=dot', ...TESTS, ...TESTS_AUTOMAT, ...TESTS_WERKZEUGE, ...TESTS_AKTE, ...TESTS_UEBERSETZER, ...TESTS_CAMPUS, ...TESTS_LESEZEIT, ...TESTS_P19], { cwd: WURZEL, encoding: 'utf8' });
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
