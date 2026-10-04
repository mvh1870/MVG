/*
 * Block `oberflaeche` in rahmen.yaml (P19.6, L-345): Wortlaut-Liste der Seite nach dem Drehbuch (04-rahmen.md Abschnitt 7). Die Wörter stehen in src/ui/woerter.ts;
 * dieser Test hält fest, dass der Entwurf des Rahmens und die Wörter der Seite dasselbe sagen – und dass jeder Schlüssel, den der Übersetzer kennt, eine
 * Entsprechung hat. Steht der Block schon in inhalte/geschichte/rahmen.yaml, gilt dieselbe Probe für ihn.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { OBERFLAECHE } from '../werkzeuge/geschichte.mjs';
import { W } from '../src/ui/woerter.ts';
import { OBERFLAECHE_ENTWURF } from './hilfen/oberflaeche-entwurf.ts';

const w = W.geschichte;
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Schlüssel des Blocks → was die Seite dafür sagt (Platzhalter {…} wie im Block). */
const SEITE: Record<string, unknown> = {
  station: w.stationVonN(1, 2).split(' ')[0],
  'akt-leiste': w.aktLeiste,
  'rest-gleich': w.restMinuten(1),
  'rest-minuten': w.restMinuten(7).replace('7', '{min}'),
  'ort-pause': w.pauseOrt('II').replace('Akt II', '{akt}'),
  'pause-kicker': w.pauseKicker,
  'kann-jetzt': w.koennenTitel,
  'pause-weiter': w.weiterMitAkt('II').replace('Akt II', '{akt}'),
  'pause-offen': w.pauseOffen,
  'zur-offenen': w.zurOffenen('{stelle}', '{titel}'),
  gespeichert: w.gespeichert,
  'weiter-kicker': w.weiterKicker,
  'weiter-ganz': w.weiterGanz,
  'bruecken-kicker': w.brueckeTitel,
  buch: w.buch,
  'buch-titel': w.buchTitel,
  'buch-intro': w.buchIntro,
  'buch-leer': w.buchLeer,
  'buch-legende': w.buchLegende.map((e) => `${e.wort}: ${e.text}`).join(' '),
  'buch-spalten': [w.buchSpalten.anlass, w.buchSpalten.entschieden, w.buchSpalten.grundlage, w.buchSpalten.ergebnis],
  'buch-art': w.buchArt,
  'buch-neu': w.buchNeu,
  'buch-zeigen': W.regie.buchZeigen,
  'buch-druck-titel': w.buchDruckTitel,
  'verlauf-pause': w.verlaufPause,
  'verlauf-bilanz': w.verlaufBilanz,
  'verlauf-text': w.verlaufText,
  'verlauf-legende': w.verlaufLegende,
  'verlauf-hohl': w.verlaufHohl,
  'verlauf-offen': w.verlaufOffen,
  vertiefung: w.vertiefung,
  'vertiefung-formen': w.vertiefungForm,
  'vertiefung-antwort': w.vertiefungAntwort,
  'mini-kicker': w.miniKicker,
};

test('oberflaeche: jeder Schlüssel, den der Übersetzer kennt, hat eine Entsprechung in woerter.ts – und umgekehrt', () => {
  assert.deepEqual(Object.keys(OBERFLAECHE).sort(), Object.keys(SEITE).sort());
  assert.deepEqual(Object.keys(OBERFLAECHE_ENTWURF).sort(), Object.keys(OBERFLAECHE).sort(), 'der Entwurf nennt jeden Schlüssel');
});

test('oberflaeche: der Wortlaut des Drehbuchs (Entwurf des Rahmens) und die Wörter der Seite sind dieselben', () => {
  for (const [schluessel, soll] of Object.entries(SEITE)) assert.deepEqual(OBERFLAECHE_ENTWURF[schluessel], soll, schluessel);
});

test('oberflaeche: steht der Block in inhalte/geschichte/rahmen.yaml, sagt er dasselbe wie die Seite', () => {
  const roh = YAML.parse(readFileSync(resolve(WURZEL, 'inhalte/geschichte/rahmen.yaml'), 'utf8')) as { oberflaeche?: Record<string, unknown> };
  if (roh.oberflaeche === undefined) return;
  for (const [schluessel, wert] of Object.entries(roh.oberflaeche)) assert.deepEqual(wert, SEITE[schluessel], schluessel);
});
