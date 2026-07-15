#!/bin/bash
cd "$(dirname "$0")"
echo "启动 NOVAI 智能画布..."
chmod +x ./NOVAI 2>/dev/null
./NOVAI &
sleep 3
open http://localhost:3000
echo "NOVAI 已启动！浏览器自动打开 http://localhost:3000"
read -p "按回车停止服务..." key
killall NOVAI 2>/dev/null