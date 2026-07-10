# NOVAI - Infinite Canvas

AI 创作工具，支持无限画布上的图像/视频生成与编辑。

## 截图预览

![首页](static/images/screenshots/home.png)

![无限画布](static/images/screenshots/canvas.png)

![AI 生图](static/images/screenshots/generate.png)

![API 设置](static/images/screenshots/settings.png)

![资产管理](static/images/screenshots/assets.png)

---

## 快速开始

### 环境要求

- Python 3.11+
- Git（用于更新）

---

### Windows 运行方法

#### 方法一：使用内置 Python（推荐）

项目自带 Windows Python 运行时，无需额外安装：

1. 下载或克隆项目到本地
2. 双击运行 `python/python.exe main.py`
3. 或打开命令提示符，进入项目目录执行：
   ```cmd
   python\python.exe main.py
   ```
4. 浏览器访问 `http://127.0.0.1:3000`

#### 方法二：使用系统 Python

1. 安装 [Python 3.11+](https://www.python.org/downloads/)
2. 打开命令提示符，进入项目目录
3. 安装依赖：
   ```cmd
   pip install -r requirements.txt
   ```
4. 启动服务：
   ```cmd
   python main.py
   ```
5. 浏览器访问 `http://127.0.0.1:3000`

---

### Mac 运行方法

1. 安装 [Python 3.11+](https://www.python.org/downloads/)（如未安装）
   ```bash
   brew install python@3.11
   ```

2. 克隆项目：
   ```bash
   git clone https://github.com/invaders-2/NOVAI.git
   cd NOVAI
   ```

3. 安装依赖：
   ```bash
   pip3 install -r requirements.txt
   ```

4. 启动服务：
   ```bash
   python3 main.py
   ```

5. 浏览器访问 `http://127.0.0.1:3000`

---

### 配置 API

启动后在页面中配置你的 API 密钥（支持 OpenAI、Gemini、火山引擎等）

---

### 更新项目

```bash
git pull origin main
```

或在应用内点击侧边栏 GitHub 按钮一键更新。

---

## 配套工具

- **Photoshop 直连插件**：PS 直连画布调用所有功能

---

## 推荐 API 服务

由于部分 API 地址关停，推荐以下稳定服务：

- https://apib.ai/register?aff=1uyAbb （包含所有生图模型/视频模型/LLM模型）
- https://www.fhl.mom/register?aff=86L574B4T2N9 （包含 Codex 和 GPT Image 2 模型）

---

## 自动更新

项目支持自动检查 GitHub 仓库更新：
- 打开应用时自动检查新版本
- 有新版本时侧边栏 GitHub 按钮显示提示
- 点击按钮可查看更新说明并一键更新

如不需要更新提示，可删除项目根目录的 `VERSION` 文件。

---

## 支持的功能

1. **多协议 API 支持**：OpenAI 协议 / 异步协议 / Gemini 协议 / 方舟协议
2. **RunningHub 集成**：工作流 / AI 应用 / 收费模型调用
3. **火山引擎调用**
4. **即梦 CLI 调用**：支持文生图 / 图生图 / 文生视频 / 图生视频
5. **ComfyUI 调用**：支持本地局域网 ComfyUI
6. **扩展功能**：360 全景图预览 / 视频帧抽取 / 循环节点等
7. **配套工具**：Chrome 批量采集插件 / PS 直连画布插件
8. **Mac 触控板支持**：双指平移画布 / 捏合缩放画布

---

## 技术栈

- **后端**：Python + FastAPI
- **前端**：原生 HTML/CSS/JavaScript
- **样式**：Tailwind CSS
- **3D**：Three.js

---

## 许可证

已经申请著作权，禁止商业用途

* 可以自己使用和公司使用，禁止用于任何形式的修改封装成商业产品，商用须取得授权
* 根据代码二次开发的软件必须保持开源并注明来源作者

*This software is for personal and company use only, but is prohibited from being modified or packaged into commercial products in any way. Commercial use requires authorization.*

*Software developed based on this code must remain open source and the original author must be credited.*
