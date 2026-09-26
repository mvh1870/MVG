@echo off
rem ===================================================================
rem  CLOUD-EINRICHTEN - ein Projekt in Arbeitsbloecken in der Cloud laufen lassen.
rem
rem  Projektordner: der Ordner UEBER diesem hier, oder das erste Argument
rem  (Projektordner auf diese Datei ziehen).
rem  Traegt zwei Haken in .claude\settings.json ein, legt .claude\cloud.json an,
rem  und committet und pusht beides auf den Standardzweig - nur nach Rueckfrage.
rem  Die Haken tun nur in der Cloud etwas; auf diesem Rechner nichts.
rem
rem  Rueckgaengig:  CLOUD-EINRICHTEN.cmd <Projekt> --zurueck
rem ===================================================================
setlocal
chcp 65001 >nul
set "WURZEL=%~dp0.."
if not "%~1"=="" set "WURZEL=%~1"
for %%I in ("%WURZEL%") do set "WURZEL=%%~fI"
python "%~dp0cloud-einrichten.py" "%WURZEL%" %2 %3 %4 %5
if errorlevel 9009 py "%~dp0cloud-einrichten.py" "%WURZEL%" %2 %3 %4 %5
echo.
pause
