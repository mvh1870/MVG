/*
 * Governance-Fluss-Sandbox (P8.3, E5): Ereignisse einwerfen – Frühwarnung, Problem, Änderung, dazu die
 * CTC- oder Schwellenwertverletzung als neues Signal – und durch Register und Status laufen sehen.
 *
 * Grundlage ausschließlich Kap. 6.4.3/6.4.4: Register mit Bedeutung und nächstem Schritt (k6.4.4-t1),
 * Statusbegriffe (k6.4.4-p1), Fluss EW → bestätigt → Risiko → Entscheidung → … → Managementbericht und
 * „aus Risiken, Änderungen oder Problemen kann Entscheidungsbedarf entstehen“ (k6.4.3-p1/-p2).
 * Maßnahmen haben im Whitepaper keine Statusbegriffe: Sie werden „mit einer verantwortlichen Rolle und
 * einer Frist nachverfolgt“ – die Sandbox erfindet keinen Status dafür. Der Managementbericht ist kein
 * Eintrag, sondern die Aggregation aller Register (k6.4.4-t1).
 *
 * Reiner Reducer ohne DOM – getestet in tests/sandbox.test.ts.
 */

export type Register = 'fruehwarnung' | 'risiko' | 'problem' | 'aenderung' | 'entscheidung' | 'massnahme';
export type Ereignis = 'fruehwarnung' | 'problem' | 'aenderung' | 'schwelle';
export type Schritt =
  | 'bestaetigen' | 'mindern' | 'beobachten' | 'schliessen'
  | 'pruefen' | 'beschliessen' | 'ablehnen' | 'umsetzen'
  | 'bearbeiten' | 'vorlegen' | 'entscheiden' | 'verwerfen'
  | 'massnahme' | 'entscheidungsbedarf';

export interface Eintrag {
  kennung: string;
  register: Register;
  /** Statusbegriff nach k6.4.4-p1 (Frühwarnung: „unbewertet“, Problem: „eingetreten“, Maßnahme: „nachverfolgt“) */
  status: string;
  /** Herkunft, z. B. „aus FRW-001“ */
  aus: string | null;
}

export interface SandboxZustand {
  eintraege: Eintrag[];
  zaehler: Record<string, number>;
  /** letzte Meldung (für die Live-Region) */
  meldung: string;
}

export const KUERZEL: Record<Register, string> = { fruehwarnung: 'FRW', risiko: 'RIS', problem: 'PRB', aenderung: 'AEN', entscheidung: 'ENT', massnahme: 'MAS' };

/** Register und Bedeutung wortgleich aus k6.4.4-t1 (Maßnahme: k6.4.3-p2). */
export const REGISTER: Record<Register, { name: string; bedeutung: string; weiter: string; quelle: string }> = {
  fruehwarnung: { name: 'Frühwarnung', bedeutung: 'unbewertetes Signal', weiter: 'bestätigen; bei Bestätigung Risiko', quelle: 'k6.4.4-t1' },
  risiko: { name: 'Risikoregister', bedeutung: 'bewertetes mögliches Ereignis', weiter: 'Risikominderung oder Entscheidung', quelle: 'k6.4.4-t1' },
  problem: { name: 'Problemregister', bedeutung: 'eingetretenes Problem', weiter: 'Maßnahme, ggf. Entscheidung', quelle: 'k6.4.4-t1' },
  aenderung: { name: 'Änderungsregister', bedeutung: 'gewollte Änderung', weiter: 'Auswirkung, Freigabeweg', quelle: 'k6.4.4-t1' },
  entscheidung: { name: 'Entscheidungsregister', bedeutung: 'offener Entscheidungsbedarf', weiter: 'Entscheidungsvorlage', quelle: 'k6.4.4-t1' },
  massnahme: { name: 'Maßnahmen', bedeutung: 'Beschlüsse werden als Maßnahmen mit einer verantwortlichen Rolle und einer Frist nachverfolgt', weiter: 'nachverfolgen', quelle: 'k6.4.3-p2' },
};

export function anfang(): SandboxZustand {
  return { eintraege: [], zaehler: {}, meldung: '' };
}

/** Welche Schritte ein Eintrag in seinem Status erlaubt (k6.4.4-t1 „Nächster Schritt“, k6.4.4-p1 Status). */
export function erlaubt(e: Eintrag): Schritt[] {
  switch (e.register) {
    case 'fruehwarnung': return e.status === 'unbewertet' ? ['bestaetigen'] : [];
    case 'risiko':
      if (e.status === 'aktiv') return ['mindern', 'beobachten', 'entscheidungsbedarf'];
      if (e.status === 'gemindert' || e.status === 'beobachtet') return ['schliessen', 'entscheidungsbedarf'];
      return [];
    case 'problem': return e.status === 'eingetreten' ? ['massnahme', 'entscheidungsbedarf'] : [];
    case 'aenderung':
      if (e.status === 'Beantragt') return ['pruefen'];
      if (e.status === 'In Prüfung') return ['beschliessen', 'ablehnen', 'entscheidungsbedarf'];
      if (e.status === 'Beschlossen') return ['umsetzen'];
      return [];
    case 'entscheidung':
      if (e.status === 'Offen') return ['bearbeiten'];
      if (e.status === 'In Bearbeitung') return ['vorlegen', 'verwerfen'];
      if (e.status === 'Entscheidungsreif') return ['entscheiden', 'verwerfen'];
      return [];
    case 'massnahme': return [];
  }
}

