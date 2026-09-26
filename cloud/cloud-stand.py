# -*- coding: utf-8 -*-
"""cloud-stand.py - was tut das Cloud-Haus? Gelesen aus GitHub, ohne die Cloud zu öffnen.

Holt den Arbeitszweig (git fetch) und zeigt: die Ampelzeile und ihr Alter, die letzten Commits,
wie viele davon noch nicht im Standardzweig sind, und die offenen Owner-Fragen mit Restfrist.
Ändert nichts, außer dass es den Arbeitszweig holt.

    python cloud-stand.py [<Projekt>]

Die Zahl, auf die es ankommt, ist das Alter der Ampel: jeder Block schreibt sie in jedem Zug.
Ist sie älter als ein Takt der Routine, ist seitdem kein Block gelaufen.
"""
import datetime
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True   # kein __pycache__ im Projekt, der in einen Commit geraten könnte
TAKT_STUNDEN = 3        # so steht es in der Anleitung; weicht die Routine ab, hier anpassen

for strom in (sys.stdout, sys.stderr):
    try:
        strom.reconfigure(encoding="utf-8")
    except Exception:
        pass


def git(wurzel, *args):
    r = subprocess.run(["git", "-C", wurzel] + list(args), capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    return r.returncode, (r.stdout or "").rstrip("\n")


def zeit_lesen(s):
    s = str(s or "").strip().replace("Z", "+00:00").replace(" UTC", "+00:00")
    s = re.sub(r"^(\d{4}-\d{2}-\d{2}) ", r"\1T", s)
    try:
        t = datetime.datetime.fromisoformat(s)
    except ValueError:
        return None
    return t if t.tzinfo else t.astimezone()


def dauer(sekunden):
    m = int(abs(sekunden) // 60)
    return "%d min" % m if m < 120 else "%.1f h" % (m / 60.0)


def lade_fragen_leser():
    eigen = os.path.dirname(os.path.abspath(__file__))
    for p in (os.path.join(eigen, "fragen-offen.py"), os.path.join(eigen, "..", "solo", "fragen-offen.py")):
        if os.path.isfile(p):
            spec = importlib.util.spec_from_file_location("fragen_offen", p)
            m = importlib.util.module_from_spec(spec)
            stdout = sys.stdout
            spec.loader.exec_module(m)
            # Das Modul biegt stdout beim Laden auf einen eigenen Wrapper um. Zurückbiegen, und
            # den Wrapper lösen - sonst schließt er beim Aufräumen den gemeinsamen Puffer.
            fremd, sys.stdout = sys.stdout, stdout
            if fremd is not stdout:
                try:
                    fremd.detach()
                except Exception:
                    pass
            return m
    return None


def haupt(argv):
    eigen = os.path.dirname(os.path.abspath(__file__))
    wurzel = os.path.abspath(argv[0] if argv else os.path.join(eigen, ".."))
    zweig = "claude/haus"
    try:
        with open(os.path.join(wurzel, ".claude", "cloud.json"), encoding="utf-8-sig") as f:
            zweig = json.load(f).get("zweig") or zweig
    except Exception:
        pass
    jetzt = datetime.datetime.now().astimezone()
    print("CLOUD-STAND  %s  ·  Zweig %s  ·  gelesen %s" % (wurzel, zweig, jetzt.strftime("%Y-%m-%d %H:%M")))
    code, _ = git(wurzel, "fetch", "--quiet", "origin", zweig)
    if code != 0:
        print("  !! Holen von GitHub fehlgeschlagen - gezeigt wird der zuletzt geholte Stand, falls es einen gibt.")
    ref = "origin/" + zweig
    code, _ = git(wurzel, "rev-parse", "--verify", "--quiet", ref)
    if code != 0:
        print("  Den Zweig %s gibt es auf GitHub noch nicht - es ist noch kein Block gelaufen," % zweig)
        print("  oder die Routine hat nichts gepusht. Nachsehen: claude.ai/code/routines")
        return 0

    # Die Ampel
    print()
    code, ampel = git(wurzel, "show", ref + ":.claude/ampel")
    code2, ampel_zeit = git(wurzel, "log", "-1", "--format=%cI", ref, "--", ".claude/ampel")
    urteil = ""
    if code != 0 or not ampel.strip():
        print("  AMPEL  fehlt auf dem Zweig - kein Block hat sie geschrieben.")
        urteil = "!! Die Blöcke schreiben ihre Ampel nicht. Einen Lauf öffnen und nachsehen."
    else:
        zeile = ampel.strip().splitlines()[-1]
        print("  AMPEL  " + zeile)
        t = zeit_lesen(ampel_zeit)
        if t:
            alter = (jetzt - t).total_seconds()
            print("         committet vor %s (%s)" % (dauer(alter), t.astimezone().strftime("%Y-%m-%d %H:%M")))
            m = re.search(r"Block bis\s+(\S+(?:\s+\d{2}:\d{2}(?::\d{2})?)?(?:\s*(?:UTC|[+-]\d{2}:?\d{2}))?)", zeile)
            bis = zeit_lesen(m.group(1)) if m else None
            if bis and bis > jetzt:
                urteil = "Ein Block läuft vermutlich (Ampel sagt: bis %s)." % bis.astimezone().strftime("%H:%M")
            elif alter > (TAKT_STUNDEN * 3600 + 3 * 3600):
                urteil = ("!! Seit %s kein Zug mehr. Die Routine prüfen (claude.ai/code/routines): läuft sie,"
                          " ist die Tagesgrenze erreicht, ist das Kontingent aus?" % dauer(alter))
            else:
                urteil = "Kein Block läuft gerade; der nächste kommt nach Plan."
            farbe = zeile.split("·")[0].strip().lower()
            if farbe.startswith("rot") or "🔴" in zeile:
                urteil += "  Die Ampel steht auf ROT: das Haus braucht dich (Grund in der Zeile)."

    # Die Commits
    print()
    _, n24 = git(wurzel, "rev-list", "--count", "--since=24 hours ago", ref)
    code, basis = git(wurzel, "symbolic-ref", "--short", "refs/remotes/origin/HEAD")
    offen_commits = ""
    if code == 0 and basis:
        _, offen_commits = git(wurzel, "rev-list", "--count", basis + ".." + ref)
    print("  COMMITS  %s in 24 h%s" % (n24 or "?", ("  ·  %s noch nicht in %s" % (offen_commits, basis)) if offen_commits else ""))
    _, log = git(wurzel, "log", "-8", "--format=%cd  %s", "--date=format-local:%m-%d %H:%M", ref)
    for z in log.splitlines():
        print("    " + z[:110])

    # Die Fragen
    print()
    code, fragen_text = git(wurzel, "show", ref + ":OWNER-FRAGEN.md")
    if code != 0:
        print("  FRAGEN  keine Owner-Datei auf dem Zweig - noch nie gefragt.")
    else:
        leser = lade_fragen_leser()
        if not leser:
            print("  FRAGEN  (fragen-offen.py fehlt neben diesem Werkzeug - Datei nicht ausgewertet)")
        else:
            with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
                f.write(fragen_text + "\n")
                tmp = f.name
            try:
                fragen = leser.lies(tmp)
            finally:
                os.remove(tmp)
            offen = [q for q in fragen if not q["antwort"] and not q["inkraft"]]
            print("  FRAGEN  %d gestellt, %d offen" % (len(fragen), len(offen)))
            for q in offen:
                frist = leser.parse_zeit(q["frist"]) if q["frist"] else None
                rest = ""
                if frist:
                    d = (frist - jetzt).total_seconds()
                    rest = ("noch " + dauer(d)) if d > 0 else ("ABGELAUFEN seit %s - der nächste Block setzt die Vorgabe in Kraft" % dauer(d))
                print("    %s  %s" % (q["kennung"], q["frage"][:100]))
                for w in q["wege"]:
                    print("        " + w)
                print("        Vorgabe %s · Frist %s  %s" % (q["vorgabe"] or "-", q["frist"] or "-", rest))
            if offen:
                print("    Antworten: im Chat des Laufs (claude.ai/code), je Frage mit Kennung und Weg.")
                print("    Die Sitzung trägt die ANTWORT-Zeile ein und pusht sie; der nächste Block liest sie.")

    print()
    print("  URTEIL  " + (urteil or "-"))
    return 0


if __name__ == "__main__":
    sys.exit(haupt(sys.argv[1:]))
