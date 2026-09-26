/* BM Training — DER BUEHNENKANAL-ADAPTER (Port `Buehnenkanal`, Etappe 4 Schritt 0).

   ⚠⚠ ZWEI WEGE, EINE ZUSAGE. `BroadcastChannel` ist der gute Weg: er erreicht jedes Fenster
   desselben Ursprungs, ohne dass eines das andere kennen muss. Er fehlt in aelteren Browsern
   und in gehaerteten Kontexten. Der Rueckfall schreibt deshalb einen Schluessel im
   `localStorage`, was in JEDEM ANDEREN Fenster desselben Ursprungs ein `storage`-Ereignis
   ausloest. Langsamer und geschwaetziger, aber es traegt dort, wo der erste Weg fehlt.

   ⚠⚠ ER GEHT AM BESTANDSSPEICHER VORBEI, UND ZWAR NOTWENDIG: nur ein roher
   `localStorage`-Schreibvorgang loest das Ereignis aus, auf dem der Rueckfall beruht. Das ist
   eine benannte Ausnahme von der Speicherregel, keine Nachlaessigkeit - mit zwei Preisen, die
   hier stehen statt weggeredet zu werden: der Schluessel teilt sich das Kontingent mit dem
   Kursbestand (eine volle Quota trifft beide, und dieser Weg meldet sie nur als Warnung, nicht
   als `speicher/voll`), und ein gesperrter Speicher laesst ihn bei JEDEM Folienwechsel in den
   Fangzweig laufen.

   ⚠⚠ AM 2026-08-30 NACHGEMESSEN (Zug R2) - UND BEIDE WEGE TRAGEN UNTER `file://`. Hier stand
   bis heute "UNGEMESSEN UND DESHALB NICHT BEHAUPTET", mit der Begruendung des E4.0-Reviews:
   unter `file://` bekomme jedes Dokument in Chrome einen opaken Ursprung, `localStorage` werfe
   dort, und `storage`-Ereignisse wanderten nicht zwischen zwei `file://`-Fenstern. Gemessen in
   echtem Chrome ist davon KEIN Punkt eingetreten: `location.origin` meldet `file://` statt
   `null`, `localStorage` traegt, `BroadcastChannel` traegt zwischen zwei `file://`-Fenstern,
   und das `storage`-Ereignis wandert. Die ganze Kette laeuft dort - die Regie schaltet, die
   Buehne folgt, das Lebenszeichen kommt zurueck, die Antwortleiste erscheint, und die Meldung
   eines Teilnehmers steht im Livestand der Regie. Ohne eine einzige Konsolenmeldung, in der
   Schale `index.html` UND in der Einzeldatei `BM-Training.html` mit ihrer strikten CSP, und
   sogar dann, wenn die zwei Kopien in ZWEI VERSCHIEDENEN Verzeichnissen liegen.
   ⚠⚠ DER RUECKFALL IST DABEI EINZELN GEMESSEN, NICHT MITGEMEINT. Solange es
   `BroadcastChannel` gibt, faehrt der Rueckfall nie - eine gruene Kette haette also nur den
   guten Weg belegt. Gemessen wurde deshalb ein zweites Mal mit entferntem `BroadcastChannel`
   im Fenster: dieselbe Kette, dasselbe Ergebnis. *Wer zwei Wege hat und einen misst, hat einen
   gemessen.*
   ⚠⚠ UND DIE GRENZE DIESER MESSUNG STEHT MIT IHR, SONST WAERE SIE DIE NAECHSTE ANNAHME:
   gemessen ist CHROMIUM AUF WINDOWS (Chrome 1x sichtbar, 1x headless). Dass zwei
   `file://`-Dokumente denselben Ursprung teilen, ist eine Eigenschaft DIESER Maschine, keine
   Zusage der Web-Plattform - Firefox und Safari sind NICHT gemessen, und ein Chrome mit
   `--allow-file-access-from-files`-Gegenstueck oder einer Unternehmensrichtlinie kann sich
   anders verhalten. Der Fangzweig unten bleibt deshalb genau so scharf wie vorher: er ist
   nicht fuer den gemessenen Fall da, sondern fuer den ungemessenen.

   ⚠⚠ DER RUECKFALL IST KEIN ZWEITER MECHANISMUS, SONDERN DERSELBE. Beide Wege schicken
   dieselbe Nachricht durch dieselbe Marke, und `hoere` meldet beide an. Wer sie
   auseinanderlaufen laesst, hat zwei Wahrheiten darueber, was auf der Wand steht — die Klasse,
   die dieses Projekt an `darfHinaus` und `darfInDenKurs` ausdruecklich vermieden hat
   (Entscheid 37: „beide rufen `darfHinaus`, keine baut sie nach").

   ⚠ ER TRAEGT KEIN VERHALTEN. Senden und Empfangen, mehr nicht. Wer zuhoert und was er damit
   tut, ist E4.1. Ein Adapter, der schon entscheidet, ob ein Stand „aktuell genug" ist, hat
   Fachlogik in der Infrastruktur — und die Schichtregel misst das.

   ⚠⚠ SEIT E4.3 TRAEGT ER VIER NACHRICHTENARTEN — UND ER ANTWORTET AUF KEINE DAVON SELBST.
   Die vierte ist die MELDUNG (E4.3): die Wahl eines Teilnehmers, die erste Nutzlast auf dem
   Rueckweg. Auch sie entscheidet nichts hier — WANN gemeldet wird, entscheidet ein Mensch an
   einem Knopf auf der Buehne.
   `frage` und `antworte` sind zwei weitere Sendungen, mehr nicht: WER auf eine Frage
   antwortet, entscheidet die Buehne, und WANN gefragt wird, entscheidet der Takt der Regie
   (Entscheid 50). Ein Adapter, der eine Frage selbst beantwortete, meldete „es hoert jemand
   zu", sobald es IHN gibt — die Regie bekaeme ein Lebenszeichen von ihrem eigenen Fenster,
   und die Ausfallmeldung waere strukturell blind.
   ⚠ Beide Richtungen laufen ueber DENSELBEN Kanal und DENSELBEN Rueckfall. Ein eigener Weg
   fuer das Lebenszeichen haette eigene Reichweite und eigenen Ausfall — und dann saehe „die
   Buehne folgt" anders aus als „die Buehne bekommt Bilder", was das Lebenszeichen ja gerade
   messen soll.

   ⚠⚠ EINE NACHRICHT, DIE NICHT ANKOMMT, IST KEIN FEHLER. Zwischen zwei Vortraegen ist die
   Buehne geschlossen, und das ist der Normalfall. Deshalb gibt `sende` nichts zurueck; ob
   jemand zuhoert, beantwortet erst das Lebenszeichen aus E4.2. Jeder Wurf der Plattform wird
   hier geschluckt — aber NICHT stillschweigend: er geht in denselben Warnkanal wie ein
   fehlender Speicher, damit ein kaputter Kanal nicht wie ein leerer aussieht. */

