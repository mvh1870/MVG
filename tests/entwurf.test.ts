/*
 * Rauchtest werkzeuge/entwurf.mjs (r72): das Werkzeug läuft einmal ganz durch und zählt Themen und
 * Story-Kapitel – ein Rest der alten Story (`geschichte.stationen`) brach es ab. Ob die Inhalte fehlerfrei
 * sind, prüft tests/inhalte.test.ts; hier zählt nur, dass das Werkzeug nicht abbricht.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const WURZEL = path.resolve(import.meta.dirname, '..');

test('entwurf.mjs: läuft durch, nennt Themen und Story-Kapitel, kein Abbruch', () => {
  const lauf = spawnSync(process.execPath, [path.join(WURZEL, 'werkzeuge/entwurf.mjs')], { cwd: WURZEL, encoding: 'utf8' });
  assert.doesNotMatch(lauf.stderr, /TypeError|ReferenceError|Error:/u, lauf.stderr);
  assert.ok(lauf.status === 0 || lauf.status === 1, `Exitcode ${String(lauf.status)}`);
  assert.match(lauf.stdout, /^entwurf: \d+ Dateien aus entwurf\/, \d+ Themen, [1-9]\d* Story-Kapitel – \d+ Fehler, \d+ Warnungen$/mu, lauf.stdout);
});
