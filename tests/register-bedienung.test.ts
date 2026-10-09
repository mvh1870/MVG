/*
 * Register-Zusammenspiel bedienen (src/ui/flaechen/explore/register.ts, jsdom): vier Ansichten, fünf Fragen über der Grafik,
 * Ausfall einer Station, geführtes Durchprobieren mit Rückmeldung, Erkunden, und die Anzeige ohne Bedienung (Leinwand).
 */
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { sichtbarVerboten } from '../werkzeuge/sichtbar.mjs';

type Fenster = Window & typeof globalThis;
const { JSDOM } = (await import(String('jsdom'))) as { JSDOM: new (html: string, o?: object) => { window: Fenster } };
const dom = new JSDOM('<!doctype html><html lang="de"><body></body></html>', { pretendToBeVisual: true, url: 'file:///index.html' });
const gl = globalThis as unknown as Record<string, unknown>;
for (const k of [
  'window', 'document', 'Node', 'Element', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLSelectElement', 'SVGElement',
  'DocumentFragment', 'Event', 'MouseEvent', 'KeyboardEvent', 'getComputedStyle',
]) gl[k] = (dom.window as unknown as Record<string, unknown>)[k];
after(() => dom.window.close());

const { inhalte } = await import('../src/inhalte/index.ts');
const { baueExplore } = await import('../src/ui/flaechen/explore.ts');
const { KANTEN, KNOTEN, ANLAESSE, kante, probefrage } = await import('../src/werkzeuge/register.ts');
const { W } = await import('../src/ui/woerter.ts');
const R = W.werkzeuge.register;
const w = inhalte.werkzeuge?.register;
assert.ok(w);

const zeige = (bedienbar = true): HTMLElement => {
  const el = baueExplore({ inhalte, werkzeug: 'register', bedienbar });
  document.body.replaceChildren(el);
  return el;
};
const klick = (el: Element | null): void => {
  assert.ok(el, 'Element zum Klicken');
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
};
const q = (el: ParentNode, pruef: string): HTMLElement | null => el.querySelector(`[data-pruef="${pruef}"]`);
const text = (el: ParentNode, pruef: string): string => q(el, pruef)?.textContent?.replace(/\s+/gu, ' ').trim() ?? '';
const waehle = (el: ParentNode, name: string, wert: string): void => {
  const r = el.querySelector<HTMLInputElement>(`input[name="${name}"][value="${wert}"]`);
  assert.ok(r, `${name}=${wert}`);
  r.checked = true;
  r.dispatchEvent(new Event('change', { bubbles: true }));
};
const streifen = (el: ParentNode, ort: string): string => el.querySelector(`[data-pruef="rz-kachel-${ort}"] .rz-streifen-text`)?.textContent ?? '';
const zaehler = (el: ParentNode): string => text(el, 'register-zaehler');

test('Aufbau: zehn Stationen, ein Hinweiskasten, dreizehn Pfeile, vier Ansichten, fünf Fragen, drei Rollenkarten', () => {
  const el = zeige();
  assert.equal(el.querySelectorAll('.rz-kachel').length, KNOTEN.length + 1);
  assert.equal(el.querySelectorAll('.rz-pfeil').length, KANTEN.length);
  assert.equal(el.querySelectorAll('[data-pruef^="register-modus-"]').length, 4);
  assert.equal(el.querySelectorAll('[data-pruef^="register-ebene-"]').length, 5);
  assert.equal(el.querySelectorAll('[data-pruef^="register-rolle-"]').length, 3);
  assert.equal(el.querySelector('select[data-pruef="register-anlass"]')?.querySelectorAll('option').length, ANLAESSE.length);
  assert.equal(el.querySelector('[data-pruef="register-modus-zuschauen"]')?.getAttribute('aria-pressed'), 'true');
  assert.equal(el.querySelector('[data-pruef="register-ebene-wer"]')?.getAttribute('aria-pressed'), 'true');
  // jede Station nennt in der Grafik, wer sie führt (Wort, nicht nur Farbe)
  for (const id of KNOTEN) assert.equal(streifen(el, id), w.rollen.find((r) => r.id === w.knoten[id].wer.fuehrt)?.titel, id);
  assert.equal(streifen(el, 'register'), 'Bauherr');
  assert.equal(streifen(el, 'freigabe'), 'Bauherr');
  assert.equal(streifen(el, 'vorlage'), 'Projektsteuerung');
  assert.equal(el.querySelector('.rz-svg')?.getAttribute('role'), 'group');
  assert.ok([...el.querySelectorAll('.rz-kachel')].every((k) => k.getAttribute('role') === 'button' && k.getAttribute('tabindex') === '0'));
});

