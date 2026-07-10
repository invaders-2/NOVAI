# AGENTS.md - NOVAI / Infinite Canvas

## 项目概览

NOVAI 是一个 AI 创作工具，核心功能是**无限画布（Infinite Canvas）**，支持多种 AI 模型调用（OpenAI API、ComfyUI、火山引擎、即梦 CLI、ModelScope 等），提供图片/视频生成、GPT 对话、资产管理等功能。

## 技术栈

- **后端**: Python 3.11 + FastAPI + Uvicorn
- **前端**: 原生 HTML/CSS/JavaScript（无框架）
- **样式**: Tailwind CSS (CDN)
- **图标**: Lucide Icons
- **3D**: Three.js
- **包管理**: pip (Python)

## 目录结构

```
.
├── main.py                  # 后端主文件（FastAPI 应用，~17000 行）
├── requirements.txt         # Python 依赖
├── static/                  # 前端静态文件
│   ├── index.html           # 主入口页面（含侧边栏导航 + iframe 路由）
│   ├── home.html            # 首页
│   ├── canvas.html          # 无限画布页面
│   ├── online.html          # 在线生图页面
│   ├── gpt-chat.html        # GPT 对话页面
│   ├── smart-canvas.html    # 智能画布页面
│   ├── canvas-list.html     # 画布列表页面
│   ├── api-settings.html    # API 设置页面
│   ├── comfyui-settings.html # ComfyUI 设置页面
│   ├── asset-manager.html   # 资产管理页面
│   ├── enhance.html         # 图像增强页面
│   ├── zimage.html          # Z-Image 页面
│   ├── klein.html           # Flux2-Klein 页面
│   ├── angle.html           # 3D 角度预览页面
│   ├── css/                 # 样式文件
│   ├── js/                  # JavaScript 模块
│   │   ├── canvas.js        # 画布核心逻辑（~14800 行）
│   │   ├── smart-canvas.js  # 智能画布逻辑（~16900 行）
│   │   ├── canvas-list.js   # 画布列表逻辑
│   │   ├── touch-mouse.js   # 触屏→鼠标事件桥接
│   │   ├── i18n.js          # 国际化
│   │   ├── theme.js         # 主题切换
│   │   └── ...
│   ├── vendor/              # 第三方库（Tailwind CDN, Lucide, Three.js, 字体）
│   ├── images/              # 图片资源
│   └── runninghub/          # RunningHub 工作流相关
├── tools/                   # 配套工具
│   ├── chrome-local-asset-importer/  # Chrome 素材采集插件
│   └── photoshop-asset-connector/    # PS 直连画布插件
├── workflows/               # ComfyUI 工作流配置
├── assets/                  # 输出资源目录
├── CLI/                     # CLI 工具
└── python/                  # Windows 内嵌 Python 运行时
```

## 构建与运行

```bash
# 安装依赖
pip install -r requirements.txt

# 开发环境启动
python main.py

# 服务端口通过环境变量 DEPLOY_RUN_PORT 控制，默认 3000
```

## 架构说明

- **路由方式**: `index.html` 作为主入口，通过 iframe 加载各子页面（home.html, canvas.html, online.html 等）
- **页面切换**: `switchUI(el, id)` 函数控制 iframe 切换，支持 localStorage 记忆上次页面
- **跨页面通信**: 通过 `postMessage` 在 iframe 与主页面间通信
- **画布系统**: 有两套画布实现
  - `canvas.js` + `canvas.html`: 传统无限画布（节点连线式）
  - `smart-canvas.js` + `smart-canvas.html`: 智能画布（增强版）
- **主题系统**: 支持亮/暗主题，通过 `theme.js` 管理，CSS 变量驱动
- **国际化**: `i18n.js` 提供中英文切换

## 代码风格

- JavaScript: 原生 ES6+，无框架，使用 IIFE 模式隔离模块
- CSS: 使用 CSS 变量 + Tailwind 工具类
- Python: FastAPI 异步路由，Pydantic 数据模型
- 缩进: 4 空格

## 注意事项

- `main.py` 是单文件后端，包含所有 API 路由（~17000 行）
- `canvas.js` 和 `smart-canvas.js` 是核心前端逻辑，修改时需注意事件冒泡和 viewport 计算
- 画布缩放/平移逻辑涉及 `viewport` 对象（x, y, scale），修改时需同步更新 `applyViewport()` 和 `renderLinks()`
