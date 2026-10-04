/**
 * Atomares Schreiben (P19.8, L-390): erst in eine Nebendatei im selben Ordner, dann `rename`. Ein lesender Prozess
 * (Test, Bau, Browser-Szenario) sieht so nie eine gekürzte oder halb geschriebene Datei, auch wenn zwei Läufe
 * gleichzeitig dieselbe erzeugte Datei schreiben (`src/generiert/*`); der Nebenname trägt Prozess und Zähler.
 */
import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

let zaehler = 0;
/** @param {string} pfad */
const nebenname = (pfad) => `${pfad}.${process.pid}.${zaehler++}.tmp`;

/**
 * @param {string} pfad
 * @param {string | Uint8Array} inhalt
 */
export function schreibeAtomarSync(pfad, inhalt) {
  mkdirSync(path.dirname(pfad), { recursive: true });
  const neben = nebenname(pfad);
  writeFileSync(neben, inhalt);
  renameSync(neben, pfad);
}

/**
 * @param {string} pfad
 * @param {string | Uint8Array} inhalt
 */
export async function schreibeAtomar(pfad, inhalt) {
  await mkdir(path.dirname(pfad), { recursive: true });
  const neben = nebenname(pfad);
  await writeFile(neben, inhalt);
  await rename(neben, pfad);
}
