/*
 * Sichtbarer Text (P16.1, O-38, O-39, O-42): jede Fläche der Seite im DOM gezeichnet – Start, alle Themen (Bildschirm
 * und Druck), jeder Schritt der Story mit jeder Option, alle Explore-Werkzeuge, Leinwand – und gegen die Liste der
 * sichtbar verbotenen Wörter geprüft (werkzeuge/sichtbar.mjs). Geprüft werden Text und die Attribute, die Menschen
 * lesen oder hören (aria-label, title, alt, placeholder).
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { SICHTBAR_ARBEITSSTAND, sichtbarVerboten } from '../werkzeuge/sichtbar.mjs';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///index.html' });
const g = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLParagraphElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) g[k] = (dom.window as unknown as Record<string, unknown>)[k];
after(() => dom.window.close());

const { inhalte } = await import('../src/inhalte/index.ts');
const { baueStart } = await import('../src/ui/flaechen/start.ts');
const { baueTheorie, themen, themaFuerDruck, themaTitel } = await import('../src/ui/flaechen/theorie.ts');
const { baueExplore, WERKZEUGE } = await import('../src/ui/flaechen/explore.ts');
const { baueSchritt, leisteOben } = await import('../src/ui/flaechen/geschichte.ts');
const { schritte, neuerStand, waehle } = await import('../src/geschichte/engine.ts');
const { W } = await import('../src/ui/woerter.ts');

/** Was ein Mensch liest oder hört. */
function lesbar(el: Element): string {
  // Textknoten einzeln, mit Leerraum getrennt: textContent klebt Bildunterschrift und Nachbar zusammen („BauherrnAbweichungen“)
  const teile: string[] = [];
  const tw = document.createTreeWalker(el, 4 /* NodeFilter.SHOW_TEXT */);
  for (let n = tw.nextNode(); n !== null; n = tw.nextNode()) teile.push(n.textContent ?? '');
  for (const x of el.querySelectorAll('[aria-label],[title],[alt],[placeholder]')) {
    for (const a of ['aria-label', 'title', 'alt', 'placeholder']) teile.push(x.getAttribute(a) ?? '');
  }
  return teile.join('\n');
}

function pruefe(funde: string[], wo: string, el: Element): void {
  for (const f of sichtbarVerboten(lesbar(el))) funde.push(`${wo}: ${f}`);
}

test('Start und Rahmen', () => {
  const funde: string[] = [];
  pruefe(funde, 'start', baueStart({ startseite: inhalte.startseite, themenAnzahl: 16, kapitelAnzahl: 8, werkzeugAnzahl: WERKZEUGE.length, weiterlesen: false, bedienbar: true }));
  assert.deepEqual(funde, []);
});

test('Theorie: Übersicht, jedes Thema am Bildschirm und im Druck', () => {
  const funde: string[] = [];
  pruefe(funde, 'theorie', baueTheorie({ inhalte, thema: null, version: 'Fassung', bedienbar: true }));
  for (const t of themen(inhalte)) {
    pruefe(funde, t.thema, baueTheorie({ inhalte, thema: t.thema, version: 'Fassung', bedienbar: true }));
    pruefe(funde, `${t.thema} (Druck)`, themaFuerDruck(inhalte, t.thema, 'Fassung'));
  }
  assert.deepEqual(funde.slice(0, 40), [], `${funde.length} Funde`);
});

test('Story: jeder Schritt auf beiden Wegen, jede Antwort mit ihrer Folge, Mini-Aufgaben ausgewertet, jede Bilanz', () => {
  const geschichte = inhalte.geschichte;
  assert.ok(geschichte);
  const funde: string[] = [];
  const themaVon = (id: string): string | null => themaTitel(inhalte, id);
  const zeichne = (stand: ReturnType<typeof neuerStand>, wo: string): void => {
    const el = document.createElement('div');
    el.append(...leisteOben(geschichte, stand, true, () => undefined), baueSchritt({ g: geschichte, stand, bedienbar: true, themaTitel: themaVon, tue: () => undefined }));
    pruefe(funde, wo, el);
  };
  for (const wertung of ['gut', 'vertretbar', 'falle']) {
    for (const kurz of [false, true]) {
      let stand = neuerStand(kurz);
      for (const k of geschichte.kapitel) stand = waehle(geschichte, stand, k.id, k.antworten.findIndex((a) => a.wertung === wertung));
      // Mini-Aufgaben vollständig beantwortet (zuordnen: immer die erste Wahl; Reihenfolge: in der gezeigten Folge)
      const mini: Record<string, number[]> = {};
      for (const k of geschichte.kapitel) if (k.mini !== null) mini[k.id] = k.mini.art === 'zuordnen' ? k.mini.posten.map(() => 0) : k.mini.posten.map((_, i) => i).reverse();
      stand = { ...stand, mini };
      for (const schritt of schritte(geschichte, kurz)) zeichne({ ...stand, schritt }, `${wertung}${kurz ? ' kurz' : ''} ${JSON.stringify(schritt)}`);
    }
  }
  assert.deepEqual([...new Set(funde)].slice(0, 40), [], `${funde.length} Funde`);
});

