// Reine Anzeige-Regeln der Oberfläche (src/ui/anzeige.ts, Grafik-Helfer): schrittweiser Aufbau
// (L-4), Weiter/Zurück, Regie-Eingriffe, Uhr und Zeitsprung – an den echten Inhalten gemessen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Aktion, OeffentlicherZustand, Zustand } from '../src/engine/typen.ts';
import { inhalte } from '../src/inhalte/index.ts';
import { wende } from '../src/engine/aktionen.ts';
import { anfangszustand, oeffentlich } from '../src/engine/zustand.ts';
import {
  aktuellerSchritt, eingriffe, gruppiere, instrumenteSichtbar, karteSichtbar, kicker, mandatsWahl, schrittPosition,
  sichtbareSchritte, tafelTitel, tafelWelt, tageAus, uhrAnzeige, weiterAktion, zurueckAktion,
} from '../src/ui/anzeige.ts';
import { spuren } from '../src/ui/leitstand/karte.ts';
import { formatiereTeur, hoeheFuer, stockwerkHoehen, type LeiterStufe } from '../src/grafik/mandatsleiter.ts';
import { zielInB } from '../src/grafik/vergleich-szene.ts';
import { idArt } from '../src/grafik/checkliste.ts';
import { FLUSS_POSITIONEN, istFlussPosition } from '../src/grafik/governance-fluss.ts';

const tue = (z: Zustand, a: Aktion | null): Zustand => {
  assert.ok(a !== null, 'Aktion erwartet');
  const neu = wende(z, a, inhalte);
  assert.notEqual(neu, z, `Aktion ${a.art} hat nichts geändert`);
  return neu;
};
const o = (z: Zustand): OeffentlicherZustand => oeffentlich(z);
const weiter = (z: Zustand): Zustand => tue(z, weiterAktion(o(z), inhalte));
const art = (z: Zustand): string | undefined => aktuellerSchritt(o(z), inhalte)?.art;

/** Bis zur Entscheidung in A3 (Rolle PL, Information angefordert). */
function bisEntscheidung(): Zustand {
  let z = weiter(anfangszustand());
  assert.equal(z.station, inhalte.start);
  while (art(z) !== 'rollenwahl') z = weiter(z);
  z = tue(z, { art: 'waehleRolle', rolle: 'pl' });
  while (z.station === inhalte.start) z = weiter(z);
  assert.equal(z.station, 'A3');
  while (art(z) !== 'entscheidung') z = weiter(z);
  return z;
}

test('L-4: Prolog und Einstieg ohne Instrumente und Karte; Karte nach dem Einstieg, Instrumente ab der Entscheidung', () => {
  let z = weiter(anfangszustand());
  assert.equal(instrumenteSichtbar(o(z), inhalte), false);
  assert.equal(karteSichtbar(o(z), inhalte), false);
  while (art(z) !== 'rollenwahl') z = weiter(z);
  assert.equal(weiterAktion(o(z), inhalte), null, 'ohne Rolle geht es nicht weiter');
  z = tue(z, { art: 'waehleRolle', rolle: 'pl' });
  while (z.station === inhalte.start) z = weiter(z);
  assert.equal(z.schritt, 0);
  assert.equal(karteSichtbar(o(z), inhalte), false, 'Einstieg: noch keine Karte');
  assert.equal(instrumenteSichtbar(o(z), inhalte), false, 'Einstieg: noch keine Instrumente');
  z = weiter(z);
  assert.equal(karteSichtbar(o(z), inhalte), true, 'nach dem Einstieg: Karte');
  assert.equal(instrumenteSichtbar(o(z), inhalte), false);
  while (art(z) !== 'entscheidung') z = weiter(z);
  assert.equal(instrumenteSichtbar(o(z), inhalte), true, 'Entscheidung: Instrumente');
  // Auf der Startseite (Bereich start) nie
  const start = tue(z, { art: 'wechsleBereich', bereich: 'start' });
  assert.equal(instrumenteSichtbar(o(start), inhalte), false);
  assert.equal(karteSichtbar(o(start), inhalte), false);
});

