export const meta = {
  name: 'mvg-pruefrunde',
  description: 'MVG P12.5/P14.3 Prüfrunde: Finder je Prüffeld, adversariale Gegenprüfung je Befund, Lückenkritik',
  phases: [
    { title: 'Finden', detail: 'ein Prüf-Agent je Prüffeld (Fachtreue, Begriffe, Abbildungen, Hilfe, Stil, Druck, Architektur)' },
    { title: 'Gegenprüfen', detail: 'je Befund unabhängige Skeptiker (3 bei schwer/mittel, 1 bei leicht)' },
    { title: 'Lücken', detail: 'was diese Runde nicht abgedeckt hat' },
  ],
}

const W = args.wurzel
const RUNDE = args.runde
const SCHWERE = ['schwer', 'mittel', 'leicht']

const GEMEINSAM = `Du bist Prüf-Agent in Runde ${RUNDE} der Gesamtprüfung (Posten P12.5 und P14.3) des Projekts „Governance Kompass“ (O-33; interaktives MVG „Minimum Viable Governance“ von Bauherr Mentoren, Deutsch; früher „MVG interaktiv“).
ARBEITSORT: ausschließlich ${W} (git worktree auf Commit ${args.commit}, node_modules verlinkt, src/generiert erzeugt, dist/mvg.html gebaut). Dort NICHTS ändern, nichts committen, nichts pushen; Kurzlebiges nur nach ${W}/tmp/<dein-label>/. Kein \`npm run pruefe\` (die volle Kette). Einzelne Oberflächen-Szenarien: \`node werkzeuge/oberflaeche.mjs --szenario <name>\`.
BROWSER: Playwright aus ${W}/node_modules/playwright/index.mjs mit executablePath '/opt/pw-browsers/chromium' (Chromium 141, ohne deutsches Trennwörterbuch). Die CI läuft mit Chrome 153 (mit Wörterbuch) und setzt manche Schrift einige Prozent breiter: ein ungeteiltes Wort über 93 % seiner Zeilenbreite ist dort ein Bruchrisiko (L-129). Seite: file://${W}/dist/mvg.html. Die Maschine hat 4 Kerne, ein zweiter Agent kann parallel einen Browser fahren: halte Läufe schlank.
GRUNDLAGEN (lesen, soweit dein Prüffeld sie braucht): docs/PRUEFAGENTEN.md (deine Rolle), docs/BEGRIFFE.md, ENTSCHEIDE.md (O-Entscheide des Owners gehen allem vor; L-Entscheide dokumentieren bewusste Entscheidungen, u. a. L-64 Schleife, L-66 Anzeigefassung, L-69 Hilfe, L-77/L-80/L-82 Abbildungen, L-119–L-133 letzte Runden), docs/P12-BEFUNDE.md (Verlauf aller Runden – bereits behobene oder bewusst entschiedene Punkte nicht erneut melden, es sei denn, die Korrektur ist falsch oder unvollständig), docs/KORREKTURLISTE-COMPANION.md (bekannte, bewusst belassene Abweichungen der Hilfe), docs/STIL.md, docs/INHALTSFORMAT.md. Quelle der Wahrheit für Fachaussagen: quellen/whitepaper/v1.2/whitepaper.json (flach auch whitepaper.md) mit Absatz-IDs.
HALTUNG: Deine Pflicht ist zu WIDERLEGEN, nicht zu bestätigen. Jeder Befund braucht einen Beleg (Absatz-ID, Regel, oder gemessener Wert mit Messweg). Nichts behaupten, was du nicht gelesen oder gemessen hast.
SCHWERE (verbindlich, damit die Runde zählbar ist):
- schwer: falsche Fachaussage oder falsche Zuständigkeit/Schwelle gegenüber V1.2; sichtbarer verbotener Begriff (BEGRIFFE, G0–G5 statt LPH); Vertriebsaussage/erfundene Kennzahl über BM (O-1); Funktion kaputt; Barriere, die eine Aufgabe blockiert; Regie-Notiz auf der Leinwand.
- mittel: neue Fachaussage ohne Beleg (O-17) oder Widerspruch zwischen zwei Stellen; Zitat nicht wortgleich; sichtbarer Layoutfehler (Wort ohne Trennstrich gebrochen, Überlauf, abgeschnittener oder fast leerer Druck, Überschrift am Seitenende); WCAG-AA-Verstoß; ein Test/eine Probe prüft nicht, was sie behauptet (Mutation überlebt).
- leicht: Grammatik, Stil, missverständliche Formulierung ohne falsche Aussage, Vorsorge (Risiko ohne heutigen Fehler), Bedienhinweis außerhalb [[bedienung:…]].
SCHWERPUNKT DIESER RUNDE: ${args.schwerpunkt ?? 'keiner'}
RÜCKGABE: strukturiert. Je Befund: schwere, datei (Pfad relativ zum Repo), ort (Zeile, Knoten-ID, Selektor oder Seite), befund (was falsch ist, mit Messwert), beleg, vorschlag. Keine Befunde → leere Liste. Dazu \`umfang\`: 3–6 Sätze, was du tatsächlich gelesen/gemessen hast und was ohne Fund blieb.`

