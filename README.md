# NOVAI — 无限画布 AI 创作平台

> 自由地在无限画布上生成图像、视频，用节点串联工作流。

![首页](static/images/screenshots/home.png)

![无限画布](static/images/screenshots/canvas.png)

![AI 生图](static/images/screenshots/generate.png)

![API 设置](static/images/screenshots/settings.png)

![资产管理](static/images/screenshots/assets.png)

---

## 快速开始

### 环境要求

- Python 3.10+（[下载](https://www.python.org/downloads/)，安装时勾选 "Add Python to PATH"）
- Git（可选，用于自动更新）

### Windows

```
首次使用：双击 install.bat → 安装依赖（创建虚拟环境 + 安装包）
日常启动：双击 run.bat     → 启动服务
一键启动：双击 启动.bat     → 自动检查依赖并启动（首次也可直接用这个）
```

浏览器自动打开 `http://127.0.0.1:3000/`

### macOS

```
首次使用：双击 mac-修复权限.command → 移除安全限制（仅需一次）
日常启动：双击 启动.command         → 自动安装依赖并启动
```

> 如果 macOS 提示「无法打开」，到 系统设置 → 隐私与安全性 → 点击「仍要打开」

### 手动安装

```bash
pip install -r requirements.txt
python main.py
```

---

## AI 模型

内置 **ModelScope** 免费 API，开箱即用：

| 类型 | 模型 | 说明 |
|------|------|------|
| 对话 | Qwen3-235B | 通义千问旗舰，逻辑推理/写作 |
| 对话 | Qwen3-VL-235B | 多模态，可分析图片 |
| 生图 | Qwen-Image-2512 | 中文文字渲染最优，海报 Banner 首选 |
| 生图 | FLUX.2-klein-9B | 画面质感最好 |
| 生图 | Z-Image-Turbo | 1-2 秒快速出图 |
| 生图 | Qwen-Image-Edit-2511 | 说话就能改图 |
| 视频 | agnes-video-v2.0 | 免费视频生成 |

---

## 特色功能

- 🎨 **无限画布** — 自由缩放、拖拽、连线创作
- ⚡ **节点工作流** — 图像/视频/LLM 节点串联
- 🔌 **插件系统** — Photoshop 面板、Chrome 扩展
- 🌐 **多仓库更新** — GitHub / Gitee / ModelScope 三源
- 🇨🇳 **中文优化** — Qwen 生态深度集成

---

## 更新

项目会检查 GitHub、Gitee、ModelScope 三个源的最新版本，自动推送更新通知。

### v1.0.86

- **云端构建流水线**：Windows/Mac 云端打包流水线，自动构建发布
- **轮播图资源入库**：修复更新后轮播图失效问题
- **无边框窗口修复**：Win 无边框窗口拖动/边缘缩放/标题栏布局修复
- **Mac 签名优化**：dmg ad-hoc 签名防「已损坏」提示，修复签名被拷贝破坏
- **编码修复**：修复 Windows 云端构建中文编码问题

### v1.0.85

- **智能画布修复**：composer 定位、弹窗裁切、边栏偏移、标题栏布局等修复

### v1.0.84

- **画布列表增强**：卡片支持最多 4 张图片 2×2 网格预览
- **桌面端升级**：无边框窗口 + 系统托盘（关闭最小化到托盘）+ 局域网访问支持
- **桌面图标更新**：白底黑 logo 圆角设计
- **修复**：64 位 ctypes WndProc 指针截断崩溃、pystray 打包、端口占用等
- **仓库整理**：完善 .gitignore，排除设计稿/测试截图/备份文件

### v1.0.83

- **前端性能优化**：Lucide 图标子集化（体积减少 90%）、提取 NovaUtils/NovaMedia 共享模块、Marvis 风格 CSS 去重、修复定时器泄漏、页面隐藏时暂停 rAF 渲染、touch-mouse 布局缓存优化
- **模型选择弹窗重构**：左右两栏布局，悬停联动切换供应商，动态高度自适应屏幕空间
- **修复 GPT 聊天功能**：修复 TDZ 错误导致模型选择弹窗空白、无法选择供应商和模型
- **修复图标与提示问题**：修复多个页面 Lucide 图标不显示，修复素材库状态栏泄露英文错误信息
- **统一设置页面风格**：API 设置与工作流设置页面设计同步为 Marvis 风格，修复 CSS 语法错误
- **新增后端工具 API**：7 个 API 端点（存储管理、图片检测、分类 Prompt、模型规范化、RunningHub 钱包状态）
- **修复竞态问题**：sendChatMessage 防重入、setTimeout 递归轮询、node.running 过早清零
