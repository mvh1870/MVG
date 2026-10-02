# Governance Kompass

Eine Internetseite von **Bauherr Mentoren** zu „Minimum Viable Governance“ für komplexe Bau- und Infrastrukturprojekte, ausgerichtet am Standard „Aufgaben- und Risikomanagement V2.4“ (www.GovernanceKompass.de).

- **Story:** eine Geschichte aus Sicht der Bauherren-PL am fiktiven Schulcampus Lindenhall-Süd – acht Stationen, Vorlagen mit gewichtetem Vergleich, etwa 25 Minuten, als Kurzfassung etwa 10.
- **Theorie:** die Inhalte als 16 Themen mit Grafiken, Übungen und Glossar.
- **Explore:** gewichteter Vergleich, Risikomatrix, Vorgangsarten, Takt und Monatsbericht, Glossar.
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
