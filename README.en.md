# NOVAI — Infinite Canvas AI Creation Platform

> Freely generate images and videos on an infinite canvas, connecting workflows with nodes. Built-in free ModelScope API, ready to use out of the box.
>
> **[中文](README.md) · [Website](https://invaders-2.github.io/NOVAI/) · [Docs](https://invaders-2.github.io/NOVAI/docs.html)**

NOVAI is an all-in-one AI workbench for creators. On an **infinite canvas** you can drag, connect, and combine various AI capabilities — text-to-image, image-to-image, AI video generation, GPT multimodal chat — all seamlessly in one interface. Paired with **Photoshop panels** and **Chrome extensions**, asset collection and creative workflows flow together.

![Home](static/images/screenshots/home.png)

![Infinite Canvas](static/images/screenshots/canvas.png)

![AI Generation](static/images/screenshots/generate.png)

![API Settings](static/images/screenshots/settings.png)

![Asset Manager](static/images/screenshots/assets.png)

---

## Quick Start

### Download & Install (Recommended)

No Python installation or environment configuration needed — download the installer and run.

#### Windows

1. Download the `NOVAI-Setup.exe` installer
2. Double-click to install and follow the wizard (desktop shortcut auto-created)
3. Launch the "NOVAI" icon on your desktop, browser opens `http://127.0.0.1:3000/` automatically

#### macOS

1. Download the `NOVAI.dmg` disk image
2. Open the DMG and drag `NOVAI.app` into the `Applications` folder
3. Double-click `NOVAI.app` to launch, browser opens `http://127.0.0.1:3000/` automatically

> **First launch note**: macOS may warn "cannot be opened because it is from an unidentified developer". Go to **System Settings → Privacy & Security → click "Open Anyway"**.

---

### Manual Install (Developers)

If you want to run from source or contribute:

```bash
# Clone the repository
git clone https://github.com/invaders-2/NOVAI.git
cd NOVAI

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

Open `http://127.0.0.1:3000/` in your browser.

> Requirements: Python 3.10+

---

## FAQ

### Windows

| Issue | Solution |
|-------|----------|
| **Cannot open after install** | Check firewall settings; try running as administrator |
| **Port 3000 in use** | Close the program using the port, or set env var `DEPLOY_RUN_PORT=3001` before starting |
| **Dependency install fails** | Ensure Python 3.10+ is installed with "Add Python to PATH" checked |
| **Antivirus false positive** | Add the NOVAI installation directory to antivirus whitelist |

### macOS

| Issue | Solution |
|-------|----------|
| **"Unidentified developer" warning** | Go to **System Settings → Privacy & Security → click "Open Anyway"** |
| **"App is damaged" warning** | Run in terminal: `sudo xattr -rd com.apple.quarantine /Applications/NOVAI.app` |
| **Port 3000 in use** | Run `lsof -i :3000` to find the process, `kill <PID>` to end it; or set `DEPLOY_RUN_PORT=3001` |
| **Dependency issues (manual install)** | Ensure Python 3.10+: `python3 --version`, then `pip3 install -r requirements.txt` |

---

## AI Models

Built-in **ModelScope** free API, ready out of the box:

| Type | Model | Description |
|------|-------|-------------|
| Chat | Qwen3-235B | Tongyi Qianwen flagship, reasoning/writing |
| Chat | Qwen3-VL-235B | Multimodal, image analysis |
| Image | Qwen-Image-2512 | Best Chinese text rendering, posters/banners |
| Image | FLUX.2-klein-9B | Best visual quality |
| Image | Z-Image-Turbo | 1-2s fast generation |
| Image | Qwen-Image-Edit-2511 | Edit images by talking |
| Video | agnes-video-v2.0 | Free video generation |

---

## Key Features

- 🎨 **Infinite Canvas** — free zoom, drag, and connect for creation
- ⚡ **Node Workflows** — image/video/LLM nodes connected in chains
- 🤖 **Auto-Place on Canvas** — AI results auto-create nodes, no manual import
- 💡 **Smart Suggestion Bar** — auto-popup "change outfit / change scene / add camera move" one-click continuation
- 🔍 **@ Reference** — type @ in the input box to reference canvas nodes as source material
- 👤 **Face Blur** — one-click blur all faces in a video to bypass platform real-person review (YuNet detection)
- 🔌 **Plugin System** — Photoshop panels, Chrome extensions
- 🌐 **Multi-Repo Updates** — GitHub / Gitee / ModelScope three sources
- 🇨🇳 **Chinese Optimized** — deep Qwen ecosystem integration

---

## Face Compliance & Face Swap

NOVAI's video editing is powered by Volcengine Seedance 2.0. The platform enforces strict content-safety review for **unauthorized real-person portraits** — reference media must go through one of three compliant channels:

| Channel | Use Case | Details |
|---------|----------|---------|
| **A · Authorized Real-Person Assets** | Swap to a specific real person (celebrity / model) | Ark experience center → Real-person portraits → Create asset group → Person scans QR to verify → Get Asset ID → reference via `asset://` |
| **B · Trusted Model Outputs** (Recommended) | AI face + AI video | Seedance videos / Seedream images, same account within 30 days work directly as references, zero friction |
| **C · Built-in Virtual Avatars** | No specific person needed | Platform's free virtual avatars, zero compliance risk |

**Blocking rules**: downloaded videos with faces / self-recorded real-person footage / AI faces from other platforms — all blocked. Solutions:
1. Generate the **target face** with Seedream 5.0 lite (30-day trust window)
2. **Blur faces** in the reference video with NOVAI's "Face Blur" (Smart Canvas → select video node → toolbar "Face Blur")

**Face swap prompt template**:

```text
Strictly edit video 1: replace the face of the person in video 1
with the face in image 1, facial details reference image 2 (close-up).
Keep all actions, movement, scene, camera movement, and lighting unchanged,
only modify the face. The new face should blend naturally with the original
face shape and lighting, expressions following the original actions.
No subtitles, no watermark.
```

> Change outfit / scene / person works the same: replace "face" with the corresponding object, keeping the "keep everything unchanged, only modify…" pattern. Reference setup: `video 1` = action skeleton · `image 1` = target reference · `image 2` = detail close-up (optional).

---

## Download & Updates

Installers and update sources:

| Platform | URL |
|----------|-----|
| GitHub | https://github.com/invaders-2/NOVAI |
| Gitee | https://gitee.com/invaders/novai |
| ModelScope | https://modelscope.cn/studios/bllack/NOVAI |

The app checks all three sources for the latest version on startup, pushes update notifications, and upgrades with one click.

---

## Changelog

### v1.0.108

- **Port fix**: restored official port 3000 (accidental test-build 3001 push corrected)
- **Model whitelist**: assets/models/ added to online-update whitelist, face-detection model ships with updates

### v1.0.107

- **Face Blur tool**: select video node → one-click blur all faces in toolbar (YuNet detection + Gaussian blur), bypass real-person review, result auto-added to node
- **Video playback fixes**: play / pause / fullscreen / progress bar fully fixed, desktop matches browser (native controls)
- **Reference media publicization**: cloud upload (Litterbox / temp.sh) preferred, no longer depends on local tunnel

### v1.0.86

- **Cloud build pipeline**: Windows/Mac cloud packaging pipelines, auto build & release
- **Carousel assets in repo**: fixed carousel images missing after updates
- **Frameless window fixes**: Win frameless drag / edge resize / title bar layout fixes
- **Mac signing optimization**: dmg ad-hoc signing prevents "damaged" warning, fixed signature broken by copy
- **Encoding fixes**: fixed Chinese encoding issues in Windows cloud builds

### v1.0.85

- **Smart Canvas fixes**: composer positioning, modal clipping, sidebar offset, title bar layout fixes

### v1.0.84

- **Canvas list enhancement**: cards support up to 4 images in 2×2 grid preview
- **Desktop upgrade**: frameless window + system tray (minimize to tray) + LAN access
- **Desktop icon update**: white-on-black rounded logo
- **Fixes**: 64-bit ctypes WndProc pointer truncation crash, pystray packaging, port conflicts
- **Repo cleanup**: improved .gitignore, excluded drafts/test screenshots/backups

### v1.0.83

- **Frontend performance**: Lucide icon subsetting (90% size reduction), NovaUtils/NovaMedia shared modules, Marvis-style CSS dedup, timer leak fixes, pause rAF rendering when hidden, touch-mouse layout cache optimization
- **Model picker redesign**: two-column layout, hover-linked provider switching, dynamic height
- **GPT chat fixes**: fixed TDZ error causing blank model picker
- **Icon & tooltip fixes**: multiple pages' Lucide icons, asset library status bar leaking English errors
- **Unified settings style**: API settings & workflow settings redesigned to Marvis style, fixed CSS syntax errors
- **New backend tool APIs**: 7 endpoints (storage management, image detection, category prompts, model normalization, RunningHub wallet status)
- **Race condition fixes**: sendChatMessage re-entry guard, setTimeout recursive polling, node.running premature reset
