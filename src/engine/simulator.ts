/*
 * Szenario-Simulator (P8.1, BAUPLAN „Projektlage“): Aus einer Projektlage folgen Eskalationsstufe,
 * Bauherrenentscheidungen, Informationsbedarf, Freigabeweg und nächster Schritt – ausschließlich nach
 * Regeln, die das Whitepaper selbst nennt (jede Aussage trägt ihre Absatz-ID, O-17). Wo das Whitepaper
 * keine Schwelle nennt (Termin, Risiko), setzt der Simulator auch keine: Er sagt dann, dass das
 * projektspezifische Mandat sie festlegt.
 *
 * Reine Funktion ohne DOM – getestet in tests/simulator.test.ts.
 */

export type Deckung = 'budget' | 'reserve' | 'ueber-basis';
export type EntscheidungsStatus = 'offen' | 'in-bearbeitung' | 'entscheidungsreif' | 'entschieden';
export type Stufe = 'pl' | 'gremium' | 'bauherr';

export interface SimEingabe {
  /** Kostenwirkung der Entscheidung in TEUR (≥ 0) */
  betragTeur: number;
  /** Woraus die Kosten gedeckt werden sollen */
  deckung: Deckung;
  /** Terminwirkung in Wochen (≥ 0) */
  terminWochen: number;
  /** Überschreitet die Lage eine Frist-, Risiko- oder Wertschwelle des projektspezifischen Mandats? */
  schwelleUeberschritten: boolean;
  /** Werden Zielprioritäten gegeneinander abgewogen (Zielkonflikt)? */
  zielkonflikt: boolean;
  /** Wird eine wesentliche Risikoexposition angenommen? */
  risikoAnnahme: boolean;
  /** Beeinflusst die Entscheidung Kosten, Termin, Qualität, Projektumfang, Risiko oder ESG/LCC substanziell? */
  substanziell: boolean;
  /** Berührt die Entscheidung eine Freigabe zum Abschluss einer Leistungsphase? */
  freigabeBeruehrt: boolean;
  /** Ist der Datenstand benannt (welche Version gilt)? */
  datenstandBenannt: boolean;
  status: EntscheidungsStatus;
}

export interface SimHinweis {
  text: string;
  /** Absatz-ID der Regel */
  quelle: string;
}

export interface SimErgebnis {
  stufe: Stufe;
  /** Wer entscheidet (Mandatsleiter bzw. nicht delegierbar) */
  wer: string;
  eskalation: SimHinweis[];
  wesentlich: boolean;
  bauherr: SimHinweis[];
  information: SimHinweis[];
  freigabeweg: SimHinweis[];
  naechsterSchritt: SimHinweis[];
}

/** Die Absätze, auf die sich der Simulator stützt (Test: alle im Quellenfenster vorhanden). */
export const SIM_QUELLEN = ['k4.2-p3', 'k6.4.5-p1', 'k3.2-t1', 'k13-t1', 'k4.3-p1', 'k4.3-p2', 'k4.4-p1', 'k4.5-p1', 'k4.6-p2', 'k9.3-p3', 'k9.4-l1', 'k6.4.4-p1'] as const;

const RANG: Record<Stufe, number> = { pl: 0, gremium: 1, bauherr: 2 };

/** Muster-Mandatsleiter (k4.2-p3): bis einschließlich 100 TEUR PL, bis einschließlich 5 Mio. € Änderungsgremium, darüber Bauherr im Lenkungskreis. */
export function stufeNachBetrag(betragTeur: number): Stufe {
  if (betragTeur <= 100) return 'pl';
  if (betragTeur <= 5000) return 'gremium';
  return 'bauherr';
}

