# Launch auf IONOS (O-47)

Der Governance Kompass ist eine Internetseite. Ausgeliefert wird der fertige Ordner `dist/` – er enthält alles, nichts wird von anderen Servern nachgeladen.

## Was im Ordner liegt

| Datei | Zweck |
|---|---|
| `index.html` | die Seite selbst (Start, Story, Theorie, Explore, Präsentieren); Schriften, Bilder und Skript sind eingebettet |
| `impressum.html` | Impressum (Bauherr Mentoren GmbH i. G., vertreten durch Martin Mohr) |
| `datenschutz.html` | Datenschutzerklärung für eine Seite zum Lesen (keine Cookies, kein Tracking, keine Dritten) |
| `robots.txt` | erlaubt Suchmaschinen alles und nennt die Sitemap |
| `sitemap.xml` | die drei Adressen der Seite |
| `vorschau.png` | Vorschaubild (1200 × 630) für geteilte Links |
| `.htaccess` | Regeln für den IONOS-Webserver: immer `https://www.governancekompass.de`, Sicherheitsköpfe, keine Verzeichnisliste |

Der Ordner entsteht mit `npm run bau` und wird mit jedem Commit eingecheckt; `npm run pruefe` prüft, dass er aktuell und deterministisch ist.

## Vor dem Launch prüfen (Owner)

1. **Impressum und Datenschutz lesen** (`dist/impressum.html`, `dist/datenschutz.html`, Quellen in `inhalte/rechtliches/`). Die Angaben stammen von bauherr-mentoren.com (abgerufen am 2026-10-02) und sind auf diese Seite zugeschnitten. Prüfen: Anschrift, vertretungsberechtigte Person, Handelsregister und USt-IdNr. („werden nach Eintragung bzw. Erteilung ergänzt“), Auftragsverarbeitungsvertrag mit IONOS vorhanden.
2. **Fachliche Abnahme** nach `docs/ABNAHME.md` (Theorie, Story, Werkzeuge, Abbildungen).
3. **Domain:** www.GovernanceKompass.de ist bei IONOS registriert; ein SSL-Zertifikat für `governancekompass.de` und `www.governancekompass.de` muss im IONOS-Kundenbereich aktiv sein (bei IONOS-Webhosting meist enthalten).

## Hochladen (IONOS Webspace)

1. Im IONOS-Kundenbereich unter **Hosting → Webspace** einen Ordner anlegen, z. B. `governancekompass`.
2. Unter **Domains & SSL** die Domain `www.governancekompass.de` (und `governancekompass.de`) mit diesem Ordner verbinden („Ziel: Webspace, Verzeichnis /governancekompass“).
3. Den **Inhalt** von `dist/` in diesen Ordner hochladen – per **SFTP** (Zugangsdaten unter Hosting → SFTP & SSH) oder mit dem **Webspace-Explorer** im Browser. Wichtig: auch die versteckte Datei `.htaccess` hochladen (im SFTP-Programm „versteckte Dateien anzeigen“ einschalten).
4. Im Browser `https://www.governancekompass.de/` öffnen.

## Nach dem Upload prüfen

- [ ] `http://governancekompass.de` leitet auf `https://www.governancekompass.de/` weiter.
- [ ] Startseite lädt, die drei Wege öffnen Story, Theorie und Explore.
- [ ] Impressum und Datenschutz sind im Fuß jeder Seite erreichbar.
- [ ] `https://www.governancekompass.de/robots.txt` und `/sitemap.xml` sind abrufbar.
- [ ] Ein geteilter Link (z. B. in einer E-Mail- oder Chat-Vorschau) zeigt Titel, Beschreibung und Vorschaubild.
- [ ] Im Browser-Werkzeug „Netzwerk“: alle Anfragen gehen nur an www.governancekompass.de.
- [ ] Optional: die Seite in der Google Search Console anmelden und die Sitemap einreichen.

## Wenn die `.htaccess` Probleme macht

Zeigt der Server „Interner Fehler (500)“, unterstützt der Webspace eine Regel nicht. Dann die `.htaccess` umbenennen (z. B. `htaccess-aus.txt`), die Seite prüfen und die Weiterleitung auf HTTPS stattdessen im IONOS-Kundenbereich einschalten (**Domains & SSL → HTTPS-Weiterleitung**).

## Aktualisieren

Neuer Stand: `npm run bau` (läuft auch in `npm run pruefe`), dann den Inhalt von `dist/` erneut hochladen und vorhandene Dateien überschreiben. Durch die kurze Zwischenspeicherung (eine Stunde für Seiten) ist der neue Stand spätestens nach einer Stunde überall sichtbar.
