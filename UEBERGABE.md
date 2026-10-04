# Übergabe

Kopf ≤ 100 Zeilen. Oben JETZT (überschreiben), darunter FRÜHER (anhängen, knapp).

## JETZT

- **Block 2026-10-04 09:08 UTC: Owner arbeitete parallel in eigener Sitzung (O-60, O-61 auf `claude/haus`, nicht auf `main`). Kette war auf seinem Stand rot („Beginnen“ bei 1280×720 unter der Falz, 754 px); behoben mit L-271 (Startkopf 1,8 : 1), Kette grün. Merge nach `main` bewusst NICHT gemacht, solange der Owner auf dem Zweig arbeitet – der nächste Block mit leerem Plan und grüner Kette führt zusammen (O-49).** P19 (O-62) ist der Chat-Sitzung vorbehalten – Routine fasst ihn nicht an, solange er dort „in Arbeit“ steht. Nächster Schritt beim Owner: `dist/` hochladen (`docs/LAUNCH.md`), `docs/ABNAHME.md`/`docs/ABNAHME-MITTEL.md` abnehmen, ggf. neue Posten.
- **Offen zur Abnahme des Owners:** `docs/ABNAHME.md` und mittlere Befunde in `docs/ABNAHME-MITTEL.md`.
- **Lesezeit:** `node werkzeuge/lesezeit.mjs`; Kurzfassung 10,4 Minuten ohne Puffer („etwa 10“, O-51, L-252). Mutanten: `node werkzeuge/mutanten.mjs` (68/68), läuft nicht in der Kette – nach Kern-/Explore-Änderungen von Hand.
- Rechner: Node 22.22, Chromium unter `/opt/pw-browsers/chromium`, `npm ci` ≈ 50 s, Kette ≈ 120 s.

## FRÜHER
- 2026-10-04 (03:00–06:10 UTC): Planblatt leer, R79-Korrekturen (L-262–L-266) nach `main` (L-267), Block hingelegt.
- 2026-10-04 (bis ~02:30 UTC): zwei Sitzungen, P18 abgeschlossen, `main` = 6c273f1; R79-Korrekturen (L-262–L-266) nur auf `claude/haus`.
- 2026-10-03 (18:45–19:45 UTC): P17 abgeschlossen und nach `main` (O-58); P18.1–P18.5 (L-253–L-259).
- 2026-10-03 (ab 09:00 UTC): P17 Neugestaltung (O-51–O-58): Drehbuch, Story als Spiel, Themen als Buch, Explore-Kopf; Prüfrunden R72–R76 (L-225–L-252); Owner wählt vier neue Werkzeuge (O-59).
- 2026-10-02 (13:20–17:26 UTC): P16.15 Prüfrunden R67–R71 (L-205–L-223), Statusbedingungen der Story, Reservegrenze auf allen Wegen.
- 2026-10-02 (11:03–13:20 UTC): Neuausrichtung P16 (O-36 bis O-50): neuer Plan; Umschalten auf neue Story, Themen, Explore, Regie (L-184 bis L-191); Theorie an V2.4, Impressum, Datenschutz, Webseitenordner (L-192 bis L-195).
- 2026-10-02 (bis 09:09 UTC): alter Plan leer (R65, R66 ohne schweren Befund, L-181, L-182), CI 269 grün.
- 2026-09-30 (Cloud, ab 09:09 UTC): CI 204 rot gelesen, L-129; Runde 45 (L-130, L-132), Vorsorge L-131; CI 208 grün; Runde 46 (L-133), CI 209 rot → L-133, CI 210 grün; Runde 47 als Workflow (L-134–L-139).
- 2026-09-30 (Cloud, ab 06:20 UTC): R42-Rest (L-124), Runde 43 (L-125), Runde 44 (L-126, L-127); CI 199 grün.
- 2026-09-30 (Cloud, ab 03:08 UTC): R40-Rest (L-119), Runde 41 (L-120, L-121), Runde 42 Fachtreue (L-122), Stil teilweise (L-123); CI 189, 191, 192, 193 grün (bis L-121, PDF-Prüfung läuft unter Chrome 153).
- 2026-09-30 (Cloud, 00:08–02:00 UTC): Runden 37–39 (L-112–L-117), je mittlere Befunde (Simulator-Sonderfälle der Freigabe → Ursache in L-116 behoben; Druckwege Hilfe/Theorie im echten PDF); Runde 40 angestoßen, nicht ausgewertet. CI 177 grün gelesen; Runde 37 (L-112, L-113), Runde 38 (L-114, L-115), Runde 39 (L-116, L-117); CI 182 grün (L-113).
- 2026-09-29 (Cloud, 21:09–22:52 UTC): CI 171 grün gelesen; Runden 34 (L-109), 35 (L-110), 36 sauber (L-111); neue 320-px-Prüfung (`schmal`, `rollbarOhneTastatur`) in allen `pruefer`-Szenarien, Hilfe und Theorie. Block endete vor Runde 37 (Restzeit < 1 Runde).
- 2026-09-26: Acht Fragerunden mit dem Owner, drei Stilprototypen (A Bühne, B Leitstand, C Reportage), Owner wählt B. Analysen der Schwesterprojekte in `docs/recherche/`.
- 2026-09-26/27: P0 lokal gebaut mit parallelen Agenten (Whitepaper-Quelle, Marke/Stil, Bau/Kette, Engine/Inhalte/Kanal), Durchstich, vier Prüf-Agenten (Architektur, Fachtreue, Begriffe, Stil): 64 Befunde, 60 behoben, 3 als L-7…L-10 entschieden, 1 teilweise (L-8).
- 2026-09-27: Erster Cloud-Block: Zweig `claude/haus` angelegt, P0.8 abgehakt, Browser-Rückfall auf vorinstalliertes Chromium (L-15).
- 2026-09-27 (Cloud-Block 1, 07:47–09:42 UTC): P0.8, P1.1–P1.5; Kette 191–200 s mit Browser.
- 2026-09-28 (Cloud, bis 2026-09-28 07:31 UTC): P11.5/P11.6 Kürzung auf O-5 und Wissenschecks; P11.3 fünf Korrekturrunden (21/17/12/5/7 Befunde, zuletzt nur leichte); P11.4 Abschluss.
- 2026-09-29 (Cloud, 18:09–19:57 UTC): L-103 abgearbeitet (L-104 tote Rückbezüge + Erreichbarkeitstest, L-105), Runden 32 und 33 (L-106–L-108), allgemeine Überlaufprüfung. Zwei frühe Commits (6ecf2fc, 4566062) mit Autor „Claude“ statt L-6 – gepusht, nicht umgeschrieben.
- 2026-09-28 (Cloud, ab 07:31 UTC): Owner-Sichtung O-28–O-31 (P12 Story aus Bauherrensicht, Theorie neu, Hilfe P13); P12.5 Runden 1–11; ab 20:55 UTC O-32 Abbildungen (P14) mit Workflow (13 Autoren, unabhängige Prüfung, Nachbesserung, Feinschliff).
