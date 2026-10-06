# Governance Kompass – technischer Änderungsbericht zur Auditbereinigung

Stand: 2026-10-06 · Zweig `claude/fervent-einstein-vwnjpv` · Entscheide: `ENTSCHEIDE.md` O-64, L-425, L-426, L-427
Impressum und Datenschutz sind nicht Gegenstand dieses Berichts (Auftrag). Einzige Berührung: der Satz zu den eingebetteten Schriften im Impressum (O-64 Punkt 2, Owner-Freigabe).

## Auslieferung

| Datei | Zweck |
|---|---|
| `dist/` | Webseitenordner für den Upload (Hauptseite, Rechtsseiten, Icons, robots, sitemap, `.htaccess`) |
| `release/Governance-Kompass.html` | Einzeldatei: dieselbe Hauptseite, gleiches Skript, gleiche CSP, ohne Verweise auf Ordner-Dateien |
| `release/SHA256SUMS.txt` | Prüfsummen aller Auslieferungsdateien; prüfen mit `cd release && sha256sum -c SHA256SUMS.txt` |
| `docs/audit/Governance-Kompass_Komponenten.json` | Komponentenregister (erzeugt mit `node werkzeuge/register.mjs`) |
| `docs/audit/Governance-Kompass_Assets.json` | Assetregister (ebenso) |

Die SHA-256-Werte des finalen Stands stehen in `release/SHA256SUMS.txt` (bei jedem `npm run bau` neu erzeugt, von `npm run bau:pruefe` gegengeprüft) und im Abschnitt „Prüfsummen“ unten.

## 1. IBM Plex entfernt

- **Ausgangsbefund:** IBM Plex Sans und IBM Plex Mono (latin, latin-ext; 12 Schnitte) waren als woff2 eingebettet; Status des Reserved Font Name bei den Untermengen ungeklärt.
- **Änderung:** Pakete `@fontsource/ibm-plex-sans` und `@fontsource/ibm-plex-mono` aus `package.json`/Lockfile entfernt; `werkzeuge/schriften.mjs` bettet nur noch Big Shoulders Display (800) und Barlow Condensed (500/600/700) ein. `--schrift-text` = `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`, `--schrift-mono` = `ui-monospace, "Cascadia Mono", "Segoe UI Mono", Consolas, "Liberation Mono", monospace`. Keine Ersatzschrift eingebettet. Die 13 Abbildungen wurden mit Barlow Condensed neu gerendert (vorher trugen ihre Überdeckungen in Plex gerenderte Pixel). Größen, Laufweiten und Zeilenhöhen blieben; einzige nötige Anpassung: Untertitel der Werkzeugkacheln brechen lange Wörter (`overflow-wrap: anywhere`), weil „Entscheidungsvorlage“ bei 1280 px 2 px über die Kachel ragte.
- **Betroffen:** `werkzeuge/schriften.mjs`, `werkzeuge/abbildungen.mjs`, `inhalte/abbildungen/*.webp|yaml`, `src/stil/tokens.css`, `src/stil/explore.css`, `docs/STIL.md`, `docs/INHALTSFORMAT.md`, Impressum (Schriftsatz).
- **Test:** `tests/bau.test.ts` (kein „Plex“ in `dist/*.html` und der Einzeldatei), `tests/stil-tokens.test.ts`, `tests/stil-werkzeuge.test.ts`; 20 Browserläufe (Umbrüche, Kacheln, Knöpfe, Navigation, Tabellen, Druck, Regie, Leinwand, 400/1024/1280 px, 320 px in den Szenarien) grün. Ausgelieferte Größe 2,43 MB → 2,15 MB.
- **Offen:** Systemschriften unterscheiden sich je Betriebssystem (Windows Segoe UI, macOS San Francisco, Linux je nach Installation). Gemessen wurde unter Linux/Chromium (Inter). Eine Sichtprüfung auf Windows und macOS steht aus.

## 2. Drittanbieter & Lizenzen

