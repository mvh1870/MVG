/*
 * Exportpaket „Werkzeuge Kompass“ (L-431): die neun Werkzeuge zur Verwendung in anderer Software.
 *
 *   node werkzeuge/werkzeuge-kompass.mjs [--datum JJJJ-MM-TT]
 *
 * Schreibt nach tmp/werkzeuge-kompass/ den Ordner „Werkzeuge Kompass“ und daneben die Zip-Datei:
 *   Werkzeuge-Kompass.html     eigenständige Seite (src/werkzeuge-kompass.ts), offline, ohne Nachladen
 *   daten/                     Inhalte, Beispiele und Regeln als JSON
 *   quellcode/                 baubares Modul: alle Quelldateien der Seite, ohne Kommentare, mit eigenem Bau
 *   LIZENZEN.txt, LIES-MICH.txt, SHA256SUMS.txt
 * Inhalte ohne interne Belege (O-38): keine Absatz- oder Handbuchkennungen, keine Fundstellen, keine Themen-Verweise.
 */

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, rm, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import * as esbuild from 'esbuild';
import { ADRESSE, baueText, BauFehler, faviconUrl, WURZEL } from './bau.mjs';
import { kompiliere } from './inhalte.mjs';
import { erzeugeSchriften } from './schriften.mjs';
import { ohneKommentare, gleicheWirkung } from './ohne-kommentare.mjs';

export const NAME = 'Werkzeuge Kompass';
const EINSTIEG = 'src/werkzeuge-kompass.ts';
const HUELLE = 'werkzeuge/huelle-werkzeuge-kompass.html';
const ARBEIT = path.join(WURZEL, 'tmp', 'werkzeuge-kompass');

/** Reihenfolge und Schlüssel der Werkzeuge (wie src/ui/werkzeug-kennungen.ts). */
const WERKZEUGE = [
  ['mcda', 'mcda'], ['vorlagen-check', 'vorlagencheck'], ['matrix', 'matrix'], ['risiko-grenzen', 'risikogrenzen'],
  ['vorgaenge', 'vorgaenge'], ['wegweiser', 'wegweiser'], ['register', 'register'], ['takt', 'takt'], ['monatsbericht', 'monatsbericht'], ['glossar', 'glossar'],
];

/** Der Glossar-Vorspann nennt die Themen der Hauptseite; die eigenständige Seite hat keine. */
const GLOSSAR_THEMEN = ' und nennt die Themen, in denen er vorkommt.';

/**
 * Rechenregeln je Werkzeug in Worten, wie sie die Kerne in src/werkzeuge/ und src/geschichte/mcda.ts umsetzen.
 * Werkzeuge ohne Rechnung (Vorgangsarten, Takt, Glossar) haben keine.
 */
