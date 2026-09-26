# -*- coding: utf-8 -*-
"""cloud-routine.py - legt die Routine an, die das Cloud-Haus alle drei Stunden anstößt.

Läuft auf einem Rechner des Owners, NACH CLOUD-EINRICHTEN. Eine Routine lässt sich nur mit der
Anmeldung von Claude Code anlegen; dieses Werkzeug hält keine Zugangsdaten und sieht keine. Es
prüft, baut die Routine genau auf und übergibt sie dem Claude Code dieses Rechners, das sie mit
seinem Routinen-Werkzeug anlegt. Die Anmeldung dort ist die des Owners, einmal, im Browser.

Ablauf:
  1. prüft, dass die Einrichtung auf GitHub im Standardzweig liegt - sonst fände der erste
     Block weder Haken noch Regeln;
  2. fragt nach dem Modell und zeigt, was angelegt wird;
  3. findet Claude Code (im Pfad oder das der Desktop-App) und prüft die Anmeldung;
  4. lässt es die Routine anlegen - ohne Rückfrage, denn bestätigt hat der Owner hier. Gibt es
     schon eine Routine desselben Namens, wird keine zweite angelegt;
  5. klappt das nicht, öffnet es dieselbe Bitte in einem Fenster von Claude Code, in dem der
     Owner selbst antworten kann.

    python cloud-routine.py [<Projekt>] [--modell opus|sonnet|fable] [--ja] [--ohne-lauf]
                            [--cron "<5 Felder, UTC>"] [--cli <Pfad zu claude>]
"""
import argparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys

for strom in (sys.stdout, sys.stderr):
    try:
        strom.reconfigure(encoding="utf-8")
    except Exception:
        pass

MODELLE = {"opus": ("claude-opus-5-5", "Opus 5.5"),
           "sonnet": ("claude-sonnet-5", "Sonnet 5"),
           "fable": ("claude-fable-5-1", "Fable 5.1")}
CRON = "7 */3 * * *"      # alle drei Stunden, sieben nach - in UTC, der Abstand ist derselbe
# Kein Auswahlwerkzeug in der Liste: der Owner-Dialog ist damit schon baulich aus, der Haken
# dialog-sperre.py bleibt das zweite Netz.
WERKZEUGE = ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "WebFetch", "WebSearch"]
ANSTOSS = ("Du bist ein Arbeitsblock dieser Produktion. Dein Arbeitszweig ist {zweig}.\n"
           "Lies ZUERST die Datei cloud/CLOUD-REGELN.md in diesem Repository vollständig. Sie ist dein\n"
           "stehender Auftrag vom Owner. Arbeite danach nach ihr, beginnend mit ihrem ANLAUF.")
URL_MUSTER = re.compile(r"https://claude\.ai/code/routines/[A-Za-z0-9_\-]+")


