# entwurf/ – Ort für Entwürfe

Hier liegen Inhalte, die noch nicht zum spielbaren Stand gehören. Der Ordner hat dieselbe Form wie `inhalte/`
(z. B. `entwurf/geschichte/k3-risiko.yaml`, `entwurf/theorie/k04-verantwortungsfelder.md`, `entwurf/abdeckung.yaml`).

`npm run entwurf` (`werkzeuge/entwurf.mjs`) kopiert `inhalte/` nach `tmp/entwurf-<pid>/`, legt jede Datei aus
`entwurf/` an ihren gleichnamigen Platz darüber (gleicher Pfad ersetzt, neuer Pfad ergänzt), wendet die
`ANPASSUNGEN` des Werkzeugs an und prüft das Ergebnis mit der vollen Inhaltsprüfung. `inhalte/` bleibt dabei
unverändert. Mit `--bau` entsteht zusätzlich die Vorschau `tmp/mvg-entwurf.html`.

Ist ein Entwurf fertig, wandern seine Dateien mit `git mv` nach `inhalte/`. Derzeit ist dieser Ordner leer bis auf
diese Datei, die das Werkzeug nicht überlagert.
