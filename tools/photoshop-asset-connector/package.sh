#!/bin/bash
# 将 PS 插件打包为 .ccx 安装包，用户可在 PS 里直接安装
# 用法：cd tools/photoshop-asset-connector && bash package.sh

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
NAME="NOVAI-画布工具"
VERSION=$(python3 -c "import json; print(json.load(open('$DIR/manifest.json'))['version'])" 2>/dev/null || echo "0.3.0")
CCX="$DIR/${NAME}-v${VERSION}.ccx"

# .ccx 就是 zip，但扩展名不同
echo "正在打包 ${NAME} v${VERSION} ..."

# 清理旧包
rm -f "$CCX"

# 打包（排除 .DS_Store 和脚本自身）
cd "$DIR"
zip -r "$CCX" \
  manifest.json \
  index.html \
  style.css \
  js/ \
  -x "*.DS_Store" "package.sh"

SIZE=$(du -h "$CCX" | cut -f1)
echo ""
echo "✅ 打包完成：$CCX ($SIZE)"
echo ""
echo "安装方式："
echo "  1. 打开 Photoshop → 增效工具 → 管理增效工具"
echo "  2. 点击右上角 ⚙ → 从文件安装增效工具"
echo "  3. 选择 ${NAME}-v${VERSION}.ccx"
echo "  4. 在「增效工具」菜单打开「NOVAI画布工具」"
