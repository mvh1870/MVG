/*
 * Kleine, gültige Kunst-Geschichte für die Übersetzer-Tests (P19.4/P19.5): Rahmen und drei Stationen als rohe YAML-Objekte, dazu `lauf`,
 * das sie durch `baueGeschichte` schickt und die Fehlermeldungen („ort: text“) sammelt. Jede Probe verfälscht genau eine Stelle und
 * verlangt genau die erwartete Meldung; die Grundlage selbst ist fehlerfrei (Gegenprobe zu jedem Fall).
 */
import YAML from 'yaml';

import { baueGeschichte } from '../../werkzeuge/geschichte.mjs';

export type Roh = Record<string, any>;

/** Kompilierer-Stub: sammelt Fehler als „ort: text“, Markdown bleibt Text, keine Quelle (Absatz-IDs nur nach Form). */
function stub(): { c: unknown; fehler: string[] } {
  const fehler: string[] = [];
  const c = {
    fehler: (ort: string, text: string) => { fehler.push(`${ort}: ${text}`); },
    warnung: () => undefined,
    html: (t: string) => t,
    inline: (t: string) => t,
    quelle: null,
  };
  return { c, fehler };
}

export const zeile = (figur: string, text: string): Roh => ({ figur, text });
export const antwort = (wertung: string, g = 0, z = 0, v = 0): Roh => ({ wertung, text: `Antwort ${wertung}`, balken: { geld: g, zeit: z, vertrauen: v }, folge: `Folge ${wertung}` });

export function rahmen(): Roh {
  const balken = (start: number): Roh => ({ titel: 'B', text: 'Text', start, mehr: 'mehr', weniger: 'weniger', bilanz: { hoch: 'h', mittel: 'm', niedrig: 'n' } });
  return {
    titel: 'Kunst-Geschichte',
    auftakt: { campus: { stufe: 0, jahreszeit: 'winter', licht: 'morgen' }, text: 'Ein fiktiver Fall.', vorstellung: 'Diese begleiten Sie:', los: 'Los', kurz: 'Kurz' },
    sie: { steckbrief: 'Sie leiten.' },
    figuren: ['grundstein', 'faden', 'schwung', 'klingel', 'lot'].map((id) => ({ id, name: id, rolle: 'Rolle', akzent: 'blau', steckbrief: 'Text' })),
    balken: { geld: balken(9), zeit: balken(6), vertrauen: balken(4) },
    bilanz: Object.fromEntries(['nicht-getragen', 'letzte-meter', 'ruhig', 'umwege', 'offen'].map((k) => [k, { titel: k, text: 'Text' }])),
    mandat: { titel: 'Wer entscheidet was', zeilen: [{ wer: 'Sie', text: 'bis 100.000 Euro' }] },
    ende: {
      zeit: 'August', campus: { stufe: 8, jahreszeit: 'sommer', licht: 'morgen' }, einstieg: 'Morgens.',
      szene: [zeile('klingel', 'Guten Morgen!'), zeile('grundstein', 'Gut.'), zeile('lot', 'Steht alles drin.')],
      'zeit-niedrig': 'Halle zu.', 'vertrauen-niedrig': [zeile('grundstein', 'Früher reden.')], 'nach-falle': [zeile('grundstein', 'Nicht immer gut.')], offen: [zeile('grundstein', 'Noch offen.')],
    },
  };
}

export function kapitel1(): Roh {
  return {
    nr: 1, titel: 'Erstes', zeit: 'Januar', campus: { stufe: 0, jahreszeit: 'winter', licht: 'morgen' }, kurzfassung: true, thema: 'begriffe',
    belege: ['k4.2-p3', 'v24:hb-3.1', 'v24:hb-projektblatt'], einstieg: 'Einstieg', szene: [zeile('faden', 'Hallo'), zeile('lot', 'Moin')], frage: 'Was tun?',
    antworten: [antwort('vertretbar', 0, -1, 1), antwort('gut', 0, 0, 2), antwort('falle', 0, 1, -2)], gut: 'So gut.', dahinter: 'Dahinter.',
    'mandat-nach-folge': true, 'bild-szene': 'bauzaun',
    vergleich: {
      einleitung: 'Vergleich', kriterien: [{ id: 'geld', titel: 'Geld', gewicht: 3 }, { id: 'zeit', titel: 'Zeit', gewicht: 5 }],
      optionen: [
        { id: 'A', titel: 'Ah', punkte: { geld: 2, zeit: 5 }, worte: { geld: 'teuer', zeit: 'schnell' } },
        { id: 'B', titel: 'Be', punkte: { geld: 5, zeit: 2 }, worte: { geld: 'billig', zeit: 'langsam' } },
      ],
      saetze: { A: 'A vorn', B: 'B vorn', gleichauf: 'gleich' }, empfehlung: 'Empfehlung', wer: 'Wer',
    },
  };
}

