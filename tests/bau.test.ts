// Tests für werkzeuge/bau.mjs (P0.4) mit der Mini-Fixtur tests/fixtures/bau/.
// Der volle Bau (Inhalte, Schriften, src/) wird hier bewusst nicht gebraucht: mitVorstufen: false.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {
  ANKER,
  BUDGET,
  WURZEL,
  baue,
  cspZeile,
  entschaerfeSkript,
  entschaerfeStil,
  ersetzeEinmal,
  setzeZusammen,
} from '../werkzeuge/bau.mjs';

type Optionen = NonNullable<Parameters<typeof baue>[0]>;

const FIXTUR = path.join(WURZEL, 'tests', 'fixtures', 'bau');
const HUELLE = path.join(WURZEL, 'werkzeuge', 'huelle.html');
let ablage = '';

function optionen(ziel: string, mehr: Optionen = {}): Optionen {
  return {
    wurzel: FIXTUR,
    eintrag: 'main.ts',
    stil: 'stil.css',
    huelle: HUELLE,
    mitVorstufen: false,
    zwischen: path.join(ablage, 'zwischen'),
    ziel,
    ...mehr,
  };
}

/** Inhalt des einen Inline-Skripts, genau so, wie der Browser ihn hasht. */
function skriptInhalt(html: string): string {
  const treffer = /<script>([\s\S]*?)<\/script>/.exec(html);
  assert.ok(treffer, 'kein <script> im Ergebnis');
  return treffer[1] ?? '';
}

/**
 * Die CSP-Zeile WÖRTLICH nach docs/ARCHITEKTUR.md „Einzeldatei und Sicherheit“ – bewusst nicht aus
 * cspZeile() abgeleitet: Jede Lockerung (zusätzliche Quelle, neue Direktive) muss hier auffallen.
 */
function erwarteteCsp(hash: string): string {
  return `default-src 'none'; script-src '${hash}'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'`;
}

function zaehle(text: string, nadel: RegExp): number {
  return (text.match(nadel) ?? []).length;
}

before(async () => {
  ablage = await mkdtemp(path.join(WURZEL, 'tmp', 'test-bau-'));
});

after(async () => {
  await rm(ablage, { recursive: true, force: true });
});

