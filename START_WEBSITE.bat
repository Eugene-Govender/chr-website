@echo off
title CHR Website
echo Starting CHR Consulting Website...
start "CHR Backend" cmd /k "cd /d C:\Users\Eugene G\Desktop\CHR_PLATFORM\chr_website\backend && venv\Scripts\activate && python main.py"
timeout /t 3
start "CHR Frontend" cmd /k "cd /d C:\Users\Eugene G\Desktop\CHR_PLATFORM\chr_website\frontend && npm run dev"
echo.
echo Website starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
pause