test('Fragen über der Grafik: jede Frage schreibt ihren Kurztext in den Streifen jeder Station', () => {
  const el = zeige();
  for (const e of ['wann', 'schwelle', 'ergebnis'] as const) {
    klick(q(el, `register-ebene-${e}`));
    for (const id of KNOTEN) assert.equal(streifen(el, id), w.knoten[id][e].kurz, `${e} ${id}`);
    assert.equal(el.querySelector(`[data-pruef="register-ebene-${e}"]`)?.getAttribute('aria-pressed'), 'true');
  }
  klick(q(el, 'register-ebene-stoerung'));
  for (const id of KNOTEN) assert.equal(streifen(el, id), R.inBetrieb);
  klick(q(el, 'register-ebene-wer'));
  assert.equal(streifen(el, 'risiko'), 'Projektsteuerung');
});

test('Zuschauen: Weiter zeigt Schritt für Schritt Pfeil und Station, Zurück und Von vorn stellen zurück', () => {
  const el = zeige();
  const a = w.anlaesse[0];
  assert.ok(a);
  assert.equal(zaehler(el), R.schritt(0, a.schritte.length));
  assert.match(text(el, 'register-schritt'), new RegExp(a.einstieg.slice(0, 30)));
  a.schritte.forEach((s, i) => {
    klick(q(el, 'register-vor'));
    assert.equal(zaehler(el), R.schritt(i + 1, a.schritte.length));
    const k = kante(s.kante);
    assert.ok(k);
    assert.ok(el.querySelector(`.rz-pfeil[data-kante="${s.kante}"]`)?.classList.contains('ist-aktiv'), `Pfeil ${s.kante} aktiv`);
    assert.ok(el.querySelector(`.rz-kachel[data-ort="${k.nach}"]`)?.classList.contains('ist-aktiv'), `Station ${k.nach} aktiv`);
    assert.match(text(el, 'register-schritt'), new RegExp(w.kanten[s.kante]?.erklaerung.slice(0, 25) ?? '?'));
    if (i > 0) assert.ok(el.querySelector(`.rz-pfeil[data-kante="${a.schritte[i - 1]?.kante}"]`)?.classList.contains('ist-durchlaufen'));
  });
  assert.equal((q(el, 'register-vor') as HTMLButtonElement).disabled, true, 'am Ende kein weiterer Schritt');
  assert.match(text(el, 'register-ende'), new RegExp(a.ende.slice(0, 25)));
  klick(q(el, 'register-zurueck'));
  assert.equal(zaehler(el), R.schritt(a.schritte.length - 1, a.schritte.length));
  klick(q(el, 'register-neu'));
  assert.equal(zaehler(el), R.schritt(0, a.schritte.length));
  assert.equal(el.querySelectorAll('.rz-pfeil.ist-durchlaufen').length, 0);
});

test('Zuschauen: Starten läuft sofort einen Schritt und lässt sich anhalten (Takt im Hintergrund, nie bei abgehängter Ansicht)', () => {
  const el = zeige();
  klick(q(el, 'register-start'));
  assert.equal(zaehler(el), R.schritt(1, w.anlaesse[0]?.schritte.length ?? 0));
  assert.equal(text(el, 'register-start'), R.anhalten);
  klick(q(el, 'register-start'));
  assert.equal(text(el, 'register-start'), R.start);
  klick(q(el, 'register-tempo'));
  assert.equal(q(el, 'register-tempo')?.getAttribute('aria-pressed'), 'true');
});

test('Anlass wechseln stellt den Fall zurück; jeder Anlass beginnt an seiner Startstation', () => {
  const el = zeige();
  klick(q(el, 'register-vor'));
  for (const a of w.anlaesse) {
    const sel = q(el, 'register-anlass') as HTMLSelectElement;
    sel.value = a.id;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    assert.equal(zaehler(el), R.schritt(0, a.schritte.length));
    assert.ok(el.querySelector(`.rz-kachel[data-ort="${a.start}"]`)?.classList.contains('ist-aktiv'), `${a.id}: Start ${a.start}`);
    assert.match(text(el, 'register-schritt'), new RegExp(a.einstieg.slice(0, 25)));
  }
});