const PRUEFFELDER = [
  { key: 'fach-theorie-1', rolle: 'Fachtreue + Begriffe', auftrag: `Lernseiten inhalte/theorie/k01 bis k06 Satz für Satz, einschließlich Tafeln, Lernwerkzeugen (Sortierübungen, Umschalter, Etappen, Regler – jede Zuordnung gegen den Originaltext), Wissenscheck-Fragen und -Erklärungen, Querverweisen, Regie-Notizen und [[bedienung:…]]-Stellen (trägt der Satz ohne den Hinweis?). Alle Zitate ([[zitat:ID|…]] und Zitatblöcke) programmatisch auf Wortgleichheit prüfen (L-66 Anzeigefassung beachten).` },
  { key: 'fach-theorie-2', rolle: 'Fachtreue + Begriffe', auftrag: `Lernseiten inhalte/theorie/k07 bis k13 (inkl. Glossar k13 gegen das Glossar im Originaltext, wortgleich) Satz für Satz, einschließlich Tafeln, Lernwerkzeugen, Wissenschecks, Querverweisen, Regie-Notizen. Zitate programmatisch auf Wortgleichheit. Besonders: Leistungsarchitektur (k07) ohne Vertriebsaussage (O-1), Leistungsgrenzen, 30/60/90 nur als Orientierungsrahmen, Ergebnisobjekte (k09) nicht abschließend gezählt.` },
  { key: 'fach-story-a', rolle: 'Fachtreue + Begriffe + Dramaturgie', auftrag: `Story Welt A: inhalte/story/prolog, A1–A6, wendepunkt – je station.md und alle sechs Rollendateien (gf, bauherr, pl, ps, planung, controlling), Entscheidungen, Optionen, Rückmeldungen, Konsequenzen, Ebenen 1–4, Regie-Notizen. Abgleich mit inhalte/fall.md (Daten, Beträge, Wochentage, Personen, Kennungen ENT-/AEN-/RIS-…). Prüfe Zuständigkeiten nach der Mandatsleiter (k4.2-p3) und nicht delegierbare Verantwortung (k3.2-t1), Statusnamen, LPH-Stände.` },
  { key: 'fach-story-b', rolle: 'Fachtreue + Begriffe + Dramaturgie', auftrag: `Story Welt B und Schluss: inhalte/story/rueckspulen, B1–B6, wirklichkeit, ende-steuerbar, ende-auflagen, ende-neufestlegung, epilog – je station.md und alle Rollendateien. Abgleich mit inhalte/fall.md und mit den gespiegelten A-Stationen (A n ↔ B n: dieselbe Lage, andere Führung – keine Widersprüche in Fakten). Kennungen: Entscheidungs-IDs nur für Entscheidungen, AEN- für Änderungen (L-125, L-130). Dazu die Texte der Explore-Werkzeuge (src/ui/woerter.ts Explore/Simulator/Sandbox/Zeitmaschine/Galerie, inhalte/welten*, src/ui/flaechen/simulator.ts und sandbox.ts – die Regeln des Simulators gegen V1.2).` },
  { key: 'abbildungen', rolle: 'Fachtreue/Begriffe je Bild (P14.3)', auftrag: `Alle 13 Abbildungen inhalte/abbildungen/abb-2 … abb-14: je Bild die .webp ansehen (mit dem Read-Werkzeug; falls es webp nicht zeigt, mit Playwright als PNG rendern nach ${W}/tmp/abbildungen/), die Beschreibung abb-N.yaml (Titel, Alternativtext, Beschreibung, Abweichungen) und die Stellen, an denen sie eingebunden sind (::: abbildung in inhalte/theorie, Originaltext). Prüfe: jede im Bild überdeckte Beschriftung trägt den Begriff des Texts (BEGRIFFE, O-14 – keine G0–G5, kein „Gate“ usw. sichtbar im Bild); jede inhaltliche Abweichung zwischen Bild und Text ist in „Abweichungen“ genannt (L-80, L-82) und richtig beschrieben; Alternativtext beschreibt das Bild sachlich ohne neue Fachaussage; Bildunterschrift „Wo sie vom Text abweicht, gilt der Text“; die Abbildung steht beim passenden Abschnitt; werkzeuge/abbildungen.mjs deterministisch (zweimal ausführen in ${W}/tmp/abbildungen/ mit Zielverzeichnis dort, falls das Werkzeug das erlaubt – sonst nur lesen und begründen).` },
  { key: 'hilfe-begriffe', rolle: 'Hilfe (Fachtreue, Begriffe, O-1) + Begriffe gesamt', auftrag: `(1) Die Hilfe: src/generiert/hilfe.json (erzeugt von werkzeuge/hilfe.mjs aus quellen/hilfe/…) – sie beschreibt die Anwendung MVG Companion; bekannte, bewusst belassene Abweichungen stehen in docs/KORREKTURLISTE-COMPANION.md. Suche gezielt: Zuständigkeiten (Freigabe beim Bauherrn, Lenkungskreis berät, Eskalation entlang der Mandatsleiter), Schwellen (bis einschließlich 5 Mio. €), Kennzahlen/Wirkungsversprechen ohne Beleg, Vertrieb/Selbstdarstellung BM (O-1), englische Fachwörter und verbotene Begriffe im Fließtext (Feldnamen in <code> sind erlaubt), Bedienhinweise, die in der Hilfe ins Leere zeigen. Lies mindestens die Seiten Handbuch, Kollaboration, Vorgehensmodell, FAQ & Glossar, Registerdokument-Katalog vollständig. (2) Begriffe gesamt: im gebauten dist/mvg.html alle sichtbaren Texte, aria-label, alt, title, Tooltips und SVG-Texte programmatisch gegen docs/BEGRIFFE.md prüfen (auch „Minimal“ statt „Minimum“, „Whitepaper“ sichtbar nach O-29, „Gate“, „G0“–„G5“), und \`node werkzeuge/begriffe.mjs\` lesend ausführen.` },
  { key: 'stil-bildschirm', rolle: 'Stil und Barrierefreiheit (Bildschirm)', auftrag: `Browser bei 1280×720, 1024×768, 400×800 und 320×640: Start, Story (mindestens eine Rolle über alle Stationen bis zum Epilog – Stand per localStorage setzen wie in tests/oberflaeche/enden.szenario.mjs standVor – und stichprobenhaft eine zweite Rolle), Theorie (alle 13 Lernseiten mit geöffneten Lernwerkzeugen), Explore (alle Werkzeuge, Abbildungsverzeichnis, Vergrößern-Dialog einer Abbildung mit Tastatur und Escape), Hilfe (Übersicht und drei Seiten), Regie/Leinwand. Messen: axe (serious/critical), waagerechter Überlauf, abgeschnittener Text, Wörter ohne Trennstrich gebrochen außerhalb hyphens:auto sowie ungeteilte Wörter über 93 % ihrer Zeilenbreite, Fokus sichtbar und Reihenfolge, Zielgrößen ≥ 24 px, Kontrast ≥ 4,5:1, prefers-reduced-motion, Statusfarben nie allein. Die Regeln aus L-132/L-133 (Anzeigezahl mit Container-Einheit, Instrument-Label < 360 px, Ablesung auto-fit, Schrittknöpfe-Raster < 380 px) an den Grenzen gegenprüfen.` },
  { key: 'druck', rolle: 'Stil (Druck)', auftrag: `Alle Druckwege als echtes PDF (window.print umbiegen, Knopf klicken, emulateMedia print, page.pdf; Auswertung mit tests/oberflaeche/pdf.mjs: pdfSeiten, seitenMitUeberschriftAmEnde, wortbrueche, fuellung): „Alle 13 Kapitel drucken“, jedes Kapitel einzeln (Kapitel drucken), Strg+P ohne Knopf, Hilfe (jede der 24 Seiten), Dossier im Epilog für zwei Enden. Messen: Überschrift/Label am Seitenende, leere oder fast leere Seiten (< 35 %, außer der letzten und vor einem erzwungenen Kapitelumbruch), abgeschnittene Tabellen/Grafiken, Wörter ohne Trennstrich gebrochen (Drucklayout 794/688 px), knappe ungeteilte Wörter > 93 %, Bedienhinweise im Druck, Kopf/„fachlich ungeprüft“ vorhanden, Abbildungen vollständig und nicht zerrissen, kein U+00AD im PDF-Text.` },
  { key: 'architektur', rolle: 'Architektur und Code', auftrag: `Gegen docs/ARCHITEKTUR.md: Engine (src/engine) rein und deterministisch (keine Uhr, kein Zufall, kein DOM), keine Regie-Daten auf der Leinwand (Bauart), CSP ohne Lockerung (script-src nur Hash, connect-src 'none'), keine Laufzeit-Bibliotheken, keine externen URLs im Bau, Einzeldatei < 4 MB und deterministisch, Kundenfassung ohne Regie-Material (L-7). Tests prüfen Verhalten: führe mindestens 6 Mutationsproben an Stellen durch, die in den letzten Runden geändert wurden (src/ui/druck.ts mitTrennstellen/Selektoren, src/ui/bausteine/bloecke.ts tabellenstand, werkzeuge/hilfe.mjs ERSETZUNGEN und ROI-Entfernung, src/stil/leitstand.css Regeln < 360/380 px, tests/oberflaeche/enden.szenario.mjs Dossier-Probe, src/engine eine Bedingung) – jeweils: Mutation → betroffene Tests/Szenarien → rot? Für Mutationen lege dir EINE eigene Kopie an: \`git -C ${W} worktree add /home/user/MVG/tmp/r${RUNDE}-mut HEAD\`, dort \`ln -s /home/user/MVG/node_modules node_modules\`, \`node werkzeuge/inhalte.mjs --pruefe\`, \`node werkzeuge/hilfe.mjs\`; baue Mutanten mit \`node werkzeuge/bau.mjs --ziel tmp/m1.html\` und prüfe mit \`--datei\`; am Ende \`git -C ${W} worktree remove --force /home/user/MVG/tmp/r${RUNDE}-mut\`. Eine überlebende Mutation mit echter Wirkung ist ein Befund (mittel).` },
]

