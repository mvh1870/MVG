// Inhalt und Form der strukturierten Whitepaper-Quelle V1.2 (P0.2): Gliederung, IDs, Glossar,
// Abbildungen, wortgleiche Stichproben aus der DOCX und die Mutanten-Probe für istWortgleich.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  alleAbschnitte,
  alleBloecke,
  findeBlock,
  istWortgleich,
  ladeWhitepaper,
  normalisiere,
  pruefeZitat,
} from '../werkzeuge/whitepaper-lib.mjs';

const ORDNER = fileURLToPath(new URL('../quellen/whitepaper/v1.2/', import.meta.url));
const wp = ladeWhitepaper();
const bloecke = alleBloecke(wp);
const abschnitte = alleAbschnitte(wp);

/** Muss-Block holen (Test scheitert sonst mit klarer Meldung). */
function block(id: string) {
  const b = findeBlock(wp, id);
  assert.ok(b, `Block ${id} fehlt`);
  return b;
}

const KAPITEL = [
  'Kurzfassung',
  'Ausgangslage und Kernproblem',
  'Begriffsrahmen – delegierbare Arbeit, Mandat und nichtdelegierbare Verantwortung',
  'Verantwortungsfelder des Bauherrn',
  'Minimum Viable Governance als Bauherren-Führungsmodell',
  'MVG Companion als Umsetzungsbeschleuniger',
  'Leistungsarchitektur von Bauherr Mentoren',
  'Implementierung – von Diagnose zu Regelbetrieb',
  'Ergebnisbild und Ergebnisse',
  'Anwendungssituationen und Praxislogik',
  'MVG-Neuinitialisierung als Vertiefungsformat',
  'Was Bauherren mit MVG und MVG Companion gewinnen',
  'Anhang: Glossar',
];

test('Kopf: Fassung, Quelle mit Prüfsumme, Titel und Untertitel', () => {
  assert.equal(wp.fassung, 'V1.2');
  assert.equal(wp.quelle.datei, 'Bauherr_Mentoren_Whitepaper_V1.2.docx');
  const docx = readFileSync(`${ORDNER}Bauherr_Mentoren_Whitepaper_V1.2.docx`);
  assert.equal(wp.quelle.sha256, createHash('sha256').update(docx).digest('hex'));
  assert.equal(
    wp.titel,
    'Nichtdelegierbare Bauherrenverantwortung und Minimum Viable Governance für komplexe Bau- und Infrastrukturprojekte',
  );
  assert.equal(
    wp.untertitel,
    'Ein Whitepaper von Bauherr Mentoren zur Führungs-, Entscheidungs- und Nachweisfähigkeit von Bauherren im DACH-Raum',
  );
});

test('13 Kapitel mit den Titeln aus dem Inhaltsverzeichnis (auch die anders formatierten 3, 12, 13)', () => {
  assert.deepEqual(
    wp.kapitel.map((k) => `${k.nr} ${k.titel}`),
    KAPITEL.map((t, i) => `${i + 1} ${t}`),
  );
});

test('Abschnittsnummern vollständig und lückenlos', () => {
  /** Erwartete Unterabschnitte je Kapitel (6.4 mit 6.4.1–6.4.5). */
  const anzahl = [3, 5, 3, 6, 5, 4, 6, 4, 5, 5, 3, 1, 0];
  const erwartet: string[] = [];
  anzahl.forEach((n, i) => {
    erwartet.push(String(i + 1));
    for (let j = 1; j <= n; j++) {
      erwartet.push(`${i + 1}.${j}`);
      if (i + 1 === 6 && j === 4) for (let u = 1; u <= 5; u++) erwartet.push(`6.4.${u}`);
    }
  });
  assert.deepEqual(abschnitte.map((a) => a.nr), erwartet);
  for (const a of abschnitte) assert.equal(a.id, `k${a.nr}`);
  const k64 = abschnitte.find((a) => a.nr === '6.4');
  assert.deepEqual(k64?.abschnitte.map((a) => a.titel), [
    'Grundlogik der Zusammenarbeit',
    'Registerpflege und Takt',
    'Kanonischer Governance-Fluss',
    'Register-Abgrenzung',
    'Rhythmus, Rollen und Eskalation',
  ]);
});

