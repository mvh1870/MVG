/*
 * Jeder Bilanz- und Ende-Text stimmt auf jedem Weg (R72, L-239; seit P19.1 über einen Zustandsautomaten statt Wegaufzählung):
 * Für jeden Text, der am Ende erscheinen kann, steht hier, was er über die gewählten Antworten voraussetzt; der Automat
 * liefert jeden erreichbaren Endzustand (lang und Kurzfassung, später auch mit offenen Kapiteln), und der Test meldet jeden
 * Zustand, auf dem ein Text erscheint, dessen Voraussetzung nicht erfüllt ist. Jeder Text ist mit seinem Anfang festgehalten:
 * Wer ihn ändert, muss hier die Voraussetzung neu prüfen. Dazu die Antwortlängen (die gute Antwort darf sich nicht durch
 * Länge verraten). Gegenproben: die frühere Regel („ruhig“ auch nach einer Falle, eine Schlusszeile für alle) wird hier rot.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { inhalte } from '../src/inhalte/index.ts';
import { balken, bilanzAmEnde, bilanzTyp, falleGewaehlt, gewaehlteAntwort, neuerStand, stufe, waehle, wegKapitel, type Balkenstand, type EndeFassung, type Stand } from '../src/geschichte/engine.ts';
import { endZustaende, standZuWeg, type Ende } from './hilfen/geschichte-zustaende.ts';
import type { Antwort, BalkenId, BilanzTyp, Geschichte, Kapitel, Wertung } from '../src/geschichte/typen.ts';
import { BALKEN } from '../src/geschichte/typen.ts';

const G0 = inhalte.geschichte;
assert.ok(G0, 'Story fehlt in den Inhalten');
const G: Geschichte = G0;
const WERTUNGEN: readonly Wertung[] = ['gut', 'vertretbar', 'falle'];

/** Ein durchgerechneter Weg der Kurzfassung (3^4 = 81 Wege) – nur für die Tests mit alten Wahlen in übersprungenen Kapiteln. */
interface Weg { name: string; stand: Stand; wahl: Map<string, Antwort>; b: Balkenstand }

function alleKurzWege(): Weg[] {
  const kap = wegKapitel(G, true);
  const aus: Weg[] = [];
  for (let i = 0; i < 3 ** kap.length; i++) {
    let s = neuerStand(true);
    let x = i;
    let name = '';
    for (const k of kap) {
      const w = WERTUNGEN[x % 3] ?? 'gut';
      x = Math.floor(x / 3);
      name += w[0];
      s = waehle(G, s, k.id, k.antworten.findIndex((a) => a.wertung === w));
    }
    s = { ...s, schritt: { ort: 'ende' } };
    const wahl = new Map<string, Antwort>();
    for (const k of G.kapitel) { const a = gewaehlteAntwort(s, k); if (a !== null) wahl.set(k.id, a); }
    aus.push({ name: `kurz ${name}`, stand: s, wahl, b: balken(G, s, { ort: 'ende' }) });
  }
  return aus;
}

/*
 * P19.1 (O-62, L-270): Statt alle Wege einzeln aufzuzählen (bei 16 Kapiteln 4,3 Milliarden), läuft ein Zustandsautomat
 * (tests/hilfen/geschichte-zustaende.ts) Kapitel für Kapitel über die erreichbaren Zustände und liefert jeden möglichen
 * Endzustand genau einmal. Die Proben gelten auf jedem von ihnen; tests/geschichte-zustaende.test.ts beweist den Automaten
 * gegen die Wegaufzählung.
 */
const ENDEN = [...endZustaende(G, false, false), ...endZustaende(G, true, false)];

const gute = (k: Kapitel): Antwort => k.antworten.find((a) => a.wertung === 'gut') as Antwort;

/** Text, Anfang des Texts (festgehalten), wann er erscheint, was er voraussetzt. */
interface Probe { was: string; text: string; anfang: string; erscheint: (w: Ende, typ: BilanzTyp, f: EndeFassung) => boolean; setztVoraus: (w: Ende) => boolean }