const BEFUNDE_SCHEMA = {
  type: 'object',
  properties: {
    befunde: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          schwere: { type: 'string', enum: SCHWERE },
          datei: { type: 'string' },
          ort: { type: 'string' },
          befund: { type: 'string' },
          beleg: { type: 'string' },
          vorschlag: { type: 'string' },
        },
        required: ['schwere', 'datei', 'ort', 'befund', 'beleg', 'vorschlag'],
      },
    },
    umfang: { type: 'string' },
  },
  required: ['befunde', 'umfang'],
}

const URTEIL_SCHEMA = {
  type: 'object',
  properties: {
    echt: { type: 'boolean' },
    schwere: { type: 'string', enum: ['schwer', 'mittel', 'leicht', 'keiner'] },
    begruendung: { type: 'string' },
    vorschlag: { type: 'string' },
  },
  required: ['echt', 'schwere', 'begruendung', 'vorschlag'],
}

const LINSEN = [
  'Linse QUELLE/MESSUNG: Lies die genannte Stelle selbst und die Belegstelle im Originaltext (bzw. miss selbst nach). Stimmt der behauptete Sachverhalt überhaupt? Wenn du ihn nicht reproduzieren kannst oder der Originaltext die Aussage doch trägt: echt=false.',
  'Linse ENTSCHEIDUNGSLAGE: Ist der Punkt durch einen O-Entscheid, einen L-Entscheid, die Korrekturliste der Hilfe (docs/KORREKTURLISTE-COMPANION.md), die Anzeigefassung (L-66) oder einen früheren Rundenbeschluss (docs/P12-BEFUNDE.md) bewusst so entschieden? Dann echt=false – außer die Umsetzung verfehlt die Entscheidung selbst.',
  'Linse SCHWERE: Unterstelle, der Sachverhalt stimmt. Ist die gemeldete Schwere nach der verbindlichen Skala gerechtfertigt, oder ist es in Wahrheit leichter (z. B. Formulierung statt falscher Aussage, Vorsorge statt heutigem Fehler)? Prüfe die Stelle selbst und setze die Schwere, die du belegen kannst; ist nichts falsch, echt=false und schwere=keiner.',
]

