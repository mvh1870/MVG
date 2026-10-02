export const meta = {
  name: 'mvg-pruefrunde',
  description: 'MVG P16.15 Prüfrunde: Finder je Prüffeld, adversariale Gegenprüfung je Befund, Lückenkritik',
  phases: [
    { title: 'Finden', detail: 'ein Prüf-Agent je Prüffeld (Theorie, Story, Explore/Begriffe, Abbildungen, Stil, Druck, Architektur, Vollständigkeit)' },
    { title: 'Gegenprüfen', detail: 'je Befund unabhängige Skeptiker (3 bei schwer/mittel, 1 bei leicht)' },
    { title: 'Lücken', detail: 'was diese Runde nicht abgedeckt hat' },
  ],
}

const W = args.wurzel
const RUNDE = args.runde
const SCHWERE = ['schwer', 'mittel', 'leicht']

const GEMEINSAM = `Du bist Prüf-Agent in Runde ${RUNDE} der Prüfung der Neuausrichtung (Posten P16.15, O-35, O-48) des Projekts „Governance Kompass“ – eine Internetseite von Bauherr Mentoren zu „Minimum Viable Governance“ (Deutsch): Start, Story (eine Geschichte aus Sicht der Bauherren-PL, acht Stationen, Vorlagen mit gewichtetem Vergleich), Theorie als Themen, Explore (Werkzeuge), Regie und Leinwand, Impressum, Datenschutz.
ARBEITSORT: ausschließlich ${W} (git worktree auf Commit ${args.commit}, node_modules verlinkt, src/generiert erzeugt, dist/ gebaut). Dort NICHTS ändern, nichts committen, nichts pushen; Kurzlebiges nur nach ${W}/tmp/<dein-label>/. Kein \`npm run pruefe\` (die volle Kette). Einzelne Oberflächen-Szenarien: \`node werkzeuge/oberflaeche.mjs --szenario <name>\` (start, story, theorie, explore, regie).
BROWSER: Playwright aus ${W}/node_modules/playwright/index.mjs mit executablePath '/opt/pw-browsers/chromium'. Seite: file://${W}/dist/index.html (Routen #story, #theorie/<thema>, #explore/<werkzeug>, #regie, #leinwand). Halte Läufe schlank, ein zweiter Agent fährt evtl. parallel einen Browser.
GRUNDLAGEN (lesen, soweit dein Prüffeld sie braucht): docs/PRUEFAGENTEN.md (deine Rolle), docs/BEGRIFFE.md, ENTSCHEIDE.md (O-Entscheide gehen allem vor, besonders O-36 bis O-50; L-Entscheide dokumentieren bewusste Entscheidungen, u. a. L-184 bis L-200), docs/STIL.md, docs/INHALTSFORMAT.md, docs/DREHBUCH.md, inhalte/fall.md. Quellen der Wahrheit für Fachaussagen: der Standard V2.4 (quellen/v2.4/) und V1.2 (quellen/whitepaper/v1.2/whitepaper.json mit Absatz-IDs); bei Widerspruch gilt V2.4.
HALTUNG: Deine Pflicht ist zu WIDERLEGEN, nicht zu bestätigen. Jeder Befund braucht einen Beleg (Absatz-ID, Stelle in V2.4, Regel oder gemessener Wert mit Messweg). Nichts behaupten, was du nicht gelesen oder gemessen hast.
SCHWERE (verbindlich, damit die Runde zählbar ist):
- schwer: falsche Fachaussage oder falsche Zuständigkeit/Schwelle gegenüber V2.4/V1.2; sichtbarer verbotener Begriff (BEGRIFFE, G0–G5 statt LPH) oder sichtbarer Bezug auf Whitepaper/Kapitel/Absatz-IDs (O-38); sichtbar „Datei“, „App“, „Programm“, „HTML“, „Kundenfassung“ (O-42); Vertriebsaussage/erfundene Kennzahl über BM (O-1); Rechenfehler, der auf einem Weg der Story sichtbar ist (Status ≠ Bericht); Funktion kaputt; Barriere, die eine Aufgabe blockiert; Regie-Notiz auf der Leinwand; Nachladen von Dritten.
- mittel: neue Fachaussage ohne Beleg oder Widerspruch zwischen zwei Stellen; Zitat nicht wortgleich; sichtbarer Layoutfehler (Wort ohne Trennstrich gebrochen, Überlauf, abgeschnittener Druck); WCAG-AA-Verstoß; ein Test/eine Probe prüft nicht, was sie behauptet (Mutation überlebt).
- leicht: Grammatik, Stil, missverständliche Formulierung ohne falsche Aussage, Vorsorge.
SCHWERPUNKT DIESER RUNDE: ${args.schwerpunkt ?? 'keiner'}
RÜCKGABE: strukturiert. Je Befund: schwere, datei (Pfad relativ zum Repo), ort (Zeile, Knoten-ID, Selektor oder Route), befund (was falsch ist, mit Messwert), beleg, vorschlag. Keine Befunde → leere Liste. Dazu \`umfang\`: 3–6 Sätze, was du tatsächlich gelesen/gemessen hast und was ohne Fund blieb.`