describe('bau: Einzeldatei aus der Fixtur', () => {
  test('zwei Bauten sind byte-gleich (Determinismus)', async () => {
    const a = path.join(ablage, 'a.html');
    const b = path.join(ablage, 'b.html');
    const ergA = await baue(optionen(a));
    const ergB = await baue(optionen(b));
    const bytesA = await readFile(a);
    const bytesB = await readFile(b);
    assert.ok(bytesA.equals(bytesB), 'zwei Bauten unterscheiden sich');
    assert.equal(ergA.sha256, ergB.sha256);
    assert.equal(ergA.bytes, bytesA.length);
    assert.ok(!bytesA.includes('\r'), 'Ergebnis enthält CR');
  });

  test('--pruefe: aktuelles Ziel ist grün, veraltetes und fehlendes Ziel sind rot mit Hinweis', async () => {
    const ziel = path.join(ablage, 'pruef.html');
    await baue(optionen(ziel));
    const erg = await baue(optionen(ziel, { pruefe: true }));
    assert.equal(erg.geprueft, true);
    const vorher = await readFile(ziel);

    await writeFile(ziel, Buffer.concat([vorher, Buffer.from('\n')]));
    await assert.rejects(baue(optionen(ziel, { pruefe: true })), /veraltet[\s\S]*npm run bau/);
    // --pruefe schreibt das Ziel nicht: der veraltete Stand bleibt stehen.
    assert.equal((await readFile(ziel)).length, vorher.length + 1);

    await assert.rejects(baue(optionen(path.join(ablage, 'gibt-es-nicht.html'), { pruefe: true })), /fehlt[\s\S]*npm run bau/);
  });

  test('CSP enthält den sha256 genau des eingesetzten Skripts und die Direktiven der Architektur', async () => {
    const ziel = path.join(ablage, 'csp.html');
    const erg = await baue(optionen(ziel));
    const html = await readFile(ziel, 'utf8');
    const skript = skriptInhalt(html);
    const hash = 'sha256-' + createHash('sha256').update(skript, 'utf8').digest('base64');
    assert.equal(erg.skriptHash, hash);

    const meta = /<meta http-equiv="Content-Security-Policy" content="([^"]+)">/.exec(html);
    assert.ok(meta, 'CSP-Meta fehlt');
    const csp = meta[1] ?? '';
    assert.equal(csp, erwarteteCsp(hash));
    assert.equal(cspZeile(skript), erwarteteCsp(hash));
    // Die CSP muss vor jedem Stil und Skript stehen, sonst gilt sie für diese nicht.
    assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<style>'));
    assert.ok(html.indexOf('Content-Security-Policy') < html.indexOf('<script>'));
    // Ein anderer Skripttext ergäbe einen anderen Hash.
    assert.notEqual(cspZeile(skript + ' '), csp);
  });

  test('dist/mvg.html trägt die CSP wörtlich, mit dem Hash ihres einen Skripts', async (t) => {
    const datei = path.join(WURZEL, 'dist', 'mvg.html');
    let html: string;
    try {
      html = await readFile(datei, 'utf8');
    } catch {
      t.skip('dist/mvg.html fehlt (noch nicht gebaut)');
      return;
    }
    const metas = [...html.matchAll(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/g)];
    assert.equal(metas.length, 1, 'genau eine CSP');
    assert.equal(zaehle(html, /<script\b/gi), 1, 'genau ein Skript');
    const skript = skriptInhalt(html);
    const hash = 'sha256-' + createHash('sha256').update(skript, 'utf8').digest('base64');
    assert.equal(metas[0]?.[1], erwarteteCsp(hash));
  });

  test('Skript und Stil sind entschärft, der Inhalt ist eingebaut (SVG als Text, JSON, Version, Umlaute)', async () => {
    const ziel = path.join(ablage, 'inhalt.html');
    await baue(optionen(ziel, { version: '9.8.7' }));
    const html = await readFile(ziel, 'utf8');
    assert.equal(zaehle(html, /<\/script/gi), 1, 'nur das schließende Tag darf </script enthalten');
    assert.equal(zaehle(html, /<\/style/gi), 1, 'nur das schließende Tag darf </style enthalten');
    assert.equal(zaehle(html, /<!--/g), 0, 'kein <!-- und kein übrig gebliebener Anker');
    assert.equal(zaehle(html, /<script\b/gi), 1, 'genau ein Skript');
    assert.ok(html.includes('0 10 10'), 'SVG nicht als Text eingebaut');
    assert.ok(html.includes('Bau-Fixtur äöü „Anführung“'), 'JSON bzw. Umlaute fehlen (charset utf8)');
    assert.ok(html.includes('9.8.7'), '__MVG_VERSION__ nicht ersetzt');
    assert.ok(!html.includes('__MVG_VERSION__'));
    assert.ok(html.includes('.fixtur-titel{color:#0c1c33}'), '@import im Stil nicht gebündelt');
    assert.ok(!/\/\/# sourceMappingURL/.test(html), 'Quelltextkarte im Ergebnis');
  });

  test('Versionsvorgabe kommt aus package.json', async () => {
    const ziel = path.join(ablage, 'version.html');
    await baue(optionen(ziel));
    const paket = JSON.parse(await readFile(path.join(WURZEL, 'package.json'), 'utf8')) as { version: string };
    assert.ok(skriptInhalt(await readFile(ziel, 'utf8')).includes(paket.version));
  });

  test('Budget-Überschreitung wird erkannt, genau am Budget ist erlaubt', async () => {
    const ziel = path.join(ablage, 'budget.html');
    const erg = await baue(optionen(ziel));
    await baue(optionen(path.join(ablage, 'budget-genau.html'), { budget: erg.bytes }));
    await assert.rejects(baue(optionen(path.join(ablage, 'budget-drueber.html'), { budget: erg.bytes - 1 })), /Größenbudget überschritten/);
    assert.equal(BUDGET, 4_000_000);
  });

  test('doppelter Anker in der Hülle ist ein Fehler', async () => {
    await assert.rejects(
      baue(optionen(path.join(ablage, 'doppelt.html'), { huelle: 'huelle-doppelt.html' })),
      /<!--mvg:stil--> steht 2-mal/,
    );
  });

  test('fehlender Anker in der Hülle ist ein Fehler', async () => {
    await assert.rejects(
      baue(optionen(path.join(ablage, 'ohne.html'), { huelle: 'huelle-ohne-skript.html' })),
      /<!--mvg:skript--> fehlt/,
    );
  });

  test('Vorstufen: erst Inhalte (pruefe=false), dann Schriften; Warnungen durchgereicht, Fehler brechen ab', async (t) => {
    const probe: { aufrufe?: string[]; fehler?: string[]; warnungen?: string[] } = { warnungen: ['nur ein Hinweis'] };
    const global = globalThis as Record<string, unknown>;
    global['mvgBauProbe'] = probe;
    t.after(() => {
      delete global['mvgBauProbe'];
    });
    const vorstufen: Optionen = {
      wurzel: path.join(FIXTUR, 'vorstufen'),
      eintrag: '../main.ts',
      stil: '../stil.css',
      mitVorstufen: true,
    };
    const erg = await baue(optionen(path.join(ablage, 'vorstufen.html'), vorstufen));
    assert.deepEqual(probe.aufrufe, ['inhalte pruefe=false', 'schriften ziel=undefined']);
    assert.deepEqual(erg.warnungen, ['inhalte: nur ein Hinweis']);

    probe.fehler = ['inhalte/a.md: Zitat weicht ab'];
    await assert.rejects(
      baue(optionen(path.join(ablage, 'vorstufen-rot.html'), vorstufen)),
      /inhalte meldet 1 Fehler:\s+inhalte\/a\.md: Zitat weicht ab/,
    );
    // Ohne werkzeuge/inhalte.mjs in der Wurzel gibt es keinen Bau.
    await assert.rejects(baue(optionen(path.join(ablage, 'ohne-inhalte.html'), { mitVorstufen: true })), /werkzeuge\/inhalte\.mjs fehlt/);
  });

  test('fehlende Einstiege sind klare Fehler', async () => {
    await assert.rejects(baue(optionen(path.join(ablage, 'x.html'), { eintrag: 'fehlt.ts' })), /Einstieg fehlt\.ts fehlt/);
    await assert.rejects(baue(optionen(path.join(ablage, 'y.html'), { stil: 'fehlt.css' })), /Stil-Einstieg fehlt\.css fehlt/);
  });
});

