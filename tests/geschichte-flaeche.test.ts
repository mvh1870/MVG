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
const { empfohlen, geheZu, gewichte, gilt, neuerStand, pufferUrteil, status, waehle } = await import('../src/geschichte/engine.ts');
const { kipppunkte, rangfolge } = await import('../src/geschichte/mcda.ts');
const { inhaltInline } = await import('../src/ui/bausteine/inhalt.ts');
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
  for (const d of el.querySelectorAll<HTMLElement>(':scope > [data-status]')) aus[d.dataset['status'] ?? ''] = d.dataset['lage'];
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

test('Statusleiste (R67): je Kachel Form und Lagewort passend zu data-lage – nie nur Farbe', () => {
  const basis = geschichte.status.kosten.basis;
  assert.ok(basis !== null);
  const faelle: Array<{ kosten?: number; puffer?: number; offen?: number }> = [
    { kosten: basis, puffer: 8, offen: 0 }, { kosten: basis + 1, puffer: 7, offen: 1 }, { kosten: basis + 3, puffer: -1, offen: 2 },
  ];
  const gesehen = new Set<string>();
  for (const f of faelle) {
    const g = structuredClone(geschichte);
    g.status.kosten.start = f.kosten ?? g.status.kosten.start;
    g.status.puffer.start = f.puffer ?? g.status.puffer.start;
    g.status.offen.start = f.offen ?? g.status.offen.start;
    const el = statusLeiste(g, neuerStand());
    const kacheln = [...el.querySelectorAll<HTMLElement>(':scope > [data-lage]')];
    assert.equal(kacheln.length, 3);
    for (const k of kacheln) {
      const lage = k.dataset['lage'] as 'ok' | 'mittel' | 'kritisch';
      gesehen.add(lage);
      const symbole = k.querySelectorAll('svg.status-symbol');
      assert.equal(symbole.length, 1, `${k.dataset['status']}: ein Symbol`);
      assert.equal(symbole[0]?.getAttribute('data-status'), lage, `${k.dataset['status']}: Form zur Lage ${lage}`);
      const wort = k.querySelector('[data-pruef="gs-lagewort"]')?.textContent ?? '';
      assert.ok(wort.includes(W.geschichte.lagen[lage]), `${k.dataset['status']}: Lagewort „${W.geschichte.lagen[lage]}“ fehlt („${wort}“)`);
      assert.ok((k.querySelector('dd')?.textContent ?? '').includes(W.geschichte.lagen[lage]), 'Lagewort im Wert (für Screenreader)');
    }
  }
  assert.deepEqual([...gesehen].sort(), ['kritisch', 'mittel', 'ok']);
  // drei verschiedene Wörter
  assert.equal(new Set(Object.values(W.geschichte.lagen)).size, 3);
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

/* ------------------------------------------------------------------ R68 -- */

type Stand = ReturnType<typeof neuerStand>;
const ohneBedienung = (g: Geschichte, stand: Stand): HTMLElement =>
  baueSchritt({ g, stand, bedienbar: false, themaTitel: () => 'Thema', gegenprobe: null, tue: () => undefined, setzeGegenprobe: () => undefined });
const station = (id: string): Geschichte['stationen'][number] => {
  const st = geschichte.stationen.find((x) => x.id === id);
  assert.ok(st, id);
  return st;
};
const an = (stand: Stand, id: string, teil: 'lage' | 'vorlage' | 'folge'): Stand => geheZu(geschichte, stand, { ort: 'station', station: id, teil });

test('Gegenprobe (R68): zwei und drei Regler nacheinander – Gewichtsspalte, Summen und Kipppunkte rechnen mit allen', () => {
  const f = erzeugeGeschichte({ g: geschichte, speicher: null, themaTitel: () => null });
  document.body.replaceChildren(f.element);
  const st = station('s3');
  f.zuStation(st.id);
  f.element.querySelector<HTMLButtonElement>('[data-pruef="weiter"]')?.click();
  const regler = (k: string): HTMLInputElement => {
    const r = f.element.querySelector<HTMLInputElement>(`[data-pruef="gs-gegenprobe"] input[data-kriterium="${k}"]`);
    assert.ok(r, k);
    return r;
  };
  const stelle = (k: string, wert: number): void => {
    const r = regler(k);
    r.value = String(wert);
    r.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const reglerWerte = (): Record<string, number> => Object.fromEntries(geschichte.kriterien.map((k) => [k.id, Number(regler(k.id).value)]));
  const pruefe = (wo: string): void => {
    const gew = reglerWerte();
    const spalte = [...f.element.querySelectorAll('.gs-vergleich tbody td.gs-zahl-spalte')].map((td) => Number(td.textContent));
    assert.deepEqual(spalte, geschichte.kriterien.map((k) => gew[k.id]), `${wo}: Gewichtsspalte`);
    const summen = [...f.element.querySelectorAll<HTMLElement>('.gs-vergleich [data-pruef^="summe-"]')].map((td) => `${td.dataset['pruef']?.slice(6)}:${td.querySelector('b')?.textContent}`);
    assert.deepEqual(summen, rangfolge(st.vorlage.optionen, geschichte.kriterien, gew).map((p) => `${p.option.id}:${p.summe}`), `${wo}: Summen`);
    const kipp = [...f.element.querySelectorAll('[data-pruef="gs-kipp"] li')].map((li) => li.textContent);
    const titel = (id: string): string => st.vorlage.optionen.find((x) => x.id === id)?.titel ?? id;
    assert.deepEqual(kipp, kipppunkte(st.vorlage.optionen, geschichte.kriterien, gew)
      .map((x) => W.geschichte.kipppunkt(geschichte.kriterien.find((c) => c.id === x.kriterium)?.titel ?? x.kriterium, x.gewicht, x.spitze.map(titel))), `${wo}: Kipppunkte`);
  };
  pruefe('Ausgang');
  stelle('kosten', 5);
  pruefe('Kosten 5');
  stelle('termin', 1);
  assert.deepEqual([reglerWerte()['kosten'], reglerWerte()['termin']], [5, 1]);
  pruefe('Kosten 5, Termin 1');
  stelle('qualitaet', 4);
  pruefe('Kosten 5, Termin 1, Qualität 4');
});

test('Tastatur (R68): der Fokus bleibt nach einer Änderung auf dem Regler – Gewichte (Station 1) und Gegenprobe; Pfeiltasten blättern dort nicht', () => {
  const f = erzeugeGeschichte({ g: geschichte, speicher: null, themaTitel: () => null });
  document.body.replaceChildren(f.element);
  const erste = geschichte.stationen[0];
  assert.ok(erste && erste.vorlage.art === 'gewichte');
  f.zuStation(erste.id);
  f.element.querySelector<HTMLButtonElement>('[data-pruef="weiter"]')?.click();
  const pfeil = (ziel: HTMLElement, key: string): boolean => {
    const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    ziel.dispatchEvent(e);
    return f.taste(e);
  };
  for (const [ort, kriterium] of [['gewichte', 'termin'], ['gegenprobe', 'kosten']] as const) {
    if (ort === 'gegenprobe') {
      f.zuStation('s3');
      f.element.querySelector<HTMLButtonElement>('[data-pruef="weiter"]')?.click();
    }
    const schritt = f.stand().schritt;
    const hole = (): HTMLInputElement => {
      const r = f.element.querySelector<HTMLInputElement>(`[data-pruef="${ort}"] input[data-kriterium="${kriterium}"]`);
      assert.ok(r, `${ort} ${kriterium}`);
      return r;
    };
    hole().focus();
    for (const wert of [4, 3]) {
      const r = hole();
      assert.equal(document.activeElement, r, `${ort}: Fokus vor ${wert}`);
      r.value = String(wert);
      r.dispatchEvent(new Event('input', { bubbles: true }));
      r.dispatchEvent(new Event('change', { bubbles: true }));
      assert.equal(document.activeElement, hole(), `${ort}: Fokus bleibt auf dem Regler (nach ${wert})`);
      assert.equal(hole().value, String(wert));
      assert.equal(pfeil(hole(), 'ArrowLeft'), false, `${ort}: Pfeil am Regler blättert nicht`);
      assert.deepEqual(f.stand().schritt, schritt);
    }
    if (ort === 'gewichte') assert.equal(f.stand().gewichte?.[kriterium], 3, 'beide Änderungen kommen im Stand an');
  }
});

test('Lage (R68): Berichtszeilen und Vorgänge nur mit erfüllter Bedingung', () => {
  // Station 8: viele bedingte Zeilen; Weg mit Empfehlungen (lang)
  let stand = neuerStand();
  for (const st of geschichte.stationen.slice(0, 7)) stand = waehle(geschichte, stand, st.id, empfohlen(geschichte, stand, st));
  const s8 = station('s8');
  const zeilen = [...ohneBedienung(geschichte, an(stand, 's8', 'lage')).querySelectorAll('[data-pruef="gs-bericht"] li')].map((li) => li.textContent);
  const erwartet = s8.bericht.zeilen.filter((z) => gilt(geschichte, stand, z.wenn, s8)).map((z) => h1(z.html));
  assert.ok(erwartet.length < s8.bericht.zeilen.length, 'nicht alle Zeilen gelten');
  assert.deepEqual(zeilen, erwartet);
  // Station 7: Vorgänge je nach Wahl in Station 3
  const s7 = station('s7');
  for (const wahl3 of ['A', 'B']) {
    const st = waehle(geschichte, stand, 's3', wahl3);
    const el = ohneBedienung(geschichte, an(st, 's7', 'lage'));
    const titel = [...el.querySelectorAll('[data-pruef^="vorgang-"] .gs-vorgang-kopf b')].map((b) => b.textContent);
    const soll = s7.vorgaenge.filter((v) => gilt(geschichte, st, v.wenn, s7)).map((v) => v.titel);
    assert.ok(soll.length < s7.vorgaenge.length, `s3=${wahl3}: nicht alle Vorgänge gelten`);
    assert.deepEqual(titel, soll, `s3=${wahl3}`);
  }
});

/** Text eines Inline-HTML-Stücks, wie die Fläche es zeigt. */
function h1(html: string): string {
  const p = document.createElement('p');
  p.append(inhaltInline(html));
  return p.textContent ?? '';
}

test('Folge (R68): „Wirkung auf den Stand“ nennt die Folgen der gewählten Option', () => {
  // eine Option, die Puffer kostet und eine Entscheidung offen lässt
  const st = geschichte.stationen.find((x) => x.vorlage.optionen.some((o) => (o.folgen.puffer ?? 0) < 0 && (o.folgen.offen ?? 0) > 0));
  const b = st?.vorlage.optionen.find((o) => (o.folgen.puffer ?? 0) < 0 && (o.folgen.offen ?? 0) > 0);
  assert.ok(st && b && b.folgen.puffer !== undefined && b.folgen.offen !== undefined);
  const el = ohneBedienung(geschichte, an(waehle(geschichte, neuerStand(), st.id, b.id), st.id, 'folge'));
  const text = (el.querySelector('.gs-folgen')?.textContent ?? '').replace(/\s/gu, ' ');
  assert.ok(text.includes(`${geschichte.status.puffer.titel} −${Math.abs(b.folgen.puffer)} ${geschichte.status.puffer.einheit}`), text);
  assert.ok(text.includes(`${geschichte.status.offen.titel} +${b.folgen.offen}`), text);
  assert.ok(!text.includes(W.geschichte.keineFolgen), text);
});

test('Ende (R68): das Urteil passt zum Puffer – gut, knapp, schlecht', () => {
  const ende: Stand = { ...neuerStand(), schritt: { ort: 'ende' } };
  const wirkung = status(geschichte, ende, { ort: 'ende' }).puffer - geschichte.status.puffer.start;
  const texte = { gut: geschichte.ende.pufferGut, knapp: geschichte.ende.pufferKnapp, schlecht: geschichte.ende.pufferSchlecht };
  assert.equal(new Set(Object.values(texte)).size, 3);
  for (const [puffer, urteil] of [[8, 'gut'], [7, 'knapp'], [-1, 'schlecht']] as const) {
    const g = structuredClone(geschichte);
    g.status.puffer.start = puffer - wirkung;
    const el = ohneBedienung(g, ende);
    const p = el.querySelector<HTMLElement>('[data-pruef="gs-urteil"]');
    assert.equal(p?.dataset['urteil'], urteil, `Puffer ${puffer}`);
    assert.equal(p?.textContent, h1(texte[urteil]), `Puffer ${puffer}: Text`);
  }
});

test('Tastatur (R68): Pfeil rechts auf einer Vorlage ohne Wahl bleibt stehen und bittet um eine Wahl', () => {
  const f = erzeugeGeschichte({ g: geschichte, speicher: null, themaTitel: () => null });
  document.body.replaceChildren(f.element);
  f.zuStation('s3');
  f.element.querySelector<HTMLButtonElement>('[data-pruef="weiter"]')?.click();
  const vorher = f.stand().schritt;
  assert.deepEqual(vorher, { ort: 'station', station: 's3', teil: 'vorlage' });
  const e = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
  document.body.dispatchEvent(e);
  assert.equal(f.taste(e), true);
  assert.deepEqual(f.stand().schritt, vorher);
  assert.equal(f.element.querySelector('.gs-navi-hinweis')?.textContent, W.geschichte.nochKeineWahl);
});

test('Statusleiste (R68): Abstand zur Basis mit Vorzeichen („+2,0“, „−1,5“), negativer Puffer mit „−“ (U+2212)', () => {
  const basis = geschichte.status.kosten.basis;
  assert.ok(basis !== null);
  const leiste = (kosten: number, puffer: number): HTMLElement => {
    const g = structuredClone(geschichte);
    g.status.kosten.start = kosten;
    g.status.puffer.start = puffer;
    return statusLeiste(g, neuerStand());
  };
  const ueber = leiste(basis + 2, 10);
  assert.equal(ueber.querySelector('[data-status="kosten"] small')?.textContent, ' (+2,0)');
  assert.equal(leiste(basis - 1.5, 10).querySelector('[data-status="kosten"] small')?.textContent, ' (−1,5)');
  assert.equal(leiste(basis, 10).querySelector('[data-status="kosten"] small'), null, 'auf der Basis kein Abstand');
  const puffer = leiste(basis, -3).querySelector('[data-status="puffer"] dd')?.textContent ?? '';
  // zwischen Zahl und Einheit steht ein geschütztes Leerzeichen
  assert.match(puffer, new RegExp(`−3\\s${geschichte.status.puffer.einheit}`, 'u'));
  assert.ok(!puffer.includes('-'), `kein Bindestrich als Minus: ${puffer}`);
});

/* ------------------------------------------------------------------ R69 -- */

test('Lage (R69): die Statusbedingung „puffer<0“ wird mit der Station ausgewertet – Meldung genau bei negativem Puffer', () => {
  const s4 = station('s4');
  const meldung = s4.bericht.zeilen.find((z) => z.wenn !== null && /puffer</u.test(z.wenn));
  assert.ok(meldung, 's4 hat eine Berichtszeile mit Statusbedingung „puffer<…“');
  // alle Wege durch die Stationen vor s4, je mit dem Puffer bei der Lage von s4
  const vorher = geschichte.stationen.slice(0, geschichte.stationen.indexOf(s4));
  let staende: Stand[] = [neuerStand()];
  for (const st of vorher) staende = staende.flatMap((z) => st.vorlage.optionen.filter((o) => !o.klaerung).map((o) => waehle(geschichte, z, st.id, o.id)));
  const pufferBei = (z: Stand): number => status(geschichte, an(z, 's4', 'lage')).puffer;
  const negativ = staende.find((z) => pufferBei(z) < 0);
  const positiv = staende.find((z) => pufferBei(z) >= 0);
  assert.ok(negativ && positiv, 'ein Weg mit negativem und einer mit nicht negativem Puffer');
  const bericht = (z: Stand): string => {
    const el = ohneBedienung(geschichte, an(z, 's4', 'lage')).querySelector('[data-pruef="gs-bericht"]');
    assert.ok(el, 'Bericht gezeichnet');
    return el.textContent ?? '';
  };
  const text = h1(meldung.html);
  assert.ok(text.length > 10);
  assert.ok(bericht(negativ).includes(text), `Puffer ${pufferBei(negativ)}: Meldung fehlt im Bericht`);
  assert.ok(!bericht(positiv).includes(text), `Puffer ${pufferBei(positiv)}: Meldung steht im Bericht`);
});

test('Lage (R69): der Titel des Monatsberichts bricht nicht vor „·“ (geschütztes Leerzeichen)', () => {
  const st = geschichte.stationen.find((x) => x.bericht.titel.includes(' · '));
  assert.ok(st, 'ein Berichtstitel mit „ · “');
  const titel = ohneBedienung(geschichte, an(neuerStand(), st.id, 'lage')).querySelector('.gs-bericht-titel')?.textContent ?? '';
  assert.ok(titel.includes(' · '), `geschütztes Leerzeichen vor „·“: ${JSON.stringify(titel)}`);
  assert.ok(!titel.includes(' · '), 'kein gewöhnliches Leerzeichen vor „·“');
});

/* ------------------------------------------------------------------ R70 -- */

test('Ende (R70): die Endzeilen erscheinen genau auf ihren Wegen – je eine, und ohne Grenze und Offenes keine', () => {
  const ids = geschichte.stationen.map((st) => st.id);
  /** Wahlen s1–s8 als Buchstabenfolge; Endzeile als Index in ende.zeilen (null = keine). Gerechnet über alle Wege (R70). */
  const wege: Array<[string, number | null, (s: { kosten: number; offen: number }) => boolean]> = [
    ['AAAABAAA', 0, (s) => s.kosten > 61.3 && s.offen >= 1],
    ['AAAABABB', 1, (s) => s.kosten <= 61.3 && s.offen >= 1],
    ['AACBBKAA', 2, (s) => s.kosten > 61.3 && s.offen < 1],
    ['AAAAAAAA', null, (s) => s.kosten <= 61.3 && s.offen < 1],
  ];
  assert.equal(geschichte.ende.zeilen.length, 3);
  for (const [weg, zeile, lage] of wege) {
    const wahlen = Object.fromEntries([...weg].map((x, i) => [ids[i], x]));
    const stand: Stand = { ...neuerStand(), wahlen, schritt: { ort: 'ende' } };
    const s = status(geschichte, stand, { ort: 'ende' });
    assert.ok(lage(s), `${weg}: Kosten ${s.kosten}, offen ${s.offen} passen nicht zur erwarteten Zeile`);
    const el = ohneBedienung(geschichte, stand);
    const texte = [...el.querySelectorAll('[data-pruef="gs-ende-zeile"]')].map((p) => p.textContent);
    const soll = zeile === null ? [] : [h1(geschichte.ende.zeilen[zeile]?.html ?? '')];
    assert.deepEqual(texte, soll, `${weg} (Kosten ${s.kosten}, offen ${s.offen})`);
  }
});

/** Story-Fläche auf der Vorlage einer Station, mit Helfern für die Gegenprobe. */
function aufVorlage(id: string) {
  const f = erzeugeGeschichte({ g: geschichte, speicher: null, themaTitel: () => null });
  document.body.replaceChildren(f.element);
  f.zuStation(id);
  f.element.querySelector<HTMLButtonElement>('[data-pruef="weiter"]')?.click();
  assert.deepEqual(f.stand().schritt, { ort: 'station', station: id, teil: 'vorlage' });
  const st = station(id);
  const spalte = (): number[] => [...f.element.querySelectorAll('[data-pruef="gs-vergleich"] tbody td.gs-zahl-spalte')].map((td) => Number(td.textContent));
  const summen = (): string[] => [...f.element.querySelectorAll<HTMLElement>('[data-pruef="gs-vergleich"] [data-pruef^="summe-"]')].map((td) => `${td.dataset['pruef']?.slice(6)}:${td.querySelector('b')?.textContent}`);
  const regler = (k: string): HTMLInputElement => {
    const r = f.element.querySelector<HTMLInputElement>(`[data-pruef="gs-gegenprobe"] input[data-kriterium="${k}"]`);
    assert.ok(r, k);
    return r;
  };
  const stelle = (k: string, wert: number): void => {
    const r = regler(k);
    r.value = String(wert);
    r.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const zurueck = (): HTMLButtonElement => {
    const b = f.element.querySelector<HTMLButtonElement>('[data-pruef="gegenprobe-zurueck"]');
    assert.ok(b, 'Knopf „zurücksetzen“');
    return b;
  };
  const offen = (): boolean => f.element.querySelector('[data-pruef="gs-gegenprobe"]')?.hasAttribute('open') ?? false;
  return { f, st, spalte, summen, regler, stelle, zurueck, offen };
}

test('Gegenprobe (R70): „zurücksetzen“ zeigt wieder die geltenden Gewichte – Gewichtsspalte, Summen, Kipppunkte und Regler', () => {
  const { f, st, spalte, summen, regler, stelle, zurueck } = aufVorlage('s3');
  const gew = gewichte(geschichte, f.stand());
  const soll = geschichte.kriterien.map((k) => gew[k.id]);
  const sollSummen = rangfolge(st.vorlage.optionen, geschichte.kriterien, gew).map((p) => `${p.option.id}:${p.summe}`);
  const kipp = (): string[] => [...f.element.querySelectorAll('[data-pruef="gs-kipp"] li')].map((li) => li.textContent ?? '');
  const sollKipp = kipp();
  assert.deepEqual(spalte(), soll);
  assert.deepEqual(summen(), sollSummen);
  stelle('kosten', gew['kosten'] === 5 ? 1 : 5);
  stelle('termin', gew['termin'] === 1 ? 5 : 1);
  assert.notDeepEqual(spalte(), soll, 'die Gegenprobe verschiebt die Gewichtsspalte');
  assert.notDeepEqual(summen(), sollSummen, 'die Gegenprobe verschiebt die Summen');
  zurueck().click();
  assert.deepEqual(spalte(), soll, 'Gewichtsspalte nach „zurücksetzen“');
  assert.deepEqual(summen(), sollSummen, 'Summen nach „zurücksetzen“');
  assert.deepEqual(kipp(), sollKipp, 'Kipppunkte nach „zurücksetzen“');
  assert.deepEqual(geschichte.kriterien.map((k) => Number(regler(k.id).value)), soll, 'Regler nach „zurücksetzen“');
  // und von dort aus rechnet die nächste Gegenprobe wieder mit den geltenden Gewichten
  stelle('qualitaet', gew['qualitaet'] === 5 ? 4 : 5);
  assert.deepEqual(spalte(), geschichte.kriterien.map((k) => (k.id === 'qualitaet' ? (gew['qualitaet'] === 5 ? 4 : 5) : gew[k.id])));
});

test('Tastatur (R70): nach „zurücksetzen“ bleibt die Gegenprobe offen, der Fokus auf dem Knopf, Pfeil rechts blättert nicht', () => {
  const { f, st, stelle, zurueck, offen } = aufVorlage('s3');
  // mit gewählter Option: Pfeil rechts ginge sonst zur Folge
  const opt = st.vorlage.optionen.find((o) => !o.klaerung);
  assert.ok(opt);
  f.element.querySelector<HTMLButtonElement>(`[data-pruef="option-${opt.id}"]`)?.click();
  // aufklappen wie mit dem summary, dann einen Regler verschieben
  const details = f.element.querySelector<HTMLDetailsElement>('[data-pruef="gs-gegenprobe"]');
  assert.ok(details);
  details.open = true;
  stelle('kosten', 5);
  assert.equal(offen(), true);
  zurueck().focus();
  zurueck().click();
  assert.equal(offen(), true, 'Gegenprobe bleibt nach „zurücksetzen“ offen');
  assert.notEqual(document.activeElement, document.body, 'Fokus fällt nicht auf <body>');
  assert.equal(document.activeElement, zurueck(), 'Fokus bleibt auf dem Knopf');
  const schritt = f.stand().schritt;
  const e = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
  zurueck().dispatchEvent(e);
  assert.equal(f.taste(e), false, 'Pfeil am Knopf der Gegenprobe blättert nicht');
  assert.deepEqual(f.stand().schritt, schritt);
  // ein Schrittwechsel klappt sie wieder zu
  f.element.querySelector<HTMLButtonElement>('[data-pruef="zurueck"]')?.click();
  f.element.querySelector<HTMLButtonElement>('[data-pruef="weiter"]')?.click();
  assert.deepEqual(f.stand().schritt, schritt);
  assert.equal(offen(), false, 'nach dem Schrittwechsel wieder zu');
});

test('Empfehlung bei anderen Gewichten (R71): der Ersatzsatz nennt die Gewichte, mit denen die Empfehlung begründet ist – nicht „die vorgeschlagenen“', () => {
  const s1 = geschichte.stationen.find((x) => x.vorlage.art === 'gewichte');
  assert.ok(s1);
  const grundlage = s1.vorlage.optionen.find((o) => o.id === s1.vorlage.empfehlung.option)?.titel;
  assert.equal(grundlage, 'Termin vor Kosten');
  const andere = s1.vorlage.optionen.find((o) => o.id !== s1.vorlage.empfehlung.option && o.titel === 'Kosten vor Termin');
  assert.ok(andere);
  let ersetzt = 0;
  for (const id of ['s4', 's8']) {
    const stand = an(waehle(geschichte, neuerStand(), s1.id, andere.id), id, 'vorlage');
    const el = ohneBedienung(geschichte, stand);
    const text = el.querySelector('[data-pruef="gs-empfehlung"]')?.textContent ?? '';
    const vorn = station(id).vorlage.optionen.find((o) => o.id === empfohlen(geschichte, stand, station(id)));
    assert.ok(vorn);
    assert.notEqual(vorn.id, station(id).vorlage.empfehlung.option, `${id}: mit „Kosten vor Termin“ liegt eine andere Option vorn`);
    ersetzt++;
    assert.ok(text.includes(W.geschichte.empfehlungAllgemein(vorn.titel, grundlage)), `${id}: Ersatzsatz fehlt („${text}“)`);
    assert.ok(text.includes(`mit den Gewichten „${grundlage}“ begründet`), id);
    // „Kosten vor Termin“ ist selbst einer der drei Vorschläge aus Station 1
    assert.doesNotMatch(text, /vorgeschlagenen Gewichte/u, id);
  }
  assert.equal(ersetzt, 2);
});

test('Gegenprobe (R71): die Statuszeile nennt die Spitze und folgt jedem Regler', () => {
  const { f, st, stelle } = aufVorlage('s3');
  const vorn = (): HTMLElement | null => f.element.querySelector<HTMLElement>('[data-pruef="gegenprobe-vorn"]');
  const erwartet = (gew: Record<string, number>): string => {
    const p = rangfolge(st.vorlage.optionen, geschichte.kriterien, gew).filter((x) => x.rang === 1);
    return `Mit diesen Gewichten vorn: ${p.map((x) => `„${x.option.titel}“`).join(' und ')} (${p[0]?.summe} Punkte).`;
  };
  const gew = { ...gewichte(geschichte, f.stand()) };
  assert.equal(vorn()?.getAttribute('role'), 'status');
  assert.equal(vorn()?.textContent, erwartet(gew));
  stelle('termin', 1);
  gew['termin'] = 1;
  assert.equal(vorn()?.textContent, erwartet(gew), 'nach dem Regler „Termin“');
  stelle('kosten', 5);
  gew['kosten'] = 5;
  assert.equal(vorn()?.textContent, erwartet(gew), 'nach dem zweiten Regler');
});
