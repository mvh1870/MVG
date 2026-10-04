/*
 * Jeder Bilanz- und Ende-Text stimmt auf jedem Weg (R72, L-239): Die Story hat 3^8 = 6.561 lange Wege und 3^4 = 81
 * Wege der Kurzfassung. Für jeden Text, der am Ende erscheinen kann, steht hier, was er über die gewählten Antworten
 * voraussetzt; der Test rechnet alle Wege mit der Engine durch und meldet jeden Weg, auf dem ein Text erscheint, dessen
 * Voraussetzung nicht erfüllt ist. Jeder Text ist mit seinem Anfang festgehalten: Wer ihn ändert, muss hier die
 * Voraussetzung neu prüfen. Dazu die Antwortlängen (die gute Antwort darf sich nicht durch Länge verraten).
 * Gegenproben: die frühere Regel („ruhig“ auch nach einer Falle, eine Schlusszeile für alle) wird hier rot.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { inhalte } from '../src/inhalte/index.ts';
import { balken, bilanzAmEnde, bilanzTyp, endeFassung, falleGewaehlt, gewaehlteAntwort, neuerStand, stufe, waehle, wegKapitel, type Balkenstand, type EndeFassung, type Stand } from '../src/geschichte/engine.ts';
import type { Antwort, BalkenId, BilanzTyp, Geschichte, Kapitel, Wertung } from '../src/geschichte/typen.ts';
import { BALKEN } from '../src/geschichte/typen.ts';

const G0 = inhalte.geschichte;
assert.ok(G0, 'Story fehlt in den Inhalten');
const G: Geschichte = G0;
const WERTUNGEN: readonly Wertung[] = ['gut', 'vertretbar', 'falle'];

/** Ein durchgerechneter Weg: Wahl je Kapitel (zählend), Balken am Ende, Falle ja/nein. */
interface Weg { name: string; stand: Stand; wahl: Map<string, Antwort>; b: Balkenstand; falle: boolean }

function alleWege(kurz: boolean): Weg[] {
  const kap = wegKapitel(G, kurz);
  const aus: Weg[] = [];
  for (let i = 0; i < 3 ** kap.length; i++) {
    let s = neuerStand(kurz);
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
    aus.push({ name: `${kurz ? 'kurz ' : ''}${name}`, stand: s, wahl, b: balken(G, s, { ort: 'ende' }), falle: falleGewaehlt(G, s) });
  }
  return aus;
}

const WEGE = [...alleWege(false), ...alleWege(true)];

const gute = (k: Kapitel): Antwort => k.antworten.find((a) => a.wertung === 'gut') as Antwort;
const kap = (id: string): Kapitel => G.kapitel.find((k) => k.id === id) as Kapitel;
/** auf dem Weg eine Antwort, die diesen Balken stärker senkt (bzw. weniger hebt) als die gute */
const teurerAlsGut = (w: Weg, b: BalkenId): boolean => [...w.wahl].some(([id, a]) => a.wirkung[b] < gute(kap(id)).wirkung[b]);
const nichtGut = (w: Weg): boolean => [...w.wahl.values()].some((a) => a.wertung !== 'gut');
/** Antworten, nach denen die Bürgermeisterin etwas zu spät oder auf Umwegen erfährt (laut ihrer Folge) */
const SPAET = new Set(['k1 falle', 'k3 falle', 'k3 vertretbar', 'k4 falle', 'k4 vertretbar', 'k5 falle', 'k6 falle', 'k7 falle', 'k8 falle']);
const spaet = (w: Weg): number => [...w.wahl].filter(([id, a]) => SPAET.has(`${id} ${a.wertung}`)).length;
const mitFalleIn = (w: Weg, ...ids: string[]): boolean => ids.some((id) => w.wahl.get(id)?.wertung === 'falle');

/** Text, Anfang des Texts (festgehalten), wann er erscheint, was er voraussetzt. */
interface Probe { was: string; text: string; anfang: string; erscheint: (w: Weg, typ: BilanzTyp, f: EndeFassung) => boolean; setztVoraus: (w: Weg) => boolean }

function zeileVon(liste: readonly { figur: string | null; html: string }[], figur: string): string {
  return liste.find((z) => z.figur === figur)?.html ?? '';
}

