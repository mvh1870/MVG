/*
 * Sichtbarer Text (P16.1, O-38, O-39, O-42): jede Fläche der Seite im DOM gezeichnet – Start, alle Themen (Bildschirm
 * und Druck), jeder Schritt der Story mit jeder Option, alle Explore-Werkzeuge, Leinwand – und gegen die Liste der
 * sichtbar verbotenen Wörter geprüft (werkzeuge/sichtbar.mjs). Geprüft werden Text und die Attribute, die Menschen
 * lesen oder hören (aria-label, title, alt, placeholder).
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { sichtbarVerboten } from '../werkzeuge/sichtbar.mjs';

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
  pruefe(funde, 'start', baueStart({ startseite: inhalte.startseite, themenAnzahl: 16, stationenAnzahl: 8, werkzeugAnzahl: 5, weiterlesen: false, bedienbar: true }));
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

test('Story: jeder Schritt, jede Option', () => {
  const geschichte = inhalte.geschichte;
  assert.ok(geschichte);
  const funde: string[] = [];
  const themaVon = (id: string): string | null => themaTitel(inhalte, id);
  const zeichne = (stand: ReturnType<typeof neuerStand>, wo: string): void => {
    const el = document.createElement('div');
    el.append(...leisteOben(geschichte, stand, true, () => undefined), baueSchritt({ g: geschichte, stand, bedienbar: true, themaTitel: themaVon, gegenprobe: null, tue: () => undefined, setzeGegenprobe: () => undefined }));
    pruefe(funde, wo, el);
  };
  let stand = neuerStand();
  for (const s of geschichte.stationen) stand = waehle(geschichte, stand, s.id, s.vorlage.empfehlung.option);
  for (const schritt of schritte(geschichte, false)) zeichne({ ...stand, schritt }, JSON.stringify(schritt));
  // jede Option einmal in der Folge, dazu die Lage danach (Bedingungen)
  for (const s of geschichte.stationen) {
    for (const o of s.vorlage.optionen) {
      const mit = waehle(geschichte, stand, s.id, o.id);
      zeichne({ ...mit, schritt: { ort: 'station', station: s.id, teil: 'folge' } }, `${s.id} Option ${o.id}`);
      for (const spaeter of geschichte.stationen.filter((x) => x.nr > s.nr)) zeichne({ ...mit, schritt: { ort: 'station', station: spaeter.id, teil: 'lage' } }, `${spaeter.id} nach ${s.id}=${o.id}`);
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
  // Gegenprobe: jede Art, die P17.10 entfernt hat, wird gefunden
  for (const rest of [
    'Abweichungen vom Text (8)', 'Wo die Abbildung vom Text abweicht, gilt der Text.', 'der Text nennt acht Bausteine', 'Im Bild steht „Steuerungslogik“.',
    'Das Bild zeigt fünf Spalten.', 'Im Bild an die Begriffe des Texts angeglichen: „LPH 0–2“', 'nach L-121', 'O-56', 'R41', 'P17.10', 'vom Prüf-Agenten gesehen',
    'Beleg k5.2-t1', 'Quelle: Handbuch', 'nach V2.4', 'HB 3.2', 'nur intern', 'interne Notiz', 'TODO', 'Platzhalter', 'Hinweis zur Bedienung',
    'Klicken Sie sich durch.', 'Ziehen Sie den Regler.', 'Schalten Sie um und sehen Sie, was fehlt.',
  ]) assert.ok(sichtbarVerboten(`Text davor. ${rest} Text danach.`).length > 0, `nicht gefunden: ${rest}`);
  // Fachtext bleibt unbehelligt
  for (const fach of [
    'von 1 (geringe Abweichung, Nutzung nicht eingeschränkt)', 'getrennt festgehalten, mit Quelle, Datum und Bedingungen', 'Ein gemeinsamer Prüfvermerk mit Datum',
    'höchste belegte Auswirkung', 'als internetbasierter Dienst', 'RIS-014 und MAS-011', 'LPH 4', 'Wählen Sie eine Option.', 'Abbildung 3',
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