import type {
  Buehnenantwort, Buehnenfrage, Buehnenkanal, Buehnenmeldung, Buehnenstand,
} from '../application/ports.ts';
import { ANTWORT_MARKE, FRAGE_MARKE, MELDUNG_MARKE } from '../application/meldung.ts';
import type { Teilnehmerbild } from '@bm/kern/domain/schulung/bild.ts';

/**
 * Die Marke eines Buehnenstands — der Wert zum Typ aus dem Port.
 *
 * ⚠⚠ SIE LEBT HIER UND NICHT IM PORT. `application/ports.ts` fuehrt seit E1 ausschliesslich
 * Typen: eine Laufzeit-Konstante dort macht aus dem Typ-Knoten eine echte Kante, und der
 * Import-Abschluss, den `tests/architektur.test.ts` misst, waere ein Freibrief statt einer
 * Messung. E4.0 hatte sie zuerst dort — der erste Bruch dieser Regel in elf Zuegen; der Review
 * hat ihn gefangen. Der Port traegt jetzt den Literaltyp, der Adapter den Wert; `tsc` haelt
 * beide zusammen.
 */
export const BUEHNENSTAND_MARKE = 'training-buehnenstand';

/**
 * Der Schluessel, unter dem der Rueckfall seine Nachricht ablegt.
 *
 * ⚠⚠ ER TRAEGT DEN PRAEFIX `training.` — wie jeder andere Speicherschluessel dieses Projekts,
 * und aus demselben Grund (T1, Entscheide 41/42, gemessen in `tests/kanon.test.ts`): ein
 * Speicherschluessel ist ein Datenvertrag, kein Produktname.
 *
 * ⚠⚠ R1-REVIEW-BEFUND (2026-08-30, zweite Lesart) — HIER STAND, ER SEI „der EINZIGE
 * Schluessel, der bewusst wieder GELOESCHT wird". Nachgemessen: es gibt kein `removeItem` im
 * ganzen Adapter und keinen Aufraeumpfad in `main.ts`. Die LETZTE Nachricht bleibt dauerhaft
 * liegen — nach jedem Zeichnen der Regie ist das ein vollstaendig serialisiertes
 * Teilnehmerbild. Kein Gate-Bruch (ein Teilnehmerbild, kein Regiematerial) und mengenmaessig
 * klein, aber der Kopf bezifferte den Preis als voruebergehend, und er ist bleibend.
 * ⚠ Und geloescht wird auch weiterhin nicht, mit Grund: der Rueckfall traegt die Nachricht
 * ZWISCHEN zwei Fenstern. Wer sie nach dem Zustellen wegraeumt, nimmt sie einem Fenster, das
 * gerade erst geoeffnet wird — daran haengt, dass eine spaet geoeffnete Buehne das letzte Bild
 * ueberhaupt noch bekommt. Der Schluessel traegt eine Nachricht und keinen Bestand; dass er
 * trotzdem liegen bleibt, ist der Preis dafuer und steht jetzt hier, statt bestritten zu sein.
 * Umkehrung: keine — es faellt keine Schutzmassnahme weg, sondern ein Satz, der das
 * Gegenteil des Verhaltens behauptete. Eine Mutation koennte nur den falschen Satz
 * zurueckschreiben, und kein Test dieses Projekts liest Kommentare auf Wahrheit.
 */
