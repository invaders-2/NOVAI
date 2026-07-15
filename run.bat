@echo off
cd /d "%~dp0"

set "PYEXE=python"
if exist "%~dp0python\python.exe" set "PYEXE=%~dp0python\python.exe"

echo Starting ComfyUI-API-Modelscope...
echo Visit: http://127.0.0.1:3000/
echo Press Ctrl+C to stop.
echo.

start /b cmd /c "timeout /t 3 /nobreak >nul && start http://127.0.0.1:3000/"
"%PYEXE%" main.py

echo.
echo Server stopped.
pause
