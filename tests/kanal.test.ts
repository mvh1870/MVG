/*
 * Regie-Kanal (src/regie/kanal.ts, P0.5): Senden/Empfangen über BroadcastChannel (in Node global
 * vorhanden), Rückfall über einen Schein-Speicher mit storage-Ereignis, veraltete Nummern,
 * doppelte Zustellung, Fehlertoleranz.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  erzeugeKanal, kanalSchluessel, type EingehendeNachricht, type Kanal, type KanalUmgebung, type RundfunkGriff,
} from '../src/regie/kanal.ts';
import { anfangszustand, oeffentlich, pruefeOeffentlich } from '../src/engine/zustand.ts';

/** Mehrere „Fenster“ über einem gemeinsamen Speicher: ein Schreiben meldet sich bei allen ANDEREN (wie `storage`). */
function fensterHub() {
  const daten = new Map<string, string>();
  const lauscher = new Set<{ fenster: number; fn: (k: string | null, v: string | null) => void }>();
  let zaehler = 0;
  return {
    daten,
    fenster(extra: Partial<KanalUmgebung> = {}): KanalUmgebung {
      const id = ++zaehler;
      return {
        rundfunk: null,
        speicher: {
          setItem(k: string, v: string): void {
            const alt = daten.get(k);
            daten.set(k, v);
            if (alt !== v) for (const l of [...lauscher]) if (l.fenster !== id) l.fn(k, v);
          },
        },
        beiSpeicherEreignis(fn) {
          const eintrag = { fenster: id, fn };
          lauscher.add(eintrag);
          return () => { lauscher.delete(eintrag); };
        },
        warne: () => {},
        ...extra,
      };
    },
  };
}

function sammle(k: Kanal): EingehendeNachricht[] {
  const liste: EingehendeNachricht[] = [];
  k.abonnieren((n) => liste.push(n));
  return liste;
}

const warte = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function bis(bedingung: () => boolean, ms = 2000): Promise<void> {
  const ende = Date.now() + ms;
  while (!bedingung()) {
    if (Date.now() > ende) throw new Error('Zeitüberschreitung');
    await warte(5);
  }
}

const RUNDFUNK = globalThis.BroadcastChannel as unknown as new (name: string) => RundfunkGriff;

test('BroadcastChannel: Zustand kommt an, der Absender hört sich nicht selbst', async () => {
  const opt: KanalUmgebung = { rundfunk: RUNDFUNK, speicher: null, beiSpeicherEreignis: null, warne: () => {} };
  const regie = erzeugeKanal('t-bc', { ...opt, kennung: 'regie' });
  const leinwand = erzeugeKanal('t-bc', { ...opt, kennung: 'leinwand' });
  try {
    const beiLeinwand = sammle(leinwand);
    const beiRegie = sammle(regie);
    const zustand = oeffentlich(anfangszustand());
    regie.senden({ art: 'zustand', nr: 1, zustand });
    await bis(() => beiLeinwand.length === 1);
    const n = beiLeinwand[0];
    assert.ok(n !== undefined && n.art === 'zustand');
    assert.equal(n.nr, 1);
    assert.deepEqual(pruefeOeffentlich(n.zustand), zustand);
    leinwand.senden({ art: 'lebenszeichen', nr: 1 });
    await bis(() => beiRegie.length === 1);
    assert.deepEqual(beiRegie, [{ art: 'lebenszeichen', nr: 1 }]);
    await warte(30);
    assert.equal(beiLeinwand.length, 1, 'kein Echo des eigenen Lebenszeichens');
  } finally {
    regie.schliessen();
    leinwand.schliessen();
  }
});

