# Launch auf IONOS (O-47)

Der Governance Kompass ist eine Internetseite. Ausgeliefert wird der fertige Ordner `dist/` – er enthält alles, nichts wird von anderen Servern nachgeladen.

## Was im Ordner liegt

| Datei | Zweck |
|---|---|
| `index.html` | die Seite selbst (Start, Geschichte mit 14 Stationen in drei Akten, Themen (16 Stück), Werkzeuge (neun), Präsentieren); Schriften, Bilder und Skript sind eingebettet |
| `impressum.html` | Impressum (Bauherr Mentoren GmbH i. G., vertreten durch Martin Mohr) |
| `datenschutz.html` | Datenschutzerklärung für eine Seite zum Lesen (keine Cookies, kein Tracking, keine Dritten) |
| `robots.txt` | erlaubt Suchmaschinen alles und nennt die Sitemap |
| `sitemap.xml` | die drei Adressen der Seite |
| `vorschau.png` | Vorschaubild (1200 × 630) für geteilte Links |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Symbol für Browser-Tab, Lesezeichen und Startbildschirm (weiße Bildmarke auf Navy) |
| `.htaccess` | Regeln für den IONOS-Webserver: immer `https://www.governancekompass.de`, Sicherheitsköpfe, keine Verzeichnisliste |

**Umfang (Stand P19.9):** Geschichte: ganzer Weg etwa 40 Minuten (gemessen 8.002 Wörter ≈ 40,0 Minuten), Kurzfassung etwa 10 Minuten (2.099 Wörter ≈ 10,5 Minuten, an der Grenze), 14 Stationen in drei Akten mit zwei Pausen, elf Mini-Aufgaben, Entscheidungsbuch und Verlauf; Themen: 16 Themen in vier Teilen; Werkzeuge: neun Werkzeuge. `index.html` wiegt rund 2,4 MB (Budget 4 MB).

**Fertiges Paket:** Der Ordner `webseite/` (Inhalt von `dist/` plus `LIES-MICH.txt` und `ABNAHME-CHECKLISTE.txt`) wird zu `governancekompass-komplettpaket.zip` gepackt (liegt in `tmp/`, wird nicht eingecheckt; Inhalt per sha256 gegen `dist/` geprüft). Das ZIP enthält genau die zehn Dateien der Tabelle oben, auch `.htaccess`. Im Browser des Besuchers liegt nur der Fortschritt (Datenschutz, Abschnitt 5), auf dem Server nichts außer diesen Dateien.

Der Ordner entsteht mit `npm run bau` und wird mit jedem Commit eingecheckt; `npm run pruefe` prüft, dass er aktuell und deterministisch ist.

## Vor dem Launch prüfen (Owner)

Stand 2026-10-05: Der Owner hat im Chat alle drei Punkte als erledigt gemeldet; die Häkchen geben seine Meldung wieder, der Lauf hat nichts davon geprüft. Die Platzhalter im Impressum (Handelsregister, USt-IdNr.) sind unverändert im Text.

1. [x] **Impressum und Datenschutz lesen** (`dist/impressum.html`, `dist/datenschutz.html`, Quellen in `inhalte/rechtliches/`). Die Angaben stammen von bauherr-mentoren.com (abgerufen am 2026-10-02) und sind auf diese Seite zugeschnitten. Prüfen: Anschrift, vertretungsberechtigte Person, Handelsregister und USt-IdNr. („werden nach Eintragung bzw. Erteilung ergänzt“), Auftragsverarbeitungsvertrag mit IONOS vorhanden. *(vom Owner im Chat am 2026-10-05 als erledigt gemeldet, nicht vom Lauf geprüft)*
2. [x] **Fachliche Abnahme** nach `docs/ABNAHME.md` (Themen, Geschichte, Werkzeuge, Abbildungen). *(vom Owner im Chat am 2026-10-05 als erledigt gemeldet, nicht vom Lauf geprüft)*
3. [x] **Domain:** www.GovernanceKompass.de ist bei IONOS registriert; ein SSL-Zertifikat für `governancekompass.de` und `www.governancekompass.de` muss im IONOS-Kundenbereich aktiv sein (bei IONOS-Webhosting meist enthalten). *(vom Owner im Chat am 2026-10-05 als erledigt gemeldet, nicht vom Lauf geprüft)*

## Hochladen (IONOS Webspace)

1. Im IONOS-Kundenbereich unter **Hosting → Webspace** einen Ordner anlegen, z. B. `governancekompass`.
2. Unter **Domains & SSL** die Domain `www.governancekompass.de` (und `governancekompass.de`) mit diesem Ordner verbinden („Ziel: Webspace, Verzeichnis /governancekompass“).
3. Den **Inhalt** von `dist/` in diesen Ordner hochladen – per **SFTP** (Zugangsdaten unter Hosting → SFTP & SSH) oder mit dem **Webspace-Explorer** im Browser. Wichtig: auch die versteckte Datei `.htaccess` hochladen (im SFTP-Programm „versteckte Dateien anzeigen“ einschalten).
4. Im Browser `https://www.governancekompass.de/` öffnen.

## Nach dem Upload prüfen

- [ ] `http://governancekompass.de` leitet auf `https://www.governancekompass.de/` weiter.
- [ ] Startseite lädt, die drei Wege öffnen Geschichte, Themen und Werkzeuge; die Kopfleiste nennt sie ebenso.
- [ ] Geschichte: der Auftakt zeigt zwei Wegkarten („Vierzehn Entscheidungen · etwa 40 Minuten“ und „Vier Entscheidungen · etwa 10 Minuten“), nach Station 5 und nach Station 10 kommt eine Pause, ab Station 1 gibt es das Symbol für das Entscheidungsbuch, und „Gespeicherten Fortschritt löschen“ am Fuß setzt alles zurück.
- [ ] Impressum und Datenschutz sind im Fuß jeder Seite erreichbar.
- [ ] `https://www.governancekompass.de/robots.txt` und `/sitemap.xml` sind abrufbar.
- [ ] Ein geteilter Link (z. B. in einer E-Mail- oder Chat-Vorschau) zeigt Titel, Beschreibung und Vorschaubild.
- [ ] Im Browser-Werkzeug „Netzwerk“: alle Anfragen gehen nur an www.governancekompass.de.
- [ ] Optional: die Seite in der Google Search Console anmelden und die Sitemap einreichen.

## Wenn die `.htaccess` Probleme macht

Zeigt der Server „Interner Fehler (500)“, unterstützt der Webspace eine Regel nicht. Dann die `.htaccess` umbenennen (z. B. `htaccess-aus.txt`), die Seite prüfen und die Weiterleitung auf HTTPS stattdessen im IONOS-Kundenbereich einschalten (**Domains & SSL → HTTPS-Weiterleitung**).

## Aktualisieren

Neuer Stand: `npm run bau` (läuft auch in `npm run pruefe`), dann den Inhalt von `dist/` erneut hochladen und vorhandene Dateien überschreiben. Durch die kurze Zwischenspeicherung (eine Stunde für Seiten) ist der neue Stand spätestens nach einer Stunde überall sichtbar.
