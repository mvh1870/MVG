/*
 * Story-Graph: Schrittfolge je Rolle, nächste Station, Reihenfolge für die Story-Karte und die
 * Graph-Prüfung des Inhaltswerkzeugs (erreichbar, keine Sackgassen, Welt B nur nach Freischaltung,
 * Rollen vollständig, Rückbezüge vollständig).
 */

import type { ModellEntscheidung, ModellSchritt, ModellStation, StoryModell, Zustand } from './typen.ts';
import { pruefeBedingung, type BedingungsQuelle } from './bedingungen.ts';

/** Schritte, die eine Rollenszene brauchen. */
const SZENEN_SCHRITTE = new Set(['entscheidung', 'konsequenz', 'rueckbezug']);

/** Die Schritte einer Station, wie die gespielte Rolle sie sieht. */
export function schritteFuer(st: ModellStation, rolle: string | null): ModellSchritt[] {
  const szene = rolle !== null ? st.szenen[rolle] : undefined;
  return st.schritte.filter((s) => {
    if (!SZENEN_SCHRITTE.has(s.art)) return true;
    if (szene === undefined) return false;
    if (s.art === 'rueckbezug') return szene.rueckbezug !== null;
    return szene.entscheidung !== null;
  });
}

/** Der Schritt, auf dem der Zustand steht (oder null außerhalb der Story). */
export function aktuellerSchritt(z: Pick<Zustand, 'station' | 'schritt' | 'rolle'>, modell: StoryModell): ModellSchritt | null {
  if (z.station === null) return null;
  const st = modell.stationen[z.station];
  if (st === undefined) return null;
  return schritteFuer(st, z.rolle)[z.schritt] ?? null;
}

/** Erste Kante, deren Bedingung gilt; null, wenn keine passt oder die Station ein Ende ist. */
export function naechsteStation(st: ModellStation, z: BedingungsQuelle, modell: StoryModell): string | null {
  if (st.ende) return null;
  for (const k of st.weiter) {
    if (k.wenn === null || pruefeBedingung(k.wenn, z, modell)) return k.ziel;
  }
  return null;
}

/**
 * Alle vom Start erreichbaren Stationen (Bedingungen werden ignoriert: jede Kante kann gelten).
 * `halt` markiert Stationen, über die hinaus nicht weitergegangen wird (sie selbst zählen mit).
 */
export function erreichbar(modell: StoryModell, start: string = modell.start, halt?: (st: ModellStation) => boolean): string[] {
  const gesehen = new Set<string>();
  const reihe: string[] = [];
  const warte = [start];
  while (warte.length > 0) {
    const id = warte.shift() as string;
    if (gesehen.has(id)) continue;
    const st = modell.stationen[id];
    if (st === undefined) continue;
    gesehen.add(id);
    reihe.push(id);
    if (halt !== undefined && halt(st)) continue;
    const folge = [...st.weiter.map((k) => k.ziel)];
    if (st.vergleich !== null) folge.push(st.vergleich.b);
    for (const z of folge) if (!gesehen.has(z)) warte.push(z);
  }
  return reihe;
}

/**
 * Reihenfolge der Stationen für die Story-Karte: zuerst der Hauptweg ab Start (je Station die Kante
 * ohne Bedingung, sonst die erste), dann jede weitere erreichbare Station direkt hinter ihrem
 * Vorgänger (Abzweige wie Express oder die Enden); Unerreichbares hinten, alphabetisch.
 */
