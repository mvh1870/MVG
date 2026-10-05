// Tests für die Prüfkette werkzeuge/kette.mjs und den Browser-Rückfall von werkzeuge/oberflaeche.mjs
// (P0.4). Die Kette läuft hier mit Attrappen-Schritten (node -e "process.exit(n)"), nicht mit der
// echten Kette – die prüft sich selbst über `npm run pruefe`.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { istHauptmodul } from '../werkzeuge/haupt.mjs';
import { WURZEL, laufe, schritte } from '../werkzeuge/kette.mjs';
import { UEBERSPRUNGEN, browserPflicht, fuehreAus, starteBrowser } from '../werkzeuge/oberflaeche.mjs';

type Schritt = ReturnType<typeof schritte>[number];

let ablage = '';
before(async () => {
  ablage = await mkdtemp(path.join(WURZEL, 'tmp', 'test-kette-'));
});
after(async () => {
  await rm(ablage, { recursive: true, force: true });
});

function attrappe(name: string, code: number, mehr: Partial<Schritt> = {}): Schritt {
  return {
    name,
    anzeige: `Attrappe ${name} → ${code}`,
    befehl: process.execPath,
    argumente: ['-e', `console.log('Ausgabe von ${name}'); process.exit(${code})`],
    ...mehr,
  };
}

function kette(codes: { typen?: number; test?: number; inhalte?: number; begriffe?: number; bau?: number; oberflaeche?: number }): Schritt[] {
  return [
    attrappe('inhalte', codes.inhalte ?? 0),
    attrappe('typen', codes.typen ?? 0),
    attrappe('test', codes.test ?? 0),
    attrappe('begriffe', codes.begriffe ?? 0),
    attrappe('bau', codes.bau ?? 0),
    attrappe('oberflaeche', codes.oberflaeche ?? 0, { braucht: 'bau', gelbBei: UEBERSPRUNGEN }),
  ];
}

async function lauf(liste: Schritt[], mehr: Parameters<typeof laufe>[1] = {}) {
  const mitschnitt = await mkdtemp(path.join(ablage, 'lauf-'));
  const erg = await laufe(liste, { still: true, mitschnitt, ...mehr });
  return { ...erg, mitschnitt, zeichen: erg.ergebnisse.map((e) => `${e.name}${e.zeichen}`).join(' ') };
}

