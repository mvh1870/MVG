// Akzentpalette (O-57): die sieben kräftigen Töne neben den Markenfarben (O-11). Werte stehen nur in
// tokens.css (`--akzent-<name>`, `-soft`, `-text`); hier stehen Namen und Rollen, damit Grafik und Flächen
// dieselbe Zuordnung nutzen. Kontraste: tests/stil-akzente.test.ts, Tabelle in docs/STIL.md.

export const AKZENTE = ['sonne', 'orange', 'beere', 'violett', 'blau', 'lagune', 'gruen'] as const;
export type Akzent = (typeof AKZENTE)[number];

/** Feste Rollen: vier Teile der Themen (O-54) und drei Balken der Story (O-52) – ohne Doppelung. */
export const AKZENT_ROLLEN = {
  teil1: 'gruen',
  teil2: 'lagune',
  teil3: 'orange',
  teil4: 'violett',
  geld: 'sonne',
  zeit: 'blau',
  vertrauen: 'beere',
} as const satisfies Record<string, Akzent>;