test('IDs eindeutig und nach Schema k<nr>-<p|l|t|b><n>, je Abschnitt und Art ab 1 fortlaufend', () => {
  const alle = [
    ...abschnitte.map((a) => a.id),
    ...bloecke.map((b) => b.id),
    ...wp.glossar.map((g) => g.id),
    ...wp.abbildungen.map((a) => a.id),
  ];
  assert.equal(new Set(alle).size, alle.length, 'doppelte IDs');
  const buchstabe = { absatz: 'p', fett: 'p', liste: 'l', tabelle: 't', kasten: 'b' } as const;
  const zaehler = new Map<string, number>();
  for (const b of bloecke) {
    const m = /^k(\d+(?:\.\d+)*)-([pltb])(\d+)$/.exec(b.id);
    assert.ok(m, `ID ${b.id} passt nicht zum Schema`);
    assert.equal(m[1], b.abschnitt, `${b.id} liegt in Abschnitt ${b.abschnitt}`);
    assert.equal(m[2], buchstabe[b.art], `${b.id} hat Art ${b.art}`);
    const schluessel = `${b.abschnitt}:${m[2]}`;
    const n = (zaehler.get(schluessel) ?? 0) + 1;
    zaehler.set(schluessel, n);
    assert.equal(Number(m[3]), n, `${b.id} zählt nicht fortlaufend`);
    assert.equal(b.kapitel, b.abschnitt.split('.')[0]);
  }
  assert.equal(block('k1-p1').art, 'absatz');
  assert.equal(block('k2.5-t1').art, 'tabelle');
});

test('Texte bereinigt: kein weiches Trennzeichen, keine leeren Blöcke, Ränder ohne Leerraum', () => {
  const roh = readFileSync(`${ORDNER}whitepaper.json`, 'utf8');
  assert.ok(!roh.includes('­'), 'U+00AD in whitepaper.json');
  for (const b of bloecke) {
    assert.notEqual(b.text, '', `${b.id} leer`);
    assert.equal(b.text, b.text.trim(), `${b.id} mit Leerraum am Rand`);
  }
  // Silbentrennung mit manuellem Umbruch in der Symptomtabelle (2.5) ist zu einem Wort verbunden.
  assert.equal(block('k2.5-t1').zeilen?.[2]?.[0], 'Gremien ohne Entscheidungsreife');
});

test('Wortgleich: Leitsatz der Kurzfassung', () => {
  assert.ok(istWortgleich(wp, 'k1-p1', 'Arbeit kann delegiert werden; bauherrenseitige Legitimation nicht.'));
  assert.ok(block('k1-p1').text.startsWith('Arbeit kann delegiert werden; bauherrenseitige Legitimation nicht. Planer,'));
});

const MANDATSLEITER =
  'Als Muster-Mandatsleiter gilt: Die Bauherren-PL gibt bis einschließlich 100 TEUR eigenständig frei; ' +
  'oberhalb von 100 TEUR bis einschließlich 5 Mio. EUR entscheidet das Änderungsgremium; ' +
  'darüber erfolgt die Beschlussfassung durch den Bauherrn im Lenkungskreis.';

test('Wortgleich: Mandatsleiter-Satz ist der dritte Absatz in 4.2 (k4.2-p3)', () => {
  const treffer = bloecke.filter((b) => b.text.includes('Als Muster-Mandatsleiter gilt:'));
  assert.deepEqual(treffer.map((b) => b.id), ['k4.2-p3']);
  assert.equal(block('k4.2-p3').art, 'absatz');
  assert.equal(block('k4.2-p3').text, MANDATSLEITER);
  assert.ok(istWortgleich(wp, 'k4.2-p3', MANDATSLEITER));
});

test('Wortgleich: kanonischer Governance-Fluss (6.4.3) als fett gesetzter Absatz', () => {
  const fluss = 'EW (unbewertetes Signal) → bestätigt → Risiko → Entscheidung → Freigabe → Maßnahme → Managementbericht';
  const b = block('k6.4.3-p1');
  assert.equal(b.art, 'fett');
  assert.equal(b.text, fluss);
  assert.ok(istWortgleich(wp, 'k6.4.3-p1', fluss));
  assert.ok(istWortgleich(wp, 'k6.4.3-p2', 'Eine Frühwarnung (EW) ist ein unbewertetes Signal.'));
});

test('LPH-Tabelle in 9.3: Kopf und 10 Zeilen LPH 0 … LPH 9', () => {
  const t = block('k9.3-t1');
  assert.equal(t.art, 'tabelle');
  assert.deepEqual(t.kopf, ['LPH', 'Leistungsphase', 'Freigabefrage']);
  const zeilen = t.zeilen ?? [];
  assert.equal(zeilen.length, 10);
  zeilen.forEach((z, i) => {
    assert.equal(z.length, 3);
    assert.equal(z[0], `LPH ${i}`);
  });
  assert.equal(zeilen[0]?.[1], 'Bedarfsplanung');
  assert.equal(zeilen[9]?.[1], 'Übergabe');
  assert.ok(istWortgleich(wp, 'k9.3-t1', 'Sind Bedarf, Zielbild und Auftrag geklärt – gibt es eine legitimierte Grundlage für den Planungsstart?'));
});

