// Entscheidungsgraph (P1.4, L-20; seit P5.10 in inhalte/, L-45): die Inhalte sind mit dem vollen Graph-Prüfer
// fehlerfrei, jede Rolle kann an jeder Entscheidungsstation wählen, und jedes der drei Enden ist über eine Wahl
// in der Wirklichkeit erreichbar. Bis P5.10 prüfte diese Datei (damals entwurf.test.ts) den Entwurf unter entwurf/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { kompiliere } from '../werkzeuge/inhalte.mjs';
import { ANPASSUNGEN, pruefeEntwurf } from '../werkzeuge/entwurf.mjs';
import { berechneStatus, wendeWirkung } from '../src/engine/status.ts';
import type { Aktion, Status, StoryModell } from '../src/engine/typen.ts';
import { wende } from '../src/engine/aktionen.ts';
import { anfangszustand } from '../src/engine/zustand.ts';
import { aktuellerSchritt, naechsteStation } from '../src/engine/graph.ts';
import { rueckbezug } from '../src/engine/gedaechtnis.ts';

const ROLLEN = ['gf', 'bauherr', 'pl', 'ps', 'planung', 'controlling'];
const erg = await kompiliere({ pruefe: true, ziel: null });

test('Inhalte: Graph, Form, Zitate, Begriffe und Abdeckung ohne Fehler und ohne Warnung', () => {
  assert.deepEqual(erg.fehler, []);
  assert.deepEqual(erg.warnungen, []);
});