function zeileVon(liste: readonly { figur: string | null; html: string }[], figur: string): string {
  return liste.find((z) => z.figur === figur)?.html ?? '';
}

/** Erzählzeile (ohne Figur), die so beginnt. */
function erzaehlt(liste: readonly { figur: string | null; html: string }[], anfang: string): string {
  return liste.find((z) => z.figur === null && z.html.startsWith(anfang))?.html ?? '';
}

function proben(): Probe[] {
  const bl = (id: BalkenId) => G.balken.find((b) => b.id === id) as Geschichte['balken'][number];
  const e = G.ende;
  return [
    { was: 'Bilanz „Ruhig ins Ziel“', text: G.bilanz.ruhig.html, anfang: 'Die Kinder sind pünktlich eingezogen, und jede große Entscheidung hat die Bürgermeisterin selbst getroffen', erscheint: (_w, t) => t === 'ruhig', setztVoraus: (w) => !w.falle },
    { was: 'Bilanz „mit Umwegen“', text: G.bilanz.umwege.html, anfang: 'Der Campus steht, die Kinder sind da. Aber nicht jede Ihrer Antworten war der gerade Weg', erscheint: (_w, t) => t === 'umwege', setztVoraus: (w) => w.nichtGut >= 1 },
    { was: 'Bilanz „Auf den letzten Metern“', text: G.bilanz['letzte-meter'].html, anfang: 'Die Schule hat geöffnet, aber der Zeitpuffer war am Ende aufgebraucht. Wer eine Entscheidung aufschiebt', erscheint: (_w, t) => t === 'letzte-meter', setztVoraus: (w) => w.teurer.zeit },
    { was: 'Bilanz „ohne Rückhalt“', text: G.bilanz['nicht-getragen'].html, anfang: 'Die Gebäude stehen, doch das Vertrauen hat gelitten: Zu oft hat die Bürgermeisterin Dinge zu spät oder anders erfahren, als sie es von Ihnen erwarten durfte.', erscheint: (_w, t) => t === 'nicht-getragen', setztVoraus: (w) => w.nichtGut >= 2 },
    // Geld hoch: „jedes Mal von der Bürgermeisterin entschieden“, „dort eingesetzt, wo sie gebraucht wurde“ – keine Falle in den Stationen 3 bis 13 (04-rahmen 3.4); eine Falle in 1, 2 oder 14 ändert am Geld nichts
    { was: 'Geld hoch', text: bl('geld').bilanz.hoch, anfang: 'Die Reserve wurde dort eingesetzt, wo sie gebraucht wurde', erscheint: (w) => stufe(w.b.geld) === 'hoch', setztVoraus: (w) => !w.falleStat3bis13 },
    { was: 'Geld mittel', text: bl('geld').bilanz.mittel, anfang: 'Ein großer Teil der Reserve ist verbraucht; manches wurde teurer als nötig.', erscheint: (w) => stufe(w.b.geld) === 'mittel', setztVoraus: (w) => w.teurer.geld },
    { was: 'Geld niedrig', text: bl('geld').bilanz.niedrig, anfang: 'Die Reserve ist fast aufgebraucht; Antworten, die nicht der beste Weg waren, haben sie ein Stück kleiner gemacht.', erscheint: (w) => stufe(w.b.geld) === 'niedrig', setztVoraus: (w) => w.teurer.geld },
    // Zeit und Vertrauen beschreiben nur den Stand des Balkens – keine Voraussetzung über eine Wahl
    { was: 'Zeit hoch', text: bl('zeit').bilanz.hoch, anfang: 'Der Zeitpuffer hat gehalten', erscheint: (w) => stufe(w.b.zeit) === 'hoch', setztVoraus: () => true },
    { was: 'Zeit mittel', text: bl('zeit').bilanz.mittel, anfang: 'Der Zeitpuffer war am Ende dünn, hat aber gereicht.', erscheint: (w) => stufe(w.b.zeit) === 'mittel', setztVoraus: (w) => w.teurer.zeit },
    { was: 'Zeit niedrig', text: bl('zeit').bilanz.niedrig, anfang: 'Der Zeitpuffer ist aufgebraucht: Die Sporthalle öffnet erst nach den Herbstferien.', erscheint: (w) => stufe(w.b.zeit) === 'niedrig', setztVoraus: () => true },
    { was: 'Vertrauen hoch', text: bl('vertrauen').bilanz.hoch, anfang: 'Bürgermeisterin, Schule und Stadtrat verlassen sich inzwischen auf das, was Sie vorlegen.', erscheint: (w) => stufe(w.b.vertrauen) === 'hoch', setztVoraus: () => true },
    { was: 'Vertrauen mittel', text: bl('vertrauen').bilanz.mittel, anfang: 'Die Bürgermeisterin vertraut Ihnen, fragt aber gern noch einmal nach.', erscheint: (w) => stufe(w.b.vertrauen) === 'mittel', setztVoraus: () => true },
    { was: 'Vertrauen niedrig', text: bl('vertrauen').bilanz.niedrig, anfang: 'Die Bürgermeisterin lässt sich inzwischen jede Zahl zweimal zeigen', erscheint: (w) => stufe(w.b.vertrauen) === 'niedrig', setztVoraus: () => true },
    // Schlusszeilen
    { was: 'Bürgermeisterin, Grundzeile', text: zeileVon(e.szene, 'grundstein'), anfang: 'Wissen Sie, was das Beste war? Ich wusste jedes Mal, worüber ich entscheide.', erscheint: (_w, _t, f) => f === 'grund', setztVoraus: (w) => !w.falle },
    { was: 'Bürgermeisterin nach einer Falle', text: zeileVon(e.nachFalle, 'grundstein'), anfang: 'Geschafft haben wir es. Aber nicht jede Entscheidung ist so sauber vorbereitet worden, wie sie hätte sein sollen', erscheint: (_w, _t, f) => f === 'nach-falle', setztVoraus: (w) => w.falle },
    { was: 'Bürgermeisterin, Vertrauen niedrig', text: zeileVon(e.vertrauenNiedrig, 'grundstein'), anfang: 'Beim nächsten Projekt reden wir früher miteinander.', erscheint: (_w, _t, f) => f === 'vertrauen-niedrig', setztVoraus: (w) => w.falle },
    // P19.6: Lot spricht zuerst das Echo E10 (Fassung nach der Antwort in Station 10, ohne Antwort „gut“), danach die feste Fortsetzung – sie gilt auf jedem Weg
    { was: 'Bauleiter, Grundzeile (Fortsetzung nach dem Echo)', text: (e.szene.find((z) => z.figur === 'lot') as { fortsetzungHtml?: string }).fortsetzungHtml ?? '', anfang: 'Und inzwischen steht alles im Buch', erscheint: (w, _t, f) => f !== 'vertrauen-niedrig' && !w.kurz, setztVoraus: () => true },
    { was: 'Bauleiter, Vertrauen niedrig', text: zeileVon(e.vertrauenNiedrig, 'lot'), anfang: 'Inzwischen ist alles schriftlich festgehalten. Hätten wir damit mal früher angefangen.', erscheint: (w, _t, f) => f === 'vertrauen-niedrig' && !w.kurz, setztVoraus: (w) => w.falle },
    // O-62 (Antwort 4c): Elternvertreterin, Reporter und Ratsmitglied sprechen als Erzählzeilen (ohne Figur) beziehungsweise in der Zeile der Projektsteuerin
    { was: 'Projektsteuerin mit Ratsmitglied, Grundzeile', text: zeileVon(e.szene, 'faden'), anfang: 'Alles Offene ist übergeben, mit Namen und Termin. Verschwunden ist nichts. Das Ratsmitglied hat im Buch nachgesehen: Es stand alles drin.', erscheint: (w, _t, f) => f !== 'nach-falle' && f !== 'vertrauen-niedrig' && !w.kurz, setztVoraus: () => true },
    { was: 'Projektsteuerin nach einer Falle', text: zeileVon(e.nachFalle, 'faden'), anfang: 'Alles Offene ist übergeben, mit Namen und Termin. Das Ratsmitglied liest das Buch gern; wo etwas fehlt, fragt es weiter nach.', erscheint: (w, _t, f) => f === 'nach-falle' && !w.kurz, setztVoraus: (w) => w.falle },
    { was: 'Projektsteuerin, Vertrauen niedrig', text: zeileVon(e.vertrauenNiedrig, 'faden'), anfang: 'Alles Offene ist übergeben, mit Namen und Termin. Das Ratsmitglied liest das Buch gern; wo etwas fehlt, fragt es weiter nach.', erscheint: (w, _t, f) => f === 'vertrauen-niedrig' && !w.kurz, setztVoraus: (w) => w.falle },
    { was: 'Elternvertreterin im Ende', text: erzaehlt(e.szene, 'Die Vorsitzende des Elternbeirats'), anfang: 'Die Vorsitzende des Elternbeirats lächelt: „Und mein Jüngster? Der sitzt heute im neuen Raum', erscheint: (w) => !w.kurz, setztVoraus: () => true },
    { was: 'Reporter im Ende', text: erzaehlt(e.szene, 'Der Reporter'), anfang: 'Der Reporter hebt den Fotoapparat: „Die Glocke läutet. Das schreibe ich genau so auf.“', erscheint: (w) => !w.kurz, setztVoraus: () => true },
    { was: 'Projektsteuerin am Ende', text: zeileVon(e.szene, 'faden'), anfang: 'Alles Offene ist übergeben, mit Namen und Termin.', erscheint: () => true, setztVoraus: () => true },
  ];
}