test('Weiter wartet auf die Entscheidung; danach Konsequenz, Vergleich, Welt B bis zum Ende mit Ebenen 1–4', () => {
  let z = bisEntscheidung();
  assert.equal(weiterAktion(o(z), inhalte), null);
  const ent = inhalte.stationen['A3']?.szenen['pl']?.entscheidung;
  assert.ok(ent);
  z = tue(z, { art: 'waehle', option: 'B', zeit: 1 });
  z = weiter(z);
  assert.equal(art(z), 'konsequenz');
  z = weiter(z);
  const vergleich = inhalte.stationen[z.station ?? ''];
  assert.ok(vergleich?.vergleich, 'nach A3 folgt der Vergleich');
  assert.equal(tafelWelt(vergleich ?? null), 'ab');
  z = weiter(z);
  assert.equal(z.station, 'B3');
  assert.equal(tafelWelt(inhalte.stationen['B3'] ?? null), 'b');
  while (art(z) !== 'ebenen') z = weiter(z);
  for (let e = 2; e <= 4; e += 1) {
    const a = weiterAktion(o(z), inhalte);
    assert.deepEqual(a, { art: 'setzeEbene', ebene: e });
    z = tue(z, a);
  }
  assert.equal(weiterAktion(o(z), inhalte), null, 'Ende der Probe');
  assert.deepEqual(zurueckAktion(o(z), inhalte), { art: 'setzeEbene', ebene: 3 });
});

test('Gruppen: die sechs Teile von B3 sind ein Fortschrittsschritt mit Takten', () => {
  const b3 = inhalte.stationen['B3'];
  assert.ok(b3);
  const schritte = sichtbareSchritte(b3, 'pl');
  const gruppen = gruppiere(schritte);
  assert.equal(gruppen.length, 2);
  assert.equal(gruppen[0]?.indizes.length, 6);
  assert.deepEqual(schrittPosition(schritte, 2), { nr: 1, takt: 3, takte: 6, gruppe: gruppen[0] });
  assert.match(kicker(schritte, 2), /^Schritt 1 · 3\/6 /);
  assert.equal(tafelTitel(schritte, 0), schritte[0]?.gruppe);
  assert.equal(kicker(schritte, 6), `Schritt 2 · ${schritte[6]?.kurz || schritte[6]?.titel}`);
});

test('Regie-Eingriffe: Kundenwahl A–D an der Entscheidung, Welt A/B am Vergleich', () => {
  let z = bisEntscheidung();
  const e = eingriffe(o(z), inhalte);
  assert.deepEqual(e.filter((x) => x.aktion.art === 'waehle').map((x) => x.pruef), ['regie-wahl-A', 'regie-wahl-B', 'regie-wahl-C', 'regie-wahl-D']);
  z = tue(z, { art: 'waehle', option: 'C', zeit: 2 });
  assert.equal(eingriffe(o(z), inhalte).find((x) => x.pruef === 'regie-wahl-C')?.gedrueckt, true);
  z = weiter(weiter(z));
  const v = eingriffe(o(z), inhalte).map((x) => x.pruef);
  assert.deepEqual(v, ['regie-welt-a', 'regie-welt-b']);
  // außerhalb der Story nichts
  assert.deepEqual(eingriffe(o(tue(z, { art: 'wechsleBereich', bereich: 'theorie' })), inhalte), []);
});

test('Uhr und Zeitsprung: angeforderte Information verschiebt die Uhr', () => {
  let z = weiter(anfangszustand());
  while (art(z) !== 'rollenwahl') z = weiter(z);
  z = tue(z, { art: 'waehleRolle', rolle: 'pl' });
  while (z.station === inhalte.start) z = weiter(z);
  const a3 = inhalte.stationen['A3'];
  assert.ok(a3);
  const vorher = uhrAnzeige(a3, o(z), inhalte);
  assert.ok(vorher !== null && !vorher.gesprungen);
  assert.match(vorher.zeit ?? '', /^\d{1,2}:\d{2}$/);
  const info = a3.infos[0];
  assert.ok(info);
  z = weiter(z);
  z = tue(z, { art: 'fordereInfo', info: info.id });
  const nachher = uhrAnzeige(a3, o(z), inhalte);
  assert.ok(nachher?.gesprungen);
  assert.ok((tageAus(nachher.tag) ?? 0) > 0);
});