describe('bau: Bausteine', () => {
  test('ersetzeEinmal nimmt den Ersatz wörtlich ($& bleibt $&)', () => {
    assert.equal(ersetzeEinmal('a<!--x-->b', '<!--x-->', '$&$1'), 'a$&$1b');
    assert.throws(() => ersetzeEinmal('ab', '<!--x-->', ''), /fehlt/);
    assert.throws(() => ersetzeEinmal('<!--x--><!--x-->', '<!--x-->', ''), /2-mal/);
  });

  test('entschärftes Skript bleibt bedeutungsgleich', () => {
    const roh = "var a='</script>',b=\"<!--\",c=`</SCRIPT x`;\r\nvar d=a+b+c;";
    const sicher = entschaerfeSkript(roh);
    assert.ok(!/<\/script/i.test(sicher));
    assert.ok(!sicher.includes('<!--'));
    assert.ok(!sicher.includes('\r'));
    const kontext: { d?: string } = {};
    vm.runInNewContext(sicher, kontext);
    assert.equal(kontext.d, '</script><!--</SCRIPT x');
  });

  test('entschärfter Stil enthält kein </style mehr', () => {
    assert.equal(entschaerfeStil('a::after{content:"</STYLE>"}'), 'a::after{content:"<\\/STYLE>"}');
  });

  test('Anker-Text im eingesetzten Stil verwechselt nichts', () => {
    const huelle = `<head>${ANKER.csp}${ANKER.stil}</head><body>${ANKER.skript}</body>`;
    const { html } = setzeZusammen(huelle, `a::after{content:"${ANKER.skript}"}`, 'var x=1;');
    assert.equal(zaehle(html, /<script>/g), 1);
    assert.ok(html.endsWith('<script>var x=1;</script></body>'));
  });

  test('eigenes <script> oder unbekannter Anker in der Hülle ist ein Fehler', () => {
    const gut = `${ANKER.csp}${ANKER.stil}${ANKER.skript}`;
    assert.throws(() => setzeZusammen(`${gut}<script>1</script>`, '', ''), /eigenes <script>/);
    assert.throws(() => setzeZusammen(`${gut}<!--mvg:tippfehler-->`, '', ''), /Unbekannte Anker/);
  });

  test('die echte Hülle trägt jeden Anker genau einmal und die Pflicht-Metadaten', async () => {
    const huelle = await readFile(HUELLE, 'utf8');
    for (const anker of Object.values(ANKER)) {
      assert.equal(huelle.split(anker).length - 1, 1, `Anker ${anker}`);
    }
    assert.ok(huelle.startsWith('<!doctype html>'));
    assert.ok(huelle.includes('<html lang="de">'));
    assert.ok(huelle.includes('<meta charset="utf-8">'));
    assert.ok(huelle.includes('viewport-fit=cover'));
    assert.ok(huelle.includes('<title>MVG interaktiv – Minimum Viable Governance</title>'));
    assert.ok(/<meta name="description" content="[^"]+">/.test(huelle));
    assert.ok(/<noscript>[\s\S]+<\/noscript>/.test(huelle));
    // Die CSP steht direkt hinter charset, damit sie vor allem anderen gilt.
    assert.ok(huelle.indexOf(ANKER.csp) < huelle.indexOf('<title>'));
  });
});

