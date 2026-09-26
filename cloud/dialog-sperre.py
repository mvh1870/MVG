#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""dialog-sperre.py - ein PreToolUse-Haken, der in einem Cloud-Block das AUSWAHLWERKZEUG abweist.

Lokal gemessen (2026-09-14/15): ein Haus stand 6 h 31 min in einem Auswahldialog, den niemand
sah. In einem Arbeitsblock, den eine Routine startet, sitzt erst recht niemand davor. Die
Owner-Datei kann es besser: jede Frage trägt eine Vorgabe und eine Frist, und nach der Frist
gilt die Vorgabe.

Der Haken ERFINDET NICHTS und SCHREIBT NICHTS. Er weist ab und legt dem Haus den fertigen Text
in genau der Form vor, die die Werkzeuge des Owners lesen - ohne Rauten und Sternchen.

!! ER DARF DAS HAUS NIE KAPUTTMACHEN. Jeder Fehler, jede unlesbare Eingabe, jedes fremde
   Werkzeug endet mit 0, also durchlassen. Abgewiesen wird nur das Auswahlwerkzeug.

    python3 cloud/dialog-sperre.py    als Haken (Haken-JSON auf stdin)
"""
import datetime
import json
import os
import re
import sys

FRIST_STUNDEN = 12
DATEI = "OWNER-FRAGEN.md"


def wurzel(e):
    for k in (os.environ.get("CLAUDE_PROJECT_DIR", ""), e.get("cwd", ""), os.getcwd()):
        if k and os.path.isdir(k):
            return k
    return os.getcwd()


def naechste_kennung(pfad, tag):
    """<JJJJ-MM-TT>-<n>, n eins über der höchsten Nummer dieses Tages in der Datei."""
    n = 0
    try:
        with open(pfad, encoding="utf-8", errors="replace") as f:
            for m in re.finditer(r"FRAGE\s+" + re.escape(tag) + r"-(\d+)", f.read()):
                n = max(n, int(m.group(1)))
    except Exception:
        pass
    return "%s-%d" % (tag, n + 1)


def kurz(t, n):
    t = re.sub(r"\s+", " ", str(t or "")).strip()
    return t if len(t) <= n else t[: n - 1] + "-"


def ablehnung(e):
    frage, wege = "", []
    try:
        q = (e.get("tool_input") or {}).get("questions") or []
        if q:
            frage = str(q[0].get("question") or "")
            wege = [str(o.get("label") or "") for o in (q[0].get("options") or []) if o.get("label")]
    except Exception:
        pass
    if not frage:
        frage = "(die Frage stand im Dialog)"
    jetzt = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0)
    frist = jetzt + datetime.timedelta(hours=FRIST_STUNDEN)
    ziel = os.path.join(wurzel(e), DATEI)
    kennung = naechste_kennung(ziel, jetzt.strftime("%Y-%m-%d"))
    pt = "·"
    z = ["!! OWNER-DIALOG GESPERRT - in einem Arbeitsblock sitzt niemand vor dem Fenster.",
         "",
         "Ein offener Dialog endet nur durch einen Klick. Lokal gemessen: ein Haus stand so 6 h 31 min.",
         "Stell die Frage schriftlich. Die Datei trägt Vorgabe und Frist: antwortet niemand, gilt",
         "nach %d Stunden die Vorgabe - du bleibst nie stehen." % FRIST_STUNDEN,
         "",
         "HÄNG DAS AN " + ziel + " (genau in dieser Form, ohne Rauten und Sternchen):",
         "",
         "FRAGE %s %s %s %s %s" % (kennung, pt, jetzt.isoformat(), pt, kurz(frage, 300))]
    buchst = "abcdef"
    if wege:
        for i, w in enumerate(wege[:6]):
            z.append("  %s) %s" % (buchst[i], kurz(w, 200)))
    else:
        z += ["  a) ...", "  b) ..."]
    z.append("  VORGABE: a %s FRIST: %s" % (pt, frist.isoformat()))
    z += ["",
          "Die Vorgabe a ist geraten - nimm die, mit der du weiterarbeiten kannst.",
          "Danach dieselbe Frage als gewöhnlichen Text in den Chat, committen, pushen, und an",
          "einem anderen Posten weiterarbeiten. Ist keiner mehr offen: hinlegen (Halt-Marke)."]
    return "\n".join(z) + "\n"


def haupt():
    if os.environ.get("CLAUDE_CODE_REMOTE", "") != "true":
        return 0
    roh = sys.stdin.read()
    if not roh.strip():
        return 0
    e = json.loads(roh)
    if not isinstance(e, dict) or e.get("tool_name") != "AskUserQuestion":
        return 0
    sys.stderr.write(ablehnung(e))
    return 2          # PreToolUse: 2 hält den Aufruf an, stderr geht an die Sitzung


if __name__ == "__main__":
    for strom in (sys.stdin, sys.stdout, sys.stderr):
        try:
            strom.reconfigure(encoding="utf-8")
        except Exception:
            pass
    try:
        code = haupt()
    except Exception:
        code = 0
    sys.exit(code)
