// Prüfrunde ohne Workflow (L-177): schreibt je Prüffeld einen Auftrag nach tmp/r<n>-auftraege/ – Aufruf: node werkzeuge/pruefrunde-auftraege.mjs <runde> <commit> "<schwerpunkt>"
import fs from 'node:fs'
let src = fs.readFileSync('docs/pruefrunde.workflow.js','utf8')
src = src.replace(/^export const meta[\s\S]*?\n}\n/, '')
const cut = src.indexOf('const BEFUNDE_SCHEMA')
const body = src.slice(0, cut) + '\nreturn {GEMEINSAM, PRUEFFELDER}'
const [runde, commit, schwerpunkt] = process.argv.slice(2)
const args = { wurzel: `/home/user/MVG/tmp/r${runde}`, commit, runde: Number(runde), schwerpunkt }
const {GEMEINSAM, PRUEFFELDER} = new Function('args', body)(args)
for (const f of PRUEFFELDER) fs.writeFileSync(`tmp/r${args.runde}-auftraege/${f.key}.txt`, `${GEMEINSAM}\n\nDEINE ROLLE: ${f.rolle}. DEIN PRÜFFELD („${f.key}“): ${f.auftrag}\n\nRÜCKGABE-FORM: Antworte am Ende mit einem JSON-Block {"befunde":[{"schwere","datei","ort","befund","beleg","vorschlag"}],"umfang":"..."} und schreibe denselben JSON-Block zusätzlich nach /home/user/MVG/tmp/r${args.runde}-ergebnisse/${f.key}.json.\n`)
console.log(PRUEFFELDER.map(f=>f.key).join(' '))