test('Kundenfassung (P10.8, L-7): dist/mvg-kunde.html enthält kein Regie-Material, dist/mvg.html schon', async () => {
  const json = JSON.parse(await readFile(path.join(WURZEL, 'src', 'generiert', 'inhalte.json'), 'utf8')) as { regie: Record<string, { notiz: string | null; leitfragen: string[] }>; einwaende: { felder: { einwand?: string } }[] };
  const kunde = await readFile(path.join(WURZEL, 'dist', 'mvg-kunde.html'), 'utf8');
  const voll = await readFile(path.join(WURZEL, 'dist', 'mvg.html'), 'utf8');
  assert.ok(Buffer.byteLength(kunde, 'utf8') < BUDGET);
  // Proben: je Eintrag die Leitfragen und ein Stück der Notiz ohne Zeichen, die JSON/JS maskieren
  const proben: string[] = [];
  for (const e of Object.values(json.regie)) {
    proben.push(...e.leitfragen.filter((f) => !/["\\<>]/u.test(f)));
    const text = (e.notiz ?? '').replace(/<[^>]+>/gu, ' ').split(/["\\]/u).map((s) => s.trim()).find((s) => s.length >= 40);
    if (text !== undefined) proben.push(text.slice(0, 40));
  }
  // Nur Proben, die allein im Regie-Material stehen (manche Notiz zitiert das Whitepaper oder die Story)
  const oeffentlich = JSON.stringify({ ...json, regie: {} });
  proben.splice(0, proben.length, ...proben.filter((p) => !oeffentlich.includes(p)));
  assert.ok(proben.length > 100, `zu wenige Proben: ${proben.length}`);
  const inVoll = proben.filter((p) => voll.includes(p)).length;
  assert.ok(inVoll > proben.length * 0.9, `Gegenprobe: nur ${inVoll}/${proben.length} Proben in dist/mvg.html`);
  const inKunde = proben.filter((p) => kunde.includes(p));
  assert.deepEqual(inKunde, [], 'Regie-Material in der Kundenfassung');
  // Einwände sind öffentlich (L-54) und bleiben
  const einwand = json.einwaende[0]?.felder.einwand?.replace(/<[^>]+>/gu, '').trim() ?? '';
  assert.ok(einwand.length > 10 && kunde.includes(einwand));
});