/** Alle Verstöße: Text erscheint auf einem Endzustand, dessen Wahl er nicht deckt. */
function verstoesse(typVon: (w: Ende) => BilanzTyp, fassungVon: (w: Ende) => EndeFassung): string[] {
  const liste = proben();
  const aus: string[] = [];
  for (const w of ENDEN) {
    const t = typVon(w);
    const f = fassungVon(w);
    for (const p of liste) if (p.erscheint(w, t, f) && !p.setztVoraus(w)) aus.push(`${p.was} auf Weg ${w.kurz ? 'kurz ' : ''}${w.weg}`);
  }
  return aus;
}

const echterTyp = (w: Ende): BilanzTyp => bilanzTyp(w.b, w.falle);
const echteFassung = (w: Ende): EndeFassung => w.fassung;

test('Jeder erreichbare Endzustand (lang und Kurzfassung): jeder Bilanz- und Ende-Text deckt sich mit den gewählten Antworten', () => {
  assert.ok(ENDEN.length > 100, `nur ${ENDEN.length} Endzustände`);
  assert.ok(ENDEN.some((e) => e.kurz) && ENDEN.some((e) => !e.kurz));
  // Balken immer in 0–10, Sicht = Bilanz-Typ der Balken (ohne offene Kapitel)
  for (const e of ENDEN) {
    for (const b of BALKEN) assert.ok(e.b[b] >= 0 && e.b[b] <= 10, `${e.weg}: Balken ${b} = ${e.b[b]}`);
    assert.equal(e.sicht, echterTyp(e), `${e.weg}: Bilanz-Sicht`);
  }
  const v = verstoesse(echterTyp, echteFassung);
  assert.deepEqual(v.slice(0, 10), [], `${v.length} Verstöße`);
});