export function simuliere(e: SimEingabe): SimErgebnis {
  const eskalation: SimHinweis[] = [];
  const bauherr: SimHinweis[] = [];
  const information: SimHinweis[] = [];
  const freigabeweg: SimHinweis[] = [];
  const naechsterSchritt: SimHinweis[] = [];

  let stufe = stufeNachBetrag(Math.max(0, e.betragTeur));
  let wer = stufe === 'pl' ? 'Bauherren-PL' : stufe === 'gremium' ? 'Änderungsgremium' : 'Bauherr im Lenkungskreis';
  eskalation.push({
    quelle: 'k4.2-p3',
    text: stufe === 'pl' ? 'Bis einschließlich 100 TEUR gibt die Bauherren-PL eigenständig frei.'
      : stufe === 'gremium' ? 'Oberhalb von 100 TEUR bis einschließlich 5 Mio. € entscheidet das Änderungsgremium.'
        : 'Oberhalb von 5 Mio. € erfolgt die Beschlussfassung durch den Bauherrn im Lenkungskreis.',
  });
  if (e.schwelleUeberschritten || e.terminWochen > 0) {
    eskalation.push({
      quelle: 'k6.4.5-p1',
      text: e.schwelleUeberschritten
        ? 'Eine Wert-, Risiko-, Frist- oder Mandatsschwelle ist überschritten: Es wird entlang der Mandatsleiter eskaliert. Welche Stufe zuständig ist, legt das projektspezifische Mandat fest.'
        : 'Für Terminwirkungen nennt das Whitepaper keine allgemeine Schwelle; ob eine Fristschwelle überschritten ist, legt das projektspezifische Mandat fest.',
    });
  }

  if (e.schwelleUeberschritten && stufe === 'pl') wer = 'Eskalation nach dem projektspezifischen Mandat';
  const hebe = (neu: Stufe, neuWer: string): void => {
    if (RANG[neu] >= RANG[stufe]) {
      stufe = neu;
      wer = neuWer;
    }
  };
  if (e.deckung === 'reserve') {
    bauherr.push({ quelle: 'k3.2-t1', text: 'Die Freigabe des Einsatzes der Risikoreserve ist nicht delegierbar – sie bleibt beim Bauherrn.' });
    hebe('bauherr', stufe === 'bauherr' ? wer : 'Bauherr');
  }
  if (e.deckung === 'ueber-basis') {
    bauherr.push({ quelle: 'k3.2-t1', text: 'Die Akzeptanz von Auswirkungen auf Kosten ist nicht delegierbar, ebenso die Entscheidung über eine Neufestlegung der Projektbasis – beides bleibt beim Bauherrn.' });
    bauherr.push({ quelle: 'k13-t1', text: 'Die Neufestlegung der Projektbasis liegt außerhalb der regulären Freigabereihe; sie wird über eine Entscheidungsvorlage vorbereitet und vom Bauherrn im Lenkungskreis beschlossen.' });
    hebe('bauherr', 'Bauherr im Lenkungskreis');
  }
  if (e.zielkonflikt) {
    bauherr.push({ quelle: 'k3.2-t1', text: 'Welche Zielpriorität gilt und wie Zielkonflikte aufgelöst werden, legt der Bauherr fest – nicht delegierbar.' });
    hebe('bauherr', stufe === 'bauherr' ? wer : 'Bauherr');
  }
  if (e.risikoAnnahme) {
    bauherr.push({ quelle: 'k4.4-p1', text: 'Die Annahme wesentlicher Risikoexposition bleibt eine Bauherrenentscheidung.' });
    hebe('bauherr', stufe === 'bauherr' ? wer : 'Bauherr');
  }

  const wesentlich = e.substanziell || bauherr.length > 0;
  if (wesentlich) {
    information.push({ quelle: 'k4.3-p2', text: 'Als wesentliche Entscheidung braucht sie eine eindeutige Kennung, einen Datenstand, eine verantwortliche Rolle, eine Entscheidungsfrage und einen Nachverfolgungsstatus.' });
  } else {
    information.push({ quelle: 'k4.3-p1', text: 'Nicht jede operative Entscheidung ist bauherrenseitig wesentlich; wesentlich ist sie, wenn sie Projektzweck, Zielsystem oder Kosten, Termin, Qualität, Projektumfang, Risiko oder ESG/LCC substanziell beeinflusst.' });
  }
  if (!e.datenstandBenannt) {
    information.push({ quelle: 'k4.6-p2', text: 'Zuerst den Datenstand klären: Welche Version gilt? Welche Annahmen sind offen? Welche Änderungen wurden seit der letzten Freigabe aufgenommen? Welche Beschlusslage besteht?' });
  }

  if (e.freigabeBeruehrt) {
    freigabeweg.push({ quelle: 'k9.3-p3', text: 'Die Freigabe zum Abschluss der Leistungsphase erteilt der Bauherr selbst auf Vorlage der Bauherren-PL – nicht die Projektsteuerung und nicht der Lenkungskreis; der Lenkungskreis berät und bereitet vor.' });
    freigabeweg.push({ quelle: 'k4.5-p1', text: 'Eine Freigabe legitimiert den nächsten Schritt auf einem benannten Datenstand.' });
  } else if (!e.schwelleUeberschritten && stufe !== 'bauherr') {
    freigabeweg.push({ quelle: 'k6.4.5-p1', text: 'Innerhalb des Mandats entscheiden die verantwortliche Rolle und die Bauherren-PL im definierten Rahmen und dokumentiert im Register.' });
  }

  switch (e.status) {
    case 'offen':
      naechsterSchritt.push({ quelle: 'k4.3-p2', text: wesentlich ? 'Status „Offen“: Entscheidungsfrage und verantwortliche Rolle festlegen, Kennung vergeben.' : 'Status „Offen“: Entscheidungsfrage und verantwortliche Rolle festlegen.' });
      break;
    case 'in-bearbeitung':
      naechsterSchritt.push({ quelle: 'k9.4-l1', text: 'Status „In Bearbeitung“: die Entscheidungsvorlage vervollständigen – Frage, betroffene Freigabe, Mandat, Datenstand, Optionen, Wirkung, Empfehlung, Freigabe- oder Eskalationsweg.' });
      break;
    case 'entscheidungsreif':
      naechsterSchritt.push({ quelle: 'k13-t1', text: `Status „Entscheidungsreif“: ausreichend vorbereitet, um auf der zuständigen Mandatsebene getroffen zu werden – hier ${wer}.` });
      break;
    case 'entschieden':
      naechsterSchritt.push({ quelle: 'k9.4-l1', text: 'Status „Entschieden“: Beschlusslage dokumentieren und die Nachverfolgung führen.' });
      break;
  }
  if (!e.datenstandBenannt && e.status === 'entscheidungsreif') {
    naechsterSchritt.push(e.freigabeBeruehrt
      ? { quelle: 'k4.5-p1', text: 'Ohne benannten Datenstand fehlt der Freigabe ihre Grundlage.' }
      : { quelle: 'k4.6-p2', text: 'Ohne benannten Datenstand fehlt der Entscheidung ihre belastbare Grundlage.' });
  }

  return { stufe, wer, eskalation, wesentlich, bauherr, information, freigabeweg, naechsterSchritt };
}
