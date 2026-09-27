// LPH-Band (P2.2): welcher Stand gilt – aktuelle Station, sonst die zuletzt besuchte mit LPH.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lphStand } from '../src/ui/leitstand/karte.ts';

const stationen = { p: { lph: null }, a3: { lph: 5 }, w: { lph: null }, r: { lph: 4 } } as never;

test('LPH-Stand: aktuelle Station, sonst rückwärts im Verlauf, sonst keiner', () => {
  assert.equal(lphStand({ station: 'a3', verlauf: ['p', 'a3'] }, { stationen }), 5);
  assert.equal(lphStand({ station: 'w', verlauf: ['p', 'a3', 'w'] }, { stationen }), 5, 'Wendepunkt ohne LPH zeigt den letzten Stand');
  assert.equal(lphStand({ station: 'r', verlauf: ['p', 'a3', 'w', 'r'] }, { stationen }), 4, 'Rückspulen setzt zurück auf LPH 4');
  assert.equal(lphStand({ station: 'p', verlauf: ['p'] }, { stationen }), null);
  assert.equal(lphStand({ station: null, verlauf: [] }, { stationen }), null);
});
