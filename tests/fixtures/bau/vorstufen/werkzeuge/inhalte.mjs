// Attrappe von werkzeuge/inhalte.mjs für tests/bau.test.ts: Ergebnis kommt aus globalThis.mvgBauProbe.
export async function kompiliere({ pruefe }) {
  const probe = globalThis.mvgBauProbe ?? {};
  probe.aufrufe = [...(probe.aufrufe ?? []), `inhalte pruefe=${pruefe}`];
  return { fehler: probe.fehler ?? [], warnungen: probe.warnungen ?? [] };
}
