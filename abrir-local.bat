@echo off
title Navidad - Aldea del Polo Norte
cd /d "%~dp0"
echo.
echo ==========================================
echo   Navidad - Aldea del Polo Norte
echo ==========================================
echo.
echo Servidor local: http://localhost:8000
echo No cierres esta ventana mientras pruebas.
echo.
start "" "http://localhost:8000/"
python -m http.server 8000
pause