describe('kette', () => {
  test('die echte Kette hat die Schritte der Architektur in dieser Reihenfolge', () => {
    const liste = schritte();
    assert.deepEqual(
      liste.map((s) => s.name),
      ['inhalte', 'typen', 'test', 'begriffe', 'bau', 'oberflaeche'],
    );
    const ob = liste.find((s) => s.name === 'oberflaeche');
    assert.equal(ob?.gelbBei, 3);
    assert.equal(ob?.braucht, 'bau');
    assert.ok(liste.find((s) => s.name === 'bau')?.argumente.includes('--pruefe'));
    assert.ok(liste.find((s) => s.name === 'inhalte')?.argumente.includes('--pruefe'));
  });

  test('alles grün → Exitcode 0', async () => {
    const erg = await lauf(kette({}));
    assert.equal(erg.zeichen, 'inhalte✓ typen✓ test✓ begriffe✓ bau✓ oberflaeche✓');
    assert.equal(erg.code, 0);
    assert.match(erg.text, /Gesamt: ✓ grün · /);
  });

  test('ein Rot bricht nicht ab, alle Schritte laufen, Exitcode 1', async () => {
    const erg = await lauf(kette({ test: 1, begriffe: 2 }));
    assert.equal(erg.zeichen, 'inhalte✓ typen✓ test✗ begriffe✗ bau✓ oberflaeche✓');
    assert.equal(erg.code, 1);
    assert.match(erg.text, /Gesamt: ✗ rot \(2 Schritte rot\)/);
    assert.match(erg.text, /test\s+✗\s+[\d,]+ s\s+Exitcode 1: Ausgabe von test/);
  });

  test('oberflaeche mit Exitcode 3 ist ⚠ und hält die Kette grün', async () => {
    const erg = await lauf(kette({ oberflaeche: 3 }));
    assert.equal(erg.zeichen, 'inhalte✓ typen✓ test✓ begriffe✓ bau✓ oberflaeche⚠');
    assert.equal(erg.code, 0);
    assert.match(erg.text, /grün mit 1 ⚠/);
    // Exitcode 3 ist nur für oberflaeche gelb.
    assert.equal((await lauf(kette({ bau: 3 }))).code, 1);
  });

  test('bau rot → oberflaeche läuft nicht', async () => {
    const erg = await lauf(kette({ bau: 1 }));
    assert.equal(erg.zeichen, 'inhalte✓ typen✓ test✓ begriffe✓ bau✗ oberflaeche–');
    assert.equal(erg.code, 1);
    assert.match(erg.text, /nicht gelaufen \(bau rot\)/);
    assert.ok(!existsSync(path.join(erg.mitschnitt, 'oberflaeche.txt')));
  });

  test('--nur und --ohne-oberflaeche', async () => {
    assert.equal((await lauf(kette({ test: 1 }), { nur: ['begriffe'] })).zeichen, 'begriffe✓');
    const ohne = await lauf(kette({ oberflaeche: 1 }), { ohneOberflaeche: true });
    assert.equal(ohne.zeichen, 'inhalte✓ typen✓ test✓ begriffe✓ bau✓ oberflaeche–');
    assert.equal(ohne.code, 0);
  });

  test('jede Ausgabe wird mitgeschnitten, samt Ergebnistabelle', async () => {
    const erg = await lauf(kette({ inhalte: 1 }));
    assert.equal(await readFile(path.join(erg.mitschnitt, 'inhalte.txt'), 'utf8'), 'Ausgabe von inhalte\n');
    assert.equal(await readFile(path.join(erg.mitschnitt, 'ergebnis.txt'), 'utf8'), `${erg.text}\n`);
  });

  test('fehlende Werkzeug-Datei und Zeitlimit sind rot', async () => {
    const fehlt = await lauf([attrappe('inhalte', 0, { datei: 'werkzeuge/gibt-es-nicht.mjs' })]);
    assert.equal(fehlt.zeichen, 'inhalte✗');
    assert.match(fehlt.text, /werkzeuge\/gibt-es-nicht\.mjs fehlt/);

    const haengt: Schritt = { name: 'test', anzeige: 'hängt', befehl: process.execPath, argumente: ['-e', 'setTimeout(() => {}, 60000)'] };
    const zeit = await lauf([haengt], { zeitlimitMs: 300 });
    assert.equal(zeit.zeichen, 'test✗');
    assert.match(zeit.text, /Zeitlimit/);
  });
});

/** oberflaeche.mjs mit einer Attrappe, bei der jeder Browserstart scheitert. */
function ohneBrowser(mehr: Record<string, string> = {}, wurzel = WURZEL) {
  const umgebung: NodeJS.ProcessEnv = { ...process.env, ...mehr };
  // Ohne diese Variablen, sonst wäre die Probe in der GitHub-Aktion (GITHUB_ACTIONS=true) rot.
  for (const name of ['CLAUDE_CODE_REMOTE', 'MVG_BROWSER_PFLICHT', 'GITHUB_ACTIONS']) if (!(name in mehr)) delete umgebung[name];
  return spawnSync(
    process.execPath,
    [
      '--import',
      pathToFileURL(path.join(WURZEL, 'tests', 'fixtures', 'bau', 'kein-browser.mjs')).href,
      path.join(wurzel, 'werkzeuge', 'oberflaeche.mjs'),
      '--datei',
      path.join(wurzel, 'werkzeuge', 'huelle.html'),
    ],
    { cwd: wurzel, encoding: 'utf8', env: umgebung, timeout: 180_000, maxBuffer: 64 * 1024 * 1024 },
  );
}

