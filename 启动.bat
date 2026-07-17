@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
cd /d "%~dp0"
title NOVAI

:: ============================================
:: NOVAI 一键启动（自动检查并安装依赖）
:: ============================================

:: ---- 定位 Python（优先 venv）----
set "PYEXE=venv\Scripts\python.exe"
if not exist "%PYEXE%" (
    where python >nul 2>&1
    if errorlevel 1 (
        echo [错误] 未找到 Python！
        echo 请先运行 install.bat，或安装 Python 3.10+：
        echo https://www.python.org/downloads/
        echo 安装时务必勾选 "Add Python to PATH"
        pause
        exit /b 1
    )
    set "PYEXE=python"
)

echo ============================================
echo   NOVAI - AI 创作工具
echo ============================================
echo.

:: ---- 检查关键依赖是否已安装 ----
set "DEPS_OK=0"
"%PYEXE%" -c "import fastapi, uvicorn, requests, httpx, PIL" >nul 2>&1
if not errorlevel 1 (
    set "DEPS_OK=1"
)

if "!DEPS_OK!"=="0" (
    echo [依赖] 首次运行，正在安装依赖...
    echo.
    "%PYEXE%" -m pip --version >nul 2>&1
    if errorlevel 1 (
        echo       正在安装 pip...
        "%PYEXE%" -c "import urllib.request; urllib.request.urlretrieve('https://bootstrap.pypa.io/get-pip.py', 'get-pip.py')" 2>nul
        if exist "get-pip.py" (
            "%PYEXE%" get-pip.py --quiet
            del get-pip.py 2>nul
        )
    )
    "%PYEXE%" -m pip install -r requirements.txt --quiet --disable-pip-version-check
    if errorlevel 1 (
        echo.
        echo [WARN] 部分依赖安装失败，尝试继续启动...
        echo        可手动运行 install.bat 安装依赖
    ) else (
        echo [OK] 依赖已就绪
    )
    echo.
)

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
