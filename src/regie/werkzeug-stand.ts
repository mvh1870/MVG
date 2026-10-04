/*
 * Stand der vier neuen Werkzeuge in der Regie (P18.5, O-59, Konzept 0.3, E-8, E-9): rein, ohne DOM. Die Regie wählt ein
 * Beispiel, geht durch die Schritte und schaltet „Was wäre, wenn“-Annahmen; was die Leinwand erreicht, ist nur
 * `b:<beispiel>[;<schritt>]` (Beispiel-Kennung und Schritt, nie Freitext). Die Kerne in src/werkzeuge/ lesen den Stand.
 *
 *   A Vorlagen-Check   Schritte s:1 … s:5, s:ergebnis
 *   B Wegweiser        Schritte a:0 (nichts beantwortet), dann je eine Antwort mehr – die des Beispiels
 *   C Risiko-Bewerter  Annahmen t:70 · t:71 · w:1 · m:belegt (kombinierbar; t:70 und t:71 schließen sich aus)
 *   D Monatsbericht    Schalter w:1 („Kosten-Ampel ohne Frage“)
 */
import type { Werkzeuge } from '../inhalte/typen.ts';
import { wegweiser, type FrageId, type Wahl } from '../werkzeuge/wegweiser.ts';
import { beispielKennungen, istNeuesWerkzeug, type NeuesWerkzeug } from '../ui/werkzeug-kennungen.ts';

export interface StandTeile { beispiel: string; schritt: string | null }

/** `b:<beispiel>[;<schritt>]` aus Beispiel und Schritt. */
export function standText(beispiel: string, schritt: string | null): string {
  return `b:${beispiel}${schritt !== null ? `;${schritt}` : ''}`;
}

/** Zerlegt einen Stand; das Beispiel muss zum Werkzeug gehören, sonst gilt das erste. */
export function standTeile(w: Werkzeuge | null, werkzeug: string, stand: string | null): StandTeile | null {
  const kennungen = beispielKennungen(w, werkzeug);
  if (kennungen.length === 0) return null;
  const m = typeof stand === 'string' ? /^b:([a-z0-9][a-z0-9-]*)(?:;(.*))?$/u.exec(stand) : null;
  const beispiel = m !== null && kennungen.includes(m[1] ?? '') ? m[1] ?? '' : kennungen[0] ?? '';
  return { beispiel, schritt: m !== null && m[1] === beispiel ? m[2] ?? null : null };
}

const KURZ: Record<Wahl, string> = { ja: 'j', nein: 'n', unklar: 'u' };

/** Schritte eines Beispiels (B: a:0 und je eine Antwort mehr, bis alle Antworten des Beispiels stehen); A: fünf Prüfschritte und das Ergebnis; sonst null. */
export function schrittFolge(w: Werkzeuge | null, werkzeug: string, beispiel: string): string[] | null {
  if (werkzeug === 'vorlagen-check') return ['s:1', 's:2', 's:3', 's:4', 's:5', 's:ergebnis'];
  if (werkzeug === 'wegweiser') {
    const antworten = w?.wegweiser.beispiele.find((b) => b.id === beispiel)?.antworten ?? {};
    const pfad: readonly FrageId[] = wegweiser(antworten).pfad;
    const kurz = pfad.map((f) => KURZ[antworten[f] ?? 'nein']);
    return ['a:0', ...kurz.map((_, i) => `a:${kurz.slice(0, i + 1).join(',')}`)];
  }
  return null;
}

/** Position im Schritt (0 …). A ohne Schritt: der erste Prüfschritt; B ohne Schritt: das Beispiel ist vollständig beantwortet (letzter Schritt). */
export function schrittIndex(folge: readonly string[], schritt: string | null, ohneSchritt: 'erster' | 'letzter'): number {
  if (schritt === null) return ohneSchritt === 'erster' ? 0 : folge.length - 1;
  const i = folge.indexOf(schritt);
  return i < 0 ? (ohneSchritt === 'erster' ? 0 : folge.length - 1) : i;
}

const ohneSchrittVon = (werkzeug: string): 'erster' | 'letzter' => (werkzeug === 'wegweiser' ? 'letzter' : 'erster');

/** Stand, mit dem ein Beispiel beginnt: A bei Prüfschritt 1, B bei „noch nichts beantwortet“, C und D im Beispielanfang. */
export function beispielStart(w: Werkzeuge | null, werkzeug: string, beispiel: string): string {
  const folge = schrittFolge(w, werkzeug, beispiel);
  return standText(beispiel, folge !== null ? folge[0] ?? null : null);
}

