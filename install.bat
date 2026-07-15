@echo off
cd /d "%~dp0"
echo ========================================
echo   NOVAI 一键安装
echo ========================================
echo.

REM 检测 Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Python！
    echo 请先安装 Python 3.11+：https://www.python.org/downloads/
    echo 安装时记得勾选 "Add Python to PATH"
    pause
    exit /b 1
)

echo [1/3] 检测 Python...
python --version

echo.
echo [2/3] 创建虚拟环境...
if not exist "venv" (
    python -m venv venv
    echo 虚拟环境创建完成
) else (
    echo 虚拟环境已存在，跳过
)

echo.
echo [3/3] 安装依赖...
venv\Scripts\python -m pip install --upgrade pip -q
venv\Scripts\pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败，请检查网络连接
    pause
    exit /b 1
)

echo.
echo ========================================
echo   安装完成！正在启动...
echo ========================================
start http://127.0.0.1:3000/
venv\Scripts\python main.py
pause