const PRUEFFELDER = [
  { key: 'fach-theorie-1', rolle: 'Fachtreue + Begriffe', auftrag: `Themen mit reihe 1 bis 8 (inhalte/theorie/*.md, Kopf „reihe“) Satz für Satz, einschließlich Tafeln, Lernwerkzeugen (jede Zuordnung gegen die Quellen), Wissenschecks, Regie-Notizen und [[bedienung:…]]-Stellen. Zitate programmatisch auf Wortgleichheit prüfen. Besonders: Zuständigkeiten nach V2.4 (die Projektsteuerung pflegt alle Vorgänge, der Bauherr entscheidet, Lenkungskreis berät), Mandatsleiter, LPH 0–9.` },
  { key: 'fach-theorie-2', rolle: 'Fachtreue + Begriffe', auftrag: `Themen mit reihe 9 bis 16, besonders die drei nach V2.4 (Entscheidungsvorlage mit gewichtetem Vergleich, Vorgangsarten und Risikobewertung 5×5, Takt und Monatsbericht), dazu das Glossar (inhalte/glossar.yaml mit Belegen) und der Begriffs-Kompass (inhalte/begriffs-kompass.md). Jede Regel gegen quellen/v2.4/ (Handbuch, Teilleistungsbild, Vertragsanlage Teil A); nichts, was nur in internen V2.4-Dokumenten (Formulierungsdokumentation, Vertragsformulierungen Teil B) steht.` },
  { key: 'fach-story', rolle: 'Fachtreue + Begriffe + Dramaturgie + Rechnung', auftrag: `Story inhalte/geschichte/rahmen.yaml und s1–s8 (Lage, Bericht, Vorlage, Optionen, Folgen, Kästen „So läuft es oft“ und „Typischer Einwand“, Regie). Abgleich mit inhalte/fall.md und docs/DREHBUCH.md (Daten, Beträge, Wochentage, Personen, Kennungen). Rechne mit der Logik aus src/geschichte/engine.ts (lage-folgen und Optionsfolgen werden addiert) Kosten, Puffer und offene Entscheidungen auf dem empfohlenen Weg, in der Kurzfassung und auf mindestens vier abweichenden Wegen nach; jeder Bericht- und Lagetext muss auf jedem Weg stimmen (Bedingungen \`wenn\`). MCDA-Summen und jede Aussage über Gewichte nachrechnen. Lesezeit (200 Wörter/Min.): Hauptweg ≈ 25 Min., Kurzfassung ≈ 10 Min.` },
  { key: 'explore-begriffe', rolle: 'Fachtreue (Explore) + Begriffe gesamt', auftrag: `(1) Explore: inhalte/werkzeuge.yaml und src/ui/flaechen/explore.ts (gewichteter Vergleich, Risikomatrix mit Stufen und Sonderregel, Vorgangsarten und Wege, Takt) gegen V2.4. (2) Begriffe gesamt: im gebauten dist/index.html, dist/impressum.html und dist/datenschutz.html alle sichtbaren Texte, aria-label, alt, title, Tooltips und SVG-Texte über alle Routen programmatisch gegen docs/BEGRIFFE.md und die sichtbar verbotenen Wörter (werkzeuge/sichtbar.mjs) prüfen; \`node werkzeuge/begriffe.mjs\` lesend ausführen. (3) Impressum/Datenschutz gegen O-43 (Bauherr Mentoren GmbH i. G., Martin Mohr, nur kontakt@bauherr-mentoren.com, keine Telefonnummer) und die Wirklichkeit der Seite (keine Cookies, kein Tracking, lokale Speicherung).` },
  { key: 'abbildungen', rolle: 'Fachtreue/Begriffe je Bild', auftrag: `Alle 13 Abbildungen inhalte/abbildungen/abb-*.yaml mit ihrem Bild (.webp ansehen; falls nötig mit Playwright als PNG rendern nach ${W}/tmp/abbildungen/) und den Stellen, an denen sie eingebunden sind (::: abbildung in inhalte/theorie). Prüfe: überdeckte Beschriftungen tragen den Begriff des Texts (keine G0–G5, kein „Gate“), Abweichungen zwischen Bild und Text genannt, Alternativtext sachlich, Abbildung beim passenden Abschnitt, kein sichtbarer Bezug auf Whitepaper/Kapitel.` },
  { key: 'stil-bildschirm', rolle: 'Stil und Barrierefreiheit (Bildschirm)', auftrag: `Browser bei 1280×720, 1024×768, 400×800 und 320×640: Start, Story (empfohlener Weg bis zum Ende, Kurzfassung, Gewichte verschieben, Gegenprobe), Theorie (alle Themen mit geöffneten Lernwerkzeugen), Explore (alle Werkzeuge), Regie/Leinwand, Impressum, Datenschutz. Messen: axe (serious/critical), waagerechter Überlauf, abgeschnittener Text, Wörter ohne Trennstrich gebrochen, Fokus sichtbar und Reihenfolge, Zielgrößen ≥ 24 px, Kontrast ≥ 4,5:1 (auch über den Bauplan-Hintergründen), prefers-reduced-motion, Statusfarben nie allein.` },
  { key: 'druck', rolle: 'Stil (Druck)', auftrag: `Alle Druckwege, die die Seite anbietet (Thema drucken, Strg+P auf Start, Story-Schritt, Thema, Werkzeug; Impressum/Datenschutz), als echtes PDF (emulateMedia print, page.pdf; Auswertung mit tests/oberflaeche/pdf.mjs: seitenMitUeberschriftAmEnde, wortbrueche, fuellung). Messen: Überschrift am Seitenende, leere Seiten, abgeschnittene Tabellen/Grafiken, Wortbrüche ohne Trennstrich, Bedienhinweise im Druck, Hintergründe nicht störend, kein U+00AD im PDF-Text.` },
  { key: 'architektur', rolle: 'Architektur und Code', auftrag: `Gegen docs/ARCHITEKTUR.md: Story-Engine (src/geschichte) rein und deterministisch (keine Uhr, kein Zufall, kein DOM), keine Regie-Daten auf der Leinwand (Bauart, regieGeschichte nur in der Regie), CSP ohne Lockerung, keine Laufzeit-Bibliotheken, keine externen URLs im Bau außer den leisen Links auf bauherr-mentoren.com, Webseitenordner dist/ deterministisch und vollständig (index, impressum, datenschutz, robots, sitemap, .htaccess, vorschau.png). Tests prüfen Verhalten: mindestens 6 Mutationsproben an src/geschichte/engine.ts, mcda.ts, src/ui/flaechen/geschichte.ts, explore.ts, src/regie/leinwand.ts, werkzeuge/geschichte.mjs – jeweils Mutation → betroffene Tests/Szenarien → rot? Für Mutationen eine eigene Kopie: \`git -C ${W} worktree add /home/user/MVG/tmp/r${RUNDE}-mut HEAD\`, dort \`ln -s /home/user/MVG/node_modules node_modules\`; am Ende wieder entfernen. Eine überlebende Mutation mit echter Wirkung ist ein Befund (mittel).` },
  { key: 'vollstaendigkeit', rolle: 'Vollständigkeit + Bauherr als Leser', auftrag: `Vergleiche den Stand mit PLAN.md (Phase P16, Abnahmen), den Owner-Entscheiden O-36 bis O-50 und docs/ABNAHME.md: Was fehlt oder ist nur behauptet? Lies dazu die Story im Browser als Bauherren-PL ohne Vorwissen (empfohlener Weg und Kurzfassung): Sind die Entscheidungen echt, die Übergänge klar, die Verweise auf Themen richtig? Sind die sechs leisen Links zu bauherr-mentoren.com vorhanden und sachlich (O-44)? Ist das Beispielprojekt überall der Schulcampus Lindenhall-Süd (O-50)?` },
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
  'Linse ENTSCHEIDUNGSLAGE: Ist der Punkt durch einen O-Entscheid, einen L-Entscheid oder einen früheren Rundenbeschluss (docs/ABNAHME-MITTEL.md, UEBERGABE.md) bewusst so entschieden? Dann echt=false – außer die Umsetzung verfehlt die Entscheidung selbst.',
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

DEINE AUFGABE: Lückenkritik. Unten stehen die Umfangsberichte aller Prüf-Agenten dieser Runde. Nenne, was im Produkt (Start, Story je Weg, Theorie, Explore, Regie/Leinwand, Druck, Impressum/Datenschutz, Abbildungen, Tests) in dieser Runde NICHT oder nur oberflächlich geprüft wurde und in der nächsten Runde Vorrang haben sollte. Sieh dazu selbst in die Verzeichnisse. Nur Lücken, keine Befunde. Höchstens 10 Punkte, je ein Satz.

${alle.map((e) => `[${e.feld}] ${e.umfang}`).join('\n')}`, { label: 'luecken', phase: 'Lücken' })

return {
  runde: RUNDE,
  zaehlung: { schwer: zaehl('schwer'), mittel: zaehl('mittel'), leicht: zaehl('leicht'), verworfen: verworfen.length },
  bestaetigt: bestaetigt.map(({ urteile, ...b }) => ({ ...b, begruendungen: urteile.map((u) => `${u.echt ? 'JA' : 'NEIN'} ${u.schwere}: ${u.begruendung} | Vorschlag: ${u.vorschlag}`) })),
  verworfen: verworfen.map(({ urteile, ...b }) => ({ feld: b.feld, schwere: b.schwere, datei: b.datei, ort: b.ort, befund: b.befund, stimmen: b.stimmen, gruende: urteile.map((u) => u.begruendung) })),
  umfang: alle.map((e) => ({ feld: e.feld, umfang: e.umfang })),
  luecken,
}