describe('oberflaeche: ohne Browser', () => {
  test('alle Versuche scheitern → kein Browser, Grund nennt jeden Versuch', async (t) => {
    const vorher = process.env['CLAUDE_CODE_REMOTE'];
    delete process.env['CLAUDE_CODE_REMOTE'];
    t.after(() => {
      if (vorher !== undefined) process.env['CLAUDE_CODE_REMOTE'] = vorher;
    });
    const kanaele: string[] = [];
    t.mock.method(chromium, 'launch', async (optionen?: { channel?: string }) => {
      kanaele.push(optionen?.channel ?? 'chromium');
      throw new Error(`Attrappe: ${optionen?.channel ?? 'chromium'} fehlt`);
    });
    const erg = await starteBrowser();
    assert.equal(erg.browser, null);
    assert.deepEqual(kanaele, ['chromium', 'chrome', 'msedge']);
    assert.ok('grund' in erg);
    assert.match(erg.grund, /Playwright-Chromium: Attrappe: chromium fehlt; Chrome: Attrappe: chrome fehlt; Edge: Attrappe: msedge fehlt/);
  });

  test('Kommandozeile meldet „ÜBERSPRUNGEN: kein Browser – …“ mit Exitcode 3', () => {
    const erg = ohneBrowser();
    assert.equal(erg.status, UEBERSPRUNGEN, erg.stdout + erg.stderr);
    assert.match(erg.stdout, /^ÜBERSPRUNGEN: kein Browser – Playwright-Chromium: Testattrappe: kein Browser/m);
  });

  test('wo der Browser Pflicht ist (GitHub-Aktion, MVG_BROWSER_PFLICHT=1), ist „kein Browser“ rot', () => {
    assert.equal(browserPflicht({}), false);
    assert.equal(browserPflicht({ MVG_BROWSER_PFLICHT: '1' }), true);
    assert.equal(browserPflicht({ GITHUB_ACTIONS: 'true' }), true);
    assert.equal(browserPflicht({ MVG_BROWSER_PFLICHT: '0', GITHUB_ACTIONS: 'false' }), false);
    for (const mehr of [{ MVG_BROWSER_PFLICHT: '1' }, { GITHUB_ACTIONS: 'true' }]) {
      const erg = ohneBrowser(mehr);
      assert.equal(erg.status, 1, erg.stdout + erg.stderr);
      assert.match(erg.stdout, /^FEHLER: kein Browser, hier aber Pflicht/m);
      assert.doesNotMatch(erg.stdout, /ÜBERSPRUNGEN/);
    }
  });
});

