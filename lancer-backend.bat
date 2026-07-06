@echo off
rem ── Lance le backend local du CV et ouvre l'admin dans le navigateur ──
cd /d "%~dp0"
echo Demarrage du backend...
start "" "http://localhost:8010/admin"
node admin\server.js
pause