function pruefePrompt(f, feld, linse) {
  return `${GEMEINSAM}

DEINE AUFGABE HIER IST EINE ANDERE: Du bist SKEPTIKER. Ein Prüf-Agent (Prüffeld „${feld.key}“, Rolle ${feld.rolle}) hat folgenden Befund gemeldet. Versuche ihn zu WIDERLEGEN. Im Zweifel – nicht belegbar, nicht reproduzierbar – echt=false.
${linse}

BEFUND (gemeldete Schwere: ${f.schwere})
Datei: ${f.datei}
Ort: ${f.ort}
Befund: ${f.befund}
Beleg: ${f.beleg}
Vorschlag: ${f.vorschlag}

Rückgabe: echt (Sachverhalt stimmt und ist ein Mangel), schwere (nach der Skala oben, oder „keiner“), begruendung (was du gelesen/gemessen hast, 2–5 Sätze), vorschlag (die beste Korrektur, konkret: Datei, alter → neuer Text bzw. Regel; bei Fachtexten nur Formulierungen, die sich auf einen Absatz zurückführen lassen).`
}

const RANG = { schwer: 3, mittel: 2, leicht: 1, keiner: 0 }
const NAME = ['keiner', 'leicht', 'mittel', 'schwer']

// R50 (L-154): Teilrunden (args.felder) und Gegenprüfung beim Einarbeiten statt durch Skeptiker (args.ohneGegenpruefung) –
// die Skeptiker standen hinter den Findern in der Warteschlange (2 Plätze bei 4 Kernen) und liefen erst nach dem Einarbeiten
const FELDER = Array.isArray(args.felder) ? PRUEFFELDER.filter((f) => args.felder.includes(f.key)) : PRUEFFELDER
if (Array.isArray(args.felder)) log(`Teilrunde: ${FELDER.map((f) => f.key).join(', ')} (ausgelassen: ${PRUEFFELDER.filter((f) => !FELDER.includes(f)).map((f) => f.key).join(', ')})`)