test('Jeder geprüfte Text ist mit seinem Anfang festgehalten (Textänderung → Voraussetzung neu prüfen)', () => {
  for (const p of proben()) assert.ok(p.text.startsWith(p.anfang), `${p.was}: „${p.text.slice(0, 80)}…“ – Voraussetzung in tests/geschichte-wege.test.ts neu prüfen`);
});

test('Gegenprobe: die frühere Regel (ruhig auch nach Falle, eine Schlusszeile für alle) verstößt auf vielen Wegen', () => {
  const alt = verstoesse((w) => bilanzTyp(w.b, false), (w) => (stufe(w.b.vertrauen) === 'niedrig' ? 'vertrauen-niedrig' : 'grund'));
  assert.ok(alt.some((x) => x.startsWith('Bilanz „Ruhig ins Ziel“')), 'ruhig nach Falle wird nicht erkannt');
  assert.ok(alt.some((x) => x.startsWith('Bürgermeisterin, Grundzeile')), 'Grundzeile nach Falle wird nicht erkannt');
});

test('„Mit Umwegen“: jede andere als die gute Antwort kostet in mindestens einem Balken mehr als die gute', () => {
  for (const k of G.kapitel) for (const a of k.antworten) {
    if (a.wertung === 'gut') continue;
    assert.ok(BALKEN.some((b) => a.wirkung[b] < gute(k).wirkung[b]), `${k.id} ${a.wertung} kostet nichts gegenüber der guten Antwort`);
  }
});