def git(wurzel, *args):
    r = subprocess.run(["git", "-C", wurzel] + list(args), capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    return r.returncode, (r.stdout or "").strip()


def github_https(remote):
    """git@github.com:o/r.git, ssh://git@github.com/o/r, https://github.com/o/r.git -> https://github.com/o/r"""
    m = re.match(r"^(?:https://(?:[^@/]+@)?github\.com/|git@github\.com:|ssh://git@github\.com/)"
                 r"([^/]+)/([^/]+?)(?:\.git)?/?$", remote.strip())
    return "https://github.com/%s/%s" % (m.group(1), m.group(2)) if m else ""


def finde_cli(vorgabe):
    if vorgabe:
        return vorgabe if os.path.isfile(vorgabe) else ""
    p = shutil.which("claude")
    if p:
        return p
    # Die Desktop-App bringt ihr eigenes Claude Code mit; das jüngste nehmen.
    kand = glob.glob(os.path.join(os.environ.get("APPDATA", ""), "Claude", "claude-code", "*", "claude.exe"))

    def version(p):
        v = os.path.basename(os.path.dirname(p))
        return [int(x) if x.isdigit() else 0 for x in re.split(r"[.\-]", v)]
    kand.sort(key=version)
    return kand[-1] if kand else ""


def cli_befehl(cli):
    return [sys.executable, cli] if cli.endswith(".py") else [cli]


def angemeldet(cli, wurzel):
    try:
        r = subprocess.run(cli_befehl(cli) + ["auth", "status"], capture_output=True, text=True,
                           encoding="utf-8", errors="replace", cwd=wurzel, timeout=60,
                           stdin=subprocess.DEVNULL)
        return json.loads(r.stdout).get("loggedIn") is True
    except Exception:
        return False


def frage(text, vorgabe, ja):
    if ja:
        print(text + " " + vorgabe + "  (--ja)")
        return vorgabe
    try:
        a = input(text + " ").strip()
    except EOFError:
        a = ""
    return a or vorgabe


def bitte(name, koerper, lauf):
    """Der Auftrag an Claude Code. Die Umgebung kennt nur /schedule - deshalb beginnt er damit."""
    k = json.dumps(koerper, ensure_ascii=False, indent=2)
    z = ["/schedule Lege genau EINE Routine an. Frag nicht zurück: alle Angaben stehen hier, und der "
         "Owner hat sie eben im Werkzeug bestätigt.",
         "",
         "1. Rufe RemoteTrigger mit action list auf. Gibt es schon eine Routine mit dem Namen "
         "„%s“, lege KEINE neue an und antworte nur mit der Zeile  VORHANDEN: <ihre URL>." % name,
         "2. Sonst rufe RemoteTrigger mit action create und GENAU diesem Körper auf. Setze nur zwei "
         "Werte ein: environment_id = die Umgebung aus deiner Liste, deren Name mit „Default“ "
         "beginnt, sonst die erste; uuid = eine frische UUID v4 in Kleinbuchstaben. Ändere sonst nichts, "
         "auch nicht den Text der Nachricht.",
         "",
         k,
         ""]
    if lauf:
        z.append("3. Rufe danach RemoteTrigger mit action run für die neue Routine auf (ein erster Lauf).")
    z += ["Antworte zum Schluss mit genau diesen Zeilen und sonst nichts:",
          "ROUTINE-URL: <URL der Routine>",
          "NAECHSTER-LAUF: <Zeitpunkt, den der Server nennt>"]
    if lauf:
        z.append("ERSTER-LAUF: <gestartet oder der Fehler>")
    z.append("Geht etwas schief: eine Zeile  FEHLER: <was genau>.")
    return "\n".join(z)


def haupt(argv):
    eigen = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser()
    ap.add_argument("projekt", nargs="?", default=os.path.join(eigen, ".."))
    ap.add_argument("--modell", choices=sorted(MODELLE))
    ap.add_argument("--cron", default=CRON)
    ap.add_argument("--cli", default="")
    ap.add_argument("--ja", action="store_true")
    ap.add_argument("--ohne-lauf", action="store_true")
    ap.add_argument("--nur-zeigen", action="store_true", help="nichts anlegen, nur die Bitte ausgeben")
    a = ap.parse_args(argv)
    wurzel = os.path.abspath(a.projekt)
    print("Projekt: " + wurzel)

    # --- 1 Liegt die Einrichtung auf GitHub?
    # Die Adresse, wie sie eingetragen ist - nicht nach insteadOf umgeschrieben.
    c, remote = git(wurzel, "config", "--get", "remote.origin.url")
    repo = github_https(remote) if c == 0 else ""
    if not repo:
        print("ABBRUCH: kein GitHub-Remote 'origin' (gefunden: %s)." % (remote or "keiner"))
        return 1
    try:
        with open(os.path.join(wurzel, ".claude", "cloud.json"), encoding="utf-8-sig") as f:
            auftrag = json.load(f)
    except Exception:
        print("ABBRUCH: .claude\\cloud.json fehlt - zuerst CLOUD-EINRICHTEN.cmd.")
        return 1
    if auftrag.get("aktiv") is not True:
        print("ABBRUCH: in .claude\\cloud.json steht aktiv nicht auf true - das Haus ist zurückgenommen.")
        return 1
    zweig = auftrag.get("zweig") or "claude/haus"
    c, kopf = git(wurzel, "symbolic-ref", "--short", "refs/remotes/origin/HEAD")
    if c != 0:
        git(wurzel, "remote", "set-head", "origin", "--auto")
        c, kopf = git(wurzel, "symbolic-ref", "--short", "refs/remotes/origin/HEAD")
    if c != 0 or "/" not in kopf:
        print("ABBRUCH: der Standardzweig auf GitHub ist nicht zu ermitteln (git remote set-head origin --auto).")
        return 1
    standard = kopf.split("/", 1)[1]
    git(wurzel, "fetch", "--quiet", "origin", standard)
    fehlt = []
    for pfad in ("cloud/CLOUD-REGELN.md", "cloud/fortsetzer.py", "cloud/dialog-sperre.py", ".claude/cloud.json"):
        if git(wurzel, "cat-file", "-e", "%s:%s" % (kopf, pfad))[0] != 0:
            fehlt.append(pfad)
    c, einst = git(wurzel, "show", "%s:.claude/settings.json" % kopf)
    if c != 0 or "cloud/fortsetzer.py" not in einst:
        fehlt.append(".claude/settings.json mit dem Cloud-Haken")
    if fehlt:
        print("ABBRUCH: auf GitHub im Standardzweig '%s' fehlt: %s" % (standard, ", ".join(fehlt)))
        print("  Zuerst CLOUD-EINRICHTEN.cmd und die Frage nach dem Pushen mit ja beantworten.")
        return 1
    print("  Einrichtung liegt auf GitHub: %s, Zweig %s" % (repo, standard))

    # --- 2 Modell und Überblick
    if a.modell:
        wahl = a.modell
    else:
        print()
        print("  Mit welchem Modell soll jeder Block arbeiten?")
        print("    1 = Opus 5.5    2 = Sonnet 5    3 = Fable 5.1")
        t = frage("  Wahl [1]:", "1", a.ja)
        wahl = {"1": "opus", "2": "sonnet", "3": "fable"}.get(t, "")
        if not wahl:
            print("ABBRUCH: '%s' ist keine der drei Wahlen." % t)
            return 1
    modell, modell_name = MODELLE[wahl]
    name = "Cloud-Haus " + repo.rsplit("/", 1)[1]
    koerper = {
        "name": name,
        "cron_expression": a.cron,
        "enabled": True,
        "job_config": {"ccr": {
            "environment_id": "ENVIRONMENT_ID",
            "session_context": {"model": modell,
                                "sources": [{"git_repository": {"url": repo}}],
                                "allowed_tools": WERKZEUGE},
            "events": [{"data": {"uuid": "UUID", "session_id": "", "type": "user",
                                 "parent_tool_use_id": None,
                                 "message": {"content": ANSTOSS.format(zweig=zweig), "role": "user"}}}]}}}
    print()
    print("  ANGELEGT WIRD:")
    print("    Name:       " + name)
    print("    Repository: " + repo)
    print("    Takt:       %s (UTC)%s" % (a.cron, "  = alle drei Stunden, sieben nach" if a.cron == CRON else ""))
    print("    Modell:     " + modell_name)
    print("    Werkzeuge:  " + ", ".join(WERKZEUGE) + "  (kein Auswahldialog)")
    print("    Umgebung:   die Standardumgebung deines Kontos")
    print("    Auftrag:    " + ANSTOSS.format(zweig=zweig).replace("\n", "\n                "))
    lauf = not a.ohne_lauf
    text = bitte(name, koerper, lauf)
    if a.nur_zeigen:
        print()
        print(text)
        return 0

    # --- 3 Claude Code und seine Anmeldung
    cli = finde_cli(a.cli)
    if not cli:
        print("ABBRUCH: Claude Code nicht gefunden - weder 'claude' im Pfad noch das der Desktop-App.")
        return 1
    print()
    print("  Claude Code: " + cli)
    if not angemeldet(cli, wurzel):
        print("  !! Dieses Claude Code ist nicht angemeldet. Die Desktop-App meldet nur ihre eigenen")
        print("     Sitzungen an; für eine Routine braucht es die Anmeldung einmal hier.")
        if frage("  Jetzt anmelden (öffnet den Browser)? [J/n]", "j", a.ja).lower() not in ("j", "ja", "y"):
            print("Abgebrochen, nichts angelegt.")
            return 1
        subprocess.call(cli_befehl(cli) + ["auth", "login", "--claudeai"], cwd=wurzel)
        if not angemeldet(cli, wurzel):
            print("ABBRUCH: auch danach nicht angemeldet. Nichts angelegt.")
            return 1
        print("  angemeldet.")
    if frage("  Routine jetzt anlegen%s? [J/n]" % (" und einen ersten Lauf starten" if lauf else ""),
             "j", a.ja).lower() not in ("j", "ja", "y"):
        print("Abgebrochen, nichts angelegt.")
        return 1

    # --- 4 Anlegen lassen
    print("  Claude Code legt an (bis zu fünf Minuten) ...")
    try:
        r = subprocess.run(cli_befehl(cli) + ["-p", "--allowedTools", "RemoteTrigger"], input=text,
                           capture_output=True, text=True, encoding="utf-8", errors="replace",
                           cwd=wurzel, timeout=600)
        aus = (r.stdout or "") + (r.stderr or "")
    except subprocess.TimeoutExpired:
        aus = "FEHLER: keine Antwort binnen zehn Minuten"
    url = URL_MUSTER.search(aus)
    zeilen = [z.strip() for z in aus.splitlines()
              if re.match(r"^\s*(ROUTINE-URL|VORHANDEN|NAECHSTER-LAUF|ERSTER-LAUF|FEHLER):", z)]
    print()
    for z in zeilen:
        print("  " + z)
    if url and not any(z.startswith("FEHLER") for z in zeilen):
        print()
        if any(z.startswith("VORHANDEN") for z in zeilen):
            print("FERTIG - die Routine gab es schon; es wurde keine zweite angelegt.")
        else:
            print("FERTIG - die Routine steht:")
        print("  " + url.group(0))
        print("  Dort siehst du jeden Lauf. Nachsehen ohne die Cloud: CLOUD-STAND.cmd")
        return 0

    # --- 5 Hat nicht geklappt: dieselbe Bitte im Fenster, der Owner antwortet selbst
    print("  !! Claude Code hat die Routine nicht bestätigt. Seine letzten Zeilen:")
    for z in aus.strip().splitlines()[-15:]:
        print("     " + z[:160])
    print()
    if frage("  Dieselbe Bitte in einem Fenster von Claude Code öffnen, wo du antworten kannst? [J/n]",
             "n" if a.ja else "j", a.ja).lower() in ("j", "ja", "y"):
        subprocess.call(cli_befehl(cli) + [text], cwd=wurzel)
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(haupt(sys.argv[1:]))
