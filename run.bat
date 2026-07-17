@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"
title NOVAI

:: ---- 定位 Python（优先 venv）----
set "PYEXE=venv\Scripts\python.exe"
if not exist "%PYEXE%" (
    where python >nul 2>&1
    if errorlevel 1 (
        echo [错误] 未找到 Python，请先运行 install.bat 安装依赖
        echo        或安装 Python 3.10+：https://www.python.org/downloads/
        pause
        exit /b 1
    )
    set "PYEXE=python"
)

echo ============================================
echo   NOVAI - AI 创作工具
echo ============================================
echo.

:: ---- 确定端口 ----
set "PORT=3000"
if defined DEPLOY_RUN_PORT set "PORT=%DEPLOY_RUN_PORT%"

echo [NOVAI] 正在启动服务...
echo [NOVAI] 访问地址: http://127.0.0.1:%PORT%/
echo [NOVAI] 按 Ctrl+C 停止服务
echo.

:: 延迟打开浏览器
start /b cmd /c "timeout /t 3 /nobreak >nul && start http://127.0.0.1:%PORT%/"

:: 启动服务
"%PYEXE%" main.py

echo.
echo [NOVAI] 服务已停止
pause