test('Musterwege behalten ihre Bilanz: gut → ruhig, vertretbar → letzte Meter, Falle → nicht getragen; Verteilung über alle Endzustände', () => {
  const nach = (kurz: boolean, w: string) => bilanzAmEnde(G, standZuWeg(G, kurz, G.kapitel.map((k) => (kurz && !k.kurzfassung ? '-' : w)).join('')));
  assert.equal(nach(false, 'g'), 'ruhig');
  assert.equal(nach(false, 'v'), 'letzte-meter');
  assert.equal(nach(false, 'f'), 'nicht-getragen');
  assert.equal(nach(true, 'g'), 'ruhig');
  // jeder Typ kommt auf langen Wegen vor
  const typen = new Set(ENDEN.filter((w) => !w.kurz).map(echterTyp));
  assert.deepEqual([...typen].sort(), ['letzte-meter', 'nicht-getragen', 'ruhig', 'umwege']);
});

/* --------------------------------------------- Kurzfassung: Bilanz und Antwortlage -- */

/**
 * R79: In der Kurzfassung zählen nur die vier gespielten Kapitel (übersprungene wie die gute Antwort). Der Bilanztext darf auf
 * allen 81 Kurzwegen nie der Antwortlage widersprechen: nur gute Antworten ⇒ nie „mit Umwegen“, immer „ruhig“;
 * eine gewählte Falle ⇒ nie „ruhig“; „mit Umwegen“ nur mit mindestens einer nicht guten Antwort. Alte Wahlen in
 * übersprungenen Kapiteln (z. B. nach einem langen Weg) ändern nichts.
 */
test('Kurzfassung, alle 81 Wege: Bilanz widerspricht nie den gespielten Antworten (auch mit alten Wahlen in übersprungenen Kapiteln)', () => {
  const kurzKap = wegKapitel(G, true);
  const uebersprungen = G.kapitel.filter((k) => !kurzKap.includes(k));
  assert.equal(kurzKap.length, 4);
  assert.ok(uebersprungen.length > 0);
  const kurzeWege = alleKurzWege();
  assert.equal(kurzeWege.length, 81);
  let nurGute = 0;
  for (const w of kurzeWege) {
    const gespielt = kurzKap.map((k) => w.wahl.get(k.id) as Antwort);
    const alleGut = gespielt.every((a) => a.wertung === 'gut');
    const hatFalle = gespielt.some((a) => a.wertung === 'falle');
    // dieselben Wege, aber mit Fallen-Wahlen aus einem früheren langen Weg in den übersprungenen Kapiteln
    let alt = w.stand;
    for (const k of uebersprungen) alt = waehle(G, alt, k.id, k.antworten.findIndex((a) => a.wertung === 'falle'));
    for (const stand of [w.stand, alt]) {
      const typ = bilanzAmEnde(G, stand);
      assert.deepEqual(balken(G, stand, { ort: 'ende' }), w.b, `${w.name}: alte Wahlen verändern die Balken`);
      if (alleGut) { nurGute += 1; assert.equal(typ, 'ruhig', `${w.name}: nur gute Antworten, Bilanz ${typ}`); }
      if (typ === 'umwege') assert.ok(gespielt.some((a) => a.wertung !== 'gut'), `${w.name}: „mit Umwegen“ ohne nicht gute Antwort`);
      if (hatFalle) assert.notEqual(typ, 'ruhig', `${w.name}: „ruhig“ trotz Falle`);
    }
  }
  assert.equal(nurGute, 2, 'genau ein Weg mit nur guten Antworten (zweimal geprüft)');
});