const ergebnisse = await pipeline(
  FELDER,
  (feld) => agent(`${GEMEINSAM}

DEINE ROLLE: ${feld.rolle}. DEIN PRÜFFELD („${feld.key}“): ${feld.auftrag}`, { label: `finden:${feld.key}`, phase: 'Finden', schema: BEFUNDE_SCHEMA }),
  async (res, feld) => {
    if (!res) return { feld: feld.key, fehlt: true, umfang: 'Agent ausgefallen', befunde: [] }
    if (args.ohneGegenpruefung) return { feld: feld.key, umfang: res.umfang, befunde: res.befunde.map((f) => ({ ...f, feld: feld.key, echt: true, schwereGeprueft: f.schwere, stimmen: 'beim Einarbeiten', urteile: [] })) }
    const geprueft = await parallel(res.befunde.map((f, i) => async () => {
      // leichte Befunde zählen für L-64 nicht – sie werden beim Einarbeiten geprüft (4 Kerne: Rechenzeit für die mittleren)
      if (f.schwere === 'leicht' && args.leichtOhnePruefung) return { ...f, feld: feld.key, echt: true, schwereGeprueft: 'leicht', stimmen: 'ungeprüft', urteile: [] }
      const linsen = f.schwere === 'leicht' ? [LINSEN[0]] : LINSEN
      const urteile = (await parallel(linsen.map((l, j) => () =>
        agent(pruefePrompt(f, feld, l), { label: `pruefen:${feld.key}#${i + 1}.${j + 1}`, phase: 'Gegenprüfen', schema: URTEIL_SCHEMA })))).filter(Boolean)
      const ja = urteile.filter((u) => u.echt)
      const echt = f.schwere === 'leicht' ? ja.length >= 1 : ja.length >= 2
      // Schwere: Median der bestätigenden Urteile, nie über der gemeldeten
      const raenge = ja.map((u) => RANG[u.schwere]).sort((a, b) => a - b)
      const median = raenge.length ? raenge[Math.floor((raenge.length - 1) / 2)] : 0
      const schwere = echt ? NAME[Math.max(1, Math.min(median, RANG[f.schwere]))] : 'verworfen'
      return { ...f, feld: feld.key, echt, schwereGeprueft: schwere, stimmen: `${ja.length}/${urteile.length}`, urteile }
    }))
    return { feld: feld.key, umfang: res.umfang, befunde: geprueft.filter(Boolean) }
  },
)