export const KANAL_SCHLUESSEL = 'training.buehnenkanal';

/** Der schmale Ausschnitt der Plattform, den dieser Adapter braucht. */
export interface KanalPlattform {
  /** `new BroadcastChannel(name)` — oder `null`, wenn die Plattform ihn nicht kennt. */
  kanal(name: string): KanalGriff | null;
  /** Der Rueckfall: schreiben loest in FREMDEN Fenstern ein Ereignis aus. */
  schreibe(schluessel: string, wert: string): void;
  /** Meldet einen Zuhoerer auf fremde Schreibvorgaenge an; gibt die Abmeldung zurueck. */
  beiFremdemSchreiben(auf: (schluessel: string, wert: string | null) => void): () => void;
}

/** Was ein `BroadcastChannel` koennen muss. */
export interface KanalGriff {
  postMessage(nachricht: unknown): void;
  addEventListener(art: 'message', auf: (e: { data: unknown }) => void): void;
  removeEventListener(art: 'message', auf: (e: { data: unknown }) => void): void;
  /* ⚠ `close()` stand hier und rief niemand - tote Vertragsflaeche, die keine Mutation
     angreifen kann (E4.0-Review). Der Adapter hat heute keine Abbaustufe: es gibt genau eine
     Instanz je Seitenladung. Kommt eine zweite (E4.2), gehoert sie hierher, dann mit
     Aufrufer. */
}

/**
 * Baut den Adapter.
 *
 * `warne` bekommt jeden Fehlschlag der Plattform. ⚠ Er ist PFLICHT, kein Vorgabewert: ein
 * Kanal, der still scheitert, sieht aus wie ein Kanal, dem niemand zuhoert — und das ist der
 * Unterschied zwischen „die Buehne ist zu" und „die Buehne bekommt nichts mehr".
 */