test('Rückfall über den Speicher: kommt im anderen Fenster an, nicht im eigenen', () => {
  const hub = fensterHub();
  const regie = erzeugeKanal('t-rf', hub.fenster({ kennung: 'regie' }));
  const leinwand = erzeugeKanal('t-rf', hub.fenster({ kennung: 'leinwand' }));
  const beiLeinwand = sammle(leinwand);
  const beiRegie = sammle(regie);
  regie.senden({ art: 'hallo' });
  regie.senden({ art: 'zustand', nr: 1, zustand: oeffentlich(anfangszustand()) });
  assert.deepEqual(beiLeinwand.map((n) => n.art), ['hallo', 'zustand']);
  assert.deepEqual(beiRegie, []);
  assert.ok(hub.daten.has(kanalSchluessel('t-rf')));
  // zwei gleiche Nachrichten hintereinander: der Umschlag ändert den Wert, das Ereignis feuert trotzdem
  leinwand.senden({ art: 'hallo' });
  leinwand.senden({ art: 'hallo' });
  assert.equal(beiRegie.length, 2);
});

test('Veraltete Nummern werden je Art verworfen; „hallo“ setzt die Merker zurück', () => {
  const hub = fensterHub();
  const regie = erzeugeKanal('t-alt', hub.fenster({ kennung: 'regie' }));
  const leinwand = erzeugeKanal('t-alt', hub.fenster({ kennung: 'leinwand' }));
  const bei = sammle(leinwand);
  const z = oeffentlich(anfangszustand());
  regie.senden({ art: 'zustand', nr: 5, zustand: z });
  regie.senden({ art: 'zustand', nr: 3, zustand: z });
  regie.senden({ art: 'zustand', nr: 5, zustand: z });
  regie.senden({ art: 'lebenszeichen', nr: 1 });
  regie.senden({ art: 'zustand', nr: 6, zustand: z });
  assert.deepEqual(bei.map((n) => `${n.art}:${'nr' in n ? n.nr : '-'}`), ['zustand:5', 'lebenszeichen:1', 'zustand:6']);
  // Regie neu geladen: neue Kennung, Zähler beginnt wieder bei 1 – nach „hallo“ gilt das
  const neu = erzeugeKanal('t-alt', hub.fenster({ kennung: 'regie-2' }));
  neu.senden({ art: 'zustand', nr: 1, zustand: z });
  assert.equal(bei.length, 3, 'ohne hallo: Nummer 1 ist älter als 6');
  neu.senden({ art: 'hallo' });
  neu.senden({ art: 'zustand', nr: 1, zustand: z });
  assert.deepEqual(bei.slice(3).map((n) => n.art), ['hallo', 'zustand']);
});

test('Beide Wege zugleich: jede Nachricht kommt genau einmal an', async () => {
  const hub = fensterHub();
  const regie = erzeugeKanal('t-beide', hub.fenster({ kennung: 'regie', rundfunk: RUNDFUNK }));
  const leinwand = erzeugeKanal('t-beide', hub.fenster({ kennung: 'leinwand', rundfunk: RUNDFUNK }));
  try {
    const bei = sammle(leinwand);
    regie.senden({ art: 'hallo' });
    regie.senden({ art: 'zustand', nr: 1, zustand: oeffentlich(anfangszustand()) });
    regie.senden({ art: 'lebenszeichen', nr: 1 });
    await warte(50);
    assert.deepEqual(bei.map((n) => n.art), ['hallo', 'zustand', 'lebenszeichen']);
  } finally {
    regie.schliessen();
    leinwand.schliessen();
  }
});

test('Dieselbe Serialisierung auf beiden Wegen (JSON-Rundlauf)', async () => {
  const hub = fensterHub();
  const regie = erzeugeKanal('t-json', hub.fenster({ kennung: 'regie', rundfunk: RUNDFUNK }));
  const nurRundfunk = erzeugeKanal('t-json', { kennung: 'a', rundfunk: RUNDFUNK, speicher: null, beiSpeicherEreignis: null, warne: () => {} });
  const nurSpeicher = erzeugeKanal('t-json', hub.fenster({ kennung: 'b' }));
  try {
    const a = sammle(nurRundfunk);
    const b = sammle(nurSpeicher);
    const zustand = { ...oeffentlich(anfangszustand()), extra: undefined, datum: new Date(0) } as unknown as ReturnType<typeof oeffentlich>;
    regie.senden({ art: 'zustand', nr: 1, zustand });
    await bis(() => a.length === 1 && b.length === 1);
    assert.deepEqual(a, b);
    const n = a[0];
    assert.ok(n !== undefined && n.art === 'zustand');
    assert.equal((n.zustand as Record<string, unknown>)['datum'], '1970-01-01T00:00:00.000Z');
    assert.equal('extra' in (n.zustand as Record<string, unknown>), false);
  } finally {
    regie.schliessen();
    nurRundfunk.schliessen();
    nurSpeicher.schliessen();
  }
});

