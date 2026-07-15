@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo 启动 NOVAI 服务...
start "" /B NOVAI.exe

:: 等服务器就绪
:wait
ping -n 2 127.0.0.1 >nul
curl -s -o nul http://127.0.0.1:3000/ 2>nul && goto open
goto wait

:open
echo 打开桌面窗口...
:: 优先 Edge（Win10+ 自带），否则 Chrome
where msedge >nul 2>nul && start msedge --app=http://127.0.0.1:3000 --window-size=1400,900 && goto done
where chrome >nul 2>nul && start chrome --app=http://127.0.0.1:3000 --window-size=1400,900 && goto done
start http://127.0.0.1:3000

:done
echo 已启动！关闭应用窗口即可。
pause >nul
taskkill /F /IM NOVAI.exe 2>nul
