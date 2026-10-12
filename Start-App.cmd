@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -File "%~dp0Start-App.ps1"
pause
