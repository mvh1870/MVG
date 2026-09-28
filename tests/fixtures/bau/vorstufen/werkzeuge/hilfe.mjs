// Attrappe von werkzeuge/hilfe.mjs für tests/bau.test.ts.
export function baueHilfe({ wurzel } = {}) {
  const probe = globalThis.mvgBauProbe ?? {};
  probe.aufrufe = [...(probe.aufrufe ?? []), `hilfe wurzel=${wurzel === undefined ? 'undefined' : 'gesetzt'}`];
  return { hilfe: { kapitel: [] }, fehler: probe.hilfeFehler ?? [] };
}
