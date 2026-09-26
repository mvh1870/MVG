#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""fortsetzer.py - der Stop-Haken eines Cloud-Hauses: trägt einen Arbeitsblock über mehrere Züge.

WARUM ES IHN GIBT. Eine Sitzung endet am Ende jedes Zuges und tut danach von sich aus nichts
mehr. Lokal hält das der PowerShell-Fortsetzer des Solo-Pakets; in der Cloud läuft Linux ohne
PowerShell, dafür mit Python. Dieser Haken ist derselbe Gedanke, auf einen ARBEITSBLOCK
zugeschnitten: eine Routine startet je Block eine frische Sitzung, und der Haken trägt sie über
mehrere Züge, bis eine Blockzeit oder eine Obergrenze erreicht ist. Eine Uhr gibt es in der
Cloud nicht; den nächsten Block bringt die Routine.

⚠ UNGEMESSEN. Alles, was hier über die Cloud angenommen wird, steht in der Dokumentation von
Claude Code (nachgelesen am 2026-09-26), nicht in einer Messung. Wo der Haken sich auf etwas
stützt, das nur dort steht, sagt es der Kommentar.

DIE RIEGEL, in der Reihenfolge, in der sie geprüft werden:
  0. NUR IN DER CLOUD. Ohne CLAUDE_CODE_REMOTE=true passiert nichts - dasselbe Repository wird
     auch auf den Rechnern des Owners geöffnet, und dort hat dieser Haken nichts zu suchen.
  1. KEIN AUFTRAG, KEIN WEITER. Fehlt .claude/cloud.json, ist aktiv nicht true oder der
     Auftrag leer, passiert nichts.
  2. NUR EIN BLOCK. Die erste Nutzerzeile der Sitzung muss den Anstoß der Routine tragen
     ("Arbeitsblock dieser Produktion"). Öffnet der Owner eine gewöhnliche Cloud-Sitzung auf
     diesem Repository, um etwas zu fragen, soll sie ihm nicht zwei Stunden davonlaufen.
  3. KEIN FREMDER HALT. Kommt der Halt aus einem Stop-Haken und nennt der Stand eine andere
     Sitzung, war es ein fremder Haken - der wird nicht überstimmt.
  4. HALT-MARKE .claude/weiter-halt lässt den Halt durch und wird dabei verbraucht.
  5. BLOCKZEIT. Beginn ist der erste Zeitstempel im Sitzungsprotokoll - so erkennt der Haken
     auch eine alte Sitzung, die der Owner Stunden später mit einer Antwort wieder öffnet:
     deren Block ist lange um, und sie darf nicht neben dem nächsten weiterarbeiten.
  6. OBERGRENZE an Fortsetzungen je Sitzung (Vorgabe 25, Deckel 200) - die Bremse gegen
     einen Amoklauf, falls die Blockzeit aus irgendeinem Grund nicht greift.
  7. LEERLAUFBREMSE: vier Fortsetzungen in 45 Sekunden sind Leerlauf, keine Arbeit.
  8. IM ZWEIFEL ANHALTEN. Jeder Fehlerweg endet ohne Block und mit 0.

WO DER STAND LIEGT. Im git-Verzeichnis (cloud-weiter.json), nie im Arbeitsbaum - sonst
sammelt ihn ein Commit ein. Er lebt nur so lange wie der Rechner des Blocks, und mehr braucht
er nicht: jeder Block beginnt auf einem frischen.

    python3 cloud/fortsetzer.py --haken    als Stop-Haken (Haken-JSON auf stdin)
    python3 cloud/fortsetzer.py            Trockenlauf: sagt, was er täte (liest stdin nicht)