describe('oberflaeche: Cloud-Zweig (einmal installieren)', () => {
  type Mock = { mock: { method: (objekt: object, name: string, ersatz: (...a: unknown[]) => Promise<unknown>) => unknown } };
  /** Jeder Start scheitert; zählt die Versuche. */
  function scheitertImmer(t: Mock) {
    const zaehler = { n: 0 };
    t.mock.method(chromium, 'launch', async () => {
      zaehler.n += 1;
      throw new Error('Attrappe: kein Browser');
    });
    return zaehler;
  }

  test('ohne CLAUDE_CODE_REMOTE wird nichts installiert', async (t) => {
    const zaehler = scheitertImmer(t);
    let installiert = 0;
    const erg = await starteBrowser({
      umgebung: {},
      installiere: () => {
        installiert += 1;
        return { status: 0, fehler: null };
      },
    });
    assert.equal(erg.browser, null);
    assert.equal(installiert, 0);
    assert.equal(zaehler.n, 3);
  });

  test('Installation scheitert → Grund „Installation gescheitert“, kein weiterer Start', async (t) => {
    const zaehler = scheitertImmer(t);
    let installiert = 0;
    const erg = await starteBrowser({
      umgebung: { CLAUDE_CODE_REMOTE: 'true' },
      installiere: () => {
        installiert += 1;
        return { status: 1, fehler: null };
      },
    });
    assert.equal(erg.browser, null);
    assert.equal(installiert, 1);
    assert.equal(zaehler.n, 3);
    assert.ok('grund' in erg);
    assert.match(erg.grund, /; Installation gescheitert \(Exitcode 1\)$/);
    const mitFehler = await starteBrowser({ umgebung: { CLAUDE_CODE_REMOTE: 'true' }, installiere: () => ({ status: null, fehler: new Error('npx fehlt') }) });
    assert.ok('grund' in mitFehler);
    assert.match(mitFehler.grund, /; Installation gescheitert \(npx fehlt\)$/);
  });

  test('Installation gelingt, Start scheitert → Grund „nach Installation“', async (t) => {
    const zaehler = scheitertImmer(t);
    const erg = await starteBrowser({ umgebung: { CLAUDE_CODE_REMOTE: 'true' }, installiere: () => ({ status: 0, fehler: null }) });
    assert.equal(erg.browser, null);
    assert.equal(zaehler.n, 4, 'nach der Installation genau ein weiterer Start');
    assert.ok('grund' in erg);
    assert.match(erg.grund, /; nach Installation: Attrappe: kein Browser$/);
  });

  test('Installation gelingt, Start gelingt → frisch installierter Browser', async (t) => {
    let versuch = 0;
    const attrappe = { version: () => 'Attrappe' };
    t.mock.method(chromium, 'launch', async () => {
      versuch += 1;
      if (versuch <= 3) throw new Error('Attrappe: kein Browser');
      return attrappe;
    });
    const erg = await starteBrowser({ umgebung: { CLAUDE_CODE_REMOTE: 'true' }, installiere: () => ({ status: 0, fehler: null }) });
    assert.equal(erg.browser, attrappe);
    assert.ok('name' in erg);
    assert.equal(erg.name, 'Playwright-Chromium (frisch installiert)');
  });

  test('Cloud mit vorinstalliertem Chromium → Start über executablePath, keine Installation', async (t) => {
    const ordner = await mkdtemp(path.join(ablage, 'pw-'));
    await writeFile(path.join(ordner, 'chromium'), '');
    const attrappe = { version: () => 'Attrappe' };
    const pfade: Array<string | undefined> = [];
    t.mock.method(chromium, 'launch', async (optionen?: { executablePath?: string }) => {
      pfade.push(optionen?.executablePath);
      if (optionen?.executablePath === undefined) throw new Error('Attrappe: kein Browser');
      return attrappe;
    });
    let installiert = 0;
    const erg = await starteBrowser({
      umgebung: { CLAUDE_CODE_REMOTE: 'true', PLAYWRIGHT_BROWSERS_PATH: ordner },
      installiere: () => {
        installiert += 1;
        return { status: 0, fehler: null };
      },
    });
    assert.equal(erg.browser, attrappe);
    assert.equal(installiert, 0);
    assert.deepEqual(pfade, [undefined, undefined, undefined, path.join(ordner, 'chromium')]);
  });
});

describe('Werkzeuge laufen auch über einen Link', () => {
  test('istHauptmodul löst Links auf; Werkzeuge über eine Junction bzw. einen Symlink arbeiten', async () => {
    const link = path.join(ablage, 'werkzeuge-link');
    // 'junction' braucht unter Windows keine Adminrechte; anderswo wird daraus ein Verzeichnis-Symlink.
    await symlink(path.join(WURZEL, 'werkzeuge'), link, 'junction');
    const echt = pathToFileURL(path.join(WURZEL, 'werkzeuge', 'kette.mjs')).href;
    assert.equal(istHauptmodul(echt, path.join(link, 'kette.mjs')), true);
    assert.equal(istHauptmodul(echt, path.join(WURZEL, 'werkzeuge', 'kette.mjs')), true);
    assert.equal(istHauptmodul(echt, path.join(link, 'bau.mjs')), false);
    assert.equal(istHauptmodul(echt, path.join(link, 'gibt-es-nicht.mjs')), false);
    assert.equal(istHauptmodul(echt, undefined), false);

    // Vorher taten die Werkzeuge über einen Link nichts und endeten mit 0 (in der Kette grün).
    for (const werkzeug of ['kette.mjs', 'bau.mjs', 'oberflaeche.mjs']) {
      const erg = spawnSync(process.execPath, [path.join(link, werkzeug), '--gibt-es-nicht'], { cwd: ablage, encoding: 'utf8' });
      assert.equal(erg.status, 1, `${werkzeug} über den Link: ${erg.stdout}${erg.stderr}`);
      assert.match(erg.stdout + erg.stderr, /unbekannte Option/i, werkzeug);
    }
  });
});

