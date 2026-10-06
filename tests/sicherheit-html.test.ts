/*
 * Vertrauensgrenze des HTML-Parsers (Audit 2026-10-06, O-64; Kopfkommentar in src/ui/h.ts): typische XSS-Texte
 * werden in keinem benutzerbeeinflussbaren Weg ausführbar – weder in den Werkzeugen (jedes Text- und Zahlfeld,
 * mit und ohne Beispiel, auch im Druckbogen) noch im Gesprächsprotokoll der Präsentation. Dazu die Positivliste
 * `bereinige()` selbst: sie entfernt Gefährliches und lässt die heutigen Inhalte unverändert.
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///index.html' });
const gl = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLParagraphElement', 'SVGElement', 'DocumentFragment', 'Event', 'KeyboardEvent', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame',
]) gl[k] = (dom.window as unknown as Record<string, unknown>)[k];
// jsdom kennt keinen Druckdialog: ohne window.print hängt druckeBogen den Bogen nur an
(dom.window as unknown as { print?: unknown }).print = undefined;
after(() => dom.window.close());

const { inhalte } = await import('../src/inhalte/index.ts');
const { baueExplore, WERKZEUGE } = await import('../src/ui/flaechen/explore.ts');
const { erzeugeRegie } = await import('../src/regie/regie.ts');
const { vonHtml, bereinige } = await import('../src/ui/h.ts');
const { inhalt } = await import('../src/ui/bausteine/inhalt.ts');

const NUTZLASTEN = [
  '<img src=x onerror=alert(1)>',
  '<script>alert(1)</script>',
  '<a href="javascript:alert(1)">Test</a>',
  '<svg onload=alert(1)></svg>',
  '"><img src=x onerror=alert(2)>',
  '<iframe src="javascript:alert(3)"></iframe>',
];

/** Gefährliches im ganzen Dokument (Bildschirm und angehängte Druckbögen). */
function gefaehrlich(wurzel: ParentNode = document): string[] {
  const funde: string[] = [];
  for (const el of wurzel.querySelectorAll('script, iframe, object, embed')) funde.push(`<${el.localName}>`);
  for (const el of wurzel.querySelectorAll('*')) {
    for (const a of el.attributes) {
      if (a.name.toLowerCase().startsWith('on')) funde.push(`${el.localName}[${a.name}]`);
      if (/^\s*javascript:/iu.test(a.value)) funde.push(`${el.localName}[${a.name}=javascript:]`);
    }
  }
  return funde;
}

test('bereinige(): entfernt Skripte, Ereignis-Attribute und fremde Adressen, lässt sichere Formatierung stehen', () => {
  const f = vonHtml(`<p><strong>fett</strong> <a href="#ziel">Sprung</a> <a href="https://www.bauherr-mentoren.com/">BM</a> ${NUTZLASTEN.join(' ')}</p>`
    + '<svg viewBox="0 0 1 1"><a xlink:href="javascript:alert(4)"><text>x</text></a><foreignObject><img src=x onerror=alert(5)></foreignObject><animate attributeName="href" to="javascript:alert(6)"/></svg>'
    + '<div style="background:url(javascript:alert(7))">s</div><img src="data:image/png;base64,AAAA" alt="ok"><img src="data:text/html,<script>alert(8)</script>">');
  const div = document.createElement('div');
  div.append(f);
  assert.deepEqual(gefaehrlich(div), []);
  assert.equal(div.querySelector('strong')?.textContent, 'fett');
  assert.equal(div.querySelector('a[href="#ziel"]')?.textContent, 'Sprung');
  assert.ok(div.querySelector('a[href="https://www.bauherr-mentoren.com/"]'));
  assert.ok(div.querySelector('img[src^="data:image/png"]'));
  assert.equal(div.querySelector('img[src^="data:text"]'), null);
  assert.equal(div.querySelector('foreignObject, foreignobject, animate'), null);
  assert.equal(div.querySelector('[style]'), null);
});

