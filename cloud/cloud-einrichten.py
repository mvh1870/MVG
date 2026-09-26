# -*- coding: utf-8 -*-
"""cloud-einrichten.py - richtet ein Projekt so ein, dass es in Arbeitsblöcken in der Cloud läuft.

Läuft auf einem Rechner des Owners (Windows), nicht in der Cloud. Was es tut:
  1. prüft: ein git-Projekt mit GitHub-Remote, nicht die Ablage der Prompts;
  2. legt das Paket nach <Projekt>/cloud/, falls es woanders liegt;
  3. trägt zwei Haken in <Projekt>/.claude/settings.json ein (anhängen, nie ersetzen, vorher
     sichern) - beide tun nur in der Cloud etwas, auf den Rechnern des Owners nichts;
  4. legt .claude/cloud.json an (Auftrag, Blockzeit, Obergrenze, Arbeitszweig) und trägt die
     Halt-Marke in .gitignore ein;
  5. committet genau diese Dateien und pusht sie auf den Standardzweig - nur nach Rückfrage.
     Die Cloud liest Haken und Regeln aus dem Klon; was nicht gepusht ist, gibt es dort nicht.
Zum Schluss nennt es die Einstellungen der Routine.

    python cloud-einrichten.py [<Projekt>] [--zurueck] [--ja] [--block <min>] [--grenze <n>]

--zurueck nimmt Haken und Auftrag heraus (die Routine hält nur der Owner an).
--ja beantwortet die Rückfrage mit ja (für Proben).
"""
import argparse
import datetime
import json
import os
import re
import shutil
import subprocess
import sys

MARKE_STOP = "cloud/fortsetzer.py"
MARKE_DIALOG = "cloud/dialog-sperre.py"
BEFEHL_STOP = '[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0; python3 "$CLAUDE_PROJECT_DIR/cloud/fortsetzer.py" --haken'
BEFEHL_DIALOG = '[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0; python3 "$CLAUDE_PROJECT_DIR/cloud/dialog-sperre.py"'
DECKEL_VAR = "CLAUDE_CODE_STOP_HOOK_BLOCK_CAP"
PAKET_PFLICHT = ["fortsetzer.py", "dialog-sperre.py", "CLOUD-REGELN.md"]
AUFTRAG = ("Mach ohne Rückfrage mit dem nächsten Posten deines Planblatts weiter, "
           "der keine Owner-Antwort braucht.")
ANSTOSS = ("Du bist ein Arbeitsblock dieser Produktion. Dein Arbeitszweig ist {zweig}.\n"
           "Lies ZUERST die Datei cloud/CLOUD-REGELN.md in diesem Repository vollständig. Sie ist dein\n"
           "stehender Auftrag vom Owner. Arbeite danach nach ihr, beginnend mit ihrem ANLAUF.")

for strom in (sys.stdout, sys.stderr):
    try:
        strom.reconfigure(encoding="utf-8")
    except Exception:
        pass


