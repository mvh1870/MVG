/*
 * Bedingungen: Textform (docs/INHALTSFORMAT.md 2.8) → Datenform → Auswertung gegen den Zustand.
 *
 * Das Inhaltswerkzeug übersetzt zur Bauzeit mit `leseBedingung`; zur Laufzeit wird nur noch
 * `pruefeBedingung` gebraucht. Beide leben hier, damit es genau eine Lesart gibt.
 */

import type {
  Bedingung, Ergebnis, Freischaltung, StatusSchluessel, Stufe, StoryModell, Vergleich, Welt, Zustand,
} from './typen.ts';
import { STUFEN, istStufe, istStufenSchluessel, leseStatusSchluessel } from './status.ts';

const KENNUNG = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/u;
const PFAD = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*(?:\/[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)*$/u;

function liste(text: string): string[] {
  return text.split('|').map((t) => t.trim()).filter((t) => t !== '');
}

function istVergleich(x: string): x is Vergleich {
  return x === '=' || x === '!=' || x === '<' || x === '<=' || x === '>' || x === '>=';
}

/** Übersetzt eine Bedingung in Textform. */
export function leseBedingung(roh: string): Ergebnis<Bedingung> {
  let text = roh.trim().replace(/\s+/gu, ' ');
  let nicht = false;
  if (/^nicht /u.test(text)) {
    nicht = true;
    text = text.slice(6).trim();
  }
  let m: RegExpExecArray | null;

  if ((m = /^wahl (\S+) ?(!=|=) ?(.+)$/u.exec(text))) {
    const [, ent = '', op = '=', werte = ''] = m;
    if (!PFAD.test(ent)) return { ok: false, fehler: `Bedingung „${roh}“: „${ent}“ ist keine Entscheidungs-Kennung` };
    const optionen = liste(werte);
    if (optionen.length === 0) return { ok: false, fehler: `Bedingung „${roh}“: keine Option genannt` };
    return { ok: true, wert: { art: 'wahl', entscheidung: ent, optionen, nicht: nicht !== (op === '!=') } };
  }
  if ((m = /^antwort (\S+) ?(!=|=) ?(.+)$/u.exec(text))) {
    const [, frage = '', op = '=', werte = ''] = m;
    if (!PFAD.test(frage)) return { ok: false, fehler: `Bedingung „${roh}“: „${frage}“ ist keine Frage-Kennung` };
    return { ok: true, wert: { art: 'antwort', frage, antworten: liste(werte), nicht: nicht !== (op === '!=') } };
  }
  if ((m = /^rolle ?(!=|=) ?(.+)$/u.exec(text))) {
    const [, op = '=', werte = ''] = m;
    const rollen = liste(werte);
    if (rollen.length === 0 || !rollen.every((r) => KENNUNG.test(r))) return { ok: false, fehler: `Bedingung „${roh}“: Rollen unlesbar` };
    return { ok: true, wert: { art: 'rolle', rollen, nicht: nicht !== (op === '!=') } };
  }
  if ((m = /^welt ?(!=|=) ?(A|B)$/u.exec(text))) {
    const [, op = '=', welt = 'A'] = m;
    return { ok: true, wert: { art: 'welt', welt: welt as Welt, nicht: nicht !== (op === '!=') } };
  }
  if ((m = /^interesse (\S+)$/u.exec(text))) {
    return { ok: true, wert: { art: 'interesse', interesse: m[1] ?? '', nicht } };
  }
  if ((m = /^info (\S+\/\S+)$/u.exec(text))) {
    return { ok: true, wert: { art: 'info', info: m[1] ?? '', nicht } };
  }
  if ((m = /^besucht (\S+)$/u.exec(text))) {
    return { ok: true, wert: { art: 'besucht', station: m[1] ?? '', nicht } };
  }
  if ((m = /^freigeschaltet (welt-b|weltB|explore)$/u.exec(text))) {
    const was: Freischaltung = m[1] === 'explore' ? 'explore' : 'weltB';
    return { ok: true, wert: { art: 'freigeschaltet', was, nicht } };
  }
  if ((m = /^status (A|B) (\S+) ?(>=|<=|!=|=|<|>) ?(.+)$/u.exec(text))) {
    const [, welt = 'A', sText = '', op = '=', wText = ''] = m;
    const schluessel = leseStatusSchluessel(sText);
    if (schluessel === null) return { ok: false, fehler: `Bedingung „${roh}“: unbekannter Statuswert „${sText}“` };
    if (!istVergleich(op)) return { ok: false, fehler: `Bedingung „${roh}“: Vergleich „${op}“ unbekannt` };
    let wert: number | Stufe;
    if (istStufenSchluessel(schluessel)) {
      if (!istStufe(wText)) return { ok: false, fehler: `Bedingung „${roh}“: „${wText}“ ist keine Stufe (${STUFEN.join(', ')})` };
      wert = wText;
    } else {
      if (!/^\d+$/u.test(wText)) return { ok: false, fehler: `Bedingung „${roh}“: „${wText}“ ist keine Zahl` };
      wert = Number(wText);
    }
    return { ok: true, wert: { art: 'status', welt: welt as Welt, schluessel, vergleich: op, wert, nicht } };
  }
  return { ok: false, fehler: `Bedingung „${roh}“ nicht verstanden (erlaubt: wahl, antwort, rolle, welt, interesse, info, besucht, freigeschaltet, status, jeweils mit „nicht“)` };
}

/** Eine Liste als „alle“ oder „eine“; eine einzelne Bedingung bleibt einzeln. */
export function leseBedingungen(texte: readonly string[], art: 'alle' | 'eine'): Ergebnis<Bedingung> {
  const teile: Bedingung[] = [];
  for (const t of texte) {
    const e = leseBedingung(t);
    if (!e.ok) return e;
    teile.push(e.wert);
  }
  if (teile.length === 1 && teile[0] !== undefined) return { ok: true, wert: teile[0] };
  return { ok: true, wert: { art, bedingungen: teile, nicht: false } };
}

/** `A3` → `A3/<rolle>`; eine Kennung mit `/` bleibt, wie sie ist. */
export function entscheidungsSchluessel(ref: string, rolle: string | null): string {
  if (ref.includes('/') || rolle === null) return ref;
  return `${ref}/${rolle}`;
}

/** Frage-Kennung: `B3/reife` → `B3/<rolle>/reife`; `B3/pl/reife` bleibt. */
export function frageSchluessel(ref: string, rolle: string | null): string {
  const teile = ref.split('/');
  if (teile.length === 2 && rolle !== null) return `${teile[0] ?? ''}/${rolle}/${teile[1] ?? ''}`;
  return ref;
}

function vergleiche(a: number, op: Vergleich, b: number): boolean {
  switch (op) {
    case '=': return a === b;
    case '!=': return a !== b;
    case '<': return a < b;
    case '<=': return a <= b;
    case '>': return a > b;
    case '>=': return a >= b;
  }
}

function alsZahl(schluessel: StatusSchluessel, wert: number | Stufe): number {
  if (typeof wert === 'number') return wert;
  return istStufenSchluessel(schluessel) ? STUFEN.indexOf(wert) : Number.NaN;
}

/** Der Teil des Zustands, den Bedingungen lesen. */
export type BedingungsQuelle = Pick<
  Zustand,
  'entscheidungen' | 'antworten' | 'rolle' | 'welt' | 'interessen' | 'info' | 'verlauf' | 'freigeschaltet' | 'status'
>;

/** Wertet eine Bedingung aus. Das Modell wird für künftige, inhaltsbezogene Formen mitgegeben. */
export function pruefeBedingung(b: Bedingung, z: BedingungsQuelle, modell?: StoryModell): boolean {
  const roh = ((): boolean => {
    switch (b.art) {
      case 'wahl': {
        const wahl = z.entscheidungen[entscheidungsSchluessel(b.entscheidung, z.rolle)];
        return wahl !== undefined && b.optionen.includes(wahl);
      }
      case 'antwort': {
        const a = z.antworten[frageSchluessel(b.frage, z.rolle)];
        return a !== undefined && b.antworten.includes(a);
      }
      case 'rolle': return z.rolle !== null && b.rollen.includes(z.rolle);
      case 'welt': return z.welt === b.welt;
      case 'interesse': return z.interessen.includes(b.interesse);
      case 'info': return z.info.includes(b.info);
      case 'besucht': return z.verlauf.includes(b.station);
      case 'freigeschaltet': return z.freigeschaltet[b.was];
      case 'status': {
        const s = z.status[b.welt];
        if (s === null) return false;
        return vergleiche(alsZahl(b.schluessel, s[b.schluessel]), b.vergleich, alsZahl(b.schluessel, b.wert));
      }
      case 'alle': return b.bedingungen.every((t) => pruefeBedingung(t, z, modell));
      case 'eine': return b.bedingungen.some((t) => pruefeBedingung(t, z, modell));
    }
  })();
  return b.nicht ? !roh : roh;
}

/** Alle Verweise einer Bedingung, damit der Prüfer sie gegen die Inhalte halten kann. */
export function verweiseIn(b: Bedingung): { stationen: string[]; entscheidungen: string[]; rollen: string[]; interessen: string[]; infos: string[]; fragen: string[] } {
  const aus = { stationen: [] as string[], entscheidungen: [] as string[], rollen: [] as string[], interessen: [] as string[], infos: [] as string[], fragen: [] as string[] };
  const gehe = (x: Bedingung): void => {
    switch (x.art) {
      case 'wahl': aus.entscheidungen.push(x.entscheidung); break;
      case 'antwort': aus.fragen.push(x.frage); break;
      case 'rolle': aus.rollen.push(...x.rollen); break;
      case 'interesse': aus.interessen.push(x.interesse); break;
      case 'info': aus.infos.push(x.info); break;
      case 'besucht': aus.stationen.push(x.station); break;
      case 'alle': case 'eine': x.bedingungen.forEach(gehe); break;
      default: break;
    }
  };
  gehe(b);
  return aus;
}
