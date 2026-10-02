# entwurf/ – Ort für Entwürfe

Hier liegen Inhalte, die noch nicht zum spielbaren Stand gehören. Der Ordner hat dieselbe Form wie `inhalte/`
(z. B. `entwurf/story/A7/station.md`, `entwurf/abdeckung.yaml`).

`npm run entwurf` (`werkzeuge/entwurf.mjs`) kopiert `inhalte/` nach `tmp/entwurf-<pid>/`, legt jede Datei aus
`entwurf/` an ihren gleichnamigen Platz darüber (gleicher Pfad ersetzt, neuer Pfad ergänzt), wendet die
`ANPASSUNGEN` des Werkzeugs an und prüft das Ergebnis mit der vollen Inhaltsprüfung. `inhalte/` bleibt dabei
unverändert. Mit `--bau` entsteht zusätzlich die Vorschau `tmp/mvg-entwurf.html`.

Ist ein Entwurf fertig, wandern seine Dateien mit `git mv` nach `inhalte/`. Seit P5.10 (L-45) liegt der ganze
Entscheidungsgraph in `inhalte/`; dieser Ordner ist leer bis auf diese Datei, die das Werkzeug nicht überlagert.
