#!/bin/bash
# NOVAI 测试版启动脚本
# 端口：30001（与正式版 3000 完全隔离）
# 数据：~/.novai-test-data（不与正式版共享）

export NOVAI_PORT=30001
export NOVAI_DATA_DIR="$HOME/.novai-test-data"

cd "$(dirname "$0")"
echo "启动 NOVAI 测试版..."
echo "端口: 30001"
echo "数据目录: $NOVAI_DATA_DIR"
echo ""

python3 main.py 30001
