@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"
title NOVAI 安装

echo ============================================
echo   NOVAI - 一键安装依赖
echo ============================================
echo.

:: ---- 检测 Python ----
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python！
    echo 请先安装 Python 3.10+：https://www.python.org/downloads/
    echo 安装时务必勾选 "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo [1/3] 检测 Python...
python --version
echo.

:: ---- 创建虚拟环境 ----
echo [2/3] 创建虚拟环境...
if not exist "venv" (
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [错误] 虚拟环境创建失败
        pause
        exit /b 1
    )
    echo       虚拟环境创建完成
) else (
    echo       虚拟环境已存在，跳过
)
echo.

:: ---- 安装依赖 ----
echo [3/3] 安装依赖（首次可能较慢，请耐心等待）...
venv\Scripts\python -m pip install --upgrade pip -q --disable-pip-version-check
venv\Scripts\python -m pip install -r requirements.txt --disable-pip-version-check
if %errorlevel% neq 0 (
    echo.
    echo [错误] 依赖安装失败，请检查网络连接
    echo 可尝试使用国内镜像源：
    echo   venv\Scripts\python -m pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   安装完成！
echo ============================================
echo.
echo   双击 run.bat  启动服务
echo   双击 启动.bat 一键启动（自动检查依赖）
echo.
pause
