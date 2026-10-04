// Browser-Szenario Story, Gedächtnis und neue Aufgaben (P19.4/P19.5, O-62): die fünf neuen Mini-Arten (Matrix, Mappe, Pinnwand, Bericht, Rückfragen) mit
// Tastatur, Fokus und axe bei 1280/1024/400 px (320 px über `pruefer`), das Entscheidungsbuch (Symbol, Seite, Escape, Fokus), der Verlauf in der Pause,
// Vertiefung und Echo-Zeile. Die echte Story hat seit P19.6 diese Stationen (Szenario `story-p196`); dieses Szenario baut weiter eine Probe-Seite aus
// der synthetischen Story der Tests (tests/hilfen/geschichte-p19.ts) nach tmp/p19-*/ (je Lauf ein eigener Ordner) – nie nach dist/ –, samt den Beigaben
// (Symbole), erst in `vorbereite` (nach dem Browserstart), nie beim Import.
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pruefer, sichtbarVerboten } from './hilfen.mjs';

export const name = 'story-p19';
export const hash = '#story';
export const viewports = [
  { breite: 1280, hoehe: 720 },
  { breite: 1024, hoehe: 768 },
  { breite: 400, hoehe: 800 },
];

/**
 * Probe-Seite: die kompilierten Inhalte mit der synthetischen Story (14 Stationen, Akte, Echos, Buch, Vertiefungen, neue Aufgaben).
 * Läuft nie beim Import (L-383, L-390): `werkzeuge/oberflaeche.mjs` ruft sie nur, wenn das Szenario gewählt ist, und erst nach dem
 * Browserstart. Sie erzeugt die Vorstufen (Inhalte, Schriften) selbst – auf einem frischen Klon gibt es `src/generiert/` noch nicht –
 * und schreibt Seite und Beigaben (Symbole) in einen eigenen Ordner unter tmp/ (`mkdtemp`), damit zwei gleichzeitige Läufe sich nicht in
 * die Quere kommen; nie nach dist/.
 * @returns {Promise<{ seite: string, aufraeumen: () => Promise<void> }>} `seite` absolut
 */
export async function vorbereite() {
  const { baue, baueBeigaben, WURZEL } = await import('../../werkzeuge/bau.mjs');
  const { kompiliere } = await import('../../werkzeuge/inhalte.mjs');
  const { erzeugeSchriften } = await import('../../werkzeuge/schriften.mjs');
  const { p19Story, berichtMini, mappeMini, matrixMini, mitMini, pinnwandMini, rueckfragenMini } = await import('../hilfen/geschichte-p19.ts');
  const { fehler, inhalte: roh } = await kompiliere({ pruefe: false });
  if (fehler.length > 0) throw new Error(`inhalte meldet ${fehler.length} Fehler: ${fehler.join('; ')}`);
  await erzeugeSchriften({});
  let g = p19Story(roh.geschichte);
  g = mitMini(g, 4, matrixMini());
  g = mitMini(g, 6, mappeMini());
  g = mitMini(g, 8, pinnwandMini());
  g = mitMini(g, 9, berichtMini(), 'vor-frage');
  g = mitMini(g, 11, rueckfragenMini(), 'vor-frage');
  g.kapitel[8].vertiefung = { form: 'nachdenken', titel: 'Was fehlt im Bericht?', absaetzeHtml: ['Die Frage zur Vertiefung.'], antwortHtml: ['Die Antwort zur Vertiefung.'] };
  const kopie = { ...roh, geschichte: g };
  await mkdir(path.join(WURZEL, 'tmp'), { recursive: true });
  const ordner = await mkdtemp(path.join(WURZEL, 'tmp', 'p19-'));
  const aufraeumen = () => rm(ordner, { recursive: true, force: true });
  try {
    const inhalteDatei = path.join(ordner, 'p19-inhalte.json');
    const ziel = path.join(ordner, 'mvg-p19.html');
    await writeFile(inhalteDatei, JSON.stringify(kopie));
    await baue({ ziel, inhalte: inhalteDatei, mitVorstufen: false });
    for (const [n, inhalt] of await baueBeigaben(WURZEL)) await writeFile(path.join(ordner, n), inhalt);
    return { seite: ziel, aufraeumen };
  } catch (fehlerBau) {
    await aufraeumen();
    throw fehlerBau;
  }
}

/**
 * @param {import('playwright').Page} seite
 * @param {import('../../werkzeuge/oberflaeche.mjs').Helfer} h
 */