/**
 * Stand beim Wechsel zu einem Werkzeug (Pfeiltasten, Auswahl): vorwärts am Anfang, rückwärts am Ende der Schritte
 * (E-9: erst durch die Schritte, dann zum nächsten Werkzeug – rückwärts entsprechend). null = Werkzeug ohne Stand.
 */
export function eintrittsStand(w: Werkzeuge | null, werkzeug: string, richtung: 1 | -1): string | null {
  const beispiel = beispielKennungen(w, werkzeug)[0];
  if (beispiel === undefined) return null;
  const folge = schrittFolge(w, werkzeug, beispiel);
  if (folge === null) return null;
  return standText(beispiel, richtung === 1 ? folge[0] ?? null : folge[folge.length - 1] ?? null);
}

/**
 * Ein Schritt im Werkzeug (E-9). Gibt den neuen Stand zurück; null, wenn das Werkzeug keine Schritte hat oder am Ende
 * (vorwärts) bzw. am Anfang (rückwärts) steht – dann geht die Regie zum nächsten bzw. vorigen Werkzeug.
 */
export function schrittImWerkzeug(w: Werkzeuge | null, werkzeug: string, stand: string | null, richtung: 1 | -1): string | null {
  const t = standTeile(w, werkzeug, stand);
  if (t === null) return null;
  const folge = schrittFolge(w, werkzeug, t.beispiel);
  if (folge === null) return null;
  const i = schrittIndex(folge, t.schritt, ohneSchrittVon(werkzeug)) + richtung;
  if (i < 0 || i >= folge.length) return null;
  return standText(t.beispiel, folge[i] ?? null);
}

/** Wo steht die Regie in den Schritten? `nr` ab 1; null, wenn das Werkzeug keine Schritte hat. */
export function schrittStelle(w: Werkzeuge | null, werkzeug: string, stand: string | null): { nr: number; von: number; ergebnis: boolean } | null {
  const t = standTeile(w, werkzeug, stand);
  if (t === null) return null;
  const folge = schrittFolge(w, werkzeug, t.beispiel);
  if (folge === null) return null;
  const i = schrittIndex(folge, t.schritt, ohneSchrittVon(werkzeug));
  return { nr: i + 1, von: folge.length, ergebnis: werkzeug === 'vorlagen-check' && folge[i] === 's:ergebnis' };
}

/** Schalter („Was wäre, wenn“, Kosten-Ampel) des gezeigten Beispiels: Titel aus dem Inhalt, Wert für den Schritt. */
export interface StandSchalter { wert: string; titel: string }

const ANNAHME_WERT: Record<string, string> = { t70: 't:70', t71: 't:71', w1: 'w:1', belegt: 'm:belegt' };
const ANNAHME_REIHE = ['t:70', 't:71', 'w:1', 'm:belegt'];

export function schalterVon(w: Werkzeuge | null, werkzeug: string, beispiel: string, ampelTitel: string): StandSchalter[] {
  if (werkzeug === 'monatsbericht') return [{ wert: 'w:1', titel: ampelTitel }];
  if (werkzeug !== 'risiko-grenzen') return [];
  const b = w?.risikogrenzen.beispiele.find((x) => x.id === beispiel);
  return (b?.waswaere ?? []).flatMap((a) => (ANNAHME_WERT[a.id] !== undefined ? [{ wert: ANNAHME_WERT[a.id] ?? '', titel: a.titel }] : []));
}

/** Schaltet einen Schalter um; die Annahmen bleiben kombinierbar (t:70 und t:71 schließen sich aus), in fester Reihenfolge. */
export function schalteUm(werkzeug: NeuesWerkzeug, beispiel: string, schritt: string | null, wert: string): string {
  const jetzt = new Set(schritt === null ? [] : schritt.split(';'));
  if (jetzt.has(wert)) jetzt.delete(wert);
  else {
    jetzt.add(wert);
    if (wert === 't:70') jetzt.delete('t:71');
    if (wert === 't:71') jetzt.delete('t:70');
  }
  const liste = ANNAHME_REIHE.filter((x) => jetzt.has(x));
  return standText(beispiel, liste.length === 0 ? null : werkzeug === 'monatsbericht' ? 'w:1' : liste.join(';'));
}

export { istNeuesWerkzeug };