test('Fehler der Plattform und der Empfänger werden gemeldet, nicht geworfen', () => {
  const hub = fensterHub();
  const gruende: string[] = [];
  const kaputterRundfunk = class {
    constructor() { throw new Error('verboten'); }
  } as unknown as new (name: string) => RundfunkGriff;
  const regie = erzeugeKanal('t-fehler', hub.fenster({ kennung: 'regie', rundfunk: kaputterRundfunk, warne: (g) => gruende.push(g) }));
  assert.ok(gruende.some((g) => /BroadcastChannel ließ sich nicht öffnen/u.test(g)));
  const leinwand = erzeugeKanal('t-fehler', hub.fenster({ kennung: 'leinwand', warne: (g) => gruende.push(g) }));
  const bei: EingehendeNachricht[] = [];
  leinwand.abonnieren(() => { throw new Error('Zeichnen kaputt'); });
  leinwand.abonnieren((n) => bei.push(n));
  regie.senden({ art: 'hallo' });
  assert.equal(bei.length, 1, 'der zweite Empfänger bekommt die Nachricht trotzdem');
  assert.ok(gruende.some((g) => /Empfänger des Kanals ist gescheitert/u.test(g)));
  const voll = erzeugeKanal('t-fehler', {
    kennung: 'voll', rundfunk: null, beiSpeicherEreignis: null, warne: (g) => gruende.push(g),
    speicher: { setItem: () => { throw new Error('QuotaExceededError'); } },
  });
  assert.doesNotThrow(() => voll.senden({ art: 'hallo' }));
  assert.ok(gruende.some((g) => /Rückfall über den Speicher hat nicht geschrieben/u.test(g)));
});

test('Abmelden, Schließen und fremder Inhalt unter dem Schlüssel', () => {
  const hub = fensterHub();
  const regie = erzeugeKanal('t-ab', hub.fenster({ kennung: 'regie' }));
  const umgebung = hub.fenster({ kennung: 'leinwand' });
  const leinwand = erzeugeKanal('t-ab', umgebung);
  const bei: EingehendeNachricht[] = [];
  const ab = leinwand.abonnieren((n) => bei.push(n));
  regie.senden({ art: 'lebenszeichen', nr: 1 });
  ab();
  regie.senden({ art: 'lebenszeichen', nr: 2 });
  assert.equal(bei.length, 1);
  leinwand.abonnieren((n) => bei.push(n));
  // fremder Inhalt: kein JSON, falscher Umschlag, falsche Nachricht, anderer Schlüssel
  const fremd = hub.fenster({ kennung: 'fremd' });
  fremd.speicher?.setItem(kanalSchluessel('t-ab'), '{kein json');
  fremd.speicher?.setItem(kanalSchluessel('t-ab'), JSON.stringify({ art: 'zustand', nr: 9, zustand: {} }));
  fremd.speicher?.setItem(kanalSchluessel('t-ab'), JSON.stringify({ mvg: 'kanal', von: 'x', folge: 1, nachricht: { art: 'unfug' } }));
  fremd.speicher?.setItem('anderer.schluessel', JSON.stringify({ mvg: 'kanal', von: 'y', folge: 1, nachricht: { art: 'hallo' } }));
  assert.equal(bei.length, 1);
  leinwand.schliessen();
  regie.senden({ art: 'lebenszeichen', nr: 3 });
  assert.equal(bei.length, 1, 'nach schliessen kommt nichts mehr an');
  const vorher = hub.daten.get(kanalSchluessel('t-ab'));
  regie.schliessen();
  regie.senden({ art: 'hallo' });
  assert.equal(hub.daten.get(kanalSchluessel('t-ab')), vorher, 'ein geschlossener Kanal sendet nicht');
});

