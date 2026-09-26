/** Was eine Fallliste zeigt, ohne den ganzen Fall zu laden. */
export interface Fallkopf {
  fallId: string;
  titel: string;
  schritte: number;
  rollen: number;
}

/* ---------------------------------------------------------------------- Umgebung -- */

/**
 * Der Buehnenkanal — der Weg von der Regie zur Buehne (Etappe 4, Schritt 0).
 *
 * ⚠⚠ ER UEBERTRAEGT DAS BILD, NICHT DIE ROUTE (Entscheid 48). Das ist die teuerste Zusage
 * dieser Etappe. Ueber den Routen-Hash war die erste Regel des Projekts — *Regiematerial
 * erreicht die Buehne nie* — STRUKTURELL sicher: dort stand gar nichts, was man haette
 * verlieren koennen. Ein Kanal kann alles uebertragen. Deshalb geht durch ihn ausschliesslich
 * ein fertiges `Teilnehmerbild`, gebaut von derselben reinen Funktion wie heute, und die
 * Bild-Invarianz aus `tests/gate.test.ts` gilt unveraendert fuer das, was hineingeht.
 * **Wer stattdessen den Kurs oder die Route uebertraegt und die Buehne bauen laesst, hat das
 * Gate an eine zweite Stelle kopiert** — und genau diese Klasse („eine Zusage im Kern beweist
 * nichts ueber die Ansicht, die ihn ruft") war der schwerste Befund von E3.1.
 *
 * ⚠⚠ DER PORT UEBERLEBT SEINEN ADAPTER. `BroadcastChannel` ist eine Browser-Schnittstelle;
 * T5 stellt die Betriebsform auf einen lokalen Node-Dienst um
 * (`docs/ZUSAMMENWACHSEN-2026-08-26.md`). Genau dafuer gibt es die Portschicht — der Adapter
 * darf sterben, dieser Vertrag nicht. Akzeptanzkriterium 25 („Wechsel ohne Neuschreiben der
 * Fachlogik") wird hier zum zweiten Mal eingeloest statt behauptet.
 *
 * ⚠⚠ SEIT E4.2 KENNT ER EINE FRAGE UND EINE ANTWORT — UND ZWAR AUF DEMSELBEN WEG. `frage`,
 * `antworte` und `sende` schicken durch denselben Kanal und denselben Rueckfall; wer zuhoert,
 * bekommt ALLES, was ueber ihn geht, und entscheidet selbst, was davon ihn angeht. Ein zweiter
 * Kanal fuer das Lebenszeichen waere ein zweiter Mechanismus mit eigener Ausstattung, eigener
 * Reichweite und eigenem Ausfall — und dann saehe „die Buehne folgt" anders aus als „die
 * Buehne bekommt Bilder". Genau das soll das Lebenszeichen ja messen.
 *
 * ⚠ Der Zeitgeber steckt NICHT in diesem Vertrag: er lebt in der REGIE (Entscheid 50) und
 * kommt aus dem Port `Zeitgeber`. Ein Kanal, der selbst taktet, haette Verhalten — und ein
 * Takt auf der Buehne hebelte den `bildSchluessel`-Riegel aus, den Entscheid 35 begruendet.
 */
export interface Buehnenkanal {
  /**
   * Schickt ein BILD an die Buehne — den Umschlag baut der Adapter.
   *
   * ⚠⚠ E4.1 - HIER STAND `sende(stand: Buehnenstand)`, UND DAS ZWANG DEN AUFRUFER ZUM LUEGEN.
   * `sender` und `folge` vergibt der Adapter (er muss es: der Zaehler lebt in seiner Instanz,
   * und zwei Zaehlungen kann die Buehne nicht auseinanderhalten) — er ueberschreibt also beide
   * Felder, die der Aufrufer hinschreiben musste. Die Regie haette `sender: ''` und `folge: 0`
   * eingetragen und nie erfahren, dass niemand sie liest; die E4.0-Probe hat genau das getan
   * und damit einen Stand gemessen, den es so nie gibt. **Ein Vertrag, der Felder verlangt, die
   * er selbst verwirft, ist eine Einladung zur Attrappe.** Jetzt gibt der Aufrufer, was ihm
   * gehoert: das Bild.
   * ⚠⚠ UND DAMIT TRAEGT DIE SIGNATUR ENTSCHEID 48 GANZ. Durch diesen Kanal geht ein fertiges
   * `Teilnehmerbild` und sonst nichts — `sende(kurs)` ist ein Uebersetzungsfehler, nicht ein
   * Verstoss gegen einen Kommentar.
   *
   * ⚠ `void`, nicht `Ergebnis`: ein Kanal, der nicht ankommt, ist kein Fehler des Aufrufers —
   * die Buehne kann geschlossen sein, und das ist der Normalfall zwischen zwei Vortraegen.
   * Ob jemand zuhoert, beantwortet erst das Lebenszeichen aus E4.2.
   */
  sende(bild: Teilnehmerbild): void;
  /**
   * Meldet einen Zuhoerer an. Gibt die Abmeldung zurueck.
   *
   * ⚠⚠ E4.1 - DER ZUHOERER BEKOMMT `unknown`, UND DAS IST DIE TRAGENDE ZEILE DIESES SCHRITTS.
   * Hier stand `auf: (stand: Buehnenstand) => void` — waehrend der Adapter ungeprueft
   * `roh as Buehnenstand` weitergab. Der Typ behauptete also eine Gueltigkeit, die niemand
   * gemessen hatte: eine Buehne, die `stand.bild` direkt zeichnet, haette FEHLERFREI
   * uebersetzt und dabei ein Bild aus einem fremden Fenster auf den Beamer gelegt — mit
   * Notizen, wenn der Absender welche mitschickt. Das ist woertlich E1-Befund C-M13 („der
   * Literal war durch keinen Test widerlegbar"), nur diesmal an der Stelle, an der die Daten