describe('frischer Checkout (ohne src/generiert)', () => {
  test('die Kette erzeugt inhalte.json, bevor typen und test sie lesen', async () => {
    const liste = schritte().map((s) => s.name);
    assert.ok(liste.indexOf('inhalte') < liste.indexOf('typen'));
    assert.ok(liste.indexOf('inhalte') < liste.indexOf('test'));

    // Kopie wie nach einem Checkout: src/generiert/ fehlt (steht in .gitignore).
    const kopie = await mkdtemp(path.join(ablage, 'checkout-'));
    const generiertOrdner = path.join(WURZEL, 'src', 'generiert');
    const nichtGeneriert = (quelle: string) => quelle !== generiertOrdner && !quelle.startsWith(generiertOrdner + path.sep);
    for (const teil of ['src', 'inhalte', 'werkzeuge', 'tests']) {
      await cp(path.join(WURZEL, teil), path.join(kopie, teil), { recursive: true, filter: nichtGeneriert });
    }
    for (const datei of ['tsconfig.json', 'package.json']) await cp(path.join(WURZEL, datei), path.join(kopie, datei));
    const wp = path.join('quellen', 'whitepaper', 'v1.2', 'whitepaper.json');
    await mkdir(path.dirname(path.join(kopie, wp)), { recursive: true });
    await cp(path.join(WURZEL, wp), path.join(kopie, wp));
    await symlink(path.join(WURZEL, 'node_modules'), path.join(kopie, 'node_modules'), 'junction');
    const generiert = path.join(kopie, 'src', 'generiert', 'inhalte.json');
    assert.ok(!existsSync(generiert), 'Kopie enthält schon src/generiert');

    const kette = (nur: string) =>
      spawnSync(process.execPath, [path.join(kopie, 'werkzeuge', 'kette.mjs'), '--nur', nur], {
        cwd: kopie,
        encoding: 'utf8',
        timeout: 300_000, // ein hängender Lauf soll rot werden, nicht die Suite anhalten
        maxBuffer: 64 * 1024 * 1024, // die rote `typen`-Ausgabe ist lang; 1 MiB reicht nicht
      });
    // Gegenprobe: ohne inhalte ist typen auf dem frischen Stand rot – die Reihenfolge ist also nötig.
    const ohne = kette('typen');
    assert.equal(ohne.status, 1, ohne.stdout + ohne.stderr);
    assert.match(ohne.stdout, /typen\s+✗/);

    const mit = kette('inhalte,typen');
    assert.equal(mit.status, 0, mit.stdout + mit.stderr);
    assert.match(mit.stdout, /inhalte\s+✓[\s\S]*typen\s+✓/);
    assert.ok(existsSync(generiert));
  });

  test('oberflaeche.mjs läuft in der Kopie ohne schriften.css und baut beim Import nichts (S1, L-390)', async () => {
    const kopie = await mkdtemp(path.join(ablage, 'checkout-oberflaeche-'));
    const generiertOrdner = path.join(WURZEL, 'src', 'generiert');
    const nichtGeneriert = (quelle: string) => quelle !== generiertOrdner && !quelle.startsWith(generiertOrdner + path.sep);
    for (const teil of ['src', 'inhalte', 'werkzeuge', 'tests']) {
      await cp(path.join(WURZEL, teil), path.join(kopie, teil), { recursive: true, filter: nichtGeneriert });
    }
    for (const datei of ['tsconfig.json', 'package.json']) await cp(path.join(WURZEL, datei), path.join(kopie, datei));
    await symlink(path.join(WURZEL, 'node_modules'), path.join(kopie, 'node_modules'), 'junction');
    assert.ok(!existsSync(path.join(kopie, 'src', 'generiert', 'schriften.css')), 'Kopie enthält schon schriften.css');

    // Alle Szenarien werden geladen; ein Bau beim Import bräuchte schriften.css und inhalte.json und würfe hier.
    const erg = ohneBrowser({}, kopie);
    assert.equal(erg.status, UEBERSPRUNGEN, erg.stdout + erg.stderr);
    assert.match(erg.stdout, /^ÜBERSPRUNGEN: kein Browser/m);
    assert.ok(!existsSync(path.join(kopie, 'src', 'generiert')), 'der Import hat src/generiert angelegt');
    assert.ok(!existsSync(path.join(kopie, 'tmp')), 'der Import hat tmp/ angelegt');
  });

  test('Szenario story-p19: vorbereite() ist eine Funktion, der Import schreibt nichts', async () => {
    const vorher = existsSync(path.join(WURZEL, 'tmp')) ? await readdir(path.join(WURZEL, 'tmp')) : [];
    const modul = await import('./oberflaeche/story-p19.szenario.mjs');
    assert.equal(typeof modul.vorbereite, 'function');
    assert.equal('seite' in modul, false, 'ein fester Seitenpfad würde Läufe teilen');
    const nachher = existsSync(path.join(WURZEL, 'tmp')) ? await readdir(path.join(WURZEL, 'tmp')) : [];
    assert.deepEqual(nachher.filter((n) => n.startsWith('p19-') && !vorher.includes(n)), []);
  });
});