const REGELN = {
  mcda: [
    'Gewichte und Punkte liegen je zwischen 1 und 5.',
    'Gesamtpunktzahl eines Wegs: für jeden Gesichtspunkt Gewicht mal Punkte, alles zusammengezählt.',
    'Rangfolge: die höchste Gesamtpunktzahl zuerst; gleiche Summen teilen sich den Rang (angezeigt nach Kennung des Wegs).',
    'Kipppunkte: Für jeden Gesichtspunkt wird bei sonst gleichen Gewichten je Richtung (weniger, dann mehr Gewicht) das nächstgelegene Gewicht zwischen 1 und 5 gesucht, bei dem sich die Spitze ändert – ein anderer Weg liegt vorn, oder ein Gleichstand an der Spitze entsteht oder löst sich auf.',
  ],
  vorlagencheck: [
    'Rot („nicht vollständig“): Ein Muss-Punkt (Feld „muss“) ist mit „nein“ beantwortet; es gibt weniger als zwei Wege mit dem Zustand „zulässig“ (unzulässige, nur zum Schein genannte und ungeklärte Wege zählen nicht); oder als entscheidende Stelle ist die Projektsteuerung, das nur beratende Gremium (Lenkungskreis) oder noch niemand genannt.',
    'Gelb („noch nicht entscheidungsreif“): jede andere Lücke („teilweise“, auch bei Muss-Punkten; „nein“ bei anderen Punkten) oder noch offene Antwort. Dringlichkeit und der Zustand einzelner Wege sind nur Hinweise und ändern die Ampel nicht.',
    'Grün („entscheidungsreif“): Alle Prüfpunkte sind mit „ja“ beantwortet.',
    'Solange ein Beispiel geladen ist (Gegenstand, Betrag und Reserve unverändert), gilt für den Prüfpunkt „Wer entscheiden darf“ die Zuordnung des Beispielprojekts (Feld „mandat“): Wer „Sie“ nennt, obwohl die höhere Stelle entscheidet, oder den Lenkungskreis nennt, erhält „nein“; hängt die Stelle von unbekanntem Betrag oder unbekannter Reserve ab, zählt die Antwort höchstens als „teilweise“; wird eine höhere Stelle genannt, obwohl Sie entscheiden dürften, ist das nur ein Hinweis. Ohne Beispiel entfällt die Zuordnung.',
  ],
  matrix: [
    'Zahl im Feld: Wahrscheinlichkeit (Stufe 1 bis 5) mal schwerste belegbare Auswirkung (Stufe 1 bis 5).',
    '1 bis 4: beobachten; 5 bis 9: gezielt bearbeiten; 10 bis 25: vorrangig bearbeiten.',
    'Auswirkung 5 ist immer vorrangig.',
  ],
  risikogrenzen: [
    'Je Reihe (Wahrscheinlichkeit in Prozent, Kosten in Euro, Verzug in Kalendertagen) gelten vier positive, streng steigende Grenzen; Prozentgrenzen liegen unter 100.',
    'Ein Wert genau auf einer Grenze gehört zur niedrigeren Stufe.',
    'Feld: Stufe der Wahrscheinlichkeit mal höchste belegte Stufe der Auswirkung (Kosten, Termin, Qualität oder Funktion); die Bearbeitungsstufe folgt der Risikomatrix, eine fest belegte Auswirkung 5 ist immer vorrangig.',
    'Unbekannt ist nicht null: Eine unbekannte Angabe zählt weder als 1 noch als 5. Offen ist die Bewertung, wenn die Wahrscheinlichkeit oder jede Auswirkung unbekannt ist; vorläufig, wenn eine Auswirkung unbekannt ist oder eine Spanne vorliegt; sonst fest. Ein Wert, der nicht zu den Grenzen passt, zählt als unbekannt.',
    'Eine Spanne wird nicht gemittelt: Das Feld „mindestens“ rechnet mit den unteren, das Feld „bis“ mit den oberen Stufen; reicht nur die Spanne bis Auswirkung 5, ist nur „bis“ vorrangig. Ist eine Auswirkung unbekannt und liegt die höchste bekannte Stufe unter 5, bleibt die Bewertung nach oben offen (kein „bis“).',
    'Wesentlich ist ein Risiko, wenn es schon im Feld „mindestens“ vorrangig ist, eine Entscheidungsschwelle des Bauherrn erreicht oder ein Warnanlass vorliegt.',
  ],
  wegweiser: [
    'Zuerst die Vorfrage, ob die Sache dringlich ist.',
    'Dann der Reihe nach; das erste „ja“ bestimmt die Art: Handlung nötig → Maßnahme; schon eingetreten → Problem; bewusst anders gewollt → Änderung; möglich → Risiko; geplante Arbeit → Aufgabe.',
    '„unklar“ ist nur bei „schon eingetreten?“ und „möglich?“ möglich und führt zur Frühwarnung.',
    'Alle Fragen mit „nein“: Ist die Sache dringlich, wird sie als Frühwarnung festgehalten. Sonst ist es vermutlich kein Vorgang – es sei denn, eine Entscheidung des Bauherrn wird gebraucht; dann heißt das Ergebnis „Entscheidung vorbereiten“.',
    'Danach immer die Frage, ob eine Entscheidung des Bauherrn nötig ist.',
  ],
  register: [
    'Stationen: Frühwarnung, Problem, Änderung, CTC / Prognose, Risiko, Entscheidungsregister, Entscheidungsvorlage, Freigabe, Maßnahme und Managementbericht; dazu der Hinweiskasten „Schwellenwert löst Frühwarnung aus“.',
    'Pfeile „wird zu“ (Lebenszyklus): Frühwarnung → Risiko, Frühwarnung → Problem, Risiko → Entscheidungsregister, Problem → Entscheidungsregister, Änderung → Entscheidungsregister, Änderung → CTC / Prognose, Entscheidungsregister → Entscheidungsvorlage, Entscheidungsvorlage → Freigabe, Freigabe → Maßnahme.',
    'Pfeile „Überwachung und Rückwirkung“: CTC / Prognose → Schwellenwert, Schwellenwert → Frühwarnung, Maßnahme → Risiko (der Regelkreis). Pfeil „Bericht“: Freigabe → Managementbericht.',
    'Es gibt keinen Pfeil vom Risiko zurück zur Frühwarnung (ein überschrittener Schwellenwert erzeugt eine neue Frühwarnung) und keinen von der Entscheidungsvorlage zur Maßnahme (erst der Beschluss, dann die Auflagen).',
    'Zuständigkeit: Der Bauherr führt Entscheidungsregister und Freigabe, die Projektsteuerung alle anderen Stationen; der Lenkungskreis berät und führt keine Station.',
    'Ein Fall besteht aus einer Startstation und einer Folge von Pfeilen. Jeder Pfeil kommt höchstens einmal vor, und seine Quelle ist die Startstation oder das Ziel eines früheren Pfeils. Fällt eine Station aus, endet der Fall vor dem ersten Pfeil, der sie berührt.',
    'Durchprobieren: Zu jedem Schritt zuerst die Frage, wohin es weitergeht (richtig ist das Ziel des nächsten Pfeils; andere Pfeile von derselben Station gehören zum Zusammenspiel, kommen im Fall aber später; Stationen ohne Pfeil von dort sind falsch), danach die Frage, wer die Zielstation führt.',
  ],
  monatsbericht: [
    'Ohne Monat, Datenstand, Lage, die Sätze zu den drei Ampeln und die benötigte Reaktion ist der Bericht unvollständig (gelb).',
    'Eine gelbe oder rote Ampel braucht eine verknüpfte offene Entscheidung oder eine benötigte Reaktion; sonst gelb.',
    'Zu jeder offenen Entscheidung gehören Frage, Stelle und Termin; fehlt etwas: rot.',
    'Jeder Eintrag und jede offene Entscheidung trägt eine Kennung; sonst gelb.',
    'Ein Abschnitt ohne Einträge heißt „keine“, nicht leer; sonst gelb. Auch die Liste der offenen Entscheidungen braucht Einträge oder „keine“. Ebenso gelb: mehr Einträge als die Höchstzahl des Abschnitts (Feld „max“), dringliche Einträge, umgesetzte, aber noch nicht wirksame Maßnahmen.',
    'Der Bericht soll auf eine Seite passen. Geschätzt wird mit Wortumbruch bei 86 Zeichen je Zeile; die Abschnitte stehen in zwei Spalten mit je 41 Zeichen. M, W, m, w, @ und % zählen 1,35 Zeichen, Zeichen außerhalb der lateinischen Schrift 1,6. Jede Überschrift ist eine Zeile, höchstens 50 Zeilen. Passt er nicht: rot.',
    'Gesamt: rot bei einem roten Hinweis, gelb bei anderen Hinweisen, sonst grün.',
  ],
};

