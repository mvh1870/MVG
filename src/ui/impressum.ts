/*
 * Änderungsstand der Anwendung (P10.1): was sich je Fassung geändert hat – im Impressum auf der
 * Kapitelliste (#theorie/impressum). Fest im Code, damit der Bau deterministisch bleibt (kein Bau-Datum).
 */

export interface Aenderung {
  fassung: string;
  datum: string;
  text: string;
}

export const AENDERUNGEN: readonly Aenderung[] = [
  { fassung: '0.1', datum: '2026-09-28', text: 'Erste vollständige Fassung: Story (Welt A, Welt B, drei Enden, Epilog), 13 Lernseiten mit Originaltext, Glossar, Explore-Werkzeuge, Regie und Leinwand.' },
];