test('Beamer-Schalter („anzeige“): gültig, veraltet, ungültig, nach „hallo“', () => {
  const hub = fensterHub();
  const regie = erzeugeKanal('t-anz', hub.fenster({ kennung: 'regie' }));
  const leinwand = erzeugeKanal('t-anz', hub.fenster({ kennung: 'leinwand' }));
  const bei = sammle(leinwand);
  regie.senden({ art: 'anzeige', nr: 2, beamer: true });
  regie.senden({ art: 'anzeige', nr: 1, beamer: false });
  assert.deepEqual(bei.map((n) => (n.art === 'anzeige' ? `${n.nr}:${n.beamer}` : n.art)), ['2:true'], 'kleinere Nummer ist veraltet');
  // ungültige Nachrichten von fremder Hand
  const fremd = hub.fenster({ kennung: 'fremd' });
  let folge = 0;
  for (const nachricht of [{ art: 'anzeige', nr: 9 }, { art: 'anzeige', nr: 9, beamer: 'ja' }, { art: 'anzeige', nr: Number.NaN, beamer: true }]) {
    fremd.speicher?.setItem(kanalSchluessel('t-anz'), JSON.stringify({ mvg: 'kanal', von: 'fremd', folge: ++folge, nachricht }));
  }
  assert.equal(bei.length, 1, 'ohne beamer, beamer kein Wahrheitswert, nr keine Zahl: verworfen');
  // Regie neu geladen: nach „hallo“ gilt die kleine Nummer wieder
  const neu = erzeugeKanal('t-anz', hub.fenster({ kennung: 'regie-2' }));
  neu.senden({ art: 'hallo' });
  neu.senden({ art: 'anzeige', nr: 1, beamer: false });
  assert.deepEqual(bei.slice(1).map((n) => (n.art === 'anzeige' ? `${n.nr}:${n.beamer}` : n.art)), ['hallo', '1:false']);
});

test('Tafel rollen („rollen“, P12.5 R8): gültig, veraltet, ungültig', () => {
  const hub = fensterHub();
  const regie = erzeugeKanal('t-roll', hub.fenster({ kennung: 'regie' }));
  const leinwand = erzeugeKanal('t-roll', hub.fenster({ kennung: 'leinwand' }));
  const bei = sammle(leinwand);
  regie.senden({ art: 'rollen', nr: 1, schritt: 1 });
  regie.senden({ art: 'rollen', nr: 2, schritt: -1 });
  regie.senden({ art: 'rollen', nr: 1, schritt: 1 });
  assert.deepEqual(bei.map((n) => (n.art === 'rollen' ? `${n.nr}:${n.schritt}` : n.art)), ['1:1', '2:-1'], 'kleinere Nummer ist veraltet');
  const fremd = hub.fenster({ kennung: 'fremd' });
  let folge = 0;
  for (const nachricht of [{ art: 'rollen', nr: 9 }, { art: 'rollen', nr: 9, schritt: 5 }, { art: 'rollen', nr: 9, schritt: '1' }]) {
    fremd.speicher?.setItem(kanalSchluessel('t-roll'), JSON.stringify({ mvg: 'kanal', von: 'fremd', folge: ++folge, nachricht }));
  }
  assert.equal(bei.length, 2, 'ohne schritt oder mit anderem Schritt als −1/+1: verworfen');
});

test('Beamer-Schalter auf beiden Wegen zugleich: kommt genau einmal an', async () => {
  const hub = fensterHub();
  const regie = erzeugeKanal('t-anz2', hub.fenster({ kennung: 'regie', rundfunk: RUNDFUNK }));
  const leinwand = erzeugeKanal('t-anz2', hub.fenster({ kennung: 'leinwand', rundfunk: RUNDFUNK }));
  const bei = sammle(leinwand);
  regie.senden({ art: 'anzeige', nr: 1, beamer: true });
  await bis(() => bei.length >= 1);
  await warte(50);
  assert.equal(bei.length, 1);
  regie.schliessen();
  leinwand.schliessen();
});