test('Tabellen rechteckig; Kap. 4 mit 5 logischen Spalten trotz Word-Hilfsspalte (colspan)', () => {
  for (const b of bloecke.filter((x) => x.art === 'tabelle')) {
    const breite = (b.kopf ?? []).length;
    assert.ok(breite >= 2, `${b.id} ohne Kopf`);
    for (const z of b.zeilen ?? []) assert.equal(z.length, breite, `${b.id} nicht rechteckig`);
  }
  const t = block('k4-t1');
  assert.deepEqual(t.kopf, ['Feld', 'Nichtdelegierbarer Kern', 'Delegierbare Vorbereitung', 'Typische Fehlstelle', 'MVG-Antwort']);
  assert.deepEqual(t.zeilen?.map((z) => z[0]), [
    'Ziel', 'Mandat', 'Wesentliche Entscheidung', 'Risikoannahme', 'Freigabe', 'Datenstand und Nachweis',
  ]);
  assert.ok(t.zeilen?.every((z) => z.every((zelle) => zelle !== '')), 'leere Zelle in k4-t1');
  assert.equal(t.zeilen?.[1]?.[2], 'Rollenaufnahme, RACI-Vorschlag, Organigramm, Prozessanalyse, Gremienkalender.');
});

test('Kasten, Listen und fette Einleitungswörter', () => {
  const kasten = block('k6.3-b1');
  assert.equal(kasten.art, 'kasten');
  assert.ok(kasten.text.startsWith('Rahmenbedingungen\nDer MVG Companion ersetzt keine Bauherrenentscheidung'));
  const liste = block('k9.4-l1');
  assert.equal(liste.art, 'liste');
  assert.equal(liste.punkte?.length, 13);
  assert.equal(liste.text, liste.punkte?.join('\n'));
  assert.equal(block('k7-l1').punkte?.length, 5, 'Liste aus Einzelnummerierungen zusammengeführt');
  const einstieg = block('k8.2-p2');
  assert.equal(einstieg.art, 'absatz');
  assert.ok(einstieg.text.startsWith('In den ersten 30 Tagen geht es um Sichtbarkeit:'));
});

test('Glossar: mindestens 30 Einträge, u. a. Mandat, Frühwarnung, Freigabe', () => {
  assert.ok(wp.glossar.length >= 30, `nur ${wp.glossar.length} Einträge`);
  const begriffe = wp.glossar.map((g) => g.begriff);
  for (const b of ['Mandat', 'Frühwarnung', 'Freigabe']) assert.ok(begriffe.includes(b), `${b} fehlt`);
  assert.equal(wp.glossar[0]?.id, 'g-bauherr');
  assert.ok(wp.glossar.some((g) => g.id === 'g-fruehwarnung'));
  for (const g of wp.glossar) {
    assert.match(g.id, /^g-[a-z0-9-]+$/);
    assert.notEqual(g.definition, '');
  }
  // Das Glossar ist zugleich die Tabelle in Kapitel 13.
  const t = block('k13-t1');
  assert.deepEqual(t.kopf, ['Begriff', 'Definition']);
  assert.equal(t.zeilen?.length, wp.glossar.length);
});