test('tageAus liest Dauern in Worten und Ziffern', () => {
  assert.equal(tageAus('Zwei Wochen später'), 14);
  assert.equal(tageAus('3 Tage später'), 3);
  assert.equal(tageAus('ein Monat'), 30);
  assert.equal(tageAus('später'), null);
});

test('Mandatsleiter: Anzeige-Wahl mit Vorgabe, Stockwerke, Höhe und Beträge', () => {
  const b3 = inhalte.stationen['B3'];
  const mandat = b3?.schritte.find((s) => s.bloecke.some((b) => b.art === 'mandatsleiter'));
  assert.ok(b3 && mandat);
  const erste = mandat.bloecke.find((b) => b.art === 'mandatsoption')?.id ?? null;
  assert.equal(mandatsWahl({ ansicht: {} }, 'B3', mandat), erste);
  assert.equal(mandatsWahl({ ansicht: { [`B3/${mandat.id}`]: 'gibt-es-nicht' } }, 'B3', mandat), erste);
  assert.deepEqual(stockwerkHoehen(3), [22, 52, 26]);
  assert.equal(stockwerkHoehen(4).reduce((a, b) => a + b, 0), 100);
  const stufen: LeiterStufe[] = [
    { wer: 'PL', bereich: '', bisTeur: 100, hinweis: null },
    { wer: 'GF', bereich: '', bisTeur: 1000, hinweis: null },
    { wer: 'Rat', bereich: '', bisTeur: null, hinweis: null },
  ];
  assert.equal(hoeheFuer(stufen, 0), 0);
  assert.equal(hoeheFuer(stufen, 100), 22);
  assert.ok(hoeheFuer(stufen, 4700) > 74 && hoeheFuer(stufen, 4700) <= 100);
  assert.equal(formatiereTeur(100), '100 TEUR');
  assert.equal(formatiereTeur(4700), '4,7 Mio. €');
});

test('Vergleichsszene, Prüfliste, Fluss: Ziele und Kennungen', () => {
  assert.deepEqual(zielInB({ bArt: 'register', fluss: 'fruehwarnung', b: null }).breit, [7.14, 80, 13.2]);
  assert.equal(zielInB({ bArt: 'markierung', fluss: null, b: null }).breit[1], 13);
  // Zwei Stücke an derselben Station liegen nie aufeinander (breit übereinander, schmal nebeneinander).
  const erstes = zielInB({ bArt: 'register', fluss: 'entscheidung', b: null }, 0, 2);
  const zweites = zielInB({ bArt: 'reserve', fluss: 'entscheidung', b: null }, 1, 2);
  assert.equal(erstes.breit[0], zweites.breit[0]);
  assert.notEqual(erstes.breit[1], zweites.breit[1]);
  assert.equal(erstes.schmal[1], zweites.schmal[1]);
  assert.ok(erstes.schmal[0] + erstes.schmal[2] / 2 <= zweites.schmal[0] - zweites.schmal[2] / 2, 'schmal nebeneinander ohne Überlappung');
  assert.equal(idArt('ENT-017'), 'ent');
  assert.equal(idArt('RIS-014'), 'ris');
  assert.equal(idArt('X-1'), null);
  assert.equal(FLUSS_POSITIONEN.length, 7);
  assert.ok(istFlussPosition('entscheidung'));
  assert.ok(!istFlussPosition('irgendwo'));
});

test('Story-Karte: Welt A endet am Vergleich, Welt B beginnt mit der Partnerstation', () => {
  const folge = inhalte.stationsFolge.map((id) => inhalte.stationen[id]).filter((s) => s !== undefined);
  const lauf = spuren(folge);
  assert.equal(lauf.length, folge.length);
  assert.equal(lauf[0]?.a, 'start');
  assert.equal(lauf[0]?.b, 'keine');
  assert.ok(lauf.some((s) => s.b === 'start'));
});
