#!/bin/bash
cd "$(dirname "$0")"

echo "============================================"
echo "  NOVAI 一键安装"
echo "============================================"
echo ""

# 检测 Python
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未检测到 Python 3！"
    echo "请先安装：https://www.python.org/downloads/"
    read -p "按回车退出..."
    exit 1
fi

echo "[1/3] Python $(python3 --version 2>&1)"

# 安装依赖
echo ""
echo "[2/3] 安装依赖..."
python3 -m pip install --no-index --find-links=packages -r requirements.txt 2>/dev/null
if [ $? -ne 0 ]; then
    echo "离线安装失败，尝试在线安装..."
    python3 -m pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败，请检查网络"
        read -p "按回车退出..."
        exit 1
    fi
fi

echo ""
echo "============================================"
echo "  安装完成！"
echo "============================================"
echo ""
read -p "是否立即启动？(Y/n) " start
if [ "$start" != "n" ] && [ "$start" != "N" ]; then
    echo ""
    echo "[3/3] 启动服务..."
    echo "本机访问：http://127.0.0.1:3000/"
    echo "============================================"
    python3 main.py
fi