test('Ausfall einer Station: der Fall bleibt stehen, die Folge steht darunter, Wiedereinschalten setzt fort', () => {
  const el = zeige();
  klick(q(el, 'register-ebene-stoerung'));
  assert.ok(q(el, 'register-stoerung-hinweis'));
  klick(q(el, 'rz-kachel-vorlage'));
  assert.ok(el.querySelector('[data-ort="vorlage"]')?.classList.contains('ist-ausgefallen'));
  assert.equal(streifen(el, 'vorlage'), R.faelltAus);
  const a = w.anlaesse[0];
  assert.ok(a);
  // Schritt 1 und 2 laufen, der dritte (Entscheidungsregister → Entscheidungsvorlage) bleibt stehen
  klick(q(el, 'register-vor'));
  assert.equal(q(el, 'register-blockade'), null);
  klick(q(el, 'register-vor'));
  assert.equal(zaehler(el), R.schritt(2, a.schritte.length), 'der Schritt zur ausgefallenen Station wird nicht gegangen');
  assert.equal((q(el, 'register-vor') as HTMLButtonElement).disabled, true);
  assert.match(text(el, 'register-blockade'), new RegExp(R.blockiert('Entscheidungsvorlage')));
  assert.ok(text(el, 'register-blockade').includes(w.knoten.vorlage.stoerung));
  klick(q(el, 'rz-kachel-vorlage'));
  assert.equal(q(el, 'register-blockade'), null);
  klick(q(el, 'register-vor'));
  assert.equal(zaehler(el), R.schritt(3, a.schritte.length));
});

test('Geschichte: der erzählte Text je Schritt, ohne Takt; die Frage „Was fehlt?“ ist hier gesperrt', () => {
  const el = zeige();
  klick(q(el, 'register-modus-geschichte'));
  assert.equal(q(el, 'register-start'), null, 'Geschichte läuft nicht von allein');
  assert.equal((q(el, 'register-ebene-stoerung') as HTMLButtonElement).disabled, true);
  const a = w.anlaesse[0];
  assert.ok(a);
  for (const [i, s] of a.schritte.entries()) {
    klick(q(el, 'register-vor'));
    assert.ok(text(el, 'register-schritt').includes(s.text.slice(0, 40)), `Schritt ${i + 1}: Erzähltext`);
  }
  assert.ok(text(el, 'register-schritt').includes(a.ende.slice(0, 30)));
});

test('Selbst durchprobieren: falsche Antworten werden erklärt, richtige führen zur Frage „Wer führt …?“, am Ende steht die Zahl der ersten Treffer', () => {
  const el = zeige();
  klick(q(el, 'register-modus-probieren'));
  const a = w.anlaesse[0];
  assert.ok(a);
  const wg = { start: a.start, schritte: a.schritte.map((s) => s.kante) };
  // erster Schritt: erst eine falsche, dann die richtige Antwort
  const f0 = probefrage(wg, 0);
  assert.ok(f0);
  const falsch = f0.wahl.find((o) => o !== f0.richtig);
  assert.ok(falsch);
  waehle(el, 'register-weiter', falsch);
  assert.match(q(el, 'register-rueckmeldung')?.dataset['ergebnis'] ?? '', /kein-pfeil|anderer-pfeil/u);
  assert.equal(q(el, 'register-wer-rueckmeldung'), null, 'noch keine Frage nach der Rolle');
  waehle(el, 'register-weiter', f0.richtig);
  assert.equal(q(el, 'register-rueckmeldung')?.dataset['ergebnis'], 'richtig');
  assert.ok(el.querySelector('.rz-pfeil.ist-aktiv'), 'der Pfeil ist in der Grafik markiert');
  let richtigBeimErstenMal = 0;
  for (let i = 0; i < a.schritte.length; i++) {
    const f = probefrage(wg, i);
    assert.ok(f);
    if (i > 0) { waehle(el, 'register-weiter', f.richtig); richtigBeimErstenMal += 1; }
    const k = kante(a.schritte[i]?.kante ?? '');
    assert.ok(k);
    const fuehrt = k.nach === 'schwelle' ? w.schwelle.wer.fuehrt : w.knoten[k.nach].wer.fuehrt;
    const andere = ['bauherr', 'lenkungskreis', 'projektsteuerung'].find((r) => r !== fuehrt) ?? '';
    waehle(el, 'register-wer', andere);
    assert.equal(q(el, 'register-wer-rueckmeldung')?.dataset['ergebnis'], 'falsch');
    assert.equal(q(el, 'register-probe-weiter'), null, 'ohne richtige Rolle kein Weiter');
    waehle(el, 'register-wer', fuehrt);
    assert.equal(q(el, 'register-wer-rueckmeldung')?.dataset['ergebnis'], 'richtig');
    klick(q(el, 'register-probe-weiter'));
  }
  assert.ok(q(el, 'register-probe-ergebnis'));
  assert.equal(text(el, 'register-probe-ergebnis'), R.probe.ergebnis(richtigBeimErstenMal, a.schritte.length), 'der erste Schritt zählt nicht (erst falsch)');
});

