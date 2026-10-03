/*
 * Fassungsangabe der Seite. Seit r72 (O-56: nichts, was nach Arbeitsstand klingt) zeigt die Seite keine
 * Fassungsnummer mehr; der Druckkopf trägt das Druckdatum („Druck vom …“). Der Bau ersetzt `__MVG_VERSION__`
 * weiterhin (werkzeuge/bau.mjs), die Seite liest es nicht mehr.
 */

/** Sichtbare Fassungsangabe: leer (r72, O-56) – Druckkopf und Regie-Fuß lassen sie dann weg. */
export const fassungText = (): string => '';
