/**
 * Läuft ein Werkzeug als Skript (nicht als Modul importiert)?
 *
 *   if (istHauptmodul(import.meta.url)) process.exitCode = await hauptprogramm();
 *
 * Node löst den Einstieg über `realpath` auf: Wird ein Werkzeug über einen Link aufgerufen
 * (Symlink, Junction, verlinkter Arbeitsordner), zeigt `import.meta.url` auf das Ziel, `argv[1]`
 * aber auf den Link. Ein reiner Pfadvergleich hielte das Werkzeug dann für importiert – es täte
 * nichts und endete mit Exitcode 0, in der Kette also grün. Deshalb werden beide Seiten mit
 * derselben Funktion aufgelöst, die Node für den Einstieg benutzt. `import.meta.main` bleibt
 * ungenutzt, weil `engines` Node-Versionen ohne dieses Feld zulässt.
 */
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @param {string} pfad
 * @returns {string | null}
 */
function echterPfad(pfad) {
  try {
    return realpathSync(pfad);
  } catch {
    return null;
  }
}

/**
 * @param {string} modulUrl  `import.meta.url` des Werkzeugs
 * @param {string | undefined} [skript]  Vorgabe `process.argv[1]`
 */
export function istHauptmodul(modulUrl, skript = process.argv[1]) {
  if (skript === undefined || skript === '') return false;
  const a = echterPfad(path.resolve(skript));
  const b = echterPfad(fileURLToPath(modulUrl));
  if (a === null || b === null) return false;
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}