test('Abbildungen: image2 … image14 je genau einmal verortet, image1/image15 nicht', () => {
  const dateien = wp.abbildungen.map((a) => a.datei.replace(/^bilder\//, '').replace(/\.\w+$/, ''));
  assert.deepEqual(dateien, Array.from({ length: 13 }, (_, i) => `image${i + 2}`));
  const orte = new Set([...abschnitte.map((a) => a.id), ...bloecke.map((b) => b.id)]);
  for (const a of wp.abbildungen) {
    assert.equal(a.id, `abb-${a.datei.match(/image(\d+)/)?.[1]}`);
    assert.ok(orte.has(a.ort), `${a.id}: Ort ${a.ort} unbekannt`);
    const inhalt = readFileSync(`${ORDNER}${a.datei}`);
    assert.equal(a.sha256, createHash('sha256').update(inhalt).digest('hex'), `${a.datei} weicht ab`);
  }
  const ort = Object.fromEntries(wp.abbildungen.map((a) => [a.id, a.ort]));
  assert.equal(ort['abb-2'], 'k1');
  assert.equal(ort['abb-10'], 'k6.4');
  assert.equal(ort['abb-12'], 'k7.1-p1');
});

test('image13 steht bei 8.1: am Ende des Einleitungsabsatzes von Kap. 8, direkt vor „8.1 Sequenziertes Vorgehen“', () => {
  const abb = wp.abbildungen.find((a) => a.id === 'abb-13');
  assert.ok(abb);
  assert.equal(abb.datei, 'bilder/image13.jpeg');
  assert.equal(abb.ort, 'k8-p1');
  assert.equal(abb.kapitel, '8');
  const k8 = wp.kapitel[7];
  assert.equal(k8?.bloecke.at(-1)?.id, 'k8-p1', 'k8-p1 ist der letzte Block vor 8.1');
  assert.equal(k8?.abschnitte[0]?.nr, '8.1');
  assert.equal(k8?.abschnitte[0]?.titel, 'Sequenziertes Vorgehen');
});

test('normalisiere: nur Leerraum und Silbentrennung', () => {
  assert.equal(normalisiere('  a  b\n\tc­d  '), 'a b cd');
  assert.equal(normalisiere('„Freigabe“ – LPH 0–9'), '„Freigabe“ – LPH 0–9');
});

test('istWortgleich toleriert nur Leerraum und Silbentrennung', () => {
  assert.ok(istWortgleich(wp, 'k4.2-p3', `  ${MANDATSLEITER.replace(/ /g, '  ').replace('Mandatsleiter', 'Mandats­leiter')}\n`));
  assert.ok(istWortgleich(wp, 'k9.4-l1', 'Entscheidungsfrage betroffene Freigabe'), 'Listenpunkte über Zeilenumbruch');
});

test('Mutanten-Probe: verfälschte Zitate werden als nicht wortgleich erkannt', () => {
  const mutanten: [string, string][] = [
    ['Zahl geändert', MANDATSLEITER.replace('100 TEUR eigenständig', '150 TEUR eigenständig')],
    ['Wort ausgelassen', MANDATSLEITER.replace('einschließlich 5 Mio.', '5 Mio.')],
    ['Satzzeichen', MANDATSLEITER.replace('frei; oberhalb', 'frei, oberhalb')],
    ['Einheit getauscht', MANDATSLEITER.replace('5 Mio. EUR', '5 Mio. €')],
    ['Groß/klein', MANDATSLEITER.replace('Änderungsgremium', 'änderungsgremium')],
    ['Begriff getauscht', MANDATSLEITER.replace('Lenkungskreis', 'Lenkungsausschuss')],
    ['Zusatz am Ende', `${MANDATSLEITER} Ausnahmen regelt die Bauherren-PL.`],
  ];
  for (const [art, zitat] of mutanten) {
    assert.notEqual(zitat, MANDATSLEITER, `Mutation „${art}“ greift nicht`);
    assert.equal(istWortgleich(wp, 'k4.2-p3', zitat), false, `Mutante „${art}“ nicht erkannt`);
  }
  assert.equal(istWortgleich(wp, 'k4.2-p3', 'Arbeit kann delegiert werden'), false, 'richtiges Zitat, falsche ID');
  assert.equal(istWortgleich(wp, 'k4.2-p99', MANDATSLEITER), false, 'unbekannte ID');
  assert.equal(istWortgleich(wp, 'k4.2-p3', '  '), false, 'leeres Zitat');
  assert.match(pruefeZitat(wp, 'k4.2-p3', mutanten[0]?.[1] ?? '').grund, /weicht in k4\.2-p3 nach \d+ Zeichen ab/);
  assert.match(pruefeZitat(wp, 'k4.2-p99', MANDATSLEITER).grund, /unbekannte Absatz-ID/);
});

test('whitepaper.md: Überschriften, je Block genau ein Anker in Dokumentreihenfolge, Abbildungen', () => {
  const md = readFileSync(`${ORDNER}whitepaper.md`, 'utf8');
  const anker = [...md.matchAll(/^<!-- id: (\S+) -->$/gm)].map((m) => m[1]);
  assert.deepEqual(anker, bloecke.map((b) => b.id));
  for (const k of wp.kapitel) assert.ok(md.includes(`\n## ${k.nr} ${k.titel}\n`), `Überschrift Kapitel ${k.nr}`);
  assert.ok(md.includes('\n#### 6.4.3 Kanonischer Governance-Fluss\n'));
  for (const a of wp.abbildungen) {
    assert.equal(md.split(`![Abbildung ${a.id}](${a.datei})`).length, 2, `${a.id} nicht genau einmal`);
  }
  assert.ok(md.includes('| LPH 9 | Übergabe |'), 'LPH-Tabelle als Markdown-Tabelle');
  assert.ok(!md.includes('\r'), 'nur LF');
  assert.ok(!md.includes('­'));
});