/** HTML → schlichter Text (für die Daten). */
export function alsText(html) {
  return html
    .replace(/<\/(p|li|h[1-6])>\s*/gu, '\n')
    .replace(/<br\s*\/?>/gu, '\n')
    .replace(/<li>/gu, '– ')
    .replace(/<[^>]+>/gu, '')
    .replace(/&nbsp;|&#160;/gu, ' ')
    .replace(/&quot;/gu, '"').replace(/&#39;|&apos;/gu, "'").replace(/&lt;/gu, '<').replace(/&gt;/gu, '>').replace(/&amp;/gu, '&')
    .replace(/\n{2,}/gu, '\n')
    .trim();
}

/** Ersetzt `…Html`/`html` durch Text; bricht ab, wenn der Textschlüssel schon belegt ist. */
function textFelder(wert) {
  if (Array.isArray(wert)) return wert.map(textFelder);
  if (wert === null || typeof wert !== 'object') return wert;
  const aus = {};
  for (const [k, v] of Object.entries(wert)) {
    if (k === 'html' || k.endsWith('Html')) {
      const neu = k === 'html' ? 'text' : k.slice(0, -4);
      if (neu in wert) throw new BauFehler(`Datenexport: ${k} und ${neu} zugleich`);
      aus[neu] = alsText(String(v));
    } else aus[k] = textFelder(v);
  }
  return aus;
}

/** Inhalte der eigenständigen Seite: nur, was die Werkzeuge brauchen; ohne Belege, Fundstellen und Themen. */
export function reduziereInhalte(alle) {
  const w = alle.werkzeuge;
  const ergebnis = w.glossar.vorspann.ergebnis;
  if (!ergebnis.endsWith(GLOSSAR_THEMEN)) throw new BauFehler('Glossar-Vorspann: der Satz zu den Themen hat sich geändert – werkzeuge/werkzeuge-kompass.mjs anpassen');
  const kapitel = (alle.geschichte?.kapitel ?? []).filter((k) => k.vergleich !== null);
  if (kapitel.length === 0) throw new BauFehler('Kein Kapitel mit Vergleich – der Vergleichsrechner hätte kein Beispiel');
  return {
    version: alle.version,
    abbildungen: [],
    startseite: Object.fromEntries(Object.keys(alle.startseite).map((k) => [k, ''])),
    glossar: Object.fromEntries(Object.entries(alle.glossar).map(([id, g]) => [id, { ...g, vorkommen: { kapitel: [] } }])),
    theorie: {},
    kompass: (alle.kompass ?? []).map(({ beleg: _beleg, ...k }) => k),
    abdeckung: { anteil: 0, gesamt: 0, ziele: {} },
    geschichte: { ...alle.geschichte, kapitel },
    werkzeuge: { ...w, glossar: { ...w.glossar, vorspann: { ...w.glossar.vorspann, ergebnis: `${ergebnis.slice(0, -GLOSSAR_THEMEN.length)}.` } } },
  };
}

/** Daten für andere Software: Inhalte je Werkzeug, Regeln, Glossar, Begriffs-Kompass, Beispiel des Vergleichsrechners. */
export function datenExport(reduziert, fassung) {
  const w = reduziert.werkzeuge;
  const kap = reduziert.geschichte.kapitel[0];
  const v = kap.vergleich;
  return {
    name: NAME,
    fassung,
    anbieter: 'Bauherr Mentoren GmbH i. G.',
    hinweis: alsText(w.einleitungHtml),
    werkzeuge: WERKZEUGE.map(([adresse, teil]) => ({
      kennung: adresse,
      ...textFelder(w[teil]),
      regeln: REGELN[teil] ?? [],
    })),
    glossar: Object.values(reduziert.glossar)
      .sort((a, b) => a.begriff.localeCompare(b.begriff, 'de'))
      .map((g) => ({ kennung: g.id, begriff: g.begriff, definition: g.definition })),
    begriffsKompass: reduziert.kompass.map((k) => ({ ...k, hinweis: k.hinweis === null ? null : alsText(k.hinweis) })),
    beispielVergleich: {
      titel: kap.titel,
      zeit: kap.zeit,
      ...textFelder({ einleitungHtml: v.einleitungHtml, empfehlungHtml: v.empfehlungHtml }),
      kriterien: textFelder(v.kriterien),
      optionen: textFelder(v.optionen),
      ...(v.gewichte !== undefined ? { gewichte: v.gewichte } : {}),
    },
  };
}

/** Quelldateien der Seite (esbuild-Metadatei), relativ zur Wurzel. */
async function quellen() {
  const js = await esbuild.build({ absWorkingDir: WURZEL, entryPoints: [EINSTIEG], bundle: true, write: false, outdir: 'tmp/x', metafile: true, logLevel: 'silent', loader: { '.svg': 'text' }, define: { __MVG_VERSION__: '""' } });
  const css = await esbuild.build({ absWorkingDir: WURZEL, entryPoints: ['src/stil/index.css'], bundle: true, write: false, outdir: 'tmp/x', metafile: true, logLevel: 'silent', loader: { '.woff2': 'dataurl', '.svg': 'dataurl', '.png': 'dataurl' } });
  const alle = new Set([...Object.keys(js.metafile.inputs), ...Object.keys(css.metafile.inputs)]);
  // Typ-Importe löscht esbuild vor dem Bündeln; tsc braucht sie trotzdem
  const offen = [...alle].filter((d) => d.endsWith('.ts'));
  while (offen.length > 0) {
    const datei = offen.pop() ?? '';
    for (const m of (await readFile(path.join(WURZEL, datei), 'utf8')).matchAll(/\bfrom\s+'(\.[^']+\.ts)'/gu)) {
      const ziel = path.posix.normalize(path.posix.join(path.posix.dirname(datei), m[1] ?? ''));
      if (!alle.has(ziel)) {
        alle.add(ziel);
        offen.push(ziel);
      }
    }
  }
  return [...alle].sort();
}

const PAKET_JSON = {
  name: 'werkzeuge-kompass',
  version: '1.0.0',
  private: true,
  type: 'module',
  engines: { node: '>=22.18.0' },
  scripts: { bau: 'node bau.mjs', typen: 'tsc --noEmit -p tsconfig.json' },
  devDependencies: { esbuild: '0.28.2', typescript: '7.0.2' },
};

const TSCONFIG = {
  compilerOptions: {
    target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', strict: true, noUncheckedIndexedAccess: true, noImplicitOverride: true,
    noUnusedLocals: true, noUnusedParameters: true, exactOptionalPropertyTypes: true, erasableSyntaxOnly: true, verbatimModuleSyntax: true,
    allowImportingTsExtensions: true, resolveJsonModule: true, noEmit: true, skipLibCheck: true, types: [], lib: ['ES2022', 'DOM', 'DOM.Iterable'],
  },
  include: ['src/**/*'],
};

/** Prüft einen Text des Pakets auf interne Spuren. */
export function interneSpuren(text) {
  const muster = [
    [/Whitepaper|White[ -]Paper/iu, 'Whitepaper'],
    [/\bk\d{1,2}(?:\.\d+)*-[ptlb]\d+\b/u, 'Absatzkennung'],
    [/\bv24:[a-z]/u, 'Handbuchkennung'],
    [/(?<![A-Za-z0-9.,])[OL]-\d{1,3}(?![\d,.])/u, 'Entscheidkennung'],
    [/\bClaude\b|\bAnthropic\b|\bKI\b|\bLLM\b|\bGPT\b/u, 'KI-Hinweis'],
    [/Co-Authored|noreply@/iu, 'Autorenzeile'],
  ];
  return muster.filter(([m]) => m.test(text)).map(([m, name]) => `${name}: „${text.match(m)?.[0] ?? ''}“`);
}

async function sha256(datei) {
  return createHash('sha256').update(await readFile(datei)).digest('hex');
}

async function alleDateien(ordner, basis = ordner) {
  const aus = [];
  for (const n of (await readdir(ordner)).sort()) {
    const p = path.join(ordner, n);
    if ((await stat(p)).isDirectory()) aus.push(...await alleDateien(p, basis));
    else aus.push(path.relative(basis, p).split(path.sep).join('/'));
  }
  return aus;
}

export async function exportiere({ datum }) {
  const ergebnis = await kompiliere({ pruefe: false });
  if (Array.isArray(ergebnis?.fehler) && ergebnis.fehler.length > 0) throw new BauFehler(`inhalte meldet Fehler:\n  ${ergebnis.fehler.join('\n  ')}`);
  await erzeugeSchriften({});

  const alle = JSON.parse(await readFile(path.join(WURZEL, 'src/generiert/inhalte.json'), 'utf8'));
  const reduziert = reduziereInhalte(alle);
  const ziel = path.join(ARBEIT, NAME);
  await rm(ARBEIT, { recursive: true, force: true });
  await mkdir(path.join(ziel, 'daten'), { recursive: true });
  const reduziertDatei = path.join(ARBEIT, 'inhalte-werkzeuge.json');
  await writeFile(reduziertDatei, `${JSON.stringify(reduziert)}\n`, 'utf8');

  // 1. eigenständige Seite
  const seite = await baueText({ eintrag: EINSTIEG, huelle: HUELLE, einzeln: true, mitVorstufen: false, inhalte: reduziertDatei });
  await writeFile(path.join(ziel, 'Werkzeuge-Kompass.html'), seite.html, 'utf8');

  // 2. Daten
  const daten = datenExport(reduziert, datum);
  await writeFile(path.join(ziel, 'daten', 'werkzeuge-kompass.json'), `${JSON.stringify(daten, null, 2)}\n`, 'utf8');
  await writeFile(path.join(ziel, 'daten', 'inhalte-seite.json'), `${JSON.stringify(reduziert, null, 2)}\n`, 'utf8');

  // 3. Quellcode ohne Kommentare
  const qz = path.join(ziel, 'quellcode');
  const ungleich = [];
  for (const rel of await quellen()) {
    const von = path.join(WURZEL, rel);
    const nach = path.join(qz, rel);
    await mkdir(path.dirname(nach), { recursive: true });
    if (rel === 'src/generiert/inhalte.json') {
      await writeFile(nach, `${JSON.stringify(reduziert, null, 2)}\n`, 'utf8');
    } else if (/\.(ts|css)$/u.test(rel)) {
      const art = rel.endsWith('.css') ? 'css' : 'ts';
      const q = await readFile(von, 'utf8');
      const r = ohneKommentare(q, art);
      if (!(await gleicheWirkung(q, r, art))) ungleich.push(rel);
      await writeFile(nach, r, 'utf8');
    } else {
      await writeFile(nach, await readFile(von));
    }
  }
  if (ungleich.length > 0) throw new BauFehler(`Kommentare entfernen hat die Wirkung geändert: ${ungleich.join(', ')}`);
  for (const rel of ['src/typen/svg.d.ts']) {
    await mkdir(path.dirname(path.join(qz, rel)), { recursive: true });
    await writeFile(path.join(qz, rel), ohneKommentare(await readFile(path.join(WURZEL, rel), 'utf8'), 'ts'), 'utf8');
  }
  // Hülle des Moduls: Favicon und Adresse der Rechtsseiten fest eingesetzt (wie die Einzeldatei, setzeZusammen)
  const favicon = faviconUrl(await readFile(path.join(WURZEL, 'quellen/marke/logo-bm-bildmarke.svg'), 'utf8'));
  const huelle = (await readFile(path.join(WURZEL, HUELLE), 'utf8'))
    .replace('<!--mvg:favicon-->', () => `<link rel="icon" href="${favicon}">\n<meta name="mvg-rechtsseiten" content="${ADRESSE}">`);
  await writeFile(path.join(qz, 'huelle.html'), huelle, 'utf8');
  await writeFile(path.join(qz, 'package.json'), `${JSON.stringify(PAKET_JSON, null, 2)}\n`, 'utf8');
  await writeFile(path.join(qz, 'tsconfig.json'), `${JSON.stringify(TSCONFIG, null, 2)}\n`, 'utf8');
  await writeFile(path.join(qz, 'bau.mjs'), ohneKommentare(await readFile(path.join(WURZEL, 'werkzeuge/werkzeuge-kompass-bau.mjs'), 'utf8'), 'ts'), 'utf8');

  // 4. Lizenzen und Beschreibung
  const dritt = JSON.parse(await readFile(path.join(WURZEL, 'src/generiert/drittanbieter.json'), 'utf8'));
  const lizenzen = [
    `${NAME} – Drittanbieter und Lizenzen`,
    '',
    'Die Seite enthält zwei eingebettete Schriften anderer Urheber unter der SIL Open Font License 1.1.',
    'Texte, Grafiken und die Seite selbst stammen von der Bauherr Mentoren GmbH i. G.',
    '',
    ...dritt.komponenten.flatMap((k) => [`${k.name} (${k.paket} ${k.paketVersion}, ${k.spdx})`, `  ${k.copyright}`, `  Herkunft: ${k.upstream}`, '']),
    dritt.oflText,
    '',
  ].join('\n');
  await writeFile(path.join(ziel, 'LIZENZEN.txt'), lizenzen, 'utf8');
  await writeFile(path.join(ziel, 'LIES-MICH.txt'), liesMich(datum, daten), 'utf8');

  // 5. Prüfungen: keine internen Spuren, keine fremden Adressen in Daten und Quellcode
  const befunde = [];
  for (const rel of await alleDateien(ziel)) {
    if (!/\.(ts|css|json|txt|html|mjs)$/u.test(rel)) continue;
    const text = await readFile(path.join(ziel, rel), 'utf8');
    for (const b of interneSpuren(rel === 'LIZENZEN.txt' ? text.replace(dritt.oflText, '') : text)) befunde.push(`${rel}: ${b}`);
  }
  if (befunde.length > 0) throw new BauFehler(`Interne Spuren im Paket:\n  ${befunde.join('\n  ')}`);

  // 6. Prüfsummen und Zip
  const dateien = (await alleDateien(ziel)).filter((d) => d !== 'SHA256SUMS.txt');
  const summen = [];
  for (const d of dateien) summen.push(`${await sha256(path.join(ziel, d))}  ${d}`);
  await writeFile(path.join(ziel, 'SHA256SUMS.txt'), `${summen.join('\n')}\n`, 'utf8');
  const zip = path.join(WURZEL, 'tmp', `Werkzeuge-Kompass_${datum}.zip`);
  await rm(zip, { force: true });
  execFileSync('zip', ['-X', '-q', '-r', zip, NAME], { cwd: ARBEIT });
  return { ordner: ziel, zip, dateien: dateien.length + 1, seiteBytes: seite.bytes, werkzeuge: daten.werkzeuge.length };
}

function liesMich(datum, daten) {
  const liste = daten.werkzeuge.map((w) => `  #explore/${w.kennung.padEnd(16)} ${w.titel}`).join('\n');
  return `${NAME}
${'='.repeat(NAME.length)}
Stand: ${datum} · Anbieter: Bauherr Mentoren GmbH i. G. · Kontakt: kontakt@bauherr-mentoren.com

Inhalt des Pakets
-----------------
Werkzeuge-Kompass.html
  Die neun Werkzeuge als eigenständige Seite in einer einzigen Datei. Sie läuft im Browser ohne
  Internetverbindung, lädt nichts nach und speichert nichts. Schriften, Bilder und Skript stecken in der Datei.

daten/werkzeuge-kompass.json
  Alle Texte, Stufen, Auswahllisten, Beispiele und die Rechenregeln je Werkzeug in Worten
  (Feld "regeln"), dazu Glossar, Begriffs-Kompass und das Beispiel des Vergleichsrechners.
  Zum Nachbauen der Werkzeuge in anderer Software.

daten/inhalte-seite.json
  Die Inhalte genau in der Form, die die Seite liest (Texte als HTML).

quellcode/
  Der vollständige Quellcode der Seite (TypeScript und CSS) als eigenes Modul.
  Die Rechnung der Werkzeuge steht in quellcode/src/werkzeuge/ und quellcode/src/geschichte/mcda.ts,
  ohne Bildschirm und ohne Abhängigkeiten; die Oberfläche in quellcode/src/ui/flaechen/explore.ts und
  quellcode/src/ui/flaechen/explore/ (Glossar: quellcode/src/ui/flaechen/theorie.ts).
  Bauen (Node 22.18 oder neuer):
    cd quellcode
    npm install
    npm run bau        -> ausgabe/Werkzeuge-Kompass.html
    npm run typen      -> Typprüfung

LIZENZEN.txt
  Angaben zu den eingebetteten Schriften und der vollständige Text der SIL Open Font License 1.1.

SHA256SUMS.txt
  Prüfsummen aller Dateien (sha256sum -c SHA256SUMS.txt).

Die Werkzeuge und ihre Adressen
-------------------------------
Jedes Werkzeug lässt sich direkt öffnen, indem man die Adresse an den Dateinamen anhängt,
z. B. Werkzeuge-Kompass.html#explore/matrix (mit Beispiel: #explore/<werkzeug>/<beispiel>)
${liste}
  #lizenzen                 Drittanbieter & Lizenzen

Einbinden in andere Software
----------------------------
Die Seite kann als eigene Datei geöffnet, auf einem Webserver abgelegt oder in einem Rahmen (iframe)
angezeigt werden. Sie verbietet sich selbst das Nachladen von anderen Adressen (Content-Security-Policy) und
sendet keine Daten. Eingaben bleiben nur in der geöffneten Ansicht; beim Wechsel des Werkzeugs, beim Neuladen
und beim Schließen gehen sie verloren.

Hinweise
--------
Alle Beispiele stammen aus einem fiktiven Fall (Schulcampus Lindenhall-Süd); Stadt, Personen und Zahlen
sind erfunden und auf der Seite so gekennzeichnet.
Die Texte und Abbildungen dürfen Sie für die interne Schulung und für Präsentationen in Ihrer eigenen
Organisation verwenden. Für jede andere Verwendung gilt der Hinweis zum Urheberrecht im Impressum
unter https://www.governancekompass.de/impressum.html.
`;
}

async function hauptprogramm() {
  const i = process.argv.indexOf('--datum');
  const datum = i > 0 ? process.argv[i + 1] ?? '' : new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(datum)) throw new BauFehler('--datum JJJJ-MM-TT');
  const erg = await exportiere({ datum });
  console.log(`${NAME}: ${erg.werkzeuge} Werkzeuge, ${erg.dateien} Dateien, Seite ${erg.seiteBytes} Bytes`);
  console.log(`  ${path.relative(WURZEL, erg.ordner)}`);
  console.log(`  ${path.relative(WURZEL, erg.zip)}`);
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === path.join(WURZEL, 'werkzeuge', 'werkzeuge-kompass.mjs')) {
  hauptprogramm().catch((f) => {
    console.error(f instanceof Error ? f.message : String(f));
    process.exit(1);
  });
}
