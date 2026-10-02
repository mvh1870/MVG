/*
 * Story-Fläche (src/ui/flaechen/geschichte.ts, jsdom): Grenzwerte der Statusleiste, Bilanz am Ende mit
 * Kennzeichen für automatisch gewählte Stationen (Kurzfassung), Gegenprobe gilt nur im eigenen Schritt.
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
dom.window.scrollTo = (() => undefined) as typeof dom.window.scrollTo;
after(() => dom.window.close());

const { inhalte } = await import('../src/inhalte/index.ts');
const { baueSchritt, erzeugeGeschichte, statusLeiste } = await import('../src/ui/flaechen/geschichte.ts');
const { empfohlen, neuerStand, pufferUrteil, waehle } = await import('../src/geschichte/engine.ts');
const { W } = await import('../src/ui/woerter.ts');
type Geschichte = NonNullable<typeof inhalte.geschichte>;

const G = inhalte.geschichte;
assert.ok(G);
const geschichte: Geschichte = G;

/** Lage der Statusleiste im Auftakt (dort gelten nur die Startwerte). */
function lagen(start: { kosten?: number; puffer?: number; offen?: number }): Record<string, string | undefined> {
  const g = structuredClone(geschichte);
  if (start.kosten !== undefined) g.status.kosten.start = start.kosten;
  if (start.puffer !== undefined) g.status.puffer.start = start.puffer;
  if (start.offen !== undefined) g.status.offen.start = start.offen;
  const el = statusLeiste(g, neuerStand());
  const aus: Record<string, string | undefined> = {};
  for (const d of el.querySelectorAll<HTMLElement>('[data-status]')) aus[d.dataset['status'] ?? ''] = d.dataset['lage'];
  return aus;
}

test('Statusleiste: Kosten – über der Basis mittel, mehr als die Reserve (2,9) kritisch', () => {
  const basis = geschichte.status.kosten.basis;
  assert.ok(basis !== null);
  assert.equal(lagen({ kosten: basis })['kosten'], 'ok');
  assert.equal(lagen({ kosten: basis - 1 })['kosten'], 'ok');
  assert.equal(lagen({ kosten: basis + 0.01 })['kosten'], 'mittel');
  assert.equal(lagen({ kosten: basis + 2.9 })['kosten'], 'mittel');
  assert.equal(lagen({ kosten: basis + 2.91 })['kosten'], 'kritisch');
  assert.equal(lagen({ kosten: basis + 3 })['kosten'], 'kritisch');
});

test('Statusleiste: Puffer – 8 Tage gut, 7 knapp, unter 0 kritisch; offene Entscheidungen 0/1/2', () => {
  assert.equal(lagen({ puffer: 8 })['puffer'], 'ok');
  assert.equal(lagen({ puffer: 7 })['puffer'], 'mittel');
  assert.equal(lagen({ puffer: 0 })['puffer'], 'mittel');
  assert.equal(lagen({ puffer: -1 })['puffer'], 'kritisch');
  assert.equal(pufferUrteil(8), 'gut');
  assert.equal(pufferUrteil(7), 'knapp');
  assert.equal(pufferUrteil(0), 'knapp');
  assert.equal(pufferUrteil(-1), 'schlecht');
  assert.equal(lagen({ offen: 0 })['offen'], 'ok');
  assert.equal(lagen({ offen: 1 })['offen'], 'mittel');
  assert.equal(lagen({ offen: 2 })['offen'], 'kritisch');
});

