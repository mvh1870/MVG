// Browser-Szenario Datenschutz und Impressum im Druck (R77): keine Seite endet mit einer Einleitungszeile („…:“), deren
// Aufzählung erst auf der nächsten Seite beginnt.
import { pdfSeiten } from './pdf.mjs';

export const name = 'rechtliches';
export const seite = 'dist/datenschutz.html';
export const viewports = [{ breite: 1280, hoehe: 720 }];

/**
 * @param {import('playwright').Page} s
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(s, h) {
  await h.erwarte('main');
  await s.emulateMedia({ media: 'print' });
  const pdf = await pdfSeiten(await s.pdf({ format: 'A4' }));
  await s.emulateMedia({ media: null });
  pdf.forEach((p, i) => {
    const letzte = (p.zeilen[p.zeilen.length - 1] ?? '').trim();
    if (i < pdf.length - 1 && letzte.endsWith(':')) h.befund(`Datenschutz im Druck: Seite ${i + 1} endet mit der Einleitungszeile „${letzte}“`);
  });
}