/* ------------------------------------------------- Wege mit offenen Kapiteln -- */

/**
 * R73: Über die Fortschrittslinie kommt man ohne alle Antworten ans Ende (L-232). Je Kapitel offen, gut, vertretbar oder
 * Falle: 4^8 = 65.536 lange Wege und 4^4 = 256 der Kurzfassung. Mit offenem Kapitel gibt es kein Urteil über den Weg
 * (Bilanz „offen“, keine Grundzeile „Ich wusste jedes Mal …“); vollständige Wege behalten ihren Bilanz-Typ.
 */
test('Endzustände mit offenen Kapiteln: Bilanz „offen“, nie ein Urteil über Antworten, die es nicht gibt', () => {
  for (const kurz of [false, true]) {
    const enden = endZustaende(G, kurz, true);
    assert.ok(enden.some((e) => e.offen) && enden.some((e) => !e.offen), `${kurz ? 'kurz' : 'lang'}: offene und vollständige Zustände`);
    for (const e of enden) {
      const wo = `${kurz ? 'kurz' : 'lang'} ${e.weg}`;
      if (e.offen) {
        assert.equal(e.sicht, 'offen', `${wo}: offen, Bilanz ${e.sicht}`);
        assert.notEqual(e.fassung, 'grund', `${wo}: Grundzeile trotz offener Kapitel`);
        if (!e.falle && stufe(e.b.vertrauen) !== 'niedrig') assert.equal(e.fassung, 'offen', wo);
      } else {
        assert.equal(e.sicht, bilanzTyp(e.b, e.falle), wo);
      }
    }
  }
  // der neutrale Text urteilt nicht und ist festgehalten
  assert.ok(G.bilanz.offen.html.startsWith('Der Campus steht, die Kinder sind da. Ein Urteil über Ihren Weg gibt es erst'));
  assert.ok((G.ende.offen.find((z) => z.figur === 'grundstein')?.html ?? '').startsWith('Geschafft haben wir es. Was Sie unterwegs noch nicht entschieden haben'));
});

test('Gegenprobe offene Kapitel: ohne die Regel zeigte „nur Kapitel 1 gut“ ein Urteil („mit Umwegen“)', () => {
  const k1 = G.kapitel[0] as Kapitel;
  const s = { ...waehle(G, neuerStand(), k1.id, k1.antworten.findIndex((a) => a.wertung === 'gut')), schritt: { ort: 'ende' as const } };
  assert.equal(bilanzTyp(balken(G, s, { ort: 'ende' }), falleGewaehlt(G, s)), 'umwege', 'die alte Rechnung hätte geurteilt');
  assert.equal(bilanzAmEnde(G, s), 'offen');
});

/* ---------------------------------------------------------- Antwortlängen -- */

const woerter = (html: string): number => html.replace(/<[^>]+>/gu, ' ').split(/\s+/u).filter((x) => /\p{L}/u.test(x)).length;

/** Befunde zur Länge: die gute Antwort höchstens 1,25-mal so lang wie die längste andere, alle drei höchstens 1,5-mal die kürzeste. */
function laengenBefunde(g: Geschichte): string[] {
  const aus: string[] = [];
  for (const k of g.kapitel) {
    const n = k.antworten.map((a) => woerter(a.html));
    const gut = woerter(gute(k).html);
    const andere = Math.max(...k.antworten.filter((a) => a.wertung !== 'gut').map((a) => woerter(a.html)));
    if (gut > 1.25 * andere) aus.push(`${k.id}: gute Antwort ${gut} Wörter, längste andere ${andere}`);
    if (Math.max(...n) > 1.5 * Math.min(...n)) aus.push(`${k.id}: Spanne ${Math.min(...n)}–${Math.max(...n)} Wörter`);
  }
  return aus;
}

