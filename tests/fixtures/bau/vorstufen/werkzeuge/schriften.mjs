// Attrappe von werkzeuge/schriften.mjs für tests/bau.test.ts.
export async function erzeugeSchriften({ ziel } = {}) {
  const probe = globalThis.mvgBauProbe ?? {};
  probe.aufrufe = [...(probe.aufrufe ?? []), `schriften ziel=${String(ziel)}`];
  return { ziel: ziel ?? 'vorgabe', bytes: 0, eintraege: [] };
}