function proben(): Probe[] {
  const bl = (id: BalkenId) => G.balken.find((b) => b.id === id) as Geschichte['balken'][number];
  const e = G.ende;
  return [
    { was: 'Bilanz „Ruhig ins Ziel“', text: G.bilanz.ruhig.html, anfang: 'Die Kinder sind pünktlich eingezogen, und jede große Entscheidung hat die Bürgermeisterin selbst getroffen', erscheint: (_w, t) => t === 'ruhig', setztVoraus: (w) => !w.falle },
    { was: 'Bilanz „mit Umwegen“', text: G.bilanz.umwege.html, anfang: 'Der Campus steht, die Kinder sind da – aber nicht jede Ihrer Antworten war der gerade Weg', erscheint: (_w, t) => t === 'umwege', setztVoraus: nichtGut },
    { was: 'Bilanz „Auf den letzten Metern“', text: G.bilanz['letzte-meter'].html, anfang: 'Die Schule hat geöffnet, aber der Puffer war am Ende aufgebraucht. Wer eine Frage liegen lässt', erscheint: (_w, t) => t === 'letzte-meter', setztVoraus: (w) => teurerAlsGut(w, 'zeit') },
    { was: 'Bilanz „nicht getragen“', text: G.bilanz['nicht-getragen'].html, anfang: 'Die Gebäude stehen, doch das Vertrauen hat gelitten: Zu oft lief es anders, als die Bürgermeisterin es von Ihnen erwarten durfte.', erscheint: (_w, t) => t === 'nicht-getragen', setztVoraus: (w) => [...w.wahl.values()].filter((a) => a.wertung !== 'gut').length >= 2 },
    // Geld hoch: „jedes Mal von der Bürgermeisterin entschieden“, „dort eingesetzt, wo sie gebraucht wurde“ – nicht nach umsonst geplanter Mensa (4) oder unverglichenem Preis (7)
    { was: 'Geld hoch', text: bl('geld').bilanz.hoch, anfang: 'Die Reserve wurde dort eingesetzt, wo sie gebraucht wurde', erscheint: (w) => stufe(w.b.geld) === 'hoch', setztVoraus: (w) => !mitFalleIn(w, 'k4', 'k7') },
    { was: 'Geld mittel', text: bl('geld').bilanz.mittel, anfang: 'Ein großer Teil der Reserve ist verbraucht; manches wurde teurer als nötig.', erscheint: (w) => stufe(w.b.geld) === 'mittel', setztVoraus: (w) => teurerAlsGut(w, 'geld') },
    { was: 'Geld niedrig', text: bl('geld').bilanz.niedrig, anfang: 'Die Reserve ist fast aufgebraucht; jeder Umweg hat sie ein Stück kleiner gemacht.', erscheint: (w) => stufe(w.b.geld) === 'niedrig', setztVoraus: (w) => teurerAlsGut(w, 'geld') },
    // Zeit und Vertrauen beschreiben nur den Stand des Balkens – keine Voraussetzung über eine Wahl
    { was: 'Zeit hoch', text: bl('zeit').bilanz.hoch, anfang: 'Der Puffer hat gehalten', erscheint: (w) => stufe(w.b.zeit) === 'hoch', setztVoraus: () => true },
    { was: 'Zeit mittel', text: bl('zeit').bilanz.mittel, anfang: 'Der Puffer war am Ende dünn, aber er hat gereicht.', erscheint: (w) => stufe(w.b.zeit) === 'mittel', setztVoraus: (w) => teurerAlsGut(w, 'zeit') },
    { was: 'Zeit niedrig', text: bl('zeit').bilanz.niedrig, anfang: 'Der Puffer ist aufgebraucht; die Sporthalle öffnet erst nach den Herbstferien.', erscheint: (w) => stufe(w.b.zeit) === 'niedrig', setztVoraus: () => true },
    { was: 'Vertrauen hoch', text: bl('vertrauen').bilanz.hoch, anfang: 'Bürgermeisterin, Schule und Stadtrat verlassen sich inzwischen auf das, was Sie vorlegen.', erscheint: (w) => stufe(w.b.vertrauen) === 'hoch', setztVoraus: () => true },
    { was: 'Vertrauen mittel', text: bl('vertrauen').bilanz.mittel, anfang: 'Man vertraut Ihnen – fragt aber gern noch einmal nach.', erscheint: (w) => stufe(w.b.vertrauen) === 'mittel', setztVoraus: () => true },
    { was: 'Vertrauen niedrig', text: bl('vertrauen').bilanz.niedrig, anfang: 'Die Bürgermeisterin lässt sich inzwischen jede Zahl zweimal zeigen.', erscheint: (w) => stufe(w.b.vertrauen) === 'niedrig', setztVoraus: () => true },
    // Schlusszeilen
    { was: 'Bürgermeisterin, Grundzeile', text: zeileVon(e.szene, 'grundstein'), anfang: 'Wissen Sie, was das Beste war? Ich wusste jedes Mal, worüber ich entscheide.', erscheint: (_w, _t, f) => f === 'grund', setztVoraus: (w) => !w.falle },
    { was: 'Bürgermeisterin nach einer Falle', text: zeileVon(e.nachFalle, 'grundstein'), anfang: 'Geschafft haben wir es. Aber nicht jedes Mal lief es so, wie es hätte laufen sollen', erscheint: (_w, _t, f) => f === 'nach-falle', setztVoraus: (w) => w.falle },
    { was: 'Bürgermeisterin, Vertrauen niedrig', text: zeileVon(e.vertrauenNiedrig, 'grundstein'), anfang: 'Beim nächsten Projekt reden wir früher miteinander.', erscheint: (_w, _t, f) => f === 'vertrauen-niedrig', setztVoraus: (w) => spaet(w) >= 1 },
    { was: 'Bauleiter, Grundzeile', text: zeileVon(e.szene, 'lot'), anfang: 'Steht alles drin, was wir hier gemacht haben.', erscheint: (w, _t, f) => f !== 'vertrauen-niedrig' && !w.stand.kurz, setztVoraus: () => true },
    { was: 'Bauleiter, Vertrauen niedrig', text: zeileVon(e.vertrauenNiedrig, 'lot'), anfang: 'Steht inzwischen alles drin. Hätten wir mal früher damit angefangen.', erscheint: (w, _t, f) => f === 'vertrauen-niedrig' && !w.stand.kurz, setztVoraus: (w) => w.falle },
    { was: 'Projektsteuerin am Ende', text: zeileVon(e.szene, 'faden'), anfang: 'Alles Offene ist übergeben, mit Namen und Termin.', erscheint: () => true, setztVoraus: () => true },
  ];
}