- **Ausgangsbefund:** Lizenzangaben nur als CSS-Kommentar und als Satz im Impressum; kein Lizenztext, keine Copyright-Zeilen.
- **Änderung:** Ansicht `#lizenzen` (Link „Drittanbieter & Lizenzen“ im Fuß jeder Seite) mit Name, Version (Schrift- und Paketversion), Copyright, Lizenz, Herkunft, Bezug und dem vollständigen, unveränderten Text der SIL Open Font License 1.1; druckbar. Die Copyright-Zeilen stammen aus der name-Tabelle der ausgelieferten woff2-Schnitte (`werkzeuge/woff2-name.mjs`, ohne neue Abhängigkeit), der Lizenztext wortgleich aus der LICENSE-Datei der Pakete. Der Bau bricht ab, wenn Copyright oder Lizenztext zwischen Schnitten oder Paketen abweichen.
  - Big Shoulders Display · Version 2.002 · Paket `@fontsource/big-shoulders-display` 5.3.0 · „Copyright 2019 The Big Shoulders Project Authors (https://github.com/xotypeco/big_shoulders)“ · OFL-1.1
  - Barlow Condensed · Version 1.408 · Paket `@fontsource/barlow-condensed` 5.3.0 · „Copyright 2017 The Barlow Project Authors (https://github.com/jpt/barlow)“ · OFL-1.1
  - Abschnitt „Nutzung der Inhalte“: interne Schulung und Präsentation in der eigenen Organisation erlaubt (O-64 Punkt 3).
- **Betroffen:** `src/ui/flaechen/lizenzen.ts`, `src/ui/route.ts`, `src/ui/bausteine/seite.ts`, `src/main.ts`, `src/ui/woerter.ts`, `src/stil/rahmen.css`, `werkzeuge/schriften.mjs`, `werkzeuge/inhalte.mjs`.
- **Test:** `tests/lizenzen.test.ts` (Copyright gleich der Schrift, OFL wortgleich und vollständig, Route, Fußlink, sichtbar ohne verbotene Wörter); Browser offline: Ansicht mit 2 Einträgen und 4.127 Zeichen Lizenztext.
- **Offen:** Wortlaut „Nutzung der Inhalte“ rechtlich prüfen lassen (O-64). Hinweis: Das Fontsource-Paket von Big Shoulders nennt in seiner LICENSE-Datei als Copyright nur „Google Inc.“; maßgeblich angezeigt ist die Zeile aus der Schrift selbst.

## 3. Build- und Fremdcode-Provenienz

- **Ausgangsbefund:** minifiziertes Inline-Bündel ohne nachvollziehbare Abhängigkeiten.
- **Änderung:** Das Quellprojekt ist vollständig vorhanden. `werkzeuge/register.mjs` erzeugt das Komponentenregister aus `package.json`, `package-lock.json` und den esbuild-Metadaten (Eingaben von Skript- und Stil-Bündel). Ergebnis: 208 npm-Pakete (Bau, Test, Werkzeuge), davon gelangen nur die beiden Schriftpakete in die Auslieferung; das Skript-Bündel enthält ausschließlich eigenen Code aus `src/` (keine npm-Eingabe, keine Laufzeitbibliothek). Das Register bricht ab, sobald Code aus `node_modules` ins Skript gelangt. Nicht verwendete Abhängigkeiten im Produktionsbuild: keine (es gibt keinen Laufzeit-Abhängigkeitsbaum); IBM-Plex-Pakete entfernt.
- **Offen:** Im Lockfile ohne Lizenzangabe: `dom-walk`, `exif-parser` (beide nur Bauzeit, transitiv). `potrace` (GPL-2.0) dient nur zur einmaligen Vektorisierung des Logos (`werkzeuge/logo.mjs`); ausgeliefert wird nur sein Ergebnis, nicht das Programm – die rechtliche Einordnung des Ergebnisses als Werk von Bauherr Mentoren sollte bestätigt werden. `jszip` ist „MIT OR GPL-3.0-or-later“ (nur Bauzeit).

## 4. Rechteprovenienz der Bilder

- **Änderung:** Assetregister mit 36 Einträgen (13 Abbildungen, Logo und Bildmarke, Favicons, Vorschaubild, 9 Quelldateien der im Code gezeichneten Grafiken und Symbole, 8 Schriftschnitte), je ID, Typ, Quelle, SHA-256, Verwendung, Herkunft, Rechtebasis und Status. Rechtebasis der BM-Bilder: Owner-Bestätigung vom 2026-10-06 (O-64 Punkt 5) → Status „BM-eigen“; Schriften „belegt lizenziert“. Ein fremdes Icon-Set ist nicht eingebunden.
- **Offen:** Die Bestätigung „BM-eigen“ beruht auf der Aussage des Owners, nicht auf einer Rechtekette im Repo (etwa für Bilder in der Whitepaper-DOCX, die mit einem Bildwerkzeug erstellt worden sein könnten). Nachweis zur Schließung: Erklärung, wer die Ursprungsbilder der DOCX V1.2 und das Original-Logo erstellt hat und unter welchen Bedingungen.

## 5. Lokale Icon-Dateien

- **Änderung:** Der Webseitenordner behält `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` (liegen neben der Seite). Die Einzeldatei verweist nur auf das eingebettete SVG-Favicon (data-URL); Impressum und Datenschutz führen dort über `<meta name="mvg-rechtsseiten">` zur veröffentlichten Seite (nur https-Adressen, sonst relativ).
- **Test:** `tests/bau.test.ts` (kein relativer `src`/`href` in der Einzeldatei, gleiches Skript); Browser offline (Chromium, Netz gesperrt): 0 Anfragen außer `file:`/`data:`, keine Konsolenfehler.

## 6. Regie-Notizen und lokale Speicherung

- **Änderung:** Hinweis in der Karte „Gesprächsprotokoll“: „Lokale Notizen: Die Notizen werden nur in diesem Browserprofil gespeichert und nicht übertragen. Die Speicherung ist nicht verschlüsselt. Tragen Sie hier keine vertraulichen oder personenbezogenen Informationen ein.“ Der Knopf „Protokoll und gespeicherten Stand löschen“ (Name bleibt, O-64) öffnet eine Rückfrage in der Karte („Ja, löschen“ / „Abbrechen“, Fokus auf „Abbrechen“); erst „Ja, löschen“ entfernt `gk.regie` und `mvg.kanal.regie` und aktualisiert die Liste sofort, mit Statusmeldung. Keine automatische Löschung. Alt-Schlüssel: Die Seite war nie veröffentlicht; frühere Arbeitsschlüssel (L-12) sind nie ausgeliefert worden.
- **Test:** `tests/ui-bauart.test.ts` (Hinweis mit vier Aussagen, Abbrechen löscht nichts, Ja löscht beide Schlüssel); Browser: Notiz speichern, neu laden (bleibt), löschen per Tastatur (Liste leer, `gk.regie` null).
- **Offen:** Solange die Präsentation offen ist, schreibt sie nach der nächsten Änderung wieder den Bühnenstand (ohne Notizen) und die Leinwand ihr Lebenszeichen – gewollt und im Datenschutz beschrieben.

## 7. Zentraler HTML-Parser

- **Ausgangsbefund:** `vonHtml()` (`src/ui/h.ts`) setzt `template.innerHTML`.
- **Klassifizierung aller Aufrufe:** (1) Bauzeit-Inhalt aus `inhalte.json` (`src/ui/bausteine/inhalt.ts`); (2) intern erzeugtes SVG (`src/stil/symbole.ts`, `src/grafik/*`, Logo); (3) benutzerbeeinflusst nur als Zahl (Risiko-Bewerter, Monatsbericht: geparste Zahlen an `src/grafik/werkzeug-bilder.ts`, Text dort maskiert). Benutzertext (Freitext, Titel, Notizen) erreicht den Parser nie; er läuft als Textknoten. URL- oder Importinhalte gibt es nicht.
- **Änderung:** Vertrauensgrenze im Kopfkommentar von `src/ui/h.ts` festgehalten; zusätzlich räumt `vonHtml()` jedes Fragment nach einer Positivliste auf (`bereinige`: keine Skript-/Einbettungselemente, keine `on…`-Attribute, nur Adressen `#`, `https:`, `mailto:`, `data:image/…` oder relativ). Für die heutigen Inhalte ändert sich nichts (Test über alle HTML-Stücke).
- **Test:** `tests/sicherheit-html.test.ts`: `<img src=x onerror=alert(1)>`, `<script>alert(1)</script>`, `<a href="javascript:alert(1)">`, `<svg onload=alert(1)>`, Attribut-Ausbruch, iframe – in jedem Text- und Zahlfeld aller Werkzeuge (über 100 Felder, mit Druckbogen) und im Gesprächsprotokoll (Liste, Druck, Neuladen): nichts wird ausführbar.

## 8. Regie/Leinwand-Kanal

- **Änderung:** Im Code (`src/regie/kanal.ts`) und in `docs/ARCHITEKTUR.md` festgehalten: Kanalname und Schlüssel dienen nur der technischen Zuordnung, sind keine kryptografische Authentisierung; BroadcastChannel und localStorage sind keine Berechtigungsgrenze; gehostet auf eigenem, vertrauenswürdigem Ursprung betreiben. Die Oberfläche verspricht keinen geschützten Kanal (geprüft); daher kein zusätzlicher Warnhinweis.

## 9. Content Security Policy

- **Änderung:** Der Bau berechnet den SHA-256 des ausgelieferten Inline-Skripts bei jedem Lauf (`werkzeuge/bau.mjs`). `img-src` ohne `blob:` (nirgends genutzt). Final: `default-src 'none'; script-src 'sha256-…'; style-src 'unsafe-inline'; img-src 'self' data:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'`. Kein `unsafe-inline` für Skripte, keine Wildcards. `style-src 'unsafe-inline'` bleibt nötig (eingebetteter Stil und `style`-Attribute der Grafiken).
- **Test:** Hash nachgerechnet und gleich; Seite läuft im Browser ohne CSP-Verstoß (keine Konsolenmeldung).

## 10. Externe Ressourcen

Keine CDN-Skripte, keine externen Schriften, keine Telemetrie, keine Analyse, keine APIs, keine nachgeladenen Icons, keine Update-Abrufe. Externe Adressen stehen nur als Links (bauherr-mentoren.com, ionos.de, lda.bayern.de) und in Metadaten der veröffentlichten Seite (canonical, og:image) – sie werden beim lokalen Betrieb nicht geladen.

## 11. Statische Abschlussprüfung (dist/*.html, Einzeldatei)

- Ressourcen: alle `src`/`href` sind `data:`, `#`, `https:`, `mailto:` oder Ordner-Nachbarn (nur im Webseitenordner); keine CSS-`url()` außer `data:`; data-URLs: 13 × `image/webp`, 8 × `font/woff2`, 1 × `image/svg+xml`.
- Netzwerk: kein `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, dynamisches `import(`.
- Codeausführung: kein `eval(`, `new Function`, String-`setTimeout`; ein `innerHTML` (die Vertrauensgrenze aus Punkt 7).
- Geheimnisse: keine Treffer für API-Schlüssel, Tokens, Passwörter, private Schlüssel, Authentifizierungsköpfe. (Ein erster Lauf meldete scheinbare AWS-Schlüssel – Fehlalarm des Musters ohne Groß-/Kleinschreibung in Base64-Bilddaten; mit korrektem Muster 0 Treffer.)
- Kein „Plex“ in der Auslieferung.

## 12. Funktionale Regression

Prüfkette `npm run pruefe` grün: Inhalte, Typen, alle Unit-Tests (darunter neu `lizenzen`, `sicherheit-html`, `druck-herkunft`), Begriffe, Bau zweimal byte-gleich inklusive Einzeldatei und Prüfsummen, 20 Browserläufe (Start, Geschichte, Themen, Werkzeuge, Rechtsseiten, Regie mit Leinwand-Synchronisation, axe-Prüfungen, Tastatur, Druck als PDF mit Seitenzahl, 400/1024/1280 px). Dazu offline im Browser: Start, Geschichte, Themen, Werkzeuge, Lizenzen, Präsentieren in Einzeldatei und Ordner; Notizen speichern/neu laden/löschen.

## Inhaltliche Änderungen aus O-64 (zur Einordnung)

Companion als angekündigtes, optionales Arbeitsmittel (ohne Kosten, Termin, Download), vereinbarte Leistungen bleiben Leistungen, Mentor-Zugriff gestrichen, Markenregel angepasst; Druckbögen der Werkzeuge nennen Herkunft (Beispiel / verändertes Beispiel / eigene Angaben) und Aussagegrenze, eigener Freitext nie im Fenstertitel; Vorlagen-Check und Monatsbericht erklären ihre Ampel als formale Prüfung; Risiko-Druck nennt Beispiel- oder eigene Grenzen; Geschichte ordnet Balken und Bilanz als Lernmodell ein; Fiktiv-Vermerk nennt Zahlen und Ereignisse; Methodenstandard einmal eingeordnet; Wirkungssätze als Ziel; Werkzeugfelder ohne Formularverlauf.

## Prüf-Agenten (O-24)

- Begriffe: 9 Befunde, 8 behoben, 1 als Rechtsprüfpunkt vermerkt (Impressum „ohne schriftliche Zustimmung“ neben der Nutzungsfreigabe im Lizenzbereich; Impressum außerhalb des Auftrags).
- Fachtreue: 10 Befunde. Nach Owner-Auswahl umgesetzt: Mentor-Sonderrolle gestrichen, Station 10 (Bauleiter sperrt selbst, Projektleitung des Bauherrn bestärkt), Wegweiser-Zusatz „Schon eingetreten?“ bei Maßnahme. Geschäftsrahmen des Briefings in O-64 (13) belegt; übrige Befunde behoben. Nachprüfung der Korrekturen: siehe L-427 und Übergabe.

## Prüfsummen (release/SHA256SUMS.txt)

```
ef61fa5de605eeb9c17cf84228be14278e3b4518dc9eeed682c2843a0d18e5c9  ../dist/.htaccess
dc33ecf6ae7cf4db9c219d0251af9d9d7b2f4ac78dad3cb06d11c48e18d93db3  ../dist/apple-touch-icon.png
21b0dfebbe1f17d67cc8a6ba6702164693c3eb64344138a761f03f8a6c55173a  ../dist/datenschutz.html
e7bd44eebc9f409af9b4131ef76cf2d46d9844791e808f0342022d69e9b2b225  ../dist/favicon.ico
c31c18d6ac6754d2fe649bafba8d9244d8a2bf97242f3da2714f1fb209a5eee9  ../dist/favicon.svg
034eb60944d9a423c8682f44b8637f4e37eb234d99529cbf28ba174b3750b4f4  ../dist/impressum.html
6a0b917e9d4244c75942cad437dd4510e0106d4cd0a2c4920748f8c448fc6066  ../dist/index.html
eac685901e06b12a31cac85e33941d0bce7e055aa488da72bcf18a564d984b1d  ../dist/robots.txt
4ab251b420c5012b6f6cb7a0e458b0df5019261e62bb6fc6bb7f85b5a201b77a  ../dist/sitemap.xml
85486995f09a5495997c4cc8c636ad279c6f4e0fe79f4509ec5c1a35a52ff684  ../dist/vorschau.png
42cfe479c77b4452c29abfbd6e9b39fb8b513228a8258bba4ce34f28b3adb3bb  ../release/Governance-Kompass.html
```

Die Werte ändern sich mit jedem Bau; maßgeblich ist die Datei `release/SHA256SUMS.txt` des jeweiligen Commits.

## Offene Nachweise (Zusammenfassung)

1. Sichtprüfung der Systemschriften auf Windows und macOS.
2. Rechtliche Prüfung des Wortlauts „Nutzung der Inhalte“ und seines Verhältnisses zum Urheberrechtshinweis im Impressum („ohne schriftliche Zustimmung“).
3. Rechtekette der Ursprungsbilder (DOCX V1.2) und des Original-Logos, falls über die Owner-Bestätigung hinaus belegt werden soll.
4. Einordnung des mit `potrace` (GPL-2.0) erzeugten Logo-Vektors; Lizenzangaben für `dom-walk` und `exif-parser` (nur Bauzeit).
5. HTTP-Kopfzeilen und Logs beim Hoster (nicht aus dem Repo prüfbar).