const alle = ergebnisse.filter(Boolean)
const bestaetigt = alle.flatMap((e) => e.befunde.filter((b) => b.echt))
const verworfen = alle.flatMap((e) => e.befunde.filter((b) => !b.echt))
const zaehl = (s) => bestaetigt.filter((b) => b.schwereGeprueft === s).length
log(`Runde ${RUNDE}: bestätigt ${bestaetigt.length} (schwer ${zaehl('schwer')}, mittel ${zaehl('mittel')}, leicht ${zaehl('leicht')}), verworfen ${verworfen.length}`)
for (const e of alle) if (e.fehlt) log(`Prüffeld ${e.feld}: Agent ausgefallen – Runde unvollständig`)

phase('Lücken')
const luecken = args.luecken === false ? 'ausgelassen (Teilrunde)' : await agent(`${GEMEINSAM}

DEINE AUFGABE: Lückenkritik. Unten stehen die Umfangsberichte aller Prüf-Agenten dieser Runde. Nenne, was im Produkt (Start, Story je Rolle, Theorie, Explore, Hilfe, Regie/Leinwand, Druck, Kundenfassung, Abbildungen, Tests) in dieser Runde NICHT oder nur oberflächlich geprüft wurde und in der nächsten Runde Vorrang haben sollte. Sieh dazu selbst in die Verzeichnisse. Nur Lücken, keine Befunde. Höchstens 10 Punkte, je ein Satz.

${alle.map((e) => `[${e.feld}] ${e.umfang}`).join('\n')}`, { label: 'luecken', phase: 'Lücken' })

return {
  runde: RUNDE,
  zaehlung: { schwer: zaehl('schwer'), mittel: zaehl('mittel'), leicht: zaehl('leicht'), verworfen: verworfen.length },
  bestaetigt: bestaetigt.map(({ urteile, ...b }) => ({ ...b, begruendungen: urteile.map((u) => `${u.echt ? 'JA' : 'NEIN'} ${u.schwere}: ${u.begruendung} | Vorschlag: ${u.vorschlag}`) })),
  verworfen: verworfen.map(({ urteile, ...b }) => ({ feld: b.feld, schwere: b.schwere, datei: b.datei, ort: b.ort, befund: b.befund, stimmen: b.stimmen, gruende: urteile.map((u) => u.begruendung) })),
  umfang: alle.map((e) => ({ feld: e.feld, umfang: e.umfang })),
  luecken,
}