function neu(z: SandboxZustand, register: Register, status: string, aus: string | null): { z: SandboxZustand; eintrag: Eintrag } {
  const k = KUERZEL[register];
  const n = (z.zaehler[k] ?? 0) + 1;
  const eintrag: Eintrag = { kennung: `${k}-${String(n).padStart(3, '0')}`, register, status, aus };
  return { z: { ...z, eintraege: [...z.eintraege, eintrag], zaehler: { ...z.zaehler, [k]: n } }, eintrag };
}

export function wirf(z: SandboxZustand, ereignis: Ereignis): SandboxZustand {
  switch (ereignis) {
    case 'fruehwarnung': { const r = neu(z, 'fruehwarnung', 'unbewertet', null); return { ...r.z, meldung: `${r.eintrag.kennung}: neue Frühwarnung, unbewertetes Signal` }; }
    // CTC- oder Schwellenwertverletzungen erzeugen neue Frühwarnungen als neue Signale (k6.4.3-p2)
    case 'schwelle': { const r = neu(z, 'fruehwarnung', 'unbewertet', 'CTC- oder Schwellenwertverletzung'); return { ...r.z, meldung: `${r.eintrag.kennung}: neue Frühwarnung aus einer CTC- oder Schwellenwertverletzung` }; }
    case 'problem': { const r = neu(z, 'problem', 'eingetreten', null); return { ...r.z, meldung: `${r.eintrag.kennung}: eingetretenes Problem` }; }
    case 'aenderung': { const r = neu(z, 'aenderung', 'Beantragt', null); return { ...r.z, meldung: `${r.eintrag.kennung}: Änderung beantragt` }; }
  }
}

export function schritt(z: SandboxZustand, kennung: string, s: Schritt): SandboxZustand {
  const e = z.eintraege.find((x) => x.kennung === kennung);
  if (e === undefined || !erlaubt(e).includes(s)) return z;
  const setze = (status: string, zz: SandboxZustand = z): SandboxZustand => ({ ...zz, eintraege: zz.eintraege.map((x) => (x.kennung === kennung ? { ...x, status } : x)) });
  switch (s) {
    case 'bestaetigen': {
      // Wird die Frühwarnung bestätigt, wird daraus ein bewertetes Risiko (k6.4.3-p2)
      const r = neu(setze('bestätigt'), 'risiko', 'aktiv', `aus ${kennung}`);
      return { ...r.z, meldung: `${kennung} bestätigt – daraus Risiko ${r.eintrag.kennung}, Status aktiv` };
    }
    case 'mindern': return { ...setze('gemindert'), meldung: `${kennung}: gemindert` };
    case 'beobachten': return { ...setze('beobachtet'), meldung: `${kennung}: beobachtet` };
    case 'schliessen': return { ...setze('geschlossen'), meldung: `${kennung}: geschlossen` };
    case 'pruefen': return { ...setze('In Prüfung'), meldung: `${kennung}: In Prüfung – Auswirkung und Freigabeweg` };
    case 'beschliessen': return { ...setze('Beschlossen'), meldung: `${kennung}: Beschlossen` };
    case 'ablehnen': return { ...setze('Abgelehnt'), meldung: `${kennung}: Abgelehnt` };
    case 'umsetzen': return { ...setze('Umgesetzt'), meldung: `${kennung}: Umgesetzt` };
    case 'bearbeiten': return { ...setze('In Bearbeitung'), meldung: `${kennung}: In Bearbeitung` };
    case 'vorlegen': return { ...setze('Entscheidungsreif'), meldung: `${kennung}: Entscheidungsreif – die Vorlage bündelt Frage, Datenstand, Optionen, Bewertung und Empfehlung` };
    case 'verwerfen': return { ...setze('Verworfen'), meldung: `${kennung}: Verworfen` };
    case 'entscheiden': {
      // Beschlüsse werden anschließend als Maßnahmen mit einer verantwortlichen Rolle und einer Frist nachverfolgt (k6.4.3-p2)
      const r = neu(setze('Entschieden'), 'massnahme', 'nachverfolgt', `aus ${kennung}`);
      return { ...r.z, meldung: `${kennung}: Entschieden – Maßnahme ${r.eintrag.kennung} mit verantwortlicher Rolle und Frist` };
    }
    case 'massnahme': {
      const r = neu(setze('Maßnahme eingeleitet'), 'massnahme', 'nachverfolgt', `aus ${kennung}`);
      return { ...r.z, meldung: `${kennung}: Maßnahme ${r.eintrag.kennung}` };
    }
    case 'entscheidungsbedarf': {
      // Aus Risiken, Änderungen oder Problemen kann Entscheidungsbedarf entstehen (k6.4.3-p2)
      const r = neu(z, 'entscheidung', 'Offen', `aus ${kennung}`);
      return { ...r.z, meldung: `${kennung}: Entscheidungsbedarf – ${r.eintrag.kennung}, Status Offen` };
    }
  }
}

/** Managementbericht: aggregierter Gremienbericht über alle Register (k6.4.4-t1) – je Register Anzahl je Status. */
export function bericht(z: SandboxZustand): { register: Register; status: Record<string, number> }[] {
  const aus: { register: Register; status: Record<string, number> }[] = [];
  for (const register of Object.keys(REGISTER) as Register[]) {
    const status: Record<string, number> = {};
    for (const e of z.eintraege) if (e.register === register) status[e.status] = (status[e.status] ?? 0) + 1;
    if (Object.keys(status).length > 0) aus.push({ register, status });
  }
  return aus;
}
