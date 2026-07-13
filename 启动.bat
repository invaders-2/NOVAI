@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"
title NOVAI

:: ---- 定位 Python ----
set "PYEXE=%~dp0python\python.exe"
if not exist "%PYEXE%" (
    where python >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] 未找到 Python，请安装 Python 3.10+ 或将 python 文件夹放到本目录
        echo 下载: https://www.python.org/downloads/
        pause
        exit /b 1
    )
    set "PYEXE=python"
)

echo ============================================
echo   NOVAI - AI 创作工具
echo ============================================
echo.

:: ---- 检查依赖是否需要安装 ----
set "DEPS_OK=0"
set "REQ_HASH_FILE=.deps_hash"

if not exist ".deps_installed" goto :install_deps

:: requirements.txt 有变化则重装
for /f "usebackq tokens=*" %%H in (`certutil -hashfile requirements.txt SHA256 2^>nul ^| findstr /v "hash SHA256"`) do set "CURRENT_HASH=%%H"
if exist "%REQ_HASH_FILE%" (
    set /p "SAVED_HASH=<%REQ_HASH_FILE%"
    if "!SAVED_HASH!"=="%CURRENT_HASH%" (
        set "DEPS_OK=1"
    )
)
if "%DEPS_OK%"=="0" goto :install_deps
goto :start_server

:install_deps
echo [1/2] 正在检查依赖...
"%PYEXE%" -m pip --version >nul 2>&1
if errorlevel 1 (
    echo       正在安装 pip...
    "%PYEXE%" -c "import urllib.request; urllib.request.urlretrieve('https://bootstrap.pypa.io/get-pip.py', 'get-pip.py')" 2>nul
    if exist "get-pip.py" (
        "%PYEXE%" get-pip.py --quiet
        del get-pip.py 2>nul
    )
)

echo [2/2] 正在安装/更新依赖（首次可能较慢，请耐心等待）...
"%PYEXE%" -m pip install -r requirements.txt --quiet --disable-pip-version-check
if errorlevel 1 (
    echo.
    echo [WARN] 部分依赖安装失败，尝试继续启动...
)

:: 记录安装标记
echo installed > .deps_installed
for /f "usebackq tokens=*" %%H in (`certutil -hashfile requirements.txt SHA256 2^>nul ^| findstr /v "hash SHA256"`) do echo %%H> "%REQ_HASH_FILE%"

echo [OK] 依赖已就绪
echo.

:start_server
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