export function stationsFolge(modell: StoryModell): string[] {
  const reihe: string[] = [];
  let id: string | undefined = modell.start;
  while (id !== undefined && !reihe.includes(id)) {
    const st: ModellStation | undefined = modell.stationen[id];
    if (st === undefined) break;
    reihe.push(id);
    if (st.ende) break;
    id = (st.weiter.find((k) => k.wenn === null) ?? st.weiter[0])?.ziel ?? st.vergleich?.b;
  }
  for (const z of erreichbar(modell)) {
    if (reihe.includes(z)) continue;
    const vor = reihe.findIndex((v) => {
      const st = modell.stationen[v];
      return st !== undefined && (st.weiter.some((k) => k.ziel === z) || st.vergleich?.b === z);
    });
    if (vor < 0) reihe.push(z);
    else {
      // hinter den Vorgänger und hinter schon eingefügte Abzweige desselben Vorgängers
      let i = vor + 1;
      const vst = modell.stationen[reihe[vor] ?? ''];
      while (i < reihe.length && vst !== undefined && vst.weiter.some((k) => k.ziel === reihe[i] && k.wenn !== null)) i += 1;
      reihe.splice(i, 0, z);
    }
  }
  const rest = Object.keys(modell.stationen).filter((x) => !reihe.includes(x)).sort();
  return [...reihe, ...rest];
}

/** Sucht eine Entscheidung nach Kennung über alle Szenen. */
export function findeEntscheidung(modell: StoryModell, id: string): { station: string; rolle: string; entscheidung: ModellEntscheidung } | null {
  for (const st of Object.values(modell.stationen)) {
    for (const [rolle, szene] of Object.entries(st.szenen)) {
      if (szene.entscheidung !== null && szene.entscheidung.id === id) return { station: st.id, rolle, entscheidung: szene.entscheidung };
    }
  }
  return null;
}

/**
 * Löst einen Verweis auf eine Entscheidung auf: exakte Kennung, sonst `<ref>/<rolle>`, sonst die
 * Entscheidung der Szene `rolle` an Station `ref`.
 */
export function loeseEntscheidung(modell: StoryModell, ref: string, rolle: string | null): string | null {
  if (findeEntscheidung(modell, ref) !== null) return ref;
  if (rolle !== null) {
    const kurz = `${ref}/${rolle}`;
    if (findeEntscheidung(modell, kurz) !== null) return kurz;
    const e = modell.stationen[ref]?.szenen[rolle]?.entscheidung;
    if (e !== null && e !== undefined) return e.id;
  }
  return null;
}

export interface GraphBefund {
  fehler: string[];
  warnungen: string[];
}