test('Erkunden: Station und Pfeil zeigen ihre Karte mit allen fünf Fragen; noch einmal wählen hebt auf', () => {
  const el = zeige();
  klick(q(el, 'register-modus-erkunden'));
  assert.equal(q(el, 'register-anlass'), null, 'beim Erkunden gibt es keinen Fall');
  assert.equal(el.querySelectorAll('.rz-kachel.ist-aktiv').length, 0);
  klick(q(el, 'rz-kachel-freigabe'));
  const karte = q(el, 'register-station');
  assert.ok(karte);
  assert.equal(karte.querySelectorAll('.rz-zeile').length, 5);
  assert.ok(karte.textContent?.includes(w.knoten.freigabe.wer.text));
  assert.ok(karte.textContent?.includes(w.knoten.freigabe.stoerung));
  klick(q(el, 'register-ebene-wann'));
  assert.equal(q(el, 'register-station')?.querySelector('.rz-zeile[data-aktiv="ja"]')?.getAttribute('data-ebene'), 'wann');
  klick(q(el, 'rz-kachel-freigabe'));
  assert.equal(q(el, 'register-station'), null);
  klick(q(el, 'rz-pfeil-risiko-register'));
  assert.ok(text(el, 'register-pfeil').includes(w.kanten['risiko-register']?.erklaerung ?? '?'));
  klick(q(el, 'register-auswahl-aufheben'));
  assert.equal(q(el, 'register-pfeil'), null);
});

test('Tastatur: Enter und Leertaste wählen eine Station wie ein Klick', () => {
  const el = zeige();
  klick(q(el, 'register-modus-erkunden'));
  const k = q(el, 'rz-kachel-risiko');
  assert.ok(k);
  k.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  assert.ok(q(el, 'register-station'));
  q(el, 'rz-kachel-risiko')?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
  assert.equal(q(el, 'register-station'), null);
});

test('Ohne Bedienung (Leinwand): Grafik und Rollen, keine Knöpfe, keine Stationen zum Wählen', () => {
  const el = zeige(false).querySelector<HTMLElement>('.rz');
  assert.ok(el);
  assert.equal(el.querySelectorAll('button, select, input, [role="button"], [tabindex]').length, 0);
  assert.equal(el.querySelectorAll('.rz-kachel').length, KNOTEN.length + 1);
  assert.equal(el.querySelectorAll('.rz-pfeil').length, KANTEN.length);
  assert.equal(streifen(el, 'register'), 'Bauherr');
});

test('Sichtbar: in jeder Ansicht und Frage kein verbotenes Wort, keine G0–G5, keine Figuren', () => {
  const el = zeige();
  const funde: string[] = [];
  const pruefe = (wo: string): void => { for (const f of sichtbarVerboten(el.textContent ?? '')) funde.push(`${wo}: ${f}`); };
  for (const m of ['zuschauen', 'geschichte', 'probieren', 'erkunden']) {
    klick(q(el, `register-modus-${m}`));
    for (const e of ['wer', 'wann', 'schwelle', 'ergebnis', 'stoerung']) {
      const k = q(el, `register-ebene-${e}`) as HTMLButtonElement | null;
      if (k === null || k.disabled) continue;
      klick(k);
      for (let i = 0; i < 9; i++) { const v = q(el, 'register-vor') as HTMLButtonElement | null; if (v !== null && !v.disabled) klick(v); }
      klick(q(el, 'rz-kachel-vorlage'));
      pruefe(`${m}/${e}`);
    }
  }
  assert.deepEqual(funde, []);
  assert.ok(!/Bürgermeisterin|Bauleiter/u.test(el.textContent ?? ''));
});