test('Explore: alle Werkzeuge, alle Vorgangsarten', () => {
  const funde: string[] = [];
  for (const id of WERKZEUGE) {
    const el = baueExplore({ inhalte, werkzeug: id, bedienbar: true });
    pruefe(funde, id, el);
    if (id === 'vorgaenge') {
      for (const k of el.querySelectorAll<HTMLElement>('.ex-art')) {
        k.click();
        pruefe(funde, `vorgaenge ${k.dataset['art'] ?? ''}`, el);
      }
    }
  }
  assert.deepEqual(funde.slice(0, 40), [], `${funde.length} Funde`);
});

test('Bedienwörter (src/ui/woerter.ts)', () => {
  const funde: string[] = [];
  const lauf = (x: unknown, pfad: string): void => {
    if (typeof x === 'string') for (const f of sichtbarVerboten(x)) funde.push(`${pfad}: ${f}`);
    else if (typeof x === 'function') {
      try { lauf((x as (...a: unknown[]) => unknown)(1, 1, 1, 1, 1), pfad); } catch { /* Funktion mit anderer Signatur */ }
    } else if (x !== null && typeof x === 'object') for (const [k, v] of Object.entries(x)) lauf(v, `${pfad}.${k}`);
  };
  lauf(W, 'W');
  assert.deepEqual(funde.slice(0, 40), [], `${funde.length} Funde`);
});

test('Arbeitsstand (P17.10, O-56): die Probe schlägt bei Werkstatt-Resten an, nicht bei Fachtext', () => {
  // Gegenprobe: jede Art, die P17.10 entfernt hat, wird gefunden – und zwar genau von ihrem Muster (r72: jede Probe
  // trifft nur ein Muster, damit keines ungetestet bleibt, weil ein anderes zugleich anschlägt)
  const proben: [string, string][] = [
    ['Abweichungen vom Text (8)', 'Abweichung vom Text'], ['Wo die Abbildung vom Text abweicht, gilt der Text.', 'Abweichung vom Text'],
    ['der Text nennt acht Bausteine', 'Meta-Satz „der Text …“'], ['Im Bild steht „Steuerungslogik“.', 'Meta-Satz „das Bild …“'],
    ['Das Bild zeigt fünf Spalten.', 'Meta-Satz „das Bild …“'], ['Im Bild an die Begriffe des Texts angeglichen: „LPH 0–2“', 'Angleichung des Bilds'],
    ['nach L-121', 'Entscheidungskennung L-/O-'], ['O-56', 'Entscheidungskennung L-/O-'], ['R41', 'Prüfrunde R…'], ['P17.10', 'Posten P…'],
    ['vom Prüf-Agenten gesehen', 'Prüf-Agent'], ['Belegstelle im Handbuch', 'Beleg'], ['mit zwei Belegen', 'Beleg'], ['Quelle: Handbuch', 'Quelle:'],
    ['nach V2.4', 'Quellenhinweis auf den Standard'], ['HB 3.2', 'Quellenhinweis auf den Standard'], ['nur intern', 'intern'], ['interne Notiz', 'intern'],
    ['TODO', 'TODO'], ['Platzhalter', 'Platzhalter'], ['Hinweis zur Bedienung', 'Bedienhinweis'],
    ['Das Werkzeug bittet um einen Eintrag.', 'Werkzeug erklärt sein Verhalten'], ['Bitte ausfüllen, damit der Bericht nicht unfertig wirkt.', 'Werkzeug erklärt sein Verhalten'],
    ['Klicken Sie sich durch.', 'Bedienungs-Anleitung'], ['Ziehen Sie den Regler.', 'Bedienungs-Anleitung'], ['Schalten Sie um und sehen Sie, was fehlt.', 'Bedienungs-Anleitung'],
  ];
  const getroffen = (text: string): string[] => [...new Set(sichtbarVerboten(text).map((f) => /^verbotenes Wort sichtbar \((.+?)\): „/u.exec(f)?.[1] ?? f))];
  for (const [rest, muster] of proben) assert.deepEqual(getroffen(`Text davor. ${rest} Text danach.`), [muster], rest);
  // jedes Muster der Liste hat mindestens eine eigene Probe
  assert.deepEqual([...new Set(SICHTBAR_ARBEITSSTAND.map(([, n]) => n))].filter((n) => !proben.some(([, m]) => m === n)), []);
  // Gegenprobe rot: ein Text ohne Rest trifft nichts, eine Probe mit zwei Resten trifft zwei Muster
  assert.deepEqual(getroffen('Text davor. Text danach.'), []);
  assert.equal(getroffen('Beleg k5.2-t1').length, 2);
  // Fachtext bleibt unbehelligt
  for (const fach of [
    'von 1 (geringe Abweichung, Nutzung nicht eingeschränkt)', 'getrennt festgehalten, mit Quelle, Datum und Bedingungen', 'Ein gemeinsamer Prüfvermerk mit Datum',
    'höchste belegte Auswirkung', 'Was jede Woche, jeden Monat und sofort geschieht, zeigt das Werkzeug Takt.', 'Hier fehlt noch ein Eintrag – oder „keine“.', 'als internetbasierter Dienst', 'RIS-014 und MAS-011', 'LPH 4', 'Wählen Sie eine Option.', 'Abbildung 3',
  ]) assert.deepEqual(sichtbarVerboten(fach), [], fach);
});