describe('oberflaeche: jedes Fenster wird beobachtet (auch Popups)', () => {
  test('console.error und ungefangener Wurf in einem Popup sind Befunde', async (t) => {
    // Echter Browser, aber ohne Cloud-Installation; fehlt er, ist dieser Test übersprungen (die
    // Kette meldet das dann ohnehin bei `oberflaeche`).
    const start = await starteBrowser({ umgebung: {} });
    if (!start.browser) {
      t.skip(`kein Browser: ${start.grund.slice(0, 120)}`);
      return;
    }
    const browser = start.browser;
    t.after(() => browser.close());
    const ordner = await mkdtemp(path.join(ablage, 'popup-'));
    await writeFile(
      path.join(ordner, 'popup.html'),
      // Fehler erst auf Klick: wirft das Popup schon beim Laden, kann der Wurf vor dem Anhängen des Beobachters
      // liegen (gemessen: in der GitHub-Aktion 2026-09-27 einmal verloren) – dann prüfte der Test den Zufall.
      '<!doctype html><meta charset="utf-8"><title>p</title><button onclick="console.error(\'Popup-Fehler\'); setTimeout(() => { throw new Error(\'Popup-Wurf\'); })">los</button>',
      'utf8',
    );
    await writeFile(
      path.join(ordner, 'haupt.html'),
      `<!doctype html><meta charset="utf-8"><title>h</title><button onclick="window.open(location.href.replace('haupt.html', 'popup.html'), '_blank', 'popup')">auf</button>`,
      'utf8',
    );
    const befunde = await fuehreAus(
      browser,
      {
        name: 'test-popup',
        datei: 'test-popup.szenario.mjs',
        viewports: [{ breite: 800, hoehe: 600 }],
        hash: '',
        async lauf(seite) {
          const [popup] = await Promise.all([seite.waitForEvent('popup'), seite.click('button')]);
          await popup.waitForLoadState('load');
          await popup.click('button');
          await popup.waitForTimeout(300);
        },
      },
      { breite: 800, hoehe: 600 },
      pathToFileURL(path.join(ordner, 'haupt.html')).href,
      ordner,
    );
    assert.ok(befunde.includes('[Fenster 2] console.error: Popup-Fehler'), befunde.join('\n'));
    assert.ok(befunde.some((b) => b.startsWith('[Fenster 2] pageerror: Popup-Wurf')), befunde.join('\n'));
    assert.ok(!befunde.some((b) => b.startsWith('console.error') || b.startsWith('pageerror')), 'Hauptfenster fehlerfrei');
  });
});