"""
import datetime
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile

VORGABE_GRENZE = 25
DECKEL = 200
VORGABE_BLOCK_MIN = 120
# "Block bis" in der Ampel = Blockende plus dieser Puffer. Der Haken prüft nur am Zugende;
# ein Zug, der kurz vor dem Ende beginnt, läuft darüber hinaus. Gemessen an einem lokalen Haus:
# ein Zug dauerte dort 44 Minuten.
PUFFER_MIN = 45
LEERLAUF_ZUEGE = 4
LEERLAUF_SEKUNDEN = 45
ANSTOSS_MARKE = "Arbeitsblock dieser Produktion"
VORGABE_ZWEIG = "claude/haus"


def jetzt():
    return datetime.datetime.now(datetime.timezone.utc)


def zeit_text(t):
    return t.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M+00:00")


def zeit_lesen(s):
    if not s:
        return None
    s = str(s).strip().replace("Z", "+00:00")
    # Python vor 3.11 kennt nur drei oder sechs Nachkommastellen.
    s = re.sub(r"(\.\d{6})\d+", r"\1", s)
    try:
        t = datetime.datetime.fromisoformat(s)
    except ValueError:
        return None
    if t.tzinfo is None:
        t = t.replace(tzinfo=datetime.timezone.utc)
    return t


def lies_json(pfad):
    try:
        with open(pfad, encoding="utf-8-sig") as f:
            return json.load(f)
    except Exception:
        return None


def schreib_json(pfad, obj):
    tmp = pfad + ".neu"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False)
    os.replace(tmp, pfad)


def git(wurzel, *args):
    try:
        r = subprocess.run(["git", "-C", wurzel] + list(args), capture_output=True, text=True, timeout=15)
        if r.returncode == 0:
            return r.stdout.strip()
    except Exception:
        pass
    return ""


def projektwurzel(eingabe):
    """Die Marke entscheidet, nicht die Vermutung: gilt nur, wo .claude/cloud.json liegt."""
    kandidaten = [os.environ.get("CLAUDE_PROJECT_DIR", ""),
                  (eingabe or {}).get("cwd", ""),
                  os.getcwd(),
                  os.path.dirname(os.path.dirname(os.path.abspath(__file__)))]
    for k in kandidaten:
        if k and os.path.isfile(os.path.join(k, ".claude", "cloud.json")):
            return k
    for k in kandidaten:
        if k and os.path.isdir(k):
            top = git(k, "rev-parse", "--show-toplevel")
            if top and os.path.isfile(os.path.join(top, ".claude", "cloud.json")):
                return top
    return os.getcwd()


def stand_pfad(wurzel):
    g = git(wurzel, "rev-parse", "--absolute-git-dir")
    if g and os.path.isdir(g):
        return os.path.join(g, "cloud-weiter.json")
    h = hashlib.sha1(os.path.abspath(wurzel).encode("utf-8")).hexdigest()[:12]
    return os.path.join(tempfile.gettempdir(), "cloud-weiter-" + h + ".json")


def protokoll_kopf(pfad, n=262144):
    try:
        with open(pfad, "rb") as f:
            return f.read(n).decode("utf-8", errors="replace")
    except Exception:
        return ""


def blockbeginn(kopf):
    m = re.search(r'"timestamp"\s*:\s*"([^"]+)"', kopf)
    return zeit_lesen(m.group(1)) if m else None


def ist_block(kopf):
    """Trägt eine der ersten Nutzereingaben den Anstoß der Routine?

    Gezählt wird nur, was ein Mensch oder die Routine geschrieben hat - Text, kein
    Werkzeugergebnis. Sonst machte schon das Lesen einer Datei, die den Satz zitiert, aus einer
    gewöhnlichen Sitzung einen Block.
    """
    gesehen = 0
    for zeile in kopf.splitlines():
        if '"user"' not in zeile:
            continue
        try:
            z = json.loads(zeile)
        except Exception:
            continue
        if z.get("type") != "user":
            continue
        inhalt = (z.get("message") or {}).get("content")
        if isinstance(inhalt, str):
            texte = [inhalt]
        elif isinstance(inhalt, list):
            texte = [b.get("text", "") for b in inhalt if isinstance(b, dict) and b.get("type") == "text"]
        else:
            texte = []
        if not texte:
            continue
        gesehen += 1
        if any(ANSTOSS_MARKE in t for t in texte):
            return True
        if gesehen >= 3:
            break
    return False


def verdichtung_seit(pfad, ab_stelle):
    """Stempel der jüngsten Verdichtung im neu gelesenen Stück und die neue Lesestelle."""
    stempel, stelle = "", ab_stelle
    try:
        laenge = os.path.getsize(pfad)
        stelle = laenge
        start = ab_stelle if 0 < ab_stelle <= laenge else max(0, laenge - 1048576)
        start = max(start, laenge - 33554432)
        if laenge - start <= 0:
            return stempel, stelle
        with open(pfad, "rb") as f:
            f.seek(start)
            text = f.read(laenge - start).decode("utf-8", errors="replace")
        if "compact_boundary" not in text:
            return stempel, stelle
        for zeile in text.splitlines():
            if "compact_boundary" in zeile:
                m = re.search(r'"timestamp"\s*:\s*"([^"]+)"', zeile)
                if m:
                    stempel = m.group(1)
    except Exception:
        pass
    return stempel, stelle


def blocke(grund):
    sys.stdout.write(json.dumps({"decision": "block", "reason": grund, "suppressOutput": True}))
    sys.exit(0)


def durchlassen(warum, fuer_owner=""):
    # Der Grund geht nach stderr; was der Owner sehen soll, als systemMessage.
    if warum:
        sys.stderr.write("fortsetzer: " + warum + "\n")
    if fuer_owner:
        sys.stdout.write(json.dumps({"systemMessage": fuer_owner}))
    sys.exit(0)


def haupt():
    haken = "--haken" in sys.argv
    e = {}
    if haken:
        try:
            roh = sys.stdin.read()
            e = json.loads(roh) if roh.strip() else {}
        except Exception:
            e = {}
        if not isinstance(e, dict):
            e = {}

    # Riegel 0
    if os.environ.get("CLAUDE_CODE_REMOTE", "") != "true":
        durchlassen("nicht in der Cloud (CLAUDE_CODE_REMOTE ist nicht true) - hier nichts zu tun")

    wurzel = projektwurzel(e)
    auftrag_datei = os.path.join(wurzel, ".claude", "cloud.json")

    # Riegel 1
    o = lies_json(auftrag_datei)
    if not isinstance(o, dict):
        durchlassen("kein Auftrag hinterlegt (.claude/cloud.json fehlt oder ist kein JSON)")
    if o.get("aktiv") is not True:
        durchlassen("die Fortsetzung ist abgeschaltet (aktiv ist nicht true)")
    text = str(o.get("auftrag") or "").strip()
    if not text:
        durchlassen("der Auftragstext ist leer")
    try:
        grenze = min(int(o.get("grenze") or VORGABE_GRENZE), DECKEL)
    except (TypeError, ValueError):
        grenze = VORGABE_GRENZE
    try:
        block_min = int(o.get("blockMinuten") or VORGABE_BLOCK_MIN)
    except (TypeError, ValueError):
        block_min = VORGABE_BLOCK_MIN
    zweig = str(o.get("zweig") or VORGABE_ZWEIG)

    sitzung = str(e.get("session_id") or "(ohne Sitzung)")
    protokoll = str(e.get("transcript_path") or "")
    kopf = protokoll_kopf(protokoll) if protokoll else ""
    sp = stand_pfad(wurzel)
    stand = lies_json(sp)
    if not isinstance(stand, dict):
        stand = {}
    eigene = stand.get("sitzung") == sitzung

    # Riegel 2
    if haken and not ist_block(kopf):
        durchlassen("keine Block-Sitzung: die erste Nutzerzeile trägt den Anstoß der Routine nicht")

    # Riegel 3
    if e.get("stop_hook_active") is True and stand and not eigene:
        durchlassen("übersprungen: der Halt kam aus einem fremden Stop-Haken")

    # Riegel 4
    halt = os.path.join(wurzel, ".claude", "weiter-halt")
    if os.path.exists(halt):
        grund = ""
        try:
            with open(halt, encoding="utf-8", errors="replace") as f:
                grund = f.read().strip()[:120]
        except Exception:
            pass
        if haken:
            try:
                os.remove(halt)
            except Exception:
                pass
        durchlassen("Halt-Marke lag - der Block hält an, die Marke ist verbraucht. " + grund)

    # Riegel 5
    beginn = blockbeginn(kopf)
    if not beginn and eigene:
        beginn = zeit_lesen(stand.get("beginn"))
    if not beginn:
        beginn = jetzt()
    ende = beginn + datetime.timedelta(minutes=block_min)
    bis = ende + datetime.timedelta(minutes=PUFFER_MIN)
    if jetzt() >= ende:
        durchlassen("Blockzeit um (%d min seit %s)" % (block_min, zeit_text(beginn)),
                    "Arbeitsblock beendet: %d Minuten sind um. Der nächste kommt nach Plan." % block_min)

    # Riegel 6
    zaehler = int(stand.get("zaehler") or 0) + 1 if eigene else 1
    if zaehler > grenze:
        durchlassen("Obergrenze von %d Fortsetzungen erreicht" % grenze,
                    "Arbeitsblock beendet: Obergrenze von %d Zügen erreicht. Der nächste kommt nach Plan." % grenze)

    # Riegel 7
    takte = []
    if eigene:
        for x in stand.get("takte") or []:
            t = zeit_lesen(x)
            if t and (jetzt() - t).total_seconds() < LEERLAUF_SEKUNDEN:
                takte.append(x)
    if len(takte) >= LEERLAUF_ZUEGE - 1:
        durchlassen("Leerlaufbremse: %d Fortsetzungen in unter %d Sekunden" % (len(takte) + 1, LEERLAUF_SEKUNDEN),
                    "Leerlaufbremse: der Block hat Züge beendet, ohne etwas zu tun, und ist angehalten.")

    # Verdichtung seit dem letzten Zugende?
    v_alt = str(stand.get("verdichtung") or "") if eigene else ""
    v_stelle = int(stand.get("stelle") or 0) if eigene else 0
    v_neu = False
    if haken and protokoll:
        stempel, v_stelle = verdichtung_seit(protokoll, v_stelle)
        if stempel and stempel != v_alt:
            v_alt, v_neu = stempel, True

    takte.append(jetzt().isoformat())
    takte = takte[-5:]

    if not haken:
        print("TROCKENLAUF - als Haken würde er jetzt blocken:")
        print("  Auftrag: " + text)
        print("  Fortsetzung %d von %d, Block bis %s" % (zaehler, grenze, zeit_text(bis)))
        print("  Stand: " + sp)
        sys.exit(0)

    try:
        schreib_json(sp, {"sitzung": sitzung, "zaehler": zaehler, "beginn": beginn.isoformat(),
                          "zuletzt": jetzt().isoformat(), "takte": takte,
                          "verdichtung": v_alt, "stelle": v_stelle})
    except Exception as x:
        # Ohne Mitzählen kein Weiter: sonst liefe die Fortsetzung ohne Obergrenze.
        durchlassen("der Stand ließ sich nicht schreiben (%s): %s" % (sp, x))

    rest = max(1, int((ende - jetzt()).total_seconds() // 60))
    # DER MERKZETTEL: das Einzige, was eine Verdichtung nicht wegnimmt (gemessen lokal am
    # 2026-09-24: nach einer Reihe von Verdichtungen fehlte der Schlussblock 22 Züge lang).
    merk = ("[Fortsetzer %d/%d · Block bis %s, Züge noch rund %d min - automatisch, ohne Rückfrage.\n"
            " Zugende: committen, git pull --rebase, auf %s pushen. JEDER Zug endet gepusht: nach dem Block"
            " bekommst du keinen Zug mehr, und was nicht gepusht ist, ist weg.\n"
            " Schlussblock mit Ampelfarbe, zuletzt, weiter - dieselbe Zeile in .claude/ampel, mit"
            " „Block bis %s“, im selben Commit.\n"
            " Nichts mehr ohne Owner: Frage in OWNER-FRAGEN.md UND in den Chat, pushen, Halt-Marke"
            " .claude/weiter-halt setzen, Zug beenden - der nächste Block kommt nach Plan.]"
            % (zaehler, grenze, zeit_text(bis), rest, zweig, zeit_text(bis)))
    if v_neu:
        regeln = os.path.join(wurzel, "cloud", "CLOUD-REGELN.md")
        merk += ("\n\n!!!! DEIN KONTEXT WURDE GERADE VERDICHTET. Damit sind die Regeln, nach denen du"
                 " arbeitest, aus dem Fenster gefallen - was du noch zu wissen glaubst, ist eine"
                 " Zusammenfassung.")
        if os.path.isfile(regeln):
            merk += " Lies JETZT " + regeln + ", danach den Kopf deiner Übergabe und dein Planblatt."
        else:
            merk += " Lies den Kopf deiner Übergabe und dein Planblatt, bevor du weiterarbeitest."
    blocke(text + "\n\n" + merk)


if __name__ == "__main__":
    for strom in (sys.stdin, sys.stdout, sys.stderr):
        try:
            strom.reconfigure(encoding="utf-8")
        except Exception:
            pass
    try:
        haupt()
    except SystemExit:
        raise
    except Exception as x:
        # Im Zweifel anhalten: ein Haken, der abstürzt, soll nichts blockieren.
        sys.stderr.write("fortsetzer: abgebrochen: %r\n" % (x,))
        sys.exit(0)
