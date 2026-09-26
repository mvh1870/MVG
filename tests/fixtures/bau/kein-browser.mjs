// Vorab-Modul für tests/bau-kette.test.ts: jeder Browserstart scheitert, als gäbe es keinen Browser.
// Wird mit `node --import` geladen; oberflaeche.mjs bekommt dasselbe chromium-Objekt aus dem Modulspeicher.
import { chromium } from 'playwright';

chromium.launch = async () => {
  throw new Error('Testattrappe: kein Browser');
};