test('Bilanz am Ende (Kurzfassung): Stationen außerhalb der Kurzfassung sind als automatisch gekennzeichnet', () => {
  const kurz = geschichte.stationen.filter((s) => s.kurzfassung);
  assert.ok(kurz.length >= 3 && kurz.length < geschichte.stationen.length);
  const [erste, zweite, ...rest] = kurz;
  assert.ok(erste && zweite);
  let stand = neuerStand(true);
  // erste: wie empfohlen; zweite: eine andere zulässige Option; die übrigen bis auf die letzte wie empfohlen; letzte offen
  stand = waehle(geschichte, stand, erste.id, erste.vorlage.empfehlung.option);
  const anders = zweite.vorlage.optionen.find((o) => o.id !== empfohlen(geschichte, stand, zweite));
  assert.ok(anders);
  stand = waehle(geschichte, stand, zweite.id, anders.id);
  const offen = rest.pop();
  assert.ok(offen);
  for (const s of rest) stand = waehle(geschichte, stand, s.id, empfohlen(geschichte, stand, s));
  const el = baueSchritt({ g: geschichte, stand: { ...stand, schritt: { ort: 'ende' } }, bedienbar: false, themaTitel: () => null, gegenprobe: null, tue: () => undefined, setzeGegenprobe: () => undefined });
  const zeilen = [...el.querySelectorAll('[data-pruef="gs-bilanz"] > li')].map((li) => li.querySelector('small')?.textContent ?? null);
  const erwartet = geschichte.stationen.map((s) => {
    if (!s.kurzfassung) return W.geschichte.automatisch;
    if (s.id === offen.id) return '';
    return s.id === zweite.id ? W.geschichte.andersAlsEmpfohlen : W.geschichte.wieEmpfohlen;
  });
  assert.deepEqual(zeilen, erwartet);
  // die automatisch gewählten tragen die Option der Empfehlung
  const titel = [...el.querySelectorAll('[data-pruef="gs-bilanz"] > li > b')].map((b) => b.textContent);
  geschichte.stationen.forEach((s, i) => {
    if (s.kurzfassung) return;
    assert.equal(titel[i], s.vorlage.optionen.find((o) => o.id === empfohlen(geschichte, stand, s))?.titel, s.id);
  });
});

test('Gegenprobe: bleibt bei einer Wahl im selben Schritt, fällt beim Schrittwechsel weg', () => {
  const daten = new Map<string, string>();
  const speicher = { getItem: (k: string) => daten.get(k) ?? null, setItem: (k: string, v: string) => { daten.set(k, v); }, removeItem: (k: string) => { daten.delete(k); } };
  const f = erzeugeGeschichte({ g: geschichte, speicher, themaTitel: () => null });
  document.body.replaceChildren(f.element);
  const st = geschichte.stationen.find((s) => s.vorlage.art === 'optionen' && s.vorlage.unvollstaendigHtml === null);
  assert.ok(st);
  const k = geschichte.kriterien[0];
  assert.ok(k);
  const knopf = (pruef: string): HTMLButtonElement => {
    const b = f.element.querySelector<HTMLButtonElement>(`[data-pruef="${pruef}"]`);
    assert.ok(b, pruef);
    return b;
  };
  const summen = (): string[] => [...f.element.querySelectorAll('[data-pruef^="summe-"] b')].map((b) => b.textContent ?? '');
  const gegenprobeOffen = (): boolean => f.element.querySelector('[data-pruef="gs-gegenprobe"]')?.hasAttribute('open') ?? false;

  f.zuStation(st.id);
  knopf('weiter').click();
  assert.deepEqual(f.stand().schritt, { ort: 'station', station: st.id, teil: 'vorlage' });
  const vorher = summen();
  assert.ok(vorher.length >= 2);
  assert.equal(gegenprobeOffen(), false);

  const regler = f.element.querySelector<HTMLInputElement>(`[data-pruef="gs-gegenprobe"] input[data-kriterium="${k.id}"]`);
  assert.ok(regler);
  regler.value = regler.value === '5' ? '1' : '5';
  regler.dispatchEvent(new Event('input', { bubbles: true }));
  const geaendert = summen();
  assert.notDeepEqual(geaendert, vorher, 'die Gegenprobe ändert die Summen');

  // eine Wahl im selben Schritt lässt die Gegenprobe stehen
  const opt = st.vorlage.optionen[0];
  assert.ok(opt);
  knopf(`option-${opt.id}`).click();
  assert.deepEqual(summen(), geaendert);
  assert.equal(gegenprobeOffen(), true);

  // Schrittwechsel und zurück: wieder die eigenen Gewichte
  knopf('zurueck').click();
  assert.deepEqual(f.stand().schritt, { ort: 'station', station: st.id, teil: 'lage' });
  knopf('weiter').click();
  assert.deepEqual(f.stand().schritt, { ort: 'station', station: st.id, teil: 'vorlage' });
  assert.deepEqual(summen(), vorher);
  assert.equal(gegenprobeOffen(), false);
});