export function baueBuehnenkanal(
  plattform: KanalPlattform,
  warne: (grund: string) => void,
  sender: string,
): Buehnenkanal {
  let folge = 0;
  const griff = ((): KanalGriff | null => {
    try {
      return plattform.kanal(BUEHNENSTAND_MARKE);
    } catch (e) {
      warne('Der Buehnenkanal liess sich nicht oeffnen: ' + String(e));
      return null;
    }
  })();

  /* ⚠⚠ E4-ZUSAGE K7 - EIN VERSANDWEG FUER ALLE VIER NACHRICHTEN. Seit E4.3 gehen Bild, Frage,
     Antwort und Meldung durch diesen Kanal, und alle vier muessen BEIDE Wege nehmen und DIESELBE
     Serialisierung tragen. Drei Abschriften dieser zehn Zeilen waeren drei Stellen, an denen
     die schwaechste den Ausschlag gibt — und die schwaechste faende niemand, weil zwei davon
     gruen sind. Was fuer Bild und Rueckfall gilt („kein zweiter Mechanismus, sondern
     derselbe"), gilt genauso zwischen den Nachrichtenarten.
     Umkehrung: E4-Z1 */
  const verschicke = (roh: Buehnenstand | Buehnenfrage | Buehnenantwort | Buehnenmeldung): void => {
    /* ⚠⚠ BEIDE WEGE SCHICKEN DASSELBE — UND ZWAR DIESELBE SERIALISIERUNG. Der Kanal
       benutzt Structured Clone, der Rueckfall JSON; die beiden sind in beide Richtungen
       unvertraeglich (`undefined` verschwindet, `Date` wird Zeichenkette, ein Zyklus wirft
       nur bei einem von beiden). Wer `roh` an den einen und `JSON.stringify(roh)` an den
       anderen gibt, hat zwei Fenster auf verschiedenen Staenden — die Klasse, die dieser
       Adapter ausdruecklich vermeidet. Deshalb geht durch BEIDE der JSON-Rundlauf.
       Gefunden vom E4.0-Review; die alte Probe war fuer JSON-sichere Nutzlast tautologisch
       gruen. */
    const text = JSON.stringify(roh);
    const gleich: unknown = JSON.parse(text);
    if (griff !== null) {
      try { griff.postMessage(gleich); } catch (e) {
        warne('Der Buehnenkanal hat nicht gesendet: ' + String(e));
      }
    }
    /* ⚠⚠ DER RUECKFALL LAEUFT IMMER MIT, nicht nur wenn der erste Weg fehlt. Zwei Fenster
       koennen unterschiedlich ausgestattet sein — das aeltere ohne `BroadcastChannel`, das
       neuere mit. Wer den Rueckfall nur bei fehlendem Kanal benutzt, erreicht dann genau
       das Fenster nicht, fuer das es ihn gibt. Doppelte Zustellung ist harmlos: die
       Folgenummer macht die zweite zur Wiederholung.
       ⚠⚠ UND SIE MACHT DIE ZWEITE FRAGE UEBERHAUPT ERST SICHTBAR. Das Ereignis, auf dem
       dieser Weg beruht, feuert nur, wenn sich der WERT unter dem Schluessel aendert — zwei
       gleiche Fragen hintereinander waeren dieselbe Zeichenkette, und die zweite ginge hier
       spurlos verloren. Der Takt der Regie besteht aus lauter gleichen Fragen; ohne die
       Folgenummer im Umschlag traege der Rueckfall das Lebenszeichen genau einmal. */
    try { plattform.schreibe(KANAL_SCHLUESSEL, text); } catch (e) {
      warne('Der Rueckfall des Buehnenkanals hat nicht geschrieben: ' + String(e));
    }
  };

  return {
    sende(bild: Teilnehmerbild): void {
      /* ⚠⚠ E4-ZUSAGE K5 - SENDER UND FOLGE VERGIBT DER ADAPTER, DESHALB VERLANGT `sende` SIE NICHT MEHR.
         Der Zaehler lebt in dieser Instanz und faengt nach jedem Neuladen wieder bei 1 an;
         ohne `sender` waere „die Buehne verwirft, was aelter ist" nach einem F5 der Regie eine
         Falle, die den Vortrag lahmlegt, ohne dass jemand einen Fehler sieht. Ein Wechsel der
         Sender-Kennung ist ein NEUER Zaehler, kein aelterer Stand.
         ⚠ Bis E4.1 nahm `sende` einen ganzen `Buehnenstand` und ueberschrieb hier zwei seiner
         vier Felder — der Aufrufer musste also Werte hinschreiben, die verworfen wurden.
         ⚠ Dieselbe Zusage und dieselbe Zeile wie E4-Q3, deshalb kein zweites Kuerzel: die
         Umkehrung friert den Zaehler auf 1 ein. Ein Aufrufer, der ihn setzen wollte, hat seit
         E4.1 gar kein Feld mehr dafuer.
         Umkehrung: E4-Q3 */
      verschicke({ marke: BUEHNENSTAND_MARKE, sender, folge: (folge += 1), bild });
    },

    /* ⚠⚠ E4-ZUSAGE K8 - FRAGE UND ANTWORT ZIEHEN AUS DEMSELBEN ZAEHLER WIE DAS BILD. Er ist
       „fortlaufend je Sender", nicht „fortlaufend je Nachrichtenart": die Buehne verwirft
       Bilder, die aelter sind als das zuletzt gezeichnete, und zwei Zaehlungen desselben
       Senders koennte sie nicht auseinanderhalten. Luecken in der Folge eines Bildstroms sind
       harmlos — verglichen wird `<=`, nicht `+1`.
       ⚠ Und der Zaehler muss laufen, nicht stehen: gleiche Zeichenketten haelt der
       Speicher-Rueckfall fuer „nichts geaendert" und schickt sie gar nicht erst los.
       Umkehrung: E4-Z2 */
    frage(): void {
      verschicke({ marke: FRAGE_MARKE, sender, folge: (folge += 1) });
    },

    antworte(): void {
      verschicke({ marke: ANTWORT_MARKE, sender, folge: (folge += 1) });
    },

    /* ⚠⚠ E4-ZUSAGE K9 - DIE MELDUNG NIMMT DENSELBEN WEG UND DENSELBEN ZAEHLER WIE ALLES
       ANDERE (Entscheid 59). Sie ist die erste NUTZLAST auf dem Rueckweg, und gerade deshalb
       war die Versuchung da, ihr einen eigenen Weg zu geben: sie kommt selten, sie ist
       wichtig, sie darf nicht verloren gehen. Ein zweiter Weg haette eigene Reichweite und
       eigenen Ausfall — und dann saehe „die Buehne antwortet" anders aus als „die Buehne
       meldet", waehrend die Regie beides aus demselben Kanal liest und nebeneinander anzeigt.
       ⚠⚠ UND DER ZAEHLER IST HIER NICHT ZIERDE, SONDERN TRAGEND: der Speicher-Rueckfall
       feuert nur, wenn sich der WERT unter dem Schluessel aendert. Zwei Teilnehmer, die
       dieselbe Option desselben Bausteins waehlen, schickten ohne die Folgenummer dieselbe
       Zeichenkette — und die zweite Stimme ginge auf diesem Weg spurlos verloren. Das ist
       woertlich die teuerste Einzelheit aus E4.2, nur mit einem Verlust, den niemand sieht:
       dort blieb ein Lebenszeichen aus, hier fehlt eine Stimme in einer Zaehlung.
       Umkehrung: E4-Z3 */
    melde(bausteinId: string, wahl: number): void {
      verschicke({ marke: MELDUNG_MARKE, sender, folge: (folge += 1), bausteinId, wahl });
    },

    hoere(auf: (roh: unknown) => void): () => void {
      const ausKanal = (e: { data: unknown }): void => { melde(e.data); };
      const ausSpeicher = (schluessel: string, wert: string | null): void => {
        if (schluessel !== KANAL_SCHLUESSEL || wert === null) return;
        try { melde(JSON.parse(wert)); } catch { /* fremder Inhalt — `liesBuehnenstand` weist ab */ }
      };
      /* ⚠⚠ E4-ZUSAGE K6 - DER ADAPTER PRUEFT NICHT, OB DER STAND GUELTIG IST — UND SEIT E4.1 BEHAUPTET ER ES
         AUCH NICHT MEHR. Hier stand `auf(roh as Buehnenstand)`: eine Zusicherung ohne Messung,
         genau an der Naht, an der die Daten von aussen kommen. Der Port gibt dem Zuhoerer
         jetzt `unknown`, die Zusicherung faellt weg, und der einzige Weg zur Zeichenflaeche
         fuehrt durch `liesBuehnenstand` (Entscheid 49). Eine Pruefung HIER waere eine zweite
         Wahrheit — und Fachlogik in der Infrastruktur, die die Schichtregel misst.
         Umkehrung: keine — hier faellt eine ZUSICHERUNG weg, keine Schutzmassnahme. Eine
         Mutation muesste eine Pruefung HINZUFUEGEN, und das ist kein Zurueckdrehen, sondern ein
         zweiter Mechanismus. Was gemessen wird, ist die Wirkung: der Port gibt `unknown`
         (`tests/typen.test.ts` faehrt `tsc` als Teil der Suite), und die Buehne kommt ohne
         `liesBuehnenstand` nicht an das Bild (E4-B2). */
      const melde = (roh: unknown): void => { auf(roh); };

      if (griff !== null) griff.addEventListener('message', ausKanal);
      const abSpeicher = plattform.beiFremdemSchreiben(ausSpeicher);

      return (): void => {
        if (griff !== null) griff.removeEventListener('message', ausKanal);
        abSpeicher();
      };
    },
  };
}
