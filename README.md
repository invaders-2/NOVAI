# NOVAI — 多引擎 AI 创作工作台

> 五引擎随心切换 · ComfyUI 工作流兼容 · 内置免费 API · 开箱即用

NOVAI 是一款面向创作者的一站式 AI 创作工作台：**无限画布 + 智能画布**上自由拖拽、连线、组合各种 AI 能力，文生图、图生图、AI 视频、多模态对话、图像增强、3D 视角重塑全部在一个界面里完成。内置 **ModelScope 免费 API**，安装即用；同时开放 **OpenAI 兼容 API / 火山引擎 / ComfyUI / RunningHub / 即梦 CLI** 多引擎接入，能力上限由你决定。

![首页](static/images/screenshots/home.png)

![无限画布](static/images/screenshots/canvas.png)

![AI 生图](static/images/screenshots/generate.png)

![API 设置](static/images/screenshots/settings.png)

![资产管理](static/images/screenshots/assets.png)

---

## 核心优势

- 🎨 **双画布创作** — 无限画布（节点连线）+ 智能画布（增强版），自由缩放、拖拽、连线，支持多图拼接、图层编辑、分组导出
- 🔌 **五引擎接入** — OpenAI 兼容 API / 火山引擎 / ModelScope / ComfyUI / RunningHub，一个界面切换，模型自由导入
- 🧩 **ComfyUI 工作流兼容** — 工作流 JSON 导入/导出/入库/分组，多实例连接，云端工作流（RunningHub）直跑
- 🇨🇳 **中文生态集成** — Qwen 系列深度集成（中文文字渲染最优），内置 ModelScope 免费 API 开箱即用
- 🔄 **三源更新 + 回滚** — GitHub / Gitee / ModelScope 三源检测，一键升级，出问题可回滚
- 📱 **局域网访问** — 手机/iPad 扫码即用，同网络随时随地继续创作

---

## 功能全景

### 创作

| 功能 | 说明 |
|------|------|
| **无限画布** | 节点式连线工作流：文生图、图生图、视频、LLM 节点串联，多图拼接与图层编辑 |
| **智能画布** | 增强版画布：Composer 快捷面板、分组导出、胶囊缩放工具栏、浮窗全屏（ESC 退出） |
| **在线生图** | 文生图、图生图、参考图，多引擎切换，质量/速度可选 |
| **GPT 对话** | 流式输出、多会话管理、历史记录，多供应商多模型可选 |
| **图像增强** | Z-IMAGE 极简影像重塑：放大、修复、增强 |
| **专属模型页** | Z-Image（1-2 秒极速出图）、Flux Klein（一体化终端）、Angle Control（3D 视角重塑） |
| **AI 视频** | 免费视频生成（ModelScope）+ 即梦 CLI 接入 |

### 引擎与模型

| 引擎 | 说明 |
|------|------|
| **OpenAI 兼容 API** | 自定义 baseUrl + Key，任意兼容服务直接接入 |
| **火山引擎（豆包）** | Seed 系列文生图/视频/文本 |
| **ModelScope** | 内置免费：Qwen3-235B 对话、Qwen-Image-2512（中文文字渲染最优）、FLUX.2-klein-9B、Z-Image-Turbo、Qwen-Image-Edit、agnes-video-v2.0 |
| **ComfyUI** | 本地/远程多实例连接，模型自备 |
| **RunningHub** | 云端工作流：提交任务、状态查询、钱包状态 |
| **即梦 CLI** | 字节跳动即梦视频生成，支持 WSL 模式 |
| **Codex / Gemini CLI** | AI 编程助手一键安装接入（Win/macOS/Linux 脚本） |

### 工作流管理

- ComfyUI 工作流 **导入 / 导出 / 导出到库 / 分组导出**
- 工作流资产库：上传、管理、节点预览
- 多 ComfyUI 实例管理，一键切换

### 素材与数据

- **素材库**：多库管理、AI 自动分类、裁剪、头像注册、批量操作、共享文件夹
- **Prompt 库**：多分类管理，常用提示词沉淀复用
- **项目管理**：画布工作台、最近画布、回收站（恢复/彻底删除）

### 桌面与体验