test('Arbeitsstand: Gegenprobe im DOM – ein Rest unter einer Abbildung macht die Probe rot', () => {
  const t = themen(inhalte).find((x) => baueTheorie({ inhalte, thema: x.thema, version: 'Fassung', bedienbar: true }).querySelector('figure.abbildung') !== null);
  assert.ok(t, 'ein Thema mit Abbildung');
  const el = baueTheorie({ inhalte, thema: t.thema, version: 'Fassung', bedienbar: true });
  const sauber: string[] = [];
  pruefe(sauber, t.thema, el);
  assert.deepEqual(sauber, []);
  const unterschrift = el.querySelector('figure.abbildung figcaption');
  assert.ok(unterschrift);
  unterschrift.append(Object.assign(document.createElement('details'), { textContent: 'Abweichungen vom Text (3)' }));
  const rot: string[] = [];
  pruefe(rot, t.thema, el);
  assert.ok(rot.some((f) => /Abweichung vom Text/u.test(f)), rot.join('\n'));
  // auch in einem Attribut (aria-label), das nur Screenreader vorlesen
  const el2 = baueTheorie({ inhalte, thema: t.thema, version: 'Fassung', bedienbar: true });
  el2.querySelector('figure.abbildung')?.setAttribute('aria-label', 'Abbildung vergrößern – Prüfvermerk R11');
  const rot2: string[] = [];
  pruefe(rot2, t.thema, el2);
  assert.ok(rot2.some((f) => /Prüfrunde/u.test(f)), rot2.join('\n'));
});

test('Abbildungen (O-55, O-56): nur Marke und Titel – kein „Vergrößern“, kein Dialog, keine Abweichungen', () => {
  for (const t of themen(inhalte)) {
    const el = baueTheorie({ inhalte, thema: t.thema, version: 'Fassung', bedienbar: true });
    for (const f of el.querySelectorAll('figure.abbildung')) {
      assert.equal(f.querySelectorAll('button, dialog, details').length, 0, `${t.thema}: Bedienelement in der Abbildung`);
      assert.deepEqual([...f.querySelectorAll('figcaption > *')].map((x) => x.className), ['t-label abbildung-marke', 'abbildung-titel'], t.thema);
      assert.doesNotMatch(f.textContent ?? '', /vergr[öo]ßer|abweich/iu, t.thema);
    }
  }
});