/** Alle Verstöße: Text erscheint auf einem Weg, dessen Wahl er nicht deckt. */
function verstoesse(typVon: (w: Weg) => BilanzTyp, fassungVon: (w: Weg) => EndeFassung): string[] {
  const liste = proben();
  const aus: string[] = [];
  for (const w of WEGE) {
    const t = typVon(w);
    const f = fassungVon(w);
    for (const p of liste) if (p.erscheint(w, t, f) && !p.setztVoraus(w)) aus.push(`${p.was} auf Weg ${w.name}`);
  }
  return aus;
}

const echterTyp = (w: Weg): BilanzTyp => bilanzTyp(w.b, w.falle);
const echteFassung = (w: Weg): EndeFassung => endeFassung(G, w.stand);

test('Alle 6.561 + 81 Wege: jeder Bilanz- und Ende-Text deckt sich mit den gewählten Antworten', () => {
  assert.equal(WEGE.length, 6561 + 81);
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

test('Musterwege behalten ihre Bilanz: gut → ruhig, vertretbar → letzte Meter, Falle → nicht getragen; Verteilung über alle Wege', () => {
  const nach = (name: string) => WEGE.find((w) => w.name === name) as Weg;
  assert.equal(echterTyp(nach('gggggggg')), 'ruhig');
  assert.equal(echterTyp(nach('vvvvvvvv')), 'letzte-meter');
  assert.equal(echterTyp(nach('ffffffff')), 'nicht-getragen');
  assert.equal(echterTyp(nach('kurz gggg')), 'ruhig');
  // jeder Typ kommt auf langen Wegen vor
  const typen = new Set(WEGE.filter((w) => !w.stand.kurz).map(echterTyp));
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
  const kurzeWege = WEGE.filter((w) => w.stand.kurz);
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
test('Wege mit offenen Kapiteln: Bilanz „offen“, nie ein Urteil über Antworten, die es nicht gibt', () => {
  const MIT_OFFEN = ['offen', ...WERTUNGEN] as const;
  let geprueft = 0;
  for (const kurz of [false, true]) {
    const liste = wegKapitel(G, kurz);
    for (let i = 0; i < 4 ** liste.length; i++) {
      let s = neuerStand(kurz);
      let x = i;
      let offen = 0;
      for (const k of liste) {
        const w = MIT_OFFEN[x % 4] ?? 'offen';
        x = Math.floor(x / 4);
        if (w === 'offen') { offen += 1; continue; }
        s = waehle(G, s, k.id, k.antworten.findIndex((a) => a.wertung === w));
      }
      s = { ...s, schritt: { ort: 'ende' } };
      const typ = bilanzAmEnde(G, s);
      const f = endeFassung(G, s);
      const b = balken(G, s, { ort: 'ende' });
      const falle = falleGewaehlt(G, s);
      if (offen > 0) {
        assert.equal(typ, 'offen', `Weg ${i} (${kurz ? 'kurz' : 'lang'}): ${offen} offen, Bilanz ${typ}`);
        assert.notEqual(f, 'grund', `Weg ${i}: Grundzeile trotz offener Kapitel`);
        if (!falle && stufe(b.vertrauen) !== 'niedrig') assert.equal(f, 'offen');
      } else {
        assert.equal(typ, bilanzTyp(b, falle));
      }
      geprueft += 1;
    }
  }
  assert.equal(geprueft, 4 ** 8 + 4 ** 4);
  // der neutrale Text urteilt nicht und ist festgehalten
  assert.ok(G.bilanz.offen.html.startsWith('Der Campus steht, die Kinder sind da. Ein Urteil über Ihren Weg gibt es erst'));
  assert.ok((G.ende.offen.find((z) => z.figur === 'grundstein')?.html ?? '').startsWith('Geschafft haben wir es – und was unterwegs offen geblieben ist'));
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

test('Antwortlängen: die gute Antwort verrät sich nicht durch Länge (je Kapitel ähnlich lang)', () => {
  assert.deepEqual(laengenBefunde(G), []);
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
