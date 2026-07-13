@echo off
chcp 65001 >nul
setlocal
set "APP_DIR=E:\桌面\NOVAI-main"
set "LAUNCHER=E:\桌面\NOVAI-main\start.bat"
set "LOG_FILE=E:\桌面\NOVAI-main\_self_restart.log"
echo [%date% %time%] restart scheduled >> "%LOG_FILE%"
timeout /t 3 /nobreak >nul
echo [%date% %time%] stopping old process >> "%LOG_FILE%"
taskkill /F /PID 5332 >nul 2>&1
timeout /t 2 /nobreak >nul
cd /d "%APP_DIR%"
if exist "%LAUNCHER%" (
  echo [%date% %time%] starting launcher: %LAUNCHER% >> "%LOG_FILE%"
  start "ComfyUI-API-Modelscope" /D "%APP_DIR%" cmd /k call "%LAUNCHER%"
) else (
  echo [%date% %time%] launcher missing, fallback to python main.py >> "%LOG_FILE%"
  if exist "%APP_DIR%\python\python.exe" (
    start "ComfyUI-API-Modelscope" /D "%APP_DIR%" cmd /k ""%APP_DIR%\python\python.exe" main.py"
  ) else (
    start "ComfyUI-API-Modelscope" /D "%APP_DIR%" cmd /k python main.py
  )
)
del "%~f0"