export function kapitel2(): Roh {
  return {
    nr: 2, titel: 'Zweites', zeit: 'März', campus: { stufe: 1, jahreszeit: 'fruehling', licht: 'tag' }, bruecke: 'Inzwischen.', thema: 'takt',
    belege: ['v24:tlb-2'], einstieg: 'Einstieg', szene: [zeile('lot', 'Holz'), zeile('faden', 'Ja')], frage: 'Und?',
    antworten: [antwort('gut'), antwort('falle'), antwort('vertretbar')], gut: 'Gut.', dahinter: 'Dahinter.',
    mini: {
      art: 'zuordnen', titel: 'Wer?', aufgabe: 'Zuordnen.', bild: 'kaertchen',
      wahlen: [{ id: 'sie', titel: 'Sie', figur: 'sie' }, { id: 'bm', titel: 'Bürgermeisterin', figur: 'grundstein' }, { id: 'ps', titel: 'Projektsteuerin', falsch: 'Nie.' }],
      posten: [{ text: 'Eins', loesung: 'sie', erklaerung: 'E' }, { text: 'Zwei', loesung: 'bm', erklaerung: 'E' }, { text: 'Drei', loesung: 'bm', erklaerung: 'E' }],
    },
  };
}

/** Dritte Station: in der Kurzfassung (nach der nicht gespielten Station 2), ohne Vergleich und ohne Mini-Aufgabe. */
export function kapitel3(): Roh {
  return {
    nr: 3, titel: 'Drittes', zeit: 'Mai', campus: { stufe: 2, jahreszeit: 'sommer', licht: 'tag' }, kurzfassung: true, thema: 'takt',
    belege: ['v24:tlb-2'], einstieg: 'Einstieg', szene: [zeile('faden', 'Drei'), zeile('klingel', 'Hoch')], frage: 'Und dann?',
    antworten: [antwort('gut'), antwort('falle'), antwort('vertretbar')], gut: 'Gut.', dahinter: 'Dahinter.',
  };
}

export const THEMEN = ['begriffe', 'takt'];
export const R = 'inhalte/geschichte/rahmen.yaml';
export const K1 = 'inhalte/geschichte/k1-erstes.yaml';
export const K2 = 'inhalte/geschichte/k2-zweites.yaml';
export const K3 = 'inhalte/geschichte/k3-drittes.yaml';

export interface Roheit { r: Roh; k1: Roh; k2: Roh; k3: Roh }

/** Schickt die Kunst-Geschichte mit drei Stationen durch den Übersetzer; `aendere` verfälscht eine Stelle. */
export function lauf(aendere: (d: Roheit) => void = () => undefined): { fehler: string[]; erg: any } {
  const d: Roheit = { r: rahmen(), k1: kapitel1(), k2: kapitel2(), k3: kapitel3() };
  aendere(d);
  const { c, fehler } = stub();
  const erg = baueGeschichte(c, [
    { rel: R, text: YAML.stringify(d.r) },
    { rel: K1, text: YAML.stringify(d.k1) },
    { rel: K2, text: YAML.stringify(d.k2) },
    { rel: K3, text: YAML.stringify(d.k3) },
  ], THEMEN);
  return { fehler, erg };
}

/** Zwei Echos für die Proben: E1 aus Station 1, E2 aus Station 2 (nicht in der Kurzfassung). */
export const echos = (): Roh[] => [
  { id: 'E1', quelle: 'k1', fassungen: { gut: 'Alpha.', vertretbar: 'Beta.', falle: 'Gamma.' } },
  { id: 'E2', quelle: 'k2', fassungen: { gut: 'Delta.', vertretbar: 'Epsilon.', falle: 'Zeta.' } },
];

/** Ein Buch mit einem Eintrag je Station, für alle Wege wahr. */
export const buch = (): Roh[] => [
  { station: 'k1', art: 'beschluss', entschieden: 'die Bürgermeisterin', grundlage: 'die Seite', ergebnis: 'Die Schwellen sind festgelegt.' },
  { station: 'k2', art: 'vermerk', entschieden: 'niemand – es wurde nichts beschlossen', grundlage: 'Hinweis des Architekten', ergebnis: 'Offen ist die Lieferzeit.' },
  { station: 'k3', art: 'uebergabe', entschieden: 'die Projektsteuerin an ihre Vertretung', grundlage: 'Einträge der Projektsteuerin', ergebnis: 'Die Vertretung übernimmt.' },
];
