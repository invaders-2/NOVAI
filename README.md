# NOVAI - Infinite Canvas

AI 创作工具，支持无限画布上的图像/视频生成与编辑。

---

## 快速开始

### 安装依赖
```bash
pip install -r requirements.txt
```

### 启动服务
```bash
python main.py
```

服务默认运行在 `http://127.0.0.1:3000`

### 配置 API
启动后在页面中配置你的 API 密钥（支持 OpenAI、Gemini、火山引擎等）

---

## 配套工具

- **Chrome 采集插件**：[Infinite Canvas 图像视频文字抓取](https://chromewebstore.google.com/detail/infinite-canvas-%E5%9B%BE%E5%83%8F%E8%A7%86%E9%A2%91%E6%96%87%E5%AD%97%E6%8A%93%E5%8F%96%E5%B7%A5/ajfhnbklbmpfaaookhfakohabnpmlcic)
- **Photoshop 直连插件**：PS 直连画布调用所有功能

---

## 视频教程

详细教程：[https://youtu.be/r_y_9ALr7fg](https://youtu.be/r_y_9ALr7fg)

---

## 推荐 API 服务

由于部分 API 地址关停，推荐以下稳定服务：

- https://apib.ai/register?aff=1uyAbb （包含所有生图模型/视频模型/LLM模型）
- https://www.fhl.mom/register?aff=86L574B4T2N9 （包含 Codex 和 GPT Image 2 模型）

功能请求/问题反馈：[B站](https://space.bilibili.com/78652351)

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

---

## 截图预览

<img width="2079" height="665" alt="首页" src="https://github.com/user-attachments/assets/8469923b-f7a2-403c-9c37-e6e789211f28" />

<img width="1865" height="1503" alt="无限画布" src="https://github.com/user-attachments/assets/f4030201-67c6-4845-b08b-b6fdf304afaa" />

<img width="1696" height="1350" alt="AI 生图" src="https://github.com/user-attachments/assets/0a6090fb-a8dd-4c3d-adee-b1f9233a2d91" />

<img width="1525" height="1473" alt="GPT 对话" src="https://github.com/user-attachments/assets/6f61fcf9-746c-425b-9e36-cfc8d252da7c" />

<img width="1261" height="864" alt="资产管理" src="https://github.com/user-attachments/assets/57f3e230-3134-488f-8179-d97e7d15383a" />

<img width="1530" height="858" alt="API 设置" src="https://github.com/user-attachments/assets/9990e42d-22d5-4a10-a1e1-ad35a634edd2" />

<img width="1735" height="1400" alt="ComfyUI 设置" src="https://github.com/user-attachments/assets/d8328ff8-bbe0-4f1c-9ffa-7b56e8a1a51d" />

<img width="2258" height="969" alt="智能画布" src="https://github.com/user-attachments/assets/4a752d99-885d-4ba9-8b86-91b495786b5c" />

<img width="1531" height="1374" alt="图像增强" src="https://github.com/user-attachments/assets/0af79e38-0955-4740-9e65-5c9bb057f58c" />

<img width="2196" height="1040" alt="3D 预览" src="https://github.com/user-attachments/assets/6d823668-cde2-4836-8332-1858efe5f520" />

<img width="2214" height="771" alt="视频生成" src="https://github.com/user-attachments/assets/52e10958-753f-45ba-a50e-3bbec27be436" />