def git(wurzel, *args, pruefen=False):
    r = subprocess.run(["git", "-C", wurzel] + list(args), capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if pruefen and r.returncode != 0:
        raise RuntimeError("git %s: %s" % (" ".join(args), (r.stderr or r.stdout).strip()))
    return r.returncode, (r.stdout or "").strip()


def lies_json(pfad):
    with open(pfad, encoding="utf-8-sig") as f:
        return json.load(f)


def schreib_json(pfad, obj):
    # Ohne BOM: die Cloud liest die Datei unter Linux.
    with open(pfad, "w", encoding="utf-8", newline="\n") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")


def enthaelt(eintrag, marke):
    return marke in json.dumps(eintrag, ensure_ascii=False)


def fassung(paket):
    try:
        with open(os.path.join(paket, "CLOUD-REGELN.md"), encoding="utf-8") as f:
            m = re.search(r"Prompt-Fassung (CLOUD \S+?)\.", f.read(2000))
            return m.group(1) if m else "?"
    except OSError:
        return "?"


def frage_ja(text, ja):
    if ja:
        print(text + " j  (--ja)")
        return True
    try:
        return input(text + " [j/N] ").strip().lower() in ("j", "ja", "y", "yes")
    except EOFError:
        return False


def haupt(argv):
    eigen = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument("projekt", nargs="?", default=os.path.join(eigen, ".."))
    ap.add_argument("--zurueck", action="store_true")
    ap.add_argument("--ja", action="store_true")
    ap.add_argument("--block", type=int, default=120)
    ap.add_argument("--grenze", type=int, default=25)
    arg = ap.parse_args(argv)
    zurueck, ja, block_min, grenze = arg.zurueck, arg.ja, arg.block, arg.grenze
    wurzel = os.path.abspath(arg.projekt)
    print("Projekt: " + wurzel)

    # --- 1 Ist das ein Projekt, und eines, das die Cloud klonen kann?
    for v in ("HAUS-EGO.md", "HAUS-CLOUD.md", "ANLEITUNG.md"):
        if os.path.exists(os.path.join(wurzel, v)):
            print("ABBRUCH: das ist die Ablage der Prompts, kein Projekt (%s liegt hier)." % v)
            return 1
    code, top = git(wurzel, "rev-parse", "--show-toplevel")
    if code != 0:
        print("ABBRUCH: kein git-Projekt. Die Cloud arbeitet nur auf einem Klon von GitHub.")
        return 1
    if os.path.normcase(os.path.abspath(top)) != os.path.normcase(wurzel):
        print("ABBRUCH: das ist ein Unterordner. Die Wurzel des Projekts ist " + top)
        return 1
    code, remote = git(wurzel, "remote", "get-url", "origin")
    if code != 0 or "github.com" not in remote:
        print("ABBRUCH: kein GitHub-Remote 'origin' (gefunden: %s)." % (remote or "keiner"))
        return 1
    code, kopf = git(wurzel, "symbolic-ref", "--short", "refs/remotes/origin/HEAD")
    if code != 0:
        git(wurzel, "remote", "set-head", "origin", "--auto")
        code, kopf = git(wurzel, "symbolic-ref", "--short", "refs/remotes/origin/HEAD")
    standard = kopf.split("/", 1)[1] if code == 0 and "/" in kopf else ""
    _, zweig_jetzt = git(wurzel, "branch", "--show-current")
    print("  GitHub: %s · Standardzweig: %s · hier ausgecheckt: %s" % (remote, standard or "?", zweig_jetzt or "?"))

    # --- 2 Das Paket ins Projekt
    paket = os.path.join(wurzel, "cloud")
    if os.path.normcase(eigen) != os.path.normcase(paket):
        fehlt = [n for n in PAKET_PFLICHT if not os.path.isfile(os.path.join(eigen, n))]
        if fehlt:
            print("ABBRUCH: im Paket fehlt " + ", ".join(fehlt))
            return 1
        os.makedirs(paket, exist_ok=True)
        for n in sorted(os.listdir(eigen)):
            q = os.path.join(eigen, n)
            if os.path.isfile(q) and not n.endswith(".pyc"):
                shutil.copy2(q, os.path.join(paket, n))
        print("  Paket nach %s kopiert" % paket)
    fehlt = [n for n in PAKET_PFLICHT if not os.path.isfile(os.path.join(paket, n))]
    if fehlt:
        print("ABBRUCH: in %s fehlt %s" % (paket, ", ".join(fehlt)))
        return 1
    print("  Regeln: " + fassung(paket))

    lokal = os.path.join(wurzel, ".claude", "weiter.json")
    try:
        lokal_an = lies_json(lokal).get("aktiv") is True
    except Exception:
        lokal_an = False
    if lokal_an and not zurueck:
        print("  !! Dieses Projekt ist AUCH LOKAL als Solo- oder Ego-Haus eingeschaltet (.claude/weiter.json).")
        print("     Dann arbeiten zwei Produktionen an einem Projekt: die lokale auf ihrem Zweig, die Cloud")
        print("     auf ihrem. Soll es nur noch in der Cloud laufen, nimm das lokale Haus mit")
        print("     ZURUECKNEHMEN.cmd zurück und schließ sein Fenster.")

    ordner = os.path.join(wurzel, ".claude")
    os.makedirs(ordner, exist_ok=True)
    einst = os.path.join(ordner, "settings.json")
    auftrag = os.path.join(ordner, "cloud.json")
    geaendert = []

    # --- 3 Die Haken
    o = {}
    if os.path.exists(einst):
        try:
            o = lies_json(einst)
        except Exception:
            print("ABBRUCH: %s ist kein lesbares JSON. Nichts geändert." % einst)
            return 1
        sich = einst + ".vor-cloud-" + datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
        shutil.copy2(einst, sich)
        print("  Sicherung: " + sich)
    if not isinstance(o, dict):
        o = {}
    hooks = o.setdefault("hooks", {})
    stop = [h for h in hooks.get("Stop", []) if not enthaelt(h, MARKE_STOP)]
    vor = [h for h in hooks.get("PreToolUse", []) if not enthaelt(h, MARKE_DIALOG)]
    fremd_ps = any(enthaelt(h, ".ps1") for h in stop + vor)
    env = o.setdefault("env", {})
    if zurueck:
        hooks["Stop"], hooks["PreToolUse"] = stop, vor
        env.pop(DECKEL_VAR, None)
    else:
        hooks["Stop"] = stop + [{"hooks": [{"type": "command", "command": BEFEHL_STOP, "timeout": 30}]}]
        hooks["PreToolUse"] = vor + [{"matcher": "AskUserQuestion",
                                      "hooks": [{"type": "command", "command": BEFEHL_DIALOG, "timeout": 20}]}]
        # Claude Code übergeht einen Stop-Haken nach acht Fortsetzungen in Folge (Vorgabe).
        # Lokal nie beobachtet; in der Cloud soll die eigene Obergrenze gelten, nicht eine fremde.
        env[DECKEL_VAR] = str(grenze + 5)
    for k in [k for k in ("Stop", "PreToolUse") if not hooks.get(k)]:
        hooks.pop(k)
    if not hooks:
        o.pop("hooks")
    if not env:
        o.pop("env")
    schreib_json(einst, o)
    try:
        lies_json(einst)
    except Exception:
        print("FEHLER: die geschriebene Einstellung ist nicht lesbar. Sicherung zurückspielen!")
        return 1
    geaendert.append(".claude/settings.json")
    print("  Haken %s: %s" % ("entfernt" if zurueck else "eingetragen", einst))
    if fremd_ps:
        print("  ⚠ In derselben Datei stehen PowerShell-Haken (lokales Solo/Ego). In der Cloud gibt es")
        print("    kein PowerShell: sie schlagen dort fehl, ohne etwas aufzuhalten. Läuft das Projekt")
        print("    nicht mehr lokal, nimm sie mit ZURUECKNEHMEN.cmd heraus.")

    # --- 4 Auftrag und Ausschluss der Halt-Marke
    a = {}
    if os.path.exists(auftrag):
        try:
            a = lies_json(auftrag)
        except Exception:
            a = {}
    if zurueck:
        a["aktiv"] = False
    else:
        a.setdefault("auftrag", AUFTRAG)
        a.setdefault("zweig", "claude/haus")
        a["aktiv"] = True
        a["grenze"] = grenze
        a["blockMinuten"] = block_min
    schreib_json(auftrag, a)
    geaendert.append(".claude/cloud.json")
    print("  Auftrag: aktiv=%s, Block %s min, Obergrenze %s, Zweig %s" % (
        a.get("aktiv"), a.get("blockMinuten"), a.get("grenze"), a.get("zweig")))

    if not zurueck:
        gi = os.path.join(wurzel, ".gitignore")
        vorher = ""
        if os.path.exists(gi):
            with open(gi, encoding="utf-8", errors="replace") as f:
                vorher = f.read()
        if ".claude/weiter-halt" not in [z.strip() for z in vorher.splitlines()]:
            with open(gi, "a", encoding="utf-8", newline="\n") as f:
                if vorher and not vorher.endswith("\n"):
                    f.write("\n")
                f.write("# Halt-Marke des Cloud-Hauses - Laufzustand, gehört in keinen Commit\n.claude/weiter-halt\n")
            print("  .gitignore: .claude/weiter-halt ausgeschlossen")
        geaendert.append(".gitignore")
        # Die Ampel und die Fragen MÜSSEN committet werden können - sonst sieht sie niemand.
        for pfad in (".claude/ampel", "OWNER-FRAGEN.md", "cloud/fortsetzer.py"):
            c, quelle = git(wurzel, "check-ignore", "-v", "--no-index", pfad)
            if c == 0 and quelle and "info/exclude" not in quelle.replace("\\", "/"):
                print("  !! %s wird von git ausgeschlossen (%s). Nimm die Regel heraus, sonst" % (pfad, quelle))
                print("     kommt es nie aus der Cloud zurück.")

    # --- 5 Committen und pushen
    # Nur die Dateien des Pakets, kein ganzer Ordner: ein Zwischenspeicher von Python
    # (__pycache__) gehört in keinen Commit.
    paketdateien = sorted("cloud/" + n for n in os.listdir(paket)
                          if os.path.isfile(os.path.join(paket, n)) and not n.endswith(".pyc"))
    pfade = paketdateien + [".claude/settings.json", ".claude/cloud.json"] + ([".gitignore"] if not zurueck else [])
    print()
    if not standard or zweig_jetzt != standard:
        print("NICHT committet: hier ist '%s' ausgecheckt, die Cloud liest aber den Standardzweig '%s'." % (
            zweig_jetzt, standard or "?"))
        print("Wechsle auf den Standardzweig und ruf das hier noch einmal auf, oder committe von Hand:")
        print("  git add " + " ".join(pfade))
        print("  git commit -m \"Cloud-Haus eingerichtet\" -- " + " ".join(pfade))
        print("  git push origin " + (standard or "<Standardzweig>"))
    elif frage_ja("Diese Dateien jetzt auf '%s' committen und nach GitHub pushen?" % standard, ja):
        git(wurzel, "add", "--", *pfade, pruefen=True)
        c, aus = git(wurzel, "diff", "--cached", "--quiet", "--", *pfade)
        if c == 0:
            print("  nichts zu committen - alles war schon so.")
        else:
            msg = "Cloud-Haus %s (%s)" % ("zurückgenommen" if zurueck else "eingerichtet", fassung(paket))
            git(wurzel, "commit", "-m", msg, "--", *pfade, pruefen=True)
            print("  committet: " + msg)
        c, aus = git(wurzel, "push", "origin", standard)
        if c != 0:
            print("  !! Push fehlgeschlagen - von Hand nachholen: git push origin " + standard)
        else:
            print("  gepusht nach origin/" + standard)
    else:
        print("Nicht committet. Von Hand:")
        print("  git add " + " ".join(pfade))
        print("  git commit -m \"Cloud-Haus eingerichtet\" -- " + " ".join(pfade))
        print("  git push origin " + standard)

    print()
    if zurueck:
        print("ZURÜCKGENOMMEN. Die Routine läuft aber weiter, bis du sie anhältst:")
        print("  claude.ai/code/routines -> die Routine öffnen -> pausieren oder löschen.")
        return 0
    print("JETZT DIE ROUTINE ANLEGEN (einmal): ROUTINE-ANLEGEN.cmd in " + paket)
    print("  Es legt sie mit Takt 7 */3 * * * (alle drei Stunden) und diesem Auftrag an:")
    print()
    for z in ANSTOSS.format(zweig=a.get("zweig")).splitlines():
        print("    " + z)
    print()
    print("  Blockzeit %d min + 45 min Puffer muss kürzer sein als der Abstand der Läufe." % block_min)
    print("  Zur Sicherheit, von Hand: in der Umgebung 'Default' (claude.ai/code) die Variable")
    print("  %s=%s - in der Projekteinstellung steht sie schon." % (DECKEL_VAR, grenze + 5))
    print()
    print("Nachsehen, was die Cloud tut: CLOUD-STAND.cmd in " + paket)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(haupt(sys.argv[1:]))
    except RuntimeError as x:
        print("FEHLER: %s" % x)
        sys.exit(1)