/**
 * P19.6 (L-350): Die sechs neuen Stationen stehen im Wortlaut des Drehbuchs; dort sind in s4, s6, s9, s11 und s13 die guten Antworten
 * länger als die anderen. Die Sprachprüfung der Entwürfe (P19.8) gleicht sie an; bis dahin ist der Stand festgehalten: Jeder neue
 * Befund lässt den Test rot werden, jeder behobene verlangt, ihn hier zu streichen. Die acht Stationen s1, s2, s3, s5, s7, s8, s10, s12 und s14 haben keinen.
 */
const BEKANNTE_LAENGEN_P196: readonly string[] = [
  's4: gute Antwort 25 Wörter, längste andere 19', 's4: Spanne 12–25 Wörter',
  's6: gute Antwort 31 Wörter, längste andere 21', 's6: Spanne 19–31 Wörter',
  's9: gute Antwort 20 Wörter, längste andere 15',
  's11: gute Antwort 25 Wörter, längste andere 19', 's11: Spanne 15–25 Wörter',
  's13: Spanne 11–17 Wörter',
];

test('Antwortlängen: die gute Antwort verrät sich nicht durch Länge (je Kapitel ähnlich lang) – bis auf den festgehaltenen Stand der neuen Stationen', () => {
  assert.deepEqual(laengenBefunde(G), BEKANNTE_LAENGEN_P196);
  const stationen = new Set(BEKANNTE_LAENGEN_P196.map((x) => x.split(':')[0]));
  assert.deepEqual([...stationen].sort(), ['s11', 's13', 's4', 's6', 's9'], 'nur neue Stationen');
});

test('Gegenprobe Antwortlängen: eine doppelt so lange gute Antwort wird gemeldet', () => {
  const g = structuredClone(G);
  const k = g.kapitel[4] as Kapitel;
  const a = k.antworten.find((x) => x.wertung === 'gut') as Antwort;
  a.html = `${a.html} ${a.html}`;
  assert.ok(laengenBefunde(g).some((x) => x.startsWith(`${k.id}: gute Antwort`)));
});

/* ------------------------------------------------------------- Textwüsten -- */

/** Absätze über 60 Wörter in Einstiegen, Folgen und „So macht man es gut“ (O-53: keine Textwüsten). */
function wuesten(g: Geschichte): string[] {
  const aus: string[] = [];
  const pruefe = (wo: string, html: string | null): void => {
    for (const absatz of (html ?? '').split(/<\/p>/u)) if (woerter(absatz) > 60) aus.push(`${wo}: ${woerter(absatz)} Wörter`);
  };
  for (const k of g.kapitel) {
    pruefe(`${k.id} einstieg`, k.einstiegHtml);
    pruefe(`${k.id} gut`, k.gutHtml);
    for (const a of k.antworten) pruefe(`${k.id} folge ${a.wertung}`, a.folgeHtml);
    if (k.vergleich) pruefe(`${k.id} empfehlung`, k.vergleich.empfehlungHtml);
  }
  pruefe('ende einstieg', g.ende.einstiegHtml);
  return aus;
}

test('Keine Textwüsten: kein Absatz der Story über 60 Wörter; Gegenprobe mit einem verdoppelten Absatz', () => {
  assert.deepEqual(wuesten(G), []);
  const g = structuredClone(G);
  const k = g.kapitel[0] as Kapitel;
  const a = k.antworten[0] as Antwort;
  a.folgeHtml = `<p>${a.folgeHtml.replace(/<\/?p>/gu, ' ').repeat(3)}</p>`;
  assert.ok(wuesten(g).some((x) => x.startsWith(`${k.id} folge`)));
});