- **桌面端**：无边框窗口、系统托盘（关闭最小化到托盘）、Win/Mac 安装包一键安装
- **局域网访问**：手机/iPad 扫码访问，Windows 安装自动放行防火墙
- **在线更新**：三源检测 + 备份 + 一键升级 + 回滚

### 配套插件

- **Chrome 素材采集扩展** — 网页素材一键采集入库
- **Photoshop 连接器** — PS 面板直连画布，设计稿无缝导入

---

## 快速开始

### 下载安装（推荐）

无需安装 Python、无需配置环境，下载安装包双击即用。

#### Windows

1. 下载 `NOVAI-Setup.exe` 安装包
2. 双击安装，按引导完成（桌面快捷方式自动创建）
3. 双击桌面「NOVAI」图标启动，浏览器自动打开 `http://127.0.0.1:3000/`

#### macOS

1. 下载 `NOVAI.dmg` 磁盘镜像
2. 打开 DMG，将 `NOVAI.app` 拖入 `Applications` 文件夹
3. 双击 `NOVAI.app` 启动，浏览器自动打开 `http://127.0.0.1:3000/`

> **首次启动提示**：macOS 可能提示「无法打开，因为它来自未识别的开发者」，请前往 **系统设置 → 隐私与安全性 → 点击「仍要打开」** 即可。

---

### 手动安装（开发者）

```bash
# 克隆仓库
git clone https://github.com/invaders-2/NOVAI.git
cd NOVAI

# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
```

浏览器访问 `http://127.0.0.1:3000/`

> 环境要求：Python 3.10+

---

## 常见问题

### Windows

| 问题 | 解决方法 |
|------|---------|
| **安装后打不开** | 检查防火墙是否拦截，尝试以管理员身份运行 |
| **端口 3000 被占用** | 关闭占用该端口的程序，或在启动前设置环境变量 `DEPLOY_RUN_PORT=3001` 修改端口 |
| **依赖安装失败** | 确保 Python 3.10+ 已安装且勾选了「Add Python to PATH」 |
| **杀毒软件误报** | 将 NOVAI 安装目录添加至杀毒软件信任白名单 |

### macOS

| 问题 | 解决方法 |
|------|---------|
| **「无法打开，因为它来自未识别的开发者」** | 前往 **系统设置 → 隐私与安全性** → 点击「仍要打开」 |
| **「已损坏，无法打开」** | 终端运行：`sudo xattr -rd com.apple.quarantine /Applications/NOVAI.app` |
| **端口 3000 被占用** | 终端运行 `lsof -i :3000` 查看占用进程，`kill <PID>` 结束它；或设置 `DEPLOY_RUN_PORT=3001` 修改端口 |
| **依赖问题（手动安装时）** | 确保已安装 Python 3.10+：`python3 --version`，再执行 `pip3 install -r requirements.txt` |

---

## 下载与更新

安装包及更新下载地址：

| 平台 | 地址 |
|------|------|
| GitHub | https://github.com/invaders-2/NOVAI |
| Gitee | https://gitee.com/invaders/novai |
| ModelScope | https://modelscope.cn/studios/bllack/NOVAI |

项目启动后会自动检查三个源的最新版本，推送更新通知，一键升级。

---

## 更新日志

### v1.0.96
- 画布修复与智能画布缩放工具栏
- Launcher 64 位兼容与最大化图标修复

### v1.0.95
- Win 客户端：放大按钮彻底修复（EnumWindows 按 PID 枚举主窗口）

### v1.0.94
- 修复在线更新后重启黑屏：逐文件覆盖替代整删整建

### v1.0.93
- 画布：底部胶囊缩放工具栏（适应画布/定位/缩放/百分比/全屏）+ 浮窗全屏模式（ESC 退出）
- Win 客户端：修复放大按钮无效

### v1.0.92
- Win 客户端：修复下载图片保存无反应、全屏覆盖任务栏问题
- 素材库：默认保存路径改为安装目录，更换路径自动搬迁旧素材

### v1.0.86
- **云端构建流水线**：Windows/Mac 云端打包流水线，自动构建发布
- 轮播图资源入库、无边框窗口修复、Mac 签名优化（防「已损坏」提示）
