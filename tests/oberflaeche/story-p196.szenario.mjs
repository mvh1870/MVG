// Browser-Szenario Story, die sechs neuen Stationen und die Nebenfiguren der echten Story (P19.6, O-62): die neuen Mini-Arten (Matrix in 4, Mappe in 7,
// Pinnwand in 8, Bericht in 9, Rückfragen in 11) mit Layout und axe bei 1280/1024/400 px (320 px über `pruefer`), keine Nebenfiguren (Elternbeirat, Reporter, Ratsmitglied als Erzähltext, O-62 4c), die Pause nach Akt I, die Akt-Leiste und das Entscheidungsbuch auf der echten dist-Seite.
// Die Mechanik der Aufgaben mit synthetischen Inhalten prüft `story-p19`.
import { pruefer, sichtbarVerboten } from './hilfen.mjs';

export const name = 'story-p196';
export const hash = '#story';
export const viewports = [
  { breite: 1280, hoehe: 720 },
  { breite: 1024, hoehe: 768 },
  { breite: 400, hoehe: 800 },
];

/** Station → Titel (für die Überschrift) und Art der Mini-Aufgabe */
const NEU = [
  ['s4', 'Die Auflage', 'matrix'],
  ['s7', 'Der Zuschlag', 'mappe'],
  ['s8', 'Zwei Zahlen, zwei Wahrheiten', 'pinnwand'],
  ['s9', 'Der Monatstermin', 'bericht'],
  ['s11', 'Wenn Wissen im Kopf steckt', 'rueckfragen'],
];

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const pruefe = pruefer(seite, h);
  const verboten = async (wo) => { for (const f of sichtbarVerboten(await seite.locator('body').innerText())) h.befund(`${wo}: ${f}`); };
  const weiter = async () => { await h.klick('[data-pruef="weiter"]'); await h.warte(80); };
  const teil = () => seite.evaluate(() => document.body.dataset['teil'] ?? '');
  const zu = (kap, titel) => seite.goto(`${h.url.replace(/#.*$/u, '')}#story/${kap}`).then(() => h.erwarte(`[data-pruef="gs-titel"]:has-text("${titel}")`));

  await seite.evaluate(() => { try { localStorage.clear(); } catch { /* ohne Speicher */ } });
  await seite.reload();

  // die neuen Mini-Arten der echten Stationen: erreichbar, ohne Befund bei Layout und axe, keine verbotenen Wörter
  for (const [kap, titel, art] of NEU) {
    await zu(kap, titel);
    for (let i = 0; i < 4 && (await teil()) !== 'mini'; i++) {
      if ((await teil()) === 'frage') await h.klick('[data-pruef="antwort-1"]');
      await weiter();
    }
    if ((await teil()) !== 'mini') { h.befund(`${kap}: keine Mini-Aufgabe erreicht („${await teil()}“)`); continue; }
    await h.erwarte(`[data-pruef="mini-${art}"]`);
    await verboten(`${kap} ${art}`);
    await pruefe(`${kap}-${art}`);
    await h.bild(`${kap}-${art}`);
  }

  // Station 6: Elternbeirat und Reporter sprechen als Erzählzeilen – keine Nebenfiguren, keine eigenen Porträts (O-62, Antwort 4c)
  await zu('s6', 'Der Elternabend');
  const koerper6 = await seite.locator('body').innerText();
  if (!/Vorsitzende des Elternbeirats/u.test(koerper6) || !/Reporter/u.test(koerper6)) h.befund('Station 6: Elternbeirat oder Reporter fehlen im Erzähltext');
  if ((await seite.locator('.gs-dialog .gs-zeile[data-figur="ranzen"], .gs-dialog .gs-zeile[data-figur="spitzfeder"], .gs-dialog .gs-zeile[data-figur="pfennig"]').count()) !== 0) h.befund('Station 6: eine Nebenfigur spricht als eigene Figur');
  await verboten('Station 6');
  await pruefe('s6-szene');
  await h.bild('s6-szene');

  // Station 13: das Ratsmitglied im Einstieg, wieder ohne eigene Figur
  await zu('s13', 'Beschluss und Nachweis');
  if (!/Ratsmitglied/u.test(await seite.locator('body').innerText())) h.befund('Station 13: kein Ratsmitglied im Erzähltext');
  if ((await seite.locator('.gs-dialog .gs-zeile[data-figur="pfennig"]').count()) !== 0) h.befund('Station 13: Pfennig spricht als eigene Figur');
  await pruefe('s13-szene');

  // Pause nach Akt I und Akt-Leiste: nach der Mini-Aufgabe von Station 5 folgt die Pause
  await zu('s5', 'Die Schule will mehr');
  for (let i = 0; i < 4 && (await teil()) !== 'pause'; i++) {
    if ((await teil()) === 'frage') await h.klick('[data-pruef="antwort-1"]');
    await weiter();
  }
  if ((await teil()) !== 'pause') h.befund(`Pause: Schritt „${await teil()}“`);
  await h.erwarte('[data-pruef="gs-verlauf"]');
  await verboten('Pause');
  await pruefe('pause-a1');
  await h.bild('pause-a1');
  const leiste = await seite.locator('[data-pruef="gs-fortschritt"]').innerText();
  if (!/Pause|II|III/u.test(leiste)) h.befund(`Akt-Leiste: „${leiste.slice(0, 60)}“`);
  await weiter();
  await h.erwarte('[data-pruef="akt-kopf-a2"]');

  // Entscheidungsbuch: der Eintrag der beantworteten Station 5 (die übrigen Stationen wurden angesprungen, nicht beantwortet)
  await h.erwarte('[data-pruef="buch-symbol"]');
  await seite.locator('[data-pruef="buch-symbol"]').focus();
  await h.taste('Enter');
  await h.erwarte('[data-pruef="gs-buch"]');
  if ((await seite.locator('.gs-buch-eintrag, .gs-buch-zeile').count()) < 1) h.befund('Buch: kein Eintrag nach Station 5');
  await verboten('Buch');
  await pruefe('buch-real');
  await h.taste('Escape');
}