test('bereinige(): die heutigen Inhalte (alle Themen-HTML) bleiben unverändert', () => {
  let geprueft = 0;
  const pruefeHtml = (html: string): void => {
    const roh = document.createElement('template');
    roh.innerHTML = html;
    const sauber = document.createElement('template');
    sauber.innerHTML = html;
    bereinige(sauber.content);
    assert.equal(sauber.innerHTML, roh.innerHTML);
    geprueft += 1;
  };
  const gehe = (x: unknown): void => {
    if (typeof x === 'string') { if (x.includes('<')) pruefeHtml(x); return; }
    if (Array.isArray(x)) { x.forEach(gehe); return; }
    if (x !== null && typeof x === 'object') Object.values(x).forEach(gehe);
  };
  gehe(inhalte);
  assert.ok(geprueft > 500, `${geprueft} HTML-Stücke geprüft`);
  assert.equal(inhalt('<p>a</p>').textContent, 'a');
});

test('Werkzeuge: XSS-Texte in jedem Feld werden nie ausführbar – Bildschirm und Druckbogen', () => {
  let felder = 0;
  for (const id of WERKZEUGE) {
    for (const nutzlast of NUTZLASTEN) {
      const el = baueExplore({ inhalte, werkzeug: id, bedienbar: true });
      document.body.replaceChildren(el);
      // mehrmals: neue Felder (Wege, Einträge) entstehen erst nach Eingaben
      for (let runde = 0; runde < 3; runde++) {
        for (const feld of el.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('textarea, input:not([type]), input[type="text"], input[type="search"]')) {
          feld.value = nutzlast;
          feld.dispatchEvent(new Event('input', { bubbles: true }));
          feld.dispatchEvent(new Event('change', { bubbles: true }));
          felder += 1;
        }
        for (const feld of el.querySelectorAll<HTMLInputElement>('input[type="number"], input[inputmode="decimal"], input[inputmode="numeric"]')) {
          feld.value = '1e999';
          feld.dispatchEvent(new Event('input', { bubbles: true }));
          feld.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      for (const knopf of el.querySelectorAll<HTMLButtonElement>('button')) if (/drucken/iu.test(knopf.textContent ?? '')) knopf.click();
      assert.deepEqual(gefaehrlich(), [], `${id}: ${nutzlast}`);
    }
  }
  assert.ok(felder > 100, `${felder} Felder mit Nutzlast gefüllt`);
});

test('Präsentieren: XSS-Texte im Gesprächsprotokoll bleiben Text – Liste und Druckbogen', () => {
  const daten = new Map<string, string>();
  const sp = { getItem: (k: string) => daten.get(k) ?? null, setItem: (k: string, v: string) => { daten.set(k, v); }, removeItem: (k: string) => { daten.delete(k); } };
  const kanal = { senden: () => undefined, abonnieren: () => () => undefined, schliessen: () => undefined };
  const r = erzeugeRegie({ inhalte, kanal, version: '', speicher: sp, oeffneLeinwand: () => undefined, takt: 100000 });
  try {
    document.body.replaceChildren(r.element);
    const feld = r.element.querySelector<HTMLTextAreaElement>('[data-pruef="regie-protokoll-feld"]');
    assert.ok(feld);
    for (const nutzlast of NUTZLASTEN) {
      feld.value = nutzlast;
      (r.element.querySelector('[data-pruef="regie-protokoll-sichern"]') as HTMLElement).click();
    }
    assert.match(r.element.querySelector('.regie-protokoll-liste')?.textContent ?? '', /<img src=x onerror=alert\(1\)>/u);
    (r.element.querySelector('[data-pruef="regie-drucken"]') as HTMLElement).click();
    assert.deepEqual(gefaehrlich(), []);
    // gespeicherter Stand mit Nutzlast wird beim nächsten Öffnen wieder nur als Text gezeigt
    r.entferne();
    const r2 = erzeugeRegie({ inhalte, kanal, version: '', speicher: sp, oeffneLeinwand: () => undefined, takt: 100000 });
    document.body.replaceChildren(r2.element);
    assert.deepEqual(gefaehrlich(), []);
    r2.entferne();
  } finally {
    r.entferne();
  }
});
