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
  /** Schwelle überschritten, Stufe nach dem Mandat offen – keine Stufe der Leiter gilt als aktiv */
  stufeOffen: boolean;
  /** Wer entscheidet (Mandatsleiter bzw. nicht delegierbar) */
  wer: string;
  eskalation: SimHinweis[];
  wesentlich: boolean;
  /** Freigabe berührt: die Freigabe erteilt der Bauherr selbst, gleich auf welcher Stufe die Sachentscheidung liegt (R38, R39) */
  freigabeBeimBauherrn: boolean;
  /** Was der Bauherr selbst entscheidet, während die Sachentscheidung auf ihrer Stufe bleibt (Freigabe, Reserve, Zielpriorität; R40) – als Satzteile */
  vorbehalte: string[];
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
  if (!Number.isFinite(betragTeur)) return 'pl';
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

  let stufe = stufeNachBetrag(Math.max(0, Number.isFinite(e.betragTeur) ? e.betragTeur : 0));
  /** Stufe offen: das projektspezifische Mandat bestimmt sie (keine Stufe der Leiter markiert) */
  let eskaliert = false;
  let wer = stufe === 'pl' ? 'Bauherren-PL' : stufe === 'gremium' ? 'Änderungsgremium' : 'Bauherr im Lenkungskreis';
  eskalation.push({
    quelle: 'k4.2-p3',
    text: stufe === 'pl' ? 'Bis einschließlich 100 TEUR gibt die Bauherren-PL eigenständig frei.'
      : stufe === 'gremium' ? 'Oberhalb von 100 TEUR bis einschließlich 5 Mio. € entscheidet das Änderungsgremium.'
        : 'Oberhalb von 5 Mio. € erfolgt die Beschlussfassung durch den Bauherrn im Lenkungskreis.',
  });
  if (e.deckung === 'ueber-basis' && stufe !== 'bauherr') {
    // R42: sonst nannte „Mandat und Eskalation“ nur die Betragsstufe, während „Wer entscheidet“ den Bauherrn im Lenkungskreis zeigt
    eskalation.push({ quelle: 'k13-t1', text: 'Eine Neufestlegung der Projektbasis liegt außerhalb der regulären Freigabereihe und wird vom Bauherrn im Lenkungskreis beschlossen – gleich, welche Betragsstufe gilt.' });
  }
  if (e.schwelleUeberschritten || e.terminWochen > 0) {
    eskalation.push({
      quelle: 'k6.4.5-p1',
      text: e.schwelleUeberschritten
        ? 'Eine Wert-, Risiko-, Frist- oder Mandatsschwelle ist überschritten: Es wird entlang der Mandatsleiter eskaliert.'
        : 'Für Terminwirkungen nennt MVG keine allgemeine Schwelle; ob eine Fristschwelle überschritten ist, legt das projektspezifische Mandat fest.',
    });
  }

  if (e.schwelleUeberschritten) {
    eskalation.push({ quelle: 'k3.2-t1', text: 'Mandate, Freigabeschwellen und Eskalationswege legt der Bauherr fest – nicht delegierbar; welche Stufe zuständig ist, bestimmt dieses Mandat.' });
    if (stufe !== 'bauherr') { wer = 'Die Stufe, die das projektspezifische Mandat bestimmt'; eskaliert = true; }
  }
  const hebe = (neu: Stufe, neuWer: string): void => {
    if (RANG[neu] >= RANG[stufe] || eskaliert) {
      stufe = neu;
      wer = neuWer;
      eskaliert = false;
    }
  };
  // R40: Reserve und Zielpriorität heben die Sachentscheidung nicht – über die Änderung entscheidet ihre Stufe,
  // die Freigabe des Reserve-Einsatzes bzw. die Zielpriorität legt der Bauherr fest (k3.2-t1; Story B4 „Zwei Fragen, zwei Stufen“)
  const vorbehalte: string[] = [];
  if (e.deckung === 'reserve') {
    bauherr.push({ quelle: 'k3.2-t1', text: 'Die Freigabe des Einsatzes der Risikoreserve ist nicht delegierbar – sie bleibt beim Bauherrn.' });
    vorbehalte.push('die Freigabe des Einsatzes der Risikoreserve erteilt der Bauherr');
  }
  if (e.deckung === 'ueber-basis') {
    bauherr.push({ quelle: 'k3.2-t1', text: 'Die Akzeptanz von Auswirkungen auf Kosten ist nicht delegierbar, ebenso die Entscheidung über eine Neufestlegung der Projektbasis – beides bleibt beim Bauherrn.' });
    bauherr.push({ quelle: 'k13-t1', text: 'Die Neufestlegung der Projektbasis liegt außerhalb der regulären Freigabereihe; sie wird über eine Entscheidungsvorlage vorbereitet und vom Bauherrn im Lenkungskreis beschlossen.' });
    hebe('bauherr', 'Bauherr im Lenkungskreis');
  }
  if (e.zielkonflikt) {
    bauherr.push({ quelle: 'k3.2-t1', text: 'Welche Zielpriorität gilt und wie Zielkonflikte aufgelöst werden, legt der Bauherr fest – nicht delegierbar.' });
    vorbehalte.push('die Zielpriorität legt der Bauherr fest');
  }
  if (e.risikoAnnahme) {
    // R41: wie Reserve und Zielpriorität – die Annahme der Risikoexposition ist Vorbehalt des Bauherrn, die Sachentscheidung bleibt auf ihrer Stufe (k3.2-t1, k4.4-p1)
    bauherr.push({ quelle: 'k4.4-p1', text: 'Die Annahme wesentlicher Risikoexposition bleibt eine Bauherrenentscheidung.' });
    vorbehalte.push('über die Annahme wesentlicher Risikoexposition entscheidet der Bauherr');
  }

  // R37/R38: jede Freigabe zum Abschluss einer LPH erteilt der Bauherr selbst (k9.3-p3); sie ist nicht delegierbar (k3.2-t1)
  // R39: unabhängig von der Stufe – auch „Bauherr im Lenkungskreis“ meint die Sachentscheidung, die Freigabe erteilt der Bauherr selbst
  const freigabeBeimBauherrn = e.freigabeBeruehrt;
  // liegt die Sachentscheidung ohnehin beim Bauherrn, trennt nur die Freigabe (k9.3-p3: nicht der Lenkungskreis)
  if (stufe === 'bauherr' && !eskaliert) vorbehalte.length = 0;
  if (freigabeBeimBauherrn) vorbehalte.unshift('die Freigabe zum Abschluss der Leistungsphase erteilt der Bauherr selbst');
  if (freigabeBeimBauherrn) bauherr.push({ quelle: 'k3.2-t1', text: 'Die Entscheidung über eine wesentliche Freigabe ist nicht delegierbar – die Freigabe zum Abschluss der Leistungsphase bleibt beim Bauherrn.' });
  // R38: hebt schon der Betrag die Stufe zum Bauherrn, beschließt er selbst (k4.2-p3) – das ist eine Bauherrenentscheidung
  const wesentlich = e.substanziell || e.freigabeBeruehrt || bauherr.length > 0 || (stufe === 'bauherr' && !eskaliert);
  if (wesentlich) {
    information.push({ quelle: 'k4.3-p2', text: 'Als wesentliche Entscheidung braucht sie eine eindeutige Kennung, einen Datenstand, eine verantwortliche Rolle, eine Entscheidungsfrage und einen Nachverfolgungsstatus.' });
  } else {
    information.push({ quelle: 'k4.3-p1', text: 'Nicht jede operative Entscheidung ist bauherrenseitig wesentlich; wesentlich ist sie, wenn sie Projektzweck, Zielsystem oder Kosten, Termin, Qualität, Projektumfang, Risiko oder ESG/LCC substanziell beeinflusst.' });
  }
  if (!e.datenstandBenannt && e.status === 'entschieden') {
    // R40: nach der Entscheidung gibt es kein „zuerst“ mehr – der Datenstand, auf dem entschieden wurde, wird nachgetragen
    information.push({ quelle: 'k4.6-p2', text: 'Den Datenstand nachtragen, auf dem entschieden wurde: Welche Version galt? Welche Annahmen waren offen? Welche Änderungen waren seit der letzten Freigabe aufgenommen worden? Welche Beschlusslage bestand?' });
  } else if (!e.datenstandBenannt) {
    information.push({ quelle: 'k4.6-p2', text: 'Zuerst den Datenstand klären: Welche Version gilt? Welche Annahmen sind offen? Welche Änderungen wurden seit der letzten Freigabe aufgenommen? Welche Beschlusslage besteht?' });
  }

  if (e.freigabeBeruehrt) {
    freigabeweg.push({ quelle: 'k9.3-p3', text: 'Die Freigabe zum Abschluss der Leistungsphase erteilt der Bauherr selbst auf Vorlage der Bauherren-PL – nicht die Projektsteuerung und nicht der Lenkungskreis; der Lenkungskreis berät und bereitet vor.' });
    freigabeweg.push({ quelle: 'k4.5-p1', text: 'Eine Freigabe legitimiert den nächsten Schritt auf einem benannten Datenstand.' });
  }
  // R36/R40: die Mandatsleiter oben gilt für die Sachentscheidung; was nicht delegierbar ist, bleibt beim Bauherrn
  if (vorbehalte.length > 0 && (stufe !== 'bauherr' || eskaliert)) {
    const teile = [e.freigabeBeruehrt ? 'die Entscheidung über eine wesentliche Freigabe' : null, e.deckung === 'reserve' ? 'die Freigabe des Einsatzes der Risikoreserve' : null, e.zielkonflikt ? 'die Festlegung der Zielpriorität' : null, e.risikoAnnahme ? 'die Annahme wesentlicher Risikoexposition' : null].filter((t): t is string => t !== null);
    const aufzaehlung = teile.length === 1 ? teile[0] : `${teile.slice(0, -1).join(', ')} und ${teile[teile.length - 1]}`;
    freigabeweg.push({ quelle: 'k3.2-t1', text: `${eskaliert ? 'Die Stufe, die das projektspezifische Mandat bestimmt,' : 'Die Stufe unter „Wer entscheidet“'} gilt für die Sachentscheidung; ${aufzaehlung} ${teile.length === 1 ? 'ist' : 'sind'} nicht delegierbar und ${teile.length === 1 ? 'bleibt' : 'bleiben'} beim Bauherrn.` });
  } else if (e.freigabeBeruehrt) {
    // Freigabe auf der Stufe Bauherr: nichts weiter zu trennen
  } else if (!e.schwelleUeberschritten && stufe === 'pl') {
    freigabeweg.push({ quelle: 'k6.4.5-p1', text: 'Innerhalb des Mandats entscheiden die verantwortliche Rolle und die Bauherren-PL im definierten Rahmen und dokumentiert im Register.' });
  } else if (!e.schwelleUeberschritten && stufe === 'gremium') {
    // R35: oberhalb von 100 TEUR liegt die Entscheidung nicht mehr im Mandat der Bauherren-PL (k4.2-p3)
    freigabeweg.push({ quelle: 'k4.2-p3', text: 'Oberhalb von 100 TEUR liegt die Änderung nach der Muster-Mandatsleiter über der Freigabegrenze der Bauherren-PL; sie geht an das Änderungsgremium.' });
  } else if (eskaliert) {
    // R42: offene Stufe ohne Vorbehalt – der Weg führt entlang der Mandatsleiter (k6.4.5-p1)
    freigabeweg.push({ quelle: 'k6.4.5-p1', text: 'Den Weg bestimmt das projektspezifische Mandat: entlang der Mandatsleiter an die Bauherren-PL, das Änderungsgremium oder zur Beschlussfassung durch den Bauherrn im Lenkungskreis.' });
  } else if (stufe === 'bauherr') {
    // R42: auch auf der Stufe Bauherr ohne berührte LPH-Freigabe steht ein Freigabeweg (k13-t1, k4.2-p3)
    freigabeweg.push(e.deckung === 'ueber-basis'
      ? { quelle: 'k13-t1', text: 'Die Neufestlegung der Projektbasis wird über eine Entscheidungsvorlage vorbereitet und vom Bauherrn im Lenkungskreis beschlossen.' }
      : { quelle: 'k4.2-p3', text: 'Oberhalb von 5 Mio. € erfolgt die Beschlussfassung durch den Bauherrn im Lenkungskreis.' });
  }

  /** Wesentlich oder eskaliert (Ende offen): Kennung und Entscheidungsvorlage (k4.3-p2, k9.4-l1, k13-t1) */
  const vorlage = wesentlich || eskaliert;
  switch (e.status) {
    case 'offen':
      // R41: k4.3-p2 gilt nur für wesentliche Entscheidungen; sonst entscheidet die verantwortliche Rolle im Rahmen (k6.4.5-p1)
      // R42: dieselbe Bedingung wie „In Bearbeitung“; die Entscheidungsfrage gehört zur wesentlichen Entscheidung (k4.3-p2)
      naechsterSchritt.push(vorlage
        ? { quelle: 'k4.3-p2', text: 'Status „Offen“: Entscheidungsfrage und verantwortliche Rolle festlegen, Kennung vergeben.' }
        : { quelle: 'k6.4.5-p1', text: 'Status „Offen“: verantwortliche Rolle festlegen und im Register dokumentieren.' });
      break;
    case 'in-bearbeitung':
      // R41: die Entscheidungsvorlage ist die Nachweislogik einer wesentlichen Entscheidung (k13-t1)
      // R42: „im definierten Rahmen“ gilt nur innerhalb des Mandats der Bauherren-PL (k6.4.5-p1, L-110)
      naechsterSchritt.push(vorlage
        ? { quelle: 'k9.4-l1', text: 'Status „In Bearbeitung“: die Entscheidungsvorlage vervollständigen – Frage, betroffene Freigabe, Mandat, Datenstand, Optionen, Wirkung, Empfehlung, Freigabe- oder Eskalationsweg.' }
        : stufe === 'pl'
          ? { quelle: 'k6.4.5-p1', text: 'Status „In Bearbeitung“: im definierten Rahmen vorbereiten und im Register dokumentieren.' }
          : { quelle: 'k4.2-p3', text: 'Status „In Bearbeitung“: die Änderung für das Änderungsgremium vorbereiten.' });
      break;
    case 'entscheidungsreif':
      naechsterSchritt.push({ quelle: 'k13-t1', text: `Status „Entscheidungsreif“: ausreichend vorbereitet, um auf der zuständigen Mandatsebene getroffen zu werden – hier ${eskaliert ? 'die Stufe, die das projektspezifische Mandat bestimmt' : wer}${vorbehalte.map((v) => `; ${v}`).join('')}.` });
      break;
    case 'entschieden':
      // R42: nicht wesentlich – ohne Entscheidungsvorlage, dokumentiert im Register (k6.4.5-p1)
      naechsterSchritt.push(vorlage
        ? { quelle: 'k9.4-l1', text: 'Status „Entschieden“: Beschlusslage dokumentieren und die Nachverfolgung führen.' }
        : { quelle: 'k6.4.5-p1', text: 'Status „Entschieden“: die Entscheidung im Register dokumentieren.' });
      break;
  }
  if (!e.datenstandBenannt && (e.status === 'entscheidungsreif' || (e.status === 'entschieden' && e.freigabeBeruehrt))) {
    naechsterSchritt.push(e.freigabeBeruehrt
      ? { quelle: 'k4.5-p1', text: 'Ohne benannten Datenstand fehlt der Freigabe ihre Grundlage.' }
      : { quelle: 'k4.6-p2', text: 'Ohne benannten Datenstand fehlt der Entscheidung ihre belastbare Grundlage.' });
  }

  return { stufe, stufeOffen: eskaliert, wer, eskalation, wesentlich, freigabeBeimBauherrn, vorbehalte, bauherr, information, freigabeweg, naechsterSchritt };
}
