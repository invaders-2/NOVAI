@echo off
chcp 65001 >nul
title NOVAI 智能画布
echo 启动 NOVAI 智能画布...
echo.
start "" "%~dp0NOVAI.exe"
echo 正在启动服务器...
timeout /t 3 /nobreak >nul
echo 打开浏览器...
start "" http://localhost:3000
echo.
echo NOVAI 已启动！浏览器将自动打开 http://localhost:3000
echo 关闭此窗口可停止服务。
pause >nul
