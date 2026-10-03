// Prüfrunde ohne Workflow (L-177): schreibt je Prüffeld einen Auftrag nach tmp/r<n>-auftraege/ –
// Aufruf: node werkzeuge/pruefrunde-auftraege.mjs <runde> <commit> "<schwerpunkt>" [feld,feld,…]
// Felder und gemeinsamer Text kommen aus docs/pruefrunde.workflow.js (eine Quelle für Workflow und Aufträge).
import fs from 'node:fs'
let src = fs.readFileSync('docs/pruefrunde.workflow.js','utf8')
src = src.replace(/^export const meta[\s\S]*?\n}\n/, '')
const cut = src.indexOf('const BEFUNDE_SCHEMA')
const body = src.slice(0, cut) + '\nreturn {GEMEINSAM, PRUEFFELDER}'
const [runde, commit, schwerpunkt, felder] = process.argv.slice(2)
if (!/^\d+$/.test(runde ?? '') || !commit) { console.error('Aufruf: node werkzeuge/pruefrunde-auftraege.mjs <runde> <commit> "<schwerpunkt>" [feld,feld,…]'); process.exit(2) }
const args = { wurzel: `/home/user/MVG/tmp/r${runde}`, commit, runde: Number(runde), schwerpunkt }
const {GEMEINSAM, PRUEFFELDER} = new Function('args', body)(args)
const wahl = felder ? felder.split(',').map((f) => f.trim()).filter(Boolean) : null
const unbekannt = wahl ? wahl.filter((k) => !PRUEFFELDER.some((f) => f.key === k)) : []
if (unbekannt.length) { console.error(`Unbekannte Prüffelder: ${unbekannt.join(', ')} (bekannt: ${PRUEFFELDER.map((f) => f.key).join(', ')})`); process.exit(2) }
const FELDER = wahl ? PRUEFFELDER.filter((f) => wahl.includes(f.key)) : PRUEFFELDER
fs.mkdirSync(`tmp/r${args.runde}-auftraege`, { recursive: true })
fs.mkdirSync(`tmp/r${args.runde}-ergebnisse`, { recursive: true })
for (const f of FELDER) fs.writeFileSync(`tmp/r${args.runde}-auftraege/${f.key}.txt`, `${GEMEINSAM}\n\nDEINE ROLLE: ${f.rolle}. DEIN PRÜFFELD („${f.key}“): ${f.auftrag}\n\nRÜCKGABE-FORM: Antworte am Ende mit einem JSON-Block {"befunde":[{"schwere","datei","ort","befund","beleg","vorschlag"}],"umfang":"..."} und schreibe denselben JSON-Block zusätzlich nach /home/user/MVG/tmp/r${args.runde}-ergebnisse/${f.key}.json.\n`)
console.log(FELDER.map(f=>f.key).join(' '))