test('Nachweiskette (R47): unter „Entscheidungs-ID“ steht nur eine Entscheidungs-ID, eine Freigabe oder „Noch keine“', () => {
  const kennungen = Object.values(erg.inhalte.stationen).flatMap((s: any) => (s.nachweis ? [[s.id, s.nachweis.kennung]] : []));
  assert.ok(kennungen.length >= 6, 'alle Stationen der Welt B tragen eine Nachweiskette');
  // AEN- (Änderung), PRB- (Problem), FRW-/RIS- sind Registerkennungen, keine Entscheidungs-IDs (k4.3-p2, k13-t1; L-125, L-130)
  for (const [id, k] of kennungen) assert.match(String(k), /^(?:ENT-\d|„?Freigabe LPH|Noch keine)/u, `${id}: ${k}`);
  // R48: die Felder sind Klartext (die Grafik setzt sie als Text) – kein Markdown, das sichtbar stünde
  for (const s of Object.values(erg.inhalte.stationen) as any[]) {
    if (!s.nachweis) continue;
    for (const [feld, wert] of Object.entries(s.nachweis)) if (feld !== 'text') assert.doesNotMatch(String(wert), /`|\*\*|\[\[/u, `${s.id}.${feld}: ${wert}`);
  }
});

test('Entwurfswerkzeug (L-45): ohne Entwürfe keine Anpassung, nichts überlagert, dasselbe Ergebnis wie inhalte/', async () => {
  assert.deepEqual(ANPASSUNGEN, [], 'die Express-Kanten stehen seit P5.10 fest in inhalte/');
  const e = await pruefeEntwurf();
  assert.deepEqual(e.fehler, []);
  assert.deepEqual(e.ueberlagert, [], 'entwurf/ enthält nur LIESMICH.md, die nicht überlagert wird');
  assert.deepEqual(Object.keys(e.inhalte.stationen).sort(), Object.keys(erg.inhalte.stationen).sort());
  assert.deepEqual(e.inhalte.stationsFolge, erg.inhalte.stationsFolge);
});

test('Graph: alle sechs Rollen spielbar, drei Enden, Epilog als Schluss, keine Vergleichsstation mehr', () => {
  const st = erg.inhalte.stationen;
  assert.deepEqual(Object.values(erg.inhalte.rollen).filter((r: any) => r.spielbar).map((r: any) => r.id).sort(), [...ROLLEN].sort());
  for (const e of ['ende-steuerbar', 'ende-auflagen', 'ende-neufestlegung']) {
    assert.equal(st[e]?.art, 'ende', e);
    assert.deepEqual(st[e]?.weiter.map((k: any) => k.ziel), ['epilog'], e);
  }
  assert.equal(st.epilog?.ende, true);
  assert.deepEqual(st.wirklichkeit?.weiter.map((k: any) => k.ziel), ['ende-steuerbar', 'ende-neufestlegung', 'ende-neufestlegung', 'ende-auflagen']);
  assert.equal(st['A3-B3-vergleich'], undefined, 'die Durchstich-Station ist entfallen (L-45)');
  assert.deepEqual(Object.values(st).filter((s: any) => s.art === 'vergleich'), []);
  // Welt B öffnet sich am Wendepunkt/Rückspulen (nicht mehr am Vergleich)
  const frei = Object.values(st).filter((s: any) => (s.schaltetFrei ?? []).includes('weltB')).map((s: any) => s.id).sort();
  assert.ok(frei.length > 0 && frei.every((id: string) => id === 'wendepunkt' || id === 'rueckspulen'), `schaltet frei: ${frei.join(', ')}`);
});

test('Enden-Logik (H10): die Wahl in der Wirklichkeit gibt die Richtung, die Spur entscheidet', () => {
  const szenen = erg.inhalte.stationen.wirklichkeit.szenen;
  // Kanten der Wirklichkeit (L-48): Wahl A und EF ≥ 3 → steuerbar; Kostenunsicherheit sehr hoch oder Wahl B mit EF ≤ 1 → Neufestlegung; sonst Auflagen
  const ende = (wahl: string, s: Status): string => (wahl === 'A' && s.entscheidungsfaehigkeit >= 3 ? 'ende-steuerbar'
    : s.kostenunsicherheit === 'sehr hoch' || (wahl === 'B' && s.entscheidungsfaehigkeit <= 1) ? 'ende-neufestlegung' : 'ende-auflagen');
  const a6 = wendeWirkung(null, erg.inhalte.stationen.A6.statusStart);
  for (const r of ROLLEN) {
    const opt = szenen[r]?.entscheidung?.optionen ?? [];
    assert.deepEqual(opt.map((o: any) => o.id), ['A', 'B', 'C'], r);
    const a6opt = erg.inhalte.stationen.A6.szenen[r]?.entscheidung?.optionen ?? [];
    const erreicht = new Map<string, Set<string>>();
    for (const o of opt) {
      const enden = new Set<string>();
      for (const v of a6opt) enden.add(ende(o.id, wendeWirkung(wendeWirkung(a6, v.wirkung), o.wirkung)));
      erreicht.set(o.id, enden);
    }
    // A führt je nach Spur (Wahl in A6) zu „steuerbar“ oder nicht – die Wahl allein legt es nicht fest
    assert.ok(erreicht.get('A')?.has('ende-steuerbar'), `${r}: A kann steuerbar enden`);
    assert.ok((erreicht.get('A')?.size ?? 0) >= 2, `${r}: A hängt von der Spur ab (${[...(erreicht.get('A') ?? [])].join(', ')})`);
    assert.ok(!erreicht.get('B')?.has('ende-steuerbar') && !erreicht.get('C')?.has('ende-steuerbar'), `${r}: nur A führt zu steuerbar`);
    assert.ok(erreicht.get('C')?.has('ende-neufestlegung'), `${r}: C kann zur Neufestlegung führen`);
    assert.ok(erreicht.get('B')?.has('ende-auflagen'), `${r}: B kann mit Auflagen enden`);
    assert.ok((erreicht.get('B')?.size ?? 0) >= 2, `${r}: B hängt von der Spur ab (${[...(erreicht.get('B') ?? [])].join(', ')})`);
  }
});

test('Rückbezüge der Enden (L-103, L-104): jedes Ende hat genau die Rückbezüge der Wahlen, die es erreichen – über jede Spur gerechnet', () => {
  // Jede Wahl in Welt A (Haupt- und Express-Weg), jede Auswahl angeforderter Informationen, jede Wahl in der
  // Wirklichkeit – mit der Status-Rechnung der Engine und ihren Kanten. Welt B wirkt nicht auf den Status A.
  // Die Wirklichkeit hat keinen status-start und keine Informationen: ihr Stand ist der von A6 plus die Wahl.
  const m = erg.inhalte as StoryModell;
  const wk = m.stationen.wirklichkeit!;
  assert.equal(wk.statusStart, null);
  assert.deepEqual(wk.infos, []);
  const enden = ['ende-steuerbar', 'ende-auflagen', 'ende-neufestlegung'];
  for (const r of ROLLEN) {
    const went = wk.szenen[r]!.entscheidung!;
    const erreicht = new Map<string, Set<string>>(enden.map((e) => [e, new Set<string>()]));
    for (const weg of [['A1', 'A2', 'A3', 'A4', 'A5', 'A6'], ['A3', 'A6']]) {
      const ents = weg.map((id) => m.stationen[id]!.szenen[r]!.entscheidung!);
      let kombis: string[][] = [[]];
      for (const e of ents) kombis = kombis.flatMap((k) => e.optionen.map((o) => [...k, o.id]));
      for (const k of kombis) {
        for (let maske = 0; maske < 1 << weg.length; maske++) {
          const z = {
            ...anfangszustand(),
            rolle: r,
            verlauf: weg,
            entscheidungen: Object.fromEntries(ents.map((e, i) => [e.id, k[i]!])),
            info: weg.flatMap((id, i) => ((maske >> i) & 1 ? m.stationen[id]!.infos.map((x) => `${id}/${x.id}`) : [])),
          };
          const a6 = berechneStatus(z, m).A;
          for (const o of went.optionen) {
            const ziel = naechsteStation(wk, { ...z, verlauf: [...weg, 'wirklichkeit'], entscheidungen: { ...z.entscheidungen, [went.id]: o.id }, status: { A: wendeWirkung(a6, o.wirkung), B: null } }, m);
            assert.ok(ziel !== null && erreicht.has(ziel), `${r}: Ziel ${ziel}`);
            erreicht.get(ziel)!.add(o.id);
          }
        }
      }
    }
    for (const e of enden) {
      const rb = m.stationen[e]!.szenen[r]!.rueckbezug!;
      assert.equal(rb.auf, went.id, `${e}/${r}`);
      assert.deepEqual(Object.keys(rb.texte).sort(), [...erreicht.get(e)!].sort(), `${e}/${r}: Rückbezüge = Wahlen, die das Ende erreichen`);
      assert.ok(rb.ohne !== null, `${e}/${r}: „ohne“ für Sprünge und Permalinks`);
    }
  }
});

test('Graph mit dem Reducer durchgespielt: jede Rolle vom Prolog bis zum Epilog, jedes Ende, Rückbezüge in Welt B', () => {
  const m = erg.inhalte as StoryModell;
  // Wahl in A6 = C (je nach Rolle Lage offenlegen, Bandbreite melden, beim Abgleich helfen, Freigabe noch nicht vorlegen) hebt die Entscheidungsfähigkeit: dann trägt A bis „steuerbar“
  const soll: Record<string, string> = { A: 'ende-steuerbar', B: 'ende-auflagen', C: 'ende-neufestlegung' };
  for (const r of ROLLEN) {
    for (const [wahl, ende] of Object.entries(soll)) {
      let z = anfangszustand();
      const tu = (a: Aktion): void => { z = wende(z, a, m); };
      tu({ art: 'starteStory' });
      tu({ art: 'waehleRolle', rolle: r });
      const besucht: string[] = [];
      let rueckbezuege = 0;
      for (let i = 0; i < 2000; i++) {
        const st = z.station;
        if (st !== null && besucht[besucht.length - 1] !== st) besucht.push(st);
        const s = aktuellerSchritt(z, m);
        if (s?.art === 'entscheidung' && st !== null) {
          const ent = m.stationen[st]?.szenen[r]?.entscheidung;
          if (ent !== undefined && ent !== null && z.entscheidungen[ent.id] === undefined) tu({ art: 'waehle', option: st === 'wirklichkeit' ? wahl : st === 'A6' ? 'C' : 'A' });
        }
        if (s?.art === 'rueckbezug' && rueckbezug(z, m)?.option !== undefined) rueckbezuege += 1;
        const vorher = z;
        tu({ art: 'weiter' });
        if (z === vorher) break; // Ende erreicht (oder festgefahren – die Prüfung unten sagt, welches)
      }
      assert.equal(besucht[besucht.length - 1], 'epilog', `${r}/${wahl}: endet im Epilog, nicht in ${besucht[besucht.length - 1]}`);
      assert.ok(besucht.includes(ende), `${r}/${wahl}: Ende ${ende} (Weg: ${besucht.join(' → ')})`);
      for (const n of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'wendepunkt', 'rueckspulen', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'wirklichkeit']) assert.ok(besucht.includes(n), `${r}/${wahl}: ${n} besucht`);
      assert.ok(rueckbezuege >= 6, `${r}/${wahl}: Rückbezüge in Welt B greifen (${rueckbezuege})`);
      assert.ok(z.status.A !== null && z.status.B !== null);
      assert.equal(z.freigeschaltet.explore, true, `${r}/${wahl}: Explore ist mit dem Ende freigeschaltet`);
    }
  }
});

test('Express-Pfad (E8, L-26): Interesse „express“ führt über A3, A6, Wendepunkt, B3, B6 zur Wirklichkeit – für jede Rolle (überall A: die Spur trägt nicht bis „steuerbar“)', () => {
  const m = erg.inhalte as StoryModell;
  for (const r of ROLLEN) {
    let z = anfangszustand();
    const tu = (a: Aktion): void => { z = wende(z, a, m); };
    tu({ art: 'starteStory' });
    tu({ art: 'waehleRolle', rolle: r });
    tu({ art: 'setzeInteressen', interessen: ['express'] });
    const besucht: string[] = [];
    for (let i = 0; i < 1000; i++) {
      const st = z.station;
      if (st !== null && besucht[besucht.length - 1] !== st) besucht.push(st);
      const s = aktuellerSchritt(z, m);
      if (s?.art === 'entscheidung' && st !== null) {
        const ent = m.stationen[st]?.szenen[r]?.entscheidung;
        if (ent !== undefined && ent !== null && z.entscheidungen[ent.id] === undefined) tu({ art: 'waehle', option: 'A' });
      }
      const vorher = z;
      tu({ art: 'weiter' });
      if (z === vorher) break;
    }
    assert.deepEqual(besucht, ['prolog', 'A3', 'A6', 'wendepunkt', 'rueckspulen', 'B3', 'B6', 'wirklichkeit', 'ende-auflagen', 'epilog'], r);
  }
});

test('Story-Karte (stationsFolge): Hauptweg in Reihenfolge, Enden hinter der Wirklichkeit, Epilog zuletzt', () => {
  assert.deepEqual(erg.inhalte.stationsFolge, ['prolog', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'wendepunkt', 'rueckspulen',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'wirklichkeit', 'ende-steuerbar', 'ende-neufestlegung', 'ende-auflagen', 'epilog']);
});

test('Vertiefung je Interesse (P3.9): A1–A6 haben je eine Karte für Kosten, Mandate, Risiko und Freigaben, jede mit Zitat', () => {
  for (const id of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']) {
    const v = erg.inhalte.stationen[id]?.vertiefungen ?? [];
    assert.deepEqual(v.map((x: any) => x.interesse).sort(), ['freigaben', 'kosten', 'organisation', 'risiko'], id);
    for (const x of v) assert.match(x.html, /class="mvg-zitat" data-absatz="k/u, `${id}/${x.interesse}: ohne Zitat`);
  }
});

test('Wendepunkt-Radar (P4.7): jedes Symptom, das eine Station A1–A6 in ihrer Tabelle nennt, ist dort als erlebt eingetragen', async () => {
  const schritt = erg.inhalte.stationen.wendepunkt?.schritte.find((s: any) => s.id === 'symptome');
  const tafel = schritt?.bloecke.find((b: any) => b.art === 'tafel');
  assert.ok(tafel, 'Tafel im Schritt „symptome“');
  const zeilen: string[][] = tafel.kopf.tabelle.zeilen;
  const glatt = (t: string): string => t.replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/gu, '$1').replace(/-(?=[a-zäöü])/gu, '').toLowerCase();
  for (const id of ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']) {
    const pfad = `inhalte/story/${id}/station.md`;
    const text = glatt(readFileSync(pfad, 'utf8'));
    zeilen.forEach((z, i) => {
      if (text.includes(`| ${glatt(z[0] ?? '')} |`)) assert.ok((tafel.kopf.erlebt[String(i + 1)] ?? []).includes(id), `${id} nennt „${z[0]}“, fehlt in erlebt.${i + 1}`);
    });
  }
});

test('Wendepunkt und Rückspulen zeigen keine Statusinstrumente (DREHBUCH: kein Status)', async () => {
  const { instrumenteSichtbar } = await import('../src/ui/anzeige.ts');
  const { oeffentlich } = await import('../src/engine/zustand.ts');
  for (const station of ['wendepunkt', 'rueckspulen']) {
    const z = { ...anfangszustand(), bereich: 'story' as const, rolle: 'pl', station, schritt: 1, spur: [{ station: 'A6', schritt: 0, text: 'x', zeit: 0 }] };
    assert.equal(instrumenteSichtbar(oeffentlich(z as any), erg.inhalte), false, station);
  }
});

test('Ihre Spur (E1, P5.8): Partner werden zu einer Zeile zusammengefasst, A links, B rechts, in Story-Reihenfolge', async () => {
  const { spurZeilen } = await import('../src/ui/leitstand/spur.ts');
  const e = (station: string, welt: 'A' | 'B', option: string, nr: number) => ({ nr, entscheidung: `${station}/pl`, station, welt, rolle: 'pl', option, wechsel: 0, zeit: null });
  const spur = [e('A1', 'A', 'A', 1), e('A3', 'A', 'B', 2), e('A3', 'A', 'C', 3), e('B1', 'B', 'B', 4), e('B4', 'B', 'A', 5)];
  const zeilen = spurZeilen(spur, erg.inhalte);
  assert.deepEqual(zeilen.map((z: any) => [z.station, z.a?.option ?? null, z.b?.option ?? null]), [['A1', 'A', 'B'], ['A3', 'C', null], ['A4', null, 'A']]);
});

test('Frühwarnung ist kein Risiko (R48, L-136 (2)): keine Option, die eine Frühwarnung erfasst, erhöht die offenen Risiken', () => {
  let geprueft = 0;
  for (const s of Object.values(erg.inhalte.stationen) as any[]) {
    for (const [rolle, sz] of Object.entries(s.szenen ?? {}) as [string, any][]) {
      for (const o of sz?.entscheidung?.optionen ?? []) {
        if (!/Frühwarnung/u.test(`${o.titel} ${o.kurz}`) || /Risiko/u.test(`${o.titel} ${o.kurz}`)) continue;
        geprueft += 1;
        const risiken = (o.wirkung ?? []).filter((w: any) => w.schluessel === 'offeneRisiken' && Number(w.wert) > 0);
        assert.deepEqual(risiken, [], `${s.id}/${rolle}/${o.id}: „${o.kurz}“ erhöht die offenen Risiken`);
      }
    }
  }
  assert.ok(geprueft >= 3, `nur ${geprueft} Optionen „Frühwarnung erfassen“ gefunden`);
});

test('Express-Karten (R48, L-136 (3)): jede Station, zu der der Express-Pfad springt, sagt, was dazwischen geschah', () => {
  const ziele = new Set<string>();
  for (const s of Object.values(erg.inhalte.stationen) as any[]) {
    for (const w of s.weiter ?? []) if (w?.wenn?.art === 'interesse' && w.wenn.interesse === 'express' && w.wenn.nicht === false) ziele.add(w.ziel);
  }
  assert.ok(ziele.has('A3') && ziele.has('A6'), `Sprungziele: ${[...ziele].join(', ')}`);
  for (const z of ziele) assert.ok(String((erg.inhalte.stationen as any)[z]?.express ?? '').replace(/<[^>]+>/gu, '').trim().length > 20, `${z}: keine Express-Karte`);
});

test('Rückbezüge (R49): jeder Text nennt die frühere Wahl mit ihrem Kurztitel und den richtigen Monat bzw. „In Welt A“', () => {
  const MONATE = ['', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const st = erg.inhalte.stationen as any;
  let geprueft = 0;
  for (const [id, s] of Object.entries(st) as [string, any][]) {
    for (const [rolle, sz] of Object.entries(s.szenen ?? {}) as [string, any][]) {
      const rb = sz?.rueckbezug;
      if (!rb) continue;
      const [bezSt, bezRolle] = String(rb.auf).split('/');
      const ent = st[bezSt ?? '']?.szenen?.[bezRolle ?? rolle]?.entscheidung;
      assert.ok(ent, `${id}/${rolle}: Bezug ${rb.auf} ohne Entscheidung`);
      for (const [o, text] of Object.entries(rb.texte ?? {}) as [string, string][]) {
        const opt = ent.optionen.find((x: any) => x.id === o);
        assert.ok(opt, `${id}/${rolle}: Option ${o} fehlt in ${rb.auf}`);
        assert.ok(text.includes(`‚${opt.kurz}‘`), `${id}/${rolle}/${o}: nennt nicht ‚${opt.kurz}‘`);
        const anfang = s.welt === 'B' ? 'In Welt A' : `Im ${MONATE[Number(st[bezSt ?? '']?.monat)] ?? '?'}`;
        assert.ok(text.replace(/<[^>]+>/gu, '').startsWith(anfang), `${id}/${rolle}/${o}: beginnt nicht mit „${anfang}“`);
        geprueft += 1;
      }
    }
  }
  assert.ok(geprueft >= 150, `nur ${geprueft} Rückbezüge geprüft`);
});

test('Schluss ohne Werbung (R49, O-1, O-34): Wirklichkeit, Enden und Epilog nennen Bauherr Mentoren nur im Hinweis zur Reifegradanalyse (O-8)', () => {
  const w = JSON.parse(readFileSync(new URL('../quellen/whitepaper/v1.2/whitepaper.json', import.meta.url), 'utf8'));
  const finde = (o: unknown, id: string): unknown => {
    if (Array.isArray(o)) { for (const x of o) { const r = finde(x, id); if (r) return r; } return null; }
    if (o !== null && typeof o === 'object') {
      if ((o as { id?: string }).id === id) return o;
      for (const v of Object.values(o)) { const r = finde(v, id); if (r) return r; }
    }
    return null;
  };
  const bm = (t: string): string[] => t.match(/Bauherr Mentoren|\bBM\b/gu) ?? [];
  for (const id of ['wirklichkeit', 'ende-steuerbar', 'ende-auflagen', 'ende-neufestlegung', 'epilog']) {
    const text = JSON.stringify((erg.inhalte.stationen as any)[id]);
    const erlaubt = id === 'epilog' ? (text.match(/eine Methode von Bauherr Mentoren/gu) ?? []).length : 0;
    assert.equal(bm(text).length, erlaubt, `${id}: ${bm(text).length} Nennungen`);
    if (id !== 'wirklichkeit' && id !== 'epilog') continue;
    for (const t of new Set(text.match(/"id":"(k[\d.]+-t\d+)"/gu)?.map((x) => x.split('"')[3] ?? '') ?? [])) {
      assert.deepEqual(bm(JSON.stringify(finde(w, t) ?? {})), [], `${id}: Tafel ${t} nennt Bauherr Mentoren`);
    }
  }
  // R50 (O-1, O-34): der Quellen-Reiter der Seitenleiste zeigt die Absätze aus whitepaper-bezug vollständig – im Schluss ohne
  // Bauherr Mentoren, in keiner Station mit Angebotsaussagen („kostenfrei“, „Lizenzentgelt“); vorher prüfte der Test nur Kennungen
  const quellen = (erg.inhalte as unknown as { quellen: Record<string, { html: string }> }).quellen;
  const schluss = ['wirklichkeit', 'ende-steuerbar', 'ende-auflagen', 'ende-neufestlegung', 'epilog'];
  for (const [id, st] of Object.entries(erg.inhalte.stationen as unknown as Record<string, { whitepaper: string[] }>)) {
    const text = st.whitepaper.map((q) => quellen[q]?.html ?? '').join(' ');
    assert.doesNotMatch(text, /kostenfrei|Lizenzentgelt/u, `${id}: Angebotsaussage im Quellen-Reiter`);
    if (schluss.includes(id)) assert.deepEqual(bm(text), [], `${id}: Quellen-Reiter nennt Bauherr Mentoren`);
    // R51: auch keine Leistungsbeschreibung (Reifegradanalyse Kap. 7.1 mit Dauer und Lieferumfang, Einstieg 12.1, Companion 6.3-p3)
    if (schluss.includes(id)) assert.deepEqual(st.whitepaper.filter((q) => /^k(?:7\.1|12\.1)-|^k6\.3-p3$/u.test(q)), [], `${id}: Leistungsbeschreibung im Quellen-Reiter`);
  }
});

test('Statuswirkung (R62, R63): jeder Wirkeintrag zeigt sich in einer Spur; in Welt B wirkt jede Option auch auf den einheitlichen Wegen', () => {
  // eine Wirkung auf einen Wert, der in jeder Spur schon am Anschlag steht („sehr hoch“, 5 von 5), wäre unsichtbar (R62);
  // in Welt B erzählt jede Wahl eine Wirkung – sie zeigt sich auch dort, wo alle früheren Wahlen gleich waren (R63: B5/B6 stand
  // nach dem Spur-Delta am Anschlag). In Welt A darf ein Wert am Anschlag stehen – die Konsequenz sagt dann „bleibt …“
  const m = erg.inhalte as StoryModell;
  const leer: string[] = [];
  const sicht = (s: Status | null): string => JSON.stringify(s === null ? null : { ...s, hinweise: null });
  for (const [welt, weg] of [['A', ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']], ['B', ['B1', 'B2', 'B3', 'B4', 'B5', 'B6']]] as const) {
    for (const r of ROLLEN) {
      const ents = weg.map((id) => (m.stationen[id] as any)?.szenen[r]?.entscheidung ?? null);
      weg.forEach((id, j) => {
        const e = ents[j];
        if (e === null) return;
        let kombis: Record<string, string>[] = [{}];
        for (const f of ents.slice(0, j)) if (f !== null) kombis = kombis.flatMap((k) => f.optionen.map((p: any) => ({ ...k, [f.id]: p.id })));
        const alleInfos = weg.slice(0, j + 1).flatMap((s) => ((m.stationen[s] as any)?.infos ?? []).map((i: any) => `${s}/${i.id}`));
        const modellOhne = (o: any, n: number): StoryModell => {
          // dieselbe Station mit der Option ohne ihren n-ten Wirkeintrag
          const st = m.stationen[id] as any;
          const e2 = { ...e, optionen: e.optionen.map((p: any) => (p === o ? { ...p, wirkung: p.wirkung.filter((_: unknown, i: number) => i !== n) } : p)) };
          return { ...m, stationen: { ...m.stationen, [id]: { ...st, szenen: { ...st.szenen, [r]: { ...st.szenen[r], entscheidung: e2 } } } } } as StoryModell;
        };
        for (const o of e.optionen) {
          if (o.wirkung.length === 0) continue;
          const zu = (ohne: Record<string, string>, info: string[]) => ({ ...anfangszustand(), rolle: r, verlauf: weg.slice(0, j + 1), entscheidungen: { ...ohne, [e.id]: o.id }, info });
          o.wirkung.forEach((w: any, n: number) => {
            const m2 = modellOhne(o, n);
            const sichtbar = kombis.some((k) => [[], alleInfos].some((info) => sicht(berechneStatus(zu(k, info) as any, m)[welt]) !== sicht(berechneStatus(zu(k, info) as any, m2)[welt])));
            if (!sichtbar) leer.push(`${r} ${id} ${o.id} ${w.schluessel}`);
          });
          if (welt === 'B') {
            for (const x of ['A', 'B', 'C']) {
              const k: Record<string, string> = {};
              for (const f of ents.slice(0, j)) if (f !== null) k[f.id] = f.optionen.some((p: any) => p.id === x) ? x : f.optionen[0].id;
              const ohne = { ...anfangszustand(), rolle: r, verlauf: weg.slice(0, j + 1), entscheidungen: k, info: [] };
              if (sicht(berechneStatus(ohne as any, m).B) === sicht(berechneStatus(zu(k, []) as any, m).B)) leer.push(`${r} ${id} ${o.id} (Weg überall ${x})`);
            }
          }
        }
      });
    }
  }
  assert.deepEqual(leer, []);
});

test('Regie-Notiz „steuerbar“ (R63): die A6-Wahlen, die bei Richtung A immer dorthin führen, sind genau C – bei der Projektsteuerung auch B', () => {
  const m = erg.inhalte as StoryModell;
  const weg = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'wendepunkt', 'rueckspulen', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'wirklichkeit'];
  const immer: string[] = [];
  for (const r of ROLLEN) {
    const ents = weg.map((id) => (m.stationen[id] as any)?.szenen?.[r]?.entscheidung ?? null);
    const a6 = ents[5];
    const wi = ents[14];
    let kombis: Record<string, string>[] = [{}];
    for (const f of ents.slice(0, 5)) if (f !== null) kombis = kombis.flatMap((k) => f.optionen.map((p: any) => ({ ...k, [f.id]: p.id })));
    for (const o of a6.optionen) {
      // Weiche in wirklichkeit/station.md: steuerbar bei Wahl A und Entscheidungsfähigkeit (Welt A) ≥ 3
      const alle = kombis.every((k) => (berechneStatus({ ...anfangszustand(), rolle: r, verlauf: weg, entscheidungen: { ...k, [a6.id]: o.id, [wi.id]: 'A' }, info: [] } as any, m).A as any).entscheidungsfaehigkeit >= 3);
      if (alle) immer.push(`${r} ${o.id}`);
    }
  }
  assert.deepEqual(immer.sort(), ['bauherr C', 'controlling C', 'gf C', 'pl C', 'planung C', 'ps B', 'ps C']);
  const notiz = readFileSync(new URL('../inhalte/story/ende-steuerbar/station.md', import.meta.url), 'utf8');
  assert.match(notiz, /Mit Option C in A6 gelingt das immer[^.]*bei der Projektsteuerung auch mit B/u);
});
