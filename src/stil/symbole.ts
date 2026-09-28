// Ikonen des Leitstands als Inline-SVG (docs/STIL.md → Ikonen).
// Quelle: prototyp/variante-b-leitstand.html (ICONS, stIcon), Namen deutsch.
// Raster 24 × 24, Strich über CSS (.symbol: stroke-width 1.8, currentColor) – hier stehen nur Pfade,
// keine Farben. Reine Zeichenketten ohne DOM, damit Regie, Leinwand und Tests sie gleich nutzen.

export const SYMBOLE = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  telefon: '<path d="M5 3.5h3.5l1.8 4.5-2.2 1.4a11 11 0 0 0 6.5 6.5l1.4-2.2 4.5 1.8V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
  vorspulen: '<path d="M3 6.5l8 5.5-8 5.5z"/><path d="M12 6.5l8 5.5-8 5.5z"/>',
  pfeilRechts: '<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>',
  pfeilLinks: '<path d="M20 12H5"/><path d="M11 6l-6 6 6 6"/>',
  pfeilUnten: '<path d="M12 4v15"/><path d="M6 13l6 6 6-6"/>',
  haken: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  kreuz: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  ring: '<circle cx="12" cy="12" r="5"/>',
  lesezeichen: '<path d="M6.5 3.5h11v17l-5.5-3.8-5.5 3.8z"/>',
  wechsel: '<path d="M4 8h14"/><path d="M14 4l4 4-4 4"/><path d="M20 16H6"/><path d="M10 12l-4 4 4 4"/>',
  warnung: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5"/><path d="M12 17.3v.2"/>',
  frage: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.8.3-1.1.9-1.1 1.6v.5"/><path d="M12 17v.2"/>',
  schloss: '<rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>',
  dokument: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/><path d="M9 13h7M9 17h5"/>',
  aktualisieren: '<path d="M20 11A8 8 0 0 0 6.2 6.2L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 13a8 8 0 0 0 13.8 4.8l2.2-2.3"/><path d="M20 20v-4.5h-4.5"/>',
  eskalieren: '<path d="M12 21V8"/><path d="M6.5 13.5L12 8l5.5 5.5"/><path d="M5 3.5h14"/>',
  weiterarbeiten: '<path d="M3.5 6l6 6-6 6"/><circle cx="15.5" cy="11" r="4"/><path d="M18.5 14l3 3"/>',
  zurueckspulen: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3.5 3.5v5h5"/>',
  blitz: '<path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12z"/>',
  puzzle: '<path d="M4 9h3.5a2.2 2.2 0 1 1 4 0H15v3.5a2.2 2.2 0 1 1 0 4V20H4z"/>',
  kompass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  tabelle: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/><path d="M9.5 12l5 6M14.5 12l-5 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.6v.2"/>',
  flagge: '<path d="M5 21V4"/><path d="M5 4h12l-2.5 4L17 12H5"/>',
  schild: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/>',
  hammer: '<path d="M14 4l6 6"/><path d="M11 7l6 6"/><path d="M12.5 5.5l5 5-3 3-5-5z"/><path d="M11 11l-7 7"/><path d="M4 21h8"/>',
  werkzeug: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5L17 4a4 4 0 0 1 3 3l-2.5 2.5"/>',
  bericht: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 16v-3M12 16V9M16 16v-5"/>',
  stempel: '<path d="M9.5 3.5h5l-.8 6.5h-3.4z"/><path d="M5 13.5h14v3.5H5z"/><path d="M7 20.5h10"/>',
  griff: '<path d="M9 7v10M12 7v10M15 7v10"/>',
  fenster: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M3 9h18"/>',
  beamer: '<rect x="2.5" y="8" width="19" height="9" rx="2"/><circle cx="15.5" cy="12.5" r="2.5"/><path d="M6 12.5h4"/><path d="M6 17v2.5M18 17v2.5"/>',
  diagramm: '<path d="M4 4v16h16"/><path d="M7.5 15l4-4.5 3 3 5.5-6.5"/>',
  buch: '<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20"/>',
  person: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  ebenen: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
} as const satisfies Record<string, string>;

export type SymbolName = keyof typeof SYMBOLE;

/** Symbole, die als Fläche statt als Linie gezeichnet werden. */
const GEFUELLT: ReadonlySet<SymbolName> = new Set<SymbolName>(['vorspulen']);

/** Inline-SVG eines Symbols; dekorativ (aria-hidden) – die Bedeutung trägt immer ein Text daneben. */
export function symbol(name: SymbolName, klasse = ''): string {
  const klassen = ['symbol', GEFUELLT.has(name) ? 'gefuellt' : '', klasse].filter(Boolean).join(' ');
  return `<svg class="${klassen}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${SYMBOLE[name]}</svg>`;
}

export type StatusStufe = 'ok' | 'mittel' | 'kritisch' | 'neutral';

/** Form je Stufe: Kreis mit Haken · Raute mit Strich · Dreieck mit Ausrufezeichen · Punkt. */
const STATUS_FORMEN: Readonly<Record<StatusStufe, string>> = {
  ok: '<circle class="form" cx="8" cy="8" r="7"/><path class="zeichen" d="M4.6 8.2l2.3 2.3 4.5-4.6"/>',
  mittel: '<path class="form" d="M8 .8l7.2 7.2L8 15.2.8 8z"/><path class="zeichen" d="M5 8h6"/>',
  kritisch: '<path class="form" d="M8 1.2l7.3 13.2H.7z"/><path class="zeichen" d="M8 6v4"/><path class="zeichen" d="M8 12.2v.2"/>',
  neutral: '<circle class="form" cx="8" cy="8" r="6"/>',
};

/** Status-Symbol (16 × 16). Nie allein verwenden: immer mit Wort oder nur-sr-Text. */
export function statusSymbol(stufe: StatusStufe): string {
  return `<svg class="status-symbol" data-status="${stufe}" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${STATUS_FORMEN[stufe]}</svg>`;
}

/** Trendpfeil für Instrumente (gefüllt, Farbe über .trend[data-trend]). */
export function trendPfeil(richtung: 'hoch' | 'runter'): string {
  const d = richtung === 'hoch' ? 'M8 2l6 9H2z' : 'M8 14L2 5h12z';
  return `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
}
