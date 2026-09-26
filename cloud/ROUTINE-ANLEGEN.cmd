@echo off
rem ===================================================================
rem  ROUTINE-ANLEGEN - legt die Routine an, die das Cloud-Haus alle drei
rem  Stunden anstoesst. Erst NACH CLOUD-EINRICHTEN (mit Push).
rem
rem  Projektordner: der Ordner UEBER diesem hier, oder das erste Argument.
rem  Fragt nach dem Modell, zeigt alles, fragt vor dem Anlegen. Legt nie
rem  eine zweite Routine desselben Namens an.
rem  Braucht die Anmeldung von Claude Code auf diesem Rechner - fehlt sie,
rem  bietet es sie an (Browser).
rem ===================================================================
setlocal
chcp 65001 >nul
set "WURZEL=%~dp0.."
if not "%~1"=="" set "WURZEL=%~1"
for %%I in ("%WURZEL%") do set "WURZEL=%%~fI"
python "%~dp0cloud-routine.py" "%WURZEL%" %2 %3 %4 %5
if errorlevel 9009 py "%~dp0cloud-routine.py" "%WURZEL%" %2 %3 %4 %5
echo.
pause