export async function lauf(seite, h) {
  const pruefe = pruefer(seite, h);
  const verboten = async (wo) => { for (const f of sichtbarVerboten(await seite.locator('body').innerText())) h.befund(`${wo}: ${f}`); };
  const weiter = async () => { await h.klick('[data-pruef="weiter"]'); await h.warte(80); };
  const fokus = () => seite.evaluate(() => (document.activeElement === document.body ? 'BODY' : document.activeElement?.getAttribute('data-pruef') ?? document.activeElement?.tagName ?? ''));
  const teil = () => seite.evaluate(() => document.body.dataset['teil'] ?? '');
  const zu = (kap) => seite.goto(`${h.url.replace(/#.*$/u, '')}#story/${kap}`).then(() => h.erwarte(`[data-pruef="gs-titel"]:has-text("Station ${kap.slice(1)}")`));
  /** Taste auf einem Bedienelement: fokussieren, drücken, der Fokus bleibt dort. */
  const druecke = async (pruef, taste, wo) => {
    await seite.locator(`[data-pruef="${pruef}"]`).focus();
    await h.taste(taste);
    await h.warte(60);
    if ((await fokus()) !== pruef) h.befund(`${wo}: Fokus nach ${taste} auf ${await fokus()}, erwartet ${pruef}`);
  };
  const text = async (pruef) => ((await seite.locator(`[data-pruef="${pruef}"]`).first().innerText()) ?? '').replace(/\s+/gu, ' ').trim();
  const antworte = async () => { await weiter(); await h.klick('[data-pruef="antwort-1"]'); };

  await seite.evaluate(() => { try { localStorage.clear(); } catch { /* ohne Speicher */ } });
  await seite.reload();

  // Station 4: Matrix – je Zettel zwei Wahlen, Rückmeldung „Stimmt.“ / „Nicht ganz.“, kein „Richtig“, keine Punkte
  await zu('s4');
  await antworte();
  await weiter();
  if ((await teil()) !== 'mini') h.befund(`Matrix: Schritt „${await teil()}“, erwartet Mini-Aufgabe`);
  await h.erwarte('[data-pruef="mini-matrix"]');
  if ((await seite.locator('svg.wb-matrix').count()) < 3) h.befund('Matrix: weniger als drei Matrixfelder gezeichnet');
  await druecke('wahl-1-stimmt', 'Enter', 'Matrix');
  await h.erwarte('[data-pruef="rueck-1"]:has-text("Stimmt.")');
  await druecke('wahl-2-stimmt', 'Space', 'Matrix');
  await h.erwarte('[data-pruef="rueck-2"]:has-text("Nicht ganz.")');
  const rueck = await text('mini-matrix');
  if (/\bRichtig\b|\d+ von \d+|Punkte/u.test(rueck)) h.befund(`Matrix: Zählwörter in der Rückmeldung („${rueck.slice(0, 80)}“)`);
  await verboten('Matrix');
  await pruefe('s4-matrix');
  await h.bild('s4-matrix');

  // Entscheidungsbuch: das Symbol erscheint nach Station 1, öffnet per Tastatur, Fokus auf den Titel, Escape schließt und der Fokus kehrt zurück
  await h.erwarte('[data-pruef="buch-symbol"]');
  await seite.locator('[data-pruef="buch-symbol"]').focus();
  await h.taste('Enter');
  await h.erwarte('[data-pruef="gs-buch"]');
  if ((await fokus()) !== 'gs-titel') h.befund(`Buch: Fokus nach dem Öffnen auf ${await fokus()}`);
  if ((await seite.locator('.gs-buch-eintrag, .gs-buch-zeile').count()) < 1) h.befund('Buch: kein Eintrag');
  const buchText = await text('gs-buch');
  if (/Ihre Antwort|Wertung|Punkte|\bFalle\b/u.test(buchText)) h.befund(`Buch: Wertung oder Antwort sichtbar („${buchText.slice(0, 80)}“)`);
  await verboten('Buch');
  await pruefe('buch');
  await h.bild('buch');
  await h.taste('Escape');
  await h.erwarteNicht('[data-pruef="gs-buch"]');
  if ((await fokus()) !== 'buch-symbol') h.befund(`Buch: Fokus nach Escape auf ${await fokus()}`);

  // Station 6: Mappe; Station 8: Pinnwand
  await zu('s6');
  await antworte();
  await weiter();
  await h.erwarte('[data-pruef="mini-mappe"]');
  for (let i = 1; i <= 4; i++) await druecke(`wahl-${i}-${i % 2 === 1 ? 'annehmen' : 'nachfordern'}`, 'Enter', 'Mappe');
  await h.erwarte('[data-pruef="mini-schluss"]');
  if ((await text('mini-schluss')) !== 'Zwei Abschnitte wurden nachgefordert.') h.befund(`Mappe: Schlusssatz „${await text('mini-schluss')}“`);
  await verboten('Mappe');
  await pruefe('s6-mappe');
  await h.bild('s6-mappe');
  await zu('s8');
  await antworte();
  await weiter();
  await h.erwarte('[data-pruef="mini-pinnwand"]');
  await druecke('wahl-1-stimmt', 'Enter', 'Pinnwand');
  await druecke('wahl-2-doppelt', 'Enter', 'Pinnwand');
  await druecke('wahl-3-nachfordern', 'Enter', 'Pinnwand');
  const faden = await seite.locator('[data-pruef="faden-2"]').getAttribute('data-faden');
  if (faden !== 'doppelt') h.befund(`Pinnwand: Faden 2 zeigt „${faden}“, erwartet doppelt`);
  if (!/Hier würde doppelt gezählt\./u.test(await text('faden-2'))) h.befund('Pinnwand: das Wort zum Faden fehlt (nie nur Farbe oder Linienart)');
  await verboten('Pinnwand');
  await pruefe('s8-pinnwand');
  await h.bild('s8-pinnwand');

  // Station 9: Bericht vor der Frage – Mehrfachauswahl, eine Prüfung, danach gesperrt; Vertiefung am Ende der Station
  await zu('s9');
  await weiter();
  if ((await teil()) !== 'mini') h.befund(`Bericht: Schritt „${await teil()}“, erwartet die Mini-Aufgabe vor der Frage`);
  await h.erwarte('[data-pruef="mini-bericht"]');
  await druecke('wahl-2-nachfordern', 'Space', 'Bericht');
  await druecke('wahl-4-nachfordern', 'Enter', 'Bericht');
  if ((await seite.locator('[data-pruef="gs-mini-rueck"], .gs-mini-rueck').count()) > 0) h.befund('Bericht: Rückmeldung vor der Prüfung');
  await seite.locator('[data-pruef="mini-pruefen"]').focus();
  await h.taste('Enter');
  await h.erwarte('[data-pruef="mini-schluss"]');
  // der Knopf „Prüfen“ verschwindet: der Fokus geht zum Schlusssatz (nie auf <body>)
  if ((await fokus()) !== 'mini-schluss') h.befund(`Bericht: Fokus nach der Prüfung auf ${await fokus()}, erwartet der Schlusssatz`);
  if ((await seite.locator('.gs-mini-rueck').count()) !== 6) h.befund(`Bericht: ${await seite.locator('.gs-mini-rueck').count()} Rückmeldungen, erwartet 6`);
  if (!(await seite.locator('[data-pruef="wahl-1-nachfordern"]').isDisabled())) h.befund('Bericht: nach der Prüfung nicht gesperrt');
  await verboten('Bericht');
  await pruefe('s9-bericht');
  await h.bild('s9-bericht');
  await weiter();
  await h.klick('[data-pruef="antwort-1"]');
  await h.erwarte('[data-pruef="gs-vertiefung-s9"]');
  if (await seite.locator('[data-pruef="gs-vertiefung-s9"]').evaluate((d) => d.open)) h.befund('Vertiefung: nicht zugeklappt');
  await seite.locator('[data-pruef="gs-vertiefung-s9"] > summary').focus();
  await h.taste('Enter');
  await h.warte(60);
  if (!(await seite.locator('[data-pruef="gs-vertiefung-s9"]').evaluate((d) => d.open))) h.befund('Vertiefung: per Enter nicht aufgeklappt');
  await seite.locator('[data-pruef="gs-vertiefung-antwort"] > summary').focus();
  await h.taste('Enter');
  await h.warte(60);
  if (!/Die Antwort zur Vertiefung\./u.test(await text('gs-vertiefung-s9'))) h.befund('Vertiefung: die Antwort steht nicht da');
  await verboten('Vertiefung');
  await pruefe('s9-vertiefung');

  // Station 11: Rückfragen – zwei von vier Gesprächen, die übrigen gesperrt, kein „Stimmt“
  await zu('s11');
  await weiter();
  await h.erwarte('[data-pruef="mini-rueckfragen"]');
  await druecke('wahl-3', 'Enter', 'Rückfragen');
  await h.erwarte('[data-pruef="gespraech-3"]');
  await druecke('wahl-1', 'Space', 'Rückfragen');
  await h.erwarte('[data-pruef="mini-schluss"]');
  if (!(await seite.locator('[data-pruef="wahl-2"]').isDisabled()) || !(await seite.locator('[data-pruef="wahl-4"]').isDisabled())) h.befund('Rückfragen: die übrigen Gespräche sind nicht gesperrt');
  const rf = await text('mini-rueckfragen');
  if (/Stimmt\.|Nicht ganz\.|\bRichtig\b/u.test(rf)) h.befund('Rückfragen: Richtig oder Falsch gemeldet');
  await verboten('Rückfragen');
  await pruefe('s11-rueckfragen');
  await h.bild('s11-rueckfragen');

  // Station 5 → Pause nach Akt I: Echo in der Szene, Verlauf mit Textfassung, „gespeichert“
  await zu('s5');
  if (!/Rückblick E1 /u.test(await seite.locator('body').innerText())) h.befund('Echo: die Zeile der Station 5 zeigt keine Fassung des Echos E1');
  await antworte();
  await weiter();
  for (let i = 0; i < 3 && (await teil()) !== 'pause'; i++) await weiter();
  if ((await teil()) !== 'pause') h.befund(`Pause: Schritt „${await teil()}“`);
  await h.erwarte('[data-pruef="gs-verlauf"]');
  if (!/ihr weg bis hier/iu.test(await text('gs-verlauf'))) h.befund('Pause: Kopf „Ihr Weg bis hier“ fehlt');
  await seite.locator('[data-pruef="gs-verlauf-worte"] > summary').focus();
  await h.taste('Enter');
  await h.warte(60);
  if ((await seite.locator('.gs-verlauf-liste > li').count()) < 4) h.befund('Pause: Textfassung des Verlaufs mit weniger als vier Zeilen');
  await verboten('Pause');
  await pruefe('pause-a1');
  await h.bild('pause-a1');
}
