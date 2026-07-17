# NOVAI画布工具 · Photoshop 插件

Adobe Photoshop UXP 面板插件，连接局域网内的 NOVAI 后端，双向打通 PS 与资产库：

- **资产 → PS**：浏览资产库，把图片素材置入当前文档
- **PS → 资产库**：把当前画面导出为 PNG，存进选中的分组
- **实时同步**：WebSocket 自动刷新，画布那边新增素材面板即时更新
- **生成 / Agent**：在 PS 内调用 AI 模型生成图片、对话编辑

## 安装（两步）

1. **打包**：双击 `package.command` 文件即可生成 `.ccx` 安装包。
   > 如果无法双击运行，在终端执行：`chmod +x package.command` 后再双击。
   > 生成 `NOVAI-画布工具-v0.3.0.ccx`（约 48KB）。

2. **安装到 PS**：打开 Photoshop（24.0 以上）→ 增效工具 → 管理增效工具 → 右上 ⚙ → **从文件安装增效工具** → 选择 `.ccx` 文件。

> 开发调试也可以用 UXP Developer Tool 加载 `manifest.json`，见 [Adobe UXP 文档](https://developer.adobe.com/photoshop/uxp/devtool/)。

## 使用（打开面板即连）

1. 启动 NOVAI 后端（`python main.py` 或 `启动服务.bat`）。
2. 在 PS 增效工具菜单打开「NOVAI画布工具」面板。
3. **面板会自动探测本机服务并连接** — 绿点亮起就能用了。

如果自动连接失败（比如后端在局域网另一台电脑上）：
- 切到「设置」Tab → 填入那台电脑的 `IP:端口`（如 `192.168.1.10:3000`） → 点「连接」。

> 地址会记住，下次打开面板自动重连，不用再手动操作。

## 功能

| 功能 | 说明 |
|------|------|
| 资产浏览 | 切「图片资产 / 画布资产 / 本地素材」浏览，双击置入 PS |
| 下载到图层 | 选中图片 → 点底部「下载到图层」 |
| 上传当前画面 | 选中分组 → 点「上传当前画面」导出 PS 文档并存入 |
| 生成 Tab | 调用 API / MS / RH / ComfyUI 生成图片 |
| Agent Tab | AI 对话生成和图像编辑，支持选区局部修改 |
| 实时同步 | 勾选「实时同步」后，画布那边变化面板自动刷新 |

## 说明

- 插件不改动原文档：导出用合并拷贝（`copy:true`），安全无副作用。
- 视频/音频素材可浏览、可外部打开，但不置入 PS。
- 局域网地址随意填（`manifest.json` 已放行所有域名）。

## 后端接口

| 用途 | 方法 / 路径 | 说明 |
|------|-------------|------|
| 读取资产库 | `GET /api/asset-library` | `{ library: { libraries, active_library_id } }` |
| 上传图片 | `POST /api/ai/upload-base64` | `{ data, name, content_type } → { files: [{ url }] }` |
| 存入分组 | `POST /api/asset-library/items` | `{ library_id, category_id, url, name }` |
| 实时推送 | `WS /ws/stats` | `{ type: "asset_library_updated" }` 触发刷新 |
| 自动探测 | `GET /api/asset-library` | 插件对 localhost 常见端口逐个探测 |

## 代码结构

```
index.html        外壳：顶部 Tab（资产 / 生成 / Agent / 设置）
style.css         深色主题
js/state.js       共享状态 + localStorage 键
js/net.js         地址解析 / HTTP / WS / 字节上传 / 自动探测
js/sources.js     三数据源适配器（assets / canvas / local）
js/ps.js          PS 操作（置入 / 导出 PNG / 外部打开）
js/socket.js      WebSocket 实时同步（心跳 + 退避重连）
js/ui.js          Spectrum UI 组件助手
js/generate.js    生成 Tab（API / MS / RH / ComfyUI）
js/agent.js       Agent Tab（对话 + 图像编辑）
js/app.js         启动 / Tab 路由 / 事件绑定 / 自动连接
package.command   双击打包为 .ccx 安装包
```

## 版本

- **0.3**：模块化重构、顶部 Tab、两栏预览、自动探测连接、Agent Tab。
- 0.2：切到 `/api/asset-library`，新增三数据源、PS→库导出、WebSocket 实时刷新。
- 0.1：只读浏览本地上传并置入。
