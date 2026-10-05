# Governance Kompass

Eine Internetseite von **Bauherr Mentoren** zu „Minimum Viable Governance“ für komplexe Bau- und Infrastrukturprojekte, ausgerichtet am Standard „Aufgaben- und Risikomanagement V2.4“ (www.GovernanceKompass.de).

- **Geschichte** (intern Story): ein Spiel aus Sicht der Projektleitung des Bauherrn am fiktiven Schulcampus Lindenhall-Süd – fünf Figuren, acht Kapitel mit je drei Antworten, Balken Geld · Zeit · Vertrauen, vier Mini-Aufgaben, gewichteter Vergleich in Kapitel 7, Bilanz am Ende; etwa 25 Minuten, als Kurzfassung etwa 10.
- **Themen** (intern Theorie): ein Buch in vier Teilen, Kapitel 1–15 mit Grafiken, Karten zum Umdrehen und Übungen, Glossar als Anhang 16, mit Fortschritt.
- **Werkzeuge** (intern Explore): neun Werkzeuge – MCDA-Rechner (gewichteter Vergleich), Vorlagen-Check, Risikomatrix, Risiko-Bewerter, Vorgangsarten, Vorgangs-Wegweiser, Takt, Monatsbericht, Glossar.
- **Präsentieren:** Regie und Leinwand für Kundentermine.

Ausgeliefert wird der Webseitenordner `dist/` (Hauptseite, Impressum, Datenschutz, robots, sitemap, Vorschaubild, `.htaccess`); nichts wird von Dritten nachgeladen. Upload: `docs/LAUNCH.md`, Bedienung: `docs/ANLEITUNGEN.md`.

## Entwickeln
```bash
npm ci
npm run bau        # dist/ erzeugen
npm run pruefe     # vollständige Prüfkette
npm run vorschau   # lokale Vorschau auf http://127.0.0.1:8301
```
Regeln und Plan: `CLAUDE.md`, `PLAN.md`, `ENTSCHEIDE.md`, `docs/`.

Fall fiktiv.
