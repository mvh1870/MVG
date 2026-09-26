@echo off
rem ===================================================================
rem  CLOUD-STAND - was tut das Cloud-Haus? Ampel, Commits, offene Fragen.
rem  Gelesen aus GitHub (git fetch), ohne die Cloud zu oeffnen. Aendert nichts.
rem
rem  Projektordner: der Ordner UEBER diesem hier, oder das erste Argument.
rem ===================================================================
setlocal
chcp 65001 >nul
set "WURZEL=%~dp0.."
if not "%~1"=="" set "WURZEL=%~1"
for %%I in ("%WURZEL%") do set "WURZEL=%%~fI"
python "%~dp0cloud-stand.py" "%WURZEL%"
if errorlevel 9009 py "%~dp0cloud-stand.py" "%WURZEL%"
echo.
pause