/** Die Graph-Prüfung (docs/INHALTSFORMAT.md Abschnitt 5, Zeile „Graph“). */
export function pruefeGraph(modell: StoryModell): GraphBefund {
  const fehler: string[] = [];
  const warnungen: string[] = [];
  const ids = Object.keys(modell.stationen).sort();

  if (modell.stationen[modell.start] === undefined) {
    fehler.push(`Startstation „${modell.start}“ fehlt`);
    return { fehler, warnungen };
  }

  // Verweise
  for (const id of ids) {
    const st = modell.stationen[id] as ModellStation;
    for (const k of st.weiter) {
      if (modell.stationen[k.ziel] === undefined) fehler.push(`Station ${id}: Folgestation „${k.ziel}“ existiert nicht`);
    }
    if (st.vergleich !== null) {
      for (const seite of [st.vergleich.a, st.vergleich.b]) {
        if (modell.stationen[seite] === undefined) fehler.push(`Station ${id}: Vergleichsstation „${seite}“ existiert nicht`);
      }
    }
    if (st.partner !== null) {
      const p = modell.stationen[st.partner];
      if (p === undefined) fehler.push(`Station ${id}: Partner „${st.partner}“ existiert nicht`);
      else if (p.welt === st.welt) fehler.push(`Station ${id}: Partner „${st.partner}“ liegt in derselben Welt`);
    }
  }

  // Erreichbarkeit
  const erreicht = new Set(erreichbar(modell));
  for (const id of ids) {
    if (!erreicht.has(id)) fehler.push(`Station ${id} ist vom Start (${modell.start}) nicht erreichbar`);
  }

  // Sackgassen
  for (const id of ids) {
    const st = modell.stationen[id] as ModellStation;
    if (st.ende) continue;
    if (st.weiter.length === 0) fehler.push(`Station ${id} ist eine Sackgasse: keine Folgestation und nicht als Ende markiert`);
    else if (st.weiter.every((k) => k.wenn !== null)) warnungen.push(`Station ${id}: alle Kanten haben Bedingungen – wenn keine gilt, bleibt die Geschichte stehen`);
  }
  if (!ids.some((id) => modell.stationen[id]?.ende === true)) fehler.push('Die Geschichte hat kein Ende (keine Station mit „ende: ja“)');

  // Welt B nur nach Freischaltung
  const schaltetB = (st: ModellStation): boolean => st.schaltetFrei.includes('weltB');
  for (const id of erreichbar(modell, modell.start, schaltetB)) {
    const st = modell.stationen[id] as ModellStation;
    if (st.welt === 'B' && !schaltetB(st)) fehler.push(`Station ${id} (Welt B) ist erreichbar, bevor Welt B freigeschaltet wird`);
  }

  // Rollen vollständig: jede spielbare Rolle braucht an jeder Station mit Entscheidungsschritt eine Szene
  const spielbar = Object.values(modell.rollen).filter((r) => r.spielbar).map((r) => r.id).sort();
  for (const id of ids) {
    const st = modell.stationen[id] as ModellStation;
    if (!erreicht.has(id)) continue;
    const braucht = st.schritte.some((s) => s.art === 'entscheidung' || s.art === 'konsequenz');
    const hatKonsequenz = st.schritte.some((s) => s.art === 'konsequenz');
    for (const rolle of spielbar) {
      const szene = st.szenen[rolle];
      if (braucht && (szene === undefined || szene.entscheidung === null)) {
        fehler.push(`Station ${id}: spielbare Rolle ${rolle} hat keine Szene mit Entscheidung`);
      }
      if (szene !== undefined && szene.entscheidung !== null && !hatKonsequenz) {
        warnungen.push(`Station ${id}: Szene ${rolle} hat Optionen, aber die Station keinen Schritt „konsequenz“`);
      }
    }
    for (const [rolle, szene] of Object.entries(st.szenen)) {
      if (modell.rollen[rolle] === undefined) fehler.push(`Station ${id}: Szene für unbekannte Rolle „${rolle}“`);
      if (szene.entscheidung !== null) {
        if (szene.entscheidung.optionen.length < 2) fehler.push(`Station ${id}/${rolle}: eine Entscheidung braucht mindestens zwei Optionen`);
        if (!st.schritte.some((s) => s.art === 'entscheidung')) fehler.push(`Station ${id}: Szene ${rolle} hat Optionen, aber die Station keinen Schritt „entscheidung“`);
      }
      if (szene.rueckbezug !== null) {
        const ziel = findeEntscheidung(modell, szene.rueckbezug.auf);
        if (ziel === null) {
          fehler.push(`Station ${id}/${rolle}: Rückbezug auf unbekannte Entscheidung „${szene.rueckbezug.auf}“`);
        } else {
          for (const o of ziel.entscheidung.optionen) {
            if (szene.rueckbezug.texte[o.id] === undefined) fehler.push(`Station ${id}/${rolle}: Rückbezug für Option ${o.id} von ${ziel.entscheidung.id} fehlt`);
          }
          for (const k of Object.keys(szene.rueckbezug.texte)) {
            if (!ziel.entscheidung.optionen.some((o) => o.id === k)) fehler.push(`Station ${id}/${rolle}: Rückbezug für Option ${k}, die ${ziel.entscheidung.id} nicht hat`);
          }
        }
        if (!st.schritte.some((s) => s.art === 'rueckbezug')) warnungen.push(`Station ${id}: Szene ${rolle} hat Rückbezüge, aber die Station keinen Schritt „rueckbezug“`);
      }
    }
  }

  return { fehler, warnungen };
}
