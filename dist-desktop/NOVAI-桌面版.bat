@echo off
chcp 65001 >nul
title NOVAI 智能画布
echo 启动 NOVAI 服务...

:: 后台启动服务
start "" /B "%~dp0NOVAI.exe"

:: 等服务器就绪
:wait
timeout /t 2 /nobreak >nul
curl -s -o nul http://127.0.0.1:3000/ 2>nul || goto wait

:: Chrome App 模式 — 独立窗口，无地址栏
echo 打开应用窗口...
start chrome --app=http://127.0.0.1:3000 --window-size=1400,900

echo 已启动！关闭此窗口或应用窗口即可停止服务。
pause >nul
taskkill /F /IM NOVAI.exe 2>nul
